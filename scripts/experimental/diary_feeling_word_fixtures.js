'use strict';
// Real receive/respond happens only in disposable Node memory. The renderer
// gets copied evidence and the independent adapter, never a game actor/save.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = v => JSON.parse(JSON.stringify(v));
const setup = settings => ({ state: core.create(settings, catalog), world: worldApi.create() });
function texts(locale = 'ja') {
    const p = catalog.feelingContrast[locale], f = catalog.feelingTeaching[locale], full = p.past + p.join + p.present;
    return { full, source: `${f.source}«${full}»`, sad: `${f.sad}«${p.past}»`, happy: `${f.happy}«${p.present}»`,
        reportSad: `${f.report}«${p.past}»`, reportHappy: `${f.report}«${p.present}»`,
        yesterday: `${f.yesterday}«${p.past}»`, now: `${f.now}«${p.present}»`,
        ...Object.fromEntries(['retain', 'difference', 'noncausal'].map(stage => [stage, `${catalog.contrastTeaching[locale][stage]}«${full}»`])) };
}
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge), beforeFeelingLearning = copy(state.feelingLearning || { events: [], knowledge: [] });
    const beforeTurns = copy(state.context.turns), beforeRecords = copy(state.records);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    worldApi.respond(world, result, state, catalog);
    return copy({ result, context, beforeKnowledge, beforeFeelingLearning, beforeTurns, beforeRecords });
}
function select(value, locale = 'ja') {
    const t = texts(locale); hear(value, t.full, locale); return hear(value, t.source, locale);
}
function fixtures() {
    const output = [], add = (group, values, expected) => output.push({ group, values, expected });
    const seeds = [];
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = setup({ foundation, life, speech }), t = texts(locale);
            add('no-selection', [hear(value, t.sad, locale)], [false]);
            add('selection-is-evidence-only', [select(value, locale)], [false]);
            const sad = hear(value, t.sad, locale), happy = hear(value, t.happy, locale);
            add('seven-locales-eight-settings', [sad, happy], [!life, !life]);
            if (!life && locale === 'ja' && speech === 'short') seeds.push(sad, happy);
            add('existing-repetition-rejected', [hear(value, t.sad, locale), hear(value, t.happy, locale)], [false, false]);
            add('other-stages-and-normal-reports-separated', ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']
                .map(k => hear(value, t[k], locale)), Array(8).fill(false));
        }
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true]) {
        const value = setup({ foundation, life: false }), t = texts(locale); select(value, locale);
        const happy = hear(value, t.happy, locale), report = hear(value, t.reportHappy, locale), sad = hear(value, t.sad, locale);
        assert.ok(report.result.feelingLearning);
        add('reverse-word-order-with-prior-report', [happy, sad], [true, true]);
    }
    for (const scenario of ['no-original', 'ambiguous-original', 'evicted-before-selection', 'other-speaker',
        'other-locale', 'other-scene', 'wrong-clause', 'word-before-selection', 'other-expression']) {
        const value = setup({ foundation: false, life: false }), t = texts();
        if (!['no-original', 'word-before-selection'].includes(scenario)) hear(value, t.full);
        if (scenario === 'ambiguous-original') hear(value, t.full);
        if (scenario === 'evicted-before-selection') for (let i = 0; i < 20; i++) hear(value, 'unsupported ' + i);
        hear(value, t.source);
        if (scenario === 'other-scene') core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        const raw = scenario === 'wrong-clause' ? `${catalog.feelingTeaching.ja.sad}«${catalog.feelingContrast.ja.present}»`
            : scenario === 'other-locale' ? texts('en').sad : scenario === 'other-expression' ? '悲しい' : t.sad;
        add('invalid-occasion', [hear(value, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const foundation of [false, true]) {
        const value = setup({ foundation, life: false }), t = texts(); select(value);
        const first = hear(value, t.sad);
        for (let i = 0; i < 20; i++) hear(value, 'unsupported ' + i);
        add('selected-source-survives-context-eviction', [first, hear(value, t.happy)], [true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const value = setup({ foundation: false, life: false }), t = texts(locale); select(value, locale);
        core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        const rejected = hear(value, t.sad, locale);
        core.perceive(value.state, { scene: 'clearing', attention: [] });
        add('scope-return-does-not-reconstruct-rejected-teaching', [rejected, hear(value, t.sad, locale)], [false, true]);
    }
    for (const foundation of [false, true]) {
        const value = setup({ foundation, life: false }), t = texts(); select(value);
        const first = hear(value, t.sad), frozen = JSON.stringify(first);
        const second = hear(value, t.happy);
        for (const k of ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']) hear(value, t[k]);
        assert.equal(JSON.stringify(first), frozen);
        assert.equal(first.result.feelingLearning.adopted.understanding.known.meaning, undefined);
        assert.equal(first.beforeFeelingLearning.events[0].original.understandings[0].known.meaning, undefined);
        add('later-learning-preserves-earlier-input-time-snapshots', [first, second], [true, true]);
    }
    let withPrior;
    for (const foundation of [false, true]) {
        const value = setup({ foundation, life: false });
        for (const locale of Object.keys(catalog.feelingTeaching)) {
            const t = texts(locale); select(value, locale);
            const first = hear(value, t.sad, locale);
            add('seven-languages-coexist-with-full-prior-evidence', [first, hear(value, t.happy, locale)], [true, true]);
            if (!foundation && locale === 'en') withPrior = copy(first);
            for (const k of ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal']) hear(value, t[k], locale);
        }
    }
    assert.ok(withPrior);
    for (const change of [
        v => { v.beforeFeelingLearning.events[2].understanding.known.meaning = 'happy'; },
        v => { v.beforeFeelingLearning.events[4].understanding.subject = 'self'; },
        v => { v.beforeFeelingLearning.events[6].understanding.eventTime = 'now'; },
        v => { v.beforeFeelingLearning.events[8].understandings[0].testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[9].understandings[0].complete = true; },
        v => { v.beforeFeelingLearning.knowledge.at(-1).scope.connection.causalClaim = true; },
        v => { v.beforeFeelingLearning.knowledge.at(-1).evidence.reverse(); },
        v => { v.beforeFeelingLearning.events[0].original.input.id = v.beforeFeelingLearning.events[0].input.id; },
        v => { v.beforeFeelingLearning.events[4].at = v.context.elapsed + 1; },
        v => { v.beforeFeelingLearning.events[4].input.at = 0; }
    ]) { const altered = copy(withPrior); change(altered); add('prior-report-time-contrast-evidence-tampering', [altered], [false]); }
    assert.equal(seeds.length, 4);
    const changes = [
        ...['id', 'raw', 'locale', 'speaker', 'at', 'scene'].map(k => v => { v.result.input[k] = 'changed'; }),
        ...['kind', 'stage', 'index', 'utterance', 'span', 'relations'].map(k => v => { v.result.interpretations[0][k] = 'changed'; }),
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings[0].complete = true; },
        v => { v.result.understandings[0].known.meaning = 'sad'; },
        v => { v.result.understandings[0].subject = 'player'; },
        v => { delete v.result.feelingLearning; },
        v => { v.result.feelingLearning.updated = []; },
        v => { v.result.feelingLearning.updated.push(copy(v.result.feelingLearning.updated[0])); },
        ...['type', 'id', 'source', 'scope', 'evidence'].map(k => v => { v.result.feelingLearning.updated[0][k] = 'changed'; }),
        ...['input', 'frame', 'at', 'basis', 'sourceId', 'understanding'].map(k => v => { v.result.feelingLearning.adopted[k] = 'changed'; }),
        ...['scene', 'elapsed', 'mode', 'target', 'activityStart', 'attention'].map(k => v => { v.context[k] = { changed: true }; }),
        v => { v.beforeKnowledge.meanings.push({ id: v.result.interpretations[0].stage, source: 'initial' }); },
        v => { v.beforeKnowledge.relations.push({ id: 'report', source: 'initial' }); },
        v => { delete v.beforeFeelingLearning; },
        v => { v.beforeFeelingLearning.knowledge.push(copy(v.result.feelingLearning.updated[0])); },
        v => { v.beforeFeelingLearning.events = []; },
        v => { v.beforeFeelingLearning.events.push(copy(v.beforeFeelingLearning.events[0])); },
        ...['input', 'frame', 'at', 'basis', 'original'].map(k => v => { v.beforeFeelingLearning.events[0][k] = 'changed'; }),
        ...['input', 'frames', 'understandings'].map(k => v => { v.beforeFeelingLearning.events[0].original[k] = 'changed'; }),
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].complete = true; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].feelingBasis.taught = [copy(v.result.feelingLearning.updated[0])]; },
        v => { v.beforeTurns.find(t => t.id === v.beforeFeelingLearning.events[0].original.input.id).understandings[0].complete = true; },
        v => { v.beforeRecords.push({ id: v.result.input.id }); },
        v => { v.beforeTurns.push({ id: v.result.input.id, speaker: 'player', understandings: copy(v.result.understandings) }); },
        v => { v.beforeTurns.push(copy(v.beforeTurns[0])); },
        v => { v.beforeTurns = null; }, v => { v.beforeRecords = null; }
    ];
    for (const seed of seeds) {
        add('input-time-json-copy', [copy(seed)], [true]);
        for (const change of changes) { const altered = copy(seed); change(altered); add('current-and-original-evidence-tampering', [altered], [false]); }
    }
    for (const seed of seeds.filter(s => s.result.interpretations[0].stage === 'happy')) {
        for (const change of [v => { v.beforeFeelingLearning.events[1].input.id = v.result.input.id; },
            v => { v.beforeFeelingLearning.events[1].understanding.complete = true; },
            v => { v.beforeFeelingLearning.knowledge[0].evidence = ['input:999']; },
            v => { v.beforeFeelingLearning.knowledge = []; },
            v => { v.beforeFeelingLearning.events[1].at = -1; }]) {
            const altered = copy(seed); change(altered); add('prior-word-evidence-tampering', [altered], [false]);
        }
    }
    return output;
}
module.exports = { fixtures, setup, hear, select, texts };
