'use strict';
// Dedicated profile and a named local CLI fixture; never calls Google or reads a player's save.
const fs = require('node:fs'), path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code || 0; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow, ipcMain } = require('electron');
    const root = path.resolve(__dirname,'../..');
    const directory = fs.mkdtempSync(path.join(root,'docs/.local-history/verification-runs/gemini-reply-renderer-'));
    app.disableHardwareAcceleration(); app.setPath('userData',path.join(directory,'profile'));
    let window, server, mode, responder, textOnlySession = false, audioWrites = 0, preparations = 0, resets = 0; const windows = [], errors = [], packets = [], cancelled = [], checks = [];
    const watchdog = setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({mode,errors}));app.exit(1);},300000);
    const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
    const catalog = require('../../experimental_word_learning_catalog.json');
    const seed = { version: 1, appearance: 'robot', state: require('../../experimental_word_learning_core').create({ foundation: false, life: false, speech: 'gesture' }, catalog),
        world: require('../../experimental_word_learning_world').create() };
    const stores = {}, snapshots = {};
    const mock = `window.__frames=[];window.__clock=performance.now();window.__realRAF=window.requestAnimationFrame.bind(window);
        window.addEventListener('error',e=>console.error(e.error?.stack||e.message));
        window.requestAnimationFrame=fn=>(window.__frames.push(fn),window.__frames.length);
        window.Audio=class extends EventTarget{play(){return Promise.resolve();}pause(){}};
        window.__step=n=>{for(let i=0;i<n;i++){window.__clock+=100;const frames=window.__frames.splice(0);for(const fn of frames)fn(window.__clock);}};
        window.__spoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
        Object.defineProperty(window,'speechSynthesis',{value:{getVoices(){return ['ja-JP','en-US','zh-CN','ru-RU','es-ES','pt-BR','de-DE'].flatMap(lang=>[0,1].map(i=>({lang,name:lang+i,voiceURI:lang+'-'+i})));},
        speak(u){window.__spoken.push({text:u.text,voice:u.voice.voiceURI,pitch:u.pitch,rate:u.rate});setTimeout(()=>u.onend?.(),20);},cancel(){},addEventListener(){}}});`;
    app.whenReady().then(async()=>{
        for(const kind of ['native','gemini']){
            const data=path.join(directory,kind);fs.mkdirSync(data);fs.writeFileSync(path.join(data,'word-life.json'),JSON.stringify(seed));
            stores[kind]=require('./storage').createStore(data);
        }
        const fixture = path.join(directory,'reply-fixture.cjs');
        fs.writeFileSync(fixture,`console.log(JSON.stringify({event:'init'}));let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',s=>input+=s);process.stdin.on('end',()=>{
            const content=JSON.parse(input).message.content,p=JSON.parse(content.slice(content.indexOf(String.fromCharCode(10))+1)),query=p.playerInput||'';const finish=()=>console.log(JSON.stringify({event:'result',result:query.startsWith('QUOTA')?{status:'ERROR',error:'RESOURCE_EXHAUSTED: quota reached'}:query.startsWith('UNSUPPORTED')?{status:'ERROR',error:'This client is no longer supported'}:{status:'SUCCESS',response:p.playerInput===null?'INITIATIVE_REPLY':query.startsWith('REST')?(p.selfState.activity==='rest'?'RESTING_REPLY':'NOT_RESTING'):query.startsWith('REMEMBER')?(p.playerMemories.some(m=>m.text==='月について教えて')?'MEMORY_RECALLED':'NO_MEMORY'):query.startsWith('TO_CANCEL')?'STALE_REPLY':query.startsWith('SECOND')?'SELECTED_VOICE_REPLY':'MOON_FIXTURE_REPLY',stats:{tools:{totalCalls:0}}}}));
            if(query.startsWith('TO_CANCEL')||query.startsWith('SECOND'))setTimeout(finish,query.startsWith('TO_CANCEL')?3000:700);
            else {const timer=setInterval(()=>{if(require('node:fs').existsSync(require('node:path').join(__dirname,'release-moon'))){clearInterval(timer);finish();}},25);}});`);
        responder=require('./gemini_reply').createResponder(path.join(directory,'gemini'),{entry:fixture,skipAuthCheck:true,measure:true});
        server=require('./serve').createServer();const serve=server.listeners('request')[0];server.removeAllListeners('request');
        server.on('request',(request,response)=>{
            fs.appendFileSync(path.join(directory,'requests.log'),request.url+'\n');
            if(request.url==='/experimental_word_island.html'){
                response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
                response.end(fs.readFileSync(path.join(root,'experimental_word_island.html'),'utf8').replace('<head>','<head><script>'+mock+'</script>'));
            } else if(request.url==='/experimental_word_learning_report.js'){
                response.writeHead(200,{'Content-Type':'text/javascript'});
                response.end(fs.readFileSync(path.join(root,'experimental_word_learning_report.js'),'utf8')+`;window.__timings=[];
                    const originalCreate=ExperimentalWordReport.create;
                    window.ExperimentalWordReport={...ExperimentalWordReport,create:(...args)=>{const report=originalCreate(...args);
                        return {...report,record:(kind,data)=>{if(kind==='guidance'&&data.key.startsWith('llm_timing'))window.__timings.push(structuredClone(data));return report.record(kind,data);}};}};`);
            } else if(request.url==='/experimental_word_audio_provider.js'){
                response.writeHead(200,{'Content-Type':'text/javascript'});
                response.end(fs.readFileSync(path.join(root,'experimental_word_audio_provider.js'),'utf8')+';ExperimentalWordAudioProvider.voicevox=()=>({supports:()=>false});');
            } else serve(request,response);
        });
        await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
        const url=`http://127.0.0.1:${server.address().port}/experimental_word_island.html`;
        const valid=event=>event.sender===window.webContents&&event.senderFrame?.url===url;
        ipcMain.on('word-life-load',event=>{event.returnValue=valid(event)?stores[mode].load():{ok:false};});
        ipcMain.on('word-life-save',(event,value)=>{const result=valid(event)?stores[mode].save(value):{ok:false};if(result.ok)snapshots[mode]=structuredClone(value);event.returnValue=result;});
        ipcMain.on('word-audio-preferences-load',event=>{event.returnValue={ok:true,value:{readAloud:textOnlySession}};});
        ipcMain.on('word-audio-preferences-save',event=>{audioWrites++;event.returnValue={ok:true};});
        ipcMain.handle('word-reply-generate',(event,packet)=>{assert.ok(valid(event));packets.push(structuredClone(packet));return responder.reply(packet);});
        ipcMain.handle('word-reply-prepare',event=>{assert.ok(valid(event));preparations++;return responder.prepare();});
        ipcMain.on('word-reply-reset',event=>{if(valid(event)){resets++;responder.cancel();}});
        ipcMain.on('word-reply-cancel',(event,id)=>{if(valid(event)){cancelled.push(id);responder.cancel(id);}});
        ipcMain.handle('word-voice-cache-get',()=>({ok:false}));ipcMain.handle('word-voice-cache-put',()=>({ok:false}));
        const js=async code=>{fs.appendFileSync(path.join(directory,'scripts.log'),'start '+code+'\n');try{const value=await window.webContents.executeJavaScript(code,true);fs.appendFileSync(path.join(directory,'scripts.log'),'done\n');return value;}catch(error){fs.writeFileSync(path.join(directory,'script-error.json'),JSON.stringify({code,errors}));throw error;}};
        const wait=async(code,label)=>{for(let i=0;i<500;i++){if(await js(code))return;await sleep(30);}fs.writeFileSync(path.join(directory,'wait-timeout.json'),JSON.stringify({label,packets,ui:await js(`({locale:GameI18n.language,status:document.querySelector('#word-reply-status').textContent})`)}));throw Error('timeout: '+label);};
        async function load(kind, textOnly = false){
            textOnlySession = textOnly;
            mode=kind;window=new BrowserWindow({show:false,width:1280,height:900,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,
                backgroundThrottling:false,offscreen:textOnly,partition:'persist:gemini-fixture-'+kind,preload:path.join(__dirname,'preload.js'),additionalArguments:kind==='gemini'?['--word-reply=gemini-cli',...(textOnly?['--word-text-only']:[])]:[]}});
            windows.push(window);
            window.webContents.on('console-message',(_event,level,message,line,source)=>{if(level>=3){errors.push(message);fs.writeFileSync(path.join(directory,'console-errors.json'),JSON.stringify(errors));fs.appendFileSync(path.join(directory,'console-locations.log'),JSON.stringify({message,line,source})+'\n');}});
            window.webContents.on('render-process-gone',(_event,details)=>fs.writeFileSync(path.join(directory,'renderer-gone.json'),JSON.stringify(details)));
            fs.writeFileSync(path.join(directory,'progress.txt'),'loading '+kind);
            await window.loadURL(url);
            await js(`window.__clock=performance.now();window.requestAnimationFrame=fn=>(window.__frames.push(fn),window.__frames.length);void 0`);await sleep(100);
            fs.writeFileSync(path.join(directory,'progress.txt'),'UI '+kind);
            await wait(`!!document.querySelector('#word-continue')`,'UI');
            await js(`document.querySelector('.word-logo').click();void 0`);await wait(`!document.querySelector('#word-continue').disabled`,'continue');
            if(kind==='gemini')await js(`{const create=ExperimentalWordReplyAwareness.create;ExperimentalWordReplyAwareness.create=(...args)=>{const session=create(...args),read=session.context;session.context=world=>{window.__world=world;return read(world);};window.__awareness=session;return session;};}void 0`);
            await js(`document.querySelector('#word-continue').click();if(document.querySelector('#word-pause').getAttribute('aria-pressed')==='true')document.querySelector('#word-pause').click();void 0`);
        }
        const submitCode=text=>`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)};document.querySelector('.chat-form').requestSubmit();`;
        async function submit(text){await js(submitCode(text)+'void 0');}
        await load('native');fs.writeFileSync(path.join(directory,'progress.txt'),'native input');await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.equal(preparations,0,'normal mode never prestarts a CLI');
        assert.equal(stores.gemini.save(structuredClone(snapshots.native)).ok,true);
        await submit('月について教えて');await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        const control=structuredClone(snapshots.native);assert.equal(packets.length,0);checks.push({regularModeNoRequests:true});
        assert.ok(await js(`[...document.querySelectorAll('.conversation-help')].some(e=>e.textContent===GameI18n.translate('今回の声かけは、まだ十分には伝わっていません。短く言い換えたり、指さしてから話しかけたりしてみてください。'))`));
        assert.equal(await js(`document.querySelector('#word-inner-voice-current').hidden`),false);
        await load('gemini');fs.writeFileSync(path.join(directory,'progress.txt'),'gemini input');assert.equal(await js(`wordReply.enabled`),true);await submit('月について教えて');
        await wait(`document.querySelector('#word-reply-status').textContent===GameI18n.translate('お返事を待っています…')`,'pending');
        const before=structuredClone(snapshots.gemini.world);
        const animationFrames = await js(`(()=>{const frames=[];for(let i=0;i<8;i++){window.__step(1);frames.push(aiPet.frameIndex);}return frames;})()`);
        assert.ok(new Set(animationFrames).size>1,'sprite advances during generation');
        assert.equal(packets.at(-1).selfState.activity,'other');
        assert.deepEqual(packets.at(-1).selfState.recent,[]);
        await js(`window.__step(30);window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.equal(snapshots.gemini.world.elapsed,before.elapsed);assert.equal(snapshots.gemini.world.fatigue,before.fatigue);
        fs.writeFileSync(path.join(directory,'release-moon'),'release');
        await wait(`document.querySelector('.stage .bubble').textContent==='MOON_FIXTURE_REPLY'`,'generated reply');
        const timing = await js(`window.__timings.find(x=>x.key==='llm_timing'&&x.outcome==='displayed')`);
        assert.equal(timing.requestId,packets.at(-1).id);
        assert.equal(timing.helper.prestart.used,true,'UI start prepares the first single-use process');
        assert.ok(timing.prepareMs>=0 && timing.roundTripMs>=timing.helper.marks.returned);
        assert.ok(timing.domUpdatedMs>=timing.receivedMs);
        assert.equal(timing.helper.marks.firstText,undefined,'fixture sends only terminal reply');
        // Run only the two diagnostic callbacks; advancing the world here would invalidate the native/comparison control.
        await js(`window.__frames.pop()(performance.now());window.__frames.pop()(performance.now());void 0`);
        const frame = await js(`window.__timings.find(x=>x.key==='llm_timing_frame')`);
        assert.equal(frame.requestId,timing.requestId);assert.ok(frame.frameOpportunityMs>=timing.domUpdatedMs);
        fs.writeFileSync(path.join(directory,'timing.json'),JSON.stringify({timing,frame},null,2));
        checks.push({rendererTimingCorrelated:true,missingDeltaNotInvented:true,frameOpportunityMeasured:true});
        await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        const {replyMemory,...coreState}=snapshots.gemini.state;
        assert.deepEqual(coreState,control.state);assert.deepEqual(snapshots.gemini.world,control.world);
        assert.equal(replyMemory.entries[0].raw,'月について教えて');
        assert.ok(!JSON.stringify(snapshots.gemini.state).includes('MOON_FIXTURE_REPLY'));assert.equal(await js(`document.querySelector('#word-inner-voice-current').hidden`),true);
        assert.equal(await js(`document.querySelectorAll('#conversation .word-inner-voice').length`),0);
        checks.push({sameInputSameCoreState:true,sameWorld:true,generationHoldsClock:true,comparisonInnerVoiceHidden:true,regularInnerVoicePreserved:true,noGeneratedKnowledge:true});
        await js(`document.querySelector('.chat-form textarea').value='editing';window.dispatchEvent(new Event('beforeunload'));void 0`);
        const typingBefore=structuredClone(snapshots.gemini.world);
        const typingFrames=await js(`(()=>{const frames=[];for(let i=0;i<8;i++){window.__step(1);frames.push(aiPet.frameIndex);}window.dispatchEvent(new Event('beforeunload'));return frames;})()`);
        assert.ok(new Set(typingFrames).size>1,'sprite advances while editing');
        assert.deepEqual(snapshots.gemini.world,typingBefore);
        await js(`document.querySelector('.chat-form textarea').value='';void 0`);
        checks.push({animationContinuesWhileTypingAndGenerating:true,worldHeldWhileTyping:true,selfContextSentWithoutRestoredExperiences:true});
        assert.ok(await js(`[...document.querySelectorAll('.conversation-help')].some(e=>e.textContent===GameI18n.translate('聞いたことはノートに残しました。行動につながる理解には、まだ分からない部分があります。'))`));
        assert.equal(await js(`[...document.querySelectorAll('.conversation-help')].some(e=>e.textContent===GameI18n.translate('今回の声かけは、まだ十分には伝わっていません。短く言い換えたり、指さしてから話しかけたりしてみてください。'))`),false);
        checks.push({comparisonSeparatesConversationFromActionLearning:true,regularGuidancePreserved:true});
        await js(`document.querySelector('[aria-controls="notebook"]').click();void 0`);
        assert.ok(await js(`document.querySelector('#notebook').textContent.includes('月について教えて')`));
        for (const width of [1280,390]) {
            window.setContentSize(width,900); await sleep(80);
            assert.equal(await js(`document.documentElement.scrollWidth<=innerWidth+1`),true);
            fs.writeFileSync(path.join(directory,'notebook-'+width+'.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
        }
        window.destroy(); await load('gemini'); await submit('REMEMBER');
        await wait(`document.querySelector('.stage .bubble').textContent==='MEMORY_RECALLED'`,'memory after restart');
        assert.ok(packets.at(-1).memories.some(e=>e.text==='月について教えて'));assert.equal(packets.at(-1).recent.length,0);
        checks.push({originalNotesVisible:true,memoryRestoredBeforeReply:true,recentHistoryCleared:true});
        await js(`document.querySelector('#word-voice-choose').click();const v=document.querySelector('#word-dialogue-voice');v.selectedIndex=1;v.dispatchEvent(new Event('change'));
            for(const [name,value] of [['pitch','1.2'],['rate','.8']]){const e=document.querySelector('#word-voice-'+name);e.value=value;e.dispatchEvent(new Event('input'));}
            document.querySelector('#word-voice-continue').click();document.querySelector('#word-read-aloud').checked=true;document.querySelector('#word-read-aloud').dispatchEvent(new Event('change'));void 0`);
        await submit('SECOND');await wait(`window.__spoken.some(x=>x.text==='SELECTED_VOICE_REPLY')`,'selected child speech');
        const said=await js(`window.__spoken.find(x=>x.text==='SELECTED_VOICE_REPLY')`);assert.equal(said.voice,'ja-JP-1');assert.equal(said.pitch,1.2);assert.equal(said.rate,.8);
        checks.push({generatedDialogueUsesSelectedVoice:said});
        // Keep the stop in the same renderer task, before any asynchronous result can arrive.
        await js(submitCode('TO_CANCEL')+`document.querySelector('#word-voice-stop').click();void 0`);
        await sleep(400);assert.equal(await js(`document.querySelector('.stage .bubble').textContent==='STALE_REPLY'`),false);
        assert.equal(await js(`document.querySelector('.stage .bubble').hidden`),true);
        assert.ok(cancelled.includes(packets.find(x=>x.input==='TO_CANCEL').id));
        await js(submitCode('TO_CANCEL newer input')+submitCode('SECOND newer')+'void 0');await wait(`document.querySelector('.stage .bubble').textContent==='SELECTED_VOICE_REPLY'`,'newer reply');
        assert.ok(cancelled.includes(packets.find(x=>x.input==='TO_CANCEL newer input').id));
        checks.push({stopCancelsGeneration:true,newInputCancelsOldGeneration:true});
        await js(submitCode('TO_CANCEL composition')+`document.querySelector('.chat-form textarea').dispatchEvent(new CompositionEvent('compositionstart'));void 0`);
        await sleep(100);
        assert.ok(cancelled.includes(packets.find(x=>x.input==='TO_CANCEL composition').id));
        assert.equal(await js(`document.querySelector('.stage .bubble').hidden`),true);
        await js(`document.querySelector('.chat-form textarea').dispatchEvent(new CompositionEvent('compositionend'));void 0`);
        checks.push({compositionCancelsPendingDialogue:true});
        const layouts=[];
        for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'])for(const width of [1280,390]){
            window.setContentSize(width,900);await js(`GameI18n.setLanguage('${locale}');void 0`);await sleep(80);
            await js(`window.__step(1);void 0`);
            if(width===1280){
                await submit('SECOND notice '+locale);await wait(`document.querySelector('.stage .bubble').textContent==='SELECTED_VOICE_REPLY'`,'localized reply and guidance');
                assert.equal(await js(`[...document.querySelectorAll('.conversation-help')].at(-1).textContent===GameI18n.translate('聞いたことはノートに残しました。行動につながる理解には、まだ分からない部分があります。')`),true);
            }
            const status=await js(`document.querySelector('#word-reply-status').textContent`);assert.doesNotMatch(await js(`document.body.innerText`),/Gemini|Antigravity|Google/);if(locale!=='ja')assert.doesNotMatch(status,/[\u3040-\u30ff]/);
            const layout=await js(`({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1;}).slice(0,12).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right}))})`);
            fs.writeFileSync(path.join(directory,'layout-current.json'),JSON.stringify({locale,width,...layout}));
            assert.ok(layout.scroll<=layout.width+1,JSON.stringify({locale,width,...layout}));layouts.push({locale,width,status});
            if(locale==='ja')fs.writeFileSync(path.join(directory,'comparison-'+width+'.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
            if(width===390){
                await submit('QUOTA');await wait(`document.querySelector('#word-reply-status').textContent===GameI18n.translate('契約内の利用枠に達しました。追加クレジットは使わず、今回は通常方式の返答です。枠の回復を待ってください。')`,'localized quota');
                assert.equal(await js(`document.documentElement.scrollWidth<=innerWidth+1`),true);
                layouts.at(-1).quota=await js(`document.querySelector('#word-reply-status').textContent`);
            }
        }
        checks.push({sevenLocalesTwoWidths:layouts});
        await js(`GameI18n.setLanguage('ja');void 0`);await submit('UNSUPPORTED');
        await wait(`document.querySelector('#word-reply-status').textContent===GameI18n.translate('お話の接続方式が利用できません。今回はいつもの返答です。接続版の更新が必要です。')`,'unsupported client');checks.push({unsupportedClientExplicit:true});
        responder.dispose();responder=require('./gemini_reply').createResponder(path.join(directory,'logged-out'));
        await js(`GameI18n.setLanguage('ja');void 0`);await submit('login missing');
        await wait(`document.querySelector('#word-reply-status').textContent===GameI18n.translate('お話の接続準備が必要です。起動手順を確認してください。今回はいつもの返答です。')`,'missing login notice');
        assert.ok(await js(`!document.querySelector('.stage .bubble').hidden`));checks.push({missingLoginExplicitNativeFallback:true});
        window.destroy();responder.dispose();responder=require('./gemini_reply').createResponder(path.join(directory,'gemini'),{entry:fixture,skipAuthCheck:true});
        await load('gemini');await submit('SECOND body capture');
        await wait(`document.querySelector('.stage .bubble').textContent==='SELECTED_VOICE_REPLY'`,'body capture');
        await js(`ExperimentalWordWorld.approach(window.__world,'shade');for(let i=0;i<800&&window.__world.mode!=='rest';i++)window.__step(1);void 0`);
        assert.equal(await js(`window.__world.mode`),'rest');await submit('REST how are you?');
        await wait(`document.querySelector('.stage .bubble').textContent==='RESTING_REPLY'`,'actual current resting context');
        assert.equal(packets.at(-1).selfState.activity,'rest');
        const initiativeBefore=packets.filter(p=>p.kind==='initiative').length;
        // Keep this synthetic individual resting through real approach/tick calls, avoiding unrelated encounter films.
        const advance=`for(let i=0;i<1500;i++){const w=window.__world;if(w.mode!=='rest'&&w.mode!=='move')ExperimentalWordWorld.approach(w,'shade');window.__step(1);}`;
        await js(advance+'void 0');await wait(`document.querySelector('.stage .bubble').textContent==='INITIATIVE_REPLY'`,'experience initiated dialogue');
        const initiated=packets.filter(p=>p.kind==='initiative');assert.equal(initiated.length,initiativeBefore+1);
        assert.equal(initiated.at(-1).input,'');assert.ok(initiated.at(-1).selfState.recent.some(e=>e.activity==='rest'&&e.fatigueChange<0));
        assert.ok(!JSON.stringify(initiated.at(-1).selfState).includes('shade'));
        await js(advance+'void 0');await sleep(80);
        assert.equal(packets.filter(p=>p.kind==='initiative').length,initiativeBefore+1,'no unanswered follow-up');
        await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.ok(!snapshots.gemini.state.replyMemory.entries.some(e=>e.raw==='INITIATIVE_REPLY'||e.raw===''));
        assert.equal(Object.hasOwn(snapshots.gemini.state,'selfState'),false);
        checks.push({actualRestContext:true,experienceInitiatesConversation:true,noUnansweredFollowup:true,noSyntheticPlayerMemory:true});
        const writesBeforeText = audioWrites;
        await load('gemini', true);
        assert.equal(await js(`wordReply.textOnly`),true);
        assert.equal(await js(`document.querySelector('#word-read-aloud').disabled && !document.querySelector('#word-read-aloud').checked`),true);
        await submit('TO_CANCEL text only pending');
        const waitingClock = packets.at(-1).selfState;
        await js(`window.__liveFrames=0;window.requestAnimationFrame=fn=>window.__realRAF(t=>{window.__liveFrames++;fn(t);});for(const fn of window.__frames.splice(0))requestAnimationFrame(fn);void 0`);
        await sleep(1200);
        await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.equal(snapshots.gemini.world.fatigue,waitingClock.fatigue);
        assert.equal(snapshots.gemini.world.hunger,waitingClock.hunger);
        await wait(`document.querySelector('.stage .bubble').textContent==='STALE_REPLY'`,'text-only reply');
        await js(`document.querySelector('.chat-form textarea').value='typing during live animation';void 0`);
        const liveStart = await js(`({elapsed:window.__world?.elapsed,frame:aiPet.frameIndex})`);
        await sleep(15000);
        const live = await js(`({elapsed:window.__world?.elapsed,frames:window.__liveFrames,spoken:window.__spoken.length})`);
        fs.writeFileSync(path.join(directory,'text-only-live-observed.json'),JSON.stringify({liveStart,live},null,2));
        assert.ok(live.frames>30,'real animation callbacks continue');
        assert.equal(live.elapsed,liveStart.elapsed);assert.equal(live.spoken,0);
        assert.equal(audioWrites,writesBeforeText,'saved audio preferences remain untouched');
        fs.writeFileSync(path.join(directory,'text-only-live-metrics.json'),JSON.stringify({live,processes:app.getAppMetrics().map(p=>({type:p.type,memory:p.memory,cpu:p.cpu}))},null,2));
        await window.capturePage().then(img=>fs.writeFileSync(path.join(directory,'text-only-1280.png'),img.toPNG()));
        checks.push({textOnlyVoiceDisabled:true,textOnlyReply:true,realAnimationCallbacks:live.frames,typingHeldDuringRealAnimation:true});
        assert.ok(preparations>2 && resets>0);
        await js(`window.dispatchEvent(new Event('pagehide'));void 0`);
        await sleep(50);
        checks.push({singleUsePrestartIPC:true,lifecycleResetIPC:true});
        assert.deepEqual(errors,[]);const result={ok:true,directory,checks,errors,packets:packets.map(x=>({id:x.id,locale:x.locale,recent:x.recent.length,memories:x.memories.length}))};
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(result,null,2));
        console.log(JSON.stringify({ok:true,directory,checks:checks.length}));
    }).catch(error=>{fs.writeFileSync(path.join(directory,'failure.txt'),String(error.stack)+'\n'+JSON.stringify(errors));console.error(error);process.exitCode=1;}).finally(()=>{
        clearTimeout(watchdog);
        responder?.dispose();for(const item of windows)if(!item.isDestroyed())item.destroy();server?.closeAllConnections();server?.close();app.exit(process.exitCode||0);
    });
}
