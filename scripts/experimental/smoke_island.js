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
        const url = `http://127.0.0.1:${server.address().port}/${process.argv.includes('--careers') || process.argv.includes('--context') || process.argv.includes('--life') || process.argv.includes('--relations') || process.argv.includes('--questions') ? '' : '?debug=1'}`;
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
        if (process.argv.includes('--relations') || process.argv.includes('--questions')) {
            const questions = process.argv.includes('--questions');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            const resume = async () => {
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('document.querySelector("#app > form").requestSubmit()'); await sleep(150);
            };
            for (const [index, activity] of ['eat', 'rest'].entries()) {
                nextLoad = structuredClone(snapshot);
                nextLoad.state.settings.foundation = false;
                if (index === 0) nextLoad.state.knowledge.relations = [];
                Object.assign(nextLoad.world, { mode: activity, dwell: 3, attention: activity === 'eat' ? 'berry:1' : 'shade',
                    destination: null, activityStart: nextLoad.world.elapsed, harvest: 1,
                    activityBefore: { hunger: .8, fatigue: .8 }, hunger: .8, fatigue: .8,
                    mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
                await resume();
                assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
                await chat(questions ? `「何してる？」→「${index === 0 ? '食べる' : '休む'}」`
                    : index === 0 ? 'もぐは食べることだよ' : 'ぽぽは休むことだよ');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
                assert.equal(snapshot.world.relationLabels.length, 1);
                assert.equal(snapshot.state.knowledge.relations.length, 0);
                const pending = JSON.stringify(snapshot.world.relationLabels);
                await resume(); assert.equal(JSON.stringify(snapshot.world.relationLabels), pending);
                await sleep(4500);
                await chat('こんにちは'); // Flush the completed single-tick experience to the store.
                assert.equal(snapshot.state.knowledge.relationEvidence.length, index + 1);
                assert.equal(snapshot.state.knowledge.relations.length, index);
            }
            const origins = JSON.stringify(snapshot.state.experiences);
            await chat(questions ? '何してる？' : 'ぽぽは休むことだよ');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, true);
            if (questions) {
                assert.equal(snapshot.state.knowledge.wordExplanations, undefined);
                assert.equal(snapshot.state.context.turns.at(-1).answer.source.questionSlot, 'current_activity');
                assert.equal(snapshot.state.knowledge.relations[0].id, 'question');
                assert.equal(snapshot.world.destination, null);
            } else assert.equal(snapshot.state.knowledge.wordExplanations.length, 1);
            await chat('休めた？');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
            await js('document.querySelector("button[aria-controls=notebook]").click()');
            assert.ok(await js(`document.querySelector("#notebook").textContent.includes(${JSON.stringify(questions
                ? '同じ相手・言語・問いに限る' : '同じ相手・言語の短い説明で使える')})`));
            window.setSize(1281, 800); await sleep(500);
            const screenshot = path.resolve(__dirname, questions ? '../../tests/word-questions-smoke.png' : '../../tests/word-relations-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            const knowledge = JSON.stringify(snapshot.state.knowledge);
            await resume();
            assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
            assert.equal(JSON.stringify(snapshot.state.experiences), origins);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'eat').length, 1);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'rest').length, 1);
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, relations: true, questions, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--life')) {
            nextLoad = structuredClone(snapshot);
            nextLoad.state.settings.life = false; nextLoad.state.knowledge.meanings = [];
            Object.assign(nextLoad.world, { mode: 'observe', dwell: 5, attention: 'berry:1',
                destination: null, hunger: .8, fatigue: .2 });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            await sleep(300);
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            for (const raw of ['木の実', '食べる', '甘い']) await chat(raw);
            assert.equal(snapshot.world.mode, 'eat');
            assert.equal(snapshot.world.lifeLabels.length, 3);
            assert.equal(snapshot.state.knowledge.meanings.length, 0);
            const labels = JSON.stringify(snapshot.world.lifeLabels);
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            assert.equal(JSON.stringify(snapshot.world.lifeLabels), labels);
            await sleep(6500);
            await chat('おいしかった？');
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("甘くておいしかった")'));
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'eat').length, 1);
            for (const id of ['berry', 'eat', 'sweet']) {
                const meaning = snapshot.state.knowledge.meanings.find(m => m.id === id);
                assert.equal(meaning.source, 'experienced_life'); assert.equal(meaning.evidence.length, 1);
            }
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'rest', dwell: 2, attention: 'shade', destination: null,
                activityStart: nextLoad.world.elapsed, activityBefore: { hunger: .3, fatigue: .8 }, fatigue: .8 });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            await chat('休む'); await chat('"疲れた"'); await sleep(3200);
            await chat('休めた？');
            assert.equal(snapshot.state.context.turns.at(-1).answer.response.message, 'rest_helped');
            assert.ok(snapshot.state.knowledge.meanings.some(m => m.id === 'rest' && m.source === 'experienced_life'));
            if (process.argv.includes('--learning')) {
                const knownBefore = JSON.stringify(snapshot.state.knowledge.meanings);
                const experiencesBefore = JSON.stringify(snapshot.state.experiences);
                await chat('ぽぽは休むことだよ');
                const original = snapshot.state.knowledge.wordExplanations[0].inputId;
                await chat('「ぽぽ」しよう');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].known.meaning, 'rest');
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('document.querySelector("#app > form").requestSubmit()');
                await chat('さっき間違えた。ぽぽは休むことじゃなくて、木の実のことだよ');
                assert.equal(snapshot.state.knowledge.wordExplanations[1].corrects, original);
                assert.ok(await js('document.querySelector("#conversation").textContent.includes("前の説明を言い直した")'));
                await chat('ぽぽ');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].known.meaning, 'berry');
                assert.equal(JSON.stringify(snapshot.state.knowledge.meanings), knownBefore);
                assert.equal(JSON.stringify(snapshot.state.experiences), experiencesBefore);
                const explanations = JSON.stringify(snapshot.state.knowledge.wordExplanations);
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('document.querySelector("#app > form").requestSubmit()');
                await chat('ぽぽ');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].known.meaning, 'berry');
                assert.equal(JSON.stringify(snapshot.state.knowledge.wordExplanations), explanations);
            }
            await js('Array.from(document.querySelectorAll("button")).find(b=>b.textContent.includes("この子のノート")).click()');
            assert.ok(await js('document.body.textContent.includes("行動中に聞いた言葉と")'));
            if (process.argv.includes('--learning')) {
                assert.ok(await js('Array.from(document.querySelectorAll("#notebook s")).some(e=>e.textContent.includes("ぽぽ → 休む"))'));
                assert.ok(await js('document.querySelector("#notebook").textContent.includes("ぽぽ → 木の実")'));
                await js('Array.from(document.querySelectorAll("#notebook .note-card")).find(e=>e.textContent.includes("ぽぽ → 休む")).scrollIntoView({block:"start"})');
            }
            window.setSize(1281, 800); await sleep(500);
            const screenshot = path.resolve(__dirname, process.argv.includes('--learning')
                ? '../../tests/word-learning-smoke.png' : '../../tests/word-life-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            const meanings = JSON.stringify(snapshot.state.knowledge.meanings);
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            assert.equal(JSON.stringify(snapshot.state.knowledge.meanings), meanings);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'rest').length, 1);
            assert.equal(JSON.stringify(snapshot.world.island.assets), initialMap);
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, life: true, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--context')) {
            // Disposable fixture only: keep the actor idle while testing chat, then
            // let the real single tick complete a meal and publish its observation.
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'idle', dwell: 60, attention: null, destination: null });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            await chat('今何してるの？'); await chat('もう一度教えて'); await chat('一息って？');
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
            await chat('昨日は仕事で失敗した');
            const reportId = snapshot.state.context.turns.at(-1).id;
            const ownExperiences = snapshot.world.experiences.length;
            await chat('それで悲しかった');
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("詳しいことはまだ分からない")'));
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].eventTime, 'yesterday');
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('document.querySelector("#app > form").requestSubmit()');
            await chat('そう、その話');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].reportReference.inputId, reportId);
            assert.equal(snapshot.world.experiences.length, ownExperiences);
            assert.equal(snapshot.state.context.lastOutput.topic, null);
            assert.equal(await js('document.querySelectorAll("#conversation .conversation-help").length'), 0);
            // A reload in a hidden native window can leave an old compositor surface.
            // Resize and request a capture while keeping the test window hidden.
            window.setSize(1281, 800);
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
            await sleep(1200);
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
