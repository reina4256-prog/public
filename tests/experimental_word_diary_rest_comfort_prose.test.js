'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_rest_comfort_reports');
const incompleteReports = require('../experimental_word_diary_incomplete_rest_comfort_reports');
const prose = require('../experimental_word_diary_rest_comfort_prose');
const valueProse = require('../experimental_word_diary_rest_value_prose');
const valueReports = require('../experimental_word_diary_rest_value_reports');
const incompleteValueReports = require('../experimental_word_diary_incomplete_rest_value_reports');
const valueFixtures = require('../scripts/experimental/diary_rest_value_prose_fixtures');
const valueSentence = '\u4f11\u3080\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002';
function valueMaterial(v) {
    const buffer = candidates.create();
    return valueReports.capture(buffer, v.result, v.receipt)
        || incompleteValueReports.capture(buffer, v.result, v.receipt) ? buffer.read()[0] : null;
}
test('DB/DC separate absent records from learned but inapplicable scope without rewriting evidence', () => {
    const values = valueFixtures.bothMissingAndScopedExamples(); assert.equal(values.length, 6);
    for (const v of values) {
        const record = valueMaterial(v), c = record.captured, u = v.result.understandings[0];
        const scoped = v.receipt.inputKnowledge.relations.some(entry => entry.id === 'report');
        const before = JSON.stringify({ record, v });
        assert.equal(valueProse.render(record, v.result, v.receipt), scoped ? valueSentence
            : '\u8a00\u308f\u308c\u305f\u3053\u3068\u304c\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002');
        assert.equal(u.kind, 'partial'); assert.equal(u.complete, false);
        assert.deepEqual(u.known, scoped ? { meaning: 'rest' } : {});
        assert.deepEqual(u.relations, []); assert.equal(u.subject, null);
        assert.deepEqual(u.unresolved, [{ type: 'relation', id: 'report' },
            ...(!scoped ? [{ type: 'meaning', field: 'meaning', token: 'rest' }] : []),
            { type: 'detail', token: 'importance' }]);
        assert.equal(u.aspect, null); assert.equal(u.conditionStatus, null);
        assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified');
        assert.equal(c.meaningKnownBefore, scoped); assert.equal(c.relationsKnownBefore, false);
        assert.deepEqual(c.missingRelationsBefore, ['report']);
        assert.equal(c.response.message, scoped && c.actualSpeech ? 'uncertain' : 'attend');
        for (const field of ['expression', 'reportSource', 'status', 'verified']) assert.equal(Object.hasOwn(c, field), false);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(Object.hasOwn(u, 'reportSource'), false);
        assert.deepEqual(c.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(c.sources.activity.before, v.receipt.beforeWorld);
        assert.deepEqual(c.sources.activity.after.experiences, v.receipt.beforeWorld.experiences);
        if (scoped) {
            assert.equal(v.receipt.beforeState.experiences.length, 2);
            assert.equal(v.receipt.inputKnowledge.relations.filter(e => e.id === 'report').length, 2);
            assert.ok(v.receipt.inputKnowledge.relations.every(e => e.source === 'experienced_relation'));
        }
        assert.equal(JSON.stringify({ record, v }), before);
    }
});
test('CZ/DA preserve separate missing meaning/relation, original source and actual reply', () => {
    const values = valueFixtures.incompleteExamples(); assert.equal(values.length, 8);
    for (const v of values) {
        const record = valueMaterial(v), c = record.captured, u = v.result.understandings[0];
        const original = JSON.stringify({ record, v }), missingRest = !c.meaningKnownBefore;
        const text = missingRest ? '\u4f55\u304b\u3092\u4f1d\u3048\u3089\u308c\u305f\u3051\u308c\u3069\u3001\u4f55\u306e\u3053\u3068\u304b\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002' : valueSentence;
        assert.equal(valueProse.render(record, v.result, v.receipt), text);
        assert.deepEqual(c.understanding, u); assert.equal(u.complete, false);
        assert.equal(u.kind, missingRest ? 'report' : 'partial');
        assert.deepEqual(u.known, missingRest ? {} : { meaning: 'rest' });
        assert.deepEqual(u.relations, missingRest ? ['report'] : []);
        assert.deepEqual(u.unresolved, [missingRest ? { type: 'meaning', field: 'meaning', token: 'rest' }
            : { type: 'relation', id: 'report' }, { type: 'detail', token: 'importance' }]);
        assert.equal(u.subject, missingRest ? 'player' : null);
        assert.equal(Object.hasOwn(c, 'reportSource'), missingRest);
        assert.equal(Object.hasOwn(u, 'reportSource'), missingRest);
        if (missingRest) assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(u.aspect, null); assert.equal(u.conditionStatus, null);
        assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified');
        assert.equal(c.response.message, !missingRest && c.actualSpeech ? 'uncertain' : 'attend');
        assert.equal(c.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        for (const field of ['expression', 'status', 'verified']) assert.equal(Object.hasOwn(c, field), false);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(Object.hasOwn(c.response, 'observation'), false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        assert.equal(valueReports.capture(candidates.create(), v.result, v.receipt), false);
        assert.equal(prose.render(record, v.result, v.receipt), null);
        for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'])
            assert.equal(typeof require('../locales/' + locale + '.json')[text], 'string');
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('CZ..DC reject missing receipts, changed evidence, later knowledge and cross-source records', () => {
    const values = [...valueFixtures.incompleteExamples(), ...valueFixtures.bothMissingAndScopedExamples()];
    for (const v of values) {
        const record = valueMaterial(v);
        for (const field of ['input', 'inputKnowledge', 'inputContext', 'beforeState', 'afterState', 'beforeWorld', 'afterWorld', 'reply']) {
            const receipt = copy(v.receipt); delete receipt[field];
            assert.equal(valueProse.render(record, v.result, receipt), null, field);
        }
        for (const edit of [
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.status = 'reported'; },
            x => { x.record.captured.verified = false; },
            x => { x.record.captured.newLearning = true; },
            x => { x.record.captured.reportSource = { kind: 'speaker_report', inputId: 'invented', heardAt: 0 }; },
            x => { x.v.result.understandings[0].subject = 'self'; },
            x => { x.v.result.understandings[0].known.detail = 'importance'; },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.expression = {}; },
            x => { x.v.result.input.raw += '\n'; },
            x => { x.v.receipt.inputKnowledge.meanings.push({ id: 'later' }); },
            x => { x.v.receipt.inputContext.attention = []; },
            x => { x.v.receipt.afterState.serial++; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { x.v.receipt.reply.message = 'invented'; }
        ]) {
            const x = copy({ record, v }); edit(x); const before = JSON.stringify(x);
            assert.equal(valueProse.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), before);
        }
        for (const other of values.filter(item => item !== v))
            assert.equal(valueProse.render(record, other.result, other.receipt), null);
        const later = copy(v);
        later.receipt.beforeState.knowledge = copy(valueFixtures.examples()[0].receipt.inputKnowledge);
        later.receipt.inputKnowledge = copy(later.receipt.beforeState.knowledge);
        assert.equal(valueProse.render(record, later.result, later.receipt), null);
    }
});
test('CR/CS preserve original rest-value detail, source, reply and six-material boundaries', () => {
    const values = valueFixtures.examples(); assert.equal(values.length, 2);
    for (const [i, v] of values.entries()) {
        const record = valueMaterial(v), before = JSON.stringify({ record, v }), u = v.result.understandings[0];
        assert.equal(valueProse.render(record, v.result, v.receipt), valueSentence);
        assert.equal(u.kind, 'report'); assert.equal(u.complete, false);
        assert.deepEqual(u.known, { meaning: 'rest' }); assert.deepEqual(u.relations, ['report']);
        assert.deepEqual(u.unresolved, [{ type: 'detail', token: 'importance' }]);
        assert.equal(u.subject, 'player'); assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified');
        assert.equal(u.aspect, null); assert.equal(u.conditionStatus, null);
        assert.deepEqual(u.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(record.captured.response.message, i ? 'attend' : 'heard_rest_partial');
        assert.equal(record.captured.actualSpeech, !i); assert.equal(Object.hasOwn(record.captured, 'expression'), false);
        assert.equal(record.captured.status, 'reported'); assert.equal(record.captured.verified, false);
        for (const field of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[field], false);
        assert.equal(Object.hasOwn(v.receipt.reply, 'observation'), false);
        assert.equal(JSON.stringify({ record, v }), before);
        assert.equal(prose.render(record, v.result, v.receipt), null);
    }
});
test('CR..CY reject each absent receipt field, changed original and material substitution', () => {
    const values = [...valueFixtures.examples(), ...valueFixtures.addedExamples(), ...valueFixtures.punctuationExamples(),
        ...valueFixtures.activityFatigueExamples()];
    for (const v of values) {
        const record = valueMaterial(v);
        for (const field of ['input', 'inputKnowledge', 'inputContext', 'beforeState', 'afterState', 'beforeWorld', 'afterWorld', 'reply']) {
            const receipt = copy(v.receipt); delete receipt[field];
            assert.equal(valueProse.render(record, v.result, receipt), null, field);
        }
        for (const edit of [
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.newLearning = true; },
            x => { x.record.captured.understanding.complete = true; },
            x => { x.record.captured.reportSource.heardAt++; },
            x => { x.record.captured.inputKnowledge.meanings = []; },
            x => { x.v.result.input.raw += '\n'; },
            x => { x.v.result.understandings[0].unresolved = []; },
            x => { x.v.result.understandings[0].aspect = 'rest_comfort'; },
            x => { x.v.result.understandings[0].conditionStatus = 'unknown'; },
            x => { delete x.v.result.understandings[0].reportSource; },
            x => { x.v.result.expression = {}; },
            x => { x.v.receipt.inputKnowledge.relations = []; },
            x => { x.v.receipt.inputContext.scene = 'invalid'; },
            x => { x.v.receipt.reply.message = 'uncertain'; },
            x => { x.v.receipt.afterState.serial++; },
            x => { x.v.receipt.afterWorld.elapsed++; }
        ]) {
            const x = copy({ record, v }); edit(x); const original = JSON.stringify(x);
            assert.equal(valueProse.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), original);
        }
        const other = values.find(item => item !== v);
        assert.equal(valueProse.render(record, other.result, other.receipt), null);
        for (const bad of [null, {}, [], undefined, { ...record, extra: true }])
            assert.equal(valueProse.render(bad, v.result, v.receipt), null);
        const cyclic = {}; cyclic.self = cyclic;
        assert.equal(valueProse.render(record, cyclic, v.receipt), null);
        const later = copy(v); later.receipt.beforeState.knowledge.meanings = [];
        assert.equal(valueProse.render(record, later.result, later.receipt), null);
        assert.equal(valueProse.render(record, v.result, v.receipt), valueSentence);
    }
});
test('CR..CY reject combined forms/shore, scopes, missing knowledge and unadopted contexts', () => {
    const excluded = valueFixtures.excludedExamples(); assert.ok(excluded.length > 100);
    for (const v of excluded) {
        const record = valueMaterial(v), original = JSON.stringify({ record, v });
        assert.equal(valueProse.render(record, v.result, v.receipt), null, v.result.input.raw);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    for (const v of valueFixtures.examples()) {
        const record = valueMaterial(v);
        for (const speech of [null, '', 'other']) {
            const changed = copy(v); changed.receipt.beforeState.settings.speech = speech;
            assert.equal(valueProse.render(record, changed.result, changed.receipt), null);
        }
    }
});
test('CT/CU preserve nineteen original spellings and the separate basic shore source in both speech settings', () => {
    const values = valueFixtures.addedExamples(); assert.equal(values.length, 40);
    const forms = new Set(); let shore = 0;
    for (const v of values) {
        const record = valueMaterial(v), original = JSON.stringify({ record, v }), c = record.captured;
        assert.equal(valueProse.render(record, v.result, v.receipt), valueSentence);
        assert.deepEqual(c.understanding, v.result.understandings[0]);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'detail', token: 'importance' }]);
        assert.deepEqual(c.understanding.known, { meaning: 'rest' });
        assert.deepEqual(c.understanding.relations, ['report']);
        assert.equal(c.understanding.kind, 'report'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, 'player'); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, null);
        assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(c.sources.input.raw, v.result.input.raw);
        assert.deepEqual(c.sources.attention, v.receipt.inputContext.attention);
        if (v.receipt.inputContext.scene === 'shore') {
            shore++; assert.deepEqual(c.sources.attention, []);
            assert.equal(/^休むことは大事$/u.exec(c.sources.input.raw)?.[0], c.sources.input.raw);
        } else forms.add(c.sources.input.raw);
        assert.equal(c.sources.activity.before.attention, null);
        assert.equal(c.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        assert.equal(c.response.message, c.actualSpeech ? 'heard_rest_partial' : 'attend');
        assert.equal(Object.hasOwn(c, 'expression'), false); assert.equal(Object.hasOwn(c.response, 'observation'), false);
        for (const field of ['verified', 'newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        assert.equal(prose.render(record, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    assert.equal(forms.size, 19); assert.equal(shore, 2);
});
test('CV/CW preserve exact original whitespace and punctuation with initial short evidence only', () => {
    const values = valueFixtures.punctuationExamples(); assert.equal(values.length, 3);
    const raw = '\u4f11\u3080\u3053\u3068\u306f\u5927\u4e8b';
    assert.deepEqual(values.map(v => v.result.input.raw), [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]);
    for (const v of values) {
        const record = valueMaterial(v), original = JSON.stringify({ record, v }), c = record.captured;
        assert.equal(valueProse.render(record, v.result, v.receipt), valueSentence);
        assert.equal(c.sources.input.raw, v.result.input.raw);
        assert.deepEqual(c.sources.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        assert.equal(c.sources.scene, 'clearing'); assert.equal(c.sources.activity.before.attention, null);
        assert.deepEqual(c.understanding, v.result.understandings[0]);
        assert.deepEqual(c.understanding.known, { meaning: 'rest' }); assert.deepEqual(c.understanding.relations, ['report']);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'detail', token: 'importance' }]);
        assert.equal(c.understanding.complete, false); assert.equal(c.understanding.kind, 'report');
        assert.equal(c.understanding.subject, 'player'); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, null);
        assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(c.actualSpeech, true); assert.equal(c.response.message, 'heard_rest_partial');
        assert.equal(c.status, 'reported');
        for (const field of ['verified', 'newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(Object.hasOwn(c, 'expression'), false); assert.equal(Object.hasOwn(c.response, 'observation'), false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        assert.deepEqual(v.receipt.beforeWorld.experiences, v.receipt.afterWorld.experiences);
        for (const other of values.filter(item => item !== v))
            assert.equal(valueProse.render(record, other.result, other.receipt), null);
        assert.equal(prose.render(record, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('CX/CY preserve fifteen activity/fatigue sources without inventing importance, rest or movement evidence', () => {
    const values = valueFixtures.activityFatigueExamples(); assert.equal(values.length, 15);
    const modes = new Map(), fatigues = [];
    for (const v of values) {
        const record = valueMaterial(v), original = JSON.stringify({ record, v }), c = record.captured;
        const w = v.receipt.beforeWorld, speech = v.receipt.beforeState.settings.speech;
        assert.equal(valueProse.render(record, v.result, v.receipt), valueSentence);
        if (w.mode === 'idle') { fatigues.push(w.fatigue); assert.equal(speech, 'short'); }
        else { modes.set(w.mode, (modes.get(w.mode) || 0) + 1); assert.equal(w.fatigue, .15); }
        assert.equal(/^休むことは大事$/u.exec(c.sources.input.raw)?.[0], c.sources.input.raw);
        assert.equal(c.sources.scene, 'clearing');
        assert.deepEqual(c.sources.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        assert.deepEqual(c.sources.activity, { before: w, after: v.receipt.afterWorld });
        assert.equal(w.attention, null); assert.equal(w.hunger, .35);
        assert.deepEqual(c.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(c.understanding, v.result.understandings[0]);
        assert.deepEqual(c.understanding.known, { meaning: 'rest' });
        assert.deepEqual(c.understanding.relations, ['report']);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'detail', token: 'importance' }]);
        assert.equal(c.understanding.kind, 'report'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, 'player'); assert.equal(c.understanding.polarity, 'positive');
        assert.equal(c.understanding.eventTime, 'unspecified');
        assert.equal(c.understanding.aspect, null); assert.equal(c.understanding.conditionStatus, null);
        assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(c.actualSpeech, speech === 'short');
        assert.equal(c.response.message, speech === 'short' ? 'heard_rest_partial' : 'attend');
        assert.equal(c.status, 'reported');
        for (const field of ['verified', 'newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(Object.hasOwn(c, 'expression'), false); assert.equal(Object.hasOwn(c.response, 'observation'), false);
        for (const field of ['knowledge', 'experiences', 'selectionSources'])
            assert.deepEqual(v.receipt.beforeState[field], v.receipt.afterState[field]);
        for (const field of ['mode', 'hunger', 'fatigue', 'attention', 'experiences', 'reasons', 'recovery', 'destination'])
            assert.deepEqual(v.receipt.beforeWorld[field], v.receipt.afterWorld[field]);
        for (const other of values.filter(item => item !== v))
            assert.equal(valueProse.render(record, other.result, other.receipt), null);
        assert.equal(prose.render(record, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    assert.deepEqual([...modes.keys()], ['observe', 'eat', 'rest', 'work', 'walk']);
    assert.deepEqual([...modes.values()], [2, 2, 2, 2, 2]);
    assert.deepEqual(fatigues, [0, .2, .4, .8, 1]);
});

test('CR..CY reuse the existing seven locale entries without fallback or rest-comfort source substitution', () => {
    for (const locale of ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de']) {
        const entries = require('../locales/' + locale + '.json');
        assert.equal(Object.hasOwn(entries, valueSentence), true);
        assert.equal(typeof entries[valueSentence], 'string'); assert.ok(entries[valueSentence].length);
    }
    const { setup, hearComfort } = require('../scripts/experimental/diary_rest_comfort_report_fixtures');
    const v = hearComfort(setup());
    assert.equal(valueProse.render(material(v), v.result, v.receipt), null);
});
const { fixtures, setup, hearComfort, raw, core } = require('../scripts/experimental/diary_rest_comfort_report_fixtures');
const { scopedExamples, scopedExcludedExamples, contextExamples, contextExcludedExamples, examples, incompleteExamples, partialExamples, partialExcludedExamples, relationExamples,
    relationExcludedExamples, doubleMissingExamples, doubleMissingExcludedExamples,
    mixedReportExamples, mixedReportExcludedExamples, mixedConditionExamples, mixedConditionExcludedExamples,
    threeMissingExamples, threeMissingExcludedExamples, alternateExamples, alternateExcludedExamples,
    unknownAlternateExamples, unknownAlternateExcludedExamples, punctuationExamples, punctuationExcludedExamples,
    excludedExamples, fatigueExcludedExamples } = require('../scripts/experimental/diary_rest_comfort_prose_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const sentence = '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044\u3068\u805e\u3044\u305f\u3002';
function material(v) {
    const buffer = candidates.create();
    return reports.capture(buffer, v.result, v.receipt) || incompleteReports.capture(buffer, v.result, v.receipt)
        ? buffer.read()[0] : null;
}
const render = v => prose.render(material(v), v.result, v.receipt);
test('CP/CQ preserve learned scope, absent source and original incomplete understanding without replay writes', () => {
    const values = scopedExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v }), u = v.result.understandings[0];
        assert.equal(render(v), relationSentence);
        assert.equal(u.kind, 'partial'); assert.equal(u.complete, false);
        assert.deepEqual(u.known, { meaning: 'comfortable', conditionMeaning: 'rest' });
        assert.deepEqual(u.relations, index < 2 ? [] : ['report']);
        assert.deepEqual(u.unresolved, (index < 2 ? ['report', 'condition'] : ['condition']).map(id => ({ type: 'relation', id })));
        assert.equal(u.subject, null); assert.equal(u.aspect, null); assert.equal(u.conditionStatus, 'unknown');
        assert.equal(Object.hasOwn(u, 'reportSource'), false); assert.equal(Object.hasOwn(record.captured, 'reportSource'), false);
        assert.equal(Object.hasOwn(record.captured, 'expression'), false);
        assert.equal(record.captured.response.message, index % 2 ? 'attend' : 'uncertain');
        assert.equal(record.captured.actualSpeech, index % 2 === 0);
        assert.deepEqual(record.captured.inputKnowledge, v.receipt.inputKnowledge);
        assert.deepEqual(record.captured.sources.activity.before, v.receipt.beforeWorld);
        assert.deepEqual(record.captured.understanding, u);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(record.captured[key], false);
        for (const field of ['input', 'inputKnowledge', 'inputContext', 'beforeState', 'afterState', 'beforeWorld', 'afterWorld', 'reply']) {
            const receipt = copy(v.receipt); delete receipt[field]; assert.equal(prose.render(record, v.result, receipt), null);
        }
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.understandings[0].subject = 'player'; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge.relations = []; },
            x => { x.v.receipt.afterWorld.elapsed++; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null); assert.equal(JSON.stringify(x), altered);
        }
        const other = values[(index + 2) % 4];
        assert.equal(prose.render(record, other.result, other.receipt), null);
        assert.equal(prose.render(material(other), v.result, v.receipt), null);
        const later = { state: copy(v.receipt.beforeState), world: copy(v.receipt.beforeWorld) };
        later.state.knowledge.relations = copy(setup().state.knowledge.relations);
        const complete = hearComfort(later); assert.equal(complete.result.understandings[0].complete, true);
        assert.equal(prose.render(record, complete.result, complete.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = scopedExcludedExamples(); assert.equal(excluded.length, 134);
    for (const v of excluded) assert.equal(render(v), null);
});
test('CN/CO preserve all fifteen absence layouts across ten separate activity/fatigue contexts', () => {
    const values = contextExamples(), seen = new Set(); assert.equal(values.length, 300);
    for (const [index, v] of values.entries()) {
        const mask = Math.floor(index % 30 / 2) + 1, record = material(v), c = record.captured;
        const original = JSON.stringify({ v, record }), u = v.result.understandings[0];
        const expected = !(mask & 3) ? relationSentence : !(mask & 2) ? partialSentences[0]
            : !(mask & 1) ? partialSentences[1] : mask === 3 ? doubleMissingSentence : unknownSentence;
        assert.equal(prose.render(record, v.result, v.receipt), expected);
        assert.equal(c.sources.input.raw, raw); assert.deepEqual(c.inputContext, v.receipt.inputContext);
        assert.deepEqual(c.sources.activity.before, v.receipt.beforeWorld);
        assert.deepEqual(c.understanding, u); assert.deepEqual(c.inputKnowledge, v.receipt.inputKnowledge);
        const relations = ['report', 'condition'].filter((_, bit) => mask & (4 << bit));
        const meanings = ['comfortable', 'rest'].filter((_, bit) => mask & (1 << bit))
            .map(token => ({ type: 'meaning', field: token === 'rest' ? 'conditionMeaning' : 'meaning', token }));
        assert.deepEqual(c.missingRelationsBefore, relations); assert.deepEqual(c.missingMeaningsBefore, meanings);
        assert.deepEqual(u.unresolved, [...relations.map(id => ({ type: 'relation', id })), ...meanings]);
        assert.deepEqual(u.relations, ['report', 'condition'].filter(id => !relations.includes(id)));
        assert.deepEqual(u.known, { ...(!(mask & 1) ? { meaning: 'comfortable' } : {}),
            ...(!(mask & 2) ? { conditionMeaning: 'rest' } : {}) });
        assert.equal(u.kind, mask < 4 ? 'report' : 'partial'); assert.equal(u.complete, false);
        assert.equal(u.subject, mask < 4 ? 'player' : null); assert.equal(u.aspect, mask < 4 ? 'rest_comfort' : null);
        assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified'); assert.equal(u.conditionStatus, 'unknown');
        if (mask < 4) assert.deepEqual(c.reportSource,
            { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        else for (const obj of [c, u]) assert.equal(Object.hasOwn(obj, 'reportSource'), false);
        assert.equal(c.meaningKnownBefore, !(mask & 1)); assert.equal(c.conditionMeaningKnownBefore, !(mask & 2));
        assert.equal(c.relationsKnownBefore, !(mask & 12)); assert.equal(c.actualSpeech, index % 2 === 0);
        assert.equal(c.response.message, (mask & 3) === 3 || index % 2 ? 'attend' : 'uncertain');
        assert.equal(Object.hasOwn(c, 'expression'), false); assert.equal(Boolean(c.response.observation), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        seen.add(`${v.receipt.inputContext.scene}:${v.receipt.beforeWorld.mode}:${v.receipt.beforeWorld.fatigue}:${mask}:${index % 2}`);
        assert.equal(JSON.stringify({ v, record }), original);
    }
    assert.equal(seen.size, 300);
    const excluded = contextExcludedExamples(); assert.equal(excluded.length, 7520);
    for (const v of excluded) assert.equal(render(v), null);
});
test('CN/CO reject missing evidence, altered sources, context/layout exchanges and later knowledge', () => {
    const values = contextExamples();
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const field of ['input', 'inputKnowledge', 'inputContext', 'beforeState', 'afterState', 'beforeWorld', 'afterWorld', 'reply']) {
            const receipt = copy(v.receipt); delete receipt[field];
            assert.equal(prose.render(record, v.result, receipt), null);
        }
        for (const edit of [
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.newExperience = true; },
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.unresolved.push({ type: 'relation', id: 'other' }); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.understandings[0].complete = true; },
            x => { x.v.receipt.inputKnowledge = copy(setup().state.knowledge); },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.afterWorld.elapsed++; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null); assert.equal(JSON.stringify(x), altered);
        }
        for (const other of [values[(index + 30) % 300], values[Math.floor(index / 30) * 30 + (index + 2) % 30]]) {
            assert.equal(prose.render(record, other.result, other.receipt), null);
            assert.equal(prose.render(material(other), v.result, v.receipt), null);
        }
        const later = setup({ speech: v.receipt.beforeState.settings.speech });
        core.perceive(later.state, v.receipt.inputContext); later.world.mode = v.receipt.beforeWorld.mode;
        later.world.fatigue = v.receipt.beforeWorld.fatigue;
        const complete = hearComfort(later);
        assert.equal(complete.result.understandings[0].complete, true);
        assert.equal(prose.render(record, complete.result, complete.receipt), null);
        assert.equal(prose.render(material(complete), v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('CL/CM preserve ninety original forms/layouts, independent evidence and actual replies', () => {
    const values = punctuationExamples(); assert.equal(values.length, 90);
    const seen = new Set();
    for (const [index, v] of values.entries()) {
        const mask = Math.floor(index % 30 / 2) + 1, record = material(v), c = record.captured;
        const original = JSON.stringify({ v, record }), u = v.result.understandings[0];
        const expected = !(mask & 1) && !(mask & 2) ? relationSentence
            : !(mask & 2) ? partialSentences[0] : !(mask & 1) ? partialSentences[1]
                : mask === 3 ? doubleMissingSentence : unknownSentence;
        assert.equal(render(v), expected);
        assert.equal(prose.render(record, v.result, v.receipt), expected);
        assert.equal(c.sources.input.raw, [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`][Math.floor(index / 30)]);
        const unresolved = [];
        if (mask & 4) unresolved.push({ type: 'relation', id: 'report' });
        if (mask & 8) unresolved.push({ type: 'relation', id: 'condition' });
        if (mask & 1) unresolved.push({ type: 'meaning', field: 'meaning', token: 'comfortable' });
        if (mask & 2) unresolved.push({ type: 'meaning', field: 'conditionMeaning', token: 'rest' });
        assert.deepEqual(u.unresolved, unresolved);
        assert.deepEqual(u.relations, ['report', 'condition'].filter((_, i) => !(mask & (4 << i))));
        assert.deepEqual(u.known, { ...(!(mask & 1) ? { meaning: 'comfortable' } : {}),
            ...(!(mask & 2) ? { conditionMeaning: 'rest' } : {}) });
        assert.equal(u.kind, mask < 4 ? 'report' : 'partial'); assert.equal(u.complete, false);
        assert.equal(u.subject, mask < 4 ? 'player' : null); assert.equal(u.aspect, mask < 4 ? 'rest_comfort' : null);
        assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified'); assert.equal(u.conditionStatus, 'unknown');
        if (mask < 4) assert.deepEqual(c.reportSource,
            { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        else { assert.equal(Object.hasOwn(c, 'reportSource'), false); assert.equal(Object.hasOwn(u, 'reportSource'), false); }
        assert.equal(c.actualSpeech, index % 2 === 0);
        assert.equal(v.receipt.reply.message, (mask & 3) === 3 || index % 2 ? 'attend' : 'uncertain');
        assert.equal(Object.hasOwn(c, 'expression'), false); assert.equal(Boolean(v.receipt.reply.observation), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ v, record }), original);
        seen.add(`${v.result.input.raw}:${mask}:${index % 2}`);
    }
    assert.equal(seen.size, 90);
    for (const v of punctuationExcludedExamples()) assert.equal(render(v), null, v.result.input.raw);
});
test('CL/CM reject missing evidence, repaired sources, exchanged forms/layouts and later knowledge', () => {
    const values = punctuationExamples();
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const field of ['input', 'inputKnowledge', 'inputContext', 'beforeState', 'afterState', 'beforeWorld', 'afterWorld', 'reply']) {
            const receipt = copy(v.receipt); delete receipt[field];
            assert.equal(prose.render(record, v.result, receipt), null);
        }
        for (const mutate of [
            r => { r.captured.newLearning = true; },
            r => { r.captured.understanding.unresolved.reverse(); r.captured.understanding.unresolved.push({ type: 'meaning', token: 'other' }); },
            r => { r.captured.sources.input.raw = raw; },
            r => { r.captured.reportSource = { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at }; r.captured.understanding.subject = 'player'; r.captured.newExperience = true; }
        ]) {
            const altered = copy(record); mutate(altered);
            assert.equal(prose.render(altered, v.result, v.receipt), null);
        }
        const otherForm = values[(index + 30) % 90], otherLayout = values[Math.floor(index / 30) * 30 + (index + 2) % 30];
        for (const other of [otherForm, otherLayout]) {
            assert.equal(prose.render(record, other.result, other.receipt), null);
            assert.equal(prose.render(material(other), v.result, v.receipt), null);
        }
        const later = hearComfort(setup({ speech: v.receipt.beforeState.settings.speech }), v.result.input.raw);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        assert.equal(prose.render(material(later), v.result, v.receipt), null);
        assert.equal(prose.render(record, v.result, v.receipt), render(v));
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('BL-BR: original complete reports and distinct actual replies yield only the adopted heard sentence', () => {
    const values = examples(); assert.equal(values.length, 44);
    for (const v of values) {
        const record = material(v), original = JSON.stringify({ record, v });
        const short = v.receipt.beforeState.settings.speech === 'short';
        assert.equal(v.receipt.reply.message, short ? 'heard_rest_comfort' : 'attend');
        assert.equal(record.captured.actualSpeech, short);
        assert.equal(prose.render(record, v.result, v.receipt), sentence);
        assert.equal(prose.render(record, v.result, v.receipt), sentence);
        assert.equal(JSON.stringify({ record, v }), original);
        assert.equal(record.captured.status, 'reported');
        assert.equal(record.captured.understanding.conditionStatus, 'unknown');
        for (const key of ['verified', 'newTeaching', 'newLearning', 'newExperience'])
            assert.equal(record.captured[key], false);
        assert.equal(Object.hasOwn(record.captured, 'expression'), false);
    }
});
test('av owner acceptance does not extend BL-BQ prose beyond the adopted settings and contexts', () => {
    for (const f of fixtures()) {
        const v = f.value, w = v.receipt.beforeWorld, c = v.receipt.inputContext;
        const allowed = f.expected && ['eight-settings', 'existing-japanese-forms',
            'seven-input-locales-no-new-grammar', 'no-target-required',
            'single-trim-and-terminal-punctuation', 'activity-does-not-prove-personal-comfort',
            'fatigue-does-not-resolve-condition-or-cause'].includes(f.group)
            && v.result.input.locale === 'ja'
            && v.result.input.speaker === 'player' && ['clearing', 'shore'].includes(c.scene)
            && w.attention === null && w.hunger === .35 && (w.fatigue === .15
                || f.group === 'fatigue-does-not-resolve-condition-or-cause');
        const buffer = candidates.create();
        const actual = reports.capture(buffer, v.result, v.receipt)
            ? prose.render(buffer.read()[0], v.result, v.receipt) : null;
        assert.equal(actual, allowed ? sentence : null, f.group);
    }
    for (const text of [raw + '\n', raw + '\r\n', raw + ' ', ' ' + raw])
        assert.equal(render(hearComfort(setup(), text)), null);
    for (const field of ['hunger', 'fatigue']) {
        const v = setup(); v.world[field] = .5;
        assert.equal(render(hearComfort(v)), null);
    }
    const v = setup(); v.state.context.attention = [{ id: 'berry:2', meaning: 'berry' }];
    assert.equal(render(hearComfort(v)), null);
});
test('BN eleven forms stay separate from BO basic shore report and preserve raw source spelling', () => {
    const values = examples(), variants = values.slice(2, 24), shore = values.slice(24, 26);
    assert.equal(new Set(variants.map(v => v.result.input.raw)).size, 11);
    for (const v of variants) {
        const record = material(v);
        assert.equal(record.captured.sources.input.raw, v.result.input.raw);
        assert.notEqual(v.result.input.raw, raw);
        const s = setup({ speech: v.receipt.beforeState.settings.speech });
        core.perceive(s.state, { scene: 'shore', attention: [] });
        const combined = hearComfort(s, v.result.input.raw);
        assert.ok(material(combined));
        assert.equal(render(combined), null);
        for (const text of [' ' + v.result.input.raw + ' ', v.result.input.raw + '\u3002', v.result.input.raw + '\n'])
            assert.equal(render(hearComfort(setup(), text)), null);
    }
    for (const v of shore) {
        assert.equal(v.result.input.raw, raw);
        assert.equal(v.result.input.at, 987654321);
        assert.deepEqual(v.receipt.inputContext.attention, []);
        assert.equal(v.receipt.beforeWorld.attention, null);
        assert.equal(render(v), sentence);
    }
});
test('BP/BQ preserve original punctuation and activity without combining finite adoption scopes', () => {
    const values = examples(), bp = values.slice(26, 29), bq = values.slice(29, 39);
    assert.deepEqual(bp.map(v => v.result.input.raw), [` ${raw} `, `${raw}\u3002`, `${raw}\uff01`]);
    for (const v of bp) {
        assert.equal(v.receipt.beforeState.settings.speech, 'short');
        assert.equal(v.receipt.beforeWorld.mode, 'idle');
        assert.equal(material(v).captured.sources.input.raw, v.result.input.raw);
    }
    assert.equal(bq.length, 10);
    assert.deepEqual([...new Set(bq.map(v => v.receipt.beforeWorld.mode))], ['observe', 'eat', 'rest', 'work', 'walk']);
    for (const v of bq) {
        assert.equal(v.result.input.raw, raw);
        const record = material(v);
        assert.equal(record.captured.sources.activity.before.mode, v.receipt.beforeWorld.mode);
        assert.equal(record.captured.sources.activity.after.mode, v.receipt.afterWorld.mode);
        for (const field of ['hunger', 'fatigue']) {
            const s = setup(); s.world.mode = v.receipt.beforeWorld.mode; s.world[field] = .5;
            assert.equal(render(hearComfort(s)), null);
        }
    }
    const excluded = excludedExamples(); assert.equal(excluded.length, 156);
    for (const v of excluded) {
        assert.ok(material(v));
        assert.equal(render(v), null);
    }
    for (const text of [`  ${raw}  `, `\u3000${raw}\u3000`, `\t${raw}\t`, `${raw}!`, `${raw}\uff01\uff01`,
        ` ${raw}\u3002 `, `${raw}\u3002 `, `${raw}\uff01\n`, `\u6a2a\u306b \u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044`])
        assert.equal(render(hearComfort(setup(), text)), null);
});
test('missing, altered and cross-occurrence original materials never get repaired', () => {
    for (const v of examples()) {
        const record = material(v);
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const edits = [
            x => { x.record.captured.verified = true; },
            x => { x.record.captured.expression = { message: 'invented' }; },
            x => { x.record.captured.understanding.conditionStatus = 'met'; },
            x => { x.record.captured.reportSource.heardAt++; },
            x => { x.record.captured.response.message = 'invented'; },
            x => { x.record.captured.sources.input.raw += 'changed'; },
            x => { x.v.result.understandings[0].complete = false; },
            x => { x.v.result.understandings[0].known.conditionMeaning = 'eat'; },
            x => { delete x.v.result.expression; },
            x => { x.v.receipt.inputKnowledge.relations = []; },
            x => { x.v.receipt.inputContext.attention = [{ id: 'berry:2', meaning: 'berry' }]; },
            x => { x.v.receipt.reply.message = 'invented'; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ];
        for (const edit of edits) {
            const x = copy({ record, v }); edit(x); const before = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), before);
        }
        const other = hearComfort(setup(), raw, { at: 999 });
        assert.equal(prose.render(record, other.result, other.receipt), null);
        const cycle = copy(record); cycle.extra = cycle;
        assert.equal(prose.render(cycle, v.result, v.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
    }
});
test('later knowledge cannot rewrite old partial understanding or merge separate occurrences', () => {
    const v = setup({ foundation: false }), early = hearComfort(v);
    v.state.knowledge = copy(setup().state.knowledge);
    const first = hearComfort(v), second = hearComfort(v), record = material(first), saved = JSON.stringify(record);
    assert.equal(render(early), relationSentence); // Original foundation=false is now adopted BY.
    assert.equal(early.result.understandings[0].complete, false);
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(render(second), sentence);
    assert.equal(prose.render(record, second.result, second.receipt), null);
    v.state.knowledge.relations = [];
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(JSON.stringify(record), saved);
});

test('BR fatigue values preserve unknown conditions and cannot combine with other adopted variations or BS', () => {
    assert.deepEqual(examples().slice(39).map(v => v.receipt.beforeWorld.fatigue), [0, .2, .4, .8, 1]);
    const excluded = fatigueExcludedExamples(); assert.equal(excluded.length, 190);
    for (const v of excluded) {
        assert.ok(material(v)); assert.equal(render(v), null);
    }
});

const unknownSentence = '\u8a00\u308f\u308c\u305f\u3053\u3068\u304c\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002';
test('BS preserves four original absences, unresolved order and missing source without inventing expression', () => {
    for (const v of incompleteExamples()) {
        const record = material(v), original = JSON.stringify({ v, record }), c = record.captured;
        assert.equal(render(v), unknownSentence);
        assert.deepEqual(c.understanding.known, {});
        assert.deepEqual(c.understanding.unresolved, [
            { type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' },
            { type: 'meaning', field: 'meaning', token: 'comfortable' },
            { type: 'meaning', field: 'conditionMeaning', token: 'rest' }
        ]);
        for (const field of ['subject', 'aspect']) assert.equal(c.understanding[field], null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        for (const field of ['reportSource', 'expression']) assert.equal(Object.hasOwn(c, field), false);
        for (const field of ['meaningKnownBefore', 'conditionMeaningKnownBefore', 'relationsKnownBefore',
            'newTeaching', 'newLearning', 'newExperience']) assert.equal(c[field], false);
        assert.equal(c.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        assert.equal(c.response.message, 'attend');
        assert.equal(prose.render(record, v.result, v.receipt), unknownSentence);
        assert.equal(JSON.stringify({ v, record }), original);
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.expression = { channel: 'speech', message: 'invented' }; },
            x => { x.record.captured.understanding.subject = 'player'; },
            x => { x.record.captured.missingMeaningsBefore.reverse(); },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.receipt.reply.message = 'uncertain'; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputKnowledge; }
        ]) {
            const x = copy({ v, record }); edit(x); const before = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), before);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const later = hearComfort(setup());
        assert.equal(prose.render(record, later.result, later.receipt), null);
        assert.equal(prose.render(material(later), v.result, v.receipt), null);
    }
});

test('BS-CQ accept only adopted prerequisite layouts and finite forms, rejecting other scopes and contexts', () => {
    const all = require('../scripts/experimental/diary_incomplete_rest_comfort_report_fixtures').fixtures();
    let accepted = 0;
    for (const f of all) {
        const v = f.value, b = candidates.create();
        if (!incompleteReports.capture(b, v.result, v.receipt)) continue;
        const k = v.receipt.inputKnowledge;
        const contextAllowed = v.result.input.raw === raw && v.result.input.locale === 'ja' && v.result.input.speaker === 'player'
            && v.receipt.inputContext.scene === 'clearing'
            && v.receipt.beforeWorld.mode === 'idle' && v.receipt.beforeWorld.fatigue === .15;
        const allAbsent = !k.meanings.some(e => ['comfortable', 'rest'].includes(e.id))
            && !k.relations.some(e => ['report', 'condition'].includes(e.id));
        const u = v.result.understandings[0];
        let expected = null;
        if (contextAllowed && allAbsent) expected = unknownSentence;
        if (contextAllowed && u.relations.length === 2 && u.unresolved.length === 1) {
            if (!k.meanings.some(e => e.id === 'comfortable')) expected = partialSentences[0];
            if (!k.meanings.some(e => e.id === 'rest')) expected = partialSentences[1];
        }
        if (contextAllowed && u.known.meaning === 'comfortable' && u.known.conditionMeaning === 'rest'
            && u.relations.length === 1 && u.unresolved.length === 1
            && !k.relations.some(e => e.id === u.unresolved[0].id)) expected = relationSentence;
        if (contextAllowed && !k.meanings.some(e => ['comfortable', 'rest'].includes(e.id))
            && u.relations.length === 2 && u.unresolved.length === 2) expected = doubleMissingSentence;
        if (contextAllowed && !k.relations.some(e => ['report', 'condition'].includes(e.id))
            && u.known.meaning === 'comfortable' && u.known.conditionMeaning === 'rest'
            && u.relations.length === 0 && u.unresolved.length === 2) expected = relationSentence;
        if (contextAllowed && !k.relations.some(e => e.id === 'report')
            && u.relations.length === 1 && u.relations[0] === 'condition' && u.unresolved.length === 2) {
            if (!k.meanings.some(e => e.id === 'comfortable') && u.known.conditionMeaning === 'rest') expected = partialSentences[0];
            if (!k.meanings.some(e => e.id === 'rest') && u.known.meaning === 'comfortable') expected = partialSentences[1];
        }
        if (contextAllowed && !k.relations.some(e => e.id === 'condition')
            && u.relations.length === 1 && u.relations[0] === 'report' && u.unresolved.length === 2) {
            if (!k.meanings.some(e => e.id === 'comfortable') && u.known.conditionMeaning === 'rest') expected = partialSentences[0];
            if (!k.meanings.some(e => e.id === 'rest') && u.known.meaning === 'comfortable') expected = partialSentences[1];
        }
        const absentCount = ['comfortable', 'rest'].filter(id => !k.meanings.some(e => e.id === id)).length
            + ['report', 'condition'].filter(id => !k.relations.some(e => e.id === id)).length;
        if (contextAllowed && absentCount === 3 && u.unresolved.length === 3)
            expected = u.known.conditionMeaning === 'rest' ? partialSentences[0]
                : u.known.meaning === 'comfortable' ? partialSentences[1] : unknownSentence;
        if (['missing-knowledge-single-punctuation', 'missing-knowledge-activity-empty-attention',
            'missing-knowledge-fatigue-condition-unknown'].includes(f.group)
            || f.group === 'existing-forms-knowledge-matrix' && v.result.input.raw !== raw) {
            if (u.known.meaning === 'comfortable' && u.known.conditionMeaning === 'rest') expected = relationSentence;
            else if (u.known.conditionMeaning === 'rest') expected = partialSentences[0];
            else if (u.known.meaning === 'comfortable') expected = partialSentences[1];
            else expected = u.kind === 'report' ? doubleMissingSentence : unknownSentence;
        }
        if (f.group.includes('scope-not-transferred')) expected = relationSentence;
        assert.equal(prose.render(b.read()[0], v.result, v.receipt), expected, f.group);
        if (expected) accepted++;
    }
    assert.equal(accepted, 794); // previous 790 plus four CP/CQ learned-scope examples
});

test('CD/CE/CF preserve four distinct three-absence layouts, including both CD branches and actual replies', () => {
    const values = threeMissingExamples(); assert.equal(values.length, 8);
    const layouts = [
        { known: {}, relations: ['condition'], missing: ['report'], meanings: ['comfortable', 'rest'] },
        { known: {}, relations: ['report'], missing: ['condition'], meanings: ['comfortable', 'rest'] },
        { known: { conditionMeaning: 'rest' }, relations: [], missing: ['report', 'condition'], meanings: ['comfortable'] },
        { known: { meaning: 'comfortable' }, relations: [], missing: ['report', 'condition'], meanings: ['rest'] }
    ];
    for (const [index, v] of values.entries()) {
        const layout = layouts[Math.floor(index / 2)], record = material(v), c = record.captured;
        const original = JSON.stringify({ record, v });
        assert.equal(render(v), index < 4 ? unknownSentence : partialSentences[index < 6 ? 0 : 1]);
        assert.deepEqual(c.understanding.known, layout.known); assert.deepEqual(c.understanding.relations, layout.relations);
        assert.deepEqual(c.missingRelationsBefore, layout.missing);
        const meanings = layout.meanings.map(token => ({ type: 'meaning', field: token === 'rest' ? 'conditionMeaning' : 'meaning', token }));
        assert.deepEqual(c.missingMeaningsBefore, meanings);
        assert.deepEqual(c.understanding.unresolved, [...layout.missing.map(id => ({ type: 'relation', id })), ...meanings]);
        assert.equal(c.meaningKnownBefore, index >= 6); assert.equal(c.conditionMeaningKnownBefore, index >= 4 && index < 6);
        assert.equal(c.relationsKnownBefore, false);
        assert.equal(c.understanding.kind, 'partial'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, null); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        for (const key of ['expression', 'reportSource']) assert.equal(Object.hasOwn(c, key), false);
        assert.equal(Object.hasOwn(c.understanding, 'reportSource'), false);
        assert.equal(c.actualSpeech, index % 2 === 0);
        assert.equal(c.response.message, index < 4 || index % 2 ? 'attend' : 'uncertain');
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = threeMissingExcludedExamples(); assert.equal(excluded.length, 108);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('three-absence prose rejects source restoration, changed evidence and same-text substitutions without rewriting history', () => {
    for (const [index, v] of threeMissingExamples().entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.subject = 'player'; },
            x => { x.record.captured.understanding.aspect = 'rest_comfort'; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.missingRelationsBefore = []; },
            x => { x.record.captured.understanding.unresolved.reverse(); },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge = copy(setup().state.knowledge); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null); assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const sameText = index < 4 ? incompleteExamples()[index % 2]
            : partialExamples()[(index < 6 ? 0 : 2) + index % 2];
        assert.equal(render(sameText), render(v));
        assert.equal(prose.render(material(sameText), v.result, v.receipt), null);
        assert.equal(prose.render(record, sameText.result, sameText.receipt), null);
        if (index < 4) {
            const otherBranch = threeMissingExamples()[(index + 2) % 4];
            assert.equal(prose.render(record, otherBranch.result, otherBranch.receipt), null);
        }
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

test('CB/CC preserve missing condition and one meaning with applicable report but no original source', () => {
    const values = mixedConditionExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const cb = index < 2, record = material(v), c = record.captured, original = JSON.stringify({ record, v });
        assert.equal(render(v), partialSentences[cb ? 0 : 1]);
        assert.equal(c.meaningKnownBefore, !cb); assert.equal(c.conditionMeaningKnownBefore, cb);
        assert.equal(c.relationsKnownBefore, false); assert.deepEqual(c.missingRelationsBefore, ['condition']);
        assert.deepEqual(c.missingMeaningsBefore, [{ type: 'meaning', field: cb ? 'meaning' : 'conditionMeaning', token: cb ? 'comfortable' : 'rest' }]);
        assert.deepEqual(c.understanding.known, cb ? { conditionMeaning: 'rest' } : { meaning: 'comfortable' });
        assert.deepEqual(c.understanding.relations, ['report']);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'relation', id: 'condition' }, ...c.missingMeaningsBefore]);
        assert.equal(c.understanding.kind, 'partial'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, null); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        for (const key of ['expression', 'reportSource']) assert.equal(Object.hasOwn(c, key), false);
        assert.equal(Object.hasOwn(c.understanding, 'reportSource'), false);
        assert.equal(c.response.message, index % 2 ? 'attend' : 'uncertain');
        assert.equal(c.actualSpeech, index % 2 === 0);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = mixedConditionExcludedExamples(); assert.equal(excluded.length, 56);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('CB/CC reject source repair and cannot exchange same-text BT/BU or BZ/CA records or later understanding', () => {
    for (const [index, v] of mixedConditionExamples().entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.subject = 'player'; },
            x => { x.record.captured.understanding.aspect = 'rest_comfort'; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.missingRelationsBefore = ['report']; },
            x => { x.record.captured.understanding.unresolved.reverse(); },
            x => { x.v.result.understandings[0].kind = 'report'; },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge.relations.push({ id: 'condition', source: 'initial' }); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        for (const other of [partialExamples()[index], mixedReportExamples()[index]]) {
            assert.equal(render(other), render(v));
            assert.equal(prose.render(material(other), v.result, v.receipt), null);
            assert.equal(prose.render(record, other.result, other.receipt), null);
        }
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

test('BZ/CA retain missing report and exactly one missing meaning without restoring subject or source', () => {
    const values = mixedReportExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const bz = index < 2, record = material(v), c = record.captured, original = JSON.stringify({ record, v });
        assert.equal(render(v), partialSentences[bz ? 0 : 1]);
        assert.equal(c.meaningKnownBefore, !bz); assert.equal(c.conditionMeaningKnownBefore, bz);
        assert.equal(c.relationsKnownBefore, false); assert.deepEqual(c.missingRelationsBefore, ['report']);
        assert.deepEqual(c.missingMeaningsBefore, [{ type: 'meaning', field: bz ? 'meaning' : 'conditionMeaning', token: bz ? 'comfortable' : 'rest' }]);
        assert.deepEqual(c.understanding.known, bz ? { conditionMeaning: 'rest' } : { meaning: 'comfortable' });
        assert.deepEqual(c.understanding.relations, ['condition']);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'relation', id: 'report' }, ...c.missingMeaningsBefore]);
        assert.equal(c.understanding.kind, 'partial'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, null); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        for (const key of ['expression', 'reportSource']) assert.equal(Object.hasOwn(c, key), false);
        assert.equal(Object.hasOwn(c.understanding, 'reportSource'), false);
        assert.equal(c.response.message, index % 2 ? 'attend' : 'uncertain');
        assert.equal(c.actualSpeech, index % 2 === 0);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = mixedReportExcludedExamples(); assert.equal(excluded.length, 56);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('BZ/CA reject invented testimony, altered evidence and cross-occurrence or later-knowledge repair', () => {
    for (const v of mixedReportExamples()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.subject = 'player'; },
            x => { x.record.captured.understanding.aspect = 'rest_comfort'; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.missingRelationsBefore = []; },
            x => { x.record.captured.understanding.unresolved.reverse(); },
            x => { x.v.result.understandings[0].known = {}; },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge.relations.push({ id: 'report', source: 'initial' }); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        assert.equal(prose.render(material(later), v.result, v.receipt), null);
        const meaningIndex = v.result.understandings[0].known.conditionMeaning === 'rest' ? 0 : 2;
        const oneMeaningMissing = partialExamples()[meaningIndex + (v.receipt.beforeState.settings.speech === 'short' ? 0 : 1)];
        assert.equal(prose.render(material(oneMeaningMissing), v.result, v.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

const doubleMissingSentence = '何かを伝えられたけれど、何のことか分からなかった。';
test('BX/BY keep two absent meanings or relations distinct, including source and actual attend vs speech setting', () => {
    const values = doubleMissingExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const bx = index < 2, record = material(v), c = record.captured, original = JSON.stringify({ record, v });
        assert.equal(render(v), bx ? doubleMissingSentence : relationSentence);
        assert.equal(c.meaningKnownBefore, !bx); assert.equal(c.conditionMeaningKnownBefore, !bx);
        assert.equal(c.relationsKnownBefore, bx);
        assert.deepEqual(c.missingRelationsBefore, bx ? [] : ['report', 'condition']);
        assert.deepEqual(c.missingMeaningsBefore, bx ? [
            { type: 'meaning', field: 'meaning', token: 'comfortable' },
            { type: 'meaning', field: 'conditionMeaning', token: 'rest' }
        ] : []);
        assert.deepEqual(c.understanding.known, bx ? {} : { meaning: 'comfortable', conditionMeaning: 'rest' });
        assert.deepEqual(c.understanding.relations, bx ? ['report', 'condition'] : []);
        assert.deepEqual(c.understanding.unresolved, bx ? c.missingMeaningsBefore
            : [{ type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' }]);
        assert.equal(c.understanding.kind, bx ? 'report' : 'partial'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, bx ? 'player' : null);
        assert.equal(c.understanding.aspect, bx ? 'rest_comfort' : null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        if (bx) assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        else {
            assert.equal(Object.hasOwn(c, 'reportSource'), false);
            assert.equal(Object.hasOwn(c.understanding, 'reportSource'), false);
        }
        assert.equal(Object.hasOwn(c, 'expression'), false);
        assert.equal(c.actualSpeech, index % 2 === 0);
        assert.equal(c.response.message, bx || index % 2 ? 'attend' : 'uncertain');
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = doubleMissingExcludedExamples(); assert.equal(excluded.length, 48);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('BX/BY cannot repair missing evidence, reorder absences or rewrite old understanding with later knowledge', () => {
    for (const v of doubleMissingExamples()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.understanding.known.meaning = 'rest'; },
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.actualSpeech = !x.record.captured.actualSpeech; },
            x => { x.record.captured.understanding.unresolved.reverse(); },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.understandings[0].complete = true; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.reply.observation = true; },
            x => { x.v.receipt.inputKnowledge = copy(setup().state.knowledge); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; },
            x => { delete x.v.receipt.inputContext; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        assert.equal(prose.render(material(later), v.result, v.receipt), null);
        assert.equal(prose.render(record, v.result, v.receipt), render(v));
        const cycle = copy(record); cycle.extra = cycle;
        assert.equal(prose.render(cycle, v.result, v.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

const relationSentence = '休むことと気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
test('BV/BW preserve distinct missing relations and null subject/aspect/source in the shared sentence', () => {
    const values = relationExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v }), c = record.captured;
        const missing = index < 2 ? 'report' : 'condition', present = index < 2 ? 'condition' : 'report';
        assert.equal(prose.render(record, v.result, v.receipt), relationSentence);
        assert.equal(c.meaningKnownBefore, true); assert.equal(c.conditionMeaningKnownBefore, true);
        assert.equal(c.relationsKnownBefore, false);
        assert.deepEqual(c.missingMeaningsBefore, []); assert.deepEqual(c.missingRelationsBefore, [missing]);
        assert.deepEqual(c.understanding.known, { meaning: 'comfortable', conditionMeaning: 'rest' });
        assert.deepEqual(c.understanding.relations, [present]);
        assert.deepEqual(c.understanding.unresolved, [{ type: 'relation', id: missing }]);
        assert.equal(c.understanding.kind, 'partial'); assert.equal(c.understanding.complete, false);
        assert.equal(c.understanding.subject, null); assert.equal(c.understanding.aspect, null);
        assert.equal(c.understanding.conditionStatus, 'unknown');
        for (const key of ['reportSource', 'expression']) assert.equal(Object.hasOwn(c, key), false);
        assert.equal(Object.hasOwn(c.understanding, 'reportSource'), false);
        assert.equal(c.response.message, index % 2 ? 'attend' : 'uncertain');
        assert.equal(c.actualSpeech, index % 2 === 0);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    const excluded = relationExcludedExamples(); assert.equal(excluded.length, 48);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('BV/BW reject invented sources, altered records, missing receipts and cross-occurrence or later knowledge', () => {
    for (const v of relationExamples()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.subject = 'player'; },
            x => { x.record.captured.understanding.aspect = 'rest_comfort'; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.missingRelationsBefore = []; },
            x => { x.v.result.understandings[0].relations = ['report', 'condition']; },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge.relations.push({ id: x.record.captured.missingRelationsBefore[0], source: 'initial' }); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const other = hearComfort(setup(), raw, { at: 999 });
        assert.equal(prose.render(record, other.result, other.receipt), null);
        const later = setup(); later.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(later);
        later.state.knowledge = copy(setup().state.knowledge);
        const complete = hearComfort(later);
        assert.equal(render(early), relationSentence); assert.equal(render(complete), sentence);
        assert.equal(prose.render(record, complete.result, complete.receipt), null);
        assert.equal(prose.render(record, v.result, v.receipt), relationSentence);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

const partialSentences = [
    '\u4f11\u3080\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002',
    '\u6c17\u6301\u3061\u3088\u3055\u306e\u3053\u3068\u306f\u5206\u304b\u3063\u305f\u3051\u308c\u3069\u3001\u8a00\u308f\u308c\u305f\u3053\u3068\u306f\u5168\u90e8\u306f\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002'
];

test('CG/CH/CI preserve eleven spellings and eleven absence layouts without merging source or original understanding', () => {
    const values = alternateExamples(); assert.equal(values.length, 242);
    assert.equal(new Set(values.map(v => v.result.input.raw)).size, 11);
    const layouts = new Map();
    for (const v of values) {
        const record = material(v), c = record.captured, u = v.result.understandings[0], k = v.receipt.inputKnowledge;
        const original = JSON.stringify({ record, v });
        const missing = ['comfortable', 'rest', 'report', 'condition'].reduce((mask, id, bit) =>
            mask | ((bit < 2 ? k.meanings : k.relations).some(e => e.id === id) ? 0 : 1 << bit), 0);
        layouts.set(missing, (layouts.get(missing) || 0) + 1);
        const expected = [1, 5, 9, 13].includes(missing) ? partialSentences[0]
            : [2, 6, 10, 14].includes(missing) ? partialSentences[1] : relationSentence;
        assert.equal(render(v), expected);
        assert.notEqual(c.sources.input.raw, raw); assert.equal(c.sources.input.raw, v.result.input.raw);
        assert.deepEqual(c.understanding, u); assert.deepEqual(c.inputKnowledge, k);
        const relations = ['report', 'condition'].filter((id, i) => missing & (1 << (i + 2)));
        const meanings = ['comfortable', 'rest'].filter((id, i) => missing & (1 << i))
            .map(token => ({ type: 'meaning', field: token === 'rest' ? 'conditionMeaning' : 'meaning', token }));
        assert.deepEqual(c.missingRelationsBefore, relations); assert.deepEqual(c.missingMeaningsBefore, meanings);
        assert.deepEqual(u.unresolved, [...relations.map(id => ({ type: 'relation', id })), ...meanings]);
        assert.equal(c.meaningKnownBefore, !(missing & 1)); assert.equal(c.conditionMeaningKnownBefore, !(missing & 2));
        assert.equal(c.relationsKnownBefore, relations.length === 0);
        assert.equal(u.kind, relations.length ? 'partial' : 'report'); assert.equal(u.complete, false);
        assert.equal(u.subject, relations.length ? null : 'player'); assert.equal(u.aspect, relations.length ? null : 'rest_comfort');
        assert.equal(u.conditionStatus, 'unknown'); assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified');
        if (!relations.length) assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        else for (const obj of [c, u]) assert.equal(Object.hasOwn(obj, 'reportSource'), false);
        assert.equal(Object.hasOwn(c, 'expression'), false);
        assert.equal(c.actualSpeech, v.receipt.beforeState.settings.speech === 'short');
        assert.equal(c.response.message, c.actualSpeech ? 'uncertain' : 'attend');
        assert.equal(Boolean(c.response.observation), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    assert.deepEqual([...layouts.keys()].sort((a, b) => a - b), [1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14]);
    for (const count of layouts.values()) assert.equal(count, 22);
    const excluded = alternateExcludedExamples(); assert.equal(excluded.length, 3168);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('CJ/CK preserve two unknown meanings and four distinct relation/source layouts across eleven spellings', () => {
    const values = unknownAlternateExamples(); assert.equal(values.length, 88);
    const masks = new Map();
    assert.equal(new Set(values.map(v => v.result.input.raw)).size, 11);
    for (const [index, v] of values.entries()) {
        const layout = Math.floor(index % 8 / 2), mask = [3, 7, 11, 15][layout], cj = layout === 0;
        masks.set(mask, (masks.get(mask) || 0) + 1);
        const record = material(v), c = record.captured, u = c.understanding, original = JSON.stringify({ record, v });
        assert.equal(render(v), cj ? doubleMissingSentence : unknownSentence);
        assert.deepEqual(u.known, {}); assert.deepEqual(u, v.result.understandings[0]);
        assert.equal(c.sources.input.raw, v.result.input.raw); assert.notEqual(c.sources.input.raw, raw);
        assert.equal(c.meaningKnownBefore, false); assert.equal(c.conditionMeaningKnownBefore, false);
        const missing = ['report', 'condition'].filter((id, i) => mask & (1 << (i + 2)));
        assert.deepEqual(c.missingRelationsBefore, missing);
        assert.deepEqual(u.relations, ['report', 'condition'].filter(id => !missing.includes(id)));
        assert.deepEqual(c.missingMeaningsBefore, [{ type: 'meaning', field: 'meaning', token: 'comfortable' },
            { type: 'meaning', field: 'conditionMeaning', token: 'rest' }]);
        assert.deepEqual(u.unresolved, [...missing.map(id => ({ type: 'relation', id })), ...c.missingMeaningsBefore]);
        assert.equal(u.kind, cj ? 'report' : 'partial'); assert.equal(u.complete, false);
        assert.equal(u.subject, cj ? 'player' : null); assert.equal(u.aspect, cj ? 'rest_comfort' : null);
        assert.equal(u.conditionStatus, 'unknown'); assert.equal(u.polarity, 'positive'); assert.equal(u.eventTime, 'unspecified');
        assert.equal(c.relationsKnownBefore, cj);
        if (cj) assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        else for (const obj of [c, u]) assert.equal(Object.hasOwn(obj, 'reportSource'), false);
        assert.equal(Object.hasOwn(c, 'expression'), false);
        assert.equal(c.actualSpeech, index % 2 === 0); assert.equal(c.response.message, 'attend');
        assert.equal(Boolean(c.response.observation), false);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    assert.deepEqual([...masks.keys()], [3, 7, 11, 15]);
    for (const count of masks.values()) assert.equal(count, 22);
    const excluded = unknownAlternateExcludedExamples(); assert.equal(excluded.length, 1144);
    for (const v of excluded) { assert.ok(material(v)); assert.equal(render(v), null); }
});

test('CJ/CK cannot restore unknown content/source or substitute same-text layouts and later knowledge', () => {
    const values = unknownAlternateExamples();
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.reportSource = { kind: 'speaker_report' }; },
            x => { x.record.captured.understanding.known = { meaning: 'comfortable', conditionMeaning: 'rest' }; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.understanding.unresolved.reverse(); },
            x => { x.v.result.understandings[0].unresolved.reverse(); },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.receipt.inputKnowledge = copy(setup().state.knowledge); },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null); assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const other = values[(index + 8) % values.length];
        assert.equal(render(other), render(v));
        assert.equal(prose.render(record, other.result, other.receipt), null);
        assert.equal(prose.render(material(other), v.result, v.receipt), null);
        if (index % 8 >= 2) {
            const base = index - index % 8, branch = values[base + (index % 8 + 2 > 7 ? 2 : index % 8 + 2)];
            assert.equal(render(branch), render(v));
            assert.equal(prose.render(record, branch.result, branch.receipt), null);
        }
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s, v.result.input.raw); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s, v.result.input.raw);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});

test('CG/CH/CI reject altered evidence, same-text substitutions and later-knowledge repair across every adopted layout', () => {
    const values = alternateExamples();
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v });
        for (const edit of [
            x => { x.record.captured.sources.input.raw += 'ね'; },
            x => { x.record.captured.understanding.known = {}; },
            x => { x.record.captured.expression = x.v.result.expression; },
            x => { x.record.captured.actualSpeech = !x.record.captured.actualSpeech; },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.understandings[0].complete = true; },
            x => { x.v.receipt.inputKnowledge = copy(setup().state.knowledge); },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.inputContext; },
            x => { delete x.v.receipt.beforeState; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ record, v }); edit(x); const altered = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null); assert.equal(JSON.stringify(x), altered);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const other = values[(index + 22) % 242];
        assert.equal(render(other), render(v));
        assert.equal(prose.render(record, other.result, other.receipt), null);
        assert.equal(prose.render(material(other), v.result, v.receipt), null);
        const s = setup(); s.state.knowledge = copy(v.receipt.inputKnowledge);
        const early = hearComfort(s, v.result.input.raw); s.state.knowledge = copy(setup().state.knowledge);
        const later = hearComfort(s, v.result.input.raw);
        assert.equal(render(early), render(v)); assert.equal(render(later), sentence);
        assert.equal(prose.render(record, later.result, later.receipt), null);
        assert.equal(render(v), render(early));
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
        assert.equal(JSON.stringify({ record, v }), original);
    }
});
test('BT/BU preserve exactly one missing meaning and report source, independently of speech setting', () => {
    const values = partialExamples(); assert.equal(values.length, 4);
    for (const [index, v] of values.entries()) {
        const record = material(v), original = JSON.stringify({ record, v }), c = record.captured;
        assert.equal(prose.render(record, v.result, v.receipt), partialSentences[Math.floor(index / 2)]);
        assert.equal(c.meaningKnownBefore, index >= 2);
        assert.equal(c.conditionMeaningKnownBefore, index < 2);
        assert.equal(c.relationsKnownBefore, true);
        assert.deepEqual(c.missingRelationsBefore, []);
        assert.equal(c.missingMeaningsBefore.length, 1);
        assert.equal(c.understanding.kind, 'report'); assert.equal(c.understanding.complete, false);
        assert.deepEqual(c.reportSource, { kind: 'speaker_report', inputId: v.result.input.id, heardAt: v.result.input.at });
        assert.equal(c.understanding.conditionStatus, 'unknown');
        assert.equal(c.response.message, index % 2 ? 'attend' : 'uncertain');
        assert.equal(c.actualSpeech, index % 2 === 0);
        for (const key of ['newTeaching', 'newLearning', 'newExperience']) assert.equal(c[key], false);
        assert.equal(Object.hasOwn(c, 'expression'), false);
        assert.equal(JSON.stringify({ record, v }), original);
    }
    for (const v of partialExcludedExamples()) {
        assert.ok(material(v)); assert.equal(render(v), null);
    }
    assert.equal(partialExcludedExamples().length, 48);
});

test('BT/BU reject changed sources, missing materials and cross-occurrence substitution without repairing knowledge', () => {
    for (const v of partialExamples()) {
        const record = material(v);
        for (const edit of [
            x => { x.record.captured.understanding.known.meaning = 'comfortable'; },
            x => { x.record.captured.missingMeaningsBefore = []; },
            x => { x.record.captured.reportSource.heardAt++; },
            x => { x.record.captured.expression = { channel: 'speech', message: 'invented' }; },
            x => { x.v.result.understandings[0].conditionStatus = 'met'; },
            x => { x.v.result.understandings[0].complete = true; },
            x => { x.v.receipt.reply.message = 'heard_rest_comfort'; },
            x => { x.v.receipt.inputKnowledge.meanings.push({ id: 'rest', source: 'initial' }); },
            x => { x.v.receipt.afterWorld.elapsed++; },
            x => { delete x.v.receipt.afterState; }
        ]) {
            const x = copy({ v, record }); edit(x);
            // An already present known.meaning is not a mutation for BU.
            if (JSON.stringify(x) === JSON.stringify({ v, record })) continue;
            const original = JSON.stringify(x);
            assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
            assert.equal(JSON.stringify(x), original);
        }
        for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null]])
            assert.equal(prose.render(...args), null);
        const other = hearComfort(setup(), raw, { at: 999 });
        assert.equal(prose.render(record, other.result, other.receipt), null);
        const state = setup(); state.state.knowledge = copy(v.receipt.inputKnowledge);
        const later = hearComfort(state);
        state.state.knowledge = copy(setup().state.knowledge);
        assert.equal(prose.render(record, v.result, v.receipt), render(later));
        const nonJson = copy(record); nonJson.extra = undefined;
        assert.equal(prose.render(nonJson, v.result, v.receipt), null);
    }
});
