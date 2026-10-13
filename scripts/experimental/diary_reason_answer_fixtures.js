'use strict';
// Actual receive/respond/prerequisite learning use disposable Node memory.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const existing = require('./diary_negation_fixtures');
const reason = require('./diary_reason_question_fixtures');
const { prepareReason } = require('./diary_known_reason_explanation_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed,
        destination: world.destination, history: world.history, experiences: world.experiences });
    const beforeKnowledge = copy(state.knowledge), beforeExperiences = copy(state.experiences || []), beforeSelections = copy(state.selectionSources || []);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const reply = worldApi.respond(world, result, state, catalog);
    return copy({ result, reply, context, beforeKnowledge, beforeExperiences, beforeSelections });
}
function reviewed(value, choice = 'request', locale = 'ja', teachRest = false) {
    reason.select(value, choice, locale, true, teachRest);
    return hear(value, reason.demo(choice, locale, 'reason'), locale);
}
function fixtures() {
    const output = [], add = (group, values, expected) => output.push({ group, values, expected });
    let initial, learned, repeated;
    for (const locale of Object.keys(catalog.reasonTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            for (const order of [['request', 'invitation'], ['invitation', 'request']]) {
                const value = existing.setup({ foundation, life, speech }); prepareReason(value, locale, order);
                const values = [];
                for (const choice of order) {
                    const teaching = reviewed(value, choice, locale);
                    add('teaching-right-side-is-not-actual-answer', [teaching], [false]);
                    const sample = hear(value, catalog.reasonTeaching[locale].utterance, locale);
                    assert.equal(sample.reply.message, speech === 'short' ? 'selected_reason' : 'attend');
                    values.push(sample);
                    if (locale === 'ja' && life === false && speech === 'short' && order[0] === 'request' && choice === 'request') {
                        if (foundation) initial = copy(sample); else learned = copy(sample);
                    }
                }
                add('real-prerequisites-both-choices-orders-and-speech', values, values.map(() => speech === 'short'));
                add('new-question-input-same-reviewed-rest', [hear(value, catalog.reasonTeaching[locale].utterance, locale)], [speech === 'short']);
                reason.select(value, 'request', locale);
                const unknown = hear(value, catalog.reasonTeaching[locale].utterance, locale);
                assert.equal(unknown.reply.message, speech === 'short' ? 'answer_unknown' : 'attend');
                add('new-unreviewed-rest-answer-unknown', [unknown], [false]);
            }
        }
    for (const foundation of [false, true]) for (const scenario of ['no-review', 'autonomous', 'moving', 'resting', 'interrupted', 'next-rest', 'other-speaker', 'other-locale']) {
        const value = existing.setup({ foundation }); prepareReason(value); reviewed(value);
        if (scenario === 'no-review') reason.select(value);
        if (scenario === 'autonomous') { existing.start(value, 'rest'); existing.finish(value); }
        if (['moving', 'resting', 'interrupted'].includes(scenario)) reason.select(value, 'request', 'ja', false);
        if (['resting', 'interrupted'].includes(scenario)) {
            const shade = worldApi.PLACES.find(p => p.id === 'shade'); value.world.x = shade.x; value.world.y = shade.y;
            value.world.pause = 0; worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1));
        }
        if (scenario === 'interrupted') {
            value.world.dwell = 10; value.world.pause = 0; worldApi.tick(value.world, .1);
            worldApi.approach(value.world, 'path');
        }
        if (scenario === 'next-rest') { existing.start(value, 'rest'); value.world.dwell = 10; value.world.pause = 0;
            worldApi.tick(value.world, .1); worldApi.approach(value.world, 'path'); }
        const locale = scenario === 'other-locale' ? 'en' : 'ja';
        add('invalid-occasion', [hear(value, catalog.reasonTeaching[locale].utterance, locale,
            scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const mode of ['idle', 'observe', 'move', 'eat', 'work']) {
        const value = existing.setup(); prepareReason(value); reviewed(value);
        if (mode === 'move') worldApi.approach(value.world, 'path');
        else if (mode === 'eat') existing.start(value, mode);
        else { value.world.mode = mode; value.world.attention = null; core.perceive(value.state, { scene: 'clearing', attention: [] }); }
        add('question-scene-distinct-from-rest', [hear(value, catalog.reasonTeaching.ja.utterance)], [true]);
    }
    const value = existing.setup({ foundation: true }); prepareReason(value);
    const values = [];
    for (const choice of ['request', 'request', 'invitation']) {
        reviewed(value, choice); values.push(hear(value, catalog.reasonTeaching.ja.utterance));
    }
    repeated = copy(values[1]); add('same-choice-first-evidence-preserved', values, [true, true, true]);
    const later = existing.setup({ life: false }); prepareReason(later); reviewed(later, 'invitation', 'ja', true);
    const sample = hear(later, catalog.reasonTeaching.ja.utterance);
    assert.ok(sample.beforeKnowledge.meanings.find(m => m.id === 'rest').evidence.length > sample.beforeSelections.at(-1).meaningBasis.evidence.length);
    add('later-rest-word-basis-does-not-replace-selection', [sample], [true]);
    const mutations = [
        v => { v.result.interpretations = []; }, v => { v.result.understandings = []; }, v => { v.result.relationLearning = {}; },
        v => { v.beforeKnowledge = undefined; }, v => { v.beforeExperiences = []; }, v => { v.beforeSelections = []; },
        v => { v.context = undefined; }, v => { v.context.history = []; }, v => { v.context.experiences = []; },
        v => { v.context.mode = 'rest'; }, v => { v.context.elapsed = 0; }, v => { v.context.scene = 'other'; },
        v => { v.context.activityStart = null; }, v => { v.context.attention = undefined; },
        ...['id', 'raw', 'locale', 'speaker', 'scene', 'at'].map(k => v => { v.result.input[k] = 'other'; }),
        ...['kind', 'slot', 'meaning', 'subject', 'form', 'relations', 'span'].map(k => v => { v.result.interpretations[0][k] = 'other'; }),
        ...['complete', 'subject', 'questionSlot', 'roles', 'relationReferences', 'known', 'unresolved'].map(k => v => { v.result.understandings[0][k] = 'other'; }),
        ...['message', 'experienceId', 'eventTime', 'choiceSource', 'reviewedBy', 'literal'].map(k => v => { v.reply[k] = 'other'; }),
        ...['kind', 'subject', 'target', 'selectedAt', 'meaningBasis', 'relationBasis', 'understanding', 'frame', 'input'].map(k => v => { v.beforeSelections.at(-1)[k] = 'other'; }),
        ...['id', 'kind', 'activity', 'start', 'end', 'target', 'choiceSource'].map(k => v => { v.beforeExperiences.at(-1)[k] = 'other'; }),
        ...['inputId', 'raw', 'locale', 'speaker', 'at', 'heardAt', 'basis', 'proposalBasis', 'questionBasis', 'understanding', 'choiceSource', 'eventReference']
            .map(k => v => { v.beforeExperiences.at(-1).relationLabels.find(l => l.relation === 'reason')[k] = 'other'; }),
        v => { v.beforeExperiences.push(copy(v.beforeExperiences.at(-1))); },
        v => { v.beforeSelections.push(copy(v.beforeSelections.at(-1))); },
        v => { v.beforeExperiences.at(-1).relationLabels.push(copy(v.beforeExperiences.at(-1).relationLabels[0])); },
        v => { v.context.experiences.at(-1).start++; },
        v => { v.context.history.find(h => h.experienceId === v.reply.experienceId).reasons = []; },
        v => { v.context.history.push({ mode: 'rest', start: v.context.elapsed }); },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        ...['question', 'reason'].map(id => v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === id))); }),
        v => { v.beforeKnowledge.relationEvidence = undefined; }
    ];
    for (const source of [initial, learned]) for (const mutate of mutations) {
        const invalid = copy(source); mutate(invalid); add('tampered-input-answer-review-selection-and-context', [invalid], [false]);
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
            v => { v.context.experiences.find(e => e.id === original(v).id).choiceSource = {}; },
            v => { v.context.history.find(h => h.experienceId === original(v).id).reasons = []; },
            v => { v.beforeKnowledge.relationEvidence = v.beforeKnowledge.relationEvidence.filter(e => e.inputId !== basis(v).evidence[0]); },
            v => { v.beforeKnowledge.relationEvidence.push(copy(v.beforeKnowledge.relationEvidence.find(e => e.inputId === basis(v).evidence[0]))); },
            v => { v.beforeExperiences.push({ ...copy(original(v)), id: 'duplicate-origin' }); },
            v => { basis(v).evidence = []; }
        ]) { const invalid = copy(learned); mutate(invalid); add('tampered-original-' + id + '-basis', [invalid], [false]); }
    }
    for (const relation of ['question', 'reason']) {
        const invalid = copy(repeated); invalid.beforeKnowledge.relationEvidence = invalid.beforeKnowledge.relationEvidence.filter(e => e.relation !== relation);
        // There is no question teaching in this initial fixture; reason is required.
        add('initial-first-evidence-presence', [invalid], [relation === 'question']);
        const extra = copy(initial); extra.beforeKnowledge.relations.find(r => r.id === relation).extra = true;
        add('initial-basis-not-replaced', [extra], [false]);
    }
    const frozen = copy(learned), alteredLater = copy(learned);
    alteredLater.beforeKnowledge.relations = []; alteredLater.beforeExperiences = [];
    add('later-knowledge-does-not-rewrite-capture', [frozen, alteredLater], [true, false]);
    for (const settings of [{ foundation: false, life: false }, { foundation: false, life: true }, { foundation: true, life: false }]) {
        const unknown = existing.setup(settings);
        add('missing-real-prerequisites-not-granted', [hear(unknown, catalog.reasonTeaching.ja.utterance)], [false]);
    }
    const same = existing.setup({ foundation: true }); prepareReason(same); reviewed(same);
    add('same-rest-new-input-and-normalized-input', [hear(same, catalog.reasonTeaching.ja.utterance),
        hear(same, '  ' + catalog.reasonTeaching.ja.utterance.normalize('NFKC') + '  ')], [true, true]);
    for (const template of [initial, learned]) {
        for (const mutate of [
            v => { v.beforeExperiences.at(-1).relationLabels[0].inputId = v.result.input.id; },
            v => { v.beforeExperiences.at(-1).relationLabels[0].at = v.context.elapsed + 1; },
            v => { v.beforeExperiences.at(-1).relationLabels[0].heardAt = v.result.input.at + 1; },
            v => { v.reply.observation = true; },
            v => { v.beforeExperiences.at(-1).relationLabels[0].understanding.complete = false; }
        ]) {
            const invalid = copy(template); mutate(invalid); add('review-time-and-actual-reply-contradictions', [invalid], [false]);
        }
    }
    // 4d12an repairs the deferred zero-duration start as one history/answer/save flow.
    for (const foundation of [false, true]) {
        const zero = existing.setup({ foundation }); prepareReason(zero); reviewed(zero);
        reason.select(zero, 'request', 'ja', false);
        const shade = worldApi.PLACES.find(p => p.id === 'shade');
        zero.world.x = shade.x; zero.world.y = shade.y; zero.world.pause = 0;
        worldApi.onArrival(zero.world, zero.state, worldApi.tick(zero.world, .1));
        assert.equal(zero.world.mode, 'rest');
        assert.equal(zero.world.elapsed, zero.world.activityStart);
        worldApi.approach(zero.world, 'path');
        const oldAnswer = hear(zero, catalog.reasonTeaching.ja.utterance);
        assert.equal(oldAnswer.reply.message, 'answer_unknown');
        add('zero-duration-rest-start-does-not-reach-back', [oldAnswer], [false]);
    }
    return output;
}
module.exports = { fixtures };
