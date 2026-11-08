'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_dungeon_core');
const learning = require('../experimental_word_dungeon_learning');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const worldApi = require('../experimental_word_learning_world');
const lifeLearning = require('../experimental_word_life_learning');
const storage = require('../scripts/experimental/storage');
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
test('the reported seven-input conversation keeps clarification context and learns only the confirmed individual', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    const raws = ['右に敵がいるから避けて', '避けて', '右', '右の赤いやつ', '敵', '階段', '階段わかる？'];
    const originals = [];
    for (const [i, raw] of raws.entries()) {
        const result = learning.receive(session, raw, catalog, 'ja', i + 1);
        assert.equal(result.special, true, raw);
        if (i < 3) { assert.equal(session.pending.word, '敵'); assert.equal(session.proposal, null); }
        if (i === 3) assert.equal(session.proposal, learning.objects[0].id);
        if (i === 4) {
            const entry = state.dungeonLearning.lexicon.find(e => e.word === '敵');
            assert.equal(entry.target, learning.objects[0].id);
            assert.equal(entry.sourceInputId, originals[0].result.input.id);
            assert.equal(entry.proposalInputId, originals[3].result.input.id);
            assert.deepEqual(entry.clarificationInputIds, originals.slice(1, 4).map(e => e.result.input.id));
            assert.equal(entry.confirmationKind, 'naming_answer');
        }
        if (i > 4) { assert.equal(session.pending.word, '階段'); assert.equal(session.proposal, null); }
        assert.equal(session.turn, 0); assert.equal(learning.warned(session), false);
        originals.push(structuredClone(state.dungeonLearning.inputs.at(-1)));
    }
    assert.deepEqual(state.dungeonLearning.inputs, originals);
    assert(!state.dungeonLearning.lexicon.some(e => e.word === '階段'));
    learning.receive(session, '右上にあるもの', catalog); learning.receive(session, 'うん', catalog);
    assert.equal(session.turn, 0);
    assert.equal(learning.receive(session, '階段わかる？', catalog).reply.message, 'dungeonReferenceKnown');
    assert.equal(session.turn, 0);
    assert.equal(learning.receive(session, '敵を避けて', catalog).reply.message, 'dungeonConfirmAvoid');
    learning.receive(session, '距離を取ることだよ', catalog);
    assert.equal(session.turn, 0);
    assert.equal(state.dungeonLearning.lexicon.find(e => e.meaning === 'avoid').confirmationKind, 'meaning_explanation');
    learning.receive(session, '敵から離れて', catalog);
    assert.equal(session.last.reason, 'avoid');
    assert.deepEqual(state.dungeonLearning.inputs.slice(0, originals.length), originals);
});

test('existence reports and cumulative descriptions compose with new labels without guessing their category', () => {
    for (const raw of ['右にアオがいるのでよけて', '右にはミドリがいるから離れて', '上にピカがあるので避けてね']) {
        const state = core.create({}, catalog), session = learning.create(state);
        learning.receive(session, raw, catalog);
        const source = session.pending.sourceInputId, label = session.pending.word;
        learning.receive(session, raw.startsWith('上') ? '右' : '赤いもの', catalog);
        assert.equal(session.pending.sourceInputId, source);
        assert(session.proposal);
        learning.receive(session, label, catalog);
        assert(state.dungeonLearning.lexicon.some(e => e.word === label));
        assert.equal(learning.warned(session), false); assert.equal(session.turn, 0);
    }
});

