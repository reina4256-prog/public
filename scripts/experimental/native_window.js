'use strict';
const path=require('node:path'),{pathToFileURL}=require('node:url');
function openWindow(session,{show=true,legacy=false}={}) {
    const {BrowserWindow,ipcMain}=require('electron');
    const window=new BrowserWindow({width:1160,height:850,minWidth:380,minHeight:560,show:false,autoHideMenuBar:true,
        webPreferences:{preload:path.join(__dirname,'native_preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    const url=pathToFileURL(path.resolve(__dirname,legacy?'../../experimental_word_llm_native.html':'../../experimental_word_llm_native_island.html')).href;
    const allowed=event=>!window.isDestroyed() && event.sender===window.webContents && event.senderFrame===window.webContents.mainFrame && event.senderFrame.url===url;
    ipcMain.handle('native-load',event=>allowed(event)?session.load():{ok:false,error:'input'});
    ipcMain.handle('native-create',(event,character,locale,answers)=>allowed(event)?session.create(character,locale,answers):{ok:false,error:'input'});
    ipcMain.handle('native-prepare',(event,answers)=>allowed(event)?session.prepare(answers):{ok:false,error:'input'});
    ipcMain.handle('native-warmup',event=>allowed(event)?session.warmup():{ok:false,error:'input'});
    ipcMain.handle('native-pulse',(event,paused)=>allowed(event)?session.pulse(paused):{ok:false,error:'input'});
    ipcMain.handle('native-submit',(event,input,locale)=>allowed(event)?session.submit(input,locale):{ok:false,error:'input'});
    const cancel=event=>{if(allowed(event))session.cancel();};
    ipcMain.on('native-cancel',cancel);
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',event=>event.preventDefault());
    if(show)window.once('ready-to-show',()=>window.show());
    window.on('hide',()=>session.cancel());
    window.on('closed',()=>{
        session.dispose();
        for(const name of ['native-load','native-create','native-prepare','native-warmup','native-pulse','native-submit'])ipcMain.removeHandler(name);
        ipcMain.removeListener('native-cancel',cancel);
    });
    void window.loadURL(url).catch(error=>{
        console.error('[word-native] Could not load the native page:',error.message);
        if(!window.isDestroyed())window.close();
    });
    return window;
}
module.exports={openWindow};
