'use strict';
const fs=require('node:fs'),path=require('node:path');
function credentials(directory,safeStorage){
    const file=path.join(directory,'native-voice-key.bin');
    return {load(){try{if(!safeStorage.isEncryptionAvailable()||fs.statSync(file).size>4096)return '';return safeStorage.decryptString(fs.readFileSync(file));}catch(_){return '';}},
        save(key){try{if(typeof key!=='string'||!/^AIza[A-Za-z0-9_-]{20,200}$/.test(key)||!safeStorage.isEncryptionAvailable())return false;
            fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file+'.tmp',safeStorage.encryptString(key),{flush:true});fs.renameSync(file+'.tmp',file);return true;
        }catch(_){return false;}}
    };
}
module.exports={credentials};
