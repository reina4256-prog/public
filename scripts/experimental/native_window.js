'use strict';
const path=require('node:path'),{pathToFileURL}=require('node:url');
function openWindow(session,{show=true,legacy=false,voice=null}={}) {
    const {BrowserWindow,ipcMain}=require('electron');
    const window=new BrowserWindow({width:1160,height:850,minWidth:380,minHeight:560,show:false,autoHideMenuBar:true,
        webPreferences:{preload:path.join(__dirname,'native_preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
    const url=pathToFileURL(path.resolve(__dirname,legacy?'../../experimental_word_llm_native.html':'../../experimental_word_llm_native_island.html')).href;
    const allowed=event=>!window.isDestroyed() && event.sender===window.webContents && event.senderFrame===window.webContents.mainFrame && event.senderFrame.url===url;
    ipcMain.handle('native-load',event=>allowed(event)?session.load():{ok:false,error:'input'});
    ipcMain.handle('native-enter',event=>allowed(event)?session.enter():{ok:false,error:'input'});
    ipcMain.handle('native-leave',event=>allowed(event)?session.leave():{ok:false,error:'input'});
    ipcMain.handle('native-resume-report',event=>allowed(event)?session.resumeReport():{ok:false,error:'input'});
    ipcMain.handle('native-create',(event,character,locale,answers)=>allowed(event)?session.create(character,locale,answers):{ok:false,error:'input'});
    ipcMain.handle('native-prepare',(event,answers)=>allowed(event)?session.prepare(answers):{ok:false,error:'input'});
    ipcMain.handle('native-characters',event=>allowed(event)?session.characters():{ok:false,error:'input'});
    ipcMain.handle('native-select-character',(event,id)=>allowed(event)?session.selectCharacter(id):{ok:false,error:'input'});
    ipcMain.handle('native-create-character',(event,character,locale,answers)=>allowed(event)?session.createCharacter(character,locale,answers):{ok:false,error:'input'});
    ipcMain.handle('native-warmup',event=>allowed(event)?session.warmup():{ok:false,error:'input'});
    ipcMain.handle('native-pulse',(event,paused)=>allowed(event)?session.pulse(paused):{ok:false,error:'input'});
    ipcMain.handle('native-calendar-settings',(event,value,locale)=>allowed(event)?session.calendarSettings(value,locale):{ok:false,error:'input'});
    ipcMain.handle('native-submit',(event,input,locale)=>allowed(event)?session.submit(input,locale):{ok:false,error:'input'});
    ipcMain.handle('native-mentor-start',(event,locale)=>allowed(event)?session.mentorStart(locale):{ok:false,error:'input'});
    ipcMain.handle('native-mentor-intro',(event,id)=>allowed(event)?session.mentorIntro(id):{ok:false,error:'input'});
    ipcMain.handle('native-mentor-next',(event,id,round)=>allowed(event)?session.mentorNext(id,round):{ok:false,error:'input'});
    ipcMain.handle('native-practice-next',(event,id)=>allowed(event)?session.practiceNext(id):{ok:false,error:'input'});
    const mentorStop=event=>{if(allowed(event)){session.mentorStop();voice?.cancel();}};
    ipcMain.on('native-mentor-stop',mentorStop);
    ipcMain.handle('native-voice-load',event=>allowed(event)&&voice?voice.load():{ok:false,error:'missing'});
    ipcMain.handle('native-voice-save',(event,value)=>allowed(event)&&voice?voice.save(value):{ok:false,error:'missing'});
    ipcMain.handle('native-voice-generate',(event,request)=>allowed(event)&&voice?voice.generate(request):{ok:false,error:'missing'});
    const voiceCancel=event=>{if(allowed(event))voice?.cancel();};
    ipcMain.on('native-voice-cancel',voiceCancel);
    const cancel=event=>{if(allowed(event))session.cancel();};
    ipcMain.on('native-cancel',cancel);
    window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
    window.webContents.on('will-navigate',event=>event.preventDefault());
    if(show)window.once('ready-to-show',()=>window.show());
    window.on('hide',()=>{session.cancel();voice?.cancel();});
    window.on('closed',()=>{
        session.dispose();voice?.dispose();
        for(const name of ['native-load','native-create','native-prepare','native-characters','native-select-character','native-create-character','native-warmup','native-pulse','native-submit','native-voice-load','native-voice-save','native-voice-generate'])ipcMain.removeHandler(name);
        ipcMain.removeListener('native-cancel',cancel);
        ipcMain.removeListener('native-voice-cancel',voiceCancel);
        ipcMain.removeHandler('native-mentor-start');ipcMain.removeHandler('native-mentor-next');ipcMain.removeListener('native-mentor-stop',mentorStop);
        ipcMain.removeHandler('native-mentor-intro');
        ipcMain.removeHandler('native-practice-next');
        ipcMain.removeHandler('native-calendar-settings');
        for(const name of ['native-enter','native-leave','native-resume-report'])ipcMain.removeHandler(name);
    });
    void window.loadURL(url).catch(error=>{
        console.error('[word-native] Could not load the native page:',error.message);
        if(!window.isDestroyed())window.close();
    });
    return window;
}
module.exports={openWindow};
