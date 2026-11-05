'use strict';
// Hidden isolated browser; the game and player storage are never opened.
const fs = require('node:fs'), path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename],
        { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow } = require('electron');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-rest-comfort-prose-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    let server;
    app.whenReady().then(async () => {
        server = require('node:http').createServer((_request, response) => {
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            response.end('<!doctype html><html lang="ja" data-i18n-ephemeral><title>4e isolated check</title><body></body></html>');
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const win = new BrowserWindow({ show: false, webPreferences: {
            sandbox: true, contextIsolation: true, nodeIntegration: false } });
        win.setMenu(null); win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        await win.loadURL('http://127.0.0.1:' + server.address().port);
        const js = source => win.webContents.executeJavaScript(source, true);
        await js("localStorage.setItem('4e-sentinel','keep');sessionStorage.setItem('4e-sentinel','keep');void 0");
        const files = ['experimental_word_learning_core.js', 'experimental_word_careers.js',
            'experimental_word_life_learning.js', 'experimental_word_relation_learning.js',
            'experimental_word_feeling_learning.js', 'experimental_word_learning_world.js',
            'experimental_word_diary_candidates.js', 'experimental_word_diary_rest_comfort_reports.js',
            'experimental_word_diary_incomplete_rest_comfort_reports.js', 'experimental_word_diary_rest_comfort_prose.js',
            'localization_catalog.js', 'localization_core.js'];
        await js('globalThis.ExperimentalWordDiaryRestComfortReportsCatalog='
            + JSON.stringify(require('../../experimental_word_learning_catalog.json')) + ';void 0');
        await js('globalThis.ExperimentalWordDiaryIncompleteRestComfortReportsCatalog=ExperimentalWordDiaryRestComfortReportsCatalog;void 0');
        for (const file of files) await js(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'));
        const fixtures = require('./diary_rest_comfort_prose_fixtures');
        const values = [...fixtures.examples(), ...fixtures.incompleteExamples(), ...fixtures.partialExamples(),
            ...fixtures.relationExamples(), ...fixtures.doubleMissingExamples(), ...fixtures.mixedReportExamples(),
            ...fixtures.mixedConditionExamples(), ...fixtures.threeMissingExamples(), ...fixtures.alternateExamples(),
            ...fixtures.unknownAlternateExamples(), ...fixtures.punctuationExamples()];
        const sentence = "横になると気持ちいいと聞いた。";
        const unknownSentence = '\u8a00\u308f\u308c\u305f\u3053\u3068\u304c\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002';
        const relationSentence = '休むことと気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        const missingBothMeaningsSentence = '何かを伝えられたけれど、何のことか分からなかった。';
        const partialSentences = [
            '\u4f11\u3080\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002',
            '\u6c17\u6301\u3061\u3088\u3055\u306e\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002'
        ];
        let rejected = 0;
        for (const value of values) {
            const answer = await js(`(() => {
                const v=${JSON.stringify(value)}, before=JSON.stringify(v);
                const buffer=ExperimentalWordDiaryCandidates.create();
                if(!ExperimentalWordDiaryRestComfortReports.capture(buffer,v.result,v.receipt)
                    &&!ExperimentalWordDiaryIncompleteRestComfortReports.capture(buffer,v.result,v.receipt)) throw Error('capture');
                const record=buffer.read()[0], original=JSON.stringify(record);
                const text=ExperimentalWordDiaryRestComfortProse.render(record,v.result,v.receipt);
                const translations={};
                for(const locale of Object.keys(GameI18n.languages)){
                    GameI18n.setLanguage(locale);translations[locale]=GameI18n.translate(text);
                }
                const stable=before===JSON.stringify(v)&&original===JSON.stringify(record);
                record.captured.newLearning=true;
                const altered=ExperimentalWordDiaryRestComfortProse.render(record,v.result,v.receipt);
                return {text,translations,stable,altered};
            })()`);
            const u = value.result.understandings[0];
            const expected = u.complete ? sentence : u.kind === 'partial'
                ? (Object.keys(u.known).length === 2 ? relationSentence
                    : u.known.conditionMeaning === 'rest' ? partialSentences[0]
                        : u.known.meaning === 'comfortable' ? partialSentences[1] : unknownSentence)
                : !Object.keys(u.known).length ? missingBothMeaningsSentence
                    : u.known.conditionMeaning === 'rest' ? partialSentences[0] : partialSentences[1];
            assert.equal(answer.text, expected); assert.equal(answer.stable, true);
            assert.equal(answer.altered, null); rejected++;
            for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
                assert.equal(answer.translations[locale], require('../../locales/' + locale + '.json')[expected]);
        }
        // BN variants in BO's shore context are valid av reports, outside this prose scope.
        const { setup, hearComfort, core } = require('./diary_rest_comfort_report_fixtures');
        let combinedRejected = 0;
        for (const value of values.slice(2, 24)) {
            const v = setup({ speech: value.receipt.beforeState.settings.speech });
            core.perceive(v.state, { scene: 'shore', attention: [] });
            const combined = hearComfort(v, value.result.input.raw);
            const answer = await js(`(() => {
                const v=${JSON.stringify(combined)}, before=JSON.stringify(v);
                const buffer=ExperimentalWordDiaryCandidates.create();
                if(!ExperimentalWordDiaryRestComfortReports.capture(buffer,v.result,v.receipt)) throw Error('combined capture');
                const record=buffer.read()[0], original=JSON.stringify(record);
                return {text:ExperimentalWordDiaryRestComfortProse.render(record,v.result,v.receipt),
                    stable:before===JSON.stringify(v)&&original===JSON.stringify(record)};
            })()`);
            assert.deepEqual(answer, { text: null, stable: true }); combinedRejected++;
        }
        let scopeRejected = 0;
        for (const value of [...fixtures.excludedExamples(), ...fixtures.fatigueExcludedExamples(), ...fixtures.partialExcludedExamples(),
            ...fixtures.relationExcludedExamples(), ...fixtures.doubleMissingExcludedExamples(), ...fixtures.mixedReportExcludedExamples(),
            ...fixtures.mixedConditionExcludedExamples(), ...fixtures.threeMissingExcludedExamples(), ...fixtures.alternateExcludedExamples(),
            ...fixtures.unknownAlternateExcludedExamples(), ...fixtures.punctuationExcludedExamples()]) {
            const answer = await js(`(() => {
                const v=${JSON.stringify(value)}, before=JSON.stringify(v);
                const buffer=ExperimentalWordDiaryCandidates.create();
                ExperimentalWordDiaryRestComfortReports.capture(buffer,v.result,v.receipt)
                    ||ExperimentalWordDiaryIncompleteRestComfortReports.capture(buffer,v.result,v.receipt);
                const record=buffer.read()[0], original=JSON.stringify(record);
                return {text:ExperimentalWordDiaryRestComfortProse.render(record,v.result,v.receipt),
                    stable:before===JSON.stringify(v)&&original===JSON.stringify(record)};
            })()`);
            assert.deepEqual(answer, { text: null, stable: true }); scopeRejected++;
        }
        const state = await js(`(() => {
            const names=['ExperimentalWordLearning','ExperimentalWordCareers','ExperimentalWordLifeLearning',
                'ExperimentalWordRelationLearning','ExperimentalWordFeelingLearning','ExperimentalWordWorld',
                'ExperimentalWordDiaryCandidates','ExperimentalWordDiaryRestComfortReports',
                'ExperimentalWordDiaryIncompleteRestComfortReports','ExperimentalWordDiaryRestComfortProse'];
            names.forEach(name=>delete globalThis[name]);
            return {removed:names.every(name=>typeof globalThis[name]==='undefined'),
                local:{...localStorage},session:{...sessionStorage},bridge:typeof wordLifeStorage};
        })()`);
        assert.deepEqual(state, { removed: true, local: { '4e-sentinel': 'keep' },
            session: { '4e-sentinel': 'keep' }, bridge: 'undefined' });
        console.log(JSON.stringify({ restComfortProse: { examples: values.length, rejected, combinedRejected, scopeRejected,
            translations: values.length * 7, sourceStable: true, storageUnchanged: true, directory } }));
        win.destroy(); server.close(); app.quit();
    }).catch(error => { console.error(error); if (server) server.close(); app.exit(1); });
}
