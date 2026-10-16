'use strict';
// Disposable owner-generated material. No UI strings, game callers or save data.
const original = require('./diary_preference_report_fixtures');
const { setup, hearPreference, core, catalog, forms, named, name } = original;
function make(mask, speech = 'short', meaning = 'like') {
    const v = setup({ speech });
    if (mask & 1) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== meaning);
    if (mask & 2) v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [locale, raw] of Object.entries(forms)) for (const speech of ['short', 'gesture'])
        for (let mask = 0; mask < 4; mask++) {
            add('seven-locales-knowledge-matrix', hearPreference(make(mask, speech), raw, { locale }), mask !== 0);
            for (const suffix of ['?', `\u3002${raw}`, `\n${raw}`])
                add('questions-multiple-clauses', hearPreference(make(mask, speech), raw + suffix, { locale }), false);
            for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}!`])
                add('existing-normalization', hearPreference(make(mask, speech), text, { locale }), mask !== 0);
            add('actual-speaker-time', hearPreference(make(mask, speech), raw, { locale, speaker: 'visitor', at: 987654321 }), mask !== 0);
        }
    for (const subject of ['', '\u79c1\u306f', '\u308f\u305f\u3057\u306f']) for (const particle of ['\u304c', '\u306f'])
        for (const meaning of ['like', 'dislike']) for (const ending of ['', '\u3060\u3088', '\u3067\u3059', '\u3060'])
            for (let mask = 0; mask < 4; mask++)
                add('japanese-preference-matrix', hearPreference(make(mask, 'short', meaning),
                    `${subject}\u6728\u306e\u5b9f${particle}${meaning === 'like' ? '\u597d\u304d' : '\u5acc\u3044'}${ending}`), mask !== 0);
    for (let mask = 0; mask < 4; mask++) for (const speech of ['short', 'gesture']) {
        for (const target of ['\u6728\u306e\u5b9f', '\u6728\u9670', '\u672a\u77e5\u540d', '\u3053\u308c']) {
            const v = make(mask, speech); core.perceive(v.state, { scene: 'shore', attention: [] });
            add('unresolved-target-not-sufficient', hearPreference(v, `${target}\u304c\u597d\u304d`), mask !== 0);
        }
        const v = make(mask, speech); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
        add('missing-target-meaning-not-sufficient', hearPreference(v), mask !== 0);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const active = make(mask, speech); active.world.mode = mode;
            add('activity-not-preference-or-action', hearPreference(active), mask !== 0);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const hungry = make(mask, speech); hungry.world.hunger = hunger;
            add('hunger-not-speaker-truth', hearPreference(hungry), mask !== 0);
        }
        for (const ids of [['berry:1'], ['berry:1', 'berry:2']]) {
            const n = named({ speech }, ids);
            n.state.knowledge = { ...n.state.knowledge, meanings: make(mask).state.knowledge.meanings,
                relations: make(mask).state.knowledge.relations };
            core.perceive(n.state, { scene: 'shore', attention: [] });
            add('real-name-evidence-and-competition', hearPreference(n, `${name}\u304c\u597d\u304d`), mask !== 0);
        }
    }
    for (const f of original.fixtures()) {
        // Reuse the exact accepted owner's before-state and input with report removed.
        if (!f.expected) { add(`az:${f.group}`, f.value, f.group === 'real-experienced-report-scope-not-transferred'
            || f.group === 'required-meaning-target-or-report-missing' && f.value.result.understandings[0].unresolved.some(e => e.type !== 'target')
            || f.group === 'eight-settings' && f.value.result.understandings[0].unresolved.some(e => e.type !== 'target')); continue; }
        const v = { state: JSON.parse(JSON.stringify(f.value.receipt.beforeState)), world: JSON.parse(JSON.stringify(f.value.receipt.beforeWorld)) };
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'report');
        const input = f.value.result.input;
        add(`az-missing-report:${f.group}`, hearPreference(v, input.raw, input), true);
    }
    return all;
}
module.exports = { fixtures, make, setup, hearPreference, core, catalog, forms };
