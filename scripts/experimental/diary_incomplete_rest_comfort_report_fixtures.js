'use strict';
// Existing forms in disposable memory. No player data or runtime connection.
const original = require('./diary_rest_comfort_report_fixtures');
const { setup, hearComfort, core, catalog, raw } = original;
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    const make = (mask, speech = 'short') => {
        const v = setup({ speech });
        for (const [bit, id] of ['comfortable', 'rest', 'report', 'condition'].entries()) if (mask & (1 << bit)) {
            const key = bit < 2 ? 'meanings' : 'relations';
            v.state.knowledge[key] = v.state.knowledge[key].filter(e => e.id !== id);
        }
        return v;
    };
    for (const word of ['\u6c17\u6301\u3061\u3044\u3044', '\u304d\u3082\u3061\u3044\u3044', '\u5fc3\u5730\u3088\u3044'])
        for (const suffix of ['', '\u3088\u306d', '\u306d', '\u3088']) for (const speech of ['short', 'gesture'])
            for (let mask = 0; mask < 16; mask++)
                add('existing-forms-knowledge-matrix', hearComfort(make(mask, speech), `\u6a2a\u306b\u306a\u308b\u3068${word}${suffix}`), mask !== 0);
    // Only the explicitly adopted missing-prerequisite cases change ownership.
    for (const f of original.fixtures()) add(`av:${f.group}`, f.value,
        f.group.includes('scope-not-transferred') || f.group === 'missing-required-meaning-or-relation'
        || f.group === 'eight-settings' && !f.expected);
    for (let mask = 1; mask < 16; mask++) for (const speech of ['short', 'gesture']) {
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(mask, speech); v.world.mode = mode;
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('missing-knowledge-activity-empty-attention', hearComfort(v), true);
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            const v = make(mask, speech); v.world.fatigue = fatigue;
            add('missing-knowledge-fatigue-condition-unknown', hearComfort(v), true);
        }
        add('missing-knowledge-actual-speaker', hearComfort(make(mask, speech), raw, { speaker: 'visitor', at: 987654321 }), true);
        for (const locale of Object.keys(catalog.patterns))
            add('missing-knowledge-locale', hearComfort(make(mask, speech), raw, { locale }), locale === 'ja');
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
            add('missing-knowledge-single-punctuation', hearComfort(make(mask, speech), text), true);
        for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `,
            'Lying down feels good', '\u8eba\u4e0b\u5f88\u8212\u670d', 'Liegen ist angenehm',
            '\u4f11\u3080\u3068\u6c17\u6301\u3061\u3044\u3044', '\u4f11\u3080\u3053\u3068\u306f\u5927\u4e8b',
            '\u4f53\u529b\u3084\u7720\u6c17\u304c\u56de\u5fa9\u3059\u308b\u304b\u3089', '\u6728\u306e\u5b9f\u304c\u3042\u308b',
            '\u304a\u306f\u3088\u3046', '\u3046\u3093', '\u4f11\u3082\u3046', '\u4eca\u306f\u3046\u308c\u3057\u3044'])
            add('missing-knowledge-other-owners-and-outside-forms', hearComfort(make(mask, speech), text), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearComfort, core, catalog, raw };
