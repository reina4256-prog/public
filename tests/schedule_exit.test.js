const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const ipcMain = new EventEmitter(); ipcMain.handle = () => {};
const app = new EventEmitter(); let quit = 0, win;
Object.assign(app, { isPackaged: true, whenReady: () => ({ then: callback => callback() }), quit: () => quit++ });
class BrowserWindow extends EventEmitter {
    constructor() { super(); win = this; this.webContents = new EventEmitter(); Object.assign(this.webContents, { isDestroyed: () => false, isCrashed: () => false, send: channel => { this.sent = channel; } }); }
    setMenuBarVisibility() {} loadFile() {} isFullScreen() { return false; } setFullScreen() {}
    static getAllWindows() { return [win]; }
}
vm.runInNewContext(fs.readFileSync('electron_main.js', 'utf8'), { require: name => name === 'electron' ? { ipcMain, app, BrowserWindow } : name === 'steamworks.js' ? { init: () => null, electronEnableSteamOverlay() {} } : require(name),
    __dirname: process.cwd(), process, console: { log() {}, error() {} } });
let prevented = 0;
win.emit('close', { preventDefault() { prevented++; } }); assert.equal(prevented, 0, 'unready renderer can close');
ipcMain.emit('quit-handler-ready', { sender: win.webContents });
win.emit('close', { preventDefault() { prevented++; } }); assert.equal(prevented, 1); assert.equal(win.sent, 'request-game-quit');
ipcMain.emit('quit-app'); assert.equal(quit, 1);
win.emit('close', { preventDefault() { prevented++; } }); assert.equal(prevented, 1, 'approved close does not reopen prompt');
console.log('Schedule exit: native close routes to game UI, unready renderer escape and approved exit passed.');
