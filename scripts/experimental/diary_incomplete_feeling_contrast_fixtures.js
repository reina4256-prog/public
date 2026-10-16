'use strict';
// Actual owner calls in disposable memory. No game, sample or user storage.
const base = require('./diary_general_feeling_contrast_fixtures');
const single = require('./diary_single_feeling_report_fixtures');
const life = require('./diary_negation_fixtures');
const core = require('../../experimental_word_learning_core');
const setup = base.setup, hear = base.hear, catalog = base.catalog, raw = base.raw;
function incomplete(options = {}, relations = ['report'], meanings = [], contrast = false) {
    const v = setup(options), missing = [...relations, ...(contrast ? ['contrast'] : [])];
    v.state.knowledge.relations = v.state.knowledge.relations.filter(e => !missing.includes(e.id));
    v.state.knowledge.meanings = v.state.knowledge.meanings.filter(e => !meanings.includes(e.id));
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const known of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life: known, speech }), raw), !foundation);
    for (const speech of ['short', 'gesture']) for (const missing of [['report'], ['time'], ['report', 'time']])
        for (const contrast of [false, true]) for (const meanings of [[], ['painful'], ['happy'], ['painful', 'happy']])
            for (const text of [raw, 'つらいけど今はうれしい', 'つらいけど嬉しい'])
                add('missing-relations-meanings-time-positions', hear(incomplete({ speech }, missing, meanings, contrast), text),
                    missing.includes('report') || text !== 'つらいけど嬉しい');
    const forms = ['悲しい', 'うれしい', 'つらい', '疲れている', '悲しかった', '嬉しかった', 'つらかった', '疲れていた'];
    for (const left of forms) for (const right of forms) for (const join of ['けど', 'けれど'])
        for (const missing of [['report'], ['time'], ['report', 'time']])
            add('existing-forms-required-time', hear(incomplete({}, missing), left + join + right),
                missing.includes('report') || /かった|ていた/u.test(left + right));
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-times', hear(incomplete({}, ['time']), left + 'はつらかったけど、' + right + 'はうれしい'), true);
    for (const text of ['私は昨日はつらかったけれど、私は今はうれしい。',
        '昨日はつらかったけど 今はうれしい', ' 昨日はつらかったけど、今はうれしい ',
        '今はうれしいけど昨日はつらかった', 'つらいけど嬉しい'])
        add('punctuation-order-unspecified', hear(incomplete(), text), true);
    for (const locale of Object.keys(catalog.patterns))
        add('input-locales', hear(incomplete(), raw, { locale }), locale === 'ja');
    for (const text of ['I was sad but I am happy', '昨天很难过但是现在很高兴', 'Ich war traurig, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(incomplete(), text), false);
    const p = catalog.feelingContrast.ja;
    for (const text of [p.past + p.join + p.present, p.past, p.present, '今はつらい',
        'それで悲しかった', 'すっぱくない？', 'これなに', 'おはよう', '木の実を食べないで', '食べ終わったら散歩しよう'])
        add('other-owners', hear(incomplete(), text), false);
    for (const text of ['昨日は仕事で失敗して悲しかったけど今はうれしい',
        '昨日はつらかったけど今日は仕事で成功してうれしい', '昨日は仕事で失敗したけど今はうれしい'])
        add('event-detail-not-adopted', hear(incomplete(), text), false);
    for (const text of ['昨日はつらかった。今はうれしい', '昨日はつらかったけど今はうれしいけど悲しい',
        '昨日はつらかったけど今はうれしい？', '昨日はつらかったけど今はうれしい。悲しい',
        '彼は悲しいけど今はうれしい', '悲しくないけど今はうれしい', '悲しいなら今はうれしい',
        '悲しいから今はうれしい', '【感情】昨日はつらかったけど今はうれしい'])
        add('other-scope-and-unknown-clauses', hear(incomplete(), text), false);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = incomplete(); v.world.mode = mode; core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const speaker of ['player', 'visitor']) for (const missing of [['report'], ['time'], ['report', 'time']])
        add('actual-speaker-vs-unknown-subject', hear(incomplete({}, missing), raw, { speaker }), true);
    for (const text of ['つらいけど今はうれしい', '今はうれしいけどつらい'])
        add('one-complete-clause', hear(incomplete({}, ['time']), text), true);
    for (const text of ['つらいけど嬉しい', '悲しいけど疲れている'])
        add('no-time-required', hear(incomplete({}, ['time']), text), false);
    for (const foundation of [false, true]) for (const known of [false, true]) {
        const v = single.acquire({ foundation, life: known }, 'ja', true);
        add('fixed-experienced-scope-not-transferred', hear(v, '悲しかったけど今はうれしい'), !foundation);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-report-scope-not-transferred', hear(v, raw), true);
        const t = incomplete({}, ['time']); t.state.knowledge.meanings = t.state.knowledge.meanings.filter(e => e.id !== 'tired');
        life.start(t, 'rest'); hear(t, '"疲れた"'); life.finish(t);
        if (!t.state.knowledge.meanings.some(e => e.id === 'tired' && e.source === 'experienced_life'))
            throw new Error('Tired fixture did not acquire original evidence');
        add('experienced-meaning-keeps-time-unknown', hear(t, '昨日は疲れていたけど今はうれしい'), true);
    }
    for (const [owner, file] of [['bf', 'general'], ['bg', 'partial'], ['bh', 'unresolved'], ['bi', 'mixed']])
        for (const item of require(`./diary_${file}_feeling_contrast_fixtures`).fixtures()) if (item.expected)
            add(`${owner}-retains-ownership`, item.value, false);
    return all;
}
module.exports = { fixtures, setup, incomplete, hear, raw, catalog };
