<script>
  import { onMount, onDestroy } from 'svelte';
  import { pipeline, TextStreamer } from '@huggingface/transformers';
  
  export let isVisible = false;
  export let onClose = () => {};
  
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
      console.log('Loading Qwen2.5 model...');
      
      generator = await pipeline('text-generation', 'onnx-community/Qwen2.5-0.5B-Instruct', {
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
        content: 'Hello! I\'m Qwen2.5. How can I help you today?',
        timestamp: new Date()
      }];

      if (soundEnabled) speakChunk("Hello! I am Qwen. How can I help you today?");
      
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
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[100vh] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🤖</span>
          <div>
            <h2 class="text-xl font-bold text-white">AI Chat - Qwen2.5</h2>
            <p class="text-sm text-gray-400">
              {#if isModelLoading}
                Loading model...
              {:else if generator}
                <span class="text-green-400">● Ready (WebGPU)</span>
              {:else}
                <span class="text-yellow-400">● Not loaded</span>
              {/if}
            </p>
          </div>
        </div>
        
        <div class="flex gap-2">
           <button
            on:click={toggleSound}
            class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? '🔊' : '🔇'} 
          </button>

          {#if generator}
            <button
              on:click={clearChat}
              class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              title="Clear chat"
            >
              🗑️ Clear
            </button>
          {/if}
          <button
            on:click={handleClose}
            class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
      
      {#if isModelLoading}
        <div class="flex-1 flex flex-col items-center justify-center p-8">
          <div class="text-center">
            <div class="mb-4">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            <p class="text-white text-lg mb-2">Loading AI Model</p>
            <p class="text-gray-400 text-sm">{loadingProgress}</p>
            <p class="text-gray-500 text-xs mt-4">This may take a minute on first load...</p>
          </div>
        </div>
      {:else}
        <div
          bind:this={chatContainer}
          class="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {#if messages.length === 0}
            <div class="text-center text-gray-500 mt-8">
              <p class="text-4xl mb-4">💬</p>
              <p>No messages yet. Start a conversation!</p>
            </div>
          {/if}
          
          {#each messages as message}
            <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[70%] {message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-3">
                <div class="flex items-start gap-2">
                  <span class="text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                  <div class="flex-1">
                    <p class="text-white whitespace-pre-wrap break-words">{message.content}</p>
                    <p class="text-xs text-gray-300 mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          {/each}
          
          {#if isGenerating && streamingMessageIndex === -1}
            <div class="flex justify-start">
              <div class="max-w-[70%] bg-gray-700 rounded-lg p-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">🤖</span>
                  <div class="flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
        
        {#if error}
          <div class="px-4 py-2 bg-red-900 bg-opacity-50 border-t border-red-700">
            <p class="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        {/if}
        
        <div class="p-4 border-t border-gray-700">
          <div class="flex gap-2 relative">
            
            {#if recognitionSupported}
              <button
                on:click={toggleListening}
                disabled={isGenerating || !generator}
                class="px-3 py-3 rounded-lg transition-colors flex items-center justify-center {wantsListening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-white'}"
                title={wantsListening ? "Stop Hands-Free Mode" : "Start Hands-Free Mode"}
              >
                {#if wantsListening}
                  <span class="text-xl">⏹️</span>
                {:else}
                  <span class="text-xl">🎤</span>
                {/if}
              </button>
            {/if}

            <input
              type="text"
              bind:value={inputMessage}
              on:keypress={handleKeyPress}
              disabled={!generator || isGenerating}
              placeholder={wantsListening ? "Hands-free mode active... (Speak now)" : (generator ? "Type or speak..." : "Loading model...")}
              class="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            <button
              on:click={sendMessage}
              disabled={!inputMessage.trim() || !generator || isGenerating}
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {isGenerating ? '...' : 'Send'}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Press Enter to send. {recognitionSupported ? 'Click 🎤 for hands-free mode.' : ''}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-0.5rem); }
  }
  .animate-bounce { animation: bounce 1s infinite; }
  
  @keyframes spin { to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }

  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  }
  .animate-pulse { animation: pulse-red 2s infinite; }
</style>