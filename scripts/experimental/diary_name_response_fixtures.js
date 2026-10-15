'use strict';
// Existing owner forms, exercised in disposable memory only; no new display text.
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = { name: 'これをころって呼ぼう', yes: 'うん', no: '違う', correction: 'さっきの説明は間違えた' };
function setup(options = {}) {
    const v = { state: core.create(options, catalog), world: worldApi.create(), steps: [] };
    focus(v); return v;
}
function focus(v, scene = 'clearing', ids = ['berry:1']) {
    core.perceive(v.state, { scene, attention: ids.map(id => ({ id, meaning: 'berry' })) });
}
function hear(v, raw, options = {}) {
    const beforeState = copy(v.state), beforeWorld = copy(v.world);
    const result = core.receive(v.state, raw, catalog, { locale: 'ja', speaker: 'player', at: 100 + v.state.serial, ...options });
    const reply = worldApi.respond(v.world, result, v.state, catalog);
    const step = copy({ result, receipt: { input: result.input, inputKnowledge: beforeState.knowledge,
        inputContext: beforeState.context, beforeState, beforeWorld, afterState: v.state, afterWorld: v.world, reply } });
    const id = result.understandings[0]?.replyTo?.inputId || result.understandings[0]?.corrects;
    const origin = v.steps.find(item => item.result.input.id === id);
    const value = copy(step);
    if (origin) value.receipt.origin = origin;
    if (v.steps.length) value.receipt.antecedent = v.steps.at(-1);
    v.steps.push(step);
    return value;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        for (const type of ['yes', 'no', 'correction']) {
            const v = setup({ foundation, life, speech }); hear(v, forms.name);
            add(`${type}-eight-settings`, hear(v, forms[type]), foundation && (type === 'correction' || speech === 'short'));
        }
    }
    for (const raw of ['うん', 'そう', 'そうだよ', 'そうだね', 'はい', 'そうそう',
        '違う', 'ちがう', '違うよ', 'ちがうよ', 'ううん', 'さっきの説明は間違いだった']) {
        const v = setup(); hear(v, forms.name); add('existing-japanese-aliases', hear(v, raw), true);
    }
    for (const locale of Object.keys(catalog.patterns)) {
        const v = setup(); hear(v, forms.name);
        add('other-locale-no-new-grammar', hear(v, forms.yes, { locale }), locale === 'ja');
    }
    for (const type of ['yes', 'no', 'correction']) {
        const v = setup(); hear(v, forms.name);
        add('different-speaker', hear(v, forms[type], { speaker: 'visitor' }), false);
        const n = setup(); add('missing-antecedent', hear(n, forms[type]), false);
        const x = setup(); hear(x, forms.name); hear(x, 'unrecognized unrelated input');
        add('intervening-input', hear(x, forms[type]), false);
        const p = setup(); hear(p, forms.name); focus(p, 'elsewhere', ['berry:2']);
        add('changed-current-attention', hear(p, forms[type]), true);
    }
    for (const type of ['yes', 'no']) {
        const v = setup(); hear(v, forms.name); hear(v, 'ころ');
        add('reference-reasks-original-name', hear(v, forms[type]), true);
        const n = setup(); hear(n, forms.name); hear(n, forms.yes);
        add('second-reply-no-pending', hear(n, forms[type]), false);
        const m = setup(); hear(m, forms.name); focus(m, 'shore'); hear(m, forms.name);
        add('other-active-evidence-survives', hear(m, forms[type]), true);
    }
    {
        const v = setup(); hear(v, forms.name); focus(v, 'shore'); hear(v, forms.name);
        add('correction-other-active-evidence-survives', hear(v, forms.correction), true);
        const n = setup(); hear(n, forms.name); hear(n, forms.name);
        add('repeated-naming-without-new-record-is-not-latest-retractable-record', hear(n, forms.correction), false);
        const p = setup(); hear(p, forms.name); hear(p, forms.correction);
        add('already-retracted', hear(p, forms.correction), false);
        const a = setup(); focus(a, 'clearing', ['berry:1', 'berry:2']); hear(a, forms.name);
        add('ambiguous-original-naming', hear(a, forms.correction), false);
    }
    for (const raw of ['おはよう', 'いま何をしているの？', 'ぽぽは休むことだよ', '休もう',
        'さっき間違えた。ころは木の実のことだよ', 'うん、休もう', '違う、休もう']) {
        const v = setup(); hear(v, forms.name); add('other-owner-or-multiple-clauses', hear(v, raw), false);
    }
    return all;
}
module.exports = { setup, focus, hear, forms, fixtures };
