'use strict';
// Actual receive/respond in disposable Node memory. Archived input-before
// receipts are temporary test material; no actor or storage enters the renderer.
const core = require('../../experimental_word_learning_core');
const worldApi = require('../../experimental_word_learning_world');
const catalog = require('../../experimental_word_learning_catalog.json');
const copy = v => JSON.parse(JSON.stringify(v));
const setup = settings => ({ state: core.create(settings, catalog), world: worldApi.create(), archive: [] });
function hear(value, raw, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const receipt = { context: copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed,
        lastOutput: state.context.lastOutput || null, priorExperiences: state.experiences || [] }),
        beforeKnowledge: copy(state.knowledge), beforeFeelingLearning: copy(state.feelingLearning || { events: [], knowledge: [] }),
        beforeTurns: copy(state.context.turns), beforeRecords: copy(state.records) };
    receipt.result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const reply = worldApi.respond(world, receipt.result, state, catalog);
    const beforeReports = copy(value.archive);
    value.archive.push(copy(receipt));
    return copy({ ...receipt, beforeReports, reply });
}
const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
const basic = ['悲しい', 'I am sad', '我很难过', 'мне грустно', 'estoy triste', 'estou triste', 'ich bin traurig'];
const echo = ['そう、その話', 'Yes, that is what I meant', '对，我说的就是这件事', 'да, я об этом',
    'sí, a eso me refiero', 'sim, é disso que estou falando', 'ja, das meine ich'];
const ordinary = ['昨日は仕事で失敗した', '今日は量子実験で成功した', 'さっきは試験でうまくいかなかった',
    '昨日は仕事で失敗して悲しかった', '今日は仕事で成功してうれしかった', '今はつらい', '私は疲れている',
    '悲しい', 'うれしい', 'つらかった', 'さっきは疲れていた', '今日はうれしい'];
