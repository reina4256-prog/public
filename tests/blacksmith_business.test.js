const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'blacksmith_map_core.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const uiControllerSource = fs.readFileSync(path.join(__dirname, '..', 'ui_controller.js'), 'utf8');
let saveCount = 0;
const context = {
    console,
    Math,
    Date,
    JSON,
    Object,
    Array,
    Set,
    Map,
    Number,
    String,
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: callback => { callback(); return 1; },
    clearTimeout: () => {},
    saveGameData: () => { saveCount += 1; },
    itemCatalog: {
        eq_sword: { name: '鉄の剣', value: 300 },
        eq_staff: { name: '杖', value: 200 },
        rod_old: { name: '古い釣り竿', value: 80 },
        iron: { name: '鉄' },
        wood: { name: '木材' },
        crystal: { name: 'クリスタル' }
    },
    aiPet: {
        apprentice: { retired: { smithing: true }, rank: { smithing: 10 } },
        inventory: [],
        stats: { intel: 0 },
        gold: 0,
        schedule: []
    },
    document: {
        getElementById: () => null,
        createElement: () => ({ style: {}, dataset: {}, appendChild() {}, append() {}, remove() {}, addEventListener() {}, setAttribute() {}, focus() {}, select() {}, value: '', textContent: '' }),
        body: { appendChild() {} },
        head: { appendChild() {} }
    }
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'blacksmith_map_core.js' });

const api = context.__BLACKSMITH_TEST_API;
assert(api, 'test API should be exposed');
assert.strictEqual(Object.keys(context.BLACKSMITH_SPRITES).length, 32, 'equipment, interior themes, and nine stair parts should be registered');
assert.strictEqual(context.BLACKSMITH_SPRITES.bmap_floor.img, 'blacksmith_mapchip.jpg');
assert.strictEqual(context.BLACKSMITH_SPRITES.bshelf_weapon.img, 'blacksmith_productshelf_mapchip.png');
assert.strictEqual(context.BLACKSMITH_SPRITES.bwork_furnace.img, 'blacksmith_workshop_mapchip.png');
assert.strictEqual(context.BLACKSMITH_SPRITES.bwork_magic_furnace.img, 'blacksmith_workshop_mapchip2.png');
assert.strictEqual(context.BLACKSMITH_SPRITES.bshelf_royal.img, 'blacksmith_productshelf_mapchip2.png');
const stairSpriteKeys = Object.keys(context.BLACKSMITH_SPRITES).filter(key => key.startsWith('bstairs_'));
assert.strictEqual(stairSpriteKeys.length, 9, 'five upward and four downward stair parts should be registered');
assert(stairSpriteKeys.every(key => context.BLACKSMITH_SPRITES[key].img === 'restaurant_stairs_mapchip.png'), 'Blacksmith stairs should reuse the restaurant stair artwork');
assert(stairSpriteKeys.every(key => context.BLACKSMITH_SPRITES[key].tileFill === true), 'every stair crop should fill exactly one logical cell');
const stairSpriteLayout = api.blacksmithSpriteLayout(context.BLACKSMITH_SPRITES.bstairs_up_tl, 250, 250);
assert.strictEqual(stairSpriteLayout.cropWidth, 250);
assert.strictEqual(stairSpriteLayout.cropHeight, 250);
const materialSpriteLayout = api.blacksmithSpriteLayout(context.BLACKSMITH_SPRITES.bwork_material, 250, 250);
assert(Math.abs(materialSpriteLayout.cropWidth - 250) < 0.0001, 'each Blacksmith object crop should use one logical tile of width');
assert(Math.abs(materialSpriteLayout.cropHeight - (541 * 250 / 1288)) < 0.0001, 'wide equipment should preserve its crop aspect ratio');
assert(Math.abs(materialSpriteLayout.cropTop + materialSpriteLayout.cropHeight - 250) < 0.0001, 'equipment crops should anchor their bottom edge to the cell foot');
const weaponShelfSpriteLayout = api.blacksmithSpriteLayout(context.BLACKSMITH_SPRITES.bshelf_weapon, 250, 250);
assert(Math.abs(weaponShelfSpriteLayout.cropWidth - 250) < 0.0001, 'tall equipment should still use the full cell width');
assert(weaponShelfSpriteLayout.cropTop < 0, 'tall equipment may extend upward while keeping its foot in the selected cell');
assert.strictEqual(context.BLACKSMITH_LEVEL_MILESTONES.length, 30, 'Lv1-30 milestones should exist');
assert(Object.values(context.BLACKSMITH_RECIPE_CATALOG).every(recipe => !Object.prototype.hasOwnProperty.call(recipe, 'level')), 'recipes should no longer carry direct level gates');
assert(source.includes('id="blacksmith-map-viewport"'), 'the business map should use a clipped camera viewport');
assert(source.includes('window.toggleBlacksmithMinimap'), 'the minimap should be available through a toggle button');
assert(source.includes('window.toggleBlacksmithLogStatus'), 'logs and status should be available through a toggle button');
assert(source.includes('window.toggleBlacksmithRecipes'), 'recipes and shelf stock should be available through a toggle button');
assert(source.includes('window.aiPet.blacksmithRecipeNotebookUnlocked = true'), 'entering an owned Blacksmith should unlock its Notebook bookmark');
assert(source.includes("filter(([id]) => state.recipes[id]?.discovered)"), 'in-shop recipe screens should hide undiscovered recipe details');
assert(source.includes('id="blacksmith-header-host"'), 'the management shell should preserve the map while updating header content');
assert(source.includes("querySelectorAll('.blacksmith-map-actor')"), 'map actors should be reconciled separately from speech bubbles');
assert(!source.includes("querySelectorAll('.blacksmith-map-dynamic')"), 'simulation ticks should not delete and recreate every visible actor');
assert(source.includes('_blacksmithDynamicSignature !== dynamicSignature'), 'unchanged characters and speech bubbles should survive idle simulation ticks');
assert(source.includes('left ${ACTOR_MOVE_MS}ms linear, top ${ACTOR_MOVE_MS}ms linear'), 'actor movement should interpolate between logical cells');
assert(source.includes("inner.style.transformOrigin = 'bottom center'"), 'Blacksmith characters should share the Casino foot-anchor rendering rule');
assert(source.includes('background-size:${iw * scaleX}px ${ih * scaleY}px'), 'Blacksmith floor and wall crops should fill the full logical tile in both axes');
assert(!source.includes("object.y, 100 + object.y, 320, 320"), 'equipment should not use the obsolete fixed 320px crop frame');
assert(!source.includes("marker.textContent = '入口'"), 'the full map should not label visually obvious entrance tiles');
const fallbackActor = api.characterElement(null, 'down', 1, 1, 500, 'blacksmith-player');
const movedFallbackActor = api.characterElement(null, 'right', 2, 1, 500, 'blacksmith-player', fallbackActor);
assert.strictEqual(movedFallbackActor, fallbackActor, 'an actor DOM node should be reused when its logical cell changes');
assert.strictEqual(movedFallbackActor.style.transition, `left ${api.actorMoveMs}ms linear, top ${api.actorMoveMs}ms linear`);

const building = {
    type: 'blacksmith',
    shopData: {
        recipes: { legacy_random_blade: { learned: true } },
        recipeProgress: { legacy_random_blade: 75 }
    }
};
const state = api.normalizeState(building);
context.BLACKSMITH_STATE = state;
assert.deepStrictEqual(Array.from(state.floors[0].objects), [], 'a first-time Blacksmith tutorial should start with no equipment installed');
const stableHost = { innerHTML: '', _blacksmithMarkup: null };
assert.strictEqual(api.updateBlacksmithHtmlHost(stableHost, '<b>same</b>'), true, 'the first host render should write its markup');
assert.strictEqual(api.updateBlacksmithHtmlHost(stableHost, '<b>same</b>'), false, 'an unchanged simulation tick must not rebuild the same DOM host');
const mainFloorSignature = api.blacksmithMapSignature(state.floors[0]);
state.player.x += 1;
assert.strictEqual(api.blacksmithMapSignature(state.floors[0]), mainFloorSignature, 'character movement must not invalidate and repaint the static map');
state.player.x -= 1;
context.BLACKSMITH_PANEL_STATE = { minimap: false, logStatus: false, recipes: false };
context.toggleBlacksmithMinimap();
context.toggleBlacksmithLogStatus();
assert.strictEqual(context.BLACKSMITH_PANEL_STATE.minimap, true, 'minimap and log/status should be able to stay open together');
assert.strictEqual(context.BLACKSMITH_PANEL_STATE.logStatus, true);
context.toggleBlacksmithRecipes();
assert.strictEqual(context.BLACKSMITH_PANEL_STATE.recipes, true, 'the recipe/stock panel should open independently');
assert.strictEqual(context.BLACKSMITH_PANEL_STATE.minimap, false, 'the recipe/stock panel should replace the comparison panels');
assert.strictEqual(context.BLACKSMITH_PANEL_STATE.logStatus, false);
const cameraAtStart = api.calculateBlacksmithCamera(state, 1200, 800);
state.player.x += 1;
const cameraAfterMove = api.calculateBlacksmithCamera(state, 1200, 800);
assert(cameraAfterMove.x < cameraAtStart.x, 'the camera should move left as the AI clerk walks right, keeping the clerk centered');
assert.strictEqual(cameraAfterMove.y, cameraAtStart.y, 'horizontal movement should not disturb the vertical camera center');
state.player.x -= 1;
assert.strictEqual(state.recipes.legacy_random_blade, undefined, 'legacy recipes must not be imported');
assert.deepStrictEqual(Object.keys(state.recipes).sort(), Object.keys(context.BLACKSMITH_RECIPE_CATALOG).sort(), 'only canonical recipes should exist');
assert(building.shopData.recipes.legacy_random_blade, 'obsolete pre-release recipe data should be ignored without exposing a cleanup feature');
assert(!source.includes('旧レシピ整理'), 'the pre-release legacy recipe cleanup button should be removed');

