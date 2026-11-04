'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const reports = require('../experimental_word_diary_rest_comfort_reports');
const incompleteReports = require('../experimental_word_diary_incomplete_rest_comfort_reports');
const prose = require('../experimental_word_diary_rest_comfort_prose');
const { fixtures, setup, hearComfort, raw, core } = require('../scripts/experimental/diary_rest_comfort_report_fixtures');
const { examples, incompleteExamples, excludedExamples, fatigueExcludedExamples } = require('../scripts/experimental/diary_rest_comfort_prose_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const sentence = '\u6a2a\u306b\u306a\u308b\u3068\u6c17\u6301\u3061\u3044\u3044\u3068\u805e\u3044\u305f\u3002';
function material(v) {
    const buffer = candidates.create();
    return reports.capture(buffer, v.result, v.receipt) || incompleteReports.capture(buffer, v.result, v.receipt)
        ? buffer.read()[0] : null;
}
const render = v => prose.render(material(v), v.result, v.receipt);
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
    assert.equal(render(early), null);
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(render(second), sentence);
    assert.equal(prose.render(record, second.result, second.receipt), null);
    v.state.knowledge.relations = [];
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(JSON.stringify(record), saved);
});

test('BR fatigue values preserve unknown conditions and cannot combine with other adopted variations or BS', () => {
    assert.deepEqual(examples().slice(39).map(v => v.receipt.beforeWorld.fatigue), [0, .2, .4, .8, 1]);
    const excluded = fatigueExcludedExamples(); assert.equal(excluded.length, 200);
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

test('BS rejects all other bo prerequisite layouts, scopes, forms, scenes, activities, fatigue and speakers', () => {
    const all = require('../scripts/experimental/diary_incomplete_rest_comfort_report_fixtures').fixtures();
    let accepted = 0;
    for (const f of all) {
        const v = f.value, b = candidates.create();
        if (!incompleteReports.capture(b, v.result, v.receipt)) continue;
        const k = v.receipt.inputKnowledge;
        const allowed = v.result.input.raw === raw && v.result.input.locale === 'ja' && v.result.input.speaker === 'player'
            && v.receipt.inputContext.scene === 'clearing'
            && v.receipt.beforeWorld.mode === 'idle' && v.receipt.beforeWorld.fatigue === .15
            && !k.meanings.some(e => ['comfortable', 'rest'].includes(e.id))
            && !k.relations.some(e => ['report', 'condition'].includes(e.id));
        assert.equal(prose.render(b.read()[0], v.result, v.receipt), allowed ? unknownSentence : null, f.group);
        if (allowed) accepted++;
    }
    assert.equal(accepted, 6); // matrix, initial settings and explicit ja locale each supply two cases
});
