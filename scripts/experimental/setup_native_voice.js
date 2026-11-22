'use strict';
const path=require('node:path');
if(!process.versions.electron){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});
    child.on('error',()=>{console.error('Could not open voice setup.');process.exitCode=1;});child.on('exit',code=>{process.exitCode=code??1;});
}else{
    const {app,BrowserWindow,ipcMain,safeStorage}=require('electron'),{pathToFileURL}=require('node:url');
    // Development setup is separate from the game. Never store a key in game state or source.
    const directory=path.join(app.getPath('appData'),'AIPetGame-WordLearning-LLMNative');
    app.setPath('userData',path.join(directory,'voice-setup'));
    app.whenReady().then(()=>{
        const window=new BrowserWindow({width:570,height:430,autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'native_voice_setup_preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
        const url=pathToFileURL(path.join(__dirname,'native_voice_setup.html')).href;
        ipcMain.handle('native-voice-key-save',(event,key)=>{
            if(event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||event.senderFrame.url!==url)return false;
            return require('./native_voice_credentials').credentials(directory,safeStorage).save(key);
        });
        window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',e=>e.preventDefault());
        window.on('closed',()=>{ipcMain.removeHandler('native-voice-key-save');app.quit();});void window.loadURL(url);
    });
}