test('all locales preserve ambiguous direction replies, combine another clue and answer learned-name questions', () => {
    const variants = {
        ja: ['右', '赤い', 'ナナ', 'ナナわかる？', '避けて', '距離を取ること', 'ナナを避けて'],
        en: ['right', 'red', 'Nana', 'Do you know Nana?', 'stay away', 'keep your distance', 'avoid Nana'],
        'zh-CN': ['右', '红色', '娜娜', '你知道娜娜吗？', '避开它', '保持距离', '避开娜娜'],
        ru: ['справа', 'красный', 'Нана', 'ты знаешь Нана?', 'отойди', 'держать дистанцию', 'избегай Нана'],
        'es-ES': ['derecha', 'roja', 'Nana', '¿conoces Nana?', 'aléjate', 'mantener la distancia', 'evita Nana'],
        'pt-BR': ['direita', 'vermelha', 'Nana', 'você conhece Nana?', 'afaste-se', 'manter distância', 'evite Nana'],
        de: ['rechts', 'rote', 'Nana', 'kennst du Nana?', 'geh weg', 'Abstand halten', 'meide Nana']
    };
    for (const [locale, [right, red, label, question, avoid, definition, command]] of Object.entries(variants)) {
        const state = core.create({}, catalog), session = learning.create(state);
        learning.receive(session, avoid, catalog, locale);
        assert.equal(session.pending.word, '', locale);
        learning.receive(session, right, catalog, locale);
        assert.equal(session.proposal, null, locale);
        learning.receive(session, red, catalog, locale);
        assert.equal(session.proposal, learning.objects[0].id, locale);
        learning.receive(session, label, catalog, locale);
        assert(state.dungeonLearning.lexicon.some(e => e.word === label), locale);
        assert.equal(learning.receive(session, question, catalog, locale).reply.message, 'dungeonReferenceKnown', locale);
        learning.receive(session, command, catalog, locale);
        learning.receive(session, definition, catalog, locale);
        assert.equal(session.turn, 0, locale);
        learning.receive(session, command, catalog, locale);
        assert.equal(session.last.reason, 'avoid', locale);
        assert.equal(state.dungeonLearning.warnings.length, 0, locale);
    }
});

test('contradictory or unknown clarification never silently discards a clue or confirms a proposal', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    learning.receive(session, '階段に行って', catalog);
    const source = session.pending.sourceInputId;
    learning.receive(session, '右', catalog); learning.receive(session, '左', catalog);
    assert.equal(session.proposal, null); assert.deepEqual(session.pending.selectors, ['right', 'left']);
    learning.receive(session, 'まだうまく説明できない', catalog);
    assert.equal(session.pending.sourceInputId, source); assert.equal(session.proposal, null);
    learning.receive(session, 'はい', catalog);
    assert.equal(state.dungeonLearning.lexicon.length, 0);
    learning.receive(session, '違う', catalog); learning.receive(session, '上にあるもの', catalog);
    assert.equal(session.proposal, learning.objects[1].id);
    learning.receive(session, 'おはよう', catalog); learning.receive(session, 'はい', catalog);
    assert.equal(session.pending, null); assert.equal(state.dungeonLearning.lexicon.length, 0);
    assert.equal(session.turn, 0);
});

test('definition answers do not replace missing relations, cross locales, or accept contradictory explanations', () => {
    for (const [foundation, life] of [[false, true], [true, false], [true, true]]) {
        const state = core.create({ foundation, life }, catalog), session = learning.create(state);
        learning.perceive(session, learning.objects[0].id);
        learning.receive(session, '避けて', catalog);
        const snapshot = structuredClone(state.knowledge);
        learning.receive(session, '近づかずに離れることだけど近づく', catalog);
        assert.equal(state.dungeonLearning.lexicon.length, 0);
        learning.receive(session, 'keep your distance', catalog, 'en');
        assert.equal(state.dungeonLearning.lexicon.length, 0);
        learning.receive(session, '避けて', catalog);
        learning.receive(session, '近づかずに離れること', catalog);
        assert.equal(state.dungeonLearning.lexicon.some(e => e.meaning === 'avoid'), foundation && life);
        assert.deepEqual(state.knowledge, snapshot); assert.equal(session.turn, 0);
    }
});

