<script>
  import { onMount } from 'svelte';
  import TimeDisplay from './components/TimeDisplay.svelte';
  import WeatherDisplay from './components/WeatherDisplay.svelte';
  import BatteryDisplay from './components/BatteryDisplay.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import WakeWordOverlay from './components/WakeWordOverlay.svelte';
  import ChatInterface from './components/ChatInterface.svelte';

  import { initWakeLock } from './modules/wakeLock.js';
  import { registerWakeWord } from './wake-word/index.js';
  
  let settingsOpen = false;
  let wakeWordVisible = false;
  let chatVisible = false;
  let microphoneEnabled = true;
  
  onMount(() => {
    initWakeLock();
    
    // Check if microphone is enabled
    microphoneEnabled = localStorage.getItem('MICROPHONE_ENABLED') === 'true';
    
    if (microphoneEnabled) {
      registerWakeWord(() => { 
        console.log('Wake word detected!');
        showWakeWordOverlay();
      });
    }
  });
  
  function showWakeWordOverlay() {
    wakeWordVisible = true;
  }
  
  function handleSaveSettings() {
    console.log('Settings saved');
    settingsOpen = false;
    // Reload page to apply microphone settings
    setTimeout(() => window.location.reload(), 100);
  }
  
  function handleReloadPage() {
    window.location.reload();
  }
</script>

<div class="bg-black text-white h-screen m-0 overflow-hidden relative">
  <div class="absolute top-4 left-4 w-full h-full pointer-events-none">
    <button 
      on:click={() => settingsOpen = true}
      class="pointer-events-auto left-8 px-4 py-4 text-white bg-black hover:bg-gray-900 transition-colors text-xl z-10 opacity-30 hover:opacity-100"
    >
      ⚙️
    </button>

    <button 
      on:click={showWakeWordOverlay}
      class="pointer-events-auto left-8 px-4 py-4 text-white bg-black hover:bg-gray-900 transition-colors text-xl z-10 opacity-30 hover:opacity-100"
    >
      🎤
    </button>

    <button 
      on:click={() => chatVisible = true}
      class="pointer-events-auto left-8 px-4 py-4 text-white bg-black hover:bg-gray-900 transition-colors text-xl z-10 opacity-30 hover:opacity-100"
    >
      🤖
    </button>
  </div>
  
  <SettingsModal 
    isOpen={settingsOpen}
    onClose={() => settingsOpen = false}
    onSave={handleSaveSettings}
    onReload={handleReloadPage}
  />
  
  <WakeWordOverlay 
    isVisible={wakeWordVisible} 
    onClose={() => wakeWordVisible = false}
  />
  
  <ChatInterface 
    isVisible={chatVisible}
    onClose={() => chatVisible = false}
  />
  
  <main class="flex h-full pr-8 pb-10">
    <TimeDisplay />
    
    <aside class="w-1/5 flex flex-col pb-5">
      <div class="flex-1 bg-white">
        <WeatherDisplay />
      </div>
    </aside>
  </main>

  <BatteryDisplay />
</div>