const equipmentBuilding = { type: 'blacksmith' };
const equipmentState = api.normalizeState(equipmentBuilding);
equipmentState.tutorial.completed = true;
api.ensureBasicEquipment(equipmentState);
context.aiPet.inventory = [
    { id: 'wood' }, { id: 'wood' }, { id: 'wood' }, { id: 'wood' }, { id: 'wood' }, { id: 'crystal' }
];
equipmentState.level = 2;
assert.strictEqual(api.hasBlacksmithRecipeEquipment(equipmentState, context.BLACKSMITH_RECIPE_CATALOG.eq_staff), false, 'a recipe should remain undiscoverable before its required equipment milestone');
assert.strictEqual(api.selectScheduledRecipe(equipmentState), null, 'materials alone must not bypass a missing required facility');
equipmentState.level = 3;
api.grantUnlockedEquipment(equipmentState, true);
assert(equipmentState.floors[0].objects.some(object => object.type === 'magic_furnace'), 'Lv3 should automatically replace the installed furnace with the magic furnace');
assert(equipmentState.unplacedEquipment.some(object => object.type === 'furnace'), 'the substituted normal furnace should remain owned as unplaced equipment');
assert.strictEqual(api.hasBlacksmithRecipeEquipment(equipmentState, context.BLACKSMITH_RECIPE_CATALOG.eq_staff), true, 'the magic furnace milestone should satisfy the staff recipe equipment requirement');
assert.strictEqual(api.selectScheduledRecipe(equipmentState).recipeId, 'eq_staff', 'the recipe should become discoverable from materials once its equipment is available');
context.aiPet.inventory = [{ id: 'wood' }, { id: 'wood' }, { id: 'wood' }, { id: 'iron' }];
equipmentState.level = 1;
assert.strictEqual(api.selectScheduledRecipe(equipmentState).recipeId, 'rod_old', 'recipes without advanced equipment should no longer wait for their former arbitrary level');

for (let i = 0; i < 5; i += 1) context.aiPet.inventory.push({ id: 'iron', age: 0 });
for (let i = 0; i < 2; i += 1) context.aiPet.inventory.push({ id: 'wood', age: 0 });
state.tutorial.completed = true;
api.ensureBasicEquipment(state);
state.tactics = api.defaultTactics();
state.tactics = [
    { condition: 'can_prepare', action: 'serve', enabled: true },
    { condition: 'can_prepare', action: 'prepare', enabled: true }
];
assert.strictEqual(api.getTacticAction(state, 'can_prepare'), 'serve', 'the first matching AI-mind rule should win');
state.tactics = api.defaultTactics();
assert(api.startPreparation(state, 'eq_sword', true), 'tutorial-forced preparation should start');
for (let i = 0; i < 80 && state.work; i += 1) api.tickPreparation(state);
assert.strictEqual(state.work, null, 'preparation route should finish');
assert.strictEqual(state.recipes.eq_sword.discovered, true, 'material combination should discover the recipe');
assert.strictEqual(state.recipes.eq_sword.mastery, 100, 'forced tutorial recipe should reach 100%');
assert.strictEqual(state.stock.eq_sword, 1, 'completed product should be stored on its category shelf');
const prepLog = state.logs.map(entry => entry.text).join('\n');
assert(prepLog.indexOf('炉で素材を熱する') < prepLog.indexOf('金床で形を整える'), 'furnace should precede anvil');
assert(prepLog.indexOf('金床で形を整える') < prepLog.indexOf('冷却完了'), 'anvil should precede cooling');
assert(prepLog.includes('武器商品棚へ並べた'), 'weapon should be stored on the weapon shelf');

const batchState = api.normalizeState({ type: 'blacksmith' });
batchState.tutorial.completed = true;
api.ensureBasicEquipment(batchState);
const batchMaterial = batchState.floors[0].objects.find(object => object.type === 'material');
batchMaterial.id = 'material_large';
batchMaterial.type = 'material_large';
batchState.recipes.eq_sword = { discovered: true, mastery: 100 };
batchState.production.targets.eq_sword = 1;
context.aiPet.inventory = Array.from({ length: 15 }, () => ({ id: 'iron' })).concat(Array.from({ length: 6 }, () => ({ id: 'wood' })));
assert(api.startPreparation(batchState, 'eq_sword', false, { source: 'target' }));
assert.strictEqual(batchState.work.quantity, 1, 'large storage should clamp a batch to the remaining target deficit');
for (let i = 0; i < 80 && batchState.work; i += 1) api.tickPreparation(batchState);
batchState.production.targets.eq_sword = 3;
assert(api.startPreparation(batchState, 'eq_sword', false, { source: 'target' }));
assert.strictEqual(batchState.work.quantity, 2, 'large storage should make two completed products in one circuit when demand and materials allow');
for (let i = 0; i < 80 && batchState.work; i += 1) api.tickPreparation(batchState);
assert.strictEqual(batchState.stock.eq_sword, 3, 'the two circuits should stop exactly at the target stock');

equipmentState.level = 25;
api.grantUnlockedEquipment(equipmentState, true);
for (const type of ['precision_tools', 'armor_finishing', 'material_large', 'master_anvil', 'shelf_royal']) {
    assert(equipmentState.unplacedEquipment.some(object => object.type === type), `${type} should be granted once as unplaced equipment at its unlock level`);
}
assert.strictEqual(api.getMaxReputation(30), 130, 'Lv30 should unlock a reputation cap of 130 instead of a title-only ending');

const debugLevelBuilding = { type: 'blacksmith' };
const debugLevelState = api.normalizeState(debugLevelBuilding);
debugLevelState.tutorial.completed = true;
api.ensureBasicEquipment(debugLevelState);
const debugLevelResult = api.setBlacksmithLevelForDebug(debugLevelBuilding, 30);
assert.strictEqual(debugLevelResult.ok, true, 'the debug setter should accept any Blacksmith level from 1 through 30');
assert.strictEqual(debugLevelState.level, 30);
assert.strictEqual(debugLevelState.exp, 0, 'debug level changes should start the selected level at zero EXP');
assert(debugLevelState.floors.some(floor => floor.id === '2f'), 'debug level 30 should apply the Lv10 floor unlock');
assert(debugLevelState.floors.some(floor => floor.id === 'b1f'), 'debug level 30 should apply the Lv23 basement unlock');
assert(debugLevelState.floors[0].width >= 17, 'debug level 30 should apply the Lv5 main-floor expansion');
assert(debugLevelState.unplacedEquipment.some(object => object.type === 'shelf_royal'), 'debug level 30 should grant the Lv25 royal shelf');
const debugMainFloor = debugLevelState.floors.find(floor => floor.id === '1f');
const debugUpperFloor = debugLevelState.floors.find(floor => floor.id === '2f');
const debugBasementFloor = debugLevelState.floors.find(floor => floor.id === 'b1f');
const mainUpStairs = debugMainFloor.objects.find(object => object.type === 'stairs_up');
const upperDownStairs = debugUpperFloor.objects.find(object => object.type === 'stairs_down');
const mainDownStairs = debugMainFloor.objects.find(object => object.type === 'stairs_down');
const basementUpStairs = debugBasementFloor.objects.find(object => object.type === 'stairs_up');
assert.strictEqual(api.objectFootprintCells(mainUpStairs).length, 5, 'upward stairs should occupy their five drawn cells');
assert.strictEqual(api.objectFootprintCells(mainDownStairs).length, 4, 'downward stairs should occupy their four drawn cells');
assert([mainUpStairs, upperDownStairs, mainDownStairs, basementUpStairs].every(stair => stair.locked === false), 'every floor staircase should start movable as its own group');
assert.strictEqual(mainUpStairs.targetFloorId, '2f');
assert.strictEqual(upperDownStairs.targetFloorId, '1f');
assert.strictEqual(mainDownStairs.targetFloorId, 'b1f');
assert.strictEqual(basementUpStairs.targetFloorId, '1f');
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(debugLevelState.floors, debugLevelState.serviceLayout)), [], 'the grouped default stairs should satisfy layout validation');
const outsideStairFloors = JSON.parse(JSON.stringify(debugLevelState.floors));
outsideStairFloors.find(floor => floor.id === '1f').objects.find(object => object.type === 'stairs_up').x = 15;
assert(Array.from(context.validateBlacksmithLayout(outsideStairFloors, debugLevelState.serviceLayout)).some(error => error.includes('設備が床の外')), 'validation should check every drawn stair part instead of only its anchor');
const overlappingStairFloors = JSON.parse(JSON.stringify(debugLevelState.floors));
const overlappingMain = overlappingStairFloors.find(floor => floor.id === '1f');
const overlappingDown = overlappingMain.objects.find(object => object.type === 'stairs_down');
overlappingDown.x = 10;
overlappingDown.y = 4;
assert(Array.from(context.validateBlacksmithLayout(overlappingStairFloors, debugLevelState.serviceLayout)).some(error => error.includes('設備が重なっています')), 'validation should reject overlap between grouped stair parts');

