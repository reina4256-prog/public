'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const candidates = require('../experimental_word_diary_candidates');
const api = require('../experimental_word_diary_proposals');
const { fixtures, hear } = require('../scripts/experimental/diary_proposal_fixtures');
const { setup } = require('../scripts/experimental/diary_negation_fixtures');
const capture = (buffer, v) => api.capture(buffer, v.result, v.context, v.beforeKnowledge, v.decision);
const all = fixtures();
for (const group of [...new Set(all.map(v => v.group))]) test('ordinary proposal: ' + group, () => {
    for (const fixture of all.filter(v => v.group === group)) {
        const buffer = candidates.create(), supplied = JSON.stringify(fixture);
        assert.deepEqual(fixture.values.map(v => capture(buffer, v)), fixture.expected,
            JSON.stringify({ group, input: fixture.values[0].result.input, decision: fixture.values[0].decision.response }));
        assert.equal(JSON.stringify(fixture), supplied);
        const original = buffer.read();
        assert.ok(fixture.values.map(v => capture(buffer, v)).every(v => v === false));
        assert.deepEqual(buffer.read(), original);
        for (const entry of original) {
            const data = entry.captured;
            assert.equal(entry.kind, 'proposal'); assert.equal(entry.sourceId, data.sources.input.id);
            assert.equal(entry.occurrenceId, 'ordinary_proposal:' + entry.sourceId);
            assert.equal(data.understanding.complete, true);
            assert.deepEqual(data.understanding.relationReferences || [], data.relationBasis.filter(r => r.source === 'experienced_relation'));
            if (data.sources.frame.roles) assert.equal(data.understanding.roles.actualParticipation, false);
            else assert.equal(data.understanding.roles, undefined);
            if (data.basis.id === 'walk' || data.decision.outcome !== 'approaching') assert.equal(data.decision.selectedSource, null);
            for (const field of ['experience', 'completed', 'jointParticipation', 'emotion', 'reason', 'calendar']) assert.equal(data[field], undefined);
        }
    }
});
test('ordinary proposal: new input, copy isolation and existing gameplay stay separate', () => {
    const value = setup({ foundation: true }), buffer = candidates.create();
    const first = hear(value, '休んでね'), second = hear(value, '休んでね');
    const game = JSON.stringify(value), originalKnowledge = JSON.stringify(value.state.knowledge);
    assert.equal(capture(buffer, first), true); assert.equal(capture(buffer, second), true);
    assert.equal(JSON.stringify(value), game); assert.equal(JSON.stringify(value.state.knowledge), originalKnowledge);
    assert.equal((value.state.experiences || []).length, 0);
    const original = buffer.read();
    buffer.read()[0].captured.decision.outcome = 'changed'; first.decision.after.reasons = []; first.beforeKnowledge.meanings = [];
    assert.deepEqual(buffer.read(), original); assert.notEqual(original[0].sourceId, original[1].sourceId);
});
