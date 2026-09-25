'use strict';
// Opt-in real Electron smoke test. Never opens the player's profile or save directory.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename, ...process.argv.slice(2)], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code || 0; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow, ipcMain } = require('electron');
    app.disableHardwareAcceleration();
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-island-smoke-'));
    app.setPath('userData', directory);
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    let server, window;
    let snapshot = null;
    let nextLoad = null;
    const failures = [];
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const url = `http://127.0.0.1:${server.address().port}/${process.argv.includes('--careers') || process.argv.includes('--context') ? '' : '?debug=1'}`;
        const store = require('./storage').createStore(directory);
        ipcMain.on('word-life-load', event => {
            event.returnValue = nextLoad ? { ok: true, value: nextLoad } : store.load();
            nextLoad = null;
        });
        ipcMain.on('word-life-save', (event, value) => { snapshot = value; event.returnValue = store.save(value); });
        window = new BrowserWindow({ width: 1280, height: 800, show: false,
            webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false,
                preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('console-message', (_event, level, message) => { if (level >= 3) failures.push(message); });
        await window.loadURL(url);
        const js = async code => {
            try { return await window.webContents.executeJavaScript(code, true); }
            catch (error) { throw new Error(`${error.message}\nRenderer code: ${code}\nConsole: ${JSON.stringify(failures)}`); }
        };
        // Hidden native windows throttle rAF even with backgroundThrottling:false.
        // Use a real-time timer for the test's paint scheduling; tick still runs once per frame.
        const paintClock = () => js('window.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16); void 0');
        await paintClock();
        for (let i = 0; i < 100; i++) {
            if (await js('!!document.querySelector("#app > form button:not(:disabled)")')) break;
            await sleep(100);
        }
        await js('document.querySelector("#app > form").requestSubmit()');
        await sleep(1200);
        assert.ok(snapshot?.world?.island, 'start saved the actual island');
        const initialMap = JSON.stringify(snapshot.world.island.assets);
        for (let i = 0; i < 100; i++) {
            if (await js('audioManager.currentAudio?.readyState >= 2')) break;
            await sleep(100);
        }
        const initial = await js('({imagesLoaded,totalImages,assets:Object.keys(assets).length,actor:{x:aiPet.x,y:aiPet.y},bgm:audioManager.currentBGMType,ready:audioManager.currentAudio?.readyState,legacy:typeof aiPet.update})');
        assert.equal(initial.imagesLoaded, initial.totalImages);
        assert.equal(initial.bgm, 'robot'); assert.ok(initial.ready >= 2); assert.equal(initial.legacy, 'undefined');
        assert.ok(initial.assets > 300);
        if (process.argv.includes('--context')) {
            // Disposable fixture only: keep the actor idle while testing chat, then
            // let the real single tick complete a meal and publish its observation.
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'idle', dwell: 60, attention: null, destination: null });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            await chat('今何してるの？'); await chat('一息って？');
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("少し何もせず休む")'));
            assert.equal(snapshot.state.context.lastOutput.source.message, 'taking_break');
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            await chat('つまり休んでいるということ？');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].questionSlot, 'context_detail');
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'eat', dwell: .2, harvest: 1, fruit: 1, attention: 'berry:1',
                activityStart: nextLoad.world.elapsed, activityBefore: { hunger: .8, fatigue: .2 },
                mealTaste: { quality: 'sweet', pleasant: true }, hunger: .8 });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            await sleep(700);
            await chat('ほっとしたの？');
            assert.ok(await js('Array.from(document.querySelectorAll("#conversation .observation-line")).some(line => line.textContent.includes("気持ちや理由はまだ分からない"))'));
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
            await chat('おいしかった？'); await chat('甘いの？');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].contextReference.evidence.experienceId,
                snapshot.world.experiences.at(-1).id);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'eat').length, 1);
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("甘くておいしかった")'));
            await sleep(1200); // Hidden native compositor needs time to paint the new chat.
            const screenshot = path.resolve(__dirname, '../../tests/word-context-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage()).toPNG());
            assert.equal(JSON.stringify(snapshot.world.island.assets), initialMap);
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, context: true, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--careers')) {
            nextLoad = structuredClone(snapshot); nextLoad.world.hunger = .1; nextLoad.world.fatigue = .1;
            // Set only visit history in the disposable fixture; the live loop chooses and walks.
            nextLoad.world.island.places.forEach(p => { nextLoad.world.visited[p.id] = nextLoad.world.elapsed; });
            delete nextLoad.world.visited['master:farming'];
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            assert.equal(await js('document.querySelectorAll(".body-status meter").length'), 2);
            for (let i = 0; i < 55; i++) {
                await sleep(1000);
                if (snapshot.world.careers?.people.farming?.completed) break;
            }
            assert.equal(snapshot.world.careers?.people.farming?.completed, 1);
            assert.equal(snapshot.state.encounters?.[0].master, 'farming');
            assert.ok(await js('!!document.querySelector(".master-line")'));
            assert.ok(snapshot.state.knowledge.meanings.some(m => m.id === 'work:farming'));
            await js('document.querySelector(".chat-form textarea").value="どんな仕事をしたの？"; document.querySelector(".chat-form").requestSubmit()');
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("畑の石を拾ったよ。")'));
            await js('document.querySelector(".chat-form textarea").value="またやりたい？"; document.querySelector(".chat-form").requestSubmit()');
            assert.ok(await js('!document.querySelector("#conversation p:last-child").textContent.includes("分からない")'));
            await js('document.querySelector(".panel-buttons button:nth-child(2)").click()');
            assert.ok(await js('document.querySelectorAll(".note-card").length >= 2'));
            await sleep(1200);
            const screenshot = path.resolve(__dirname, '../../tests/word-careers-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage()).toPNG());
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            assert.equal(JSON.stringify(snapshot.world.island.assets), initialMap);
            assert.equal(snapshot.world.careers.people.farming.completed, 1);
            assert.equal(snapshot.state.encounters.filter(e => e.master === 'farming').length, 1);
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, career: snapshot.world.careers.people.farming, screenshot, profile: directory }));
            return;
        }
        // Save a ready-to-observe body state in this disposable profile, keeping real map routes/UI.
        nextLoad = structuredClone(snapshot); nextLoad.world.hunger = .8;
        await window.loadURL(url); await paintClock(); await sleep(600);
        await js('document.querySelector("#app > form").requestSubmit()');
        await js('document.querySelector(".scene-controls button").click()');
        for (let i = 0; i < 50; i++) {
            await sleep(1000);
            if (snapshot.world.experiences.some(e => e.kind === 'eat')) break;
        }
        assert.ok(snapshot.world.experiences.some(e => e.kind === 'eat'), `actual UI loop finished a meal: ${JSON.stringify({mode:snapshot.world.mode,elapsed:snapshot.world.elapsed,failures})}`);
        await js('document.querySelector(".scene-controls > div button:nth-child(2)").click()');
        for (let i = 0; i < 60; i++) {
            await sleep(1000);
            if (snapshot.world.experiences.some(e => e.kind === 'rest')) break;
        }
        assert.ok(snapshot.world.experiences.some(e => e.kind === 'rest'), 'actual UI loop finished rest');
        await js('document.querySelector(".chat-form textarea").value="しっかり休めた？"; document.querySelector(".chat-form").requestSubmit()');
        assert.ok(await js('document.querySelector("#conversation").textContent.includes("疲れが軽くなった")'));
        await js('document.querySelector(".panel-buttons button:nth-child(2)").click()');
        assert.ok(await js('document.querySelectorAll(".note-card").length >= 2'));
        await sleep(1200); // Allow the hidden window's native compositor to paint the notebook.
        const screenshot = path.resolve(__dirname, '../../tests/word-island-smoke.png');
        fs.writeFileSync(screenshot, (await window.webContents.capturePage()).toPNG());
        const records = snapshot.state.records.length;
        await window.loadURL(url); await paintClock(); await sleep(600);
        await js('document.querySelector("#app > form").requestSubmit()');
        assert.equal(JSON.stringify(snapshot.world.island.assets), initialMap);
        assert.equal(snapshot.state.records.length, records);
        assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
        assert.deepEqual(failures, []);
        console.log(JSON.stringify({ ok: true, initial, experiences: snapshot.world.experiences.length, records, screenshot, profile: directory }));
    }).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
        if (window) window.destroy();
        if (server) { server.closeAllConnections(); server.close(); }
        app.exit(process.exitCode || 0);
    });
}
