const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../schedule_core');
require('../resident_core');
const storageMap = new Map();
let failKey = null;
const storage = {
    getItem: key => storageMap.get(key) ?? null,
    setItem: (key, value) => { if (key === failKey) { failKey = null; throw Error('disk full'); } storageMap.set(key, String(value)); },
    removeItem: key => storageMap.delete(key), key: index => [...storageMap.keys()][index],
    get length() { return storageMap.size; }
};
const context = { window: { GameRelease: { edition: 'demo', online: false }, ScheduleCore: C, Residents: globalThis.Residents, addEventListener() {} },
    localStorage: storage, console, Date, TextEncoder, TextDecoder, crypto: require('node:crypto').webcrypto,
    document: { hidden: false, addEventListener() {} }, assets: {}, itemCatalog: {} };
vm.createContext(context);
for (const file of ['demo_core.js', 'demo_save_core.js', 'schedule_runtime.js']) vm.runInContext(fs.readFileSync(file, 'utf8'), context);
const rules = context.window.DemoRules, saves = context.window.DemoSave;
const facilityMap = { pharmacy_1: { type: 'pharmacy', dx: 10 }, hut_1: { type: 'hut' } };
rules.hideFacilities(facilityMap, true);
assert.equal(facilityMap.pharmacy_1, undefined);
assert.equal(JSON.parse(storage.getItem('demo_full_facilities_v1')).pharmacy_1.dx, 10);
const frozen = { stats: { intel: 10 }, age: 25, lifespan: 100,
    inventory: [{ id: 'fish', freshnessStartedAt: 1000 }], timeProgress: { checkpoint: 1000 }, schedule: [] };
context.window.aiPet = frozen;
context.assets = { sharedActor: frozen };
context.window.ScheduleRuntime.settle(86401000);
assert.equal(frozen.age, 25, 'demo offline time must not age the hero');
assert.equal(frozen.inventory[0].freshnessStartedAt, 86401000, 'demo offline freshness clock must freeze');
assert.equal(frozen.timeProgress.report, null, 'demo must not produce an offline report');
context.assets = {};
const hero = { stats: { intel: 149, power: 149, beauty: 149, speed: 149, mood: 200 }, age: 1, lifespan: 100, generation: 1 };
rules.bindStats(hero);
hero.isSick = true; hero.conditions.cold = true; hero.conditions = { stomachache: true, poisoning: true };
assert.equal(hero.isSick, false);
assert.equal(hero.conditions.stomachache, false);
assert.equal(hero.conditions.poisoning, false);
for (const key of ['intel', 'power', 'beauty', 'speed']) { hero.stats[key] += 20; assert.equal(hero.stats[key], 150); }
assert.equal(hero.stats.mood, 200);
hero.stats = { intel: 500, mood: 80 }; assert.equal(hero.stats.intel, 150);
assert.equal(JSON.parse(JSON.stringify(hero)).stats.intel, 150);
for (const career of ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building']) {
    assert.equal(rules.questBlocked(career, 8), false);
    assert.equal(rules.questBlocked(career, 9), true);
}
assert.equal(rules.maxSkipRank(10), 8);
const start = new Date(2026, 8, 21).getTime();
const actor = { personId: 'hero', generation: 1, currentSkin: 'robot', age: 1, lifespan: 100, energy: 100, hunger: 100,
    stats: { intel: 149, power: 10, beauty: 10, speed: 10 }, inventory: [], schedule: [], lastSaveTime: start };
context.window.aiPet = actor;
globalThis.Residents.ensure(actor, {});
actor.routine = C.empty(); actor.routine.enabled = true;
actor.routine.days = actor.routine.days.map(() => [{ start: 0, end: 1440, action: 'study', destination: 'current' }]);
context.window.ScheduleRuntime.simulate(actor, {}, start, start + 60000, true);
assert.equal(actor.stats.intel, 150, 'offline growth must stop at cap inside simulation');
actor.age = 99; actor.lifeAgeTimer = 86380;
context.window.ScheduleRuntime.simulate(actor, {}, start + 60000, start + 86400000, true);
assert.equal(actor.demoProgress.ended, true);
assert.equal(actor.age, 100);
const firstEnd = actor.demoProgress.endedAt;
rules.markEnded(actor, start + 172800000);
assert.equal(actor.demoProgress.endedAt, firstEnd, 'end marker is idempotent');

