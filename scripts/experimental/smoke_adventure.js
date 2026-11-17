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
    let window,server,snapshot;const errors=[];
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const store=require('./storage').createStore(directory);
    const checkpointAt=process.argv.indexOf('--checkpoint');
    const layoutOnly=process.argv.includes('--layout');
    const normalMode=process.argv.includes('--normal');
    const inputCheck=process.argv.includes('--input-check');
    fs.writeFileSync(path.join(directory,'configuration.json'),JSON.stringify({layoutOnly,normalMode,inputCheck,checkpoint:checkpointAt>=0?process.argv[checkpointAt+1]:null},null,2));
    if(checkpointAt>=0){
        const file=path.resolve(process.argv[checkpointAt+1]),root=path.resolve(__dirname,'../../docs/.local-history/verification-runs')+path.sep;
        assert.ok(file.startsWith(root)&&path.basename(file)==='word-life.json'&&path.basename(path.dirname(file)).startsWith('adventure-renderer-'),'only this smoke tool’s prior real temporary snapshots');
        const value=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(value.state.adventure.mastery.stage,4);assert.equal(value.state.adventure.building.bridge,true);
        assert.equal(store.save(value).ok,true);fs.writeFileSync(path.join(directory,'checkpoint.json'),JSON.stringify({file,hash:require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
    }
    app.whenReady().then(async()=>{
        ipcMain.on('word-life-load',e=>{e.returnValue=store.load();});
        ipcMain.on('word-life-save',(e,v)=>{const result=store.save(v);if(result.ok)snapshot=v;else errors.push('invalid-save');e.returnValue=result;});
        ipcMain.handle('word-voice-cache-get',()=>({ok:false}));ipcMain.handle('word-voice-cache-put',()=>({ok:false}));
        server=require('./serve').createServer();
        const serve=server.listeners('request')[0];server.removeAllListeners('request');
        server.on('request',(request,response)=>{
            if(request.url==='/experimental_word_voice.js') {
                response.writeHead(200,{'Content-Type':'application/javascript'});
                response.end(fs.readFileSync(path.resolve(__dirname,'../../experimental_word_voice.js'),'utf8')+`
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
                await js(`if(document.querySelector('#word-master-dialog[open]'))document.querySelector('#word-master-dialog').close();void 0`);
                if(await predicate())return;
                await sleep(30);
            }
            const ui=await js(`({hidden:document.hidden,paused:document.querySelector('#word-pause')?.getAttribute('aria-pressed'),draft:document.querySelector('.chat-form textarea')?.value,auto:document.querySelector('#word-auto-toggle')?.getAttribute('aria-pressed'),status:document.querySelector('#word-auto-status')?.textContent,preview:document.querySelector('#word-auto-preview')?.textContent,dialogs:[...document.querySelectorAll('dialog[open]')].map(x=>x.id),screen:document.querySelector('#app')?.className})`);
            throw Error(label+' timeout '+JSON.stringify({elapsedMs:Date.now()-start,unchangedMs:Date.now()-changed,ui,task:snapshot?.state?.adventure?.connection?.task,mode:snapshot?.world?.mode,body:{hunger:snapshot?.world?.hunger,fatigue:snapshot?.world?.fatigue},run:snapshot?.state?.adventure?.run,errors}));
        }
        async function submit(text){await js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)};document.querySelector('.chat-form').requestSubmit();void 0`);}
        await window.loadURL(url);await clock();
        await wait(()=>js(`!!document.querySelector('#word-new-game:not(:disabled)')`),'ready');
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
        if(!layoutOnly) {
            await js(`for(const axis of ['life','conversation','exploration']){const slider=document.querySelector('#word-auto-'+axis);slider.value=axis==='exploration'?'3':'0';slider.dispatchEvent(new Event('input'));}document.querySelector('#word-auto-toggle').click();void 0`);
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
            fs.writeFileSync(path.join(directory,'lesson-voice-scenes.json'),JSON.stringify(scenes,null,2));
            fs.writeFileSync(path.join(directory,'lesson-dialogue.txt'),lessonDialogue);
            fs.writeFileSync(path.join(directory,'lesson-dialogue.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
            await wait(()=>snapshot?.state.adventure.building.bridge,'actual bridge construction');console.log('bridge complete');
            await wait(()=>snapshot?.state.adventure.training.completed,'five-floor mentor training');console.log('training complete');
            assert.ok(snapshot.state.adventure.connection.receipts.some(r=>r.input.speaker==='master:explore'),'original mentor speech paired with real actions');
            await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase exploration');
            await wait(()=>snapshot?.state.adventure.events.some(e=>e.kind==='return'&&!e.training&&e.reason==='walked_out'),'omakase walked return');console.log('walked return');
            await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase reentry');
            assert.ok(await js(`document.querySelector('.scene-controls select')?.parentElement.hidden`),'island debug navigation is hidden inside the actual dungeon');
            await js(`document.querySelector('#word-auto-toggle').click();document.querySelector('#word-pause').click();window.dispatchEvent(new Event('beforeunload'));void 0`);
        }
        assert.ok(snapshot.state.adventure.run);const retained=JSON.stringify(snapshot.state.adventure.run);
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
        const summary=layoutOnly ? {ok:true,errors,layoutOnly:true,normalMode,inputCheck,sameFloorStopped:true,locales:7,viewports:2}
            : {ok:true,errors,fresh:checkpointAt<0,mastery:4,bridge:true,training:true,omakase:true,walkedReturn:true,sameFloorStopped:true,locales:7};
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2));
        console.log(JSON.stringify({ok:true,directory}));
    }).catch(e=>{fs.writeFileSync(path.join(directory,'failure.txt'),String(e.stack));console.error(e);process.exitCode=1;}).finally(()=>{
        if(window)window.destroy();if(server){server.closeAllConnections();server.close();}app.exit(process.exitCode||0);
    });
}
