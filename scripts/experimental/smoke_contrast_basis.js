'use strict';
// Normal renderer chat and isolated saves. Only start settings are varied;
// no acquired knowledge or testimony is inserted into the test profile.
module.exports = async function ({ js, window, url, paintClock, sleep, read, load }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const core = require('../../experimental_word_learning_core');
    const catalog = require('../../experimental_word_learning_catalog.json');
    const { valid } = require('./storage');
    const form = catalog.feelingContrast.ja, text = form.past + form.join + form.present;
    const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
    const sync = () => js('window.dispatchEvent(new Event("beforeunload"))');
    const resume = async value => {
        if (value) load(value);
        await window.loadURL(url); await paintClock(); await sleep(600);
        await js('document.querySelector("#app > form").requestSubmit()'); await sleep(100);
        await sync(); assert.ok(valid(read()));
        assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
    };
    const baseline = structuredClone(read());
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        const value = structuredClone(baseline);
        value.state = core.create({ foundation, life, speech }, catalog);
        await resume(value);
        const before = JSON.stringify(read().state.knowledge);
        for (let repeat = 0; repeat < 2; repeat++) {
            await chat(text); await sync();
            const parts = read().state.context.turns.at(-1).understandings;
            assert.equal(parts.length, 2);
            assert.deepEqual(parts.map(u => u.subject), foundation ? ['player', 'player'] : [null, null]);
            assert.deepEqual(parts.map(u => u.eventTime), foundation ? ['yesterday', 'now'] : ['unspecified', 'unspecified']);
            assert.ok(parts.every(u => u.complete === (foundation && life)));
            assert.ok(parts.every(u => u.clauseSource.input.raw === text));
            assert.equal(JSON.stringify(read().state.knowledge), before);
            assert.ok(valid(read()));
        }
        const retained = JSON.stringify(read().state.context.turns);
        await resume();
        assert.equal(JSON.stringify(read().state.context.turns), retained);
        assert.equal(JSON.stringify(read().state.knowledge), before);
        assert.deepEqual(read().state.experiences, baseline.state.experiences);
    }
    await chat(text); await sync();
    assert.ok(await js(`document.querySelector('#conversation').textContent.includes(${JSON.stringify(text)})`));
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.ok(await js('audioManager.currentAudio?.readyState >= 2'));
    assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
    await sleep(1200);
    const screenshot = path.resolve(__dirname, '../../tests/word-contrast-basis-smoke.png');
    fs.writeFileSync(screenshot, (await window.webContents.capturePage()).toPNG());
    console.log(JSON.stringify({ eightStarts: true, saves: true, screenshot }));
};
