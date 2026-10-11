'use strict';
const assert = require('node:assert/strict');
const { setup, hear, select, texts } = require('./diary_feeling_word_fixtures');
const catalog = require('../../experimental_word_learning_catalog.json');
const core = require('../../experimental_word_learning_core');
const copy = v => JSON.parse(JSON.stringify(v));
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
            const value = setup({ foundation, life, speech }), t = texts(locale);
            add('no-selection', [hear(value, t.sad, locale)], [false]);
            add('selection-only', [select(value, locale)], [false]);
            const sad = hear(value, t.sad, locale), happy = hear(value, t.happy, locale);
            add('seven-locales-eight-settings', [sad, happy], [life, life]);
            if (life && locale === 'ja' && speech === 'short') seeds.push(sad, happy);
            add('existing-repetition-rejected', [hear(value, t.sad, locale), hear(value, t.happy, locale)], [false, false]);
            add('other-stages-normal-report-separated', ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']
                .map(k => hear(value, t[k], locale)), Array(8).fill(false));
        }
    for (const locale of Object.keys(catalog.feelingTeaching)) for (const foundation of [false, true]) {
        const value = setup({ foundation, life: true }), t = texts(locale); select(value, locale);
        const happy = hear(value, t.happy, locale), report = hear(value, t.reportHappy, locale), sad = hear(value, t.sad, locale);
        assert.ok(report.result.feelingLearning);
        add('reverse-order-prior-report', [happy, sad], [true, true]);
    }
    for (const scenario of ['no-original', 'ambiguous-original', 'evicted-before-selection', 'other-speaker', 'other-locale',
        'other-scene', 'wrong-clause', 'word-before-selection', 'other-expression']) {
        const value = setup({ foundation: false, life: true }), t = texts();
        if (!['no-original', 'word-before-selection'].includes(scenario)) hear(value, t.full);
        if (scenario === 'ambiguous-original') hear(value, t.full);
        if (scenario === 'evicted-before-selection') for (let i = 0; i < 20; i++) hear(value, 'unsupported ' + i);
        hear(value, t.source);
        if (scenario === 'other-scene') core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        const raw = scenario === 'wrong-clause' ? `${catalog.feelingTeaching.ja.sad}«${catalog.feelingContrast.ja.present}»`
            : scenario === 'other-locale' ? texts('en').sad : scenario === 'other-expression' ? 'sad' : t.sad;
        add('invalid-occasion', [hear(value, raw, scenario === 'other-locale' ? 'en' : 'ja', scenario === 'other-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const foundation of [false, true]) {
        const value = setup({ foundation, life: true }), t = texts(); select(value);
        const first = hear(value, t.sad), frozen = JSON.stringify(first);
        for (let i = 0; i < 20; i++) hear(value, 'unsupported ' + i);
        add('selection-survives-context-eviction', [first, hear(value, t.happy)], [true, true]);
        for (const k of ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal', 'full']) hear(value, t[k]);
        assert.equal(JSON.stringify(first), frozen);
        add('later-learning-preserves-original', [copy(first)], [true]);
    }
    for (const locale of Object.keys(catalog.feelingTeaching)) {
        const value = setup({ life: true }), t = texts(locale); select(value, locale);
        core.perceive(value.state, { scene: 'elsewhere', attention: [] });
        const rejected = hear(value, t.sad, locale);
        core.perceive(value.state, { scene: 'clearing', attention: [] });
        add('scene-return-rejected-not-reconstructed', [rejected, hear(value, t.sad, locale)], [false, true]);
    }
    let prior;
    for (const foundation of [false, true]) {
        const value = setup({ foundation, life: true });
        for (const locale of Object.keys(catalog.feelingTeaching)) {
            const t = texts(locale); select(value, locale);
            const sad = hear(value, t.sad, locale);
            add('seven-languages-prior-evidence', [sad, hear(value, t.happy, locale)], [true, true]);
            if (!foundation && locale === 'en') prior = sad;
            for (const k of ['reportSad', 'reportHappy', 'yesterday', 'now', 'retain', 'difference', 'noncausal']) hear(value, t[k], locale);
        }
    }
    const changes = [
        ...['input', 'interpretations', 'understandings', 'feelingLearning'].map(k => v => { v.result[k] = null; }),
        v => { v.result.feelingLearning.updated = [{ type: 'meaning', id: 'sad' }]; },
        ...['input', 'frame', 'at', 'basis', 'sourceId', 'understanding'].map(k => v => { v.result.feelingLearning.adopted[k] = 'changed'; }),
        ...['scene', 'elapsed', 'mode', 'target', 'activityStart', 'attention'].map(k => v => { v.context[k] = { changed: true }; }),
        v => { v.beforeKnowledge.meanings = []; },
        v => { v.beforeKnowledge.meanings.push(copy(v.beforeKnowledge.meanings.find(e => e.id === 'sad'))); },
        v => { v.beforeKnowledge.meanings.find(e => e.id === 'sad').source = 'experience'; },
        v => { v.beforeKnowledge.meanings.find(e => e.id === 'sad').scope = {}; },
        v => { v.beforeKnowledge.relations.push({ id: 'report', source: 'initial' }); },
        v => { v.beforeFeelingLearning.events = []; },
        v => { v.beforeFeelingLearning.events.push(copy(v.beforeFeelingLearning.events[0])); },
        v => { v.beforeFeelingLearning.knowledge.push({ type: 'meaning', id: 'sad' }); },
        ...['input', 'frame', 'at', 'basis', 'original'].map(k => v => { v.beforeFeelingLearning.events[0][k] = 'changed'; }),
        ...['input', 'frames', 'understandings'].map(k => v => { v.beforeFeelingLearning.events[0].original[k] = 'changed'; }),
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].known.meaning = 'happy'; },
        v => { v.beforeFeelingLearning.events[0].original.understandings[0].feelingBasis.meanings = []; },
        v => { v.beforeTurns.find(t => t.id === v.beforeFeelingLearning.events[0].original.input.id).understandings[0].known.meaning = 'happy'; },
        v => { v.beforeRecords.push({ id: v.result.input.id }); },
        v => { v.beforeTurns.push(copy(v.beforeTurns[0])); },
        v => { v.beforeTurns = null; }, v => { v.beforeRecords = null; }
    ];
    for (const seed of seeds) {
        add('input-time-json-copy', [copy(seed)], [true]);
        for (const change of changes) { const altered = copy(seed); change(altered); add('evidence-tampering', [altered], [false]); }
    }
    for (const index of [3, 5, 9]) for (const field of ['basis', 'input', 'frame', 'at']) {
        const altered = copy(prior); altered.beforeFeelingLearning.events[index][field] = null;
        add('prior-other-language-relation-tampering', [altered], [false]);
    }
    return output;
}
module.exports = { fixtures };
