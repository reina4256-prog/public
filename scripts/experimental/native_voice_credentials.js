'use strict';
const fs=require('node:fs'),path=require('node:path');
function credentials(directory,safeStorage){
    const file=path.join(directory,'native-voice-key.bin');
    return {load(){try{if(!safeStorage.isEncryptionAvailable()||fs.statSync(file).size>4096)return '';return safeStorage.decryptString(fs.readFileSync(file));}catch(_){return '';}},
        save(key){return this.saveResult(key).ok;},
        saveResult(key){
            // Auth keys can contain dots and need not use the legacy AIza prefix.
            // Only check safe input bounds here; local storage cannot verify API access.
            if(typeof key!=='string'||! /^[A-Za-z0-9._-]{20,512}$/.test(key))return {ok:false,error:'format'};
            let encrypted;
            try{if(!safeStorage.isEncryptionAvailable())return {ok:false,error:'encryption'};encrypted=safeStorage.encryptString(key);}
            catch(_){return {ok:false,error:'encryption'};}
            try{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file+'.tmp',encrypted,{flush:true});fs.renameSync(file+'.tmp',file);return {ok:true};}
            catch(_){return {ok:false,error:'storage'};}
        }
    };
}
module.exports={credentials};
