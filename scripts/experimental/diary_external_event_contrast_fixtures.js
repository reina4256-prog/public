'use strict';
// Existing receive/respond in disposable memory. No new grammar or game wiring.
const base = require('./diary_event_feeling_contrast_fixtures');
const core = require('../../experimental_word_learning_core');
const setup = base.setup, hear = base.hear, catalog = base.catalog;
const raw = '昨日は仕事で失敗したけど今日は試験で成功してうれしい';
const ids = ['failure', 'success', 'happy', 'report', 'time', 'reason', 'contrast'];
function incomplete(missing = ['reason'], options = {}) {
    const v = setup(options);
    for (const field of ['meanings', 'relations'])
        v.state.knowledge[field] = v.state.knowledge[field].filter(e => !missing.includes(e.id));
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    const forms = ['昨日は仕事で失敗したけど今はうれしい', '今はうれしいけど昨日は仕事で失敗した',
        '昨日は仕事で失敗したけど今日は試験で成功した', raw];
    for (const text of forms) for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 128; mask++)
        add('seven-knowledge-combinations-four-shapes', hear(incomplete(ids.filter((_, i) => mask & (1 << i)), { speech }), text), true);
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
        add('eight-settings', hear(setup({ foundation, life, speech }), raw), true);
    const external = ['昨日は仕事で失敗した', '今日は試験で成功した', 'さっき散歩でうまくいかなかった', '今日あそびでうまくいった'];
    const feelings = ['悲しい', '今はうれしい', '昨日はつらかった', '疲れていた',
        '昨日は仕事で失敗して悲しかった', '今日は試験で成功してうれしい',
        'さっき散歩でうまくいかなくてつらかった', '今は仕事でうまくいって疲れている'];
    for (const left of [...external, ...feelings]) for (const right of [...external, ...feelings])
        for (const join of ['けど', 'けれど'])
            add('clause-position-meanings-and-connectors', hear(setup(), left + join + right),
                external.includes(left) || external.includes(right));
    for (const missing of ['sad', 'painful', 'tired']) for (const text of ['悲しい', 'つらい', '疲れている']) {
        const v = incomplete([missing]);
        add('other-feeling-meanings-unavailable', hear(v, external[0] + 'けど' + text), true);
    }
    for (const left of ['今日', '昨日', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-time-pairs', hear(incomplete(['time']), left + 'は仕事で失敗したけど' + right + 'はうれしい'), true);
    for (const detail of ['仕事', '量子実験', 'あそび', 'ABC123'])
        add('unknown-detail-preserved', hear(setup(), '昨日は' + detail + 'で失敗したけど今はうれしい'), true);
    for (const text of [external[0] + 'けどうれしい', 'うれしいけど' + external[0]])
        add('one-complete-clause-time-not-required-on-other-clause', hear(incomplete(['time']), text), true);
    for (const speaker of ['player', 'visitor']) for (const speech of ['short', 'gesture'])
        add('actual-speaker-and-response', hear(incomplete(['report', 'failure'], { speech }), raw, { speaker }), true);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = incomplete(); v.world.mode = mode; core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales', hear(setup(), raw, { locale }), locale === 'ja');
    for (const text of ['I failed at work but I am happy', '昨天工作失败但是现在很高兴', 'Ich scheiterte, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(setup(), text), false);
    for (const text of ['私は昨日は仕事で失敗したけれど、私は今はうれしい。',
        ' 昨日は仕事で失敗したけど今はうれしい ', '昨日は仕事で失敗したけど 今はうれしい',
        '昨日は仕事で失敗したけど今はうれしい！'])
        add('existing-punctuation', hear(setup(), text), !text.endsWith('！'));
    for (const text of ['昨日は仕事で失敗した', 'それで悲しかった', '昨日は仕事で失敗した。今はうれしい',
        raw + 'けど悲しい', raw + '？', '彼は仕事で失敗したけど今はうれしい', '【感情】' + raw,
        'おはよう', 'これなに', '食べ終わったら散歩しよう', '木の実を食べないで'])
        add('other-owners-and-outside-scope', hear(setup(), text), false);
    const single = require('./diary_single_feeling_report_fixtures');
    const life = require('./diary_negation_fixtures');
    for (const foundation of [false, true]) {
        add('fixed-experience-scope-not-transferred', hear(single.acquire({ foundation, life: true }, 'ja', true), raw), true);
    }
    {
        const v = life.setup(); life.learnReport(v, 'ja');
        add('rest-report-scope-not-transferred', hear(v, raw), true);
        const t = setup(); t.state.knowledge.meanings = t.state.knowledge.meanings.filter(e => e.id !== 'tired');
        life.start(t, 'rest'); hear(t, '「疲れた」'); life.finish(t);
        if (!t.state.knowledge.meanings.some(e => e.id === 'tired' && e.source === 'experienced_life'))
            throw new Error('Original tired evidence missing');
        add('experienced-tired-meaning', hear(t, external[0] + 'けど疲れている'), true);
    }
    for (const item of require('./diary_incomplete_event_feeling_contrast_fixtures').fixtures())
        // Prior negative controls explicitly include three now-adopted bm forms.
        add('prior-' + item.group, item.value, forms.includes(item.value.result.input.raw));
    return all;
}
module.exports = { fixtures, setup, hear, incomplete, raw, catalog };
