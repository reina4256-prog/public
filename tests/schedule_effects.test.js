const assert = require('node:assert/strict');
const C = require('../schedule_core');
require('../resident_core');
const start = new Date(2026, 8, 14, 12).getTime();
const actor = () => ({ personId: 'hero', energy: 100, hunger: 100, age: 60, lifespan: 100,
    stats: { intel: 10, power: 10, speed: 10, beauty: 10, mood: 100 }, inventory: [],
    activeBooks: [{ id: 'book1', stat: 'intel', val: 3, charges: 2 }],
    buffs: { focus: 3 }, apprentice: { isExcommunicated: true, exileTrainingCount: 9,
        excommunicatedFrom: 'pharmacist', attempts: {}, activeQuests: [{ masterType: 'pharmacist', desc: '\u96c6\u4e2d\u85ac', qVal: 0 }] } });
const context = { efficiency: () => 1, trait: () => ({}), items: a => a.inventory };
const whole = actor(), sliced = actor();
const q1 = [{ type: 'study', duration: 10 }], q2 = C.clone(q1);
C.simulateActor(whole, C.empty(), start, start + 10000, context, [], q1);
for (let at = start; at < start + 10000; at += 50) C.simulateActor(sliced, C.empty(), at, at + 50, context, [], q2);
for (const key of ['intel', 'mood']) assert(Math.abs(whole.stats[key] - sliced.stats[key]) < 1e-8);
assert.equal(whole.stats.intel, 14.5);
assert.equal(whole.energy, 99, 'ordinary 50ms needs drain converted to seconds');
assert.equal(whole.buffs.focus, 2, 'buff charged only once');
assert.equal(whole.activeBooks[0].charges, 1);
assert.equal(whole.apprentice.activeQuests[0].qVal, 1);
assert.equal(whole.apprentice.isExcommunicated, false);
assert.equal(whole.apprentice.attempts.pharmacist, 3);
const resumed = C.clone(whole);
C.simulateActor(resumed, C.empty(), start + 10000, start + 20000, context, [], []);
assert.equal(resumed.activeBooks[0].charges, 1, 'completed action cannot consume again after reload');
const ordinary = actor();
C.startBuffs(ordinary); C.completeFocusedStudy(ordinary); C.completeBooks(ordinary); C.completeExile(ordinary, 'study');
assert.deepEqual(ordinary.apprentice, whole.apprentice, 'ordinary and scheduled completion use same person effects');
const sleeping = actor(); sleeping.activeBooks = [];
const sleeps = [{ type: 'sleep', duration: 1 }, { type: 'sleep', duration: 1 }];
C.simulateActor(sleeping, C.empty(), start, start + 2000, context, [], sleeps);
assert.equal(sleeping.consecutiveSleepCount, 2);
assert(Math.abs(sleeping.stats.beauty - 14.2) < 1e-8);
const failure = actor(); failure.energy = 5;
C.simulateActor(failure, C.empty(), start, start + 10000, context, [], [{ type: 'study', duration: 10 }]);
assert.equal(failure.activeBooks[0].charges, 2, 'failed action cannot earn completion effects');
assert.equal(failure.buffs.focus, 3, 'failed start does not spend buffs');
const unfinished = actor();
C.simulateActor(unfinished, C.empty(), start, start + 5000, context, [], [{ type: 'study', duration: 10 }]);
assert.equal(unfinished.activeBooks[0].charges, 2, 'partial task does not earn completion effects');
const p = C.empty(); p.enabled = true;
p.days = p.days.map(() => [{ start: 720, end: 721, action: 'study' }]);
const original = actor(), before = C.clone(original);
C.forecast(original, p, context, start);
assert.deepEqual(original, before, 'forecast isolates personal completion and buff changes');
const storage = new Map(); let failMirror = true;
storage.set('ai_legacy_data', JSON.stringify({ books: [{ id: 'book1', charges: 2 }, { id: 'unrelated', charges: 10 }] }));
const store = { getItem: k => storage.get(k) || null, setItem(k, v) {
    if (k === 'ai_legacy_data' && failMirror) { failMirror = false; throw Error('mirror failure'); }
    storage.set(k, v);
} };
C.completeBooks(whole);
const originalError = console.error; console.error = () => {};
try { globalThis.Residents.saveWorld(whole, {}, store); } finally { console.error = originalError; }
assert(JSON.parse(storage.get('ai_pet_data_v1')).residentWorldCommit, 'failed legacy mirror remains recoverable');
globalThis.Residents.recoverStorage(store);
assert.deepEqual(JSON.parse(storage.get('ai_legacy_data')).books, [{ id: 'unrelated', charges: 10 }]);
assert.equal(JSON.parse(storage.get('ai_pet_data_v1')).activeBooks.length, 0);
console.log('Schedule effects: ordinary parity, split/reload, resources, buffs, quests, sleep, books, forecast and mirror recovery passed.');
const fs = require('node:fs'), vm = require('node:vm');
const normalFood = fs.readFileSync('ai_core.js', 'utf8').split('aiPet.consumeFood = function() {')[1].split('\naiPet.isPointOnWater')[0];
const eater = actor(); eater.hunger = 30; eater.conditions = {}; eater.schedule = [{ targetItem: 'fish_test' }];
eater.inventory = ['fish_test', 'carrot']; eater.getAmuletPlus = () => -1; eater.getTraitData = () => ({});
const sandbox = { aiPet: eater, window: { ScheduleCore: C, isCatchingUp: true }, Math: Object.create(Math),
    itemCatalog: { fish_test: { type: 'ingredient', name: 'Fish', stats: { hunger: 20 } }, carrot: { type: 'ingredient', name: 'Carrot' } } };
sandbox.Math.random = () => 0;
vm.runInNewContext('aiPet.consumeFood = function() {' + normalFood, sandbox);
eater.consumeFood();
assert.equal(eater.conditions.stomachache, true, 'raw fish risk uses the consumed item, not the following inventory slot');
assert.deepEqual(eater.inventory, ['carrot']);
const scheduledMeal = actor(); scheduledMeal.hunger = 30; scheduledMeal.conditions = {};
C.consumeSelected(scheduledMeal, sandbox.itemCatalog.fish_test, 'fish_test', {}, -1, () => 0);
assert.equal(scheduledMeal.hunger, eater.hunger);
assert.equal(scheduledMeal.stats.mood, eater.stats.mood);
assert.deepEqual(scheduledMeal.conditions, eater.conditions);
console.log('Schedule food: real ordinary consumption and shared raw-fish nutrition/risk parity passed.');
