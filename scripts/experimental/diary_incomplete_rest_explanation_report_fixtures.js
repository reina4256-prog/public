'use strict';
// Disposable owner-generated materials; knowledge is changed only between inputs.
const original = require('./diary_rest_explanation_report_fixtures');
const { setup, prepared, prior, hearExplanation, core, catalog, raw, topic } = original;
function make(mask = 1, speech = 'short', priorText = topic) {
    const v = setup({ speech }); prior(v, priorText);
    for (const [bit, id] of ['rest', 'report', 'reason'].entries()) if (mask & (1 << bit)) {
        const key = bit === 0 ? 'meanings' : 'relations';
        v.state.knowledge[key] = v.state.knowledge[key].filter(e => e.id !== id);
    }
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const prefix of ['', '\u3046\u3093', '\u3046\u3093\u3001', '\u3046\u3093,', '\u3046\u3093 '])
        for (const suffix of ['', '\u306d']) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 8; mask++)
            add('existing-forms-knowledge-matrix', hearExplanation(make(mask, speech), prefix + raw + suffix), mask !== 0);
    for (const f of original.fixtures()) add(`ax:${f.group}`, f.value,
        f.group.includes('scope-not-transferred') || f.group === 'missing-current-required-meaning-or-relation'
        || f.group === 'eight-settings' && !f.expected && f.value.result.interpretations[0].catalogRule === 'rest_explanation');
    for (let mask = 1; mask < 8; mask++) for (const speech of ['short', 'gesture']) {
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(mask, speech); v.world.mode = mode;
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('missing-knowledge-activity-empty-attention', hearExplanation(v), true);
        }
        for (const fatigue of [0, .2, .4, .8, 1]) {
            const v = make(mask, speech); v.world.fatigue = fatigue;
            add('missing-knowledge-fatigue-no-causal-inference', hearExplanation(v), true);
        }
        add('missing-knowledge-actual-speaker', hearExplanation(make(mask, speech), raw, { speaker: 'visitor', at: 987654321 }), true);
        const other = setup({ speech }); prior(other, topic, { speaker: 'visitor' });
        other.state.knowledge.relations = other.state.knowledge.relations.filter(e => e.id !== 'reason');
        add('prior-speaker-not-restricted', hearExplanation(other), true);
        for (const text of ['\u4f11\u3082\u3046', catalog.reportTeaching.ja.self.utterance])
            add('different-known-rest-antecedents', hearExplanation(make(mask, speech, text)), true);
        for (const locale of Object.keys(catalog.patterns))
            add('missing-knowledge-locale', hearExplanation(make(mask, speech), raw, { locale }), locale === 'ja');
        for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`])
            add('missing-knowledge-single-punctuation', hearExplanation(make(mask, speech), text), true);
        for (const text of [`${raw}\uff1f`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `,
            'Because resting restores energy', 'Weil Ruhe erholt', topic, '\u6728\u306e\u5b9f\u304c\u3042\u308b',
            '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044', '\u304a\u306f\u3088\u3046', '\u4f11\u3082\u3046'])
            add('missing-knowledge-other-owners-and-outside-forms', hearExplanation(make(mask, speech), text), false);
        add('missing-knowledge-no-antecedent', hearExplanation(setup({ foundation: false, speech })), false);
        for (const priorText of ['\u304a\u306f\u3088\u3046', '\u6728\u306e\u5b9f\u304c\u3042\u308b'])
            add('missing-knowledge-non-rest-antecedent', hearExplanation(make(mask, speech, priorText)), false);
        const unknownPrior = setup({ life: false, speech }); prior(unknownPrior);
        add('prior-rest-meaning-not-understood', hearExplanation(unknownPrior), false);
    }
    return all;
}
module.exports = { fixtures, setup, prepared, make, prior, hearExplanation, core, catalog, raw };
