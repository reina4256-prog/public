'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../experimental_word_learning_core');
const worldApi = require('../experimental_word_learning_world');
const catalog = require('../experimental_word_learning_catalog.json');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_reports');
const knownExamples = require('../experimental_word_diary_known_report_examples');
const unknownExamples = require('../experimental_word_diary_report_examples');
const copy = value => JSON.parse(JSON.stringify(value));
const demo = (subject, locale) => {
    const form = catalog.reportTeaching[locale][subject];
    return form.marker + '「' + form.utterance + '」';
};
function setup(options = {}) {
    return { state: core.create({ foundation: true, life: true, ...options }, catalog), world: worldApi.create() };
}
function hear(value, raw = catalog.reportTeaching.ja.self.utterance, locale = 'ja', speaker = 'player') {
    const { state, world } = value;
    const context = copy({ scene: state.context.scene, attention: state.context.attention,
        mode: world.mode, target: world.attention, activityStart: world.activityStart, elapsed: world.elapsed });
    const beforeKnowledge = copy(state.knowledge);
    const result = core.receive(state, raw, catalog, { locale, speaker, at: 100 + state.serial });
    const reply = worldApi.respond(world, result, state, catalog);
    return { result, context, beforeKnowledge, reply };
}
const capture = (buffer, v) => reports.capture(buffer, v.result, v.context, v.beforeKnowledge);
function start(value) {
    Object.assign(value.world, { mode: 'rest', attention: 'shade', elapsed: 1, activityStart: 1,
        dwell: .1, hunger: .8, fatigue: .7, activityBefore: { hunger: .8, fatigue: .7 } });
    core.perceive(value.state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
}
const finish = value => { value.world.pause = 0; worldApi.onArrival(value.world, value.state, worldApi.tick(value.world, .1)); };
function acquire(locale = 'ja', speech = 'short') {
    const value = setup({ foundation: false, speech });
    start(value); hear(value, demo('self', locale), locale); finish(value);
    start(value); hear(value, demo('player', locale), locale); finish(value);
    return value;
}
test('ordinary testimony retains hearing source, both subjects and bases without experience or verification', () => {
    for (const subject of ['self', 'player']) {
        const value = setup(), before = copy(value.world), knowledge = copy(value.state.knowledge);
        const v = hear(value, catalog.reportTeaching.ja[subject].utterance), buffer = candidates.create();
        const supplied = JSON.stringify(v);
        assert.equal(capture(buffer, v), true);
        const entry = buffer.read()[0], data = entry.captured;
        assert.equal(entry.kind, 'report'); assert.equal(entry.sourceId, v.result.input.id);
        assert.deepEqual(data.sources.input, v.result.input); assert.deepEqual(data.sources.frame, v.result.interpretations[0]);
        assert.deepEqual(data.understanding, v.result.understandings[0]);
        assert.deepEqual(data.basis, v.beforeKnowledge.meanings.find(m => m.id === 'rest'));
        assert.deepEqual(data.relationBasis, [{ id: 'report', source: 'initial' }]);
        assert.deepEqual(data.reportSource, { kind: 'speaker_report', inputId: 'input:1', heardAt: 100,
            raw: v.result.input.raw, locale: 'ja', reporter: 'player', contentSubject: subject });
        assert.equal(data.roles.verified, false); assert.equal(data.roles.status, 'reported');
        assert.equal(data.understanding.eventTime, 'unspecified');
        for (const field of ['mode', 'destination', 'hunger', 'fatigue', 'experiences'])
            assert.deepEqual(value.world[field], before[field]);
        assert.deepEqual(value.state.knowledge, knowledge); assert.equal((value.state.experiences || []).length, 0);
        assert.equal(value.state.records.at(-1).source, 'speaker_report');
        assert.equal(value.state.context.turns.at(-1).answer, undefined);
        assert.equal(JSON.stringify(v), supplied);
        assert.equal(knownExamples.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
        assert.equal(unknownExamples.capture(candidates.create(), v.result, v.context, v.beforeKnowledge), false);
    }
});
test('seven languages and eight starts separate knowledge from speech for both ordinary subjects', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const foundation of [false, true])
        for (const life of [false, true]) for (const speech of ['short', 'gesture']) for (const subject of ['self', 'player']) {
            const v = hear(setup({ foundation, life, speech }), catalog.reportTeaching[locale][subject].utterance, locale);
            assert.equal(capture(candidates.create(), v), foundation && life, `${locale}/${subject}/${foundation}/${life}/${speech}`);
            if (foundation && life) assert.equal(v.reply.message, speech === 'gesture' ? 'attend'
                : subject === 'self' ? 'heard_report_self' : 'heard_report_player');
        }
});
test('rest, eating, movement and empty or ambiguous attention do not verify or block a heard report', () => {
    for (const mode of ['rest', 'eat', 'move', 'idle']) for (const attention of [[], [{ id: 'shade', meaning: 'rest' }],
        [{ id: 'shade', meaning: 'rest' }, { id: 'berry:1', meaning: 'berry' }]]) {
        const value = setup(); Object.assign(value.world, { mode, attention: mode === 'eat' ? 'berry:1' : null });
        core.perceive(value.state, { scene: 'clearing', attention });
        const v = hear(value), buffer = candidates.create(); assert.equal(capture(buffer, v), true);
        assert.equal(buffer.read()[0].captured.sources.activity.mode, mode);
        assert.deepEqual(buffer.read()[0].captured.sources.attention, attention);
        assert.equal(value.world.mode, mode); assert.equal(value.world.destination, null);
    }
});
test('real two-rest contrasts supply only their own speaker, language, form and subject relation bases', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) for (const speech of ['short', 'gesture']) {
        const value = acquire(locale, speech); assert.equal(value.state.experiences.length, 2);
        for (const subject of ['self', 'player']) {
            const v = hear(value, catalog.reportTeaching[locale][subject].utterance, locale), buffer = candidates.create();
            assert.equal(capture(buffer, v), true);
            assert.deepEqual(buffer.read()[0].captured.relationBasis, v.result.understandings[0].relationReferences);
            assert.equal(buffer.read()[0].captured.relationBasis[0].scope.roles.contentSubject, subject);
            assert.equal(buffer.read()[0].captured.reportSource.contentSubject, subject);
        }
        const alternate = locale === 'ja' ? 'en' : 'ja';
        assert.equal(capture(candidates.create(), hear(value, catalog.reportTeaching[alternate].self.utterance, alternate)), false);
        assert.equal(capture(candidates.create(), hear(value, catalog.reportTeaching[locale].self.utterance, locale, 'visitor')), false);
    }
});
test('new repeated reports remain separate while rereceive, reading, completion and later knowledge are inert', () => {
    const value = setup(), buffer = candidates.create(); start(value);
    const first = hear(value), second = hear(value), other = hear(value, catalog.reportTeaching.ja.player.utterance);
    for (const v of [first, second, other]) assert.equal(capture(buffer, v), true);
    const original = buffer.read(); assert.deepEqual(original.map(e => e.sourceId), ['input:1', 'input:2', 'input:3']);
    finish(value); worldApi.approach(value.world, 'path'); value.state.knowledge.relations = [];
    value.state.knowledge.meanings = [];
    for (const v of [first, second, other]) assert.equal(capture(buffer, v), false);
    first.result.input.raw = 'changed'; first.beforeKnowledge.relations = [];
    buffer.read()[0].captured.roles.verified = true;
    assert.deepEqual(buffer.read(), original);
});
test('unknown earlier reports are not retroactively captured after actual teaching acquisition', () => {
    const value = setup({ foundation: false }), before = hear(value), buffer = candidates.create();
    assert.equal(capture(buffer, before), false); start(value); hear(value, demo('self', 'ja')); finish(value);
    start(value); hear(value, demo('player', 'ja')); finish(value);
    assert.equal(capture(buffer, before), false); assert.equal(capture(buffer, hear(value)), true);
    assert.equal(buffer.read().length, 1); assert.equal(buffer.read()[0].captured.understanding.complete, true);
});
test('teaching, negation, time, feelings, continuation and other inputs remain separate entrances', () => {
    for (const raw of [demo('self', 'ja'), demo('player', 'ja'), catalog.negationTeaching.ja.negative.utterance,
        catalog.timeTeaching.ja.now.utterance, catalog.timeTeaching.ja.past.utterance,
        '悲しい', 'どうして休んだの？', '休んでね', 'あなたは休んでいる？', 'unsupported input']) {
        assert.equal(capture(candidates.create(), hear(setup(), raw)), false, raw);
    }
    const value = setup(); hear(value, '昨日、うまくいかなかった');
    assert.equal(capture(candidates.create(), hear(value, 'それで悲しかった')), false);
});
test('identity, testimony source, scene, roles and scoped references must all match input-time material', () => {
    const v = hear(acquire());
    for (const mutate of [v => { v.beforeKnowledge.meanings = []; }, v => { v.beforeKnowledge.relations = []; },
        v => { v.context.scene = 'other'; }, v => { v.result.input.id = 'input:0'; },
        v => { v.result.input.at++; }, v => { v.result.input.locale = 'en'; },
        v => { v.result.input.speaker = 'visitor'; }, v => { v.result.input.raw = 'other'; },
        v => { v.result.interpretations[0].kind = 'report_demonstration'; },
        v => { v.result.interpretations[0].roles.verified = true; },
        v => { v.result.interpretations[0].relations.push('negation'); },
        v => { v.result.interpretations[0].span = 'other'; },
        v => { v.result.understandings[0].complete = false; },
        v => { v.result.understandings[0].roles.contentSubject = 'player'; },
        v => { v.result.understandings[0].eventTime = 'now'; },
        v => { delete v.result.understandings[0].reportSource; },
        ...['inputId', 'heardAt', 'raw', 'locale', 'reporter', 'contentSubject', 'kind'].map(field => v => {
            v.result.understandings[0].reportSource[field] = 'other';
        }),
        ...['form', 'speaker', 'locale', 'kind', 'meaning'].map(field => v => {
            v.beforeKnowledge.relations[0].scope[field] = 'other';
        }),
        v => { v.beforeKnowledge.relations[0].scope.roles.verified = true; },
        v => { v.result.understandings[0].relationReferences = []; },
        v => { v.result.understandings[0].relationReferences[0].evidence = []; },
        v => { v.result.understandings[0].reportReference = { inputId: 'input:1' }; },
        v => { v.result.interpretations.push(copy(v.result.interpretations[0])); }]) {
        const invalid = copy(v); mutate(invalid); assert.equal(capture(candidates.create(), invalid), false);
    }
});
test('existing normal-report normalization preserves the unmodified original input', () => {
    for (const locale of Object.keys(catalog.reportTeaching)) {
        const raw = '  ' + catalog.reportTeaching[locale].self.utterance.toLocaleUpperCase() + '  ';
        const v = hear(setup(), raw, locale), buffer = candidates.create();
        assert.equal(capture(buffer, v), true); assert.equal(buffer.read()[0].captured.reportSource.raw, raw);
    }
});
