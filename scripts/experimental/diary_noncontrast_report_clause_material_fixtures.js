'use strict';
// Actual receiver/responder in disposable memory. No game UI or player save.
const base = require('./diary_mixed_reference_material_fixtures');
const extras = require('./diary_additional_clause_material_fixtures');
const oldQuestions = require('../../experimental_word_diary_questions');
const candidates = require('../../experimental_word_diary_candidates');
const { core, worldApi, catalog, copy, life, focus, setup, hear } = base;
const raw = '私は悲しい\nおはよう';
function fixtures() {
    const rows = [];
    function add(group, v, text = raw, options = {}, expected = true) {
        const value = hear(v, text, options);
        if (oldQuestions.capture(candidates.create(), copy(value.result), copy(value.receipt.reply))) expected = false;
        rows.push({ group, value, expected });
    }
    const texts = [raw, 'おはよう\n私は悲しい', '私は悲しい\n今はうれしい',
        '今日料理で失敗した\nおはよう', '今日料理で成功してうれしい\n未知!',
        '私は疲れている\n休んでね', '私はつらい\n昨日は悲しかった', '今日料理で失敗した\n私は悲しい'];
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of texts) add('settings', setup({ foundation, life: knownLife, speech }), text, { speaker });
    for (const text of [...extras.anchors, 'おはよう', ...Object.values(extras.forms), '未知!'])
        for (const reverse of [false, true]) {
            const v = setup(); hear(v, '休むことは大事');
            add('companions', v, (reverse ? [text, '私は悲しい'] : ['私は悲しい', text]).join('\n'));
        }
    for (const [field, id] of [['meanings', 'sad'], ['meanings', 'happy'], ['meanings', 'painful'],
        ['meanings', 'tired'], ['meanings', 'failure'], ['meanings', 'success'],
        ['relations', 'report'], ['relations', 'time'], ['relations', 'reason']])
        for (const text of ['私は悲しい\n今はうれしい', '今日料理で失敗した\n今日料理で成功してうれしい']) {
            const v = setup(); v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
            add('missing:' + id, v, text);
        }
    for (const mode of ['rest', 'eat']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); life.start(v, mode); life.finish(v); focus(v);
        add('actual-completion:' + mode, v, '私は疲れた\nおはよう');
    }
    for (const locale of Object.keys(catalog.patterns)) add('locale', setup(), raw, { locale }, locale === 'ja');
    for (const text of ['私は悲しい', '今日料理で失敗した', '昨日は悲しかったけど今はうれしい',
        '昨日料理で失敗して悲しかったけど今料理で成功してうれしい', '木の実がある\nおはよう',
        '未知!\n未解析!', 'これをころって呼ぼう\n私は悲しい',
        'これをころって呼ぼう\nこれをももって呼ぼう\n私は悲しい', 'さっきの説明は間違えた\n私は悲しい'])
        add('boundaries', setup(), text, {}, false);
    for (const text of ['うん\n私は悲しい', 'ぽぽは休むことだよ\n私は悲しい']) add('boundaries', setup(), text);
    for (const text of ['ぴぴ\n私は悲しい', 'ぽぽ\n私は悲しい']) add('reference-boundary', base.prepare(), text, {}, false);
    for (const text of ['私は悲しい。おはよう', '私は悲しい！おはよう', '私は悲しい\n私は悲しい\n私は悲しい'])
        add('punctuation-repeat', setup(), text);
    add('punctuation-repeat', setup(), '私は悲しい？\nおはよう', {}, false);
    // Additional real contexts, never amendments to the saved consultation set.
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const text of ['今はつらい\n昨日は疲れていた', '昨日畑で成功した\nさっき魚釣りで失敗した',
            '今日料理で成功してうれしい\n昨日建築で失敗してつらかった', Array(8).fill(raw).join('\n')])
            add('more-reports-and-repetition', setup({ speech }), text, { speaker });
    for (const ids of [[], ['berry:1', 'berry:2']]) {
        const v = setup(); focus(v, ids); add('attention-independent-reports', v);
    }
    for (const text of ['さっきの説明は間違えた\n私は悲しい', 'これをころって呼ぼう\n私は悲しい']) {
        const v = setup(); hear(v, 'これをぴぴって呼ぼう'); add('actual-correction-naming-boundary', v, text, {}, false);
    }
    const reply = setup(); hear(reply, 'これをぴぴって呼ぼう'); hear(reply, 'ぴぴ');
    add('actual-confirmation-boundary', reply, 'うん\n私は悲しい', {}, false);
    return rows;
}
module.exports = { fixtures, setup, hear, focus, core, worldApi, catalog, copy, life, raw };
