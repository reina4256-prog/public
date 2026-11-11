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
    const audioRequests = [];
    const comparisonRequests = [];
    // Synthetic PCM, not evidence of successful real VOICEVOX synthesis.
    const pcm = Buffer.alloc(44 + 4800 * 2);
    pcm.write('RIFF'); pcm.writeUInt32LE(pcm.length - 8, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16);
    pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(24000, 24); pcm.writeUInt32LE(48000, 28);
    pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(9600, 40);
    for (let i = 0; i < 4800; i++) pcm.writeInt16LE(Math.round(3000 * Math.sin(i * 2 * Math.PI * 440 / 24000)), 44 + i * 2);
    const failures = [], checks = [];
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const mock = `window.__spoken = []; window.__recognition = null;
        window.__audioStarted = 0; window.__audioStopped = 0;
        const NativeAudioContext = window.AudioContext;
        window.AudioContext = class extends NativeAudioContext {
            createBufferSource() {
                const source = super.createBufferSource(), start = source.start.bind(source), stop = source.stop.bind(source);
                source.start = (...args) => { window.__audioStarted++; return start(...args); };
                source.stop = (...args) => { window.__audioStopped++; return stop(...args); };
                return source;
            }
        };
        const originalFetch = window.fetch.bind(window);
        window.fetch = (url, init) => originalFetch(typeof url === 'string' && url.startsWith('http://127.0.0.1:50021/')
            ? '/__voicevox_test' + new URL(url).pathname + new URL(url).search : url, init);
        window.SpeechRecognition = class {
            constructor() { window.__recognition = this; }
            start() { this.started = true; this.onstart?.(); }
            abort() { this.aborted = true; }
            finishCapture() { this.finished = true; this.onprocessing?.(); }
        };
        window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
        Object.defineProperty(window, 'speechSynthesis', { value: {
            speak(u) { window.__spoken.push({ text: u.text, lang: u.lang, volume: u.volume, voice: u.voice.voiceURI, pitch: u.pitch, rate: u.rate }); },
            addEventListener() {}, cancel() {}, getVoices() { return ['ja-JP','en-US','zh-CN','ru-RU','es-ES','pt-BR','de-DE'].flatMap(lang =>
                [0,1,2].map(i => ({lang, name: lang+' voice '+i, voiceURI: lang+'-'+i}))); }
        }});`;
    app.whenReady().then(async () => {
        ipcMain.handle('word-speech-cancel', () => ({ ok: true }));
        ipcMain.handle('word-speech-transcribe', async (_event, packet) => {
            comparisonRequests.push({ profile: packet.profile, wav: Array.from(packet.wav) });
            return { ok: true, text: packet.profile === 'medium' ? 'こんにちは' : '何をしているの' };
        });
        server = require('./serve').createServer();
        const serve = server.listeners('request')[0]; server.removeAllListeners('request');
        server.on('request', (request, response) => {
            if (mockEnabled && request.url.startsWith('/__voicevox_test/')) {
                const record = { url: request.url, method: request.method }; audioRequests.push(record);
                if (request.url.startsWith('/__voicevox_test/synthesis')) {
                    let body = ''; request.on('data', data => { body += data; });
                    request.on('end', () => { record.query = JSON.parse(body); response.writeHead(200, { 'Content-Type': 'audio/wav' }); response.end(pcm); });
                } else {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(request.url.startsWith('/__voicevox_test/speakers')
                        ? [{ name: 'Fixture voice', speaker_uuid: 'fixture', styles: [{ id: 0, name: 'A', type: 'talk' }, { id: 1, name: 'B', type: 'talk' }] }]
                        : { accent_phrases: [], speedScale: 1, pitchScale: 0, volumeScale: 1 }));
                }
            } else if (mockEnabled && request.url === '/experimental_word_speech_input.js') {
                // Real microphone/CLI is checked by a separate live input run.
                response.writeHead(200, { 'Content-Type': 'application/javascript' });
                response.end(fs.readFileSync(path.resolve(__dirname, '../../experimental_word_speech_input.js'), 'utf8')
                    + '\nwindow.ExperimentalWordSpeechInput.create = () => window.SpeechRecognition;');
            } else if (mockEnabled && request.url.startsWith('/experimental_word_learning.html')) {
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
        await js(`document.querySelector('.chat-form textarea').value = '下書き'; document.querySelector('#word-microphone').click();
            window.__recognition.onresult({ results: [{ isFinal: false, 0: { transcript: '何をし' } }] }); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '下書き\n何をし');
        assert.equal(snapshot.state.serial, serial);
        await js(`window.__recognition.onresult({ results: [{ isFinal: false, 0: { transcript: '何をしている' } }] }); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '下書き\n何をしている');
        await js(`window.__recognition.onresult({ results: [{ isFinal: true, 0: { transcript: '何をしているの' } }] }); window.__recognition.onend(); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '下書き\n何をしているの');
        await js(`document.querySelector('#word-microphone').click(); window.__old = window.__recognition;
            document.querySelector('.chat-form textarea').value = '手で修正';
            document.querySelector('.chat-form textarea').dispatchEvent(new Event('input'));
            window.__old.onresult({ results: [{ isFinal: false, 0: { transcript: 'late' } }] }); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '手で修正');
        assert.equal(snapshot.state.serial, serial);
        await js(`document.querySelector('.chat-form textarea').value = ''; void 0`);
        checks.push({ liveDraftReplacesPrefixAndRespectsEditing: true });
        await js(`document.querySelector('#word-microphone').click();
            window.__recognition.onresult({ results: [{ isFinal: false, 0: { transcript: 'こんち' } }] });
            window.__recognition.onresult({ results: [{ isFinal: true, 0: { transcript: '[音楽]' } }] });
            window.__recognition.onend(); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), 'こんち');
        assert.ok(await js(`document.querySelector('#word-voice-status').textContent.includes('確定できませんでした')`));
        assert.equal(await js(`document.querySelector('#word-microphone').getAttribute('aria-pressed')`), 'false');
        assert.equal(snapshot.state.serial, serial);
        await js(`document.querySelector('.chat-form textarea').value = ''; document.querySelector('#word-microphone').click();
            window.__recognition.onresult({ results: [{ isFinal: true, 0: { transcript: '[音楽]' } }] }); window.__recognition.onend(); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '');
        assert.equal(snapshot.state.serial, serial);
        checks.push({ musicCannotOverwriteOrConfirmInterim: true });
        assert.equal(await js(`document.querySelector('#word-capture-processing').checked`), true);
        // Explicitly mocked recorder/model responses; exact audio transport and draft ownership are real.
        await js(`document.querySelector('#word-microphone').click();
            window.__recognition.onresult({ results: [{ isFinal: false, 0: { transcript: 'こんち' } }] });
            document.querySelector('#word-microphone').click(); void 0`);
        assert.equal(await js(`window.__recognition.finished && !window.__recognition.aborted`), true);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), 'こんち');
        await js(`window.__recording = window.ExperimentalWordSpeechInput.encodeWav(new Float32Array(16000).fill(.1), 16000);
            window.__recognition.onrecording({ wav: window.__recording, locale: 'ja-JP', limited: false,
                captureProcessing: window.__recognition.captureProcessing,
                captureSettings: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
            window.__recognition.onerror({ error: 'no-speech' }); window.__recognition.onend(); void 0`);
        assert.equal(await js(`document.querySelector('#word-recording-audio').src.startsWith('blob:')`), true);
        assert.equal(await js(`document.querySelector('#word-recording-check').open`), true);
        assert.equal(await js(`document.querySelector('#word-recording-mode').textContent`), '補正ありで録音');
        await js(`window.__beforeToggleURL = document.querySelector('#word-recording-audio').src;
            document.querySelector('#word-capture-processing').click(); void 0`);
        assert.equal(await js(`document.querySelector('#word-recording-audio').src === window.__beforeToggleURL`), true);
        assert.equal(await js(`document.querySelector('#word-recording-mode').textContent`), '補正ありで録音');
        assert.equal(await js(`(async () => (await fetch(document.querySelector('#word-recording-audio').src).then(r=>r.arrayBuffer())).byteLength)()`), 32044);
        await js(`document.querySelector('#word-comparison-profile').value = 'medium'; document.querySelector('#word-comparison-run').click(); void 0`);
        for (let i=0; i<30 && !(await js(`document.querySelector('#word-comparison-result').textContent.includes('こんにちは')`)); i++) await sleep(50);
        assert.equal(comparisonRequests.at(-1).profile, 'medium');
        assert.deepEqual(comparisonRequests.at(-1).wav, await js(`Array.from(window.__recording)`));
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), 'こんち');
        assert.equal(snapshot.state.serial, serial);
        await js(`document.querySelector('#word-comparison-apply').click(); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), 'こんにちは');
        await js(`document.querySelector('.chat-form textarea').value = '手で修正'; document.querySelector('.chat-form textarea').dispatchEvent(new Event('input'));
            document.querySelector('#word-comparison-apply').click(); void 0`);
        assert.equal(await js(`document.querySelector('.chat-form textarea').value`), '手で修正');
        for (const width of [1280, 390]) {
            window.setContentSize(width, 900); await sleep(100);
            assert.equal(await js(`document.documentElement.scrollWidth <= innerWidth + 1`), true);
            fs.writeFileSync(path.join(evidence, `recording-${width}.png`), (await window.webContents.capturePage()).toPNG());
        }
        await js(`window.GameI18n.setLanguage('en'); void 0`);
        assert.equal(await js(`document.querySelector('#word-recording-audio').hasAttribute('src')`), false);
        assert.equal(await js(`document.querySelector('#word-comparison-result').textContent`), '');
        await js(`window.GameI18n.setLanguage('ja'); document.querySelector('.chat-form textarea').value = ''; void 0`);
        checks.push({ manualFinishRetainsDraft: true, replayExactWav: true, sameAudioComparison: true,
            comparisonRequiresExplicitApply: true, editedInputPreserved: true, languageChangeClearsAudio: true, recordingViewports: 2 });
        await js(`document.querySelector('#word-microphone').click(); void 0`);
        assert.equal(await js(`window.__recognition.captureProcessing`), false);
        assert.equal(await js(`document.querySelector('#word-capture-processing').disabled`), true);
        await js(`window.__recognition.onrecording({ wav: window.__recording, locale: 'ja-JP', limited: false,
            captureProcessing: false, captureSettings: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            window.__recognition.onend(); void 0`);
        assert.equal(await js(`document.querySelector('#word-recording-mode').textContent`), '補正なしで録音');
        await js(`window.__recognition.onrecording({ wav: window.__recording, locale: 'ja-JP', captureProcessing: false,
            captureSettings: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } }); void 0`);
        assert.ok(await js(`document.querySelector('#word-recording-mode').textContent.includes('異なる補正設定')`));
        await js(`window.__recognition.onrecording({ wav: window.__recording, locale: 'ja-JP', captureProcessing: false }); void 0`);
        assert.ok(await js(`document.querySelector('#word-recording-mode').textContent.includes('不明')`));
        checks.push({ correctionDefaultOn: true, togglePreservesPreviousAudio: true, correctionOffNextCapture: true,
            correctionDisabledWhileActive: true, appliedMismatchAndUnknownDisclosed: true });
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
            document.querySelector('#word-voice-stop').click(); window.__old.onresult({results:[{isFinal:true,0:{transcript:'late'}}]}); void 0`);
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
            assert.equal(await js(`document.querySelector('#word-voice-species')`), null);
            assert.equal(await js(`/11種族|種族ごと/.test(document.querySelector('.word-meeting').textContent)`), false);
            {
                await js(`(() => { const voices = document.querySelector('#word-dialogue-voice'); voices.selectedIndex = 1; voices.dispatchEvent(new Event('change'));
                    const pitch = document.querySelector('#word-voice-pitch'), rate = document.querySelector('#word-voice-rate');
                    pitch.value = '1.25'; pitch.dispatchEvent(new Event('input')); rate.value = '.8'; rate.dispatchEvent(new Event('input'));
                    document.querySelector('.word-voice-sample button').click(); })(); void 0`);
                assert.equal(await js(`window.__spoken.at(-1).voice`), require('../../experimental_word_voice').locales[locale] + '-2');
                assert.equal(await js(`window.__spoken.at(-1).pitch`), 1.25); assert.equal(await js(`window.__spoken.at(-1).rate`), .8);
                await js(`document.querySelectorAll('.word-voice-sample button')[3].click(); void 0`);
                assert.equal(await js(`window.__spoken.at(-1).voice`), require('../../experimental_word_voice').locales[locale] + '-0');
                assert.equal(await js(`window.__spoken.at(-1).pitch`), 1); assert.equal(await js(`window.__spoken.at(-1).rate`), 1);
            }
            for (const width of [1280,390]) {
                window.setContentSize(width,900); await sleep(100);
                assert.ok(await js(`(() => { const r = document.querySelector('#word-voice-choice').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })()`));
                assert.equal(await js(`document.documentElement.scrollWidth <= innerWidth + 1`), true);
                assert.ok(await js(`(() => { const a = document.querySelector('.meeting-character').getBoundingClientRect(), b = document.querySelector('#word-voice-choice').getBoundingClientRect(); return innerWidth > 650 ? a.right <= b.left : a.bottom <= b.top; })()`));
                if (locale !== 'ja') assert.equal(await js(`/[\u3040-\u30ff]/u.test(document.querySelector('#word-voice-choice').textContent)`), false);
                if (['ja','de'].includes(locale)) {
                    await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(1200);
                    fs.writeFileSync(path.join(evidence, `voices-${locale}-${width}.png`), (await window.webContents.capturePage()).toPNG());
                }
            }
        }
        assert.equal(JSON.stringify(snapshot.state), beforeAudition);
        const profiles = await js(`localStorage.getItem('wordVoiceProfiles:v1')`);
        await js(`document.querySelector('#word-voice-continue').click(); void 0`);
        await load(true, true);
        await js(`GameI18n.setLanguage('ja'); document.querySelector('#word-voice-choose').click(); void 0`);
        assert.equal(await js(`document.querySelector('#word-voice-pitch').value`), '1.25');
        assert.equal(await js(`document.querySelector('#word-voice-rate').value`), '0.8');
        await js(`document.querySelector('#word-voice-continue').click(); document.querySelector('#word-read-aloud').click();
            document.querySelector('.chat-form textarea').value = 'おはよう'; document.querySelector('.chat-form').requestSubmit(); void 0`);
        assert.equal(await js(`window.__spoken.at(-1).voice`), 'ja-JP-2');
        assert.equal(await js(`window.__spoken.at(-1).pitch`), 1.25); assert.equal(await js(`window.__spoken.at(-1).rate`), .8);
        // Real Web Audio, with the HTTP provider replaced by a named fixture.
        const audioBefore = JSON.stringify(snapshot.state);
        assert.equal(audioRequests.length, 0);
        await js(`document.querySelector('#word-voice-choose').click();
            document.querySelector('#word-voice-source').value = 'voicevox'; document.querySelector('#word-voice-source').dispatchEvent(new Event('change')); void 0`);
        assert.equal(audioRequests.length, 0);
        await js(`document.querySelector('#word-voice-connect').click(); void 0`);
        for (let i=0; i<100 && await js(`document.querySelector('#word-dialogue-voice').options.length !== 2`); i++) await sleep(30);
        assert.equal(audioRequests.length, 1);
        await js(`document.querySelector('#word-dialogue-voice').selectedIndex = 1; document.querySelector('#word-dialogue-voice').dispatchEvent(new Event('change'));
            document.querySelector('#word-voice-effect').value = '.3'; document.querySelector('#word-voice-effect').dispatchEvent(new Event('input'));
            document.querySelector('.word-voice-sample button').click(); void 0`);
        for (let i=0; i<100 && (audioRequests.length < 3 || !audioRequests.at(-1).query); i++) await sleep(30);
        assert.equal(audioRequests.length, 3);
        assert.equal(audioRequests.at(-1).query.speedScale, .8);
        assert.equal(audioRequests.at(-1).query.volumeScale, 1);
        for (let i=0; i<100 && await js(`window.__audioStarted === 0`); i++) await sleep(30);
        assert.equal(await js(`window.__audioStarted`), 1);
        await js(`document.querySelector('#word-voice-choice > button:last-child').click(); void 0`);
        assert.ok(await js(`window.__audioStopped > 0`));
        assert.ok(await js(`document.querySelector('.word-voice-choice').textContent.includes('VOICEVOX:Fixture voice')`));
        const sourceSettings = await js(`localStorage.getItem('wordAudioSources:v1')`);
        await js(`document.querySelector('#word-voice-source').value = 'device'; document.querySelector('#word-voice-source').dispatchEvent(new Event('change'));
            document.querySelector('#word-voice-source').value = 'voicevox'; document.querySelector('#word-voice-source').dispatchEvent(new Event('change')); void 0`);
        assert.equal(await js(`document.querySelector('#word-dialogue-voice').selectedIndex`), 1);
        assert.equal(await js(`document.querySelector('#word-voice-effect').value`), '0.3');
        assert.equal(await js(`localStorage.getItem('wordAudioSources:v1')`), sourceSettings);
        for (const width of [1280,390]) {
            window.setContentSize(width,900);
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(1200);
            fs.writeFileSync(path.join(evidence, 'voicevox-'+width+'.png'), (await window.webContents.capturePage()).toPNG());
            assert.ok(await js(`document.querySelector('.word-meeting').scrollWidth <= document.querySelector('.word-meeting').clientWidth + 2`));
            await js(`document.querySelector('.word-meeting').scrollTop = document.querySelector('.word-meeting').scrollHeight; void 0`);
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(1200);
            assert.ok(await js(`document.querySelector('.word-meeting').scrollTop > 0`));
            fs.writeFileSync(path.join(evidence, 'voicevox-bottom-'+width+'.png'), (await window.webContents.capturePage()).toPNG());
            await js(`document.querySelector('.word-meeting').scrollTop = 0; void 0`);
        }
        assert.equal(JSON.stringify(snapshot.state), audioBefore);
        const dsp = await js(`(async () => {
            const summaries = [];
            for (const species of Object.keys(ExperimentalWordVoiceEffects.presets)) {
                const outputs = [];
                for (const amount of [0, .65]) {
                    const ctx = new OfflineAudioContext(1, 24000, 24000), facade = { state: 'running', destination: ctx.destination };
                    for (const key of ['createBufferSource','createGain','createDynamicsCompressor','createBiquadFilter','createOscillator','createDelay']) facade[key] = ctx[key].bind(ctx);
                    const fx = ExperimentalWordVoiceEffects.create({ AudioContext: function () { return facade; } });
                    await fx.prepare();
                    const buffer = ctx.createBuffer(1, 4800, 24000), samples = buffer.getChannelData(0);
                    for (let i=0;i<samples.length;i++) samples[i] = .1 * Math.sin(i * 2 * Math.PI * 440 / 24000);
                    fx.play(buffer, { species, amount, volume: 1 });
                    const rendered = await ctx.startRendering(); outputs.push(Array.from(rendered.getChannelData(0))); fx.stop();
                }
                const difference = outputs[0].reduce((n, x, i) => n + Math.abs(x - outputs[1][i]), 0);
                const peak = Math.max(...outputs[1].map(Math.abs));
                summaries.push({ species, difference, peak, finite: outputs[1].every(Number.isFinite) });
            }
            return summaries;
        })()`);
        assert.equal(dsp.length, 11);
        for (const row of dsp) { assert.ok(row.difference > 1, JSON.stringify(row)); assert.ok(row.finite); assert.ok(row.peak < 1); }
        checks.push({ localHttpFixture: true, actualWebAudioPlaybackAndStop: true, actualWebAudioOffline: dsp, sourceRoundTrip: true, audioPreviewDoesNotMutate: true });
        await js(`document.querySelector('#word-voice-source').value = 'device'; document.querySelector('#word-voice-source').dispatchEvent(new Event('change'));
            document.querySelector('#word-voice-continue').click(); void 0`);
        // Public question flow reveals only the chosen child; voice tuning shares its signature screen.
        nextLoad = null; await window.loadURL(url); await sleep(450);
        assert.equal(await js(`localStorage.getItem('wordVoiceProfiles:v1')`), profiles);
        await js(`GameI18n.setLanguage('ja'); void 0`);
        for (let i=0;i<7;i++) {
            assert.equal(await js(`document.querySelector('.word-meeting').open`), false);
            await js(`document.querySelector('.word-questions fieldset button[data-answer="0"]').click(); void 0`);
        }
        assert.equal(await js(`document.querySelector('.word-meeting').open && document.querySelector('#word-voice-choice').checkVisibility()`), true);
        assert.equal(await js(`document.querySelector('#word-voice-species')`), null);
        await js(`document.querySelector('.word-meeting').requestClose(); void 0`);
        assert.equal(await js(`document.querySelector('.word-meeting').open && document.querySelector('#word-meeting-begin').disabled`), true);
        for (const width of [1280,390]) {
            window.setContentSize(width, 900);
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(1200);
            fs.writeFileSync(path.join(evidence, 'meeting-'+width+'.png'), (await window.webContents.capturePage()).toPNG());
        }
        checks.push({ chosenChildOnly: true, pitchAndRateBySevenLanguages: true, narratorUntuned: true, separateNarrator: true, previewDoesNotMutate: true,
            preferencesSurviveReload: true, actualDialogueUsesTuning: true, questionsThenMeetingWithVoiceAndSignature: true, voiceViewports: 2 });
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
