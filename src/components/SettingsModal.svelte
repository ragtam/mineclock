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
  export const AI_MODELS = [
    "HuggingFaceTB/SmolLM2-135M-Instruct",
    "HuggingFaceTB/SmolLM2-360M-Instruct",
    "onnx-community/Qwen2.5-0.5B-Instruct",
  ];
  let selectedModel = AI_MODELS[0];
  
  onMount(() => {
    // Load saved key from localStorage
    pvKey = localStorage.getItem('PV_KEY') || '';
    helloCommand = localStorage.getItem('HELLO_COMMAND') || '';
    wakeWord = localStorage.getItem('WAKE_WORD') || 'budzik';
    microphoneEnabled = localStorage.getItem('MICROPHONE_ENABLED') !== 'false';
    selectedModel = localStorage.getItem('MODEL') || AI_MODELS[0];
  });
  
  function handleSave() {
    localStorage.setItem('PV_KEY', pvKey);
    localStorage.setItem('HELLO_COMMAND', helloCommand);
    localStorage.setItem('WAKE_WORD', wakeWord);
    localStorage.setItem('MICROPHONE_ENABLED', microphoneEnabled.toString());
    localStorage.setItem('MODEL', selectedModel);
    onSave();
  }
  
  function handleReload() {
    onReload();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black z-40 flex items-center justify-center p-4">
    <!-- Lego style dialog box -->
    <div class="lego-window">
      <!-- Title bar -->
      <div class="lego-titlebar">
        <span class="lego-title">Settings</span>
        <button on:click={onClose} class="lego-close-btn">✕</button>
      </div>
      
      <!-- Content area -->
      <div class="lego-content">
        <!-- PV_KEY Input -->
        <div class="lego-field">
          <label for="hello-command" class="lego-label">Hello Command:</label>
          <input 
            type="text" 
            id="hello-command" 
            bind:value={helloCommand}
            placeholder="Enter hello command here"
            class="lego-input"
          />
          <p class="lego-hint">Text to speak when wake word detected</p>
        </div>

        <div class="lego-field">
          <label for="wake-word" class="lego-label">Wake Word:</label>
          <input 
            type="text" 
            id="wake-word" 
            bind:value={wakeWord}
            placeholder="budzik"
            class="lego-input"
          />
          <p class="lego-hint">Word to activate voice assistant (Polish)</p>
        </div>

        <div class="lego-field">
          <label for="model-select" class="lego-label">Model:</label>
          <select id="model-select" bind:value={selectedModel} class="lego-input">
            {#each AI_MODELS as m}
              <option value={m}>{m}</option>
            {/each}
          </select>
          <p class="lego-hint">Selected model: {selectedModel}</p>
        </div>

        <!-- Microphone Toggle -->
        <div class="lego-field">
          <label class="lego-checkbox-label">
            <input 
              type="checkbox" 
              bind:checked={microphoneEnabled}
              class="lego-checkbox"
            />
            Enable Microphone / Wake Word Detection
          </label>
          <p class="lego-hint">Uncheck to disable voice activation</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="lego-buttons">
          <button on:click={handleSave} class="lego-btn lego-btn-green">
            OK
          </button>
          <button on:click={handleReload} class="lego-btn lego-btn-yellow">
            Reload
          </button>
          <button on:click={onClose} class="lego-btn lego-btn-red">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .lego-window {
    width: 90%;
    max-width: 520px;
    max-height: 90vh;
    background: #FFDB58;
    border: 6px solid #333;
    border-radius: 8px;
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.3),
      inset 0 2px 0 rgba(255, 255, 255, 0.3),
      inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    font-family: 'Arial', 'Helvetica', sans-serif;
    display: flex;
    flex-direction: column;
  }
  
  .lego-titlebar {
    background: linear-gradient(180deg, #FF4D4D 0%, #E60000 100%);
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #333;
    border-radius: 2px 2px 0 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }
  
  .lego-title {
    color: white;
    font-weight: bold;
    font-size: 18px;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  }
  
  .lego-close-btn {
    width: 32px;
    height: 32px;
    background: linear-gradient(180deg, #FF4D4D 0%, #E60000 100%);
    border: 3px solid #333;
    border-radius: 4px;
    font-size: 20px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .lego-close-btn:hover {
    background: linear-gradient(180deg, #FF6666 0%, #FF0000 100%);
    transform: translateY(-1px);
  }
  
  .lego-close-btn:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .lego-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  
  .lego-field {
    margin-bottom: 20px;
  }
  
  .lego-label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .lego-input {
    width: 100%;
    padding: 10px 12px;
    background: white;
    border: 4px solid #333;
    border-radius: 4px;
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 14px;
    color: #333;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  
  .lego-input:focus {
    outline: none;
    border-color: #0066CC;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.3);
  }
  
  .lego-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .lego-checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    font-weight: 500;
  }

  .lego-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #00A550;
  }
  
  .lego-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 3px solid #333;
    flex-wrap: wrap;
  }
  
  .lego-btn {
    min-width: 90px;
    padding: 12px 20px;
    border: 4px solid #333;
    border-radius: 6px;
    font-family: 'Arial', 'Helvetica', sans-serif;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 
      0 4px 0 rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .lego-btn-green {
    background: linear-gradient(180deg, #00CC66 0%, #00A550 100%);
  }
  
  .lego-btn-green:hover {
    background: linear-gradient(180deg, #00E673 0%, #00B85C 100%);
  }
  
  .lego-btn-yellow {
    background: linear-gradient(180deg, #FFD700 0%, #FFC700 100%);
    color: #333;
  }
  
  .lego-btn-yellow:hover {
    background: linear-gradient(180deg, #FFE433 0%, #FFD700 100%);
  }
  
  .lego-btn-red {
    background: linear-gradient(180deg, #FF4D4D 0%, #E60000 100%);
  }
  
  .lego-btn-red:hover {
    background: linear-gradient(180deg, #FF6666 0%, #FF0000 100%);
  }
  
  .lego-btn:active {
    transform: translateY(2px);
    box-shadow: 
      0 2px 0 rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .lego-btn:focus {
    outline: none;
    box-shadow: 
      0 4px 0 rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 0 0 3px rgba(0, 102, 204, 0.5);
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .lego-window {
      width: 95%;
      max-height: 85vh;
    }
    
    .lego-content {
      padding: 16px;
    }
    
    .lego-buttons {
      flex-direction: column;
      gap: 10px;
    }
    
    .lego-btn {
      width: 100%;
    }
  }
</style>
