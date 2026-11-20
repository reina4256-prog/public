'use strict';
const path=require('node:path'),{pathToFileURL}=require('node:url');
function openWindow(session,{show=true}={}) {
    const {BrowserWindow,ipcMain}=require('electron');
    const window=new BrowserWindow({width:1160,height:850,minWidth:380,minHeight:560,show:false,autoHideMenuBar:true,
        webPreferences:{preload:path.join(__dirname,'native_preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    const url=pathToFileURL(path.resolve(__dirname,'../../experimental_word_llm_native.html')).href;
    const allowed=event=>!window.isDestroyed() && event.sender===window.webContents && event.senderFrame===window.webContents.mainFrame && event.senderFrame.url===url;
    ipcMain.handle('native-load',event=>allowed(event)?session.load():{ok:false,error:'input'});
    ipcMain.handle('native-create',(event,character,locale)=>allowed(event)?session.create(character,locale):{ok:false,error:'input'});
    ipcMain.handle('native-submit',(event,input,locale)=>allowed(event)?session.submit(input,locale):{ok:false,error:'input'});
    const cancel=event=>{if(allowed(event))session.cancel();};
    ipcMain.on('native-cancel',cancel);
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',event=>event.preventDefault());
    if(show)window.once('ready-to-show',()=>window.show());
    window.on('hide',()=>session.cancel());
    window.on('closed',()=>{
        session.dispose();
        for(const name of ['native-load','native-create','native-submit'])ipcMain.removeHandler(name);
        ipcMain.removeListener('native-cancel',cancel);
    });
    window.loadURL(url);
    return window;
}
module.exports={openWindow};
