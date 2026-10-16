'use strict';
// Existing owner calls in disposable memory; no game or player storage.
const base = require('./diary_general_feeling_contrast_fixtures');
const life = require('./diary_negation_fixtures');
const single = require('./diary_single_feeling_report_fixtures');
const setup = base.setup, hear = base.hear, catalog = base.catalog;
const raw = '昨日は仕事で失敗して悲しかったけど今はうれしい';
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life: known, speech }), raw), foundation && known);
    const clauses = ['昨日は仕事で失敗して悲しかった', '今日は試験で成功してうれしい',
        'さっき散歩でうまくいかなくてつらかった', '今は仕事でうまくいって疲れている',
        '悲しい', '今はうれしい', '昨日はつらかった', '疲れていた'];
    for (const left of clauses) for (const right of clauses) for (const join of ['けど', 'けれど'])
        add('event-position-meaning-pairs', hear(setup(), left + join + right), /で/u.test(left + right));
    for (const speech of ['short', 'gesture']) for (const id of ['sad', 'happy', 'failure', 'report', 'time', 'reason', 'contrast']) {
        const v = setup({ speech }), field = ['sad', 'happy', 'failure'].includes(id) ? 'meanings' : 'relations';
        v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
        add('missing-required-meaning-or-relation', hear(v, raw), false);
    }
    for (const text of ['私は昨日は仕事で失敗して悲しかったけれど、私は今はうれしい。',
        ' 昨日は仕事で失敗して悲しかったけど今はうれしい ',
        '昨日は仕事で失敗して悲しかったけど 今はうれしい',
        '昨日は仕事で失敗して悲しかったけど今はうれしい！'])
        add('existing-punctuation', hear(setup(), text), !text.endsWith('！'));
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-time-pairs', hear(setup(), left + 'は仕事で失敗して悲しかったけど' + right + 'はうれしい'), true);
    for (const detail of ['仕事', '量子実験', 'あそび', 'ABC123'])
        add('unresolved-detail-preserved', hear(setup(), '昨日は' + detail + 'で失敗して悲しかったけど今はうれしい'), true);
    for (const locale of Object.keys(catalog.patterns)) add('seven-input-locales', hear(setup(), raw, { locale }), locale === 'ja');
    for (const text of ['I failed at work and was sad but I am happy', '昨天工作失败很难过但是现在很高兴',
        'Ich war traurig wegen der Arbeit, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(setup(), text), false);
    for (const text of ['昨日は仕事で失敗したけど今はうれしい', '今はうれしいけど昨日は仕事で失敗した',
        '昨日は仕事で失敗したけど今日は試験で成功した', '昨日は仕事で失敗して悲しかった',
        '昨日は仕事で失敗して悲しかった。今はうれしい', raw + 'けど悲しい', raw + '？',
        '彼は仕事で失敗して悲しかったけど今はうれしい', '【感情】' + raw,
        'おはよう', 'これなに', '食べ終わったら散歩しよう'])
        add('other-owners-and-outside-scope', hear(setup(), text), false);
    for (const speaker of ['player', 'visitor']) for (const speech of ['short', 'gesture'])
        add('actual-speaker-and-response', hear(setup({ speech }), raw, { speaker }), true);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = setup(); v.world.mode = mode;
        require('../../experimental_word_learning_core').perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const foundation of [false, true]) {
        const v = single.acquire({ foundation, life: true }, 'ja', true);
        add('fixed-experience-scope-not-transferred', hear(v, raw), foundation);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-report-scope-not-transferred', hear(v, raw), false);
        const t = setup(); t.state.knowledge.meanings = t.state.knowledge.meanings.filter(e => e.id !== 'tired');
        life.start(t, 'rest'); hear(t, '"疲れた"'); life.finish(t);
        if (!t.state.knowledge.meanings.some(e => e.id === 'tired' && e.source === 'experienced_life'))
            throw new Error('Original tired evidence missing');
        add('experienced-tired-meaning', hear(t, '昨日は仕事で失敗して疲れていたけど今はうれしい'), true);
    }
    for (const owner of ['general', 'partial', 'unresolved', 'mixed', 'incomplete'])
        for (const item of require(`./diary_${owner}_feeling_contrast_fixtures`).fixtures()) if (item.expected)
            add(`${owner}-retains-ownership`, item.value, false);
    return all;
}
module.exports = { fixtures, setup, hear, raw, catalog };
