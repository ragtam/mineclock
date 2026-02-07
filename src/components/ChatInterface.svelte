<script>
  import { onMount } from 'svelte';
  import { pipeline, TextStreamer } from '@huggingface/transformers';
  
  export let isVisible = false;
  export let onClose = () => {};
  
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
  
  onMount(() => {
    if (isVisible && !generator && !isModelLoading) {
      loadModel();
    }
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
      
      // Add welcome message
      messages = [{
        role: 'assistant',
        content: 'Hello! I\'m Qwen2.5. How can I help you today?',
        timestamp: new Date()
      }];
      
      console.log('Qwen2.5 model loaded successfully!');
    } catch (err) {
      error = `Failed to load model: ${err.message}`;
      isModelLoading = false;
      console.error(err);
    }
  }
  
  async function sendMessage() {
    if (!inputMessage.trim() || isGenerating || !generator) {
      return;
    }
    
    const userMsg = inputMessage.trim();
    inputMessage = '';
    
    // Add user message to UI
    messages = [...messages, {
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    }];
    
    setTimeout(scrollToBottom, 0);
    
    isGenerating = true;
    error = null;
    streamingText = '';
    
    // Add placeholder for assistant message
    streamingMessageIndex = messages.length;
    messages = [...messages, {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }];
    
    try {
      // Build conversation context
      const chatMessages = [
        { role: "system", content: "You are a helpful and concise assistant." },
        ...messages.slice(-10).filter(m => m.content).map(m => ({ role: m.role, content: m.content }))
      ];
      
      console.time('AI Generation');
      
      // Create streamer with callback to update UI in real-time
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text) => {
          streamingText += text;
          // Update the message content
          messages[streamingMessageIndex] = {
            ...messages[streamingMessageIndex],
            content: streamingText
          };
          messages = [...messages]; // Trigger reactivity
          setTimeout(scrollToBottom, 0);
        }
      });
      
      // Generate with streaming
      await generator(chatMessages, {
        max_new_tokens: 150,
        do_sample: true,
        temperature: 0.7,
        streamer: streamer,
      });
      
      console.timeEnd('AI Generation');
      
      streamingText = '';
      streamingMessageIndex = -1;
    } catch (err) {
      error = `Error: ${err.message}`;
      console.error(err);
      // Remove the failed message
      messages = messages.slice(0, -1);
    } finally {
      isGenerating = false;
    }
  }
  
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
  
  function clearChat() {
    messages = [{
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date()
    }];
    streamingText = '';
    streamingMessageIndex = -1;
  }
  
  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
  
  function handleClose() {
    onClose();
  }
</script>

{#if isVisible}
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[100vh] flex flex-col">
      <!-- Header -->
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
      
      <!-- Loading Progress -->
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
        <!-- Chat Messages -->
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
        
        <!-- Error Display -->
        {#if error}
          <div class="px-4 py-2 bg-red-900 bg-opacity-50 border-t border-red-700">
            <p class="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        {/if}
        
        <!-- Input Area -->
        <div class="p-4 border-t border-gray-700">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={inputMessage}
              on:keypress={handleKeyPress}
              disabled={!generator || isGenerating}
              placeholder={generator ? "Type your message..." : "Loading model..."}
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
          <p class="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.5rem);
    }
  }
  
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
