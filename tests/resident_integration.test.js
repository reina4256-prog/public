const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
require('../resident_core.js');
const R = globalThis.Residents;
const clone = x => JSON.parse(JSON.stringify(x));
function storage() {
    const data = new Map(); return { data, getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
const hero = () => ({ generation: 1, name: '<Alice>', currentSkin: 'robot', baseType: 'robot', gold: 4000,
    inventory: [{ id: 'wood', freshnessStartedAt: 25 }], stats: { intel: 20, power: 30, beauty: 40, speed: 50 },
    apprentice: { rank: { cooking: 10 }, retired: { cooking: true }, learnedWords: ['hello'] }, getMaxVocabulary: () => 17 });
const hut = (x = 0) => ({ type: 'hut', dx: x, dy: 50, sw: 50, sh: 50,
    storage: { warehouse: { items: [{ id: 'stone' }] }, freezer: { items: [{ id: 'fish', frozenAt: 100 }] }, safe: { gold: 900 } } });
const source = fs.readFileSync('ai_core.js', 'utf8');
const finalBody = source.slice(source.indexOf('window.executeReincarnationFinal = function'), source.indexOf('window.toggleInheritance = function'));
const applyBody = source.slice(source.indexOf('const _legacy_originalApplyInitialPet'), source.indexOf('// ★ 余生システムの補助関数群'));
for (const inventory of [false, true]) for (const gold of [false, true]) for (const map of [false, true]) {
    const store = storage(), world = { first: hut(), second: hut(200) }, pet = hero();
    world.second.storage.safe.gold = 9999;
    R.ensure(pet, world); const previousId = pet.personId;
    const context = { console, localStorage: store, assets: world, inheritanceSelections: { inventory, gold, map, vocab: true },
        currentInheritanceCosts: { inventory: 300, gold: 500, map: 300, vocab: 400 },
        document: { getElementById: () => ({ style: {} }) }, startPersonalityTest() {},
        generateNatureMap: () => ({}), saveGameData: () => R.saveWorld(context.window.aiPet, world, store) };
    context.window = { aiPet: pet, Residents: R, ResidentUI: { notify: message => { throw Error(message); } },
        resumeInventoryItemFreshness: item => ({ ...item, frozenAt: null }),
        applyInitialPet() { Object.assign(context.window.aiPet, { inventory: [], gold: 0, stats: { intel: 10, power: 10, beauty: 10, speed: 10 }, apprentice: {} }); } };
    vm.createContext(context); vm.runInContext(finalBody, context); vm.runInContext(applyBody, context);
    context.window.executeReincarnationFinal();
    const cost = 400 + (inventory ? 300 : 0) + (gold ? 500 : 0) + (map ? 300 : 0);
    assert.equal(pet.generation, 2);
    assert.equal(Object.keys(pet.residentState.people).length, 1);
    assert.equal(pet.residentState.people[previousId].profile.name, '<Alice>');
    assert.equal(pet.residentState.people[previousId].possessions.gold, gold ? 0 : 4000 - cost);
    const once = JSON.stringify(pet); context.window.executeReincarnationFinal(); assert.equal(JSON.stringify(pet), once);
    // Reload during the personality selection, then finish the real application wrapper.
    R.recoverStorage(store); context.window.aiPet = JSON.parse(store.getItem('ai_pet_data_v1'));
    context.window.pendingInheritanceData = context.window.aiPet.pendingInheritanceData;
    if (!inventory && !gold && !map) {
        const pendingBefore = JSON.stringify(context.window.aiPet);
        const goodWrite = store.setItem;
        store.setItem = () => { throw Error('quota'); };
        let notified = false;
        context.window.ResidentUI.notify = () => { notified = true; };
        context.window.applyInitialPet('robot');
        assert(notified);
        assert.equal(JSON.stringify(context.window.aiPet), pendingBefore, 'failed completion remains resumable');
        store.setItem = goodWrite;
    }
    context.window.applyInitialPet('robot');
    const successor = context.window.aiPet;
    assert.equal(successor.pendingInheritanceData, undefined);
    assert.equal(successor.apprentice.baseVocab, 17);
    assert.equal(successor.inventory.length, inventory ? (map ? 1 : 3) : 0);
    assert.equal(successor.gold, gold ? 4000 - cost + (map ? 0 : 900) : 0);
    assert.equal(Object.keys(world).length, map ? 2 : 0);
    assert.equal(Object.keys(successor.residentState.people).length, 1);
}
const store = storage(), first = hero(), world = { first: hut(), second: hut(200), third: hut(350) };
R.ensure(first, world);
const next = R.prepareSuccession(first, { generation: 2 }, { map: true }, 'first');
R.assignHome(next, world, first.personId, world.second.instanceId, 3, store);
assert.equal(next.residentState.homes[world.second.instanceId].slots[3], first.personId);
R.assignHome(next, world, first.personId, world.third.instanceId, 1, store);
assert.equal(next.residentState.homes[world.second.instanceId].slots[3], null);
const oldHomeId = world.first.instanceId; delete world.first;
R.ensure(next, world);
assert.equal(R.homeAsset(next, world), null, 'do not repurpose an inhabited hut');
assert.equal(next.residentState.people[first.personId].home.buildingId, world.third.instanceId);
world.fourth = hut(500); R.ensure(next, world);
assert.equal(R.homeAsset(next, world).instanceId, world.fourth.instanceId);
assert.notEqual(world.fourth.instanceId, oldHomeId);
delete world.third; R.ensure(next, world);
assert.equal(next.residentState.people[first.personId].status, 'waiting');
assert.equal(next.residentState.people[first.personId].possessions.gold, 4000);
const before = JSON.stringify(next);
assert.throws(() => R.assignHome(next, world, first.personId, world.second.instanceId, 4, store), /invalid_home/);
assert.equal(JSON.stringify(next), before);
const broken = storage();
broken.setItem = (key, value) => { if (key === 'map_data_v6') throw Error('mirror'); broken.data.set(key, value); };
R.saveWorld(next, world, broken, { books: [], monuments: [] });
assert(JSON.parse(broken.getItem('ai_pet_data_v1')).residentWorldCommit);
broken.setItem = (key, value) => broken.data.set(key, value);
R.recoverStorage(broken);
assert(!JSON.parse(broken.getItem('ai_pet_data_v1')).residentWorldCommit);
assert.deepEqual(JSON.parse(broken.getItem('map_data_v6')), world);
assert.deepEqual(JSON.parse(broken.getItem('ai_legacy_data')), { books: [], monuments: [] });
const restart = R.newGameArchive(next);
assert.equal(restart.generation, 1);
assert.notEqual(restart.personId, first.personId);
assert.equal(restart.residentState.people[first.personId].possessions.gold, 4000);
assert.equal(restart.residentState.people[first.personId].status, 'waiting');
assert.equal(restart.residentState.people[first.personId].home, null);
R.ensure(restart, {});
console.log('Resident integration: real succession/reload x8, household roles, fixed slots and interrupted world commit passed.');
