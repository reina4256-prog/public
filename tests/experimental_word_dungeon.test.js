'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_dungeon_core');
const learning = require('../experimental_word_dungeon_learning');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const answer = { ja: 'はい', en: 'yes', 'zh-CN': '是的', ru: 'да', 'es-ES': 'sí', 'pt-BR': 'sim', de: 'ja' };
function teach(session, raw, locale = 'ja') {
    const first = learning.receive(session, raw, catalog, locale);
    assert(first.reply, raw);
    const original = JSON.stringify(session.state.dungeonLearning.inputs.at(-1));
    const index = session.state.dungeonLearning.inputs.length - 1;
    learning.receive(session, answer[locale], catalog, locale);
    assert.equal(JSON.stringify(session.state.dungeonLearning.inputs[index]), original);
    return learning.receive(session, raw, catalog, locale);
}

test('the same child keeps island knowledge and original records, and learns a distinct dungeon individual name', () => {
    const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    core.receive(state, 'これはポポだよ', catalog, { locale: 'ja', at: 10 });
    const original = JSON.stringify(state.records), knowledge = JSON.stringify(state.knowledge);
    const session = learning.create(state); learning.perceive(session, learning.objects[0].id);
    assert.equal(session.state, state); assert.equal(JSON.stringify(state.knowledge), knowledge);
    const prior = learning.receive(session, 'ポポ', catalog, 'ja', 20).result;
    assert.notEqual(prior.understandings[0].target?.adopted?.id, learning.objects[0].id);
    teach(session, 'これはアカだよ');
    assert(state.dungeonLearning.lexicon.some(a => a.word === 'アカ' && a.target === learning.objects[0].id));
    assert.equal(JSON.stringify(state.records.slice(0, JSON.parse(original).length)), original);
});

test('warning is individual testimony with original understanding, and changes an understood approach into an explained retreat', () => {
    const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog);
    let session = learning.create(state); learning.perceive(session, learning.objects[0].id);
    teach(session, 'そこへ行って');
    assert.equal(session.last.reason, 'obey');
    const original = JSON.stringify(state.dungeonLearning.inputs[0]);
    const warning = teach(session, 'これは危ない');
    assert.equal(warning.learned, true); assert.equal(learning.warned(session), true);
    learning.receive(session, 'そこへ行って', catalog, 'ja', 3);
    assert.equal(session.last.reason, 'diverged'); assert(session.last.warningSources.includes(warning.result.input.id));
    assert.equal(JSON.stringify(state.dungeonLearning.inputs[0]), original);
    assert.equal(state.knowledge.associations.some(a => a.word === '危ない'), false);
    assert(learning.notes(state).some(note => note.message === 'dungeonNote'));
    session = learning.create(state); learning.advance(session);
    assert.equal(session.last.reason, 'retreat');
    assert.equal(new Set(state.dungeonLearning.inputs.map(e => e.result.input.id)).size, state.dungeonLearning.inputs.length);
});

test('missing report knowledge or pointing never becomes a warning, and stair warnings do not spread to opponents', () => {
    for (const [foundation, target] of [[false, learning.objects[0].id], [true, null], [true, learning.objects[1].id]]) {
        const state = core.create({ foundation, life: true, speech: 'gesture' }, catalog), session = learning.create(state);
        learning.perceive(session, target); learning.receive(session, 'これは危ない', catalog, 'ja', 1);
        assert.equal(learning.warned(session), false);
        assert.equal(state.dungeonLearning.warnings.length, 0); assert.equal(learning.notes(state)[0].detail, 'dungeonUnknown');
    }
});

test('seven language warning and approach forms keep originals and language-neutral targets', () => {
    for (const [locale, forms] of Object.entries(learning.forms)) {
        const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        teach(session, forms.warning[0], locale);
        teach(session, forms.go[0], locale);
        assert.equal(session.last.reason, 'diverged', locale);
        assert.equal(state.dungeonLearning.inputs[0].result.input.raw, forms.warning[0]);
        assert.equal(state.dungeonLearning.warnings[0].target, 'dungeon:enemy:1');
        const before = JSON.stringify(state); learning.notes(state); assert.equal(JSON.stringify(state), before);
    }
});

