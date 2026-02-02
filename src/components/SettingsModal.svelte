<script>
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  export let onClose = () => {};
  export let onSave = () => {};
  export let onReload = () => {};
  
  let pvKey = '';
  
  onMount(() => {
    // Load saved key from localStorage
    pvKey = localStorage.getItem('PV_KEY') || '';
  });
  
  function handleSave() {
    localStorage.setItem('PV_KEY', pvKey);
    onSave();
  }
  
  function handleReload() {
    onReload();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-90 z-40 flex items-center justify-center">
    <div class="settings-container">
      <div class="settings-header">
        <h2 class="text-3xl">SETTINGS</h2>
        <button on:click={onClose} class="settings-close-btn">[X]</button>
      </div>
      
      <div class="settings-content">
        <!-- PV_KEY Input -->
        <div class="settings-field">
          <label for="pv-key-input" class="settings-label">PICOVOICE KEY:</label>
          <input 
            type="text" 
            id="pv-key-input" 
            bind:value={pvKey}
            placeholder="ENTER KEY HERE"
            class="settings-input"
          />
          <p class="settings-hint">GET KEY AT: CONSOLE.PICOVOICE.AI</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="settings-buttons">
          <button on:click={handleSave} class="pixel-btn pixel-btn-primary">
            [SAVE]
          </button>
          <button on:click={handleReload} class="pixel-btn pixel-btn-secondary">
            [RELOAD]
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
