<script>
  export let isVisible = false;
  let recognitionResult = '';
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  $:
    if (isVisible) {
      const helloCommand = localStorage.getItem('HELLO_COMMAND') || 'Cześć, jak mogę pomóc?'
      const utterThis = new SpeechSynthesisUtterance(helloCommand);
      utterThis.lang= 'pl';
      speechSynthesis.speak(utterThis);

      const recognition = new SpeechRecognition();
      recognition.lang = 'pl';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onspeechstart = () => {
        console.log('SpeechRecognition.onspeechstart');
      } 
      recognition.onresult = (event) => {
        console.log('result: ', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript: ', transcript);
        recognitionResult = transcript;
    }
  }
</script>

{#if isVisible}
  <div class="fixed inset-0 bg-white z-50">
    <div class="wake-word-frame"></div>
    <div class="flex items-center justify-center h-full">
      {#if recognitionResult}
        <div class="text-4xl text-black font-bold">
          {recognitionResult}
        </div>
      {:else}
        <div class="wake-word-mic">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="8" y1="22" x2="16" y2="22"/>
          </svg>
        </div>
      {/if}
    </div>
  </div>
{/if}
