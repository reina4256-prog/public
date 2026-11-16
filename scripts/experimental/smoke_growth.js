'use strict';
// Synthetic readiness, real UI/ceremony/preload/atomic store; no user profile or mic.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow, ipcMain } = require('electron');
    const core = require('../../experimental_word_learning_core'), worldApi = require('../../experimental_word_learning_world');
    const growth = require('../../experimental_word_growth'), catalog = require('../../experimental_word_learning_catalog.json');
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'word-growth-renderer-'));
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs/growth-renderer-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true }); app.setPath('userData', profile); app.disableHardwareAcceleration();
    let server, window, snapshot; const errors = [], checks = [];
    const store = require('./storage').createStore(profile), sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const state = core.create({}, catalog), world = worldApi.create(); growth.init(state, 'robot');
    state.evolution.growth.intel = Array.from({ length: 8 }, (_, i) => 'fixture:' + i);
    assert.ok(store.save({ version: 1, appearance: 'robot', state, world }).ok);
    const js = code => window.webContents.executeJavaScript(code, true);
    async function wait(code, label, count = 1200) {
        for (let i = 0; i < count; i++) {
            if (await js(code)) return;
            if (!(i % 10)) await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
            await sleep(50);
        }
        throw new Error(label + ': ' + await js('document.body.innerText.slice(-1400)'));
    }
    async function resume(url) {
        await window.loadURL(url); await wait('!document.querySelector("#word-new-game").disabled', 'load');
        await js('document.querySelector(".word-logo").click();void 0');
        await wait('!document.querySelector("#word-continue").disabled', 'continue available');
        await js('document.querySelector("#word-continue").click();void 0');
        await wait('document.querySelector("#app").classList.contains("playing")', 'resume');
    }
    async function image(name) {
        await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(350);
        fs.writeFileSync(path.join(evidence, name + '.png'), (await window.webContents.capturePage()).toPNG());
    }
    app.whenReady().then(async () => {
        server = require('./serve').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        ipcMain.on('word-life-load', event => { event.returnValue = store.load(); });
        ipcMain.on('word-life-save', (event, value) => { const result = store.save(value); if (result.ok) snapshot = value; event.returnValue = result; });
        ipcMain.handle('word-voice-cache-get', () => ({ ok: false })); ipcMain.handle('word-voice-cache-put', () => ({ ok: false }));
        window = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: {
            contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('render-process-gone', (_event, detail) => errors.push(detail));
        window.webContents.on('did-finish-load', () => window.webContents.executeJavaScript('window.addEventListener("error",e=>window.growthError=e.message);void 0'));
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_island.html?debug=1`;
        await resume(url);
        const knowledge = JSON.stringify(snapshot.state.knowledge);
        await wait('document.querySelector("#word-evolve").classList.contains("word-evolution-ready")', 'readiness glow');
        assert.ok(await js('document.querySelector("#word-growth").hidden && !document.querySelector("#word-evolve").hidden'));
        await js('GameI18n.setLanguage("ja");document.querySelector("#word-book").click();void 0');
        assert.equal(await js('document.querySelectorAll("[data-book-skin]").length'), 1);
        const elapsed = snapshot.world.elapsed;
        await sleep(400);
        assert.equal(snapshot.world.elapsed, elapsed);
        await js('document.querySelector("#word-book-dialog button:last-child").click();const initialRandom=Math.random;Math.random=()=>0;document.querySelector("#word-evolve").click();Math.random=initialRandom;void 0');
        assert.equal(snapshot.state.evolution.pending.next, 'robot_type3'); assert.deepEqual(snapshot.state.evolution.path, ['robot']);
        await image('ceremony-before'); await sleep(350);
        await js('document.querySelector("#word-growth-dialog button").click();void 0');
        await wait('!document.querySelector("#word-evolve").hidden', 'interrupted first evolution remains resumable');
        assert.deepEqual(store.load().value.state.evolution.path, ['robot']);
        await resume(url);
        await wait('document.querySelector("#word-growth-dialog").open && !!document.querySelector("#word-growth-dialog canvas")', 'pending ceremony');
        await wait('document.querySelector("#word-evolution-video")?.currentTime > .1', 'legacy movie playing');
        assert.deepEqual(snapshot.state.evolution.path, ['robot']); await image('legacy-movie-before-unlock');
        assert.equal(await js('document.querySelector("#word-evolution-video").getAttribute("src")'), 'robot_evol_to_type3.mp4');
        await wait('!!document.querySelector("#word-growth-skin")', 'ceremony completes');
        assert.deepEqual(snapshot.state.evolution.path, ['robot', 'robot_type3']);
        assert.equal(snapshot.state.evolution.skin, 'robot_type3'); assert.equal(snapshot.state.evolution.mind, 'robot_type3');
        assert.ok(snapshot.collection.memories.some(m => m.kind === 'evolution' && m.subject === 'robot_type3' && m.skin === 'robot_type3'));
        await wait('document.querySelector("#word-evolve").hidden', 'button disappears until next conditions');
        assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
        assert.equal(await js('!!document.querySelector("[data-evolve=robot_type3_2]")'), false);
        checks.push('no condition/route spoilers, readiness glow, legacy roulette/movie, interrupted ceremony, automatic resume, irreversible route');
        const evolved = store.load().value;
        await window.loadURL('about:blank');
        const w = evolved.world, place = w.island.places.find(p => p.id === 'master:fishing');
        w.x = place.x; w.y = place.y; w.mode = 'move'; w.destination = place.id; w.attention = null;
        w.route = [{ x: place.x, y: place.y }]; w.pause = 0;
        w.careers = { version: 1, people: { fishing: { metAt: 0, visits: 1, observed: 0, completed: 0, interest: 0, learning: false, outcomes: [] } }, current: null };
        assert.ok(store.save(evolved).ok); await resume(url);
        await wait('document.querySelector("#word-master-dialog").dataset.phase === "conversation"', 'evolved master portrait');
        assert.equal(await js('document.querySelector(".word-master-left canvas").dataset.skin'), 'robot_type3');
        await image('evolved-master-portrait');
        await js('document.querySelector("#word-master-close").click();document.querySelector("#word-voice-choose").click();void 0');
        await wait('document.querySelector(".word-meeting canvas[data-skin=robot_type3]")', 'evolved voice preview');
        await image('evolved-voice-preview');
        await js('document.querySelector(".word-meeting").dispatchEvent(new Event("cancel", {cancelable:true}));document.querySelector("#word-growth").click();void 0');
        checks.push('selected evolved appearance in master conversation after atomic reload');
        assert.equal(await js('document.querySelectorAll("#word-growth-skin button canvas").length'), 2);
        assert.equal(await js('document.querySelectorAll("#word-growth-mind button canvas").length'), 2);
        assert.equal(await js('!!document.querySelector("#word-growth-dialog select")'), false);
        assert.equal(await js('/活力|賢さ|美しさ|老化|闇/.test(document.querySelector("#word-growth-dialog").textContent)'), false);
        await js('document.querySelector("#word-growth-skin [data-growth-value=robot]").click();void 0');
        assert.equal(snapshot.state.evolution.skin, 'robot'); assert.equal(snapshot.state.evolution.mind, 'robot_type3');
        assert.equal(await js('document.querySelector("#word-growth-skin [data-growth-value=robot]").getAttribute("aria-pressed")'), 'true');
        assert.equal(await js('document.activeElement.dataset.growthValue'), 'robot');
        await js('document.querySelector("#word-growth-mind [data-growth-value=robot]").click();void 0');
        assert.equal(snapshot.state.evolution.mind, 'robot'); assert.equal(snapshot.state.evolution.path.at(-1), 'robot_type3');
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) for (const width of [1280, 390]) {
            window.setContentSize(width, 900); await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`); await sleep(80);
            assert.equal(await js('document.documentElement.scrollWidth > innerWidth + 1'), false);
            assert.equal(await js('document.querySelector("#word-growth-dialog h2").textContent'), require('../../locales/' + locale + '.json')['育ちと進化']);
            assert.equal(await js('!!window.growthError'), false);
            if (['ja', 'de'].includes(locale)) await image('gallery-' + locale + '-' + width);
        }
        // Rebuild while already in a translated locale, then change language again.
        await js('document.querySelector("#word-growth-dialog > button:last-child").click();GameI18n.setLanguage("en");document.querySelector("#word-growth").click();void 0');
        await sleep(120);
        assert.equal(await js('document.querySelector("#word-growth-dialog h2").textContent'), 'Growth and evolution');
        await js('GameI18n.setLanguage("de");void 0'); await sleep(120);
        assert.equal(await js('document.querySelector("#word-growth-dialog h2").textContent'), 'Wachstum und Entwicklung');
        await js('document.querySelector("#word-growth-dialog > button:last-child").click();void 0');
        await resume(url); assert.equal(snapshot.state.evolution.skin, 'robot'); assert.equal(snapshot.state.evolution.mind, 'robot');
        assert.equal(snapshot.state.evolution.path.at(-1), 'robot_type3');
        checks.push('independent appearance/mind, atomic store reload, seven locales, two widths, unchanged knowledge');
        // Exhausted child with known condition: actual input -> constrained response -> historical constellation.
        const value = store.load().value;
        await window.loadURL('about:blank'); // Let the old page finish its normal beforeunload save first.
        value.world.hunger = value.world.fatigue = 1; assert.ok(store.save(value).ok);
        await resume(url);
        await js(`GameI18n.setLanguage('ja');const input=document.querySelector('.chat-form textarea');input.value=${JSON.stringify(catalog.conditionTeaching.ja.utterance)};document.querySelector('.chat-form').requestSubmit();void 0`);
        assert.ok(snapshot.state.context.turns.at(-1).understandings.some(u => u.unresolved.some(x => x.type === 'processing_limit')));
        assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
        await js('document.querySelector(".word-trace-open").click();void 0');
        assert.ok(await js('document.querySelector("#word-constellation .word-processing").textContent.includes("満腹度による比較の制限")'));
        assert.ok(await js('document.querySelector(".word-stars-dialog").open && document.querySelector("#word-constellation .word-processing").getBoundingClientRect().height > 0'));
        await sleep(350);
        await image('limited-constellation-390'); checks.push('actual exhausted input, knowledge intact, historical processing limits in constellation');
        // Fresh child: no eligible routes or future names exposed. Missing ghost movie uses the legacy effect.
        await window.loadURL('about:blank');
        const ghost = { version: 1, appearance: 'ghost', state: core.create({}, catalog), world: worldApi.create() };
        require('../../experimental_word_identity').configure(ghost.state, { characterName: '<Ghost & One>', firstPerson: 'ぼく', playerAddress: '相棒' });
        growth.init(ghost.state, 'ghost'); assert.ok(store.save(ghost).ok); await resume(url);
        await js('document.querySelector("#word-book").click();void 0');
        assert.ok(await js('document.querySelector("#word-growth").hidden && document.querySelector("#word-evolve").hidden'));
        assert.equal(await js('document.querySelectorAll("[data-book-skin]").length'), 1);
        assert.ok(await js('!document.querySelector("#word-book-dialog").textContent.includes("進化")'));
        await image('unready-no-spoilers');
        await window.loadURL('about:blank');
        ghost.state.evolution.growth.intel = Array.from({ length: 8 }, (_, i) => 'fixture:' + i);
        assert.ok(store.save(ghost).ok); await resume(url);
        await wait('!document.querySelector("#word-evolve").disabled', 'ghost eligible');
        await js('const random=Math.random;Math.random=()=>.999;document.querySelector("#word-evolve").click();Math.random=random;void 0');
        await wait('document.querySelector("#word-growth-dialog canvas")?.dataset.skin === "ghost_type3_2"', 'missing movie legacy fallback');
        assert.deepEqual(snapshot.state.evolution.path, ['ghost']); await image('legacy-fallback-before-unlock');
        await wait('!!document.querySelector("#word-growth-skin")', 'fallback completes');
        assert.deepEqual(snapshot.state.evolution.path, ['ghost', 'ghost_type3_2']);
        checks.push('unready buttons absent, only registered book entries, actual missing movie legacy fallback, no early unlock');
        assert.equal(snapshot.collection.entries.length, 2);
        assert.equal(snapshot.collection.entries[1].people[0].name, '<Ghost & One>');
        assert.equal(snapshot.collection.entries[1].people[0].source, 'observed');
        await window.loadURL(url); await wait('!document.querySelector("#word-new-game").disabled', 'title loaded');
        await js('document.querySelector(".word-logo").click();void 0');
        await wait('document.querySelector(".word-title-actors").dataset.drawn?.includes("ghost_type3_2")', 'unlocked title sprites loaded and drawn');
        assert.ok(await js('Array.from(document.querySelector(".word-title-actors").getContext("2d").getImageData(0,0,1280,720).data).some((v,i)=>i%4===3&&v>0)'));
        assert.deepEqual((await js('JSON.parse(document.querySelector(".word-title-actors").dataset.skins)')).sort(), ['ghost', 'ghost_type3_2']);
        await image('unlocked-title');
        await js('document.querySelector("#word-title-book").click();void 0');
        assert.equal(await js('document.querySelectorAll("[data-book-skin]").length'), 2);
        await js('document.querySelector("[data-book-skin=ghost_type3_2]").click();void 0');
        assert.ok(await js('document.querySelector("#word-book-dialog").textContent.includes("<Ghost & One>")'));
        assert.equal(await js('document.querySelector("#word-book-dialog script")'), null);
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) for (const width of [1280, 390]) {
            window.setContentSize(width, 900); await js(`GameI18n.setLanguage(${JSON.stringify(locale)});void 0`); await sleep(80);
            assert.equal(await js('document.documentElement.scrollWidth > innerWidth + 1'), false);
            assert.ok(await js('document.querySelector("#word-book-dialog").textContent.includes("<Ghost & One>")'));
            assert.equal(await js('document.querySelector("#word-book-dialog h2").textContent'), require('../../locales/' + locale + '.json')['図鑑']);
            if (['ja', 'de'].includes(locale)) await image('book-' + locale + '-' + width);
        }
        await js('document.querySelector("#word-book-dialog button:last-child").click();document.querySelector("#word-new-game").click();document.querySelector("#word-reset-accept").click();void 0');
        assert.ok(store.load().value.pendingNewGame); assert.equal(store.load().value.collection.entries.length, 2);
        await window.loadURL(url); await wait('!document.querySelector("#word-new-game").disabled', 'pending new child reload');
        await js('document.querySelector(".word-logo").click();void 0');
        await wait('document.querySelector(".word-title-actors").dataset.skins?.includes("ghost_type3_2")', 'collection retained without active child');
        await js('document.querySelector("#word-title-book").click();void 0');
        assert.equal(await js('document.querySelectorAll("[data-book-skin]").length'), 2);
        checks.push('title only unlocked poses, historical literal names, seven-locale book at two widths, actual new-child reset/pending/restart retains collection');
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify({ ok: true, profile, checks, errors }, null, 2));
        console.log(JSON.stringify({ ok: true, evidence, checks }));
    }).catch(error => { fs.writeFileSync(path.join(evidence, 'failure.txt'), String(error.stack)); console.error(error); console.error(evidence); process.exitCode = 1; })
      .finally(() => { window?.destroy(); if (server) { server.closeAllConnections(); server.close(); } app.exit(process.exitCode || 0); });
}
