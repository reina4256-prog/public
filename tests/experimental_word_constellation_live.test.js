'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { project, arrange, camera, capture } = require('../experimental_word_constellation_live');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
const { innerVoice } = require('../experimental_word_constellation_live');

test('inner voice uses actual understanding without promoting tentative learning or later knowledge', () => {
    const state = core.create({ foundation: false, life: false }, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    const result = core.receive(state, 'その木の実が気になる？', catalog, { locale: 'ja' });
    const original = JSON.stringify(result), initialVoice = innerVoice(result);
    assert.match(initialVoice, /言葉の意味はまだつかめない/);
    assert.doesNotMatch(initialVoice, /木の実.*分かる/);
    state.knowledge.meanings.push({ id: 'berry', source: 'initial' });
    const before = JSON.stringify(state);
    assert.equal(innerVoice(result), initialVoice);
    assert.equal(JSON.stringify(result), original); assert.equal(JSON.stringify(state), before);
});

test('inner voice distinguishes meanings, missing relations, adopted targets and unprocessed clauses', () => {
    const state = core.create({ foundation: true, life: true }, catalog);
    const understood = core.receive(state, '休んで', catalog, { locale: 'ja' });
    assert.equal(understood.understandings[0].complete, true);
    assert.match(innerVoice(understood), /休む.*意味は分かる/);
    assert.doesNotMatch(innerVoice(understood), /休んだ|休みます/);
    const result = { understandings: [
        { known: { meaning: 'rest' }, relations: [], unresolved: [{ type: 'relation', id: 'negation' }], complete: false,
            target: { candidates: [{ word: 'unselected' }], adopted: { id: 'berry:1', word: '<原名>' } } },
        { known: { meaning: 'eat' }, unresolved: [{ type: 'processing_limit' }], complete: false }
    ] };
    const text = innerVoice(result);
    assert.match(text, /否定.*まだ分からない/); assert.match(text, /<原名>/);
    assert.doesNotMatch(text, /unselected|食べる|この話は読み取れた/);
    assert.match(text, /2つめ/); assert.match(text, /余裕がない/);
    const translated = innerVoice(result, value => value.replace('休む', 'rest'));
    assert.match(translated, /rest/); assert.match(translated, /<原名>/);
    const unusual = innerVoice({ understandings: [{ known: { meaning: 'constructor' }, relations: ['toString'],
        unresolved: [{ type: 'meaning', token: '__proto__' }], complete: false }] });
    assert.match(unusual, /__proto__/); assert.doesNotMatch(unusual, /function|native code|object Object/);
});
test('initial foundations appear without fabricated teaching or semantic links', () => {
    const state = core.create({}, catalog), before = JSON.stringify(state);
    const graph = project(state, catalog);
    assert.equal(graph.nodes.length, state.knowledge.meanings.length + state.knowledge.relations.length);
    assert.ok(graph.nodes.every(n => n.source === 'initial' && n.refs.length === 0));
    assert.deepEqual(graph.edges, []); assert.equal(JSON.stringify(state), before);
});
test('unknown text stays unknown when viewed after later learning', () => {
    const state = core.create({ foundation: false, life: false }, catalog);
    const result = core.receive(state, '木の実がある', catalog);
    assert.equal(project(state, catalog, [result]).nodes.length, 0);
    state.knowledge.meanings.push({ id: 'berry', source: 'initial' });
    const before = JSON.stringify(state), graph = project(state, catalog, [result]);
    assert.equal(graph.unknown[0].raw, '木の実がある');
    assert.equal(graph.records['input/input:1'].value.understandings[0].complete, false);
    assert.deepEqual(graph.edges, []); assert.equal(JSON.stringify(state), before);
});
test('real name teaching links the name, object and original input without merging objects', () => {
    const state = core.create({}, catalog);
    for (const [id, word] of [['berry:1', 'Rinka'], ['berry:2', 'Another']]) {
        core.perceive(state, { scene: 'clearing', attention: [{ id, meaning: 'berry' }] });
        core.receive(state, `これは${word}だよ`, catalog);
    }
    const before = JSON.stringify(state), graph = project(state, catalog);
    assert.equal(graph.nodes.filter(n => n.kind === 'name').length, 2);
    assert.equal(graph.nodes.filter(n => n.kind === 'object').length, 2);
    assert.ok(graph.nodes.find(n => n.label === 'Rinka').refs.includes('input/input:1'));
    assert.ok(graph.edges.some(e => e.from === 'name/0' && e.to === 'target/berry:1'));
    graph.records['input/input:1'].value.raw = 'changed view';
    assert.equal(JSON.stringify(state), before);
});
test('scoped relations remain separate, missing evidence is not synthesized', () => {
    const state = core.create({ foundation: false, life: false }, catalog);
    state.knowledge.relations = ['one','two'].map(form => ({ id: 'request', source: 'experienced_relation', scope: { form }, evidence: ['input:99'] }));
    const graph = project(state, catalog);
    assert.equal(graph.nodes.length, 2); assert.notEqual(graph.nodes[0].id, graph.nodes[1].id);
    assert.deepEqual(graph.edges, []); assert.deepEqual(graph.records, {});
});
test('walking evidence connects to the original label and real experience', () => {
    const state = core.create({ life: false }, catalog);
    state.records.push({ id: 'input:1', raw: 'walk label', understandings: [] });
    state.experiences = [{ id: 1, activity: 'walk', lifeLabels: [{ raw: 'walk label' }] }];
    state.knowledge.meanings.push({ id: 'walk', source: 'experienced_life', evidence: [{ experienceId: 1, inputId: 'input:1', scope: { label: 'walk label' } }] });
    const graph = project(state, catalog), walk = graph.nodes.find(n => n.label === '歩く');
    assert.deepEqual(walk.refs.sort(), ['experience/1', 'input/input:1']);
    assert.equal(graph.edges.filter(e => e.from === walk.id).length, 2);
});
test('historical paths keep the original partial understanding after later learning', () => {
    const state = core.create({ foundation: false, life: false }, catalog);
    const before = project(state, catalog), result = core.receive(state, '木の実がある', catalog);
    const snapshot = JSON.stringify({ state, result });
    const trace = capture(before, project(state, catalog, [result]), result, { message: 'attend' }, 'original gesture');
    assert.equal(trace.complete, false); assert.deepEqual(trace.understood, []);
    assert.equal(trace.text, 'original gesture'); assert.equal(JSON.stringify({ state, result }), snapshot);
    state.knowledge.meanings.push({ id: 'berry', source: 'initial' });
    assert.equal(trace.graph.nodes.length, 0); assert.ok(trace.missing.length);
    result.understandings[0].complete = true;
    assert.equal(trace.complete, false);
});
test('understanding references select exactly the applicable scope and preserve missing originals', () => {
    const state = core.create({ foundation: false, life: false }, catalog);
    const entries = ['one', 'two'].map(form => ({ id: 'question', source: 'experienced_relation', scope: { form }, evidence: ['input:99'] }));
    state.knowledge.relations = entries;
    const graph = project(state, catalog);
    const result = { input: { id: 'input:1', raw: 'question', locale: 'en' }, understandings: [{ known: {}, relations: ['question'], relationReferences: [entries[0]], complete: true }] };
    const trace = capture(graph, graph, result, {}, 'reply');
    assert.deepEqual(trace.understood, [graph.nodes[0].id]);
    assert.deepEqual(trace.refs, ['input/input:99']);
    assert.equal(trace.graph.records['input/input:99'], undefined);
});
test('ambiguous real naming retains candidates without inventing a selected reply probability', () => {
    const state = core.create({}, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }, { id: 'berry:2', meaning: 'berry' }] });
    const before = project(state, catalog), result = core.receive(state, 'これはRinkaだよ', catalog);
    const trace = capture(before, project(state, catalog, [result]), result, { message: 'which_name' }, 'which?');
    assert.equal(trace.candidates.length, 4); // target candidates and learning candidates are both actual result data
    assert.ok(trace.candidates.every(c => !c.selected));
    assert.deepEqual(trace.fresh, ['name/0', 'name/1']); // actual tentative links remain visible, without a selected candidate
    assert.equal(JSON.stringify(trace).includes('probability'), false);
});
test('initial use is not new learning and does not claim unrelated earlier uses as reply evidence', () => {
    const state = core.create({}, catalog), before = project(state, catalog);
    const result = core.receive(state, '木の実がある', catalog);
    const trace = capture(before, project(state, catalog, [result]), result, { message: 'heard_berry' }, 'heard');
    assert.ok(trace.understood.length); assert.deepEqual(trace.fresh, []); assert.deepEqual(trace.replyRefs, []);
    assert.deepEqual(trace.refs, []);
});
test('reply grounding uses the matching actual output, never a stale conversation focus', () => {
    const state = core.create({}, catalog), before = project(state, catalog);
    const result = core.receive(state, '今何してるの？', catalog);
    const focus = { inputId: result.input.id, topic: 'rest', requiredMeanings: ['rest'], response: { message: 'resting' }, evidence: { experienceId: null, activity: { mode: 'rest', target: 'shade' } } };
    const trace = capture(before, project(state, catalog, [result]), result, { message: 'resting' }, 'resting', focus);
    assert.ok(trace.outputNodes.some(id => id.startsWith('meaning/rest/')));
    assert.deepEqual(trace.situation, { mode: 'rest', target: 'shade' });
    const stale = capture(before, before, result, { message: 'attend' }, 'gesture', focus);
    assert.deepEqual(stale.outputNodes, []); assert.equal(stale.situation, null);
    const experienced = capture(before, before, result, { message: 'rest_helped', experienceId: 99 }, 'rest helped');
    assert.deepEqual(experienced.replyRefs, ['experience/99']); assert.equal(experienced.graph.records['experience/99'], undefined);
});
test('candidate selection compares all recorded fields rather than missing common fields', () => {
    const state = core.create({}, catalog), graph = project(state, catalog);
    const result = { input: { id: 'input:1', raw: 'teaching', locale: 'en' }, understandings: [],
        feelingLearning: { candidates: [{ type: 'meaning', id: 'happy' }, { type: 'meaning', id: 'sad' }], adopted: { type: 'meaning', id: 'sad' } } };
    const trace = capture(graph, graph, result, { message: 'attend', experienceId: null }, 'gesture');
    assert.deepEqual(trace.candidates.map(c => c.selected), [false, true]); assert.deepEqual(trace.replyRefs, []);
    assert.deepEqual(trace.candidates.map(c => c.label), ['うれしい', '悲しい']);
});
test('an initial use is labeled as a record rather than a fabricated teaching event', () => {
    const state = core.create({}, catalog), result = core.receive(state, '木の実がある', catalog);
    const graph = project(state, catalog, [result]);
    assert.ok(graph.nodes.filter(n => n.kind === 'record').every(n => n.label === '当時の記録'));
    assert.ok(graph.edges.every(e => e.kind === 'use'));
});
test('an existing tentative name gains a real evidence connection without creating a duplicate star', () => {
    const state = core.create({}, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    core.receive(state, 'Rinka', catalog);
    const before = project(state, catalog), result = core.receive(state, 'これはRinkaだよ', catalog);
    const after = project(state, catalog, [result]);
    const trace = capture(before, after, result, { message: 'name_echo', word: 'Rinka' }, 'Rinka');
    assert.ok(before.nodes.find(n => n.id === 'name/0').candidate);
    assert.equal(after.nodes.filter(n => n.kind === 'name').length, 1);
    assert.equal(after.nodes.find(n => n.id === 'name/0').candidate, false);
    assert.ok(trace.fresh.includes('name/0'));
});
test('topology and xyz layout are independent of camera and filtering, and preserve graph data', () => {
    const state = core.create({}, catalog);
    core.perceive(state, { scene: 'clearing', attention: [{ id: 'berry:1', meaning: 'berry' }] });
    core.receive(state, 'これはRinkaだよ', catalog);
    const graph = project(state, catalog), original = JSON.stringify(graph), points = arrange(graph);
    assert.deepEqual(points, arrange({ ...graph, nodes: [...graph.nodes].reverse() }));
    const flat = camera(points), depth = camera(points, { depth: true, yaw: .5 });
    assert.ok(Object.values(points).every(p => ['x','y','z'].every(axis => Number.isFinite(p[axis]))));
    assert.notDeepEqual(flat.points, depth.points); assert.equal(JSON.stringify(graph), original);
    assert.ok(flat.width >= 620 && flat.height >= 340);
    assert.deepEqual(camera({}).points, {});
});
test('initial knowledge accumulates completed experiences without claiming new learning', () => {
    const state = core.create({}, catalog);
    state.experiences = [{ id: 1, activity: 'rest', before: { fatigue: .5 }, after: { fatigue: .1 } }];
    const original = JSON.stringify(state), graph = project(state, catalog);
    const rest = graph.nodes.find(n => n.kind === 'meaning' && n.semanticId === 'rest');
    assert.equal(rest.source, 'initial'); assert.deepEqual(rest.refs, ['experience/1']);
    assert.ok(graph.edges.some(e => e.from === rest.id && e.to === 'experience/1' && e.kind === 'use'));
    assert.equal(JSON.stringify(state), original);
    const learned = core.create({ life: false }, catalog);
    learned.experiences = state.experiences;
    learned.knowledge.meanings.push({ id: 'rest', source: 'experienced_life', evidence: [] });
    assert.deepEqual(project(learned, catalog).edges, []); // no retroactive link to an unrelated old experience
});
test('real life teaching string candidates retain their meaning and actual adoption', () => {
    const worldApi = require('../experimental_word_learning_world');
    const state = core.create({ life: false }, catalog), world = worldApi.create();
    Object.assign(world, { mode: 'eat', attention: 'berry:1', elapsed: 1, activityStart: 0,
        activityBefore: { hunger: .7, fatigue: .2 }, mealTaste: { quality: 'sweet', pleasant: true } });
    const before = project(state, catalog), result = core.receive(state, '「食べる」', catalog);
    const reply = worldApi.respond(world, result, state, catalog);
    assert.deepEqual(result.lifeLearning.candidates, ['eat']);
    const trace = capture(before, project(state, catalog, [result]), result, reply, 'actual received label');
    assert.ok(trace.candidates.some(c => c.label === '食べる' && c.selected));
});
