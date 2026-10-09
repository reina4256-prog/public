'use strict';
// Actual receive/respond and prerequisite acquisition in disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const { setup, start, hear, finish } = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const words = { ja: ['\u98df\u3079\u308b', '\u4f11\u3080'], en: ['eat', 'rest'], 'zh-CN': ['\u5403', '\u4f11\u606f'], ru: ['есть', 'отдых'],
    'es-ES': ['comer', 'descansar'], 'pt-BR': ['comer', 'descansar'], de: ['speisen', 'ausruhen'] };
const demo = (phase, locale = 'ja') => `${catalog.sequenceTeaching[locale][phase]}「${catalog.sequenceTeaching[locale].utterance}」`;
function learn(value, locale) {
    for (const mode of ['eat', 'rest']) if (!value.state.knowledge.meanings.some(m => m.id === mode)) {
        start(value, mode);
        hear(value, words[locale][mode === 'eat' ? 0 : 1], locale); finish(value);
        assert.ok(value.state.knowledge.meanings.some(m => m.id === mode));
    }
    if (!value.state.settings.foundation) {
        for (const kind of ['request', 'invitation']) {
            start(value, 'rest'); const item = catalog.proposalTeaching[locale][kind];
            hear(value, `${item.marker}「${item.utterance}」`, locale); finish(value);
        }
        start(value, 'eat'); hear(value, demo('before', locale), locale); finish(value);
        hear(value, demo('after', locale), locale);
        assert.ok(value.state.knowledge.relations.some(r => r.id === 'sequence' && r.source === 'experienced_relation'));
    }
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let scoped, initial, earlierUnknown;
    const locales = Object.keys(catalog.sequenceTeaching);
    for (const locale of locales) for (const foundation of [false, true]) for (const life of [false, true])
        for (const speech of ['short', 'gesture']) {
            const value = setup({ foundation, life, speech }); start(value, 'eat');
            const unknown = hear(value, catalog.sequenceTeaching[locale].utterance, locale);
            add('initial-eight-settings', [unknown], [foundation && life]);
            learn(value, locale);
            const knowledge = copy(value.state.knowledge), experiences = copy(value.state.experiences || []);
            const labels = copy(value.world.relationLabels || []), mode = value.world.mode;
            const first = hear(value, catalog.sequenceTeaching[locale].utterance, locale);
            add('learned-repeat', [first, hear(value, catalog.sequenceTeaching[locale].utterance, locale)], [true, true]);
            assert.deepEqual(value.state.knowledge, knowledge); assert.deepEqual(value.state.experiences || [], experiences);
            assert.deepEqual(value.world.relationLabels || [], labels); assert.equal(value.world.mode, mode);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('locale-scope', [hear(value, catalog.sequenceTeaching[other].utterance, other)], [foundation]);
            add('speaker-scope', [hear(value, catalog.sequenceTeaching[locale].utterance, locale, 'visitor')], [false]);
            if (locale === 'ja' && !life && speech === 'short') {
                if (!foundation) { scoped = copy(first); earlierUnknown = copy(unknown); }
                else initial = copy(first);
            }
        }
    // No sensory, current-food, concrete meal or lesson-reference requirement.
    for (const locale of locales) for (const mode of ['eat', 'rest', 'walk', 'idle']) for (const attention of ['single', 'empty', 'ambiguous']) {
        const value = setup({ foundation: true }); start(value, mode === 'eat' ? 'eat' : 'rest');
        value.world.mode = mode;
        if (mode === 'walk') value.world.attention = 'path';
        if (mode === 'idle') value.world.attention = null;
        core.perceive(value.state, { scene: 'clearing', attention: attention === 'empty' ? []
            : attention === 'ambiguous' ? [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]
                : [{ id: mode === 'eat' ? value.world.attention : 'shade', meaning: mode === 'eat' ? 'berry' : 'rest' }] });
        add('scene-independent', [hear(value, catalog.sequenceTeaching[locale].utterance, locale)], [true]);
    }
    for (const locale of locales) {
        const value = setup({ foundation: true });
        add('normalized-owned-utterance', [hear(value, `  ${catalog.sequenceTeaching[locale].utterance.toLocaleUpperCase()}  `, locale)], [true]);
    }
    for (const locale of locales) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const value = setup({ life, speech }); learn(value, locale);
        for (const mode of ['eat', 'rest', 'walk', 'idle']) {
            start(value, mode === 'eat' ? 'eat' : 'rest'); value.world.mode = mode;
            core.perceive(value.state, { scene: 'clearing', attention: [] });
            add('learned-scene-no-meal-reference', [hear(value, catalog.sequenceTeaching[locale].utterance, locale)], [true]);
        }
    }
    const changing = setup({ life: false }); learn(changing, 'ja'); start(changing, 'eat');
    const before = hear(changing, catalog.sequenceTeaching.ja.utterance); finish(changing);
    const after = hear(changing, catalog.sequenceTeaching.ja.utterance);
    start(changing, 'eat');
    add('same-text-new-meal-no-target-inference', [before, after, hear(changing, catalog.sequenceTeaching.ja.utterance)], [true, true, true]);
    for (const action of ['complete', 'interrupt']) {
        const value = setup(); learn(value, 'ja'); start(value, action === 'complete' ? 'eat' : 'rest');
        const sample = hear(value, catalog.sequenceTeaching.ja.utterance);
        if (action === 'complete') finish(value); else worldApi.approach(value.world, 'path');
        value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('later-state-nonrewrite', [sample], [true]);
    }
    add('earlier-unknown-no-retroactive-capture', [earlierUnknown], [false]);
    const later = setup({ life: false }); learn(later, 'ja');
    const oldProposal = hear(later, catalog.sequenceTeaching.ja.utterance);
    const originalTeaching = copy(later.state.experiences.filter(e => e.activity === 'eat').at(-1).relationLabels[0]);
    start(later, 'rest'); hear(later, words.ja[1]); finish(later);
    const laterProposal = hear(later, catalog.sequenceTeaching.ja.utterance);
    assert.notDeepEqual(oldProposal.beforeKnowledge.meanings.find(m => m.id === 'rest'), laterProposal.beforeKnowledge.meanings.find(m => m.id === 'rest'));
    assert.deepEqual(later.state.experiences.filter(e => e.activity === 'eat').at(-1).relationLabels[0], originalTeaching);
    assert.equal(originalTeaching.understanding.complete, false);
    add('later-real-basis-originals-preserved', [oldProposal, laterProposal], [true, true]);
    for (const id of ['rest', 'eat', 'request', 'sequence']) {
        const value = setup({ foundation: true });
        value.state.knowledge[id === 'rest' || id === 'eat' ? 'meanings' : 'relations'] =
            value.state.knowledge[id === 'rest' || id === 'eat' ? 'meanings' : 'relations'].filter(r => r.id !== id);
        add('missing-prerequisites', [hear(value, catalog.sequenceTeaching.ja.utterance)], [false]);
    }
    const mutations = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = []; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings.push(copy(v.result.understandings[0])); },
        v => { v.context = undefined; }, v => { v.beforeKnowledge = undefined; },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        ...['scene', 'mode', 'target', 'attention', 'elapsed', 'activityStart'].map(field => v => { v.context[field] = undefined; }),
        v => { v.context.scene = 'other'; }, v => { v.context.activityStart = -1; },
        v => { v.context.activityStart = v.context.elapsed + 1; }, v => { v.context.elapsed = null; },
        ...['id', 'raw', 'locale', 'speaker', 'scene'].map(field => v => { v.result.input[field] = 'other'; }),
        v => { v.result.input.at = null; },
        ...['kind', 'subject', 'meaning', 'eventMeaning', 'eventSubject', 'application', 'proposalKind', 'form', 'proposalForm', 'utterance', 'span']
            .map(field => v => { v.result.interpretations[0][field] = 'other'; }),
        v => { v.result.interpretations[0].phase = 'after'; }, v => { v.result.interpretations[0].relations = ['request']; },
        v => { v.result.interpretations[0].roles.actualParticipation = true; },
        ...['kind', 'subject', 'target', 'aspect', 'questionSlot', 'conditionStatus', 'polarity', 'eventTime']
            .map(field => v => { v.result.understandings[0][field] = 'other'; }),
        v => { v.result.understandings[0].complete = false; }, v => { v.result.understandings[0].known.eventMeaning = 'rest'; },
        v => { v.result.understandings[0].unresolved = [{ type: 'relation', id: 'sequence' }]; },
        v => { v.result.understandings[0].relations = ['request']; },
        v => { v.result.understandings[0].roles.actualParticipation = true; },
        v => { v.result.understandings[0].reportSource = {}; }, v => { v.result.understandings[0].eventReference = {}; },
        v => { v.result.interpretations[0].eventReference = {}; },
        v => { v.result.relationLearning = {}; }, v => { v.result.conditionJudgment = {}; }, v => { v.result.sequenceJudgment = {}; }
    ];
    for (const sample of [scoped, initial]) for (const change of mutations) {
        const invalid = copy(sample); change(invalid); add('tampered-input-scene-understanding', [invalid], [false]);
    }
    const scopeMutations = [
        ...['request', 'sequence'].flatMap(id => ['kind', 'locale', 'speaker', 'meaning', 'form', 'roles',
            ...(id === 'sequence' ? ['proposalForm', 'eventMeaning', 'eventSubject', 'application'] : [])]
            .map(field => v => { v.beforeKnowledge.relations.find(r => r.id === id).scope[field] = 'other'; })),
        ...['request', 'sequence'].map(id => v => { v.beforeKnowledge.relations.find(r => r.id === id).source = 'other'; }),
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences.reverse(); },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; }
    ];
    for (const change of scopeMutations) { const invalid = copy(scoped); change(invalid); add('tampered-scope-references', [invalid], [false]); }
    for (const id of ['request', 'sequence']) for (const change of [r => { r.evidence = []; },
        r => { r.evidence[1] = r.evidence[0]; }, r => { r.evidence[0] = scoped.result.input.id; },
        r => { r.evidence[0] = 'input:0'; }]) {
        const invalid = copy(scoped); change(invalid.beforeKnowledge.relations.find(r => r.id === id));
        invalid.result.understandings[0].relationReferences = copy(invalid.beforeKnowledge.relations.filter(r => ['request', 'sequence'].includes(r.id)));
        add('invalid-original-input-evidence', [invalid], [false]);
    }
    for (const id of ['eat', 'rest']) for (const change of [m => { m.source = 'other'; }, m => { m.evidence = []; },
        m => { m.evidence[0].experienceId = null; }, m => { m.evidence[0].scope.activity = 'other'; },
        m => { m.evidence[0].scope.inputId = scoped.result.input.id; }, m => { m.evidence[0].scope.labelAt = null; },
        m => { m.evidence[0].scope.labelAt = scoped.context.elapsed + 1; }, m => { m.evidence[0].scope = {}; }]) {
        const invalid = copy(scoped); change(invalid.beforeKnowledge.meanings.find(m => m.id === id));
        add('invalid-meaning-provenance', [invalid], [false]);
    }
    for (const raw of [demo('before'), demo('after'), catalog.conditionTeaching.ja.utterance,
        catalog.proposalTeaching.ja.request.utterance, catalog.reportTeaching.ja.self.utterance,
        catalog.sequenceTeaching.ja.utterance + '. unknown', catalog.sequenceTeaching.ja.utterance.replace('\u4f11\u3093\u3067', '\u6563\u6b69\u3057\u3066')]) {
        const value = setup({ foundation: true }); add('other-entry-excluded', [hear(value, raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
