'use strict';
// Owner calls only in disposable memory; snapshots are supplied to the adapter.
const base = require('./diary_sour_question_fixtures');
const single = require('./diary_single_feeling_report_fixtures');
const life = require('./diary_negation_fixtures');
const setup = base.setup, hear = base.hear, catalog = base.catalog;
const raw = '昨日はつらかったけど、今はうれしい';
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life: known, speech }), raw), foundation && known);
    const forms = ['悲しい', 'うれしい', 'つらい', '疲れている', '悲しかった', '嬉しかった', 'つらかった', '疲れていた'];
    for (const left of forms) for (const right of forms) for (const join of ['けど', 'けれど'])
        add('existing-feeling-pairs', hear(setup(), left + join + right), true);
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-times', hear(setup(), left + 'はつらかったけど、' + right + 'はうれしい'), true);
    for (const raw of ['私は昨日はつらかったけれど、私は今はうれしい。',
        '昨日はつらかったけど 今はうれしい', ' 昨日はつらかったけど、今はうれしい ',
        '昨日は悲しかったけれど今はうれしい', '今はうれしいけど昨日はつらかった'])
        add('existing-punctuation-and-order', hear(setup(), raw), true);
    for (const locale of Object.keys(catalog.patterns)) add('input-locales', hear(setup(), raw, { locale }), locale === 'ja');
    for (const raw of ['I was sad but I am happy', '昨天很难过但是现在很高兴', 'Ich war traurig, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(setup(), raw), false);
    const p = catalog.feelingContrast.ja;
    for (const text of [p.past + p.join + p.present, p.past, p.present, '今はつらい', '昨日は仕事で失敗した',
        'それで悲しかった', 'すっぱくない？', 'おはよう', '木の実を食べないで', '食べ終わったら散歩しよう'])
        add('existing-other-owners', hear(setup(), text), false);
    for (const text of ['昨日は仕事で失敗して悲しかったけど今はうれしい',
        '昨日はつらかったけど今日は仕事で成功してうれしい', '昨日は仕事で失敗したけど今はうれしい'])
        add('event-detail-not-adopted', hear(setup(), text), false);
    for (const text of ['昨日はつらかった。今はうれしい', '昨日はつらかったけど今はうれしいけど悲しい',
        '昨日はつらかったけど今はうれしい？', '昨日はつらかったけど今はうれしい。悲しい',
        '彼は悲しいけど今はうれしい', '悲しくないけど今はうれしい', '悲しいなら今はうれしい',
        '悲しいから今はうれしい', '【感情】昨日はつらかったけど今はうれしい'])
        add('other-scope-and-unknown-clauses', hear(setup(), text), false);
    for (const id of ['painful', 'happy', 'report', 'time', 'contrast']) {
        const v = setup(), list = ['painful', 'happy'].includes(id) ? 'meanings' : 'relations';
        v.state.knowledge[list] = v.state.knowledge[list].filter(e => e.id !== id);
        add('missing-prerequisites', hear(v, raw), false);
    }
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = setup(); v.world.mode = mode; base.core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const speaker of ['player', 'visitor']) add('reported-subject-is-speaker', hear(setup(), raw, { speaker }), true);
    for (const foundation of [false, true]) for (const known of [false, true]) {
        const v = single.acquire({ foundation, life: known }, 'ja', true);
        add('fixed-experienced-scope-not-transferred', hear(v, '悲しかったけど今はうれしい'), foundation && known);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-experienced-report-scope-not-transferred', hear(v, raw), false);
        const t = setup(); t.state.knowledge.meanings = t.state.knowledge.meanings.filter(e => e.id !== 'tired');
        life.start(t, 'rest'); hear(t, '"疲れた"'); life.finish(t);
        // A fixture must establish genuine ownership evidence, never hand-build knowledge.
        if (!t.state.knowledge.meanings.some(e => e.id === 'tired' && e.source === 'experienced_life'))
            throw new Error('Tired fixture did not acquire original evidence');
        add('real-experienced-tired-meaning', hear(t, '昨日は疲れていたけど今はうれしい'), true);
    }
    return all;
}
module.exports = { fixtures, setup, hear, raw, catalog };
