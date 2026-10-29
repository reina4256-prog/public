'use strict';
// Actual receiver/responder and original naming/explanation receipts in disposable memory.
const base = require('./diary_mixed_reference_material_fixtures');
const extras = require('./diary_additional_clause_material_fixtures');
const { core, worldApi, catalog, copy, life, focus, setup, prepare, hear } = base;
const raw = 'ぴぴ\nぽぽ\n私は悲しい';
function expected(value) {
    const r = value.result, frames = r.interpretations;
    const report = f => f.kind === 'report' && ['feeling_report', 'external_event_report'].includes(f.catalogRule)
        && !f.relations.includes('contrast');
    return r.input.locale === 'ja' && frames.some(f => ['reference', 'word_reference'].includes(f.kind))
        && frames.some(report) && frames.every(f => ['unknown', 'reference', 'word_reference'].includes(f.kind) || report(f))
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment;
}
function fixtures() {
    const rows = [];
    const add = (group, v, text, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        for (const speaker of ['player', 'visitor']) for (const reference of ['ぴぴ', 'ぽぽ', 'ぴぴ\nぽぽ'])
            for (const report of ['私は悲しい', '今日料理で失敗した']) for (const reverse of [false, true])
                add('settings', prepare({ foundation, life, speech }, 'normal', speaker),
                    (reverse ? [report, reference] : [reference, report]).join('\n'), { speaker });
    for (const variant of ['two-targets', 'multiple-evidence', 'meaning-conflict', 'same-meaning', 'chain',
        'individual-conflict', 'shared-origin', 'individual-corrected'])
        for (const reference of ['ぴぴ', 'ぽぽ', 'ぴぴ\nぽぽ']) add('source:' + variant, prepare({}, variant), reference + '\n私は悲しい');
    for (const [field, id] of [['relations', 'report'], ['relations', 'naming'], ['relations', 'time'],
        ['meanings', 'sad'], ['meanings', 'failure']]) for (const reference of ['ぴぴ', 'ぽぽ', 'ぴぴ\nぽぽ']) {
        const v = prepare(); v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
        add('missing:' + id, v, reference + '\n私は悲しい');
    }
    for (const text of ['ぴぴ\nぴぴ\n私は悲しい', 'ぴぴ\nぽぽ\n未知!\n私は悲しい',
        'ぽぽ\n今日料理で失敗した\n私は悲しい', raw, '私は悲しい\nぽぽ\nぴぴ']) add('repetition-unknown', prepare(), text);
    for (const text of ['私は疲れた', '私はつらい', '昨日は悲しかった', '今はうれしい', '私は疲れている',
        '今日料理で成功してうれしい', '今日料理で失敗した', '私は悲しい']) add('report-details', prepare(), 'ぴぴ\nぽぽ\n' + text);
    for (const mode of ['rest', 'eat']) for (const speech of ['short', 'gesture']) {
        const v = prepare({ speech }); life.start(v, mode); life.finish(v); focus(v); add('actual-experience:' + mode, v, raw);
    }
    for (const locale of Object.keys(catalog.patterns)) add('locale', prepare(), raw, { locale });
    for (const text of ['ぴぴ', 'ぽぽ', 'ぴぴ\nぽぽ', '私は悲しい', '私は悲しい\nおはよう',
        'ぴぴ\nおはよう', 'ぽぽ\nおはよう', 'これをころって呼ぼう\n私は悲しい',
        'これをころって呼ぼう\nこれをももって呼ぼう\n私は悲しい', 'ぽぽは休むことだよ\n私は悲しい',
        'さっきの説明は間違えた\n私は悲しい', 'うん\n私は悲しい', 'ぴぴ\n昨日は悲しかったけど今はうれしい'])
        add('old-owner-boundary', prepare(), text);
    for (const companion of [...extras.anchors, 'おはよう', ...Object.values(extras.forms),
        'これをののって呼ぼう', 'さっきの説明は間違えた', 'うん']) add('other-companion-boundary', prepare(), raw + '\n' + companion);
    return rows;
}
module.exports = { fixtures, expected, raw, setup, prepare, hear, focus, life, core, worldApi, catalog, copy };
