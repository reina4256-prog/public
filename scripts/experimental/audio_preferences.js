'use strict';
const fs = require('node:fs');
const path = require('node:path');
const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
const species = ['robot', 'spirit', 'seed', 'ghost', 'stone', 'magician', 'beetle', 'balloon', 'bird', 'machine', 'dragon'];
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const keys = (value, allowed, valid) => object(value) && Object.keys(value).every(key => allowed.includes(key) && valid(value[key]));
const identity = value => typeof value === 'string' && value.length < 1000;
const range = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const voices = value => keys(value, species, identity);
const provider = key => /^[a-z][a-z0-9_-]{0,63}$/.test(key) && !['constructor', 'prototype', '__proto__'].includes(key);
function validProfile(value) {
    return object(value) && Object.keys(value).every(key => ['dialogue', 'tuning', 'narrator'].includes(key))
        && voices(value.dialogue) && keys(value.tuning, species, item => keys(item, ['pitch', 'rate'], () => true)
            && range(item.pitch, .5, 1.5) && range(item.rate, .6, 1.4))
        && (value.narrator === undefined || identity(value.narrator));
}
function validAudioProfile(value) {
    return object(value) && Object.keys(value).every(key => ['source', 'voices', 'effects'].includes(key))
        && typeof value.source === 'string' && provider(value.source)
        && object(value.voices) && Object.keys(value.voices).length <= 16
        && Object.keys(value.voices).every(key => provider(key) && voices(value.voices[key]))
        && keys(value.effects, species, item => range(item, 0, 1));
}
// App preference, independent of the child, save validity and temporary HTTP port.
function createAudioPreferences(directory) {
    const file = path.join(directory, 'word-audio-preferences.json');
    const valid = value => object(value) && typeof value.readAloud === 'boolean'
        && Object.keys(value).every(key => ['readAloud', 'profiles', 'audioProfiles'].includes(key))
        && (value.profiles === undefined || keys(value.profiles, locales, validProfile))
        && (value.audioProfiles === undefined || keys(value.audioProfiles, locales, validAudioProfile));
    return {
        load() {
            try {
                if (!fs.existsSync(file)) return { ok: true, value: null };
                if (fs.statSync(file).size > 256 * 1024) throw new Error('capacity');
                const value = JSON.parse(fs.readFileSync(file, 'utf8'));
                return valid(value) ? { ok: true, value } : { ok: false };
            } catch (_) { return { ok: false }; }
        },
        save(value) {
            try {
                if (!valid(value)) return { ok: false };
                const text = JSON.stringify(value);
                if (Buffer.byteLength(text) > 256 * 1024) return { ok: false };
                fs.writeFileSync(file + '.tmp', text, { encoding: 'utf8', flush: true });
                fs.renameSync(file + '.tmp', file);
                return { ok: true };
            } catch (_) { return { ok: false }; }
        }
    };
}
module.exports = { createAudioPreferences };
