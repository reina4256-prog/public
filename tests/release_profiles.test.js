const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { getProfile, getUserDataPath } = require('../release_profiles');
const buildConfig = require('../scripts/release/build_config');

assert.throws(() => getProfile('demo-online'));
assert.deepStrictEqual(getProfile('demo'), { edition: 'demo', online: false });
const oldPath = 'C:\\Users\\test\\AppData\\Roaming\\public';
assert.strictEqual(getUserDataPath(oldPath, getProfile('full'), path.win32), oldPath);
assert.strictEqual(getUserDataPath(oldPath, getProfile('full-offline'), path.win32), oldPath);
assert.notStrictEqual(getUserDataPath(oldPath, getProfile('demo'), path.win32), oldPath);
for (const name of ['full', 'full-offline', 'demo']) {
    assert.strictEqual(buildConfig(name).extraMetadata.gameReleaseProfile, name);
    assert.strictEqual(buildConfig(name).directories.output, `dist/${name}`);
}
assert.notStrictEqual(buildConfig('demo').appId, buildConfig('full').appId);

// Packaged metadata wins over development command-line flags.
for (const name of ['full', 'full-offline', 'demo']) {
    const paths = {}, handlers = {};
    const app = {
        isPackaged: true,
        getPath: () => oldPath,
        setPath: (key, value) => { paths[key] = value; },
        whenReady: () => ({ then() {} }), on() {}
    };
    const ipcMain = { on: (key, fn) => { handlers[key] = fn; }, handle() {} };
    vm.runInNewContext(fs.readFileSync('electron_main.js', 'utf8'), {
        require: nameArg => {
            if (nameArg === 'electron') return { app, ipcMain };
            if (nameArg === './package.json') return { gameReleaseProfile: name };
            if (nameArg === './release_profiles') return require('../release_profiles');
            if (nameArg === 'steamworks.js') return { init: () => null, electronEnableSteamOverlay() {} };
            if (nameArg === 'path') return path.win32;
            return require(nameArg);
        },
        process: { argv: ['electron', '--release-profile=full'], platform: 'win32' },
        console: { log() {}, error() {} }, __dirname: process.cwd()
    });
    const event = {};
    handlers['get-release-profile'](event);
    assert.deepStrictEqual(event.returnValue, getProfile(name));
    assert.strictEqual(paths.userData, getUserDataPath(oldPath, getProfile(name), path.win32));
}

function startup(online) {
    const data = new Map([['my_player_id', 'stale-account'], ['my_player_name', 'stale-name'], ['bgm_volume', '0.5']]);
    const starts = [];
    const window = { GameRelease: { edition: online ? 'full' : 'demo', online }, aiPet: {}, startActualGame: value => starts.push(value) };
    const localStorage = {
        getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key), key: index => [...data.keys()][index],
        get length() { return data.size; }
    };
    vm.runInNewContext(fs.readFileSync('game_startup.js', 'utf8'), {
        window, localStorage, document: { getElementById: () => null }, console,
        setInterval: () => 1, clearInterval() {}
    });
    return { window, data, starts };
}

(async () => {
    const offline = startup(false);
    assert.strictEqual(offline.window.isOnlineAccountLoggedIn(), false);
    assert.strictEqual(offline.window.checkOnlineFeatureAccess(), false);
    offline.window.showContinueLoginChoice();
    assert.deepStrictEqual(offline.starts, [false]);
    await offline.window.showNewGameLoginChoice();
    assert.deepStrictEqual(offline.starts, [false, true]);
    assert.strictEqual(offline.data.get('bgm_volume'), '0.5');
    assert(!offline.data.has('my_player_id'));
    const protectedRun = startup(false);
    protectedRun.data.set('debug_test_session_v1', '{"active":true}');
    assert.strictEqual(await protectedRun.window.showNewGameLoginChoice(), false);
    assert.strictEqual(protectedRun.data.get('my_player_id'), 'stale-account');
    assert.strictEqual(protectedRun.starts.length, 0);
    const full = startup(true);
    let signOuts = 0;
    full.window.silentSignOutForNewGame = async () => { signOuts++; };
    await full.window.executeNewGameInitialization(true);
    assert.strictEqual(signOuts, 1);
    assert.deepStrictEqual(full.starts, [true]);
    console.log('Release profile and shared startup tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
