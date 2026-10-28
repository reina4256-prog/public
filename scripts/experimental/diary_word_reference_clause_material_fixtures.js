'use strict';
// Existing forms and actual occurrence-time copies in disposable memory only.
const names = require('./diary_multiple_complete_naming_fixtures');
const dynamic = require('./diary_dynamic_multiple_complete_naming_fixtures');
const extras = require('./diary_additional_clause_material_fixtures');
const { core, worldApi, catalog, copy, life } = names;
const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase();
const rules = new Set(['after_eat_walk', 'berry_observation', 'conditional_rest', 'do_not_eat',
    'name_question', 'not_dislike', 'not_now', 'preference', 'reason_question', 'rest_comfort',
    'rest_invitation', 'rest_request', 'rest_result', 'rest_value', 'situation_question',
    'sour_question', 'taste_now', 'walk_invitation', 'greeting_morning', 'work_past', 'work_again',
    'taste_question', 'rest_explanation', 'name', 'name_description', 'name_answer',
    'retract_explanation', 'yes_reply_priority', 'no_reply_priority', 'yes_reply', 'no_reply']);
const raw = 'ぽぽ\nおはよう';
function setup(options = {}) { return { ...names.setup(options), steps: [], origins: [] }; }
function focus(v, ids = ['berry:1'], scene = 'clearing') {
    core.perceive(v.state, { scene, attention: ids.map(id => ({ id, meaning: 'berry' })) }); return v;
}
function requiredIds(result, before) {
    const required = new Set(), entries = before.knowledge.wordExplanations || [];
    const inScope = entry => entry.speaker === result.input.speaker
        && (entry.scope.targets.length && before.context.attention.length
            ? entry.scope.targets.some(id => before.context.attention.some(item => item.id === id))
            : entry.scope.scene === before.context.scene);
    function source(id) {
        if (required.has(id)) return; required.add(id);
        const entry = entries.find(item => item.inputId === id); if (entry?.corrects) source(entry.corrects);
    }
    for (const frame of result.interpretations.filter(item => item.kind === 'word_reference')) {
        for (const entry of entries.filter(item => !item.retractedBy
            && normalize(item.word) === normalize(frame.meaning) && inScope(item))) source(entry.inputId);
        for (const link of before.knowledge.associations.filter(item => normalize(item.word) === normalize(frame.meaning)
            && item.speaker === result.input.speaker)) for (const evidence of link.evidence)
            if (!evidence.retractedBy && inScope({ speaker: link.speaker,
                scope: { scene: evidence.scene, targets: [link.target] } })) source(evidence.inputId);
    }
    return required;
}
function hear(v, text, options = {}) {
    const beforeState = copy(v.state), beforeWorld = copy(v.world);
    const result = core.receive(v.state, text, catalog, { locale: options.locale || 'ja',
        speaker: options.speaker || 'player', at: options.at ?? 100 + v.state.serial });
    const afterCore = copy(v.state), needed = requiredIds(result, beforeState);
    const reply = worldApi.respond(v.world, result, v.state, catalog);
    const receipt = { input: copy(result.input), inputKnowledge: copy(beforeState.knowledge),
        inputContext: copy(beforeState.context), beforeState, beforeWorld,
        afterState: copy(v.state), afterWorld: copy(v.world), reply,
        origins: copy(v.origins.filter(origin => needed.has(origin.result.input.id))) };
    const previous = beforeState.context.turns.at(-1);
    if (previous) receipt.antecedent = copy(v.steps.find(step => step.result.input.id === previous.id));
    if (result.interpretations.some(frame => frame.kind === 'reply')) {
        const origin = v.steps.find(step => step.result.input.id === beforeState.context.pendingQuestion.inputId);
        if (origin) receipt.origin = copy(origin);
    }
    const value = copy({ result, receipt }), flat = copy(value);
    delete flat.receipt.antecedent; delete flat.receipt.origin; delete flat.receipt.origins;
    v.steps.push(flat); v.origins.push(copy({ beforeState, result, afterState: afterCore }));
    return value;
}
function prepare(options = {}, speaker = 'player', text = 'ぽぽは休むことだよ') {
    const v = setup(options); if (text) hear(v, text, { speaker }); return v;
}
function expected(value) {
    const r = value.result, frames = r.interpretations, us = r.understandings;
    return r.input.locale === 'ja' && frames.length >= 2 && frames.some(frame => frame.kind === 'word_reference')
        && frames.every(frame => ['unknown', 'word_reference'].includes(frame.kind) || rules.has(frame.catalogRule)
            || frame.kind === 'naming' && !Object.hasOwn(frame, 'catalogRule'))
        && frames.filter((frame, i) => frame.kind === 'naming' && us[i].kind === 'naming' && us[i].complete).length !== 1
        && !r.relationLearning && !r.conditionJudgment && !r.sequenceJudgment
        && !(us.at(-1).kind === 'question' && us.at(-1).complete && value.receipt.reply.message === 'answer_unknown');
}
function fixtures() {
    const rows = [], add = (group, v, text = raw, options = {}) => {
        const value = hear(v, text, options); rows.push({ group, value, expected: expected(value) });
    };
    for (const foundation of [false, true]) for (const knownLife of [false, true])
        for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
            for (const text of [raw, 'ぽぽ\nぽぽ', 'これをころって呼ぼう\nこれをももって呼ぼう\nぽぽ', 'ぽぽ\n未知!'])
                add('eight-settings', prepare({ foundation, life: knownLife, speech }, speaker), text, { speaker });
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const text of [...extras.anchors, 'おはよう', ...Object.values(extras.forms), '未解析!',
            'これをころって呼ぼう', 'これをころって呼ぼう\nこれをももって呼ぼう', 'さっきの説明は間違えた', 'うん', '違う'])
            for (const reverse of [false, true]) {
                const v = prepare({ speech }, speaker); hear(v, '休むことは大事', { speaker });
                add('companions-both-orders', v, (reverse ? [text, 'ぽぽ'] : ['ぽぽ', text]).join('\n'), { speaker });
            }
    for (const speech of ['short', 'gesture']) for (const variant of ['same-meaning', 'corrected', 'correction-chain',
        'individual-corrected', 'conflict', 'individual-conflict', 'different-speaker', 'different-target',
        'no-attention', 'other-scene-no-attention', 'same-target-other-scene', 'missing-definition', 'dynamic', 'dynamic-incomplete']) {
        const v = prepare({ speech }, 'player', ['missing-definition', 'individual-corrected'].includes(variant) ? null : undefined);
        if (variant === 'same-meaning') { focus(v, ['berry:1'], 'elsewhere'); hear(v, 'ぽぽは休むことだよ'); focus(v); }
        if (['corrected', 'correction-chain'].includes(variant)) hear(v, 'さっき間違えた。ぽぽは眠ることだよ');
        if (variant === 'correction-chain') hear(v, 'さっき間違えた。ぽぽは休むことだよ');
        if (variant === 'individual-corrected') { hear(v, 'これをぽぽって呼ぼう'); hear(v, 'さっき間違えた。ぽぽは休むことだよ'); }
        if (variant === 'conflict') hear(v, 'ぽぽは木の実のことだよ');
        if (variant === 'individual-conflict') hear(v, 'これをぽぽって呼ぼう');
        if (variant === 'different-target') focus(v, ['berry:2']);
        if (variant === 'no-attention') focus(v, []);
        if (variant === 'other-scene-no-attention') focus(v, [], 'elsewhere');
        if (variant === 'same-target-other-scene') focus(v, ['berry:1'], 'elsewhere');
        if (variant === 'dynamic-incomplete') v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'naming');
        if (variant.startsWith('dynamic')) dynamic.arrive(v);
        add('source:' + variant, v, variant.startsWith('dynamic') ? 'ころ\nもも\nぽぽ' : raw,
            { speaker: variant === 'different-speaker' ? 'visitor' : 'player' });
    }
    for (const speech of ['short', 'gesture']) for (const speaker of ['player', 'visitor'])
        for (const answer of ['うん', '違う']) for (const reverse of [false, true]) for (const pair of [false, true]) {
            const v = prepare({ speech }, speaker); hear(v, 'これをころって呼ぼう', { speaker });
            const parts = ['ぽぽ', answer, ...(pair ? ['これをももって呼ぼう', 'これをののって呼ぼう'] : [])];
            add('actual-confirmation', v, (reverse ? parts.reverse() : parts).join('\n'), { speaker });
        }
    for (const speech of ['short', 'gesture']) {
        const v = prepare({ speech }); hear(v, 'これをころって呼ぼう'); hear(v, 'ころ');
        add('reasked-confirmation', v, 'ぽぽ\nうん\nこれをももって呼ぼう\nこれをののって呼ぼう');
        add('long-repetition', prepare({ speech }), Array(12).fill('ぽぽ').join('\n'));
        for (const mode of ['rest', 'eat']) {
            const v = prepare({ speech }); life.start(v, mode); life.finish(v); focus(v);
            add('completed-experience:' + mode, v);
        }
    }
    for (const locale of Object.keys(catalog.patterns)) add('other-input-locale', prepare(), raw, { locale });
    for (const text of ['ぽぽ', 'ぽぽは休むことだよ', 'さっき間違えた。ぽぽは眠ることだよ',
        'ぽぽは休むことだよ\nおはよう', 'これをころって呼ぼう\nこれをももって呼ぼう\nぽぽは休むことだよ',
        'ころ\nおはよう', '未知\n未解析!', 'おはよう', 'ぽぽ\n私は悲しい']) add('existing-owner-boundaries', prepare(), text);
    return rows;
}
module.exports = { fixtures, expected, setup, prepare, focus, hear, requiredIds, core, worldApi, catalog, copy,
    arrive: dynamic.arrive, raw, forms: extras.forms, life };
