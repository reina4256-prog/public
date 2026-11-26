'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});child.on('exit',code=>process.exitCode=code??1);child.on('error',e=>{console.error(e.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-roaming-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const checks=[],errors=[],requests=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));let window,session,release,now=Date.UTC(2026,11,1,0,0);
    const sourceFiles=['experimental_word_llm_native_calendar.js','experimental_word_llm_native_walk.js','experimental_word_llm_native_perception.js','experimental_word_llm_native_practice.js','experimental_word_llm_native_game.js','experimental_word_llm_native_runtime.js','experimental_word_llm_native_scene.js','experimental_word_llm_native_island.html','experimental_word_llm_native_island_ui.js','experimental_word_llm_native_island.css','scripts/experimental/native_store.js','scripts/experimental/native_practice.js','scripts/experimental/native_mentor.js','scripts/experimental/native_preload.js','scripts/experimental/native_window.js','scripts/experimental/smoke_native_roaming.js'];
    sourceFiles.push('localization_core.js','localization_catalog.js',...core.locales.map(locale=>'locales/'+locale+'.json'));
    const sourceHashes=Object.fromEntries(sourceFiles.map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',file))).digest('hex')]));
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},240000);
    const evaluate=code=>window.webContents.executeJavaScript(code),until=async code=>{for(let i=0;i<1400;i++){if(await evaluate(code))return;await sleep(30);}throw Error('Timed out '+code);};
    const capture=async name=>{await sleep(180);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());};
    function initial(){let s=core.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());
        const target=core.game.practice.targets(s.game).find(t=>t.reachable).id;
        for(const [input,fields]of [['Which?',{focus:{targetId:target,quote:'Which?'}}],['Yes',{confirmation:{targetId:target,quote:'Yes'}}],['walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}}]]){
            const b=core.begin(s,input,'en',now);s=core.finish(b.state,b.packet.id,b.state.revision,{reply:'Ready.',interpretation:{kind:'request',summary:'Received.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields});}
        for(let i=0;i<2000&&s.game.mode==='move';i++)core.game.tick(s.game,.1);s.game.walk.encounter.phase='done';return s;}
    app.whenReady().then(async()=>{
        const {createProfiles,createSession}=require('./native_store'),store=createProfiles(path.join(directory,'save'));assert.ok(store.save(initial()).ok);
        session=createSession({store,wallClock:()=>now,responder:{cancel(){},dispose(){},async reply(p){requests.push(p);return {ok:true,proposal:{reply:'I will walk there.',interpretation:{kind:'request',summary:'Walk request.'},memories:[],references:[],terms:[],focus:null,confirmation:null,action:{kind:'walk',targetId:p.world.confirmed,quote:p.input}}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){requests.push(p);await new Promise(r=>release=r);return {ok:true,proposal:{text:'Hello again.',choice:null}};}}});
        const voice=require('./native_voice').createVoice({directory:path.join(directory,'save'),session,key:()=>null});assert.ok(voice.save({version:1,enabled:false,voices:{}}).ok);
        window=require('./native_window').openWindow(session,{show:true,voice});window.webContents.setBackgroundThrottling(false);
        window.webContents.on('console-message',(_event,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');await until('!document.getElementById("title-menu").hidden');await evaluate('document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');
        const start=session.load().state.game.walk.roaming,deadline=start.nextAt;
        assert.equal(await evaluate('Boolean(images.adventurer)'),false,'the outdoor renderer never loads an NPC portrait');
        assert.equal(Object.hasOwn(core.game.supply(session.load().state.game),'adventurer'),false,'no outdoor location is supplied to the companion');
        checks.push('outdoor field hides the adventurer portrait and location metadata while preserving the private stay');
        await evaluate('document.getElementById("calendar-menu").open=true');
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);
            await evaluate('document.getElementById("locale").value='+JSON.stringify(locale)+';document.getElementById("locale").dispatchEvent(new Event("change"))');
            await until('!document.getElementById("calendar-zone").disabled');
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8'));
            assert.equal(await evaluate('document.querySelector("#calendar-menu summary").textContent'),catalog['日時と季節']);
            assert.ok(await evaluate('(()=>{const r=document.getElementById("calendar-zone").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()'));
            if(locale==='ja')await capture('calendar-'+width+'.png');}
        checks.push('seven locales and two widths: localized region/hemisphere settings fit the screen and persist without generation');
        await evaluate('document.getElementById("locale").value="pt-BR";document.getElementById("locale").dispatchEvent(new Event("change"))');await until('!document.getElementById("calendar-zone").disabled');
        await evaluate('document.getElementById("calendar-zone").value="Asia/Tokyo";document.getElementById("calendar-zone").dispatchEvent(new Event("change"))');await until('!document.getElementById("calendar-zone").disabled');
        assert.equal(session.load().state.locale,'pt-BR');assert.equal(requests.length,0);assert.equal(session.load().state.game.walk.roaming.nextAt,deadline);
        await evaluate('document.getElementById("input").value="walk there";document.getElementById("compose").requestSubmit()');
        for(let i=0;i<1400&&!release;i++)await sleep(30);assert.ok(release);const normal=requests.find(p=>p.input),offer=requests.find(p=>p.stage==='offer');
        assert.equal(normal.calendar.date,'2026-12-01');assert.equal(normal.calendar.time,'09:00');assert.equal(normal.calendar.season,'summer');assert.deepEqual(offer.context.calendar,normal.calendar);
        assert.equal(Object.hasOwn(normal.world,'adventurer'),false);
        assert.ok(JSON.stringify(offer.context).length<=1200);assert.equal(offer.context.exchange?.available,undefined);checks.push('normal chat and NPC share the selected local clock and language-based season within existing budgets');
        await capture('encounter-before-departure.png');now=deadline+1000;session.pulse(true);assert.equal(session.load().state.game.walk.roaming.target,start.target);assert.equal(session.load().state.game.walk.roaming.nextAt,deadline);
        await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');release();
        for(let i=0;i<200&&session.load().state.game.walk.roaming.target===start.target;i++)await sleep(20);assert.notEqual(session.load().state.game.walk.roaming.target,start.target);
        assert.equal(core.game.practice.current(session.load().state.game).lines.length,0,'cancelled delayed greeting is not adopted');assert.equal(requests.length,2);checks.push('overdue real stay is held during speech, then moves on close immediately; cancelled result never applies and no departure call is made');
        window.setSize(1160,850);await evaluate('document.getElementById("terrarium").scrollIntoView({block:"center"})');await capture('after-departure.png');assert.equal(await evaluate('Boolean(images.adventurer)'),false);assert.ok(core.validState(session.load().state));assert.deepEqual(errors,[]);
        await new Promise(resolve=>{window.once('closed',resolve);window.close();});const count=requests.length;
        const reopened=createSession({store,wallClock:()=>now,responder:{cancel(){},dispose(){},reply(){throw Error('No call on reload');}}});
        const restored=reopened.load();assert.ok(restored.ok);assert.equal(restored.state.game.calendarSettings.zone,'Asia/Tokyo');assert.equal(restored.state.locale,'pt-BR');assert.notEqual(restored.state.game.walk.roaming.target,start.target);reopened.dispose();assert.equal(requests.length,count);
        checks.push('settings, actual departure and original calendar snapshots survive reload without generation');
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,directory,sourceHashes,checks,errors,requests},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);app.quit();
    }).catch(e=>{errors.push(e.stack||String(e));fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,sourceHashes,checks,errors,requests},null,2));console.error(e.stack);clearTimeout(timer);app.exit(1);});
}
