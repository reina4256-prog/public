'use strict';
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { createServer } = require('./serve');
const { createStore } = require('./storage');
const { exportReport } = require('./export_report');

// Independent app storage and instance lock, without loading Steam or the legacy game.
const geminiMode = !app.isPackaged && process.env.WORD_REPLY_MODE === 'gemini-cli';
const textOnly = geminiMode && process.env.WORD_TEXT_ONLY === '1';
const userData = path.join(app.getPath('appData'), geminiMode ? 'AIPetGame-WordLearning-Gemini' : 'AIPetGame-WordLearning');
let storageReady = true;
try {
    fs.mkdirSync(userData, { recursive: true });
    app.setPath('userData', userData);
} catch (error) {
    storageReady = false; console.error(error.message); app.exit(1);
}
let server;
let window;
let voicevox;
let speech;
let responder;
if (storageReady && !app.requestSingleInstanceLock()) {
    app.quit();
} else if (storageReady) {
    app.on('second-instance', () => {
        if (window && !window.isDestroyed()) {
            if (window.isMinimized()) window.restore();
            window.focus();
        }
    });
    app.whenReady().then(async () => {
        // The engine is independent and stays available for the next session.
        // Start alongside the window; an absent or slow engine never blocks play.
        if (app.isPackaged === false && !textOnly) {
            voicevox = require('./voicevox_process').createVoicevoxProcess();
            void voicevox.start();
        }
        server = createServer({ autoRecord: !app.isPackaged });
        // The window owns this server. No fixed port and no separately orphaned process.
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        window = new BrowserWindow({ width: 1280, height: 800, minWidth: 720, minHeight: 560,
            useContentSize: true, autoHideMenuBar: true, show: false,
            webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true,
                preload: path.join(__dirname, 'preload.js'),
                backgroundThrottling: true, partition: 'persist:word-learning',
                additionalArguments: geminiMode ? ['--word-reply=gemini-cli', ...(textOnly ? ['--word-text-only'] : [])] : [] } });
        window.setMenu(null);
        const url = `http://127.0.0.1:${server.address().port}/`;
        const store = createStore(userData);
        const audioPreferences = require('./audio_preferences').createAudioPreferences(userData);
        speech = require('./speech_process').createSpeechProcess(app.isPackaged
            ? { directory: path.join(process.resourcesPath, 'word-speech') } : {});
        const isWindow = event => event.sender === window.webContents && event.senderFrame?.url === url;
        if (geminiMode) responder = require('./gemini_reply').createResponder(userData);
        ipcMain.handle('word-reply-generate', (event, packet) => isWindow(event) && responder ? responder.reply(packet) : { ok: false, error: 'disabled' });
        ipcMain.on('word-reply-cancel', (event, id) => { if (isWindow(event)) responder?.cancel(id); });
        const voiceCache = require('./voice_cache_store').createStore(path.join(userData, 'voice-cache-v1'));
        ipcMain.handle('word-voice-cache-get', (event, key) => isWindow(event) ? voiceCache.get(key) : { ok: false });
        ipcMain.handle('word-voice-cache-put', (event, key, data) => isWindow(event) ? voiceCache.put(key, data) : { ok: false });
        ipcMain.handle('word-speech-prepare', event => isWindow(event)
            ? textOnly ? { ok: false, error: 'disabled' } : speech.prepare() : { ok: false, error: 'sender' });
        ipcMain.handle('word-speech-transcribe', (event, packet) => isWindow(event)
            ? textOnly ? { ok: false, error: 'disabled' } : speech.transcribe(packet) : { ok: false, error: 'sender' });
        ipcMain.handle('word-speech-cancel', (event, id) => {
            if (isWindow(event) && typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)) speech.cancel(id);
            return { ok: true };
        });
        ipcMain.on('word-personal-log-append', (event, value) => {
            if (event.sender !== window.webContents || event.senderFrame?.url !== url) {
                event.returnValue = { ok: false }; return;
            }
            event.returnValue = server.personalRecording.append(value);
        });
        ipcMain.handle('word-life-export', (event, payload) => {
            if (event.sender !== window.webContents || event.senderFrame?.url !== url) return { ok: false };
            return exportReport(dialog, window, payload);
        });
        for (const operation of ['load', 'save']) ipcMain.on(`word-life-${operation}`, (event, value) => {
            if (event.sender !== window.webContents || event.senderFrame?.url !== url) {
                event.returnValue = { ok: false, reason: 'sender' }; return;
            }
            event.returnValue = store[operation](value);
        });
        for (const operation of ['load', 'save']) ipcMain.on(`word-audio-preferences-${operation}`, (event, value) => {
            if (event.sender !== window.webContents || event.senderFrame?.url !== url) {
                event.returnValue = { ok: false }; return;
            }
            event.returnValue = audioPreferences[operation](value);
        });
        window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        window.webContents.on('will-navigate', (event, destination) => {
            if (new URL(destination).origin !== new URL(url).origin) event.preventDefault();
        });
        window.once('ready-to-show', () => window.show());
        window.webContents.on('before-input-event', (event, input) => {
            if (input.type === 'keyDown' && input.key === 'F11') {
                window.setFullScreen(!window.isFullScreen()); event.preventDefault();
            }
        });
        await window.loadURL(url);
    }).catch(error => { console.error(error); app.quit(); });
    app.on('window-all-closed', () => app.quit());
    app.on('before-quit', () => {
        responder?.dispose();
        if (voicevox) voicevox.stop();
        if (speech) speech.dispose();
        if (server) { server.closeAllConnections(); server.close(); server = null; }
    });
}
