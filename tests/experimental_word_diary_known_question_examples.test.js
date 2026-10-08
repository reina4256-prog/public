'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const examples = require('../experimental_word_diary_known_question_examples');
const unknown = require('../experimental_word_diary_question_examples');
const questions = require('../experimental_word_diary_questions');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = {
    ja: ['何してる？', '食べる', '休む'], en: ['What are you doing?', 'eat', 'rest'],
    'zh-CN': ['你在做什么？', '吃', '休息'], ru: ['Что ты делаешь?', 'есть', 'отдых'],
    'es-ES': ['¿Qué estás haciendo?', 'comer', 'descansar'],
    'pt-BR': ['O que você está fazendo?', 'comer', 'descansar'], de: ['Was machst du?', 'speisen', 'ausruhen']
};
const demo = (locale = 'ja', activity = 'rest') => `「${forms[locale][0]}」→「${forms[locale][activity === 'eat' ? 1 : 2]}」`;
function start(value, activity) {
    const { state, world } = value;
    Object.assign(world, { mode: activity, attention: activity === 'eat' ? 'berry:1' : 'shade',
        elapsed: Math.max(1, world.elapsed), activityStart: Math.max(1, world.elapsed), dwell: .1, harvest: 1,
        hunger: .8, fatigue: .7, activityBefore: { hunger: .8, fatigue: .7 } });
    if (activity === 'eat') world.mealTaste = { quality: 'sweet', pleasant: true };
    core.perceive(state, { scene: 'clearing', attention: [{ id: world.attention, meaning: activity === 'eat' ? 'berry' : 'rest' }] });
}
function setup(activity = 'rest', options = {}) {
    const value = { state: core.create({ foundation: true, life: true, ...options }, catalog), world: worldApi.create() };
    start(value, activity); return value;
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
    const value = setup('rest', { foundation: false, speech });
    hear(value, demo(locale), locale); finish(value); start(value, 'eat');
    hear(value, demo(locale, 'eat'), locale); finish(value); return value;
}
test('known question teaching keeps source, initial bases and quoted roles without an actual answer or mutation', () => {
    const value = setup(), v = hear(value), before = JSON.stringify({ value, v }), buffer = candidates.create();
    assert.equal(capture(buffer, v), true);
    const entry = buffer.read()[0];
    assert.equal(entry.kind, 'teaching'); assert.equal(entry.sourceId, v.result.input.id);
    assert.deepEqual(entry.captured.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
    assert.deepEqual(entry.captured.relationBasis, [{ id: 'question', source: 'initial' }]);
    assert.equal(entry.captured.understanding.complete, true);
    assert.equal(entry.captured.understanding.subject, 'player');
    assert.deepEqual(entry.captured.roles, { questioner: 'player', answerer: 'self', demonstrator: 'player', actualAnswer: false });
    assert.equal(value.state.context.turns.at(-1).answer, undefined);
    assert.equal(v.result.relationLearning, undefined); assert.deepEqual(value.state.records, []);
    assert.equal(unknown.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
    assert.equal(questions.capture(candidates.create(), v.result, v.reply), false);
    assert.equal(JSON.stringify({ value, v }), before);
});
test('seven grammars and eight starts preserve the initial knowledge boundary for both activities', () => {
    for (const locale of Object.keys(forms)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const activity of ['eat', 'rest']) {
            const value = setup(activity, { foundation, life, speech }), v = hear(value, demo(locale, activity), locale);
            assert.equal(capture(candidates.create(), v), foundation && life, `${locale}/${activity}/${foundation}/${life}/${speech}`);
        }
});
test('real completed contrasts supply scoped experienced bases in seven languages and both speech settings', () => {
    for (const locale of Object.keys(forms)) for (const speech of ['short', 'gesture']) {
        const value = acquire(locale, speech);
        for (const activity of ['eat', 'rest']) {
            start(value, activity); const v = hear(value, demo(locale, activity), locale), buffer = candidates.create();
            assert.equal(capture(buffer, v), true, `${locale}/${speech}/${activity}`);
            const entry = buffer.read()[0];
            assert.deepEqual(entry.captured.relationBasis, v.result.understandings[0].relationReferences);
            assert.equal(entry.captured.relationBasis[0].scope.locale, locale);
            assert.equal(entry.captured.relationBasis[0].source, 'experienced_relation');
            assert.equal(v.result.relationLearning, undefined);
        }
    }
});
test('new input repeats are distinct even without learning updates or records; rereceive and read do not add evidence', () => {
    const value = setup(), buffer = candidates.create(), before = copy(value.state.knowledge);
    const first = hear(value), second = hear(value);
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    const original = buffer.read(); assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2']);
    assert.equal(capture(buffer, first), false); assert.equal(capture(buffer, second), false);
    assert.deepEqual(value.state.knowledge, before); assert.deepEqual(value.state.records, []);
    first.result.input.raw = 'changed'; first.beforeKnowledge.relations[0].id = 'changed';
    buffer.read()[0].captured.roles.actualAnswer = true;
    assert.deepEqual(buffer.read(), original); assert.equal((value.state.experiences || []).length, 0);
});
test('unknown teaching stays partial after acquisition; known teaching stays fixed after completion, interruption and later knowledge', () => {
    const value = setup('rest', { foundation: false }), buffer = candidates.create(), partial = hear(value);
    assert.equal(unknown.capture(buffer, partial.result, partial.context, partial.beforeKnowledge), true);
    assert.equal(capture(buffer, partial), false); const original = buffer.read()[0];
    finish(value); start(value, 'eat'); hear(value, demo('ja', 'eat')); finish(value); start(value, 'rest');
    const known = hear(value); assert.equal(capture(buffer, known), true);
    const retained = buffer.read(); finish(value); start(value, 'rest'); worldApi.approach(value.world, 'path');
    value.state.knowledge.relations = []; value.state.knowledge.meanings = [];
    assert.equal(capture(buffer, known), false); assert.equal(capture(buffer, partial), false);
    assert.deepEqual(buffer.read(), retained); assert.deepEqual(buffer.read()[0], original);
    assert.equal(buffer.read()[0].captured.understanding.complete, false);
    assert.equal(buffer.read()[1].captured.understanding.complete, true);
});
test('other scopes, ordinary questions, other teaching, activity mismatch and ambiguous attention are excluded', () => {
    const learned = acquire(); start(learned, 'rest');
    assert.equal(capture(candidates.create(), hear(learned, demo(), 'ja', 'visitor')), false);
    assert.equal(capture(candidates.create(), hear(learned, demo('en'), 'en')), false);
    assert.equal(capture(candidates.create(), hear(learned, '「なにしてる？」→「休む」')), false);
    for (const raw of [forms.ja[0], demo('ja', 'eat'), '「何してる？」→「未知」',
        '「何してた？」→「休む」', 'ぽぽは休むことだよ', '【お願い】「休んでね」', '「何してる？」→「休む」。甘い'])
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
    const value = setup(); value.state.context.attention.push({ id: 'berry:1', meaning: 'berry' });
    assert.equal(capture(candidates.create(), hear(value)), false);
});
test('missing input-time bases and mismatched scoped references or source cannot supply known teaching', () => {
    const value = acquire(); start(value, 'rest'); const v = hear(value);
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:2'; },
        v => { v.context.elapsed = 0; }, v => { v.result.understandings[0].complete = false; },
        v => { v.beforeKnowledge.relations[0].scope.form = 'other'; },
        v => { v.beforeKnowledge.relations[0].scope.speaker = 'visitor'; },
        v => { v.beforeKnowledge.relations[0].scope.locale = 'en'; },
        v => { v.beforeKnowledge.relations[0].scope.kind = 'report'; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.relationLearning = { candidates: [] }; },
        v => { v.result.interpretations[0].span = 'other'; }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