const upApproach = { ...api.stairPoint(mainUpStairs, 'approach'), floorId: '1f' };
const upperExit = { ...api.stairPoint(upperDownStairs, 'exit'), floorId: '2f' };
const upwardPath = api.findPath(debugLevelState, upApproach, upperExit);
assert.deepStrictEqual(
    JSON.parse(JSON.stringify(upwardPath.map(step => [step.floorId, step.x, step.y]))),
    [['1f', 10, 6], ['1f', 10, 5], ['1f', 10, 4], ['2f', 5, 6]],
    'the AI should climb every upward-stair cell before changing floors'
);
const upwardMover = { ...upApproach, dir: 'up', path: JSON.parse(JSON.stringify(upwardPath)) };
for (let step = 0; step < 3; step += 1) {
    assert(api.stepMover(upwardMover, debugLevelState));
    assert.strictEqual(upwardMover.floorId, '1f', 'the floor must not change before the upward-stair terminal cell');
}
assert(api.stepMover(upwardMover, debugLevelState));
assert.strictEqual(upwardMover.floorId, '2f', 'the floor should change only after the upward-stair terminal cell');

const downApproach = { ...api.stairPoint(mainDownStairs, 'approach'), floorId: '1f' };
const basementExit = { ...api.stairPoint(basementUpStairs, 'exit'), floorId: 'b1f' };
const downwardPath = api.findPath(debugLevelState, downApproach, basementExit);
assert.deepStrictEqual(
    JSON.parse(JSON.stringify(downwardPath.map(step => [step.floorId, step.x, step.y]))),
    [['1f', 13, 6], ['1f', 13, 7], ['b1f', 5, 5]],
    'the AI should descend both downward-stair cells before changing floors'
);
const downwardMover = { ...downApproach, dir: 'down', path: JSON.parse(JSON.stringify(downwardPath)) };
for (let step = 0; step < 2; step += 1) {
    assert(api.stepMover(downwardMover, debugLevelState));
    assert.strictEqual(downwardMover.floorId, '1f', 'the floor must not change before the downward-stair terminal cell');
}
assert(api.stepMover(downwardMover, debugLevelState));
assert.strictEqual(downwardMover.floorId, 'b1f', 'the floor should change only after the downward-stair terminal cell');

const floorMoveState = JSON.parse(JSON.stringify(debugLevelState));
floorMoveState.player.path = [];
floorMoveState.activeFloorId = '1f';
assert(api.beginBlacksmithFloorMove(floorMoveState, '2f'), 'selecting 2F while idle should start a real stair route');
assert.strictEqual(floorMoveState.activeFloorId, '1f', 'the displayed floor should follow the AI until it reaches the stair terminal');
for (let step = 0; step < 100 && floorMoveState.floorMove; step += 1) api.tickBlacksmithFloorMove(floorMoveState);
assert.strictEqual(floorMoveState.player.floorId, '2f');
assert.strictEqual(floorMoveState.activeFloorId, '2f', 'the display should switch only when the AI arrives upstairs');
assert.deepStrictEqual(
    { x: floorMoveState.player.x, y: floorMoveState.player.y },
    JSON.parse(JSON.stringify(api.stairPoint(floorMoveState.floors.find(floor => floor.id === '2f').objects.find(object => object.type === 'stairs_down'), 'exit'))),
    'the AI should appear on the paired upper-floor exit cell'
);
assert(api.beginBlacksmithOpening(floorMoveState), 'opening from 2F should route the AI back downstairs');
assert.strictEqual(floorMoveState.player.floorId, '2f', 'opening preparation must not teleport the AI to 1F');
assert(floorMoveState.player.path.some(step => step.floorTransition && step.floorId === '1f'), 'opening preparation should include the downward stair transition');
for (let step = 0; step < 100 && floorMoveState.opening; step += 1) api.tickBlacksmithOpening(floorMoveState);
assert.strictEqual(floorMoveState.player.floorId, '1f', 'opening preparation should finish on 1F after the stair route');
assert.strictEqual(floorMoveState.isOpen, true);

const legacyStairBuilding = { type: 'blacksmith', blacksmithBusiness: JSON.parse(JSON.stringify(debugLevelState)) };
legacyStairBuilding.blacksmithBusiness.version = 7;
legacyStairBuilding.blacksmithBusiness.floors.find(floor => floor.id === '1f').objects.find(object => object.type === 'stairs_down').x = 10;
legacyStairBuilding.blacksmithBusiness.floors.find(floor => floor.id === 'b1f').objects.find(object => object.type === 'stairs_up').y = 4;
const migratedStairState = api.normalizeState(legacyStairBuilding);
assert.strictEqual(migratedStairState.version, 10, 'legacy stair and service-layout saves should migrate to the current movable multi-floor schema');
assert.deepStrictEqual(
    JSON.parse(JSON.stringify(migratedStairState.floors.find(floor => floor.id === '1f').objects.find(object => object.type === 'stairs_down'))),
    { id: 'stairs_down_b1f', type: 'stairs_down', targetFloorId: 'b1f', x: 13, y: 6, locked: false },
    'legacy basement stairs should move to a valid non-overlapping grouped placement'
);
const versionEightStairBuilding = { type: 'blacksmith', blacksmithBusiness: JSON.parse(JSON.stringify(debugLevelState)) };
versionEightStairBuilding.blacksmithBusiness.version = 8;
const versionEightUpperStair = versionEightStairBuilding.blacksmithBusiness.floors.find(floor => floor.id === '2f').objects.find(object => object.type === 'stairs_down');
versionEightUpperStair.x = 2;
versionEightUpperStair.y = 2;
versionEightUpperStair.locked = true;
const migratedVersionEightState = api.normalizeState(versionEightStairBuilding);
const migratedVersionEightUpperStair = migratedVersionEightState.floors.find(floor => floor.id === '2f').objects.find(object => object.type === 'stairs_down');
assert.strictEqual(migratedVersionEightState.version, 10, 'version 8 grouped stairs should migrate to the current movable multi-floor schema');
assert.deepStrictEqual(
    { x: migratedVersionEightUpperStair.x, y: migratedVersionEightUpperStair.y, locked: migratedVersionEightUpperStair.locked },
    { x: 2, y: 2, locked: false },
    'version 8 migration should preserve an independently positioned staircase while releasing its initial lock'
);

