'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const source = fs.readFileSync(path.join(__dirname, '../scripts/experimental/electron.js'), 'utf8');

test('Electron owns an ephemeral server, isolated storage, and window lifecycle', async () => {
    const app = new EventEmitter();
    const paths = {};
    let quit = false;
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
        : name === './export_report' ? { exportReport: async () => ({ ok: true }) }
        : name === './storage' ? { createStore: () => store }
        : name === 'node:fs' ? { mkdirSync() {} }
        : name === './serve' ? { createServer() { const server = require('../scripts/experimental/serve').createServer(); servers.push(server); return server; } }
        : require(name);
    vm.runInNewContext(source, { require: requireMock, console, __dirname: path.resolve(__dirname, '../scripts/experimental') });
    try {
        await loaded;
        assert.match(paths.userData, /AIPetGame-WordLearning$/);
        assert.equal(window.options.webPreferences.nodeIntegration, false);
        assert.equal(window.options.webPreferences.sandbox, true);
        assert.match(window.options.webPreferences.preload, /preload\.js$/);
        const request = { sender: window.webContents, senderFrame: { url: window.url } };
        ipcMain.emit('word-life-load', request);
        assert.equal(request.returnValue.ok, true);
        ipcMain.emit('word-life-save', request, { version: 1 });
        assert.equal(request.returnValue.ok, true);
        const stranger = { sender: {}, senderFrame: { url: window.url } };
        ipcMain.emit('word-life-load', stranger);
        assert.equal(stranger.returnValue.ok, false);
        assert.equal((await handlers.get('word-life-export')(stranger, {})).ok, false);
        assert.equal((await handlers.get('word-life-export')(request, {})).ok, true);
        assert.equal((await fetch(window.url)).status, 200);
        window.emit('ready-to-show'); assert.equal(window.shown, true);
        app.emit('second-instance'); assert.equal(window.focused, true);
        assert.equal(window.openHandler().action, 'deny');
        app.emit('window-all-closed'); assert.equal(quit, true);
        app.emit('before-quit');
        assert.equal(servers[0].listening, false);
    } finally { for (const server of servers) { server.closeAllConnections(); server.close(); } }
});

test('singular and plural launch commands both target Electron; web stays explicit', () => {
    const pkg = require('../package.json');
    assert.equal(pkg.scripts['start:word'], pkg.scripts['start:words']);
    assert.match(pkg.scripts['start:words'], /launch\.js/);
    assert.match(pkg.scripts['start:web:words'], /serve\.js/);
});
