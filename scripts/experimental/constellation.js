'use strict';
// This launcher always creates a disposable profile. It never opens a player save.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename, ...process.argv.slice(2)], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code || 0; });
} else {
    const { app, BrowserWindow } = require('electron');
    const assert = require('node:assert/strict');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-constellation-preview-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    const smoke = process.argv.includes('--smoke'); let server;
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const window = new BrowserWindow({ width: 1200, height: 960, show: !smoke, autoHideMenuBar: true,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        window.setMenu(null); window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        const errors = [];
        window.webContents.on('console-message', (_event, level, message) => { if (level >= 3) errors.push(message); });
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_constellation.html`;
        window.webContents.on('will-navigate', (event, destination) => { if (destination !== url) event.preventDefault(); });
        await window.loadURL(url);
        if (!smoke) { console.log(`Independent constellation sample: ${url}`); return; }
        const js = code => window.webContents.executeJavaScript(code, true);
        const settle = () => js('new Promise(resolve => setTimeout(resolve, 100))');
        const invariant = () => js(`({local:{...localStorage}, session:{...sessionStorage}, world:typeof ExperimentalWordWorld,
            diary:typeof ExperimentalWordDiaryCandidates, legacy:typeof aiPet, bridge:typeof wordLifeStorage})`);
        await js(`localStorage.setItem('preview-sentinel','keep'); sessionStorage.setItem('preview-sentinel','keep'); void 0`);
        const original = await invariant(); let cases = 0;
        for (const width of [1200, 390]) {
            window.setContentSize(width, 960); await settle();
            for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
                await js(`GameI18n.setLanguage(${JSON.stringify(locale)}); void 0`);
                for (const scene of ['naming', 'tasting', 'unknown']) {
                    await js(`(() => { const s=document.querySelector('#constellation-scene'); s.value=${JSON.stringify(scene)}; s.dispatchEvent(new Event('change')); })()`);
                    const inspect = await js(`({stars:[...document.querySelectorAll('[data-node]')].map(n=>n.dataset.node),
                        edges:[...document.querySelectorAll('[data-edge]')].map(n=>n.dataset.edge),
                        active:[...document.querySelectorAll('.star.active')].map(n=>n.dataset.node),
                        records:[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record),
                        overflow:document.documentElement.scrollWidth>innerWidth,
                        text:document.body.textContent})`);
                    assert.equal(inspect.overflow, false, `${width}/${locale}/${scene}`);
                    assert.deepEqual(inspect.records, scene === 'naming' ? ['taught'] : scene === 'tasting' ? ['taught','ate'] : ['taught','ate','asked']);
                    assert.equal(inspect.active.includes('sour'), false);
                    assert.equal(inspect.stars.includes('sweet'), scene !== 'naming');
                    if (!['ja','zh-CN'].includes(locale)) assert.equal(/[\u3040-\u30ff]/u.test(inspect.text), false);
                    // Actual hit-tested mouse input on a star, not just a DOM click.
                    const point = await js(`(() => { const n=document.querySelector('[data-node="berry"]'); n.scrollIntoView({block:'center'}); const r=n.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}; })()`);
                    await settle();
                    for (const type of ['mouseMove','mouseDown','mouseUp']) window.webContents.sendInputEvent({ type, ...point, button:'left', clickCount:1 });
                    await settle();
                    assert.equal(await js(`document.querySelector('[data-node="berry"]').getAttribute('aria-pressed')`), 'true');
                    await js(`document.querySelector('[data-record="taught"] button').click(); void 0`);
                    const teaching = await js(`document.querySelector('[data-record="taught"]').textContent`);
                    for (let i = 0; i < 3; i++) await js(`document.querySelector('#constellation-replay').click(); void 0`);
                    assert.equal(await js(`document.querySelector('[data-record="taught"]').textContent`), teaching, 'rereading never changes past understanding');
                    if (scene !== 'naming') {
                        // Keyboard activation of line opens exactly its source experience.
                        await js(`(() => { const e=document.querySelector('[data-edge="taste"]'); e.focus(); e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); })()`);
                        assert.deepEqual(await js(`[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record)`), ['ate']);
                        await js(`document.querySelector('[data-record="ate"] button').click(); void 0`);
                        assert.ok(await js(`document.querySelector('[data-record="ate"] blockquote').textContent.length`));
                    }
                    if (scene === 'unknown') {
                        await js(`document.querySelector('[data-edge="unresolved"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); document.querySelector('[data-record="asked"] button').click(); void 0`);
                        assert.deepEqual(await js(`[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record)`), ['asked']);
                        assert.equal(await js(`document.querySelector('[data-node="sour"]').classList.contains('active')`), false);
                    }
                    assert.deepEqual(await invariant(), original);
                    if ((width === 1200 && locale === 'ja') || (width === 390 && ['de','zh-CN'].includes(locale) && scene === 'unknown')) {
                        await js('scrollTo(0,0); void 0'); await settle();
                        // Hidden Electron windows may return the previous compositor frame first.
                        await window.webContents.capturePage(); await settle();
                        fs.writeFileSync(path.join(directory, `${width}-${locale}-${scene}.png`), (await window.webContents.capturePage()).toPNG());
                        if (scene === 'unknown') {
                            await js(`document.querySelector('.detail').scrollIntoView({block:'start'}); void 0`); await settle();
                            await window.webContents.capturePage(); await settle();
                            fs.writeFileSync(path.join(directory, `${width}-${locale}-${scene}-record.png`), (await window.webContents.capturePage()).toPNG());
                        }
                    }
                    cases++;
                }
            }
        }
        await window.reload(); await settle();
        assert.equal(await js('GameI18n.language'), 'ja');
        assert.equal(await js(`document.querySelector('#constellation-scene').value`), 'tasting');
        assert.deepEqual(await invariant(), original);
        await window.loadURL('about:blank'); await window.loadURL(url); await settle();
        assert.equal(await js(`document.querySelector('#constellation-scene').value`), 'tasting');
        assert.deepEqual(await invariant(), original); assert.deepEqual(errors, []);
        console.log(JSON.stringify({ ok:true, cases, profile:directory })); app.quit();
    }).catch(error => { console.error(error); app.exit(1); });
    app.on('window-all-closed', () => app.quit());
    app.on('before-quit', () => { if (server) { server.closeAllConnections(); server.close(); } });
}
