'use strict';
// Existing owner forms in disposable Node memory; no UI or user save.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const raw = '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044';
const hearComfort = (v, text = raw, options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearComfort(setup({ foundation, life, speech })), foundation && life);
    for (const word of ['\u6c17\u6301\u3061\u3044\u3044', '\u304d\u3082\u3061\u3044\u3044', '\u5fc3\u5730\u3088\u3044'])
        for (const suffix of ['', '\u3088\u306d', '\u306d', '\u3088']) for (const speech of ['short', 'gesture'])
            add('existing-japanese-forms', hearComfort(setup({ speech }), `\u6a2a\u306b\u306a\u308b\u3068${word}${suffix}`), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearComfort(setup(), raw, { locale }), locale === 'ja');
    for (const text of ['Lying down feels good', '\u8eba\u4e0b\u5f88\u8212\u670d', 'Liegen ist angenehm'])
        add('foreign-forms-not-added', hearComfort(setup(), text), false);
    for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
        add('questions-and-multiple-clauses', hearComfort(setup(), text), false);
    for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
        add('single-trim-and-terminal-punctuation', hearComfort(setup(), text), true);
    for (const text of ['\u4f11\u3080\u3053\u3068\u306f\u5927\u4e8b', '\u4f53\u529b\u3084\u7720\u6c17\u304c\u56de\u5fa9\u3059\u308b\u304b\u3089',
        '\u4f11\u3080\u3068\u6c17\u6301\u3061\u3044\u3044', '\u4eca\u306f\u3046\u308c\u3057\u3044', '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u304a\u306f\u3088\u3046',
        '\u3046\u3093', '\u4f11\u3082\u3046', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u3082\u3046\u4e00\u5ea6\u8a00\u3063\u3066'])
        add('other-owners-and-outside-reports', hearComfort(setup(), text), false);
    for (const speech of ['short', 'gesture']) {
        add('different-speaker-initial-understanding', hearComfort(setup({ speech }), raw, { speaker: 'visitor' }), true);
        const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention: [] }); v.world.attention = null;
        add('no-target-required', hearComfort(v, raw, { at: 987654321 }), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-does-not-prove-personal-comfort', hearComfort(v), true);
    }
    for (const fatigue of [0, .2, .4, .8, 1]) {
        const v = setup(); v.world.fatigue = fatigue;
        add('fatigue-does-not-resolve-condition-or-cause', hearComfort(v), true);
    }
    for (const missing of ['comfortable', 'rest', 'report', 'condition']) {
        const v = setup(), list = ['comfortable', 'rest'].includes(missing) ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('missing-required-meaning-or-relation', hearComfort(v), false);
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearComfort(v), false);
    }
    const condition = require('./diary_condition_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ speech }); condition.prepare(v, 'ja');
        for (const status of ['met', 'unmet']) {
            condition.start(v, status === 'met' ? .8 : .2);
            condition.hear(v, condition.demo(status, 'ja'), 'ja'); report.finish(v);
        }
        // Isolate real learned condition scope while other prerequisites are initial.
        const learned = v.state.knowledge.relations.find(item => item.id === 'condition');
        v.state.knowledge.relations = setup().state.knowledge.relations.filter(item => item.id !== 'condition').concat(learned);
        add('real-experienced-condition-scope-not-transferred', hearComfort(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearComfort, core, catalog, raw };