function fixtures() {
    const output = [], seeds = [];
    const add = (group, values, expected) => output.push({ group, values, expected });
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const options = { foundation, life, speech };
        for (const raw of ordinary) {
            const v = setup(options), r = hear(v, raw);
            add('japanese-existing-reports-eight-settings', [r], [foundation && life]);
            if (foundation && life && speech === 'short') seeds.push(r);
        }
        for (const [index, locale] of locales.entries()) {
            const v = setup(options), first = hear(v, basic[index], locale), second = hear(v, echo[index], locale);
            add('seven-language-basic-and-echo', [first, second, hear(v, echo[index], locale)], [foundation && life, false, false]);
        }
        const v = setup(options), event = hear(v, '昨日は仕事で失敗した');
        const confirm = hear(v, 'そのことだよ'), extension = hear(v, 'それで悲しかった');
        const again = hear(v, 'その話だよ'), next = hear(v, 'そのことでうれしかった');
        add('event-confirmation-new-feeling-chain', [event, confirm, extension, again, next],
            [foundation && life, false, foundation && life, false, foundation && life]);
        if (foundation && life && speech === 'short') seeds.push(extension, next);
    }
    for (const time of ['今日', '昨日', 'さっき']) for (const prefix of ['それで', 'そのことで']) {
        const v = setup(); const first = hear(v, `${time}は仕事で成功した`), next = hear(v, prefix + 'うれしかった');
        add('reference-time-distinct-from-hearing', [first, next], [true, true]);
    }
    for (const raw of ['それで今はうれしい', 'そのことで今日は悲しい', 'それで悲しい', 'そのことで疲れていた']) {
        const v = setup(); const first = hear(v, '昨日は仕事で失敗した');
        add('explicit-new-time-not-replaced', [first, hear(v, raw)], [true, true]);
    }
    for (const [index, locale] of locales.entries()) {
        const v = setup(), first = hear(v, basic[index], locale);
        add('cross-locale-existing-confirmation', [first, hear(v, 'その話だよ'), hear(v, 'それでうれしかった')], [true, false, true]);
        const normalized = setup(); add('existing-normalization', [hear(normalized, '  ' + basic[index].toUpperCase() + '  ', locale)], [true]);
        const p = catalog.feelingContrast[locale]; const fixed = hear(setup(), p.past, locale);
        const f = setup(), original = hear(f, p.past, locale);
        add('fixed-ag-ah-ownership-and-continuation', [fixed, hear(setup(), p.past + p.join + p.present, locale),
            original, hear(f, 'それでうれしかった')], [false, false, false, true]);
    }
    for (const interruption of ['今何してるの？', 'unsupported', '悲しくない', '彼は悲しかった',
        '悲しかったら休もう', '悲しかった。うれしい', '昨日は悲しかったけど、今はうれしい']) {
        const v = setup(); const first = hear(v, '昨日は仕事で失敗した'); hear(v, interruption);
        add('topic-and-scope-interruption', [first, hear(v, 'それで悲しかった')], [true, false]);
    }
    for (const raw of ['それで悲しくない', 'そのことで悲しかったら休もう', 'それで悲しかった？',
        '彼は悲しい', '今日は彼が仕事で失敗した', '昨日は仕事で失敗した？',
        '悲しい。うれしい', '昨日は悲しかったけど今はうれしい', '休んでね', 'あなたは休んでいる',
        '悲しかったからうれしい', '【報告】「悲しい」', 'unsupported input']) {
        const v = setup(); hear(v, '昨日は仕事で失敗した');
        add('unsupported-not-trimmed-into-report', [hear(v, raw)], [false]);
    }
    const visitor = setup(); hear(visitor, '昨日は仕事で失敗した');
    add('other-speaker', [hear(visitor, 'それで悲しかった', 'ja', 'visitor'), hear(setup(), '悲しい', 'ja', 'visitor')], [false, false]);
    const observation = setup(); const old = hear(observation, '昨日は仕事で失敗した');
    worldApi.onArrival(observation.world, observation.state, { id: 6, kind: 'experience', activity: 'eat', target: 'berry:1' });
    add('intervening-observation-cuts-reference', [old, hear(observation, 'それで悲しかった')], [true, false]);
    for (const mode of ['rest', 'eat', 'move', 'idle']) for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
        [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
        const v = setup(); v.world.mode = mode; v.world.elapsed = 20; v.world.activityStart = 10;
        core.perceive(v.state, { scene: 'elsewhere', attention });
        add('hearing-context-no-own-experience', [hear(v, '今はつらい')], [true]);
    }
    const repetition = setup(); add('new-input-repetition', [hear(repetition, '悲しい'), hear(repetition, '悲しい')], [true, true]);
    const long = setup(), chain = [hear(long, '昨日は仕事で失敗した')];
    for (let i = 0; i < 10; i++) chain.push(hear(long, 'その話だよ'));
    chain.push(hear(long, 'それで悲しかった'));
    add('original-receipt-survives-eight-turn-limit', chain, [true, ...Array(10).fill(false), true]);
    const tired = setup({ life: false });
    Object.assign(tired.world, { mode: 'rest', attention: 'shade', elapsed: 1, activityStart: 1,
        dwell: .1, hunger: .8, fatigue: .7, activityBefore: { hunger: .8, fatigue: .7 } });
    core.perceive(tired.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
    hear(tired, '"疲れた"'); tired.world.pause = 0;
    worldApi.onArrival(tired.world, tired.state, worldApi.tick(tired.world, .1));
    const acquiredTired = hear(tired, '私は疲れている');
    add('experienced-tired-word-does-not-verify-player-fatigue', [acquiredTired], [true]);
    for (const change of [v => { v.context.priorExperiences = []; },
        v => { v.context.priorExperiences[0].before.fatigue = .1; },
        v => { v.beforeKnowledge.meanings[0].evidence[0].scope.inputId = v.result.input.id; },
        v => { v.beforeKnowledge.meanings[0].evidence[0].scope.target = 'other'; }]) {
        const damaged = copy(acquiredTired); change(damaged); add('experienced-word-basis-conflicts', [damaged], [false]);
    }
    const withheld = setup({ foundation: false, life: false }), rejected = hear(withheld, '悲しい');
    // This models separate later initial knowledge, not a newly adopted learning rule.
    withheld.state.knowledge = core.create({}, catalog).knowledge;
    add('rejected-input-not-retroactive', [rejected, hear(withheld, '悲しい')], [false, true]);
    const restOnly = setup({ foundation: false });
    restOnly.state.knowledge.relations.push({ id: 'report', source: 'experienced_relation', scope: { kind: 'report', meaning: 'rest' } });
    add('rest-only-scope-not-a-feeling-report', [hear(restOnly, '悲しい')], [false]);
    const { acquire } = require('./diary_single_feeling_report_fixtures');
    // Learned fixed-form evidence stays with ag; it cannot broaden 1c syntax.
    for (const locale of locales) {
        const learned = acquire({ foundation: false, life: false }, locale); learned.archive = [];
        const original = hear(learned, catalog.feelingContrast[locale].past, locale);
        add('learned-fixed-scope-not-generalized', [original, hear(learned, 'それで悲しかった'), hear(learned, basic[locales.indexOf(locale)], locale)], [false, false, false]);
    }
    const changes = [
        v => { v.result.input.id = 'input:0'; }, v => { v.result.input.at++; }, v => { v.result.input.locale = 'xx'; },
        v => { v.result.input.raw = 'other'; }, v => { v.context.scene = 'changed'; }, v => { v.context.elapsed = -1; },
        v => { v.context.activityStart = v.context.elapsed + 1; }, v => { v.context.attention = [null]; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
        v => { v.result.interpretations[0].meaning = 'rest'; }, v => { v.result.interpretations[0].span = 'other'; },
        v => { v.result.understandings[0].kind = 'partial'; }, v => { v.result.understandings[0].subject = 'self'; },
        v => { v.result.understandings[0].complete = !v.result.understandings[0].complete; },
        v => { v.result.understandings[0].reportSource.heardAt++; }, v => { v.result.understandings[0].eventTime = 'tomorrow'; },
        v => { v.result.understandings[0].unresolved.push({ type: 'meaning', token: 'other' }); },
        v => { v.result.understandings[0].testimony = { verified: true }; },
        v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.beforeKnowledge.meanings.push(copy(v.beforeKnowledge.meanings.find(e => e.id === v.result.interpretations[0].meaning))); },
        v => { v.beforeKnowledge.relations.push(copy(v.beforeKnowledge.relations[0])); },
        v => { v.result.learning[0].updated = [{ id: 'sad' }]; }, v => { v.result.relationLearning = {}; },
        v => { v.result.feelingLearning = {}; }
    ];
    for (const seed of seeds) for (const change of changes) {
        const v = copy(seed); change(v); add('current-receipt-conflicts', [v], [false]);
    }
    for (const seed of seeds.filter(v => v.result.understandings[0].reportReference)) {
        const mutations = [
            v => { v.beforeReports = []; }, v => { v.beforeReports.push(copy(v.beforeReports[0])); },
            v => { v.beforeReports.reverse(); },
            v => { v.beforeRecords = []; }, v => { v.beforeTurns = []; },
            v => { v.context.lastOutput = { inputId: 'input:999', source: { kind: 'observation' } }; },
            v => { v.beforeReports[0].beforeKnowledge.meanings = []; },
            v => { v.beforeReports[0].result.input.raw = 'other'; },
            v => { v.beforeReports[0].result.understandings[0].complete = true; },
            v => { v.beforeReports[0].result.understandings[0].unresolved = []; },
            v => { v.beforeRecords[0].retractedBy = 'input:999'; },
            v => { v.beforeRecords[0].heardAt++; },
            v => { v.beforeTurns.at(-1).speaker = 'visitor'; },
            v => { v.result.understandings[0].reportReference.inputId = v.result.input.id; },
            v => { v.result.understandings[0].timeSource = 'current_clock'; },
            v => { v.beforeReports.at(-1).result.input.at = v.result.input.at + 1; },
            v => { v.beforeReports[0].result.understandings[0].reportReference = { inputId: v.beforeReports[0].result.input.id }; }
        ];
        for (const change of mutations) { const v = copy(seed); change(v); add('original-and-previous-conflicts', [v], [false]); }
    }
    return output;
}
module.exports = { fixtures, setup, hear, ordinary, basic, echo, locales };