const futureFloorState = JSON.parse(JSON.stringify(debugLevelState));
const futureUpperFloor = futureFloorState.floors.find(floor => floor.id === '2f');
futureUpperFloor.objects.push({ id: 'stairs_up_3f', type: 'stairs_up', targetFloorId: '3f', x: 1, y: 1, locked: false });
const thirdFloor = JSON.parse(JSON.stringify(futureUpperFloor));
thirdFloor.id = '3f';
thirdFloor.name = '3階';
thirdFloor.objects = [{ id: 'stairs_3f', type: 'stairs_down', targetFloorId: '2f', x: 5, y: 2, locked: false }];
futureFloorState.floors.push(thirdFloor);
const futurePath = api.findPath(
    futureFloorState,
    { ...api.stairPoint(futureFloorState.floors.find(floor => floor.id === '1f').objects.find(object => object.type === 'stairs_up'), 'approach'), floorId: '1f' },
    { ...api.stairPoint(thirdFloor.objects[0], 'exit'), floorId: '3f' }
);
assert.deepStrictEqual(
    JSON.parse(JSON.stringify(futurePath.filter(step => step.floorTransition).map(step => step.floorId))),
    ['2f', '3f'],
    'the targetFloorId graph should support independently positioned stair pairs on future floors'
);
const ownedBeforeDebugLevelDown = debugLevelState.unplacedEquipment.length;
const debugLevelDownResult = api.setBlacksmithLevelForDebug(debugLevelBuilding, 1);
assert.strictEqual(debugLevelDownResult.ok, true);
assert.strictEqual(debugLevelState.level, 1);
assert.strictEqual(debugLevelState.unplacedEquipment.length, ownedBeforeDebugLevelDown, 'lowering the debug level must not delete owned equipment');
assert(debugLevelState.floors.some(floor => floor.id === '2f') && debugLevelState.floors.some(floor => floor.id === 'b1f'), 'lowering the debug level must not delete expanded floors');
assert.strictEqual(api.setBlacksmithLevelForDebug(debugLevelBuilding, 31).reason, 'invalid_level');
assert(indexSource.includes('id="dbg-blacksmith-level"'), 'integrated Debug should expose the Blacksmith level input');
assert(indexSource.includes('window.applyDebugBlacksmithLevel()'), 'integrated Debug should wire the Blacksmith level apply action');
assert(uiControllerSource.includes('window.refreshDebugBlacksmithLevelUI()'), 'opening Debug should show the current Blacksmith level');

state.isOpen = true;
assert(api.spawnCustomer(state, 'eq_sword'), 'customer should enter for stocked product');
for (let i = 0; i < 120 && state.customers.length; i += 1) {
    api.tickCustomers(state);
    api.tickService(state);
}
assert.strictEqual(state.customers.length, 0, 'customer should leave through the entrance after checkout');
assert.strictEqual(state.stock.eq_sword, 0, 'checkout should remove one shelf item');
assert(context.aiPet.gold > 0, 'checkout should credit the AI');
const salesLog = state.logs.map(entry => entry.text).join('\n');
assert(salesLog.includes('鉄の剣を見せてください'), 'customer should ask for the reserved product by name');
assert(salesLog.includes('会計をお願いします'), 'customer should order at the anvil queue');
assert(salesLog.includes('ご注文ありがとうございます'), 'AI should respond to the named customer');
assert(salesLog.includes('鍛冶屋を出た'), 'customer should leave through the entrance');

const quantityBuilding = { type: 'blacksmith' };
const quantityState = api.normalizeState(quantityBuilding);
quantityState.tutorial.completed = true;
api.ensureBasicEquipment(quantityState);
quantityState.recipes.eq_sword = { discovered: true, mastery: 100 };
quantityState.stock.eq_sword = 10;
context.aiPet.inventory = [];
for (let i = 0; i < 4995; i += 1) context.aiPet.inventory.push({ id: 'iron' });
for (let i = 0; i < 1998; i += 1) context.aiPet.inventory.push({ id: 'wood' });
assert.deepStrictEqual(JSON.parse(JSON.stringify(api.productionLimits(quantityState, 'eq_sword'))), { exactMax: 999, targetMax: 1009 }, 'production counters must use inventory-derived maxima without a fixed 99 cap');
quantityState.production.orders.push({ id: 1, recipeId: 'eq_sword', remaining: 500, createdAt: 1 });
assert.strictEqual(api.craftableQuantity(quantityState, 'eq_sword'), 499, 'exact orders should logically reserve their materials from later plans');
assert.strictEqual(api.selectScheduledRecipe(quantityState).orderId, 1, 'an exact material-reserved order should run before target-stock work');

const queueBuilding = { type: 'blacksmith' };
const queueState = api.normalizeState(queueBuilding);
queueState.tutorial.completed = true;
queueState.recipes.eq_sword = { discovered: true, mastery: 100 };
queueState.stock.eq_sword = 7;
queueState.isOpen = true;
api.ensureBasicEquipment(queueState);
context.aiPet.discoveredMonsters = ['dragon_type2'];
for (let i = 0; i < 7; i += 1) assert(api.spawnCustomer(queueState, 'eq_sword'), `reserved customer ${i + 1} should be admitted`);
assert(queueState.customers.every(customer => customer.skin === 'dragon_type2'), 'Blacksmith customers should use encyclopedia-unlocked forms');
assert.strictEqual(queueState.customers.filter(customer => customer.status === 'outside_waiting').length, 1, 'customers beyond the six registered indoor positions should wait outside');
assert.strictEqual(api.availableStock(queueState, 'eq_sword'), 0, 'arriving customers should reserve stock and prevent overbooking');
assert.strictEqual(api.spawnCustomer(queueState, 'eq_sword'), false, 'no customer should arrive for already-reserved stock');
for (let i = 0; i < 60; i += 1) api.tickCustomers(queueState);
const indoorQueueIndexes = queueState.customers
    .filter(customer => customer.status !== 'outside_waiting' && !String(customer.status).includes('leaving'))
    .map(customer => customer.queueTargetIndex)
    .filter(Number.isFinite);
assert.strictEqual(new Set(indoorQueueIndexes).size, indoorQueueIndexes.length, 'each indoor customer should receive a distinct ordered queue position');

const openingBuilding = { type: 'blacksmith' };
const openingState = api.normalizeState(openingBuilding);
openingState.tutorial.completed = true;
api.ensureBasicEquipment(openingState);
openingState.stock.eq_sword = 1;
openingState.player = { floorId: '1f', x: 2, y: 3, dir: 'right', path: [] };
assert(api.beginBlacksmithOpening(openingState), 'opening preparation should begin');
assert.strictEqual(openingState.isOpen, false, 'the shop must remain closed while the AI walks behind the anvil');
assert(openingState.player.path.length > 0, 'opening should use a real path instead of teleporting');
for (let i = 0; i < 80 && openingState.opening; i += 1) api.tickBlacksmithOpening(openingState);
assert.strictEqual(openingState.isOpen, true, 'sales should begin only after the AI reaches its standby position');
assert.deepStrictEqual({ x: openingState.player.x, y: openingState.player.y, dir: openingState.player.dir }, { x: 6, y: 1, dir: 'down' }, 'the AI should stand exactly behind the anvil and face the customer side');

const zeroReputationState = api.normalizeState({ type: 'blacksmith', blacksmithBusiness: { ...openingState, reputation: 0 } });
assert.strictEqual(zeroReputationState.reputation, 0, 'normalization must preserve reputation zero for bankruptcy');
assert.strictEqual(zeroReputationState.isBankrupt, true);
context.assets = {
    hut: { type: 'hut', storage: { safe: { gold: 25000 }, items: [{ id: 'iron' }] } }
};
context.BLACKSMITH_STATE = zeroReputationState;
zeroReputationState.level = 5;
zeroReputationState.reputation = 0;
zeroReputationState.isBankrupt = true;
context.executeBlacksmithBailout();
assert.strictEqual(context.assets.hut.storage.safe.gold, 0, 'bailout should charge the My Home safe at Lv x 5000G');
assert.strictEqual(zeroReputationState.reputation, api.getMaxReputation(5), 'bailout should restore the current level reputation cap');
assert.strictEqual(zeroReputationState.isBankrupt, false, 'a successful bailout should reopen management without rebuilding the shop');

