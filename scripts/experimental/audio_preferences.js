'use strict';
const fs = require('node:fs');
const path = require('node:path');
// App preference, independent of the child, save validity and temporary HTTP port.
function createAudioPreferences(directory) {
    const file = path.join(directory, 'word-audio-preferences.json');
    const valid = value => value && typeof value.readAloud === 'boolean'
        && Object.keys(value).every(key => key === 'readAloud');
    return {
        load() {
            try {
                if (!fs.existsSync(file)) return { ok: true, value: null };
                if (fs.statSync(file).size > 1024) throw new Error('capacity');
                const value = JSON.parse(fs.readFileSync(file, 'utf8'));
                return valid(value) ? { ok: true, value } : { ok: false };
            } catch (_) { return { ok: false }; }
        },
        save(value) {
            try {
                if (!valid(value)) return { ok: false };
                fs.writeFileSync(file + '.tmp', JSON.stringify(value), { encoding: 'utf8', flush: true });
                fs.renameSync(file + '.tmp', file);
                return { ok: true };
            } catch (_) { return { ok: false }; }
        }
    };
}
module.exports = { createAudioPreferences };
