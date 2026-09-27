'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const worldApi = require('../experimental_word_learning_world');
const notebookApi = require('../experimental_word_learning_notebook');
const reportApi = require('../experimental_word_learning_report');
const create = options => api.create(options, catalog);
const say = (state, text, options) => api.receive(state, text, catalog, { at: 100, ...options });
const focus = (state, scene = 'clearing', count = 1) => api.perceive(state, {
    scene, attention: Array.from({ length: count }, (_, i) => ({ id: `berry:${i + 1}`, meaning: 'berry' }))
});

const lifeLearning = require('../experimental_word_life_learning');
function lifeFixture(activity = 'eat', options = {}) {
    const state = create({ life: false, ...options }), world = worldApi.create();
    Object.assign(world, { mode: activity, elapsed: 10, activityStart: 10, dwell: 1,
        attention: activity === 'eat' ? 'berry:1' : 'shade', hunger: .8, fatigue: .8,
        harvest: 1, activityBefore: { hunger: .8, fatigue: .8 },
        mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
    return { state, world };
}
function labelLife(state, world, text, options) {
    const result = say(state, text, options);
    worldApi.respond(world, result, state, catalog);
    return result;
}
function finishLife(state, world) {
    for (let i = 0; i < 100; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { worldApi.onArrival(world, state, event); return event; }
    }
    assert.fail('completion missing');
}

const relationLearning = require('../experimental_word_relation_learning');
function startRelationActivity(state, world, activity) {
    Object.assign(world, { mode: activity, activityStart: world.elapsed, dwell: 1,
        attention: activity === 'eat' ? `berry:${++world.harvest}` : 'shade',
        activityBefore: { hunger: .8, fatigue: .8 }, hunger: .8, fatigue: .8,
        mealTaste: activity === 'eat' ? { quality: 'sweet', pleasant: true } : null });
    api.perceive(state, worldApi.perception(world));
}
const relationForms = {
    ja: ['もぐは食べることだよ', 'ぽぽは休むことだよ'],
    en: ['"mogu" means "eat"', '"popo" means "rest"'],
    'zh-CN': ['“mogu”的意思是“吃”', '“popo”的意思是“休息”'],
    ru: ['"mogu" значит "есть"', '"popo" значит "отдых"'],
    'es-ES': ['"mogu" significa "comer"', '"popo" significa "descansar"'],
    'pt-BR': ['"mogu" significa "comer"', '"popo" significa "descansar"'],
    de: ['"mogu" bedeutet "speisen"', '"popo" bedeutet "ausruhen"']
};
const questionForms = {
    ja: ['何してる？', '食べる', '休む'], en: ['What are you doing?', 'eat', 'rest'],
    'zh-CN': ['你在做什么？', '吃', '休息'], ru: ['Что ты делаешь?', 'есть', 'отдых'],
    'es-ES': ['¿Qué estás haciendo?', 'comer', 'descansar'],
    'pt-BR': ['O que você está fazendo?', 'comer', 'descansar'], de: ['Was machst du?', 'speisen', 'ausruhen']
};
const demo = (question, answer) => `「${question}」→「${answer}」`;
const proposalDemo = (locale, kind) => {
    const item = catalog.proposalTeaching[locale][kind];
    return `${item.marker}「${item.utterance}」`;
};
const reportDemo = (locale, subject) => {
    const item = catalog.reportTeaching[locale][subject];
    return `${item.marker}「${item.utterance}」`;
};
const negationDemo = (locale, polarity) => {
    const item = catalog.negationTeaching[locale][polarity];
    return `${item.marker}「${item.utterance || catalog.reportTeaching[locale].self.utterance}」`;
};
function prepareNegation(state, world, locale = 'ja') {
    if (!state.settings.life) for (const [activity, raw] of [['eat', questionForms[locale][1]], ['rest', questionForms[locale][2]]]) {
        startRelationActivity(state, world, activity); labelLife(state, world, raw, { locale }); finishLife(state, world);
    }
    if (!state.settings.foundation) for (const subject of ['self', 'player']) {
        startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo(locale, subject), { locale }); finishLife(state, world);
    }
}
const timeDemo = (locale, time) => {
    const item = catalog.timeTeaching[locale][time]; return `${item.marker}「${item.utterance}」`;
};
const conditionDemo = (locale, status) => {
    const item = catalog.conditionTeaching[locale]; return `${item[status]}「${item.utterance}」`;
};
const sequenceDemo = (locale, phase) => {
    const item = catalog.sequenceTeaching[locale]; return `${item[phase]}「${item.utterance}」`;
};
function prepareSequence(state, world, locale = 'ja') {
    if (!state.settings.life) for (const [activity, raw] of [['eat', questionForms[locale][1]], ['rest', questionForms[locale][2]]]) {
        startRelationActivity(state, world, activity); labelLife(state, world, raw, { locale }); finishLife(state, world);
    }
    if (!state.settings.foundation) for (const kind of ['request', 'invitation']) {
        startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo(locale, kind), { locale }); finishLife(state, world);
    }
}
function arriveAtSelectedRest(state, world) {
    for (let i = 0; i < 2000; i++) {
        const event = worldApi.tick(world, .1);
        if (event) worldApi.onArrival(world, state, event);
        api.perceive(state, worldApi.perception(world));
        if (world.mode === 'rest') return;
    }
    assert.fail('selected rest was not reached');
}
const selectionSave = (state, world) => JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
const reasonDemo = (locale, stage, choice) => {
    const item = catalog.reasonTeaching[locale];
    return `${item[stage]}「${item.utterance}」→「${catalog.proposalTeaching[locale][choice].utterance}」`;
};
function completeSelectedRest(state, world, choice = 'request', locale = 'ja') {
    const result = labelLife(state, world, catalog.proposalTeaching[locale][choice].utterance, { locale });
    assert.equal(world.mode, 'move');
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    return result;
}

test('3c3d2: seven languages and eight starts separately teach reason questions, links and bounded recall', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.reasonTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareSequence(state, world, locale);
            for (const stage of ['question', 'reason']) for (const choice of ['request', 'invitation']) {
                completeSelectedRest(state, world, choice, locale);
                const originals = JSON.stringify(state.selectionSources);
                const result = labelLife(state, world, reasonDemo(locale, stage, choice), { locale });
                assert.ok(result.relationLearning, `${locale}/${foundation}/${life}/${stage}/${choice}`);
                assert.equal(result.relationLearning.adopted.slot, 'reason');
                const snapshot = selectionSave(state, world);
                assert.ok(valid(snapshot), `save ${locale}/${stage}/${choice}`);
                ({ state, world } = snapshot);
                assert.equal(JSON.stringify(state.selectionSources), originals);
                const evidence = JSON.stringify(state.knowledge.relationEvidence);
                labelLife(state, world, reasonDemo(locale, stage, choice), { locale });
                assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence, 'repeat does not add evidence');
                if (!foundation && stage === 'question') {
                    assert.equal(state.knowledge.relations.some(r => r.id === 'reason'), false);
                    assert.equal(say(state, catalog.reasonTeaching[locale].utterance, { locale }).understandings[0].complete, false);
                }
            }
            const result = say(state, catalog.reasonTeaching[locale].utterance, { locale });
            assert.equal(result.understandings[0].complete, true);
            const response = worldApi.respond(world, result, state);
            assert.equal(response.message, speech === 'short' ? 'selected_reason' : 'attend');
            if (speech === 'short') assert.equal(response.literal, catalog.proposalTeaching[locale].invitation.utterance);
            assert.ok(valid(selectionSave(state, world)), 'answer provenance survives JSON');
            if (speech === 'short') {
                for (const mutate of [r => { r.literal = 'forged'; }, r => { r.reviewedBy = 'input:1'; },
                    r => { r.choiceSource.inputId = 'input:1'; }, r => { r.experienceId = -1; }]) {
                    const forged = selectionSave(state, world);
                    mutate(forged.state.context.turns.at(-1).answer.response); assert.equal(valid(forged), false);
                }
            }
            if (!foundation) {
                assert.deepEqual(result.understandings[0].relationReferences.map(r => r.id).sort(), ['question', 'reason']);
                assert.equal(notebookApi.entries(state).filter(e => e.detail === 'note_reason_learned').length, 2);
                assert.equal(say(state, questionForms[locale][0], { locale }).understandings[0].complete, false);
                assert.equal(say(state, catalog.reasonTeaching[locale].utterance, { locale, speaker: 'friend' }).understandings[0].complete, false);
            }
            const before = JSON.stringify(state.knowledge);
            notebookApi.entries(state); for (let i = 0; i < 12; i++) say(state, 'unrecognized-example');
            assert.deepEqual(state.knowledge.relationEvidence, JSON.parse(before).relationEvidence);
            assert.ok(valid(selectionSave(state, world)), 'context eviction preserves teaching sources');
            // The learnt direction is not awareness of a new choice without its own review.
            completeSelectedRest(state, world, 'request', locale);
            assert.equal(worldApi.respond(world, say(state, catalog.reasonTeaching[locale].utterance, { locale }), state).message,
                speech === 'short' ? 'answer_unknown' : 'attend');
        }
    }
});

test('3c3d2: missing prerequisites, unfinished, autonomous, mismatched and foreign sources never teach reasons', () => {
    for (const locale of Object.keys(catalog.reasonTeaching)) {
        const state = create({ foundation: false }), world = worldApi.create();
        assert.equal(labelLife(state, world, reasonDemo(locale, 'reason', 'request'), { locale }).relationLearning, undefined);
        prepareSequence(state, world, locale);
        // Current-activity question learning cannot supply the reason-question scope.
        for (const [i, activity] of ['eat', 'rest'].entries()) {
            startRelationActivity(state, world, activity);
            labelLife(state, world, demo(questionForms[locale][0], questionForms[locale][i + 1]), { locale }); finishLife(state, world);
        }
        completeSelectedRest(state, world, 'request', locale);
        assert.equal(labelLife(state, world, reasonDemo(locale, 'reason', 'request'), { locale }).relationLearning, undefined);
        for (const options of [{ locale, speaker: 'friend' }, { locale: locale === 'ja' ? 'en' : 'ja' }]) {
            assert.equal(labelLife(state, world, reasonDemo(options.locale, 'question', 'request'), options).relationLearning, undefined);
        }
        assert.equal(labelLife(state, world, reasonDemo(locale, 'question', 'invitation'), { locale }).relationLearning, undefined);
        labelLife(state, world, reasonDemo(locale, 'question', 'request'), { locale });
        for (let i = 0; i < 2; i++) {
            completeSelectedRest(state, world, 'request', locale);
            labelLife(state, world, reasonDemo(locale, 'question', 'request'), { locale });
        }
        assert.equal(state.knowledge.relations.some(r => r.scope?.slot === 'reason'), false);
        labelLife(state, world, catalog.proposalTeaching[locale].invitation.utterance, { locale });
        assert.equal(labelLife(state, world, reasonDemo(locale, 'question', 'invitation'), { locale }).relationLearning, undefined);
        arriveAtSelectedRest(state, world);
        assert.equal(labelLife(state, world, reasonDemo(locale, 'question', 'invitation'), { locale }).relationLearning, undefined);
        worldApi.approach(world, 'path');
        assert.equal(labelLife(state, world, reasonDemo(locale, 'question', 'invitation'), { locale }).relationLearning, undefined);
    }
    const state = create(), world = worldApi.create();
    startRelationActivity(state, world, 'rest'); finishLife(state, world);
    assert.equal(labelLife(state, world, reasonDemo('ja', 'reason', 'request')).relationLearning, undefined);
});

test('3c3d2: saves reject changed teaching directions, original selections, prerequisites and scopes', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    prepareSequence(state, world);
    for (const stage of ['question', 'reason']) for (const choice of ['request', 'invitation']) {
        completeSelectedRest(state, world, choice); labelLife(state, world, reasonDemo('ja', stage, choice));
    }
    const saved = selectionSave(state, world); assert.ok(valid(saved));
    const labels = (v, fn) => { for (const e of [...v.state.experiences, ...v.world.experiences])
        for (const l of e.relationLabels || []) if (l.slot === 'reason') fn(l); };
    for (const mutate of [
        v => labels(v, l => { l.raw = 'changed'; }),
        v => labels(v, l => { l.choice = 'invitation'; }),
        v => labels(v, l => { l.answer = 'unknown'; }),
        v => labels(v, l => { l.at = l.start; }),
        v => labels(v, l => { l.eventReference.experienceId = -1; }),
        v => labels(v, l => { l.choiceSource.inputId = 'input:1'; }),
        v => labels(v, l => { l.basis.source = 'initial'; }),
        v => labels(v, l => { l.proposalBasis = []; }),
        v => labels(v, l => { if (l.relation === 'reason') l.questionBasis.scope.slot = 'current_activity'; }),
        v => labels(v, l => { l.understanding.complete = !l.understanding.complete; }),
        v => { v.state.knowledge.relations.find(r => r.id === 'reason').scope.meaning = 'eat'; },
        v => { v.state.selectionSources[0].input.raw = 'changed'; },
        v => { v.state.knowledge.relationEvidence.find(e => e.slot === 'reason').choice = 'invitation'; }
    ]) {
        const value = structuredClone(saved); mutate(value); assert.equal(valid(value), false);
    }
});

test('3c3d2: later teaching preserves original basis and cannot turn testimony or an intervening rest into a choice', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    assert.equal(labelLife(state, world, reasonDemo('ja', 'question', 'request')).relationLearning, undefined);
    assert.equal(state.knowledge.meanings.length, 0);
    prepareSequence(state, world);
    for (const choice of ['request', 'invitation']) {
        completeSelectedRest(state, world, choice);
        labelLife(state, world, reasonDemo('ja', 'question', choice));
    }
    completeSelectedRest(state, world);
    const originals = structuredClone(state.selectionSources);
    const sources = structuredClone(state.experiences);
    labelLife(state, world, '疲れたから休んだんだね');
    assert.deepEqual(state.selectionSources, originals);
    assert.deepEqual(state.experiences, sources, 'a speaker explanation does not rewrite own experience');
    // Refreshing a known prerequisite during a later rest does not rewrite the earlier basis.
    labelLife(state, world, catalog.proposalTeaching.ja.invitation.utterance);
    arriveAtSelectedRest(state, world); labelLife(state, world, '休む');
    assert.equal(labelLife(state, world, reasonDemo('ja', 'reason', 'request')).relationLearning, undefined);
    world.dwell = .1; finishLife(state, world);
    labelLife(state, world, reasonDemo('ja', 'reason', 'invitation'));
    completeSelectedRest(state, world); labelLife(state, world, reasonDemo('ja', 'reason', 'request'));
    assert.equal(say(state, catalog.reasonTeaching.ja.utterance).understandings[0].complete, true);
    assert.ok(valid(selectionSave(state, world)));
    assert.deepEqual(state.selectionSources.slice(0, originals.length), originals);
    const evidence = structuredClone(state.knowledge.relationEvidence);
    for (const raw of ['どうして歩いたの？', 'どうして休んだの？\n一緒に休もう', '疲れたから休んだんだね']) {
        const result = labelLife(state, world, raw);
        assert.equal(result.understandings.every(u => u.complete), false);
        assert.deepEqual(state.knowledge.relationEvidence, evidence);
    }
});

test('3c3d1: eight starts and seven languages retain the selected input and its original basis through rest and restart', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.proposalTeaching)) for (const kind of ['request', 'invitation']) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareSequence(state, world, locale);
            const relations = JSON.stringify(state.knowledge.relations), evidence = JSON.stringify(state.knowledge.relationEvidence);
            const result = say(state, catalog.proposalTeaching[locale][kind].utterance, { locale, at: 1234 });
            assert.equal(worldApi.respond(world, result, state).message, speech === 'short' ? 'join' : 'attend');
            const source = JSON.parse(JSON.stringify(state.selectionSources[0]));
            assert.deepEqual(source.input, result.input);
            assert.deepEqual(source.understanding, result.understandings[0]);
            assert.equal(source.selectedAt, world.elapsed);
            assert.equal(source.input.at, 1234, 'heard time is not life time');
            assert.equal(source.understanding.roles.actualParticipation, false);
            let saved = selectionSave(state, world); assert.ok(valid(saved), 'moving save');
            ({ state, world } = saved);
            arriveAtSelectedRest(state, world);
            saved = selectionSave(state, world); assert.ok(valid(saved), 'resting save');
            ({ state, world } = saved);
            // Later evidence for rest cannot replace what was known at choice.
            if (!life) labelLife(state, world, questionForms[locale][2], { locale });
            world.dwell = .1; finishLife(state, world);
            const original = world.experiences.at(-1), retained = state.experiences.at(-1);
            assert.deepEqual(retained.choiceSource, { inputId: source.input.id, selectedAt: source.selectedAt });
            assert.deepEqual(original.choiceSource, retained.choiceSource);
            assert.deepEqual(state.selectionSources[0], source);
            assert.ok(source.selectedAt <= retained.start && retained.start < retained.end);
            saved = selectionSave(state, world); assert.ok(valid(saved), 'completed save');
            ({ state, world } = saved);
            for (let n = 0; n < 15; n++) say(state, 'unrecognized-example', { locale });
            notebookApi.entries(state);
            assert.deepEqual(state.selectionSources[0], source, 'context eviction does not erase the selected original');
            assert.equal(JSON.stringify(state.knowledge.relations), relations);
            assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence, 'selection does not teach reason or strengthen relations');
            for (let n = 0; n < 40; n++) {
                const event = worldApi.tick(world, .1);
                if (event) worldApi.onArrival(world, state, event);
            }
            assert.ok(valid(selectionSave(state, world)), 'next autonomous action save');
        }
    }
});

test('3c3d1: unchosen, unknown, teaching, conditional and other scoped inputs never become selection sources', () => {
    for (const locale of Object.keys(catalog.proposalTeaching)) {
        for (const [options, text, speaker] of [
            [{ foundation: false }, catalog.proposalTeaching[locale].request.utterance, 'player'],
            [{ life: false }, catalog.proposalTeaching[locale].request.utterance, 'player'],
            [{}, proposalDemo(locale, 'request'), 'player'],
            [{}, catalog.conditionTeaching[locale].utterance, 'player'],
            [{}, catalog.sequenceTeaching[locale].utterance, 'player'],
        ]) {
            const state = create(options), world = worldApi.create();
            labelLife(state, world, text, { locale, speaker });
            assert.equal(state.selectionSources, undefined); assert.equal(world.destination, null);
        }
        const state = create({ foundation: false }), world = worldApi.create(); prepareSequence(state, world, locale);
        const other = locale === 'ja' ? 'en' : 'ja';
        labelLife(state, world, catalog.proposalTeaching[locale].request.utterance, { locale, speaker: 'friend' });
        labelLife(state, world, catalog.proposalTeaching[other].request.utterance, { locale: other });
        assert.equal(state.selectionSources, undefined);
        Object.assign(world, { mode: 'observe', attention: 'berry:1', dwell: 8 });
        labelLife(state, world, catalog.proposalTeaching[locale].request.utterance, { locale });
        assert.equal(state.selectionSources, undefined, 'heard but not chosen');
    }
});

test('3c3d1: interruption and failed navigation cannot create completed selection evidence or rewrite old reasons', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create(), world = worldApi.create();
    labelLife(state, world, catalog.proposalTeaching.ja.request.utterance);
    const source = structuredClone(state.selectionSources[0]);
    arriveAtSelectedRest(state, world); worldApi.approach(world, 'path');
    assert.equal(world.experiences.some(e => e.choiceSource), false);
    assert.deepEqual(state.selectionSources[0], source);
    assert.ok(valid(selectionSave(state, world)), 'interrupted rest saves as an uncompleted choice');
    const blocked = worldApi.create(); blocked.island = { places: worldApi.PLACES };
    blocked.reasons = [{ kind: 'curiosity', target: 'path' }];
    const old = structuredClone(blocked), fresh = create();
    worldApi.setNavigation(() => null);
    try {
        const result = say(fresh, catalog.proposalTeaching.ja.request.utterance);
        assert.equal(worldApi.respond(blocked, result, fresh).message, 'answer_unknown');
        assert.deepEqual({ ...blocked, reactionTime: old.reactionTime }, old); assert.equal(fresh.selectionSources, undefined);
    } finally { worldApi.setNavigation(null); }
});

test('3c3d1: selected sources and completed links reject altered input, knowledge, roles, time and origin', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    prepareSequence(state, world);
    labelLife(state, world, catalog.proposalTeaching.ja.request.utterance);
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    const saved = selectionSave(state, world); assert.ok(valid(saved));
    const changeSource = change => v => change(v.state.selectionSources[0]);
    const changes = [
        changeSource(s => { s.input.raw = 'あなたが食べ終わったら、休んでね'; }),
        changeSource(s => { s.input.locale = 'en'; }), changeSource(s => { s.input.speaker = 'friend'; }),
        changeSource(s => { s.input.id = 'input:999999'; }), changeSource(s => { s.selectedAt = -1; }),
        changeSource(s => { s.understanding.roles.actualParticipation = true; }),
        changeSource(s => { s.frame.kind = 'report'; }), changeSource(s => { s.understanding.complete = false; }),
        changeSource(s => { s.meaningBasis.evidence = []; }), changeSource(s => { s.relationBasis = []; }),
        changeSource(s => { s.relationBasis = [null]; }),
        changeSource(s => { s.relationBasis[0].scope.speaker = 'friend'; }),
        v => { delete v.state.selectionSources; }, v => { v.state.selectionSources.push(structuredClone(v.state.selectionSources[0])); },
        v => { v.world.experiences.at(-1).choiceSource.inputId = 'input:1'; },
        v => { delete v.state.experiences.at(-1).choiceSource; },
        v => { v.world.history.at(-1).start += .1; },
        v => { v.world.history.at(-1).reasons = []; },
        v => { v.world.history.at(-1).reasons = [null]; },
        v => { v.world.history.find(h => h.mode === 'move').end = v.world.elapsed + 1; },
        v => { v.world.experiences.pop(); },
        v => { v.state.experiences.at(-1).choiceSource.selectedAt += .1; },
    ];
    for (const change of changes) { const altered = structuredClone(saved); change(altered); assert.equal(valid(altered), false, String(change)); }
    const old = selectionSave(create(), worldApi.create());
    assert.ok(valid(old)); assert.equal(old.state.selectionSources, undefined, 'old saves stay without invented sources');
});

test('3c3d1: later choices, ordinary autonomous rest and source repetition never replace a completed rest origin', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create(), world = worldApi.create();
    const result = say(state, '少し休もう');
    worldApi.respond(world, result, state);
    const firstSource = structuredClone(state.selectionSources[0]);
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    const first = structuredClone(world.experiences.at(-1));
    worldApi.respond(world, result, state);
    assert.equal(state.selectionSources.length, 1, 'reusing an old processing result cannot add a source');
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    assert.equal(world.experiences.at(-1).choiceSource, undefined, 'an old input is not new evidence');
    labelLife(state, world, catalog.proposalTeaching.ja.request.utterance, { at: 200 });
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    assert.equal(state.selectionSources.length, 2);
    assert.deepEqual(state.selectionSources[0], firstSource);
    assert.deepEqual(world.experiences[0], first);
    const saved = selectionSave(state, world); assert.ok(valid(saved));
    const swapped = structuredClone(saved);
    swapped.world.experiences.at(-1).choiceSource = structuredClone(first.choiceSource);
    swapped.state.experiences.at(-1).choiceSource = structuredClone(first.choiceSource);
    swapped.world.history.at(-1).reasons = structuredClone(swapped.world.history.find(h => h.experienceId === first.id).reasons);
    assert.equal(valid(swapped), false, 'two-sided changes cannot attach a different choice to this rest');
    worldApi.approach(world, 'shade', 'experienced_recovery');
    arriveAtSelectedRest(state, world); world.dwell = .1; finishLife(state, world);
    assert.equal(world.experiences.at(-1).choiceSource, undefined, 'autonomous recovery does not borrow an earlier utterance');
    assert.ok(valid(selectionSave(state, world)));
});

