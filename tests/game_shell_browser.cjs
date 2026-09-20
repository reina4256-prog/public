// Run: node tests/game_shell_browser.cjs.
// Headless Edge uses a dedicated profile; player saves are never opened.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const output = path.resolve(__dirname, '../.localization-audit/game-shell');
const profile = path.join(output, 'edge-profile');
fs.mkdirSync(profile, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
    const server = spawn(process.execPath, [path.resolve(__dirname, '../browser_server.js'), '--port', '4187'], { windowsHide: true, stdio: 'ignore' });
    await wait(500);
    const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9417', '--user-data-dir=' + profile, 'about:blank'],
        { windowsHide: true, stdio: 'ignore' });
    let socket;
    try {
        let tabs;
        for (let i = 0; i < 100; i++) {
            try { tabs = await (await fetch('http://127.0.0.1:9417/json')).json(); if (tabs.length) break; } catch {}
            await wait(100);
        }
        if (!tabs?.length) throw new Error('Headless browser did not start');
        socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
        await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
        let sequence = 0;
        const pending = new Map();
        socket.addEventListener('message', event => {
            const data = JSON.parse(event.data);
            const request = pending.get(data.id);
            if (request) { pending.delete(data.id); data.error ? request.reject(Error(JSON.stringify(data.error))) : request.resolve(data.result); }
        });
        const call = (method, params = {}) => new Promise((resolve, reject) => {
            const id = ++sequence;
            const timeout = setTimeout(() => reject(Error('CDP timeout: ' + method)), process.argv.includes('--test-exam') ? 120000 : 45000);
            pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
            socket.send(JSON.stringify({ id, method, params }));
        });
        await call('Network.enable');
        await call('Network.setBlockedURLs', { urls: ['*googleapis.com*', '*firebase*', '*gstatic.com*'] });
        await call('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:4187', storageTypes: 'all' });
        await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
        await call('Page.navigate', { url: 'http://127.0.0.1:4187/' });
        await wait(3500);
        await call('Runtime.evaluate', { expression: 'localStorage.clear()' });
        if (process.argv.includes('--test-craft')) {
            const result = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true,
                expression: fs.readFileSync(path.join(__dirname, 'craft_browser_scenario.js'), 'utf8') });
            if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
            const shot = await call('Page.captureScreenshot');
            fs.writeFileSync(path.join(output, 'craft.png'), Buffer.from(shot.data, 'base64'));
            await call('Page.reload'); await wait(3000);
            const reload = await call('Runtime.evaluate', { returnByValue: true, expression: `(() => {
                const id = 'person:craft-browser', from = Number(localStorage.getItem('craft_test_checkpoint'));
                const draft = ScheduleCore.clone(aiPet), person = draft.residentState.people[id];
                if (!person.routineState.craft || person.routineState.craft.effectsApplied) throw Error('pending craft lost on reload');
                ScheduleRuntime.simulate(draft, assets, from, from + 60000, true);
                const completed = draft.residentState.people[id];
                if (completed.possessions.inventory.length !== 1 || !completed.profile.skills.mixing) throw Error('craft did not finish once');
                ScheduleRuntime.simulate(draft, assets, from + 60000, from + 90000, true);
                if (completed.possessions.inventory.length !== 1) throw Error('craft replayed');
                return { restored: true, duplicate: false };
            })()` });
            if (reload.exceptionDetails) throw Error(reload.exceptionDetails.exception?.description || JSON.stringify(reload.exceptionDetails));
            console.log(JSON.stringify({ passed: true, craft: result.result.value, reload: reload.result.value }));
            await call('Browser.close'); return;
        }
        if (process.argv.includes('--test-schedule')) {
            const result = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true,
                expression: fs.readFileSync(path.join(__dirname, 'schedule_browser_scenario.js'), 'utf8') });
            const shot = await call('Page.captureScreenshot');
            fs.writeFileSync(path.join(output, 'schedule.png'), Buffer.from(shot.data, 'base64'));
            if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
            await call('Page.reload');
            await wait(3000);
            const reload = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
                const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
                switchMode('play'); window.showGameTutorial = () => {}; window.unlockTutorialEntry = () => {};
                document.getElementById('in-game-tutorial')?.remove();
                if (!aiPet.routine?.enabled || !aiPet.schedule.some(task => task.routineKey && task.myHomeIndoor)) throw Error('saved routine task lost on reload');
                const before = aiPet.schedule.filter(task => task.routineKey).length;
                const task = aiPet.schedule.find(task => task.routineKey);
                if (aiPet.timeProgress?.report) aiPet.timeProgress.report.acknowledged = true;
                isGamePaused = false;
                ScheduleRuntime.planLiveHero(); await wait(300);
                if (!window.myHomeMapOpen) throw Error('routine home scene not restored');
                if (aiPet.schedule.filter(task => task.routineKey).length !== before) throw Error('reload duplicated routine task');
                if (aiPet.schedule.find(task => task.routineKey).routineKey !== task.routineKey) throw Error('routine owner changed on reload');
                return { restored: true, duplicate: false };
            })()` });
            if (reload.exceptionDetails) throw Error(reload.exceptionDetails.exception?.description || JSON.stringify(reload.exceptionDetails));
            console.log(JSON.stringify({ passed: true, schedule: result.result.value }));
            await call('Browser.close');
            return;
        }
        if (process.argv.includes('--test-residents') || process.argv.includes('--test-directory')) {
            const result = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true,
                expression: fs.readFileSync(path.join(__dirname, process.argv.includes('--test-directory') ? 'resident_directory_scenario.js' : 'resident_browser_scenario.js'), 'utf8') });
            const shot = await call('Page.captureScreenshot');
            fs.writeFileSync(path.join(output, process.argv.includes('--test-directory') ? 'directory.png' : 'residents.png'), Buffer.from(shot.data, 'base64'));
            if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
            if (process.argv.includes('--test-directory')) {
                await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
                const mobile = await call('Runtime.evaluate', { returnByValue: true, expression: `(() => {
                    const split = document.querySelector('.resident-directory-split');
                    split.classList.remove('show-detail');
                    const root = document.querySelector('.resident-directory');
                    if (root.scrollWidth > root.clientWidth + 2) throw Error('mobile overflow');
                    root.querySelector('.resident-directory-row').click();
                    if (getComputedStyle(root.querySelector('.resident-directory-list')).display !== 'none') throw Error('mobile detail navigation');
                    root.querySelector('.resident-directory-assignment button').click();
                    if (getComputedStyle(root.querySelector('.resident-directory-detail')).display !== 'none') throw Error('mobile back navigation');
                    return true;
                })()` });
                if (mobile.exceptionDetails) throw Error(mobile.exceptionDetails.exception?.description);
                const mobileShot = await call('Page.captureScreenshot');
                fs.writeFileSync(path.join(output, 'directory-mobile.png'), Buffer.from(mobileShot.data, 'base64'));
                const detailCheck = await call('Runtime.evaluate', { returnByValue: true, expression: `(() => {
                    document.querySelector('.resident-directory-row').click();
                    const sheet = document.querySelector('.resident-record-sheet');
                    if (sheet.scrollWidth > sheet.clientWidth + 2) throw Error('mobile record overflow');
                    const photo = sheet.querySelector('.resident-record-photo').getBoundingClientRect();
                    const fields = sheet.querySelector('.resident-record-fields').getBoundingClientRect();
                    if (photo.left < fields.right) throw Error('record photo must remain right of identity fields');
                    return true;
                })()` });
                if (detailCheck.exceptionDetails) throw Error(detailCheck.exceptionDetails.exception?.description);
                const detailShot = await call('Page.captureScreenshot');
                fs.writeFileSync(path.join(output, 'directory-mobile-detail.png'), Buffer.from(detailShot.data, 'base64'));
            }
            console.log(JSON.stringify({ passed: true, residents: result.result.value }));
            await call('Browser.close');
            return;
        }
        const result = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
            const assert = (value, message) => { if (!value) throw new Error(message); };
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            await wait(1500);
            switchMode('play');
            document.getElementById('side-panel').style.display = 'none';
            document.getElementById('canvas-wrapper').classList.remove('fullscreen-mode');
            ['aiStatus', 'canvas-wrapper', 'gameControls', 'info-column'].forEach(id => {
                const el = document.getElementById(id); el.style.opacity = '1'; el.style.pointerEvents = 'auto';
            });
            window.showGameTutorial = () => {};
            window.unlockTutorialEntry = () => {};
            document.getElementById('in-game-tutorial')?.remove();
            isGamePaused = false;
            const realConciergeEncounter = window.tryTriggerConciergeHomeEncounter;
            window.tryTriggerConciergeHomeEncounter = () => false;
            window.triggerTCGUnlock = () => {};
            window.isHairdresserCustomizationUnlocked = () => true;
            window.getMyHomeAsset = () => ({ type: 'hut', level: 1 });
            aiPet.conciergeUnlocked = true;
            aiPet.conciergeEncountered = true;
            aiPet.age = 1; aiPet.lifespan = 100; aiPet.energy = 100; aiPet.hunger = 100;
            aiPet.isReincarnating = false;
            aiPet.apprentice = { learnedWords: ['睡眠', '勉強', '倉庫', 'ドレッサー'], rank: {}, retired: {}, activeQuests: [] };
            aiPet.schedule = [];
            const island = { x: aiPet.x, y: aiPet.y, camera: { ...camera } };
            if (${process.argv.includes('--test-facilities')}) {
                aiPet.shopTutorialCompleted = true;
                aiPet.apprentice.retired.smithing = true;
                const restaurant = { id: 'shell-restaurant', type: 'restaurant' };
                const smith = { id: 'shell-smith', type: 'blacksmith' };
                for (const kind of ['restaurant', 'blacksmith']) {
                    if (kind === 'restaurant') openShopMapUI(restaurant);
                    else {
                        assert(openBlacksmithMapUI(smith), 'smith entry');
                        BLACKSMITH_STATE.tutorial.completed = true;
                        BLACKSMITH_STATE.shopNamePrompted = true;
                    }
                    await wait(100);
                    const root = document.querySelector('#scene-host > .central-facility');
                    const box = root.getBoundingClientRect();
                    const host = document.getElementById('scene-host').getBoundingClientRect();
                    assert(box.width === host.width && box.height === host.height, kind + ' central bounds');
                    assert(!GameShell.isPaused(), kind + ' self pause');
                    const state = kind === 'restaurant' ? SHOP_STATE : BLACKSMITH_STATE;
                    const hold = GameShell.acquirePause('facility-test');
                    GameLog.open();
                    await wait(30);
                    GameLog.close();
                    await wait(30);
                    assert(GameShell.isPaused(), kind + ' nested pause released owner');
                    const before = JSON.stringify(state);
                    await wait(700);
                    assert(JSON.stringify(state) === before, kind + ' simulation advanced while paused');
                    GameShell.releasePause(hold);
                    assert((kind === 'restaurant' ? SHOP_STATE : BLACKSMITH_STATE) === state, kind + ' state replaced');
                    const capacity = aiPet.getMaxVocabulary;
                    aiPet.getMaxVocabulary = () => 100;
                    const input = document.getElementById('chatInput');
                    input.value = 'shell vocabulary ' + kind; sendChat();
                    assert(aiPet.apprentice.learnedWords.includes('shell vocabulary ' + kind), kind + ' vocabulary');
                    assert(state.player.speechText.includes('shell vocabulary ' + kind), kind + ' learning speech');
                    aiPet.getMaxVocabulary = () => aiPet.apprentice.learnedWords.length;
                    input.value = 'capacity overflow'; sendChat();
                    assert(!aiPet.apprentice.learnedWords.includes('capacity overflow'), kind + ' capacity');
                    input.value = 'shell vocabulary ' + kind + 'を忘れて'; sendChat();
                    assert(!aiPet.apprentice.learnedWords.includes('shell vocabulary ' + kind), kind + ' forget');
                    aiPet.getMaxVocabulary = capacity;
                    if (kind === 'restaurant') {
                        assert(!document.getElementById('shop-money-ui') && !document.getElementById('shop-stamina-ui') && !document.getElementById('shop-fullness-ui'), 'duplicate stats');
                        assert(!root.firstElementChild.textContent.includes('お店を出る') && !root.firstElementChild.textContent.includes('ログ・状況'), 'duplicate buttons');
                        aiPet.isIndoors = true; aiPet.indoorTarget = restaurant; aiPet.actionState = 'inside'; aiPet.shopThinkTimer = 100;
                        aiPet.schedule = [];
                        for (let i = 0; i < 110; i++) aiPet.update();
                        assert(!aiPet.schedule.some(task => task.type === 'shop_research' || task.type === 'shop_work'), 'legacy business task');
                        GameLog.open();
                        assert(document.querySelector('.game-log-restaurant'), 'missing restaurant status');
                        assert(document.querySelector('.game-log-restaurant').textContent.includes('レイアウトスコア'), 'empty restaurant dashboard');
                        GameLog.close();
                        input.value = '出る'; sendChat();
                        assert(GameShell.currentScene === 'restaurant', 'exit must walk');
                        for (let i = 0; i < 80 && GameShell.currentScene === 'restaurant'; i++) await wait(100);
                        assert(GameShell.currentScene === 'island', 'walking exit timeout');
                    } else closeBlacksmithMapUI();
                    assert(GameShell.currentScene === 'island' && !GameShell.isPaused(), kind + ' exit');
                    assert(aiPet.x === island.x && aiPet.y === island.y, kind + ' origin');
                }
                aiPet.getMaxVocabulary = () => 100;
                assert(openMyHomeMapUI({ skipEncounter: true }), 'home entry');
                assert(GameShell.currentScene === 'myhome', 'home scene');
                document.getElementById('chatInput').value = 'home vocabulary'; sendChat();
                assert(aiPet.apprentice.learnedWords.includes('home vocabulary') && aiPet.message.includes('home vocabulary'), 'home learning');
                closeMyHomeMapUI();
                window.unlockCastlePersonCards = () => {};
                openCastleMapUI();
                sendCastleChatCommand('castle vocabulary');
                assert(aiPet.apprentice.learnedWords.includes('castle vocabulary') && aiPet.message.includes('castle vocabulary'), 'castle learning');
                closeCastleMapUI();
                const casinoGate = window.hasBuiltCasino;
                window.hasBuiltCasino = () => true;
                aiPet.apprentice.metMasters = ['dealer'];
                openCasinoMapUI();
                handleCasinoChat('casino vocabulary');
                assert(aiPet.apprentice.learnedWords.includes('casino vocabulary') && aiPet.message.includes('casino vocabulary'), 'casino learning');
                closeCasinoMapUI();
                window.hasBuiltCasino = casinoGate;
                if (${process.argv.includes('--test-smith-view')}) openBlacksmithMapUI(smith);
                else openShopMapUI(restaurant);
                return { facilities: true };
            }
            assert(openMyHomeMapUI(), 'entry failed');
            await wait(250);
            if (${process.argv.includes('--test-exam')}) {
                const samples = [];
                const originalUpdate = aiPet.update;
                let updates = 0;
                aiPet.update = function(...args) { updates++; return originalUpdate.apply(this, args); };
                for (const reset of [false, true]) {
                    if (reset) resetConciergeBeforeApprentice();
                    aiPet.apprentice.attempts = {};
                    aiPet.apprentice.learnedWords = reset ? [] : EXAM_KEYWORDS.concierge.accepts.map(words => words[0]);
                    assert(aiPet.applyApprenticeship('concierge'), 'exam admission failed');
                    const task = aiPet.schedule[0];
                    // Reproduce the first exam tick without waiting for island routing.
                    task.duration--;
                    updateExamUI(task);
                    await wait(100);
                    const world = () => JSON.stringify({ age: aiPet.age, energy: aiPet.energy, hunger: aiPet.hunger, stats: aiPet.stats, player: aiPet.myHomeIndoor.player, updates });
                    const frozen = world();
                    const before = task.duration;
                    isGamePaused = false;
                    await wait(1200);
                    const after = task.duration;
                    assert(GameShell.isPaused() && GameShell.exclusiveOpen, 'exam did not acquire shared pause');
                    assert(after < before && parseFloat(document.getElementById('exam-progress-bar').style.width) > 1, 'exam clock did not advance');
                    assert(world() === frozen, 'exam advanced background simulation');
                    const token = GameShell.acquirePause('test-external');
                    const held = task.duration;
                    await wait(150);
                    assert(task.duration === held, 'independent pause ignored');
                    GameShell.releasePause(token);
                    GameLog.open();
                    const nestedHeld = task.duration;
                    await wait(150);
                    assert(task.duration === nestedHeld, 'exam advanced behind nested modal');
                    GameLog.close();
                    // Real timer progression was checked above. Drive the remaining
                    // content ticks deterministically to avoid headless timer throttling.
                    for (let i = 0; i < 310 && aiPet.schedule.includes(task); i++) {
                        GameShell.tickExclusive();
                        if (i % 25 === 0) await wait(0);
                    }
                    assert(!aiPet.schedule.includes(task) && !document.getElementById('examOverlay'), 'exam did not finish: ' + JSON.stringify({ reset, duration: task.duration, paused: GameShell.isPaused(), mode: currentEncounterMode }));
                    assert(currentEncounterMode === (reset ? 'exam_fail' : 'exam_pass'), 'wrong exam result');
                    assert(world() === frozen && GameShell.isPaused(), 'result transition resumed background');
                    const resultMode = currentEncounterMode;
                    confirmEncounter(true);
                    await wait(150);
                    assert(myHomeMapOpen && aiPet.isIndoors && !GameShell.isPaused(), 'result did not return to home');
                    if (!reset) assert(aiPet.apprentice.rank.concierge === 1, 'successful exam did not admit apprentice');
                    samples.push({ reset, before, after, resultMode });
                }
                aiPet.apprentice.attempts = {};
                assert(aiPet.applyApprenticeship('concierge'), 'resume fixture admission failed');
                const resumedTask = aiPet.schedule[0];
                resumedTask.duration = 150;
                updateExamUI(resumedTask);
                await wait(200);
                assert(resumedTask.duration < 150, 'saved mid-exam task did not resume');
                const replacement = { type: 'study', duration: 60 };
                aiPet.schedule = [replacement];
                await wait(150);
                assert(!document.getElementById('examOverlay') && aiPet.schedule[0] === replacement, 'stale exam consumed replacement task');
                aiPet.schedule = [];
                aiPet.update = originalUpdate;
                return { examClockSeparated: true, samples };
            }
            const home = document.getElementById('myhome-map-ui');
            assert(home.parentElement.id === 'scene-host', 'home must mount in central host');
            assert(!document.getElementById('myhome-chat-input'), 'duplicate chat remains');
            assert(!document.getElementById('myhome-status-bar'), 'duplicate status remains');
            assert(!document.getElementById('myhome-scene-commands') && getComputedStyle(document.getElementById('commandHUD')).display !== 'none', 'shared command center missing');
            const box = home.getBoundingClientRect(), host = document.getElementById('canvas-wrapper').getBoundingClientRect();
            assert(box.width <= host.width && box.height <= host.height, 'home escaped central viewport');
            assert(box.width < innerWidth && box.height < innerHeight, 'home is still full screen');
            const player = aiPet.myHomeIndoor.player;
            document.getElementById('chatInput').value = '勉強'; sendChat();
            await wait(300);
            assert(window.myHomeMoveTimer || aiPet.schedule.some(t => t.myHomeIndoor), 'shared chat failed to start indoor action');
            openHairdresserUI('color');
            await wait(30);
            assert(GameShell.exclusiveOpen && GameShell.isPaused(), 'dresser did not acquire pause');
            const paused = JSON.stringify({ player, schedule: aiPet.schedule, age: aiPet.age, energy: aiPet.energy });
            const clock = GameShell.activeTime();
            await wait(700);
            assert(JSON.stringify({ player, schedule: aiPet.schedule, age: aiPet.age, energy: aiPet.energy }) === paused, 'background progressed under dresser');
            assert(GameShell.activeTime() === clock, 'paused time counted as background time');
            const nested = document.createElement('div');
            nested.dataset.gameExclusive = 'test';
            nested.style.cssText = 'position:fixed;inset:0;z-index:200000;background:#111';
            nested.innerHTML = '<button id="nested-close">close</button>';
            document.body.appendChild(nested);
            await wait(30);
            isGamePaused = false;
            document.getElementById('hairdresser-ui').remove();
            await wait(30);
            assert(GameShell.isPaused(), 'closing lower content resumed nested content');
            assert(document.activeElement.id === 'nested-close', 'nested focus was lost');
            nested.remove();
            await wait(30);
            assert(!GameShell.isPaused(), 'pause leaked after final close');
            assert(document.getElementById('myhome-map-ui') === home && aiPet.myHomeIndoor.player === player, 'home was reconstructed');
            const first = GameShell.acquirePause('first');
            const second = GameShell.acquirePause('second');
            isGamePaused = true;
            GameShell.releasePause(first); GameShell.releasePause(second);
            assert(GameShell.isPaused(), 'legacy pause lost');
            isGamePaused = false;
            assert(!GameShell.isPaused(), 'legacy release failed');
            const food = { id: 'item_berry', freshnessStartedAt: Date.now() - 10000 };
            aiPet.inventory = [food];
            const token = GameShell.acquirePause('freshness');
            const age = GameShell.worldNow() - food.freshnessStartedAt;
            await wait(200);
            saveGameData();
            assert(Math.abs(GameShell.worldNow() - food.freshnessStartedAt - age) < 5, 'save charged paused freshness');
            await wait(150);
            GameShell.releasePause(token);
            assert(Math.abs(Date.now() - food.freshnessStartedAt - age) < 10, 'release charged paused freshness');
            closeMyHomeMapUI();
            assert(GameShell.currentScene === 'island' && document.getElementById('scene-host').hidden, 'exit did not restore island');
            assert(aiPet.x === island.x && aiPet.y === island.y, 'island position lost');
            assert(camera.x === island.camera.x && camera.y === island.camera.y, 'island camera lost');
            assert(!document.getElementById('myhome-scene-commands') && !myHomeMoveTimer && !myHomeVisitorTimer, 'exit leaked UI or timers');
            openMyHomeMapUI();
            await wait(100);
            assert(!GameShell.isPaused(), 'reentry leaked pause');
            const skin = aiPet.currentSkin;
            aiPet.currentSkin = 'robot'; renderMyHomeMap();
            const spriteBefore = document.querySelector('.myhome-player').dataset.spriteKey;
            aiPet.currentSkin = 'magician';
            finishEvolutionPresentation();
            assert(document.querySelector('.myhome-player').dataset.spriteKey !== spriteBefore, 'evolution did not refresh indoor sprite');
            aiPet.currentSkin = skin;
            aiPet.apprentice.activeQuests = [{ masterType: 'farming', rank: 1, name: 'Test quest', desc: 'Test details', qVal: 0 }];
            updateQuestHUD();
            assert(getComputedStyle(document.getElementById('questHUD')).visibility === 'visible' && getComputedStyle(document.getElementById('questHUD')).display !== 'none', 'shared quest HUD hidden indoors');
            GameLog.add('Island message', { scene: 'island' });
            GameLog.add('Home message', { scene: 'myhome' });
            GameLog.add('<img src=x onerror=alert(1)>', { speaker: 'player', literal: true });
            document.getElementById('btnGameLog').focus();
            GameLog.open();
            await wait(30);
            const log = document.getElementById('game-log-overlay');
            assert(log.textContent.includes('Island message') && log.textContent.includes('Home message'), 'shared log lost a scene');
            assert(!log.querySelector('img') && log.textContent.includes('<img'), 'log treated player text as HTML');
            assert(GameShell.isPaused(), 'log did not pause world');
            GameLog.close();
            await wait(30);
            assert(!GameShell.isPaused() && document.activeElement.id === 'btnGameLog', 'log did not restore focus/pause');
            aiPet.myHomeIndoor.player = { x: 5, y: 8, dir: 'down' };
            requestMyHomeExit();
            await wait(240);
            document.getElementById('chatInput').value = '勉強'; sendChat();
            await wait(180);
            assert(myHomeMapOpen && !aiPet.myHomeExiting, 'new instruction retained stale exit callback/state');
            aiPet.myHomeIndoor.player = { x: 5, y: 4, dir: 'down' };
            const exitPlayer = aiPet.myHomeIndoor.player;
            document.getElementById('chatInput').value = '出る'; sendChat();
            assert(myHomeMapOpen, 'exit teleported without walking');
            await wait(450);
            assert(myHomeMapOpen && (exitPlayer.y !== 4 || exitPlayer.x !== 5), 'exit did not walk toward entrance');
            for (let i = 0; i < 80 && myHomeMapOpen; i++) await wait(100);
            assert(!myHomeMapOpen && exitPlayer.x === 5 && exitPlayer.y === 8, 'exit did not reach entrance');
            openMyHomeMapUI(); await wait(180);
            prepareMyHomeIntroEscort();
            const intro = aiPet.myHomeIndoor;
            assert(intro.player.y === 8 && intro.concierge.y === 7 && intro.player.dir === 'up' && intro.concierge.dir === 'down', 'intro actors not facing at entrance');
            startMyHomeIntroEscort();
            await wait(230);
            assert(intro.player.x === 5 && intro.player.y === 7 && (intro.concierge.y !== 7 || intro.concierge.x !== 5), 'intro actors did not walk together');
            const escortPause = GameShell.acquirePause('escort-check');
            const escortPosition = JSON.stringify([intro.player, intro.concierge]);
            await wait(300);
            assert(JSON.stringify([intro.player, intro.concierge]) === escortPosition, 'escort moved during pause');
            GameShell.releasePause(escortPause);
            for (let i = 0; i < 100 && intro.introEscort; i++) await wait(100);
            assert(!intro.introEscort && intro.concierge.x === 5 && intro.concierge.y === 3 && intro.player.y === 4, 'escort did not settle at concierge station');
            closeMyHomeMapUI();
            delete aiPet.myHomeIndoor;
            aiPet.conciergeUnlocked = false; aiPet.conciergeEncountered = false; aiPet.conciergeIntroduced = true;
            aiPet.apprentice.metMasters = [];
            window.hasInventoryItem = () => true;
            window.isConciergeBaseUnlockReady = () => true;
            window.playMasterEncounterVideo = () => false;
            assert(realConciergeEncounter(), 'actual first-meeting entry failed');
            await wait(30);
            assert(myHomeMapOpen && GameShell.isPaused() && aiPet.myHomeIndoor.introEscort.phase === 'greeting', 'first encounter did not retain entrance scene under dialogue');
            const greetingPosition = JSON.stringify([aiPet.myHomeIndoor.player, aiPet.myHomeIndoor.concierge]);
            await wait(300);
            assert(JSON.stringify([aiPet.myHomeIndoor.player, aiPet.myHomeIndoor.concierge]) === greetingPosition, 'actors walked before greeting closed');
            confirmEncounter(true);
            await wait(30);
            confirmEncounter(false);
            for (let i = 0; i < 100 && aiPet.myHomeIndoor.introEscort; i++) await wait(100);
            assert(!aiPet.myHomeIndoor.introEscort && !GameShell.isPaused(), 'actual greeting callback failed to finish escort');
            return { scene: GameShell.currentScene, centralSize: [box.width, box.height] };
        })()` });
        const shot = await call('Page.captureScreenshot');
        fs.writeFileSync(path.join(output, result.exceptionDetails ? 'failure.png' : 'desktop.png'), Buffer.from(shot.data, 'base64'));
        if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
        await call('Runtime.evaluate', { expression: 'GameLog.open()' });
        await wait(100);
        const logShot = await call('Page.captureScreenshot');
        fs.writeFileSync(path.join(output, 'log.png'), Buffer.from(logShot.data, 'base64'));
        await call('Runtime.evaluate', { expression: 'GameLog.close()' });
        await call('Emulation.setDeviceMetricsOverride', { width: 640, height: 800, deviceScaleFactor: 1, mobile: false });
        await wait(250);
        const compact = await call('Page.captureScreenshot');
        fs.writeFileSync(path.join(output, 'compact.png'), Buffer.from(compact.data, 'base64'));
        const layout = await call('Runtime.evaluate', { returnByValue: true, expression: "(() => { const main = document.getElementById('main-container'); return main.clientHeight <= 720 && main.scrollHeight > main.clientHeight; })()" });
        if (!layout.result.value) throw Error('Compact shell cannot scroll to command center');
        console.log(JSON.stringify({ passed: true, result: result.result.value, output }));
        await call('Browser.close');
    } finally {
        socket?.close();
        browser.kill();
        server.kill();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
