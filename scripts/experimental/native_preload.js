'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nativeMemory',Object.freeze({
    load:()=>ipcRenderer.invoke('native-load'),
    create:(character,locale,answers)=>ipcRenderer.invoke('native-create',character,locale,answers),
    prepare:answers=>ipcRenderer.invoke('native-prepare',answers),
    characters:()=>ipcRenderer.invoke('native-characters'),
    selectCharacter:id=>ipcRenderer.invoke('native-select-character',id),
    createCharacter:(character,locale,answers)=>ipcRenderer.invoke('native-create-character',character,locale,answers),
    warmup:()=>ipcRenderer.invoke('native-warmup'),
    pulse:paused=>ipcRenderer.invoke('native-pulse',paused),
    submit:(input,locale)=>ipcRenderer.invoke('native-submit',input,locale),
    cancel:()=>ipcRenderer.send('native-cancel'),
    mentorStart:locale=>ipcRenderer.invoke('native-mentor-start',locale),
    mentorNext:(id,round)=>ipcRenderer.invoke('native-mentor-next',id,round),
    mentorStop:()=>ipcRenderer.send('native-mentor-stop'),
    voiceLoad:()=>ipcRenderer.invoke('native-voice-load'),
    voiceSave:value=>ipcRenderer.invoke('native-voice-save',value),
    voiceGenerate:request=>ipcRenderer.invoke('native-voice-generate',request),
    voiceCancel:()=>ipcRenderer.send('native-voice-cancel')
}));
