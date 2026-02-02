<script>
  import { onMount } from 'svelte';
  
  let temperature = '--°C';
  let weather = '--';
  
  onMount(async () => {
    try {
      const response = await fetch('https://wttr.in/?format=j1');
      const data = await response.json();
      
      const temp = data.current_condition[0].temp_C;
      const weatherCode = data.current_condition[0].weatherCode;
      
      temperature = `${temp}°C`;
      weather = getWeatherEmoji(weatherCode);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  });
  
  function getWeatherEmoji(code) {
    const weatherMap = {
      '113': '☀️',
      '116': '⛅',
      '119': '☁️',
      '122': '☁️',
      '143': '🌫️',
      '176': '🌦️',
      '179': '🌨️',
      '182': '🌨️',
      '185': '🌨️',
      '200': '⛈️',
      '227': '🌨️',
      '230': '❄️',
      '248': '🌫️',
      '260': '🌫️',
      '263': '🌧️',
      '266': '🌧️',
      '281': '🌧️',
      '284': '🌧️',
      '293': '🌧️',
      '296': '🌧️',
      '299': '🌧️',
      '302': '🌧️',
      '305': '🌧️',
      '308': '🌧️',
      '311': '🌧️',
      '314': '🌧️',
      '317': '🌨️',
      '320': '🌨️',
      '323': '🌨️',
      '326': '🌨️',
      '329': '❄️',
      '332': '❄️',
      '335': '❄️',
      '338': '❄️',
      '350': '🌨️',
      '353': '🌧️',
      '356': '🌧️',
      '359': '🌧️',
      '362': '🌨️',
      '365': '🌨️',
      '368': '🌨️',
      '371': '❄️',
      '374': '🌨️',
      '377': '🌨️',
      '386': '⛈️',
      '389': '⛈️',
      '392': '⛈️',
      '395': '❄️'
    };
    return weatherMap[code] || '🌡️';
  }
</script>

<div class="h-1/3 flex items-center justify-center border-l border-gray-700">
  <h3 class="text-4xl sm:text-5xl md:text-6xl font-light">{temperature}</h3>
</div>

<div class="h-1/3 flex items-center justify-center border-l border-t border-gray-700">
  <h3 class="text-6xl sm:text-7xl md:text-8xl font-light">{weather}</h3>
</div>
