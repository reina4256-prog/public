'use strict';
// Real owner receipts in disposable memory; no game callers or player data.
const original = require('./diary_preference_report_fixtures');
const { setup, hearPreference, core, catalog, forms, named, name } = original;
const copy = value => JSON.parse(JSON.stringify(value));
const deictic = '\u3053\u308c\u304c\u597d\u304d';
function make(options = {}) {
    const v = setup(options);
    core.perceive(v.state, { scene: 'shore', attention: [] });
    return v;
}
const hear = (v, raw = deictic, options = {}) => hearPreference(v, raw, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const speech of ['short', 'gesture']) {
        for (const subject of ['', '\u79c1\u306f', '\u308f\u305f\u3057\u306f'])
            for (const particle of ['\u304c', '\u306f'])
                for (const meaning of ['\u597d\u304d', '\u5acc\u3044'])
                    for (const ending of ['', '\u3060\u3088', '\u3067\u3059', '\u3060'])
                        add('japanese-existing-forms-unresolved', hear(make({ speech }), `${subject}\u3053\u308c${particle}${meaning}${ending}`), true);
        for (const attention of [[], [{ id: 'berry:1', meaning: 'berry' }],
            [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = make({ speech }); core.perceive(v.state, { scene: 'shore', attention });
            add('deictic-empty-single-ambiguous', hear(v), attention.length !== 1);
        }
        for (const [locale, raw] of Object.entries(forms)) {
            const v = make({ speech }); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
            add('seven-locales-target-meaning-unknown', hear(v, raw, { locale }), true);
            add('seven-locales-complete-az', hear(make({ speech }), raw, { locale }), false);
            const base = copy(v);
            for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}!`])
                add('existing-normalization', hear(copy(base), text, { locale }), true);
            for (const text of [`${raw}?`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
                add('questions-and-multiple-clauses', hear(copy(base), text, { locale }), false);
            add('actual-speaker-time', hear(copy(base), raw, { locale, speaker: 'visitor', at: 987654321 }), true);
            for (let mask = 1; mask < 4; mask++) {
                const missing = copy(base);
                if (mask & 1) missing.state.knowledge.meanings = missing.state.knowledge.meanings.filter(e => e.id !== 'like');
                if (mask & 2) missing.state.knowledge.relations = missing.state.knowledge.relations.filter(e => e.id !== 'report');
                add('missing-meaning-or-report-stays-bs', hear(missing, raw, { locale }), false);
            }
        }
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make({ speech }); v.world.mode = mode;
            add('activity-not-speaker-preference-or-action', hear(v), true);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make({ speech }); v.world.hunger = hunger;
            add('hunger-not-speaker-truth', hear(v), true);
        }
        for (const speaker of ['player', 'visitor']) for (const attention of [[],
            [{ id: 'berry:1', meaning: 'berry' }], [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = named({ speech }, ['berry:1', 'berry:2']);
            core.perceive(v.state, { scene: 'shore', attention });
            add('actual-naming-competition-and-speaker', hear(v, `${name}\u304c\u597d\u304d`, { speaker }), speaker !== 'player' || attention.length !== 1);
        }
    }
    for (const f of original.fixtures()) {
        const u = f.value.result.understandings[0];
        add(`az:${f.group}`, f.value, u.kind === 'report' && u.unresolved.length === 1 && u.unresolved[0].type === 'target');
        if (f.group === 'real-experienced-report-scope-not-transferred') {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('real-rest-report-scope-not-transferred-with-target-missing', hear(v), false);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hear, core, catalog, forms };
