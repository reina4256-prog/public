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


    "magician_down": { "img": "magician_dungeon_walk.png", "sx": 43, "sy": 42, "sw": 835, "sh": 1014, "scale": 0.4 },
    "magician_up": { "img": "magician_dungeon_walk.png", "sx": 1020, "sy": 42, "sw": 855, "sh": 1014, "scale": 0.4 },
    "magician_left": { "img": "magician_dungeon_walk.png", "sx": 43, "sy": 1169, "sw": 835, "sh": 1014, "scale": 0.4 },
    "magician_right": { "img": "magician_dungeon_walk.png", "sx": 1036, "sy": 1169, "sw": 835, "sh": 1014, "scale": 0.4 },

    "spirit_down": {
        "img": "spirit_dungeon_walk.png",
        "sx": 99,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_up": {
        "img": "spirit_dungeon_walk.png",
        "sx": 997,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_left": {
        "img": "spirit_dungeon_walk.png",
        "sx": 99,
        "sy": 1249,
        "sw": 697,
        "sh": 1012,
        "scale": 0.30000000000000004
    },
    "spirit_right": {
        "img": "spirit_dungeon_walk.png",
        "sx": 970,
        "sy": 1249,
        "sw": 697,
        "sh": 1012,
        "scale": 0.30000000000000004
    },
    "spirit_type1_down": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 45,
        "sy": 6,
        "sw": 791,
        "sh": 1156,
        "scale": 0.30000000000000004
    },
    "spirit_type1_up": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 945,
        "sy": 6,
        "sw": 791,
        "sh": 1156,
        "scale": 0.30000000000000004
    },
    "spirit_type1_left": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 1012,
        "sy": 1249,
        "sw": 697,
        "sh": 1125,
        "scale": 0.30000000000000004
    },
    "spirit_type1_right": {
        "img": "spirit_type1_dungeon_walk.png",
        "sx": 92,
        "sy": 1249,
        "sw": 697,
        "sh": 1125,
        "scale": 0.30000000000000004
    },
    "spirit_type1_2_down": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 98,
        "sy": 113,
        "sw": 814,
        "sh": 1052,
        "scale": 0.30000000000000004
    },
    "spirit_type1_2_up": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 948,
        "sy": 113,
        "sw": 814,
        "sh": 1052,
        "scale": 0.30000000000000004
    },
    "spirit_type1_2_left": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 973,
        "sy": 1177,
        "sw": 814,
        "sh": 1052,
        "scale": 0.30000000000000004
    },
    "spirit_type1_2_right": {
        "img": "spirit_type1_2_dungeon_walk.png",
        "sx": 78,
        "sy": 1177,
        "sw": 814,
        "sh": 1052,
        "scale": 0.30000000000000004
    },
    "spirit_type2_down": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 11,
        "sy": 24,
        "sw": 841,
        "sh": 1137,
        "scale": 0.30000000000000004
    },
    "spirit_type2_up": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 953,
        "sy": 21,
        "sw": 829,
        "sh": 1136,
        "scale": 0.30000000000000004
    },
    "spirit_type2_left": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 953,
        "sy": 1217,
        "sw": 829,
        "sh": 1136,
        "scale": 0.30000000000000004
    },
    "spirit_type2_right": {
        "img": "spirit_type2_dungeon_walk.png",
        "sx": 11,
        "sy": 1217,
        "sw": 829,
        "sh": 1136,
        "scale": 0.30000000000000004
    },
    "spirit_type2_2_down": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 119,
        "sy": 63,
        "sw": 743,
        "sh": 897,
        "scale": 0.30000000000000004
    },
    "spirit_type2_2_up": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 1338,
        "sy": 63,
        "sw": 697,
        "sh": 888,
        "scale": 0.30000000000000004
    },
    "spirit_type2_2_left": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 1338,
        "sy": 952,
        "sw": 697,
        "sh": 888,
        "scale": 0.30000000000000004
    },
    "spirit_type2_2_right": {
        "img": "spirit_type2_2_dungeon_walk.png",
        "sx": 178,
        "sy": 952,
        "sw": 697,
        "sh": 888,
        "scale": 0.30000000000000004
    },
    "spirit_type2_3_down": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 36,
        "sy": 42,
        "sw": 947,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type2_3_up": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 1042,
        "sy": 48,
        "sw": 935,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type2_3_left": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 85,
        "sy": 1069,
        "sw": 947,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type2_3_right": {
        "img": "spirit_type2_3_dungeon_walk.png",
        "sx": 1032,
        "sy": 1069,
        "sw": 947,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type3_down": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 25,
        "sy": 14,
        "sw": 790,
        "sh": 1146,
        "scale": 0.30000000000000004
    },
    "spirit_type3_up": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 923,
        "sy": 14,
        "sw": 790,
        "sh": 1146,
        "scale": 0.30000000000000004
    },
    "spirit_type3_left": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 986,
        "sy": 1247,
        "sw": 715,
        "sh": 1149,
        "scale": 0.30000000000000004
    },
    "spirit_type3_right": {
        "img": "spirit_type3_dungeon_walk.png",
        "sx": 83,
        "sy": 1237,
        "sw": 715,
        "sh": 1149,
        "scale": 0.30000000000000004
    },
    "spirit_type3_2_down": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 99,
        "sy": 37,
        "sw": 734,
        "sh": 1068,
        "scale": 0.30000000000000004
    },
    "spirit_type3_2_up": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 1065,
        "sy": 35,
        "sw": 722,
        "sh": 1076,
        "scale": 0.30000000000000004
    },
    "spirit_type3_2_left": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 113,
        "sy": 1150,
        "sw": 697,
        "sh": 1096,
        "scale": 0.30000000000000004
    },
    "spirit_type3_2_right": {
        "img": "spirit_type3_2_dungeon_walk.png",
        "sx": 1066,
        "sy": 1150,
        "sw": 697,
        "sh": 1096,
        "scale": 0.30000000000000004
    },
    "spirit_type4_down": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 5,
        "sy": -13,
        "sw": 883,
        "sh": 1182,
        "scale": 0.30000000000000004
    },
    "spirit_type4_up": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 957,
        "sy": 3,
        "sw": 865,
        "sh": 1171,
        "scale": 0.30000000000000004
    },
    "spirit_type4_left": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 99,
        "sy": 1195,
        "sw": 718,
        "sh": 1163,
        "scale": 0.30000000000000004
    },
    "spirit_type4_right": {
        "img": "spirit_type4_dungeon_walk.png",
        "sx": 1005,
        "sy": 1195,
        "sw": 745,
        "sh": 1163,
        "scale": 0.30000000000000004
    },
    "spirit_type4_2_down": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 141,
        "sy": 46,
        "sw": 881,
        "sh": 949,
        "scale": 0.30000000000000004
    },
    "spirit_type4_2_up": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 1203,
        "sy": 46,
        "sw": 881,
        "sh": 949,
        "scale": 0.30000000000000004
    },
    "spirit_type4_2_left": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 1215,
        "sy": 978,
        "sw": 881,
        "sh": 949,
        "scale": 0.30000000000000004
    },
    "spirit_type4_2_right": {
        "img": "spirit_type4_2_dungeon_walk.png",
        "sx": 124,
        "sy": 978,
        "sw": 881,
        "sh": 949,
        "scale": 0.30000000000000004
    },
    "spirit_type4_3_down": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 11,
        "sy": 14,
        "sw": 889,
        "sh": 991,
        "scale": 0.30000000000000004
    },
    "spirit_type4_3_up": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 1168,
        "sy": 14,
        "sw": 901,
        "sh": 991,
        "scale": 0.30000000000000004
    },
    "spirit_type4_3_left": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 209,
        "sy": 1007,
        "sw": 505,
        "sh": 991,
        "scale": 0.30000000000000004
    },
    "spirit_type4_3_right": {
        "img": "spirit_type4_3_dungeon_walk.png",
        "sx": 936,
        "sy": 1007,
        "sw": 497,
        "sh": 991,
        "scale": 0.30000000000000004
    },
    "spirit_type5_down": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 33,
        "sy": -10,
        "sw": 869,
        "sh": 1155,
        "scale": 0.30000000000000004
    },
    "spirit_type5_up": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 933,
        "sy": -10,
        "sw": 869,
        "sh": 1155,
        "scale": 0.30000000000000004
    },
    "spirit_type5_left": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 33,
        "sy": 1201,
        "sw": 869,
        "sh": 1155,
        "scale": 0.30000000000000004
    },
    "spirit_type5_right": {
        "img": "spirit_type5_dungeon_walk.png",
        "sx": 933,
        "sy": 1201,
        "sw": 869,
        "sh": 1155,
        "scale": 0.30000000000000004
    },
    "spirit_type5_2_down": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 232,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type5_2_up": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 1219,
        "sy": 63,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type5_2_left": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 232,
        "sy": 1008,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type5_2_right": {
        "img": "spirit_type5_2_dungeon_walk.png",
        "sx": 1198,
        "sy": 1008,
        "sw": 697,
        "sh": 1005,
        "scale": 0.30000000000000004
    },
    "spirit_type5_3_down": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 113,
        "sy": 63,
        "sw": 749,
        "sh": 1060,
        "scale": 0.30000000000000004
    },
    "spirit_type5_3_up": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 978,
        "sy": 58,
        "sw": 770,
        "sh": 1067,
        "scale": 0.30000000000000004
    },
    "spirit_type5_3_left": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 57,
        "sy": 1158,
        "sw": 794,
        "sh": 1060,
        "scale": 0.30000000000000004
    },
    "spirit_type5_3_right": {
        "img": "spirit_type5_3_dungeon_walk.png",
        "sx": 1015,
        "sy": 1158,
        "sw": 794,
        "sh": 1060,
        "scale": 0.30000000000000004
    },


    "dragon_down": { "img": "dragon_dungeon_walk.png", "sx": 60, "sy": 63, "sw": 870, "sh": 864, "scale": 0.4 },
    "dragon_up": { "img": "dragon_dungeon_walk.png", "sx": 1045, "sy": 73, "sw": 882, "sh": 940, "scale": 0.4 },
    "dragon_left": { "img": "dragon_dungeon_walk.png", "sx": 60, "sy": 1175, "sw": 870, "sh": 927, "scale": 0.4 },
    "dragon_right": { "img": "dragon_dungeon_walk.png", "sx": 1053, "sy": 1175, "sw": 870, "sh": 927, "scale": 0.4 },
    "machine_down": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 1100, "sw": 603, "sh": 864, "scale": 0.4 },
    "machine_up": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 90, "sw": 603, "sh": 864, "scale": 0.4 },
    "machine_left": { "img": "machine_dungeon_walk.png", "sx": 30, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.4 },
    "machine_right": { "img": "machine_dungeon_walk.png", "sx": 1391, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.4 },
    "stone_down": { "img": "stone_dungeon_walk.png", "sx": 94, "sy": 137, "sw": 836, "sh": 919, "scale": 0.4 },
    "stone_up": { "img": "stone_dungeon_walk.png", "sx": 998, "sy": 137, "sw": 836, "sh": 919, "scale": 0.4 },
    "stone_left": { "img": "stone_dungeon_walk.png", "sx": 94, "sy": 1156, "sw": 843, "sh": 983, "scale": 0.4 },
    "stone_right": { "img": "stone_dungeon_walk.png", "sx": 956, "sy": 1156, "sw": 843, "sh": 983, "scale": 0.4 },
    "seed_down": { "img": "seed_dungeon_walk.png", "sx": 150, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.4 },
    "seed_up": { "img": "seed_dungeon_walk.png", "sx": 941, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.4 },
    "seed_left": { "img": "seed_dungeon_walk.png", "sx": 939, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.4 },
    "seed_right": { "img": "seed_dungeon_walk.png", "sx": 113, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.4 },
    "ghost_down": { "img": "ghost_dungeon_walk.png", "sx": 185, "sy": 138, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_up": { "img": "ghost_dungeon_walk.png", "sx": 1110, "sy": 138, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_left": { "img": "ghost_dungeon_walk.png", "sx": 1148, "sy": 1130, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_right": { "img": "ghost_dungeon_walk.png", "sx": 132, "sy": 1130, "sw": 674, "sh": 782, "scale": 0.4 },
    "balloon_down": { "img": "balloon_dungeon_walk.png", "sx": 168, "sy": 152, "sw": 789, "sh": 845, "scale": 0.4 },
    "balloon_up": { "img": "balloon_dungeon_walk.png", "sx": 1162, "sy": 152, "sw": 818, "sh": 845, "scale": 0.4 },
    "balloon_left": { "img": "balloon_dungeon_walk.png", "sx": 1172, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.4 },
    "balloon_right": { "img": "balloon_dungeon_walk.png", "sx": 173, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.4 },
    "beetle_down": { "img": "beetle_dungeon_walk.png", "sx": 1100, "sy": 76, "sw": 683, "sh": 997, "scale": 0.4 },
    "beetle_up": { "img": "beetle_dungeon_walk.png", "sx": 152, "sy": 76, "sw": 683, "sh": 1001, "scale": 0.4 },
    "beetle_left": { "img": "beetle_dungeon_walk.png", "sx": 1039, "sy": 1149, "sw": 785, "sh": 1001, "scale": 0.4 },
    "beetle_right": { "img": "beetle_dungeon_walk.png", "sx": 120, "sy": 1149, "sw": 785, "sh": 1001, "scale": 0.4 },
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

            pDiv.classList.remove('anim-atk-up', 'anim-atk-down', 'anim-atk-left', 'anim-atk-right', 'anim-damage', 'anim-knockback', 'anim-levelup', 'anim-magic');
            void pDiv.offsetWidth; 
            if (s.player.attackAnim) { pDiv.classList.add(`anim-atk-${s.player.face}`); s.player.attackAnim = false; }
            if (s.player.damageAnim) { pDiv.classList.add(`anim-damage`); s.player.damageAnim = false; } 
            if (s.player.knockbackAnim) { pDiv.classList.add(`anim-knockback`); s.player.knockbackAnim = false; } 
            if (s.player.levelUpAnim) { pDiv.classList.add(`anim-levelup`); s.player.levelUpAnim = false; } 
            if (s.player.magicAnim) { pDiv.classList.add(`anim-magic`); s.player.magicAnim = false; } 
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

    let lvlEl = document.getElementById('dg-level');
    if (lvlEl) {
        lvlEl.innerText = s.player.level || 1;
    } else {
        let allSpans = document.querySelectorAll('span');
        allSpans.forEach(span => { if (span.innerText.includes('Lv.')) span.innerText = `Lv.${s.player.level || 1}`; });
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

    const wordsContainer = document.getElementById('dg-known-words'); 
    if (wordsContainer) {
        const myWords = (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.learnedWords) ? window.aiPet.apprentice.learnedWords : [];
        let validCmds = [];
        myWords.forEach(w => { 
            let cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w); 
            if (cmdInfo) validCmds.push(cmdInfo); 
        });
        
        if (validCmds.length === 0) { 
            wordsContainer.innerHTML = `<span style="color:#aaa; font-size:12px;">※言葉を知らないのでランダムに行動します</span>`; 
        } else { 
            wordsContainer.innerHTML = validCmds.map(c => `<span style="background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 8px; border: 2px solid #00BCD4; color: #00BCD4; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">${c.name}</span>`).join(''); 
        }
    }

    const minimap = document.getElementById('dg-modal-minimap'); if (minimap && minimap.style.display !== 'none') window.drawMinimap();
};

window.drawMinimap = function() {
    const s = window.DUNGEON_STATE; 
    const container = document.getElementById('dg-minimap-content'); 
    if (!container) return;

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
    container.innerHTML = '';
    
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
};

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
    const logArea = document.getElementById('dg-log-area');
    if (!logArea) return;
    const line = document.createElement('div');
    line.innerHTML = `<span style="color:#888;">[Turn]</span> <span style="color:${color}">${text}</span>`;
    logArea.appendChild(line);
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
        
        if (parsed.seals.length > 0) {
            res += `<div style="margin-top:8px; font-size:13px; color:#ddd; background:#111; padding:8px; border-radius:4px;">`;
            parsed.seals.forEach(sealId => {
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