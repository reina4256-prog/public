'use strict';
// Owner-generated material in disposable Node memory; no user save or UI.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const raw = '\u6728\u306e\u5b9f\u304c\u843d\u3061\u3066\u3044\u308b';
const hearBerry = (v, text = raw, options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, v, expected) => all.push({ group, value: v, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearBerry(setup({ foundation, life, speech })), foundation && life);
    for (const prefix of ['', '\u305d\u3053\u306b', '\u3053\u3053\u306b', '\u3042\u305d\u3053\u306b'])
        for (const particle of ['', '\u304c']) for (const verb of ['\u843d\u3061\u3066\u3044\u308b', '\u843d\u3061\u3066\u308b', '\u3042\u308b'])
            for (const suffix of ['', '\u306d', '\u3088', '\u3088\u306d'])
                add('existing-japanese-forms', hearBerry(setup(), `${prefix}\u6728\u306e\u5b9f${particle}${verb}${suffix}`), true);
    for (const speech of ['short', 'gesture']) for (const attention of [null, 'shade', 'berry:1', 'berry:99']) {
        const v = setup({ speech }); v.world.attention = attention;
        add('actual-speech-and-attention-branches', hearBerry(v), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = setup(); v.world.mode = mode;
        add('activity-does-not-prove-observation', hearBerry(v), true);
    }
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearBerry(setup(), raw, { locale }), locale === 'ja');
    for (const text of ['There are berries', '\u8fd9\u91cc\u6709\u6d46\u679c', 'Hier liegen Beeren'])
        add('foreign-forms-not-added', hearBerry(setup(), text), false);
    for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`,
        ` ${raw}\u3002 `, '\u4f11\u3080\u3068\u6c17\u6301\u3061\u3044\u3044', '\u304a\u306f\u3088\u3046',
        '\u3046\u3093', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u3082\u3046\u4e00\u5ea6\u8a00\u3063\u3066', '\u3044\u3063\u3057\u3087\u306b\u4f11\u3082\u3046'])
        add('other-owners-questions-and-multiple-clauses', hearBerry(setup(), text), false);
    for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
        add('single-trim-and-terminal-punctuation', hearBerry(setup(), text), true);
    for (const speech of ['short', 'gesture']) {
        const v = setup({ speech });
        add('different-speaker-initial-understanding', hearBerry(v, raw, { speaker: 'visitor' }), true);
        core.perceive(v.state, { scene: 'shore', attention: [] });
        add('no-target-or-fact-inference', hearBerry(v, raw, { at: 987654321 }), true);
        const noFruit = setup({ speech }); noFruit.world.fruit = 0; noFruit.world.attention = 'berry:1';
        add('reply-is-not-fruit-verification', hearBerry(noFruit), true);
    }
    const report = require('./diary_negation_fixtures');
    for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = report.setup({ life, speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearBerry(v), false);
    }
    for (const missing of ['berry', 'report']) {
        const v = setup();
        const list = missing === 'berry' ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('missing-required-meaning-or-relation', hearBerry(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearBerry, core, catalog, raw };
