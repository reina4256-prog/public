'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const worldApi = require('../experimental_word_learning_world');
const notebookApi = require('../experimental_word_learning_notebook');
const reportApi = require('../experimental_word_learning_report');
const create = options => api.create(options, catalog);
const say = (state, text, options) => api.receive(state, text, catalog, { at: 100, ...options });
const focus = (state, scene = 'clearing', count = 1) => api.perceive(state, {
    scene, attention: Array.from({ length: count }, (_, i) => ({ id: `berry:${i + 1}`, meaning: 'berry' }))
});

test('situation questions compose address, time, predicate and endings without teaching facts', () => {
    for (const prefix of ['', 'ねえ、', '君は今、', 'あなたはいま']) {
        for (const ending of ['？', 'の？', 'のかな？', 'んですか', 'のでしょうか']) {
            for (const [body, slot] of [['なにしてる', 'current_activity'], ['何を見ている', 'attention'],
                ['そこにはなにがある', 'attention'], ['どこに向かってる', 'destination'], ['木陰へ向かっている', 'destination']]) {
                const state = create(); const world = worldApi.create();
                world.mode = 'move'; world.destination = 'shade';
                const input = prefix + body + ending;
                const result = say(state, input);
                assert.equal(result.understandings[0].questionSlot, slot, input);
                const knowledge = JSON.stringify(state.knowledge);
                const response = worldApi.respond(world, result, state);
                assert.equal(response.message, slot === 'destination' ? 'going_rest' : slot === 'attention' ? 'answer_unknown' : 'walking', input);
                assert.equal(JSON.stringify(state.knowledge), knowledge);
                assert.equal(world.destination, 'shade');
                assert.equal(state.records.length, 0);
            }
        }
    }
});