const foreclosureBuilding = { id: 'owned_blacksmith', type: 'blacksmith' };
const foreclosureState = api.normalizeState(foreclosureBuilding);
foreclosureState.tutorial.completed = true;
foreclosureState.level = 7;
foreclosureState.reputation = 0;
foreclosureState.isBankrupt = true;
foreclosureState.recipes.eq_sword = { discovered: true, mastery: 100 };
foreclosureState.editorUnlocked = true;
api.ensureBasicEquipment(foreclosureState);
context.aiPet.gold = 777;
context.aiPet.inventory = [{ id: 'iron' }, { id: 'wood' }, { id: 'souvenir' }];
context.assets.owned_blacksmith = foreclosureBuilding;
context.currentBlacksmithBuilding = foreclosureBuilding;
context.BLACKSMITH_STATE = foreclosureState;
context.executeBlacksmithForeclosure();
assert.strictEqual(context.assets.owned_blacksmith, undefined, 'foreclosure should remove the owned Blacksmith building from the map collection');
assert.strictEqual(context.aiPet.gold, 0, 'foreclosure should confiscate carried Gold');
assert.deepStrictEqual(Array.from(context.aiPet.inventory, item => item.id), ['souvenir'], 'foreclosure should confiscate carried smithing materials but preserve unrelated items');
assert.deepStrictEqual(context.assets.hut.storage.items.map(item => item.id), ['iron'], 'foreclosure must not confiscate materials stored at My Home');
assert.strictEqual(context.aiPet.blacksmithBusinessRebuildPending, true, 'foreclosure should arm the next Blacksmith building as a rebuild');
assert.strictEqual(context.aiPet.savedBlacksmithRecipes.eq_sword.mastery, 100, 'foreclosure should preserve recipe mastery outside the deleted building');
assert.strictEqual(context.aiPet.blacksmithLayoutEditorUnlocked, true, 'foreclosure should preserve the permanent layout-editor unlock');
const rebuiltState = api.normalizeState({ type: 'blacksmith' });
assert.strictEqual(rebuiltState.level, 1, 'a foreclosed Blacksmith should rebuild at Lv1');
assert.strictEqual(rebuiltState.reputation, 40, 'a rebuilt Blacksmith should restart at reputation 40/40');
assert.strictEqual(rebuiltState.recipes.eq_sword.mastery, 100, 'rebuilding should preserve learned recipe mastery');
assert.strictEqual(rebuiltState.editorUnlocked, true, 'rebuilding should preserve the permanent layout-editor unlock');
assert.strictEqual(rebuiltState.tutorial.completed, true, 'rebuilding should not replay the first-shop tutorial');
assert.strictEqual(api.collectBasicEquipment(rebuiltState).length, 7, 'a rebuilt Blacksmith should receive all seven basic facilities');
assert.strictEqual(context.aiPet.blacksmithBusinessRebuildPending, false, 'the rebuild marker should be consumed by the replacement building');
assert(!source.includes('alert(') && !source.includes('confirm('), 'Blacksmith flows should use game-styled dialogs instead of browser alerts');
const tacticSource = source.slice(source.indexOf('function renderBlacksmithTacticEditor'), source.indexOf('function productionPriorityOptions'));
assert(!tacticSource.includes('<select'), 'AI Mind should use game-styled choice cards rather than native dropdowns');
assert(source.includes('blacksmithEditorSpriteHtml'), 'the player layout editor should render the real Blacksmith map-chip crops');
assert(source.includes('serviceLayout: normalizeServiceLayout(state.serviceLayout)'), 'the player editor should use a working copy of AI/customer reference positions');
assert(source.includes('window.selectBlacksmithEditorMarker'), 'the player editor should expose movable service markers');
assert(source.includes("automaticWallCells(floor)"), 'outer walls should be derived from the current floor shape');

state.level = 4;
state.exp = 400;
const floorTilesBeforeExpansion = api.floorTileCount(state.floors.find(floor => floor.id === '1f'));
api.applyLevelUps(state);
assert.strictEqual(state.level, 5, 'Lv5 should be reached at the provisional threshold');
assert.strictEqual(state.editorUnlocked, true, 'Lv5 should permanently unlock layout editing');
assert.strictEqual(context.aiPet.blacksmithLayoutEditorUnlocked, true, 'editor unlock should be AI-save-owned');
const expandedMainFloor = state.floors.find(floor => floor.id === '1f');
assert.strictEqual(expandedMainFloor.width, 17, 'Lv5 should actually expand the first floor by five columns');
assert.strictEqual(api.floorTileCount(expandedMainFloor), floorTilesBeforeExpansion + 40, 'Lv5 expansion should grant forty additional floor cells');
assert.strictEqual(expandedMainFloor.expansionZones[0].id, 'level5', 'the editor should retain the authored Lv5 expansion region for highlighting');

const derivedWallFloor = JSON.parse(JSON.stringify(expandedMainFloor));
derivedWallFloor.grid[4][10] = 1;
derivedWallFloor.grid[4][16] = 0;
const derivedWalls = api.automaticWallCells(derivedWallFloor);
assert(derivedWalls.has('10,4'), 'removing a floor cell should automatically create a wall along the new floor edge');
assert(derivedWalls.has('17,4'), 'moving floor to the map edge should automatically create an outside wall instead of leaving a hole');
assert(!derivedWalls.has('4,10'), 'the outward side of the three-cell entrance should remain open');

const blockedQueueFloors = JSON.parse(JSON.stringify(state.floors));
blockedQueueFloors.find(floor => floor.id === '1f').grid[3][6] = 1;
const fixedServiceLayout = JSON.parse(JSON.stringify(state.serviceLayout));
assert(Array.from(context.validateBlacksmithLayout(blockedQueueFloors, fixedServiceLayout)).some(error => error.includes('お客様の列1番')), 'a blocked saved queue marker should still prevent saving');
fixedServiceLayout.queue[0] = { x: 12, y: 3, dir: 'up', floorId: '1f' };
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(blockedQueueFloors, fixedServiceLayout)), [], 'moving the queue marker in the player editor should resolve its validation error');

state.isOpen = false;
state.work = null;
state.service = null;
state.customers = [];
context.BLACKSMITH_STATE = state;
context.openBlacksmithEditor();
context.selectBlacksmithEditorMarker('queue_0');
context.handleBlacksmithEditorCell(12, 3);
context.setBlacksmithEditorMarkerDirection('queue_0', 'right');
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.BLACKSMITH_EDITOR.serviceLayout.queue[0])), { x: 12, y: 3, dir: 'right', floorId: '1f' }, 'the player editor should move and turn the first customer queue marker');
const editorFloorCount = api.floorTileCount(context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '1f'));
context.setBlacksmithEditorTool('floor');
context.handleBlacksmithEditorCell(13, 4);
context.handleBlacksmithEditorCell(16, 4);
assert.strictEqual(api.floorTileCount(context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '1f')), editorFloorCount, 'moving floor should preserve the owned floor-tile count');
assert(api.automaticWallCells(context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '1f')).has('17,4'), 'the editor should regenerate an outside wall after moving floor to the edge');
context.saveBlacksmithEditor();
assert.strictEqual(state.serviceLayout.queue[0].dir, 'right', 'saving the editor should persist the selected queue facing');
assert.notDeepStrictEqual(JSON.parse(JSON.stringify(state.serviceLayout.queue[0])), { x: 6, y: 3, dir: 'up', floorId: '1f' }, 'save-time blank-margin normalization should preserve the moved queue location instead of restoring its initial point');

state.level = 23;
api.ensureLevelFloors(state);
assert(state.floors.some(floor => floor.id === '2f'), 'Lv10 floor should exist');
assert(state.floors.some(floor => floor.id === 'b1f'), 'Lv23 basement should exist');
const mainFloor = state.floors.find(floor => floor.id === '1f');
assert(mainFloor.objects.some(object => object.type === 'stairs_up'), 'main floor should connect to 2F');
assert(mainFloor.objects.some(object => object.type === 'stairs_down'), 'main floor should connect to B1F');
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(state.floors)), [], 'unlocked default layout should validate');

