'use strict';
const { getProfile } = require('../../release_profiles');
const base = require('../../package.json').build;

module.exports = function buildConfig(name) {
    const profile = getProfile(name);
    return {
        ...base,
        ...(profile.edition === 'demo' ? { appId: `${base.appId}.demo`, productName: `${base.productName} Demo` } : {}),
        directories: { output: `dist/${name}` },
        extraMetadata: { gameReleaseProfile: name },
        files: ['**/*', '!dist{,/**/*}', '!tests{,/**/*}', '!docs{,/**/*}', '!.localization-audit{,/**/*}', '!.git{,/**/*}']
    };
};
