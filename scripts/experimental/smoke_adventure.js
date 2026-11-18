'use strict';
// Dedicated hidden Electron profile. Never reads or writes the player's save.
const fs = require('node:fs');
const path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename,...process.argv.slice(2)],{env,stdio:'inherit',windowsHide:true});
    child.on('exit',code=>{process.exitCode=code||0;});
} else {
    const assert=require('node:assert/strict');
    const {app,BrowserWindow,ipcMain}=require('electron');
    app.disableHardwareAcceleration();
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/adventure-renderer-'));
    app.setPath('userData',path.join(directory,'profile'));
    let window,server,snapshot,inspectedQuestWindow=false;const errors=[],questWindows=[];
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const store=require('./storage').createStore(directory);
    const checkpointAt=process.argv.indexOf('--checkpoint');
    const layoutOnly=process.argv.includes('--layout');
    const normalMode=process.argv.includes('--normal');
    const inputCheck=process.argv.includes('--input-check');
    const speechCheck=process.argv.includes('--speech-check');
    const pcm=Buffer.alloc(44+24000*3*2);
    pcm.write('RIFF');pcm.writeUInt32LE(pcm.length-8,4);pcm.write('WAVEfmt ',8);pcm.writeUInt32LE(16,16);
    pcm.writeUInt16LE(1,20);pcm.writeUInt16LE(1,22);pcm.writeUInt32LE(24000,24);pcm.writeUInt32LE(48000,28);
    pcm.writeUInt16LE(2,32);pcm.writeUInt16LE(16,34);pcm.write('data',36);pcm.writeUInt32LE(pcm.length-44,40);
    for(let i=0;i<72000;i++)pcm.writeInt16LE(Math.round(1200*Math.sin(i*2*Math.PI*440/24000)),44+i*2);
    fs.writeFileSync(path.join(directory,'configuration.json'),JSON.stringify({layoutOnly,normalMode,inputCheck,checkpoint:checkpointAt>=0?process.argv[checkpointAt+1]:null},null,2));
    if(checkpointAt>=0){
        const file=path.resolve(process.argv[checkpointAt+1]),root=path.resolve(__dirname,'../../docs/.local-history/verification-runs')+path.sep;
        assert.ok(file.startsWith(root)&&path.basename(file)==='word-life.json'&&path.basename(path.dirname(file)).startsWith('adventure-renderer-'),'only this smoke tool’s prior real temporary snapshots');
        const value=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(value.state.adventure.mastery.stage,4);assert.equal(value.state.adventure.building.bridge,true);
        assert.equal(store.save(value).ok,true);fs.writeFileSync(path.join(directory,'checkpoint.json'),JSON.stringify({file,hash:require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
    }
    app.whenReady().then(async()=>{
        const preferences=require('./audio_preferences').createAudioPreferences(directory);
        ipcMain.on('word-audio-preferences-load',e=>{e.returnValue=preferences.load();});
        ipcMain.on('word-audio-preferences-save',(e,v)=>{e.returnValue=preferences.save(v);});
        ipcMain.on('word-life-load',e=>{e.returnValue=store.load();});
        ipcMain.on('word-life-save',(e,v)=>{const result=store.save(v);if(result.ok)snapshot=v;else {
            errors.push('invalid-save');
            if(!fs.existsSync(path.join(directory,'rejected-save.json')))fs.writeFileSync(path.join(directory,'rejected-save.json'),JSON.stringify({result,value:v}));
        }e.returnValue=result;});
        ipcMain.handle('word-voice-cache-get',()=>({ok:false}));ipcMain.handle('word-voice-cache-put',()=>({ok:false}));
        server=require('./serve').createServer();
        const serve=server.listeners('request')[0];server.removeAllListeners('request');
        server.on('request',(request,response)=>{
            if(speechCheck && request.url.startsWith('/__adventure_voice/')) {
                if(request.url.startsWith('/__adventure_voice/synthesis')) {
                    request.resume();request.on('end',()=>setTimeout(()=>{response.writeHead(200,{'Content-Type':'audio/wav'});response.end(pcm);},300));
                } else {
                    response.writeHead(200,{'Content-Type':'application/json'});
                    response.end(JSON.stringify(request.url.startsWith('/__adventure_voice/speakers')
                        ? [{name:'Child fixture',speaker_uuid:'inner-child-fixture',styles:[{id:0,name:'Normal',type:'talk'}]},
                            ...Object.values(require('../../experimental_word_voice').cast).map(p=>({name:p.credit,speaker_uuid:p.speaker,styles:[{id:p.styleId,name:'Normal',type:'talk'}]}))]
                        : {accent_phrases:[],speedScale:1,pitchScale:0,volumeScale:1}));
                }
            } else if(request.url==='/experimental_word_voice.js') {
                response.writeHead(200,{'Content-Type':'application/javascript'});
                response.end(`(()=>{const NativeImage=Image;window.__dungeonImages=[];window.Image=class extends NativeImage{constructor(...args){super(...args);window.__dungeonImages.push(this);}};})();`+(speechCheck?`(()=>{const originalFetch=window.fetch.bind(window);window.fetch=(url,init)=>originalFetch(typeof url==='string'&&url.startsWith('http://127.0.0.1:50021/')?'/__adventure_voice'+new URL(url).pathname+new URL(url).search:url,init);
                    window.__playback=[];const Native=window.AudioContext;window.AudioContext=class extends Native{createBufferSource(){const s=super.createBufferSource(),start=s.start.bind(s);s.start=(...args)=>{window.__playback.push({kind:'start',time:performance.now()});s.addEventListener('ended',()=>window.__playback.push({kind:'end',time:performance.now()}));return start(...args);};return s;}};})();`:'')+fs.readFileSync(path.resolve(__dirname,'../../experimental_word_voice.js'),'utf8')+`
                    (()=>{window.__adventureScenes=[];const create=ExperimentalWordVoice.create;
                    ExperimentalWordVoice.create=(...args)=>{const voice=create(...args),scene=voice.speakScene;
                    voice.speakScene=(lines,...rest)=>{window.__adventureScenes.push(structuredClone(lines));return scene(lines,...rest);};return voice;};})();`);
            } else serve(request,response);
        });
        await new Promise(r=>server.listen(0,'127.0.0.1',r));
        const url=`http://127.0.0.1:${server.address().port}/experimental_word_island.html${normalMode?'':'?debug=1'}`;
        window=new BrowserWindow({show:false,width:1280,height:900,webPreferences:{contextIsolation:true,sandbox:true,nodeIntegration:false,backgroundThrottling:false,preload:path.join(__dirname,'preload.js')}});
        window.webContents.on('console-message',(_e,level,message)=>{if(level>=3)errors.push(message);});
        const js=code=>window.webContents.executeJavaScript(code,true);
        // Drive real renderer frames in bounded batches. Each actual game tick
        // still receives .1s, including its original movement, UI and save path.
        async function clock(){await js(`window.testTime=performance.now();window.testFrame=null;window.requestAnimationFrame=cb=>{window.testFrame=cb;return 0;};void 0`);}
        async function frames(count=40){await js(`for(let i=0;i<${count}&&window.testFrame;i++){const frame=window.testFrame;window.testFrame=null;window.testTime+=100;frame(window.testTime);}void 0`);}
        async function wait(predicate,label){
            const start=Date.now();let changed=Date.now(),serial=-1;
            while(Date.now()-start<720000 && Date.now()-changed<90000){
                await frames();
                if(snapshot?.world.elapsed!==serial){serial=snapshot?.world.elapsed;changed=Date.now();}
                const dialogue=await js(`(()=>{const d=document.querySelector('#word-master-dialog[open]');return d?{phase:d.dataset.phase,text:d.querySelector('#word-master-text')?.textContent,thought:d.querySelector('.word-master-thought')?.textContent}:null;})()`);
                // Skip only the existing introduction movie through its own control.
                // Quest conversations must finish through the actual omakase timer.
                if(dialogue && ['loading','video'].includes(dialogue.phase))await js(`document.querySelector('#word-master-skip').click();void 0`);
                if(dialogue?.phase==='conversation' && dialogue.text && !questWindows.some(d=>d.text===dialogue.text)) {
                    questWindows.push(dialogue);
                    fs.writeFileSync(path.join(directory,'master-windows.json'),JSON.stringify(questWindows,null,2));
                    if(dialogue.text.includes('課題①') && !inspectedQuestWindow) {
                        inspectedQuestWindow=true;
                        await js(`document.querySelector('#word-auto-toggle').click();window.dispatchEvent(new Event('beforeunload'));void 0`);
                        const elapsed=snapshot.world.elapsed, layouts=[];
                        for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'])for(const width of [1280,390]) {
                            window.setSize(width,900);
                            await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`);
                            await sleep(160);await frames(2);await sleep(100);
                            const layout=await js(`(()=>{const d=document.querySelector('#word-master-dialog'),r=d.getBoundingClientRect();return {open:d.open,phase:d.dataset.phase,text:document.querySelector('#word-master-text').textContent,left:r.left,right:r.right,width:innerWidth,overflow:d.scrollWidth-d.clientWidth};})()`);
                            assert.equal(layout.open,true);assert.equal(layout.phase,'conversation');assert.ok(layout.text.length>20);
                            assert.ok(layout.left>=0&&layout.right<=layout.width+1&&layout.overflow<=2,JSON.stringify(layout));
                            layouts.push({locale,width,...layout});
                            if(locale==='ja')fs.writeFileSync(path.join(directory,'quest-window-'+width+'.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
                        }
                        await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
                        assert.equal(snapshot.world.elapsed,elapsed,'actual island clock holds during the quest window');
                        fs.writeFileSync(path.join(directory,'quest-window-layouts.json'),JSON.stringify(layouts,null,2));
                        window.setSize(1280,900);await js(`GameI18n.setLanguage('ja');document.querySelector('#word-auto-toggle').click();void 0`);
                    }
                }
                if(await predicate())return;
                await sleep(30);
            }
            const ui=await js(`({hidden:document.hidden,paused:document.querySelector('#word-pause')?.getAttribute('aria-pressed'),draft:document.querySelector('.chat-form textarea')?.value,auto:document.querySelector('#word-auto-toggle')?.getAttribute('aria-pressed'),status:document.querySelector('#word-auto-status')?.textContent,preview:document.querySelector('#word-auto-preview')?.textContent,dialogs:[...document.querySelectorAll('dialog[open]')].map(x=>x.id),screen:document.querySelector('#app')?.className})`);
            throw Error(label+' timeout '+JSON.stringify({elapsedMs:Date.now()-start,unchangedMs:Date.now()-changed,ui,task:snapshot?.state?.adventure?.connection?.task,mode:snapshot?.world?.mode,body:{hunger:snapshot?.world?.hunger,fatigue:snapshot?.world?.fatigue},run:snapshot?.state?.adventure?.run,errors}));
        }
        async function submit(text){await js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)};document.querySelector('.chat-form').requestSubmit();void 0`);}
        await window.loadURL(url);await clock();
        await wait(()=>js(`!!document.querySelector('#word-new-game:not(:disabled)')`),'ready');
        assert.equal(await js(`document.querySelector('#word-read-aloud').checked`),true,'new app preference defaults on');
        await js(`document.querySelector('#word-read-aloud').click();void 0`);
        if(checkpointAt>=0)await js(`document.querySelector('.word-logo').click();document.querySelector('#word-continue').click();${layoutOnly?'':"document.querySelector('#word-pause').click();"}void 0`);
        else await js(`document.querySelector('.word-logo').click();document.querySelector('#word-new-game').click();document.querySelector('#word-reset-accept').click();document.querySelector('main form').requestSubmit();void 0`);
        await wait(()=>!!snapshot?.state?.adventure,'start');
        assert.equal(await js(`document.querySelectorAll('#word-adventure, #adventure-command, #adventure-inventory, [id^="adventure-"]').length`),0,'no dedicated adventure controls');
        if(normalMode)assert.ok(await js(`document.querySelector('.scene-controls select')?.parentElement.hidden`),'normal play hides the pre-existing debug navigation controls');
        if(inputCheck) {
            assert.ok(layoutOnly && snapshot.state.adventure.run && !snapshot.state.adventure.run.training);
            await js(`GameI18n.setLanguage('ja');void 0`);
            await js(`document.querySelector('#word-pause').click();void 0`);
            await submit('自分で歩いてみて');assert.equal(snapshot.state.adventure.connection.goal.action,'explore');
            const inputId=snapshot.state.adventure.connection.goal.input.id;await frames(26);
            await submit('止まって');assert.equal(snapshot.state.adventure.connection.goal,undefined);
            const turn=snapshot.state.adventure.run.turn;await frames(40);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,turn);assert.ok(snapshot.state.adventure.events.some(e=>e.kind==='action'&&e.inputId===inputId),'continuation retains the understood original input');
            await submit('休んでね');assert.equal(snapshot.world.destination,null);assert.equal(snapshot.world.mode,'idle','island care cannot run off-screen');
            await submit('散歩しよう');assert.equal(snapshot.state.adventure.connection.goal.action,'explore');await frames(26);
            await submit('おはよう');assert.equal(snapshot.state.adventure.connection.goal,undefined);
            const conversationTurn=snapshot.state.adventure.run.turn;await frames(30);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);assert.equal(snapshot.state.adventure.run.turn,conversationTurn,'conversation interrupts automatic walking');
            await js(`document.querySelector('#word-pause').click();void 0`);
        }
        if(speechCheck) {
            assert.ok(layoutOnly && snapshot.state.adventure.run && !snapshot.state.adventure.run.training);
            await js(`GameI18n.setLanguage('ja');document.querySelector('#word-voice-choose').click();
                document.querySelector('#word-voice-source').value='voicevox';document.querySelector('#word-voice-source').dispatchEvent(new Event('change'));
                document.querySelector('#word-voice-connect').click();void 0`);
            const connected=Date.now();while(!await js(`Array.from(document.querySelector('#word-dialogue-voice').options).some(o=>!o.disabled&&o.value.includes('inner-child-fixture'))`)){assert.ok(Date.now()-connected<15000);await sleep(30);}
            await js(`document.querySelector('#word-dialogue-voice').selectedIndex=0;document.querySelector('#word-dialogue-voice').dispatchEvent(new Event('change'));document.querySelector('#word-voice-continue').click();void 0`);
            assert.ok(await js(`wordStorage.loadAudioPreferences().value.audioProfiles.ja.voices.voicevox.robot.includes('inner-child-fixture')`));
            await js(`GameI18n.setLanguage('ja');document.querySelector('#word-read-aloud').checked=true;document.querySelector('#word-read-aloud').dispatchEvent(new Event('change'));document.querySelector('#word-pause').click();void 0`);
            await submit('自分で歩いてみて');
            assert.equal(snapshot.state.adventure.connection.goal.action,'explore');
            const initialTurn=snapshot.state.adventure.run.turn;
            const started=Date.now();while(!await js(`window.__playback.some(e=>e.kind==='start')`)){assert.ok(Date.now()-started<15000);await sleep(50);}
            await frames(100);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,initialTurn,'initial spoken reply holds exploration');
            await sleep(3400);await frames(100);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,initialTurn,'reply after the inner voice also holds exploration');
            const bothEnded=Date.now();while(!await js(`window.__playback.filter(e=>e.kind==='end').length>=2`)){assert.ok(Date.now()-bothEnded<15000);await sleep(50);}
            await sleep(50);await frames(13);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,initialTurn+1,'one physical action after the full reply');
            const reportStart=Date.now();while(!await js(`window.__playback.filter(e=>e.kind==='start').length>=3`)){assert.ok(Date.now()-reportStart<15000,'action report begins playback');await sleep(50);}
            await frames(100);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,initialTurn+1,'action report holds the next turn throughout real three-second WebAudio');
            fs.writeFileSync(path.join(directory,'speech-wait.json'),JSON.stringify({initialTurn,heldTurn:snapshot.state.adventure.run.turn,playback:await js(`window.__playback`),scenes:await js(`window.__adventureScenes`),innerVoiceThenReply:true,syntheticPCM:true},null,2));
            await submit('おはよう');const interruptedTurn=snapshot.state.adventure.run.turn;
            await sleep(3500);await frames(100);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.run.turn,interruptedTurn,'manual conversation cancels the old action continuation');
            await js(`document.querySelector('#word-read-aloud').checked=false;document.querySelector('#word-read-aloud').dispatchEvent(new Event('change'));document.querySelector('#word-pause').click();void 0`);
        }
        if(!layoutOnly) {
            await js(`for(const axis of ['life','conversation','exploration']){const slider=document.querySelector('#word-auto-'+axis);slider.value=axis==='exploration'?'3':'0';slider.dispatchEvent(new Event('input'));}document.querySelector('#word-auto-toggle').click();void 0`);
            if(checkpointAt<0) {
            await wait(()=>snapshot?.state.adventure.mastery.stage===4,'actual mentor lessons');console.log('mastery complete');
            const lessonDialogue=await js(`document.querySelector('#conversation').textContent`);
            for(const number of ['①','②','③'])assert.ok(lessonDialogue.includes('課題'+number),'visible lesson '+number);
            assert.ok(lessonDialogue.includes('最後の課題も修了'),'mentor confirms the actual final lesson');
            assert.ok(lessonDialogue.includes(snapshot.state.settings.speech==='short'?'木材を見つけたよ':'木材を見つけ、実際に手に取った'),'actual gathered material is named');
            assert.ok(!lessonDialogue.includes('{item}'),'all event placeholders are resolved');
            const scenes=await js(`window.__adventureScenes`);
            const review=scenes.find(lines=>lines.some(l=>l.text.includes('最後の課題も修了')));
            assert.ok(review,'actual UI produces the final mentor dialogue');
            assert.equal(review.at(-1).role,'master');
            assert.equal(review[0].role,snapshot.state.settings.speech==='short'?'dialogue':'narration');
            assert.ok(questWindows.some(d=>d.text.includes('課題①')),'first quest opens the existing conversation window');
            assert.ok(questWindows.some(d=>d.text.includes('最後の課題も修了')),'actual review opens the window and omakase continues');
            fs.writeFileSync(path.join(directory,'lesson-voice-scenes.json'),JSON.stringify(scenes,null,2));
            fs.writeFileSync(path.join(directory,'lesson-dialogue.txt'),lessonDialogue);
            fs.writeFileSync(path.join(directory,'lesson-dialogue.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
            await wait(()=>snapshot?.state.adventure.building.bridge,'actual bridge construction');console.log('bridge complete');
            const bridgeVisual=await js(`(()=>{const b=Object.values(assets).filter(a=>a.type==='bridge');return {count:b.length,original:b.every(a=>['img','sx','sy','sw','sh','scale'].every(k=>a[k]===defaultCatalog.bridge[k]))};})()`);
            assert.ok(bridgeVisual.count>0 && bridgeVisual.original,'original bridge chip is in the shared island scene');
            fs.writeFileSync(path.join(directory,'bridge-visual.json'),JSON.stringify(bridgeVisual));
            await wait(()=>snapshot?.state.adventure.training.completed,'five-floor mentor training');console.log('training complete');
            assert.ok(snapshot.state.adventure.connection.receipts.some(r=>r.input.speaker==='master:explore'),'original mentor speech paired with real actions');
            } else assert.ok(snapshot.state.adventure.training.completed,'resume the actual trained temporary checkpoint without granting milestones');
            await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase exploration');
            await wait(()=>snapshot?.state.adventure.events.some(e=>e.kind==='return'&&!e.training&&e.reason==='walked_out'),'omakase walked return');console.log('walked return');
            await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase reentry');
            assert.ok(await js(`document.querySelector('.scene-controls select')?.parentElement.hidden`),'island debug navigation is hidden inside the actual dungeon');
            await js(`document.querySelector('#word-auto-toggle').click();document.querySelector('#word-pause').click();window.dispatchEvent(new Event('beforeunload'));void 0`);
        }
        assert.ok(snapshot.state.adventure.run);const retained=JSON.stringify(snapshot.state.adventure.run);
        const imagesStart=Date.now();while(!await js(`window.__dungeonImages.filter(i=>i.src.includes('dungeon')).every(i=>i.complete&&i.naturalWidth)`)){assert.ok(Date.now()-imagesStart<20000,'dungeon PNG decode completes');await sleep(80);}
        await frames(2);
        const dungeonPng=await js(`document.querySelector('#gameCanvas').toDataURL('image/png').split(',')[1]`);
        fs.writeFileSync(path.join(directory,'original-dungeon-canvas.png'),Buffer.from(dungeonPng,'base64'));
        fs.writeFileSync(path.join(directory,'dungeon-images.json'),JSON.stringify(await js(`window.__dungeonImages.filter(i=>i.src.includes('dungeon')).map(i=>({src:i.src,complete:i.complete,width:i.naturalWidth,height:i.naturalHeight}))`),null,2));
        // Inspect the actual retained island scene without moving the actor or
        // changing its save. Read canvas pixels synchronously, avoiding a stale
        // compositor screenshot when the accelerated fixture clock is held.
        const bridgePng=await js(`(()=>{const b=Object.values(assets).find(a=>a.type==='bridge');if(!b)return null;const previous={...camera};camera.x=b.dx+b.sw*b.scale/2-400;camera.y=b.dy+b.sh*b.scale/2-240;render();const png=document.querySelector('#gameCanvas').toDataURL('image/png').split(',')[1];Object.assign(camera,previous);return png;})()`);
        assert.ok(bridgePng);fs.writeFileSync(path.join(directory,'original-bridge-canvas.png'),Buffer.from(bridgePng,'base64'));
        const serial=snapshot.state.adventure.serial;
        await js(`document.querySelector('canvas').dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:300,clientY:250}));void 0`);await frames();
        assert.equal(snapshot.state.adventure.serial,serial,'canvas click cannot perform a dungeon action');
        for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'])for(const width of [1280,390]) {
            window.setSize(width,900);await wait(()=>js(`innerWidth<=${width}&&innerWidth>${width-40}`),'resize');
            await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`);await frames();await sleep(150);
            const layout=await js(`(()=>{const t=document.querySelector('.chat-form textarea').getBoundingClientRect();return {chat:t.height,controls:document.querySelectorAll('#word-adventure, [id^="adventure-"]').length,paused:document.querySelector('#word-pause').getAttribute('aria-pressed')};})()`);
            assert.equal(layout.controls,0);assert.equal(layout.paused,'true');assert.ok(layout.chat>=50,JSON.stringify(layout));
            if(locale==='ja')fs.writeFileSync(path.join(directory,'free-input-'+width+'.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
            if(width===390) {
                await js(`document.querySelector('#word-microphone').scrollIntoView({block:'end'});void 0`);await frames();await sleep(120);
                assert.ok(await js(`(()=>{const m=document.querySelector('#word-microphone'),r=m.getBoundingClientRect();return m.checkVisibility()&&r.top>=0&&r.bottom<=innerHeight+1;})()`),'microphone remains reachable');
                await js(`window.scrollTo(0,0);void 0`);
            }
        }
        await window.loadURL(url);await clock();await wait(()=>js(`!!document.querySelector('#word-new-game:not(:disabled)')`),'resume ready');
        await js(`document.querySelector('.word-logo').click();document.querySelector('#word-continue').click();void 0`);
        await wait(()=>js(`document.querySelector('#app').classList.contains('playing')`),'resume');
        await frames(40);await sleep(300);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.equal(JSON.stringify(snapshot.state.adventure.run),retained);
        assert.equal(await js(`document.querySelector('#word-pause').getAttribute('aria-pressed')`),'true');
        assert.deepEqual(errors,[]);
        const summary=layoutOnly ? {ok:true,errors,layoutOnly:true,normalMode,inputCheck,speechCheck,sameFloorStopped:true,locales:7,viewports:2}
            : {ok:true,errors,fresh:checkpointAt<0,mastery:4,bridge:true,training:true,omakase:true,walkedReturn:true,sameFloorStopped:true,locales:7};
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2));
        console.log(JSON.stringify({ok:true,directory}));
    }).catch(async e=>{
        fs.writeFileSync(path.join(directory,'failure.txt'),String(e.stack));
        if(window&&!window.isDestroyed())try{
            const diagnostic=await window.webContents.executeJavaScript(`({playback:window.__playback,scenes:window.__adventureScenes,
                voiceStatus:document.querySelector('#word-voice-status')?.textContent,
                audio:wordStorage.loadAudioPreferences().value?.audioProfiles,thought:document.querySelector('#word-inner-voice-current')?.textContent})`);
            fs.writeFileSync(path.join(directory,'failure-diagnostic.json'),JSON.stringify(diagnostic,null,2));
        }catch(_){}
        console.error(e);process.exitCode=1;
    }).finally(()=>{
        if(window)window.destroy();if(server){server.closeAllConnections();server.close();}app.exit(process.exitCode||0);
    });
}
