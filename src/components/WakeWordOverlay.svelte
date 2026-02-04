<script>
  export let isVisible = false;
  export let onClose = () => {};
  
  let recognitionResult = '';
  let inactivityTimeout;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const INACTIVITY_DELAY = 5000; // 5 seconds of inactivity

  function resetInactivityTimer() {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      console.log('Closing due to inactivity');
      onClose();
    }, INACTIVITY_DELAY);
  }

  function cleanup() {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = null;
    }
  }

  $:
    if (isVisible) {
      recognitionResult = '';
      const helloCommand = localStorage.getItem('HELLO_COMMAND') || 'Cześć, jak mogę pomóc?'
      const utterThis = new SpeechSynthesisUtterance(helloCommand);
      utterThis.lang= 'pl';
      speechSynthesis.speak(utterThis);

      const recognition = new SpeechRecognition();
      recognition.lang = 'pl';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.start();
      resetInactivityTimer();

      recognition.onspeechstart = () => {
        console.log('SpeechRecognition.onspeechstart');
        resetInactivityTimer();
      };
      
      recognition.onresult = (event) => {
        console.log('result: ', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript: ', transcript);
        recognitionResult = transcript;
        resetInactivityTimer();
      };
      
      recognition.onend = () => {
        console.log('SpeechRecognition.onend');
        resetInactivityTimer();
      };
      
      recognition.onerror = (event) => {
        console.log('SpeechRecognition.onerror', event.error);
        resetInactivityTimer();
      };
    } else {
      cleanup();
    }
</script>

{#if isVisible}
  <div class="fixed inset-0 bg-teal-600 z-50 flex items-center justify-center">
    <!-- Windows 95 style dialog box -->
    <div class="win95-window">
      <!-- Title bar -->
      <div class="win95-titlebar">
        <span class="win95-title">Voice Recognition</span>
        <button class="win95-close-btn">✕</button>
      </div>
      
      <!-- Content area -->
      <div class="win95-content">
        {#if recognitionResult}
          <div class="win95-text-display">
            {recognitionResult}
          </div>
        {:else}
          <div class="flex justify-center">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#000080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
          </div>
          <div class="win95-status-text">Listening...</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .win95-window {
    width: 480px;
    background: #c0c0c0;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #000000;
    border-bottom: 2px solid #000000;
    box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  }
  
  .win95-titlebar {
    background: linear-gradient(to right, #000080, #1084d0);
    padding: 2px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 24px;
  }
  
  .win95-title {
    color: white;
    font-weight: bold;
    font-size: 13px;
    letter-spacing: 0.5px;
  }
  
  .win95-close-btn {
    width: 18px;
    height: 18px;
    background: #c0c0c0;
    border-top: 1px solid #ffffff;
    border-left: 1px solid #ffffff;
    border-right: 1px solid #000000;
    border-bottom: 1px solid #000000;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .win95-close-btn:active {
    border-top: 1px solid #000000;
    border-left: 1px solid #000000;
    border-right: 1px solid #ffffff;
    border-bottom: 1px solid #ffffff;
  }
  
  .win95-content {
    padding: 24px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .win95-text-display {
    background: white;
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #dfdfdf;
    border-bottom: 2px solid #dfdfdf;
    padding: 16px;
    width: 100%;
    min-height: 100px;
    font-size: 16px;
    color: #000000;
    font-family: 'Courier New', monospace;
  }
  
  .win95-status-text {
    margin-top: 16px;
    color: #000000;
    font-size: 14px;
    font-weight: bold;
  }
</style>
