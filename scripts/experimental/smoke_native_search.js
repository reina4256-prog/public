'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});child.on('exit',code=>process.exitCode=code??1);child.on('error',e=>{console.error(e.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-search-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    app.on('window-all-closed',()=>{});
    const files=['experimental_word_llm_native_walk.js','experimental_word_llm_native_runtime.js','experimental_word_llm_native_perception.js','experimental_word_llm_native_island_ui.js','experimental_word_llm_native_island.css','scripts/experimental/native_store.js','scripts/experimental/smoke_native_search.js','localization_catalog.js',...core.locales.map(l=>'locales/'+l+'.json')];
    const sourceHashes=Object.fromEntries(files.map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',f))).digest('hex')]));
    let window,session,clock=0,calls=0;const errors=[],checks=[],requests=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},180000);
    const evaluate=code=>window.webContents.executeJavaScript(code),until=async code=>{for(let i=0;i<1000;i++){if(await evaluate(code))return;await sleep(30);}throw Error('Timed out '+code);};
    const capture=async name=>{await sleep(100);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());};
    const input='Walk through mountains and forests nearest first and find the adventurer';
    const reply=(p,fields={})=>({reply:'I will look through the nearby mountains and forests, nearest first.',interpretation:{kind:'request',summary:'A search request.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields});
    function initial(){for(let i=0;i<30;i++){const s=core.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());core.game.walk.roam(s.game,1000);
        const ids=core.game.perception.chips(s.game).map(v=>v.id).filter(id=>/^chip:(?:palms_|mountain_)/.test(id)&&core.game.walk.plan(s.game,id));
        if(ids.length<2)continue;const b=core.begin(s,input,'en',1000),next=core.finish(b.state,b.packet.id,b.state.revision,reply(b.packet,{search:{quote:input}}));
        const other=ids.find(id=>id!==next.game.destination);if(!other)continue;s.game.walk.roaming.target=other;return s;}throw Error('No two-site fixture');}
    async function open(state,label){const store=require('./native_store').createProfiles(path.join(directory,label));assert.ok(store.save(state).ok);
        session=require('./native_store').createSession({store,clock:()=>clock,wallClock:()=>1000,responder:{cancel(){},dispose(){},async reply(p){calls++;requests.push(p);return {ok:true,proposal:reply(p,p.input===input?{search:{quote:p.input}}:{})};}},practiceResponder:{cancel(){},dispose(){},async reply(p){calls++;requests.push(p);return {ok:true,proposal:{text:p.stage==='offer'?'Hello, we have met here.':'Hello. I will leave this task for now.',choice:p.stage==='decision'?'decline':null}};}}});
        window=require('./native_window').openWindow(session,{show:false});window.webContents.setBackgroundThrottling(false);window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');await until('!document.getElementById("continue-game").hidden');await evaluate('document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');}
    async function close(){await new Promise(resolve=>{window.once('closed',resolve);window.close();});}
    app.whenReady().then(async()=>{
        await open(initial(),'found-save');
        await evaluate('document.getElementById("input").value='+JSON.stringify(input)+';document.getElementById("compose").requestSubmit()');await until('!document.getElementById("send").disabled');
        assert.equal(session.load().state.game.walk.search.phase,'active');assert.equal(calls,1);
        const catalogs=Object.fromEntries(core.locales.map(locale=>[locale,JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8'))]));
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('document.getElementById("locale").value='+JSON.stringify(locale)+';document.getElementById("locale").dispatchEvent(new Event("change"))');await until('document.getElementById("search-notice").textContent==='+JSON.stringify(catalogs[locale]['冒険家を探しています。']));
            assert.ok(await evaluate('(()=>{const r=document.getElementById("search-notice").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>0&&r.bottom<=innerHeight})()'));await capture('active-'+locale+'-'+width+'.png');}
        checks.push('one explicit chat starts without a circle; seven localized search notices fit desktop and narrow screens');
        await evaluate('document.getElementById("locale").value="en";document.getElementById("locale").dispatchEvent(new Event("change"))');window.setSize(1160,850);await sleep(200);
        for(let i=0;i<6000&&core.game.walk.searchActive(session.load().state.game);i++){clock+=100;assert.ok(session.pulse(false).ok);}
        const found=session.load().state;assert.equal(found.game.walk.search.phase,'found');assert.ok(found.game.walk.search.visited.length>=2);assert.equal(calls,1);assert.ok(core.validState(found));
        await until('document.getElementById("word-master-dialog")?.open');await evaluate('if(!document.getElementById("word-master-skip").hidden)document.getElementById("word-master-skip").click()');
        await until('document.querySelector("#practice-conversation")?.textContent.includes("Hello, we have met here.")');await until('!window.NativePracticeUI.pending');await capture('found-encounter.png');
        checks.push('real nearest-route multi-site arrivals stop on a real encounter, persist and open the existing NPC window with no per-site generation');await close();
        let exhausted=initial(),b=core.begin(exhausted,input,'en',1000);exhausted=core.finish(b.state,b.packet.id,b.state.revision,reply(b.packet,{search:{quote:input}}));
        const g=exhausted.game;for(let i=0;i<10000&&core.game.walk.searchActive(g);i++){const other=Object.keys(g.island.assets).map(id=>'chip:'+id).find(id=>/^chip:(?:palms_|mountain_)/.test(id)&&id!==g.destination);g.walk.roaming.target=other;core.game.tick(g,.1);}
        assert.equal(g.walk.search.phase,'exhausted');assert.ok(core.validState(exhausted));await open(exhausted,'exhausted-save');const before=calls;
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('document.getElementById("locale").value='+JSON.stringify(locale)+';document.getElementById("locale").dispatchEvent(new Event("change"))');await until('document.getElementById("search-notice").textContent==='+JSON.stringify(catalogs[locale]['今回見て回れた範囲では、冒険家に会えませんでした。']));await capture('exhausted-'+locale+'-'+width+'.png');}
        assert.equal(calls,before);assert.equal(session.load().state.game.mode,'idle');checks.push('actual exhausted search reports only the explored range in seven locales, remains idle on reload and generates no report');await close();
        assert.deepEqual(errors,[]);fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,directory,sourceHashes,checks,errors,requests},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);app.quit();
    }).catch(async e=>{errors.push(e.stack||String(e));try{await capture('failure.png');}catch(_){}fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,sourceHashes,checks,errors,requests},null,2));console.error(e.stack);clearTimeout(timer);app.exit(1);});
}