test('3c3c: eight starts and seven languages connect the same meal before/after with real prerequisite learning and JSON restart', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.sequenceTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareSequence(state, world, locale);
            startRelationActivity(state, world, 'eat');
            const before = labelLife(state, world, sequenceDemo(locale, 'before'), { locale });
            assert.equal(before.understandings[0].complete, foundation);
            if (!foundation) {
                const l = before.relationLearning.adopted;
                assert.equal(l.basis.id, 'rest'); assert.equal(l.eventBasis.id, 'eat');
                assert.equal(l.proposalBasis.id, 'request'); assert.equal(l.eventReference.end, null);
                assert.deepEqual(l.understanding.unresolved, [{ type: 'relation', id: 'sequence' }]);
            }
            // Independent later evidence for an already known prerequisite must
            // not replace the snapshot used by the unfinished-meal teaching.
            if (!life) labelLife(state, world, questionForms[locale][1], { locale });
            let saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world })); assert.ok(valid(saved), 'pending save');
            ({ state, world } = saved);
            const event = finishLife(state, world);
            saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world })); assert.ok(valid(saved), 'completed meal without after teaching');
            ({ state, world } = saved);
            const oldEvent = JSON.parse(JSON.stringify(state.experiences.at(-1)));
            world.elapsed += .2;
            const mode = world.mode, destination = world.destination;
            const after = labelLife(state, world, sequenceDemo(locale, 'after'), { locale });
            if (!foundation) {
                assert.equal(after.relationLearning.relationAcquired, true);
                const ref = after.relationLearning.adopted.eventReference;
                assert.deepEqual(ref, { experienceId: event.id, inputId: before.input.id, start: event.start, end: event.end });
                assert.ok(after.relationLearning.adopted.at > ref.end);
                const latest = state.experiences.at(-1);
                assert.deepEqual({ ...latest, relationLabels: latest.relationLabels.slice(0, -1) }, oldEvent);
                assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'sequence').length, 2);
                assert.deepEqual([...new Set(state.knowledge.relations.map(r => r.id))].sort(), ['invitation', 'request', 'sequence']);
                assert.equal(notebookApi.entries(state).filter(e => e.detail === 'note_sequence_learned').length, 2);
            }
            const result = say(state, catalog.sequenceTeaching[locale].utterance, { locale });
            const response = worldApi.respond(world, result, state);
            assert.equal(result.understandings[0].complete, true);
            if (!foundation) assert.deepEqual(result.understandings[0].relationReferences.map(r => r.id).sort(), ['request', 'sequence']);
            assert.equal(response.message, speech === 'short' ? 'sequence_understood' : 'attend');
            assert.equal(world.mode, mode); assert.equal(world.destination, destination);
            saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world })); assert.ok(valid(saved), 'learned save');
            const evidence = JSON.stringify(state.knowledge.relationEvidence);
            labelLife(state, world, sequenceDemo(locale, 'after'), { locale });
            notebookApi.entries(state); startRelationActivity(state, world, 'rest'); finishLife(state, world); relationLearning.learn(state);
            assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence);
        }
    }
});
test('3c3c: reverse, repetition, another meal, missing attention and interruption do not make a sequence', () => {
    const state = create({ foundation: false }), world = worldApi.create(); prepareSequence(state, world);
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'after')).relationLearning, undefined);
    startRelationActivity(state, world, 'eat');
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'after')).relationLearning, undefined);
    state.context.attention = [];
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'before')).relationLearning, undefined);
    api.perceive(state, worldApi.perception(world));
    const before = labelLife(state, world, sequenceDemo('ja', 'before'));
    for (let i = 0; i < 3; i++) labelLife(state, world, sequenceDemo('ja', 'before'));
    assert.equal(world.relationLabels.filter(l => l.relation === 'sequence').length, 1);
    assert.equal(world.relationLabels.at(-1).inputId, before.input.id);
    assert.equal(worldApi.approach(world, 'shade'), false, 'existing meals cannot be interrupted by approach');
    finishLife(state, world);
    startRelationActivity(state, world, 'eat'); finishLife(state, world);
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'after')).relationLearning, undefined, 'another meal cannot replace the original');
    for (let i = 0; i < 2; i++) {
        startRelationActivity(state, world, 'eat'); labelLife(state, world, sequenceDemo('ja', 'before')); finishLife(state, world);
    }
    assert.equal(state.knowledge.relations.some(r => r.id === 'sequence'), false, 'meal counts without a linked after teaching are insufficient');
    startRelationActivity(state, world, 'eat'); labelLife(state, world, sequenceDemo('ja', 'before'));
    // Simulate a discarded activity; it has no completed source to teach from.
    world.mode = 'idle'; world.elapsed += .1; worldApi.approach(world, 'shade');
    assert.equal(world.relationLabels.length, 0);
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'after')).relationLearning, undefined);
    startRelationActivity(state, world, 'eat'); labelLife(state, world, sequenceDemo('ja', 'before')); finishLife(state, world);
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'after')).relationLearning.relationAcquired, true, 'a later valid pair can recover');
});
test('3c3c: unknown and simultaneous prerequisites, other speakers and languages stay outside the learned scope', () => {
    for (const locale of Object.keys(catalog.sequenceTeaching)) {
        const state = create({ foundation: false, life: false }), world = worldApi.create();
        startRelationActivity(state, world, 'eat'); labelLife(state, world, questionForms[locale][1], { locale });
        assert.equal(labelLife(state, world, sequenceDemo(locale, 'before'), { locale }).relationLearning, undefined);
        finishLife(state, world); prepareSequence(state, world, locale);
        startRelationActivity(state, world, 'rest');
        assert.equal(labelLife(state, world, sequenceDemo(locale, 'before'), { locale }).relationLearning, undefined); finishLife(state, world);
        startRelationActivity(state, world, 'eat');
        assert.equal(labelLife(state, world, sequenceDemo(locale, 'before'), { locale, speaker: 'friend' }).relationLearning, undefined);
        labelLife(state, world, sequenceDemo(locale, 'before'), { locale }); finishLife(state, world);
        assert.equal(labelLife(state, world, sequenceDemo(locale, 'after'), { locale, speaker: 'friend' }).relationLearning, undefined);
        const other = locale === 'en' ? 'ja' : 'en';
        assert.equal(labelLife(state, world, sequenceDemo(other, 'after'), { locale: other }).relationLearning, undefined);
        labelLife(state, world, sequenceDemo(locale, 'after'), { locale });
        const raw = catalog.sequenceTeaching[locale].utterance;
        for (const invalid of [`${raw}?`, `${raw}\nunknown`, `unknown\n${raw}`, `${raw}\n${catalog.proposalTeaching[locale].invitation.utterance}`]) {
            const result = labelLife(state, world, invalid, { locale });
            assert.ok(result.understandings.some(u => !u.complete)); assert.notEqual(world.mode, 'move');
        }
        assert.equal(say(state, raw, { locale, speaker: 'friend' }).understandings[0].complete, false);
        assert.equal(say(state, catalog.sequenceTeaching[other].utterance, { locale: other }).understandings[0].complete, false);
        assert.equal(say(state, '食べ終わったら散歩しよう').understandings[0].complete, false);
        assert.equal(state.knowledge.relations.some(r => ['condition', 'time', 'negation', 'reason', 'contrast'].includes(r.id)), false);
    }
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo('ja', 'request')); finishLife(state, world);
    startRelationActivity(state, world, 'eat');
    assert.equal(labelLife(state, world, sequenceDemo('ja', 'before')).relationLearning, undefined);
});
test('3c3c: pending and completed saves reject forged input, reference, order, prerequisites and scope', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create(); prepareSequence(state, world);
    startRelationActivity(state, world, 'eat'); labelLife(state, world, sequenceDemo('ja', 'before'));
    for (const change of [l => { l.phase = 'after'; }, l => { l.raw = sequenceDemo('ja', 'after'); },
        l => { l.eventBasis.evidence[0].experienceId = -1; }, l => { l.proposalBasis.scope.form = 'other'; },
        l => { l.eventReference.end = 0; }, l => { l.understanding.known.eventMeaning = 'rest'; }]) {
        const v = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world })); change(v.world.relationLabels.at(-1)); assert.equal(valid(v), false);
    }
    finishLife(state, world); world.elapsed += .2; labelLife(state, world, sequenceDemo('ja', 'after'));
    const saved = JSON.stringify({ version: 1, appearance: 'robot', state, world }); assert.ok(valid(JSON.parse(saved)));
    const labels = (v, change) => {
        for (const e of [...v.state.experiences, ...v.world.experiences]) for (const l of e.relationLabels || []) if (l.relation === 'sequence') change(l);
    };
    for (const change of [
        v => labels(v, l => { l.raw = sequenceDemo('ja', l.phase === 'before' ? 'after' : 'before'); }),
        v => labels(v, l => { l.eventSubject = 'player'; }),
        v => labels(v, l => { if (l.phase === 'after') l.eventReference.experienceId = -1; }),
        v => labels(v, l => { if (l.phase === 'after') l.eventReference.end += 1; }),
        v => labels(v, l => { if (l.phase === 'after') l.at = l.start; }),
        v => labels(v, l => { if (l.phase === 'after') l.inputId = l.eventReference.inputId; }),
        v => { v.state.knowledge.relationEvidence.find(e => e.relation === 'sequence').experienceId = -1; },
        v => { v.state.knowledge.relations.find(r => r.id === 'sequence').scope.application = 'immediate'; },
        v => { v.world.experiences.at(-1).relationLabels.pop(); }
    ]) { const v = JSON.parse(saved); change(v); assert.equal(valid(v), false); }
    // Later meals must not invalidate an earlier, correctly heard teaching.
    startRelationActivity(state, world, 'eat'); finishLife(state, world);
    assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
});
const tiredForms = { ja: '疲れた', en: 'tired', 'zh-CN': '累', ru: 'устал', 'es-ES': 'cansado', 'pt-BR': 'cansado', de: 'müde' };
function conditionRest(state, world, fatigue = .8) {
    startRelationActivity(state, world, 'rest');
    world.fatigue = fatigue; world.activityBefore.fatigue = fatigue;
}
function prepareCondition(state, world, locale = 'ja') {
    if (!state.knowledge.meanings.some(m => m.id === 'rest')) {
        conditionRest(state, world); labelLife(state, world, questionForms[locale][2], { locale }); finishLife(state, world);
    }
    if (!state.knowledge.meanings.some(m => m.id === 'tired')) {
        conditionRest(state, world); labelLife(state, world, `「${tiredForms[locale]}」`, { locale }); finishLife(state, world);
    }
    if (!state.settings.foundation) for (const kind of ['request', 'invitation']) {
        conditionRest(state, world); labelLife(state, world, proposalDemo(locale, kind), { locale }); finishLife(state, world);
    }
}
test('3c3b: condition contrasts across eight starts and seven languages preserve prerequisites, sources and restart', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.conditionTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareCondition(state, world, locale);
            const prerequisites = structuredClone(state.knowledge);
            for (const [status, fatigue] of [['met', .8], ['unmet', .2]]) {
                conditionRest(state, world, fatigue);
                const result = labelLife(state, world, conditionDemo(locale, status), { locale });
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(result.understandings[0].conditionStatus, 'unknown');
                if (!foundation) {
                    const label = world.relationLabels[0];
                    assert.equal(label.relation, 'condition'); assert.equal(label.observation.status, status);
                    assert.equal(label.conditionBasis.id, 'tired'); assert.equal(label.proposalBasis.id, 'request');
                    assert.deepEqual(label.understanding.unresolved, [{ type: 'relation', id: 'condition' }]);
                    assert.equal(state.knowledge.relations.some(r => r.id === 'condition'), false);
                }
                let saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `${locale}/${status}/pending`); ({ state, world } = saved);
                finishLife(state, world);
                saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `${locale}/${status}/completed`); ({ state, world } = saved);
            }
            if (!foundation) {
                assert.deepEqual([...new Set(state.knowledge.relations.map(r => r.id))].sort(), ['condition', 'invitation', 'request']);
                assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'condition').length, 2);
                assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_condition_learned'));
            }
            assert.deepEqual(state.knowledge.meanings, prerequisites.meanings);
            const knowledge = JSON.stringify(state.knowledge), experiences = JSON.stringify(state.experiences);
            for (const [fatigue, expected] of [[.8, 'met'], [.2, 'unmet'], [.4, 'unknown']]) {
                conditionRest(state, world, fatigue);
                const result = say(state, catalog.conditionTeaching[locale].utterance, { locale });
                assert.equal(result.understandings[0].complete, true);
                const response = worldApi.respond(world, result, state);
                assert.equal(result.conditionJudgment.status, expected);
                assert.equal(result.understandings[0].conditionStatus, 'unknown', 'recognition is separate from sensory judgment');
                assert.equal(response.message, speech === 'short' ? `condition_${expected}` : 'attend');
                assert.equal(world.mode, 'rest'); assert.equal(world.destination, null);
                assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
            }
            state.context.attention = [];
            const unseen = labelLife(state, world, catalog.conditionTeaching[locale].utterance, { locale });
            assert.equal(unseen.conditionJudgment.status, 'unknown'); assert.equal(unseen.conditionJudgment.observation, null);
            assert.equal(JSON.stringify(state.knowledge), knowledge); assert.equal(JSON.stringify(state.experiences), experiences);
        }
    }
});
test('3c3b: wrong states, uncertain sensations, speakers, interruption and repeated teaching do not supply a contrast', () => {
    const state = create({ foundation: false }), world = worldApi.create(); prepareCondition(state, world);
    for (const [status, fatigue] of [['met', .2], ['unmet', .8], ['met', .4], ['unmet', .4]]) {
        conditionRest(state, world, fatigue); assert.equal(labelLife(state, world, conditionDemo('ja', status)).relationLearning, undefined);
        finishLife(state, world);
    }
    conditionRest(state, world);
    assert.equal(labelLife(state, world, conditionDemo('ja', 'met'), { speaker: 'friend' }).relationLearning, undefined);
    state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(labelLife(state, world, conditionDemo('ja', 'met')).relationLearning, undefined);
    api.perceive(state, worldApi.perception(world)); labelLife(state, world, conditionDemo('ja', 'met'));
    worldApi.approach(world, 'berry:1'); assert.equal(world.relationLabels.length, 0);
    assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'condition').length, 0);
    for (let i = 0; i < 3; i++) {
        conditionRest(state, world); labelLife(state, world, conditionDemo('ja', 'met'));
        labelLife(state, world, conditionDemo('ja', 'met')); finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'condition').length, 1);
    assert.equal(state.knowledge.relations.some(r => r.id === 'condition'), false);
    conditionRest(state, world, .2); labelLife(state, world, conditionDemo('ja', 'unmet')); finishLife(state, world);
    const knowledge = JSON.stringify(state.knowledge);
    for (let i = 0; i < 3; i++) { notebookApi.entries(state); relationLearning.learn(state); }
    assert.equal(JSON.stringify(state.knowledge), knowledge);
});
test('3c3b: a single rest, simultaneous prerequisite acquisition and different languages cannot teach the condition', () => {
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    conditionRest(state, world); labelLife(state, world, '休む'); labelLife(state, world, '「疲れた」');
    assert.equal(labelLife(state, world, conditionDemo('ja', 'met')).relationLearning, undefined); finishLife(state, world);
    conditionRest(state, world); labelLife(state, world, proposalDemo('ja', 'request')); finishLife(state, world);
    conditionRest(state, world); labelLife(state, world, proposalDemo('ja', 'invitation'));
    assert.equal(labelLife(state, world, conditionDemo('ja', 'met')).relationLearning, undefined); finishLife(state, world);
    assert.equal(state.knowledge.relationEvidence.some(e => e.relation === 'condition'), false);
    prepareCondition(state, world, 'en');
    conditionRest(state, world); labelLife(state, world, conditionDemo('ja', 'met'));
    // Even two matching states during one long rest are one teaching opportunity.
    world.fatigue = .2; labelLife(state, world, conditionDemo('ja', 'unmet')); finishLife(state, world);
    assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'condition').length, 1);
    conditionRest(state, world, .2); labelLife(state, world, conditionDemo('en', 'unmet'), { locale: 'en' }); finishLife(state, world);
    assert.equal(state.knowledge.relations.some(r => r.id === 'condition'), false);
    conditionRest(state, world, .2); labelLife(state, world, conditionDemo('ja', 'unmet')); finishLife(state, world);
    assert.equal(say(state, catalog.conditionTeaching.ja.utterance).understandings[0].complete, true);
    assert.equal(say(state, catalog.conditionTeaching.en.utterance, { locale: 'en' }).understandings[0].complete, false);
});
test('3c3b: reversed contrasts retain exact scope and cannot schedule actions or erase other clauses', () => {
    for (const locale of Object.keys(catalog.conditionTeaching)) {
        const state = create({ foundation: false }), world = worldApi.create(); prepareCondition(state, world, locale);
        for (const [status, fatigue] of [['unmet', .2], ['met', .8]]) {
            conditionRest(state, world, fatigue); labelLife(state, world, conditionDemo(locale, status), { locale }); finishLife(state, world);
        }
        const raw = catalog.conditionTeaching[locale].utterance;
        for (const [text, options] of [[raw, { speaker: 'friend' }], [`${raw}?`, {}], [`${raw}\n${catalog.proposalTeaching[locale].request.utterance}`, {}]]) {
            const result = labelLife(state, world, text, { locale, ...options });
            assert.ok(result.understandings.some(u => !u.complete)); assert.equal(result.conditionJudgment, undefined);
            assert.notEqual(world.mode, 'move'); assert.equal(world.destination, null);
        }
        const result = labelLife(state, world, raw, { locale });
        assert.equal(result.understandings[0].complete, true); assert.equal(result.conditionJudgment.status, 'unknown');
        assert.equal(result.conditionJudgment.observation, null);
        const knowledge = JSON.stringify(state.knowledge);
        for (let i = 0; i < 10; i++) worldApi.tick(world, .1);
        assert.equal(world.destination, null); assert.equal(JSON.stringify(state.knowledge), knowledge);
        assert.deepEqual(result.understandings[0].relationReferences.map(r => r.id).sort(), ['condition', 'request']);
    }
});
test('3c3b: pending and completed saves reject forged sensations, prerequisites, scope and source links', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create(); prepareCondition(state, world);
    conditionRest(state, world); labelLife(state, world, conditionDemo('ja', 'met'));
    const pending = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(pending));
    for (const mutate of [l => { l.observation.status = 'unmet'; }, l => { l.observation.before = .9; },
        l => { l.conditionBasis.evidence[0].experienceId = -1; }, l => { l.proposalBasis.scope.form = 'other'; },
        l => { l.demonstratedStatus = 'unmet'; }, l => { l.observation.at += 1; }]) {
        const bad = structuredClone(pending); mutate(bad.world.relationLabels[0]); assert.equal(valid(bad), false);
    }
    finishLife(state, world); conditionRest(state, world, .2); labelLife(state, world, conditionDemo('ja', 'unmet')); finishLife(state, world);
    conditionRest(state, world); labelLife(state, world, catalog.conditionTeaching.ja.utterance);
    const saved = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(saved));
    const change = (v, fn) => {
        for (const e of [...v.state.experiences, ...v.world.experiences]) for (const l of e.relationLabels || []) if (l.relation === 'condition') fn(l);
    };
    for (const mutate of [
        v => change(v, l => { l.raw = conditionDemo('ja', 'unmet'); }),
        v => change(v, l => { l.observation.subject = 'player'; }),
        v => change(v, l => { l.observation.before = .9; }),
        v => change(v, l => { l.conditionSubject = 'player'; }),
        v => change(v, l => { l.proposalForm = 'other'; }),
        v => change(v, l => { l.application = 'always'; }),
        v => change(v, l => { l.understanding.conditionStatus = 'met'; }),
        v => change(v, l => { l.roles.actualParticipation = true; }),
        v => { v.state.knowledge.relationEvidence.find(e => e.relation === 'condition').experienceId = -1; },
        v => { v.state.knowledge.relations.find(r => r.id === 'condition').scope.duration = 'forever'; },
        v => { v.state.context.turns.at(-1).conditionJudgment.status = 'unmet'; },
        v => { v.state.context.turns.at(-1).conditionJudgment.observation = null; },
        v => { v.state.context.turns.at(-1).conditionJudgment.raw = '休んでね'; },
        v => { v.state.context.turns.at(-1).conditionJudgment.inputId = 'input:9999'; }
    ]) { const bad = structuredClone(saved); mutate(bad); assert.equal(valid(bad), false, mutate.toString()); }
});
test('3c3b: unknown tiredness cannot be obtained from a condition or the same completion, and thresholds keep an unknown band', () => {
    for (const locale of Object.keys(catalog.conditionTeaching)) {
        const state = create({ foundation: false, life: false }), world = worldApi.create();
        conditionRest(state, world); labelLife(state, world, questionForms[locale][2], { locale }); finishLife(state, world);
        for (const kind of ['request', 'invitation']) {
            conditionRest(state, world); labelLife(state, world, proposalDemo(locale, kind), { locale }); finishLife(state, world);
        }
        conditionRest(state, world); labelLife(state, world, `「${tiredForms[locale]}」`, { locale });
        assert.equal(labelLife(state, world, conditionDemo(locale, 'met'), { locale }).relationLearning, undefined);
        finishLife(state, world);
        assert.equal(state.knowledge.relationEvidence.some(e => e.relation === 'condition'), false);
        assert.ok(state.knowledge.meanings.some(m => m.id === 'tired'));
        for (const [fatigue, status] of [[.55, 'met'], [.25, 'unmet']]) {
            conditionRest(state, world, fatigue); labelLife(state, world, conditionDemo(locale, status), { locale }); finishLife(state, world);
        }
        for (const fatigue of [.549999, .250001]) {
            conditionRest(state, world, fatigue);
            assert.equal(labelLife(state, world, catalog.conditionTeaching[locale].utterance, { locale }).conditionJudgment.status, 'unknown');
        }
        assert.equal(state.knowledge.relations.some(r => ['negation', 'time', 'sequence', 'reason', 'correction', 'contrast'].includes(r.id)), false);
    }
});
test('3c3a: disconnected clauses cannot dispatch a final proposal across eight starts and seven locales', () => {
    const { valid } = require('../scripts/experimental/storage');
    const forms = {
        ja: ['疲れたら', '食べ終わったら', 'その理由なら', '訂正すると', 'でも', '少し休もう'],
        en: ['If you are tired', 'After eating', 'Because of that', 'To correct that', 'But', "let's rest"],
        'zh-CN': ['如果你累了', '吃完以后', '因为这件事', '更正一下', '但是', '一起休息吧'],
        ru: ['Если ты устал', 'После еды', 'По этой причине', 'Поправка', 'Но', 'давай отдохнём'],
        'es-ES': ['Si estás cansado', 'Después de comer', 'Por esa razón', 'Para corregir eso', 'Pero', 'descansemos un poco'],
        'pt-BR': ['Se você estiver cansado', 'Depois de comer', 'Por esse motivo', 'Para corrigir isso', 'Mas', 'vamos descansar um pouco'],
        de: ['Wenn du müde bist', 'Nach dem Essen', 'Aus diesem Grund', 'Zur Korrektur', 'Aber', 'ruhen wir uns etwas aus']
    };
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [locale, formsInLocale] of Object.entries(forms)) {
            const options = { foundation, life, speech }, proposal = formsInLocale.at(-1);
            const singleState = create(options), singleWorld = worldApi.create();
            const single = say(singleState, proposal, { locale });
            worldApi.respond(singleWorld, single, singleState);
            assert.equal(single.understandings[0].complete, foundation && life);
            assert.equal(singleWorld.destination, foundation && life ? 'shade' : null);
            for (const prefix of formsInLocale.slice(0, -1)) for (const separator of ['\n', '。']) {
                let state = create(options), world = worldApi.create();
                const before = JSON.stringify(state.knowledge);
                for (let repeat = 0; repeat < 2; repeat++) {
                    const result = say(state, prefix + separator + proposal, { locale });
                    assert.equal(result.interpretations.length, 2);
                    assert.equal(result.understandings.at(-1).complete, false, `${locale}: ${prefix}`);
                    assert.ok(result.understandings.at(-1).unresolved.some(u => u.type === 'clause_scope'));
                    worldApi.respond(world, result, state);
                    assert.equal(world.destination, null, `${locale}: ${prefix}`);
                    assert.equal(JSON.stringify(state.knowledge), before);
                    assert.equal(world.experiences.length, 0);
                    const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                    assert.ok(valid(saved));
                    ({ state, world } = saved);
                }
            }
        }
    }
});

test('3c3a: a disconnected retraction cannot invalidate the preceding name or confirmation', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const speech of ['gesture', 'short']) for (const raw of [
        'もし違うなら。さっきの説明は間違えた', 'さっきの説明は間違えた。とは言っていない',
        'その場合だけ\nううん', 'ううん\nとは言っていない'
    ]) {
        const state = create({ speech }), world = worldApi.create(); focus(state);
        const original = say(state, 'これをぽぽって呼ぼう');
        state.context.pendingQuestion = { kind: 'confirm_name', speaker: 'player', word: 'ぽぽ',
            target: 'berry:1', inputId: original.input.id, expires: state.serial + 3 };
        const before = JSON.stringify(state.knowledge.associations[0]);
        const result = say(state, raw);
        assert.ok(result.understandings.some(u => u.unresolved.some(item => item.type === 'clause_scope')));
        assert.equal(state.records[0].retractedBy, undefined, raw);
        assert.equal(JSON.stringify(state.knowledge.associations[0]), before, raw);
        assert.ok(state.knowledge.associations.slice(1).every(link => link.evidence.length === 0));
        assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
    }
});