function bundle(ended = false) {
    return { format: 'aipet-demo', version: 1, exportedAt: start, data: {
        ai_pet_data_v1: JSON.stringify({ age: ended ? 100 : 10, lifespan: 100, generation: 1, stats: { intel: 150 }, bgmVolume: .2,
            inventory: [{ id: 'food', freshnessStartedAt: start - 1000 }], demoProgress: ended ? { version: 1, ended: true } : undefined }),
        map_data_v6: '{}', demo_full_facilities_v1: '{"pharmacy_1":{"type":"pharmacy","dx":10}}', tcg_data_v1: '{"myCollection":[]}', game_tutorial_archive_v1: '{"entries":{}}'
    } };
}
storage.setItem('ai_pet_language', 'de'); storage.setItem('my_player_id', 'full-account');
const living = saves.importData(storage, bundle(), start + 86400000);
assert.equal(JSON.parse(storage.getItem('map_data_v6')).pharmacy_1.type, 'pharmacy');
assert.equal(living.age, 10);
assert.equal(living.inventory[0].freshnessStartedAt, start + 86400000 - 1000);
assert.equal(living.timeProgress.checkpoint, start + 86400000);
assert.equal(living.bgmVolume, undefined);
assert.equal(storage.getItem('ai_pet_language'), 'de');
assert.equal(storage.getItem('my_player_id'), 'full-account');
const existing = storage.getItem('ai_pet_data_v1');
assert.throws(() => saves.importData(storage, bundle(true)), /full_save_exists/);
assert.equal(storage.getItem('ai_pet_data_v1'), existing);
storage.removeItem('ai_pet_data_v1');
const ended = saves.importData(storage, bundle(true), start + 86400000);
assert.equal(ended.isReincarnating, true);
storage.removeItem('ai_pet_data_v1');
const invalid = bundle(); invalid.data.my_player_id = 'injected';
assert.throws(() => saves.importData(storage, invalid), /invalid_demo_key/);
const badVersion = bundle(); badVersion.version = 2;
assert.throws(() => saves.importData(storage, badVersion), /invalid_demo_file/);
failKey = 'map_data_v6';
assert.throws(() => saves.importData(storage, bundle()), /disk full/);
assert.equal(storage.getItem('ai_pet_data_v1'), null, 'failed import rolls back');
assert.equal(storage.getItem('demo_import_rollback_v1'), null);
assert.equal(storage.getItem('ai_pet_language'), 'de');

const full = { window: { GameRelease: { edition: 'full', online: false } } };
vm.runInNewContext(fs.readFileSync('demo_core.js', 'utf8'), full);
const fullHero = { stats: { intel: 999 } };
full.window.DemoRules.bindStats(fullHero);
assert.equal(fullHero.stats.intel, 999);
assert.equal(full.window.DemoRules.questBlocked('explore', 9), false);
assert.equal(full.window.DemoRules.maxSkipRank(10), 10);
(async () => {
    const source = bundle();
    const bytes = await saves.encrypt(source);
    assert(!Buffer.from(bytes).includes(Buffer.from('ai_pet_data_v1')), 'export exposes plaintext');
    assert.equal(JSON.stringify(await saves.decrypt(bytes)), JSON.stringify(source));
    const different = await saves.encrypt(source);
    assert.notDeepEqual(Buffer.from(bytes), Buffer.from(different), 'each export needs a random nonce');
    const corrupted = Uint8Array.from(bytes); corrupted[corrupted.length - 1] ^= 1;
    await assert.rejects(saves.decrypt(corrupted));
    await assert.rejects(saves.decrypt(new TextEncoder().encode(JSON.stringify(source))));
    console.log('Demo caps, frozen absence, health, careers, encrypted transfer and rollback passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
