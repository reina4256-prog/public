'use strict';
const path=require('node:path'),{spawn}=require('node:child_process');
function launch(options={}) {
    const env={...(options.env || process.env)};delete env.ELECTRON_RUN_AS_NODE;
    const report=options.report || (message=>console.error(message));
    const child=(options.spawn || spawn)(options.executable || require('electron'),[path.join(__dirname,'native_electron.js')],
        {env,stdio:'inherit',windowsHide:false});
    child.on('error',error=>{report('[word-native] Electron could not start: '+error.message);process.exitCode=1;});
    child.on('exit',(code,signal)=>{
        process.exitCode=Number.isInteger(code)?code:1;
        if(process.exitCode!==0)report('[word-native] Electron exited: code='+String(code)+', signal='+String(signal));
    });
    return child;
}
if(require.main===module){
    const child=launch();
    for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(child.exitCode===null)child.kill();});
}
module.exports={launch};
