'use strict';
// Only disposable owner-generated materials. Antecedents are flat copies.
const { setup, hear: receive, core, catalog } = require('./diary_greeting_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const raw = '\u4f53\u529b\u3084\u7720\u6c17\u304c\u56de\u5fa9\u3059\u308b\u304b\u3089';
const topic = '\u4f11\u3080\u3053\u3068\u306f\u5927\u4e8b';
function prior(v, text = topic, options = {}) {
    v.antecedent = receive(v, text, options); return v.antecedent;
}
function hearExplanation(v, text = raw, options = {}) {
    const antecedent = v.antecedent && copy(v.antecedent);
    const value = receive(v, text, options);
    if (antecedent) value.receipt.antecedent = antecedent;
    v.antecedent = copy(value); delete v.antecedent.receipt.antecedent;
    return value;
}
function prepared(options = {}) { const v = setup(options); prior(v); return v; }
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hearExplanation(prepared({ foundation, life, speech })), foundation && life);
    for (const prefix of ['', '\u3046\u3093', '\u3046\u3093\u3001', '\u3046\u3093,', '\u3046\u3093 '])
        for (const suffix of ['', '\u306d']) for (const speech of ['short', 'gesture'])
            add('existing-japanese-forms', hearExplanation(prepared({ speech }), prefix + raw + suffix), true);
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales-no-new-grammar', hearExplanation(prepared(), raw, { locale }), locale === 'ja');
    for (const text of ['Because resting restores energy', 'Weil Ruhe erholt', 'Rest restores energy'])
        add('foreign-forms-not-added', hearExplanation(prepared(), text), false);
    for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
        add('questions-and-multiple-clauses', hearExplanation(prepared(), text), false);
    for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
        add('single-trim-and-terminal-punctuation', hearExplanation(prepared(), text), true);
    for (const text of [topic, '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044',
        '\u6728\u306e\u5b9f\u304c\u3042\u308b', '\u304a\u306f\u3088\u3046', '\u3046\u3093',
        '\u4f11\u3082\u3046', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u3082\u3046\u4e00\u5ea6\u8a00\u3063\u3066'])
        add('other-owners-and-outside-reports', hearExplanation(prepared(), text), false);
    add('no-antecedent', hearExplanation(setup()), false);
    for (const text of ['\u304a\u306f\u3088\u3046', '\u6728\u306e\u5b9f\u304c\u3042\u308b']) {
        const v = setup(); prior(v, text);
        add('non-rest-antecedent', hearExplanation(v), false);
    }
    for (const speech of ['short', 'gesture']) {
        const v = prepared({ speech }); prior(v, '\u304a\u306f\u3088\u3046');
        add('intervening-input', hearExplanation(v), false);
        const other = setup({ speech }); prior(other, topic, { speaker: 'visitor' });
        add('prior-speaker-not-restricted-by-owner', hearExplanation(other), true);
        add('current-speaker-initial-understanding', hearExplanation(prepared({ speech }), raw, { speaker: 'visitor' }), true);
        const empty = prepared({ speech }); core.perceive(empty.state, { scene: 'shore', attention: [] }); empty.world.attention = null;
        add('changed-scene-and-no-target', hearExplanation(empty, raw, { at: 987654321 }), true);
    }
    // The owner gate requires a known rest topic, not one particular aw form.
    for (const speech of ['short', 'gesture']) for (const text of ['\u4f11\u3082\u3046', catalog.reportTeaching.ja.self.utterance, topic]) {
        const v = setup({ speech }); prior(v, text);
        add('different-known-rest-antecedents', hearExplanation(v), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) for (const speech of ['short', 'gesture']) {
        const v = prepared({ speech }); v.world.mode = mode;
        add('activity-does-not-prove-recovery-or-cause', hearExplanation(v), true);
    }
    for (const fatigue of [0, .2, .4, .8, 1]) {
        const v = prepared(); v.world.fatigue = fatigue;
        add('fatigue-does-not-resolve-explanation', hearExplanation(v), true);
    }
    for (const missing of ['rest', 'report', 'reason']) {
        const v = prepared(), list = missing === 'rest' ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(item => item.id !== missing);
        add('missing-current-required-meaning-or-relation', hearExplanation(v), false);
    }
    const report = require('./diary_negation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ speech }); report.learnReport(v, 'ja'); prior(v);
        add('real-experienced-report-scope-not-transferred', hearExplanation(v), false);
    }
    const reason = require('./diary_known_reason_explanation_fixtures');
    for (const speech of ['short', 'gesture']) {
        const v = report.setup({ speech }); reason.prepareReason(v);
        const learned = v.state.knowledge.relations.filter(item => item.id === 'reason');
        v.state.knowledge.relations = [...setup().state.knowledge.relations.filter(item => item.id !== 'reason'), ...learned];
        prior(v);
        add('real-experienced-reason-scope-not-transferred', hearExplanation(v), false);
    }
    return all;
}
module.exports = { fixtures, setup, prepared, prior, hearExplanation, core, catalog, raw, topic };
