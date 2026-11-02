'use strict';
// Test-only inputs in a hidden browser, isolated profile/save/log directories.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow, ipcMain } = require('electron');
    const { createServer } = require('./serve');
    const { readSession } = require('./playtest_store');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-personal-playtest-smoke-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    app.on('window-all-closed', () => {});
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let server, window, active;
    const rows = () => fs.readdirSync(path.join(active, 'sessions')).filter(name => name.endsWith('.jsonl'))
        .flatMap(name => readSession(path.join(active, 'sessions', name)));
    const js = code => window.webContents.executeJavaScript(code, true);
    async function until(expression) {
        for (let n = 0; n < 150; n++) { if (await js(expression)) return; await sleep(100); }
        throw new Error('Timeout: ' + expression);
    }
    const input = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)};
        document.querySelector('.chat-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));void 0`);
    app.whenReady().then(async () => {
        const results = [];
        for (const native of [false, true]) {
            active = path.join(directory, native ? 'native-logs' : 'web-logs');
            server = createServer({ autoRecord: { directory: active } });
            await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
            const origin = `http://127.0.0.1:${server.address().port}`;
            const url = origin + '/experimental_word_island.html?debug=1';
            let saves = null;
            if (native) {
                const allowed = event => event.sender === window.webContents && event.senderFrame?.url === origin + '/experimental_word_island.html?debug=1';
                ipcMain.on('word-life-load', event => { event.returnValue = { ok: true, value: saves }; });
                ipcMain.on('word-life-save', (event, value) => { saves = value; event.returnValue = { ok: true }; });
                ipcMain.on('word-personal-log-append', (event, packet) => { event.returnValue = allowed(event)
                    ? server.personalRecording.append(packet) : { ok: false }; });
            }
            window = new BrowserWindow({ show: false, width: 1280, height: 900,
                webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
                    ...(native ? { preload: path.join(__dirname, 'preload.js') } : {}) } });
            await window.loadURL(url);
            await until('!!document.querySelector("#word-new-game:not(:disabled)")');
            await until('document.querySelector("#word-personal-log-status")?.dataset.status === "saved"');
            await js(`document.querySelector('.word-logo').click();document.querySelector('#word-new-game').click();
                document.querySelector('#word-reset-accept').click();
                document.querySelector('form').dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true}));void 0`);
            await until('document.querySelector("#app").classList.contains("playing")');
            const raw = '  smoke-only 未知の入力🙂\n原文を保つ  ';
            await input(raw);
            await until('document.querySelector("#word-personal-log-status").dataset.status === "saved"');
            let recorded = rows();
            const interaction = recorded.find(row => row.event.kind === 'interaction').event;
            assert.equal(interaction.result.input.raw, raw);
            assert.deepEqual(interaction.receipt.inputKnowledge, interaction.receipt.beforeState.knowledge);
            assert.deepEqual(interaction.receipt.inputContext, interaction.receipt.beforeState.context);
            assert.equal(interaction.receipt.afterState.serial, interaction.receipt.beforeState.serial + 1);
            const before = JSON.stringify(interaction);
            const core = require('../../experimental_word_learning_core'), worldApi = require('../../experimental_word_learning_world');
            const catalog = require('../../experimental_word_learning_catalog.json');
            const state = JSON.parse(JSON.stringify(interaction.receipt.beforeState)), world = JSON.parse(JSON.stringify(interaction.receipt.beforeWorld));
            const expected = core.receive(state, raw, catalog, { locale: interaction.result.input.locale,
                speaker: interaction.result.input.speaker, at: interaction.result.input.at });
            assert.deepEqual(expected, interaction.result);
            assert.deepEqual(worldApi.respond(world, expected, state, catalog), interaction.receipt.reply);
            assert.deepEqual(state, interaction.receipt.afterState); assert.deepEqual(world, interaction.receipt.afterWorld);
            assert.equal(JSON.stringify(interaction), before);
            await js(`document.querySelector('#word-personal-log-toggle').click();void 0`);
            await input('paused-smoke-event');
            assert.equal(rows().filter(row => row.event.kind === 'player' && row.event.text === 'paused-smoke-event').length, 0);
            await js(`document.querySelector('#word-personal-log-toggle').click();void 0`);
            if (!native) {
                await js(`window.originalFetch=window.fetch;window.fetch=(url,...args)=>String(url).endsWith('/events')
                    ? Promise.reject(Error('test-only offline')):window.originalFetch(url,...args);void 0`);
            }
            await input('second-smoke-input');
            if (!native) {
                await until('document.querySelector("#word-personal-log-status").dataset.status === "failed"');
                await window.loadURL(url);
            }
            await until('document.querySelector("#word-personal-log-status")?.dataset.status === "saved"');
            recorded = rows();
            assert.equal(recorded.filter(row => row.event.kind === 'player' && row.event.text === raw).length, 1);
            assert.equal(recorded.filter(row => row.event.kind === 'player' && row.event.text === 'second-smoke-input').length, 1);
            assert.ok(recorded.filter(row => row.event.kind === 'session').every(row => /^[a-f0-9]{64}$/.test(row.event.runtime.runtimeHash)));
            for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
                const translated = await js(`GameI18n.setLanguage(${JSON.stringify(locale)});GameI18n.translate('自分用の自動記録：保存済み')`);
                assert.equal(translated, require('../../locales/' + locale + '.json')['自分用の自動記録：保存済み']);
            }
            if (native) {
                window.setSize(1281, 900);
                await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
                await sleep(1200);
                const picture = await window.webContents.capturePage(); fs.writeFileSync(path.join(directory, 'native-ui.png'), picture.toPNG());
                assert.ok(saves?.state); assert.equal(saves.state.serial, 3);
            }
            results.push({ native, events: recorded.length, exactInputs: 2, replyAndStateReplay: true,
                pausedEventAbsent: true, recoveredOutbox: !native, translations: 7 });
            console.log(JSON.stringify({ completedMode: results.at(-1) }));
            window.destroy(); window = null; server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); server = null;
        }
        console.log(JSON.stringify({ personalPlaytest: results, directory, syntheticTestEvidenceOnly: true })); app.quit();
    }).catch(error => { console.error(error); if (window) window.destroy(); if (server) { server.closeAllConnections(); server.close(); } app.exit(1); });
}
