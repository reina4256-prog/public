'use strict';
// Opt-in real Electron smoke test. Never opens the player's profile or save directory.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (['--id3', '--contrast-basis', '--feelings', '--contrasts'].some(flag => process.argv.includes(flag)) && !process.argv.includes('--boundaries')) process.argv.push('--boundaries');
if (process.argv.includes('--corrections') && !process.argv.includes('--correction-basis')) process.argv.push('--correction-basis');
if (process.argv.includes('--correction-basis') && !process.argv.includes('--relations')) process.argv.push('--relations');
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
        const url = `http://127.0.0.1:${server.address().port}/${process.argv.includes('--reasons') || process.argv.includes('--conditions') || process.argv.includes('--boundaries') || process.argv.includes('--careers') || process.argv.includes('--context') || process.argv.includes('--life') || process.argv.includes('--relations') || process.argv.includes('--questions') || process.argv.includes('--proposals') || process.argv.includes('--reports') || process.argv.includes('--negations') || process.argv.includes('--times') ? '' : '?debug=1'}`;
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
        const paintClock = () => js(`window.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
            window.smokeBeginSession = () => {
                if (document.querySelector('#app').classList.contains('playing')) return;
                document.querySelector('.word-logo').click();
                const resume = document.querySelector('#word-continue');
                if (!resume.disabled) resume.click();
                else {
                    document.querySelector('#word-new-game').click();
                    document.querySelector('#word-reset-accept').click();
                    document.querySelector('#app > form').requestSubmit();
                }
            }; void 0`);
        await paintClock();
        if (process.argv.includes('--title')) {
            await require('./smoke_title')({ js, window, url, paintClock, sleep, directory,
                read: () => snapshot });
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, title: true, profile: directory }));
            return;
        }
        for (let i = 0; i < 100; i++) {
            if (await js('!!document.querySelector("#word-new-game:not(:disabled)")')) break;
            await sleep(100);
        }
        await js('window.smokeBeginSession()');
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
        if (process.argv.includes('--id3')) {
            await require('./smoke_id3')({ js, window, url, paintClock, sleep,
                read: () => snapshot, load: value => { nextLoad = value; } });
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, id3: true, initial, profile: directory }));
            return;
        }
        if (process.argv.includes('--feelings') || process.argv.includes('--contrasts')) {
            await require('./smoke_feelings')({ js, window, url, paintClock, sleep,
                contrasts: process.argv.includes('--contrasts'),
                read: () => snapshot, load: value => { nextLoad = value; } });
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, feelings: true, initial, profile: directory }));
            return;
        }
        if (process.argv.includes('--contrast-basis')) {
            await require('./smoke_contrast_basis')({ js, window, url, paintClock, sleep,
                read: () => snapshot, load: value => { nextLoad = value; } });
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, contrastBasis: true, initial, profile: directory }));
            return;
        }
        if (process.argv.includes('--reasons')) {
            await require('./smoke_reasons')({ js, window, url, paintClock, sleep,
                read: () => snapshot, load: value => { nextLoad = value; } });
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, reasons: true, initial, profile: directory }));
            return;
        }
        if (process.argv.includes('--conditions')) {
            const catalog = require('../../experimental_word_learning_catalog.json');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            const resume = async () => {
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('window.smokeBeginSession()'); await sleep(150);
            };
            const condition = catalog.conditionTeaching.ja;
            const lessons = [
                ['休む', '「疲れた」'],
                ['【お願い】「休んでね」'], ['【誘い】「一緒に休もう」'],
                [`${condition.met}「${condition.utterance}」`], [`${condition.unmet}「${condition.utterance}」`]
            ];
            for (const [index, inputs] of lessons.entries()) {
                nextLoad = structuredClone(snapshot);
                if (index === 0) {
                    nextLoad.state.settings.foundation = false; nextLoad.state.settings.life = false;
                    nextLoad.state.knowledge.relations = []; nextLoad.state.knowledge.meanings = [];
                }
                const fatigue = index === 4 ? .2 : .8;
                Object.assign(nextLoad.world, { mode: 'rest', dwell: 3, attention: 'shade', destination: null,
                    activityStart: nextLoad.world.elapsed, activityBefore: { hunger: .2, fatigue }, hunger: .2, fatigue });
                await resume();
                assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
                for (const raw of inputs) await chat(raw);
                if (index >= 3) {
                    assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
                    assert.equal(snapshot.world.relationLabels[0].relation, 'condition');
                    assert.equal(snapshot.world.relationLabels[0].observation.status, index === 3 ? 'met' : 'unmet');
                }
                const pending = JSON.stringify({ life: snapshot.world.lifeLabels, relations: snapshot.world.relationLabels });
                await resume();
                assert.equal(JSON.stringify({ life: snapshot.world.lifeLabels, relations: snapshot.world.relationLabels }), pending);
                await sleep(4500); await chat('こんにちは');
                assert.equal(snapshot.world.experiences.filter(e => e.kind === 'rest').length, index + 1);
                if (index === 0) assert.deepEqual(snapshot.state.knowledge.meanings.map(m => m.id).sort(), ['rest', 'tired']);
                if (index < 4) assert.equal(snapshot.state.knowledge.relations.some(r => r.id === 'condition'), false);
            }
            assert.equal(snapshot.state.knowledge.relations.filter(r => r.id === 'condition').length, 1);
            const knowledge = JSON.stringify(snapshot.state.knowledge), origins = JSON.stringify(snapshot.state.experiences);
            for (const [mode, fatigue, status] of [['rest', .8, 'met'], ['rest', .2, 'unmet'], ['rest', .4, 'unknown'], ['observe', .8, 'unknown']]) {
                nextLoad = structuredClone(snapshot);
                Object.assign(nextLoad.world, { mode, dwell: 60, attention: 'shade', destination: null,
                    activityStart: nextLoad.world.elapsed, activityBefore: { hunger: .2, fatigue }, hunger: .2, fatigue });
                await resume(); await chat(condition.utterance);
                const turn = snapshot.state.context.turns.at(-1);
                assert.equal(turn.understandings[0].complete, true); assert.equal(turn.conditionJudgment.status, status);
                assert.equal(turn.conditionJudgment.observation === null, mode === 'observe');
                assert.equal(snapshot.world.mode, mode); assert.equal(snapshot.world.destination, null);
                assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
                const judgment = JSON.stringify(turn.conditionJudgment);
                await resume(); assert.equal(JSON.stringify(snapshot.state.context.turns.at(-1).conditionJudgment), judgment);
            }
            await js('document.querySelector("button[aria-controls=notebook]").click()');
            assert.ok(await js('document.querySelector("#notebook").textContent.includes("予約にはしない")'));
            for (const marker of [condition.met, condition.unmet]) {
                assert.ok(await js(`document.querySelector('#notebook').textContent.includes(${JSON.stringify(marker)})`));
            }
            await js('Array.from(document.querySelectorAll("#notebook .note-card")).find(node => node.textContent.includes("条件と適用先")).scrollIntoView({block:"start"})');
            window.setSize(1281, 800); await sleep(500);
            const screenshot = path.resolve(__dirname, '../../tests/word-conditions-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            await resume();
            assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge); assert.equal(JSON.stringify(snapshot.state.experiences), origins);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'rest').length, 5);
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, conditions: true, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--boundaries')) {
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            const resume = async () => {
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('window.smokeBeginSession()'); await sleep(150);
            };
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'observe', dwell: 60, attention: 'shade',
                destination: null, hunger: .2, fatigue: .2 });
            await resume();
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            const groundedKnowledge = () => JSON.stringify({ ...snapshot.state.knowledge,
                associations: snapshot.state.knowledge.associations.filter(a => a.evidence.length) });
            const knowledge = groundedKnowledge();
            for (const raw of ['疲れたら。少し休もう', '食べ終わったら\n少し休もう', 'でも。少し休もう']) {
                await chat(raw);
                const u = snapshot.state.context.turns.at(-1).understandings.at(-1);
                assert.equal(u.complete, false); assert.ok(u.unresolved.some(item => item.type === 'clause_scope'));
                assert.equal(snapshot.world.destination, null);
                assert.equal(groundedKnowledge(), knowledge);
            }
            await chat('これをぽぽって呼ぼう');
            const original = snapshot.state.records.at(-1).id;
            const name = JSON.stringify(snapshot.state.knowledge.associations.find(a => a.word === 'ぽぽ'));
            await chat('もし違うなら。さっきの説明は間違えた');
            assert.equal(snapshot.state.records.find(r => r.id === original).retractedBy, undefined);
            assert.equal(JSON.stringify(snapshot.state.knowledge.associations.find(a => a.word === 'ぽぽ')), name);
            const unresolved = JSON.stringify(snapshot.state.context.turns.at(-1).understandings);
            await resume();
            assert.equal(JSON.stringify(snapshot.state.context.turns.at(-1).understandings), unresolved);
            assert.equal(JSON.stringify(snapshot.state.knowledge.associations.find(a => a.word === 'ぽぽ')), name);
            await chat('これをももって呼ぼう');
            await chat('さっきの説明は間違えた');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, true);
            await chat('少し休もう');
            assert.equal(snapshot.world.destination, 'shade');
            assert.equal(snapshot.world.reasons[0].kind, 'understood_suggestion');
            window.setSize(1281, 800); await sleep(500);
            const screenshot = path.resolve(__dirname, '../../tests/word-boundaries-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, boundaries: true, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--relations') || process.argv.includes('--questions') || process.argv.includes('--proposals') || process.argv.includes('--reports') || process.argv.includes('--negations') || process.argv.includes('--times')) {
            const questions = process.argv.includes('--questions');
            const proposals = process.argv.includes('--proposals');
            const reports = process.argv.includes('--reports');
            const negations = process.argv.includes('--negations');
            const times = process.argv.includes('--times');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            const resume = async () => {
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('window.smokeBeginSession()'); await sleep(150);
            };
            for (const [index, activity] of (times ? ['rest', 'rest', 'rest', 'rest'] : negations ? ['rest', 'rest', 'rest', 'eat'] : proposals || reports ? ['rest', 'rest'] : ['eat', 'rest']).entries()) {
                nextLoad = structuredClone(snapshot);
                nextLoad.state.settings.foundation = false;
                if (index === 0) nextLoad.state.knowledge.relations = [];
                Object.assign(nextLoad.world, { mode: activity, dwell: 3, attention: activity === 'eat' ? 'berry:1' : 'shade',
                    destination: null, activityStart: nextLoad.world.elapsed, harvest: 1,
                    activityBefore: { hunger: .8, fatigue: .8 }, hunger: .8, fatigue: .8,
                    mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
                await resume();
                assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
                await chat(times && index >= 2 ? index === 2 ? '【時点・現在】「あなたはいま休んでいる」' : '【時点・過去】「あなたはさっき休んでいた」'
                    : negations && index >= 2 ? index === 2 ? '【否定対照・肯定】「あなたは休んでいる」' : '【否定対照・否定】「あなたは休んでいない」'
                    : reports || negations || times ? index === 0 ? '【報告・あなた】「あなたは休んでいる」' : '【報告・私】「私は休んでいる」'
                    : proposals ? index === 0 ? '【お願い】「休んでね」' : '【誘い】「一緒に休もう」'
                    : questions ? `「何してる？」→「${index === 0 ? '食べる' : '休む'}」`
                    : index === 0 ? 'もぐは食べることだよ' : 'ぽぽは休むことだよ');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
                assert.equal(snapshot.world.relationLabels.length, 1);
                assert.equal(snapshot.state.knowledge.relations.length, (negations || times) && index >= 2 ? 2 : 0);
                const pending = JSON.stringify(snapshot.world.relationLabels);
                await resume(); assert.equal(JSON.stringify(snapshot.world.relationLabels), pending);
                await sleep(4500);
                await chat('こんにちは'); // Flush the completed single-tick experience to the store.
                assert.equal(snapshot.state.knowledge.relationEvidence.length, index + 1);
                assert.equal(snapshot.state.knowledge.relations.length, negations || times ? index === 0 ? 0 : index < 3 ? 2 : 4 : proposals || reports ? index * 2 : index);
            }
            const origins = JSON.stringify(snapshot.state.experiences);
            await chat(times ? 'あなたはさっき休んでいた' : negations ? 'あなたは休んでいない' : reports ? 'あなたは休んでいる' : proposals ? '休んでね' : questions ? '何してる？' : 'ぽぽは休むことだよ');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, true);
            if (times) {
                const u = snapshot.state.context.turns.at(-1).understandings[0];
                assert.equal(u.eventTime, 'past'); assert.equal(u.subject, 'self'); assert.equal(u.roles.verified, false);
                assert.equal(snapshot.state.records.at(-1).source, 'speaker_report'); assert.equal(snapshot.world.destination, null);
                const original = snapshot.state.experiences.find(e => e.relationLabels?.some(l => l.relation === 'time' && l.eventTime === 'now'));
                const past = snapshot.state.experiences.flatMap(e => e.relationLabels || []).find(l => l.relation === 'time' && l.eventTime === 'past');
                assert.equal(past.eventReference.experienceId, original.id); assert.equal(past.eventReference.end, original.end);
                assert.ok(past.eventReference.end <= past.start); assert.notEqual(past.heardAt, original.end);
                assert.ok(await js('document.querySelector("#conversation").textContent.includes("さっきの休息")'));
                await chat('私はさっき休んでいた');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
                await chat('あなたはさっき休んでいなかった');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].polarity, 'unknown');
            } else if (negations) {
                const u = snapshot.state.context.turns.at(-1).understandings[0];
                assert.equal(u.subject, 'self'); assert.equal(u.polarity, 'negative'); assert.equal(u.known.meaning, 'rest');
                assert.equal(u.roles.verified, false); assert.equal(u.eventTime, 'unspecified');
                assert.equal(snapshot.state.records.at(-1).source, 'speaker_report');
                assert.equal(snapshot.world.destination, null);
                assert.ok(await js('document.querySelector("#conversation").textContent.includes("ぼくが休んでいない")'));
            } else if (reports) {
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].subject, 'self');
                await chat('私は休んでいる');
                const u = snapshot.state.context.turns.at(-1).understandings[0];
                assert.equal(u.complete, true); assert.equal(u.subject, 'player');
                assert.equal(u.roles.reporter, 'player'); assert.equal(u.roles.verified, false);
                assert.equal(snapshot.state.records.at(-1).source, 'speaker_report');
                assert.equal(snapshot.state.knowledge.wordExplanations, undefined);
                assert.equal(snapshot.world.destination, null);
            } else if (proposals) {
                assert.deepEqual(snapshot.state.context.turns.at(-1).understandings[0].roles.actors, ['self']);
                await chat('一緒に休もう');
                const u = snapshot.state.context.turns.at(-1).understandings[0];
                assert.equal(u.complete, true); assert.deepEqual(u.roles.actors, ['player', 'self']);
                assert.equal(u.roles.actualParticipation, false);
                assert.equal(snapshot.state.knowledge.wordExplanations, undefined);
            } else if (questions) {
                assert.equal(snapshot.state.knowledge.wordExplanations, undefined);
                assert.equal(snapshot.state.context.turns.at(-1).answer.source.questionSlot, 'current_activity');
                assert.equal(snapshot.state.knowledge.relations[0].id, 'question');
                assert.equal(snapshot.world.destination, null);
            } else assert.equal(snapshot.state.knowledge.wordExplanations.length, 1);
            if (process.argv.includes('--correction-basis')) {
                const { valid } = require('./storage');
                const entry = structuredClone(snapshot.state.knowledge.wordExplanations[0]);
                assert.equal(entry.input.raw, 'ぽぽは休むことだよ');
                assert.equal(entry.input.locale, 'ja');
                const knowledge = JSON.stringify(snapshot.state.knowledge);
                for (let i = 0; i < 3; i++) {
                    await chat('さっき間違えた。ぽぽは食べることだよ');
                    const u = snapshot.state.context.turns.at(-1).understandings[0];
                    assert.deepEqual(u.relations, ['naming']);
                    assert.deepEqual(u.unresolved, [{ type: 'relation', id: 'correction' }]);
                    assert.equal(u.complete, false);
                    assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
                    assert.ok(valid(snapshot));
                }
                await resume();
                assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
                assert.equal(JSON.stringify(snapshot.state.experiences), origins);
                assert.deepEqual(snapshot.state.knowledge.wordExplanations[0], entry);
                assert.ok(valid(snapshot));
            }
            if (process.argv.includes('--corrections')) {
                const { valid } = require('./storage');
                const forms = require('../../experimental_word_learning_catalog.json').correctionTeaching.ja;
                const original = structuredClone(snapshot.state.knowledge.wordExplanations[0]);
                await chat(`${forms.source}«${forms.exampleSource}»`);
                assert.equal(snapshot.state.correctionLessons.length, 1);
                assert.equal(snapshot.state.correctionLessons[0].replacement, undefined);
                assert.ok(valid(snapshot)); await resume();
                await chat(`${forms.replacement}«${forms.exampleReplacement}»`);
                assert.equal(snapshot.state.knowledge.relations.filter(r => r.id === 'correction').length, 1);
                assert.deepEqual(snapshot.state.knowledge.wordExplanations[0], original);
                assert.ok(valid(snapshot)); await resume();
                await chat(forms.exampleReplacement);
                assert.equal(snapshot.state.knowledge.wordExplanations[1].corrects, original.inputId);
                assert.equal(JSON.stringify(snapshot.state.experiences), origins);
                assert.ok(valid(snapshot)); await resume();
                assert.equal(snapshot.state.knowledge.wordExplanations.length, 2);
            }
            await chat('休めた？');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].complete, false);
            await js('document.querySelector("button[aria-controls=notebook]").click()');
            assert.ok(await js(`document.querySelector("#notebook").textContent.includes(${JSON.stringify(times ? '相手の経験や否定文へは広げない' : negations ? '別の行動や希望は決めない' : reports ? '内容が事実かは未確認' : proposals
                ? '共同体験の記録ではない' : questions ? '同じ相手・言語・問いに限る' : '同じ相手・言語の短い説明で使える')})`));
            window.setSize(1281, 800); await sleep(500);
            const screenshot = path.resolve(__dirname, times ? '../../tests/word-times-smoke.png' : negations ? '../../tests/word-negations-smoke.png' : reports ? '../../tests/word-reports-smoke.png' : proposals ? '../../tests/word-proposals-smoke.png'
                : questions ? '../../tests/word-questions-smoke.png' : process.argv.includes('--corrections') ? '../../tests/word-corrections-smoke.png' : process.argv.includes('--correction-basis')
                    ? '../../tests/word-correction-basis-smoke.png' : '../../tests/word-relations-smoke.png');
            fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            if (process.argv.includes('--corrections')) {
                assert.ok(await js('document.querySelector("#notebook s")?.textContent.includes("ぽぽ → 休む")'));
                assert.ok(await js(`document.querySelector('#notebook').textContent.includes('【取り下げて置換】')`));
                await js(`Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'ひと休み・再開').click()`);
                window.setSize(1320, 850); await sleep(400);
                await js(`Array.from(document.querySelectorAll('#notebook .note-card')).find(card => card.textContent.includes('【取り下げて置換】')).scrollIntoView({block:'start'}); void 0`);
                window.setSize(1340, 850); await sleep(600);
                const noteView = await js(`(() => { const note = document.querySelector('#notebook'), card = Array.from(note.querySelectorAll('.note-card')).find(card => card.textContent.includes('【取り下げて置換】')); note.scrollTop += card.getBoundingClientRect().top - note.getBoundingClientRect().top; const rect = card.getBoundingClientRect(), panel = note.getBoundingClientRect(); return { top:rect.top, bottom:rect.bottom, panelTop:panel.top, panelBottom:panel.bottom, scroll:note.scrollTop }; })()`);
                assert.ok(noteView.top >= noteView.panelTop - 1 && noteView.bottom <= noteView.panelBottom + 1, JSON.stringify(noteView));
                await sleep(500);
                fs.writeFileSync(path.resolve(__dirname, '../../tests/word-corrections-teaching-smoke.png'),
                    (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
            }
            const knowledge = JSON.stringify(snapshot.state.knowledge);
            await resume();
            assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
            assert.equal(JSON.stringify(snapshot.state.experiences), origins);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'eat').length, proposals || reports || times ? 0 : 1);
            assert.equal(snapshot.world.experiences.filter(e => e.kind === 'rest').length, times ? 4 : negations ? 3 : proposals || reports ? 2 : 1);
            assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
            assert.deepEqual(failures, []);
            console.log(JSON.stringify({ ok: true, relations: true, questions, proposals, reports, negations, times, initial, screenshot, profile: directory }));
            return;
        }
        if (process.argv.includes('--life')) {
            nextLoad = structuredClone(snapshot);
            nextLoad.state.settings.life = false; nextLoad.state.knowledge.meanings = [];
            Object.assign(nextLoad.world, { mode: 'observe', dwell: 5, attention: 'berry:1',
                destination: null, hunger: .8, fatigue: .2 });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('window.smokeBeginSession()');
            await sleep(300);
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            for (const raw of ['木の実', '食べる', '甘い']) await chat(raw);
            assert.equal(snapshot.world.mode, 'eat');
            assert.equal(snapshot.world.lifeLabels.length, 3);
            assert.equal(snapshot.state.knowledge.meanings.length, 0);
            const labels = JSON.stringify(snapshot.world.lifeLabels);
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
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
                await js('window.smokeBeginSession()');
                await chat('さっき間違えた。ぽぽは休むことじゃなくて、木の実のことだよ');
                assert.equal(snapshot.state.knowledge.wordExplanations[1].corrects, original);
                assert.ok(await js('document.querySelector("#conversation").textContent.includes("前の説明を言い直した")'));
                await chat('ぽぽ');
                assert.equal(snapshot.state.context.turns.at(-1).understandings[0].known.meaning, 'berry');
                assert.equal(JSON.stringify(snapshot.state.knowledge.meanings), knownBefore);
                assert.equal(JSON.stringify(snapshot.state.experiences), experiencesBefore);
                const explanations = JSON.stringify(snapshot.state.knowledge.wordExplanations);
                await window.loadURL(url); await paintClock(); await sleep(600);
                await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
            const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
            assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
            await chat('今何してるの？'); await chat('もう一度教えて'); await chat('一息って？');
            assert.ok(await js('document.querySelector("#conversation").textContent.includes("少し何もせず休む")'));
            assert.equal(snapshot.state.context.lastOutput.source.message, 'taking_break');
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('window.smokeBeginSession()');
            await chat('つまり休んでいるということ？');
            assert.equal(snapshot.state.context.turns.at(-1).understandings[0].questionSlot, 'context_detail');
            nextLoad = structuredClone(snapshot);
            Object.assign(nextLoad.world, { mode: 'eat', dwell: .2, harvest: 1, fruit: 1, attention: 'berry:1',
                activityStart: nextLoad.world.elapsed, activityBefore: { hunger: .8, fatigue: .2 },
                mealTaste: { quality: 'sweet', pleasant: true }, hunger: .8 });
            await window.loadURL(url); await paintClock(); await sleep(600);
            await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
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
            await js('window.smokeBeginSession()');
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
        await js('window.smokeBeginSession()');
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
        await js('window.smokeBeginSession()');
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
