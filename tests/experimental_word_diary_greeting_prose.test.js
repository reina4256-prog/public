'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const greetings = require('../experimental_word_diary_greetings');
const prose = require('../experimental_word_diary_greeting_prose');
const { setup, hear, fixtures } = require('../scripts/experimental/diary_greeting_fixtures');
const copy = value => JSON.parse(JSON.stringify(value));
const sentence = '\u6328\u62f6\u3055\u308c\u305f\u3002';
function material(value) {
    const buffer = greetings.create();
    return greetings.capture(buffer, value.result, value.receipt) ? buffer.read()[0] : null;
}
const render = v => prose.render(material(v), v.result, v.receipt);
const accepted = require('../scripts/experimental/diary_greeting_prose_fixtures').examples();
test('AV-BC: all 22 adopted form/context/expression combinations produce only the adopted sentence', () => {
    assert.equal(accepted.length, 22);
    for (const v of accepted) {
        const record = material(v), before = JSON.stringify({ record, v });
        assert.equal(prose.render(record, v.result, v.receipt), sentence);
        assert.equal(prose.render(record, v.result, v.receipt), sentence);
        assert.equal(JSON.stringify({ record, v }), before);
        assert.equal(Object.hasOwn(record.captured, 'expression'), false);
        assert.equal(record.captured.morningVerified, false);
    }
});
test('existing owner acceptance does not expand adopted prose to other speakers, contexts or forms', () => {
    for (const f of fixtures()) {
        const v = f.value, input = v.result.input, c = v.receipt.inputContext, w = v.receipt.beforeWorld;
        const allowed = f.expected && input.speaker === 'player' && input.locale === 'ja'
            && (c.scene === 'clearing' && w.mode === 'idle'
                && ['おはよう', 'おはよ', 'おはよー', 'おはよ～', 'おはよ〜',
                    'おはようございます', 'おはよう。', 'おはよう！', ' おはよう '].includes(input.raw)
                || c.scene === 'shore' && ['idle', 'rest'].includes(w.mode) && input.raw === 'おはよう');
        assert.equal(render(v), allowed ? sentence : null, f.group + ': ' + input.raw);
    }
    for (const raw of ['おはよう!', 'おはよう ', ' おはよう', ' おはよう。 ', 'おはよう！！',
        'おはよう\n', 'おはよう\n休もう', 'おはよう。休もう']) assert.equal(render(hear(setup(), raw)), null);
    for (const mode of ['observe', 'eat', 'rest', 'work', 'walk']) {
        const v = setup(); v.world.mode = mode;
        assert.equal(render(hear(v)), null);
    }
    for (const field of ['hunger', 'fatigue']) {
        const v = setup(); v.world[field] = .5;
        assert.equal(render(hear(v)), null);
    }
    assert.equal(render(hear(setup({ foundation: true, life: false }))), sentence);
});
test('missing, forged and cross-occurrence materials never get repaired', () => {
    const v = accepted[0], record = material(v);
    for (const args of [[null, v.result, v.receipt], [record, null, v.receipt],
        [record, v.result, null], [record, v.result, {}]])
        assert.equal(prose.render(...args), null);
    const edits = [
        x => { x.record.captured.sources.input.raw = 'おはよ'; },
        x => { x.record.captured.understanding.complete = false; },
        x => { x.record.captured.response.message = 'attend'; },
        x => { x.record.captured.morningVerified = true; },
        x => { x.record.captured.expression = { message: 'invented' }; },
        x => { x.v.receipt.inputKnowledge.relations = []; },
        x => { x.v.receipt.inputContext.attention = []; },
        x => { x.v.receipt.reply.message = 'attend'; },
        x => { x.v.receipt.afterWorld.elapsed++; },
        x => { x.v.result.understandings[0].complete = false; },
        x => { delete x.v.receipt.beforeState; },
        x => { delete x.v.result.expression; }
    ];
    for (const edit of edits) {
        const x = copy({ record, v }); edit(x);
        const before = JSON.stringify(x);
        assert.equal(prose.render(x.record, x.v.result, x.v.receipt), null);
        assert.equal(JSON.stringify(x), before);
    }
    const other = hear(setup(), 'おはよ');
    assert.equal(prose.render(record, other.result, other.receipt), null);
    const cycle = copy(record); cycle.cycle = cycle;
    assert.equal(prose.render(cycle, v.result, v.receipt), null);
    const nonJson = copy(record); nonJson.extra = undefined;
    assert.equal(prose.render(nonJson, v.result, v.receipt), null);
});
test('later knowledge and another occurrence cannot overwrite the original candidate or prose', () => {
    const v = setup(), first = hear(v), buffer = greetings.create();
    greetings.capture(buffer, first.result, first.receipt);
    const record = buffer.read()[0], retained = JSON.stringify(buffer.read());
    v.state.knowledge.relations = [];
    v.state.context.scene = 'changed';
    assert.equal(prose.render(record, first.result, first.receipt), sentence);
    assert.equal(JSON.stringify(buffer.read()), retained);
    assert.equal(prose.render(record, hear(v).result, first.receipt), null);
    const partial = hear(setup({ foundation: false }));
    assert.equal(render(partial), null);
});
