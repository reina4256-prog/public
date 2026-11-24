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
    const sleep=ms=>new Promise(r=>setTimeout(r,ms)),checks=[],errors=[],requests=[],voiceRequests=[];let window,session,scenario='accept',release=null;
    const evaluate=code=>window.webContents.executeJavaScript(code);
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},240000);
    async function until(code){for(let i=0;i<600;i++){if(await evaluate(code))return;await sleep(50);}throw Error('Timed out: '+code);}
    async function capture(name){await sleep(150);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());}
    function wav(){const b=Buffer.alloc(4844);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(4800,40);return b;}
    function initial(){let s=core.create({name:'Test <name>',self:'I',player:'you'},'en',[0,0,0,0,0,0,0],require('./native_island').createIsland());
        const target=core.game.supply(s.game).visible.find(v=>/^chip:(mountain_|palms_)/.test(v.id)&&core.game.walk.plan(s.game,v.id)).id;
        for(const [input,fields] of [['Which?',{focus:{targetId:target,quote:'Which?'}}],['Yes',{confirmation:{targetId:target,quote:'Yes'}}],['walk there',{action:{kind:'walk',targetId:target,quote:'walk there'}}]]){
            const b=core.begin(s,input,'en'),r={reply:'Hello.',interpretation:{kind:'request',summary:'Requested.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,...fields};s=core.finish(b.state,b.packet.id,b.state.revision,r);}
        for(let i=0;i<2000&&s.game.mode==='move';i++)core.game.tick(s.game,.1);assert.equal(s.game.mode,'idle');s.game.walk.met=true;return s;}
    async function open(kind,fresh=true){scenario=kind;const {createProfiles,createSession}=require('./native_store'),saveDir=path.join(directory,kind),store=createProfiles(saveDir);
        if(fresh)assert.ok(store.save(initial()).ok);
        session=createSession({store,responder:{cancel(){},dispose(){},async reply(p){requests.push(p);if(p.input==='stop')return {ok:false,error:'quota'};
            const choice=p.input==='Please explore and return.'?'accept':null;
            return {ok:true,proposal:{reply:choice?'I will take part and return.':'I remember the actual survey.',interpretation:{kind:'request',summary:'Received.'},memories:[],references:[],terms:[],action:null,focus:null,confirmation:null,practiceChoice:choice?{choice,quote:p.input}:null}};}},
            practiceResponder:{cancel(){},dispose(){},async reply(p){requests.push(p);if(kind==='late'&&p.stage==='decision')await new Promise(r=>release=r);
                return {ok:true,proposal:{text:p.stage==='decision'&&kind==='consult'?'Should I explore and return?':'Actual '+p.stage+' at the '+p.context.target.kind+'.',choice:p.stage==='decision'?(kind==='consult'?'ask':'accept'):null}};}}});
        const voice=require('./native_voice').createVoice({directory:saveDir,session,key:()=> 'fixture-only',fetcher:async(_url,options)=>{voiceRequests.push(JSON.parse(options.body));return new Response(JSON.stringify({steps:[{type:'model_output',content:[{type:'audio',data:wav().toString('base64')}]}]}));}});
        window=require('./native_window').openWindow(session,{show:true,voice});window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
        await until('!document.getElementById("entry").hidden');await evaluate('document.getElementById("logo").click()');
        await until('!document.getElementById("title-menu").hidden && !document.getElementById("continue-game").hidden');await evaluate('document.getElementById("continue-game").click()');
        await until('!document.getElementById("play").hidden');
    }
    async function send(text){await evaluate('document.getElementById("input").value='+JSON.stringify(text)+';document.getElementById("compose").requestSubmit()');await until('!document.getElementById("send").disabled');}
    async function close(){await new Promise(resolve=>{window.once('closed',resolve);window.close();});}
    app.whenReady().then(async()=>{
        await open('accept');await until('document.getElementById("word-master-dialog").open && !document.getElementById("mentor-next").disabled');
        await evaluate('window.oldActionDraws=0;const original=drawActionWindow;drawActionWindow=function(...args){window.oldActionDraws++;return original(...args)};window.practiceVoiceStarts=0;const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...args){window.practiceVoiceStarts++;return start.apply(this,args)};void 0;');
        assert.equal(requests.length,0,'opening alone never generates');await evaluate('document.getElementById("mentor-next").click()');
        await until('(async()=>{const s=await nativeMemory.load();return s.state.game.practices.at(-1).phase==="outbound" && !document.getElementById("word-master-dialog").open})()');
        checks.push('one explicit continue starts a concrete proposal and separate autonomous decision, followed by departure without action/choice buttons');
        await until('window.oldActionDraws>0');assert.ok(await evaluate('(()=>{const c=document.getElementById("gameCanvas");return c.getContext("2d").getImageData(250,140,300,200).data.some((v,i)=>i%4===3&&v>0)})()'));
        window.setSize(420,850);await capture('practice-survey-420.png');window.setSize(1160,850);await capture('practice-survey-1160.png');
        checks.push('real terrain traversal opens the original forest/mountain action window with the actual companion sprite');
        await until('(async()=>{const s=await nativeMemory.load();return s.state.game.practices.at(-1).phase==="done" && document.getElementById("mentor-status").textContent!==""})()');
        const complete=session.load().state,p=core.game.practice.current(complete.game);assert.deepEqual(p.lines.map(l=>l.slot),core.game.practice.slots);
        assert.deepEqual(p.events.map(e=>e.kind),['departed','arrived','observed','observed','returned']);assert.ok(core.validState(complete));
        assert.equal(requests.filter(p=>p.stage).length,6);await until('window.practiceVoiceStarts===6');assert.equal(voiceRequests.length,6);
        assert.equal(await evaluate('document.querySelectorAll("#practice-conversation p").length'),6);
        await capture('practice-report-1160.png');checks.push('two actual observation monologues, physical return and report/feedback produce exactly six saved lines and six main-owned voice requests');
        await evaluate('document.getElementById("mentor-close").click()');await until('!document.getElementById("word-master-dialog").open');await send('How was your survey?');
        assert.equal(requests.at(-1).practice.context.phase,'done');assert.equal(requests.at(-1).practice.speech.length,6);assert.equal(complete.game.harvest,0);
        await sleep(250);const count=requests.length,voices=voiceRequests.length;await close();await open('accept',false);await sleep(200);assert.equal(requests.length,count);assert.equal(voiceRequests.length,voices);
        assert.equal(await evaluate('document.getElementById("word-master-dialog").open'),false);checks.push('ordinary chat receives actual survey history, restart keeps it without generation, audio replay or automatic re-entry');await close();
        await open('consult');await until('document.getElementById("word-master-dialog").open');await evaluate('document.getElementById("mentor-next").click()');
        await until('!document.getElementById("word-master-dialog").open && document.getElementById("practice-conversation").textContent.includes("Should I")');
        assert.equal(await evaluate('document.getElementById("play").inert'),false);await send('yes');assert.equal(core.game.practice.current(session.load().state.game).phase,'consult');
        await send('Please explore and return.');assert.equal(core.game.practice.current(session.load().state.game).phase,'outbound');await send('stop');
        const stopped=core.game.practice.current(session.load().state.game);assert.equal(stopped.phase,'stopped');assert.equal(stopped.events.some(e=>e.kind==='returned'),false);
        checks.push('uncertainty uses normal free chat; bare yes keeps waiting, explicit input participates, stop works even when its subsequent CLI response fails');await close();
        await open('late');await until('document.getElementById("word-master-dialog").open');await evaluate('document.getElementById("mentor-next").click()');
        for(let i=0;i<400&&!release;i++)await sleep(20);assert.ok(release);const before=voiceRequests.length;
        await evaluate('document.getElementById("mentor-close").click()');release();await sleep(300);assert.equal(voiceRequests.length,before);
        assert.equal(core.game.practice.current(session.load().state.game).lines.length,1);checks.push('closing during the decision rejects late text/audio and leaves no automatic restart');
        assert.deepEqual(errors,[]);const summary={ok:true,directory,checks,errors,requests,voiceRequests};fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2));
        console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);await close();app.quit();
    }).catch(async error=>{errors.push(error.stack||String(error));fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:false,directory,checks,errors},null,2));console.error(error.stack);clearTimeout(timer);app.exit(1);});
}
