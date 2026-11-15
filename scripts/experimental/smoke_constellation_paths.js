'use strict';
// Production preload, temporary in-memory save transport, no user save or mic.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code ?? 1; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow, ipcMain } = require('electron');
    app.disableHardwareAcceleration();
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'word-constellation-'));
    app.setPath('userData', profile);
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs/constellation-paths-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true });
    let server, window, snapshot = null, nextLoad = null;
    const failures = [], checks = [];
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        ipcMain.on('word-life-load', event => { event.returnValue = { ok: true, value: nextLoad }; });
        ipcMain.on('word-life-save', (event, value) => { snapshot = value; event.returnValue = { ok: true }; });
        window = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: {
            contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false,
            preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('console-message', (_e, level, message) => { if (level >= 3) failures.push(message); });
        const js = code => window.webContents.executeJavaScript(code, true);
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_learning.html?debug=1`;
        async function load(foundation, life) {
            await window.loadURL(url); await sleep(250);
            for (let i = 0; i < 100 && await js(`document.querySelector('#word-new-game').disabled`); i++) await sleep(100);
            await js(`document.querySelectorAll('form select')[1].value = '${foundation ? 'yes' : 'no'}';
                document.querySelectorAll('form select')[2].value = '${life ? 'yes' : 'no'}';
                document.querySelector('form').requestSubmit(); void 0`);
            assert.ok(snapshot?.state); await sleep(70);
        }
        async function send(text) {
            await js(`document.querySelector('.chat-form textarea').value = ${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit(); void 0`);
        }
        await load(false, false);
        await send('木の実がある');
        assert.equal(await js(`document.querySelector('.word-trace-preview').hidden`), false);
        assert.equal(await js(`getComputedStyle(document.querySelector('.word-trace-preview')).position`), 'static');
        assert.equal(await js(`document.querySelectorAll('.word-trace-preview .word-trace-flow li').length`), 5);
        assert.equal(await js(`document.querySelectorAll('.word-trace-preview .word-trace-sky circle').length`), 0);
        await js(`document.querySelector('.word-trace-open').click(); void 0`);
        assert.equal(await js(`document.querySelectorAll('#word-constellation .word-star').length`), 0);
        assert.equal(await js(`document.querySelectorAll('#word-constellation .word-trace-token').length`), 2);
        assert.equal(await js(`document.querySelector('#word-constellation .word-trace').textContent.includes('木の実がある')`), true);
        checks.push('unknown path keeps its original understanding without invented stars');
        await js(`document.querySelector('.word-stars-dialog').close(); void 0`);
        nextLoad = null; snapshot = null; await load(true, true);
        await send('木の実がある'); await send('今何してるの？');
        await js(`document.querySelectorAll('.word-trace-open')[1].click(); void 0`);
        const baseline = JSON.stringify(snapshot.state);
        assert.ok(await js(`document.querySelectorAll('#word-constellation .trace-used').length > 0`));
        assert.ok(await js(`document.querySelectorAll('#word-constellation .word-stars-tools select option').length === 3`));
        await js(`document.querySelector('[data-camera=mode]').click(); void 0`);
        assert.equal(await js(`document.querySelector('[data-camera=mode]').getAttribute('aria-pressed')`), 'true');
        const beforeTurn = await js(`document.querySelector('#word-constellation .word-star').style.left`);
        await js(`document.querySelector('[data-camera=mode]').nextElementSibling.click(); void 0`);
        assert.notEqual(await js(`document.querySelector('#word-constellation .word-star').style.left`), beforeTurn);
        await js(`const h = document.querySelector('.word-stars-tools select'); h.value = h.options[2].value; h.dispatchEvent(new Event('change')); void 0`);
        assert.ok(await js(`document.querySelector('#word-constellation .word-trace-flow li p').textContent === '木の実がある'`));
        await sleep(2850);
        assert.equal(await js(`document.querySelectorAll('#word-constellation .word-trace-flow .trace-lit').length`), 5);
        await js(`document.querySelector('#word-constellation .word-trace .word-stars-tools button').click(); void 0`);
        assert.equal(await js(`document.querySelector('#word-constellation').classList.contains('trace-playing')`), true);
        await js(`document.querySelector('#word-constellation .word-trace .word-stars-tools button').nextElementSibling.click(); void 0`);
        assert.equal(await js(`document.querySelector('#word-constellation').classList.contains('trace-playing')`), false);
        await js(`document.querySelector('#word-constellation .word-trace .word-stars-tools button').click();
            Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
            document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; void 0`);
        assert.equal(await js(`document.querySelector('#word-constellation').classList.contains('trace-playing')`), false);
        await js(`window.__oldMatchMedia = window.matchMedia; window.matchMedia = q => q === '(prefers-reduced-motion: reduce)' ? { matches: true } : window.__oldMatchMedia(q);
            document.querySelector('#word-constellation .word-trace .word-stars-tools button').click(); void 0`);
        await sleep(40);
        assert.equal(await js(`document.querySelectorAll('#word-constellation .word-trace-flow .trace-lit').length`), 5);
        await js(`window.matchMedia = window.__oldMatchMedia; delete window.__oldMatchMedia; void 0`);
        checks.push('historical selection, five-stage replay and depth camera');
        for (const locale of ['ja','en','zh-CN','ru','es-ES','pt-BR','de']) for (const width of [1280,390]) {
            window.setContentSize(width, 900);
            await js(`window.GameI18n.setLanguage('${locale}'); void 0`); await sleep(50);
            assert.ok(await js(`document.documentElement.scrollWidth <= innerWidth + 1`));
            assert.ok(await js(`document.querySelector('.word-stars-dialog').getBoundingClientRect().right <= innerWidth + 1`));
            assert.equal(await js(`document.querySelector('#word-constellation .word-trace-flow li p').textContent`), '木の実がある');
            const expected = require('../../locales/' + locale + '.json')['会話の道筋'];
            assert.equal(await js(`document.querySelector('#word-constellation .word-trace strong').textContent`), expected);
            assert.equal(await js(`document.querySelector('.word-trace-open').textContent`), expected);
            if (['ja','de'].includes(locale)) {
                await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(100);
                fs.writeFileSync(path.join(evidence, `${locale}-${width}.png`), (await window.webContents.capturePage()).toPNG());
            }
        }
        assert.equal(JSON.stringify(snapshot.state), baseline);
        await js(`document.querySelector('.word-stars-dialog').close(); window.GameI18n.setLanguage('ja'); void 0`);
        window.setContentSize(390, 900);
        await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(120);
        assert.equal(await js(`document.querySelector('.word-stars-dialog').open`), false);
        assert.equal(await js(`getComputedStyle(document.querySelector('.word-trace-preview')).position`), 'static');
        assert.ok(await js(`document.querySelector('.word-trace-sky text').getBoundingClientRect().height >= 10`));
        assert.ok(await js(`document.querySelector('.panel-body').getBoundingClientRect().height >= 160`));
        await js(`document.querySelector('.word-trace-preview').scrollIntoView({ block: 'center' }); void 0`);
        await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(100);
        fs.writeFileSync(path.join(evidence, 'inline-390.png'), (await window.webContents.capturePage()).toPNG());
        await js(`document.querySelector('.chat-form textarea').scrollIntoView({ block: 'center' }); void 0`);
        assert.ok(await js(`document.querySelector('.chat-form textarea').getBoundingClientRect().bottom <= innerHeight + 1`));
        // A loaded save must not acquire fake historical paths.
        nextLoad = structuredClone(snapshot); await load(true, true);
        assert.equal(await js(`document.querySelector('.word-trace-preview').hidden`), true);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.equal(await js(`document.querySelector('.word-stars-tools select').options.length`), 1);
        await js(`document.querySelector('.word-stars-dialog').close(); void 0`);
        // Eviction disables old conversation links; it does not retain hidden snapshots.
        for (let i = 0; i < 26; i++) await send('木の実がある');
        assert.equal(await js(`document.querySelectorAll('.word-trace-open:disabled').length`), 2);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.equal(await js(`document.querySelector('.word-stars-tools select').options.length`), 25);
        assert.deepEqual(failures, []);
        checks.push('seven locales at two widths, literal input, read-only inspection, reload and bounded history');
        fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify({ ok: true, profile, checks, failures }, null, 2));
        console.log(JSON.stringify({ ok: true, evidence, checks }));
    }).catch(error => {
        fs.writeFileSync(path.join(evidence, 'failure.txt'), String(error.stack) + '\n' + JSON.stringify(failures));
        console.error(error); console.error(evidence); process.exitCode = 1;
    }).finally(() => { window?.destroy(); if (server) { server.closeAllConnections(); server.close(); } app.exit(process.exitCode || 0); });
}
