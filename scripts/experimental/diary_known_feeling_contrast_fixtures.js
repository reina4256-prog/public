'use strict';
// Actual receive/respond runs in disposable Node memory only.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const { setup, hear, select, texts } = require('./diary_feeling_word_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const stages = ['retain', 'difference', 'noncausal'];
const prerequisites = ['sad', 'happy', 'reportSad', 'reportHappy', 'yesterday', 'now'];
function prepare(v, locale) {
    select(v, locale);
    const t = texts(locale);
    for (const k of prerequisites) hear(v, t[k], locale);
    return t;
}
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const v = setup({ foundation, life, speech }), t = texts(locale);
            add('no-selection', [hear(v, t.retain, locale)], [false]);
            add('selection-is-evidence-only', [select(v, locale)], [false]);
            for (const k of prerequisites) hear(v, t[k], locale);
            const sequence = stages.map(k => hear(v, t[k], locale));
            add('seven-locales-eight-settings', sequence, Array(3).fill(foundation));
            if (foundation && locale === 'ja' && speech === 'short') seeds.push(...sequence);
            add('existing-repetition-rejected', stages.map(k => hear(v, t[k], locale)), Array(3).fill(false));
            add('other-stages-and-normal-reports-separated', ['source', ...prerequisites, 'full']
                .map(k => hear(v, t[k], locale)), Array(8).fill(false));
        }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: false }), t = texts(locale); select(v, locale);
        const rejected = [hear(v, t.retain, locale)]; hear(v, t.sad, locale);
        rejected.push(hear(v, t.retain, locale)); hear(v, t.happy, locale);
        for (const r of rejected) assert.equal(r.result.feelingLearning, undefined);
        add('both-meanings-required-and-new-input-retry', [...rejected, ...stages.map(k => hear(v, t[k], locale))],
            [false, false, true, true, true]);
        for (const value of rejected) add('later-knowledge-does-not-create-rejected-input', [copy(value)], [false]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = prepare(v, locale);
        add('ordered-distinct-teachings-only', ['noncausal', 'difference', 'retain', 'retain', 'noncausal', 'difference', 'difference', 'noncausal']
            .map(k => hear(v, t[k], locale)), [false, false, true, false, false, true, false, true]);
    }
    for (const scenario of ['no-original', 'ambiguous-original', 'evicted-before-selection', 'other-speaker',
        'other-locale', 'other-scene', 'single-clause', 'other-expression']) {
        const v = setup({ foundation: true, life: true }), t = texts();
        if (scenario !== 'no-original') hear(v, t.full);
        if (scenario === 'ambiguous-original') hear(v, t.full);
        if (scenario === 'evicted-before-selection') for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        hear(v, t.source);
        if (scenario === 'other-scene') core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const raw = scenario === 'single-clause' ? `${catalog.contrastTeaching.ja.retain}«${catalog.feelingContrast.ja.past}»`
            : scenario === 'other-locale' ? texts('en').retain : scenario === 'other-expression' ? 'unsupported contrast' : t.retain;
        add('invalid-occasion', [hear(v, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = prepare(v, 'ja'), first = hear(v, t.retain);
        for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        add('selected-source-survives-context-eviction', [first, hear(v, t.difference), hear(v, t.noncausal)], [true, true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: true }), t = prepare(v, locale), first = hear(v, t.retain, locale);
        core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const rejected = hear(v, t.difference, locale);
        core.perceive(v.state, { scene: 'clearing', attention: [] });
        add('scope-return-does-not-adopt-rejected-input', [first, rejected, hear(v, t.difference, locale), hear(v, t.noncausal, locale)], [true, false, true, true]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = texts(); select(v);
        if (life) { hear(v, t.sad); hear(v, t.happy); }
        else { hear(v, t.happy); hear(v, t.sad); }
        const first = hear(v, t.retain), frozen = JSON.stringify(first), second = hear(v, t.difference), third = hear(v, t.noncausal);
        hear(v, t.full);
        assert.equal(JSON.stringify(first), frozen);
        add('later-teaching-preserves-original-and-input-time-basis', [first, second, third], [true, true, true]);
    }
    let withPrior;
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life });
        for (const locale of Object.keys(catalog.feelingTeaching)) {
            const t = prepare(v, locale), first = hear(v, t.retain, locale);
            if (!life && locale === 'en') withPrior = copy(first);
            add('seven-languages-coexist-with-prior-teachings', [first, hear(v, t.difference, locale), hear(v, t.noncausal, locale)], [true, true, true]);
        }
    }
    for (const change of [
        v => { v.beforeFeelingLearning.events[2].understanding.known.meaning = 'happy'; },
        v => { v.beforeFeelingLearning.events[4].understanding.subject = 'self'; },
        v => { v.beforeFeelingLearning.events[6].understanding.eventTime = 'yesterday'; },
        v => { v.beforeFeelingLearning.events[8].understandings[0].testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[9].understandings[0].complete = false; },
        v => { v.beforeFeelingLearning.events[9].basis.relations.reverse(); },
        v => { v.beforeFeelingLearning.knowledge.push({ type: 'relation', id: 'contrast' }); },
        v => { v.beforeFeelingLearning.events[0].original.input.id = v.beforeFeelingLearning.events[0].input.id; },
        v => { v.beforeFeelingLearning.events[4].at = v.context.elapsed + 1; },
        v => { v.beforeFeelingLearning.events[4].input.at = 0; }
    ]) { const v = copy(withPrior); change(v); add('prior-evidence-tampering', [v], [false]); }
    assert.equal(seeds.length, 6);
    const changes = [
        ...['id', 'raw', 'locale', 'speaker', 'at', 'scene'].map(k => v => { v.result.input[k] = 'changed'; }),
        ...['kind', 'stage', 'index', 'utterance', 'span', 'relations'].map(k => v => { v.result.interpretations[0][k] = 'changed'; }),
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.understandings[0].complete = true; },
        v => { v.result.understandings[0].known.meaning = 'sad'; },
        v => { v.result.understandings[0].subject = 'player'; },
        v => { delete v.result.feelingLearning; },
        v => { v.result.feelingLearning.updated = [{ changed: true }]; },
        ...['input', 'frame', 'at', 'basis', 'sourceId', 'understandings'].map(k => v => { v.result.feelingLearning.adopted[k] = 'changed'; }),
        ...['scene', 'elapsed', 'mode', 'target', 'activityStart', 'attention'].map(k => v => { v.context[k] = { changed: true }; }),
        v => { v.beforeKnowledge.relations.push({ id: 'report', source: 'initial' }); },
        v => { v.beforeKnowledge.meanings.push({ id: 'sad', source: 'initial' }); },
        v => { delete v.beforeFeelingLearning; },
        v => { v.beforeFeelingLearning.knowledge.push({ changed: true }); },
        v => { v.beforeFeelingLearning.events = []; },
        v => { v.beforeFeelingLearning.events.push(copy(v.beforeFeelingLearning.events[0])); },
        ...['input', 'frame', 'at', 'basis', 'original'].map(k => v => { v.beforeFeelingLearning.events[0][k] = 'changed'; }),
        ...['input', 'frames', 'understandings'].map(k => v => { v.beforeFeelingLearning.events[0].original[k] = 'changed'; }),
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].complete = !v.beforeFeelingLearning.events[0].original.understandings[0].complete; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].feelingBasis.taught = [{ changed: true }]; },
        v => {
            const original = v.beforeFeelingLearning.events[0].original;
            const r = [...v.beforeTurns, ...v.beforeRecords].find(t => t.id === original.input.id);
            if (r) r.understandings[0].subject = 'self';
            else v.beforeTurns.push({ id: original.input.id, speaker: 'player',
                understandings: original.understandings.map(u => ({ ...copy(u), subject: 'self' })) });
        },
        v => { v.beforeRecords.push({ id: v.result.input.id }); },
        v => { v.beforeTurns.push({ id: v.result.input.id, speaker: 'player', understandings: copy(v.result.understandings) }); },
        v => { v.beforeTurns.push(copy(v.beforeTurns[0])); },
        v => { v.beforeTurns = null; }, v => { v.beforeRecords = null; }
    ];
    for (const seed of seeds) {
        add('input-time-json-copy', [copy(seed)], [true]);
        for (const change of changes) { const v = copy(seed); change(v); add('current-and-original-evidence-tampering', [v], [false]); }
        assert.deepEqual(seed.result.feelingLearning.updated, []);
        for (const stage of stages.filter(k => k !== seed.result.interpretations[0].stage)) {
            const v = copy(seed), event = v.result.feelingLearning.adopted;
            const raw = texts(v.result.input.locale)[stage];
            v.result.input.raw = raw; event.input.raw = raw;
            v.result.interpretations[0].stage = stage; v.result.interpretations[0].span = raw;
            event.frame.stage = stage; event.frame.span = raw;
            add('consistent-stage-rewrite-still-requires-order', [v], [false]);
        }
        for (const previous of seed.beforeFeelingLearning.events.filter(e => stages.includes(e.frame.stage))) {
            for (const change of [
                e => { e.input.id = seed.result.input.id; },
                e => { e.input.scene = 'elsewhere'; },
                e => { e.sourceId = 'input:99999'; },
                e => { e.understandings[1].testimony.verified = true; }
            ]) {
                const v = copy(seed), e = v.beforeFeelingLearning.events.find(e => e.input.id === previous.input.id);
                change(e); add('prior-stage-input-scope-and-understanding-tampering', [v], [false]);
            }
        }
        for (const id of ['report', 'time', 'contrast']) for (const change of [
            v => { v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(e => e.id !== id); },
            v => { v.beforeKnowledge.relations.find(e => e.id === id).source = 'experience'; },
            v => { v.beforeKnowledge.relations.find(e => e.id === id).scope = {}; },
            v => { v.beforeKnowledge.relations.push({ id, source: 'experience' }); },
            v => { v.result.feelingLearning.adopted.basis.relations.find(e => e.id === id).source = 'experience'; }
        ]) { const v = copy(seed); change(v); add('initial-relations-not-replaced-or-reacquired', [v], [false]); }
        for (const index of [0, 1]) for (const change of [
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].eventTime = 'unspecified'; },
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].eventTime = v.context.elapsed; },
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].testimony.verified = true; },
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].complete = false; },
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].relations = ['report', 'time']; },
            (v, i) => { v.result.feelingLearning.adopted.understandings[i].subject = 'self'; },
            (v, i) => { v.beforeFeelingLearning.events[0].original.understandings[i].eventTime = 'unspecified'; },
            (v, i) => { v.beforeFeelingLearning.events[0].original.understandings[i].subject = 'self'; }
        ]) { const v = copy(seed); change(v, index); add('both-clause-anchor-and-truth-not-rewritten', [v], [false]); }
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: false, life: true }), t = prepare(v, locale);
        for (const k of stages) hear(v, t[k], locale);
        add('experienced-contrast-not-reaccepted', stages.map(k => hear(v, t[k], locale)), [false, false, false]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: true }), t = prepare(v, locale), values = [];
        for (const [index, stage] of stages.entries()) {
            v.world.elapsed = 30 * (index + 1);
            const value = hear(v, t[stage], locale); values.push(value);
            assert.equal(value.result.feelingLearning.adopted.at, v.world.elapsed);
            assert.notEqual(value.result.input.at, v.world.elapsed);
        }
        add('spaced-teachings-preserve-original-reported-time', values, [true, true, true]);
    }
    return output;
}
module.exports = { fixtures };
