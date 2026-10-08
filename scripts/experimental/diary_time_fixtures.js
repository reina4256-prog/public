'use strict';
// Real receive/respond/finish in disposable memory; only snapshots enter the renderer.
const assert = require('node:assert/strict');
const helper = require('./diary_negation_fixtures');
const catalog = require('../../experimental_word_learning_catalog.json');
const core = require('../../experimental_word_learning_core');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (time, locale = 'ja') => {
    const item = catalog.timeTeaching[locale][time];
    return `${item.marker}「${item.utterance}」`;
};
function hear(value, time, locale = 'ja', speaker = 'player', raw = demo(time, locale)) {
    const beforeExperiences = copy(value.state.experiences || []);
    return { ...helper.hear(value, raw, locale, speaker), beforeExperiences };
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let present, past;
    for (const locale of Object.keys(catalog.timeTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = helper.setup({ foundation, life, speech });
            add('initial', [hear(value, 'now', locale), hear(value, 'past', locale)], [false, false]);
            // Test-memory removal isolates the initial-report prerequisite; no game rule changes.
            value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'time');
            const first = hear(value, 'now', locale);
            helper.finish(value); helper.start(value, 'rest');
            add('initial-report', [first, hear(value, 'past', locale)], [foundation && life, foundation && life]);
        }
    for (const locale of Object.keys(catalog.timeTeaching)) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) {
            const value = helper.setup({ life, speech }); helper.learnReport(value, locale);
            helper.start(value, 'rest');
            add('past-without-present', [hear(value, 'past', locale)], [false]);
            const records = value.state.records.length, values = [];
            for (const time of ['now', 'past']) {
                helper.start(value, 'rest');
                const first = hear(value, time, locale), repeated = hear(value, time, locale);
                assert.equal(value.world.relationLabels.length, 1);
                assert.equal(repeated.result.relationLearning.adopted.inputId, first.result.input.id);
                if (locale === 'ja' && life && speech === 'short') {
                    if (time === 'now') present = copy(first); else past = copy(first);
                }
                values.push(first, repeated); helper.finish(value);
            }
            assert.equal(value.state.records.length, records);
            assert.equal(value.state.knowledge.relations.filter(r => r.id === 'time').length, 2);
            add('completed-and-repeated', values, [true, true, true, true]);
            for (const time of ['now', 'past']) {
                helper.start(value, 'rest');
                add('known-excluded', [hear(value, time, locale)], [false]);
                add('ordinary-excluded', [hear(value, time, locale, 'player', catalog.timeTeaching[locale][time].utterance)], [false]);
            }
            const otherLocale = locale === 'ja' ? 'en' : 'ja';
            add('other-locale', [hear(value, 'now', otherLocale)], [false]);
            add('other-speaker', [hear(value, 'now', locale, 'visitor')], [false]);
        }
    for (const outcome of ['finish', 'interrupt']) {
        const value = helper.setup(); helper.learnReport(value, 'ja'); helper.start(value, 'rest');
        const first = hear(value, 'now');
        if (outcome === 'finish') helper.finish(value);
        else require('../../experimental_word_learning_world').approach(value.world, 'path');
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('snapshot-after-change', [first], [true]);
    }
    const sharedMutators = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.relations.push({ id: 'time', source: 'initial' }); },
        v => { v.context.scene = 'other'; }, v => { v.context.mode = 'eat'; },
        v => { v.context.target = 'berry:1'; }, v => { v.context.activityStart++; }, v => { v.context.elapsed++; },
        v => { v.context.attention = []; }, v => { v.context.attention.push({ id: 'shade' }); },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.raw = 'other'; },
        v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at++; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.interpretations[0].kind = 'report'; }, v => { v.result.interpretations[0].time = 'other'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.understandings[0].polarity = 'unknown'; }, v => { v.result.understandings[0].eventTime = 'now'; },
        v => { v.result.understandings[0].subject = 'self'; }, v => { v.result.understandings[0].roles = {}; },
        v => { v.result.understandings[0].reportSource = {}; }, v => { v.result.understandings[0].complete = true; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.relationLearning.updated = ['time']; }, v => { v.result.relationLearning.relationAcquired = true; },
        v => { v.result.relationLearning.candidates.push(copy(v.result.relationLearning.candidates[0])); },
        ...['basis', 'reportBasis', 'understanding', 'eventReference'].map(key => v => { v.result.relationLearning.candidates[0][key] = {}; }),
        v => { v.result.relationLearning.adopted.eventTime = 'other'; },
        ...['locale', 'speaker', 'scene', 'subject', 'meaning', 'utterance', 'inputId', 'heardAt', 'at', 'understanding']
            .map(key => v => { v.result.relationLearning.adopted[key] = 'other'; }),
        ...['kind', 'meaning', 'form', 'locale', 'speaker', 'roles'].map(key => v => {
            v.beforeKnowledge.relations.find(r => r.scope?.roles.contentSubject === 'self').scope[key] = 'other'; })
    ];
    for (const source of [present, past]) for (const mutate of sharedMutators) {
        const invalid = copy(source); mutate(invalid); add('tampered-common', [invalid], [false]);
    }
    const refMutators = [
        v => { v.beforeExperiences = []; }, v => { v.beforeExperiences = {}; }, v => { v.beforeKnowledge.relationEvidence = []; },
        ...['experienceId', 'inputId', 'eventTime', 'locale', 'speaker', 'form', 'reportForm', 'roles', 'meaning', 'eventReference']
            .map(key => v => { v.beforeKnowledge.relationEvidence.find(e => e.relation === 'time')[key] = 'other'; }),
        ...['id', 'kind', 'activity', 'target', 'start', 'end'].map(key => v => {
            v.beforeExperiences.find(e => e.relationLabels?.some(l => l.relation === 'time'))[key] = 'other'; }),
        ...['inputId', 'start', 'basis', 'reportBasis', 'roles', 'eventReference', 'meaning', 'activity', 'target', 'subject', 'at', 'heardAt', 'raw'].map(key => v => {
            v.beforeExperiences.find(e => e.relationLabels?.some(l => l.relation === 'time')).relationLabels[0][key] = 'other'; }),
        v => { v.result.relationLearning.adopted.eventReference = {}; }
    ];
    for (const mutate of refMutators) { const invalid = copy(past); mutate(invalid); add('tampered-past-reference', [invalid], [false]); }
    for (const mode of ['eat', 'observe']) {
        const value = helper.setup(); helper.learnReport(value, 'ja'); helper.start(value, mode);
        add('wrong-activity', [hear(value, 'now')], [false]);
    }
    const ambiguous = helper.setup(); helper.learnReport(ambiguous, 'ja'); helper.start(ambiguous, 'rest');
    core.perceive(ambiguous.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }] });
    add('ambiguous', [hear(ambiguous, 'now')], [false]);
    for (const raw of [catalog.timeTeaching.ja.now.utterance, catalog.timeTeaching.ja.past.utterance,
        catalog.timeTeaching.ja.now.negative, catalog.timeTeaching.ja.now.player,
        catalog.reportTeaching.ja.self.utterance, helper.demo('negative'), demo('now') + '. extra']) {
        const value = helper.setup(); helper.learnReport(value, 'ja'); helper.start(value, 'rest');
        add('other-entry', [hear(value, 'now', 'ja', 'player', raw)], [false]);
    }
    return result;
}
module.exports = { fixtures, hear, demo };
