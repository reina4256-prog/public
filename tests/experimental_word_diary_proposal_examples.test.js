'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_proposal_examples');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (kind = 'request', locale = 'ja') => {
    const form = catalog.proposalTeaching[locale][kind];
    return `${form.marker}「${form.utterance}」`;
};
function start(value) {
    const { state, world } = value;
    Object.assign(world, { mode: 'rest', attention: 'shade', elapsed: Math.max(1, world.elapsed),
        activityStart: Math.max(1, world.elapsed), dwell: .1, fatigue: .7, hunger: .8,
        activityBefore: { hunger: .8, fatigue: .7 } });
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
}
function setup(options = {}) {
    const value = { state: core.create({ foundation: false, life: true, ...options }, catalog), world: worldApi.create() };
    start(value); return value;
}
function hear(value, raw = demo(), locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state, catalog);
    return { result, context, beforeKnowledge };
}
const capture = (buffer, v) => examples.capture(buffer, v.result, v.context, v.beforeKnowledge);
const finish = value => { value.world.pause = 0; worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1)); };
test('proposal examples retain marked sources and partial understanding, not compliance or participation', () => {
    for (const kind of ['request', 'invitation']) {
        const value = setup(), v = hear(value, demo(kind)), source = JSON.stringify({ value, v }), buffer = candidates.create();
        assert.equal(capture(buffer, v), true);
        const entry = buffer.read()[0];
        assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
        assert.equal(entry.captured.sources.input.raw, demo(kind));
        assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
        assert.deepEqual(entry.captured.understanding.unresolved, [{ type: 'relation', id: kind }]);
        assert.equal(entry.captured.understanding.complete, false);
        assert.deepEqual(entry.captured.sources.frame.roles, { proposer: 'player', addressee: 'self',
            actors: kind === 'request' ? ['self'] : ['player', 'self'], status: 'proposed', actualParticipation: false });
        assert.equal(entry.captured.understanding.roles, undefined);
        assert.equal((value.state.experiences || []).length, 0);
        assert.equal(JSON.stringify({ value, v }), source);
    }
});
test('seven existing marked grammars across eight starts keep the 3b2 unknown relation boundary', () => {
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const kind of ['request', 'invitation'])
            assert.equal(capture(candidates.create(), hear(setup({ foundation, life, speech }), demo(kind, locale), locale)),
                !foundation && life, `${locale}/${kind}/${foundation}/${life}/${speech}`);
});
test('same-kind new inputs remain separate from first-only adoption; replay and read cannot overwrite', () => {
    for (const kind of ['request', 'invitation']) {
        const value = setup(), buffer = candidates.create(), heard = [];
        for (let i = 0; i < 3; i++) { heard.push(hear(value, demo(kind))); assert.equal(capture(buffer, heard[i]), true); }
        const original = buffer.read();
        assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
        assert.equal(value.world.relationLabels.length, 1);
        assert.equal(original[2].captured.pairing.candidates[0].inputId, 'input:3');
        assert.equal(original[2].captured.pairing.adopted.inputId, 'input:1');
        for (const v of heard) assert.equal(capture(buffer, v), false);
        buffer.read()[0].captured.sources.frame.roles.actualParticipation = true;
        heard[0].result.input.raw = 'changed';
        assert.deepEqual(buffer.read(), original);
    }
});
test('mixed proposal kinds in one rest are not supplemented as accepted candidates', () => {
    for (const kind of ['request', 'invitation']) {
        const value = setup(), buffer = candidates.create();
        assert.equal(capture(buffer, hear(value, demo(kind))), true);
        const rejected = hear(value, demo(kind === 'request' ? 'invitation' : 'request'));
        assert.equal(rejected.result.relationLearning, undefined);
        assert.equal(capture(buffer, rejected), false);
        assert.equal(buffer.read().length, 1); assert.equal(value.world.relationLabels.length, 1);
    }
});
test('completed role contrast acquires relations without rewriting earlier teaching or manufacturing shared rest', () => {
    const value = setup(), buffer = candidates.create(), first = hear(value); capture(buffer, first);
    const original = buffer.read(); finish(value); start(value);
    assert.equal(capture(buffer, hear(value, demo('invitation'))), true); finish(value);
    for (const kind of ['request', 'invitation'])
        assert.ok(value.state.knowledge.relations.some(r => r.id === kind && r.source === 'experienced_relation'));
    assert.deepEqual(buffer.read()[0], original[0]); assert.equal(capture(buffer, first), false);
    start(value); assert.equal(capture(buffer, hear(value)), false);
    assert.ok(value.state.experiences.every(e => e.relationLabels.every(l => l.roles.actualParticipation === false)));
});
test('interruption and later knowledge leave the captured original partial teaching unchanged', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); worldApi.approach(value.world, 'path');
    assert.deepEqual(value.world.relationLabels, []);
    value.state.knowledge.relations.push({ id: 'request', source: 'initial' });
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
    assert.equal((value.state.experiences || []).length, 0);
});
test('ordinary unmarked calls, other teaching, wrong activity, speaker and ambiguous attention stay excluded', () => {
    for (const raw of [catalog.proposalTeaching.ja.request.utterance, catalog.proposalTeaching.ja.invitation.utterance,
        'ぽぽは休むことだよ', '「何してる？」→「休む」', `${demo()}。甘い`, '【お願い】「未知」'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
    assert.equal(capture(candidates.create(), hear(setup(), demo(), 'ja', 'visitor')), false);
    const wrong = setup(); wrong.world.mode = 'eat'; wrong.world.attention = 'berry:1';
    assert.equal(capture(candidates.create(), hear(wrong)), false);
    const ambiguous = setup(); ambiguous.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(capture(candidates.create(), hear(ambiguous)), false);
});
test('mismatched input-time context, basis, roles or acceptance cannot create a teaching candidate', () => {
    const v = hear(setup());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.context.scene = 'other'; },
        v => { v.context.target = 'berry:1'; }, v => { v.context.activityStart = 2; },
        v => { v.result.relationLearning.candidates[0].inputId = 'input:9'; },
        v => { v.result.relationLearning.candidates[0].utterance = 'other'; },
        v => { v.result.relationLearning.candidates[0].roles.actualParticipation = true; },
        v => { v.result.relationLearning.adopted.roles.actors = ['player']; },
        v => { v.result.interpretations[0].roles.status = 'completed'; },
        v => { v.result.relationLearning.updated = ['request']; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
