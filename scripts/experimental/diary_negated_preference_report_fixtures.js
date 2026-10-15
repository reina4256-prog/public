'use strict';
// Existing owner inputs in disposable Node memory; no UI or save connection.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const forms = ['\u6728\u306e\u5b9f\u306f\u5acc\u3044\u3058\u3083\u306a\u3044',
    '\u6728\u306e\u5b9f\u306f\u5acc\u3044\u3067\u306f\u306a\u3044',
    '\u5acc\u3044\u3058\u3083\u306a\u3044', '\u5acc\u3044\u3067\u306f\u306a\u3044'];
const hearPreference = (v, text = forms[0], options = {}) => hear(v, text, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearPreference(setup({ foundation, life, speech })), foundation && life);
    for (const text of forms) for (const speech of ['short', 'gesture'])
        add('four-existing-forms-two-speech-settings', hearPreference(setup({ speech }), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearPreference(setup(), forms[0], { locale }), locale === 'ja');
    for (const [locale, text] of [['en', 'I do not dislike berries'], ['zh-CN', '\u6211\u4e0d\u8ba8\u538c\u6d46\u679c'], ['de', 'ich mag beeren nicht']])
        add('foreign-forms-not-added', hearPreference(setup(), text, { locale }), false);
    for (const text of forms) {
        for (const suffix of ['?', `\u3002${text}`, `\n${text}`])
            add('questions-and-multiple-clauses', hearPreference(setup(), text + suffix), false);
        add('period-followed-by-unknown-space', hearPreference(setup(), ` ${text}\u3002 `), false);
        for (const normalized of [` ${text} `, `${text}\u3002`, `${text}!`])
            add('existing-trim-and-terminal-punctuation', hearPreference(setup(), normalized), true);
    }
    for (const text of ['\u6728\u306e\u5b9f\u304c\u597d\u304d', '\u6728\u306e\u5b9f\u306f\u5acc\u3044',
        '\u4eca\u306f\u3044\u3089\u306a\u3044', '\u305d\u308c\u3092\u98df\u3079\u306a\u3044\u3067',
        '\u98df\u3079\u7d42\u308f\u3063\u305f\u3089\u6563\u6b69\u3057\u3088\u3046', '\u304a\u306f\u3088\u3046',
        '\u4f11\u3082\u3046', '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f'])
        add('other-owners-and-outside-this-scope', hearPreference(setup(), text), false);
    for (const speech of ['short', 'gesture']) for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
        [{ id: 'berry:2', meaning: 'berry' }], [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) {
        for (const explicit of [true, false]) {
            const v = setup({ speech }); core.perceive(v.state, { scene: 'shore', attention }); v.world.attention = null;
            add(explicit ? 'explicit-general-target-independent-of-attention' : 'omitted-target-owner-attention-uniqueness',
                hearPreference(v, forms[explicit ? 0 : 2], { at: 987654321 }), explicit || attention.length === 1);
        }
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-not-liking-or-cancellation', hearPreference(v), true);
    }
    for (const hunger of [0, .25, .5, .75, 1]) {
        const v = setup(); v.world.hunger = hunger;
        add('hunger-not-satiety-or-speaker-verification', hearPreference(v), true);
    }
    for (const missing of ['dislike', 'berry', 'report', 'negation']) {
        const v = setup(), list = ['dislike', 'berry'].includes(missing) ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('each-required-meaning-target-or-relation', hearPreference(v), false);
    }
    for (const speech of ['short', 'gesture']) {
        add('initial-knowledge-other-speaker', hearPreference(setup({ speech }), forms[0], { speaker: 'visitor' }), true);
        const v = setup({ speech }); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(item => item.id !== 'berry');
        add('omitted-target-does-not-require-berry-meaning', hearPreference(v, forms[2]), true);
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ life: true, speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearPreference(v), false);
        const n = report.setup({ foundation: true, life: true, speech });
        n.state.knowledge.relations = n.state.knowledge.relations.filter(item => item.id !== 'negation');
        for (const side of ['positive', 'negative']) {
            report.start(n, side === 'negative' ? 'eat' : 'rest'); report.hear(n, report.demo(side)); report.finish(n);
        }
        require('node:assert/strict').ok(n.state.knowledge.relations.some(item => item.id === 'negation' && item.source === 'experienced_relation'));
        add('real-experienced-negation-scope-not-transferred', hearPreference(n), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearPreference, core, catalog, forms };
