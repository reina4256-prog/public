window.DUNGEON_SPRITES = {
    // スカル
    "skull_floor": { "img": "dungeon_scull_mapchip.png", "sx": 9, "sy": 0, "sw": 341, "sh": 331, "scale": 1 },
    "skull_wall": { "img": "dungeon_scull_mapchip.png", "sx": 5, "sy": 337, "sw": 341, "sh": 429, "scale": 1 },
    "skull_stair": { "img": "dungeon_scull_mapchip.png", "sx": 448, "sy": 1168, "sw": 341, "sh": 376, "scale": 1 },
    // ★ 追加：クリスタル（調整ツールで値を上書きしてください）
    "crystal_floor": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 3,
        "sy": 57,
        "sw": 230,
        "sh": 256,
        "scale": 1
    },
    "crystal_wall": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 33,
        "sy": 404,
        "sw": 230,
        "sh": 237,
        "scale": 1
    },
    "crystal_stair": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 1999,
        "sy": 404,
        "sw": 230,
        "sh": 237,
        "scale": 1
    },

    // ==========================================
    // ★ 追加：特殊な床、トラップ、アイテムの定義
    // ==========================================
    "gimmick_water": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 566,
        "sy": 339,
        "sw": 365,
        "sh": 375,
        "scale": 1
    },
    "gimmick_magma": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1013,
        "sy": 339,
        "sw": 365,
        "sh": 375,
        "scale": 1
    },
    "gimmick_grass": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1454,
        "sy": 340,
        "sw": 343,
        "sh": 372,
        "scale": 1
    },
    "gimmick_dirt": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1898,
        "sy": 340,
        "sw": 353,
        "sh": 372,
        "scale": 1
    },
    "gimmick_ice": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 566,
        "sy": 824,
        "sw": 365,
        "sh": 350,
        "scale": 1
    },
    "gimmick_puddle": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1011,
        "sy": 824,
        "sw": 365,
        "sh": 350,
        "scale": 1
    },
    "gimmick_ditch": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1885,
        "sy": 823,
        "sw": 365,
        "sh": 351,
        "scale": 1
    },
    "gimmick_fire": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1446,
        "sy": 783,
        "sw": 365,
        "sh": 391,
        "scale": 1
    },
    "gimmick_rune": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 1447,
        "sy": 16,
        "sw": 707,
        "sh": 621,
        "scale": 0.7
    },
    "trap_poison": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 77,
        "sy": 83,
        "sw": 573,
        "sh": 578,
        "scale": 0.8
    },
    "trap_mine": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 740,
        "sy": 83,
        "sw": 573,
        "sh": 578,
        "scale": 0.8
    },
    "trap_blind": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 1491,
        "sy": 783,
        "sw": 588,
        "sh": 578,
        "scale": 0.8
    },
    "trap_bear_trap": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 740,
        "sy": 783,
        "sw": 573,
        "sh": 578,
        "scale": 0.8
    },
    "trap_stone": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 2183,
        "sy": 83,
        "sw": 573,
        "sh": 578,
        "scale": 0.8
    },
    "spr_item_herb": {
        "img": "dungeon_item_mapchip.png",
        "sx": 210,
        "sy": 637,
        "sw": 346,
        "sh": 458,
        "scale": 0.8
    },
    "spr_item_scroll": {
        "img": "dungeon_item_mapchip.png",
        "sx": 815,
        "sy": 668,
        "sw": 492,
        "sh": 500,
        "scale": 0.8
    },
    "spr_item_wand": {
        "img": "dungeon_item_mapchip.png",
        "sx": 1420,
        "sy": 618,
        "sw": 634,
        "sh": 590,
        "scale": 0.8
    },
    "spr_item_bag": {
        "img": "dungeon_item_mapchip.png",
        "sx": 2223,
        "sy": 638,
        "sw": 442,
        "sh": 519,
        "scale": 0.8
    },

    // キャラクター
    "chef_down": {
        "img": "chef_dungeon_walk.png",
        "sx": 116,
        "sy": 68,
        "sw": 453,
        "sh": 684,
        "scale": 0.4
    },
    "chef_up": {
        "img": "chef_dungeon_walk.png",
        "sx": 827,
        "sy": 68,
        "sw": 453,
        "sh": 684,
        "scale": 0.4
    },
    "chef_left": {
        "img": "chef_dungeon_walk.png",
        "sx": 827,
        "sy": 827,
        "sw": 453,
        "sh": 684,
        "scale": 0.4
    },
    "chef_right": {
        "img": "chef_dungeon_walk.png",
        "sx": 128,
        "sy": 827,
        "sw": 453,
        "sh": 684,
        "scale": 0.4
    },

    // コンシェルジュ
    "concierge_down": {
        "img": "concierge_dungeon_walk.png",
        "sx": 179,
        "sy": 42,
        "sw": 453,
        "sh": 1348,
        "scale": 0.25000000000000006
    },
    "concierge_up": {
        "img": "concierge_dungeon_walk.png",
        "sx": 864,
        "sy": 42,
        "sw": 453,
        "sh": 1348,
        "scale": 0.25000000000000006
    },
    "concierge_left": {
        "img": "concierge_dungeon_walk.png",
        "sx": 1563,
        "sy": 42,
        "sw": 453,
        "sh": 1348,
        "scale": 0.25000000000000006
    },
    "concierge_right": {
        "img": "concierge_dungeon_walk.png",
        "sx": 2195,
        "sy": 42,
        "sw": 453,
        "sh": 1348,
        "scale": 0.25000000000000006
    },

    // ディーラー
    "dealer_down": {
        "img": "dealer_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "dealer_up": {
        "img": "dealer_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "dealer_left": {
        "img": "dealer_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "dealer_right": {
        "img": "dealer_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 冒険家
    "adventurer_down": {
        "img": "adventurer_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "adventurer_up": {
        "img": "adventurer_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "adventurer_left": {
        "img": "adventurer_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "adventurer_right": {
        "img": "adventurer_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 漁師
    "fisherman_down": {
        "img": "fisherman_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "fisherman_up": {
        "img": "fisherman_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "fisherman_left": {
        "img": "fisherman_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "fisherman_right": {
        "img": "fisherman_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 鍛冶士
    "smith_down": {
        "img": "smith_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "smith_up": {
        "img": "smith_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "smith_left": {
        "img": "smith_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "smith_right": {
        "img": "smith_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 建築士
    "builder_down": {
        "img": "builder_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "builder_up": {
        "img": "builder_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "builder_left": {
        "img": "builder_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "builder_right": {
        "img": "builder_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 農家
    "farmer_down": {
        "img": "farmer_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "farmer_up": {
        "img": "farmer_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "farmer_left": {
        "img": "farmer_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "farmer_right": {
        "img": "farmer_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 薬剤師
    "pharmacist_down": {
        "img": "pharmacist_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pharmacist_up": {
        "img": "pharmacist_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pharmacist_left": {
        "img": "pharmacist_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pharmacist_right": {
        "img": "pharmacist_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 美容師
    "hairdresser_down": {
        "img": "hairdresser_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "hairdresser_up": {
        "img": "hairdresser_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "hairdresser_left": {
        "img": "hairdresser_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "hairdresser_right": {
        "img": "hairdresser_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 仕立屋
    "tailor_down": {
        "img": "tailor_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "tailor_up": {
        "img": "tailor_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "tailor_left": {
        "img": "tailor_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "tailor_right": {
        "img": "tailor_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // パティシエ
    "pastry_chef_down": {
        "img": "pastry_chef_dungeon_walk.png",
        "sx": 170,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pastry_chef_up": {
        "img": "pastry_chef_dungeon_walk.png",
        "sx": 850,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pastry_chef_left": {
        "img": "pastry_chef_dungeon_walk.png",
        "sx": 1563,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },
    "pastry_chef_right": {
        "img": "pastry_chef_dungeon_walk.png",
        "sx": 2195,
        "sy": 30,
        "sw": 512,
        "sh": 1503,
        "scale": 0.25000000000000006
    },

    // 王城の人物（4方向シートは 2760x1504、1方向あたり 690x1504）
    "king_down": { "img": "king_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "king_up": { "img": "king_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "king_right": { "img": "king_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "king_left": { "img": "king_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    "captain_down": { "img": "captain_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "captain_up": { "img": "captain_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "captain_right": { "img": "captain_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "captain_left": { "img": "captain_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    "soldier_down": { "img": "soldier_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "soldier_up": { "img": "soldier_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "soldier_right": { "img": "soldier_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "soldier_left": { "img": "soldier_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    // 占い師
    "fortune_teller_down": { "img": "fortune_teller_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "fortune_teller_up": { "img": "fortune_teller_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "fortune_teller_right": { "img": "fortune_teller_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "fortune_teller_left": { "img": "fortune_teller_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    // 科学者
    "scientist_down": { "img": "scientist_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "scientist_up": { "img": "scientist_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "scientist_right": { "img": "scientist_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "scientist_left": { "img": "scientist_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    // 販売員
    "merchant_down": { "img": "merchant_dungeon_walk.png", "sx": 0, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "merchant_up": { "img": "merchant_dungeon_walk.png", "sx": 690, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "merchant_right": { "img": "merchant_dungeon_walk.png", "sx": 1380, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },
    "merchant_left": { "img": "merchant_dungeon_walk.png", "sx": 2070, "sy": 0, "sw": 690, "sh": 1504, "scale": 0.25, "sourceW": 2760, "sourceH": 1504 },

    "robot_down": { "img": "robot_dungeon_walk.png", "sx": 688, "sy": 76, "sw": 408, "sh": 626, "scale": 0.4 },
    "robot_up": { "img": "robot_dungeon_walk.png", "sx": 1754, "sy": 76, "sw": 408, "sh": 626, "scale": 0.4 },
    "robot_left": { "img": "robot_dungeon_walk.png", "sx": 1749, "sy": 796, "sw": 374, "sh": 669, "scale": 0.4 },
    "robot_right": { "img": "robot_dungeon_walk.png", "sx": 737, "sy": 796, "sw": 374, "sh": 669, "scale": 0.4 },

    "robot_sword_down": {
        "img": "robot_dungeon_sword.png",
        "sx": 463,
        "sy": 76,
        "sw": 636,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_up": {
        "img": "robot_dungeon_sword.png",
        "sx": 1513,
        "sy": 76,
        "sw": 675,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_left": {
        "img": "robot_dungeon_sword.png",
        "sx": 1634,
        "sy": 796,
        "sw": 490,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_right": {
        "img": "robot_dungeon_sword.png",
        "sx": 737,
        "sy": 796,
        "sw": 494,
        "sh": 669,
        "scale": 0.4
    },
    "robot_shield_down": {
        "img": "robot_dungeon_shield.png",
        "sx": 688,
        "sy": 76,
        "sw": 504,
        "sh": 626,
        "scale": 0.4
    },
    "robot_shield_up": {
        "img": "robot_dungeon_shield.png",
        "sx": 1663,
        "sy": 76,
        "sw": 504,
        "sh": 626,
        "scale": 0.4
    },
    "robot_shield_left": {
        "img": "robot_dungeon_shield.png",
        "sx": 1736,
        "sy": 796,
        "sw": 382,
        "sh": 669,
        "scale": 0.4
    },
    "robot_shield_right": {
        "img": "robot_dungeon_shield.png",
        "sx": 737,
        "sy": 796,
        "sw": 408,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_shield_down": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 525,
        "sy": 76,
        "sw": 660,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_shield_up": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 1678,
        "sy": 76,
        "sw": 635,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_shield_left": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 1676,
        "sy": 796,
        "sw": 453,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_shield_right": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 737,
        "sy": 796,
        "sw": 449,
        "sh": 669,
        "scale": 0.4
    },
    "robot_type1_down": {
        "img": "robot_type1_dungeon_walk.png",
        "sx": 74,
        "sy": 39,
        "sw": 696,
        "sh": 1240,
        "scale": 0.25
    },
    "robot_type1_up": {
        "img": "robot_type1_dungeon_walk.png",
        "sx": 907,
        "sy": 39,
        "sw": 696,
        "sh": 1240,
        "scale": 0.25
    },
    "robot_type1_left": {
        "img": "robot_type1_dungeon_walk.png",
        "sx": 74,
        "sy": 1290,
        "sw": 696,
        "sh": 1240,
        "scale": 0.25
    },
    "robot_type1_right": {
        "img": "robot_type1_dungeon_walk.png",
        "sx": 874,
        "sy": 1290,
        "sw": 696,
        "sh": 1240,
        "scale": 0.25
    },
    "robot_type1_2_down": {
        "img": "robot_type1_2_dungeon_walk.png",
        "sx": 55,
        "sy": 38,
        "sw": 879,
        "sh": 1085,
        "scale": 0.25000000000000006
    },
    "robot_type1_2_up": {
        "img": "robot_type1_2_dungeon_walk.png",
        "sx": 1013,
        "sy": 38,
        "sw": 879,
        "sh": 1085,
        "scale": 0.25000000000000006
    },
    "robot_type1_2_left": {
        "img": "robot_type1_2_dungeon_walk.png",
        "sx": 55,
        "sy": 1125,
        "sw": 879,
        "sh": 1127,
        "scale": 0.25000000000000006
    },
    "robot_type1_2_right": {
        "img": "robot_type1_2_dungeon_walk.png",
        "sx": 1033,
        "sy": 1125,
        "sw": 879,
        "sh": 1127,
        "scale": 0.25000000000000006
    },
    "robot_type1_3_down": {
        "img": "robot_type1_3_dungeon_walk.png",
        "sx": 12,
        "sy": 60,
        "sw": 854,
        "sh": 1208,
        "scale": 0.25000000000000006
    },
    "robot_type1_3_up": {
        "img": "robot_type1_3_dungeon_walk.png",
        "sx": 841,
        "sy": 60,
        "sw": 854,
        "sh": 1208,
        "scale": 0.25000000000000006
    },
    "robot_type1_3_left": {
        "img": "robot_type1_3_dungeon_walk.png",
        "sx": 12,
        "sy": 1268,
        "sw": 854,
        "sh": 1247,
        "scale": 0.25000000000000006
    },
    "robot_type1_3_right": {
        "img": "robot_type1_3_dungeon_walk.png",
        "sx": 846,
        "sy": 1268,
        "sw": 854,
        "sh": 1247,
        "scale": 0.25000000000000006
    },
    "robot_type2_down": {
        "img": "robot_type2_dungeon_walk.png",
        "sx": 71,
        "sy": 55,
        "sw": 722,
        "sh": 1111,
        "scale": 0.25000000000000006
    },
    "robot_type2_up": {
        "img": "robot_type2_dungeon_walk.png",
        "sx": 972,
        "sy": 55,
        "sw": 722,
        "sh": 1111,
        "scale": 0.25000000000000006
    },
    "robot_type2_left": {
        "img": "robot_type2_dungeon_walk.png",
        "sx": 991,
        "sy": 1214,
        "sw": 722,
        "sh": 1142,
        "scale": 0.25000000000000006
    },
    "robot_type2_right": {
        "img": "robot_type2_dungeon_walk.png",
        "sx": 91,
        "sy": 1214,
        "sw": 722,
        "sh": 1142,
        "scale": 0.25000000000000006
    },
    "robot_type2_2_down": {
        "img": "robot_type2_2_dungeon_walk.png",
        "sx": 39,
        "sy": 76,
        "sw": 745,
        "sh": 1241,
        "scale": 0.25000000000000006
    },
    "robot_type2_2_up": {
        "img": "robot_type2_2_dungeon_walk.png",
        "sx": 860,
        "sy": 76,
        "sw": 745,
        "sh": 1241,
        "scale": 0.25000000000000006
    },
    "robot_type2_2_left": {
        "img": "robot_type2_2_dungeon_walk.png",
        "sx": 39,
        "sy": 1326,
        "sw": 745,
        "sh": 1306,
        "scale": 0.25000000000000006
    },
    "robot_type2_2_right": {
        "img": "robot_type2_2_dungeon_walk.png",
        "sx": 876,
        "sy": 1326,
        "sw": 745,
        "sh": 1306,
        "scale": 0.25000000000000006
    },
    "robot_type2_3_down": {
        "img": "robot_type2_3_dungeon_walk.png",
        "sx": 28,
        "sy": 76,
        "sw": 718,
        "sh": 1251,
        "scale": 0.25000000000000006
    },
    "robot_type2_3_up": {
        "img": "robot_type2_3_dungeon_walk.png",
        "sx": 805,
        "sy": 76,
        "sw": 718,
        "sh": 1251,
        "scale": 0.25000000000000006
    },
    "robot_type2_3_left": {
        "img": "robot_type2_3_dungeon_walk.png",
        "sx": 28,
        "sy": 1496,
        "sw": 718,
        "sh": 1251,
        "scale": 0.25000000000000006
    },
    "robot_type2_3_right": {
        "img": "robot_type2_3_dungeon_walk.png",
        "sx": 814,
        "sy": 1496,
        "sw": 718,
        "sh": 1251,
        "scale": 0.25000000000000006
    },
    "robot_type2_4_down": {
        "img": "robot_type2_4_dungeon_walk.png",
        "sx": 38,
        "sy": 40,
        "sw": 1089,
        "sh": 885,
        "scale": 0.25000000000000006
    },
    "robot_type2_4_up": {
        "img": "robot_type2_4_dungeon_walk.png",
        "sx": 1235,
        "sy": 40,
        "sw": 1089,
        "sh": 885,
        "scale": 0.25000000000000006
    },
    "robot_type2_4_left": {
        "img": "robot_type2_4_dungeon_walk.png",
        "sx": 38,
        "sy": 934,
        "sw": 1089,
        "sh": 885,
        "scale": 0.25000000000000006
    },
    "robot_type2_4_right": {
        "img": "robot_type2_4_dungeon_walk.png",
        "sx": 1267,
        "sy": 933,
        "sw": 1089,
        "sh": 885,
        "scale": 0.25000000000000006
    },
    "robot_type3_down": {
        "img": "robot_type3_dungeon_walk.png",
        "sx": 55,
        "sy": 44,
        "sw": 772,
        "sh": 1233,
        "scale": 0.25000000000000006
    },
    "robot_type3_up": {
        "img": "robot_type3_dungeon_walk.png",
        "sx": 874,
        "sy": 44,
        "sw": 772,
        "sh": 1233,
        "scale": 0.25000000000000006
    },
    "robot_type3_left": {
        "img": "robot_type3_dungeon_walk.png",
        "sx": 55,
        "sy": 1272,
        "sw": 772,
        "sh": 1233,
        "scale": 0.25000000000000006
    },
    "robot_type3_right": {
        "img": "robot_type3_dungeon_walk.png",
        "sx": 897,
        "sy": 1272,
        "sw": 772,
        "sh": 1233,
        "scale": 0.25000000000000006
    },
    "robot_type3_2_down": {
        "img": "robot_type3_2_dungeon_walk.png",
        "sx": 83,
        "sy": 76,
        "sw": 872,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "robot_type3_2_up": {
        "img": "robot_type3_2_dungeon_walk.png",
        "sx": 1083,
        "sy": 76,
        "sw": 872,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "robot_type3_2_left": {
        "img": "robot_type3_2_dungeon_walk.png",
        "sx": 1075,
        "sy": 1083,
        "sw": 872,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "robot_type3_2_right": {
        "img": "robot_type3_2_dungeon_walk.png",
        "sx": 75,
        "sy": 1083,
        "sw": 872,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "robot_type3_3_down": {
        "img": "robot_type3_3_dungeon_walk.png",
        "sx": 147,
        "sy": 76,
        "sw": 818,
        "sh": 925,
        "scale": 0.25000000000000006
    },
    "robot_type3_3_up": {
        "img": "robot_type3_3_dungeon_walk.png",
        "sx": 1147,
        "sy": 76,
        "sw": 818,
        "sh": 925,
        "scale": 0.25000000000000006
    },
    "robot_type3_3_left": {
        "img": "robot_type3_3_dungeon_walk.png",
        "sx": 1147,
        "sy": 1026,
        "sw": 818,
        "sh": 925,
        "scale": 0.25000000000000006
    },
    "robot_type3_3_right": {
        "img": "robot_type3_3_dungeon_walk.png",
        "sx": 147,
        "sy": 1026,
        "sw": 818,
        "sh": 925,
        "scale": 0.25000000000000006
    },
    "robot_type3_4_down": {
        "img": "robot_type3_4_dungeon_walk.png",
        "sx": 57,
        "sy": 65,
        "sw": 670,
        "sh": 1321,
        "scale": 0.25000000000000006
    },
    "robot_type3_4_up": {
        "img": "robot_type3_4_dungeon_walk.png",
        "sx": 818,
        "sy": 65,
        "sw": 683,
        "sh": 1321,
        "scale": 0.25000000000000006
    },
    "robot_type3_4_left": {
        "img": "robot_type3_4_dungeon_walk.png",
        "sx": 810,
        "sy": 1377,
        "sw": 670,
        "sh": 1345,
        "scale": 0.25000000000000006
    },
    "robot_type3_4_right": {
        "img": "robot_type3_4_dungeon_walk.png",
        "sx": 110,
        "sy": 1377,
        "sw": 670,
        "sh": 1345,
        "scale": 0.25000000000000006
    },
    "robot_type3_5_down": {
        "img": "robot_type3_5_dungeon_walk.png",
        "sx": 44,
        "sy": 60,
        "sw": 982,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "robot_type3_5_up": {
        "img": "robot_type3_5_dungeon_walk.png",
        "sx": 1087,
        "sy": 60,
        "sw": 982,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "robot_type3_5_left": {
        "img": "robot_type3_5_dungeon_walk.png",
        "sx": 1087,
        "sy": 1028,
        "sw": 982,
        "sh": 1006,
        "scale": 0.25000000000000006
    },
    "robot_type3_5_right": {
        "img": "robot_type3_5_dungeon_walk.png",
        "sx": 39,
        "sy": 1028,
        "sw": 982,
        "sh": 1006,
        "scale": 0.25000000000000006
    },
    "robot_type4_down": {
        "img": "robot_type4_dungeon_walk.png",
        "sx": 55,
        "sy": 43,
        "sw": 773,
        "sh": 1232,
        "scale": 0.25000000000000006
    },
    "robot_type4_up": {
        "img": "robot_type4_dungeon_walk.png",
        "sx": 898,
        "sy": 43,
        "sw": 774,
        "sh": 1232,
        "scale": 0.25000000000000006
    },
    "robot_type4_left": {
        "img": "robot_type4_dungeon_walk.png",
        "sx": 937,
        "sy": 1260,
        "sw": 773,
        "sh": 1232,
        "scale": 0.25000000000000006
    },
    "robot_type4_right": {
        "img": "robot_type4_dungeon_walk.png",
        "sx": 59,
        "sy": 1260,
        "sw": 773,
        "sh": 1232,
        "scale": 0.25000000000000006
    },
    "robot_type4_2_down": {
        "img": "robot_type4_2_dungeon_walk.png",
        "sx": 92,
        "sy": 76,
        "sw": 994,
        "sh": 854,
        "scale": 0.25000000000000006
    },
    "robot_type4_2_up": {
        "img": "robot_type4_2_dungeon_walk.png",
        "sx": 1204,
        "sy": 76,
        "sw": 994,
        "sh": 854,
        "scale": 0.25000000000000006
    },
    "robot_type4_2_left": {
        "img": "robot_type4_2_dungeon_walk.png",
        "sx": 86,
        "sy": 928,
        "sw": 994,
        "sh": 854,
        "scale": 0.25000000000000006
    },
    "robot_type4_2_right": {
        "img": "robot_type4_2_dungeon_walk.png",
        "sx": 1214,
        "sy": 928,
        "sw": 994,
        "sh": 854,
        "scale": 0.25000000000000006
    },
    "robot_type4_3_down": {
        "img": "robot_type4_3_dungeon_walk.png",
        "sx": 41,
        "sy": 40,
        "sw": 880,
        "sh": 1088,
        "scale": 0.25000000000000006
    },
    "robot_type4_3_up": {
        "img": "robot_type4_3_dungeon_walk.png",
        "sx": 1041,
        "sy": 40,
        "sw": 880,
        "sh": 1088,
        "scale": 0.25000000000000006
    },
    "robot_type4_3_left": {
        "img": "robot_type4_3_dungeon_walk.png",
        "sx": 41,
        "sy": 1124,
        "sw": 880,
        "sh": 1088,
        "scale": 0.25000000000000006
    },
    "robot_type4_3_right": {
        "img": "robot_type4_3_dungeon_walk.png",
        "sx": 1041,
        "sy": 1124,
        "sw": 880,
        "sh": 1088,
        "scale": 0.25000000000000006
    },
    "robot_type4_4_down": {
        "img": "robot_type4_4_dungeon_walk.png",
        "sx": 42,
        "sy": 76,
        "sw": 909,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "robot_type4_4_up": {
        "img": "robot_type4_4_dungeon_walk.png",
        "sx": 969,
        "sy": 56,
        "sw": 909,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "robot_type4_4_left": {
        "img": "robot_type4_4_dungeon_walk.png",
        "sx": 123,
        "sy": 1135,
        "sw": 909,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "robot_type4_4_right": {
        "img": "robot_type4_4_dungeon_walk.png",
        "sx": 882,
        "sy": 1135,
        "sw": 909,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "robot_type5_down": {
        "img": "robot_type5_dungeon_walk.png",
        "sx": -12,
        "sy": -6,
        "sw": 849,
        "sh": 1235,
        "scale": 0.25000000000000006
    },
    "robot_type5_up": {
        "img": "robot_type5_dungeon_walk.png",
        "sx": 902,
        "sy": -6,
        "sw": 849,
        "sh": 1235,
        "scale": 0.25000000000000006
    },
    "robot_type5_left": {
        "img": "robot_type5_dungeon_walk.png",
        "sx": 900,
        "sy": 1226,
        "sw": 849,
        "sh": 1235,
        "scale": 0.25000000000000006
    },
    "robot_type5_right": {
        "img": "robot_type5_dungeon_walk.png",
        "sx": 23,
        "sy": 1226,
        "sw": 849,
        "sh": 1235,
        "scale": 0.25000000000000006
    },
    "robot_type5_2_down": {
        "img": "robot_type5_2_dungeon_walk.png",
        "sx": -9,
        "sy": 148,
        "sw": 806,
        "sh": 1178,
        "scale": 0.25000000000000006
    },
    "robot_type5_2_up": {
        "img": "robot_type5_2_dungeon_walk.png",
        "sx": 818,
        "sy": 76,
        "sw": 806,
        "sh": 1249,
        "scale": 0.25000000000000006
    },
    "robot_type5_2_left": {
        "img": "robot_type5_2_dungeon_walk.png",
        "sx": 814,
        "sy": 1401,
        "sw": 806,
        "sh": 1253,
        "scale": 0.25000000000000006
    },
    "robot_type5_2_right": {
        "img": "robot_type5_2_dungeon_walk.png",
        "sx": 30,
        "sy": 1401,
        "sw": 806,
        "sh": 1253,
        "scale": 0.25000000000000006
    },
    "robot_type5_3_down": {
        "img": "robot_type5_3_dungeon_walk.png",
        "sx": 109,
        "sy": 297,
        "sw": 703,
        "sh": 918,
        "scale": 0.25000000000000006
    },
    "robot_type5_3_up": {
        "img": "robot_type5_3_dungeon_walk.png",
        "sx": 952,
        "sy": 297,
        "sw": 703,
        "sh": 918,
        "scale": 0.25000000000000006
    },
    "robot_type5_3_left": {
        "img": "robot_type5_3_dungeon_walk.png",
        "sx": 979,
        "sy": 1297,
        "sw": 703,
        "sh": 979,
        "scale": 0.25000000000000006
    },
    "robot_type5_3_right": {
        "img": "robot_type5_3_dungeon_walk.png",
        "sx": 137,
        "sy": 1297,
        "sw": 703,
        "sh": 979,
        "scale": 0.25000000000000006
    },
    "robot_type5_4_down": {
        "img": "robot_type5_4_dungeon_walk.png",
        "sx": -5,
        "sy": 15,
        "sw": 819,
        "sh": 1324,
        "scale": 0.25000000000000006
    },
    "robot_type5_4_up": {
        "img": "robot_type5_4_dungeon_walk.png",
        "sx": 792,
        "sy": 15,
        "sw": 819,
        "sh": 1324,
        "scale": 0.25000000000000006
    },
    "robot_type5_4_left": {
        "img": "robot_type5_4_dungeon_walk.png",
        "sx": -5,
        "sy": 1324,
        "sw": 819,
        "sh": 1324,
        "scale": 0.25000000000000006
    },
    "robot_type5_4_right": {
        "img": "robot_type5_4_dungeon_walk.png",
        "sx": 827,
        "sy": 1324,
        "sw": 819,
        "sh": 1324,
        "scale": 0.25000000000000006
    },


    "magician_down": {
        "img": "magician_dungeon_walk.png",
        "sx": 43,
        "sy": 42,
        "sw": 835,
        "sh": 1015,
        "scale": 0.25000000000000006
    },
    "magician_up": {
        "img": "magician_dungeon_walk.png",
        "sx": 1020,
        "sy": 42,
        "sw": 855,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_left": {
        "img": "magician_dungeon_walk.png",
        "sx": 43,
        "sy": 1169,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_right": {
        "img": "magician_dungeon_walk.png",
        "sx": 1036,
        "sy": 1169,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type1_down": {
        "img": "magician_type1_dungeon_walk.png",
        "sx": 26,
        "sy": 3,
        "sw": 894,
        "sh": 1135,
        "scale": 0.25000000000000006
    },
    "magician_type1_up": {
        "img": "magician_type1_dungeon_walk.png",
        "sx": 937,
        "sy": -10,
        "sw": 910,
        "sh": 1166,
        "scale": 0.25000000000000006
    },
    "magician_type1_left": {
        "img": "magician_type1_dungeon_walk.png",
        "sx": 24,
        "sy": 1146,
        "sw": 892,
        "sh": 1168,
        "scale": 0.25000000000000006
    },
    "magician_type1_right": {
        "img": "magician_type1_dungeon_walk.png",
        "sx": 945,
        "sy": 1148,
        "sw": 898,
        "sh": 1159,
        "scale": 0.25000000000000006,
        "rotation": -5
    },
    "magician_type1_2_down": {
        "img": "magician_type1_2_dungeon_walk.png",
        "sx": 297,
        "sy": 113,
        "sw": 733,
        "sh": 898,
        "scale": 0.25000000000000006
    },
    "magician_type1_2_up": {
        "img": "magician_type1_2_dungeon_walk.png",
        "sx": 1188,
        "sy": 113,
        "sw": 733,
        "sh": 898,
        "scale": 0.25000000000000006
    },
    "magician_type1_2_left": {
        "img": "magician_type1_2_dungeon_walk.png",
        "sx": 1219,
        "sy": 1009,
        "sw": 733,
        "sh": 898,
        "scale": 0.25000000000000006
    },
    "magician_type1_2_right": {
        "img": "magician_type1_2_dungeon_walk.png",
        "sx": 251,
        "sy": 1009,
        "sw": 733,
        "sh": 898,
        "scale": 0.25000000000000006
    },
    "magician_type1_3_down": {
        "img": "magician_type1_3_dungeon_walk.png",
        "sx": 55,
        "sy": -13,
        "sw": 988,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type1_3_up": {
        "img": "magician_type1_3_dungeon_walk.png",
        "sx": 1127,
        "sy": -13,
        "sw": 988,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type1_3_left": {
        "img": "magician_type1_3_dungeon_walk.png",
        "sx": 61,
        "sy": 990,
        "sw": 988,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type1_3_right": {
        "img": "magician_type1_3_dungeon_walk.png",
        "sx": 1104,
        "sy": 990,
        "sw": 988,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type1_4_down": {
        "img": "magician_type1_4_dungeon_walk.png",
        "sx": 43,
        "sy": 65,
        "sw": 913,
        "sh": 1056,
        "scale": 0.25000000000000006
    },
    "magician_type1_4_up": {
        "img": "magician_type1_4_dungeon_walk.png",
        "sx": 959,
        "sy": 65,
        "sw": 913,
        "sh": 1056,
        "scale": 0.25000000000000006
    },
    "magician_type1_4_left": {
        "img": "magician_type1_4_dungeon_walk.png",
        "sx": 959,
        "sy": 1134,
        "sw": 913,
        "sh": 1056,
        "scale": 0.25000000000000006
    },
    "magician_type1_4_right": {
        "img": "magician_type1_4_dungeon_walk.png",
        "sx": 45,
        "sy": 1134,
        "sw": 913,
        "sh": 1056,
        "scale": 0.25000000000000006
    },
    "magician_type2_down": {
        "img": "magician_type2_dungeon_walk.png",
        "sx": 81,
        "sy": 19,
        "sw": 850,
        "sh": 1117,
        "scale": 0.25000000000000006
    },
    "magician_type2_up": {
        "img": "magician_type2_dungeon_walk.png",
        "sx": 1018,
        "sy": 1122,
        "sw": 850,
        "sh": 1117,
        "scale": 0.25000000000000006
    },
    "magician_type2_left": {
        "img": "magician_type2_dungeon_walk.png",
        "sx": 81,
        "sy": 1143,
        "sw": 850,
        "sh": 1117,
        "scale": 0.25000000000000006
    },
    "magician_type2_right": {
        "img": "magician_type2_dungeon_walk.png",
        "sx": 981,
        "sy": 19,
        "sw": 850,
        "sh": 1117,
        "scale": 0.25000000000000006
    },
    "magician_type2_2_down": {
        "img": "magician_type2_2_dungeon_walk.png",
        "sx": 174,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_2_up": {
        "img": "magician_type2_2_dungeon_walk.png",
        "sx": 1149,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_2_left": {
        "img": "magician_type2_2_dungeon_walk.png",
        "sx": 1149,
        "sy": 983,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_2_right": {
        "img": "magician_type2_2_dungeon_walk.png",
        "sx": 214,
        "sy": 983,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_3_down": {
        "img": "magician_type2_3_dungeon_walk.png",
        "sx": 192,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_3_up": {
        "img": "magician_type2_3_dungeon_walk.png",
        "sx": 1112,
        "sy": 42,
        "sw": 970,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_3_left": {
        "img": "magician_type2_3_dungeon_walk.png",
        "sx": 1112,
        "sy": 1021,
        "sw": 970,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_3_right": {
        "img": "magician_type2_3_dungeon_walk.png",
        "sx": 108,
        "sy": 1021,
        "sw": 970,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type2_4_down": {
        "img": "magician_type2_4_dungeon_walk.png",
        "sx": -9,
        "sy": 31,
        "sw": 851,
        "sh": 1241,
        "scale": 0.25000000000000006
    },
    "magician_type2_4_up": {
        "img": "magician_type2_4_dungeon_walk.png",
        "sx": 831,
        "sy": 31,
        "sw": 851,
        "sh": 1241,
        "scale": 0.25000000000000006
    },
    "magician_type2_4_left": {
        "img": "magician_type2_4_dungeon_walk.png",
        "sx": 831,
        "sy": 1294,
        "sw": 851,
        "sh": 1252,
        "scale": 0.25000000000000006
    },
    "magician_type2_4_right": {
        "img": "magician_type2_4_dungeon_walk.png",
        "sx": 1,
        "sy": 1294,
        "sw": 851,
        "sh": 1252,
        "scale": 0.25000000000000006
    },
    "magician_type3_down": {
        "img": "magician_type3_dungeon_walk.png",
        "sx": 73,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_up": {
        "img": "magician_type3_dungeon_walk.png",
        "sx": 969,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_left": {
        "img": "magician_type3_dungeon_walk.png",
        "sx": 969,
        "sy": 1158,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_right": {
        "img": "magician_type3_dungeon_walk.png",
        "sx": 90,
        "sy": 1158,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_2_down": {
        "img": "magician_type3_2_dungeon_walk.png",
        "sx": 116,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_2_up": {
        "img": "magician_type3_2_dungeon_walk.png",
        "sx": 1126,
        "sy": 42,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_2_left": {
        "img": "magician_type3_2_dungeon_walk.png",
        "sx": 1135,
        "sy": 1042,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_2_right": {
        "img": "magician_type3_2_dungeon_walk.png",
        "sx": 121,
        "sy": 1042,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type3_3_down": {
        "img": "magician_type3_3_dungeon_walk.png",
        "sx": 114,
        "sy": 42,
        "sw": 835,
        "sh": 1087,
        "scale": 0.25000000000000006
    },
    "magician_type3_3_up": {
        "img": "magician_type3_3_dungeon_walk.png",
        "sx": 981,
        "sy": 42,
        "sw": 835,
        "sh": 1087,
        "scale": 0.25000000000000006
    },
    "magician_type3_3_left": {
        "img": "magician_type3_3_dungeon_walk.png",
        "sx": 981,
        "sy": 1137,
        "sw": 835,
        "sh": 1087,
        "scale": 0.25000000000000006
    },
    "magician_type3_3_right": {
        "img": "magician_type3_3_dungeon_walk.png",
        "sx": 107,
        "sy": 1137,
        "sw": 835,
        "sh": 1087,
        "scale": 0.25000000000000006
    },
    "magician_type4_down": {
        "img": "magician_type4_dungeon_walk.png",
        "sx": 64,
        "sy": 68,
        "sw": 835,
        "sh": 1086,
        "scale": 0.25000000000000006
    },
    "magician_type4_up": {
        "img": "magician_type4_dungeon_walk.png",
        "sx": 1006,
        "sy": 68,
        "sw": 835,
        "sh": 1086,
        "scale": 0.25000000000000006
    },
    "magician_type4_left": {
        "img": "magician_type4_dungeon_walk.png",
        "sx": 1006,
        "sy": 1186,
        "sw": 835,
        "sh": 1086,
        "scale": 0.25000000000000006
    },
    "magician_type4_right": {
        "img": "magician_type4_dungeon_walk.png",
        "sx": 81,
        "sy": 1186,
        "sw": 835,
        "sh": 1086,
        "scale": 0.25000000000000006
    },
    "magician_type4_2_down": {
        "img": "magician_type4_2_dungeon_walk.png",
        "sx": 70,
        "sy": 25,
        "sw": 937,
        "sh": 936,
        "scale": 0.25000000000000006
    },
    "magician_type4_2_up": {
        "img": "magician_type4_2_dungeon_walk.png",
        "sx": 1223,
        "sy": 25,
        "sw": 937,
        "sh": 936,
        "scale": 0.25000000000000006
    },
    "magician_type4_2_left": {
        "img": "magician_type4_2_dungeon_walk.png",
        "sx": 1223,
        "sy": 960,
        "sw": 937,
        "sh": 936,
        "scale": 0.25000000000000006
    },
    "magician_type4_2_right": {
        "img": "magician_type4_2_dungeon_walk.png",
        "sx": 78,
        "sy": 960,
        "sw": 937,
        "sh": 936,
        "scale": 0.25000000000000006
    },
    "magician_type4_3_down": {
        "img": "magician_type4_3_dungeon_walk.png",
        "sx": 170,
        "sy": 42,
        "sw": 821,
        "sh": 980,
        "scale": 0.25000000000000006
    },
    "magician_type4_3_up": {
        "img": "magician_type4_3_dungeon_walk.png",
        "sx": 1225,
        "sy": 42,
        "sw": 821,
        "sh": 980,
        "scale": 0.25000000000000006
    },
    "magician_type4_3_left": {
        "img": "magician_type4_3_dungeon_walk.png",
        "sx": 1239,
        "sy": 994,
        "sw": 821,
        "sh": 980,
        "scale": 0.25000000000000006
    },
    "magician_type4_3_right": {
        "img": "magician_type4_3_dungeon_walk.png",
        "sx": 159,
        "sy": 994,
        "sw": 821,
        "sh": 980,
        "scale": 0.25000000000000006
    },
    "magician_type4_4_down": {
        "img": "magician_type4_4_dungeon_walk.png",
        "sx": 207,
        "sy": 42,
        "sw": 754,
        "sh": 943,
        "scale": 0.25000000000000006
    },
    "magician_type4_4_up": {
        "img": "magician_type4_4_dungeon_walk.png",
        "sx": 1379,
        "sy": 42,
        "sw": 754,
        "sh": 943,
        "scale": 0.25000000000000006
    },
    "magician_type4_4_left": {
        "img": "magician_type4_4_dungeon_walk.png",
        "sx": 1379,
        "sy": 943,
        "sw": 754,
        "sh": 943,
        "scale": 0.25000000000000006
    },
    "magician_type4_4_right": {
        "img": "magician_type4_4_dungeon_walk.png",
        "sx": 179,
        "sy": 943,
        "sw": 754,
        "sh": 943,
        "scale": 0.25000000000000006
    },
    "magician_type5_down": {
        "img": "magician_type5_dungeon_walk.png",
        "sx": 68,
        "sy": 65,
        "sw": 835,
        "sh": 1051,
        "scale": 0.25000000000000006
    },
    "magician_type5_up": {
        "img": "magician_type5_dungeon_walk.png",
        "sx": 992,
        "sy": 65,
        "sw": 835,
        "sh": 1051,
        "scale": 0.25000000000000006
    },
    "magician_type5_left": {
        "img": "magician_type5_dungeon_walk.png",
        "sx": 977,
        "sy": 1155,
        "sw": 835,
        "sh": 1051,
        "scale": 0.25000000000000006
    },
    "magician_type5_right": {
        "img": "magician_type5_dungeon_walk.png",
        "sx": 130,
        "sy": 1155,
        "sw": 835,
        "sh": 1051,
        "scale": 0.25000000000000006
    },
    "magician_type5_2_down": {
        "img": "magician_type5_2_dungeon_walk.png",
        "sx": 97,
        "sy": 58,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type5_2_up": {
        "img": "magician_type5_2_dungeon_walk.png",
        "sx": 1153,
        "sy": 58,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type5_2_left": {
        "img": "magician_type5_2_dungeon_walk.png",
        "sx": 103,
        "sy": 1058,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type5_2_right": {
        "img": "magician_type5_2_dungeon_walk.png",
        "sx": 1144,
        "sy": 1058,
        "sw": 835,
        "sh": 1014,
        "scale": 0.25000000000000006
    },
    "magician_type5_3_down": {
        "img": "magician_type5_3_dungeon_walk.png",
        "sx": 44,
        "sy": 59,
        "sw": 835,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "magician_type5_3_up": {
        "img": "magician_type5_3_dungeon_walk.png",
        "sx": 956,
        "sy": 59,
        "sw": 835,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "magician_type5_3_left": {
        "img": "magician_type5_3_dungeon_walk.png",
        "sx": 113,
        "sy": 1218,
        "sw": 835,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "magician_type5_3_right": {
        "img": "magician_type5_3_dungeon_walk.png",
        "sx": 910,
        "sy": 1218,
        "sw": 835,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "spirit_down": {
        "img": "spirit_dungeon_walk.png",
        "sx": 99,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_up": {
        "img": "spirit_dungeon_walk.png",
        "sx": 997,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_left": {
        "img": "spirit_dungeon_walk.png",
        "sx": 99,
        "sy": 1249,
        "sw": 697,
        "sh": 1012,
        "scale": 0.25000000000000006
    },
    "spirit_right": {
        "img": "spirit_dungeon_walk.png",
        "sx": 970,
        "sy": 1249,
        "sw": 697,
        "sh": 1012,
        "scale": 0.25000000000000006
    },
    "spirit_type1_down": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 45,
        "sy": 6,
        "sw": 791,
        "sh": 1156,
        "scale": 0.25000000000000006
    },
    "spirit_type1_up": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 945,
        "sy": 6,
        "sw": 791,
        "sh": 1156,
        "scale": 0.25000000000000006
    },
    "spirit_type1_left": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 1012,
        "sy": 1249,
        "sw": 697,
        "sh": 1125,
        "scale": 0.25000000000000006
    },
    "spirit_type1_right": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 92,
        "sy": 1249,
        "sw": 697,
        "sh": 1125,
        "scale": 0.25000000000000006
    },
    "spirit_type1_2_down": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 98,
        "sy": 113,
        "sw": 814,
        "sh": 1052,
        "scale": 0.25000000000000006
    },
    "spirit_type1_2_up": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 948,
        "sy": 113,
        "sw": 814,
        "sh": 1052,
        "scale": 0.25000000000000006
    },
    "spirit_type1_2_left": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 973,
        "sy": 1177,
        "sw": 814,
        "sh": 1052,
        "scale": 0.25000000000000006
    },
    "spirit_type1_2_right": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 78,
        "sy": 1177,
        "sw": 814,
        "sh": 1052,
        "scale": 0.25000000000000006
    },
    "spirit_type2_down": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 11,
        "sy": 24,
        "sw": 841,
        "sh": 1137,
        "scale": 0.25000000000000006
    },
    "spirit_type2_up": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 953,
        "sy": 21,
        "sw": 829,
        "sh": 1136,
        "scale": 0.25000000000000006
    },
    "spirit_type2_left": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 953,
        "sy": 1217,
        "sw": 829,
        "sh": 1136,
        "scale": 0.25000000000000006
    },
    "spirit_type2_right": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 11,
        "sy": 1217,
        "sw": 829,
        "sh": 1136,
        "scale": 0.25000000000000006
    },
    "spirit_type2_2_down": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 119,
        "sy": 63,
        "sw": 743,
        "sh": 897,
        "scale": 0.25000000000000006
    },
    "spirit_type2_2_up": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 1338,
        "sy": 63,
        "sw": 697,
        "sh": 888,
        "scale": 0.25000000000000006
    },
    "spirit_type2_2_left": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 1338,
        "sy": 952,
        "sw": 697,
        "sh": 888,
        "scale": 0.25000000000000006
    },
    "spirit_type2_2_right": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 178,
        "sy": 952,
        "sw": 697,
        "sh": 888,
        "scale": 0.25000000000000006
    },
    "spirit_type2_3_down": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 36,
        "sy": 42,
        "sw": 947,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type2_3_up": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 1042,
        "sy": 48,
        "sw": 935,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type2_3_left": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 85,
        "sy": 1069,
        "sw": 947,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type2_3_right": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 1032,
        "sy": 1069,
        "sw": 947,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type3_down": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 25,
        "sy": 14,
        "sw": 790,
        "sh": 1146,
        "scale": 0.25000000000000006
    },
    "spirit_type3_up": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 923,
        "sy": 14,
        "sw": 790,
        "sh": 1146,
        "scale": 0.25000000000000006
    },
    "spirit_type3_left": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 986,
        "sy": 1247,
        "sw": 715,
        "sh": 1149,
        "scale": 0.25000000000000006
    },
    "spirit_type3_right": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 83,
        "sy": 1237,
        "sw": 715,
        "sh": 1149,
        "scale": 0.25000000000000006
    },
    "spirit_type3_2_down": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 99,
        "sy": 37,
        "sw": 734,
        "sh": 1068,
        "scale": 0.25000000000000006
    },
    "spirit_type3_2_up": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 1065,
        "sy": 35,
        "sw": 722,
        "sh": 1076,
        "scale": 0.25000000000000006
    },
    "spirit_type3_2_left": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 113,
        "sy": 1150,
        "sw": 697,
        "sh": 1096,
        "scale": 0.25000000000000006
    },
    "spirit_type3_2_right": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 1066,
        "sy": 1150,
        "sw": 697,
        "sh": 1096,
        "scale": 0.25000000000000006
    },
    "spirit_type4_down": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 5,
        "sy": -13,
        "sw": 883,
        "sh": 1182,
        "scale": 0.25000000000000006
    },
    "spirit_type4_up": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 957,
        "sy": 3,
        "sw": 865,
        "sh": 1171,
        "scale": 0.25000000000000006
    },
    "spirit_type4_left": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 99,
        "sy": 1195,
        "sw": 718,
        "sh": 1163,
        "scale": 0.25000000000000006
    },
    "spirit_type4_right": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 1005,
        "sy": 1195,
        "sw": 745,
        "sh": 1163,
        "scale": 0.25000000000000006
    },
    "spirit_type4_2_down": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 141,
        "sy": 46,
        "sw": 881,
        "sh": 949,
        "scale": 0.25000000000000006
    },
    "spirit_type4_2_up": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 1203,
        "sy": 46,
        "sw": 881,
        "sh": 949,
        "scale": 0.25000000000000006
    },
    "spirit_type4_2_left": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 1215,
        "sy": 978,
        "sw": 881,
        "sh": 949,
        "scale": 0.25000000000000006
    },
    "spirit_type4_2_right": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 124,
        "sy": 978,
        "sw": 881,
        "sh": 949,
        "scale": 0.25000000000000006
    },
    "spirit_type4_3_down": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 11,
        "sy": 14,
        "sw": 889,
        "sh": 991,
        "scale": 0.25000000000000006
    },
    "spirit_type4_3_up": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 1168,
        "sy": 14,
        "sw": 901,
        "sh": 991,
        "scale": 0.25000000000000006
    },
    "spirit_type4_3_left": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 209,
        "sy": 1007,
        "sw": 505,
        "sh": 991,
        "scale": 0.25000000000000006
    },
    "spirit_type4_3_right": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 936,
        "sy": 1007,
        "sw": 497,
        "sh": 991,
        "scale": 0.25000000000000006
    },
    "spirit_type5_down": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 33,
        "sy": -10,
        "sw": 869,
        "sh": 1155,
        "scale": 0.25000000000000006
    },
    "spirit_type5_up": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 933,
        "sy": -10,
        "sw": 869,
        "sh": 1155,
        "scale": 0.25000000000000006
    },
    "spirit_type5_left": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 33,
        "sy": 1201,
        "sw": 869,
        "sh": 1155,
        "scale": 0.25000000000000006
    },
    "spirit_type5_right": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 933,
        "sy": 1201,
        "sw": 869,
        "sh": 1155,
        "scale": 0.25000000000000006
    },
    "spirit_type5_2_down": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 232,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type5_2_up": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 1219,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type5_2_left": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 232,
        "sy": 1008,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type5_2_right": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 1198,
        "sy": 1008,
        "sw": 697,
        "sh": 1005,
        "scale": 0.25000000000000006
    },
    "spirit_type5_3_down": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 113,
        "sy": 63,
        "sw": 749,
        "sh": 1060,
        "scale": 0.25000000000000006
    },
    "spirit_type5_3_up": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 978,
        "sy": 58,
        "sw": 770,
        "sh": 1067,
        "scale": 0.25000000000000006
    },
    "spirit_type5_3_left": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 57,
        "sy": 1158,
        "sw": 794,
        "sh": 1060,
        "scale": 0.25000000000000006
    },
    "spirit_type5_3_right": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 1015,
        "sy": 1158,
        "sw": 794,
        "sh": 1060,
        "scale": 0.25000000000000006
    },
    "dragon_down": {
        "img": "dragon_dungeon_walk.png",
        "sx": 60,
        "sy": 63,
        "sw": 870,
        "sh": 864,
        "scale": 0.25000000000000006
    },
    "dragon_up": {
        "img": "dragon_dungeon_walk.png",
        "sx": 1045,
        "sy": 73,
        "sw": 882,
        "sh": 940,
        "scale": 0.25000000000000006
    },
    "dragon_left": {
        "img": "dragon_dungeon_walk.png",
        "sx": 60,
        "sy": 1175,
        "sw": 870,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_right": {
        "img": "dragon_dungeon_walk.png",
        "sx": 1053,
        "sy": 1175,
        "sw": 870,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type1_down": {
        "img": "dragon_type1_dungeon_walk.png",
        "sx": 71,
        "sy": 54,
        "sw": 1045,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type1_up": {
        "img": "dragon_type1_dungeon_walk.png",
        "sx": 1146,
        "sy": 54,
        "sw": 1045,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type1_left": {
        "img": "dragon_type1_dungeon_walk.png",
        "sx": 59,
        "sy": 977,
        "sw": 1045,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type1_right": {
        "img": "dragon_type1_dungeon_walk.png",
        "sx": 1119,
        "sy": 977,
        "sw": 1045,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type1_2_down": {
        "img": "dragon_type1_2_dungeon_walk.png",
        "sx": 13,
        "sy": 21,
        "sw": 1004,
        "sh": 1053,
        "scale": 0.25000000000000006
    },
    "dragon_type1_2_up": {
        "img": "dragon_type1_2_dungeon_walk.png",
        "sx": 1002,
        "sy": 21,
        "sw": 1004,
        "sh": 1053,
        "scale": 0.25000000000000006
    },
    "dragon_type1_2_left": {
        "img": "dragon_type1_2_dungeon_walk.png",
        "sx": 4,
        "sy": 1098,
        "sw": 1004,
        "sh": 993,
        "scale": 0.25000000000000006
    },
    "dragon_type1_2_right": {
        "img": "dragon_type1_2_dungeon_walk.png",
        "sx": 982,
        "sy": 1098,
        "sw": 1004,
        "sh": 993,
        "scale": 0.25000000000000006
    },
    "dragon_type2_down": {
        "img": "dragon_type2_dungeon_walk.png",
        "sx": 55,
        "sy": 44,
        "sw": 974,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "dragon_type2_up": {
        "img": "dragon_type2_dungeon_walk.png",
        "sx": 1123,
        "sy": 44,
        "sw": 974,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "dragon_type2_left": {
        "img": "dragon_type2_dungeon_walk.png",
        "sx": 1123,
        "sy": 998,
        "sw": 974,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "dragon_type2_right": {
        "img": "dragon_type2_dungeon_walk.png",
        "sx": 53,
        "sy": 998,
        "sw": 974,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "dragon_type2_2_down": {
        "img": "dragon_type2_2_dungeon_walk.png",
        "sx": 22,
        "sy": 16,
        "sw": 933,
        "sh": 995,
        "scale": 0.25000000000000006
    },
    "dragon_type2_2_up": {
        "img": "dragon_type2_2_dungeon_walk.png",
        "sx": 1021,
        "sy": 16,
        "sw": 933,
        "sh": 995,
        "scale": 0.25000000000000006
    },
    "dragon_type2_2_left": {
        "img": "dragon_type2_2_dungeon_walk.png",
        "sx": 30,
        "sy": 1115,
        "sw": 914,
        "sh": 995,
        "scale": 0.25000000000000006
    },
    "dragon_type2_2_right": {
        "img": "dragon_type2_2_dungeon_walk.png",
        "sx": 1030,
        "sy": 1115,
        "sw": 914,
        "sh": 995,
        "scale": 0.25000000000000006
    },
    "dragon_type2_3_down": {
        "img": "dragon_type2_3_dungeon_walk.png",
        "sx": 39,
        "sy": 67,
        "sw": 945,
        "sh": 999,
        "scale": 0.25000000000000006
    },
    "dragon_type2_3_up": {
        "img": "dragon_type2_3_dungeon_walk.png",
        "sx": 1039,
        "sy": 86,
        "sw": 945,
        "sh": 999,
        "scale": 0.25000000000000006
    },
    "dragon_type2_3_left": {
        "img": "dragon_type2_3_dungeon_walk.png",
        "sx": 17,
        "sy": 1086,
        "sw": 945,
        "sh": 999,
        "scale": 0.25000000000000006
    },
    "dragon_type2_3_right": {
        "img": "dragon_type2_3_dungeon_walk.png",
        "sx": 1053,
        "sy": 1086,
        "sw": 945,
        "sh": 999,
        "scale": 0.25000000000000006
    },
    "dragon_type3_down": {
        "img": "dragon_type3_dungeon_walk.png",
        "sx": 104,
        "sy": 10,
        "sw": 1003,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "dragon_type3_up": {
        "img": "dragon_type3_dungeon_walk.png",
        "sx": 1195,
        "sy": 10,
        "sw": 1003,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "dragon_type3_left": {
        "img": "dragon_type3_dungeon_walk.png",
        "sx": 114,
        "sy": 870,
        "sw": 1003,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type3_right": {
        "img": "dragon_type3_dungeon_walk.png",
        "sx": 1201,
        "sy": 870,
        "sw": 1003,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type3_2_down": {
        "img": "dragon_type3_2_dungeon_walk.png",
        "sx": 3,
        "sy": 20,
        "sw": 981,
        "sh": 1048,
        "scale": 0.25000000000000006
    },
    "dragon_type3_2_up": {
        "img": "dragon_type3_2_dungeon_walk.png",
        "sx": 1004,
        "sy": 32,
        "sw": 981,
        "sh": 1048,
        "scale": 0.25000000000000006
    },
    "dragon_type3_2_left": {
        "img": "dragon_type3_2_dungeon_walk.png",
        "sx": 16,
        "sy": 1062,
        "sw": 981,
        "sh": 1089,
        "scale": 0.25000000000000006
    },
    "dragon_type3_2_right": {
        "img": "dragon_type3_2_dungeon_walk.png",
        "sx": 1004,
        "sy": 1062,
        "sw": 981,
        "sh": 1089,
        "scale": 0.25000000000000006
    },
    "dragon_type4_down": {
        "img": "dragon_type4_dungeon_walk.png",
        "sx": 43,
        "sy": 8,
        "sw": 1098,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type4_up": {
        "img": "dragon_type4_dungeon_walk.png",
        "sx": 1143,
        "sy": 8,
        "sw": 1098,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type4_left": {
        "img": "dragon_type4_dungeon_walk.png",
        "sx": 34,
        "sy": 929,
        "sw": 1098,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type4_right": {
        "img": "dragon_type4_dungeon_walk.png",
        "sx": 1106,
        "sy": 929,
        "sw": 1098,
        "sh": 927,
        "scale": 0.25000000000000006
    },
    "dragon_type4_2_down": {
        "img": "dragon_type4_2_dungeon_walk.png",
        "sx": 14,
        "sy": 10,
        "sw": 983,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "dragon_type4_2_up": {
        "img": "dragon_type4_2_dungeon_walk.png",
        "sx": 1008,
        "sy": 10,
        "sw": 983,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "dragon_type4_2_left": {
        "img": "dragon_type4_2_dungeon_walk.png",
        "sx": 5,
        "sy": 1076,
        "sw": 983,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "dragon_type4_2_right": {
        "img": "dragon_type4_2_dungeon_walk.png",
        "sx": 1008,
        "sy": 1076,
        "sw": 983,
        "sh": 1120,
        "scale": 0.25000000000000006
    },
    "dragon_type5_down": {
        "img": "dragon_type5_dungeon_walk.png",
        "sx": 14,
        "sy": -3,
        "sw": 1396,
        "sh": 768,
        "scale": 0.25000000000000006
    },
    "dragon_type5_up": {
        "img": "dragon_type5_dungeon_walk.png",
        "sx": 1400,
        "sy": -3,
        "sw": 1396,
        "sh": 768,
        "scale": 0.25000000000000006
    },
    "dragon_type5_left": {
        "img": "dragon_type5_dungeon_walk.png",
        "sx": 1658,
        "sy": 743,
        "sw": 1134,
        "sh": 846,
        "scale": 0.25000000000000006
    },
    "dragon_type5_right": {
        "img": "dragon_type5_dungeon_walk.png",
        "sx": -12,
        "sy": 743,
        "sw": 1134,
        "sh": 846,
        "scale": 0.25000000000000006
    },
    "dragon_type5_2_down": {
        "img": "dragon_type5_2_dungeon_walk.png",
        "sx": 41,
        "sy": 18,
        "sw": 947,
        "sh": 1040,
        "scale": 0.25000000000000006
    },
    "dragon_type5_2_up": {
        "img": "dragon_type5_2_dungeon_walk.png",
        "sx": 1044,
        "sy": 18,
        "sw": 947,
        "sh": 1040,
        "scale": 0.25000000000000006
    },
    "dragon_type5_2_left": {
        "img": "dragon_type5_2_dungeon_walk.png",
        "sx": 1081,
        "sy": 1080,
        "sw": 915,
        "sh": 1040,
        "scale": 0.25000000000000006
    },
    "dragon_type5_2_right": {
        "img": "dragon_type5_2_dungeon_walk.png",
        "sx": 36,
        "sy": 1080,
        "sw": 915,
        "sh": 1040,
        "scale": 0.25000000000000006
    },
    "machine_down": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 1100, "sw": 603, "sh": 864, "scale": 0.25 },
    "machine_up": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 90, "sw": 603, "sh": 864, "scale": 0.25 },
    "machine_left": { "img": "machine_dungeon_walk.png", "sx": 30, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.25 },
    "machine_right": { "img": "machine_dungeon_walk.png", "sx": 1391, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.25 },
    "machine_type1_down": {
        "img": "machine_type1_dungeon_walk.png",
        "sx": 90,
        "sy": 17,
        "sw": 762,
        "sh": 1084,
        "scale": 0.25
    },
    "machine_type1_up": {
        "img": "machine_type1_dungeon_walk.png",
        "sx": 1089,
        "sy": 17,
        "sw": 762,
        "sh": 1084,
        "scale": 0.25
    },
    "machine_type1_left": {
        "img": "machine_type1_dungeon_walk.png",
        "sx": 1142,
        "sy": 1079,
        "sw": 762,
        "sh": 1084,
        "scale": 0.25
    },
    "machine_type1_right": {
        "img": "machine_type1_dungeon_walk.png",
        "sx": 84,
        "sy": 1079,
        "sw": 762,
        "sh": 1084,
        "scale": 0.25
    },
    "machine_type1_2_down": {
        "img": "machine_type1_2_dungeon_walk.png",
        "sx": 78,
        "sy": 100,
        "sw": 809,
        "sh": 1067,
        "scale": 0.25
    },
    "machine_type1_2_up": {
        "img": "machine_type1_2_dungeon_walk.png",
        "sx": 964,
        "sy": 100,
        "sw": 809,
        "sh": 1067,
        "scale": 0.25
    },
    "machine_type1_2_left": {
        "img": "machine_type1_2_dungeon_walk.png",
        "sx": 78,
        "sy": 1178,
        "sw": 809,
        "sh": 1067,
        "scale": 0.25
    },
    "machine_type1_2_right": {
        "img": "machine_type1_2_dungeon_walk.png",
        "sx": 1018,
        "sy": 1178,
        "sw": 809,
        "sh": 1067,
        "scale": 0.25
    },
    "machine_type2_down": {
        "img": "machine_type2_dungeon_walk.png",
        "sx": 57,
        "sy": 72,
        "sw": 795,
        "sh": 1048,
        "scale": 0.25
    },
    "machine_type2_up": {
        "img": "machine_type2_dungeon_walk.png",
        "sx": 1057,
        "sy": 72,
        "sw": 847,
        "sh": 1048,
        "scale": 0.25
    },
    "machine_type2_left": {
        "img": "machine_type2_dungeon_walk.png",
        "sx": 118,
        "sy": 1114,
        "sw": 795,
        "sh": 1048,
        "scale": 0.25
    },
    "machine_type2_right": {
        "img": "machine_type2_dungeon_walk.png",
        "sx": 1018,
        "sy": 1114,
        "sw": 795,
        "sh": 1048,
        "scale": 0.25
    },
    "machine_type2_2_down": {
        "img": "machine_type2_2_dungeon_walk.png",
        "sx": 179,
        "sy": 113,
        "sw": 765,
        "sh": 983,
        "scale": 0.25
    },
    "machine_type2_2_up": {
        "img": "machine_type2_2_dungeon_walk.png",
        "sx": 979,
        "sy": 113,
        "sw": 765,
        "sh": 983,
        "scale": 0.25
    },
    "machine_type2_2_left": {
        "img": "machine_type2_2_dungeon_walk.png",
        "sx": 179,
        "sy": 1165,
        "sw": 765,
        "sh": 983,
        "scale": 0.25
    },
    "machine_type2_2_right": {
        "img": "machine_type2_2_dungeon_walk.png",
        "sx": 1077,
        "sy": 1165,
        "sw": 765,
        "sh": 983,
        "scale": 0.25
    },
    "machine_type3_down": {
        "img": "machine_type3_dungeon_walk.png",
        "sx": -1,
        "sy": 100,
        "sw": 850,
        "sh": 1064,
        "scale": 0.25
    },
    "machine_type3_up": {
        "img": "machine_type3_dungeon_walk.png",
        "sx": 1009,
        "sy": 100,
        "sw": 850,
        "sh": 1064,
        "scale": 0.25
    },
    "machine_type3_left": {
        "img": "machine_type3_dungeon_walk.png",
        "sx": 84,
        "sy": 1200,
        "sw": 850,
        "sh": 1089,
        "scale": 0.25
    },
    "machine_type3_right": {
        "img": "machine_type3_dungeon_walk.png",
        "sx": 940,
        "sy": 1200,
        "sw": 850,
        "sh": 1089,
        "scale": 0.25
    },
    "machine_type3_2_down": {
        "img": "machine_type3_2_dungeon_walk.png",
        "sx": 124,
        "sy": -2,
        "sw": 745,
        "sh": 1069,
        "scale": 0.25
    },
    "machine_type3_2_up": {
        "img": "machine_type3_2_dungeon_walk.png",
        "sx": 1127,
        "sy": -2,
        "sw": 745,
        "sh": 1069,
        "scale": 0.25
    },
    "machine_type3_2_left": {
        "img": "machine_type3_2_dungeon_walk.png",
        "sx": 1127,
        "sy": 1079,
        "sw": 745,
        "sh": 1069,
        "scale": 0.25
    },
    "machine_type3_2_right": {
        "img": "machine_type3_2_dungeon_walk.png",
        "sx": 127,
        "sy": 1079,
        "sw": 745,
        "sh": 1069,
        "scale": 0.25
    },
    "machine_type4_down": {
        "img": "machine_type4_dungeon_walk.png",
        "sx": 71,
        "sy": 8,
        "sw": 775,
        "sh": 1042,
        "scale": 0.25
    },
    "machine_type4_up": {
        "img": "machine_type4_dungeon_walk.png",
        "sx": 1123,
        "sy": 8,
        "sw": 775,
        "sh": 1042,
        "scale": 0.25
    },
    "machine_type4_left": {
        "img": "machine_type4_dungeon_walk.png",
        "sx": 207,
        "sy": 1046,
        "sw": 775,
        "sh": 1059,
        "scale": 0.25
    },
    "machine_type4_right": {
        "img": "machine_type4_dungeon_walk.png",
        "sx": 1083,
        "sy": 1046,
        "sw": 775,
        "sh": 1059,
        "scale": 0.25
    },
    "machine_type4_2_down": {
        "img": "machine_type4_2_dungeon_walk.png",
        "sx": 56,
        "sy": 30,
        "sw": 848,
        "sh": 1100,
        "scale": 0.25
    },
    "machine_type4_2_up": {
        "img": "machine_type4_2_dungeon_walk.png",
        "sx": 998,
        "sy": 30,
        "sw": 848,
        "sh": 1100,
        "scale": 0.25
    },
    "machine_type4_2_left": {
        "img": "machine_type4_2_dungeon_walk.png",
        "sx": 998,
        "sy": 1147,
        "sw": 848,
        "sh": 1100,
        "scale": 0.25
    },
    "machine_type4_2_right": {
        "img": "machine_type4_2_dungeon_walk.png",
        "sx": 81,
        "sy": 1147,
        "sw": 848,
        "sh": 1100,
        "scale": 0.25
    },
    "machine_type5_down": {
        "img": "machine_type5_dungeon_walk.png",
        "sx": -6,
        "sy": 24,
        "sw": 866,
        "sh": 1124,
        "scale": 0.25
    },
    "machine_type5_up": {
        "img": "machine_type5_dungeon_walk.png",
        "sx": 945,
        "sy": 24,
        "sw": 866,
        "sh": 1124,
        "scale": 0.25
    },
    "machine_type5_left": {
        "img": "machine_type5_dungeon_walk.png",
        "sx": 945,
        "sy": 1167,
        "sw": 866,
        "sh": 1124,
        "scale": 0.25
    },
    "machine_type5_right": {
        "img": "machine_type5_dungeon_walk.png",
        "sx": 49,
        "sy": 1167,
        "sw": 866,
        "sh": 1124,
        "scale": 0.25
    },
    "machine_type5_2_down": {
        "img": "machine_type5_2_dungeon_walk.png",
        "sx": 49,
        "sy": 100,
        "sw": 801,
        "sh": 1028,
        "scale": 0.25
    },
    "machine_type5_2_up": {
        "img": "machine_type5_2_dungeon_walk.png",
        "sx": 942,
        "sy": 100,
        "sw": 801,
        "sh": 1028,
        "scale": 0.25
    },
    "machine_type5_2_left": {
        "img": "machine_type5_2_dungeon_walk.png",
        "sx": 942,
        "sy": 1169,
        "sw": 801,
        "sh": 1179,
        "scale": 0.25
    },
    "machine_type5_2_right": {
        "img": "machine_type5_2_dungeon_walk.png",
        "sx": 116,
        "sy": 1169,
        "sw": 801,
        "sh": 1179,
        "scale": 0.25
    },
    "machine_type5_3_down": {
        "img": "machine_type5_3_dungeon_walk.png",
        "sx": 37,
        "sy": 41,
        "sw": 802,
        "sh": 1168,
        "scale": 0.25
    },
    "machine_type5_3_up": {
        "img": "machine_type5_3_dungeon_walk.png",
        "sx": 928,
        "sy": 41,
        "sw": 802,
        "sh": 1168,
        "scale": 0.25
    },
    "machine_type5_3_left": {
        "img": "machine_type5_3_dungeon_walk.png",
        "sx": 928,
        "sy": 1234,
        "sw": 802,
        "sh": 1168,
        "scale": 0.25
    },
    "machine_type5_3_right": {
        "img": "machine_type5_3_dungeon_walk.png",
        "sx": 99,
        "sy": 1234,
        "sw": 802,
        "sh": 1168,
        "scale": 0.25
    },
    "stone_down": {
        "img": "stone_dungeon_walk.png",
        "sx": 94,
        "sy": 137,
        "sw": 836,
        "sh": 920,
        "scale": 0.25000000000000006
    },
    "stone_up": {
        "img": "stone_dungeon_walk.png",
        "sx": 998,
        "sy": 137,
        "sw": 836,
        "sh": 919,
        "scale": 0.25000000000000006
    },
    "stone_left": {
        "img": "stone_dungeon_walk.png",
        "sx": 94,
        "sy": 1156,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_right": {
        "img": "stone_dungeon_walk.png",
        "sx": 956,
        "sy": 1156,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type1_down": {
        "img": "stone_type1_dungeon_walk.png",
        "sx": 22,
        "sy": 137,
        "sw": 945,
        "sh": 919,
        "scale": 0.25000000000000006
    },
    "stone_type1_up": {
        "img": "stone_type1_dungeon_walk.png",
        "sx": 984,
        "sy": 137,
        "sw": 926,
        "sh": 919,
        "scale": 0.25000000000000006
    },
    "stone_type1_left": {
        "img": "stone_type1_dungeon_walk.png",
        "sx": 171,
        "sy": 1178,
        "sw": 735,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type1_right": {
        "img": "stone_type1_dungeon_walk.png",
        "sx": 1058,
        "sy": 1180,
        "sw": 746,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type1_2_down": {
        "img": "stone_type1_2_dungeon_walk.png",
        "sx": 52,
        "sy": 120,
        "sw": 870,
        "sh": 937,
        "scale": 0.25000000000000006
    },
    "stone_type1_2_up": {
        "img": "stone_type1_2_dungeon_walk.png",
        "sx": 979,
        "sy": 137,
        "sw": 894,
        "sh": 919,
        "scale": 0.25000000000000006
    },
    "stone_type1_2_left": {
        "img": "stone_type1_2_dungeon_walk.png",
        "sx": 93,
        "sy": 1156,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type1_2_right": {
        "img": "stone_type1_2_dungeon_walk.png",
        "sx": 971,
        "sy": 1156,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type2_down": {
        "img": "stone_type2_dungeon_walk.png",
        "sx": 40,
        "sy": 85,
        "sw": 900,
        "sh": 999,
        "scale": 0.25000000000000006
    },
    "stone_type2_up": {
        "img": "stone_type2_dungeon_walk.png",
        "sx": 998,
        "sy": 78,
        "sw": 925,
        "sh": 1003,
        "scale": 0.25000000000000006
    },
    "stone_type2_left": {
        "img": "stone_type2_dungeon_walk.png",
        "sx": 1053,
        "sy": 1146,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type2_right": {
        "img": "stone_type2_dungeon_walk.png",
        "sx": 75,
        "sy": 1146,
        "sw": 843,
        "sh": 983,
        "scale": 0.25000000000000006
    },
    "stone_type2_2_down": {
        "img": "stone_type2_2_dungeon_walk.png",
        "sx": 11,
        "sy": 120,
        "sw": 926,
        "sh": 975,
        "scale": 0.25000000000000006
    },
    "stone_type2_2_up": {
        "img": "stone_type2_2_dungeon_walk.png",
        "sx": 962,
        "sy": 123,
        "sw": 911,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "stone_type2_2_left": {
        "img": "stone_type2_2_dungeon_walk.png",
        "sx": 962,
        "sy": 1173,
        "sw": 911,
        "sh": 1047,
        "scale": 0.25000000000000006
    },
    "stone_type2_2_right": {
        "img": "stone_type2_2_dungeon_walk.png",
        "sx": 51,
        "sy": 1173,
        "sw": 911,
        "sh": 1047,
        "scale": 0.25000000000000006
    },
    "stone_type3_down": {
        "img": "stone_type3_dungeon_walk.png",
        "sx": 61,
        "sy": 43,
        "sw": 892,
        "sh": 1099,
        "scale": 0.25000000000000006
    },
    "stone_type3_up": {
        "img": "stone_type3_dungeon_walk.png",
        "sx": 1000,
        "sy": 43,
        "sw": 892,
        "sh": 1099,
        "scale": 0.25000000000000006
    },
    "stone_type3_left": {
        "img": "stone_type3_dungeon_walk.png",
        "sx": 61,
        "sy": 1116,
        "sw": 892,
        "sh": 1099,
        "scale": 0.25000000000000006
    },
    "stone_type3_right": {
        "img": "stone_type3_dungeon_walk.png",
        "sx": 996,
        "sy": 1116,
        "sw": 892,
        "sh": 1099,
        "scale": 0.25000000000000006
    },
    "stone_type3_2_down": {
        "img": "stone_type3_2_dungeon_walk.png",
        "sx": 41,
        "sy": 72,
        "sw": 1001,
        "sh": 936,
        "scale": 0.25000000000000006
    },
    "stone_type3_2_up": {
        "img": "stone_type3_2_dungeon_walk.png",
        "sx": 1110,
        "sy": 45,
        "sw": 1001,
        "sh": 961,
        "scale": 0.25000000000000006
    },
    "stone_type3_2_left": {
        "img": "stone_type3_2_dungeon_walk.png",
        "sx": 41,
        "sy": 1007,
        "sw": 1001,
        "sh": 1016,
        "scale": 0.25000000000000006
    },
    "stone_type3_2_right": {
        "img": "stone_type3_2_dungeon_walk.png",
        "sx": 1125,
        "sy": 1007,
        "sw": 1001,
        "sh": 1016,
        "scale": 0.25000000000000006
    },
    "stone_type4_down": {
        "img": "stone_type4_dungeon_walk.png",
        "sx": 0,
        "sy": 22,
        "sw": 883,
        "sh": 1070,
        "scale": 0.25000000000000006
    },
    "stone_type4_up": {
        "img": "stone_type4_dungeon_walk.png",
        "sx": 965,
        "sy": 22,
        "sw": 883,
        "sh": 1070,
        "scale": 0.25000000000000006
    },
    "stone_type4_left": {
        "img": "stone_type4_dungeon_walk.png",
        "sx": 965,
        "sy": 1146,
        "sw": 883,
        "sh": 1110,
        "scale": 0.25000000000000006
    },
    "stone_type4_right": {
        "img": "stone_type4_dungeon_walk.png",
        "sx": 38,
        "sy": 1146,
        "sw": 883,
        "sh": 1110,
        "scale": 0.25000000000000006
    },
    "stone_type4_2_down": {
        "img": "stone_type4_2_dungeon_walk.png",
        "sx": 2,
        "sy": 49,
        "sw": 936,
        "sh": 1038,
        "scale": 0.25000000000000006
    },
    "stone_type4_2_up": {
        "img": "stone_type4_2_dungeon_walk.png",
        "sx": 979,
        "sy": 49,
        "sw": 936,
        "sh": 1038,
        "scale": 0.25000000000000006
    },
    "stone_type4_2_left": {
        "img": "stone_type4_2_dungeon_walk.png",
        "sx": 2,
        "sy": 1121,
        "sw": 936,
        "sh": 1076,
        "scale": 0.25000000000000006
    },
    "stone_type4_2_right": {
        "img": "stone_type4_2_dungeon_walk.png",
        "sx": 1002,
        "sy": 1121,
        "sw": 936,
        "sh": 1076,
        "scale": 0.25000000000000006
    },
    "stone_type4_3_down": {
        "img": "stone_type4_3_dungeon_walk.png",
        "sx": 7,
        "sy": 8,
        "sw": 936,
        "sh": 1144,
        "scale": 0.25000000000000006
    },
    "stone_type4_3_up": {
        "img": "stone_type4_3_dungeon_walk.png",
        "sx": 961,
        "sy": 8,
        "sw": 936,
        "sh": 1144,
        "scale": 0.25000000000000006
    },
    "stone_type4_3_left": {
        "img": "stone_type4_3_dungeon_walk.png",
        "sx": 29,
        "sy": 1127,
        "sw": 936,
        "sh": 1144,
        "scale": 0.25000000000000006
    },
    "stone_type4_3_right": {
        "img": "stone_type4_3_dungeon_walk.png",
        "sx": 929,
        "sy": 1127,
        "sw": 936,
        "sh": 1144,
        "scale": 0.25000000000000006
    },
    "stone_type5_down": {
        "img": "stone_type5_dungeon_walk.png",
        "sx": 94,
        "sy": 70,
        "sw": 910,
        "sh": 1011,
        "scale": 0.25000000000000006
    },
    "stone_type5_up": {
        "img": "stone_type5_dungeon_walk.png",
        "sx": 1064,
        "sy": 70,
        "sw": 910,
        "sh": 1011,
        "scale": 0.25000000000000006
    },
    "stone_type5_left": {
        "img": "stone_type5_dungeon_walk.png",
        "sx": 1049,
        "sy": 1085,
        "sw": 910,
        "sh": 1011,
        "scale": 0.25000000000000006
    },
    "stone_type5_right": {
        "img": "stone_type5_dungeon_walk.png",
        "sx": 149,
        "sy": 1085,
        "sw": 910,
        "sh": 1011,
        "scale": 0.25000000000000006
    },
    "stone_type5_2_down": {
        "img": "stone_type5_2_dungeon_walk.png",
        "sx": 38,
        "sy": 84,
        "sw": 959,
        "sh": 960,
        "scale": 0.25000000000000006
    },
    "stone_type5_2_up": {
        "img": "stone_type5_2_dungeon_walk.png",
        "sx": 1003,
        "sy": 72,
        "sw": 959,
        "sh": 960,
        "scale": 0.25000000000000006
    },
    "stone_type5_2_left": {
        "img": "stone_type5_2_dungeon_walk.png",
        "sx": 38,
        "sy": 1084,
        "sw": 959,
        "sh": 1015,
        "scale": 0.25000000000000006
    },
    "stone_type5_2_right": {
        "img": "stone_type5_2_dungeon_walk.png",
        "sx": 938,
        "sy": 1084,
        "sw": 959,
        "sh": 1015,
        "scale": 0.25000000000000006
    },
    "stone_type5_3_down": {
        "img": "stone_type5_3_dungeon_walk.png",
        "sx": 31,
        "sy": 91,
        "sw": 921,
        "sh": 998,
        "scale": 0.25000000000000006
    },
    "stone_type5_3_up": {
        "img": "stone_type5_3_dungeon_walk.png",
        "sx": 1014,
        "sy": 91,
        "sw": 921,
        "sh": 998,
        "scale": 0.25000000000000006
    },
    "stone_type5_3_left": {
        "img": "stone_type5_3_dungeon_walk.png",
        "sx": 1014,
        "sy": 1095,
        "sw": 921,
        "sh": 1049,
        "scale": 0.25000000000000006
    },
    "stone_type5_3_right": {
        "img": "stone_type5_3_dungeon_walk.png",
        "sx": 33,
        "sy": 1095,
        "sw": 921,
        "sh": 1049,
        "scale": 0.25000000000000006
    },
    "seed_down": { "img": "seed_dungeon_walk.png", "sx": 150, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.25 },
    "seed_up": { "img": "seed_dungeon_walk.png", "sx": 941, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.25 },
    "seed_left": { "img": "seed_dungeon_walk.png", "sx": 939, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.25 },
    "seed_right": { "img": "seed_dungeon_walk.png", "sx": 113, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.25 },
    "seed_type1_down": {
        "img": "seed_type1_dungeon_walk.png",
        "sx": 145,
        "sy": 72,
        "sw": 733,
        "sh": 1159,
        "scale": 0.25
    },
    "seed_type1_up": {
        "img": "seed_type1_dungeon_walk.png",
        "sx": 925,
        "sy": 84,
        "sw": 733,
        "sh": 1159,
        "scale": 0.25
    },
    "seed_type1_left": {
        "img": "seed_type1_dungeon_walk.png",
        "sx": 934,
        "sy": 1253,
        "sw": 733,
        "sh": 1159,
        "scale": 0.25
    },
    "seed_type1_right": {
        "img": "seed_type1_dungeon_walk.png",
        "sx": 125,
        "sy": 1253,
        "sw": 733,
        "sh": 1159,
        "scale": 0.25
    },
    "seed_type1_2_down": {
        "img": "seed_type1_2_dungeon_walk.png",
        "sx": 64,
        "sy": 20,
        "sw": 658,
        "sh": 1111,
        "scale": 0.25
    },
    "seed_type1_2_up": {
        "img": "seed_type1_2_dungeon_walk.png",
        "sx": 761,
        "sy": 20,
        "sw": 658,
        "sh": 1111,
        "scale": 0.25
    },
    "seed_type1_2_left": {
        "img": "seed_type1_2_dungeon_walk.png",
        "sx": 770,
        "sy": 1651,
        "sw": 658,
        "sh": 1111,
        "scale": 0.25
    },
    "seed_type1_2_right": {
        "img": "seed_type1_2_dungeon_walk.png",
        "sx": 39,
        "sy": 1651,
        "sw": 658,
        "sh": 1111,
        "scale": 0.25
    },
    "seed_type2_down": {
        "img": "seed_type2_dungeon_walk.png",
        "sx": 53,
        "sy": -1,
        "sw": 755,
        "sh": 1209,
        "scale": 0.25
    },
    "seed_type2_up": {
        "img": "seed_type2_dungeon_walk.png",
        "sx": 940,
        "sy": -1,
        "sw": 755,
        "sh": 1209,
        "scale": 0.25
    },
    "seed_type2_left": {
        "img": "seed_type2_dungeon_walk.png",
        "sx": 110,
        "sy": 1246,
        "sw": 715,
        "sh": 1175,
        "scale": 0.25
    },
    "seed_type2_right": {
        "img": "seed_type2_dungeon_walk.png",
        "sx": 964,
        "sy": 1246,
        "sw": 715,
        "sh": 1175,
        "scale": 0.25
    },
    "seed_type2_2_down": {
        "img": "seed_type2_2_dungeon_walk.png",
        "sx": 120,
        "sy": 61,
        "sw": 784,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type2_2_up": {
        "img": "seed_type2_2_dungeon_walk.png",
        "sx": 1043,
        "sy": 61,
        "sw": 784,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type2_2_left": {
        "img": "seed_type2_2_dungeon_walk.png",
        "sx": 1144,
        "sy": 1122,
        "sw": 669,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type2_2_right": {
        "img": "seed_type2_2_dungeon_walk.png",
        "sx": 113,
        "sy": 1122,
        "sw": 669,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type3_down": {
        "img": "seed_type3_dungeon_walk.png",
        "sx": 126,
        "sy": 105,
        "sw": 713,
        "sh": 1098,
        "scale": 0.25
    },
    "seed_type3_up": {
        "img": "seed_type3_dungeon_walk.png",
        "sx": 995,
        "sy": 105,
        "sw": 713,
        "sh": 1098,
        "scale": 0.25
    },
    "seed_type3_left": {
        "img": "seed_type3_dungeon_walk.png",
        "sx": 149,
        "sy": 1205,
        "sw": 658,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type3_right": {
        "img": "seed_type3_dungeon_walk.png",
        "sx": 1032,
        "sy": 1205,
        "sw": 658,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type3_2_down": {
        "img": "seed_type3_2_dungeon_walk.png",
        "sx": 133,
        "sy": 71,
        "sw": 675,
        "sh": 1097,
        "scale": 0.25
    },
    "seed_type3_2_up": {
        "img": "seed_type3_2_dungeon_walk.png",
        "sx": 1000,
        "sy": 71,
        "sw": 675,
        "sh": 1097,
        "scale": 0.25
    },
    "seed_type3_2_left": {
        "img": "seed_type3_2_dungeon_walk.png",
        "sx": 1004,
        "sy": 1207,
        "sw": 658,
        "sh": 1097,
        "scale": 0.25
    },
    "seed_type3_2_right": {
        "img": "seed_type3_2_dungeon_walk.png",
        "sx": 127,
        "sy": 1207,
        "sw": 658,
        "sh": 1097,
        "scale": 0.25
    },
    "seed_type3_3_down": {
        "img": "seed_type3_3_dungeon_walk.png",
        "sx": 127,
        "sy": 113,
        "sw": 936,
        "sh": 890,
        "scale": 0.25
    },
    "seed_type3_3_up": {
        "img": "seed_type3_3_dungeon_walk.png",
        "sx": 1127,
        "sy": 127,
        "sw": 936,
        "sh": 890,
        "scale": 0.25
    },
    "seed_type3_3_left": {
        "img": "seed_type3_3_dungeon_walk.png",
        "sx": 1204,
        "sy": 1068,
        "sw": 782,
        "sh": 890,
        "scale": 0.25
    },
    "seed_type3_3_right": {
        "img": "seed_type3_3_dungeon_walk.png",
        "sx": 133,
        "sy": 1068,
        "sw": 782,
        "sh": 890,
        "scale": 0.25
    },
    "seed_type4_down": {
        "img": "seed_type4_dungeon_walk.png",
        "sx": 31,
        "sy": 25,
        "sw": 777,
        "sh": 1266,
        "scale": 0.25
    },
    "seed_type4_up": {
        "img": "seed_type4_dungeon_walk.png",
        "sx": 859,
        "sy": 25,
        "sw": 777,
        "sh": 1235,
        "scale": 0.25
    },
    "seed_type4_left": {
        "img": "seed_type4_dungeon_walk.png",
        "sx": 907,
        "sy": 1296,
        "sw": 694,
        "sh": 1235,
        "scale": 0.25
    },
    "seed_type4_right": {
        "img": "seed_type4_dungeon_walk.png",
        "sx": 70,
        "sy": 1296,
        "sw": 694,
        "sh": 1235,
        "scale": 0.25
    },
    "seed_type4_2_down": {
        "img": "seed_type4_2_dungeon_walk.png",
        "sx": 33,
        "sy": 29,
        "sw": 983,
        "sh": 1019,
        "scale": 0.25
    },
    "seed_type4_2_up": {
        "img": "seed_type4_2_dungeon_walk.png",
        "sx": 1071,
        "sy": 29,
        "sw": 983,
        "sh": 1019,
        "scale": 0.25
    },
    "seed_type4_2_left": {
        "img": "seed_type4_2_dungeon_walk.png",
        "sx": 231,
        "sy": 1038,
        "sw": 745,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type4_2_right": {
        "img": "seed_type4_2_dungeon_walk.png",
        "sx": 1105,
        "sy": 1038,
        "sw": 745,
        "sh": 1064,
        "scale": 0.25
    },
    "seed_type5_down": {
        "img": "seed_type5_dungeon_walk.png",
        "sx": 88,
        "sy": 18,
        "sw": 771,
        "sh": 1177,
        "scale": 0.25
    },
    "seed_type5_up": {
        "img": "seed_type5_dungeon_walk.png",
        "sx": 927,
        "sy": 18,
        "sw": 771,
        "sh": 1177,
        "scale": 0.25
    },
    "seed_type5_left": {
        "img": "seed_type5_dungeon_walk.png",
        "sx": 83,
        "sy": 1240,
        "sw": 752,
        "sh": 1131,
        "scale": 0.25
    },
    "seed_type5_right": {
        "img": "seed_type5_dungeon_walk.png",
        "sx": 952,
        "sy": 1240,
        "sw": 752,
        "sh": 1131,
        "scale": 0.25
    },
    "seed_type5_2_down": {
        "img": "seed_type5_2_dungeon_walk.png",
        "sx": 79,
        "sy": 110,
        "sw": 757,
        "sh": 1105,
        "scale": 0.25
    },
    "seed_type5_2_up": {
        "img": "seed_type5_2_dungeon_walk.png",
        "sx": 955,
        "sy": 110,
        "sw": 757,
        "sh": 1105,
        "scale": 0.25
    },
    "seed_type5_2_left": {
        "img": "seed_type5_2_dungeon_walk.png",
        "sx": 972,
        "sy": 1226,
        "sw": 658,
        "sh": 1105,
        "scale": 0.25
    },
    "seed_type5_2_right": {
        "img": "seed_type5_2_dungeon_walk.png",
        "sx": 182,
        "sy": 1226,
        "sw": 658,
        "sh": 1105,
        "scale": 0.25
    },
    "ghost_down": {
        "img": "ghost_dungeon_walk.png",
        "sx": 185,
        "sy": 138,
        "sw": 674,
        "sh": 782,
        "scale": 0.25000000000000006
    },
    "ghost_up": {
        "img": "ghost_dungeon_walk.png",
        "sx": 1110,
        "sy": 138,
        "sw": 674,
        "sh": 782,
        "scale": 0.25000000000000006
    },
    "ghost_left": {
        "img": "ghost_dungeon_walk.png",
        "sx": 1148,
        "sy": 1130,
        "sw": 674,
        "sh": 782,
        "scale": 0.25000000000000006
    },
    "ghost_right": {
        "img": "ghost_dungeon_walk.png",
        "sx": 132,
        "sy": 1130,
        "sw": 674,
        "sh": 782,
        "scale": 0.25000000000000006
    },
    "ghost_type1_down": {
        "img": "ghost_type1_dungeon_walk.png",
        "sx": 148,
        "sy": 94,
        "sw": 771,
        "sh": 974,
        "scale": 0.25000000000000006
    },
    "ghost_type1_up": {
        "img": "ghost_type1_dungeon_walk.png",
        "sx": 1056,
        "sy": 94,
        "sw": 758,
        "sh": 974,
        "scale": 0.25000000000000006
    },
    "ghost_type1_left": {
        "img": "ghost_type1_dungeon_walk.png",
        "sx": 1133,
        "sy": 1149,
        "sw": 674,
        "sh": 974,
        "scale": 0.25000000000000006
    },
    "ghost_type1_right": {
        "img": "ghost_type1_dungeon_walk.png",
        "sx": 154,
        "sy": 1149,
        "sw": 674,
        "sh": 974,
        "scale": 0.25000000000000006
    },
    "ghost_type1_2_down": {
        "img": "ghost_type1_2_dungeon_walk.png",
        "sx": 102,
        "sy": 90,
        "sw": 718,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "ghost_type1_2_up": {
        "img": "ghost_type1_2_dungeon_walk.png",
        "sx": 1055,
        "sy": 90,
        "sw": 718,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "ghost_type1_2_left": {
        "img": "ghost_type1_2_dungeon_walk.png",
        "sx": 180,
        "sy": 1157,
        "sw": 674,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "ghost_type1_2_right": {
        "img": "ghost_type1_2_dungeon_walk.png",
        "sx": 1062,
        "sy": 1157,
        "sw": 674,
        "sh": 895,
        "scale": 0.25000000000000006
    },
    "ghost_type2_down": {
        "img": "ghost_type2_dungeon_walk.png",
        "sx": 40,
        "sy": 130,
        "sw": 908,
        "sh": 1008,
        "scale": 0.25000000000000006
    },
    "ghost_type2_up": {
        "img": "ghost_type2_dungeon_walk.png",
        "sx": 991,
        "sy": 130,
        "sw": 908,
        "sh": 1008,
        "scale": 0.25000000000000006
    },
    "ghost_type2_left": {
        "img": "ghost_type2_dungeon_walk.png",
        "sx": 1052,
        "sy": 1130,
        "sw": 718,
        "sh": 1046,
        "scale": 0.25000000000000006
    },
    "ghost_type2_right": {
        "img": "ghost_type2_dungeon_walk.png",
        "sx": 183,
        "sy": 1130,
        "sw": 718,
        "sh": 1046,
        "scale": 0.25000000000000006
    },
    "ghost_type2_2_down": {
        "img": "ghost_type2_2_dungeon_walk.png",
        "sx": 121,
        "sy": 76,
        "sw": 755,
        "sh": 948,
        "scale": 0.25000000000000006
    },
    "ghost_type2_2_up": {
        "img": "ghost_type2_2_dungeon_walk.png",
        "sx": 977,
        "sy": 76,
        "sw": 755,
        "sh": 948,
        "scale": 0.25000000000000006
    },
    "ghost_type2_2_left": {
        "img": "ghost_type2_2_dungeon_walk.png",
        "sx": 1026,
        "sy": 1201,
        "sw": 746,
        "sh": 948,
        "scale": 0.25000000000000006
    },
    "ghost_type2_2_right": {
        "img": "ghost_type2_2_dungeon_walk.png",
        "sx": 82,
        "sy": 1201,
        "sw": 746,
        "sh": 948,
        "scale": 0.25000000000000006
    },
    "ghost_type3_down": {
        "img": "ghost_type3_dungeon_walk.png",
        "sx": 136,
        "sy": 122,
        "sw": 781,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "ghost_type3_up": {
        "img": "ghost_type3_dungeon_walk.png",
        "sx": 1055,
        "sy": 122,
        "sw": 781,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "ghost_type3_left": {
        "img": "ghost_type3_dungeon_walk.png",
        "sx": 1086,
        "sy": 1088,
        "sw": 781,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "ghost_type3_right": {
        "img": "ghost_type3_dungeon_walk.png",
        "sx": 132,
        "sy": 1088,
        "sw": 781,
        "sh": 972,
        "scale": 0.25000000000000006
    },
    "ghost_type3_2_down": {
        "img": "ghost_type3_2_dungeon_walk.png",
        "sx": 103,
        "sy": 135,
        "sw": 740,
        "sh": 945,
        "scale": 0.25000000000000006
    },
    "ghost_type3_2_up": {
        "img": "ghost_type3_2_dungeon_walk.png",
        "sx": 960,
        "sy": 141,
        "sw": 740,
        "sh": 945,
        "scale": 0.25000000000000006
    },
    "ghost_type3_2_left": {
        "img": "ghost_type3_2_dungeon_walk.png",
        "sx": 999,
        "sy": 1262,
        "sw": 731,
        "sh": 945,
        "scale": 0.25000000000000006
    },
    "ghost_type3_2_right": {
        "img": "ghost_type3_2_dungeon_walk.png",
        "sx": 104,
        "sy": 1262,
        "sw": 731,
        "sh": 945,
        "scale": 0.25000000000000006
    },
    "ghost_type4_down": {
        "img": "ghost_type4_dungeon_walk.png",
        "sx": 182,
        "sy": 130,
        "sw": 674,
        "sh": 963,
        "scale": 0.25000000000000006
    },
    "ghost_type4_up": {
        "img": "ghost_type4_dungeon_walk.png",
        "sx": 1108,
        "sy": 130,
        "sw": 674,
        "sh": 963,
        "scale": 0.25000000000000006
    },
    "ghost_type4_left": {
        "img": "ghost_type4_dungeon_walk.png",
        "sx": 185,
        "sy": 1130,
        "sw": 674,
        "sh": 963,
        "scale": 0.25000000000000006
    },
    "ghost_type4_right": {
        "img": "ghost_type4_dungeon_walk.png",
        "sx": 1108,
        "sy": 1130,
        "sw": 674,
        "sh": 963,
        "scale": 0.25000000000000006
    },
    "ghost_type4_2_down": {
        "img": "ghost_type4_2_dungeon_walk.png",
        "sx": 98,
        "sy": 51,
        "sw": 747,
        "sh": 934,
        "scale": 0.25000000000000006
    },
    "ghost_type4_2_up": {
        "img": "ghost_type4_2_dungeon_walk.png",
        "sx": 1061,
        "sy": 51,
        "sw": 747,
        "sh": 934,
        "scale": 0.25000000000000006
    },
    "ghost_type4_2_left": {
        "img": "ghost_type4_2_dungeon_walk.png",
        "sx": 1097,
        "sy": 1131,
        "sw": 674,
        "sh": 934,
        "scale": 0.25000000000000006
    },
    "ghost_type4_2_right": {
        "img": "ghost_type4_2_dungeon_walk.png",
        "sx": 132,
        "sy": 1131,
        "sw": 674,
        "sh": 934,
        "scale": 0.25000000000000006
    },
    "ghost_type5_down": {
        "img": "ghost_type5_dungeon_walk.png",
        "sx": 135,
        "sy": 133,
        "sw": 836,
        "sh": 937,
        "scale": 0.25000000000000006
    },
    "ghost_type5_up": {
        "img": "ghost_type5_dungeon_walk.png",
        "sx": 1055,
        "sy": 133,
        "sw": 836,
        "sh": 937,
        "scale": 0.25000000000000006
    },
    "ghost_type5_left": {
        "img": "ghost_type5_dungeon_walk.png",
        "sx": 1055,
        "sy": 1098,
        "sw": 836,
        "sh": 937,
        "scale": 0.25000000000000006
    },
    "ghost_type5_right": {
        "img": "ghost_type5_dungeon_walk.png",
        "sx": 132,
        "sy": 1098,
        "sw": 836,
        "sh": 937,
        "scale": 0.25000000000000006
    },
    "ghost_type5_2_down": {
        "img": "ghost_type5_2_dungeon_walk.png",
        "sx": 44,
        "sy": 84,
        "sw": 740,
        "sh": 1012,
        "scale": 0.25000000000000006
    },
    "ghost_type5_2_up": {
        "img": "ghost_type5_2_dungeon_walk.png",
        "sx": 842,
        "sy": 84,
        "sw": 740,
        "sh": 1012,
        "scale": 0.25000000000000006
    },
    "ghost_type5_2_left": {
        "img": "ghost_type5_2_dungeon_walk.png",
        "sx": 901,
        "sy": 1403,
        "sw": 674,
        "sh": 1001,
        "scale": 0.25000000000000006
    },
    "ghost_type5_2_right": {
        "img": "ghost_type5_2_dungeon_walk.png",
        "sx": 43,
        "sy": 1403,
        "sw": 674,
        "sh": 1001,
        "scale": 0.25000000000000006
    },
    "balloon_down": { "img": "balloon_dungeon_walk.png", "sx": 168, "sy": 152, "sw": 789, "sh": 845, "scale": 0.25 },
    "balloon_up": { "img": "balloon_dungeon_walk.png", "sx": 1162, "sy": 152, "sw": 818, "sh": 845, "scale": 0.25 },
    "balloon_left": { "img": "balloon_dungeon_walk.png", "sx": 1172, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.25 },
    "balloon_right": { "img": "balloon_dungeon_walk.png", "sx": 173, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.25 },
    "balloon_type1_down": {
        "img": "balloon_type1_dungeon_walk.png",
        "sx": 8,
        "sy": 151,
        "sw": 1094,
        "sh": 914,
        "scale": 0.25
    },
    "balloon_type1_up": {
        "img": "balloon_type1_dungeon_walk.png",
        "sx": 1137,
        "sy": 151,
        "sw": 948,
        "sh": 914,
        "scale": 0.25
    },
    "balloon_type1_left": {
        "img": "balloon_type1_dungeon_walk.png",
        "sx": 1225,
        "sy": 1074,
        "sw": 789,
        "sh": 914,
        "scale": 0.25
    },
    "balloon_type1_right": {
        "img": "balloon_type1_dungeon_walk.png",
        "sx": 225,
        "sy": 1074,
        "sw": 789,
        "sh": 914,
        "scale": 0.25
    },
    "balloon_type1_2_down": {
        "img": "balloon_type1_2_dungeon_walk.png",
        "sx": 16,
        "sy": 170,
        "sw": 789,
        "sh": 1218,
        "scale": 0.25
    },
    "balloon_type1_2_up": {
        "img": "balloon_type1_2_dungeon_walk.png",
        "sx": 798,
        "sy": 170,
        "sw": 789,
        "sh": 1218,
        "scale": 0.25
    },
    "balloon_type1_2_left": {
        "img": "balloon_type1_2_dungeon_walk.png",
        "sx": 66,
        "sy": 1370,
        "sw": 789,
        "sh": 1218,
        "scale": 0.25
    },
    "balloon_type1_2_right": {
        "img": "balloon_type1_2_dungeon_walk.png",
        "sx": 820,
        "sy": 1370,
        "sw": 789,
        "sh": 1218,
        "scale": 0.25
    },
    "balloon_type1_3_down": {
        "img": "balloon_type1_3_dungeon_walk.png",
        "sx": 46,
        "sy": 91,
        "sw": 1109,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type1_3_up": {
        "img": "balloon_type1_3_dungeon_walk.png",
        "sx": 1161,
        "sy": 91,
        "sw": 1109,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type1_3_left": {
        "img": "balloon_type1_3_dungeon_walk.png",
        "sx": 274,
        "sy": 938,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type1_3_right": {
        "img": "balloon_type1_3_dungeon_walk.png",
        "sx": 1242,
        "sy": 938,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_down": {
        "img": "balloon_type2_dungeon_walk.png",
        "sx": 21,
        "sy": 135,
        "sw": 964,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_up": {
        "img": "balloon_type2_dungeon_walk.png",
        "sx": 1162,
        "sy": 135,
        "sw": 964,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_left": {
        "img": "balloon_type2_dungeon_walk.png",
        "sx": 143,
        "sy": 1050,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_right": {
        "img": "balloon_type2_dungeon_walk.png",
        "sx": 1243,
        "sy": 1050,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_2_down": {
        "img": "balloon_type2_2_dungeon_walk.png",
        "sx": 30,
        "sy": 44,
        "sw": 841,
        "sh": 1190,
        "scale": 0.25
    },
    "balloon_type2_2_up": {
        "img": "balloon_type2_2_dungeon_walk.png",
        "sx": 896,
        "sy": 44,
        "sw": 841,
        "sh": 1190,
        "scale": 0.25
    },
    "balloon_type2_2_left": {
        "img": "balloon_type2_2_dungeon_walk.png",
        "sx": 937,
        "sy": 1200,
        "sw": 789,
        "sh": 1220,
        "scale": 0.25
    },
    "balloon_type2_2_right": {
        "img": "balloon_type2_2_dungeon_walk.png",
        "sx": 71,
        "sy": 1200,
        "sw": 789,
        "sh": 1220,
        "scale": 0.25
    },
    "balloon_type2_3_down": {
        "img": "balloon_type2_3_dungeon_walk.png",
        "sx": 26,
        "sy": 54,
        "sw": 1144,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_3_up": {
        "img": "balloon_type2_3_dungeon_walk.png",
        "sx": 1180,
        "sy": 54,
        "sw": 1144,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_3_left": {
        "img": "balloon_type2_3_dungeon_walk.png",
        "sx": 1429,
        "sy": 925,
        "sw": 845,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type2_3_right": {
        "img": "balloon_type2_3_dungeon_walk.png",
        "sx": 58,
        "sy": 925,
        "sw": 845,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type3_down": {
        "img": "balloon_type3_dungeon_walk.png",
        "sx": 12,
        "sy": 109,
        "sw": 1072,
        "sh": 910,
        "scale": 0.25
    },
    "balloon_type3_up": {
        "img": "balloon_type3_dungeon_walk.png",
        "sx": 1097,
        "sy": 109,
        "sw": 1072,
        "sh": 910,
        "scale": 0.25
    },
    "balloon_type3_left": {
        "img": "balloon_type3_dungeon_walk.png",
        "sx": 1189,
        "sy": 999,
        "sw": 878,
        "sh": 934,
        "scale": 0.25
    },
    "balloon_type3_right": {
        "img": "balloon_type3_dungeon_walk.png",
        "sx": 140,
        "sy": 999,
        "sw": 878,
        "sh": 934,
        "scale": 0.25
    },
    "balloon_type3_2_down": {
        "img": "balloon_type3_2_dungeon_walk.png",
        "sx": 70,
        "sy": 86,
        "sw": 841,
        "sh": 1044,
        "scale": 0.25
    },
    "balloon_type3_2_up": {
        "img": "balloon_type3_2_dungeon_walk.png",
        "sx": 1083,
        "sy": 86,
        "sw": 841,
        "sh": 1044,
        "scale": 0.25
    },
    "balloon_type3_2_left": {
        "img": "balloon_type3_2_dungeon_walk.png",
        "sx": 1128,
        "sy": 1133,
        "sw": 789,
        "sh": 975,
        "scale": 0.25
    },
    "balloon_type3_2_right": {
        "img": "balloon_type3_2_dungeon_walk.png",
        "sx": 143,
        "sy": 1133,
        "sw": 789,
        "sh": 975,
        "scale": 0.25
    },
    "balloon_type3_3_down": {
        "img": "balloon_type3_3_dungeon_walk.png",
        "sx": 128,
        "sy": 130,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type3_3_up": {
        "img": "balloon_type3_3_dungeon_walk.png",
        "sx": 1283,
        "sy": 130,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type3_3_left": {
        "img": "balloon_type3_3_dungeon_walk.png",
        "sx": 1297,
        "sy": 1030,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type3_3_right": {
        "img": "balloon_type3_3_dungeon_walk.png",
        "sx": 104,
        "sy": 1030,
        "sw": 789,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type4_down": {
        "img": "balloon_type4_dungeon_walk.png",
        "sx": 15,
        "sy": 78,
        "sw": 1358,
        "sh": 733,
        "scale": 0.25
    },
    "balloon_type4_up": {
        "img": "balloon_type4_dungeon_walk.png",
        "sx": 1573,
        "sy": 78,
        "sw": 972,
        "sh": 733,
        "scale": 0.25
    },
    "balloon_type4_left": {
        "img": "balloon_type4_dungeon_walk.png",
        "sx": 2042,
        "sy": 794,
        "sw": 771,
        "sh": 733,
        "scale": 0.25
    },
    "balloon_type4_right": {
        "img": "balloon_type4_dungeon_walk.png",
        "sx": 93,
        "sy": 794,
        "sw": 789,
        "sh": 733,
        "scale": 0.25
    },
    "balloon_type4_2_down": {
        "img": "balloon_type4_2_dungeon_walk.png",
        "sx": 5,
        "sy": 42,
        "sw": 1074,
        "sh": 944,
        "scale": 0.25
    },
    "balloon_type4_2_up": {
        "img": "balloon_type4_2_dungeon_walk.png",
        "sx": 1167,
        "sy": 42,
        "sw": 1074,
        "sh": 944,
        "scale": 0.25
    },
    "balloon_type4_2_left": {
        "img": "balloon_type4_2_dungeon_walk.png",
        "sx": 1255,
        "sy": 1003,
        "sw": 837,
        "sh": 944,
        "scale": 0.25
    },
    "balloon_type4_2_right": {
        "img": "balloon_type4_2_dungeon_walk.png",
        "sx": 145,
        "sy": 1003,
        "sw": 837,
        "sh": 884,
        "scale": 0.25
    },
    "balloon_type4_3_down": {
        "img": "balloon_type4_3_dungeon_walk.png",
        "sx": 127,
        "sy": 1036,
        "sw": 910,
        "sh": 981,
        "scale": 0.25
    },
    "balloon_type4_3_up": {
        "img": "balloon_type4_3_dungeon_walk.png",
        "sx": 1136,
        "sy": 1036,
        "sw": 910,
        "sh": 981,
        "scale": 0.25
    },
    "balloon_type4_3_left": {
        "img": "balloon_type4_3_dungeon_walk.png",
        "sx": 1200,
        "sy": 59,
        "sw": 789,
        "sh": 953,
        "scale": 0.25
    },
    "balloon_type4_3_right": {
        "img": "balloon_type4_3_dungeon_walk.png",
        "sx": 173,
        "sy": 59,
        "sw": 789,
        "sh": 953,
        "scale": 0.25
    },
    "balloon_type5_down": {
        "img": "balloon_type5_dungeon_walk.png",
        "sx": 50,
        "sy": 120,
        "sw": 856,
        "sh": 1089,
        "scale": 0.25
    },
    "balloon_type5_up": {
        "img": "balloon_type5_dungeon_walk.png",
        "sx": 936,
        "sy": 120,
        "sw": 848,
        "sh": 1089,
        "scale": 0.25
    },
    "balloon_type5_left": {
        "img": "balloon_type5_dungeon_walk.png",
        "sx": 87,
        "sy": 1202,
        "sw": 848,
        "sh": 1099,
        "scale": 0.25
    },
    "balloon_type5_right": {
        "img": "balloon_type5_dungeon_walk.png",
        "sx": 916,
        "sy": 1202,
        "sw": 848,
        "sh": 1099,
        "scale": 0.25
    },
    "balloon_type5_2_down": {
        "img": "balloon_type5_2_dungeon_walk.png",
        "sx": 124,
        "sy": 56,
        "sw": 809,
        "sh": 1101,
        "scale": 0.25
    },
    "balloon_type5_2_up": {
        "img": "balloon_type5_2_dungeon_walk.png",
        "sx": 1024,
        "sy": 56,
        "sw": 809,
        "sh": 1101,
        "scale": 0.25
    },
    "balloon_type5_2_left": {
        "img": "balloon_type5_2_dungeon_walk.png",
        "sx": 1061,
        "sy": 1117,
        "sw": 789,
        "sh": 1101,
        "scale": 0.25
    },
    "balloon_type5_2_right": {
        "img": "balloon_type5_2_dungeon_walk.png",
        "sx": 115,
        "sy": 1117,
        "sw": 789,
        "sh": 1101,
        "scale": 0.25
    },
    "beetle_down": {
        "img": "beetle_dungeon_walk.png",
        "sx": 1100,
        "sy": 76,
        "sw": 683,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_up": {
        "img": "beetle_dungeon_walk.png",
        "sx": 152,
        "sy": 76,
        "sw": 683,
        "sh": 1001,
        "scale": 0.25000000000000006
    },
    "beetle_left": {
        "img": "beetle_dungeon_walk.png",
        "sx": 1039,
        "sy": 1149,
        "sw": 785,
        "sh": 1001,
        "scale": 0.25000000000000006
    },
    "beetle_right": {
        "img": "beetle_dungeon_walk.png",
        "sx": 120,
        "sy": 1149,
        "sw": 785,
        "sh": 1001,
        "scale": 0.25000000000000006
    },
    "beetle_type1_down": {
        "img": "beetle_type1_dungeon_walk.png",
        "sx": 75,
        "sy": 76,
        "sw": 885,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type1_up": {
        "img": "beetle_type1_dungeon_walk.png",
        "sx": 1062,
        "sy": 76,
        "sw": 885,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type1_left": {
        "img": "beetle_type1_dungeon_walk.png",
        "sx": 1062,
        "sy": 1076,
        "sw": 885,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type1_right": {
        "img": "beetle_type1_dungeon_walk.png",
        "sx": 78,
        "sy": 1076,
        "sw": 885,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_down": {
        "img": "beetle_type2_dungeon_walk.png",
        "sx": 100,
        "sy": 76,
        "sw": 783,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_up": {
        "img": "beetle_type2_dungeon_walk.png",
        "sx": 1071,
        "sy": 76,
        "sw": 783,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_left": {
        "img": "beetle_type2_dungeon_walk.png",
        "sx": 56,
        "sy": 1134,
        "sw": 865,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "beetle_type2_right": {
        "img": "beetle_type2_dungeon_walk.png",
        "sx": 1039,
        "sy": 1134,
        "sw": 865,
        "sh": 1022,
        "scale": 0.25000000000000006
    },
    "beetle_type2_2_down": {
        "img": "beetle_type2_2_dungeon_walk.png",
        "sx": 100,
        "sy": 76,
        "sw": 851,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_2_up": {
        "img": "beetle_type2_2_dungeon_walk.png",
        "sx": 1080,
        "sy": 60,
        "sw": 851,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_2_left": {
        "img": "beetle_type2_2_dungeon_walk.png",
        "sx": 100,
        "sy": 1076,
        "sw": 851,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_2_right": {
        "img": "beetle_type2_2_dungeon_walk.png",
        "sx": 1081,
        "sy": 1076,
        "sw": 851,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type2_3_down": {
        "img": "beetle_type2_3_dungeon_walk.png",
        "sx": 99,
        "sy": 49,
        "sw": 871,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "beetle_type2_3_up": {
        "img": "beetle_type2_3_dungeon_walk.png",
        "sx": 1099,
        "sy": 49,
        "sw": 1060,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "beetle_type2_3_left": {
        "img": "beetle_type2_3_dungeon_walk.png",
        "sx": 1099,
        "sy": 1022,
        "sw": 1060,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "beetle_type2_3_right": {
        "img": "beetle_type2_3_dungeon_walk.png",
        "sx": 74,
        "sy": 995,
        "sw": 1060,
        "sh": 942,
        "scale": 0.25000000000000006
    },
    "beetle_type2_4_down": {
        "img": "beetle_type2_4_dungeon_walk.png",
        "sx": 84,
        "sy": 60,
        "sw": 1074,
        "sh": 802,
        "scale": 0.25000000000000006
    },
    "beetle_type2_4_up": {
        "img": "beetle_type2_4_dungeon_walk.png",
        "sx": 1249,
        "sy": 60,
        "sw": 1074,
        "sh": 802,
        "scale": 0.25000000000000006
    },
    "beetle_type2_4_left": {
        "img": "beetle_type2_4_dungeon_walk.png",
        "sx": 1249,
        "sy": 928,
        "sw": 1074,
        "sh": 802,
        "scale": 0.25000000000000006
    },
    "beetle_type2_4_right": {
        "img": "beetle_type2_4_dungeon_walk.png",
        "sx": 104,
        "sy": 928,
        "sw": 1074,
        "sh": 802,
        "scale": 0.25000000000000006
    },
    "beetle_type3_down": {
        "img": "beetle_type3_dungeon_walk.png",
        "sx": 176,
        "sy": 20,
        "sw": 854,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type3_up": {
        "img": "beetle_type3_dungeon_walk.png",
        "sx": 1176,
        "sy": 20,
        "sw": 854,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type3_left": {
        "img": "beetle_type3_dungeon_walk.png",
        "sx": 1176,
        "sy": 1020,
        "sw": 854,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type3_right": {
        "img": "beetle_type3_dungeon_walk.png",
        "sx": 155,
        "sy": 1020,
        "sw": 854,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_down": {
        "img": "beetle_type4_dungeon_walk.png",
        "sx": 100,
        "sy": 56,
        "sw": 903,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_up": {
        "img": "beetle_type4_dungeon_walk.png",
        "sx": 1100,
        "sy": 56,
        "sw": 903,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_left": {
        "img": "beetle_type4_dungeon_walk.png",
        "sx": 63,
        "sy": 1046,
        "sw": 917,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_right": {
        "img": "beetle_type4_dungeon_walk.png",
        "sx": 1100,
        "sy": 1040,
        "sw": 935,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_2_down": {
        "img": "beetle_type4_2_dungeon_walk.png",
        "sx": 93,
        "sy": 76,
        "sw": 901,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_2_up": {
        "img": "beetle_type4_2_dungeon_walk.png",
        "sx": 1084,
        "sy": 56,
        "sw": 901,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_2_left": {
        "img": "beetle_type4_2_dungeon_walk.png",
        "sx": 1084,
        "sy": 1056,
        "sw": 901,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type4_2_right": {
        "img": "beetle_type4_2_dungeon_walk.png",
        "sx": 67,
        "sy": 1056,
        "sw": 901,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_down": {
        "img": "beetle_type5_dungeon_walk.png",
        "sx": 52,
        "sy": 76,
        "sw": 990,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_up": {
        "img": "beetle_type5_dungeon_walk.png",
        "sx": 1052,
        "sy": 76,
        "sw": 990,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_left": {
        "img": "beetle_type5_dungeon_walk.png",
        "sx": 52,
        "sy": 1064,
        "sw": 990,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_right": {
        "img": "beetle_type5_dungeon_walk.png",
        "sx": 1065,
        "sy": 1064,
        "sw": 990,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_2_down": {
        "img": "beetle_type5_2_dungeon_walk.png",
        "sx": -1,
        "sy": 47,
        "sw": 1056,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_2_up": {
        "img": "beetle_type5_2_dungeon_walk.png",
        "sx": 1093,
        "sy": 16,
        "sw": 1056,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_2_left": {
        "img": "beetle_type5_2_dungeon_walk.png",
        "sx": -1,
        "sy": 1015,
        "sw": 1056,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "beetle_type5_2_right": {
        "img": "beetle_type5_2_dungeon_walk.png",
        "sx": 1061,
        "sy": 1015,
        "sw": 1056,
        "sh": 997,
        "scale": 0.25000000000000006
    },
    "bird_down": { "img": "bird_dungeon_walk.png", "sx": 220, "sy": 234, "sw": 557, "sh": 940, "scale": 0.25 },
    "bird_up": { "img": "bird_dungeon_walk.png", "sx": 219, "sy": 1234, "sw": 557, "sh": 957, "scale": 0.25 },
    "bird_left": { "img": "bird_dungeon_walk.png", "sx": 1074, "sy": 1234, "sw": 631, "sh": 957, "scale": 0.25 },
    "bird_right": { "img": "bird_dungeon_walk.png", "sx": 1049, "sy": 274, "sw": 631, "sh": 913, "scale": 0.25 },
    "bird_type1_down": {
        "img": "bird_type1_dungeon_walk.png",
        "sx": 28,
        "sy": 989,
        "sw": 1016,
        "sh": 1002,
        "scale": 0.25
    },
    "bird_type1_up": {
        "img": "bird_type1_dungeon_walk.png",
        "sx": 42,
        "sy": 11,
        "sw": 1016,
        "sh": 1002,
        "scale": 0.25
    },
    "bird_type1_left": {
        "img": "bird_type1_dungeon_walk.png",
        "sx": 1232,
        "sy": 996,
        "sw": 822,
        "sh": 986,
        "scale": 0.25
    },
    "bird_type1_right": {
        "img": "bird_type1_dungeon_walk.png",
        "sx": 1149,
        "sy": 39,
        "sw": 902,
        "sh": 967,
        "scale": 0.25
    },
    "bird_type1_2_down": {
        "img": "bird_type1_2_dungeon_walk.png",
        "sx": 141,
        "sy": -2,
        "sw": 763,
        "sh": 1017,
        "scale": 0.25
    },
    "bird_type1_2_up": {
        "img": "bird_type1_2_dungeon_walk.png",
        "sx": 1196,
        "sy": -2,
        "sw": 763,
        "sh": 1017,
        "scale": 0.25
    },
    "bird_type1_2_left": {
        "img": "bird_type1_2_dungeon_walk.png",
        "sx": 1191,
        "sy": 1059,
        "sw": 889,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type1_2_right": {
        "img": "bird_type1_2_dungeon_walk.png",
        "sx": 73,
        "sy": 1059,
        "sw": 889,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type2_down": {
        "img": "bird_type2_dungeon_walk.png",
        "sx": 224,
        "sy": 73,
        "sw": 622,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type2_up": {
        "img": "bird_type2_dungeon_walk.png",
        "sx": 1285,
        "sy": 73,
        "sw": 622,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type2_left": {
        "img": "bird_type2_dungeon_walk.png",
        "sx": 224,
        "sy": 986,
        "sw": 817,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type2_right": {
        "img": "bird_type2_dungeon_walk.png",
        "sx": 1120,
        "sy": 986,
        "sw": 817,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type2_2_down": {
        "img": "bird_type2_2_dungeon_walk.png",
        "sx": 94,
        "sy": 170,
        "sw": 849,
        "sh": 909,
        "scale": 0.25
    },
    "bird_type2_2_up": {
        "img": "bird_type2_2_dungeon_walk.png",
        "sx": 1113,
        "sy": 170,
        "sw": 849,
        "sh": 909,
        "scale": 0.25
    },
    "bird_type2_2_left": {
        "img": "bird_type2_2_dungeon_walk.png",
        "sx": 94,
        "sy": 1170,
        "sw": 849,
        "sh": 922,
        "scale": 0.25
    },
    "bird_type2_2_right": {
        "img": "bird_type2_2_dungeon_walk.png",
        "sx": 1094,
        "sy": 1170,
        "sw": 849,
        "sh": 922,
        "scale": 0.25
    },
    "bird_type3_down": {
        "img": "bird_type3_dungeon_walk.png",
        "sx": 104,
        "sy": 66,
        "sw": 1010,
        "sh": 890,
        "scale": 0.25
    },
    "bird_type3_up": {
        "img": "bird_type3_dungeon_walk.png",
        "sx": 53,
        "sy": 951,
        "sw": 1010,
        "sh": 890,
        "scale": 0.25
    },
    "bird_type3_left": {
        "img": "bird_type3_dungeon_walk.png",
        "sx": 1446,
        "sy": 959,
        "sw": 810,
        "sh": 892,
        "scale": 0.25
    },
    "bird_type3_right": {
        "img": "bird_type3_dungeon_walk.png",
        "sx": 1345,
        "sy": 72,
        "sw": 810,
        "sh": 892,
        "scale": 0.25
    },
    "bird_type3_2_down": {
        "img": "bird_type3_2_dungeon_walk.png",
        "sx": 98,
        "sy": 93,
        "sw": 931,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type3_2_up": {
        "img": "bird_type3_2_dungeon_walk.png",
        "sx": 1138,
        "sy": 93,
        "sw": 931,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type3_2_left": {
        "img": "bird_type3_2_dungeon_walk.png",
        "sx": 1132,
        "sy": 1055,
        "sw": 919,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type3_2_right": {
        "img": "bird_type3_2_dungeon_walk.png",
        "sx": 117,
        "sy": 1055,
        "sw": 919,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type3_3_down": {
        "img": "bird_type3_3_dungeon_walk.png",
        "sx": 214,
        "sy": 62,
        "sw": 729,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type3_3_up": {
        "img": "bird_type3_3_dungeon_walk.png",
        "sx": 1278,
        "sy": 62,
        "sw": 729,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type3_3_left": {
        "img": "bird_type3_3_dungeon_walk.png",
        "sx": 1339,
        "sy": 1029,
        "sw": 775,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type3_3_right": {
        "img": "bird_type3_3_dungeon_walk.png",
        "sx": 119,
        "sy": 1029,
        "sw": 775,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type4_down": {
        "img": "bird_type4_dungeon_walk.png",
        "sx": -25,
        "sy": 61,
        "sw": 1029,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type4_up": {
        "img": "bird_type4_dungeon_walk.png",
        "sx": 1036,
        "sy": 61,
        "sw": 1029,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type4_left": {
        "img": "bird_type4_dungeon_walk.png",
        "sx": 98,
        "sy": 1079,
        "sw": 945,
        "sh": 958,
        "scale": 0.25
    },
    "bird_type4_right": {
        "img": "bird_type4_dungeon_walk.png",
        "sx": 998,
        "sy": 1079,
        "sw": 945,
        "sh": 958,
        "scale": 0.25
    },
    "bird_type4_2_down": {
        "img": "bird_type4_2_dungeon_walk.png",
        "sx": 11,
        "sy": 17,
        "sw": 1315,
        "sh": 863,
        "scale": 0.25
    },
    "bird_type4_2_up": {
        "img": "bird_type4_2_dungeon_walk.png",
        "sx": 1346,
        "sy": 17,
        "sw": 1315,
        "sh": 917,
        "scale": 0.25
    },
    "bird_type4_2_left": {
        "img": "bird_type4_2_dungeon_walk.png",
        "sx": 208,
        "sy": 898,
        "sw": 1161,
        "sh": 747,
        "scale": 0.25
    },
    "bird_type4_2_right": {
        "img": "bird_type4_2_dungeon_walk.png",
        "sx": 1348,
        "sy": 916,
        "sw": 1134,
        "sh": 726,
        "scale": 0.25
    },
    "bird_type5_down": {
        "img": "bird_type5_dungeon_walk.png",
        "sx": 7,
        "sy": 80,
        "sw": 1052,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type5_up": {
        "img": "bird_type5_dungeon_walk.png",
        "sx": 1101,
        "sy": 80,
        "sw": 1052,
        "sh": 940,
        "scale": 0.25
    },
    "bird_type5_left": {
        "img": "bird_type5_dungeon_walk.png",
        "sx": 1223,
        "sy": 1012,
        "sw": 897,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type5_right": {
        "img": "bird_type5_dungeon_walk.png",
        "sx": 52,
        "sy": 1012,
        "sw": 897,
        "sh": 957,
        "scale": 0.25
    },
    "bird_type5_2_down": {
        "img": "bird_type5_2_dungeon_walk.png",
        "sx": 32,
        "sy": 47,
        "sw": 957,
        "sh": 902,
        "scale": 0.25
    },
    "bird_type5_2_up": {
        "img": "bird_type5_2_dungeon_walk.png",
        "sx": 12,
        "sy": 916,
        "sw": 957,
        "sh": 890,
        "scale": 0.25
    },
    "bird_type5_2_left": {
        "img": "bird_type5_2_dungeon_walk.png",
        "sx": 1578,
        "sy": 916,
        "sw": 746,
        "sh": 890,
        "scale": 0.25
    },
    "bird_type5_2_right": {
        "img": "bird_type5_2_dungeon_walk.png",
        "sx": 954,
        "sy": 916,
        "sw": 657,
        "sh": 890,
        "scale": 0.25
    }
};

window.triggerMonsterHouseEffect = function() {
    window.addDungeonLog(`🚨 モンスターハウスだ！！`, '#ff5252');
    
    // ★修正：マップの裏側ではなく、画面全体の手前にフラッシュ用レイヤーを作る
    let flashOverlay = document.getElementById('dg-mh-flash-overlay');
    if (!flashOverlay) {
        flashOverlay = document.createElement('div');
        flashOverlay.id = 'dg-mh-flash-overlay';
        flashOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background-color:transparent; pointer-events:none; z-index:99999; transition:background-color 0.1s ease;';
        document.body.appendChild(flashOverlay);
    }
    
    flashOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // 画面全体を赤く染める
    setTimeout(() => { flashOverlay.style.backgroundColor = 'transparent'; }, 150);
    setTimeout(() => { flashOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; }, 300);
    setTimeout(() => { flashOverlay.style.backgroundColor = 'transparent'; }, 450);
};

window.updateDungeonUI = function() {
    const s = window.DUNGEON_STATE; 
    const container = document.getElementById('dg-map-container'); 
    const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv || !container) return;

    let prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';

    const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
    const logicalTileX = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
    const logicalTileY = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

    gridDiv.style.width = `${s.mapWidth * logicalTileX}px`; 
    gridDiv.style.height = `${s.mapHeight * logicalTileY}px`; 
    
    // ★ 大改修：innerHTML = '' による全消去を廃止！
    // 代わりに、今ターンで描画した要素のIDを記録するセットを用意
    let currentActiveIds = new Set();

    const cw = container.clientWidth; const ch = container.clientHeight;
    const camZoom = 0.6; 
    const playerPixelX = s.player.x * logicalTileX + (logicalTileX / 2); 
    const playerPixelY = s.player.y * logicalTileY + (logicalTileY / 2);
    const camX = (cw / 2) - playerPixelX * camZoom; 
    const camY = (ch / 2) - playerPixelY * camZoom;
    
    // カメラの追従も滑らかにする
    gridDiv.style.transition = 'transform 0.2s linear';
    gridDiv.style.transform = `translate(${camX}px, ${camY}px) scale(${camZoom})`;

    const viewDistX = Math.ceil((cw / 2 / camZoom) / logicalTileX) + 2; 
    const viewDistY = Math.ceil((ch / 2 / camZoom) / logicalTileY) + 2;
    const startX = Math.max(0, s.player.x - viewDistX); const endX = Math.min(s.mapWidth - 1, s.player.x + viewDistX);
    const startY = Math.max(0, s.player.y - viewDistY); const endY = Math.min(s.mapHeight - 1, s.player.y + viewDistY);

    if (!s.visited) s.visited = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(false));

    let currentRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
    let isDarkRoom = currentRoom ? currentRoom.isDark : false;
    let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom; 

    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (!isBlind && window.isTileVisible(s, x, y)) s.visited[y][x] = true;
            else if (isBlind && Math.abs(x - s.player.x) + Math.abs(y - s.player.y) <= 1) s.visited[y][x] = true;
        }
    }

    let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 

    const getOffsetY = (key, sp) => {
        const isOverlay = key.startsWith('skull_') || key.startsWith('crystal_') || key.startsWith('gimmick_') || key.startsWith('trap_') || key.startsWith('spr_item_');
        return isOverlay ? (logicalTileY - sp.sh) : (logicalTileY - sp.sh) / 2;
    };

    // ==========================================
    // ★ 描画ループ：背景マップ
    // ==========================================
    for(let y = startY; y <= endY; y++) {
        for(let x = startX; x <= endX; x++) {
            if (!s.visited[y][x]) continue; 
            
            let isVisibleNow = !isBlind ? window.isTileVisible(s, x, y) : (Math.abs(x - s.player.x) + Math.abs(y - s.player.y) <= 1);
            let brightness = 0.2; 
            
            if (isVisibleNow) {
                let inRoom = (!isCorridor && s.roomsInfo.some(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h && x >= r.x - 1 && x < r.x + r.w + 1 && y >= r.y - 1 && y < r.y + r.h + 1));
                if (inRoom && !isDarkRoom) { brightness = 1.0; } 
                else {
                    const dist = Math.sqrt(Math.pow(x - s.player.x, 2) + Math.pow(y - s.player.y, 2));
                    let baseRad = s.player.type === 'bird' ? 3.5 : 1.5;
                    brightness = dist > baseRad - 0.5 ? 0.6 : 1.0;
                }
            }

            let tileType = s.grid[y][x];
            let key = `${prefix}floor`;
            if (tileType === 1) key = `${prefix}wall`;
            else if (tileType === 2) key = `${prefix}stair`;
            else if (tileType === 4) key = `gimmick_water`;
            else if (tileType === 5) key = `gimmick_magma`;
            // ★ 新規追加：新地形の描画
            else if (tileType === 6) key = `gimmick_grass`;
            else if (tileType === 7) key = `gimmick_dirt`;
            else if (tileType === 8) key = `gimmick_ice`;
            else if (tileType === 9) key = `gimmick_puddle`;
            else if (tileType === 10) key = `gimmick_fire`;
            else if (tileType === 11) key = `gimmick_rune`; // ★ 追加：ルーン魔方陣
            
            // ★ リサイクル描画
            let domId = `tile_${x}_${y}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            const tile = window.createDungeonSprite(key, y * 10, brightness, false, logicalTileX, existingDiv);
            
            if (tile && !existingDiv) {
                tile.id = domId;
                const sp = window.DUNGEON_SPRITES[key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(key, sp) : 0;
                tile.style.left = `${x * logicalTileX + offsetX}px`; 
                tile.style.top = `${y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(tile); 
            }
        }
    }

    // ==========================================
    // ★ 描画ループ：罠・ギミック
    // ==========================================
    if (s.traps) {
        s.traps.forEach(t => {
            if (!t.visible || !window.isTileVisible(s, t.x, t.y)) return;
            let sprKey = `trap_${t.type}`; 
            let domId = `trap_${t.x}_${t.y}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            
            const trapDiv = window.createDungeonSprite(sprKey, t.y * 10 + 1, 1.0, false, logicalTileX, existingDiv);
            if (trapDiv && !existingDiv) {
                trapDiv.id = domId;
                const sp = window.DUNGEON_SPRITES[sprKey];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(sprKey, sp) : 0;
                trapDiv.style.left = `${t.x * logicalTileX + offsetX}px`; 
                trapDiv.style.top = `${t.y * logicalTileY + offsetY}px`;
                gridDiv.appendChild(trapDiv);
            }
        });
    }

    // ==========================================
    // ★ 描画ループ：アイテム
    // ==========================================
    if (s.items) {
        s.items.forEach(i => {
            // ★修正：アイテムデータや key が破損していてもクラッシュさせない
            if (!i || !i.key || !window.isTileVisible(s, i.x, i.y)) return;
            
            let sprKey = 'spr_item_bag'; 
            let k = i.key; // 短縮
            if (k.includes('herb') || k.includes('berry') || k.includes('bread') || k.includes('seed')) sprKey = 'spr_item_herb';
            else if (k.includes('scroll')) sprKey = 'spr_item_scroll';
            else if (k.includes('wand')) sprKey = 'spr_item_wand';
            
            let domId = `item_${i.id || (i.x+'_'+i.y)}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            
            const itemDiv = window.createDungeonSprite(sprKey, i.y * 10 + 1, 1.0, false, logicalTileX, existingDiv);
            if (itemDiv && !existingDiv) {
                itemDiv.id = domId;
                const sp = window.DUNGEON_SPRITES[sprKey];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(sprKey, sp) : 0;
                itemDiv.style.left = `${i.x * logicalTileX + offsetX}px`; 
                itemDiv.style.top = `${i.y * logicalTileY + offsetY}px`;
                itemDiv.style.animation = "atk-up 2s infinite ease-in-out"; 
                gridDiv.appendChild(itemDiv);
            }
        });
    }

    // ==========================================
    // ★ 描画ループ：救助対象
    // ==========================================
    if (s.rescueTargets) {
        s.rescueTargets.forEach((t, idx) => {
            if(t.rescued || !window.isTileVisible(s, t.x, t.y)) return; 
            let domId = `rescue_${idx}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            
            const targetDiv = window.createDungeonSprite(`${t.skin}_down`, t.y * 10 + 2, 1.0, false, logicalTileX, existingDiv);
            if (targetDiv && !existingDiv) {
                targetDiv.id = domId;
                const sp = window.DUNGEON_SPRITES[`${t.skin}_down`];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
                targetDiv.style.left = `${t.x * logicalTileX + offsetX}px`; targetDiv.style.top = `${t.y * logicalTileY + offsetY}px`; 
                targetDiv.style.filter = "grayscale(100%) opacity(0.7)"; 
                const sosMark = document.createElement('div');
                sosMark.innerText = "🆘"; sosMark.style.position = "absolute"; sosMark.style.top = "-30px"; sosMark.style.fontSize = "30px";
                sosMark.style.textShadow = "0 0 5px red"; sosMark.style.animation = "atk-up 1s infinite"; 
                targetDiv.appendChild(sosMark); gridDiv.appendChild(targetDiv);
            }
        });
    }

    // ==========================================
    // ★ 描画ループ：敵（滑らか移動とZインデックス制御）
    // ==========================================
    s.enemies.forEach(e => {
        if(e.hp <= 0 || e.x < startX || e.x > endX || e.y < startY || e.y > endY || !window.isTileVisible(s, e.x, e.y)) return;
        
        let domId = e.id; 
        currentActiveIds.add(domId);
        let existingDiv = document.getElementById(domId);
        
        let oldZ = existingDiv ? parseInt(existingDiv.style.zIndex || '0') : 0;
        let newZ = e.y * 10 + 5;

        // ==========================================
        // ★ 修正：描画するキーを type ではなく skin(進化形態) にする！
        // ==========================================
        let eSkinKey = e.skin || e.type;

        const enemyDiv = window.createDungeonSprite(`${eSkinKey}_${e.face}`, newZ, 1.0, true, logicalTileX, existingDiv);
        if (enemyDiv) {
            if (existingDiv && newZ < oldZ) {
                enemyDiv.style.zIndex = oldZ; 
                clearTimeout(enemyDiv._zTimeout);
                enemyDiv._zTimeout = setTimeout(() => { enemyDiv.style.zIndex = newZ; }, 200);
            }

            // ★ サイズとオフセットの計算も skin ベースで行う
            const sp = window.DUNGEON_SPRITES[`${eSkinKey}_${e.face}`];
            const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
            
            if (!existingDiv) {
                enemyDiv.id = domId;
                enemyDiv.style.left = `${e.x * logicalTileX + offsetX}px`; 
                enemyDiv.style.top = `${e.y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(enemyDiv);
            } else {
                enemyDiv.style.transition = 'left 0.2s linear, top 0.2s linear';
                enemyDiv.style.left = `${e.x * logicalTileX + offsetX}px`; 
                enemyDiv.style.top = `${e.y * logicalTileY + offsetY}px`; 
            }

            enemyDiv.classList.remove('anim-atk-up', 'anim-atk-down', 'anim-atk-left', 'anim-atk-right', 'anim-damage', 'anim-warp');
            void enemyDiv.offsetWidth; 
            if (e.attackAnim) { enemyDiv.classList.add(`anim-atk-${e.face}`); e.attackAnim = false; }
            if (e.damageAnim) { enemyDiv.classList.add(`anim-damage`); e.damageAnim = false; } 
            if (e.warpAnim) { enemyDiv.classList.add(`anim-warp`); e.warpAnim = false; } 
            
            // ★修正：魅了(charmed)ではなく、睡眠(sleep > 0)の時に表示するように修正
            let zzz = enemyDiv.querySelector('.zzz-mark');
            if (e.status && e.status.sleep > 0) {
                if (!zzz) {
                    zzz = document.createElement('div'); 
                    zzz.className = 'zzz-mark';
                    zzz.innerText = "Zzz"; zzz.style.position = "absolute"; zzz.style.top = "-20px"; zzz.style.right = "-5px";
                    zzz.style.color = "#B39DDB"; zzz.style.fontWeight = "bold"; zzz.style.fontSize = "16px"; zzz.style.textShadow = "1px 1px 2px #000";
                    zzz.style.animation = "atk-up 1.5s infinite linear"; enemyDiv.appendChild(zzz);
                }
            } else if (zzz) {
                zzz.remove();
            }
        }
    });

    // ==========================================
    // ★ 描画ループ：プレイヤー（滑らか移動とZインデックス制御）
    // ==========================================
    let stateStr = "";
    if (s.player.equipWeapon && s.player.equipShield) stateStr = "_sword_shield";
    else if (s.player.equipWeapon) stateStr = "_sword";
    else if (s.player.equipShield) stateStr = "_shield";
    
    let baseSkin = s.player.skin || s.player.type;
    let pKey = `${baseSkin}${stateStr}_${s.player.face}`;
    let pSp = window.DUNGEON_SPRITES[pKey];
    
    if (!pSp) { pKey = `${baseSkin}_${s.player.face}`; pSp = window.DUNGEON_SPRITES[pKey]; }
    if (!pSp) { pKey = `${s.player.type}${stateStr}_${s.player.face}`; pSp = window.DUNGEON_SPRITES[pKey]; }
    if (!pSp) { pKey = `${s.player.type}_${s.player.face}`; pSp = window.DUNGEON_SPRITES[pKey]; }

    let playerDomId = 'dg-player-sprite';
    currentActiveIds.add(playerDomId);
    let existingPlayer = document.getElementById(playerDomId);

    // ★ 追加：移動前の古いZインデックスを取得しておく
    let oldZ = existingPlayer ? parseInt(existingPlayer.style.zIndex || '0') : 0;
    let newZ = s.player.y * 10 + 5;

    if (pSp) {
        const pDiv = window.createDungeonSprite(pKey, newZ, 1.0, false, logicalTileX, existingPlayer);
        if (pDiv) {
            // ★ 追加：上に移動する時は、奥に潜り込まないようにZインデックスを維持する
            if (existingPlayer && newZ < oldZ) {
                pDiv.style.zIndex = oldZ; 
                clearTimeout(pDiv._zTimeout);
                pDiv._zTimeout = setTimeout(() => { pDiv.style.zIndex = newZ; }, 150); // プレイヤーの移動時間は0.15s
            }

            const offsetX = (logicalTileX - pSp.sw) / 2; const offsetY = (logicalTileY - pSp.sh) / 2;
            
            if (!existingPlayer) {
                pDiv.id = playerDomId;
                pDiv.style.left = `${s.player.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${s.player.y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(pDiv);
            } else {
                pDiv.style.transition = 'left 0.15s linear, top 0.15s linear';
                pDiv.style.left = `${s.player.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${s.player.y * logicalTileY + offsetY}px`; 
            }
            if (window.aiPet && typeof window.applyDungeonWalkCosmetics === 'function') {
                window.applyDungeonWalkCosmetics(pDiv, window.aiPet, pKey);
            }

            pDiv.classList.remove('anim-atk-up', 'anim-atk-down', 'anim-atk-left', 'anim-atk-right', 'anim-damage', 'anim-knockback', 'anim-levelup', 'anim-magic');
            void pDiv.offsetWidth; 
            if (s.player.attackAnim) { pDiv.classList.add(`anim-atk-${s.player.face}`); s.player.attackAnim = false; }
            if (s.player.damageAnim) { pDiv.classList.add(`anim-damage`); s.player.damageAnim = false; } 
            if (s.player.knockbackAnim) { pDiv.classList.add(`anim-knockback`); s.player.knockbackAnim = false; } 
            if (s.player.levelUpAnim) { pDiv.classList.add(`anim-levelup`); s.player.levelUpAnim = false; } 
            if (s.player.magicAnim) { pDiv.classList.add(`anim-magic`); s.player.magicAnim = false; } 

            // ★ 追加：プレイヤーの恐怖・睡眠・混乱などのステータスUIアイコン表示
            let pStatusMark = pDiv.querySelector('.status-mark');
            if (s.player.status && (s.player.status.sleep > 0 || s.player.status.fear > 0 || s.player.status.confusion > 0)) {
                if (!pStatusMark) {
                    pStatusMark = document.createElement('div'); 
                    pStatusMark.className = 'status-mark';
                    pStatusMark.style.position = "absolute"; pStatusMark.style.top = "-20px"; pStatusMark.style.right = "-5px";
                    pStatusMark.style.fontWeight = "bold"; pStatusMark.style.fontSize = "16px"; pStatusMark.style.textShadow = "1px 1px 2px #000";
                    pDiv.appendChild(pStatusMark);
                }
                if (s.player.status.sleep > 0) { pStatusMark.innerText = "Zzz"; pStatusMark.style.color = "#B39DDB"; pStatusMark.style.animation = "atk-up 1.5s infinite linear"; }
                else if (s.player.status.fear > 0) { pStatusMark.innerText = "😱"; pStatusMark.style.animation = "anim-screen-shake 0.5s infinite"; }
                else if (s.player.status.confusion > 0) { pStatusMark.innerText = "🌀"; pStatusMark.style.animation = "atk-up 1s infinite"; }
            } else if (pStatusMark) {
                pStatusMark.remove();
            }
        }
    }

    // ==========================================
    // ★ ゴミ掃除（クリーンアップ）
    // ==========================================
    // 画面外に出た、または消滅した要素（currentActiveIds に含まれないもの）を削除する
    Array.from(gridDiv.children).forEach(child => {
        // dmg-text (ダメージ数値) や vfx系の要素は勝手に消えるのでここでは無視する
        if (child.id && !currentActiveIds.has(child.id) && !child.classList.contains('dmg-text')) {
            gridDiv.removeChild(child);
        }
    });

    // ==========================================
    // ★ 以下、UI（HPやインベントリ）の更新はそのまま
    // ==========================================
    document.getElementById('dg-hp').innerText = Math.max(0, Math.floor(s.player.hp)); 
    document.getElementById('dg-max-hp').innerText = Math.floor(s.player.maxHp); 
    document.getElementById('dg-floor').innerText = s.floor;
    document.getElementById('dg-hunger').innerText = Math.max(0, Math.floor(s.player.hunger));

    // ★修正：レベル表示の横に「現在のEXP / 次のレベルまでのEXP」を追記する
    let lvlEl = document.getElementById('dg-level');
    let currentLv = s.player.level || 1;
    let currentExp = s.player.exp || 0;
    // ★修正：戦闘側と共通の指数関数カーブを用いて表示ズレを完全に防止！
    let requiredExp = typeof window.getRequiredDungeonExp === 'function' ? window.getRequiredDungeonExp(currentLv) : Math.floor(100 * Math.pow(1.3, currentLv - 1));
    let expStr = ` (EXP: ${currentExp}/${requiredExp})`;

    if (lvlEl) {
        lvlEl.innerText = `${currentLv}${expStr}`;
    } else {
        let allSpans = document.querySelectorAll('span');
        allSpans.forEach(span => { if (span.innerText.includes('Lv.')) span.innerText = `Lv.${currentLv}${expStr}`; });
    }

    const invListEl = document.getElementById('dg-inventory-list');
    if (invListEl) {
        invListEl.style.maxHeight = 'none';
        invListEl.style.overflowY = 'visible';

        let invHtml = "";
        if (s.player.equipWeapon) { let wName = window.getDungeonItemEffect(s.player.equipWeapon).name; invHtml += `<span style="background:rgba(255,215,0,0.15); color:#FFD700; padding:3px 8px; border-radius:4px; border:1px solid #FFD700; margin-right:5px; display:inline-block; margin-bottom:3px;">⚔️ ${wName}</span>`; }
        if (s.player.equipShield) { let sName = window.getDungeonItemEffect(s.player.equipShield).name; invHtml += `<span style="background:rgba(79,195,247,0.15); color:#4fc3f7; padding:3px 8px; border-radius:4px; border:1px solid #4fc3f7; margin-right:5px; display:inline-block; margin-bottom:3px;">🛡️ ${sName}</span>`; }
        if (s.player.equipArmor) { let aName = window.getDungeonItemEffect(s.player.equipArmor).name; invHtml += `<span style="background:rgba(139,195,74,0.15); color:#8BC34A; padding:3px 8px; border-radius:4px; border:1px solid #8BC34A; margin-right:5px; display:inline-block; margin-bottom:3px;">👕 ${aName}</span>`; }
        if (s.player.equipAccessory) { let acName = window.getDungeonItemEffect(s.player.equipAccessory).name; invHtml += `<span style="background:rgba(224,64,251,0.15); color:#E040FB; padding:3px 8px; border-radius:4px; border:1px solid #E040FB; margin-right:5px; display:inline-block; margin-bottom:3px;">💍 ${acName}</span>`; }

        let counts = {};
        if (s.player.tempInventory) { s.player.tempInventory.forEach(k => counts[k] = (counts[k] || 0) + 1); }
        for (let k in counts) { let iName = window.getDungeonItemEffect(k).name; invHtml += `<span style="background:#222; padding:3px 8px; border-radius:4px; border:1px solid #555; margin-right:5px; display:inline-block; margin-bottom:3px;">${iName} <span style="color:#FFD700">x${counts[k]}</span></span>`; }
        if (invHtml === "") { invHtml = `<span style="color:#888; font-size:12px;">なにも持っていない</span>`; }
        
        let detailsEl = document.getElementById('dg-inv-details');
        if (!detailsEl) {
            invListEl.innerHTML = `
                <details id="dg-inv-details" style="background:rgba(0,0,0,0.7); border:1px solid #555; border-radius:6px; margin-bottom:5px; padding-bottom:2px;">
                    <summary style="padding:8px; cursor:pointer; color:#FFF; font-weight:bold; outline:none; font-size:14px; user-select:none;">🎒 持ち物と装備</summary>
                    <div id="dg-inv-content" style="padding:8px; border-top:1px solid #555;"></div>
                </details>
            `;
        }
        document.getElementById('dg-inv-content').innerHTML = invHtml;
    }

    const traitContainer = document.getElementById('dg-active-traits');
    if (!traitContainer && invListEl) {
        const div = document.createElement('div'); div.id = 'dg-active-traits';
        invListEl.parentNode.appendChild(div);
    }
    if (document.getElementById('dg-active-traits')) {
        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin) : [];
        
        let traitHtml = "";
        if (activeTraits.length === 0) {
            traitHtml = `<span style="color:#aaa; font-size:12px;">固有の特性はありません。</span>`;
        } else {
            traitHtml = `<ul style="margin:0; padding-left:20px; color:#fff; font-size:12px; line-height:1.4;">`;
            activeTraits.forEach(t => { traitHtml += `<li style="margin-bottom:4px;"><strong style="color:#FFEB3B;">【${t.name}】</strong> ${t.desc}</li>`; });
            traitHtml += `</ul>`;
        }
        
        let tDetailsEl = document.getElementById('dg-trait-details');
        if (!tDetailsEl) {
            document.getElementById('dg-active-traits').innerHTML = `
                <details id="dg-trait-details" style="background:rgba(0,0,0,0.7); border:1px solid #00BCD4; border-radius:6px; padding-bottom:2px;">
                    <summary style="padding:8px; cursor:pointer; color:#00BCD4; font-weight:bold; outline:none; font-size:14px; user-select:none;">🌟 発動中の種族特性</summary>
                    <div id="dg-trait-content" style="padding:8px; border-top:1px solid #00BCD4;"></div>
                </details>
            `;
        }
        document.getElementById('dg-trait-content').innerHTML = traitHtml;
    }

    // === 作戦バッジと操作パネルの表示更新 ===
    let tacticBadge = document.getElementById('dg-tactic-badge');
    let tacticControls = document.getElementById('dg-tactic-controls'); // IDをこちらに統一

    const allDungeonCommands = typeof window.DUNGEON_AVAILABLE_COMMANDS !== 'undefined' ? window.DUNGEON_AVAILABLE_COMMANDS.map(c => c.name) : [];
    const learnedWords = (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.learnedWords) ? window.aiPet.apprentice.learnedWords : [];
    
    // ★厳格な解放条件：全ての基礎コマンド ＋ 「作戦」という言葉を知っていること
    const isTacticUnlocked = allDungeonCommands.every(cmd => learnedWords.includes(cmd)) && learnedWords.includes("作戦");

    // 1. バッジ（上）の制御
    if (tacticBadge) {
        if (!isTacticUnlocked) {
            tacticBadge.style.display = "none";
            // 解放条件を満たしていない場合、実行中の作戦もリセット
            if (s.player && s.player.currentTacticName !== "AIにまかせる") {
                s.player.currentTacticName = "AIにまかせる";
            }
        } else if (s.player) {
            let tName = s.player.currentTacticName || "AIにまかせる";
            let activeRuleText = "";
            
            // 現在の思考テレメトリ表示
            if (s.player._activeRuleIndex !== undefined && s.player._activeRuleIndex >= 0 && window.aiPet && window.aiPet.dungeonTactics) {
                let activeTactic = window.aiPet.dungeonTactics.find(t => t.name === tName);
                if (activeTactic && activeTactic.rules && activeTactic.rules[s.player._activeRuleIndex]) {
                    let rule = activeTactic.rules[s.player._activeRuleIndex];
                    let condName = window.DUNGEON_TACTIC_CONDITIONS[rule.condition] || rule.condition;
                    let actName = rule.action1;
                    activeRuleText = `<span style="display:block; font-size:12px; color:#FFEB3B; font-weight:bold; text-shadow: 1px 1px 2px #000, 0 0 4px #000; margin-top:2px;">⚡ [思考] ${condName} ➔ ${actName}</span>`;
                }
            } else if (tName !== "AIにまかせる" && s.player._lastCommand === 'skip') {
                 activeRuleText = `<span style="display:block; font-size:12px; color:#FF5252; font-weight:bold; text-shadow: 1px 1px 2px #000, 0 0 4px #000; margin-top:2px;">⚠️ 思考停止中（条件合致なし）</span>`;
            }
            
            tacticBadge.style.display = "inline-flex";
            tacticBadge.style.flexDirection = "column";
            tacticBadge.innerHTML = `<span>🚩 現在の作戦：${tName}</span>${activeRuleText}`;
        }
    }

    // 2. 操作パネル（下）の制御
    if (tacticControls) {
        // バッジが表示されるなら、こちらも必ず表示される
        tacticControls.style.display = isTacticUnlocked ? "flex" : "none";
    }
    
    // ★追加：作戦詳細モーダルへのリアルタイム・テレメトリ反映
    if (typeof window.updateTacticTelemetryUI === 'function') window.updateTacticTelemetryUI(s);

    const minimap = document.getElementById('dg-modal-minimap'); if (minimap && minimap.style.display !== 'none') window.drawMinimap();
};

window.drawMinimap = function() {
    const s = window.DUNGEON_STATE; 
    const container = document.getElementById('dg-minimap-content'); 
    if (!container) return;

    // ★ 風船系敵特性：光の屈折（視界内にプリズム・ドロップがいるとマップが歪む）
    let hasRefraction = s.enemies.some(e => e.hp > 0 && e.skin === 'balloon_type2_2' && window.isTileVisible(s, e.x, e.y));
    if (hasRefraction) {
        container.innerHTML = `<div style="color:#FF5252; font-size:12px; padding:10px; text-align:center; background:rgba(0,0,0,0.8); height:100%; display:flex; align-items:center; justify-content:center;">🌀 光の屈折により<br>空間が歪んでいる...</div>`;
        return;
    }

    // ==========================================
    // ★ 修正1＆2：半透明化と、見切れ防止の「自動サイズ調整」
    // ==========================================
    const modal = document.getElementById('dg-modal-minimap');
    if (modal) {
        modal.style.backgroundColor = 'rgba(10, 10, 15, 0.5)'; // 全体の枠を半透明に戻す
        modal.style.maxHeight = '90vh';
        modal.style.display = 'flex';
    }
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // マップ背景も透過
    container.style.overflow = 'hidden'; // スクロールバーを消す

    // 画面サイズとマップの広さに合わせてドットの大きさを自動調整（絶対に見切れないようにする）
    let miniSize = 10;
    if (s.mapWidth >= 60) miniSize = 5; // 巨大マップはドットを小さくする
    else if (s.mapWidth >= 40) miniSize = 7; 
    
    // スマホなど画面幅が極端に狭い場合はさらに縮小
    let maxAvailableWidth = window.innerWidth * 0.85;
    if (s.mapWidth * miniSize > maxAvailableWidth) {
        miniSize = Math.max(3, Math.floor(maxAvailableWidth / s.mapWidth));
    }

    container.style.width = `${s.mapWidth * miniSize}px`; 
    container.style.height = `${s.mapHeight * miniSize}px`; 
    // ★修正：中身を空にする際、AIのターゲット可視化用のアニメーションCSSを流し込む！
    // 修正後→
    container.innerHTML = `
        <style>
            #dg-minimap-content canvas { max-width: 100%; max-height: 100%; width: auto !important; height: auto !important; object-fit: contain; }
            @keyframes ai-target-blink { 0% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.3); } }
            @keyframes ai-enemy-pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.9); } 70% { box-shadow: 0 0 0 ${Math.max(10, miniSize * 2)}px rgba(255, 82, 82, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); } }
            /* ★追加：階段の光とバウンドアニメーション */
            @keyframes ai-stair-glow { 0% { box-shadow: 0 0 2px #00BCD4; transform: scale(1); } 100% { box-shadow: 0 0 10px #00BCD4; transform: scale(1.5); } }
            @keyframes ai-stair-bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-4px); } }
        </style>
    `;
    
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (!s.visited || !s.visited[y][x]) continue; 
            const dot = document.createElement('div'); dot.style.position = 'absolute'; dot.style.left = `${x * miniSize}px`; dot.style.top = `${y * miniSize}px`; dot.style.width = `${miniSize}px`; dot.style.height = `${miniSize}px`;
            
            // ★ 修正：ギミック地形の色分け表示を追加
            let t = s.grid[y][x];
            if (t === 1) dot.style.backgroundColor = '#444';      // 壁
            else if (t === 2) dot.style.backgroundColor = '#00BCD4'; // 階段
            else if (t === 4) dot.style.backgroundColor = '#1E88E5'; // 水脈
            else if (t === 5 || t === 10) dot.style.backgroundColor = '#FF5252'; // マグマ・火柱
            else if (t === 6) dot.style.backgroundColor = '#8BC34A'; // 草地
            else if (t === 7) dot.style.backgroundColor = '#795548'; // 土
            else if (t === 8) dot.style.backgroundColor = '#B2EBF2'; // 氷
            else if (t === 9) dot.style.backgroundColor = '#4DD0E1'; // 浅瀬
            else if (t === 11) dot.style.backgroundColor = '#9C27B0'; // ルーン魔方陣
            else dot.style.backgroundColor = '#888';                 // 通路・部屋
            
            container.appendChild(dot);
        }
    }
    
    if (s.rescueTargets) {
        s.rescueTargets.forEach(t => { 
            if(t.rescued || !window.isTileVisible(s, t.x, t.y)) return; 
            const tDot = document.createElement('div'); tDot.style.position = 'absolute'; tDot.style.left = `${t.x * miniSize}px`; tDot.style.top = `${t.y * miniSize}px`; tDot.style.width = `${miniSize}px`; tDot.style.height = `${miniSize}px`; 
            tDot.style.backgroundColor = '#FFEB3B'; tDot.style.boxShadow = '0 0 3px #FFEB3B'; container.appendChild(tDot); 
        });
    }

    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
    let hasSpotlight = activeTraits.includes('スポットライト');

    // ==========================================
    // ★ 修正3：一度訪れたマスのアイテムと罠は常に表示
    // ==========================================
    if (s.items) {
        s.items.forEach(i => {
            let isVisible = window.isTileVisible(s, i.x, i.y);
            let isVisited = s.visited && s.visited[i.y] && s.visited[i.y][i.x];
            
            // スポットライトがない ＆ 現在の視界外 ＆ 未踏破なら描画しない（＝踏破済みなら描画する）
            if (!hasSpotlight && !isVisible && !isVisited) return;
            
            const iDot = document.createElement('div'); 
            iDot.style.position = 'absolute'; 
            iDot.style.left = `${i.x * miniSize}px`; 
            iDot.style.top = `${i.y * miniSize}px`; 
            iDot.style.width = `${miniSize}px`; 
            iDot.style.height = `${miniSize}px`; 
            
            iDot.style.backgroundColor = hasSpotlight && !isVisible && !isVisited ? '#FFEB3B' : '#00BCD4'; 
            container.appendChild(iDot); 
        });
    }

    if (s.traps) {
        s.traps.forEach(t => {
            // 発見済み(visible === true)なら、視界外でもミニマップにずっと残る
            if (!t.visible) return;
            
            const tDot = document.createElement('div'); tDot.style.position = 'absolute'; tDot.style.left = `${t.x * miniSize}px`; tDot.style.top = `${t.y * miniSize}px`; tDot.style.width = `${miniSize}px`; tDot.style.height = `${miniSize}px`; 
            tDot.style.backgroundColor = '#E040FB'; tDot.innerText = 'x'; tDot.style.color = '#FFF'; 
            
            // miniSizeが小さくなっても「x」の文字がはみ出さないように調整
            tDot.style.fontSize = `${Math.max(6, miniSize - 2)}px`; 
            tDot.style.lineHeight = `${miniSize}px`; 
            tDot.style.textAlign = 'center';
            container.appendChild(tDot); 
        });
    }

    s.enemies.forEach(e => { 
        if(e.hp <= 0) return; 
        
        let isVisible = window.isTileVisible(s, e.x, e.y);
        let isVisited = s.visited && s.visited[e.y] && s.visited[e.y][e.x];

        if (e.skin === 'spirit_type5') {
            let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
            if (dist >= 3) { 
                isVisible = false;
                isVisited = false;
            }
        }
        
        if (!isVisible && !isVisited) return; 

        const eDot = document.createElement('div'); 
        eDot.style.position = 'absolute'; 
        eDot.style.left = `${e.x * miniSize}px`; 
        eDot.style.top = `${e.y * miniSize}px`; 
        eDot.style.width = `${miniSize}px`; 
        eDot.style.height = `${miniSize}px`; 
        
        eDot.style.backgroundColor = isVisible ? '#ff5252' : '#b71c1c'; 
        container.appendChild(eDot); 
    });
    
    const pDot = document.createElement('div'); pDot.style.position = 'absolute'; pDot.style.left = `${s.player.x * miniSize}px`; pDot.style.top = `${s.player.y * miniSize}px`; pDot.style.width = `${miniSize}px`; pDot.style.height = `${miniSize}px`; pDot.style.backgroundColor = '#4CAF50'; pDot.style.boxShadow = '0 0 5px #4CAF50'; 
    
    // プレイヤーの向きインジケーターもサイズに合わせて縮小
    const faceIndicator = document.createElement('div'); faceIndicator.style.position = 'absolute'; 
    let indSize = Math.max(2, Math.floor(miniSize * 0.4));
    faceIndicator.style.width = `${indSize}px`; faceIndicator.style.height = `${indSize}px`; faceIndicator.style.backgroundColor = '#FFF';
    
    let indPos = `${Math.floor((miniSize - indSize) / 2)}px`;
    if (s.player.face === 'up') { faceIndicator.style.top = '0'; faceIndicator.style.left = indPos; } if (s.player.face === 'down') { faceIndicator.style.bottom = '0'; faceIndicator.style.left = indPos; }
    if (s.player.face === 'left') { faceIndicator.style.top = indPos; faceIndicator.style.left = '0'; } if (s.player.face === 'right') { faceIndicator.style.top = indPos; faceIndicator.style.right = '0'; }
    pDot.appendChild(faceIndicator); container.appendChild(pDot);

    // ==========================================
    // ★ 新規追加：AIのターゲット可視化機能
    // ==========================================
    // 1. 目指しているアイテム (黄色の点滅カーソル)
    if (s.player._itemTargetPos) {
        const tDot = document.createElement('div');
        tDot.style.position = 'absolute';
        tDot.style.left = `${s.player._itemTargetPos.x * miniSize}px`;
        tDot.style.top = `${s.player._itemTargetPos.y * miniSize}px`;
        tDot.style.width = `${miniSize}px`;
        tDot.style.height = `${miniSize}px`;
        tDot.style.border = '2px solid #FFEB3B';
        tDot.style.boxSizing = 'border-box';
        tDot.style.animation = 'ai-target-blink 0.5s infinite alternate';
        // ★追加：現実の時刻に合わせてアニメーションを同期させ、再描画のチラつきを防止！
        tDot.style.animationDelay = `-${(Date.now() % 1000) / 1000}s`;
        tDot.style.zIndex = '20';
        container.appendChild(tDot);
    }
    
    // 2. 標的にしている敵 (照準マークと波紋エフェクト)
    if (s.player._patrolTargetId) {
        let tEnemy = s.enemies.find(e => e.id === s.player._patrolTargetId && e.hp > 0);
        // 発見済みの敵か、視界内の敵なら照準を描画
        if (tEnemy && (window.isTileVisible(s, tEnemy.x, tEnemy.y) || (s.visited && s.visited[tEnemy.y] && s.visited[tEnemy.y][tEnemy.x]))) {
            const eDot = document.createElement('div');
            eDot.style.position = 'absolute';
            eDot.style.left = `${tEnemy.x * miniSize}px`;
            eDot.style.top = `${tEnemy.y * miniSize}px`;
            eDot.style.width = `${miniSize}px`;
            eDot.style.height = `${miniSize}px`;
            eDot.style.borderRadius = '50%';
            eDot.style.animation = 'ai-enemy-pulse 1s infinite';
            // ★追加：こちらも時刻同期パッチを適用
            eDot.style.animationDelay = `-${(Date.now() % 1000) / 1000}s`;
            eDot.style.zIndex = '20';
            
            const mark = document.createElement('div');
            mark.innerText = '🎯';
            mark.style.position = 'absolute';
            // アイコンがはみ出さないように中心を調整
            mark.style.top = `-${Math.max(8, miniSize)}px`;
            mark.style.left = `-${Math.max(4, miniSize / 3)}px`;
            mark.style.fontSize = `${Math.max(12, miniSize * 1.5)}px`;
            eDot.appendChild(mark);
            
            container.appendChild(eDot);
        }
    }
    
    // 3. 巡回(パトロール)地点 (薄緑の旗マーク)
    else if (s.player._patrolTarget && !s.player._itemTargetPos && !s.player._patrolTargetId) {
        const pDotObj = document.createElement('div');
        pDotObj.style.position = 'absolute';
        pDotObj.style.left = `${s.player._patrolTarget.x * miniSize}px`;
        pDotObj.style.top = `${s.player._patrolTarget.y * miniSize}px`;
        pDotObj.style.width = `${miniSize}px`;
        pDotObj.style.height = `${miniSize}px`;
        pDotObj.style.backgroundColor = 'rgba(76, 175, 80, 0.4)';
        pDotObj.style.zIndex = '5';
        
        const pin = document.createElement('div');
        pin.innerText = '🚩';
        pin.style.position = 'absolute';
        pin.style.top = `-${Math.max(8, miniSize)}px`;
        pin.style.left = '-2px';
        pin.style.fontSize = `${Math.max(10, miniSize)}px`;
        pin.style.opacity = '0.9';
        pDotObj.appendChild(pin);
        
        container.appendChild(pDotObj);
    }

    // ==========================================
    // ★ 新規追加：4. 階段を目指している場合 (青い光と🔽マーク)
    // ==========================================
    // AIの現在の「目的」を判定（思考ロジックをシミュレート）
    let hasUnexplored = false;
    for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (s.visited && !s.visited[ry][rx] && s.grid[ry][rx] !== 1) { hasUnexplored = true; break; } } if (hasUnexplored) break; }
    
    let hasFood = s.player.hunger > 30;
    let windDanger = (s.floorTurn || 0) >= 850;
    let wantsToDescend = (!hasUnexplored && hasFood && !windDanger) || !hasFood || windDanger; // 基本的な降りる条件
    let wantsToGrind = false; // 修練モード判定（簡易版）
    if (hasFood && !windDanger && !hasUnexplored && s.mapType === 'crystal') wantsToGrind = true;
    let isHpPinch = s.player.hp < s.player.maxHp * 0.5;

    // 「探索が終わった」または「ピンチで修練を中断した」または「空腹・風」で、かつアイテムや敵を追っていない時
    let isHeadingToStairs = (wantsToDescend || (wantsToGrind && isHpPinch)) && !s.player._itemTargetPos && !s.player._patrolTargetId;

    if (isHeadingToStairs) {
        let stairX = -1, stairY = -1;
        // マップ上から発見済みの階段を探す
        for(let y=0; y<s.mapHeight; y++) {
            for(let x=0; x<s.mapWidth; x++) {
                if (s.grid[y][x] === 2 && s.visited && s.visited[y][x]) { stairX = x; stairY = y; break; }
            }
            if (stairX !== -1) break;
        }

        if (stairX !== -1) {
            const sDot = document.createElement('div');
            sDot.style.position = 'absolute';
            sDot.style.left = `${stairX * miniSize}px`;
            sDot.style.top = `${stairY * miniSize}px`;
            sDot.style.width = `${miniSize}px`;
            sDot.style.height = `${miniSize}px`;
            sDot.style.backgroundColor = 'rgba(0, 188, 212, 0.4)';
            sDot.style.animation = 'ai-stair-glow 0.6s infinite alternate';
            sDot.style.animationDelay = `-${(Date.now() % 1000) / 1000}s`;
            sDot.style.zIndex = '15';
            
            const arrow = document.createElement('div');
            arrow.innerText = '🔽';
            arrow.style.position = 'absolute';
            arrow.style.top = `-${Math.max(10, miniSize * 1.2)}px`;
            arrow.style.left = `-${Math.max(2, miniSize / 4)}px`;
            arrow.style.fontSize = `${Math.max(10, miniSize * 1.2)}px`;
            arrow.style.animation = 'ai-stair-bounce 0.4s infinite alternate';
            arrow.style.animationDelay = `-${(Date.now() % 1000) / 1000}s`;
            sDot.appendChild(arrow);
            
            container.appendChild(sDot);
        }
    }
}; // ← 元々あった関数を閉じるカッコです

// ★ダメージ数値をポップアップさせ、画面全体の揺れだけを行う
window.showDungeonDamageEffect = function(x, y, dmg, isPlayer) {
    const gridDiv = document.getElementById('dg-grid');
    const container = document.getElementById('dg-map-container');
    if (!gridDiv || !container) return;

    // 画面全体の振動
    container.classList.remove('anim-screen-shake');
    void container.offsetWidth; 
    container.classList.add('anim-screen-shake');

    setTimeout(() => {
        const s = window.DUNGEON_STATE;
        const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
        const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
        const logicalTileX = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
        const logicalTileY = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

        // 数値のポップアップのみ生成
        const popup = document.createElement('div');
        popup.innerText = dmg;
        popup.className = 'dmg-text';
        popup.style.position = 'absolute';
        popup.style.left = `${x * logicalTileX + (logicalTileX / 2) - 15}px`;
        popup.style.top = `${y * logicalTileY + 20}px`;
        popup.style.color = isPlayer ? '#ff5252' : '#FFF';
        popup.style.fontWeight = 'bold';
        popup.style.fontSize = '24px';
        popup.style.textShadow = '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
        popup.style.zIndex = '5000';
        popup.style.pointerEvents = 'none';
        popup.style.transition = 'top 0.8s ease-out, opacity 0.8s ease-in';
        
        gridDiv.appendChild(popup);
        
        requestAnimationFrame(() => {
            popup.style.top = `${y * logicalTileY - 40}px`;
            popup.style.opacity = '0';
        });
        setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 800);
    }, 10);
};

// ★最強のエフェクト発生関数（絵文字を排除し、本格的なグラフィックを描画！）
window.playDungeonVFX = function(x, y, type) {
    const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv) return;

    // ★超重要：10ミリ秒だけ「待つ」ことで、updateDungeonUIによる画面の全消去をやり過ごす！
    setTimeout(() => {
        const s = window.DUNGEON_STATE;
        const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
        const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
        const lx = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
        const ly = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

        const vfx = document.createElement('div');
        vfx.style.position = 'absolute';
        vfx.style.left = `${x * lx}px`;
        vfx.style.top = `${y * ly}px`;
        vfx.style.width = `${lx}px`;
        vfx.style.height = `${ly}px`;
        vfx.style.pointerEvents = 'none';
        vfx.style.zIndex = 10000;
        vfx.innerText = ''; // 絵文字は使いません！

        // ==========================================
        // ★ 純粋なCSSグラフィックによるエフェクト表現
        // ==========================================
        if (type === 'warp') {
            // ワープ：空間が収縮して消えるようなシアン色のリング
            vfx.style.border = '4px solid #00BCD4';
            vfx.style.borderRadius = '50%';
            vfx.style.boxShadow = '0 0 15px #00BCD4, inset 0 0 15px #00BCD4';
            vfx.style.animation = 'vfx-warp 0.4s ease-in forwards';
        } else if (type === 'magic') {
            // 魔法詠唱：紫とシアンの発光オーラ
            vfx.style.background = 'radial-gradient(circle, rgba(224,64,251,0.6) 0%, rgba(0,188,212,0.2) 60%, transparent 80%)';
            vfx.style.animation = 'vfx-magic 0.6s ease-out forwards';
        } else if (type === 'level_up') {
            // レベルアップ：足元から天へ立ち昇る黄金の光の柱
            vfx.style.background = 'linear-gradient(to top, rgba(255,215,0,0.8) 0%, rgba(255,235,59,0.4) 50%, transparent 100%)';
            vfx.style.height = `${ly * 2}px`; 
            vfx.style.top = `${y * ly - ly}px`; 
            vfx.style.animation = 'vfx-levelup 0.8s ease-out forwards';
        } else if (type === 'sleep') {
            // 睡眠：敵を包み込む暗い紫のモヤ
            vfx.style.background = 'radial-gradient(circle, rgba(103,58,183,0.8) 0%, transparent 70%)';
            vfx.style.borderRadius = '50%';
            vfx.style.animation = 'vfx-sleep 0.8s ease-in-out forwards';
        } else if (type === 'fire') {
            // ★修正：火竜の杖のエフェクトを「下から上へ燃え上がる炎」に改良（絵文字不使用）
            vfx.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,235,59,0.9) 20%, rgba(255,82,82,0.8) 60%, transparent 80%)';
            vfx.style.borderRadius = '50% 50% 20% 20%';
            vfx.style.animation = 'vfx-fire 0.6s ease-out forwards';
        }

        // 初回実行時のみ、専用のCSSアニメーションをシステムに注入
        if (!document.getElementById('vfx-styles')) {
            const style = document.createElement('style');
            style.id = 'vfx-styles';
            style.innerHTML = `
                @keyframes vfx-warp { 0% { transform: scale(1.5); opacity: 0; } 20% { transform: scale(1.2); opacity: 1; filter: brightness(2); } 100% { transform: scale(0); opacity: 0; } }
                @keyframes vfx-magic { 0% { transform: scale(0.5) rotate(0deg); opacity: 1; } 100% { transform: scale(1.5) rotate(180deg); opacity: 0; } }
                @keyframes vfx-levelup { 0% { transform: scaleY(0); opacity: 0; transform-origin: bottom; } 20% { transform: scaleY(1); opacity: 1; transform-origin: bottom; } 80% { transform: scaleY(1); opacity: 1; filter: brightness(1.5); transform-origin: bottom; } 100% { transform: scaleY(1.2); opacity: 0; transform-origin: bottom; } }
                @keyframes vfx-sleep { 0% { transform: scale(0.8) translateY(0); opacity: 0; } 50% { transform: scale(1.1) translateY(-10px); opacity: 1; } 100% { transform: scale(1.3) translateY(-20px); opacity: 0; } }
                /* ★修正：炎の動きをダイナミックに */
                @keyframes vfx-fire { 
                    0% { transform: scale(0.5) translateY(20px); opacity: 1; filter: brightness(2); } 
                    50% { transform: scale(1.2) translateY(-10px); opacity: 1; } 
                    100% { transform: scale(1.5) translateY(-30px); opacity: 0; filter: brightness(1); } 
                }
            `;
            document.head.appendChild(style);
        }

        gridDiv.appendChild(vfx);
        setTimeout(() => { if (vfx.parentNode) vfx.parentNode.removeChild(vfx); }, 800);
        
    }, 10); // ★10ミリ秒の待機終了
};

// ★新規追加：魔法の弾を飛ばすエフェクト
window.playProjectileVFX = function(sx, sy, tx, ty, color) {
    const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv) return;
    const s = window.DUNGEON_STATE;
    const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
    const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
    const lx = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
    const ly = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

    const vfx = document.createElement('div');
    vfx.style.position = 'absolute';
    vfx.style.left = `${sx * lx + lx/2 - 15}px`;
    vfx.style.top = `${sy * ly + ly/2 - 15}px`;
    vfx.style.width = '30px'; vfx.style.height = '30px';
    vfx.style.borderRadius = '50%'; vfx.style.background = color;
    vfx.style.boxShadow = `0 0 20px ${color}, inset 0 0 10px #fff`;
    vfx.style.zIndex = 10000; vfx.style.pointerEvents = 'none';
    vfx.style.transition = 'all 0.15s linear'; // 弾の飛ぶ速度
    
    gridDiv.appendChild(vfx);
    setTimeout(() => { vfx.style.left = `${tx * lx + lx/2 - 15}px`; vfx.style.top = `${ty * ly + ly/2 - 15}px`; }, 10);
    setTimeout(() => { if (vfx.parentNode) vfx.parentNode.removeChild(vfx); }, 160);
};

window.addDungeonLog = function(text, color = "#ddd") {
    // ★内部のログデータ配列も100行に制限する（BGM判定などで使うため）
    const s = window.DUNGEON_STATE;
    if (s) {
        if (!s.logs) s.logs = [];
        s.logs.push(text);
        if (s.logs.length > 100) s.logs.shift(); 
    }

    const logArea = document.getElementById('dg-log-area');
    if (!logArea) return;
    const line = document.createElement('div');
    line.innerHTML = `<span style="color:#888;">[Turn]</span> <span style="color:${color}">${text}</span>`;
    logArea.appendChild(line);
    
    // ★大修正：表示されるログのDOM要素を最新の100行に制限し、ブラウザの負荷を完全に消し去る！
    while (logArea.children.length > 100) {
        logArea.removeChild(logArea.firstChild);
    }
    
    logArea.scrollTop = logArea.scrollHeight;
};

// ==========================================
// ★新規追加：装備詳細と印の効果を確認するモーダル
// ==========================================
window.showEquipDetailsModal = function() {
    let modal = document.getElementById('dg-equip-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dg-equip-details-modal';
        // ★修正：z-indexを 20000 から 40000 に引き上げ、ダンジョン画面より手前に表示する！
        modal.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 600px; height: 75%; background: rgba(15, 15, 20, 0.95); border: 3px solid #FF9800; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; z-index: 40000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: #fff; font-family: sans-serif;`;
        document.body.appendChild(modal);
    }

    const s = window.DUNGEON_STATE;
    const p = s.player;
    
    let html = `<h3 style="margin-top:0; color:#FF9800; border-bottom:1px solid #555; padding-bottom:10px;">🔍 装備詳細と印の効果</h3>`;
    html += `<div style="flex:1; overflow-y:auto; padding-right:10px;">`;

    const renderEquip = (slotItem, typeName, icon, color) => {
        if (!slotItem) return `<div style="margin-bottom:15px; color:#666;">${icon} ${typeName}：装備なし</div>`;
        
        let eff = window.getDungeonItemEffect(slotItem);
        let parsed = window.parseItemString(slotItem);
        let res = `<div style="margin-bottom:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; border-left:4px solid ${color};">`;
        res += `<div style="font-size:16px; font-weight:bold; color:${color}; margin-bottom:5px;">${icon} ${eff.name}</div>`;
        
        if (eff.atk > 0) res += `<span style="font-size:13px; margin-right:15px; color:#ccc;">攻撃力: <span style="color:#FFF;">${eff.atk}</span></span>`;
        if (eff.def > 0) res += `<span style="font-size:13px; margin-right:15px; color:#ccc;">防御力: <span style="color:#FFF;">${eff.def}</span></span>`;
        
        // ★修正：parsed.seals(後付けの印) ではなく、eff.traits(固有印も含むすべての印) を表示する
        let uniqueSeals = [...new Set(eff.traits)]; // 重複を排除
        if (uniqueSeals.length > 0) {
            res += `<div style="margin-top:8px; font-size:13px; color:#ddd; background:#111; padding:8px; border-radius:4px;">`;
            uniqueSeals.forEach(sealId => {
                let sData = window.SEAL_DESCRIPTIONS[sealId];
                if (sData) {
                    res += `<div style="margin-bottom:4px;"><span style="color:#FFD700; font-weight:bold;">[${sData.name}]</span> ${sData.desc}</div>`;
                }
            });
            res += `</div>`;
        } else {
            res += `<div style="margin-top:8px; font-size:12px; color:#666;">付与されている印はありません。</div>`;
        }
        res += `</div>`;
        return res;
    };

    html += renderEquip(p.equipWeapon, '武器', '⚔️', '#FFD700');
    html += renderEquip(p.equipShield, '盾', '🛡️', '#4fc3f7');
    html += renderEquip(p.equipArmor, '鎧', '👕', '#8BC34A');
    html += renderEquip(p.equipAccessory, '装飾品', '💍', '#E040FB');

    html += `</div>`;
    html += `<button onclick="document.getElementById('dg-equip-details-modal').style.display='none'" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>`;

    modal.innerHTML = html;
    modal.style.display = 'flex';
};

window.createDungeonSprite = function(spriteKey, logicalY, brightness = 1.0, isEnemy = false, logicalTileX = 100, existingDiv = null) {
    const sp = window.DUNGEON_SPRITES[spriteKey]; 
    if (!sp) return null;
    
    const isOverlay = spriteKey.startsWith('skull_') || spriteKey.startsWith('crystal_') || 
                      spriteKey.startsWith('gimmick_') || spriteKey.startsWith('trap_') || spriteKey.startsWith('spr_item_');
    
    const div = existingDiv || document.createElement('div');
    const inner = existingDiv ? div.firstChild : document.createElement('div');

    if (!existingDiv) {
        div.style.position = 'absolute'; 
        div.style.display = 'flex'; 
        div.style.justifyContent = 'center'; 
        div.style.alignItems = isOverlay ? 'flex-end' : 'center'; 
        div.style.overflow = 'visible'; 
        
        inner.style.backgroundRepeat = 'no-repeat'; 
        inner.style.flexShrink = '0';
        div.appendChild(inner);
    }

    div.style.width = `${sp.sw}px`; 
    div.style.height = `${sp.sh}px`;
    div.style.zIndex = logicalY; 
    
    inner.style.width = `${sp.sw}px`; 
    inner.style.height = `${sp.sh}px`;
    inner.style.backgroundImage = `url('${sp.img}')`; 
    inner.style.backgroundPosition = `-${sp.sx}px -${sp.sy}px`; 
    
    let filterStr = brightness < 1.0 ? `brightness(${brightness}) ` : '';
    if (isEnemy) filterStr += "sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(0.7) ";
    inner.style.filter = filterStr.trim();
    
    let fitScaleX = 1.0;
    let fitScaleY = 1.0;
    if (spriteKey.startsWith('gimmick_') || spriteKey.startsWith('trap_') || spriteKey.startsWith('spr_item_')) {
        fitScaleX = logicalTileX / sp.sw;
        // ★修正：縦幅が微妙に足りない画像を、強制的にタイルサイズに合わせて引き延ばす！
        fitScaleY = logicalTileX / sp.sh; 
    }
    
    inner.style.transform = `scale(${sp.scale * fitScaleX}, ${sp.scale * fitScaleY})`;
    inner.style.transformOrigin = isOverlay ? 'bottom center' : 'center center'; 
    
    return div;
};

window.applyDungeonWalkCosmetics = function(spriteDiv, targetPet, spriteKey) {
    if (!spriteDiv || !targetPet || !targetPet.cosmetic) return;
    const cosmetic = targetPet.cosmetic || {};
    const inner = spriteDiv.firstElementChild;
    const sp = window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[spriteKey];
    if (!inner || !sp) return;

    const baseFilter = String(inner.style.filter || '').replace(/\s*hue-rotate\([^)]*\)/g, '').trim();
    const rainbowColors = Array.isArray(cosmetic.rainbowColors)
        ? cosmetic.rainbowColors.filter(color => /^#[0-9a-f]{6}$/i.test(String(color))).slice(0, 7)
        : [];
    let cosmeticCanvas = inner.querySelector(':scope > .dungeon-walk-cosmetic-canvas');

    if (rainbowColors.length >= 2 && typeof window.drawCosmeticImageOnContext === 'function') {
        if (!cosmeticCanvas) {
            cosmeticCanvas = document.createElement('canvas');
            cosmeticCanvas.className = 'dungeon-walk-cosmetic-canvas';
            cosmeticCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
            inner.style.position = 'relative';
            inner.prepend(cosmeticCanvas);
        }
        cosmeticCanvas.width = Math.max(1, Math.round(sp.sw || 1));
        cosmeticCanvas.height = Math.max(1, Math.round(sp.sh || 1));
        inner.style.filter = baseFilter;
        const imageCache = window._dungeonWalkCosmeticImages || (window._dungeonWalkCosmeticImages = {});
        const imageUrl = sp.img;
        let img = typeof images !== 'undefined' ? images[imageUrl] : null;
        if (!img) {
            img = imageCache[imageUrl];
            if (!img) {
                img = new Image();
                imageCache[imageUrl] = img;
                img.onload = () => {
                    if (spriteDiv.isConnected) window.applyDungeonWalkCosmetics(spriteDiv, targetPet, spriteKey);
                };
                img.src = imageUrl;
            }
        }
        if (img && img.complete && img.naturalWidth > 0) {
            const canvasCtx = cosmeticCanvas.getContext('2d');
            canvasCtx.clearRect(0, 0, cosmeticCanvas.width, cosmeticCanvas.height);
            window.drawCosmeticImageOnContext(canvasCtx, img, sp.sx || 0, sp.sy || 0, sp.sw || 1, sp.sh || 1, 0, 0, cosmeticCanvas.width, cosmeticCanvas.height, targetPet);
            inner.style.backgroundImage = 'none';
        }
    } else {
        if (cosmeticCanvas) cosmeticCanvas.remove();
        const hue = typeof window.getCosmeticHue === 'function' ? window.getCosmeticHue(targetPet) : Number(cosmetic.hue || 0);
        inner.style.filter = [baseFilter, hue ? `hue-rotate(${hue}deg)` : ''].filter(Boolean).join(' ');
    }

    let auraLayer = spriteDiv.querySelector(':scope > .dg-cosmetic-aura');
    const aura = cosmetic.aura || 'none';
    if (aura && aura !== 'none') {
        if (!document.getElementById('dg-cosmetic-aura-style')) {
            const style = document.createElement('style');
            style.id = 'dg-cosmetic-aura-style';
            style.textContent = '@keyframes dgAuraRise{0%{transform:translate(-50%,0) rotate(0deg);opacity:.9}50%{transform:translate(35%,-70%) rotate(180deg);opacity:.55}100%{transform:translate(-50%,-145%) rotate(360deg);opacity:0}}';
            document.head.appendChild(style);
        }
        if (!auraLayer) {
            auraLayer = document.createElement('div');
            auraLayer.className = 'dg-cosmetic-aura';
            spriteDiv.appendChild(auraLayer);
        }
        const visualWidth = Math.max(24, (sp.sw || 1) * (sp.scale || 1));
        const visualHeight = Math.max(24, (sp.sh || 1) * (sp.scale || 1));
        auraLayer.style.cssText = `position:absolute;left:50%;top:50%;width:${visualWidth * 1.5}px;height:${visualHeight * 1.5}px;transform:translate(-50%,-50%);pointer-events:none;filter:none;z-index:2;overflow:visible;`;
        const glyphs = { sparkle: '*', heart: '♡', music: '♪', bubble: '○' };
        auraLayer.innerHTML = Array.from({ length: 7 }, (_, i) => {
            const color = typeof window.getCosmeticAuraColor === 'function' ? window.getCosmeticAuraColor(targetPet, i) : (cosmetic.auraColor || '#fff176');
            return `<span style="position:absolute;left:50%;bottom:8%;color:${color};text-shadow:0 0 6px ${color};font-weight:bold;animation:dgAuraRise 1.8s linear infinite;animation-delay:${i * -0.24}s;">${glyphs[aura] || '*'}</span>`;
        }).join('');
    } else if (auraLayer) {
        auraLayer.remove();
    }
};

// ==========================================
// ★新規追加：作戦確認画面のリアルタイム・テレメトリ（生体情報）更新
// ==========================================
window.updateTacticTelemetryUI = function(s) {
    if (!s || !s.player) return;

    // 動的に生成されるリッチな発光CSS（初回のみ注入）
    if (!document.getElementById('telemetry-styles')) {
        const style = document.createElement('style');
        style.id = 'telemetry-styles';
        style.innerHTML = `
            @keyframes telemetry-pulse {
                0% { box-shadow: 0 0 5px #00BCD4, inset 0 0 5px #00BCD4; background-color: rgba(0, 188, 212, 0.1); border-color: #00BCD4; }
                100% { box-shadow: 0 0 15px #00BCD4, inset 0 0 15px #00BCD4; background-color: rgba(0, 188, 212, 0.4); border-color: #4DD0E1; }
            }
            .dg-rule-telemetry-active {
                animation: telemetry-pulse 0.8s infinite alternate !important;
                transition: all 0.2s ease;
                border-left: 6px solid #00BCD4 !important;
                transform: scale(1.02); /* 少しだけ手前に浮かび上がる */
                z-index: 10;
                position: relative; /* transformを効かせるため */
            }
        `;
        document.head.appendChild(style);
    }

    // 作戦ビューアが開いているかチェック
    const viewer = document.getElementById('dg-in-battle-tactic-viewer');
    if (!viewer || viewer.style.display === 'none') return;

    // クラス名 'dg-rule-row' が付与された行をすべて取得
    const rows = viewer.querySelectorAll('.dg-rule-row');
    if (rows.length === 0) return;

    let activeIdx = s.player._activeRuleIndex;

    rows.forEach((row, index) => {
        if (index === activeIdx) {
            row.classList.add('dg-rule-telemetry-active');
        } else {
            row.classList.remove('dg-rule-telemetry-active');
        }
    });
};
