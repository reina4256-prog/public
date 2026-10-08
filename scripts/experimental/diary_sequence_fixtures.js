'use strict';
// All gameplay calls and prerequisite learning use disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const words = { ja: ['食べる', '休む'], en: ['eat', 'rest'], 'zh-CN': ['吃', '休息'], ru: ['есть', 'отдых'],
    'es-ES': ['comer', 'descansar'], 'pt-BR': ['comer', 'descansar'], de: ['speisen', 'ausruhen'] };
const demo = (phase, locale = 'ja') => `${catalog.sequenceTeaching[locale][phase]}「${catalog.sequenceTeaching[locale].utterance}」`;
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const beforeExperiences = copy(value.state.experiences || []);
    const extra = copy({ dwell: value.world.dwell, harvest: value.world.harvest, relationLabels: value.world.relationLabels || [] });
    const sample = existing.hear(value, raw, locale, speaker);
    Object.assign(sample.context, extra); sample.beforeExperiences = beforeExperiences;
    return sample;
}
function prepare(value, locale) {
    for (const mode of ['eat', 'rest']) if (!value.state.knowledge.meanings.some(m => m.id === mode)) {
        existing.start(value, mode); hear(value, words[locale][mode === 'eat' ? 0 : 1], locale); existing.finish(value);
        assert.ok(value.state.knowledge.meanings.some(m => m.id === mode));
    }
    if (!value.state.settings.foundation) for (const kind of ['request', 'invitation']) {
        existing.start(value, 'rest'); const item = catalog.proposalTeaching[locale][kind];
        hear(value, `${item.marker}「${item.utterance}」`, locale); existing.finish(value);
    }
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let before, repeated, after;
    for (const locale of Object.keys(catalog.sequenceTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, life, speech }); existing.start(value, 'eat');
            add('initial', [hear(value, demo('before', locale), locale)], [false]);
            value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'sequence');
            add('initial-request', [hear(value, demo('before', locale), locale)], [foundation && life]);
            const learned = existing.setup({ foundation, life, speech }); prepare(learned, locale);
            existing.start(learned, 'eat');
            const first = hear(learned, demo('before', locale), locale), second = hear(learned, demo('before', locale), locale);
            existing.finish(learned); learned.world.elapsed += .2;
            const complete = hear(learned, demo('after', locale), locale);
            add('real-prerequisites-and-completion', [first, second, complete], Array(3).fill(!foundation));
            if (!foundation) {
                assert.equal(complete.result.relationLearning.relationAcquired, true);
                assert.equal(second.result.relationLearning.adopted.inputId, first.result.input.id);
                if (locale === 'ja' && !life && speech === 'short') { before = copy(first); repeated = copy(second); after = copy(complete); }
            }
            add('known-and-ordinary-excluded', [hear(learned, demo('after', locale), locale),
                hear(learned, catalog.sequenceTeaching[locale].utterance, locale)], [false, false]);
        }
    for (const locale of Object.keys(catalog.sequenceTeaching)) for (const mode of ['idle', 'rest']) {
        const value = existing.setup(); prepare(value, locale); existing.start(value, 'eat');
        const first = hear(value, demo('before', locale), locale); existing.finish(value);
        if (mode === 'rest') existing.start(value, 'rest');
        value.world.elapsed += .2;
        add('heard-later-scene', [first, hear(value, demo('after', locale), locale)], [true, true]);
    }
    const later = existing.setup({ life: false }); prepare(later, 'ja'); existing.start(later, 'eat');
    const first = hear(later, demo('before'));
    existing.finish(later);
    // Real later rest teaching adds evidence without replacing the meal's root.
    existing.start(later, 'rest'); hear(later, words.ja[1]); existing.finish(later); later.world.elapsed += .2;
    add('original-prerequisite-not-replaced', [first, hear(later, demo('after'))], [true, true]);
    for (const phase of ['before', 'after']) {
        const sample = copy(phase === 'before' ? before : after);
        const value = existing.setup(); value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('later-knowledge-nonrewrite', [sample], [true]);
    }
    for (const change of [v => { v.world.mode = 'rest'; }, v => { v.world.dwell = 0; },
        v => core.perceive(v.state, { scene: 'clearing', attention: [] }),
        v => core.perceive(v.state, { scene: 'clearing', attention: [{ id: v.world.attention, meaning: 'berry' }, { id: 'shade', meaning: 'rest' }] })]) {
        const value = existing.setup(); prepare(value, 'ja'); existing.start(value, 'eat'); change(value);
        add('before-outside-or-ambiguous', [hear(value, demo('before'))], [false]);
    }
    for (const scenario of ['reverse', 'uncompleted', 'another-meal', 'other-speaker', 'other-locale']) {
        const value = existing.setup(); prepare(value, 'ja'); existing.start(value, 'eat');
        if (scenario !== 'reverse') hear(value, demo('before'));
        if (!['reverse', 'uncompleted'].includes(scenario)) existing.finish(value);
        if (scenario === 'another-meal') existing.start(value, 'eat');
        add('invalid-after-reference', [hear(value, demo('after', scenario === 'other-locale' ? 'en' : 'ja'),
            scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    const common = [v => { v.result.interpretations = []; }, v => { v.result.understandings = []; },
        v => { v.result.relationLearning = undefined; }, v => { v.context = undefined; },
        v => { v.context.mode = undefined; }, v => { v.context.target = undefined; },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; }, v => { v.beforeExperiences = undefined; },
        v => { v.beforeKnowledge.relations.push({ id: 'sequence', source: 'initial' }); },
        ...['id', 'raw', 'locale', 'speaker', 'scene'].map(k => v => { v.result.input[k] = 'other'; }),
        v => { v.result.input.at++; }, v => { v.context.elapsed++; },
        ...['kind', 'phase', 'form', 'utterance', 'proposalForm', 'meaning', 'eventMeaning', 'eventSubject', 'application']
            .map(k => v => { v.result.interpretations[0][k] = 'other'; }),
        v => { v.result.understandings[0].complete = true; }, v => { v.result.understandings[0].roles = {}; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.conditionJudgment = {}; },
        ...['candidates', 'adopted'].flatMap(key => ['inputId', 'raw', 'locale', 'speaker', 'scene', 'target', 'phase', 'form', 'start', 'at', 'heardAt']
            .map(k => v => { (key === 'candidates' ? v.result.relationLearning.candidates[0] : v.result.relationLearning.adopted)[k] = 'other'; })),
        ...['basis', 'eventBasis', 'proposalBasis', 'eventReference', 'roles', 'understanding'].map(k => v => { v.result.relationLearning.candidates[0][k] = {}; })];
    for (const sample of [before, after]) for (const change of common) {
        const invalid = copy(sample); change(invalid); add('tampered-common', [invalid], [false]);
    }
    for (const change of [v => { v.context.relationLabels = []; }, v => { v.context.relationLabels[0].inputId = 'input:999'; },
        v => { v.result.relationLearning.adopted = copy(v.result.relationLearning.candidates[0]); },
        v => { v.context.dwell = undefined; }, v => { v.context.dwell = null; },
        v => { v.context.activityStart++; }]) {
        const invalid = copy(repeated); change(invalid); add('first-teaching-not-replaced', [invalid], [false]);
    }
    for (const change of [v => { v.beforeExperiences = []; }, v => { v.context.harvest++; },
        v => { v.result.relationLearning.updated = []; }, v => { v.result.relationLearning.relationAcquired = false; },
        ...['id', 'target', 'start', 'end', 'activity', 'kind'].map(k => v => { v.beforeExperiences.at(-1)[k] = 'other'; }),
        v => { v.beforeExperiences.at(-1).relationLabels[0].raw = demo('after'); },
        ...['inputId', 'raw', 'start', 'at', 'phase', 'locale', 'speaker', 'form', 'basis', 'eventBasis', 'proposalBasis', 'eventReference', 'understanding']
            .map(k => v => { v.beforeExperiences.at(-1).relationLabels[0][k] = 'other'; })]) {
        const invalid = copy(after); change(invalid); add('tampered-original-reference', [invalid], [false]);
    }
    for (const sample of [before, after]) for (const field of ['basis', 'eventBasis']) {
        const invalid = copy(sample), evidence = invalid.result.relationLearning.candidates[0][field].evidence[0];
        invalid.beforeExperiences.find(e => e.id === evidence.experienceId).end = null;
        add('tampered-prerequisite-time', [invalid], [false]);
    }
    return result;
}
module.exports = { fixtures };
