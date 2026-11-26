'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});child.on('exit',code=>process.exitCode=code??1);child.on('error',e=>{console.error(e.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime'),practice=core.game.practice;
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-builder-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const checks=[],errors=[],requests=[],voiceRequests=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));let window,session,now=Date.UTC(2026,10,27,3),release;
    const files=['experimental_word_llm_native_walk.js','experimental_word_llm_native_practice.js','experimental_word_llm_native_runtime.js','experimental_word_llm_native_mentor_ui.js','experimental_word_llm_native_voice.js','experimental_word_llm_native_scene.js','scripts/experimental/native_practice.js','scripts/experimental/native_store.js','scripts/experimental/native_voice.js','scripts/experimental/smoke_native_builder.js','localization_catalog.js',...core.locales.map(l=>'locales/'+l+'.json')];
    const sourceHashes=Object.fromEntries(files.map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../..',f))).digest('hex')]));
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},240000);
    const evaluate=code=>window.webContents.executeJavaScript(code),until=async code=>{for(let i=0;i<1400;i++){if(await evaluate(code))return;await sleep(30);}throw Error('Timed out '+code);};
    const capture=async name=>{await sleep(150);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());};
    function directed(s,input,fields){const b=core.begin(s,input,'en',now);return core.finish(b.state,b.packet.id,b.state.revision,{reply:'Ready.',interpretation:{kind:'request',summary:'Requested.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields});}
    function initial(){for(let attempt=0;attempt<30;attempt++){
        let s=core.create({name:'Beat',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());
        const forests=core.game.perception.chips(s.game).filter(c=>core.game.walk.forest(c.id)&&core.game.walk.plan(s.game,c.id));if(forests.length<2)continue;
        const target=forests[0].id;s=directed(s,'Which?',{focus:{targetId:target,quote:'Which?'}});s=directed(s,'Yes',{confirmation:{targetId:target,quote:'Yes'}});
        let good=true;for(let i=0;i<2;i++){s=directed(s,'walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}});for(let n=0;n<2000&&s.game.mode==='move';n++)core.game.tick(s.game,.1);
            const p=practice.create(s.game,s.game.walk.encounter);if(!p){good=false;break;}p.attempts.offer='pending';practice.finish(s.game,'offer',{text:'Hello.',choice:null},now);
            p.attempts.decision='pending';practice.finish(s.game,'decision',{text:'Thank you.',choice:'decline',affinity:{delta:1,kind:'conversation',quote:'Thank you.',reason:'A considerate reply.'}},now);}
        if(!good||!core.game.perception.chips(s.game).some(c=>core.game.walk.forest(c.id)&&c.id!==target&&core.game.walk.plan(s.game,c.id)))continue;
        s.game.walk.met=true;s.game.walk.encounter.phase='done';assert.ok(core.validState(s));return s;
    }throw Error('No bounded two-forest fixture');}
    function wav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    app.whenReady().then(async()=>{
        const store=require('./native_store').createProfiles(path.join(directory,'save'));assert.ok(store.save(initial()).ok);
        session=require('./native_store').createSession({store,wallClock:()=>now,responder:{cancel(){},dispose(){},async reply(p){requests.push(p);const target=p.practice?.introduction?.target;
            const fields=p.input==='Show the introduced forest'?{focus:{targetId:target,quote:p.input}}:p.input==='Yes'?{confirmation:{targetId:p.world.focus,quote:p.input}}:{action:{kind:'walk',targetId:p.world.confirmed,quote:p.input}};
            return {ok:true,proposal:{reply:'I will try.',interpretation:{kind:'request',summary:'Requested.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){requests.push(p);if(p.context.goal==='builder-visit'&&p.stage==='offer')await new Promise(r=>release=r);
                const text=p.context.introduce&&p.stage==='offer'?'The architect surveys trees in the other forest, but moves between forests.':p.context.goal==='builder-visit'?(p.stage==='offer'?'Hello. I am the architect. I am surveying trees in this forest.':p.stage==='decision'?'Hello, the adventurer told me about you.':'Nice to meet you. We can talk again.'):'Thank you for telling me.';
                return {ok:true,proposal:{text,choice:p.stage==='decision'?'decline':null,...(p.context.introduce&&p.stage==='offer'?{introduction:{quote:text}}:{})}};}}});
        const voice=require('./native_voice').createVoice({directory:path.join(directory,'voice'),session,key:()=> 'fixture',fetcher:async(_u,o)=>{voiceRequests.push(JSON.parse(o.body));return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:wav().toString('base64')}]}]}),{status:200,headers:{'content-type':'application/json'}});}});
        window=require('./native_window').openWindow(session,{show:false,voice});window.webContents.setBackgroundThrottling(false);
        window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');await until('!document.getElementById("continue-game").hidden');await evaluate('document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');
        const submit=async input=>{await evaluate('document.getElementById("input").value='+JSON.stringify(input)+';document.getElementById("compose").requestSubmit()');await until('!document.getElementById("send").disabled');};
        await submit('walk there');await until('document.querySelector("#practice-conversation")?.textContent.includes("Thank you for telling me.")');await until('!document.getElementById("word-master-dialog").open');
        assert.ok(practice.introduction(session.load().state.game));assert.equal(session.load().state.game.walk.builder.met,false);checks.push('fresh real adventurer encounter introduces once inside the original slots and persists without walking');
        await submit('Show the introduced forest');await submit('Yes');await submit('Walk to the forest to meet the architect');
        await until('document.querySelector(".word-master-video").getAttribute("src")==="encount_builder.mp4"');
        await evaluate('document.getElementById("word-master-skip").click()');for(let i=0;i<1400&&!release;i++)await sleep(30);assert.ok(release);
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);
            await evaluate('window.GameI18n.setLanguage('+JSON.stringify(locale)+');window.GameI18n.localizeTree(document.body);document.getElementById("word-master-name").textContent=window.GameI18n.translate("建築士");document.getElementById("mentor-status").textContent=window.GameI18n.translate("建築士の返事を待っています…")');
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8'));
            assert.ok(await evaluate('document.getElementById("word-master-dialog").getBoundingClientRect().width<=innerWidth'));
            assert.equal(await evaluate('document.getElementById("mentor-status").textContent'),catalog['建築士の返事を待っています…']);await capture('builder-'+locale+'-'+width+'.png');}
        checks.push('builder portrait/video and existing dialog fit seven locales at desktop and narrow widths');
        release();await until('document.querySelector("#practice-conversation")?.textContent.includes("Nice to meet you.")');await until('!window.NativePracticeUI.pending');
        const state=session.load().state,p=practice.current(state.game);assert.equal(p.npc,'building');assert.equal(p.lines.length,3);assert.equal(p.phase,'done');assert.ok(core.validState(state));
        assert.equal(voiceRequests.filter(r=>r.generation_config.speech_config[0].voice==='Charon').length,2);checks.push('three saved lines use builder Charon and the unchanged companion voice with stub WAV only');
        window.setSize(1160,850);await capture('builder-complete.png');const target=state.game.walk.builder.target;now=state.game.walk.builder.nextAt+1;
        session.pulse(true);assert.equal(session.load().state.game.walk.builder.target,target);await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');
        assert.notEqual(session.load().state.game.walk.builder.target,target);assert.equal(Object.hasOwn(core.game.supply(session.load().state.game),'builder'),false);assert.equal(await evaluate('Boolean(images.builder)'),false);checks.push('expired builder stay moves among forests on close, without an outdoor NPC or current-location supply');
        assert.deepEqual(errors,[]);await new Promise(resolve=>{window.once('closed',resolve);window.close();});
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,directory,sourceHashes,checks,errors,requests,voiceRequests},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);app.quit();
    }).catch(async e=>{errors.push(e.stack||String(e));try{fs.writeFileSync(path.join(directory,'failed-state.json'),JSON.stringify(session.load()));await capture('failure.png');}catch(_){}fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,sourceHashes,checks,errors,requests,voiceRequests},null,2));console.error(e.stack);clearTimeout(timer);app.exit(1);});
}
