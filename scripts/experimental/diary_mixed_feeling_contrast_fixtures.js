'use strict';
// Existing owner calls in disposable memory; partial semantics are never repaired.
const base = require('./diary_general_feeling_contrast_fixtures');
const single = require('./diary_single_feeling_report_fixtures');
const life = require('./diary_negation_fixtures');
const core = require('../../experimental_word_learning_core');
const setup = base.setup, hear = base.hear, catalog = base.catalog, raw = base.raw;
function without(v, ids) {
    v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => !ids.includes(e.id));
    return v;
}
function partial(options = {}, ids = ['painful']) {
    const v = without(setup(options), ids);
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'contrast');
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(partial({ foundation, life: known, speech }), raw), foundation);
    for (const ids of [['painful'], ['happy'], ['painful', 'happy']])
        for (const speech of ['short', 'gesture']) add('left-right-both-unknown', hear(partial({ speech }, ids), raw), true);
    const forms = [['悲しい', 'sad'], ['うれしい', 'happy'], ['つらい', 'painful'], ['疲れている', 'tired'],
        ['悲しかった', 'sad'], ['嬉しかった', 'happy'], ['つらかった', 'painful'], ['疲れていた', 'tired']];
    for (const [left, a] of forms) for (const [right, b] of forms) for (const join of ['けど', 'けれど'])
        for (const missing of [[a], [b], [...new Set([a, b])]])
            add('existing-forms-and-unknown-positions', hear(partial({}, missing), left + join + right), true);
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-times', hear(partial(), left + 'はつらかったけど、' + right + 'はうれしい'), true);
    for (const text of ['私は昨日はつらかったけれど、私は今はうれしい。',
        '昨日はつらかったけど 今はうれしい', ' 昨日はつらかったけど、今はうれしい ',
        '今はうれしいけど昨日はつらかった', 'つらいけど嬉しい'])
        add('punctuation-order-unspecified', hear(partial(), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('input-locales', hear(partial(), raw, { locale }), locale === 'ja');
    for (const text of ['I was sad but I am happy', '昨天很难过但是现在很高兴', 'Ich war traurig, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(partial(), text), false);
    const p = catalog.feelingContrast.ja;
    for (const text of [p.past + p.join + p.present, p.past, p.present, '今はつらい',
        'それで悲しかった', 'すっぱくない？', 'これなに', 'おはよう', '木の実を食べないで', '食べ終わったら散歩しよう'])
        add('other-owners', hear(partial({}, ['sad', 'painful']), text), false);
    for (const text of ['昨日は仕事で失敗して悲しかったけど今はうれしい',
        '昨日はつらかったけど今日は仕事で成功してうれしい', '昨日は仕事で失敗したけど今はうれしい'])
        add('event-detail-not-adopted', hear(partial({}, ['sad', 'painful']), text), false);
    for (const text of ['昨日はつらかった。今はうれしい', '昨日はつらかったけど今はうれしいけど悲しい',
        '昨日はつらかったけど今はうれしい？', '昨日はつらかったけど今はうれしい。悲しい',
        '彼は悲しいけど今はうれしい', '悲しくないけど今はうれしい', '悲しいなら今はうれしい',
        '悲しいから今はうれしい', '【感情】昨日はつらかったけど今はうれしい'])
        add('other-scope-and-unknown-clauses', hear(partial(), text), false);
    for (const id of ['report', 'time']) {
        const v = partial(); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== id);
        add('missing-required-relations', hear(v, raw), false);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = partial(); v.world.mode = mode; core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const speaker of ['player', 'visitor'])
        add('reported-subject-is-speaker', hear(partial(), raw, { speaker }), true);
    for (const foundation of [false, true]) for (const known of [false, true]) {
        const v = single.acquire({ foundation, life: known }, 'ja', true);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'contrast');
        add('fixed-experienced-scope-not-transferred', hear(v, '悲しかったけど今はうれしい'), foundation && !known);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-experienced-report-scope-not-transferred', hear(v, raw), false);
    }
    for (const item of base.fixtures()) if (item.expected)
        add('complete-pairs-stay-with-bf', item.value, false);
    for (const item of require('./diary_unresolved_feeling_contrast_fixtures').fixtures()) if (item.expected)
        add('contrast-only-stays-with-bh', item.value, false);
    for (const item of require('./diary_partial_feeling_contrast_fixtures').fixtures()) if (item.expected)
        add('known-relations-stay-with-bg', item.value, false);
    {
        const v = partial(); v.state.knowledge.relations = v.state.knowledge.relations.filter(e => e.id !== 'time');
        add('no-time-required', hear(v, '\u3064\u3089\u3044\u3051\u3069\u5b09\u3057\u3044'), true);
    }
    return all;
}
module.exports = { fixtures, setup, partial, unresolved: partial, without, hear, raw, catalog };
