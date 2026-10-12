'use strict';
// The living actor exists only in disposable Node memory, never in the renderer.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const { setup, hear, select, texts } = require('./diary_feeling_word_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    const words = (v, t, locale) => { hear(v, t.sad, locale); hear(v, t.happy, locale); };
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const v = setup({ foundation, life, speech }), t = texts(locale);
            add('no-selection', [hear(v, t.yesterday, locale)], [false]);
            add('selection-is-evidence-only', [select(v, locale)], [false]);
            words(v, t, locale);
            const first = hear(v, t.yesterday, locale), second = hear(v, t.now, locale);
            add('seven-locales-eight-settings', [first, second], [foundation, foundation]);
            if (foundation && locale === 'ja' && speech === 'short') seeds.push(first, second);
            add('existing-repetition-rejected', [hear(v, t.yesterday, locale), hear(v, t.now, locale)], [false, false]);
            add('other-stages-and-normal-reports-separated', ['sad', 'happy', 'reportSad', 'reportHappy', 'retain', 'difference', 'noncausal', 'full']
                .map(k => hear(v, t[k], locale)), Array(8).fill(false));
        }
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = texts(locale); select(v, locale); words(v, t, locale);
        add('reverse-time-order', [hear(v, t.now, locale), hear(v, t.yesterday, locale)], [true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: false }), t = texts(locale); select(v, locale);
        const rejectedSad = hear(v, t.yesterday, locale); hear(v, t.sad, locale);
        const first = hear(v, t.yesterday, locale), repeated = hear(v, t.yesterday, locale), rejectedHappy = hear(v, t.now, locale);
        hear(v, t.happy, locale);
        add('per-clause-prerequisite-and-retry-with-new-input', [rejectedSad, first, repeated, rejectedHappy, hear(v, t.now, locale)],
            [false, true, false, false, true]);
        assert.equal(rejectedSad.result.feelingLearning, undefined);
        assert.equal(rejectedHappy.result.feelingLearning, undefined);
        assert.equal(first.result.feelingLearning.updated.length, 0);
    }
    for (const scenario of ['no-original', 'ambiguous-original', 'evicted-before-selection', 'other-speaker',
        'other-locale', 'other-scene', 'wrong-clause', 'other-expression']) {
        const v = setup({ foundation: true, life: true }), t = texts();
        if (scenario !== 'no-original') hear(v, t.full);
        if (scenario === 'ambiguous-original') hear(v, t.full);
        if (scenario === 'evicted-before-selection') for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        hear(v, t.source);
        if (scenario === 'other-scene') core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const raw = scenario === 'wrong-clause' ? `${catalog.feelingTeaching.ja.yesterday}«unsupported»`
            : scenario === 'other-locale' ? texts('en').yesterday : scenario === 'other-expression' ? 'unsupported report' : t.yesterday;
        add('invalid-occasion', [hear(v, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = texts(); select(v); words(v, t, 'ja');
        const first = hear(v, t.yesterday);
        for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        add('selected-source-survives-context-eviction', [first, hear(v, t.now)], [true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: true }), t = texts(locale); select(v, locale);
        core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const rejected = hear(v, t.yesterday, locale);
        core.perceive(v.state, { scene: 'clearing', attention: [] });
        add('scope-return-does-not-reconstruct-rejected-teaching', [rejected, hear(v, t.yesterday, locale)], [false, true]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life }), t = texts(); select(v); words(v, t, 'ja');
        const first = hear(v, t.yesterday), frozen = JSON.stringify(first), second = hear(v, t.now);
        for (const k of ['yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']) hear(v, t[k]);
        assert.equal(JSON.stringify(first), frozen);
        assert.equal(first.result.feelingLearning.adopted.understanding.subject, 'player');
        assert.equal(second.result.feelingLearning.adopted.understanding.subject, 'player');
        add('later-learning-preserves-earlier-input-time-snapshots', [first, second], [true, true]);
    }
    let withPrior;
    for (const life of [false, true]) {
        const v = setup({ foundation: true, life });
        for (const locale of Object.keys(catalog.feelingTeaching)) {
            const t = texts(locale); select(v, locale); words(v, t, locale);
            const first = hear(v, t.yesterday, locale);
            add('seven-languages-coexist-with-full-prior-evidence', [first, hear(v, t.now, locale)], [true, true]);
            if (!life && locale === 'en') withPrior = copy(first);
            for (const k of ['reportSad', 'reportHappy', 'retain', 'difference', 'noncausal']) hear(v, t[k], locale);
        }
    }
    for (const change of [
        v => { v.beforeFeelingLearning.events[2].understanding.known.meaning = 'happy'; },
        v => { v.beforeFeelingLearning.events[4].understanding.subject = 'self'; },
        v => { v.beforeFeelingLearning.events[6].understanding.eventTime = 'yesterday'; },
        v => { v.beforeFeelingLearning.events[8].understandings[0].testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[9].understandings[0].complete = false; },
        v => { v.beforeFeelingLearning.events[9].understandings[0].testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[9].basis.relations.reverse(); },
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
        v => { v.result.feelingLearning.updated = [{ changed: true }]; },
        ...['input', 'frame', 'at', 'basis', 'sourceId', 'understanding'].map(k => v => { v.result.feelingLearning.adopted[k] = 'changed'; }),
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
        v => { v.beforeTurns.find(t => t.id === v.beforeFeelingLearning.events[0].original.input.id).understandings[0].subject = 'self'; },
        v => { v.beforeRecords.push({ id: v.result.input.id }); },
        v => { v.beforeTurns.push({ id: v.result.input.id, speaker: 'player', understandings: copy(v.result.understandings) }); },
        v => { v.beforeTurns.push(copy(v.beforeTurns[0])); },
        v => { v.beforeTurns = null; }, v => { v.beforeRecords = null; }
    ];
    for (const seed of seeds) {
        add('input-time-json-copy', [copy(seed)], [true]);
        for (const change of changes) { const altered = copy(seed); change(altered); add('current-and-original-evidence-tampering', [altered], [false]); }

    }
    for (const seed of seeds) for (const id of ['report', 'time', 'contrast']) {
        for (const change of [
            v => { v.beforeKnowledge.relations = v.beforeKnowledge.relations.filter(e => e.id !== id); },
            v => { v.beforeKnowledge.relations.find(e => e.id === id).source = 'experience'; },
            v => { v.beforeKnowledge.relations.find(e => e.id === id).scope = {}; },
            v => { v.beforeKnowledge.relations.push({ id, source: 'experience' }); },
            v => { v.result.feelingLearning.adopted.basis.relations.find(e => e.id === id).source = 'experience'; }
        ]) { const altered = copy(seed); change(altered); add('initial-relations-not-replaced-or-reacquired', [altered], [false]); }
        assert.deepEqual(seed.result.feelingLearning.updated, []);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: false, life: true }), t = texts(locale); select(v, locale);
        hear(v, t.yesterday, locale); hear(v, t.now, locale);
        add('experienced-time-complete-repetition-not-synthesized',
            [hear(v, t.yesterday, locale), hear(v, t.now, locale)], [false, false]);
    }
    for (const seed of seeds) for (const change of [
        v => { v.result.feelingLearning.adopted.understanding.eventTime = 'unspecified'; },
        v => { v.result.feelingLearning.adopted.understanding.eventTime = v.context.elapsed; },
        v => { v.result.feelingLearning.adopted.understanding.testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].eventTime = 'now'; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[1].eventTime = 'yesterday'; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].eventTime = 'unspecified'; },
        v => { v.result.feelingLearning.adopted.understanding.relations = ['report', 'contrast']; },
        v => { v.result.feelingLearning.adopted.understanding.subject = 'self'; }
    ]) { const altered = copy(seed); change(altered); add('known-time-anchor-not-rewritten-or-verified', [altered], [false]); }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: true, life: true }), t = texts(locale); select(v, locale);
        v.world.elapsed = 30;
        const first = hear(v, t.now, locale);
        v.world.elapsed = 60;
        const second = hear(v, t.yesterday, locale);
        assert.equal(first.result.feelingLearning.adopted.at, 30);
        assert.equal(second.result.feelingLearning.adopted.at, 60);
        assert.notEqual(first.result.input.at, first.result.feelingLearning.adopted.at);
        assert.equal(first.result.feelingLearning.adopted.understanding.eventTime, 'now');
        assert.equal(second.result.feelingLearning.adopted.understanding.eventTime, 'yesterday');
        add('later-teaching-keeps-original-report-time-anchor', [first, second], [true, true]);
    }
    return output;
}
module.exports = { fixtures };
