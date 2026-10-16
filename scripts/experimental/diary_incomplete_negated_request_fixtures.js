'use strict';
// Existing owner forms, in disposable memory; no game/save connection.
const original = require('./diary_negated_request_fixtures');
const { setup, hearRequest, core, catalog, forms } = original;
function make(mask, speech = 'short') {
    const v = setup({ speech });
    if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'eat');
    if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'request');
    if (mask & 4) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'negation');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (let mask = 0; mask < 8; mask++) for (const raw of forms) for (const speech of ['short', 'gesture']) {
        add('twelve-forms-eight-knowledge-settings', hearRequest(make(mask, speech), raw), mask !== 0);
        for (const normalized of [` ${raw} `, `${raw}\u3002`, `${raw}!`, `${raw}?`, `${raw}\uff1f`])
            add('existing-normalization-including-question-punctuation', hearRequest(make(mask, speech), normalized), mask !== 0);
        for (const suffix of [`\u3002${raw}`, `\n${raw}`])
            add('multiple-clauses', hearRequest(make(mask, speech), raw + suffix), false);
        add('period-followed-by-space', hearRequest(make(mask, speech), ` ${raw}\u3002 `), false);
        add('actual-speaker-time', hearRequest(make(mask, speech), raw, { speaker: 'visitor', at: 987654321 }), mask !== 0);
    }
    for (let mask = 0; mask < 8; mask++) for (const speech of ['short', 'gesture']) {
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }], [{ id: 'berry:2', meaning: 'berry' }],
            [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) {
            for (const explicit of [true, false]) {
                const v = make(mask, speech); core.perceive(v.state, { scene: 'shore', attention });
                add(explicit ? 'general-target-independent-of-attention' : 'deictic-target-unresolved-coexists',
                    hearRequest(v, forms[explicit ? 8 : 0]), mask !== 0);
            }
        }
        for (const explicit of [true, false]) {
            const v = make(mask, speech); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
            add(explicit ? 'target-meaning-alone-not-sufficient' : 'deictic-target-no-berry-prerequisite',
                hearRequest(v, forms[explicit ? 8 : 0]), mask !== 0);
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make(mask, speech); v.world.mode = mode;
            add('activity-not-cancellation-or-compliance', hearRequest(v), mask !== 0);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make(mask, speech); v.world.hunger = hunger;
            add('hunger-not-speaker-desire', hearRequest(v), mask !== 0);
        }
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales-no-new-grammar', hearRequest(make(mask, speech), forms[0], { locale }), locale === 'ja' && mask !== 0);
        for (const raw of ['\u98df\u3079\u306a\u3044\u3067', '\u305d\u308c\u3092\u98df\u3079\u308b\u306a',
            '\u6728\u306e\u5b9f\u306f\u5acc\u3044\u3058\u3083\u306a\u3044', '\u4eca\u306f\u3044\u3089\u306a\u3044',
            '\u98df\u3079\u7d42\u308f\u3063\u305f\u3089\u6563\u6b69\u3057\u3088\u3046', '\u304a\u306f\u3088\u3046', 'Do not eat that'])
            add('other-owners-and-foreign-forms', hearRequest(make(mask, speech), raw), false);
    }
    for (const f of original.fixtures()) {
        if (f.expected) {
            const v = { state: JSON.parse(JSON.stringify(f.value.receipt.beforeState)), world: JSON.parse(JSON.stringify(f.value.receipt.beforeWorld)) };
            v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'negation');
            add(`bb-missing-negation:${f.group}`, hearRequest(v, f.value.result.input.raw, f.value.result.input), true);
        } else {
            const u = f.value.result.understandings[0];
            const deficient = f.value.result.interpretations.length === 1
                && f.value.result.interpretations[0].catalogRule === 'do_not_eat'
                && u.unresolved.some(e => e.type === 'meaning' || e.type === 'relation');
            add(`bb:${f.group}`, f.value, deficient);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hearRequest, core, catalog, forms };
