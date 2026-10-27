'use strict';
// Disposable actual receiver/responder executions. No game or player save caller.
const base = require('./diary_incomplete_retraction_material_fixtures');
const activities = require('./diary_complete_other_speaker_proposal_fixtures');
const { setup, hear, core, worldApi, catalog, copy, life } = base;
const raw = '未知';
function arrival(options = {}) {
    const v = setup(options);
    if (!worldApi.approach(v.world, 'berry:1')) throw new Error('Cannot approach fixture target');
    let event = null;
    for (let i = 0; i < 500 && !event; i++) event = worldApi.tick(v.world, .1);
    if (event?.kind !== 'arrive') throw new Error('Missing actual arrival');
    core.perceive(v.state, worldApi.perception(v.world));
    worldApi.onArrival(v.world, v.state, event);
    return v;
}
function fixtures() {
    const all = [], add = (group, v, text = raw, options = {}, expected = true) =>
        all.push({ group, value: hear(v, text, options), expected });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const foundation of [false, true]) for (const knownLife of [false, true])
            for (const text of ['未知', '未知\n未解析', '疲れたら泳ごう', '食べ終わったら休んでね'])
                add('unknown-eight-settings', setup({ foundation, life: knownLife, speech }), text, { speaker });
        for (const text of ['未知\n未解析\n不明', Array(12).fill('未知').join('\n'), ' 未知。未解析？ ',
            'unknown content', '未解析123', 'うん', '違う', 'はい', 'ううん'])
            add('multiple-spans-and-no-antecedent-replies', setup({ speech }), text, { speaker });
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2']]) {
            const v = setup({ speech });
            core.perceive(v.state, { scene: 'clearing', attention: ids.map(id => ({ id, meaning: 'berry' })) });
            add('attention-cardinality:' + ids.length, v, raw, { speaker });
        }
        for (const previous of ['未知', '木の実がある', '休んでね', 'これをころって呼ぼう']) {
            const v = setup({ speech }); hear(v, previous, { speaker });
            add('actual-antecedent:' + previous, v, '未解析\n未知', { speaker });
        }
        for (const mode of ['eat', 'berry-low', 'berry-high', 'no-target', 'no-route', 'moving-no-route'])
            add('actual-activity:' + mode, activities.prepared(mode, { speech }), raw, { speaker });
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v);
            add('actual-completed-experience:' + mode, v, raw, { speaker });
        }
        add('actual-arrival-output', arrival({ speech }), '木の実', { speaker });
        add('actual-dynamic-name-answer', arrival({ speech }), 'ころ', { speaker }, speech !== 'short' || speaker !== 'player');
        for (const text of ['休んでね', 'おはよう', '木の実がある', '未知\n休んでね', 'おはよう\n未知',
            'これをころって呼ぼう', 'これをころって呼ぼう\nこれをぽぽって呼ぼう',
            'さっきの説明は間違えた', '何を手伝った？', 'ぽぽは休むことだよ'])
            add('recognized-clause-remains-outside', setup({ speech }), text, { speaker }, false);
        for (const locale of Object.keys(catalog.patterns)) if (locale !== 'ja')
            add('other-input-locale', setup({ speech }), raw, { speaker, locale }, false);
    }
    return all;
}
module.exports = { fixtures, setup, hear, core, worldApi, catalog, copy, life, arrival, raw };
