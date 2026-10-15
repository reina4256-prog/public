'use strict';
// Existing forms executed by the real owners in disposable memory. These
// inputs are verification data, not new game text or accepted grammar.
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const { start, finish } = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const forms = {
    ja: ['ぽぽは休むことだよ', '「ぽぽ」しよう', 'さっき間違えた。ぽぽは眠ることだよ'],
    en: ['"ぽぽ" means "rest"', 'let\'s "ぽぽ"', 'I was wrong. "ぽぽ" means "sleep"'],
    'zh-CN': ['“ぽぽ”的意思是“休息”', '一起“ぽぽ”吧', '刚才说错了。“ぽぽ”的意思是“睡觉”'],
    ru: ['"ぽぽ" значит "отдых"', 'давай "ぽぽ"', 'Я ошибся. "ぽぽ" значит "спать"'],
    'es-ES': ['"ぽぽ" significa "descansar"', 'vamos a "ぽぽ"', 'Me equivoqué. "ぽぽ" significa "dormir"'],
    'pt-BR': ['"ぽぽ" significa "descansar"', 'vamos "ぽぽ"', 'Eu errei. "ぽぽ" significa "dormir"'],
    de: ['"ぽぽ" bedeutet "ausruhen"', 'lass uns "ぽぽ"', 'Ich habe mich geirrt. "ぽぽ" bedeutet "schlafen"']
};
function setup(options = {}) {
    const value = { state: core.create(options, catalog), world: worldApi.create(), origins: [] };
    focus(value); return value;
}
function focus(value, scene = 'clearing', ids = ['berry:1']) {
    core.perceive(value.state, { scene, attention: ids.map(id => ({ id, meaning: 'berry' })) });
}
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const beforeState = copy(value.state), beforeWorld = copy(value.world);
    const result = core.receive(value.state, raw, catalog, { locale, speaker, at: 100 + value.state.serial });
    const afterCore = copy(value.state);
    const needed = new Set();
    function source(id) {
        if (needed.has(id)) return;
        needed.add(id);
        const entry = beforeState.knowledge.wordExplanations?.find(e => e.inputId === id);
        if (entry?.corrects) source(entry.corrects);
    }
    for (const u of result.understandings) {
        for (const application of u.applications || []) for (const entry of application.candidates) source(entry.inputId);
        if (u.kind === 'reference') for (const candidate of u.target.candidates)
            for (const id of candidate.evidence || []) source(id);
    }
    const origins = value.origins.filter(origin => needed.has(origin.result.input.id));
    const reply = worldApi.respond(value.world, result, value.state, catalog);
    value.origins.push(copy({ beforeState, result, afterState: afterCore }));
    return copy({ result, receipt: { input: result.input, inputKnowledge: beforeState.knowledge,
        beforeState, beforeWorld, afterState: value.state, afterWorld: value.world, reply, origins } });
}
function fixtures() {
    const all = [], add = (group, value, expected) => all.push({ group, value, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const v = setup({ foundation, life, speech }); hear(v, forms.ja[0]);
        add('word-eight-settings', hear(v, 'ぽぽ'), foundation && life);
        add('invitation-eight-settings', hear(v, forms.ja[1]), foundation && life);
        const n = setup({ foundation, life, speech }); hear(n, 'これをぴぴって呼ぼう');
        add('individual-eight-settings', hear(n, 'ぴぴ'), foundation);
    }
    for (const [locale, texts] of Object.entries(forms)) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); hear(v, texts[0], locale);
        add('word-seven-languages', hear(v, 'ぽぽ', locale), true);
        add('invitation-seven-languages', hear(v, texts[1], locale), true);
        hear(v, texts[2], locale);
        add('corrected-source-seven-languages', hear(v, 'ぽぽ', locale), true);
        add('sleep-invitation-outside-adopted-range', hear(v, texts[1], locale), false);
        const n = setup({ speech }); hear(n, 'これをぴぴって呼ぼう');
        add('individual-seven-input-locales', hear(n, 'ぴぴ', locale), true);
    }
    for (const meaning of ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired']) {
        const v = setup(); hear(v, `ぽぽは${catalog.meanings[meaning][0]}のことだよ`);
        add('eight-life-meanings', hear(v, 'ぽぽ'), true);
    }
    for (const meaning of Object.keys(catalog.experienceMeanings)) {
        const v = setup(); require('./diary_answer_fixtures').completeWork(v, meaning.split(':')[1] || 'farming');
        hear(v, `ぽぽは${catalog.experienceMeanings[meaning][0]}のことだよ`);
        add('seven-demonstrated-work-meanings', hear(v, 'ぽぽ'), true);
    }
    for (const mode of ['eat', 'work', 'observe', 'rest']) for (const speech of ['short', 'gesture']) {
        const v = setup({ speech }); hear(v, forms.ja[0]);
        Object.assign(v.world, { mode, attention: mode === 'observe' ? 'berry:1' : 'shade', dwell: 8 });
        add('invitation-current-judgment', hear(v, forms.ja[1]), true);
    }
    {
        const v = setup(); hear(v, forms.ja[0]);
        v.world.island = { places: [], paths: [], obstacles: [] };
        add('invitation-route-not-started', hear(v, forms.ja[1]), true);
    }
    for (const [scene, ids, expected] of [['elsewhere', ['berry:1'], true], ['clearing', ['berry:2'], false],
        ['clearing', [], true], ['elsewhere', [], false]]) {
        const v = setup(); hear(v, forms.ja[0]); focus(v, scene, ids);
        add('word-scene-target-scope', hear(v, 'ぽぽ'), expected);
    }
    for (const individual of [false, true]) {
        const v = setup(); hear(v, individual ? 'これをぽぽって呼ぼう' : forms.ja[0]);
        add('different-speaker', hear(v, 'ぽぽ', 'ja', 'friend'), false);
    }
    {
        const v = setup(); hear(v, forms.ja[0]); hear(v, 'ぽぽは木の実のことだよ');
        add('conflicting-meanings', hear(v, 'ぽぽ'), false);
        add('conflicting-meanings-invitation', hear(v, forms.ja[1]), false);
    }
    {
        const v = setup(); hear(v, 'これをぽぽって呼ぼう'); hear(v, forms.ja[0]);
        add('word-individual-conflict', hear(v, 'ぽぽ'), false);
        add('word-individual-conflict-invitation', hear(v, forms.ja[1]), false);
    }
    {
        const v = setup(); hear(v, forms.ja[0]); focus(v, 'elsewhere'); hear(v, forms.ja[0]);
        add('same-meaning-multiple-valid-sources', hear(v, 'ぽぽ'), true);
    }
    for (const attention of [['berry:1'], ['berry:2'], ['berry:1', 'berry:2'], []]) {
        const v = setup(); hear(v, 'これをぴぴって呼ぼう'); focus(v, 'elsewhere', ['berry:2']);
        hear(v, 'これをぴぴって呼ぼう'); focus(v, 'third', attention);
        add('individual-attention-resolution', hear(v, 'ぴぴ'), attention.length === 1);
    }
    {
        const v = setup(); hear(v, 'これをぴぴって呼ぼう'); focus(v, 'elsewhere');
        add('individual-other-scene', hear(v, 'ぴぴ'), true);
    }
    {
        const v = setup(); hear(v, forms.ja[0]);
        hear(v, 'さっき間違えた。ぽぽは眠ることだよ');
        hear(v, 'さっき間違えた。ぽぽは休むことだよ');
        add('corrected-chain-current-source', hear(v, 'ぽぽ'), true);
        add('corrected-chain-invitation', hear(v, forms.ja[1]), true);
    }
    {
        const v = setup(); hear(v, 'これをぽぽって呼ぼう');
        hear(v, 'さっき間違えた。ぽぽは休むことだよ');
        add('individual-origin-corrected-to-word', hear(v, 'ぽぽ'), true);
    }
    {
        const v = setup({ life: false }); start(v, 'rest'); hear(v, '休む'); finish(v);
        hear(v, forms.ja[0]); add('experienced-life-source', hear(v, 'ぽぽ'), true);
        add('experienced-life-invitation', hear(v, forms.ja[1]), true);
    }
    for (const raw of ['おはよう', 'はい', '違うよ', '何してる？', 'もう一度教えて', '休んでね',
        '私は休んでいる', '「ぽぽ」しよう。私は悲しい', '私は「ぽぽ」しよう', '疲れたら「ぽぽ」しよう', '「ぽぽ」しないで']) {
        const v = setup(); hear(v, forms.ja[0]); add('other-owners-and-unadopted-forms', hear(v, raw), false);
    }
    {
        const v = setup(); hear(v, forms.ja[0]);
        v.state.knowledge.relations = v.state.knowledge.relations.filter(r => r.id !== 'invitation');
        add('invitation-relation-missing', hear(v, forms.ja[1]), false);
    }
    return all;
}
module.exports = { fixtures, setup, focus, hear, forms };
