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
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_constellation.html` + (process.argv.includes('--expanded') ? '?scene=expanded' : '');
        window.webContents.on('will-navigate', (event, destination) => { if (destination !== url) event.preventDefault(); });
        await window.loadURL(url);
        if (!smoke) { console.log(`Independent constellation sample: ${url}`); return; }
        window.webContents.debugger.attach('1.3');
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
                for (const scene of ['naming', 'tasting', 'unknown', 'expanded']) {
                    await js(`(() => { const s=document.querySelector('#constellation-scene'); s.value=${JSON.stringify(scene)}; s.dispatchEvent(new Event('change')); })()`);
                    const inspect = await js(`({stars:[...document.querySelectorAll('[data-node]')].map(n=>n.dataset.node),
                        edges:[...document.querySelectorAll('[data-edge]')].map(n=>n.dataset.edge),
                        active:[...document.querySelectorAll('.star.active')].map(n=>n.dataset.node),
                        records:[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record),
                        overflow:document.documentElement.scrollWidth>innerWidth,
                        text:document.body.textContent})`);
                    assert.equal(inspect.overflow, false, `${width}/${locale}/${scene}`);
                    assert.deepEqual(inspect.records, scene === 'naming' ? ['taught'] : scene === 'tasting' ? ['taught','ate'] : scene === 'unknown' ? ['taught','ate','asked'] : ['taught','ate','ateSour','sawTree','rested','sawNet']);
                    assert.equal(inspect.active.includes('sour'), scene === 'expanded');
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
                    if (scene === 'expanded') {
                        await js(`document.querySelector('[data-node="berry"]').click(); void 0`);
                        const graph = await js(`({stars:[...document.querySelectorAll('[data-node]')].map(n=>n.dataset.node),
                            neighbors:[...document.querySelectorAll('.star.neighbor')].map(n=>n.dataset.node),
                            dim:[...document.querySelectorAll('.star.dim')].map(n=>n.dataset.node),
                            records:[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record),
                            connected:[...document.querySelectorAll('.edge.neighbor')].map(n=>n.dataset.edge)})`);
                        assert.equal(graph.stars.length, 12);
                        assert.deepEqual(graph.neighbors, ['red','tree','sweet','berry','sour','eat']);
                        assert.equal(graph.connected.length, 5);
                        assert.ok(graph.dim.includes('net') && graph.dim.includes('rest'));
                        assert.deepEqual(graph.records, ['taught','ate','ateSour','sawTree']);
                        const fit = await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`);
                        const textSize = await js(`getComputedStyle(document.querySelector('[data-node="berry"]')).fontSize`);
                        await js(`document.querySelector('#constellation-zoom-in').click(); document.querySelector('#constellation-moveRight').click(); void 0`);
                        const moved = await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`);
                        assert.ok(moved.zoom > fit.zoom && moved.x < fit.x);
                        assert.equal(await js(`getComputedStyle(document.querySelector('[data-node="berry"]')).fontSize`), textSize);
                        assert.equal(await js(`document.querySelectorAll('[data-node]').length`), 12, 'no stars removed by focus or zoom');
                        // Real blank-area drag with pointer capture and real wheel input.
                        await js(`document.querySelector('.sky').scrollIntoView({block:'start'}); void 0`); await settle();
                        await window.webContents.capturePage(); await settle();
                        const dragPoint = await js(`(() => { const r=document.querySelector('.sky').getBoundingClientRect(); return {x:Math.round(r.x+24),y:Math.round(r.bottom-24)}; })()`);
                        const hit = await js(`document.elementFromPoint(${dragPoint.x},${dragPoint.y})?.className?.baseVal || document.elementFromPoint(${dragPoint.x},${dragPoint.y})?.className`);
                        window.webContents.sendInputEvent({type:'mouseMove',...dragPoint}); await settle();
                        window.webContents.sendInputEvent({type:'mouseDown',...dragPoint,button:'left',clickCount:1}); await settle();
                        window.webContents.sendInputEvent({type:'mouseMove',x:dragPoint.x+35,y:dragPoint.y+20});
                        await settle();
                        window.webContents.sendInputEvent({type:'mouseUp',x:dragPoint.x+35,y:dragPoint.y+20,button:'left',clickCount:1});
                        await settle();
                        const dragged = await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`);
                        assert.ok(dragged.x > moved.x && dragged.y > moved.y, `real drag moves the view: ${JSON.stringify({moved,dragged,dragPoint,hit,width,locale})}`);
                        window.webContents.sendInputEvent({type:'mouseMove',...dragPoint}); await settle();
                        // Electron does not deliver wheel events to this hidden window;
                        // Chromium's trusted input path exercises the same wheel handler.
                        await window.webContents.debugger.sendCommand('Input.dispatchMouseEvent', {type:'mouseWheel',...dragPoint,deltaY:-80,deltaX:0});
                        await js('new Promise(resolve => setTimeout(resolve, 300))');
                        const wheeled = await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`);
                        assert.notEqual(wheeled.zoom, dragged.zoom, 'trusted wheel changes zoom');
                        await js(`(() => { const s=document.querySelector('.sky'); s.focus(); s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})); })()`);
                        const keyed = await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`);
                        assert.ok(keyed.y < wheeled.y, 'keyboard movement');
                        await js(`document.querySelector('[data-edge="sourTaste"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); document.querySelector('[data-record="ateSour"] button').click(); void 0`);
                        assert.deepEqual(await js(`[...document.querySelectorAll('[data-record]')].map(n=>n.dataset.record)`), ['ateSour'], 'sour experience separate from sweet experience');
                        assert.equal(await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view).zoom`), wheeled.zoom, 'record navigation preserves camera');
                        await js(`document.querySelector('#constellation-overview').click(); void 0`);
                        assert.deepEqual(await js(`JSON.parse(document.querySelector('.constellation-map').dataset.view)`), {x:0,y:0,zoom:1});
                        assert.equal(await js(`document.querySelectorAll('.dim').length`), 0);
                        const bounds = await js(`(() => { const r=document.querySelector('.sky').getBoundingClientRect(); const stars=[...document.querySelectorAll('.star')].map(n=>n.getBoundingClientRect()); return {outside:stars.some(s=>s.left<r.left||s.right>r.right||s.top<r.top||s.bottom>r.bottom),overlap:stars.some((a,i)=>stars.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top))}; })()`);
                        assert.deepEqual(bounds,{outside:false,overlap:false}, 'all twelve labels fit without overlap');
                        if (locale === 'ja') {
                            await js(`document.querySelector('.sky').scrollIntoView({block:'start'}); void 0`); await settle();
                            await window.webContents.capturePage(); await settle();
                            fs.writeFileSync(path.join(directory, `${width}-${locale}-expanded-overview.png`), (await window.webContents.capturePage()).toPNG());
                        }
                        await js(`document.querySelector('[data-node="berry"]').click(); void 0`);
                    }
                    assert.deepEqual(await invariant(), original);
                    if ((width === 1200 && locale === 'ja') || (width === 390 && ['de','zh-CN'].includes(locale) && ['unknown','expanded'].includes(scene))) {
                        await js(scene === 'expanded' ? `document.querySelector('.sky').scrollIntoView({block:'start'}); void 0` : 'scrollTo(0,0); void 0'); await settle();
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
        await window.loadURL(url + '?scene=expanded'); await settle();
        assert.equal(await js(`document.querySelector('#constellation-scene').value`), 'expanded');
        assert.equal(await js(`document.querySelectorAll('[data-node]').length`), 12);
        assert.deepEqual(await invariant(), original);
        console.log(JSON.stringify({ ok:true, cases, profile:directory })); app.quit();
    }).catch(error => { console.error(error); app.exit(1); });
    app.on('window-all-closed', () => app.quit());
    app.on('before-quit', () => { if (server) { server.closeAllConnections(); server.close(); } });
}
