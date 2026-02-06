<script>
  import { onMount, onDestroy } from 'svelte';
  
  let weather = {
    temp: '--',
    feelsLike: '--',
    uvIndex: '-',
    wind: '--',
    description: 'Loading...',
    sunrise: '--:--',
    sunset: '--:--'
  };
  
  let interval;
  let latitude = 52.2297; 
  let longitude = 21.0122;

  // Simple mapping for Open-Meteo weather codes
  const weatherMap = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 61: 'Slight rain',
    71: 'Slight snow', 80: 'Rain showers', 95: 'Thunderstorm'
  };

  async function getLocation() {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (e) { console.warn("Using default location"); }
    }
  }

  async function fetchAllData() {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=sunrise,sunset,uv_index_max&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      weather = {
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        uvIndex: data.daily.uv_index_max[0],
        wind: Math.round(data.current.wind_speed_10m),
        description: weatherMap[data.current.weather_code] || 'Cloudy',
        sunrise: formatTime(data.daily.sunrise[0]),
        sunset: formatTime(data.daily.sunset[0])
      };
    } catch (err) { console.error("Fetch error:", err); }
  }
  
  onMount(async () => {
    await getLocation();
    await fetchAllData();
    interval = setInterval(fetchAllData, 15 * 60 * 1000); // 15 min refresh
  });
  
  onDestroy(() => clearInterval(interval));
</script>

<div class="h-full flex flex-col bg-slate-900 text-slate-100 font-sans border-l border-slate-800">
  
  <div class="flex-1 flex flex-col items-center justify-center p-6">
    <div class="text-7xl font-extralight tracking-tighter mb-1">
      {weather.temp}°
    </div>
    <div class="text-xs uppercase tracking-widest text-blue-400 font-bold">
      {weather.description}
    </div>
    <div class="mt-4 flex gap-4 text-xs text-slate-400">
      <span class="flex items-center gap-1">🌡️ Feels {weather.feelsLike}°</span>
    </div>
  </div>

  <div class="border-y border-slate-800 flex divide-x divide-slate-800 bg-slate-950/30">
    <div class="flex-1 p-4 flex flex-col items-center">
      <span class="text-[10px] uppercase text-slate-500 mb-1">UV Index</span>
      <span class="text-xl font-medium {weather.uvIndex > 5 ? 'text-orange-400' : 'text-emerald-400'}">
        {weather.uvIndex}
      </span>
    </div>
    <div class="flex-1 p-4 flex flex-col items-center">
      <span class="text-[10px] uppercase text-slate-500 mb-1">Wind</span>
      <span class="text-xl font-medium">{weather.wind} <span class="text-xs">km/h</span></span>
    </div>
  </div>

  <div class="p-6 flex justify-around items-center">
    <div class="flex flex-col items-center">
      <span class="text-2xl mb-1">🌅</span>
      <span class="text-sm font-light text-slate-300">{weather.sunrise}</span>
    </div>
    <div class="h-8 w-px bg-slate-800"></div>
    <div class="flex flex-col items-center">
      <span class="text-2xl mb-1">🌇</span>
      <span class="text-sm font-light text-slate-300">{weather.sunset}</span>
    </div>
  </div>

</div>