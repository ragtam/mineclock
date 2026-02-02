/**
 * Time display module
 * Handles updating the time display
 */

export function initTime() {
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }
    
    updateTime();
    setInterval(updateTime, 30 * 1000);
}
