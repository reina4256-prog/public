// 鍛冶屋経営専用マップ。旧 shopData / smith_asset.png には依存しない。
(function () {
    'use strict';

    const MAP_W = 12;
    const MAP_H = 10;
    // レストラン経営と同じく、大きな論理マップを縮小表示してAI店員を追従する。
    const TILE = 250;
    const CAMERA_ZOOM = 0.4;
    const STATE_VERSION = 10;
    const TUTORIAL_VERSION = 4;
    const MAIN_FLOOR_ID = '1f';
    const ACTOR_MOVE_MS = 450;
    const FLOOR_FADE_MS = 220;
    const MAIN_FLOOR_BASE_WIDTH = 12;
    const MAIN_FLOOR_EXPANDED_WIDTH = 17;
    const MAIN_FLOOR_HEIGHT = 10;
    const LEVEL5_EXPANSION_START_X = 11;
    const REQUIRED_OBJECT_TYPES = ['material', 'furnace', 'anvil', 'cooling', 'shelf_weapon', 'shelf_goods', 'shelf_armor'];
    const EQUIPMENT_FAMILIES = Object.freeze({
        material: Object.freeze(['material', 'material_large']),
        furnace: Object.freeze(['furnace', 'magic_furnace']),
        anvil: Object.freeze(['anvil', 'master_anvil'])
    });
    const NORMAL_SHELF_TYPES = Object.freeze(['shelf_weapon', 'shelf_goods', 'shelf_armor']);
    // レストラン用画像と同じ切り分け・並びを使うが、挙動は鍛冶屋内で完結させる。
    // approach は通常床から階段へ入る直前、route は一マスずつ踏む順番、exit は接続先から出る通常床。
    const STAIR_LAYOUTS = Object.freeze({
        stairs_up: Object.freeze({
            width: 3,
            height: 3,
            parts: Object.freeze([
                Object.freeze({ dx: 0, dy: 0, sprite: 'bstairs_up_tl' }),
                Object.freeze({ dx: 1, dy: 0, sprite: 'bstairs_up_tr' }),
                Object.freeze({ dx: 2, dy: 0, sprite: 'bstairs_up_ml' }),
                Object.freeze({ dx: 0, dy: 1, sprite: 'bstairs_up_mr' }),
                Object.freeze({ dx: 0, dy: 2, sprite: 'bstairs_up_bl' })
            ]),
            approach: Object.freeze({ dx: 0, dy: 3 }),
            route: Object.freeze([
                Object.freeze({ dx: 0, dy: 2 }),
                Object.freeze({ dx: 0, dy: 1 }),
                Object.freeze({ dx: 0, dy: 0 })
            ]),
            exit: Object.freeze({ dx: 0, dy: 3 }),
            direction: 'up'
        }),
        stairs_down: Object.freeze({
            width: 2,
            height: 2,
            parts: Object.freeze([
                Object.freeze({ dx: 0, dy: 0, sprite: 'bstairs_down_tl' }),
                Object.freeze({ dx: 1, dy: 0, sprite: 'bstairs_down_tr' }),
                Object.freeze({ dx: 0, dy: 1, sprite: 'bstairs_down_bl' }),
                Object.freeze({ dx: 1, dy: 1, sprite: 'bstairs_down_br' })
            ]),
            approach: Object.freeze({ dx: 0, dy: -1 }),
            route: Object.freeze([
                Object.freeze({ dx: 0, dy: 0 }),
                Object.freeze({ dx: 0, dy: 1 })
            ]),
            exit: Object.freeze({ dx: 0, dy: 2 }),
            direction: 'down'
        })
    });
    const DEFAULT_STAIR_PLACEMENTS = Object.freeze({
        '1f:stairs_up': Object.freeze({ id: 'stairs_up_2f', type: 'stairs_up', targetFloorId: '2f', x: 10, y: 4, locked: false }),
        '2f:stairs_down': Object.freeze({ id: 'stairs_2f', type: 'stairs_down', targetFloorId: '1f', x: 5, y: 4, locked: false }),
        '1f:stairs_down': Object.freeze({ id: 'stairs_down_b1f', type: 'stairs_down', targetFloorId: 'b1f', x: 13, y: 6, locked: false }),
        'b1f:stairs_up': Object.freeze({ id: 'stairs_b1f', type: 'stairs_up', targetFloorId: '1f', x: 5, y: 2, locked: false })
    });
    const ADVANCED_EQUIPMENT_UNLOCKS = Object.freeze([
        Object.freeze({ level: 3, type: 'magic_furnace', replaceType: 'furnace', autoInstall: true }),
        Object.freeze({ level: 9, type: 'precision_tools' }),
        Object.freeze({ level: 13, type: 'armor_finishing' }),
        Object.freeze({ level: 18, type: 'material_large' }),
        Object.freeze({ level: 20, type: 'master_anvil' }),
        Object.freeze({ level: 25, type: 'shelf_royal' })
    ]);
    const INTERIOR_THEMES = Object.freeze({
        standard_a: Object.freeze({ name: '標準・石造り', unlockLevel: 1, floorSprite: 'bmap_floor_standard_a', wallSprite: 'bmap_wall_standard_a', luxury: false }),
        standard_b: Object.freeze({ name: '標準・木造り', unlockLevel: 1, floorSprite: 'bmap_floor_standard_b', wallSprite: 'bmap_wall_standard_b', luxury: false }),
        luxury_a: Object.freeze({ name: '高級・木彫', unlockLevel: 15, floorSprite: 'bmap_floor_luxury_a', wallSprite: 'bmap_wall_luxury_a', luxury: true, bonus: '価格許容+5%・評判低下-10%' }),
        luxury_b: Object.freeze({ name: '高級・黒大理石', unlockLevel: 15, floorSprite: 'bmap_floor_luxury_b', wallSprite: 'bmap_wall_luxury_b', luxury: true, bonus: '価格許容+5%・評判低下-10%' })
    });
    const BLACKSMITH_BONUSES = Object.freeze({
        precisionPrice: 0.10,
        armorPrice: 0.10,
        royalShelfPrice: 0.10,
        royalShelfReputation: 1,
        luxuryPriceTolerance: 0.05,
        luxuryReputationLossMultiplier: 0.90
    });
    const BASIC_EQUIPMENT_LAYOUT = Object.freeze([
        Object.freeze({ id: 'material', type: 'material', x: 2, y: 2, locked: false }),
        Object.freeze({ id: 'furnace', type: 'furnace', x: 4, y: 2, locked: false }),
        Object.freeze({ id: 'anvil', type: 'anvil', x: 6, y: 2, locked: false }),
        Object.freeze({ id: 'cooling', type: 'cooling', x: 8, y: 2, locked: false }),
        Object.freeze({ id: 'shelf_weapon', type: 'shelf_weapon', x: 2, y: 6, locked: false }),
        Object.freeze({ id: 'shelf_goods', type: 'shelf_goods', x: 5, y: 6, locked: false }),
        Object.freeze({ id: 'shelf_armor', type: 'shelf_armor', x: 8, y: 6, locked: false })
    ]);
    const BLACKSMITH_TUTORIAL_EQUIPMENT_STEPS = Object.freeze([
        Object.freeze({ type: 'material', condition: 'missing_material', player: { x: 2, y: 3, dir: 'up' }, master: { x: 3, y: 3, dir: 'left' }, prompt: '……まずは素材置き場だ。「素材置き場がない時」なら「かえる」。そう設定しろ。', text: '……素材置き場を据えた。お前が持つ素材はここへ並ぶ。組み合わせを見れば、作れる品のレシピをひらめく。' }),
        Object.freeze({ type: 'furnace', condition: 'missing_furnace', player: { x: 4, y: 3, dir: 'up' }, master: { x: 5, y: 3, dir: 'left' }, prompt: '……次は炉だ。「炉がない時」なら「かえる」だ。', text: '……炉を据えた。素材を熱し、打てる状態にする。' }),
        Object.freeze({ type: 'anvil', condition: 'missing_anvil', player: { x: 6, y: 3, dir: 'up' }, master: { x: 7, y: 3, dir: 'left' }, prompt: '……次は金床だ。「金床がない時」なら「かえる」だ。', text: '……金床を据えた。熱した素材は、ここで形を整える。' }),
        Object.freeze({ type: 'cooling', condition: 'missing_cooling', player: { x: 8, y: 3, dir: 'up' }, master: { x: 9, y: 3, dir: 'left' }, prompt: '……次は冷却・水場だ。「冷却・水場がない時」なら「かえる」だ。', text: '……冷却・水場を据えた。打ち終えた品を冷やし、仕上げる。' }),
        Object.freeze({ type: 'shelf_weapon', condition: 'missing_shelf_weapon', player: { x: 2, y: 7, dir: 'up' }, master: { x: 3, y: 7, dir: 'left' }, prompt: '……品を売る棚も要る。「武器商品棚がない時」なら「かえる」だ。', text: '……完成した武器は、この棚へ収める。' }),
        Object.freeze({ type: 'shelf_goods', condition: 'missing_shelf_goods', player: { x: 5, y: 7, dir: 'up' }, master: { x: 6, y: 7, dir: 'left' }, prompt: '……次は雑貨商品棚だ。「雑貨商品棚がない時」なら「かえる」だ。', text: '……道具や指輪は、雑貨の棚へ収める。' }),
        Object.freeze({ type: 'shelf_armor', condition: 'missing_shelf_armor', player: { x: 8, y: 7, dir: 'up' }, master: { x: 9, y: 7, dir: 'left' }, prompt: '……最後は防具商品棚だ。「防具商品棚がない時」なら「かえる」だ。', text: '……盾と防具は、こちらへ分けろ。客が迷わず品を見られる。' })
    ]);
    const OBJECT_DEFS = {
        material: { name: '素材置き場', sprite: 'bwork_material', icon: '📦' },
        material_large: { name: '大型素材庫', sprite: 'bwork_material_large', icon: '🗄️', bonus: '完成済みレシピの製造量2個' },
        furnace: { name: '炉', sprite: 'bwork_furnace', icon: '🔥' },
        magic_furnace: { name: '魔力炉', sprite: 'bwork_magic_furnace', icon: '🔮', bonus: '炉を代替・加熱工程時間-20%' },
        anvil: { name: '金床', sprite: 'bwork_anvil', icon: '⚒️' },
        master_anvil: { name: '名工の金床', sprite: 'bwork_master_anvil', icon: '⚒️', bonus: '金床を代替・鍛造工程時間-20%' },
        cooling: { name: '冷却・水場', sprite: 'bwork_cooling', icon: '💧' },
        precision_tools: { name: '精密工具台', sprite: 'bwork_precision_tools', icon: '🛠️', bonus: '対象商品の販売価格+10%' },
        armor_finishing: { name: '防具仕上げ台', sprite: 'bwork_armor_finishing', icon: '🛡️', bonus: '対象防具の販売価格+10%' },
        shelf_weapon: { name: '武器商品棚', sprite: 'bshelf_weapon', icon: '⚔️' },
        shelf_goods: { name: '雑貨商品棚', sprite: 'bshelf_goods', icon: '🧰' },
        shelf_armor: { name: '防具商品棚', sprite: 'bshelf_armor', icon: '🛡️' },
        shelf_royal: { name: '王室展示棚', sprite: 'bshelf_royal', icon: '👑', bonus: '3種の棚を代替・価格+10%・評判+1' },
        stairs_up: { name: '上り階段', sprite: 'bstairs_up_tl' },
        stairs_down: { name: '下り階段', sprite: 'bstairs_down_tl' }
    };
    const BLACKSMITH_TACTIC_CONDITIONS = Object.freeze({
        missing_material: '素材置き場がない時',
        missing_furnace: '炉がない時',
        missing_anvil: '金床がない時',
        missing_cooling: '冷却・水場がない時',
        missing_shelf_weapon: '武器商品棚がない時',
        missing_shelf_goods: '雑貨商品棚がない時',
        missing_shelf_armor: '防具商品棚がない時',
        can_prepare: '仕込める素材がある時',
        customer_waiting: '金床前で注文・会計待ちのお客様がいる時'
    });
    const BLACKSMITH_TACTIC_ACTIONS = Object.freeze({
        layout: 'かえる',
        prepare: 'つくる',
        serve: 'うる'
    });
    const DEFAULT_BLACKSMITH_TACTICS = Object.freeze([
        Object.freeze({ condition: 'can_prepare', action: 'prepare', enabled: true }),
        Object.freeze({ condition: 'customer_waiting', action: 'serve', enabled: true })
    ]);
    const BLACKSMITH_PRODUCTION_PRIORITIES = Object.freeze(['priority', 'normal', 'low', 'off']);
    const BLACKSMITH_PRIORITY_WEIGHT = Object.freeze({ priority: 3, normal: 2, low: 1, off: 0 });
    // デバッグ用施設テンプレートと同じ基準位置。現在のLvとは独立し、収まらない客は店外で待つ。
    const DEFAULT_BLACKSMITH_SERVICE_LAYOUT = Object.freeze({
        aiStandby: Object.freeze({ x: 6, y: 1, dir: 'down', floorId: MAIN_FLOOR_ID }),
        customerEntry: Object.freeze({ x: 5, y: 9, dir: 'up', floorId: MAIN_FLOOR_ID }),
        queue: Object.freeze([
            Object.freeze({ x: 6, y: 3, dir: 'up', floorId: MAIN_FLOOR_ID }),
            Object.freeze({ x: 6, y: 4, dir: 'up', floorId: MAIN_FLOOR_ID }),
            Object.freeze({ x: 6, y: 5, dir: 'up', floorId: MAIN_FLOOR_ID }),
            Object.freeze({ x: 6, y: 6, dir: 'up', floorId: MAIN_FLOOR_ID }),
            Object.freeze({ x: 6, y: 7, dir: 'up', floorId: MAIN_FLOOR_ID }),
            Object.freeze({ x: 6, y: 8, dir: 'up', floorId: MAIN_FLOOR_ID })
        ])
    });

    // 初期値はデバッグの切り抜き調整画面から変更できる。
    window.BLACKSMITH_SPRITES = {
        bmap_floor: { name: '石床', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 137, sy: 764, sw: 291, sh: 265, scale: 1, x: 0, y: 0 },
        bmap_wall: { name: '石壁', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 2247, sy: 510, sw: 291, sh: 265, scale: 1, x: 0, y: 0 },
        bmap_floor_standard_a: { name: '標準石床', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 137, sy: 764, sw: 291, sh: 265, scale: 1, x: 0, y: 0 },
        bmap_wall_standard_a: { name: '標準石壁', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 2247, sy: 510, sw: 291, sh: 265, scale: 1, x: 0, y: 0 },
        bmap_floor_standard_b: { name: '標準木床', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 430, sy: 0, sw: 300, sh: 260, scale: 1, x: 0, y: 0 },
        bmap_wall_standard_b: { name: '標準木壁', img: 'blacksmith_mapchip.jpg', iw: 2816, ih: 1536, sx: 1540, sy: 100, sw: 300, sh: 260, scale: 1, x: 0, y: 0 },
        bmap_floor_luxury_a: { name: '高級木床', img: 'blacksmith_mapchip2.jpg', iw: 2816, ih: 1536, sx: 430, sy: 0, sw: 300, sh: 260, scale: 1, x: 0, y: 0 },
        bmap_wall_luxury_a: { name: '高級木壁', img: 'blacksmith_mapchip2.jpg', iw: 2816, ih: 1536, sx: 100, sy: 120, sw: 300, sh: 260, scale: 1, x: 0, y: 0 },
        bmap_floor_luxury_b: { name: '高級黒床', img: 'blacksmith_mapchip2.jpg', iw: 2816, ih: 1536, sx: 2200, sy: 500, sw: 290, sh: 265, scale: 1, x: 0, y: 0 },
        bmap_wall_luxury_b: { name: '高級黒壁', img: 'blacksmith_mapchip2.jpg', iw: 2816, ih: 1536, sx: 1680, sy: 130, sw: 290, sh: 265, scale: 1, x: 0, y: 0 },
        bshelf_weapon: { name: '武器商品棚', img: 'blacksmith_productshelf_mapchip.png', iw: 2816, ih: 1536, sx: 21, sy: 80, sw: 960, sh: 1452, scale: 1, x: 0, y: 0 },
        bshelf_goods: { name: '雑貨商品棚', img: 'blacksmith_productshelf_mapchip.png', iw: 2816, ih: 1536, sx: 985, sy: 914, sw: 830, sh: 620, scale: 1, x: 0, y: 0 },
        bshelf_armor: { name: '防具商品棚', img: 'blacksmith_productshelf_mapchip.png', iw: 2816, ih: 1536, sx: 1835, sy: 70, sw: 966, sh: 1456, scale: 1, x: 0, y: 0 },
        bwork_furnace: { name: '炉', img: 'blacksmith_workshop_mapchip.png', iw: 2760, ih: 1504, sx: 338, sy: 20, sw: 1061, sh: 851, scale: 1, x: 0, y: 0 },
        bwork_anvil: { name: '金床', img: 'blacksmith_workshop_mapchip.png', iw: 2760, ih: 1504, sx: 1719, sy: 20, sw: 737, sh: 756, scale: 1, x: 0, y: 0 },
        bwork_material: { name: '素材置き場', img: 'blacksmith_workshop_mapchip.png', iw: 2760, ih: 1504, sx: 147, sy: 971, sw: 1288, sh: 541, scale: 1, x: 0, y: 0 },
        bwork_cooling: { name: '冷却・水場', img: 'blacksmith_workshop_mapchip.png', iw: 2760, ih: 1504, sx: 1573, sy: 843, sw: 1113, sh: 700, scale: 1, x: 0, y: 0 },
        bwork_magic_furnace: { name: '魔力炉', img: 'blacksmith_workshop_mapchip2.png', iw: 2760, ih: 1504, sx: 80, sy: 20, sw: 1210, sh: 730, scale: 1, x: 0, y: 0 },
        bwork_precision_tools: { name: '精密工具台', img: 'blacksmith_workshop_mapchip2.png', iw: 2760, ih: 1504, sx: 1940, sy: 40, sw: 800, sh: 650, scale: 1, x: 0, y: 0 },
        bwork_material_large: { name: '大型素材庫', img: 'blacksmith_workshop_mapchip2.png', iw: 2760, ih: 1504, sx: 90, sy: 800, sw: 880, sh: 700, scale: 1, x: 0, y: 0 },
        bwork_master_anvil: { name: '名工の金床', img: 'blacksmith_workshop_mapchip2.png', iw: 2760, ih: 1504, sx: 1020, sy: 710, sw: 820, sh: 790, scale: 1, x: 0, y: 0 },
        bwork_armor_finishing: { name: '防具仕上げ台', img: 'blacksmith_workshop_mapchip2.png', iw: 2760, ih: 1504, sx: 1920, sy: 700, sw: 830, sh: 800, scale: 1, x: 0, y: 0 },
        bshelf_royal: { name: '王室展示棚', img: 'blacksmith_productshelf_mapchip2.png', iw: 2816, ih: 1536, sx: 20, sy: 30, sw: 2770, sh: 1480, scale: 1, x: 0, y: 0 },
        bstairs_up_tl: { name: '上り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 66, sy: 261, sw: 549, sh: 601, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_up_tr: { name: '上り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 592, sy: 68, sw: 368, sh: 802, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_up_ml: { name: '上り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 947, sy: 68, sw: 393, sh: 802, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_up_mr: { name: '上り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 66, sy: 816, sw: 549, sh: 353, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_up_bl: { name: '上り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 66, sy: 1130, sw: 549, sh: 353, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_down_tl: { name: '下り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 1475, sy: 71, sw: 651, sh: 703, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_down_tr: { name: '下り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 2092, sy: 71, sw: 651, sh: 703, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_down_bl: { name: '下り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 1475, sy: 755, sw: 651, sh: 703, scale: 1, x: 0, y: 0, tileFill: true },
        bstairs_down_br: { name: '下り階段', img: 'restaurant_stairs_mapchip.png', iw: 2816, ih: 1536, sx: 2092, sy: 755, sw: 651, sh: 703, scale: 1, x: 0, y: 0, tileFill: true },
        ...(window.BLACKSMITH_SPRITES || {})
    };
    window.selectedBlacksmithSpriteKey = window.selectedBlacksmithSpriteKey || Object.keys(window.BLACKSMITH_SPRITES)[0];

    window.BLACKSMITH_EQUIPMENT_CATALOG = Object.freeze({
        basic_forge: { name: '基本鍛冶設備', unlockLevel: 1 },
        magic_furnace: { name: '魔力炉', unlockLevel: 3, objectTypes: ['magic_furnace'] },
        precision_tools: { name: '精密工具台', unlockLevel: 9, objectTypes: ['precision_tools'] },
        armor_finishing: { name: '防具仕上げ台', unlockLevel: 13, objectTypes: ['armor_finishing'] },
        master_anvil: { name: '名工の金床', unlockLevel: 20, objectTypes: ['master_anvil'] }
    });

    window.BLACKSMITH_RECIPE_CATALOG = Object.freeze({
        eq_sword: { category: 'weapon', materials: { iron: 5, wood: 2 }, equipment: ['basic_forge'] },
        eq_shield: { category: 'armor', materials: { iron: 4, stone: 4 }, equipment: ['basic_forge'] },
        tool_pan: { category: 'goods', materials: { iron: 2, wood: 1 }, equipment: ['basic_forge'] },
        eq_staff: { category: 'weapon', materials: { wood: 5, crystal: 1 }, equipment: ['basic_forge', 'magic_furnace'] },
        item_armor_iron: { category: 'armor', materials: { iron: 8, stone: 2 }, equipment: ['basic_forge'] },
        rod_old: { category: 'goods', materials: { wood: 3, iron: 1 }, equipment: ['basic_forge'] },
        rod_norm: { category: 'goods', materials: { high_wood: 2, iron: 4 }, equipment: ['basic_forge', 'precision_tools'] },
        item_sword_double: { category: 'weapon', materials: { iron: 10, crystal: 1 }, equipment: ['basic_forge', 'precision_tools'] },
        item_shield_counter: { category: 'armor', materials: { iron: 8, crystal: 1 }, equipment: ['basic_forge', 'armor_finishing'] },
        item_shield_hara: { category: 'armor', materials: { iron: 6, high_wood: 2 }, equipment: ['basic_forge', 'armor_finishing'] },
        item_wand_fire: { category: 'weapon', materials: { wood: 5, crystal: 3 }, equipment: ['basic_forge', 'magic_furnace'] },
        item_ring_haste: { category: 'goods', materials: { iron: 3, crystal: 3 }, equipment: ['basic_forge', 'precision_tools'] },
        item_ring_heal: { category: 'goods', materials: { iron: 3, herb: 5, crystal: 2 }, equipment: ['basic_forge', 'magic_furnace', 'precision_tools'] },
        rod_super: { category: 'goods', materials: { high_wood: 5, crystal: 4, iron: 8 }, equipment: ['basic_forge', 'precision_tools', 'master_anvil'] },
        eq_crown: { category: 'armor', materials: { coin: 5, crystal: 2 }, equipment: ['basic_forge', 'armor_finishing', 'master_anvil'] }
    });

    const milestoneLabels = [
        '基本設備・同時来店2人', '同時来店3人', '魔力炉', '評判上限50', '1階40マス拡張・模様替え解放',
        '同時来店5人', '評判上限60', '同時来店6人', '精密工具台', '2階解放',
        '同時来店7人', '評判上限70', '防具仕上げ台', '同時来店9人', '高級鍛冶内装',
        '評判上限80', '同時来店10人', '大型素材庫', '評判上限90', '名工の金床',
        '同時来店12人', '評判上限100', '地下1階解放', '同時来店14人', '王室展示棚',
        '評判上限110', '同時来店15人', '評判上限120', '同時来店18人', '評判上限130'
    ];
    window.BLACKSMITH_LEVEL_MILESTONES = Object.freeze(Array.from({ length: 30 }, (_, index) => {
        const level = index + 1;
        const customerByLevel = { 1: 2, 2: 3, 6: 5, 8: 6, 11: 7, 14: 9, 17: 10, 21: 12, 24: 14, 27: 15, 29: 18 };
        const maxCustomers = Object.keys(customerByLevel).reduce((value, key) => level >= Number(key) ? customerByLevel[key] : value, 2);
        return { level, maxCustomers, expRequired: level * 100, label: milestoneLabels[index] };
    }));

    const clone = value => JSON.parse(JSON.stringify(value));
    const itemId = item => typeof item === 'string' ? item : item && item.id;
    const getItem = id => window.itemCatalog && window.itemCatalog[id] ? window.itemCatalog[id] : null;
    const getItemName = id => getItem(id)?.name || id;
    const getItemPrice = id => Math.max(10, Math.round(Number(getItem(id)?.value || 50) * 1.5));
    const getMaterialName = id => getItemName(id);
    const escapeHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const stableHash = value => [...String(value || '')].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
    const isSmithBuilding = building => !!building
        && (building.type === 'smith' || building.type === 'blacksmith')
        && !building.isMasterShop
        && !['師匠のキャンプ', '鍛冶師のキャンプ'].includes(building.name);
    function findOwnedBlacksmithBuilding() {
        if (isSmithBuilding(window.currentBlacksmithBuilding)) return window.currentBlacksmithBuilding;
        const collection = typeof assets !== 'undefined' ? assets : (window.assets || {});
        return Object.values(collection).find(asset => isSmithBuilding(asset)) || null;
    }
    const isSmithMastered = ai => !!(ai && ai.apprentice && (
        (ai.apprentice.retired && ai.apprentice.retired.smithing) ||
        (ai.apprentice.currentMaster === 'smithing' && ai.apprentice.isGraduated) ||
        (ai.apprentice.rank && Number(ai.apprentice.rank.smithing) >= 10)
    ));

    function createProductionState(recipeStates) {
        const targets = {};
        const priorities = {};
        const developmentPriorities = {};
        Object.keys(recipeStates).forEach(id => {
            targets[id] = 5;
            priorities[id] = 'normal';
            developmentPriorities[id] = 'normal';
        });
        return { targets, priorities, developmentPriorities, orders: [], nextOrderId: 1, roundRobinCursor: 0 };
    }

    function normalizeServiceLayout(layout) {
        const normalized = clone(DEFAULT_BLACKSMITH_SERVICE_LAYOUT);
        if (!layout || typeof layout !== 'object') return normalized;
        const point = (value, fallback) => ({
            x: Math.max(0, Number.isFinite(Number(value?.x)) ? Number(value.x) : fallback.x),
            y: Math.max(0, Number.isFinite(Number(value?.y)) ? Number(value.y) : fallback.y),
            dir: ['up', 'down', 'left', 'right'].includes(value?.dir) ? value.dir : fallback.dir,
            floorId: typeof value?.floorId === 'string' && value.floorId ? value.floorId : (fallback.floorId || MAIN_FLOOR_ID)
        });
        normalized.aiStandby = point(layout.aiStandby, normalized.aiStandby);
        normalized.customerEntry = point(layout.customerEntry, normalized.customerEntry);
        normalized.customerEntry.floorId = MAIN_FLOOR_ID;
        if (Array.isArray(layout.queue) && layout.queue.length) {
            normalized.queue = layout.queue.map((entry, index) => point(entry, normalized.queue[index] || normalized.queue[normalized.queue.length - 1]));
        }
        return normalized;
    }

    function getBlacksmithCustomerName(skin) {
        if (typeof window.getShopCustomerName === 'function') return window.getShopCustomerName(skin);
        return window.monsterBookData?.[skin]?.name || String(skin || 'お客様').split('_')[0];
    }

    function getBlacksmithCustomerTraits(skin) {
        const restaurantTrait = window.CUSTOMER_TRAITS?.[skin] || window.CUSTOMER_TRAITS?.robot || {};
        const hash = stableHash(skin);
        return {
            patience: Math.max(30, Number(restaurantTrait.patience) || 150),
            loyaltyReq: Math.max(1, Number(restaurantTrait.loyaltyReq) || 3),
            loyaltyDrop: Math.max(1, Number(restaurantTrait.loyaltyDrop) || 2),
            priceTolerance: 1.05 + (hash % 31) / 100,
            preferredCategory: ['weapon', 'armor', 'goods'][hash % 3]
        };
    }

    function customerSpeech(state, entity, text, color = '#fff', speaker = '') {
        if (!entity || !text) return;
        entity.speechText = text;
        entity.speechColor = color;
        entity.speechSpeaker = speaker;
        entity.speechUntilTick = state.tick + 8;
        addLog(state, text, color, speaker);
    }

    function createGrid(width = MAP_W, height = MAP_H) {
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (x === 0 || y === 0 || x === width - 1 || y === height - 1) ? 1 : 0));
    }

    function cellKey(x, y) {
        return `${x},${y}`;
    }

    function isFloorCell(floor, x, y) {
        return !!floor && x >= 0 && y >= 0 && x < floor.width && y < floor.height && floor.grid[y]?.[x] === 0;
    }

    function floorTileCount(floor) {
        return floor?.grid?.reduce((total, row) => total + row.filter(cell => cell === 0).length, 0) || 0;
    }

    function stairLayout(type) {
        return STAIR_LAYOUTS[type] || null;
    }

    function objectVisualParts(object) {
        const layout = stairLayout(object?.type);
        if (layout) return layout.parts.map(part => ({ ...part, x: object.x + part.dx, y: object.y + part.dy }));
        const def = OBJECT_DEFS[object?.type];
        return [{ dx: 0, dy: 0, x: object?.x, y: object?.y, sprite: def?.sprite || null, icon: def?.icon || '■' }];
    }

    function objectFootprintCells(object, anchorX = object?.x, anchorY = object?.y) {
        const layout = stairLayout(object?.type);
        const parts = layout?.parts || [{ dx: 0, dy: 0 }];
        return parts.map(part => ({ x: anchorX + part.dx, y: anchorY + part.dy, dx: part.dx, dy: part.dy, sprite: part.sprite || null }));
    }

    function objectPartAtCell(floor, x, y, ignoredObjectId = null) {
        for (const object of floor?.objects || []) {
            if (ignoredObjectId !== null && object.id === ignoredObjectId) continue;
            const part = objectFootprintCells(object).find(cell => cell.x === x && cell.y === y);
            if (part) return { object, part };
        }
        return null;
    }

    function objectCanOccupy(floor, object, anchorX, anchorY, ignoredObjectId = object?.id) {
        const entranceCells = new Set((floor?.entrance || []).map(point => cellKey(point.x, point.y)));
        return objectFootprintCells(object, anchorX, anchorY).every(cell => isFloorCell(floor, cell.x, cell.y)
            && !entranceCells.has(cellKey(cell.x, cell.y))
            && !objectPartAtCell(floor, cell.x, cell.y, ignoredObjectId));
    }

    function stairPoint(object, kind) {
        const offset = stairLayout(object?.type)?.[kind];
        return offset ? { x: object.x + offset.dx, y: object.y + offset.dy } : null;
    }

    function pointLabel(point) {
        return `(${point.x}, ${point.y})`;
    }

    function pointListLabel(points) {
        return points.map(pointLabel).join('、');
    }

    function stairAccessPoints(object) {
        const approach = stairPoint(object, 'approach');
        const exit = stairPoint(object, 'exit');
        if (!approach || !exit) return [];
        if (approach.x === exit.x && approach.y === exit.y) return [{ role: '進入・退出マス', point: approach }];
        return [{ role: '進入マス', point: approach }, { role: '退出マス', point: exit }];
    }

    function stairPlacementErrors(floor, object, anchorX = object?.x, anchorY = object?.y, includeBodyConflicts = true) {
        if (!floor || !stairLayout(object?.type)) return [];
        const candidate = { ...object, x: anchorX, y: anchorY };
        const name = OBJECT_DEFS[candidate.type]?.name || candidate.type;
        const footprint = objectFootprintCells(candidate);
        const errors = [];
        const missingBodyFloor = footprint.filter(cell => !isFloorCell(floor, cell.x, cell.y));
        if (missingBodyFloor.length) {
            errors.push(`${floor.name}の${name}（位置 ${anchorX}, ${anchorY}）の設備が床の外にあります。本体マス ${pointListLabel(missingBodyFloor)} に床がありません。階段の画像全体が床に収まる位置へ移動するか、不足マスへ床を移してください。`);
        }
        if (includeBodyConflicts) {
            const entranceCells = new Set((floor.entrance || []).map(point => cellKey(point.x, point.y)));
            const entranceOverlap = footprint.filter(cell => entranceCells.has(cellKey(cell.x, cell.y)));
            if (entranceOverlap.length) {
                errors.push(`${floor.name}の${name}（位置 ${anchorX}, ${anchorY}）の本体マス ${pointListLabel(entranceOverlap)} が入口と重なっています。階段か入口を移動してください。`);
            }
            const bodyBlockers = footprint.map(cell => ({ cell, blocker: objectPartAtCell(floor, cell.x, cell.y, object.id)?.object })).filter(entry => entry.blocker);
            if (bodyBlockers.length) {
                const blockerNames = [...new Set(bodyBlockers.map(entry => OBJECT_DEFS[entry.blocker.type]?.name || entry.blocker.type))].join('・');
                errors.push(`${floor.name}の${name}（位置 ${anchorX}, ${anchorY}）の本体マス ${pointListLabel(bodyBlockers.map(entry => entry.cell))} が${blockerNames}と重なっています。どちらかの設備を移動してください。`);
            }
        }
        for (const access of stairAccessPoints(candidate)) {
            if (!isFloorCell(floor, access.point.x, access.point.y)) {
                errors.push(`${floor.name}の${name}（位置 ${anchorX}, ${anchorY}）の${access.role} ${pointLabel(access.point)} に床がありません。そのマスを床にするか、階段を移動してください。`);
                continue;
            }
            const blocker = objectPartAtCell(floor, access.point.x, access.point.y, object.id)?.object;
            if (blocker) {
                const blockerName = OBJECT_DEFS[blocker.type]?.name || blocker.type;
                errors.push(`${floor.name}の${name}（位置 ${anchorX}, ${anchorY}）の${access.role} ${pointLabel(access.point)} が${blockerName}で塞がれています。その設備または階段を移動し、空き床にしてください。`);
            }
        }
        return errors;
    }

    function stairAccessAtCell(floor, x, y) {
        for (const object of floor?.objects || []) {
            if (!stairLayout(object.type)) continue;
            const access = stairAccessPoints(object).find(entry => entry.point.x === x && entry.point.y === y);
            if (access) return { object, ...access };
        }
        return null;
    }

    function stairAnchorIsAvailable(floor, object, x, y) {
        return stairPlacementErrors(floor, object, x, y).length === 0;
    }

    function findStairAnchor(floor, object, preferred) {
        const anchors = [];
        for (let y = 0; y < floor.height; y += 1) {
            for (let x = 0; x < floor.width; x += 1) {
                if (stairAnchorIsAvailable(floor, object, x, y)) anchors.push({ x, y });
            }
        }
        anchors.sort((a, b) => {
            const aDistance = Math.abs(a.x - preferred.x) + Math.abs(a.y - preferred.y);
            const bDistance = Math.abs(b.x - preferred.x) + Math.abs(b.y - preferred.y);
            return (aDistance - bDistance) || (a.y - b.y) || (a.x - b.x);
        });
        return anchors[0] || null;
    }

    function defaultStairObject(floorId, type) {
        const definition = DEFAULT_STAIR_PLACEMENTS[`${floorId}:${type}`];
        return definition ? clone(definition) : null;
    }

    function inferredStairTargetFloorId(floorId, type) {
        return DEFAULT_STAIR_PLACEMENTS[`${floorId}:${type}`]?.targetFloorId || null;
    }

    function normalizeStairConnections(state, resetLegacyPositions = false) {
        for (const floor of state?.floors || []) {
            for (const object of floor.objects || []) {
                if (!stairLayout(object.type)) continue;
                const definition = defaultStairObject(floor.id, object.type);
                object.targetFloorId = object.targetFloorId || definition?.targetFloorId || inferredStairTargetFloorId(floor.id, object.type);
                if (resetLegacyPositions && definition) {
                    object.x = definition.x;
                    object.y = definition.y;
                    object.targetFloorId = definition.targetFloorId;
                }
            }
        }
        if (!resetLegacyPositions) return;
        for (const floor of state?.floors || []) {
            for (const object of floor.objects || []) {
                if (!stairLayout(object.type) || stairAnchorIsAvailable(floor, object, object.x, object.y)) continue;
                const anchor = findStairAnchor(floor, object, { x: object.x, y: object.y });
                if (anchor) {
                    object.x = anchor.x;
                    object.y = anchor.y;
                }
            }
        }
    }

    function entranceOutwardVector(floor, entrance = floor?.entrance || []) {
        if (!floor || entrance.length !== 3) return null;
        const ordered = entrance.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
        const horizontal = ordered.every(point => point.y === ordered[0].y) && ordered[2].x - ordered[0].x === 2;
        const vertical = ordered.every(point => point.x === ordered[0].x) && ordered[2].y - ordered[0].y === 2;
        const directions = horizontal
            ? [{ x: 0, y: -1 }, { x: 0, y: 1 }]
            : vertical
                ? [{ x: -1, y: 0 }, { x: 1, y: 0 }]
                : [];
        return directions.find(direction => entrance.every(point => {
            const outwardFloor = isFloorCell(floor, point.x + direction.x, point.y + direction.y);
            const inwardFloor = isFloorCell(floor, point.x - direction.x, point.y - direction.y);
            return !outwardFloor && inwardFloor;
        })) || null;
    }

    // grid の 1 は壁そのものではなく床のない空間として扱い、床の外縁だけへ壁を自動生成する。
    function automaticWallCells(floor) {
        const walls = new Set();
        if (!floor) return walls;
        const outward = entranceOutwardVector(floor);
        const entranceOpenings = new Set(outward ? (floor.entrance || []).map(point => cellKey(point.x + outward.x, point.y + outward.y)) : []);
        for (let y = 0; y < floor.height; y += 1) {
            for (let x = 0; x < floor.width; x += 1) {
                if (!isFloorCell(floor, x, y)) continue;
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                    const wallX = x + dx;
                    const wallY = y + dy;
                    const key = cellKey(wallX, wallY);
                    if (!isFloorCell(floor, wallX, wallY) && !entranceOpenings.has(key)) walls.add(key);
                });
            }
        }
        return walls;
    }

    function level5ExpansionZone() {
        return { id: 'level5', level: 5, x: LEVEL5_EXPANSION_START_X, y: 1, width: 5, height: MAIN_FLOOR_HEIGHT - 2, addedFloorTiles: 40 };
    }

    function createMainFloor(withBasicEquipment = false, level = 1) {
        const expanded = Number(level) >= 5;
        const width = expanded ? MAIN_FLOOR_EXPANDED_WIDTH : MAIN_FLOOR_BASE_WIDTH;
        const grid = createGrid(width, MAIN_FLOOR_HEIGHT);
        grid[MAIN_FLOOR_HEIGHT - 1][4] = 0;
        grid[MAIN_FLOOR_HEIGHT - 1][5] = 0;
        grid[MAIN_FLOOR_HEIGHT - 1][6] = 0;
        return {
            id: MAIN_FLOOR_ID,
            name: '1階',
            width,
            height: MAIN_FLOOR_HEIGHT,
            grid,
            interiorTheme: 'standard_a',
            entrance: [{ x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 }],
            objects: withBasicEquipment ? clone(BASIC_EQUIPMENT_LAYOUT) : [],
            expansionZones: expanded ? [level5ExpansionZone()] : []
        };
    }

    function createExtraFloor(id, name) {
        const width = 10;
        const height = 8;
        const grid = createGrid(width, height);
        const stair = id === '2f' ? defaultStairObject(id, 'stairs_down') : defaultStairObject(id, 'stairs_up');
        return {
            id, name, width, height, grid, interiorTheme: 'standard_a', entrance: [], expansionZones: [],
            objects: stair ? [stair] : []
        };
    }

    function createTutorialState() {
        return {
            version: TUTORIAL_VERSION,
            completed: false,
            phase: 'arrival',
            masterVisible: true,
            master: null,
            materialsGranted: false,
            customerSpawned: false,
            craftingRuleSet: false,
            serviceRuleSet: false,
            arrivalDelayTicks: 0,
            equipmentStep: 0,
            layoutPrepared: false,
            layoutBackup: null,
            dialoguePhase: '',
            dialogueIndex: 0
        };
    }

    function createTutorialMaster(state) {
        const entrance = state ? getEntrance(state) : { x: 5, y: MAP_H - 1, floorId: MAIN_FLOOR_ID };
        return {
            floorId: MAIN_FLOOR_ID,
            x: Math.max(1, entrance.x - 1),
            y: entrance.y,
            dir: 'up',
            path: []
        };
    }

    function basicEquipmentTemplate(type) {
        return BASIC_EQUIPMENT_LAYOUT.find(object => object.type === type) || null;
    }

    function collectBasicEquipment(state) {
        if (!state || !Array.isArray(state.floors)) return [];
        const collected = [];
        state.floors.forEach(floor => {
            (floor.objects || []).forEach(object => {
                if (REQUIRED_OBJECT_TYPES.includes(object.type)) collected.push({ floorId: floor.id, object: clone(object) });
            });
        });
        return collected;
    }

    function removeBasicEquipment(state) {
        if (!state || !Array.isArray(state.floors)) return;
        state.floors.forEach(floor => {
            floor.objects = Array.isArray(floor.objects)
                ? floor.objects.filter(object => !REQUIRED_OBJECT_TYPES.includes(object.type))
                : [];
        });
    }

    function prepareBlacksmithTutorialLayout(state) {
        if (!state || !state.tutorial || state.tutorial.completed || state.tutorial.layoutPrepared) return;
        const tutorial = state.tutorial;
        if (!Array.isArray(tutorial.layoutBackup)) tutorial.layoutBackup = collectBasicEquipment(state);
        removeBasicEquipment(state);
        tutorial.equipmentStep = 0;
        tutorial.layoutPrepared = true;
    }

    function placeBlacksmithTutorialEquipment(state, type) {
        const template = basicEquipmentTemplate(type);
        const floor = state && state.floors && state.floors.find(candidate => candidate.id === MAIN_FLOOR_ID);
        if (!template || !floor) return null;
        floor.objects = Array.isArray(floor.objects) ? floor.objects : [];
        let object = floor.objects.find(candidate => candidate.type === type);
        if (!object) {
            object = clone(template);
            floor.objects.push(object);
        }
        return object;
    }

    function ensureBasicEquipment(state) {
        REQUIRED_OBJECT_TYPES.forEach(type => {
            const exists = state && state.floors && state.floors.some(floor => (floor.objects || []).some(object => object.type === type));
            if (!exists) placeBlacksmithTutorialEquipment(state, type);
        });
    }

    function restoreBlacksmithTutorialLayout(state) {
        if (!state || !state.tutorial) return;
        const tutorial = state.tutorial;
        const backup = Array.isArray(tutorial.layoutBackup) ? clone(tutorial.layoutBackup) : [];
        removeBasicEquipment(state);
        if (backup.length) {
            backup.forEach(entry => {
                const floor = state.floors.find(candidate => candidate.id === entry.floorId) || state.floors.find(candidate => candidate.id === MAIN_FLOOR_ID);
                if (floor && entry.object) floor.objects.push(clone(entry.object));
            });
        } else {
            ensureBasicEquipment(state);
        }
        tutorial.layoutBackup = null;
        tutorial.layoutPrepared = false;
    }

    function normalizeTactics(tactics) {
        if (!Array.isArray(tactics)) return [];
        const seen = new Set();
        return tactics.filter(rule => {
            if (!rule || !BLACKSMITH_TACTIC_CONDITIONS[rule.condition] || !BLACKSMITH_TACTIC_ACTIONS[rule.action]) return false;
            const key = `${rule.condition}:${rule.action}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).map(rule => ({ condition: rule.condition, action: rule.action, enabled: rule.enabled !== false }));
    }

    function hasTactic(state, condition, action) {
        return normalizeTactics(state && state.tactics).some(rule => rule.enabled && rule.condition === condition && rule.action === action);
    }

    function getTacticAction(state, condition) {
        const rule = normalizeTactics(state && state.tactics).find(candidate => candidate.enabled && candidate.condition === condition);
        return rule ? rule.action : null;
    }

    function createState(building) {
        const recipeStates = {};
        Object.keys(window.BLACKSMITH_RECIPE_CATALOG).forEach(id => {
            recipeStates[id] = { discovered: false, mastery: 0 };
        });
        const rebuilding = !!window.aiPet?.blacksmithBusinessRebuildPending;
        if (rebuilding && window.aiPet?.savedBlacksmithRecipes) {
            Object.entries(window.aiPet.savedBlacksmithRecipes).forEach(([id, recipeState]) => {
                if (!recipeStates[id] || !recipeState) return;
                recipeStates[id] = {
                    discovered: recipeState.discovered === true || Number(recipeState.mastery) > 0,
                    mastery: Math.max(0, Math.min(100, Number(recipeState.mastery) || 0))
                };
            });
        }
        const tutorial = createTutorialState();
        if (rebuilding) {
            tutorial.completed = true;
            tutorial.phase = 'completed';
            tutorial.masterVisible = false;
        }
        const state = {
            version: STATE_VERSION,
            level: 1,
            exp: 0,
            reputation: 40,
            money: 0,
            totalSales: 0,
            isOpen: false,
            paused: false,
            tick: 0,
            floors: [createMainFloor(rebuilding)],
            activeFloorId: MAIN_FLOOR_ID,
            player: { floorId: MAIN_FLOOR_ID, x: 6, y: 1, dir: 'down' },
            recipes: recipeStates,
            stock: {},
            prices: Object.fromEntries(Object.keys(recipeStates).map(id => [id, getItemPrice(id)])),
            marketPrices: Object.fromEntries(Object.keys(recipeStates).map(id => [id, getItemPrice(id)])),
            marketDay: -1,
            production: createProductionState(recipeStates),
            serviceLayout: clone(DEFAULT_BLACKSMITH_SERVICE_LAYOUT),
            customers: [],
            work: null,
            service: null,
            opening: null,
            floorMove: null,
            logs: [],
            tactics: [],
            tutorial,
            shopName: '',
            shopNamePrompted: false,
            unplacedEquipment: [],
            equipmentUnlocks: {},
            editorUnlocked: rebuilding && !!window.aiPet?.blacksmithLayoutEditorUnlocked,
            loyalty: {},
            isBankrupt: false,
            nextCustomerId: 1
        };
        if (rebuilding && window.aiPet) {
            window.aiPet.blacksmithBusinessRebuildPending = false;
            window.aiPet.blacksmithTutorialCompleted = true;
        }
        return state;
    }

    function expandMainFloorForLevel(state) {
        const main = state?.floors?.find(floor => floor.id === MAIN_FLOOR_ID);
        if (!main || Number(state.level) < 5 || main.width >= MAIN_FLOOR_EXPANDED_WIDTH) {
            if (main && Number(state?.level) >= 5 && main.width >= MAIN_FLOOR_EXPANDED_WIDTH) {
                main.expansionZones = Array.isArray(main.expansionZones) ? main.expansionZones : [];
                if (!main.expansionZones.some(zone => zone.id === 'level5')) main.expansionZones.push(level5ExpansionZone());
            }
            return { expanded: false, addedFloorTiles: 0 };
        }
        const before = floorTileCount(main);
        main.height = Math.max(MAIN_FLOOR_HEIGHT, Number(main.height) || MAIN_FLOOR_HEIGHT);
        main.grid = Array.from({ length: main.height }, (_, y) => {
            const previous = Array.isArray(main.grid?.[y]) ? main.grid[y].slice(0, MAIN_FLOOR_EXPANDED_WIDTH) : [];
            while (previous.length < MAIN_FLOOR_EXPANDED_WIDTH) previous.push(1);
            if (y > 0 && y < main.height - 1) {
                for (let x = LEVEL5_EXPANSION_START_X; x < MAIN_FLOOR_EXPANDED_WIDTH - 1; x += 1) previous[x] = 0;
            }
            previous[MAIN_FLOOR_EXPANDED_WIDTH - 1] = 1;
            return previous;
        });
        main.width = MAIN_FLOOR_EXPANDED_WIDTH;
        main.expansionZones = Array.isArray(main.expansionZones) ? main.expansionZones : [];
        if (!main.expansionZones.some(zone => zone.id === 'level5')) main.expansionZones.push(level5ExpansionZone());
        return { expanded: true, addedFloorTiles: Math.max(0, floorTileCount(main) - before) };
    }

    function ensureLevelFloors(state) {
        const main = state.floors.find(f => f.id === MAIN_FLOOR_ID);
        const expansion = expandMainFloorForLevel(state);
        if (state.level >= 10) {
            if (!state.floors.some(f => f.id === '2f')) state.floors.push(createExtraFloor('2f', '2階'));
            if (main && !main.objects.some(o => o.type === 'stairs_up')) main.objects.push(defaultStairObject(MAIN_FLOOR_ID, 'stairs_up'));
        }
        if (state.level >= 23) {
            if (!state.floors.some(f => f.id === 'b1f')) state.floors.push(createExtraFloor('b1f', '地下1階'));
            if (main && !main.objects.some(o => o.type === 'stairs_down')) main.objects.push(defaultStairObject(MAIN_FLOOR_ID, 'stairs_down'));
        }
        return expansion;
    }

    function installedEquipmentObject(state, type) {
        return (state?.floors || []).flatMap(floor => floor.objects || []).find(object => object.type === type) || null;
    }

    function ownsEquipmentType(state, type) {
        return !!installedEquipmentObject(state, type) || (state?.unplacedEquipment || []).some(object => object.type === type);
    }

    function createOwnedEquipment(type) {
        return { id: type, type, x: 0, y: 0, locked: false };
    }

    function grantUnlockedEquipment(state, silent = false) {
        if (!state) return [];
        state.equipmentUnlocks = state.equipmentUnlocks && typeof state.equipmentUnlocks === 'object' ? state.equipmentUnlocks : {};
        state.unplacedEquipment = Array.isArray(state.unplacedEquipment) ? state.unplacedEquipment : [];
        const granted = [];
        ADVANCED_EQUIPMENT_UNLOCKS.forEach(unlock => {
            if (state.level < unlock.level || state.equipmentUnlocks[unlock.type]) return;
            if (unlock.autoInstall && unlock.replaceType) {
                const baseObject = installedEquipmentObject(state, unlock.replaceType);
                if (baseObject && !ownsEquipmentType(state, unlock.type)) {
                    state.unplacedEquipment.push(createOwnedEquipment(unlock.replaceType));
                    baseObject.id = unlock.type;
                    baseObject.type = unlock.type;
                    granted.push(unlock.type);
                } else if (!ownsEquipmentType(state, unlock.type)) {
                    state.unplacedEquipment.push(createOwnedEquipment(unlock.type));
                    granted.push(unlock.type);
                }
            } else if (!ownsEquipmentType(state, unlock.type)) {
                state.unplacedEquipment.push(createOwnedEquipment(unlock.type));
                granted.push(unlock.type);
            }
            state.equipmentUnlocks[unlock.type] = true;
        });
        if (!silent) granted.forEach(type => addLog(state, `${OBJECT_DEFS[type].name}を入手した。模様替えから設置できる。`, '#ffd180'));
        return granted;
    }

    function normalizeState(building) {
        if (!building.blacksmithBusiness || typeof building.blacksmithBusiness !== 'object') building.blacksmithBusiness = createState(building);
        const state = building.blacksmithBusiness;
        const previousVersion = Math.max(0, Number(state.version) || 0);
        state.version = STATE_VERSION;
        state.level = Math.max(1, Math.min(30, Number(state.level) || 1));
        state.exp = Math.max(0, Number(state.exp) || 0);
        const reputation = Number(state.reputation);
        state.reputation = Math.max(0, Math.min(getMaxReputation(state.level), Number.isFinite(reputation) ? reputation : 40));
        state.money = Math.max(0, Number(state.money) || 0);
        state.totalSales = Math.max(0, Number(state.totalSales) || 0);
        state.floors = Array.isArray(state.floors) && state.floors.length ? state.floors : [createMainFloor()];
        state.floors.forEach(floor => {
            const theme = INTERIOR_THEMES[floor.interiorTheme];
            floor.interiorTheme = theme && state.level >= theme.unlockLevel ? floor.interiorTheme : 'standard_a';
            floor.objects = Array.isArray(floor.objects) ? floor.objects : [];
            floor.expansionZones = Array.isArray(floor.expansionZones) ? floor.expansionZones : [];
        });
        state.shopName = typeof state.shopName === 'string' ? state.shopName.slice(0, 20) : '';
        state.shopNamePrompted = state.shopNamePrompted === true;
        state.unplacedEquipment = Array.isArray(state.unplacedEquipment)
            ? state.unplacedEquipment.filter(object => object && OBJECT_DEFS[object.type]).map(object => ({ ...object, id: String(object.id || object.type), locked: false }))
            : [];
        state.equipmentUnlocks = state.equipmentUnlocks && typeof state.equipmentUnlocks === 'object' ? state.equipmentUnlocks : {};
        state.activeFloorId = state.floors.some(f => f.id === state.activeFloorId) ? state.activeFloorId : MAIN_FLOOR_ID;
        state.player = state.player || { floorId: MAIN_FLOOR_ID, x: 6, y: 1, dir: 'down' };
        state.recipes = state.recipes || {};
        state.stock = state.stock || {};
        state.prices = state.prices || {};
        state.marketPrices = state.marketPrices || {};
        Object.keys(window.BLACKSMITH_RECIPE_CATALOG).forEach(id => {
            if (!state.recipes[id]) state.recipes[id] = { discovered: false, mastery: 0 };
            state.recipes[id].mastery = Math.max(0, Math.min(100, Number(state.recipes[id].mastery) || 0));
            state.recipes[id].discovered = state.recipes[id].discovered === true || state.recipes[id].mastery > 0;
            state.stock[id] = Math.max(0, Number(state.stock[id]) || 0);
            state.prices[id] = Math.max(1, Number(state.prices[id]) || getItemPrice(id));
            state.marketPrices[id] = Math.max(1, Number(state.marketPrices[id]) || getItemPrice(id));
        });
        state.marketDay = Number.isFinite(Number(state.marketDay)) ? Number(state.marketDay) : -1;
        state.serviceLayout = normalizeServiceLayout(state.serviceLayout);
        const validFloorIds = new Set(state.floors.map(floor => floor.id));
        if (!validFloorIds.has(state.serviceLayout.aiStandby.floorId)) state.serviceLayout.aiStandby.floorId = MAIN_FLOOR_ID;
        state.serviceLayout.queue.forEach(point => {
            if (!validFloorIds.has(point.floorId)) point.floorId = MAIN_FLOOR_ID;
        });
        state.floorMove = state.floorMove && state.floors.some(floor => floor.id === state.floorMove.floorId)
            ? { floorId: state.floorMove.floorId }
            : null;
        const productionDefaults = createProductionState(state.recipes);
        state.production = state.production && typeof state.production === 'object' ? state.production : productionDefaults;
        state.production.targets = state.production.targets || {};
        state.production.priorities = state.production.priorities || {};
        state.production.developmentPriorities = state.production.developmentPriorities || {};
        Object.keys(window.BLACKSMITH_RECIPE_CATALOG).forEach(id => {
            const hasTarget = Object.prototype.hasOwnProperty.call(state.production.targets, id);
            state.production.targets[id] = hasTarget ? Math.max(0, Math.floor(Number(state.production.targets[id]) || 0)) : 5;
            if (!BLACKSMITH_PRODUCTION_PRIORITIES.includes(state.production.priorities[id])) state.production.priorities[id] = 'normal';
            if (!BLACKSMITH_PRODUCTION_PRIORITIES.includes(state.production.developmentPriorities[id])) state.production.developmentPriorities[id] = 'normal';
        });
        state.production.orders = Array.isArray(state.production.orders) ? state.production.orders.filter(order => order && window.BLACKSMITH_RECIPE_CATALOG[order.recipeId] && Number(order.remaining) > 0).map(order => ({
            id: Math.max(1, Math.floor(Number(order.id) || 1)),
            recipeId: order.recipeId,
            remaining: Math.max(1, Math.floor(Number(order.remaining) || 1)),
            createdAt: Math.max(0, Number(order.createdAt) || Date.now())
        })) : [];
        state.production.nextOrderId = Math.max(1, Math.floor(Number(state.production.nextOrderId) || 1));
        state.production.roundRobinCursor = Math.max(0, Math.floor(Number(state.production.roundRobinCursor) || 0));
        state.loyalty = state.loyalty && typeof state.loyalty === 'object' ? state.loyalty : {};
        state.isBankrupt = state.isBankrupt === true || state.reputation <= 0;
        state.opening = state.opening && typeof state.opening === 'object' ? state.opening : null;
        if (state.opening) state.opening = { tutorial: state.opening.tutorial === true, target: { ...state.serviceLayout.aiStandby } };
        state.customers = Array.isArray(state.customers) ? state.customers.map((customer, index) => {
            const skin = customer.skin || customer.spriteFamily || 'robot';
            const traits = getBlacksmithCustomerTraits(skin);
            const status = customer.status === 'ordering' ? 'queued_checkout' : (customer.status || 'viewing');
            return {
                ...customer,
                id: Math.max(1, Number(customer.id) || index + 1),
                skin,
                name: customer.name || getBlacksmithCustomerName(skin),
                patience: Math.max(0, Number.isFinite(Number(customer.patience)) ? Number(customer.patience) : traits.patience),
                priceTolerance: Math.max(1, Number(customer.priceTolerance) || traits.priceTolerance),
                preferredCategory: customer.preferredCategory || traits.preferredCategory,
                status,
                reserved: customer.reserved !== false && !String(status).includes('leaving'),
                arrivalTick: Math.max(0, Number(customer.arrivalTick) || 0),
                queueJoinedAt: Math.max(0, Number(customer.queueJoinedAt) || Number(customer.arrivalTick) || index + 1),
                path: Array.isArray(customer.path) ? customer.path : []
            };
        }) : [];
        state.nextCustomerId = Math.max(1, Number(state.nextCustomerId) || (state.customers.reduce((max, customer) => Math.max(max, Number(customer.id) || 0), 0) + 1));
        state.logs = Array.isArray(state.logs) ? state.logs.slice(-30) : [];
        state.tactics = normalizeTactics(state.tactics);
        if (!state.tutorial || state.tutorial.version !== TUTORIAL_VERSION) {
            const preservedLayoutBackup = Array.isArray(state.tutorial?.layoutBackup) ? clone(state.tutorial.layoutBackup) : null;
            state.tutorial = createTutorialState();
            if (preservedLayoutBackup) state.tutorial.layoutBackup = preservedLayoutBackup;
            state.isOpen = false;
            state.work = null;
            state.service = null;
            state.floorMove = null;
            state.customers = [];
            state.player = { floorId: MAIN_FLOOR_ID, x: 6, y: 8, dir: 'left', path: [] };
            state.tactics = [];
            if (window.aiPet) window.aiPet.blacksmithTutorialCompleted = false;
        }
        state.tutorial.equipmentStep = Math.max(0, Math.min(BASIC_EQUIPMENT_LAYOUT.length, Number(state.tutorial.equipmentStep) || 0));
        state.tutorial.layoutPrepared = state.tutorial.layoutPrepared === true;
        state.tutorial.layoutBackup = Array.isArray(state.tutorial.layoutBackup) ? state.tutorial.layoutBackup : null;
        state.tutorial.dialoguePhase = typeof state.tutorial.dialoguePhase === 'string' ? state.tutorial.dialoguePhase : '';
        state.tutorial.dialogueIndex = Math.max(0, Math.floor(Number(state.tutorial.dialogueIndex) || 0));
        if (!state.tutorial.completed && !state.tutorial.layoutPrepared) prepareBlacksmithTutorialLayout(state);
        state.tutorial.master = state.tutorial.master || createTutorialMaster(state);
        state.tutorial.arrivalDelayTicks = Math.max(0, Number(state.tutorial.arrivalDelayTicks) || 0);
        state.tutorial.masterVisible = state.tutorial.completed ? false : state.tutorial.masterVisible !== false;
        if (state.tutorial.completed && state.tactics.length === 0) state.tactics = clone(DEFAULT_BLACKSMITH_TACTICS);
        if (window.aiPet && window.aiPet.blacksmithLayoutEditorUnlocked) state.editorUnlocked = true;
        if (state.level >= 5) {
            state.editorUnlocked = true;
            if (window.aiPet) window.aiPet.blacksmithLayoutEditorUnlocked = true;
        }
        const normalizedExpansion = ensureLevelFloors(state);
        // version 7以前の一マス階段だけを複数マス用の安全な既定位置へ移す。
        // version 8の複数マス配置は座標を保持し、各階の階段を個別に動かせるよう初期固定だけ解除する。
        normalizeStairConnections(state, previousVersion < 8);
        if (previousVersion < 9) {
            state.floors.forEach(floor => (floor.objects || []).forEach(object => {
                if (stairLayout(object.type)) object.locked = false;
            }));
        }
        grantUnlockedEquipment(state, true);
        if (normalizedExpansion.expanded) addLog(state, 'Lv5の店舗拡張を反映し、1階に床40マスを追加した。', '#80d8ff');
        return state;
    }

    function save() {
        if (window.BLACKSMITH_ROUTE_TEST) return;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        else if (typeof saveGameData === 'function') saveGameData();
    }

    function addLog(state, text, color = '#f5f5f5', speaker = '') {
        state.logs.push({ text, color, speaker, at: Date.now() });
        if (state.logs.length > 30) state.logs.shift();
    }

    function getFloor(state, floorId = MAIN_FLOOR_ID) {
        return state.floors.find(f => f.id === floorId) || state.floors[0];
    }

    function getObject(state, type) {
        for (const floor of state.floors) {
            const object = floor.objects.find(o => o.type === type);
            if (object) return { ...object, floorId: floor.id };
        }
        return null;
    }

    function isWalkable(floor, x, y) {
        if (!floor || x < 0 || y < 0 || x >= floor.width || y >= floor.height || floor.grid[y][x] !== 0) return false;
        return !objectPartAtCell(floor, x, y);
    }

    function usePoint(state, type) {
        const object = getObject(state, type);
        if (!object) return null;
        const floor = getFloor(state, object.floorId);
        const candidates = [
            { x: object.x, y: object.y + 1 }, { x: object.x + 1, y: object.y },
            { x: object.x - 1, y: object.y }, { x: object.x, y: object.y - 1 }
        ];
        const point = candidates.find(p => isWalkable(floor, p.x, p.y));
        return point ? { ...point, floorId: floor.id } : null;
    }

    function findFloorPath(floor, from, to) {
        if (!floor || !from || !to) return [];
        if (from.x === to.x && from.y === to.y) return [];
        if (!isWalkable(floor, to.x, to.y)) return [];
        const key = (x, y) => `${x},${y}`;
        const queue = [{ x: from.x, y: from.y }];
        const seen = new Set([key(from.x, from.y)]);
        const previous = new Map();
        while (queue.length) {
            const current = queue.shift();
            if (current.x === to.x && current.y === to.y) {
                const path = [];
                let cursor = current;
                while (key(cursor.x, cursor.y) !== key(from.x, from.y)) {
                    path.unshift({ x: cursor.x, y: cursor.y, floorId: floor.id });
                    cursor = previous.get(key(cursor.x, cursor.y));
                }
                return path;
            }
            for (const delta of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const next = { x: current.x + delta[0], y: current.y + delta[1] };
                const nextKey = key(next.x, next.y);
                if (!seen.has(nextKey) && isWalkable(floor, next.x, next.y)) {
                    seen.add(nextKey);
                    previous.set(nextKey, current);
                    queue.push(next);
                }
            }
        }
        return [];
    }

    function stairIsPlacedOnFloor(floor, object) {
        return stairPlacementErrors(floor, object).length === 0;
    }

    function stairConnectionCandidatesFrom(state, floorId) {
        const floor = state?.floors?.find(candidate => candidate.id === floorId);
        if (!floor) return [];
        return (floor.objects || []).filter(object => stairLayout(object.type) && object.targetFloorId).flatMap(object => {
            const targetFloor = state.floors.find(candidate => candidate.id === object.targetFloorId);
            const targetObject = targetFloor?.objects?.find(candidate => stairLayout(candidate.type)
                && candidate.type !== object.type
                && candidate.targetFloorId === floor.id);
            if (!targetFloor || !targetObject) return [];
            return [{ fromFloorId: floor.id, toFloorId: targetFloor.id, source: object, target: targetObject }];
        });
    }

    function stairConnectionsFrom(state, floorId) {
        const floor = state?.floors?.find(candidate => candidate.id === floorId);
        if (!floor) return [];
        return stairConnectionCandidatesFrom(state, floorId).filter(connection => {
            const targetFloor = state.floors.find(candidate => candidate.id === connection.toFloorId);
            return stairIsPlacedOnFloor(floor, connection.source) && stairIsPlacedOnFloor(targetFloor, connection.target);
        });
    }

    function findFloorTransitions(state, fromFloorId, toFloorId) {
        if (fromFloorId === toFloorId) return [];
        const queue = [{ floorId: fromFloorId, transitions: [] }];
        const seen = new Set([fromFloorId]);
        while (queue.length) {
            const current = queue.shift();
            for (const connection of stairConnectionsFrom(state, current.floorId)) {
                if (seen.has(connection.toFloorId)) continue;
                const transitions = [...current.transitions, connection];
                if (connection.toFloorId === toFloorId) return transitions;
                seen.add(connection.toFloorId);
                queue.push({ floorId: connection.toFloorId, transitions });
            }
        }
        return null;
    }

    function findPath(state, from, to) {
        if (!from || !to || !from.floorId || !to.floorId) return [];
        const firstFloor = state?.floors?.find(candidate => candidate.id === from.floorId);
        const targetFloor = state?.floors?.find(candidate => candidate.id === to.floorId);
        if (!firstFloor || !targetFloor) return [];
        if (from.floorId === to.floorId) return findFloorPath(firstFloor, from, to);
        const transitions = findFloorTransitions(state, from.floorId, to.floorId);
        if (!transitions) return [];
        const path = [];
        let cursor = { x: from.x, y: from.y, floorId: from.floorId };
        for (const transition of transitions) {
            const floor = state.floors.find(candidate => candidate.id === transition.fromFloorId);
            const approach = { ...stairPoint(transition.source, 'approach'), floorId: floor.id };
            const approachPath = findFloorPath(floor, cursor, approach);
            if ((cursor.x !== approach.x || cursor.y !== approach.y) && !approachPath.length) return [];
            path.push(...approachPath);
            const route = stairLayout(transition.source.type).route.map(offset => ({
                x: transition.source.x + offset.dx,
                y: transition.source.y + offset.dy,
                floorId: floor.id,
                stairStep: true
            }));
            path.push(...route);
            const terminal = route[route.length - 1];
            const landing = stairPoint(transition.target, 'exit');
            path.push({
                x: landing.x,
                y: landing.y,
                floorId: transition.toFloorId,
                floorTransition: true,
                fromFloorId: transition.fromFloorId,
                fromX: terminal.x,
                fromY: terminal.y,
                dir: stairLayout(transition.source.type).direction
            });
            cursor = { x: landing.x, y: landing.y, floorId: transition.toFloorId };
        }
        const finalPath = findFloorPath(targetFloor, cursor, to);
        if ((cursor.x !== to.x || cursor.y !== to.y) && !finalPath.length) return [];
        path.push(...finalPath);
        return path;
    }

    function directionBetween(from, to) {
        if (!from || !to) return 'down';
        if (to.x > from.x) return 'right';
        if (to.x < from.x) return 'left';
        if (to.y < from.y) return 'up';
        return 'down';
    }

    function syncBlacksmithFloorFade() {
        const overlay = document.getElementById('blacksmith-floor-fade');
        if (!overlay) return;
        const runtime = window.BLACKSMITH_FLOOR_FADE;
        overlay.classList.toggle('active', !!runtime && runtime.phase === 'out');
    }

    function clearBlacksmithFloorFade() {
        const runtime = window.BLACKSMITH_FLOOR_FADE;
        if (runtime?.timer) clearTimeout(runtime.timer);
        if (runtime?.clearTimer) clearTimeout(runtime.clearTimer);
        window.BLACKSMITH_FLOOR_FADE = null;
        syncBlacksmithFloorFade();
    }

    function applyMoverStep(entity, next, state) {
        entity.path.shift();
        entity.dir = next.dir || directionBetween(entity, next);
        entity.x = next.x;
        entity.y = next.y;
        entity.floorId = next.floorId || entity.floorId;
        if (next.floorTransition && state && entity === state.player) state.activeFloorId = entity.floorId;
    }

    function beginBlacksmithAiFloorFade(entity, state, next) {
        if (!state || entity !== state.player) return false;
        if (window.BLACKSMITH_FLOOR_FADE?.state === state) return true;
        const runtime = { state, entity, next, phase: 'out', timer: null, clearTimer: null };
        window.BLACKSMITH_FLOOR_FADE = runtime;
        if (typeof window.BLACKSMITH_FLOOR_FADE_HOOK === 'function') window.BLACKSMITH_FLOOR_FADE_HOOK('out', next);
        syncBlacksmithFloorFade();
        runtime.timer = setTimeout(() => {
            if (window.BLACKSMITH_FLOOR_FADE !== runtime || entity.path?.[0] !== next) return;
            applyMoverStep(entity, next, state);
            runtime.phase = 'in';
            window.BLACKSMITH_LAST_CAMERA_TRANSFORM = null;
            if (typeof window.BLACKSMITH_FLOOR_FADE_HOOK === 'function') window.BLACKSMITH_FLOOR_FADE_HOOK('switch', next);
            renderBlacksmith();
            syncBlacksmithFloorFade();
            runtime.clearTimer = setTimeout(() => {
                if (window.BLACKSMITH_FLOOR_FADE !== runtime) return;
                window.BLACKSMITH_FLOOR_FADE = null;
                if (typeof window.BLACKSMITH_FLOOR_FADE_HOOK === 'function') window.BLACKSMITH_FLOOR_FADE_HOOK('done', next);
                syncBlacksmithFloorFade();
            }, FLOOR_FADE_MS);
        }, FLOOR_FADE_MS);
        return true;
    }

    function stepMover(entity, state = window.BLACKSMITH_STATE) {
        if (!entity || !Array.isArray(entity.path) || !entity.path.length) return false;
        if (entity === state?.player && window.BLACKSMITH_FLOOR_FADE?.state === state) return true;
        const next = entity.path[0];
        if (next.floorTransition && (entity.floorId !== next.fromFloorId || entity.x !== next.fromX || entity.y !== next.fromY)) return false;
        if (next.floorTransition && entity === state?.player) return beginBlacksmithAiFloorFade(entity, state, next);
        applyMoverStep(entity, next, state);
        return true;
    }

    function learnBlacksmithTutorialWord(word) {
        const ai = window.aiPet;
        if (!ai) return;
        ai.apprentice = ai.apprentice || {};
        if (!Array.isArray(ai.apprentice.learnedWords)) ai.apprentice.learnedWords = [];
        if (!ai.apprentice.learnedWords.includes(word)) ai.apprentice.learnedWords.push(word);
        save();
    }

    function clearBlacksmithTutorialDialogue() {
        const runtime = window.BLACKSMITH_TUTORIAL_DIALOGUE;
        if (runtime && runtime.timer) clearTimeout(runtime.timer);
        window.BLACKSMITH_TUTORIAL_DIALOGUE = null;
    }

    function runBlacksmithTutorialDialogue(state, lines, onComplete) {
        if (!state || !Array.isArray(lines) || !lines.length) {
            if (typeof onComplete === 'function') onComplete();
            return;
        }
        clearBlacksmithTutorialDialogue();
        const dialoguePhase = state.tutorial?.phase || '';
        const resumeIndex = state.tutorial?.dialoguePhase === dialoguePhase ? Math.min(lines.length - 1, state.tutorial.dialogueIndex || 0) : 0;
        const runtime = {
            state,
            lines,
            index: resumeIndex - 1,
            line: null,
            timer: null,
            onComplete,
            dialoguePhase
        };
        window.BLACKSMITH_TUTORIAL_DIALOGUE = runtime;
        window.advanceBlacksmithTutorialDialogue();
    }

    window.advanceBlacksmithTutorialDialogue = function () {
        const runtime = window.BLACKSMITH_TUTORIAL_DIALOGUE;
        if (!runtime) return;
        if (runtime.timer) clearTimeout(runtime.timer);
        runtime.index += 1;
        runtime.line = runtime.lines[runtime.index] || null;
        if (!runtime.line) {
            const done = runtime.onComplete;
            if (runtime.state?.tutorial) {
                runtime.state.tutorial.dialoguePhase = '';
                runtime.state.tutorial.dialogueIndex = 0;
            }
            window.BLACKSMITH_TUTORIAL_DIALOGUE = null;
            if (typeof done === 'function') done();
            return;
        }
        if (runtime.state?.tutorial) {
            runtime.state.tutorial.dialoguePhase = runtime.dialoguePhase;
            runtime.state.tutorial.dialogueIndex = runtime.index;
        }
        addLog(runtime.state, runtime.line.text, runtime.line.color || '#f5f5f5', runtime.line.speaker);
        save();
        renderBlacksmith();
        runtime.timer = setTimeout(window.advanceBlacksmithTutorialDialogue, runtime.line.wait || 3400);
    };

    function beginBlacksmithTutorialArrival(state, restart = false) {
        if (!state || state.tutorial.completed) return;
        const tutorial = state.tutorial;
        prepareBlacksmithTutorialLayout(state);
        const entrance = getEntrance(state);
        const master = tutorial.master || createTutorialMaster(state);
        tutorial.master = master;
        tutorial.masterVisible = true;
        if (restart || tutorial.phase === 'arrival') {
            state.isOpen = false;
            state.activeFloorId = MAIN_FLOOR_ID;
            state.player = { floorId: MAIN_FLOOR_ID, x: Math.min(getFloor(state).width - 2, entrance.x + 1), y: entrance.y, dir: 'up', path: [] };
            master.floorId = MAIN_FLOOR_ID;
            master.x = Math.max(1, entrance.x - 1);
            master.y = entrance.y;
            master.dir = 'up';
            const insideY = Math.max(1, entrance.y - 1);
            state.player.path = findPath(state, state.player, { floorId: MAIN_FLOOR_ID, x: state.player.x, y: insideY });
            master.path = findPath(state, master, { floorId: MAIN_FLOOR_ID, x: master.x, y: insideY });
            tutorial.arrivalDelayTicks = 0;
            tutorial.phase = 'arrival';
        }
        save();
        renderBlacksmith();
    }

    function moveBlacksmithTutorialToMaterial(state) {
        const material = usePoint(state, 'material');
        const masterTarget = material ? { floorId: material.floorId, x: Math.min(getFloor(state).width - 2, material.x + 1), y: material.y } : null;
        state.player.path = material ? findPath(state, state.player, material) : [];
        state.tutorial.master.path = masterTarget ? findPath(state, state.tutorial.master, masterTarget) : [];
        state.tutorial.phase = 'to_material';
        save();
    }

    function startBlacksmithEquipmentReadyDialogue(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        const aiName = window.aiPet?.name || 'AI店員';
        state.tutorial.phase = 'equipment_ready_dialogue';
        runBlacksmithTutorialDialogue(state, [
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '素材置き場から仕上げ場まで、それに三つの商品棚。これで鍛冶屋の形になったね！' }
        ], () => moveBlacksmithTutorialToMaterial(state));
    }

    function beginBlacksmithEquipmentStep(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        const tutorial = state.tutorial;
        const step = BLACKSMITH_TUTORIAL_EQUIPMENT_STEPS[tutorial.equipmentStep];
        if (!step) {
            startBlacksmithEquipmentReadyDialogue(state);
            return;
        }
        const floorId = MAIN_FLOOR_ID;
        state.activeFloorId = floorId;
        state.player.floorId = floorId;
        tutorial.master.floorId = floorId;
        state.player.path = findPath(state, state.player, { floorId, x: step.player.x, y: step.player.y });
        tutorial.master.path = findPath(state, tutorial.master, { floorId, x: step.master.x, y: step.master.y });
        tutorial.phase = 'equipment_move';
        save();
        renderBlacksmith();
    }

    function startBlacksmithEquipmentPrompt(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        const tutorial = state.tutorial;
        const step = BLACKSMITH_TUTORIAL_EQUIPMENT_STEPS[tutorial.equipmentStep];
        if (!step) {
            startBlacksmithEquipmentReadyDialogue(state);
            return;
        }
        state.player.dir = step.player.dir;
        tutorial.master.dir = step.master.dir;
        tutorial.phase = 'equipment_prompt_dialogue';
        save();
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: step.prompt }
        ], () => {
            tutorial.phase = 'equipment_rule';
            save();
            window.openBlacksmithTacticEditor('equipment_rule');
        });
    }

    function placeBlacksmithEquipmentAfterRule(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return false;
        const tutorial = state.tutorial;
        const step = BLACKSMITH_TUTORIAL_EQUIPMENT_STEPS[tutorial.equipmentStep];
        if (!step) {
            startBlacksmithEquipmentReadyDialogue(state);
            return false;
        }
        placeBlacksmithTutorialEquipment(state, step.type);
        tutorial.phase = 'equipment_place_dialogue';
        save();
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: step.text }
        ], () => {
            tutorial.equipmentStep += 1;
            save();
            beginBlacksmithEquipmentStep(state);
        });
        return true;
    }

    function startBlacksmithTutorialIntro(state) {
        if (!state || state.tutorial.completed || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        state.tutorial.phase = 'intro_dialogue';
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……店を構えたか。悪くない。火を入れる前に、仕事の流れを教える。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '鍛冶師さん！来てくれたんだね。店をどう動かせばいいか、教えて！' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……店の様子と、その時にする仕事を一組にして覚えろ。俺がいなくても、上から順に判断できる。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '「どんな時に」「何をするか」を組み合わせて、順番に覚えるんだね。' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……そうだ。その指示の並びを、経営では「AIマインド」と呼ぶ。まず「かえる」で設備を整える。' }
        ], () => beginBlacksmithEquipmentStep(state));
    }

    function startBlacksmithCraftInstruction(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        state.tutorial.phase = 'craft_dialogue';
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……設備はそろった。素材置き場、炉、金床、冷却・水場の順に仕事を進める。' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……AIマインドを「もし 仕込める素材がある時 なら つくる」にしろ。素材がそろえば、ここから製作を始める。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '素材がそろっている時に「つくる」んだね。覚えたよ！' }
        ], () => {
            learnBlacksmithTutorialWord('つくる');
            state.tutorial.phase = 'craft_rule';
            save();
            window.openBlacksmithTacticEditor('craft_rule');
        });
    }

    function beginBlacksmithCraftDemo(state) {
        if (!state) return false;
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……指示は正しい。実際に一つ仕上げろ。手順を飛ばすな。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: 'うん！まずは素材の組み合わせを見てみるね。' }
        ], () => {
            grantTutorialMaterials(state);
            state.tutorial.phase = 'crafting';
            if (!startPreparation(state, 'eq_sword', true)) {
                addLog(state, '……練習用の素材と設備を確かめろ。もう一度「つくる」だ。', '#ff8a80', '鍛冶師');
                state.tutorial.phase = 'craft_rule';
            }
            save();
            renderBlacksmith();
        });
        return true;
    }

    function startBlacksmithSalesInstruction(state) {
        if (!state || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        state.tutorial.phase = 'sales_dialogue';
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……棚まで運べたな。次は販売だ。鍛冶屋では、金床の前で注文を受け、会計する。' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……AIマインドを「もし 金床前で注文・会計待ちのお客様がいる時 なら うる」にしろ。注文された品を棚から取り、金床へ戻れ。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '会計台はいらないんだね。金床前で待っているお客様には「うる」。覚えたよ！' }
        ], () => {
            learnBlacksmithTutorialWord('うる');
            state.tutorial.phase = 'sales_rule';
            save();
            window.openBlacksmithTacticEditor('sales_rule');
        });
    }

    function beginBlacksmithSalesDemo(state) {
        if (!state) return false;
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……設定は正しい。客を一人呼ぶ。棚を見て、金床の前へ来るまで待て。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '注文が決まったら、商品棚へ取りに行って会計するね！' }
        ], () => {
            state.tutorial.phase = 'sales';
            state.activeFloorId = MAIN_FLOOR_ID;
            beginBlacksmithOpening(state, true);
            save();
            renderBlacksmith();
        });
        return true;
    }

    function completeBlacksmithTutorial(state) {
        restoreBlacksmithTutorialLayout(state);
        state.tutorial.completed = true;
        state.tutorial.phase = 'completed';
        state.tutorial.masterVisible = false;
        state.isOpen = false;
        state.opening = null;
        state.tactics = normalizeTactics(state.tactics);
        if (window.aiPet) window.aiPet.blacksmithTutorialCompleted = true;
        addLog(state, '鍛冶師のチュートリアルが完了し、本格経営が解放された！', '#ffd54f');
        save();
        renderBlacksmith();
    }

    function completeBlacksmithShopNaming(state, requestedName) {
        const name = String(requestedName || '').trim();
        if (!state || !name) return false;
        state.shopName = name.slice(0, 20);
        state.shopNamePrompted = true;
        addLog(state, `鍛冶屋の名前を「${state.shopName}」に決めた。`, '#ffd54f');
        if (state.tutorial?.phase === 'shop_naming' && state.tutorial.master) {
            state.tutorial.master.path = findPath(state, state.tutorial.master, getEntrance(state));
            state.tutorial.phase = 'master_leaving';
        }
        save();
        renderBlacksmith();
        return true;
    }

    function openBlacksmithShopNameDialog(state) {
        if (!state || document.getElementById('blacksmith-shop-name-dialog')) return;
        const overlay = document.createElement('div');
        overlay.id = 'blacksmith-shop-name-dialog';
        overlay.className = 'blacksmith-modal-backdrop';
        const dialog = document.createElement('div');
        dialog.className = 'blacksmith-dialog blacksmith-message-dialog';
        const header = document.createElement('header');
        const heading = document.createElement('h2');
        heading.textContent = '鍛冶屋に名前をつける';
        header.appendChild(heading);
        const body = document.createElement('div');
        body.className = 'blacksmith-message-body blacksmith-name-form';
        const guide = document.createElement('p');
        guide.textContent = 'これから育てていく鍛冶屋の名前を決めてください。';
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 20;
        input.value = state.shopName || `${window.aiPet?.name || 'AI'}の鍛冶屋`;
        input.setAttribute('aria-label', '鍛冶屋の名前');
        const count = document.createElement('small');
        const error = document.createElement('div');
        error.className = 'blacksmith-name-error';
        const updateCount = () => { count.textContent = `${input.value.length}/20文字`; };
        input.addEventListener('input', updateCount);
        updateCount();
        body.append(guide, input, count, error);
        const footer = document.createElement('footer');
        const confirm = document.createElement('button');
        confirm.type = 'button';
        confirm.textContent = 'この名前に決める';
        const submit = () => {
            const name = input.value.trim();
            if (!name) {
                error.textContent = '1文字以上の名前を入力してください。';
                input.focus();
                return;
            }
            if (!completeBlacksmithShopNaming(state, name)) return;
            overlay.remove();
        };
        confirm.addEventListener('click', submit);
        input.addEventListener('keydown', event => { if (event.key === 'Enter') submit(); });
        footer.appendChild(confirm);
        dialog.append(header, body, footer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        setTimeout(() => { input.focus(); input.select(); }, 0);
    }

    function startBlacksmithShopNaming(state) {
        if (!state) return;
        state.tutorial.phase = 'shop_naming';
        save();
        openBlacksmithShopNameDialog(state);
    }

    function startBlacksmithTutorialFarewell(state) {
        if (!state || state.tutorial.phase === 'final_dialogue' || state.tutorial.phase === 'master_leaving' || state.tutorial.completed) return;
        state.tutorial.phase = 'final_dialogue';
        state.isOpen = false;
        state.opening = null;
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……製作も販売も問題ない。AIマインドは上から順に判断する。店の状況に合わせて、指示を組み替えろ。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '「つくる」と「うる」を使い分ければいいんだね。自分の店、しっかり育ててみるよ！' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……あとは、お前の鍛冶屋だ。迷ったら指示を見直せ。俺は戻る。' }
        ], () => {
            startBlacksmithShopNaming(state);
        });
    }

    function tickBlacksmithTutorial(state) {
        if (!state || state.tutorial.completed) return false;
        const tutorial = state.tutorial;
        const master = tutorial.master || (tutorial.master = createTutorialMaster(state));
        if (tutorial.phase === 'arrival') {
            if (tutorial.arrivalDelayTicks < 2) {
                tutorial.arrivalDelayTicks += 1;
                return true;
            }
            const playerMoved = stepMover(state.player, state);
            const masterMoved = stepMover(master);
            if (playerMoved || masterMoved) return true;
            state.player.dir = 'left';
            master.dir = 'right';
            startBlacksmithTutorialIntro(state);
            return true;
        }
        if (tutorial.phase === 'equipment_move') {
            const playerMoved = stepMover(state.player, state);
            const masterMoved = stepMover(master);
            if (!playerMoved && !masterMoved) startBlacksmithEquipmentPrompt(state);
            return true;
        }
        if (tutorial.phase === 'to_material') {
            const playerMoved = stepMover(state.player, state);
            const masterMoved = stepMover(master);
            if (!playerMoved && !masterMoved) startBlacksmithCraftInstruction(state);
            return true;
        }
        if (tutorial.phase === 'business_risk_move') {
            if (!tickTutorialMasterFollow(state, true)) startBlacksmithBusinessRiskDialogue(state);
            return true;
        }
        if (tutorial.phase === 'master_leaving') {
            if (!stepMover(master)) completeBlacksmithTutorial(state);
            return true;
        }
        return !['crafting', 'sales'].includes(tutorial.phase);
    }

    function resumeBlacksmithTutorial(state) {
        if (!state || state.tutorial.completed) return;
        const phase = state.tutorial.phase;
        if (phase === 'arrival') {
            beginBlacksmithTutorialArrival(state, true);
        } else if (phase === 'intro_dialogue') {
            startBlacksmithTutorialIntro(state);
        } else if (phase === 'equipment_move') {
            beginBlacksmithEquipmentStep(state);
        } else if (phase === 'equipment_prompt_dialogue') {
            startBlacksmithEquipmentPrompt(state);
        } else if (phase === 'equipment_rule') {
            window.openBlacksmithTacticEditor('equipment_rule');
        } else if (phase === 'equipment_place_dialogue') {
            placeBlacksmithEquipmentAfterRule(state);
        } else if (phase === 'equipment_ready_dialogue') {
            startBlacksmithEquipmentReadyDialogue(state);
        } else if (phase === 'to_material') {
            const material = usePoint(state, 'material');
            const masterTarget = material ? { floorId: material.floorId, x: Math.min(getFloor(state).width - 2, material.x + 1), y: material.y } : null;
            if (!state.player.path?.length && material) state.player.path = findPath(state, state.player, material);
            if (!state.tutorial.master.path?.length && masterTarget) state.tutorial.master.path = findPath(state, state.tutorial.master, masterTarget);
        } else if (phase === 'craft_dialogue') {
            startBlacksmithCraftInstruction(state);
        } else if (phase === 'craft_rule') {
            window.openBlacksmithTacticEditor('craft_rule');
        } else if (phase === 'crafting' && !state.work) {
            beginBlacksmithCraftDemo(state);
        } else if (phase === 'sales_dialogue') {
            startBlacksmithSalesInstruction(state);
        } else if (phase === 'sales_rule') {
            window.openBlacksmithTacticEditor('sales_rule');
        } else if (phase === 'sales') {
            if (!state.isOpen && !state.opening) beginBlacksmithOpening(state, true);
            else if (state.isOpen && (!state.tutorial.customerSpawned || !state.customers.length)) state.tutorial.customerSpawned = spawnCustomer(state, 'eq_sword', true);
        } else if (phase === 'business_risk_move') {
            const target = tutorialCompanionTarget(state);
            if (target && !state.tutorial.master.path?.length) state.tutorial.master.path = findPath(state, state.tutorial.master, target);
        } else if (phase === 'business_risk_dialogue') {
            startBlacksmithBusinessRiskDialogue(state);
        } else if (phase === 'final_dialogue') {
            state.tutorial.phase = 'sales';
            startBlacksmithTutorialFarewell(state);
        } else if (phase === 'shop_naming') {
            openBlacksmithShopNameDialog(state);
        } else if (phase === 'master_leaving' && !state.tutorial.master.path?.length) {
            state.tutorial.master.path = findPath(state, state.tutorial.master, getEntrance(state));
        }
        renderBlacksmith();
    }

    function inventoryCount(id) {
        const inventory = window.aiPet && Array.isArray(window.aiPet.inventory) ? window.aiPet.inventory : [];
        return inventory.reduce((sum, item) => sum + (itemId(item) === id ? 1 : 0), 0);
    }

    function hasMaterials(recipe, quantity = 1) {
        return Object.entries(recipe.materials).every(([id, count]) => inventoryCount(id) >= count * quantity);
    }

    function consumeMaterials(recipe, quantity = 1) {
        if (!window.aiPet || !Array.isArray(window.aiPet.inventory) || !hasMaterials(recipe, quantity)) return false;
        for (const [id, count] of Object.entries(recipe.materials)) {
            for (let index = 0; index < count * quantity; index++) {
                const found = window.aiPet.inventory.findIndex(item => itemId(item) === id);
                if (found < 0) return false;
                window.aiPet.inventory.splice(found, 1);
            }
        }
        return true;
    }

    function grantTutorialMaterials(state) {
        if (state.tutorial.materialsGranted || !window.aiPet) return;
        if (!Array.isArray(window.aiPet.inventory)) window.aiPet.inventory = [];
        const recipe = window.BLACKSMITH_RECIPE_CATALOG.eq_sword;
        Object.entries(recipe.materials).forEach(([id, required]) => {
            const shortage = Math.max(0, required - inventoryCount(id));
            for (let i = 0; i < shortage; i++) window.aiPet.inventory.push({ id, age: 0 });
        });
        state.tutorial.materialsGranted = true;
        addLog(state, '鍛冶師がチュートリアル用の素材を素材置き場に用意した。', '#ffd166');
    }

    function installedType(state, types) {
        return types.find(type => !!getObject(state, type)) || null;
    }

    function hasInstalledEquipment(state, type) {
        return !!getObject(state, type);
    }

    function shelfType(state, category) {
        return hasInstalledEquipment(state, 'shelf_royal') ? 'shelf_royal' : `shelf_${category}`;
    }

    function materialStationType(state) {
        return installedType(state, ['material_large', 'material']);
    }

    function furnaceStationType(state, recipe) {
        if ((recipe?.equipment || []).includes('magic_furnace')) return hasInstalledEquipment(state, 'magic_furnace') ? 'magic_furnace' : null;
        return installedType(state, ['magic_furnace', 'furnace']);
    }

    function anvilStationType(state, recipe) {
        if ((recipe?.equipment || []).includes('master_anvil')) return hasInstalledEquipment(state, 'master_anvil') ? 'master_anvil' : null;
        return installedType(state, ['master_anvil', 'anvil']);
    }

    function floorInteriorTheme(floor) {
        return INTERIOR_THEMES[floor?.interiorTheme] || INTERIOR_THEMES.standard_a;
    }

    function hasLuxuryInterior(state) {
        return floorInteriorTheme(getFloor(state, MAIN_FLOOR_ID)).luxury === true;
    }

    function blacksmithSalePrice(state, productId) {
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[productId];
        let multiplier = 1;
        if (recipe?.equipment?.includes('precision_tools') && hasInstalledEquipment(state, 'precision_tools')) multiplier += BLACKSMITH_BONUSES.precisionPrice;
        if (recipe?.equipment?.includes('armor_finishing') && hasInstalledEquipment(state, 'armor_finishing')) multiplier += BLACKSMITH_BONUSES.armorPrice;
        if (hasInstalledEquipment(state, 'shelf_royal')) multiplier += BLACKSMITH_BONUSES.royalShelfPrice;
        return Math.max(1, Math.round((Number(state.prices[productId]) || getItemPrice(productId)) * multiplier));
    }

    function getMaxReputation(level) {
        if (level >= 30) return 130;
        if (level >= 28) return 120;
        if (level >= 26) return 110;
        if (level >= 22) return 100;
        if (level >= 19) return 90;
        if (level >= 16) return 80;
        if (level >= 12) return 70;
        if (level >= 7) return 60;
        if (level >= 4) return 50;
        return 40;
    }

    function recipeMaterialText(recipe) {
        return Object.entries(recipe.materials).map(([id, count]) => `${getMaterialName(id)}×${count}`).join('、');
    }

    function recipeMaterialStatus(recipe) {
        return Object.entries(recipe.materials).map(([id, count]) => `${getMaterialName(id)} ${inventoryCount(id)}/${count}`).join('、');
    }

    function blacksmithEquipmentIsAvailable(state, equipmentId) {
        const equipment = window.BLACKSMITH_EQUIPMENT_CATALOG[equipmentId];
        if (!state || !equipment || state.level < equipment.unlockLevel) return false;
        if (equipmentId === 'basic_forge') {
            return !!materialStationType(state) && !!furnaceStationType(state) && !!anvilStationType(state) && !!getObject(state, 'cooling');
        }
        const objectTypes = Array.isArray(equipment.objectTypes) ? equipment.objectTypes : [];
        if (!objectTypes.length) return false;
        const installedTypes = new Set((state.floors || []).flatMap(floor => floor.objects || []).map(object => object.type));
        return objectTypes.every(type => installedTypes.has(type));
    }

    function missingBlacksmithRecipeEquipment(state, recipe) {
        return (recipe?.equipment || []).filter(equipmentId => !blacksmithEquipmentIsAvailable(state, equipmentId));
    }

    function hasBlacksmithRecipeEquipment(state, recipe) {
        return missingBlacksmithRecipeEquipment(state, recipe).length === 0;
    }

    function recipeEquipmentText(recipe) {
        return (recipe?.equipment || []).map(equipmentId => window.BLACKSMITH_EQUIPMENT_CATALOG[equipmentId]?.name || equipmentId).join('、');
    }

    function recipeEquipmentStatus(state, recipe) {
        return (recipe?.equipment || []).map(equipmentId => {
            const equipment = window.BLACKSMITH_EQUIPMENT_CATALOG[equipmentId];
            const name = equipment?.name || equipmentId;
            if (blacksmithEquipmentIsAvailable(state, equipmentId)) return `${name} ✓`;
            return state.level < Number(equipment?.unlockLevel || 1) ? `${name}（未解放）` : `${name}（未設置）`;
        }).join('、');
    }

    function reservedMaterialCounts(state, excludedOrderId = null) {
        const reserved = {};
        (state.production?.orders || []).forEach(order => {
            if (order.id === excludedOrderId) return;
            const recipe = window.BLACKSMITH_RECIPE_CATALOG[order.recipeId];
            if (!recipe) return;
            Object.entries(recipe.materials).forEach(([id, count]) => {
                reserved[id] = (reserved[id] || 0) + count * Math.max(0, Number(order.remaining) || 0);
            });
        });
        if (state.work?.orderId && !state.work.materialsConsumed) {
            const recipe = window.BLACKSMITH_RECIPE_CATALOG[state.work.recipeId];
            Object.entries(recipe?.materials || {}).forEach(([id, count]) => {
                reserved[id] = (reserved[id] || 0) + count * Math.max(1, Number(state.work.quantity) || 1);
            });
        }
        return reserved;
    }

    function craftableQuantity(state, recipeId, options = {}) {
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!recipe) return 0;
        const reserved = options.ignoreReservations ? {} : reservedMaterialCounts(state, options.excludedOrderId ?? null);
        return Math.max(0, Math.min(...Object.entries(recipe.materials).map(([id, count]) => Math.floor(Math.max(0, inventoryCount(id) - (reserved[id] || 0)) / count))));
    }

    function productionLimits(state, recipeId) {
        const additional = craftableQuantity(state, recipeId);
        return { exactMax: additional, targetMax: (state.stock[recipeId] || 0) + additional };
    }

    function selectScheduledRecipe(state) {
        const orders = (state.production?.orders || []).slice().sort((a, b) => (a.createdAt - b.createdAt) || (a.id - b.id));
        const readyOrder = orders.find(order => {
            const recipe = window.BLACKSMITH_RECIPE_CATALOG[order.recipeId];
            return recipe && hasBlacksmithRecipeEquipment(state, recipe) && craftableQuantity(state, order.recipeId, { ignoreReservations: true }) > 0;
        });
        if (readyOrder) return { recipeId: readyOrder.recipeId, orderId: readyOrder.id, source: 'order' };

        const candidates = [];
        Object.entries(window.BLACKSMITH_RECIPE_CATALOG).forEach(([id, recipe], index) => {
            if (!hasBlacksmithRecipeEquipment(state, recipe) || craftableQuantity(state, id) <= 0) return;
            const recipeState = state.recipes[id];
            if (recipeState.mastery < 100) {
                const priority = state.production.developmentPriorities[id];
                if (BLACKSMITH_PRIORITY_WEIGHT[priority] > 0) {
                    candidates.push({ recipeId: id, source: 'development', priority: BLACKSMITH_PRIORITY_WEIGHT[priority], deficit: (100 - recipeState.mastery) / 100, index });
                }
                return;
            }
            const target = Math.max(0, Number(state.production.targets[id]) || 0);
            const deficit = target - (state.stock[id] || 0);
            const priority = state.production.priorities[id];
            if (deficit > 0 && BLACKSMITH_PRIORITY_WEIGHT[priority] > 0) {
                candidates.push({ recipeId: id, source: 'target', priority: BLACKSMITH_PRIORITY_WEIGHT[priority], deficit: deficit / Math.max(1, target), index });
            }
        });
        if (!candidates.length) return null;
        const cursor = state.production.roundRobinCursor % Object.keys(window.BLACKSMITH_RECIPE_CATALOG).length;
        candidates.sort((a, b) => (b.priority - a.priority) || (b.deficit - a.deficit) || (((a.index - cursor + 1000) % 1000) - ((b.index - cursor + 1000) % 1000)));
        const selected = candidates[0];
        state.production.roundRobinCursor = selected.index + 1;
        return selected;
    }

    function refreshBlacksmithMarket(state, force = false) {
        const day = Math.floor(Date.now() / 86400000);
        if (!force && state.marketDay === day) return false;
        const intel = Math.max(0, Number(window.aiPet?.stats?.intel) || 0);
        Object.entries(window.BLACKSMITH_RECIPE_CATALOG).forEach(([id, recipe]) => {
            const base = getItemPrice(id);
            const hash = stableHash(`${id}:${day}`);
            const categoryFactor = recipe.category === 'weapon' ? 1.04 : recipe.category === 'armor' ? 1.01 : 0.98;
            const market = Math.max(10, Math.round(base * categoryFactor * (0.9 + (hash % 21) / 100)));
            const appraisal = 0.98 + Math.min(0.06, intel / 3000);
            state.marketPrices[id] = market;
            state.prices[id] = Math.max(1, Math.round(market * appraisal));
        });
        state.marketDay = day;
        addLog(state, '鍛冶市場の相場を確認し、販売価格を更新した。', '#80d8ff');
        return true;
    }

    function productionRoute(state, recipe) {
        const furnace = furnaceStationType(state, recipe);
        const anvil = anvilStationType(state, recipe);
        const route = [
            { type: materialStationType(state), workTicks: 2, speech: '素材を確認して、必要な分を運ぶよ。' },
            { type: furnace, workTicks: furnace === 'magic_furnace' ? 4 : 5, speech: furnace === 'magic_furnace' ? '魔力炉で素材を熱するよ。' : '炉で素材を熱するよ。' },
            { type: anvil, workTicks: anvil === 'master_anvil' ? 4 : 5, speech: anvil === 'master_anvil' ? '名工の金床で形を整えるよ。' : '金床で形を整えるよ。' },
            { type: 'cooling', workTicks: 3, speech: '冷却・水場で焼きを整えるよ。' }
        ];
        if ((recipe?.equipment || []).includes('precision_tools')) route.push({ type: 'precision_tools', workTicks: 4, speech: '精密工具台で細部を仕上げるよ。' });
        if ((recipe?.equipment || []).includes('armor_finishing')) route.push({ type: 'armor_finishing', workTicks: 4, speech: '防具仕上げ台で強度と着け心地を整えるよ。' });
        route.push({ type: shelfType(state, recipe.category), workTicks: 1, speech: '完成品を商品棚へ並べるよ。' });
        return route;
    }

    function preparationQuantity(state, recipeId, tutorialForced, source) {
        const recipeState = state.recipes[recipeId];
        if (tutorialForced || !recipeState || recipeState.mastery < 100 || !hasInstalledEquipment(state, 'material_large')) return 1;
        let limit = 2;
        if (source?.source === 'order') {
            const order = state.production.orders.find(candidate => candidate.id === source.orderId);
            limit = Math.min(limit, Math.max(0, Number(order?.remaining) || 0));
        } else if (source?.source === 'target') {
            limit = Math.min(limit, Math.max(0, (Number(state.production.targets[recipeId]) || 0) - (Number(state.stock[recipeId]) || 0)));
        } else {
            limit = 1;
        }
        const craftable = craftableQuantity(state, recipeId, { ignoreReservations: source?.source === 'order' });
        return Math.max(0, Math.min(limit, craftable));
    }

    function startPreparation(state, recipeId, tutorialForced = false, source = null) {
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!recipe || state.work || state.service || state.floorMove || state.isOpen || !hasBlacksmithRecipeEquipment(state, recipe)) return false;
        const quantity = preparationQuantity(state, recipeId, tutorialForced, source);
        const route = productionRoute(state, recipe);
        const routePoints = route.map(step => step.type ? usePoint(state, step.type) : null);
        const materialPoint = routePoints[0];
        if (!quantity || !materialPoint || routePoints.some(point => !point)) return false;
        let routeCursor = state.player;
        for (const routePoint of routePoints) {
            const alreadyThere = routeCursor.floorId === routePoint.floorId && routeCursor.x === routePoint.x && routeCursor.y === routePoint.y;
            if (!alreadyThere && !findPath(state, routeCursor, routePoint).length) return false;
            routeCursor = routePoint;
        }
        const path = findPath(state, state.player, materialPoint);
        state.work = {
            recipeId,
            phase: 'route',
            route,
            routeIndex: 0,
            workTicksRemaining: null,
            path,
            quantity,
            materialsConsumed: false,
            tutorialForced,
            orderId: source?.orderId || null,
            productionSource: source?.source || (tutorialForced ? 'tutorial' : 'manual')
        };
        if (state.work.orderId) {
            const order = state.production.orders.find(candidate => candidate.id === state.work.orderId);
            if (order) {
                order.remaining -= quantity;
                if (order.remaining <= 0) state.production.orders = state.production.orders.filter(candidate => candidate.id !== order.id);
            }
        }
        state.player.path = path;
        customerSpeech(state, state.player, `${getItemName(recipeId)}を${quantity}個作るよ。まずは素材を確認しよう。`, '#80d8ff', window.aiPet?.name || 'AI店員');
        return true;
    }

    function finishPreparation(state) {
        const work = state.work;
        const routeTest = window.BLACKSMITH_ROUTE_TEST?.state === state && window.BLACKSMITH_ROUTE_TEST.kind === 'preparation';
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[work.recipeId];
        const quantity = Math.max(1, Number(work.quantity) || 1);
        state.stock[work.recipeId] = (state.stock[work.recipeId] || 0) + quantity;
        customerSpeech(state, state.player, `${getItemName(work.recipeId)}が${quantity}個完成したよ。${OBJECT_DEFS[shelfType(state, recipe.category)].name}へ並べたよ。`, '#8be28b', window.aiPet?.name || 'AI店員');
        state.work = null;
        state.player.path = [];
        if (!state.tutorial.completed && state.tutorial.phase === 'crafting') {
            state.isOpen = false;
            addLog(state, '……次は販売だ。客への動きを見せろ。', '#ffd166', '鍛冶師');
            startBlacksmithSalesInstruction(state);
        }
        save();
        if (routeTest) finishBlacksmithRouteTest('仕込み動線テストが完了しました。素材・在庫・レシピ進捗は開始前の状態へ戻しました。');
    }

    function tickPreparation(state) {
        const work = state.work;
        if (!work) return;
        if (stepMover(state.player, state)) return;
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[work.recipeId];
        const recipeState = state.recipes[work.recipeId];
        const step = work.route?.[work.routeIndex];
        if (!step) {
            state.work = null;
            return;
        }
        if (work.workTicksRemaining === null || work.workTicksRemaining === undefined) {
            work.workTicksRemaining = Math.max(1, Number(step.workTicks) || 1);
            customerSpeech(state, state.player, step.speech, '#80d8ff', window.aiPet?.name || 'AI店員');
        }
        work.workTicksRemaining -= 1;
        if (work.workTicksRemaining > 0) return;
        if (step.type === materialStationType(state) && !work.materialsConsumed) {
            if (!consumeMaterials(recipe, work.quantity)) {
                if (work.orderId) {
                    const order = state.production.orders.find(candidate => candidate.id === work.orderId);
                    if (order) order.remaining += work.quantity;
                    else state.production.orders.push({ id: work.orderId, recipeId: work.recipeId, remaining: work.quantity, createdAt: Date.now() });
                }
                customerSpeech(state, state.player, '予約した素材が足りないみたい。入荷するまでこの注文は待とう。', '#ff8a80', window.aiPet?.name || 'AI店員');
                state.work = null;
                return;
            }
            work.materialsConsumed = true;
            if (!recipeState.discovered) {
                recipeState.discovered = true;
                addLog(state, `${recipeMaterialText(recipe)}の組み合わせから${getItemName(work.recipeId)}をひらめいた！`, '#80d8ff');
            }
        }
        if (step.type === 'cooling') {
            const intel = Math.max(0, Number(window.aiPet?.stats?.intel) || 0);
            const gain = work.tutorialForced ? 100 : Math.min(40, 25 + Math.floor(intel / 25));
            recipeState.mastery = Math.min(100, recipeState.mastery + gain);
            customerSpeech(state, state.player, `冷却完了。${getItemName(work.recipeId)}のレシピ完成度は${recipeState.mastery}%だよ。`, '#80deea', window.aiPet?.name || 'AI店員');
            if (recipeState.mastery < 100) {
                state.work = null;
                save();
                return;
            }
        }
        if (work.routeIndex >= work.route.length - 1) {
            finishPreparation(state);
            return;
        }
        work.routeIndex += 1;
        work.workTicksRemaining = null;
        const next = work.route[work.routeIndex];
        work.path = findPath(state, state.player, usePoint(state, next.type));
        state.player.path = work.path;
    }

    function getEntrance(state) {
        const floor = getFloor(state, MAIN_FLOOR_ID);
        const entrance = floor.entrance && floor.entrance.length ? floor.entrance[Math.floor(floor.entrance.length / 2)] : { x: 5, y: floor.height - 1 };
        return { ...entrance, floorId: MAIN_FLOOR_ID };
    }

    function reservedStockCount(state, productId) {
        return state.customers.filter(customer => customer.productId === productId && customer.reserved).length;
    }

    function availableStock(state, productId) {
        return Math.max(0, (state.stock[productId] || 0) - reservedStockCount(state, productId));
    }

    function getUnlockedBlacksmithSkins() {
        const discovered = Array.isArray(window.aiPet?.discoveredMonsters)
            ? window.aiPet.discoveredMonsters.filter(skin => typeof skin === 'string' && !skin.includes('dummy') && !skin.includes('insurance'))
            : [];
        const candidates = discovered.length ? discovered : [window.aiPet?.currentSkin || window.aiPet?.baseType || 'robot'];
        const valid = [...new Set(candidates)].filter(skin => !window.DUNGEON_SPRITES || !!resolveCharacterSprite(skin, 'down'));
        return valid.length ? valid : ['robot'];
    }

    function chooseCustomerProduct(state, skin, forcedProductId) {
        if (forcedProductId && availableStock(state, forcedProductId) > 0) return forcedProductId;
        const traits = getBlacksmithCustomerTraits(skin);
        const stocked = Object.keys(window.BLACKSMITH_RECIPE_CATALOG).filter(id => state.recipes[id].mastery >= 100 && availableStock(state, id) > 0);
        const weighted = stocked.flatMap(id => Array(window.BLACKSMITH_RECIPE_CATALOG[id].category === traits.preferredCategory ? 3 : 1).fill(id));
        return weighted[Math.floor(Math.random() * weighted.length)] || null;
    }

    function indoorCustomerCount(state) {
        return state.customers.filter(customer => customer.status !== 'outside_waiting' && !!customer.floorId).length;
    }

    function admitOutsideCustomers(state) {
        const capacity = Math.max(1, state.serviceLayout.queue.length);
        let free = Math.max(0, capacity - indoorCustomerCount(state));
        const entrance = { ...state.serviceLayout.customerEntry };
        state.customers.filter(customer => customer.status === 'outside_waiting').sort((a, b) => a.arrivalTick - b.arrivalTick).forEach(customer => {
            if (free <= 0) return;
            const recipe = window.BLACKSMITH_RECIPE_CATALOG[customer.productId];
            const shelf = usePoint(state, shelfType(state, recipe.category));
            if (!shelf) return;
            customer.floorId = entrance.floorId;
            customer.x = entrance.x;
            customer.y = entrance.y;
            customer.dir = entrance.dir;
            customer.status = 'viewing';
            customer.path = findPath(state, entrance, shelf);
            customerSpeech(state, customer, `${getItemName(customer.productId)}を見せてください。`, '#fff', customer.name);
            free -= 1;
        });
    }

    function spawnCustomer(state, forcedProductId = null, tutorial = false) {
        if (state.isBankrupt) return false;
        const skins = getUnlockedBlacksmithSkins();
        const skin = skins[Math.floor(Math.random() * skins.length)] || 'robot';
        const productId = chooseCustomerProduct(state, skin, forcedProductId);
        if (!productId) return false;
        const traits = getBlacksmithCustomerTraits(skin);
        const id = state.nextCustomerId++;
        const entrance = { ...state.serviceLayout.customerEntry };
        const outside = indoorCustomerCount(state) >= Math.max(1, state.serviceLayout.queue.length);
        const customer = {
            id,
            productId,
            floorId: outside ? null : entrance.floorId,
            x: entrance.x,
            y: entrance.y,
            dir: entrance.dir,
            skin,
            name: getBlacksmithCustomerName(skin),
            status: outside ? 'outside_waiting' : 'viewing',
            path: [],
            patience: tutorial ? 999 : traits.patience,
            maxPatience: tutorial ? 999 : traits.patience,
            priceTolerance: tutorial ? 99 : traits.priceTolerance + (hasLuxuryInterior(state) ? BLACKSMITH_BONUSES.luxuryPriceTolerance : 0),
            preferredCategory: traits.preferredCategory,
            reserved: true,
            arrivalTick: state.tick,
            queueJoinedAt: 0,
            queueTargetIndex: null,
            tutorial
        };
        if (!outside) {
            const recipe = window.BLACKSMITH_RECIPE_CATALOG[productId];
            customer.path = findPath(state, entrance, usePoint(state, shelfType(state, recipe.category)));
        }
        state.customers.push(customer);
        if (outside) customerSpeech(state, customer, '列が進むまで店の外で待ちます。', '#ce93d8', customer.name);
        else customerSpeech(state, customer, `${getItemName(productId)}を見せてください。`, '#fff', customer.name);
        return true;
    }

    function sendCustomerAway(state, customer, reason, reputationLoss = 1) {
        if (!customer || String(customer.status).includes('leaving')) return;
        customer.reserved = false;
        customer.status = 'leaving';
        if (customer.floorId) customer.path = findPath(state, customer, getEntrance(state));
        else customer.path = [];
        const traits = getBlacksmithCustomerTraits(customer.skin);
        state.loyalty[customer.skin] = Math.max(0, (state.loyalty[customer.skin] || 0) - traits.loyaltyDrop);
        const adjustedLoss = reputationLoss * (hasLuxuryInterior(state) ? BLACKSMITH_BONUSES.luxuryReputationLossMultiplier : 1);
        state.reputation = Math.max(0, state.reputation - adjustedLoss);
        customerSpeech(state, customer, reason, '#ff5252', customer.name);
        if (state.reputation <= 0) triggerBlacksmithBankruptcy(state);
    }

    function reflowCustomerQueue(state) {
        const serviceCustomerId = state.service?.customerId || null;
        const queue = state.customers
            .filter(customer => customer.floorId && customer.id !== serviceCustomerId && ['queued_checkout', 'waiting_checkout'].includes(customer.status))
            .sort((a, b) => (a.queueJoinedAt - b.queueJoinedAt) || (a.id - b.id));
        queue.forEach((customer, index) => {
            const targetIndex = index + (serviceCustomerId ? 1 : 0);
            const target = state.serviceLayout.queue[targetIndex];
            if (!target) return;
            if (customer.queueTargetIndex !== targetIndex || (!customer.path.length && (customer.floorId !== target.floorId || customer.x !== target.x || customer.y !== target.y))) {
                customer.queueTargetIndex = targetIndex;
                customer.path = findPath(state, customer, target);
            }
            if (!customer.path.length && customer.floorId === target.floorId && customer.x === target.x && customer.y === target.y) {
                customer.dir = target.dir;
                customer.status = targetIndex === 0 ? 'waiting_checkout' : 'queued_checkout';
            } else {
                customer.status = 'queued_checkout';
            }
        });
    }

    function startService(state, customer) {
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[customer.productId];
        const shelf = usePoint(state, shelfType(state, recipe.category));
        if (!shelf || state.stock[customer.productId] <= 0) {
            sendCustomerAway(state, customer, `${getItemName(customer.productId)}が売り切れなら、先に言ってほしかったです。`, 2);
            return;
        }
        state.service = {
            customerId: customer.id,
            productId: customer.productId,
            phase: 'to_shelf',
            path: findPath(state, state.player, shelf),
            holdingProduct: false
        };
        state.player.path = state.service.path;
        customerSpeech(state, state.player, `${customer.name}さん、ご注文ありがとうございます。${getItemName(customer.productId)}を取ってきます。`, '#80d8ff', window.aiPet?.name || 'AI店員');
    }

    function completeCheckout(state, customer) {
        const price = blacksmithSalePrice(state, customer.productId);
        state.stock[customer.productId] = Math.max(0, state.stock[customer.productId] - 1);
        state.money += price;
        state.totalSales += 1;
        state.exp += 25;
        const reputationGain = 1 + (hasInstalledEquipment(state, 'shelf_royal') ? BLACKSMITH_BONUSES.royalShelfReputation : 0);
        state.reputation = Math.min(getMaxReputation(state.level), state.reputation + reputationGain);
        if (window.aiPet) window.aiPet.gold = Math.max(0, Number(window.aiPet.gold) || 0) + price;
        customer.reserved = false;
        state.loyalty[customer.skin] = (state.loyalty[customer.skin] || 0) + 1;
        customerSpeech(state, state.player, `${customer.name}さん、${price}Gです。ありがとうございました！`, '#69f0ae', window.aiPet?.name || 'AI店員');
        customerSpeech(state, customer, `${getItemName(customer.productId)}、大切に使います。`, '#ffd180', customer.name);
        customer.status = 'leaving';
        customer.path = findPath(state, customer, getEntrance(state));
        state.service = null;
        applyLevelUps(state);
        save();
    }

    function tickService(state) {
        const service = state.service;
        if (!service) return;
        const customer = state.customers.find(c => c.id === service.customerId);
        if (!customer) {
            state.service = null;
            return;
        }
        if (stepMover(state.player, state)) return;
        if (service.phase === 'to_shelf') {
            service.holdingProduct = true;
            service.phase = 'to_anvil';
            const standby = { ...state.serviceLayout.aiStandby };
            service.path = findPath(state, state.player, standby);
            state.player.path = service.path;
            customerSpeech(state, state.player, `${getItemName(service.productId)}を棚から取り出したよ。金床へ戻ろう。`, '#ffe082', window.aiPet?.name || 'AI店員');
        } else {
            state.player.dir = state.serviceLayout.aiStandby.dir;
            completeCheckout(state, customer);
        }
    }

    function tutorialCompanionTarget(state) {
        const floor = getFloor(state, MAIN_FLOOR_ID);
        const candidates = [
            { x: state.player.x - 1, y: state.player.y },
            { x: state.player.x + 1, y: state.player.y },
            { x: state.player.x, y: state.player.y - 1 },
            { x: state.player.x, y: state.player.y + 1 },
            { x: state.player.x - 2, y: state.player.y },
            { x: state.player.x + 2, y: state.player.y }
        ];
        const point = candidates.find(candidate => isWalkable(floor, candidate.x, candidate.y) && !(candidate.x === state.player.x && candidate.y === state.player.y));
        return point ? { ...point, floorId: MAIN_FLOOR_ID } : null;
    }

    function tickTutorialMasterFollow(state, forceClose = false) {
        const master = state?.tutorial?.master;
        if (!master || !state.tutorial.masterVisible || state.player.floorId !== MAIN_FLOOR_ID) return false;
        const distance = Math.abs(master.x - state.player.x) + Math.abs(master.y - state.player.y);
        if (!master.path?.length && (forceClose || distance > 3)) {
            const target = tutorialCompanionTarget(state);
            if (target) master.path = findPath(state, master, target);
        }
        return stepMover(master);
    }

    function finishTutorial(state) {
        state.isOpen = false;
        state.tutorial.phase = 'business_risk_move';
        const target = tutorialCompanionTarget(state);
        state.tutorial.master.path = target ? findPath(state, state.tutorial.master, target) : [];
        save();
    }

    function startBlacksmithBusinessRiskDialogue(state) {
        if (!state || state.tutorial.completed || window.BLACKSMITH_TUTORIAL_DIALOGUE) return;
        state.tutorial.phase = 'business_risk_dialogue';
        state.isOpen = false;
        state.opening = null;
        const aiName = window.aiPet?.name || 'AI店員';
        runBlacksmithTutorialDialogue(state, [
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……最後に一つ。客を待たせすぎたり、相場から外れた値を付ければ、評判は落ちる。ゼロなら経営破綻だ。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: '経営破綻したら、もう鍛冶屋は続けられないの？' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……マイホームの金庫から「現在の鍛冶屋Lv×5000G」を払えば、今のLvと評判上限まで立て直せる。' },
            { target: 'master', speaker: '鍛冶師', color: '#ff9800', text: '……払えなければ倒産を受け入れろ。店と在庫、手持ちのGoldと鍛冶素材は失うが、覚えたレシピと金庫・倉庫は残る。再建すればLv1からだ。' },
            { target: 'player', speaker: aiName, color: '#00bcd4', text: 'わかった。評判とお客様の待ち時間も見ながら経営するね。説明はチュートリアルから何度でも見返せるんだね！' }
        ], () => {
            if (typeof window.unlockTutorialEntry === 'function') window.unlockTutorialEntry('business.blacksmith_bankruptcy');
            startBlacksmithTutorialFarewell(state);
        });
    }

    function tickCustomers(state) {
        admitOutsideCustomers(state);
        reflowCustomerQueue(state);
        for (const customer of [...state.customers]) {
            const isWaiting = ['outside_waiting', 'viewing', 'queued_checkout', 'waiting_checkout'].includes(customer.status) && state.service?.customerId !== customer.id;
            if (isWaiting && state.isOpen) {
                customer.patience = Math.max(0, customer.patience - 1);
                if (customer.patience <= 0) {
                    sendCustomerAway(state, customer, `${getItemName(customer.productId)}を待ちきれません。もう帰ります！`, 2);
                }
            }
            if (customer.status === 'outside_waiting') continue;
            if (stepMover(customer, state)) continue;
            if (customer.status === 'viewing') {
                const price = blacksmithSalePrice(state, customer.productId);
                const market = Math.max(1, Number(state.marketPrices[customer.productId]) || getItemPrice(customer.productId));
                if (price > market * customer.priceTolerance) {
                    sendCustomerAway(state, customer, `${getItemName(customer.productId)}が相場より高すぎます。今回は買いません！`, 1);
                    continue;
                }
                customer.status = 'queued_checkout';
                customer.queueJoinedAt = state.tick;
                customerSpeech(state, customer, `${getItemName(customer.productId)}に決めました。会計をお願いします。`, '#ce93d8', customer.name);
                reflowCustomerQueue(state);
            } else if (customer.status === 'leaving') {
                const routeTest = customer.blacksmithRouteTest === true;
                state.customers = state.customers.filter(c => c.id !== customer.id);
                addLog(state, `${customer.name}が鍛冶屋を出た。`, '#b39ddb');
                if (customer.tutorial && !state.tutorial.completed) finishTutorial(state);
                if (routeTest) {
                    finishBlacksmithRouteTest('販売動線テストが完了しました。売上・在庫・評判などは開始前の状態へ戻しました。');
                    return;
                }
            }
        }
        reflowCustomerQueue(state);
        if (!state.service) {
            const waiting = state.customers.find(c => c.status === 'waiting_checkout');
            if (waiting && getTacticAction(state, 'customer_waiting') === 'serve') startService(state, waiting);
        }
    }

    function applyLevelUps(state) {
        while (state.level < 30) {
            const required = state.level * 100;
            if (state.exp < required) break;
            state.exp -= required;
            state.level += 1;
            if (state.level >= 5) {
                state.editorUnlocked = true;
                if (window.aiPet) window.aiPet.blacksmithLayoutEditorUnlocked = true;
            }
            const floorChange = ensureLevelFloors(state);
            const equipmentGranted = grantUnlockedEquipment(state);
            const milestone = window.BLACKSMITH_LEVEL_MILESTONES[state.level - 1];
            addLog(state, `鍛冶屋Lv${state.level}になった！ ${milestone.label}`, '#ffd54f');
            if (equipmentGranted.length && document.getElementById('blacksmith-management-ui')) {
                const equipmentMessage = equipmentGranted[0] === 'magic_furnace'
                    ? '魔力炉を入手し、炉と入れ替えて設置しました。炉は未設置設備へ収納しました。'
                    : `${equipmentGranted.map(type => OBJECT_DEFS[type].name).join('、')}を入手しました。模様替えから設置できます。`;
                showBlacksmithGameDialog({
                    title: '新しい鍛冶設備を入手しました',
                    message: equipmentMessage,
                    tone: 'success'
                });
            }
            if (floorChange.expanded) {
                addLog(state, '店舗を拡張し、1階に床40マスが増えた。模様替えでは青い枠で確認できる。', '#80d8ff');
                if (document.getElementById('blacksmith-management-ui')) {
                    showBlacksmithGameDialog({
                        title: '店舗を拡張しました',
                        message: '鍛冶屋Lv5の到達により、1階に床40マスを追加しました。模様替えでは追加された範囲を青い枠で表示します。',
                        tone: 'success'
                    });
                }
            }
        }
    }

    function beginBlacksmithOpening(state, tutorial = false) {
        if (!state || state.isOpen || state.opening || state.floorMove || state.isBankrupt) return false;
        const target = { ...state.serviceLayout.aiStandby };
        const alreadyThere = state.player.floorId === target.floorId && state.player.x === target.x && state.player.y === target.y;
        const path = alreadyThere ? [] : findPath(state, state.player, target);
        if (!alreadyThere && !path.length) {
            addLog(state, '金床後方の待機位置まで移動できないため、開店を中止した。模様替えで動線を確認してください。', '#ff8a80');
            if (!tutorial) showBlacksmithGameDialog({ title: '開店準備を完了できません', message: 'AI店員が金床後方の待機位置まで移動できません。模様替えで床と設備の動線を確認してください。', tone: 'warning' });
            return false;
        }
        state.opening = { tutorial, target };
        state.player.path = path;
        customerSpeech(state, state.player, '金床の後ろへ移動して、開店準備をするね。', '#80d8ff', window.aiPet?.name || 'AI店員');
        if (alreadyThere) tickBlacksmithOpening(state);
        return true;
    }

    function tickBlacksmithOpening(state) {
        if (!state?.opening) return false;
        if (stepMover(state.player, state)) return true;
        const opening = state.opening;
        state.player.dir = opening.target.dir;
        state.opening = null;
        state.isOpen = true;
        refreshBlacksmithMarket(state);
        customerSpeech(state, state.player, '準備完了。鍛冶屋を開店します！', '#69f0ae', window.aiPet?.name || 'AI店員');
        if (opening.tutorial && !state.tutorial.customerSpawned) {
            state.tutorial.customerSpawned = spawnCustomer(state, 'eq_sword', true);
        }
        save();
        return true;
    }

    function beginBlacksmithFloorMove(state, floorId) {
        const targetFloor = state?.floors?.find(floor => floor.id === floorId);
        if (!targetFloor || !state.player || state.floorMove || state.work || state.service || state.opening || state.isOpen) return false;
        if (state.player.floorId === floorId) {
            state.player.path = [];
            state.floorMove = null;
            state.activeFloorId = floorId;
            return true;
        }
        const candidates = (targetFloor.objects || []).filter(object => stairLayout(object.type)).map(object => {
            const exit = stairPoint(object, 'exit');
            const target = exit ? { ...exit, floorId } : null;
            const path = target ? findPath(state, state.player, target) : [];
            return { path, target };
        }).filter(candidate => candidate.path.length).sort((a, b) => a.path.length - b.path.length);
        if (!candidates.length) return false;
        state.activeFloorId = state.player.floorId;
        state.player.path = candidates[0].path;
        state.floorMove = { floorId };
        return true;
    }

    function tickBlacksmithFloorMove(state) {
        if (!state?.floorMove) return false;
        if (stepMover(state.player, state)) return true;
        const arrived = state.player.floorId === state.floorMove.floorId;
        if (arrived) state.activeFloorId = state.player.floorId;
        state.floorMove = null;
        state.player.path = [];
        save();
        return arrived;
    }

    function tickBlacksmith() {
        if (window.GameShell && window.GameShell.isPaused()) return;
        const state = window.BLACKSMITH_STATE;
        if (!state || state.paused || state.isBankrupt || window.BLACKSMITH_EDITOR || window.BLACKSMITH_TACTIC_EDITOR || window.BLACKSMITH_PRODUCTION_EDITOR) return;
        state.tick += 1;
        if (tickBlacksmithTutorial(state)) {
            renderBlacksmith();
            return;
        }
        if (state.opening) tickBlacksmithOpening(state);
        else if (state.work) tickPreparation(state);
        else if (state.service) tickService(state);
        else if (state.floorMove) tickBlacksmithFloorMove(state);
        if (state.isOpen) {
            tickCustomers(state);
            if (state.tutorial.completed && state.tick % 12 === 0) {
                const max = window.BLACKSMITH_LEVEL_MILESTONES[state.level - 1].maxCustomers;
                if (state.customers.length < max) spawnCustomer(state);
            }
        } else if (state.tutorial.completed && !state.work && !state.floorMove && state.tick % 5 === 0 && getTacticAction(state, 'can_prepare') === 'prepare') {
            const scheduled = selectScheduledRecipe(state);
            if (scheduled) startPreparation(state, scheduled.recipeId, false, scheduled);
        }
        if (!state.tutorial.completed && ['crafting', 'sales'].includes(state.tutorial.phase)) tickTutorialMasterFollow(state);
        renderBlacksmith();
    }

    function getBlacksmithSafe() {
        const collection = typeof assets !== 'undefined' ? assets : (window.assets || {});
        const hut = Object.values(collection).find(asset => asset && asset.type === 'hut');
        return hut?.storage?.safe || null;
    }

    function triggerBlacksmithBankruptcy(state) {
        if (!state || state.isBankrupt) return;
        state.reputation = 0;
        state.isBankrupt = true;
        state.isOpen = false;
        state.opening = null;
        state.service = null;
        state.floorMove = null;
        state.customers = [];
        state.player.path = [];
        addLog(state, '評判が0になり、鍛冶屋は経営破綻した。救済か倒産を選んでください。', '#ff5252');
        save();
        renderBlacksmith();
        showBlacksmithBankruptcyOverlay(state);
    }

    function showBlacksmithBankruptcyOverlay(state = window.BLACKSMITH_STATE) {
        if (!state?.isBankrupt || document.getElementById('blacksmith-bankruptcy-overlay')) return;
        const safe = getBlacksmithSafe();
        const safeGold = Math.max(0, Number(safe?.gold) || 0);
        const cost = state.level * 5000;
        const overlay = document.createElement('div');
        overlay.id = 'blacksmith-bankruptcy-overlay';
        overlay.className = 'blacksmith-modal-backdrop';
        overlay.innerHTML = `<div class="blacksmith-dialog blacksmith-bankruptcy-dialog">
            <header><div><h2 style="color:#ff6b6b;">💥 鍛冶屋の経営破綻</h2><p>評判が0になりました。続け方を選んでください。</p></div></header>
            <div class="blacksmith-bankruptcy-options">
                <section class="blacksmith-bankruptcy-option"><h3>💰 金庫から救済</h3><p>現在の鍛冶屋Lv${state.level}を維持し、評判を上限の${getMaxReputation(state.level)}まで回復します。<br>必要額：${cost}G<br>金庫：${safeGold}G</p><button onclick="window.executeBlacksmithBailout()" ${safeGold >= cost ? '' : 'disabled'}>${cost}Gを支払って再建</button></section>
                <section class="blacksmith-bankruptcy-option danger"><h3>🏳️ 倒産を受け入れる</h3><p>店をマップから失い、手持ちGold・鍛冶素材・在庫・Lv・売上を失います。レシピの完成度、永久解放した模様替え、マイホームの金庫と倉庫は残ります。</p><button class="danger-button" onclick="window.executeBlacksmithForeclosure()">倒産して店を手放す</button></section>
            </div>
        </div>`;
        document.body.appendChild(overlay);
    }

    window.executeBlacksmithBailout = function () {
        const state = window.BLACKSMITH_STATE;
        const safe = getBlacksmithSafe();
        const cost = state ? state.level * 5000 : 0;
        if (!state || !safe || (Number(safe.gold) || 0) < cost) return;
        safe.gold -= cost;
        state.reputation = getMaxReputation(state.level);
        state.isBankrupt = false;
        state.isOpen = false;
        state.opening = null;
        state.service = null;
        state.customers = [];
        state.player = { ...state.serviceLayout.aiStandby, path: [] };
        state.activeFloorId = state.player.floorId;
        addLog(state, '金庫の資金で鍛冶屋を立て直し、評判が上限まで回復した。', '#ffd54f');
        document.getElementById('blacksmith-bankruptcy-overlay')?.remove();
        save();
        renderBlacksmith();
    };

    function showBlacksmithForeclosureNotice() {
        const overlay = document.createElement('div');
        overlay.id = 'blacksmith-foreclosure-notice';
        overlay.className = 'blacksmith-modal-backdrop';
        overlay.innerHTML = `<div class="blacksmith-dialog blacksmith-bankruptcy-dialog"><header><div><h2 style="color:#ff6b6b;">鍛冶屋を手放しました</h2></div></header><div style="padding:24px;line-height:1.8;color:#ddd;">鍛冶屋はマップからなくなり、手持ちのGoldと鍛冶素材は差し押さえられました。<br>マイホームの金庫・倉庫、覚えたレシピ、永久解放した模様替えは無事です。鍛冶屋を再建すると、基本設備つきのLv1・評判40/40から再開します。</div><footer><button onclick="document.getElementById('blacksmith-foreclosure-notice')?.remove()">閉じる</button></footer></div>`;
        document.body.appendChild(overlay);
    }

    window.executeBlacksmithForeclosure = function () {
        const state = window.BLACKSMITH_STATE;
        const building = window.currentBlacksmithBuilding;
        if (!state || !building || !window.aiPet) return;
        window.aiPet.savedBlacksmithRecipes = clone(state.recipes);
        window.aiPet.blacksmithBusinessRebuildPending = true;
        if (state.editorUnlocked) window.aiPet.blacksmithLayoutEditorUnlocked = true;
        window.aiPet.blacksmithTutorialCompleted = true;
        window.aiPet.gold = 0;
        const smithMaterials = new Set(Object.values(window.BLACKSMITH_RECIPE_CATALOG).flatMap(recipe => Object.keys(recipe.materials)));
        if (Array.isArray(window.aiPet.inventory)) window.aiPet.inventory = window.aiPet.inventory.filter(item => !smithMaterials.has(itemId(item)));
        const collection = typeof assets !== 'undefined' ? assets : (window.assets || {});
        const buildingId = Object.keys(collection).find(id => collection[id] === building || id === building.id);
        if (buildingId) delete collection[buildingId];
        document.getElementById('blacksmith-bankruptcy-overlay')?.remove();
        window.closeBlacksmithMapUI();
        window.currentBlacksmithBuilding = null;
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        if (typeof updateStatUI === 'function') updateStatUI();
        save();
        showBlacksmithForeclosureNotice();
    };

    function spriteBackground(spriteKey, width, height) {
        const sprite = window.BLACKSMITH_SPRITES[spriteKey];
        if (!sprite) return '';
        const spriteScale = Math.max(0.001, Number(sprite.scale) || 1);
        const sw = Math.max(1, Number(sprite.sw) || 1);
        const sh = Math.max(1, Number(sprite.sh) || 1);
        const scaleX = spriteScale * width / sw;
        const scaleY = spriteScale * height / sh;
        const iw = Number(sprite.iw) || 2816;
        const ih = Number(sprite.ih) || 1536;
        const cropW = sw * scaleX;
        const cropH = sh * scaleY;
        const positionX = (width - cropW) / 2 - (Number(sprite.sx) || 0) * scaleX;
        const positionY = (height - cropH) / 2 - (Number(sprite.sy) || 0) * scaleY;
        return `background-image:url('${sprite.img}');background-repeat:no-repeat;background-size:${iw * scaleX}px ${ih * scaleY}px;background-position:${positionX}px ${positionY}px;`;
    }

    function floorThemeSprites(floor) {
        const theme = floorInteriorTheme(floor);
        return { floor: theme.floorSprite, wall: theme.wallSprite };
    }

    function blacksmithSpriteLayout(sprite, width = TILE, height = TILE) {
        const sw = Math.max(1, Number(sprite?.sw) || 1);
        const sh = Math.max(1, Number(sprite?.sh) || 1);
        const spriteScale = Math.max(0.001, Number(sprite?.scale) || 1);
        // 床・壁・階段パーツは一マス全体へ合わせる。通常設備は一マス幅・縦横比維持・下中央基準。
        const renderScaleX = spriteScale * width / sw;
        const renderScaleY = sprite?.tileFill ? spriteScale * height / sh : renderScaleX;
        const cropWidth = sw * renderScaleX;
        const cropHeight = sh * renderScaleY;
        return {
            width,
            height,
            renderScale: renderScaleX,
            renderScaleX,
            renderScaleY,
            cropWidth,
            cropHeight,
            cropLeft: (width - cropWidth) / 2,
            cropTop: height - cropHeight
        };
    }

    function spriteElement(spriteKey, className, x, y, z, width = TILE, height = TILE) {
        const sprite = window.BLACKSMITH_SPRITES[spriteKey];
        const div = document.createElement('div');
        div.className = className;
        div.dataset.spriteKey = spriteKey;
        div.style.cssText = `position:absolute;left:${x * TILE + (Number(sprite?.x) || 0)}px;top:${y * TILE + (Number(sprite?.y) || 0)}px;width:${width}px;height:${height}px;overflow:visible;z-index:${z};pointer-events:none;`;
        if (!sprite) return div;
        const layout = blacksmithSpriteLayout(sprite, width, height);
        const inner = document.createElement('div');
        inner.style.cssText = `position:absolute;left:50%;bottom:0;margin-left:${-Math.max(1, Number(sprite.sw) || 1) / 2}px;width:${Math.max(1, Number(sprite.sw) || 1)}px;height:${Math.max(1, Number(sprite.sh) || 1)}px;background-image:url('${sprite.img}');background-position:${-(Number(sprite.sx) || 0)}px ${-(Number(sprite.sy) || 0)}px;background-repeat:no-repeat;transform:scale(${layout.renderScaleX},${layout.renderScaleY});transform-origin:bottom center;image-rendering:auto;`;
        div.appendChild(inner);
        return div;
    }

    function resolveCharacterSprite(family, dir) {
        const ai = window.aiPet || {};
        const skin = family || ai.currentSkin || ai.type || ai.baseType || 'robot';
        const base = String(skin).split('_')[0];
        const candidates = [`${skin}_${dir}`, `${base}_${dir}`, `robot_${dir}`, 'smith_down'];
        return candidates.find(key => window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[key]);
    }

    function characterElement(family, dir, x, y, z, className, existingElement = null) {
        const key = resolveCharacterSprite(family, dir || 'down');
        if (key && typeof window.createDungeonSprite === 'function') {
            const reusableElement = existingElement?.firstElementChild ? existingElement : null;
            const div = window.createDungeonSprite(key, z, 1, false, TILE, reusableElement);
            if (div) {
                div.className = className;
                div.dataset.spriteKey = key;
                const sp = window.DUNGEON_SPRITES[key];
                const width = Math.max(1, Number(sp.sw) || TILE);
                const height = Math.max(1, Number(sp.sh) || TILE);
                const baseScale = Number(sp.scale) || 1;
                const visualFit = Math.min(1, (TILE * 1.2) / (width * baseScale), (TILE * 1.9) / (height * baseScale));
                const inner = div.firstElementChild;
                if (inner) {
                    inner.style.transform = `scale(${baseScale * visualFit})`;
                    inner.style.transformOrigin = 'bottom center';
                }
                div.style.position = 'absolute';
                div.style.transition = reusableElement ? `left ${ACTOR_MOVE_MS}ms linear, top ${ACTOR_MOVE_MS}ms linear` : 'none';
                div.style.willChange = 'left, top';
                div.style.left = `${x * TILE + (TILE - width) / 2 + (sp.x || 0)}px`;
                div.style.top = `${y * TILE + TILE - height + (sp.y || 0)}px`;
                div.style.alignItems = 'flex-end';
                div.style.zIndex = z;
                div.style.pointerEvents = 'none';
                if (String(className).split(/\s+/).includes('blacksmith-player') && typeof window.applyDungeonWalkCosmetics === 'function') window.applyDungeonWalkCosmetics(div, window.aiPet, key);
                return div;
            }
        }
        const fallback = existingElement || document.createElement('div');
        fallback.className = className;
        fallback.textContent = family === 'smith' ? '🧔' : '🤖';
        fallback.style.position = 'absolute';
        fallback.style.transition = existingElement ? `left ${ACTOR_MOVE_MS}ms linear, top ${ACTOR_MOVE_MS}ms linear` : 'none';
        fallback.style.willChange = 'left, top';
        fallback.style.left = `${x * TILE + 70}px`;
        fallback.style.top = `${y * TILE + 55}px`;
        fallback.style.fontSize = '110px';
        fallback.style.zIndex = z;
        fallback.style.pointerEvents = 'none';
        return fallback;
    }

    function syncBlacksmithActor(stage, id, family, dir, x, y, z, className) {
        const existing = document.getElementById(id);
        const element = characterElement(family, dir, x, y, z, `${className} blacksmith-map-actor`, existing);
        if (existing && element !== existing) existing.remove();
        element.id = id;
        if (element.parentElement !== stage) stage.appendChild(element);
        return element;
    }

    function appendBlacksmithTutorialSpeech(stage, state, floor) {
        const runtime = window.BLACKSMITH_TUTORIAL_DIALOGUE;
        const line = runtime && runtime.state === state ? runtime.line : null;
        if (!line || floor.id !== MAIN_FLOOR_ID) return;
        const target = line.target === 'master' ? state.tutorial.master : state.player;
        if (!target || target.floorId !== floor.id) return;
        const bubble = document.createElement('div');
        bubble.className = 'blacksmith-map-speech blacksmith-tutorial-speech';
        const width = 700;
        const left = Math.max(20, Math.min(floor.width * TILE - width - 20, target.x * TILE - width / 2 + TILE / 2));
        const top = Math.max(20, target.y * TILE - 280);
        bubble.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${width}px;z-index:2000;background:rgba(15,18,22,.96);border:5px solid ${line.color || '#fff'};border-radius:24px;padding:22px 28px;color:#fff;box-sizing:border-box;box-shadow:0 12px 40px #000;cursor:pointer;pointer-events:auto;`;
        bubble.onclick = window.advanceBlacksmithTutorialDialogue;
        const speaker = document.createElement('div');
        speaker.textContent = line.speaker || '';
        speaker.style.cssText = `color:${line.color || '#fff'};font-weight:bold;font-size:27px;margin-bottom:10px;`;
        const text = document.createElement('div');
        text.textContent = line.text;
        text.style.cssText = 'font-size:32px;line-height:1.55;white-space:pre-wrap;';
        const hint = document.createElement('div');
        hint.textContent = 'クリックで会話を進める';
        hint.style.cssText = 'margin-top:12px;color:#aaa;font-size:21px;text-align:right;';
        bubble.appendChild(speaker);
        bubble.appendChild(text);
        bubble.appendChild(hint);
        stage.appendChild(bubble);
    }

    function appendBlacksmithEventSpeech(stage, state, floor) {
        const entities = [state.player, ...state.customers].filter(entity => entity && entity.floorId === floor.id && entity.speechText && Number(entity.speechUntilTick) >= state.tick);
        entities.forEach(entity => {
            const bubble = document.createElement('div');
            bubble.className = 'blacksmith-map-speech blacksmith-event-speech';
            const width = 620;
            const left = Math.max(20, Math.min(floor.width * TILE - width - 20, entity.x * TILE - width / 2 + TILE / 2));
            const top = Math.max(20, entity.y * TILE - 225);
            bubble.style.left = `${left}px`;
            bubble.style.top = `${top}px`;
            bubble.style.zIndex = 1800;
            bubble.style.borderColor = entity.speechColor || '#fff';
            const speaker = document.createElement('strong');
            speaker.textContent = entity.speechSpeaker || '';
            speaker.style.cssText = `display:block;margin-bottom:6px;color:${entity.speechColor || '#fff'};font-size:22px;`;
            const text = document.createElement('div');
            text.textContent = entity.speechText;
            text.style.cssText = 'font-size:27px;line-height:1.45;white-space:pre-wrap;';
            bubble.append(speaker, text);
            stage.appendChild(bubble);
        });
    }

    function ensureUi() {
        let ui = document.getElementById('blacksmith-management-ui');
        if (ui) return ui;
        if (!document.getElementById('blacksmith-business-styles')) {
            const style = document.createElement('style');
            style.id = 'blacksmith-business-styles';
            style.textContent = `
                #blacksmith-management-ui button,.blacksmith-dialog button{border:1px solid rgba(255,255,255,.24);border-radius:9px;padding:9px 13px;color:#fff;background:linear-gradient(180deg,#4b535c,#262b31);box-shadow:inset 0 1px rgba(255,255,255,.12),0 3px 9px rgba(0,0,0,.35);font-weight:800;cursor:pointer;transition:transform .12s,filter .12s,border-color .12s}
                #blacksmith-management-ui button:hover:not(:disabled),.blacksmith-dialog button:hover:not(:disabled){filter:brightness(1.18);transform:translateY(-1px);border-color:#ffcc80}
                #blacksmith-management-ui button:disabled,.blacksmith-dialog button:disabled{opacity:.38;cursor:not-allowed;box-shadow:none}
                #blacksmith-management-ui select,.blacksmith-dialog select,.blacksmith-dialog input{border:1px solid #7c8793;border-radius:7px;padding:7px 9px;color:#fff;background:#171b20;font-weight:700}
                #blacksmith-floor-fade{position:absolute;inset:0;z-index:9000;pointer-events:none;background:#000;opacity:0;transition:opacity ${FLOOR_FADE_MS}ms ease-in-out}#blacksmith-floor-fade.active{opacity:1}
                .blacksmith-modal-backdrop{position:fixed;inset:0;z-index:85000;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:radial-gradient(circle at 50% 30%,rgba(95,55,25,.28),rgba(0,0,0,.88));font-family:sans-serif}
                .blacksmith-dialog{width:min(1120px,96vw);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;color:#f7f3ea;background:linear-gradient(145deg,#24282d,#111316);border:3px solid #d9842b;border-radius:18px;box-shadow:0 24px 80px #000,inset 0 0 40px rgba(255,145,40,.06)}
                .blacksmith-dialog header,.blacksmith-dialog footer{display:flex;align-items:center;gap:12px;padding:14px 18px;background:linear-gradient(90deg,#452b1b,#25282d);border-bottom:1px solid #85552e}
                .blacksmith-dialog header>div{flex:1}.blacksmith-dialog h2,.blacksmith-dialog h3{margin:0;color:#ffd08a}.blacksmith-dialog header p{margin:4px 0 0;color:#c7c1b8;font-size:12px}.blacksmith-dialog footer{justify-content:flex-end;border-top:1px solid #85552e;border-bottom:0}
                .blacksmith-production-body{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(250px,.75fr);gap:16px;padding:16px;overflow:auto}.blacksmith-production-body section,.blacksmith-production-body aside{display:flex;flex-direction:column;gap:10px}.blacksmith-production-card{display:grid;grid-template-columns:minmax(220px,1fr) 1fr;gap:9px 16px;padding:13px;border:1px solid #5b626b;border-radius:12px;background:linear-gradient(135deg,rgba(255,152,0,.12),rgba(255,255,255,.025))}.blacksmith-production-card.development{border-color:#507d8c;background:linear-gradient(135deg,rgba(0,188,212,.12),rgba(255,255,255,.025))}.blacksmith-production-card>div{grid-column:1/-1;display:flex;justify-content:space-between;gap:10px}.blacksmith-production-card>small{grid-column:1/-1;color:#9fcdd5}.blacksmith-production-card label{display:flex;align-items:center;justify-content:space-between;gap:8px}.blacksmith-counter{display:inline-flex;align-items:center;gap:4px}.blacksmith-counter input{width:92px;text-align:right}.blacksmith-counter button{padding:6px 9px}.blacksmith-order-button{grid-column:2}.blacksmith-order-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border:1px solid #62523f;border-radius:9px;background:#211b16}.blacksmith-production-empty{padding:16px;color:#999;border:1px dashed #555;border-radius:9px}.blacksmith-production-body aside p{color:#aaa;font-size:12px;line-height:1.6}
                .blacksmith-bankruptcy-dialog{width:min(850px,96vw);border-color:#ff5252}.blacksmith-bankruptcy-options{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:22px}.blacksmith-bankruptcy-option{padding:18px;border:2px solid #8a6032;border-radius:13px;background:#17191c}.blacksmith-bankruptcy-option.danger{border-color:#a43b3b}.blacksmith-bankruptcy-option h3{color:#ffd166}.blacksmith-bankruptcy-option.danger h3{color:#ff7777}.blacksmith-bankruptcy-option p{color:#ccc;line-height:1.65}.blacksmith-bankruptcy-option button{width:100%;margin-top:8px}.blacksmith-bankruptcy-option .danger-button{background:linear-gradient(#ef5350,#a51d1d)}
                .blacksmith-message-dialog{width:min(620px,94vw)}.blacksmith-message-body{padding:22px;font-size:16px;line-height:1.75;white-space:pre-wrap;color:#e7e2d9}.blacksmith-message-dialog.warning{border-color:#ffb74d}.blacksmith-message-dialog.danger{border-color:#ff5252}.blacksmith-message-actions{display:flex;justify-content:flex-end;gap:10px;width:100%}.blacksmith-message-actions .danger-button{background:linear-gradient(#ef5350,#a51d1d)}
                .blacksmith-name-form{display:grid;gap:10px}.blacksmith-name-form input{width:100%;box-sizing:border-box;padding:12px 14px;border:2px solid #8d6e63;border-radius:8px;background:#111;color:#fff;font-size:20px}.blacksmith-name-form small{justify-self:end;color:#aaa}.blacksmith-name-error{min-height:1.5em;color:#ff8a80;font-size:13px}
                .blacksmith-tactic-dialog{width:min(980px,96vw)}.blacksmith-tactic-body{overflow:auto;padding:16px}.blacksmith-tactic-rule{display:grid;grid-template-columns:48px minmax(210px,1fr) 42px minmax(150px,.7fr) auto;gap:9px;align-items:center;margin:10px 0;padding:13px;border:1px solid #495765;border-radius:12px;background:linear-gradient(135deg,#252b31,#1a1d21)}.blacksmith-tactic-rule-word{font-size:18px;font-weight:900;color:#ffd180}.blacksmith-tactic-picker-button{min-height:46px;text-align:left!important;background:linear-gradient(180deg,#344754,#1c2931)!important}.blacksmith-tactic-picker{grid-column:2/5;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px;padding:10px;border:1px solid #4f7990;border-radius:10px;background:#10171c}.blacksmith-tactic-picker button.selected{border-color:#80d8ff;background:linear-gradient(#237493,#16475b)}.blacksmith-tactic-tools{white-space:nowrap}.blacksmith-tactic-tools button{padding:8px}.blacksmith-tactic-task{padding:12px;border:1px solid #ff9800;border-radius:10px;background:linear-gradient(90deg,#3a2a20,#211b18);color:#ffd180;margin-bottom:12px}
                .blacksmith-layout-dialog{width:min(1420px,98vw);height:min(900px,96vh)}.blacksmith-layout-body{display:grid;grid-template-columns:minmax(0,1fr) 380px;min-height:0;flex:1}.blacksmith-layout-map-wrap{overflow:auto;padding:96px;background:radial-gradient(circle,#24272a,#101214);display:flex;align-items:flex-start;justify-content:center}.blacksmith-layout-map{position:relative;display:grid;box-shadow:0 14px 40px #000;border:3px solid #5b6570;background:#08090a}.blacksmith-layout-cell{position:relative;width:64px;height:64px;padding:0!important;border:1px solid rgba(255,255,255,.15)!important;border-radius:0!important;box-shadow:none!important;overflow:visible;color:#fff;text-shadow:0 2px 4px #000}.blacksmith-layout-cell.void-cell{background:#08090a!important}.blacksmith-layout-cell.auto-wall-cell:after{content:'◆';position:absolute;right:2px;top:2px;padding:1px 3px;border-radius:3px;background:rgba(8,10,12,.74);color:#9bdff1;font-size:9px;pointer-events:none}.blacksmith-layout-cell.expanded-area{box-shadow:inset 0 0 0 3px rgba(0,188,212,.62)!important}.blacksmith-layout-cell:hover{z-index:2000!important;outline:3px solid #80d8ff;transform:none!important}.blacksmith-layout-cell.selected{outline:4px solid #ffca28;z-index:2001!important}.blacksmith-layout-cell .entrance-label{position:absolute;inset:auto 4px 4px;padding:2px;border-radius:4px;background:rgba(115,73,9,.88);font-size:11px}.blacksmith-layout-expansion-label{position:absolute;left:2px;top:2px;padding:2px 4px;border-radius:4px;background:rgba(0,96,110,.9);color:#b2ebf2;font-size:9px;white-space:nowrap;z-index:910}.blacksmith-layout-auto-wall-outside{position:absolute;width:64px;height:64px;box-sizing:border-box;border:1px solid rgba(255,255,255,.15);pointer-events:none;z-index:2}.blacksmith-layout-object-visual{position:absolute;left:0;top:0;width:64px;height:64px;overflow:visible;pointer-events:none}.blacksmith-layout-map-marker{position:absolute;right:4px;bottom:4px;min-width:22px;height:22px;padding:0 4px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;border-radius:50%;background:#1565c0;color:#fff;font-size:10px;font-weight:900;box-sizing:border-box;z-index:920;pointer-events:none}.blacksmith-layout-map-marker.entry{background:#ad1457}.blacksmith-layout-map-marker.queue{background:#7b1fa2}.blacksmith-layout-map-marker.selected{box-shadow:0 0 0 4px #ffca28}.blacksmith-layout-sidebar{overflow:auto;padding:16px;background:linear-gradient(180deg,#181a1d,#101113);border-left:1px solid #4a4f55}.blacksmith-layout-tools{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:10px 0}.blacksmith-layout-tools button.active,.blacksmith-layout-marker-directions button.active{border-color:#ffb74d;background:linear-gradient(#865326,#4b2b17)}.blacksmith-layout-help{font-size:12px;color:#aaa;line-height:1.6}.blacksmith-layout-expansion-info{margin:9px 0;padding:8px;border:1px solid #00bcd4;border-radius:8px;background:rgba(0,188,212,.12);color:#b2ebf2;font-size:12px}.blacksmith-layout-object-list,.blacksmith-layout-marker-list{display:grid;gap:7px;margin:12px 0}.blacksmith-layout-object-card{display:grid;grid-template-columns:50px 1fr auto;gap:8px;align-items:center;padding:7px!important;text-align:left}.blacksmith-layout-object-card.selected{border-color:#ffb74d;background:linear-gradient(#6e4324,#342316)}.blacksmith-layout-thumb{position:relative;width:48px;height:48px;overflow:hidden;border:1px solid #555;border-radius:7px;background:#090a0b}.blacksmith-layout-marker-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center;padding:6px;border:1px solid #4f5964;border-radius:9px;background:#171b20}.blacksmith-layout-marker-card.selected{border-color:#ffb74d;background:#342316}.blacksmith-layout-marker-select{display:grid!important;grid-template-columns:34px 1fr;gap:7px;align-items:center;text-align:left!important;padding:5px!important;background:transparent!important;border:0!important;box-shadow:none!important}.blacksmith-layout-marker-select small{display:block;color:#9da5ad}.blacksmith-layout-marker-icon{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#1565c0;font-size:11px}.blacksmith-layout-marker-icon.entry{background:#ad1457}.blacksmith-layout-marker-icon.queue{background:#7b1fa2}.blacksmith-layout-marker-directions{display:grid;grid-template-columns:repeat(2,30px);gap:3px}.blacksmith-layout-marker-directions button{padding:4px!important}.blacksmith-layout-valid{padding:11px;border:1px solid #3f7848;border-radius:9px;background:#16251a;color:#8be28b;line-height:1.55}.blacksmith-layout-valid.error{border-color:#8d3d3d;background:#2a1717;color:#ff9c9c}
                .blacksmith-layout-card-actions{display:grid;gap:5px;font-size:18px}.blacksmith-layout-theme-list{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}.blacksmith-layout-theme{display:grid!important;grid-template-columns:34px 34px 1fr;gap:5px;align-items:center;text-align:left!important;padding:7px!important}.blacksmith-layout-theme>span{width:34px;height:34px;border:1px solid #666;border-radius:4px}.blacksmith-layout-theme>strong,.blacksmith-layout-theme>small{grid-column:3}.blacksmith-layout-theme.selected{border-color:#80d8ff;background:linear-gradient(#285269,#172d38)}.blacksmith-layout-marker-card{grid-template-columns:minmax(0,1fr) auto}.blacksmith-layout-marker-facing{grid-column:1;color:#ffd180;font-size:12px;padding-left:5px}.blacksmith-layout-marker-directions{grid-column:2;grid-row:1/3;grid-template-columns:repeat(2,44px)}.blacksmith-layout-marker-directions button{display:grid;grid-template-columns:auto auto;align-items:center;gap:2px}.blacksmith-layout-marker-directions button small{font-size:9px}.blacksmith-layout-map-marker small{margin-left:2px;font-size:10px;color:#fff}
                .blacksmith-event-speech{position:absolute;width:620px;padding:16px 20px;border:4px solid #fff;border-radius:20px;background:rgba(15,18,22,.96);color:#fff;box-sizing:border-box;box-shadow:0 10px 32px #000;pointer-events:none}
                @media(max-width:900px){.blacksmith-layout-body{grid-template-columns:1fr}.blacksmith-layout-sidebar{max-height:42vh;border-left:0;border-top:1px solid #4a4f55}}@media(max-width:760px){.blacksmith-production-body,.blacksmith-bankruptcy-options{grid-template-columns:1fr}.blacksmith-production-card{grid-template-columns:1fr}.blacksmith-production-card label{align-items:flex-start;flex-wrap:wrap}.blacksmith-tactic-rule{grid-template-columns:42px 1fr}.blacksmith-tactic-rule-word:nth-of-type(2){grid-column:1}.blacksmith-tactic-tools{grid-column:1/-1}.blacksmith-tactic-picker{grid-column:1/-1}}
            `;
            document.head.appendChild(style);
        }
        ui = document.createElement('div');
        ui.id = 'blacksmith-management-ui';
        ui.style.cssText = 'position:fixed;inset:0;z-index:82000;background:#121212;color:#f5f5f5;font-family:sans-serif;display:none;flex-direction:column;';
        document.body.appendChild(ui);
        return ui;
    }

    function showBlacksmithGameDialog(options = {}) {
        if (!document.getElementById('blacksmith-business-styles')) ensureUi();
        document.getElementById('blacksmith-game-dialog')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'blacksmith-game-dialog';
        overlay.className = 'blacksmith-modal-backdrop';
        const dialog = document.createElement('div');
        dialog.className = `blacksmith-dialog blacksmith-message-dialog ${options.tone || ''}`;
        const header = document.createElement('header');
        const heading = document.createElement('h2');
        heading.textContent = options.title || '鍛冶屋からのお知らせ';
        header.appendChild(heading);
        const body = document.createElement('div');
        body.className = 'blacksmith-message-body';
        body.textContent = options.message || '';
        const footer = document.createElement('footer');
        const actions = document.createElement('div');
        actions.className = 'blacksmith-message-actions';
        const definitions = Array.isArray(options.actions) && options.actions.length ? options.actions : [{ label: '閉じる' }];
        definitions.forEach(definition => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = definition.label;
            if (definition.danger) button.className = 'danger-button';
            button.addEventListener('click', () => {
                overlay.remove();
                if (typeof definition.onSelect === 'function') definition.onSelect();
            });
            actions.appendChild(button);
        });
        footer.appendChild(actions);
        dialog.append(header, body, footer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        return overlay;
    }

    window.showBlacksmithGameDialog = showBlacksmithGameDialog;

    function headerHtml(state) {
        const required = state.level < 30 ? state.level * 100 : 0;
        const milestone = window.BLACKSMITH_LEVEL_MILESTONES[state.level - 1];
        const reputation = Number.isInteger(state.reputation) ? state.reputation : state.reputation.toFixed(1);
        const shopName = state.shopName || '鍛冶屋';
        const mode = state.opening ? '開店準備中' : state.isOpen ? '営業中' : '仕込み中';
        const tutorialActive = !state.tutorial.completed;
        const tacticAvailable = state.tutorial.completed || ['equipment_rule', 'craft_rule', 'sales_rule'].includes(state.tutorial.phase);
        const panelState = getBlacksmithPanelState();
        const buttonStyle = (color, active = false) => `padding:10px 16px;background:${active ? color : color};color:#fff;border:${active ? '2px solid #fff' : '2px solid transparent'};border-radius:6px;cursor:pointer;font-weight:bold;white-space:nowrap;`;
        return `
            <div style="display:flex;gap:14px;align-items:center;padding:10px 18px;background:#222;border-bottom:2px solid #555;flex-wrap:wrap;z-index:10;">
                <strong style="font-size:24px;color:#ff9800;white-space:nowrap;">⚒️ ${escapeHtml(shopName)}</strong>
                <div style="font-size:16px;color:#fff;background:#444;padding:6px 16px;border-radius:22px;line-height:1.45;white-space:nowrap;">
                    評判: <strong style="color:#4caf50;">${reputation}/${getMaxReputation(state.level)}</strong>｜売上: <strong style="color:#ffd700;">${state.money} G</strong><br>
                    <span style="font-size:12px;">Lv:${state.level} EXP:${state.level < 30 ? `${state.exp}/${required}` : '次回更新待ち'}　${mode}　現在の解放：${milestone.label}</span>
                </div>
                <span style="flex:1;"></span>
                <button onclick="window.toggleBlacksmithMinimap()" style="${buttonStyle('#ff9800', panelState.minimap)}">🗺️ ミニマップ</button>
                <button onclick="window.toggleBlacksmithLogStatus()" style="${buttonStyle('#9c27b0', panelState.logStatus)}">📜 ログ・状況</button>
                <button onclick="window.toggleBlacksmithRecipes()" style="${buttonStyle('#2e7d32', panelState.recipes)}">📖 レシピ・在庫</button>
                <button onclick="window.openBlacksmithTacticEditor()" ${tacticAvailable ? '' : 'disabled'} style="${buttonStyle('#2196f3')}">⚙️ 作戦変更</button>
                <button onclick="window.closeBlacksmithMapUI()" style="${buttonStyle('#f44336')}">お店を出る</button>
            </div>`;
    }

    function recipesHtml(state) {
        const discoveredRecipes = Object.entries(window.BLACKSMITH_RECIPE_CATALOG).filter(([id]) => state.recipes[id]?.discovered);
        if (!discoveredRecipes.length) {
            return '<div style="padding:30px;text-align:center;color:#9aa4ad;line-height:1.7;">まだひらめいたレシピがありません。<br>素材と必要設備が揃うと、仕込みから新しいレシピをひらめきます。</div>';
        }
        return discoveredRecipes.map(([id, recipe]) => {
            const equipmentReady = hasBlacksmithRecipeEquipment(state, recipe);
            const progress = state.recipes[id];
            const stocked = state.stock[id] || 0;
            const price = blacksmithSalePrice(state, id);
            const market = state.marketPrices[id] || getItemPrice(id);
            const productionText = progress.mastery < 100
                ? `開発優先度：${priorityLabel(state.production.developmentPriorities[id])}`
                : `目標在庫：${state.production.targets[id]} / 優先度：${priorityLabel(state.production.priorities[id])}`;
            return `<div style="padding:10px;border-bottom:1px solid #3d4650;opacity:${equipmentReady ? 1 : 0.65};background:linear-gradient(90deg,rgba(255,152,0,.08),transparent);">
                <div style="display:flex;justify-content:space-between;gap:8px;"><strong>${getItemName(id)}</strong><span>在庫 ${stocked}</span></div>
                <div style="font-size:12px;color:#bdbdbd;">${recipeMaterialStatus(recipe)} / 完成度 ${progress.mastery}%</div>
                <div style="font-size:12px;color:${equipmentReady ? '#a5d6a7' : '#ffcc80'};margin-top:4px;">必要設備：${recipeEquipmentStatus(state, recipe)}</div>
                <div style="font-size:12px;color:#80d8ff;margin-top:4px;">販売 ${price}G / 市場相場 ${market}G<br>${productionText}</div>
            </div>`;
        }).join('');
    }

    function priorityLabel(priority) {
        return { priority: '優先', normal: '通常', low: '控えめ', off: '停止' }[priority] || '通常';
    }

    function tutorialTaskHtml(state) {
        if (state.tutorial.completed) return '';
        const tasks = {
            arrival: '鍛冶師が店へ入ってくるのを待とう。',
            intro_dialogue: '鍛冶師とAI店員の会話を聞こう。',
            equipment_move: '鍛冶師と一緒に、基本設備を順番に整えよう。',
            equipment_prompt_dialogue: '設備を置く条件と行動を教わろう。',
            equipment_rule: '作戦変更で、指定された設備配置の条件と行動を設定しよう。',
            equipment_place_dialogue: '設定した指示で設備が置かれるのを確認しよう。',
            equipment_ready_dialogue: '配置した基本設備を確認しよう。',
            to_material: '鍛冶師と一緒に素材置き場へ移動中。',
            craft_dialogue: '製作の指示を教わろう。',
            craft_rule: '作戦変更で「もし 仕込める素材がある時 なら つくる」に設定しよう。',
            crafting: 'AI店員の製作動線を見守ろう。',
            sales_dialogue: '販売の指示を教わろう。',
            sales_rule: '作戦変更で「もし 金床前で注文・会計待ちのお客様がいる時 なら うる」に設定しよう。',
            sales: 'お客様への販売と会計を見守ろう。',
            business_risk_move: '鍛冶師が近くへ来るのを待とう。',
            business_risk_dialogue: '評判と経営破綻、救済について教わろう。',
            final_dialogue: '鍛冶師とAI店員の会話を聞こう。',
            master_leaving: '鍛冶師を見送ろう。'
        };
        return `<div style="padding:8px 12px;background:#3a2a20;border-bottom:1px solid #ff9800;color:#ffd180;"><strong>鍛冶師の練習課題：</strong>${tasks[state.tutorial.phase] || '鍛冶師の説明を聞こう。'}</div>`;
    }

    function getBlacksmithPanelState() {
        if (!window.BLACKSMITH_PANEL_STATE || typeof window.BLACKSMITH_PANEL_STATE !== 'object') {
            window.BLACKSMITH_PANEL_STATE = { minimap: false, logStatus: false, recipes: false };
        }
        return window.BLACKSMITH_PANEL_STATE;
    }

    function currentWorkText(state) {
        if (state.opening) return '金床後方へ移動して開店準備中';
        if (state.work) return `${getItemName(state.work.recipeId)}を製作中`;
        if (state.service) return `${getItemName(state.service.productId)}を接客中`;
        if (state.isOpen) return '金床前で接客待機中';
        return '次の仕込みを待機中';
    }

    function blacksmithLogHtml(state) {
        return state.logs.slice().reverse().map(log => `<div style="font-size:14px;line-height:1.6;color:${log.color};padding:6px 0;border-bottom:1px dotted #444;">${log.speaker ? `<strong>【${log.speaker}】</strong> ` : ''}${log.text}</div>`).join('') || '<div style="color:#888;">まだ記録はありません。</div>';
    }

    function blacksmithStatusHtml(state, floorOptions) {
        const totalStock = Object.values(state.stock).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0);
        const outsideCustomers = state.customers.filter(customer => customer.status === 'outside_waiting').length;
        const insideCustomers = state.customers.length - outsideCustomers;
        const tutorialActive = !state.tutorial.completed;
        const canEdit = state.editorUnlocked && !tutorialActive && !state.isOpen && !state.work && !state.opening && !state.floorMove && !state.customers.length;
        return `
            <h3 style="color:#ffd54f;margin:0 0 12px;border-bottom:1px solid #555;padding-bottom:10px;">📊 鍛冶屋の状況</h3>
            <div style="background:#242424;border:1px solid #555;border-radius:7px;padding:10px;line-height:1.8;">
                <div>営業状態：<strong style="color:${state.isOpen ? '#69f0ae' : state.opening ? '#ffd166' : '#ff8a80'};">${state.opening ? '開店準備中' : state.isOpen ? '営業中' : '仕込み中（閉店）'}</strong>${state.paused ? '・一時停止中' : ''}</div>
                <div>現在の仕事：<strong>${currentWorkText(state)}</strong></div>
                <div>お客様：<strong>店内 ${insideCustomers}人 / 店外待機 ${outsideCustomers}人 / 合計 ${state.customers.length}人</strong></div>
                <div>商品棚の総在庫：<strong>${totalStock}個</strong></div>
                <div>累計販売数：<strong>${state.totalSales}個</strong></div>
                <label style="display:block;margin-top:8px;">表示フロア：<select onchange="window.changeBlacksmithFloor(this.value)">${floorOptions}</select></label>
            </div>
            <h4 style="color:#80d8ff;margin:15px 0 8px;">経営操作</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <button onclick="window.toggleBlacksmithPause()" ${tutorialActive ? 'disabled' : ''}>${state.paused ? '再開' : '一時停止'}</button>
                <button onclick="window.toggleBlacksmithOpen()" ${tutorialActive || state.opening || state.floorMove ? 'disabled' : ''}>${state.opening ? '開店準備中…' : state.isOpen ? '閉店する' : '開店する'}</button>
                ${state.editorUnlocked ? `<button onclick="window.openBlacksmithEditor()" ${canEdit ? '' : 'disabled'}>模様替え</button>` : ''}
                <button onclick="window.openBlacksmithProductionEditor()" ${tutorialActive || state.isOpen || state.opening || state.floorMove ? 'disabled' : ''}>仕込み計画</button>
            </div>`;
    }

    function minimapColor(type) {
        if (type === 'material') return '#8d6e63';
        if (['furnace', 'anvil', 'cooling'].includes(type)) return '#2196f3';
        if (type === 'shelf_weapon') return '#f44336';
        if (type === 'shelf_goods') return '#ff9800';
        if (type === 'shelf_armor') return '#4caf50';
        return '#9c27b0';
    }

    function blacksmithMinimapHtml(state) {
        const floor = getFloor(state, state.activeFloorId);
        const width = 360;
        const cells = [];
        const walls = automaticWallCells(floor);
        for (let y = 0; y < floor.height; y++) {
            for (let x = 0; x < floor.width; x++) {
                const color = isFloorCell(floor, x, y) ? '#c7a77a' : walls.has(cellKey(x, y)) ? '#5d4037' : '#090a0b';
                cells.push(`<span style="position:absolute;left:${x / floor.width * 100}%;top:${y / floor.height * 100}%;width:${100 / floor.width}%;height:${100 / floor.height}%;background:${color};border:1px solid rgba(0,0,0,.25);box-sizing:border-box;"></span>`);
            }
        }
        (floor.entrance || []).forEach(point => cells.push(`<span title="入口" style="position:absolute;left:${point.x / floor.width * 100}%;top:${point.y / floor.height * 100}%;width:${100 / floor.width}%;height:${100 / floor.height}%;background:#00bcd4;box-sizing:border-box;"></span>`));
        floor.objects.forEach(object => objectFootprintCells(object).forEach(cell => cells.push(`<span title="${OBJECT_DEFS[object.type]?.name || object.type}" style="position:absolute;left:${cell.x / floor.width * 100}%;top:${cell.y / floor.height * 100}%;width:${100 / floor.width}%;height:${100 / floor.height}%;background:${minimapColor(object.type)};border:1px solid #111;box-sizing:border-box;"></span>`)));
        if (state.player.floorId === floor.id) cells.push(`<span title="AI店員" style="position:absolute;left:${(state.player.x + .22) / floor.width * 100}%;top:${(state.player.y + .22) / floor.height * 100}%;width:${56 / floor.width}%;height:${56 / floor.height}%;max-width:18px;max-height:18px;background:#fff;border:2px solid #333;border-radius:50%;box-sizing:border-box;"></span>`);
        state.customers.filter(customer => customer.floorId === floor.id).forEach(customer => cells.push(`<span title="お客様" style="position:absolute;left:${(customer.x + .3) / floor.width * 100}%;top:${(customer.y + .3) / floor.height * 100}%;width:${40 / floor.width}%;height:${40 / floor.height}%;max-width:12px;max-height:12px;background:#e040fb;border-radius:50%;box-sizing:border-box;"></span>`));
        return `<div style="width:${width}px;max-width:100%;aspect-ratio:${floor.width}/${floor.height};position:relative;background:#000;border:2px solid #555;">${cells.join('')}</div>
            <div style="font-size:12px;line-height:1.8;margin-top:12px;color:#ddd;">
                <span style="color:#5d4037;">■</span>壁　<span style="color:#c7a77a;">■</span>床　<span style="color:#00bcd4;">■</span>入口　<span style="color:#2196f3;">■</span>作業設備<br>
                <span style="color:#f44336;">■</span>武器棚　<span style="color:#ff9800;">■</span>雑貨棚　<span style="color:#4caf50;">■</span>防具棚　●AI店員　<span style="color:#e040fb;">●</span>お客様
            </div>`;
    }

    function blacksmithPanelsHtml(state, floorOptions) {
        const panelState = getBlacksmithPanelState();
        if (!panelState.minimap && !panelState.logStatus && !panelState.recipes) return '';
        const modalBase = 'background:rgba(10,10,15,.9);border-radius:12px;padding:20px;box-sizing:border-box;pointer-events:auto;box-shadow:0 10px 40px rgba(0,0,0,.85);min-height:0;';
        const logStatus = panelState.logStatus ? `<section id="blacksmith-log-status-modal" style="${modalBase}border:3px solid #9c27b0;width:min(800px,62vw);height:min(76vh,720px);display:flex;gap:18px;">
            <div style="flex:1.45;display:flex;flex-direction:column;min-width:0;border-right:2px dashed #555;padding-right:15px;">
                <h3 style="margin:0 0 12px;border-bottom:1px solid #555;padding-bottom:10px;">📜 鍛冶屋の記録</h3>
                <div id="blacksmith-log-panel" style="flex:1;overflow:auto;">${blacksmithLogHtml(state)}</div>
                <button onclick="window.toggleBlacksmithLogStatus()" style="margin-top:12px;padding:11px;background:#444;color:#fff;border:0;border-radius:7px;font-weight:bold;">閉じる</button>
            </div>
            <div id="blacksmith-status-panel" style="flex:1;overflow:auto;">${blacksmithStatusHtml(state, floorOptions)}</div>
        </section>` : '';
        const minimap = panelState.minimap ? `<section id="blacksmith-minimap-modal" style="${modalBase}border:3px solid #ff9800;width:min(450px,35vw);height:min(76vh,720px);display:flex;flex-direction:column;">
            <h3 style="margin:0 0 14px;border-bottom:1px solid #555;padding-bottom:10px;">🗺️ ミニマップ（配置と動線）</h3>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;">${blacksmithMinimapHtml(state)}</div>
            <button onclick="window.toggleBlacksmithMinimap()" style="margin-top:12px;padding:11px;background:#444;color:#fff;border:0;border-radius:7px;font-weight:bold;">閉じる</button>
        </section>` : '';
        const recipes = panelState.recipes ? `<section id="blacksmith-recipes-modal" style="${modalBase}border:3px solid #4caf50;width:min(620px,56vw);height:min(82vh,780px);display:flex;flex-direction:column;">
            <h3 style="margin:0 0 5px;border-bottom:1px solid #555;padding-bottom:10px;">📖 作れるレシピ・商品棚在庫</h3>
            <div style="font-size:12px;color:#aaa;margin-bottom:8px;">素材の組み合わせから発見し、完成度100%で商品棚へ格納します。</div>
            <div id="blacksmith-recipe-panel" style="flex:1;overflow:auto;">${recipesHtml(state)}</div>
            <button onclick="window.toggleBlacksmithRecipes()" style="margin-top:12px;padding:11px;background:#444;color:#fff;border:0;border-radius:7px;font-weight:bold;">閉じる</button>
        </section>` : '';
        return `<div id="blacksmith-panels-wrapper" style="position:absolute;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;gap:20px;padding:18px;pointer-events:none;background:rgba(0,0,0,.22);box-sizing:border-box;">${logStatus}${minimap}${recipes}</div>`;
    }

    function calculateBlacksmithCamera(state, viewportWidth, viewportHeight) {
        const floor = getFloor(state, state.activeFloorId);
        if (!floor) return { x: 0, y: 0, zoom: CAMERA_ZOOM };
        const focus = state.player.floorId === floor.id
            ? state.player
            : { x: (floor.width - 1) / 2, y: (floor.height - 1) / 2 };
        const focusX = focus.x * TILE + TILE / 2;
        const focusY = focus.y * TILE + TILE / 2;
        return {
            x: Number(viewportWidth || 0) / 2 - focusX * CAMERA_ZOOM,
            y: Number(viewportHeight || 0) / 2 - focusY * CAMERA_ZOOM,
            zoom: CAMERA_ZOOM
        };
    }

    function updateBlacksmithCamera(state) {
        const viewport = document.getElementById('blacksmith-map-viewport');
        const stage = document.getElementById('blacksmith-map-stage');
        if (!viewport || !stage) return;
        const camera = calculateBlacksmithCamera(state, viewport.clientWidth, viewport.clientHeight);
        const nextTransform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
        stage.style.transformOrigin = '0 0';
        stage.style.transition = window.BLACKSMITH_LAST_CAMERA_TRANSFORM ? `transform ${ACTOR_MOVE_MS}ms linear` : 'none';
        stage.style.transform = nextTransform;
        window.BLACKSMITH_LAST_CAMERA_TRANSFORM = nextTransform;
    }

    function blacksmithMapSignature(floor) {
        if (!floor) return '';
        const spriteCrops = Object.entries(window.BLACKSMITH_SPRITES || {}).map(([key, sprite]) => [
            key, sprite.img, sprite.sx, sprite.sy, sprite.sw, sprite.sh, sprite.scale, sprite.x, sprite.y
        ]);
        return JSON.stringify({
            id: floor.id,
            width: floor.width,
            height: floor.height,
            grid: floor.grid,
            entrance: floor.entrance,
            expansionZones: floor.expansionZones,
            interiorTheme: floor.interiorTheme,
            objects: floor.objects.map(object => [object.id, object.type, object.targetFloorId, object.x, object.y]),
            spriteCrops
        });
    }

    function updateBlacksmithHtmlHost(host, markup) {
        if (!host || host._blacksmithMarkup === markup) return false;
        host.innerHTML = markup;
        host._blacksmithMarkup = markup;
        return true;
    }

    function renderMap(state) {
        const floor = getFloor(state, state.activeFloorId);
        const stage = document.getElementById('blacksmith-map-stage');
        if (!stage || !floor) return;
        const mapSignature = blacksmithMapSignature(floor);
        stage.style.width = `${floor.width * TILE}px`;
        stage.style.height = `${floor.height * TILE}px`;
        stage.style.position = 'absolute';
        stage.style.left = '0';
        stage.style.top = '0';
        stage.style.flexShrink = '0';
        stage.style.overflow = 'visible';
        stage.style.boxShadow = '0 0 24px #000';
        if (stage._blacksmithMapSignature !== mapSignature) {
            stage.innerHTML = '';
            const walls = automaticWallCells(floor);
            const themeSprites = floorThemeSprites(floor);
            for (let y = 0; y < floor.height; y++) {
                for (let x = 0; x < floor.width; x++) {
                    const floorCell = isFloorCell(floor, x, y);
                    const wall = walls.has(cellKey(x, y));
                    if (!floorCell && !wall) continue;
                    const tile = document.createElement('div');
                    tile.style.cssText = `position:absolute;left:${x * TILE}px;top:${y * TILE}px;width:${TILE}px;height:${TILE}px;box-sizing:border-box;border:1px solid rgba(255,255,255,.035);${spriteBackground(wall ? themeSprites.wall : themeSprites.floor, TILE, TILE)}z-index:${wall ? 3 : 1};`;
                    stage.appendChild(tile);
                }
            }
            walls.forEach(key => {
                const [x, y] = key.split(',').map(Number);
                if (x >= 0 && y >= 0 && x < floor.width && y < floor.height) return;
                const tile = document.createElement('div');
                tile.style.cssText = `position:absolute;left:${x * TILE}px;top:${y * TILE}px;width:${TILE}px;height:${TILE}px;box-sizing:border-box;border:1px solid rgba(255,255,255,.035);${spriteBackground(themeSprites.wall, TILE, TILE)}z-index:3;`;
                stage.appendChild(tile);
            });
            floor.objects.forEach(object => {
                const def = OBJECT_DEFS[object.type];
                if (!def) return;
                objectVisualParts(object).forEach(part => {
                    const objectDepth = stairLayout(object.type) ? 400 + part.y * 20 : 500 + part.y * 20 + 10;
                    const element = part.sprite ? spriteElement(part.sprite, 'blacksmith-object', part.x, part.y, objectDepth) : document.createElement('div');
                    if (!part.sprite) {
                        element.textContent = part.icon;
                        element.style.cssText = `position:absolute;left:${part.x * TILE + 50}px;top:${part.y * TILE + 45}px;font-size:120px;z-index:${objectDepth};`;
                    }
                    element.title = def.name;
                    element.dataset.objectId = object.id;
                    stage.appendChild(element);
                });
            });
            stage._blacksmithMapSignature = mapSignature;
            stage._blacksmithDynamicSignature = null;
        }

        const tutorialMaster = state.tutorial.master;
        const dialogueLine = window.BLACKSMITH_TUTORIAL_DIALOGUE?.line || null;
        const dynamicSignature = JSON.stringify({
            player: state.player.floorId === floor.id ? [state.player.x, state.player.y, state.player.dir, Number(state.player.speechUntilTick) >= state.tick ? state.player.speechText : '', state.player.speechUntilTick] : null,
            playerAppearance: window.aiPet ? [window.aiPet.currentSkin, window.aiPet.cosmetic || null] : null,
            master: floor.id === MAIN_FLOOR_ID && state.tutorial.masterVisible && tutorialMaster
                ? [tutorialMaster.x, tutorialMaster.y, tutorialMaster.dir]
                : null,
            customers: state.customers.filter(customer => customer.floorId === floor.id)
                .map(customer => [customer.id, customer.x, customer.y, customer.dir, customer.skin, Number(customer.speechUntilTick) >= state.tick ? customer.speechText : '', customer.speechUntilTick]),
            dialogue: dialogueLine ? [dialogueLine.target, dialogueLine.speaker, dialogueLine.text, dialogueLine.color] : null
        });
        if (stage._blacksmithDynamicSignature !== dynamicSignature) {
            const visibleActorIds = new Set();
            if (state.player.floorId === floor.id) {
                const id = 'blacksmith-map-actor-player';
                visibleActorIds.add(id);
                syncBlacksmithActor(stage, id, null, state.player.dir, state.player.x, state.player.y, 500 + state.player.y * 20, 'blacksmith-player');
            }
            if (floor.id === MAIN_FLOOR_ID && state.tutorial.masterVisible && tutorialMaster) {
                const id = 'blacksmith-map-actor-master';
                visibleActorIds.add(id);
                syncBlacksmithActor(stage, id, 'smith', tutorialMaster.dir, tutorialMaster.x, tutorialMaster.y, 504 + tutorialMaster.y * 20, 'blacksmith-master');
            }
            state.customers.filter(customer => customer.floorId === floor.id).forEach(customer => {
                const id = `blacksmith-map-actor-customer-${customer.id}`;
                visibleActorIds.add(id);
                syncBlacksmithActor(stage, id, customer.skin || customer.spriteFamily, customer.dir, customer.x, customer.y, 500 + customer.y * 20, 'blacksmith-customer');
            });
            stage.querySelectorAll('.blacksmith-map-actor').forEach(element => {
                if (!visibleActorIds.has(element.id)) element.remove();
            });
            stage.querySelectorAll('.blacksmith-map-speech').forEach(element => element.remove());
            appendBlacksmithTutorialSpeech(stage, state, floor);
            if (!dialogueLine) appendBlacksmithEventSpeech(stage, state, floor);
            stage._blacksmithDynamicSignature = dynamicSignature;
        }
        updateBlacksmithCamera(state);
    }

    function renderBlacksmith() {
        const state = window.BLACKSMITH_STATE;
        const ui = document.getElementById('blacksmith-management-ui');
        if (!state || !ui || ui.style.display === 'none') return;
        const oldRecipeScroll = document.getElementById('blacksmith-recipe-panel')?.scrollTop || 0;
        const oldLogScroll = document.getElementById('blacksmith-log-panel')?.scrollTop || 0;
        const oldStatusScroll = document.getElementById('blacksmith-status-panel')?.scrollTop || 0;
        const floorOptions = state.floors.map(f => `<option value="${f.id}" ${f.id === state.activeFloorId ? 'selected' : ''}>${f.name}</option>`).join('');
        if (!document.getElementById('blacksmith-map-viewport') || !document.getElementById('blacksmith-header-host')) {
            ui.innerHTML = `
                <div id="blacksmith-header-host"></div>
                <div id="blacksmith-tutorial-task-host"></div>
                <div id="blacksmith-map-viewport" style="position:relative;flex:1;min-height:0;overflow:hidden;background:#0b0b0b;">
                    <div id="blacksmith-map-stage" style="position:absolute;left:0;top:0;transform-origin:0 0;"></div>
                    <div id="blacksmith-panels-host"></div>
                    <div id="blacksmith-floor-fade" aria-hidden="true"></div>
                </div>`;
        }
        if (!document.getElementById('blacksmith-floor-fade')) {
            const fade = document.createElement('div');
            fade.id = 'blacksmith-floor-fade';
            fade.setAttribute('aria-hidden', 'true');
            document.getElementById('blacksmith-map-viewport')?.appendChild(fade);
        }
        updateBlacksmithHtmlHost(document.getElementById('blacksmith-header-host'), headerHtml(state));
        updateBlacksmithHtmlHost(document.getElementById('blacksmith-tutorial-task-host'), tutorialTaskHtml(state));
        updateBlacksmithHtmlHost(document.getElementById('blacksmith-panels-host'), blacksmithPanelsHtml(state, floorOptions));
        const recipePanel = document.getElementById('blacksmith-recipe-panel');
        const logPanel = document.getElementById('blacksmith-log-panel');
        const statusPanel = document.getElementById('blacksmith-status-panel');
        if (recipePanel) recipePanel.scrollTop = oldRecipeScroll;
        if (logPanel) logPanel.scrollTop = oldLogScroll;
        if (statusPanel) statusPanel.scrollTop = oldStatusScroll;
        renderMap(state);
        syncBlacksmithFloorFade();
        if (state.isBankrupt) showBlacksmithBankruptcyOverlay(state);
    }

    window.renderBlacksmithTutorialVisual = function (container, sceneId, options = {}) {
        if (!container) return false;
        container.replaceChildren();
        const large = options.large === true;
        const scale = large ? 0.27 : 0.14;
        const frame = document.createElement('div');
        frame.style.cssText = `position:relative;width:${MAP_W * TILE * scale}px;max-width:100%;height:${MAP_H * TILE * scale}px;overflow:hidden;border:2px solid ${sceneId === 'bankruptcy' ? '#ff5252' : '#d9842b'};border-radius:12px;background:#090a0b;box-shadow:0 12px 32px rgba(0,0,0,.65);`;
        const stage = document.createElement('div');
        stage.style.cssText = `position:absolute;left:0;top:0;width:${MAP_W * TILE}px;height:${MAP_H * TILE}px;transform:scale(${scale});transform-origin:0 0;`;
        const floor = createMainFloor(true);
        const walls = automaticWallCells(floor);
        for (let y = 0; y < floor.height; y += 1) {
            for (let x = 0; x < floor.width; x += 1) {
                const tile = document.createElement('div');
                const wall = walls.has(cellKey(x, y));
                if (!isFloorCell(floor, x, y) && !wall) continue;
                tile.style.cssText = `position:absolute;left:${x * TILE}px;top:${y * TILE}px;width:${TILE}px;height:${TILE}px;${spriteBackground(wall ? 'bmap_wall' : 'bmap_floor', TILE, TILE)}z-index:${wall ? 3 : 1};`;
                stage.appendChild(tile);
            }
        }
        floor.objects.forEach(object => {
            const def = OBJECT_DEFS[object.type];
            if (def?.sprite) stage.appendChild(spriteElement(def.sprite, 'blacksmith-tutorial-visual-object', object.x, object.y, 500 + object.y * 20 + 10));
        });
        const player = characterElement(null, 'down', 6, 1, 520, 'blacksmith-tutorial-visual-character');
        stage.appendChild(player);
        const skin = getUnlockedBlacksmithSkins()[0] || 'robot';
        const customerY = sceneId === 'normal' ? 4 : 3;
        stage.appendChild(characterElement(skin, 'up', 6, customerY, 500 + customerY * 20, 'blacksmith-tutorial-visual-character'));
        frame.appendChild(stage);
        const rep = sceneId === 'normal' ? 38 : sceneId === 'warning' ? 6 : 0;
        const status = document.createElement('div');
        status.style.cssText = 'position:absolute;left:12px;top:12px;padding:9px 13px;border:2px solid #fff;border-radius:18px;background:rgba(28,31,35,.94);color:#fff;font-weight:900;box-shadow:0 5px 18px #000;';
        status.innerHTML = `評判 <span style="color:${rep <= 6 ? '#ff6b6b' : '#69f0ae'}">${rep}/40</span>　お客様：店内 ${sceneId === 'normal' ? 2 : 1}人 / 店外待機 ${sceneId === 'normal' ? 1 : 0}人`;
        frame.appendChild(status);
        const bubble = document.createElement('div');
        bubble.style.cssText = `position:absolute;right:12px;bottom:14px;width:min(310px,65%);padding:10px 12px;border:2px solid ${sceneId === 'normal' ? '#80d8ff' : '#ff5252'};border-radius:12px;background:rgba(15,18,22,.96);color:#fff;font-size:13px;line-height:1.5;`;
        bubble.textContent = sceneId === 'normal' ? `${getBlacksmithCustomerName(skin)}：鉄の剣をお願いします。` : sceneId === 'warning' ? `${getBlacksmithCustomerName(skin)}：待ちきれません。もう帰ります！` : '評判が0になり、鍛冶屋は経営破綻しました。';
        frame.appendChild(bubble);
        if (sceneId === 'bankruptcy') {
            const choices = document.createElement('div');
            choices.style.cssText = 'position:absolute;inset:54px 8% 38px;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:3px solid #ff5252;border-radius:14px;background:rgba(8,9,11,.94);color:#fff;';
            choices.innerHTML = '<div style="padding:10px;border:2px solid #ffd166;border-radius:9px;"><strong style="color:#ffd166;">💰 金庫から救済</strong><br><small>Lv×5000GでLv維持・評判全回復</small></div><div style="padding:10px;border:2px solid #ff5252;border-radius:9px;"><strong style="color:#ff7777;">🏳️ 倒産を受け入れる</strong><br><small>店を失い、再建後はLv1から</small></div>';
            frame.appendChild(choices);
        }
        container.appendChild(frame);
        return true;
    };

    function toggleBlacksmithPanel(panelName) {
        const panelState = getBlacksmithPanelState();
        if (!Object.prototype.hasOwnProperty.call(panelState, panelName)) return;
        const next = !panelState[panelName];
        if (panelName === 'recipes' && next) {
            panelState.minimap = false;
            panelState.logStatus = false;
        } else if (panelName !== 'recipes' && next) {
            panelState.recipes = false;
        }
        panelState[panelName] = next;
        renderBlacksmith();
    }

    window.toggleBlacksmithMinimap = function () {
        toggleBlacksmithPanel('minimap');
    };

    window.toggleBlacksmithLogStatus = function () {
        toggleBlacksmithPanel('logStatus');
    };

    window.toggleBlacksmithRecipes = function () {
        toggleBlacksmithPanel('recipes');
    };

    function requiredTutorialTactic(phase, state = window.BLACKSMITH_STATE) {
        if (phase === 'equipment_rule') {
            const step = BLACKSMITH_TUTORIAL_EQUIPMENT_STEPS[state?.tutorial?.equipmentStep];
            return step ? { condition: step.condition, action: 'layout' } : null;
        }
        if (phase === 'craft_rule') return { condition: 'can_prepare', action: 'prepare' };
        if (phase === 'sales_rule') return { condition: 'customer_waiting', action: 'serve' };
        return null;
    }

    function applyTutorialTactic(state, condition, action) {
        const required = requiredTutorialTactic(state?.tutorial?.phase, state);
        if (!state || !required || required.condition !== condition || required.action !== action) return false;
        state.tactics = normalizeTactics([
            ...state.tactics.filter(rule => rule.condition !== condition),
            { condition, action, enabled: true }
        ]);
        if (state.tutorial.phase === 'equipment_rule') {
            placeBlacksmithEquipmentAfterRule(state);
        } else if (state.tutorial.phase === 'craft_rule') {
            state.tutorial.craftingRuleSet = true;
            beginBlacksmithCraftDemo(state);
        } else {
            state.tutorial.serviceRuleSet = true;
            beginBlacksmithSalesDemo(state);
        }
        save();
        return true;
    }

    function renderBlacksmithTacticEditor() {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        const modal = document.getElementById('blacksmith-tactic-editor');
        if (!editor || !modal) return;
        const required = requiredTutorialTactic(editor.tutorialPhase);
        const choicePanel = (rule, index, field) => {
            if (editor.picker?.index !== index || editor.picker?.field !== field) return '';
            const choices = field === 'condition' ? BLACKSMITH_TACTIC_CONDITIONS : BLACKSMITH_TACTIC_ACTIONS;
            return `<div class="blacksmith-tactic-picker">${Object.entries(choices).map(([id, label]) => `<button class="${rule[field] === id ? 'selected' : ''}" onclick="window.changeBlacksmithTacticRule(${index},'${field}','${id}')">${escapeHtml(label)}</button>`).join('')}</div>`;
        };
        const rows = editor.rules.map((rule, index) => `<div class="blacksmith-tactic-rule">
            <span class="blacksmith-tactic-rule-word">もし</span>
            <button class="blacksmith-tactic-picker-button" onclick="window.toggleBlacksmithTacticPicker(${index},'condition')">${rule.condition ? escapeHtml(BLACKSMITH_TACTIC_CONDITIONS[rule.condition]) : '＋ 条件を選ぶ'}</button>
            <span class="blacksmith-tactic-rule-word">なら</span>
            <button class="blacksmith-tactic-picker-button" onclick="window.toggleBlacksmithTacticPicker(${index},'action')">${rule.action ? escapeHtml(BLACKSMITH_TACTIC_ACTIONS[rule.action]) : '＋ 行動を選ぶ'}</button>
            <span class="blacksmith-tactic-tools"><button title="上へ" onclick="window.moveBlacksmithTacticRule(${index},-1)" ${index === 0 ? 'disabled' : ''}>↑</button><button title="下へ" onclick="window.moveBlacksmithTacticRule(${index},1)" ${index === editor.rules.length - 1 ? 'disabled' : ''}>↓</button><button onclick="window.removeBlacksmithTacticRule(${index})">削除</button></span>
            ${choicePanel(rule, index, editor.picker?.field)}
        </div>`).join('');
        const task = required
            ? `<div class="blacksmith-tactic-task"><strong>鍛冶師の練習課題</strong><br>「もし ${BLACKSMITH_TACTIC_CONDITIONS[required.condition]} なら ${BLACKSMITH_TACTIC_ACTIONS[required.action]}」に設定してください。</div>`
            : '<div style="color:#bbb;font-size:12px;margin-bottom:10px;">AI店員は上のルールから順に判断します。無効にしたい仕事は、そのルールを削除してください。</div>';
        modal.innerHTML = `<div class="blacksmith-dialog blacksmith-tactic-dialog"><header><div><h2>⚙️ 鍛冶屋のAIマインド</h2><p>状況と仕事をカードから選び、上から順に並べます。</p></div></header><div class="blacksmith-tactic-body">${task}${rows || '<div class="blacksmith-production-empty">まだ作戦ルールがありません。</div>'}<button onclick="window.addBlacksmithTacticRule()">＋ ルールを追加</button><div id="blacksmith-tactic-notice" style="min-height:22px;color:#ff8a80;margin-top:10px;">${editor.notice || ''}</div></div><footer><button onclick="window.closeBlacksmithTacticEditor()">キャンセル</button><button onclick="window.saveBlacksmithTactics()">この作戦に決める</button></footer></div>`;
    }

    window.openBlacksmithTacticEditor = function (tutorialPhase = null) {
        const state = window.BLACKSMITH_STATE;
        if (!state) return;
        const activeTutorialPhase = tutorialPhase || (!state.tutorial.completed && ['equipment_rule', 'craft_rule', 'sales_rule'].includes(state.tutorial.phase) ? state.tutorial.phase : null);
        if (!state.tutorial.completed && !activeTutorialPhase) return;
        const rules = clone(state.tactics);
        const required = requiredTutorialTactic(activeTutorialPhase);
        if (required && !rules.some(rule => rule.condition === required.condition && rule.action === required.action)) {
            rules.push({ condition: '', action: '', enabled: true });
        }
        if (!rules.length) rules.push({ condition: '', action: '', enabled: true });
        window.BLACKSMITH_TACTIC_EDITOR = { rules, tutorialPhase: activeTutorialPhase, notice: '', picker: null };
        let modal = document.getElementById('blacksmith-tactic-editor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blacksmith-tactic-editor';
            modal.className = 'blacksmith-modal-backdrop';
            document.body.appendChild(modal);
        }
        renderBlacksmithTacticEditor();
    };

    window.changeBlacksmithTacticRule = function (index, field, value) {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        if (!editor || !editor.rules[index] || !['condition', 'action'].includes(field)) return;
        editor.rules[index][field] = value;
        editor.picker = null;
        editor.notice = '';
        renderBlacksmithTacticEditor();
    };
    window.toggleBlacksmithTacticPicker = function (index, field) {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        if (!editor || !editor.rules[index] || !['condition', 'action'].includes(field)) return;
        editor.picker = editor.picker?.index === index && editor.picker?.field === field ? null : { index, field };
        renderBlacksmithTacticEditor();
    };
    window.addBlacksmithTacticRule = function () {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        if (!editor) return;
        editor.rules.push({ condition: '', action: '', enabled: true });
        renderBlacksmithTacticEditor();
    };
    window.removeBlacksmithTacticRule = function (index) {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        if (!editor) return;
        editor.rules.splice(index, 1);
        renderBlacksmithTacticEditor();
    };
    window.moveBlacksmithTacticRule = function (index, delta) {
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        const next = index + delta;
        if (!editor || next < 0 || next >= editor.rules.length) return;
        [editor.rules[index], editor.rules[next]] = [editor.rules[next], editor.rules[index]];
        renderBlacksmithTacticEditor();
    };
    window.closeBlacksmithTacticEditor = function () {
        const state = window.BLACKSMITH_STATE;
        if (state && !state.tutorial.completed && ['equipment_rule', 'craft_rule', 'sales_rule'].includes(state.tutorial.phase)) return;
        window.BLACKSMITH_TACTIC_EDITOR = null;
        document.getElementById('blacksmith-tactic-editor')?.remove();
    };
    window.saveBlacksmithTactics = function () {
        const state = window.BLACKSMITH_STATE;
        const editor = window.BLACKSMITH_TACTIC_EDITOR;
        if (!state || !editor) return;
        const rules = normalizeTactics(editor.rules);
        const required = requiredTutorialTactic(editor.tutorialPhase);
        if (required && !rules.some(rule => rule.condition === required.condition && rule.action === required.action)) {
            editor.notice = `鍛冶師の指示どおり「もし ${BLACKSMITH_TACTIC_CONDITIONS[required.condition]} なら ${BLACKSMITH_TACTIC_ACTIONS[required.action]}」に設定してください。`;
            renderBlacksmithTacticEditor();
            return;
        }
        state.tactics = rules;
        window.BLACKSMITH_TACTIC_EDITOR = null;
        document.getElementById('blacksmith-tactic-editor')?.remove();
        if (required) applyTutorialTactic(state, required.condition, required.action);
        else {
            addLog(state, '鍛冶屋のAIマインドを更新した。', '#80d8ff');
            save();
            renderBlacksmith();
        }
    };

    function productionPriorityOptions(selected) {
        return BLACKSMITH_PRODUCTION_PRIORITIES.map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${priorityLabel(value)}</option>`).join('');
    }

    function renderBlacksmithProductionEditor() {
        const state = window.BLACKSMITH_STATE;
        const editor = window.BLACKSMITH_PRODUCTION_EDITOR;
        const modal = document.getElementById('blacksmith-production-editor');
        if (!state || !editor || !modal) return;
        const rows = Object.entries(window.BLACKSMITH_RECIPE_CATALOG).filter(([id]) => state.recipes[id]?.discovered).map(([id, recipe]) => {
            const recipeState = state.recipes[id];
            const stock = state.stock[id] || 0;
            const craftable = craftableQuantity(state, id);
            if (!hasBlacksmithRecipeEquipment(state, recipe)) {
                return `<article class="blacksmith-production-card locked">
                    <div><strong>${escapeHtml(getItemName(id))}</strong><span>完成度 ${recipeState.mastery}%</span></div>
                    <small>必要設備：${escapeHtml(recipeEquipmentStatus(state, recipe))}</small>
                    <small>必要な設備が解放されるまで、このレシピは仕込めません。</small>
                </article>`;
            }
            if (recipeState.mastery < 100) {
                return `<article class="blacksmith-production-card development">
                    <div><strong>${escapeHtml(getItemName(id))}</strong><span>完成度 ${recipeState.mastery}%</span></div>
                    <small>開発中は素材を消費しますが、100%になるまで販売在庫は増えません。</small>
                    <label>開発優先度<select onchange="window.setBlacksmithProductionPriority('${id}','development',this.value)">${productionPriorityOptions(state.production.developmentPriorities[id])}</select></label>
                </article>`;
            }
            const targetMax = stock + craftable;
            const configuredTarget = Math.max(0, state.production.targets[id] || 0);
            const shownTargetMax = Math.max(targetMax, configuredTarget);
            const exact = Math.max(0, Math.min(craftable, Number(editor.exact[id]) || 0));
            return `<article class="blacksmith-production-card">
                <div><strong>${escapeHtml(getItemName(id))}</strong><span>在庫 ${stock} / 追加製作可能 ${craftable}</span></div>
                <label>仕込み優先度<select onchange="window.setBlacksmithProductionPriority('${id}','stock',this.value)">${productionPriorityOptions(state.production.priorities[id])}</select></label>
                <label>目標在庫 <span class="blacksmith-counter"><button onclick="window.adjustBlacksmithProductionValue('target','${id}',-1)">−</button><input type="number" min="0" max="${shownTargetMax}" value="${configuredTarget}" onchange="window.setBlacksmithProductionTarget('${id}',this.value)"><button onclick="window.adjustBlacksmithProductionValue('target','${id}',1)">＋</button></span><small>現在の上限 ${targetMax}</small></label>
                <label>本数指定 <span class="blacksmith-counter"><button onclick="window.adjustBlacksmithProductionValue('exact','${id}',-1)">−</button><input type="number" min="0" max="${craftable}" value="${exact}" onchange="window.setBlacksmithProductionExact('${id}',this.value)"><button onclick="window.adjustBlacksmithProductionValue('exact','${id}',1)">＋</button></span><button class="blacksmith-order-button" onclick="window.addBlacksmithProductionOrder('${id}')" ${exact > 0 ? '' : 'disabled'}>注文に追加</button></label>
            </article>`;
        }).join('');
        const orders = state.production.orders.length ? state.production.orders.map(order => `<div class="blacksmith-order-row"><span>${escapeHtml(getItemName(order.recipeId))} × ${order.remaining}</span><button onclick="window.cancelBlacksmithProductionOrder(${order.id})">取り消す</button></div>`).join('') : '<div class="blacksmith-production-empty">本数指定の注文はありません。</div>';
        modal.innerHTML = `<div class="blacksmith-dialog blacksmith-production-dialog">
            <header><div><h2>⚒️ 仕込み計画</h2><p>入力中はAI店員の仕込みと接客が停止します。</p></div><button onclick="window.closeBlacksmithProductionEditor()">✕</button></header>
            <div class="blacksmith-production-body"><section><h3>レシピ別の計画</h3>${rows || '<div class="blacksmith-production-empty">設定できるレシピがありません。</div>'}</section><aside><h3>本数指定の注文</h3>${orders}<p>本数指定分の素材は論理的に予約され、目標在庫やレシピ開発には使われません。</p></aside></div>
            <footer><button onclick="window.closeBlacksmithProductionEditor()">保存して閉じる</button></footer>
        </div>`;
    }

    window.openBlacksmithProductionEditor = function (recipeId = null) {
        const state = window.BLACKSMITH_STATE;
        if (!state || !state.tutorial.completed || state.isOpen || state.opening || state.floorMove || state.isBankrupt) return;
        window.BLACKSMITH_PRODUCTION_EDITOR = { exact: {}, focusRecipeId: recipeId };
        let modal = document.getElementById('blacksmith-production-editor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blacksmith-production-editor';
            modal.className = 'blacksmith-modal-backdrop';
            document.body.appendChild(modal);
        }
        renderBlacksmithProductionEditor();
    };

    window.closeBlacksmithProductionEditor = function () {
        window.BLACKSMITH_PRODUCTION_EDITOR = null;
        document.getElementById('blacksmith-production-editor')?.remove();
        save();
        renderBlacksmith();
    };

    window.setBlacksmithProductionPriority = function (recipeId, kind, value) {
        const state = window.BLACKSMITH_STATE;
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!state || !recipe || !hasBlacksmithRecipeEquipment(state, recipe) || !BLACKSMITH_PRODUCTION_PRIORITIES.includes(value)) return;
        if (kind === 'development' && state.recipes[recipeId]?.mastery < 100) state.production.developmentPriorities[recipeId] = value;
        else if (kind === 'stock' && state.recipes[recipeId]?.mastery >= 100) state.production.priorities[recipeId] = value;
        renderBlacksmithProductionEditor();
    };

    window.setBlacksmithProductionTarget = function (recipeId, value) {
        const state = window.BLACKSMITH_STATE;
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!state || !recipe || !hasBlacksmithRecipeEquipment(state, recipe) || state.recipes[recipeId]?.mastery < 100) return;
        const max = (state.stock[recipeId] || 0) + craftableQuantity(state, recipeId);
        state.production.targets[recipeId] = Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
        renderBlacksmithProductionEditor();
    };

    window.setBlacksmithProductionExact = function (recipeId, value) {
        const state = window.BLACKSMITH_STATE;
        const editor = window.BLACKSMITH_PRODUCTION_EDITOR;
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!state || !editor || !recipe || !hasBlacksmithRecipeEquipment(state, recipe) || state.recipes[recipeId]?.mastery < 100) return;
        editor.exact[recipeId] = Math.max(0, Math.min(craftableQuantity(state, recipeId), Math.floor(Number(value) || 0)));
        renderBlacksmithProductionEditor();
    };

    window.adjustBlacksmithProductionValue = function (kind, recipeId, delta) {
        const state = window.BLACKSMITH_STATE;
        const editor = window.BLACKSMITH_PRODUCTION_EDITOR;
        if (!state || !editor) return;
        if (kind === 'target') window.setBlacksmithProductionTarget(recipeId, (state.production.targets[recipeId] || 0) + delta);
        else window.setBlacksmithProductionExact(recipeId, (editor.exact[recipeId] || 0) + delta);
    };

    window.addBlacksmithProductionOrder = function (recipeId) {
        const state = window.BLACKSMITH_STATE;
        const editor = window.BLACKSMITH_PRODUCTION_EDITOR;
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (!state || !editor || !recipe || !hasBlacksmithRecipeEquipment(state, recipe) || state.recipes[recipeId]?.mastery < 100) return;
        const count = Math.max(0, Math.min(craftableQuantity(state, recipeId), Math.floor(Number(editor.exact[recipeId]) || 0)));
        if (!count) return;
        state.production.orders.push({ id: state.production.nextOrderId++, recipeId, remaining: count, createdAt: Date.now() });
        editor.exact[recipeId] = 0;
        addLog(state, `${getItemName(recipeId)}を${count}個作る本数指定を登録した。`, '#ffd180');
        renderBlacksmithProductionEditor();
    };

    window.cancelBlacksmithProductionOrder = function (orderId) {
        const state = window.BLACKSMITH_STATE;
        if (!state) return;
        state.production.orders = state.production.orders.filter(order => order.id !== Number(orderId));
        renderBlacksmithProductionEditor();
    };

    window.startBlacksmithRecipe = function (recipeId) {
        window.openBlacksmithProductionEditor(recipeId);
    };

    window.toggleBlacksmithPause = function () {
        if (!window.BLACKSMITH_STATE) return;
        window.BLACKSMITH_STATE.paused = !window.BLACKSMITH_STATE.paused;
        renderBlacksmith();
    };

    window.toggleBlacksmithOpen = function () {
        const state = window.BLACKSMITH_STATE;
        if (!state) return;
        if (!state.tutorial.completed) {
            showBlacksmithGameDialog({ title: 'まだ開店できません', message: 'チュートリアル完了後に営業を切り替えられます。', tone: 'warning' });
            return;
        }
        if (state.work || state.service || state.customers.length || state.opening || state.floorMove) {
            showBlacksmithGameDialog({ title: '営業状態を変更できません', message: '作業中または接客中は営業状態を切り替えられません。', tone: 'warning' });
            return;
        }
        if (!state.isOpen && !Object.values(state.stock).some(count => count > 0)) {
            showBlacksmithGameDialog({ title: '商品がありません', message: '商品棚に在庫がありません。先に仕込みを行ってください。', tone: 'warning' });
            return;
        }
        if (!state.isOpen) {
            if (!beginBlacksmithOpening(state, false)) return;
        } else {
            state.isOpen = false;
            addLog(state, '鍛冶屋を閉店し、仕込み時間に切り替えた。', '#ffcc80');
        }
        save();
        renderBlacksmith();
    };

    window.changeBlacksmithFloor = function (floorId) {
        const state = window.BLACKSMITH_STATE;
        if (!state || state.isOpen || state.work || state.service || state.opening || state.floorMove) return;
        if (beginBlacksmithFloorMove(state, floorId)) save();
        renderBlacksmith();
    };

    function editorSnapshot(editor) {
        return clone({ floors: editor.floors, floorId: editor.floorId, serviceLayout: editor.serviceLayout, unplacedEquipment: editor.unplacedEquipment });
    }

    function pushEditorUndo(editor) {
        editor.undo.push(editorSnapshot(editor));
        if (editor.undo.length > 30) editor.undo.shift();
        editor.redo = [];
    }

    function restoreEditorSnapshot(editor, snapshot) {
        editor.floors = clone(snapshot.floors);
        editor.floorId = snapshot.floorId;
        editor.serviceLayout = normalizeServiceLayout(snapshot.serviceLayout);
        editor.unplacedEquipment = clone(snapshot.unplacedEquipment || []);
        editor.selectedObjectId = null;
        editor.selectedUnplacedId = null;
        editor.selectedMarkerId = null;
        editor.selectedFloorCell = null;
    }

    function editorFloor(editor) {
        return editor.floors.find(f => f.id === editor.floorId) || editor.floors[0];
    }

    function editorServiceMarkers(editor) {
        const layout = editor?.serviceLayout || normalizeServiceLayout();
        return [
            { id: 'ai_standby', type: 'ai', label: 'AI店員待機位置', icon: 'AI', point: layout.aiStandby },
            { id: 'customer_entry', type: 'entry', label: 'お客様入口', icon: '◇', point: layout.customerEntry },
            ...layout.queue.map((point, index) => ({ id: `queue_${index}`, type: 'queue', label: `お客様の列${index + 1}番`, icon: String(index + 1), point }))
        ];
    }

    function editorServiceMarker(editor, markerId) {
        return editorServiceMarkers(editor).find(marker => marker.id === markerId) || null;
    }

    function serviceMarkerAt(editor, floorId, x, y) {
        return editorServiceMarkers(editor).find(marker => marker.point.floorId === floorId && marker.point.x === x && marker.point.y === y) || null;
    }

    function objectOverlapsServiceMarker(editor, floorId, object, anchorX, anchorY) {
        return objectFootprintCells(object, anchorX, anchorY).some(cell => serviceMarkerAt(editor, floorId, cell.x, cell.y));
    }

    function shiftEditorFloorCoordinates(editor, floor, dx, dy) {
        (floor.objects || []).forEach(object => { object.x += dx; object.y += dy; });
        (floor.entrance || []).forEach(point => { point.x += dx; point.y += dy; });
        (floor.expansionZones || []).forEach(zone => { zone.x += dx; zone.y += dy; });
        editorServiceMarkers(editor).filter(marker => marker.point.floorId === floor.id).forEach(marker => {
            marker.point.x += dx;
            marker.point.y += dy;
        });
    }

    function padEditorFloor(editor, floor, left, top, right, bottom) {
        if (!floor || !(left || top || right || bottom)) return;
        const width = floor.width + left + right;
        const height = floor.height + top + bottom;
        const grid = Array.from({ length: height }, () => Array(width).fill(1));
        for (let y = 0; y < floor.height; y += 1) {
            for (let x = 0; x < floor.width; x += 1) grid[y + top][x + left] = floor.grid[y][x];
        }
        floor.width = width;
        floor.height = height;
        floor.grid = grid;
        shiftEditorFloorCoordinates(editor, floor, left, top);
        editor.pendingScrollShift = {
            x: (editor.pendingScrollShift?.x || 0) + left * 64,
            y: (editor.pendingScrollShift?.y || 0) + top * 64
        };
    }

    function ensureEditorFloorPadding(editor, floor, margin = 2) {
        const cells = [];
        for (let y = 0; y < floor.height; y += 1) for (let x = 0; x < floor.width; x += 1) if (isFloorCell(floor, x, y)) cells.push({ x, y });
        if (!cells.length) return;
        const minX = Math.min(...cells.map(cell => cell.x));
        const maxX = Math.max(...cells.map(cell => cell.x));
        const minY = Math.min(...cells.map(cell => cell.y));
        const maxY = Math.max(...cells.map(cell => cell.y));
        padEditorFloor(editor, floor, Math.max(0, margin - minX), Math.max(0, margin - minY), Math.max(0, margin - (floor.width - 1 - maxX)), Math.max(0, margin - (floor.height - 1 - maxY)));
    }

    function trimEditorFloor(editor, floor, margin = 1) {
        const cells = [];
        for (let y = 0; y < floor.height; y += 1) for (let x = 0; x < floor.width; x += 1) if (isFloorCell(floor, x, y)) cells.push({ x, y });
        if (!cells.length) return;
        const minX = Math.max(0, Math.min(...cells.map(cell => cell.x)) - margin);
        const maxX = Math.min(floor.width - 1, Math.max(...cells.map(cell => cell.x)) + margin);
        const minY = Math.max(0, Math.min(...cells.map(cell => cell.y)) - margin);
        const maxY = Math.min(floor.height - 1, Math.max(...cells.map(cell => cell.y)) + margin);
        floor.grid = floor.grid.slice(minY, maxY + 1).map(row => row.slice(minX, maxX + 1));
        floor.width = maxX - minX + 1;
        floor.height = maxY - minY + 1;
        shiftEditorFloorCoordinates(editor, floor, -minX, -minY);
    }

    function conflictingEquipmentTypes(type) {
        const family = Object.values(EQUIPMENT_FAMILIES).find(types => types.includes(type));
        if (family) return family.filter(candidate => candidate !== type);
        if (type === 'shelf_royal') return [...NORMAL_SHELF_TYPES];
        if (NORMAL_SHELF_TYPES.includes(type)) return ['shelf_royal'];
        return [];
    }

    function floorCellConnectedCount(floor) {
        let start = null;
        for (let y = 0; y < floor.height && !start; y += 1) for (let x = 0; x < floor.width; x += 1) if (isFloorCell(floor, x, y)) { start = { x, y }; break; }
        if (!start) return 0;
        const seen = new Set([cellKey(start.x, start.y)]);
        const queue = [start];
        while (queue.length) {
            const current = queue.shift();
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = cellKey(x, y);
                if (isFloorCell(floor, x, y) && !seen.has(key)) { seen.add(key); queue.push({ x, y }); }
            });
        }
        return seen.size;
    }

    function getReachableCells(floor, start) {
        const cells = new Set();
        if (!start || !isWalkable(floor, start.x, start.y)) return cells;
        const queue = [start];
        cells.add(`${start.x},${start.y}`);
        while (queue.length) {
            const current = queue.shift();
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const x = current.x + dx;
                const y = current.y + dy;
                const key = `${x},${y}`;
                if (!cells.has(key) && isWalkable(floor, x, y)) {
                    cells.add(key);
                    queue.push({ x, y });
                }
            }
        }
        return cells;
    }

    function validateEditor(editor) {
        const errors = [];
        const main = editor.floors.find(f => f.id === MAIN_FLOOR_ID);
        if (!main) return ['1階がありません。'];
        const entrances = main.entrance || [];
        if (entrances.length !== 3) errors.push('入口は境界に連続する3マスで配置してください。');
        if (entrances.some(point => !isFloorCell(main, point.x, point.y))) errors.push('入口は床マスとして配置してください。');
        const sortedEntrance = entrances.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
        if (sortedEntrance.length === 3) {
            const horizontal = sortedEntrance.every(e => e.y === sortedEntrance[0].y) && sortedEntrance[2].x - sortedEntrance[0].x === 2;
            const vertical = sortedEntrance.every(e => e.x === sortedEntrance[0].x) && sortedEntrance[2].y - sortedEntrance[0].y === 2;
            if (!horizontal && !vertical) errors.push('入口3マスを一直線につなげてください。');
            else if (!entranceOutwardVector(main, entrances)) errors.push('入口は床の外周に配置してください。');
        }
        const allObjects = editor.floors.flatMap(f => f.objects.map(o => ({ ...o, floorId: f.id })));
        Object.entries(EQUIPMENT_FAMILIES).forEach(([family, types]) => {
            const count = allObjects.filter(object => types.includes(object.type)).length;
            const labels = { material: '素材置き場または大型素材庫', furnace: '炉または魔力炉', anvil: '金床または名工の金床' };
            if (count !== 1) errors.push(`${labels[family]}はどちらか1つ必要です。`);
        });
        if (allObjects.filter(object => object.type === 'cooling').length !== 1) errors.push('冷却・水場は1つ必要です。');
        const royalCount = allObjects.filter(object => object.type === 'shelf_royal').length;
        const normalShelfCounts = NORMAL_SHELF_TYPES.map(type => allObjects.filter(object => object.type === type).length);
        if (!((royalCount === 1 && normalShelfCounts.every(count => count === 0)) || (royalCount === 0 && normalShelfCounts.every(count => count === 1)))) {
            errors.push('商品棚は王室展示棚1つ、または武器・雑貨・防具商品棚を各1つ設置してください。');
        }
        ['precision_tools', 'armor_finishing'].forEach(type => {
            if (allObjects.filter(object => object.type === type).length > 1) errors.push(`${OBJECT_DEFS[type].name}は1つだけ設置できます。`);
        });
        for (const floor of editor.floors) {
            const expectedCount = editor.initialFloorCounts?.[floor.id];
            if (Number.isFinite(expectedCount) && floorTileCount(floor) !== expectedCount) errors.push(`${floor.name}の床マス数は${expectedCount}マスのまま変形してください。`);
            if (floorCellConnectedCount(floor) !== floorTileCount(floor)) errors.push(`${floor.name}の床は上下左右でつながる形にしてください。`);
            const occupied = new Map((floor.entrance || []).map(point => [cellKey(point.x, point.y), { kind: 'entrance', name: '入口' }]));
            for (const object of floor.objects) {
                const name = OBJECT_DEFS[object.type]?.name || object.type;
                const footprint = objectFootprintCells(object);
                if (stairLayout(object.type)) {
                    errors.push(...stairPlacementErrors(floor, object, object.x, object.y, false));
                } else {
                    const missingFloor = footprint.filter(cell => !isFloorCell(floor, cell.x, cell.y));
                    if (missingFloor.length) errors.push(`${floor.name}の${name}（位置 ${object.x}, ${object.y}）の設備が床の外にあります。設置マス ${pointListLabel(missingFloor)} に床がありません。設備を床マスへ移動するか、そのマスへ床を移してください。`);
                }
                for (const cell of footprint) {
                    const key = `${cell.x},${cell.y}`;
                    const previous = occupied.get(key);
                    if (previous?.kind === 'entrance') {
                        errors.push(`${floor.name}の${name}（位置 ${object.x}, ${object.y}）が入口マス ${pointLabel(cell)} と重なっています。設備か入口を移動してください。`);
                    } else if (previous) {
                        errors.push(`${floor.name}で設備が重なっています。${previous.name}と${name}がマス ${pointLabel(cell)} を共有しています。どちらかを移動してください。`);
                    }
                    occupied.set(key, { kind: 'object', name });
                }
            }
        }
        const entranceCell = entrances.find(e => isWalkable(main, e.x, e.y));
        const entranceStart = entranceCell ? { ...entranceCell, floorId: MAIN_FLOOR_ID } : null;
        const editorState = { floors: editor.floors };
        const canReachFromEntrance = point => {
            if (!entranceStart || !point) return false;
            if (entranceStart.floorId === point.floorId && entranceStart.x === point.x && entranceStart.y === point.y) return true;
            return findPath(editorState, entranceStart, point).length > 0;
        };
        const functionalTypes = new Set(allObjects.filter(object => !object.type.startsWith('stairs_')).map(object => object.type));
        functionalTypes.forEach(type => {
            const object = allObjects.find(candidate => candidate.type === type);
            const floor = object && editor.floors.find(candidate => candidate.id === object.floorId);
            const point = usePoint(editorState, type);
            if (!point) errors.push(`${floor?.name || '不明な階'}の${OBJECT_DEFS[type]?.name || type}に隣接する使用マスを空けてください。`);
            else if (!canReachFromEntrance(point)) errors.push(`${floor?.name || '不明な階'}の${OBJECT_DEFS[type]?.name || type}の使用位置まで、1階入口から階段を通って移動できません。床・設備・階段の動線をつなげてください。`);
        });
        const serviceLayout = normalizeServiceLayout(editor.serviceLayout || window.BLACKSMITH_STATE?.serviceLayout);
        const servicePoints = [
            { ...serviceLayout.aiStandby, label: 'AI店員の金床後方待機位置' },
            { ...serviceLayout.customerEntry, label: 'お客様入口' },
            ...serviceLayout.queue.map((point, index) => ({ ...point, label: `お客様の列${index + 1}番` }))
        ];
        const usedServicePoints = new Set();
        servicePoints.forEach(point => {
            const floor = editor.floors.find(candidate => candidate.id === point.floorId);
            const key = `${point.floorId}:${point.x},${point.y}`;
            if (usedServicePoints.has(key)) errors.push('AI店員・お客様入口・お客様の列の基準位置が重なっています。');
            usedServicePoints.add(key);
            if (!floor) errors.push(`${point.label}の配置階が存在しません。いずれかの階へ置き直してください。`);
            else if (!isWalkable(floor, point.x, point.y)) errors.push(`${floor.name}の${point.label}を設備のない床マスにしてください。`);
            else if (!canReachFromEntrance(point)) errors.push(`${floor.name}の${point.label}まで、1階入口から階段を通って移動できません。床・設備・階段の動線をつなげてください。`);
        });
        if (editor.floors.length > 1) {
            const logicalMainConnections = stairConnectionCandidatesFrom(editorState, MAIN_FLOOR_ID);
            if (editor.floors.some(f => f.id === '2f') && !logicalMainConnections.some(connection => connection.toFloorId === '2f')) {
                errors.push('1階と2階を結ぶ階段の接続設定が一致していません。1階・2階の「この階を初期配置に戻す」で階段を復元してください。');
            }
            if (editor.floors.some(f => f.id === 'b1f') && !logicalMainConnections.some(connection => connection.toFloorId === 'b1f')) {
                errors.push('1階と地下1階を結ぶ階段の接続設定が一致していません。1階・地下1階の「この階を初期配置に戻す」で階段を復元してください。');
            }
            const logicalReachableFloors = new Set([MAIN_FLOOR_ID]);
            const floorQueue = [MAIN_FLOOR_ID];
            while (floorQueue.length) {
                const floorId = floorQueue.shift();
                for (const connection of stairConnectionCandidatesFrom(editorState, floorId)) {
                    if (logicalReachableFloors.has(connection.toFloorId)) continue;
                    logicalReachableFloors.add(connection.toFloorId);
                    floorQueue.push(connection.toFloorId);
                }
            }
            for (const floor of editor.floors.filter(candidate => candidate.id !== MAIN_FLOOR_ID && !['2f', 'b1f'].includes(candidate.id))) {
                if (!logicalReachableFloors.has(floor.id)) errors.push(`${floor.name}が1階と階段で接続されていません。その階と接続元の階を「この階を初期配置に戻す」で復元してください。`);
            }
        }
        return [...new Set(errors)];
    }

    function setEditorEntrance(editor, floor, x, y) {
        if (floor.id !== MAIN_FLOOR_ID) return;
        const oldEntranceKeys = new Set((floor.entrance || []).map(point => cellKey(point.x, point.y)));
        const horizontalStart = Math.max(0, Math.min(floor.width - 3, x - 1));
        const verticalStart = Math.max(0, Math.min(floor.height - 3, y - 1));
        const candidates = [
            { cells: [0, 1, 2].map(offset => ({ x: horizontalStart + offset, y })), outward: { x: 0, y: -1 } },
            { cells: [0, 1, 2].map(offset => ({ x: horizontalStart + offset, y })), outward: { x: 0, y: 1 } },
            { cells: [0, 1, 2].map(offset => ({ x, y: verticalStart + offset })), outward: { x: -1, y: 0 } },
            { cells: [0, 1, 2].map(offset => ({ x, y: verticalStart + offset })), outward: { x: 1, y: 0 } }
        ];
        const candidate = candidates.find(item => item.cells.every(point => {
            if (point.x < 0 || point.y < 0 || point.x >= floor.width || point.y >= floor.height) return false;
            if (!oldEntranceKeys.has(cellKey(point.x, point.y)) && isFloorCell(floor, point.x, point.y)) return false;
            if (objectPartAtCell(floor, point.x, point.y)) return false;
            const outwardFloor = isFloorCell(floor, point.x + item.outward.x, point.y + item.outward.y);
            const inwardFloor = isFloorCell(floor, point.x - item.outward.x, point.y - item.outward.y);
            return !outwardFloor && inwardFloor;
        }));
        if (!candidate) {
            editor.message = '入口は床に沿って自動生成された外周壁を選んでください。';
            return;
        }
        pushEditorUndo(editor);
        (floor.entrance || []).forEach(point => {
            if (point.y >= 0 && point.y < floor.height && point.x >= 0 && point.x < floor.width) floor.grid[point.y][point.x] = 1;
        });
        const cells = candidate.cells;
        floor.entrance = cells;
        cells.forEach(cell => { floor.grid[cell.y][cell.x] = 0; });
        editor.message = '入口を3マスで配置しました。';
    }

    function handleEditorCell(x, y) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor) return;
        const floor = editorFloor(editor);
        if (editor.tool === 'entrance') {
            setEditorEntrance(editor, floor, x, y);
        } else if (editor.selectedUnplacedId) {
            const object = editor.unplacedEquipment.find(candidate => candidate.id === editor.selectedUnplacedId);
            const conflicts = new Set(object ? conflictingEquipmentTypes(object.type) : []);
            const lockedConflict = editor.floors.flatMap(candidateFloor => candidateFloor.objects || []).find(candidate => conflicts.has(candidate.type) && candidate.locked);
            if (!object) {
                editor.message = '設置する設備を選び直してください。';
            } else if (lockedConflict) {
                editor.message = '固定中の設備は移動できません。';
            } else if (!objectCanOccupy(floor, object, x, y, null) || objectOverlapsServiceMarker(editor, floor.id, object, x, y)) {
                editor.message = 'そのマスには設備を置けません。';
            } else {
                pushEditorUndo(editor);
                editor.floors.forEach(candidateFloor => {
                    const removed = candidateFloor.objects.filter(candidate => conflicts.has(candidate.type));
                    candidateFloor.objects = candidateFloor.objects.filter(candidate => !conflicts.has(candidate.type));
                    removed.forEach(candidate => editor.unplacedEquipment.push({ ...candidate, x: 0, y: 0, locked: false }));
                });
                editor.unplacedEquipment = editor.unplacedEquipment.filter(candidate => candidate.id !== object.id);
                floor.objects.push({ ...object, x, y, locked: false });
                editor.selectedUnplacedId = null;
                editor.message = `${OBJECT_DEFS[object.type].name}を設置しました。代替関係にある設備は収納しました。`;
            }
        } else if (editor.selectedObjectId) {
            const sourceFloor = editor.floors.find(candidate => candidate.objects.some(object => object.id === editor.selectedObjectId));
            const object = sourceFloor?.objects.find(candidate => candidate.id === editor.selectedObjectId);
            if (!object) return;
            const changesFloor = sourceFloor.id !== floor.id;
            const stairErrors = stairLayout(object.type) && !changesFloor ? stairPlacementErrors(floor, object, x, y) : [];
            if (object.locked) {
                editor.message = '固定中の設備は移動できません。';
            } else if (stairLayout(object.type) && changesFloor) {
                editor.message = '階段は接続先が決まっているため別の階へ移せません。同じ階の中で移動してください。';
            } else if (stairErrors.length || !objectCanOccupy(floor, object, x, y, changesFloor ? null : object.id) || objectOverlapsServiceMarker(editor, floor.id, object, x, y)) {
                editor.message = stairErrors[0] || 'そのマスには設備を置けません。設備全体が床に収まり、他の設備・入口・基準位置と重ならない空きマスを選んでください。';
            } else {
                pushEditorUndo(editor);
                if (changesFloor) {
                    sourceFloor.objects = sourceFloor.objects.filter(candidate => candidate.id !== object.id);
                    floor.objects.push({ ...object, x, y });
                    editor.message = `${OBJECT_DEFS[object.type].name}を${floor.name}へ移動しました。`;
                } else {
                    object.x = x;
                    object.y = y;
                    editor.message = `${OBJECT_DEFS[object.type].name}を移動しました。`;
                }
            }
        } else if (editor.selectedMarkerId) {
            const marker = editorServiceMarker(editor, editor.selectedMarkerId);
            if (!marker) return;
            const overlappingMarker = editorServiceMarkers(editor).find(other => other.id !== marker.id && other.point.floorId === floor.id && other.point.x === x && other.point.y === y);
            if (marker.id === 'customer_entry' && floor.id !== MAIN_FLOOR_ID) {
                editor.message = 'お客様入口は屋外とつながる1階に配置してください。';
            } else if (!isWalkable(floor, x, y) || overlappingMarker) {
                editor.message = '基準位置は設備や別の基準位置がない床マスへ移動してください。';
            } else {
                pushEditorUndo(editor);
                marker.point.x = x;
                marker.point.y = y;
                marker.point.floorId = floor.id;
                editor.message = `${marker.label}を${floor.name}へ移動しました。`;
            }
        } else if (editor.tool === 'floor') {
            if (!editor.selectedFloorCell) {
                const entrance = (floor.entrance || []).some(point => point.x === x && point.y === y);
                const occupied = !!objectPartAtCell(floor, x, y) || serviceMarkerAt(editor, floor.id, x, y);
                const stairAccess = stairAccessAtCell(floor, x, y);
                if (!isFloorCell(floor, x, y)) {
                    editor.message = '先に移動する床マスを選んでください。';
                } else if (entrance || occupied) {
                    editor.message = '入口・設備・基準位置がある床マスは移動できません。';
                } else if (stairAccess) {
                    const stairName = OBJECT_DEFS[stairAccess.object.type]?.name || stairAccess.object.type;
                    editor.message = `${stairName}の${stairAccess.role} ${pointLabel(stairAccess.point)} に必要な床です。先に階段を別の有効な位置へ移動してください。`;
                } else {
                    editor.selectedFloorCell = { x, y };
                    editor.message = '床マスの移動先を選んでください。外周壁は自動で再計算されます。';
                }
            } else if (isFloorCell(floor, x, y)) {
                editor.message = '床のない移動先を選んでください。';
            } else {
                const first = editor.selectedFloorCell;
                pushEditorUndo(editor);
                floor.grid[first.y][first.x] = 1;
                floor.grid[y][x] = 0;
                editor.selectedFloorCell = null;
                editor.message = '床マスを移動し、外周壁を自動で再計算しました。';
            }
        }
        ensureEditorFloorPadding(editor, floor);
        renderBlacksmithEditor();
    }

    function blacksmithEditorSpriteHtml(spriteKey, size = 64) {
        const sprite = window.BLACKSMITH_SPRITES[spriteKey];
        if (!sprite) return '';
        const width = Math.max(1, Number(sprite.sw) || 1);
        const height = Math.max(1, Number(sprite.sh) || 1);
        const scale = Math.max(0.001, Number(sprite.scale) || 1);
        const renderScaleX = scale * size / width;
        const renderScaleY = sprite.tileFill ? scale * size / height : renderScaleX;
        return `<span style="position:absolute;left:50%;bottom:0;margin-left:${-width / 2}px;width:${width}px;height:${height}px;background-image:url('${sprite.img}');background-position:${-(Number(sprite.sx) || 0)}px ${-(Number(sprite.sy) || 0)}px;background-repeat:no-repeat;transform:scale(${renderScaleX},${renderScaleY});transform-origin:bottom center;"></span>`;
    }

    function blacksmithEditorObjectHtml(object, size = 64, part = null) {
        const def = OBJECT_DEFS[object.type];
        if (!def) return '';
        const sprite = part?.sprite || def.sprite;
        if (sprite) return `<span class="blacksmith-layout-object-visual">${blacksmithEditorSpriteHtml(sprite, size)}</span>`;
        return `<span style="font-size:${Math.round(size * .58)}px;line-height:${size}px;">${def.icon || '■'}</span>`;
    }

    function renderBlacksmithEditor() {
        const editor = window.BLACKSMITH_EDITOR;
        const modal = document.getElementById('blacksmith-layout-editor');
        if (!editor || !modal) return;
        const previousMapWrap = modal.querySelector('.blacksmith-layout-map-wrap');
        const previousSidebar = modal.querySelector('.blacksmith-layout-sidebar');
        const scrollState = {
            mapLeft: previousMapWrap?.scrollLeft || 0,
            mapTop: previousMapWrap?.scrollTop || 0,
            sidebarTop: previousSidebar?.scrollTop || 0
        };
        const floor = editorFloor(editor);
        const errors = validateEditor(editor);
        const walls = automaticWallCells(floor);
        const themeSprites = floorThemeSprites(floor);
        const markers = editorServiceMarkers(editor).filter(marker => marker.point.floorId === floor.id);
        const expansionZones = Array.isArray(floor.expansionZones) ? floor.expansionZones : [];
        const isExpandedCell = (x, y) => expansionZones.some(zone => x >= zone.x && y >= zone.y && x < zone.x + zone.width && y < zone.y + zone.height);
        const floorButtons = editor.floors.map(f => `<button onclick="window.changeBlacksmithEditorFloor('${f.id}')" style="${f.id === floor.id ? 'border-color:#ffb74d;background:linear-gradient(#8b5423,#4c2c16);' : ''}">${f.name}${f.expansionZones?.length ? '（拡張済み）' : ''}</button>`).join('');
        const objectButtons = floor.objects.map(object => `<button class="blacksmith-layout-object-card ${editor.selectedObjectId === object.id ? 'selected' : ''}" onclick="window.selectBlacksmithEditorObject('${object.id}')"><span class="blacksmith-layout-thumb">${blacksmithEditorObjectHtml(object, 48)}</span><span><strong>${escapeHtml(OBJECT_DEFS[object.type]?.name || object.type)}</strong><small style="display:block;color:#9da5ad;">${object.x}, ${object.y}${object.locked ? '・固定中' : ''}</small>${OBJECT_DEFS[object.type]?.bonus ? `<small style="display:block;color:#ffd180;">${escapeHtml(OBJECT_DEFS[object.type].bonus)}</small>` : ''}</span><span class="blacksmith-layout-card-actions">${object.type.startsWith('stairs_') ? '' : `<span onclick="event.stopPropagation();window.storeBlacksmithEditorObject('${object.id}')" title="未設置設備へ収納">📥</span>`}<span onclick="event.stopPropagation();window.toggleBlacksmithEditorObjectLock('${object.id}')" title="位置を固定・解除">${object.locked ? '🔒' : '🔓'}</span></span></button>`).join('');
        const unplacedButtons = editor.unplacedEquipment.map(object => `<button class="blacksmith-layout-object-card ${editor.selectedUnplacedId === object.id ? 'selected' : ''}" onclick="window.selectBlacksmithUnplacedEquipment('${object.id}')"><span class="blacksmith-layout-thumb">${blacksmithEditorObjectHtml(object, 48)}</span><span><strong>${escapeHtml(OBJECT_DEFS[object.type]?.name || object.type)}</strong><small style="display:block;color:#9da5ad;">選択後、配置する階へ切り替えて空き床を押す</small>${OBJECT_DEFS[object.type]?.bonus ? `<small style="display:block;color:#ffd180;">${escapeHtml(OBJECT_DEFS[object.type].bonus)}</small>` : ''}</span><span>＋</span></button>`).join('');
        const directionData = [['up', '↑', '上'], ['right', '→', '右'], ['down', '↓', '下'], ['left', '←', '左']];
        const directionButtons = marker => directionData.map(([direction, arrow, label]) => `<button onclick="window.setBlacksmithEditorMarkerDirection('${marker.id}','${direction}')" class="${marker.point.dir === direction ? 'active' : ''}" title="向きを${label}にする" aria-pressed="${marker.point.dir === direction}">${arrow}<small>${label}</small></button>`).join('');
        const directionName = marker => directionData.find(([direction]) => direction === marker.point.dir)?.[2] || '下';
        const markerButtons = markers.map(marker => `<div class="blacksmith-layout-marker-card ${editor.selectedMarkerId === marker.id ? 'selected' : ''}"><button class="blacksmith-layout-marker-select" onclick="window.selectBlacksmithEditorMarker('${marker.id}')"><span class="blacksmith-layout-marker-icon ${marker.type}">${marker.icon}</span><span><strong>${escapeHtml(marker.label)}</strong><small>位置 ${marker.point.x}, ${marker.point.y}</small></span></button><span class="blacksmith-layout-marker-facing">向き：<strong>${directionName(marker)}</strong></span><span class="blacksmith-layout-marker-directions">${directionButtons(marker)}</span></div>`).join('');
        const themeButtons = Object.entries(INTERIOR_THEMES).map(([themeId, theme]) => {
            const unlocked = editor.level >= theme.unlockLevel;
            return `<button class="blacksmith-layout-theme ${floor.interiorTheme === themeId ? 'selected' : ''}" onclick="window.setBlacksmithInteriorTheme('${themeId}')" ${unlocked ? '' : 'disabled'}><span style="${spriteBackground(theme.floorSprite, 34, 34)}"></span><span style="${spriteBackground(theme.wallSprite, 34, 34)}"></span><strong>${escapeHtml(theme.name)}</strong><small>${unlocked ? (theme.bonus || '床・壁セット') : `Lv${theme.unlockLevel}で解放`}</small></button>`;
        }).join('');
        const grid = floor.grid.map((row, y) => row.map((cell, x) => {
            const objectCell = objectPartAtCell(floor, x, y);
            const object = objectCell?.object || null;
            const entrance = floor.entrance.some(e => e.x === x && e.y === y);
            const cellMarkers = markers.filter(marker => marker.point.x === x && marker.point.y === y);
            const selected = editor.selectedFloorCell && editor.selectedFloorCell.x === x && editor.selectedFloorCell.y === y;
            const floorCell = cell === 0;
            const autoWall = walls.has(cellKey(x, y));
            const tileStyle = floorCell ? spriteBackground(themeSprites.floor, 64, 64) : autoWall ? spriteBackground(themeSprites.wall, 64, 64) : 'background:#08090a;';
            const markerHtml = cellMarkers.map(marker => `<span class="blacksmith-layout-map-marker ${marker.type} ${editor.selectedMarkerId === marker.id ? 'selected' : ''}">${marker.icon}<small>${directionData.find(([direction]) => direction === marker.point.dir)?.[1] || '↓'}</small></span>`).join('');
            const expanded = isExpandedCell(x, y);
            const expansionLabel = expansionZones.some(zone => zone.x === x && zone.y === y) ? '<span class="blacksmith-layout-expansion-label">Lv5拡張</span>' : '';
            return `<button class="blacksmith-layout-cell ${selected ? 'selected' : ''} ${floorCell ? 'floor-cell' : autoWall ? 'auto-wall-cell' : 'void-cell'} ${expanded ? 'expanded-area' : ''}" onclick="window.handleBlacksmithEditorCell(${x},${y})" title="${x}, ${y}" style="${tileStyle}z-index:${object ? 500 + y * 10 : y};">${object ? blacksmithEditorObjectHtml(object, 64, objectCell.part) : ''}${entrance ? '<span class="entrance-label">入口</span>' : ''}${markerHtml}${expansionLabel}</button>`;
        }).join('')).join('');
        const outsideWalls = [...walls].map(key => key.split(',').map(Number)).filter(([x, y]) => x < 0 || y < 0 || x >= floor.width || y >= floor.height).map(([x, y]) => `<span class="blacksmith-layout-auto-wall-outside" style="left:${x * 64}px;top:${y * 64}px;${spriteBackground(themeSprites.wall, 64, 64)}"></span>`).join('');
        const expansionInfo = expansionZones.length ? '<div class="blacksmith-layout-expansion-info">Lv5店舗拡張：1階に床40マス追加（青い枠）</div>' : '';
        modal.innerHTML = `<div class="blacksmith-dialog blacksmith-layout-dialog"><header><div><h2>⚒️ 鍛冶屋の模様替え</h2><p>設備・床・入口・AI店員とお客様の基準位置を編集します。外周壁は床形状から自動生成されます。</p></div>${floorButtons}<button onclick="window.undoBlacksmithEditor()" ${editor.undo.length ? '' : 'disabled'}>↶ 元に戻す</button><button onclick="window.redoBlacksmithEditor()" ${editor.redo.length ? '' : 'disabled'}>↷ やり直す</button></header><div class="blacksmith-layout-body"><div class="blacksmith-layout-map-wrap"><div class="blacksmith-layout-map" style="grid-template-columns:repeat(${floor.width},64px);grid-template-rows:repeat(${floor.height},64px);">${outsideWalls}${grid}</div></div><aside class="blacksmith-layout-sidebar"><h3>編集ツール</h3>${expansionInfo}<div class="blacksmith-layout-tools"><button class="${editor.tool === 'select' ? 'active' : ''}" onclick="window.setBlacksmithEditorTool('select')">✥ 設備移動</button><button class="${editor.tool === 'floor' ? 'active' : ''}" onclick="window.setBlacksmithEditorTool('floor')">▦ 床を移動</button><button class="${editor.tool === 'entrance' ? 'active' : ''}" onclick="window.setBlacksmithEditorTool('entrance')" ${floor.id === MAIN_FLOOR_ID ? '' : 'disabled'}>⇩ 入口</button><button class="${editor.tool === 'markers' ? 'active' : ''}" onclick="window.setBlacksmithEditorTool('markers')">◆ 基準位置</button></div><p class="blacksmith-layout-help">設備または基準位置を選び、必要なら階タブを切り替えてから移動先を押します。階段は接続先が決まっているため同じ階の中だけ移動できます。床は床マスと黒い空きマスを順に選ぶと移動でき、外周壁は自動生成されます。</p><h3>内装（床・壁セット）</h3><div class="blacksmith-layout-theme-list">${themeButtons}</div><h3>設置中の設備</h3><div class="blacksmith-layout-object-list">${objectButtons || '<div class="blacksmith-production-empty">この階に設備はありません。</div>'}</div><h3>未設置の設備</h3><div class="blacksmith-layout-object-list">${unplacedButtons || '<div class="blacksmith-production-empty">未設置の設備はありません。</div>'}</div><h3>この階のAI・お客様の基準位置</h3><p class="blacksmith-layout-help">カードを選び、必要なら階タブを切り替えて床を押すと別の階へも移動できます。お客様入口だけは1階専用です。</p><div class="blacksmith-layout-marker-list">${markerButtons || '<div class="blacksmith-production-empty">この階に基準位置はありません。</div>'}</div><button onclick="window.resetBlacksmithEditorFloor()">この階を初期配置に戻す</button><div class="blacksmith-layout-valid ${errors.length ? 'error' : ''}" style="margin-top:13px;">${errors.length ? errors.map(escapeHtml).join('<br>') : '✓ 保存条件を満たしています。'}</div><div style="margin-top:10px;color:#ffd180;font-size:12px;">${escapeHtml(editor.message || '')}</div></aside></div><footer><button onclick="window.discardBlacksmithEditor()">変更を破棄</button><button onclick="window.saveBlacksmithEditor()" ${errors.length ? 'disabled' : ''}>保存して終了</button></footer></div>`;
        const mapWrap = modal.querySelector('.blacksmith-layout-map-wrap');
        const sidebar = modal.querySelector('.blacksmith-layout-sidebar');
        if (mapWrap) {
            mapWrap.scrollLeft = scrollState.mapLeft + (editor.pendingScrollShift?.x || 0);
            mapWrap.scrollTop = scrollState.mapTop + (editor.pendingScrollShift?.y || 0);
        }
        if (sidebar) sidebar.scrollTop = scrollState.sidebarTop;
        editor.pendingScrollShift = { x: 0, y: 0 };
    }

    window.openBlacksmithEditor = function () {
        const state = window.BLACKSMITH_STATE;
        if (!state || !state.editorUnlocked) {
            showBlacksmithGameDialog({ title: '模様替えは未解放です', message: '模様替えは鍛冶屋Lv5で解放されます。', tone: 'warning' });
            return;
        }
        if (state.isOpen || state.work || state.service || state.opening || state.floorMove || state.customers.length) {
            showBlacksmithGameDialog({ title: '今は模様替えできません', message: '閉店し、すべての作業と接客が終わってから模様替えしてください。', tone: 'warning' });
            return;
        }
        const editorFloors = clone(state.floors);
        window.BLACKSMITH_EDITOR = {
            floors: editorFloors,
            initialFloors: clone(state.floors),
            initialFloorCounts: Object.fromEntries(state.floors.map(floor => [floor.id, floorTileCount(floor)])),
            serviceLayout: normalizeServiceLayout(state.serviceLayout),
            initialServiceLayout: normalizeServiceLayout(state.serviceLayout),
            unplacedEquipment: clone(state.unplacedEquipment || []),
            initialUnplacedEquipment: clone(state.unplacedEquipment || []),
            level: state.level,
            floorId: state.activeFloorId,
            tool: 'select',
            selectedObjectId: null,
            selectedUnplacedId: null,
            selectedMarkerId: null,
            selectedFloorCell: null,
            undo: [],
            redo: [],
            message: '',
            pendingScrollShift: { x: 0, y: 0 }
        };
        window.BLACKSMITH_EDITOR.floors.forEach(floor => ensureEditorFloorPadding(window.BLACKSMITH_EDITOR, floor));
        window.BLACKSMITH_EDITOR.pendingScrollShift = { x: 0, y: 0 };
        let modal = document.getElementById('blacksmith-layout-editor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'blacksmith-layout-editor';
            modal.className = 'blacksmith-modal-backdrop';
            document.body.appendChild(modal);
        }
        renderBlacksmithEditor();
    };

    window.handleBlacksmithEditorCell = handleEditorCell;
    window.changeBlacksmithEditorFloor = function (floorId) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor || !editor.floors.some(f => f.id === floorId)) return;
        editor.floorId = floorId;
        editor.selectedFloorCell = null;
        renderBlacksmithEditor();
    };
    window.setBlacksmithEditorTool = function (tool) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor) return;
        editor.tool = tool;
        editor.selectedObjectId = null;
        editor.selectedUnplacedId = null;
        editor.selectedMarkerId = null;
        editor.selectedFloorCell = null;
        renderBlacksmithEditor();
    };
    window.selectBlacksmithEditorObject = function (objectId) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor) return;
        editor.tool = 'select';
        editor.selectedObjectId = objectId;
        editor.selectedUnplacedId = null;
        editor.selectedMarkerId = null;
        editor.selectedFloorCell = null;
        renderBlacksmithEditor();
    };
    window.selectBlacksmithEditorMarker = function (markerId) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor || !editorServiceMarker(editor, markerId)) return;
        editor.tool = 'markers';
        editor.selectedObjectId = null;
        editor.selectedUnplacedId = null;
        editor.selectedMarkerId = markerId;
        editor.selectedFloorCell = null;
        editor.floorId = editorServiceMarker(editor, markerId).point.floorId;
        renderBlacksmithEditor();
    };
    window.selectBlacksmithUnplacedEquipment = function (objectId) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor || !editor.unplacedEquipment.some(object => object.id === objectId)) return;
        editor.tool = 'select';
        editor.selectedObjectId = null;
        editor.selectedUnplacedId = objectId;
        editor.selectedMarkerId = null;
        editor.selectedFloorCell = null;
        editor.message = '設置先の階へ切り替え、空き床マスを選んでください。';
        renderBlacksmithEditor();
    };
    window.storeBlacksmithEditorObject = function (objectId) {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor) return;
        const floor = editor.floors.find(candidate => candidate.objects.some(object => object.id === objectId));
        const object = floor?.objects.find(candidate => candidate.id === objectId);
        if (!floor || !object || object.type.startsWith('stairs_')) return;
        if (object.locked) {
            editor.message = '固定中の設備は移動できません。';
            renderBlacksmithEditor();
            return;
        }
        pushEditorUndo(editor);
        floor.objects = floor.objects.filter(candidate => candidate.id !== objectId);
        editor.unplacedEquipment.push({ ...object, x: 0, y: 0, locked: false });
        editor.selectedObjectId = null;
        editor.message = `${OBJECT_DEFS[object.type].name}を未設置設備へ収納しました。`;
        renderBlacksmithEditor();
    };
    window.setBlacksmithInteriorTheme = function (themeId) {
        const editor = window.BLACKSMITH_EDITOR;
        const theme = INTERIOR_THEMES[themeId];
        if (!editor || !theme || editor.level < theme.unlockLevel) return;
        const floor = editorFloor(editor);
        pushEditorUndo(editor);
        floor.interiorTheme = themeId;
        editor.message = `${floor.name}の床・外周壁を「${theme.name}」へ変更しました。`;
        renderBlacksmithEditor();
    };
    window.setBlacksmithEditorMarkerDirection = function (markerId, direction) {
        const editor = window.BLACKSMITH_EDITOR;
        const marker = editor && editorServiceMarker(editor, markerId);
        if (!marker || !['up', 'right', 'down', 'left'].includes(direction)) return;
        pushEditorUndo(editor);
        marker.point.dir = direction;
        editor.message = `${marker.label}の向きを変更しました。`;
        renderBlacksmithEditor();
    };
    window.toggleBlacksmithEditorObjectLock = function (objectId) {
        const editor = window.BLACKSMITH_EDITOR;
        const object = editor && editorFloor(editor).objects.find(o => o.id === objectId);
        if (!object) return;
        pushEditorUndo(editor);
        object.locked = !object.locked;
        editor.message = object.locked ? '設備を固定しました。' : '設備の固定を解除しました。';
        renderBlacksmithEditor();
    };
    window.undoBlacksmithEditor = function () {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor || !editor.undo.length) return;
        editor.redo.push(editorSnapshot(editor));
        restoreEditorSnapshot(editor, editor.undo.pop());
        renderBlacksmithEditor();
    };
    window.redoBlacksmithEditor = function () {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor || !editor.redo.length) return;
        editor.undo.push(editorSnapshot(editor));
        restoreEditorSnapshot(editor, editor.redo.pop());
        renderBlacksmithEditor();
    };
    window.resetBlacksmithEditorFloor = function () {
        const editor = window.BLACKSMITH_EDITOR;
        if (!editor) return;
        pushEditorUndo(editor);
        let replacement;
        if (editor.floorId === MAIN_FLOOR_ID) {
            const ownedEquipment = [...editor.floors.flatMap(floor => floor.objects || []), ...editor.unplacedEquipment]
                .filter(object => !object.type.startsWith('stairs_'));
            const ownedByType = new Map(ownedEquipment.map(object => [object.type, { ...object, x: 0, y: 0, locked: false }]));
            replacement = createMainFloor(true, editor.level);
            if (ownedByType.has('magic_furnace')) {
                const furnace = replacement.objects.find(object => object.type === 'furnace');
                furnace.id = 'magic_furnace';
                furnace.type = 'magic_furnace';
            }
            if (editor.floors.some(floor => floor.id === '2f')) replacement.objects.push(defaultStairObject(MAIN_FLOOR_ID, 'stairs_up'));
            if (editor.floors.some(floor => floor.id === 'b1f')) replacement.objects.push(defaultStairObject(MAIN_FLOOR_ID, 'stairs_down'));
            const replacementTypes = new Set(replacement.objects.filter(object => !object.type.startsWith('stairs_')).map(object => object.type));
            const conflictsWithReplacement = type => replacementTypes.has(type)
                || [...replacementTypes].some(replacementType => conflictingEquipmentTypes(replacementType).includes(type));
            editor.floors.filter(floor => floor.id !== MAIN_FLOOR_ID).forEach(floor => {
                floor.objects = floor.objects.filter(object => object.type.startsWith('stairs_') || !conflictsWithReplacement(object.type));
            });
            const installedTypes = new Set([
                ...replacement.objects,
                ...editor.floors.filter(floor => floor.id !== MAIN_FLOOR_ID).flatMap(floor => floor.objects || [])
            ].map(object => object.type));
            editor.unplacedEquipment = [...ownedByType.values()].filter(object => !installedTypes.has(object.type));
            editor.serviceLayout = clone(DEFAULT_BLACKSMITH_SERVICE_LAYOUT);
        } else {
            const currentFloor = editorFloor(editor);
            const installedElsewhere = new Set(editor.floors.filter(floor => floor.id !== currentFloor.id).flatMap(floor => floor.objects || []).map(object => object.type));
            const unplacedTypes = new Set(editor.unplacedEquipment.map(object => object.type));
            currentFloor.objects.filter(object => !object.type.startsWith('stairs_')).forEach(object => {
                if (!installedElsewhere.has(object.type) && !unplacedTypes.has(object.type)) {
                    editor.unplacedEquipment.push({ ...object, x: 0, y: 0, locked: false });
                    unplacedTypes.add(object.type);
                }
            });
            replacement = createExtraFloor(editor.floorId, editorFloor(editor).name);
        }
        const index = editor.floors.findIndex(f => f.id === editor.floorId);
        editor.floors[index] = replacement;
        ensureEditorFloorPadding(editor, replacement);
        editor.message = 'この階を制作者の初期配置に戻しました。';
        renderBlacksmithEditor();
    };
    window.saveBlacksmithEditor = function () {
        const editor = window.BLACKSMITH_EDITOR;
        const state = window.BLACKSMITH_STATE;
        if (!editor || !state) return;
        const errors = validateEditor(editor);
        if (errors.length) {
            showBlacksmithGameDialog({ title: '保存できない配置です', message: errors.join('\n'), tone: 'warning' });
            return;
        }
        const savedEditor = {
            floors: clone(editor.floors),
            serviceLayout: normalizeServiceLayout(editor.serviceLayout)
        };
        savedEditor.floors.forEach(floor => trimEditorFloor(savedEditor, floor));
        state.floors = savedEditor.floors;
        state.serviceLayout = normalizeServiceLayout(savedEditor.serviceLayout);
        state.unplacedEquipment = clone(editor.unplacedEquipment);
        state.player = { ...state.serviceLayout.aiStandby, path: [] };
        state.activeFloorId = state.player.floorId;
        addLog(state, '鍛冶屋の模様替えを保存した。', '#ffd180');
        window.BLACKSMITH_EDITOR = null;
        document.getElementById('blacksmith-layout-editor')?.remove();
        save();
        renderBlacksmith();
    };
    window.discardBlacksmithEditor = function () {
        if (!window.BLACKSMITH_EDITOR) return;
        showBlacksmithGameDialog({
            title: '模様替えを破棄しますか？',
            message: '今回の模様替えで行った変更は元に戻せません。',
            tone: 'warning',
            actions: [
                { label: '編集に戻る' },
                { label: '変更を破棄', danger: true, onSelect: () => {
                    window.BLACKSMITH_EDITOR = null;
                    document.getElementById('blacksmith-layout-editor')?.remove();
                    renderBlacksmith();
                } }
            ]
        });
    };

    function setBlacksmithLevelForDebug(building, requestedLevel) {
        if (!isSmithBuilding(building)) return { ok: false, reason: 'missing_building' };
        const numericLevel = Number(requestedLevel);
        if (!Number.isFinite(numericLevel) || numericLevel < 1 || numericLevel > 30) return { ok: false, reason: 'invalid_level' };
        const targetLevel = Math.trunc(numericLevel);
        const state = normalizeState(building);
        const previousLevel = state.level;
        state.level = targetLevel;
        state.exp = 0;
        state.reputation = Math.min(state.reputation, getMaxReputation(targetLevel));
        if (targetLevel >= 5) {
            state.editorUnlocked = true;
            if (window.aiPet) window.aiPet.blacksmithLayoutEditorUnlocked = true;
        }
        const floorChange = ensureLevelFloors(state);
        const equipmentGranted = grantUnlockedEquipment(state, true);
        addLog(state, `デバッグで鍛冶屋Lvを${previousLevel}から${targetLevel}に設定した。`, '#80d8ff');
        return { ok: true, state, previousLevel, targetLevel, floorChange, equipmentGranted };
    }

    window.refreshDebugBlacksmithLevelUI = function () {
        const input = document.getElementById('dbg-blacksmith-level');
        const status = document.getElementById('dbg-blacksmith-level-status');
        if (!input && !status) return;
        const building = findOwnedBlacksmithBuilding();
        if (!building) {
            if (status) status.textContent = '自分の鍛冶屋がありません。';
            if (input) input.disabled = true;
            return;
        }
        const state = normalizeState(building);
        if (input) {
            input.disabled = false;
            input.value = state.level;
        }
        if (status) status.textContent = `現在の鍛冶屋Lv: ${state.level}`;
    };

    window.applyDebugBlacksmithLevel = function () {
        const input = document.getElementById('dbg-blacksmith-level');
        const status = document.getElementById('dbg-blacksmith-level-status');
        const building = findOwnedBlacksmithBuilding();
        const result = setBlacksmithLevelForDebug(building, input?.value);
        if (!result.ok) {
            if (status) status.textContent = result.reason === 'missing_building'
                ? '自分の鍛冶屋がありません。'
                : '鍛冶屋Lvは1～30で入力してください。';
            return false;
        }
        if (window.BLACKSMITH_STATE === result.state || window.currentBlacksmithBuilding === building) {
            window.BLACKSMITH_STATE = result.state;
            renderBlacksmith();
        }
        if (input) input.value = result.targetLevel;
        if (status) status.textContent = `鍛冶屋Lv${result.targetLevel}に設定しました。店舗拡張・階層・設備解放も反映済みです。`;
        save();
        return true;
    };

    function finishBlacksmithRouteTest(message = '', notify = true, tone = 'success') {
        const runtime = window.BLACKSMITH_ROUTE_TEST;
        if (!runtime) return false;
        window.BLACKSMITH_ROUTE_TEST = null;
        clearBlacksmithFloorFade();
        const restoredState = clone(runtime.stateSnapshot);
        runtime.building.blacksmithBusiness = restoredState;
        window.currentBlacksmithBuilding = runtime.building;
        window.BLACKSMITH_STATE = restoredState;
        if (window.aiPet) {
            window.aiPet.inventory = clone(runtime.aiInventory);
            window.aiPet.gold = runtime.aiGold;
            window.aiPet.blacksmithLayoutEditorUnlocked = runtime.editorUnlocked;
        }
        const status = document.getElementById('dbg-blacksmith-route-status');
        if (status && message) status.textContent = message;
        save();
        renderBlacksmith();
        if (notify && message && document.getElementById('blacksmith-management-ui')?.style.display !== 'none') {
            showBlacksmithGameDialog({ title: '鍛冶屋の動線テスト', message, tone });
        }
        return true;
    }

    window.startDebugBlacksmithRouteTest = function (kind) {
        const status = document.getElementById('dbg-blacksmith-route-status');
        const building = findOwnedBlacksmithBuilding();
        if (!building) {
            if (status) status.textContent = '自分の鍛冶屋がありません。';
            return false;
        }
        if (!['preparation', 'sale'].includes(kind) || window.BLACKSMITH_ROUTE_TEST) {
            if (status) status.textContent = 'すでに動線テストを実行中です。';
            return false;
        }
        const state = normalizeState(building);
        if (state.isOpen || state.work || state.service || state.opening || state.floorMove || state.customers.length) {
            if (status) status.textContent = '鍛冶屋を閉店し、作業・接客・来客がない状態にしてから実行してください。';
            return false;
        }
        const layoutErrors = validateEditor({
            floors: clone(state.floors),
            floorId: MAIN_FLOOR_ID,
            serviceLayout: normalizeServiceLayout(state.serviceLayout),
            initialFloorCounts: Object.fromEntries(state.floors.map(floor => [floor.id, floorTileCount(floor)]))
        });
        if (layoutErrors.length) {
            if (status) status.textContent = `模様替えに未解決の問題があります：${layoutErrors[0]}`;
            return false;
        }
        const stateSnapshot = clone(state);
        const managementUi = document.getElementById('blacksmith-management-ui');
        if (window.currentBlacksmithBuilding !== building || !managementUi || managementUi.style.display === 'none') {
            if (!window.openBlacksmithMapUI(building)) {
                if (status) status.textContent = '鍛冶屋画面を開けませんでした。鍛冶師の免許皆伝状態を確認してください。';
                return false;
            }
        }
        const testState = window.BLACKSMITH_STATE || state;
        window.BLACKSMITH_ROUTE_TEST = {
            kind,
            building,
            state: testState,
            stateSnapshot,
            aiInventory: clone(window.aiPet?.inventory || []),
            aiGold: Math.max(0, Number(window.aiPet?.gold) || 0),
            editorUnlocked: window.aiPet?.blacksmithLayoutEditorUnlocked
        };
        testState.tutorial.completed = true;
        testState.tutorial.phase = 'completed';
        testState.isOpen = false;
        testState.paused = false;
        testState.tactics = clone(DEFAULT_BLACKSMITH_TACTICS);
        const recipeId = 'eq_sword';
        const recipe = window.BLACKSMITH_RECIPE_CATALOG[recipeId];
        if (kind === 'preparation') {
            if (!window.aiPet) {
                finishBlacksmithRouteTest('AIキャラクターが見つからないため、動線テストを開始できませんでした。', true, 'warning');
                return false;
            }
            if (!Array.isArray(window.aiPet.inventory)) window.aiPet.inventory = [];
            Object.entries(recipe.materials).forEach(([id, count]) => {
                const shortage = Math.max(0, count - inventoryCount(id));
                for (let index = 0; index < shortage; index += 1) window.aiPet.inventory.push({ id, age: 0 });
            });
            if (!startPreparation(testState, recipeId, true, { source: 'debug_route' })) {
                finishBlacksmithRouteTest('設備または階段への経路を作れないため、仕込み動線テストを開始できませんでした。', true, 'warning');
                return false;
            }
            if (status) status.textContent = '仕込み動線テストを実行中です。AI店員が各設備を順に回ります。';
        } else {
            testState.recipes[recipeId] = { discovered: true, mastery: 100 };
            testState.stock[recipeId] = Math.max(1, Number(testState.stock[recipeId]) || 0);
            testState.isOpen = true;
            if (!spawnCustomer(testState, recipeId, true)) {
                finishBlacksmithRouteTest('商品棚または階段への経路を作れないため、販売動線テストを開始できませんでした。', true, 'warning');
                return false;
            }
            testState.customers[testState.customers.length - 1].blacksmithRouteTest = true;
            if (status) status.textContent = '販売動線テストを実行中です。お客様の商品確認から会計・退店までを再現します。';
        }
        renderBlacksmith();
        return true;
    };

    // F12コンソール用。経営成果とレイアウトを残し、鍛冶屋チュートリアルだけを最初からやり直す。
    window.resetBlacksmithTutorialState = function () {
        const building = findOwnedBlacksmithBuilding();
        if (!building) {
            console.warn('自分の鍛冶屋が見つからないため、チュートリアルを初期化できませんでした。');
            return false;
        }

        const state = normalizeState(building);
        clearBlacksmithTutorialDialogue();
        document.getElementById('blacksmith-tactic-editor')?.remove();
        window.BLACKSMITH_TACTIC_EDITOR = null;
        const preservedLayoutBackup = Array.isArray(state.tutorial?.layoutBackup) ? clone(state.tutorial.layoutBackup) : null;
        state.tutorial = createTutorialState();
        if (preservedLayoutBackup) state.tutorial.layoutBackup = preservedLayoutBackup;
        prepareBlacksmithTutorialLayout(state);
        state.tutorial.master = createTutorialMaster(state);
        state.tactics = [];
        state.work = null;
        state.service = null;
        state.floorMove = null;
        state.customers = [];
        state.isOpen = false;
        state.paused = false;
        state.activeFloorId = MAIN_FLOOR_ID;
        const entrance = getEntrance(state);
        state.player = {
            floorId: MAIN_FLOOR_ID,
            x: Math.min(6, getFloor(state).width - 2),
            y: Math.max(1, entrance.y - 1),
            dir: 'left',
            path: []
        };
        if (window.aiPet) {
            window.aiPet.blacksmithTutorialCompleted = false;
            if (window.aiPet.apprentice && Array.isArray(window.aiPet.apprentice.learnedWords)) {
                window.aiPet.apprentice.learnedWords = window.aiPet.apprentice.learnedWords.filter(word => !['つくる', 'うる'].includes(word));
            }
        }
        building.blacksmithBusiness = state;
        window.BLACKSMITH_STATE = state;
        window.BLACKSMITH_PANEL_STATE = { minimap: false, logStatus: false, recipes: false };
        window.BLACKSMITH_LAST_CAMERA_TRANSFORM = null;
        save();

        const ui = document.getElementById('blacksmith-management-ui');
        if (ui && ui.style.display !== 'none') beginBlacksmithTutorialArrival(state, true);
        else renderBlacksmith();
        console.log('鍛冶屋チュートリアルを初期状態に戻しました。次に自分の鍛冶屋へ入ると、鍛冶師の来店から始まります。');
        return true;
    };

    window.openBlacksmithMapUI = function (building) {
        if (!building || !isSmithBuilding(building)) return false;
        if (!isSmithMastered(window.aiPet)) {
            showBlacksmithGameDialog({ title: '鍛冶屋経営は未解放です', message: '自分の鍛冶屋を経営するには、まず鍛冶師の免許皆伝が必要です。', tone: 'warning' });
            return false;
        }
        const state = normalizeState(building);
        window.currentBlacksmithBuilding = building;
        window.BLACKSMITH_STATE = state;
        clearBlacksmithFloorFade();
        window.BLACKSMITH_PANEL_STATE = { minimap: false, logStatus: false, recipes: false };
        window.BLACKSMITH_LAST_CAMERA_TRANSFORM = null;
        state.isOpen = !!state.isOpen;
        const ui = ensureUi();
        ui.style.display = 'flex';
        window.GameShell.enterFacility('blacksmith', ui, {
            chat: text => {
                window.learnIndoorChatWord(text, message => {
                    customerSpeech(state, state.player, message, '#80d8ff', window.aiPet?.name || 'AI');
                    renderBlacksmith();
                });
                return true;
            },
            resize: () => updateBlacksmithCamera(state),
            resume: () => renderBlacksmith()
        });
        if (window.aiPet) {
            window.aiPet.blacksmithRecipeNotebookUnlocked = true;
            window.aiPet.actionState = 'inside';
            window.aiPet.isIndoors = true;
            window.aiPet.indoorTarget = { type: 'blacksmith_business', buildingId: building.id || null };
            if (Array.isArray(window.aiPet.schedule) && window.aiPet.schedule[0]?.type === 'smith' && !window.aiPet.schedule[0].isTrial) window.aiPet.schedule.shift();
        }
        if (window.blacksmithSimInterval) clearInterval(window.blacksmithSimInterval);
        window.blacksmithSimInterval = setInterval(tickBlacksmith, 500);
        if (!window.blacksmithCameraResizeInstalled && typeof window.addEventListener === 'function') {
            window.addEventListener('resize', () => {
                if (window.BLACKSMITH_STATE) updateBlacksmithCamera(window.BLACKSMITH_STATE);
            });
            window.blacksmithCameraResizeInstalled = true;
        }
        renderBlacksmith();
        document.getElementById('blacksmith-tutorial-modal')?.remove();
        if (!state.tutorial.completed) window.GameShell.deferScene(() => resumeBlacksmithTutorial(state), 250);
        else if (!state.shopNamePrompted) window.GameShell.deferScene(() => openBlacksmithShopNameDialog(state), 250);
        save();
        return true;
    };

    window.closeBlacksmithMapUI = function () {
        if (window.BLACKSMITH_ROUTE_TEST) finishBlacksmithRouteTest('動線テストを中止し、開始前の状態へ戻しました。', false);
        const state = window.BLACKSMITH_STATE;
        clearBlacksmithFloorFade();
        if (window.blacksmithSimInterval) clearInterval(window.blacksmithSimInterval);
        window.blacksmithSimInterval = null;
        document.getElementById('blacksmith-management-ui')?.style.setProperty('display', 'none');
        document.getElementById('blacksmith-tutorial-modal')?.remove();
        document.getElementById('blacksmith-tactic-editor')?.remove();
        document.getElementById('blacksmith-layout-editor')?.remove();
        document.getElementById('blacksmith-production-editor')?.remove();
        document.getElementById('blacksmith-shop-name-dialog')?.remove();
        window.BLACKSMITH_EDITOR = null;
        window.BLACKSMITH_TACTIC_EDITOR = null;
        window.BLACKSMITH_PRODUCTION_EDITOR = null;
        window.BLACKSMITH_PANEL_STATE = { minimap: false, logStatus: false, recipes: false };
        window.BLACKSMITH_LAST_CAMERA_TRANSFORM = null;
        clearBlacksmithTutorialDialogue();
        window.GameShell?.leaveScene('blacksmith');
        if (window.aiPet) {
            window.aiPet.actionState = 'idle';
            window.aiPet.visualAction = null;
            window.aiPet.isIndoors = false;
            window.aiPet.indoorTarget = null;
            window.aiPet.interactionTarget = null;
        }
        save();
    };

    const previousOpenShopManagementUI = window.openShopManagementUI;
    window.openShopManagementUI = function (building) {
        if (isSmithBuilding(building) && typeof currentMode !== 'undefined' && currentMode === 'visit') {
            showBlacksmithGameDialog({ title: 'この鍛冶屋は経営できません', message: 'ここは他人の鍛冶屋です。自分の鍛冶屋経営は自分の島で行えます。', tone: 'warning' });
            return;
        }
        if (isSmithBuilding(building)) return window.openBlacksmithMapUI(building);
        if (typeof previousOpenShopManagementUI === 'function') return previousOpenShopManagementUI.apply(this, arguments);
    };

    function wrapEnterAction(target) {
        if (!target || typeof target.executeEnterAction !== 'function' || target.executeEnterAction._blacksmithBusinessWrapped) return;
        const previous = target.executeEnterAction;
        const wrapped = function () {
            if (isSmithBuilding(this.interactionTarget)) {
                if (!isSmithMastered(this)) {
                    this.actionState = 'idle';
                    this.message = '自分の鍛冶屋を経営するには、まず鍛冶師の免許皆伝が必要だよ。';
                    this.messageTimer = 180;
                    return;
                }
                const key = typeof assets !== 'undefined' ? Object.keys(assets).find(id => assets[id] === this.interactionTarget) : null;
                if (key) this.interactionTarget.id = key;
                window.openBlacksmithMapUI(this.interactionTarget);
                return;
            }
            return previous.apply(this, arguments);
        };
        wrapped._blacksmithBusinessWrapped = true;
        target.executeEnterAction = wrapped;
    }

    if (window.AICharacter && window.AICharacter.prototype) wrapEnterAction(window.AICharacter.prototype);
    if (window.aiPet) wrapEnterAction(window.aiPet);

    window.getBlacksmithBusinessState = normalizeState;
    window.renderBlacksmithMap = renderBlacksmith;
    window.validateBlacksmithLayout = function (floors, serviceLayout) {
        return validateEditor({ floors: clone(floors), floorId: MAIN_FLOOR_ID, serviceLayout: normalizeServiceLayout(serviceLayout) });
    };
    window.__BLACKSMITH_TEST_API = Object.freeze({
        normalizeState,
        startPreparation,
        tickPreparation,
        craftableQuantity,
        productionLimits,
        reservedMaterialCounts,
        selectScheduledRecipe,
        blacksmithEquipmentIsAvailable,
        missingBlacksmithRecipeEquipment,
        hasBlacksmithRecipeEquipment,
        spawnCustomer,
        availableStock,
        tickCustomers,
        tickService,
        beginBlacksmithOpening,
        tickBlacksmithOpening,
        triggerBlacksmithBankruptcy,
        getMaxReputation,
        getUnlockedBlacksmithSkins,
        applyLevelUps,
        ensureLevelFloors,
        grantUnlockedEquipment,
        setBlacksmithLevelForDebug,
        productionRoute,
        preparationQuantity,
        blacksmithSalePrice,
        expandMainFloorForLevel,
        automaticWallCells,
        floorTileCount,
        entranceOutwardVector,
        validateEditor,
        ensureEditorFloorPadding,
        trimEditorFloor,
        isSmithMastered,
        isSmithBuilding,
        beginBlacksmithTutorialArrival,
        completeBlacksmithShopNaming,
        tickBlacksmithTutorial,
        tickTutorialMasterFollow,
        applyTutorialTactic,
        hasTactic,
        getTacticAction,
        calculateBlacksmithCamera,
        blacksmithSpriteLayout,
        blacksmithMapSignature,
        characterElement,
        findPath,
        stepMover,
        beginBlacksmithFloorMove,
        tickBlacksmithFloorMove,
        stairPoint,
        stairConnectionsFrom,
        objectFootprintCells,
        actorMoveMs: ACTOR_MOVE_MS,
        updateBlacksmithHtmlHost,
        ensureBasicEquipment,
        collectBasicEquipment,
        restoreBlacksmithTutorialLayout,
        defaultTactics: () => clone(DEFAULT_BLACKSMITH_TACTICS)
    });
})();
