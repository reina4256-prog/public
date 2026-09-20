const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function extract(file, name, next) {
    const source = fs.readFileSync(file, 'utf8');
    return source.slice(source.indexOf('window.' + name + ' ='), source.indexOf(next, source.indexOf('window.' + name + ' =')));
}
let update, finished = 0, released = 0;
const context = { window: { GameShell: {
    setExclusiveUpdate(root, fn) { update = fn; }, syncOverlays() {}, endExclusive() { released++; }
}, updateExamUI() {} } };
vm.createContext(context);
vm.runInContext(extract('ui_controller.js', 'startApprenticeExamProgress', 'window.openExamUI ='), context);
for (const masterType of ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building', 'pharmacist', 'tailor', 'pastry_chef', 'hairdresser', 'dealer']) {
    const task = { masterType, duration: 3 };
    let removed = false;
    const hero = { schedule: [task, { type: 'rest' }], processApprenticeExamFinish(value) { assert.equal(value, task); finished++; } };
    context.window.aiPet = hero;
    context.window.startApprenticeExamProgress(task, { remove() { removed = true; } });
    update(); assert.equal(task.duration, 2);
    update(); update(); assert(removed); assert.equal(hero.schedule[0].type, 'rest');
    update(); assert.equal(hero.schedule.length, 1, 'stale callback cannot consume next task');
}
assert.equal(finished, 11);
let removedPopup = false;
context.document = { getElementById: () => ({ remove() { removedPopup = true; } }) };
vm.runInContext(extract('tcg_core.js', 'closeCardUnlockPopup', 'window.openCardBinder ='), context);
const beforeRelease = released;
context.window.closeCardUnlockPopup(); assert(removedPopup); assert.equal(released, beforeRelease + 1);
context.window.Residents = {};
vm.runInContext(fs.readFileSync('resident_ui.js', 'utf8'), context);
const group = context.window.ResidentUI.groupedItems;
assert.equal(group(Array(999).fill('wood'))[0].count, 999);
context.itemCatalog = { wood: { type: 'material' } };
assert.equal(group(['wood', { id: 'wood', age: 20, instanceId: 'item-1' }])[0].count, 2);
assert.equal(group([{ id: 'sword', durability: 1 }, { id: 'sword', durability: 2 }]).length, 2);
assert.equal(group([{ id: 'fish', freshnessStartedAt: 1 }, { id: 'fish', freshnessStartedAt: 2 }]).length, 2);
console.log('All career foreground clocks, stale tasks, card pause release and inventory grouping passed.');

const homeSource = fs.readFileSync('myhome_map_core.js', 'utf8');
const requestSource = homeSource.slice(homeSource.indexOf('    function requestResidentFurniture'), homeSource.indexOf('    function moveResidentVisitor'));
const one = { personId: 'p1', home: { buildingId: 'house', slot: 2 } };
const two = { personId: 'p2', home: { buildingId: 'house', slot: 0 } };
let occupants = [one], moved, inspected, questions = 0;
const homeContext = {
    residentVisit: { buildingId: 'house', root: {}, path: [{ x: 9 }], arrive() { throw new Error('stale arrival'); } },
    residentBeds: [2, 4, 6, 8].map(x => ({ x, y: 1 })), residentFurniture: [{ id: 'warehouse', x: 2, y: 5 }],
    residentOccupants: () => occupants,
    moveResidentVisitor(goal, callback) { moved = goal; callback(); },
    window: { aiPet: { residentState: { people: { p1: one, p2: two } } }, ResidentUI: {
        element() { questions++; return { remove() {} }; },
        button() { return { dataset: {} }; }, name: p => p.personId,
        showPerson(id, kind) { inspected = { id, kind }; }
    } }
};
vm.createContext(homeContext); vm.runInContext(requestSource, homeContext);
homeContext.requestResidentFurniture('bed');
assert.equal(moved.x, 6); assert.equal(moved.y, 2); assert.equal(inspected.id, 'p1');
assert.equal(homeContext.residentVisit.arrive, null);
occupants = [one, two]; inspected = null;
homeContext.requestResidentFurniture('warehouse');
assert(questions > 0); assert.equal(inspected, null); assert.equal(homeContext.residentVisit.pendingFurniture, 'warehouse');
homeContext.requestResidentFurniture('warehouse', two);
assert.equal(inspected.id, 'p2'); assert.equal(inspected.kind, 'warehouse');
assert.equal(homeContext.residentVisit.pendingFurniture, null);
console.log('Resident furniture: single occupant, name question, selected owner and stale-route cancellation passed.');
