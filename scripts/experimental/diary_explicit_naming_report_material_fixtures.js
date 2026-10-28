'use strict';
// Disposable actual receiver/responder occurrences; no UI or player storage.
const base = require('./diary_mixed_reference_material_fixtures');
const oldNames = require('../../experimental_word_diary_names');
const candidates = require('../../experimental_word_diary_candidates');
const { setup, hear, focus, core, worldApi, catalog, copy, life } = base;
const raw = 'これをころって呼ぼう\nこれをももって呼ぼう\n私は悲しい';
function fixtures() {
    const rows = [];
    function add(group, v, text = raw, options = {}, expected = true) {
        const value = hear(v, text, options), q = value.receipt;
        if (oldNames.capture(candidates.create(), copy(value.result), copy(q.beforeState.context))) expected = false;
        rows.push({ group, value, expected });
    }
    const names = ['これをころって呼ぼう', 'これはころだよ', 'ころっていうんだ',
        'これをころって呼ぼう\nこれをももって呼ぼう'];
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of names) for (const reverse of [false, true])
                add('settings-and-existing-forms', setup({ foundation, life: knownLife, speech }),
                    (reverse ? ['私は悲しい', text] : [text, '私は悲しい']).join('\n'), { speaker });
    for (const ids of [[], ['berry:1', 'berry:2']]) for (const text of names)
        for (const report of ['私は悲しい', '今日料理で失敗した']) {
            const v = setup(); focus(v, ids); add('missing-or-ambiguous-target', v, text + '\n' + report);
        }
    for (const id of ['naming', 'report', 'time', 'reason']) {
        const v = setup(); v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== id);
        add('missing-relation:' + id, v);
    }
    for (const id of ['sad', 'happy', 'failure', 'success']) {
        const v = setup(); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(r => r.id !== id);
        add('missing-meaning', v, 'これをころって呼ぼう\nこれをももって呼ぼう\n今日料理で失敗して悲しい');
    }
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor']) {
        for (const report of ['今はうれしい', '私はつらい', '私は疲れた', '今日料理で失敗した',
            '今日料理で成功してうれしい', '私は悲しい\n今はうれしい'])
            add('report-fields-and-multiple-reports', setup({ speech }), raw.replace('私は悲しい', report), { speaker });
        for (const text of [raw + '\n未解析!', '未知!\n' + raw, raw.replaceAll('\n', '。'),
            'これをころって呼ぼう\nこれをころって呼ぼう\n私は悲しい', Array(3).fill(raw).join('\n')])
            add('unknown-punctuation-and-repetition', setup({ speech }), text, { speaker });
        for (const previous of ['未知!', 'これをころって呼ぼう', '私は悲しい']) {
            const v = setup({ speech }); hear(v, previous, { speaker }); add('actual-antecedent', v, raw, { speaker });
        }
        for (const mode of ['rest', 'eat']) {
            const v = setup({ speech }); life.start(v, mode); life.finish(v); focus(v);
            add('completed-activity', v, raw, { speaker });
        }
    }
    const mixed = setup({ life: false });
    add('one-complete-one-incomplete-boundary', mixed, 'これをころって呼ぼう\n木の実をももって呼ぼう\n私は悲しい', {}, false);
    for (const text of ['ぴぴ', 'ぽぽ', 'ぴぴ\nぽぽ', 'さっきの説明は間違えた', 'うん', '違う']) {
        const v = base.prepare(); if (['うん', '違う'].includes(text)) { hear(v, 'これをころって呼ぼう'); hear(v, 'ころ'); }
        add('other-frame-boundary', v, text + '\n私は悲しい', {}, false);
    }
    for (const text of ['おはよう', '休んでね', 'ぽぽは休むことだよ', '休むことは大事',
        '昨日は悲しかったけど今はうれしい']) add('other-recognized-boundary', setup(), raw + '\n' + text, {}, text.startsWith('昨日') || text === 'ぽぽは休むことだよ');
    const arrived = setup(); require('./diary_word_reference_clause_material_fixtures').arrive(arrived);
    add('actual-dynamic-naming-boundary', arrived, 'ころ\nもも\n私は悲しい', {}, false);
    for (const locale of Object.keys(catalog.patterns)) add('locale-control', setup(), raw, { locale }, locale === 'ja');
    for (const text of ['私は悲しい', '私は悲しい\nおはよう', 'これをころって呼ぼう',
        'これをころって呼ぼう\nこれをももって呼ぼう', '未知!\n未解析!'])
        add('prior-owner-controls', setup(), text, {}, false);
    return rows;
}
module.exports = { fixtures, setup, hear, focus, core, worldApi, catalog, copy, life, raw };
