'use strict';
const path=require('node:path');
// Windows safeStorage is tied to userData, not just the Windows account.
// Keep the existing setup profile; return its key only over a private child pipe.
function loadKey(directory,options={}){
    return new Promise(resolve=>{
        const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.WORD_GEMINI_TTS_KEY;
        env.WORD_NATIVE_VOICE_READER='1';
        let child,timer,done=false,bytes=Buffer.alloc(0);
        const finish=value=>{if(done)return;done=true;clearTimeout(timer);resolve(value);};
        try{
            child=(options.spawn||require('node:child_process').spawn)(options.executable||require('electron'),[__filename,directory],{env,stdio:['ignore','pipe','ignore'],windowsHide:true});
            timer=setTimeout(()=>{finish('');child.kill();},options.timeout||10000);
            child.stdout.on('data',chunk=>{bytes=Buffer.concat([bytes,Buffer.from(chunk)]);if(bytes.length>1024){bytes=Buffer.alloc(0);finish('');child.kill();}});
            child.on('error',()=>finish(''));
            // Electron on Windows may prepend a blank line to redirected stdout.
            child.on('close',code=>{const value=bytes.toString('utf8').trim();finish(code===0&&/^[A-Za-z0-9._-]{20,512}$/.test(value)?value:'');});
        }catch(_){finish('');}
    });
}
module.exports={loadKey};
if(process.versions.electron&&process.env.WORD_NATIVE_VOICE_READER==='1'&&path.resolve(process.argv[1]||'')===__filename){
    const {app,safeStorage}=require('electron'),directory=process.argv[2];
    if(!directory||!path.isAbsolute(directory))app.exit(1);
    else{
        app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'voice-setup'));
        app.whenReady().then(()=>{
            const key=require('./native_voice_credentials').credentials(directory,safeStorage).load();
            process.stdout.write(key,()=>app.quit());
        }).catch(()=>app.exit(1));
    }
}
