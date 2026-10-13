'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { bases, exercise, api, catalog } = require('../scripts/experimental/rest_start_fixtures');
const { valid, createStore } = require('../scripts/experimental/storage');
const candidates = require('../experimental_word_diary_candidates');
const answers = require('../experimental_word_diary_reason_answers');
const copy = v => JSON.parse(JSON.stringify(v));
const samples = bases();
for (const choice of ['request', 'invitation', 'autonomous']) test(`rest start: zero-duration ${choice}, seven locales and eight settings`, () => {
    for (const { locale, value } of samples) {
        const result = exercise(value, locale, choice, api, catalog), w = result.value.world, s = result.value.state;
        assert.equal(result.started.world.elapsed, result.start);
        assert.equal(result.interrupted, true);
        const h = result.stopped.world.history.at(-1);
        assert.equal(h.mode, 'rest'); assert.equal(h.start, h.end);
        assert.equal(h.startInputSerial, result.serial); assert.equal(h.experienceId, undefined);
        assert.equal(result.review.result.relationLearning, undefined);
        assert.equal(result.answer.reply.message, s.settings.speech === 'short' ? 'answer_unknown' : 'attend');
        assert.deepEqual(s.experiences, result.old.experiences);
        assert.deepEqual(s.knowledge.relations, result.old.relations);
        assert.deepEqual(w.experiences, value.world.experiences);
        for (const snapshot of [result.moving, result.started, result.stopped, result.value]) assert.ok(valid(snapshot));
        const prior = result.old.turns.filter(t => t.answer?.response?.message === 'selected_reason');
        for (const t of prior) assert.deepEqual(s.context.turns.find(item => item.id === t.id)?.answer, t.answer);
        const buffer = candidates.create();
        const context = { scene: s.context.scene, attention: s.context.attention, mode: w.mode,
            target: w.attention, activityStart: w.activityStart, elapsed: w.elapsed,
            destination: w.destination, history: w.history, experiences: w.experiences };
        assert.equal(answers.capture(buffer, result.answer.result, result.answer.reply, context,
            s.knowledge, s.experiences, s.selectionSources), false);
        assert.deepEqual(buffer.read(), []);
    }
});
test('rest start: same-time forged teaching and answer rejected; earlier originals remain valid', () => {
    for (const { locale, value } of samples.filter(v => v.value.state.settings.speech === 'short')) {
        const result = exercise(value, locale, 'request', api, catalog);
        const bad = copy(result.value), event = bad.state.experiences.at(-1);
        const label = event.relationLabels.find(l => l.relation === 'reason');
        label.at = result.start; label.inputId = result.review.result.input.id;
        bad.world.experiences.find(e => e.id === event.id).relationLabels = copy(event.relationLabels);
        assert.equal(api.relation.restStartedBefore(bad.world, event, label.at, label.inputId), true);
        assert.equal(valid(bad), false);
        const forged = copy(result.value), turn = forged.state.context.turns.at(-1);
        const earlier = result.old.turns.find(t => t.answer?.response?.message === 'selected_reason');
        assert.ok(earlier);
        turn.answer = copy(earlier.answer); turn.answer.source.inputId = turn.id;
        assert.equal(api.world.validContext(forged.state, forged.world), false);
        assert.equal(valid(forged), false);
        for (const inputId of [undefined, 'missing', 'input:0', 'input:999999']) {
            const broken = copy(result.value);
            const answer = broken.state.context.turns.find(t => t.answer?.response?.message === 'selected_reason').answer;
            answer.source.inputId = inputId;
            assert.equal(valid(broken), false);
        }
        assert.ok(valid(result.value));
    }
});
test('rest start: isolated file save/reload keeps interruption and prior sources', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'word-rest-start-test-'));
    try {
        for (const { locale, value } of samples) {
            const result = exercise(value, locale, 'invitation', api, catalog);
            for (const snapshot of [result.started, result.stopped, result.value]) {
                assert.deepEqual(createStore(directory).save(snapshot), { ok: true });
                assert.deepEqual(createStore(directory).load(), { ok: true, value: snapshot });
            }
        }
    } finally {
        for (const name of ['word-life.json', 'word-life.json.backup', 'word-life.json.tmp', 'word-life.json.backup.tmp']) {
            const target = path.join(directory, name); if (fs.existsSync(target)) fs.unlinkSync(target);
        }
        fs.rmdirSync(directory);
    }
});
test('rest start: unavailable destination and old snapshots do not acquire start order', () => {
    for (const { locale, value } of samples) {
        const legacy = copy(value);
        delete legacy.world.restStartOrder;
        for (const h of legacy.world.history) delete h.startInputSerial;
        const before = JSON.stringify(legacy);
        assert.ok(valid(legacy)); assert.equal(JSON.stringify(legacy), before);
        assert.equal(api.world.approach(legacy.world, 'missing'), false);
        assert.equal(JSON.stringify(legacy), before);
        const result = exercise(value, locale, 'request', api, catalog), oldStart = copy(result.started);
        delete oldStart.world.restStartOrder;
        assert.ok(valid(oldStart));
        api.world.approach(oldStart.world, 'path');
        assert.equal(oldStart.world.history.at(-1).startInputSerial, null);
        assert.ok(valid(oldStart));
    }
});
test('rest start: resumed zero start, elapsed interruption, and a new reviewed completion', () => {
    const reason = require('../scripts/experimental/diary_reason_question_fixtures');
    for (const { locale, value } of samples) {
        const result = exercise(value, locale, 'request', api, catalog);
        for (const elapsed of [0, .1]) {
            const resumed = copy(result.started);
            if (elapsed) api.world.onArrival(resumed.world, resumed.state, api.world.tick(resumed.world, elapsed));
            api.world.approach(resumed.world, 'path');
            const answer = reason.hear(resumed, catalog.reasonTeaching[locale].utterance, locale);
            assert.equal(answer.result.understandings[0].complete, true);
            assert.equal(api.world.validContext(resumed.state, resumed.world), true);
            assert.ok(valid(resumed));
            assert.equal(resumed.world.history.at(-1).end - resumed.world.history.at(-1).start,
                elapsed ? resumed.world.elapsed - result.start : 0);
        }
        const fresh = copy(result.value);
        reason.select(fresh, 'invitation', locale);
        reason.hear(fresh, reason.demo('invitation', locale, 'reason'), locale);
        const received = api.core.receive(fresh.state, catalog.reasonTeaching[locale].utterance, catalog,
            { locale, speaker: 'player', at: 100 + fresh.state.serial });
        const reply = api.world.respond(fresh.world, received, fresh.state, catalog);
        assert.equal(reply.message, fresh.state.settings.speech === 'short' ? 'selected_reason' : 'attend');
        assert.equal(reply.experienceId, fresh.state.experiences.at(-1).id);
        assert.ok(valid(fresh));
    }
});
test('rest start: missing or contradictory reception order is rejected without reconstruction', () => {
    for (const { locale, value } of samples) {
        const result = exercise(value, locale, 'request', api, catalog);
        for (const mutate of [
            v => { v.world.restStartOrder.inputSerial = -1; },
            v => { v.world.restStartOrder.inputSerial = v.state.serial + 1; },
            v => { v.world.restStartOrder.eventId = v.world.event + 1; },
            v => { v.world.restStartOrder.start += 1; },
            v => { v.world.restStartOrder.inputSerial = null; }
        ]) { const bad = copy(result.started); mutate(bad); assert.equal(valid(bad), false); }
        for (const mutate of [
            h => { delete h.startInputSerial; }, h => { h.startInputSerial = -1; },
            h => { h.startInputSerial = result.value.state.serial + 1; },
            h => { h.experienceId = result.value.state.experiences.at(-1).id; },
            h => { h.end = h.start - 1; }, h => { h.target = 'path'; }
        ]) { const bad = copy(result.stopped); mutate(bad.world.history.at(-1)); assert.equal(valid(bad), false); }
    }
});
