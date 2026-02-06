<script>
  import { onMount } from 'svelte';
  import TimeDisplay from './components/TimeDisplay.svelte';
  import WeatherDisplay from './components/WeatherDisplay.svelte';
  import BatteryDisplay from './components/BatteryDisplay.svelte'; // Ensure this is imported
  import SettingsModal from './components/SettingsModal.svelte';
  import WakeWordOverlay from './components/WakeWordOverlay.svelte';
  import VersionInfo from './components/VersionInfo.svelte';
  
  import { initWakeLock } from './modules/wakeLock.js';
  import { registerWakeWord } from './wake-word/index.js';
  
  let settingsOpen = false;
  let wakeWordVisible = false;
  
  onMount(() => {
    initWakeLock();
    registerWakeWord(() => { 
      console.log('Wake word detected!');
      showWakeWordOverlay();
    });
  });
  
  function showWakeWordOverlay() {
    wakeWordVisible = true;
  }
  
  function handleSaveSettings() {
    console.log('Settings saved');
    settingsOpen = false;
  }
  
  function handleReloadPage() {
    window.location.reload();
  }
</script>

<div class="bg-black text-white h-screen m-0 overflow-hidden relative"> <div class="absolute top-8 left-8 w-full h-full pointer-events-none"> <button 
        on:click={() => settingsOpen = true}
        class="pointer-events-auto left-8 px-6 py-6 text-white bg-black hover:bg-gray-900 transition-colors text-xl z-10 opacity-30 hover:opacity-100"
      >
        ⚙️
      </button>

      <button 
        on:click={showWakeWordOverlay}
        class="pointer-events-auto left-8 px-6 py-6 text-white bg-black hover:bg-gray-900 transition-colors text-xl z-10 opacity-30 hover:opacity-100"
      >
        🎤
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
  
  <main class="flex h-full pr-8">
    <TimeDisplay />
    
    <aside class="w-1/5 flex flex-col">
      <WeatherDisplay />
      </aside>
  </main>

  <BatteryDisplay />
</div>