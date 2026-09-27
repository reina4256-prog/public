'use strict';
// Normal renderer submissions and isolated disk saves; never edits player data.
module.exports = async function ({ js, window, url, paintClock, sleep, read, load }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const core = require('../../experimental_word_learning_core');
    const catalog = require('../../experimental_word_learning_catalog.json');
    const { valid } = require('./storage');
    const p = catalog.feelingContrast.ja, f = catalog.feelingTeaching.ja, full = p.past + p.join + p.present;
    const texts = [full, `${f.source}«${full}»`, `${f.sad}«${p.past}»`, `${f.happy}«${p.present}»`,
        `${f.report}«${p.past}»`, `${f.report}«${p.present}»`, `${f.yesterday}«${p.past}»`, `${f.now}«${p.present}»`];
    const chat = async text => {
        for (let i = 0; i < 10 && await js('document.hidden'); i++) {
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
            await sleep(100);
        }
        assert.equal(await js('document.hidden'), false, 'renderer must be awake before input');
        const before = read().state.serial;
        await js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
        assert.equal(read().state.serial, before + 1, JSON.stringify(await js('({hidden:document.hidden, input:document.querySelector(".chat-form textarea").value, playing:document.querySelector("#app").classList.contains("playing"), page:document.body.textContent.slice(-400)})')));
    };
    const sync = () => js('window.dispatchEvent(new Event("beforeunload"))');
    const resume = async value => {
        if (value) load(value);
        await window.loadURL(url); await paintClock();
        for (let i = 0; i < 100; i++) {
            if (await js('!!document.querySelector("#app > form button:not(:disabled)")')) break;
            await sleep(100);
        }
        await js('document.querySelector("#app > form").requestSubmit()'); await sleep(100);
        await sync(); assert.ok(valid(read()));
        assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
    };
    const baseline = structuredClone(read());
    for (const foundation of [true, false]) for (const life of [true, false]) for (const speech of ['gesture', 'short']) {
        const value = structuredClone(baseline);
        value.state = core.create({ foundation, life, speech }, catalog);
        await resume(value);
        const before = JSON.stringify(read().state.knowledge);
        for (let step = 0; step < texts.length; step++) {
            await chat(texts[step]); await sync();
            assert.ok(valid(read()), `step ${step}`);
                if (step) assert.equal(read().state.feelingLearning.events.length, step,
                    JSON.stringify({ foundation, life, speech, step, state: read().state.context, last: read().state.feelingLearning.events.at(-1) }));
            if ([2, 4, 5, 7].includes(step)) {
                const retained = JSON.stringify(read().state.feelingLearning);
                await resume();
                assert.equal(JSON.stringify(read().state.feelingLearning), retained);
            }
        }
        const retained = JSON.stringify(read().state.feelingLearning);
        await chat(texts[2]); await chat(texts[7]); await sync();
        assert.equal(JSON.stringify(read().state.feelingLearning), retained);
        await chat(full); await sync();
        const parts = read().state.context.turns.at(-1).understandings;
        assert.deepEqual(parts.map(u => u.known.meaning), ['sad', 'happy']);
        assert.deepEqual(parts.map(u => u.subject), ['player', 'player']);
        assert.deepEqual(parts.map(u => u.eventTime), ['yesterday', 'now']);
        assert.ok(parts.every(u => u.complete === foundation && u.testimony.verified === false));
        assert.equal(JSON.stringify(read().state.knowledge), before);
        assert.deepEqual(read().state.experiences, baseline.state.experiences);
        assert.ok(valid(read()));
        await js('document.querySelector("button[aria-controls=notebook]").click()');
        assert.ok(await js(`document.querySelector('#notebook').textContent.includes(${JSON.stringify(texts[7])})`));
    }
    await js(`Array.from(document.querySelectorAll('#notebook .note-card')).find(card => card.textContent.includes(${JSON.stringify(texts[7])})).scrollIntoView({block:'start'}); void 0`);
    window.setSize(1320, 850); await sleep(600);
    await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
    await sleep(600);
    const screenshot = path.resolve(__dirname, '../../tests/word-feelings-smoke.png');
    fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    await js('document.querySelector("button[aria-controls=conversation]").click()');
    await chat(full); await sync();
    await js('document.querySelector("#conversation").scrollTop = document.querySelector("#conversation").scrollHeight');
    window.setSize(1340, 850); await sleep(600);
    await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
    await sleep(600);
    const conversationScreenshot = path.resolve(__dirname, '../../tests/word-feelings-conversation-smoke.png');
    fs.writeFileSync(conversationScreenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.ok(await js('audioManager.currentAudio?.readyState >= 2'));
    assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
    console.log(JSON.stringify({ eightStarts: true, stagedRestarts: true, screenshot, conversationScreenshot }));
};