test('left, upper and lower descriptions are relative to the current actor in every language', () => {
    const variants = {
        ja: ['左', '上', '下', '赤い'], en: ['left', 'above', 'below', 'red'], 'zh-CN': ['左', '上', '下', '红色'],
        ru: ['слева', 'вверху', 'внизу', 'красный'], 'es-ES': ['izquierda', 'arriba', 'abajo', 'roja'],
        'pt-BR': ['esquerda', 'alto', 'baixo', 'vermelha'], de: ['links', 'oben', 'unten', 'rote']
    };
    for (const [locale, [left, upper, lower, red]] of Object.entries(variants)) {
        for (const [word, position, expected] of [[left, { x: 8, y: 3 }, learning.objects[0].id],
            [upper, { x: 5, y: 3 }, learning.objects[1].id], [lower, { x: 5, y: 1 }, learning.objects[0].id]]) {
            const state = core.create({}, catalog), session = learning.create(state);
            session.position = position;
            learning.receive(session, learning.forms[locale].go[0], catalog, locale);
            learning.receive(session, word, catalog, locale);
            if (word === left) learning.receive(session, red, catalog, locale);
            assert.equal(session.proposal, expected, locale + ':' + word);
            assert.equal(state.dungeonLearning.lexicon.length, 0);
            learning.receive(session, answer[locale], catalog, locale);
            assert(state.dungeonLearning.lexicon.some(e => e.meaning === 'selector'), locale);
            assert.equal(session.turn, 0);
        }
    }
});

function teachIslandWalk(state, world, raw = 'それが歩くことだよ', locale = 'ja') {
    worldApi.approach(world, 'path'); worldApi.tick(world, .1);
    core.perceive(state, worldApi.perception(world));
    const result = core.receive(state, raw, catalog, { locale, at: 500 });
    worldApi.respond(world, result, state, catalog);
    assert(result.lifeLearning, raw);
    let arrival;
    for (let i = 0; i < 500 && !arrival; i++) {
        const event = worldApi.tick(world, .1);
        if (event) { worldApi.onArrival(world, state, event); if (event.kind === 'arrive') arrival = event; }
    }
    assert(arrival?.walkingExperience, raw);
    return { result, arrival };
}

test('walking is acquired from a spoken label and an actual completed displacement in all eight starts', () => {
    for (const foundation of [false, true]) for (const life of [false, true]) for (const speech of ['short', 'gesture']) {
        const state = core.create({ foundation, life, speech }, catalog), world = worldApi.create();
        const relations = structuredClone(state.knowledge.relations);
        const { result, arrival } = teachIslandWalk(state, world);
        const meaning = state.knowledge.meanings.find(e => e.id === 'walk');
        assert.equal(meaning.source, life ? 'initial' : 'experienced_life');
        assert.equal(result.understandings[0].complete, false);
        assert.deepEqual(state.knowledge.relations, relations);
        assert.equal(state.experiences[0].activity, 'walk');
        assert.equal(state.experiences[0].lifeLabels[0].raw, result.input.raw);
        assert(lifeLearning.valid(state, world));
        assert(storage.valid({ version: 1, appearance: 'seed', state, world }));
        const before = structuredClone(state);
        worldApi.onArrival(world, state, arrival); lifeLearning.learn(state, arrival.walkingExperience.id);
        assert.deepEqual(state, before);
        const request = core.receive(state, '散歩しよう', catalog);
        assert.equal(request.understandings[0].complete, foundation);
    }
});

test('all seven locales can explain observed walking without learning from a question, negation or idle naming', () => {
    const labels = { ja: 'その動きが歩いているということだよ', en: 'You are walking', 'zh-CN': '这就是走路',
        ru: 'Это ходьба', 'es-ES': 'Estás caminando', 'pt-BR': 'Você está caminhando', de: 'Das ist gehen' };
    for (const [locale, raw] of Object.entries(labels)) {
        const state = core.create({ foundation: true, life: false }, catalog), world = worldApi.create();
        teachIslandWalk(state, world, raw, locale);
        assert(state.knowledge.meanings.some(e => e.id === 'walk'), locale);
    }
    for (const raw of ['それが歩くことだよ？', 'それは歩くことではない', 'もし歩くなら休む', '私は歩いている', 'それが歩くことだよ、それから食べて']) {
        const state = core.create({ life: false }, catalog), world = worldApi.create();
        worldApi.approach(world, 'path');
        const result = core.receive(state, raw, catalog);
        worldApi.respond(world, result, state, catalog);
        assert(!result.lifeLabel.includes('walk'), raw); assert.equal(world.lifeLabels.length, 0, raw);
    }
    const state = core.create({ life: false }, catalog), world = worldApi.create();
    const result = core.receive(state, 'それが歩くことだよ', catalog);
    worldApi.respond(world, result, state, catalog);
    assert(!result.lifeLearning); assert.equal(state.knowledge.meanings.length, 0);
});