test('3c3a: bounded condition, sequence, reason, correction and contrast do not acquire themselves', () => {
    const { valid } = require('../scripts/experimental/storage');
    const cases = [
        ['condition', '疲れたら休んでね'], ['sequence', '食べ終わったら散歩しよう'],
        ['reason', 'どうして休んだの？'], ['correction', 'さっきの説明は間違えた'],
        ['contrast', '昨日は悲しかったけど、今はうれしい']
    ];
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [relation, raw] of cases) {
            const state = create({ foundation, life, speech }), world = worldApi.create();
            const before = JSON.stringify(state.knowledge);
            for (let repeat = 0; repeat < 3; repeat++) {
                const result = say(state, raw);
                assert.ok(result.interpretations.some(f => f.relations.includes(relation)));
                if (!foundation) assert.ok(result.understandings.some(u => u.unresolved.some(r => r.id === relation)));
                if (['condition', 'sequence'].includes(relation)) assert.equal(result.understandings[0].conditionStatus, 'unknown');
                if (relation === 'correction') assert.equal(result.understandings[0].complete, false);
                if (relation === 'contrast' && foundation && life) {
                    assert.deepEqual(result.understandings.map(u => [u.subject, u.eventTime, u.known.meaning]),
                        [['player', 'yesterday', 'sad'], ['player', 'now', 'happy']]);
                }
                worldApi.respond(world, result, state);
                assert.equal(world.destination, null);
                assert.equal(JSON.stringify(state.knowledge), before);
                assert.equal(world.experiences.length, 0);
                assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
            }
        }
    }
});

test('3c2: one original rest changes from present to past across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.timeTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareNegation(state, world, locale);
            const meanings = JSON.stringify(state.knowledge.meanings), count = state.records.length;
            for (const time of ['now', 'past']) {
                startRelationActivity(state, world, 'rest');
                const result = labelLife(state, world, timeDemo(locale, time), { locale, at: 1000 + state.serial });
                assert.equal(result.interpretations[0].kind, 'time_demonstration');
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(state.records.length, count, 'demonstration is not testimony');
                if (!foundation) {
                    const label = result.relationLearning.adopted;
                    assert.equal(label.eventTime, time); assert.equal(label.understanding.eventTime, 'unspecified');
                    if (time === 'past') {
                        assert.ok(label.eventReference.end <= label.start);
                        assert.notEqual(label.heardAt, label.eventReference.end);
                        assert.equal(label.eventReference.experienceId, state.knowledge.relationEvidence.find(e => e.relation === 'time').experienceId);
                    }
                }
                const saved = structuredClone({ version: 1, appearance: 'robot', state, world });
                assert.ok(valid(saved), `${locale} ${time} pending`); ({ state, world } = saved);
                finishLife(state, world); assert.ok(valid({ ...saved, state, world }));
                if (!foundation) assert.equal(state.knowledge.relations.filter(r => r.id === 'time').length, time === 'now' ? 0 : 2);
            }
            const knowledge = JSON.stringify(state.knowledge), experiences = JSON.stringify(state.experiences);
            world.mode = 'observe'; world.destination = null;
            const body = JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]);
            for (const time of ['now', 'past']) {
                const result = say(state, catalog.timeTeaching[locale][time].utterance, { locale, at: 9000 }), u = result.understandings[0];
                assert.equal(u.complete, true); assert.equal(u.subject, 'self'); assert.equal(u.eventTime, time);
                assert.equal(u.roles.verified, false); assert.equal(u.reportSource.heardAt, 9000);
                assert.equal(result.reaction.action, null);
                const response = worldApi.respond(world, result, state);
                assert.equal(response.message, speech === 'gesture' ? 'attend' : time === 'past' ? 'heard_report_past' : 'heard_report_self');
                assert.equal(state.records.at(-1).source, 'speaker_report');
                if (!foundation) assert.deepEqual(u.relationReferences.map(r => r.id).sort(), ['report', 'time']);
            }
            assert.equal(JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]), body);
            assert.equal(world.destination, null);
            relationLearning.learn(state); notebookApi.entries(state);
            assert.equal(JSON.stringify(state.knowledge), knowledge); assert.equal(JSON.stringify(state.experiences), experiences);
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
            if (!foundation) assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_time_learned'));
            assert.ok(valid(structuredClone({ version: 1, appearance: 'robot', state, world })));
        }
    }
});
test('3c2: time scope does not erase negation, subjects, speakers, extra clauses or missing relations', () => {
    for (const locale of Object.keys(catalog.timeTeaching)) {
        const state = create({ foundation: false }), world = worldApi.create(); prepareNegation(state, world, locale);
        for (const time of ['now', 'past']) {
            startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo(locale, time), { locale }); finishLife(state, world);
        }
        for (const time of ['now', 'past']) {
            const forms = catalog.timeTeaching[locale][time];
            for (const text of [forms.player, forms.negative, forms.playerNegative]) {
                const u = say(state, text, { locale }).understandings[0];
                assert.equal(u.complete, false); assert.equal(u.eventTime, 'unspecified');
                assert.ok(u.unresolved.some(e => e.id === 'time'));
                if (text !== forms.player) { assert.equal(u.polarity, 'unknown'); assert.ok(u.unresolved.some(e => e.id === 'negation')); }
            }
            for (const text of [forms.utterance + '?', forms.utterance + ' xyz']) assert.equal(say(state, text, { locale }).understandings[0].complete, false);
            assert.equal(say(state, forms.utterance, { locale, speaker: 'friend' }).understandings[0].complete, false);
        }
        for (const [activity, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
            startRelationActivity(state, world, activity); labelLife(state, world, negationDemo(locale, polarity), { locale }); finishLife(state, world);
        }
        const u = say(state, catalog.timeTeaching[locale].past.negative, { locale }).understandings[0];
        assert.equal(u.complete, false); assert.equal(u.eventTime, 'unspecified'); assert.equal(u.polarity, 'unknown');
        assert.deepEqual([...new Set(state.knowledge.relations.map(r => r.id))].sort(), ['negation', 'report', 'time']);
    }
});
test('3c2: no past without retained present; repetition, ambiguity, wrong activity and interrupted teaching do not acquire time', () => {
    const state = create({ foundation: false }), world = worldApi.create(); prepareNegation(state, world);
    startRelationActivity(state, world, 'rest');
    assert.equal(labelLife(state, world, timeDemo('ja', 'past')).relationLearning, undefined);
    assert.equal(labelLife(state, world, timeDemo('ja', 'now'), { speaker: 'friend' }).relationLearning, undefined);
    state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(labelLife(state, world, timeDemo('ja', 'now')).relationLearning, undefined);
    api.perceive(state, worldApi.perception(world));
    labelLife(state, world, timeDemo('ja', 'now')); labelLife(state, world, timeDemo('ja', 'now'));
    assert.equal(labelLife(state, world, timeDemo('ja', 'past')).relationLearning, undefined);
    finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo('ja', 'now')); finishLife(state, world);
    assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'time').length, 1);
    startRelationActivity(state, world, 'eat'); assert.equal(labelLife(state, world, timeDemo('ja', 'past')).relationLearning, undefined); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo('ja', 'past'));
    worldApi.approach(world, 'berry:1');
    assert.equal(world.relationLabels.length, 0); assert.equal(state.knowledge.relations.some(r => r.id === 'time'), false);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo('ja', 'past')); finishLife(state, world);
    assert.equal(state.knowledge.relations.filter(r => r.id === 'time').length, 2, 'repeated present did not replace the retained source');
});
test('3c2: missing meaning and report cannot be learned in the same completion; languages do not combine', () => {
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest'); labelLife(state, world, '休む');
    assert.equal(labelLife(state, world, timeDemo('ja', 'now')).relationLearning, undefined); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('ja', 'self')); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('ja', 'player'));
    assert.equal(labelLife(state, world, timeDemo('ja', 'now')).relationLearning, undefined); finishLife(state, world);
    prepareNegation(state, world, 'en');
    startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo('ja', 'now')); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); assert.equal(labelLife(state, world, timeDemo('en', 'past'), { locale: 'en' }).relationLearning, undefined);
    assert.equal(state.knowledge.relations.some(r => r.id === 'time'), false);
});
test('3c2: save validation rejects altered time, original event, prerequisite, input and report source', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false }), world = worldApi.create(); prepareNegation(state, world);
    for (const time of ['now', 'past']) { startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo('ja', time)); finishLife(state, world); }
    say(state, catalog.timeTeaching.ja.past.utterance);
    const saved = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(saved));
    const change = (v, fn) => {
        for (const e of [...v.state.experiences, ...v.world.experiences]) for (const l of e.relationLabels || []) if (l.relation === 'time' && l.eventTime === 'past') fn(l);
    };
    for (const mutate of [
        v => change(v, l => { l.eventReference.end += 1; }),
        v => change(v, l => { l.eventReference.experienceId = -1; }),
        v => change(v, l => { l.eventReference.inputId = l.inputId; }),
        v => change(v, l => { l.raw = timeDemo('ja', 'now'); }),
        v => change(v, l => { l.understanding.eventTime = 'past'; }),
        v => change(v, l => { l.reportBasis.scope.roles.contentSubject = 'player'; }),
        v => change(v, l => { l.roles.contentSubject = 'player'; }),
        v => { v.state.knowledge.relations.find(r => r.id === 'time').scope.eventTime = 'past'; },
        v => { v.state.records.at(-1).understandings[0].eventTime = 'now'; },
        v => { v.state.records.at(-1).understandings[0].reportSource.raw = catalog.timeTeaching.ja.now.utterance; },
        v => { v.state.records.at(-1).understandings[0].reportSource.heardAt += 1; }
    ]) { const bad = structuredClone(saved); mutate(bad); assert.equal(valid(bad), false, mutate.toString()); }
    startRelationActivity(state, world, 'rest');
    const clean = create({ foundation: false }), other = worldApi.create(); prepareNegation(clean, other);
    startRelationActivity(clean, other, 'rest'); labelLife(clean, other, timeDemo('ja', 'now'));
    const pending = { version: 1, appearance: 'robot', state: clean, world: other }; assert.ok(valid(pending));
    pending.world.relationLabels[0].eventReference.start += 1; assert.equal(valid(pending), false);
});

test('3c1: predicate polarity contrast across eight starts and seven languages retains sources and save boundaries', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.negationTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            prepareNegation(state, world, locale);
            const meanings = JSON.stringify(state.knowledge.meanings), recordCount = state.records.length;
            for (const [activity, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
                startRelationActivity(state, world, activity);
                const result = labelLife(state, world, negationDemo(locale, polarity), { locale });
                assert.equal(result.interpretations[0].kind, 'negation_demonstration');
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(state.records.length, recordCount, 'teaching is not a report');
                if (!foundation) {
                    assert.equal(result.understandings[0].polarity, 'unknown');
                    assert.equal(result.relationLearning.adopted.polarity, polarity);
                    assert.equal(result.relationLearning.adopted.observationBasis.id, activity);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale} ${polarity}`); ({ state, world } = saved);
                finishLife(state, world); assert.ok(valid({ ...saved, state, world }));
                if (!foundation) assert.equal(state.knowledge.relations.filter(r => r.id === 'negation').length, polarity === 'positive' ? 0 : 2);
            }
            const knowledge = JSON.stringify(state.knowledge), origins = JSON.stringify(state.experiences);
            world.mode = 'observe'; world.destination = null;
            const before = JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]);
            const result = say(state, catalog.negationTeaching[locale].negative.utterance, { locale }), u = result.understandings[0];
            assert.equal(u.complete, true); assert.equal(u.kind, 'report'); assert.equal(u.subject, 'self');
            assert.equal(u.known.meaning, 'rest'); assert.equal(u.polarity, 'negative'); assert.equal(u.eventTime, 'unspecified');
            assert.equal(u.roles.verified, false); assert.equal(result.reaction.action, null);
            assert.equal(worldApi.respond(world, result, state).message, speech === 'gesture' ? 'attend' : 'heard_report_not_resting');
            assert.equal(world.mode, 'observe'); assert.equal(world.destination, null);
            assert.equal(JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]), before);
            assert.equal(state.records.at(-1).source, 'speaker_report');
            assert.equal(u.reportSource.raw, catalog.negationTeaching[locale].negative.utterance);
            if (!foundation) {
                assert.deepEqual(u.relationReferences.map(r => r.id).sort(), ['negation', 'report']);
                assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_negation_learned'));
                assert.equal(say(state, catalog.negationTeaching[locale].negative.utterance, { locale, speaker: 'friend' }).understandings[0].complete, false);
            }
            relationLearning.learn(state); notebookApi.entries(state);
            assert.equal(JSON.stringify(state.knowledge), knowledge); assert.equal(JSON.stringify(state.experiences), origins);
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
            assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
        }
    }
});
test('3c1: report and both action meanings must precede contrast; repetition, mismatch and interruption cannot teach negation', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest');
    assert.equal(labelLife(state, world, negationDemo('ja', 'positive')).relationLearning, undefined);
    prepareNegation(state, world);
    for (const [activity, polarity] of [['rest', 'negative'], ['eat', 'positive']]) {
        startRelationActivity(state, world, activity);
        assert.equal(labelLife(state, world, negationDemo('ja', polarity)).relationLearning, undefined);
    }
    for (let i = 0; i < 3; i++) {
        startRelationActivity(state, world, 'rest');
        labelLife(state, world, negationDemo('ja', 'positive')); labelLife(state, world, negationDemo('ja', 'positive'));
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.filter(e => e.relation === 'negation').length, 1);
    assert.equal(state.knowledge.relations.some(r => r.id === 'negation'), false);
    startRelationActivity(state, world, 'eat');
    assert.equal(labelLife(state, world, negationDemo('ja', 'negative'), { speaker: 'friend' }).relationLearning, undefined);
    assert.equal(labelLife(state, world, catalog.negationTeaching.ja.negative.utterance).relationLearning, undefined);
    api.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: 'berry' }, { id: 'other', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, negationDemo('ja', 'negative')).relationLearning, undefined);
    api.perceive(state, worldApi.perception(world)); labelLife(state, world, negationDemo('ja', 'negative'));
    assert.equal(worldApi.approach(world, 'path'), false, 'eating cannot be interrupted by approach');
    const interrupted = create({ foundation: false }), interruptedWorld = worldApi.create();
    prepareNegation(interrupted, interruptedWorld); startRelationActivity(interrupted, interruptedWorld, 'rest');
    labelLife(interrupted, interruptedWorld, negationDemo('ja', 'positive'));
    assert.equal(worldApi.approach(interruptedWorld, 'path'), true); assert.deepEqual(interruptedWorld.relationLabels, []);
    assert.equal(interrupted.knowledge.relationEvidence.some(e => e.relation === 'negation'), false);
    assert.equal(state.knowledge.relations.some(r => r.id === 'negation'), false);
    const unknown = create({ foundation: false, life: false }), otherWorld = worldApi.create();
    startRelationActivity(unknown, otherWorld, 'rest'); labelLife(unknown, otherWorld, '休む'); finishLife(unknown, otherWorld);
    for (const subject of ['self', 'player']) {
        startRelationActivity(unknown, otherWorld, 'rest'); labelLife(unknown, otherWorld, reportDemo('ja', subject)); finishLife(unknown, otherWorld);
    }
    startRelationActivity(unknown, otherWorld, 'eat'); labelLife(unknown, otherWorld, '食べる');
    assert.equal(labelLife(unknown, otherWorld, negationDemo('ja', 'negative')).relationLearning, undefined);
    finishLife(unknown, otherWorld);
    assert.equal(unknown.knowledge.relationEvidence.some(e => e.relation === 'negation'), false, 'same completion cannot supply missing action knowledge');
});
test('3c1: scoped negation never grants time, conditions, sequence, reasons, correction or contrast', () => {
    for (const locale of Object.keys(catalog.negationTeaching)) {
        const state = create({ foundation: false }), world = worldApi.create(); prepareNegation(state, world, locale);
        for (const [activity, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
            startRelationActivity(state, world, activity); labelLife(state, world, negationDemo(locale, polarity), { locale }); finishLife(state, world);
        }
        const evidence = JSON.stringify(state.knowledge.relationEvidence);
        const raw = catalog.negationTeaching[locale].negative.utterance;
        for (const text of [`${raw}?`, `${raw} unknown`, `unknown ${raw}`, `「${raw}」`,
            '昨日あなたは休んでいない', '私は休んでいない', 'あなたは食べていない', '休まないで',
            '疲れたら休んでね', '食べ終わったら散歩しよう', 'どうして休んだの？', 'さっきの説明は間違えた', '木の実は嫌いじゃない']) {
            world.mode = 'observe'; world.destination = null;
            const result = labelLife(state, world, text, { locale });
            assert.equal(result.understandings.every(u => u.complete), false, `${locale} ${text}`);
            assert.equal(world.destination, null); assert.equal(result.relationLearning, undefined);
        }
        assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence);
        assert.deepEqual([...new Set(state.knowledge.relations.map(r => r.id))].sort(), ['negation', 'report']);
    }
});
test('3c1: saved polarity, predicate, teaching source, action basis and report basis cannot be replaced', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create(); prepareNegation(state, world);
    for (const [activity, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
        startRelationActivity(state, world, activity); labelLife(state, world, negationDemo('ja', polarity)); finishLife(state, world);
    }
    say(state, catalog.negationTeaching.ja.negative.utterance);
    const saved = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(saved));
    const changeLabels = (v, change) => { for (const events of [v.state.experiences, v.world.experiences]) change(events.at(-1).relationLabels[0]); };
    for (const mutate of [
        v => changeLabels(v, l => { l.polarity = 'positive'; }),
        v => changeLabels(v, l => { l.raw = negationDemo('ja', 'positive'); }),
        v => changeLabels(v, l => { l.reportForm = 'other'; }),
        v => changeLabels(v, l => { l.meaning = 'eat'; }),
        v => changeLabels(v, l => { l.roles.contentSubject = 'player'; }),
        v => changeLabels(v, l => { l.observationBasis = l.basis; }),
        v => changeLabels(v, l => { l.understanding.polarity = 'negative'; }),
        v => changeLabels(v, l => { l.reportBasis = { id: 'report', source: 'initial' }; }),
        v => changeLabels(v, l => { l.reportBasis.evidence = ['input:999']; }),
        v => { v.state.knowledge.relations.find(r => r.id === 'negation').scope.polarity = 'other'; },
        v => { v.state.knowledge.relationEvidence.at(-1).experienceId = v.state.knowledge.relationEvidence.at(-2).experienceId; },
        v => { v.state.records.at(-1).understandings[0].polarity = 'positive'; },
        v => { v.state.records.at(-1).understandings[0].reportSource.raw = catalog.reportTeaching.ja.self.utterance; },
        v => { v.state.records.at(-1).understandings[0].eventTime = 'now'; }
    ]) { const broken = structuredClone(saved); mutate(broken); assert.equal(!!valid(broken), false); }
});

test('3c1: contrast is order independent and does not combine languages or acquire report and negation together', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('ja', 'self')); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('ja', 'player'));
    assert.equal(labelLife(state, world, negationDemo('ja', 'positive')).relationLearning, undefined);
    finishLife(state, world);
    assert.equal(state.knowledge.relationEvidence.some(e => e.relation === 'negation'), false);
    prepareNegation(state, world, 'en');
    startRelationActivity(state, world, 'eat'); labelLife(state, world, negationDemo('ja', 'negative')); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, negationDemo('en', 'positive'), { locale: 'en' }); finishLife(state, world);
    assert.equal(state.knowledge.relations.some(r => r.id === 'negation'), false);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, negationDemo('ja', 'positive')); finishLife(state, world);
    assert.equal(say(state, catalog.negationTeaching.ja.negative.utterance).understandings[0].complete, true);
    assert.equal(say(state, catalog.negationTeaching.en.negative.utterance, { locale: 'en' }).understandings[0].complete, false);
    const { valid } = require('../scripts/experimental/storage');
    assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
});

test('3b3: report subject contrast across eight starts and seven locales survives pending and acquired saves', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.reportTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            if (!life) {
                startRelationActivity(state, world, 'rest'); labelLife(state, world, questionForms[locale][2], { locale }); finishLife(state, world);
            }
            const meanings = JSON.stringify(state.knowledge.meanings);
            for (const [index, subject] of ['self', 'player'].entries()) {
                startRelationActivity(state, world, 'rest');
                const result = labelLife(state, world, reportDemo(locale, subject), { locale });
                assert.equal(result.interpretations[0].kind, 'report_demonstration');
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(state.records.length, 0, 'a teaching example is not an actual report');
                assert.equal(state.context.turns.at(-1).answer, undefined);
                if (!foundation) {
                    assert.equal(result.relationLearning.adopted.roles.contentSubject, subject);
                    assert.equal(result.relationLearning.adopted.roles.verified, false);
                    assert.equal(state.knowledge.relations.length, 0);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale}`); ({ state, world } = saved);
                finishLife(state, world); assert.ok(valid({ ...saved, state, world }), `completed ${locale}`);
                if (!foundation) assert.equal(state.knowledge.relations.length, index * 2);
            }
            const learned = JSON.stringify([state.knowledge.relations, state.knowledge.relationEvidence]), origins = JSON.stringify(state.experiences);
            for (const subject of ['self', 'player']) {
                world.mode = 'observe'; world.destination = null;
                const before = JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]);
                const raw = catalog.reportTeaching[locale][subject].utterance;
                const result = say(state, raw, { locale }), u = result.understandings[0];
                assert.equal(u.complete, true); assert.equal(u.kind, 'report'); assert.equal(u.subject, subject);
                assert.deepEqual(u.roles, { reporter: 'player', contentSubject: subject, status: 'reported', verified: false });
                assert.equal(u.eventTime, 'unspecified'); assert.equal(u.reportSource.inputId, result.input.id);
                assert.equal(worldApi.respond(world, result, state).message, speech === 'gesture' ? 'attend' : `heard_report_${subject}`);
                assert.equal(world.mode, 'observe'); assert.equal(world.destination, null);
                assert.equal(JSON.stringify([world.hunger, world.fatigue, world.interests, world.experiences]), before);
                assert.equal(state.records.at(-1).source, 'speaker_report');
                assert.equal(state.records.at(-1).understandings[0].subject, subject);
                assert.equal(state.records.at(-1).understandings[0].reportSource.raw, raw);
                assert.equal(labelLife(state, world, reportDemo(locale, subject), { locale }).relationLearning, undefined);
                if (!foundation) {
                    assert.equal(u.relationReferences[0].evidence.length, 2);
                    assert.equal(say(state, raw, { locale, speaker: 'friend' }).understandings[0].complete, false);
                    assert.equal(say(state, raw, { locale: locale === 'ja' ? 'en' : 'ja' }).understandings[0].complete, false);
                    assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_report_learned'));
                }
            }
            const knowledge = JSON.stringify(state.knowledge);
            notebookApi.entries(state); relationLearning.learn(state);
            assert.equal(JSON.stringify(state.knowledge), knowledge);
            assert.equal(JSON.stringify([state.knowledge.relations, state.knowledge.relationEvidence]), learned);
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
            assert.equal(JSON.stringify(state.experiences), origins);
            assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
        }
    }
});

test('3b3: no role learning from repetition, raw reports, same-rest contrast, unknown content or interruption', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest');
    for (const raw of ['あなたは休んでいる', '私は休んでいる', '【報告・私】「あなたは休んでいる」',
        '【報告・あなた】「何してる？」→「休む」', '【報告・私】「私は未知している」']) {
        assert.equal(labelLife(state, world, raw).relationLearning, undefined);
    }
    assert.equal(labelLife(state, world, reportDemo('ja', 'self'), { speaker: 'friend' }).relationLearning, undefined);
    labelLife(state, world, reportDemo('ja', 'self'));
    assert.equal(labelLife(state, world, reportDemo('ja', 'player')).relationLearning, undefined);
    finishLife(state, world);
    for (let i = 0; i < 2; i++) {
        startRelationActivity(state, world, 'rest');
        for (let j = 0; j < 3; j++) labelLife(state, world, reportDemo('ja', 'self'));
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.length, 1); assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('en', 'player'), { locale: 'en' }); finishLife(state, world);
    assert.equal(state.knowledge.relations.length, 0, 'different locales do not combine');
    startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo('ja', 'player'));
    worldApi.approach(world, 'path'); assert.deepEqual(world.relationLabels, []);
    startRelationActivity(state, world, 'eat'); assert.equal(labelLife(state, world, reportDemo('ja', 'player')).relationLearning, undefined);
    startRelationActivity(state, world, 'rest'); focus(state);
    assert.equal(labelLife(state, world, reportDemo('ja', 'player')).relationLearning, undefined);
    api.perceive(state, { scene: 'shade', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, reportDemo('ja', 'player')).relationLearning, undefined);
    const unknown = lifeFixture('rest', { foundation: false });
    api.perceive(unknown.state, worldApi.perception(unknown.world)); labelLife(unknown.state, unknown.world, '休む');
    assert.equal(labelLife(unknown.state, unknown.world, reportDemo('ja', 'self')).relationLearning, undefined);
    finishLife(unknown.state, unknown.world); assert.equal(unknown.state.knowledge.relationEvidence.length, 0);
});

