const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const output = path.resolve(__dirname, '../.localization-audit/release');
fs.mkdirSync(output, { recursive: true });

(async () => {
    const servers = ['demo', 'full-offline', 'full'].map((name, i) => spawn(process.execPath,
        [path.resolve(__dirname, '../browser_server.js'), `--release-profile=${name}`, '--port', String(4190 + i)],
        { windowsHide: true, stdio: 'ignore' }));
    const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9418',
            '--user-data-dir=' + path.join(output, 'edge-profile'), 'about:blank'],
        { windowsHide: true, stdio: 'ignore' });
    let socket;
    try {
        let tabs;
        for (let i = 0; i < 100; i++) {
            try { tabs = await (await fetch('http://127.0.0.1:9418/json')).json(); if (tabs.length) break; } catch {}
            await wait(100);
        }
        assert(tabs?.length, 'Headless browser did not start');
        socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
        await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
        const pending = new Map(), requests = [], exceptions = [];
        let sequence = 0;
        socket.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            if (data.method === 'Network.requestWillBeSent') requests.push(data.params.request.url);
            if (data.method === 'Runtime.exceptionThrown') exceptions.push(data.params.exceptionDetails);
            const request = pending.get(data.id);
            if (request) { pending.delete(data.id); data.error ? request.reject(Error(JSON.stringify(data.error))) : request.resolve(data.result); }
        });
        const call = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++sequence;
            const timeout = setTimeout(() => reject(Error('CDP timeout: ' + method)), 30000);
            pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
            socket.send(JSON.stringify({ id, method, params }));
        });
        const evaluate = async expression => {
            const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
            if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
            return result.result.value;
        };
        await call('Network.enable');
        await call('Runtime.enable');
        await call('Network.setBlockedURLs', { urls: ['*googleapis.com*', '*firebase*', '*gstatic.com*'] });
        await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
        let transfer;
        for (const [i, name] of ['demo', 'full-offline', 'full'].entries()) {
            const origin = `http://127.0.0.1:${4190 + i}`;
            await call('Storage.clearDataForOrigin', { origin, storageTypes: 'all' });
            requests.length = 0; exceptions.length = 0;
            await call('Page.navigate', { url: origin });
            await wait(4000);
            const profile = await evaluate('window.GameRelease');
            assert.strictEqual(profile.edition, name === 'demo' ? 'demo' : 'full');
            assert.strictEqual(profile.online, name === 'full');
            if (name === 'full') {
                assert(requests.some(url => url.includes('firebase-app.js')), 'Online full edition must load its Firebase graph');
                continue;
            }
            assert(!requests.some(url => /firebase|gstatic|cloud_manager/.test(url)), `${name} requested online code`);
            assert.strictEqual(await evaluate('typeof window.getFirebaseAppForP2P'), 'undefined');
            assert.strictEqual(await evaluate('window.isOnlineAccountLoggedIn()'), false);
            await evaluate(`startGameSequence(); switchMode('title');`);
            for (const id of ['btnLogin', 'btn-menu-friend', 'loginOverlay', 'playerNameOverlay']) {
                assert.strictEqual(await evaluate(`getComputedStyle(document.getElementById(${JSON.stringify(id)})).display`), 'none');
            }
            // A restored account marker cannot re-enable authentication or block new game.
            await evaluate(`localStorage.setItem('my_player_id', 'stale'); localStorage.setItem('online_tutorial_login_verified_v1', 'true');`);
            assert.strictEqual(await evaluate(`window.unlockTutorialEntry('systems.online', { silent: true })`), false);
            await evaluate('window.showNewGameLoginChoice()');
            await wait(500);
            assert.strictEqual(await evaluate(`document.getElementById('questionOverlay').classList.contains('active')`), true);
            await evaluate(`determinedSkin = 'robot'; window.confirmInitialPet();`);
            await wait(3300);
            assert.strictEqual(await evaluate('currentMode'), 'play');
            assert.strictEqual(await evaluate('window.isNamingPhase'), false);
            assert.strictEqual(await evaluate(`document.getElementById('playerNameOverlay').classList.contains('active')`), false);
            await evaluate(`aiPet.gold = 321; saveGameData();`);
            await call('Page.reload'); await wait(4000);
            await evaluate(`startGameSequence(); switchMode('title'); window.showContinueLoginChoice()`); await wait(700);
            assert.strictEqual(await evaluate('currentMode'), 'play');
            assert.strictEqual(await evaluate('aiPet.gold'), 321);
            assert(!requests.some(url => /firebase|gstatic|cloud_manager/.test(url)), `${name} requested online code during play`);
            assert.deepStrictEqual(exceptions, [], `${name} runtime exceptions`);
            const shot = await call('Page.captureScreenshot');
            fs.writeFileSync(path.join(output, `${name}.png`), Buffer.from(shot.data, 'base64'));
            console.log(`${name}: startup, naming bypass, save/reload, hidden authentication and no Firebase requests passed`);
            console.log(await evaluate(fs.readFileSync(path.join(__dirname, 'release_revision_browser.js'), 'utf8')));
            if (name === 'demo') {
                transfer = await evaluate(fs.readFileSync(path.join(__dirname, 'demo_browser_scenario.js'), 'utf8'));
                fs.writeFileSync(path.join(output, 'transfer-fixture.json'), JSON.stringify(transfer, null, 2));
                const endShot = await call('Page.captureScreenshot');
                fs.writeFileSync(path.join(output, 'demo-end.png'), Buffer.from(endShot.data, 'base64'));
                await call('Page.reload'); await wait(4000);
                await evaluate(`startGameSequence(); switchMode('title'); window.startActualGame(false);`);
                assert.strictEqual(await evaluate('window.TCG.myCollection.filter(card => card.uid === aiPet.demoProgress.memoryCard.uid).length'), 1);
                assert.strictEqual(await evaluate(`!!document.getElementById('demo-end-ui')`), true);
            } else {
                for (const state of ['living', 'ended']) {
                    await evaluate(`localStorage.clear(); window.DemoSave.importData(localStorage, ${JSON.stringify(transfer[state])})`);
                    await evaluate(`localStorage.setItem('last_login_date', new Date().toLocaleDateString('ja-JP'))`);
                    await call('Page.reload'); await wait(5000);
                    for (let attempt = 0; attempt < 60 && await evaluate('document.readyState !== "complete" || !!window.aiPet?.demoImport?.pending'); attempt++) await wait(250);
                    const expectedHero = JSON.parse(transfer[state].data.ai_pet_data_v1);
                    const loaded = await evaluate('({ stats: aiPet.stats, age: aiPet.age, gold: aiPet.gold, demoImport: aiPet.demoImport, mode: currentMode, first: isFirstPlay, force: localStorage.getItem("force_first_play") })');
                    assert.strictEqual(loaded.stats.power, expectedHero.stats.power, JSON.stringify({ state, loaded, expectedStats: expectedHero.stats, exceptions }));
                    assert.strictEqual(await evaluate('aiPet.gold'), 321);
                    assert.strictEqual(await evaluate(`Object.values(assets).some(asset => asset.type === 'pharmacy')`), true, 'full import restores pharmacy');
                    assert.strictEqual(await evaluate('aiPet.age'), state === 'living' ? 10 : 100);
                    assert.strictEqual(await evaluate('aiPet.demoImport.pending'), false, JSON.stringify({ state, loaded, exceptions, ready: await evaluate('document.readyState') }));
                    if (state === 'living') assert.strictEqual(await evaluate('currentMode'), 'play');
                    else {
                        assert.strictEqual(await evaluate(`getComputedStyle(document.getElementById('inheritance-shop-ui')).display`), 'flex');
                        assert.notStrictEqual(await evaluate('currentMode'), 'play');
                    }
                    assert.strictEqual(await evaluate(`(() => { try { DemoSave.importData(localStorage, ${JSON.stringify(transfer.living)}); return false; } catch (_) { return true; } })()`), true);
                }
                const inherited = await call('Page.captureScreenshot');
                fs.writeFileSync(path.join(output, 'full-import-ended.png'), Buffer.from(inherited.data, 'base64'));
                console.log('Demo gameplay limits, exact-once end memory and living/ended full import passed');
            }
        }
        console.log('Release browser checks passed');
        await call('Browser.close');
    } finally {
        socket?.close(); browser.kill(); servers.forEach(server => server.kill());
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
