// デバッグ専用：施設の制作者初期配置を通常セーブから分離して編集・JSON出力する。
(function () {
    'use strict';

    const SCHEMA_VERSION = 1;
    const DRAFT_KEY = 'facility_template_editor_draft_v1';
    const TILE_SIZE = 44;
    const DIRECTIONS = ['up', 'right', 'down', 'left'];
    const clone = value => JSON.parse(JSON.stringify(value));
    const state = {
        facilities: [],
        facilityId: 'myhome',
        stageId: 'initial',
        floorId: '1f',
        template: null,
        selected: null,
        tool: { kind: 'select' },
        undo: [],
        redo: [],
        zoom: 1,
        message: ''
    };

    function cell(kind, spriteKey) {
        return `${kind}|${spriteKey}`;
    }

    function parseCell(value) {
        const [kind = 'floor', spriteKey = ''] = String(value || '').split('|');
        return { kind, spriteKey };
    }

    function borderCells(width, height, floorKey, wallKey, entranceXs = []) {
        const entrances = new Set(entranceXs.map(Number));
        return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
            if (y === height - 1 && entrances.has(x)) return cell('entrance', floorKey);
            return cell((x === 0 || y === 0 || x === width - 1 || y === height - 1) ? 'wall' : 'floor',
                (x === 0 || y === 0 || x === width - 1 || y === height - 1) ? wallKey : floorKey);
        }));
    }

    function makeFloor(id, width, height, floorKey, wallKey, entranceXs = []) {
        return { id, width, height, cells: borderCells(width, height, floorKey, wallKey, entranceXs), objects: [], markers: [] };
    }

    function marker(id, type, x, y, dir, label, icon, spriteBase, color = '#00BCD4', required = true) {
        return { id, type, x, y, dir, label, icon, spriteBase, color, required };
    }

    function object(id, type, spriteKey, x, y, label, options = {}) {
        return Object.assign({ id, type, spriteKey, x, y, w: 1, h: 1, z: 0, label }, options);
    }

    function restaurantStairs(type, x, y) {
        const up = type === 'stairs_up';
        return object(type, type, '', x, y, up ? '上り階段' : '下り階段', {
            w: 2,
            h: up ? 3 : 2,
            parts: up ? [
                { dx: 0, dy: 0, spriteKey: 'rmap_stairs_up_tl' },
                { dx: 1, dy: 0, spriteKey: 'rmap_stairs_up_tr' },
                { dx: 0, dy: 1, spriteKey: 'rmap_stairs_up_ml' },
                { dx: 1, dy: 1, spriteKey: 'rmap_stairs_up_mr' },
                { dx: 0, dy: 2, spriteKey: 'rmap_stairs_up_bl' }
            ] : [
                { dx: 0, dy: 0, spriteKey: 'rmap_stairs_dw_tl' },
                { dx: 1, dy: 0, spriteKey: 'rmap_stairs_dw_tr' },
                { dx: 0, dy: 1, spriteKey: 'rmap_stairs_dw_bl' },
                { dx: 1, dy: 1, spriteKey: 'rmap_stairs_dw_br' }
            ]
        });
    }

    function blacksmithStairs(id, type, x, y, targetFloorId = '') {
        const up = type === 'stairs_up';
        return object(id, type, up ? 'bstairs_up_tl' : 'bstairs_down_tl', x, y, up ? '上り階段' : '下り階段', {
            targetFloorId,
            w: up ? 3 : 2,
            h: up ? 3 : 2,
            parts: up ? [
                { dx: 0, dy: 0, spriteKey: 'bstairs_up_tl' },
                { dx: 1, dy: 0, spriteKey: 'bstairs_up_tr' },
                { dx: 2, dy: 0, spriteKey: 'bstairs_up_ml' },
                { dx: 0, dy: 1, spriteKey: 'bstairs_up_mr' },
                { dx: 0, dy: 2, spriteKey: 'bstairs_up_bl' }
            ] : [
                { dx: 0, dy: 0, spriteKey: 'bstairs_down_tl' },
                { dx: 1, dy: 0, spriteKey: 'bstairs_down_tr' },
                { dx: 0, dy: 1, spriteKey: 'bstairs_down_bl' },
                { dx: 1, dy: 1, spriteKey: 'bstairs_down_br' }
            ]
        });
    }

    function blacksmithStairPalette(type) {
        const stair = blacksmithStairs('', type, 0, 0);
        return { type: stair.type, label: stair.label, spriteKey: stair.spriteKey, w: stair.w, h: stair.h, parts: stair.parts };
    }

    function myHomeDefinition() {
        const floor = makeFloor('1f', 12, 10, 'hmap_floor', 'hmap_wall', [4, 5, 6]);
        floor.objects = [
            object('warehouse', 'warehouse', 'hfur_warehouse', 2, 2, '倉庫'),
            object('freezer', 'freezer', 'hfur_freezer', 4, 2, '冷凍庫'),
            object('safe', 'safe', 'hfur_safe', 7, 2, '金庫'),
            object('dresser', 'dresser', 'hfur_dresser', 9, 3, 'ドレッサー'),
            object('strategy_board', 'strategy_board', 'hfur_strategy_board', 4, 4, '作戦会議用ホワイトボード'),
            object('meeting_chair_l1', 'meeting_chair', 'hfur_chair_left', 2, 5, '会議椅子'),
            object('meeting_table_tl', 'meeting_table', 'hfur_table_tl', 3, 5, '会議テーブル'),
            object('meeting_table_tc', 'meeting_table', 'hfur_table_tc', 4, 5, '会議テーブル'),
            object('meeting_table_tr', 'meeting_table', 'hfur_table_tr', 5, 5, '会議テーブル'),
            object('meeting_chair_r1', 'meeting_chair', 'hfur_chair_right', 6, 5, '会議椅子'),
            object('meeting_chair_l2', 'meeting_chair', 'hfur_chair_left', 2, 6, '会議椅子'),
            object('meeting_table_bl', 'meeting_table', 'hfur_table_bl', 3, 6, '会議テーブル'),
            object('meeting_table_bc', 'meeting_table', 'hfur_table_bc', 4, 6, '会議テーブル'),
            object('meeting_table_br', 'meeting_table', 'hfur_table_br', 5, 6, '会議テーブル'),
            object('meeting_chair_r2', 'meeting_chair', 'hfur_chair_right', 6, 6, '会議椅子')
        ];
        floor.markers = [
            marker('ai_entry', 'ai_entry', 5, 8, 'up', 'AI入室位置', '●', 'robot', '#00BCD4'),
            marker('concierge_wait', 'concierge_wait', 5, 3, 'down', 'コンシェルジュ待機位置', '◆', 'concierge', '#FFD54F'),
            marker('visitor_entry', 'visitor_entry', 5, 9, 'up', '来客入口', '◇', '', '#AB47BC'),
            marker('visitor_seat', 'visitor_seat', 6, 5, 'left', '来客席', '□', '', '#CE93D8')
        ];
        return {
            id: 'myhome', label: 'マイホーム', spriteRegistry: 'MYHOME_SPRITES',
            stages: [{ id: 'initial', label: '初期マップ', template: { schemaVersion: SCHEMA_VERSION, facilityId: 'myhome', stageId: 'initial', floors: [floor] } }],
            tilePalette: [
                { label: '床', code: cell('floor', 'hmap_floor') },
                { label: '壁', code: cell('wall', 'hmap_wall') },
                { label: '入口', code: cell('entrance', 'hmap_floor') }
            ],
            objectPalette: Object.entries(window.MYHOME_SPRITES || {}).filter(([key]) => key.startsWith('hfur_')).map(([key]) => ({ type: key, label: key, spriteKey: key })),
            markerPalette: floor.markers.map(item => ({ idBase: item.id, type: item.type, label: item.label, icon: item.icon, spriteBase: item.spriteBase, color: item.color, required: item.required }))
        };
    }

    function restaurantMarkers() {
        return [
            marker('ai_entry', 'ai_entry', 5, 8, 'up', 'AI店員入室位置', '●', 'robot', '#00BCD4'),
            marker('ai_standby', 'ai_standby', 6, 8, 'left', 'AI店員待機位置', '●', 'robot', '#29B6F6'),
            marker('chef_entry', 'tutorial_master_entry', 4, 8, 'right', '料理人チュートリアル位置', '◆', 'chef', '#FF9800'),
            marker('customer_entry', 'customer_entry', 5, 9, 'up', 'お客様入口', '◇', '', '#EC407A'),
            marker('customer_wait', 'customer_wait', 7, 7, 'up', 'お客様待機位置', '□', '', '#F06292', false)
        ];
    }

    function restaurantFloor(id, width, includeEntrance) {
        const floor = makeFloor(id, width, 10, 'rmap_floor', 'rmap_wall', includeEntrance ? [4, 5, 6] : []);
        if (id === '1f') floor.markers = restaurantMarkers();
        return floor;
    }

    function restaurantStages() {
        const initial = restaurantFloor('1f', 12, true);
        const expanded = restaurantFloor('1f', 17, true);
        const lv10Main = clone(expanded);
        const lv10Upper = restaurantFloor('2f', 17, false);
        lv10Main.objects.push(restaurantStairs('stairs_up', 13, 1));
        lv10Upper.objects.push(restaurantStairs('stairs_down', 13, 1));
        const lv23Main = clone(lv10Main);
        const lv23Upper = clone(lv10Upper);
        const lv23Basement = restaurantFloor('b1f', 17, false);
        lv23Main.objects.push(restaurantStairs('stairs_down', 1, 6));
        lv23Basement.objects.push(restaurantStairs('stairs_up', 1, 6));
        return [
            { id: 'lv1', label: 'Lv1 初期マップ', floors: [initial] },
            { id: 'lv5', label: 'Lv5 1階拡張', floors: [expanded] },
            { id: 'lv10', label: 'Lv10 2階解放', floors: [lv10Main, lv10Upper] },
            { id: 'lv23', label: 'Lv23 地下解放', floors: [lv23Main, lv23Upper, lv23Basement] }
        ].map(stage => ({ id: stage.id, label: stage.label, template: { schemaVersion: SCHEMA_VERSION, facilityId: 'restaurant', stageId: stage.id, floors: stage.floors } }));
    }

    function restaurantDefinition() {
        const spriteLabels = {
            rfur_chair_down: '椅子（下向き）', rfur_chair_up: '椅子（上向き）', rfur_chair_left: '椅子（左向き）', rfur_chair_right: '椅子（右向き）',
            rfur_register_center: 'レジ', rkit_fridge: '冷蔵庫', rkit_oven: 'オーブン', rkit_stove_left: 'コンロ'
        };
        const objectKeys = Object.keys(window.SHOP_SPRITES || {}).filter(key => /^(?:rfur_|rkit_|rmap_stairs_)/.test(key));
        return {
            id: 'restaurant', label: 'レストラン', spriteRegistry: 'SHOP_SPRITES', stages: restaurantStages(),
            tilePalette: [
                { label: '床', code: cell('floor', 'rmap_floor') },
                { label: '厨房床', code: cell('floor', 'rmap_kitchen_floor') },
                { label: '壁', code: cell('wall', 'rmap_wall') },
                { label: '入口', code: cell('entrance', 'rmap_floor') }
            ],
            objectPalette: objectKeys.map(key => ({ type: key, label: spriteLabels[key] || key, spriteKey: key })),
            markerPalette: restaurantMarkers().map(item => ({ idBase: item.id, type: item.type, label: item.label, icon: item.icon, spriteBase: item.spriteBase, color: item.color, required: item.required }))
        };
    }

    function blacksmithMainFloor(width = 12) {
        const floor = makeFloor('1f', width, 10, 'bmap_floor', 'bmap_wall', [4, 5, 6]);
        floor.objects = [];
        floor.expansionZones = width >= 17 ? [{ id: 'level5', level: 5, x: 11, y: 1, width: 5, height: 8, addedFloorTiles: 40 }] : [];
        floor.markers = [
            marker('ai_entry', 'ai_entry', 6, 9, 'up', 'AI店員入室位置', '●', 'robot', '#00BCD4'),
            marker('master_entry', 'tutorial_master_entry', 4, 9, 'up', '鍛冶師入室位置', '◆', 'smith', '#FF9800'),
            marker('ai_anvil_wait', 'ai_standby', 6, 1, 'down', '金床後方のAI待機位置', '●', 'robot', '#29B6F6'),
            marker('customer_entry', 'customer_entry', 5, 9, 'up', 'お客様入口', '◇', '', '#EC407A'),
            marker('customer_queue_1', 'customer_queue', 6, 3, 'up', 'お客様の列 1番（会計）', '1', '', '#F06292'),
            marker('customer_queue_2', 'customer_queue', 6, 4, 'up', 'お客様の列 2番', '2', '', '#F06292'),
            marker('customer_queue_3', 'customer_queue', 6, 5, 'up', 'お客様の列 3番', '3', '', '#F06292'),
            marker('customer_queue_4', 'customer_queue', 6, 6, 'up', 'お客様の列 4番', '4', '', '#F06292'),
            marker('customer_queue_5', 'customer_queue', 6, 7, 'up', 'お客様の列 5番', '5', '', '#F06292'),
            marker('customer_queue_6', 'customer_queue', 6, 8, 'up', 'お客様の列 6番', '6', '', '#F06292')
        ];
        return floor;
    }

    function blacksmithExtraFloor(id) {
        return makeFloor(id, 10, 8, 'bmap_floor', 'bmap_wall', []);
    }

    function blacksmithStages() {
        const lv1 = blacksmithMainFloor();
        const lv5 = blacksmithMainFloor(17);
        const lv10Main = clone(lv5);
        const lv10Upper = blacksmithExtraFloor('2f');
        lv10Main.objects.push(blacksmithStairs('stairs_up_2f', 'stairs_up', 10, 4, '2f'));
        lv10Upper.objects.push(blacksmithStairs('stairs_2f', 'stairs_down', 5, 4, '1f'));
        const lv23Main = clone(lv10Main);
        const lv23Upper = clone(lv10Upper);
        const lv23Basement = blacksmithExtraFloor('b1f');
        lv23Main.objects.push(blacksmithStairs('stairs_down_b1f', 'stairs_down', 13, 6, 'b1f'));
        lv23Basement.objects.push(blacksmithStairs('stairs_b1f', 'stairs_up', 5, 2, '1f'));
        return [
            { id: 'lv1', label: 'Lv1 初期マップ', floors: [lv1] },
            { id: 'lv5', label: 'Lv5 1階拡張', floors: [lv5] },
            { id: 'lv10', label: 'Lv10 2階解放', floors: [lv10Main, lv10Upper] },
            { id: 'lv23', label: 'Lv23 地下解放', floors: [lv23Main, lv23Upper, lv23Basement] }
        ].map(stage => ({ id: stage.id, label: stage.label, template: { schemaVersion: SCHEMA_VERSION, facilityId: 'blacksmith', stageId: stage.id, floors: stage.floors } }));
    }

    function blacksmithDefinition() {
        const baseMarkers = blacksmithMainFloor().markers;
        return {
            id: 'blacksmith', label: '鍛冶屋', spriteRegistry: 'BLACKSMITH_SPRITES', stages: blacksmithStages(),
            tilePalette: [
                { label: '標準石床', code: cell('floor', 'bmap_floor_standard_a') },
                { label: '標準石壁', code: cell('wall', 'bmap_wall_standard_a') },
                { label: '標準木床', code: cell('floor', 'bmap_floor_standard_b') },
                { label: '標準木壁', code: cell('wall', 'bmap_wall_standard_b') },
                { label: '高級木床', code: cell('floor', 'bmap_floor_luxury_a') },
                { label: '高級木壁', code: cell('wall', 'bmap_wall_luxury_a') },
                { label: '高級黒床', code: cell('floor', 'bmap_floor_luxury_b') },
                { label: '高級黒壁', code: cell('wall', 'bmap_wall_luxury_b') },
                { label: '入口', code: cell('entrance', 'bmap_floor_standard_a') }
            ],
            objectPalette: [
                { type: 'material', label: '素材置き場', spriteKey: 'bwork_material' },
                { type: 'material_large', label: '大型素材庫', spriteKey: 'bwork_material_large' },
                { type: 'furnace', label: '炉', spriteKey: 'bwork_furnace' },
                { type: 'magic_furnace', label: '魔力炉', spriteKey: 'bwork_magic_furnace' },
                { type: 'anvil', label: '金床', spriteKey: 'bwork_anvil' },
                { type: 'master_anvil', label: '名工の金床', spriteKey: 'bwork_master_anvil' },
                { type: 'cooling', label: '冷却・水場', spriteKey: 'bwork_cooling' },
                { type: 'precision_tools', label: '精密工具台', spriteKey: 'bwork_precision_tools' },
                { type: 'armor_finishing', label: '防具仕上げ台', spriteKey: 'bwork_armor_finishing' },
                { type: 'shelf_weapon', label: '武器商品棚', spriteKey: 'bshelf_weapon' },
                { type: 'shelf_goods', label: '雑貨商品棚', spriteKey: 'bshelf_goods' },
                { type: 'shelf_armor', label: '防具商品棚', spriteKey: 'bshelf_armor' },
                { type: 'shelf_royal', label: '王室展示棚', spriteKey: 'bshelf_royal' },
                blacksmithStairPalette('stairs_up'),
                blacksmithStairPalette('stairs_down')
            ],
            markerPalette: baseMarkers.map(item => ({ idBase: item.id, type: item.type, label: item.label, icon: item.icon, spriteBase: item.spriteBase, color: item.color, required: item.required }))
        };
    }

    const CASTLE_ROOMS = [
        ['prayer', 'throne', 'laboratory'],
        ['operations', 'guardroom', 'auction']
    ];
    const CASTLE_ROOM_META = {
        prayer: { label: '祈祷室', floor: 'castle_prayer_floor', wall: 'castle_prayer_wall', feature: 'castle_prayer_feature' },
        throne: { label: '玉座の間', floor: 'castle_throne_floor', wall: 'castle_throne_wall', feature: 'castle_throne_feature' },
        laboratory: { label: '研究室', floor: 'castle_laboratory_floor', wall: 'castle_laboratory_wall', feature: 'castle_laboratory_feature' },
        operations: { label: '作戦会議室', floor: 'castle_operations_floor', wall: 'castle_operations_wall', feature: 'castle_operations_feature' },
        guardroom: { label: '詰所', floor: 'castle_guardroom_floor', wall: 'castle_guardroom_wall', feature: 'castle_guardroom_feature' },
        auction: { label: '競売所', floor: 'castle_auction_floor', wall: 'castle_auction_wall', feature: 'castle_auction_feature' }
    };

    function castleRoomId(x, y) {
        return CASTLE_ROOMS[Math.max(0, Math.min(1, Math.floor(y / 10)))][Math.max(0, Math.min(2, Math.floor(x / 14)))];
    }

    function castleFloor() {
        const width = 42;
        const height = 20;
        const floor = { id: '1f', width, height, cells: [], objects: [], markers: [] };
        for (let y = 0; y < height; y += 1) {
            const row = [];
            for (let x = 0; x < width; x += 1) {
                const roomId = castleRoomId(x, y);
                const room = CASTLE_ROOM_META[roomId];
                const entrance = y === height - 1 && x >= 20 && x <= 22;
                const verticalWall = [13, 14, 27, 28].includes(x) && !((y >= 3 && y <= 6) || (y >= 13 && y <= 16));
                const localX = x % 14;
                const horizontalWall = [9, 10].includes(y) && !(localX >= 5 && localX <= 8);
                const outerWall = (x === 0 || x === width - 1 || y === 0 || y === height - 1) && !entrance;
                row.push(cell(entrance ? 'entrance' : (outerWall || verticalWall || horizontalWall) ? 'wall' : 'floor',
                    (outerWall || verticalWall || horizontalWall) ? room.wall : room.floor));
            }
            floor.cells.push(row);
        }
        CASTLE_ROOMS.forEach((row, roomY) => row.forEach((roomId, roomX) => {
            const room = CASTLE_ROOM_META[roomId];
            floor.objects.push(object(`${roomId}_feature`, `${roomId}_feature`, room.feature, roomX * 14 + 4, roomY * 10 + 1, `${room.label}の室内装飾`, { w: 6, h: 2 }));
        }));
        floor.markers = [
            marker('player_entry', 'player_entry', 21, 18, 'up', 'AI入城位置', '●', 'robot', '#00BCD4'),
            marker('fortune_teller', 'castle_npc', 7, 4, 'down', '占い師', '◆', 'fortune_teller', '#C9A7FF'),
            marker('king', 'castle_npc', 21, 4, 'down', '王様', '◆', 'king', '#FFD45F'),
            marker('scientist', 'castle_npc', 35, 4, 'down', '科学者', '◆', 'scientist', '#74E0D0'),
            marker('captain', 'castle_npc', 7, 14, 'down', '隊長', '◆', 'captain', '#7EB4FF'),
            marker('soldier', 'castle_npc', 21, 14, 'down', '兵士', '◆', 'soldier', '#FF8178'),
            marker('salesperson', 'castle_npc', 35, 14, 'down', '販売員', '◆', 'merchant', '#FFD36B')
        ];
        return floor;
    }

    function castleDefinition() {
        const floor = castleFloor();
        const tilePalette = [];
        Object.values(CASTLE_ROOM_META).forEach(room => {
            tilePalette.push({ label: `${room.label}の床`, code: cell('floor', room.floor) });
            tilePalette.push({ label: `${room.label}の壁`, code: cell('wall', room.wall) });
        });
        tilePalette.push({ label: '入口', code: cell('entrance', 'castle_guardroom_floor') });
        return {
            id: 'castle', label: '城', spriteRegistry: 'CASTLE_SPRITES',
            stages: [{ id: 'initial', label: '初期マップ', template: { schemaVersion: SCHEMA_VERSION, facilityId: 'castle', stageId: 'initial', floors: [floor] } }],
            tilePalette,
            objectPalette: Object.entries(CASTLE_ROOM_META).map(([roomId, room]) => ({ type: `${roomId}_feature`, label: `${room.label}の室内装飾`, spriteKey: room.feature, w: 6, h: 2 })),
            markerPalette: floor.markers.map(item => ({ idBase: item.id, type: item.type, label: item.label, icon: item.icon, spriteBase: item.spriteBase, color: item.color, required: item.required, multiple: item.type === 'castle_npc' }))
        };
    }

    function casinoDefinition() {
        const floor = makeFloor('1f', 14, 10, 'cmap_floor', 'cmap_wall', [6, 7]);
        floor.objects = [
            object('poker_table', 'poker_table', '', 5, 2, 'ポーカーテーブル', { w: 3, spriteKeys: ['cfur_poker_table_left', 'cfur_poker_table_middle', 'cfur_poker_table_right'] }),
            object('tcg_table', 'tcg_table', '', 10, 4, 'TCGテーブル', { w: 2, spriteKeys: ['cfur_tcg_table_left', 'cfur_tcg_table_right'] }),
            object('poker_chair', 'casino_chair', 'cfur_chair_up', 6, 3, 'ポーカー席', { dir: 'up' }),
            object('tcg_chair', 'casino_chair', 'cfur_chair_side', 9, 4, 'TCG席', { dir: 'right' })
        ];
        floor.markers = [
            marker('player_entry', 'player_entry', 6, 8, 'up', 'AI入場位置', '●', 'robot', '#00BCD4'),
            marker('dealer_wait', 'dealer_wait', 6, 1, 'down', 'ディーラー待機位置', '◆', 'dealer', '#FFD65C'),
            marker('visitor_seat_1', 'visitor_seat', 4, 3, 'up', '来客候補位置', '◇', '', '#AB47BC', false),
            marker('visitor_seat_2', 'visitor_seat', 8, 3, 'up', '来客候補位置', '◇', '', '#AB47BC', false),
            marker('visitor_seat_3', 'visitor_seat', 12, 4, 'left', '来客候補位置', '◇', '', '#AB47BC', false),
            marker('visitor_seat_4', 'visitor_seat', 3, 5, 'right', '来客候補位置', '◇', '', '#AB47BC', false),
            marker('visitor_seat_5', 'visitor_seat', 10, 7, 'up', '来客候補位置', '◇', '', '#AB47BC', false),
            marker('visitor_seat_6', 'visitor_seat', 4, 7, 'up', '来客候補位置', '◇', '', '#AB47BC', false)
        ];
        return {
            id: 'casino', label: 'カジノ', spriteRegistry: 'CASINO_SPRITES',
            stages: [{ id: 'initial', label: '初期マップ', template: { schemaVersion: SCHEMA_VERSION, facilityId: 'casino', stageId: 'initial', floors: [floor] } }],
            tilePalette: [
                { label: '床', code: cell('floor', 'cmap_floor') },
                { label: '壁', code: cell('wall', 'cmap_wall') },
                { label: '入口', code: cell('entrance', 'cmap_floor') }
            ],
            objectPalette: [
                { type: 'poker_table', label: 'ポーカーテーブル', spriteKeys: ['cfur_poker_table_left', 'cfur_poker_table_middle', 'cfur_poker_table_right'], w: 3 },
                { type: 'tcg_table', label: 'TCGテーブル', spriteKeys: ['cfur_tcg_table_left', 'cfur_tcg_table_right'], w: 2 },
                { type: 'casino_chair', label: 'カジノの椅子', spriteKey: 'cfur_chair_up' },
                { type: 'slot_machine', label: 'スロット台', spriteKey: 'cfur_slot_machine' }
            ],
            markerPalette: floor.markers.filter((item, index) => index < 3).map(item => ({ idBase: item.id, type: item.type, label: item.label, icon: item.icon, spriteBase: item.spriteBase, color: item.color, required: item.required, multiple: item.type === 'visitor_seat' }))
        };
    }

    function buildFacilityDefinitions() {
        return [myHomeDefinition(), restaurantDefinition(), blacksmithDefinition(), castleDefinition(), casinoDefinition()];
    }

    function getFacility() {
        return state.facilities.find(item => item.id === state.facilityId) || state.facilities[0];
    }

    function getStage(facility = getFacility()) {
        return facility && (facility.stages.find(item => item.id === state.stageId) || facility.stages[0]);
    }

    function getFloor() {
        return state.template && (state.template.floors.find(item => item.id === state.floorId) || state.template.floors[0]);
    }

    function readDrafts() {
        try {
            const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
            return value && typeof value === 'object' ? value : {};
        } catch (error) {
            return {};
        }
    }

    function writeDrafts(value) {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
            return true;
        } catch (error) {
            state.message = 'ローカル下書きを保存できませんでした。';
            return false;
        }
    }

    function templateFor(facilityId, stageId) {
        const facility = state.facilities.find(item => item.id === facilityId);
        const stage = facility && facility.stages.find(item => item.id === stageId);
        if (!stage) return null;
        const drafts = readDrafts();
        const saved = drafts.templates && drafts.templates[facilityId] && drafts.templates[facilityId][stageId];
        const template = clone(saved || stage.template);
        template.schemaVersion = SCHEMA_VERSION;
        template.facilityId = facilityId;
        template.stageId = stageId;
        return template;
    }

    function saveCurrentDraft() {
        if (!state.template) return;
        const drafts = readDrafts();
        if (!drafts.templates) drafts.templates = {};
        if (!drafts.templates[state.facilityId]) drafts.templates[state.facilityId] = {};
        drafts.schemaVersion = SCHEMA_VERSION;
        drafts.templates[state.facilityId][state.stageId] = clone(state.template);
        writeDrafts(drafts);
    }

    function loadSelection(facilityId, stageId, floorId) {
        state.facilityId = facilityId || state.facilityId;
        const facility = getFacility();
        state.stageId = facility.stages.some(item => item.id === stageId) ? stageId : facility.stages[0].id;
        state.template = templateFor(facility.id, state.stageId);
        const floor = state.template && (state.template.floors.find(item => item.id === floorId) || state.template.floors[0]);
        state.floorId = floor ? floor.id : '';
        state.selected = null;
        state.tool = { kind: 'select' };
        state.undo = [];
        state.redo = [];
        state.message = '';
    }

    function snapshot() {
        return clone(state.template);
    }

    function mutate(mutator, message) {
        state.undo.push(snapshot());
        if (state.undo.length > 80) state.undo.shift();
        state.redo = [];
        mutator();
        state.message = message || '配置を変更しました。';
        saveCurrentDraft();
        render();
    }

    function undo() {
        if (!state.undo.length) return;
        state.redo.push(snapshot());
        state.template = state.undo.pop();
        state.selected = null;
        saveCurrentDraft();
        state.message = '元に戻しました。';
        render();
    }

    function redo() {
        if (!state.redo.length) return;
        state.undo.push(snapshot());
        state.template = state.redo.pop();
        state.selected = null;
        saveCurrentDraft();
        state.message = 'やり直しました。';
        render();
    }

    function showFacilityEditorConfirm(message, onConfirm) {
        document.getElementById('fte-game-confirm')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'fte-game-confirm';
        overlay.className = 'fte-confirm-backdrop';
        overlay.innerHTML = `<section class="fte-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="fte-confirm-title">
            <header><h2 id="fte-confirm-title">⚠️ 最終確認</h2></header>
            <p>${escapeHtml(message)}</p>
            <footer><button type="button" data-action="cancel">キャンセル</button><button type="button" class="danger" data-action="confirm">確認</button></footer>
        </section>`;
        const close = () => {
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
        };
        const onKeyDown = event => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            close();
        };
        overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
        overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
            close();
            onConfirm();
        });
        overlay.addEventListener('click', event => {
            if (event.target === overlay) close();
        });
        document.addEventListener('keydown', onKeyDown);
        document.body.appendChild(overlay);
        overlay.querySelector('[data-action="cancel"]').focus();
    }

    function resetStage() {
        const stage = getStage();
        if (!stage) return;
        showFacilityEditorConfirm('選択中の段階を制作者初期配置へ戻しますか？', () => {
            mutate(() => {
                state.template = clone(stage.template);
                state.floorId = state.template.floors[0].id;
                state.selected = null;
            }, '選択中の段階を初期配置へ戻しました。');
        });
    }

    function clearAllDrafts() {
        showFacilityEditorConfirm('施設初期マップのローカル下書きをすべて削除しますか？', () => {
            localStorage.removeItem(DRAFT_KEY);
            loadSelection(state.facilityId, state.stageId, state.floorId);
            state.message = 'すべてのローカル下書きを削除しました。';
            render();
        });
    }

    function occupiedCells(entity) {
        if (Array.isArray(entity.parts) && entity.parts.length) return entity.parts.map(part => ({ x: entity.x + part.dx, y: entity.y + part.dy }));
        const width = Math.max(1, Number(entity.w) || 1);
        const height = Math.max(1, Number(entity.h) || 1);
        const cells = [];
        for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) cells.push({ x: entity.x + x, y: entity.y + y });
        return cells;
    }

    function validateTemplate(template) {
        const errors = [];
        if (!template || !Array.isArray(template.floors) || !template.floors.length) return ['フロアがありません。'];
        template.floors.forEach(floor => {
            if (!floor || !Number.isInteger(floor.width) || !Number.isInteger(floor.height) || floor.width < 1 || floor.height < 1) {
                errors.push('フロアの大きさが不正です。');
                return;
            }
            if (!Array.isArray(floor.cells) || floor.cells.length !== floor.height || floor.cells.some(row => !Array.isArray(row) || row.length !== floor.width)) {
                errors.push(`${floor.id}: タイル配列の大きさが一致しません。`);
                return;
            }
            const entrances = [];
            floor.cells.forEach((row, y) => row.forEach((value, x) => {
                if (parseCell(value).kind === 'entrance') entrances.push({ x, y });
            }));
            if (floor.id === '1f' && !entrances.length) errors.push(`${floor.id}: 入口がありません。`);
            const entities = [...(floor.objects || []), ...(floor.markers || [])];
            entities.forEach(entity => {
                occupiedCells(entity).forEach(pos => {
                    if (pos.x < 0 || pos.y < 0 || pos.x >= floor.width || pos.y >= floor.height) errors.push(`${floor.id}: ${entity.id} がマップ外です。`);
                });
            });
            if (template.facilityId === 'blacksmith' && floor.id === '1f') {
                const queueMarkers = (floor.markers || []).filter(item => item.type === 'customer_queue').sort((a, b) => String(a.id).localeCompare(String(b.id), 'ja', { numeric: true }));
                if (!queueMarkers.length) errors.push('1f: お客様の列を1か所以上登録してください。');
                const occupiedQueue = new Set();
                queueMarkers.forEach((item, index) => {
                    const key = `${item.x},${item.y}`;
                    if (occupiedQueue.has(key)) errors.push(`1f: お客様の列 ${index + 1}番が別の列と重なっています。`);
                    occupiedQueue.add(key);
                });
                const standby = (floor.markers || []).find(item => item.type === 'ai_standby');
                if (standby && occupiedQueue.has(`${standby.x},${standby.y}`)) errors.push('1f: AI待機位置とお客様の列が重なっています。');
            }
            const start = entrances[0];
            if (start) {
                const reachable = new Set([`${start.x},${start.y}`]);
                const queue = [start];
                while (queue.length) {
                    const current = queue.shift();
                    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                        const x = current.x + dx;
                        const y = current.y + dy;
                        const key = `${x},${y}`;
                        if (x < 0 || y < 0 || x >= floor.width || y >= floor.height || reachable.has(key)) return;
                        if (parseCell(floor.cells[y][x]).kind === 'wall') return;
                        reachable.add(key);
                        queue.push({ x, y });
                    });
                }
                (floor.markers || []).filter(item => item.required !== false).forEach(item => {
                    if (!reachable.has(`${item.x},${item.y}`)) errors.push(`${floor.id}: ${item.id} へ入口から到達できません。`);
                });
            }
        });
        return [...new Set(errors)];
    }

    function getSpriteDefinition(spriteKey) {
        if (!spriteKey) return null;
        const registries = [window.MYHOME_SPRITES, window.SHOP_SPRITES, window.BLACKSMITH_SPRITES, window.CASTLE_SPRITES, window.CASINO_SPRITES, window.DUNGEON_SPRITES];
        for (const registry of registries) if (registry && registry[spriteKey]) return registry[spriteKey];
        return null;
    }

    function spriteImageLayout(sprite, width, height, mode = 'object') {
        if (!sprite) return null;
        const sourceW = Number(sprite.sourceW || sprite.iw || sprite.imageW || 2816);
        const sourceH = Number(sprite.sourceH || sprite.ih || sprite.imageH || 1536);
        const sw = Math.max(1, Number(sprite.sw) || 64);
        const sh = Math.max(1, Number(sprite.sh) || 64);
        const sx = Number(sprite.sx) || 0;
        const sy = Number(sprite.sy) || 0;
        const spriteScale = Number(sprite.scale) || 1;
        let scaleX;
        let scaleY;
        if (mode === 'tile' || sprite.tileFill === true) {
            scaleX = width / sw * spriteScale;
            scaleY = height / sh * spriteScale;
        } else {
            const fit = mode === 'preview' ? Math.min(width / sw, height / sh) : width / sw;
            scaleX = fit * spriteScale;
            scaleY = scaleX;
        }
        const cropW = sw * scaleX;
        const cropH = sh * scaleY;
        return {
            sourceW,
            sourceH,
            sx,
            sy,
            scaleX,
            scaleY,
            cropW,
            cropH,
            left: (width - cropW) / 2,
            top: mode === 'tile' ? (height - cropH) / 2 : height - cropH
        };
    }

    function spriteImageHtml(spriteKey, width, height, mode = 'object') {
        const sprite = getSpriteDefinition(spriteKey);
        if (!sprite || !(sprite.img || sprite.image)) return '';
        const layout = spriteImageLayout(sprite, width, height, mode);
        const image = sprite.img || sprite.image;
        return `<span class="fte-sprite-crop" style="position:absolute;left:${layout.left}px;top:${layout.top}px;width:${layout.cropW}px;height:${layout.cropH}px;overflow:hidden;pointer-events:none"><img src="${escapeHtml(image)}" alt="" draggable="false" style="position:absolute;left:${-layout.sx * layout.scaleX}px;top:${-layout.sy * layout.scaleY}px;width:${layout.sourceW * layout.scaleX}px;height:${layout.sourceH * layout.scaleY}px;max-width:none;pointer-events:none;user-select:none;"></span>`;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function ensureEditorDom() {
        if (!document.getElementById('facility-template-editor-style')) {
            const style = document.createElement('style');
            style.id = 'facility-template-editor-style';
            style.textContent = `
                #facility-template-editor{position:fixed;inset:0;z-index:180000;background:#090b0f;color:#fff;display:none;font-family:Arial,'Meiryo',sans-serif}
                #facility-template-editor *{box-sizing:border-box}
                .fte-shell{height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto}
                .fte-header{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;background:#1c2027;border-bottom:2px solid #00acc1}
                .fte-header h2{font-size:18px;margin:0 12px 0 0;color:#80deea}
                .fte-header select,.fte-header button,.fte-header input{background:#292f38;color:#fff;border:1px solid #65727e;border-radius:5px;padding:7px}
                .fte-header button{cursor:pointer;font-weight:bold}.fte-header button:hover{border-color:#80deea}
                .fte-body{min-height:0;display:grid;grid-template-columns:270px minmax(0,1fr) 300px}
                .fte-side{min-height:0;overflow:auto;padding:10px;background:#141820;border-right:1px solid #38434d}
                .fte-side.right{border-right:0;border-left:1px solid #38434d}
                .fte-section{margin-bottom:12px;padding:9px;border:1px solid #39434d;border-radius:7px;background:#1b2028}
                .fte-section h3{margin:0 0 8px;font-size:13px;color:#80deea}
                .fte-palette{display:grid;grid-template-columns:1fr 1fr;gap:6px}
                .fte-palette button{min-width:0;min-height:70px;padding:5px;background:#272e38;color:#fff;border:1px solid #505c68;border-radius:6px;cursor:pointer;font-size:10px;overflow:hidden}
                .fte-palette button.active{border:2px solid #ffca28;box-shadow:0 0 9px rgba(255,202,40,.5)}
                .fte-preview{position:relative;width:44px;height:44px;margin:0 auto 3px;overflow:hidden;background:#111;border-radius:4px}
                .fte-map-viewport{min-width:0;min-height:0;overflow:auto;background:#080a0e;padding:36px;overscroll-behavior:contain}
                .fte-map{position:relative;transform-origin:top left;box-shadow:0 0 0 3px #546e7a,0 12px 35px #000;background:#111}
                .fte-cell{position:absolute;padding:0;border:1px solid rgba(255,255,255,.13);overflow:hidden;background:#242a31;cursor:crosshair}
                .fte-cell:hover{outline:2px solid #ffeb3b;outline-offset:-2px;z-index:50!important}
                .fte-entity{position:absolute;border:2px solid transparent;background:transparent;padding:0;cursor:grab;overflow:visible}
                .fte-entity:hover,.fte-entity.selected{border-color:#ffca28;background:rgba(255,202,40,.12);box-shadow:0 0 10px rgba(255,202,40,.55)}
                .fte-marker{display:grid;place-items:center;border-radius:12px;background:rgba(5,8,12,.68);font-weight:900;text-shadow:0 2px 3px #000}
                .fte-marker-label{position:absolute;left:50%;top:-19px;transform:translateX(-50%);padding:2px 5px;border-radius:4px;background:#080b0f;color:#fff;font-size:9px;white-space:nowrap;border:1px solid currentColor}
                .fte-inspector-grid{display:grid;grid-template-columns:70px 1fr;gap:7px;align-items:center;font-size:12px}.fte-inspector-grid input,.fte-inspector-grid select{width:100%;background:#292f38;color:#fff;border:1px solid #65727e;padding:6px;border-radius:4px}
                .fte-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.fte-actions button{padding:8px;background:#37474f;color:#fff;border:1px solid #607d8b;border-radius:5px;cursor:pointer}
                .fte-validation{font-size:11px;line-height:1.5}.fte-validation.ok{color:#81c784}.fte-validation.bad{color:#ff8a80}
                .fte-footer{display:flex;align-items:center;gap:12px;padding:7px 12px;background:#1c2027;border-top:1px solid #455a64;font-size:11px;color:#b0bec5}.fte-footer strong{color:#fff}
                .fte-confirm-backdrop{position:fixed;inset:0;z-index:181000;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.78);backdrop-filter:blur(4px)}
                .fte-confirm-dialog{width:min(520px,calc(100vw - 32px));overflow:hidden;border:2px solid #ffb300;border-radius:16px;background:linear-gradient(145deg,#252b34,#12161c);box-shadow:0 22px 70px #000,0 0 25px rgba(255,179,0,.25)}
                .fte-confirm-dialog header{padding:18px 22px;border-bottom:1px solid #525b66;background:linear-gradient(90deg,rgba(255,179,0,.22),transparent)}
                .fte-confirm-dialog h2{margin:0;color:#ffd166;font-size:21px}.fte-confirm-dialog p{margin:0;padding:26px 22px;color:#f5f5f5;font-size:16px;line-height:1.8}
                .fte-confirm-dialog footer{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;background:#0d1116}.fte-confirm-dialog button{min-width:120px;padding:11px 18px;border:1px solid #74808c;border-radius:9px;background:linear-gradient(#45515d,#29313a);color:#fff;font-weight:900;cursor:pointer}.fte-confirm-dialog button:hover,.fte-confirm-dialog button:focus-visible{border-color:#80deea;transform:translateY(-1px);outline:none}.fte-confirm-dialog button.danger{border-color:#ff7043;background:linear-gradient(#b74335,#71251f)}
                @media(max-width:900px){.fte-body{grid-template-columns:220px minmax(0,1fr)}.fte-side.right{position:absolute;right:0;top:66px;bottom:32px;width:280px;z-index:40;box-shadow:-8px 0 18px #000}.fte-header h2{width:100%}}
            `;
            document.head.appendChild(style);
        }
        let modal = document.getElementById('facility-template-editor');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'facility-template-editor';
            modal.innerHTML = `
                <div class="fte-shell">
                    <header class="fte-header" id="fte-header"></header>
                    <div class="fte-body">
                        <aside class="fte-side" id="fte-palette"></aside>
                        <main class="fte-map-viewport" id="fte-map-viewport"><div class="fte-map" id="fte-map"></div></main>
                        <aside class="fte-side right" id="fte-inspector"></aside>
                    </div>
                    <footer class="fte-footer"><strong id="fte-message">準備完了</strong><span>通常セーブは変更しません。</span><span>Ctrl + Shift + E：選択中をF12へ出力</span></footer>
                </div>`;
            document.body.appendChild(modal);
        }
        return modal;
    }

    function palettePreview(entry, kind) {
        let spriteKey = entry.spriteKey || (entry.spriteKeys && entry.spriteKeys[0]) || '';
        if (kind === 'tile') spriteKey = parseCell(entry.code).spriteKey;
        const image = spriteKey ? spriteImageHtml(spriteKey, 44, 44, kind === 'tile' ? 'tile' : 'preview') : '';
        return `<div class="fte-preview">${image || `<span style="display:grid;place-items:center;width:100%;height:100%;font-size:22px;color:${entry.color || '#fff'}">${escapeHtml(entry.icon || '■')}</span>`}</div>`;
    }

    function renderHeader() {
        const header = document.getElementById('fte-header');
        const facility = getFacility();
        const stage = getStage(facility);
        const floor = getFloor();
        header.innerHTML = `
            <h2>🗺 施設初期マップ配置</h2>
            <label>施設 <select id="fte-facility">${state.facilities.map(item => `<option value="${item.id}" ${item.id === facility.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label>
            <label>解放段階 <select id="fte-stage">${facility.stages.map(item => `<option value="${item.id}" ${item.id === stage.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label>
            <label>階層 <select id="fte-floor">${state.template.floors.map(item => `<option value="${item.id}" ${item.id === floor.id ? 'selected' : ''}>${escapeHtml(item.id.toUpperCase())}</option>`).join('')}</select></label>
            <label>表示倍率 <input id="fte-zoom" type="range" min="0.5" max="1.6" step="0.1" value="${state.zoom}"></label>
            <button id="fte-undo" ${state.undo.length ? '' : 'disabled'}>↶ 元に戻す</button>
            <button id="fte-redo" ${state.redo.length ? '' : 'disabled'}>↷ やり直す</button>
            <button id="fte-reset">初期配置へ戻す</button>
            <button id="fte-close" style="margin-left:auto;background:#c62828">閉じる</button>`;
        document.getElementById('fte-facility').addEventListener('change', event => {
            saveCurrentDraft();
            const next = state.facilities.find(item => item.id === event.target.value) || state.facilities[0];
            loadSelection(next.id, next.stages[0].id, next.stages[0].template.floors[0].id);
            render();
        });
        document.getElementById('fte-stage').addEventListener('change', event => { loadSelection(facility.id, event.target.value, null); render(); });
        document.getElementById('fte-floor').addEventListener('change', event => { state.floorId = event.target.value; state.selected = null; render(); });
        document.getElementById('fte-zoom').addEventListener('input', event => {
            state.zoom = Number(event.target.value) || 1;
            applyMapZoom();
        });
        document.getElementById('fte-undo').addEventListener('click', undo);
        document.getElementById('fte-redo').addEventListener('click', redo);
        document.getElementById('fte-reset').addEventListener('click', resetStage);
        document.getElementById('fte-close').addEventListener('click', closeEditor);
    }

    function renderPalette() {
        const host = document.getElementById('fte-palette');
        const facility = getFacility();
        const tileButtons = facility.tilePalette.map((entry, index) => `<button data-tool-kind="tile" data-tool-index="${index}" class="${state.tool.kind === 'tile' && state.tool.index === index ? 'active' : ''}">${palettePreview(entry, 'tile')}<span>${escapeHtml(entry.label)}</span></button>`).join('');
        const objectButtons = facility.objectPalette.map((entry, index) => `<button data-tool-kind="object" data-tool-index="${index}" class="${state.tool.kind === 'object' && state.tool.index === index ? 'active' : ''}">${palettePreview(entry, 'object')}<span>${escapeHtml(entry.label)}</span></button>`).join('');
        const markerButtons = facility.markerPalette.map((entry, index) => `<button data-tool-kind="marker" data-tool-index="${index}" class="${state.tool.kind === 'marker' && state.tool.index === index ? 'active' : ''}">${palettePreview(entry, 'marker')}<span>${escapeHtml(entry.label)}</span></button>`).join('');
        host.innerHTML = `
            <div class="fte-section"><h3>編集ツール</h3><button data-tool-kind="select" style="width:100%;padding:9px;background:${state.tool.kind === 'select' ? '#006064' : '#37474f'};color:white;border:1px solid #607d8b;border-radius:5px;cursor:pointer">選択・移動</button></div>
            <div class="fte-section"><h3>床・壁・入口</h3><div class="fte-palette">${tileButtons}</div></div>
            <div class="fte-section"><h3>設備・マップチップ</h3><div class="fte-palette">${objectButtons}</div></div>
            <div class="fte-section"><h3>キャラクター・基準位置</h3><div class="fte-palette">${markerButtons}</div></div>`;
        host.querySelectorAll('[data-tool-kind]').forEach(button => button.addEventListener('click', () => {
            state.tool = { kind: button.dataset.toolKind, index: Number(button.dataset.toolIndex) || 0 };
            state.selected = null;
            state.message = state.tool.kind === 'select' ? '移動する対象を選択してください。' : '配置先のマスを選択してください。';
            render();
        }));
    }

    function renderObjectParts(entity, width, height) {
        if (Array.isArray(entity.parts) && entity.parts.length) {
            return entity.parts.map(part => `<span style="position:absolute;left:${part.dx * TILE_SIZE}px;top:${part.dy * TILE_SIZE}px;width:${TILE_SIZE}px;height:${TILE_SIZE}px;overflow:hidden">${spriteImageHtml(part.spriteKey, TILE_SIZE, TILE_SIZE)}</span>`).join('');
        }
        if (Array.isArray(entity.spriteKeys) && entity.spriteKeys.length) {
            return entity.spriteKeys.map((key, index) => `<span style="position:absolute;left:${index * TILE_SIZE}px;top:0;width:${TILE_SIZE}px;height:${height}px;overflow:hidden">${spriteImageHtml(key, TILE_SIZE, height)}</span>`).join('');
        }
        if (entity.spriteKey) return spriteImageHtml(entity.spriteKey, width, height);
        return `<span style="display:grid;place-items:center;width:100%;height:100%;font-size:22px">${escapeHtml(entity.icon || '■')}</span>`;
    }

    function applyMapZoom() {
        const map = document.getElementById('fte-map');
        const floor = getFloor();
        if (!map || !floor) return;
        map.style.transform = `scale(${state.zoom})`;
        map.style.marginRight = `${Math.max(0, floor.width * TILE_SIZE * (state.zoom - 1))}px`;
        map.style.marginBottom = `${Math.max(0, floor.height * TILE_SIZE * (state.zoom - 1))}px`;
    }

    function markerSpriteKey(entity) {
        if (!entity.spriteBase) return '';
        const directional = `${entity.spriteBase}_${entity.dir || 'down'}`;
        return getSpriteDefinition(directional) ? directional : entity.spriteBase;
    }

    function renderMap() {
        const floor = getFloor();
        const map = document.getElementById('fte-map');
        if (!floor) {
            map.innerHTML = '';
            return;
        }
        map.style.width = `${floor.width * TILE_SIZE}px`;
        map.style.height = `${floor.height * TILE_SIZE}px`;
        applyMapZoom();
        const cells = [];
        floor.cells.forEach((row, y) => row.forEach((value, x) => {
            const parsed = parseCell(value);
            const accent = parsed.kind === 'wall' ? '#455a64' : parsed.kind === 'entrance' ? '#00bcd4' : 'transparent';
            cells.push(`<button class="fte-cell" data-fte-cell="1" data-x="${x}" data-y="${y}" title="${x}, ${y} / ${escapeHtml(parsed.spriteKey)}" style="left:${x * TILE_SIZE}px;top:${y * TILE_SIZE}px;width:${TILE_SIZE}px;height:${TILE_SIZE}px;z-index:${parsed.kind === 'wall' ? 3 : 1};box-shadow:inset 0 0 0 2px ${accent}">${spriteImageHtml(parsed.spriteKey, TILE_SIZE, TILE_SIZE, 'tile')}</button>`);
        }));
        const objects = (floor.objects || []).map(entity => {
            const width = Math.max(1, Number(entity.w) || 1) * TILE_SIZE;
            const height = Math.max(1, Number(entity.h) || 1) * TILE_SIZE;
            const selected = state.selected && state.selected.kind === 'object' && state.selected.id === entity.id;
            return `<button class="fte-entity ${selected ? 'selected' : ''}" draggable="true" data-entity-kind="object" data-entity-id="${escapeHtml(entity.id)}" title="${escapeHtml(entity.label || entity.id)}" style="left:${entity.x * TILE_SIZE}px;top:${entity.y * TILE_SIZE}px;width:${width}px;height:${height}px;z-index:${100 + entity.y * 10 + (Number(entity.z) || 0)}">${renderObjectParts(entity, width, height)}</button>`;
        }).join('');
        const markers = (floor.markers || []).map(entity => {
            const selected = state.selected && state.selected.kind === 'marker' && state.selected.id === entity.id;
            const spriteKey = markerSpriteKey(entity);
            const content = spriteKey ? spriteImageHtml(spriteKey, TILE_SIZE, TILE_SIZE, 'preview') : escapeHtml(entity.icon || '●');
            return `<button class="fte-entity fte-marker ${selected ? 'selected' : ''}" draggable="true" data-entity-kind="marker" data-entity-id="${escapeHtml(entity.id)}" title="${escapeHtml(entity.label || entity.id)}" style="left:${entity.x * TILE_SIZE + 4}px;top:${entity.y * TILE_SIZE + 4}px;width:${TILE_SIZE - 8}px;height:${TILE_SIZE - 8}px;z-index:${500 + entity.y * 10};color:${entity.color || '#fff'};border-color:${entity.color || '#fff'}"><span class="fte-marker-label">${escapeHtml(entity.label || entity.id)}</span>${content}</button>`;
        }).join('');
        map.innerHTML = cells.join('') + objects + markers;
        map.querySelectorAll('[data-fte-cell]').forEach(button => {
            button.addEventListener('click', () => handleCell(Number(button.dataset.x), Number(button.dataset.y)));
            button.addEventListener('dragover', event => event.preventDefault());
            button.addEventListener('drop', event => {
                event.preventDefault();
                event.stopPropagation();
                moveSelectedTo(Number(button.dataset.x), Number(button.dataset.y));
            });
        });
        map.addEventListener('dragover', event => event.preventDefault());
        map.addEventListener('drop', event => {
            event.preventDefault();
            const rect = map.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / (TILE_SIZE * state.zoom));
            const y = Math.floor((event.clientY - rect.top) / (TILE_SIZE * state.zoom));
            moveSelectedTo(x, y);
        });
        map.querySelectorAll('[data-entity-kind]').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                state.selected = { kind: button.dataset.entityKind, id: button.dataset.entityId };
                state.tool = { kind: 'select' };
                state.message = '移動先のマスを選択するか、ドラッグしてください。';
                render();
            });
            button.addEventListener('dragstart', event => {
                state.selected = { kind: button.dataset.entityKind, id: button.dataset.entityId };
                state.tool = { kind: 'select' };
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', button.dataset.entityId);
            });
        });
    }

    function uniqueEntityId(type, items) {
        let index = 1;
        let id = type;
        const used = new Set(items.map(item => item.id));
        while (used.has(id)) id = `${type}_${index++}`;
        return id;
    }

    function handleCell(x, y) {
        const floor = getFloor();
        const facility = getFacility();
        if (state.tool.kind === 'tile') {
            const palette = facility.tilePalette[state.tool.index];
            if (!palette) return;
            mutate(() => { floor.cells[y][x] = palette.code; }, `${x}, ${y} のタイルを変更しました。`);
            return;
        }
        if (state.tool.kind === 'object') {
            const palette = facility.objectPalette[state.tool.index];
            if (!palette) return;
            mutate(() => {
                const id = uniqueEntityId(palette.type, floor.objects || (floor.objects = []));
                const entity = object(id, palette.type, palette.spriteKey || '', x, y, palette.label, palette);
                delete entity.multiple;
                floor.objects.push(entity);
                state.selected = { kind: 'object', id };
                state.tool = { kind: 'select' };
            }, '設備を配置しました。');
            return;
        }
        if (state.tool.kind === 'marker') {
            const palette = facility.markerPalette[state.tool.index];
            if (!palette) return;
            mutate(() => {
                const id = uniqueEntityId(palette.idBase || palette.type, floor.markers || (floor.markers = []));
                floor.markers.push(marker(id, palette.type, x, y, 'down', palette.label, palette.icon, palette.spriteBase, palette.color, palette.required));
                state.selected = { kind: 'marker', id };
                state.tool = { kind: 'select' };
            }, 'キャラクター基準位置を配置しました。');
            return;
        }
        if (state.selected) moveSelectedTo(x, y);
        else {
            state.message = `${x}, ${y} を選択しました。`;
            render();
        }
    }

    function selectedEntity() {
        const floor = getFloor();
        if (!floor || !state.selected) return null;
        const list = state.selected.kind === 'marker' ? floor.markers : floor.objects;
        return (list || []).find(item => item.id === state.selected.id) || null;
    }

    function moveSelectedTo(x, y) {
        const entity = selectedEntity();
        if (!entity) return;
        const floor = getFloor();
        const maxX = Math.max(0, floor.width - Math.max(1, Number(entity.w) || 1));
        const maxY = Math.max(0, floor.height - Math.max(1, Number(entity.h) || 1));
        mutate(() => {
            entity.x = Math.max(0, Math.min(maxX, x));
            entity.y = Math.max(0, Math.min(maxY, y));
        }, `${entity.id} を移動しました。`);
    }

    function updateSelectedField(field, value) {
        const entity = selectedEntity();
        if (!entity) return;
        mutate(() => {
            if (['x', 'y', 'z'].includes(field)) entity[field] = Number(value) || 0;
            else entity[field] = value;
        }, `${entity.id} を更新しました。`);
    }

    function deleteSelected() {
        const floor = getFloor();
        const entity = selectedEntity();
        if (!floor || !entity) return;
        mutate(() => {
            const key = state.selected.kind === 'marker' ? 'markers' : 'objects';
            floor[key] = floor[key].filter(item => item.id !== entity.id);
            state.selected = null;
        }, `${entity.id} を削除しました。`);
    }

    function duplicateSelected() {
        const floor = getFloor();
        const entity = selectedEntity();
        if (!floor || !entity) return;
        mutate(() => {
            const key = state.selected.kind === 'marker' ? 'markers' : 'objects';
            const duplicate = clone(entity);
            duplicate.id = uniqueEntityId(entity.type || entity.id, floor[key]);
            duplicate.x = Math.min(floor.width - 1, entity.x + 1);
            duplicate.y = Math.min(floor.height - 1, entity.y + 1);
            floor[key].push(duplicate);
            state.selected = { kind: state.selected.kind, id: duplicate.id };
        }, '選択対象を複製しました。');
    }

    function rotateSelected() {
        const entity = selectedEntity();
        if (!entity) return;
        mutate(() => {
            const current = DIRECTIONS.indexOf(entity.dir || 'down');
            entity.dir = DIRECTIONS[(current + 1) % DIRECTIONS.length];
        }, '向きを変更しました。');
    }

    function renderInspector() {
        const host = document.getElementById('fte-inspector');
        const entity = selectedEntity();
        const errors = validateTemplate(state.template);
        const selection = entity ? `
            <div class="fte-section"><h3>選択中：${escapeHtml(entity.label || entity.id)}</h3>
                <div class="fte-inspector-grid">
                    <span>ID</span><code>${escapeHtml(entity.id)}</code>
                    <label for="fte-entity-x">X</label><input id="fte-entity-x" type="number" value="${entity.x}">
                    <label for="fte-entity-y">Y</label><input id="fte-entity-y" type="number" value="${entity.y}">
                    <label for="fte-entity-dir">向き</label><select id="fte-entity-dir">${DIRECTIONS.map(dir => `<option value="${dir}" ${entity.dir === dir ? 'selected' : ''}>${dir}</option>`).join('')}</select>
                    ${state.selected.kind === 'object' ? `<label for="fte-entity-z">前後順</label><input id="fte-entity-z" type="number" value="${Number(entity.z) || 0}">` : ''}
                </div>
                <div class="fte-actions"><button id="fte-rotate">向きを回す</button><button id="fte-duplicate">複製</button><button id="fte-delete" style="background:#8e2424">削除</button></div>
            </div>` : '<div class="fte-section"><h3>選択中</h3><div style="font-size:12px;color:#b0bec5;line-height:1.6">設備またはキャラクターを選び、移動先のマスをクリックしてください。</div></div>';
        const validation = errors.length
            ? `<div class="fte-validation bad">${errors.slice(0, 10).map(error => `• ${escapeHtml(error)}`).join('<br>')}${errors.length > 10 ? `<br>ほか ${errors.length - 10} 件` : ''}</div>`
            : '<div class="fte-validation ok">✓ 基本検証に問題はありません。</div>';
        host.innerHTML = `${selection}
            <div class="fte-section"><h3>基本検証</h3>${validation}</div>
            <div class="fte-section"><h3>JSON出力</h3>
                <div style="font-size:11px;color:#b0bec5;line-height:1.5;margin-bottom:8px">ラベル表示用文字列を除き、言語非依存のID・座標・画像キーを出力します。</div>
                <div class="fte-actions">
                    <button id="fte-console-export">選択中をF12へ</button>
                    <button id="fte-file-export">選択中をJSONファイル</button>
                    <button id="fte-file-export-all">全施設をJSONファイル</button>
                    <button id="fte-clear-drafts" style="background:#6d4c41">下書きを全削除</button>
                </div>
            </div>`;
        if (entity) {
            document.getElementById('fte-entity-x').addEventListener('change', event => updateSelectedField('x', event.target.value));
            document.getElementById('fte-entity-y').addEventListener('change', event => updateSelectedField('y', event.target.value));
            document.getElementById('fte-entity-dir').addEventListener('change', event => updateSelectedField('dir', event.target.value));
            const z = document.getElementById('fte-entity-z');
            if (z) z.addEventListener('change', event => updateSelectedField('z', event.target.value));
            document.getElementById('fte-rotate').addEventListener('click', rotateSelected);
            document.getElementById('fte-duplicate').addEventListener('click', duplicateSelected);
            document.getElementById('fte-delete').addEventListener('click', deleteSelected);
        }
        document.getElementById('fte-console-export').addEventListener('click', () => exportToConsole(false));
        document.getElementById('fte-file-export').addEventListener('click', () => downloadJson(false));
        document.getElementById('fte-file-export-all').addEventListener('click', () => downloadJson(true));
        document.getElementById('fte-clear-drafts').addEventListener('click', clearAllDrafts);
    }

    function render() {
        if (!document.getElementById('facility-template-editor')) return;
        renderHeader();
        renderPalette();
        renderMap();
        renderInspector();
        const message = document.getElementById('fte-message');
        if (message) message.textContent = state.message || '準備完了';
    }

    function sanitizeEntity(entity) {
        const output = {};
        ['id', 'type', 'spriteKey', 'spriteKeys', 'parts', 'targetFloorId', 'x', 'y', 'w', 'h', 'z', 'dir', 'spriteBase', 'required'].forEach(key => {
            if (entity[key] !== undefined && entity[key] !== '' && entity[key] !== null) output[key] = clone(entity[key]);
        });
        return output;
    }

    function sanitizeTemplate(template) {
        return {
            schemaVersion: SCHEMA_VERSION,
            facilityId: template.facilityId,
            stageId: template.stageId,
            floors: template.floors.map(floor => ({
                id: floor.id,
                width: floor.width,
                height: floor.height,
                cells: clone(floor.cells),
                objects: (floor.objects || []).map(sanitizeEntity),
                markers: (floor.markers || []).map(sanitizeEntity)
            }))
        };
    }

    function selectedExportPayload() {
        saveCurrentDraft();
        const template = sanitizeTemplate(state.template);
        const validationErrors = validateTemplate(state.template);
        return {
            schemaVersion: SCHEMA_VERSION,
            exportType: 'facility_template',
            exportedAt: new Date().toISOString(),
            facilityId: state.facilityId,
            stageId: state.stageId,
            validation: { valid: validationErrors.length === 0, errorCount: validationErrors.length },
            template
        };
    }

    function allExportPayload() {
        saveCurrentDraft();
        const facilities = state.facilities.map(facility => ({
            facilityId: facility.id,
            stages: facility.stages.map(stage => {
                const template = templateFor(facility.id, stage.id);
                const validationErrors = validateTemplate(template);
                return {
                    stageId: stage.id,
                    validation: { valid: validationErrors.length === 0, errorCount: validationErrors.length },
                    template: sanitizeTemplate(template)
                };
            })
        }));
        return { schemaVersion: SCHEMA_VERSION, exportType: 'all_facility_templates', exportedAt: new Date().toISOString(), facilities };
    }

    function exportToConsole(all) {
        const payload = all ? allExportPayload() : selectedExportPayload();
        const json = JSON.stringify(payload, null, 2);
        console.log(`[FACILITY_TEMPLATE_EDITOR_JSON]\n${json}`);
        state.message = 'F12コンソールへJSONを出力しました。';
        const message = document.getElementById('fte-message');
        if (message) message.textContent = state.message;
        return json;
    }

    function downloadJson(all) {
        const payload = all ? allExportPayload() : selectedExportPayload();
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = all ? 'facility_templates_all.json' : `facility_template_${state.facilityId}_${state.stageId}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        state.message = 'JSONファイルを出力しました。';
        const message = document.getElementById('fte-message');
        if (message) message.textContent = state.message;
        return json;
    }

    function openEditor() {
        state.facilities = buildFacilityDefinitions();
        const currentFacility = state.facilities.some(item => item.id === state.facilityId) ? state.facilityId : state.facilities[0].id;
        loadSelection(currentFacility, state.stageId, state.floorId);
        const modal = ensureEditorDom();
        modal.style.display = 'block';
        render();
    }

    function closeEditor() {
        saveCurrentDraft();
        const modal = document.getElementById('facility-template-editor');
        if (modal) modal.style.display = 'none';
    }

    window.addEventListener('keydown', event => {
        const modal = document.getElementById('facility-template-editor');
        if (!modal || modal.style.display === 'none') return;
        // エディタ操作中は、後から登録される本編／画像調整のキー操作へ流さない。
        event.stopImmediatePropagation();
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && String(event.key || '').toLowerCase() === 'e') {
            event.preventDefault();
            exportToConsole(false);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            closeEditor();
            return;
        }
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement && document.activeElement.tagName)) return;
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && String(event.key || '').toLowerCase() === 'z') {
            event.preventDefault();
            undo();
            return;
        }
        if (((event.ctrlKey || event.metaKey) && String(event.key || '').toLowerCase() === 'y') || ((event.ctrlKey || event.metaKey) && event.shiftKey && String(event.key || '').toLowerCase() === 'z')) {
            event.preventDefault();
            redo();
            return;
        }
        if (event.key === 'Delete' && state.selected) {
            event.preventDefault();
            deleteSelected();
            return;
        }
        if (String(event.key || '').toLowerCase() === 'r' && state.selected && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement && document.activeElement.tagName)) {
            event.preventDefault();
            rotateSelected();
        }
    });

    window.openFacilityTemplateEditor = openEditor;
    window.closeFacilityTemplateEditor = closeEditor;
    window.exportFacilityTemplateEditorJson = function (all = false) { return exportToConsole(!!all); };
    window.downloadFacilityTemplateEditorJson = function (all = false) { return downloadJson(!!all); };
    window.__FACILITY_TEMPLATE_EDITOR_TEST_API = Object.freeze({
        buildFacilityDefinitions,
        validateTemplate,
        sanitizeTemplate,
        spriteImageLayout,
        parseCell,
        cell,
        schemaVersion: SCHEMA_VERSION
    });
})();
