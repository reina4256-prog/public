'use strict';
// Real loopback VOICEVOX and WebAudio; temporary profile/cache, no player save.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code || 0; });
} else {
    const assert = require('node:assert/strict'), { app, BrowserWindow, ipcMain } = require('electron');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-voice-cache-live-'));
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs', 'voice-cache-live-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true }); app.setPath('userData', directory); app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    app.on('window-all-closed', () => {}); // Keep this test alive between the two isolated windows.
    let window, server; const allowed = new Map(), errors = [], disk = [];
    const store = require('./voice_cache_store').createStore(path.join(directory, 'voice-cache-v1'));
    const isWindow = event => event.senderFrame?.url === allowed.get(event.sender);
    ipcMain.handle('word-voice-cache-get', async (event, key) => {
        const started=Date.now(),value=isWindow(event)?await store.get(key):{ok:false};
        disk.push({key,ok:value.ok,bytes:value.data?.byteLength,ms:Date.now()-started,url:event.senderFrame?.url});return value;
    });
    ipcMain.handle('word-voice-cache-put', (event, key, data) => isWindow(event) ? store.put(key, data) : { ok: false });
    ipcMain.on('word-life-load', event => { event.returnValue = { ok: true, value: null }; });
    ipcMain.on('word-life-save', event => { event.returnValue = { ok: true }; });
    async function open() {
        server = require('./serve').createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_learning.html?debug=1`;
        window = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false,
            backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') } });
        allowed.set(window.webContents, url);
        window.webContents.on('console-message', (_event, level, text) => { if (level >= 3) errors.push(text); });
        window.webContents.on('preload-error', (_event, _path, error) => errors.push('preload: '+error.message));
        await window.loadURL(url); return url;
    }
    const js = code => window.webContents.executeJavaScript(code, true);
    const setup = offline => `(() => {
        const originalFetch = window.fetch.bind(window), nativeStart = AudioBufferSourceNode.prototype.start;
        window.cacheCalls = []; window.cachePlays = []; window.cacheStatuses = []; window.cacheSpeak = false;
        window.fetch = (url, options) => {
            if (typeof url === 'string' && url.startsWith('http://127.0.0.1:50021/')) {
                cacheCalls.push(url); ${offline ? "return Promise.reject(new Error('Offline fixture'));" : ''}
            }
            return originalFetch(url, options);
        };
        AudioBufferSourceNode.prototype.start = function(...args) { cachePlays.push(performance.now()); return nativeStart.apply(this,args); };
        window.cacheLines = [{text:'こんにちは。',role:'master',master:'explore'},{text:'小さくうなずいた。',role:'narration'}];
        window.cacheVoice = ExperimentalWordVoice.create(window, {locale:()=> 'ja',species:()=> 'robot',volume:()=> .1,
            canPrepare:()=> true,canSpeak:()=> cacheSpeak,canPreview:()=>true,listening(){},status:key=>cacheStatuses.push(key)});
        cacheVoice.registerFixedLines(cacheLines); cacheVoice.setEnabled(true);
    })()`;
    app.whenReady().then(async () => {
        const firstOrigin = await open();
        const metadata = () => js(`({url:location.href,cache:typeof wordVoiceCache,crypto:!!crypto.subtle,secure:isSecureContext})`);
        const firstMetadata = await metadata(); await js(setup(false));
        assert.equal(await js('cacheVoice.prepareScene(cacheLines)'), true);
        const prepared = await js('({calls:cacheCalls.length,plays:cachePlays.length})'); assert.equal(prepared.plays, 0); assert.ok(prepared.calls >= 4);
        const warm = await js(`(async()=>{cacheSpeak=true;const calls=cacheCalls.length,start=performance.now();await cacheVoice.speakScene(cacheLines);
            const result={calls:cacheCalls.length-calls,plays:cachePlays.length,firstStartMs:cachePlays[0]-start,status:cacheStatuses.at(-1)};
            cacheVoice.setEnabled(false);return result;})()`);
        assert.equal(warm.calls, 0); assert.equal(warm.plays, 2); assert.equal(warm.status, 'ready');
        fs.writeFileSync(path.join(evidence,'first-window.json'),JSON.stringify({firstOrigin,prepared,warm},null,2));
        for (let i=0;i<100;i++) {
            if (fs.existsSync(path.join(directory,'voice-cache-v1')) && fs.readdirSync(path.join(directory,'voice-cache-v1')).filter(name=>name.endsWith('.wav')).length === 2) break;
            await new Promise(resolve=>setTimeout(resolve,50));
        }
        assert.equal(fs.readdirSync(path.join(directory,'voice-cache-v1')).filter(name=>name.endsWith('.wav')).length,2);
        allowed.delete(window.webContents); window.destroy(); server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));
        const secondOrigin = await open(); assert.notEqual(firstOrigin,secondOrigin);
        const secondMetadata = await metadata();
        fs.writeFileSync(path.join(evidence,'contexts.json'),JSON.stringify({firstMetadata,secondMetadata,errors},null,2));
        await js(setup(true));
        const restarted = await js(`(async()=>{cacheSpeak=true;const start=performance.now();await cacheVoice.speakScene(cacheLines);
            const result={calls:cacheCalls.length,plays:cachePlays.length,firstStartMs:cachePlays[0]-start,status:cacheStatuses.at(-1)};
            cacheVoice.setEnabled(false);return result;})()`);
        fs.writeFileSync(path.join(evidence,'restarted-window.json'),JSON.stringify({restarted,disk,errors},null,2));
        assert.equal(restarted.calls,0);assert.equal(restarted.plays,2);assert.equal(restarted.status,'ready');assert.deepEqual(errors,[]);
        const result={ok:true,directory,firstOrigin,secondOrigin,prepared,warm,restarted,errors};
        fs.writeFileSync(path.join(evidence,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({evidence,...result}));
    }).catch(error=>{fs.writeFileSync(path.join(evidence,'failure.txt'),String(error.stack)+'\n'+JSON.stringify(errors));console.error(error);console.error(evidence);process.exitCode=1;})
      .finally(()=>{window?.destroy();if(server){server.closeAllConnections();server.close();}app.exit(process.exitCode||0);});
}
