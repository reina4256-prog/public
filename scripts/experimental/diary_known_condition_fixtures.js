'use strict';
// Gameplay calls and prerequisite learning stay in disposable Node memory.
const assert = require('node:assert/strict');
const { setup, finish } = require('./diary_negation_fixtures');
const { prepare, start, hear, demo } = require('./diary_condition_fixtures');
const worldApi = require('../../experimental_word_learning_world');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    const locales = Object.keys(catalog.conditionTeaching);
    let scoped;
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const status of ['met', 'unmet']) {
            const value = setup({ foundation, life, speech }); start(value, status === 'met' ? .8 : .2);
            add('initial', [hear(value, demo(status, locale), locale)], [foundation && life]);
        }
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const order of [['met', 'unmet'], ['unmet', 'met']]) {
            const value = setup({ foundation, life, speech }); prepare(value, locale);
            const teaching = [];
            for (const status of order) {
                start(value, status === 'met' ? .8 : .2);
                teaching.push(hear(value, demo(status, locale), locale)); finish(value);
            }
            add('prerequisites-and-contrasts', teaching, [foundation, foundation]);
            assert.ok(value.state.knowledge.relations.some(r => r.id === 'condition'));
            const knowledge = copy(value.state.knowledge), values = [];
            for (const status of order) {
                start(value, status === 'met' ? .8 : .2);
                const first = hear(value, demo(status, locale), locale);
                values.push(first, hear(value, demo(status, locale), locale));
                assert.equal(first.result.relationLearning, undefined);
                assert.equal(first.result.conditionJudgment, undefined);
                if (!foundation && locale === 'ja' && speech === 'short' && status === 'met') scoped = copy(first);
                finish(value);
            }
            assert.deepEqual(value.state.knowledge, knowledge);
            add('known-both-orders-repeated', values, [true, true, true, true]);
            start(value);
            add('ordinary-excluded', [hear(value, catalog.conditionTeaching[locale].utterance, locale)], [false]);
            if (!foundation) {
                const other = locale === 'ja' ? 'en' : 'ja';
                add('other-locale', [hear(value, demo('met', other), other)], [false]);
                add('other-speaker', [hear(value, demo('met', locale), locale, 'visitor')], [false]);
            }
        }
    for (const fatigue of [.55, .25, .550001, .249999, .549999, .250001, .4]) for (const status of ['met', 'unmet']) {
        const value = setup({ foundation: true }); start(value, fatigue);
        add('sensory-boundaries', [hear(value, demo(status))], [status === (fatigue >= .55 ? 'met' : fatigue <= .25 ? 'unmet' : 'unknown')]);
    }
    for (const status of ['met', 'unmet']) {
        const value = setup({ foundation: true }); start(value, status === 'met' ? .8 : .2);
        const first = hear(value, demo(status));
        if (status === 'met') worldApi.approach(value.world, 'path'); else finish(value);
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('interrupted-completed-later-knowledge', [first], [true]);
    }
    const changing = setup({ foundation: true }); start(changing);
    const first = hear(changing, demo('met')); changing.world.fatigue = .2; changing.world.elapsed += .1;
    const second = hear(changing, demo('unmet'));
    add('same-rest-separate-known-inputs', [first, second], [true, true]);
    assert.equal(changing.world.relationLabels?.length || 0, 0);
    for (const mode of ['eat', 'walk', 'idle']) {
        const value = setup({ foundation: true }); start(value); value.world.mode = mode;
        add('outside-rest', [hear(value, demo('met'))], [false]);
    }
    for (const attention of [[], [{ id: 'shade', meaning: 'rest' }, { id: 'path', meaning: 'walk' }]]) {
        const value = setup({ foundation: true }); start(value);
        core.perceive(value.state, { scene: 'clearing', attention });
        add('absent-or-ambiguous-attention', [hear(value, demo('met'))], [false]);
    }
    const mutators = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = undefined; },
        v => { v.context = undefined; }, v => { v.beforeKnowledge.meanings = []; },
        v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings = v.beforeKnowledge.meanings.filter(m => m.id !== 'tired'); },
        ...['scene', 'mode', 'target'].map(key => v => { v.context[key] = 'other'; }),
        v => { v.context.elapsed = v.context.activityStart - 1; },
        v => { v.context.activityStart = null; }, v => { v.context.attention = []; },
        v => { v.context.activityBefore = undefined; },
        v => { v.context.activityBefore.fatigue = null; }, v => { v.context.activityBefore.fatigue = 1.1; },
        ...[null, -1, 1.1, .4, .2].map(fatigue => v => { v.context.fatigue = fatigue; }),
        ...['id', 'raw', 'speaker', 'locale', 'scene'].map(key => v => { v.result.input[key] = 'other'; }),
        v => { v.result.input.at = null; }, v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        ...['kind', 'subject', 'meaning', 'conditionMeaning', 'conditionSubject', 'proposalKind', 'application', 'duration', 'demonstratedStatus', 'form', 'proposalForm']
            .map(key => v => { v.result.interpretations[0][key] = 'other'; }),
        v => { v.result.interpretations[0].roles.actualParticipation = true; },
        ...['kind', 'conditionStatus', 'subject', 'aspect', 'target', 'questionSlot', 'polarity', 'eventTime']
            .map(key => v => { v.result.understandings[0][key] = 'other'; }),
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].known.conditionMeaning = 'other'; },
        v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'condition' }]; },
        v => { v.result.understandings[0].relations = ['request']; },
        v => { v.result.understandings[0].roles.actualParticipation = true; },
        v => { v.result.understandings[0].reportSource = {}; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.relationLearning = { candidates: [] }; },
        v => { v.result.conditionJudgment = { status: 'met' }; },
        ...['request', 'condition'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'roles',
            ...(id === 'condition' ? ['proposalForm', 'conditionMeaning', 'conditionSubject', 'application', 'duration'] : [])]
            .map(key => v => { v.beforeKnowledge.relations.find(r => r.id === id).scope[key] = 'other'; })),
        ...['request', 'condition'].map(id => v => { v.beforeKnowledge.relations.find(r => r.id === id).source = 'other'; })
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const raw of [catalog.conditionTeaching.ja.utterance, catalog.proposalTeaching.ja.request.utterance,
        catalog.timeTeaching.ja.now.utterance, catalog.reportTeaching.ja.self.utterance,
        catalog.sequenceTeaching.ja.utterance, demo('met') + '. unknown']) {
        const value = setup({ foundation: true }); start(value);
        add('other-entry', [hear(value, raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
