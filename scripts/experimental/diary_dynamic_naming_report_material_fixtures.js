'use strict';
// Actual arrival, receiver and responder in disposable memory only.
const base = require('./diary_mixed_reference_material_fixtures');
const dynamic = require('./diary_dynamic_individual_reference_material_fixtures');
const { hear, focus, core, worldApi, catalog, copy, life } = base;
const raw = 'ころ\nもも\n私は悲しい';
function setup(options = {}) { const v = base.setup(options); dynamic.arrive(v); return v; }
function expected(value) {
    const r = value.result, frames = r.interpretations, us = r.understandings;
    const isDynamic = f => f.kind === 'naming' && !Object.hasOwn(f, 'catalogRule');
    const isNaming = f => isDynamic(f) || f.kind === 'naming' && ['name', 'name_description', 'name_answer'].includes(f.catalogRule);
    const isReport = f => f.kind === 'report' && ['feeling_report', 'external_event_report'].includes(f.catalogRule) && !f.relations.includes('contrast');
    return r.input.locale === 'ja' && frames.some(isDynamic) && frames.some(isReport)
        && frames.every(f => isNaming(f) || isReport(f) || f.kind === 'unknown')
        && frames.filter((f, i) => f.kind === 'naming' && us[i].complete).length !== 1
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment;
}
function fixtures() {
    const rows = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const report of ['私は悲しい', '今はうれしい', '私はつらい', '今日料理で失敗した', '今日料理で成功してうれしい'])
                for (const reverse of [false, true]) add('settings-reports-order', setup({ foundation, life: knownLife, speech }),
                    (reverse ? [report, 'ころ', 'もも'] : ['ころ', 'もも', report]).join('\n'), { speaker });
    for (const id of ['naming', 'report', 'time', 'reason']) for (const text of ['ころ\n私は悲しい', raw]) {
        const v = setup(); v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== id);
        add('missing-relation:' + id, v, text);
    }
    for (const id of ['sad', 'happy', 'failure', 'success']) {
        const v = setup(); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(r => r.id !== id);
        add('missing-meaning', v, 'ころ\nもも\n今日料理で失敗して悲しい');
    }
    for (const state of ['fresh', 'expired', 'consumed', 'missing-attention', 'ambiguous-attention', 'changed-attention'])
        for (const text of ['ころ\n私は悲しい', raw]) {
            const v = setup();
            if (state === 'expired') { hear(v, '未解析!'); hear(v, '未解析!'); }
            if (state === 'consumed') hear(v, 'ころ');
            if (state === 'missing-attention') focus(v, []);
            if (state === 'ambiguous-attention') focus(v, ['berry:1', 'berry:2']);
            if (state === 'changed-attention') focus(v, ['berry:2']);
            add('pending:' + state, v, text);
        }
    for (const text of ['ころ\nこれをののって呼ぼう\n私は悲しい', 'ころ\nこれはののだよ\n私は悲しい',
        'ころ\nののっていうんだ\n私は悲しい', 'ころ\nもも\n未知!\n私は悲しい',
        'ころ\nころ\n私は悲しい', raw.replaceAll('\n', '。'), Array(4).fill(raw).join('\n')]) add('mixed-forms-and-repetition', setup(), text);
    for (const text of ['私は悲しい', '今日料理で失敗した', '未知!']) {
        const v = base.setup(); hear(v, text); dynamic.arrive(v); add('actual-antecedent', v);
    }
    for (const mode of ['rest', 'eat']) {
        const v = base.setup(); life.start(v, mode); life.finish(v); focus(v); dynamic.arrive(v); add('completed-activity', v);
    }
    for (const text of ['ころ\nもも\nぴ・ぴ\n私は悲しい', 'ころ\nもも\nぽぽ\n私は悲しい',
        'ころ\nもも\nさっきの説明は間違えた\n私は悲しい', 'ころ\nもも\nおはよう\n私は悲しい',
        'ころ\nもも\n昨日は悲しかったけど今はうれしい']) add('other-recognition-boundary', dynamic.prepare(), text);
    for (const text of ['私は悲しい', '私は悲しい\nおはよう', 'これをころって呼ぼう\n私は悲しい',
        'これをころって呼ぼう\nこれをももって呼ぼう\n私は悲しい', raw]) add('prior-owner-no-arrival', base.setup(), text);
    for (const text of ['ころ\nもも', 'ころ\nもも\nおはよう', 'ころ\n私は悲しい']) add('prior-dynamic-owner', setup(), text);
    for (const locale of Object.keys(catalog.patterns)) add('locale-control', setup(), raw, { locale });
    return rows;
}
module.exports = { fixtures, expected, setup, hear, focus, core, worldApi, catalog, copy, life, raw, arrive: dynamic.arrive };
