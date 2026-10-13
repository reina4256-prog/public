'use strict';
const assert = require('node:assert/strict');
const { setup, hear, learnReport, finish, start, demo } = require('./diary_negation_fixtures');
const { acquire } = require('./diary_time_report_fixtures');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = ['negative', 'player', 'playerNegative'];
const raw = (form, time = 'now', locale = 'ja') => catalog.timeTeaching[locale][time][form];
function fixtures() {
    const all = [], add = (group, values, expected) => all.push({ group, values, expected });
    const roots = [];
    for (const locale of Object.keys(catalog.timeTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture'])
            for (const time of ['now', 'past']) for (const form of forms) {
                add('initial-seven-locales-eight-settings-six-forms',
                    [hear(setup({ foundation, life, speech }), raw(form, time, locale), locale)], [foundation && life]);
            }
    for (const locale of Object.keys(catalog.timeTeaching)) {
        const value = setup({ foundation: true });
        value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'report');
        const missing = forms.flatMap(form => ['now', 'past'].map(time => hear(value, raw(form, time, locale), locale)));
        learnReport(value, locale);
        add('before-real-report-learning-no-retroactivity', missing, missing.map(() => false));
        const knowledge = copy(value.state.knowledge), experiences = copy(value.state.experiences);
        for (const time of ['now', 'past']) for (const form of forms) {
            const first = hear(value, raw(form, time, locale), locale), second = hear(value, raw(form, time, locale), locale);
            assert.equal(first.result.understandings[0].complete, true);
            if (locale === 'ja') roots.push(copy(first));
            add('real-scoped-report-with-initial-time-negation', [first, second], [true, true]);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('report-scope-other-locale', [hear(value, raw(form, time, other), other)], [false]);
            add('report-scope-other-speaker', [hear(value, raw(form, time, locale), locale, 'visitor')], [false]);
        }
        assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.experiences, experiences);
        const limited = acquire(locale);
        for (const polarity of ['positive', 'negative']) {
            start(limited, polarity === 'positive' ? 'rest' : 'eat');
            hear(limited, demo(polarity, locale), locale); finish(limited);
        }
        assert.equal(limited.state.knowledge.relations.filter(r => r.id === 'negation').length, 2);
        for (const time of ['now', 'past']) for (const form of forms)
            add('limited-time-negation-never-generalized', [hear(limited, raw(form, time, locale), locale)], [false]);
        for (const time of ['now', 'past']) for (const form of forms)
            add('existing-normalization', [hear(setup({ foundation: true }), '  ' + raw(form, time, locale).toLocaleUpperCase() + '  ', locale)], [true]);
        for (const time of ['now', 'past']) {
            for (const form of ['utterance', ...forms]) {
                const text = catalog.timeTeaching[locale][time][form];
                add('j-keeps-positive-self', [hear(setup({ foundation: true }), text, locale)], [form !== 'utterance']);
            }
            for (const form of forms) for (const suffix of ['?', ' extra'])
                add('other-expression-no-new-grammar', [hear(setup({ foundation: true }), raw(form, time, locale) + suffix, locale)], [false]);
        }
    }
    for (const time of ['now', 'past']) for (const form of forms) for (const mode of ['rest', 'eat', 'move', 'idle'])
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }], [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
            const value = setup({ foundation: true }); value.world.mode = mode;
            core.perceive(value.state, { scene: 'clearing', attention });
            add('hearing-scene-never-verifies-report', [hear(value, raw(form, time))], [true]);
        }
    const edits = [
        v => { v.beforeKnowledge.meanings = []; },
        v => { v.beforeKnowledge.meanings.push(copy(v.beforeKnowledge.meanings.find(r => r.id === 'rest'))); },
        v => { v.beforeKnowledge.relations = []; },
        ...['report', 'time', 'negation'].map(id => v => {
            v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(r => r.id !== id);
        }),
        v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === 'report'
            && r.scope.roles.contentSubject === v.result.interpretations[0].subject))); },
        ...['kind', 'meaning', 'locale', 'speaker', 'form', 'roles'].map(field => v => {
            v.beforeKnowledge.relations.find(r => r.id === 'report' && r.scope.roles.contentSubject === v.result.interpretations[0].subject).scope[field] = 'other';
        }),
        v => { v.context.scene = 'other'; }, v => { v.context.attention = null; },
        v => { v.context.mode = null; }, v => { v.context.target = {}; },
        v => { v.context.elapsed = -1; }, v => { v.context.activityStart = null; },
        ...['id', 'raw', 'locale', 'speaker', 'at'].map(field => v => { v.result.input[field] = 'other'; }),
        ...['kind', 'subject', 'meaning', 'aspect', 'utterance', 'form', 'reportForm', 'span', 'polarity', 'time', 'relations', 'roles'].map(field => v => {
            v.result.interpretations[0][field] = 'other';
        }),
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        ...['kind', 'known', 'unresolved', 'relations', 'subject', 'aspect', 'polarity', 'eventTime', 'roles', 'reportSource', 'relationReferences'].map(field => v => {
            v.result.understandings[0][field] = 'other';
        }),
        v => { v.result.understandings[0].complete = false; },
        ...['inputId', 'heardAt', 'raw', 'locale', 'reporter', 'contentSubject', 'kind'].map(field => v => {
            v.result.understandings[0].reportSource[field] = 'other';
        }),
        ...['reportReference', 'eventReference', 'pastReference'].flatMap(field => ['interpretations', 'understandings'].map(part => v => {
            v.result[part][0][field] = { experienceId: 1 };
        })),
        v => { v.result.relationLearning = { candidates: [] }; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].roles.verified = true; },
        v => { v.result.interpretations[0].roles.verified = true; }
    ];
    for (const original of roots) for (const edit of edits) {
        const invalid = copy(original); edit(invalid);
        // A positive player report does not require negation.
        const irrelevant = edits.indexOf(edit) === 5 && original.result.interpretations[0].polarity === 'positive';
        add('tampered-materials', [invalid], [irrelevant]);
    }
    for (const original of roots) {
        const value = copy(original); value.beforeKnowledge.relationEvidence = [];
        add('learning-input-is-not-reported-rest', [value], [true]);
        const changed = setup({ foundation: true }), heard = hear(changed, original.result.input.raw);
        finish(changed); changed.state.knowledge.meanings = []; changed.state.knowledge.relations = [];
        add('later-change-preserves-hearing', [heard], [true]);
    }
    for (const text of [catalog.reportTeaching.ja.self.utterance, catalog.reportTeaching.ja.player.utterance,
        catalog.negationTeaching.ja.negative.utterance, catalog.proposalTeaching.ja.request.utterance,
        `${catalog.timeTeaching.ja.now.marker}「${catalog.timeTeaching.ja.now.utterance}」`, 'unsupported input'])
        add('other-existing-system', [hear(setup({ foundation: true }), text)], [false]);
    return all;
}
module.exports = { fixtures, forms, raw };
