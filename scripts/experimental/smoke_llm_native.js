'use strict';
const fs=require('node:fs'),path=require('node:path');
if(!process.versions.electron || process.type!=='browser'){
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=require('node:child_process').spawn(require('electron'),[__filename],{env,stdio:'inherit',windowsHide:true});
    child.on('exit',code=>{process.exitCode=code || 0;});child.on('error',()=>{process.exitCode=1;});
} else {
    const assert=require('node:assert/strict'),{app}=require('electron');
    const directory=fs.mkdtempSync(path.resolve(__dirname,'../../docs/.local-history/verification-runs/native-renderer-'));
    app.disableHardwareAcceleration();app.setPath('userData',path.join(directory,'profile'));
    const core=require('../../experimental_word_llm_native'),{createStore,createSession}=require('./native_store');
    const errors=[],checks=[],packets=[];let window;
    const timer=setTimeout(()=>{fs.writeFileSync(path.join(directory,'timeout.json'),JSON.stringify({errors,checks}));app.exit(1);},90000);
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const evaluate=code=>window.webContents.executeJavaScript(code);
    async function until(code){for(let i=0;i<180;i++){if(await evaluate(code))return;await sleep(50);}throw Error('Timed out: '+code);}
    app.whenReady().then(async()=>{
        const fixture=path.join(directory,'structured-fixture.cjs');
        fs.writeFileSync(fixture,`console.log(JSON.stringify({event:'init'}));let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',s=>input+=s);process.stdin.on('end',()=>{
            const prompt=JSON.parse(input).message.content,p=JSON.parse(prompt.slice(prompt.indexOf('\\n')+1));
            const kind=p.input==='Koro is sweet.'?'teaching':'question';
            const proposal={reply:kind==='teaching'?'You taught me that Koro is sweet.':p.memories.some(m=>m.raw==='Koro is sweet.')?'You told me Koro is sweet.':'No source.',
                interpretation:{kind,summary:'An unverified account from the player.'},memories:kind==='teaching'?[{sourceId:p.id,quote:p.input,text:'The player says Koro is sweet; unverified.'}]:[],references:kind==='question'?p.memories.map(m=>m.sourceId):[]};
            if(p.input==='BAD'){proposal.interpretation.kind='teaching';proposal.memories=[{sourceId:p.id,quote:'forged',text:'bad'}];}
            const output=p.input==='QUOTA'?{status:'ERROR',error:'RESOURCE_EXHAUSTED: quota reached'}:{status:'SUCCESS',response:JSON.stringify(proposal),stats:{tools:{totalCalls:0}}};
            setTimeout(()=>console.log(JSON.stringify({event:'result',result:output})),p.input==='WAIT'?5000:0);
        });`);
        function open(){
            const responder=require('./gemini_reply').createResponder(path.join(directory,'connection'),{entry:fixture,skipAuthCheck:true,protocol:core.protocol});
            const reply=responder.reply;responder.reply=p=>{packets.push(structuredClone(p));return reply(p);};
            const session=createSession({store:createStore(path.join(directory,'save')),responder});
            window=require('./native_window').openWindow(session,{show:false,legacy:true});
            window.webContents.on('console-message',(_event,level,message)=>{if(level===3)errors.push(message);});
            return session;
        }
        open();await until('!!window.nativeMemory && !document.getElementById("setup").hidden');
        await evaluate(`document.getElementById('name').value='原文の名前'+'x'.repeat(95);document.getElementById('self').value='I';document.getElementById('player').value='you';document.getElementById('setup').requestSubmit();`);
        await until('!document.getElementById("play").hidden');checks.push('separate character setup');
        async function send(input){await evaluate(`document.getElementById('input').value=${JSON.stringify(input)};document.getElementById('compose').requestSubmit();`);await until('!document.getElementById("send").disabled');}
        await send('Koro is sweet.');assert.equal(await evaluate('document.querySelectorAll("#diary .record").length'),1);
        assert.ok((await evaluate('document.getElementById("diary").textContent')).includes('Koro is sweet.'));checks.push('teaching and quoted diary');
        await send('What did I teach you?');assert.ok((await evaluate('document.getElementById("conversation").textContent')).includes('You told me Koro is sweet.'));
        assert.ok(packets[1].memories.some(m=>m.raw==='Koro is sweet.'));checks.push('original source recalled');
        await evaluate(`document.getElementById('tab-stars').click();document.querySelector('.star-buttons button').click();`);
        assert.ok(await evaluate('!!document.querySelector("#stars svg .reference")'));assert.ok((await evaluate('document.getElementById("star-record").textContent')).includes('Koro is sweet.'));checks.push('selectable constellation and declared references');
        for(const width of [1160,420]){
            window.setContentSize(width,850);
            for(const locale of core.locales){
                await evaluate(`document.getElementById('locale').value=${JSON.stringify(locale)};document.getElementById('locale').dispatchEvent(new Event('change'));`);await sleep(60);
                assert.equal(await evaluate('document.documentElement.lang'),locale);
                assert.equal(await evaluate('document.getElementById("character-name").textContent'),'原文の名前'+'x'.repeat(95));
                assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
                await evaluate(`document.getElementById('tab-chat').click();`);
                assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
                await evaluate(`document.getElementById('tab-stars').click();`);
                if(locale!=='ja')assert.notEqual(await evaluate('document.getElementById("tab-diary").textContent'),'日記');
            }
            await evaluate(`document.getElementById('locale').value='ja';document.getElementById('locale').dispatchEvent(new Event('change'));`);await sleep(60);
            fs.writeFileSync(path.join(directory,'stars-'+width+'.png'),(await window.webContents.capturePage()).toPNG());
            await evaluate(`document.getElementById('tab-diary').click();`);await sleep(60);
            fs.writeFileSync(path.join(directory,'diary-'+width+'.png'),(await window.webContents.capturePage()).toPNG());
            await evaluate(`document.getElementById('tab-stars').click();`);
        }
        checks.push('seven locales at desktop and mobile widths, literal names preserved');
        await new Promise(resolve=>{window.once('closed',resolve);window.close();});open();await until('!document.getElementById("play").hidden');
        assert.equal(await evaluate('document.querySelectorAll("#diary .record").length'),2);checks.push('disk save and window restart');
        await send('What did I teach you?');assert.ok(packets.at(-1).memories.some(m=>m.sourceId==='turn-1'));checks.push('recall after restart');
        await send('BAD');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('記憶候補'));checks.push('bad quote rejects entire proposal');
        await send('QUOTA');assert.ok((await evaluate('document.getElementById("status").textContent')).includes('利用枠'));checks.push('quota without paid fallback');
        await evaluate(`document.getElementById('input').value='WAIT';document.getElementById('compose').requestSubmit();`);await until('!document.getElementById("cancel").hidden');
        await sleep(100);await evaluate(`document.getElementById('input').value='next draft';document.getElementById('cancel').click();`);await until('!document.getElementById("send").disabled');
        assert.equal(await evaluate('document.getElementById("input").value'),'next draft');checks.push('explicit cancellation preserves original and newer draft');
        const saved=JSON.parse(fs.readFileSync(path.join(directory,'save/native-memory.json'),'utf8'));assert.ok(core.validState(saved));
        assert.equal(saved.turns.at(-1).status,'failed');assert.equal(saved.turns.filter(t=>t.result?.memories.length).length,1);
        for(const p of packets)assert.ok(core.validPacket(p));assert.deepEqual(errors,[]);
        fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify({ok:true,checks,errors,packets},null,2));
        console.log(JSON.stringify({directory,ok:true,checks,errors}));clearTimeout(timer);window.close();app.quit();
    }).catch(error=>{fs.writeFileSync(path.join(directory,'failure.json'),JSON.stringify({error:error.stack,errors,checks},null,2));console.error(directory,error.stack);clearTimeout(timer);app.exit(1);});
}
