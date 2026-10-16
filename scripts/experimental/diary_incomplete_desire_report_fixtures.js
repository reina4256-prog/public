'use strict';
// Existing owner inputs in disposable memory, never game or player save data.
const original = require('./diary_desire_report_fixtures');
const { setup, hearDesire, core, catalog, forms } = original;
function make(mask, speech = 'short') {
    const value = setup({ speech });
    for (const [bit, id] of ['eat', 'report', 'negation', 'time'].entries()) if (mask & (1 << bit)) {
        const key = bit ? 'relations' : 'meanings';
        value.state.knowledge[key] = value.state.knowledge[key].filter(entry => entry.id !== id);
    }
    return value;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const raw of forms) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 16; mask++)
        add('existing-two-forms-knowledge-matrix', hearDesire(make(mask, speech), raw), mask !== 0);
    for (const f of original.fixtures()) add(`ay:${f.group}`, f.value,
        f.group.includes('scope-not-transferred') || f.group === 'each-required-meaning-or-relation'
        || f.group === 'eight-settings' && !f.expected);
    for (let mask = 1; mask < 16; mask++) for (const speech of ['short', 'gesture']) {
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(mask, speech); v.world.mode = mode;
            core.perceive(v.state, { scene: 'shore', attention: [] }); v.world.attention = null;
            add('missing-knowledge-activity-empty-attention', hearDesire(v), true);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make(mask, speech); v.world.hunger = hunger;
            add('missing-knowledge-hunger-no-satiety-inference', hearDesire(v), true);
        }
        add('missing-knowledge-actual-speaker', hearDesire(make(mask, speech), forms[1],
            { speaker: 'visitor', at: 987654321 }), true);
        for (const locale of Object.keys(catalog.patterns))
            add('missing-knowledge-locale', hearDesire(make(mask, speech), forms[0], { locale }), locale === 'ja');
        for (const raw of forms) {
            for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
                add('missing-knowledge-single-punctuation', hearDesire(make(mask, speech), text), true);
            for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
                add('missing-knowledge-questions-and-multiple-clauses', hearDesire(make(mask, speech), text), false);
        }
        for (const text of ['I do not want to eat now', '\u73b0\u5728\u4e0d\u60f3\u5403', 'Jetzt will ich nicht essen',
            '\u6728\u306e\u5b9f\u304c\u597d\u304d', '\u5acc\u3044\u3058\u3083\u306a\u3044',
            '\u305d\u308c\u3092\u98df\u3079\u306a\u3044\u3067', '\u304a\u306f\u3088\u3046', '\u4f11\u3082\u3046',
            '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u4f11\u3080\u306e\u306f\u5927\u4e8b',
            '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044',
            '\u4f53\u529b\u3084\u7720\u6c17\u304c\u56de\u5fa9\u3059\u308b\u304b\u3089',
            '\u3046\u3093', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u4eca\u306f\u3046\u308c\u3057\u3044'])
            add('missing-knowledge-other-owners-and-outside-forms', hearDesire(make(mask, speech), text), false);
    }
    return all;
}
module.exports = { fixtures, make, setup, hearDesire, core, catalog, forms };
