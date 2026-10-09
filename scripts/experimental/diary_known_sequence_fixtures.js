'use strict';
// Gameplay and prerequisite learning run only in disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
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
    }
    if (!value.state.settings.foundation) {
        for (const kind of ['request', 'invitation']) {
            existing.start(value, 'rest'); const item = catalog.proposalTeaching[locale][kind];
            hear(value, `${item.marker}「${item.utterance}」`, locale); existing.finish(value);
        }
        existing.start(value, 'eat'); hear(value, demo('before', locale), locale); existing.finish(value);
        hear(value, demo('after', locale), locale);
        assert.ok(value.state.knowledge.relations.some(r => r.id === 'sequence' && r.source === 'experienced_relation'));
    }
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let scopedBefore, scopedAfter, initialBefore;
    for (const locale of Object.keys(catalog.sequenceTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const initial = existing.setup({ foundation, life, speech }); existing.start(initial, 'eat');
            add('initial-before', [hear(initial, demo('before', locale), locale)], [foundation && life]);
            existing.finish(initial);
            add('initial-after-unidentified', [hear(initial, demo('after', locale), locale)], [foundation && life]);
            const value = existing.setup({ foundation, life, speech }); prepare(value, locale);
            if (!foundation) {
                const after = hear(value, demo('after', locale), locale);
                add('learned-after-original', [after, hear(value, demo('after', locale), locale)], [true, true]);
                if (locale === 'ja' && !life && speech === 'short') scopedAfter = copy(after);
            }
            existing.start(value, 'eat');
            const before = hear(value, demo('before', locale), locale);
            add('known-before-repeat', [before, hear(value, demo('before', locale), locale)], [true, true]);
            assert.equal(value.world.relationLabels?.some(l => l.relation === 'sequence') || false, false);
            existing.finish(value);
            const after = hear(value, demo('after', locale), locale);
            add('new-meal-no-borrowed-reference', [after], [true]);
            add('ordinary-excluded', [hear(value, catalog.sequenceTeaching[locale].utterance, locale)], [false]);
            add('speaker-scope', [hear(value, demo('after', locale), locale, 'visitor')], [false]);
            const other = locale === 'en' ? 'ja' : 'en';
            add('locale-scope', [hear(value, demo('after', other), other)], [foundation]);
            if (locale === 'ja' && !life && speech === 'short') {
                if (!foundation) scopedBefore = copy(before);
                else initialBefore = copy(before);
            }
        }
    for (const locale of Object.keys(catalog.sequenceTeaching)) for (const mode of ['idle', 'rest']) {
        const value = existing.setup({ life: false }); prepare(value, locale);
        if (mode === 'rest') existing.start(value, 'rest');
        value.world.elapsed += .2;
        add('matched-later-scene', [hear(value, demo('after', locale), locale)], [true]);
    }
    const later = existing.setup({ life: false }); prepare(later, 'ja');
    const old = copy(later.state.experiences.filter(e => e.activity === 'eat').at(-1).relationLabels[0]);
    existing.start(later, 'rest'); hear(later, words.ja[1]); existing.finish(later);
    const laterSample = hear(later, demo('after'));
    assert.notDeepEqual(laterSample.beforeKnowledge.meanings.find(m => m.id === 'rest'), old.basis);
    add('later-real-basis-nonreplacement', [laterSample], [true]);
    for (const sample of [scopedBefore, scopedAfter]) {
        const value = existing.setup(); value.state.knowledge.meanings = []; value.state.knowledge.relations = [];
        add('later-knowledge-nonrewrite', [copy(sample)], [true]);
    }
    for (const change of [v => { v.world.mode = 'rest'; }, v => { v.world.dwell = 0; },
        v => core.perceive(v.state, { scene: 'clearing', attention: [] }),
        v => core.perceive(v.state, { scene: 'clearing', attention: [{ id: v.world.attention, meaning: 'berry' }, { id: 'shade', meaning: 'rest' }] })]) {
        const value = existing.setup({ foundation: true }); existing.start(value, 'eat'); change(value);
        add('before-unmatched-scene', [hear(value, demo('before'))], [false]);
    }
    const value = existing.setup({ foundation: true }); existing.start(value, 'eat');
    add('after-uncompleted', [hear(value, demo('after'))], [false]);
    existing.finish(value); existing.start(value, 'eat'); value.world.mode = 'rest';
    add('new-unfinished-meal-nonreplacement', [hear(value, demo('after'))], [false]);
    const noMeal = existing.setup({ foundation: true, life: true });
    add('no-original-unidentified', [hear(noMeal, demo('after'))], [true]);
    const mutations = [v => { v.result.interpretations = []; }, v => { v.result.understandings = []; },
        v => { v.result.relationLearning = {}; }, v => { v.result.conditionJudgment = {}; },
        v => { v.context = undefined; }, v => { v.context.mode = undefined; }, v => { v.context.target = undefined; },
        v => { v.context.elapsed = null; }, v => { v.context.activityStart = null; },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeExperiences = undefined; },
        ...['id', 'locale', 'speaker', 'scene'].map(key => v => { v.result.input[key] = 'other'; }),
        v => { v.result.input.at = null; }, v => { v.result.input.raw = v.result.input.raw.replace('【', '['); },
        ...['kind', 'phase', 'form', 'utterance', 'proposalForm', 'eventMeaning', 'eventSubject', 'application']
            .map(key => v => { v.result.interpretations[0][key] = 'other'; }),
        ...['kind', 'complete', 'subject', 'polarity', 'eventTime', 'target', 'conditionStatus']
            .map(key => v => { v.result.understandings[0][key] = 'other'; }),
        v => { v.result.understandings[0].roles.actualParticipation = true; },
        v => { v.result.understandings[0].relationReferences = []; },
        ...['locale', 'speaker', 'form', 'proposalForm', 'roles', 'eventMeaning', 'application']
            .map(key => v => { v.beforeKnowledge.relations.find(r => r.id === 'sequence').scope[key] = 'other'; })];
    for (const sample of [scopedBefore, scopedAfter]) for (const change of mutations) {
        const invalid = copy(sample); change(invalid); add('tampered-current-input', [invalid], [false]);
    }
    for (const change of [v => { v.context.dwell = null; }, v => { v.context.dwell = undefined; },
        v => { v.context.attention = []; }, v => { v.context.target = 'shade'; },
        v => { v.context.activityStart = v.context.elapsed + 1; }]) {
        const invalid = copy(initialBefore); change(invalid); add('tampered-before-scene', [invalid], [false]);
    }
    const event = v => v.beforeExperiences.filter(e => e.activity === 'eat').at(-1);
    for (const change of [v => { v.context.harvest++; }, v => { v.context.harvest = null; },
        ...['id', 'target', 'start', 'end', 'kind'].map(key => v => { event(v)[key] = 'other'; }),
        v => { event(v).end = null; }, v => { event(v).end = v.context.elapsed + 1; },
        v => { event(v).relationLabels = null; },
        ...['inputId', 'raw', 'start', 'at', 'heardAt', 'meaning', 'eventMeaning', 'eventSubject', 'application', 'utterance',
            'proposalForm', 'basis', 'eventBasis', 'proposalBasis', 'eventReference', 'understanding']
            .map(key => v => { event(v).relationLabels[0][key] = 'other'; }),
        v => { event(v).relationLabels[0].understanding.complete = true; },
        v => { event(v).relationLabels[0].inputId = v.result.input.id; }]) {
        const invalid = copy(scopedAfter);
        change(invalid); add('tampered-original-reference', [invalid], [false]);
    }
    const replaced = copy(laterSample);
    event(replaced).relationLabels[0].basis = copy(replaced.beforeKnowledge.meanings.find(m => m.id === 'rest'));
    add('tampered-original-reference', [replaced], [false]);
    for (const change of [v => { v.beforeKnowledge.relationEvidence = []; },
        v => { v.beforeKnowledge.relationEvidence.find(e => e.phase === 'before').eventReference = {}; },
        v => { event(v).relationLabels[0].locale = 'other'; }, v => { event(v).relationLabels[0].form = 'other'; },
        v => { event(v).relationLabels[0].phase = 'after'; },
        v => { event(v).relationLabels[0].speaker = 'other'; },
        v => { event(v).relationLabels[1].heardAt = v.result.input.at + 1; },
        v => { event(v).relationLabels[1].eventReference.inputId = v.result.input.id; }]) {
        const invalid = copy(scopedAfter); change(invalid); add('tampered-prerequisite-references', [invalid], [false]);
    }
    const duplicate = copy(scopedAfter);
    const sequence = duplicate.beforeKnowledge.relations.find(r => r.id === 'sequence');
    sequence.evidence[1] = sequence.evidence[0];
    duplicate.result.understandings[0].relationReferences = copy(duplicate.beforeKnowledge.relations.filter(r => ['request', 'sequence'].includes(r.id)));
    add('tampered-prerequisite-references', [duplicate], [false]);
    for (const sample of [scopedBefore, scopedAfter]) for (const id of ['eat', 'rest']) {
        const invalid = copy(sample), evidence = invalid.beforeKnowledge.meanings.find(m => m.id === id).evidence[0];
        invalid.beforeExperiences.find(e => e.id === evidence.experienceId).end = null;
        add('tampered-current-basis', [invalid], [false]);
    }
    for (const raw of [catalog.conditionTeaching.ja.utterance, catalog.reportTeaching.ja.self.utterance,
        demo('before') + '. unknown', demo('after') + '. unknown']) {
        const value = existing.setup({ foundation: true }); existing.start(value, 'eat');
        add('other-entry-excluded', [hear(value, raw)], [false]);
    }
    return result;
}
module.exports = { fixtures };
