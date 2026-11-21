'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nativeMemory',Object.freeze({
    load:()=>ipcRenderer.invoke('native-load'),
    create:(character,locale,answers)=>ipcRenderer.invoke('native-create',character,locale,answers),
    prepare:answers=>ipcRenderer.invoke('native-prepare',answers),
    pulse:paused=>ipcRenderer.invoke('native-pulse',paused),
    submit:(input,locale)=>ipcRenderer.invoke('native-submit',input,locale),
    cancel:()=>ipcRenderer.send('native-cancel')
}));
