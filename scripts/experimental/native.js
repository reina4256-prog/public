'use strict';
const path=require('node:path'),{spawn}=require('node:child_process');
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(require('electron'),[path.join(__dirname,'native_electron.js')],{env,stdio:'inherit',windowsHide:true});
child.on('error',()=>{process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code || 0;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(child.exitCode===null)child.kill();});
