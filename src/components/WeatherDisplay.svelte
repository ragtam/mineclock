<script>
  import { onMount, onDestroy } from 'svelte';
  
  let sunrise = '--:--';
  let sunset = '--:--';
  let interval;
  let latitude = 52.2297; // Default: Warsaw
  let longitude = 21.0122;
  
  async function getLocation() {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('Location obtained:', latitude, longitude);
      } catch (error) {
        console.warn('Geolocation failed, using default location:', error);
        // Try to use stored values as fallback
        latitude = parseFloat(localStorage.getItem('LATITUDE') || '52.2297');
        longitude = parseFloat(localStorage.getItem('LONGITUDE') || '21.0122');
      }
    }
  }
  
  function calculateSunTimes() {
    const now = new Date();
    
    // Simple sunrise/sunset calculation using approximate formula
    const JD = (now.getTime() / 86400000) + 2440587.5;
    const n = JD - 2451545.0 + 0.0008;
    const Jstar = n - longitude / 360;
    const M = (357.5291 + 0.98560028 * Jstar) % 360;
    const C = 1.9148 * Math.sin(M * Math.PI / 180) + 0.02 * Math.sin(2 * M * Math.PI / 180) + 0.0003 * Math.sin(3 * M * Math.PI / 180);
    const lambda = (M + C + 180 + 102.9372) % 360;
    const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(M * Math.PI / 180) - 0.0069 * Math.sin(2 * lambda * Math.PI / 180);
    const delta = Math.asin(Math.sin(lambda * Math.PI / 180) * Math.sin(23.44 * Math.PI / 180));
    const omega = Math.acos((Math.sin(-0.83 * Math.PI / 180) - Math.sin(latitude * Math.PI / 180) * Math.sin(delta)) / (Math.cos(latitude * Math.PI / 180) * Math.cos(delta)));
    
    const Jrise = Jtransit - omega * 180 / Math.PI / 360;
    const Jset = Jtransit + omega * 180 / Math.PI / 360;
    
    const sunriseDate = new Date((Jrise - 2440587.5) * 86400000);
    const sunsetDate = new Date((Jset - 2440587.5) * 86400000);
    
    sunrise = sunriseDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    sunset = sunsetDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  
  onMount(async () => {
    await getLocation();
    calculateSunTimes();
    
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      calculateSunTimes();
      interval = setInterval(calculateSunTimes, 86400000); // Update daily
    }, timeUntilMidnight);
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="h-1/3 flex items-center justify-center border-l border-gray-700">
 
</div>

<div class="h-1/3 flex items-center justify-center border-l border-t border-gray-700">
  <div class="flex flex-col items-center gap-1">
    <div class="text-5xl">🌇</div>
    <span class="text-3xl font-light">{sunset}</span>
  </div>
   <div class="flex flex-col items-center gap-1">
    <div class="text-5xl">🌅</div>
    <span class="text-3xl font-light">{sunrise}</span>
  </div>
</div>
