'use strict';
// All game actions and prerequisite learning use disposable Node memory.
// The renderer receives copies only, without a game or storage bridge.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const reason = require('./diary_reason_question_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const { hear, prepare, select, demo } = reason;
function prepareKnown(value, locale = 'ja', order = ['request', 'invitation']) {
    prepare(value, locale);
    const originals = [];
    if (!value.state.settings.foundation) for (const choice of order) {
        select(value, choice, locale); originals.push(hear(value, demo(choice, locale), locale));
    }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'question'
        && (r.source === 'initial' || r.scope.slot === 'reason' && r.scope.locale === locale)));
    return originals;
}
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let initial, learned, sameChoice, beforeUnknown, afterKnown;
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const untouched = existing.setup({ foundation, life, speech });
            add('no-original-selection', [hear(untouched, demo('request', locale), locale)], [false]);
            for (const order of [['request', 'invitation'], ['invitation', 'request']]) {
                const value = existing.setup({ foundation, life, speech });
                const originals = prepareKnown(value, locale, order);
                if (originals.length) add('unknown-question-teaching-separated', originals, [false, false]);
                const question = copy(value.state.knowledge.relations.find(r => r.id === 'question'));
                const values = [];
                for (const choice of order) {
                    select(value, choice, locale); const sample = hear(value, demo(choice, locale), locale);
                    assert.equal(sample.result.understandings[0].complete, true);
                    assert.equal(sample.result.relationLearning.relationAcquired, false);
                    assert.deepEqual(value.state.knowledge.relations.find(r => r.id === 'question'), question);
                    values.push(sample, hear(value, demo(choice, locale), locale));
                    if (locale === 'ja' && !life && speech === 'short' && order[0] === 'request' && choice === 'request') {
                        if (foundation) initial = copy(sample);
                        else { learned = copy(sample); beforeUnknown = copy(originals[0]); afterKnown = copy(sample); }
                    }
                }
                add('known-question-real-prerequisites-both-orders', values, [true, false, true, false]);
                add('ordinary-question-separated', [hear(value, catalog.reasonTeaching[locale].utterance, locale)], [false]);
                add('reason-stage-separated', [hear(value, demo(order[1], locale, 'reason'), locale)], [false]);
            }
    }
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, speech }); prepareKnown(value, locale);
            const values = [];
            for (const choice of ['request', 'request', 'invitation']) {
                select(value, choice, locale); values.push(hear(value, demo(choice, locale), locale));
            }
            assert.equal(values[1].result.relationLearning.updated.length, 0);
            assert.ok(values.every(v => v.result.relationLearning.relationAcquired === false));
            add('same-choice-new-rest-initial-evidence-preserved', values, [true, true, true]);
            if (foundation && locale === 'ja' && speech === 'short') sameChoice = copy(values[1]);
    }
    for (const foundation of [false, true]) for (const scenario of ['autonomous', 'moving', 'resting', 'interrupted',
        'next-rest', 'wrong-choice', 'other-speaker', 'other-locale']) {
        const value = existing.setup({ foundation }); prepareKnown(value);
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
    const activity = existing.setup(); prepare(activity, 'ja');
    for (const mode of ['eat', 'rest']) {
        existing.start(activity, mode); hear(activity, `「何してる？」→「${mode === 'eat' ? '食べる' : '休む'}」`); existing.finish(activity);
    }
    activity.world.mode = 'idle'; activity.world.attention = null; select(activity);
    add('current-activity-scope-not-transferred', [hear(activity, demo())], [false]);
    const later = existing.setup({ foundation: true, life: false }); prepareKnown(later);
    select(later, 'invitation', 'ja', true, true);
    const originalSource = copy(later.state.selectionSources.at(-1)), laterSample = hear(later, demo('invitation'));
    assert.deepEqual(laterSample.result.relationLearning.candidates[0].basis, originalSource.meaningBasis);
    assert.ok(laterSample.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > originalSource.meaningBasis.evidence.length);
    add('later-real-word-evidence-not-replaced', [laterSample], [true]);
    add('historical-unknown-and-known-copies-separated', [beforeUnknown, afterKnown], [false, true]);
    const future = existing.setup({ life: false });
    const unknownOriginals = prepareKnown(future);
    select(future); const knownOriginal = hear(future, demo());
    for (const choice of ['request', 'invitation']) {
        select(future, choice); hear(future, demo(choice, 'ja', 'reason'));
    }
    assert.ok(future.state.knowledge.relations.some(r => r.id === 'reason'));
    assert.equal(unknownOriginals[0].result.understandings[0].complete, false);
    assert.deepEqual(knownOriginal.result.understandings[0].relations, ['question']);
    add('later-reason-learning-no-historical-rewrite', [copy(unknownOriginals[0]), copy(knownOriginal)], [false, true]);
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) {
        const value = existing.setup({ foundation: true }); prepareKnown(value); select(value);
        if (mode === 'move') worldApi.approach(value.world, 'path');
        else if (mode === 'eat') existing.start(value, mode);
        else { value.world.mode = mode; value.world.attention = null; core.perceive(value.state, { scene: 'clearing', attention: [] }); }
        add('heard-scene-separated-from-original-rest', [hear(value, demo())], [true]);
    }
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
        v => { v.result.relationLearning.adopted = {}; },
        v => { v.result.relationLearning.updated = [{}]; }, v => { v.result.relationLearning.relationAcquired = true; },
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
        v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === 'question'))); },
        v => { v.beforeKnowledge.relationEvidence = undefined; }
    ];
    for (const sample of [initial, learned]) for (const mutate of mutations) {
        const invalid = copy(sample); mutate(invalid); add('tampered-current-source', [invalid], [false]);
    }
    const question = v => v.beforeKnowledge.relations.find(r => r.id === 'question');
    const root = v => v.beforeExperiences.find(e => e.relationLabels?.some(l => l.inputId === question(v).evidence[0]));
    for (const mutate of [
        ...['kind', 'slot', 'locale', 'speaker', 'meaning', 'form'].map(k => v => { question(v).scope[k] = 'other'; }),
        v => { question(v).evidence = [v.result.input.id, question(v).evidence[1]]; },
        v => { question(v).evidence.reverse(); }, v => { question(v).evidence[1] = question(v).evidence[0]; },
        v => { root(v).relationLabels[0].understanding.complete = true; },
        v => { root(v).relationLabels[0].basis = {}; },
        v => { root(v).relationLabels.push(copy(root(v).relationLabels[0])); },
        v => { v.context.experiences.find(e => e.id === root(v).id).choiceSource = {}; },
        v => { v.context.history.find(h => h.experienceId === root(v).id).reasons = []; },
        v => { v.beforeKnowledge.relationEvidence = v.beforeKnowledge.relationEvidence.filter(e => e.inputId !== question(v).evidence[0]); },
        v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason'))); }
    ]) {
        const invalid = copy(learned); mutate(invalid); add('tampered-original-question-basis', [invalid], [false]);
    }
    for (const mutate of [v => { v.result.relationLearning.updated = []; },
        v => { v.result.relationLearning.relationAcquired = true; }]) {
        const invalid = copy(initial); mutate(invalid); add('initial-question-not-relearned', [invalid], [false]);
    }
    const changed = copy(sameChoice); changed.result.relationLearning.updated = [copy(changed.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason'))];
    add('same-choice-evidence-not-invented', [changed], [false]);
    const initialWithPrior = existing.setup({ foundation: true }); prepareKnown(initialWithPrior);
    select(initialWithPrior); hear(initialWithPrior, demo()); select(initialWithPrior);
    const priorSample = hear(initialWithPrior, demo());
    for (const mutate of [
        v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason'))); },
        v => { v.beforeExperiences.find(e => e.relationLabels?.some(l => l.slot === 'reason')).relationLabels[0].at = v.context.elapsed + 1; },
        v => { v.context.experiences.find(e => e.relationLabels?.some(l => l.slot === 'reason')).choiceSource = {}; },
        v => { v.beforeSelections.at(-1).relationBasis[0].scope = {}; },
        v => { v.beforeKnowledge.relations.find(r => r.id === 'question').scope = {}; }
    ]) {
        const invalid = copy(priorSample); mutate(invalid); add('initial-original-question-source-contradictions', [invalid], [false]);
    }
    return result;
}
module.exports = { fixtures, prepareKnown };