test('3b3: seven-language unknown, conditional, negative, third-person and question boundaries remain unresolved', () => {
    const rejected = {
        ja: ['私は休んでいない', '疲れたら私は休む', '彼は休んでいる', '私は未知している', '昨日私は休んでいた', '悲しい'],
        en: ['I am not resting', 'If tired, I rest', 'He is resting', 'I am glorping', 'I rested yesterday'],
        'zh-CN': ['我没在休息', '累了我就休息', '他在休息', '我在咕噜', '我昨天休息了'],
        ru: ['Я не отдыхаю', 'Если устану, отдохну', 'Он отдыхает', 'Я глорпаю', 'Я отдыхал вчера'],
        'es-ES': ['Yo no estoy descansando', 'Si me canso, descanso', 'Él está descansando', 'Yo estoy glorpando', 'Ayer descansé'],
        'pt-BR': ['Eu não estou descansando', 'Se ficar cansado, descanso', 'Ele está descansando', 'Eu estou glorpando', 'Eu descansei ontem'],
        de: ['Ich ruhe mich nicht aus', 'Wenn ich müde bin, ruhe ich mich aus', 'Er ruht sich aus', 'Ich glorpe', 'Gestern habe ich geruht']
    };
    for (const [locale, forms] of Object.entries(rejected)) {
        const state = create({ foundation: false }), world = worldApi.create();
        for (const subject of ['player', 'self']) {
            startRelationActivity(state, world, 'rest'); labelLife(state, world, reportDemo(locale, subject), { locale }); finishLife(state, world);
        }
        const evidence = JSON.stringify(state.knowledge.relationEvidence);
        for (const raw of [...forms, `${catalog.reportTeaching[locale].self.utterance}?`]) {
            world.mode = 'observe'; world.destination = null;
            const result = labelLife(state, world, raw, { locale });
            assert.ok(result.understandings.some(u => !u.complete), raw); assert.equal(world.destination, null);
            startRelationActivity(state, world, 'rest');
            assert.equal(labelLife(state, world, `${catalog.reportTeaching[locale].self.marker}「${raw}」`, { locale }).relationLearning, undefined);
        }
        assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence);
        assert.deepEqual([...new Set(state.knowledge.relations.map(r => r.id))], ['report']);
    }
});

test('3b through-check: all roles and 3a coexist across eight starts and seven languages; forged saves fail', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.reportTeaching)) {
            const state = create({ foundation, life, speech }), world = worldApi.create();
            const [q, eat, rest] = questionForms[locale];
            if (!life) for (const [activity, raw] of [['eat', eat], ['rest', rest]]) {
                startRelationActivity(state, world, activity); labelLife(state, world, raw, { locale }); finishLife(state, world);
            }
            startRelationActivity(state, world, 'eat'); labelLife(state, world, relationForms[locale][0], { locale });
            labelLife(state, world, demo(q, eat), { locale }); finishLife(state, world);
            startRelationActivity(state, world, 'rest'); labelLife(state, world, relationForms[locale][1], { locale });
            labelLife(state, world, demo(q, rest), { locale }); labelLife(state, world, proposalDemo(locale, 'request'), { locale });
            labelLife(state, world, reportDemo(locale, 'self'), { locale });
            if (!foundation) assert.equal(world.relationLabels.length, 4);
            const pending = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(structuredClone(pending)));
            finishLife(state, world);
            startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo(locale, 'invitation'), { locale });
            labelLife(state, world, reportDemo(locale, 'player'), { locale }); finishLife(state, world);
            if (!foundation) assert.equal(state.knowledge.relations.length, 6);
            for (const [activity, polarity] of [['rest', 'positive'], ['eat', 'negative']]) {
                startRelationActivity(state, world, activity); labelLife(state, world, negationDemo(locale, polarity), { locale });
                assert.ok(valid(structuredClone({ version: 1, appearance: 'robot', state, world })));
                finishLife(state, world);
            }
            assert.equal(say(state, catalog.negationTeaching[locale].negative.utterance, { locale }).understandings[0].complete, true);
            for (const time of ['now', 'past']) {
                startRelationActivity(state, world, 'rest'); labelLife(state, world, timeDemo(locale, time), { locale });
                assert.ok(valid(structuredClone({ version: 1, appearance: 'robot', state, world }))); finishLife(state, world);
            }
            assert.equal(say(state, catalog.timeTeaching[locale].past.utterance, { locale }).understandings[0].eventTime, 'past');
            if (!life) {
                conditionRest(state, world); labelLife(state, world, `「${tiredForms[locale]}」`, { locale }); finishLife(state, world);
            }
            for (const [status, fatigue] of [['met', .8], ['unmet', .2]]) {
                conditionRest(state, world, fatigue); labelLife(state, world, conditionDemo(locale, status), { locale });
                assert.ok(valid(structuredClone({ version: 1, appearance: 'robot', state, world }))); finishLife(state, world);
            }
            assert.equal(say(state, catalog.conditionTeaching[locale].utterance, { locale }).understandings[0].complete, true);
            startRelationActivity(state, world, 'eat'); labelLife(state, world, sequenceDemo(locale, 'before'), { locale });
            assert.ok(valid(structuredClone({ version: 1, appearance: 'robot', state, world }))); finishLife(state, world);
            labelLife(state, world, sequenceDemo(locale, 'after'), { locale });
            assert.equal(say(state, catalog.sequenceTeaching[locale].utterance, { locale }).understandings[0].complete, true);
            for (const stage of ['question', 'reason']) for (const choice of ['request', 'invitation']) {
                completeSelectedRest(state, world, choice, locale);
                labelLife(state, world, reasonDemo(locale, stage, choice), { locale });
            }
            assert.equal(say(state, catalog.reasonTeaching[locale].utterance, { locale }).understandings[0].complete, true);
            const correction = catalog.correctionTeaching[locale];
            // Use a fresh word to avoid earlier activity-specific explanations.
            const newWord = locale === 'ja' ? 'るる' : 'lulu';
            const originalText = correction.exampleSource.replace(locale === 'ja' ? 'ぽぽ' : 'popo', newWord);
            const replacementText = correction.exampleReplacement.replace(locale === 'ja' ? 'ぽぽ' : 'popo', newWord);
            const preserved = JSON.stringify(state.experiences);
            const originalInput = labelLife(state, world, originalText, { locale }).input.id;
            labelLife(state, world, `${correction.source}«${originalText}»`, { locale });
            labelLife(state, world, `${correction.replacement}«${replacementText}»`, { locale });
            assert.equal(labelLife(state, world, replacementText, { locale }).understandings[0].corrects, originalInput);
            assert.equal(JSON.stringify(state.experiences), preserved);
            const beforeFeelings = JSON.stringify(state.knowledge);
            teachFeelings(state, world, locale);
            assert.equal(JSON.stringify(state.knowledge), beforeFeelings);
            assert.equal(JSON.stringify(state.experiences), preserved);
            for (const raw of [q, catalog.proposalTeaching[locale].request.utterance, catalog.proposalTeaching[locale].invitation.utterance,
                catalog.reportTeaching[locale].self.utterance, catalog.reportTeaching[locale].player.utterance, relationForms[locale][1]]) {
                assert.equal(say(state, raw, { locale }).understandings[0].complete, true, `${locale}: ${raw}`);
            }
            const value = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(structuredClone(value)));
            if (foundation) continue;
            const last = state.experiences.findIndex(e => e.relationLabels?.some(l => l.relation === 'report' && l.roles.contentSubject === 'player'));
            for (const mutate of [
                v => { v.state.knowledge.relations.find(r => r.id === 'report').scope.roles.verified = true; },
                v => { v.state.knowledge.relations.find(r => r.id === 'report').scope.form = 'other'; },
                v => { v.state.knowledge.relations.find(r => r.id === 'report').scope.meaning = 'eat'; },
                v => { v.state.knowledge.relationEvidence.find(e => e.relation === 'report').experienceId = 'missing'; },
                v => { for (const e of [v.world.experiences[last], v.state.experiences[last]]) e.relationLabels[1].roles.contentSubject = 'self'; },
                v => { for (const e of [v.world.experiences[last], v.state.experiences[last]]) e.relationLabels[1].raw = reportDemo(locale, 'self'); },
                v => { for (const e of [v.world.experiences[last], v.state.experiences[last]]) e.relationLabels[1].basis.id = 'eat'; },
                v => { for (const e of [v.world.experiences[last], v.state.experiences[last]]) e.relationLabels[1].inputId = e.relationLabels[0].inputId; },
                v => { v.state.experiences[last].relationLabels.pop(); },
                v => { v.state.knowledge.relationEvidence.push(v.state.knowledge.relationEvidence.at(-1)); },
                v => { v.state.records.find(r => r.understandings[0].aspect === 'activity_report').understandings[0].roles.verified = true; },
                v => { v.state.records.find(r => r.understandings[0].aspect === 'activity_report').understandings[0].reportSource.contentSubject = 'other'; },
                v => { v.state.records.find(r => r.understandings[0].aspect === 'activity_report').understandings[0].reportSource.raw = 'unknown'; },
                v => { v.state.records.find(r => r.understandings[0].aspect === 'activity_report').understandings[0].reportSource.inputId = 'input:99999'; },
                v => { v.state.records.find(r => r.understandings[0].aspect === 'activity_report').source = 'experience'; }
            ]) { const changed = structuredClone(value); mutate(changed); assert.equal(!!valid(changed), false, locale); }
        }
    }
});
test('3b2: role contrast grounds scoped requests and invitations across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(catalog.proposalTeaching)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            if (!life) {
                startRelationActivity(state, world, 'rest');
                labelLife(state, world, questionForms[locale][2], { locale }); finishLife(state, world);
            }
            const meanings = JSON.stringify(state.knowledge.meanings);
            for (const [index, kind] of ['request', 'invitation'].entries()) {
                startRelationActivity(state, world, 'rest');
                const before = world.activityStart;
                const result = labelLife(state, world, proposalDemo(locale, kind), { locale });
                assert.equal(result.interpretations[0].kind, 'proposal_demonstration');
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(world.activityStart, before); assert.equal(world.mode, 'rest');
                assert.equal(state.context.turns.at(-1).answer, undefined);
                if (!foundation) {
                    assert.equal(result.relationLearning.adopted.roles.actualParticipation, false);
                    assert.equal(state.knowledge.relations.length, 0);
                    assert.deepEqual(result.relationLearning.adopted.roles.actors, kind === 'request' ? ['self'] : ['player', 'self']);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale}`); ({ state, world } = saved);
                finishLife(state, world); assert.ok(valid({ ...saved, state, world }), `complete ${locale}`);
                if (!foundation) assert.equal(state.knowledge.relations.length, index ? 2 : 0);
            }
            const learned = JSON.stringify([state.knowledge.relations, state.knowledge.relationEvidence]), origins = JSON.stringify(state.experiences);
            for (const kind of ['request', 'invitation']) {
                const raw = catalog.proposalTeaching[locale][kind].utterance;
                world.mode = 'observe'; world.destination = null;
                const repeated = labelLife(state, world, proposalDemo(locale, kind), { locale });
                assert.equal(repeated.relationLearning, undefined);
                assert.equal(world.destination, null, 'teaching examples never dispatch actions, even after acquisition');
                const result = say(state, raw, { locale }), u = result.understandings[0];
                assert.equal(u.complete, true); assert.equal(u.kind, kind); assert.equal(u.subject, 'self');
                assert.deepEqual(u.roles.actors, kind === 'request' ? ['self'] : ['player', 'self']);
                assert.equal(u.roles.status, 'proposed'); assert.equal(u.roles.actualParticipation, false);
                if (!foundation) {
                    assert.equal(u.relationReferences[0].evidence.length, 2);
                    assert.equal(say(state, raw, { locale, speaker: 'friend' }).understandings[0].complete, false);
                    assert.equal(say(state, raw, { locale: locale === 'ja' ? 'en' : 'ja' }).understandings[0].complete, false);
                }
                world.mode = 'eat'; world.destination = null;
                assert.equal(worldApi.respond(world, result, state).message, speech === 'short' ? 'keep_looking' : 'looking');
                assert.equal(world.mode, 'eat'); assert.equal(world.destination, null);
                world.mode = 'observe'; world.attention = 'shade'; world.dwell = 1;
                assert.equal(worldApi.respond(world, say(state, raw, { locale }), state).message, speech === 'short' ? 'join' : 'attend');
                assert.equal(world.destination, 'shade');
            }
            const knowledge = JSON.stringify(state.knowledge);
            notebookApi.entries(state); relationLearning.learn(state);
            assert.equal(JSON.stringify(state.knowledge), knowledge);
            assert.equal(JSON.stringify([state.knowledge.relations, state.knowledge.relationEvidence]), learned);
            assert.equal(JSON.stringify(state.experiences), origins);
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
            assert.equal(state.records.length, 0);
            if (!foundation) assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_proposal_learned'));
        }
    }
});

test('3b2: seven-language conditions, negation, changed actors and unknown actions are not stripped', () => {
    const rejected = {
        ja: ['疲れたら休んでね', '休まないで', '彼と一緒に休もう', '一緒に未知しよう'],
        en: ['If you are tired, please rest', 'Please do not rest', 'Let him rest', "Let's glorp together"],
        'zh-CN': ['如果累了请休息吧', '请不要休息', '请他休息吧', '一起咕噜吧'],
        ru: ['Если устал, отдохни, пожалуйста', 'Не отдыхай, пожалуйста', 'Пусть он отдохнёт', 'Давай глорпать вместе'],
        'es-ES': ['Si estás cansado, descansa', 'No descanses, por favor', 'Que él descanse', 'Vamos a glorp juntos'],
        'pt-BR': ['Se estiver cansado, descanse', 'Não descanse, por favor', 'Deixe ele descansar', 'Vamos glorp juntos'],
        de: ['Wenn du müde bist, ruh dich aus', 'Ruh dich bitte nicht aus', 'Er soll sich ausruhen', 'Lass uns zusammen glorpen']
    };
    for (const [locale, forms] of Object.entries(rejected)) {
        const state = create({ foundation: false }), world = worldApi.create();
        for (const kind of ['request', 'invitation']) {
            startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo(locale, kind), { locale }); finishLife(state, world);
        }
        const evidence = JSON.stringify(state.knowledge.relationEvidence);
        for (const raw of forms) {
            world.mode = 'observe'; world.destination = null;
            const result = labelLife(state, world, raw, { locale });
            assert.ok(result.understandings.some(u => !u.complete), raw); assert.equal(world.destination, null, raw);
            startRelationActivity(state, world, 'rest');
            assert.equal(labelLife(state, world, `${catalog.proposalTeaching[locale].request.marker}「${raw}」`, { locale }).relationLearning, undefined);
        }
        assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence);
    }
});

test('3b2: raw coincidence, repeated requests, same-rest role pairs, unknown content and interrupted rest cannot teach', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'rest');
    for (const raw of ['休んでね', '一緒に休もう', '【お願い】「食べてね」', '【誘い】「休んでね」',
        '【お願い】「疲れたら休んでね」', '【お願い】「休まないでね」', '【お願い】「彼は休んでね」',
        '【お願い】「未知してね」', '【お願い】「休んでね」。一緒に休もう']) {
        assert.equal(labelLife(state, world, raw).relationLearning, undefined, raw);
    }
    assert.equal(labelLife(state, world, proposalDemo('ja', 'request'), { speaker: 'friend' }).relationLearning, undefined);
    labelLife(state, world, proposalDemo('ja', 'request'));
    assert.equal(labelLife(state, world, proposalDemo('ja', 'invitation')).relationLearning, undefined);
    finishLife(state, world);
    for (let i = 0; i < 3; i++) {
        startRelationActivity(state, world, 'rest');
        for (let j = 0; j < 3; j++) labelLife(state, world, proposalDemo('ja', 'request'));
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.length, 1); assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo('ja', 'invitation'));
    worldApi.approach(world, 'path'); assert.deepEqual(world.relationLabels, []);
    assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'eat');
    assert.equal(labelLife(state, world, proposalDemo('ja', 'invitation')).relationLearning, undefined);
    startRelationActivity(state, world, 'rest');
    api.perceive(state, { scene: 'shade', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, proposalDemo('ja', 'invitation')).relationLearning, undefined);
    const unknown = lifeFixture('rest', { foundation: false });
    api.perceive(unknown.state, worldApi.perception(unknown.world)); labelLife(unknown.state, unknown.world, '休む');
    assert.equal(labelLife(unknown.state, unknown.world, proposalDemo('ja', 'request')).relationLearning, undefined);
    finishLife(unknown.state, unknown.world); assert.deepEqual(unknown.state.knowledge.relationEvidence, []);
});

test('3b2: learned roles do not supply unknown negation, conditions, time, content or other forms', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    for (const kind of ['invitation', 'request']) {
        startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo('ja', kind)); finishLife(state, world);
    }
    for (const raw of ['疲れたら休んでね', '休まないで', '食べ終わったら、一緒に休もう', '今から休んでね',
        '彼と一緒に休もう', '少し休もう', '食べてね', '悲しい', '何してる？', 'ぽぽは休むことだよ']) {
        world.mode = 'observe'; world.attention = 'shade'; world.destination = null;
        const result = labelLife(state, world, raw);
        assert.ok(result.understandings.some(u => !u.complete), raw);
        assert.equal(world.destination, null, raw);
    }
    assert.deepEqual(state.knowledge.relations.map(r => r.id).sort(), ['invitation', 'request']);
});

test('3b2: 3a and 3b1 coexist; saves reject forged roles, inputs, contrast, scope and origins', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat'); labelLife(state, world, relationForms.ja[0]);
    labelLife(state, world, demo('何してる？', '食べる')); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, relationForms.ja[1]);
    labelLife(state, world, demo('何してる？', '休む')); labelLife(state, world, proposalDemo('ja', 'request'));
    assert.equal(world.relationLabels.length, 3); finishLife(state, world);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, proposalDemo('ja', 'invitation')); finishLife(state, world);
    assert.equal(state.knowledge.relations.length, 4);
    const value = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(value));
    for (const mutate of [
        v => { v.state.knowledge.relations.find(r => r.id === 'request').scope.form = '食べてね'; },
        v => { v.state.knowledge.relations.find(r => r.id === 'invitation').scope.roles.actors = ['self']; },
        v => { v.state.knowledge.relations.find(r => r.id === 'request').scope.meaning = 'eat'; },
        v => { v.state.knowledge.relationEvidence.find(e => e.relation === 'invitation').experienceId = v.state.experiences[1].id; },
        v => { for (const e of [v.world.experiences[2], v.state.experiences[2]]) e.relationLabels[0].roles.actualParticipation = true; },
        v => { for (const e of [v.world.experiences[2], v.state.experiences[2]]) e.relationLabels[0].raw = proposalDemo('ja', 'request'); },
        v => { for (const e of [v.world.experiences[2], v.state.experiences[2]]) e.relationLabels[0].basis.id = 'eat'; },
        v => { for (const e of [v.world.experiences[2], v.state.experiences[2]]) e.relationLabels[0].inputId = v.state.experiences[1].relationLabels[2].inputId; },
        v => { v.state.experiences[2].relationLabels = []; },
        v => { v.state.knowledge.relationEvidence.push(v.state.knowledge.relationEvidence.at(-1)); }
    ]) { const changed = structuredClone(value); mutate(changed); assert.equal(!!valid(changed), false); }
});
test('3b1: witnessed contrasting answers teach only the demonstrated question across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [locale, [question, eat, rest]] of Object.entries(questionForms)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            if (!life) for (const [activity, raw] of [['eat', eat], ['rest', rest]]) {
                startRelationActivity(state, world, activity); labelLife(state, world, raw, { locale }); finishLife(state, world);
            }
            assert.equal(say(state, question, { locale }).understandings[0].complete, foundation);
            const meanings = JSON.stringify(state.knowledge.meanings);
            for (const [index, activity] of ['eat', 'rest'].entries()) {
                startRelationActivity(state, world, activity);
                const result = labelLife(state, world, demo(question, index === 0 ? eat : rest), { locale });
                assert.equal(result.interpretations[0].kind, 'question_demonstration', locale);
                assert.equal(result.understandings[0].complete, foundation);
                assert.equal(state.context.turns.at(-1).answer, undefined);
                if (!foundation) {
                    assert.equal(result.relationLearning.adopted.roles.actualAnswer, false);
                    assert.equal(state.knowledge.relations.length, 0);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale}`); ({ state, world } = saved);
                finishLife(state, world); assert.ok(valid({ ...saved, state, world }), `finished ${locale}`);
            }
            const origin = JSON.stringify(state.experiences), relations = JSON.stringify(state.knowledge.relations),
                evidence = JSON.stringify(state.knowledge.relationEvidence);
            const result = say(state, question, { locale });
            assert.equal(result.understandings[0].complete, true);
            assert.equal(result.understandings[0].questionSlot, 'current_activity');
            if (!foundation) {
                assert.equal(result.understandings[0].relationReferences[0].evidence.length, 2);
                assert.equal(say(state, question, { locale, speaker: 'friend' }).understandings[0].complete, false);
                assert.equal(say(state, question, { locale: locale === 'ja' ? 'en' : 'ja' }).understandings[0].complete, false);
                for (const raw of ['何をしているの？', '何してた？', '休んでね', '少し休もう', '悲しい', '甘い？']) {
                    assert.equal(say(state, raw).understandings[0].complete, false);
                }
                assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_question_learned'));
            }
            const knowledge = JSON.stringify(state.knowledge);
            notebookApi.entries(state); relationLearning.learn(state);
            assert.equal(JSON.stringify(state.knowledge), knowledge);
            assert.equal(JSON.stringify(state.knowledge.relations), relations);
            assert.equal(JSON.stringify(state.knowledge.relationEvidence), evidence);
            assert.equal(JSON.stringify(state.experiences), origin);
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
            const destination = world.destination, mode = world.mode;
            const response = worldApi.respond(world, say(state, question, { locale }), state);
            assert.equal(response.message, speech === 'gesture' ? 'attend' : 'taking_break');
            assert.equal(world.destination, destination); assert.equal(world.mode, mode);
            if (!foundation) {
                const example = labelLife(state, world, demo(question, rest), { locale });
                assert.equal(example.understandings[0].complete, true);
                assert.equal(example.relationLearning, undefined);
                assert.equal(state.context.turns.at(-1).answer, undefined);
                assert.equal(state.records.length, 0, 'examples are not speaker reports');
                if (!life && speech === 'short') {
                    world.mode = 'move'; world.destination = 'path'; world.attention = null;
                    const current = say(state, question, { locale });
                    assert.equal(current.understandings[0].complete, true);
                    assert.equal(worldApi.respond(world, current, state).message, 'answer_unknown', 'question knowledge does not supply unknown walking meaning');
                }
            }
        }
    }
});

test('3b1: raw questions, fixed answers, unknown content, wrong subjects and interruptions do not teach', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat');
    for (const raw of ['何してる？', '何してる？ 食べる', demo('何してる？', '休む'),
        demo('何してる？', '未知'), demo('彼は何してる？', '食べる'), demo('何してた？', '食べる'),
        demo('何してない？', '食べる'), demo('食べたら何してる？', '食べる'), demo('何してる？', '食べない')]) {
        assert.equal(labelLife(state, world, raw).relationLearning, undefined, raw);
    }
    assert.equal(labelLife(state, world, demo('何してる？', '食べる'), { speaker: 'friend' }).relationLearning, undefined);
    for (let i = 0; i < 3; i++) {
        startRelationActivity(state, world, 'eat');
        for (let j = 0; j < 3; j++) labelLife(state, world, demo('何してる？', '食べる'));
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.length, 1); assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, demo('何してる？', '休む'));
    worldApi.approach(world, 'path'); assert.deepEqual(world.relationLabels, []);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, demo('何をしているの？', '休む')); finishLife(state, world);
    assert.equal(state.knowledge.relations.length, 0, 'different questions cannot supply the missing contrast');
    startRelationActivity(state, world, 'rest');
    api.perceive(state, { scene: 'shade', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, demo('何してる？', '休む')).relationLearning, undefined);
    const unknown = lifeFixture('eat', { foundation: false });
    api.perceive(unknown.state, worldApi.perception(unknown.world));
    labelLife(unknown.state, unknown.world, '食べる');
    assert.equal(labelLife(unknown.state, unknown.world, demo('何してる？', '食べる')).relationLearning, undefined);
    finishLife(unknown.state, unknown.world); assert.deepEqual(unknown.state.knowledge.relationEvidence, []);
});

