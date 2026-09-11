const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'facility_template_editor.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const viewRendererSource = fs.readFileSync(path.join(root, 'view_renderer.js'), 'utf8');

const windowObject = {
    addEventListener() {},
    MYHOME_SPRITES: {
        hmap_floor: {}, hmap_wall: {}, hfur_warehouse: {}, hfur_safe: {}, hfur_freezer: {}, hfur_dresser: {}, hfur_bed: {},
        hfur_strategy_board: {}, hfur_table_tl: {}, hfur_table_tc: {}, hfur_table_tr: {}, hfur_table_bl: {}, hfur_table_bc: {}, hfur_table_br: {},
        hfur_chair_left: {}, hfur_chair_right: {}, hfur_plant: {}, hfur_candle: {}
    },
    SHOP_SPRITES: {
        rmap_floor: {}, rmap_wall: {}, rmap_kitchen_floor: {}, rfur_chair_down: {}, rfur_chair_up: {}, rfur_chair_left: {}, rfur_chair_right: {},
        rfur_register_center: {}, rkit_fridge: {}, rkit_oven: {}, rkit_stove_left: {}, rmap_stairs_up_tl: {}, rmap_stairs_dw_tl: {}
    },
    BLACKSMITH_SPRITES: {},
    CASTLE_SPRITES: {},
    CASINO_SPRITES: {},
    DUNGEON_SPRITES: {}
};
const context = vm.createContext({ window: windowObject, console, setTimeout, clearTimeout, Blob: function Blob() {}, URL: {} });
vm.runInContext(source, context, { filename: 'facility_template_editor.js' });

const api = windowObject.__FACILITY_TEMPLATE_EDITOR_TEST_API;
assert(api, 'test API should be exposed');
assert.strictEqual(api.schemaVersion, 1, 'schema version should be stable');
const wideEquipment = { iw: 2760, ih: 1504, sx: 147, sy: 971, sw: 1288, sh: 541, scale: 1 };
const widePreview = api.spriteImageLayout(wideEquipment, 44, 44, 'preview');
assert.strictEqual(widePreview.cropW, 44, 'palette previews should contain the full width of wide crops');
assert(widePreview.cropH < 44 && widePreview.top > 0, 'wide palette previews should preserve aspect ratio and align to the bottom');
const tallEquipment = { iw: 2816, ih: 1536, sx: 21, sy: 80, sw: 960, sh: 1452, scale: 1 };
const tallPreview = api.spriteImageLayout(tallEquipment, 44, 44, 'preview');
assert.strictEqual(tallPreview.cropH, 44, 'palette previews should contain the full height of tall crops');
const tallMapObject = api.spriteImageLayout(tallEquipment, 44, 44, 'object');
assert.strictEqual(tallMapObject.cropW, 44, 'placed equipment should use the full width of its selected cell');
assert(tallMapObject.top < 0, 'placed tall equipment should extend upward from its foot cell');
const tileLayout = api.spriteImageLayout({ iw: 2816, ih: 1536, sx: 137, sy: 764, sw: 291, sh: 265, scale: 1 }, 44, 44, 'tile');
assert.strictEqual(tileLayout.cropW, 44, 'floor crops should fill the complete cell width');
assert.strictEqual(tileLayout.cropH, 44, 'floor crops should fill the complete cell height');
const stairLayout = api.spriteImageLayout({ iw: 2816, ih: 1536, sx: 66, sy: 261, sw: 549, sh: 601, scale: 1, tileFill: true }, 44, 44, 'object');
assert.strictEqual(stairLayout.cropW, 44, 'stair parts should fill the complete cell width');
assert.strictEqual(stairLayout.cropH, 44, 'stair parts should fill the complete cell height');

const facilities = api.buildFacilityDefinitions();
assert.deepStrictEqual(Array.from(facilities, item => item.id), ['myhome', 'restaurant', 'blacksmith', 'castle', 'casino']);
assert.strictEqual(facilities.reduce((total, facility) => total + facility.stages.length, 0), 11, 'all eleven structural stages should be exposed');

const myHome = facilities.find(item => item.id === 'myhome').stages[0].template.floors[0];
assert.strictEqual(myHome.objects.find(item => item.id === 'safe').x, 7, 'My Home should mirror the actual new-state safe position');

