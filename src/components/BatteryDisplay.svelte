<script>
  import { onMount, onDestroy } from 'svelte';
  
  let level = 100;
  let charging = false;
  let timeRemaining = '--h --m';
  let interval;
  let battery = null;
  
  function updateBatteryDisplay(batteryObj) {
    level = Math.round(batteryObj.level * 100);
    charging = batteryObj.charging;
    
    if (charging && batteryObj.chargingTime !== Infinity) {
      const hours = Math.floor(batteryObj.chargingTime / 3600);
      const minutes = Math.floor((batteryObj.chargingTime % 3600) / 60);
      timeRemaining = `${hours}h ${minutes}m`;
    } else if (!charging && batteryObj.dischargingTime !== Infinity) {
      const hours = Math.floor(batteryObj.dischargingTime / 3600);
      const minutes = Math.floor((batteryObj.dischargingTime % 3600) / 60);
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = '--h --m';
    }
  }
  
  async function initBattery() {
    if ('getBattery' in navigator) {
      try {
        battery = await navigator.getBattery();
        updateBatteryDisplay(battery);
        
        // Listen for battery events
        battery.addEventListener('chargingchange', () => updateBatteryDisplay(battery));
        battery.addEventListener('levelchange', () => updateBatteryDisplay(battery));
        battery.addEventListener('chargingtimechange', () => updateBatteryDisplay(battery));
        battery.addEventListener('dischargingtimechange', () => updateBatteryDisplay(battery));
      } catch (error) {
        console.error('Battery API error:', error);
      }
    }
  }
  
  onMount(() => {
    initBattery();
    interval = setInterval(() => {
      if (battery) updateBatteryDisplay(battery);
    }, 60000); // Fallback update every minute
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
    if (battery) {
      battery.removeEventListener('chargingchange', () => updateBatteryDisplay(battery));
      battery.removeEventListener('levelchange', () => updateBatteryDisplay(battery));
      battery.removeEventListener('chargingtimechange', () => updateBatteryDisplay(battery));
      battery.removeEventListener('dischargingtimechange', () => updateBatteryDisplay(battery));
    }
  });
</script>

<div class="h-1/3 flex items-center justify-center border-l border-t border-gray-700">
  <div class="flex flex-col items-center gap-1">
    <div id="battery-icon" class="relative">
      <!-- Battery body -->
      <div class="w-16 h-8 border-4 border-white relative">
        <!-- Battery fill -->
        <div class="h-full bg-white transition-all duration-300" style="width: {level}%"></div>
      </div>
      <!-- Battery tip -->
      <div class="absolute -right-1 top-2 w-1 h-4 bg-white"></div>
      
      <!-- Charging indicator -->
      {#if charging}
        <div class="absolute inset-0 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="charging-bolt">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" stroke="black" stroke-width="1.5"/>
          </svg>
        </div>
      {/if}
    </div>
    <span class="text-2xl font-light">{level}%</span>
    <span class="text-lg font-light text-gray-400">{timeRemaining}</span>
  </div>
</div>

<style>
  .charging-bolt {
    color: #fbbf24;
    filter: drop-shadow(0 0 2px rgba(251, 191, 36, 0.5));
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
</style>
