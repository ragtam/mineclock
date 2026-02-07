<script>
  import { onMount, onDestroy } from 'svelte';
  import { pipeline, TextStreamer } from '@huggingface/transformers';
    
  export let isVisible = false;
  export let onClose = () => {};
  
  const modelName = localStorage.getItem('MODEL') || "HuggingFaceTB/SmolLM2-135M-Instruct";

  // --- Core Chat State ---
  let messages = [];
  let inputMessage = '';
  let isModelLoading = false;
  let isGenerating = false;
  let loadingProgress = '';
  let error = null;
  let generator = null;
  let chatContainer;
  let streamingText = '';
  let streamingMessageIndex = -1;

  // --- TTS (Talk Back) State ---
  let soundEnabled = true;
  let sentenceBuffer = "";

  // --- STT (Speech Recognition) State ---
  let isListening = false; // Hardware state
  let wantsListening = false; // User intent (Conversation mode)
  let recognition = null;
  let recognitionSupported = false;
  let silenceTimer = null; 
  const SILENCE_TIMEOUT = 2000; 
  
  onMount(() => {
    if (isVisible && !generator && !isModelLoading) {
      loadModel();
    }
    
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionSupported = true;
        recognition = new SpeechRecognition();
        recognition.continuous = true; 
        recognition.interimResults = true; 
        recognition.lang = 'en-US';

        recognition.onstart = () => { isListening = true; };
        
        recognition.onend = () => { 
            isListening = false; 
            clearTimeout(silenceTimer); 
        };
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          inputMessage = transcript; 

          clearTimeout(silenceTimer);
          
          // Auto-Send on silence
          silenceTimer = setTimeout(() => {
             console.log("Silence detected. Sending...");
             if (isListening) recognition.stop();
             sendMessage();
          }, SILENCE_TIMEOUT);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          isListening = false;
          clearTimeout(silenceTimer);
          if (event.error === 'not-allowed') {
            error = "Microphone access denied.";
            wantsListening = false; // Cancel mode on error
          }
        };
      }
    }
  });

  onDestroy(() => {
    stopSpeaking();
    if (recognition) recognition.abort();
    clearTimeout(silenceTimer);
  });
  
  $: if (isVisible && !generator && !isModelLoading) {
    loadModel();
  }
  
  async function loadModel() {
    isModelLoading = true;
    error = null;
    loadingProgress = 'Initializing WebGPU...';
    
    try {
      console.log(`Loading ${modelName} model...`);
      
      generator = await pipeline('text-generation', modelName, {
        device: 'webgpu',
        dtype: 'q4',
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            loadingProgress = `Loading ${progress.file}: ${Math.round(progress.progress)}%`;
          } else if (progress.status === 'done') {
            loadingProgress = `Loaded ${progress.file}`;
          } else if (progress.status === 'ready') {
            loadingProgress = 'Model ready!';
          }
        }
      });
      
      isModelLoading = false;
      loadingProgress = '';
      
      messages = [{
        role: 'assistant',
        content: `Hello! I'm ${modelName}. How can I help you today?`,
        timestamp: new Date()
      }];

      if (soundEnabled) speakChunk(`Hello! I am ${modelName}. How can I help you today?`);
      
    } catch (err) {
      error = `Failed to load model: ${err.message}`;
      isModelLoading = false;
    }
  }

  function stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function speakChunk(text) {
    if (!soundEnabled || !text.trim()) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    window.speechSynthesis.speak(utterance);
  }

  function toggleListening() {
    if (!recognition) return;
    
    // Toggle the "Hands Free" intent
    wantsListening = !wantsListening;
    
    if (wantsListening) {
      error = null;
      inputMessage = ''; 
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition already started");
      }
    } else {
      recognition.stop();
      clearTimeout(silenceTimer);
    }
  }
  
  // Helper to restart mic only after the AI finishes talking
  function restartListeningWhenSafe() {
    if (!wantsListening) return;

    // Check if TTS is still speaking
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      setTimeout(restartListeningWhenSafe, 200); // Check again in 200ms
      return;
    }

    // Safe to start mic
    if (!isListening) {
      try {
        inputMessage = '';
        recognition.start();
      } catch (e) {
        // Ignore errors if already started
      }
    }
  }
  
  async function sendMessage() {
    clearTimeout(silenceTimer); 
    if (!inputMessage.trim() || isGenerating || !generator) return;
    
    stopSpeaking();
    if (isListening) recognition.stop(); 
    
    sentenceBuffer = ""; 

    const userMsg = inputMessage.trim();
    inputMessage = '';
    
    messages = [...messages, {
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    }];
    
    setTimeout(scrollToBottom, 0);
    
    isGenerating = true;
    error = null;
    streamingText = '';
    
    streamingMessageIndex = messages.length;
    messages = [...messages, {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }];
    
    try {
      const chatMessages = [
        { role: "system", content: "You are a helpful and concise assistant." },
        ...messages.slice(-10).filter(m => m.content).map(m => ({ role: m.role, content: m.content }))
      ];
      
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text) => {
          streamingText += text;
          messages[streamingMessageIndex] = {
            ...messages[streamingMessageIndex],
            content: streamingText
          };
          messages = [...messages]; 
          setTimeout(scrollToBottom, 0);

          if (soundEnabled) {
             sentenceBuffer += text;
             // 2. Updated Regex to include commas, colons, semi-colons
             if (/[.!?\n,;:]/.test(sentenceBuffer)) {
                const lastPunctuation = Math.max(
                  sentenceBuffer.lastIndexOf('.'), 
                  sentenceBuffer.lastIndexOf('!'), 
                  sentenceBuffer.lastIndexOf('?'),
                  sentenceBuffer.lastIndexOf('\n'),
                  sentenceBuffer.lastIndexOf(','),
                  sentenceBuffer.lastIndexOf(';'),
                  sentenceBuffer.lastIndexOf(':')
                );

                if (lastPunctuation !== -1) {
                    const toSpeak = sentenceBuffer.slice(0, lastPunctuation + 1);
                    sentenceBuffer = sentenceBuffer.slice(lastPunctuation + 1);
                    speakChunk(toSpeak);
                }
             }
          }
        }
      });
      
      await generator(chatMessages, {
        max_new_tokens: 150,
        do_sample: true,
        temperature: 0.7,
        streamer: streamer,
      });
      
      if (soundEnabled && sentenceBuffer.trim()) {
        speakChunk(sentenceBuffer);
      }
      
      streamingText = '';
      streamingMessageIndex = -1;
    } catch (err) {
      error = `Error: ${err.message}`;
      messages = messages.slice(0, -1);
    } finally {
      isGenerating = false;
      // 1. Restart listening if user enabled hands-free mode
      if (wantsListening) {
         restartListeningWhenSafe();
      }
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
  
  function clearChat() {
    stopSpeaking();
    clearTimeout(silenceTimer);
    messages = [{
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date()
    }];
    streamingText = '';
    streamingMessageIndex = -1;
  }
  
  function scrollToBottom() {
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function handleClose() {
    stopSpeaking();
    wantsListening = false;
    if (recognition) recognition.abort();
    clearTimeout(silenceTimer);
    onClose();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) stopSpeaking();
  }
</script>

{#if isVisible}
  <div class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
    
    <div class="lego-container w-full max-w-4xl h-[100vh] sm:h-[90vh] flex flex-col relative overflow-hidden shadow-2xl">
      
      <div class="lego-header flex items-center justify-between p-3 z-10">
        <div class="flex items-center gap-3">
          <div class="brick-icon bg-yellow-400">
            <span class="text-2xl drop-shadow-md">🤖</span>
          </div>
          <div>
            <h2 class="text-xl font-black text-white tracking-wider drop-shadow-md uppercase">Brick Bot</h2>
            <div class="brick-status px-2 py-0.5 rounded text-xs font-bold text-white bg-black/40 inline-block">
              {#if isModelLoading}
                LOADING...
              {:else if generator}
                <span class="text-green-300">● ONLINE</span>
              {:else}
                <span class="text-yellow-300">● OFFLINE</span>
              {/if}
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
           <button
            on:click={toggleSound}
            class="lego-btn small {soundEnabled ? 'bg-green-500' : 'bg-red-500'}"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? '🔊' : '🔇'} 
          </button>

          {#if generator}
            <button
              on:click={clearChat}
              class="lego-btn small bg-blue-500"
              title="Clear chat"
            >
              🗑️
            </button>
          {/if}
          <button
            on:click={handleClose}
            class="lego-btn small bg-red-600"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div class="lego-baseplate flex-1 flex flex-col relative overflow-hidden">
        
        {#if isModelLoading}
          <div class="flex-1 flex flex-col items-center justify-center p-8 z-10">
            <div class="lego-loader mb-6">
              <div class="brick red"></div>
              <div class="brick blue"></div>
              <div class="brick yellow"></div>
            </div>
            <p class="text-white text-xl font-bold uppercase tracking-widest drop-shadow-md">Building AI...</p>
            <p class="text-white font-mono text-sm bg-black/30 px-2 py-1 mt-2 rounded">{loadingProgress}</p>
          </div>
        {:else}
          <div
            bind:this={chatContainer}
            class="flex-1 overflow-y-auto p-4 space-y-6 z-10"
          >
            {#if messages.length === 0}
              <div class="text-center mt-12 opacity-80">
                <div class="inline-block p-6 bg-yellow-400 rounded-lg shadow-brick border-4 border-yellow-600">
                    <p class="text-5xl mb-2">🧱</p>
                    <p class="font-bold text-yellow-900">Start building a chat!</p>
                </div>
              </div>
            {/if}
            
            {#each messages as message}
              <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[85%] relative group">
                    <div class="absolute -top-3 left-0 w-full h-4 flex gap-1 px-2 {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                       <div class="w-4 h-2 rounded-t-sm opacity-50 {message.role === 'user' ? 'bg-blue-700' : 'bg-yellow-600'}"></div>
                       <div class="w-4 h-2 rounded-t-sm opacity-50 {message.role === 'user' ? 'bg-blue-700' : 'bg-yellow-600'}"></div>
                    </div>

                    <div class="p-4 rounded-md shadow-brick border-b-4 border-r-4 
                        {message.role === 'user' 
                            ? 'bg-blue-500 border-blue-700 text-white' 
                            : 'bg-yellow-400 border-yellow-600 text-yellow-900'}">
                        
                        <div class="flex items-start gap-3">
                            <span class="text-2xl filter drop-shadow-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold font-sans whitespace-pre-wrap break-words leading-relaxed">
                                    {message.content}
                                </p>
                                <p class="text-[10px] uppercase font-bold mt-2 opacity-60">
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            {/each}
            
            {#if isGenerating && streamingMessageIndex === -1}
              <div class="flex justify-start">
                 <div class="p-3 bg-yellow-400 border-b-4 border-r-4 border-yellow-600 rounded-md shadow-brick">
                    <div class="flex gap-2">
                      <div class="w-3 h-3 bg-yellow-800 rounded-full animate-bounce"></div>
                      <div class="w-3 h-3 bg-yellow-800 rounded-full animate-bounce delay-75"></div>
                      <div class="w-3 h-3 bg-yellow-800 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              </div>
            {/if}
          </div>
          
          {#if error}
            <div class="mx-4 mb-2 p-3 bg-red-600 border-4 border-red-800 rounded shadow-lg text-white font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          {/if}
          
          <div class="lego-footer p-3 border-t-4 border-black/20 bg-gray-100 relative z-20">
            <div class="flex gap-2 relative items-stretch">
              
              {#if recognitionSupported}
                <button
                  on:click={toggleListening}
                  disabled={isGenerating || !generator}
                  class="lego-btn square flex items-center justify-center 
                  {wantsListening ? 'bg-red-600 animate-pulse-brick' : 'bg-gray-400'}"
                  title={wantsListening ? "Stop Hands-Free Mode" : "Start Hands-Free Mode"}
                >
                    <span class="text-2xl drop-shadow-sm text-white">
                        {wantsListening ? '⏹️' : '🎤'}
                    </span>
                </button>
              {/if}
  
              <input
                type="text"
                bind:value={inputMessage}
                on:keypress={handleKeyPress}
                disabled={!generator || isGenerating}
                placeholder={wantsListening ? "Listening..." : (generator ? "Assemble your thoughts..." : "Gathering bricks...")}
                class="lego-input flex-1"
              />
              
              <button
                on:click={sendMessage}
                disabled={!inputMessage.trim() || !generator || isGenerating}
                class="lego-btn px-6 bg-green-600 text-white font-black uppercase tracking-wider"
              >
                {isGenerating ? '...' : 'SEND'}
              </button>
            </div>
            
            <p class="text-[10px] text-gray-500 font-bold uppercase mt-2 text-center tracking-widest">
                System Ready {recognitionSupported ? '• Mic Available' : ''}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* --- Colors --- */
  :global(:root) {
    --lego-red: #D01012;
    --lego-blue: #0055BF;
    --lego-yellow: #F6AC19;
    --lego-green: #237841;
    --lego-white: #FFFFFF;
    --lego-dark: #111111;
    --lego-grey: #9BA19D;
  }

  /* --- Lego Container & Frame --- */
  .lego-container {
    background-color: var(--lego-red);
    border: 8px solid var(--lego-red);
    border-radius: 12px;
    box-shadow: 
        inset 2px 2px 0 rgba(255,255,255,0.3),
        inset -2px -2px 0 rgba(0,0,0,0.3),
        0 20px 50px rgba(0,0,0,0.5);
  }

  /* --- Header --- */
  .lego-header {
    background-color: var(--lego-blue);
    border-bottom: 4px solid #003da0; /* Darker blue */
    /* Stud pattern on header */
    background-image: radial-gradient(rgba(0,0,0,0.2) 15%, transparent 16%),
                      radial-gradient(rgba(255,255,255,0.1) 15%, transparent 16%);
    background-size: 16px 16px;
    background-position: 0 0, 2px 2px;
  }

  .brick-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border-bottom: 4px solid #cc8e14; /* Darker yellow */
    border-right: 4px solid #cc8e14;
    box-shadow: inset 2px 2px 0 rgba(255,255,255,0.4);
  }

  /* --- Baseplate (Chat Area) --- */
  .lego-baseplate {
    background-color: #2a2a2a; /* Dark baseplate */
    /* The Stud Pattern */
    background-image: 
        radial-gradient(#1a1a1a 40%, transparent 42%);
    background-size: 24px 24px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
  }

  /* --- Buttons --- */
  .lego-btn {
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.1s, border-width 0.1s;
    /* 3D Brick Look */
    border-bottom: 4px solid rgba(0,0,0,0.3);
    border-right: 4px solid rgba(0,0,0,0.3);
    border-top: 1px solid rgba(255,255,255,0.3);
    border-left: 1px solid rgba(255,255,255,0.3);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .lego-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }

  .lego-btn:active:not(:disabled) {
    transform: translateY(2px);
    border-bottom-width: 0px;
    border-right-width: 0px;
  }
  
  .lego-btn:disabled {
    background-color: var(--lego-grey);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .lego-btn.small {
    padding: 6px 10px;
    font-size: 14px;
  }

  .lego-btn.square {
    width: 50px;
  }

  /* --- Input --- */
  .lego-input {
    background: white;
    border: 4px solid #ccc;
    border-radius: 4px;
    padding: 10px 14px;
    font-family: sans-serif;
    font-weight: 600;
    color: #333;
    outline: none;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    transition: border-color 0.2s;
  }
  
  .lego-input:focus {
    border-color: var(--lego-blue);
  }

  /* --- Utilities --- */
  .shadow-brick {
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }

  /* --- Animations --- */
  .lego-loader {
    display: flex;
    gap: 8px;
  }
  .lego-loader .brick {
    width: 20px;
    height: 30px;
    border-radius: 2px;
    animation: brick-jump 0.6s infinite alternate;
  }
  .lego-loader .brick.red { background: var(--lego-red); animation-delay: 0s; }
  .lego-loader .brick.blue { background: var(--lego-blue); animation-delay: 0.2s; }
  .lego-loader .brick.yellow { background: var(--lego-yellow); animation-delay: 0.4s; }

  @keyframes brick-jump {
    from { transform: translateY(0); }
    to { transform: translateY(-15px); }
  }

  @keyframes pulse-brick {
    0%, 100% { background-color: var(--lego-red); transform: scale(1); }
    50% { background-color: #ff4d4d; transform: scale(1.05); }
  }
  .animate-pulse-brick { animation: pulse-brick 1.5s infinite; }

  /* Scrollbar Styling */
  .overflow-y-auto::-webkit-scrollbar {
    width: 12px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: var(--lego-grey);
    border: 2px solid rgba(0,0,0,0.2);
    border-radius: 6px;
  }
</style>