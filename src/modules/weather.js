/**
 * Weather module
 * Fetches and displays weather information
 */

const weatherIcons = {
    day: {
        0: '☀️',      // Clear
        1: '🌤️',     // Mainly Clear
        2: '⛅',     // Partly Cloudy
        3: '☁️',     // Overcast
        45: '🌫️',   // Foggy
        48: '🌫️',   // Foggy
        51: '🌦️',   // Light Drizzle
        53: '🌧️',   // Drizzle
        55: '🌧️',   // Heavy Drizzle
        61: '🌧️',   // Light Rain
        63: '🌧️',   // Rain
        65: '⛈️',    // Heavy Rain
        71: '🌨️',   // Light Snow
        73: '❄️',    // Snow
        75: '❄️',    // Heavy Snow
        77: '❄️',    // Snow Grains
        80: '🌦️',   // Light Showers
        81: '🌧️',   // Showers
        82: '⛈️',    // Heavy Showers
        85: '🌨️',   // Light Snow Showers
        86: '🌨️',   // Snow Showers
        95: '⛈️',    // Thunderstorm
        96: '⛈️',    // Thunderstorm
        99: '⛈️'     // Thunderstorm
    },
    night: {
        0: '🌙',      // Clear
        1: '🌙',      // Mainly Clear
        2: '☁️',     // Partly Cloudy
        3: '☁️',     // Overcast
        45: '🌫️',   // Foggy
        48: '🌫️',   // Foggy
        51: '🌦️',   // Light Drizzle
        53: '🌧️',   // Drizzle
        55: '🌧️',   // Heavy Drizzle
        61: '🌧️',   // Light Rain
        63: '🌧️',   // Rain
        65: '⛈️',    // Heavy Rain
        71: '🌨️',   // Light Snow
        73: '❄️',    // Snow
        75: '❄️',    // Heavy Snow
        77: '❄️',    // Snow Grains
        80: '🌦️',   // Light Showers
        81: '🌧️',   // Showers
        82: '⛈️',    // Heavy Showers
        85: '🌨️',   // Light Snow Showers
        86: '🌨️',   // Snow Showers
        95: '⛈️',    // Thunderstorm
        96: '⛈️',    // Thunderstorm
        99: '⛈️'     // Thunderstorm
    }
};

async function updateWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
        );
        
        const data = await response.json();
        const temp = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        const isDay = data.current.is_day === 1;
        
        const icons = isDay ? weatherIcons.day : weatherIcons.night;
        
        const tempElement = document.getElementById('temperature');
        const weatherElement = document.getElementById('weather');
        
        if (tempElement) {
            tempElement.textContent = `${temp}°C`;
        }
        if (weatherElement) {
            weatherElement.textContent = icons[weatherCode] || '❓';
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        const tempElement = document.getElementById('temperature');
        const weatherElement = document.getElementById('weather');
        
        if (tempElement) {
            tempElement.textContent = '--°C';
        }
        if (weatherElement) {
            weatherElement.textContent = '❌';
        }
    }
}

export function initWeather() {
    // Update weather immediately and then every 10 minutes
    updateWeather();
    setInterval(updateWeather, 600000);
}
