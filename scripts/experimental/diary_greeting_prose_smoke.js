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
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-greeting-prose-'));
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
            'experimental_word_diary_greetings.js', 'experimental_word_diary_greeting_prose.js',
            'localization_catalog.js', 'localization_core.js'];
        await js('globalThis.ExperimentalWordDiaryGreetingsCatalog='
            + JSON.stringify(require('../../experimental_word_learning_catalog.json')) + ';void 0');
        for (const file of files) await js(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'));
        const values = require('./diary_greeting_prose_fixtures').examples();
        const sentence = '\u6328\u62f6\u3055\u308c\u305f\u3002';
        let rejected = 0;
        for (const value of values) {
            const answer = await js(`(() => {
                const v=${JSON.stringify(value)}, before=JSON.stringify(v);
                const buffer=ExperimentalWordDiaryGreetings.create();
                if(!ExperimentalWordDiaryGreetings.capture(buffer,v.result,v.receipt)) throw Error('capture');
                const record=buffer.read()[0], original=JSON.stringify(record);
                const text=ExperimentalWordDiaryGreetingProse.render(record,v.result,v.receipt);
                const translations={};
                for(const locale of Object.keys(GameI18n.languages)){
                    GameI18n.setLanguage(locale);translations[locale]=GameI18n.translate(text);
                }
                const stable=before===JSON.stringify(v)&&original===JSON.stringify(record);
                record.captured.morningVerified=true;
                const altered=ExperimentalWordDiaryGreetingProse.render(record,v.result,v.receipt);
                return {text,translations,stable,altered};
            })()`);
            assert.equal(answer.text, sentence); assert.equal(answer.stable, true);
            assert.equal(answer.altered, null); rejected++;
            for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
                assert.equal(answer.translations[locale], require('../../locales/' + locale + '.json')[sentence]);
        }
        const state = await js(`(() => {
            const names=['ExperimentalWordLearning','ExperimentalWordCareers','ExperimentalWordLifeLearning',
                'ExperimentalWordRelationLearning','ExperimentalWordFeelingLearning','ExperimentalWordWorld',
                'ExperimentalWordDiaryGreetings','ExperimentalWordDiaryGreetingProse'];
            names.forEach(name=>delete globalThis[name]);
            return {removed:names.every(name=>typeof globalThis[name]==='undefined'),
                local:{...localStorage},session:{...sessionStorage},bridge:typeof wordLifeStorage};
        })()`);
        assert.deepEqual(state, { removed: true, local: { '4e-sentinel': 'keep' },
            session: { '4e-sentinel': 'keep' }, bridge: 'undefined' });
        console.log(JSON.stringify({ greetingProse: { examples: values.length, rejected,
            translations: values.length * 7, sourceStable: true, storageUnchanged: true, directory } }));
        win.destroy(); server.close(); app.quit();
    }).catch(error => { console.error(error); if (server) server.close(); app.exit(1); });
}
