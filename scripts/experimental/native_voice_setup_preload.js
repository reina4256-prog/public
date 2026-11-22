'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('voiceSetup',Object.freeze({save:key=>ipcRenderer.invoke('native-voice-key-save',key)}));
