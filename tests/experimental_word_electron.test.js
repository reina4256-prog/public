'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const source = fs.readFileSync(path.join(__dirname, '../scripts/experimental/electron.js'), 'utf8');

for (const [geminiMode, textOnly] of [[false, false], [true, false], [true, true]]) test('Electron owns an ephemeral server, isolated storage, and window lifecycle: ' + geminiMode + '/' + textOnly, async () => {
    const app = new EventEmitter();
    const paths = {};
    let quit = false;
    let engineStarted = 0;
    let engineStopped = 0;
    let responderDisposed = false;
    app.isPackaged = false;
    Object.assign(app, { getPath: () => 'test-app-data', setPath: (key, value) => { paths[key] = value; },
        requestSingleInstanceLock: () => true, whenReady: () => Promise.resolve(), quit: () => { quit = true; } });
    let window;
    let resolveLoaded;
    const loaded = new Promise(resolve => { resolveLoaded = resolve; });
    class Window extends EventEmitter {
        constructor(options) {
            super(); this.options = options; this.webContents = new EventEmitter();
            this.webContents.setWindowOpenHandler = handler => { this.openHandler = handler; };
            window = this;
        }
        setMenu() {}
        async loadURL(url) { this.url = url; resolveLoaded(); }
        isDestroyed() { return false; }
        isMinimized() { return false; }
        focus() { this.focused = true; }
        show() { this.shown = true; }
    }
    const servers = [];
    const ipcMain = new EventEmitter();
    const handlers = new Map(); ipcMain.handle = (name, handler) => handlers.set(name, handler);
    const store = { load: () => ({ ok: true, value: null }), save: value => ({ ok: value.version === 1 }) };
    const requireMock = name => name === 'electron' ? { app, BrowserWindow: Window, ipcMain }
        : name === './speech_process' ? { createSpeechProcess: () => ({
            prepare: async () => ({ ok: true }),
            transcribe: async () => ({ ok: true, text: 'draft' }), cancel() {}, dispose() {}
        }) }
        : name === './voicevox_process' ? { createVoicevoxProcess: () => ({
            async start() { engineStarted++; }, stop() { engineStopped++; }
        }) }
        : name === './export_report' ? { exportReport: async () => ({ ok: true }) }
        : name === './storage' ? { createStore: () => store }
        : name === './gemini_reply' ? { createResponder: () => ({ reply: async () => ({ ok: true, text: 'fixture reply' }), cancel() {}, dispose() { responderDisposed = true; } }) }
        : name === './audio_preferences' ? { createAudioPreferences: () => ({
            load: () => ({ ok: true, value: { readAloud: false } }), save: value => ({ ok: typeof value.readAloud === 'boolean' })
        }) }
        : name === './voice_cache_store' ? { createStore: () => ({ get: async () => ({ ok: true }), put: async () => ({ ok: true }) }) }
        : name === 'node:fs' ? { mkdirSync() {} }
        : name === './serve' ? { createServer() { const server = require('../scripts/experimental/serve').createServer(); servers.push(server); return server; } }
        : require(name);
    vm.runInNewContext(source, { require: requireMock, console, process: { env: geminiMode ? { WORD_REPLY_MODE: 'gemini-cli', WORD_TEXT_ONLY: textOnly ? '1' : '0' } : {} }, __dirname: path.resolve(__dirname, '../scripts/experimental') });
    try {
        await loaded;
        assert.equal(engineStarted, textOnly ? 0 : 1);
        assert.equal(path.basename(paths.userData), geminiMode ? 'AIPetGame-WordLearning-Gemini' : 'AIPetGame-WordLearning');
        assert.equal(window.options.webPreferences.additionalArguments.includes('--word-reply=gemini-cli'), geminiMode);
        assert.equal(window.options.webPreferences.additionalArguments.includes('--word-text-only'), textOnly);
        assert.equal(window.options.webPreferences.nodeIntegration, false);
        assert.equal(window.options.webPreferences.sandbox, true);
        assert.match(window.options.webPreferences.preload, /preload\.js$/);
        const request = { sender: window.webContents, senderFrame: { url: window.url } };
        ipcMain.emit('word-life-load', request);
        assert.equal(request.returnValue.ok, true);
        ipcMain.emit('word-life-save', request, { version: 1 });
        assert.equal(request.returnValue.ok, true);
        ipcMain.emit('word-audio-preferences-load', request);
        assert.equal(request.returnValue.value.readAloud, false);
        ipcMain.emit('word-audio-preferences-save', request, { readAloud: true });
        assert.equal(request.returnValue.ok, true);
        const stranger = { sender: {}, senderFrame: { url: window.url } };
        assert.equal((await handlers.get('word-reply-generate')(stranger, {})).ok, false);
        assert.equal((await handlers.get('word-reply-generate')(request, {})).ok, geminiMode);
        ipcMain.emit('word-life-load', stranger);
        assert.equal(stranger.returnValue.ok, false);
        ipcMain.emit('word-audio-preferences-save', stranger, { readAloud: false });
        assert.equal(stranger.returnValue.ok, false);
        const subframe = { sender: window.webContents, senderFrame: { url: window.url + '?other' } };
        ipcMain.emit('word-audio-preferences-load', subframe);
        assert.equal(subframe.returnValue.ok, false);
        assert.equal((await handlers.get('word-life-export')(stranger, {})).ok, false);
        assert.equal((await handlers.get('word-life-export')(request, {})).ok, true);
        assert.equal((await handlers.get('word-voice-cache-get')(stranger, 'a'.repeat(64))).ok, false);
        assert.equal((await handlers.get('word-voice-cache-put')(stranger, 'a'.repeat(64), new Uint8Array())).ok, false);
        assert.equal((await handlers.get('word-voice-cache-get')(request, 'a'.repeat(64))).ok, true);
        assert.equal((await handlers.get('word-speech-transcribe')(stranger, {})).error, 'sender');
        assert.equal((await handlers.get('word-speech-prepare')(stranger)).error, 'sender');
        const prepared = await handlers.get('word-speech-prepare')(request);
        const transcribed = await handlers.get('word-speech-transcribe')(request, {});
        assert.equal(prepared.ok, !textOnly);
        assert.equal(transcribed.ok, !textOnly);
        if (textOnly) { assert.equal(prepared.error, 'disabled'); assert.equal(transcribed.error, 'disabled'); }
        else assert.deepEqual(transcribed, { ok: true, text: 'draft' });
        assert.equal((await fetch(window.url)).status, 200);
        window.emit('ready-to-show'); assert.equal(window.shown, true);
        app.emit('second-instance'); assert.equal(window.focused, true);
        assert.equal(window.openHandler().action, 'deny');
        app.emit('window-all-closed'); assert.equal(quit, true);
        app.emit('before-quit');
        assert.equal(responderDisposed, geminiMode);
        assert.equal(engineStopped, textOnly ? 0 : 1);
        assert.equal(servers[0].listening, false);
    } finally { for (const server of servers) { server.closeAllConnections(); server.close(); } }
});

