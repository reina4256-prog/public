'use strict';
// Existing owner inputs, including real name evidence, in disposable Node memory.
const { setup, hear, core, catalog } = require('./diary_greeting_fixtures');
const forms = {
    ja: '\u6728\u306e\u5b9f\u304c\u597d\u304d', en: 'I like berries', 'zh-CN': '\u6211\u559c\u6b22\u6d46\u679c',
    ru: '\u043c\u043d\u0435 \u043d\u0440\u0430\u0432\u044f\u0442\u0441\u044f \u044f\u0433\u043e\u0434\u044b',
    'es-ES': 'me gustan las bayas', 'pt-BR': 'eu gosto de fruta', de: 'ich mag beeren'
};
const hearPreference = (v, text = forms.ja, options = {}) => hear(v, text, options);
const name = '\u30dd\u30dd';
function named(options = {}, ids = ['berry:1']) {
    const v = setup(options);
    for (const id of ids) {
        core.perceive(v.state, { scene: 'clearing', attention: [{ id, meaning: 'berry' }] });
        hear(v, `\u3053\u308c\u3092\u300c${name}\u300d\u3068\u547c\u307c\u3046`);
    }
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearPreference(setup({ foundation, life, speech })), foundation && life);
    for (const [locale, text] of Object.entries(forms)) for (const speech of ['short', 'gesture'])
        add('seven-existing-locales-and-expression', hearPreference(setup({ speech }), text, { locale }), true);
    for (const subject of ['', '\u79c1\u306f', '\u308f\u305f\u3057\u306f']) for (const particle of ['\u304c', '\u306f'])
        for (const meaning of ['\u597d\u304d', '\u5acc\u3044']) for (const ending of ['', '\u3060\u3088', '\u3067\u3059', '\u3060'])
            add('japanese-existing-preference-forms', hearPreference(setup(), `${subject}\u6728\u306e\u5b9f${particle}${meaning}${ending}`), true);
    for (const [locale, text] of Object.entries(forms)) {
        for (const suffix of ['?', `\u3002${text}`, `\n${text}`])
            add('questions-and-multiple-clauses', hearPreference(setup(), text + suffix, { locale }), false);
        add('period-followed-by-unknown-space', hearPreference(setup(), ` ${text}\u3002 `, { locale }), false);
        for (const normalized of [` ${text} `, `${text}\u3002`, `${text}!`])
            add('existing-trim-and-terminal-punctuation', hearPreference(setup(), normalized, { locale }), true);
        const v = setup(); core.perceive(v.state, { scene: 'shore', attention: [] }); v.world.attention = null;
        add('general-meaning-not-an-attended-individual', hearPreference(v, text, { locale, at: 987654321 }), true);
        add('initial-knowledge-different-speaker', hearPreference(setup(), text, { locale, speaker: 'visitor' }), true);
    }
    for (const text of ['I dislike berries', '\u6211\u8ba8\u538c\u6d46\u679c', 'ich mag beeren nicht'])
        add('foreign-dislike-forms-not-added', hearPreference(setup(), text, { locale: text.startsWith('I') ? 'en' : text.startsWith('ich') ? 'de' : 'zh-CN' }), false);
    for (const text of ['\u5acc\u3044\u3058\u3083\u306a\u3044', '\u6728\u306e\u5b9f\u306f\u5acc\u3044\u3067\u306f\u306a\u3044',
        '\u4eca\u306f\u3044\u3089\u306a\u3044', '\u305d\u308c\u3092\u98df\u3079\u306a\u3044\u3067', '\u304a\u306f\u3088\u3046',
        '\u4f11\u3082\u3046', '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u4f11\u3080\u306e\u306f\u5927\u4e8b',
        '\u3046\u3093', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f'])
        add('other-owners-and-unadopted-inputs', hearPreference(setup(), text), false);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); v.world.mode = mode;
        add('activity-not-preference-or-cancellation', hearPreference(v), true);
    }
    for (const hunger of [0, .25, .5, .75, 1]) {
        const v = setup(); v.world.hunger = hunger;
        add('hunger-not-satiety-or-speaker-verification', hearPreference(v), true);
    }
    for (const meaning of ['like', 'dislike']) for (const missing of [meaning, 'berry', 'report']) {
        const v = setup(), list = missing === 'report' ? 'relations' : 'meanings';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('required-meaning-target-or-report-missing', hearPreference(v,
            `\u6728\u306e\u5b9f\u304c${meaning === 'like' ? '\u597d\u304d' : '\u5acc\u3044'}`), false);
    }
    for (const word of ['\u98df\u3079\u7269', '\u6728\u9670', '\u77e5\u3089\u306a\u3044\u540d\u524d'])
        add('existing-lexical-target-resolution', hearPreference(setup(), `${word}\u304c\u597d\u304d`), word === '\u98df\u3079\u7269');
    for (const speech of ['short', 'gesture']) {
        add('real-name-single-target', hearPreference(named({ speech }), `${name}\u304c\u597d\u304d`), true);
        const moved = named({ speech }); core.perceive(moved.state, { scene: 'shore', attention: [] });
        add('real-name-no-attention-single-evidence', hearPreference(moved, `${name}\u306f\u5acc\u3044`), true);
        add('real-name-other-speaker-unresolved', hearPreference(named({ speech }), `${name}\u304c\u597d\u304d`, { speaker: 'visitor' }), false);
        for (const attention of [[], [{ id: 'berry:1', meaning: 'berry' }],
            [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = named({ speech }, ['berry:1', 'berry:2']); core.perceive(v.state, { scene: 'clearing', attention });
            add('real-name-competition-and-attention', hearPreference(v, `${name}\u304c\u597d\u304d`), attention.length === 1);
        }
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ life: true, speech }); report.learnReport(v, 'ja');
        add('real-experienced-report-scope-not-transferred', hearPreference(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, hearPreference, core, catalog, forms, named, name };