test('pending walking teaching survives a validated save but interruption or no movement cannot teach', () => {
    const state = core.create({ life: false }, catalog), world = worldApi.create();
    worldApi.approach(world, 'path'); worldApi.tick(world, .1);
    const result = core.receive(state, '歩く', catalog); worldApi.respond(world, result, state, catalog);
    assert.equal(state.knowledge.meanings.length, 0);
    const saved = { version: 1, appearance: 'seed', state: structuredClone(state), world: structuredClone(world) };
    assert(storage.valid(saved));
    const fs = require('node:fs'), path = require('node:path');
    const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'word-walking-save-'));
    const store = storage.createStore(directory);
    assert.equal(store.save(saved).ok, true);
    assert.equal(store.load().ok, true);
    const resumed = structuredClone(saved);
    for (let i = 0; i < 500; i++) { const event = worldApi.tick(resumed.world, .1); if (event) worldApi.onArrival(resumed.world, resumed.state, event); }
    assert(resumed.state.knowledge.meanings.some(e => e.id === 'walk'));
    assert(storage.valid(resumed));
    const altered = structuredClone(saved); altered.world.lifeLabels[0].before.x = NaN;
    assert.equal(storage.valid(altered), false);
    worldApi.approach(world, 'shade');
    for (let i = 0; i < 1000; i++) { const event = worldApi.tick(world, .1); if (event) worldApi.onArrival(world, state, event); }
    assert(!state.knowledge.meanings.some(e => e.id === 'walk'));
    const frozen = structuredClone(saved.world);
    assert.equal(worldApi.tick(frozen, 10, true), null); assert.deepEqual(frozen, saved.world);
    lifeLearning.cancelWalking(saved.world);
    assert.equal(saved.world.lifeLabels.length, 0);
    const stationary = worldApi.create(); stationary.x = worldApi.PLACES[2].x; stationary.y = worldApi.PLACES[2].y;
    worldApi.approach(stationary, 'path');
    const idleState = core.create({ life: false }, catalog);
    worldApi.respond(stationary, core.receive(idleState, '歩く', catalog), idleState, catalog);
    const event = worldApi.tick(stationary, .1); worldApi.onArrival(stationary, idleState, event);
    assert.equal(event.walkingExperience, undefined); assert.equal(idleState.knowledge.meanings.length, 0);
    for (let i = 0; i < 500; i++) { const event = worldApi.tick(saved.world, .1); if (event) worldApi.onArrival(saved.world, saved.state, event); }
    assert(!saved.state.knowledge.meanings.some(e => e.id === 'walk'));
});

test('a dungeon step can ground walking once, preserving the unknown input and actual action source', () => {
    const state = core.create({ foundation: true, life: false, speech: 'gesture' }, catalog), world = worldApi.create();
    const session = learning.create(state, world);
    const unknown = learning.receive(session, '階段まで動いて', catalog);
    const original = structuredClone(unknown.result);
    assert.equal(unknown.reply.message, 'walkingNeedExperience');
    learning.advance(session);
    const action = structuredClone(session.last);
    const lesson = learning.receive(session, '今の動きが歩くことだよ', catalog);
    assert.equal(lesson.reply.message, 'walkingLearned');
    assert.equal(session.turn, 1); assert.deepEqual(unknown.result, original);
    assert.deepEqual(state.experiences[0].walking.action, action);
    assert(state.knowledge.meanings.some(e => e.id === 'walk' && e.source === 'experienced_life'));
    assert(lifeLearning.valid(state, world));
    assert(storage.valid({ version: 1, appearance: 'robot', state, world }));
    const originalState = structuredClone(state);
    const repeat = learning.receive(session, '今の動きが歩くことだよ', catalog);
    assert.equal(repeat.reply.message, 'walkingNeedExperience');
    assert.deepEqual(state.experiences, originalState.experiences);
    const broken = structuredClone({ state, world }); broken.state.dungeonLearning.actions[0].after.x++;
    assert.equal(lifeLearning.valid(broken.state, broken.world), false);
});

