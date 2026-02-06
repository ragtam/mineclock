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

  const weatherMap = {
    0: 'Clear', 1: 'Clear', 2: 'Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Fog', 51: 'Drizzle', 61: 'Rain',
    71: 'Snow', 80: 'Showers', 95: 'Storm'
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
    interval = setInterval(fetchAllData, 15 * 60 * 1000);
  });
  
  onDestroy(() => clearInterval(interval));
</script>

<div class="h-full flex flex-col p-2 gap-2 font-sans overflow-hidden select-none">
  
  <div class="flex-1 bg-red-500 rounded-xl border-b-4 border-red-700 shadow-sm flex flex-col items-center justify-center text-white relative p-2">
    <div class="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/20"></div>
    <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/20"></div>

    <div class="text-6xl font-black leading-none drop-shadow-md">
      {weather.temp}°
    </div>
    <div class="text-sm uppercase font-bold bg-black/20 px-3 py-1 rounded-full mt-2 truncate max-w-full">
      {weather.description}
    </div>
    <div class="mt-2 text-sm font-bold opacity-90">
       Feels {weather.feelsLike}°
    </div>
  </div>

  <div class="flex gap-2 h-24">
    <div class="flex-1 bg-blue-500 rounded-xl border-b-4 border-blue-700 p-2 flex flex-col items-center justify-center text-white">
      <span class="text-[10px] uppercase font-bold text-blue-100">UV Index</span>
      <span class="text-2xl font-black {weather.uvIndex > 5 ? 'text-yellow-300' : 'text-white'}">
        {weather.uvIndex}
      </span>
    </div>

    <div class="flex-1 bg-blue-500 rounded-xl border-b-4 border-blue-700 p-2 flex flex-col items-center justify-center text-white">
      <span class="text-[10px] uppercase font-bold text-blue-100">Wind</span>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-black">{weather.wind}</span>
        <span class="text-[10px] font-bold opacity-80">km</span>
      </div>
    </div>
  </div>

  <div class="h-20 bg-yellow-400 rounded-xl border-b-4 border-yellow-600 flex items-center justify-around px-2 text-yellow-900">
    <div class="flex flex-col items-center">
      <span class="text-xl">🌅</span>
      <span class="text-xs font-black">{weather.sunrise}</span>
    </div>
    <div class="h-8 w-1 bg-yellow-600/30 rounded-full"></div>
    <div class="flex flex-col items-center">
      <span class="text-xl">🌇</span>
      <span class="text-xs font-black">{weather.sunset}</span>
    </div>
  </div>

</div>