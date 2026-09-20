const assert = require('node:assert/strict');
require('../resident_core.js');
const R = globalThis.Residents;
const copy = value => JSON.parse(JSON.stringify(value));
function hero(generation = 1) {
    return { generation, currentSkin: 'robot', name: '<player name>', gold: 100,
        inventory: [{ id: 'fish', quality: 3, freshnessStartedAt: 123, count: 2 }],
        stats: { power: 30 }, apprentice: { rank: { cooking: 10 }, learnedWords: ['cook'], inventory: ['supply'] } };
}
const original = hero();
const map = { hut: { type: 'hut', storage: { safe: { gold: 450 } } } };
R.ensure(original, map);
const saved = JSON.stringify(original);
const mapSaved = JSON.stringify(map);
R.ensure(original, map);
assert.equal(JSON.stringify(original), saved, 'migration is idempotent');
assert.equal(JSON.stringify(map), mapSaved);
const loaded = JSON.parse(saved);
R.ensure(loaded);
assert.equal(loaded.personId, original.personId);
assert.equal(Object.keys(loaded.residentState.people).length, 0, 'do not fabricate historical residents');
assert.equal(R.owner(original, { kind: 'building', id: map.hut.instanceId }, map).data.safe.gold, 450);
assert.equal(R.owner(original, { kind: 'island', id: original.residentState.islandId }, map).data, map);
assert.throws(() => R.owner(original, { kind: 'person', id: '__proto__' }), /unknown_owner/);
for (const inventory of [false, true]) for (const gold of [false, true]) for (const keepMap of [false, true]) {
    const next = R.prepareSuccession(original, hero(2), { inventory, gold, map: keepMap }, 'succession:1');
    const resident = next.residentState.people[original.personId];
    assert.notEqual(next.personId, original.personId);
    assert.equal(resident.status, 'waiting');
    assert.equal(resident.profile.name, '<player name>');
    assert.equal(resident.profile.apprentice.rank.cooking, 10);
    assert.equal(resident.profile.apprentice.inventory, undefined);
    assert.equal(resident.possessions.gold + next.gold, 100);
    assert.equal(resident.possessions.inventory.length + next.inventory.length, 1);
    assert.deepEqual((inventory ? next.inventory : resident.possessions.inventory)[0], original.inventory[0]);
    assert.equal(next.residentState.islandId === original.residentState.islandId, keepMap);
    assert.equal(JSON.stringify(original), saved, 'preparing must not mutate input');
    assert.equal(JSON.stringify(map), mapSaved, 'personal preparation must not consume building assets');
    assert.throws(() => R.prepareSuccession(next, hero(3), {}, 'succession:1'), /already_committed/);
}
const next = R.prepareSuccession(original, hero(2), { inventory: false, gold: false, map: true }, 'succession:1');
const third = R.prepareSuccession(next, hero(3), { map: false }, 'succession:2');
assert.equal(Object.keys(third.residentState.people).length, 2, 'same skin is two people');
assert.equal(third.residentState.people[original.personId].possessions.gold, 100);
const beforeFailure = JSON.stringify(next);
assert.throws(() => R.transferGold(next, original.personId, next.personId, 25, 'gift:1', {
    setItem() { throw Error('quota'); }
}), /quota/);
assert.equal(JSON.stringify(next), beforeFailure, 'failed save leaves both owners unchanged');
let persisted;
const storage = { setItem(key, value) { assert.equal(key, 'ai_pet_data_v1'); persisted = value; } };
assert.equal(R.transferGold(next, original.personId, next.personId, 25, 'gift:1', storage), true);
assert.equal(next.gold, 25);
assert.equal(next.residentState.people[original.personId].possessions.gold, 75);
const reload = JSON.parse(persisted);
assert.equal(R.transferGold(reload, original.personId, reload.personId, 25, 'gift:1', storage), false);
assert.throws(() => R.transferGold(reload, original.personId, reload.personId, 26, 'gift:1', storage), /transaction_conflict/);
assert.throws(() => R.transferGold(reload, original.personId, reload.personId, 999, 'gift:2', storage), /insufficient_gold/);
const future = copy(original); future.residentState.version = 999;
assert.throws(() => R.ensure(future), /unsupported_version/);
assert.equal(future.residentState.version, 999);
const duplicate = copy(original);
duplicate.residentState.generationPeople['2'] = duplicate.personId;
assert.throws(() => R.ensure(duplicate), /duplicate_generation_person/);
console.log('Resident foundation: migration, identities, 8 ownership combinations, save failure and replay passed.');
