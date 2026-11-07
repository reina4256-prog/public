'use strict';
// Dedicated fresh profile for both the preview and its real-browser checks.
const fs = require('node:fs'), path = require('node:path');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename, ...process.argv.slice(2)],
        { env, stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code === null ? 1 : code; });
} else {
    const { app, BrowserWindow } = require('electron'), assert = require('node:assert/strict');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-dungeon-preview-'));
    app.setPath('userData', directory); app.disableHardwareAcceleration();
    const smoke = process.argv.includes('--smoke'); let server;
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const win = new BrowserWindow({ width: 1180, height: 1000, show: !smoke, autoHideMenuBar: true,
            webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        win.setMenu(null); win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        const errors = [];
        win.webContents.on('console-message', event => { if (event.level === 'error' || event.level >= 3) errors.push(event.message); });
        const url = 'http://127.0.0.1:' + server.address().port + '/experimental_word_dungeon.html';
        await win.loadURL(url);
        if (!smoke) { console.log('Independent dungeon preview: ' + url); return; }
        const js = code => win.webContents.executeJavaScript(code, true);
        const settle = () => js('document.fonts.ready.then(()=>new Promise(resolve=>setTimeout(resolve,100)))');
        const text = key => js('GameI18n.translate(' + JSON.stringify(key) + ')');
        await js("localStorage.setItem('dungeon-sentinel','keep');sessionStorage.setItem('dungeon-sentinel','keep');void 0");
        let checked = 0;
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
            await js('GameI18n.setLanguage(' + JSON.stringify(locale) + ');void 0'); await settle();
            assert.equal(await js('document.title'), require('../../locales/' + locale + '.json')['ダンジョン・独立試作']);
            await js("document.getElementById('scenario').value='danger';document.getElementById('scenario').dispatchEvent(new Event('change'));document.getElementById('command').value='right';document.getElementById('command').dispatchEvent(new Event('change'));document.getElementById('send').click();void 0");
            assert.equal(await js("document.getElementById('feedback').classList.contains('diverged')"), true);
            assert.ok((await js("document.getElementById('feedback').textContent")).includes(await text('指示と異なる選択')));
            assert.ok((await js("document.getElementById('history').textContent")).includes(await text('そちらは危ないから、別の方向へ離れるね。')));
            await js("document.getElementById('scenario').value='explore';document.getElementById('scenario').dispatchEvent(new Event('change'));document.getElementById('known-move').click();void 0");
            const position = await js("document.querySelector('.room-head').textContent");
            await js("document.getElementById('send').click();void 0");
            assert.equal(await js("document.querySelector('.room-head').textContent"), position);
            assert.ok((await js("document.getElementById('feedback').textContent")).includes(await text('その指示はまだ分からない。')));
            await js("document.getElementById('known-move').click();void 0");
            assert.ok((await js("document.getElementById('history').textContent")).includes(await text('その指示はまだ分からない。')));
            await js("document.getElementById('step').click();void 0");
            assert.notEqual(await js("document.querySelector('.room-head').textContent"), position);
            for (let i = 0; i < 30 && !(await js("document.getElementById('step').disabled")); i++)
                await js("document.getElementById('step').click();void 0");
            assert.equal(await js("document.getElementById('step').disabled"), true);
            assert.ok((await js("document.getElementById('feedback').textContent")).includes(await text('出口に着いたよ。')));
            for (const width of [1180, 390]) {
                win.setContentSize(width, 1000); await settle();
                assert.equal(await js('document.documentElement.scrollWidth <= innerWidth'), true, locale + ':' + width);
            }
            checked++;
        }
        await js("GameI18n.setLanguage('ja');document.getElementById('reset').click();document.getElementById('play').click();void 0");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await js("document.getElementById('play').click();void 0");
        const paused = await js("document.querySelector('.room-head').textContent");
        await new Promise(resolve => setTimeout(resolve, 1000));
        assert.equal(await js("document.querySelector('.room-head').textContent"), paused);
        await js("document.getElementById('scenario').value='danger';document.getElementById('scenario').dispatchEvent(new Event('change'));document.getElementById('command').value='right';document.getElementById('command').dispatchEvent(new Event('change'));document.getElementById('send').click();void 0");
        const artifactArg = process.argv.find(arg => arg.startsWith('--artifacts='));
        const artifacts = artifactArg ? path.resolve(artifactArg.slice('--artifacts='.length)) : directory;
        fs.mkdirSync(artifacts, { recursive: true });
        for (const [name, width] of [['desktop', 1180], ['mobile', 390]]) {
            win.setContentSize(width, 1000); await settle();
            fs.writeFileSync(path.join(artifacts, 'dungeon-' + name + '.png'), (await win.capturePage()).toPNG());
        }
        const storage = await js("({local:{...localStorage},session:{...sessionStorage},bridge:typeof wordLifeStorage,actor:typeof aiPet})");
        assert.deepEqual(storage, { local: { 'dungeon-sentinel': 'keep' }, session: { 'dungeon-sentinel': 'keep' }, bridge: 'undefined', actor: 'undefined' });
        await new Promise(resolve => { win.webContents.once('did-finish-load', resolve); win.reload(); }); await settle();
        assert.equal(await js("document.getElementById('history').children.length"), 0);
        assert.deepEqual(await js('({...localStorage})'), { 'dungeon-sentinel': 'keep' });
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ dungeonPreview: { locales: checked, viewports: 14, divergentChoiceVisible: true,
            unknownInstructionSeparate: true, exitReached: true, pauseStable: true, storageUnchanged: true, reloadFresh: true, directory, artifacts } }));
        server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); server = null;
        app.removeAllListeners('window-all-closed'); win.destroy(); app.exit(0);
    }).catch(error => { console.error(error); app.exit(1); });
    app.on('window-all-closed', () => app.quit());
    app.on('before-quit', () => { if (server) { server.closeAllConnections(); server.close(); } });
}
