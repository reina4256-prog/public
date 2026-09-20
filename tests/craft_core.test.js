const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Craft = require('../craft_core');
const C = require('../schedule_core');
const actor = (type = 'pharmacist', rank = 2) => ({
    personId: 'person:test', resident: true, energy: 100, hunger: 100, x: 0, y: 0,
    inventory: ['herb', { id: 'water', age: 0 }], skills: {},
    stats: { intel: 30, power: 10, speed: 10, beauty: 30, mood: 80 },
    apprentice: { rank: { [type]: rank }, activeQuests: [
        { masterType: type, rank, qVal: 0, desc: 'translated display text' },
        { masterType: 'other', rank: 2, qVal: 0, desc: '調合' }
    ] }
});
const success = { random: () => 0 };
const a = actor();
const work = Craft.start(a, 'mix', 'item_medicine_cold', success);
assert.equal(work.error, undefined); assert.equal(a.inventory.length, 0);
const saved = C.clone(work);
assert.equal(Craft.finish(a, 'mix', saved).itemId, 'item_medicine_cold');
assert.equal(a.apprentice.activeQuests[0].qVal, 1, 'Rank 2 succeeds without Japanese condition text');
assert.equal(a.apprentice.activeQuests[1].qVal, 0, 'other careers cannot gain progress');
assert.equal(a.skills.mixing, 1.5);
assert.equal(Craft.finish(a, 'mix', saved), null, 'serialized completed work cannot award twice');
assert.equal(a.inventory.length, 1);
const missing = actor(); missing.inventory = ['herb'];
assert.equal(Craft.start(missing, 'mix', 'item_medicine_cold', success).error, 'materials');
assert.deepEqual(missing.inventory, ['herb'], 'failed reservation must be atomic');
const locked = actor('pharmacist', 1);
assert.equal(Craft.start(locked, 'mix', 'item_medicine_cold', success).error, 'rank');
assert.equal(Craft.finish(locked, 'mix', Craft.start(locked, 'mix', null, success)).practice, true);
assert.equal(locked.apprentice.activeQuests[0].qVal, 0);
const failed = actor();
Craft.finish(failed, 'mix', Craft.start(failed, 'mix', null, { random: () => .999 }));
assert.deepEqual(failed.inventory, ['item_medicine_fail']);
assert.equal(failed.apprentice.activeQuests[0].qVal, 0);
const great = actor('pharmacist', 8);
Craft.finish(great, 'mix', Craft.start(great, 'mix', 'item_medicine_cold', success));
assert.deepEqual(great.inventory, ['elixir']);
const first = actor('tailor', 10);
first.inventory = ['colorful_cloth', 'sturdy_thread'];
const firstWork = Craft.start(first, 'tailor', 'brooch_teruteru', success);
assert.equal(firstWork.isGreatSuccess, false, 'first amulet cannot receive great-success enhancement');
Craft.finish(first, 'tailor', firstWork);
assert.equal(first.inventory[0].plus, 0);
first.inventory.push('colorful_cloth', 'sturdy_thread');
const upgrade = Craft.start(first, 'tailor', 'brooch_teruteru', success);
assert.equal(Craft.finish(first, 'tailor', upgrade).plus, 2);
assert.equal(first.inventory.length, 1);
const enhanced = actor('tailor', 10);
enhanced.inventory = [{ id: 'brooch_teruteru', plus: 30 }, 'colorful_cloth', 'sturdy_thread'];
assert.equal(Craft.start(enhanced, 'tailor', 'brooch_teruteru', success).successRate, 0);
const recraft = actor('tailor', 10);
recraft.inventory = [{ id: 'brooch_teruteru', plus: 30 }, 'colorful_cloth', 'sturdy_thread'];
recraft.apprentice.activeQuests.push({ isMasterSpecialQuest: true, eventType: 'tailor_recraft', targetId: 'brooch_teruteru' });
const newCopy = Craft.start(recraft, 'tailor', 'brooch_teruteru', success);
Craft.finish(recraft, 'tailor', newCopy);
assert.deepEqual(recraft.inventory.map(i => i.plus), [30, 0], 'recraft preserves owned enhancement');
// Exercise the actual ordinary adapters, including UI callbacks and quest count.
const source = fs.readFileSync('ai_core.js', 'utf8');
const pet = actor(); let special = 0;
const sandbox = { aiPet: pet, window: {
    CraftCore: { ...Craft, start: (a, t, target, opts) => Craft.start(a, t, target, { ...opts, ...success }) },
    recordMasterSpecialQuestProgress() { special++; }
}, itemCatalog: { item_medicine_cold: { name: '風邪薬' } } };
vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('aiPet.processMixingStart ='), source.indexOf('aiPet.processFishingFrame =')), sandbox);
const task = { craftTarget: 'item_medicine_cold' };
assert(pet.processMixingStart(task));
pet.processMixingFinish(task); pet.processMixingFinish(task);
assert.equal(pet.apprentice.activeQuests[0].qVal, 1); assert.equal(special, 1);
assert.equal(pet.message, '調合成功！ 風邪薬ができた！');
console.log('Craft rules: Rank 2, personal materials, failures, enhancements, serialized exact-once effects and ordinary adapters passed.');
