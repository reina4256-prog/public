(function () {
    'use strict';
    let profile = { edition: 'full', online: true };
    if (typeof require === 'function') {
        // Main-process configuration is authoritative; saves and URL parameters cannot change it.
        profile = require('electron').ipcRenderer.sendSync('get-release-profile');
    }
    if (!profile || !['demo', 'full'].includes(profile.edition) || typeof profile.online !== 'boolean') {
        throw new Error('Invalid release profile');
    }
    Object.defineProperty(window, 'GameRelease', {
        value: Object.freeze({ edition: profile.edition, online: profile.edition === 'demo' ? false : profile.online }),
        writable: false, configurable: false
    });
    document.documentElement.dataset.online = String(window.GameRelease.online);
    document.documentElement.dataset.edition = window.GameRelease.edition;
})();