const { createVoicevoxProcess } = require('../scripts/experimental/voicevox_process');
function engineFixture(overrides = {}) {
    const calls = { spawn: [], terminate: [], logs: [] };
    const child = Object.assign(new EventEmitter(), { pid: 12345, exitCode: null, signalCode: null,
        unref() { calls.unref = (calls.unref || 0) + 1; },
        kill() { throw new Error('An engine must never be killed on game exit'); } });
    const manager = createVoicevoxProcess({ platform: 'win32', executable: 'C:/engine with spaces/run.exe',
        probe: async () => false, exists: () => true,
        spawn: (...args) => { calls.spawn.push(args); return child; },
        terminate: value => calls.terminate.push(value), log: value => calls.logs.push(value), ...overrides });
    return { manager, calls, child };
}

test('VOICEVOX starts independently and game exit leaves the engine alive without killing any PID', async () => {
    const { manager, calls, child } = engineFixture();
    await manager.start(); await manager.start();
    assert.equal(calls.spawn.length, 1);
    const [file, args, options] = calls.spawn[0];
    assert.equal(file, 'C:/engine with spaces/run.exe');
    assert.deepEqual(args, ['--host', '127.0.0.1', '--port', '50021']);
    assert.equal(options.cwd, path.dirname(file));
    assert.equal(options.windowsHide, true); assert.equal(options.shell, false);
    assert.equal(options.detached, true); assert.equal(options.stdio, 'ignore'); assert.equal(calls.unref, 1);
    manager.stop(); manager.stop();
    assert.deepEqual(calls.terminate, []);
});

test('VOICEVOX reuse, missing engine, and unsupported OS never start or stop another process', async () => {
    for (const overrides of [{ probe: async () => true }, { exists: () => false }, { platform: 'linux' }]) {
        const { manager, calls } = engineFixture(overrides);
        await manager.start(); manager.stop();
        assert.equal(calls.spawn.length, 0); assert.equal(calls.terminate.length, 0);
    }
});

test('quit during the engine probe cancels a late start', async () => {
    let finish;
    const { manager, calls } = engineFixture({ probe: () => new Promise(resolve => { finish = resolve; }) });
    const starting = manager.start(); manager.stop(); finish(false); await starting;
    assert.equal(calls.spawn.length, 0); assert.equal(calls.terminate.length, 0);
});

test('engine errors and an early exit leave the game available and do not kill stale PIDs', async () => {
    for (const event of ['error', 'exit']) {
        const { manager, calls, child } = engineFixture();
        await manager.start(); child.emit(event, event === 'error' ? new Error('cannot launch') : 1);
        manager.stop(); assert.equal(calls.terminate.length, 0); assert.ok(calls.logs.length >= 2);
    }
    const { manager, calls } = engineFixture({ spawn() { throw new Error('launch denied'); } });
    await manager.start(); manager.stop(); assert.match(calls.logs[0], /launch denied/);
});

test('a second game instance does not start an engine', () => {
    const app = Object.assign(new EventEmitter(), { getPath: () => 'test-app-data', setPath() {},
        requestSingleInstanceLock: () => false, isPackaged: false, quit() {} });
    vm.runInNewContext(source, { __dirname: path.resolve(__dirname, '../scripts/experimental'), console, process: { env: {} },
        require: name => name === 'electron' ? { app } : name === 'node:fs' ? { mkdirSync() {} }
            : name.startsWith('./') ? {} : require(name) });
});

test('singular and plural launch commands both target Electron; web stays explicit', () => {
    const pkg = require('../package.json');
    assert.equal(pkg.scripts['start:word'], pkg.scripts['start:words']);
    assert.match(pkg.scripts['start:words'], /launch\.js/);
    assert.match(pkg.scripts['start:web:words'], /serve\.js/);
});