test('situation answers distinguish activity, attention, destination and completed history', () => {
    for (const [mode, target, expected] of [['observe', 'path', 'looking_walk'], ['observe', 'berry:6', 'looking_berry'],
        ['rest', 'shade', 'resting'], ['eat', 'berry:6', 'eating'], ['idle', null, 'taking_break']]) {
        const state = create(); const world = worldApi.create();
        Object.assign(world, { mode, attention: target, destination: 'shade' });
        assert.equal(worldApi.respond(world, say(state, 'いまなにしてるの？'), state).message, expected);
        world.history.push({ mode: 'eat', target: 'berry:5' });
        assert.equal(worldApi.respond(world, say(state, '何をしていましたか？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'さっき何してたの？'), state).message, 'ate');
        assert.equal(worldApi.respond(world, say(state, 'どこに行くの？'), state).message, 'not_going');
    }
    const state = create(); const world = worldApi.create();
    Object.assign(world, { mode: 'move', destination: 'path', attention: null });
    assert.equal(worldApi.respond(world, say(state, '木陰に向かっているの？'), state).message, 'going_walk');
    assert.equal(worldApi.respond(world, say(state, 'そこには何がありますか？'), state).message, 'answer_unknown');
});

test('situation grammar does not erase subjects, conditions, negation or unknown knowledge', () => {
    for (const text of ['私は何してるの？', '疲れたらどこに行くの？', '木陰に向かっていないの？',
        'どこにも行かないの？', '木陰に行ってね', 'そこには道があるね', 'どこまで続いているんだろう？',
        'さっきどこに向かっているの？']) {
        assert.ok(!api.interpret(text, 'ja', catalog).some(f => f.catalogRule === 'situation_question'), text);
    }
    for (const options of [{ life: false }, { foundation: false }, { speech: 'gesture' }]) {
        const state = create(options); const world = worldApi.create();
        Object.assign(world, { mode: 'move', destination: 'shade' });
        const response = worldApi.respond(world, say(state, 'どこに向かっていますか？'), state);
        assert.ok(!['going_rest', 'walking'].includes(response.message));
        assert.equal(world.destination, 'shade');
    }
});

test('playtest phrasing preserves partial meaning and never names a place after an explanation', () => {
    const state = create(); const world = worldApi.create();
    api.perceive(state, { scene: 'clearing', attention: [{ id: 'shade', meaning: 'rest' }] });
    world.experiences.push({ kind: 'rest', before: { fatigue: .8 }, after: { fatigue: .1 } },
        { kind: 'eat', taste: { quality: 'sweet', pleasant: true } });
    const cases = [
        ['おはよ～', 'good_morning'], ['しっかりやすんだかな？', 'rest_helped'],
        ['しっかり休めた？', 'rest_helped'], ['そこに木の実落ちているね', 'heard_berry'],
        ['おいしかった？', 'tasted_good'], ['すっぱくない？', 'unknown_taste_word'],
        ['今から、木陰で休んでね', 'join'], ['横になると気持ちいいよね', 'heard_rest_comfort'],
        ['休むことは大事だよ', 'heard_rest_partial'], ['うん、体力や眠気が回復するからね', 'heard_rest_partial']
    ];
    for (const [input, response] of cases) {
        const result = say(state, input);
        assert.equal(worldApi.respond(world, result, state).message, response, input);
    }
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
    assert.ok(!state.knowledge.meanings.some(m => m.id === 'sour'));
    for (const phrase of ['そこは休む場所だよ', '疲れがとれるんだよ', '食べるとおいしいのだよ', '休むことは大切だよ']) {
        const result = say(state, phrase);
        assert.ok(!result.learning.some(item => item.updated.length), phrase);
    }
    const fresh = create();
    assert.equal(say(fresh, 'うん、体力や眠気が回復するからね').understandings[0].complete, false);
});

test('rest variants keep negation and unknown knowledge from turning into commands', () => {
    for (const phrase of ['今から、木陰で休まないでね', '疲れたら木陰で休んでね']) {
        const state = create(); const world = worldApi.create();
        worldApi.respond(world, say(state, phrase), state);
        assert.equal(world.destination, null);
    }
    const state = create({ life: false }); const world = worldApi.create();
    worldApi.respond(world, say(state, '今から、木陰で休んでね'), state);
    assert.equal(world.destination, null);
});

test('playtest report keeps exact input, contextual traces and all notebook entries without changing learning', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    const report = reportApi.create({ state, world }, 1000);
    const raw = 'ぽぽだよ\n<script>literal</script>';
    report.record('player', { text: raw, context: state.context }, 2000);
    const result = say(state, 'これはぽぽだよ');
    report.record('understanding', { result }, 2100);
    const before = JSON.stringify(state);
    const output = report.build({ state, world }, notebookApi.groupedEntries(state), {}, 3000);
    assert.equal(output.timeline[0].text, raw);
    assert.equal(output.initial.state.serial, 0);
    assert.equal(output.current.state.serial, 1);
    assert.equal(output.recording.startedAt, new Date(1000).toISOString());
    assert.equal(output.notebook[0].literal, 'ぽぽ');
    output.timeline[0].text = 'changed';
    assert.equal(report.build({}, [], {}, 3000).timeline[0].text, raw);
    assert.equal(JSON.stringify(state), before);
});

test('report export writes only a user-chosen file; cancellation and errors preserve game data', async () => {
    const { exportReport } = require('../scripts/experimental/export_report');
    const payload = { title: 'Report', text: JSON.stringify({ format: 'word-learning-playtest', version: 1 }) };
    const writes = [];
    const write = async (...args) => { writes.push(args); };
    assert.equal((await exportReport({ showSaveDialog: async () => ({ canceled: true }) }, null, payload, write)).canceled, true);
    assert.equal(writes.length, 0);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, write)).ok, true);
    assert.deepEqual(writes[0], ['chosen.json', payload.text, 'utf8']);
    assert.equal((await exportReport({ showSaveDialog: async () => ({ filePath: 'chosen.json' }) }, null, payload, async () => { throw Error('full'); })).ok, false);
});

test('natural rest question and a berry-name answer bind to the actual experience or question', () => {
    const state = create(); const world = worldApi.create(); focus(state);
    worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    const answer = say(state, '木の実だよ');
    assert.equal(worldApi.respond(world, answer, state).message, 'name_echo');
    assert.equal(state.knowledge.associations[0].word, '木の実');
    world.experiences.push({ kind: 'rest', before: { fatigue: .7 }, after: { fatigue: .1 } });
    assert.equal(worldApi.respond(world, say(state, 'しっかり休めた？'), state).message, 'rest_helped');
    assert.equal(worldApi.respond(world, say(state, 'ゆっくり休めた？'), state).message, 'rest_helped');
});

