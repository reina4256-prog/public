const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../schedule_core');
const Craft = require('../craft_core');
const start = new Date(2026, 8, 20, 12).getTime();
const hero = { personId: 'hero', age: 1, lifespan: 100, stats: {}, inventory: ['herb'], schedule: [],
    apprentice: { metMasters: ['pharmacist', 'tailor'] },
    getTraitData() { return {}; }, setDestination(x, y) { this.pathQueue = [{ x, y }]; return true; } };
const map = { pharmacy_1: { instanceId: 'pharmacy:1', dx: 350, dy: 10, sw: 0, sh: 0 },
    atelier_1: { instanceId: 'atelier:1', dx: 0, dy: 10, sw: 0, sh: 0 } };
const sandbox = { window: { ScheduleCore: C, CraftCore: Craft, aiPet: hero, addEventListener() {} }, assets: map,
    document: { addEventListener() {} },
    itemCatalog: { item_medicine_cold: { type: 'medicine' }, dye: { type: 'material' } } };
vm.createContext(sandbox); vm.runInContext(fs.readFileSync('schedule_runtime.js', 'utf8'), sandbox);
const R = sandbox.window.ScheduleRuntime;
const resident = () => ({ personId: 'resident:1', home: { buildingId: 'home:1', slot: 0 },
    location: { kind: 'island', x: 0, y: 0 },
    profile: { stats: { intel: 100, power: 10, speed: 10, beauty: 100, mood: 80 }, energy: 100, hunger: 100, skills: {},
        apprentice: { rank: { pharmacist: 2, tailor: 1 }, activeQuests: [{ masterType: 'pharmacist', rank: 2, qVal: 0 }] } },
    possessions: { inventory: ['herb', 'water', 'herb', 'water'], freezer: [], equipment: {} } });
const plan = C.empty(); plan.enabled = true;
plan.days = plan.days.map(() => [{ start: 720, end: 725, action: 'mix', destination: 'pharmacy:1', craftTarget: 'item_medicine_cold' }]);
const run = (a, from, to, events = [], ctx = R.context()) => C.simulateActor(a, plan, from, to, ctx, events);
const a = R.residentActor(resident()), b = R.residentActor(resident());
run(a, start, start + 5000);
assert.equal(a.inventory.length, 4, 'travel cannot consume materials early');
assert.equal(a.routineState.craft, undefined);
run(a, start + 5000, start + 20000);
assert.equal(a.inventory.length, 2); assert.equal(a.skills.mixing, undefined, 'no result before 30 seconds of work');
const resumed = C.clone(a);
run(resumed, start + 20000, start + 120000);
for (let t = start; t < start + 120000; t += 50) run(b, t, t + 50);
assert.deepEqual(resumed.inventory, b.inventory, 'live, away and reload retain the same result');
assert.deepEqual(resumed.skills, b.skills);
assert(Math.abs(resumed.energy - b.energy) < 1e-7);
assert.equal(resumed.inventory.length, 3, 'one unit per planned occurrence');
assert.equal(resumed.routineState.completed, true);
assert.deepEqual(hero.inventory, ['herb']);
const short = R.residentActor(resident()), events = [];
const shortPlan = C.clone(plan); shortPlan.days.forEach(day => day[0].end = 721);
const late = start + 45000;
C.simulateActor(short, shortPlan, late, start + 60000, R.context(), events);
assert.equal(short.skills.mixing, undefined, 'short interval cannot award partial work');
assert(events.some(e => e.status === 'work_short'));
const absent = R.residentActor(resident()); const original = C.clone(absent);
hero.apprentice.metMasters = [];
run(absent, start, start + 60000);
assert.equal(absent.routineState.failed, 'unavailable');
assert.deepEqual(absent.inventory, original.inventory, 'previous-generation qualification cannot reveal an unmet mentor');
hero.apprentice.metMasters = ['pharmacist', 'tailor'];
const preview = R.residentActor(resident()), before = C.clone(preview);
C.forecast(preview, plan, R.context(), start);
assert.deepEqual(C.clone(preview), before, 'forecast cannot consume live personal property');
const world = { ...C.clone(hero), residentState: { people: { 'resident:1': { ...resident(), routine: plan } } } };
R.simulate(world, map, start, start + 60000, true);
assert(world.residentState.people['resident:1'].profile.skills.mixing > 1, 'runtime writes personal skill growth');
assert.equal(world.inventory.length, 1);
const here = R.residentActor(resident()); here.x = here.location.x = 350;
run(here, start, start + 31600);
assert.equal(here.inventory.length, 3, 'already at the building still reserves and completes one recipe');
const blockedHero = { ...hero, setDestination() { this.pathQueue = [{ x: 100, y: 0 }]; return true; } };
const unreachable = R.residentActor(resident());
run(unreachable, start, start + 60000, [], R.context(map, blockedHero));
assert.equal(unreachable.routineState.failed, 'route_missing', 'a partial shore path is not arrival at the building');
assert.equal(unreachable.inventory.length, 4);
const manual = { type: 'study', duration: 60 };
const failingHero = { ...hero, schedule: [manual], setDestination() {
    if (this.schedule[0]) this.schedule[0].aborted = true;
    return false;
} };
const routeFailed = R.residentActor(resident());
run(routeFailed, start, start + 60000, [], R.context(map, failingHero));
assert.equal(manual.aborted, undefined, 'route failure cannot abort another person’s real queued task');
console.log('Scheduled crafts: timed route, personal ownership, live/offline/reload parity, short work, current mentor gate and forecast isolation passed.');