test('3b1: naming and question sources coexist and saves reject forged roles, scope, examples and basis', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false }), world = worldApi.create();
    for (const [i, activity] of ['eat', 'rest'].entries()) {
        startRelationActivity(state, world, activity); labelLife(state, world, relationForms.ja[i]);
        labelLife(state, world, demo('何してる？', i ? '休む' : '食べる'));
        assert.equal(world.relationLabels.length, 2); finishLife(state, world);
    }
    assert.equal(state.knowledge.relations.length, 2);
    const value = { version: 1, appearance: 'robot', state, world }; assert.ok(valid(value));
    for (const mutate of [
        v => { v.state.knowledge.relations.find(r => r.id === 'question').scope.form = '何してた'; },
        v => { v.state.knowledge.relations.find(r => r.id === 'question').scope.slot = 'past_activity'; },
        v => { v.state.knowledge.relations.find(r => r.id === 'question').evidence.reverse(); },
        v => { v.state.knowledge.relationEvidence.find(e => e.relation === 'question').experienceId = 999; },
        v => { for (const e of [v.world.experiences[0], v.state.experiences[0]]) e.relationLabels[1].roles.actualAnswer = true; },
        v => { for (const e of [v.world.experiences[0], v.state.experiences[0]]) e.relationLabels[1].raw = demo('何してる？', '休む'); },
        v => { for (const e of [v.world.experiences[0], v.state.experiences[0]]) e.relationLabels[1].basis.id = 'rest'; },
        v => { v.state.experiences[0].relationLabels.splice(1); },
        v => { for (const e of [v.world.experiences[1], v.state.experiences[1]]) e.relationLabels[1].inputId = v.state.experiences[0].relationLabels[1].inputId; },
        v => { v.state.knowledge.relationEvidence.push(v.state.knowledge.relationEvidence[1]); }
    ]) {
        const changed = JSON.parse(JSON.stringify(value)); mutate(changed); assert.equal(!!valid(changed), false);
    }
});

function correctionFixture(options = {}, locale = 'ja') {
    const state = create({ foundation: false, ...options }), world = worldApi.create();
    if (!state.settings.life) for (const [i, activity] of ['eat', 'rest'].entries()) {
        startRelationActivity(state, world, activity);
        labelLife(state, world, questionForms[locale][i + 1], { locale }); finishLife(state, world);
    }
    if (!state.settings.foundation) for (const [i, activity] of ['eat', 'rest'].entries()) {
        startRelationActivity(state, world, activity);
        labelLife(state, world, relationForms[locale][i], { locale }); finishLife(state, world);
    }
    api.perceive(state, { scene: 'clearing', attention: [] });
    const forms = catalog.correctionTeaching[locale];
    const old = labelLife(state, world, forms.exampleSource, { locale });
    const source = `${forms.source}«${forms.exampleSource}»`, replacement = `${forms.replacement}«${forms.exampleReplacement}»`;
    return { state, world, forms, old, source, replacement };
}
test('3c3e2: teaching and actual correction stay separate across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const locale of Object.keys(relationForms)) {
            let { state, world, forms, old, source, replacement } = correctionFixture({ foundation, life, speech }, locale);
            const origins = JSON.stringify(state.experiences), original = structuredClone(state.knowledge.wordExplanations);
            assert.ok(labelLife(state, world, source, { locale }).relationLearning, `source ${locale}`);
            const reload = () => {
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `${foundation}:${life}:${speech}:${locale}`); ({ state, world } = saved);
            };
            reload();
            assert.ok(labelLife(state, world, replacement, { locale }).relationLearning, `replacement ${locale}`);
            assert.deepEqual(state.knowledge.wordExplanations, original);
            assert.equal(state.knowledge.relations.filter(r => r.id === 'correction').length, 1);
            const relations = JSON.stringify(state.knowledge.relations);
            labelLife(state, world, source, { locale }); labelLife(state, world, replacement, { locale });
            assert.equal(JSON.stringify(state.knowledge.relations), relations);
            reload();
            if (!foundation) {
                assert.equal(say(state, forms.exampleReplacement, { locale, speaker: 'friend' }).understandings[0].complete, false);
                api.perceive(state, { scene: 'other', attention: [] });
                assert.equal(say(state, forms.exampleReplacement, { locale }).understandings[0].complete, false);
                api.perceive(state, { scene: 'clearing', attention: [] });
                assert.equal(state.knowledge.relations.some(r => ['negation', 'contrast'].includes(r.id)), false);
            }
            const result = labelLife(state, world, forms.exampleReplacement, { locale });
            assert.equal(result.understandings[0].corrects, old.input.id);
            assert.equal(state.knowledge.wordExplanations[0].retractedBy, result.input.id);
            assert.equal(JSON.stringify(state.experiences), origins);
            reload();
            for (let i = 0; i < 20; i++) labelLife(state, world, 'unknown xyz', { locale });
            reload();
            assert.equal(notebookApi.entries(state).filter(e => e.message === 'note_correction_demo').length, 2);
        }
    }
});
test('3c3e2: incomplete, ambiguous, foreign, unknown and legacy sources cannot teach or retract', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const failure of ['reverse', 'unknown', 'speaker', 'locale', 'scope', 'ambiguous', 'legacy', 'changed']) {
        const { state, world, forms, source, replacement } = correctionFixture();
        if (failure === 'ambiguous') labelLife(state, world, 'ぽぽは食べることだよ');
        if (failure === 'legacy') {
            delete state.knowledge.wordExplanations[0].input;
            for (const r of state.records) if (r.understandings[0].wordExplanation) delete r.understandings[0].wordExplanation.input;
        }
        if (failure !== 'reverse') labelLife(state, world, source);
        if (failure === 'scope') api.perceive(state, { scene: 'elsewhere', attention: [] });
        if (failure === 'changed') labelLife(state, world, 'ぽぽは食べることだよ');
        labelLife(state, world, failure === 'unknown' ? replacement.replace('食べる', '謎めく') : replacement,
            failure === 'speaker' ? { speaker: 'friend' } : failure === 'locale' ? { locale: 'en' } : {});
        assert.equal(state.knowledge.relations.some(r => r.id === 'correction'), false, failure);
        assert.ok(state.knowledge.wordExplanations.every(e => !e.retractedBy), failure);
        assert.ok(valid({ version: 1, appearance: 'robot', state, world }), failure);
    }
});
test('3c3e2: saved source, teaching time, basis, direction and acquired scope reject edits', () => {
    const { valid } = require('../scripts/experimental/storage');
    const { state, world, source, replacement, forms } = correctionFixture({ life: false });
    labelLife(state, world, source); labelLife(state, world, replacement);
    labelLife(state, world, forms.exampleReplacement);
    const value = { version: 1, appearance: 'robot', state, world };
    assert.ok(valid(value));
    for (const mutate of [
        v => v.state.correctionLessons[0].original.input.raw = 'changed',
        v => v.state.correctionLessons[0].source.input.locale = 'en',
        v => v.state.correctionLessons[0].replacement.input.raw = source,
        v => v.state.correctionLessons[0].replacement.at = -1,
        v => v.state.correctionLessons[0].source.namingBasis = [],
        v => v.state.correctionLessons[0].replacement.basis.evidence = [],
        v => v.state.correctionLessons[0].replacement.scope.scene = 'elsewhere',
        v => v.state.correctionLessons[0].replacement.understanding.known.meaning = 'rest',
        v => v.state.knowledge.relations.find(r => r.id === 'correction').scope.original = 'input:1',
        v => delete v.state.records.at(-1).understandings[0].relationReferences,
        v => v.state.correctionLessons.push(structuredClone(v.state.correctionLessons[0]))
    ]) { const edited = structuredClone(value); mutate(edited); assert.equal(valid(edited), false); }
});
test('3c3e2: prerequisites, exact source and unchanged replacement cannot be supplied by teaching marks', () => {
    const forms = catalog.correctionTeaching.ja;
    for (const options of [{ foundation: false, life: false }, { foundation: false, life: true }]) {
        const state = create(options), world = worldApi.create();
        for (const text of [forms.exampleSource, `${forms.source}«${forms.exampleSource}»`,
            `${forms.replacement}«${forms.exampleReplacement}»`]) labelLife(state, world, text);
        assert.equal(state.correctionLessons, undefined);
        assert.equal(state.knowledge.relations.length, 0);
        assert.equal(state.knowledge.wordExplanations, undefined);
    }
    const { state, world, source, replacement } = correctionFixture();
    labelLife(state, world, source.replace('休む', '食べる'));
    assert.equal(state.correctionLessons, undefined);
    labelLife(state, world, source);
    labelLife(state, world, replacement.replace('食べる', '休む'));
    assert.equal(state.correctionLessons[0].replacement, undefined);
    labelLife(state, world, replacement);
    for (const raw of ['さっき間違えた。もぐは食べることだよ', 'ぽぽは休むことじゃなくて、食べることだよ',
        'さっき間違えた。ぽぽは眠ることだよ', 'さっきの説明は間違えた', '雨なら。さっき間違えた。ぽぽは食べることだよ']) {
        assert.equal(labelLife(state, world, raw).understandings.every(u => u.complete), false, raw);
        assert.equal(state.knowledge.wordExplanations[0].retractedBy, undefined);
    }
    assert.equal(labelLife(state, world, forms.exampleReplacement).understandings[0].complete, true);
});
test('3c3e2: later experience cannot rewrite teaching basis and the opposite replacement needs its own lesson', () => {
    const { valid } = require('../scripts/experimental/storage');
    const { state, world, source, replacement } = correctionFixture({ life: false });
    labelLife(state, world, source);
    const originalSource = structuredClone(state.correctionLessons[0].source);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, '休む'); finishLife(state, world);
    assert.deepEqual(state.correctionLessons[0].source, originalSource);
    assert.equal(state.knowledge.relations.some(r => r.id === 'correction'), false);
    api.perceive(state, { scene: 'clearing', attention: [] });
    labelLife(state, world, replacement);
    assert.ok(valid({ version: 1, appearance: 'robot', state, world }));
    for (const locale of Object.keys(relationForms)) {
        const fixture = correctionFixture({}, locale), forms = catalog.correctionTeaching[locale];
        const rest = api.wordFrame(forms.exampleSource, locale).meaning;
        const eat = api.wordFrame(forms.exampleReplacement, locale).meaning;
        const raw = forms.exampleSource.replace(rest, eat).replace(locale === 'ja' ? 'ぽぽ' : 'popo', 'mimi');
        const correction = forms.exampleReplacement.replace(eat, rest).replace(locale === 'ja' ? 'ぽぽ' : 'popo', 'mimi');
        const old = labelLife(fixture.state, fixture.world, raw, { locale });
        labelLife(fixture.state, fixture.world, `${forms.source}«${raw}»`, { locale });
        labelLife(fixture.state, fixture.world, `${forms.replacement}«${correction}»`, { locale });
        assert.equal(labelLife(fixture.state, fixture.world, correction, { locale }).understandings[0].corrects, old.input.id);
        assert.ok(valid({ version: 1, appearance: 'robot', state: fixture.state, world: fixture.world }));
    }
});

test('3c3e1: learned naming recognizes only the explanation component of replacement across eight starts and seven locales', () => {
    const { valid } = require('../scripts/experimental/storage');
    const prefixes = { ja: 'さっき間違えた。', en: 'I was wrong. ', 'zh-CN': '刚才说错了，',
        ru: 'Я ошибся. ', 'es-ES': 'Me equivoqué. ', 'pt-BR': 'Eu errei. ', de: 'Ich habe mich geirrt. ' };
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [locale, forms] of Object.entries(relationForms)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            if (!life) for (const [i, activity] of ['eat', 'rest'].entries()) {
                startRelationActivity(state, world, activity);
                labelLife(state, world, questionForms[locale][i + 1], { locale }); finishLife(state, world);
            }
            if (!foundation) for (const [i, activity] of ['eat', 'rest'].entries()) {
                startRelationActivity(state, world, activity);
                labelLife(state, world, forms[i], { locale }); finishLife(state, world);
            }
            api.perceive(state, { scene: 'clearing', attention: [] });
            const old = labelLife(state, world, forms[1], { locale });
            const original = JSON.stringify(state.experiences);
            const knowledge = JSON.stringify(state.knowledge);
            const oldWord = api.wordFrame(forms[1], locale).word;
            const eatWord = api.wordFrame(forms[0], locale).word;
            const correction = prefixes[locale] + forms[0].replace(eatWord, oldWord);
            const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
            assert.ok(valid(saved)); ({ state, world } = saved);
            for (let i = 0; i < 3; i++) {
                const result = labelLife(state, world, correction, { locale });
                const u = result.understandings[0];
                assert.equal(u.known.meaning, 'eat'); assert.ok(u.relations.includes('naming'));
                if (!foundation) {
                    assert.deepEqual(u.unresolved, [{ type: 'relation', id: 'correction' }]);
                    assert.equal(u.complete, false);
                    assert.equal(u.relationReferences[0].scope.kind, 'word_explanation');
                    assert.equal(JSON.stringify(state.knowledge), knowledge);
                } else if (!i) {
                    assert.equal(u.corrects, old.input.id);
                    assert.equal(state.knowledge.wordExplanations.at(-1).input.raw, correction);
                }
            }
            assert.equal(JSON.stringify(state.experiences), original);
            const reloaded = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
            assert.ok(valid(reloaded), `${locale}:${foundation}:${life}:${speech}`);
            if (!foundation) {
                assert.equal(state.knowledge.relations.some(r => ['correction', 'negation', 'contrast'].includes(r.id)), false);
                assert.equal(say(state, correction, { locale, speaker: 'friend' }).understandings[0].relations.includes('naming'), false);
                const foreign = locale === 'en' ? 'de' : 'en';
                assert.equal(say(state, prefixes[foreign] + relationForms[foreign][0], { locale: foreign }).understandings[0].relations.includes('naming'), false);
                assert.equal(say(state, prefixes[locale] + forms[0].replace(questionForms[locale][1], 'unknownzz'), { locale }).understandings[0].relations.includes('naming'), false);
            }
        }
    }
});

test('3c3e1: explanation input provenance survives context eviction, corrections and legacy loading', () => {
    const state = create();
    const first = say(state, 'ぽぽは休むことだよ', { at: 11 });
    say(state, 'さっき間違えた。ぽぽは食べることだよ', { at: 22 });
    for (let i = 0; i < 20; i++) say(state, 'こんにちは');
    assert.ok(!state.context.turns.some(t => t.id === first.input.id));
    assert.deepEqual(state.knowledge.wordExplanations[0].input, first.input);
    assert.ok(api.validWordLearning(state, catalog));
    for (const mutate of [
        s => delete s.knowledge.wordExplanations[0].input,
        s => s.knowledge.wordExplanations[0].input.raw = 'ぽぽは食べることだよ',
        s => s.knowledge.wordExplanations[0].input.locale = 'en',
        s => s.knowledge.wordExplanations[0].input.at = 99,
        s => s.knowledge.wordExplanations[0].input.scene = 'elsewhere',
        s => s.records[0].understandings[0].wordExplanation.input.speaker = 'friend'
    ]) {
        const altered = structuredClone(state); mutate(altered);
        assert.equal(api.validWordLearning(altered, catalog), false);
    }
    // A synchronized edited source still has to parse to the retained meaning.
    const forged = structuredClone(state);
    forged.knowledge.wordExplanations[0].input.raw = 'ぽぽは食べることだよ';
    forged.records[0].understandings[0].wordExplanation.input.raw = 'ぽぽは食べることだよ';
    assert.equal(api.validWordLearning(forged, catalog), false);
    const legacy = structuredClone(state);
    for (const entry of legacy.knowledge.wordExplanations) delete entry.input;
    for (const record of legacy.records) delete record.understandings[0].wordExplanation.input;
    const before = JSON.stringify(legacy);
    assert.ok(api.validWordLearning(legacy, catalog)); assert.equal(JSON.stringify(legacy), before);
});

test('3a: grounded naming relations retain unknown history across eight starts and seven languages', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const [locale, forms] of Object.entries(relationForms)) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            // Life-unknown children first acquire the two actions through actual labelled completions.
            if (!life) for (const [activity, raw] of [['eat', '食べる'], ['rest', '休む']]) {
                startRelationActivity(state, world, activity); labelLife(state, world, raw); finishLife(state, world);
            }
            const meanings = JSON.stringify(state.knowledge.meanings);
            for (const [index, activity] of ['eat', 'rest'].entries()) {
                startRelationActivity(state, world, activity);
                const result = labelLife(state, world, forms[index], { locale });
                assert.equal(result.understandings[0].complete, foundation, `${locale}:${activity}`);
                if (!foundation) {
                    assert.ok(result.relationLearning, `${locale}:${activity}`);
                    assert.equal(state.knowledge.relations.length, 0);
                    assert.equal(state.knowledge.wordExplanations, undefined);
                }
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `pending ${locale}:${activity}`); ({ state, world } = saved);
                finishLife(state, world);
                assert.ok(valid({ ...saved, state, world }), `completed ${locale}:${activity}`);
                if (!foundation) assert.equal(state.knowledge.relations.length, index);
            }
            if (!foundation) {
                const original = JSON.stringify(state.experiences);
                const result = labelLife(state, world, forms[1], { locale });
                assert.ok(result.understandings[0].complete);
                assert.equal(result.understandings[0].relationReferences[0].evidence.length, 2);
                assert.equal(result.learning[0].updated.length, 1);
                assert.equal(say(state, forms[1], { locale, speaker: 'friend' }).understandings[0].complete, false);
                for (const raw of ['おいしかった？', '休んでね', '食べないで', '昨日は悲しかった', 'さっき間違えた。ぽぽは眠ることだよ']) {
                    assert.equal(say(state, raw).understandings[0].complete, false);
                }
                const before = JSON.stringify(state.knowledge);
                for (let i = 0; i < 3; i++) {
                    notebookApi.entries(state); assert.equal(relationLearning.learn(state).relationAcquired, false);
                }
                assert.equal(JSON.stringify(state.knowledge), before);
                assert.equal(JSON.stringify(state.experiences), original);
                assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_relation_learned'));
            }
            assert.equal(JSON.stringify(state.knowledge.meanings), meanings);
        }
    }
});

test('3a: repetition, unknown content, correction, conflicting words and interrupted actions cannot acquire relations', () => {
    const state = create({ foundation: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat');
    for (const raw of ['もぐは休むことだよ', 'もぐは未知のことだよ', 'さっき間違えた。もぐは食べることだよ', '食べるは食べることだよ']) {
        assert.equal(labelLife(state, world, raw).relationLearning, undefined);
    }
    assert.equal(labelLife(state, world, relationForms.ja[0], { speaker: 'friend' }).relationLearning, undefined);
    for (let i = 0; i < 3; i++) {
        startRelationActivity(state, world, 'eat');
        for (let j = 0; j < 4; j++) labelLife(state, world, relationForms.ja[0]);
        finishLife(state, world);
    }
    assert.equal(state.knowledge.relationEvidence.length, 1);
    assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest');
    assert.equal(labelLife(state, world, 'もぐは休むことだよ').relationLearning, undefined);
    labelLife(state, world, relationForms.ja[1]);
    worldApi.approach(world, 'path');
    assert.deepEqual(world.relationLabels, []);
    assert.equal(state.knowledge.relations.length, 0);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, relationForms.ja[1]); finishLife(state, world);
    assert.equal(state.knowledge.relations.length, 1);
    assert.equal(say(state, 'ぽぽは眠ることだよ').understandings[0].complete, false);
    assert.equal(say(state, relationForms.en[1], { locale: 'en' }).understandings[0].complete, false);
});

test('3a: unknown action meaning and ambiguous attention cannot be repaired by completion', () => {
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    startRelationActivity(state, world, 'eat');
    labelLife(state, world, '食べる');
    assert.equal(labelLife(state, world, relationForms.ja[0]).relationLearning, undefined);
    finishLife(state, world);
    assert.ok(state.knowledge.meanings.some(m => m.id === 'eat'));
    assert.deepEqual(state.knowledge.relationEvidence, []);
    startRelationActivity(state, world, 'eat');
    api.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: 'berry' }, { id: 'berry:99', meaning: 'berry' }] });
    assert.equal(labelLife(state, world, relationForms.ja[0]).relationLearning, undefined);
    finishLife(state, world);
    assert.deepEqual(state.knowledge.relationEvidence, []);
});

test('3a: saves reject forged relation scope, missing origins, altered raw input and retroactive knowledge', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false }), world = worldApi.create();
    for (const [i, activity] of ['eat', 'rest'].entries()) {
        startRelationActivity(state, world, activity); labelLife(state, world, relationForms.ja[i]); finishLife(state, world);
    }
    const value = { version: 1, appearance: 'robot', state, world };
    assert.ok(valid(value));
    for (const mutate of [
        v => { v.state.knowledge.relations[0].scope.kind = 'question'; },
        v => { v.state.knowledge.relations[0].scope.meanings.push('sleep'); },
        v => { v.state.knowledge.relations[0].source = 'initial'; },
        v => { v.state.knowledge.relationEvidence[0].experienceId = 999; },
        v => { v.state.experiences[0].relationLabels[0].subject = 'player'; },
        v => { v.state.experiences = []; },
        v => { v.world.experiences[0].relationLabels[0].raw = 'もぐは休むことだよ'; v.state.experiences[0].relationLabels[0].raw = 'もぐは休むことだよ'; },
        v => { v.world.experiences[0].relationLabels[0].at = -1; v.state.experiences[0].relationLabels[0].at = -1; }
    ]) {
        const changed = JSON.parse(JSON.stringify(value)); mutate(changed); assert.equal(!!valid(changed), false);
    }
    const legacy = { version: 1, appearance: 'robot', state: create({ foundation: false }), world: worldApi.create() };
    const before = JSON.stringify(legacy); assert.ok(valid(legacy)); assert.equal(JSON.stringify(legacy), before);
});

test('ID 2 end to end: life experience, bounded word use, correction and reload across eight starts', () => {
    const storage = require('../scripts/experimental/storage');
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        let { state, world } = lifeFixture('rest', { foundation, life, speech });
        for (const raw of ['休む', '眠る', '"疲れた"']) labelLife(state, world, raw);
        finishLife(state, world);
        const meaningBefore = JSON.stringify(state.knowledge.meanings);
        const experiencesBefore = JSON.stringify(state.experiences);
        const relationsBefore = JSON.stringify(state.knowledge.relations);
        const definition = labelLife(state, world, 'ぽぽは休むことだよ');
        assert.equal(definition.understandings[0].complete, foundation);
        if (!foundation) {
            assert.equal(state.knowledge.wordExplanations, undefined);
            assert.equal(say(state, '「ぽぽ」しよう').understandings[0].complete, false);
        } else {
            assert.equal(definition.learning[0].updated.length, 1);
            assert.equal(say(state, 'ぽぽは休むことだよ').learning[0].updated.length, 0);
            const applied = say(state, '「ぽぽ」しよう');
            assert.equal(applied.understandings[0].known.meaning, 'rest');
            assert.equal(applied.understandings[0].applications[0].candidates[0].inputId, definition.input.id);
            const response = worldApi.respond(world, applied, state);
            assert.equal(response.message, speech === 'short' ? 'join' : 'attend');
            // Persist a definition before correcting it, not just after.
            const value = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
            assert.ok(storage.valid(value)); ({ state, world } = value);
            const correction = labelLife(state, world, 'さっき間違えた。ぽぽは休むことじゃなくて、眠ることだよ');
            assert.equal(correction.understandings[0].corrects, definition.input.id);
            assert.equal(state.knowledge.wordExplanations[0].retractedBy, correction.input.id);
            assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
            assert.ok(notebookApi.entries(state).some(e => e.withdrawn && e.literal === 'ぽぽ → 休む'));
            assert.ok(notebookApi.entries(state).some(e => !e.withdrawn && e.literal === 'ぽぽ → 眠る'));
            const notes = notebookApi.displayEntries(notebookApi.groupedEntries(state), 12);
            assert.ok(notes.findIndex(e => e.sourceId === definition.input.id) < notes.findIndex(e => e.corrects === definition.input.id));
            assert.ok(storage.valid(JSON.parse(JSON.stringify(value))));
        }
        assert.equal(JSON.stringify(state.knowledge.meanings), meaningBefore);
        assert.equal(JSON.stringify(state.experiences), experiencesBefore);
        assert.equal(JSON.stringify(state.knowledge.relations), relationsBefore);
    }
});

test('word application respects speaker, scene, individual scope and never reinforces itself', () => {
    const state = create(); focus(state);
    say(state, 'ぽぽは休むことだよ');
    const before = JSON.stringify(state.knowledge);
    for (let i = 0; i < 15; i++) { say(state, 'ぽぽ'); notebookApi.entries(state); }
    assert.equal(JSON.stringify(state.knowledge), before);
    assert.equal(say(state, 'ぽぽ', { speaker: 'friend' }).understandings[0].known.meaning, undefined);
    focus(state, 'elsewhere');
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest'); // same individual
    api.perceive(state, { scene: 'elsewhere', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, undefined);
    say(state, 'ぽぽは眠ることだよ');
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
    focus(state); // original object and scene retain the original supported explanation
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest');
});

test('explicit replacement can revise an individual naming source without deleting the object experience', () => {
    const { state, world } = lifeFixture('eat', { life: true });
    focus(state); const name = say(state, 'これをぽぽって呼ぼう');
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(say(state, 'さっきは間違えた。ぽぽは休むことだよ').understandings[0].complete, false);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, undefined);
    focus(state);
    finishLife(state, world);
    const experiences = JSON.stringify(state.experiences);
    const correction = say(state, 'さっきは間違えた。ぽぽは休むことだよ');
    assert.equal(correction.understandings[0].corrects, name.input.id);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, correction.input.id);
    assert.equal(JSON.stringify(state.experiences), experiences);
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'rest');
    assert.ok(api.validWordLearning(JSON.parse(JSON.stringify(state))));
});

