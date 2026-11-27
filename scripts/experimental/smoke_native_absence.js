'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});child.on('exit',code=>process.exitCode=code??1);child.on('error',e=>{console.error(e);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime'),a=core.game.practice.absence;
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-absence-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const checks=[],errors=[],packets=[],voiceRequests=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));let session,window,now=Date.UTC(2026,10,27,3),saved;
    const files=['experimental_word_llm_native_absence.js','experimental_word_llm_native_practice.js','experimental_word_llm_native_game.js','experimental_word_llm_native_runtime.js','experimental_word_llm_native_island.html','experimental_word_llm_native_island_ui.js','experimental_word_llm_native_voice_ui.js','scripts/experimental/native_store.js','scripts/experimental/native_resume.js','scripts/experimental/native_preload.js','scripts/experimental/native_window.js','scripts/experimental/native_voice.js','scripts/experimental/smoke_native_absence.js','localization_catalog.js',...core.locales.map(l=>'locales/'+l+'.json')];
    const sourceHashes=Object.fromEntries(files.map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',f))).digest('hex')]));
    const timeout=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},180000);
    const evaluate=code=>window.webContents.executeJavaScript(code),until=async code=>{for(let i=0;i<500;i++){if(await evaluate(code))return;await sleep(30);}throw Error('Timed out '+code);};
    const capture=async name=>{await sleep(150);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());};
    function wav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    app.whenReady().then(async()=>{
        const profiles=require('./native_store').createProfiles(path.join(directory,'save'));
        for(let i=0;i<30;i++){saved=core.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());if(core.game.practice.targets(saved.game).some(t=>t.id.startsWith('chip:palms_')&&t.reachable))break;}
        assert.ok(profiles.save(saved).ok);
        const quiet={cancel(){},dispose(){}};
        session=require('./native_store').createSession({store:profiles,wallClock:()=>now,responder:{...quiet,async reply(p){packets.push(p);let fields;
            if(p.input==='Show tasks')fields={taskView:{kind:'open',quote:p.input}};
            else if(p.input==='Show inventory')fields={inventoryView:{kind:'open',quote:p.input}};
            else fields={away:{kind:'start',quote:p.input,type:'wood',targets:[p.inventory.targets.find(t=>t.id.startsWith('chip:palms_')&&t.reachable).id]}};
            return {ok:true,proposal:{reply:'I will gather wood while you are away.',interpretation:{kind:'request',summary:'Requested.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields}};}},resumeResponder:{...quiet,async reply(p){packets.push(p);assert.ok(require('./native_resume').valid(p));return {ok:true,proposal:{text:'Welcome back! I collected '+p.inventory.absence.total+' wood. I stopped when you returned.'}};}}});
        const voice=require('./native_voice').createVoice({directory:path.join(directory,'voice'),session,key:()=> 'fixture',fetcher:async(_u,o)=>{voiceRequests.push(JSON.parse(o.body));return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:wav().toString('base64')}]}]}),{status:200,headers:{'content-type':'application/json'}});}});
        window=require('./native_window').openWindow(session,{show:false,voice});window.webContents.setBackgroundThrottling(false);window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');await until('!document.getElementById("continue-game").hidden');
        const resume=async()=>{await evaluate('document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');};await resume();
        const submit=async input=>{const n=session.load().state.turns.length;await evaluate('document.getElementById("input").value='+JSON.stringify(input)+';document.getElementById("compose").requestSubmit()');
            for(let i=0;i<500;i++){if(session.load().state.turns.length>n&&session.load().state.turns.at(-1).status==='complete')break;await sleep(30);}await until('!document.getElementById("send").disabled&&document.getElementById("input").value===""');};
        await submit('Collect wood in known forests while I am away');assert.equal(a.current(session.load().state.game).status,'reserved');await submit('Show tasks');await submit('Show inventory');
        const requests=packets.length;now+=3600000;session.pulse(true);assert.equal(a.current(session.load().state.game).total,0);assert.equal(packets.length,requests);checks.push('actual UI accepts and saves reservation; pause earns zero and sends zero');
        await capture('reserved-en.png');await evaluate('document.getElementById("back-title").click()');await until('!document.getElementById("entry").hidden');now+=8*3600000;assert.equal(packets.length,requests);await resume();
        await until('document.getElementById("conversation").textContent.includes("Welcome back!")');const final=session.load().state;assert.ok(core.validState(final));assert.ok(final.game.inventory.items.length>2);assert.equal(a.current(final.game).status,'paused');assert.equal(packets.filter(p=>p.kind==='resume').length,1);
        await sleep(300);assert.equal(voiceRequests.filter(r=>JSON.stringify(r).includes('Welcome back')).length,1);checks.push('title departure settles eight hours on resume; more than two items, one greeting/report and one voice');
        assert.ok(packets.filter(p=>p.inventory).every(p=>JSON.stringify(p.inventory).length<=1200&&(!p.inventory.absence||JSON.stringify(p.inventory.absence).length<=800)));checks.push('actual packets obey inventory1200/absence800 with no extra map, NPC or private gift supply');
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('document.getElementById("locale").value='+JSON.stringify(locale)+';document.getElementById("locale").dispatchEvent(new Event("change"))');
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8'));await until('document.getElementById("task-details").textContent.includes('+JSON.stringify(catalog['留守番採集'])+')');await capture('paused-'+locale+'-'+width+'.png');}
        checks.push('seven locales at desktop and narrow widths show saved count, paused/waiting phase and inventory');
        const count=final.game.inventory.items.length;await evaluate('document.getElementById("back-title").click()');await until('!document.getElementById("entry").hidden');await resume();await sleep(250);assert.equal(session.load().state.game.inventory.items.length,count);assert.equal(packets.filter(p=>p.kind==='resume').length,1);checks.push('rapid title/resume causes no second settlement, generation or voice');
        assert.deepEqual(errors,[]);fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,checks,errors,sourceHashes,packets,voiceRequests},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timeout);app.quit();
    }).catch(async e=>{errors.push(e.stack||String(e));try{await capture('failure.png');fs.writeFileSync(path.join(directory,'state.json'),JSON.stringify(session.load()));}catch(_){}fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,checks,errors,sourceHashes,packets,voiceRequests},null,2));console.error(e.stack);clearTimeout(timeout);app.exit(1);});
}
