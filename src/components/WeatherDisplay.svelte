<script>
  import { onMount, onDestroy } from 'svelte';
  
  let temperature = '--';
  let sunrise = '--:--';
  let sunset = '--:--';
  let interval;
  
  // Default: Warsaw
  let latitude = 52.2297; 
  let longitude = 21.0122;

  async function getLocation() {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.warn('Geolocation failed, using default:', error);
      }
    }
  }

  async function fetchWeatherData() {
    try {
      // Fetches current temp + daily sunrise/sunset + automatic timezone detection
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=sunrise,sunset&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      // Set Temperature
      temperature = Math.round(data.current.temperature_2m);

      // Parse Sun Times (API returns ISO strings like "2023-10-27T07:15")
      const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      };

      sunrise = formatTime(data.daily.sunrise[0]);
      sunset = formatTime(data.daily.sunset[0]);

    } catch (error) {
      console.error('Weather fetch failed:', error);
    }
  }
  
  onMount(async () => {
    await getLocation();
    await fetchWeatherData();
    
    // Refresh data every 30 minutes
    interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="h-1/3 flex flex-col items-center justify-center border-l border-gray-700 bg-gray-900/20">
  <div class="text-6xl  tracking-tighter">
    {temperature} °C
  </div>
</div>

<div class="h-1/3 flex items-center justify-around border-l border-t border-gray-700 p-4">
  <div class="flex flex-col items-center gap-2">
    <div class="text-3xl filter drop-shadow-sm">🌅</div>
    <div class="flex flex-col items-center">
      <span class="text-2xl font-light tracking-tight">{sunrise}</span>
    </div>
  </div>

  <div class="w-px h-12 bg-gray-800"></div> <div class="flex flex-col items-center gap-2">
    <div class="text-3xl filter drop-shadow-sm">🌇</div>
    <div class="flex flex-col items-center">
      <span class="text-2xl font-light tracking-tight">{sunset}</span>
    </div>
  </div>
</div>