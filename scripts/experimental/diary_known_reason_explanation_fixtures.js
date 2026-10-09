'use strict';
// Real prerequisite learning and actions use disposable Node memory only.
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
function prepareReason(value, locale = 'ja', order = ['request', 'invitation']) {
    const originals = prepareKnown(value, locale, order);
    if (!value.state.settings.foundation) for (const choice of order) {
        select(value, choice, locale); originals.push(hear(value, demo(choice, locale), locale));
    }
    assert.ok(value.state.knowledge.relations.some(r => r.id === 'reason'
        && (r.source === 'initial' || r.scope.slot === 'reason' && r.scope.locale === locale)));
    return originals;
}
function fixtures() {
    const output = [], add = (group, values, expected) => output.push({ group, values, expected });
    let initial, learned, repeated;
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const untouched = existing.setup({ foundation, life, speech });
            add('no-original-selection', [hear(untouched, demo('request', locale), locale)], [false]);
            for (const order of [['request', 'invitation'], ['invitation', 'request']]) {
                const value = existing.setup({ foundation, life, speech });
                const originals = prepareReason(value, locale, order);
                if (originals.length) add('original-unknown-teaching-separated', originals, originals.map(() => false));
                const relations = copy(value.state.knowledge.relations), values = [];
                for (const choice of order) {
                    select(value, choice, locale);
                    const sample = hear(value, demo(choice, locale), locale);
                    assert.equal(sample.result.understandings[0].complete, true);
                    assert.equal(sample.result.relationLearning.relationAcquired, false);
                    assert.deepEqual(value.state.knowledge.relations, relations);
                    values.push(sample, hear(value, demo(choice, locale), locale));
                    if (locale === 'ja' && !life && speech === 'short' && order[0] === 'request' && choice === 'request') {
                        if (foundation) initial = copy(sample); else learned = copy(sample);
                    }
                }
                add('known-reason-real-prerequisites-both-orders', values, [true, false, true, false]);
                add('ordinary-question-answer-separated', [hear(value, catalog.reasonTeaching[locale].utterance, locale)], [false]);
                add('question-stage-separated', [hear(value, reason.demo(order[1], locale), locale)], [false]);
            }
        }
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const speech of ['short', 'gesture']) {
            const value = existing.setup({ foundation, speech }); prepareReason(value, locale); const values = [];
            for (const choice of ['request', 'request', 'invitation']) {
                select(value, choice, locale); values.push(hear(value, demo(choice, locale), locale));
            }
            assert.equal(values[1].result.relationLearning.updated.length, 0);
            assert.ok(values.every(v => v.result.relationLearning.relationAcquired === false));
            add('same-choice-first-evidence-preserved', values, [true, true, true]);
            if (foundation && locale === 'ja' && speech === 'short') repeated = copy(values[1]);
        }
    for (const foundation of [false, true]) for (const scenario of ['autonomous', 'moving', 'resting', 'interrupted',
        'next-rest', 'wrong-choice', 'other-speaker', 'other-locale']) {
        const value = existing.setup({ foundation }); prepareReason(value);
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
    const missing = existing.setup(); prepareKnown(missing); select(missing);
    add('question-known-reason-unknown-separated', [hear(missing, demo())], [false]);
    const activity = existing.setup(); reason.prepare(activity, 'ja');
    for (const mode of ['eat', 'rest']) {
        existing.start(activity, mode); hear(activity, `「何してる？」→「${mode === 'eat' ? '食べる' : '休む'}」`); existing.finish(activity);
    }
    activity.world.mode = 'idle'; activity.world.attention = null; select(activity);
    add('current-activity-question-not-transferred', [hear(activity, demo())], [false]);
    const later = existing.setup({ life: false }); prepareReason(later); select(later, 'invitation', 'ja', true, true);
    const source = copy(later.state.selectionSources.at(-1)), sample = hear(later, demo('invitation'));
    assert.deepEqual(sample.result.relationLearning.candidates[0].basis, source.meaningBasis);
    assert.ok(sample.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > source.meaningBasis.evidence.length);
    add('later-real-rest-evidence-not-replaced', [sample], [true]);
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) {
        const value = existing.setup(); prepareReason(value); select(value);
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
        v => { v.result.relationLearning.relationAcquired = true; },
        ...['kind', 'subject', 'target', 'selectedAt', 'meaningBasis', 'relationBasis', 'understanding', 'frame', 'input']
            .map(k => v => { v.beforeSelections.at(-1)[k] = 'other'; }),
        ...['id', 'kind', 'activity', 'start', 'end', 'target', 'choiceSource'].map(k => v => { v.beforeExperiences.at(-1)[k] = 'other'; }),
        v => { v.beforeExperiences.push(copy(v.beforeExperiences.at(-1))); },
        v => { v.beforeSelections.push(copy(v.beforeSelections.at(-1))); },
        v => { v.context.experiences.at(-1).start++; },
        v => { v.context.history.find(h => h.mode === 'move' && h.start === v.result.relationLearning.candidates[0].choiceSource.selectedAt).start++; },
        v => { v.context.history.find(h => h.experienceId === v.beforeExperiences.at(-1).id).reasons = []; },
        v => { v.context.history.push({ mode: 'rest', start: v.context.elapsed }); },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        ...['question', 'reason'].map(id => v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === id))); }),
        v => { v.beforeKnowledge.relationEvidence = undefined; }
    ];
    for (const source of [initial, learned]) for (const mutate of mutations) {
        const invalid = copy(source); mutate(invalid); add('tampered-current-source', [invalid], [false]);
    }
    for (const id of ['question', 'reason']) {
        const basis = v => v.beforeKnowledge.relations.find(r => r.id === id);
        const original = v => v.beforeExperiences.find(e => e.relationLabels?.some(l => l.inputId === basis(v).evidence[0]));
        for (const mutate of [
            ...['kind', 'slot', 'locale', 'speaker', 'meaning', 'form'].map(k => v => { basis(v).scope[k] = 'other'; }),
            v => { basis(v).evidence = [v.result.input.id, basis(v).evidence[1]]; },
            v => { basis(v).evidence.reverse(); }, v => { basis(v).evidence[1] = basis(v).evidence[0]; },
            v => { original(v).relationLabels.find(l => l.inputId === basis(v).evidence[0]).understanding.complete = true; },
            v => { original(v).relationLabels.find(l => l.inputId === basis(v).evidence[0]).basis = {}; },
            v => { original(v).relationLabels.push(copy(original(v).relationLabels.find(l => l.inputId === basis(v).evidence[0]))); },
            v => { v.context.experiences.find(e => e.id === original(v).id).choiceSource = {}; },
            v => { v.context.history.find(h => h.experienceId === original(v).id).reasons = []; },
            v => { v.beforeKnowledge.relationEvidence = v.beforeKnowledge.relationEvidence.filter(e => e.inputId !== basis(v).evidence[0]); },
            v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.inputId === basis(v).evidence[0]))); },
            v => { v.beforeExperiences.push({ ...copy(original(v)), id: 'duplicate-origin' }); },
            v => { basis(v).evidence = []; }
        ]) {
            const invalid = copy(learned); mutate(invalid); add('tampered-original-' + id + '-basis', [invalid], [false]);
        }
    }
    const omitted = copy(repeated); omitted.beforeKnowledge.relationEvidence = omitted.beforeKnowledge.relationEvidence.filter(e => e.relation !== 'reason');
    add('original-initial-evidence-missing-not-recreated', [omitted], [false]);
    const recreated = copy(repeated); recreated.result.relationLearning.updated = [copy(recreated.beforeKnowledge.relationEvidence.find(e => e.relation === 'reason'))];
    add('same-choice-first-evidence-not-replaced', [recreated], [false]);
    const originalInitial = v => v.beforeExperiences.find(e => e.relationLabels?.some(l => l.relation === 'reason'));
    for (const key of ['questionBasis', 'understanding', 'choiceSource', 'basis', 'proposalBasis']) {
        const invalid = copy(repeated);
        originalInitial(invalid).relationLabels.find(l => l.relation === 'reason')[key] = {};
        add('initial-original-source-contradictions', [invalid], [false]);
    }
    for (const id of ['question', 'reason']) {
        const invalid = copy(initial); invalid.beforeKnowledge.relations.find(r => r.id === id).extra = true;
        add('initial-knowledge-not-replaced', [invalid], [false]);
    }
    const value = existing.setup(); prepareReason(value); select(value);
    add('same-rest-question-reason-separated', [hear(value, reason.demo()), hear(value, demo())], [false, true]);
    for (const source of [initial, learned]) for (const id of ['question', 'reason']) {
        const invalid = copy(source); invalid.beforeKnowledge.relations = invalid.beforeKnowledge.relations.filter(r => r.id !== id);
        add('missing-knowledge-not-completed', [invalid], [false]);
    }
    return output;
}
module.exports = { fixtures, prepareReason };
