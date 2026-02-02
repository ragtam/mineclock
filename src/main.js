/**
 * Main entry point for the MineClock application
 */

import { initTime } from './modules/time.js';
import { initWakeLock } from './modules/wakeLock.js';
import { initWeather } from './modules/weather.js';
import { initBattery } from './modules/battery.js';
import { initVersion } from './modules/version.js';
import { registerWakeWord } from './wake-word/index.js';
import './style.css';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTime();
    initWakeLock();
    initWeather();
    initBattery();
    initVersion();

    registerWakeWord(() => { console.log('Wake word detected!');})
});
