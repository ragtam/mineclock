/**
 * Settings module for managing application configuration
 */

export function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const reloadPageBtn = document.getElementById('reload-page');
    const pvKeyInput = document.getElementById('pv-key-input');

    // Load existing PV_KEY from localStorage
    const existingKey = localStorage.getItem('PV_KEY');
    if (existingKey) {
        pvKeyInput.value = existingKey;
    }

    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    // Close settings modal
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Save settings
    saveSettingsBtn.addEventListener('click', () => {
        const pvKey = pvKeyInput.value.trim();
        
        if (pvKey) {
            localStorage.setItem('PV_KEY', pvKey);
            showNotification('Settings saved successfully!');
        } else {
            showNotification('Please enter a valid API key', 'error');
        }
    });

    // Reload page
    reloadPageBtn.addEventListener('click', () => {
        location.reload();
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'pixel-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 20px 30px;
        z-index: 60;
        font-size: 20px;
        letter-spacing: 2px;
        border: 4px solid ${type === 'error' ? '#f00' : '#0f0'};
        background: #000;
        color: ${type === 'error' ? '#f00' : '#0f0'};
        box-shadow: 0 0 20px ${type === 'error' ? '#f00' : '#0f0'};
    `;
    notification.textContent = message.toUpperCase();
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
