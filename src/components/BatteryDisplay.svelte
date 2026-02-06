<script>
  import { onMount, onDestroy } from 'svelte';
  
  let level = 100;
  let charging = false;
  let timeRemaining = '--h --m';
  let battery = null;
  
  function updateBatteryDisplay() {
    if (!battery) return;
    level = Math.round(battery.level * 100);
    charging = battery.charging;
    
    const time = charging ? battery.chargingTime : battery.dischargingTime;
    
    if (time !== Infinity && time !== null) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = '--h --m';
    }
  }
  
  const handleEvent = () => updateBatteryDisplay();

  async function initBattery() {
    if ('getBattery' in navigator) {
      try {
        battery = await navigator.getBattery();
        updateBatteryDisplay();
        
        battery.addEventListener('chargingchange', handleEvent);
        battery.addEventListener('levelchange', handleEvent);
        battery.addEventListener('chargingtimechange', handleEvent);
        battery.addEventListener('dischargingtimechange', handleEvent);
      } catch (error) {
        console.error('Battery API error:', error);
      }
    }
  }
  
  onMount(() => {
    initBattery();
  });
  
  onDestroy(() => {
    if (battery) {
      battery.removeEventListener('chargingchange', handleEvent);
      battery.removeEventListener('levelchange', handleEvent);
      battery.removeEventListener('chargingtimechange', handleEvent);
      battery.removeEventListener('dischargingtimechange', handleEvent);
    }
  });
</script>

<style>
  /* Minimalistic sliding animation for charging state */
  @keyframes flow {
    0% { background-position: 0 0; }
    100% { background-position: 20px 0; }
  }
  
  .animate-flow {
    /* Creates a subtle angled stripe pattern */
    background-image: linear-gradient(
      45deg, 
      rgba(255, 255, 255, 0.15) 25%, 
      transparent 25%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.15) 50%, 
      rgba(255, 255, 255, 0.15) 75%, 
      transparent 75%, 
      transparent
    );
    background-size: 20px 20px;
    animation: flow 1s linear infinite;
  }
</style>

<div class="fixed bottom-0 left-0 w-full h-5 bg-gray-900 border-t border-gray-800 z-50 select-none">
  
  <div 
    class="h-full transition-all duration-700 ease-out relative
    {level <= 20 && !charging ? 'bg-red-600' : 'bg-slate-500'}
    {charging ? 'bg-emerald-600 animate-flow' : ''}" 
    style="width: {level}%"
  ></div>

  <div class="absolute inset-0 flex justify-between items-center px-2 text-[10px] font-mono font-medium text-white drop-shadow-md">
    
    <div class="flex items-center gap-1">
      {#if charging}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-yellow-300">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          <path fill-rule="evenodd" d="M3.75 3a.75.75 0 00-1.061.75c0 5.056 2.383 9.555 6.061 12.355a.75.75 0 10.9-1.2C6.42 12.376 4.25 8.356 4.25 3.75A.75.75 0 003.75 3z" clip-rule="evenodd" /> 
          <path d="M11.929 1.556a.75.75 0 01.536.932 14.043 14.043 0 00-2.28 7.398l-3.233-1.616a15.542 15.542 0 012.045-6.178.75.75 0 01.932-.536z" /> 
           <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
        </svg>
      {/if}
      <span>{level}%</span>
    </div>

    <div class="opacity-80">
      {timeRemaining}
    </div>
  </div>
</div>