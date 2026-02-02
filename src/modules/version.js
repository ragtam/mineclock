/**
 * Version module
 * Displays app version information
 */

import packageJson from '../../package.json';

export function initVersion() {
    const versionElement = document.getElementById('version');
    if (versionElement) {
        versionElement.textContent = `v${packageJson.version}`;
    }
}