state.isOpen = false;
state.work = null;
state.service = null;
state.opening = null;
state.floorMove = null;
state.customers = [];
state.activeFloorId = '1f';
context.BLACKSMITH_STATE = state;
context.openBlacksmithEditor();
const editorMainFloor = context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '1f');
const editorUpperFloor = context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '2f');
const editorMainUpStairs = editorMainFloor.objects.find(object => object.type === 'stairs_up');
const editorUpperDownStairs = editorUpperFloor.objects.find(object => object.type === 'stairs_down');
const diagnosticFloors = JSON.parse(JSON.stringify(context.BLACKSMITH_EDITOR.floors));
const diagnosticBasementStairs = diagnosticFloors.find(floor => floor.id === 'b1f').objects.find(object => object.type === 'stairs_up');
diagnosticBasementStairs.x = 7;
diagnosticBasementStairs.y = 5;
const detailedStairErrors = Array.from(context.validateBlacksmithLayout(diagnosticFloors, context.BLACKSMITH_EDITOR.serviceLayout));
assert(detailedStairErrors.some(error => error.includes('地下1階の上り階段（位置 7, 5）') && error.includes('進入・退出マス (7, 8)') && error.includes('そのマスを床にするか、階段を移動してください')), 'stair validation should identify the exact missing access cell and explain how to fix it');
assert(!detailedStairErrors.some(error => error.includes('1階と地下1階を結ぶ階段の接続設定')), 'an invalid access cell should not cascade into a misleading missing-connection error');
const upperPositionBeforeMainMove = { x: editorUpperDownStairs.x, y: editorUpperDownStairs.y };
context.selectBlacksmithEditorObject(editorMainUpStairs.id);
context.handleBlacksmithEditorCell(12, 5);
assert.deepStrictEqual({ x: editorMainUpStairs.x, y: editorMainUpStairs.y }, { x: 12, y: 5 }, 'the five-cell upward staircase should move as one editor object');
assert.deepStrictEqual(
    { x: editorUpperDownStairs.x, y: editorUpperDownStairs.y },
    upperPositionBeforeMainMove,
    'moving the 1F staircase should not move its paired 2F staircase'
);
const mainPositionBeforeUpperMove = { x: editorMainUpStairs.x, y: editorMainUpStairs.y };
context.changeBlacksmithEditorFloor('2f');
context.selectBlacksmithEditorObject(editorUpperDownStairs.id);
const upperPositionBeforeRejectedMove = { x: editorUpperDownStairs.x, y: editorUpperDownStairs.y };
context.handleBlacksmithEditorCell(3, 6);
assert.deepStrictEqual({ x: editorUpperDownStairs.x, y: editorUpperDownStairs.y }, upperPositionBeforeRejectedMove, 'the editor should reject a stair position whose exit cell has no floor');
assert(context.BLACKSMITH_EDITOR.message.includes('退出マス (3, 8)') && context.BLACKSMITH_EDITOR.message.includes('そのマスを床にするか、階段を移動してください'), 'a rejected stair move should show its exact invalid cell and recovery action immediately');
context.handleBlacksmithEditorCell(3, 3);
assert.deepStrictEqual({ x: editorUpperDownStairs.x, y: editorUpperDownStairs.y }, { x: 3, y: 3 }, 'the four-cell upper-floor staircase should move independently as one editor object');
assert.deepStrictEqual(
    { x: editorMainUpStairs.x, y: editorMainUpStairs.y },
    mainPositionBeforeUpperMove,
    'moving the 2F staircase should not move its paired 1F staircase'
);
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(context.BLACKSMITH_EDITOR.floors, context.BLACKSMITH_EDITOR.serviceLayout)), [], 'independently moved stair pairs should remain a valid connected layout');
context.setBlacksmithEditorTool('floor');
context.handleBlacksmithEditorCell(3, 2);
assert.strictEqual(context.BLACKSMITH_EDITOR.selectedFloorCell, null, 'a floor cell required as a stair approach should not be removable');
assert(context.BLACKSMITH_EDITOR.message.includes('下り階段の進入マス (3, 2)') && context.BLACKSMITH_EDITOR.message.includes('先に階段を別の有効な位置へ移動してください'), 'floor editing should explain why a stair access cell must remain and how to free it');
context.BLACKSMITH_EDITOR = null;

const crossFloorEditorBuilding = { type: 'blacksmith' };
const crossFloorEditorState = api.normalizeState(crossFloorEditorBuilding);
crossFloorEditorState.tutorial.completed = true;
crossFloorEditorState.level = 23;
crossFloorEditorState.editorUnlocked = true;
api.ensureBasicEquipment(crossFloorEditorState);
api.ensureLevelFloors(crossFloorEditorState);
context.BLACKSMITH_STATE = crossFloorEditorState;
context.openBlacksmithEditor();
context.selectBlacksmithEditorObject('material');
context.changeBlacksmithEditorFloor('2f');
context.handleBlacksmithEditorCell(2, 2);
assert(!context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '1f').objects.some(object => object.id === 'material'), 'an installed facility should be removable from its source floor through the editor');
assert(context.BLACKSMITH_EDITOR.floors.find(floor => floor.id === '2f').objects.some(object => object.id === 'material'), 'an installed facility should be placeable on another floor without using storage');
context.selectBlacksmithEditorMarker('ai_standby');
context.changeBlacksmithEditorFloor('2f');
context.handleBlacksmithEditorCell(3, 2);
assert.strictEqual(context.BLACKSMITH_EDITOR.serviceLayout.aiStandby.floorId, '2f', 'the AI standby marker should be movable across floor tabs');
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(context.BLACKSMITH_EDITOR.floors, context.BLACKSMITH_EDITOR.serviceLayout)), [], 'a reachable upper-floor facility and service marker should be saveable');
context.saveBlacksmithEditor();
assert.strictEqual(crossFloorEditorState.serviceLayout.aiStandby.floorId, '2f', 'saving should retain the service marker floor');
assert(crossFloorEditorState.floors.find(floor => floor.id === '2f').objects.some(object => object.type === 'material'), 'saving should retain the facility on its destination floor');
assert.strictEqual(crossFloorEditorState.player.floorId, '2f', 'after saving, the AI should resume at its configured standby floor');
context.openBlacksmithEditor();
context.changeBlacksmithEditorFloor('2f');
context.resetBlacksmithEditorFloor();
assert(context.BLACKSMITH_EDITOR.unplacedEquipment.some(object => object.type === 'material'), 'resetting an extra floor should return its facilities to unplaced equipment instead of deleting them');
context.BLACKSMITH_EDITOR = null;

const crossFloorBusinessBuilding = { type: 'blacksmith' };
const crossFloorBusinessState = api.normalizeState(crossFloorBusinessBuilding);
crossFloorBusinessState.tutorial.completed = true;
crossFloorBusinessState.level = 23;
api.ensureBasicEquipment(crossFloorBusinessState);
api.ensureLevelFloors(crossFloorBusinessState);
const relocateEquipment = (type, floorId, x, y) => {
    const sourceFloor = crossFloorBusinessState.floors.find(floor => floor.objects.some(object => object.type === type));
    const object = sourceFloor.objects.find(candidate => candidate.type === type);
    sourceFloor.objects = sourceFloor.objects.filter(candidate => candidate !== object);
    crossFloorBusinessState.floors.find(floor => floor.id === floorId).objects.push({ ...object, x, y });
};
relocateEquipment('material', '2f', 2, 2);
relocateEquipment('cooling', 'b1f', 2, 2);
relocateEquipment('shelf_weapon', '2f', 3, 3);
assert.deepStrictEqual(Array.from(context.validateBlacksmithLayout(crossFloorBusinessState.floors, crossFloorBusinessState.serviceLayout)), [], 'production equipment split across connected floors should validate');
context.aiPet.inventory = [
    { id: 'iron' }, { id: 'iron' }, { id: 'iron' }, { id: 'iron' }, { id: 'iron' },
    { id: 'wood' }, { id: 'wood' }
];
context.BLACKSMITH_STATE = crossFloorBusinessState;
const floorFadeEvents = [];
context.BLACKSMITH_FLOOR_FADE_HOOK = phase => floorFadeEvents.push(phase);
assert(api.startPreparation(crossFloorBusinessState, 'eq_sword', true), 'preparation should start when required stations are split across connected floors');
assert(crossFloorBusinessState.player.path.some(step => step.floorTransition), 'the production route should include a stair transition to the first remote station');
for (let step = 0; step < 320 && crossFloorBusinessState.work; step += 1) api.tickPreparation(crossFloorBusinessState);
assert.strictEqual(crossFloorBusinessState.work, null, 'multi-floor preparation should complete instead of stalling at a staircase');
assert.strictEqual(crossFloorBusinessState.stock.eq_sword, 1, 'multi-floor preparation should place the completed item on its remote shelf');
assert(floorFadeEvents.filter(phase => phase === 'out').length >= 3, 'each AI floor transition in the production route should begin a fade');

crossFloorBusinessState.player = { ...crossFloorBusinessState.serviceLayout.aiStandby, path: [] };
crossFloorBusinessState.activeFloorId = crossFloorBusinessState.player.floorId;
crossFloorBusinessState.isOpen = true;
crossFloorBusinessState.tactics = [];
floorFadeEvents.length = 0;
assert(api.spawnCustomer(crossFloorBusinessState, 'eq_sword', true), 'a customer should enter for an item displayed on another floor');
const crossFloorCustomer = crossFloorBusinessState.customers[0];
assert(crossFloorCustomer.path.some(step => step.floorTransition && step.floorId === '2f'), 'the customer should walk upstairs to inspect the remote shelf');
for (let step = 0; step < 180 && crossFloorCustomer.status !== 'waiting_checkout'; step += 1) api.tickCustomers(crossFloorBusinessState);
assert.strictEqual(crossFloorCustomer.status, 'waiting_checkout', 'the customer should return through the stairs to the configured checkout queue');
assert.deepStrictEqual(floorFadeEvents, [], 'customer floor transitions must not darken the camera');
crossFloorBusinessState.tactics = [{ condition: 'customer_waiting', action: 'serve', enabled: true }];
for (let step = 0; step < 240 && crossFloorBusinessState.customers.length; step += 1) {
    api.tickCustomers(crossFloorBusinessState);
    api.tickService(crossFloorBusinessState);
}
assert.strictEqual(crossFloorBusinessState.customers.length, 0, 'the AI should retrieve the remote item, complete checkout, and let the customer leave');
assert(floorFadeEvents.some(phase => phase === 'out'), 'the AI trip to another floor during service should darken the camera');
delete context.BLACKSMITH_FLOOR_FADE_HOOK;

