'use strict';
// Real renderer and atomic store, synthetic child, no personal save or physical microphone.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow, ipcMain } = require('electron');
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'word-terrarium-'));
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs/terrarium-renderer-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true }); app.setPath('userData', profile); app.disableHardwareAcceleration();
    const store = require('./storage').createStore(profile), sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const state = require('../../experimental_word_learning_core').create({}, require('../../experimental_word_learning_catalog.json'));
    const world = require('../../experimental_word_learning_world').create();
    require('../../experimental_word_growth').init(state, 'robot');
    require('../../experimental_word_identity').configure(state, { characterName: '<Maple & One>', firstPerson: '私', playerAddress: 'あなた' });
    world.mode = 'rest'; world.dwell = .15; world.activityStart = 0; world.activityBefore = { hunger: .35, fatigue: .4 }; world.fatigue = .4;
    assert.ok(store.save({ version: 1, appearance: 'robot', state, world }).ok);
    let server, window, snapshot; const errors = [], checks = [];
    const js = code => window.webContents.executeJavaScript(code, true);
    async function wait(code, label) {
        for (let i = 0; i < 600; i++) { if (await js(code)) return; await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(50); }
        throw new Error(label + ': ' + await js('document.body.innerText.slice(-1500)'));
    }
    async function image(name) {
        // Settle finite opening animations and lazy portrait paints in a hidden native window.
        await js('document.getAnimations().filter(a=>Number.isFinite(a.effect.getTiming().iterations)).forEach(a=>a.finish());void 0');
        await wait('[...document.querySelectorAll("dialog[open] canvas")].every(c=>Array.from(c.getContext("2d").getImageData(0,0,c.width,c.height).data).some((v,i)=>i%4===3&&v>0))', 'dialog portraits painted');
        for (let i = 0; i < 3; i++) { await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(180); }
        fs.writeFileSync(path.join(evidence, name + '.png'), (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    }
    app.whenReady().then(async () => {
        server = require('./serve').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        ipcMain.on('word-life-load', event => { event.returnValue = store.load(); });
        ipcMain.on('word-life-save', (event, value) => { const result = store.save(value); if (result.ok) snapshot = value; event.returnValue = result; });
        ipcMain.handle('word-voice-cache-get', () => ({ ok: false })); ipcMain.handle('word-voice-cache-put', () => ({ ok: false }));
        window = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: { contextIsolation: true, sandbox: true,
            nodeIntegration: false, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('render-process-gone', (_event, detail) => errors.push(detail));
        window.webContents.on('console-message', (_event, level, message) => { if (level === 3) errors.push(message); });
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_island.html`;
        await window.loadURL(url); await wait('!document.querySelector("#word-new-game").disabled', 'load');
        await js('document.querySelector(".word-logo").click();document.querySelector("#word-continue").click();void 0');
        await wait('document.querySelector("#app").classList.contains("playing")', 'playing');
        await wait('!document.querySelector("#word-memory-toast").hidden', 'actual rest memory');
        assert.equal(snapshot.collection.memories[0].kind, 'rest'); assert.equal(snapshot.collection.memories[0].name, '<Maple & One>');
        assert.equal(snapshot.collection.memories[0].evidence.kind, 'experience');
        await js('document.querySelector("#word-settings").click();void 0');
        assert.ok(await js('document.querySelector("#word-settings-dialog").contains(document.querySelector("#word-identity-choose"))'));
        assert.ok(await js('!document.querySelector(".chat-form").contains(document.querySelector("#word-read-aloud"))'));
        await js('dispatchEvent(new Event("beforeunload"));void 0');
        const elapsed = snapshot.world.elapsed; await sleep(1200);
        await js('dispatchEvent(new Event("beforeunload"));void 0');
        assert.ok(snapshot.world.elapsed - elapsed < .15);
        await js('document.querySelector("#word-settings-dialog").close();document.querySelector("#word-pause").click();void 0');
        assert.equal(await js('document.querySelector("#word-evolve").hidden'), true);
        checks.push('actual completed rest earns one memory and literal historical name; preferences separated; settings hold; evolution remains hidden');
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) for (const width of [1280, 390]) {
            window.setSize(width, 900); await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`);
            await image(`island-${locale}-${width}`);
            assert.ok(await js('document.documentElement.scrollWidth <= innerWidth + 2'));
            assert.ok(await js('document.querySelector(".panel-body").getBoundingClientRect().height >= 50'), 'conversation remains visible');
            await js('document.querySelector("#word-book").click();void 0'); await image(`book-${locale}-${width}`);
            assert.ok(await js('!!document.querySelector(".word-book-spread") && !!document.querySelector(".word-book-page canvas")'));
            assert.ok(await js('document.querySelector("#word-book-dialog").scrollWidth <= document.querySelector("#word-book-dialog").clientWidth + 2'),
                'book horizontal overflow: ' + await js('JSON.stringify([...document.querySelectorAll("#word-book-dialog *")].filter(e=>e.getBoundingClientRect().right>document.querySelector("#word-book-dialog").getBoundingClientRect().right-7).map(e=>[e.tagName,e.className,e.getBoundingClientRect().width]))'));
            await js('document.querySelector("#word-book-dialog").close();document.querySelector("#word-album").click();void 0');
            await image(`album-${locale}-${width}`);
            assert.equal(await js('document.querySelector("[data-memory-kind=rest] h3").textContent'), require('../../locales/' + locale + '.json')['ひと休みの思い出']);
            assert.ok(await js('document.querySelector("#word-album-dialog").textContent.includes("<Maple & One>")'));
            assert.equal(await js('document.querySelector("#word-album-dialog script")'), null);
            await js('document.querySelector("#word-album-dialog").close();document.querySelector("#word-settings").click();void 0');
            await image(`settings-${locale}-${width}`);
            assert.ok(await js('document.querySelector("#word-settings-dialog").scrollWidth <= document.querySelector("#word-settings-dialog").clientWidth + 2'));
            await js('document.querySelector("#word-settings-dialog").close();void 0');
        }
        checks.push('terrarium, paper spread, memory album and settings in seven locales at desktop and narrow widths');
        await window.reload(); await wait('!document.querySelector("#word-new-game").disabled', 'reload');
        await js('document.querySelector(".word-logo").click();document.querySelector("#word-continue").click();void 0');
        await wait('document.querySelector("#app").classList.contains("playing")', 'resume');
        assert.equal(store.load().value.collection.memories.length, 1);
        checks.push('memory archive survives real restart without duplicate or invented backfill');
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify({ ok: true, profile, checks, errors }, null, 2));
        console.log(JSON.stringify({ ok: true, evidence, checks })); window.destroy(); server.close(); app.quit();
    }).catch(async error => { errors.push(String(error.stack || error)); if (window) await image('failure').catch(() => {});
        fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify({ ok: false, profile, checks, errors }, null, 2));
        console.error(error); window?.destroy(); server?.close(); app.exit(1); });
}
