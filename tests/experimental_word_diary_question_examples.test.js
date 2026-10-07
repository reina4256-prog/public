'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_question_examples');
const questions = require('../experimental_word_diary_questions');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = {
    ja: ['何してる？', '食べる', '休む'], en: ['What are you doing?', 'eat', 'rest'],
    'zh-CN': ['你在做什么？', '吃', '休息'], ru: ['Что ты делаешь?', 'есть', 'отдых'],
    'es-ES': ['¿Qué estás haciendo?', 'comer', 'descansar'],
    'pt-BR': ['O que você está fazendo?', 'comer', 'descansar'], de: ['Was machst du?', 'speisen', 'ausruhen']
};
const demo = (locale = 'ja', activity = 'rest') => `「${forms[locale][0]}」→「${forms[locale][activity === 'eat' ? 1 : 2]}」`;
function setup(activity = 'rest', options = {}) {
    const state = core.create({ foundation: false, life: true, ...options }, catalog), world = worldApi.create();
    start({ state, world }, activity);
    return { state, world };
}
function start(value, activity) {
    const { state, world } = value;
    Object.assign(world, { mode: activity, attention: activity === 'eat' ? 'berry:1' : 'shade',
        elapsed: Math.max(1, world.elapsed), activityStart: Math.max(1, world.elapsed), dwell: .1, harvest: 1,
        hunger: .8, fatigue: .7, activityBefore: { hunger: .8, fatigue: .7 } });
    if (activity === 'eat') world.mealTaste = { quality: 'sweet', pleasant: true };
    core.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: activity === 'eat' ? 'berry' : 'rest' }] });
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
test('question example preserves source and known action, not an actual answer, without mutation', () => {
    const value = setup(), v = hear(value), before = JSON.stringify({ value, v }), buffer = candidates.create();
    assert.equal(capture(buffer, v), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
    assert.equal(entry.captured.sources.frame.answer, forms.ja[2]);
    assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
    assert.deepEqual(entry.captured.understanding.unresolved, [{ type: 'relation', id: 'question' }]);
    assert.equal(entry.captured.understanding.complete, false);
    assert.equal(entry.captured.pairing.candidates[0].roles.actualAnswer, false);
    assert.equal(value.state.context.turns.at(-1).answer, undefined);
    assert.equal(questions.capture(candidates.create(), v.result, v.reply), false);
    assert.equal(JSON.stringify({ value, v }), before);
});
test('seven existing grammars across eight starts accept only unknown question with known action', () => {
    for (const locale of Object.keys(forms)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const activity of ['eat', 'rest']) {
            assert.equal(capture(candidates.create(), hear(setup(activity, { foundation, life, speech }), demo(locale, activity), locale)),
                !foundation && life, `${locale}/${activity}/${foundation}/${life}/${speech}`);
        }
});
test('new repeated examples keep their current source separately from first-only learning adoption', () => {
    const value = setup(), buffer = candidates.create();
    for (let i = 0; i < 3; i++) assert.equal(capture(buffer, hear(value)), true);
    const entries = buffer.read();
    assert.deepEqual(entries.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
    assert.equal(value.world.relationLabels.length, 1);
    assert.equal(entries[2].captured.pairing.adopted.inputId, 'input:1');
    assert.equal(entries[2].captured.pairing.candidates[0].inputId, 'input:3');
});
test('two completed activity examples acquire question without changing earlier partial understanding', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); finish(value); start(value, 'eat');
    assert.equal(capture(buffer, hear(value, demo('ja', 'eat'))), true); finish(value);
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'question' && r.source === 'experienced_relation'));
    assert.deepEqual(buffer.read()[0], original[0]); assert.equal(capture(buffer, v), false);
    assert.equal(capture(buffer, hear(value, demo('ja', 'eat'))), false, 'known relation example is a separate future entry');
    v.result.input.raw = 'changed'; buffer.read()[0].captured.pairing.candidates[0].roles.actualAnswer = true;
    assert.deepEqual(buffer.read()[0], original[0]);
});
test('interruption and later knowledge do not manufacture completion or upgrade the accepted example', () => {
    const value = setup(), buffer = candidates.create(), v = hear(value); capture(buffer, v);
    const original = buffer.read(); worldApi.approach(value.world, 'path');
    assert.deepEqual(value.world.relationLabels, []);
    value.state.knowledge.relations.push({ id: 'question', source: 'initial' });
    assert.equal(capture(buffer, v), false); assert.deepEqual(buffer.read(), original);
    assert.equal((value.state.experiences || []).length, 0);
});
test('ordinary questions, other teaching, unknown answers, wrong activity and ambiguous attention stay excluded', () => {
    for (const raw of [forms.ja[0], demo('ja', 'eat'), '「何してる？」→「未知」',
        '「何してた？」→「休む」', '「彼は何してる？」→「休む」', '「何してる？」→「休まない」',
        'ぽぽは休むことだよ', '【お願い】「休んでね」', '「何してる？」→「休む」。甘い'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
    assert.equal(capture(candidates.create(), hear(setup(), demo(), 'ja', 'visitor')), false);
    const value = setup(); value.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(capture(candidates.create(), hear(value)), false);
});
test('missing or mismatched input-time source, question, roles and basis cannot create accepted teaching', () => {
    const v = hear(setup());
    for (const mutate of [v => { delete v.beforeKnowledge.meanings; }, v => { v.beforeKnowledge.meanings = []; },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:2'; }, v => { v.context.activityStart = 2; },
        v => { v.result.relationLearning.candidates[0].inputId = 'input:9'; },
        v => { v.result.relationLearning.candidates[0].question = 'other'; },
        v => { v.result.relationLearning.candidates[0].answer = 'other'; },
        v => { v.result.relationLearning.candidates[0].roles.actualAnswer = true; },
        v => { v.result.relationLearning.adopted.roles.answerer = 'player'; },
        v => { v.result.relationLearning.updated = ['question']; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