const debugRouteBuilding = { type: 'blacksmith' };
const debugRouteState = api.normalizeState(debugRouteBuilding);
debugRouteState.tutorial.completed = true;
api.ensureBasicEquipment(debugRouteState);
context.currentBlacksmithBuilding = debugRouteBuilding;
context.BLACKSMITH_STATE = debugRouteState;
context.aiPet.inventory = [{ id: 'souvenir' }];
context.aiPet.gold = 321;
api.normalizeState(debugRouteBuilding);
const debugRouteBaseline = JSON.stringify(debugRouteBuilding.blacksmithBusiness);
assert(context.startDebugBlacksmithRouteTest('preparation'), 'the integrated Debug action should start a production route test');
for (let step = 0; step < 180 && context.BLACKSMITH_ROUTE_TEST; step += 1) api.tickPreparation(context.BLACKSMITH_ROUTE_TEST.state);
assert.strictEqual(context.BLACKSMITH_ROUTE_TEST, null, 'the production route test should restore itself after completion');
assert.strictEqual(JSON.stringify(debugRouteBuilding.blacksmithBusiness), debugRouteBaseline, 'the production route test must restore the complete Blacksmith business state');
assert.deepStrictEqual(Array.from(context.aiPet.inventory, item => item.id), ['souvenir'], 'the production route test must restore the AI inventory');
assert.strictEqual(context.aiPet.gold, 321, 'the production route test must not change AI Gold');
context.currentBlacksmithBuilding = debugRouteBuilding;
context.BLACKSMITH_STATE = debugRouteBuilding.blacksmithBusiness;
assert(context.startDebugBlacksmithRouteTest('sale'), 'the integrated Debug action should start a sales route test');
for (let step = 0; step < 240 && context.BLACKSMITH_ROUTE_TEST; step += 1) {
    api.tickCustomers(context.BLACKSMITH_ROUTE_TEST.state);
    if (context.BLACKSMITH_ROUTE_TEST) api.tickService(context.BLACKSMITH_ROUTE_TEST.state);
}
assert.strictEqual(context.BLACKSMITH_ROUTE_TEST, null, 'the sales route test should restore itself after the customer exits');
assert.strictEqual(JSON.stringify(debugRouteBuilding.blacksmithBusiness), debugRouteBaseline, 'the sales route test must restore stock, sales, reputation, and the complete business state');
assert.deepStrictEqual(Array.from(context.aiPet.inventory, item => item.id), ['souvenir'], 'the sales route test must preserve the AI inventory');
assert.strictEqual(context.aiPet.gold, 321, 'the sales route test must restore AI Gold');
assert(indexSource.includes("window.startDebugBlacksmithRouteTest('preparation')"), 'integrated Debug should expose the production route test');
assert(indexSource.includes("window.startDebugBlacksmithRouteTest('sale')"), 'integrated Debug should expose the sales route test');

assert(api.isSmithMastered(context.aiPet), 'mastered blacksmith should pass entry gate');
assert(api.isSmithBuilding({ type: 'blacksmith', name: '鍛冶屋' }), 'owned blacksmith should use the business map');
assert.strictEqual(api.isSmithBuilding({ type: 'blacksmith', name: '鍛冶師のキャンプ' }), false, 'master camp must not be treated as the owned business');
assert.strictEqual(api.isSmithBuilding({ type: 'blacksmith', name: '師匠のキャンプ' }), false, 'legacy master camp must not be treated as the owned business');

context.aiPet.inventory = [];
const tutorialState = api.normalizeState({ type: 'blacksmith' });
context.BLACKSMITH_STATE = tutorialState;
assert.deepStrictEqual(Array.from(tutorialState.floors[0].objects), [], 'the tutorial map should remain empty before the Blacksmith begins placing equipment');
api.beginBlacksmithTutorialArrival(tutorialState, true);
const tutorialEntrance = tutorialState.floors[0].entrance[Math.floor(tutorialState.floors[0].entrance.length / 2)];
assert.strictEqual(tutorialState.player.x, tutorialEntrance.x + 1, 'the AI clerk should start on the right entrance tile');
assert.strictEqual(tutorialState.player.y, tutorialEntrance.y, 'the AI clerk should visibly start at the entrance');
assert.strictEqual(tutorialState.tutorial.master.x, tutorialEntrance.x - 1, 'the Blacksmith should use the adjacent entrance tile');
assert.strictEqual(tutorialState.tutorial.master.y, tutorialEntrance.y, 'the Blacksmith should visibly start at the entrance');
api.tickBlacksmithTutorial(tutorialState);
api.tickBlacksmithTutorial(tutorialState);
assert.strictEqual(tutorialState.player.y, tutorialEntrance.y, 'the AI clerk should pause at the entrance before entering');
assert.strictEqual(tutorialState.tutorial.master.y, tutorialEntrance.y, 'the Blacksmith should pause at the entrance before entering');
const masterEntranceY = tutorialState.tutorial.master.y;
api.tickBlacksmithTutorial(tutorialState);
api.tickBlacksmithTutorial(tutorialState);
assert.strictEqual(tutorialState.player.x, 6, 'the AI clerk should stop at the authored conversation position');
assert.strictEqual(tutorialState.player.y, 8);
assert.strictEqual(tutorialState.player.dir, 'left', 'the AI clerk should turn toward the Blacksmith before speaking');
assert.strictEqual(tutorialState.tutorial.master.x, 4, 'the Blacksmith should stop at the authored conversation position');
assert.strictEqual(tutorialState.tutorial.master.y, 8);
assert.strictEqual(tutorialState.tutorial.master.dir, 'right', 'the Blacksmith should turn toward the AI clerk before speaking');
assert(tutorialState.tutorial.master.y < masterEntranceY, 'the Blacksmith should enter from the shop entrance before speaking');
const followState = api.normalizeState({ type: 'blacksmith' });
api.ensureBasicEquipment(followState);
followState.tutorial.masterVisible = true;
followState.tutorial.phase = 'crafting';
followState.player = { floorId: '1f', x: 9, y: 3, dir: 'left', path: [] };
followState.tutorial.master = { floorId: '1f', x: 2, y: 8, dir: 'right', path: [] };
for (let i = 0; i < 40; i += 1) api.tickTutorialMasterFollow(followState);
assert(
    Math.abs(followState.tutorial.master.x - followState.player.x) + Math.abs(followState.tutorial.master.y - followState.player.y) <= 3,
    'the tutorial Blacksmith should follow the AI closely enough to remain visible during crafting and sales'
);
const equipmentRules = [
    ['missing_material', 'material'],
    ['missing_furnace', 'furnace'],
    ['missing_anvil', 'anvil'],
    ['missing_cooling', 'cooling'],
    ['missing_shelf_weapon', 'shelf_weapon'],
    ['missing_shelf_goods', 'shelf_goods'],
    ['missing_shelf_armor', 'shelf_armor']
];
equipmentRules.forEach(([condition, type], index) => {
    for (let i = 0; i < 80 && tutorialState.tutorial.phase !== 'equipment_rule'; i += 1) api.tickBlacksmithTutorial(tutorialState);
    assert.strictEqual(tutorialState.tutorial.phase, 'equipment_rule', `equipment ${index + 1} should stop at its AI-mind task`);
    assert.strictEqual(tutorialState.floors[0].objects.some(object => object.type === type), false, `${type} must remain absent until its rule is saved`);
    assert(api.applyTutorialTactic(tutorialState, condition, 'layout'), `${condition} -> かえる should place the requested equipment`);
    assert.strictEqual(tutorialState.floors[0].objects.some(object => object.type === type), true, `${type} should appear only after its AI-mind rule`);
});
for (let i = 0; i < 80 && tutorialState.tutorial.phase !== 'craft_rule'; i += 1) api.tickBlacksmithTutorial(tutorialState);
assert.strictEqual(tutorialState.tutorial.phase, 'craft_rule', 'the in-map conversation should lead to the crafting AI-mind task');
assert.deepStrictEqual(
    Array.from(tutorialState.floors[0].objects, object => object.type).sort(),
    ['anvil', 'cooling', 'furnace', 'material', 'shelf_armor', 'shelf_goods', 'shelf_weapon'],
    'the Blacksmith should place all seven basic facilities through their AI-mind tasks before the crafting task'
);
const equipmentDialogue = tutorialState.logs.map(entry => entry.text).join('\n');
assert(equipmentDialogue.indexOf('素材置き場がない時') < equipmentDialogue.indexOf('炉がない時'), 'the material-station rule should be taught before the furnace rule');
assert(equipmentDialogue.indexOf('炉がない時') < equipmentDialogue.indexOf('金床がない時'), 'the furnace rule should be taught before the anvil rule');
assert(equipmentDialogue.indexOf('金床がない時') < equipmentDialogue.indexOf('冷却・水場がない時'), 'the anvil rule should be taught before the cooling rule');
assert(equipmentDialogue.indexOf('店の様子と、その時にする仕事') < equipmentDialogue.indexOf('AIマインド'), 'the tutorial should explain the idea before naming AI Mind');
equipmentRules.forEach(([condition]) => assert(api.hasTactic(tutorialState, condition, 'layout'), `${condition} -> かえる should remain in the tutorial plan`));
assert(context.aiPet.apprentice.learnedWords.includes('つくる'), 'the Blacksmith should teach the crafting command through conversation');
assert(api.applyTutorialTactic(tutorialState, 'can_prepare', 'prepare'), 'the required crafting rule should start the real preparation demo');
assert.strictEqual(tutorialState.tutorial.phase, 'crafting', 'the configured crafting rule should start a real preparation route');
for (let i = 0; i < 80 && tutorialState.work; i += 1) api.tickPreparation(tutorialState);
assert.strictEqual(tutorialState.tutorial.phase, 'sales_rule', 'completed tutorial product should begin the sales AI-mind lesson');
assert(context.aiPet.apprentice.learnedWords.includes('うる'), 'the Blacksmith should teach the sales command through conversation');
assert(api.applyTutorialTactic(tutorialState, 'customer_waiting', 'serve'), 'the required sales rule should start the real customer demo');
assert.strictEqual(tutorialState.tutorial.phase, 'sales', 'the configured sales rule should open the tutorial shop');
for (let i = 0; i < 80 && tutorialState.opening; i += 1) api.tickBlacksmithOpening(tutorialState);
assert.strictEqual(tutorialState.customers.length, 1, 'tutorial should spawn one real customer');
for (let i = 0; i < 180 && tutorialState.tutorial.phase !== 'shop_naming'; i += 1) {
    api.tickCustomers(tutorialState);
    api.tickService(tutorialState);
    api.tickBlacksmithTutorial(tutorialState);
}
assert.strictEqual(tutorialState.tutorial.phase, 'shop_naming', 'the tutorial should ask for the shop name before the Blacksmith leaves');
assert(api.completeBlacksmithShopNaming(tutorialState, 'テスト鍛冶店'));
for (let i = 0; i < 80 && !tutorialState.tutorial.completed; i += 1) api.tickBlacksmithTutorial(tutorialState);
assert.strictEqual(tutorialState.tutorial.completed, true, 'tutorial should finish only after checkout and entrance exit');
assert.strictEqual(tutorialState.shopName, 'テスト鍛冶店', 'the chosen player-created shop name should be stored');
assert.strictEqual(tutorialState.tutorial.masterVisible, false, 'master should leave after the full tutorial');
assert(api.hasTactic(tutorialState, 'can_prepare', 'prepare'), 'the crafting rule should remain in the Blacksmith AI mind');
assert(api.hasTactic(tutorialState, 'customer_waiting', 'serve'), 'the sales rule should remain in the Blacksmith AI mind');
assert(tutorialState.logs.some(entry => entry.speaker === (context.aiPet.name || 'AI店員')), 'the tutorial should contain AI-character replies, not only master explanations');
assert(!source.includes('function openTutorialDialog'), 'the old explanation-modal tutorial should be removed');

