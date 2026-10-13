'use strict';
const assert = require('node:assert/strict');
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const { setup, start, hear: teach, finish } = require('./diary_negation_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge), before = copy(world), beforeSelections = copy(state.selectionSources || []);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const response = worldApi.respond(world, result, state, catalog);
    return copy({ result, context, beforeKnowledge, decision: { speech: state.settings.speech, before, after: world,
        beforeSelections, afterSelections: state.selectionSources || [], response } });
}
function acquire(locale, life, speech) {
    const value = setup({ life, speech });
    if (!life) {
        const words = { ja: '休む', en: 'rest', 'zh-CN': '休息', ru: 'отдых', 'es-ES': 'descansar',
            'pt-BR': 'descansar', de: 'ausruhen' };
        start(value, 'rest'); teach(value, words[locale], locale); finish(value);
        assert.ok(value.state.knowledge.meanings.some(m => m.id === 'rest'));
    }
    for (const kind of ['request', 'invitation']) {
        start(value, 'rest'); const item = catalog.proposalTeaching[locale][kind];
        teach(value, `${item.marker}「${item.utterance}」`, locale); finish(value);
    }
    assert.equal(value.state.knowledge.relations.filter(r => ['request', 'invitation'].includes(r.id)).length, 2);
    return value;
}
function fixtures() {
    const all = [], add = (group, values, expected) => all.push({ group, values, expected });
    const roots = [];
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const kind of ['request', 'invitation']) {
            const v = hear(setup({ foundation, life, speech }), catalog.proposalTeaching[locale][kind].utterance, locale);
            add('seven-locales-eight-settings', [v], [foundation && life]);
            if (foundation && life) roots.push(copy(v));
        }
    const variants = {
        ja: ['休んでね', '今から木陰で少し休んでください', 'ちょっとやすんで', '休もう', '少し休憩しよう', '一緒に休もうよ',
            '散歩しよう', '一緒に散歩に行こう'], en: ['rest a little', 'let us rest', "let's rest"],
        'zh-CN': ['休息一下吧', '一起休息吧'], ru: ['давай отдохнём'], 'es-ES': ['descansemos un poco'],
        'pt-BR': ['vamos descansar um pouco'], de: ['ruhen wir uns etwas aus']
    };
    for (const [locale, raws] of Object.entries(variants)) for (const raw of raws) for (const speech of ['short', 'gesture']) {
        const v = hear(setup({ foundation: true, speech }), raw, locale);
        add('existing-pattern-forms', [v], [true]); roots.push(copy(v));
        add('existing-normalization', [hear(setup({ foundation: true, speech }), '  ' + raw.toLocaleUpperCase() + '  ', locale)], [true]);
    }
    for (const locale of Object.keys(catalog.proposalTeaching)) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const unknown = hear(setup({ life, speech }), catalog.proposalTeaching[locale].request.utterance, locale);
        const value = acquire(locale, life, speech);
        add('unknown-input-never-retroactive', [unknown], [false]);
        for (const kind of ['request', 'invitation']) {
            const raw = catalog.proposalTeaching[locale][kind].utterance;
            const v = hear(value, raw, locale); roots.push(copy(v));
            add('real-prerequisites-and-repeat', [v, hear(value, raw, locale)], [true, true]);
            const other = locale === 'ja' ? 'en' : 'ja';
            add('acquired-scope-other-language', [hear(value, catalog.proposalTeaching[other][kind].utterance, other)], [false]);
            add('acquired-scope-other-speaker', [hear(value, raw, locale, 'visitor')], [false]);
        }
        add('rest-scope-no-transfer-to-walk', [hear(value, '散歩しよう')], [false]);
        add('rest-scope-no-transfer-to-alternate-form', [hear(value, variants[locale][0], locale)],
            [variants[locale][0] === catalog.proposalTeaching[locale].request.utterance]);
    }
    for (const raw of ['休んでね', '一緒に休もう', '散歩しよう']) for (const speech of ['short', 'gesture'])
        for (const mode of ['idle', 'rest', 'move', 'eat', 'work', 'berry_low', 'berry_high', 'no_route', 'no_target', 'route']) {
            const value = setup({ foundation: true, speech }), world = value.world;
            Object.assign(world, { mode, attention: null, dwell: 3, destination: null });
            if (mode.startsWith('berry_')) Object.assign(world, { mode: 'idle', attention: 'berry:1', dwell: mode === 'berry_high' ? 5 : 4 });
            if (mode === 'no_route' || mode === 'no_target' || mode === 'route') {
                world.mode = 'idle'; world.island = { places: mode === 'no_route'
                    || mode === 'route' ? [{ id: 'shade', x: .7, y: .5 }, { id: 'path', x: .5, y: .8 }] : [] };
            }
            worldApi.setNavigation(mode === 'route' ? () => [{ x: .5, y: .6 }, { x: .7, y: .5 }] : null);
            const v = hear(value, raw); worldApi.setNavigation(null); roots.push(copy(v));
            add('actual-choice-continuation-and-unavailable', [v], [true]);
        }
    for (const raw of ['【お願い】「休んでね」', catalog.conditionTeaching.ja.utterance, catalog.sequenceTeaching.ja.utterance,
        '疲れたら休んでね', '食べ終わったら散歩しよう', '木の実を食べないで', '「ねる」は休むことだよ',
        'あなたは休んでいる', '休んでね\nunknown', '散歩しよう\n休んでね', '一緒に泳ごう'])
        add('other-owners-and-no-new-grammar', [hear(setup({ foundation: true }), raw)], [false]);
    for (const root of roots) {
        const edits = [
            v => { v.result.input.raw = 'unrelated'; }, v => { v.result.input.locale = 'other'; },
            v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.id = 'input:0'; },
            v => { v.result.interpretations[0].meaning = 'eat'; }, v => { v.result.understandings[0].complete = false; },
            v => { v.result.understandings[0].roles = { actualParticipation: true }; },
            v => { v.context.scene = 'other'; }, v => { v.context.elapsed++; },
            v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
            v => { v.beforeKnowledge.meanings.push(copy(v.beforeKnowledge.meanings.find(m => m.id === v.result.interpretations[0].meaning))); },
            v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations.find(r => r.id === v.result.interpretations[0].kind))); },
            v => { v.decision.response.message = 'made_up'; }, v => { v.decision.after.elapsed++; },
            v => { v.decision.after.experiences.push({ id: 999, kind: 'rest' }); },
            v => { v.decision.afterSelections.push({ input: { id: 'input:999' } }); },
            v => { v.decision.after.destination = 'wrong'; }
        ];
        for (const edit of edits) { const v = copy(root); edit(v); add('receipt-and-source-conflicts', [v], [false]); }
    }
    return all;
}
module.exports = { fixtures, hear, acquire };
