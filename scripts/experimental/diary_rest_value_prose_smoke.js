'use strict';
// Hidden isolated renderer with a new temporary profile, never game/player storage.
const fs = require('node:fs'), path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename],
        { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow } = require('electron');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-rest-value-prose-'));
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
        await js('globalThis.ExperimentalWordDiaryRestValueReportsCatalog='
            + JSON.stringify(require('../../experimental_word_learning_catalog.json')) + ';void 0');
        await js('globalThis.ExperimentalWordDiaryIncompleteRestValueReportsCatalog=ExperimentalWordDiaryRestValueReportsCatalog;void 0');
        const files = ['experimental_word_learning_core.js', 'experimental_word_careers.js',
            'experimental_word_life_learning.js', 'experimental_word_relation_learning.js',
            'experimental_word_feeling_learning.js', 'experimental_word_learning_world.js',
            'experimental_word_diary_candidates.js', 'experimental_word_diary_rest_value_reports.js',
            'experimental_word_diary_incomplete_rest_value_reports.js',
            'experimental_word_diary_rest_value_prose.js', 'localization_catalog.js', 'localization_core.js'];
        for (const file of files) await js(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'));
        const fixtures = require('./diary_rest_value_prose_fixtures');
        const values = [...fixtures.examples(), ...fixtures.addedExamples(), ...fixtures.punctuationExamples(),
            ...fixtures.activityFatigueExamples(), ...fixtures.incompleteExamples(),
            ...fixtures.bothMissingAndScopedExamples()], excluded = fixtures.excludedExamples();
        const material = value => {
            const buffer = require('../../experimental_word_diary_candidates').create();
            require('../../experimental_word_diary_rest_value_reports').capture(buffer, value.result, value.receipt)
                || require('../../experimental_word_diary_incomplete_rest_value_reports').capture(buffer, value.result, value.receipt);
            return buffer.read()[0];
        };
        let rejected = 0;
        for (const [index, value] of [...values, ...excluded].entries()) {
            const answer = await js(`(() => {
                const v=${JSON.stringify(value)}, before=JSON.stringify(v), buffer=ExperimentalWordDiaryCandidates.create();
                ExperimentalWordDiaryRestValueReports.capture(buffer,v.result,v.receipt)
                    || ExperimentalWordDiaryIncompleteRestValueReports.capture(buffer,v.result,v.receipt);
                const record=buffer.read()[0], original=JSON.stringify(record);
                const text=ExperimentalWordDiaryRestValueProse.render(record,v.result,v.receipt), translations={};
                if(text!==null) for(const locale of Object.keys(GameI18n.languages)) {
                    GameI18n.setLanguage(locale); translations[locale]=GameI18n.translate(text);
                }
                const stable=before===JSON.stringify(v)&&original===JSON.stringify(record);
                if(record) record.captured.newLearning=true;
                return {text,translations,stable,altered:ExperimentalWordDiaryRestValueProse.render(record,v.result,v.receipt)};
            })()`);
            const sentence = index < values.length
                ? require('../../experimental_word_diary_rest_value_prose').render(material(value), value.result, value.receipt) : null;
            if (index < values.length) assert.equal(typeof sentence, 'string');
            assert.equal(answer.text, sentence);
            assert.equal(answer.stable, true); assert.equal(answer.altered, null);
            if (index < values.length) {
                rejected++;
                for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
                    const entries = require('../../locales/' + locale + '.json');
                    assert.equal(Object.hasOwn(entries, sentence), true);
                    assert.equal(answer.translations[locale], entries[sentence]);
                }
            }
        }
        const state = await js(`({local:{...localStorage},session:{...sessionStorage},bridge:typeof wordLifeStorage})`);
        assert.deepEqual(state, { local: { '4e-sentinel': 'keep' }, session: { '4e-sentinel': 'keep' }, bridge: 'undefined' });
        console.log(JSON.stringify({ restValueProse: { examples: values.length, rejected, scopeRejected: excluded.length,
            translations: values.length * 7, sourceStable: true, storageUnchanged: true, directory } }));
        win.destroy(); server.close(); app.quit();
    }).catch(error => { console.error(error); if (server) server.close(); app.exit(1); });
}
