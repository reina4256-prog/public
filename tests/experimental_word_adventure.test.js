'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../experimental_word_adventure');
function gather(a, type, place) {
    const objectId = 'test-material:' + a.serial;
    assert.equal(api.discover(a, type, place, objectId), true);
    return api.collect(a, type, place, objectId);
}
function qualified() {
    const a = api.create();
    for (const kind of ['survey', 'deliver', 'preparation', 'field_return']) {
        const e = api.event(a, kind); assert.equal(api.certify(a, e.id), true);
    }
    for (const type of ['wood', 'wood', 'wood', 'wood', 'stone', 'stone']) {
        const i = gather(a, type, type === 'wood' ? 'forest' : 'mountain');
        assert.ok(i); assert.equal(api.deliver(a, i.id, 'bridge'), true);
    }
    assert.ok(api.craft(a, 'bridge')); return a;
}
function explore() {
    const a = qualified(); a.training.completed = true;
    assert.equal(api.enter(a, 'skull'), true); return a;
}
test('picking requires a real item on the current floor underfoot, never a carried item',()=>{
    const a=qualified(),wood=gather(a,'wood','forest');api.deliver(a,wood.id,'bag');api.craft(a,'bag');api.craft(a,'cloth');
    const cloth=a.items.find(i=>i.type==='cloth');a.training.completed=true;api.enter(a,'skull');
    const body={fatigue:0,hunger:0},serial=a.serial;
    assert.equal(api.step(a,body,'pick',cloth.id),null);
    assert.equal(a.serial,serial);assert.equal(cloth.location,'hand');assert.equal(body.fatigue,0);
    api.rescue(a,'injury');api.enter(a,'skull');
    assert.equal(api.step(a,body,'pick',cloth.id),null,'a distant floor item is not picked remotely');
    a.run.position={...cloth.position};
    assert.equal(api.step(a,body,'pick',cloth.id).kind,'action');assert.equal(cloth.location,'hand');
    assert.equal(a.events.filter(e=>e.kind==='action' && e.action==='pick').length,1);
});
test('bridge may precede mastery, consumes delivered materials once and never grants words', () => {
    const a = qualified();
    assert.equal(api.craft(a, 'bridge'), null);
    assert.equal(a.items.filter(i => i.location === 'consumed').length, 6);
    assert.deepEqual(a.teachings, []);
    assert.equal(api.valid(a), true);
    const b = api.create();
    for (const type of ['wood', 'wood', 'wood', 'wood', 'stone', 'stone']) {
        const material = gather(b, type, type === 'wood' ? 'forest' : 'mountain'); api.deliver(b, material.id, 'bridge');
    }
    assert.ok(api.craft(b, 'bridge')); assert.equal(b.mastery.stage, 0);
    assert.equal(api.enter(b, 'skull'), false);
    assert.equal(api.certify(b, api.event(b, 'deliver').id), false);
});
test('capacity belongs to a worn bag and locations transfer atomically', () => {
    const a = api.create();
    const wood = gather(a, 'wood', 'forest');
    assert.ok(wood); assert.equal(gather(a, 'stone', 'mountain'), null);
    api.deliver(a, wood.id, 'bag'); assert.ok(api.craft(a, 'bag'));
    assert.equal(api.capacity(a), 6);
    for (let n = 0; n < 3; n++) assert.ok(gather(a, 'wood', 'forest'));
    assert.equal(api.used(a), 6);
    const hand = gather(a, 'stone', 'mountain'); assert.equal(hand.location, 'hand');
    assert.equal(api.transfer(a, hand.id, 'bag'), false);
    assert.equal(api.transfer(a, hand.id, 'home'), false);
    assert.equal(api.valid(a), true);
});
test('attacks prepare before hitting, evasion avoids a prepared strike, damage differs from fatigue', () => {
    const a = explore(), w = { hunger: .2, fatigue: .1 };
    a.run.position = { x: 3, y: 3 }; a.run.enemy.x = 4;
    api.step(a, w, 'observe'); assert.equal(a.run.enemy.phase, 'ready'); assert.equal(a.damage, 0);
    api.step(a, w, 'avoid'); assert.equal(a.damage, 0); assert.equal(w.fatigue, .10600000000000001);
    a.run.position = { x: a.run.enemy.x - 1, y: a.run.enemy.y };
    api.step(a, w, 'observe'); api.step(a, w, 'observe');
    assert.equal(a.damage, 1); assert.ok(w.fatigue < .2);
});
test('weapon changes actual hit count without granting understanding', () => {
    const a = explore(), w = { hunger: .1, fatigue: .1 };
    const source = api.event(a, 'craft', { project: 'stick' });
    a.items.push({ id: 'item:weapon', source: source.id, type: 'stick', location: 'hand' });
    a.run.position = { x: a.run.enemy.x - 1, y: a.run.enemy.y };
    api.step(a, w, 'attack'); assert.equal(a.run.enemy.defeated, false);
    api.step(a, w, 'attack'); assert.equal(a.run.enemy.defeated, true);
    assert.deepEqual(a.teachings, []);
    const unknown = api.recordLesson(a, 'use', source.id, 'player:1', 'tool', 'en'); assert.equal(unknown, null);
    const b = explore(), body = { fatigue: .1, hunger: .1 };
    b.run.position = { x: b.run.enemy.x - 1, y: b.run.enemy.y };
    api.step(b, body, 'attack'); api.step(b, body, 'attack'); assert.equal(b.run.enemy.defeated, false);
    api.step(b, body, 'attack'); assert.equal(b.run.enemy.defeated, true);
});
test('rescue retains multiple floor recoveries, protects home, and does not refund carried items', () => {
    const a = explore(); a.building.home = true;
    const source = api.event(a, 'craft', { project: 'stick' });
    const homeSource = api.event(a, 'craft', { project: 'cloth' });
    a.items.push({ id: 'item:carried', type: 'stick', source: source.id, location: 'hand' },
        { id: 'item:home', type: 'cloth', source: homeSource.id, location: 'home' });
    api.rescue(a, 'injury'); assert.equal(a.items.find(i => i.id === 'item:carried').location, 'floor');
    assert.equal(a.items.find(i => i.id === 'item:home').location, 'home');
    assert.equal(api.enter(a, 'skull'), true);
    assert.deepEqual(a.items.find(i => i.id === 'item:carried').position, { x: 2, y: 1 });
    assert.equal(api.transfer(a, 'item:carried', 'hand'), false);
    a.run.position = { x: 2, y: 1 }; assert.equal(api.transfer(a, 'item:carried', 'hand'), true);
    api.rescue(a, 'exhaustion'); assert.equal(a.recoveries.length, 2);
    assert.equal(a.items.find(i => i.id === 'item:carried').location, 'floor'); assert.equal(api.valid(a), true);
});
test('island care requires a meal then a completed rest and cannot replay one source', () => {
    const a = api.create(); a.damage = 2;
    assert.equal(api.care(a, { id: 1, kind: 'experience', activity: 'rest', start: 0, end: 3 }), false);
    api.care(a, { id: 2, kind: 'experience', activity: 'eat', start: 1, end: 3 });
    assert.equal(api.care(a, { id: 3, kind: 'experience', activity: 'rest', start: 4, end: 4 }), false);
    assert.equal(api.care(a, { id: 4, kind: 'experience', activity: 'rest', start: 4, end: 9 }), true);
    assert.equal(a.damage, 1);
    assert.equal(api.care(a, { id: 4, kind: 'experience', activity: 'rest', start: 4, end: 9 }), false);
});
test('one material object cannot supply two items or be silently replenished', () => {
    const a = api.create();
    assert.equal(api.collect(a, 'wood', 'forest'), null);
    assert.equal(api.discover(a, 'wood', 'forest', 'branch:1'), true);
    const i = api.collect(a, 'wood', 'forest', 'branch:1'); assert.ok(i);
    api.deliver(a, i.id, 'bridge');
    assert.equal(api.collect(a, 'wood', 'forest', 'branch:1'), null);
    assert.equal(api.discover(a, 'wood', 'forest', 'branch:1'), false);
    const saved = JSON.parse(JSON.stringify(a)); assert.equal(api.valid(saved), true);
    assert.equal(api.collect(saved, 'wood', 'forest', 'branch:1'), null);
});
test('training review requires actual actions and never converts known words into completion', () => {
    const a = qualified(), w = { fatigue: .1, hunger: .2 };
    api.enter(a, 'crystal'); assert.equal(a.run.training, true);
    assert.equal(api.reviewTraining(a), false);
    api.step(a, w, 'observe'); assert.equal(api.reviewTraining(a), false);
    api.step(a, w, 'walk'); assert.equal(api.reviewTraining(a), true);
    assert.equal(api.reviewTraining(a), false); assert.equal(a.training.completed, false);
    assert.equal(api.valid(a), true);
});
test('malformed optional state fails validation without throwing', () => {
    for (const value of [null, {}, { ...api.create(), items: [null] }, { ...api.create(), sources: [null] }, { ...api.create(), events: [null] }])
        assert.equal(api.valid(value), false);
    assert.equal(api.valid(undefined), true);
});
test('training loans leave personal possessions intact and are returned instead of becoming rewards', () => {
    const a = qualified(), w = { hunger: .2, fatigue: .1 };
    const wood = gather(a, 'wood', 'forest'); api.deliver(a, wood.id, 'bag'); api.craft(a, 'bag');
    const personal = api.carried(a).map(i => ({ id: i.id, location: i.location }));
    api.enter(a, 'skull');
    assert.equal(a.items.filter(i => i.location === 'training_hold').length, personal.length);
    assert.equal(api.step(a, w, 'up').reason, 'walked_out');
    assert.equal(a.run, null); assert.equal(a.training.completed, false);
    for (const original of personal) assert.equal(a.items.find(i => i.id === original.id).location, original.location);
    assert.ok(a.items.filter(i => i.loan).every(i => i.location === 'returned'));
    assert.equal(api.valid(a), true);
});
test('armor permits five actual strikes, and rescue keeps injury separate from body exhaustion', () => {
    const a = explore(), w = { hunger: .1, fatigue: .1 };
    const source = api.event(a, 'craft', { project: 'shield' });
    a.items.push({ id: 'item:armor', source: source.id, type: 'shield', location: 'body' });
    assert.equal(api.limit(a), 5);
    a.run.position = { x: a.run.enemy.x - 1, y: a.run.enemy.y };
    for (let hit = 1; hit <= 5; hit++) {
        api.step(a, w, 'observe'); api.step(a, w, 'observe');
        assert.equal(a.damage, hit);
        if (hit < 5) assert.ok(a.run);
    }
    assert.equal(a.run, null); assert.equal(a.events.at(-1).reason, 'injury'); assert.equal(w.fatigue, .1);
    const b = explore(), exhausted = { fatigue: 1, hunger: .2 };
    api.step(b, exhausted, 'walk'); assert.equal(b.run, null); assert.equal(b.damage, 0);
    assert.equal(b.events.at(-1).reason, 'exhaustion');
});
test('returning walks to the staircase and respects movement cost instead of teleporting', () => {
    const a = explore(), w = { hunger: .1, fatigue: .1 };
    a.run.position = { x: 2, y: 1 };
    const step = api.step(a, w, 'return'); assert.deepEqual(step.after, { x: 1, y: 1 });
    assert.ok(a.run); assert.equal(w.fatigue, .10300000000000001); assert.equal(w.hunger, .10200000000000001);
    assert.deepEqual(api.decide(a, w), { action: 'up' });
    api.step(a, w, 'up'); assert.equal(a.run, null); assert.equal(a.events.at(-1).reason, 'walked_out');
});
test('saved current floor keeps preparation, damage, items and experiences without offline turns', () => {
    const a = explore(), w = { hunger: .2, fatigue: .1 };
    api.step(a, w, 'observe'); const saved = JSON.parse(JSON.stringify(a));
    assert.equal(api.valid(saved), true); assert.deepEqual(saved, a);
    const invalid = structuredClone(saved); invalid.items.push({ id: 'bad', type: 'cloth', location: 'hand', source: -1 });
    assert.equal(api.valid(invalid), false);
});
test('stairs retain visited enemies within one expedition, including after serialization', () => {
    const a = explore(), w = { hunger: .1, fatigue: .1 };
    a.run.enemy.defeated = true; a.run.enemy.hits = 3;
    a.run.position = { ...a.run.exit };
    api.step(a, w, 'down'); assert.equal(a.run.floor, 2);
    const saved = JSON.parse(JSON.stringify(a)); assert.equal(api.valid(saved), true);
    api.step(saved, w, 'up'); assert.equal(saved.run.floor, 1);
    assert.equal(saved.run.enemy.defeated, true); assert.equal(saved.run.enemy.hits, 3);
    assert.deepEqual(saved.run.position, saved.run.exit);
    saved.run.rooms[2].enemy = null; assert.equal(api.valid(saved), false);
});
test('physical state and teaching evidence do not replace or grant the child common knowledge', () => {
    const state = { knowledge: { meanings: [{ id: 'walk', source: 'experienced_life' }], relations: [], associations: [] },
        notes: [{ original: 'retained' }], records: [{ original: 'retained' }] };
    const original = JSON.stringify(state), common = state.knowledge;
    const a = api.ensure(state);
    const action = api.event(a, 'action', { action: 'attack' });
    assert.ok(api.recordLesson(a, 'attack', action.id, 'player:1', 'attack', 'en'));
    assert.equal(a.teachings.length, 1); assert.equal(api.recordLesson(a, 'attack', action.id, 'player:1', 'attack', 'en'), null);
    assert.equal(state.knowledge, common);
    const retained = { ...state }; delete retained.adventure; assert.equal(JSON.stringify(retained), original);
});
