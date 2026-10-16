'use strict';
// Real owner calls in disposable memory; never supply missing relations.
const base = require('./diary_general_feeling_contrast_fixtures');
const partial = require('./diary_partial_feeling_contrast_fixtures');
const single = require('./diary_single_feeling_report_fixtures');
const life = require('./diary_negation_fixtures');
const core = require('../../experimental_word_learning_core');
const setup = base.setup, hear = base.hear, catalog = base.catalog, raw = base.raw;
function unresolved(options = {}) {
    const v = setup(options);
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'contrast');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(unresolved({ foundation, life: known, speech }), raw), foundation && known);
    const forms = ['悲しい', 'うれしい', 'つらい', '疲れている', '悲しかった', '嬉しかった', 'つらかった', '疲れていた'];
    for (const left of forms) for (const right of forms) for (const join of ['けど', 'けれど'])
        add('existing-feeling-pairs', hear(unresolved(), left + join + right), true);
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-times', hear(unresolved(), left + 'はつらかったけど、' + right + 'はうれしい'), true);
    for (const text of ['私は昨日はつらかったけれど、私は今はうれしい。',
        '昨日はつらかったけど 今はうれしい', ' 昨日はつらかったけど、今はうれしい ',
        '今はうれしいけど昨日はつらかった', 'つらいけど嬉しい'])
        add('punctuation-order-unspecified', hear(unresolved(), text), true);
    for (const locale of Object.keys(catalog.patterns)) add('input-locales', hear(unresolved(), raw, { locale }), locale === 'ja');
    for (const text of ['I was sad but I am happy', '昨天很难过但是现在很高兴', 'Ich war traurig, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(unresolved(), text), false);
    const p = catalog.feelingContrast.ja;
    for (const text of [p.past + p.join + p.present, p.past, p.present, '今はつらい',
        'それで悲しかった', 'すっぱくない？', 'これなに', 'おはよう', '木の実を食べないで', '食べ終わったら散歩しよう'])
        add('other-owners', hear(unresolved(), text), false);
    for (const text of ['昨日は仕事で失敗して悲しかったけど今はうれしい',
        '昨日はつらかったけど今日は仕事で成功してうれしい', '昨日は仕事で失敗したけど今はうれしい'])
        add('event-detail-not-adopted', hear(unresolved(), text), false);
    for (const text of ['昨日はつらかった。今はうれしい', '昨日はつらかったけど今はうれしいけど悲しい',
        '昨日はつらかったけど今はうれしい？', '昨日はつらかったけど今はうれしい。悲しい',
        '彼は悲しいけど今はうれしい', '悲しくないけど今はうれしい', '悲しいなら今はうれしい',
        '悲しいから今はうれしい', '【感情】昨日はつらかったけど今はうれしい'])
        add('other-scope-and-unknown-clauses', hear(unresolved(), text), false);
    for (const missing of [['report'], ['time'], ['report', 'time']]) {
        const v = unresolved(); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => !missing.includes(e.id));
        add('additional-relations-missing', hear(v, raw), false);
    }
    for (const ids of [['painful'], ['happy'], ['painful', 'happy']]) {
        const v = unresolved(); v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => !ids.includes(e.id));
        add('meaning-also-unknown', hear(v, raw), false);
    }
    // No time relation is required when neither clause expresses a time.
    {
        const v = unresolved(); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'time');
        add('no-time-required', hear(v, 'つらいけど嬉しい'), true);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = unresolved(); v.world.mode = mode; core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const speaker of ['player', 'visitor'])
        add('subject-is-actual-speaker', hear(unresolved(), raw, { speaker }), true);
    for (const foundation of [false, true]) for (const known of [false, true]) {
        const v = single.acquire({ foundation, life: known }, 'ja', true);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'contrast');
        add('fixed-experienced-scope-not-transferred', hear(v, raw), foundation && known);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-experienced-report-scope-not-transferred', hear(v, raw), false);
    }
    for (const item of base.fixtures()) if (item.expected) add('complete-pairs-stay-with-bf', item.value, false);
    for (const item of partial.fixtures()) if (item.expected) add('meaning-partials-stay-with-bg', item.value, false);
    return all;
}
module.exports = { fixtures, setup, unresolved, hear, raw, catalog };
