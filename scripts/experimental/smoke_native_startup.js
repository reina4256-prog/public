'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){
    // Exercise the real launcher and its Windows startup flags with an isolated app entry.
    require('./native').launch({spawn:(exe,_args,settings)=>require('node:child_process').spawn(exe,[__filename],settings)});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-visible-startup-'));
    app.setPath('userData',path.join(directory,'profile'));
    // Deliberately keep normal GPU settings: the old renderer smoke disabled them.
    const events=[];let window;
    const save=()=>fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({events},null,2));
    const timer=setTimeout(()=>{events.push({kind:'timeout'});save();app.exit(1);},30000);
    app.whenReady().then(async()=>{
        window=require('./native_window').openWindow({load:()=>({ok:true,state:null}),create:()=>({ok:false}),submit:async()=>({ok:false}),cancel(){},dispose(){}});
        for(const kind of ['show','ready-to-show'])window.on(kind,()=>{events.push({kind,visible:window.isVisible()});save();});
        await new Promise((resolve,reject)=>{
            window.once('ready-to-show',()=>setTimeout(resolve,100));
            window.webContents.once('did-fail-load',(_event,code)=>reject(Error('load '+code)));
        });
        assert.ok(window.isVisible(),'The interactive application must actually be visible.');
        assert.ok(await window.webContents.executeJavaScript('!!document.getElementById("questions") && !document.getElementById("questions").hidden'));
        fs.writeFileSync(path.join(directory,'visible.png'),(await window.webContents.capturePage()).toPNG());
        events.push({kind:'passed',visible:window.isVisible()});save();
        console.log(JSON.stringify({ok:true,directory,events}));clearTimeout(timer);window.destroy();app.quit();
    }).catch(error=>{events.push({kind:'failed',error:error.message});save();console.error(directory,error.message);clearTimeout(timer);app.exit(1);});
}
