'use strict';
// Existing owner calls in disposable memory only. No game or player storage.
const base = require('./diary_event_feeling_contrast_fixtures');
const core = require('../../experimental_word_learning_core');
const setup = base.setup, hear = base.hear, raw = base.raw, catalog = base.catalog;
const ids = ['sad', 'happy', 'failure', 'report', 'time', 'reason', 'contrast'];
function incomplete(missing = ['reason'], options = {}) {
    const v = setup(options);
    for (const field of ['meanings', 'relations'])
        v.state.knowledge[field] = v.state.knowledge[field].filter(e => !missing.includes(e.id));
    return v;
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const speech of ['short', 'gesture']) for (let mask = 0; mask < 128; mask++)
        add('all-seven-required-knowledge-combinations', hear(incomplete(ids.filter((_, i) => mask & (1 << i)), { speech }), raw), mask !== 0);
    const clauses = ['昨日は仕事で失敗して悲しかった', '今日は試験で成功してうれしい',
        'さっき散歩でうまくいかなくてつらかった', '今は仕事でうまくいって疲れている',
        '悲しい', '今はうれしい', '昨日はつらかった', '疲れていた'];
    for (const left of clauses) for (const right of clauses) for (const join of ['けど', 'けれど']) {
        const detailed = /で/u.test(left + right);
        add('event-position-meaning-pairs-reason-missing', hear(incomplete(), left + join + right), detailed);
        add('event-meanings-both-unknown', hear(incomplete(['failure', 'success']), left + join + right), detailed);
    }
    for (const left of ['今日', '昨日', '今', 'さっき']) for (const right of ['今日', '昨日', '今', 'さっき'])
        add('relative-times-time-missing', hear(incomplete(['time']), left + 'は仕事で失敗して悲しかったけど' + right + 'はうれしい'), true);
    for (const detail of ['仕事', '量子実験', 'あそび', 'ABC123'])
        add('unknown-detail-is-not-repaired', hear(incomplete(), '昨日は' + detail + 'で失敗して悲しかったけど今はうれしい'), true);
    for (const text of ['昨日は仕事で失敗して悲しかったけどうれしい', 'うれしいけど昨日は仕事で失敗して悲しかった'])
        add('one-complete-clause-with-time-missing', hear(incomplete(['time']), text), true);
    for (const text of ['仕事で失敗して悲しいけどうれしい', 'うれしいけど仕事で失敗して悲しい'])
        add('optional-time-does-not-create-a-missing-relation', hear(incomplete(['time']), text), false);
    for (const speaker of ['player', 'visitor']) for (const speech of ['short', 'gesture'])
        add('actual-speaker-and-response', hear(incomplete(['report', 'failure'], { speech }), raw, { speaker }), true);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = incomplete(); v.world.mode = mode; core.perceive(v.state, { scene: 'shore', attention: [] });
        add('activity-and-empty-attention', hear(v, raw), true);
    }
    for (const locale of Object.keys(catalog.patterns))
        add('seven-input-locales', hear(incomplete(), raw, { locale }), locale === 'ja');
    for (const text of ['I failed at work and was sad but I am happy', '昨天工作失败很难过但是现在很高兴',
        'Ich war traurig wegen der Arbeit, aber jetzt bin ich froh'])
        add('foreign-grammar-not-added', hear(incomplete(), text), false);
    for (const text of ['私は昨日は仕事で失敗して悲しかったけれど、私は今はうれしい。',
        ' 昨日は仕事で失敗して悲しかったけど今はうれしい ',
        '昨日は仕事で失敗して悲しかったけど 今はうれしい', raw + '！'])
        add('existing-punctuation', hear(incomplete(), text), !text.endsWith('！'));
    for (const text of ['昨日は仕事で失敗したけど今はうれしい', '今はうれしいけど昨日は仕事で失敗した',
        '昨日は仕事で失敗したけど今日は試験で成功した', '昨日は仕事で失敗して悲しかった',
        '昨日は仕事で失敗して悲しかった。今はうれしい', raw + 'けど悲しい', raw + '？',
        '彼は仕事で失敗して悲しかったけど今はうれしい', '【感情】' + raw,
        'おはよう', 'これなに', '食べ終わったら散歩しよう'])
        add('other-owners-and-outside-scope', hear(incomplete(), text), false);
    for (const item of base.fixtures()) {
        const eligible = item.group === 'missing-required-meaning-or-relation'
            || item.group === 'eight-settings' && !item.expected
            || item.group === 'fixed-experience-scope-not-transferred' && !item.expected
            || item.group === 'rest-report-scope-not-transferred';
        add('bk-fixture-' + item.group, item.value, eligible);
    }
    return all;
}
module.exports = { fixtures, setup, incomplete, hear, raw, catalog };
