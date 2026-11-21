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
    let window,time=0;const errors=[],checks=[],packets=[];const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const evaluate=code=>window.webContents.executeJavaScript(code);
    async function capture(name){await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');await sleep(250);fs.writeFileSync(path.join(directory,name),(await window.webContents.capturePage()).toPNG());}
    async function until(code){for(let i=0;i<200;i++){if(await evaluate(code))return;await sleep(50);}throw Error('Timed out: '+code);}
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({checks,errors}));app.exit(1);},180000);
    function open(){
        const responder={async reply(p){packets.push(p);if(p.input==='QUOTA')return {ok:false,error:'quota'};
            const teaching=p.input==='この実はコロです。';const action=['eat','rest','walk'].includes(p.input)?p.input:null;
            const proposal={reply:action?'I will try.':'I am on the island. '+p.world.currentAction,
                interpretation:{kind:teaching?'teaching':action?'request':'question',summary:teaching?'実をコロと呼ぶと教わった。まだ自分では確かめていない。':'島でのいまの様子を聞かれた。'},
                memories:teaching?[{sourceId:p.id,quote:p.input,text:'The player calls this berry Koro; unverified.'}]:[],references:p.memories.slice(-1).map(m=>m.sourceId),
                terms:teaching?[{word:'実',quote:p.input},{word:'コロ',quote:p.input}]:[],action};
            if(p.input==='BAD')proposal.terms=[{word:'forged',quote:p.input}];return {ok:true,proposal};},cancel(){},dispose(){}};
        const {createSession,createStore}=require('./native_store');
        const session=createSession({store:createStore(path.join(directory,'save')),responder,clock:()=>time+=100});
        window=require('./native_window').openWindow(session,{show:true});
        window.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});return session;
    }
    app.whenReady().then(async()=>{
        open();await until('!document.getElementById("questions").hidden');
        for(let i=0;i<7;i++)await evaluate('document.querySelector("#question-choices button").click()');
        assert.equal(await evaluate('document.getElementById("setup").hidden'),false);
        await evaluate(`document.getElementById('name').value='ピコ';document.getElementById('self').value='ぼく';document.getElementById('player').value='きみ';document.getElementById('setup').requestSubmit();`);
        await until('!document.getElementById("play").hidden');await until('imagesLoaded===totalImages');await sleep(150);checks.push('original seven questions, appearance, separate identity and real island renderer');
        await capture('island-desktop.png');
        async function send(text){await evaluate(`document.getElementById('input').value=${JSON.stringify(text)};document.getElementById('compose').requestSubmit();`);await until('!document.getElementById("send").disabled');}
        await send('Where are you?');assert.equal(packets.at(-1).world.location,'island');assert.ok(packets.at(-1).world.visible.length<=6);assert.ok(JSON.stringify(packets.at(-1).world).length<=2000);
        await send('この実はコロです。');checks.push('world supplied and exact quoted teaching');
        // Exercise actual authority and movement ticks, without waiting in wall-clock time.
        const result=await evaluate(`(async()=>{let s=await nativeMemory.load();if(!s.state.game.seen.includes('berry:1'))return {unseen:true};return {unseen:false};})()`);
        assert.equal(result.unseen,false,'Seeded scene must make food visible for this playtest');
        await send('eat');const meal=await evaluate(`(async()=>{let result;for(let i=0;i<12000;i++){result=await nativeMemory.pulse(false);if(result.game.mode==='idle')break;}return result.game;})()`);
        assert.ok(meal.receipts.some(r=>r.kind==='eat'&&r.taste==='sweet'));checks.push('game checked proposal, routed movement and actual meal receipt');
        await send('What did that taste like?');assert.ok(packets.at(-1).world.results.some(r=>r.kind==='eat'));checks.push('completed result supplied to following conversation');
        await evaluate('document.getElementById("tab-diary").click()');await evaluate('document.fonts.ready');await sleep(100);
        assert.ok(await evaluate('!!document.querySelector(".book-drawing")'));assert.ok((await evaluate('document.getElementById("diary").textContent')).includes('甘い'));
        assert.equal(await evaluate('document.querySelector(".book-body").style.fontSize'), '');
        await capture('diary-desktop.png');checks.push('pencil illustration, handwritten vertical paper, actual meal evidence and originals');
        await evaluate('document.getElementById("tab-stars").click()');assert.ok(await evaluate('!!document.querySelector("#stars .teaching")'));assert.ok(await evaluate('!!document.querySelector("#stars .experience")'));
        assert.ok(await evaluate('[...document.querySelectorAll("#stars text")].every(n=>n.textContent.length<=24)'));await evaluate('document.querySelector("#stars .word-node").dispatchEvent(new Event("click"))');assert.ok(await evaluate('document.getElementById("star-record").textContent.length>0'));checks.push('short word stars, distinct actual-experience edges, selectable evidence');
        for(const width of [1160,420]){window.setContentSize(width,850);for(const locale of core.locales){await evaluate(`document.getElementById('locale').value=${JSON.stringify(locale)};document.getElementById('locale').dispatchEvent(new Event('change'));`);
                for(const tab of ['chat','diary','stars']){await evaluate(`document.getElementById('tab-${tab}').click()`);await sleep(35);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),locale+':'+tab);}
            }
            await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));document.getElementById('tab-diary').click();`);await sleep(100);
            await capture('diary-'+width+'.png');
            await evaluate('document.getElementById("tab-stars").click()');await capture('stars-'+width+'.png');}
        checks.push('seven locales, desktop/mobile three views, no horizontal clipping');
        await new Promise(r=>{window.once('closed',r);window.close();});open();await until('!document.getElementById("play").hidden');await send('Where are you?');assert.ok(packets.at(-1).memories.some(m=>m.raw==='この実はコロです。'));checks.push('restart preserves original sources, individual and island/results');
        await send('BAD');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('記憶候補'));await send('QUOTA');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('利用枠'));checks.push('forged words rejected and quota has no paid fallback');
        const saved=JSON.parse(fs.readFileSync(path.join(directory,'save/native-memory.json'),'utf8'));assert.ok(core.validState(saved));assert.deepEqual(errors,[]);
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,checks,errors,packets},null,2));console.log(JSON.stringify({ok:true,directory,checks,errors}));clearTimeout(timer);window.close();app.quit();
    }).catch(error=>{fs.writeFileSync(path.join(directory,'failure.json'),JSON.stringify({error:error.stack,checks,errors},null,2));console.error(directory,error.stack);clearTimeout(timer);app.exit(1);});
}
