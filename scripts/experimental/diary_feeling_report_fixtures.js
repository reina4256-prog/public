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
            add('no-selection', [hear(v, t.reportSad, locale)], [false]);
            add('selection-is-evidence-only', [select(v, locale)], [false]);
            words(v, t, locale);
            const first = hear(v, t.reportSad, locale), second = hear(v, t.reportHappy, locale);
            add('seven-locales-eight-settings', [first, second], [!foundation, !foundation]);
            if (!foundation && locale === 'ja' && speech === 'short') seeds.push(first, second);
            add('existing-repetition-rejected', [hear(v, t.reportSad, locale), hear(v, t.reportHappy, locale)], [false, false]);
            add('other-stages-and-normal-reports-separated', ['sad', 'happy', 'yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']
                .map(k => hear(v, t[k], locale)), Array(8).fill(false));
        }
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const life of [false, true]) {
        const v = setup({ foundation: false, life }), t = texts(locale); select(v, locale); words(v, t, locale);
        add('reverse-report-order', [hear(v, t.reportHappy, locale), hear(v, t.reportSad, locale)], [true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: false, life: false }), t = texts(locale); select(v, locale);
        const rejectedSad = hear(v, t.reportSad, locale); hear(v, t.sad, locale);
        const first = hear(v, t.reportSad, locale), repeated = hear(v, t.reportSad, locale), rejectedHappy = hear(v, t.reportHappy, locale);
        hear(v, t.happy, locale);
        add('per-clause-prerequisite-and-retry-with-new-input', [rejectedSad, first, repeated, rejectedHappy, hear(v, t.reportHappy, locale)],
            [false, true, false, false, true]);
        assert.equal(rejectedSad.result.feelingLearning, undefined);
        assert.equal(rejectedHappy.result.feelingLearning, undefined);
        assert.equal(first.result.feelingLearning.updated.length, 0);
    }
    for (const scenario of ['no-original', 'ambiguous-original', 'evicted-before-selection', 'other-speaker',
        'other-locale', 'other-scene', 'wrong-clause', 'other-expression']) {
        const v = setup({ foundation: false, life: true }), t = texts();
        if (scenario !== 'no-original') hear(v, t.full);
        if (scenario === 'ambiguous-original') hear(v, t.full);
        if (scenario === 'evicted-before-selection') for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        hear(v, t.source);
        if (scenario === 'other-scene') core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const raw = scenario === 'wrong-clause' ? `${catalog.feelingTeaching.ja.report}«unsupported»`
            : scenario === 'other-locale' ? texts('en').reportSad : scenario === 'other-expression' ? 'unsupported report' : t.reportSad;
        add('invalid-occasion', [hear(v, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: false, life }), t = texts(); select(v); words(v, t, 'ja');
        const first = hear(v, t.reportSad);
        for (let i = 0; i < 20; i++) hear(v, 'unsupported ' + i);
        add('selected-source-survives-context-eviction', [first, hear(v, t.reportHappy)], [true, true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const v = setup({ foundation: false, life: true }), t = texts(locale); select(v, locale);
        core.perceive(v.state, { scene: 'elsewhere', attention: [] });
        const rejected = hear(v, t.reportSad, locale);
        core.perceive(v.state, { scene: 'clearing', attention: [] });
        add('scope-return-does-not-reconstruct-rejected-teaching', [rejected, hear(v, t.reportSad, locale)], [false, true]);
    }
    for (const life of [false, true]) {
        const v = setup({ foundation: false, life }), t = texts(); select(v); words(v, t, 'ja');
        const first = hear(v, t.reportSad), frozen = JSON.stringify(first), second = hear(v, t.reportHappy);
        for (const k of ['yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']) hear(v, t[k]);
        assert.equal(JSON.stringify(first), frozen);
        assert.equal(first.result.feelingLearning.adopted.understanding.subject, null);
        assert.equal(second.result.feelingLearning.adopted.understanding.subject, null);
        add('later-learning-preserves-earlier-input-time-snapshots', [first, second], [true, true]);
    }
    let withPrior;
    for (const life of [false, true]) {
        const v = setup({ foundation: false, life });
        for (const locale of Object.keys(catalog.feelingTeaching)) {
            const t = texts(locale); select(v, locale); words(v, t, locale);
            const first = hear(v, t.reportSad, locale);
            add('seven-languages-coexist-with-full-prior-evidence', [first, hear(v, t.reportHappy, locale)], [true, true]);
            if (!life && locale === 'en') withPrior = copy(first);
            for (const k of ['yesterday', 'now', 'retain', 'difference', 'noncausal']) hear(v, t[k], locale);
        }
    }
    for (const change of [
        v => { v.beforeFeelingLearning.events[2].understanding.known.meaning = 'happy'; },
        v => { v.beforeFeelingLearning.events[4].understanding.subject = 'self'; },
        v => { v.beforeFeelingLearning.events[6].understanding.eventTime = 'now'; },
        v => { v.beforeFeelingLearning.events[8].understandings[0].testimony.verified = true; },
        v => { v.beforeFeelingLearning.events[9].understandings[0].complete = true; },
        v => { v.beforeFeelingLearning.knowledge.find(e => e.id === 'contrast').scope.connection.causalClaim = true; },
        v => { v.beforeFeelingLearning.knowledge.find(e => e.id === 'contrast').evidence.reverse(); },
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
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].complete = true; },
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
        if (seed.result.feelingLearning.updated.length) for (const change of [
            v => { v.result.feelingLearning.updated = []; },
            v => { v.result.feelingLearning.updated.reverse(); },
            v => { v.result.feelingLearning.updated.push(copy(v.result.feelingLearning.updated[0])); },
            ...['type', 'id', 'source', 'scope', 'evidence'].map(k => v => { v.result.feelingLearning.updated[0][k] = 'changed'; }),
            v => { v.beforeFeelingLearning.events.at(-1).understanding.subject = 'player'; },
            v => { v.beforeFeelingLearning.events.at(-1).input.id = v.result.input.id; }
        ]) { const altered = copy(seed); change(altered); add('pair-completion-evidence-tampering', [altered], [false]); }
    }
    return output;
}
module.exports = { fixtures };
