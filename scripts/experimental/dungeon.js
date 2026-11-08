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
    const smoke = process.argv.includes('--smoke'); let server;
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
        await js(`localStorage.setItem('dungeon-sentinel','keep');sessionStorage.setItem('dungeon-sentinel','keep');document.querySelector('.word-logo').click();document.getElementById('word-new-game').click();document.getElementById('word-reset-accept').click();const settings=document.querySelector('form');settings.querySelector('select').value='seed';settings.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true}));void 0`);
        await settle();
        const send = async raw => { await js(`const input=document.querySelector('.chat-form textarea');input.value=${JSON.stringify(raw)};document.querySelector('.chat-form').requestSubmit();void 0`); await settle(); };
        await send('ぽぽは休むことだよ');
        await js(`document.querySelector('[aria-controls="notebook"]').click();void 0`);
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('ぽぽ'));
        await js(`document.querySelector('[aria-controls="conversation"]').click();window.__islandRecords=null;const original=ExperimentalWordDungeonLearning;window.ExperimentalWordDungeonLearning={...original,create(state){window.__child=state;if(!window.__islandRecords)window.__islandRecords=JSON.stringify(state.records);return original.create(state);}};document.getElementById('word-dungeon').click();document.getElementById('dungeon-point-0').click();void 0`);
        await send('これはアカだよ');
        await send('そこへ行って');
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'obey');
        await send('これは危ない');
        await send('そこへ行って');
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'diverged');
        const divergence = await js("document.querySelector('.status').textContent");
        assert.ok(divergence.includes(await js("GameI18n.translate('その相手は危ないと教わったから、指示とは違うけれど距離を取るね。')")), divergence);
        assert.equal(await js("JSON.stringify(window.__child.records.slice(0,JSON.parse(window.__islandRecords).length))===window.__islandRecords"), true);
        assert.equal(await js("window.__child.knowledge.associations.some(a=>a.word==='アカ')"), true);
        await js(`document.querySelector('[aria-controls="notebook"]').click();void 0`);
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('これは危ない'));
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('ぽぽ'));
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
        assert.ok((await js("document.getElementById('notebook').textContent")).includes('これは危ない'));
        await js("window.__sameChild=window.__child;document.getElementById('word-dungeon').click();void 0"); await settle();
        assert.equal(await js("window.__sameChild===window.__child"), true);
        await js("history.back();new Promise(resolve=>setTimeout(resolve,500))");
        assert.equal(await js("document.querySelector('.word-dungeon-stage')===null"), true);
        await js("history.forward();new Promise(resolve=>setTimeout(resolve,500))");
        assert.equal(await js("window.__sameChild===window.__child&&!!document.querySelector('.word-dungeon-stage')"), true);
        await js("document.getElementById('dungeon-step').click();void 0"); await settle();
        assert.equal(await js("window.__child.dungeonLearning.actions.at(-1).reason"), 'retreat');
        const autoBefore = await js('window.__child.dungeonLearning.actions.length');
        await js("document.getElementById('dungeon-auto').click();void 0");
        await js('new Promise((resolve,reject)=>{let n=0;const timer=setInterval(()=>{if(window.__child.dungeonLearning.actions.length>' + autoBefore
            + '){clearInterval(timer);resolve();}else if(++n>150){clearInterval(timer);reject(new Error("auto timeout"));}},200);})');
        await js("document.getElementById('dungeon-auto').click();void 0");
        await js("document.getElementById('word-pause').click();void 0"); await settle();
        const before = await js("window.__child.dungeonLearning.actions.length");
        await js("document.getElementById('dungeon-step').click();void 0");
        await js("document.getElementById('dungeon-auto').click();new Promise(resolve=>setTimeout(resolve,1000))");
        assert.equal(await js("window.__child.dungeonLearning.actions.length"), before);
        for (let i=0;i<40 && !(await js("document.getElementById('dungeon-step').disabled"));i++) {
            await js("document.getElementById('word-pause').getAttribute('aria-pressed')==='true'&&document.getElementById('word-pause').click();document.getElementById('dungeon-step').click();void 0");
        }
        assert.equal(await js("document.getElementById('dungeon-step').disabled"), true);
        const arrivedActions = await js('window.__child.dungeonLearning.actions.length');
        await js("document.getElementById('dungeon-point-1').click();void 0"); await send('そこへ行って');
        assert.equal(await js('window.__child.dungeonLearning.actions.length'), arrivedActions);
        assert.ok((await js("document.querySelector('.status').textContent")).includes('階段に着いた'));
        assert.equal(await js("localStorage.getItem('dungeon-sentinel')==='keep'&&sessionStorage.getItem('dungeon-sentinel')==='keep'"), true);
        assert.deepEqual(errors,[]);
        console.log(JSON.stringify({ dungeonSession: { locales:checked,viewports:14,sameChild:true,islandRecordsPreserved:true,
            nameAndWarningRetained:true,warningChangesDecision:true,returnAndReentry:true,historyBackForward:true,autoAdvances:true,
            pauseStable:true,exitReached:true,noMovementAfterArrival:true,errors,directory,artifacts } }));
        server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); server=null;
        app.removeAllListeners('window-all-closed'); win.destroy(); app.exit(0);
    }).catch(error=>{console.error(error);app.exit(1);});
    app.on('window-all-closed',()=>app.quit());
    app.on('before-quit',()=>{if(server){server.closeAllConnections();server.close();}});
}
