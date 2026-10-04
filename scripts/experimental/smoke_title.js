'use strict';
// Real title/reset/continue regression in smoke_island's dedicated temporary profile.
module.exports = async function ({ js, window, url, paintClock, sleep, directory, read }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const { valid } = require('./storage');
    const waitReady = async () => {
        for (let i = 0; i < 100; i++) {
            if (await js('!document.querySelector("#word-new-game").disabled')) return;
            await sleep(100);
        }
        assert.fail('title initialization timed out');
    };
    const reload = async () => { await window.loadURL(url); await paintClock(); await waitReady(); };
    const click = selector => js(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const capture = async name => {
        // First capture wakes the hidden compositor; capture its subsequent paint.
        await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
        await sleep(1200);
        fs.writeFileSync(path.resolve(__dirname, '../../tests/' + name),
            (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    };
    const saved = () => JSON.parse(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'));
    await waitReady();
    assert.equal(await js('document.querySelector(".game-header").checkVisibility()'), false);
    const bounds = await js('(()=>{const r=document.querySelector(".word-title").getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight}})()');
    assert.ok(bounds.x === 0 && bounds.y === 0 && Math.abs(bounds.width - bounds.viewportWidth) < 1
        && Math.abs(bounds.height - bounds.viewportHeight) < 1, JSON.stringify(bounds));
    assert.equal(await js('document.querySelector("#app > form").checkVisibility()'), false);
    assert.equal(fs.existsSync(path.join(directory, 'word-life.json')), false);
    await capture('word-logo-smoke.png');
    await click('.word-logo');
    assert.equal(await js('document.querySelector(".game-header").checkVisibility()'), false);
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    for (let i = 0; i < 50 && !await js('audioManager.currentAudio?.readyState >= 2'); i++) await sleep(100);
    assert.ok(await js('audioManager.currentAudio?.src.endsWith("bgm_title_main.mp3") && audioManager.currentAudio.readyState >= 2'));
    await capture('word-title-smoke.png');
    await click('#word-new-game');
    assert.equal(await js('document.querySelector("dialog").open && document.activeElement.id === "word-reset-cancel"'), true);
    await click('#word-reset-cancel');
    assert.equal(fs.existsSync(path.join(directory, 'word-life.json')), false);
    await click('#word-new-game'); await click('#word-reset-accept');
    assert.equal(await js('document.querySelector(".game-header").checkVisibility()'), true);
    assert.deepEqual(saved(), { version: 1, pendingNewGame: true, volume: .5 });
    assert.ok(valid(saved()));
    await click('#app > form button[type="button"]');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await reload(); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await click('#word-new-game'); await click('#word-reset-accept');
    await js('document.querySelector("#app > form select").value="spirit"; document.querySelector("#app > form").requestSubmit()');
    await js('document.querySelector(".chat-form textarea").value="hello"; document.querySelector(".chat-form").requestSubmit()');
    await js('document.querySelector(".scene-controls > button").click()');
    await js('const v=document.querySelector(".volume-control input"); v.value=".25"; v.dispatchEvent(new Event("input")); GameI18n.setLanguage("de"); window.dispatchEvent(new Event("beforeunload"));');
    const before = structuredClone(saved());
    assert.equal(before.appearance, 'spirit'); assert.equal(before.world.island.volume, .25);
    assert.ok(before.state.context.turns.length > 0);
    await reload(); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), false);
    await click('#word-new-game');
    // Native close request uses the dialog's cancel path (as Escape does).
    await js('document.querySelector("dialog").requestClose()'); await sleep(100);
    assert.equal(await js('document.querySelector("dialog").open'), false);
    assert.deepEqual(saved(), before);
    await click('#word-continue');
    assert.equal(await js('document.querySelector(".game-header").checkVisibility()'), true);
    const resumed = read();
    assert.deepEqual(resumed.state.records, before.state.records);
    assert.deepEqual(resumed.state.notes, before.state.notes);
    assert.deepEqual(resumed.world.experiences, before.world.experiences);
    assert.deepEqual(resumed.world.island.assets, before.world.island.assets);
    assert.equal(resumed.appearance, 'spirit'); assert.equal(resumed.world.island.volume, .25);
    await reload(); await click('.word-logo');
    for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
        await js(`GameI18n.setLanguage(${JSON.stringify(locale)})`); await sleep(50);
        await click('#word-new-game');
        assert.ok(await js('Array.from(document.querySelectorAll("dialog button")).every(b => b.getBoundingClientRect().bottom < innerHeight)'));
        await click('#word-reset-cancel');
    }
    await window.setSize(760, 600); await sleep(100);
    await click('#word-new-game'); await capture('word-reset-smoke.png');
    assert.ok(await js('document.querySelector("dialog").getBoundingClientRect().right <= innerWidth'));
    await click('#word-reset-accept');
    assert.deepEqual(saved(), { version: 1, pendingNewGame: true, volume: .25 });
    await reload(); await click('.word-logo');
    assert.equal(await js('GameI18n.language'), 'de');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await click('#word-new-game'); await click('#word-reset-accept');
    await js('document.querySelector("#app > form").requestSubmit()');
    const fresh = read();
    assert.equal(fresh.appearance, 'robot'); assert.equal(fresh.state.context.turns.length, 0);
    assert.equal(fresh.state.records.length, 0); assert.equal(fresh.state.notes.length, 0);
    assert.equal(fresh.world.experiences.length, 0); assert.equal(fresh.world.island.volume, .25);
    assert.notDeepEqual(fresh.world.island.assets, before.world.island.assets);
    assert.ok(valid(fresh));
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.equal(await js('localStorage.getItem("ai_pet_data_v1") || localStorage.getItem("ai_pet_data")'), null);
    // Hiding the header must not hide the reason a failed save cannot be resumed.
    fs.writeFileSync(path.join(directory, 'word-life.json'), '{invalid', 'utf8');
    await window.loadURL(url); await paintClock(); await sleep(800); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-new-game").disabled && document.querySelector("#word-continue").disabled'), true);
    assert.equal(await js('document.querySelector(".word-title-error").checkVisibility()'), true);
    assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), '{invalid');
};
