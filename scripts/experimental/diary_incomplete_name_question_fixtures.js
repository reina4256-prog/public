'use strict';
// Actual owner calls in disposable memory; no user storage or game wiring.
const base = require('./diary_name_question_fixtures');
const { core, catalog, setup, focus, hear } = base;
const copy = value => JSON.parse(JSON.stringify(value));
function make(options = {}) {
    const v = setup(options);
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'question');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life, speech })), !foundation);
    for (const speech of ['short', 'gesture']) {
        for (const target of ['\u3053\u308c', '\u305d\u308c']) for (const particle of ['', '\u306f'])
            for (const ending of ['\u4f55', '\u306a\u306b', '\u306a\u3093\u3066\u547c\u3076\u306e', '\u4f55\u3066\u547c\u3076\u306e'])
                for (const suffix of ['', '?', '\uff1f', '\u3002', '!'])
                    add('existing-japanese-forms', hear(make({ speech }), target + particle + ending + suffix), true);
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2'], ['shade']]) {
            const v = make({ speech }); focus(v, 'clearing', ids);
            add('missing-relation-with-resolved-or-unresolved-target', hear(v), true);
            const known = setup({ speech }); focus(known, 'clearing', ids);
            add('known-question-and-target-only-remain-outside', hear(known), false);
        }
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales-no-new-grammar', hear(make({ speech }), undefined, { locale }), locale === 'ja');
        for (const raw of ['What is this?', '\u8fd9\u662f\u4ec0\u4e48\uff1f', 'Was ist das?',
            '\u3053\u308c\u306f\u4f55\u3002\u4f11\u3082\u3046', '\u3053\u308c\u306f\u4f55\n\u4f11\u3082\u3046',
            ' \u3053\u308c\u306f\u4f55\u3002 ', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f',
            '\u3059\u3063\u3071\u304f\u306a\u3044\uff1f', '\u304a\u306f\u3088\u3046', '\u3046\u3093'])
            add('foreign-other-owner-and-multiple-clauses', hear(make({ speech }), raw), false);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make({ speech }); v.world.mode = mode;
            add('activity-is-not-an-answer', hear(v), true);
        }
        add('actual-speaker-and-time', hear(make({ speech }), undefined, { speaker: 'visitor', at: 123456 }), true);
        for (const confirmed of [false, true]) {
            const v = base.named({ speech }, confirmed);
            v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'question');
            add('actual-naming-does-not-supply-question-understanding', hear(v), true);
        }
    }
    // Reuse original bd owner fixtures, including actual acquired current_activity scope.
    // Expected classification is stated independently of the new capture implementation.
    for (const f of base.fixtures()) {
        const u = f.value.result.understandings[0], frame = f.value.result.interpretations[0];
        add(`bd:${f.group}`, copy(f.value), f.value.result.input.locale === 'ja'
            && f.value.result.interpretations.length === 1 && frame.catalogRule === 'name_question'
            && u.unresolved.some(e => e.type === 'relation' && e.id === 'question'));
    }
    return all;
}
module.exports = { fixtures, make, setup, focus, hear, core, catalog };
