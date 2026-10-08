'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_known_proposal_examples');
const unknown = require('../experimental_word_diary_proposal_examples');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (kind = 'request', locale = 'ja') => {
    const form = catalog.proposalTeaching[locale][kind];
    return form.marker + '「' + form.utterance + '」';
};
function start(value, activity = 'rest') {
    const { state, world } = value;
    Object.assign(world, { mode: activity, attention: activity === 'rest' ? 'shade' : 'berry:1',
        elapsed: Math.max(1, world.elapsed), activityStart: Math.max(1, world.elapsed), dwell: .1, harvest: 1,
        hunger: .8, fatigue: .7, activityBefore: { hunger: .8, fatigue: .7 } });
    core.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: activity === 'rest' ? 'rest' : 'berry' }] });
}
function setup(options = {}) {
    const value = { state: core.create({ foundation: true, life: true, ...options }, catalog), world: worldApi.create() };
    start(value); return value;
}
function hear(value, raw = demo(), locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const reply = worldApi.respond(world, result, state, catalog);
    return { result, context, beforeKnowledge, reply };
}
const capture = (buffer, v) => examples.capture(buffer, v.result, v.context, v.beforeKnowledge);
const finish = v => { v.world.pause = 0; worldApi.onArrival(v.world, v.state, worldApi.tick(v.world, .1)); };
function acquire(locale = 'ja', speech = 'short') {
    const value = setup({ foundation: false, speech });
    hear(value, demo('request', locale), locale); finish(value); start(value);
    hear(value, demo('invitation', locale), locale); finish(value); start(value); return value;
}
test('known proposal teaching retains original sources, initial bases and understood proposed roles without action or mutation', () => {
    for (const kind of ['request', 'invitation']) {
        const value = setup(), v = hear(value, demo(kind)), buffer = candidates.create();
        const before = JSON.stringify({ value, v });
        assert.equal(capture(buffer, v), true);
        const entry = buffer.read()[0];
        assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
        assert.deepEqual(entry.captured.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
        assert.deepEqual(entry.captured.relationBasis, [{ id: kind, source: 'initial' }]);
        assert.equal(entry.captured.understanding.complete, true);
        assert.deepEqual(entry.captured.roles, entry.captured.understanding.roles);
        assert.deepEqual(entry.captured.roles.actors, kind === 'request' ? ['self'] : ['player', 'self']);
        assert.equal(entry.captured.roles.status, 'proposed'); assert.equal(entry.captured.roles.actualParticipation, false);
        assert.equal(value.world.mode, 'rest'); assert.equal(value.world.destination, null);
        assert.equal((value.state.selectionSources || []).length, 0);
        assert.equal(value.state.context.turns.at(-1).answer, undefined);
        assert.equal(v.result.relationLearning, undefined); assert.deepEqual(value.state.records, []);
        assert.equal(unknown.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
        assert.equal(JSON.stringify({ value, v }), before);
    }
});
test('seven languages and eight starts retain the initial meaning and relation boundary for both proposal kinds', () => {
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const kind of ['request', 'invitation']) {
            const v = hear(setup({ foundation, life, speech }), demo(kind, locale), locale);
            assert.equal(capture(candidates.create(), v), foundation && life, `${locale}/${kind}/${foundation}/${life}/${speech}`);
        }
});
test('real completed role contrasts supply scoped experienced bases in seven languages and both speech settings', () => {
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const speech of ['short', 'gesture']) {
        const value = acquire(locale, speech);
        for (const kind of ['request', 'invitation']) {
            const v = hear(value, demo(kind, locale), locale), buffer = candidates.create();
            assert.equal(capture(buffer, v), true);
            const basis = buffer.read()[0].captured.relationBasis;
            assert.deepEqual(basis, v.result.understandings[0].relationReferences);
            assert.equal(basis[0].source, 'experienced_relation'); assert.equal(basis[0].scope.kind, kind);
            assert.equal(basis[0].scope.locale, locale); assert.equal(v.result.relationLearning, undefined);
            assert.equal((value.state.selectionSources || []).length, 0);
        }
    }
});
test('new input repeats and both known kinds remain distinct without learning updates; rereceive and read do not add evidence', () => {
    for (const kind of ['request', 'invitation']) {
        const value = setup(), buffer = candidates.create(), knowledge = copy(value.state.knowledge);
        const first = hear(value, demo(kind)), second = hear(value, demo(kind));
        const other = hear(value, demo(kind === 'request' ? 'invitation' : 'request'));
        for (const v of [first, second, other]) assert.equal(capture(buffer, v), true);
        const original = buffer.read(); assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
        for (const v of [first, second, other]) assert.equal(capture(buffer, v), false);
        assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.records, []);
        assert.equal(value.world.relationLabels, undefined);
        first.result.input.raw = 'changed'; first.beforeKnowledge.relations[0].id = 'changed';
        buffer.read()[0].captured.roles.actualParticipation = true;
        assert.deepEqual(buffer.read(), original); assert.equal((value.state.experiences || []).length, 0);
    }
});
test('partial teaching remains partial after acquisition; known snapshots survive completion, interruption and later knowledge', () => {
    const value = setup({ foundation: false }), buffer = candidates.create(), partial = hear(value);
    assert.equal(unknown.capture(buffer, partial.result, partial.context, partial.beforeKnowledge), true);
    assert.equal(capture(buffer, partial), false); const original = buffer.read()[0];
    finish(value); start(value); hear(value, demo('invitation')); finish(value); start(value);
    const known = hear(value); assert.equal(capture(buffer, known), true);
    const retained = buffer.read(); finish(value); start(value); worldApi.approach(value.world, 'path');
    value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
    assert.equal(capture(buffer, known), false); assert.equal(capture(buffer, partial), false);
    assert.deepEqual(buffer.read(), retained); assert.deepEqual(buffer.read()[0], original);
    assert.equal(buffer.read()[0].captured.understanding.complete, false);
    assert.equal(buffer.read()[1].captured.understanding.complete, true);
});
test('ordinary proposals and other teaching do not enter; teaching remains nonacting away from rest', () => {
    const learned = acquire();
    for (const kind of ['request', 'invitation']) {
        assert.equal(capture(candidates.create(), hear(learned, demo(kind), 'ja', 'visitor')), false);
        assert.equal(capture(candidates.create(), hear(learned, demo(kind, 'en'), 'en')), false);
        const value = setup(); start(value, 'eat'); const v = hear(value, demo(kind));
        assert.equal(v.result.understandings[0].complete, true);
        assert.equal(capture(candidates.create(), v), false); assert.equal(value.world.mode, 'eat');
        assert.equal((value.state.selectionSources || []).length, 0);
        const ambiguous = setup(); ambiguous.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
        assert.equal(capture(candidates.create(), hear(ambiguous, demo(kind))), false);
    }
    for (const raw of [catalog.proposalTeaching.ja.request.utterance, catalog.proposalTeaching.ja.invitation.utterance,
        '「何してる？」→「休む」', 'ぽぽは休むことだよ', demo() + '。甘い'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
});
test('missing bases, changed scope and references, source identities and proposal roles cannot supply known teaching', () => {
    const v = hear(acquire());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:2'; }, v => { v.context.elapsed = 0; },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.understandings[0].complete = false; },
        v => { v.beforeKnowledge.relations[0].scope.form = 'other'; },
        v => { v.beforeKnowledge.relations[0].scope.speaker = 'visitor'; },
        v => { v.beforeKnowledge.relations[0].scope.locale = 'en'; },
        v => { v.beforeKnowledge.relations[0].scope.kind = 'report'; },
        v => { v.beforeKnowledge.relations[0].scope.meaning = 'eat'; },
        v => { v.beforeKnowledge.relations[0].scope.roles.actualParticipation = true; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].roles.actors = ['player']; },
        v => { v.result.interpretations[0].roles.actualParticipation = true; },
        v => { v.result.relationLearning = { candidates: [] }; },
        v => { v.result.interpretations[0].span = 'other'; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
