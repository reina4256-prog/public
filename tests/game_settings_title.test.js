const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const storage = new Map();
const listeners = {};
const document = {
    fullscreenElement: null,
    addEventListener: (name, handler) => { listeners[`document:${name}`] = handler; },
    getElementById: () => null
};
const window = {
    aiPet: { bgmVolume: 0.35 },
    audioManager: { currentAudio: { volume: 0.35 } },
    addEventListener: (name, handler) => { listeners[`window:${name}`] = handler; }
};
window.window = window;

vm.runInNewContext(fs.readFileSync('game_settings_core.js', 'utf8'), {
    window,
    document,
    localStorage: {
        getItem: key => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value)
    },
    console,
    setTimeout
});

assert.strictEqual(window.GameSettings.getBgmVolume(), 0.35);
window.GameSettings.setBgmVolume(0.8);
assert.strictEqual(window.aiPet.bgmVolume, 0.8);
assert.strictEqual(window.audioManager.currentAudio.volume, 0.8);
assert.strictEqual(JSON.parse(storage.get('ai_pet_game_settings_v1')).bgmVolume, 0.8);

const main = fs.readFileSync('main.js', 'utf8');
const renderer = fs.readFileSync('view_renderer.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
assert.match(renderer, /fillText\('ゲーム設定', TEXT_X, MENU3_Y\)/);
assert.match(main, /titleMenuHover === 5/);
assert.match(main, /window\.openGameSettings\(\)/);
assert.match(index, /localization_core\.js[\s\S]*system\.js[\s\S]*game_settings_core\.js/);

console.log('game settings title tests passed');