const restaurant = facilities.find(item => item.id === 'restaurant');
assert.deepStrictEqual(Array.from(restaurant.stages, item => item.id), ['lv1', 'lv5', 'lv10', 'lv23']);
assert.strictEqual(restaurant.stages.find(item => item.id === 'lv10').template.floors.length, 2, 'restaurant Lv10 should expose two floors');
assert.strictEqual(restaurant.stages.find(item => item.id === 'lv23').template.floors.length, 3, 'restaurant Lv23 should expose the basement');

const blacksmith = facilities.find(item => item.id === 'blacksmith');
assert.deepStrictEqual(Array.from(blacksmith.stages, item => item.id), ['lv1', 'lv5', 'lv10', 'lv23']);
assert(blacksmith.tilePalette.some(item => item.code === 'floor|bmap_floor_luxury_b'), 'Blacksmith palette should expose the second luxury floor/wall theme');
assert(blacksmith.objectPalette.some(item => item.type === 'magic_furnace'), 'Blacksmith palette should expose advanced workshop equipment');
assert(blacksmith.objectPalette.some(item => item.type === 'shelf_royal'), 'Blacksmith palette should expose the royal replacement shelf');
assert.strictEqual(blacksmith.objectPalette.find(item => item.type === 'stairs_up').parts.length, 5, 'the Blacksmith palette should show all five upward-stair parts');
assert.strictEqual(blacksmith.objectPalette.find(item => item.type === 'stairs_down').parts.length, 4, 'the Blacksmith palette should show all four downward-stair parts');
const blacksmithInitial = blacksmith.stages[0].template.floors[0];
assert.deepStrictEqual(Array.from(blacksmithInitial.objects), [], 'Blacksmith Lv1 should be authored as an empty pre-tutorial shop');
assert.strictEqual(blacksmithInitial.markers.find(item => item.id === 'ai_entry').y, 9, 'AI clerk should be authored on the entrance row');
assert.strictEqual(blacksmithInitial.markers.find(item => item.id === 'ai_entry').x, 6, 'AI clerk should enter from the right side before facing the Blacksmith');
assert.strictEqual(blacksmithInitial.markers.find(item => item.id === 'master_entry').y, 9, 'Blacksmith should be authored on the entrance row');
assert.strictEqual(blacksmithInitial.markers.find(item => item.id === 'master_entry').x, 4, 'Blacksmith should enter from the left side before facing the AI clerk');
const blacksmithExpanded = blacksmith.stages.find(item => item.id === 'lv5').template.floors[0];
assert.strictEqual(blacksmithExpanded.width, 17, 'Blacksmith Lv5 should add five columns to the first floor');
assert.deepStrictEqual(JSON.parse(JSON.stringify(blacksmithExpanded.expansionZones)), [{ id: 'level5', level: 5, x: 11, y: 1, width: 5, height: 8, addedFloorTiles: 40 }], 'the authored template should identify the forty newly added floor cells');
assert.deepStrictEqual(
    Array.from(blacksmithInitial.markers.filter(item => item.type === 'customer_queue'), item => [item.x, item.y, item.dir]),
    [[6, 3, 'up'], [6, 4, 'up'], [6, 5, 'up'], [6, 6, 'up'], [6, 7, 'up'], [6, 8, 'up']],
    'Blacksmith should expose an ordered six-place indoor customer queue independent of level'
);
assert.deepStrictEqual(
    { x: blacksmithInitial.markers.find(item => item.type === 'ai_standby').x, y: blacksmithInitial.markers.find(item => item.type === 'ai_standby').y, dir: blacksmithInitial.markers.find(item => item.type === 'ai_standby').dir },
    { x: 6, y: 1, dir: 'down' },
    'the AI standby marker should be exactly behind the anvil and face the customer side'
);
const blacksmithLv23 = blacksmith.stages.find(item => item.id === 'lv23').template;
const blacksmithLv23Main = blacksmithLv23.floors.find(floor => floor.id === '1f');
const blacksmithLv23Upper = blacksmithLv23.floors.find(floor => floor.id === '2f');
const blacksmithLv23Basement = blacksmithLv23.floors.find(floor => floor.id === 'b1f');
const authoredMainUp = blacksmithLv23Main.objects.find(item => item.type === 'stairs_up');
const authoredMainDown = blacksmithLv23Main.objects.find(item => item.type === 'stairs_down');
assert.deepStrictEqual({ x: authoredMainUp.x, y: authoredMainUp.y, targetFloorId: authoredMainUp.targetFloorId, parts: authoredMainUp.parts.length }, { x: 10, y: 4, targetFloorId: '2f', parts: 5 });
assert.deepStrictEqual({ x: authoredMainDown.x, y: authoredMainDown.y, targetFloorId: authoredMainDown.targetFloorId, parts: authoredMainDown.parts.length }, { x: 13, y: 6, targetFloorId: 'b1f', parts: 4 });
assert.strictEqual(blacksmithLv23Upper.objects.find(item => item.type === 'stairs_down').targetFloorId, '1f');
assert.deepStrictEqual(
    { x: blacksmithLv23Basement.objects.find(item => item.type === 'stairs_up').x, y: blacksmithLv23Basement.objects.find(item => item.type === 'stairs_up').y, targetFloorId: blacksmithLv23Basement.objects.find(item => item.type === 'stairs_up').targetFloorId },
    { x: 5, y: 2, targetFloorId: '1f' }
);
assert.strictEqual(api.sanitizeTemplate(blacksmithLv23).floors[0].objects.find(item => item.type === 'stairs_up').targetFloorId, '2f', 'template export should preserve the paired floor id');

