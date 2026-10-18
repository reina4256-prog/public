'use strict';
// Existing parser/owner calls in disposable memory; no runtime or save caller.
const base = require('./diary_sour_question_fixtures');
const { setup, hear, core, catalog } = base;
const copy = value => JSON.parse(JSON.stringify(value));
const forms = [
    ['berry_observation', '木の実がある？', ['berry'], ['question']],
    ['rest_value', '休むことは大事？', ['rest'], ['question']],
    ['rest_comfort', '横になると気持ちいい？', ['comfortable', 'rest'], ['question', 'condition']],
    ['not_dislike', '木の実は嫌いじゃない？', ['dislike'], ['question', 'negation']],
    ['not_now', '今は食べたくない？', ['eat'], ['question', 'negation', 'time']],
    ['preference', '木の実が好き？', ['like'], ['question']]
];
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const [rule, raw, meanings, relations] of forms) {
        for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture'])
            add(`${rule}:eight-settings`, hear(setup({ foundation, life, speech }), raw),
                !foundation || !life || rule === 'rest_value');
        const fields = [...meanings.map(id => ['meanings', id]), ...relations.map(id => ['relations', id])];
        for (let mask = 0; mask < 2 ** fields.length; mask++) for (const speech of ['short', 'gesture']) {
            const v = setup({ speech });
            fields.forEach(([field, id], bit) => {
                if (mask & (1 << bit)) v.state.knowledge[field] = v.state.knowledge[field].filter(e => e.id !== id);
            });
            add(`${rule}:required-knowledge-masks`, hear(v, raw), mask !== 0 || rule === 'rest_value');
        }
        for (const ids of [[], ['berry:1'], ['berry:1', 'berry:2']]) for (const speech of ['short', 'gesture']) {
            for (const target of ['これ', 'ころ', '木の実']) {
                const v = setup({ speech }); v.state.context.attention = ids.map(id => ({ id, meaning: 'berry' }));
                const text = rule === 'preference' ? `${target}が好き？`
                    : rule === 'not_dislike' && target === 'これ' ? '嫌いじゃない？' : raw;
                const targetMissing = rule === 'preference' ? target !== '木の実' && (target === 'ころ' || ids.length !== 1)
                    : rule === 'not_dislike' && target === 'これ' && ids.length !== 1;
                add(`${rule}:targets`, hear(v, text), rule === 'rest_value' || targetMissing);
            }
        }
        for (const locale of Object.keys(catalog.patterns))
            add(`${rule}:locales`, hear(setup({ foundation: false }), raw, { locale }), locale === 'ja');
        for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
            const v = setup({ foundation: false }); v.world.mode = mode;
            add(`${rule}:activity-speaker-time`, hear(v, raw, { speaker: 'visitor', at: 76543 }), true);
        }
        for (const ending of ['?', '？', '？。', '？ ']) {
            const text = raw.slice(0, -1) + ending;
            // Trailing whitespace after punctuation is an existing parser boundary.
            add(`${rule}:punctuation`, hear(setup({ foundation: false }), text), ending !== '？ ');
        }
    }
    for (const raw of ['そこに木の実落ちてるね？', 'やすむのは大事です？', '横になるときもちいいよね？',
        '木の実は嫌いではない？', '嫌いではない？', '今はいらない？', '私は木の実が嫌いです？'])
        add('existing-aliases', hear(setup({ foundation: false }), raw), true);
    for (const raw of ['木の実がある', '休むことは大事', '横になると気持ちいい', '木の実は嫌いじゃない',
        '今は食べたくない', '木の実が好き', '木の実がある？木の実が好き？', '木の実がある？\n休もう',
        '体力や眠気が回復するから？', 'すっぱくない？', 'これは何', '何してる？', 'うん', 'おはよう',
        '木の実を食べないで', '食べ終わったら散歩しよう', 'Is there a berry?', 'Are you resting?'])
        add('outside-confirmation', hear(setup({ foundation: false, life: false }), raw), false);
    for (const f of base.fixtures().filter(f => ['real-question-scope-not-transferred', 'real-negation-scope-not-transferred'].includes(f.group))) {
        for (const [rule, raw] of forms.filter(([rule]) => f.group === 'real-question-scope-not-transferred'
            || ['not_dislike', 'not_now'].includes(rule))) {
            const v = { state: copy(f.value.receipt.beforeState), world: copy(f.value.receipt.beforeWorld), steps: [] };
            add(f.group, hear(v, raw), true);
        }
    }
    // Real naming, confirmation, retraction and speaker-scoped ambiguous targets.
    for (const speech of ['short', 'gesture']) for (const variant of ['named', 'confirmed', 'retracted', 'ambiguous', 'other-speaker']) {
        const v = setup({ speech }); hear(v, 'これをころって呼ぼう');
        if (variant === 'confirmed') hear(v, 'うん');
        if (variant === 'retracted') {
            hear(v, 'さっきの説明は間違えた');
            if (v.state.knowledge.associations.some(a => a.word === 'ころ' && a.evidence.some(e => !e.retractedBy)))
                throw new Error('Retraction fixture must actually retract its original evidence');
        }
        if (variant === 'ambiguous') {
            v.state.context.scene = 'shore'; v.state.context.attention = [{ id: 'berry:2', meaning: 'berry' }];
            hear(v, 'これをころって呼ぼう'); v.state.context.attention = [];
            if (v.state.knowledge.associations.filter(a => a.word === 'ころ' && a.evidence.some(e => !e.retractedBy)).length !== 2)
                throw new Error('Ambiguous fixture must have two active naming targets');
        }
        add('real-name-targets', hear(v, 'ころが好き？', { speaker: variant === 'other-speaker' ? 'visitor' : 'player' }),
            ['retracted', 'ambiguous', 'other-speaker'].includes(variant));
    }
    return all;
}
module.exports = { fixtures, forms, setup, hear, core, catalog };
