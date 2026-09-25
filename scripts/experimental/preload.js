'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wordStorage', {
    load: () => ipcRenderer.sendSync('word-life-load'),
    save: value => ipcRenderer.sendSync('word-life-save', value),
    exportReport: payload => ipcRenderer.invoke('word-life-export', payload)
});