const legacyTutorialBuilding = { type: 'blacksmith', blacksmithBusiness: JSON.parse(JSON.stringify(tutorialState)) };
legacyTutorialBuilding.blacksmithBusiness.tutorial = { completed: true, phase: 'completed', masterVisible: false };
context.aiPet.blacksmithTutorialCompleted = true;
const migratedTutorialState = api.normalizeState(legacyTutorialBuilding);
assert.strictEqual(migratedTutorialState.tutorial.version, 4, 'older conversation tutorials should migrate to the AI-mind equipment tutorial');
assert.strictEqual(migratedTutorialState.tutorial.completed, false, 'legacy modal tutorial completion should not skip the replacement tutorial');
assert.strictEqual(migratedTutorialState.tutorial.phase, 'arrival', 'the replacement tutorial should restart from the Blacksmith visit');
assert.strictEqual(api.collectBasicEquipment(migratedTutorialState).length, 0, 'migrated tutorials should also restart from an empty visible shop');
assert.strictEqual(migratedTutorialState.tutorial.layoutBackup.length, 7, 'the completed legacy layout should be protected while the replacement tutorial runs');
assert.strictEqual(context.aiPet.blacksmithTutorialCompleted, false, 'the AI-level completion flag should also reset for the replacement tutorial');

const interruptedMigrationBuilding = { type: 'blacksmith' };
const interruptedMigrationState = api.normalizeState(interruptedMigrationBuilding);
interruptedMigrationState.floors[0].objects = [{ id: 'furnace', type: 'furnace', x: 4, y: 2, locked: false }];
interruptedMigrationState.tutorial = {
    version: 3,
    completed: false,
    phase: 'equipment_dialogue',
    equipmentStep: 1,
    layoutPrepared: true,
    layoutBackup: [{ floorId: '1f', object: { id: 'material', type: 'material', x: 3, y: 4, locked: false } }]
};
const migratedInterruptedState = api.normalizeState(interruptedMigrationBuilding);
assert.strictEqual(migratedInterruptedState.tutorial.version, 4, 'an interrupted version-3 tutorial should restart on the new rule-driven flow');
assert(migratedInterruptedState.tutorial.layoutBackup.some(entry => entry.object.type === 'material' && entry.object.x === 3 && entry.object.y === 4), 'migration must preserve the original layout backup from an interrupted tutorial');
assert.strictEqual(api.collectBasicEquipment(migratedInterruptedState).length, 0, 'partial version-3 tutorial equipment should be hidden during the new replay');

const resetBuilding = { type: 'blacksmith' };
const resetState = api.normalizeState(resetBuilding);
resetState.level = 12;
resetState.money = 4321;
resetState.stock.eq_sword = 3;
resetState.recipes.eq_sword = { discovered: true, mastery: 100 };
resetState.tutorial.completed = true;
resetState.tutorial.layoutPrepared = false;
resetState.tutorial.layoutBackup = null;
api.ensureBasicEquipment(resetState);
resetState.floors[0].objects.find(object => object.type === 'material').x = 3;
resetState.floors[0].objects.find(object => object.type === 'material').y = 4;
resetState.tutorial.phase = 'sales';
resetState.tactics = api.defaultTactics();
resetState.work = { recipeId: 'eq_sword', tutorialForced: true };
resetState.service = { customerId: 1, productId: 'eq_sword' };
resetState.customers = [{ id: 1, tutorial: true }];
resetState.isOpen = true;
context.aiPet.blacksmithTutorialCompleted = true;
context.aiPet.apprentice.learnedWords = ['つくる', 'うる', '別の言葉'];
context.currentBlacksmithBuilding = resetBuilding;
context.BLACKSMITH_STATE = resetState;
assert.strictEqual(context.resetBlacksmithTutorialState(), true, 'the F12 helper should reset the owned blacksmith tutorial');
assert.strictEqual(resetState.tutorial.phase, 'arrival', 'the reset tutorial should restart before the Blacksmith enters');
assert.strictEqual(resetState.tutorial.completed, false);
assert.strictEqual(resetState.work, null, 'an interrupted tutorial crafting demo should be cleared');
assert.strictEqual(resetState.service, null, 'an interrupted tutorial sale should be cleared');
assert.deepStrictEqual(Array.from(resetState.customers), [], 'tutorial customers should be cleared');
assert.deepStrictEqual(Array.from(resetState.tactics), [], 'partially configured tutorial tactics should be cleared');
assert.strictEqual(resetState.level, 12, 'business level should survive a tutorial-only reset');
assert.strictEqual(resetState.money, 4321, 'business earnings should survive a tutorial-only reset');
assert.strictEqual(resetState.stock.eq_sword, 3, 'shelf stock should survive a tutorial-only reset');
assert.strictEqual(resetState.recipes.eq_sword.mastery, 100, 'recipe progress should survive a tutorial-only reset');
assert.strictEqual(api.collectBasicEquipment(resetState).length, 0, 'the reset helper should visibly clear equipment for the staged tutorial');
assert(resetState.tutorial.layoutBackup.some(entry => entry.object.type === 'material' && entry.object.x === 3 && entry.object.y === 4), 'the reset helper should protect the authored equipment coordinates');
api.restoreBlacksmithTutorialLayout(resetState);
const restoredMaterial = resetState.floors[0].objects.find(object => object.type === 'material');
assert.deepStrictEqual({ x: restoredMaterial.x, y: restoredMaterial.y }, { x: 3, y: 4 }, 'the original layout should be restored after a tutorial-only replay');
assert.deepStrictEqual(Array.from(context.aiPet.apprentice.learnedWords), ['別の言葉'], 'only the two tutorial commands should be relearned');
assert(saveCount > 0, 'state transitions should request persistence');
console.log('blacksmith business tests passed');
