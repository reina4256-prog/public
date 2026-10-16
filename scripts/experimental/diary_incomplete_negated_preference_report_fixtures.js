'use strict';
// Existing Japanese owner forms and disposable states only; no game/save caller.
const original = require('./diary_negated_preference_report_fixtures');
const { setup, hearPreference, core, catalog, forms } = original;
function make(mask, speech = 'short') {
    const v = setup({ speech });
    if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'dislike');
    if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
    if (mask & 4) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'negation');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (let mask = 0; mask < 8; mask++) for (const raw of forms) for (const speech of ['short', 'gesture']) {
        add('four-forms-eight-knowledge-settings', hearPreference(make(mask, speech), raw), mask !== 0);
        for (const normalized of [` ${raw} `, `${raw}\u3002`, `${raw}!`])
            add('existing-normalization', hearPreference(make(mask, speech), normalized), mask !== 0);
        for (const suffix of ['?', `\u3002${raw}`, `\n${raw}`])
            add('questions-multiple-clauses', hearPreference(make(mask, speech), raw + suffix), false);
        add('actual-speaker-time', hearPreference(make(mask, speech), raw, { speaker: 'visitor', at: 987654321 }), mask !== 0);
    }
    for (let mask = 0; mask < 8; mask++) for (const speech of ['short', 'gesture']) {
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
            [{ id: 'berry:2', meaning: 'berry' }], [{ id: 'shade', meaning: 'rest' }, { id: 'berry:2', meaning: 'berry' }]]) {
            for (const explicit of [true, false]) {
                const v = make(mask, speech); core.perceive(v.state, { scene: 'shore', attention });
                add(explicit ? 'general-target-independent-of-attention' : 'omitted-target-unresolved-coexists',
                    hearPreference(v, forms[explicit ? 0 : 2]), mask !== 0);
            }
        }
        const v = make(mask, speech); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
        add('target-meaning-alone-not-sufficient', hearPreference(v), mask !== 0);
        const omitted = make(mask, speech); omitted.state.knowledge.meanings = omitted.state.knowledge.meanings.filter(e => e.id !== 'berry');
        add('omitted-target-no-berry-prerequisite', hearPreference(omitted, forms[2]), mask !== 0);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const active = make(mask, speech); active.world.mode = mode;
            add('activity-not-preference-or-cancellation', hearPreference(active), mask !== 0);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const hungry = make(mask, speech); hungry.world.hunger = hunger;
            add('hunger-not-speaker-truth', hearPreference(hungry), mask !== 0);
        }
        for (const locale of Object.keys(catalog.patterns))
            add('seven-locales-no-new-grammar', hearPreference(make(mask, speech), forms[0], { locale }), locale === 'ja' && mask !== 0);
        for (const raw of ['\u6728\u306e\u5b9f\u304c\u597d\u304d', '\u6728\u306e\u5b9f\u306f\u5acc\u3044',
            '\u4eca\u306f\u3044\u3089\u306a\u3044', '\u305d\u308c\u3092\u98df\u3079\u306a\u3044\u3067',
            '\u4f11\u3082\u3046', '\u304a\u306f\u3088\u3046', 'I do not dislike berries'])
            add('other-owners-and-foreign-forms', hearPreference(make(mask, speech), raw), false);
    }
    for (const f of original.fixtures()) {
        if (f.expected) {
            const v = { state: JSON.parse(JSON.stringify(f.value.receipt.beforeState)), world: JSON.parse(JSON.stringify(f.value.receipt.beforeWorld)) };
            v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'negation');
            const input = f.value.result.input;
            add(`ba-missing-negation:${f.group}`, hearPreference(v, input.raw, input), true);
        } else {
            const deficient = f.group === 'eight-settings' || f.group.startsWith('real-experienced-')
                || f.group === 'each-required-meaning-target-or-relation' && f.value.result.understandings[0].unresolved.some(e => e.type !== 'target');
            add(`ba:${f.group}`, f.value, deficient);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hearPreference, core, catalog, forms };
