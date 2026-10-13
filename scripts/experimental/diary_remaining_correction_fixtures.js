'use strict';
// All live learning runs in disposable Node memory; renderer receives copies only.
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const catalog = require('../../experimental_word_learning_catalog.json');
const base = require('./diary_general_correction_fixtures');
const existing = require('./diary_negation_fixtures');
const { hear: receive } = require('./diary_correction_fixtures');
const copy = v => JSON.parse(JSON.stringify(v));
const locales = Object.keys(catalog.correctionTeaching);
const ids = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired', ...Object.keys(catalog.experienceMeanings)];
function hear(v, raw, locale = 'ja', speaker = 'player') {
    const receipt = receive(v, raw, locale, speaker), beforeReceipts = copy(v.receipts || []);
    receipt.beforeKnowledge.wordExplanations ||= [];
    v.receipts ||= []; v.receipts.push(copy(receipt));
    return { ...receipt, beforeReceipts };
}
function setup(options = {}, locale = 'ja') {
    const v = base.prepare(options, locale); v.receipts = []; return v;
}
function contrast(old, next, name = 'lulu') {
    return `${name}は${base.word(old, 'ja')}のことじゃなくて、${base.word(next, 'ja')}のことだよ`;
}
function fixtures() {
    const out = [], seeds = [], add = (group, values, expected) => out.push({ group, values, expected });
    for (const locale of locales) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const prepared = setup({ life, speech }, locale);
        for (const next of ids) {
            const v = copy(prepared);
            hear(v, base.form('berry', locale), locale);
            hear(v, base.form('sleep', locale, true), locale);
            if (next === 'sleep') continue;
            const actual = hear(v, base.form(next, locale, true), locale);
            assert.equal(actual.result.understandings[0].complete, true);
            add('seven-locales-recorrection-all-meanings', [actual], [true]);
            if (locale === 'ja' && life && speech === 'short' && next === 'rest') seeds.push(copy(actual));
        }
    }
    for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const next of ids) {
        const v = setup({ life, speech });
        base.idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        hear(v, 'これをluluって呼ぼう');
        const first = hear(v, base.form(next, 'ja', true));
        assert.equal(first.result.understandings[0].complete, true);
        add('individual-source-all-meanings', [first], [true]);
        if (life && speech === 'short' && next === 'rest') seeds.push(copy(first));
        const second = hear(v, base.form(next === 'sleep' ? 'rest' : 'sleep', 'ja', true));
        add('individual-root-recorrection', [second], [true]);
        if (life && speech === 'short' && next === 'rest') seeds.push(copy(second));
    }
    for (const old of ids) for (const next of ids) if (old !== next) {
        const v = setup(); hear(v, base.form(old, 'ja'));
        const actual = hear(v, contrast(old, next));
        assert.equal(actual.result.understandings[0].complete, true);
        add('japanese-explicit-old-meaning-all-pairs', [actual], [true]);
        if (old === 'rest' && next === 'sleep') seeds.push(copy(actual));
    }
    const named = setup(); base.idle(named, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
    hear(named, 'これをluluって呼ぼう'); hear(named, base.form('rest', 'ja'));
    const nameContrast = hear(named, contrast('berry', 'sleep'));
    add('contrast-selects-individual-leaves-competing-definition', [nameContrast], [true]); seeds.push(copy(nameContrast));
    const competing = setup(); hear(competing, base.form('berry', 'ja')); hear(competing, base.form('rest', 'ja'));
    add('contrast-selects-one-definition-other-remains', [hear(competing, contrast('rest', 'sleep'))], [true]);
    const sequence = setup(); hear(sequence, base.form('berry', 'ja')); hear(sequence, base.form('sleep', 'ja', true));
    const first = hear(sequence, base.form('rest', 'ja', true));
    const second = hear(sequence, contrast('rest', 'food'));
    const third = hear(sequence, base.form('work:farming', 'ja', true));
    add('long-chain-keeps-each-occurrence', [first, second, third], [true, true, true]); seeds.push(copy(third));
    add('unchanged-repeat-no-candidate', [hear(sequence, base.form('work:farming', 'ja', true))], [false]);
    for (const locale of locales) {
        const v = setup({}, locale); hear(v, base.form('berry', locale), locale);
        add('x-aj-unmodified-ownership', [hear(v, base.form('sleep', locale, true), locale)], [false]);
    }
    for (const raw of ['これをluluって呼ぼう', 'これはluluだよ', 'luluだよ']) {
        const v = setup(); base.idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        hear(v, raw); add('existing-japanese-naming-forms', [hear(v, base.form('sleep', 'ja', true))], [true]);
    }
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); base.idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        hear(v, 'これをluluって呼ぼう');
        v.world.elapsed += 10; base.idle(v, 'elsewhere', [{ id: 'berry:1', meaning: 'berry' }]);
        add('same-individual-other-scene', [hear(v, base.form('sleep', 'ja', true))], [true]);
        hear(v, 'わからないことば');
        v.state.context.turns = [];
        add('context-eviction-keeps-chain-provenance', [hear(v, base.form('rest', 'ja', true))], [true]);
    }
    const retry = setup(); hear(retry, base.form('berry', 'ja')); hear(retry, base.form('sleep', 'ja', true));
    retry.state.knowledge.relations = retry.state.knowledge.relations.filter(r => r.id !== 'correction');
    const rejected = hear(retry, base.form('rest', 'ja', true));
    retry.state.knowledge.relations.push({ id: 'correction', source: 'initial' });
    add('rejected-input-no-later-retroactive-completion', [rejected], [false]);
    add('new-input-after-prerequisite-restored', [hear(retry, base.form('rest', 'ja', true))], [true]);
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = existing.setup({ foundation, life, speech }); v.receipts = []; base.idle(v);
        hear(v, base.form('rest', 'ja')); hear(v, base.form('sleep', 'ja', true));
        const actual = hear(v, base.form('berry', 'ja', true));
        add('eight-starts-prerequisite-boundary', [actual], [foundation && life]);
    }
    for (const scenario of ['missing-root', 'duplicate-root', 'foreign-speaker', 'foreign-locale', 'foreign-scene',
        'foreign-target', 'unknown-new', 'unknown-correction', 'unknown-naming', 'unknown-negation', 'unknown-contrast',
        'competing-original', 'wrong-old-meaning']) {
        const v = setup(); base.idle(v, 'clearing', [{ id: 'berry:1', meaning: 'berry' }]);
        hear(v, base.form('berry', 'ja')); hear(v, base.form('sleep', 'ja', true));
        if (scenario === 'missing-root') v.receipts.shift();
        if (scenario === 'duplicate-root') v.receipts.push(copy(v.receipts[0]));
        if (scenario === 'foreign-scene') base.idle(v, 'elsewhere');
        if (scenario === 'foreign-target') base.idle(v, 'clearing', [{ id: 'berry:2', meaning: 'berry' }]);
        if (scenario === 'unknown-new') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(m => m.id !== 'rest');
        if (scenario.startsWith('unknown-') && scenario !== 'unknown-new')
            v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== scenario.slice(8));
        if (scenario === 'competing-original') hear(v, base.form('food', 'ja'));
        const raw = ['unknown-negation', 'unknown-contrast', 'wrong-old-meaning'].includes(scenario)
            ? contrast(scenario === 'wrong-old-meaning' ? 'food' : 'sleep', 'rest') : base.form('rest', 'ja', true);
        add('invalid-occasion', [hear(v, raw, scenario === 'foreign-locale' ? 'en' : 'ja',
            scenario === 'foreign-speaker' ? 'visitor' : 'player')], [false]);
    }
    for (const seed of seeds) {
        add('json-input-time-copy', [copy(seed)], [true]);
        const changes = [
            ...['id', 'raw', 'speaker', 'locale', 'at', 'scene'].map(k => v => { v.result.input[k] = null; }),
            ...['scene', 'attention', 'mode', 'target', 'activityStart', 'elapsed'].map(k => v => { v.context[k] = undefined; }),
            ...['kind', 'word', 'meaning', 'relations', 'span', 'catalogRule'].map(k => v => { v.result.interpretations[0][k] = null; }),
            ...['kind', 'known', 'target', 'relations', 'unresolved', 'complete', 'subject', 'corrects', 'wordExplanation'].map(k => v => { v.result.understandings[0][k] = null; }),
            ...['candidates', 'adopted', 'updated', 'relationAcquired', 'retraction'].map(k => v => { v.result.learning[0][k] = null; }),
            ...['meanings', 'relations', 'associations', 'wordExplanations'].map(k => v => { v.beforeKnowledge[k] = undefined; }),
            v => { v.beforeExperiences = undefined; }, v => { v.beforeRecords = []; }, v => { v.beforeReceipts = []; },
            v => { v.beforeReceipts.push(copy(v.beforeReceipts[0])); }, v => { v.beforeReceipts[0].beforeReceipts = []; },
            v => { v.beforeKnowledge.relations.push({ id: 'correction', source: 'initial' }); },
            v => { v.beforeRecords[0].heardAt = -1; }, v => { v.beforeRecords[0].understandings[0].complete = false; },
            v => { v.beforeKnowledge.meanings.push(copy(v.beforeKnowledge.meanings.find(m =>
                m.id === v.result.understandings[0].known.meaning))); },
            v => { v.result.understandings[0].ownFeeling = 'happy'; }
        ];
        // Every source receipt is separately checked, including original raw,
        // original-time knowledge and the first naming's adopted correspondence.
        // Only chain sources are mandatory: unrelated receipts are not evidence.
        const required = new Set([seed.result.understandings[0].corrects]);
        for (let id of [...required]) {
            let p = seed.beforeReceipts.find(r => r.result.input.id === id);
            while (p?.result.understandings[0].corrects) {
                id = p.result.understandings[0].corrects; required.add(id);
                p = seed.beforeReceipts.find(r => r.result.input.id === id);
            }
        }
        for (let n = 0; n < seed.beforeReceipts.length; n++) if (required.has(seed.beforeReceipts[n].result.input.id))
            for (const change of [
                p => { p.result.input.raw = 'changed'; }, p => { p.result.input.locale = 'en'; },
                p => { p.result.input.at = -1; }, p => { p.context.attention = []; },
                p => { p.beforeKnowledge.relations = []; }, p => { p.result.understandings[0].complete = false; },
                p => { p.result.learning[0].updated = []; }
            ]) changes.push(v => change(v.beforeReceipts[n]));
        for (const mutate of changes) {
            const v = copy(seed); mutate(v);
            // Empty attention is unchanged for ordinary unscoped sources.
            if (JSON.stringify(v) === JSON.stringify(seed)) continue;
            add('tampered-current-and-chain-materials', [v], [false]);
        }
        for (const receipt of seed.beforeReceipts.filter(p => required.has(p.result.input.id))) {
            const index = seed.beforeReceipts.indexOf(receipt), changes = [
                p => { p.context.scene = 'changed'; }, p => { p.context.elapsed = -1; },
                p => { p.result.interpretations[0].word = 'changed'; },
                p => { p.result.interpretations[0].inferred = true; },
                p => { p.beforeKnowledge.relations.find(r => r.id === 'naming').source = 'experienced_relation'; }
            ];
            if (receipt.result.interpretations[0].kind !== 'naming') changes.push(
                p => { p.result.understandings[0].wordExplanation.basis = {}; },
                p => { p.beforeKnowledge.meanings.find(m => m.id === p.result.understandings[0].known.meaning).source = 'changed'; }
            );
            else changes.push(p => { p.result.understandings[0].target.adopted.id = 'berry:2'; },
                p => { p.result.learning[0].adopted.target = 'berry:2'; });
            for (const mutate of changes) { const v = copy(seed); mutate(v.beforeReceipts[index]);
                add('original-time-basis-and-correspondence-tampering', [v], [false]); }
        }
        const corrects = seed.result.understandings[0].corrects;
        if (seed.beforeKnowledge.wordExplanations.some(e => e.inputId === corrects)) for (const mutate of [
            e => { e.corrects = 'input:999'; }, e => { e.retractedBy = 'input:999'; },
            e => { e.input.raw = 'changed'; }, e => { e.basis = {}; },
            e => { e.scope.targets = ['berry:999']; }
        ]) { const v = copy(seed); mutate(v.beforeKnowledge.wordExplanations.find(e => e.inputId === corrects));
            add('current-original-entry-tampering', [v], [false]); }
        for (const event of seed.beforeExperiences.filter(e => seed.result.understandings[0].wordExplanation.basis.evidence?.some(b => b.experienceId === e.id)))
            for (const field of ['id', 'target', 'activity', 'start', 'end', event.activity === 'work' ? 'demonstration' : 'lifeLabels']) {
                const v = copy(seed); v.beforeExperiences.find(e => e.id === event.id)[field] = null;
                add('current-meaning-original-experience-tampering', [v], [false]);
            }
    }
    return out;
}
module.exports = { fixtures, hear, setup, contrast };
