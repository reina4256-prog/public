'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_diary_rest_explanation_reports');
const candidates = require('../experimental_word_diary_candidates');
const { fixtures, prepared: setup, hearExplanation: hear } = require('../scripts/experimental/diary_rest_explanation_report_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const values = fixtures();
const capture = (buffer, value) => api.capture(buffer, value.result, value.receipt);
const explanationProse = require('../experimental_word_diary_rest_explanation_prose');
const proseFixtures = require('../scripts/experimental/diary_rest_explanation_prose_fixtures');
const proseSentence = '\u4f11\u3080\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002';
function proseMaterial(v) {
    const buffer = candidates.create(); api.capture(buffer, v.result, v.receipt); return buffer.read()[0];
}
test('DK/DL preserve separate original importance and recovery-explanation evidence without completing either', () => {
    const examples = proseFixtures.examples(); assert.equal(examples.length, 2);
    for (const v of examples) {
        const record = proseMaterial(v), c = record.captured, a = v.receipt.antecedent;
        const original = JSON.stringify({ record, v });
        assert.equal(explanationProse.render(record, v.result, v.receipt), proseSentence);
        assert.deepEqual(c.sources.antecedent, a);
        assert.notEqual(v.result.input.id, a.result.input.id);
        assert.deepEqual(a.result.understandings[0].unresolved, [{ type: 'detail', token: 'importance' }]);
        assert.deepEqual(v.result.understandings[0].unresolved, [{ type: 'detail', token: 'recovery_explanation' }]);
        assert.deepEqual(a.result.understandings[0].relations, ['report']);
        assert.deepEqual(v.result.understandings[0].relations, ['report', 'reason']);
        for (const item of [a, v]) {
            const u = item.result.understandings[0];
            assert.equal(u.complete, false); assert.deepEqual(u.known, { meaning: 'rest' });
            assert.equal(u.subject, 'player'); assert.equal(u.polarity, 'positive');
            assert.equal(u.eventTime, 'unspecified'); assert.equal(u.aspect, null); assert.equal(u.conditionStatus, null);
            assert.deepEqual(u.reportSource, { kind: 'speaker_report', inputId: item.result.input.id, heardAt: item.result.input.at });
            assert.equal(item.receipt.reply.message, c.actualSpeech ? 'heard_rest_partial' : 'attend');
            assert.equal(Object.hasOwn(item.receipt.reply, 'observation'), false);
            for (const field of ['knowledge', 'experiences', 'selectionSources'])
                assert.deepEqual(item.receipt.beforeState[field], item.receipt.afterState[field]);
            assert.deepEqual(item.receipt.beforeWorld.experiences, item.receipt.afterWorld.experiences);
        }
        assert.equal(Object.hasOwn(c, 'expression'), false);
        assert.equal(Object.hasOwn(a.receipt, 'antecedent'), false);
        assert.equal(c.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        assert.equal(c.status, 'reported'); assert.equal(c.verified, false);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('DK/DL reject missing current or flat prior evidence and never reconstruct an antecedent', () => {
    for (const v of proseFixtures.examples()) {
        const record = proseMaterial(v);
        for (const phase of ['current', 'prior']) for (const field of ['input', 'inputKnowledge', 'inputContext',
            'beforeState', 'beforeWorld', 'afterState', 'afterWorld', 'reply']) {
            const changed = copy(v), receipt = phase === 'current' ? changed.receipt : changed.receipt.antecedent.receipt;
            delete receipt[field];
            assert.equal(explanationProse.render(record, changed.result, changed.receipt), null, `${phase}:${field}`);
        }
        const missing = copy(v); delete missing.receipt.antecedent;
        assert.equal(explanationProse.render(record, missing.result, missing.receipt), null);
        const recursive = copy(v); recursive.receipt.antecedent.receipt.antecedent = {};
        assert.equal(explanationProse.render(record, recursive.result, recursive.receipt), null);
        for (const bad of [null, undefined, {}, [], { ...record, extra: true }])
            assert.equal(explanationProse.render(bad, v.result, v.receipt), null);
        const cyclic = copy(v); cyclic.receipt.antecedent.receipt.antecedent = cyclic;
        assert.equal(explanationProse.render(record, cyclic.result, cyclic.receipt), null);
    }
});
test('DK/DL reject changed originals, expression repair, invented truth and later knowledge', () => {
    for (const v of proseFixtures.examples()) {
        const record = proseMaterial(v);
        for (const edit of [
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.status = 'understood'; }, x => { x.record.captured.verified = true; },
            x => { x.record.captured.newLearning = true; },
            x => { x.record.captured.sources.antecedent.result.input.at++; },
            x => { x.v.result.understandings[0].known.detail = 'recovery_explanation'; },
            x => { x.v.result.understandings[0].subject = 'self'; },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.antecedent.result.understandings[0].unresolved = []; },
            x => { x.v.receipt.antecedent.result.understandings[0].known.meaning = 'eat'; },
            x => { x.v.receipt.antecedent.receipt.inputKnowledge.meanings.push({ id: 'later' }); },
            x => { x.v.receipt.inputKnowledge.relations.push({ id: 'later' }); },
            x => { x.v.receipt.beforeState.context.turns.at(-1).speaker = 'invented'; },
            x => { x.v.receipt.reply.message = 'invented'; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { x.v.receipt.antecedent.receipt.afterWorld.elapsed++; },
            x => { x.v.result.input.raw += '\n'; },
            x => { x.v.receipt.antecedent.result.input.raw += '\n'; }
        ]) {
            const x = copy({ record, v }), before = JSON.stringify(x); edit(x);
            const changed = JSON.stringify(x); assert.notEqual(changed, before);
            assert.equal(explanationProse.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), changed);
        }
    }
});
test('DK/DL exclude other ax scopes and keep identical aw prose as separate original material in all seven locales', () => {
    const aw = require('../experimental_word_diary_rest_value_reports');
    const awProse = require('../experimental_word_diary_rest_value_prose');
    for (const v of proseFixtures.excludedExamples()) {
        const record = proseMaterial(v), before = JSON.stringify({ record, v });
        assert.equal(explanationProse.render(record, v.result, v.receipt), null, JSON.stringify(v.result.input));
        assert.equal(JSON.stringify({ record, v }), before);
    }
    const examples = proseFixtures.examples();
    for (const v of examples) {
        const record = proseMaterial(v), a = v.receipt.antecedent, buffer = candidates.create();
        assert.equal(aw.capture(buffer, a.result, a.receipt), true);
        const priorRecord = buffer.read()[0];
        assert.equal(awProse.render(priorRecord, a.result, a.receipt), proseSentence);
        assert.equal(explanationProse.render(priorRecord, v.result, v.receipt), null);
        assert.equal(explanationProse.render(record, a.result, a.receipt), null);
        assert.equal(awProse.render(record, v.result, v.receipt), null);
        const other = examples.find(item => item !== v);
        assert.equal(explanationProse.render(record, other.result, other.receipt), null);
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            assert.equal(typeof require('../locales/' + locale + '.json')[proseSentence], 'string');
    }
});
for (const group of new Set(values.map(f => f.group))) test(`rest explanation report candidate: ${group}`, () => {
    for (const f of values.filter(item => item.group === group)) {
        const v = copy(f.value), source = JSON.stringify(v), buffer = candidates.create();
        assert.equal(capture(buffer, v), f.expected, JSON.stringify([group, v.result.input]));
        assert.equal(JSON.stringify(v), source); assert.equal(buffer.read().length, Number(f.expected));
        assert.equal(capture(buffer, v), false);
        if (!f.expected) continue;
        const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
        assert.equal(record.kind, 'report');
        assert.equal(record.captured.status, 'reported');
        assert.equal(record.captured.verified, false);
        assert.equal(record.captured.understanding.conditionStatus, null);
        assert.equal(record.captured.understanding.complete, false);
        assert.deepEqual(record.captured.understanding.unresolved, [{ type: 'detail', token: 'recovery_explanation' }]);
        assert.deepEqual(record.captured.reportSource, v.result.understandings[0].reportSource);
        assert.deepEqual(record.captured.response, v.receipt.reply);
        assert.deepEqual(record.captured.understanding, v.result.understandings[0]);
        assert.equal(record.captured.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        for (const flag of ['newTeaching', 'newLearning', 'newExperience'])
            assert.equal(record.captured[flag], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        record.captured.sources.input.raw = 'changed'; v.result.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
        assert.equal(candidates.create().retain(record), true);
    }
});
const edits = [
    v => { v.result.input.id = 'input:999'; }, v => { v.result.input.at++; },
    v => { v.result.input.raw += 'changed'; }, v => { v.result.input.speaker = 'other'; },
    v => { v.result.input.locale = 'en'; }, v => { v.result.input.scene += ':changed'; },
    v => { v.result.understandings[0].complete = true; },
    v => { v.result.interpretations.push(copy(v.result.interpretations[0])); },
    v => { v.receipt.input.at++; }, v => { v.receipt.inputKnowledge.relations = []; },
    v => { v.receipt.inputContext.scene += ':changed'; }, v => { v.receipt.beforeState.serial++; },
    v => { v.receipt.beforeState.context.attention.push({ id: 'other', meaning: 'comfort' }); }, v => { v.receipt.afterState.serial++; },
    v => { v.receipt.reply.message = 'invented'; }, v => { v.receipt.afterWorld.elapsed++; },
    v => { v.receipt.afterState.context.turns.at(-1).speaker = 'other'; },
    v => { delete v.receipt.beforeWorld; }, v => { delete v.receipt.afterState; },
    v => { v.result.understandings[0].reportSource.heardAt++; },
    v => { v.result.understandings[0].subject = 'self'; },
    v => { v.result.understandings[0].aspect = 'activity_report'; },
    v => { v.result.understandings[0].polarity = 'negative'; },
    v => { v.result.understandings[0].eventTime = 'past'; },
    v => { v.result.understandings[0].known.meaning = 'comfortable'; },
    v => { v.receipt.beforeWorld.attention = 'shade:tampered'; },
    v => { v.receipt.afterWorld.experiences.push({ id: 'invented' }); },
    v => { v.result.understandings[0].conditionStatus = 'met'; },
    v => { v.result.understandings[0].unresolved = []; }
];
const priorEdits = [
    v => { delete v.receipt.antecedent; },
    v => { v.receipt.antecedent.result.input.id = 'input:0'; },
    v => { v.receipt.antecedent.result.input.at++; },
    v => { v.receipt.antecedent.result.input.speaker = 'invented'; },
    v => { v.receipt.antecedent.result.input.raw += 'changed'; },
    v => { v.receipt.antecedent.result.understandings[0].known.meaning = 'eat'; },
    v => { v.receipt.antecedent.receipt.inputKnowledge.meanings = []; },
    v => { v.receipt.antecedent.receipt.inputContext.scene += ':changed'; },
    v => { v.receipt.antecedent.receipt.beforeState.serial++; },
    v => { v.receipt.antecedent.receipt.afterState.serial++; },
    v => { v.receipt.antecedent.receipt.reply.message = 'invented'; },
    v => { v.receipt.antecedent.receipt.afterWorld.elapsed++; },
    v => { delete v.receipt.antecedent.receipt.beforeWorld; },
    v => { delete v.receipt.antecedent.receipt.afterState; },
    v => { v.receipt.antecedent.receipt.antecedent = {}; },
    v => { v.receipt.beforeState.context.turns.at(-1).speaker = 'invented'; },
    v => { v.result.understandings[0].relations = ['report']; }
];
test('rest explanation requires flat replayable prior rest materials and preserves them independently', () => {
    for (const f of values.filter(item => item.expected)) {
        for (const edit of priorEdits) {
            const v = copy(f.value); edit(v);
            assert.equal(capture(candidates.create(), v), false, `${f.group}: ${edit}`);
        }
        const buffer = candidates.create(), v = copy(f.value);
        assert.equal(capture(buffer, v), true);
        const retained = JSON.stringify(buffer.read());
        assert.deepEqual(buffer.read()[0].captured.sources.antecedent, v.receipt.antecedent);
        v.receipt.antecedent.result.input.raw = 'changed';
        buffer.read()[0].captured.sources.antecedent.receipt.input.raw = 'changed';
        assert.equal(JSON.stringify(buffer.read()), retained);
    }
});
test('rest explanation report candidate rejects mismatched inputs, knowledge, actual expression and before/after copies', () => {
    for (const f of values.filter(item => item.expected)) for (const edit of edits) {
        const v = copy(f.value); edit(v);
        assert.equal(capture(candidates.create(), v), false, `${f.group}: ${edit}`);
    }
});
test('new rest explanation report inputs remain separate while duplicate input cannot overwrite material', () => {
    const v = setup(), buffer = candidates.create(), first = hear(v);
    assert.equal(capture(buffer, first), true); const retained = buffer.read()[0];
    for (let i = 0; i < 12; i++) assert.equal(capture(buffer, hear(v)), true);
    assert.equal(buffer.read().length, 13);
    assert.equal(capture(buffer, first), false);
    assert.deepEqual(buffer.read()[0], retained);
    assert.equal(new Set(buffer.read().map(item => item.sourceId)).size, 13);
});
test('later initial knowledge cannot retroactively turn an old partial rest explanation report into material', () => {
    const v = setup({ foundation: false }), buffer = candidates.create(), early = hear(v);
    assert.equal(capture(buffer, early), false);
    v.state.knowledge = copy(setup().state.knowledge);
    assert.equal(capture(buffer, hear(v)), true);
    assert.equal(capture(buffer, early), false); assert.equal(buffer.read().length, 1);
});
test('rest explanation report candidate rejects non-JSON receipt data without retaining partial material', () => {
    for (const malformed of [Infinity, undefined, () => {}, new Date(), Symbol('invalid')]) {
        const v = copy(values.find(f => f.expected).value); v.receipt.invalid = malformed;
        assert.equal(capture(candidates.create(), v), false);
    }
    const v = copy(values.find(f => f.expected).value); v.receipt.invalid = v.receipt;
    assert.equal(capture(candidates.create(), v), false);
});