test('notebook reading preserves sources, never turns co-occurrence into learned names', () => {
    const state = create();
    assert.deepEqual(notebookApi.entries(state), []);
    focus(state);
    say(state, 'ふわふわ');
    assert.deepEqual(notebookApi.entries(state), []);
    say(state, 'これはぽぽだよ');
    const before = JSON.stringify(state);
    const entries = notebookApi.entries(state);
    assert.equal(entries[0].literal, 'ぽぽ');
    assert.equal(entries[0].organized, false);
    assert.equal(entries[0].withdrawn, false);
    assert.deepEqual(notebookApi.entries(state), entries);
    assert.equal(JSON.stringify(state), before);
    say(state, 'さっきの説明は間違えた');
    assert.equal(notebookApi.entries(state)[0].withdrawn, true);
    assert.equal(notebookApi.entries(state)[0].literal, 'ぽぽ');
});

test('yes replies bind to explicit and recalled names without learning a name called yes', () => {
    for (const recalled of [false, true]) {
        const state = create(); const world = worldApi.create(); focus(state);
        const naming = say(state, 'これはぽぽだよ');
        worldApi.respond(world, naming, state);
        if (recalled) {
            state.context.pendingQuestion = null;
            worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
        }
        const reply = say(state, 'そうだよ');
        assert.equal(worldApi.respond(world, reply, state).message, 'name_confirmed');
        assert.ok(!state.knowledge.associations.some(a => a.word === 'そう'));
        const link = state.knowledge.associations.find(a => a.word === 'ぽぽ');
        assert.equal(link.evidence.length, 1);
        assert.ok(link.confirmedBy);
        assert.equal(notebookApi.entries(state)[0].detail, 'note_name_confirmed');
        assert.equal(worldApi.respond(world, say(state, 'ぽぽ'), state).message, 'name_known');
    }
    const state = create(); focus(state);
    say(state, 'そうだよ'); say(state, '休む場所は木陰だよ');
    assert.ok(!state.knowledge.associations.some(a => a.evidence.length));
});

test('food questions use experienced taste, respect knowledge, and do not invent old taste', () => {
    const state = create(); const world = worldApi.create(); world.hunger = .8;
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'not_eaten_yet');
    world.pause = 0;
    for (let i = 0; i < 1500 && !world.experiences.some(e => e.kind === 'eat'); i++) {
        const event = worldApi.tick(world, .1);
        if (event) worldApi.onArrival(world, state, event);
    }
    for (const phrase of ['おいしかった？', '木の実はおいしかった？', 'おいしい？']) {
        assert.equal(worldApi.respond(world, say(state, phrase), state).message, 'tasted_good');
    }
    assert.ok(notebookApi.entries(state).some(e => e.detail === 'note_experienced_sweet'));
    const unknown = create({ life: false });
    assert.notEqual(worldApi.respond(world, say(unknown, 'おいしかった？'), unknown).message, 'tasted_good');
    world.experiences.filter(e => e.kind === 'eat').forEach(e => { delete e.taste; });
    assert.equal(worldApi.respond(world, say(state, 'おいしかった？'), state).message, 'taste_unsure');
});

test('notebook groups repeated outcomes without deleting or merging different meanings', () => {
    const state = create();
    state.experiences = Array.from({ length: 30 }, (_, i) => ({ id: i, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }));
    state.experiences.push({ id: 31, activity: 'rest', before: { fatigue: .8 }, after: { fatigue: .2 } });
    const before = JSON.stringify(state);
    const groups = notebookApi.groupedEntries(state);
    assert.equal(groups.length, 2);
    assert.equal(groups[0].count, 30);
    assert.equal(groups[1].count, 1);
    assert.equal(JSON.stringify(state), before);
});

