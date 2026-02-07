<script>
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  export let onClose = () => {};
  export let onSave = () => {};
  export let onReload = () => {};
  
  let pvKey = '';
  let helloCommand = '';
  let wakeWord = '';
  let microphoneEnabled = true;
  
  onMount(() => {
    // Load saved key from localStorage
    pvKey = localStorage.getItem('PV_KEY') || '';
    helloCommand = localStorage.getItem('HELLO_COMMAND') || '';
    wakeWord = localStorage.getItem('WAKE_WORD') || 'budzik';
    microphoneEnabled = localStorage.getItem('MICROPHONE_ENABLED') !== 'false';
  });
  
  function handleSave() {
    localStorage.setItem('PV_KEY', pvKey);
    localStorage.setItem('HELLO_COMMAND', helloCommand);
    localStorage.setItem('WAKE_WORD', wakeWord);
    localStorage.setItem('MICROPHONE_ENABLED', microphoneEnabled.toString());
    onSave();
  }
  
  function handleReload() {
    onReload();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black z-40 flex items-center justify-center">
    <!-- Windows 95 style dialog box -->
    <div class="win95-window">
      <!-- Title bar -->
      <div class="win95-titlebar">
        <span class="win95-title">Settings</span>
        <button on:click={onClose} class="win95-close-btn">✕</button>
      </div>
      
      <!-- Content area -->
      <div class="win95-content">
        <!-- PV_KEY Input -->
        <div class="win95-field">
          <label for="hello-command" class="win95-label">Hello Command:</label>
          <input 
            type="text" 
            id="hello-command" 
            bind:value={helloCommand}
            placeholder="Enter hello command here"
            class="win95-input"
          />
          <p class="win95-hint">Text to speak when wake word detected</p>
        </div>

        <div class="win95-field">
          <label for="wake-word" class="win95-label">Wake Word:</label>
          <input 
            type="text" 
            id="wake-word" 
            bind:value={wakeWord}
            placeholder="budzik"
            class="win95-input"
          />
          <p class="win95-hint">Word to activate voice assistant (Polish)</p>
        </div>

        <!-- Microphone Toggle -->
        <div class="win95-field">
          <label class="win95-checkbox-label">
            <input 
              type="checkbox" 
              bind:checked={microphoneEnabled}
              class="win95-checkbox"
            />
            Enable Microphone / Wake Word Detection
          </label>
          <p class="win95-hint">Uncheck to disable voice activation</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="win95-buttons">
          <button on:click={handleSave} class="win95-btn">
            OK
          </button>
          <button on:click={handleReload} class="win95-btn">
            Reload
          </button>
          <button on:click={onClose} class="win95-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .win95-window {
    width: 520px;
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
    padding: 16px;
  }
  
  .win95-field {
    margin-bottom: 20px;
  }
  
  .win95-label {
    display: block;
    margin-bottom: 6px;
    color: #000000;
    font-size: 12px;
    font-weight: bold;
  }
  
  .win95-input {
    width: 100%;
    padding: 4px 6px;
    background: white;
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #dfdfdf;
    border-bottom: 2px solid #dfdfdf;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
    font-size: 12px;
    color: #000000;
    box-sizing: border-box;
  }
  
  .win95-input:focus {
    outline: 1px dotted #000000;
    outline-offset: -4px;
  }
  
  .win95-hint {
    margin-top: 4px;
    font-size: 11px;
    color: #000080;
  }

  .win95-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #000000;
    cursor: pointer;
  }

  .win95-checkbox {
    width: 13px;
    height: 13px;
    cursor: pointer;
  }
  
  .win95-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #808080;
  }
  
  .win95-btn {
    min-width: 80px;
    padding: 6px 16px;
    background: #c0c0c0;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #000000;
    border-bottom: 2px solid #000000;
    box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #000000;
    cursor: pointer;
  }
  
  .win95-btn:active {
    border-top: 2px solid #000000;
    border-left: 2px solid #000000;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    box-shadow: inset -1px -1px 0 #dfdfdf, inset 1px 1px 0 #808080;
    padding: 7px 15px 5px 17px;
  }
  
  .win95-btn:focus {
    outline: 1px dotted #000000;
    outline-offset: -4px;
  }
</style>
