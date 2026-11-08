'use strict';
const fs = require('node:fs'), path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename, ...process.argv.slice(2)], { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const { app, BrowserWindow } = require('electron'), assert = require('node:assert/strict');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-dungeon-session-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    const walkingSmoke = process.argv.includes('--walking-smoke');
    const smoke = process.argv.includes('--smoke') || walkingSmoke; let server;
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const win = new BrowserWindow({ width: 1440, height: 1000, show: !smoke, autoHideMenuBar: true,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        win.setMenu(null); win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        const errors = []; win.webContents.on('console-message', event => { if (event.level === 'error' || event.level >= 3) errors.push(event.message); });
        const url = 'http://127.0.0.1:' + server.address().port + '/experimental_word_dungeon.html' + (smoke ? '?debug=1' : '');
        await win.loadURL(url);
        if (!smoke) { console.log('Island and dungeon session: ' + url); return; }
        const js = async code => {
            try { return await win.webContents.executeJavaScript('(function(){return eval(' + JSON.stringify(code) + ');})()', true); }
            catch (error) { console.error(JSON.stringify({ code: code.slice(0, 200), errors })); throw error; }
        };
        const settle = () => js('document.fonts.ready.then(()=>new Promise(resolve=>setTimeout(resolve,150)))');
        await js(`new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(document.getElementById('word-new-game')&&!document.getElementById('word-new-game').disabled){clearInterval(timer);resolve();}else if(++n>100){clearInterval(timer);reject(new Error('startup timeout'));}},100);})`);
        const startNew = async () => {
            await js(`localStorage.setItem('dungeon-sentinel','keep');sessionStorage.setItem('dungeon-sentinel','keep');document.querySelector('.word-logo').click();document.getElementById('word-new-game').click();document.getElementById('word-reset-accept').click();const settings=document.querySelector('form');settings.querySelector('select').value=${JSON.stringify(walkingSmoke ? 'robot' : 'beetle')};${walkingSmoke ? "settings.querySelectorAll('select')[2].value='no';settings.querySelectorAll('select')[3].value='gesture';" : ''}settings.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true}));void 0`);
            await settle();
        };
        await startNew();
        await settle();
        const send = async raw => { await js(`const input=document.querySelector('.chat-form textarea');input.value=${JSON.stringify(raw)};document.querySelector('.chat-form').requestSubmit();void 0`); await settle(); };
        // Exercise the public exploration control; there is no manual turn button.
        const exploreOnce = () => js(`new Promise((resolve,reject)=>{const before=window.__child.dungeonLearning.actions.length;document.getElementById('dungeon-auto').click();let n=0;const timer=setInterval(()=>{if(window.__child.dungeonLearning.actions.length>before){clearInterval(timer);document.getElementById('dungeon-auto').click();resolve();}else if(++n>500){clearInterval(timer);reject(new Error('exploration timeout'));}},20);})`);
        if (walkingSmoke) {
            const capture = () => js(`const original=ExperimentalWordDungeonLearning;window.ExperimentalWordDungeonLearning={...original,create(state,world){window.__child=state;window.__world=world;window.__session=original.create(state,world);return window.__session;}};document.getElementById('word-dungeon').click();void 0`);
            const waitFor = condition => js(`new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(${condition}){clearInterval(timer);resolve();}else if(++n>400){clearInterval(timer);reject(new Error('walking flow timeout'));}},200);})`);
            await capture();
            assert.equal(await js('window.__child.settings.life'), false);
            for (const raw of ['横にいる敵を避けて','避けて','階段わかる？','右上','それであっているよ','うん','階段まで動いて','階段に移動して']) await send(raw);
            assert.equal(await js("window.__child.dungeonLearning.lexicon.some(e=>e.word==='階段')"), true);
            assert.equal(await js('window.__child.dungeonLearning.actions.length'), 0);
            assert.equal(await js("window.__child.knowledge.meanings.some(e=>e.id==='walk')"), false);
            const originalIndex = await js("window.__child.dungeonLearning.inputs.findIndex(e=>e.result.input.raw==='階段まで動いて')");
            const originalInput = await js('JSON.stringify(window.__child.dungeonLearning.inputs['+originalIndex+'])');
            let checked=0;
            for (const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de']) {
                await js('GameI18n.setLanguage('+JSON.stringify(locale)+');void 0'); await settle();
                for (const width of [1440,390]) { win.setContentSize(width,1000);await settle();assert.equal(await js('document.documentElement.scrollWidth>innerWidth'),false,locale+':'+width); }
                checked++;
            }
            await js("GameI18n.setLanguage('ja');void 0");win.setContentSize(1440,1000);await settle();
            assert.equal(await js("document.getElementById('dungeon-step')"), null);
            await exploreOnce();
            await send('今の動きが歩くことだよ');
            assert.equal(await js("window.__child.knowledge.meanings.some(e=>e.id==='walk'&&e.source==='experienced_life')"),true);
            assert.equal(await js("document.getElementById('conversation').lastElementChild.classList.contains('conversation-help')"),true);
            assert.equal(await js('window.__child.dungeonLearning.actions.length'),1);
            await send('階段まで動いて'); await send('それであっているよ');
            assert.equal(await js('window.__child.dungeonLearning.actions.length'),1);
            await send('階段に移動して');
            assert.equal(await js('!!window.__session.goal'),true);
            const beforeTyping=await js('window.__child.dungeonLearning.actions.length');
            await js("document.querySelector('.chat-form textarea').value='待って';new Promise(resolve=>setTimeout(resolve,1200))");
            assert.equal(await js('window.__child.dungeonLearning.actions.length'),beforeTyping);
            assert.equal(await js('window.__session.goal'),null);
            await js("document.querySelector('.chat-form textarea').value='';void 0");
            await send('階段まで進んで');await waitFor('window.__session.complete');
            assert.equal(await js("(()=>{const lines=Array.from(document.querySelectorAll('#conversation > p:not([data-speaker=player]):not(.conversation-help)'));return lines.length>0&&lines.every(e=>!e.textContent.includes('頼まれた場所へ'));})()"),true);
            assert.equal(await js('JSON.stringify(window.__child.dungeonLearning.inputs['+originalIndex+'])'),originalInput);
            await js("document.getElementById('dungeon-return').click();void 0");await send('散歩しよう');
            assert.equal(await js("JSON.parse(document.querySelector('pre').textContent).result.understandings[0].complete"),true);
            assert.equal(await js('window.__world.destination'),'path');
            // A fresh public session tests the opposite direction with actual autonomous island movement.
            await win.loadURL(url);
            await js(`new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(document.getElementById('word-new-game')&&!document.getElementById('word-new-game').disabled){clearInterval(timer);resolve();}else if(++n>100){clearInterval(timer);reject(new Error('restart timeout'));}},100);})`);
            await startNew();await capture();await js("document.getElementById('dungeon-return').click();void 0");
            await waitFor("window.__world.mode==='move'");
            await send('その動きが歩くことだよ');
            assert.equal(await js("window.__child.knowledge.meanings.some(e=>e.id==='walk')"),false);
            await waitFor("window.__child.knowledge.meanings.some(e=>e.id==='walk')");
            assert.equal(await js("window.__child.experiences.some(e=>e.activity==='walk'&&e.walking.space==='island')"),true);
            await js("document.getElementById('word-dungeon').click();void 0");
            await send('階段に移動して');await send('右上');await send('それであっているよ');
            await send('階段まで動いて');await send('うん');await send('階段まで動いて');
            await waitFor('window.__session.complete');
            await js('new Promise(resolve=>setTimeout(resolve,1200))');
            assert.equal(await js("document.querySelector('.status').textContent.includes('階段に着いた')"),true);
            assert.equal(await js("document.querySelector('.bubble').textContent.includes('頼まれた場所へ')"),false);
            assert.equal(await js('window.__child.dungeonLearning.warnings.length'),0);
            const artifactArg=process.argv.find(a=>a.startsWith('--artifacts='));
            const artifacts=artifactArg?path.resolve(artifactArg.slice('--artifacts='.length)):directory;fs.mkdirSync(artifacts,{recursive:true});
            await js("document.querySelector('pre').parentElement.style.display='none';void 0");
            for(const[name,width]of[['desktop',1440],['mobile',390]]){win.setContentSize(width,1000);await settle();fs.writeFileSync(path.join(artifacts,'walking-'+name+'.png'),(await win.capturePage()).toPNG());}
            assert.deepEqual(errors,[]);
            console.log(JSON.stringify({walkingSession:{locales:checked,viewports:14,lifeInitiallyOff:true,reportedEightInputs:true,
                actualDungeonStep:true,actualIslandWalk:true,dungeonToIsland:true,islandToDungeon:true,oldUnderstandingPreserved:true,
                goalReachesStairs:true,typingStopsGoal:true,confirmationDoesNotMove:true,gestureGuidanceSeparate:true,errors,directory,artifacts}}));
            server.closeAllConnections();await new Promise(resolve=>server.close(resolve));server=null;
            app.removeAllListeners('window-all-closed');win.destroy();app.exit(0);return;
        }
        await send('ぽぽは休むことだよ');
        await js(`document.querySelector('[aria-controls="notebook"]').click();void 0`);
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('ぽぽ'));
        await js(`document.querySelector('[aria-controls="conversation"]').click();window.__islandRecords=null;const original=ExperimentalWordDungeonLearning;window.ExperimentalWordDungeonLearning={...original,create(state,world){window.__child=state;if(!window.__islandRecords)window.__islandRecords=JSON.stringify(state.records);return original.create(state,world);}};document.getElementById('word-dungeon').click();void 0`);
        assert.equal(await js("document.querySelector('[id^=dungeon-point-]')===null"), true);
        await send('右に敵がいるから避けて');
        const reportedOriginal = await js('JSON.stringify(window.__child.dungeonLearning.inputs.at(-1))');
        const reportedIndex = await js('window.__child.dungeonLearning.inputs.length-1');
        await send('避けて'); await send('右');
        assert.ok((await js("document.getElementById('conversation').lastElementChild.textContent")).includes('候補が複数'));
        await send('右の赤いやつ'); await send('敵');
        assert.equal(await js("window.__child.dungeonLearning.lexicon.some(e=>e.word==='敵'&&e.target==='dungeon:enemy:1')"), true);
        await send('階段'); await send('階段わかる？');
        assert.ok((await js("document.getElementById('conversation').lastElementChild.textContent")).includes('階段'));
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), 0);
        assert.equal(await js('JSON.stringify(window.__child.dungeonLearning.inputs[' + reportedIndex + '])'), reportedOriginal);
        // Reentry keeps confirmed vocabulary but invalidates the unfinished question.
        await js("document.getElementById('dungeon-return').click();document.getElementById('word-dungeon').click();void 0");
        await send('階段にいって');
        assert.ok((await js("document.getElementById('conversation').textContent")).includes('どれのことかな'));
        await send('はい？');
        assert.equal(await js("window.__child.dungeonLearning.lexicon.some(e=>e.word==='階段')"), false);
        await send('階段にいって');
        assert.equal(await js("document.getElementById('dungeon-step')"), null);
        await js("document.getElementById('dungeon-auto').click();new Promise(resolve=>setTimeout(resolve,1000))");
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), 0);
        await send('右上にあるもの'); await send('はい');
        await send('階段へ向かって'); await send('はい');
        await send('横にいるのは敵だから避けてね');
        const firstOriginal = await js('JSON.stringify(window.__child.dungeonLearning.inputs.at(-1))');
        const firstIndex = await js('window.__child.dungeonLearning.inputs.length-1');
        await send('そうだよ'); await send('横にいるのは敵だから避けてね'); await send('近づかずに離れること');
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), 0);
        await send('敵をよけてください');
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'avoid');
        assert.equal(await js('JSON.stringify(window.__child.dungeonLearning.inputs[' + firstIndex + '])'), firstOriginal);
        await send('敵はアカだよ'); await send('はい');
        await send('アカに行って');
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'obey');
        const questionActions = await js('window.__child.dungeonLearning.actions.length');
        await send('階段に行って？');
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), questionActions);
        await send('階段わかる？');
        assert.ok((await js("document.getElementById('conversation').lastElementChild.textContent")).includes('前に教えて'));
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), questionActions);
        await send('アカは危ない'); await send('はい'); await send('アカは危ない');
        await send('アカに行って');
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'diverged');
        const divergence = await js("document.querySelector('.status').textContent");
        assert.ok(divergence.includes(await js("GameI18n.translate('その相手は危ないと教わったから、指示とは違うけれど距離を取るね。')")), divergence);
        assert.equal(await js("JSON.stringify(window.__child.records.slice(0,JSON.parse(window.__islandRecords).length))===window.__islandRecords"), true);
        assert.equal(await js("window.__child.dungeonLearning.lexicon.some(a=>a.word==='アカ')"), true);
        await js(`document.querySelector('[aria-controls="notebook"]').click();void 0`);
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('アカは危ない'));
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('ぽぽ'));
        await js("document.querySelector('[aria-controls=conversation]').click();void 0");
        const artifactArg = process.argv.find(a => a.startsWith('--artifacts='));
        const artifacts = artifactArg ? path.resolve(artifactArg.slice('--artifacts='.length)) : directory;
        fs.mkdirSync(artifacts, { recursive: true });
        let checked = 0;
        for (const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de']) {
            await js('GameI18n.setLanguage(' + JSON.stringify(locale) + ');void 0'); await settle();
            assert.equal(await js("document.getElementById('gameCanvas').getAttribute('aria-label')"),
                await js("GameI18n.translate('スカルダンジョン B1F')"));
            for (const width of [1440,390]) {
                win.setContentSize(width, 1000); await settle();
                assert.equal(await js('document.documentElement.scrollWidth>innerWidth'), false, locale + ':' + width);
                assert.equal(await js("document.querySelector('.bubble').getBoundingClientRect().top>=document.querySelector('.word-dungeon-hud').getBoundingClientRect().bottom"), true, 'bubble clears HUD: ' + locale + ':' + width);
                assert.deepEqual(await js("Array.from(document.querySelectorAll('.body-status meter'),meter=>meter.value)"), [35,85], 'body meters: ' + locale + ':' + width);
            }
            checked++;
        }
        await js("GameI18n.setLanguage('ja');void 0"); await settle();
        await js("document.querySelector('pre').parentElement.hidden=true;void 0");
        for (const [name,width] of [['desktop',1440],['mobile',390]]) {
            win.setContentSize(width,1000); await settle();
            fs.writeFileSync(path.join(artifacts,'dungeon-'+name+'.png'),(await win.capturePage()).toPNG());
        }
        await js("document.getElementById('dungeon-return').click();void 0"); await settle();
        assert.equal(await js("location.pathname.endsWith('experimental_word_island.html')"),true);
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('アカは危ない'));
        await js("window.__sameChild=window.__child;document.getElementById('word-dungeon').click();void 0"); await settle();
        assert.equal(await js("window.__sameChild===window.__child"), true);
        await js("history.back();new Promise(resolve=>setTimeout(resolve,500))");
        assert.equal(await js("document.querySelector('.word-dungeon-stage')===null"), true);
        await js("history.forward();new Promise(resolve=>setTimeout(resolve,500))");
        assert.equal(await js("window.__sameChild===window.__child&&!!document.querySelector('.word-dungeon-stage')"), true);
        await exploreOnce(); await settle();
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'retreat');
        const autoBefore = await js('window.__child.dungeonLearning.actions.length');
        await js("document.getElementById('dungeon-auto').click();void 0");
        await js('new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(window.__child.dungeonLearning.actions.length>' + autoBefore
            + '){clearInterval(timer);resolve();}else if(++n>150){clearInterval(timer);reject(new Error("auto timeout"));}},200);})');
        await js("document.getElementById('dungeon-auto').click();void 0");
        await js("document.getElementById('word-pause').click();void 0"); await settle();
        const before = await js("window.__child.dungeonLearning.actions.length");
        await js("document.getElementById('dungeon-auto').click();new Promise(resolve=>setTimeout(resolve,1000))");
        assert.equal(await js("window.__child.dungeonLearning.actions.length"), before);
        await js("document.getElementById('word-pause').getAttribute('aria-pressed')==='true'&&document.getElementById('word-pause').click();void 0");
        await js("document.getElementById('dungeon-auto').click();new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(document.getElementById('dungeon-auto').disabled){clearInterval(timer);resolve();}else if(++n>200){clearInterval(timer);reject(new Error('arrival timeout'));}},100);})");
        assert.equal(await js("document.getElementById('dungeon-auto').disabled"), true);
        const arrivedActions = await js('window.__child.dungeonLearning.actions.length');
        await send('階段にいって');
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), arrivedActions);
        assert.ok((await js("document.querySelector('.status').textContent")).includes('階段に着いた'));
        await js("window.__child.settings.speech='gesture';void 0");
        await send('赤いものはミミだよ');
        assert.equal(await js("document.getElementById('conversation').lastElementChild.classList.contains('conversation-help')"), true);
        assert.equal(await js("document.querySelector('.bubble').textContent.includes('輪郭')"), false);
        await send('はい');
        assert.equal(await js("window.__child.dungeonLearning.lexicon.some(e=>e.word==='ミミ')"), true);
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), arrivedActions);
        assert.equal(await js("localStorage.getItem('dungeon-sentinel')==='keep'&&sessionStorage.getItem('dungeon-sentinel')==='keep'"), true);
        assert.deepEqual(errors,[]);
        console.log(JSON.stringify({ dungeonSession: { locales:checked,viewports:14,sameChild:true,islandRecordsPreserved:true,
            nameAndWarningRetained:true,warningChangesDecision:true,returnAndReentry:true,historyBackForward:true,autoAdvances:true,
            freeTargetDescription:true,noTargetButtons:true,clarificationStopsMovement:true,paraphrases:true,originalPartialPreserved:true,
            gestureGuidanceSeparate:true,bubbleClearsHud:true,bodyMetersVisible:true,
            reportedSevenInputs:true,cumulativeClues:true,meaningExplanation:true,knowledgeQuestionNonmoving:true,
            pauseStable:true,exitReached:true,noMovementAfterArrival:true,errors,directory,artifacts } }));
        server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); server=null;
        app.removeAllListeners('window-all-closed'); win.destroy(); app.exit(0);
    }).catch(error=>{console.error(error);app.exit(1);});
    app.on('window-all-closed',()=>app.quit());
    app.on('before-quit',()=>{if(server){server.closeAllConnections();server.close();}});
}