test('notebook describes actual outcomes and separates player reports from own preferences', () => {
    const state = create({ speech: 'gesture' });
    focus(state);
    say(state, '私は木の実が好き');
    state.experiences = [{ id: 4, activity: 'eat', before: { hunger: .8 }, after: { hunger: .2 } }];
    state.notes.push({ experienceId: 4, organizedAt: 5 });
    const entries = notebookApi.entries(state);
    assert.ok(entries.some(e => e.message === 'note_player_likes' && e.detail === 'note_heard'));
    assert.ok(entries.some(e => e.message === 'note_ate' && e.organized));
    assert.ok(!JSON.stringify(entries).includes('taste'));
    const unknown = create({ life: false });
    unknown.experiences = state.experiences;
    assert.equal(notebookApi.entries(unknown)[0].message, 'note_ate_sensation');
    assert.deepEqual(unknown.knowledge.meanings, []);
});

test('notebook only retains unanswered questions the character actually understood', () => {
    const state = create();
    const world = worldApi.create();
    const result = say(state, 'どうして休んだの？');
    const reply = worldApi.respond(world, result, state);
    notebookApi.rememberQuestion(state, result, reply);
    notebookApi.rememberQuestion(state, result, reply);
    assert.equal(state.notebookQuestions.length, 1);
    assert.equal(notebookApi.entries(state)[0].literal, 'どうして休んだの？');
    const unknown = say(state, '全く対応していない文');
    notebookApi.rememberQuestion(state, unknown, { message: 'answer_unknown' });
    assert.equal(state.notebookQuestions.length, 1);
    assert.deepEqual(notebookApi.entries(JSON.parse(JSON.stringify(state))), notebookApi.entries(state));
});

test('food, recovery and sleep use actual completed episodes without granting vocabulary', () => {
    const state = create({ life: false });
    const world = worldApi.create();
    world.hunger = .8;
    const events = [];
    for (let i = 0; i < 5000; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { events.push(event); worldApi.onArrival(world, state, event); }
    }
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'eat' && e.after.hunger < e.before.hunger));
    assert.ok(events.some(e => e.kind === 'experience' && e.activity === 'rest' && e.after.fatigue < e.before.fatigue));
    assert.ok(world.recovery.eat && world.recovery.rest);
    assert.ok(state.notes.some(n => n.kind === 'experienced_change'));
    assert.deepEqual(state.knowledge.meanings, []);
    assert.ok(world.fruit >= 0 && world.fruit <= 3);
    const episode = events.find(e => e.kind === 'experience');
    const count = state.experiences.length;
    worldApi.onArrival(world, state, episode);
    assert.equal(state.experiences.length, count);
});

test('pause freezes needs and fruit; eating cannot be cancelled into a lost meal', () => {
    const world = worldApi.create();
    const before = JSON.stringify(world);
    worldApi.tick(world, 60, true);
    assert.equal(JSON.stringify(world), before);
    world.mode = 'eat'; world.dwell = 1; world.activityBefore = { hunger: .8, fatigue: .2 };
    assert.equal(worldApi.approach(world, 'shade'), false);
    assert.equal(world.mode, 'eat');
});

test('save roundtrip and backup preserve learning; corrupt and full saves stop safely', () => {
    const { createStore } = require('../scripts/experimental/storage');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-life-test-'));
    try {
        const store = createStore(directory);
        const value = { version: 1, appearance: 'seed', state: create(), world: worldApi.create() };
        const unanswered = say(value.state, 'どうして休んだの？');
        notebookApi.rememberQuestion(value.state, unanswered, worldApi.respond(value.world, unanswered, value.state));
        assert.equal(typeof value.state.notebookQuestions[0].inputId, 'string');
        assert.equal(store.load().value, null);
        assert.equal(store.save(value).ok, true);
        value.world.hunger = .7;
        assert.equal(store.save(value).ok, true);
        assert.equal(createStore(directory).load().value.world.hunger, .7);
        assert.deepEqual(notebookApi.entries(createStore(directory).load().value.state), notebookApi.entries(value.state));
        assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'word-life.json.backup'), 'utf8')).world.hunger, .35);
        const previous = fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8');
        value.state.extra = 'x'.repeat(17 * 1024 * 1024);
        assert.equal(store.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), previous);
        delete value.state.extra;
        assert.equal(store.save(value).ok, false);
        fs.writeFileSync(path.join(directory, 'word-life.json'), '{broken');
        const corrupt = createStore(directory);
        assert.equal(corrupt.load().ok, false);
        assert.equal(corrupt.save(value).ok, false);
        assert.equal(fs.readFileSync(path.join(directory, 'word-life.json'), 'utf8'), '{broken');
    } finally {
        for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
        fs.rmdirSync(directory);
    }
});

