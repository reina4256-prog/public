'use strict';
// Existing owner forms generated in disposable memory, never player saves.
const original = require('./diary_berry_report_fixtures');
const { setup, hearBerry, core, catalog, raw } = original;
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const berry of [false, true]) for (const report of [false, true]) for (const speech of ['short', 'gesture'])
        for (const prefix of ['', '\u305d\u3053\u306b', '\u3053\u3053\u306b', '\u3042\u305d\u3053\u306b'])
            for (const particle of ['', '\u304c']) for (const verb of ['\u843d\u3061\u3066\u3044\u308b', '\u843d\u3061\u3066\u308b', '\u3042\u308b'])
                for (const suffix of ['', '\u306d', '\u3088', '\u3088\u306d']) {
                    const v = setup({ speech });
                    if (!berry) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
                    if (!report) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
                    add('existing-forms-knowledge-matrix', hearBerry(v, `${prefix}\u6728\u306e\u5b9f${particle}${verb}${suffix}`), !berry || !report);
                }
    // Explicit old negative groups now adopted by bn; other au cases stay out.
    for (const f of original.fixtures()) add(`au:${f.group}`, f.value,
        ['real-experienced-report-scope-not-transferred', 'missing-required-meaning-or-relation'].includes(f.group)
        || f.group === 'eight-settings' && !f.expected);
    for (const missing of ['berry', 'report', 'both']) for (const speech of ['short', 'gesture']) {
        const make = () => {
            const v = setup({ speech });
            if (missing !== 'report') v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
            if (missing !== 'berry') v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
            return v;
        };
        for (const attention of [null, 'shade', 'berry:1', 'berry:99']) {
            const v = make(); v.world.attention = attention;
            add('missing-knowledge-attention', hearBerry(v), true);
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(); v.world.mode = mode;
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('missing-knowledge-activity-empty-attention', hearBerry(v), true);
        }
        add('missing-knowledge-actual-speaker', hearBerry(make(), raw, { speaker: 'visitor', at: 987654321 }), true);
        for (const locale of Object.keys(catalog.patterns))
            add('missing-knowledge-locale', hearBerry(make(), raw, { locale }), locale === 'ja');
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
            add('missing-knowledge-single-punctuation', hearBerry(make(), text), true);
        for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `,
            'There are berries', '\u8fd9\u91cc\u6709\u6d46\u679c', 'Hier liegen Beeren',
            '\u4f11\u3080\u3068\u6c17\u6301\u3061\u3044\u3044', '\u304a\u306f\u3088\u3046', '\u3046\u3093',
            '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u3044\u3063\u3057\u3087\u306b\u4f11\u3082\u3046',
            '\u6628\u65e5\u306f\u4ed5\u4e8b\u3067\u5931\u6557\u3057\u305f\u3051\u3069\u4eca\u306f\u3046\u308c\u3057\u3044'])
            add('missing-knowledge-other-owners-and-outside-forms', hearBerry(make(), text), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearBerry, core, catalog, raw };
