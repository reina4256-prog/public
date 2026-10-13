'use strict';
// Actual modules in a disposable Electron renderer; all files stay in its temp profile.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const { app, BrowserWindow } = require('electron');
    const assert = require('node:assert/strict');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-rest-start-preview-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    app.whenReady().then(async () => {
        const { bases, exercise, catalog } = require('./rest_start_fixtures');
        const { valid, createStore } = require('./storage');
        const window = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
        window.setMenu(null); window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        await window.loadURL('data:text/html;charset=utf-8,<title>Rest start verification</title>');
        const js = code => window.webContents.executeJavaScript(code, true);
        await js(`globalThis.restStartTestCatalog=${JSON.stringify(catalog)}; void 0`);
        for (const name of ['experimental_word_learning_core', 'experimental_word_careers', 'experimental_word_life_learning',
            'experimental_word_relation_learning', 'experimental_word_feeling_learning', 'experimental_word_learning_world',
            'experimental_word_diary_candidates']) {
            await js(fs.readFileSync(path.resolve(__dirname, '../../' + name + '.js'), 'utf8'));
        }
        await js('globalThis.ExperimentalWordDiaryReasonAnswersCatalog=restStartTestCatalog; void 0');
        await js(fs.readFileSync(path.resolve(__dirname, '../../experimental_word_diary_reason_answers.js'), 'utf8'));
        let cases = 0, saves = 0, resumedStarts = 0;
        for (const { locale, value } of bases()) for (const choice of ['request', 'invitation', 'autonomous']) {
            const result = await js(`(${exercise.toString()})(${JSON.stringify(value)},${JSON.stringify(locale)},${JSON.stringify(choice)},
                {core:ExperimentalWordLearning,world:ExperimentalWordWorld,relation:ExperimentalWordRelationLearning},restStartTestCatalog)`);
            assert.equal(result.started.world.elapsed, result.start);
            assert.equal(result.stopped.world.history.at(-1).startInputSerial, result.serial);
            assert.equal(result.stopped.world.history.at(-1).end, result.start);
            assert.equal(result.review.result.relationLearning, undefined);
            assert.equal(result.answer.reply.message, value.state.settings.speech === 'short' ? 'answer_unknown' : 'attend');
            assert.deepEqual(result.value.state.experiences, result.old.experiences);
            for (const snapshot of [result.started, result.stopped, result.value]) {
                assert.ok(valid(snapshot));
                assert.deepEqual(createStore(directory).save(snapshot), { ok: true });
                assert.deepEqual(createStore(directory).load(), { ok: true, value: snapshot });
                saves++;
            }
            assert.deepEqual(createStore(directory).save(result.started), { ok: true });
            const loaded = createStore(directory).load().value;
            const resumed = await js(`(() => {
                const v=${JSON.stringify(loaded)};
                ExperimentalWordWorld.approach(v.world,'path');
                const r=ExperimentalWordLearning.receive(v.state,restStartTestCatalog.reasonTeaching[${JSON.stringify(locale)}].utterance,
                    restStartTestCatalog,{locale:${JSON.stringify(locale)},speaker:'player',at:100+v.state.serial});
                const reply=ExperimentalWordWorld.respond(v.world,r,v.state,restStartTestCatalog);
                return {value:v,reply};
            })()`);
            assert.equal(resumed.reply.message, value.state.settings.speech === 'short' ? 'answer_unknown' : 'attend');
            assert.ok(valid(resumed.value));
            assert.deepEqual(createStore(directory).save(resumed.value), { ok: true });
            assert.deepEqual(createStore(directory).load().value, resumed.value);
            saves += 2; resumedStarts++;
            cases++;
        }
        await js(`for(const key of ['restStartTestCatalog','ExperimentalWordDiaryReasonAnswersCatalog','ExperimentalWordLearning',
            'ExperimentalWordCareers','ExperimentalWordLifeLearning','ExperimentalWordRelationLearning','ExperimentalWordFeelingLearning',
            'ExperimentalWordWorld','ExperimentalWordDiaryCandidates','ExperimentalWordDiaryReasonAnswers']) delete globalThis[key]; void 0`);
        assert.equal(await js(`Object.keys(globalThis).some(k=>k.startsWith('ExperimentalWord')||k==='restStartTestCatalog')`), false);
        console.log(JSON.stringify({ ok: true, cases, saves, resumedStarts, profile: directory, rendererGlobalsRemoved: true }));
        app.quit();
    }).catch(error => { console.error(error); app.exit(1); });
}
