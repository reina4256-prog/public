'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const materials = require('../experimental_word_diary_greeting_materials');
const prose = require('../experimental_word_diary_incomplete_greeting_prose');
const { setup, hear, core, fixtures } = require('../scripts/experimental/diary_greeting_material_fixtures');
const { examples } = require('../scripts/experimental/diary_incomplete_greeting_prose_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const sentence = '\u8a00\u308f\u308c\u305f\u3053\u3068\u304c\u5206\u304b\u3089\u306a\u304b\u3063\u305f\u3002';
function material(v) {
    const buffer = materials.create();
    return materials.capture(buffer, v.result, v.receipt) ? buffer.read()[0] : null;
}
const render = v => prose.render(material(v), v.result, v.receipt);
test('BD/BE: both speech and life settings retain six sources and only display the adopted sentence', () => {
    const values = examples(); assert.equal(values.length, 4);
    for (const v of values) {
        const record = material(v), before = JSON.stringify({ record, v });
        for (let n = 0; n < 2; n++) assert.equal(prose.render(record, v.result, v.receipt), sentence);
        assert.equal(JSON.stringify({ record, v }), before);
        assert.deepEqual(record.captured.expression, { channel: 'gesture', message: 'attend' });
        assert.equal(record.captured.actualSpeech, false);
        assert.equal(record.captured.compliance, null);
        assert.equal(record.captured.actionDecisionRecorded, false);
        assert.equal(record.captured.morningVerified, false);
    }
});
test('all existing dg materials outside BD/BE remain outside this prose unit', () => {
    let accepted = 0;
    for (const f of fixtures()) {
        const allowed = f.group === 'single-eight-settings' && f.expected
            && f.value.result.input.speaker === 'player';
        assert.equal(render(f.value), allowed ? sentence : null, f.group + ': ' + f.value.result.input.raw);
        if (allowed) accepted++;
    }
    assert.equal(accepted, 4);
});
test('valid owner material cannot widen exact input, scene, activity or numeric scope', () => {
    for (const raw of ['おはよ', 'おはようございます！', ' おはよう ', 'おはよう。', 'おはよう\n',
        'おはよう\n休んでね', 'おはよう！']) assert.equal(render(hear(setup({ foundation: false }), raw)), null);
    for (const mode of ['idle', 'observe', 'eat', 'work', 'walk']) {
        const v = setup({ foundation: false }); v.world.mode = mode;
        assert.equal(render(hear(v, 'おはよう')), null);
    }
    for (const field of ['hunger', 'fatigue']) {
        const v = setup({ foundation: false }); v.world[field] = .5;
        assert.equal(render(hear(v, 'おはよう')), null);
    }
    const v = setup({ foundation: false }); core.perceive(v.state, { scene: 'shore', attention: [] });
    assert.equal(render(hear(v, 'おはよう')), null);
});
test('missing, forged or cross-occurrence evidence is rejected without repair or mutation', () => {
    const v = examples()[0], record = material(v);
    for (const args of [[null, v.result, v.receipt], [record, null, v.receipt], [record, v.result, null],
        [record, v.result, {}]]) assert.equal(prose.render(...args), null);
    const edits = [
        x => { x.record.captured.understandings[0].complete = true; },
        x => { delete x.record.captured.expression; },
        x => { x.record.captured.response.message = 'good_morning'; },
        x => { x.record.captured.compliance = false; },
        x => { x.record.captured.actionDecisionRecorded = true; },
        x => { x.record.captured.completedExperience = { mode: 'rest' }; },
        x => { x.v.result.expression.channel = 'speech'; },
        x => { x.v.result.understandings[0].unresolved = []; },
        x => { x.v.receipt.reply.message = 'good_morning'; },
        x => { x.v.receipt.afterWorld.elapsed++; },
        x => { x.v.receipt.inputKnowledge.relations.push({ id: 'report', source: 'initial' }); },
        x => { delete x.v.receipt.beforeState; },
        x => { delete x.v.result.expression; }
    ];
    for (const edit of edits) {
        const x = copy({ v, record }); edit(x); const before = JSON.stringify(x);
        assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
        assert.equal(JSON.stringify(x), before);
    }
    const other = examples()[2];
    assert.equal(prose.render(record, other.result, other.receipt), null);
    const cycle = copy(record); cycle.cycle = cycle;
    assert.equal(prose.render(cycle, v.result, v.receipt), null);
});
test('later understood greeting never rewrites the earlier incomplete record or expression', () => {
    const v = setup({ foundation: false }), first = hear(v, 'おはよう'), record = material(first);
    const before = JSON.stringify({ first, record });
    v.state.knowledge.relations.push({ id: 'report', source: 'initial' });
    const later = hear(v, 'おはよう'); assert.equal(later.result.understandings[0].complete, true);
    assert.equal(render(later), null);
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(prose.render(record, later.result, first.receipt), null);
    assert.equal(JSON.stringify({ first, record }), before);
});
