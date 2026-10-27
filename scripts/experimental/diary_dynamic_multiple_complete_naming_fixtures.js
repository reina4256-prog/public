'use strict';
// Real arrival, receiver and responder in disposable memory. No save or UI caller.
const base = require('./diary_all_unknown_material_fixtures');
const names = require('./diary_multiple_complete_naming_fixtures');
const { core, worldApi, catalog, copy, hear, life } = base;
const raw = 'ころ\nぽぽ';
function arrive(v, target = 'berry:1') {
    if (!worldApi.approach(v.world, target)) throw new Error('Cannot approach naming target');
    let event = null;
    for (let i = 0; i < 500 && !event; i++) event = worldApi.tick(v.world, .1);
    if (event?.kind !== 'arrive') throw new Error('Missing naming arrival');
    core.perceive(v.state, worldApi.perception(v.world));
    worldApi.onArrival(v.world, v.state, event);
    return v;
}
function setup(options = {}) { return arrive(base.setup(options)); }
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options), r = value.result;
        // Expected scope comes from the original receiver's results, not capture().
        const expected = r.input.locale === 'ja' && r.interpretations.length >= 2
            && r.interpretations.every((f, i) => f.kind === 'naming' && r.understandings[i].complete)
            && r.interpretations.some(f => !Object.hasOwn(f, 'catalogRule'));
        all.push({ group, value, expected });
    };
    const forms = [raw, 'ころ\nころ', 'ころ\nぽぽ\nもも', 'ころ\n未知',
        'これをころって呼ぼう\nぽぽ', 'ころ\nこれをぽぽって呼ぼう',
        'ころ\n木の実をぽぽって呼ぼう', 'ころ\nぽぽ\nおはよう',
        'おはよう\nころ\nぽぽ', 'ころ\nぽぽ\nさっきの説明は間違えた',
        'ころ\nぽぽ\n何を手伝った？', 'ころ\nぽぽ\nうん',
        'ころ\nぽぽ\n未解析!', 'ころ\nぽぽ\nぽぽは休むことだよ',
        'ころ', 'ころ\nぽぽ\n休んでね'];
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of forms) add('arrival-eight-settings-and-speakers',
                setup({ foundation, life: knownLife, speech }), text, { speaker });
    for (const text of forms) add('no-activity-question', names.setup(), text);
    for (const text of [Array(12).fill('ころ').join('\n'), ' ころ。ぽぽ？ ',
        'これを「ころ」と呼ぶよ。ぽぽ', 'ころ\nぽぽっていうんだ',
        'これはころだよ\nぽぽ', 'ころ\n未解析です', 'ころ\n123'])
        add('existing-forms-and-long-input', setup(), text);
    for (const previous of ['unrecognized unrelated input', 'これをももって呼ぼう'])
        for (const text of forms.slice(0, 7)) {
            const v = base.setup(); hear(v, previous); arrive(v);
            add('actual-input-before-arrival', v, text);
        }
    for (const text of forms.slice(0, 7)) {
        const v = setup(); hear(v, 'unrecognized unrelated input'); add('pending-after-an-input', v, text);
        const expired = setup(); hear(expired, 'unrecognized unrelated input'); hear(expired, 'unrecognized unrelated input');
        add('expired-pending', expired, text);
        const repeated = setup(); hear(repeated, text); add('input-after-name-response', repeated, text);
    }
    for (const ids of [[], ['berry:1', 'berry:2'], ['berry:2']]) {
        const v = setup(); core.perceive(v.state, { scene: 'clearing', attention: ids.map(id => ({ id, meaning: 'berry' })) });
        add('missing-ambiguous-or-changed-attention', v);
    }
    const missing = setup(); missing.state.knowledge.relations = missing.state.knowledge.relations.filter(r => r.id !== 'naming');
    add('missing-naming-relation', missing);
    for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
        add('other-input-locale', setup(), raw, { locale });
    for (const mode of ['rest', 'eat']) {
        const v = base.setup(); life.start(v, mode); life.finish(v); arrive(v);
        add('completed-experience-before-arrival:' + mode, v);
    }
    const selected = base.setup(); hear(selected, '休んでね'); arrive(selected);
    add('selection-before-arrival', selected);
    for (const text of ['これをころって呼ぼう\nこれをぽぽって呼ぼう',
        'これをころって呼ぼう\nこれをぽぽって呼ぼう\nおはよう', '未知\n未解析'])
        add('prior-owner-control', names.setup(), text);
    return all;
}
module.exports = { fixtures, setup, arrive, hear, core, worldApi, catalog, copy, life, raw };
