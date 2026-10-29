'use strict';
// Actual receiver/responder in disposable memory; no player save or UI.
const base = require('./diary_reference_report_material_fixtures');
const { core, worldApi, catalog, copy, setup, focus, life } = base;
function hear(v, text, options = {}) {
    const value = base.hear(v, text, options), frames = value.result.interpretations;
    if (!frames.some(frame => frame.kind === 'reply')) delete value.receipt.origin;
    return value;
}
function expected(value) {
    const r = value.result, frames = r.interpretations;
    const report = frame => frame.kind === 'report' && ['feeling_report', 'external_event_report'].includes(frame.catalogRule)
        && !frame.relations.includes('contrast');
    const response = frame => ['correction', 'reply'].includes(frame.kind);
    return r.input.locale === 'ja' && frames.some(report) && frames.some(response)
        && frames.every(frame => report(frame) || response(frame) || frame.kind === 'unknown')
        && frames.every((frame, index) => !response(frame) || r.understandings[index].complete === false)
        && !r.learning.some(item => Object.hasOwn(item, 'retraction'))
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment;
}
function named(options = {}) { const v = setup(options); hear(v, 'これをころって呼ぼう'); return v; }
function fixtures() {
    const rows = [], add = (group, v, text, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true]) for (const speech of ['short', 'gesture']) {
        const options = { foundation, life: knownLife, speech };
        for (const previous of ['missing', 'named', 'intervening', 'other-speaker', 'retracted'])
            for (const form of ['さっきの説明は間違えた', 'うん', '違う']) {
                const seed = previous === 'missing' ? setup(options) : named(options);
                if (previous === 'intervening') hear(seed, '未知!');
                if (previous === 'retracted') hear(seed, 'さっきの説明は間違えた');
                const speaker = previous === 'other-speaker' ? 'visitor' : 'player';
                add('single:' + previous, copy(seed), form, { speaker });
                for (const report of ['私は悲しい', '今日料理で失敗した']) for (const reverse of [false, true])
                    add('mixed:' + previous, copy(seed), (reverse ? [report, form] : [form, report]).join('\n'), { speaker });
            }
        for (const form of ['ぽぽは休むことだよ', 'さっき間違えた。ぽぽは眠ることだよ',
            'ぽぽは休むことじゃなくて眠ることだよ', '教示'])
            for (const report of ['私は悲しい', '今日料理で失敗した']) for (const reverse of [false, true])
                add('word-form-control', base.prepare(options), (reverse ? [report, form] : [form, report]).join('\n'));
    }
    for (const text of ['さっきの説明は間違いだった\n私は悲しい',
        'さっきの説明は間違えた\nさっきの説明は間違えた\n私は悲しい',
        'うん\n違う\n私は悲しい', '私は悲しい\nそうだよ\n未知!',
        'さっきの説明は間違えた\nうん\n私は悲しい',
        'うん\n私は悲しい\n今日料理で失敗した',
        '未知!\nさっきの説明は間違えた\n私は悲しい',
        Array(4).fill('さっきの説明は間違えた\n私は悲しい').join('\n')])
        add('repetition-aliases-unknown', named(), text);
    for (const locale of Object.keys(catalog.patterns))
        add('locale-control', named(), 'さっきの説明は間違えた\n私は悲しい', { locale });
    for (const mode of ['rest', 'eat']) for (const speech of ['short', 'gesture']) {
        const v = named({ speech }); life.start(v, mode); life.finish(v); focus(v);
        add('actual-completed-experience:' + mode, v, 'さっきの説明は間違えた\n私は悲しい');
    }
    for (const text of ['私は悲しい', '未知!\n未解析!', '私は悲しい\nおはよう',
        'うん\nおはよう', 'これをももって呼ぼう\n私は悲しい',
        'ころ\n私は悲しい', 'さっきの説明は間違えた\n昨日は悲しかったけど今はうれしい',
        'さっきの説明は間違えた\n私は悲しい\nおはよう',
        'さっきの説明は間違えた\n私は悲しい\n休んでね'])
        add('old-owner-boundary', named(), text);
    return rows;
}
module.exports = { fixtures, expected, hear, named, setup, focus, life, core, worldApi, catalog, copy };
