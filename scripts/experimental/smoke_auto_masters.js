'use strict';
const assert = require('node:assert/strict');
const storage = require('./storage');

// Uses smoke_island's disposable profile, production UI/preload and actual world arrivals.
module.exports = async ({ js, window, url, paintClock, sleep, read, load, base }) => {
    const wait = async (condition, label, limit = 500) => {
        for (let i = 0; i < limit; i++) { if (await js(condition)) return; await sleep(50); }
        throw new Error('Timed out: ' + label);
    };
    for (const scenario of ['movie', 'fallback', 'delayed-output', 'silent', 'failed-output', 'stopped', 'hidden', 'manual']) {
        const fixture = structuredClone(base), w = fixture.world, id = scenario === 'fallback' ? 'farming' : 'explore';
        const target = `master:${id}`, place = w.island.places.find(p => p.id === target);
        Object.assign(w, { x: place.x, y: place.y, mode: 'move', destination: target, attention: null,
            route: [{ x: place.x, y: place.y }], pause: 0, hunger: .1, fatigue: .1 });
        w.careers = { version: 1, people: {}, current: null };
        if (!['movie', 'fallback'].includes(scenario)) w.careers.people[id] = {
            metAt: 0, visits: 1, observed: 0, completed: 0, interest: 0, learning: false, outcomes: []
        };
        assert.ok(storage.valid(fixture));
        await window.loadURL('about:blank'); load(fixture);
        await window.loadURL(url); await paintClock();
        await wait('!!document.querySelector("#word-new-game:not(:disabled)")', 'bootstrap');
        await js(`(() => {
            const original = window.fetch.bind(window);
            window.autoMasterAudio = [];
            const nativeStart = AudioBufferSourceNode.prototype.start;
            AudioBufferSourceNode.prototype.start = function(...args) {
                window.autoMasterAudio.push({ at: performance.now(), phase: document.querySelector('#word-master-dialog').dataset.phase });
                return nativeStart.apply(this, args);
            };
            const pcm = new ArrayBuffer(44 + 60000 * 2), view = new DataView(pcm);
            const word = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
            word(0, 'RIFF'); view.setUint32(4, pcm.byteLength - 8, true); word(8, 'WAVEfmt ');
            view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
            view.setUint32(24, 24000, true); view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
            word(36, 'data'); view.setUint32(40, pcm.byteLength - 44, true);
            window.fetch = (url, options) => {
                if (url === 'experimental_word_encounter_videos.json') return new Promise(resolve => setTimeout(() =>
                    resolve(Response.json(${JSON.stringify(scenario)} === 'fallback' ? [] : ['assets/videos/unused.mp4'])), 700));
                if (typeof url !== 'string' || !url.startsWith('http://127.0.0.1:50021/')) return original(url, options);
                const endpoint = new URL(url);
                if (${JSON.stringify(scenario)} === 'failed-output') return Promise.reject(new Error('Test unavailable VOICEVOX'));
                const response = endpoint.pathname === '/speakers'
                    ? Response.json(Object.values(ExperimentalWordVoice.cast).map(p => ({name: p.credit, speaker_uuid: p.speaker,
                        styles: [{ id: p.styleId, name: 'Normal', type: 'streaming_talk' }]})))
                    : endpoint.pathname === '/audio_query' ? Response.json({accent_phrases: []})
                    : new Response(pcm.slice(0), {headers: {'Content-Type': 'audio/wav'}});
                return new Promise(resolve => setTimeout(() => resolve(response),
                    ${JSON.stringify(scenario)} === 'delayed-output' && endpoint.pathname === '/synthesis' ? 5000 : 0));
            };
            if (${JSON.stringify(scenario)} === 'movie') {
                const movie = ExperimentalWordCareers.VIDEOS.explore;
                const fetchFixture = window.fetch;
                window.fetch = (url, options) => url === 'experimental_word_encounter_videos.json'
                    ? new Promise(resolve => setTimeout(() => resolve(Response.json([movie])), 700)) : fetchFixture(url, options);
                HTMLMediaElement.prototype.play = function() { return Promise.resolve(); };
            }
            const toggle = document.querySelector('#word-read-aloud'); toggle.checked = ${JSON.stringify(scenario)} !== 'silent'; toggle.dispatchEvent(new Event('change'));
        })()`);
        await js(`(async () => { await window.smokeBeginSession();
            if (${JSON.stringify(scenario)} !== 'manual') document.querySelector('#word-auto-toggle').click(); })()`);
        await wait('document.querySelector("#word-master-dialog").open', 'arrival');
        if (scenario === 'movie') {
            assert.equal(await js('document.querySelector("#word-master-dialog").dataset.phase'), 'loading');
            await wait('document.querySelector("#word-master-dialog").dataset.phase === "video"', 'movie');
            await sleep(1200);
            assert.equal(await js('window.autoMasterAudio.length'), 0, 'movie has no narration');
            assert.equal(await js('document.querySelector("#word-master-dialog").dataset.phase'), 'video', 'auto never skips movie');
            await js('document.querySelector(".word-master-video").dispatchEvent(new Event("ended")); void 0');
        }
        if (scenario === 'fallback') {
            await wait('document.querySelector("#word-master-dialog").dataset.phase === "silhouette"', 'fallback');
            await wait('document.querySelector("#word-master-dialog").dataset.phase === "conversation"', 'automatic reveal');
        } else await wait('document.querySelector("#word-master-dialog").dataset.phase === "conversation"', 'conversation');
        await js('dispatchEvent(new Event("beforeunload"))');
        const frozen = structuredClone(read().world), started = Date.now();
        if (scenario === 'delayed-output') {
            await sleep(8500);
            assert.equal(await js('document.querySelector("#word-master-dialog").open'), true, 'slow synthesis outlasts text timer without dismissal');
        }
        if (scenario === 'hidden') {
            await js('Object.defineProperty(document, "hidden", {configurable:true, get:()=>true}); document.dispatchEvent(new Event("visibilitychange")); void 0');
            await sleep(8000);
            assert.equal(await js('document.querySelector("#word-master-dialog").open'), true, 'hidden screen never advances');
            await js('Object.defineProperty(document, "hidden", {configurable:true, get:()=>false}); document.dispatchEvent(new Event("visibilitychange")); void 0');
            await sleep(150);
            assert.equal(await js('document.querySelector("#word-master-dialog").open'), true, 'background gap is not reading time');
        }
        if (scenario === 'stopped') await js('document.querySelector("#word-auto-toggle").click()');
        if (['manual', 'stopped'].includes(scenario)) {
            await sleep(9000);
            assert.equal(await js('document.querySelector("#word-master-dialog").open'), true, 'manual or stopped auto needs acknowledgement');
            await js('document.querySelector("#word-master-close").click()');
        } else {
            await sleep(500);
            assert.equal(await js('document.querySelector("#word-master-dialog").open'), true, 'text remains visible');
            await js('dispatchEvent(new Event("beforeunload"))');
            assert.deepEqual(read().world, frozen, 'life remains frozen during conversation');
            await wait('!document.querySelector("#word-master-dialog").open', 'automatic acknowledgement');
            assert.ok(Date.now() - started >= 3500, 'not an instant dismissal');
            const audio = await js('window.autoMasterAudio');
            if (['movie', 'fallback', 'delayed-output'].includes(scenario)) {
                assert.ok(audio.length >= (scenario === 'fallback' ? 3 : 2), 'master and gesture both play');
                assert.ok(await js('performance.now() - window.autoMasterAudio.at(-1).at >= 3400'), 'waits for final 2.5-second audio and grace');
            }
            if (scenario === 'silent') assert.equal(audio.length, 0, 'disabled read-aloud still advances using text time');
            assert.equal(await js('document.querySelector("#word-auto-toggle").getAttribute("aria-pressed")'), 'true', 'auto stays active');
        }
        await sleep(250); await js('dispatchEvent(new Event("beforeunload"))');
        assert.ok(read().world.elapsed > frozen.elapsed, 'world resumes after acknowledgement');
        assert.deepEqual(read().state.knowledge, fixture.state.knowledge, 'acknowledgement grants no knowledge');
        console.log('Automatic master dialog passed: ' + scenario);
    }
};
