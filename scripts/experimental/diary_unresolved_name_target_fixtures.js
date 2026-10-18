'use strict';
// Existing owner calls in disposable memory, with explicit expected boundaries.
const base = require('./diary_name_question_fixtures');
const { core, catalog, setup, focus, hear } = base;
const copy = value => JSON.parse(JSON.stringify(value));
function make(options = {}, ids = []) {
    const v = setup(options); focus(v, 'clearing', ids); return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(make({ foundation, life, speech })), foundation);
    for (const speech of ['short', 'gesture']) {
        for (const ids of [[], ['berry:1', 'berry:2']])
            for (const target of ['\u3053\u308c', '\u305d\u308c']) for (const particle of ['', '\u306f'])
                for (const ending of ['\u4f55', '\u306a\u306b', '\u306a\u3093\u3066\u547c\u3076\u306e', '\u4f55\u3066\u547c\u3076\u306e'])
                    for (const suffix of ['', '?', '\uff1f', '\u3002', '\uff01'])
                        add('existing-japanese-forms-empty-or-multiple-attention', hear(make({ speech }, ids), target + particle + ending + suffix), true);
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2'], ['shade'], ['shade', 'path']]) {
            add('target-only-versus-complete', hear(make({ speech }, ids)), ids.length !== 1);
            const v = make({ speech }, ids); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'question');
            add('bz-missing-relation-with-any-target', hear(v), false);
        }
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales-no-new-grammar', hear(make({ speech }), undefined, { locale }), locale === 'ja');
        for (const raw of ['What is this?', '\u8fd9\u662f\u4ec0\u4e48\uff1f', 'Was ist das?',
            '\u3053\u308c\u306f\u4f55\u3002\u4f11\u3082\u3046', '\u3053\u308c\u306f\u4f55\n\u4f11\u3082\u3046',
            ' \u3053\u308c\u306f\u4f55\u3002 ', '\u3044\u307e\u4f55\u3057\u3066\u308b\uff1f',
            '\u3059\u3063\u3071\u304f\u306a\u3044\uff1f', '\u304a\u306f\u3088\u3046', '\u3046\u3093', '\u3053\u308d'])
            add('other-owners-and-multiple-clauses', hear(make({ speech }), raw), false);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make({ speech }); v.world.mode = mode;
            add('activities-never-select-target', hear(v), true);
        }
        add('actual-speaker-and-time', hear(make({ speech }), undefined, { speaker: 'visitor', at: 123456 }), true);
        for (const confirmed of [false, true]) for (const ids of [[], ['berry:1', 'berry:2']]) {
            const v = base.named({ speech }, confirmed); focus(v, 'clearing', ids);
            add('real-name-and-confirmation-never-select-target', hear(v), true);
        }
    }
    // Include every original bd and bz fixture, including actual current_activity teaching.
    for (const [owner, source] of [['bd', base], ['bz', require('./diary_incomplete_name_question_fixtures')]]) {
        for (const f of source.fixtures()) {
            const v = f.value, u = v.result.understandings[0], frame = v.result.interpretations[0];
            add(`${owner}:${f.group}`, copy(v), v.result.input.locale === 'ja'
                && v.result.interpretations.length === 1 && frame.catalogRule === 'name_question'
                && u.kind === 'question' && u.unresolved.length === 1 && u.unresolved[0].type === 'target');
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, focus, hear, core, catalog };
