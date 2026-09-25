'use strict';

// Shared by the main process, development server and packaging configuration.
const profiles = Object.freeze({
    full: Object.freeze({ edition: 'full', online: true }),
    'full-offline': Object.freeze({ edition: 'full', online: false }),
    demo: Object.freeze({ edition: 'demo', online: false })
});

function getProfile(name = 'full') {
    if (!Object.prototype.hasOwnProperty.call(profiles, name)) {
        throw new Error(`Unknown release profile: ${name}`);
    }
    return profiles[name];
}

function getUserDataPath(defaultPath, profile, path) {
    // Keep the existing full-edition location, including when online is disabled.
    return profile.edition === 'demo' ? path.join(path.dirname(defaultPath), 'AIPetGame-Demo') : defaultPath;
}

module.exports = { profiles, getProfile, getUserDataPath };
