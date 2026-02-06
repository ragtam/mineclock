// Singleton SpeechRecognition instance
let recognitionInstance = null;
let isListening = false;
let callback = null;

export async function registerWakeWord(wordFoundFn) {
  callback = wordFoundFn;
  
  // Get wake word from localStorage (default to "budzik" if not set)
  const wakeWord = (localStorage.getItem('WAKE_WORD') || 'budzik').toLowerCase();
  
  // Initialize SpeechRecognition if not already created
  if (!recognitionInstance) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('SpeechRecognition is not supported in this browser');
      return;
    }
    
    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'pl-PL';
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.maxAlternatives = 1;
    
    recognitionInstance.onresult = (event) => {
      const currentWakeWord = (localStorage.getItem('WAKE_WORD') || 'budzik').toLowerCase();
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        console.log('Heard:', transcript);
        
        // Check if transcript contains the wake word
        if (transcript.includes(currentWakeWord)) {
          console.log('Wake word detected:', currentWakeWord);
          if (callback) {
            callback();
          }
        }
      }
    };
    
    recognitionInstance.onend = () => {
      console.log('SpeechRecognition ended, restarting...');
      // Automatically restart if we're supposed to be listening
      if (isListening) {
        setTimeout(() => {
          try {
            recognitionInstance.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        }, 100);
      }
    };
    
    recognitionInstance.onerror = (event) => {
      console.error('SpeechRecognition error:', event.error);
      // Don't restart on no-speech errors to avoid infinite loops
      if (event.error === 'no-speech') {
        // Will restart via onend handler
      }
    };
  }
  
  // Start listening
  if (!isListening) {
    try {
      recognitionInstance.start();
      isListening = true;
      console.log('Wake word detection started. Listening for:', wakeWord);
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  }
}

export function stopWakeWord() {
  if (recognitionInstance && isListening) {
    isListening = false;
    recognitionInstance.stop();
    console.log('Wake word detection stopped');
  }
}

export function pauseWakeWord() {
  if (recognitionInstance && isListening) {
    isListening = false;
    recognitionInstance.stop();
    console.log('Wake word detection paused');
  }
}

export function resumeWakeWord() {
  if (recognitionInstance && !isListening) {
    isListening = true;
    try {
      recognitionInstance.start();
      console.log('Wake word detection resumed');
    } catch (e) {
      console.error('Error resuming recognition:', e);
    }
  }
}
