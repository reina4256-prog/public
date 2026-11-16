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
        server=require('./serve').createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
        const url=`http://127.0.0.1:${server.address().port}/experimental_word_island.html?debug=1`;
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
                if(snapshot?.state.adventure.serial!==serial){serial=snapshot?.state.adventure.serial;changed=Date.now();}
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
        if(layoutOnly) {
            const retained=JSON.stringify(snapshot.state.adventure.run);
            assert.ok(snapshot.state.adventure.training.completed && snapshot.state.adventure.run);
            const physicalSerial=snapshot.state.adventure.serial;
            const carriedItem=snapshot.state.adventure.items.find(i=>['hand','body','bag'].includes(i.location));
            await js(`document.querySelector('#word-pause').click();document.querySelector('#adventure-inventory').value=${JSON.stringify(carriedItem.id)};document.querySelector('#adventure-pick').click();document.querySelector('#word-pause').click();window.dispatchEvent(new Event('beforeunload'));void 0`);
            assert.equal(snapshot.state.adventure.serial,physicalSerial);assert.equal(JSON.stringify(snapshot.state.adventure.run),retained);
            for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'])for(const width of [1280,390]) {
                window.setSize(width,900);
                await wait(()=>js(`innerWidth<=${width} && innerWidth>${width-40}`),'viewport '+width);
                await js(`GameI18n.setLanguage(${JSON.stringify(locale)});document.querySelector('#word-adventure').open=true;void 0`);
                await frames();await sleep(120);
                const bounds=await js(`(()=>{const p=document.querySelector('#word-adventure'),s=document.querySelector('.stage').getBoundingClientRect(),r=p.getBoundingClientRect(),t=document.querySelector('.chat-form textarea').getBoundingClientRect();return {position:getComputedStyle(p).position,left:r.left,right:r.right,top:r.top,stageBottom:s.bottom,screen:innerWidth,chat:t.height,paused:document.querySelector('#word-pause').getAttribute('aria-pressed')};})()`);
                assert.equal(bounds.position,'static');assert.ok(bounds.top>=bounds.stageBottom-1,JSON.stringify(bounds));
                assert.ok(bounds.left>=0 && bounds.right<=bounds.screen+1 && bounds.chat>=50,JSON.stringify(bounds));assert.equal(bounds.paused,'true');
                if(width===390) {
                    assert.equal(await js(`getComputedStyle(document.querySelector('main.playing')).overflow`),'visible',JSON.stringify(bounds));
                    await js(`document.querySelector('#word-microphone').scrollIntoView({block:'end'});void 0`);await frames();await sleep(250);
                    assert.ok(await js(`(()=>{const m=document.querySelector('#word-microphone'),r=m.getBoundingClientRect();return m.checkVisibility() && r.height>0 && r.top>=0 && r.bottom<=innerHeight+1;})()`));
                    if(locale==='ja')fs.writeFileSync(path.join(directory,'layout-chat-390.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
                    await js(`window.scrollTo(0,0);void 0`);await sleep(80);
                }
                if(locale==='ja')fs.writeFileSync(path.join(directory,'layout-'+width+'.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
            }
            await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);assert.equal(JSON.stringify(snapshot.state.adventure.run),retained);assert.deepEqual(errors,[]);
            fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,layout:true,locales:7,widths:[1280,390],pausedSameFloor:true,rejectedCarriedPickWithoutHand:true,errors},null,2));console.log(JSON.stringify({ok:true,directory}));return;
        }
        if(checkpointAt<0){
            await submit('橋を依頼する');await wait(()=>snapshot?.state.adventure.building.bridge,'bridge');console.log('bridge complete');
            for(let n=1;n<=4;n++){await submit('冒険家の課題');await wait(()=>snapshot?.state.adventure.mastery.stage===n,'lesson '+n);console.log('mastery '+n);}
            await submit('スカルへ行く');await wait(()=>!!snapshot?.state.adventure.run,'entrance');
        }
        assert.equal(snapshot.state.adventure.run.training,true);
        await js(`document.querySelector('#word-adventure').open=true;document.querySelector('#adventure-auto').click();void 0`);
        await wait(()=>snapshot?.state.adventure.training.completed,'five-floor training');console.log('training complete');
        assert.equal(snapshot.state.adventure.run,null);
        // Omakase uses ordinary common input to label actual actions, with no extra hand.
        await js(`document.querySelector('#word-auto-toggle').click();void 0`);
        await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase exploration');
        await wait(()=>snapshot?.state.adventure.events.some(e=>e.kind==='return' && !e.training && e.reason==='walked_out'),'omakase walked return');
        console.log('omakase walked return');
        await wait(()=>!!snapshot?.state.adventure.run&&!snapshot.state.adventure.run.training,'omakase reentry');
        await js(`document.querySelector('#word-auto-toggle').click();document.querySelector('#word-pause').click();window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.ok(snapshot.state.adventure.run); const retained=JSON.stringify(snapshot.state.adventure.run);
        fs.writeFileSync(path.join(directory,'exploration.png'),(await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG());
        await window.loadURL(url);await clock();await wait(()=>js(`!!document.querySelector('#word-new-game:not(:disabled)')`),'resume ready');
        await js(`document.querySelector('.word-logo').click();void 0`);
        assert.equal(await js(`document.querySelector('#word-continue').disabled`),false);
        await js(`document.querySelector('#word-continue').click();void 0`);
        await wait(()=>js(`document.querySelector('#app').classList.contains('playing')`),'resume');
        await frames(40);await sleep(300);await js(`window.dispatchEvent(new Event('beforeunload'));void 0`);
        assert.equal(JSON.stringify(snapshot.state.adventure.run),retained);
        assert.equal(await js(`document.querySelector('#word-pause').getAttribute('aria-pressed')`),'true');
        assert.equal(await js(`document.querySelector('#adventure-auto').getAttribute('aria-pressed')`),'false');
        for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de']){
            await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`);await sleep(80);
            assert.ok(await js(`document.querySelector('#adventure-command').options.length>=17`));
        }
        assert.deepEqual(errors,[]);
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,errors,mastery:4,bridge:true,training:true,omakase:true,walkedReturn:true,sameFloorStopped:true,locales:7},null,2));
        console.log(JSON.stringify({ok:true,directory}));
    }).catch(e=>{fs.writeFileSync(path.join(directory,'failure.txt'),String(e.stack));console.error(e);process.exitCode=1;}).finally(()=>{
        if(window)window.destroy();if(server){server.closeAllConnections();server.close();}app.exit(process.exitCode||0);
    });
}