test('an old or interrupted dungeon action cannot supply a new walking lesson', () => {
    for (const interrupt of ['message', 'scene', 'no-displacement']) {
        const state = core.create({ life: false }, catalog), world = worldApi.create();
        let session = learning.create(state, world);
        learning.advance(session);
        if (interrupt === 'message') learning.receive(session, 'おはよう', catalog);
        else if (interrupt === 'scene') session = learning.create(state, world);
        else { session.position = { ...learning.objects[1] }; learning.advance(session, learning.objects[1].id); }
        assert.equal(learning.receive(session, 'それが歩くことだよ', catalog).reply.message, 'walkingNeedExperience');
        assert(!state.knowledge.meanings.some(e => e.id === 'walk'));
    }
});

test('island walking knowledge enables composed dungeon commands and a retained goal reaches the stairs', () => {
    for (const raw of ['階段まで動いて', '階段に移動して', '階段へ歩いていって', '階段まで進んでください']) {
        const state = core.create({ life: false }, catalog), world = worldApi.create();
        teachIslandWalk(state, world);
        const records = structuredClone(state.records), session = learning.create(state, world);
        learning.receive(session, '階段わかる？', catalog); learning.receive(session, '右上', catalog);
        learning.receive(session, 'それであっているよ', catalog);
        assert(state.dungeonLearning.lexicon.some(e => e.word === '階段'));
        const question = learning.receive(session, raw, catalog);
        assert.equal(question.reply.message, 'dungeonConfirmGo', raw);
        learning.receive(session, 'うん', catalog); assert.equal(session.turn, 0);
        learning.receive(session, raw, catalog);
        assert(session.goal, raw);
        for (let i = 0; i < 20 && session.goal; i++) learning.advance(session, session.goal.requested, session.goal.inputId);
        assert.equal(session.complete, true, raw); assert.equal(session.goal, null);
        assert.deepEqual(state.records.slice(0, records.length), records);
        assert.equal(state.dungeonLearning.warnings.length, 0);
    }
});

test('dungeon walking knowledge works back on the island without supplying request relations or a warning', () => {
    for (const foundation of [false, true]) {
        const state = core.create({ foundation, life: false }, catalog), world = worldApi.create();
        const session = learning.create(state, world);
        learning.advance(session); learning.receive(session, '歩く', catalog);
        assert(state.knowledge.meanings.some(e => e.id === 'walk'));
        core.perceive(state, worldApi.perception(world));
        const result = core.receive(state, '散歩しよう', catalog);
        assert.equal(result.understandings[0].complete, foundation);
        assert.equal(state.dungeonLearning.warnings.length, 0);
        assert.equal(state.knowledge.meanings.length, 1);
    }
});

test('a new input stops an old goal and a warning changes an approach without continuing that goal', () => {
    const state = core.create({}, catalog), session = learning.create(state);
    learning.receive(session, '階段わかる？', catalog); learning.receive(session, '右上', catalog); learning.receive(session, 'うん', catalog);
    learning.receive(session, '階段まで動いて', catalog); learning.receive(session, 'うん', catalog);
    learning.receive(session, '階段まで動いて', catalog);
    assert(session.goal);
    learning.receive(session, '階段わかる？', catalog);
    assert.equal(session.goal, null);
    learning.perceive(session, learning.objects[0].id);
    teach(session, 'これは危ない');
    learning.receive(session, 'そこへ行って', catalog);
    assert.equal(session.last.reason, 'diverged'); assert.equal(session.goal, null);
    const idleState = core.create({ life: false }, catalog), world = worldApi.create();
    worldApi.approach(world, 'path'); world.pause = 1;
    const result = core.receive(idleState, 'それが歩くことだよ', catalog);
    worldApi.respond(world, result, idleState, catalog);
    assert(!result.lifeLearning);
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
