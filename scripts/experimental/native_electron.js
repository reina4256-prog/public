'use strict';
const {app}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const core=require('../../experimental_word_llm_native');
const {randomUUID}=require('node:crypto');
const {createStore,createSession}=require('./native_store');
const directory=path.join(app.getPath('appData'),'AIPetGame-WordLearning-LLMNative');
app.setPath('userData',directory);
if(!app.requestSingleInstanceLock())app.quit();
else {
    let window,session;
    app.on('second-instance',()=>{if(window){window.show();window.focus();}});
    app.whenReady().then(()=>{
        const store=createStore(directory);
        // Reuse the existing CLI's dedicated login. Never copy/read its token or a game save.
        const responder=require('./gemini_reply').createResponder(path.join(app.getPath('appData'),'AIPetGame-WordLearning-Gemini'),{protocol:core.protocol});
        const recorder=require('./playtest_store').createRecorder({files:['experimental_word_llm_native.js','experimental_word_llm_native_ui.js',
            'experimental_word_llm_native.html','experimental_word_llm_native.css','scripts/experimental/native_store.js',
            'scripts/experimental/native_electron.js','scripts/experimental/native_preload.js','scripts/experimental/native_window.js','scripts/experimental/gemini_reply.js']});
        const sessionId=randomUUID();let sequence=0;
        recorder.append({sessionId,sequence:++sequence,event:{kind:'session',at:Date.now(),mode:'llm-native',runtime:recorder.version}});
        session=createSession({store,responder,record:event=>{
            fs.appendFileSync(path.join(directory,'native-playtest.jsonl'),JSON.stringify(event)+'\n','utf8');
            recorder.append({sessionId,sequence:++sequence,event:event.kind==='input'?{...event,kind:'player',text:event.packet.input}:{...event,kind:'native_result'}});
        }});
        window=require('./native_window').openWindow(session);
        window.on('closed',()=>{window=null;});
    }).catch(()=>app.exit(1));
    app.on('before-quit',()=>session?.dispose());
    app.on('window-all-closed',()=>app.quit());
}