test('all eight settings are independent and create no fictional experiences', () => {
    for (const foundation of [true, false]) for (const life of [true, false]) for (const speech of ['short', 'gesture']) {
        const state = create({ foundation, life, speech });
        assert.equal(state.knowledge.relations.length > 0, foundation);
        assert.equal(state.knowledge.meanings.length > 0, life);
        assert.deepEqual(state.records, []); assert.deepEqual(state.notes, []);
        const result = say(state, '少し休もう');
        assert.equal(result.understandings[0].complete, foundation && life);
        assert.equal(result.expression.channel === 'speech', speech === 'short' && life);
        assert.equal(result.reaction.action, null);
    }
});

test('gestures do not erase understanding', () => {
    const short = say(create(), '疲れたら休んでね');
    const gesture = say(create({ speech: 'gesture' }), '疲れたら休んでね');
    assert.deepEqual(short.understandings, gesture.understandings);
    assert.notDeepEqual(short.expression, gesture.expression);
});

test('unknown relationship never becomes an unconditional command', () => {
    const state = create();
    state.knowledge.relations = state.knowledge.relations.filter(r => r.id !== 'sequence');
    const result = say(state, '食べ終わったら、散歩しよう');
    assert.equal(result.understandings[0].kind, 'partial');
    assert.equal(result.understandings[0].known.meaning, 'walk');
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('conditions, requests, and action execution remain separate', () => {
    const result = say(create(), '疲れたら休んでね');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].conditionStatus, 'unknown');
    assert.equal(result.reaction.action, null);
});

test('six input categories reach their respective understanding paths', () => {
    const cases = [['少し休もう', 'invitation'], ['私は木の実が好き', 'report'], ['おいしかった？', 'question'],
        ['これを、ぽぽって呼ぼう', 'naming'], ['今日は仕事で失敗して悲しかった', 'report'], ['木の実は嫌いじゃない', 'report']];
    for (const [text, kind] of cases) {
        const state = create(); focus(state);
        assert.equal(say(state, text).understandings[0].kind, kind);
    }
});

test('real-world details stay unknown while the reported feeling is received', () => {
    const result = say(create(), '今日は量子実験で失敗して悲しかった');
    const u = result.understandings[0];
    assert.equal(u.known.meaning, 'sad'); assert.equal(u.subject, 'player');
    assert.equal(u.eventTime, 'past_today'); assert.equal(u.complete, false);
    assert.ok(u.unresolved.some(item => item.token === '量子実験'));
    assert.equal(result.reaction.intent, 'receive_sadness');
});

test('negation does not invert dislike into like or desire into preference', () => {
    const result = say(create(), '木の実は嫌いじゃない。今は食べたくない');
    assert.equal(result.understandings[0].known.meaning, 'dislike');
    assert.equal(result.understandings[0].polarity, 'negative');
    assert.equal(result.understandings[1].aspect, 'desire');
    assert.equal(result.understandings[1].eventTime, 'now');
    assert.equal(result.understandings[1].polarity, 'negative');
});

test('question slots are not missing understanding; no fabricated answers', () => {
    const result = say(create(), 'どうして休んだの？');
    assert.equal(result.understandings[0].complete, true);
    assert.equal(result.understandings[0].questionSlot, 'reason');
    assert.equal(result.reaction.intent, 'answer_unknown');
    assert.equal(say(create(), 'おいしかった').understandings[0].complete, false);
    const questionState = create();
    assert.equal(say(questionState, '木の実が好き？').understandings[0].kind, 'question');
    assert.equal(questionState.records.length, 0);
});

