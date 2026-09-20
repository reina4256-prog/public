const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
require('../resident_core.js');
const R = globalThis.Residents;
const store = { getItem: () => null, setItem() {} };
const hero = { generation: 1, currentSkin: 'robot', gold: 100, inventory: [],
    isPointOnWater: () => false,
    setDestination(x, y) { this.pathQueue = [{ x, y }]; return true; } };
const map = { first: { type: 'hut', dx: 100, dy: 100, sw: 50, sh: 50 }, second: { type: 'hut', dx: 220, dy: 100, sw: 50, sh: 50 } };
R.ensure(hero, map);
const next = R.prepareSuccession(hero, { ...hero, generation: 2 }, { map: true }, 'movement:life');
next.isPointOnWater = hero.isPointOnWater; next.setDestination = hero.setDestination;
R.assignHome(next, map, hero.personId, map.second.instanceId, 2, store);
let paused = false;
const context = { console, assets: map, document: { hidden: false }, setInterval, clearInterval, setTimeout,
    window: { Residents: R, aiPet: next, GameShell: { isPaused: () => paused, currentScene: 'island' } } };
vm.createContext(context);
vm.runInContext(fs.readFileSync('myhome_map_core.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('resident_ui.js', 'utf8'), context);
const tick = context.window.ResidentUI.tick;
const resident = next.residentState.people[hero.personId];
let sawDeparture = false, sawIsland = false, returned = false, last;
for (let frame = 0; frame < 1400; frame++) {
    tick(50);
    if (resident.activity.phase === 'depart') sawDeparture = true;
    if (resident.location.kind === 'island') {
        sawIsland = true;
        if (last?.kind === 'island') assert(Math.hypot(resident.location.x - last.x, resident.location.y - last.y) <= 1.751);
    }
    if (sawIsland && resident.location.kind === 'home' && resident.activity.phase === 'rest') { returned = true; break; }
    last = { ...resident.location };
}
assert(sawDeparture && sawIsland && returned, 'walk from bed through entrance, around island and back');
assert.equal(resident.location.x, 6); assert.equal(resident.location.y, 1);
const frozen = JSON.stringify(resident); paused = true;
for (let i = 0; i < 100; i++) tick(50);
assert.equal(JSON.stringify(resident), frozen);
paused = false; context.document.hidden = true; tick(50000);
assert.equal(JSON.stringify(resident), frozen);
context.document.hidden = false;
resident.location = { kind: 'island', x: 410, y: 210 };
resident.activity = { phase: 'walk', elapsed: 6001, path: [] };
next.setDestination = () => false;
tick(50); tick(50);
assert.equal(resident.location.kind, 'island', 'unreachable home does not teleport');
assert.equal(resident.activity.phase, 'blocked');
R.assignHome(next, map, hero.personId, null, 0, store);
assert.equal(context.window.ResidentUI.actors().length, 0);
console.log('Resident movement: bed/door/walk/return, pause, hidden time, unreachable path and eviction passed.');

// Real destination, shrinking, collection commit, growth and return.
next.setDestination = hero.setDestination;
map.mountain_1 = { type: 'nature', dx: 260, dy: 100, sw: 50, sh: 50 };
R.ensure(next, map);
R.assignHome(next, map, hero.personId, map.second.instanceId, 2, store);
const worker = next.residentState.people[hero.personId];
worker.profile.apprentice = { rank: { explore: 10 } };
context.facilityData = { mountain: { items: { default: ['stone'] } } };
context.itemCatalog = { stone: { type: 'material' }, fish_sardine: { type: 'food' } };
context.seaFishingTable = { spring: [{ id: 'fish_sardine', prob: 100 }] };
context.window.Residents = R;
globalThis.localStorage = store;
let entered = false, hidden = false, emerged = false;
for (let frame = 0; frame < 2400; frame++) {
    tick(50);
    const actor = context.window.ResidentUI.actors().find(p => p.personId === worker.personId);
    if (worker.activity.phase === 'enter' && actor.visualScale < 1) entered = true;
    if (worker.activity.phase === 'work') { hidden = true; assert(!actor); }
    if (worker.activity.phase === 'exit' && actor.visualScale < 1) emerged = true;
    if (emerged && worker.location.kind === 'home') break;
}
assert(entered && hidden && emerged);
assert.equal(worker.possessions.inventory.filter(i => i === 'stone').length, 1);
assert.equal(next.inventory.length, 0, 'loot belongs only to the resident');
map.sea_1 = { type: 'sea', dx: 280, dy: 150, sw: 50, sh: 50 };
R.ensure(next, map);
worker.location = { kind: 'island', x: 280, y: 150 };
worker.activity = { phase: 'work', elapsed: 14950, path: [], targetId: map.sea_1.instanceId, facility: 'sea', job: 'fish' };
tick(50);
const fish = worker.possessions.inventory.find(item => item.id === 'fish_sardine');
assert(fish.freshnessStartedAt > 0);
tick(50);
assert.equal(worker.possessions.inventory.filter(item => item.id === 'fish_sardine').length, 1);
console.log('Resident gathering/fishing, ownership, freshness and entry/exit animation passed.');
worker.routine = { enabled: false };
worker.location = { kind: 'home', x: 5, y: 8 };
worker.activity = { phase: 'scheduled', elapsed: 10000, path: [] };
worker.routineState = { action: 'study', position: { ...worker.location } };
let resumedDeparture = false;
for (let i = 0; i < 700; i++) { tick(50); if (worker.location.kind === 'island') { resumedDeparture = true; break; } }
assert(resumedDeparture, 'disabled routine resumes ordinary activity without reassigning housing');
assert.equal(worker.routineState, undefined);
worker.location = { kind: 'island', x: 370, y: 220 };
worker.activity = { owner: 'routine', phase: 'work', job: 'gather', elapsed: 14999, path: [] };
worker.routineState = { action: 'gather' };
const beforeLoot = JSON.stringify(worker.possessions.inventory), beforePosition = { ...worker.location };
context.window.ResidentUI.releaseRoutine(worker);
assert.deepEqual(worker.location, beforePosition, 'release preserves current position');
tick(50);
assert.equal(JSON.stringify(worker.possessions.inventory), beforeLoot, 'abandoned routine work does not pay a normal-activity reward');
assert.equal(worker.activity.phase, 'return');
worker.activity = { owner: 'routine', phase: 'work', lockId: 'combat' };
context.window.ResidentUI.releaseRoutine(worker);
assert.equal(worker.activity.lockId, 'combat', 'independent activity lock is preserved');
console.log('Resident routine release: home departure, island return, no duplicate reward and independent lock passed.');
