<script>
  import { onMount, onDestroy } from 'svelte';
  
  let level = 100;
  let charging = false;
  let timeRemaining = '--h --m';
  let interval;
  
  async function updateBattery() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        level = Math.round(battery.level * 100);
        charging = battery.charging;
        
        if (charging && battery.chargingTime !== Infinity) {
          const hours = Math.floor(battery.chargingTime / 3600);
          const minutes = Math.floor((battery.chargingTime % 3600) / 60);
          timeRemaining = `${hours}h ${minutes}m`;
        } else if (!charging && battery.dischargingTime !== Infinity) {
          const hours = Math.floor(battery.dischargingTime / 3600);
          const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
          timeRemaining = `${hours}h ${minutes}m`;
        } else {
          timeRemaining = '--h --m';
        }
      } catch (error) {
        console.error('Battery API error:', error);
      }
    }
  }
  
  onMount(() => {
    updateBattery();
    interval = setInterval(updateBattery, 60000); // Update every minute
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
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
    </div>
    <span class="text-2xl font-light">{level}%</span>
    <span class="text-lg font-light text-gray-400">{timeRemaining}</span>
  </div>
</div>
