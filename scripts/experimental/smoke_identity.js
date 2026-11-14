'use strict';
// Real renderer/preload/storage and WebAudio, disposable profile; TTS transport is a deterministic fixture.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = typeof code === 'number' ? code : 1; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow, ipcMain } = require('electron');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-identity-'));
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs', 'identity-renderer-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true }); app.setPath('userData', directory); app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    let server, window, snapshot; const failures = [], checks = [];
    const store = require('./storage').createStore(directory), sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const js = code => window.webContents.executeJavaScript(code, true);
    async function wait(code, label) {
        for (let i = 0; i < 150; i++) { if (await js(code)) return; await sleep(50); }
        throw new Error(label + ': ' + JSON.stringify(await js('({text:document.body.innerText.slice(-800),screen:document.querySelector("#app")?.className})')));
    }
    const pcm = Buffer.alloc(44 + 2400 * 2);
    pcm.write('RIFF'); pcm.writeUInt32LE(pcm.length - 8, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16);
    pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(24000, 24); pcm.writeUInt32LE(48000, 28);
    pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(4800, 40);
    for (let i=0;i<2400;i++) pcm.writeInt16LE(Math.round(2400*Math.sin(i*2*Math.PI*440/24000)),44+i*2);
    async function mockVoice() {
        await js(`(() => {
            const original=window.fetch.bind(window),nativeStart=AudioBufferSourceNode.prototype.start;
            window.identityQueries=[];window.identityAudio=0;
            AudioBufferSourceNode.prototype.start=function(...args){identityAudio++;return nativeStart.apply(this,args)};
            const pcm=Uint8Array.from(atob(${JSON.stringify(pcm.toString('base64'))}),c=>c.charCodeAt(0));
            window.fetch=(url,options)=>{
                if(typeof url!=='string'||!url.startsWith('http://127.0.0.1:50021/'))return original(url,options);
                const u=new URL(url);
                if(u.pathname==='/speakers')return Promise.resolve(Response.json([{name:'Identity fixture',speaker_uuid:'identity-fixture',styles:[{id:1000,name:'Normal',type:'talk'}]}]));
                if(u.pathname==='/audio_query'){identityQueries.push(u.searchParams.get('text'));return Promise.resolve(Response.json({accent_phrases:[]}));}
                return Promise.resolve(new Response(pcm.slice().buffer,{headers:{'Content-Type':'audio/wav'}}));
            };
        })()`);
    }
    async function fill(value) {
        await js(`(() => {for(const [field,value] of Object.entries(${JSON.stringify(value)})){
            const input=document.querySelector('#word-identity-'+field);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
    }
    async function say(text) {
        await js(`(() => {const input=document.querySelector('.chat-form textarea');input.value=${JSON.stringify(text)};document.querySelector('.chat-form').requestSubmit();})()`);
    }
    app.whenReady().then(async () => {
        server = require('./serve').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_island.html?debug=1`;
        ipcMain.on('word-life-load', event => { event.returnValue = store.load(); });
        ipcMain.on('word-life-save', (event, value) => { const result=store.save(value); if(result.ok)snapshot=value;event.returnValue=result; });
        ipcMain.handle('word-voice-cache-get',()=>({ok:false}));ipcMain.handle('word-voice-cache-put',()=>({ok:false}));
        window = new BrowserWindow({ width: 1280, height: 900, show: false,
            webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('console-message', (_event,level,message)=>{if(level>=3)failures.push(message)});
        await window.loadURL(url); await wait('!!document.querySelector("#word-new-game:not(:disabled)")','bootstrap'); await mockVoice();
        await js(`GameI18n.setLanguage('ja');document.querySelector('.word-logo').click();document.querySelector('#word-new-game').click();document.querySelector('#word-reset-accept').click();
            for(const a of [0,1,1,1,0,0,0])document.querySelector('.word-questions fieldset button[data-answer="'+a+'"]').click();`);
        await wait('document.querySelector(".word-meeting").open','meeting');
        assert.equal(await js('document.querySelectorAll("#word-identity input").length'),3);
        assert.equal(await js('document.querySelectorAll(".word-identity-choices button").length'),9);
        const chosen={characterName:'<b>ピコ$&</b>',firstPerson:'わたし',playerAddress:'ご主人様'};
        await fill(chosen);
        assert.equal(await js('document.querySelector("#word-identity-preview b")'),null);
        assert.ok((await js('document.querySelector("#word-identity-preview").textContent')).includes(chosen.characterName));
        await js(`(() => {const c=document.querySelector('#word-signature'),r=c.getBoundingClientRect();c.setPointerCapture=()=>{};
            for(const type of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));})()`);
        assert.equal(await js('document.querySelector("#word-meeting-begin").disabled'),false);
        await fill({...chosen,characterName:''}); assert.equal(await js('document.querySelector("#word-meeting-begin").disabled'),true); await fill(chosen);
        await js(`document.querySelector('#word-voice-source').value='voicevox';document.querySelector('#word-voice-source').dispatchEvent(new Event('change'));document.querySelector('#word-voice-connect').click()`);
        await wait('Array.from(document.querySelector("#word-dialogue-voice").options).some(o=>o.value.includes("identity-fixture"))','voice fixture');
        await js(`document.querySelector('#word-dialogue-voice').value=Array.from(document.querySelector('#word-dialogue-voice').options).find(o=>o.value.includes('identity-fixture')).value;
            document.querySelector('#word-dialogue-voice').dispatchEvent(new Event('change'));document.querySelector('#word-identity-audition').click()`);
        await wait('identityAudio>0','actual WebAudio preview');
        assert.ok((await js('identityQueries')).some(t=>Object.values(chosen).every(value=>t.includes(value))));
        assert.ok(!snapshot?.state,'audition never creates a child save');
        await js('document.querySelector("#word-meeting-begin").click()');
        assert.equal(await js('Array.from(document.querySelectorAll("#word-identity input")).every(i=>i.disabled)'),true);
        await js('document.querySelector("#word-identity-characterName").value="Late edit"');
        await wait('document.querySelector("#app").classList.contains("playing")','signed game');
        assert.deepEqual(store.load().value.state.identity,{version:1,...chosen});
        assert.equal(await js('document.querySelector("#word-character-name").textContent'),chosen.characterName);
        await js(`document.querySelector('#word-read-aloud').checked=true;document.querySelector('#word-read-aloud').dispatchEvent(new Event('change'))`);
        await say(chosen.characterName+'！');assert.equal(snapshot.state.context.turns.at(-1).understandings[0].kind,'identity');
        await say('名前は？');await wait(`identityQueries.some(t=>t.includes(${JSON.stringify(chosen.characterName)})&&t.includes('だよ'))`,'spoken identity answer');
        await say('私の呼び方は？');assert.ok((await js('document.querySelector(".bubble").textContent')).includes(chosen.playerAddress));
        await say('おはよう');assert.equal(snapshot.state.context.turns.at(-1).understandings[0].kind,'greeting');
        assert.ok((await js('document.querySelector(".bubble").textContent')).includes(chosen.playerAddress));
        checks.push({threeFields:true,threeChoicesEach:true,freeLiteralInput:true,invalidBlocksSignature:true,trialDoesNotSave:true,actualWebAudio:true,spokenChosenWords:true,signedIdentityPersisted:true});
        for(const [raw,expected] of [
            ['あなたは休んでいる',chosen.firstPerson+'が休んでいる、という話だね。'],
            ['あなたは休んでいない',chosen.firstPerson+'が休んでいない、という話だね。'],
            ['私は休んでいる',chosen.playerAddress+'が休んでいる、という話だね。']]){
            await say(raw);assert.equal(await js('document.querySelector(".bubble").textContent'),expected);
            await wait('identityQueries.includes('+JSON.stringify(expected)+')','personal report audio');
        }
        checks.push({existingReportsPersonalized:true,threeReportDisplaysAndSpokenTexts:true});
        await js('document.querySelector("#word-identity-choose").click();dispatchEvent(new Event("beforeunload"))');
        const before=JSON.stringify(snapshot);await fill({...chosen,characterName:'未保存'});
        await js('document.querySelector("#word-identity-audition").click()');await sleep(250);await js('dispatchEvent(new Event("beforeunload"))');
        assert.equal(JSON.stringify(snapshot),before,'edits and preview freeze the world and cannot alter saved identity');
        await js('document.querySelector("#word-voice-continue").click();document.querySelector("#word-identity-choose").click()');
        assert.equal(await js('document.querySelector("#word-identity-characterName").value'),chosen.characterName);
        const next={characterName:'Nova',firstPerson:'ぼく',playerAddress:'あなた'};await fill(next);await js('document.querySelector("#word-identity-save").click()');
        assert.deepEqual(snapshot.state.identity,{version:1,...next});assert.equal(snapshot.state.identityHistory[0].characterName,chosen.characterName);
        assert.deepEqual(snapshot.state.knowledge,JSON.parse(before).state.knowledge);assert.deepEqual(snapshot.state.records,JSON.parse(before).state.records);
        const locales=['ja','en','zh-CN','ru','es-ES','pt-BR','de'];
        for(const locale of locales){
            await js(`GameI18n.setLanguage(${JSON.stringify(locale)})`);await sleep(100);
            assert.deepEqual(await js('Object.fromEntries(ExperimentalWordIdentity.fields.map(f=>[f,document.querySelector("#word-identity-"+f).value]))'),next);
            const expected=await js('ExperimentalWordIdentity.format(GameI18n.translate("{firstPerson}は{characterName}。{playerAddress}、よろしくね。"),ExperimentalWordIdentity.draft(Object.fromEntries(ExperimentalWordIdentity.fields.map(f=>[f,document.querySelector("#word-identity-"+f).value]))))');
            assert.equal(await js('document.querySelector("#word-identity-preview").textContent'),expected);
            for(const width of [1280,390]){
                window.setContentSize(width,900);await sleep(150);await js('document.querySelector(".word-meeting").scrollTop=0');
                assert.equal(await js('document.querySelector(".word-meeting").scrollWidth>document.querySelector(".word-meeting").clientWidth+1'),false,locale+'/'+width);
                await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});await sleep(100);
                fs.writeFileSync(path.join(evidence,locale+'-'+width+'.png'),(await window.webContents.capturePage()).toPNG());
            }
        }
        await js('GameI18n.setLanguage("ja");document.querySelector("#word-voice-continue").click()');
        await say(chosen.characterName);assert.equal(snapshot.state.context.turns.at(-1).understandings[0].kind,'identity');
        await window.loadURL(url);await wait('!!document.querySelector("#word-new-game:not(:disabled)")','reload bootstrap');
        await js('document.querySelector(".word-logo").click();document.querySelector("#word-continue").click()');await wait('document.querySelector("#app").classList.contains("playing")','continue');
        assert.equal(await js('document.querySelector("#word-character-name").textContent'),'Nova');assert.deepEqual(store.load().value.state.identity,{version:1,...next});
        checks.push({explicitSave:true,unsavedEditsDiscarded:true,worldFrozen:true,knowledgeAndRecordsUnchanged:true,oldNameRetained:true,localeTemplates:7,literalValuesPreserved:true,viewports:2,restart:true});
        const core=require('../../experimental_word_learning_core'),worldApi=require('../../experimental_word_learning_world'),catalog=require('../../experimental_word_learning_catalog.json');
        const legacy={version:1,appearance:'stone',state:core.create({foundation:false,life:false,speech:'gesture'},catalog),world:worldApi.create()};
        await window.loadURL('about:blank');assert.ok(store.save(legacy).ok);snapshot=legacy;
        await window.loadURL(url);await wait('!!document.querySelector("#word-new-game:not(:disabled)")','legacy bootstrap');
        await js('document.querySelector(".word-logo").click();document.querySelector("#word-continue").click()');await wait('document.querySelector("#app").classList.contains("playing")','legacy continue');
        assert.equal(snapshot.state.identity,undefined);await js('document.querySelector("#word-identity-choose").click()');
        await fill({characterName:'Gesti',firstPerson:'ぼく',playerAddress:'あなた'});await js('document.querySelector("#word-identity-save").click();document.querySelector("#word-voice-continue").click()');
        await say('Gesti');assert.equal(snapshot.state.context.turns.at(-1).expression.channel,'gesture');
        assert.equal(snapshot.state.settings.speech,'gesture');assert.deepEqual(snapshot.state.knowledge.meanings,[]);assert.deepEqual(snapshot.state.knowledge.relations,[]);
        checks.push({legacyChildConfigurable:true,noNewGameRequired:true,gestureOnlyPreserved:true,noVocabularyGranted:true});
        assert.deepEqual(failures,[]);const result={ok:true,directory,checks,failures};
        fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({evidence,...result}));
    }).catch(error=>{fs.writeFileSync(path.join(evidence,'failure.txt'),String(error.stack)+'\n'+JSON.stringify(failures));console.error(error);console.error(evidence);process.exitCode=1;})
      .finally(()=>{window?.destroy();if(server){server.closeAllConnections();server.close();}app.exit(process.exitCode||0)});
}
