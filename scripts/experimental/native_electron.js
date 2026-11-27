'use strict';
const {app}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const core=require('../../experimental_word_llm_native_runtime');
const {randomUUID}=require('node:crypto');
const {createProfiles,createSession}=require('./native_store');
const directory=path.join(app.getPath('appData'),'AIPetGame-WordLearning-LLMNative');
app.setPath('userData',directory);
if(!app.requestSingleInstanceLock()){
    console.error('[word-native] Another native window is already running; activating it.');app.quit();
}
else {
    let window,session;
    app.on('second-instance',()=>{if(window){window.show();window.focus();}});
    app.whenReady().then(async()=>{
        console.log('[word-native] Preparing the native window.');
        const store=createProfiles(directory);
        const suppliedVoiceKey=process.env.WORD_GEMINI_TTS_KEY;delete process.env.WORD_GEMINI_TTS_KEY;
        const voiceKey=suppliedVoiceKey||await require('./native_voice_key').loadKey(directory,{executable:process.execPath});
        // Reuse the existing CLI's dedicated login. Never copy/read its token or a game save.
        const responder=require('./gemini_reply').createResponder(path.join(app.getPath('appData'),'AIPetGame-WordLearning-Gemini'),{protocol:core.protocol,measure:true});
        const mentorResponder=require('./gemini_reply').createResponder(path.join(app.getPath('appData'),'AIPetGame-WordLearning-Gemini'),{protocol:require('./native_mentor').protocol});
        const practiceResponder=require('./gemini_reply').createResponder(path.join(app.getPath('appData'),'AIPetGame-WordLearning-Gemini'),{protocol:require('./native_practice').protocol});
        const resumeResponder=require('./gemini_reply').createResponder(path.join(app.getPath('appData'),'AIPetGame-WordLearning-Gemini'),{protocol:require('./native_resume').protocol});
        const recorder=require('./playtest_store').createRecorder({files:['experimental_word_llm_native_home.js','myhome_map_core.js','dungeon_render.js','experimental_word_llm_native_absence.js','scripts/experimental/native_resume.js','experimental_word_llm_native.js','experimental_word_llm_native_ui.js',
            'experimental_word_llm_native.html','experimental_word_llm_native.css','scripts/experimental/native_store.js',
            'scripts/experimental/native_electron.js','scripts/experimental/native.js','scripts/experimental/native_preload.js','scripts/experimental/native_window.js','scripts/experimental/gemini_reply.js',
            'scripts/experimental/antigravity_install.js','scripts/experimental/playtest_store.js','experimental_word_reply_awareness.js',
            'experimental_word_llm_native_runtime.js','experimental_word_llm_native_game.js','experimental_word_llm_native_perception.js','experimental_word_llm_native_island.html',
            'experimental_word_llm_native_island_ui.js','experimental_word_llm_native_scene.js','experimental_word_llm_native_passage.js','experimental_word_llm_native_book.js',
            'experimental_word_llm_native_drawing.js','experimental_word_llm_native_stars.js','scripts/experimental/native_island.js',
            'experimental_word_llm_native_book.css','experimental_word_llm_native_island.css','experimental_word_start_questions.js',
            'experimental_word_island_boot.js','experimental_word_island_navigation.js','data.js','island_shared.js',
            'view_renderer.js','localization_core.js','localization_catalog.js','experimental_word_llm_native_voice.js',
            'experimental_word_llm_native_voice_ui.js','experimental_word_llm_native_voice_design.js','scripts/experimental/native_voice_designs.js','scripts/experimental/native_voice.js','scripts/experimental/native_voice_credentials.js','scripts/experimental/native_voice_key.js',
            'scripts/experimental/native_mentor.js','experimental_word_llm_native_mentor_ui.js','experimental_word_llm_native_mentor.css','experimental_word_master_window.js','experimental_word_master_window.css','experimental_word_llm_native_walk.js',
            'experimental_word_llm_native_calendar.js','experimental_word_llm_native_compass.js','experimental_word_llm_native_practice.js','scripts/experimental/native_practice.js']});
        const sessionId=randomUUID();let sequence=0;
        recorder.append({sessionId,sequence:++sequence,event:{kind:'session',at:Date.now(),mode:'llm-native',runtime:recorder.version}});
        session=createSession({store,responder,mentorResponder,practiceResponder,resumeResponder,
            recoverMentor:state=>require('./native_mentor').recoverLegacyFile(state,path.join(directory,'native-playtest.jsonl')),record:event=>{
            fs.appendFileSync(path.join(directory,'native-playtest.jsonl'),JSON.stringify(event)+'\n','utf8');
            recorder.append({sessionId,sequence:++sequence,event:event.kind.startsWith('mentor_')?event:event.kind==='input'?{...event,kind:'player',text:event.packet.input}:{...event,kind:'native_result'}});
        }});
        // The cloud voice key belongs to this main process, never the CLI or renderer.
        const voice=require('./native_voice').createVoice({directory,session,key:()=>voiceKey});
        window=require('./native_window').openWindow(session,{voice});
        window.on('show',()=>console.log('[word-native] Window visibility: '+String(window.isVisible())));
        window.webContents.on('did-fail-load',(_event,code)=>console.error('[word-native] Page load failed: '+code));
        window.webContents.on('render-process-gone',(_event,details)=>console.error('[word-native] Renderer stopped: '+details.reason+', code='+details.exitCode));
        window.on('unresponsive',()=>console.error('[word-native] The native window is not responding.'));
        window.on('closed',()=>{window=null;});
    }).catch(error=>{console.error('[word-native] Startup failed:',error.stack || error.message);app.exit(1);});
    app.on('before-quit',()=>session?.dispose());
    app.on('window-all-closed',()=>app.quit());
}