test('localized naming preserves the actual original and does not acquire a warning or transfer a species name', () => {
    for (const [locale, raw] of Object.entries({ en: 'This is Popo', 'zh-CN': '这是波波', ru: 'Это Попо',
        'es-ES': 'Esto se llama Popo', 'pt-BR': 'Isto se chama Popo', de: 'Das heißt Popo' })) {
        const state = core.create({ foundation: true, life: true, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        const value = teach(session, raw, locale);
        assert.equal(value.result.understandings[0].complete, true, locale);
        assert.equal(state.knowledge.associations.length, 0);
        assert.equal(state.dungeonLearning.lexicon.filter(e => e.meaning === 'reference').length, 1);
        assert.equal(state.dungeonLearning.lexicon[0].target, learning.objects[0].id);
        assert.equal(state.dungeonLearning.inputs[0].result.input.raw, raw);
        assert.equal(state.dungeonLearning.inputs[0].knowledgeBefore.associations.length, 0);
        assert.equal(learning.warned(session), false);
    }
});

test('request and walking knowledge are necessary for a target instruction; understanding does not force compliance', () => {
    for (const [foundation, life] of [[false, true], [true, false]]) {
        const state = core.create({ foundation, life, speech: 'short' }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        const value = learning.receive(session, 'そこへ行って', catalog, 'ja', 1);
        assert.equal(value.result.understandings[0].complete, false);
        assert.equal(session.turn, 0); assert.equal(session.last, null);
    }
});
test('free compound teaching asks about a visible candidate and learns from confirmation without replaying the original request', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    const raw = '横にいるのは敵だから避けてね';
    const first = learning.receive(session, raw, catalog);
    assert.equal(first.reply.message, 'dungeonConfirmTarget'); assert.equal(session.proposal, learning.objects[0].id);
    assert.equal(first.result.understandings[0].complete, false); assert.equal(session.turn, 0);
    assert.equal(state.dungeonLearning.lexicon.length, 0);
    const original = JSON.stringify(state.dungeonLearning.inputs[0]);
    learning.receive(session, 'うん', catalog);
    assert.equal(session.turn, 0); assert.equal(learning.warned(session), false);
    assert(state.dungeonLearning.lexicon.some(e => e.word === '敵' && e.target === learning.objects[0].id));
    assert.equal(learning.receive(session, raw, catalog).reply.message, 'dungeonConfirmAvoid');
    learning.receive(session, 'そうだよ', catalog);
    assert.equal(session.turn, 0);
    const result = learning.receive(session, '敵をよけてください', catalog);
    assert.equal(result.result.understandings[0].complete, true); assert.equal(session.last.reason, 'avoid');
    assert.equal(result.result.understandings[0].subject, 'self'); assert.equal(result.result.input.speaker, 'player');
    assert.deepEqual(result.result.understandings[0].roles.actors, ['self']); assert.equal(session.last.subject, 'self');
    assert.equal(learning.warned(session), false); assert.equal(JSON.stringify(state.dungeonLearning.inputs[0]), original);
    assert.equal(state.knowledge.meanings.some(e => /enemy|danger|stairs/.test(e.id)), false);
});
test('unfamiliar stairs are grounded by a free position description, not by the internal exit identifier', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    assert.equal(learning.receive(session, '階段にいって', catalog).reply.message, 'dungeonWhich');
    assert.equal(session.proposal, null); assert.equal(session.turn, 0);
    assert.equal(learning.receive(session, '右上にあるもの', catalog).reply.message, 'dungeonConfirmTarget');
    assert.equal(session.proposal, learning.objects[1].id); assert.equal(state.dungeonLearning.lexicon.length, 0);
    learning.receive(session, 'はい', catalog);
    assert.equal(learning.receive(session, '階段へ向かって', catalog).reply.message, 'dungeonConfirmGo');
    learning.receive(session, 'そうです', catalog);
    for (const raw of ['階段の方に行ってください', '階段のところへ進んでね', '階段にいって']) {
        const result = learning.receive(session, raw, catalog);
        assert.equal(result.result.understandings[0].complete, true); assert.equal(session.last.reason, 'obey');
    }
    const count = session.state.dungeonLearning.actions.length;
    learning.receive(session, '階段に行って？', catalog);
    assert.equal(session.state.dungeonLearning.actions.length, count);
    const entry = state.dungeonLearning.lexicon.find(e => e.word === '階段');
    assert.equal(entry.sourceInputId, 'input:1'); assert.equal(entry.proposalInputId, 'input:2'); assert.equal(entry.inputId, 'input:3');
});
test('rejected and cancelled proposals do not acquire words or execute, and target refinements need confirmation', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    learning.receive(session, '赤いものはころころだよ', catalog);
    learning.receive(session, '違う', catalog);
    assert.equal(session.proposal, null); assert.equal(state.dungeonLearning.lexicon.length, 0);
    learning.receive(session, '右上にあるもの', catalog); learning.receive(session, 'はい', catalog);
    assert.equal(state.dungeonLearning.lexicon.find(e => e.word === 'ころころ').target, learning.objects[1].id);
    learning.receive(session, 'ころころに行って', catalog); learning.receive(session, 'いいえ', catalog);
    assert.equal(state.dungeonLearning.lexicon.some(e => e.meaning === 'go'), false); assert.equal(session.pending, null);
    learning.receive(session, 'ころころに行って', catalog); learning.receive(session, 'はい？', catalog);
    assert.equal(state.dungeonLearning.lexicon.some(e => e.meaning === 'go'), false);
    learning.receive(session, 'ころころに行って', catalog); learning.receive(session, 'おはよう', catalog);
    learning.receive(session, 'はい', catalog);
    assert.equal(state.dungeonLearning.lexicon.some(e => e.meaning === 'go'), false); assert.equal(session.turn, 0);
});
test('repeating, reading notes and reentering retain evidence without granting knowledge or replaying actions', () => {
    const state = core.create({}, catalog); let session = learning.create(state);
    for (let i = 0; i < 3; i++) learning.receive(session, '隣にいるのは敵だよ', catalog);
    assert.equal(state.dungeonLearning.lexicon.length, 0);
    learning.receive(session, 'はい', catalog);
    const knowledge = JSON.stringify(state.dungeonLearning.lexicon), original = JSON.stringify(state.dungeonLearning.inputs);
    learning.notes(state); learning.notes(state);
    assert.equal(JSON.stringify(state.dungeonLearning.lexicon), knowledge); assert.equal(JSON.stringify(state.dungeonLearning.inputs), original);
    session = learning.create(state); assert.equal(session.pending, null);
    learning.receive(session, '敵', catalog);
    assert.equal(JSON.stringify(state.dungeonLearning.lexicon), knowledge); assert.equal(session.turn, 0);
    assert.equal(new Set(state.dungeonLearning.inputs.map(e => e.result.input.id)).size, state.dungeonLearning.inputs.length);
});
test('learning local request vocabulary cannot grant missing life or relation knowledge, including scoped rest knowledge', () => {
    for (const options of [{ foundation: false }, { life: false }]) {
        const state = core.create(options, catalog), session = learning.create(state);
        learning.receive(session, '隣のものは敵だから避けてね', catalog); learning.receive(session, 'はい', catalog);
        assert.equal(state.dungeonLearning.lexicon.length, 0); assert.equal(session.turn, 0);
    }
    const state = core.create({}, catalog), session = learning.create(state);
    state.knowledge.relations = state.knowledge.relations.filter(e => e.id !== 'reason');
    state.knowledge.relations.push({ id: 'reason', source: 'experienced_relation', scope: { kind: 'question', locale: 'ja', speaker: 'player', slot: 'reason', meaning: 'rest' } });
    const result = learning.receive(session, '横にいるのは敵だから避けてね', catalog);
    assert.equal(result.reply.message, 'dungeonNeedBasis'); assert.equal(session.pending, null);
    assert(result.result.understandings[0].unresolved.some(e => e.type === 'relation' && e.id === 'reason'));
});
test('known warning, target naming and avoidance requests remain separate across paraphrases', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    teach(session, '隣のものは敵だよ');
    teach(session, '敵を避けて');
    assert.equal(learning.warned(session), false);
    const original = JSON.stringify(state.dungeonLearning.inputs);
    teach(session, '敵は危険です');
    assert.equal(learning.warned(session), true);
    assert.equal(JSON.stringify(state.dungeonLearning.inputs.slice(0, JSON.parse(original).length)), original);
    const result = learning.receive(session, '敵には近づかないでね', catalog);
    assert.equal(result.result.understandings[0].complete, true); assert.equal(session.last.reason, 'avoid');
});
test('ambiguous names, unsupported negation and conditionals do not become a different supported command', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    learning.perceive(session, learning.objects[0].id); teach(session, 'これは同じだよ');
    learning.perceive(session, learning.objects[1].id); teach(session, 'これは同じだよ');
    const value = learning.receive(session, '同じに行って', catalog);
    assert.equal(value.result.understandings[0].complete, false); assert.equal(session.proposal, null);
    for (const raw of ['もし敵なら避けて', '敵じゃないから近づいて', '「敵を避けて」と言われた', '階段に行って？']) {
        const before = JSON.stringify(state.dungeonLearning.lexicon);
        learning.receive(session, raw, catalog); assert.equal(session.turn, 0); assert.equal(JSON.stringify(state.dungeonLearning.lexicon), before);
    }
});
test('all seven locales learn a new visible name and avoidance intent through free text without target buttons', () => {
    const cases = {
        ja: ['赤いものはルルだよ', 'ルルを避けて', 'ルルから離れて'],
        en: ['The red figure is Lulu', 'Avoid Lulu', 'Stay away from Lulu'],
        'zh-CN': ['红色的那个叫露露', '避开露露', '远离露露'],
        ru: ['Красный называется Лулу', 'Избегай Лулу', 'Держись подальше от Лулу'],
        'es-ES': ['La figura roja se llama Lulu', 'Evita Lulu', 'Aléjate de Lulu'],
        'pt-BR': ['A figura vermelha se chama Lulu', 'Evite Lulu', 'Afaste-se de Lulu'],
        de: ['Die rote Gestalt heißt Lulu', 'Meide Lulu', 'Entferne dich von Lulu']
    };
    for (const [locale, [name, first, second]] of Object.entries(cases)) {
        const session = learning.create(core.create({}, catalog));
        teach(session, name, locale); teach(session, first, locale);
        const result = learning.receive(session, second, catalog, locale);
        assert.equal(result.result.understandings[0].complete, true, locale);
        assert.equal(session.last.reason, 'avoid', locale); assert.equal(learning.warned(session), false);
        const original = JSON.stringify(session.state.dungeonLearning.lexicon);
        learning.receive(session, first, catalog, locale === 'en' ? 'de' : 'en');
        assert.equal(JSON.stringify(session.state.dungeonLearning.lexicon), original);
    }
});
test('known sensory words never erase an unknown negation, alternative or second instruction', () => {
    const session = learning.create(core.create({}, catalog));
    teach(session, '赤いものは敵だよ'); teach(session, '敵を避けて');
    const count = session.state.dungeonLearning.actions.length;
    for (const raw of ['赤い相手じゃないものを避けて', '赤い相手か階段を避けて', '赤いものに行って、敵を避けて', '赤いものを避けて、階段に行って']) {
        const result = learning.receive(session, raw, catalog);
        assert.equal(result.result.understandings[0].complete, false, raw);
        assert.equal(session.state.dungeonLearning.actions.length, count, raw);
    }
});
test('an unconfirmed spatial proposal cannot survive actor movement or a new session', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    learning.receive(session, '隣にいるのは敵だよ', catalog); learning.advance(session);
    assert.equal(session.pending, null); learning.receive(session, 'はい', catalog);
    assert.equal(state.dungeonLearning.lexicon.length, 0);
    const next = learning.create(state); learning.receive(next, 'はい', catalog);
    assert.equal(state.dungeonLearning.lexicon.length, 0);
});
test('a learned side reference stays horizontal while an upper reference can identify an object in the same column', () => {
    const session = learning.create(core.create({}, catalog));
    teach(session, '横にいるのは敵だよ');
    session.position = { x: 6, y: 2 };
    const side = learning.receive(session, '横のものを避けて', catalog);
    assert.equal(side.result.understandings[0].complete, false); assert.equal(session.proposal, null);
    session.position = { x: 7, y: 3 };
    learning.receive(session, '上にあるものは階段だよ', catalog);
    assert.equal(session.proposal, learning.objects[1].id);
    assert.equal(session.turn, 0);
});
test('an unnamed target clarification establishes conversational attention without learning an empty name or replaying the request', () => {
    const session = learning.create(core.create({}, catalog));
    assert.equal(learning.receive(session, '避けてね', catalog).reply.message, 'dungeonWhich');
    learning.receive(session, '赤いもの', catalog); learning.receive(session, 'はい', catalog);
    assert.equal(session.attention, learning.objects[0].id);
    assert.equal(session.state.dungeonLearning.lexicon.some(e => e.meaning === 'reference' && !e.word), false);
    assert.equal(session.turn, 0);
    assert.equal(learning.receive(session, 'よけてください', catalog).reply.message, 'dungeonConfirmAvoid');
    learning.receive(session, 'うん', catalog); assert.equal(session.turn, 0);
    learning.receive(session, '離れてね', catalog); assert.equal(session.last.reason, 'avoid');
});
test('unknown instructions do not move, consume a turn or teach; autonomous ability stays separate', () => {
    const original = api.setKnown(api.create(), 'move', false), snapshot = JSON.stringify(original);
    const result = api.step(original, 'right');
    assert.equal(JSON.stringify(original), snapshot);
    assert.deepEqual(result.position, original.position); assert.equal(result.turn, 0);
    assert.equal(result.events[0].understood, false); assert.equal(result.events[0].action, null);
    assert.equal(result.events[0].reason, 'unknown'); assert.deepEqual(result.known, original.known);
    assert.notDeepEqual(api.step(result).position, result.position);
});
test('a dangerous understood instruction produces an explicit different choice and reason', () => {
    const before = api.create('danger'), result = api.step(before, 'right'), event = result.events[0];
    assert.equal(event.requested, 'right'); assert.equal(event.understood, true);
    assert.equal(event.reason, 'diverged'); assert.equal(event.source, 'autonomous');
    assert.notEqual(event.action, event.requested);
    assert.ok(Math.abs(result.position.x - result.hazard.x) + Math.abs(result.position.y - result.hazard.y) > 1);
    assert.deepEqual(event.before, before.position); assert.deepEqual(event.after, result.position);
});
test('safe instructions, walls, intentional waiting and retreat retain separate outcomes', () => {
    assert.equal(api.step(api.create(), 'up').events[0].reason, 'obey');
    assert.equal(api.step(api.step(api.create(), 'up'), 'right').events.at(-1).reason, 'obey');
    const wall = api.step(api.step(api.create(), 'right'), 'right');
    assert.equal(wall.events.at(-1).reason, 'blocked');
    assert.equal(api.step(api.create(), 'wait').events[0].reason, 'wait');
    const retreat = api.step(api.create('danger'), 'retreat');
    assert.equal(retreat.events[0].source, 'instruction'); assert.equal(retreat.events[0].reason, 'obey');
    assert.equal(api.step(api.create(), 'not-a-command').events[0].reason, 'unknown');
});
test('both scenes reach the exit without loops or hazard contact, even when instruction words are unknown', () => {
    for (const scene of ['explore', 'danger']) {
        let state = api.create(scene); for (const key of Object.keys(state.known)) state = api.setKnown(state, key, false);
        for (let i = 0; i < 40 && !state.complete; i++) {
            const next = api.step(state);
            assert.notDeepEqual(next.position, next.hazard); assert.equal(api.grid[next.position.y][next.position.x], '.');
            assert.deepEqual(next.known, state.known); state = next;
        }
        assert.equal(state.complete, true); assert.deepEqual(state.position, state.exit);
        assert.deepEqual(api.step(state, 'left'), state);
    }
});
test('changing sample knowledge never rewrites a previous event, and history is bounded with unique IDs', () => {
    let state = api.step(api.create(), 'up'); const original = JSON.stringify(state.events);
    state = api.setKnown(state, 'move', false); assert.equal(JSON.stringify(state.events), original);
    for (let i = 0; i < 100; i++) state = api.step(state, 'up');
    assert.equal(state.events.length, 60); assert.equal(new Set(state.events.map(e => e.id)).size, 60);
    assert.equal(state.sequence, 101); assert.deepEqual(api.create().events, []);
});
test('the independent preview and existing assets are served without enabling personal recording', async () => {
    const server = require('../scripts/experimental/serve').createServer();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        const base = 'http://127.0.0.1:' + server.address().port;
        for (const file of ['experimental_word_dungeon.html', 'experimental_word_dungeon.css', 'experimental_word_dungeon.js',
            'experimental_word_dungeon_core.js', 'robot.png', 'dungeon_scull_mapchip.png'])
            assert.equal((await fetch(base + '/' + file)).status, 200, file);
        assert.equal((await fetch(base + '/__word_playtest/config')).status, 404);
        assert.equal(server.personalRecording.config().enabled, false);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
