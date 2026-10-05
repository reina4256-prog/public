'use strict';
// Real title/reset/continue regression in smoke_island's dedicated temporary profile.
module.exports = async function ({ js, window, url, paintClock, sleep, directory, read }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const { valid } = require('./storage');
    const questions = require('../../experimental_word_start_questions');
    const waitReady = async () => {
        for (let i = 0; i < 100; i++) {
            if (await js('!document.querySelector("#word-new-game").disabled')) return;
            await sleep(100);
        }
        assert.fail('title initialization timed out');
    };
    const reload = async () => { await window.loadURL(url); await paintClock(); await waitReady(); };
    const click = selector => js(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const sign = async () => {
        assert.equal(await js('document.querySelector("#word-meeting-begin").disabled'), true);
        await js('document.querySelector("#word-signature").scrollIntoView({block:"center"})');
        await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
        await sleep(350);
        const r = await js('(()=>{const r=document.querySelector("#word-signature").getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}})()');
        // CDP delivers trusted browser input even while this dedicated window is hidden.
        window.webContents.debugger.attach('1.3');
        try {
            await window.webContents.debugger.sendCommand('Emulation.setFocusEmulationEnabled',{enabled:true});
            for (const [type,x,y] of [['mousePressed',.2,.6],['mouseMoved',.35,.25],['mouseMoved',.55,.7],['mouseReleased',.55,.7]]) {
                await window.webContents.debugger.sendCommand('Input.dispatchMouseEvent', {
                    type,button:'left',buttons:type === 'mouseReleased' ? 0 : 1,clickCount:1,x:r.x+r.width*x,y:r.y+r.height*y
                });
                await sleep(50);
            }
        } finally { window.webContents.debugger.detach(); }
        await sleep(50);
        if (await js('document.querySelector("#word-meeting-begin").disabled')) {
            await capture('word-signature-failure.png');
            assert.fail(JSON.stringify({r,hit:await js(`document.elementFromPoint(${r.x+r.width*.2},${r.y+r.height*.6})?.id`)}));
        }
    };
    const waitStarted = async () => {
        for (let i = 0; i < 40; i++) {
            if (await js('document.querySelector("#app").classList.contains("playing")')) return;
            await sleep(100);
        }
        assert.fail('signature confirmation did not start the session');
    };
    const touchSign = async () => {
        const r = await js('(()=>{const r=document.querySelector("#word-signature").getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}})()');
        window.webContents.debugger.attach('1.3');
        try {
            for (const [type,x,y] of [['touchStart',.65,.6],['touchMove',.8,.3],['touchEnd',0,0]]) {
                await window.webContents.debugger.sendCommand('Input.dispatchTouchEvent', {
                    type, touchPoints: type === 'touchEnd' ? [] : [{x:r.x+r.width*x,y:r.y+r.height*y,id:1}]
                });
            }
        } finally { window.webContents.debugger.detach(); }
        assert.equal(await js('document.querySelector("#word-meeting-begin").disabled'), false);
    };
    const confirmSignature = async () => {
        await sign(); await click('#word-meeting-begin'); await waitStarted();
    };
    const chooseAppearance = async (answers, skin) => {
        const pool=questions.appearanceWeights(answers), total=pool.reduce((sum,item)=>sum+item.weight,0);
        const index=pool.findIndex(item=>item.id===skin);
        const draw=(pool.slice(0,index).reduce((sum,item)=>sum+item.weight,0)+pool[index].weight/2)/total;
        await js(`window.originalStartRandom=Math.random;Math.random=()=>${draw};void 0`);
    };
    const restoreRandom = () => js('Math.random=window.originalStartRandom;void 0');
    const answerQuestions = async (answers, skin) => {
        await chooseAppearance(answers,skin);
        for (const answer of answers) {
            await click(`.word-questions fieldset button[data-answer="${answer}"]`);
        }
        assert.equal(await js('document.querySelector(".word-meeting").open'), true);
        const before = structuredClone(saved());
        assert.equal(before.pendingNewGame, true);
        assert.equal(await js('document.querySelector(".living-space").checkVisibility()'), false);
        await js('document.querySelector(".word-meeting").requestClose()');
        assert.equal(await js('document.querySelector(".word-meeting").open'), true);
        await sleep(500);
        await js('window.dispatchEvent(new Event("beforeunload"))');
        assert.deepEqual(saved(), before);
        await click('#word-meeting-retry');
        assert.equal(await js('document.querySelector(".question-count").textContent'), '1 / 7');
        assert.deepEqual(saved(), before);
        for (const answer of answers) await click(`fieldset button[data-answer="${answer}"]`);
        await restoreRandom();
        await confirmSignature();
        assert.deepEqual(read().state.startOrigin.answers, answers);
    };
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
    assert.equal(await js('document.querySelector("#word-reset-dialog").open && document.activeElement.id === "word-reset-cancel"'), true);
    await click('#word-reset-cancel');
    assert.equal(fs.existsSync(path.join(directory, 'word-life.json')), false);
    await click('#word-new-game'); await click('#word-reset-accept');
    assert.equal(await js('document.querySelector(".game-header").checkVisibility()'), false);
    assert.equal(await js('audioManager.currentBGMType'), 'personality');
    assert.deepEqual(saved(), { version: 1, pendingNewGame: true, volume: .5 });
    assert.ok(valid(saved()));
    await js('Array.from(document.querySelectorAll("#app > form > button")).at(-1).click()');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await reload(); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await click('#word-new-game'); await click('#word-reset-accept');
    await answerQuestions([2,2,2,2,0,0,0], 'spirit');
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
    await js('document.querySelector("#word-reset-dialog").requestClose()'); await sleep(100);
    assert.equal(await js('document.querySelector("#word-reset-dialog").open'), false);
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
        assert.ok(await js('Array.from(document.querySelectorAll("#word-reset-dialog button")).every(b => b.getBoundingClientRect().bottom < innerHeight)'));
        await click('#word-reset-cancel');
    }
    await window.setSize(760, 600); await sleep(100);
    await click('#word-new-game'); await capture('word-reset-smoke.png');
    assert.ok(await js('document.querySelector("#word-reset-dialog").getBoundingClientRect().right <= innerWidth'));
    await click('#word-reset-accept');
    assert.deepEqual(saved(), { version: 1, pendingNewGame: true, volume: .25 });
    await reload(); await click('.word-logo');
    assert.equal(await js('GameI18n.language'), 'de');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    await click('#word-new-game'); await click('#word-reset-accept');
    await answerQuestions([0,1,1,1,0,0,0], 'robot');
    const fresh = read();
    assert.equal(fresh.appearance, 'robot'); assert.equal(fresh.state.context.turns.length, 0);
    assert.equal(fresh.state.records.length, 0); assert.equal(fresh.state.notes.length, 0);
    assert.equal(fresh.world.experiences.length, 0); assert.equal(fresh.world.island.volume, .25);
    assert.notDeepEqual(fresh.world.island.assets, before.world.island.assets);
    assert.ok(valid(fresh));
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.equal(await js('localStorage.getItem("ai_pet_data_v1") || localStorage.getItem("ai_pet_data")'), null);
    // Actual public controls: eight independent starts, all seven display languages,
    // unanswered guards, signature gate, meeting freeze, and restart provenance.
    const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de', 'ja'];
    const skins = new Set();
    for (let i = 0; i < locales.length; i++) {
        await reload(); await click('.word-logo');
        if (i === 7) { await window.setSize(1180, 800); await sleep(100); }
        await js(`GameI18n.setLanguage(${JSON.stringify(locales[i])})`);
        await click('#word-new-game'); await click('#word-reset-accept'); await sleep(80);
        assert.equal(await js('document.querySelector(".word-questions > button:not([type])").disabled'), true);
        await js('document.querySelector(".word-questions").requestSubmit()');
        assert.equal(read()?.pendingNewGame, true);
        assert.equal(await js('Array.from(document.querySelectorAll(".word-questions select")).every(e=>!e.checkVisibility())'), true);
        const answers = [i % 3, i & 1 ? 1 : 0, i % 3, i % 3, i % 3, i & 2 ? 0 : 1, i & 4 ? 0 : 1];
        if (i === 5) answers.splice(0, 5, 2, 2, 2, 2, 0);
        assert.equal(await js('document.querySelector(".word-questions h2")'), null);
        assert.equal(await js('document.querySelectorAll(".word-questions > button[type=button]").length'), 1);
        const text = await js('document.querySelector("fieldset legend").textContent');
        const translated = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../locales/' + locales[i] + '.json'), 'utf8'));
        assert.equal(text, translated[questions.questions[0].text]);
        if (i === 6) await capture('word-start-questions-smoke.png');
        if (i === 7) await capture('word-document-questions-smoke.png');
        // Meeting screenshot is captured before dismissing it.
        await chooseAppearance(answers,['robot','seed','spirit'][i%3]);
        for (const answer of answers) {
            await click(`fieldset button[data-answer="${answer}"]`);
        }
        const pending = structuredClone(saved()); assert.equal(pending.pendingNewGame, true);
        await restoreRandom();
        // Empty cannot start; erasing affects only the signature and keeps the partner.
        await click('#word-meeting-begin'); assert.deepEqual(saved(), pending);
        await sign(); await click('#word-signature-clear');
        assert.equal(await js('document.querySelector("#word-meeting-begin").disabled'), true);
        assert.deepEqual(saved(), pending);
        await sign();
        if (i === 0) await touchSign(); // a second stroke preserves the mouse signature
        if (i === 6) await capture('word-meeting-smoke.png');
        if (i === 7) await capture('word-document-signature-smoke.png');
        await sleep(100); await js('window.dispatchEvent(new Event("beforeunload"))');
        assert.deepEqual(saved(), pending);
        assert.equal(await js('document.querySelector("#word-meeting-begin").getBoundingClientRect().bottom <= innerHeight'), true);
        await click('#word-meeting-begin');
        await click('#word-meeting-begin'); // repeated confirmation is ignored
        await waitStarted();
        const started = structuredClone(read()), expected = questions.resolve(answers, started.state.startOrigin.draw);
        assert.deepEqual(started.state.settings, expected.settings);
        assert.equal(started.appearance, expected.appearance); skins.add(started.appearance);
        assert.ok(valid(started));
        await reload(); await click('.word-logo'); await click('#word-continue');
        assert.deepEqual(read().state.startOrigin, started.state.startOrigin);
        assert.deepEqual(read().state.settings, expected.settings);
        assert.equal(await js('document.querySelector(".word-meeting").open'), false);
    }
    assert.equal(skins.size, 3);
    // Every base species uses the public questions/signature path, then resumes
    // the same child and island in this temporary profile. No player save is used.
    for (const [i,skin] of questions.appearances.entries()) {
        await reload(); await click('.word-logo');
        await js(`GameI18n.setLanguage(${JSON.stringify(locales[i%7])})`);
        await click('#word-new-game'); await click('#word-reset-accept');
        const answers=[i%3,i&1?1:0,1,2,0,i&2?0:1,i&4?0:1];
        await chooseAppearance(answers,skin);
        for(const answer of answers) await click(`fieldset button[data-answer="${answer}"]`);
        await restoreRandom();
        assert.equal(await js('document.querySelector(".word-questions select").value'),skin);
        await confirmSignature();
        for(let j=0;j<60 && !await js(`images[${JSON.stringify(skin)}]?.complete && images[${JSON.stringify(skin)}]?.naturalWidth && audioManager.currentAudio?.readyState>=2`);j++) await sleep(100);
        assert.equal(await js(`images[${JSON.stringify(skin)}].naturalWidth>0 && aiPet.baseType===${JSON.stringify(skin)} && audioManager.currentAudio.src.endsWith(${JSON.stringify('bgm_'+skin+'.mp3')})`),true);
        const started=structuredClone(read());
        assert.equal(started.appearance,skin); assert.equal(started.state.startOrigin.version,3); assert.ok(valid(started));
        if(skin==='dragon') await capture('word-dragon-living-smoke.png');
        await reload(); await click('.word-logo'); await click('#word-continue');
        assert.equal(read().appearance,skin);
        assert.deepEqual(read().state.startOrigin,started.state.startOrigin);
        assert.deepEqual(read().state.notes,started.state.notes);
        assert.deepEqual(read().world.island.assets,started.world.island.assets);
    }
    // Old three-species provenance is validated with its original mapping,
    // never with the new eleven-species weights or a new random draw.
    const legacyBase=structuredClone(saved());
    for(const version of [1,2]) {
        const fixture=structuredClone(legacyBase), draw=.99;
        const answers=fixture.state.startOrigin.answers;
        const compatible=questions.resolve(answers,version===1?0:draw,version);
        fixture.appearance=compatible.appearance; fixture.state.settings=compatible.settings;
        fixture.state.startOrigin={version,answers}; if(version===2)fixture.state.startOrigin.draw=draw;
        assert.ok(valid(fixture));
        // Unload the prior test child first: its beforeunload save must not
        // overwrite the compatibility fixture we are about to install.
        await window.loadURL('about:blank');
        fs.writeFileSync(path.join(directory,'word-life.json'),JSON.stringify(fixture));
        await reload(); await click('.word-logo'); await click('#word-continue');
        assert.equal(read().appearance,compatible.appearance);
        assert.deepEqual(read().state.startOrigin,fixture.state.startOrigin);
    }
    // Repeating a tied answer set can change the appearance before any child save.
    await reload(); await click('.word-logo'); await click('#word-new-game'); await click('#word-reset-accept');
    await js('window.originalQuestionRandom=Math.random; Math.random=()=>0; void 0');
    const tied = [0,0,0,2,0,1,1], pending = structuredClone(saved());
    for (const answer of tied) await click(`fieldset button[data-answer="${answer}"]`);
    const first = await js('document.querySelector(".word-questions select").value');
    await click('#word-meeting-retry'); await js('Math.random=()=>.99; void 0');
    for (const answer of tied) await click(`fieldset button[data-answer="${answer}"]`);
    assert.notEqual(await js('document.querySelector(".word-questions select").value'), first);
    assert.deepEqual(saved(), pending);
    assert.equal(await js('audioManager.currentBGMType'), 'personality');
    for (let i = 0; i < 50 && !await js('audioManager.currentAudio.readyState >= 2'); i++) await sleep(100);
    assert.equal(await js('audioManager.currentAudio.src.endsWith("bgm_personality.mp3") && audioManager.currentAudio.loop && audioManager.currentAudio.readyState >= 2'), true);
    await js('Math.random=window.originalQuestionRandom; void 0');
    // Quitting at the preview keeps the reset marker, never a discarded child.
    await js('window.dispatchEvent(new Event("beforeunload"))'); await reload(); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-continue").disabled'), true);
    assert.deepEqual(saved(), pending);
    // Hiding the header must not hide the reason a failed save cannot be resumed.
    fs.writeFileSync(path.join(directory, 'word-life.json'), '{invalid', 'utf8');
    await window.loadURL(url); await paintClock(); await sleep(800); await click('.word-logo');
    assert.equal(await js('document.querySelector("#word-new-game").disabled && document.querySelector("#word-continue").disabled'), true);
    assert.equal(await js('document.querySelector(".word-title-error").checkVisibility()'), true);
    assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), '{invalid');
};