test('naming creates tentative adoption and supported links, not grammar mastery', () => {
    const state = create(); focus(state);
    const first = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(first.learning[0].adopted.status, 'tentative');
    assert.equal(first.learning[0].updated.length, 1);
    assert.equal(first.transfer[0].relationAcquired, false);
    assert.equal(say(state, 'これを、ぽぽって呼ぼう').learning[0].updated.length, 0);
    focus(state, 'path');
    const secondScene = say(state, 'これを、ぽぽって呼ぼう');
    assert.equal(secondScene.transfer[0].scope, 'same_object_across_scenes');
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('ambiguous attention preserves candidates and never reinforces a guessed target', () => {
    const state = create(); focus(state, 'clearing', 2);
    const result = say(state, 'これをぽぽって呼ぼう');
    assert.equal(result.learning[0].candidates.length, 2);
    assert.equal(result.learning[0].adopted, null); assert.equal(result.learning[0].updated.length, 0);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('naming a known object word does not silently name the whole species', () => {
    const state = create(); focus(state);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted.target, 'berry:1');
    focus(state, 'path', 2);
    assert.equal(say(state, '木の実をぽぽって呼ぼう').learning[0].adopted, null);
});

test('retracting one explanation leaves independent prior evidence available', () => {
    const state = create(); focus(state);
    say(state, 'これをぽぽって呼ぼう');
    focus(state, 'path'); say(state, 'これをぽぽって呼ぼう');
    say(state, 'さっきの説明は間違えた');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 1);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted.id, 'berry:1');
});

test('mere co-occurrence or rereading never creates understood names', () => {
    const state = create({ foundation: false, life: false }); focus(state);
    for (let i = 0; i < 10; i++) say(state, 'ぽぽ');
    assert.equal(state.knowledge.associations.length, 1);
    assert.deepEqual(state.knowledge.associations[0].evidence, []);
    assert.deepEqual(state.knowledge.meanings, []);
    assert.deepEqual(state.knowledge.relations, []);
});

test('retraction retains evidence history but removes it from active interpretation', () => {
    const state = create(); focus(state);
    const original = say(state, 'これをぽぽって呼ぼう');
    const correction = say(state, 'さっきの説明は間違えた');
    assert.equal(correction.understandings[0].corrects, original.input.id);
    assert.equal(state.records[0].retractedBy, correction.input.id);
    assert.equal(state.knowledge.associations[0].evidence[0].retractedBy, correction.input.id);
    assert.equal(say(state, 'ぽぽが好き').understandings[0].target.adopted, null);
});

test('unrelated or missing correction antecedents are unresolved', () => {
    const state = create(); say(state, '私は木の実が好き');
    assert.equal(say(state, 'さっきの説明は間違えた').understandings[0].complete, false);
    assert.equal(state.records[0].retractedBy, undefined);
});

test('speaker-specific names coexist; literal input and names retain case', () => {
    const state = create(); focus(state);
    const result = say(state, 'これを「PoPo」って呼ぼう');
    assert.equal(result.input.raw, 'これを「PoPo」って呼ぼう');
    assert.equal(state.knowledge.associations[0].word, 'PoPo');
    assert.equal(say(state, 'PoPoが好き', { speaker: 'visitor' }).understandings[0].target.adopted, null);
});

test('context eviction never deletes selected records; recall is bounded', () => {
    const state = create(); say(state, '昨日は悲しかった');
    for (let i = 0; i < 20; i++) say(state, 'うれしい');
    assert.equal(state.context.turns.length, api.RULES.contextLimit);
    assert.equal(state.records.length, 21);
    assert.equal(state.records[0].understandings[0].eventTime, 'yesterday');
    const result = say(state, 'うれしい');
    assert.equal(result.recalled.length, api.RULES.recallLimit);
});

test('all seven input catalogs accept basics; unsupported text remains unresolved', () => {
    const samples = { ja: '少し休もう', en: "Let's rest", 'zh-CN': '休息一下吧', ru: 'Давай отдохнём',
        'es-ES': 'Descansemos un poco', 'pt-BR': 'Vamos descansar um pouco', de: 'Ruhen wir uns etwas aus' };
    for (const [locale, text] of Object.entries(samples)) {
        assert.equal(say(create(), text, { locale }).understandings[0].known.meaning, 'rest');
        assert.equal(say(create(), 'xyz 123 ???', { locale }).understandings[0].complete, false);
    }
});

test('isolated server cannot serve legacy entry points or saves', async () => {
    const { createServer } = require('../scripts/experimental/serve');
    const server = createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const url = `http://127.0.0.1:${server.address().port}`;
        assert.equal((await fetch(url)).status, 200);
        for (const file of ['index.html', 'system.js', 'cloud_manager.js', 'package.json', '../package.json']) {
            assert.equal((await fetch(`${url}/${file}`)).status, 404);
        }
        assert.equal((await fetch(`${url}/experimental_word_learning_catalog.json`)).status, 200);
    } finally { await new Promise(resolve => server.close(resolve)); }
});