const castle = facilities.find(item => item.id === 'castle').stages[0].template.floors[0];
assert.strictEqual(castle.width, 42);
assert.strictEqual(castle.height, 20);
assert.strictEqual(castle.markers.filter(item => item.type === 'castle_npc').length, 6, 'castle should expose all six NPC positions');

const casino = facilities.find(item => item.id === 'casino').stages[0].template.floors[0];
assert.strictEqual(casino.markers.filter(item => item.type === 'visitor_seat').length, 6, 'casino should expose all visitor candidate positions');

facilities.forEach(facility => facility.stages.forEach(stage => {
    assert.deepStrictEqual(Array.from(api.validateTemplate(stage.template)), [], `${facility.id}/${stage.id} should pass the common baseline validation`);
    const clean = api.sanitizeTemplate(stage.template);
    clean.floors.forEach(floor => {
        floor.objects.forEach(item => assert(!Object.prototype.hasOwnProperty.call(item, 'label'), 'export should omit localized object labels'));
        floor.markers.forEach(item => assert(!Object.prototype.hasOwnProperty.call(item, 'color'), 'export should omit display-only marker colors'));
    });
}));

assert(indexSource.includes('<script src="facility_template_editor.js"></script>'), 'index should load the editor after facility modules');
assert(indexSource.includes('window.openFacilityTemplateEditor()'), 'integrated Debug should expose the editor entry point');
assert(source.includes("localStorage.setItem(DRAFT_KEY"), 'drafts should be isolated in their own localStorage key');
assert(!source.includes('saveGameData('), 'template authoring must not write the normal game save');
assert(source.includes('[FACILITY_TEMPLATE_EDITOR_JSON]'), 'console export should use a recognizable marker');
assert(!source.includes('window.confirm(') && !source.includes('window.alert('), 'the common facility editor should use game-styled dialogs instead of browser dialogs');
assert(source.includes('fte-confirm-dialog'), 'destructive facility-editor actions should use the custom game-styled confirmation dialog');
assert(source.includes('class="fte-sprite-crop"'), 'each source crop should clip inside its own wrapper before it may overflow a map cell');
assert(source.includes("String(event.key || '').toLowerCase() === 'e'"), 'Ctrl+Shift+E console export should be wired');
assert(source.includes("anchor.download = all ? 'facility_templates_all.json'"), 'JSON file download should be available');
assert(viewRendererSource.includes("editingTarget === 'sasset'"), 'the AI adjust preview should recognize Blacksmith assets');
assert(viewRendererSource.includes("blacksmithSpriteKey.startsWith('bmap_')"), 'Blacksmith floor tiles should preview with independent full-cell axes');
assert(viewRendererSource.includes('target.tileFill === true'), 'Blacksmith stair crops should preview with independent full-cell axes');
assert(viewRendererSource.includes("scale * previewTile / Math.max(1, sw)"), 'Blacksmith equipment should preview at the same one-cell width used by the map');
assert(viewRendererSource.includes("'BLACKSMITH-ASSET'"), 'the adjustment overlay should identify the Blacksmith registry instead of the restaurant registry');

console.log('facility template editor tests passed');
