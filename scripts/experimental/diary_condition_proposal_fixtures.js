'use strict';
// Gameplay and prerequisite acquisition use disposable Node memory only.
const assert = require('node:assert/strict');
const { setup, finish } = require('./diary_negation_fixtures');
const { prepare, start, hear, demo } = require('./diary_condition_fixtures');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
function learn(value, locale, order = ['met', 'unmet']) {
    prepare(value, locale);
    for (const status of order) { start(value, status === 'met' ? .8 : .2); hear(value, demo(status, locale), locale); finish(value); }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'condition'));
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    const locales = Object.keys(catalog.conditionTeaching);
    let scoped;
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const fatigue of [.8, .2, .4]) {
            const value = setup({ foundation, life, speech }); start(value, fatigue);
            add('initial', [hear(value, catalog.conditionTeaching[locale].utterance, locale)], [foundation && life]);
        }
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const order of [['met', 'unmet'], ['unmet', 'met']]) {
            const value = setup({ foundation, life, speech }); learn(value, locale, order);
            const knowledge = copy(value.state.knowledge), values = [];
            for (const fatigue of [.8, .2, .4]) {
                start(value, fatigue);
                const first = hear(value, catalog.conditionTeaching[locale].utterance, locale);
                values.push(first, hear(value, catalog.conditionTeaching[locale].utterance, locale));
                if (!foundation && locale === 'ja' && speech === 'short' && fatigue === .8) scoped = copy(first);
                finish(value);
            }
            assert.deepEqual(value.state.knowledge, knowledge);
            add('learned-both-orders-repeated', values, Array(6).fill(true));
            if (!foundation) {
                const other = locale === 'ja' ? 'en' : 'ja';
                add('other-locale', [hear(value, catalog.conditionTeaching[other].utterance, other)], [false]);
                add('other-speaker', [hear(value, catalog.conditionTeaching[locale].utterance, locale, 'visitor')], [false]);
            }
        }
    for (const locale of locales) {
        const value = setup({ foundation: true }); start(value);
        add('normalized', [hear(value, `  ${catalog.conditionTeaching[locale].utterance.toLocaleUpperCase()}  `, locale)], [true]);
    }
    for (const fatigue of [.55, .25, .550001, .249999, .549999, .250001, .4]) {
        const value = setup({ foundation: true }); start(value, fatigue);
        add('sensory-boundaries', [hear(value, catalog.conditionTeaching.ja.utterance)], [true]);
    }
    const unobserved = [
        v => { v.world.mode = 'eat'; }, v => { v.world.mode = 'walk'; }, v => { v.world.mode = 'idle'; },
        v => { v.world.attention = 'path'; },
        v => { core.perceive(v.state, { scene: 'clearing', attention: [] }); },
        v => { core.perceive(v.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'path', meaning: 'walk' }] }); },
        v => { v.world.fatigue = null; }, v => { v.world.activityBefore.fatigue = null; }
    ];
    for (const locale of locales) for (const change of unobserved) {
        const value = setup({ foundation: true }); start(value); change(value);
        const sample = hear(value, catalog.conditionTeaching[locale].utterance, locale);
        assert.equal(sample.result.conditionJudgment.status, 'unknown');
        assert.equal(sample.result.conditionJudgment.observation, null);
        add('unobserved-unknown', [sample], [true]);
    }
    for (const action of ['finish', 'interrupt']) {
        const value = setup(); learn(value, 'ja'); start(value);
        const first = hear(value, catalog.conditionTeaching.ja.utterance);
        if (action === 'finish') finish(value); else worldApi.approach(value.world, 'path');
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('later-world-and-knowledge', [first], [true]);
    }
    const changing = setup(); learn(changing, 'ja'); start(changing);
    const first = hear(changing, catalog.conditionTeaching.ja.utterance);
    changing.world.fatigue = .2; changing.world.elapsed += .1;
    add('same-rest-new-judgment', [first, hear(changing, catalog.conditionTeaching.ja.utterance)], [true, true]);
    assert.equal(changing.world.relationLabels.length, 0);
    for (const field of ['condition', 'request']) {
        const value = setup({ foundation: true }); start(value);
        value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== field);
        add('missing-prerequisite', [hear(value, catalog.conditionTeaching.ja.utterance)], [false]);
    }
    const mutators = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = undefined; },
        v => { v.context = undefined; }, v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings = v.beforeKnowledge.meanings.filter(m => m.id !== 'tired'); },
        ...['scene', 'mode', 'target'].map(field => v => { v.context[field] = 'other'; }),
        ...['activityStart', 'elapsed', 'fatigue'].map(field => v => { v.context[field] += .01; }),
        v => { v.context.activityBefore.fatigue = .9; }, v => { v.context.attention = []; },
        ...['id', 'raw', 'speaker', 'locale', 'scene'].map(field => v => { v.result.input[field] = 'other'; }),
        v => { v.result.input.at++; }, v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        ...['kind', 'subject', 'meaning', 'conditionMeaning', 'conditionSubject', 'proposalKind', 'application', 'duration', 'form', 'proposalForm', 'utterance']
            .map(field => v => { v.result.interpretations[0][field] = 'other'; }),
        v => { v.result.interpretations[0].demonstratedStatus = 'met'; },
        v => { v.result.interpretations[0].roles.actualParticipation = true; },
        ...['kind', 'conditionStatus', 'subject', 'aspect', 'target', 'questionSlot', 'polarity', 'eventTime']
            .map(field => v => { v.result.understandings[0][field] = 'other'; }),
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].known.conditionMeaning = 'other'; },
        v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'condition' }]; },
        v => { v.result.understandings[0].relations = ['request']; },
        v => { v.result.understandings[0].roles.actualParticipation = true; },
        v => { v.result.understandings[0].reportSource = {}; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.relationLearning = { candidates: [] }; }, v => { v.result.conditionJudgment = undefined; },
        ...['inputId', 'raw', 'locale', 'speaker', 'status', 'application', 'duration'].map(field => v => { v.result.conditionJudgment[field] = 'other'; }),
        ...['heardAt', 'at'].map(field => v => { v.result.conditionJudgment[field]++; }),
        v => { v.result.conditionJudgment.observation = null; },
        ...['source', 'subject', 'activity', 'target', 'status'].map(field => v => { v.result.conditionJudgment.observation[field] = 'other'; }),
        ...['start', 'at', 'before', 'fatigue'].map(field => v => { v.result.conditionJudgment.observation[field] += .01; }),
        ...['request', 'condition'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'roles',
            ...(id === 'condition' ? ['proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration'] : [])]
            .map(field => v => { v.beforeKnowledge.relations.find(r => r.id === id).scope[field] = 'other'; })),
        ...['request', 'condition'].map(id => v => { v.beforeKnowledge.relations.find(r => r.id === id).source = 'other'; })
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const raw of [demo('met'), demo('unmet'), catalog.proposalTeaching.ja.request.utterance,
        catalog.timeTeaching.ja.now.utterance, catalog.reportTeaching.ja.self.utterance,
        catalog.sequenceTeaching.ja.utterance, catalog.conditionTeaching.ja.utterance + '. unknown']) {
        const value = setup({ foundation: true }); start(value); add('other-entry', [hear(value, raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
