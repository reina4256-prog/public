'use strict';
// Dedicated ephemeral renderer. Speech service events are mocked explicitly;
// this checks UI transport, not microphone hardware or a provider's service.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
if (!process.versions.electron || process.type !== 'browser') {
    const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
    const child = require('node:child_process').spawn(require('electron'), [__filename], { env, stdio: 'inherit', windowsHide: true });
    child.on('exit', code => { process.exitCode = code || 0; });
} else {
    const assert = require('node:assert/strict');
    const { app, BrowserWindow, ipcMain } = require('electron');
    app.disableHardwareAcceleration();
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-voice-stars-'));
    app.setPath('userData', directory);
    const evidence = path.resolve(__dirname, '../../docs/.local-history/verification-runs', 'voice-stars-renderer-' + Date.now());
    fs.mkdirSync(evidence, { recursive: true });
    let server, window, snapshot = null, nextLoad = null, mockEnabled = false;
    const failures = [], checks = [];
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const mock = `window.__spoken = []; window.__recognition = null;
        window.SpeechRecognition = class {
            constructor() { window.__recognition = this; }
            start() { this.started = true; }
            abort() { this.aborted = true; }
        };
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        Object.defineProperty(window, 'speechSynthesis', { value: {
            speak(u) { window.__spoken.push({ text: u.text, lang: u.lang, volume: u.volume, voice: u.voice.voiceURI }); },
            addEventListener() {}, cancel() {}, getVoices() { return ['ja-JP','en-US','zh-CN','ru-RU','es-ES','pt-BR','de-DE'].flatMap(lang =>
                [0,1,2].map(i => ({lang, name: lang+' voice '+i, voiceURI: lang+'-'+i}))); }
        }});`;
    app.whenReady().then(async () => {
        server = require('./serve').createServer();
        const serve = server.listeners('request')[0]; server.removeAllListeners('request');
        server.on('request', (request, response) => {
            if (mockEnabled && request.url.startsWith('/experimental_word_learning.html')) {
                const html = fs.readFileSync(path.resolve(__dirname, '../../experimental_word_learning.html'), 'utf8');
                response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                response.end(html.replace('<head>', '<head><script>' + mock + '</script>'));
            } else serve(request, response);
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        ipcMain.on('word-life-load', event => { event.returnValue = { ok: true, value: nextLoad }; });
        ipcMain.on('word-life-save', (event, value) => { snapshot = value; event.returnValue = { ok: true }; });
        window = new BrowserWindow({ width: 1280, height: 900, show: false, webPreferences: {
            contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false,
            preload: path.join(__dirname, 'preload.js') } });
        window.webContents.on('console-message', (_e, level, message) => { if (level >= 3) failures.push(message); });
        const js = async code => {
            try { return await window.webContents.executeJavaScript(code, true); }
            catch (error) { throw new Error(`${error.message}\nCode: ${code}\nConsole: ${JSON.stringify(failures)}`); }
        };
        const url = `http://127.0.0.1:${server.address().port}/experimental_word_learning.html?debug=1`;
        async function load(foundation, life, speech = 'short') {
            await window.loadURL(url); await sleep(450);
            for (let i=0;i<100 && await js(`document.querySelector('#word-new-game').disabled`);i++) await sleep(100);
            await js(`document.querySelectorAll('form select')[1].value = '${foundation ? 'yes' : 'no'}';
                document.querySelectorAll('form select')[2].value = '${life ? 'yes' : 'no'}';
                document.querySelectorAll('form select')[3].value = '${speech}';
                document.querySelector('form').requestSubmit(); void 0`);
            assert.ok(snapshot?.state, JSON.stringify({ failures, screen: await js(`document.querySelector('#app').className`) })); await sleep(60);
        }
        await load(false, false);
        checks.push({ realCapabilities: await js(`({ recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition), synthesis: !!window.speechSynthesis, voices: window.speechSynthesis?.getVoices().map(v => v.lang) })`) });
        checks.push({ realSilentSynthesis: await js(`new Promise(resolve => {
            if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { resolve('unsupported'); return; }
            const utterance = new SpeechSynthesisUtterance('test'); utterance.lang = 'ja-JP'; utterance.volume = 0;
            const timer = setTimeout(() => { speechSynthesis.cancel(); resolve('timeout'); }, 5000);
            utterance.onend = () => { clearTimeout(timer); resolve('ended'); };
            utterance.onerror = e => { clearTimeout(timer); resolve(e.error); };
            speechSynthesis.speak(utterance);
        })`) });
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.equal(await js(`document.querySelectorAll('.word-star').length`), 0);
        await js(`document.querySelector('.word-stars-dialog').close(); void 0`);
        await js(`document.querySelector('.chat-form textarea').value = '木の実がある'; document.querySelector('.chat-form').requestSubmit(); void 0`);
        const unknownState = JSON.stringify(snapshot.state);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.equal(await js(`document.querySelectorAll('.word-star').length`), 0);
        assert.ok(await js(`document.querySelector('#word-constellation').textContent.includes('木の実がある')`));
        assert.equal(JSON.stringify(snapshot.state), unknownState);
        checks.push({ emptyAndUnknown: true });
        mockEnabled = true;
        await load(true, true);
        const original = JSON.stringify(snapshot.state);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.ok(await js(`document.querySelectorAll('.word-star.initial').length > 20`));
        assert.equal(await js(`document.querySelectorAll('.word-stars-sky line').length`), 0);
        await js(`document.querySelector('.word-stars-dialog').close(); void 0`);
        assert.equal(JSON.stringify(snapshot.state), original);
        const serial = snapshot.state.serial;
        await js(`document.querySelector('#word-microphone').click();
            window.__recognition.onresult({ results: [{ isFinal: true, 0: { transcript: 'おはよう' } }] });
            window.__recognition.onend(); void 0`);
        assert.equal(snapshot.state.serial, serial);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), 'おはよう');
        await js(`document.querySelector('.chat-form').requestSubmit(); void 0`);
        assert.equal(snapshot.state.serial, serial + 1);
        assert.equal(await js(`window.__spoken.length`), 0);
        await js(`document.querySelector('#word-read-aloud').click();
            document.querySelector('.chat-form textarea').value = 'おはよう'; document.querySelector('.chat-form').requestSubmit(); void 0`);
        assert.ok(await js(`window.__spoken.at(-1).text.includes(document.querySelector('.bubble').textContent)`));
        assert.equal(await js(`window.__spoken.at(-1).lang`), 'ja-JP');
        assert.equal(await js(`window.__spoken.at(-1).voice`), 'ja-JP-1');
        await js(`document.querySelector('#word-microphone').click(); window.__recognition.onresult({ results: [{ isFinal: true, 0: { transcript: 'おはよう' } }] }); window.__recognition.onend(); document.querySelector('.chat-form').requestSubmit(); void 0`);
        assert.equal(snapshot.state.serial, serial + 3);
        const after = snapshot.state.serial;
        await js(`document.querySelector('#word-microphone').click(); window.__old = window.__recognition;
            document.querySelector('#word-microphone').click(); window.__old.onresult({results:[{isFinal:true,0:{transcript:'late'}}]}); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '');
        assert.equal(snapshot.state.serial, after);
        checks.push({ fourTransportModes: true, draftBeforeSend: true, lateRecognitionIgnored: true });
        // Teach an actual personal name, then inspect and search its real evidence.
        await js(`document.querySelectorAll('.scene-controls button')[0].click(); void 0`);
        // Use a deterministic real attention state by restoring an isolated save.
        nextLoad = structuredClone(snapshot);
        nextLoad.state.context.attention = [{ id: 'berry:1', meaning: 'berry' }];
        nextLoad.world.mode = 'observe'; nextLoad.world.attention = 'berry:1';
        await load(true, true);
        await js(`document.querySelector('.chat-form textarea').value = 'これはRinkaだよ'; document.querySelector('.chat-form').requestSubmit(); void 0`);
        assert.ok(snapshot.state.knowledge.associations.some(a => a.word === 'Rinka'));
        const baseline = JSON.stringify(snapshot.state);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.ok(await js(`document.querySelectorAll('.word-stars-sky line').length > 0`));
        await js(`Array.from(document.querySelectorAll('.word-star')).find(b => b.textContent === 'Rinka').click(); void 0`);
        assert.ok(await js(`document.querySelector('.word-stars-detail').textContent.includes('Rinka')`));
        assert.equal(await js(`getComputedStyle(document.querySelector('#word-constellation > details')).position`), 'static');
        await js(`document.querySelector('.word-stars-detail details summary').click(); void 0`);
        assert.ok(await js(`document.querySelector('.word-stars-detail details').open && document.querySelector('.word-stars-detail blockquote').textContent === 'これはRinkaだよ'`));
        const starCount = await js(`document.querySelectorAll('.word-star').length`);
        await js(`const search = document.querySelector('#word-stars-search'); search.value = 'Rinka'; search.dispatchEvent(new Event('input')); void 0`);
        assert.equal(await js(`document.querySelectorAll('.word-star').length`), 1);
        await js(`document.querySelector('.word-stars-tools button').click(); void 0`);
        assert.equal(await js(`document.querySelectorAll('.word-star').length`), starCount);
        await js(`Array.from(document.querySelectorAll('.word-star')).find(b => b.textContent === 'Rinka').click(); void 0`);
        const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
        for (const locale of locales) for (const width of [1280, 390]) {
            window.setContentSize(width, 900);
            await js(`window.GameI18n.setLanguage('${locale}'); void 0`); await sleep(100);
            assert.equal(await js(`document.documentElement.scrollWidth <= window.innerWidth + 1`), true);
            assert.equal(await js(`document.querySelector('.word-stars-dialog').getBoundingClientRect().right <= window.innerWidth + 1`), true);
            assert.ok(await js(`document.querySelector('.word-stars-detail').textContent.includes('Rinka')`));
            if (locale !== 'ja') assert.ok(await js(`Array.from(document.querySelectorAll('.word-star')).every(b =>
                b.textContent === 'Rinka' || !/[\u3040-\u30ff]/u.test(b.textContent))`));
            if (['ja','de'].includes(locale)) {
                await sleep(100); const png = await window.webContents.capturePage();
                fs.writeFileSync(path.join(evidence, `${locale}-${width}.png`), png.toPNG());
            }
        }
        assert.equal(JSON.stringify(snapshot.state), baseline);
        checks.push({ initialAndTaughtStars: true, originalInputVisible: true, searchAndReset: true,
            locales: 7, viewports: 2, inspectionDoesNotMutate: true });
        await js(`document.querySelector('.word-stars-dialog').close(); void 0`);
        // Real saved state survives a reload; viewing does not append evidence.
        nextLoad = structuredClone(snapshot); const knowledge = JSON.stringify(snapshot.state.knowledge);
        await load(true, true);
        await js(`document.querySelector('#word-stars').click(); void 0`);
        assert.equal(JSON.stringify(snapshot.state.knowledge), knowledge);
        assert.ok(await js(`Array.from(document.querySelectorAll('.word-star')).some(b => b.textContent === 'Rinka')`));
        await js(`document.querySelector('.word-stars-dialog').close(); window.GameI18n.setLanguage('ja'); void 0`);
        for (const width of [1280, 390]) {
            window.setContentSize(width, 900); await sleep(150);
            const png = await window.webContents.capturePage(); fs.writeFileSync(path.join(evidence, `chat-${width}.png`), png.toPNG());
        }
        nextLoad = null; await load(false, false, 'gesture');
        await js(`window.GameI18n.setLanguage('ja'); document.querySelector('.chat-form textarea').value = 'おはよう'; document.querySelector('.chat-form').requestSubmit(); document.querySelector('#word-read-aloud').click(); void 0`);
        assert.equal(await js(`window.__spoken.at(-1).text`), await js(`document.querySelector('.bubble').textContent`));
        assert.equal(await js(`window.__spoken.at(-1).voice`), 'ja-JP-0');
        checks.push({ gestureReadAloudRemainsNarration: true });
        const beforeAudition = JSON.stringify(snapshot.state);
        await js(`document.querySelector('#word-voice-choose').click(); void 0`);
        for (const locale of locales) {
            await js(`GameI18n.setLanguage('${locale}'); void 0`); await sleep(80);
            for (const id of require('../../experimental_word_voice').species) {
                await js(`(() => { const species = document.querySelector('#word-voice-species'); species.value = '${id}'; species.dispatchEvent(new Event('change'));
                    const voices = document.querySelector('#word-dialogue-voice'); voices.selectedIndex = 1; voices.dispatchEvent(new Event('change'));
                    document.querySelector('.word-voice-sample button').click(); })(); void 0`);
                assert.equal(await js(`window.__spoken.at(-1).voice`), require('../../experimental_word_voice').locales[locale] + '-2');
                await js(`document.querySelectorAll('.word-voice-sample button')[3].click(); void 0`);
                assert.equal(await js(`window.__spoken.at(-1).voice`), require('../../experimental_word_voice').locales[locale] + '-0');
            }
            for (const width of [1280,390]) {
                window.setContentSize(width,900); await sleep(100);
                assert.ok(await js(`(() => { const r = document.querySelector('#word-voice-choice').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })()`));
                assert.equal(await js(`document.documentElement.scrollWidth <= innerWidth + 1`), true);
                if (locale !== 'ja') assert.equal(await js(`/[\u3040-\u30ff]/u.test(document.querySelector('#word-voice-choice').textContent)`), false);
                if (['ja','de'].includes(locale)) {
                    await window.webContents.capturePage(); await sleep(250);
                    fs.writeFileSync(path.join(evidence, `voices-${locale}-${width}.png`), (await window.webContents.capturePage()).toPNG());
                }
            }
        }
        assert.equal(JSON.stringify(snapshot.state), beforeAudition);
        const profiles = await js(`localStorage.getItem('wordVoiceProfiles:v1')`);
        await js(`document.querySelector('#word-voice-continue').click(); void 0`);
        // Public question flow: all questions, voice audition, then signature; no early child/save creation.
        nextLoad = null; await window.loadURL(url); await sleep(450);
        assert.equal(await js(`localStorage.getItem('wordVoiceProfiles:v1')`), profiles);
        await js(`GameI18n.setLanguage('ja'); void 0`);
        for (let i=0;i<7;i++) {
            assert.equal(await js(`document.querySelector('#word-voice-choice').open`), false);
            await js(`document.querySelector('.word-questions fieldset button[data-answer="0"]').click(); void 0`);
        }
        assert.equal(await js(`document.querySelector('#word-voice-choice').open && !document.querySelector('.word-meeting').open`), true);
        assert.equal(await js(`document.querySelector('#word-voice-species').value === document.querySelector('.word-questions select').value`), true);
        await js(`document.querySelector('#word-voice-choice').requestClose(); void 0`);
        assert.equal(await js(`document.querySelector('#word-voice-choice').open`), true);
        await js(`document.querySelector('#word-voice-continue').click(); void 0`);
        assert.equal(await js(`document.querySelector('.word-meeting').open && document.querySelector('#word-meeting-begin').disabled`), true);
        checks.push({ elevenSpeciesBySevenLanguages: true, separateNarrator: true, previewDoesNotMutate: true,
            preferencesSurviveReload: true, questionsThenVoicesThenSignature: true, voiceViewports: 2 });
        assert.deepEqual(failures, []);
        checks.push({ temporarySaveReload: true, failures });
        fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify({ ok: true, profile: directory, checks }, null, 2));
        console.log(JSON.stringify({ ok: true, evidence, checks }));
    }).catch(error => {
        fs.writeFileSync(path.join(evidence, 'failure.txt'), String(error.stack) + '\n' + JSON.stringify(failures));
        console.error(error); console.error(evidence); process.exitCode = 1;
    }).finally(() => {
        window?.destroy(); if (server) { server.closeAllConnections(); server.close(); }
        app.exit(process.exitCode || 0);
    });
}
