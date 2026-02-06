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
      timeRemaining = null;
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
  /* Lego Gloss Effect 
     This gradient creates a "shine" on the top half of the bar,
     making it look like a smooth plastic brick.
  */
  .plastic-gloss {
    background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(0, 0, 0, 0.05) 51%,
      rgba(0, 0, 0, 0.1) 100%
    );
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.5), /* Top Highlight */
      inset 0 -1px 0 rgba(0,0,0,0.2);      /* Bottom Shadow */
  }

  /* Official Lego Color Palette Hexes */
  .lego-green  { background-color: #009A44; } 
  .lego-red    { background-color: #DA291C; } 
  .lego-yellow { background-color: #FFCF00; } 

  /* Charging Animation: A bright sheen passing through */
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .shimmer-effect::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: shimmer 1.5s infinite;
  }
</style>

<div class="fixed bottom-0 left-0 w-full h-4 bg-white z-50 select-none flex items-center px-3 border-t-2 border-gray-100">
  
  <div class="relative w-full h-3 bg-gray-200 rounded-md overflow-hidden shadow-inner border border-gray-300">
    
    <div 
      class="h-full transition-all duration-700 ease-out plastic-gloss relative
      {charging ? 'lego-yellow shimmer-effect' : (level <= 20 ? 'lego-red' : 'lego-green')}" 
      style="width: {level}%"
    >
    </div>

    <div class="absolute inset-0 flex justify-between items-center px-2 font-sans font-bold text-slate-800 text-[11px] leading-none">
      
      <div class="flex items-center gap-1 z-10">
        {#if charging}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-black">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
          </svg>
        {/if}
        <span class="{!charging && level <= 20 ? 'text-white drop-shadow-md' : 'text-black/70'}">
          {level}%
        </span>
      </div>

      {#if timeRemaining}
        <div class="opacity-60 text-[9px] bg-white/40 px-1.5 py-0.5 rounded-sm">
          {timeRemaining}
        </div>
      {/if}
    </div>

  </div>
</div>