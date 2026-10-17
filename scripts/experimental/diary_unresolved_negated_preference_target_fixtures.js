'use strict';
// Existing owner receipts in disposable memory; no game/save callers.
const original = require('./diary_negated_preference_report_fixtures');
const { setup, hearPreference, core, catalog, forms } = original;
const copy = value => JSON.parse(JSON.stringify(value));
function make(options = {}) {
    const v = setup(options);
    core.perceive(v.state, { scene: 'shore', attention: [] });
    return v;
}
const hear = (v, raw = forms[2], options = {}) => hearPreference(v, raw, options);
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const speech of ['short', 'gesture']) {
        for (let mask = 0; mask < 8; mask++) for (const raw of forms) {
            const base = make({ speech });
            if (mask & 1) base.state.knowledge.meanings = base.state.knowledge.meanings.filter(e => e.id !== 'dislike');
            if (mask & 2) base.state.knowledge.relations = base.state.knowledge.relations.filter(e => e.id !== 'report');
            if (mask & 4) base.state.knowledge.relations = base.state.knowledge.relations.filter(e => e.id !== 'negation');
            // Explicit unknown berry and omitted empty attention both lack only a target at mask zero.
            base.state.knowledge.meanings = base.state.knowledge.meanings.filter(e => e.id !== 'berry');
            add('four-forms-eight-knowledge-settings', hear(copy(base), raw), mask === 0);
            for (const text of [` ${raw} `, `${raw}\u3002`, `${raw}!`])
                add('existing-normalization', hear(copy(base), text), mask === 0);
            for (const text of [`${raw}?`, `${raw}\u3002${raw}`, `${raw}\n${raw}`, ` ${raw}\u3002 `])
                add('questions-and-multiple-clauses', hear(copy(base), text), false);
        }
        for (const attention of [[], [{ id: 'shade', meaning: 'rest' }], [{ id: 'berry:1', meaning: 'berry' }],
            [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
            for (const raw of forms) for (const berryKnown of [false, true]) {
                const v = make({ speech }); core.perceive(v.state, { scene: 'shore', attention });
                if (!berryKnown) v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => e.id !== 'berry');
                add('general-or-omitted-target-attention-and-meaning', hear(v, raw), forms.indexOf(raw) < 2 ? !berryKnown : attention.length !== 1);
            }
        }
        for (const locale of Object.keys(catalog.patterns)) for (const raw of forms)
            add('seven-locales-no-new-grammar', hear(make({ speech }), raw, { locale }), locale === 'ja' && forms.indexOf(raw) >= 2);
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = make({ speech }); v.world.mode = mode;
            add('activity-not-preference-or-cancellation', hear(v), true);
        }
        for (const hunger of [0, .25, .5, .75, 1]) {
            const v = make({ speech }); v.world.hunger = hunger;
            add('hunger-not-speaker-truth', hear(v), true);
        }
        add('actual-speaker-time', hear(make({ speech }), forms[2], { speaker: 'visitor', at: 987654321 }), true);
        // Real naming records compete only within the original speaker scope.
        const named = make({ speech });
        named.state.knowledge.meanings = named.state.knowledge.meanings.filter(e => e.id !== 'berry');
        for (const id of ['berry:1', 'berry:2']) {
            core.perceive(named.state, { scene: 'shore', attention: [{ id, meaning: 'berry' }] });
            hear(named, '\u3053\u308c\u3092\u6728\u306e\u5b9f\u3063\u3066\u547c\u307c\u3046');
        }
        require('node:assert/strict').deepEqual(
            named.state.knowledge.associations.map(link => link.target).sort(), ['berry:1', 'berry:2']);
        for (const speaker of ['player', 'visitor']) for (const attention of [[], [{ id: 'berry:1', meaning: 'berry' }],
            [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }]]) {
            const v = copy(named); core.perceive(v.state, { scene: 'shore', attention });
            add('real-naming-competition-and-speaker', hear(v, forms[0], { speaker }), speaker !== 'player' || attention.length !== 1);
        }
    }
    for (const f of original.fixtures()) {
        const u = f.value.result.understandings[0];
        add(`ba:${f.group}`, f.value, u.kind === 'report' && u.unresolved.length === 1 && u.unresolved[0].type === 'target');
        if (f.group.startsWith('real-experienced-')) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld) };
            core.perceive(v.state, { scene: 'shore', attention: [] });
            add('real-rest-relation-scope-not-transferred-with-target-missing', hear(v), false);
        }
    }
    return all;
}
module.exports = { fixtures, make, setup, hear, core, catalog, forms };
