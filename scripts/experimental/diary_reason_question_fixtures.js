'use strict';
// Actual prerequisite learning, selection, arrival and completion use disposable
// Node memory. Only copied sources enter the independent diary renderer.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const words = { ja: '休む', en: 'rest', 'zh-CN': '休息', ru: 'отдых', 'es-ES': 'descansar', 'pt-BR': 'descansar', de: 'ausruhen' };
const demo = (choice = 'request', locale = 'ja', stage = 'question') =>
    `${catalog.reasonTeaching[locale][stage]}「${catalog.reasonTeaching[locale].utterance}」→「${catalog.proposalTeaching[locale][choice].utterance}」`;
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const beforeExperiences = copy(value.state.experiences || []), beforeSelections = copy(value.state.selectionSources || []);
    const extra = copy({ destination: value.world.destination, history: value.world.history, experiences: value.world.experiences });
    const sample = existing.hear(value, raw, locale, speaker);
    Object.assign(sample.context, extra); return { ...sample, beforeExperiences, beforeSelections };
}
function prepare(value, locale) {
    if (!value.state.knowledge.meanings.some(m => m.id === 'rest')) {
        existing.start(value, 'rest'); hear(value, words[locale], locale); existing.finish(value);
        assert.ok(value.state.knowledge.meanings.some(m => m.id === 'rest'));
    }
    if (!value.state.settings.foundation) for (const choice of ['request', 'invitation']) {
        existing.start(value, 'rest'); const item = catalog.proposalTeaching[locale][choice];
        hear(value, `${item.marker}「${item.utterance}」`, locale); existing.finish(value);
    }
    value.world.mode = 'idle'; value.world.attention = null;
}
function select(value, choice = 'request', locale = 'ja', complete = true, teachRest = false) {
    const result = hear(value, catalog.proposalTeaching[locale][choice].utterance, locale);
    assert.equal(value.world.mode, 'move');
    assert.ok(value.state.selectionSources?.some(s => s.input.id === result.result.input.id));
    if (!complete) return result;
    const shade = worldApi.PLACES.find(p => p.id === 'shade');
    value.world.x = shade.x; value.world.y = shade.y; value.world.pause = 0;
    worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
    assert.equal(value.world.mode, 'rest');
    if (teachRest) hear(value, words[locale], locale);
    value.world.dwell = .1; existing.finish(value);
    assert.equal(value.world.mode, 'idle'); return result;
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let first, second, repeatedChoice;
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, life, speech });
            add('no-selection-initial', [hear(value, demo('request', locale), locale)], [false]);
            prepare(value, locale);
            if (foundation) {
                value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'question');
                select(value, 'request', locale);
                add('initial-proposal-basis-unknown-question', [hear(value, demo('request', locale), locale)], [true]);
            }
            for (const order of [['request', 'invitation'], ['invitation', 'request']]) {
                const actor = existing.setup({ foundation, life, speech }); prepare(actor, locale); const values = [];
                for (const choice of order) {
                    select(actor, choice, locale); const current = hear(actor, demo(choice, locale), locale);
                    values.push(current, hear(actor, demo(choice, locale), locale));
                    assert.equal(current.result.relationLearning.relationAcquired, !foundation && values.length === 4);
                    if (!foundation && locale === 'ja' && !life && speech === 'short' && order[0] === 'request') {
                        if (choice === 'request') first = copy(current); else second = copy(current);
                    }
                }
                add('real-prerequisites-both-orders', values, [!foundation, false, !foundation, false]);
                select(actor, 'request', locale);
                add('known-question-excluded', [hear(actor, demo('request', locale), locale)], [false]);
                add('ordinary-question-excluded', [hear(actor, catalog.reasonTeaching[locale].utterance, locale)], [false]);
                add('reason-stage-excluded', [hear(actor, demo('request', locale, 'reason'), locale)], [false]);
            }
    }
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const speech of ['short', 'gesture']) {
        const value = existing.setup({ speech }); prepare(value, locale); const values = [];
        for (const choice of ['request', 'request', 'invitation']) {
            select(value, choice, locale); values.push(hear(value, demo(choice, locale), locale));
        }
        assert.equal(values[1].result.relationLearning.updated.length, 0);
        assert.equal(values[2].result.relationLearning.relationAcquired, true);
        add('same-choice-new-rest-not-new-evidence', values, [true, true, true]);
        if (locale === 'ja' && speech === 'short') repeatedChoice = copy(values[1]);
    }
    for (const scenario of ['autonomous', 'moving', 'resting', 'interrupted', 'next-rest', 'wrong-choice', 'other-speaker', 'other-locale']) {
        const value = existing.setup(); prepare(value, 'ja');
        if (scenario === 'autonomous') { existing.start(value, 'rest'); existing.finish(value); }
        else select(value, 'request', 'ja', !['moving', 'resting', 'interrupted'].includes(scenario));
        if (scenario === 'resting') {
            const shade = worldApi.PLACES.find(p => p.id === 'shade');
            value.world.x = shade.x; value.world.y = shade.y; value.world.pause = 0;
            worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
        }
        if (scenario === 'interrupted') worldApi.approach(value.world, 'path');
        if (scenario === 'next-rest') {
            existing.start(value, 'rest'); value.world.dwell = 10; value.world.pause = 0;
            worldApi.tick(value.world, .1); worldApi.approach(value.world, 'path');
        }
        const locale = scenario === 'other-locale' ? 'en' : 'ja';
        add('invalid-selection-or-occasion', [hear(value, demo(scenario === 'wrong-choice' ? 'invitation' : 'request', locale),
            locale, scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    // Already-understood current-activity questions never supply the reason slot.
    const activity = existing.setup(); prepare(activity, 'ja');
    for (const mode of ['eat', 'rest']) {
        existing.start(activity, mode); hear(activity, `「何してる？」→「${mode === 'eat' ? '食べる' : '休む'}」`); existing.finish(activity);
    }
    activity.world.mode = 'idle'; activity.world.attention = null; select(activity);
    add('other-question-scope-not-transfer', [hear(activity, demo())], [true]);
    // Later real word evidence must not replace the original selected snapshot.
    const later = existing.setup({ life: false }); prepare(later, 'ja'); select(later);
    existing.start(later, 'rest'); hear(later, words.ja); existing.finish(later);
    select(later, 'invitation', 'ja', true, true);
    const laterSource = copy(later.state.selectionSources.at(-1));
    existing.start(later, 'eat'); hear(later, '食べる'); existing.finish(later);
    const retained = hear(later, demo('invitation'));
    assert.deepEqual(retained.result.relationLearning.candidates[0].basis, laterSource.meaningBasis);
    assert.ok(retained.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > laterSource.meaningBasis.evidence.length);
    add('later-real-basis-not-replaced', [retained], [true]);
    add('historical-copy-after-later-learning', [copy(first), copy(second)], [true, true]);
    const mutations = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = []; }, v => { v.result.relationLearning = undefined; },
        v => { v.beforeKnowledge = undefined; }, v => { v.beforeExperiences = []; }, v => { v.beforeSelections = []; },
        v => { v.context = undefined; }, v => { v.context.history = undefined; }, v => { v.context.experiences = []; },
        v => { v.context.mode = 'rest'; }, v => { v.context.elapsed++; }, v => { v.context.scene = 'other'; },
        v => { v.context.activityStart = null; }, v => { v.context.attention = undefined; },
        ...['id', 'raw', 'locale', 'speaker', 'scene', 'at'].map(k => v => { v.result.input[k] = 'other'; }),
        ...['stage', 'kind', 'choice', 'question', 'answer', 'form'].map(k => v => { v.result.interpretations[0][k] = 'other'; }),
        ...['complete', 'subject', 'questionSlot', 'roles', 'relationReferences'].map(k => v => { v.result.understandings[0][k] = 'other'; }),
        ...['basis', 'proposalBasis', 'eventReference', 'choiceSource', 'questionBasis', 'understanding', 'at', 'heardAt', 'inputId', 'raw']
            .map(k => v => { v.result.relationLearning.candidates[0][k] = 'other'; }),
        v => { v.result.relationLearning.adopted = {}; }, v => { v.result.relationLearning.updated = []; },
        v => { v.result.relationLearning.relationAcquired = !v.result.relationLearning.relationAcquired; },
        ...['kind', 'subject', 'target', 'selectedAt', 'meaningBasis', 'relationBasis', 'understanding', 'frame', 'input']
            .map(k => v => { v.beforeSelections.at(-1)[k] = 'other'; }),
        ...['id', 'kind', 'activity', 'start', 'end', 'target', 'choiceSource'].map(k => v => { v.beforeExperiences.at(-1)[k] = 'other'; }),
        v => { v.beforeExperiences.push(copy(v.beforeExperiences.at(-1))); },
        v => { v.beforeSelections.push(copy(v.beforeSelections.at(-1))); },
        v => { v.context.experiences.at(-1).start++; },
        v => { v.context.history.find(h => h.mode === 'move'
            && h.start === v.result.relationLearning.candidates[0].choiceSource.selectedAt).start++; },
        v => { v.context.history.find(h => h.experienceId === v.beforeExperiences.at(-1).id).reasons = []; },
        v => { v.context.history.push({ mode: 'rest', start: v.context.elapsed }); },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.relations.push({ id: 'question', source: 'initial' }); },
        v => { v.beforeKnowledge.relationEvidence = undefined; }
    ];
    for (const sample of [first, second]) for (const mutate of mutations) {
        const invalid = copy(sample); mutate(invalid); add('tampered-current-source', [invalid], [false]);
    }
    for (const change of [v => { v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason').inputId = v.result.input.id; },
        v => { v.beforeExperiences.find(e => e.relationLabels?.some(l => l.slot === 'reason')).relationLabels.at(-1).basis = {}; },
        v => { v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason').choiceSource = {}; }]) {
        const invalid = copy(second); change(invalid); add('tampered-previous-question-evidence', [invalid], [false]);
    }
    for (const change of [v => { v.result.relationLearning.updated = [copy(v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason'))]; },
        v => { v.result.relationLearning.relationAcquired = true; }]) {
        const invalid = copy(repeatedChoice); change(invalid); add('same-choice-update-not-invented', [invalid], [false]);
    }
    return result;
}
module.exports = { fixtures, prepare, select, hear, demo };
