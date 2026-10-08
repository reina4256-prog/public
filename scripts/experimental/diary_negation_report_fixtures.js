'use strict';
// Real learning and report reception in disposable memory; renderer gets copies.
const assert = require('node:assert/strict');
const { setup, start, hear, finish, learnReport, demo } = require('./diary_negation_fixtures');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const raw = (locale = 'ja') => catalog.negationTeaching[locale].negative.utterance;
function acquire(locale = 'ja', life = true, speech = 'short', order = ['positive', 'negative']) {
    const value = setup({ life, speech }); learnReport(value, locale);
    for (const polarity of order) {
        start(value, polarity === 'positive' ? 'rest' : 'eat'); hear(value, demo(polarity, locale), locale); finish(value);
    }
    assert.equal(value.state.knowledge.relations.filter(r => r.id === 'negation').length, 2);
    return value;
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let scoped;
    for (const locale of Object.keys(catalog.negationTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            add('initial', [hear(setup({ foundation, life, speech }), raw(locale), locale)], [foundation && life]);
        }
    for (const locale of Object.keys(catalog.negationTeaching)) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const order of [['positive', 'negative'], ['negative', 'positive']]) {
            const value = setup({ life, speech });
            const unknown = hear(value, raw(locale), locale);
            learnReport(value, locale);
            const reportOnly = hear(value, raw(locale), locale);
            for (const polarity of order) {
                start(value, polarity === 'positive' ? 'rest' : 'eat'); hear(value, demo(polarity, locale), locale); finish(value);
            }
            add('past-unknown', [unknown, reportOnly], [false, false]);
            const knowledge = copy(value.state.knowledge), experiences = copy(value.state.experiences);
            const first = hear(value, raw(locale), locale), second = hear(value, raw(locale), locale);
            if (locale === 'ja') scoped = copy(first);
            assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.experiences, experiences);
            add('real-acquired-both-orders', [first, second], [true, true]);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('other-locale', [hear(value, raw(other), other)], [false]);
            add('other-speaker', [hear(value, raw(locale), locale, 'visitor')], [false]);
        }
    for (const mode of ['rest', 'eat', 'move', 'idle']) for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
        [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
        const value = setup({ foundation: true });
        Object.assign(value.world, { mode, attention: mode === 'eat' ? 'berry:1' : null });
        core.perceive(value.state, { scene: 'clearing', attention });
        add('hearing-context', [hear(value, raw())], [true]);
    }
    for (const locale of Object.keys(catalog.negationTeaching)) {
        add('normalized', [hear(setup({ foundation: true }), '  ' + raw(locale).toLocaleUpperCase() + '  ', locale)], [true]);
    }
    // Knowing a testimony does not require knowing the current activity word.
    const restOnly = setup({ foundation: true }); start(restOnly, 'eat');
    restOnly.state.knowledge.meanings = restOnly.state.knowledge.meanings.filter(m => m.id !== 'eat');
    add('no-observation-basis', [hear(restOnly, raw())], [true]);
    for (const completed of [false, true]) {
        const value = setup({ foundation: true }); start(value, 'rest'); const heard = hear(value, raw());
        if (completed) finish(value); else worldApi.approach(value.world, 'path');
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('later-knowledge', [heard], [true]);
    }
    const mutators = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        ...['report', 'negation'].map(id => v => { v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(r => r.id !== id); }),
        v => { v.context.scene = 'other'; }, v => { v.context.attention = null; },
        v => { v.context.target = {}; }, v => { v.context.elapsed = -1; }, v => { v.context.activityStart = null; },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.raw = 'other'; },
        v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at++; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        v => { v.result.interpretations[0].kind = 'negation_demonstration'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.interpretations[0].reportForm = 'other'; },
        v => { v.result.interpretations[0].polarity = 'positive'; },
        v => { v.result.interpretations[0].time = 'now'; },
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].polarity = 'unknown'; },
        v => { v.result.understandings[0].subject = 'player'; },
        v => { v.result.understandings[0].roles.verified = true; },
        v => { v.result.understandings[0].eventTime = 'now'; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences.reverse(); },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].reportReference = { inputId: 'input:1' }; },
        v => { delete v.result.understandings[0].reportSource; },
        v => { v.result.relationLearning = { candidates: [] }; },
        ...['inputId', 'heardAt', 'raw', 'locale', 'reporter', 'contentSubject', 'kind'].map(field => v => {
            v.result.understandings[0].reportSource[field] = 'other';
        }),
        ...['report', 'negation'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'polarity', 'reportForm', 'roles']
            .filter(field => id !== 'report' || !['polarity', 'reportForm'].includes(field)).map(field => v => {
                v.beforeKnowledge.relations.find(r => r.id === id && r.scope?.roles.contentSubject === 'self'
                    && (id === 'report' || r.scope.polarity === 'negative')).scope[field] = 'other';
            }))
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const text of [demo('positive'), demo('negative'), catalog.reportTeaching.ja.self.utterance,
        catalog.reportTeaching.ja.player.utterance, catalog.timeTeaching.ja.now.utterance,
        catalog.timeTeaching.ja.past.negative, catalog.proposalTeaching.ja.request.utterance,
        raw() + '？', raw() + '。' + catalog.reportTeaching.ja.self.utterance, 'unsupported input']) {
        add('other-entry', [hear(setup({ foundation: true }), text)], [false]);
    }
    return result;
}
module.exports = { fixtures, acquire, raw };
