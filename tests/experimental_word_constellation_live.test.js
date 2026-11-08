'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { project } = require('../experimental_word_constellation_live');
const core = require('../experimental_word_learning_core');
const catalog = require('../experimental_word_learning_catalog.json');
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
