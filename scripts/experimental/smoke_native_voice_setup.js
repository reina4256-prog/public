'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:false});
    child.on('exit',code=>{process.exitCode=code??1;});child.on('error',()=>{process.exitCode=1;});
}else{
    const {app,safeStorage}=require('electron'),assert=require('node:assert/strict');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-voice-setup-'));
    // Isolate the actual setup window and Windows encryption from all personal data.
    app.disableHardwareAcceleration();app.setPath('appData',directory);
    const checks=[];let window;
    const timer=setTimeout(()=>finish(false,'timeout'),30000);
    function finish(ok,error){clearTimeout(timer);fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok,checks,error},null,2));console.log(JSON.stringify({ok,checks,error,directory}));app.exit(ok?0:1);}
    app.on('browser-window-created',(_event,created)=>{
        window=created;
        window.webContents.once('did-finish-load',async()=>{
            try{
                const evaluate=code=>window.webContents.executeJavaScript(code);
                assert.ok(safeStorage.isEncryptionAvailable());checks.push('Windows encryption available');
                for(const [value,expected] of [['not a key',false],['AQ.'+'x'.repeat(280),true]]){
                    await evaluate(`document.getElementById('key').value=${JSON.stringify(value)}; document.querySelector('form').requestSubmit();`);
                    let state;
                    for(let i=0;i<100;i++){
                        state=await evaluate(`({cleared:document.getElementById('key').value==='',disabled:document.getElementById('key').disabled,busy:document.querySelector('button').disabled,status:document.getElementById('status').textContent})`);
                        if(expected?state.disabled:!state.busy&&state.status)break;
                        await new Promise(r=>setTimeout(r,25));
                    }
                    assert.ok(state.cleared);assert.equal(state.disabled,expected);
                    assert.equal(state.status.startsWith('Saved.'),expected);
                    if(expected){
                        const store=require('./native_voice_credentials').credentials(path.join(directory,'AIPetGame-WordLearning-LLMNative'),safeStorage);
                        assert.equal(store.load(),value);
                        assert.equal(fs.readFileSync(path.join(directory,'AIPetGame-WordLearning-LLMNative/native-voice-key.bin')).includes(value),false);
                    }
                    checks.push(expected?'auth key >204 characters saved, encrypted and decrypted through actual IPC':'invalid input rejected with useful message and no key retained in input');
                }
                finish(true,null);
            }catch(_){finish(false,'setup assertion failed (secret and exception contents omitted)');}
        });
    });
    require('./setup_native_voice');
}