test('legacy release packages exclude experimental entry points', () => {
    for (const name of ['full', 'full-offline', 'demo']) {
        const config = require('../scripts/release/build_config')(name);
        assert.ok(config.files.includes('!experimental_word_learning*'));
    }
    const html = fs.readFileSync(path.join(__dirname, '../experimental_word_learning.html'), 'utf8');
    assert.doesNotMatch(html, /(?:system|ai_core|ui_controller|cloud_manager|release_config)\.js/);
});

test('pointing leads to continuous movement and perception only after arrival', () => {
    const world = worldApi.create();
    worldApi.approach(world, 'berry:1', 'pointing');
    assert.equal(worldApi.perception(world).attention.length, 0);
    const x = world.x; worldApi.tick(world, .1);
    assert.ok(world.x < x && world.x > .28);
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.perception(world).attention[0].id, 'berry:1');
    assert.equal(world.mode, 'observe');
});

test('watching without instructions continues the life loop without inventing knowledge', () => {
    const world = worldApi.create(), state = create({ life: false, foundation: false });
    const arrivals = new Set();
    for (let i = 0; i < 2000; i++) {
        const event = worldApi.tick(world, .1);
        if (event?.kind === 'arrive' && event.target) arrivals.add(event.target.startsWith('berry:') ? 'berry:1' : event.target);
        api.perceive(state, worldApi.perception(world));
    }
    assert.deepEqual([...arrivals].sort(), ['berry:1', 'path', 'shade']);
    assert.equal(state.knowledge.meanings.length, 0); assert.equal(state.records.length, 0);
});

test('hidden or paused time cannot progress life or catch up a long interval', () => {
    const world = worldApi.create(); worldApi.approach(world, 'shade');
    const snapshot = structuredClone(world);
    worldApi.tick(world, 3600, true); assert.deepEqual(world, snapshot);
    worldApi.tick(world, 3600); assert.equal(world.elapsed, .1);
    assert.ok(Math.abs(world.x - snapshot.x) < .01);
});

test('understanding a suggestion permits a choice, not unconditional obedience', () => {
    const state = create(), world = worldApi.create();
    const result = say(state, '少し休もう');
    world.attention = 'berry:1'; world.mode = 'observe'; world.dwell = 8;
    assert.equal(worldApi.respond(world, result, state).message, 'keep_looking');
    assert.equal(world.destination, null);
    world.dwell = 2;
    assert.equal(worldApi.respond(world, result, state).message, 'join');
    assert.equal(world.destination, 'shade');
    assert.equal(world.reasons[0].inputId, result.input.id);
});

test('unknown, conditional and negative proposals do not dispatch immediate actions', () => {
    for (const [options, input] of [[{}, '疲れたら休んでね'], [{ foundation: false }, '少し休もう'],
        [{ life: false }, '少し休もう'], [{}, 'それは食べないで']]) {
        const state = create(options), world = worldApi.create();
        worldApi.respond(world, say(state, input), state);
        assert.equal(world.destination, null);
    }
});

