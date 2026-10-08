'use strict';
// Real learning and input handling in disposable memory; renderer gets copies only.
const assert = require('node:assert/strict');
const helper = require('./diary_negation_fixtures');
const { hear, demo } = require('./diary_time_fixtures');
const catalog = require('../../experimental_word_learning_catalog.json');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const copy = value => JSON.parse(JSON.stringify(value));
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let present, past, unidentified;
    for (const locale of Object.keys(catalog.timeTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const time of ['now', 'past']) {
            const value = helper.setup({ foundation, life, speech });
            const first = hear(value, time, locale);
            assert.equal(first.beforeExperiences.some(e => e.relationLabels?.some(l => l.relation === 'time')), false);
            add('initial-no-original', [first], [foundation && life]);
            if (foundation && life && locale === 'ja' && time === 'past') unidentified = copy(first);
        }
    for (const locale of Object.keys(catalog.timeTeaching)) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) {
            const value = helper.setup({ life, speech }); helper.learnReport(value, locale);
            const unknown = [];
            for (const time of ['now', 'past']) {
                helper.start(value, 'rest'); unknown.push(hear(value, time, locale)); helper.finish(value);
            }
            add('past-unknown-no-retroactive-generation', unknown, [false, false]);
            const knowledge = copy(value.state.knowledge), values = [];
            for (const time of ['now', 'past']) {
                helper.start(value, 'rest');
                const first = hear(value, time, locale), repeated = hear(value, time, locale);
                assert.equal(first.result.relationLearning, undefined);
                assert.equal(value.world.relationLabels.length, 0);
                values.push(first, repeated);
                if (locale === 'ja' && life && speech === 'short') {
                    if (time === 'now') present = copy(first); else past = copy(first);
                }
                helper.finish(value);
            }
            assert.deepEqual(value.state.knowledge, knowledge);
            add('real-acquired-repeated-original-preserved', values, [true, true, true, true]);
            for (const time of ['now', 'past']) {
                helper.start(value, 'rest');
                add('ordinary-excluded', [hear(value, time, locale, 'player', catalog.timeTeaching[locale][time].utterance)], [false]);
                add('other-locale', [hear(value, time, locale === 'ja' ? 'en' : 'ja')], [false]);
                add('other-speaker', [hear(value, time, locale, 'visitor')], [false]);
            }
        }
    for (const outcome of ['finish', 'interrupt']) for (const time of ['now', 'past']) {
        const value = helper.setup({ foundation: true });
        const first = hear(value, time);
        if (outcome === 'finish') helper.finish(value); else worldApi.approach(value.world, 'path');
        value.state.knowledge.meanings = []; value.state.knowledge.relations = []; value.state.experiences = [];
        add('snapshot-after-change', [first], [true]);
    }
    for (const time of ['now', 'past']) for (const mode of ['eat', 'observe']) {
        const value = helper.setup({ foundation: true }); helper.start(value, mode);
        add('wrong-activity', [hear(value, time)], [false]);
    }
    for (const time of ['now', 'past']) {
        const value = helper.setup({ foundation: true });
        core.perceive(value.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }] });
        add('ambiguous-attention', [hear(value, time)], [false]);
    }
    // An unrelated/mere completed rest never supplies a past teaching reference.
    const unrelated = copy(unidentified);
    unrelated.beforeExperiences.push({ id: 'experience:999', kind: 'experience', activity: 'rest', target: 'shade', start: 0, end: 1 });
    add('unrelated-rest-not-a-reference', [unrelated], [true]);
    const foreign = copy(unidentified);
    foreign.beforeKnowledge.relationEvidence = past.beforeKnowledge.relationEvidence.map(e => ({ ...copy(e), speaker: 'visitor' }));
    foreign.beforeExperiences = copy(past.beforeExperiences);
    add('foreign-evidence-not-a-reference', [foreign], [true]);
    const otherLanguage = copy(foreign);
    otherLanguage.beforeKnowledge.relationEvidence = past.beforeKnowledge.relationEvidence.map(e => ({ ...copy(e), locale: 'en' }));
    add('foreign-evidence-not-a-reference', [otherLanguage], [true]);
    const common = [
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.context.scene = 'other'; }, v => { v.context.mode = 'eat'; }, v => { v.context.target = 'berry:1'; },
        v => { v.context.activityStart = NaN; }, v => { v.context.elapsed = -1; },
        v => { v.context.attention = []; }, v => { v.context.attention.push({ id: 'shade' }); },
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.raw = 'other'; },
        v => { v.result.input.locale = 'en'; }, v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.at = null; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        ...['kind', 'subject', 'meaning', 'aspect', 'polarity', 'time', 'roles', 'relations', 'reportForm', 'form', 'utterance'].map(key => v => {
            v.result.interpretations[0][key] = 'other';
        }),
        v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].known = {}; },
        v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'time' }]; },
        ...['kind', 'relations', 'subject', 'aspect', 'polarity', 'eventTime', 'roles'].map(key => v => { v.result.understandings[0][key] = 'other'; }),
        v => { v.result.understandings[0].reportSource = {}; }, v => { v.result.relationLearning = {}; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences.reverse(); },
        ...['report', 'time'].flatMap(id => ['kind', 'meaning', 'form', 'locale', 'speaker', 'roles',
            ...(id === 'time' ? ['eventTime', 'polarity', 'reportForm'] : [])].map(key => v => {
                v.beforeKnowledge.relations.find(r => r.id === id && r.scope?.form === (id === 'report'
                    ? v.result.interpretations[0].reportForm : v.result.interpretations[0].form)).scope[key] = 'other';
            }))
    ];
    for (const source of [present, past]) for (const mutate of common) {
        const invalid = copy(source); mutate(invalid); add('tampered-common', [invalid], [false]);
    }
    const original = v => v.beforeExperiences.find(e => e.id === v.beforeKnowledge.relationEvidence.find(e => e.relation === 'time' && e.eventTime === 'now').experienceId);
    const label = v => original(v).relationLabels.find(l => l.relation === 'time' && l.eventTime === 'now');
    const refMutators = [
        v => { v.beforeExperiences = []; }, v => { v.beforeExperiences = {}; },
        v => { v.beforeKnowledge.relationEvidence = {}; },
        ...['experienceId', 'inputId', 'meaning', 'form', 'reportForm', 'roles', 'eventReference'].map(key => v => {
            v.beforeKnowledge.relationEvidence.find(e => e.relation === 'time' && e.eventTime === 'now')[key] = 'other';
        }),
        ...['id', 'kind', 'activity', 'target', 'start', 'end'].map(key => v => { original(v)[key] = 'other'; }),
        ...['inputId', 'start', 'basis', 'reportBasis', 'roles', 'eventReference', 'meaning', 'activity', 'target',
            'subject', 'at', 'heardAt', 'raw', 'utterance', 'form', 'reportForm', 'understanding', 'locale', 'speaker', 'eventTime'].map(key => v => { label(v)[key] = 'other'; }),
        v => { original(v).end = v.context.activityStart + 1; },
        v => { label(v).understanding.eventTime = 'now'; },
        v => { label(v).understanding.roles = copy(v.result.interpretations[0].roles); },
        v => { label(v).understanding.reportSource = {}; },
        v => { label(v).understanding.relationReferences = []; },
        // Keep the first matching root; a later good root cannot repair it.
        v => { const evidence = v.beforeKnowledge.relationEvidence.find(e => e.relation === 'time' && e.eventTime === 'now');
            v.beforeKnowledge.relationEvidence.unshift({ ...copy(evidence), experienceId: 'missing' }); }
    ];
    for (const mutate of refMutators) { const invalid = copy(past); mutate(invalid); add('tampered-original-reference', [invalid], [false]); }
    for (const mutate of [v => { v.beforeKnowledge.relationEvidence = undefined; }, v => { v.beforeExperiences = undefined; }]) {
        const invalid = copy(unidentified); mutate(invalid); add('missing-supply-not-missing-reference', [invalid], [false]);
    }
    for (const raw of [catalog.timeTeaching.ja.now.utterance, catalog.timeTeaching.ja.past.utterance,
        catalog.timeTeaching.ja.now.negative, catalog.timeTeaching.ja.past.player,
        catalog.reportTeaching.ja.self.utterance, helper.demo('negative'), demo('now') + '。甘い']) {
        add('other-entry', [hear(helper.setup({ foundation: true }), 'now', 'ja', 'player', raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
