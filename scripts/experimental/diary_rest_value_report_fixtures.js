'use strict';
// Existing owner forms in disposable memory; no game/save connection.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const raw = '\u4f11\u3080\u3053\u3068\u306f\u5927\u4e8b';
const hearValue = (v, text = raw, options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearValue(setup({ foundation, life, speech })), foundation && life);
    for (const verb of ['\u4f11\u3080', '\u3084\u3059\u3080']) for (const noun of ['\u3053\u3068', '\u306e'])
        for (const suffix of ['', '\u3060\u3088', '\u3060\u306d', '\u3060', '\u3067\u3059']) for (const speech of ['short', 'gesture'])
            add('existing-japanese-forms', hearValue(setup({ speech }), `${verb}${noun}\u306f\u5927\u4e8b${suffix}`), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearValue(setup(), raw, { locale }), locale === 'ja');
    for (const text of ['Rest is important', '\u4f11\u606f\u5f88\u91cd\u8981', 'Ruhe ist wichtig'])
        add('foreign-forms-not-added', hearValue(setup(), text), false);
    for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
        add('questions-and-multiple-clauses', hearValue(setup(), text), false);
    for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
        add('single-trim-and-terminal-punctuation', hearValue(setup(), text), true);
    for (const text of ['\u4f53\u529b\u3084\u7720\u6c17\u304c\u56de\u5fa9\u3059\u308b\u304b\u3089',
        '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044', '\u4f11\u3080\u306e\u306f\u5927\u4e8b\u306d',
        '\u4eca\u306f\u3046\u308c\u3057\u3044', '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u304a\u306f\u3088\u3046',
        '\u3046\u3093', '\u4f11\u3082\u3046', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u3082\u3046\u4e00\u5ea6\u8a00\u3063\u3066'])
        add('other-owners-and-outside-reports', hearValue(setup(), text), false);
    for (const speech of ['short', 'gesture']) {
        add('different-speaker-initial-understanding', hearValue(setup({ speech }), raw, { speaker: 'visitor' }), true);
        const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] }); v.world.attention = null;
        add('no-target-required', hearValue(v, raw, { at: 987654321 }), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-does-not-prove-importance', hearValue(v), true);
    }
    for (const fatigue of [0, .2, .4, .8, 1]) {
        const v = setup(); v.world.fatigue = fatigue;
        add('fatigue-does-not-resolve-importance-or-cause', hearValue(v), true);
    }
    for (const missing of ['rest', 'report']) {
        const v = setup(), list = missing === 'rest' ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('missing-required-meaning-or-relation', hearValue(v), false);
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearValue(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearValue, core, catalog, raw };
