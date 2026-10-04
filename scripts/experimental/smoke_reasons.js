'use strict';
// Real renderer, isolated profile, normal chat and save/reload. Fixture edits only
// arrange initial knowledge and bodily conditions; no acquired evidence is injected.
module.exports = async function ({ js, window, url, paintClock, sleep, read, load }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const catalog = require('../../experimental_word_learning_catalog.json');
    const { valid } = require('./storage');
    const forms = catalog.proposalTeaching.ja, reason = catalog.reasonTeaching.ja;
    const lesson = (stage, kind) => `${reason[stage]}「${reason.utterance}」→「${forms[kind].utterance}」`;
    const chat = text => js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
    const sync = () => js('window.dispatchEvent(new Event("beforeunload"))');
    const resume = async value => {
        if (value) load(value);
        await window.loadURL(url); await paintClock(); await sleep(600);
        await js('window.smokeBeginSession()'); await sleep(100);
        assert.ok(valid(read()), 'renderer save remains valid');
        assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
        assert.equal(await js('document.querySelector(".session-badge").textContent.includes("停止")'), false);
    };
    const waitFor = async predicate => {
        for (let i = 0; i < 300; i++) {
            await sync(); if (predicate(read())) return;
            await sleep(200);
        }
        assert.fail(`timed out: ${JSON.stringify({ mode: read().world.mode, destination: read().world.destination })}`);
    };
    const count = () => read().world.experiences.filter(e => e.kind === 'rest').length;
    const learned = id => read().state.knowledge.relations.some(r => r.id === id && r.scope?.slot === 'reason');
    const labels = () => read().state.experiences.flatMap(e => e.relationLabels || []).filter(l => l.slot === 'reason');
    // Reach the proposal prerequisites through two real completed activities.
    for (const [index, kind] of ['request', 'invitation'].entries()) {
        const value = structuredClone(read());
        if (!index) {
            value.state.settings.foundation = false;
            value.state.knowledge.relations = [];
        }
        Object.assign(value.world, { mode: 'rest', dwell: 2, attention: 'shade', destination: null,
            activityStart: value.world.elapsed, activityBefore: { hunger: .2, fatigue: .8 }, hunger: .2, fatigue: .8 });
        const previous = count(); await resume(value);
        await chat(`${forms[kind].marker}「${forms[kind].utterance}」`);
        await waitFor(() => count() === previous + 1);
    }
    assert.ok(read().state.knowledge.relations.some(r => r.id === 'request'));
    assert.ok(read().state.knowledge.relations.some(r => r.id === 'invitation'));
    const selected = async kind => {
        const value = structuredClone(read());
        Object.assign(value.world, { mode: 'observe', dwell: 60, attention: 'shade', destination: null, hunger: .2, fatigue: .2 });
        await resume(value);
        const previous = count(); await chat(forms[kind].utterance);
        assert.equal(read().world.destination, 'shade');
        const source = structuredClone(read().state.selectionSources.at(-1));
        await waitFor(() => count() === previous + 1);
        assert.deepEqual(read().world.experiences.at(-1).choiceSource, { inputId: source.input.id, selectedAt: source.selectedAt });
        console.log(JSON.stringify({ selected: kind, completedRests: count() }));
        return source;
    };
    // Example 2: premature explanation, mismatched choice and repeated request.
    await selected('request');
    await chat(lesson('reason', 'request')); await chat(lesson('question', 'invitation'));
    assert.equal(labels().length, 0);
    await chat(lesson('question', 'request'));
    const pending = JSON.stringify(labels());
    await chat(lesson('question', 'request')); assert.equal(JSON.stringify(labels()), pending);
    await resume(); assert.equal(JSON.stringify(labels()), pending);
    await selected('request'); await chat(lesson('question', 'request'));
    assert.equal(learned('question'), false); assert.equal(learned('reason'), false);
    await selected('invitation'); await chat(lesson('question', 'invitation'));
    assert.equal(learned('question'), true); assert.equal(learned('reason'), false);
    for (const kind of ['request', 'invitation']) {
        await selected(kind); await chat(lesson('reason', kind));
        assert.equal(learned('reason'), kind === 'invitation');
    }
    await chat(reason.utterance);
    assert.equal(read().state.context.turns.at(-1).answer.response.literal, forms.invitation.utterance);
    assert.ok(await js('document.querySelector("#conversation").textContent.includes("この声かけを選んで休んだことは")'));
    // Example 3: knowing the relation does not supply awareness of a new choice.
    await selected('request'); await chat(reason.utterance);
    assert.equal(read().state.context.lastOutput.source.message, 'answer_unknown');
    assert.equal(read().state.context.turns.at(-1).answer, undefined);
    assert.ok(await js('document.querySelector("#conversation").textContent.includes("まだ、答えが分からない")'));
    await chat(lesson('reason', 'request')); await chat(reason.utterance);
    const answer = structuredClone(read().state.context.turns.at(-1).answer.response);
    assert.equal(answer.message, 'selected_reason'); assert.equal(answer.literal, forms.request.utterance);
    assert.ok(answer.experienceId); assert.ok(answer.choiceSource); assert.ok(answer.reviewedBy);
    await resume(); assert.deepEqual(read().state.context.turns.at(-1).answer.response, answer);
    await chat('どうして歩いたの？');
    assert.equal(read().state.context.turns.at(-1).understandings[0].complete, false);
    const evidence = JSON.stringify(read().state.knowledge.relationEvidence);
    await js('document.querySelector("button[aria-controls=notebook]").click()');
    for (const stage of ['question', 'reason']) for (const kind of ['request', 'invitation']) {
        assert.ok(await js(`document.querySelector('#notebook').textContent.includes(${JSON.stringify(lesson(stage, kind))})`));
    }
    assert.ok(await js('document.querySelector("#notebook").textContent.includes("すべての動機が分かったわけではない")'));
    await js('Array.from(document.querySelectorAll("#notebook .note-card")).find(n => n.textContent.includes("休息の選択について")).scrollIntoView({block:"start"})');
    window.setSize(1281, 800); await sleep(500);
    const screenshot = path.resolve(__dirname, '../../tests/word-reasons-smoke.png');
    fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    await resume(); assert.equal(JSON.stringify(read().state.knowledge.relationEvidence), evidence);
    const gesture = structuredClone(read()); gesture.state.settings.speech = 'gesture';
    await resume(gesture); await chat(reason.utterance);
    assert.equal(read().state.context.lastOutput.source.message, 'attend');
    assert.equal(read().state.context.turns.at(-1).answer, undefined);
    assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.ok(await js('audioManager.currentAudio.readyState >= 2'));
    console.log(JSON.stringify({ screenshot, rests: count(), examples: [1, 2, 3], saveReload: true }));
};
