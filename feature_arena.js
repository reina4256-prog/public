// ==========================================
// ⚔️ エンドコンテンツ：闘技場システム (feature_arena.js)
// ==========================================

if (typeof window.DUNGEON_SPRITES !== 'undefined') {
    // 既存のロボットと背景
    if (!window.DUNGEON_SPRITES["arena_robot"]) {
        window.DUNGEON_SPRITES["arena_robot"] = { "img": "robot_battle_enemy.png", "sx": 464, "sy": 67, "sw": 1854, "sh": 1370, "scale": 0.15 };
    }
    if (!window.DUNGEON_SPRITES["arena_fld_bg"]) {
        window.DUNGEON_SPRITES["arena_fld_bg"] = { "img": "battle_field.png", "sx": 0, "sy": 0, "sw": 2780, "sh": 1402, "scale": 0.5 };
    }
    
    // 基本の10種の敵データ
    window.DUNGEON_SPRITES["arena_ghost"] = { "img": "ghost_battle_enemy.png", "sx": 916, "sy": 67, "sw": 1000, "sh": 1346, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon"] = { "img": "balloon_battle_enemy.png", "sx": 600, "sy": 131, "sw": 1621, "sh": 1305, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone"] = { "img": "stone_battle_enemy.png", "sx": 346, "sy": 92, "sw": 2124, "sh": 1366, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine"] = { "img": "machine_battle_enemy.png", "sx": 880, "sy": 92, "sw": 1051, "sh": 1366, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird"] = { "img": "bird_battle_enemy.png", "sx": 880, "sy": 92, "sw": 1051, "sh": 1390, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon"] = { "img": "dragon_battle_enemy.png", "sx": 190, "sy": 92, "sw": 2480, "sh": 1390, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed"] = { "img": "seed_battle_enemy.png", "sx": 922, "sy": 92, "sw": 1019, "sh": 1390, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician"] = { "img": "magician_battle_enemy.png", "sx": 467, "sy": 83, "sw": 2019, "sh": 1390, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit"] = { "img": "spirit_battle_enemy.png", "sx": 467, "sy": 83, "sw": 2019, "sh": 1390, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle"] = { "img": "beetle_battle_enemy.png", "sx": 913, "sy": 83, "sw": 1019, "sh": 1390, "scale": 0.15000000000000002 };

    // ★今回調整いただいた10種のNPC・ゲスト・助っ人データ
    window.DUNGEON_SPRITES["arena_king"] = { "img": "king_battle_enemy.png", "sx": 867, "sy": 0, "sw": 1085, "sh": 1524, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_captain"] = { "img": "captain_battle_enemy.png", "sx": 758, "sy": 0, "sw": 1248, "sh": 1524, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_soldier"] = { "img": "soldier_battle_enemy.png", "sx": 758, "sy": 0, "sw": 1248, "sh": 1524, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_farming"] = { "img": "scarecrow_pumpkin_battle_enemy.png", "sx": 758, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_farmer"] = { "img": "farmer_battle_enemy.png", "sx": 758, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    
    // ★修正：スキルのマスター名（fishing, building）とキーを一致させる！
    window.DUNGEON_SPRITES["arena_fishing"] = { "img": "fisherman_battle_enemy.png", "sx": 839, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_building"] = { "img": "builder_battle_enemy.png", "sx": 839, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    
    window.DUNGEON_SPRITES["arena_smithing"] = { "img": "smith_battle_enemy.png", "sx": 794, "sy": 0, "sw": 1344, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_cooking"] = { "img": "chef_battle_enemy.png", "sx": 439, "sy": 0, "sw": 1766, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_explore"] = { "img": "adventurer_battle_enemy.png", "sx": 794, "sy": 0, "sw": 1344, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_pharmacist"] = { "img": "pharmacist_battle_enemy.png", "sx": 266, "sy": 69, "sw": 1344, "sh": 2369, "scale": 0.08 };
    window.DUNGEON_SPRITES["arena_tailor"] = { "img": "tailor_battle_enemy.png", "sx": 933, "sy": 69, "sw": 991, "sh": 1499, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_pastry_chef"] = { "img": "pastry_chef_battle_enemy.png", "sx": 933, "sy": 69, "sw": 991, "sh": 1499, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_hairdresser"] = { "img": "hairdresser_battle_enemy.png", "sx": 925, "sy": 17, "sw": 991, "sh": 1540, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_concierge"] = { "img": "concierge_battle_enemy.png", "sx": 925, "sy": 17, "sw": 991, "sh": 1540, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_dealer"] = { "img": "dealer_battle_enemy.png", "sx": 925, "sy": 17, "sw": 991, "sh": 1540, "scale": 0.15 };

    // 🤖 Robot Tree (20種 - 座標調整版)
    window.DUNGEON_SPRITES["arena_robot_type1"] = { "img": "robot_type1_battle_enemy.png", "sx": 588, "sy": 3, "sw": 1302, "sh": 1784, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type1_2"] = { "img": "robot_type1_2_battle_enemy.png", "sx": 398, "sy": 7, "sw": 1717, "sh": 1757, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type1_3"] = { "img": "robot_type1_3_battle_enemy.png", "sx": 510, "sy": 32, "sw": 1458, "sh": 1733, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type2"] = { "img": "robot_type2_battle_enemy.png", "sx": 559, "sy": 32, "sw": 1377, "sh": 1737, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type2_2"] = { "img": "robot_type2_2_battle_enemy.png", "sx": 617, "sy": 9, "sw": 1270, "sh": 1780, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type2_3"] = { "img": "robot_type2_3_battle_enemy.png", "sx": 681, "sy": 67, "sw": 1177, "sh": 1697, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type2_4"] = { "img": "robot_type2_4_battle_enemy.png", "sx": 85, "sy": 22, "sw": 2335, "sh": 1700, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type3"] = { "img": "robot_type3_battle_enemy.png", "sx": 581, "sy": -39, "sw": 1322, "sh": 1803, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type3_2"] = { "img": "robot_type3_2_battle_enemy.png", "sx": 551, "sy": 38, "sw": 1443, "sh": 1765, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type3_3"] = { "img": "robot_type3_3_battle_enemy.png", "sx": 464, "sy": 67, "sw": 1606, "sh": 1588, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type3_4"] = { "img": "robot_type3_4_battle_enemy.png", "sx": 600, "sy": 12, "sw": 1341, "sh": 1781, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type3_5"] = { "img": "robot_type3_5_battle_enemy.png", "sx": 149, "sy": 42, "sw": 2199, "sh": 1741, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type4"] = { "img": "robot_type4_battle_enemy.png", "sx": 588, "sy": -13, "sw": 1291, "sh": 1785, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type4_2"] = { "img": "robot_type4_2_battle_enemy.png", "sx": 304, "sy": 67, "sw": 1806, "sh": 1684, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type4_3"] = { "img": "robot_type4_3_battle_enemy.png", "sx": 385, "sy": 16, "sw": 1771, "sh": 1768, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type4_4"] = { "img": "robot_type4_4_battle_enemy.png", "sx": 379, "sy": -4, "sw": 1812, "sh": 1796, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type5"] = { "img": "robot_type5_battle_enemy.png", "sx": 397, "sy": -3, "sw": 1742, "sh": 1783, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type5_2"] = { "img": "robot_type5_2_battle_enemy.png", "sx": 623, "sy": -12, "sw": 1289, "sh": 1734, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type5_3"] = { "img": "robot_type5_3_battle_enemy.png", "sx": 516, "sy": -48, "sw": 1482, "sh": 1839, "scale": 0.15 };
    window.DUNGEON_SPRITES["arena_robot_type5_4"] = { "img": "robot_type5_4_battle_enemy.png", "sx": 576, "sy": -37, "sw": 1352, "sh": 1809, "scale": 0.15 };
    
    // 🧚 Spirit Tree
    window.DUNGEON_SPRITES["arena_spirit_type2"] = { "img": "spirit_type2_battle_enemy.png", "sx": 553, "sy": 19, "sw": 1415, "sh": 1743, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type4"] = { "img": "spirit_type4_battle_enemy.png", "sx": 495, "sy": -19, "sw": 1498, "sh": 1731, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type5"] = { "img": "spirit_type5_battle_enemy.png", "sx": 360, "sy": 0, "sw": 1804, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type1"] = { "img": "spirit_type1_battle_enemy.png", "sx": 720, "sy": -14, "sw": 1351, "sh": 1579, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type3"] = { "img": "spirit_type3_battle_enemy.png", "sx": 629, "sy": 61, "sw": 1239, "sh": 1615, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type2_2"] = { "img": "spirit_type2_2_battle_enemy.png", "sx": 345, "sy": 83, "sw": 1864, "sh": 1554, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type2_3"] = { "img": "spirit_type2_3_battle_enemy.png", "sx": 467, "sy": -23, "sw": 1611, "sh": 1801, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type4_2"] = { "img": "spirit_type4_2_battle_enemy.png", "sx": 366, "sy": 40, "sw": 1778, "sh": 1721, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type4_3"] = { "img": "spirit_type4_3_battle_enemy.png", "sx": 350, "sy": -23, "sw": 1767, "sh": 1824, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type5_2"] = { "img": "spirit_type5_2_battle_enemy.png", "sx": 592, "sy": 83, "sw": 1611, "sh": 1641, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type5_3"] = { "img": "spirit_type5_3_battle_enemy.png", "sx": 548, "sy": 40, "sw": 1390, "sh": 1737, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type1_2"] = { "img": "spirit_type1_2_battle_enemy.png", "sx": 278, "sy": 17, "sw": 1973, "sh": 1735, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_spirit_type3_2"] = { "img": "spirit_type3_2_battle_enemy.png", "sx": 603, "sy": -7, "sw": 1495, "sh": 1740, "scale": 0.15000000000000002 };

    // 🧙‍♂️ Magician Tree
    window.DUNGEON_SPRITES["arena_magician_type4"] = { "img": "magician_type4_battle_enemy.png", "sx": 516, "sy": 53, "sw": 1478, "sh": 1685, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type4_2"] = { "img": "magician_type4_2_battle_enemy.png", "sx": 342, "sy": 70, "sw": 1846, "sh": 1654, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type1"] = { "img": "magician_type1_battle_enemy.png", "sx": 538, "sy": -52, "sw": 1414, "sh": 1743, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type1_2"] = { "img": "magician_type1_2_battle_enemy.png", "sx": 412, "sy": 27, "sw": 1705, "sh": 1746, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type5"] = { "img": "magician_type5_battle_enemy.png", "sx": 467, "sy": -12, "sw": 1545, "sh": 1771, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type2"] = { "img": "magician_type2_battle_enemy.png", "sx": 579, "sy": 2, "sw": 1397, "sh": 1735, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type2_2"] = { "img": "magician_type2_2_battle_enemy.png", "sx": 672, "sy": 83, "sw": 1229, "sh": 1684, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type3"] = { "img": "magician_type3_battle_enemy.png", "sx": 500, "sy": 1, "sw": 1511, "sh": 1702, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type4_3"] = { "img": "magician_type4_3_battle_enemy.png", "sx": 51, "sy": -56, "sw": 2401, "sh": 1831, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type4_4"] = { "img": "magician_type4_4_battle_enemy.png", "sx": 149, "sy": -19, "sw": 2093, "sh": 1789, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type1_3"] = { "img": "magician_type1_3_battle_enemy.png", "sx": 359, "sy": -33, "sw": 1809, "sh": 1762, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type1_4"] = { "img": "magician_type1_4_battle_enemy.png", "sx": -4, "sy": 6, "sw": 1965, "sh": 2222, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type5_2"] = { "img": "magician_type5_2_battle_enemy.png", "sx": 360, "sy": -30, "sw": 1803, "sh": 1780, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type5_3"] = { "img": "magician_type5_3_battle_enemy.png", "sx": 570, "sy": 6, "sw": 1427, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type2_3"] = { "img": "magician_type2_3_battle_enemy.png", "sx": 400, "sy": -4, "sw": 1767, "sh": 1763, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type2_4"] = { "img": "magician_type2_4_battle_enemy.png", "sx": 467, "sy": -53, "sw": 1521, "sh": 1835, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type3_2"] = { "img": "magician_type3_2_battle_enemy.png", "sx": 412, "sy": -21, "sw": 1719, "sh": 1755, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_magician_type3_3"] = { "img": "magician_type3_3_battle_enemy.png", "sx": 467, "sy": -31, "sw": 1582, "sh": 1818, "scale": 0.15000000000000002 };

    // 🦅 Bird Tree
    window.DUNGEON_SPRITES["arena_bird_type2"] = { "img": "bird_type2_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type4"] = { "img": "bird_type4_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type5"] = { "img": "bird_type5_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type1"] = { "img": "bird_type1_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type3"] = { "img": "bird_type3_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type3_2"] = { "img": "bird_type3_2_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type2_2"] = { "img": "bird_type2_2_battle_enemy.png", "sx": 11, "sy": 2, "sw": 2111, "sh": 2066, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type4_2"] = { "img": "bird_type4_2_battle_enemy.png", "sx": 26, "sy": -37, "sw": 2494, "sh": 1795, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type5_2"] = { "img": "bird_type5_2_battle_enemy.png", "sx": -9, "sy": -1, "sw": 2508, "sh": 1760, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type1_2"] = { "img": "bird_type1_2_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_bird_type3_3"] = { "img": "bird_type3_3_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };

    // ⚙️ Machine Tree
    window.DUNGEON_SPRITES["arena_machine_type2"] = { "img": "machine_type2_battle_enemy.png", "sx": 65, "sy": 55, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type4"] = { "img": "machine_type4_battle_enemy.png", "sx": 65, "sy": 35, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type5"] = { "img": "machine_type5_battle_enemy.png", "sx": 65, "sy": 7, "sw": 2363, "sh": 1690, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type1"] = { "img": "machine_type1_battle_enemy.png", "sx": 65, "sy": 8, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type3"] = { "img": "machine_type3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type2_2"] = { "img": "machine_type2_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type4_2"] = { "img": "machine_type4_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type5_2"] = { "img": "machine_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type5_3"] = { "img": "machine_type5_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type1_2"] = { "img": "machine_type1_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_machine_type3_2"] = { "img": "machine_type3_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };

    // 🪨 Stone Tree
    window.DUNGEON_SPRITES["arena_stone_type2"] = { "img": "stone_type2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type4"] = { "img": "stone_type4_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type4_2"] = { "img": "stone_type4_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type5"] = { "img": "stone_type5_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type1"] = { "img": "stone_type1_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type3"] = { "img": "stone_type3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type2_2"] = { "img": "stone_type2_2_battle_enemy.png", "sx": 65, "sy": -5, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type4_3"] = { "img": "stone_type4_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type5_2"] = { "img": "stone_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type5_3"] = { "img": "stone_type5_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type1_2"] = { "img": "stone_type1_2_battle_enemy.png", "sx": 65, "sy": 23, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_stone_type3_2"] = { "img": "stone_type3_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };

    // 🎈 Balloon Tree
    window.DUNGEON_SPRITES["arena_balloon_type2"] = { "img": "balloon_type2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type2_2"] = { "img": "balloon_type2_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type4"] = { "img": "balloon_type4_battle_enemy.png", "sx": 3, "sy": -6, "sw": 2500, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type4_2"] = { "img": "balloon_type4_2_battle_enemy.png", "sx": 19, "sy": -6, "sw": 2459, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type1"] = { "img": "balloon_type1_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type1_2"] = { "img": "balloon_type1_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type5"] = { "img": "balloon_type5_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type3"] = { "img": "balloon_type3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type3_2"] = { "img": "balloon_type3_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type2_3"] = { "img": "balloon_type2_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type4_3"] = { "img": "balloon_type4_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type5_2"] = { "img": "balloon_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type1_3"] = { "img": "balloon_type1_3_battle_enemy.png", "sx": 59, "sy": -6, "sw": 2393, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_balloon_type3_3"] = { "img": "balloon_type3_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };

    // 👻 Ghost Tree
    window.DUNGEON_SPRITES["arena_ghost_type2"] = { "img": "ghost_type2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type4"] = { "img": "ghost_type4_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type5"] = { "img": "ghost_type5_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type1"] = { "img": "ghost_type1_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type3"] = { "img": "ghost_type3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type3_2"] = { "img": "ghost_type3_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type2_2"] = { "img": "ghost_type2_2_battle_enemy.png", "sx": 65, "sy": 84, "sw": 1774, "sh": 1935, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type4_2"] = { "img": "ghost_type4_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type5_2"] = { "img": "ghost_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_ghost_type1_2"] = { "img": "ghost_type1_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };

    // 🪲 Beetle Tree
    window.DUNGEON_SPRITES["arena_beetle_type4"] = { "img": "beetle_type4_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type5"] = { "img": "beetle_type5_battle_enemy.png", "sx": -19, "sy": -6, "sw": 2181, "sh": 2068, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type2"] = { "img": "beetle_type2_battle_enemy.png", "sx": 839, "sy": 83, "sw": 1061, "sh": 1435, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type2_2"] = { "img": "beetle_type2_2_battle_enemy.png", "sx": 594, "sy": 7, "sw": 1293, "sh": 1698, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type3"] = { "img": "beetle_type3_battle_enemy.png", "sx": 23, "sy": -6, "sw": 2467, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type1"] = { "img": "beetle_type1_battle_enemy.png", "sx": 581, "sy": 35, "sw": 1331, "sh": 1649, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type4_2"] = { "img": "beetle_type4_2_battle_enemy.png", "sx": 65, "sy": -13, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type5_2"] = { "img": "beetle_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type2_3"] = { "img": "beetle_type2_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_beetle_type2_4"] = { "img": "beetle_type2_4_battle_enemy.png", "sx": 50, "sy": -6, "sw": 2419, "sh": 1765, "scale": 0.15000000000000002 };

    // 🌱 Seed Tree
    window.DUNGEON_SPRITES["arena_seed_type4"] = { "img": "seed_type4_battle_enemy.png", "sx": 724, "sy": 2, "sw": 1030, "sh": 1742, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type1"] = { "img": "seed_type1_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type5"] = { "img": "seed_type5_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type3"] = { "img": "seed_type3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type3_2"] = { "img": "seed_type3_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type2"] = { "img": "seed_type2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type4_2"] = { "img": "seed_type4_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type1_2"] = { "img": "seed_type1_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type5_2"] = { "img": "seed_type5_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type3_3"] = { "img": "seed_type3_3_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_seed_type2_2"] = { "img": "seed_type2_2_battle_enemy.png", "sx": 65, "sy": -6, "sw": 2363, "sh": 1765, "scale": 0.15000000000000002 };

    // 🐉 Dragon Tree
    window.DUNGEON_SPRITES["arena_dragon_type4"] = { "img": "dragon_type4_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type1"] = { "img": "dragon_type1_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type5"] = { "img": "dragon_type5_battle_enemy.png", "sx": -21, "sy": -85, "sw": 2857, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type3"] = { "img": "dragon_type3_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type2"] = { "img": "dragon_type2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type4_2"] = { "img": "dragon_type4_2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type1_2"] = { "img": "dragon_type1_2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type5_2"] = { "img": "dragon_type5_2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type3_2"] = { "img": "dragon_type3_2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type2_2"] = { "img": "dragon_type2_2_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_dragon_type2_3"] = { "img": "dragon_type2_3_battle_enemy.png", "sx": -21, "sy": -6, "sw": 2540, "sh": 1765, "scale": 0.15000000000000002 };
}

// ==========================================
// ★ 闘技場ボス専用：全160種 完全固有行動辞書
// ==========================================
window.ARENA_BOSS_PATTERNS = {
    // ------------------------------------------
    // 👑 基本種族（Tier 0） 全11種
    // ------------------------------------------
    "robot": [
        { actionType: "buff_atk", skillName: "システム起動" },
        { actionType: "attack", skillName: "ガトリングガン" },
        { actionType: "heavy", skillName: "ロケットパンチ" },
        { actionType: "magic_all", skillName: "拡散レーザー" },
        { actionType: "buff_def", skillName: "エネルギーシールド" },
        { actionType: "heavy_magic", skillName: "サテライトビーム" }
    ],
    "ghost": [
        { actionType: "debuff_def", skillName: "呪縛の叫び" },
        { actionType: "attack", skillName: "引き裂く爪" },
        { actionType: "magic_all", skillName: "ポルターガイスト" },
        { actionType: "heavy_magic", skillName: "ソウルイーター" },
        { actionType: "summon_enemy", skillName: "怨霊召喚" },
        { actionType: "heavy", skillName: "奈落への誘い" }
    ],
    "balloon": [
        { actionType: "buff_atk", skillName: "極限膨張" },
        { actionType: "attack", skillName: "弾む体" },
        { actionType: "magic_all", skillName: "暴風ブレス" },
        { actionType: "heavy", skillName: "大破裂" },
        { actionType: "debuff_def", skillName: "まとわりつくゴム" },
        { actionType: "heal_self", skillName: "空気の補充" }
    ],
    "stone": [
        { actionType: "buff_def", skillName: "大地の加護" },
        { actionType: "attack", skillName: "岩石投げ" },
        { actionType: "magic_all", skillName: "アースクエイク" },
        { actionType: "heavy", skillName: "メガトンプッシュ" },
        { actionType: "debuff_def", skillName: "目潰しの砂埃" },
        { actionType: "heal_self", skillName: "結晶化修復" }
    ],
    "machine": [
        { actionType: "buff_atk", skillName: "オーバークロック" },
        { actionType: "attack", skillName: "突撃装甲" },
        { actionType: "heavy", skillName: "回転ノコギリ" },
        { actionType: "magic_all", skillName: "高圧電流" },
        { actionType: "debuff_def", skillName: "オイル散布" },
        { actionType: "summon_enemy", skillName: "支援ドローン展開" }
    ],
    "bird": [
        { actionType: "buff_atk", skillName: "ハンターの眼" },
        { actionType: "attack", skillName: "ソニッククロー" },
        { actionType: "magic_all", skillName: "カマイタチ" },
        { actionType: "heavy", skillName: "渾身の急降下" },
        { actionType: "heal_self", skillName: "羽繕い" },
        { actionType: "debuff_def", skillName: "威圧の眼差し" }
    ],
    "dragon": [
        { actionType: "buff_atk", skillName: "竜の闘気" },
        { actionType: "attack", skillName: "ドラゴンクロー" },
        { actionType: "magic_all", skillName: "灼熱のブレス" },
        { actionType: "heavy", skillName: "テイルスマッシュ" },
        { actionType: "buff_def", skillName: "硬質な竜鱗" },
        { actionType: "heavy_magic", skillName: "ドラゴニック・メテオ" }
    ],
    "seed": [
        { actionType: "heal_self", skillName: "光合成" },
        { actionType: "attack", skillName: "茨の鞭" },
        { actionType: "magic_all", skillName: "暴走する根" },
        { actionType: "sleep", skillName: "催眠花粉" },
        { actionType: "debuff_def", skillName: "溶解液" },
        { actionType: "heavy_magic", skillName: "生命力強制吸収" }
    ],
    "magician": [
        { actionType: "buff_atk", skillName: "魔力集中" },
        { actionType: "attack", skillName: "マジックミサイル" },
        { actionType: "magic_all", skillName: "エクスプロージョン" },
        { actionType: "buff_def", skillName: "マナシールド" },
        { actionType: "heavy_magic", skillName: "裁きの雷" },
        { actionType: "heal_ally", skillName: "癒やしの風" }
    ],
    "spirit": [
        { actionType: "buff_def", skillName: "精霊の加護" },
        { actionType: "attack", skillName: "風の刃" },
        { actionType: "magic_all", skillName: "スターライト" },
        { actionType: "heavy_magic", skillName: "大自然の裁き" },
        { actionType: "heal_all", skillName: "大地の恵み" },
        { actionType: "summon_enemy", skillName: "ウィスプ召喚" }
    ],
    "beetle": [
        { actionType: "buff_def", skillName: "甲殻硬化" },
        { actionType: "attack", skillName: "ホーンアタック" },
        { actionType: "heavy", skillName: "ギガントシザース" },
        { actionType: "debuff_def", skillName: "威嚇の羽音" },
        { actionType: "heal_self", skillName: "樹液吸収" },
        { actionType: "summon_enemy", skillName: "群れの呼び声" }
    ],
    // ------------------------------------------
    // 🤖 ロボット（Robot）ツリー 全20種
    // ------------------------------------------
    // ▼ 闇落ち進化
    "robot_type1": [
        {actionType: "summon_enemy", skillName: "バグ増殖"}, {actionType: "debuff_def", skillName: "ウイルス散布"}, 
        {actionType: "heavy", skillName: "暴走スクラップ"}, {actionType: "heavy_magic", skillName: "汚染レーザー"}, 
        {actionType: "heal_self", skillName: "不正な自己修復"}, {actionType: "magic_all", skillName: "システムクラッシュ"}
    ],
    "robot_type1_2": [ // 闇落ち2段A
        {actionType: "summon_enemy", skillName: "デッドリーバグ"}, {actionType: "debuff_def", skillName: "絶望のノイズ"}, 
        {actionType: "heavy", skillName: "メルトダウンパンチ"}, {actionType: "heavy_magic", skillName: "ブラックホール砲"}, 
        {actionType: "buff_atk", skillName: "狂気の出力"}, {actionType: "magic_all", skillName: "終焉のカウントダウン"}
    ],
    "robot_type1_3": [ // 闇落ち2段B
        {actionType: "buff_atk", skillName: "殺戮プロトコル"}, {actionType: "debuff_def", skillName: "恐怖のハッキング"}, 
        {actionType: "heavy", skillName: "処刑ブレード"}, {actionType: "heavy_magic", skillName: "アビサル・レイ"}, 
        {actionType: "heal_self", skillName: "生命力強制吸収"}, {actionType: "magic_all", skillName: "ゼロ・ディバイド"}
    ],

    // ▼ 美しさ進化
    "robot_type2": [
        {actionType: "buff_def", skillName: "プリズムコート"}, {actionType: "debuff_def", skillName: "魅惑のホログラム"}, 
        {actionType: "attack", skillName: "エレガント・スラッシュ"}, {actionType: "heavy_magic", skillName: "スターダスト・レーザー"}, 
        {actionType: "heal_ally", skillName: "癒やしの光波"}, {actionType: "magic_all", skillName: "流麗なる乱れ撃ち"}
    ],
    "robot_type2_2": [ // 美しさ2段A
        {actionType: "buff_def", skillName: "クリスタル・イージス"}, {actionType: "debuff_def", skillName: "幻惑の鏡面"}, 
        {actionType: "heavy", skillName: "プラチナ・エッジ"}, {actionType: "heavy_magic", skillName: "スーパーノヴァ・ライト"}, 
        {actionType: "heal_all", skillName: "女神の修復波"}, {actionType: "magic_all", skillName: "オーロラ・エクスキューション"}
    ],
    "robot_type2_3": [ // 美しさ2段B
        {actionType: "buff_atk", skillName: "美の探求"}, {actionType: "debuff_def", skillName: "思考奪取の輝き"}, 
        {actionType: "heavy", skillName: "ローズ・ウィップ"}, {actionType: "heavy_magic", skillName: "レインボー・カノン"}, 
        {actionType: "summon_enemy", skillName: "取り巻きの防衛機"}, {actionType: "magic_all", skillName: "ブリリアント・ストーム"}
    ],
    "robot_type2_4": [ // 美しさ2段C
        {actionType: "sleep", skillName: "優雅なる休眠"}, {actionType: "debuff_def", skillName: "絶対的な美の暴力"}, 
        {actionType: "attack", skillName: "白鳥の舞"}, {actionType: "heavy_magic", skillName: "エンジェリック・レイ"}, 
        {actionType: "buff_def", skillName: "神聖不可侵装甲"}, {actionType: "magic_all", skillName: "パラダイス・ロスト"}
    ],

    // ▼ 賢さ進化
    "robot_type3": [
        {actionType: "buff_atk", skillName: "弱点解析"}, {actionType: "debuff_def", skillName: "ジャミング波"}, 
        {actionType: "attack", skillName: "精密射撃"}, {actionType: "heavy_magic", skillName: "サテライトストライク"}, 
        {actionType: "buff_def", skillName: "予測回避機動"}, {actionType: "magic_all", skillName: "量子分解ビーム"}
    ],
    "robot_type3_2": [ // 賢さ進化B
        {actionType: "summon_enemy", skillName: "デコイ展開"}, {actionType: "debuff_def", skillName: "行動阻害パルス"}, 
        {actionType: "heavy", skillName: "急所突き"}, {actionType: "heavy_magic", skillName: "プラズマ放電"}, 
        {actionType: "heal_self", skillName: "応急パッチ適用"}, {actionType: "magic_all", skillName: "制圧射撃"}
    ],
    "robot_type3_3": [ // 賢さ2段A
        {actionType: "buff_atk", skillName: "森羅万象の演算"}, {actionType: "debuff_def", skillName: "神経ネットワーク切断"}, 
        {actionType: "heavy", skillName: "完全必中の一撃"}, {actionType: "heavy_magic", skillName: "軌道兵器『タケミカヅチ』"}, 
        {actionType: "buff_def", skillName: "次元断層シールド"}, {actionType: "magic_all", skillName: "コズミック・レイ"}
    ],
    "robot_type3_4": [ // 賢さ2段B
        {actionType: "summon_enemy", skillName: "自律型ビット射出"}, {actionType: "debuff_def", skillName: "重力波干渉"}, 
        {actionType: "heavy", skillName: "空間切断ブレード"}, {actionType: "heavy_magic", skillName: "反物質ミサイル"}, 
        {actionType: "heal_all", skillName: "ナノマシン散布"}, {actionType: "magic_all", skillName: "オーバー・テクノロジー"}
    ],
    "robot_type3_5": [ // 賢さ2段C
        {actionType: "sleep", skillName: "超高度演算移行(睡眠)"}, {actionType: "buff_atk", skillName: "全リミッター解除"}, 
        {actionType: "heavy", skillName: "質量兵器投下"}, {actionType: "heavy_magic", skillName: "アカシック・ノヴァ"}, 
        {actionType: "debuff_def", skillName: "真理の暴露"}, {actionType: "magic_all", skillName: "ワールド・エンド"}
    ],

    // ▼ 活力進化
    "robot_type4": [
        {actionType: "buff_atk", skillName: "オーバーヒート"}, {actionType: "heavy", skillName: "ギガントナックル"}, 
        {actionType: "heavy", skillName: "爆砕プレス"}, {actionType: "heal_self", skillName: "エンジン冷却"}, 
        {actionType: "debuff_def", skillName: "威圧の駆動音"}, {actionType: "magic_all", skillName: "全弾発射"}
    ],
    "robot_type4_2": [ // 活力進化B
        {actionType: "buff_atk", skillName: "ブーストオン"}, {actionType: "attack", skillName: "音速の連撃"}, 
        {actionType: "heavy", skillName: "パイルバンカー"}, {actionType: "buff_def", skillName: "リアクティブアーマー"}, 
        {actionType: "summon_enemy", skillName: "支援機要請"}, {actionType: "magic_all", skillName: "ガトリング掃射"}
    ],
    "robot_type4_3": [ // 活力2段A
        {actionType: "buff_atk", skillName: "闘争本能プロトコル"}, {actionType: "heavy", skillName: "アルティメット・ナックル"}, 
        {actionType: "heavy", skillName: "彗星の如き急降下"}, {actionType: "heal_self", skillName: "無限の動力炉"}, 
        {actionType: "buff_def", skillName: "超重装甲展開"}, {actionType: "magic_all", skillName: "グランドシェイカー"}
    ],
    "robot_type4_4": [ // 活力2段B
        {actionType: "buff_atk", skillName: "限界突破モーター"}, {actionType: "heavy", skillName: "ドリル・クラッシャー"}, 
        {actionType: "attack", skillName: "千手観音ラッシュ"}, {actionType: "debuff_def", skillName: "装甲破壊工作"}, 
        {actionType: "summon_enemy", skillName: "量産機大隊出撃"}, {actionType: "magic_all", skillName: "ハイパー・バズーカ"}
    ],

    // ▼ 老化進化
    "robot_type5": [
        {actionType: "debuff_def", skillName: "錆びた歯車の軋み"}, {actionType: "heavy", skillName: "ロストテクノロジー"}, 
        {actionType: "sleep", skillName: "機能停止(休眠)"}, {actionType: "heavy_magic", skillName: "古のビーム砲"}, 
        {actionType: "buff_def", skillName: "ガラクタの盾"}, {actionType: "magic_all", skillName: "メルトダウン"}
    ],
    "robot_type5_2": [ // 老化2段A
        {actionType: "debuff_def", skillName: "風化する歴史"}, {actionType: "heavy", skillName: "忘れ去られた鉄槌"}, 
        {actionType: "sleep", skillName: "悠久の眠り"}, {actionType: "heavy_magic", skillName: "エンシェント・カノン"}, 
        {actionType: "summon_enemy", skillName: "亡霊機械の呼び声"}, {actionType: "magic_all", skillName: "崩壊する巨体"}
    ],
    "robot_type5_3": [ // 老化2段B
        {actionType: "debuff_def", skillName: "時代遅れの呪縛"}, {actionType: "attack", skillName: "鈍重な歯車"}, 
        {actionType: "buff_atk", skillName: "最後の輝き"}, {actionType: "heavy_magic", skillName: "廃棄物の怨念"}, 
        {actionType: "heal_self", skillName: "他機体からの部品強奪"}, {actionType: "magic_all", skillName: "オイルの海"}
    ],
    "robot_type5_4": [ // 老化2段C
        {actionType: "buff_def", skillName: "骨董品の意地"}, {actionType: "heavy", skillName: "重力崩壊"}, 
        {actionType: "debuff_def", skillName: "時空の歪み"}, {actionType: "heavy_magic", skillName: "ジェネシス・レイ"}, 
        {actionType: "summon_enemy", skillName: "過去の残像"}, {actionType: "magic_all", skillName: "終わりの始まり"}
    ],
    // ------------------------------------------
    // 🧚 精霊（Spirit）ツリー 全13種
    // ------------------------------------------
    "spirit_type2": [ // 美しさ進化
        { actionType: "heal_ally", skillName: "癒やしのオーラ" },
        { actionType: "magic_all", skillName: "ホーリーレイ" },
        { actionType: "debuff_def", skillName: "妖精の悪戯" },
        { actionType: "buff_def", skillName: "聖なる結界" },
        { actionType: "heavy_magic", skillName: "神罰の光" },
        { actionType: "summon_enemy", skillName: "光のウィスプ召喚" }
    ],
    "spirit_type2_2": [ // 美しさ2段A
        { actionType: "heal_all", skillName: "女神の抱擁" },
        { actionType: "magic_all", skillName: "レインボーダスト" },
        { actionType: "debuff_def", skillName: "幻惑の光輪" },
        { actionType: "buff_def", skillName: "セレスティアルガード" },
        { actionType: "heavy_magic", skillName: "エンジェリックバースト" },
        { actionType: "buff_atk", skillName: "奇跡の祈り" }
    ],
    "spirit_type2_3": [ // 美しさ2段B
        { actionType: "debuff_def", skillName: "魅了の鱗粉" },
        { actionType: "magic_all", skillName: "スターライトシャワー" },
        { actionType: "sleep", skillName: "妖精郷への誘い" },
        { actionType: "buff_def", skillName: "精霊王の盾" },
        { actionType: "heavy_magic", skillName: "ルミナスフレア" },
        { actionType: "heal_ally", skillName: "癒やしの極光" }
    ],
    "spirit_type4": [ // 活力進化
        { actionType: "magic_all", skillName: "大自然の怒り" },
        { actionType: "heavy", skillName: "テンペスト" },
        { actionType: "heal_self", skillName: "命の奔流" },
        { actionType: "buff_atk", skillName: "荒ぶる風" },
        { actionType: "heavy_magic", skillName: "ライトニングボルト" },
        { actionType: "attack", skillName: "ギガントインパクト" }
    ],
    "spirit_type4_2": [ // 活力2段A
        { actionType: "buff_atk", skillName: "怒髪天" },
        { actionType: "magic_all", skillName: "アースシェイカー" },
        { actionType: "heal_self", skillName: "根源の再生" },
        { actionType: "debuff_def", skillName: "暴風雨" },
        { actionType: "heavy_magic", skillName: "サンダーボルト" },
        { actionType: "heavy", skillName: "怒涛の自然魔法" }
    ],
    "spirit_type4_3": [ // 活力2段B
        { actionType: "buff_atk", skillName: "野生の覚醒" },
        { actionType: "magic_all", skillName: "ギガントトルネード" },
        { actionType: "heal_all", skillName: "マナ湧出" },
        { actionType: "buff_def", skillName: "大地の共鳴" },
        { actionType: "heavy_magic", skillName: "ボルテックス" },
        { actionType: "heavy", skillName: "神獣の突撃" }
    ],
    "spirit_type5": [ // 老化進化
        { actionType: "magic_all", skillName: "枯葉の舞" },
        { actionType: "debuff_def", skillName: "生命の黄昏" },
        { actionType: "sleep", skillName: "静かなる眠り" },
        { actionType: "heavy_magic", skillName: "生命力吸収" },
        { actionType: "heavy", skillName: "枯れ木の鞭" },
        { actionType: "debuff_def", skillName: "風化の呪い" }
    ],
    "spirit_type5_2": [ // 老化2段A
        { actionType: "magic_all", skillName: "悠久の秋" },
        { actionType: "debuff_def", skillName: "万物枯死" },
        { actionType: "sleep", skillName: "忘却の彼方" },
        { actionType: "heal_self", skillName: "精気吸引" },
        { actionType: "heavy", skillName: "朽ちた根の縛り" },
        { actionType: "heavy_magic", skillName: "古の精霊術" }
    ],
    "spirit_type5_3": [ // 老化2段B
        { actionType: "magic_all", skillName: "終焉の木漏れ日" },
        { actionType: "debuff_def", skillName: "灰燼の風" },
        { actionType: "sleep", skillName: "終わりのまどろみ" },
        { actionType: "heavy_magic", skillName: "魂の回収" },
        { actionType: "heavy", skillName: "古木の一撃" },
        { actionType: "debuff_def", skillName: "砂塵の魔法" }
    ],
    "spirit_type1": [ // 闇落ち進化
        { actionType: "debuff_def", skillName: "呪詛の囁き" },
        { actionType: "heavy_magic", skillName: "ライフドレイン" },
        { actionType: "summon_enemy", skillName: "悪霊召喚" },
        { actionType: "magic_all", skillName: "怨念の渦" },
        { actionType: "heavy", skillName: "ポルターガイスト" },
        { actionType: "buff_atk", skillName: "暗黒の儀式" }
    ],
    "spirit_type1_2": [ // 闇落ち2段
        { actionType: "sleep", skillName: "奈落の誘い" },
        { actionType: "heavy_magic", skillName: "ソウルイーター" },
        { actionType: "summon_enemy", skillName: "ファントムレギオン" },
        { actionType: "magic_all", skillName: "ダークバースト" },
        { actionType: "heavy", skillName: "怨念の物理化" },
        { actionType: "debuff_def", skillName: "深淵のオーラ" }
    ],
    "spirit_type3": [ // 賢さ進化
        { actionType: "buff_atk", skillName: "アカシックレコード" },
        { actionType: "magic_all", skillName: "エレメンタルバースト" },
        { actionType: "heavy_magic", skillName: "絶対零度" },
        { actionType: "debuff_def", skillName: "真理の開眼" },
        { actionType: "buff_def", skillName: "叡智の盾" },
        { actionType: "heavy", skillName: "古代語魔法" }
    ],
    "spirit_type3_2": [ // 賢さ2段
        { actionType: "buff_atk", skillName: "宇宙の真理" },
        { actionType: "magic_all", skillName: "ビッグバン" },
        { actionType: "heavy_magic", skillName: "コズミック・アイス" },
        { actionType: "debuff_def", skillName: "次元歪曲" },
        { actionType: "buff_def", skillName: "星座の加護" },
        { actionType: "heavy", skillName: "メテオストライク" }
    ],

    // ------------------------------------------
    // 🧙‍♂️ 魔術師（Magician）ツリー 全18種
    // ------------------------------------------
    "magician_type4": [ // 活力進化A
        { actionType: "buff_atk", skillName: "マナバースト" },
        { actionType: "magic_all", skillName: "爆裂魔法" },
        { actionType: "heavy", skillName: "魔力格闘術" },
        { actionType: "heavy_magic", skillName: "炎の槍" },
        { actionType: "attack", skillName: "メテオナックル" },
        { actionType: "buff_def", skillName: "闘争本能" }
    ],
    "magician_type4_2": [ // 活力進化B
        { actionType: "buff_atk", skillName: "バーサークキャスト" },
        { actionType: "magic_all", skillName: "ヘルファイア" },
        { actionType: "heavy", skillName: "魔杖殴打" },
        { actionType: "heavy_magic", skillName: "業火の球" },
        { actionType: "attack", skillName: "ギガントプレス" },
        { actionType: "buff_def", skillName: "炎の鎧" }
    ],
    "magician_type4_3": [ // 活力2段A
        { actionType: "buff_atk", skillName: "アルティメットバースト" },
        { actionType: "magic_all", skillName: "メガ・エクスプロージョン" },
        { actionType: "heavy", skillName: "剛腕マジック" },
        { actionType: "heavy_magic", skillName: "灼熱の神槍" },
        { actionType: "attack", skillName: "隕石落とし" },
        { actionType: "buff_def", skillName: "鬼神の魔力" }
    ],
    "magician_type4_4": [ // 活力2段B
        { actionType: "magic_all", skillName: "インフェルノ" },
        { actionType: "heavy_magic", skillName: "ヴォルカニックレイ" },
        { actionType: "heavy", skillName: "マジック・ラッシュ" },
        { actionType: "debuff_def", skillName: "太陽のフレア" },
        { actionType: "attack", skillName: "スマッシュロッド" },
        { actionType: "heal_self", skillName: "無尽蔵のマナ" }
    ],
    "magician_type1": [ // 闇落ち進化A
        { actionType: "magic_all", skillName: "ダークフレア" },
        { actionType: "summon_enemy", skillName: "死者の軍勢" },
        { actionType: "heavy_magic", skillName: "魂の収穫" },
        { actionType: "debuff_def", skillName: "死の宣告" },
        { actionType: "heal_self", skillName: "吸血" },
        { actionType: "attack", skillName: "漆黒の波動" }
    ],
    "magician_type1_2": [ // 闇落ち進化B
        { actionType: "debuff_def", skillName: "シャドウバインド" },
        { actionType: "summon_enemy", skillName: "デーモンサモン" },
        { actionType: "heavy_magic", skillName: "呪殺" },
        { actionType: "attack", skillName: "ペイン" },
        { actionType: "sleep", skillName: "ナイトメア" },
        { actionType: "buff_def", skillName: "闇のベール" }
    ],
    "magician_type1_3": [ // 闇落ち2段A
        { actionType: "magic_all", skillName: "アビスフレア" },
        { actionType: "summon_enemy", skillName: "ネクロマンシー極" },
        { actionType: "heavy_magic", skillName: "ソウルハント" },
        { actionType: "debuff_def", skillName: "終焉の宣告" },
        { actionType: "heal_self", skillName: "ブラッドドレイン" },
        { actionType: "heavy", skillName: "ブラックホール" }
    ],
    "magician_type1_4": [ // 闇落ち2段B
        { actionType: "magic_all", skillName: "イクリプス" },
        { actionType: "buff_atk", skillName: "悪魔の契約" },
        { actionType: "heavy_magic", skillName: "即死魔法" },
        { actionType: "debuff_def", skillName: "拷問部屋" },
        { actionType: "summon_enemy", skillName: "悪夢の具現化" },
        { actionType: "buff_def", skillName: "絶望の壁" }
    ],
    "magician_type5": [ // 老化進化
        { actionType: "heavy_magic", skillName: "忘れられた禁呪" },
        { actionType: "buff_atk", skillName: "詠唱破棄" },
        { actionType: "magic_all", skillName: "時間操作" },
        { actionType: "sleep", skillName: "魔力枯渇" },
        { actionType: "debuff_def", skillName: "老魔導士の威圧" },
        { actionType: "attack", skillName: "埃まみれの魔道書" }
    ],
    "magician_type5_2": [ // 老化2段A
        { actionType: "heavy_magic", skillName: "ロスト・マジック" },
        { actionType: "buff_atk", skillName: "古代の叡智" },
        { actionType: "magic_all", skillName: "タイムストップ" },
        { actionType: "sleep", skillName: "長き瞑想" },
        { actionType: "debuff_def", skillName: "賢者の眼差し" },
        { actionType: "attack", skillName: "禁断の古文書" }
    ],
    "magician_type5_3": [ // 老化2段B
        { actionType: "heavy_magic", skillName: "崩壊の呪文" },
        { actionType: "attack", skillName: "老練なる手品" },
        { actionType: "heal_self", skillName: "過去への回帰" },
        { actionType: "debuff_def", skillName: "魔力の衰退" },
        { actionType: "buff_atk", skillName: "大魔導士の覇気" },
        { actionType: "magic_all", skillName: "灰の魔法" }
    ],
    "magician_type2": [ // 美しさ進化A
        { actionType: "debuff_def", skillName: "魅惑のウインク" },
        { actionType: "magic_all", skillName: "幻惑の薔薇" },
        { actionType: "buff_def", skillName: "ミスティックアーツ" },
        { actionType: "heavy_magic", skillName: "イリュージョンバースト" },
        { actionType: "heal_ally", skillName: "マジカルヒール" },
        { actionType: "attack", skillName: "プリズムレイ" }
    ],
    "magician_type2_2": [ // 美しさ進化B
        { actionType: "debuff_def", skillName: "スイートマジック" },
        { actionType: "magic_all", skillName: "フラワーシャワー" },
        { actionType: "buff_def", skillName: "ビューティガード" },
        { actionType: "heavy_magic", skillName: "カラフルボム" },
        { actionType: "heal_ally", skillName: "女神の祈り" },
        { actionType: "attack", skillName: "キラキラパウダー" }
    ],
    "magician_type2_3": [ // 美しさ2段A
        { actionType: "debuff_def", skillName: "テンプテーション" },
        { actionType: "magic_all", skillName: "ローズ・タイフーン" },
        { actionType: "buff_def", skillName: "ミラージュシールド" },
        { actionType: "heavy_magic", skillName: "レインボースマッシュ" },
        { actionType: "heal_all", skillName: "ホーリーヒール" },
        { actionType: "summon_enemy", skillName: "幻影の美神" }
    ],
    "magician_type2_4": [ // 美しさ2段B
        { actionType: "debuff_def", skillName: "ラブリー・イリュージョン" },
        { actionType: "magic_all", skillName: "ユートピア" },
        { actionType: "buff_def", skillName: "パーフェクト・バリア" },
        { actionType: "heavy_magic", skillName: "シャイニング・スター" },
        { actionType: "heal_all", skillName: "天使の歌声" },
        { actionType: "attack", skillName: "ダイヤモンドダスト" }
    ],
    "magician_type3": [ // 賢さ進化
        { actionType: "buff_atk", skillName: "魔力集中" },
        { actionType: "magic_all", skillName: "アルテマ" },
        { actionType: "heavy_magic", skillName: "真理の扉" },
        { actionType: "debuff_def", skillName: "精神破壊" },
        { actionType: "buff_def", skillName: "マナシールド" },
        { actionType: "heavy", skillName: "超重力魔法" }
    ],
    "magician_type3_2": [ // 賢さ2段A
        { actionType: "buff_atk", skillName: "究極魔力集中" },
        { actionType: "magic_all", skillName: "オメガ・アルテマ" },
        { actionType: "heavy_magic", skillName: "アカシック・ゲート" },
        { actionType: "debuff_def", skillName: "マインドクラッシュ" },
        { actionType: "buff_def", skillName: "アブソリュート・シールド" },
        { actionType: "heavy", skillName: "ブラックホール" }
    ],
    "magician_type3_3": [ // 賢さ2段B
        { actionType: "buff_atk", skillName: "全知全能" },
        { actionType: "magic_all", skillName: "メテオ" },
        { actionType: "heavy_magic", skillName: "次元切断" },
        { actionType: "debuff_def", skillName: "神経ハッキング" },
        { actionType: "buff_def", skillName: "時空防壁" },
        { actionType: "heavy", skillName: "ギャラクシアン・エクスプロージョン" }
    ],

    // ------------------------------------------
    // 🦅 鳥（Bird）ツリー 全11種
    // ------------------------------------------
    "bird_type2": [ // 美しさ進化
        { actionType: "heal_all", skillName: "フェニックスフェザー" },
        { actionType: "debuff_def", skillName: "魅惑のさえずり" },
        { actionType: "magic_all", skillName: "極彩色の竜巻" },
        { actionType: "buff_def", skillName: "光の羽衣" },
        { actionType: "heavy", skillName: "ビューティフルダイブ" },
        { actionType: "heal_ally", skillName: "癒やしの風" }
    ],
    "bird_type2_2": [ // 美しさ2段
        { actionType: "heal_all", skillName: "リザレクション" },
        { actionType: "debuff_def", skillName: "幻惑の歌声" },
        { actionType: "magic_all", skillName: "レインボートルネード" },
        { actionType: "buff_def", skillName: "女神の翼" },
        { actionType: "heavy", skillName: "ルミナス・ストライク" },
        { actionType: "heal_ally", skillName: "聖なるそよ風" }
    ],
    "bird_type4": [ // 活力進化
        { actionType: "heavy", skillName: "怒涛の連続嘴" },
        { actionType: "magic_all", skillName: "ソニックブーム" },
        { actionType: "buff_atk", skillName: "狩猟本能" },
        { actionType: "heavy", skillName: "猛禽の爪" },
        { actionType: "buff_def", skillName: "エアロシールド" },
        { actionType: "attack", skillName: "暴風の羽ばたき" }
    ],
    "bird_type4_2": [ // 活力2段
        { actionType: "heavy", skillName: "音速の嘴" },
        { actionType: "magic_all", skillName: "ハリケーン" },
        { actionType: "buff_atk", skillName: "プレデター・アイ" },
        { actionType: "heavy", skillName: "引き裂く大爪" },
        { actionType: "buff_def", skillName: "暴風雨の壁" },
        { actionType: "attack", skillName: "ギガント・ウイング" }
    ],
    "bird_type5": [ // 老化進化
        { actionType: "debuff_def", skillName: "化石化の呪い" },
        { actionType: "magic_all", skillName: "古代の風" },
        { actionType: "heavy", skillName: "羽抜けの突風" },
        { actionType: "sleep", skillName: "長き眠り" },
        { actionType: "heavy_magic", skillName: "始祖の雄叫び" },
        { actionType: "debuff_def", skillName: "砂埃" }
    ],
    "bird_type5_2": [ // 老化2段
        { actionType: "debuff_def", skillName: "石化の邪眼" },
        { actionType: "magic_all", skillName: "太古のサイクロン" },
        { actionType: "heavy", skillName: "骨の羽ばたき" },
        { actionType: "sleep", skillName: "永遠の休眠" },
        { actionType: "heavy_magic", skillName: "恐竜の咆哮" },
        { actionType: "debuff_def", skillName: "デザートストーム" }
    ],
    "bird_type1": [ // 闇落ち進化
        { actionType: "magic_all", skillName: "漆黒の羽ばたき" },
        { actionType: "heavy", skillName: "デスダイブ" },
        { actionType: "debuff_def", skillName: "絶望の鳴き声" },
        { actionType: "heavy_magic", skillName: "宵闇の風" },
        { actionType: "summon_enemy", skillName: "カラスの群れ" },
        { actionType: "attack", skillName: "ブラインドダスト" }
    ],
    "bird_type1_2": [ // 闇落ち2段
        { actionType: "magic_all", skillName: "アビス・ウイング" },
        { actionType: "heavy", skillName: "ヘル・ダイブ" },
        { actionType: "debuff_def", skillName: "怨念の絶叫" },
        { actionType: "heavy_magic", skillName: "ダーク・トルネード" },
        { actionType: "summon_enemy", skillName: "ナイトメア・スウォーム" },
        { actionType: "attack", skillName: "暗闇の帳" }
    ],
    "bird_type3": [ // 賢さ進化A
        { actionType: "buff_atk", skillName: "フクロウの眼" },
        { actionType: "heavy", skillName: "真空刃" },
        { actionType: "debuff_def", skillName: "暴風雨の予測" },
        { actionType: "magic_all", skillName: "サイクロン" },
        { actionType: "heavy_magic", skillName: "賢鳥の裁き" },
        { actionType: "attack", skillName: "マジックフェザー" }
    ],
    "bird_type3_2": [ // 賢さ進化B
        { actionType: "buff_atk", skillName: "鷹の目" },
        { actionType: "heavy", skillName: "ウインドカッター" },
        { actionType: "debuff_def", skillName: "天候支配" },
        { actionType: "magic_all", skillName: "エアロガ" },
        { actionType: "heavy_magic", skillName: "知恵の風" },
        { actionType: "attack", skillName: "狙撃" }
    ],
    "bird_type3_3": [ // 賢さ2段
        { actionType: "buff_atk", skillName: "神鳥の千里眼" },
        { actionType: "heavy", skillName: "次元斬" },
        { actionType: "debuff_def", skillName: "気象コントロール" },
        { actionType: "magic_all", skillName: "ギガ・サイクロン" },
        { actionType: "heavy_magic", skillName: "セイント・ジャッジメント" },
        { actionType: "attack", skillName: "ホーリーフェザー" }
    ],

    // ------------------------------------------
    // ⚙️ 機械（Machine）ツリー 全11種
    // ------------------------------------------
    "machine_type2": [ // 美しさ進化
        { actionType: "debuff_def", skillName: "タイムイリュージョン" },
        { actionType: "magic_all", skillName: "クロックワークマジック" },
        { actionType: "buff_def", skillName: "美しき歯車" },
        { actionType: "heavy", skillName: "黄金のドリル" },
        { actionType: "heal_self", skillName: "自動修復" },
        { actionType: "attack", skillName: "シャイニングギア" }
    ],
    "machine_type2_2": [ // 美しさ2段
        { actionType: "debuff_def", skillName: "クロノス・ゲート" },
        { actionType: "magic_all", skillName: "ギア・オブ・ヘブン" },
        { actionType: "buff_def", skillName: "プラチナシールド" },
        { actionType: "heavy", skillName: "ゴッド・ドリル" },
        { actionType: "heal_self", skillName: "完全自動修復" },
        { actionType: "attack", skillName: "ルミナス・ドライブ" }
    ],
    "machine_type4": [ // 活力進化
        { actionType: "heavy", skillName: "ロードローラー" },
        { actionType: "heavy", skillName: "パイルバンカー" },
        { actionType: "buff_atk", skillName: "限界突破モーター" },
        { actionType: "magic_all", skillName: "大回転アタック" },
        { actionType: "heal_self", skillName: "オイル補給" },
        { actionType: "attack", skillName: "ギガントプレス" }
    ],
    "machine_type4_2": [ // 活力2段
        { actionType: "heavy", skillName: "メガ・ロードローラー" },
        { actionType: "heavy", skillName: "スーパーパイルバンカー" },
        { actionType: "buff_atk", skillName: "マックス・ブースト" },
        { actionType: "magic_all", skillName: "超高速スピン" },
        { actionType: "heal_self", skillName: "ターボチャージ" },
        { actionType: "attack", skillName: "メテオスタンプ" }
    ],
    "machine_type5": [ // 老化進化
        { actionType: "magic_all", skillName: "オイル漏れ引火" },
        { actionType: "heavy", skillName: "ガラクタミサイル" },
        { actionType: "debuff_def", skillName: "暴走ショート" },
        { actionType: "sleep", skillName: "バッテリー切れ" },
        { actionType: "heavy_magic", skillName: "錆びたブレード" },
        { actionType: "attack", skillName: "異音" }
    ],
    "machine_type5_2": [ // 老化2段A
        { actionType: "magic_all", skillName: "大爆発" },
        { actionType: "heavy", skillName: "ジャンクバズーカ" },
        { actionType: "debuff_def", skillName: "メルトダウン" },
        { actionType: "sleep", skillName: "永遠のシャットダウン" },
        { actionType: "heavy_magic", skillName: "アンティーク・ソード" },
        { actionType: "attack", skillName: "ノイズ・キャノン" }
    ],
    "machine_type5_3": [ // 老化2段B
        { actionType: "debuff_def", skillName: "ヘドロ散布" },
        { actionType: "heavy", skillName: "廃棄ミサイル" },
        { actionType: "magic_all", skillName: "回路発火" },
        { actionType: "sleep", skillName: "スリープモード" },
        { actionType: "heavy_magic", skillName: "錆びた大槌" },
        { actionType: "attack", skillName: "スクラップ・ストーム" }
    ],
    "machine_type1": [ // 闇落ち進化
        { actionType: "buff_atk", skillName: "キリングモード" },
        { actionType: "heavy", skillName: "死のカウントダウン" },
        { actionType: "magic_all", skillName: "スクラップ弾" },
        { actionType: "debuff_def", skillName: "恐怖の駆動音" },
        { actionType: "heavy_magic", skillName: "デストロイビーム" },
        { actionType: "attack", skillName: "キラーソー" }
    ],
    "machine_type1_2": [ // 闇落ち2段
        { actionType: "buff_atk", skillName: "ジェノサイドモード" },
        { actionType: "heavy", skillName: "終焉のタイマー" },
        { actionType: "magic_all", skillName: "デッドリー・マイン" },
        { actionType: "debuff_def", skillName: "絶望のサイレン" },
        { actionType: "heavy_magic", skillName: "サテライトキャノン" },
        { actionType: "attack", skillName: "ヘル・カッター" }
    ],
    "machine_type3": [ // 賢さ進化
        { actionType: "debuff_def", skillName: "ハッキング" },
        { actionType: "magic_all", skillName: "演算完了・殲滅" },
        { actionType: "buff_def", skillName: "量子バリア" },
        { actionType: "heavy_magic", skillName: "プラズマ砲" },
        { actionType: "buff_atk", skillName: "最適化" },
        { actionType: "attack", skillName: "レーザーグリッド" }
    ],
    "machine_type3_2": [ // 賢さ2段
        { actionType: "debuff_def", skillName: "システム掌握" },
        { actionType: "magic_all", skillName: "オメガ・デストロイ" },
        { actionType: "buff_def", skillName: "アブソリュート・シールド" },
        { actionType: "heavy_magic", skillName: "反物質砲" },
        { actionType: "buff_atk", skillName: "オーバークロック" },
        { actionType: "attack", skillName: "マトリックス・レイ" }
    ],
    // ------------------------------------------
    // 🪨 岩（Stone）ツリー 全12種
    // ------------------------------------------
    "stone_type2": [ // 美しさ進化
        { actionType: "buff_def", skillName: "ダイヤモンドシールド" },
        { actionType: "magic_all", skillName: "クリスタルプリズム" },
        { actionType: "debuff_def", skillName: "眩い輝き" },
        { actionType: "heavy_magic", skillName: "ホーリージェム" },
        { actionType: "heal_self", skillName: "結晶化修復" },
        { actionType: "attack", skillName: "ジュエルカッター" }
    ],
    "stone_type2_2": [ // 美しさ2段
        { actionType: "buff_def", skillName: "パーフェクト・クリスタル" },
        { actionType: "magic_all", skillName: "レインボー・リフレクション" },
        { actionType: "heavy_magic", skillName: "ジェネシス・ストーン" },
        { actionType: "debuff_def", skillName: "魅惑の宝石眼" },
        { actionType: "heal_all", skillName: "聖なる輝石" },
        { actionType: "attack", skillName: "ブリリアント・エッジ" }
    ],
    "stone_type4": [ // 活力進化A
        { actionType: "heavy", skillName: "マグマナックル" },
        { actionType: "magic_all", skillName: "アースクエイク" },
        { actionType: "buff_atk", skillName: "大地の怒り" },
        { actionType: "heavy", skillName: "ギガロッククラッシュ" },
        { actionType: "buff_def", skillName: "地殻変動" },
        { actionType: "attack", skillName: "岩石砕き" }
    ],
    "stone_type4_2": [ // 活力進化B
        { actionType: "heavy", skillName: "ボルケーノプレス" },
        { actionType: "magic_all", skillName: "溶岩流" },
        { actionType: "buff_atk", skillName: "コアヒート" },
        { actionType: "heavy_magic", skillName: "メテオフォール" },
        { actionType: "debuff_def", skillName: "灼熱の地場" },
        { actionType: "attack", skillName: "グランドスマッシュ" }
    ],
    "stone_type4_3": [ // 活力2段
        { actionType: "heavy", skillName: "プラネット・クラッシュ" },
        { actionType: "magic_all", skillName: "カタストロフィ" },
        { actionType: "buff_atk", skillName: "星の核(コア)の鼓動" },
        { actionType: "heavy_magic", skillName: "アルティメット・メテオ" },
        { actionType: "buff_def", skillName: "絶対断層" },
        { actionType: "attack", skillName: "メガトン・クエイク" }
    ],
    "stone_type5": [ // 老化進化
        { actionType: "magic_all", skillName: "風化の砂塵" },
        { actionType: "sleep", skillName: "悠久の眠り" },
        { actionType: "heavy", skillName: "崩れ落ちる巨体" },
        { actionType: "debuff_def", skillName: "苔の浸食" },
        { actionType: "heavy_magic", skillName: "太古の落石" },
        { actionType: "attack", skillName: "鈍重なる一撃" }
    ],
    "stone_type5_2": [ // 老化2段A
        { actionType: "magic_all", skillName: "千年の砂嵐" },
        { actionType: "sleep", skillName: "石の微睡み" },
        { actionType: "debuff_def", skillName: "忘却の遺跡" },
        { actionType: "heavy_magic", skillName: "古代遺跡の呪い" },
        { actionType: "summon_enemy", skillName: "石像兵の起動" },
        { actionType: "attack", skillName: "風化刃" }
    ],
    "stone_type5_3": [ // 老化2段B
        { actionType: "debuff_def", skillName: "砂漠化" },
        { actionType: "heavy", skillName: "ピラミッドプレス" },
        { actionType: "heal_self", skillName: "砂の再生" },
        { actionType: "sleep", skillName: "永遠の静寂" },
        { actionType: "heavy_magic", skillName: "デザートストーム" },
        { actionType: "attack", skillName: "流砂の飲み込み" }
    ],
    "stone_type1": [ // 闇落ち進化
        { actionType: "debuff_def", skillName: "ペトリファイ" },
        { actionType: "heavy", skillName: "呪怨の重圧" },
        { actionType: "magic_all", skillName: "崩落の予兆" },
        { actionType: "summon_enemy", skillName: "怨霊石召喚" },
        { actionType: "heavy_magic", skillName: "ダークストーン" },
        { actionType: "attack", skillName: "黒曜石の刃" }
    ],
    "stone_type1_2": [ // 闇落ち2段
        { actionType: "debuff_def", skillName: "絶対石化の呪い" },
        { actionType: "heavy", skillName: "奈落の墓標" },
        { actionType: "magic_all", skillName: "暗黒の大地震" },
        { actionType: "summon_enemy", skillName: "死霊石像の覚醒" },
        { actionType: "heavy_magic", skillName: "アビス・クエイク" },
        { actionType: "attack", skillName: "絶望の重撃" }
    ],
    "stone_type3": [ // 賢さ進化
        { actionType: "buff_atk", skillName: "ルーンの刻印" },
        { actionType: "magic_all", skillName: "魔法陣展開" },
        { actionType: "heal_self", skillName: "賢者の石" },
        { actionType: "heavy_magic", skillName: "エンシェントマジック" },
        { actionType: "buff_def", skillName: "マナの城壁" },
        { actionType: "attack", skillName: "魔力宿る岩撃" }
    ],
    "stone_type3_2": [ // 賢さ2段
        { actionType: "buff_atk", skillName: "禁断のルーン" },
        { actionType: "magic_all", skillName: "オーバー・マジック" },
        { actionType: "heavy_magic", skillName: "アルテマ・ストーン" },
        { actionType: "heal_all", skillName: "エリクサーの奇跡" },
        { actionType: "buff_def", skillName: "イージスの盾" },
        { actionType: "attack", skillName: "賢者の裁き" }
    ],

    // ------------------------------------------
    // 🎈 風船（Balloon）ツリー 全14種
    // ------------------------------------------
    "balloon_type2": [ // 美しさ進化A
        { actionType: "magic_all", skillName: "レインボーバブル" },
        { actionType: "debuff_def", skillName: "魅惑のポップ" },
        { actionType: "buff_def", skillName: "カラフルイリュージョン" },
        { actionType: "heavy_magic", skillName: "シャボン玉爆弾" },
        { actionType: "heal_ally", skillName: "ハッピーエアー" },
        { actionType: "attack", skillName: "風船の舞" }
    ],
    "balloon_type2_2": [ // 美しさ進化B
        { actionType: "magic_all", skillName: "スウィート・バルーン" },
        { actionType: "debuff_def", skillName: "香水ガス" },
        { actionType: "buff_atk", skillName: "エレガント・フロート" },
        { actionType: "heavy_magic", skillName: "ジュエルポップ" },
        { actionType: "heal_ally", skillName: "癒やしの気球" },
        { actionType: "attack", skillName: "リボンアタック" }
    ],
    "balloon_type2_3": [ // 美しさ2段
        { actionType: "magic_all", skillName: "ドリーム・フェスティバル" },
        { actionType: "debuff_def", skillName: "絶対魅了のガス" },
        { actionType: "buff_def", skillName: "パーフェクト・バルーン" },
        { actionType: "heavy_magic", skillName: "プリズム・エクスプロージョン" },
        { actionType: "heal_all", skillName: "天使の気球" },
        { actionType: "attack", skillName: "シャイニング・ポップ" }
    ],
    "balloon_type4": [ // 活力進化A
        { actionType: "heavy", skillName: "メガトンプレス" },
        { actionType: "magic_all", skillName: "大爆発" },
        { actionType: "buff_atk", skillName: "灼熱バーナー" },
        { actionType: "heavy", skillName: "急降下タックル" },
        { actionType: "buff_def", skillName: "膨張" },
        { actionType: "attack", skillName: "ゴム弾き" }
    ],
    "balloon_type4_2": [ // 活力進化B
        { actionType: "heavy", skillName: "バウンド・クラッシュ" },
        { actionType: "magic_all", skillName: "暴風破裂" },
        { actionType: "buff_atk", skillName: "フルスロットル" },
        { actionType: "heavy", skillName: "ロケット頭突き" },
        { actionType: "heal_self", skillName: "ガス充填" },
        { actionType: "attack", skillName: "超弾力タックル" }
    ],
    "balloon_type4_3": [ // 活力2段
        { actionType: "heavy", skillName: "ギガント・バウンド" },
        { actionType: "magic_all", skillName: "メガ・エクスプロージョン" },
        { actionType: "buff_atk", skillName: "限界膨張" },
        { actionType: "heavy_magic", skillName: "メテオ・ストライク" },
        { actionType: "buff_def", skillName: "絶対弾性の鎧" },
        { actionType: "attack", skillName: "超音速プレス" }
    ],
    "balloon_type1": [ // 闇落ち進化A
        { actionType: "magic_all", skillName: "ナイトメアガス" },
        { actionType: "debuff_def", skillName: "呪いの風船" },
        { actionType: "heavy", skillName: "破裂・猛毒" },
        { actionType: "summon_enemy", skillName: "悪夢の呼び声" },
        { actionType: "heal_self", skillName: "瘴気吸収" },
        { actionType: "attack", skillName: "毒針" }
    ],
    "balloon_type1_2": [ // 闇落ち進化B
        { actionType: "magic_all", skillName: "カオス・スモーク" },
        { actionType: "debuff_def", skillName: "腐食性ガス" },
        { actionType: "heavy_magic", skillName: "ダーク・バースト" },
        { actionType: "sleep", skillName: "昏睡の霧" },
        { actionType: "heal_self", skillName: "魂の吸引" },
        { actionType: "attack", skillName: "アシッド・ポップ" }
    ],
    "balloon_type1_3": [ // 闇落ち2段
        { actionType: "magic_all", skillName: "アビス・クラウド" },
        { actionType: "debuff_def", skillName: "終焉のガス" },
        { actionType: "heavy_magic", skillName: "デッドリー・ポップ" },
        { actionType: "summon_enemy", skillName: "悪霊風船の群れ" },
        { actionType: "sleep", skillName: "永遠の悪夢" },
        { actionType: "attack", skillName: "呪怨の破裂" }
    ],
    "balloon_type5": [ // 老化進化
        { actionType: "debuff_def", skillName: "まとわりつくゴム" },
        { actionType: "heavy", skillName: "突発的破裂" },
        { actionType: "sleep", skillName: "しぼむ体" },
        { actionType: "magic_all", skillName: "劣化ガスの漏洩" },
        { actionType: "heal_self", skillName: "パッチワーク" },
        { actionType: "attack", skillName: "ヘロヘロ体当たり" }
    ],
    "balloon_type5_2": [ // 老化2段
        { actionType: "debuff_def", skillName: "風化するゴム" },
        { actionType: "heavy_magic", skillName: "古の有害ガス" },
        { actionType: "sleep", skillName: "機能完全停止" },
        { actionType: "magic_all", skillName: "ダスト・スモーク" },
        { actionType: "heal_self", skillName: "ガラクタ継ぎ接ぎ" },
        { actionType: "attack", skillName: "自暴自棄の破裂" }
    ],
    "balloon_type3": [ // 賢さ進化A
        { actionType: "buff_atk", skillName: "弱点把握" },
        { actionType: "heavy", skillName: "上空からの死角攻撃" },
        { actionType: "magic_all", skillName: "気圧操作" },
        { actionType: "debuff_def", skillName: "天候予測" },
        { actionType: "heavy_magic", skillName: "プラズマボール" },
        { actionType: "attack", skillName: "精密バウンド" }
    ],
    "balloon_type3_2": [ // 賢さ進化B
        { actionType: "buff_atk", skillName: "戦術バルーン" },
        { actionType: "heavy_magic", skillName: "レーザー反射" },
        { actionType: "magic_all", skillName: "真空波" },
        { actionType: "debuff_def", skillName: "高高度からの重圧" },
        { actionType: "buff_def", skillName: "気流シールド" },
        { actionType: "attack", skillName: "計算された急降下" }
    ],
    "balloon_type3_3": [ // 賢さ2段
        { actionType: "buff_atk", skillName: "完全気象支配" },
        { actionType: "heavy_magic", skillName: "サテライト・キャノン" },
        { actionType: "magic_all", skillName: "ハリケーン・バースト" },
        { actionType: "debuff_def", skillName: "絶対零度のガス" },
        { actionType: "buff_def", skillName: "成層圏バリア" },
        { actionType: "attack", skillName: "神速の落下" }
    ],

    // ------------------------------------------
    // 👻 幽霊（Ghost）ツリー 全11種
    // ------------------------------------------
    "ghost_type2": [ // 美しさ進化
        { actionType: "debuff_def", skillName: "魅入る鏡" },
        { actionType: "magic_all", skillName: "ファントムダンス" },
        { actionType: "heal_ally", skillName: "魂の浄化" },
        { actionType: "buff_def", skillName: "幻影の衣" },
        { actionType: "heavy_magic", skillName: "イリュージョンフレア" },
        { actionType: "attack", skillName: "透明な刃" }
    ],
    "ghost_type2_2": [ // 美しさ2段
        { actionType: "debuff_def", skillName: "セイレーンの歌声" },
        { actionType: "magic_all", skillName: "クリスタル・イリュージョン" },
        { actionType: "heal_all", skillName: "女神の鎮魂歌" },
        { actionType: "buff_def", skillName: "光のオーラ" },
        { actionType: "heavy_magic", skillName: "ホーリー・レイ" },
        { actionType: "attack", skillName: "輝く幻惑撃" }
    ],
    "ghost_type4": [ // 活力進化
        { actionType: "magic_all", skillName: "家具の竜巻" },
        { actionType: "heavy", skillName: "大暴れ" },
        { actionType: "buff_atk", skillName: "霊体肥大化" },
        { actionType: "heavy", skillName: "ポルターガイストタックル" },
        { actionType: "heavy_magic", skillName: "怨霊の叫び" },
        { actionType: "attack", skillName: "念動力の鉄拳" }
    ],
    "ghost_type4_2": [ // 活力2段
        { actionType: "magic_all", skillName: "サイコキネシス・ストーム" },
        { actionType: "heavy", skillName: "ギガント・ポルターガイスト" },
        { actionType: "buff_atk", skillName: "怒りの具現化" },
        { actionType: "heavy", skillName: "念動力プレス" },
        { actionType: "heavy_magic", skillName: "絶叫の波動" },
        { actionType: "attack", skillName: "不可視の滅多打ち" }
    ],
    "ghost_type5": [ // 老化進化
        { actionType: "debuff_def", skillName: "風化する記憶" },
        { actionType: "heavy_magic", skillName: "千年の怨み" },
        { actionType: "magic_all", skillName: "呪縛霊の嘆き" },
        { actionType: "sleep", skillName: "消えゆく意識" },
        { actionType: "summon_enemy", skillName: "過去の亡霊" },
        { actionType: "attack", skillName: "朽ちた呪縛" }
    ],
    "ghost_type5_2": [ // 老化2段
        { actionType: "debuff_def", skillName: "万物風化の呪詛" },
        { actionType: "heavy_magic", skillName: "エンシェント・カース" },
        { actionType: "magic_all", skillName: "忘却の霧" },
        { actionType: "sleep", skillName: "永遠の微睡み" },
        { actionType: "summon_enemy", skillName: "古の王の霊喚び" },
        { actionType: "attack", skillName: "塵となる一撃" }
    ],
    "ghost_type1": [ // 闇落ち進化
        { actionType: "debuff_def", skillName: "恐怖のどん底" },
        { actionType: "heavy_magic", skillName: "地獄への引きずり込み" },
        { actionType: "magic_all", skillName: "サウザンドカース" },
        { actionType: "summon_enemy", skillName: "亡者の群れ" },
        { actionType: "heal_self", skillName: "ソウルイーター" },
        { actionType: "attack", skillName: "暗黒の爪" }
    ],
    "ghost_type1_2": [ // 闇落ち2段
        { actionType: "debuff_def", skillName: "アビス・ホラー" },
        { actionType: "heavy_magic", skillName: "デッドリー・カース" },
        { actionType: "magic_all", skillName: "パンデモニウム" },
        { actionType: "summon_enemy", skillName: "死神召喚" },
        { actionType: "heal_self", skillName: "生命の略奪" },
        { actionType: "attack", skillName: "魂の刈り取り" }
    ],
    "ghost_type3": [ // 賢さ進化A
        { actionType: "debuff_def", skillName: "精神崩壊" },
        { actionType: "heavy_magic", skillName: "禁断の知識" },
        { actionType: "magic_all", skillName: "古書庫の呪縛" },
        { actionType: "buff_atk", skillName: "真理の探求" },
        { actionType: "buff_def", skillName: "マインドバリア" },
        { actionType: "attack", skillName: "マジック・ポルターガイスト" }
    ],
    "ghost_type3_2": [ // 賢さ進化B
        { actionType: "debuff_def", skillName: "脳波干渉" },
        { actionType: "heavy_magic", skillName: "サイキック・ブラスト" },
        { actionType: "magic_all", skillName: "テレパシー・ノイズ" },
        { actionType: "buff_atk", skillName: "超常現象の解析" },
        { actionType: "buff_def", skillName: "サイコ・シールド" },
        { actionType: "attack", skillName: "念の刃" }
    ],
    "ghost_type3_3": [ // 賢さ2段
        { actionType: "debuff_def", skillName: "アカシック・マインド" },
        { actionType: "heavy_magic", skillName: "メテオ・サイコキネシス" },
        { actionType: "magic_all", skillName: "神の啓示" },
        { actionType: "buff_atk", skillName: "宇宙の真理" },
        { actionType: "buff_def", skillName: "絶対精神防壁" },
        { actionType: "attack", skillName: "事象改変" }
    ],

    // ------------------------------------------
    // 🪲 カブト（Beetle）ツリー 全10種
    // ------------------------------------------
    "beetle_type4": [ // 活力進化
        { actionType: "heavy", skillName: "ギガントホーン" },
        { actionType: "magic_all", skillName: "アースシェイカー" },
        { actionType: "heavy", skillName: "怒涛の突進" },
        { actionType: "buff_atk", skillName: "剛力" },
        { actionType: "buff_def", skillName: "硬化" },
        { actionType: "attack", skillName: "シザースアタック" }
    ],
    "beetle_type4_2": [ // 活力2段
        { actionType: "heavy", skillName: "メテオ・ホーン" },
        { actionType: "magic_all", skillName: "グランド・カタストロフィ" },
        { actionType: "heavy", skillName: "ヘラクレス・ラッシュ" },
        { actionType: "buff_atk", skillName: "狂戦士の甲殻" },
        { actionType: "buff_def", skillName: "金剛不壊" },
        { actionType: "attack", skillName: "ギロチン・シザース" }
    ],
    "beetle_type5": [ // 老化進化
        { actionType: "buff_def", skillName: "古代の甲殻" },
        { actionType: "debuff_def", skillName: "琥珀への封印" },
        { actionType: "heavy", skillName: "鈍重な一撃" },
        { actionType: "sleep", skillName: "化石化" },
        { actionType: "magic_all", skillName: "古代虫の羽音" },
        { actionType: "attack", skillName: "砂埃の突撃" }
    ],
    "beetle_type5_2": [ // 老化2段
        { actionType: "buff_def", skillName: "始祖の絶甲殻" },
        { actionType: "debuff_def", skillName: "万年琥珀の牢獄" },
        { actionType: "heavy", skillName: "地殻変動プレス" },
        { actionType: "sleep", skillName: "悠久の地中" },
        { actionType: "magic_all", skillName: "エンシェント・バズ" },
        { actionType: "attack", skillName: "古の角突き" }
    ],
    "beetle_type2": [ // 美しさ進化A
        { actionType: "debuff_def", skillName: "魅惑のフェロモン" },
        { actionType: "buff_def", skillName: "ゴールデンシールド" },
        { actionType: "magic_all", skillName: "煌めく鱗粉" },
        { actionType: "heavy", skillName: "美しき一撃" },
        { actionType: "heal_ally", skillName: "癒やしの蜜" },
        { actionType: "attack", skillName: "シャインホーン" }
    ],
    "beetle_type2_2": [ // 美しさ進化B
        { actionType: "debuff_def", skillName: "スイート・フェロモン" },
        { actionType: "buff_def", skillName: "プラチナ装甲" },
        { actionType: "magic_all", skillName: "パラダイス・パウダー" },
        { actionType: "heavy", skillName: "ダンシング・ホーン" },
        { actionType: "heal_ally", skillName: "女神の雫" },
        { actionType: "attack", skillName: "レインボー・スラッシュ" }
    ],
    "beetle_type2_3": [ // 美しさ2段A
        { actionType: "debuff_def", skillName: "絶対魅了の香り" },
        { actionType: "buff_def", skillName: "ダイヤモンド・シェル" },
        { actionType: "magic_all", skillName: "スターダスト・鱗粉" },
        { actionType: "heavy", skillName: "ヴィーナス・インパクト" },
        { actionType: "heal_all", skillName: "王家の蜜" },
        { actionType: "attack", skillName: "クリスタル・ホーン" }
    ],
    "beetle_type2_4": [ // 美しさ2段B
        { actionType: "debuff_def", skillName: "幻想の蝶の舞" },
        { actionType: "buff_def", skillName: "パーフェクト・ジュエル" },
        { actionType: "magic_all", skillName: "イリュージョン・ダスト" },
        { actionType: "heavy", skillName: "ロイヤル・スラスト" },
        { actionType: "heal_all", skillName: "フェアリー・ネクター" },
        { actionType: "attack", skillName: "プリズム・シザース" }
    ],
    "beetle_type3": [ // 賢さ進化
        { actionType: "buff_atk", skillName: "弱点穿ち" },
        { actionType: "buff_def", skillName: "鉄壁の陣形" },
        { actionType: "magic_all", skillName: "軍団指揮" },
        { actionType: "heavy", skillName: "急所突き" },
        { actionType: "summon_enemy", skillName: "兵隊虫召喚" },
        { actionType: "attack", skillName: "精密な挟み込み" }
    ],
    "beetle_type1": [ // 闇落ち進化
        { actionType: "debuff_def", skillName: "恐怖の羽音" },
        { actionType: "heavy", skillName: "デッドリーポイズン" },
        { actionType: "magic_all", skillName: "パラサイトスウォーム" },
        { actionType: "summon_enemy", skillName: "毒虫の群れ" },
        { actionType: "heal_self", skillName: "捕食" },
        { actionType: "attack", skillName: "呪いの顎" }
    ],

    // ------------------------------------------
    // 🌱 種（Seed）ツリー 全11種
    // ------------------------------------------
    "seed_type4": [ // 活力進化
        { actionType: "heavy", skillName: "茨の鞭" },
        { actionType: "heal_self", skillName: "貪り食う" },
        { actionType: "buff_atk", skillName: "異常成長" },
        { actionType: "heavy", skillName: "締め付け" },
        { actionType: "magic_all", skillName: "暴走する根" },
        { actionType: "attack", skillName: "巨大な種飛ばし" }
    ],
    "seed_type4_2": [ // 活力2段
        { actionType: "heavy", skillName: "ギガント・ウィップ" },
        { actionType: "heal_self", skillName: "大地の養分吸収" },
        { actionType: "buff_atk", skillName: "ジャングル化" },
        { actionType: "heavy", skillName: "デス・バインド" },
        { actionType: "magic_all", skillName: "アース・ルート・ストライク" },
        { actionType: "attack", skillName: "メテオ・シード" }
    ],
    "seed_type1": [ // 闇落ち進化
        { actionType: "magic_all", skillName: "マンドラゴラの悲鳴" },
        { actionType: "heavy", skillName: "猛毒の蔦" },
        { actionType: "heal_self", skillName: "魂を啜る根" },
        { actionType: "debuff_def", skillName: "死の胞子" },
        { actionType: "summon_enemy", skillName: "食人花の群れ" },
        { actionType: "attack", skillName: "パラサイト・シード" }
    ],
    "seed_type1_2": [ // 闇落ち2段
        { actionType: "magic_all", skillName: "バンシーの絶叫" },
        { actionType: "heavy", skillName: "デッドリー・ヴァイン" },
        { actionType: "heal_self", skillName: "生命の略奪" },
        { actionType: "debuff_def", skillName: "アビス・スポア" },
        { actionType: "summon_enemy", skillName: "魔界樹の眷属" },
        { actionType: "attack", skillName: "カース・シード" }
    ],
    "seed_type5": [ // 老化進化
        { actionType: "heavy", skillName: "枯れ枝の槍" },
        { actionType: "debuff_def", skillName: "腐葉土の罠" },
        { actionType: "heal_self", skillName: "生命力吸収" },
        { actionType: "sleep", skillName: "朽ち果てる" },
        { actionType: "magic_all", skillName: "枯葉の嵐" },
        { actionType: "attack", skillName: "カサカサの種" }
    ],
    "seed_type5_2": [ // 老化2段
        { actionType: "heavy", skillName: "エンシェント・ランス" },
        { actionType: "debuff_def", skillName: "底なしの腐海" },
        { actionType: "heal_self", skillName: "魂の養分" },
        { actionType: "sleep", skillName: "土への回帰" },
        { actionType: "magic_all", skillName: "死の砂嵐" },
        { actionType: "attack", skillName: "化石の種" }
    ],
    "seed_type3": [ // 賢さ進化A
        { actionType: "debuff_def", skillName: "精神支配の種" },
        { actionType: "buff_atk", skillName: "自然の理" },
        { actionType: "heavy_magic", skillName: "知恵の果実" },
        { actionType: "magic_all", skillName: "ツタの束縛" },
        { actionType: "buff_def", skillName: "大樹の守り" },
        { actionType: "attack", skillName: "マジカル・シード" }
    ],
    "seed_type3_2": [ // 賢さ進化B
        { actionType: "debuff_def", skillName: "幻覚の花粉" },
        { actionType: "buff_atk", skillName: "光合成の極意" },
        { actionType: "heavy_magic", skillName: "ソーラー・ブラスト" },
        { actionType: "magic_all", skillName: "森の迷宮" },
        { actionType: "buff_def", skillName: "精霊木の加護" },
        { actionType: "attack", skillName: "エレメンタル・シード" }
    ],
    "seed_type3_3": [ // 賢さ2段
        { actionType: "debuff_def", skillName: "ユグドラシルの呪縛" },
        { actionType: "buff_atk", skillName: "森羅万象" },
        { actionType: "heavy_magic", skillName: "禁断の果実" },
        { actionType: "magic_all", skillName: "ワールド・バインド" },
        { actionType: "buff_def", skillName: "世界樹の壁" },
        { actionType: "attack", skillName: "コズミック・シード" }
    ],
    "seed_type2": [ // 美しさ進化
        { actionType: "heal_all", skillName: "生命の息吹" },
        { actionType: "debuff_def", skillName: "魅惑の香り" },
        { actionType: "magic_all", skillName: "フルール・ド・リス" },
        { actionType: "buff_def", skillName: "花びらの盾" },
        { actionType: "heavy_magic", skillName: "ソーラービーム" },
        { actionType: "attack", skillName: "ビューティ・シード" }
    ],
    "seed_type2_2": [ // 美しさ2段
        { actionType: "heal_all", skillName: "女神の息吹" },
        { actionType: "debuff_def", skillName: "絶対魅了のフェロモン" },
        { actionType: "magic_all", skillName: "パラダイス・ブルーム" },
        { actionType: "buff_def", skillName: "クリスタル・ペタル" },
        { actionType: "heavy_magic", skillName: "サン・バースト" },
        { actionType: "attack", skillName: "プリズム・シード" }
    ],

    // ------------------------------------------
    // 🐉 竜（Dragon）ツリー 全11種
    // ------------------------------------------
    "dragon_type4": [ // 活力進化
        { actionType: "heavy_magic", skillName: "ギガフレア" },
        { actionType: "buff_atk", skillName: "逆鱗" },
        { actionType: "magic_all", skillName: "暴虐の限り" },
        { actionType: "heavy", skillName: "テイルアタック" },
        { actionType: "heavy", skillName: "噛み砕く" },
        { actionType: "attack", skillName: "竜の爪" }
    ],
    "dragon_type4_2": [ // 活力2段
        { actionType: "heavy_magic", skillName: "テラ・フレア" },
        { actionType: "buff_atk", skillName: "竜王の逆鱗" },
        { actionType: "magic_all", skillName: "カタストロフィ・ブレス" },
        { actionType: "heavy", skillName: "グランド・スマッシュ" },
        { actionType: "heavy", skillName: "絶望の牙" },
        { actionType: "attack", skillName: "覇王の鉤爪" }
    ],
    "dragon_type1": [ // 闇落ち進化
        { actionType: "magic_all", skillName: "カオスブレス" },
        { actionType: "debuff_def", skillName: "絶望の咆哮" },
        { actionType: "heavy", skillName: "終焉の爪" },
        { actionType: "heavy_magic", skillName: "ダークノヴァ" },
        { actionType: "heal_self", skillName: "破壊の愉悦" },
        { actionType: "attack", skillName: "ダークファング" }
    ],
    "dragon_type1_2": [ // 闇落ち2段
        { actionType: "magic_all", skillName: "アビス・ブレス" },
        { actionType: "debuff_def", skillName: "死の宣告" },
        { actionType: "heavy", skillName: "デッドリー・クロー" },
        { actionType: "heavy_magic", skillName: "ブラックホール" },
        { actionType: "heal_self", skillName: "魂の捕食" },
        { actionType: "attack", skillName: "ヘル・ファング" }
    ],
    "dragon_type5": [ // 老化進化
        { actionType: "magic_all", skillName: "風化する竜の息吹" },
        { actionType: "debuff_def", skillName: "死の瘴気" },
        { actionType: "heavy", skillName: "呪われた骨" },
        { actionType: "sleep", skillName: "古竜の眠り" },
        { actionType: "heavy_magic", skillName: "灰燼の叫び" },
        { actionType: "attack", skillName: "ボーン・テイル" }
    ],
    "dragon_type5_2": [ // 老化2段
        { actionType: "magic_all", skillName: "亡者の息吹" },
        { actionType: "debuff_def", skillName: "千年の瘴気" },
        { actionType: "heavy", skillName: "エンシェント・ボーン" },
        { actionType: "sleep", skillName: "永遠の封印" },
        { actionType: "heavy_magic", skillName: "怨霊の咆哮" },
        { actionType: "attack", skillName: "スケルトン・クロー" }
    ],
    "dragon_type3": [ // 賢さ進化
        { actionType: "magic_all", skillName: "エレメントマスター" },
        { actionType: "debuff_def", skillName: "時間停止" },
        { actionType: "buff_atk", skillName: "竜の叡智" },
        { actionType: "heavy_magic", skillName: "エンシェントフレア" },
        { actionType: "buff_def", skillName: "絶対障壁" },
        { actionType: "attack", skillName: "マジック・ファング" }
    ],
    "dragon_type3_2": [ // 賢さ2段
        { actionType: "magic_all", skillName: "コズミック・マスター" },
        { actionType: "debuff_def", skillName: "クロノス・バインド" },
        { actionType: "buff_atk", skillName: "神竜の叡智" },
        { actionType: "heavy_magic", skillName: "スーパーノヴァ" },
        { actionType: "buff_def", skillName: "イージス・スケイル" },
        { actionType: "attack", skillName: "次元の牙" }
    ],
    "dragon_type2": [ // 美しさ進化
        { actionType: "magic_all", skillName: "ホーリーブレス" },
        { actionType: "buff_def", skillName: "オーロラシールド" },
        { actionType: "debuff_def", skillName: "神の威光" },
        { actionType: "heavy_magic", skillName: "シャイニングレイ" },
        { actionType: "heal_ally", skillName: "竜神の加護" },
        { actionType: "attack", skillName: "クリスタル・クロー" }
    ],
    "dragon_type2_2": [ // 美しさ2段A
        { actionType: "magic_all", skillName: "ディヴァイン・ブレス" },
        { actionType: "buff_def", skillName: "プリズム・スケイル" },
        { actionType: "debuff_def", skillName: "絶対なる威光" },
        { actionType: "heavy_magic", skillName: "エンジェリック・レイ" },
        { actionType: "heal_all", skillName: "女神の祈り" },
        { actionType: "attack", skillName: "ダイヤモンド・クロー" }
    ],
    "dragon_type2_3": [ // 美しさ2段B
        { actionType: "magic_all", skillName: "レインボー・ブレス" },
        { actionType: "buff_def", skillName: "ミラージュ・バリア" },
        { actionType: "debuff_def", skillName: "魅惑の竜眼" },
        { actionType: "heavy_magic", skillName: "スターダスト・フォール" },
        { actionType: "heal_all", skillName: "精霊の祝福" },
        { actionType: "attack", skillName: "ルミナス・ファング" }
    ]
};

// ★修正：全11種族の専用二つ名と基礎ステータス（speed追加）
window.ARENA_ENEMIES = {
    // ------------------------------------------
    // 👑 基本種（Tier 0） 11種
    // ------------------------------------------
    "robot": { name: "試作決戦兵器プロト・ロボ", bossName: "【機神】オメガ・プロトタイプ", hp: 150, atk: 25, def: 10, speed: 20, spriteKey: "arena_robot", type: "robot" },
    "ghost": { name: "彷徨えるプチゴースト", bossName: "【怨嗟】レイス・キング", hp: 120, atk: 30, def: 5, speed: 40, spriteKey: "arena_ghost", type: "ghost" },
    "balloon": { name: "浮遊するバルーンスライム", bossName: "【大破裂】マッド・バルーン", hp: 180, atk: 20, def: 5, speed: 30, spriteKey: "arena_balloon", type: "balloon" },
    "stone": { name: "剛腕のロックゴーレム", bossName: "【堅牢】アース・ガーディアン", hp: 250, atk: 30, def: 20, speed: 5, spriteKey: "arena_stone", type: "stone" },
    "machine": { name: "暴走ゼンマイギア", bossName: "【狂乱】カラクリ大帝", hp: 130, atk: 28, def: 12, speed: 35, spriteKey: "arena_machine", type: "machine" },
    "bird": { name: "疾風のアネモバード", bossName: "【嵐翼】ストーム・ブリンガー", hp: 110, atk: 35, def: 8, speed: 60, spriteKey: "arena_bird", type: "bird" },
    "dragon": { name: "荒ぶるベビードラゴン", bossName: "【竜王】バハムート・プライム", hp: 200, atk: 40, def: 15, speed: 25, spriteKey: "arena_dragon", type: "dragon" },
    "seed": { name: "猛毒のプラントシード", bossName: "【魔樹】ユグドラシル・コラプト", hp: 140, atk: 22, def: 10, speed: 15, spriteKey: "arena_seed", type: "seed" },
    "magician": { name: "炎の魔術見習い", bossName: "【大魔導】グランド・メイガス", hp: 100, atk: 45, def: 5, speed: 25, spriteKey: "arena_magician", type: "magician" },
    "spirit": { name: "怒れる森の精霊", bossName: "【聖霊】マナ・アヴァターラ", hp: 160, atk: 20, def: 15, speed: 35, spriteKey: "arena_spirit", type: "spirit" },
    "beetle": { name: "鉄壁のアーマービートル", bossName: "【甲王】ヘラクレス・エンペラー", hp: 220, atk: 25, def: 25, speed: 10, spriteKey: "arena_beetle", type: "beetle" },

    // ------------------------------------------
    // 🤖 ロボット進化ツリー (20種)
    // ------------------------------------------
    "robot_type1": { name: "暴走する殺戮機械", bossName: "【災厄】ジェノサイド・マキナ", hp: 220, atk: 45, def: 15, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_robot_type1"]?"arena_robot_type1":"arena_robot", type: "robot_type1" },
    "robot_type1_2": { name: "血塗られた処刑装置", bossName: "【終焉】エグゼキューショナー", hp: 350, atk: 75, def: 25, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_robot_type1_2"]?"arena_robot_type1_2":"arena_robot", type: "robot_type1_2" },
    "robot_type1_3": { name: "意志無き殲滅兵器", bossName: "【絶望】アポカリプス・エンジン", hp: 380, atk: 80, def: 20, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_robot_type1_3"]?"arena_robot_type1_3":"arena_robot", type: "robot_type1_3" },
    
    "robot_type2": { name: "白銀の流線型ドロイド", bossName: "【幻惑】ミラージュ・ナイツ", hp: 200, atk: 35, def: 20, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_robot_type2"]?"arena_robot_type2":"arena_robot", type: "robot_type2" },
    "robot_type2_2": { name: "純白の天使型オートマタ", bossName: "【聖機】セラフィム・ギア", hp: 320, atk: 55, def: 35, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_robot_type2_2"]?"arena_robot_type2_2":"arena_robot", type: "robot_type2_2" },
    "robot_type2_3": { name: "黄金の近衛騎士", bossName: "【光輝】パラディン・カスタム", hp: 340, atk: 60, def: 40, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_robot_type2_3"]?"arena_robot_type2_3":"arena_robot", type: "robot_type2_3" },
    "robot_type2_4": { name: "完全無欠の芸術機体", bossName: "【至高】パーフェクト・ヴィーナス", hp: 300, atk: 65, def: 30, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_robot_type2_4"]?"arena_robot_type2_4":"arena_robot", type: "robot_type2_4" },
    
    "robot_type3": { name: "自律型戦術AI", bossName: "【論理】タクティカル・コマンダー", hp: 180, atk: 40, def: 15, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_robot_type3"]?"arena_robot_type3":"arena_robot", type: "robot_type3" },
    "robot_type3_2": { name: "索敵特化型ドローン", bossName: "【真眼】オール・ सीイング", hp: 170, atk: 35, def: 15, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_robot_type3_2"]?"arena_robot_type3_2":"arena_robot", type: "robot_type3_2" },
    "robot_type3_3": { name: "森羅万象の計算機", bossName: "【全知】アカシック・ブレイン", hp: 280, atk: 70, def: 25, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_robot_type3_3"]?"arena_robot_type3_3":"arena_robot", type: "robot_type3_3" },
    "robot_type3_4": { name: "高機動迎撃ユニット", bossName: "【神速】ライトニング・ストライカー", hp: 260, atk: 65, def: 20, speed: 80, spriteKey: window.DUNGEON_SPRITES["arena_robot_type3_4"]?"arena_robot_type3_4":"arena_robot", type: "robot_type3_4" },
    "robot_type3_5": { name: "次元干渉型アンドロイド", bossName: "【超越】クロノス・マトリクス", hp: 300, atk: 85, def: 20, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_robot_type3_5"]?"arena_robot_type3_5":"arena_robot", type: "robot_type3_5" },
    
    "robot_type4": { name: "重装格闘用サイボーグ", bossName: "【剛鉄】ギガント・ブレイカー", hp: 280, atk: 50, def: 25, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_robot_type4"]?"arena_robot_type4":"arena_robot", type: "robot_type4" },
    "robot_type4_2": { name: "火力特化型タンク", bossName: "【弾幕】ヘビー・アーティレリー", hp: 300, atk: 45, def: 30, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_robot_type4_2"]?"arena_robot_type4_2":"arena_robot", type: "robot_type4_2" },
    "robot_type4_3": { name: "超弩級の陸戦兵器", bossName: "【要塞】グランド・フォートレス", hp: 500, atk: 80, def: 50, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_robot_type4_3"]?"arena_robot_type4_3":"arena_robot", type: "robot_type4_3" },
    "robot_type4_4": { name: "限界突破の戦闘狂", bossName: "【闘争】バーサーカー・マキシマム", hp: 450, atk: 95, def: 30, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_robot_type4_4"]?"arena_robot_type4_4":"arena_robot", type: "robot_type4_4" },
    
    "robot_type5": { name: "廃棄された旧式機", bossName: "【遺物】アンティーク・ギア", hp: 180, atk: 20, def: 20, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_robot_type5"]?"arena_robot_type5":"arena_robot", type: "robot_type5" },
    "robot_type5_2": { name: "サビに塗れた守護者", bossName: "【鉄屑】アイアン・ゾンビ", hp: 400, atk: 35, def: 45, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_robot_type5_2"]?"arena_robot_type5_2":"arena_robot", type: "robot_type5_2" },
    "robot_type5_3": { name: "部品を継ぎ接いだ怪物", bossName: "【怨念】キメラ・ジャンク", hp: 350, atk: 50, def: 30, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_robot_type5_3"]?"arena_robot_type5_3":"arena_robot", type: "robot_type5_3" },
    "robot_type5_4": { name: "古代文明の起動兵器", bossName: "【神話】エンシェント・ゴーレム", hp: 480, atk: 60, def: 50, speed: 8, spriteKey: window.DUNGEON_SPRITES["arena_robot_type5_4"]?"arena_robot_type5_4":"arena_robot", type: "robot_type5_4" },

    // ------------------------------------------
    // 🧚 精霊進化ツリー (13種)
    // ------------------------------------------
    "spirit_type1": { name: "呪いを帯びた悪霊", bossName: "【怨嗟】ダーク・スピリット", hp: 200, atk: 30, def: 10, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type1"]?"arena_spirit_type1":"arena_spirit", type: "spirit_type1" },
    "spirit_type1_2": { name: "深淵より出でし悪魔", bossName: "【奈落】アビス・ロード", hp: 330, atk: 55, def: 20, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type1_2"]?"arena_spirit_type1_2":"arena_spirit", type: "spirit_type1_2" },
    
    "spirit_type2": { name: "光をまとう妖精", bossName: "【清浄】フェアリー・クイーン", hp: 180, atk: 25, def: 20, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type2"]?"arena_spirit_type2":"arena_spirit", type: "spirit_type2" },
    "spirit_type2_2": { name: "神聖なる大天使", bossName: "【救済】アークエンジェル", hp: 300, atk: 40, def: 35, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type2_2"]?"arena_spirit_type2_2":"arena_spirit", type: "spirit_type2_2" },
    "spirit_type2_3": { name: "星屑の精霊王", bossName: "【煌めき】スターライト・モナルカ", hp: 280, atk: 50, def: 25, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type2_3"]?"arena_spirit_type2_3":"arena_spirit", type: "spirit_type2_3" },
    
    "spirit_type3": { name: "知識を探求する霊体", bossName: "【叡智】ウィズダム・ゴースト", hp: 160, atk: 35, def: 15, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type3"]?"arena_spirit_type3":"arena_spirit", type: "spirit_type3" },
    "spirit_type3_2": { name: "宇宙の真理を識る者", bossName: "【真理】コズミック・エンティティ", hp: 250, atk: 65, def: 25, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type3_2"]?"arena_spirit_type3_2":"arena_spirit", type: "spirit_type3_2" },
    
    "spirit_type4": { name: "暴風雨の化身", bossName: "【荒神】テンペスト・アヴァター", hp: 220, atk: 40, def: 15, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type4"]?"arena_spirit_type4":"arena_spirit", type: "spirit_type4" },
    "spirit_type4_2": { name: "雷鳴を呼ぶ雷神", bossName: "【轟雷】ライトニング・ロード", hp: 340, atk: 70, def: 25, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type4_2"]?"arena_spirit_type4_2":"arena_spirit", type: "spirit_type4_2" },
    "spirit_type4_3": { name: "大地を揺るがす神獣", bossName: "【大自然】ガイア・ビースト", hp: 420, atk: 60, def: 40, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type4_3"]?"arena_spirit_type4_3":"arena_spirit", type: "spirit_type4_3" },
    
    "spirit_type5": { name: "枯れ葉と土の精", bossName: "【黄昏】オータム・ウッズ", hp: 200, atk: 15, def: 25, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type5"]?"arena_spirit_type5":"arena_spirit", type: "spirit_type5" },
    "spirit_type5_2": { name: "朽ちゆく大樹の主", bossName: "【終焉】デッドツリー・エルダー", hp: 450, atk: 30, def: 45, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type5_2"]?"arena_spirit_type5_2":"arena_spirit", type: "spirit_type5_2" },
    "spirit_type5_3": { name: "砂塵に舞う亡霊", bossName: "【風化】デザート・ファントム", hp: 320, atk: 45, def: 20, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_spirit_type5_3"]?"arena_spirit_type5_3":"arena_spirit", type: "spirit_type5_3" },

    // ------------------------------------------
    // 🧙‍♂️ 魔術師進化ツリー (18種)
    // ------------------------------------------
    "magician_type1": { name: "禁忌に触れた黒魔道士", bossName: "【邪悪】ダーク・ウィザード", hp: 130, atk: 65, def: 5, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_magician_type1"]?"arena_magician_type1":"arena_magician", type: "magician_type1" },
    "magician_type1_2": { name: "魂を狩る死霊術師", bossName: "【死神】ネクロマンサー", hp: 150, atk: 60, def: 10, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_magician_type1_2"]?"arena_magician_type1_2":"arena_magician", type: "magician_type1_2" },
    "magician_type1_3": { name: "奈落の業火を操る者", bossName: "【絶望】アビス・ウォーロック", hp: 240, atk: 100, def: 15, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_magician_type1_3"]?"arena_magician_type1_3":"arena_magician", type: "magician_type1_3" },
    "magician_type1_4": { name: "悪魔と契約せし教祖", bossName: "【狂信】デーモン・サマナー", hp: 260, atk: 90, def: 20, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_magician_type1_4"]?"arena_magician_type1_4":"arena_magician", type: "magician_type1_4" },
    
    "magician_type2": { name: "華麗なる幻術士", bossName: "【幻惑】イリュージョニスト", hp: 120, atk: 55, def: 10, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_magician_type2"]?"arena_magician_type2":"arena_magician", type: "magician_type2" },
    "magician_type2_2": { name: "癒やしの白魔道士", bossName: "【聖女】ホーリー・プリースト", hp: 160, atk: 45, def: 20, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_magician_type2_2"]?"arena_magician_type2_2":"arena_magician", type: "magician_type2_2" },
    "magician_type2_3": { name: "星の輝きを放つ妖術師", bossName: "【星天】アストラル・メイジ", hp: 230, atk: 85, def: 25, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_magician_type2_3"]?"arena_magician_type2_3":"arena_magician", type: "magician_type2_3" },
    "magician_type2_4": { name: "奇跡の奇術師", bossName: "【喝采】ミラクル・パフォーマー", hp: 250, atk: 75, def: 30, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_magician_type2_4"]?"arena_magician_type2_4":"arena_magician", type: "magician_type2_4" },
    
    "magician_type3": { name: "真理を求む賢者", bossName: "【全知】ハイ・セージ", hp: 140, atk: 70, def: 15, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_magician_type3"]?"arena_magician_type3":"arena_magician", type: "magician_type3" },
    "magician_type3_2": { name: "時空を操る大魔導士", bossName: "【時空】クロノ・マスター", hp: 280, atk: 110, def: 25, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_magician_type3_2"]?"arena_magician_type3_2":"arena_magician", type: "magician_type3_2" },
    "magician_type3_3": { name: "次元の狭間を覗く者", bossName: "【超越】ディメンション・ウォーカー", hp: 250, atk: 105, def: 20, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_magician_type3_3"]?"arena_magician_type3_3":"arena_magician", type: "magician_type3_3" },
    
    "magician_type4": { name: "魔法剣を振るう魔戦士", bossName: "【魔法剣】ルーン・ナイト", hp: 180, atk: 60, def: 25, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_magician_type4"]?"arena_magician_type4":"arena_magician", type: "magician_type4" },
    "magician_type4_2": { name: "爆炎の格闘魔術師", bossName: "【爆拳】フレイム・モンク", hp: 200, atk: 65, def: 20, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_magician_type4_2"]?"arena_magician_type4_2":"arena_magician", type: "magician_type4_2" },
    "magician_type4_3": { name: "無双の魔法剣聖", bossName: "【覇王】ルーン・マスター", hp: 350, atk: 95, def: 40, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_magician_type4_3"]?"arena_magician_type4_3":"arena_magician", type: "magician_type4_3" },
    "magician_type4_4": { name: "焦熱の破壊神", bossName: "【業火】イフリート・アヴァター", hp: 320, atk: 115, def: 30, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_magician_type4_4"]?"arena_magician_type4_4":"arena_magician", type: "magician_type4_4" },
    
    "magician_type5": { name: "老いぼれた魔法使い", bossName: "【忘却】オールド・ソーサラー", hp: 150, atk: 40, def: 10, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_magician_type5"]?"arena_magician_type5":"arena_magician", type: "magician_type5" },
    "magician_type5_2": { name: "失われた禁呪の詠唱者", bossName: "【禁忌】ロスト・メイジ", hp: 220, atk: 120, def: 15, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_magician_type5_2"]?"arena_magician_type5_2":"arena_magician", type: "magician_type5_2" },
    "magician_type5_3": { name: "埃を被った歴史の証人", bossName: "【古記録】エンシェント・スカラー", hp: 400, atk: 55, def: 35, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_magician_type5_3"]?"arena_magician_type5_3":"arena_magician", type: "magician_type5_3" },
// ------------------------------------------
    // 🦅 鳥進化ツリー (11種)
    // ------------------------------------------
    "bird_type2": { name: "極彩色の霊鳥", bossName: "【極彩】レインボー・フェニックス", hp: 200, atk: 55, def: 15, speed: 80, spriteKey: window.DUNGEON_SPRITES["arena_bird_type2"]?"arena_bird_type2":"arena_bird", type: "bird_type2" },
    "bird_type2_2": { name: "神々しき天鳥", bossName: "【神鳥】ホーリー・スワン", hp: 320, atk: 80, def: 25, speed: 95, spriteKey: window.DUNGEON_SPRITES["arena_bird_type2_2"]?"arena_bird_type2_2":"arena_bird", type: "bird_type2_2" },
    
    "bird_type4": { name: "猛禽類の王", bossName: "【暴風】タイフーン・イーグル", hp: 250, atk: 70, def: 20, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_bird_type4"]?"arena_bird_type4":"arena_bird", type: "bird_type4" },
    "bird_type4_2": { name: "音速を越えし怪鳥", bossName: "【音速】ソニック・ガルーダ", hp: 350, atk: 105, def: 30, speed: 120, spriteKey: window.DUNGEON_SPRITES["arena_bird_type4_2"]?"arena_bird_type4_2":"arena_bird", type: "bird_type4_2" },
    
    "bird_type5": { name: "羽の抜け落ちた老鳥", bossName: "【風化】エンシェント・ディノバード", hp: 180, atk: 40, def: 30, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_bird_type5"]?"arena_bird_type5":"arena_bird", type: "bird_type5" },
    "bird_type5_2": { name: "骨だけの始祖鳥", bossName: "【化石】スケルトン・プテラ", hp: 280, atk: 65, def: 50, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_bird_type5_2"]?"arena_bird_type5_2":"arena_bird", type: "bird_type5_2" },
    
    "bird_type1": { name: "漆黒の怪鴉", bossName: "【凶鳥】ナイトメア・クロウ", hp: 150, atk: 75, def: 10, speed: 85, spriteKey: window.DUNGEON_SPRITES["arena_bird_type1"]?"arena_bird_type1":"arena_bird", type: "bird_type1" },
    "bird_type1_2": { name: "災いを運ぶ死神鳥", bossName: "【死告】デス・ブリンガー", hp: 240, atk: 110, def: 15, speed: 100, spriteKey: window.DUNGEON_SPRITES["arena_bird_type1_2"]?"arena_bird_type1_2":"arena_bird", type: "bird_type1_2" },
    
    "bird_type3": { name: "全てを見通す梟", bossName: "【慧眼】オラクル・オウル", hp: 170, atk: 60, def: 15, speed: 90, spriteKey: window.DUNGEON_SPRITES["arena_bird_type3"]?"arena_bird_type3":"arena_bird", type: "bird_type3" },
    "bird_type3_2": { name: "天候を操る雷鳥", bossName: "【天候】サンダーバード・ロード", hp: 280, atk: 85, def: 20, speed: 110, spriteKey: window.DUNGEON_SPRITES["arena_bird_type3_2"]?"arena_bird_type3_2":"arena_bird", type: "bird_type3_2" },
    "bird_type3_3": { name: "宇宙の理を識る星鳥", bossName: "【星天】コズミック・ファルコン", hp: 380, atk: 120, def: 25, speed: 130, spriteKey: window.DUNGEON_SPRITES["arena_bird_type3_3"]?"arena_bird_type3_3":"arena_bird", type: "bird_type3_3" },

    // ------------------------------------------
    // ⚙️ 機械進化ツリー (11種)
    // ------------------------------------------
    "machine_type2": { name: "黄金の時計仕掛け", bossName: "【煌機】クロックワーク・ゴールド", hp: 200, atk: 45, def: 25, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_machine_type2"]?"arena_machine_type2":"arena_machine", type: "machine_type2" },
    "machine_type2_2": { name: "白金の永久機関", bossName: "【永遠】プラチナム・ペルペトゥア", hp: 320, atk: 70, def: 40, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_machine_type2_2"]?"arena_machine_type2_2":"arena_machine", type: "machine_type2_2" },
    
    "machine_type4": { name: "重機動キャタピラー", bossName: "【重機】メガトン・ドーザー", hp: 280, atk: 60, def: 35, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_machine_type4"]?"arena_machine_type4":"arena_machine", type: "machine_type4" },
    "machine_type4_2": { name: "要塞型・巨大穿孔機", bossName: "【粉砕】ギガ・ドリル・マキシマム", hp: 450, atk: 90, def: 55, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_machine_type4_2"]?"arena_machine_type4_2":"arena_machine", type: "machine_type4_2" },
    
    "machine_type5": { name: "サビだらけのポンコツ", bossName: "【廃棄】スクラップ・マウンテン", hp: 190, atk: 35, def: 20, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_machine_type5"]?"arena_machine_type5":"arena_machine", type: "machine_type5" },
    "machine_type5_2": { name: "オイルを血とする亡霊機", bossName: "【呪機】ジャンク・ファントム", hp: 380, atk: 55, def: 45, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_machine_type5_2"]?"arena_machine_type5_2":"arena_machine", type: "machine_type5_2" },
    "machine_type5_3": { name: "腐食した暴走特急", bossName: "【暴走】アシッド・トレイン", hp: 420, atk: 75, def: 35, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_machine_type5_3"]?"arena_machine_type5_3":"arena_machine", type: "machine_type5_3" },
    
    "machine_type1": { name: "殺戮特化型チェンソー機", bossName: "【斬殺】ブラッド・マキナ", hp: 160, atk: 80, def: 10, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_machine_type1"]?"arena_machine_type1":"arena_machine", type: "machine_type1" },
    "machine_type1_2": { name: "狂気の人型兵器", bossName: "【抹殺】ジェノサイド・アンドロイド", hp: 250, atk: 110, def: 15, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_machine_type1_2"]?"arena_machine_type1_2":"arena_machine", type: "machine_type1_2" },
    
    "machine_type3": { name: "演算特化のメインフレーム", bossName: "【演算】マトリクス・コア", hp: 170, atk: 65, def: 25, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_machine_type3"]?"arena_machine_type3":"arena_machine", type: "machine_type3" },
    "machine_type3_2": { name: "ネットワークを支配する神脳", bossName: "【全脳】システム・オメガ", hp: 260, atk: 95, def: 30, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_machine_type3_2"]?"arena_machine_type3_2":"arena_machine", type: "machine_type3_2" },

    // ------------------------------------------
    // 🪨 岩進化ツリー (12種)
    // ------------------------------------------
    "stone_type2": { name: "水晶の守護者", bossName: "【結晶】クリスタル・ガーディアン", hp: 350, atk: 50, def: 40, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_stone_type2"]?"arena_stone_type2":"arena_stone", type: "stone_type2" },
    "stone_type2_2": { name: "虹色の巨星", bossName: "【輝石】プリズム・モノリス", hp: 480, atk: 75, def: 55, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_stone_type2_2"]?"arena_stone_type2_2":"arena_stone", type: "stone_type2_2" },
    
    "stone_type4": { name: "溶岩を纏う魔人", bossName: "【灼熱】ヴォルカニック・ゴーレム", hp: 400, atk: 65, def: 35, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_stone_type4"]?"arena_stone_type4":"arena_stone", type: "stone_type4" },
    "stone_type4_2": { name: "地殻を砕く剛腕", bossName: "【地殻】アース・クラッシャー", hp: 450, atk: 85, def: 45, speed: 8, spriteKey: window.DUNGEON_SPRITES["arena_stone_type4_2"]?"arena_stone_type4_2":"arena_stone", type: "stone_type4_2" },
    "stone_type4_3": { name: "大陸を背負う巨神", bossName: "【大陸】ガイア・タイタン", hp: 650, atk: 110, def: 60, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_stone_type4_3"]?"arena_stone_type4_3":"arena_stone", type: "stone_type4_3" },
    
    "stone_type5": { name: "苔むした遺跡の主", bossName: "【遺跡】エンシェント・ルイン", hp: 320, atk: 40, def: 50, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_stone_type5"]?"arena_stone_type5":"arena_stone", type: "stone_type5" },
    "stone_type5_2": { name: "動くピラミッド", bossName: "【王墓】ファラオ・ストーン", hp: 550, atk: 60, def: 65, speed: 3, spriteKey: window.DUNGEON_SPRITES["arena_stone_type5_2"]?"arena_stone_type5_2":"arena_stone", type: "stone_type5_2" },
    "stone_type5_3": { name: "砂漠を飲み込む流砂", bossName: "【砂塵】デザート・イーター", hp: 500, atk: 80, def: 40, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_stone_type5_3"]?"arena_stone_type5_3":"arena_stone", type: "stone_type5_3" },
    
    "stone_type1": { name: "呪いの黒曜石", bossName: "【呪石】カースド・オブシディアン", hp: 280, atk: 70, def: 25, speed: 12, spriteKey: window.DUNGEON_SPRITES["arena_stone_type1"]?"arena_stone_type1":"arena_stone", type: "stone_type1" },
    "stone_type1_2": { name: "奈落の墓標", bossName: "【絶望】アビス・モノリス", hp: 380, atk: 100, def: 35, speed: 18, spriteKey: window.DUNGEON_SPRITES["arena_stone_type1_2"]?"arena_stone_type1_2":"arena_stone", type: "stone_type1_2" },
    
    "stone_type3": { name: "ルーンを刻まれし賢石", bossName: "【賢石】ルーン・ゴーレム", hp: 300, atk: 80, def: 35, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_stone_type3"]?"arena_stone_type3":"arena_stone", type: "stone_type3" },
    "stone_type3_2": { name: "魔法陣を宿す浮遊岩", bossName: "【魔陣】アルテマ・ストーン", hp: 420, atk: 115, def: 45, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_stone_type3_2"]?"arena_stone_type3_2":"arena_stone", type: "stone_type3_2" },

    // ------------------------------------------
    // 🎈 風船進化ツリー (14種)
    // ------------------------------------------
    "balloon_type2": { name: "虹色のシャボン玉", bossName: "【虹泡】プリズム・バブル", hp: 250, atk: 35, def: 15, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type2"]?"arena_balloon_type2":"arena_balloon", type: "balloon_type2" },
    "balloon_type2_2": { name: "魅惑の香水バルーン", bossName: "【甘香】パフューム・フロート", hp: 270, atk: 40, def: 12, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type2_2"]?"arena_balloon_type2_2":"arena_balloon", type: "balloon_type2_2" },
    "balloon_type2_3": { name: "夢の国の気球", bossName: "【夢幻】ドリーム・エアシップ", hp: 400, atk: 60, def: 25, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type2_3"]?"arena_balloon_type2_3":"arena_balloon", type: "balloon_type2_3" },
    
    "balloon_type4": { name: "巨大な熱気球", bossName: "【爆熱】バーニング・バルーン", hp: 350, atk: 55, def: 15, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type4"]?"arena_balloon_type4":"arena_balloon", type: "balloon_type4" },
    "balloon_type4_2": { name: "弾みまくるゴムボール", bossName: "【超弾】バウンド・スマッシャー", hp: 320, atk: 65, def: 20, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type4_2"]?"arena_balloon_type4_2":"arena_balloon", type: "balloon_type4_2" },
    "balloon_type4_3": { name: "破裂寸前の超高圧球", bossName: "【大破裂】メガトン・ボンバー", hp: 480, atk: 100, def: 25, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type4_3"]?"arena_balloon_type4_3":"arena_balloon", type: "balloon_type4_3" },
    
    "balloon_type1": { name: "毒ガスを孕む風船", bossName: "【猛毒】ポイズン・スライム", hp: 200, atk: 50, def: 5, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type1"]?"arena_balloon_type1":"arena_balloon", type: "balloon_type1" },
    "balloon_type1_2": { name: "悪夢を見せる昏睡ガス", bossName: "【昏睡】ナイトメア・ガス", hp: 220, atk: 60, def: 8, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type1_2"]?"arena_balloon_type1_2":"arena_balloon", type: "balloon_type1_2" },
    "balloon_type1_3": { name: "終焉の瘴気雲", bossName: "【終焉】アビス・クラウド", hp: 330, atk: 95, def: 10, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type1_3"]?"arena_balloon_type1_3":"arena_balloon", type: "balloon_type1_3" },
    
    "balloon_type5": { name: "しぼみかけのゴム", bossName: "【劣化】メルト・バルーン", hp: 240, atk: 25, def: 10, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type5"]?"arena_balloon_type5":"arena_balloon", type: "balloon_type5" },
    "balloon_type5_2": { name: "穴だらけのボロ気球", bossName: "【廃棄】パッチワーク・エア", hp: 380, atk: 45, def: 20, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type5_2"]?"arena_balloon_type5_2":"arena_balloon", type: "balloon_type5_2" },
    
    "balloon_type3": { name: "天候観測バルーン", bossName: "【観測】ウェザー・フロート", hp: 210, atk: 45, def: 15, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type3"]?"arena_balloon_type3":"arena_balloon", type: "balloon_type3" },
    "balloon_type3_2": { name: "光学迷彩の浮遊球", bossName: "【隠密】ステルス・バブル", hp: 190, atk: 55, def: 10, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type3_2"]?"arena_balloon_type3_2":"arena_balloon", type: "balloon_type3_2" },
    "balloon_type3_3": { name: "成層圏の人工衛星", bossName: "【衛星】サテライト・アイ", hp: 320, atk: 90, def: 25, speed: 85, spriteKey: window.DUNGEON_SPRITES["arena_balloon_type3_3"]?"arena_balloon_type3_3":"arena_balloon", type: "balloon_type3_3" },

    // ------------------------------------------
    // 👻 幽霊進化ツリー (11種)
    // ------------------------------------------
    "ghost_type2": { name: "鏡に棲む美しき幻影", bossName: "【幻影】ミラージュ・レイス", hp: 170, atk: 45, def: 10, speed: 55, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type2"]?"arena_ghost_type2":"arena_ghost", type: "ghost_type2" },
    "ghost_type2_2": { name: "女神の魂を宿す霊体", bossName: "【神霊】ホーリー・アヴァター", hp: 280, atk: 70, def: 20, speed: 75, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type2_2"]?"arena_ghost_type2_2":"arena_ghost", type: "ghost_type2_2" },
    
    "ghost_type4": { name: "暴れ狂うポルターガイスト", bossName: "【喧騒】マッド・ポルターガイスト", hp: 220, atk: 60, def: 15, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type4"]?"arena_ghost_type4":"arena_ghost", type: "ghost_type4" },
    "ghost_type4_2": { name: "物理干渉する超念動力", bossName: "【念動】サイコキネシス・ロード", hp: 340, atk: 95, def: 25, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type4_2"]?"arena_ghost_type4_2":"arena_ghost", type: "ghost_type4_2" },
    
    "ghost_type5": { name: "忘れ去られた千年の怨み", bossName: "【千秋】エンシェント・カース", hp: 250, atk: 50, def: 25, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type5"]?"arena_ghost_type5":"arena_ghost", type: "ghost_type5" },
    "ghost_type5_2": { name: "風化しゆく古代の王霊", bossName: "【古王】ファラオ・ゴースト", hp: 420, atk: 75, def: 40, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type5_2"]?"arena_ghost_type5_2":"arena_ghost", type: "ghost_type5_2" },
    
    "ghost_type1": { name: "漆黒の悪霊", bossName: "【怨嗟】ダーク・レイス", hp: 140, atk: 70, def: 5, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type1"]?"arena_ghost_type1":"arena_ghost", type: "ghost_type1" },
    "ghost_type1_2": { name: "魂を狩り尽くす死神", bossName: "【死神】グリム・リーパー", hp: 230, atk: 115, def: 10, speed: 85, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type1_2"]?"arena_ghost_type1_2":"arena_ghost", type: "ghost_type1_2" },
    
    "ghost_type3": { name: "禁書庫の彷徨える知識", bossName: "【禁書】ライブラリ・ファントム", hp: 160, atk: 65, def: 15, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type3"]?"arena_ghost_type3":"arena_ghost", type: "ghost_type3" },
    "ghost_type3_2": { name: "他者の脳髄を喰う霊", bossName: "【脳波】マインド・イーター", hp: 180, atk: 75, def: 10, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type3_2"]?"arena_ghost_type3_2":"arena_ghost", type: "ghost_type3_2" },
    "ghost_type3_3": { name: "アカシックレコードの番霊", bossName: "【全知】アカシック・スピリット", hp: 300, atk: 110, def: 25, speed: 80, spriteKey: window.DUNGEON_SPRITES["arena_ghost_type3_3"]?"arena_ghost_type3_3":"arena_ghost", type: "ghost_type3_3" },

    // ------------------------------------------
    // 🪲 カブト進化ツリー (10種)
    // ------------------------------------------
    "beetle_type4": { name: "一角の暴走戦車", bossName: "【突進】ギガント・ホーン", hp: 350, atk: 60, def: 40, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type4"]?"arena_beetle_type4":"arena_beetle", type: "beetle_type4" },
    "beetle_type4_2": { name: "大地を割る剛力王", bossName: "【剛力】ヘラクレス・アースシェイカー", hp: 500, atk: 95, def: 55, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type4_2"]?"arena_beetle_type4_2":"arena_beetle", type: "beetle_type4_2" },
    
    "beetle_type5": { name: "琥珀に封じられし古代虫", bossName: "【琥珀】アンバー・インセクト", hp: 400, atk: 35, def: 60, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type5"]?"arena_beetle_type5":"arena_beetle", type: "beetle_type5" },
    "beetle_type5_2": { name: "地中深く眠る始祖虫", bossName: "【始祖】エンシェント・スカラベ", hp: 600, atk: 55, def: 80, speed: 5, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type5_2"]?"arena_beetle_type5_2":"arena_beetle", type: "beetle_type5_2" },
    
    "beetle_type2": { name: "黄金に輝く甲虫", bossName: "【黄金】ゴールド・ビートル", hp: 280, atk: 45, def: 35, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type2"]?"arena_beetle_type2":"arena_beetle", type: "beetle_type2" },
    "beetle_type2_2": { name: "宝石の如き白金の殻", bossName: "【白金】プラチナ・インセクト", hp: 320, atk: 55, def: 45, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type2_2"]?"arena_beetle_type2_2":"arena_beetle", type: "beetle_type2_2" },
    "beetle_type2_3": { name: "美しき虹色の妖甲虫", bossName: "【極彩】レインボー・スカラベ", hp: 400, atk: 75, def: 50, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type2_3"]?"arena_beetle_type2_3":"arena_beetle", type: "beetle_type2_3" },
    "beetle_type2_4": { name: "女神の遣いなる聖甲虫", bossName: "【聖甲】ディヴァイン・ビートル", hp: 450, atk: 85, def: 60, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type2_4"]?"arena_beetle_type2_4":"arena_beetle", type: "beetle_type2_4" },
    
    "beetle_type3": { name: "軍団を統べる女王蟻", bossName: "【統率】クイーン・コマンド", hp: 300, atk: 65, def: 30, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type3"]?"arena_beetle_type3":"arena_beetle", type: "beetle_type3" },
    
    "beetle_type1": { name: "猛毒を放つ邪悪な甲殻", bossName: "【猛毒】パラサイト・バグ", hp: 250, atk: 80, def: 20, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_beetle_type1"]?"arena_beetle_type1":"arena_beetle", type: "beetle_type1" },

    // ------------------------------------------
    // 🌱 種進化ツリー (11種)
    // ------------------------------------------
    "seed_type4": { name: "血に飢えた捕食植物", bossName: "【捕食】ブラッド・ヴァイン", hp: 220, atk: 50, def: 20, speed: 25, spriteKey: window.DUNGEON_SPRITES["arena_seed_type4"]?"arena_seed_type4":"arena_seed", type: "seed_type4" },
    "seed_type4_2": { name: "暴走する大地の根絶やし", bossName: "【大樹】ガイア・イーター", hp: 380, atk: 85, def: 35, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_seed_type4_2"]?"arena_seed_type4_2":"arena_seed", type: "seed_type4_2" },
    
    "seed_type1": { name: "死の胞子を撒く魔花", bossName: "【死胞】デッドリー・スポア", hp: 160, atk: 65, def: 10, speed: 35, spriteKey: window.DUNGEON_SPRITES["arena_seed_type1"]?"arena_seed_type1":"arena_seed", type: "seed_type1" },
    "seed_type1_2": { name: "奈落の底に咲く魔界樹", bossName: "【魔界】アビス・イグドラシル", hp: 260, atk: 100, def: 20, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_seed_type1_2"]?"arena_seed_type1_2":"arena_seed", type: "seed_type1_2" },
    
    "seed_type5": { name: "枯れ果てた茨の塊", bossName: "【枯葉】デッド・ソーン", hp: 200, atk: 35, def: 30, speed: 10, spriteKey: window.DUNGEON_SPRITES["arena_seed_type5"]?"arena_seed_type5":"arena_seed", type: "seed_type5" },
    "seed_type5_2": { name: "腐海を形成する古木", bossName: "【腐海】エンシェント・ロト", hp: 350, atk: 60, def: 55, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_seed_type5_2"]?"arena_seed_type5_2":"arena_seed", type: "seed_type5_2" },
    
    "seed_type3": { name: "精神を支配する寄生種", bossName: "【寄生】マインド・パラサイト", hp: 180, atk: 55, def: 15, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_seed_type3"]?"arena_seed_type3":"arena_seed", type: "seed_type3" },
    "seed_type3_2": { name: "幻覚を見せる極彩花", bossName: "【幻覚】イリュージョン・フラワー", hp: 210, atk: 65, def: 20, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_seed_type3_2"]?"arena_seed_type3_2":"arena_seed", type: "seed_type3_2" },
    "seed_type3_3": { name: "世界の理を記す世界樹", bossName: "【世界】ユグドラシル・オリジン", hp: 340, atk: 95, def: 35, speed: 65, spriteKey: window.DUNGEON_SPRITES["arena_seed_type3_3"]?"arena_seed_type3_3":"arena_seed", type: "seed_type3_3" },
    
    "seed_type2": { name: "魅惑の香りを放つ大輪", bossName: "【芳香】パフューム・ブルーム", hp: 190, atk: 40, def: 20, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_seed_type2"]?"arena_seed_type2":"arena_seed", type: "seed_type2" },
    "seed_type2_2": { name: "光り輝く楽園の聖花", bossName: "【聖花】パラダイス・ロータス", hp: 300, atk: 70, def: 30, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_seed_type2_2"]?"arena_seed_type2_2":"arena_seed", type: "seed_type2_2" },

    // ------------------------------------------
    // 🐉 竜進化ツリー (11種)
    // ------------------------------------------
    "dragon_type4": { name: "全てを破壊する暴竜", bossName: "【暴虐】タイラント・ドラゴン", hp: 350, atk: 85, def: 25, speed: 30, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type4"]?"arena_dragon_type4":"arena_dragon", type: "dragon_type4" },
    "dragon_type4_2": { name: "天地を喰らう覇王竜", bossName: "【覇王】カイザー・バハムート", hp: 600, atk: 130, def: 40, speed: 40, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type4_2"]?"arena_dragon_type4_2":"arena_dragon", type: "dragon_type4_2" },
    
    "dragon_type1": { name: "奈落の業火を吐く邪竜", bossName: "【邪竜】アビス・ファフニール", hp: 280, atk: 100, def: 15, speed: 45, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type1"]?"arena_dragon_type1":"arena_dragon", type: "dragon_type1" },
    "dragon_type1_2": { name: "終焉をもたらす漆黒の絶竜", bossName: "【終焉】アポカリプス・ドラゴン", hp: 450, atk: 150, def: 25, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type1_2"]?"arena_dragon_type1_2":"arena_dragon", type: "dragon_type1_2" },
    
    "dragon_type5": { name: "骨だけになった古竜", bossName: "【骸骨】スカル・ドラゴン", hp: 300, atk: 60, def: 35, speed: 15, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type5"]?"arena_dragon_type5":"arena_dragon", type: "dragon_type5" },
    "dragon_type5_2": { name: "千年を生きるゾンビ竜", bossName: "【死者】アンデッド・エンペラー", hp: 550, atk: 90, def: 55, speed: 20, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type5_2"]?"arena_dragon_type5_2":"arena_dragon", type: "dragon_type5_2" },
    
    "dragon_type3": { name: "魔法を極めし賢竜", bossName: "【賢竜】ワイズ・ドラゴン", hp: 250, atk: 95, def: 20, speed: 50, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type3"]?"arena_dragon_type3":"arena_dragon", type: "dragon_type3" },
    "dragon_type3_2": { name: "時空を操る神竜", bossName: "【時空】クロノ・バハムート", hp: 420, atk: 135, def: 30, speed: 70, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type3_2"]?"arena_dragon_type3_2":"arena_dragon", type: "dragon_type3_2" },
    
    "dragon_type2": { name: "虹色の鱗を持つ聖竜", bossName: "【聖竜】ホーリー・ドラゴン", hp: 280, atk: 75, def: 30, speed: 60, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type2"]?"arena_dragon_type2":"arena_dragon", type: "dragon_type2" },
    "dragon_type2_2": { name: "クリスタルを纏う天竜", bossName: "【水晶】クリスタル・リヴァイアサン", hp: 480, atk: 115, def: 45, speed: 75, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type2_2"]?"arena_dragon_type2_2":"arena_dragon", type: "dragon_type2_2" },
    "dragon_type2_3": { name: "銀河を翔ける星封竜", bossName: "【星天】ギャラクシー・ドラゴン", hp: 550, atk: 140, def: 50, speed: 90, spriteKey: window.DUNGEON_SPRITES["arena_dragon_type2_3"]?"arena_dragon_type2_3":"arena_dragon", type: "dragon_type2_3" }
};

// ★すべての新コマンド・陣形・召喚スキルを登録（種族制限撤廃＆生活・訓練言葉に全対応）
window.ARENA_SKILLS = {
    // 基礎アクション
    "たたかう": { type: "attack", cost: 0, power: 1.0, target: "single", name: "通常攻撃", desc: "対象に物理ダメージを与える。", allowedTypes: "all" },
    "かいふく": { type: "heal", cost: 10, power: 40, target: "self", name: "自己回復", desc: "自身のHPを中回復する。", allowedTypes: "all" },
    "にげる":   { type: "escape", cost: 15, target: "self", name: "逃走回避", desc: "数ターン画面外へ退避し、完全無敵になる。", allowedTypes: "all" },
    "しらべる": { type: "debuff_def", cost: 10, target: "enemy", name: "弱点看破", desc: "敵単体の防御力と回避率を下げる。", allowedTypes: "all" },
    "ごうせい": { type: "buff_next_atk", cost: 20, target: "self", name: "武器強化", desc: "次に与えるダメージが2.5倍になる。", allowedTypes: "all" },
    "なまえ":   { type: "provoke", cost: 5, target: "self", name: "名乗り", desc: "敵のヘイトを自身に集中させる（挑発）。", allowedTypes: "all" },
    "そうび":   { type: "equip", cost: 0, name: "武器装備", desc: "武器を構え、攻撃力を大幅にアップさせる。", allowedTypes: "all" },
    "はずす":   { type: "unequip", cost: 0, name: "装備解除", desc: "装備を外し身軽になる（回避率UP）。", allowedTypes: "all" },
    "つかう":   { type: "use_item", cost: 0, target: "self", name: "アイテム使用", desc: "ランダムな消費アイテムの効果を発揮する。", allowedTypes: "all" },

    // 陣形・姿勢制御
    "うえ": { type: "move", dir: "up", cost: 0, name: "前進", desc: "前衛に出る。攻撃力が上がるが狙われやすい。", allowedTypes: "all" },
    "した": { type: "move", dir: "down", cost: 0, name: "後退", desc: "後衛に下がる。狙われにくく被ダメージが減る。", allowedTypes: "all" },
    "みぎ": { type: "move", dir: "right", cost: 0, name: "右移動", desc: "右へ移動し、敵の狙いを逸らす。", allowedTypes: "all" },
    "ひだり": { type: "move", dir: "left", cost: 0, name: "左移動", desc: "左へ移動し、敵の狙いを逸らす。", allowedTypes: "all" },
    "うえむき": { type: "stance", mode: "high", cost: 5, name: "上段の構え", desc: "次ターンの攻撃力が1.5倍になる。", allowedTypes: "all" },
    "したむき": { type: "stance", mode: "low", cost: 5, name: "下段の構え", desc: "次ターンの防御力が1.5倍になる。", allowedTypes: "all" },
    "みぎむき": { type: "stance", mode: "evade_r", cost: 5, name: "右構え", desc: "次ターンの物理回避率が大幅に上がる。", allowedTypes: "all" },
    "ひだりむき": { type: "stance", mode: "evade_l", cost: 5, name: "左構え", desc: "次ターンの魔法回避率が大幅に上がる。", allowedTypes: "all" },

    // 日常・訓練・食材
    "食事": { type: "eat", cost: 0, healHp: 30, healMp: 10, name: "食事", desc: "HPを中回復し、MPを少し回復する。", allowedTypes: "all" },
    "たべる": { type: "eat", cost: 0, healHp: 40, healMp: 0, name: "たべる", desc: "HPを多めに回復する。", allowedTypes: "all" },
    "睡眠": { type: "sleep", cost: 0, name: "睡眠", desc: "その場で眠り、数ターン無防備になるがHP/MP全回復。", allowedTypes: "all" },
    "筋トレ": { type: "buff", stat: "atk", cost: 10, name: "筋トレ", desc: "自身の攻撃力をアップさせる（重複可）。", allowedTypes: "all" },
    "勉強": { type: "buff", stat: "intel", cost: 10, name: "勉強", desc: "自身の賢さをアップさせる（重複可）。", allowedTypes: "all" },
    "ランニング": { type: "buff", stat: "speed", cost: 10, name: "ランニング", desc: "自身の素早さをアップさせる。", allowedTypes: "all" },
    "ニンジン": { type: "buff_speed", cost: 5, target: "self", name: "ニンジン食い", desc: "目を良くし、命中率と素早さを少し上げる。", allowedTypes: "all" },
    "トマト": { type: "heal", cost: 5, power: 25, target: "self", name: "トマト食い", desc: "リコピンパワーでHPを回復する。", allowedTypes: "all" },
    "ピーマン": { type: "debuff_all", cost: 15, stat: "atk", target: "enemy", name: "ピーマン投擲", desc: "苦味で敵全体の攻撃力とやる気を下げる。", allowedTypes: "all" },

    // 下積み・バイト
    "退治": { type: "attack_special", cost: 10, power: 1.5, target: "single", name: "害虫退治", desc: "特定の種族（虫・植物系）に特効ダメージ。", allowedTypes: "all" },
    "バイト": { type: "gold_earn", cost: 0, target: "self", name: "バイト", desc: "1ターン無駄にするが、少しゴールドを稼ぐ。", allowedTypes: "all" },
    "書き写し": { type: "reflect", cost: 20, target: "self", name: "模写", desc: "次に受ける魔法攻撃を1度だけ反射する。", allowedTypes: "all" },
    "ふいご": { type: "buff_party", stat: "speed", cost: 15, name: "追い風", desc: "風を送り、味方全体の素早さを上げる。", allowedTypes: "all" },
    "石拾い": { type: "buff", stat: "def", cost: 5, name: "石積み", desc: "石を積んで自身の防御力を上げる。", allowedTypes: "all" },
    "皿洗い": { type: "cure_party", cost: 15, target: "party", name: "浄化の洗浄", desc: "味方全体のデバフや状態異常を洗い流す。", allowedTypes: "all" },
    "網の修理": { type: "debuff_speed", cost: 15, target: "enemy", name: "網投げ", desc: "敵単体に網を掛け、素早さを激減させる。", allowedTypes: "all" },
    "荷物運び": { type: "heavy", cost: 25, power: 2.0, target: "single", name: "重荷プレス", desc: "重い荷物を落とし大ダメージ＋スタン付与。", allowedTypes: "all" },
    "なげる": { type: "throw", cost: 5, power: 1.2, target: "single", name: "投擲", desc: "手持ちのガラクタを投げる（防御力無視固定ダメージ）。", allowedTypes: "all" },
    "おく": { type: "trap", cost: 15, target: "field", name: "罠設置", desc: "足元にトラップを設置し、接近した敵を迎撃する。", allowedTypes: "all" },

    // 師匠・専門アクション
    "冒険家": { type: "summon", master: "explore", cost: 30, name: "冒険家の呼出", desc: "冒険家を呼ぶ。敵の防御力を大幅に下げる罠を仕掛ける。", allowedTypes: "all" },
    "漁師": { type: "summon", master: "fishing", cost: 30, name: "漁師の呼出", desc: "漁師を呼ぶ。釣り竿で大ダメージを与えたり回復したりする。", allowedTypes: "all" },
    "料理人": { type: "summon", master: "cooking", cost: 30, name: "料理人の呼出", desc: "料理人を呼ぶ。特製スープで味方全体のHPを持続回復する。", allowedTypes: "all" },
    "農家": { type: "summon", master: "farming", cost: 30, name: "農家の呼出", desc: "身代わりカボチャを呼ぶ。敵の攻撃を一身に引き受ける。", allowedTypes: "all" },
    "建築士": { type: "summon", master: "building", cost: 30, name: "建築士の呼出", desc: "建築士を呼ぶ。味方陣地に強力なダメージカット防壁を張る。", allowedTypes: "all" },
    "鍛冶師": { type: "summon", master: "smithing", cost: 30, name: "鍛冶師の呼出", desc: "鍛冶師を呼ぶ。ハンマーで敵にダメージを与えつつ装甲を砕く。", allowedTypes: "all" },
    "建築": { type: "random_build", cost: 20, name: "即席建築", desc: "小屋、橋、防壁のどれかをランダムで瞬時に組み上げる。", allowedTypes: "all" },
    "釣り": { type: "fishing", cost: 15, name: "一本釣り", desc: "敵単体にダメージを与えるか、魚を釣って自身を回復する。", allowedTypes: "all" },
    "探検": { type: "explore", cost: 25, name: "秘境探検", desc: "数ターン戦線離脱し、回復アイテムや強力なバフを持って帰還する。", allowedTypes: "all" },
    "鍛冶": { type: "heavy", cost: 20, power: 1.5, target: "single", name: "鍛冶撃ち", desc: "敵の防御力を無視して装甲を叩き割る物理攻撃。", allowedTypes: "all" },
    "農業": { type: "build_farm", cost: 15, name: "畑の開墾", desc: "畑を作り、数ターン後に味方全体を大回復する。", allowedTypes: "all" },
    "料理": { type: "heal_party", cost: 25, power: 30, name: "振る舞い", desc: "味方全体のHPを回復する。", allowedTypes: "all" },

    // 施設・建物系
    "城":   { type: "call_rescue", cost: 40, name: "城の援軍要請", desc: "城から兵士、隊長、あるいは王様をランダムに呼び寄せる。", allowedTypes: "all" },
    "小屋": { type: "build_hut", cost: 15, name: "小屋立てこもり", desc: "小屋を建てて中に籠り、物理ダメージを大幅に軽減する。", allowedTypes: "all" },
    "橋":   { type: "build_bridge", cost: 15, name: "橋架け", desc: "橋を架け、味方全員を強制的に後衛へ安全に退避させる。", allowedTypes: "all" },
    "カジノ": { type: "roulette", cost: 30, target: "all", name: "一か八かの大穴", desc: "敵味方問わず、超回復か大ダメージがランダムで発生する。", allowedTypes: "all" },
    "レストラン": { type: "full_heal_party", cost: 80, target: "party", name: "晩餐会", desc: "莫大なMPを消費し、味方全体のHP・MPを全回復＋全バフ。", allowedTypes: "all" },
    "カード": { type: "draw_card", cost: 15, target: "enemy", name: "ドロー", desc: "デッキからカードを引き、ランダムな属性魔法攻撃を放つ。", allowedTypes: "all" },
    "ショップ": { type: "buy_mercenary", cost: 0, target: "party", name: "傭兵雇用", desc: "所持ゴールドを消費し、その戦闘中だけ強力な傭兵を雇う。", allowedTypes: "all" },
    "冷凍庫": { type: "magic_ice", cost: 35, power: 1.5, target: "all", name: "絶対零度", desc: "敵全体に氷属性ダメージを与え、確率でスタンさせる。", allowedTypes: "all" },
    "金庫": { type: "invincible", cost: 50, target: "self", name: "金庫隠れ", desc: "数ターン行動不能になるが、一切のダメージを受け付けない。", allowedTypes: "all" },
    "倉庫": { type: "magic_random", cost: 25, power: 1.2, target: "random", name: "ガラクタの雨", desc: "空から大量のガラクタを降らせ、敵全体にランダム複数回ダメージ。", allowedTypes: "all" },

    // 一問一答・属性魔法系（類義語による微細な効果違い）
    "水筒": { type: "heal", cost: 0, power: 15, target: "self", name: "水飲み", desc: "MPを消費せずHPを少し回復する。", allowedTypes: "all" },
    "飲み物": { type: "heal", cost: 5, power: 25, target: "self", name: "水分補給", desc: "HPを少し回復し、MPも少し回復する。", allowedTypes: "all" },
    "水": { type: "regen_party", cost: 20, target: "party", name: "癒やしの水", desc: "味方全体に数ターンの継続回復効果（リジェネ）を付与。", allowedTypes: "all" },
    "雨": { type: "magic_water", cost: 25, power: 1.0, target: "all", name: "恵みの雨", desc: "敵全体に水属性ダメージを与え、火属性の敵を弱体化。", allowedTypes: "all" },
    "火": { type: "magic_fire", cost: 15, power: 1.5, target: "all", name: "火炎", desc: "敵全体に炎属性の魔法ダメージを与える。", allowedTypes: "all" },
    "炎": { type: "magic_fire", cost: 25, power: 2.0, target: "single", name: "爆炎", desc: "敵単体に強烈な炎属性の魔法ダメージを与える。", allowedTypes: "all" },
    "熱": { type: "buff_atk", cost: 10, target: "self", name: "熱気", desc: "自身の体温を上げ、攻撃力を徐々にアップさせる。", allowedTypes: "all" },
    "ガス": { type: "magic_poison", cost: 20, target: "all", name: "毒ガス", desc: "敵全体を毒状態にし、毎ターンスリップダメージを与える。", allowedTypes: "all" },
    "太陽": { type: "magic_light", cost: 30, power: 1.8, target: "all", name: "ソーラーレイ", desc: "敵全体に光属性ダメージを与え、暗闇（命中ダウン）にする。", allowedTypes: "all" },
    "光": { type: "blind", cost: 15, target: "all", name: "フラッシュ", desc: "強烈な光で敵全体の目を眩ませ、命中率を大幅に下げる。", allowedTypes: "all" },
    "土": { type: "magic_earth", cost: 20, power: 1.5, target: "all", name: "アースクエイク", desc: "敵全体に地属性ダメージ。飛行していない敵に特効。", allowedTypes: "all" },
    "泥": { type: "debuff_speed", cost: 10, target: "single", name: "泥投げ", desc: "敵単体の素早さと回避率を下げる。", allowedTypes: "all" },
    "鉄": { type: "buff_def", cost: 15, target: "self", name: "アイアンボディ", desc: "自身の体を鉄のように硬くし、防御力を絶大に上げる。", allowedTypes: "all" },
    "鋼": { type: "buff_def", cost: 25, target: "party", name: "鋼の陣形", desc: "味方全体の防御力を大幅に上げる。", allowedTypes: "all" },
    "包丁": { type: "attack_pierce", cost: 10, power: 1.2, target: "single", name: "ナイフ撃", desc: "敵の防御力をある程度無視して斬撃ダメージを与える。", allowedTypes: "all" },
    "鍋": { type: "shield", cost: 10, target: "self", name: "鍋の盾", desc: "鍋を構え、数ターンの間物理ダメージを大幅にカットする。", allowedTypes: "all" },
    "コンパス": { type: "aim", cost: 10, target: "self", name: "弱点看破", desc: "次のターンの攻撃が必ずクリティカルヒットになる。", allowedTypes: "all" },
    "図面": { type: "dodge", cost: 20, target: "self", name: "行動予測", desc: "敵の行動を予測し、次の一撃を100%回避する。", allowedTypes: "all" }
};

window.ARENA_STATE = {
    active: false, wave: 1, healPots: 3, party: [], enemies: [], log: [], autoMode: false, isProcessing: false,
    guests: [], farmTimer: 0
};
window.ARENA_RECEPTION_STATE = { party: [], available: [] };


// ★ロール別のスキル定義（おまかせ機能用）
window.ROLE_PROFILES = {
    'tank': { name: '鉄壁の盾', words: ['なまえ','したむき','した','石拾い','鍋','金庫','農家','鉄','鋼','図面'] },
    'attacker': { name: '剛腕の矛', words: ['たたかう','うえむき','うえ','筋トレ','ごうせい','火','炎','太陽','雨','土','荷物運び','鍛冶','退治','包丁'] },
    'healer': { name: '慈愛の光', words: ['かいふく','食事','たべる','トマト','水','料理','レストラン','皿洗い','農業'] },
    'support': { name: '機知の翼', words: ['しらべる','勉強','ランニング','ニンジン','ピーマン','ふいご','網の修理','冒険家','漁師','建築士','コンパス','太陽'] }
};

// ★追加：alertの代わりに使用するメッセージ表示関数
window.showTacticMsg = function(msg, color = '#4CAF50') {
    let el = document.getElementById('tactic-editor-msg');
    if (!el) return;
    el.innerHTML = msg;
    el.style.color = color;
    el.style.opacity = 1;
    clearTimeout(window._tacticMsgTimer);
    window._tacticMsgTimer = setTimeout(() => { el.style.opacity = 0; }, 2000);
};

// ★「おまかせ」実行関数（優先度と条件の罠を解消した賢い版）
window.autoSetTactic = function(roleKey, tIdx) {
    let learned = window.aiPet.apprentice?.learnedWords || [];
    let profile = window.ROLE_PROFILES[roleKey];
    let rules = [];
    let fallbackRules = []; // 「いつでも」系の攻撃スキルを退避させる配列
    
    let matches = profile.words.filter(w => learned.includes(w));
    
    // 絶対の最優先：瀕死時の回復
    if (learned.includes("かいふく")) rules.push({ condition: "hp_self_under_30", action: "かいふく" });
    if (learned.includes("睡眠")) rules.push({ condition: "mp_self_under_30", action: "睡眠" });
    
    matches.forEach(w => {
        let skill = window.ARENA_SKILLS[w];
        if (!skill) return;

        let cond = "always";
        // スキルのタイプから最適な条件を推論して割り当てる
        let isMagic = skill.type.includes("magic") && skill.type !== "magic_poison";
        let isPierce = skill.type === "attack_pierce" || w === "鍛冶";

        if (skill.type.includes("buff") || skill.type === "equip" || w === "うえむき" || w === "したむき") cond = "no_buff_atk";
        else if (skill.type === "defend" || skill.type === "shield" || w === "した" || w === "金庫" || w === "小屋") cond = "hp_self_under_50";
        else if (skill.type === "summon" || skill.type === "call_rescue") cond = "no_guest";
        else if (w === "なまえ" || w === "うえ") cond = "is_back"; 
        else if (isMagic || isPierce) cond = "enemy_high_def"; // 魔法や貫通は物理に強い敵に優先！
        else if (skill.type === "attack" || skill.type === "heavy") cond = "enemy_high_mdef"; // 物理は魔法に強い敵に優先！
        
        if (cond === "always") {
            if (w !== "たたかう") fallbackRules.push({ condition: "always", action: w });
        } else {
            rules.push({ condition: cond, action: w });
        }
    });
    
    let defaultAttack = matches.find(w => {
        let s = window.ARENA_SKILLS[w];
        return s && (s.type.includes("attack") || s.type.includes("heavy") || s.type.includes("magic"));
    }) || "たたかう";

    rules = rules.concat(fallbackRules);
    
    // 最後に絶対攻撃を入れる
    if (!rules.some(r => r.condition === "always" && (r.action === "たたかう" || r.action === defaultAttack))) {
        rules.push({ condition: "always", action: defaultAttack });
    }
    
    // 重複ルールを排除（同じactionとconditionの組み合わせを消す）
    let uniqueRules = [];
    rules.forEach(r => {
        if (!uniqueRules.some(ur => ur.action === r.action && ur.condition === r.condition)) {
            uniqueRules.push(r);
        }
    });

    window.aiPet.tactics[tIdx].rules = uniqueRules.slice(0, 8); // 最大8個
    window.aiPet.tactics[tIdx].name = profile.name;
    window.renderTacticEditor();
    window.showTacticMsg(`「${profile.name}」の構成で再構築しました！`, '#2196F3');
};

// ==========================================
// ★ ガンビット（作戦）システム用 データとロジック
// ==========================================

window.TACTIC_CONDITIONS = {
    "always": "いつでも",
    "hp_self_under_30": "自分のHPが30%以下",
    "hp_self_under_50": "自分のHPが50%以下",
    "hp_self_under_70": "自分のHPが70%以下",
    "hp_ally_under_30": "味方の誰かのHPが30%以下",
    "hp_ally_under_50": "味方の誰かのHPが50%以下",
    "mp_self_under_30": "自分のMPが30%以下",
    "enemy_count_2_over": "敵が2体以上いる",
    "enemy_count_4_over": "敵が4体以上いる",
    "enemy_more_than_ally": "敵の数が味方より多い",
    "no_guest": "助っ人・援軍が誰もいない",
    "is_front": "自分が前衛にいる",
    "is_back": "自分が後衛にいる",
    "no_buff_atk": "自分の攻撃力が上がっていない",
    "no_shield": "自分に防壁がない",
    "no_equip": "自分が武器を装備していない",
    "enemy_charging": "敵が大技の溜めモーション中",
    "enemy_counter": "敵が物理反撃の構え中",
    "enemy_magic_reflect": "敵が魔法反射の構え中",
    "enemy_flying": "敵が飛行している",
    "ally_debuff": "味方がデバフ・状態異常",
    "enemy_high_def": "敵が物理に強い(装甲/岩)",
    "enemy_high_mdef": "敵が魔法に強い(霊体)"
};

// ★修正: 覚えている言葉「だけ」を使って、デフォルト作戦を動的に生成する関数
window.getDefaultTactics = function(words) {
    let wList = Array.isArray(words) ? words : [];
    let tactics = [
        { name: "バランスよく", rules: [] },
        { name: "ガンガンいこうぜ", rules: [] },
        { name: "いのちをだいじに", rules: [] },
        { name: "サポート頼む", rules: [] }
    ];
    if (wList.length === 0) return tactics; // 何も覚えていなければ空の作戦になる

    // 覚えている言葉をカテゴリ分け
    let attacks = wList.filter(w => window.ARENA_SKILLS[w] && ["attack", "heavy", "attack_special"].includes(window.ARENA_SKILLS[w].type));
    let magics = wList.filter(w => window.ARENA_SKILLS[w] && window.ARENA_SKILLS[w].type.includes("magic") && window.ARENA_SKILLS[w].type !== "magic_poison");
    let pierce = wList.filter(w => window.ARENA_SKILLS[w] && (window.ARENA_SKILLS[w].type === "attack_pierce" || w === "鍛冶"));
    let heals = wList.filter(w => window.ARENA_SKILLS[w] && ["heal", "heal_self", "heal_all", "eat", "sleep", "heal_party", "full_heal_party", "regen_party"].includes(window.ARENA_SKILLS[w].type));
    let buffs = wList.filter(w => window.ARENA_SKILLS[w] && ["buff", "defend", "equip", "buff_atk", "buff_def", "shield"].includes(window.ARENA_SKILLS[w].type));
    let supports = wList.filter(w => window.ARENA_SKILLS[w] && ["summon", "call_rescue", "build_hut", "build_bridge", "build_farm", "random_build", "explore", "fishing"].includes(window.ARENA_SKILLS[w].type));

    let basicAttack = attacks.length > 0 ? attacks[0] : (magics.length > 0 ? magics[0] : (supports.length > 0 ? supports[0] : wList[0]));
    let magicOrPierce = magics.length > 0 ? magics[0] : (pierce.length > 0 ? pierce[0] : null);
    let physicalAttack = attacks.length > 0 ? attacks[0] : null;
    let healSkill = heals.length > 0 ? heals[0] : null;
    let buffSkill = buffs.length > 0 ? buffs[0] : null;
    let supportSkill = supports.length > 0 ? supports[0] : (buffs.length > 0 ? buffs[0] : null);

    // バランスよく
    if (healSkill) tactics[0].rules.push({ condition: "hp_self_under_50", action: healSkill });
    if (magicOrPierce) tactics[0].rules.push({ condition: "enemy_high_def", action: magicOrPierce });
    if (physicalAttack && physicalAttack !== basicAttack) tactics[0].rules.push({ condition: "enemy_high_mdef", action: physicalAttack });
    if (basicAttack) tactics[0].rules.push({ condition: "always", action: basicAttack });

    // ガンガンいこうぜ
    if (magicOrPierce) tactics[1].rules.push({ condition: "enemy_high_def", action: magicOrPierce });
    let bigAttack = magics.length > 0 ? magics[magics.length - 1] : basicAttack;
    if (bigAttack && bigAttack !== basicAttack) tactics[1].rules.push({ condition: "enemy_count_2_over", action: bigAttack });
    if (basicAttack) tactics[1].rules.push({ condition: "always", action: basicAttack });

    // いのちをだいじに
    if (healSkill) tactics[2].rules.push({ condition: "hp_ally_under_50", action: healSkill });
    if (buffSkill) tactics[2].rules.push({ condition: "no_shield", action: buffSkill });
    if (basicAttack) tactics[2].rules.push({ condition: "always", action: basicAttack });

    // サポート頼む
    if (supportSkill) tactics[3].rules.push({ condition: "no_guest", action: supportSkill });
    if (buffSkill) tactics[3].rules.push({ condition: "no_buff_atk", action: buffSkill });
    if (basicAttack) tactics[3].rules.push({ condition: "always", action: basicAttack });

    return tactics;
};

window.initTactics = function() {
    if (!window.aiPet) return;
    if (!window.aiPet.tactics || window.aiPet.tactics.length === 0) {
        window.aiPet.tactics = [
            { name: "マイ作戦1", rules: [{ condition: "always", action: "たたかう" }] },
            { name: "マイ作戦2", rules: [{ condition: "always", action: "たたかう" }] },
            { name: "マイ作戦3", rules: [{ condition: "always", action: "たたかう" }] }
        ];
    }
};

window.checkTacticCondition = function(cond, p, state) {
    if (cond === "always") return true;
    let myHpRate = p.hp / p.maxHp;
    let myMpRate = (p.maxMp > 0) ? (p.mp / p.maxMp) : 0;
    let aliveParty = state.party.filter(pt => pt.hp > 0 && (pt.exploreTimer||0) === 0);
    let minAllyHpRate = aliveParty.length > 0 ? Math.min(...aliveParty.map(pt => pt.hp / pt.maxHp)) : 1.0;
    let aliveEnemies = state.enemies.filter(e => e.hp > 0);
    let aliveGuests = state.guests.filter(g => g.hp > 0);

    switch(cond) {
        case "hp_self_under_30": return myHpRate <= 0.3;
        case "hp_self_under_50": return myHpRate <= 0.5;
        case "hp_self_under_70": return myHpRate <= 0.7;
        case "hp_ally_under_30": return minAllyHpRate <= 0.3;
        case "hp_ally_under_50": return minAllyHpRate <= 0.5;
        case "mp_self_under_30": return myMpRate <= 0.3;
        case "enemy_count_2_over": return aliveEnemies.length >= 2;
        case "enemy_count_4_over": return aliveEnemies.length >= 4;
        case "enemy_more_than_ally": return aliveEnemies.length > (aliveParty.length + aliveGuests.length);
        case "no_guest": return aliveGuests.length === 0;
        case "is_front": return p.row === 'front';
        case "is_back": return p.row === 'back';
        // ★修正：「ごうせい(nextAtkBoost)」が掛かっている時は、すでに強化済みと判定させる！
        case "no_buff_atk": return (p.buffAtk || 1.0) <= 1.0 && !p.nextAtkBoost;
        case "no_shield": return !p.shield;
        case "no_equip": return !p.isEquipped;
        case "enemy_charging": return aliveEnemies.some(e => e.isCharging);
        case "enemy_counter": return aliveEnemies.some(e => e.isCounterStance);
        case "enemy_magic_reflect": return aliveEnemies.some(e => e.isMagicReflect);
        case "enemy_flying": return aliveEnemies.some(e => e.isFlying);
        case "ally_debuff": return state.party.some(pt => pt.hp > 0 && (pt.poisonTimer > 0 || pt.doomTimer > 0 || pt.def < 10));
        case "enemy_high_def": return aliveEnemies.some(e => e.armorValue > 0 || (e.type && e.type.split('_')[0] === 'stone'));
        case "enemy_high_mdef": return aliveEnemies.some(e => e.type && e.type.split('_')[0] === 'ghost');
    }
    return false;
};

// 失敗行動の決定（性格依存）
window.getFailureAction = function(p) {
    let stats = { intel: p.intel, power: p.atk, speed: p.speed, beauty: 10, mood: 50 }; 
    let personality = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(stats) : "普通";
    let words = p.words || [];
    
    let isAggressive = ["熱血", "ストイック"].includes(personality);
    let isDefensive = ["学者肌", "完璧超人"].includes(personality);
    let isPanic = ["せっかち", "韋駄天"].includes(personality);
    let isShowy = ["芸術家", "アイドル"].includes(personality);
    
    let chosenSkill = null;
    let logMsg = `${p.name} はぼーっとしている...`;

    // 覚えている言葉の中から性格に合ったものを強引に使う
    if (isAggressive) {
        let atks = words.filter(w => window.ARENA_SKILLS[w] && ["attack", "heavy", "magic", "heavy_magic", "magic_all"].includes(window.ARENA_SKILLS[w].type));
        if (atks.length > 0) chosenSkill = atks[Math.floor(Math.random() * atks.length)];
        else chosenSkill = "たたかう";
    } else if (isDefensive) {
        let defs = words.filter(w => window.ARENA_SKILLS[w] && ["defend", "buff", "heal", "heal_ally", "heal_all", "build_hut", "build_bridge"].includes(window.ARENA_SKILLS[w].type));
        if (defs.length > 0) chosenSkill = defs[Math.floor(Math.random() * defs.length)];
        else chosenSkill = "たたかう";
    } else if (isPanic) {
        if (words.length > 0) chosenSkill = words[Math.floor(Math.random() * words.length)];
        else chosenSkill = "たたかう";
    } else if (isShowy) {
        logMsg = `${p.name} は華麗なポーズを決めた！✨（効果なし）`;
    } else if (personality === "憂鬱") {
        logMsg = `${p.name} はため息をついている...`;
    }

    return { skillName: chosenSkill, log: logMsg };
};

// ==========================================
// 1. 受付画面 ＆ AIマインドエディタ
// ==========================================
window.openArenaReception = function() {
    if (window.aiPet) {
        const generation = window.aiPet.generation || 1;
        if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('visit_castle', generation);
        if (typeof window.unlockCastlePersonCards === 'function') window.unlockCastlePersonCards(generation);
    }
    window.initTactics();
    if (typeof window.ARENA_RECEPTION_STATE === 'undefined' || !window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE = { party: [], available: [] };
    
    const encounterUi = document.getElementById('encounterOverlay'); if (encounterUi) encounterUi.classList.remove('active');
    const statusUi = document.getElementById('statusOverlay'); if (statusUi) statusUi.classList.remove('active');

    let ui = document.getElementById('arena-reception-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-reception-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 50000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto;`;
        document.body.appendChild(ui);
    }
    
    let pwr = Math.floor(window.aiPet.stats.power || 10); let int = Math.floor(window.aiPet.stats.intel || 10); let spd = Math.floor(window.aiPet.stats.speed || 10);
    // ★追加：自身のHP/MPを最大9999でカンスト
    let myMaxHp = Math.min(9999, Math.floor(100 + (pwr * 2)));
    let myMaxMp = Math.min(9999, Math.floor(int * 2));

    window.ARENA_RECEPTION_STATE.party = [{
        id: "me", name: window.aiPet.name || "現在のAI", skin: window.aiPet.currentSkin || 'robot',
        hp: myMaxHp, maxHp: myMaxHp, mp: myMaxMp, maxMp: myMaxMp,
        atk: Math.floor(10 + pwr * 0.5), def: Math.floor(5 + pwr * 0.2), intel: int, speed: spd, 
        words: window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? [...window.aiPet.apprentice.learnedWords] : [],
        isMe: true, tacticType: "custom", tacticIndex: 0
    }];

    window.ARENA_RECEPTION_STATE.available = [];
    let discovered = (window.aiPet && window.aiPet.discoveredMonsters) ? window.aiPet.discoveredMonsters : [];
    let savedStats = (window.aiPet && window.aiPet.savedGrazeStats) ? window.aiPet.savedGrazeStats : {};
    let pastId = 0;
    discovered.forEach(skinKey => {
        if (skinKey === window.aiPet.currentSkin) return;
        let sName = (typeof monsterBookData !== 'undefined' && monsterBookData[skinKey]) ? monsterBookData[skinKey].name : skinKey;
        let sPwr = Math.floor(Math.max(5, pwr - 5)); let sInt = Math.floor(Math.max(5, int - 5)); let sSpd = Math.floor(Math.max(5, spd - 5));
        let sWords = []; // デフォルトは何も覚えていない
        if (savedStats[skinKey]) {
            if (savedStats[skinKey].stats) { sPwr = Math.floor(savedStats[skinKey].stats.power || sPwr); sInt = Math.floor(savedStats[skinKey].stats.intel || sInt); sSpd = Math.floor(savedStats[skinKey].stats.speed || sSpd); }
            if (savedStats[skinKey].learnedWords && savedStats[skinKey].learnedWords.length > 0) sWords = [...savedStats[skinKey].learnedWords];
        }
        
        // ★追加：過去の幻影仲間のHP/MPも最大9999でカンスト
        let pMaxHp = Math.min(9999, Math.floor(80 + sPwr));
        let pMaxMp = Math.min(9999, Math.floor(sInt * 2));
        window.ARENA_RECEPTION_STATE.available.push({
            id: "past_" + pastId++, name: `幻影の${sName}`, skin: skinKey, hp: pMaxHp, maxHp: pMaxHp, mp: pMaxMp, maxMp: pMaxMp,
            atk: Math.floor(8 + sPwr * 0.4), def: 5, intel: sInt, speed: sSpd, words: sWords, isMe: false, tacticType: "default", tacticIndex: 0
        });
    });
    window.renderArenaReception();
};

window.changePartyTactic = function(e, idx) {
    let val = e.target.value.split('_');
    window.ARENA_RECEPTION_STATE.party[idx].tacticType = val[0];
    window.ARENA_RECEPTION_STATE.party[idx].tacticIndex = parseInt(val[1]);
};

// ==========================================
// ★新規追加：WAVE選択UIの同期ヘルパー関数
// ==========================================
window.syncArenaWaveInput = function(source) {
    let rState = window.ARENA_RECEPTION_STATE;
    let step = (rState.selectedMode === 'boss') ? 1 : 50;
    let currentHighest = (rState.selectedMode === 'boss') ? (window.aiPet.arenaBossHighestWave || 1) : (window.aiPet.arenaHighestWave || 1);
    let maxValid = Math.floor((currentHighest - 1) / step) * step + 1;

    let inputNum = document.getElementById('arena-start-wave');
    let slider = document.getElementById('arena-start-slider');
    if (!inputNum || !slider) return;

    let val = 1;
    if (source === 'slider') {
        val = parseInt(slider.value);
        inputNum.value = val;
    } else {
        // 直接入力された場合、一番近い正しいチェックポイントにスナップさせる
        val = parseInt(inputNum.value);
        if (isNaN(val)) val = 1;
        val = Math.max(1, Math.min(maxValid, val));

        let remainder = (val - 1) % step;
        if (remainder !== 0) {
            if (remainder >= step / 2) val += (step - remainder);
            else val -= remainder;
        }
        if (val > maxValid) val = maxValid;

        inputNum.value = val;
        slider.value = val;
    }
};

window.adjustArenaWaveInput = function(amount) {
    let inputNum = document.getElementById('arena-start-wave');
    if(!inputNum) return;
    inputNum.value = parseInt(inputNum.value) + amount;
    window.syncArenaWaveInput('number');
};

window.renderArenaReception = function() {
    let ui = document.getElementById('arena-reception-ui'); if (!ui) return;
    let rState = window.ARENA_RECEPTION_STATE;
    if (!rState.selectedMode) rState.selectedMode = 'normal';

    let partyHtml = rState.party.map((p, index) => {
        let pDefTactics = window.getDefaultTactics(p.words);
        let defOpts = pDefTactics.map((t, i) => `<option value="default_${i}" ${p.tacticType==='default' && p.tacticIndex===i ? 'selected' : ''}>[基本] ${t.name}</option>`).join('');
        let cusOpts = p.isMe ? window.aiPet.tactics.map((t, i) => `<option value="custom_${i}" ${p.tacticType==='custom' && p.tacticIndex===i ? 'selected' : ''}>[マイ] ${t.name}</option>`).join('') : '';
        let editBtn = `<button onclick="event.stopPropagation(); window.openTacticEditor();" style="background:#2196F3; color:#fff; border:none; border-radius:4px; font-size:10px; padding:4px 5px; cursor:pointer; margin-top:5px; width:100%;">⚙️ AIマインドを編集・確認</button>`;

        return `
        <div onclick="window.removeArenaPartyMember(${index})" style="background:#222; border:2px solid ${p.isMe ? '#4CAF50' : '#FFD700'}; border-radius:8px; padding:10px; width:160px; text-align:center; cursor:${p.isMe ? 'default' : 'pointer'}; position:relative;">
            <div style="font-size:16px; color:${p.isMe ? '#4CAF50' : '#FFD700'}; font-weight:bold; margin-bottom:5px;">${p.name}</div>
            <div style="font-size:12px; color:#aaa;">HP:${p.hp} / MP:${p.mp}</div>
            <select onchange="window.changePartyTactic(event, ${index})" onclick="event.stopPropagation()" style="margin-top:8px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; font-size:11px; padding:4px; width:100%;">
                ${defOpts}${cusOpts}
            </select>
            ${editBtn}
            ${!p.isMe ? `<div style="position:absolute; top:-10px; right:-10px; background:red; color:white; border-radius:50%; width:20px; height:20px; font-weight:bold; line-height:20px;">×</div>` : ''}
        </div>
        `;
    }).join('');
    for(let i=rState.party.length; i<4; i++) partyHtml += `<div style="background:#111; border:2px dashed #555; border-radius:8px; padding:10px; width:160px; text-align:center; display:flex; align-items:center; justify-content:center; color:#555;">EMPTY</div>`;
    
    let availableHtml = rState.available.length > 0 ? rState.available.map((p, index) => `
        <div onclick="window.addArenaPartyMember(${index})" style="background:#1a1a1a; border:1px solid #444; border-radius:8px; padding:10px; width:140px; text-align:center; cursor:pointer;">
            <div style="font-size:14px; color:#fff; font-weight:bold; margin-bottom:5px;">${p.name}</div>
            <div style="font-size:12px; color:#888;">HP:${p.hp} / MP:${p.mp}</div>
            <div style="font-size:10px; color:#4fc3f7; margin-top:5px;">+ パーティへ</div>
        </div>
    `).join('') : `<div style="color:#888; text-align:center; width:100%; padding:20px;">図鑑に登録された仲間が見つかりません</div>`;

    // モードによって最高到達記録と、刻み幅（ステップ）を決定
    let currentHighest = 1;
    let step = 50;
    if (rState.selectedMode === 'boss') {
        currentHighest = window.aiPet.arenaBossHighestWave || 1;
        step = 1; // ボスラッシュは1刻み
    } else {
        currentHighest = window.aiPet.arenaHighestWave || 1;
        step = 50; // 通常エンドレスは50刻み
    }

    let bossUnlocked = (window.aiPet.arenaHighestWave >= 51) || (window.aiPet.defeatedArenaBosses && window.aiPet.defeatedArenaBosses.length > 0);

    // ★大改修：セレクトボックスを廃止し、スライダー＋数値入力UIに変更
    let startWaveHtml = '';
    if (rState.selectedMode !== 'friend') {
        // 現在選べる最大のWAVEを計算
        let maxValid = Math.floor((currentHighest - 1) / step) * step + 1;
        let skipStep = step * 10; // -500 や +500 ボタン用（ボスラッシュなら ±10）

        startWaveHtml = `
            <div style="margin-bottom:20px; background:#111; padding:15px 20px; border-radius:8px; border:2px solid #555; display:flex; flex-direction:column; gap:10px; justify-content:center; align-items:center; width: 90%; max-width: 600px; margin-left: auto; margin-right: auto;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px dashed #444; padding-bottom:5px;">
                    <span style="color:#FFD700; font-weight:bold; font-size:16px;">🚩 開始地点（チェックポイント）を選択</span>
                    <span style="font-size:12px; color:#aaa;">(※${step}WAVE刻みで保存)</span>
                </div>

                <div style="display:flex; width:100%; gap:15px; align-items:center; margin-top:5px;">
                    <button onclick="window.adjustArenaWaveInput(-${skipStep})" style="padding:5px 12px; background:#333; color:#fff; border:1px solid #777; border-radius:4px; cursor:pointer; font-weight:bold;" title="${skipStep}戻る">-${skipStep}</button>
                    
                    <input type="range" id="arena-start-slider" min="1" max="${maxValid}" step="${step}" value="${maxValid}"
                        oninput="window.syncArenaWaveInput('slider')"
                        style="flex:1; cursor:pointer; accent-color: #FF9800;">
                        
                    <button onclick="window.adjustArenaWaveInput(${skipStep})" style="padding:5px 12px; background:#333; color:#fff; border:1px solid #777; border-radius:4px; cursor:pointer; font-weight:bold;" title="${skipStep}進む">+${skipStep}</button>
                </div>

                <div style="display:flex; gap:10px; align-items:center; margin-top:5px;">
                    <span style="color:#fff; font-weight:bold; font-size:18px;">WAVE</span>
                    <input type="number" id="arena-start-wave" min="1" max="${maxValid}" step="${step}" value="${maxValid}"
                        onchange="window.syncArenaWaveInput('number')"
                        style="width:120px; padding:8px; font-size:20px; background:#222; color:#FF9800; border:2px solid #555; border-radius:6px; text-align:center; font-weight:bold;">
                    <button onclick="let el=document.getElementById('arena-start-wave'); el.value=${maxValid}; window.syncArenaWaveInput('number');" style="padding:8px 15px; background:#FF9800; color:#000; font-weight:bold; border:none; border-radius:6px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.5);">最新へ</button>
                </div>
            </div>`;
    }

    ui.innerHTML = `
        <h1 style="color:#ff5252; font-size:36px; margin-top:30px; text-shadow: 0 0 10px red;">⚔️ 隊長の闘技場クエスト ⚔️</h1>
        <p style="font-size:14px; color:#ccc; margin-bottom:10px;">隊長「準備と作戦を整えろ。出陣するなら、ここで編成を決めるんだ。」</p>
        
        <div style="margin-bottom:20px; background:#111; padding:10px 20px; border-radius:8px; border:2px solid #555; display:flex; gap:15px; justify-content:center; align-items:center;">
            <span style="color:#FFD700; font-weight:bold;">挑戦モード:</span>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="radio" name="arenaMode" value="normal" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value; window.renderArenaReception();" ${rState.selectedMode === 'normal' ? 'checked' : ''}> 通常エンドレス</label>
            ${bossUnlocked ? `<label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#ff5252;"><input type="radio" name="arenaMode" value="boss" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value; window.renderArenaReception();" ${rState.selectedMode === 'boss' ? 'checked' : ''}> ボスラッシュ</label><label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#4fc3f7;"><input type="radio" name="arenaMode" value="friend" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value; window.renderArenaReception();" ${rState.selectedMode === 'friend' ? 'checked' : ''}> フレンド(幻影)バトル</label>` : `<span style="color:#666; font-size:12px;">(通常WAVE 50突破で解放)</span>`}
        </div>

        ${startWaveHtml}

        <div style="display:flex; width:95%; max-width:1000px; gap:20px; margin-bottom:30px;">
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555;"><div style="font-size:18px; color:#4fc3f7; margin-bottom:15px; font-weight:bold; text-align:center;">▼ 出撃パーティ (最大4人)</div><div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">${partyHtml}</div></div>
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555; max-height: 300px; overflow-y:auto;"><div style="font-size:18px; color:#FFC107; margin-bottom:15px; font-weight:bold; text-align:center;">▼ 図鑑の仲間たち</div><div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">${availableHtml}</div></div>
        </div>
        <div style="display:flex; gap:20px;">
            <button onclick="window.commitArenaBattle()" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#b71c1c; color:white; border:3px solid #ff5252; border-radius:8px; cursor:pointer; box-shadow: 0 0 15px rgba(255,0,0,0.5);">出陣する</button>
            <button onclick="document.getElementById('arena-reception-ui').style.display='none'; window.cancelArenaQuestPreparation();" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#444; color:white; border:3px solid #777; border-radius:8px; cursor:pointer;">隊長のもとへ戻る</button>
        </div>
    `;
    ui.style.display = 'flex';
};

// コピー・貼り付け用のグローバル変数
window.CLIPBOARD_TACTIC_RULE = null;

window.openTacticEditor = function() {
    let ui = document.getElementById('tactic-editor-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'tactic-editor-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 55000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto; padding:40px; box-sizing:border-box;`;
        document.body.appendChild(ui);
    }
    // ★バグ修正：2回目以降も確実に表示させる！
    ui.style.display = 'flex';
    
    window.EDITOR_TACTIC_TYPE = 'default';
    window.EDITOR_TACTIC_INDEX = 0;
    window.renderTacticEditor();
};

// ★作戦コピー関数（prompt・alert排除版。直接コピー先を指定する）
window.copyTacticToCustom = function(defaultIdx, destIdx) {
    let learnedWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let src = window.getDefaultTactics(learnedWords)[defaultIdx];
    window.aiPet.tactics[destIdx].rules = JSON.parse(JSON.stringify(src.rules));
    window.EDITOR_TACTIC_TYPE = 'custom';
    window.EDITOR_TACTIC_INDEX = destIdx;
    window.renderTacticEditor();
    window.showTacticMsg(`「${src.name}」を「${window.aiPet.tactics[destIdx].name}」にコピーしました！`);
};

// パレット・サジェストの外側をクリックした時に閉じる処理
if (!window._tacticSuggestListenerAdded) {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tactic-action-input-wrapper')) {
            document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
        }
    });
    window._tacticSuggestListenerAdded = true;
}

// ★追加：カテゴリ別パレットの表示関数
window.showTacticPalette = function(inputElem, rIdx, tType, tIdx) {
    document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
    let suggestBox = document.getElementById(`suggest-box-${rIdx}`);
    if (!suggestBox) return;

    // ★修正：「たたかう」の重複を防ぐための Set 化
    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    if (inputElem.value.trim() === "" || inputElem.value.trim() === inputElem.defaultValue) {
        let categories = {
            "⚔️ 攻撃": ["attack", "heavy", "magic", "heavy_magic", "magic_all", "attack_special", "attack_pierce", "throw", "trap"],
            "💚 回復": ["heal", "heal_all", "eat", "sleep", "heal_party", "full_heal_party", "regen_party", "cure_party"],
            "🛡️ 補助": ["defend", "buff", "buff_next_atk", "buff_speed", "buff_party", "buff_atk", "buff_def", "shield", "dodge"],
            "✨ デバフ・妨害": ["debuff_def", "debuff_all", "debuff_speed", "magic_poison", "blind", "provoke"],
            "👥 陣形・召喚": ["move", "stance", "escape", "summon", "call_rescue", "random_build", "build_hut", "build_bridge", "build_farm"],
            "🔧 特殊・その他": ["equip", "unequip", "use_item", "gold_earn", "reflect", "fishing", "explore", "roulette", "draw_card", "buy_mercenary"]
        };

        let html = '';
        for (let cat in categories) {
            let wordsInCat = learnedWords.filter(w => {
                let skill = window.ARENA_SKILLS[w];
                if (!skill) return false;
                return categories[cat].includes(skill.type) || (cat === "🔧 特殊・その他" && !Object.values(categories).flat().includes(skill.type));
            });
            
            if (wordsInCat.length > 0) {
                html += `<div style="font-weight:bold; color:#FFC107; padding:8px 5px; background:#333; border-bottom:1px solid #555; position:sticky; top:0;">${cat}</div>`;
                wordsInCat.forEach(w => {
                    let skill = window.ARENA_SKILLS[w];
                    html += `<div onclick="window.aiPet.tactics[${tIdx}].rules[${rIdx}].action = '${w}'; window.renderTacticEditor();" style="padding:10px 8px; cursor:pointer; border-bottom:1px solid #444; background:#222; font-size:12px;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='#222'">
                        <span style="color:#FFF; font-weight:bold; font-size:14px;">${w}</span> <span style="color:#4fc3f7; font-weight:bold;">(MP:${skill.cost})</span><br>
                        <span style="color:#aaa; font-size:11px;">${skill.desc}</span>
                    </div>`;
                });
            }
        }
        if(html === '') html = `<div style="padding:10px; color:#aaa;">使用できる言葉がありません</div>`;
        suggestBox.innerHTML = html;
        suggestBox.style.display = 'block';
    } else {
        window.updateTacticSuggest(inputElem, rIdx, tType, tIdx);
    }
};

// サジェスト（検索）更新用関数
window.updateTacticSuggest = function(inputElem, rIdx, tType, tIdx) {
    let val = inputElem.value.trim();
    let suggestBox = document.getElementById(`suggest-box-${rIdx}`);
    if (!suggestBox) return;

    if (val.length === 0) {
        window.showTacticPalette(inputElem, rIdx, tType, tIdx);
        return;
    }
    
    // ★修正：「たたかう」の重複を防ぐ
    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));
    
    let matches = learnedWords.filter(w => w.includes(val));
    
    if (matches.length > 0) {
        suggestBox.innerHTML = matches.map(w => {
            let skill = window.ARENA_SKILLS[w];
            let desc = skill ? `<span style="font-size:10px; color:#aaa; margin-left:10px;">${skill.desc} (MP:${skill.cost})</span>` : '';
            return `<div onclick="window.aiPet.tactics[${tIdx}].rules[${rIdx}].action = '${w}'; window.renderTacticEditor();" style="padding:8px; cursor:pointer; border-bottom:1px solid #444; background:#222;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='#222'">${w}${desc}</div>`;
        }).join('');
        suggestBox.style.display = 'block';
    } else {
        suggestBox.style.display = 'none';
    }
};

// ★新規追加：直接入力された言葉が「習得済み」かをチェックして保存する関数
window.saveTacticActionIfValid = function(inputElem, rIdx, tIdx, originalValue) {
    let val = inputElem.value.trim();
    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    // 習得済みリストに含まれているかチェック
    if (learnedWords.includes(val)) {
        window.aiPet.tactics[tIdx].rules[rIdx].action = val;
        window.renderTacticEditor();
    } else {
        // 未知の言葉ならエラーを出して元の値に戻す
        window.showTacticMsg(`「${val}」はまだ習得していないため設定できません！`, '#FF5252');
        inputElem.value = originalValue; // 元の有効な値に戻す
        window.aiPet.tactics[tIdx].rules[rIdx].action = originalValue;
    }
};

window.renderTacticEditor = function() {
    let ui = document.getElementById('tactic-editor-ui'); if (!ui) return;
    let tType = window.EDITOR_TACTIC_TYPE;
    let idx = window.EDITOR_TACTIC_INDEX;
    
    // ★修正：「たたかう」の重複を防ぐ
    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));
    
    let defTactics = window.getDefaultTactics(learnedWords);
    let currentTactic = tType === 'default' ? defTactics[idx] : window.aiPet.tactics[idx];
    let isReadOnly = (tType === 'default');

    let defTabs = defTactics.map((t, i) => `<div onclick="window.EDITOR_TACTIC_TYPE='default'; window.EDITOR_TACTIC_INDEX=${i}; window.renderTacticEditor();" style="padding:10px 15px; background:${tType==='default'&&i===idx ? '#4CAF50' : '#2E7D32'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[基本] ${t.name}</div>`).join('');
    let cusTabs = window.aiPet.tactics.map((t, i) => `<div onclick="window.EDITOR_TACTIC_TYPE='custom'; window.EDITOR_TACTIC_INDEX=${i}; window.renderTacticEditor();" style="padding:10px 15px; background:${tType==='custom'&&i===idx ? '#2196F3' : '#1565C0'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[マイ] ${t.name}</div>`).join('');

    let rulesHtml = currentTactic.rules.map((rule, rIdx) => {
        let condOptions = Object.keys(window.TACTIC_CONDITIONS).map(k => `<option value="${k}" ${rule.condition === k ? 'selected' : ''}>${window.TACTIC_CONDITIONS[k]}</option>`).join('');
        let skillInfo = window.ARENA_SKILLS[rule.action];
        let descHtml = skillInfo ? `<div style="font-size:11px; color:#4fc3f7; margin-top:5px; width:100%;">💡 効果: ${skillInfo.desc} (MP:${skillInfo.cost})</div>` : `<div style="font-size:11px; color:#f44336; margin-top:5px;">⚠️ 未知の言葉（効果なし）</div>`;

        let controlBtns = `
            <div style="display:flex; flex-direction:column; gap:2px;">
                <button ${rIdx===0 ? 'disabled style="opacity:0.3"' : `onclick="let r=window.aiPet.tactics[${idx}].rules; let tmp=r[${rIdx}]; r[${rIdx}]=r[${rIdx}-1]; r[${rIdx}-1]=tmp; window.renderTacticEditor();"`} style="background:#555; color:#fff; border:none; padding:2px 8px; cursor:pointer;">▲</button>
                <button ${rIdx===currentTactic.rules.length-1 ? 'disabled style="opacity:0.3"' : `onclick="let r=window.aiPet.tactics[${idx}].rules; let tmp=r[${rIdx}]; r[${rIdx}]=r[${rIdx}+1]; r[${rIdx}+1]=tmp; window.renderTacticEditor();"`} style="background:#555; color:#fff; border:none; padding:2px 8px; cursor:pointer;">▼</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px; margin-left:5px;">
                <button onclick="window.CLIPBOARD_TACTIC_RULE = JSON.parse(JSON.stringify(window.aiPet.tactics[${idx}].rules[${rIdx}])); window.showTacticMsg('ルールをコピーしました', '#2196F3');" style="background:#2196F3; color:#fff; border:none; font-size:10px; padding:2px 5px; cursor:pointer;">コピー</button>
                <button onclick="window.CLIPBOARD_TACTIC_RULE = JSON.parse(JSON.stringify(window.aiPet.tactics[${idx}].rules[${rIdx}])); window.aiPet.tactics[${idx}].rules.splice(${rIdx},1); window.showTacticMsg('ルールを切り取りました', '#FF9800'); window.renderTacticEditor();" style="background:#FF9800; color:#fff; border:none; font-size:10px; padding:2px 5px; cursor:pointer;">切取</button>
                <button onclick="if(window.CLIPBOARD_TACTIC_RULE){ window.aiPet.tactics[${idx}].rules.splice(${rIdx+1}, 0, JSON.parse(JSON.stringify(window.CLIPBOARD_TACTIC_RULE))); window.renderTacticEditor(); }" style="background:#4CAF50; color:#fff; border:none; font-size:10px; padding:2px 5px; cursor:pointer;">貼付(下)</button>
            </div>
            <button onclick="window.aiPet.tactics[${idx}].rules.splice(${rIdx}, 1); window.renderTacticEditor();" style="background:#f44336; color:white; border:none; border-radius:4px; padding:5px 10px; margin-left:10px; cursor:pointer;">削除</button>
        `;

        return `
            <div style="display:flex; flex-direction:column; background:#222; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #444;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="font-weight:bold; color:#FF9800; width:60px;">優先度 ${rIdx + 1}</div>
                    <div style="color:#aaa;">もし</div>
                    <select ${isReadOnly ? 'disabled' : ''} onchange="window.aiPet.tactics[${idx}].rules[${rIdx}].condition = this.value;" style="padding:5px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; flex:2;">${condOptions}</select>
                    <div style="color:#aaa;">なら</div>
                    
                    <div class="tactic-action-input-wrapper" style="position:relative; flex:1;">
                        <input type="text" ${isReadOnly ? 'disabled' : ''} value="${rule.action}" 
                            onclick="window.showTacticPalette(this, ${rIdx}, '${tType}', ${idx})"
                            oninput="window.updateTacticSuggest(this, ${rIdx}, '${tType}', ${idx})" 
                            onchange="window.saveTacticActionIfValid(this, ${rIdx}, ${idx}, '${rule.action}')"
                            placeholder="言葉を検索" style="padding:5px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; width:100%; box-sizing:border-box;">
                        <div id="suggest-box-${rIdx}" class="tactic-suggest-box" style="display:none; position:absolute; top:100%; left:0; width:320px; max-height:300px; overflow-y:auto; background:#111; border:1px solid #555; z-index:100; box-shadow:0 4px 10px rgba(0,0,0,0.8);"></div>
                    </div>
                    ${!isReadOnly ? controlBtns : ''}
                </div>
                ${descHtml}
            </div>
        `;
    }).join('');

    if (rulesHtml === '') rulesHtml = `<div style="text-align:center; color:#888; padding:20px;">ルールが設定されていません。</div>`;

    ui.innerHTML = `
        <h2 style="color:#4fc3f7; margin-bottom:10px;">⚙️ AIマインド エディタ</h2>
        <div id="tactic-editor-msg" style="height:20px; margin-bottom:10px; transition:opacity 0.3s; opacity:0; font-weight:bold; text-align:center;"></div>
        
        <div style="display:flex; justify-content:center; width:100%; max-width:900px;">
            <div style="display:flex; margin-right:20px; border-bottom:2px solid #4CAF50;">${defTabs}</div>
            <div style="display:flex; border-bottom:2px solid #2196F3;">${cusTabs}</div>
        </div>
        <div style="background:#111; padding:20px; width:100%; max-width:900px; border-radius:0 0 8px 8px; border:2px solid ${tType==='default' ? '#4CAF50' : '#2196F3'}; border-top:none; box-sizing:border-box;">
            <div style="margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-weight:bold; color:${isReadOnly ? '#aaa' : '#fff'};">作戦名:</span>
                    <input type="text" value="${currentTactic.name}" ${isReadOnly ? 'disabled' : ''} onchange="window.aiPet.tactics[${idx}].name = this.value;" style="padding:5px; background:#222; color:#fff; border:1px solid #555; border-radius:4px; width:200px;">
                </div>
                ${isReadOnly ? `
                    <div style="display:flex; gap:5px; align-items:center;">
                        <span style="color:#aaa; font-size:12px;">コピー先:</span>
                        <button onclick="window.copyTacticToCustom(${idx}, 0)" style="background:#FF9800; color:#000; border:none; font-weight:bold; border-radius:4px; padding:6px 10px; cursor:pointer;">マイ1</button>
                        <button onclick="window.copyTacticToCustom(${idx}, 1)" style="background:#FF9800; color:#000; border:none; font-weight:bold; border-radius:4px; padding:6px 10px; cursor:pointer;">マイ2</button>
                        <button onclick="window.copyTacticToCustom(${idx}, 2)" style="background:#FF9800; color:#000; border:none; font-weight:bold; border-radius:4px; padding:6px 10px; cursor:pointer;">マイ3</button>
                    </div>
                ` : ''}
            </div>
            
            ${!isReadOnly ? `
                <div style="margin-bottom:20px; padding:10px; background:#1a1a1a; border:1px dashed #555; border-radius:8px;">
                    <div style="font-size:12px; color:#FFC107; margin-bottom:5px; font-weight:bold;">✨ おまかせ構築（現在の記憶から自動編成）</div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.autoSetTactic('tank', ${idx})" style="flex:1; padding:8px; background:#5D4037; color:#fff; border:1px solid #8D6E63; border-radius:4px; cursor:pointer;">🛡️ 盾特化</button>
                        <button onclick="window.autoSetTactic('attacker', ${idx})" style="flex:1; padding:8px; background:#B71C1C; color:#fff; border:1px solid #E53935; border-radius:4px; cursor:pointer;">⚔️ 攻撃特化</button>
                        <button onclick="window.autoSetTactic('healer', ${idx})" style="flex:1; padding:8px; background:#1B5E20; color:#fff; border:1px solid #43A047; border-radius:4px; cursor:pointer;">💚 回復特化</button>
                        <button onclick="window.autoSetTactic('support', ${idx})" style="flex:1; padding:8px; background:#01579B; color:#fff; border:1px solid #1E88E5; border-radius:4px; cursor:pointer;">🪽 補助特化</button>
                    </div>
                </div>
            ` : ''}

            <div style="margin-bottom:20px;">
                <p style="color:#aaa; font-size:12px; margin-bottom:10px;">※上にあるルールほど優先されます。<br>※入力欄をクリックすると、カテゴリ分けされた習得スキル一覧が表示されます。</p>
                ${rulesHtml}
                ${!isReadOnly ? `<button onclick="window.aiPet.tactics[${idx}].rules.push({condition:'always', action: 'たたかう'}); window.renderTacticEditor();" style="background:#4CAF50; color:white; border:none; border-radius:4px; padding:10px; cursor:pointer; width:100%; font-weight:bold; margin-top:10px;">＋ 新しいルールを追加する</button>` : ''}
            </div>
        </div>
        <button onclick="document.getElementById('tactic-editor-ui').style.display='none'; window.renderArenaReception();" style="margin-top:30px; padding:15px 40px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #777; border-radius:8px; cursor:pointer;">閉じる</button>
    `;
};

// ==========================================
// ★ 追加：AIマインド＆チャット機能（送信処理）
// ==========================================

window.sendArenaChat = function() {
    let input = document.getElementById('arena-chat-input');
    if (!input || !input.value.trim()) return;
    let text = input.value.trim();
    
    if (!window.arenaChatHistory) window.arenaChatHistory = [];
    if (window.arenaChatHistory[window.arenaChatHistory.length - 1] !== text) window.arenaChatHistory.push(text);
    window.arenaChatHistoryIndex = window.arenaChatHistory.length;
    input.value = "";

    window.ARENA_STATE.log.push(`<span style="color:#00BCD4; font-weight:bold;">🗣️ Player「${text}」</span>`);
    
    let p = window.ARENA_STATE.party.find(pt => pt.isMe);
    if (!p) { window.renderArenaBattle(); return; }

    let matchedType = null; let matchedIdx = -1; let matchedName = "";
    
    for (let i = 0; i < window.aiPet.tactics.length; i++) {
        if (text.includes(window.aiPet.tactics[i].name)) { matchedType = 'custom'; matchedIdx = i; matchedName = window.aiPet.tactics[i].name; break; }
    }
    if (!matchedType) {
        let defTactics = window.getDefaultTactics(p.words);
        for (let i = 0; i < defTactics.length; i++) {
            if (text.includes(defTactics[i].name)) { matchedType = 'default'; matchedIdx = i; matchedName = defTactics[i].name; break; }
        }
    }

    if (matchedType) {
        let cmdChance = Math.min(0.9, (p.intel || 10) / 100 + 0.3); 
        if (Math.random() < cmdChance) {
            p.tacticType = matchedType;
            p.tacticIndex = matchedIdx;
            window.ARENA_STATE.log.push(`<span style="color:#4CAF50; font-weight:bold;">💡 ${p.name} は指示に頷き、作戦を【${matchedName}】に切り替えた！</span>`);
        } else {
            window.ARENA_STATE.log.push(`<span style="color:#888;">💦 しかし ${p.name} は指示を聞き流した...</span>`);
        }
    } else {
        window.ARENA_STATE.log.push(`<span style="color:#aaa;">（指示された作戦名が見つからないようだ...）</span>`);
    }
    window.renderArenaBattle();
};

window.handleArenaChatKey = function(e) {
    if (!window.arenaChatHistory) return;
    let input = document.getElementById('arena-chat-input');
    if (e.key === 'Enter') window.sendArenaChat();
    else if (e.key === 'ArrowUp') {
        if (window.arenaChatHistoryIndex > 0) { window.arenaChatHistoryIndex--; input.value = window.arenaChatHistory[window.arenaChatHistoryIndex]; }
    } else if (e.key === 'ArrowDown') {
        if (window.arenaChatHistoryIndex < window.arenaChatHistory.length - 1) { window.arenaChatHistoryIndex++; input.value = window.arenaChatHistory[window.arenaChatHistoryIndex]; } 
        else { window.arenaChatHistoryIndex = window.arenaChatHistory.length; input.value = ""; }
    }
};

window.commitArenaBattle = function() {
    window.ARENA_STATE.party = JSON.parse(JSON.stringify(window.ARENA_RECEPTION_STATE.party)); 
    window.ARENA_STATE.mode = window.ARENA_RECEPTION_STATE.selectedMode || 'normal';
    
    let bQueue = [];
    const shuffle = (arr) => { let a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    // ★修正：ボスラッシュの場合は「通常エンドレスで倒したことのあるボス」のみ出現させる！
    if (window.ARENA_STATE.mode === 'boss') {
        let defeated = window.aiPet.defeatedArenaBosses || [];
        if (defeated.length === 0) defeated = ['robot']; // 万が一のセーフティ
        bQueue = shuffle(defeated);
    } 
    // 通常エンドレスの場合は、進化ツリーを解析して段階的に出現させる
    else {
        let dTypes = window.aiPet.discoveredMonsters || [];
        let tier0 = ["robot", "ghost", "balloon", "stone", "machine", "bird", "dragon", "seed", "magician", "spirit", "beetle"];
        let tier1 = []; let tier2 = [];

        // 進化ツリーから正確に1進化、2進化のリストを作成
        if (typeof evolutionRequirements !== 'undefined') {
            tier0.forEach(base => {
                if (evolutionRequirements[base]) {
                    evolutionRequirements[base].forEach(evo => {
                        tier1.push(evo.next);
                        if (evolutionRequirements[evo.next]) {
                            evolutionRequirements[evo.next].forEach(evo2 => tier2.push(evo2.next));
                        }
                    });
                }
            });
        }

        let myBases = dTypes.filter(t => tier0.includes(t));
        let myEvo1 = dTypes.filter(t => tier1.includes(t));
        let myEvo2 = dTypes.filter(t => tier2.includes(t));

        bQueue = shuffle(myBases);
        // 基本種が全種(11種)揃ったら1進化を開放
        if (myBases.length >= tier0.length && myEvo1.length > 0) {
            bQueue = bQueue.concat(shuffle(myEvo1));
            // 1進化が全種解放されたら2進化を開放
            if (myEvo1.length >= tier1.length && myEvo2.length > 0) {
                bQueue = bQueue.concat(shuffle(myEvo2));
            }
        }

        if (bQueue.length === 0) bQueue = ['robot']; 
    }

    window.ARENA_STATE.bossQueue = bQueue;
    window.ARENA_STATE.bossesDefeated = 0;
    
    if (window.ARENA_STATE.mode === 'friend') {
        window.openFriendSelectionUI();
    } else {
        window.startArenaBattle();
    }
};

// ★修正：非同期(async)にして、開いた瞬間に最新のデータを取ってくるように変更
window.openFriendSelectionUI = async function() {
    let ui = document.getElementById('arena-friend-select-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-friend-select-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 55000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto;`;
        document.body.appendChild(ui);
    }
    
    // データ取得中のローディング表示
    ui.innerHTML = `
        <h2 style="color:#4fc3f7; font-size:32px; margin-top:40px;">👥 対戦相手の選択</h2>
        <div style="flex:1; display:flex; justify-content:center; align-items:center; color:#aaa; font-size:24px;">📡 対戦相手のデータを探しています...</div>
    `;
    ui.style.display = 'flex';

    // ★追加：ランキングデータを最新で取得する
    if (typeof window.fetchArenaRanking === 'function') {
        window.arenaRankDataCache = await window.fetchArenaRanking();
    }

    let listHtml = '';
    // ランキングデータから相手のリストを生成
    if (window.arenaRankDataCache && window.arenaRankDataCache.length > 0) {
        window.arenaRankDataCache.forEach((data, idx) => {
            // ★追加：自分のデータかどうかを判定
            let isMe = (data.playerId === localStorage.getItem('my_player_id'));
            let pName = data.playerName || "名無しプレイヤー";
            if (isMe) pName = `✨ ${pName} (あなた)`;
            
            let wave = data.wave || 1;
            let pStr = (data.party || []).map(p => p.name).join(', ');
            
            // ★追加：自分の場合は枠線や色をオレンジにして分かりやすくする
            listHtml += `
                <div onclick="window.startFriendBattle(${idx})" style="background:${isMe ? 'rgba(255, 152, 0, 0.1)' : '#222'}; border:2px solid ${isMe ? '#FF9800' : '#4fc3f7'}; border-radius:8px; padding:15px; margin-bottom:10px; width:80%; max-width:600px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='${isMe ? 'rgba(255, 152, 0, 0.2)' : '#333'}'" onmouseout="this.style.background='${isMe ? 'rgba(255, 152, 0, 0.1)' : '#222'}'">
                    <div style="font-size:18px; font-weight:bold; color:${isMe ? '#FF9800' : '#4fc3f7'}; margin-bottom:5px;">${pName} <span style="color:#FFD700; font-size:14px; margin-left:10px;">到達WAVE: ${wave}</span></div>
                    <div style="font-size:12px; color:#aaa;">編成: ${pStr}</div>
                </div>
            `;
        });
    } else {
        listHtml = `<div style="color:#888; margin-top:20px;">対戦可能な相手が見つかりません。通信環境を確認してください。</div>`;
    }

    // デフォルト（運営側）の強敵も一つ混ぜておく
    listHtml += `
        <div onclick="window.startFriendBattle('default')" style="background:#311b92; border:2px solid #ff5252; border-radius:8px; padding:15px; margin-top:20px; margin-bottom:10px; width:80%; max-width:600px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#4a148c'" onmouseout="this.style.background='#311b92'">
            <div style="font-size:18px; font-weight:bold; color:#ff5252; margin-bottom:5px;">闘技場の覇者（テスト用AI）</div>
            <div style="font-size:12px; color:#aaa;">編成: 幻影の戦士, 幻影の魔道士, 幻影の守護者, 幻影の癒し手</div>
        </div>
    `;

    ui.innerHTML = `
        <h2 style="color:#4fc3f7; font-size:32px; margin-top:40px;">👥 対戦相手の選択</h2>
        <p style="color:#ccc; margin-bottom:30px;">※フレンドバトルは1戦のみで終了し、勝敗にかかわらず寿命は減りません。</p>
        <div style="flex:1; width:100%; display:flex; flex-direction:column; align-items:center; overflow-y:auto;">
            ${listHtml}
        </div>
        <button onclick="document.getElementById('arena-friend-select-ui').style.display='none'" style="padding:15px 40px; margin: 30px; font-size:20px; font-weight:bold; background:#444; color:white; border:3px solid #777; border-radius:8px; cursor:pointer;">戻る</button>
    `;
};

window.startFriendBattle = function(targetIndex) {
    document.getElementById('arena-friend-select-ui').style.display = 'none';
    window.ARENA_STATE.selectedFriendIndex = targetIndex;

    // ★追加：難易度選択のモーダルUI
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
    
    overlay.innerHTML = `
        <div style="background:#222; border:2px solid #4fc3f7; border-radius:12px; padding:30px; width:400px; color:#fff; font-family:sans-serif; text-align:center;">
            <h2 style="color:#4fc3f7; margin-top:0;">難易度の選択</h2>
            <p style="font-size:14px; color:#aaa; margin-bottom:20px; line-height:1.5;">
                フレンドの幻影が使用する「言葉の凶悪さ」と「思考力」を選びます。<br>
                ※フレンドバトルは完全ノーリスク・ノーリターン（報酬0G）です。
            </p>
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                <button onclick="window.commitFriendBattle('easy')" style="padding:12px; font-size:16px; font-weight:bold; background:#4CAF50; color:#fff; border:none; border-radius:6px; cursor:pointer;">🌱 やさしい (基本攻撃/回復のみ)</button>
                <button onclick="window.commitFriendBattle('normal')" style="padding:12px; font-size:16px; font-weight:bold; background:#FF9800; color:#000; border:none; border-radius:6px; cursor:pointer;">🌿 ふつう (デバフ/陣形を解禁)</button>
                <button onclick="window.commitFriendBattle('hard')" style="padding:12px; font-size:16px; font-weight:bold; background:#F44336; color:#fff; border:none; border-radius:6px; cursor:pointer;">🔥 つよい (大技/全体魔法を解禁)</button>
                <button onclick="window.commitFriendBattle('lunatic')" style="padding:12px; font-size:16px; font-weight:bold; background:#9C27B0; color:#fff; border:none; border-radius:6px; cursor:pointer;">💀 鬼畜 (ハメ技/絶対回避を的確に使用)</button>
            </div>
            <button onclick="this.parentElement.parentElement.remove(); window.openFriendSelectionUI();" style="padding:10px 20px; background:#444; color:#fff; border:none; border-radius:6px; cursor:pointer;">戻る</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // モーダル内で呼ばれる最終出陣処理
    window.commitFriendBattle = function(difficulty) {
        overlay.remove();
        window.ARENA_STATE.friendDifficulty = difficulty;
        window.startArenaBattle();
    };
};

window.addArenaPartyMember = function(index) {
    if (window.ARENA_RECEPTION_STATE.party.length >= 4) { alert("パーティは最大4人までです！"); return; }
    window.ARENA_RECEPTION_STATE.party.push(window.ARENA_RECEPTION_STATE.available.splice(index, 1)[0]);
    window.renderArenaReception();
};
window.removeArenaPartyMember = function(index) {
    let member = window.ARENA_RECEPTION_STATE.party[index]; if (member.isMe) return; 
    window.ARENA_RECEPTION_STATE.party.splice(index, 1); window.ARENA_RECEPTION_STATE.available.push(member); window.renderArenaReception();
};


// ==========================================
// 2. バトル開始演出＆画面構築
// ==========================================
window.startArenaBattle = function() {
    // ★修正1：この段階ではまだ「受付UI」を消さない！

    let startWave = 1;
    let waveInput = document.getElementById('arena-start-wave');
    if (waveInput && window.ARENA_STATE.mode !== 'friend') {
        startWave = parseInt(waveInput.value) || 1;
        let currentHighest = window.ARENA_STATE.mode === 'boss' ? (window.aiPet.arenaBossHighestWave || 1) : (window.aiPet.arenaHighestWave || 1);
        if (startWave > currentHighest) startWave = currentHighest;
        if (startWave < 1) startWave = 1;
    }
    if (window.currentArenaWave) {
        startWave = window.currentArenaWave;
        window.currentArenaWave = null;
    }
    window.ARENA_STATE.wave = startWave; 
    window.ARENA_STATE.bossesDefeated = Math.floor((startWave - 1) / 50);
    
    window.ARENA_STATE.healPots = 3; window.ARENA_STATE.active = true; window.ARENA_STATE.autoMode = false; window.ARENA_STATE.isProcessing = false;
    window.ARENA_STATE.runScore = 0;
    window.ARENA_STATE.comboCount = 0;
    window.ARENA_STATE.startWave = startWave; 

    let darkUI = document.createElement('div');
    // ★修正2：z-indexを60000に上げ、他の操作を受け付けないようにpointer-events:auto;を追加
    darkUI.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index: 60000; display:flex; justify-content:center; align-items:center; color:#ff5252; font-size:36px; font-weight:bold; opacity:0; transition: opacity 1s; pointer-events:auto;`;
    darkUI.innerText = "血湧き肉躍る狂宴の幕開けだ……！"; 
    document.body.appendChild(darkUI);

    // ① 暗転（フェードイン）開始
    setTimeout(() => { darkUI.style.opacity = 1; }, 50);

    // ② 画面が「完全に真っ暗になった」タイミング（約1秒後）で、裏のUIを切り替える
    setTimeout(() => {
        let receptionUi = document.getElementById('arena-reception-ui');
        if (receptionUi) receptionUi.style.display = 'none'; // ここで初めて受付を隠す
        window.initArenaBattleField(); // 真っ暗な裏で戦闘画面を準備して表示させておく
    }, 1100);

    // ③ テキストを見せた後、暗転を解除（フェードアウト）して完成した戦闘画面を露出させる
    setTimeout(() => { 
        darkUI.style.opacity = 0; 
        setTimeout(() => { 
            darkUI.remove(); 
        }, 1000); 
    }, 3000);
};

window.initArenaBattleField = function() {
    let ui = document.getElementById('arena-battle-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-battle-ui';
        ui.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:url('battle_field.png') no-repeat center center; background-size:cover; z-index: 51000; display:flex; flex-direction:column; transition: box-shadow 0.1s, transform 0.1s;`;
        document.body.appendChild(ui);
    }
    ui.style.display = 'flex';
    window.startArenaWave();
};

window.startArenaWave = function() {
    let state = window.ARENA_STATE;
    let modeText = state.mode === 'boss' ? "[ボスラッシュ]" : (state.mode === 'friend' ? "[フレンドバトル]" : "");
    state.log = [`${modeText}【第 ${state.wave} 戦】 が始まった！`];
    state.autoMode = false;
    state.guests = [];
    state.farmTimer = 0;
    state.globalTick = 0; // ★追加：ATB用の全体時間カウント

    state.party.forEach((p, idx) => {
        p.row = 'front'; p.col = idx;
        p.buffAtk = 1.0; p.buffIntel = 1.0; p.isEquipped = false;
        p.isSleeping = false; p.shield = false; p.exploreTimer = 0; p.hutHp = 0;
        p.actionGauge = 0; // ★追加：初期ゲージは0

        // WAVE開始時に、受付時の「本来のステータス」を復元する
        let origP = window.ARENA_RECEPTION_STATE.party.find(rp => rp.id === p.id);
        if (origP) {
            p.atk = origP.atk; p.def = origP.def; p.intel = origP.intel; p.speed = origP.speed || p.speed;
            p.maxHp = origP.maxHp; p.maxMp = origP.maxMp;
        }
    });

    state.enemies = [];
    state.enemySpawnCounts = {}; 

    let discoveredTypes = (window.aiPet.discoveredMonsters || []).map(k => k.split('_')[0]);
    let enemyKeys = Object.keys(window.ARENA_ENEMIES).filter(k => discoveredTypes.includes(window.ARENA_ENEMIES[k].type));
    if (enemyKeys.length === 0) enemyKeys = ['robot']; 

    let isBossWave = (state.mode === 'boss') || (state.mode === 'normal' && state.wave > 0 && state.wave % 50 === 0);

    let calcWave = state.mode === 'boss' ? state.wave * 50 : state.wave; 
    let waveMinus = calcWave - 1;
    
    let hpMultiplier = 1 + (waveMinus * 0.3) + (Math.pow(1.04, waveMinus) - 1);
    let atkMultiplier = 1 + (waveMinus * 0.2) + (Math.pow(1.03, waveMinus) - 1);
    let defMultiplier = 1 + (waveMinus * 0.1) + (Math.pow(1.02, waveMinus) - 1);
    let spdMultiplier = 1 + (waveMinus * 0.05);

    if (isBossWave) {
        let bossType = state.bossQueue[state.bossesDefeated] || state.bossQueue[state.bossQueue.length - 1];
        let rKey = Object.keys(window.ARENA_ENEMIES).find(k => window.ARENA_ENEMIES[k].type === bossType);
        if (!rKey) rKey = Object.keys(window.ARENA_ENEMIES).find(k => window.ARENA_ENEMIES[k].type === bossType.split('_')[0]) || 'robot';
        
        let base = window.ARENA_ENEMIES[rKey];
        // ★HPは10万でカンストさせる
        let eHp = Math.min(100000, Math.floor(base.hp * hpMultiplier * 3 + 2000));
        let eAtk = Math.floor(base.atk * atkMultiplier * 1.5 + 50);
        let eDef = Math.floor(base.def * defMultiplier * 2);
        let eSpd = Math.floor(base.speed * spdMultiplier * 1.5);

        let finalBossName = base.bossName ? base.bossName : `【BOSS】巨魁なる${base.name}`;

        state.enemies.push({
            id: `e_boss`, baseName: base.name, name: finalBossName, spriteKey: base.spriteKey, type: base.type,
            hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd,
            buffAtk: 1.0, buffDef: 1.0, isBoss: true, patternStep: 0,
            bossTypeKey: bossType, row: 'front',
            exploreTimer: 0, isSleeping: false, actionGauge: 0, hutHp: 0, shield: false,
            // ★追加：飛行ギミックと装甲ギミックの初期フラグ
            isFlying: (base.type.split('_')[0] === 'bird' || base.type.split('_')[0] === 'balloon'),
            armorValue: (base.type.split('_')[0] === 'machine' || base.type.split('_')[0] === 'beetle') ? 1 : 0
        });

    } else if (state.mode === 'friend') {
        let friendParty = [];
        if (state.selectedFriendIndex === 'default') {
            friendParty = [
                { name: "幻影の戦士", skin: "robot", maxHp: 500, atk: 80, def: 30, intel: 50, words: ["たたかう", "筋トレ"] },
                { name: "幻影の魔道士", skin: "magician", maxHp: 400, atk: 100, def: 20, intel: 80, words: ["ほのお", "かいふく"] },
                { name: "幻影の守護者", skin: "stone", maxHp: 800, atk: 50, def: 80, intel: 40, words: ["まもる", "睡眠"] },
                { name: "幻影の癒し手", skin: "spirit", maxHp: 450, atk: 60, def: 30, intel: 70, words: ["いのる", "たたかう"] }
            ];
        } else if (window.arenaRankDataCache && window.arenaRankDataCache[state.selectedFriendIndex]) {
            let rData = window.arenaRankDataCache[state.selectedFriendIndex];
            if (rData.party && rData.party.length > 0) friendParty = rData.party;
        }
        
        friendParty.forEach((fp, i) => {
            let aType = (fp.skin || 'robot').split('_')[0];
            let spriteKey = "arena_" + aType;
            if (!window.DUNGEON_SPRITES[spriteKey]) spriteKey = "arena_robot";
            
            let eHp = fp.maxHp || 100;
            let eAtk = fp.atk || 20;
            let eDef = fp.def || 10;
            let eSpd = fp.speed || 10;

            // ★修正：プレイヤーのニックネームではなく、本来の種族名（進化名）を取得して名付ける
            let enemyData = window.ARENA_ENEMIES[fp.skin] || window.ARENA_ENEMIES[aType];
            let properName = enemyData ? enemyData.name : "未知の幻影";

            state.enemies.push({
                id: `e_f_${i}`, baseName: properName, name: `幻影の${properName}`, spriteKey: spriteKey, type: aType, skin: fp.skin || 'robot',
                hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd,
                intel: fp.intel || 20, mp: fp.maxMp || 100, maxMp: fp.maxMp || 100, words: fp.words || ["たたかう"],
                buffAtk: 1.0, buffDef: 1.0, isFriend: true, row: i < 2 ? 'front' : 'back', col: i % 2,
                exploreTimer: 0, isSleeping: false, actionGauge: 0, hutHp: 0, shield: false,
                isFlying: (aType === 'bird' || aType === 'balloon'),
                armorValue: (aType === 'machine' || aType === 'beetle') ? 1 : 0
            });
        });

    } else {
        // ★修正2：出現数上限の緩やかな増加と、1〜上限のランダム抽選
        // 初期上限は3、以降50WAVEごとに上限が1上がる（最大8）
        let maxCap = Math.min(8, 3 + Math.floor((state.wave - 1) / 50));
        let enemyCount = Math.floor(Math.random() * maxCap) + 1;

        let tempEnemies = [];
        let nameCounts = {};
        
        // ★修正3：上位種の出現WAVE制限（自動計算）
        let totalTier1Count = 0;
        for (let k in window.ARENA_ENEMIES) {
            if (k.split('_').length === 2) totalTier1Count++; // 1進化の数を自動カウント
        }
        let tier2UnlockWave = 600 + (totalTier1Count * 50); // 2進化の解禁WAVEを自動計算

        let baseKeys = ["robot", "ghost", "balloon", "stone", "machine", "bird", "dragon", "seed", "magician", "spirit", "beetle"];
        let tier0Pool = [...baseKeys];
        let tier1Pool = [];
        let tier2Pool = [];

        // 倒したことのあるボスの中からTier1, Tier2を分類
        if (window.aiPet.defeatedArenaBosses) {
            window.aiPet.defeatedArenaBosses.forEach(bossType => {
                if (window.ARENA_ENEMIES[bossType]) {
                    let parts = bossType.split('_');
                    if (parts.length === 2) tier1Pool.push(bossType);
                    else if (parts.length >= 3) tier2Pool.push(bossType);
                }
            });
        }

        let trashPool = [...tier0Pool];
        if (state.wave >= 600) {
            trashPool = trashPool.concat(tier1Pool); // 600WAVE以降で1進化を解禁
        }
        if (state.wave >= tier2UnlockWave) {
            trashPool = trashPool.concat(tier2Pool); // 自動計算WAVE以降で2進化を解禁
        }
        if (trashPool.length === 0) trashPool = ['robot']; // セーフティ
        
        for(let i=0; i<enemyCount; i++) {
            let rKey = trashPool[Math.floor(Math.random() * trashPool.length)];
            let base = window.ARENA_ENEMIES[rKey]; 
            nameCounts[base.name] = (nameCounts[base.name] || 0) + 1;
            tempEnemies.push(base);
        }
        
        const getSuffix = (index) => String.fromCharCode(65 + (index % 26)); 
        
        for(let i=0; i<tempEnemies.length; i++) {
            let base = tempEnemies[i];
            let totalSame = nameCounts[base.name];
            
            let eHp = Math.min(100000, Math.floor(base.hp * hpMultiplier + (state.wave * 10)));
            let eAtk = Math.floor(base.atk * atkMultiplier + (state.wave * 2));
            let eDef = Math.floor(base.def * defMultiplier + (state.wave * 1));
            let eSpd = Math.floor(base.speed * spdMultiplier);

            state.enemySpawnCounts[base.name] = (state.enemySpawnCounts[base.name] || 0) + 1;
            let spawnIndex = state.enemySpawnCounts[base.name] - 1; 
            
            let finalName = base.name;
            if (totalSame > 1) finalName = `${base.name} ${getSuffix(spawnIndex)}`;

            state.enemies.push({
                id: `e_${i}`, baseName: base.name, name: finalName, spriteKey: base.spriteKey, type: base.type,
                hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd, buffAtk: 1.0, buffDef: 1.0,
                row: i < 4 ? 'front' : 'back',
                exploreTimer: 0, isSleeping: false, actionGauge: 0, hutHp: 0, shield: false,
                isFlying: (base.type.split('_')[0] === 'bird' || base.type.split('_')[0] === 'balloon'),
                armorValue: (base.type.split('_')[0] === 'machine' || base.type.split('_')[0] === 'beetle') ? 1 : 0
            });
        }
    }
    window.renderArenaBattle();
};

// ★追加：コマンドセット関数
window.setArenaCommand = function(cmd) {
    window.ARENA_STATE.currentCommand = cmd;
    window.renderArenaBattle();
};

window.renderArenaBattle = function() {
    let ui = document.getElementById('arena-battle-ui'); if (!ui) return;
    let state = window.ARENA_STATE;

    if (!document.getElementById('arena-field-area')) {
        ui.innerHTML = `
            <style>
                @keyframes arena-blink { 0% { transform: scale(1); box-shadow: 0 0 10px #FF9800; filter: brightness(1.2); } 50% { transform: scale(0.95); box-shadow: 0 0 2px #FF9800; filter: brightness(0.9); } 100% { transform: scale(1); box-shadow: 0 0 10px #FF9800; filter: brightness(1.2); } }
                .arena-ready-blink { animation: arena-blink 1s ease-in-out infinite; border-radius: 50%; }
                @keyframes dq-blink { 0% { opacity: 1; filter: drop-shadow(0 0 10px red) brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(1000%); } 20% { opacity: 0; } 40% { opacity: 1; filter: drop-shadow(0 0 10px red) brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(1000%); } 60% { opacity: 0; } 80% { opacity: 1; filter: drop-shadow(0 0 10px red) brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(1000%); } 100% { opacity: 1; filter: none; } }
                .enemy-flash { animation: dq-blink 0.4s linear; }
            </style>
            <div style="flex:1; display:flex; flex-direction:row; width:100%; overflow:hidden;">
                <div id="arena-field-area" style="flex:1; position:relative; display:flex; justify-content:center; align-items:flex-end; flex-wrap:wrap; gap:10px; padding-top:30px; padding-bottom:10px;"></div>
                <div id="arena-timeline-area" style="width:90px; flex-shrink:0; background:rgba(0,0,0,0.8); border-left:3px solid #555; padding:10px; display:flex; flex-direction:column; align-items:center; box-sizing:border-box;"></div>
            </div>
            <div style="height:250px; background:rgba(0,0,0,0.85); border-top:4px solid #FFF; display:flex; padding:10px; gap:10px; position:relative;">
                <div id="arena-log-container" style="flex:2; border:2px solid #444; border-radius:8px; padding:10px; font-size:15px; color:#FFF; line-height:1.5; overflow-y:auto; display:flex; flex-direction:column; justify-content:flex-start;"></div>
                <div id="arena-party-area" style="flex:4; display:flex; flex-direction:column; justify-content:center; gap:5px; border:1px solid #333; border-radius:8px; background:#111; padding:5px;"></div>
                
                <div id="arena-control-area" style="flex:1.8; display:flex; flex-direction:column; justify-content:flex-start; gap:3px; padding-top:5px;">
                    <div id="arena-auto-btn-area" style="display:flex; flex-direction:column; gap:3px;"></div>
                    <div style="display:flex; flex-direction:column; gap:3px; border-top:1px solid #333; padding-top:5px;">
                        <div style="font-size:10px; color:#00BCD4; font-weight:bold; text-align:center;">💬 AIへの指示チャット</div>
                        <div style="display:flex; height:28px;">
                            <input type="text" id="arena-chat-input" placeholder="作戦名を入力..." onkeydown="window.handleArenaChatKey(event)" style="flex:1; padding:0 8px; font-size:12px; background:#222; color:#fff; border:1px solid #444; border-radius:4px 0 0 4px; outline:none;">
                            <button onclick="window.sendArenaChat()" style="padding:0 10px; font-size:11px; font-weight:bold; background:#00BCD4; color:#000; border:none; border-radius:0 4px 4px 0; cursor:pointer;">送信</button>
                        </div>
                        <button onclick="window.toggleInBattleTacticViewer()" style="padding:4px; font-size:11px; font-weight:bold; background:#333; color:#FFC107; border:1px solid #FFC107; border-radius:4px; cursor:pointer;">📋 作戦リスト確認</button>
                    </div>
                </div>
            </div>
        `;
    }

    let enemyCount = state.enemies.length;
    // ★修正1：雑魚敵のサイズを、1匹の時でも最小（8匹並んだ時のサイズ）に完全固定！
    let enemyScaleRate = 0.5;

    let enemyHtmlList = state.enemies.map(e => {
        let isHidden = e.exploreTimer > 0;
        let statusIcons = "";
        if (e.buffAtk > 1.0) statusIcons += "💪"; 
        if (e.buffDef > 1.0) statusIcons += "🛡️";
        if (e.isSleeping) statusIcons += "💤"; 
        if (e.shield) statusIcons += "🧱"; 
        if (e.hutHp > 0) statusIcons += "🏠";
        if (e.isEquipped) statusIcons += "🗡️";

        let sp = (typeof window.DUNGEON_SPRITES !== 'undefined') ? window.DUNGEON_SPRITES[e.spriteKey] : null;
        let bossScale = e.isBoss ? 1.6 : 1.0; 
        let finalScale = (sp ? (sp.scale || 1) : 1) * enemyScaleRate * bossScale;
        let finalW = (sp ? sp.sw : 200) * finalScale;
        let finalH = (sp ? sp.sh : 250) * finalScale;

        // ★修正3：画像が大きすぎる場合は、画面内に収まるように動的にスケールダウンさせる
        let maxEnemyHeight = e.isBoss ? 350 : 280; // ボスは350px、雑魚は280pxを上限とする
        if (finalH > maxEnemyHeight) {
            let ratio = maxEnemyHeight / finalH;
            finalH = maxEnemyHeight;
            finalW *= ratio;
            finalScale *= ratio;
        }

        let wrapperTransform = "translateY(0) scale(1)";
        if (e.flash) wrapperTransform = "scale(0.9) rotate(-3deg)"; 
        else if (e.hp <= 0) wrapperTransform = "translateY(30px) scale(0.5)"; 

        let imgContent = sp ? `
            <div class="${e.flash ? 'enemy-flash' : ''}" style="width:${finalW}px; height:${finalH}px; margin: 0 auto; position: relative; transition: opacity 0.4s ease-in, transform 0.15s; opacity:${e.hp <= 0 && !e.flash ? '0' : '1'}; transform:${wrapperTransform};">
                <div style="position: absolute; top: 0; left: 0; width: ${sp.sw}px; height: ${sp.sh}px; background: url('${sp.img}') ${-sp.sx}px ${-sp.sy}px; transform: scale(${finalScale}); transform-origin: top left;"></div>
            </div>` 
        : `<img src="robot_battle_enemy.png" class="${e.flash ? 'enemy-flash' : ''}" style="height: ${finalH}px; transition: opacity 0.4s ease-in, transform 0.15s; opacity:${e.hp <= 0 && !e.flash ? '0' : '1'}; transform:${wrapperTransform};">`;

        let rowTag = e.row === 'back' ? `<div style="font-size:10px; color:#aaa; margin-top:2px;">[後衛]</div>` : `<div style="font-size:10px; color:#ff9800; margin-top:2px;">[前衛]</div>`;
        let scaleStyle = e.row === 'back' ? `transform: scale(0.85);` : ``; 

        // ★修正4：ネームプレートをリッチにし、画像の下部に少し被せる（ネガティブマージン margin-top:-15px）
        return `<div id="ui_enemy_${e.id}" style="text-align:center; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; margin: 5px; ${isHidden ? 'opacity:0.4;' : ''} ${scaleStyle} ${e.isActing ? 'filter: drop-shadow(0 0 15px #FFD700); transform: translateY(-10px); z-index: 10;' : ''} transition: filter 0.3s, transform 0.3s;">
            ${isHidden ? `<div style="color:#aaa; font-weight:bold; margin-bottom:50px;">(探検中...)</div>` : imgContent}
            
            <div style="background:rgba(10,5,15,0.85); border: ${e.isBoss ? '2px solid #ff5252' : '1px solid #777'}; color:white; font-weight:bold; font-size:${Math.max(11, 14 * enemyScaleRate)}px; padding:4px 8px; border-radius:6px; margin-top:-15px; z-index:5; position:relative; box-shadow:0 4px 6px rgba(0,0,0,0.5); transition: opacity 0.2s; ${e.hp <= 0 && !e.flash ? 'opacity:0;' : 'opacity:1;'}; width:110%; min-width:120px; box-sizing:border-box;">
                <div style="color:${e.isBoss ? '#ff5252' : '#fff'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.name}</div>
                <div style="font-size:12px; margin-bottom:2px; min-height:14px;">${statusIcons}</div>
                <div style="width:100%; height:5px; background:#222; border-radius:2px; overflow:hidden; border:1px solid #000;"><div style="width:${Math.min(100, e.actionGauge || 0)}%; height:100%; background:linear-gradient(90deg, #FF9800, #FFEB3B); transition:width 0.2s;"></div></div>
            </div>
            ${e.hp > 0 && !e.isBoss ? rowTag : ''}
        </div>`;
    });

    let enemiesHtml = "";
    state.enemies.forEach((e, i) => { if (e.row === 'back') enemiesHtml += enemyHtmlList[i]; }); 
    state.enemies.forEach((e, i) => { if (e.row !== 'back') enemiesHtml += enemyHtmlList[i]; }); 

    let partyAndGuests = [];
    state.party.forEach(p => partyAndGuests.push({ ...p, isParty: true }));
    state.guests.forEach((g, idx) => {
        let gName = "";
        switch (g.type) {
            case 'farming': gName = '🎃身代わりカボチャ'; break;
            case 'soldier': gName = '⚔️城の兵士'; break;
            case 'captain': gName = '🛡️城の隊長'; break;
            case 'king': gName = '👑王様'; break;
            case 'cooking': gName = '🍲料理人'; break;
            case 'smithing': gName = '🔨鍛冶師'; break;
            case 'fishing': gName = '🎣漁師'; break;
            case 'explore': gName = '🗺️冒険家'; break;
            case 'building': gName = '🧱建築士'; break;
            default: gName = '👤助っ人';
        }
        partyAndGuests.push({ id: g.id || `g_${g.type}_${idx}`, isParty: false, isGuest: true, name: gName, hp: g.hp, maxHp: g.maxHp, mp: 0, maxMp: 0, row: 'front', col: 1.5 + (idx * 0.1), typeStr: g.type, actionGauge: g.actionGauge || 0, flash: g.flash, isActing: g.isActing });
    });

    let backRowHtml = ""; let frontRowHtml = "";
    partyAndGuests.forEach(p => {
        let isHidden = p.exploreTimer > 0;
        let wordsHtml = p.isParty ? (p.words || []).map(w => `<span style="display:inline-block; background:rgba(0,188,212,0.2); color:#00BCD4; border:1px solid #00BCD4; border-radius:4px; padding:2px 4px; margin:2px 2px 0 0; font-size:10px; white-space:nowrap;">${w}</span>`).join('') : '';
        let statusIcons = "";
        if (p.isParty) {
            if (p.buffAtk > 1.0) statusIcons += "💪"; if (p.buffIntel > 1.0) statusIcons += "🧠";
            if (p.isSleeping) statusIcons += "💤"; if (p.shield) statusIcons += "🧱"; if (p.hutHp > 0) statusIcons += "🏠";
            if (p.isEquipped) statusIcons += "🗡️";
        }
        
        let borderCol = p.isParty ? '#555' : '#00BCD4'; let bgCol = "rgba(20,20,30,0.8)";
        let wrapperTransform = "translateY(0) scale(1)"; let wrapperOpacity = isHidden || (p.hp <= 0 && !p.flash) ? "0.4" : "1";
        let wrapperFilter = "none"; let wrapperZIndex = "1"; let wrapperBoxShadow = "none";

        if (p.isActing) { wrapperTransform = "translateY(-10px)"; wrapperFilter = "drop-shadow(0 0 15px #FFD700)"; wrapperBoxShadow = "0 0 20px #FFD700"; wrapperZIndex = "10"; } 
        else if (p.flash) { wrapperTransform = "scale(0.95) rotate(-2deg)"; wrapperFilter = "brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(1000%) drop-shadow(0 0 15px red)"; bgCol = "rgba(255,0,0,0.6)"; borderCol = "#ff5252"; }

        let tacticNameHtml = "";
        if (p.isParty) {
            let tName = p.tacticType === 'default' ? window.getDefaultTactics(p.words)[p.tacticIndex || 0].name : (window.aiPet.tactics[p.tacticIndex || 0] ? window.aiPet.tactics[p.tacticIndex || 0].name : "不明");
            tacticNameHtml = `<div style="font-size:10px; color:#FF9800; background:#000; border-radius:2px; margin-top:2px; padding:1px 3px;">作戦: ${tName}</div>`;
        }

        let content = `
        <div id="ui_enemy_${p.id}" class="${p.flash ? 'enemy-flash' : ''}" style="order:${Math.floor(p.col)}; width:130px; background:${bgCol}; border:2px solid ${borderCol}; padding:8px; border-radius:6px; display:flex; flex-direction:column; transition: opacity 0.4s ease-in, transform 0.2s; opacity:${wrapperOpacity}; transform:${wrapperTransform}; filter:${wrapperFilter}; box-shadow:${wrapperBoxShadow}; z-index:${wrapperZIndex};">
            <div style="color:${p.hp <= 0 && !p.flash ? '#888' : (p.isParty ? '#FFD700' : '#00BCD4')}; font-weight:bold; font-size:13px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${p.name} <span style="font-size:12px;">${statusIcons}</span>
            </div>
            ${tacticNameHtml}
            ${isHidden ? `<div style="color:#aaa; font-size:12px; font-weight:bold; text-align:center; margin:10px 0;">(探検中...)</div>` : `
                <div style="color:#76ff03; font-size:12px; font-weight:bold; margin-top:4px;">HP: ${Math.max(0, Math.floor(p.hp))}</div>
                ${p.isParty ? `<div style="color:#4fc3f7; font-size:12px; font-weight:bold; margin-bottom:4px;">MP: ${Math.max(0, p.mp)}</div>` : ''}
                <div style="width:100%; height:4px; background:#222; margin-bottom:4px; border-radius:2px; overflow:hidden; margin-top:3px;"><div style="width:${Math.min(100, p.actionGauge || 0)}%; height:100%; background:${p.isGuest ? '#00BCD4' : '#00E676'}; transition:width 0.2s;"></div></div>
                ${p.isParty ? `<div style="margin-top:auto; display:flex; flex-wrap:wrap; max-height:35px; overflow-y:auto;">${wordsHtml}</div>` : ''}
            `}
        </div>`;
        if (p.row === 'back') backRowHtml += content; else frontRowHtml += content;
    });

    let logHtml = state.log.map(l => `<div style="margin-bottom:6px; border-bottom:1px solid #333; padding-bottom:4px;">${l}</div>`).join('');
    let isBusy = state.isProcessing || state.autoMode || state.skipMode;
    
    // スキップ判定など
    let currentHighest = state.mode === 'boss' ? (window.aiPet.arenaBossHighestWave || 1) : (window.aiPet.arenaHighestWave || 1);
    let canSkipThisWave = state.wave < currentHighest;
    let skipBtnDisabled = isBusy || !canSkipThisWave;
    
    let autoBtnColor = state.autoMode ? '#FF9800' : '#2196F3';
    let autoBtnText = state.autoMode ? '⏸ AUTO停止' : '⏩ AUTO進行';
    
    let skipButtonHtml = '';
    let bossUnlocked = (window.aiPet.arenaHighestWave >= 51) || (window.aiPet && window.aiPet.defeatedArenaBosses && window.aiPet.defeatedArenaBosses.length > 0);
    if (bossUnlocked) {
        if (canSkipThisWave) {
            skipButtonHtml = `<button onclick="window.skipArenaWave()" ${skipBtnDisabled ? 'disabled' : ''} style="width:100%; padding:8px; font-size:12px; font-weight:bold; background:${isBusy ? '#555' : '#9C27B0'}; color:white; border:1px solid #FFF; border-radius:6px; cursor:${isBusy ? 'not-allowed' : 'pointer'};">⏭ スキップ</button>`;
        } else {
            skipButtonHtml = `<button disabled style="width:100%; padding:8px; font-size:11px; font-weight:bold; background:#444; color:#888; border:1px solid #555; border-radius:6px; cursor:not-allowed;">🔒 未到達WAVE</button>`;
        }
    }

    let allFighters = [];
    state.party.forEach(p => { if (p.hp > 0 && (p.exploreTimer||0) === 0 && !p.isSleeping) allFighters.push({ isEnemy: false, isGuest: false, obj: p }); });
    state.guests.forEach(g => { if (g.hp > 0) allFighters.push({ isEnemy: false, isGuest: true, obj: g }); });
    state.enemies.forEach(e => { if (e.hp > 0 && (e.exploreTimer||0) === 0 && !e.isSleeping) allFighters.push({ isEnemy: true, isGuest: false, obj: e }); });
    allFighters.sort((a, b) => (b.obj.actionGauge || 0) - (a.obj.actionGauge || 0));

    let readyIconsHtml = ""; let waitIconsHtml = "";
    allFighters.forEach(f => {
        let p = f.obj; let gauge = Math.min(100, p.actionGauge || 0); 
        let spKey = f.isEnemy ? p.spriteKey : (f.isGuest ? "arena_" + p.type : "arena_" + (p.skin || 'robot').split('_')[0]);
        let sp = window.DUNGEON_SPRITES[spKey] || window.DUNGEON_SPRITES["arena_robot"];
        let iconScale = 36 / Math.max(sp.sw, sp.sh);
        let borderColor = f.isEnemy ? "#ff5252" : (f.isGuest ? "#00BCD4" : "#00E676");
        let iconHtml = `<div style="position:relative; width:36px; height:36px; border-radius:50%; border:2px solid ${borderColor}; overflow:hidden; background:rgba(0,0,0,0.8); box-shadow: 0 0 5px ${borderColor}; z-index:2; margin: 2px 0;"><div style="position:absolute; top:0; left:0; width:${sp.sw}px; height:${sp.sh}px; background:url('${sp.img}') ${-sp.sx}px ${-sp.sy}px; transform:scale(${iconScale}); transform-origin:top left;"></div></div>`;
        if (gauge >= 100) readyIconsHtml += `<div class="arena-ready-blink" title="${p.name}">${iconHtml}</div>`;
        else waitIconsHtml += `<div style="position:absolute; bottom:${gauge}%; left:50%; transform:translate(-50%, 50%); transition:bottom 0.2s linear;" title="${p.name}">${iconHtml}</div>`;
    });

    let timelineHtml = `
        <div style="color:#FF9800; font-weight:bold; font-size:12px; margin-bottom:5px; letter-spacing:2px;">ACTION</div>
        <div style="width:100%; min-height:60px; border:2px solid #FF9800; border-radius:8px; background:rgba(255,152,0,0.2); display:flex; flex-direction:column; align-items:center; padding:5px; box-sizing:border-box; z-index:10; box-shadow:0 0 10px rgba(255,152,0,0.3);"><div style="font-size:10px; color:#FFC107; font-weight:bold; margin-bottom:5px;">READY</div>${readyIconsHtml}</div>
        <div style="position:relative; flex:1; width:6px; background:#222; border-radius:3px; margin-top:15px; margin-bottom:15px; box-shadow: inset 0 0 5px black;"><div style="position:absolute; bottom:0; left:0; width:100%; height:100%; background:linear-gradient(to top, rgba(33,150,243,0.5), rgba(255,152,0,0.8)); border-radius:3px;"></div>${waitIconsHtml}</div>
    `;

    // 枠組みの中身だけを更新する（差分更新）
    let fieldArea = document.getElementById('arena-field-area');
    if (fieldArea) {
        fieldArea.innerHTML = `<div style="position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.7); color:white; padding:10px 20px; border-radius:8px; font-size:24px; font-weight:bold; border:2px solid #FFC107; z-index:20;">WAVE ${state.wave}</div>${enemiesHtml}`;
    }

    let timelineArea = document.getElementById('arena-timeline-area');
    if (timelineArea) {
        timelineArea.innerHTML = timelineHtml;
    }

    let partyArea = document.getElementById('arena-party-area');
    if (partyArea) {
        partyArea.innerHTML = `
            <div style="display:flex; justify-content:center; gap:10px; min-height:85px; align-items:center;">${backRowHtml}</div>
            <div style="display:flex; justify-content:center; gap:10px; min-height:85px; align-items:center;">${frontRowHtml}</div>
        `;
    }

    let logArea = document.getElementById('arena-log-container');
    if (logArea) {
        logArea.innerHTML = logHtml;
        logArea.scrollTop = logArea.scrollHeight;
    }

    // ★修正5：右下のコントロールエリア（オート、撤退、スキップ）の再描画
    let autoBtnArea = document.getElementById('arena-auto-btn-area');
    if (autoBtnArea) {
        autoBtnArea.innerHTML = `
            <button onclick="window.toggleArenaAuto()" style="width:100%; padding:10px; font-size:16px; font-weight:bold; background:${autoBtnColor}; color:white; border:2px solid #FFF; border-radius:6px; cursor:pointer; box-shadow:0 3px 0 #1565C0;">${autoBtnText}</button>
            <div style="display:flex; gap:3px;">
                <button onclick="window.abortArenaToLobby()" style="flex:1; padding:8px; font-size:12px; font-weight:bold; background:#444; color:#fff; border:1px solid #777; border-radius:6px; cursor:pointer;">🏳️ 撤退</button>
                <div style="flex:1;">${skipButtonHtml}</div>
            </div>
        `;
    }
};

// 本格RPGエフェクト関数
window.showArenaEffect = function(targetId, typeStr) {
    let eDiv = document.getElementById(`ui_enemy_${targetId}`); 
    if(!eDiv) return;
    
    let rect = eDiv.getBoundingClientRect();
    let fxContainer = document.createElement('div'); 
    fxContainer.style.cssText = `position:fixed; top:${rect.top + rect.height/2}px; left:${rect.left + rect.width/2}px; width:100px; height:100px; transform:translate(-50%, -50%); z-index:60000; pointer-events:none;`; 
    document.body.appendChild(fxContainer);
    
    // ★新規追加：回復エフェクト（緑の十字が浮かび上がる）
    if (typeStr === 'heal') {
        for(let i=0; i<3; i++) {
            let cross = document.createElement('div');
            cross.innerHTML = '✚';
            cross.style.cssText = `position:absolute; top:70%; left:${20 + i*30}%; color:#00E676; font-weight:bold; font-size:24px; text-shadow:0 0 8px #00E676; opacity:0; transition:all 0.6s ease-out; transform:translate(-50%, -50%);`;
            fxContainer.appendChild(cross);
            setTimeout(() => { cross.style.top = '10%'; cross.style.opacity = '1'; }, 10 + i*150);
            setTimeout(() => { cross.style.opacity = '0'; }, 400 + i*150);
        }
    }
    // ★新規追加：バフエフェクト（オレンジの矢印が上に登る）
    else if (typeStr === 'buff') {
        for(let i=0; i<3; i++) {
            let arrow = document.createElement('div');
            arrow.innerHTML = '⬆';
            arrow.style.cssText = `position:absolute; top:70%; left:${20 + i*30}%; color:#FF9800; font-weight:bold; font-size:24px; text-shadow:0 0 8px #FF9800; opacity:0; transition:all 0.5s ease-out; transform:translate(-50%, -50%);`;
            fxContainer.appendChild(arrow);
            setTimeout(() => { arrow.style.top = '10%'; arrow.style.opacity = '1'; }, 10 + i*100);
            setTimeout(() => { arrow.style.opacity = '0'; }, 400 + i*100);
        }
    }
    // ★新規追加：デバフエフェクト（紫の矢印が下に落ちる）
    else if (typeStr === 'debuff') {
        for(let i=0; i<3; i++) {
            let arrow = document.createElement('div');
            arrow.innerHTML = '⬇';
            arrow.style.cssText = `position:absolute; top:10%; left:${20 + i*30}%; color:#9C27B0; font-weight:bold; font-size:24px; text-shadow:0 0 8px #9C27B0; opacity:0; transition:all 0.5s ease-in; transform:translate(-50%, -50%);`;
            fxContainer.appendChild(arrow);
            setTimeout(() => { arrow.style.top = '70%'; arrow.style.opacity = '1'; }, 10 + i*100);
            setTimeout(() => { arrow.style.opacity = '0'; }, 400 + i*100);
        }
    }
    else if (typeStr === 'beetle' || typeStr === 'seed') {
        let color = typeStr === 'seed' ? '#4CAF50' : '#FFF'; let shadow = typeStr === 'seed' ? '#8BC34A' : '#FFD700';
        let line1 = document.createElement('div'); let line2 = document.createElement('div');
        let baseStyle = `position:absolute; top:50%; left:50%; width:140px; height:6px; background:${color}; box-shadow:0 0 10px ${shadow}, 0 0 20px ${shadow}; border-radius:50%; transform-origin:center; opacity:0;`;
        line1.style.cssText = baseStyle + `transform:translate(-50%, -50%) rotate(45deg) scaleX(0); transition:transform 0.15s ease-out, opacity 0.15s;`; line2.style.cssText = baseStyle + `transform:translate(-50%, -50%) rotate(-45deg) scaleX(0); transition:transform 0.15s ease-out 0.1s, opacity 0.15s 0.1s;`;
        fxContainer.appendChild(line1); fxContainer.appendChild(line2);
        setTimeout(() => { line1.style.transform = 'translate(-50%, -50%) rotate(45deg) scaleX(1)'; line1.style.opacity = '1'; }, 10); setTimeout(() => { line2.style.transform = 'translate(-50%, -50%) rotate(-45deg) scaleX(1)'; line2.style.opacity = '1'; }, 80); setTimeout(() => { line1.style.opacity = '0'; line2.style.opacity = '0'; }, 400);
    } else if (typeStr === 'robot' || typeStr === 'stone') {
        let color = typeStr === 'robot' ? '#FF5722' : '#795548'; let blast = document.createElement('div');
        blast.style.cssText = `position:absolute; top:50%; left:50%; width:30px; height:30px; background:${color}; border-radius:50%; box-shadow:0 0 30px #FFC107, 0 0 50px #FF5252; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);`; fxContainer.appendChild(blast);
        let spikes = document.createElement('div'); spikes.style.cssText = `position:absolute; top:50%; left:50%; width:120px; height:120px; background:repeating-conic-gradient(from 0deg, transparent 0deg 20deg, #FFEB3B 20deg 30deg); transform:translate(-50%, -50%) scale(0); opacity:1; border-radius:50%; transition:all 0.25s ease-out; mask-image:radial-gradient(circle, transparent 20%, black 70%); -webkit-mask-image:radial-gradient(circle, transparent 20%, black 70%);`; fxContainer.appendChild(spikes);
        setTimeout(() => { blast.style.transform = 'translate(-50%, -50%) scale(4)'; blast.style.opacity = '0'; spikes.style.transform = 'translate(-50%, -50%) scale(1.5)'; spikes.style.opacity = '0'; }, 10);
    } else if (typeStr === 'magician' || typeStr === 'ghost') {
        let color = typeStr === 'magician' ? '#E040FB' : '#673AB7'; let ring = document.createElement('div'); ring.style.cssText = `position:absolute; top:50%; left:50%; width:10px; height:10px; border:6px solid ${color}; border-radius:50%; box-shadow:0 0 20px ${color} inset, 0 0 20px ${color}; transform:translate(-50%, -50%) scale(12); opacity:0; transition:all 0.3s ease-in;`; fxContainer.appendChild(ring);
        let core = document.createElement('div'); core.style.cssText = `position:absolute; top:50%; left:50%; width:80px; height:80px; background:${color}; border-radius:50%; filter:blur(12px); transform:translate(-50%, -50%) scale(0); opacity:0; transition:all 0.25s ease-out 0.3s;`; fxContainer.appendChild(core);
        setTimeout(() => { ring.style.transform = 'translate(-50%, -50%) scale(0.5)'; ring.style.opacity = '1'; }, 10); setTimeout(() => { ring.style.opacity = '0'; core.style.transform = 'translate(-50%, -50%) scale(1.5)'; core.style.opacity = '1'; }, 300); setTimeout(() => { core.style.opacity = '0'; }, 600);
    } else if (typeStr === 'dragon') {
        let fire = document.createElement('div'); fire.style.cssText = `position:absolute; bottom:0; left:50%; width:90px; height:0px; background:linear-gradient(to top, #FFEB3B, #FF9800, #F44336, transparent); filter:blur(4px); transform:translateX(-50%); border-radius:40px 40px 0 0; transition:height 0.3s ease-out, opacity 0.3s ease-out 0.2s; opacity:1;`; fxContainer.appendChild(fire);
        setTimeout(() => { fire.style.height = '140px'; }, 10); setTimeout(() => { fire.style.opacity = '0'; }, 400);
    } else if (typeStr === 'spirit' || typeStr === 'bird' || typeStr === 'balloon') {
        let color = typeStr === 'spirit' ? '#00BCD4' : (typeStr === 'bird' ? '#81D4FA' : '#FFFFFF'); let wave = document.createElement('div'); wave.style.cssText = `position:absolute; top:50%; left:50%; width:20px; height:20px; border:6px solid ${color}; border-radius:50%; box-shadow:0 0 15px ${color}; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.4s ease-out;`; fxContainer.appendChild(wave);
        let wave2 = document.createElement('div'); wave2.style.cssText = `position:absolute; top:50%; left:50%; width:20px; height:20px; border:3px solid ${color}; border-radius:50%; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.4s ease-out 0.1s;`; fxContainer.appendChild(wave2);
        setTimeout(() => { wave.style.transform = 'translate(-50%, -50%) scale(7)'; wave.style.opacity = '0'; wave2.style.transform = 'translate(-50%, -50%) scale(9)'; wave2.style.opacity = '0'; }, 10);
    } else if (typeStr === 'smithing') {
        let hammer = document.createElement('div');
        hammer.style.cssText = `position:absolute; top:-100px; left:50%; width:50px; height:60px; background:#795548; border-radius:8px; border-bottom:10px solid #5D4037; transform:translateX(-50%); transition:top 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53); box-shadow: 0 0 10px rgba(0,0,0,0.5);`;
        fxContainer.appendChild(hammer);
        setTimeout(() => { hammer.style.top = '10px'; }, 10);
        setTimeout(() => {
            hammer.style.opacity = '0';
            let spark = document.createElement('div');
            spark.style.cssText = `position:absolute; top:40px; left:50%; width:120px; height:120px; background:radial-gradient(circle, #FF9800 10%, #FF5722 30%, transparent 70%); transform:translate(-50%, -50%) scale(0); transition:transform 0.3s, opacity 0.3s; opacity:1;`;
            fxContainer.appendChild(spark);
            setTimeout(() => { spark.style.transform = 'translate(-50%, -50%) scale(1.5)'; spark.style.opacity = '0'; }, 10);
        }, 300);
    } else if (typeStr === 'fishing') {
        let splash = document.createElement('div');
        splash.style.cssText = `position:absolute; bottom:-10px; left:50%; width:80px; height:40px; background:rgba(0, 188, 212, 0.7); border-radius:50%; transform:translateX(-50%) scale(0); transition:transform 0.3s ease-out;`;
        fxContainer.appendChild(splash);
        let hook = document.createElement('div');
        hook.style.cssText = `position:absolute; bottom:0; left:50%; width:3px; height:200px; background:#FFF; box-shadow:0 0 5px #00BCD4; transform:translateX(-50%) translateY(100%); transition:transform 0.3s ease-in;`;
        fxContainer.appendChild(hook);
        setTimeout(() => { splash.style.transform = 'translateX(-50%) scale(1.5)'; hook.style.transform = 'translateX(-50%) translateY(-30px)'; }, 10);
        setTimeout(() => { splash.style.opacity = '0'; hook.style.opacity = '0'; }, 400);
    } else if (typeStr === 'soldier' || typeStr === 'captain') {
        let color = typeStr === 'captain' ? '#FFD700' : '#E0E0E0';
        let slash = document.createElement('div');
        slash.style.cssText = `position:absolute; top:50%; left:50%; width:160px; height:12px; background:${color}; box-shadow:0 0 20px ${color}; transform:translate(-50%, -50%) rotate(45deg) scaleX(0); transition:transform 0.2s ease-out; border-radius:6px;`;
        fxContainer.appendChild(slash);
        setTimeout(() => { slash.style.transform = 'translate(-50%, -50%) rotate(45deg) scaleX(1)'; }, 10);
        if (typeStr === 'captain') {
            let slash2 = document.createElement('div');
            slash2.style.cssText = `position:absolute; top:50%; left:50%; width:160px; height:12px; background:${color}; box-shadow:0 0 20px ${color}; transform:translate(-50%, -50%) rotate(-45deg) scaleX(0); transition:transform 0.2s ease-out 0.1s; border-radius:6px;`;
            fxContainer.appendChild(slash2);
            setTimeout(() => { slash2.style.transform = 'translate(-50%, -50%) rotate(-45deg) scaleX(1)'; }, 10);
            setTimeout(() => { slash2.style.opacity = '0'; }, 400);
        }
        setTimeout(() => { slash.style.opacity = '0'; }, 400);
    } else if (typeStr === 'explore') {
        let trap = document.createElement('div');
        trap.style.cssText = `position:absolute; bottom:0; left:50%; width:120px; height:40px; background:radial-gradient(ellipse, #4E342E 30%, transparent 70%); border:3px dashed #3E2723; border-radius:50%; transform:translateX(-50%) scale(0); transition:transform 0.3s;`;
        fxContainer.appendChild(trap);
        setTimeout(() => { trap.style.transform = 'translateX(-50%) scale(1)'; }, 10);
        setTimeout(() => { trap.style.opacity = '0'; }, 500);
    } else {
        let hit = document.createElement('div'); hit.style.cssText = `position:absolute; top:50%; left:50%; width:80px; height:80px; background:radial-gradient(circle, #FFF 10%, #FF9800 50%, transparent 80%); transform:translate(-50%, -50%) scale(0); opacity:1; transition:all 0.25s ease-out;`; fxContainer.appendChild(hit);
        setTimeout(() => { hit.style.transform = 'translate(-50%, -50%) scale(2)'; hit.style.opacity = '0'; }, 10);
    }
    
    setTimeout(() => { fxContainer.remove(); }, 1000);
};

// ★修正：第5引数に isFollowCommand（指示を聞くフラグ）を追加
window.evaluateArenaSkillScore = function(p, skillName, state, isEnemy = false, isFollowCommand = false) {
    let score = 0;
    let skill = window.ARENA_SKILLS[skillName];
    if (!skill) return -1000;

    let typeStr = (p.skin || 'robot').split('_')[0];
    if (skill.allowedTypes !== "all" && !skill.allowedTypes.includes(typeStr)) return -1000;
    if ((p.mp || 0) < skill.cost) return -1000;

    let myHpRate = p.hp / p.maxHp;
    let aliveOpponents = isEnemy ? state.party.filter(pt => pt.hp > 0 && (pt.exploreTimer||0) === 0 && !pt.isSleeping) : state.enemies.filter(e => e.hp > 0);
    let myTeam = isEnemy ? state.enemies.filter(e => e.hp > 0) : state.party.filter(pt => pt.hp > 0 && (pt.exploreTimer||0) === 0);
    let teamHpRates = myTeam.map(pt => pt.hp / pt.maxHp);
    let lowestHpRate = teamHpRates.length > 0 ? Math.min(...teamHpRates) : 1.0;

    // --- 既存の基礎スコア計算 ---
    switch(skill.type) {
        case "attack": score = 50; if(p.row==='front') score+=20; if(p.buffAtk>1.0) score+=30; if(p.isEquipped) score+=20; break;
        case "magic": score = 50; if(aliveOpponents.length>=2) score+=40; if(p.buffIntel>1.0) score+=30; if(p.row==='back') score+=20; break;
        case "heal": case "eat": if(myHpRate<0.3) score=150; else if(myHpRate<0.6) score=80; else score=-500; break;
        case "heal_all": if(lowestHpRate<0.4) score=200; else if(lowestHpRate<0.7) score=100; else score=-500; break;
        case "defend": if(myHpRate<0.5 && p.row==='front') score=90; else score=10; break;
        case "sleep": if(p.mp<skill.cost+15) score=120; else if(myHpRate<0.4) score=60; else score=-500; break;
        case "buff": if(skill.stat==='atk' && (p.buffAtk||1.0)<2.0) score=70; else if(skill.stat==='intel' && (p.buffIntel||1.0)<2.0) score=70; else score=-500; break;
        case "move": if(skill.dir==='up' && p.row==='back' && myHpRate>0.6) score=60; else if(skill.dir==='down' && p.row==='front' && myHpRate<0.4) score=100; else score=5; break;
        case "summon": if(!state.guests.some(g=>g.type===skill.master)) score=110; else score=-1000; break;
        case "call_rescue": if(!state.guests.some(g=>['soldier','captain','king'].includes(g.type))) score=110; else score=-1000; break;
        case "equip": if(!p.isEquipped) score=80; else score=-1000; break;
        case "build_hut": if((p.hutHp||0)<=0 && myHpRate<0.6) score=90; else score=-10; break;
        case "build_bridge": if(lowestHpRate<0.5) score=80; else score=10; break;
        case "build_farm": if(state.farmTimer===0 && myHpRate>0.6) score=80; else score=-10; break;
        case "random_build": if(myHpRate>0.5) score=60; else score=10; break;
        case "explore": if(myHpRate>0.8 && lowestHpRate>0.6) score=70; else score=-500; break;
        case "fishing": score = 40; break;
        default: score = 30;
    }

    // ★追加：受付で設定した「作戦（Tactic）」によるスコア補正（ベース性格）
    let tactic = p.tactic || 'normal';
    if (!isEnemy) {
        if (tactic === 'offensive' && (skill.type === 'attack' || skill.type === 'magic')) score += 40;
        if (tactic === 'defensive' && (skill.type === 'heal' || skill.type === 'heal_all' || skill.type === 'defend' || skill.type === 'sleep' || skill.type === 'eat' || skill.type === 'build_hut' || skill.type === 'build_bridge')) score += 40;
        if (tactic === 'support' && (skill.type === 'buff' || skill.type === 'summon' || skill.type === 'call_rescue' || skill.type === 'explore' || skill.type === 'equip' || skill.type === 'fishing' || skill.type === 'random_build')) score += 40;

        // ★追加：戦闘中のプレイヤーの「声かけ（コマンド）」による強制スコア補正（圧倒的優先度）
        if (isFollowCommand && state.currentCommand) {
            let cmd = state.currentCommand;
            if (cmd === 'offensive' && (skill.type === 'attack' || skill.type === 'magic')) score += 1000;
            if (cmd === 'defensive' && (skill.type === 'heal' || skill.type === 'heal_all' || skill.type === 'defend' || skill.type === 'eat' || skill.type === 'sleep' || skill.type === 'build_hut')) score += 1000;
            if (cmd === 'support' && (skill.type === 'buff' || skill.type === 'summon' || skill.type === 'call_rescue' || skill.type === 'equip' || skill.type === 'explore' || skill.type === 'fishing' || skill.type === 'build_farm')) score += 1000;
        }
    }

    return score;
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
window.toggleArenaAuto = function() { let state = window.ARENA_STATE; state.autoMode = !state.autoMode; window.renderArenaBattle(); if (state.autoMode && !state.isProcessing) window.processArenaTurn(); };

// ==========================================
// ★新規追加：スキルの有効性（MP・重複）チェッカー
// ==========================================
window.isValidSkillChoice = function(p, skillName) {
    let skillInfo = window.ARENA_SKILLS[skillName];
    if (!skillInfo) return false;
    
    // 1. MP不足チェック（足りなければ諦める）
    if ((p.mp || 0) < skillInfo.cost) return false; 
    
    // 2. バフ・構えの無駄撃ち（重複）防止チェック
    if (skillName === "図面" && p.absoluteDodge) return false;
    if (skillName === "書き写し" && p.reflect) return false;
    if ((skillName === "金庫" || skillName === "鍋") && (p.shield || p.invincible)) return false;
    if (skillName === "にげる" && (p.exploreTimer || 0) > 0) return false;
    if (skillName === "なまえ" && p.hateBoost) return false;
    if (skillName === "ごうせい" && p.nextAtkBoost) return false;
    
    return true;
};

// ==========================================
// ★上書き：次に実行する技を確定するヘルパー関数（光の節約を追加）
// ==========================================
window.determineNextActionName = function(p, state) {
    let defTactics = window.getDefaultTactics(p.words);
    let tactic = p.tacticType === 'default' ? defTactics[p.tacticIndex || 0] : (window.aiPet.tactics[p.tacticIndex || 0]);
    if (!tactic) tactic = defTactics[0]; 
    if (!tactic) return { skillName: "たたかう", ruleIndex: 0 };
    
    let validWords = p.words && p.words.length > 0 ? [...p.words, "たたかう"] : ["たたかう"];
    
    for (let i = 0; i < tactic.rules.length; i++) {
        if (window.checkTacticCondition(tactic.rules[i].condition, p, state)) {
            let action = tactic.rules[i].action;
            if (validWords.includes(action)) {
                // 既に付与されているバフ・無敵の無駄撃ちを回避する
                if (action === "書き写し" && p.reflect) continue;
                if (action === "金庫" && p.invincible) continue;
                if (action === "鍋" && p.shield) continue;
                if (action === "なまえ" && p.hateBoost) continue;
                if (action === "ごうせい" && p.nextAtkBoost) continue;
                if (action === "にげる" && (p.exploreTimer || 0) > 0) continue;
                if (action === "図面" && p.absoluteDodge) continue;
                
                // ★追加：このWAVEですでに「光」を使っていたらスキップする
                if (action === "光" && state.isLightUsed) continue;

                return { skillName: action, ruleIndex: i }; 
            }
        }
    }
    return { skillName: "たたかう", ruleIndex: 0 };
};

// ==========================================
// ★上書き：先制技の判定ヘルパー（MP不足なら先制させない）
// ==========================================
window.isPreemptiveActionReady = function(p, state, preemptiveList) {
    let next = window.determineNextActionName(p, state);
    let skillName = next.skillName;
    if (preemptiveList.includes(skillName)) {
        let skillInfo = window.ARENA_SKILLS[skillName];
        // 先制技を使おうとしているが、MPが足りている場合のみ先制発動！
        if (skillInfo && (p.mp || 0) >= skillInfo.cost) {
            return true;
        }
    }
    return false;
};

// ==========================================
// ★ 究極改修：ATBターン処理とAIマインド行動ロジック
// ==========================================

window.processArenaTurn = async function() {
    let state = window.ARENA_STATE;
    if (state.isProcessing && !state.skipMode) return;
    
    // AUTOモードかSKIPモードでなければ進行を止める
    if (!state.autoMode && !state.skipMode) return;

    state.isProcessing = true;

    // ★追加：WAVE開始時に「光」のフラグをリセットする
    if (state.globalTick === 0) {
        state.isLightUsed = false; 
    }

    const wait = async (ms) => { if (!state.skipMode) await new Promise(r => setTimeout(r, ms)); };
    const render = () => { if (!state.skipMode) window.renderArenaBattle(); };

    let alivePartyForAvg = state.party.filter(p => p.hp > 0);
    let avgAtk = 20; let avgInt = 20; let avgHp = 100; let avgDef = 10;
    if (alivePartyForAvg.length > 0) {
        avgAtk = alivePartyForAvg.reduce((s, p) => s + (p.atk * p.buffAtk), 0) / alivePartyForAvg.length;
        avgInt = alivePartyForAvg.reduce((s, p) => s + (p.intel * p.buffIntel), 0) / alivePartyForAvg.length;
        avgHp  = alivePartyForAvg.reduce((s, p) => s + p.maxHp, 0) / alivePartyForAvg.length;
        avgDef = alivePartyForAvg.reduce((s, p) => s + p.def, 0) / alivePartyForAvg.length;
    }

    let startLogs = [];
    let actorData = null; 

    // ★先制技のリスト定義
    let preemptiveSkills = ["光", "図面", "鍋", "書き写し", "金庫", "にげる"];

    while (!actorData) {
        if (!state.autoMode && !state.skipMode) {
            state.isProcessing = false;
            return;
        }
        
        if (state.party.filter(p => p.hp > 0).length === 0 || state.enemies.filter(e => e.hp > 0).length === 0) break;

        if (state.globalTick > 0 && state.globalTick % 40 === 0) {
            if (state.farmTimer > 0) {
                state.farmTimer--;
                if (state.farmTimer === 0) {
                    if (Math.random() < 0.3) { startLogs.push(`設置した畑は虫に食い荒らされていた...(失敗)`); } 
                    else {
                        state.party.forEach(p => { if(p.hp > 0) { p.hp = Math.min(p.maxHp, p.hp + Math.max(50, Math.floor(p.maxHp * 0.15))); p.buffAtk += 0.2; }});
                        startLogs.push(`【大豊作！】畑から作物が供給され、味方全員の体力回復＆攻撃アップ！🌱`);
                    }
                }
            }
            for (let p of state.party) {
                if (p.hp <= 0) continue;
                if (p.poisonTimer > 0) {
                    let psnDmg = Math.floor(p.maxHp * 0.1);
                    p.hp -= psnDmg; p.flash = true;
                    startLogs.push(`<span style="color:#9C27B0;">${p.name} は猛毒で ${psnDmg} のダメージを受けた！</span>`);
                    p.poisonTimer--;
                }
                if (p.doomTimer > 0) {
                    p.doomTimer--;
                    if (p.doomTimer === 0) {
                        p.hp -= 9999; p.flash = true;
                        startLogs.push(`<span style="color:#FF5252; font-weight:bold;">${p.name} に死の宣告が発動！</span>`);
                    } else {
                        startLogs.push(`<span style="color:#aaa;">${p.name} の死の宣告まであと ${p.doomTimer} ターン...</span>`);
                    }
                }
                if (p.exploreTimer > 0) {
                    p.exploreTimer--;
                    if (p.exploreTimer === 0) {
                        if (p.exploreOriginalTurn === 2) { p.hp = Math.min(p.maxHp, p.hp + Math.max(30, Math.floor(p.maxHp * 0.2))); p.mp = Math.min(p.maxMp, p.mp + Math.max(20, Math.floor(p.maxMp * 0.2))); startLogs.push(`${p.name} が探検から帰還し回復した！🍖`); }
                        else if (p.exploreOriginalTurn === 3) {
                            let aliveE = state.enemies.filter(e => e.hp > 0);
                            if (aliveE.length > 0) { let t = aliveE[Math.floor(Math.random() * aliveE.length)]; let logDmg = Math.max(40, Math.floor(p.atk * p.buffAtk * 0.8)); t.hp -= logDmg; t.flash = true; startLogs.push(`${p.name} が探検から帰還！丸太を投げつけ ${logDmg} ダメージ！🪵`); setTimeout(()=>{ t.flash = false; render(); }, 400); }
                        } else if (p.exploreOriginalTurn >= 4) { state.party.forEach(pt => { pt.buffAtk += 0.5; pt.buffIntel += 0.5; }); startLogs.push(`【奇跡】${p.name} が大いなる財宝を持ち帰り、味方全員が超強化！💎`); }
                    }
                }
                if (p.isSleeping && p.exploreTimer === 0) { p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.2)); p.mp = Math.min(p.maxMp, p.mp + 15); startLogs.push(`${p.name} は眠って回復した！(💤)`); p.isSleeping = false; }
                if (p.hutHp > 0 && p.exploreTimer === 0 && !p.isSleeping) { p.hp = Math.min(p.maxHp, p.hp + Math.max(15, Math.floor(p.maxHp * 0.1))); p.mp = Math.min(p.maxMp, p.mp + 10); startLogs.push(`${p.name} は小屋の中で回復した！(🏠)`); }
            }
            for (let e of state.enemies) {
                if (e.hp <= 0) continue;
                if (e.exploreTimer > 0) {
                    e.exploreTimer--;
                    if (e.exploreTimer === 0) {
                        if (e.exploreOriginalTurn === 2) { e.hp = Math.min(e.maxHp, e.hp + Math.max(30, Math.floor(e.maxHp * 0.2))); e.mp = Math.min(e.maxMp || 100, (e.mp||0) + 20); startLogs.push(`<span style="color:#ff5252;">${e.name} が探検から帰還し回復した！🍖</span>`); } 
                        else if (e.exploreOriginalTurn === 3) {
                            let aliveP = state.party.filter(p => p.hp > 0);
                            if (aliveP.length > 0) { let t = aliveP[Math.floor(Math.random() * aliveP.length)]; let logDmg = Math.max(40, Math.floor(e.atk * e.buffAtk * 0.8)); t.hp -= logDmg; t.flash = true; startLogs.push(`<span style="color:#ff5252;">${e.name} が帰還！丸太を投げつけ ${logDmg} ダメージ！🪵</span>`); setTimeout(()=>{ t.flash = false; render(); }, 400); }
                        } else if (e.exploreOriginalTurn >= 4) { state.enemies.forEach(en => { en.buffAtk = (en.buffAtk||1) + 0.5; en.buffDef = (en.buffDef||1) + 0.5; }); startLogs.push(`<span style="color:#ff5252;">【驚愕】${e.name} が財宝を持ち帰り敵全員が超強化！💎</span>`); }
                    }
                }
                if (e.isSleeping && e.exploreTimer === 0) { e.hp = Math.min(e.maxHp, e.hp + Math.floor(e.maxHp * 0.2)); startLogs.push(`<span style="color:#ff5252;">${e.name} は眠って回復した！(💤)</span>`); e.isSleeping = false; }
                if (e.hutHp > 0 && e.exploreTimer === 0 && !e.isSleeping) { e.hp = Math.min(e.maxHp, e.hp + Math.max(15, Math.floor(e.maxHp * 0.1))); startLogs.push(`<span style="color:#ff5252;">${e.name} は小屋の中で回復した！(🏠)</span>`); }
            }
        }

        let allFighters = [];
        state.party.forEach(p => { if (p.hp > 0 && (p.exploreTimer || 0) === 0 && !p.isSleeping) allFighters.push({ isEnemy: false, isGuest: false, obj: p }); });
        state.enemies.forEach(e => { if (e.hp > 0 && (e.exploreTimer || 0) === 0 && !e.isSleeping) allFighters.push({ isEnemy: true, isGuest: false, obj: e }); });
        state.guests.forEach(g => { if (g.hp > 0) allFighters.push({ isEnemy: false, isGuest: true, obj: g }); });

        if (allFighters.length === 0) {
            state.globalTick++; 
            break; 
        }

        for (let f of allFighters) {
            let speed = f.obj.speed || 10;
            let gaugeAdd = 4 + Math.floor(speed * 0.1);

            // ★先制システム：次に使う技が先制技なら、ATBゲージが光速で貯まる
            if (!f.isEnemy && !f.isGuest) {
                if (window.isPreemptiveActionReady(f.obj, state, preemptiveSkills)) {
                    gaugeAdd += 100000; // 確定先制
                }
            }

            f.obj.actionGauge = (f.obj.actionGauge || 0) + gaugeAdd;
        }

        allFighters.sort((a, b) => b.obj.actionGauge - a.obj.actionGauge);
        if (allFighters[0].obj.actionGauge >= 100) {
            actorData = allFighters[0];
            actorData.obj.actionGauge = 100; 
        }

        state.globalTick++;
        
        if (!state.skipMode && !actorData) {
            render(); await wait(30);
        }
    }

    if (actorData && !state.skipMode) {
        actorData.obj.isActing = true;
        render(); 
        await wait(400); 
        
        actorData.obj.actionGauge = 0; 
        actorData.obj.isActing = false; 
        render(); 
    }

    if (startLogs.length > 0) {
        state.log.push(...startLogs.map(t => `<span style="color:#76ff03;">${t}</span>`));
        render(); await wait(800);
    }

    if (actorData && actorData.obj.hp > 0) {
        let actor = actorData.obj;
        let isEnemy = actorData.isEnemy;
        let isGuest = actorData.isGuest;

        let alivePartyCheck = state.party.filter(p => p.hp > 0);
        let aliveEnemiesCheck = state.enemies.filter(e => e.hp > 0);

        if (alivePartyCheck.length > 0 && aliveEnemiesCheck.length > 0) {
            if (isGuest) {
                let g = actor;
                let tName = "";
                if (g.type === 'farming') tName = '身代わりカボチャ'; else if (g.type === 'soldier') tName = '城の兵士'; else if (g.type === 'captain') tName = '城の隊長'; else if (g.type === 'king') tName = '王様'; else if (g.type === 'cooking') tName = '料理人'; else if (g.type === 'smithing') tName = '鍛冶師'; else if (g.type === 'fishing') tName = '漁師'; else if (g.type === 'explore') tName = '冒険家'; else if (g.type === 'building') tName = '建築士'; else tName = '助っ人';

                if (g.type === 'cooking') {
                    state.log.push(`<span style="color:#00E676;">${tName} の特製スープで味方回復！(🍲)</span>`);
                    if (!state.skipMode) { state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) window.showArenaEffect(p.id, 'heal'); }); await wait(600); }
                    state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) p.hp = Math.min(p.maxHp, p.hp + Math.max(20, Math.floor(p.maxHp * 0.15))); });
                    render(); await wait(200);
                } else if (g.type === 'building') {
                    state.log.push(`<span style="color:#FFD700;">${tName} が味方陣地に防壁を展開！(🧱)</span>`);
                    if (!state.skipMode) { state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) window.showArenaEffect(p.id, 'buff'); }); await wait(600); }
                    state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) p.shield = true; });
                    render(); await wait(200);
                } else if (g.type === 'king') {
                    state.log.push(`<span style="color:#FFD700;">${tName} の号令！味方攻撃UP＆敵防御DOWN！(👑)</span>`);
                    if (!state.skipMode) { 
                        state.party.forEach(p => { if(p.hp > 0) window.showArenaEffect(p.id, 'buff'); });
                        state.enemies.forEach(e => { if(e.hp > 0) window.showArenaEffect(e.id, 'debuff'); });
                        await wait(600); 
                    }
                    state.party.forEach(p => { if(p.hp > 0) p.buffAtk += 0.1; });
                    state.enemies.forEach(e => { if(e.hp > 0) e.def = Math.max(0, e.def - Math.max(2, Math.floor(avgInt * 0.05))); });
                    render(); await wait(200);
                } else if (g.type === 'farming') {
                    state.log.push(`<span style="color:#FF9800;">${tName} は ぷるぷる揺れている！(🎃)</span>`);
                    render(); await wait(450);
                } else {
                    let aliveEnemies = state.enemies.filter(e => e.hp > 0);
                    if (aliveEnemies.length > 0) {
                        let t = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                        if (g.type === 'smithing') { 
                            let dmg = Math.max(30, Math.floor(avgAtk * 0.8)); 
                            state.log.push(`<span style="color:#FF9800;">${tName} のハンマー！ ${t.name} に ${dmg} のダメージ！(🔨)</span>`); 
                            if (!state.skipMode) { window.showArenaEffect(t.id, 'smithing'); await wait(600); }
                            t.hp -= dmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                        } else if (g.type === 'fishing') { 
                            let dmg = Math.max(15, Math.floor(avgAtk * 0.4)); 
                            state.log.push(`<span style="color:#00BCD4;">${tName} の大物釣り！ ${t.name} に ${dmg} のダメージ！(🎣)</span>`); 
                            if (!state.skipMode) { window.showArenaEffect(t.id, 'fishing'); await wait(600); }
                            t.hp -= dmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                        } else if (g.type === 'explore') { 
                            state.log.push(`<span style="color:#E040FB;">${tName} の罠！ ${t.name} の防御力が大幅低下！(🗺️)</span>`); 
                            if (!state.skipMode) { window.showArenaEffect(t.id, 'explore'); window.showArenaEffect(t.id, 'debuff'); await wait(600); }
                            t.def = Math.max(0, t.def - Math.max(5, Math.floor(avgInt * 0.1))); render(); await wait(400); 
                        } else if (g.type === 'soldier') { 
                            let dmg = Math.max(20, Math.floor(avgAtk * 0.6)); 
                            state.log.push(`<span style="color:#FFF;">${tName} の攻撃！ ${t.name} に ${dmg} ダメージ！(⚔️)</span>`); 
                            if (!state.skipMode) { window.showArenaEffect(t.id, 'soldier'); await wait(600); }
                            t.hp -= dmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                        } else if (g.type === 'captain') { 
                            let dmg = Math.max(35, Math.floor(avgAtk * 1.2)); 
                            state.log.push(`<span style="color:#FFD700;">${tName} の強撃！ ${t.name} に ${dmg} ダメージ！(🛡️)</span>`); 
                            if (!state.skipMode) { window.showArenaEffect(t.id, 'captain'); await wait(600); }
                            t.hp -= dmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                        }
                    }
                }
            } 
            else if (!isEnemy) {
                // ---------- 味方のアクション ----------
                let p = actor;
                let typeStr = (p.skin || 'robot').split('_')[0];
                let chosenSkillName = null;

                // ★追加：ターンが回ってきたら回避・無敵フラグをリセット（持続は次の行動まで）
                p.invincible = false;

                // ヘルパー関数を使って、次に使う技を確定させる
                let nextAction = window.determineNextActionName(p, state);
                chosenSkillName = nextAction.skillName;
                let usedRuleIndex = nextAction.ruleIndex;

                // ★ インフレ対応：成功率判定（絶対評価に変更）
                if (chosenSkillName) {
                    let baseProb = Math.min(100, 60 + (p.intel * 0.5));
                    let penaltyPerRule = p.intel >= 100 ? 0 : (5 * Math.max(0, 1 - (p.intel / 100)));
                    let successRate = Math.max(20, Math.min(100, baseProb - (usedRuleIndex * penaltyPerRule)));

                    if (Math.random() * 100 > successRate) {
                        let failure = window.getFailureAction(p);
                        chosenSkillName = failure.skillName; 
                        if (chosenSkillName) {
                            state.log.push(`<span style="color:#888;">💦 ${p.name} は作戦を失敗し、勝手に行動した！</span>`);
                        } else {
                            state.log.push(`<span style="color:#888;">💦 ${failure.log}</span>`);
                        }
                        render(); await wait(600);
                    }
                }

                // --- スキル発動処理 ---
                if (chosenSkillName) {
                    let skill = window.ARENA_SKILLS[chosenSkillName] || window.ARENA_SKILLS["たたかう"];

                    if (skill.allowedTypes !== "all" && !skill.allowedTypes.includes(typeStr)) {
                        state.log.push(`<span style="color:#4fc3f7;">${p.name} は「${chosenSkillName}」を使おうとしたが失敗した...</span>`); render(); await wait(400); 
                    } else if ((p.mp || 0) < skill.cost) {
                        state.log.push(`<span style="color:#888;">💦 ${p.name} は「${chosenSkillName}」を使おうとしたがMPが足りず戸惑っている...！</span>`); render(); await wait(600); 
                    } else {
                        state.log.push(`<span style="color:#4fc3f7; font-weight:bold;">⚔️ ${p.name} は「${chosenSkillName}」を使った！</span>`);
                        if (typeof window.triggerTCGSupportActionUnlock === 'function') {
                            window.triggerTCGSupportActionUnlock(chosenSkillName, (window.aiPet && window.aiPet.generation) || 1);
                        }
                        render(); await wait(400);
                        p.mp -= skill.cost;

                        if (skill.type === "move") {
                            if (skill.dir === 'up') p.row = 'front'; if (skill.dir === 'down') p.row = 'back';
                            if (skill.dir === 'left') p.col = Math.max(0, p.col - 1); if (skill.dir === 'right') p.col = Math.min(3, p.col + 1);
                            state.log.push(`<span style="color:#FFF;">陣形を「${skill.name}」に変更した！</span>`); render(); await wait(500);
                        }
                        else if (skill.type === "stance") {
                            state.log.push(`<span style="color:#FFC107;">${p.name} は ${skill.name} をとった！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                            if (skill.mode === 'high') p.buffAtk += 0.5;
                            else if (skill.mode === 'low') p.buffDef += 0.5;
                            else if (skill.mode === 'evade_r' || skill.mode === 'evade_l') p.accBoost = true;
                            render(); await wait(200);
                        }
                        else if (skill.type === "escape") {
                            state.log.push(`<span style="color:#00BCD4;">${p.name} は光の速さで戦線から一時離脱した！</span>`);
                            p.exploreOriginalTurn = 3; p.exploreTimer = 3; render(); await wait(500);
                        }
                        // ★追加：「光」を使った時の処理（命中ダウンとフラグ管理）
                        else if (chosenSkillName === "光") {
                            state.log.push(`<span style="color:#FFD700;">${p.name} は強烈な光を放ち、敵全体の目を眩ませた！</span>`);
                            if(!state.skipMode){ state.enemies.forEach(e => {if(e.hp>0) window.showArenaEffect(e.id, 'debuff')}); await wait(500); }
                            state.enemies.forEach(e => { if(e.hp>0) e.speed = Math.max(1, Math.floor((e.speed||10) * 0.5)); });
                            state.isLightUsed = true; // このWAVEで使ったことを記憶
                            render(); await wait(200);
                        }
                        else if (skill.type === "debuff_def" || skill.type === "debuff_speed") {
                            let t = aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)];
                            state.log.push(`<span style="color:#9C27B0;">${t.name} の弱点を突いた！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(t.id, 'debuff'); await wait(500); }
                            t.def = Math.max(0, Math.floor(t.def * 0.8)); t.speed = Math.max(1, Math.floor((t.speed||10) * 0.8));
                            render(); await wait(200);
                        }
                        else if (skill.type === "buff_next_atk") {
                            state.log.push(`<span style="color:#FFC107;">武器を強化した！次の攻撃が超絶アップ！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                            p.nextAtkBoost = 2.5; render(); await wait(200);
                        }
                        else if (skill.type === "provoke") {
                            state.log.push(`<span style="color:#FF9800;">${p.name} は大声で名乗りを上げ、敵の注意を引いた！</span>`);
                            p.hateBoost = true; render(); await wait(500);
                        }
                        else if (skill.type === "use_item") {
                            state.log.push(`<span style="color:#76ff03;">手持ちのアイテムを使った！HPが回復！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); }
                            p.hp = Math.min(p.maxHp, p.hp + 50); render(); await wait(200);
                        }
                        else if (skill.type === "buff" || skill.type === "buff_speed") {
                            state.log.push(`<span style="color:#FFC107;">気合が入り、能力がアップした！</span>`); 
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                            if (skill.stat === 'atk') p.buffAtk += 0.5; if (skill.stat === 'intel') p.buffIntel += 0.5;
                            if (skill.stat === 'speed' || skill.type === "buff_speed") p.speed = (p.speed||10) + 10;
                            render(); await wait(200);
                        }
                        else if (skill.type === "debuff_all") {
                            state.log.push(`<span style="color:#9C27B0;">敵全体の攻撃力がダウン！</span>`);
                            if(!state.skipMode){ state.enemies.forEach(e => {if(e.hp>0) window.showArenaEffect(e.id, 'debuff')}); await wait(500); }
                            state.enemies.forEach(e => { if(e.hp>0) e.buffAtk = Math.max(0.5, (e.buffAtk||1) - 0.2); });
                            render(); await wait(200);
                        }
                        else if (skill.type === "gold_earn") {
                            state.log.push(`<span style="color:#FFD700;">${p.name} は戦闘中に小銭を稼いだ！ (500G)</span>`);
                            if (window.aiPet) window.aiPet.gold = (window.aiPet.gold || 0) + 500;
                            render(); await wait(500);
                        }
                        else if (skill.type === "reflect") {
                            state.log.push(`<span style="color:#00BCD4;">次に受ける魔法をそのまま弾き返す鏡を展開した！</span>`);
                            p.reflect = true; render(); await wait(500);
                        }
                        else if (skill.type === "dodge") {
                            state.log.push(`<span style="color:#00BCD4;">${p.name} は未来を予測し、絶対回避の体勢をとった！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                            p.absoluteDodge = true; render(); await wait(200);
                        }
                        else if (skill.type === "buff_party") {
                            state.log.push(`<span style="color:#FFC107;">味方全体の素早さがアップ！</span>`);
                            if(!state.skipMode){ state.party.forEach(pt => {if(pt.hp>0 && pt.exploreTimer===0) window.showArenaEffect(pt.id, 'buff')}); await wait(500); }
                            state.party.forEach(pt => { if(pt.hp>0 && pt.exploreTimer===0) pt.speed = (pt.speed||10) + 10; });
                            render(); await wait(200);
                        }
                        else if (skill.type === "cure_party") {
                            state.log.push(`<span style="color:#76ff03;">味方全体のデバフと状態異常を洗い流した！</span>`);
                            if(!state.skipMode){ state.party.forEach(pt => {if(pt.hp>0 && pt.exploreTimer===0) window.showArenaEffect(pt.id, 'heal')}); await wait(500); }
                            state.party.forEach(pt => { 
                                if(pt.hp>0 && pt.exploreTimer===0) {
                                    pt.def = Math.max(pt.def, 10); pt.speed = Math.max(pt.speed, 10);
                                    pt.poisonTimer = 0; pt.doomTimer = 0;
                                }
                            }); 
                            render(); await wait(200);
                        }
                        else if (skill.type === "trap") {
                            state.log.push(`<span style="color:#FF9800;">${p.name} は足元に罠を設置した！</span>`);
                            p.trapActive = true; render(); await wait(500);
                        }
                        else if (skill.type === "roulette") {
                            state.log.push(`<span style="color:#E91E63; font-weight:bold;">🎲 ギャンブル発動！ 何が起こるかわからない！</span>`);
                            if(!state.skipMode) await wait(500);
                            if (Math.random() < 0.5) {
                                state.log.push(`<span style="color:#76ff03;">奇跡の光が降り注ぎ、味方全員が完全回復！</span>`);
                                state.party.forEach(pt => { if(pt.hp>0) { pt.hp = pt.maxHp; pt.mp = pt.maxMp; pt.buffAtk += 0.5; }});
                            } else {
                                state.log.push(`<span style="color:#ff5252; font-weight:bold;">超巨大隕石が直撃し、敵全体が消し飛んだ！！！</span>`);
                                state.enemies.forEach(e => { if(e.hp>0) { e.hp -= 999999; e.flash = true; }});
                            }
                            render(); await wait(500); state.enemies.forEach(e => e.flash = false); render();
                        }
                        else if (skill.type === "full_heal_party") {
                            state.log.push(`<span style="color:#76ff03; font-weight:bold;">豪華な食事が振る舞われ、味方全員が完全回復＋超強化！</span>`);
                            if(!state.skipMode){ state.party.forEach(pt => {if(pt.hp>0 && pt.exploreTimer===0) window.showArenaEffect(pt.id, 'heal')}); await wait(500); }
                            state.party.forEach(pt => { if(pt.hp>0 && pt.exploreTimer===0) { pt.hp = pt.maxHp; pt.mp = pt.maxMp; pt.buffAtk += 0.5; pt.buffIntel += 0.5; }});
                            render(); await wait(200);
                        }
                        else if (skill.type === "buy_mercenary") {
                            state.log.push(`<span style="color:#FFD700;">ゴールドを支払い、屈強な傭兵を雇った！</span>`);
                            if (window.aiPet) window.aiPet.gold = Math.max(0, (window.aiPet.gold || 0) - 1000);
                            let gHp = Math.max(10, Math.floor(avgHp)); 
                            state.guests.push({ id: `g_soldier_${Date.now()}`, type: 'soldier', hp: gHp*2, maxHp: gHp*2, actionGauge: 0, speed: 60 }); 
                            render(); await wait(500);
                        }
                        else if (skill.type === "sleep") { p.isSleeping = true; state.log.push(`<span style="color:#aaa;">${p.name} は その場でぐっすり眠りについた...💤</span>`); render(); await wait(500); }
                        else if (skill.type === "summon") {
                            if (!state.guests.some(g => g.type === skill.master)) {
                                let masterHP = Math.max(10, Math.floor(avgHp * (skill.master === 'farming' ? 1.5 : 0.3))); 
                                state.guests.push({ id: `g_${skill.master}_${Date.now()}`, type: skill.master, hp: masterHP, maxHp: masterHP, actionGauge: 0, speed: 40 });
                                state.log.push(`<span style="color:#E91E63; font-weight:bold;">${skill.name}により師匠が駆けつけた！！</span>`);
                            } else { state.log.push(`<span style="color:#aaa;">しかし、既に呼ばれていた！(失敗)</span>`); }
                            render(); await wait(500);
                        }
                        else if (skill.type === "call_rescue") {
                            let rTypes = ['soldier', 'soldier', 'captain', 'king']; let gType = rTypes[Math.floor(Math.random() * rTypes.length)];
                            let gHp = Math.floor(avgHp * (gType === 'captain' ? 0.8 : (gType === 'soldier' ? 0.5 : 0.3))); gHp = Math.max(10, gHp);
                            state.guests.push({ id: `g_${gType}_${Date.now()}`, type: gType, hp: gHp, maxHp: gHp, actionGauge: 0, speed: 45 }); 
                            state.log.push(`<span style="color:#FFD700; font-weight:bold;">城から援軍が到着した！</span>`); render(); await wait(500);
                        }
                        else if (skill.type === "build_hut") { p.hutHp = 5; state.log.push(`<span style="color:#FFF;">${p.name} は頑丈な小屋に立てこもった！(🏠)</span>`); render(); await wait(500); }
                        else if (skill.type === "build_bridge") { state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0) pt.row = 'back'; }); state.log.push(`<span style="color:#00BCD4;">橋を架けて味方全員が後衛に退避した！</span>`); render(); await wait(500); }
                        else if (skill.type === "build_farm") { state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">急いで畑を耕した！</span>`); render(); await wait(500); }
                        else if (skill.type === "random_build") {
                            let rnd = Math.random();
                            if (rnd < 0.25) { p.hutHp = 5; state.log.push(`<span style="color:#FFF;">小屋が完成し中に立てこもった！</span>`); }
                            else if (rnd < 0.5) { state.party.forEach(pt => pt.row = 'back'); state.log.push(`<span style="color:#00BCD4;">橋が完成し全員で後衛に退避した！</span>`); }
                            else if (rnd < 0.75) { state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">畑が完成した！収穫を待とう...</span>`); }
                            else { 
                                let bHp = Math.max(10, Math.floor(avgHp * 0.5)); 
                                state.guests.push({ id: `g_soldier_${Date.now()}`, type: 'soldier', hp: bHp, maxHp: bHp, actionGauge: 0, speed: 45 }); 
                                state.log.push(`<span style="color:#FFD700;">城の設備を作り兵士を呼び込んだ！</span>`); 
                            }
                            render(); await wait(500);
                        }
                        else if (skill.type === "explore") { p.exploreOriginalTurn = 2 + Math.floor(Math.random() * 3); p.exploreTimer = p.exploreOriginalTurn; state.log.push(`<span style="color:#E040FB;">「ちょっと探検してくる！」 ${p.name} は戦場から姿を消した...</span>`); render(); await wait(500); }
                        else if (skill.type === "fishing") {
                            let r = Math.random();
                            if (r < 0.33) {
                                let t = aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)];
                                let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                                if (Math.random() < dodgeChance) { state.log.push(`<span style="color:#aaa;">大物が釣れたが、${t.name} は素早く躱した！(MISS)</span>`); } 
                                else { 
                                    let fishDmg = Math.max(30, Math.floor(p.atk * p.buffAtk * 0.6)); 
                                    state.log.push(`<span style="color:#00BCD4;">大物が釣れた！暴れる魚が ${t.name} に ${fishDmg} ダメージ！🎣</span>`); 
                                    if (!state.skipMode) { window.showArenaEffect(t.id, 'fishing'); await wait(600); }
                                    t.hp -= fishDmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                                }
                            } else if (r < 0.66) { p.hp = Math.min(p.maxHp, p.hp + Math.max(40, Math.floor(p.maxHp * 0.2))); state.log.push(`<span style="color:#76ff03;">新鮮な魚を食べてHP回復！🍣</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); } render(); } 
                            else { state.log.push(`<span style="color:#aaa;">...空き缶が釣れた。(失敗)</span>`); render(); await wait(500); }
                        }
                        else if (skill.type === "eat") { state.log.push(`<span style="color:#76ff03;">食料を食べてHPとMPが大回復！🍖</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); } p.hp = Math.min(p.maxHp, p.hp + Math.max(50, Math.floor(p.maxHp * 0.25))); p.mp = Math.min(p.maxMp, p.mp + Math.max(20, Math.floor(p.maxMp * 0.15))); render(); await wait(200); }
                        else if (skill.type === "equip") { state.log.push(`<span style="color:#FFC107;">武器を構えた！攻撃力大幅アップ！🗡️</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); } p.buffAtk += 0.5; p.isEquipped = true; render(); await wait(200); }
                        else if (skill.type === "unequip") { if (p.isEquipped) { p.buffAtk = Math.max(1.0, p.buffAtk - 0.5); p.isEquipped = false; state.log.push(`<span style="color:#aaa;">重い装備を外して身軽になった。</span>`); } else { state.log.push(`<span style="color:#aaa;">しかし何も装備していなかった。</span>`); } render(); await wait(500); }
                        else if (skill.type === "magic_ice" || skill.type === "magic_water" || skill.type === "magic_fire" || skill.type === "magic_light" || skill.type === "magic_earth" || skill.type === "magic_poison" || skill.type === "magic_random") {
                            let isAll = skill.target === "all" || skill.target === "random";
                            let targets = isAll ? aliveEnemiesCheck : [aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)]];
                            state.log.push(`<span style="color:#E040FB; font-weight:bold;">✨ ${p.name} の【${skill.name}】！</span>`);
                            render(); if(!state.skipMode) await wait(300);
                            
                            for (let t of targets) {
                                if (t.hp <= 0) continue;
                                if (!state.skipMode) { window.showArenaEffect(t.id, 'magic'); await wait(200); }
                                
                                let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed||10) - (p.speed||10)) * 0.05));
                                if (Math.random() < dodgeChance && !p.accBoost) { 
                                    state.log.push(`<span style="color:#aaa;">${t.name} は魔法をヒラリと避けた！(MISS)</span>`);
                                    render(); if(!state.skipMode) await wait(200);
                                    continue; 
                                }

                                if (t.isMagicReflect) {
                                    state.log.push(`<span style="color:#00BCD4;">${t.name} は魔法を反射した！ ${p.name} に 9999 の即死ダメージ！</span>`);
                                    p.hp -= 9999; p.flash = true;
                                    render(); if(!state.skipMode) await wait(400);
                                    p.flash = false; render();
                                    if (p.hp <= 0) break;
                                    continue;
                                }
                                
                                let dmgMultiplier = 1.0;
                                if (t.type.split('_')[0] === 'ghost') dmgMultiplier *= 0.1;
                                
                                let dmg = Math.max(1, Math.floor(p.intel * p.buffIntel * (skill.power || 1.5) * dmgMultiplier) - Math.floor(t.def * 0.5));
                                if (p.nextAtkBoost) { dmg = Math.floor(dmg * p.nextAtkBoost); }
                                
                                t.hp -= dmg; t.flash = true;
                                state.log.push(`<span style="color:#FFF;">${t.name} に ${dmg} のダメージ！</span>`);
                                
                                if (skill.type === "magic_poison") t.buffAtk = Math.max(0.5, (t.buffAtk||1) - 0.1);
                                if (skill.type === "blind") t.speed = Math.max(1, (t.speed||10) - 5);

                                render(); if(!state.skipMode) await wait(300);
                                t.flash = false; render(); if(!state.skipMode) await wait(100);
                            }
                            p.nextAtkBoost = null; // 合成バフ消費
                        }
                        else if (skill.type === "attack_special" || skill.type === "attack_pierce" || skill.type === "heavy" || skill.type === "throw" || skill.type === "draw_card" || skill.type === "attack" || skill.type === "magic") {
                            let target = aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)];
                            let targets = skill.target === "all" ? aliveEnemiesCheck : [target];
                            
                            for (let t of targets) {
                                if (t.hp <= 0) continue;
                                if (!state.skipMode) { window.showArenaEffect(t.id, typeStr); await wait(200); }
                                
                                let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                                if (skill.type !== "throw" && Math.random() < dodgeChance && !p.accBoost) { 
                                    state.log.push(`<span style="color:#aaa;">${t.name} は攻撃をヒラリと避けた！(MISS)</span>`); 
                                    render(); if (!state.skipMode) await wait(200);
                                    continue; 
                                }
                                
                                let finalAtk = p.atk * p.buffAtk; 
                                if (skill.type === "magic" || skill.type === "draw_card") finalAtk = p.intel * p.buffIntel;
                                let dmgMultiplier = 1.0; 
                                if (p.row === 'back' && (skill.type === "attack" || skill.type === "heavy")) dmgMultiplier = 0.7; 
                                if (p.hutHp > 0) dmgMultiplier *= 0.8; 
                                
                                let isMagic = (skill.type === "magic" || skill.type === "magic_all" || skill.type === "draw_card" || skill.type === "heavy_magic");
                                let isPhysical = (skill.type === "attack" || skill.type === "heavy" || skill.type === "attack_pierce" || skill.type === "throw");

                                // マホカンタ・物理カウンター処理
                                if (isMagic && t.isMagicReflect) {
                                    state.log.push(`<span style="color:#00BCD4;">${t.name} は魔法を反射した！ ${p.name} に 9999 の即死ダメージ！</span>`);
                                    p.hp -= 9999; p.flash = true; 
                                    render(); if(!state.skipMode) await wait(400); p.flash = false; render();
                                    if (p.hp <= 0) break;
                                    continue;
                                } else if (isPhysical && t.isCounterStance) {
                                    state.log.push(`<span style="color:#FF5252;">${t.name} の強烈なカウンター！ ${p.name} に 9999 の即死ダメージ！</span>`);
                                    p.hp -= 9999; p.flash = true; 
                                    render(); if(!state.skipMode) await wait(400); p.flash = false; render();
                                    if (p.hp <= 0) break;
                                    continue;
                                }

                                // 種族耐性と飛行ギミック
                                let tBaseType = t.type.split('_')[0]; 
                                if (isPhysical && tBaseType === 'stone') dmgMultiplier *= 0.1;
                                if (isMagic && tBaseType === 'ghost') dmgMultiplier *= 0.1;
                                if (t.isFlying && isPhysical && Math.random() < 0.5) {
                                    state.log.push(`<span style="color:#aaa;">${t.name} は上空へ飛び上がって回避した！(MISS)</span>`); 
                                    render(); if (!state.skipMode) await wait(200);
                                    continue;
                                }

                                let dmg = Math.max(1, Math.floor(finalAtk * (skill.power || 1.0) * dmgMultiplier) - Math.floor(t.def * 0.5));
                                
                                // アーマー値ギミック（マシン・ビートル）
                                if (t.armorValue > 0) {
                                    if (skill.name === "鍛冶撃ち" || skill.name === "鍛冶師の呼出") {
                                        t.armorValue = 0; state.log.push(`<span style="color:#FF9800;">${t.name} の装甲を完全に破壊した！</span>`);
                                    } else { dmg = 1; }
                                }

                                // 貫通処理
                                if (skill.type === "attack_pierce" || skill.name === "鍛冶撃ち" || skill.name === "鍛冶師の呼出") {
                                    dmg = Math.max(1, Math.floor(finalAtk * (skill.power || 1.2))); 
                                }
                                if (skill.type === "throw") dmg = Math.max(10, Math.floor(p.atk * 1.5)); 
                                if (p.nextAtkBoost) { dmg = Math.floor(dmg * p.nextAtkBoost); }
                                
                                // アンデッド特効
                                if (tBaseType === 'ghost' && skill.type.includes("heal")) {
                                    dmg = 9999; state.log.push(`<span style="color:#FFC107;">回復の光がアンデッドを焼き尽くす！</span>`);
                                }

                                t.hp -= dmg; 
                                t.flash = true;
                                state.log.push(`<span style="color:#FFF;">${skill.name}！ ${t.name} に ${dmg} のダメージ！</span>`);
                                
                                if (t.hp <= 0) {
                                    let baseScore = state.wave * 10;
                                    let bossBonus = t.isBoss ? 100 : 1;
                                    let comboMultiplier = 1.0 + (state.comboCount * 0.1); 
                                    let gainedScore = Math.floor(baseScore * bossBonus * comboMultiplier);
                                    state.runScore += gainedScore;
                                    state.log.push(`<span style="color:#FFD700; font-weight:bold;">✨ ${gainedScore} ポイント獲得！ (Total: ${state.runScore})</span>`);
                                }

                                render(); 
                                if (!state.skipMode) await wait(300); 
                                t.flash = false; 
                                render(); 
                                if (!state.skipMode) await wait(100); 
                            }
                            p.nextAtkBoost = null; // 合成バフ消費
                        }
                        else if (skill.type === "shield" || skill.type === "invincible" || skill.type === "defend") {
                            state.log.push(`<span style="color:#FFF;">${p.name} は ${skill.name} を展開した！</span>`);
                            if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                            p.shield = true; 
                            if (skill.type === "invincible") p.invincible = true;
                            render(); await wait(200);
                        }
                        else if (skill.type === "regen_party") {
                            state.log.push(`<span style="color:#76ff03;">味方全体にリジェネ（継続回復）が付与された！</span>`);
                            if(!state.skipMode){ state.party.forEach(pt => {if(pt.hp>0 && pt.exploreTimer===0) window.showArenaEffect(pt.id, 'heal')}); await wait(500); }
                            state.party.forEach(pt => { if(pt.hp>0 && pt.exploreTimer===0) pt.regen = true; });
                            render(); await wait(200);
                        }
                        else if (skill.type === "heal") { state.log.push(`<span style="color:#76ff03;">${p.name} のHPが回復した！</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(600); } p.hp = Math.min(p.maxHp, p.hp + skill.power + Math.floor(p.intel * p.buffIntel * 0.5)); render(); await wait(200); } 
                        else if (skill.type === "heal_all" || skill.type === "heal_party") { state.log.push(`<span style="color:#76ff03;">味方全員のHPが回復した！</span>`); if(!state.skipMode){ state.party.forEach(pt => { if(pt.hp > 0 && (pt.exploreTimer||0) === 0) window.showArenaEffect(pt.id, 'heal'); }); await wait(600); } for (let pt of state.party) { if(pt.hp > 0 && (pt.exploreTimer||0) === 0) pt.hp = Math.min(pt.maxHp, pt.hp + skill.power + Math.floor(p.intel * pt.buffIntel * 0.3)); } render(); await wait(200); } 
                    }
                }
            } else {
                // ---------- 敵のアクション ----------
                
                // ★先制技のリスト定義（直感的に納得できるものだけ）
                let preemptiveSkills = ["光", "図面", "鍋", "書き写し", "金庫", "にげる"];

                let e = actor;
                let targets = [];
                state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) targets.push({ obj: pt, isGuest: false, row: pt.row, col: pt.col }); });
                state.guests.forEach(g => { if (g.hp > 0) targets.push({ obj: g, isGuest: true, type: g.type, row: 'front', col: 1.5 }); });
                
                if (targets.length === 0) {
                    state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0) targets.push({ obj: pt, isGuest: false, row: pt.row, col: pt.col }); });
                }

                if (targets.length > 0) {
                    let hateList = targets.map(t => {
                        let hate = 10; if (t.row === 'back') hate -= 6; 
                        if (t.isGuest) { if (t.type === 'captain') hate += 100; if (t.type === 'farming') hate += 200; if (t.type === 'soldier' || t.type === 'king') hate += 5; } else { hate += (3 - t.col) * 2; }
                        return { target: t, hate: Math.max(1, hate) };
                    });
                    
                    let totalHate = hateList.reduce((s, i) => s + i.hate, 0); let rHate = Math.random() * totalHate;
                    let finalTargetData = hateList[0].target;
                    for (let item of hateList) { rHate -= item.hate; if (rHate <= 0) { finalTargetData = item.target; break; } }

                    let targetObj = finalTargetData.obj; let defValue = finalTargetData.isGuest ? Math.floor(avgDef * 0.5) : targetObj.def;
                    let baseAtk = e.atk * (e.buffAtk || 1.0); let dmgMultiplier = 1.0; if (e.hutHp > 0) dmgMultiplier *= 0.8;
                    
                    let dmg = 0; let logMsg = null; let actionType = "attack"; let skillName = "通常攻撃";
                    
                    let r = Math.random();
                    // ★修正：フレンドの場合はボスパターンを無視（false）させる！
                    let hasPattern = window.ARENA_BOSS_PATTERNS[e.type] && !e.isFriend;

                    if (hasPattern) {
                        let bossPatterns = window.ARENA_BOSS_PATTERNS[e.type];
                        
                        if (e.isBoss) {
                            let ultimateSkill = bossPatterns.find(p => p.actionType === "magic_all" || p.actionType === "heavy_magic") || bossPatterns[0];
                            let snipeSkill    = bossPatterns.find(p => p.actionType === "heavy" || p.actionType === "attack") || bossPatterns[1] || bossPatterns[0];
                            let stanceSkill   = bossPatterns.find(p => p.actionType === "buff_def" || p.actionType === "debuff_def") || bossPatterns[2] || bossPatterns[0];

                            if (e.hp < e.maxHp * 0.3 && !e.isEnraged) {
                                e.isEnraged = true; e.buffAtk += 0.5; e.speed += 20;
                                state.log.push(`<span style="color:#FF5252; font-weight:bold;">${e.name} は激怒し、行動が凶悪化した！！</span>`);
                            }

                            if (e.isCharging) {
                                e.isCharging = false; actionType = "magic_all"; skillName = ultimateSkill.skillName;
                                baseAtk = 9999; dmgMultiplier = 2.0; 
                            } else if (r < 0.15 && state.wave >= 100) {
                                e.isCharging = true; actionType = "charge"; skillName = `『${ultimateSkill.skillName}』の構え...！`;
                            } else if (r < 0.25 && state.wave >= 50) {
                                if (['ghost','magician','spirit'].includes(e.type.split('_')[0])) { e.isMagicReflect = true; actionType = "stance"; skillName = `【魔法反射】${stanceSkill.skillName}`; } 
                                else { e.isCounterStance = true; actionType = "stance"; skillName = `【物理迎撃】${stanceSkill.skillName}`; }
                            } else if (r < 0.35 && state.wave >= 150) {
                                let backTargets = targets.filter(t => t.row === 'back');
                                if (backTargets.length > 0 && !targetObj.hateBoost) {
                                    finalTargetData = backTargets[Math.floor(Math.random() * backTargets.length)];
                                    targetObj = finalTargetData.obj; actionType = "heavy"; skillName = `【後衛強襲】${snipeSkill.skillName}`; baseAtk = 9999;
                                }
                            }
                        }
                        
                        if (actionType === "attack" || !actionType) {
                            e.patternStep = e.patternStep || 0; 
                            let pat = bossPatterns[e.patternStep % bossPatterns.length];
                            e.patternStep++; actionType = pat.actionType; skillName = pat.skillName;
                            if (e.isBoss) { e.isCounterStance = false; e.isMagicReflect = false; }
                        }
                    } else if (e.isFriend) {
                        let p = e; 
                        let typeStr = (p.skin || 'robot').split('_')[0];
                        p.absoluteDodge = false; 
                        p.invincible = false;

                        // 難易度の取得
                        let difficulty = state.friendDifficulty || 'normal';
                        
                        // 1. スキルのカテゴリ定義
                        const CAT_EASY = ["attack", "attack_pierce", "throw", "heal", "eat"];
                        const CAT_NORMAL = ["debuff_def", "debuff_speed", "buff", "buff_speed", "buff_atk", "defend", "move", "gold_earn", "use_item", "provoke", "buff_next_atk"];
                        const CAT_HARD = ["heavy", "magic", "magic_all", "heavy_magic", "heal_all", "heal_party", "regen_party", "cure_party", "sleep", "summon", "call_rescue", "shield", "reflect"];
                        const CAT_LUNATIC = ["dodge", "blind", "magic_poison", "invincible", "roulette", "full_heal_party", "escape", "trap", "random_build", "build_hut", "build_bridge", "build_farm", "fishing", "explore"];

                        // 2. 難易度に応じた「使用許可プール」の作成
                        let allowedCategories = [...CAT_EASY];
                        if (difficulty === 'normal') allowedCategories.push(...CAT_NORMAL);
                        if (difficulty === 'hard') allowedCategories.push(...CAT_NORMAL, ...CAT_HARD);
                        if (difficulty === 'lunatic') allowedCategories.push(...CAT_NORMAL, ...CAT_HARD, ...CAT_LUNATIC);

                        let validWords = p.words && p.words.length > 0 ? [...p.words, "たたかう"] : ["たたかう"];
                        
                        // 3. AIが覚えている言葉の中から、許可されたカテゴリのものだけを抽出
                        let usableWords = validWords.filter(w => {
                            let s = window.ARENA_SKILLS[w];
                            // isValidSkillChoice はバフ重複の防止。MP不足は無視してリストに入れる。
                            return s && allowedCategories.includes(s.type) && window.isValidSkillChoice(p, w);
                        });

                        if (usableWords.length === 0) usableWords = ["たたかう"];

                        // 4. 重み付けランダム抽選
                        let chosenSkillName = "たたかう";
                        let myHpRate = p.hp / p.maxHp;

                        if (difficulty === 'easy' || difficulty === 'normal') {
                            // 低難易度：完全ランダム
                            chosenSkillName = usableWords[Math.floor(Math.random() * usableWords.length)];
                        } else {
                            // 高難易度（hard, lunatic）：状況に応じた重み付けで、より嫌らしい行動を引きやすくする
                            let weightedPool = [];
                            usableWords.forEach(w => {
                                let s = window.ARENA_SKILLS[w];
                                let weight = 1;

                                // 自分のHPが減っていれば回復の重みを増やす
                                if (myHpRate < 0.5 && (s.type.includes("heal") || s.type === "eat" || s.type === "sleep")) weight += 5;
                                
                                // 難易度が高いほど、解放されたばかりの凶悪なカテゴリを優先して使う
                                if (difficulty === 'hard' && CAT_HARD.includes(s.type)) weight += 3;
                                if (difficulty === 'lunatic') {
                                    if (CAT_LUNATIC.includes(s.type)) weight += 10; // ハメ技最優先
                                    else if (CAT_HARD.includes(s.type)) weight += 3;
                                    
                                    // 鬼畜専用ロジック：相手が反射を張っているなら魔法の重みを下げる
                                    let isPlayerReflecting = state.party.some(pt => pt.hp > 0 && pt.reflect);
                                    if (isPlayerReflecting && s.type.includes("magic")) weight = 0;
                                }

                                for(let i=0; i<weight; i++) weightedPool.push(w);
                            });

                            if (weightedPool.length > 0) {
                                chosenSkillName = weightedPool[Math.floor(Math.random() * weightedPool.length)];
                            } else {
                                chosenSkillName = usableWords[Math.floor(Math.random() * usableWords.length)];
                            }
                        }

                        let skill = window.ARENA_SKILLS[chosenSkillName] || window.ARENA_SKILLS["たたかう"];

                        if (skill.allowedTypes !== "all" && !skill.allowedTypes.includes(typeStr)) {
                            state.log.push(`<span style="color:#ff5252;">${p.name} は「${chosenSkillName}」を使おうとしたが失敗した...</span>`); render(); await wait(400); 
                        } else if ((p.mp || 0) < skill.cost) {
                            state.log.push(`<span style="color:#888;">💦 ${p.name} は「${chosenSkillName}」を使おうとしたがMPが足りず戸惑っている...！</span>`); render(); await wait(600); 
                        } else {
                            state.log.push(`<span style="color:#ff5252; font-weight:bold;">⚔️ ${p.name} は「${chosenSkillName}」を使った！</span>`); render(); await wait(400);
                            p.mp -= skill.cost;

                            let myTeam = state.enemies; 
                            let oppTeam = []; 
                            state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) oppTeam.push(pt); });
                            state.guests.forEach(g => { if (g.hp > 0) oppTeam.push(g); });

                            if (skill.type === "move") {
                                if (skill.dir === 'up') p.row = 'front'; if (skill.dir === 'down') p.row = 'back';
                                if (skill.dir === 'left') p.col = Math.max(0, p.col - 1); if (skill.dir === 'right') p.col = Math.min(3, p.col + 1);
                                state.log.push(`<span style="color:#FFF;">陣形を「${skill.name}」に変更した！</span>`); render(); await wait(500);
                            }
                            else if (skill.type === "stance") {
                                state.log.push(`<span style="color:#FFC107;">${p.name} は ${skill.name} をとった！</span>`);
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                                if (skill.mode === 'high') p.buffAtk += 0.5; else if (skill.mode === 'low') p.buffDef += 0.5; else if (skill.mode === 'evade_r' || skill.mode === 'evade_l') p.accBoost = true;
                                render(); await wait(200);
                            }
                            else if (skill.type === "escape") {
                                state.log.push(`<span style="color:#ff5252;">${p.name} は光の速さで戦線から一時離脱した！</span>`);
                                p.exploreOriginalTurn = 3; p.exploreTimer = 3; render(); await wait(500);
                            }
                            else if (chosenSkillName === "光") {
                                state.log.push(`<span style="color:#FFD700;">${p.name} は強烈な光を放ち、敵全体の目を眩ませた！</span>`);
                                if(!state.skipMode){ oppTeam.forEach(pt => { window.showArenaEffect(pt.id, 'debuff')}); await wait(500); }
                                oppTeam.forEach(pt => { pt.speed = Math.max(1, Math.floor((pt.speed||10) * 0.5)); });
                                state.isLightUsed = true; render(); await wait(200);
                            }
                            else if (skill.type === "debuff_def" || skill.type === "debuff_speed") {
                                if (oppTeam.length > 0) {
                                    let t = oppTeam[Math.floor(Math.random() * oppTeam.length)];
                                    state.log.push(`<span style="color:#9C27B0;">${t.name} の弱点を突いた！</span>`);
                                    if(!state.skipMode){ window.showArenaEffect(t.id, 'debuff'); await wait(500); }
                                    t.def = Math.max(0, Math.floor(t.def * 0.8)); t.speed = Math.max(1, Math.floor((t.speed||10) * 0.8));
                                }
                                render(); await wait(200);
                            }
                            else if (skill.type === "buff_next_atk") {
                                state.log.push(`<span style="color:#FFC107;">武器を強化した！次の攻撃が超絶アップ！</span>`);
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                                p.nextAtkBoost = 2.5; render(); await wait(200);
                            }
                            else if (skill.type === "provoke") {
                                state.log.push(`<span style="color:#ff5252;">${p.name} は大声で名乗りを上げ、注意を引いた！</span>`);
                                p.hateBoost = true; render(); await wait(500);
                            }
                            else if (skill.type === "use_item") {
                                state.log.push(`<span style="color:#76ff03;">手持ちのアイテムを使った！HPが回復！</span>`);
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); }
                                p.hp = Math.min(p.maxHp, p.hp + 50); render(); await wait(200);
                            }
                            else if (skill.type === "buff" || skill.type === "buff_speed") {
                                state.log.push(`<span style="color:#FFC107;">気合が入り、能力がアップした！</span>`); 
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                                if (skill.stat === 'atk') p.buffAtk += 0.5; if (skill.stat === 'intel') p.buffIntel += 0.5;
                                if (skill.stat === 'speed' || skill.type === "buff_speed") p.speed = (p.speed||10) + 10;
                                render(); await wait(200);
                            }
                            else if (skill.type === "debuff_all") {
                                state.log.push(`<span style="color:#9C27B0;">味方陣営の攻撃力がダウンさせられた！</span>`);
                                if(!state.skipMode){ oppTeam.forEach(pt => { window.showArenaEffect(pt.id, 'debuff')}); await wait(500); }
                                oppTeam.forEach(pt => { pt.buffAtk = Math.max(0.5, (pt.buffAtk||1) - 0.2); });
                                render(); await wait(200);
                            }
                            else if (skill.type === "gold_earn") {
                                state.log.push(`<span style="color:#FFD700;">${p.name} は戦闘中に小銭を稼いだ！</span>`);
                                render(); await wait(500);
                            }
                            else if (skill.type === "reflect") {
                                state.log.push(`<span style="color:#ff5252;">次に受ける魔法をそのまま弾き返す鏡を展開した！</span>`);
                                p.reflect = true; render(); await wait(500);
                            }
                            else if (skill.type === "dodge") {
                                state.log.push(`<span style="color:#ff5252;">${p.name} は未来を予測し、絶対回避の体勢をとった！</span>`);
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                                p.absoluteDodge = true; render(); await wait(200);
                            }
                            else if (skill.type === "buff_party") {
                                state.log.push(`<span style="color:#FFC107;">敵陣営全体の素早さがアップ！</span>`);
                                if(!state.skipMode){ myTeam.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'buff')}); await wait(500); }
                                myTeam.forEach(en => { if(en.hp>0 && en.exploreTimer===0) en.speed = (en.speed||10) + 10; });
                                render(); await wait(200);
                            }
                            else if (skill.type === "cure_party") {
                                state.log.push(`<span style="color:#76ff03;">敵陣営全体のデバフと状態異常が洗い流された！</span>`);
                                if(!state.skipMode){ myTeam.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                                myTeam.forEach(en => { 
                                    if(en.hp>0 && en.exploreTimer===0) { en.def = Math.max(en.def, 10); en.speed = Math.max(en.speed, 10); en.poisonTimer = 0; en.doomTimer = 0; }
                                }); 
                                render(); await wait(200);
                            }
                            else if (skill.type === "trap") {
                                state.log.push(`<span style="color:#FF9800;">${p.name} は足元に罠を設置した！</span>`);
                                p.trapActive = true; render(); await wait(500);
                            }
                            else if (skill.type === "roulette") {
                                state.log.push(`<span style="color:#E91E63; font-weight:bold;">🎲 ギャンブル発動！ 何が起こるかわからない！</span>`);
                                if(!state.skipMode) await wait(500);
                                if (Math.random() < 0.5) {
                                    state.log.push(`<span style="color:#76ff03;">奇跡の光が降り注ぎ、敵陣営が完全回復！</span>`);
                                    myTeam.forEach(en => { if(en.hp>0) { en.hp = en.maxHp; en.mp = en.maxMp; en.buffAtk += 0.5; }});
                                } else {
                                    state.log.push(`<span style="color:#ff5252; font-weight:bold;">超巨大隕石が直撃し、味方全体が消し飛んだ！！！</span>`);
                                    oppTeam.forEach(pt => { pt.hp -= 999999; pt.flash = true; });
                                }
                                render(); await wait(500); oppTeam.forEach(pt => pt.flash = false); render();
                            }
                            else if (skill.type === "full_heal_party") {
                                state.log.push(`<span style="color:#76ff03; font-weight:bold;">豪華な食事が振る舞われ、敵陣営が完全回復＋超強化！</span>`);
                                if(!state.skipMode){ myTeam.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                                myTeam.forEach(en => { if(en.hp>0 && en.exploreTimer===0) { en.hp = en.maxHp; en.mp = en.maxMp; en.buffAtk += 0.5; en.buffIntel += 0.5; }});
                                render(); await wait(200);
                            }
                            else if (skill.type === "buy_mercenary") {
                                if (myTeam.filter(en => en.hp > 0).length < 8) {
                                    state.log.push(`<span style="color:#FFD700;">ゴールドを支払い、屈強な傭兵を雇った！</span>`);
                                    let gHp = Math.max(10, Math.floor(p.maxHp)); 
                                    myTeam.push({ id: `e_merc_${Date.now()}`, baseName: "城の兵士", name: "幻影の傭兵", spriteKey: "arena_soldier", type: 'soldier', hp: gHp*2, maxHp: gHp*2, actionGauge: 0, speed: 60, atk: Math.max(10, Math.floor(p.atk * 0.8)), def: Math.max(10, Math.floor(p.def * 0.8)), buffAtk: 1.0, buffDef: 1.0, row: 'back' }); 
                                } else {
                                    state.log.push(`<span style="color:#aaa;">しかしこれ以上は現れなかった...</span>`);
                                }
                                render(); await wait(500);
                            }
                            else if (skill.type === "sleep") { p.isSleeping = true; state.log.push(`<span style="color:#aaa;">${p.name} は その場でぐっすり眠りについた...💤</span>`); render(); await wait(500); }
                            else if (skill.type === "summon") {
                                if (myTeam.filter(en => en.hp > 0).length < 8) {
                                    let masterHP = Math.max(10, Math.floor(p.maxHp * (skill.master === 'farming' ? 1.5 : 0.3))); 
                                    let masterName = "";
                                    switch (skill.master) {
                                        case 'farming': masterName = '身代わりカボチャ'; break;
                                        case 'soldier': masterName = '城の兵士'; break;
                                        case 'captain': masterName = '城の隊長'; break;
                                        case 'king': masterName = '王様'; break;
                                        case 'cooking': masterName = '料理人'; break;
                                        case 'smithing': masterName = '鍛冶師'; break;
                                        case 'fishing': masterName = '漁師'; break;
                                        case 'explore': masterName = '冒険家'; break;
                                        case 'building': masterName = '建築士'; break;
                                        default: masterName = '助っ人';
                                    }
                                    myTeam.push({ id: `e_sum_${skill.master}_${Date.now()}`, baseName: masterName, name: `幻影の${masterName}`, spriteKey: "arena_" + skill.master, type: skill.master, hp: masterHP, maxHp: masterHP, actionGauge: 0, speed: 40, atk: Math.max(10, Math.floor(p.atk * 0.8)), def: Math.max(10, Math.floor(p.def * 0.8)), buffAtk: 1.0, buffDef: 1.0, row: 'back' });
                                    state.log.push(`<span style="color:#E91E63; font-weight:bold;">${skill.name}により敵陣営に幻影の${masterName}が駆けつけた！！</span>`);
                                } else {
                                    state.log.push(`<span style="color:#aaa;">しかしこれ以上は現れなかった...</span>`);
                                }
                                render(); await wait(500);
                            }
                            else if (skill.type === "call_rescue") {
                                if (myTeam.filter(en => en.hp > 0).length < 8) {
                                    let rTypes = ['soldier', 'soldier', 'captain', 'king']; let gType = rTypes[Math.floor(Math.random() * rTypes.length)];
                                    let gHp = Math.floor(p.maxHp * (gType === 'captain' ? 0.8 : (gType === 'soldier' ? 0.5 : 0.3))); gHp = Math.max(10, gHp);
                                    let rName = gType === 'captain' ? '城の隊長' : (gType === 'king' ? '王様' : '城の兵士');
                                    myTeam.push({ id: `e_res_${gType}_${Date.now()}`, baseName: rName, name: `幻影の${rName}`, spriteKey: "arena_" + gType, type: gType, hp: gHp, maxHp: gHp, actionGauge: 0, speed: 45, atk: Math.max(10, Math.floor(p.atk * 0.8)), def: Math.max(10, Math.floor(p.def * 0.8)), buffAtk: 1.0, buffDef: 1.0, row: 'back' }); 
                                    state.log.push(`<span style="color:#FFD700; font-weight:bold;">敵陣営に援軍（幻影の${rName}）が到着した！</span>`); 
                                } else {
                                    state.log.push(`<span style="color:#aaa;">しかしこれ以上は現れなかった...</span>`);
                                }
                                render(); await wait(500);
                            }
                            else if (skill.type === "build_hut") { p.hutHp = 5; state.log.push(`<span style="color:#ff5252;">${p.name} は頑丈な小屋に立てこもった！(🏠)</span>`); render(); await wait(500); }
                            else if (skill.type === "build_bridge") { myTeam.forEach(en => { if (en.hp > 0 && en.exploreTimer === 0) en.row = 'back'; }); state.log.push(`<span style="color:#ff5252;">橋を架けて敵全員が後衛に退避した！</span>`); render(); await wait(500); }
                            else if (skill.type === "build_farm") { state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">急いで畑を耕した！</span>`); render(); await wait(500); }
                            else if (skill.type === "random_build") {
                                let rnd = Math.random();
                                if (rnd < 0.25) { p.hutHp = 5; state.log.push(`<span style="color:#ff5252;">小屋が完成し中に立てこもった！</span>`); }
                                else if (rnd < 0.5) { myTeam.forEach(en => en.row = 'back'); state.log.push(`<span style="color:#ff5252;">橋が完成し全員で後衛に退避した！</span>`); }
                                else if (rnd < 0.75) { state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">畑が完成した！収穫を待とう...</span>`); }
                                else { 
                                    if (myTeam.filter(en => en.hp > 0).length < 8) {
                                        let bHp = Math.max(10, Math.floor(p.maxHp * 0.5)); 
                                        myTeam.push({ id: `e_sol_${Date.now()}`, baseName: "城の兵士", name: "幻影の城の兵士", spriteKey: "arena_soldier", type: 'soldier', hp: bHp, maxHp: bHp, actionGauge: 0, speed: 45, atk: Math.max(10, Math.floor(p.atk * 0.8)), def: Math.max(10, Math.floor(p.def * 0.8)), buffAtk: 1.0, buffDef: 1.0, row: 'back' }); 
                                        state.log.push(`<span style="color:#FFD700;">城の設備を作り兵士を呼び込んだ！</span>`); 
                                    } else {
                                        state.log.push(`<span style="color:#aaa;">しかしこれ以上は現れなかった...</span>`);
                                    }
                                }
                                render(); await wait(500);
                            }
                            else if (skill.type === "explore") { p.exploreOriginalTurn = 2 + Math.floor(Math.random() * 3); p.exploreTimer = p.exploreOriginalTurn; state.log.push(`<span style="color:#E040FB;">「ちょっと探検してくる！」 ${p.name} は戦場から姿を消した...</span>`); render(); await wait(500); }
                            else if (skill.type === "fishing") {
                                let r = Math.random();
                                if (r < 0.33) {
                                    if (oppTeam.length > 0) {
                                        let t = oppTeam[Math.floor(Math.random() * oppTeam.length)];
                                        let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                                        if (Math.random() < dodgeChance) { state.log.push(`<span style="color:#aaa;">大物が釣れたが、${t.name} は素早く躱した！(MISS)</span>`); } 
                                        else { 
                                            let fishDmg = Math.max(30, Math.floor(p.atk * p.buffAtk * 0.6)); 
                                            state.log.push(`<span style="color:#ff5252;">大物が釣れた！暴れる魚が ${t.name} に ${fishDmg} ダメージ！🎣</span>`); 
                                            if (!state.skipMode) { window.showArenaEffect(t.id, 'fishing'); await wait(600); }
                                            t.hp -= fishDmg; t.flash = true; render(); await wait(400); t.flash = false; render(); await wait(200); 
                                        }
                                    }
                                } else if (r < 0.66) { p.hp = Math.min(p.maxHp, p.hp + Math.max(40, Math.floor(p.maxHp * 0.2))); state.log.push(`<span style="color:#76ff03;">新鮮な魚を食べてHP回復！🍣</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); } render(); } 
                                else { state.log.push(`<span style="color:#aaa;">...空き缶が釣れた。(失敗)</span>`); render(); await wait(500); }
                            }
                            else if (skill.type === "eat") { state.log.push(`<span style="color:#76ff03;">食料を食べてHPとMPが大回復！🍖</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(500); } p.hp = Math.min(p.maxHp, p.hp + Math.max(50, Math.floor(p.maxHp * 0.25))); p.mp = Math.min(p.maxMp||100, p.mp + Math.max(20, Math.floor((p.maxMp||100) * 0.15))); render(); await wait(200); }
                            else if (skill.type === "equip") { state.log.push(`<span style="color:#FFC107;">武器を構えた！攻撃力大幅アップ！🗡️</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); } p.buffAtk += 0.5; p.isEquipped = true; render(); await wait(200); }
                            else if (skill.type === "unequip") { if (p.isEquipped) { p.buffAtk = Math.max(1.0, p.buffAtk - 0.5); p.isEquipped = false; state.log.push(`<span style="color:#aaa;">重い装備を外して身軽になった。</span>`); } else { state.log.push(`<span style="color:#aaa;">しかし何も装備していなかった。</span>`); } render(); await wait(500); }
                            else if (skill.type === "magic_ice" || skill.type === "magic_water" || skill.type === "magic_fire" || skill.type === "magic_light" || skill.type === "magic_earth" || skill.type === "magic_poison" || skill.type === "magic_random") {
                                let isAll = skill.target === "all" || skill.target === "random";
                                let targets = isAll ? oppTeam : [oppTeam[Math.floor(Math.random() * oppTeam.length)]];
                                state.log.push(`<span style="color:#ff5252; font-weight:bold;">🔥 ${p.name} の【${skill.name}】！</span>`);
                                render(); if(!state.skipMode) await wait(300);
                                
                                for (let t of targets) {
                                    if (t && t.hp <= 0) continue;
                                    if (!state.skipMode) { window.showArenaEffect(t.id, 'magic'); await wait(200); }
                                    
                                    let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed||10) - (p.speed||10)) * 0.05));
                                    if (Math.random() < dodgeChance && !p.accBoost) { 
                                        state.log.push(`<span style="color:#aaa;">${t.name} は魔法をヒラリと避けた！(MISS)</span>`);
                                        render(); if(!state.skipMode) await wait(200);
                                        continue; 
                                    }

                                    if (t.reflect || t.isMagicReflect) {
                                        state.log.push(`<span style="color:#00BCD4;">${t.name} は魔法を反射した！ ${p.name} に 9999 の即死ダメージ！</span>`);
                                        p.hp -= 9999; p.flash = true; t.reflect = false; t.isMagicReflect = false;
                                        render(); if(!state.skipMode) await wait(400);
                                        p.flash = false; render();
                                        if (p.hp <= 0) break;
                                        continue;
                                    }
                                    
                                    let dmgMultiplier = 1.0;
                                    let tBaseType = t.type ? t.type.split('_')[0] : '';
                                    if (tBaseType === 'ghost') dmgMultiplier *= 0.1;
                                    
                                    let pDef = t.isGuest ? Math.floor(avgDef * 0.5) : t.def;
                                    let dmg = Math.max(1, Math.floor(p.intel * (p.buffIntel||1.0) * (skill.power || 1.5) * dmgMultiplier) - Math.floor(pDef * 0.5));
                                    if (p.nextAtkBoost) { dmg = Math.floor(dmg * p.nextAtkBoost); }

                                    if (!t.isGuest && t.invincible) {
                                        dmg = 0; state.log.push(`<span style="color:#FFF;">${t.name} は金庫の中で魔法を完全にやり過ごした！</span>`);
                                    } else if (!t.isGuest) { 
                                        if (t.shield) { dmg = Math.floor(dmg / 2); t.shield = false; } 
                                        if (t.hutHp > 0) { dmg = Math.floor(dmg / 2); t.hutHp--; } 
                                    }
                                    
                                    t.hp -= dmg; 
                                    if(dmg > 0) {
                                        t.flash = true;
                                        state.log.push(`<span style="color:#ff5252;">${t.name} に ${dmg} のダメージ！</span>`);
                                    }
                                    
                                    if (skill.type === "magic_poison" && dmg > 0) t.buffAtk = Math.max(0.5, (t.buffAtk||1) - 0.1);
                                    if (skill.type === "blind" && dmg > 0) t.speed = Math.max(1, (t.speed||10) - 5);

                                    render(); if(!state.skipMode) { let ui = document.getElementById('arena-battle-ui'); if (ui && dmg>0) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 200); } await wait(300); }
                                    t.flash = false; render(); if(!state.skipMode) await wait(100);
                                }
                                p.nextAtkBoost = null; 
                            }
                            else if (skill.type === "attack_special" || skill.type === "attack_pierce" || skill.type === "heavy" || skill.type === "throw" || skill.type === "draw_card" || skill.type === "attack" || skill.type === "magic") {
                                if (oppTeam.length > 0) {
                                    let target = oppTeam[Math.floor(Math.random() * oppTeam.length)];
                                    let targets = skill.target === "all" ? oppTeam : [target];
                                    
                                    for (let t of targets) {
                                        if (t.hp <= 0) continue;
                                        if (!state.skipMode) { window.showArenaEffect(t.id, typeStr); await wait(200); }
                                        
                                        let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                                        let isPhysical = (skill.type === "attack" || skill.type === "heavy" || skill.type === "attack_pierce" || skill.type === "throw");
                                        
                                        if (!t.isGuest && t.absoluteDodge && isPhysical) dodgeChance = 1.0;

                                        if (skill.type !== "throw" && Math.random() < dodgeChance && !p.accBoost) { 
                                            if (!t.isGuest && t.absoluteDodge && isPhysical) {
                                                t.absoluteDodge = false;
                                                state.log.push(`<span style="color:#00BCD4;">${p.name} の攻撃！ しかし ${t.name} は完全に予測して躱した！(絶対回避)</span>`);
                                            } else {
                                                state.log.push(`<span style="color:#aaa;">${t.name} は攻撃をヒラリと避けた！(MISS)</span>`); 
                                            }
                                            render(); if (!state.skipMode) await wait(200);
                                            continue; 
                                        }
                                        
                                        let finalAtk = p.atk * (p.buffAtk||1.0); 
                                        if (skill.type === "magic" || skill.type === "draw_card") finalAtk = p.intel * (p.buffIntel||1.0);
                                        let dmgMultiplier = 1.0; 
                                        if (p.row === 'back' && (skill.type === "attack" || skill.type === "heavy")) dmgMultiplier = 0.7; 
                                        if (p.hutHp > 0) dmgMultiplier *= 0.8; 
                                        
                                        let isMagic = (skill.type === "magic" || skill.type === "magic_all" || skill.type === "draw_card" || skill.type === "heavy_magic");

                                        if (isMagic && (t.reflect || t.isMagicReflect)) {
                                            state.log.push(`<span style="color:#00BCD4;">${t.name} は魔法を反射した！ ${p.name} に 9999 の即死ダメージ！</span>`);
                                            p.hp -= 9999; p.flash = true; t.reflect = false; t.isMagicReflect = false;
                                            render(); if(!state.skipMode) await wait(400); p.flash = false; render();
                                            if (p.hp <= 0) break;
                                            continue;
                                        }

                                        let tBaseType = t.type ? t.type.split('_')[0] : ''; 
                                        if (isPhysical && tBaseType === 'stone') dmgMultiplier *= 0.1;
                                        if (isMagic && tBaseType === 'ghost') dmgMultiplier *= 0.1;
                                        if (t.isFlying && isPhysical && Math.random() < 0.5) {
                                            state.log.push(`<span style="color:#aaa;">${t.name} は上空へ飛び上がって回避した！(MISS)</span>`); 
                                            render(); if (!state.skipMode) await wait(200);
                                            continue;
                                        }

                                        let pDef = t.isGuest ? Math.floor(avgDef * 0.5) : t.def;
                                        let dmg = Math.max(1, Math.floor(finalAtk * (skill.power || 1.0) * dmgMultiplier) - Math.floor(pDef * 0.5));
                                        
                                        if (t.armorValue > 0) {
                                            if (skill.name === "鍛冶撃ち" || skill.name === "鍛冶師の呼出") {
                                                t.armorValue = 0; state.log.push(`<span style="color:#FF9800;">${t.name} の装甲を完全に破壊した！</span>`);
                                            } else { dmg = 1; }
                                        }

                                        if (skill.type === "attack_pierce" || skill.name === "鍛冶撃ち" || skill.name === "鍛冶師の呼出") {
                                            dmg = Math.max(1, Math.floor(finalAtk * (skill.power || 1.2))); 
                                        }
                                        if (skill.type === "throw") dmg = Math.max(10, Math.floor(p.atk * 1.5)); 
                                        if (p.nextAtkBoost) { dmg = Math.floor(dmg * p.nextAtkBoost); }
                                        
                                        if (tBaseType === 'ghost' && skill.type.includes("heal")) {
                                            dmg = 9999; state.log.push(`<span style="color:#FFC107;">回復の光がアンデッドを焼き尽くす！</span>`);
                                        }

                                        if (!t.isGuest && t.invincible) {
                                            dmg = 0; state.log.push(`<span style="color:#FFF;">${t.name} は金庫の中で完全に攻撃をやり過ごした！</span>`);
                                        } else if (!t.isGuest) { 
                                            if (t.shield) { dmg = Math.floor(dmg / 2); t.shield = false; } 
                                            if (t.hutHp > 0) { dmg = Math.floor(dmg / 2); t.hutHp--; } 
                                        }

                                        t.hp -= dmg; 
                                        if(dmg > 0) {
                                            t.flash = true;
                                            state.log.push(`<span style="color:#ff5252;">${skill.name}！ ${t.name} に ${dmg} のダメージ！</span>`);
                                        }

                                        render(); 
                                        if (!state.skipMode && dmg > 0) { let ui = document.getElementById('arena-battle-ui'); if (ui) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 200); } await wait(300); } 
                                        t.flash = false; 
                                        render(); 
                                        if (!state.skipMode) await wait(100); 
                                    }
                                    p.nextAtkBoost = null; 
                                }
                            }
                            else if (skill.type === "shield" || skill.type === "invincible" || skill.type === "defend") {
                                state.log.push(`<span style="color:#ff5252;">${p.name} は ${skill.name} を展開した！</span>`);
                                if(!state.skipMode){ window.showArenaEffect(p.id, 'buff'); await wait(500); }
                                p.shield = true; 
                                if (skill.type === "invincible") p.invincible = true;
                                render(); await wait(200);
                            }
                            else if (skill.type === "regen_party") {
                                state.log.push(`<span style="color:#ff5252;">敵陣営全体にリジェネ（継続回復）が付与された！</span>`);
                                if(!state.skipMode){ myTeam.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                                myTeam.forEach(en => { if(en.hp>0 && en.exploreTimer===0) en.regen = true; });
                                render(); await wait(200);
                            }
                            else if (skill.type === "heal") { state.log.push(`<span style="color:#ff5252;">${p.name} のHPが回復した！</span>`); if(!state.skipMode){ window.showArenaEffect(p.id, 'heal'); await wait(600); } p.hp = Math.min(p.maxHp, p.hp + skill.power + Math.floor(p.intel * (p.buffIntel||1.0) * 0.5)); render(); await wait(200); } 
                            else if (skill.type === "heal_all" || skill.type === "heal_party") { state.log.push(`<span style="color:#ff5252;">敵陣営全員のHPが回復した！</span>`); if(!state.skipMode){ myTeam.forEach(en => { if(en.hp > 0 && (en.exploreTimer||0) === 0) window.showArenaEffect(en.id, 'heal'); }); await wait(600); } for (let en of myTeam) { if(en.hp > 0 && (en.exploreTimer||0) === 0) en.hp = Math.min(en.maxHp, en.hp + skill.power + Math.floor(p.intel * (en.buffIntel||1.0) * 0.3)); } render(); await wait(200); } 
                        }
                        
                        actionType = "FRIEND_DONE";
                    } else {
                        // ★追加：フレンドが召喚した「幻影の助っ人」たちのアクション処理（通常攻撃しかしないのを防ぐ）
                        if (['cooking', 'building', 'king', 'farming', 'smithing', 'fishing', 'explore', 'soldier', 'captain'].includes(e.type) && (e.name||"").includes("幻影")) {
                            if (e.type === 'soldier') { actionType = "heavy"; skillName = "城の兵士の攻撃"; baseAtk = e.atk; }
                            else if (e.type === 'captain') { actionType = "heavy"; skillName = "城の隊長の強撃"; baseAtk = e.atk * 1.5; }
                            else if (e.type === 'king') { 
                                actionType = "buff_party"; skillName = "王様の号令"; 
                                if (!state.skipMode) window.showArenaEffect(e.id, 'buff');
                            }
                            else if (e.type === 'cooking') { 
                                actionType = "heal_party"; skillName = "特製スープ"; 
                                let healAmount = Math.max(20, Math.floor(e.maxHp * 0.15));
                                state.enemies.forEach(en => { if(en.hp>0) en.hp = Math.min(en.maxHp, en.hp + healAmount); });
                            }
                            else if (e.type === 'smithing') { actionType = "heavy"; skillName = "鍛冶師のハンマー"; baseAtk = e.atk * 1.2; }
                            else if (e.type === 'fishing') { actionType = "fishing"; skillName = "大物釣り"; }
                            else if (e.type === 'explore') { actionType = "debuff_def"; skillName = "罠設置"; }
                            else if (e.type === 'building') { 
                                actionType = "shield"; skillName = "防壁展開"; 
                                state.enemies.forEach(en => { if(en.hp>0 && en.exploreTimer===0) en.shield = true; });
                                state.log.push(`<span style="color:#FFD700;">敵陣営に防壁が展開された！(🧱)</span>`);
                            }
                            else if (e.type === 'farming') { actionType = "provoke"; skillName = "ぷるぷる揺れる"; e.hateBoost = true; }
                        }
                        else if (e.type === 'robot') { if (r < 0.3) { actionType = "heavy"; skillName = "ロケットパンチ"; } else if (r < 0.5) { actionType = "buff_atk"; skillName = "リミッター解除"; } }
                        else if (e.type === 'dragon') { if (r < 0.4) { actionType = "magic_all"; skillName = "火炎の息"; } else if (r < 0.7) { actionType = "heavy"; skillName = "噛み砕く"; } }
                        else if (e.type === 'magician') { if (r < 0.4) { actionType = "heavy_magic"; skillName = "ファイアボルト"; } else if (r < 0.6) { actionType = "heal_ally"; skillName = "ヒール"; } }
                        else if (e.type === 'stone') { if (r < 0.3) { actionType = "magic_all"; skillName = "大地震"; } else if (r < 0.6) { actionType = "buff_def"; skillName = "硬化"; } }
                        else if (e.type === 'bird') { if (r < 0.4) { actionType = "magic_all"; skillName = "突風"; } }
                        else if (e.type === 'beetle') { if (r < 0.4) { actionType = "heavy"; skillName = "ホーンタックル"; } else if (r < 0.7) { actionType = "buff_def"; skillName = "甲殻防御"; } }
                        else if (e.type === 'spirit') { if (r < 0.3) { actionType = "magic_all"; skillName = "自然の怒り"; } else if (r < 0.6) { actionType = "heal_all"; skillName = "癒やしの光"; } }
                        else if (e.type === 'seed') { if (r < 0.3) { actionType = "summon_enemy"; skillName = "増殖"; } else if (r < 0.6) { actionType = "heavy"; skillName = "ポイズンシード"; } else if (r < 0.8) { actionType = "heal_self"; skillName = "光合成"; } }
                        else if (e.type === 'balloon') { if (r < 0.3) { actionType = "summon_enemy"; skillName = "仲間を呼ぶ"; } else if (r < 0.6) { actionType = "heavy"; skillName = "のしかかり"; } else if (r < 0.8) { actionType = "heal_self"; skillName = "分裂の構え"; } }
                        else if (e.type === 'machine') { if (r < 0.4) { actionType = "buff_atk"; skillName = "ゼンマイ巻き"; } else if (r < 0.7) { actionType = "magic_all"; skillName = "回転アタック"; } }
                        else if (e.type === 'ghost') { if (r < 0.3) { actionType = "summon_enemy"; skillName = "霊体召喚"; } else if (r < 0.6) { actionType = "magic_all"; skillName = "ポルターガイスト"; } else if (r < 0.8) { actionType = "debuff_def"; skillName = "呪い"; } }
                    }

                    if (!e.isFriend && actionType !== "attack" && actionType !== "heavy" && actionType !== "heavy_magic" && actionType !== "magic_all") {
                        state.log.push(`<span style="color:#ff5252; font-weight:bold;">🔥 ${e.name} の【${skillName}】！</span>`);
                    }

                    if (actionType === "move") { let skill = window.ARENA_SKILLS[skillName]; if (skill && skill.dir === 'up') e.row = 'front'; if (skill && skill.dir === 'down') e.row = 'back'; render(); await wait(600); } 
                    else if (actionType === "buff" || actionType === "buff_atk" || actionType === "buff_speed") {
                        if(!state.skipMode){ window.showArenaEffect(e.id, 'buff'); await wait(500); }
                        let skill = window.ARENA_SKILLS[skillName];
                        if (skill && skill.stat === 'intel') e.buffDef = (e.buffDef||1) + 0.5;
                        else if (skill && (skill.stat === 'speed' || actionType === "buff_speed")) e.speed = (e.speed||10) + 10;
                        else e.buffAtk = (e.buffAtk||1) + 0.5;
                        render(); await wait(200);
                    }
                    else if (actionType === "sleep") { e.isSleeping = true; state.log.push(`<span style="color:#ff5252;">${e.name} は眠りについた...💤</span>`); render(); await wait(600); } 
                    else if (actionType === "summon" || actionType === "call_rescue") {
                        let masterType = actionType === "call_rescue" ? ['soldier', 'captain', 'king'][Math.floor(Math.random() * 3)] : (window.ARENA_SKILLS[skillName] ? window.ARENA_SKILLS[skillName].master : 'soldier');
                        let gHp = Math.floor(avgHp * 0.5); gHp = Math.max(10, gHp);
                        state.enemies.push({ id: `e_${state.enemies.length}_${Date.now()}`, baseName: "幻影の助っ人", name: "幻影の助っ人", spriteKey: "arena_" + masterType, type: masterType, hp: gHp, maxHp: gHp, atk: Math.floor(avgAtk*0.5), def: Math.floor(avgDef*0.5), speed: e.speed, buffAtk: 1.0, buffDef: 1.0, row: 'back', actionGauge: 0 });
                        state.log.push(`<span style="color:#00BCD4;">新たな魔物が現れた！</span>`); render(); await wait(800); 
                    } 
                    else if (actionType === "build_hut") { e.hutHp = 5; state.log.push(`<span style="color:#ff5252;">小屋に立てこもった！(🏠)</span>`); render(); await wait(600); } 
                    else if (actionType === "build_bridge") { state.enemies.forEach(en => { if (en.hp > 0 && en.exploreTimer === 0) en.row = 'back'; }); state.log.push(`<span style="color:#ff5252;">敵全員が後衛に退避した！</span>`); render(); await wait(600); } 
                    else if (actionType === "build_farm") { if(!state.skipMode){ state.enemies.forEach(en=>{ if(en.hp>0) window.showArenaEffect(en.id, 'heal'); }); await wait(500); } state.enemies.forEach(en => { if(en.hp > 0) en.hp = Math.min(en.maxHp, en.hp + Math.max(50, Math.floor(en.maxHp * 0.15))); }); render(); await wait(200); } 
                    else if (actionType === "random_build") { let rnd = Math.random(); if (rnd < 0.33) { e.hutHp = 5; } else if (rnd < 0.66) { state.enemies.forEach(en => en.row = 'back'); } else { e.shield = true; } render(); await wait(600); } 
                    else if (actionType === "explore") { e.exploreOriginalTurn = 2 + Math.floor(Math.random() * 3); e.exploreTimer = e.exploreOriginalTurn; state.log.push(`<span style="color:#ff5252;">戦場から姿を消した... (探検中)</span>`); render(); await wait(600); } 
                    else if (actionType === "fishing") {
                        let r = Math.random();
                        if (r < 0.33) {
                            let dodgeChance = Math.min(0.8, Math.max(0, ((targetObj.speed||10) - (e.speed||10)) * 0.05));
                            if (Math.random() < dodgeChance) { state.log.push(`<span style="color:#aaa;">敵の釣りを ${targetObj.name||"味方"} は避けた！(MISS)</span>`); } 
                            else { 
                                targetObj.flash = true; let fishDmg = Math.max(30, Math.floor(e.atk * e.buffAtk * 0.6)); targetObj.hp -= fishDmg; 
                                state.log.push(`<span style="color:#ff5252;">釣った大物が ${targetObj.name||"味方"} に ${fishDmg} ダメージ！🎣</span>`); 
                                if (!state.skipMode) { window.showArenaEffect(targetObj.id, 'fishing'); await wait(600); }
                                render(); await wait(400); targetObj.flash = false; render(); await wait(200); 
                            }
                        } else if (r < 0.66) { if(!state.skipMode){ window.showArenaEffect(e.id, 'heal'); await wait(500); } e.hp = Math.min(e.maxHp, e.hp + Math.max(40, Math.floor(e.maxHp * 0.2))); state.log.push(`<span style="color:#ff5252;">魚を食べてHP回復！🍣</span>`); render(); await wait(200); } 
                        else { state.log.push(`<span style="color:#aaa;">空き缶を釣った。(失敗)</span>`); render(); await wait(600); }
                    } 
                    else if (actionType === "eat") { if(!state.skipMode){ window.showArenaEffect(e.id, 'heal'); await wait(500); } e.hp = Math.min(e.maxHp, e.hp + Math.max(50, Math.floor(e.maxHp * 0.25))); e.mp = Math.min(e.maxMp || 100, (e.mp || 0) + Math.max(20, Math.floor((e.maxMp||100) * 0.15))); state.log.push(`<span style="color:#ff5252;">食料を食べて回復した！🍖</span>`); render(); await wait(200); } 
                    else if (actionType === "equip") { if(!state.skipMode){ window.showArenaEffect(e.id, 'buff'); await wait(500); } e.buffAtk = (e.buffAtk||1) + 0.5; e.isEquipped = true; state.log.push(`<span style="color:#ff5252;">武器を構えた！攻撃力大幅アップ！🗡️</span>`); render(); await wait(200); } 
                    else if (actionType === "unequip") { if (e.isEquipped) { e.buffAtk = Math.max(1.0, e.buffAtk - 0.5); e.isEquipped = false; } render(); await wait(600); } 
                    else if (actionType === "defend" || actionType === "buff_def" || actionType === "shield" || actionType === "invincible") {
                        if(!state.skipMode){ window.showArenaEffect(e.id, 'buff'); await wait(500); }
                        e.shield = true; 
                        if (actionType === "invincible") e.invincible = true;
                        state.log.push(`<span style="color:#ff5252;">身を固めている！（次ダメージ半減・無効）</span>`); render(); await wait(200);
                    } 
                    else if (actionType === "heal_all" || actionType === "heal_party") { if(!state.skipMode){ state.enemies.forEach(en=>{ if(en.hp>0) window.showArenaEffect(en.id, 'heal'); }); await wait(500); } let healAmount = Math.floor(e.maxHp * 0.2); state.enemies.forEach(en => { if(en.hp>0) en.hp = Math.min(en.maxHp, en.hp + healAmount); }); render(); await wait(200); } 
                    else if (actionType === "heal_ally" || actionType === "heal_self" || actionType === "heal") {
                        let healAmount = Math.floor(e.maxHp * 0.2);
                        if (actionType === "heal_ally") { 
                            let lowestE = state.enemies.filter(en=>en.hp>0).sort((a,b)=>a.hp-b.hp)[0]; 
                            if(lowestE) { if(!state.skipMode){ window.showArenaEffect(lowestE.id, 'heal'); await wait(500); } lowestE.hp = Math.min(lowestE.maxHp, lowestE.hp + healAmount); } 
                        } else { 
                            if(!state.skipMode){ window.showArenaEffect(e.id, 'heal'); await wait(500); } e.hp = Math.min(e.maxHp, e.hp + healAmount); 
                        }
                        render(); await wait(200); 
                    } 
                    else if (actionType === "debuff_def" || actionType === "debuff_speed") { 
                        if(!state.skipMode){ state.party.forEach(pt=>{ if(pt.hp>0) window.showArenaEffect(pt.id, 'debuff'); }); await wait(500); } 
                        state.party.forEach(pt => { 
                            if(pt.hp > 0) {
                                pt.def = Math.max(0, Math.floor(pt.def * 0.9)); 
                                if (actionType === "debuff_speed") pt.speed = Math.max(1, Math.floor(pt.speed * 0.8));
                                if (skillName.includes("死") || skillName.includes("終焉") || skillName.includes("呪")) pt.doomTimer = 4;
                                else if (skillName.includes("毒") || skillName.includes("ガス") || skillName.includes("酸") || skillName.includes("腐")) pt.poisonTimer = 3;
                            }
                        }); 
                        state.log.push(`<span style="color:#9C27B0;">味方全体の能力が下がり、さらに状態異常が付与された！</span>`); render(); await wait(200); 
                    }
                    else if (actionType === "debuff_all") {
                        if(!state.skipMode){ state.party.forEach(pt => {if(pt.hp>0) window.showArenaEffect(pt.id, 'debuff')}); await wait(500); }
                        state.party.forEach(pt => { if(pt.hp>0) pt.buffAtk = Math.max(0.5, (pt.buffAtk||1) - 0.2); });
                        state.log.push(`<span style="color:#9C27B0;">味方全体の攻撃力がダウン！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "summon_enemy") {
                        if (state.enemies.filter(en => en.hp > 0).length < 8 && !e.isBoss && !e.isFriend && !(e.name || "").includes("の分身")) {
                            let eHp = Math.floor(e.maxHp * 0.5);
                            let cloneName = (e.name || "").includes("の分身") ? e.name : e.name + " の分身";
                            let newEnemy = { id: `e_summon_${Date.now()}`, baseName: e.baseName, name: cloneName, spriteKey: e.spriteKey, type: e.type, hp: eHp, maxHp: eHp, atk: Math.floor(e.atk*0.8), def: Math.floor(e.def*0.8), speed: e.speed, buffAtk: 1.0, buffDef: 1.0, row: 'back', actionGauge: 0 };
                            let deadIndex = state.enemies.findIndex(en => en.hp <= 0);
                            if (deadIndex !== -1) state.enemies[deadIndex] = newEnemy;
                            else state.enemies.push(newEnemy);
                            state.log.push(`<span style="color:#00BCD4;">新たな魔物が現れた！</span>`); render(); await wait(800); 
                        } else { 
                            state.log.push(`<span style="color:#aaa;">しかしこれ以上は現れなかった...</span>`); render(); await wait(800); 
                        }
                    }
                    // ★追加：フレンド・AI特有の支援スキル群（図面、光、金庫、反射など）
                    else if (actionType === "reflect") {
                        e.reflect = true; state.log.push(`<span style="color:#ff5252;">魔法を弾き返す鏡を展開した！</span>`); render(); await wait(500);
                    }
                    else if (actionType === "dodge") {
                        if(!state.skipMode){ window.showArenaEffect(e.id, 'buff'); await wait(500); }
                        e.absoluteDodge = true; state.log.push(`<span style="color:#ff5252;">絶対回避の体勢をとった！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "buff_next_atk") {
                        if(!state.skipMode){ window.showArenaEffect(e.id, 'buff'); await wait(500); }
                        e.nextAtkBoost = 2.5; state.log.push(`<span style="color:#ff5252;">次の攻撃を超絶アップ！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "provoke") {
                        e.hateBoost = true; state.log.push(`<span style="color:#ff5252;">大声で味方の注意を引いた！</span>`); render(); await wait(500);
                    }
                    else if (actionType === "buff_party") {
                        if(!state.skipMode){ state.enemies.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'buff')}); await wait(500); }
                        state.enemies.forEach(en => { if(en.hp>0 && en.exploreTimer===0) en.speed = (en.speed||10) + 10; });
                        state.log.push(`<span style="color:#ff5252;">敵陣営全体の素早さがアップ！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "cure_party") {
                        if(!state.skipMode){ state.enemies.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                        state.enemies.forEach(en => { 
                            if(en.hp>0 && en.exploreTimer===0) { en.def = Math.max(en.def, 10); en.speed = Math.max(en.speed, 10); en.poisonTimer = 0; en.doomTimer = 0; }
                        });
                        state.log.push(`<span style="color:#ff5252;">敵陣営全体のデバフが浄化された！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "trap") {
                        e.trapActive = true; state.log.push(`<span style="color:#ff5252;">足元に罠を設置した！</span>`); render(); await wait(500);
                    }
                    else if (actionType === "roulette") {
                        if(!state.skipMode) await wait(500);
                        if (Math.random() < 0.5) {
                            state.log.push(`<span style="color:#ff5252;">奇跡の光が降り注ぎ、敵陣営が完全回復！</span>`);
                            state.enemies.forEach(en => { if(en.hp>0) { en.hp = en.maxHp; en.mp = en.maxMp; en.buffAtk += 0.5; }});
                        } else {
                            state.log.push(`<span style="color:#00BCD4; font-weight:bold;">超巨大隕石が直撃し、味方全体が消し飛んだ！！！</span>`);
                            state.party.forEach(pt => { if(pt.hp>0 && pt.exploreTimer===0) { pt.hp -= 999999; pt.flash = true; }});
                        }
                        render(); await wait(500); state.party.forEach(pt => pt.flash = false); render();
                    }
                    else if (actionType === "full_heal_party") {
                        if(!state.skipMode){ state.enemies.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                        state.enemies.forEach(en => { if(en.hp>0 && en.exploreTimer===0) { en.hp = en.maxHp; en.mp = en.maxMp; en.buffAtk += 0.5; en.buffDef += 0.5; }});
                        state.log.push(`<span style="color:#ff5252;">豪華な食事で敵陣営が完全回復！</span>`); render(); await wait(200);
                    }
                    else if (actionType === "buy_mercenary") {
                        let gHp = Math.max(10, Math.floor(avgHp)); 
                        state.enemies.push({ id: `e_merc_${Date.now()}`, baseName: "傭兵", name: "雇われた傭兵", spriteKey: "arena_soldier", type: "soldier", hp: gHp*2, maxHp: gHp*2, atk: Math.floor(avgAtk), def: Math.floor(avgDef), speed: 60, buffAtk: 1.0, buffDef: 1.0, row: 'back', actionGauge: 0 }); 
                        state.log.push(`<span style="color:#ff5252;">強力な傭兵が現れた！</span>`); render(); await wait(500);
                    }
                    else if (actionType === "gold_earn") {
                        state.log.push(`<span style="color:#ff5252;">${e.name} は戦闘中に小銭を稼いでいる！</span>`); render(); await wait(500);
                    }
                    else if (actionType === "regen_party") {
                        if(!state.skipMode){ state.enemies.forEach(en => {if(en.hp>0 && en.exploreTimer===0) window.showArenaEffect(en.id, 'heal')}); await wait(500); }
                        state.enemies.forEach(en => { if(en.hp>0 && en.exploreTimer===0) en.regen = true; });
                        state.log.push(`<span style="color:#ff5252;">敵陣営全体にリジェネが付与された！</span>`); render(); await wait(200);
                    }

                    if (actionType === "magic_all") {
                        let dmg = Math.max(1, Math.floor(baseAtk * 0.8));
                        state.log.push(`<span style="color:#ff5252; font-weight:bold;">🔥 ${e.name} の【${skillName}】！</span>`); render(); await wait(300);
                        let allTargets = [];
                        state.party.forEach(pt => { if(pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) allTargets.push({obj: pt, isGuest: false}); });
                        state.guests.forEach(g => { if(g.hp > 0) allTargets.push({obj: g, isGuest: true}); });
                        
                        for (let tInfo of allTargets) {
                            if (tInfo.obj.hp <= 0) continue;
                            
                            let pt = tInfo.obj; let dodgeChance = Math.min(0.8, Math.max(0, ((pt.speed||10) - (e.speed||10)) * 0.05));
                            let curName = tInfo.isGuest ? (pt.type === 'farming' ? '身代わりカボチャ' : (pt.type === 'soldier' ? '城の兵士' : (pt.type === 'captain' ? '城の隊長' : (pt.type === 'king' ? '王様' : (pt.type === 'cooking' ? '料理人' : (pt.type === 'smithing' ? '鍛冶師' : (pt.type === 'fishing' ? '漁師' : (pt.type === 'explore' ? '冒険家' : (pt.type === 'building' ? '建築士' : '助っ人'))))))))) : pt.name;
                            
                            // ★修正：絶対に「反射」の判定を先に行う！（全体魔法）
                            if (!tInfo.isGuest && pt.reflect) {
                                state.log.push(`<span style="color:#00BCD4;">${curName} に向かった魔法は、鏡に吸い込まれて反射した！ ${e.name} に ${dmg} の大ダメージ！</span>`);
                                e.hp -= dmg; e.flash = true; pt.reflect = false;
                                render(); if(!state.skipMode) await wait(400);
                                e.flash = false; render();
                                if (e.hp <= 0) break; 
                                continue;
                            }

                            // 鏡を張っていなかった場合のみ、回避(MISS)の判定を行う
                            if (Math.random() < dodgeChance) { 
                                state.log.push(`<span style="color:#aaa;">${curName} は魔法をヒラリと避けた！(MISS)</span>`); 
                                render(); if(!state.skipMode) await wait(200);
                                continue; 
                            }

                            let pDef = tInfo.isGuest ? Math.floor(avgDef * 0.5) : pt.def; 
                            let pDmg = Math.max(1, dmg - Math.floor(pDef * 0.5));
                            
                            if (!tInfo.isGuest && pt.invincible) {
                                pDmg = 0;
                                state.log.push(`<span style="color:#FFF;">${curName} は金庫の中で魔法を完全にやり過ごした！</span>`);
                            } else if (!tInfo.isGuest) { 
                                if (pt.shield) { pDmg = Math.floor(pDmg / 2); pt.shield = false; } 
                                if (pt.hutHp > 0) { pDmg = Math.floor(pDmg / 2); pt.hutHp--; } 
                            }
                            
                            pt.hp -= pDmg; 
                            if (pDmg > 0) {
                                state.log.push(`<span style="color:#ff5252;">${curName} は ${pDmg} のダメージを受けた！</span>`);
                                pt.flash = true; 
                            }
                            
                            render();
                            if (!state.skipMode && pDmg > 0) { 
                                let ui = document.getElementById('arena-battle-ui'); 
                                if (ui) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 200); } 
                                await wait(300); 
                            }
                            pt.flash = false; render(); if(!state.skipMode) await wait(100);
                        }
                    }

                    if (actionType === "heavy" || actionType === "heavy_magic" || actionType === "attack") {
                        let captain = state.guests.find(g => g.type === 'captain' && g.hp > 0);
                        if (captain && !finalTargetData.isGuest && Math.random() < 0.5) {
                            targetObj = captain; finalTargetData = { obj: captain, isGuest: true }; defValue = Math.floor(avgDef * 0.5); 
                            state.log.push(`<span style="color:#FFD700;">城の隊長が身を挺して ${targetObj.name || "味方"} をかばった！！🛡️</span>`); render(); await wait(500);
                        }
                        let tName = finalTargetData.isGuest ? (targetObj.type === 'farming' ? '身代わりカボチャ' : (targetObj.type === 'soldier' ? '城の兵士' : (targetObj.type === 'captain' ? '城の隊長' : (targetObj.type === 'king' ? '王様' : (targetObj.type === 'cooking' ? '料理人' : (targetObj.type === 'smithing' ? '鍛冶師' : (targetObj.type === 'fishing' ? '漁師' : (targetObj.type === 'explore' ? '冒険家' : (targetObj.type === 'building' ? '建築士' : '助っ人'))))))))) : targetObj.name;
                        
                        let isMagic = (actionType === "heavy_magic");
                        let isPhysical = (actionType === "attack" || actionType === "heavy");

                        // ★修正：絶対に「反射」の判定を先に行う！（単体魔法）
                        if (isMagic && !finalTargetData.isGuest && targetObj.reflect) {
                            let rawDmg = Math.max(1, Math.floor(baseAtk * 1.5));
                            state.log.push(`<span style="color:#00BCD4;">${tName} に向かった魔法は、鏡に吸い込まれて反射した！ ${e.name} に ${rawDmg} の大ダメージ！</span>`);
                            e.hp -= rawDmg; e.flash = true; targetObj.reflect = false;
                            render(); if(!state.skipMode) await wait(400); e.flash = false; render();
                        }
                        else {
                            // 反射しなかった場合のみ、回避の判定を行う
                            let dodgeChance = Math.min(0.8, Math.max(0, ((targetObj.speed||10) - (e.speed||10)) * 0.05));
                            if (!finalTargetData.isGuest && targetObj.absoluteDodge && isPhysical) {
                                dodgeChance = 1.0;
                            }

                            if (Math.random() < dodgeChance) {
                                // ★追加: 絶対回避で躱した場合、ここでバフを消費する！
                                if (!finalTargetData.isGuest && targetObj.absoluteDodge && (actionType === "attack" || actionType === "heavy")) {
                                    targetObj.absoluteDodge = false; // バフ消費
                                    logMsg = `<span style="color:#00BCD4;">${e.name} の攻撃！ しかし ${tName} は完全に予測して躱した！(絶対回避)</span>`;
                                } else {
                                    if(actionType === "attack") logMsg = `<span style="color:#aaa;">${e.name} の攻撃！ しかし ${tName} は素早く避けた！(MISS)</span>`;
                                    else logMsg = `<span style="color:#aaa;">🔥 ${e.name} の【${skillName}】！ しかし ${tName} は素早く避けた！(MISS)</span>`;
                                }
                                state.log.push(logMsg);
                            } else {
                                if (e.row === 'back' && actionType === "attack") dmgMultiplier *= 0.7; 
                                baseAtk *= dmgMultiplier;
                                if (isMagic || actionType === "heavy") { dmg = Math.max(1, Math.floor(baseAtk * 1.5) - Math.floor(defValue * 0.5)); } 
                                else { dmg = Math.max(1, Math.floor(baseAtk) - Math.floor(defValue * 0.5)); }
                                
                                if (!finalTargetData.isGuest && targetObj.invincible) {
                                    state.log.push(`<span style="color:#FFF;">${tName} は金庫に引きこもっており、攻撃を完全に防いだ！</span>`);
                                    dmg = 0;
                                } 
                                else {
                                    if (!finalTargetData.isGuest) { if (targetObj.shield) { dmg = Math.floor(dmg / 2); targetObj.shield = false; } if (targetObj.hutHp > 0) { dmg = Math.floor(dmg / 2); targetObj.hutHp--; } }
                                    targetObj.hp -= dmg;
                                    if (actionType === "attack") logMsg = `<span style="color:#ff5252;">${e.name} の攻撃！ ${tName} は ${dmg} のダメージを受けた！</span>`;
                                    else logMsg = `<span style="color:#ff5252; font-weight:bold;">🔥 ${e.name} の【${skillName}】！ 強烈な一撃が ${tName} に ${dmg} ダメージ！</span>`;
                                    targetObj.flash = true; 
                                    state.log.push(logMsg);
                                }
                            }
                        }
                        
                        render();
                        if (!state.skipMode && dmg > 0) { let ui = document.getElementById('arena-battle-ui'); if (ui) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 500); } await wait(400); }
                        targetObj.flash = false;
                        render();
                        if(!state.skipMode) await wait(200);
                    }
                }
            }
        }
    }

    state.isProcessing = false;

    // --- ③ 勝敗判定 ---
    let partyAlive = state.party.some(p => p.hp > 0);
    let enemyAlive = state.enemies.filter(e => e.hp > 0).length > 0;

    if (!partyAlive || !enemyAlive) {
        if (!partyAlive) {
            state.autoMode = false; state.skipMode = false; render(); await wait(1000);
            if (state.healPots > 0 && state.mode !== 'friend') {
                state.isRetry = true; 
                state.log.push(`<span style="color:#FF9800; font-weight:bold;">全滅したが、回復薬の予備がある！ 一旦退却して立て直そう。</span>`);
                window.showArenaInterval();
            } else if (state.mode === 'friend') {
                let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
                state.active = false; state.autoMode = false;
                let resUi = document.createElement('div');
                resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
                resUi.innerHTML = `
                    <div style="background:#111; border:4px solid #9E9E9E; padding:40px; border-radius:12px; text-align:center;">
                        <h2 style="color:#9E9E9E; font-size:36px; margin-top:0;">🤝 フレンドバトル 敗北...</h2>
                        <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">惜しくもフレンドの幻影に敗れてしまった。<br>※フレンドバトルでの寿命ペナルティはありません。</div>
                        <div style="margin-bottom: 30px;"><button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer;">📜 最後の戦闘ログを確認</button></div>
                        <div style="display:flex; gap:20px; justify-content:center;">
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('captain');" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">隊長のもとへ戻る</button>
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('outside');" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(resUi);
            } else { window.endArena(false); }
        } else if (!enemyAlive) {
            state.log.push(`<span style="color:#FFD700; font-weight:bold;">${state.mode === 'friend' ? 'フレンドバトル' : `第 ${state.wave} 戦`}、勝利！！</span>`);
            state.autoMode = false; state.skipMode = false; render(); await wait(1500); 
            if (state.mode === 'friend') {
                // ゴールド獲得処理を削除
                if (typeof saveGameData === 'function') saveGameData();
                let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
                state.active = false; state.autoMode = false;
                let resUi = document.createElement('div');
                resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
                resUi.innerHTML = `
                    <div style="background:#111; border:4px solid #4fc3f7; padding:40px; border-radius:12px; text-align:center;">
                        <h2 style="color:#4fc3f7; font-size:36px; margin-top:0;">🤝 フレンドバトル 勝利！</h2>
                        <div style="color:#FFD700; font-size:18px; font-weight:bold; margin-bottom:20px;">【名誉ある勝利】※報酬はありません</div>
                        <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">見事、フレンドの幻影に打ち勝った！<br>他のプレイヤーにも挑戦してみよう！</div>
                        <div style="margin-bottom: 30px;"><button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer;">📜 最後の戦闘ログを確認</button></div>
                        <div style="display:flex; gap:20px; justify-content:center;">
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('captain');" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">隊長のもとへ戻る</button>
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('outside');" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(resUi);
            } else {
                if (state.enemies.some(e => e.isBoss)) {
                    state.bossesDefeated = (state.bossesDefeated || 0) + 1;
                    if (state.mode === 'normal') {
                        if (!window.aiPet.defeatedArenaBosses) window.aiPet.defeatedArenaBosses = [];
                        let boss = state.enemies.find(e => e.isBoss);
                        if (boss && !window.aiPet.defeatedArenaBosses.includes(boss.bossTypeKey)) { window.aiPet.defeatedArenaBosses.push(boss.bossTypeKey); }
                    }
                }
                let maxWaves = state.mode === 'boss' ? state.bossQueue.length : state.bossQueue.length * 50;
                if (state.wave >= maxWaves) {
                    let partyToSave = state.party.map(p => {
                        let origP = window.ARENA_RECEPTION_STATE.party.find(rp => rp.id === p.id) || p;
                        return { ...p, atk: origP.atk || p.atk, def: origP.def || p.def, intel: origP.intel || p.intel, speed: origP.speed || p.speed };
                    });
                    if (typeof window.updateArenaRanking === 'function') window.updateArenaRanking(state.wave, partyToSave);
                    if (window.aiPet) {
                        window.aiPet.gold = (window.aiPet.gold || 0) + 50000;
                        if (state.mode === 'boss') {
                            window.aiPet.arenaBossHighestWave = Math.max(window.aiPet.arenaBossHighestWave || 0, maxWaves);
                        } else {
                            window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, maxWaves);
                        }
                    }
                    if (typeof saveGameData === 'function') saveGameData();
                    let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
                    state.active = false; state.autoMode = false;
                    let resUi = document.createElement('div');
                    resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
                    resUi.innerHTML = `
                        <div style="background:#111; border:4px solid #FFD700; padding:40px; border-radius:12px; text-align:center;">
                            <h2 style="color:#FFD700; font-size:36px; margin-top:0;">🏆 闘技場 完全制覇！</h2>
                            <div style="font-size:24px; margin-bottom:10px;">到達ウェーブ: <b>第 ${state.wave} 戦</b></div>
                            <div style="color:#FFD700; font-size:20px; font-weight:bold; margin-bottom:20px;">制覇報酬: 50,000 G 獲得！</div>
                            <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">立ちはだかる全 ${state.bossQueue.length} 体のボスを完全撃破した！闘技場の覇者よ、見事なり！<br>多様な進化体や新たな戦術を編み出し、他のプレイヤーの記録や己の限界に挑み続けよう！</div>
                            <div style="margin-bottom: 30px;"><button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer;">📜 最後の戦闘ログを確認</button></div>
                            <div style="display:flex; gap:20px; justify-content:center;">
                                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('captain');" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">隊長のもとへ戻る</button>
                                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('outside');" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(resUi);
                } else { window.showArenaInterval(); }
            }
        }
    } else {
        render();
        // AUTOモード時は自動でターンを進める
        if (state.autoMode && state.active && !state.skipMode) setTimeout(() => { if (window.ARENA_STATE.autoMode && window.ARENA_STATE.active) window.processArenaTurn(); }, 150);
    }
};

window.showArenaInterval = function() {
    let state = window.ARENA_STATE;
    state.comboCount++; // WAVE突破でコンボ加算
    
    // 10WAVEクリアごとに回復剤を1つ補充（上限10個）
    if (state.wave > 0 && state.wave % 10 === 0 && !state.replenishedForWave) {
        state.healPots = Math.min(10, state.healPots + 1);
        state.replenishedForWave = true;
    }

    if (window.aiPet) {
        if (window.ARENA_STATE.mode === 'boss') {
            window.aiPet.arenaBossHighestWave = Math.max(window.aiPet.arenaBossHighestWave || 0, window.ARENA_STATE.wave + 1);
        } else {
            window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, window.ARENA_STATE.wave + 1);
        }
    }
    
    let ui = document.getElementById('arena-interval-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-interval-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 52000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
        document.body.appendChild(ui);
    }

    let partyStatusHtml = state.party.map(p => `
        <div style="flex:1; background:rgba(20,20,30,0.8); border:2px solid #555; padding:10px; border-radius:6px; margin: 0 5px; min-width: 120px; ${p.hp <= 0 ? 'opacity:0.4;' : ''}">
            <div style="color:${p.hp <= 0 ? '#888' : '#FFD700'}; font-weight:bold; font-size:14px; margin-bottom:4px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
            <div style="color:#76ff03; font-size:13px; font-weight:bold; text-align:center;">HP: ${Math.max(0, p.hp)} / ${p.maxHp}</div>
            <div style="color:#4fc3f7; font-size:13px; font-weight:bold; text-align:center;">MP: ${Math.max(0, p.mp)} / ${p.maxMp}</div>
        </div>
    `).join('');

    let title = state.isRetry ? "💀 全滅からの生還" : `🏆 第 ${state.wave} 戦 突破！`;
    let desc = state.isRetry ? "力尽きましたが、回復薬のストックがあります。薬を使って立て直し、同じWAVEに再挑戦しますか？" : "次の戦いへ進むか、ここで報酬を得て帰還するか選んでください。";
    let nextBtnText = state.isRetry ? "同じWAVEに再挑戦" : "次の階級へ進む";

    // ★追加：パーティが全滅しているかチェックし、進行ボタンをロックする
    let partyAlive = state.party.some(p => p.hp > 0);
    let nextBtnDisabled = !partyAlive;

    ui.innerHTML = `
        <h2 style="color:${state.isRetry ? '#FF5252' : '#FFC107'}; font-size:36px; margin-bottom:10px;">${title}</h2>
        <div style="font-size:18px; color:#ccc; margin-bottom:20px;">${desc}</div>
        <div style="display:flex; width:90%; max-width:800px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; gap:5px;">${partyStatusHtml}</div>
        
        <div style="background:#222; padding:20px; border:2px solid #4CAF50; border-radius:8px; margin-bottom:20px; text-align:center;">
            <div style="font-size:20px; color:#4CAF50; font-weight:bold; margin-bottom:10px;">🧪 支給された回復薬: 残り ${state.healPots} 個</div>
            <button onclick="window.useArenaHeal()" ${state.healPots <= 0 ? 'disabled' : ''} style="padding:10px 20px; font-size:16px; background:${state.healPots > 0 ? '#388E3C' : '#555'}; color:white; border:none; border-radius:4px; cursor:${state.healPots > 0 ? 'pointer' : 'not-allowed'};">薬を使いパーティを全回復する（戦闘不能も復活）</button>
        </div>

        <div style="margin-bottom: 20px;">
            <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.5); transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">📜 このウェーブの戦闘ログを見る</button>
        </div>

        <div style="display:flex; gap:20px;">
            <button onclick="window.nextArenaWave()" ${nextBtnDisabled ? 'disabled' : ''} style="padding:15px 40px; font-size:22px; font-weight:bold; background:${nextBtnDisabled ? '#555' : '#b71c1c'}; color:${nextBtnDisabled ? '#aaa' : 'white'}; border:3px solid ${nextBtnDisabled ? '#444' : '#ff5252'}; border-radius:8px; cursor:${nextBtnDisabled ? 'not-allowed' : 'pointer'};">${nextBtnDisabled ? '⚠️ 薬を使って復活してください' : nextBtnText}</button>
            <button onclick="window.endArena(true)" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#444; color:white; border:3px solid #FF9800; border-radius:8px; cursor:pointer;">棄権して帰還する (寿命 -3)</button>
        </div>
    `;
    ui.style.display = 'flex';
};

window.useArenaHeal = function() {
    if (window.ARENA_STATE.healPots > 0) {
        window.ARENA_STATE.healPots--;
        window.ARENA_STATE.party.forEach(p => { 
            // ★追加：生存条件 (p.hp > 0) を撤廃し、戦闘不能からも全回復。ついでに状態異常もリセット。
            p.hp = p.maxHp; 
            p.mp = p.maxMp; 
            p.poisonTimer = 0; 
            p.doomTimer = 0;
        });
        window.showArenaInterval(); window.renderArenaBattle();
    }
};
window.nextArenaWave = function() { 
    document.getElementById('arena-interval-ui').style.display = 'none'; 
    window.ARENA_STATE.replenishedForWave = false; 
    // ★追加：再挑戦時はWAVEを加算しない
    if (!window.ARENA_STATE.isRetry) {
        window.ARENA_STATE.wave++; 
    }
    window.ARENA_STATE.isRetry = false; // フラグをリセット
    window.startArenaWave(); 
};

window.endArena = function(isGiveUp) {
    let state = window.ARENA_STATE; 

    let lastCheckpoint = 1;
    if (state.mode === 'boss') {
        lastCheckpoint = state.wave; 
        window.aiPet.arenaBossHighestWave = Math.max(window.aiPet.arenaBossHighestWave || 0, lastCheckpoint);
    } else {
        lastCheckpoint = Math.floor((state.wave - 1) / 50) * 50 + 1;
        window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, lastCheckpoint);
    }

    let ui = document.getElementById('arena-battle-ui');
    let intUi = document.getElementById('arena-interval-ui');
    
    // ★修正：ここで戦闘画面とインターバル画面を確実に非表示（リセット）にする！
    if (ui) ui.style.display = 'none';
    if (intUi) intUi.style.display = 'none';
    
    state.active = false;
    state.isRetry = false; // ★追加：リトライ状態（ゾンビ状態）も解除しておく
    
    let title = isGiveUp ? "🏳️ 闘技場 棄権" : "💀 闘技場 全滅";
    let color = isGiveUp ? "#FF9800" : "#ff5252";
    let penalty = isGiveUp ? 3 : 10;
    
    if (window.aiPet && typeof window.aiPet.lifespan !== 'undefined') window.aiPet.lifespan = Math.max(1, window.aiPet.lifespan - penalty);
    // ★修正：フレンド戦の場合は報酬0G
    let rewardGold = (state.mode === 'friend') ? 0 : state.wave * 500;
    if (window.aiPet) window.aiPet.gold = (window.aiPet.gold || 0) + rewardGold;
    if (typeof saveGameData === 'function') saveGameData();
    
    let partyToSave = state.party.map(p => {
        let origP = window.ARENA_RECEPTION_STATE.party.find(rp => rp.id === p.id) || p;
        return { ...p, atk: origP.atk || p.atk, def: origP.def || p.def, intel: origP.intel || p.intel };
    });
    
    if (state.wave > 1 && typeof window.updateArenaRanking === 'function') window.updateArenaRanking(state.wave, partyToSave);

    let resUi = document.createElement('div');
    resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
    resUi.innerHTML = `
        <div style="background:#111; border:4px solid ${color}; padding:40px; border-radius:12px; text-align:center;">
            <h2 style="color:${color}; font-size:36px; margin-top:0;">${title}</h2>
            <div style="font-size:24px; margin-bottom:10px;">到達ウェーブ: <b>第 ${state.wave} 戦</b></div>
            <div style="color:#FFD700; font-size:20px; font-weight:bold; margin-bottom:20px;">報酬: ${rewardGold} G 獲得！</div>
            <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">肉体の限界を超えた代償として...<br><span style="color:#ff5252; font-weight:bold;">寿命が ${penalty} 削られた！</span></div>
            
            <div style="margin-bottom: 30px;">
                <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.5); transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">📜 最後の戦闘ログを確認</button>
            </div>

            <div style="display:flex; gap:20px; justify-content:center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('captain');" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">隊長のもとへ戻る</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.finishArenaActivity('outside');" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
            </div>
        </div>
    `;
    document.body.appendChild(resUi);
};

// 🏆 アリーナ：ランキングUIの描画処理（ボスラッシュ対応版）
window.renderArenaRankingList = async function(mode = 'normal') {
    try {
        const tStatus = document.getElementById('main-tab-status'); 
        const tDungeon = document.getElementById('main-tab-dungeon'); 
        const tArena = document.getElementById('main-tab-arena'); 
        
        if (tStatus) { tStatus.style.background = '#222'; tStatus.style.color = '#aaa'; tStatus.style.borderBottom = '3px solid transparent'; }
        if (tDungeon) { tDungeon.style.background = '#222'; tDungeon.style.color = '#aaa'; tDungeon.style.borderBottom = '3px solid transparent'; tDungeon.style.borderRight = '1px solid #444'; }
        if (tArena) { tArena.style.background = '#333'; tArena.style.color = '#FFF'; tArena.style.borderBottom = '3px solid #FF9800'; tArena.style.borderLeft = '1px solid #444'; }

        // ★修正：クラス名だけでなく、IDを直接指定して確実に隠す！
        const subStatus = document.getElementById('sub-tabs-status');
        const subDungeon = document.getElementById('sub-tabs-dungeon');
        if (subStatus) subStatus.style.display = 'none';
        if (subDungeon) subDungeon.style.display = 'none';
        document.querySelectorAll('.ranking-sub-tabs').forEach(el => el.style.display = 'none');

        let subArena = document.getElementById('sub-tabs-arena');
        if (!subArena) {
            subArena = document.createElement('div');
            subArena.id = 'sub-tabs-arena';
            subArena.className = 'ranking-sub-tabs'; 
            subArena.style.cssText = 'display:flex; width:100%; height:42px; margin-bottom:15px; flex-shrink:0;';
            subArena.innerHTML = `
                <div id="rank-tab-arena-normal" onclick="window.renderArenaRankingList('normal')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:bold; transition:0.2s; border-radius:4px 0 0 4px; box-sizing:border-box;">通常エンドレス</div>
                <div id="rank-tab-arena-boss" onclick="window.renderArenaRankingList('boss')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:bold; transition:0.2s; border-radius:0 4px 4px 0; box-sizing:border-box;">ボスラッシュ</div>
            `;
            
            const referenceNode = subDungeon || subStatus;
            
            if (referenceNode && referenceNode.parentNode) {
                referenceNode.parentNode.insertBefore(subArena, referenceNode.nextSibling);
            } else {
                const listContainer = document.getElementById('ranking-list-container');
                if (listContainer && listContainer.parentNode) {
                    listContainer.parentNode.insertBefore(subArena, listContainer);
                }
            }
        }
        subArena.style.display = 'flex';

        const tabNormal = document.getElementById('rank-tab-arena-normal');
        const tabBoss = document.getElementById('rank-tab-arena-boss');
        if (tabNormal && tabBoss) {
            if (mode === 'normal') {
                tabNormal.style.background = '#FF9800'; tabNormal.style.color = '#000'; tabNormal.style.border = 'none';
                tabBoss.style.background = '#222'; tabBoss.style.color = '#FF9800'; tabBoss.style.border = '1px solid #FF9800';
            } else {
                tabBoss.style.background = '#FF9800'; tabBoss.style.color = '#000'; tabBoss.style.border = 'none';
                tabNormal.style.background = '#222'; tabNormal.style.color = '#FF9800'; tabNormal.style.border = '1px solid #FF9800';
            }
        }

        const list = document.getElementById('ranking-list-container');
        if(!list) return;
        
        list.style.display = 'block';
        list.style.width = '100%';
        list.innerHTML = `<div style="text-align:center; color:#FFF; margin-top:50px; font-size:18px; font-weight:bold;">📡 クラウドから${mode === 'boss' ? 'ボスラッシュ' : '通常エンドレス'}の記録を取得中...</div>`;
        
        let detailArea = document.getElementById('ranking-detail-area');
        if (detailArea) detailArea.style.display = 'none'; 

        if (typeof window.fetchArenaRanking === 'function') {
            const rankList = await window.fetchArenaRanking(mode); 
            window.arenaRankDataCache = rankList; 
            
            if (!rankList || rankList.length === 0) {
                list.innerHTML = `<div style="text-align:center; color:#888; margin-top:50px; font-size:18px;">まだ記録がありません。<br>一番乗りを目指そう！</div>`;
                return;
            }

            let html = '';
            rankList.forEach((data, index) => {
                try {
                    let rankIcon = `<span style="color:#888; font-size:20px; font-weight:bold;">${index + 1}位</span>`;
                    if (index === 0) rankIcon = "<span style='color:#FFD700; font-size:24px; font-weight:bold; text-shadow:0 0 5px #FFD700;'>🥇 1位</span>";
                    if (index === 1) rankIcon = "<span style='color:#C0C0C0; font-size:22px; font-weight:bold;'>🥈 2位</span>";
                    if (index === 2) rankIcon = "<span style='color:#CD7F32; font-size:20px; font-weight:bold;'>🥉 3位</span>";

                    let isMe = (data.playerId === localStorage.getItem('my_player_id'));
                    let pName = data.playerName || "名無しプレイヤー";
                    if (isMe) pName = `✨ ${pName} (あなた)`;
                    
                    let leaderSkin = (data.party && data.party.length > 0 && data.party[0].skin) ? data.party[0].skin : 'robot';
                    let typeIcon = leaderSkin.split('_')[0] === 'ghost' ? '👻' : '🤖'; 
                    let petNameStr = (typeof monsterBookData !== 'undefined' && monsterBookData[leaderSkin] ? monsterBookData[leaderSkin].name : leaderSkin);

                    html += `
                        <div style="background: ${isMe ? 'rgba(255, 152, 0, 0.15)' : '#222'}; border: 2px solid ${isMe ? '#FF9800' : '#444'}; border-radius: 8px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                            <div style="display:flex; align-items:center; gap:20px;">
                                <div style="width:80px; text-align:center;">${rankIcon}</div>
                                <div>
                                    <div style="font-size:16px; font-weight:bold; cursor:pointer; color:#FF9800; text-decoration:underline; margin-bottom:4px;" 
                                         onclick="window.openArenaPlayerDetail(${index})" title="クリックでパーティ詳細を見る">
                                        ${pName}
                                    </div>
                                    <div style="font-size:14px; color:#aaa;">リーダー: ${typeIcon} ${petNameStr}</div>
                                </div>
                            </div>
                            <div style="font-size:32px; font-weight:bold; color:#FF9800; text-shadow:0 2px 4px rgba(0,0,0,0.5);">
                                WAVE ${data.wave || 1}
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.warn("破損データのスキップ:", err);
                }
            });
            
            if (html === '') {
                list.innerHTML = `<div style="text-align:center; color:#888; margin-top:50px; font-size:18px;">有効な記録が見つかりませんでした。</div>`;
            } else {
                list.innerHTML = html;
            }
        } else {
            list.innerHTML = `<div style="text-align:center; color:#F44336; margin-top:50px; font-size:18px;">ランキング機能が見つかりません。</div>`;
        }
    } catch (e) {
        const list = document.getElementById('ranking-list-container');
        if (list) list.innerHTML = `<div style="text-align:center; color:#F44336; margin-top:50px; font-size:18px;">内部エラーが発生しました。<br>${e.message}</div>`;
        console.error("闘技場ランキング描画エラー:", e);
    }
};

window.openArenaPlayerDetail = function(index) {
    const detailArea = document.getElementById('ranking-detail-area'); const content = document.getElementById('ranking-detail-content'); const title = document.getElementById('ranking-detail-title');
    if(!detailArea || !content) return; const data = window.arenaRankDataCache[index]; if (!data) return;
    detailArea.style.display = 'flex'; title.innerHTML = `🏷️ ${data.playerName} のパーティ編成`;

    let partyHtml = (data.party || []).map(p => {
        let wordsHtml = (p.words || []).map(w => `<span style="display:inline-block; background:rgba(0,188,212,0.2); color:#00BCD4; border:1px solid #00BCD4; border-radius:4px; padding:2px 6px; margin:2px 4px 2px 0; font-size:11px; font-weight:bold;">${w}</span>`).join('');
        let pNameStr = typeof monsterBookData !== 'undefined' && monsterBookData[p.skin] ? monsterBookData[p.skin].name : p.skin;
        return `
            <div style="background:#1a1a1a; border:1px solid #555; border-left:4px solid ${p.isMe ? '#4CAF50' : '#FFD700'}; border-radius:6px; padding:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><div style="font-size:14px; font-weight:bold; color:${p.isMe ? '#4CAF50' : '#FFD700'};">${p.name} <span style="font-size:11px; color:#888;">(${pNameStr})</span></div><div style="font-size:11px; color:#76ff03; font-weight:bold;">HP: ${p.maxHp} / MP: ${p.maxMp}</div></div>
                <div style="display:flex; gap:10px; font-size:11px; color:#aaa; margin-bottom:8px; background:#222; padding:6px; border-radius:4px;"><span>⚔️ 攻撃: <span style="color:#FFF;">${p.atk}</span></span><span>🛡️ 防御: <span style="color:#FFF;">${p.def}</span></span><span>🧠 賢さ: <span style="color:#FFF;">${p.intel}</span></span></div>
                <div><div style="font-size:10px; color:#888; margin-bottom:2px;">▼ 記憶している言葉</div><div>${wordsHtml}</div></div>
            </div>`;
    }).join('');
    content.innerHTML = `<div style="font-size:18px; color:#FF9800; font-weight:bold; text-align:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px dashed #555;">到達記録: WAVE ${data.wave}</div>${partyHtml}`;
};

// ==========================================
// ★ 新規追加：闘技場（城）からAIを確実に退出させる処理
// ==========================================
window.exitArenaFacility = function() {
    if (window._castleArenaQuestOrigin && typeof window.returnToCastleMap === 'function') {
        window._castleArenaQuestOrigin = false;
        if (window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE.castleQuestOrigin = false;
        window.returnToCastleMap('captain');
        return;
    }
    if (window.aiPet) {
        // AIの状態を「退出中」に変更し、建物内のターゲットを消去する
        window.aiPet.actionState = 'exiting';
        window.aiPet.isIndoors = false;
        window.aiPet.interactionTarget = null;
        window.aiPet.indoorTarget = null;
        window.aiPet.visualAction = null;
        window.aiPet.message = "お城から出たよ！";
        window.aiPet.messageTimer = 120;
        
        // 予定リストに「城に行く」タスクが残っていれば消去する
        if (window.aiPet.schedule && window.aiPet.schedule.length > 0) {
            window.aiPet.schedule.shift(); 
        }
        
        // 画面の予定UIを更新
        if (typeof window.updateScheduleList === 'function') {
            window.updateScheduleList();
        }
    }
};

window.cancelArenaQuestPreparation = function() {
    if (window._castleArenaQuestOrigin && typeof window.returnToCastleMap === 'function') {
        window.returnToCastleMap('captain');
    } else {
        window.exitArenaFacility();
    }
};

window.finishArenaActivity = function(destination) {
    const fromCastleQuest = !!window._castleArenaQuestOrigin;
    if (destination === 'outside') {
        window._castleArenaQuestOrigin = false;
        if (window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE.castleQuestOrigin = false;
        if (fromCastleQuest && typeof window.closeCastleMapUI === 'function') window.closeCastleMapUI();
        else window.exitArenaFacility();
        return;
    }
    if (fromCastleQuest && typeof window.returnToCastleMap === 'function') window.returnToCastleMap('captain');
    else window.openArenaReception();
};

window.skipArenaWave = async function() {
    let state = window.ARENA_STATE;
    if (state.isProcessing || state.skipMode) return;
    
    // スキップフラグを立ててAUTO進行をオフにする
    state.skipMode = true;
    state.autoMode = false;
    
    let ui = document.getElementById('arena-battle-ui');
    if (ui) ui.style.filter = 'saturate(0.5) blur(1px)'; // 高速処理中の視覚エフェクト
    
    let skipOverlay = document.createElement('div');
    skipOverlay.id = 'arena-skip-overlay';
    skipOverlay.style.cssText = 'position:absolute; top:20px; left:50%; transform:translateX(-50%); background:rgba(156,39,176,0.9); border:2px solid #FFF; padding:10px 20px; border-radius:8px; color:#FFF; font-weight:bold; font-size:20px; z-index:60000; box-shadow:0 0 15px #9C27B0; display:flex; align-items:center; gap:10px;';
    skipOverlay.innerHTML = `<div class="arena-ready-blink">⏭</div> 超高速演算モード実行中... <span id="skip-turn-count">0</span> Turn`;
    if (ui) ui.appendChild(skipOverlay);

    let turnCount = 0;
    
    // 敵か味方のどちらかが全滅するまで、裏でターン処理を回し続ける
    while (state.active && state.party.some(p => p.hp > 0) && state.enemies.some(e => e.hp > 0)) {
        await window.processArenaTurn();
        turnCount++;
        
        // 10ターンに1回、画面の一部だけを更新しつつ、ブラウザのフリーズを防ぐ
        if (turnCount % 10 === 0) {
            let turnElem = document.getElementById('skip-turn-count');
            if (turnElem) turnElem.innerText = turnCount;
            // 超軽量なUI更新（HPバーのみ更新などを入れると更に良いが、今回はフリーズ防止が主目的）
            await new Promise(r => setTimeout(r, 0)); // イベントループを解放！これがフリーズ防止の要
        }
        
        // 安全装置：万が一1万ターンを超えた場合は、泥試合と判定して強制的にループを抜ける
        if (turnCount > 10000) {
            state.log.push(`<span style="color:#FF9800;">【泥試合警告】戦闘が1万ターンを超えました。これ以上はAIの精神が持ちません。</span>`);
            break;
        }
    }
    
    // 処理が終わったらスキップモードを解除して最終結果を描画
    state.skipMode = false;
    if (ui) ui.style.filter = 'none';
    if (skipOverlay) skipOverlay.remove();
    window.renderArenaBattle();
};

// ==========================================
// ★新規追加：戦闘結果ログ確認モーダル
// ==========================================
window.toggleArenaResultLog = function() {
    let logModal = document.getElementById('arena-result-log-modal');
    if (!logModal) {
        logModal = document.createElement('div');
        logModal.id = 'arena-result-log-modal';
        logModal.style.cssText = `position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: rgba(10,10,15,0.95); border: 3px solid #9C27B0; border-radius: 12px; padding: 20px; display: none; flex-direction: column; z-index: 70000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: white; font-family: sans-serif; box-sizing: border-box;`;
        document.body.appendChild(logModal);
    }
    
    if (logModal.style.display === 'flex') {
        logModal.style.display = 'none';
    } else {
        let state = window.ARENA_STATE;
        let logHtml = state.log.map(l => `<div style="margin-bottom:6px; border-bottom:1px solid #333; padding-bottom:4px;">${l}</div>`).join('');
        logModal.innerHTML = `
            <h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 このウェーブの全戦闘ログ</h3>
            <div id="arena-result-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.8; font-size:16px; padding-right:10px; background:#111; padding: 10px; border-radius: 8px; border: 1px solid #444;">
                ${logHtml}
            </div>
            <button onclick="window.toggleArenaResultLog()" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
        `;
        logModal.style.display = 'flex';
        // 開いた時に一番下（最新のログ）までスクロールしておく
        setTimeout(() => {
            let logArea = document.getElementById('arena-result-log-area');
            if (logArea) logArea.scrollTop = logArea.scrollHeight;
        }, 10);
    }
};

// ======================================================================
// 🎵 闘技場（アリーナ）BGM 完全統合 ＆ 動的切り替えパッチ
// ======================================================================

// ① 闘技場ロビーに入場した時のBGM
const _orig_openArenaReception_bgm = window.openArenaReception;
window.openArenaReception = function() {
    if (window.audioManager) window.audioManager.playBGM('arena_lobby');
    if (_orig_openArenaReception_bgm) _orig_openArenaReception_bgm.apply(this, arguments);
};

// ② アリーナから完全に退出した時（城の外へ出た時）に育成BGMへ戻す
const _orig_exitArenaFacility_bgm = window.exitArenaFacility;
window.exitArenaFacility = function() {
    if (window.audioManager) window.audioManager.restoreMainBGM();
    if (_orig_exitArenaFacility_bgm) _orig_exitArenaFacility_bgm.apply(this, arguments);
};

// ③ WAVE開始時のBGM判定 (雑魚・各種ボス・フレンド戦の切り替え)
const _orig_startArenaWave_bgm = window.startArenaWave;
window.startArenaWave = function() {
    if (_orig_startArenaWave_bgm) _orig_startArenaWave_bgm.apply(this, arguments);

    let state = window.ARENA_STATE;
    if (!state || !window.audioManager) return;

    let isBossWave = (state.mode === 'boss') || (state.mode === 'normal' && state.wave > 0 && state.wave % 50 === 0);

    if (state.mode === 'friend') {
        window.audioManager.playBGM('arena_friend');
    } else if (isBossWave) {
        // 現在のボスの種族（進化系含む）を取得し、アンダースコアの前（ベース種族）を抽出して曲を決める
        let bossType = state.bossQueue[state.bossesDefeated] || state.bossQueue[state.bossQueue.length - 1];
        if (bossType) {
            let baseType = bossType.split('_')[0]; // 例: "robot_type1" -> "robot"
            window.audioManager.playBGM('arena_' + baseType);
        } else {
            window.audioManager.playBGM('arena_robot'); // 万が一のセーフティ
        }
    } else {
        // --- 雑魚戦BGMの3段階切り替え（現在のWAVEで判定） ---
        
        // 2進化の解禁しきい値を計算
        let totalTier1Count = 0;
        for (let k in window.ARENA_ENEMIES) {
            if (k.split('_').length === 2) totalTier1Count++;
        }
        let tier2Threshold = 600 + (totalTier1Count * 50);

        let targetBGM = 'arena_battle_tier0'; // デフォルト（WAVE 1-599）

        // 数値チェック：解禁状況に関わらず「今のWAVE」で判断する
        if (state.wave >= tier2Threshold) {
            targetBGM = 'arena_battle_tier2'; // 2進化地帯（深層）
        } else if (state.wave >= 600) {
            targetBGM = 'arena_battle_tier1'; // 1進化地帯（中層）
        } else {
            targetBGM = 'arena_battle_tier0'; // 基本種地帯（序盤）
        }

        window.audioManager.playBGM(targetBGM);
    }
};

// ④ 休憩画面 (WAVEクリア後のインターバル) のBGM
const _orig_showArenaInterval_bgm = window.showArenaInterval;
window.showArenaInterval = function() {
    if (window.audioManager) window.audioManager.playBGM('arena_rest');
    if (_orig_showArenaInterval_bgm) _orig_showArenaInterval_bgm.apply(this, arguments);
};

// ⑤ 全滅・棄権画面のBGM
const _orig_endArena_bgm = window.endArena;
window.endArena = function(isGiveUp) {
    // 棄権時はロビーに戻るのでロビーBGM、全滅時は敗北BGMを鳴らす
    if (window.audioManager) {
        window.audioManager.playBGM(isGiveUp ? 'arena_lobby' : 'arena_lose');
    }
    if (_orig_endArena_bgm) _orig_endArena_bgm.apply(this, arguments);
};

// ⑥ 勝敗リザルト (フレンド勝利・完全制覇・フレンド敗北) のBGM
// UIが動的に生成されるため、画面に特定のテキストが出現した瞬間にBGMを鳴らすスマートなハック
if (!window._arenaResultObserver) {
    window._arenaResultObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'DIV' && node.innerHTML) {
                    if (node.innerHTML.includes('🤝 フレンドバトル 勝利！') || node.innerHTML.includes('🏆 闘技場 完全制覇！')) {
                        if (window.audioManager) window.audioManager.playBGM('arena_victory');
                    } else if (node.innerHTML.includes('🤝 フレンドバトル 敗北...')) {
                        if (window.audioManager) window.audioManager.playBGM('arena_lose');
                    }
                }
            });
        });
    });
    // 画面（body）の変更を常時監視
    window._arenaResultObserver.observe(document.body, { childList: true });
}

// ★追加：戦闘中の作戦・チャット確認ウィンドウ
window.toggleInBattleTacticViewer = function() {
    let viewer = document.getElementById('in-battle-tactic-viewer');
    if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'in-battle-tactic-viewer';
        viewer.style.cssText = `position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: rgba(10,10,15,0.95); border: 3px solid #00BCD4; border-radius: 12px; padding: 20px; display: none; flex-direction: column; z-index: 70000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: white; font-family: sans-serif; box-sizing: border-box;`;
        document.body.appendChild(viewer);
    }

    if (viewer.style.display === 'flex') {
        viewer.style.display = 'none';
    } else {
        let p = window.ARENA_STATE.party.find(pt => pt.isMe);
        if (!p) return;

        let defTactics = window.getDefaultTactics(p.words);
        let myTactics = window.aiPet.tactics || [];
        
        let allTacticNames = [];
        defTactics.forEach(t => allTacticNames.push(`<span style="color:#4CAF50;">${t.name}</span>`));
        myTactics.forEach(t => allTacticNames.push(`<span style="color:#2196F3;">${t.name}</span>`));

        let currentTactic = p.tacticType === 'default' ? defTactics[p.tacticIndex || 0] : myTactics[p.tacticIndex || 0];
        
        let rulesHtml = currentTactic.rules.map((r, i) => {
            let condStr = window.TACTIC_CONDITIONS[r.condition] || r.condition;
            let skillInfo = window.ARENA_SKILLS[r.action];
            let desc = skillInfo ? `<span style="color:#4fc3f7; font-size:12px;">(${skillInfo.desc})</span>` : '';
            return `<div style="background:#222; padding:8px; border-bottom:1px solid #444; font-size:14px;">
                <span style="color:#FF9800; font-weight:bold;">${i+1}.</span> もし <span style="color:#ddd;">${condStr}</span> なら 
                <span style="font-weight:bold; color:#FFF;">${r.action}</span> ${desc}
            </div>`;
        }).join('');

        viewer.innerHTML = `
            <h3 style="color:#00BCD4; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📋 現在の作戦とチャット指示</h3>
            <div style="font-size:14px; color:#ccc; margin-bottom:10px;">
                チャット欄に以下の作戦名を入力して送信すると、AIに作戦変更を指示できます。<br>
                <b>使える指示ワード：</b> ${allTacticNames.join(', ')}
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #444; flex:1; overflow-y:auto;">
                <div style="color:#FFC107; font-weight:bold; font-size:18px; margin-bottom:10px;">現在の作戦：${currentTactic.name}</div>
                ${rulesHtml}
            </div>
            <button onclick="window.toggleInBattleTacticViewer()" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
        `;
        viewer.style.display = 'flex';
    }
};

// ★新規追加：戦闘を中断してロビーへ戻る処理（リッチな確認UI版）
window.abortArenaToLobby = function() {
    // 既存の showRichChoiceDialog を利用（なければ簡易生成）
    const showConfirm = (typeof window.showRichChoiceDialog === 'function') ? window.showRichChoiceDialog : (title, msg, choices) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);z-index:100000;display:flex;justify-content:center;align-items:center;";
        overlay.innerHTML = `<div style="background:#111;border:2px solid #ff5252;padding:30px;border-radius:12px;text-align:center;max-width:400px;">
            <h3 style="color:#ff5252;margin-top:0;">${title}</h3>
            <p style="color:#eee;line-height:1.6;">${msg.replace(/\n/g, '<br>')}</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
                ${choices.map((c,i) => `<button id="rich-choice-${i}" style="padding:10px 20px;background:${c.color};color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">${c.text}</button>`).join('')}
            </div>
        </div>`;
        document.body.appendChild(overlay);
        choices.forEach((c,i) => document.getElementById(`rich-choice-${i}`).onclick = () => { overlay.remove(); c.action(); });
    };

    showConfirm(
        "🏳️ 戦線離脱の確認",
        "このままロビーへ戻りますか？\n（今回の連勝記録は途絶え、回復薬が3個にリセットされます）",
        [
            { text: "撤退する", color: "#d32f2f", action: () => {
                let state = window.ARENA_STATE;
                state.active = false;
                state.autoMode = false;
                state.isProcessing = false;
                state.healPots = 3;
                document.getElementById('arena-battle-ui').style.display = 'none';
                if (document.getElementById('arena-interval-ui')) document.getElementById('arena-interval-ui').style.display = 'none';
                if (window._castleArenaQuestOrigin && typeof window.returnToCastleMap === 'function') window.returnToCastleMap('captain');
                else window.openArenaReception();
            }},
            { text: "戦い続ける", color: "#444", action: () => {} }
        ]
    );
};
