# MineClock

A minimalist clock app with weather and battery information.

## Project Structure

```
mineclock/
├── src/
│   ├── index.html          # Main HTML file
│   ├── main.js             # Entry point - initializes all modules
│   ├── style.css           # Global styles
│   ├── manifest.json       # PWA manifest
│   └── modules/
│       ├── time.js         # Time display module
│       ├── wakeLock.js     # Screen wake lock module
│       ├── weather.js      # Weather API integration
│       └── battery.js      # Battery status with time estimation
├── dist/                   # Build output (generated)
├── package.json
└── vite.config.js
```

## Modules

### Time Module (`src/modules/time.js`)
- Updates the clock display every 30 seconds
- Formats time in HH:MM format

### Wake Lock Module (`src/modules/wakeLock.js`)
- Keeps the screen awake using the Wake Lock API
- Re-requests lock when page becomes visible

### Weather Module (`src/modules/weather.js`)
- Fetches weather data from Open-Meteo API
- Uses geolocation to get current position
- Shows temperature and weather icon
- Updates every 10 minutes

### Battery Module (`src/modules/battery.js`)
- Displays battery level with visual indicator
- Estimates time remaining based on drain rate
- Shows charging status
- Color-coded based on battery level

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- 🕐 Large time display
- 🌤️ Weather information with emoji icons
- 🔋 Battery status with time estimation
- 📱 PWA support
- 🔒 Screen wake lock to prevent sleep
- 📱 Responsive design with Tailwind CSS
