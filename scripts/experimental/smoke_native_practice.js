'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});
    child.on('exit',code=>process.exitCode=code??1);child.on('error',error=>{console.error(error.message);process.exitCode=1;});
}else{
    const assert=require('node:assert/strict'),{app}=require('electron'),core=require('../../experimental_word_llm_native_runtime');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-practice-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const sleep=ms=>new Promise(r=>setTimeout(r,ms)),checks=[],errors=[],requests=[],voiceRequests=[];let window,session,scenario='accept',release=null,releaseObservation=null,releaseOffer=null;
    const evaluate=code=>window.webContents.executeJavaScript(code);
    // Task, empty-state and failed-feedback scenarios add three full UI flows.
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},480000);
    async function until(code){for(let i=0;i<1200;i++){if(await evaluate(code))return;await sleep(50);}throw Error('Timed out: '+code);}
    async function capture(name){await sleep(150);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());}
    function wav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    function initial(kind){let s=core.create({name:'Test <name>',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());
        const target=core.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&core.game.walk.plan(s.game,v.id)).id;
        for(const [input,fields] of [['Which?',{focus:{targetId:target,quote:'Which?'}}],['Yes',{confirmation:{targetId:target,quote:'Yes'}}]]){
            const b=core.begin(s,input,'en'),r={reply:'Hello.',interpretation:{kind:'request',summary:'Requested.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields};s=core.finish(b.state,b.packet.id,b.state.revision,r);}
        s.game.walk.met=kind!=='first';return s;}
    async function open(kind,fresh=true,walk=true){scenario=kind;const {createProfiles,createSession}=require('./native_store'),saveDir=path.join(directory,kind),store=createProfiles(saveDir);
        if(fresh)assert.ok(store.save(initial(kind)).ok);
        session=createSession({store,responder:{cancel(){},dispose(){},async reply(p){requests.push(p);if(p.input==='stop')return {ok:false,error:'quota'};
            const choice=p.input==='Please explore and return.'?'accept':null;
            const view=p.input==='Show me my tools'?'open':p.input==='Put away my inventory'?'close':null;
            const task=p.input==='Show me my task'?'open':p.input==='Put away my task'?'close':null;
            const affinity=p.input==='Show relationships'?'open':p.input==='Close relationships'?'close':null;
            return {ok:true,proposal:{reply:choice?'I will take part and return.':'I remember the actual survey.',interpretation:{kind:'request',summary:'Received.'},memories:[],references:[],terms:[],action:p.input==='walk there'?{kind:'walk',targetId:p.world.confirmed,quote:p.input}:null,focus:null,confirmation:null,...(p.inventory?{inventoryView:view?{kind:view,quote:p.input}:null,taskView:task?{kind:task,quote:p.input}:null,affinityView:affinity?{kind:affinity,quote:p.input}:null}:{}),...(p.practice?{practiceChoice:choice?{choice,quote:p.input}:null}:{})}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){requests.push(p);if(kind==='late'&&p.stage==='decision')await new Promise(r=>release=r);
                if(kind==='accept'&&p.stage==='offer')await new Promise(r=>releaseOffer=r);
                if(kind==='accept'&&p.stage==='observe2')await new Promise(r=>releaseObservation=r);
                if(kind==='feedbackfail'&&p.stage==='feedback')return {ok:false,error:'output',diagnostic:{version:1,reason:'protocol_decode',exitCode:0}};
                const found=p.context.collection?.found.at(-1);
                return {ok:true,proposal:{text:p.stage==='decision'&&kind==='consult'?'Should I explore and return?':'Actual '+p.stage+' at the '+p.context.target.kind+'. '+(found?'I found '+found.count+' '+p.context.collection.type+'.':'I will finish this sentence.'),choice:p.stage==='decision'?(kind==='consult'?'ask':['first','off','voicefail'].includes(kind)?'decline':'accept'):null,
                    ...(p.stage==='feedback'&&p.context.relationship?{affinity:{delta:1,kind:'conduct',quote:p.recent.find(l=>l.slot==='report').text,reason:'An honest report after the actual return.'}}:{})}};}}});
        const voice=require('./native_voice').createVoice({directory:saveDir,session,key:()=> 'fixture-only',fetcher:async(_url,options)=>{voiceRequests.push(JSON.parse(options.body));if(kind==='voicefail')return new Response('{}',{status:503});return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:wav().toString('base64')}]}]}));}});
        if(kind==='off')assert.ok(voice.save({version:1,enabled:false,voices:{}}).ok);
        window=require('./native_window').openWindow(session,{show:true,voice});window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');
        await until('!document.getElementById("title-menu").hidden && !document.getElementById("continue-game").hidden');await evaluate('document.getElementById("continue-game").click()');
        await until('!document.getElementById("play").hidden');
        if(fresh&&walk)await send('walk there');
    }
    async function send(text){await evaluate('document.getElementById("input").value='+JSON.stringify(text)+';document.getElementById("compose").requestSubmit()');await until('!document.getElementById("send").disabled');}
    async function close(){await new Promise(resolve=>{window.once('closed',resolve);window.close();});}
    app.whenReady().then(async()=>{
        await open('accept');await until('document.getElementById("word-master-dialog").open && NativeMentorUI.pending');
        assert.equal(requests.filter(p=>p.stage).length,1,'new actual arrival automatically starts one offer');
        assert.equal(requests.find(p=>p.stage).context.meeting,'again');
        assert.equal(await evaluate('document.getElementById("mentor-next").hidden'),true);
        assert.equal(await evaluate('document.querySelector(".word-master-thought").hidden'),true);
        assert.equal(await evaluate('document.getElementById("word-master-text").hidden'),true,'waiting for offer has no empty speech bubble');
        await capture('practice-greeting-1160.png');
        for(const language of core.locales){assert.ok(await evaluate('(()=>{const text="First sentence. Second sentence, with a longer clause to check the bounded reading pages. "+"山の様子を確かめた。".repeat(12)+" 👩🏽‍🚀";const p=NativeMentorUI.pages(text,'+JSON.stringify(language)+');return p.join("")===text && p.length>2 && p.every(x=>x.length<100)})()'));}
        await evaluate('window.oldActionDraws=0;const original=drawActionWindow;drawActionWindow=function(...args){window.oldActionDraws++;return original(...args)};window.practiceVoiceStarts=0;const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){window.practiceVoiceStarts++;return start.apply(this,args)};void 0;');
        await evaluate('window.readFrames=[];const n=document.getElementById("word-master-text");window.readObserver=new MutationObserver(()=>{const text=n.textContent;if(text)window.readFrames.push({text,page:n.dataset.page})});readObserver.observe(n,{childList:true,subtree:true,characterData:true})');
        releaseOffer();await until('document.getElementById("word-master-text").dataset.reading==="true" && document.getElementById("word-master-text").textContent.length>0');
        const held=session.load().state.game;await sleep(200);assert.deepEqual(session.load().state.game,held,'automatic reading holds the stage');
        await capture('practice-page-1160.png');
        for(const language of core.locales)for(const width of [1160,420]){
            window.setSize(width,850);await evaluate('GameI18n.setLanguage('+JSON.stringify(language)+');GameI18n.localizeTree(document.body)');
            const translations=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',language+'.json'),'utf8'));
            assert.equal(await evaluate('document.getElementById("mentor-next").textContent'),translations['つづける']);
            assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
        }
        await capture('practice-page-420.png');window.setSize(1160,850);await evaluate('GameI18n.setLanguage("en");GameI18n.localizeTree(document.body)');
        checks.push('multilingual original-preserving pages and automatic arrival start, without a continue or extra greeting request');
        await until('(async()=>{const s=await nativeMemory.load();return ["outbound","survey"].includes(s.state.game.practices.at(-1).phase) && !document.getElementById("word-master-dialog").open})()');
        const frames=await evaluate('window.readFrames');assert.ok(frames.some(x=>x.text==='A'));assert.ok(new Set(frames.map(x=>x.text)).size>10);assert.ok(frames.some(x=>x.page==='1'));
        checks.push('one-character reveal, automatic page and speaker advances complete the offer and decision without button presses');
        await until('window.oldActionDraws>0');assert.ok(await evaluate('(()=>{const c=document.getElementById("gameCanvas");return c.getContext("2d").getImageData(250,140,300,200).data.some((v,i)=>i%4===3&&v>0)})()'));
        window.setSize(420,850);await capture('practice-survey-420.png');window.setSize(1160,850);await capture('practice-survey-1160.png');
        checks.push('real terrain traversal opens the original forest/mountain action window with the actual companion sprite');
        await until('(async()=>{const s=await nativeMemory.load();return s.state.game.practices.at(-1).attempts.observe2==="pending"})()');
        const atObservation=session.load().state.game;await sleep(400);assert.deepEqual(session.load().state.game,atObservation);assert.equal(atObservation.practices.at(-1).phase,'survey');
        releaseObservation();await until('document.getElementById("bubble").dataset.reading==="true"');
        const atReading=session.load().state.game;await sleep(200);assert.deepEqual(session.load().state.game,atReading);
        window.setSize(420,850);await capture('practice-monologue-page-420.png');window.setSize(1160,850);
        checks.push('observation generation and reading hold the actual survey position and phase, before any return movement');
        await until('(async()=>{const s=await nativeMemory.load();return s.state.game.practices.at(-1).phase==="done" && document.getElementById("mentor-status").textContent!==""})()');
        const complete=session.load().state,p=core.game.practice.current(complete.game);assert.deepEqual(p.lines.map(l=>l.slot),core.game.practice.slots);
        assert.deepEqual(p.events.map(e=>e.kind),['departed','arrived','observed','observed','returned']);assert.ok(core.validState(complete));
        assert.equal(requests.filter(p=>p.stage).length,6);await until('window.practiceVoiceStarts===6');
        const spoken=new Set(p.lines.map(l=>l.text));assert.equal(voiceRequests.filter(r=>spoken.has(r.input[0].content[0].text)).length,6);
        assert.equal(await evaluate('document.querySelectorAll("#practice-conversation p").length'),6);
        assert.equal(complete.game.inventory.items.length,2);assert.equal(requests.find(p=>p.stage==='observe1').context.collection.obtained,1);assert.equal(requests.find(p=>p.stage==='observe2').context.collection.obtained,2);
        assert.equal(await evaluate('Array.from(document.querySelectorAll(".word-master-speech,.word-master-thought")).some(n=>!n.hidden&&!n.textContent.trim())'),false);
        const mentorTexts=new Set(complete.game.practices.at(-1).lines.filter(l=>l.speaker==='mentor').map(l=>l.text));
        assert.equal(voiceRequests.filter(r=>mentorTexts.has(r.input[0].content[0].text)).length,2);
        assert.ok(voiceRequests.filter(r=>mentorTexts.has(r.input[0].content[0].text)).every(r=>r.generation_config.speech_config[0].voice==='Leda'));
        await capture('practice-report-1160.png');checks.push('two actual collection receipts precede discovery speech, physical return and report/feedback produce exactly six saved lines and six main-owned voice requests; both adventurer lines use Leda');
        await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');await send('How was your survey?');
        assert.equal(requests.at(-1).practice.context.phase,'done');assert.equal(requests.at(-1).practice.speech.length,6);assert.equal(complete.game.harvest,0);
        assert.equal(await evaluate('document.getElementById("inventory").hidden'),true);await send('Show me my tools');
        assert.equal(await evaluate('document.getElementById("inventory").hidden'),false);assert.equal(requests.at(-1).inventory.open,false);
        assert.ok(await evaluate('document.getElementById("world-stage").contains(document.getElementById("inventory")) && !document.getElementById("chat-view").contains(document.getElementById("inventory"))'));
        assert.equal(await evaluate('document.querySelectorAll("#inventory .inventory-item svg[aria-hidden=true] path").length>0'),true);
        assert.equal(await evaluate('document.querySelectorAll("#inventory .inventory-item").length'),2,'actual material and the once-awarded empty canteen are drawn');
        assert.equal(await evaluate('document.querySelectorAll("#inventory button,#inventory a,#inventory input,#inventory summary").length'),0);
        await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));document.getElementById("inventory-title").click()');
        assert.equal(await evaluate('document.getElementById("inventory").hidden'),false);
        await send('Show me my task');assert.equal(await evaluate('document.getElementById("task-panel").hidden'),false);
        assert.equal(session.load().state.game.practices.at(-1).phase,'done');assert.equal(session.load().state.game.inventory.items.length,2);
        assert.ok(await evaluate('document.getElementById("world-stage").contains(document.getElementById("task-panel"))'));
        assert.equal(await evaluate('document.querySelectorAll("#task-panel button,#task-panel a,#task-panel input,#task-panel summary").length'),0);
        for(const language of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('GameI18n.setLanguage('+JSON.stringify(language)+');document.getElementById("locale").value='+JSON.stringify(language)+';document.getElementById("locale").dispatchEvent(new Event("change"))');
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',language+'.json'),'utf8'));
            assert.equal(await evaluate('document.getElementById("inventory-title").textContent'),catalog['インベントリ']);
            assert.ok((await evaluate('document.getElementById("inventory-items").textContent')).includes(catalog[complete.game.inventory.items[0].type==='wood'?'木材':'石']+' × 2'));
            assert.ok(await evaluate('(()=>{const a=document.getElementById("inventory").getBoundingClientRect(),b=document.getElementById("gameCanvas").getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom&&a.height>0})()'),'inventory stays inside the actual island image');
            assert.equal(await evaluate('document.getElementById("task-title").textContent'),catalog['今の課題']);
            const taskText=await evaluate('document.getElementById("task-details").textContent');assert.ok(taskText.includes(catalog['完了']));assert.ok(taskText.includes(catalog['今回見つけた数：{{0}} / 2'].replace('{{0}}','2')));
            assert.ok(await evaluate('(()=>{const a=document.getElementById("task-panel").getBoundingClientRect(),b=document.getElementById("gameCanvas").getBoundingClientRect(),i=document.getElementById("inventory").getBoundingClientRect(),n=document.getElementById("nameplate").getBoundingClientRect();return a.left>=b.left&&a.right<=i.left&&a.top>=n.bottom&&a.top>=b.top&&a.bottom<=b.bottom&&a.height>0})()'),'task stays inside the island without overlapping inventory or the nameplate');
            assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));}
        await capture('inventory-420.png');window.setSize(1160,850);await capture('inventory-1160.png');await send('Put away my inventory');assert.equal(await evaluate('document.getElementById("inventory").hidden'),true);
        await send('Show me my tools');checks.push('inventory opens/closes only via quoted chat request, has actual counts in seven languages/two widths and no direct controls');
        await send('Put away my task');assert.equal(await evaluate('document.getElementById("task-panel").hidden'),true);assert.equal(await evaluate('document.getElementById("inventory").hidden'),false);await send('Show me my task');
        checks.push('task opens/closes only through chat, shows actual completed progress/counts in seven languages and two widths without moving or overlapping inventory');
        const encounterCalls=requests.filter(p=>p.stage).length;await send('Show relationships');
        assert.equal(core.game.practice.relationship(session.load().state.game).hearts,2);
        assert.ok(await evaluate('document.getElementById("world-stage").contains(document.getElementById("affinity-panel")) && document.querySelectorAll("#affinity-panel button,#affinity-panel input").length===0'));
        for(const language of core.locales)for(const width of [1160,420]){window.setSize(width,850);await evaluate('document.getElementById("locale").value='+JSON.stringify(language)+';document.getElementById("locale").dispatchEvent(new Event("change"))');await sleep(180);
            const catalog=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../locales',language+'.json'),'utf8'));
            assert.equal(await evaluate('document.getElementById("affinity-title").textContent'),catalog['みんなとの仲']);
            assert.equal(await evaluate('document.querySelector(".affinity-hearts").textContent'),'♥♥♡♡♡');
            assert.ok(await evaluate('document.getElementById("affinity-panel").getBoundingClientRect().top>=document.getElementById("nameplate").getBoundingClientRect().bottom'),'relationship panel clears the nameplate');
            assert.ok(await evaluate('(()=>{const world=document.getElementById("gameCanvas").getBoundingClientRect(),panels=["affinity-panel","inventory","task-panel"].map(id=>document.getElementById(id).getBoundingClientRect());return panels.every(a=>a.width>0&&a.height>0&&a.left>=world.left&&a.right<=world.right+1&&a.top>=world.top&&a.bottom<=world.bottom+1)&&panels.every((a,i)=>panels.slice(i+1).every(b=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top))&&document.documentElement.scrollWidth<=innerWidth+1})()'),'three world panels fit without overlap');}
        await capture('affinity-420.png');window.setSize(1160,850);await capture('affinity-1160.png');
        await send('Close relationships');assert.equal(await evaluate('document.getElementById("affinity-panel").hidden'),true);await send('Show relationships');
        assert.equal(requests.filter(p=>p.stage).length,encounterCalls);checks.push('relationship portrait/hearts and three panels fit seven locales/two widths, chat-only opening never starts a new encounter');
        await sleep(250);const count=requests.length,voices=voiceRequests.length;await close();await open('accept',false);await sleep(200);assert.equal(requests.length,count);assert.equal(voiceRequests.length,voices);
        assert.equal(await evaluate('document.getElementById("affinity-panel").hidden'),false);assert.equal(core.game.practice.relationship(session.load().state.game).hearts,2);
        assert.equal(await evaluate('document.getElementById("word-master-dialog").open'),false);assert.equal(await evaluate('document.getElementById("inventory").hidden'),false);assert.equal(await evaluate('document.getElementById("task-panel").hidden'),false);assert.equal(session.load().state.game.inventory.items.length,2);checks.push('ordinary chat receives actual history and bounded possessions; restart keeps objects/open panels without generation, audio replay or automatic re-entry');await close();
        await open('empty',true,false);const emptyCalls=requests.length;await send('Show me my task');assert.equal(requests.length,emptyCalls+1);assert.equal(core.game.practice.current(session.load().state.game),null);assert.ok((await evaluate('document.getElementById("task-details").textContent')).includes('There is no task right now.'));await close();
        checks.push('showing status before any task displays no task and never creates or accepts one');
        await open('feedbackfail');await until('!NativePracticeUI.pending && document.querySelector("#mentor-status")?.textContent.includes("carry on")');
        assert.equal(core.game.practice.current(session.load().state.game).phase,'failed');assert.equal(core.game.practice.current(session.load().state.game).lines.at(-1).slot,'report');
        const failedCount=requests.filter(p=>p.stage).length;await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');await send('Show me my task');
        const failedStatus=await evaluate('document.getElementById("task-details").textContent');assert.ok(failedStatus.includes('Progress has stopped.'));assert.ok(failedStatus.includes('Waiting for the adventurer’s reply'));assert.equal(requests.filter(p=>p.stage).length,failedCount);
        await capture('task-failed-feedback-1160.png');checks.push('failed final feedback retains the report and the task shows stopped while waiting for the adventurer, without retrying');await close();
        await open('consult');
        await until('!document.getElementById("word-master-dialog").open && document.getElementById("practice-conversation")?.textContent.includes("Should I")');
        assert.equal(await evaluate('document.getElementById("play").inert'),false);await send('yes');assert.equal(core.game.practice.current(session.load().state.game).phase,'consult');
        await send('Please explore and return.');assert.equal(core.game.practice.current(session.load().state.game).phase,'outbound');await send('stop');
        const stopped=core.game.practice.current(session.load().state.game);assert.equal(stopped.phase,'stopped');assert.equal(stopped.events.some(e=>e.kind==='returned'),false);
        checks.push('uncertainty uses normal free chat; bare yes keeps waiting, explicit input participates, stop works even when its subsequent CLI response fails');await close();
        await open('late');
        for(let i=0;i<600&&!release;i++)await sleep(20);assert.ok(release);const before=voiceRequests.length;
        await evaluate('document.getElementById("mentor-close").click()');release();await sleep(300);assert.equal(voiceRequests.length,before);
        assert.equal(core.game.practice.current(session.load().state.game).lines.length,1);checks.push('closing during the decision rejects late text/audio and leaves no automatic restart');
        await close();
        await open('first');await until('document.getElementById("word-master-dialog").dataset.phase==="video"');
        const firstCount=requests.filter(p=>p.stage).length;await sleep(200);assert.equal(requests.filter(p=>p.stage).length,firstCount);
        await evaluate('document.getElementById("word-master-skip").click()');await until('document.getElementById("word-master-text").dataset.reading==="true"');
        assert.equal(requests.at(-1).context.meeting,'first');
        await evaluate('document.getElementById("mentor-close").click()');const firstText=await evaluate('document.getElementById("word-master-text").textContent');await sleep(500);
        assert.equal(await evaluate('document.getElementById("word-master-text").textContent'),firstText,'cancelled animation never updates after close');
        checks.push('first-meeting video waits until skip/end before greeting, uses first distinction and cancels ongoing text/audio together');await close();
        for(const kind of ['off','voicefail']){const before=requests.length,voices=voiceRequests.length;await open(kind);
            await until('document.getElementById("word-master-text").dataset.reading==="true"');
            assert.equal(await evaluate('document.getElementById("mentor-next").hidden'),true);
            await until('!NativePracticeUI.pending && !document.getElementById("word-master-dialog").open');
            assert.equal(core.game.practice.current(session.load().state.game).phase,'declined');
            assert.deepEqual(requests.slice(before).filter(p=>p.stage).map(p=>p.stage),['offer','decision']);
            const lines=new Set(core.game.practice.current(session.load().state.game).lines.map(l=>l.text));
            assert.equal(voiceRequests.slice(voices).filter(r=>lines.has(r.input[0].content[0].text)).length,kind==='off'?0:2,'no fallback requests or retries');await close();
        }checks.push('voice OFF and failed voice still reveal and auto-advance readable text without extra generation or retries');
        assert.deepEqual(errors,[]);const summary={ok:true,directory,checks,errors,requests,voiceRequests};fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2));
        console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);app.quit();
    }).catch(async error=>{errors.push(error.stack||String(error));fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,checks,errors},null,2));console.error(error.stack);clearTimeout(timer);app.exit(1);});
}
