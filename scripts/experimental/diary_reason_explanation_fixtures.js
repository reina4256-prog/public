'use strict';
// Real learning and actions live only in disposable Node memory. The renderer
// receives copies, never a game session or a storage bridge.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const reason = require('./diary_reason_question_fixtures');
const { prepareKnown } = require('./diary_known_reason_question_fixtures');
const { hear, select } = reason;
const copy = v => JSON.parse(JSON.stringify(v));
const demo = (choice = 'request', locale = 'ja') => reason.demo(choice, locale, 'reason');
function fixtures() {
    const result = [], add = (group, values, expected) => result.push({ group, values, expected });
    let first, second, repeated, initial;
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const untouched = existing.setup({ foundation, life, speech });
            add('no-selection-or-question', [hear(untouched, demo('request', locale), locale)], [false]);
            for (const order of [['request', 'invitation'], ['invitation', 'request']]) {
                const value = existing.setup({ foundation, life, speech });
                const originals = prepareKnown(value, locale, order);
                if (originals.length) add('question-stage-kept-separate', originals, [false, false]);
                const question = copy(value.state.knowledge.relations.find(r => r.id === 'question'));
                const values = [];
                for (const choice of order) {
                    select(value, choice, locale); const sample = hear(value, demo(choice, locale), locale);
                    assert.equal(sample.result.understandings[0].complete, foundation);
                    assert.equal(sample.result.relationLearning.relationAcquired, !foundation && values.length === 2);
                    assert.deepEqual(value.state.knowledge.relations.find(r => r.id === 'question'), question);
                    values.push(sample, hear(value, demo(choice, locale), locale));
                    if (!foundation && locale === 'ja' && !life && speech === 'short' && order[0] === 'request') {
                        if (choice === 'request') first = copy(sample); else second = copy(sample);
                    }
                }
                add('real-prerequisites-both-orders', values, [!foundation, false, !foundation, false]);
                select(value, 'request', locale);
                add('known-reason-excluded', [hear(value, demo('request', locale), locale)], [false]);
                add('ordinary-question-not-an-answer-capture', [hear(value, catalog.reasonTeaching[locale].utterance, locale)], [false]);
                add('known-question-teaching-separated', [hear(value, reason.demo('request', locale), locale)], [false]);
            }
    }
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const speech of ['short', 'gesture']) {
        const value = existing.setup({ speech }); prepareKnown(value, locale); const values = [];
        for (const choice of ['request', 'request', 'invitation']) {
            select(value, choice, locale); values.push(hear(value, demo(choice, locale), locale));
        }
        assert.equal(values[1].result.relationLearning.updated.length, 0);
        assert.equal(values[2].result.relationLearning.relationAcquired, true);
        add('same-choice-new-rest-first-evidence-preserved', values, [true, true, true]);
        if (locale === 'ja' && speech === 'short') repeated = copy(values[1]);
    }
    // An isolated initial-question / missing-reason snapshot tests the boundary;
    // the actual foundation preset still starts with reason and is excluded above.
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const speech of ['short', 'gesture']) {
        const value = existing.setup({ foundation: true, speech }); prepareKnown(value, locale);
        value.state.knowledge.relations = value.state.knowledge.relations.filter(r => r.id !== 'reason');
        const values = [];
        for (const choice of ['request', 'invitation']) {
            select(value, choice, locale); values.push(hear(value, demo(choice, locale), locale));
        }
        assert.equal(values[1].result.relationLearning.relationAcquired, true);
        add('isolated-initial-question-not-replaced', values, [true, true]);
        if (locale === 'ja' && speech === 'short') initial = copy(values[0]);
    }
    for (const scenario of ['autonomous', 'moving', 'resting', 'interrupted', 'next-rest', 'wrong-choice', 'other-speaker', 'other-locale']) {
        const value = existing.setup(); prepareKnown(value);
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
    const activity = existing.setup(); reason.prepare(activity, 'ja');
    for (const mode of ['eat', 'rest']) {
        existing.start(activity, mode); hear(activity, `「何してる？」→「${mode === 'eat' ? '食べる' : '休む'}」`); existing.finish(activity);
    }
    activity.world.mode = 'idle'; activity.world.attention = null; select(activity);
    add('current-activity-question-not-transferred', [hear(activity, demo())], [false]);
    const later = existing.setup({ life: false }); prepareKnown(later); select(later, 'invitation', 'ja', true, true);
    const source = copy(later.state.selectionSources.at(-1)), laterSample = hear(later, demo('invitation'));
    assert.deepEqual(laterSample.result.relationLearning.candidates[0].basis, source.meaningBasis);
    assert.ok(laterSample.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > source.meaningBasis.evidence.length);
    add('later-real-rest-word-evidence-not-replaced', [laterSample], [true]);
    add('later-reason-learning-no-historical-rewrite', [copy(first), copy(second)], [true, true]);
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) {
        const value = existing.setup(); prepareKnown(value); select(value);
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
        v => { v.result.relationLearning.adopted = {}; }, v => { v.result.relationLearning.updated = [{}]; },
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
        v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === 'question'))); },
        v => { v.beforeKnowledge.relationEvidence = undefined; }
    ];
    for (const sample of [initial, first, second]) for (const mutate of mutations) {
        const invalid = copy(sample); mutate(invalid); add('tampered-current-source', [invalid], [false]);
    }
    const question = v => v.beforeKnowledge.relations.find(r => r.id === 'question');
    const originalQuestion = v => v.beforeExperiences.find(e => e.relationLabels?.some(l => l.inputId === question(v).evidence[0]));
    for (const mutate of [
        ...['kind', 'slot', 'locale', 'speaker', 'meaning', 'form'].map(k => v => { question(v).scope[k] = 'other'; }),
        v => { question(v).evidence = [v.result.input.id, question(v).evidence[1]]; },
        v => { question(v).evidence.reverse(); }, v => { question(v).evidence[1] = question(v).evidence[0]; },
        v => { originalQuestion(v).relationLabels[0].understanding.complete = true; },
        v => { originalQuestion(v).relationLabels[0].basis = {}; },
        v => { originalQuestion(v).relationLabels.push(copy(originalQuestion(v).relationLabels[0])); },
        v => { v.context.experiences.find(e => e.id === originalQuestion(v).id).choiceSource = {}; },
        v => { v.context.history.find(h => h.experienceId === originalQuestion(v).id).reasons = []; },
        v => { v.beforeKnowledge.relationEvidence = v.beforeKnowledge.relationEvidence.filter(e => e.inputId !== question(v).evidence[0]); },
        v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.slot === 'reason'))); }
    ]) {
        const invalid = copy(first); mutate(invalid); add('tampered-original-question-basis', [invalid], [false]);
    }
    const originalReason = v => v.beforeExperiences.find(e => e.relationLabels?.some(l => l.relation === 'reason'));
    for (const mutate of [
        v => { originalReason(v).relationLabels.find(l => l.relation === 'reason').understanding.complete = true; },
        v => { originalReason(v).relationLabels.find(l => l.relation === 'reason').questionBasis = {}; },
        v => { originalReason(v).relationLabels.find(l => l.relation === 'reason').at = v.context.elapsed + 1; },
        v => { v.context.experiences.find(e => e.id === originalReason(v).id).choiceSource = {}; },
        v => { v.context.history.find(h => h.experienceId === originalReason(v).id).reasons = []; },
        v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.relation === 'reason'))); },
        v => { v.beforeKnowledge.relationEvidence.find(e => e.relation === 'reason').choice = 'invitation'; }
    ]) {
        const invalid = copy(second); mutate(invalid); add('tampered-original-reason-evidence', [invalid], [false]);
    }
    const duplicatedOrigin = copy(second), old = originalReason(duplicatedOrigin);
    duplicatedOrigin.beforeExperiences.push({ ...copy(old), id: 'duplicate-origin' });
    add('duplicate-original-reason-input-rejected', [duplicatedOrigin], [false]);
    const omitted = copy(second);
    omitted.beforeKnowledge.relationEvidence = omitted.beforeKnowledge.relationEvidence.filter(e => e.relation !== 'reason');
    omitted.result.relationLearning.relationAcquired = false;
    add('missing-original-reason-evidence-not-recreated', [omitted], [false]);
    const recreated = copy(repeated);
    recreated.beforeKnowledge.relationEvidence = recreated.beforeKnowledge.relationEvidence.filter(e => e.relation !== 'reason');
    const l = recreated.result.relationLearning.candidates[0];
    recreated.result.relationLearning.updated = [{ relation: 'reason', experienceId: l.eventReference.experienceId,
        inputId: l.inputId, locale: l.locale, speaker: 'player', slot: 'reason', form: l.form,
        choice: l.choice, choiceSource: l.choiceSource, meaning: 'rest' }];
    add('missing-first-reason-source-not-replaced', [recreated], [false]);
    const changed = copy(repeated); changed.result.relationLearning.updated = [copy(changed.beforeKnowledge.relationEvidence.find(e => e.relation === 'reason'))];
    add('same-choice-evidence-not-invented', [changed], [false]);
    const value = existing.setup(); prepareKnown(value); select(value);
    const q = hear(value, reason.demo()); const r = hear(value, demo());
    add('same-rest-question-and-reason-distinct', [q, r], [false, true]);
    return result;
}
module.exports = { fixtures };
