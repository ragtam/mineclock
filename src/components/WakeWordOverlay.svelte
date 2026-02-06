<script>
  import { pauseWakeWord, resumeWakeWord } from '../wake-word/index.js';
  
  export let isVisible = false;
  export let onClose = () => {};
  
  let recognitionResult = '';
  let inactivityTimeout;
  let recognition = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const INACTIVITY_DELAY = 5000; 

  function resetInactivityTimer() {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      onClose();
    }, INACTIVITY_DELAY);
  }

  function cleanup() {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = null;
    }
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
      recognition = null;
    }
  }

  $: if (isVisible) {
      pauseWakeWord();
      recognitionResult = '';
      const helloCommand = localStorage.getItem('HELLO_COMMAND') || 'Cześć?'
      const utterThis = new SpeechSynthesisUtterance(helloCommand);
      utterThis.lang= 'pl';
      speechSynthesis.speak(utterThis);

      recognition = new SpeechRecognition();
      recognition.lang = 'pl';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.start();
      resetInactivityTimer();

      recognition.onresult = (event) => {
        recognitionResult = event.results[0][0].transcript;
        resetInactivityTimer();
      };
      
      // Handle end/error to keep timer alive or close
      recognition.onend = resetInactivityTimer;
      recognition.onerror = resetInactivityTimer;
      
    } else {
      cleanup();
      resumeWakeWord();
    }
</script>

{#if isVisible}
  <div class="fixed inset-0 z-50 bg-green-500 flex flex-col p-4 gap-4 animate-pop-in">
    
    <div class="flex justify-between items-center shrink-0 h-16">
      <div class="text-green-900 font-black text-xl uppercase tracking-wider bg-green-600/30 px-4 py-2 rounded-xl">
        {#if !recognitionResult} Słucham... {:else} Mówienie... {/if}
      </div>
      
      <button 
        on:click={onClose}
        class="w-16 h-16 bg-red-500 rounded-2xl border-b-8 border-red-700 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center shadow-lg"
      >
        <span class="text-white font-black text-2xl">✕</span>
      </button>
    </div>

    <div class="flex-1 w-full relative">
      
      {#if recognitionResult}
        <div class="absolute inset-0 bg-white rounded-3xl border-b-8 border-slate-300 p-6 flex items-center justify-center shadow-inner overflow-hidden">
          <p class="text-center font-black text-slate-800 break-words leading-tight" 
             style="font-size: clamp(2rem, 8vw, 4rem);">
            "{recognitionResult}"
          </p>
        </div>
      {:else}
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50"></div>
            <div class="absolute inset-[-20px] bg-green-400 rounded-full animate-ping opacity-30 animation-delay-300"></div>
            
            <div class="relative w-40 h-40 bg-green-600 rounded-full border-8 border-green-700 flex items-center justify-center shadow-2xl">
              <svg class="w-20 h-20 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
  </div>
{/if}

<style>
  @keyframes popIn {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pop-in {
    animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .animation-delay-300 {
    animation-delay: 300ms;
  }
</style>