test('a learned name changes observable response; recall adds no evidence', () => {
    const state = create(), world = worldApi.create();
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
    focus(state); say(state, 'これをぽぽって呼ぼう');
    api.perceive(state, { scene: 'path', attention: [] });
    const result = say(state, 'ぽぽ');
    assert.equal(result.understandings[0].kind, 'reference');
    const response = worldApi.respond(world, result, state);
    assert.equal(response.target, 'berry:1'); assert.equal(response.message, 'name_echo');
    assert.equal(state.knowledge.associations[0].evidence.length, 1);
    state.settings.speech = 'gesture';
    assert.equal(worldApi.respond(world, result, state).message, 'recognize_gesture');
});

test('existing sprite frames all fit their actual PNG sheets', () => {
    const visuals = require('../experimental_word_learning_visuals.json');
    for (const config of Object.values(visuals)) {
        const png = fs.readFileSync(path.join(__dirname, '..', config.image));
        const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
        for (const frames of Object.values(config.actions)) for (const frame of frames) {
            assert.ok(frame.sw > 0 && frame.sh > 0 && frame.sx >= 0 && frame.sy >= 0);
            assert.ok(frame.sx + frame.sw <= width && frame.sy + frame.sh <= height);
        }
    }
});

test('natural naming answers, confirmation and rejection keep their referent', () => {
    for (const answer of ['ぽぽだよ', 'これはぽぽだよ', 'ぽぽ']) {
        const state = create(), world = worldApi.create(); focus(state);
        assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'ask_name');
        const result = say(state, answer);
        assert.equal(result.understandings[0].kind, 'naming');
        assert.equal(worldApi.respond(world, result, state).word, 'ぽぽ');
        assert.equal(say(state, 'うん').understandings[0].answer, 'yes');
        assert.equal(state.knowledge.associations[0].evidence.length, 1);
    }
    const state = create(), world = worldApi.create(); focus(state);
    worldApi.respond(world, say(state, 'ぽぽだよ'), state);
    const no = say(state, 'ちがうよ');
    assert.equal(no.understandings[0].answer, 'no');
    assert.equal(state.knowledge.associations[0].evidence.filter(e => !e.retractedBy).length, 0);
    assert.equal(say(state, 'ぽぽ').understandings[0].kind, 'partial');
});

test('short replies cannot teach unrelated statements or unidentified objects', () => {
    const state = create();
    assert.equal(say(state, 'ぽぽだよ').learning[0].updated.length, 0);
    assert.equal(say(state, 'うん').understandings[0].kind, 'partial');
    focus(state);
    assert.equal(say(state, '食べたくないんだよ').learning[0].updated.length, 0);
    const world = worldApi.create(); worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' });
    api.perceive(state, { scene: 'path', attention: [] });
    assert.equal(state.context.pendingQuestion, null);
    assert.equal(say(state, 'ぽぽ').learning[0].updated.length, 0);
});

test('activity answers come from actual current and completed actions', () => {
    const state = create(), world = worldApi.create();
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'answer_unknown');
    world.pause = 0; worldApi.approach(world, 'shade');
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'walking');
    world.pause = 0;
    for (let i = 0; i < 80; i++) worldApi.tick(world, .1);
    assert.equal(worldApi.respond(world, say(state, '何してるの？'), state).message, 'resting');
    assert.equal(worldApi.respond(world, say(state, '何をしてた？'), state).message, 'walked');
    assert.equal(worldApi.respond(world, say(state, 'どうして休んだの？'), state).message, 'answer_unknown');
});

test('name questions and spontaneous preference recall respect knowledge and evidence', () => {
    const state = create(), world = worldApi.create(); focus(state);
    assert.equal(worldApi.respond(world, say(state, 'これなに？'), state).message, 'known_berry');
    say(state, '私は木の実が好き');
    assert.equal(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' }).message, 'player_likes_berry');
    assert.notEqual(worldApi.onArrival(world, state, { kind: 'arrive', target: 'berry:1' })?.message, 'player_likes_berry');
    const unknown = create({ life: false }); focus(unknown);
    assert.notEqual(worldApi.respond(world, say(unknown, 'これなに？'), unknown).message, 'known_berry');
    const gesture = create({ speech: 'gesture' }); focus(gesture);
    assert.equal(worldApi.onArrival(worldApi.create(), gesture, { kind: 'arrive', target: 'berry:1' }), null);
});
