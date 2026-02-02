/**
 * Battery module
 * Displays battery status with time estimation
 */

const batteryHistory = [];
const MAX_HISTORY = 10; // Keep last 10 samples

async function updateBattery() {
    if (!('getBattery' in navigator)) {
        console.log('Battery API not supported');
        const percentElement = document.getElementById('battery-percent');
        if (percentElement) {
            percentElement.textContent = 'N/A';
        }
        return;
    }
    
    try {
        const battery = await navigator.getBattery();
        
        function updateBatteryUI() {
            const level = Math.round(battery.level * 100);
            const fill = document.getElementById('battery-fill');
            const percent = document.getElementById('battery-percent');
            const timeDisplay = document.getElementById('battery-time');
            
            if (!fill || !percent || !timeDisplay) return;
            
            percent.textContent = `${level}%`;
            fill.style.width = `${level}%`;
            
            // Change color based on battery level
            if (level <= 20) {
                fill.style.backgroundColor = '#ff0000';
            } else if (level <= 50) {
                fill.style.backgroundColor = '#ffaa00';
            } else {
                fill.style.backgroundColor = '#ffffff';
            }
            
            // Add charging indicator
            if (battery.charging) {
                percent.textContent = `${level}% ⚡`;
                timeDisplay.textContent = '';
            } else {
                // Track battery level over time for estimation
                const now = Date.now();
                batteryHistory.push({ level, time: now });
                
                // Keep only recent history
                if (batteryHistory.length > MAX_HISTORY) {
                    batteryHistory.shift();
                }
                
                // Calculate time remaining if we have enough data
                if (batteryHistory.length >= 2) {
                    const oldest = batteryHistory[0];
                    const newest = batteryHistory[batteryHistory.length - 1];
                    const timeDiff = (newest.time - oldest.time) / 1000 / 60 / 60; // hours
                    const levelDiff = oldest.level - newest.level; // percentage dropped
                    
                    if (levelDiff > 0 && timeDiff > 0) {
                        const drainRate = levelDiff / timeDiff; // % per hour
                        const hoursRemaining = level / drainRate;
                        
                        if (hoursRemaining < 100) {
                            const hours = Math.floor(hoursRemaining);
                            const minutes = Math.round((hoursRemaining - hours) * 60);
                            timeDisplay.textContent = `${hours}h ${minutes}m`;
                        } else {
                            timeDisplay.textContent = '∞';
                        }
                    } else {
                        timeDisplay.textContent = '--h --m';
                    }
                } else {
                    timeDisplay.textContent = 'Calculating...';
                }
            }
        }
        
        updateBatteryUI();
        
        // Listen for battery changes
        battery.addEventListener('levelchange', updateBatteryUI);
        battery.addEventListener('chargingchange', updateBatteryUI);
    } catch (error) {
        console.error('Battery API error:', error);
        const percentElement = document.getElementById('battery-percent');
        if (percentElement) {
            percentElement.textContent = 'N/A';
        }
    }
}

export function initBattery() {
    updateBattery();
}
