'use strict';
const assert = require('node:assert/strict');
const { setup, start, hear, finish, learnReport, demo } = require('./diary_negation_fixtures');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let scoped;
    for (const locale of Object.keys(catalog.negationTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const polarity of ['positive', 'negative']) {
            const value = setup({ foundation, life, speech }); start(value, polarity === 'positive' ? 'rest' : 'eat');
            add('initial', [hear(value, demo(polarity, locale), locale)], [foundation && life]);
        }
    for (const locale of Object.keys(catalog.negationTeaching)) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) for (const order of [['positive', 'negative'], ['negative', 'positive']]) {
            const value = setup({ life, speech }); learnReport(value, locale);
            const unknown = [];
            for (const polarity of order) {
                start(value, polarity === 'positive' ? 'rest' : 'eat');
                unknown.push(hear(value, demo(polarity, locale), locale)); finish(value);
            }
            add('past-unknown', unknown, [false, false]);
            const knowledge = copy(value.state.knowledge), values = [];
            for (const polarity of order) {
                start(value, polarity === 'positive' ? 'rest' : 'eat');
                const first = hear(value, demo(polarity, locale), locale);
                values.push(first, hear(value, demo(polarity, locale), locale));
                assert.equal(first.result.relationLearning, undefined);
                if (locale === 'ja' && polarity === 'negative') scoped = copy(first);
                finish(value);
            }
            assert.deepEqual(value.state.knowledge, knowledge);
            add('real-acquired-both-orders', values, [true, true, true, true]);
            add('ordinary-excluded', [hear(value, catalog.negationTeaching[locale].negative.utterance, locale)], [false]);
            start(value, 'rest');
            const other = locale === 'ja' ? 'en' : 'ja';
            add('other-locale', [hear(value, demo('positive', other), other)], [false]);
            add('other-speaker', [hear(value, demo('positive', locale), locale, 'visitor')], [false]);
        }
    for (const polarity of ['positive', 'negative']) {
        const value = setup({ foundation: true }); start(value, polarity === 'positive' ? 'rest' : 'eat');
        const heard = hear(value, demo(polarity));
        if (polarity === 'positive') worldApi.approach(value.world, 'path'); else finish(value);
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('interrupted-completed-later-knowledge', [heard], [true]);
        const wrong = setup({ foundation: true }); start(wrong, polarity === 'positive' ? 'eat' : 'rest');
        add('wrong-activity', [hear(wrong, demo(polarity))], [false]);
        const ambiguous = setup({ foundation: true }); start(ambiguous, polarity === 'positive' ? 'rest' : 'eat');
        ambiguous.state.context.attention.push({ id: 'other' });
        add('ambiguous-attention', [hear(ambiguous, demo(polarity))], [false]);
    }
    const mutators = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings = v.beforeKnowledge.meanings.filter(m => m.id !== 'eat'); },
        v => { v.context.scene = 'other'; }, v => { v.context.target = 'berry:0'; },
        v => { v.context.mode = 'rest'; }, v => { v.context.elapsed = 0; },
        v => { v.context.attention = []; }, v => { v.result.input.id = 'input:0'; },
        v => { v.result.input.raw = 'other'; }, v => { v.result.input.locale = 'en'; },
        v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at = null; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        v => { v.result.interpretations[0].kind = 'report'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.interpretations[0].reportForm = 'other'; },
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].polarity = 'unknown'; },
        v => { v.result.understandings[0].subject = 'player'; },
        v => { v.result.understandings[0].roles.verified = true; },
        v => { v.result.understandings[0].reportSource = { kind: 'speaker_report' }; },
        v => { v.result.understandings[0].eventTime = 'now'; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.relationLearning = { candidates: [] }; },
        ...['report', 'negation'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'polarity', 'reportForm', 'roles'].filter(key => id !== 'report' || !['polarity', 'reportForm'].includes(key)).map(key => v => {
            v.beforeKnowledge.relations.find(r => r.id === id && r.scope?.roles.contentSubject === 'self'
                && (id === 'report' || r.scope.polarity === 'negative')).scope[key] = 'other';
        }))
    ];
    for (const mutate of mutators) { const invalid = copy(scoped); mutate(invalid); add('tampered', [invalid], [false]); }
    for (const raw of [catalog.negationTeaching.ja.negative.utterance, catalog.reportTeaching.ja.self.utterance,
        '【報告・あなた】「あなたは休んでいる」', '【お願い】「休んでね」', '「何してる？」→「休む」',
        'ぽぽは休むことだよ', catalog.timeTeaching.ja.now.utterance, demo('positive') + '。甘い']) {
        add('other-entry', [hear(setup({ foundation: true }), raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