test('corrections target only one supported explanation; ambiguity and unknown relations remain unresolved', () => {
    const state = create(); focus(state);
    say(state, 'ぽぽは休むことだよ'); say(state, 'ぽぽは木の実のことだよ');
    const before = JSON.stringify(state.knowledge);
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false);
    assert.equal(say(state, 'さっき間違えた。ぽぽは眠ることだよ').understandings[0].complete, false);
    assert.equal(JSON.stringify(state.knowledge), before);
    const fixed = say(state, 'さっき間違えた。ぽぽは休むことじゃなくて、眠ることだよ');
    assert.ok(fixed.understandings[0].complete);
    assert.equal(state.knowledge.wordExplanations.filter(e => !e.retractedBy).length, 2);
    assert.ok(state.knowledge.wordExplanations.some(e => e.meaning === 'berry' && !e.retractedBy));
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false); // still two valid meanings
    for (const options of [{ speaker: 'friend' }, {}]) {
        const result = say(state, 'さっき間違えた。ぽぽは未知の動作のことだよ', options);
        assert.equal(result.understandings[0].complete, false);
    }
    assert.equal(state.knowledge.wordExplanations.length, 3);
    state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'correction');
    assert.equal(say(state, 'さっき間違えた。ぽぽは木の実のことじゃなくて、食べることだよ').understandings[0].complete, false);
    assert.equal(state.knowledge.wordExplanations.length, 3);
});

test('seven language definitions, applications and corrections preserve literal words and scope', () => {
    for (const [locale, define, use, correct] of [
        ['ja', 'ぽぽは休むことだよ', '「ぽぽ」しよう', 'さっき間違えた。ぽぽは眠ることだよ'],
        ['en', '"ぽぽ" means "rest"', 'let\'s "ぽぽ"', 'I was wrong. "ぽぽ" means "sleep"'],
        ['zh-CN', '“ぽぽ”的意思是“休息”', '一起“ぽぽ”吧', '刚才说错了。“ぽぽ”的意思是“睡觉”'],
        ['ru', '"ぽぽ" значит "отдых"', 'давай "ぽぽ"', 'Я ошибся. "ぽぽ" значит "спать"'],
        ['es-ES', '"ぽぽ" significa "descansar"', 'vamos a "ぽぽ"', 'Me equivoqué. "ぽぽ" significa "dormir"'],
        ['pt-BR', '"ぽぽ" significa "descansar"', 'vamos "ぽぽ"', 'Eu errei. "ぽぽ" significa "dormir"'],
        ['de', '"ぽぽ" bedeutet "ausruhen"', 'lass uns "ぽぽ"', 'Ich habe mich geirrt. "ぽぽ" bedeutet "schlafen"']
    ]) {
        const state = create();
        const first = say(state, define, { locale });
        assert.equal(first.learning[0].updated.length, 1, locale);
        assert.equal(say(state, use, { locale }).understandings[0].known.meaning, 'rest', locale);
        assert.equal(say(state, correct, { locale }).understandings[0].corrects, first.input.id, locale);
        assert.equal(say(state, 'ぽぽ', { locale }).understandings[0].known.meaning, 'sleep', locale);
        assert.equal(state.knowledge.wordExplanations[1].word, 'ぽぽ');
        assert.ok(api.validWordLearning(JSON.parse(JSON.stringify(state))), locale);
    }
});

test('word save validation rejects broken provenance and correction chains without upgrading legacy saves', () => {
    const state = create(); say(state, 'ぽぽは休むことだよ');
    say(state, 'さっき間違えた。ぽぽは眠ることだよ');
    assert.ok(api.validWordLearning(state));
    for (const mutate of [s => s.knowledge.wordExplanations[0].speaker = 'someone',
        s => s.knowledge.wordExplanations[0].scope.scene = 'other',
        s => s.knowledge.wordExplanations[1].corrects = 'input:999',
        s => s.knowledge.wordExplanations[0].retractedBy = 'input:999',
        s => s.records.splice(0, 1), s => s.knowledge.wordExplanations[1].basis.id = 'sweet',
        s => s.knowledge.wordExplanations.push(s.knowledge.wordExplanations[0])]) {
        const altered = JSON.parse(JSON.stringify(state)); mutate(altered);
        assert.equal(api.validWordLearning(altered), false);
    }
    const old = create(); const before = JSON.stringify(old);
    assert.ok(api.validWordLearning(old)); assert.equal(JSON.stringify(old), before);
});

test('word definitions cannot smuggle negation, unknown senses or hypothetical actions into use', () => {
    const state = create(); say(state, 'ぽぽは休むことだよ');
    for (const raw of ['ぽぽは未知の感覚のことだよ', '休むは食べることだよ', 'ぽぽは休むことだよ？',
        '「ぽぽ」しないで', '疲れたら「ぽぽ」しよう', 'あの人が「ぽぽ」しよう', '「ぽぽ」しよう。知らないこともして']) {
        const result = say(state, raw);
        assert.ok(result.understandings.some(u => !u.complete), raw);
        assert.ok(!result.learning.some(l => l.updated.length), raw);
    }
    assert.equal(state.knowledge.wordExplanations.length, 1);
});

test('contrast correction and conflicting individual explanations cannot silently revive old meanings', () => {
    const state = create(); focus(state);
    say(state, 'これをぽぽって呼ぼう'); say(state, 'ぽぽは休むことだよ');
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false);
    say(state, 'ぽぽは木の実のことじゃなくて、眠ることだよ');
    assert.ok(state.knowledge.associations[0].evidence[0].retractedBy);
    assert.equal(say(state, 'ぽぽ').understandings[0].complete, false, 'other explanation still competes');
    const second = say(state, 'ぽぽは休むことじゃなくて、眠ることだよ');
    assert.ok(second.understandings[0].complete);
    assert.equal(say(state, 'ぽぽ').understandings[0].known.meaning, 'sleep');
    const unchanged = JSON.stringify(state.knowledge);
    say(state, 'さっき間違えた。ぽぽは眠ることだよ');
    assert.equal(JSON.stringify(state.knowledge), unchanged);
    assert.ok(api.validWordLearning(state));
    // Moving to another individual in the same scene does not expand the scope.
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:2', meaning: 'berry' }] });
    assert.equal(api.wordApplication(state, 'ぽぽ', 'player').adopted, null);
});
test('life labels connect objects actions and senses across eight starts only on completion', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        for (const activity of ['eat', 'rest']) {
            const { state, world } = lifeFixture(activity, { foundation, life, speech });
            const relations = JSON.stringify(state.knowledge.relations);
            const ids = activity === 'eat' ? ['berry', 'food', 'eat', 'sweet', 'hungry'] : ['rest', 'sleep', 'tired'];
            for (const id of ids) {
                const word = catalog.meanings[id][0];
                const result = labelLife(state, world, ['hungry', 'tired'].includes(id) ? `"${word}"` : word);
                assert.ok(result.lifeLearning);
                assert.equal(state.knowledge.meanings.some(m => m.id === id), life);
            }
            const event = finishLife(state, world);
            for (const id of ids) {
                const meaning = state.knowledge.meanings.find(m => m.id === id);
                assert.equal(meaning.source, life ? 'initial' : 'experienced_life');
                if (!life) {
                    assert.equal(meaning.evidence[0].experienceId, event.id);
                    assert.equal(meaning.evidence[0].scope.target, event.target);
                    assert.equal(meaning.evidence[0].scope.subject, 'self');
                }
            }
            assert.equal(JSON.stringify(state.knowledge.relations), relations);
            assert.ok(lifeLearning.valid(state, world));
            const before = JSON.stringify(state);
            lifeLearning.learn(state, event.id); notebookApi.entries(state);
            assert.equal(JSON.stringify(state), before);
        }
    }
});
test('life learning rejects questions reports negation conditions wrong senses and absent labels', () => {
    for (const raw of ['甘い？', '甘くない', '私は甘いものが好き', '疲れたら休んで', '甘い 食べる', '食べるよ', '疲れた', 'おなかがすいた']) {
        const { state, world } = lifeFixture();
        assert.equal(labelLife(state, world, raw).lifeLearning, undefined);
        finishLife(state, world);
        assert.equal(state.knowledge.meanings.length, 0);
    }
    for (const change of [{ mode: 'observe' }, { attention: 'berry:2', mode: 'rest' }, { mealTaste: null }, { mealTaste: { quality: 'bitter' } }]) {
        const { state, world } = lifeFixture(); Object.assign(world, change);
        assert.equal(labelLife(state, world, '甘い').lifeLearning, undefined);
    }
    const { state, world } = lifeFixture();
    assert.equal(labelLife(state, world, '甘い', { speaker: 'someone' }).lifeLearning, undefined);
    finishLife(state, world); assert.equal(state.knowledge.meanings.length, 0);
});
test('life labels use existing seven language terms and keep relations unknown', () => {
    for (const [locale, raw] of [['ja', '甘い'], ['en', 'sweet'], ['zh-CN', '甜'], ['ru', 'сладкий'], ['es-ES', 'dulce'], ['pt-BR', 'doce'], ['de', 'süß']]) {
        const { state, world } = lifeFixture('eat', { foundation: false });
        labelLife(state, world, raw, { locale }); finishLife(state, world);
        assert.equal(state.knowledge.meanings[0].id, 'sweet');
        assert.equal(state.knowledge.meanings[0].evidence[0].scope.label, raw);
        assert.equal(state.knowledge.relations.length, 0);
    }
});
test('life labels survive mid-action saving, reject altered sources and do not retrofit old experiences', () => {
    const store = require('../scripts/experimental/storage');
    let { state, world } = lifeFixture();
    labelLife(state, world, '甘い'); labelLife(state, world, '甘い');
    assert.equal(world.lifeLabels.length, 1);
    let value = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
    assert.ok(store.valid(value));
    ({ state, world } = value); const event = finishLife(state, world);
    assert.ok(store.valid(value));
    for (const mutate of [v => v.state.knowledge.meanings[0].evidence[0].scope.subject = 'player',
        v => delete v.state.knowledge.meanings[0].evidence[0].scope,
        v => v.state.experiences[0].lifeLabels[0].target = 'berry:2',
        v => v.world.experiences[0].taste.quality = 'bitter',
        v => v.state.experiences[0].lifeLabels = {}]) {
        const altered = JSON.parse(JSON.stringify(value)); mutate(altered); assert.equal(store.valid(altered), false);
    }
    delete state.experiences[0].lifeLabels; delete world.experiences[0].lifeLabels;
    state.knowledge.meanings = [];
    assert.equal(lifeLearning.learn(state, event.id).updated.length, 0);
    assert.ok(store.valid(value));
});
test('interrupted rest drops pending life labels and does not teach from later rest', () => {
    const { state, world } = lifeFixture('rest'); labelLife(state, world, '休む');
    assert.ok(worldApi.approach(world, 'path'));
    assert.deepEqual(world.lifeLabels, []);
    assert.equal(state.knowledge.meanings.length, 0);
});

test('shared experience learning separates candidates, adoption and updates without teaching relations', () => {
    const rule = { id: 'eat', source: 'test_demonstration', activity: 'eat',
        demonstration: 'test_label', result: 'test_finished' };
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
        const state = create({ foundation, life, speech });
        const relations = JSON.stringify(state.knowledge.relations);
        const event = { id: 1, kind: 'experience', activity: 'eat', start: 3, end: 8,
            demonstration: 'test_label', result: 'test_finished' };
        assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0, 'no original experience');
        state.experiences = [event];
        const before = JSON.stringify(state.knowledge);
        assert.equal(api.experienceCandidates(state, 1, [rule]).length, 1);
        assert.equal(JSON.stringify(state.knowledge), before, 'forming candidates is read-only');
        const ambiguous = api.learnExperience(state, 1, [rule, { ...rule, source: 'conflicting' }]);
        assert.equal(ambiguous.adopted.length, 0);
        assert.equal(JSON.stringify(state.knowledge), before);
        const learned = api.learnExperience(state, 1, [rule]);
        assert.equal(learned.adopted.length, 1);
        assert.equal(learned.updated.length, life ? 0 : 1, 'initial knowledge is not relabelled');
        assert.equal(learned.relationAcquired, false);
        assert.equal(JSON.stringify(state.knowledge.relations), relations);
        const restored = JSON.parse(JSON.stringify(state));
        assert.equal(api.learnExperience(restored, 1, [rule]).updated.length, 0);
        assert.ok(api.validExperienceLearning(restored, [rule]));
        if (!life) {
            assert.deepEqual(restored.knowledge.meanings[0].evidence[0].scope,
                { subject: 'self', activity: 'eat', result: 'test_finished' });
            restored.knowledge.meanings[0].evidence[0].scope.subject = 'player';
            assert.equal(api.validExperienceLearning(restored, [rule]), false);
        }
    }
});

test('experience learning rejects missing labels, unfinished events and ambiguous original IDs', () => {
    const state = create({ life: false });
    const rule = { id: 'eat', source: 'test_demonstration', activity: 'eat', demonstration: 'test_label', result: 'done' };
    const event = { id: 1, kind: 'experience', activity: 'eat', demonstration: 'test_label', result: 'done', start: 2, end: 7 };
    for (const change of [{ demonstration: null }, { kind: 'speaker_report' }, { result: 'other' }, { end: 1 }, { end: undefined }]) {
        state.experiences = [{ ...event, ...change }];
        assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0);
    }
    state.experiences = [event, { ...event }];
    assert.equal(api.learnExperience(state, 1, [rule]).updated.length, 0);
    state.experiences = [event]; api.learnExperience(state, 1, [rule]);
    const evidence = state.knowledge.meanings[0].evidence;
    evidence.push({ ...evidence[0] });
    assert.equal(api.validExperienceLearning(state, [rule]), false);
    evidence.pop(); delete evidence[0].scope;
    assert.ok(api.validExperienceLearning(state, [rule]), 'old evidence stays valid without manufactured scope');
    state.experiences[0].demonstration = null;
    assert.equal(api.validExperienceLearning(state, [rule]), false);
});

test('external reports distinguish heard time, event, feeling and unresolved real details', () => {
    const state = create(), world = worldApi.create();
    const knowledge = JSON.stringify(state.knowledge), experiences = JSON.stringify(world.experiences);
    const result = say(state, '昨日は量子実験で失敗して悲しかった', { at: 123 });
    const u = result.understandings[0];
    assert.deepEqual(u.known, { meaning: 'sad', eventMeaning: 'failure' });
    assert.equal(u.subject, 'player'); assert.equal(u.eventTime, 'yesterday');
    assert.deepEqual(u.unresolved, [{ type: 'detail', token: '量子実験' }]);
    assert.equal(u.reportSource.heardAt, 123);
    assert.equal(worldApi.respond(world, result, state).message, 'heard_feeling_partial');
    assert.equal(state.context.lastOutput.topic, null);
    assert.equal(JSON.stringify(state.knowledge), knowledge);
    assert.equal(JSON.stringify(world.experiences), experiences);
    const prior = state.records.length;
    const echo = say(state, 'そう、その話');
    assert.equal(echo.understandings[0].reportReference.inputId, result.input.id);
    assert.equal(echo.understandings[0].eventTime, 'yesterday');
    assert.equal(echo.understandings[0].complete, false);
    assert.equal(state.records.length, prior);
    assert.equal(worldApi.respond(world, echo, state).message, 'heard_feeling_partial');
});

test('event-to-feeling continuation keeps original report through JSON and never creates own work', () => {
    let state = create(); const world = worldApi.create();
    const event = say(state, '昨日は仕事で失敗した', { at: 321 });
    assert.equal(worldApi.respond(world, event, state).message, 'heard_event_partial');
    state = JSON.parse(JSON.stringify(state));
    const extension = say(state, 'それで悲しかった');
    const u = extension.understandings[0];
    assert.equal(u.known.meaning, 'sad'); assert.equal(u.eventTime, 'yesterday');
    assert.equal(u.timeSource, 'report_reference'); assert.equal(u.reportReference.inputId, event.input.id);
    assert.equal(u.reportReference.heardAt, 321); assert.equal(u.unresolved[0].token, '仕事');
    worldApi.respond(world, extension, state);
    const echo = say(state, 'そのことだよ'); worldApi.respond(world, echo, state);
    assert.equal(echo.understandings[0].reportReference.inputId, event.input.id);
    assert.equal(world.experiences.length, 0); assert.equal(state.records.length, 2);
    assert.ok(worldApi.validContext(state, world));
    const damaged = JSON.parse(JSON.stringify(state));
    damaged.context.turns.at(-1).understandings[0].reportReference.inputId = 'input:999';
    assert.equal(worldApi.validContext(damaged, world), false);
    delete state.context.lastOutput;
    assert.ok(worldApi.validContext(state, world));
});

test('all eight settings preserve report comprehension independently of spoken expression', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }), world = worldApi.create();
        const before = JSON.stringify(state.knowledge);
        const report = say(state, '今日は仕事で失敗して悲しかった');
        const response = worldApi.respond(world, report, state);
        assert.equal(response.message === 'heard_feeling_partial', foundation && life && speech === 'short');
        const echo = say(state, 'その話だよ');
        assert.equal(!!echo.understandings[0].reportReference, foundation && life);
        assert.equal(JSON.stringify(state.knowledge), before);
        assert.equal(world.experiences.length, 0);
    }
});

test('report continuation does not cross speaker, topic, unknown relation or unsupported scope', () => {
    for (const interruption of ['今何してるの？', 'よく分からない言葉', '悲しくない', '彼は悲しかった', '悲しかったら休もう', '悲しかった。うれしい']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '昨日は悲しかった'), state);
        worldApi.respond(world, say(state, interruption), state);
        assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined, interruption);
    }
    const state = create(); say(state, '昨日は悲しかった');
    assert.equal(say(state, 'その話だよ', { speaker: 'other' }).understandings[0].reportReference, undefined);
    for (const text of ['私は昨日は仕事で失敗して悲しかった？', '彼は今日は仕事で失敗して悲しかった',
        '今日は彼が仕事で失敗して悲しかった', 'そのことで悲しかったら休もう']) {
        assert.notEqual(say(create(), text).understandings[0].kind, 'report', text);
    }
});

function feelingInputs(locale) {
    const p = catalog.feelingContrast[locale], f = catalog.feelingTeaching[locale], full = p.past + p.join + p.present;
    return [full, `${f.source}«${full}»`, `${f.sad}«${p.past}»`, `${f.happy}«${p.present}»`,
        `${f.report}«${p.past}»`, `${f.report}«${p.present}»`, `${f.yesterday}«${p.past}»`, `${f.now}«${p.present}»`];
}
function teachFeelings(state, world, locale = 'ja') {
    for (const text of feelingInputs(locale)) labelLife(state, world, text, { locale });
}
test('3c3f2: eight starts and seven languages learn bounded words, report and time separately with restart', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const locale of Object.keys(catalog.feelingContrast)) {
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['gesture', 'short']) {
            let state = create({ foundation, life, speech }), world = worldApi.create();
            const initial = JSON.stringify(state.knowledge), body = JSON.stringify(world), texts = feelingInputs(locale);
            for (let i = 0; i < texts.length; i++) {
                const result = labelLife(state, world, texts[i], { locale });
                if (i) assert.ok(result.feelingLearning, `${locale}: step ${i}`);
                const saved = JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }));
                assert.ok(valid(saved), `${locale}: step ${i} save`);
                ({ state, world } = saved);
                const frames = api.feelingContrast(texts[0], locale, catalog);
                const parts = frames.map(f => api.understand(state, f, 'player', catalog, locale));
                assert.deepEqual(parts.map(u => u.known.meaning), [life || i >= 2 ? 'sad' : undefined, life || i >= 3 ? 'happy' : undefined]);
                assert.deepEqual(parts.map(u => u.subject), foundation || i >= 5 ? ['player', 'player'] : [null, null]);
                assert.deepEqual(parts.map(u => u.eventTime), foundation || i >= 7 ? ['yesterday', 'now'] : ['unspecified', 'unspecified']);
                assert.equal(parts.every(u => u.relations.includes('contrast')), foundation);
            }
            const journal = JSON.stringify(state.feelingLearning), original = structuredClone(state.feelingLearning.events[0].original);
            for (const text of texts.slice(1)) labelLife(state, world, text, { locale });
            assert.equal(JSON.stringify(state.feelingLearning), journal, 'repetition adds nothing');
            const result = labelLife(state, world, texts[0], { locale });
            assert.ok(result.understandings.every(u => u.complete === foundation));
            for (const text of [catalog.feelingContrast[locale].past, catalog.feelingContrast[locale].present]) {
                const report = labelLife(state, world, text, { locale });
                assert.equal(report.understandings[0].complete, true);
                assert.equal(report.understandings[0].subject, 'player');
                assert.ok(valid(selectionSave(state, world)));
            }
            for (let i = 0; i < 12; i++) say(state, 'glorp', { locale });
            assert.deepEqual(state.feelingLearning.events[0].original, original);
            assert.equal(JSON.stringify(state.knowledge), initial);
            assert.equal(state.experiences, undefined);
            const unchanged = JSON.parse(body);
            for (const key of ['experiences', 'history', 'hunger', 'fatigue', 'mode', 'reasons']) assert.deepEqual(world[key], unchanged[key]);
            assert.ok(valid(selectionSave(state, world)));
            const entries = notebookApi.entries(state);
            assert.equal(entries.filter(e => e.detail === 'note_feeling_scope').length, 7);
            assert.equal(JSON.stringify(state.feelingLearning), journal);
        }
    }
});
test('3c3f2: no learning from missing, ambiguous, expired, foreign or mismatched sources or unknown prerequisites', () => {
    for (const locale of Object.keys(catalog.feelingContrast)) {
        const texts = feelingInputs(locale);
        for (const setup of ['missing', 'repeated', 'expired', 'other', 'legacy']) {
            const state = create({ foundation: false, life: false }), world = worldApi.create();
            if (setup !== 'missing') labelLife(state, world, texts[0], { locale, speaker: setup === 'other' ? 'visitor' : 'player' });
            if (setup === 'repeated') labelLife(state, world, texts[0], { locale });
            if (setup === 'expired') for (let i = 0; i < 9; i++) say(state, 'glorp');
            if (setup === 'legacy') for (const u of state.context.turns.at(-1).understandings) delete u.feelingBasis;
            labelLife(state, world, texts[1], { locale });
            assert.equal(state.feelingLearning, undefined, setup);
        }
        const state = create({ foundation: false, life: false }), world = worldApi.create();
        for (const text of texts.slice(0, 2)) labelLife(state, world, text, { locale });
        const sourceOnly = JSON.stringify(state.feelingLearning);
        for (const text of texts.slice(4)) labelLife(state, world, text, { locale });
        labelLife(state, world, texts[2], { locale, speaker: 'visitor' });
        labelLife(state, world, texts[2], { locale: locale === 'en' ? 'ja' : 'en' });
        labelLife(state, world, texts[2] + '?', { locale });
        assert.equal(JSON.stringify(state.feelingLearning), sourceOnly);
        api.perceive(state, { scene: 'elsewhere', attention: [] });
        labelLife(state, world, texts[2], { locale });
        assert.equal(JSON.stringify(state.feelingLearning), sourceOnly);
        api.perceive(state, { scene: 'clearing', attention: [] });
        for (const text of texts.slice(2)) labelLife(state, world, text, { locale });
        assert.equal(state.feelingLearning.knowledge.length, 6);
        const foreign = say(state, texts[0], { locale, speaker: 'visitor' });
        assert.ok(foreign.understandings.every(u => !u.known.meaning && u.subject === null));
        for (const text of ['悲しい', '今は悲しい', '昨日はうれしかった', 'あなたは今うれしい', '今はうれしくない', '今はうれしい？']) {
            assert.equal(say(state, text).understandings.some(u => u.feelingReferences?.length), false, text);
        }
    }
});
test('3c3f2: saving rejects changes to source, teaching time, historical basis, scope and derived knowledge', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    teachFeelings(state, world);
    labelLife(state, world, feelingInputs('ja')[0]);
    const saved = selectionSave(state, world); assert.ok(valid(saved));
    const changes = [
        s => { s.feelingLearning.events[0].original.input.raw += '?'; },
        s => { s.feelingLearning.events[0].original.input.at = 101; },
        s => { s.feelingLearning.events[0].original.input.speaker = 'visitor'; },
        s => { s.feelingLearning.events[0].original.frames[0].time = 'now'; },
        s => { s.feelingLearning.events[0].original.understandings[0].known.meaning = 'sad'; },
        s => { s.feelingLearning.events[2].basis.taught = []; },
        s => { s.feelingLearning.events[2].input.id = s.feelingLearning.events[1].input.id; },
        s => { s.feelingLearning.events[2].input.scene = 'other'; },
        s => { s.feelingLearning.events[2].input.locale = 'en'; },
        s => { s.feelingLearning.events[2].input.at = 99; },
        s => { s.feelingLearning.events[2].at = 999; },
        s => { s.feelingLearning.events[2].sourceId = 'input:999'; },
        s => { s.feelingLearning.events[3].understanding.subject = 'self'; },
        s => { s.feelingLearning.events.splice(1, 1); },
        s => { s.feelingLearning.knowledge[0].scope.speaker = 'self'; },
        s => { s.feelingLearning.knowledge[0].evidence = []; },
        s => { s.feelingLearning.knowledge[0].id = 'contrast'; },
        s => { s.feelingLearning.knowledge.push(s.feelingLearning.knowledge[0]); },
        s => { s.context.turns.at(-1).understandings[0].feelingBasis.taught = []; },
        s => { s.context.turns.at(-1).understandings[0].feelingReferences[0].scope.locale = 'en'; },
        s => { delete s.context.turns.at(-1).understandings[0].feelingBasis; delete s.context.turns.at(-1).understandings[0].feelingReferences; },
        s => { s.context.turns.at(-1).understandings[0].testimony.verified = true; },
        s => { delete s.feelingLearning; }
    ];
    for (const mutate of changes) {
        const value = structuredClone(saved); mutate(value.state);
        assert.equal(valid(value), false, mutate.toString());
    }
});
test('3c3f2: multiple locales and later teaching preserve earlier bases and original reports', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create();
    for (const locale of Object.keys(catalog.feelingContrast)) {
        teachFeelings(state, world, locale);
        assert.ok(valid(selectionSave(state, world)), locale);
    }
    const retained = JSON.stringify(state.feelingLearning);
    for (const locale of Object.keys(catalog.feelingContrast)) {
        labelLife(state, world, feelingInputs(locale)[0], { locale });
        assert.ok(valid(selectionSave(state, world)), locale);
    }
    assert.equal(JSON.stringify(state.feelingLearning), retained);
    assert.equal(state.knowledge.meanings.length, 0);
    assert.equal(state.knowledge.relations.length, 0);
});
test('3c3f2: paired labels can reverse within a stage; reading and bodily learning do not rewrite testimony', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create({ foundation: false, life: false }), world = worldApi.create(), texts = feelingInputs('ja');
    for (const i of [0, 1, 3, 2, 5, 4, 7]) labelLife(state, world, texts[i]);
    assert.equal(notebookApi.entries(state).some(e => e.message === 'note_feeling_pairing'), true);
    labelLife(state, world, texts[6]);
    assert.equal(state.feelingLearning.knowledge.length, 6);
    const retained = JSON.stringify(state.feelingLearning);
    for (let i = 0; i < 3; i++) notebookApi.entries(state);
    startRelationActivity(state, world, 'rest'); labelLife(state, world, '休む'); finishLife(state, world);
    assert.ok(valid(selectionSave(state, world)));
    assert.equal(JSON.stringify(state.feelingLearning), retained);
    const original = state.feelingLearning.events[0].original;
    assert.ok(original.understandings.every(u => !u.known.meaning && u.subject === null));
    assert.ok(state.experiences.every(e => e.activity === 'rest'));
});

