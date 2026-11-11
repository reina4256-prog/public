'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wordVoiceCache', {
    get: key => ipcRenderer.invoke('word-voice-cache-get', key),
    put: (key, data) => ipcRenderer.invoke('word-voice-cache-put', key, data)
});
contextBridge.exposeInMainWorld('wordSpeech', {
    prepare: () => ipcRenderer.invoke('word-speech-prepare'),
    transcribe: packet => ipcRenderer.invoke('word-speech-transcribe', packet),
    cancel: id => ipcRenderer.invoke('word-speech-cancel', id)
});
contextBridge.exposeInMainWorld('wordStorage', {
    load: () => ipcRenderer.sendSync('word-life-load'),
    save: value => ipcRenderer.sendSync('word-life-save', value),
    exportReport: payload => ipcRenderer.invoke('word-life-export', payload),
    recordPersonalEvent: payload => ipcRenderer.sendSync('word-personal-log-append', payload)
});
