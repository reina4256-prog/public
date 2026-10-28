'use strict';
// Hidden disposable renderer. Never loads a game/sample page or player save.
const fs = require('node:fs');
const path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename],
        { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow } = require('electron');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-dynamic-individual-reference-preview-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    let server;
    app.whenReady().then(async () => {
        server = require('node:http').createServer((_request, response) => {
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            response.end('<!doctype html><title>dt isolated check</title>');
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const window = new BrowserWindow({ show: false, webPreferences: {
            sandbox: true, contextIsolation: true, nodeIntegration: false } });
        window.setMenu(null); window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        await window.loadURL(`http://127.0.0.1:${server.address().port}/`);
        const js = source => window.webContents.executeJavaScript(source, true);
        await js("localStorage.setItem('dt-sentinel','keep');sessionStorage.setItem('dt-sentinel','keep');void 0");
        const files = ['experimental_word_learning_core.js', 'experimental_word_careers.js',
            'experimental_word_life_learning.js', 'experimental_word_relation_learning.js',
            'experimental_word_feeling_learning.js', 'experimental_word_learning_world.js',
            'experimental_word_diary_dynamic_individual_reference_materials.js'];
        await js(`globalThis.ExperimentalWordDiaryDynamicIndividualReferenceMaterialsCatalog=${JSON.stringify(require('../../experimental_word_learning_catalog.json'))};`);
        for (const file of files) await js(fs.readFileSync(path.resolve(__dirname, '../..', file), 'utf8'));
        const fixtures = require('./diary_dynamic_individual_reference_material_fixtures').fixtures();
        const copy = value => JSON.parse(JSON.stringify(value));
        const modified = fixtures.filter(f => f.expected).flatMap(f => {
            const source = copy(f), reply = copy(f), original = copy(f);
            source.value.result.input.speaker = 'tampered'; source.expected = false;
            reply.value.receipt.reply.message = 'invented'; reply.expected = false;
            original.value.receipt.inputContext.scene += ":tampered"; original.expected = false;
            return [source, reply, original];
        });
        const all = [...fixtures, ...modified];
        for (let offset = 0; offset < all.length; offset += 16) {
            const batch = all.slice(offset, offset + 16);
            const results = await js(`(() => {
                const batch=${JSON.stringify(batch)};
                return batch.map(({value}) => {
                    const source=JSON.stringify(value), buffer=ExperimentalWordDiaryDynamicIndividualReferenceMaterials.create();
                    const accepted=ExperimentalWordDiaryDynamicIndividualReferenceMaterials.capture(buffer,value.result,value.receipt);
                    const original=JSON.stringify(buffer.read());
                    const repeated=ExperimentalWordDiaryDynamicIndividualReferenceMaterials.capture(buffer,value.result,value.receipt);
                    const sourceStable=JSON.stringify(value)===source;
                    if (accepted) {
                        buffer.read()[0].captured.sources.input.raw='changed';
                        value.receipt.input.raw='changed'; value.receipt.inputKnowledge.meanings=[];
                    }
                    return {accepted,repeated,stable:JSON.stringify(buffer.read())===original,sourceStable};
                });
            })()`);
            results.forEach((result, index) => {
                assert.equal(result.accepted, batch[index].expected, `renderer ${offset + index}`);
                assert.equal(result.repeated, false); assert.equal(result.stable, true); assert.equal(result.sourceStable, true);
            });
        }
        const globals = ['ExperimentalWordDiaryDynamicIndividualReferenceMaterialsCatalog', 'ExperimentalWordLearning', 'ExperimentalWordCareers',
            'ExperimentalWordLifeLearning', 'ExperimentalWordRelationLearning', 'ExperimentalWordFeelingLearning',
            'ExperimentalWordWorld', 'ExperimentalWordDiaryDynamicIndividualReferenceMaterials'];
        assert.deepEqual(await js(`(() => {
            const names=${JSON.stringify(globals)};names.forEach(name=>delete globalThis[name]);
            return {removed:names.every(name=>typeof globalThis[name]==='undefined'),
                local:{...localStorage},session:{...sessionStorage},bridge:typeof wordLifeStorage};
        })()`), { removed: true, local: { 'dt-sentinel': 'keep' }, session: { 'dt-sentinel': 'keep' }, bridge: 'undefined' });
        console.log(JSON.stringify({ dtRenderer: { fixtures: fixtures.length, tampered: modified.length,
            total: all.length, groups: Object.fromEntries([...new Set(fixtures.map(f => f.group))]
                .map(group => [group, fixtures.filter(f => f.group === group).length])),
            globalsRemoved: globals.length, storageUnchanged: true, directory } }));
        window.destroy(); server.close(); app.quit();
    }).catch(error => { console.error(error); if (server) server.close(); app.exit(1); });
}