test('3c3f1: seven-language feeling clauses retain independent unknowns and sources across eight starts', () => {
    const { valid } = require('../scripts/experimental/storage');
    for (const [locale, form] of Object.entries(catalog.feelingContrast)) {
        for (const foundation of [true, false]) for (const life of [true, false]) for (const speech of ['short', 'gesture']) {
            const state = create({ foundation, life, speech }), world = worldApi.create();
            const before = JSON.stringify(state.knowledge), experiences = JSON.stringify(state.experiences);
            const text = form.past + form.join + form.present;
            for (let repeat = 0; repeat < 3; repeat++) {
                const result = say(state, text, { locale, at: 123 + repeat });
                assert.equal(result.understandings.length, 2);
                for (const [index, u] of result.understandings.entries()) {
                    assert.equal(u.complete, foundation && life);
                    assert.equal(u.subject, foundation ? 'player' : null);
                    assert.equal(u.eventTime, foundation ? ['yesterday', 'now'][index] : 'unspecified');
                    assert.equal(u.known.meaning, life ? ['sad', 'happy'][index] : undefined);
                    assert.deepEqual(u.unresolved.filter(x => x.type === 'relation').map(x => x.id), foundation ? [] : ['report', 'time', 'contrast']);
                    assert.equal(u.clauseSource.input.raw, text);
                    assert.equal(u.clauseSource.input.at, 123 + repeat);
                    assert.equal(u.clauseSource.index, index);
                    assert.equal(u.clauseSource.frame.time, ['yesterday', 'now'][index]);
                }
                worldApi.respond(world, result, state);
                assert.equal(JSON.stringify(state.knowledge), before);
                assert.equal(JSON.stringify(state.experiences), experiences);
                assert.ok(valid(JSON.parse(JSON.stringify({ version: 1, appearance: 'robot', state, world }))));
            }
            const saved = JSON.stringify({ version: 1, appearance: 'robot', state, world });
            for (const mutate of [
                s => { s.context.turns[0].understandings[0].clauseSource.index = 1; },
                s => { s.context.turns[0].understandings[0].clauseSource.frame.time = 'now'; },
                s => { s.context.turns[0].understandings[0].clauseSource.input.raw += '?'; },
                s => { s.context.turns[0].understandings[0].clauseSource.input.speaker = 'visitor'; },
                s => { delete s.context.turns[0].understandings[0].clauseSource; }
            ]) {
                const value = JSON.parse(saved); mutate(value.state); assert.equal(valid(value), false);
            }
        }
    }
});

test('3c3f1: unknown contrast preserves understood clauses without borrowing scoped rest relations', () => {
    for (const [locale, form] of Object.entries(catalog.feelingContrast)) {
        const state = create();
        state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'contrast');
        const result = say(state, form.past + form.join + form.present, { locale, speaker: 'visitor' });
        assert.deepEqual(result.understandings.map(u => [u.kind, u.subject, u.eventTime, u.complete]),
            [['partial', 'visitor', 'yesterday', false], ['partial', 'visitor', 'now', false]]);
        assert.ok(result.understandings.every(u => u.unresolved.length === 1 && u.unresolved[0].id === 'contrast'));
        const scoped = create({ foundation: false });
        const world = worldApi.create();
        for (const subject of ['self', 'player']) {
            startRelationActivity(scoped, world, 'rest');
            labelLife(scoped, world, reportDemo(locale, subject), { locale }); finishLife(scoped, world);
        }
        const partial = say(scoped, form.past + form.join + form.present, { locale });
        assert.ok(partial.understandings.every(u => u.subject === null && u.unresolved.some(x => x.id === 'report')));
        for (const text of [form.past + form.join + form.present + '?', '【' + form.past + form.join + form.present + '】', form.past + '\n' + form.present]) {
            assert.equal(api.interpret(text, locale, catalog).some(f => f.catalogRule === 'feeling_contrast'), false);
        }
    }
});

test('3c3f1: sources survive context eviction while legacy saves remain unchanged', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create(), world = worldApi.create(), form = catalog.feelingContrast.en;
    const result = say(state, form.past + form.join + form.present, { locale: 'en' });
    const original = JSON.stringify(state.records);
    for (let i = 0; i < 12; i++) say(state, 'glorp', { locale: 'en' });
    assert.equal(state.context.turns.some(t => t.id === result.input.id), false);
    assert.equal(JSON.stringify(state.records), original);
    const value = selectionSave(state, world); assert.ok(valid(value));
    value.state.records[0].understandings[1].clauseSource = null;
    assert.equal(valid(value), false);
    const legacy = selectionSave(state, world);
    for (const record of legacy.state.records) for (const u of record.understandings) {
        delete u.clauseSource; delete u.feelingBasis;
    }
    const before = JSON.stringify(legacy); assert.ok(valid(legacy)); assert.equal(JSON.stringify(legacy), before);
});

test('past and present contrast remains separate and unknown details do not become known by echo', () => {
    const state = create();
    const result = say(state, '昨日は悲しかったけど、今はうれしい');
    assert.equal(result.understandings.length, 2);
    assert.deepEqual(result.understandings.map(u => [u.known.meaning, u.eventTime]), [['sad', 'yesterday'], ['happy', 'now']]);
    assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined);
    for (const text of ['今日は仕事で成功してうれしかった', '今はつらい', '私は疲れている']) {
        const s = create(), w = worldApi.create(), r = say(s, text);
        assert.equal(r.understandings[0].kind, 'report', text);
        assert.ok(['heard_feeling_partial', 'heard_feeling'].includes(worldApi.respond(w, r, s).message));
    }
});

test('report ellipsis stops at intervening observations and old reports gain no retroactive source', () => {
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '昨日は悲しかった'), state);
    const event = { id: 6, kind: 'experience', activity: 'eat', target: 'berry:1' };
    world.experiences.push({ ...event, kind: 'eat' });
    worldApi.onArrival(world, state, event);
    assert.equal(say(state, 'その話だよ').understandings[0].reportReference, undefined);
    const old = create(); say(old, '昨日は悲しかった');
    delete old.context.turns[0].understandings[0].reportSource;
    assert.equal(say(old, 'その話だよ').understandings[0].reportReference, undefined);
    const punctuated = create(); say(punctuated, '昨日は仕事で失敗した');
    assert.equal(say(punctuated, 'それで悲しかった。').understandings[0].eventTime, 'yesterday');
});

test('seven languages share report continuation and retain the original input evidence', () => {
    const cases = [['ja', '悲しい', 'そう、その話'], ['en', 'I am sad', "Yes, that is what I meant"],
        ['zh-CN', '我很难过', '对，我说的就是这件事'], ['ru', 'мне грустно', 'да, я об этом'],
        ['es-ES', 'estoy triste', 'sí, a eso me refiero'], ['pt-BR', 'estou triste', 'sim, é disso que estou falando'],
        ['de', 'ich bin traurig', 'ja, das meine ich']];
    for (const [locale, text, followup] of cases) {
        const state = create(), world = worldApi.create();
        const first = say(state, text, { locale }); worldApi.respond(world, first, state);
        const next = say(state, followup, { locale });
        assert.equal(next.understandings[0].reportReference?.inputId, first.input.id, locale);
        assert.equal(next.input.raw, followup); assert.equal(state.records.length, 1);
        assert.equal(worldApi.respond(world, next, state).message, 'receive_sadness');
    }
});

test('context clarification composes meaning, ellipsis and paraphrase with the delivered life topic', () => {
    const state = create(), world = worldApi.create();
    const ask = text => worldApi.respond(world, say(state, text), state);
    assert.equal(ask('今何してるの？').message, 'taking_break');
    const before = JSON.stringify({ knowledge: state.knowledge, records: state.records, world });
    for (const text of ['一息って？', 'ひと息ってどういうこと？', 'つまり休んでいるということ？', 'それってどういうこと？', '休憩？']) {
        const result = say(state, text);
        assert.equal(result.understandings[0].complete, true, text);
        assert.equal(result.understandings[0].questionSlot, 'context_detail', text);
        assert.equal(worldApi.respond(world, result, state).message, 'break_explained');
        assert.equal(state.context.lastOutput.source.message, 'taking_break');
    }
    assert.equal(JSON.stringify({ knowledge: state.knowledge, records: state.records, world }), before);
    assert.equal(ask('もう一度教えて').message, 'break_explained');
});

test('context taste confirmation keeps the original experience across newer meals and save resumption', () => {
    const state = create(), world = worldApi.create();
    world.experiences.push({ id: 8, kind: 'eat', target: 'berry:1', taste: { quality: 'sweet', pleasant: true } });
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'tasted_good');
    world.experiences.push({ id: 9, kind: 'eat', target: 'berry:2', taste: { quality: 'bitter', pleasant: false } });
    const restored = JSON.parse(JSON.stringify(state));
    const result = say(restored, '甘いの？');
    assert.equal(result.understandings[0].contextReference.evidence.experienceId, 8);
    assert.equal(result.understandings[0].eventTime, 'past');
    assert.equal(worldApi.respond(world, result, restored).message, 'tasted_good');
    assert.equal(worldApi.respond(world, say(restored, 'おいしかった？'), restored).message, 'taste_unsure');
    assert.equal(say(restored, '甘いの？').understandings[0].contextReference, undefined);
});

test('all locales share semantic context resolution and retain raw input', () => {
    const cases = [
        ['ja', '一息って？', '甘いの？', 'それってどういうこと？'], ['en', 'What do you mean by a break?', 'Is it sweet?', 'What does that mean?'],
        ['zh-CN', '休息是什么意思？', '甜吗？', '那是什么意思？'], ['ru', 'Что значит отдых?', 'Это сладкий?', 'Что это значит?'],
        ['es-ES', '¿Qué significa descanso?', '¿Es dulce?', '¿Qué significa eso?'], ['pt-BR', 'O que significa pausa?', 'É doce?', 'O que isso significa?'],
        ['de', 'Was bedeutet Pause?', 'Ist es süß?', 'Was bedeutet das?']
    ];
    for (const [locale, rest, sweet, omitted] of cases) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        let result = say(state, rest, { locale });
        assert.equal(result.input.raw, rest);
        assert.equal(worldApi.respond(world, result, state).message, 'break_explained', locale);
        assert.equal(worldApi.respond(world, say(state, omitted, { locale }), state).message, 'break_explained', locale);
        world.mode = 'eat'; world.mealTaste = { quality: 'sweet', pleasant: true };
        worldApi.respond(world, say(state, 'おいしい？'), state);
        result = say(state, sweet, { locale });
        assert.equal(result.understandings[0].complete, true, locale);
        assert.equal(worldApi.respond(world, result, state).message, 'tastes_good', locale);
    }
});

test('all eight settings preserve unknown meanings, relations and gesture expression in follow-ups', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }), world = worldApi.create();
        const knowledge = JSON.stringify(state.knowledge);
        worldApi.respond(world, say(state, '今何してるの？'), state);
        const result = say(state, '一息って？');
        const response = worldApi.respond(world, result, state);
        assert.equal(response.message === 'break_explained', foundation && life && speech === 'short');
        assert.equal(JSON.stringify(state.knowledge), knowledge);
    }
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    state.knowledge.meanings = state.knowledge.meanings.filter(m => m.id !== 'rest');
    const result = say(state, '一息って？');
    assert.equal(result.understandings[0].complete, false);
    assert.notEqual(worldApi.respond(world, result, state).message, 'break_explained');
});

test('context does not strip other subjects, negation, conditions, unknown clauses or new times', () => {
    for (const text of ['私は休んでいるの？', 'プレイヤーは休んでいるの？', '休んでいないの？',
        '疲れたら休むってこと？', '一息って？私は悲しい', '休むし魔法を使うってこと？', '今も甘いの？', '昨日も一息って？']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        assert.ok(!say(state, text).understandings.some(u => u.contextReference), text);
    }
    for (const intervening of ['私は悲しい', '未知のこと', 'おはよう']) {
        const state = create(), world = worldApi.create();
        worldApi.respond(world, say(state, '今何してるの？'), state);
        worldApi.respond(world, say(state, intervening), state);
        assert.equal(say(state, '一息って？').understandings[0].contextReference, undefined);
    }
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    assert.equal(say(state, '一息って？', { speaker: 'other' }).understandings[0].contextReference, undefined);
});

test('observation provenance never becomes the character claiming a feeling or reason', () => {
    const state = create(), world = worldApi.create();
    worldApi.respond(world, say(state, '今何してるの？'), state);
    const event = { id: 6, kind: 'experience', activity: 'eat', target: 'berry:1' };
    world.experiences.push({ ...event, kind: 'eat' });
    assert.equal(worldApi.onArrival(world, state, event).observation, true);
    const saved = JSON.parse(JSON.stringify(state));
    assert.notEqual(say(saved, 'もう一度教えて').understandings[0].questionSlot, 'repeat_answer');
    const result = say(state, 'ほっとしたの？');
    assert.equal(result.understandings[0].contextReference.source.kind, 'observation');
    assert.equal(result.understandings[0].complete, false, 'no relief meaning is secretly taught');
    assert.deepEqual(worldApi.respond(world, result, state), { message: 'observed_feeling_unknown', observation: true });
    assert.ok(!state.context.turns.at(-1).answer);
    worldApi.onArrival(world, state, event);
    const factual = say(state, 'それってどういうこと？');
    assert.equal(worldApi.respond(world, factual, state).message, 'ate');
    assert.equal(state.context.lastOutput.source.kind, 'observation', 'original source survives a grounded factual answer');
});

test('current sensory statements become past clarification if the referenced activity changed', () => {
    const state = create(), world = worldApi.create();
    world.mode = 'eat'; world.mealTaste = { quality: 'sweet', pleasant: true };
    worldApi.respond(world, say(state, 'おいしい？'), state);
    world.mode = 'move'; world.activityStart = 10; world.mealTaste = null;
    const result = say(state, '甘いの？');
    assert.equal(result.understandings[0].contextReference.eventTime, 'present', 'original time is retained');
    assert.equal(worldApi.respond(world, result, state).message, 'tasted_good', 'not a claim about current food');
});

test('an omitted taste topic can use the observed meal but cannot invent its missing taste', () => {
    for (const hasTaste of [true, false]) {
        const state = create(), world = worldApi.create();
        const event = { id: 1, kind: 'experience', activity: 'eat', target: 'berry:1',
            ...(hasTaste ? { taste: { quality: 'sweet', pleasant: true } } : {}) };
        world.experiences.push({ ...event, kind: 'eat' });
        worldApi.onArrival(world, state, event);
        const result = say(state, '甘いの？');
        assert.equal(result.understandings[0].contextReference.source.kind, 'observation');
        assert.equal(worldApi.respond(world, result, state).message, hasTaste ? 'tasted_good' : 'taste_unsure');
        if (hasTaste) {
            assert.equal(worldApi.respond(world, say(state, 'それってどういうこと？'), state).message, 'tasted_good');
            assert.equal(state.context.lastOutput.source.kind, 'observation');
        }
    }
});

test('context save validation rejects malformed or missing evidence and leaves legacy context absent', () => {
    const { valid } = require('../scripts/experimental/storage');
    const state = create(), world = worldApi.create();
    const save = { version: 1, appearance: 'robot', state, world };
    assert.ok(valid(save)); assert.equal(state.context.lastOutput, undefined);
    worldApi.respond(world, say(state, '今何してるの？'), state);
    assert.ok(valid(JSON.parse(JSON.stringify(save))));
    for (const mutate of [f => { f.meanings = null; }, f => { f.source.kind = 'player_report'; },
        f => { f.evidence.experienceId = 999; }, f => { f.serial++; }]) {
        const damaged = JSON.parse(JSON.stringify(save)); mutate(damaged.state.context.lastOutput);
        assert.equal(!!valid(damaged), false);
    }
    delete state.context.lastOutput;
    world.mode = 'eat'; world.activityStart = 9;
    worldApi.respond(world, say(state, 'もう一度教えて'), state);
    assert.equal(state.context.lastOutput.topic, null, 'a legacy answer cannot manufacture a snapshot of its original context');
});

test('explicit follow-ups retain the expressed answer without replacing its time or experience', () => {
    for (const [locale, text] of [['ja', 'もう一度教えて'], ['en', 'say that again'], ['zh-CN', '再说一遍'],
        ['ru', 'повтори'], ['es', 'repítelo'], ['pt-BR', 'repita'], ['de', 'sag das noch einmal']]) {
        const state = create(); const world = worldApi.create();
        world.history.push({ mode: 'eat', target: 'berry:1' });
        const first = worldApi.respond(world, say(state, '何をしたの？'), state);
        const knowledge = JSON.stringify(state.knowledge); const records = JSON.stringify(state.records);
        world.history.push({ mode: 'rest', target: 'shade' });
        const restored = JSON.parse(JSON.stringify(state));
        const result = say(restored, text, { locale });
        assert.equal(result.understandings[0].answerReference.eventTime, 'past');
        assert.deepEqual(worldApi.respond(world, result, restored), first);
        assert.equal(JSON.stringify(restored.knowledge), knowledge);
        assert.equal(JSON.stringify(restored.records), records);
        assert.equal(worldApi.respond(world, say(restored, '何をしたの？'), restored).message, 'rested');
    }
});

test('follow-ups do not borrow answers across unknown turns, speakers or starting settings', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech }); const world = worldApi.create();
        world.history.push({ mode: 'eat' });
        worldApi.respond(world, say(state, '何をしたの？'), state);
        const result = say(state, 'もう一度教えて');
        assert.equal(result.understandings[0].questionSlot === 'repeat_answer', foundation && life && speech === 'short');
    }
    for (const intervening of [true, false]) {
        const state = create(); const world = worldApi.create(); world.history.push({ mode: 'eat' });
        worldApi.respond(world, say(state, '何をしたの？'), state);
        if (intervening) worldApi.respond(world, say(state, '未知の話題です'), state);
        const result = say(state, 'もう一度教えて', intervening ? {} : { speaker: 'other' });
        assert.notEqual(result.understandings[0].questionSlot, 'repeat_answer');
    }
});

test('situation questions compose address, time, predicate and endings without teaching facts', () => {
    for (const prefix of ['', 'ねえ、', '君は今、', 'あなたはいま']) {
        for (const ending of ['？', 'の？', 'のかな？', 'んですか', 'のでしょうか']) {
            for (const [body, slot] of [['なにしてる', 'current_activity'], ['何を見ている', 'attention'],
                ['そこにはなにがある', 'attention'], ['どこに向かってる', 'destination'], ['木陰へ向かっている', 'destination']]) {
                const state = create(); const world = worldApi.create();
                world.mode = 'move'; world.destination = 'shade';
                const input = prefix + body + ending;
                const result = say(state, input);
                assert.equal(result.understandings[0].questionSlot, slot, input);
                const knowledge = JSON.stringify(state.knowledge);
                const response = worldApi.respond(world, result, state);
                assert.equal(response.message, slot === 'destination' ? 'going_rest' : slot === 'attention' ? 'answer_unknown' : 'walking', input);
                assert.equal(JSON.stringify(state.knowledge), knowledge);
                assert.equal(world.destination, 'shade');
                assert.equal(state.records.length, 0);
            }
        }
    }
});

test('situation answers distinguish activity, attention, destination and completed history', () => {
    for (const [mode, target, expected] of [['observe', 'path', 'looking_walk'], ['observe', 'berry:6', 'looking_berry'],
        ['rest', 'shade', 'resting'], ['eat', 'berry:6', 'eating'], ['idle', null, 'taking_break']]) {
        const state = create(); const world = worldApi.create();
        Object.assign(world, { mode, attention: target, destination: 'shade' });
        assert.equal(worldApi.respond(world, say(state, 'いまなにしてるの？'), state).message, expected);
        world.history.push({ mode: 'eat', target: 'berry:5' });
        assert.equal(worldApi.respond(world, say(state, '何をしていましたか？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'さっき何してたの？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'どこに行くの？'), state).message, 'not_going');
    }
    const state = create(); const world = worldApi.create();
    Object.assign(world, { mode: 'move', destination: 'path', attention: null });
    assert.equal(worldApi.respond(world, say(state, '木陰に向かっているの？'), state).message, 'going_walk');
    assert.equal(worldApi.respond(world, say(state, 'そこには何がありますか？'), state).message, 'answer_unknown');
});

test('situation grammar does not erase subjects, conditions, negation or unknown knowledge', () => {
    for (const text of ['私は何してるの？', '疲れたらどこに行くの？', '木陰に向かっていないの？',
        'どこにも行かないの？', '木陰に行ってね', 'そこには道があるね', 'どこまで続いているんだろう？',
        'さっきどこに向かっているの？']) {
        assert.ok(!api.interpret(text, 'ja', catalog).some(f => f.catalogRule === 'situation_question'), text);
    }
    for (const options of [{ life: false }, { foundation: false }, { speech: 'gesture' }]) {
        const state = create(options); const world = worldApi.create();
        Object.assign(world, { mode: 'move', destination: 'shade' });
        const response = worldApi.respond(world, say(state, 'どこに向かっていますか？'), state);
        assert.ok(!['going_rest', 'walking'].includes(response.message));
        assert.equal(world.destination, 'shade');
    }
});

test('playtest phrasing preserves partial meaning and never names a place after an explanation', () => {
    const state = create(); const world = worldApi.create();
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
    world.experiences.push({ kind: 'rest', before: { fatigue: .8 }, after: { fatigue: .1 } },
        { kind: 'eat', taste: { quality: 'sweet', pleasant: true } });
    const cases = [
        ['おはよ～', 'good_morning'], ['しっかりやすんだかな？', 'rest_helped'],
        ['しっかり休めた？', 'rest_helped'], ['そこに木の実落ちているね', 'heard_berry'],
        ['おいしかった？', 'tasted_good'], ['すっぱくない？', 'unknown_taste_word'],
        ['今から、木陰で休んでね', 'join'], ['横になると気持ちいいよね', 'heard_rest_comfort'],
        ['休むことは大事だよ', 'heard_rest_partial'], ['うん、体力や眠気が回復するからね', 'heard_rest_partial']
    ];
    for (const [input, response] of cases) {
        const result = say(state, input);
        assert.equal(worldApi.respond(world, result, state).message, response, input);
    }
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
    assert.ok(!state.knowledge.meanings.some(m => m.id === 'sour'));
    for (const phrase of ['そこは休む場所だよ', '疲れがとれるんだよ', '食べるとおいしいのだよ', '休むことは大切だよ']) {
        const result = say(state, phrase);
        assert.ok(!result.learning.some(item => item.updated.length), phrase);
    }
    const fresh = create();
    assert.equal(say(fresh, 'うん、体力や眠気が回復するからね').understandings[0].complete, false);
});

