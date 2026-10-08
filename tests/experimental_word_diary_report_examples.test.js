'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_report_examples');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (subject = 'self', locale = 'ja') => {
    const form = catalog.reportTeaching[locale][subject];
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
test('report teaching keeps unverified source roles apart from unknown subject and child experience', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), v = hear(value, demo(subject)), source = JSON.stringify({ value, v }), buffer = candidates.create();
        assert.equal(capture(buffer, v), true);
        const entry = buffer.read()[0], data = entry.captured;
        assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
        assert.equal(data.sources.input.raw, demo(subject));
        assert.deepEqual(data.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
        assert.deepEqual(data.understanding.unresolved, [{ type: 'relation', id: 'report' }]);
        assert.equal(data.understanding.complete, false); assert.equal(data.understanding.subject, null);
        assert.equal(data.understanding.roles, undefined); assert.equal(data.understanding.reportSource, undefined);
        assert.equal(data.understanding.eventTime, 'unspecified');
        assert.deepEqual(data.sources.frame.roles, { reporter: 'player', contentSubject: subject, status: 'reported', verified: false });
        assert.equal(data.pairing.candidates[0].subject, 'self');
        assert.equal((value.state.experiences || []).length, 0);
        assert.equal(JSON.stringify({ value, v }), source);
    }
});
test('seven report grammars and eight starts preserve the unknown relation acceptance boundary', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const subject of ['self', 'player'])
            assert.equal(capture(candidates.create(), hear(setup({ foundation, life, speech }), demo(subject, locale), locale)),
                !foundation && life, `${locale}/${subject}/${foundation}/${life}/${speech}`);
});
test('same-subject new inputs keep current candidate separate from initial adoption, replay and read are inert', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), buffer = candidates.create(), heard = [];
        for (let i = 0; i < 3; i++) { heard.push(hear(value, demo(subject))); assert.equal(capture(buffer, heard[i]), true); }
        const original = buffer.read();
        assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
        assert.equal(value.world.relationLabels.length, 1);
        assert.equal(original[2].captured.pairing.candidates[0].inputId, 'input:3');
        assert.equal(original[2].captured.pairing.adopted.inputId, 'input:1');
        for (const v of heard) assert.equal(capture(buffer, v), false);
        buffer.read()[0].captured.sources.frame.roles.verified = true;
        heard[0].result.input.raw = 'changed';
        assert.deepEqual(buffer.read(), original);
    }
});
test('mixed subjects in one rest remain unaccepted in both orders', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), buffer = candidates.create();
        assert.equal(capture(buffer, hear(value, demo(subject))), true);
        const rejected = hear(value, demo(subject === 'self' ? 'player' : 'self'));
        assert.equal(rejected.result.relationLearning, undefined);
        assert.equal(capture(buffer, rejected), false);
        assert.equal(buffer.read().length, 1); assert.equal(value.world.relationLabels.length, 1);
    }
});
test('two completed child rests acquire scoped report roles without rewriting earlier teaching or proving player rest', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const speech of ['short', 'gesture']) {
        const value = setup({ speech }), buffer = candidates.create(), first = hear(value, demo('self', locale), locale);
        assert.equal(capture(buffer, first), true); const original = buffer.read(); finish(value); start(value);
        assert.equal(capture(buffer, hear(value, demo('player', locale), locale)), true); finish(value);
        assert.ok(value.state.knowledge.relations.some(r => r.id === 'report' && r.source === 'experienced_relation'));
        assert.deepEqual(buffer.read()[0], original[0]); assert.equal(capture(buffer, first), false);
        assert.equal(value.state.experiences.length, 2);
        assert.ok(value.state.experiences.every(e => e.activity === 'rest' && e.target === 'shade'
            && e.relationLabels.every(l => l.subject === 'self' && l.roles.verified === false)));
        start(value);
        for (const subject of ['self', 'player']) {
            assert.equal(capture(buffer, hear(value, demo(subject, locale), locale)), false);
            const ordinary = hear(value, catalog.reportTeaching[locale][subject].utterance, locale);
            assert.equal(ordinary.result.understandings[0].reportSource.kind, 'speaker_report');
            assert.equal(capture(buffer, ordinary), false);
        }
    }
});
test('interruption, later knowledge and caller mutations cannot rewrite captured partial report teaching', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); worldApi.approach(value.world, 'path');
    assert.deepEqual(value.world.relationLabels, []);
    value.state.knowledge.relations.push({ id: 'report', source: 'initial' });
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
    assert.equal((value.state.experiences || []).length, 0);
});
test('ordinary reports, other lessons, wrong activity, speaker and ambiguous attention stay outside report teaching', () => {
    for (const raw of [catalog.reportTeaching.ja.self.utterance, catalog.reportTeaching.ja.player.utterance,
        'ぽぽは休むことだよ', '「何してる？」→「休む」', '【お願い】「休んでね」', `${demo()}。甘い`, '【報告・私】「未知」'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
    assert.equal(capture(candidates.create(), hear(setup(), demo(), 'ja', 'visitor')), false);
    const wrong = setup(); wrong.world.mode = 'eat'; wrong.world.attention = 'berry:1';
    assert.equal(capture(candidates.create(), hear(wrong)), false);
    const ambiguous = setup(); ambiguous.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(capture(candidates.create(), hear(ambiguous)), false);
});
test('mismatched input context, basis, subject, roles or acceptance cannot manufacture report candidates', () => {
    const v = hear(setup());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.context.scene = 'other'; },
        v => { v.context.target = 'berry:1'; }, v => { v.context.activityStart = 2; },
        v => { v.result.relationLearning.candidates[0].inputId = 'input:9'; },
        v => { v.result.relationLearning.candidates[0].utterance = 'other'; },
        v => { v.result.relationLearning.candidates[0].roles.verified = true; },
        v => { v.result.relationLearning.adopted.roles.contentSubject = 'player'; },
        v => { v.result.interpretations[0].roles.status = 'observed'; },
        v => { v.result.understandings[0].subject = 'self'; },
        v => { v.result.understandings[0].roles = v.result.interpretations[0].roles; },
        v => { v.result.relationLearning.updated = ['report']; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
