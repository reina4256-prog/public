'use strict';
// WIP checkpoint: full Electron run and visual verification remain pending.
// See docs/WORD_DEMO_ROADMAP.md, 2026-09-30 checkpoint, before reporting completion.
// One continuous renderer session: only initial settings and activity conditions
// are arranged in the isolated profile. All evidence comes from normal inputs
// and real single-loop activity completion, never from an injected learned save.
module.exports = async function ({ js, window, url, paintClock, sleep, read, load }) {
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    const path = require('node:path');
    const core = require('../../experimental_word_learning_core');
    const catalog = require('../../experimental_word_learning_catalog.json');
    const { valid } = require('./storage');
    const sync = () => js('window.dispatchEvent(new Event("beforeunload"))');
    const chat = async text => {
        for (let i = 0; i < 10 && await js('document.hidden'); i++) {
            await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(100);
        }
        assert.equal(await js('document.hidden'), false);
        const serial = read().state.serial;
        await js(`document.querySelector('.chat-form textarea').value=${JSON.stringify(text)}; document.querySelector('.chat-form').requestSubmit()`);
        assert.equal(read().state.serial, serial + 1, text);
        assert.ok(valid(read()), text);
        return read().state.context.turns.at(-1);
    };
    const retained = () => JSON.stringify({ knowledge: read().state.knowledge, experiences: read().state.experiences,
        selectionSources: read().state.selectionSources, correctionLessons: read().state.correctionLessons,
        feelingLearning: read().state.feelingLearning, labels: read().world.relationLabels, lifeLabels: read().world.lifeLabels });
    const resume = async value => {
        if (value) load(value);
        const before = value ? null : retained();
        await window.loadURL(url); await paintClock();
        for (let i = 0; i < 100; i++) {
            if (await js('!!document.querySelector("#app > form button:not(:disabled)")')) break;
            await sleep(100);
        }
        await js('document.querySelector("#app > form").requestSubmit()'); await sleep(100); await sync();
        assert.ok(valid(read()));
        if (before) assert.equal(retained(), before, 'restart must preserve sources and knowledge');
        assert.equal(await js('document.querySelector(".master-choice").checkVisibility()'), false);
    };
    const waitFor = async predicate => {
        for (let i = 0; i < 300; i++) {
            await sync(); if (predicate()) return;
            await sleep(200);
        }
        assert.fail(`activity timeout: ${read().world.mode}`);
    };
    const marker = item => `${item.marker}「${item.utterance || catalog.reportTeaching.ja.self.utterance}」`;
    const proposal = kind => marker(catalog.proposalTeaching.ja[kind]);
    const report = kind => marker(catalog.reportTeaching.ja[kind]);
    const count = () => read().world.experiences.length;
    const arrange = async (mode, fatigue = .8) => {
        const value = structuredClone(read());
        Object.assign(value.world, { mode, dwell: mode === 'observe' ? 60 : 5,
            attention: mode === 'eat' ? 'berry:1' : 'shade', destination: null,
            activityStart: value.world.elapsed, harvest: 1,
            activityBefore: { hunger: mode === 'eat' ? .8 : .2, fatigue },
            hunger: mode === 'eat' ? .8 : .2, fatigue,
            mealTaste: mode === 'eat' ? { quality: 'sweet', pleasant: true } : null });
        await resume(value);
    };
    const activity = async (mode, texts, fatigue = .8) => {
        const before = count(); await arrange(mode, fatigue);
        for (const text of texts) await chat(text);
        await resume();
        await waitFor(() => count() === before + 1);
        assert.ok(valid(read()));
        console.log(JSON.stringify({ activity: mode, completed: count(), inputs: texts.length }));
    };
    const initial = structuredClone(read());
    initial.state = core.create({ foundation: false, life: false, speech: 'short' }, catalog);
    await resume(initial);
    await activity('eat', ['食べる']);
    await activity('rest', ['休む', '「疲れた」']);
    assert.deepEqual(read().state.knowledge.meanings.map(m => m.id).sort(), ['eat', 'rest', 'tired']);
    await activity('eat', ['もぐは食べることだよ', '「何してる？」→「食べる」']);
    await activity('rest', ['ぽぽは休むことだよ', '「何してる？」→「休む」', proposal('request'), report('self')]);
    await activity('rest', [proposal('invitation'), report('player')]);
    console.log('ID3: naming, question, proposals and report coexist');
    for (const [mode, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
        await activity(mode, [marker(catalog.negationTeaching.ja[polarity])]);
    }
    for (const time of ['now', 'past']) await activity('rest', [marker(catalog.timeTeaching.ja[time])]);
    const condition = catalog.conditionTeaching.ja;
    for (const [status, fatigue] of [['met', .8], ['unmet', .2]]) {
        await activity('rest', [`${condition[status]}「${condition.utterance}」`], fatigue);
    }
    const sequence = catalog.sequenceTeaching.ja;
    await activity('eat', [`${sequence.before}「${sequence.utterance}」`]);
    await chat(`${sequence.after}「${sequence.utterance}」`); await resume();
    const mode = read().world.mode;
    assert.ok((await chat(sequence.utterance)).understandings[0].complete);
    assert.equal(read().world.mode, mode); assert.equal(read().world.destination, null);
    console.log('ID3: negation, time, condition and sequence coexist; sequence restart passed');
    const reason = catalog.reasonTeaching.ja;
    for (const stage of ['question', 'reason']) for (const kind of ['request', 'invitation']) {
        await arrange('observe', .2);
        const before = count(); await chat(catalog.proposalTeaching.ja[kind].utterance);
        assert.equal(read().world.destination, 'shade');
        const source = structuredClone(read().state.selectionSources.at(-1));
        await waitFor(() => count() === before + 1);
        assert.deepEqual(read().world.experiences.at(-1).choiceSource, { inputId: source.input.id, selectedAt: source.selectedAt });
        await chat(`${reason[stage]}「${reason.utterance}」→「${catalog.proposalTeaching.ja[kind].utterance}」`);
        await resume();
    }
    const answer = (await chat(reason.utterance)).answer.response;
    assert.equal(answer.literal, catalog.proposalTeaching.ja.invitation.utterance);
    assert.ok(answer.experienceId && answer.choiceSource && answer.reviewedBy);
    await arrange('observe', .2);
    const origins = JSON.stringify(read().state.experiences);
    const correction = catalog.correctionTeaching.ja;
    const sourceText = correction.exampleSource.replace('ぽぽ', 'るる');
    const replacement = correction.exampleReplacement.replace('ぽぽ', 'るる');
    const sourceId = (await chat(sourceText)).input.id;
    await chat(`${correction.source}«${sourceText}»`); await resume();
    await chat(`${correction.replacement}«${replacement}»`); await resume();
    assert.equal((await chat(replacement)).understandings[0].corrects, sourceId);
    const p = catalog.feelingContrast.ja, f = catalog.feelingTeaching.ja, full = p.past + p.join + p.present;
    await chat(full);
    const original = structuredClone(read().state.context.turns.at(-1).understandings);
    for (const text of [`${f.source}«${full}»`, `${f.sad}«${p.past}»`, `${f.happy}«${p.present}»`,
        `${f.report}«${p.past}»`, `${f.report}«${p.present}»`, `${f.yesterday}«${p.past}»`, `${f.now}«${p.present}»`,
        ...['retain', 'difference', 'noncausal'].map(stage => `${catalog.contrastTeaching.ja[stage]}«${full}»`)]) {
        await chat(text); await resume();
    }
    const parts = (await chat(full)).understandings;
    assert.ok(parts.every(u => u.complete && !u.testimony.verified && !u.contrastConnection.causalClaim && !u.contrastConnection.replaces));
    assert.deepEqual(read().state.feelingLearning.events[0].original.understandings, original);
    assert.equal(JSON.stringify(read().state.experiences), origins);
    for (const text of ['何してる？', 'あなたは休んでいる', '私は休んでいる',
        catalog.negationTeaching.ja.negative.utterance, catalog.timeTeaching.ja.past.utterance, condition.utterance, sequence.utterance]) {
        assert.ok((await chat(text)).understandings[0].complete, text);
    }
    assert.equal((await chat('あなたはさっき休んでいなかった')).understandings[0].complete, false);
    assert.equal((await chat('どうして歩いたの？')).understandings[0].complete, false);
    await chat(full);
    const evidence = retained();
    await js('document.querySelector("button[aria-controls=notebook]").click()');
    for (const text of [sourceText, replacement, condition.met, sequence.before, sequence.after, reason.reason, catalog.contrastTeaching.ja.noncausal]) {
        assert.ok(await js(`document.querySelector('#notebook').textContent.includes(${JSON.stringify(text)})`), text);
    }
    assert.ok(await js('document.querySelector("#notebook s").textContent.includes("るる")'));
    window.setSize(1340, 1100); await sleep(300);
    await js(`Array.from(document.querySelectorAll('#notebook .note-card')).find(n => n.textContent.includes(${JSON.stringify(catalog.contrastTeaching.ja.noncausal)})).scrollIntoView({block:'start'}); void 0`);
    await sleep(600); await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }); await sleep(600);
    const screenshot = path.resolve(__dirname, '../../tests/word-id3-smoke.png');
    fs.writeFileSync(screenshot, (await window.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true })).toPNG());
    assert.equal(retained(), evidence); await resume();
    assert.equal(retained(), evidence);
    assert.equal(await js('typeof aiPet.update'), 'undefined');
    assert.ok(await js('audioManager.currentAudio.readyState >= 2'));
    assert.ok(await js('Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).every(k=>!["ai_pet_data_v1","map_data_v6"].includes(k))'));
    console.log(JSON.stringify({ id3: true, screenshot, experiences: count(), relations: read().state.knowledge.relations.map(r => r.id),
        feelingEvents: read().state.feelingLearning.events.length, stagedRestarts: true }));
};
