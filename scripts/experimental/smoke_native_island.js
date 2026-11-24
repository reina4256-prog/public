'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:false});
    child.on('exit',code=>{process.exitCode=code??1;});child.on('error',error=>{console.error(error.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-island-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    let window,activeSession,masterTarget=null,holdMentor=false,releaseMentor,time=0,preparations=0;const errors=[],checks=[],packets=[],voiceRequests=[],mentorPackets=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    function sampleWav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    const evaluate=code=>window.webContents.executeJavaScript(code);
    async function capture(name){await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');await sleep(250);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());}
    async function until(code){for(let i=0;i<400;i++){if(await evaluate(code))return;await sleep(50);}const video=await evaluate('(()=>{const v=document.querySelector(".word-master-video");return v?{phase:document.querySelector("#word-master-dialog").dataset.phase,time:v.currentTime,duration:v.duration,paused:v.paused,ended:v.ended,ready:v.readyState,seeking:v.seeking,error:v.error?.code}:null})()');fs.writeFileSync(path.join(directory,'wait-failure.json'),JSON.stringify({condition:code,video}));throw Error('Timed out: '+code);}
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},180000);
    function open(){
        const responder={async reply(p){packets.push(p);if(p.input==='QUOTA')return {ok:false,error:'quota'};
            const teaching=p.input==='この場所はコロです。';const focus=p.input==='FOCUS'?{targetId:p.world.visible[0].id,quote:p.input}:p.input==='FIND_MASTER'?{targetId:masterTarget,quote:p.input}:null;
            const proposal={reply:focus?'Do you mean this place?':'I am on the island. '+p.world.currentAction,
                interpretation:{kind:teaching?'teaching':'question',summary:teaching?'場所をコロと呼ぶと教わった。まだ自分では確かめていない。':'島でのいまの様子を聞かれた。'},
                memories:teaching?[{sourceId:p.id,quote:p.input,text:'The player calls this place Koro; unverified.'}]:[],references:p.memories.slice(-1).map(m=>m.sourceId),
                terms:teaching?[{word:'場所',quote:p.input},{word:'コロ',quote:p.input}]:[],action:null,focus};
            if(p.input==='BAD')proposal.terms=[{word:'forged',quote:p.input}];
            if(p.input==='BAD_ACTION')proposal.action='eat';
            if(p.input==='Yes'&&p.world.focus)proposal.confirmation={targetId:p.world.focus,quote:p.input};
            if(p.input==='walk there'){proposal.interpretation.kind='request';proposal.action={kind:'walk',targetId:p.world.confirmed,quote:p.input};}
            return {ok:true,proposal};},prepare(...args){assert.deepEqual(args,[]);preparations++;return {ok:true};},cancel(){},dispose(){}};
        const {createSession,createProfiles}=require('./native_store');
        const mentorResponder={async reply(p){mentorPackets.push(p);if(holdMentor)await new Promise(r=>releaseMentor=r);return {ok:true,proposal:{mentor:'Welcome, little explorer.',companion:'Hello, I am curious.'}};},cancel(){},dispose(){}};
        const session=createSession({store:createProfiles(path.join(directory,'save')),responder,mentorResponder,clock:()=>time+=100});
        activeSession=session;
        const voice=require('./native_voice').createVoice({directory:path.join(directory,'save'),session,key:()=> 'fixture-only',fetcher:async(url,options)=>{
            voiceRequests.push(JSON.parse(options.body));
            if(url.endsWith('/voices'))return new Response(JSON.stringify({type:'prompted',id:'voice_fixture_'+voiceRequests.length,sample_audio:{mime_type:'audio/wav',data:sampleWav().toString('base64')}}));
            return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:sampleWav().toString('base64')}]}]}));
        }});
        window=require('./native_window').openWindow(session,{show:true,voice});
        window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});return session;
    }
    app.whenReady().then(async()=>{
        open();await until('!document.getElementById("entry").hidden');
        await capture('logo.png');await evaluate('document.getElementById("logo").click()');await capture('title.png');
        await evaluate('document.getElementById("new-game").click()');await until('!document.getElementById("questions").hidden');
        assert.equal(await evaluate('getComputedStyle(document.getElementById("questions")).backgroundColor'),'rgb(8, 15, 27)');
        for(const locale of core.locales){await evaluate(`document.getElementById('locale').value=${JSON.stringify(locale)};document.getElementById('locale').dispatchEvent(new Event('change'));`);await capture('question-'+locale+'.png');}
        await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));`);
        for(let i=0;i<7;i++)await evaluate('document.querySelector("#question-choices button").click()');
        assert.equal(await evaluate('document.getElementById("setup").hidden'),false);
        await evaluate('(()=>{window.voiceStarts=0;const original=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){window.voiceStarts++;return original.apply(this,args)};})()');
        const rules=require('../../experimental_word_llm_native_voice');
        for(const species of rules.species){await evaluate(`NativeVoiceUI.mount(document.getElementById('setup-voice'),${JSON.stringify(species)},'ja')`);assert.equal(await evaluate('document.getElementById("voice-choice").value'),rules.defaults[species]);assert.equal(await evaluate('document.getElementById("voice-choice").options.length'),11);}
        await evaluate(`NativeVoiceUI.mount(document.getElementById('setup-voice'),ExperimentalWordStartQuestions.resolve([0,0,0,0,0,0,0]).appearance,'ja');document.getElementById('voice-choice').value='Kore';document.getElementById('voice-listen').click();`);
        await until('window.voiceStarts>0');assert.equal(voiceRequests.length,1);assert.equal(voiceRequests[0].input[0].content[0].text,rules.samples.ja);
        await evaluate('document.getElementById("voice-listen").click()');await until('window.voiceStarts>1');assert.equal(voiceRequests.length,1);
        checks.push('eleven character voice defaults and free choice; explicit audition decodes/plays and reuses fixed sample without another request');
        assert.equal(await evaluate('document.querySelectorAll("#voice-traits select").length'),8);
        const beforeDesign=voiceRequests.length;
        await evaluate('document.getElementById("voice-design").open=true');assert.equal(voiceRequests.length,beforeDesign);
        for(const width of [1160,420]){window.setContentSize(width,850);for(const language of core.locales){
            await evaluate(`document.getElementById('locale').value=${JSON.stringify(language)};document.getElementById('locale').dispatchEvent(new Event('change'));`);
            assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
            assert.ok(await evaluate('Array.from(document.querySelectorAll("#voice-traits select")).every(el=>el.value)'));
            await evaluate('document.getElementById("voice-design").scrollIntoView({block:"center"})');await capture('design-'+width+'-'+language+'.png');
        }}
        window.setContentSize(1160,850);await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));document.getElementById('voice-extra').value='鈴のような響き <b>そのまま</b>';document.getElementById('voice-extra').dispatchEvent(new Event('input'));document.getElementById('voice-make').click();`);
        await until('document.getElementById("voice-choice").value.startsWith("design:")');await until('!document.getElementById("voice-make").disabled');
        const customId=await evaluate('document.getElementById("voice-choice").value'),customSpecies=await evaluate('(async()=>(await nativeMemory.voiceLoad()).designs[0].species)()');
        const customCloud=voiceRequests.at(-1).voice?'voice_fixture_'+voiceRequests.length:null;assert.ok(customCloud);
        assert.equal(voiceRequests.at(-1).store,true);assert.ok(voiceRequests.at(-1).voice.prompted.input.includes('鈴のような響き <b>そのまま</b>'));
        assert.deepEqual(await evaluate('(async()=>(await nativeMemory.voiceLoad()).value.voices)()'),{});
        const firstDesignCount=voiceRequests.length;await evaluate('document.getElementById("voice-make").click()');await until('!document.getElementById("voice-make").disabled');assert.equal(voiceRequests.length,firstDesignCount);
        checks.push('guided design in seven locales at two widths; optional original text only; explicit create/audition; duplicate reuse and no automatic selection');
        await evaluate(`document.getElementById('name').value='ピコ';document.getElementById('self').value='ぼく';document.getElementById('player').value='きみ';document.getElementById('setup').requestSubmit();`);
        assert.equal(await evaluate('(async()=>(await nativeMemory.load()).state)()'),null,'Unsigned form cannot create an individual');
        async function sign(){
            await evaluate('document.getElementById("signature").scrollIntoView({block:"center"})');
            const p=await evaluate('(()=>{const r=document.getElementById("signature").getBoundingClientRect();return{x:Math.round(r.x+r.width*.2),y:Math.round(r.y+r.height*.5)}})()');
            window.webContents.sendInputEvent({type:'mouseDown',...p,button:'left',clickCount:1});
            window.webContents.sendInputEvent({type:'mouseMove',x:p.x+80,y:p.y-10,button:'left'});
            window.webContents.sendInputEvent({type:'mouseUp',x:p.x+80,y:p.y-10,button:'left',clickCount:1});
            await until('!document.getElementById("sign").disabled');
        }
        await sign();await evaluate('document.getElementById("signature-clear").click()');
        assert.equal(await evaluate('document.getElementById("sign").disabled'),true);
        assert.equal(await evaluate('document.getElementById("name").value'),'ピコ');
        await evaluate('document.getElementById("question-retry").click()');
        assert.ok(await evaluate('!document.getElementById("questions").hidden'));
        for(let i=0;i<7;i++)await evaluate('document.querySelector("#question-choices button").click()');
        for(const width of [1160,420]){window.setContentSize(width,850);for(const locale of core.locales){await evaluate(`document.getElementById('locale').value=${JSON.stringify(locale)};document.getElementById('locale').dispatchEvent(new Event('change'));`);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.ok(await evaluate('document.getElementById("voice-choice").getBoundingClientRect().width>document.getElementById("voice-panel").getBoundingClientRect().width*.6'));await evaluate('document.getElementById("voice-panel").scrollIntoView({block:"center"})');await capture('meeting-'+width+'-'+locale+'.png');}}
        window.setContentSize(1160,850);await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));`);
        await evaluate('document.getElementById("voice-choice").value="Kore"');
        await sign();await capture('signature.png');await evaluate('document.getElementById("setup").requestSubmit();document.getElementById("setup").requestSubmit()');
        await until('!document.getElementById("play").hidden');await until('imagesLoaded===totalImages');await sleep(150);checks.push('original seven questions, appearance, separate identity and real island renderer');
        checks.push('logo/title, cyan document, actual pointer signature, unsigned rejection, clear/retry, seven locales at two widths, single creation');
        await capture('island-desktop.png');
        await evaluate('document.getElementById("voice-menu").open=true');
        assert.equal(await evaluate('getComputedStyle(document.querySelector("#voice-menu>summary")).color'),'rgb(226, 213, 177)');
        assert.equal(await evaluate('/Gemini|Google|API|VOICEVOX/i.test(document.body.innerText)'),false);
        assert.equal(await evaluate('document.getElementById("voice-status").parentElement.id'),'play');
        await capture('voice-in-play.png');await evaluate('document.getElementById("voice-menu").open=false');
        async function send(text){await evaluate(`document.getElementById('input').value=${JSON.stringify(text)};document.getElementById('compose').requestSubmit();`);await until('!document.getElementById("send").disabled');}
        await send('Where are you?');await until('window.voiceStarts>2');assert.equal(voiceRequests.at(-1).input[0].content[0].text,packets.at(-1)?'I am on the island. idle':'');assert.equal(voiceRequests.at(-1).generation_config.speech_config[0].voice,'Kore');
        assert.equal(packets.at(-1).world.location,'island');assert.ok(packets.at(-1).world.visible.length<=6);assert.ok(JSON.stringify(packets.at(-1).world).length<=2000);
        assert.equal(JSON.stringify(packets).includes('speech_config'),false);checks.push('saved chosen voice reads only the newly persisted reply; text and understanding packets remain unchanged');
        const targetIds=await evaluate('(async()=>NativeScene.visible((await nativeMemory.load()).state.game).map(p=>p.id))()');
        assert.deepEqual(targetIds,packets.at(-1).world.visible.map(p=>p.id));
        const drawn=()=>evaluate(`(async()=>{const g=(await nativeMemory.load()).state.game,ids=[],original=NativeScene.drawTarget;try{NativeScene.drawTarget=p=>ids.push(p.id);NativeScene.draw(g,0,true);return ids;}finally{NativeScene.drawTarget=original;}})()`);
        assert.deepEqual(await drawn(),[],'No permanent target circles');
        assert.equal(await evaluate('document.querySelectorAll("#scene-targets, [data-target]").length'),0,'No target-control buttons');
        await capture('targets-island.png');checks.push('no invented path/food markers or permanent labels/buttons');
        const before=await evaluate('(async()=>(await nativeMemory.load()).state.game)()');
        await send('FOCUS');const chipId=packets.at(-1).world.visible[0].id;
        assert.deepEqual(await drawn(),[chipId]);assert.ok(chipId.startsWith('chip:'));
        await capture('chip-confirmation.png');
        const after=await evaluate('(async()=>(await nativeMemory.load()).state.game)()');
        assert.equal(after.mode,'idle');assert.equal(after.x,before.x);assert.equal(after.y,before.y);
        assert.deepEqual(packets.at(-1).world.availableActions,[]);checks.push('one verified actual map chip circled for conversational confirmation without movement');
        await send('この場所はコロです。');assert.equal(packets.at(-1).world.focus,chipId);
        assert.deepEqual(await drawn(),[]);checks.push('confirmation target supplied next turn; ordinary reply clears circle; quoted teaching remains unverified');
        assert.deepEqual(await evaluate('(async()=>NativeScene.visible((await nativeMemory.load()).state.game).map(p=>p.id))()'),packets.at(-1).world.visible.map(p=>p.id));
        await evaluate('document.getElementById("tab-diary").click()');await evaluate('document.fonts.ready');await sleep(100);
        assert.ok(await evaluate('!!document.querySelector(".book-drawing")'));assert.equal((await evaluate('document.getElementById("diary").textContent')).includes('甘い'),false);
        assert.equal(await evaluate('document.querySelector(".book-body").style.fontSize'), '');
        await capture('diary-desktop.png');checks.push('illustrated handwritten diary from actual seen map chips, not invented meals');
        await evaluate('document.getElementById("tab-stars").click()');assert.ok(await evaluate('!!document.querySelector("#stars .teaching")'));assert.ok(await evaluate('!!document.querySelector("#stars .actual")'));assert.equal(await evaluate('!!document.querySelector("#stars .experience")'),false);
        assert.ok(await evaluate('[...document.querySelectorAll("#stars text")].every(n=>n.textContent.length<=24)'));await evaluate('document.querySelector("#stars .word-node").dispatchEvent(new Event("click"))');assert.ok(await evaluate('document.getElementById("star-record").textContent.length>0'));checks.push('short word stars, distinct actual-experience edges, selectable evidence');
        for(const width of [1160,420]){window.setContentSize(width,850);for(const locale of core.locales){await evaluate(`document.getElementById('locale').value=${JSON.stringify(locale)};document.getElementById('locale').dispatchEvent(new Event('change'));`);
                for(const tab of ['chat','diary','stars']){await evaluate(`document.getElementById('tab-${tab}').click()`);await sleep(35);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),locale+':'+tab);}
                await evaluate('document.getElementById("tab-chat").click()');await capture('targets-'+width+'-'+locale+'.png');
            }
            await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));document.getElementById('tab-diary').click();`);await sleep(100);
            await capture('diary-'+width+'.png');
            await evaluate('document.getElementById("tab-stars").click()');await capture('stars-'+width+'.png');}
        checks.push('seven locales, desktop/mobile three views, no horizontal clipping');
        await evaluate('document.getElementById("voice-enabled").click()');await until('(async()=>(await nativeMemory.voiceLoad()).value.enabled===false)()');
        const voiceCount=voiceRequests.length;
        await new Promise(r=>{window.once('closed',r);window.close();});open();await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click();document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');
        assert.equal(await evaluate('document.getElementById("voice-choice").value'),'Kore');assert.equal(await evaluate('document.getElementById("voice-enabled").checked'),false);assert.equal(voiceRequests.length,voiceCount);
        await send('Where are you?');assert.equal(voiceRequests.length,voiceCount);assert.ok(packets.at(-1).memories.some(m=>m.raw==='この場所はコロです。'));checks.push('restart preserves character and voice/mute independently; no startup replay/request, no questions or signature replay');
        await send('BAD_ACTION');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('記憶候補'));assert.ok(preparations>0);checks.push('empty CLI warmup lifecycle and disconnected action rejected');
        await send('BAD');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('記憶候補'));await send('QUOTA');assert.equal(await evaluate('document.getElementById("status").textContent'),'今日はお話をひと休み。またあとで話そうね。');checks.push('forged words rejected and quota has no paid fallback');
        const saved=JSON.parse(fs.readFileSync(path.join(directory,'save/native-memory.json'),'utf8'));assert.ok(core.validState(saved));assert.deepEqual(errors,[]);
        assert.equal(saved.game.origin.appearance,customSpecies);
        await evaluate(`document.getElementById('voice-choice').value=${JSON.stringify(customId)};document.getElementById('voice-choice').dispatchEvent(new Event('change'));document.getElementById('voice-enabled').checked=true;document.getElementById('voice-enabled').dispatchEvent(new Event('change'));`);
        await until('(async()=>(await nativeMemory.voiceLoad()).value.enabled)()');
        assert.equal(await evaluate(`(async()=>(await nativeMemory.voiceLoad()).value.voices[${JSON.stringify(customSpecies)}])()`),'Kore','mute toggle alone does not apply the candidate');
        await evaluate('document.getElementById("voice-apply").click()');await until(`(async()=>(await nativeMemory.voiceLoad()).value.voices[${JSON.stringify(customSpecies)}]===${JSON.stringify(customId)})()`);
        const beforeCustomReply=voiceRequests.length;await send('Where are you?');await until('!document.getElementById("voice-listen").disabled');
        assert.ok(voiceRequests.length>beforeCustomReply);assert.equal(voiceRequests.at(-1).generation_config.speech_config[0].voice,customCloud);
        assert.equal(voiceRequests.at(-1).input[0].content[0].text,'I am on the island. idle');
        assert.equal(JSON.stringify(voiceRequests.at(-1)).includes('鈴のような響き'),false);
        const beforeCustomRestart=voiceRequests.length;await new Promise(r=>{window.once('closed',r);window.close();});open();await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click();document.getElementById("continue-game").click()');await until('!document.getElementById("play").hidden');
        assert.equal(await evaluate('document.getElementById("voice-choice").value'),customId);assert.equal(await evaluate('document.getElementById("voice-extra").value'),'鈴のような響き <b>そのまま</b>');assert.equal(voiceRequests.length,beforeCustomRestart);
        await evaluate('document.getElementById("voice-menu").open=true;document.getElementById("voice-design").open=true;document.getElementById("voice-panel").scrollIntoView({block:"start"})');
        assert.equal(await evaluate('/Gemini|Google|API|VOICEVOX/i.test(document.body.innerText)'),false);await capture('custom-voice-in-play.png');
        checks.push('explicit custom voice confirmation, persisted reply uses its cloud ID only, restart preserves original settings and never generates automatically');
        assert.equal(await evaluate('document.getElementById("mentor-open")===null'),true);
        const beforeWalk=activeSession.load().state.game;
        masterTarget=core.game.supply(beforeWalk).visible.filter(v=>/^chip:(mountain_|palms_)/.test(v.id)).map(v=>({id:v.id,n:core.game.walk.plan(beforeWalk,v.id)?.length||0})).sort((a,b)=>b.n-a.n)[0].id;
        await evaluate('document.getElementById("locale").value="en";document.getElementById("locale").dispatchEvent(new Event("change"))');
        await send('FIND_MASTER');assert.equal(activeSession.load().state.game.mode,'idle');
        await send('Yes');assert.equal(activeSession.load().state.game.mode,'idle');assert.equal(activeSession.load().state.game.walk.confirmed.targetId,masterTarget);
        await send('walk there');await until('aiPet.actionState==="moving"');await capture('actual-chip-walking.png');
        await until('document.getElementById("word-master-dialog").open && document.getElementById("word-master-dialog").dataset.phase==="video"');
        assert.equal(activeSession.load().state.game.mode,'idle');assert.equal(mentorPackets.length,0);
        assert.equal(activeSession.load().state.game.receipts.filter(r=>r.kind==='walk'&&r.target===masterTarget).length,1);
        await evaluate('document.querySelector(".word-master-video").muted=true;document.querySelector(".word-master-video").play()');
        await until('document.querySelector(".word-master-video").readyState>=2 && document.querySelector(".word-master-video").currentTime>0');await capture('actual-encounter-movie.png');
        await until('document.getElementById("word-master-dialog").dataset.phase==="conversation"');
        assert.equal(mentorPackets.length,0);assert.equal(await evaluate('document.getElementById("mentor-hero").dataset.skin'),customSpecies);
        assert.ok(await evaluate('document.getElementById("mentor-hero").getContext("2d").getImageData(0,0,280,200).data.some((v,i)=>i%4===3&&v>0)'));
        const turnsBeforeMentor=JSON.stringify(activeSession.load().state.turns),callsBeforeMentor=voiceRequests.length;
        await evaluate('document.getElementById("mentor-next").click()');
        await until('document.querySelectorAll("#mentor-log p").length===2 && !document.getElementById("mentor-next").disabled');
        assert.equal(voiceRequests.length,callsBeforeMentor+2);
        assert.equal(mentorPackets[0].locale,'en');
        assert.equal(voiceRequests.at(-2).generation_config.speech_config[0].voice,'Kore');
        const customCloudId=JSON.parse(fs.readFileSync(path.join(directory,'save','native-voice-designs.json'),'utf8')).entries.find(e=>e.id===customId).cloudId;
        assert.equal(voiceRequests.at(-1).generation_config.speech_config[0].voice,customCloudId);
        for(const locale of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('GameI18n.setLanguage('+JSON.stringify(locale)+');GameI18n.localizeTree(document.body)');assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',locale+'.json'),'utf8'));for(const [id,key]of [['mentor-close','話を終える'],['mentor-next','つづける'],['mentor-history-title','会話をふりかえる']])assert.equal(await evaluate('document.getElementById('+JSON.stringify(id)+').textContent'),locale==='ja'?key:catalog[key]);}
        await evaluate('GameI18n.setLanguage("ja");GameI18n.localizeTree(document.body)');await capture('mentor-conversation-420.png');window.setSize(1160,850);await capture('mentor-conversation-1160.png');
        for(const count of [4,6]){await evaluate('document.getElementById("mentor-next").click()');await until('document.querySelectorAll("#mentor-log p").length==='+count);
            await until(count===4?'!document.getElementById("mentor-next").disabled':'document.getElementById("mentor-status").textContent==="またお話ししよう。"');}
        assert.equal(await evaluate('document.getElementById("mentor-next").disabled'),true);assert.equal(mentorPackets.length,3);
        assert.deepEqual(mentorPackets.map(p=>p.recent.length),[0,2,4]);assert.ok(mentorPackets.every(p=>Object.keys(p).sort().join(',')==='character,id,locale,mentor,recent'));
        await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');
        await evaluate('document.getElementById("locale").value="ja";document.getElementById("locale").dispatchEvent(new Event("change"))');
        assert.equal(await evaluate('(async()=>JSON.stringify((await nativeMemory.load()).state.turns))()'),turnsBeforeMentor);
        assert.equal(await evaluate('document.getElementById("voice-choice").value'),customId);
        await evaluate('document.getElementById("mentor-voice-menu").open=true');await until('document.getElementById("voice-panel").parentElement.id==="mentor-voice"');
        await evaluate('document.getElementById("voice-design").open=true;document.getElementById("voice-make").click()');
        await until('document.getElementById("voice-choice").value.startsWith("design:") && !document.getElementById("voice-apply").disabled');
        assert.ok(voiceRequests.find(r=>r.voice?.prompted?.input.includes('adult woman adventurer')));
        await evaluate('document.getElementById("voice-apply").click()');await sleep(100);
        const prefsAfterMentor=JSON.parse(fs.readFileSync(path.join(directory,'save','native-voice-preferences.json'),'utf8'));
        assert.ok(prefsAfterMentor.voices['mentor-adventurer'].startsWith('design:'));assert.equal(prefsAfterMentor.voices[customSpecies],customId);
        await evaluate('document.getElementById("voice-menu").open=false');await sleep(50);await evaluate('document.getElementById("voice-menu").open=true');await until('document.getElementById("voice-panel").parentElement.id==="play-voice"');
        checks.push('chat-confirmed real-chip walk and actual arrival gate, real local movie playback, shared original master window with both actors, three voiced rounds, seven locales/two widths, separate saved voices and no learning');
        const revisit=activeSession.load().state.game;masterTarget=core.game.supply(revisit).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&core.game.walk.plan(revisit,v.id)).id;
        await send('FIND_MASTER');await send('Yes');await send('walk there');await until('document.getElementById("word-master-dialog").open && document.getElementById("word-master-dialog").dataset.phase==="conversation"');
        holdMentor=true;const afterConversationCalls=voiceRequests.length;await evaluate('document.getElementById("mentor-next").click()');for(let i=0;i<100&&!releaseMentor;i++)await sleep(20);assert.ok(releaseMentor);
        await evaluate('document.getElementById("mentor-close").click()');releaseMentor();holdMentor=false;await sleep(250);
        assert.equal(await evaluate('document.getElementById("word-master-dialog").open'),false);assert.equal(voiceRequests.length,afterConversationCalls);
        assert.equal((await activeSession.mentorStart('en')).ok,false);assert.equal(activeSession.mentorIntro('forged').ok,false);
        checks.push('closing encounter discards delayed dialogue without audio; direct or forged meeting rejected; no automatic movie replay for met mentor');
        const originalState=JSON.parse(fs.readFileSync(path.join(directory,'save','native-memory.json'),'utf8'));
        const sharedVoices=fs.readFileSync(path.join(directory,'save','native-voice-designs.json'),'utf8');
        const voicesBeforeCharacters=voiceRequests.length;
        await evaluate('document.getElementById("back-title").click()');await until('!document.getElementById("title-menu").hidden');
        assert.equal(await evaluate('document.getElementById("new-game").hidden'),false);
        await evaluate('document.getElementById("new-game").click()');
        assert.equal(await evaluate('document.getElementById("questions-title")===null'),true);
        assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'save','native-memory.json'),'utf8')).character.name,originalState.character.name);
        for(let i=0;i<7;i++)await evaluate('document.querySelector("#question-choices button").click()');
        await until('!document.getElementById("setup").hidden');
        assert.equal(await evaluate('Array.from(document.querySelectorAll("#setup button")).some(button=>button.textContent==="タイトルにもどる")'),false);
        await evaluate('document.getElementById("question-retry").click()');
        assert.equal(await evaluate('document.getElementById("setup").hidden && document.getElementById("question-count").textContent==="1 / 7"'),true);
        for(let i=0;i<7;i++)await evaluate('document.querySelector("#question-choices button").click()');
        await until('!document.getElementById("setup").hidden');
        assert.equal(await evaluate('document.getElementById("name").readOnly'),false);
        await evaluate('document.getElementById("name").value="Second <name>";document.getElementById("self").value="I";document.getElementById("player").value="you";document.getElementById("signature").scrollIntoView({block:"center"})');
        const signBox=await evaluate('(()=>{const r=document.getElementById("signature").getBoundingClientRect();return{x:Math.round(r.x+r.width*.3),y:Math.round(r.y+r.height*.5)}})()');
        window.webContents.sendInputEvent({type:'mouseDown',x:signBox.x,y:signBox.y,button:'left',clickCount:1});window.webContents.sendInputEvent({type:'mouseMove',x:signBox.x+50,y:signBox.y+4});window.webContents.sendInputEvent({type:'mouseUp',x:signBox.x+50,y:signBox.y+4,button:'left',clickCount:1});
        await until('!document.getElementById("sign").disabled');await evaluate('document.getElementById("sign").click()');await until('!document.getElementById("play").hidden');
        assert.equal(await evaluate('document.getElementById("character-name").textContent'),'Second <name>');
        assert.equal(fs.readFileSync(path.join(directory,'save','native-voice-designs.json'),'utf8'),sharedVoices);assert.equal(voiceRequests.length,voicesBeforeCharacters);
        await evaluate('document.getElementById("back-title").click();document.getElementById("continue-game").click()');await until('!document.getElementById("character-picker").hidden');
        assert.equal(await evaluate('document.querySelectorAll("#character-list button").length'),2);
        for(const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de'])for(const width of [1160,420]){window.setSize(width,850);await evaluate('GameI18n.setLanguage('+JSON.stringify(locale)+');GameI18n.localizeTree(document.body)');await sleep(50);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));}
        await evaluate('GameI18n.setLanguage("ja");GameI18n.localizeTree(document.body)');await capture('character-picker-420.png');window.setSize(1160,850);await capture('character-picker-1160.png');
        await evaluate('document.querySelector("#character-list button").click()');await until('!document.getElementById("play").hidden');
        assert.equal(await evaluate('document.getElementById("character-name").textContent'),originalState.character.name);
        assert.equal(await evaluate('document.getElementById("voice-choice").value'),customId);
        assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'save','native-memory.json'),'utf8')).turns.length,originalState.turns.length);
        await new Promise(r=>{window.once('closed',r);window.close();});open();await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click();document.getElementById("continue-game").click()');await until('!document.getElementById("character-picker").hidden');
        await evaluate('document.querySelectorAll("#character-list button")[1].click()');await until('!document.getElementById("play").hidden');assert.equal(await evaluate('document.getElementById("character-name").textContent'),'Second <name>');
        assert.equal(voiceRequests.length,voicesBeforeCharacters);assert.deepEqual(errors,[]);
        checks.push('new game preserves original and created voices; two independent saves selectable after restart; retry questions only before signing; seven-locale responsive character picker and literal names');
        const primaryFile=path.join(directory,'save','native-memory.json'),originalBytes=fs.readFileSync(primaryFile);fs.writeFileSync(primaryFile,'corrupt fixture');
        await evaluate('document.getElementById("back-title").click();document.getElementById("continue-game").click()');await until('document.getElementById("title-status").textContent.length>0');
        assert.equal(await evaluate('document.getElementById("title-status").getBoundingClientRect().height>0'),true);
        window.setSize(420,850);await capture('character-save-error-420.png');fs.writeFileSync(primaryFile,originalBytes);
        checks.push('corrupt saved character blocks selection safely with a visible natural title-screen error');
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,checks,errors,packets,voiceRequests},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);window.close();app.quit();
    }).catch(error=>{fs.writeFileSync(path.join(directory,'failure.json'),JSON.stringify({error:error.stack,checks,errors},null,2));console.error(directory,error.stack);clearTimeout(timer);app.exit(1);});
}
