'use strict';
// Both the visible preview and smoke run use disposable profiles, never player storage.
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
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-diary-preview-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    const smoke = process.argv.includes('--smoke');
    let server;
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const window = new BrowserWindow({ width: 1000, height: 900, show: !smoke, autoHideMenuBar: true,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        window.setMenu(null); window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        const errors = [];
        window.webContents.on('console-message', (_event, level, message) => { if (level >= 3) errors.push(message); });
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_diary.html`;
        await window.loadURL(url);
        if (!smoke) { console.log(`Independent diary sample: ${url}`); return; }
        const js = async code => {
            try { return await window.webContents.executeJavaScript(code, true); }
            catch (error) { throw new Error(`${error.message}\nRenderer code: ${code}\nConsole: ${JSON.stringify(errors)}`); }
        };
        const settle = () => js('document.fonts.ready.then(() => new Promise(resolve => setTimeout(resolve, 180)))');
        await settle();
        await js(`localStorage.setItem('preview-sentinel','keep'); sessionStorage.setItem('preview-sentinel','keep'); void 0`);
        const results = [];
        const originals = new Map();
        const source = fs.readFileSync(path.resolve(__dirname, '../../experimental_word_diary.js'), 'utf8');
        const fixtures = require('node:vm').runInNewContext(source.slice(source.indexOf('    const S ='), source.indexOf('    const root =')) + '\n({S, fixtures})');
        for (const width of [1000, 390]) {
            window.setContentSize(width, 900); await settle();
            for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
                await js(`GameI18n.setLanguage(${JSON.stringify(locale)}); void 0`); await settle();
                for (const sample of ['berry', 'net', 'naming', 'heard', 'partial', 'long']) {
                    await js(`(() => { const select = document.querySelector('#diary-sample'); select.value = ${JSON.stringify(sample)}; select.dispatchEvent(new Event('change')); })()`);
                    const data = await js(`(() => {
                        const pages = [...document.querySelectorAll('.diary-page')];
                        const text = pages.map(page => page.querySelector('.diary-text').textContent).join('');
                        const overflow = pages.some(page => { const hidden = page.hidden; page.hidden = false;
                            const body = page.querySelector('.diary-text'); const bad = body.scrollWidth > body.clientWidth + 1 || body.scrollHeight > body.clientHeight + 1;
                            page.hidden = hidden; return bad; });
                        const canvas = pages[0].querySelector('canvas');
                        const blank = !canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.some((v,i) => i % 4 === 3 && v);
                        return { text, overflow, blank, count:pages.length, canvases:document.querySelectorAll('canvas').length,
                            mode:getComputedStyle(pages[0].querySelector('.diary-text')).writingMode,
                            font:getComputedStyle(pages[0].querySelector('.diary-text')).fontSize,
                            horizontal:document.documentElement.scrollWidth > innerWidth,
                            drawing:canvas.toDataURL(), title:document.title };
                    })()`);
                    assert.equal(data.overflow, false, `${width}/${locale}/${sample} text overflow`);
                    assert.equal(data.horizontal, false, `${width}/${locale}/${sample} viewport overflow`);
                    assert.equal(data.mode, ['ja', 'zh-CN'].includes(locale) ? 'vertical-rl' : 'horizontal-tb');
                    assert.equal(data.font, '18px'); assert.equal(data.canvases, 1);
                    const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../locales', locale + '.json'), 'utf8'));
                    const expected = fixtures.fixtures.find(item => item.id === sample).text.map(key => catalog[fixtures.S[key]]).join('\n\n');
                    assert.equal(data.text, expected, 'every authored translated character remains, in order');
                    assert.equal(data.blank, ['heard', 'partial'].includes(sample));
                    if (sample === 'long') assert.ok(data.count > 1);
                    const key = locale + '/' + sample;
                    if (originals.has(key)) assert.deepEqual([data.text, data.drawing], originals.get(key), 'reflow preserves every character and drawing');
                    else originals.set(key, [data.text, data.drawing]);
                    if (!['ja', 'zh-CN'].includes(locale)) assert.equal(/[\u3040-\u30ff]/.test(data.text + data.title), false);
                    // Real hit-tested mouse input forward, DOM input backward through every continuation.
                    for (let i = 1; i < data.count; i++) {
                        await js(`document.querySelector('#diary-next').scrollIntoView({block:'center'}); void 0`);
                        const visiblePoint = await js(`(() => { const r=document.querySelector('#diary-next').getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}; })()`);
                        window.webContents.sendInputEvent({ type:'mouseDown', ...visiblePoint, button:'left', clickCount:1 });
                        window.webContents.sendInputEvent({ type:'mouseUp', ...visiblePoint, button:'left', clickCount:1 });
                        await js('new Promise(resolve => setTimeout(resolve, 30))');
                        assert.equal(await js(`[...document.querySelectorAll('.diary-page')].findIndex(p=>!p.hidden)`), i);
                    }
                    for (let i = data.count - 2; i >= 0; i--) {
                        await js(`document.querySelector('#diary-previous').click(); void 0`);
                        assert.equal(await js(`[...document.querySelectorAll('.diary-page')].findIndex(p=>!p.hidden)`), i);
                    }
                    results.push({ width, locale, sample, pages:data.count });
                    if ((width === 1000 && locale === 'ja' && ['berry','net','long'].includes(sample)) || (width === 390 && ['zh-CN','de'].includes(locale) && sample === 'long')) {
                        await js('scrollTo(0,0); void 0');
                        await settle();
                        await window.webContents.capturePage(); await settle();
                        fs.writeFileSync(path.join(directory, `${width}-${locale}-${sample}.png`), (await window.webContents.capturePage()).toPNG());
                        if (sample === 'long') {
                            await js(`document.querySelector('#diary-next').click(); document.querySelector('.book').scrollIntoView({block:'start'}); void 0`);
                            await settle();
                            fs.writeFileSync(path.join(directory, `${width}-${locale}-${sample}-continued.png`), (await window.webContents.capturePage()).toPNG());
                        }
                    }
                }
            }
        }
        assert.deepEqual(await js(`({local:{...localStorage},session:{...sessionStorage},world:typeof ExperimentalWordWorld,legacy:typeof aiPet,bridge:typeof wordLifeStorage})`),
            { local:{'preview-sentinel':'keep'}, session:{'preview-sentinel':'keep'}, world:'undefined',legacy:'undefined',bridge:'undefined' });
        await window.reload(); await settle();
        assert.equal(await js('GameI18n.language'), 'ja', 'sample language is not saved');
        assert.equal(await js(`document.querySelector('#diary-sample').value`), 'berry');
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(directory, 'results.json'), JSON.stringify(results, null, 2));
        console.log(JSON.stringify({ ok:true, cases:results.length, profile:directory })); app.quit();
    }).catch(error => { console.error(error); app.exit(1); });
    app.on('window-all-closed', () => app.quit());
    app.on('before-quit', () => { if (server) { server.closeAllConnections(); server.close(); } });
}
