'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nativeMemory',Object.freeze({
    load:()=>ipcRenderer.invoke('native-load'),
    create:(character,locale)=>ipcRenderer.invoke('native-create',character,locale),
    submit:(input,locale)=>ipcRenderer.invoke('native-submit',input,locale),
    cancel:()=>ipcRenderer.send('native-cancel')
}));
