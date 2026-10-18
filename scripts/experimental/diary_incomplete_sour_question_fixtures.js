'use strict';
// Disposable owner calls only. Existing Japanese grammar and real acquired scopes.
const base = require('./diary_sour_question_fixtures');
const { setup, hear, eat, core, catalog } = base;
const copy = value => JSON.parse(JSON.stringify(value));
function make(mask = 1, options = {}) {
    const v = setup(options);
    for (const [bit, field, id] of [[1, 'meanings', 'eat'], [2, 'relations', 'question'], [4, 'relations', 'negation']])
        if (mask & bit) v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (let mask = 0; mask < 8; mask++) for (const speech of ['short', 'gesture']) {
        for (const word of ['\u3059\u3063\u3071\u304f\u306a\u3044', '\u9178\u3063\u3071\u304f\u306a\u3044'])
            for (const ending of ['', '\u306e', '\u304b\u306a']) for (const mark of ['?', '\uff1f'])
                add(`knowledge-mask-${mask}-${speech}`, hear(make(mask, { speech }), word + ending + mark), mask !== 0);
        for (const meal of [false, true]) {
            const v = setup({ speech }); if (meal) eat(v);
            for (const [bit, field, id] of [[1, 'meanings', 'eat'], [2, 'relations', 'question'], [4, 'relations', 'negation']])
                if (mask & bit) v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
            add('completed-meal-not-understanding', hear(v), mask !== 0);
        }
    }
    for (const speech of ['short', 'gesture']) {
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales', hear(make(7, { speech }), undefined, { locale }), locale === 'ja');
        for (const raw of ['Is it sour?', '\u9178\u4e0d\u9178\uff1f', 'Ist das sauer?',
            '\u3059\u3063\u3071\u304f\u306a\u3044', '\u3059\u3063\u3071\u304f\u306a\u3044\u3002',
            '\u3059\u3063\u3071\u304f\u306a\u3044\uff1f\u3059\u3063\u3071\u304f\u306a\u3044\uff1f',
            '\u3059\u3063\u3071\u304f\u306a\u3044\uff1f\n\u4f11\u3082\u3046', '\u3059\u3063\u3071\u304f\u306a\u3044\uff1f ',
            '\u3053\u308c\u306f\u4f55', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f', '\u304a\u306f\u3088\u3046'])
            add('foreign-multiclause-other-inputs', hear(make(7, { speech }), raw), false);
        add('actual-speaker-time', hear(make(1, { speech }), undefined, { speaker: 'visitor', at: 76543 }), true);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(7, { speech }); v.world.mode = mode;
            v.state.context.attention = []; add('activity-empty-attention', hear(v), true);
        }
    }
    for (const f of base.fixtures()) {
        const { result } = f.value, frame = result.interpretations[0], u = result.understandings[0];
        add(`be:${f.group}`, copy(f.value), result.input.locale === 'ja' && result.interpretations.length === 1
            && frame.catalogRule === 'sour_question'
            && u.unresolved.some(e => e.type === 'meaning' && e.token === 'eat'
                || e.type === 'relation' && ['question', 'negation'].includes(e.id)));
    }
    return all;
}
module.exports = { fixtures, make, setup, hear, eat, core, catalog };
