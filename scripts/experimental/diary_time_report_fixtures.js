'use strict';
// Real learning and input handling in disposable memory; renderer gets copies.
const assert = require('node:assert/strict');
const { setup, start, hear, finish, learnReport } = require('./diary_negation_fixtures');
const { demo } = require('./diary_time_fixtures');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const raw = (time = 'now', locale = 'ja') => catalog.timeTeaching[locale][time].utterance;
function acquire(locale = 'ja', life = true, speech = 'short') {
    const value = setup({ life, speech }); learnReport(value, locale);
    for (const time of ['now', 'past']) {
        start(value, 'rest'); hear(value, demo(time, locale), locale); finish(value);
    }
    assert.equal(value.state.knowledge.relations.filter(r => r.id === 'time').length, 2);
    return value;
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    const scoped = {};
    for (const locale of Object.keys(catalog.timeTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const time of ['now', 'past']) {
            add('initial', [hear(setup({ foundation, life, speech }), raw(time, locale), locale)], [foundation && life]);
        }
    for (const locale of Object.keys(catalog.timeTeaching)) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const value = setup({ life, speech }), unknown = ['now', 'past'].map(time => hear(value, raw(time, locale), locale));
        learnReport(value, locale);
        const reportOnly = ['now', 'past'].map(time => hear(value, raw(time, locale), locale));
        for (const time of ['now', 'past']) {
            start(value, 'rest'); hear(value, demo(time, locale), locale); finish(value);
        }
        add('past-unknown-no-retroactive-generation', [...unknown, ...reportOnly], [false, false, false, false]);
        const knowledge = copy(value.state.knowledge), experiences = copy(value.state.experiences);
        for (const time of ['now', 'past']) {
            const first = hear(value, raw(time, locale), locale), second = hear(value, raw(time, locale), locale);
            if (locale === 'ja' && life && speech === 'short') scoped[time] = copy(first);
            add('real-acquired-repeated', [first, second], [true, true]);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('other-locale', [hear(value, raw(time, other), other)], [false]);
            add('other-speaker', [hear(value, raw(time, locale), locale, 'visitor')], [false]);
        }
        assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.experiences, experiences);
    }
    for (const time of ['now', 'past']) for (const mode of ['rest', 'eat', 'move', 'idle'])
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
            [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
            const value = setup({ foundation: true });
            Object.assign(value.world, { mode, attention: mode === 'eat' ? 'berry:1' : null });
            core.perceive(value.state, { scene: 'clearing', attention });
            add('hearing-context-no-observation-proof', [hear(value, raw(time))], [true]);
        }
    for (const locale of Object.keys(catalog.timeTeaching)) for (const time of ['now', 'past'])
        add('normalized', [hear(setup({ foundation: true }), '  ' + raw(time, locale).toLocaleUpperCase() + '  ', locale)], [true]);
    for (const time of ['now', 'past']) {
        const value = setup({ foundation: true }); start(value, 'eat');
        value.state.knowledge.meanings = value.state.knowledge.meanings.filter(m => m.id !== 'eat');
        add('no-observation-basis', [hear(value, raw(time))], [true]);
        for (const completed of [false, true]) {
            const changed = setup({ foundation: true }), heard = hear(changed, raw(time));
            if (completed) finish(changed); else worldApi.approach(changed.world, 'path');
            changed.state.knowledge.meanings = []; changed.state.knowledge.relations = [];
            add('later-knowledge', [heard], [true]);
        }
        // Even available learning roots and unrelated rest material do not
        // identify this testimony's event. Those roots remain unchanged copies.
        const roots = copy(scoped[time]);
        roots.beforeKnowledge.relationEvidence = [];
        add('learning-evidence-not-event-identification', [roots], [true]);
    }
    const mutators = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        ...['report', 'time'].map(id => v => { v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(r => r.id !== id); }),
        v => { v.context.scene = 'other'; }, v => { v.context.attention = null; }, v => { v.context.mode = null; },
        v => { v.context.target = {}; }, v => { v.context.elapsed = -1; }, v => { v.context.activityStart = null; },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.raw = 'other'; },
        v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at++; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        v => { v.result.interpretations[0].kind = 'time_demonstration'; },
        v => { v.result.interpretations[0].subject = 'player'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.interpretations[0].reportForm = 'other'; },
        v => { v.result.interpretations[0].polarity = 'negative'; },
        v => { v.result.interpretations[0].time = 'other'; },
        v => { v.result.interpretations[0].eventReference = { experienceId: 1 }; },
        v => { v.result.interpretations[0].reportReference = { inputId: 'input:1' }; },
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].polarity = 'unknown'; },
        v => { v.result.understandings[0].subject = 'player'; },
        v => { v.result.understandings[0].roles.verified = true; },
        v => { v.result.understandings[0].eventTime = 'unspecified'; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences.reverse(); },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].eventReference = { experienceId: 1 }; },
        v => { v.result.understandings[0].reportReference = { inputId: 'input:1' }; },
        v => { delete v.result.understandings[0].reportSource; },
        v => { v.result.relationLearning = { candidates: [] }; },
        ...['inputId', 'heardAt', 'raw', 'locale', 'reporter', 'contentSubject', 'kind'].map(field => v => {
            v.result.understandings[0].reportSource[field] = 'other';
        }),
        ...['report', 'time'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'polarity', 'reportForm', 'roles', 'eventTime']
            .filter(field => id !== 'report' || !['polarity', 'reportForm', 'eventTime'].includes(field)).map(field => v => {
                v.beforeKnowledge.relations.find(r => r.id === id && r.scope?.roles.contentSubject === 'self'
                    && (id === 'report' || r.scope.eventTime === v.result.interpretations[0].time)).scope[field] = 'other';
            }))
    ];
    for (const time of ['now', 'past']) for (const mutate of mutators) {
        const invalid = copy(scoped[time]); mutate(invalid); add('tampered', [invalid], [false]);
    }
    for (const time of ['now', 'past']) for (const text of [demo(time), catalog.timeTeaching.ja[time].negative,
        catalog.timeTeaching.ja[time].player, catalog.timeTeaching.ja[time].playerNegative,
        raw(time) + '？', raw(time) + '。' + catalog.reportTeaching.ja.self.utterance])
        add('other-entry', [hear(setup({ foundation: true }), text)], [false]);
    for (const text of [catalog.reportTeaching.ja.self.utterance, catalog.negationTeaching.ja.negative.utterance,
        catalog.proposalTeaching.ja.request.utterance, 'unsupported input'])
        add('other-entry', [hear(setup({ foundation: true }), text)], [false]);
    return result;
}
module.exports = { fixtures, acquire, raw };