test('rest variants keep negation and unknown knowledge from turning into commands', () => {
    for (const phrase of ['今から、木陰で休まないでね', '疲れたら木陰で休んでね']) {
        const state = create(); const world = worldApi.create();
        worldApi.respond(world, say(state, phrase), state);
        assert.equal(world.destination, null);
    }
    const state = create({ life: false }); const world = worldApi.create();
    worldApi.respond(world, say(state, '今から、木陰で休んでね'), state);
    assert.equal(world.destination, null);
});

test('playtest report keeps exact input, contextual traces and all notebook entries without changing learning', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    const report = reportApi.create({ state, world }, 1000);
    const raw = 'ぽぽだよ\n<script>literal</script>';
    report.record('player', { text: raw, context: state.context }, 2000);
    const result = say(state, 'これはぽぽだよ');
    report.record('understanding', { result }, 2100);
    const before = JSON.stringify(state);
    const output = report.build({ state, world }, notebookApi.groupedEntries(state), {}, 3000);
    assert.equal(output.timeline[0].text, raw);
    assert.equal(output.initial.state.serial, 0);
    assert.equal(output.current.state.serial, 1);
    assert.equal(output.recording.startedAt, new Date(1000).toISOString());
    assert.equal(output.notebook[0].literal, 'ぽぽ');
    output.timeline[0].text = 'changed';
    assert.equal(report.build({}, [], {}, 3000).timeline[0].text, raw);
    assert.equal(JSON.stringify(state), before);
});

test('report export writes only a user-chosen file; cancellation and errors preserve game data', async () => {
    const { exportReport } = require('../scripts/experimental/export_report');
    const payload = { title: 'Report', text: JSON.stringify({ format: 'word-learning-playtest', version: 1 }) };
    const writes = [];
    const write = async (...args) => { writes.push(args); };
    assert.equal((await exportReport({ showSaveDialog: async () => ({ canceled: true }) }, null, payload, write)).canceled, true);
    assert.equal(writes.length, 0);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, write)).ok, true);
    assert.deepEqual(writes[0], ['chosen.json', payload.text, 'utf8']);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, async () => { throw Error('full'); })).ok, false);
});

test('natural rest question and a berry-name answer bind to the actual experience or question', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    const answer = say(state, '木の実だよ');
    assert.equal(worldApi.respond(world, answer, state).message, 'name_echo');
    assert.equal(state.knowledge.associations[0].word, '木の実');
    world.experiences.push({ kind: 'rest', before: { fatigue: .7 }, after: { fatigue: .1 } });
    assert.equal(worldApi.respond(world, say(state, 'しっかり休めた？'), state).message, 'rest_helped');
    assert.equal(worldApi.respond(world, say(state, 'ゆっくり休めた？'), state).message, 'rest_helped');
});

test('notebook reading preserves sources, never turns co-occurrence into learned names', () => {
    const state = create();
    assert.deepEqual(notebookApi.entries(state), []);
    focus(state);
    say(state, 'ふわふわ');
    assert.deepEqual(notebookApi.entries(state), []);
    say(state, 'これはぽぽだよ');
    const before = JSON.stringify(state);
    const entries = notebookApi.entries(state);
    assert.equal(entries[0].literal, 'ぽぽ');
    assert.equal(entries[0].organized, false);
    assert.equal(entries[0].withdrawn, false);
    assert.deepEqual(notebookApi.entries(state), entries);
    assert.equal(JSON.stringify(state), before);
    say(state, 'さっきの説明は間違えた');
    assert.equal(notebookApi.entries(state)[0].withdrawn, true);
    assert.equal(notebookApi.entries(state)[0].literal, 'ぽぽ');
});

test('yes replies bind to explicit and recalled names without learning a name called yes', () => {
    for (const recalled of [false, true]) {
        const state = create(); const world = worldApi.create(); focus(state);
        const naming = say(state, 'これはぽぽだよ');
        worldApi.respond(world, naming, state);
        if (recalled) {
            state.context.pendingQuestion = null;
            worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
        }
        const reply = say(state, 'そうだよ');
        assert.equal(worldApi.respond(world, reply, state).message, 'name_confirmed');
        assert.ok(!state.knowledge.associations.some(a => a.word === 'そう'));
        const link = state.knowledge.associations.find(a => a.word === 'ぽぽ');
        assert.equal(link.evidence.length, 1);
        assert.ok(link.confirmedBy);
        assert.equal(notebookApi.entries(state)[0].detail, 'note_name_confirmed');
        assert.equal(worldApi.respond(world, say(state, 'ぽぽ'), state).message, 'name_known');
    }
    const state = create(); focus(state);
    say(state, 'そうだよ'); say(state, '休む場所は木陰だよ');
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
});

test('food questions use experienced taste, respect knowledge, and do not invent old taste', () => {
    const state = create(); const world = worldApi.create(); world.hunger = .8;
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'not_eaten_yet');
    world.pause = 0;
    for (let i = 0; i < 1500 && !world.experiences.some(e => e.kind === 'eat'); i++) {
        const event = worldApi.tick(world, .1);
        if (event) worldApi.onArrival(world, state, event);
    }
    for (const phrase of ['おいしかった？', '木の実はおいしかった？', 'おいしい？']) {
        assert.equal(worldApi.respond(world, say(state, phrase), state).message, 'tasted_good');
    }
    assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_experienced_sweet'));
    const unknown = create({ life: false });
    assert.notEqual(worldApi.respond(world, say(unknown, 'おいしかった？'), unknown).message, 'tasted_good');
    world.experiences.filter(e => e.kind === 'eat').forEach(e => { delete e.taste; });
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'taste_unsure');
});

test('notebook groups repeated outcomes without deleting or merging different meanings', () => {
    const state = create();
    state.experiences = Array.from({ length: 30 }, (_, i) => ({ id: i, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }));
    state.experiences.push({ id: 31, activity: 'rest', before: { fatigue: .8 }, after: { fatigue: .2 } });
    const before = JSON.stringify(state);
    const groups = notebookApi.groupedEntries(state);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].count, 30);
    assert.equal(groups[1].count, 1);
    assert.equal(JSON.stringify(state), before);
});

test('notebook describes actual outcomes and separates player reports from own preferences', () => {
    const state = create({ speech: 'gesture' });
    focus(state);
    say(state, '私は木の実が好き');
    state.experiences = [{ id: 4, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }];
    state.notes.push({ experienceId: 4, organizedAt: 5 });
    const entries = notebookApi.entries(state);
    assert.ok(entries.some(e => e.message === 'note_player_likes' && e.detail === 'note_heard'));
    assert.ok(entries.some(e => e.message === 'note_ate' && e.organized));
    assert.ok(!JSON.stringify(entries).includes('taste'));
    const unknown = create({ life: false });
    unknown.experiences = state.experiences;
    assert.equal(notebookApi.entries(unknown)[0].message, 'note_ate_sensation');
    assert.deepEqual(unknown.knowledge.meanings, []);
});

test('notebook only retains unanswered questions the character actually understood', () => {
    const state = create();
    const world = worldApi.create();
    const result = say(state, 'どうして休んだの？');
    const reply = worldApi.respond(world, result, state);
    notebookApi.rememberQuestion(state, result, reply);
    notebookApi.rememberQuestion(state, result, reply);
    assert.equal(state.notebookQuestions.length, 1);
    assert.equal(notebookApi.entries(state)[0].literal, 'どうして休んだの？');
    const unknown = say(state, '全く対応していない文');
    notebookApi.rememberQuestion(state, unknown, { message: 'answer_unknown' });
    assert.equal(state.notebookQuestions.length, 1);
    assert.deepEqual(notebookApi.entries(JSON.parse(JSON.stringify(state))), notebookApi.entries(state));
});

test('food, recovery and sleep use actual completed episodes without granting vocabulary', () => {
    const state = create({ life: false });
    const world = worldApi.create();
    world.hunger = .8;
    const events = [];
    for (let i = 0; i < 5000; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { events.push(event); worldApi.onArrival(world, state, event); }
    }
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'eat' && e.after.hunger < e.before.hunger));
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'rest' && e.after.fatigue < e.before.fatigue));
    assert.ok(world.recovery.eat && world.recovery.rest);
    assert.ok(state.notes.some(n => n.kind === 'experienced_change'));
    assert.deepEqual(state.knowledge.meanings, []);
    assert.ok(world.fruit >= 0 && world.fruit <= 3);
    const episode = events.find(e => e.kind === 'experience');
    const count = state.experiences.length;
    worldApi.onArrival(world, state, episode);
    assert.equal(state.experiences.length, count);
});

test('pause freezes needs and fruit; eating cannot be cancelled into a lost meal', () => {
    const world = worldApi.create();
    const before = JSON.stringify(world);
    worldApi.tick(world, 60, true);
    assert.equal(JSON.stringify(world), before);
    world.mode = 'eat'; world.dwell = 1; world.activityBefore = { hunger: .8, fatigue: .2 };
    assert.equal(worldApi.approach(world, 'shade'), false);
    assert.equal(world.mode, 'eat');
});

test('save roundtrip and backup preserve learning; corrupt and full saves stop safely', () => {
    const { createStore } = require('../scripts/experimental/storage');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-life-test-'));
    try {
        const store = createStore(directory);
        const value = { version: 1, appearance: 'seed', state: create(), world: worldApi.create() };
        const unanswered = say(value.state, 'どうして休んだの？');
        notebookApi.rememberQuestion(value.state, unanswered, worldApi.respond(value.world, unanswered, value.state));
        assert.equal(typeof value.state.notebookQuestions[0].inputId, 'string');
        assert.equal(store.load().value, null);
        assert.equal(store.save(value).ok, true);
        value.world.hunger = .7;
        assert.equal(store.save(value).ok, true);
        assert.equal(createStore(directory).load().value.world.hunger, .7);
        assert.deepEqual(notebookApi.entries(createStore(directory).load().value.state), notebookApi.entries(value.state));
        assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'word-life.json.backup'), 'utf8')).world.hunger, .35);
        const previous = fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8');
        value.state.extra = 'x'.repeat(17 * 1024 * 1024);
        assert.equal(store.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), previous);
        delete value.state.extra;
        assert.equal(store.save(value).ok, false);
        fs.writeFileSync(path.join(directory, 'word-life.json'), '{broken');
        const corrupt = createStore(directory);
        assert.equal(corrupt.load().ok, false);
        assert.equal(corrupt.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), '{broken');
    } finally {
        for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
        fs.rmdirSync(directory);
    }
});

test('all eight settings are independent and create no fictional experiences', () => {
    for (const foundation of [true, false]) for (const life of [true, false]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech });
        assert.equal(state.knowledge.relations.length > 0, foundation);
        assert.equal(state.knowledge.meanings.length > 0, life);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        const result = say(state, '少し休もう');
        assert.equal(result.understandings[0].complete, foundation && life);
        assert.equal(result.expression.channel === 'speech', speech === 'short' && life);
        assert.equal(result.reaction.action, null);
    }
});

test('gestures do not erase understanding', () => {
    const short = say(create(), '疲れたら休んでね');
    const gesture = say(create({ speech: 'gesture' }), '疲れたら休んでね');
    assert.deepEqual(short.understandings, gesture.understandings);
    assert.notDeepEqual(short.expression, gesture.expression);
});

test('unknown relationship never becomes an unconditional command', () => {
    const state = create();
    state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'sequence');
    const result = say(state, '食べ終わったら、散歩しよう');
    assert.equal(result.understandings[0].kind, 'partial');
    assert.equal(result.understandings[0].known.meaning, 'walk');
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('conditions, requests, and action execution remain separate', () => {
    const result = say(create(), '疲れたら休んでね');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('six input categories reach their respective understanding paths', () => {
    const cases = [['少し休もう', 'invitation'], ['私は木の実が好き', 'report'], ['おいしかった？', 'question'],
        ['これを、ぽぽって呼ぼう', 'naming'], ['今日は仕事で失敗して悲しかった', 'report'], ['木の実は嫌いじゃない', 'report']];
    for (const [text, kind] of cases) {
        const state = create(); focus(state);
        assert.equal(say(state, text).understandings[0].kind, kind);
    }
});

test('real-world details stay unknown while the reported feeling is received', () => {
    const result = say(create(), '今日は量子実験で失敗して悲しかった');
    const u = result.understandings[0];
    assert.equal(u.known.meaning, 'sad'); assert.equal(u.subject, 'player');
    assert.equal(u.eventTime, 'past_today'); assert.equal(u.complete, false);
    assert.ok(u.unresolved.some(item => item.token === '量子実験'));
    assert.equal(result.reaction.intent, 'receive_sadness');
});

test('negation does not invert dislike into like or desire into preference', () => {
    const result = say(create(), '木の実は嫌いじゃない。今は食べたくない');
    assert.equal(result.understandings[0].known.meaning, 'dislike');
    assert.equal(result.understandings[0].polarity, 'negative');
    assert.equal(result.understandings[1].aspect, 'desire');
    assert.equal(result.understandings[1].eventTime, 'now');
    assert.equal(result.understandings[1].polarity, 'negative');
});

test('question slots are not missing understanding; no fabricated answers', () => {
    const result = say(create(), 'どうして休んだの？');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].questionSlot, 'reason');
    assert.equal(result.reaction.intent, 'answer_unknown');
    assert.equal(say(create(), 'おいしかった').understandings[0].complete, false);
    const questionState = create();
    assert.equal(say(questionState, '木の実が好き？').understandings[0].kind, 'question');
    assert.equal(questionState.records.length, 0);
});

test('naming creates tentative adoption and supported links, not grammar mastery', () => {
    const state = create(); focus(state);
    const first = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(first.learning[0].adopted.status, 'tentative');
    assert.equal(first.learning[0].updated.length, 1);
    assert.equal(first.transfer[0].relationAcquired, false);
    assert.equal(say(state, 'これを、ぽぽって呼ぼう').learning[0].updated.length, 0);
    focus(state, 'path');
    const secondScene = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(secondScene.transfer[0].scope, 'same_object_across_scenes');
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('ambiguous attention preserves candidates and never reinforces a guessed target', () => {
    const state = create(); focus(state, 'clearing', 2);
    const result = say(state, 'これをぽぽって呼ぼう');
    assert.equal(result.learning[0].candidates.length, 2);
    assert.equal(result.learning[0].adopted, null); assert.equal(result.learning[0].updated.length, 0);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('naming a known object word does not silently name the whole species', () => {
    const state = create(); focus(state);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted.target, 'berry:1');
    focus(state, 'path', 2);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted, null);
});

test('retracting one explanation leaves independent prior evidence available', () => {
    const state = create(); focus(state);
    say(state, 'これをぽぽって呼ぼう');
    focus(state, 'path'); say(state, 'これをぽぽって呼ぼう');
    say(state, 'さっきの説明は間違えた');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 1);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('mere co-occurrence or rereading never creates understood names', () => {
    const state = create({ foundation: false, life: false }); focus(state);
    for (let i = 0; i < 10; i++) say(state, 'ぽぽ');
    assert.equal(state.knowledge.associations.length, 1);
    assert.deepEqual(state.knowledge.associations[0].evidence, []);
    assert.deepEqual(state.knowledge.meanings, []);
    assert.deepEqual(state.knowledge.relations, []);
});

test('retraction retains evidence history but removes it from active interpretation', () => {
    const state = create(); focus(state);
    const original = say(state, 'これをぽぽって呼ぼう');
    const correction = say(state, 'さっきの説明は間違えた');
    assert.equal(correction.understandings[0].corrects, original.input.id);
    assert.equal(state.records[0].retractedBy, correction.input.id);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, correction.input.id);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('unrelated or missing correction antecedents are unresolved', () => {
    const state = create(); say(state, '私は木の実が好き');
    assert.equal(say(state, 'さっきの説明は間違えた').understandings[0].complete, false);
    assert.equal(state.records[0].retractedBy, undefined);
});

test('speaker-specific names coexist; literal input and names retain case', () => {
    const state = create(); focus(state);
    const result = say(state, 'これを「PoPo」って呼ぼう');
    assert.equal(result.input.raw, 'これを「PoPo」って呼ぼう');
    assert.equal(state.knowledge.associations[0].word, 'PoPo');
    assert.equal(say(state, 'PoPoが好き', { speaker: 'visitor' }).understandings[0].target.adopted, null);
});

test('context eviction never deletes selected records; recall is bounded', () => {
    const state = create(); say(state, '昨日は悲しかった');
    for (let i = 0; i < 20; i++) say(state, 'うれしい');
    assert.equal(state.context.turns.length, api.RULES.contextLimit);
    assert.equal(state.records.length, 21);
    assert.equal(state.records[0].understandings[0].eventTime, 'yesterday');
    const result = say(state, 'うれしい');
    assert.equal(result.recalled.length, api.RULES.recallLimit);
});

test('all seven input catalogs accept basics; unsupported text remains unresolved', () => {
    const samples = { ja: '少し休もう', en: "Let's rest", 'zh-CN': '休息一下吧', ru: 'Давай отдохнём',
        'es-ES': 'Descansemos un poco', 'pt-BR': 'Vamos descansar um pouco', de: 'Ruhen wir uns etwas aus' };
    for (const [locale, text] of Object.entries(samples)) {
        assert.equal(say(create(), text, { locale }).understandings[0].known.meaning, 'rest');
        assert.equal(say(create(), 'xyz 123 ???', { locale }).understandings[0].complete, false);
    }
});

test('isolated server cannot serve legacy entry points or saves', async () => {
    const { createServer } = require('../scripts/experimental/serve');
    const server = createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const url = `http://127.0.0.1:${server.address().port}`;
        assert.equal((await fetch(url)).status, 200);
        for (const file of ['index.html', 'system.js', 'cloud_manager.js', 'package.json', '../package.json']) {
            assert.equal((await fetch(`${url}/${file}`)).status, 404);
        }
        assert.equal((await fetch(`${url}/experimental_word_learning_catalog.json`)).status, 200);
    } finally { await new Promise(resolve => server.close(resolve)); }
});

test('legacy release packages exclude experimental entry points', () => {
    for (const name of ['full', 'full-offline', 'demo']) {
        const config = require('../scripts/release/build_config')(name);
        assert.ok(config.files.includes('!experimental_word_learning*'));
    }
    const html = fs.readFileSync(path.join(__dirname, '../experimental_word_learning.html'), 'utf8');
    assert.doesNotMatch(html, /(?:system|ai_core|ui_controller|cloud_manager|release_config)\.js/);
});

test('pointing leads to continuous movement and perception only after arrival', () => {
    const world = worldApi.create();
    worldApi.approach(world, 'berry:1', 'pointing');
    assert.equal(worldApi.perception(world).attention.length, 0);
    const x = world.x; worldApi.tick(world, .1);
    assert.ok(world.x < x && world.x > .28);
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.perception(world).attention[0].id, 'berry:1');
    assert.equal(world.mode, 'observe');
});

test('watching without instructions continues the life loop without inventing knowledge', () => {
    const world = worldApi.create(), state = create({ life: false, foundation: false });
    const arrivals = new Set();
    for (let i = 0; i < 2000; i++) {
        const event = worldApi.tick(world, .1);
        if (event?.kind === 'arrive' && event.target) arrivals.add(event.target.startsWith('berry:') ? 'berry:1' : event.target);
        api.perceive(state, worldApi.perception(world));
    }
    assert.deepEqual([...arrivals].sort(), ['berry:1', 'path', 'shade']);
    assert.equal(state.knowledge.meanings.length, 0); assert.equal(state.records.length, 0);
});

test('hidden or paused time cannot progress life or catch up a long interval', () => {
    const world = worldApi.create(); worldApi.approach(world, 'shade');
    const snapshot = structuredClone(world);
    worldApi.tick(world, 3600, true); assert.deepEqual(world, snapshot);
    worldApi.tick(world, 3600); assert.equal(world.elapsed, .1);
    assert.ok(Math.abs(world.x - snapshot.x) < .01);
});

test('understanding a suggestion permits a choice, not unconditional obedience', () => {
    const state = create(), world = worldApi.create();
    const result = say(state, '少し休もう');
    world.attention = 'berry:1'; world.mode = 'observe'; world.dwell = 8;
    assert.equal(worldApi.respond(world, result, state).message, 'keep_looking');
    assert.equal(world.destination, null);
    world.dwell = 2;
    assert.equal(worldApi.respond(world, result, state).message, 'join');
    assert.equal(world.destination, 'shade');
    assert.equal(world.reasons[0].inputId, result.input.id);
});

test('unknown, conditional and negative proposals do not dispatch immediate actions', () => {
    for (const [options, input] of [[{}, '疲れたら休んでね'], [{ foundation: false }, '少し休もう'],
        [{ life: false }, '少し休もう'], [{}, 'それは食べないで']]) {
        const state = create(options), world = worldApi.create();
        worldApi.respond(world, say(state, input), state);
        assert.equal(world.destination, null);
    }
});

test('a learned name changes observable response; recall adds no evidence', () => {
    const state = create(), world = worldApi.create();
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
    focus(state); say(state, 'これをぽぽって呼ぼう');
    api.perceive(state, { scene: 'path', attention: [] });
    const result = say(state, 'ぽぽ');
    assert.equal(result.understandings[0].kind, 'reference');
    const response = worldApi.respond(world, result, state);
    assert.equal(response.target, 'berry:1'); assert.equal(response.message, 'name_echo');
    assert.equal(state.knowledge.associations[0].evidence.length, 1);
    state.settings.speech = 'gesture';
    assert.equal(worldApi.respond(world, result, state).message, 'recognize_gesture');
});

test('existing sprite frames all fit their actual PNG sheets', () => {
    const visuals = require('../experimental_word_learning_visuals.json');
    for (const config of Object.values(visuals)) {
        const png = fs.readFileSync(path.join(__dirname, '..', config.image));
        const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
        for (const frames of Object.values(config.actions)) for (const frame of frames) {
            assert.ok(frame.sw > 0 && frame.sh > 0 && frame.sx >= 0 && frame.sy >= 0);
            assert.ok(frame.sx + frame.sw <= width && frame.sy + frame.sh <= height);
        }
    }
});

test('natural naming answers, confirmation and rejection keep their referent', () => {
    for (const answer of ['ぽぽだよ', 'これはぽぽだよ', 'ぽぽ']) {
        const state = create(), world = worldApi.create(); focus(state);
        assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'ask_name');
        const result = say(state, answer);
        assert.equal(result.understandings[0].kind, 'naming');
        assert.equal(worldApi.respond(world, result, state).word, 'ぽぽ');
        assert.equal(say(state, 'うん').understandings[0].answer, 'yes');
        assert.equal(state.knowledge.associations[0].evidence.length, 1);
    }
    const state = create(), world = worldApi.create(); focus(state);
    worldApi.respond(world, say(state, 'ぽぽだよ'), state);
    const no = say(state, 'ちがうよ');
    assert.equal(no.understandings[0].answer, 'no');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 0);
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
});

test('short replies cannot teach unrelated statements or unidentified objects', () => {
    const state = create();
    assert.equal(say(state, 'ぽぽだよ').learning[0].updated.length, 0);
    assert.equal(say(state, 'うん').understandings[0].kind, 'partial');
    focus(state);
    assert.equal(say(state, '食べたくないんだよ').learning[0].updated.length, 0);
    const world = worldApi.create(); worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    api.perceive(state, { scene: 'path', attention: [] });
    assert.equal(state.context.pendingQuestion, null);
    assert.equal(say(state, 'ぽぽ').learning[0].updated.length, 0);
});

test('activity answers come from actual current and completed actions', () => {
    const state = create(), world = worldApi.create();
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'answer_unknown');
    world.pause = 0; worldApi.approach(world, 'shade');
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'walking');
    world.pause = 0;
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'resting');
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'walked');
    assert.equal(worldApi.respond(world, say(state, 'どうして休んだの？'), state).message, 'answer_unknown');
});

test('name questions and spontaneous preference recall respect knowledge and evidence', () => {
    const state = create(), world = worldApi.create(); focus(state);
    assert.equal(worldApi.respond(world, say(state, 'これなに？'), state).message, 'known_berry');
    say(state, '私は木の実が好き');
    assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'player_likes_berry');
    assert.notEqual(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' })?.message, 'player_likes_berry');
    const unknown = create({ life: false }); focus(unknown);
    assert.notEqual(worldApi.respond(world, say(unknown, 'これなに？'), unknown).message, 'known_berry');
    const gesture = create({ speech: 'gesture' }); focus(gesture);
    assert.equal(worldApi.onArrival(worldApi.create(), gesture, { kind: 'arrive', target: 'berry:1' }), null);
});
