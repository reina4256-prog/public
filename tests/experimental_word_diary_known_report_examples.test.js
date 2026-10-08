'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_known_report_examples');
const unknown = require('../experimental_word_diary_report_examples');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (subject = 'self', locale = 'ja') => {
    const form = catalog.reportTeaching[locale][subject];
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
    hear(value, demo('self', locale), locale); finish(value); start(value);
    hear(value, demo('player', locale), locale); finish(value); start(value); return value;
}
test('known report teaching separates source and understood roles from child speech, observations and verification', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), v = hear(value, demo(subject)), buffer = candidates.create();
        const before = JSON.stringify({ value, v });
        assert.equal(capture(buffer, v), true);
        const entry = buffer.read()[0];
        assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
        assert.deepEqual(entry.captured.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
        assert.deepEqual(entry.captured.relationBasis, [{ id: 'report', source: 'initial' }]);
        assert.equal(entry.captured.understanding.complete, true);
        assert.deepEqual(entry.captured.roles, entry.captured.understanding.roles);
        assert.deepEqual(entry.captured.roles, { reporter: 'player', contentSubject: subject, status: 'reported', verified: false });
        assert.equal(entry.captured.understanding.reportSource, undefined);
        assert.equal(entry.captured.understanding.eventTime, 'unspecified');
        assert.equal(value.world.mode, 'rest'); assert.equal(value.world.destination, null);
        assert.equal(value.state.context.turns.at(-1).answer, undefined);
        assert.equal(v.result.relationLearning, undefined); assert.deepEqual(value.state.records, []);
        assert.equal(unknown.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
        assert.equal(JSON.stringify({ value, v }), before);
    }
});
test('seven languages and eight starts preserve initial rest and report knowledge boundaries for both subjects', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const subject of ['self', 'player']) {
            const v = hear(setup({ foundation, life, speech }), demo(subject, locale), locale);
            assert.equal(capture(candidates.create(), v), foundation && life, `${locale}/${subject}/${foundation}/${life}/${speech}`);
        }
});
test('real two-rest subject contrasts supply scoped experienced report bases in seven languages and both speech settings', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const speech of ['short', 'gesture']) {
        const value = acquire(locale, speech);
        assert.equal(value.state.experiences.length, 2);
        assert.ok(value.state.experiences.every(e => e.activity === 'rest' && e.target === 'shade'
            && e.relationLabels.every(l => l.subject === 'self' && l.roles.verified === false)));
        for (const subject of ['self', 'player']) {
            const v = hear(value, demo(subject, locale), locale), buffer = candidates.create();
            assert.equal(capture(buffer, v), true);
            const basis = buffer.read()[0].captured.relationBasis;
            assert.deepEqual(basis, v.result.understandings[0].relationReferences);
            assert.equal(basis[0].source, 'experienced_relation'); assert.equal(basis[0].scope.kind, 'report');
            assert.equal(basis[0].scope.locale, locale); assert.equal(basis[0].scope.roles.contentSubject, subject);
            assert.equal(v.result.relationLearning, undefined); assert.equal(v.result.understandings[0].reportSource, undefined);
        }
    }
});
test('known repeated and contrasting subjects are distinct inputs without learning labels; read and rereceive are inert', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), buffer = candidates.create(), knowledge = copy(value.state.knowledge);
        const first = hear(value, demo(subject)), second = hear(value, demo(subject));
        const other = hear(value, demo(subject === 'self' ? 'player' : 'self'));
        for (const v of [first, second, other]) assert.equal(capture(buffer, v), true);
        const original = buffer.read(); assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
        for (const v of [first, second, other]) assert.equal(capture(buffer, v), false);
        assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.records, []);
        assert.equal(value.world.relationLabels, undefined);
        first.result.input.raw = 'changed'; first.beforeKnowledge.relations[0].id = 'changed';
        buffer.read()[0].captured.roles.verified = true;
        assert.deepEqual(buffer.read(), original); assert.equal((value.state.experiences || []).length, 0);
    }
});
test('unknown subject conflict remains rejected; acquisition, completion and interruption never rewrite captured understanding', () => {
    const value = setup({ foundation: false }), buffer = candidates.create(), partial = hear(value);
    assert.equal(unknown.capture(buffer, partial.result, partial.context, partial.beforeKnowledge), true);
    const conflict = hear(value, demo('player'));
    assert.equal(unknown.capture(buffer, conflict.result, conflict.context, conflict.beforeKnowledge), false);
    assert.equal(capture(buffer, conflict), false); assert.equal(capture(buffer, partial), false);
    const original = buffer.read()[0];
    finish(value); start(value); hear(value, demo('player')); finish(value); start(value);
    const known = hear(value); assert.equal(capture(buffer, known), true);
    const retained = buffer.read(); finish(value); start(value); worldApi.approach(value.world, 'path');
    value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
    assert.equal(capture(buffer, known), false); assert.equal(capture(buffer, partial), false);
    assert.deepEqual(buffer.read(), retained); assert.deepEqual(buffer.read()[0], original);
    assert.equal(buffer.read()[0].captured.understanding.complete, false);
    assert.equal(buffer.read()[1].captured.understanding.complete, true);
});
test('ordinary testimony, other teaching, wrong speakers, languages, activities and ambiguous attention are excluded', () => {
    const learned = acquire();
    for (const subject of ['self', 'player']) {
        assert.equal(capture(candidates.create(), hear(learned, demo(subject), 'ja', 'visitor')), false);
        assert.equal(capture(candidates.create(), hear(learned, demo(subject, 'en'), 'en')), false);
        const value = setup(); start(value, 'eat'); const v = hear(value, demo(subject));
        assert.equal(v.result.understandings[0].complete, true);
        assert.equal(capture(candidates.create(), v), false); assert.equal(value.world.mode, 'eat');
        const ambiguous = setup(); ambiguous.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
        assert.equal(capture(candidates.create(), hear(ambiguous, demo(subject))), false);
        const ordinary = hear(setup(), catalog.reportTeaching.ja[subject].utterance);
        assert.equal(ordinary.result.understandings[0].reportSource.kind, 'speaker_report');
        assert.equal(capture(candidates.create(), ordinary), false);
    }
    const proposal = catalog.proposalTeaching.ja.request;
    assert.equal(capture(candidates.create(), hear(setup(), proposal.marker + '「' + proposal.utterance + '」')), false);
});
test('missing bases, changed scope and references, identities and report roles cannot supply known teaching', () => {
    const v = hear(acquire());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:2'; }, v => { v.context.elapsed = 0; },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.understandings[0].complete = false; },
        v => { v.beforeKnowledge.relations[0].scope.form = 'other'; },
        v => { v.beforeKnowledge.relations[0].scope.speaker = 'visitor'; },
        v => { v.beforeKnowledge.relations[0].scope.locale = 'en'; },
        v => { v.beforeKnowledge.relations[0].scope.kind = 'request'; },
        v => { v.beforeKnowledge.relations[0].scope.meaning = 'eat'; },
        v => { v.beforeKnowledge.relations[0].scope.roles.verified = true; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].roles.contentSubject = 'player'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
        v => { v.result.understandings[0].eventTime = 'now'; },
        v => { v.result.relationLearning = { candidates: [] }; },
        v => { v.result.interpretations[0].span = 'other'; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
