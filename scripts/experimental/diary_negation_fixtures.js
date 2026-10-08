'use strict';
// Actual receive/respond/finish in disposable Node memory. Only copied
// materials, never a game state or storage bridge, enter the diary renderer.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (polarity, locale = 'ja') => {
    const item = catalog.negationTeaching[locale][polarity];
    return `${item.marker}「${polarity === 'positive' ? catalog.reportTeaching[locale].self.utterance : item.utterance}」`;
};
function start(value, mode) {
    const target = mode === 'rest' ? 'shade' : `berry:${++value.world.harvest}`;
    Object.assign(value.world, { mode, attention: target, elapsed: Math.max(1, value.world.elapsed),
        activityStart: Math.max(1, value.world.elapsed), dwell: .1, fatigue: .7, hunger: .8,
        activityBefore: { hunger: .8, fatigue: .7 },
        mealTaste: mode === 'eat' ? { quality: 'sweet', pleasant: true } : null });
    core.perceive(value.state, { scene: 'clearing', attention: [{ id: target, meaning: mode === 'rest' ? 'rest' : 'berry' }] });
}
function setup(options = {}) {
    const value = { state: core.create({ foundation: false, life: true, ...options }, catalog), world: worldApi.create() };
    start(value, 'rest'); return value;
}
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state, catalog);
    return { result, context, beforeKnowledge };
}
function finish(value) {
    value.world.pause = 0;
    worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
}
function learnReport(value, locale) {
    if (!value.state.settings.life) {
        const activityWords = {
            ja: ['食べる', '休む'], en: ['eat', 'rest'], 'zh-CN': ['吃', '休息'],
            ru: ['есть', 'отдых'], 'es-ES': ['comer', 'descansar'],
            'pt-BR': ['comer', 'descansar'], de: ['speisen', 'ausruhen']
        };
        for (const mode of ['eat', 'rest']) {
            start(value, mode); hear(value, activityWords[locale][mode === 'eat' ? 0 : 1], locale); finish(value);
            assert.ok(value.state.knowledge.meanings.some(m => m.id === mode));
        }
    }
    for (const subject of ['self', 'player']) {
        start(value, 'rest'); const item = catalog.reportTeaching[locale][subject];
        hear(value, `${item.marker}「${item.utterance}」`, locale); finish(value);
    }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'report' && r.source === 'experienced_relation'));
}
function fixtures() {
    const result = [];
    const add = (group, values, expected) => result.push({ group, values, expected });
    // Initial eight starts cannot jointly provide known report and unknown
    // negation. The second matrix removes only initial negation in test memory
    // to exercise initial-report prerequisites, never a gameplay change.
    for (const locale of Object.keys(catalog.negationTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const polarity of ['positive', 'negative']) {
            const value = setup({ foundation, life, speech }); start(value, polarity === 'positive' ? 'rest' : 'eat');
            add('initial', [hear(value, demo(polarity, locale), locale)], [false]);
            value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'negation');
            add('initial-report', [hear(value, demo(polarity, locale), locale)], [foundation && life]);
        }
    let scoped;
    for (const locale of Object.keys(catalog.negationTeaching)) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        for (const order of [['positive', 'negative'], ['negative', 'positive']]) {
            const value = setup({ speech, life }); learnReport(value, locale);
            const records = value.state.records.length, values = [];
            for (const polarity of order) {
                start(value, polarity === 'positive' ? 'rest' : 'eat');
                const first = hear(value, demo(polarity, locale), locale);
                const repeated = hear(value, demo(polarity, locale), locale);
                assert.equal(value.world.relationLabels.length, 1);
                assert.equal(repeated.result.relationLearning.adopted.inputId, first.result.input.id);
                if (locale === 'ja' && speech === 'short' && polarity === 'negative') scoped = copy(first);
                values.push(first, repeated); finish(value);
            }
            assert.equal(value.state.records.length, records);
            assert.equal(value.state.knowledge.relations.filter(r => r.id === 'negation').length, 2);
            assert.ok(value.state.experiences.every(e => (e.relationLabels || []).every(l => l.roles.verified === false)));
            add('completed', values, [true, true, true, true]);
            for (const polarity of order) {
                start(value, polarity === 'positive' ? 'rest' : 'eat');
                add('known-excluded', [hear(value, demo(polarity, locale), locale)], [false]);
            }
            add('ordinary-excluded', [hear(value, catalog.negationTeaching[locale].negative.utterance, locale)], [false]);
            start(value, 'rest');
            add('other-locale', [hear(value, demo('positive', locale === 'ja' ? 'en' : 'ja'), locale === 'ja' ? 'en' : 'ja')], [false]);
        }
    for (const polarity of ['positive', 'negative']) {
        const value = setup(); learnReport(value, 'ja'); start(value, polarity === 'positive' ? 'rest' : 'eat');
        const first = hear(value, demo(polarity));
        if (polarity === 'positive') worldApi.approach(value.world, 'path');
        else finish(value);
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('interrupted-or-completed', [first], [true]);
    }
    const mutators = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings = v.beforeKnowledge.meanings.filter(m => m.id !== 'eat'); },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:0'; },
        v => { v.context.mode = 'rest'; }, v => { v.context.activityStart++; }, v => { v.context.elapsed++; },
        v => { v.context.attention.push({ id: 'shade' }); }, v => { v.result.input.id = 'input:0'; },
        v => { v.result.input.raw = 'other'; }, v => { v.result.input.locale = 'en'; },
        v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at++; },
        v => { v.result.interpretations[0].kind = 'report'; }, v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.understandings[0].polarity = 'negative'; }, v => { v.result.understandings[0].subject = 'self'; },
        v => { v.result.understandings[0].roles = v.result.interpretations[0].roles; },
        v => { v.result.understandings[0].complete = true; }, v => { v.result.understandings[0].eventTime = 'now'; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.relationLearning.candidates[0].inputId = 'input:99'; },
        ...['basis', 'observationBasis', 'reportBasis'].map(key => v => { v.result.relationLearning.candidates[0][key] = {}; }),
        ...['kind', 'meaning', 'form', 'locale', 'speaker'].map(key => v => {
            v.beforeKnowledge.relations.find(r => r.scope?.roles.contentSubject === 'self').scope[key] = 'other'; }),
        v => { v.result.relationLearning.adopted.polarity = 'positive'; },
        v => { v.result.relationLearning.updated = ['negation']; },
        v => { v.result.relationLearning.candidates.push(copy(v.result.relationLearning.candidates[0])); }
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const raw of [catalog.negationTeaching.ja.negative.utterance, catalog.reportTeaching.ja.self.utterance,
        '【報告・あなた】「あなたは休んでいる」', '【お願い】「休んでね」', '「何してる？」→「休む」',
        'ぽぽは休むことだよ', catalog.timeTeaching.ja.now.utterance, demo('positive') + '。甘い']) {
        const value = setup(); learnReport(value, 'ja'); add('other-entry', [hear(value, raw)], [false]);
    }
    for (const polarity of ['positive', 'negative']) {
        const wrong = setup(); learnReport(wrong, 'ja'); start(wrong, polarity === 'positive' ? 'eat' : 'rest');
        add('wrong-activity', [hear(wrong, demo(polarity))], [false]);
        const visitor = setup(); learnReport(visitor, 'ja'); start(visitor, polarity === 'positive' ? 'rest' : 'eat');
        add('other-speaker', [hear(visitor, demo(polarity), 'ja', 'visitor')], [false]);
    }
    return result;
}
module.exports = { fixtures };
