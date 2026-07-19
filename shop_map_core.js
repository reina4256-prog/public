// ==========================================
// 📄 shop_map_core.js
// 店舗（レストラン等）の屋内物理マップシステム
// ==========================================

// ==========================================
// ★ 修正：Lv1から経営可能なロードマップへ再構築
// ==========================================
window.SHOP_LEVEL_MILESTONES = {
    1: { desc: "お店オープン！基本設備解禁", maxScore: 40, maxCustomers: 2, unlocks: ['item_table', 'item_chair', 'item_register', 'item_fridge', 'item_stove', 'item_oven'] },
    2: { desc: "客足増加", maxScore: 50, maxCustomers: 3, unlocks: [] },
    3: { desc: "カウンター席の解禁", maxScore: 60, maxCustomers: 3, unlocks: ['item_counter', 'item_stool'] },
    4: { desc: "レイアウトスコア上限UP", maxScore: 70, maxCustomers: 4, unlocks: [] },
    5: { desc: "フロア拡張（1階の敷地拡大）", maxScore: 90, maxCustomers: 4, expandFloor: true, unlocks: [] },
    6: { desc: "客足増加", maxScore: 100, maxCustomers: 5, unlocks: [] },
    7: { desc: "レイアウトスコア上限UP", maxScore: 110, maxCustomers: 5, unlocks: [] },
    8: { desc: "客足増加", maxScore: 120, maxCustomers: 6, unlocks: [] },
    9: { desc: "上質なテーブル解禁", maxScore: 130, maxCustomers: 6, unlocks: ['item_high_table'] },
    10: { desc: "2階フロアの解禁！", maxScore: 150, maxCustomers: 7, unlocks: ['item_stairs'] },
    11: { desc: "客足増加", maxScore: 160, maxCustomers: 7, unlocks: [] },
    12: { desc: "レイアウトスコア上限UP", maxScore: 180, maxCustomers: 8, unlocks: [] },
    13: { desc: "上質なイス解禁", maxScore: 200, maxCustomers: 8, unlocks: ['item_high_chair'] },
    14: { desc: "客足増加", maxScore: 220, maxCustomers: 9, unlocks: [] },
    15: { desc: "高級インテリア解禁", maxScore: 240, maxCustomers: 9, unlocks: ['item_plant', 'item_candle'] },
    16: { desc: "レイアウトスコア上限UP", maxScore: 260, maxCustomers: 10, unlocks: [] },
    17: { desc: "客足増加", maxScore: 280, maxCustomers: 10, unlocks: [] },
    18: { desc: "最新型冷蔵庫の解禁", maxScore: 300, maxCustomers: 11, unlocks: ['item_super_fridge'] },
    19: { desc: "レイアウトスコア上限UP", maxScore: 320, maxCustomers: 11, unlocks: [] },
    20: { desc: "高級カウンター解禁", maxScore: 350, maxCustomers: 12, unlocks: ['item_lux_counter'] },
    21: { desc: "客足増加", maxScore: 370, maxCustomers: 12, unlocks: [] },
    22: { desc: "レイアウトスコア上限UP", maxScore: 400, maxCustomers: 13, unlocks: [] },
    23: { desc: "地下フロアの解禁！", maxScore: 430, maxCustomers: 13, unlocks: ['item_basement_stairs'] },
    24: { desc: "客足増加", maxScore: 450, maxCustomers: 14, unlocks: [] },
    25: { desc: "最高級テーブル解禁", maxScore: 480, maxCustomers: 14, unlocks: ['item_luxury_table'] },
    26: { desc: "レイアウトスコア上限UP", maxScore: 500, maxCustomers: 15, unlocks: [] },
    27: { desc: "客足増加", maxScore: 520, maxCustomers: 15, unlocks: [] },
    28: { desc: "レイアウトスコア上限UP", maxScore: 550, maxCustomers: 16, unlocks: [] },
    29: { desc: "客足増加", maxScore: 580, maxCustomers: 18, unlocks: [] },
    30: { desc: "三ツ星レストラン！伝説の厨房解禁", maxScore: 600, maxCustomers: 20, unlocks: ['item_legendary_kitchen'] }
};

// ==========================================
// ★ レストラン経営：NPC（客層）特性データ
// ==========================================
window.CUSTOMER_TRAITS = {
    // 【ロボット系】 (21種)
    "robot": { favDish: 'dish_stirfry', patience: 150, eatSpeed: 100, appetite: 1, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "robot_type3": { favDish: 'dish_soup', patience: 180, eatSpeed: 100, appetite: 1, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 2 },
    "robot_type3_2": { favDish: 'dish_minestrone', patience: 200, eatSpeed: 90, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 2 },
    "robot_type3_3": { favDish: 'dish_sushi', patience: 220, eatSpeed: 80, appetite: 1, chipChance: 0.2, loyaltyReq: 4, loyaltyDrop: 2 },
    "robot_type3_4": { favDish: 'poison_mushroom', patience: 100, eatSpeed: 50, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "robot_type3_5": { favDish: 'supreme_sweets', patience: 250, eatSpeed: 100, appetite: 1, chipChance: 0.5, loyaltyReq: 4, loyaltyDrop: 1 },
    "robot_type2": { favDish: 'dish_strawberry_cake', patience: 100, eatSpeed: 120, appetite: 1, chipChance: 0.3, loyaltyReq: 2, loyaltyDrop: 4 },
    "robot_type2_2": { favDish: 'dish_fruit_tart', patience: 90, eatSpeed: 130, appetite: 1, chipChance: 0.4, loyaltyReq: 2, loyaltyDrop: 5 },
    "robot_type2_3": { favDish: 'dish_melon_parfait', patience: 110, eatSpeed: 110, appetite: 1, chipChance: 0.5, loyaltyReq: 3, loyaltyDrop: 3 },
    "robot_type2_4": { favDish: 'dish_steak', patience: 80, eatSpeed: 120, appetite: 2, chipChance: 0.8, loyaltyReq: 5, loyaltyDrop: 5 },
    "robot_type4": { favDish: 'dish_curry', patience: 200, eatSpeed: 60, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "robot_type4_2": { favDish: 'dish_steak', patience: 220, eatSpeed: 40, appetite: 3, chipChance: 0.05, loyaltyReq: 2, loyaltyDrop: 1 },
    "robot_type4_3": { favDish: 'dish_curry', patience: 80, eatSpeed: 30, appetite: 4, chipChance: 0.0, loyaltyReq: 4, loyaltyDrop: 5 },
    "robot_type4_4": { favDish: 'dish_omurice', patience: 300, eatSpeed: 50, appetite: 5, chipChance: 0.1, loyaltyReq: 4, loyaltyDrop: 1 },
    "robot_type1": { favDish: 'burnt_food', patience: 50, eatSpeed: 30, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "robot_type1_2": { favDish: 'rotten_food', patience: 60, eatSpeed: 40, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "robot_type1_3": { favDish: 'rotten_veg', patience: 40, eatSpeed: 20, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "robot_type5": { favDish: 'water', patience: 300, eatSpeed: 200, appetite: 1, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 1 },
    "robot_type5_2": { favDish: 'herb', patience: 400, eatSpeed: 220, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 1 },
    "robot_type5_3": { favDish: 'baked_tomato', patience: 350, eatSpeed: 180, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "robot_type5_4": { favDish: 'water', patience: 999, eatSpeed: 300, appetite: 1, chipChance: 0.0, loyaltyReq: 2, loyaltyDrop: 1 },

    // 【精霊系】 (14種)
    "spirit": { favDish: 'dish_salad', patience: 180, eatSpeed: 120, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "spirit_type2": { favDish: 'dish_fruit_tart', patience: 140, eatSpeed: 130, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 2 },
    "spirit_type2_2": { favDish: 'dish_honey_pudding', patience: 150, eatSpeed: 120, appetite: 1, chipChance: 0.25, loyaltyReq: 2, loyaltyDrop: 2 },
    "spirit_type2_3": { favDish: 'dish_melon_parfait', patience: 120, eatSpeed: 140, appetite: 1, chipChance: 0.5, loyaltyReq: 3, loyaltyDrop: 3 },
    "spirit_type4": { favDish: 'baked_carrot', patience: 220, eatSpeed: 100, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "spirit_type4_2": { favDish: 'dish_stirfry', patience: 150, eatSpeed: 80, appetite: 3, chipChance: 0.0, loyaltyReq: 4, loyaltyDrop: 4 },
    "spirit_type4_3": { favDish: 'dish_steak', patience: 100, eatSpeed: 50, appetite: 3, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 3 },
    "spirit_type5": { favDish: 'water', patience: 400, eatSpeed: 250, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "spirit_type5_2": { favDish: 'herb', patience: 450, eatSpeed: 240, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "spirit_type5_3": { favDish: 'ice_crystal', patience: 500, eatSpeed: 280, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "spirit_type1": { favDish: 'poison_mushroom', patience: 120, eatSpeed: 90, appetite: 1, chipChance: 0.0, loyaltyReq: 4, loyaltyDrop: 3 },
    "spirit_type1_2": { favDish: 'rotten_veg', patience: 80, eatSpeed: 60, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "spirit_type3": { favDish: 'dish_minestrone', patience: 200, eatSpeed: 110, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "spirit_type3_2": { favDish: 'supreme_sweets', patience: 250, eatSpeed: 100, appetite: 1, chipChance: 0.4, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【魔法使い系】 (19種)
    "magician": { favDish: 'dish_soup', patience: 160, eatSpeed: 110, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 2 },
    "magician_type4": { favDish: 'dish_curry', patience: 120, eatSpeed: 70, appetite: 2, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 2 },
    "magician_type4_2": { favDish: 'dish_steak', patience: 80, eatSpeed: 50, appetite: 3, chipChance: 0.15, loyaltyReq: 4, loyaltyDrop: 4 },
    "magician_type4_3": { favDish: 'baked_fish', patience: 100, eatSpeed: 40, appetite: 3, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 2 },
    "magician_type4_4": { favDish: 'dish_steak', patience: 60, eatSpeed: 30, appetite: 4, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 5 },
    "magician_type1": { favDish: 'poison_mushroom', patience: 70, eatSpeed: 80, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "magician_type1_2": { favDish: 'rotten_food', patience: 60, eatSpeed: 60, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "magician_type1_3": { favDish: 'rotten_fish', patience: 50, eatSpeed: 50, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "magician_type1_4": { favDish: 'burnt_food', patience: 40, eatSpeed: 40, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "magician_type5": { favDish: 'baked_tomato', patience: 300, eatSpeed: 200, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 1 },
    "magician_type5_2": { favDish: 'dish_soup', patience: 400, eatSpeed: 220, appetite: 1, chipChance: 0.25, loyaltyReq: 2, loyaltyDrop: 1 },
    "magician_type5_3": { favDish: 'dish_minestrone', patience: 500, eatSpeed: 250, appetite: 1, chipChance: 0.3, loyaltyReq: 2, loyaltyDrop: 1 },
    "magician_type2": { favDish: 'dish_pancakes', patience: 120, eatSpeed: 100, appetite: 1, chipChance: 0.3, loyaltyReq: 3, loyaltyDrop: 3 },
    "magician_type2_2": { favDish: 'dish_fruit_tart', patience: 130, eatSpeed: 110, appetite: 1, chipChance: 0.25, loyaltyReq: 3, loyaltyDrop: 3 },
    "magician_type2_3": { favDish: 'dish_melon_parfait', patience: 100, eatSpeed: 120, appetite: 1, chipChance: 0.4, loyaltyReq: 4, loyaltyDrop: 4 },
    "magician_type2_4": { favDish: 'supreme_sweets', patience: 200, eatSpeed: 100, appetite: 1, chipChance: 0.5, loyaltyReq: 2, loyaltyDrop: 1 },
    "magician_type3": { favDish: 'dish_sushi', patience: 200, eatSpeed: 90, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 2 },
    "magician_type3_2": { favDish: 'dish_soup', patience: 250, eatSpeed: 100, appetite: 1, chipChance: 0.25, loyaltyReq: 3, loyaltyDrop: 1 },
    "magician_type3_3": { favDish: 'dish_minestrone', patience: 300, eatSpeed: 90, appetite: 1, chipChance: 0.3, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【鳥系】 (12種)
    "bird": { favDish: 'dish_omurice', patience: 130, eatSpeed: 80, appetite: 1, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 2 },
    "bird_type2": { favDish: 'dish_fruit_tart', patience: 120, eatSpeed: 90, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 2 },
    "bird_type2_2": { favDish: 'supreme_sweets', patience: 140, eatSpeed: 100, appetite: 1, chipChance: 0.4, loyaltyReq: 3, loyaltyDrop: 3 },
    "bird_type4": { favDish: 'dish_steak', patience: 100, eatSpeed: 50, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "bird_type4_2": { favDish: 'dish_curry', patience: 80, eatSpeed: 40, appetite: 3, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 4 },
    "bird_type5": { favDish: 'baked_fish', patience: 250, eatSpeed: 150, appetite: 1, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 1 },
    "bird_type5_2": { favDish: 'baked_tomato', patience: 300, eatSpeed: 180, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "bird_type1": { favDish: 'rotten_food', patience: 80, eatSpeed: 70, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 4 },
    "bird_type1_2": { favDish: 'rotten_fish', patience: 60, eatSpeed: 50, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "bird_type3": { favDish: 'dish_salad', patience: 150, eatSpeed: 90, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 2 },
    "bird_type3_2": { favDish: 'dish_soup', patience: 180, eatSpeed: 80, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "bird_type3_3": { favDish: 'dish_minestrone', patience: 220, eatSpeed: 70, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【機械系】 (12種)
    "machine": { favDish: 'dish_stirfry', patience: 200, eatSpeed: 130, appetite: 1, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "machine_type2": { favDish: 'dish_strawberry_cake', patience: 150, eatSpeed: 140, appetite: 1, chipChance: 0.25, loyaltyReq: 2, loyaltyDrop: 2 },
    "machine_type2_2": { favDish: 'dish_honey_pudding', patience: 160, eatSpeed: 150, appetite: 1, chipChance: 0.35, loyaltyReq: 2, loyaltyDrop: 2 },
    "machine_type4": { favDish: 'dish_steak', patience: 120, eatSpeed: 90, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "machine_type4_2": { favDish: 'dish_curry', patience: 90, eatSpeed: 70, appetite: 3, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 3 },
    "machine_type5": { favDish: 'baked_pepper', patience: 400, eatSpeed: 250, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "machine_type5_2": { favDish: 'herb', patience: 450, eatSpeed: 220, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "machine_type5_3": { favDish: 'water', patience: 500, eatSpeed: 280, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 1 },
    "machine_type1": { favDish: 'burnt_food', patience: 70, eatSpeed: 80, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "machine_type1_2": { favDish: 'rotten_veg', patience: 50, eatSpeed: 50, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "machine_type3": { favDish: 'dish_soup', patience: 220, eatSpeed: 110, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "machine_type3_2": { favDish: 'dish_minestrone', patience: 260, eatSpeed: 100, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【石系】 (13種)
    "stone": { favDish: 'baked_carrot', patience: 300, eatSpeed: 200, appetite: 1, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 1 },
    "stone_type2": { favDish: 'dish_fruit_tart', patience: 250, eatSpeed: 180, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 2 },
    "stone_type2_2": { favDish: 'supreme_sweets', patience: 200, eatSpeed: 160, appetite: 1, chipChance: 0.6, loyaltyReq: 4, loyaltyDrop: 3 },
    "stone_type4": { favDish: 'dish_curry', patience: 250, eatSpeed: 150, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "stone_type4_2": { favDish: 'dish_steak', patience: 280, eatSpeed: 160, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "stone_type4_3": { favDish: 'baked_meat', patience: 200, eatSpeed: 120, appetite: 3, chipChance: 0.1, loyaltyReq: 4, loyaltyDrop: 2 },
    "stone_type5": { favDish: 'water', patience: 600, eatSpeed: 300, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "stone_type5_2": { favDish: 'herb', patience: 700, eatSpeed: 280, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "stone_type5_3": { favDish: 'dish_soup', patience: 500, eatSpeed: 250, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "stone_type1": { favDish: 'poison_mushroom', patience: 100, eatSpeed: 100, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 4 },
    "stone_type1_2": { favDish: 'rotten_food', patience: 80, eatSpeed: 80, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "stone_type3": { favDish: 'dish_minestrone', patience: 350, eatSpeed: 170, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "stone_type3_2": { favDish: 'dish_sushi', patience: 400, eatSpeed: 160, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【風船系】 (15種)
    "balloon": { favDish: 'dish_pancakes', patience: 140, eatSpeed: 110, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 2 },
    "balloon_type2": { favDish: 'dish_honey_pudding', patience: 120, eatSpeed: 100, appetite: 1, chipChance: 0.25, loyaltyReq: 2, loyaltyDrop: 3 },
    "balloon_type2_2": { favDish: 'dish_fruit_tart', patience: 110, eatSpeed: 120, appetite: 1, chipChance: 0.3, loyaltyReq: 3, loyaltyDrop: 3 },
    "balloon_type2_3": { favDish: 'dish_melon_parfait', patience: 100, eatSpeed: 90, appetite: 1, chipChance: 0.4, loyaltyReq: 3, loyaltyDrop: 4 },
    "balloon_type4": { favDish: 'dish_omurice', patience: 130, eatSpeed: 80, appetite: 2, chipChance: 0.1, loyaltyReq: 3, loyaltyDrop: 2 },
    "balloon_type4_2": { favDish: 'dish_curry', patience: 100, eatSpeed: 60, appetite: 3, chipChance: 0.1, loyaltyReq: 4, loyaltyDrop: 3 },
    "balloon_type4_3": { favDish: 'dish_steak', patience: 90, eatSpeed: 50, appetite: 4, chipChance: 0.15, loyaltyReq: 4, loyaltyDrop: 3 },
    "balloon_type1": { favDish: 'rotten_veg', patience: 80, eatSpeed: 90, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 4 },
    "balloon_type1_2": { favDish: 'burnt_food', patience: 60, eatSpeed: 60, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "balloon_type1_3": { favDish: 'poison_mushroom', patience: 40, eatSpeed: 40, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "balloon_type5": { favDish: 'water', patience: 300, eatSpeed: 200, appetite: 1, chipChance: 0.05, loyaltyReq: 2, loyaltyDrop: 1 },
    "balloon_type5_2": { favDish: 'baked_pepper', patience: 350, eatSpeed: 180, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "balloon_type3": { favDish: 'dish_salad', patience: 160, eatSpeed: 100, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "balloon_type3_2": { favDish: 'dish_soup', patience: 180, eatSpeed: 90, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },
    "balloon_type3_3": { favDish: 'dish_minestrone', patience: 200, eatSpeed: 80, appetite: 1, chipChance: 0.25, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【幽霊系】 (11種)
    "ghost": { favDish: 'dish_soup', patience: 170, eatSpeed: 140, appetite: 1, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "ghost_type2": { favDish: 'dish_honey_pudding', patience: 160, eatSpeed: 130, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 1 },
    "ghost_type2_2": { favDish: 'supreme_sweets', patience: 180, eatSpeed: 120, appetite: 1, chipChance: 0.3, loyaltyReq: 2, loyaltyDrop: 1 },
    "ghost_type4": { favDish: 'dish_stirfry', patience: 100, eatSpeed: 80, appetite: 2, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 3 },
    "ghost_type4_2": { favDish: 'dish_steak', patience: 80, eatSpeed: 60, appetite: 3, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 4 },
    "ghost_type5": { favDish: 'water', patience: 500, eatSpeed: 250, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "ghost_type5_2": { favDish: 'baked_fish', patience: 450, eatSpeed: 220, appetite: 1, chipChance: 0.2, loyaltyReq: 2, loyaltyDrop: 1 },
    "ghost_type1": { favDish: 'rotten_fish', patience: 70, eatSpeed: 70, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "ghost_type1_2": { favDish: 'rotten_food', patience: 50, eatSpeed: 50, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "ghost_type3": { favDish: 'dish_minestrone', patience: 220, eatSpeed: 120, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "ghost_type3_2": { favDish: 'dish_sushi', patience: 250, eatSpeed: 100, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },

    // 【虫系】 (11種)
    "beetle": { favDish: 'dish_salad', patience: 150, eatSpeed: 90, appetite: 1, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "beetle_type4": { favDish: 'dish_stirfry', patience: 120, eatSpeed: 60, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 2 },
    "beetle_type5": { favDish: 'baked_tomato', patience: 350, eatSpeed: 180, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "beetle_type5_2": { favDish: 'water', patience: 800, eatSpeed: 250, appetite: 1, chipChance: 0.05, loyaltyReq: 2, loyaltyDrop: 1 },
    "beetle_type2": { favDish: 'dish_fruit_tart', patience: 130, eatSpeed: 100, appetite: 1, chipChance: 0.3, loyaltyReq: 3, loyaltyDrop: 3 },
    "beetle_type2_2": { favDish: 'dish_honey_pudding', patience: 120, eatSpeed: 110, appetite: 1, chipChance: 0.35, loyaltyReq: 3, loyaltyDrop: 3 },
    "beetle_type2_3": { favDish: 'dish_melon_parfait', patience: 110, eatSpeed: 120, appetite: 1, chipChance: 0.4, loyaltyReq: 4, loyaltyDrop: 4 },
    "beetle_type2_4": { favDish: 'supreme_sweets', patience: 180, eatSpeed: 100, appetite: 1, chipChance: 0.5, loyaltyReq: 2, loyaltyDrop: 1 },
    "beetle_type3": { favDish: 'dish_soup', patience: 180, eatSpeed: 80, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "beetle_type1": { favDish: 'rotten_veg', patience: 60, eatSpeed: 50, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "beetle_type4_2": { favDish: 'dish_steak', patience: 90, eatSpeed: 40, appetite: 3, chipChance: 0.1, loyaltyReq: 4, loyaltyDrop: 3 },

    // 【種系】 (12種)
    "seed": { favDish: 'water', patience: 250, eatSpeed: 150, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "seed_type4": { favDish: 'dish_salad', patience: 200, eatSpeed: 120, appetite: 2, chipChance: 0.05, loyaltyReq: 3, loyaltyDrop: 1 },
    "seed_type4_2": { favDish: 'dish_curry', patience: 150, eatSpeed: 80, appetite: 3, chipChance: 0.05, loyaltyReq: 4, loyaltyDrop: 2 },
    "seed_type1": { favDish: 'poison_mushroom', patience: 100, eatSpeed: 90, appetite: 1, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 4 },
    "seed_type1_2": { favDish: 'rotten_food', patience: 80, eatSpeed: 70, appetite: 2, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "seed_type5": { favDish: 'baked_pepper', patience: 500, eatSpeed: 200, appetite: 1, chipChance: 0.15, loyaltyReq: 2, loyaltyDrop: 1 },
    "seed_type5_2": { favDish: 'water', patience: 999, eatSpeed: 300, appetite: 1, chipChance: 0.1, loyaltyReq: 2, loyaltyDrop: 1 },
    "seed_type3": { favDish: 'dish_soup', patience: 280, eatSpeed: 130, appetite: 1, chipChance: 0.15, loyaltyReq: 3, loyaltyDrop: 1 },
    "seed_type3_2": { favDish: 'dish_minestrone', patience: 300, eatSpeed: 120, appetite: 1, chipChance: 0.2, loyaltyReq: 3, loyaltyDrop: 1 },
    "seed_type3_3": { favDish: 'dish_sushi', patience: 350, eatSpeed: 110, appetite: 1, chipChance: 0.25, loyaltyReq: 3, loyaltyDrop: 1 },
    "seed_type2": { favDish: 'dish_fruit_tart', patience: 220, eatSpeed: 140, appetite: 1, chipChance: 0.25, loyaltyReq: 2, loyaltyDrop: 2 },
    "seed_type2_2": { favDish: 'supreme_sweets', patience: 250, eatSpeed: 120, appetite: 1, chipChance: 0.5, loyaltyReq: 2, loyaltyDrop: 1 },

    // 【ドラゴン系】 (12種)
    "dragon": { favDish: 'dish_steak', patience: 120, eatSpeed: 60, appetite: 2, chipChance: 0.3, loyaltyReq: 4, loyaltyDrop: 3 },
    "dragon_type4": { favDish: 'dish_curry', patience: 90, eatSpeed: 50, appetite: 3, chipChance: 0.2, loyaltyReq: 4, loyaltyDrop: 4 },
    "dragon_type4_2": { favDish: 'supreme_sweets', patience: 60, eatSpeed: 40, appetite: 5, chipChance: 0.9, loyaltyReq: 5, loyaltyDrop: 5 },
    "dragon_type1": { favDish: 'rotten_meat', patience: 70, eatSpeed: 50, appetite: 2, chipChance: 0.05, loyaltyReq: 5, loyaltyDrop: 5 },
    "dragon_type1_2": { favDish: 'rotten_food', patience: 50, eatSpeed: 30, appetite: 3, chipChance: 0.0, loyaltyReq: 5, loyaltyDrop: 5 },
    "dragon_type5": { favDish: 'baked_fish', patience: 300, eatSpeed: 150, appetite: 1, chipChance: 0.4, loyaltyReq: 3, loyaltyDrop: 1 },
    "dragon_type5_2": { favDish: 'water', patience: 500, eatSpeed: 200, appetite: 1, chipChance: 0.5, loyaltyReq: 2, loyaltyDrop: 1 },
    "dragon_type3": { favDish: 'dish_sushi', patience: 180, eatSpeed: 90, appetite: 1, chipChance: 0.4, loyaltyReq: 3, loyaltyDrop: 2 },
    "dragon_type3_2": { favDish: 'dish_soup', patience: 200, eatSpeed: 80, appetite: 1, chipChance: 0.5, loyaltyReq: 3, loyaltyDrop: 1 },
    "dragon_type2": { favDish: 'dish_melon_parfait', patience: 100, eatSpeed: 100, appetite: 1, chipChance: 0.6, loyaltyReq: 4, loyaltyDrop: 4 },
    "dragon_type2_2": { favDish: 'dish_strawberry_cake', patience: 150, eatSpeed: 110, appetite: 1, chipChance: 0.7, loyaltyReq: 3, loyaltyDrop: 2 },
    "dragon_type2_3": { favDish: 'dish_fruit_tart', patience: 130, eatSpeed: 120, appetite: 1, chipChance: 0.8, loyaltyReq: 3, loyaltyDrop: 2 },

    // 【フレンド・NPC特別枠】
    "friend_npc": { favDish: 'any', patience: 9999, eatSpeed: 80, appetite: 1, chipChance: 0.50, isFriend: true }
};

// ==========================================
// ★ UI表示用：スキル名と説明のテキストデータ（全152種完全版）
// ==========================================
window.SHOP_SKILL_TEXTS = window.SHOP_SKILL_TEXTS || {};

Object.assign(window.SHOP_SKILL_TEXTS, {
    // ■ 1. ロボット系 (21種)
    "robot": { name: "🌙[基本]正確な計量 / ☀️[基本]キャタピラ走行", desc: "仕込み時、5%の確率で素材を消費しない。店内の移動速度が少し早くなる。" },
    "robot_type2": { name: "🌙[ルート]データ収集 / ☀️[ルート]スマイル0円", desc: "毎晩客の好みを分析し、翌日の料理の相場低下ペナルティを軽減する。お客さんがチップをくれる確率が10%上がる。" },
    "robot_type3": { name: "🌙[ルート]並列思考 / ☀️[ルート]需要予測", desc: "レシピ開発の進捗が+5%多く進む。（※全レシピ完了後は仕込みの素材消費無効化+5%）ロボット系の客が少し来店しやすくなる。" },
    "robot_type3_2": { name: "🌙[ルート]大容量メモリ / ☀️[ルート]マルチタスク", desc: "レシピ開発の進捗が+5%多く進む。（※全開発後は毎晩開発済み料理の在庫がランダムで+1）レジ打ちの速度が上がる。" },
    "robot_type4": { name: "🌙[ルート]圧縮プレス / ☀️[ルート]安定運搬", desc: "仕込みを実行した際、10%の確率で在庫が同時に+2個増える。冷蔵庫から料理を取り出す速度が上がる。" },
    "robot_type4_2": { name: "🌙[ルート]フル稼働 / ☀️[ルート]威嚇射撃", desc: "閉店時の全作業（つくる・かえる等）の速度が上がる。客が怒って帰った時の評判低下を少し軽減する。" },
    "robot_type1": { name: "🌙[ルート]ブラックマーケット / ☀️[ルート]威圧感", desc: "料理の値段を決める際、強気な高い価格設定になりやすい。高い価格設定でも、客が怒る確率を10%下げる。" },
    "robot_type5": { name: "🌙[ルート]廃材利用 / ☀️[ルート]エコ設計", desc: "仕込み時、素材を消費しない確率がさらに+10%される。客の食事速度を少し上げ、回転率をよくする。" },
    "robot_type2_2": { name: "🌙[専用]空間調律 / ☀️[専用]天使の歌声", desc: "家具の配置を変更すると、お店の評判が10%回復する。お会計時に発生するチップの金額が常に「2倍」になる。" },
    "robot_type2_3": { name: "🌙[専用]サブリミナル広告 / ☀️[専用]アップテンポ", desc: "閉店時、翌日の客の来店頻度を少し上げる。店内の客の食事速度が1.5倍に高速化する。" },
    "robot_type2_4": { name: "🌙[専用]成金趣味 / ☀️[専用]セレブ誘致", desc: "相場が下がった一番安い料理の相場を、閉店時に少し回復させる。チップを多くくれるドラゴンや魔法使い系の来店率が大きく上がる。" },
    "robot_type3_3": { name: "🌙[専用]超演算 / ☀️[専用]最適化ルート", desc: "レシピ開発の進捗が+15%進む。（※全開発後は仕込み素材消費無効+15%）移動時の無駄なウェイトがなくなり最高速度で直進する。" },
    "robot_type3_4": { name: "🌙[専用]素材合成 / ☀️[専用]オートレジ", desc: "仕込み時、不足素材を別の余剰素材で代用できる確率が20%発生する。レジ打ちの作業が一瞬で終わる。" },
    "robot_type3_5": { name: "🌙[専用]DIYの極意 / ☀️[専用]空間拡張", desc: "家具を設置・変更した夜、レイアウトスコア上限が永久に+2加算される。満席で怒って帰る客の50%をテイクアウト待機へ誘導する。" },
    "robot_type4_3": { name: "🌙[専用]超高速解体 / ☀️[専用]ドライブサーボ", desc: "模様替え時の家具撤去が一瞬で終わる。冷蔵庫から料理を取り出す速度が極限まで上がる。" },
    "robot_type4_4": { name: "🌙[専用]永久機関 / ☀️[専用]急速充電", desc: "閉店中のすべての作業速度が倍になる。レジ待ちの客全員の忍耐力が一切減らなくなる。" },
    "robot_type1_2": { name: "🌙[専用]闇の取引 / ☀️[専用]ステルス", desc: "料理の価格設定時、さらに強気な高い値段が出やすくなる。客席間の移動時、すれ違った客の忍耐力を少し回復させる。" },
    "robot_type1_3": { name: "🌙[専用]終末計画 / ☀️[専用]恐怖政治", desc: "閉店時、ランダムな料理1つの相場を強引に10%引き上げる。まずい料理を出しても、お店の評判が一切低下しなくなる。" },
    "robot_type5_2": { name: "🌙[専用]遺跡発掘 / ☀️[専用]迎撃シールド", desc: "研究進捗が+10%。（※全開発後は閉店時に取得済みの素材をランダムに1つ拾う）待たせすぎ等のクレーム時の評判低下を半減する。" },
    "robot_type5_3": { name: "🌙[専用]オーバークロック / ☀️[専用]タイムリワインド", desc: "閉店中のすべての作業速度が劇的に上がる。テイクアウト待ちの客の忍耐力減少速度を半分にする。" },
    "robot_type5_4": { name: "🌙[専用]大地の恵み / ☀️[専用]不動の構え", desc: "野菜系の料理を仕込む際、消費素材を50%の確率で0にする。レジ裏に立っている間、レジ待ち客全員の忍耐力減少が半分になる。" },

    // ■ 2. 精霊系 (14種)
    "spirit": { name: "🌙[基本]恵みの風 / ☀️[基本]森林浴", desc: "仕込み時、野菜系料理の在庫生成数が10%の確率で+1される。店内の全客の初期忍耐力が+10された状態で来店する。" },
    "spirit_type2": { name: "🌙[ルート]春の芽吹き / ☀️[ルート]春の陽気", desc: "レイアウト変更時、植物系家具があるとその夜だけ相場が少し上向く。イートイン客の食後のチップ発生確率が+10%される。" },
    "spirit_type4": { name: "🌙[ルート]深い根張り / ☀️[ルート]木陰の癒やし", desc: "家具を新しく置いた日、レイアウトスコア上限を一時的に+5する。食事中の客の食事速度を少し上げる。" },
    "spirit_type5": { name: "🌙[ルート]落ち葉拾い / ☀️[ルート]哀愁の漂い", desc: "閉店時、たまに1度でも取得したことのある素材を1つ拾う。満席で帰る客の30%をテイクアウトに誘導する。" },
    "spirit_type1": { name: "🌙[ルート]毒素抽出 / ☀️[ルート]痺れる接客", desc: "研究進捗が+15%。（※全開発後は仕込み時の作業速度が少し上がる）客の食事速度が下がる代わりに、チップ発生率が+15%される。" },
    "spirit_type3": { name: "🌙[ルート]植物図鑑 / ☀️[ルート]効率配膳", desc: "野菜系料理の研究進捗が+20%。（※全開発後は野菜料理の相場下落を無効化）料理を提供する速度が少し上がる。" },
    "spirit_type2_2": { name: "🌙[専用]満開の庭 / ☀️[専用]フラワーセラピー", desc: "お店が「殺風景」な時の模様替え作業速度が劇的に上がる。料理がまずかった時の評判低下を0にする。" },
    "spirit_type2_3": { name: "🌙[専用]水面の鏡 / ☀️[専用]光の屈折", desc: "閉店時、その日最も売れなかった料理の相場を少し底上げする。チップをもらう時、20%の確率で金額が倍になる。" },
    "spirit_type4_2": { name: "🌙[専用]大樹の加護 / ☀️[専用]巨木の構え", desc: "お店全体のレイアウトスコア上限が常に+10される。レジ待ちの客の忍耐力が減らなくなる。" },
    "spirit_type4_3": { name: "🌙[専用]聖域化 / ☀️[専用]ネイチャーウォール", desc: "仕込み時、10%の確率でその料理の在庫がさらに+3される。クレーム時の評判低下を大きく軽減する。" },
    "spirit_type5_2": { name: "🌙[専用]豊穣の秋 / ☀️[専用]焼き芋の香り", desc: "仕込み時、素材を消費しない確率がさらに+15%アップする。テイクアウト客のレジ打ちが一瞬で終わる。" },
    "spirit_type5_3": { name: "🌙[専用]永久凍土 / ☀️[専用]フリーズドライ", desc: "閉店時、在庫が余っている料理の相場低下ペナルティを完全に無効化する。冷蔵庫から料理を取り出す速度が極限まで上がる。" },
    "spirit_type1_2": { name: "🌙[専用]地中の叫び / ☀️[専用]デススクリーム", desc: "閉店時の全作業速度が一段階上がる。客が怒って帰る確率が上がるが、常連客からのチップ額が3倍になる。" },
    "spirit_type3_2": { name: "🌙[専用]アカシック・レコード / ☀️[専用]未来予知配膳", desc: "研究進捗が常に+30%進む。（※全開発後は仕込み素材消費を25%無効化）配膳時の移動速度が1.5倍になる。" },

    // ■ 3. 魔法使い系 (19種)
    "magician": { name: "🌙[基本]錬金術の基礎 / ☀️[基本]浮遊魔術", desc: "仕込み時、5%の確率で素材消費が0になる。移動速度が少し早くなる。" },
    "magician_type4": { name: "🌙[ルート]集中力 / ☀️[ルート]魔力充填", desc: "研究進捗が+10%。（※全開発後は仕込みの生成数が10%の確率で+1される）配膳時の移動速度がさらにアップする。" },
    "magician_type4_2": { name: "🌙[ルート]業火の釜 / ☀️[ルート]陽炎", desc: "仕込みの作業速度が大きく上がる。イートイン客の食事速度が上がる。" },
    "magician_type1": { name: "🌙[ルート]毒薬調合 / ☀️[ルート]畏怖", desc: "研究進捗が+15%。（※全開発後は価格設定が少し上振れしやすくなる）ぼったくり価格に対する客の許容度が広がる。" },
    "magician_type1_2": { name: "🌙[ルート]禁忌研究 / ☀️[ルート]漆黒の衣", desc: "価格設定時、さらに強気な高い値段が出やすくなる。怒って帰った時の評判低下を少し軽減する。" },
    "magician_type5": { name: "🌙[ルート]賢者の知恵 / ☀️[ルート]魔力障壁", desc: "研究進捗が+15%。（※全開発後は家具配置時にスコア上限+2）客全員の忍耐力減少が少し遅くなる。" },
    "magician_type2": { name: "🌙[ルート]星明かり / ☀️[ルート]幻影の席", desc: "閉店時、ランダムに1つの料理の相場を少し上げる。満席で怒って帰る客を20%でテイクアウトに誘導する。" },
    "magician_type2_2": { name: "🌙[ルート]絶対零度 / ☀️[ルート]冷却配膳", desc: "冷蔵庫に保管してある料理の相場低下を完全に防ぐ。冷蔵庫から料理を取り出す速度が上がる。" },
    "magician_type3": { name: "🌙[ルート]星の導き / ☀️[ルート]天体観測", desc: "研究進捗が+20%。（※全開発後は閉店時に取得済みの素材を1つ拾う）常連客が来店しやすくなる。" },
    "magician_type4_3": { name: "🌙[専用]魔力圧縮 / ☀️[専用]テレポート配膳", desc: "仕込み時、10%で在庫が+3増える。冷蔵庫出しの作業が一瞬で終わる。" },
    "magician_type4_4": { name: "🌙[専用]竜の息吹 / ☀️[専用]ドラゴンロア", desc: "仕込みの作業速度が極限まで上がる。レジ待ちの客の忍耐力が減らなくなる。" },
    "magician_type1_3": { name: "🌙[専用]深淵の儀式 / ☀️[専用]死者蘇生", desc: "閉店時、評判を-1する代わりに全料理の相場を大きく上げる。怒って帰る客を強制的にテイクアウト列に並ばせる（50%）。" },
    "magician_type1_4": { name: "🌙[専用]悪魔の契約 / ☀️[専用]魅了の魔法", desc: "仕込み時、素材を消費しない確率がさらに+20%される。チップ発生率が+20%される。" },
    "magician_type5_2": { name: "🌙[専用]時間跳躍 / ☀️[専用]タイムストップ", desc: "閉店中のすべての作業速度が飛躍的に上がる。配膳待ちの客の忍耐力減少を完全に止める。" },
    "magician_type5_3": { name: "🌙[専用]相場操作マニフェスト / ☀️[専用]未来視のレジ", desc: "閉店時、ランダムな2つの料理の相場を強引に10%引き上げる。レジ打ち作業が一瞬で終わる。" },
    "magician_type2_3": { name: "🌙[専用]万華鏡の部屋 / ☀️[専用]光のプリズム", desc: "家具のレイアウト変更時、スコア上限を+10する。常連客からのチップ額が2.5倍になる。" },
    "magician_type2_4": { name: "🌙[専用]王宮の備蓄 / ☀️[専用]ロイヤル・ウェルカム", desc: "仕込みの生成数が常に+1される。満席時に帰る客を100%テイクアウト待機に変換する。" },
    "magician_type3_2": { name: "🌙[専用]アカシック生成 / ☀️[専用]ビッグバン・レジ", desc: "研究進捗が+30%。（※全開発後は素材消費率を常に30%無効化）レジ打ちの速度が劇的に上がる。" },
    "magician_type3_3": { name: "🌙[専用]全知全能 / ☀️[専用]アストラルシフト", desc: "研究の作業が一瞬で終わる。（※全開発後は価格設定が常に最高値付近になる）店内の全客の食事速度が2倍になる。" },

    // ■ 4. 鳥系 (12種)
    "bird": { name: "🌙[基本]狩猟本能 / ☀️[基本]飛行移動", desc: "仕込み時、10%の確率で「お肉」を消費しない。移動時のウェイトが減り、移動速度が少し早くなる。" },
    "bird_type2": { name: "🌙[ルート]魅惑の羽 / ☀️[ルート]美しい給仕", desc: "閉店時、一番安い料理の相場を少し引き上げる。チップ発生率が+10%される。" },
    "bird_type4": { name: "🌙[ルート]急降下 / ☀️[ルート]スナッチ", desc: "家具のレイアウト変更時の作業速度が上がる。冷蔵庫から料理を取り出す速度が上がる。" },
    "bird_type5": { name: "🌙[ルート]古き知恵 / ☀️[ルート]風読み", desc: "研究進捗が+15%。（※全開発後は閉店時に取得済みの素材をランダムに1つ拾う）常連客が来店しやすくなる。" },
    "bird_type1": { name: "🌙[ルート]夜行性 / ☀️[ルート]黒い翼", desc: "閉店中の「つくる」作業速度が上がる。ぼったくり価格に対する客の許容度が少し広がる。" },
    "bird_type3": { name: "🌙[ルート]俯瞰視点 / ☀️[ルート]的確な案内", desc: "研究進捗が+10%。（※全開発後は仕込み在庫が5%の確率で+2される）満席で怒って帰る客を20%でテイクアウト誘導。" },
    "bird_type3_2": { name: "🌙[ルート]素材選別 / ☀️[ルート]レジ直行", desc: "仕込み時、5%の確率で素材消費が0になる。レジ打ちの速度が上がる。" },
    "bird_type2_2": { name: "🌙[専用]虹色の羽 / ☀️[専用]天空の舞", desc: "閉店時、ランダムな2つの料理の相場を強引に引き上げる。チップの金額が常に「2倍」になる。" },
    "bird_type4_2": { name: "🌙[専用]神速の爪 / ☀️[専用]ソニックブーム", desc: "模様替え時の家具撤去が一瞬で終わる。冷蔵庫から客席への配膳移動速度が極限まで上がる。" },
    "bird_type5_2": { name: "🌙[専用]始祖の記憶 / ☀️[専用]悠久の風", desc: "研究進捗が+25%。（※全開発後はお肉の消費を20%の確率で0にする）店内の全客の忍耐力減少が少し遅くなる。" },
    "bird_type1_2": { name: "🌙[専用]闇夜の狩人 / ☀️[専用]ダークミスト", desc: "価格設定時、さらに強気な高い値段が出やすくなる。怒って帰る客の評判低下を「-2」軽減する。" },
    "bird_type3_3": { name: "🌙[専用]鷹の目 / ☀️[専用]完璧な誘導", desc: "家具設置時、レイアウトスコア上限が永久に+2加算される。満席時に帰る客を100%テイクアウト待機に変換する。" },

    // ■ 5. 機械系 (12種)
    "machine": { name: "🌙[基本]歯車機構 / ☀️[基本]精密駆動", desc: "閉店中のすべての行動の作業速度が少し早くなる。配膳準備（冷蔵庫出し）の速度が少し上がる。" },
    "machine_type2": { name: "🌙[ルート]装飾研磨 / ☀️[ルート]接客プロトコル", desc: "家具のレイアウト変更時、お店の評判が少し回復する。客全員の忍耐力減少が少し遅くなる。" },
    "machine_type4": { name: "🌙[ルート]ターボエンジン / ☀️[ルート]重運搬", desc: "仕込みの作業速度が大きく上がる。移動速度が少し上がる。" },
    "machine_type5": { name: "🌙[ルート]レトロフィット / ☀️[ルート]ヴィンテージ", desc: "仕込みの生成数が10%の確率で+1される。常連客からのチップ額が1.5倍になる。" },
    "machine_type1": { name: "🌙[ルート]違法改造 / ☀️[ルート]威圧駆動", desc: "料理の価格設定時、強気な高い値段が出やすくなる。クレーム時の評判低下を「-1」軽減する。" },
    "machine_type3": { name: "🌙[ルート]学習AI / ☀️[ルート]キャッシュ処理", desc: "研究進捗が+15%。（※全開発後は毎晩取得済みの素材を1つ拾う）レジ打ちの速度が上がる。" },
    "machine_type2_2": { name: "🌙[専用]オートメンテナンス / ☀️[専用]おもてなし稼働", desc: "閉店時、最も安い料理の相場を大きく回復させる。満席で怒る客を50%の確率でテイクアウトに誘導する。" },
    "machine_type4_2": { name: "🌙[専用]フルブースト / ☀️[専用]ハイパーダッシュ", desc: "仕込み時、10%の確率で在庫が同時に+3増える。冷蔵庫から客席までの配膳移動速度が1.5倍になる。" },
    "machine_type5_2": { name: "🌙[専用]ロストテクノロジー / ☀️[専用]古代の威光", desc: "研究進捗が+30%。（※全開発後は仕込み素材消費を20%で無効化）レジ待ちの客の忍耐力が減らなくなる。" },
    "machine_type5_3": { name: "🌙[専用]タイムリープ / ☀️[専用]時間制御", desc: "閉店中のすべての作業速度が劇的に上がる。テイクアウト客の忍耐力減少速度を半分にする。" },
    "machine_type1_2": { name: "🌙[専用]デス・マニュファクチャ / ☀️[専用]恐怖のサイボーグ", desc: "仕込み時、素材を消費しない確率が+15%される。ぼったくり価格に対する客の許容度が大きく広がる。" },
    "machine_type3_2": { name: "🌙[専用]スーパーコンピュータ / ☀️[専用]量子レジスター", desc: "研究の作業が一瞬で終わる。（※全開発後は仕込み速度が極限まで上がる）レジ打ちの作業が一瞬で終わる。" },

    // ■ 6. 石系 (13種)
    "stone": { name: "🌙[基本]頑強な土台 / ☀️[基本]重厚な歩み", desc: "家具設置時、レイアウトスコア上限が一時的に+2される。移動速度は変わらないがすれ違った客の忍耐力を少し回復。" },
    "stone_type2": { name: "🌙[ルート]宝石の輝き / ☀️[ルート]煌めく鉱石", desc: "閉店時、ランダムな料理1つの相場を10%引き上げる。チップ発生率が+10%される。" },
    "stone_type4": { name: "🌙[ルート]火山岩 / ☀️[ルート]熱気", desc: "仕込みの作業速度が上がる。店内の客の食事速度が上がる。" },
    "stone_type4_2": { name: "🌙[ルート]黒曜石 / ☀️[ルート]鉄壁", desc: "仕込み時、お肉の消費を10%の確率で無効化する。怒って帰る客の評判低下を少し軽減する。" },
    "stone_type5": { name: "🌙[ルート]風化 / ☀️[ルート]遺跡のオーラ", desc: "研究進捗が+15%。（※全開発後は毎晩取得済みの素材を1つ拾う）ドラゴンや精霊系の来店率が少し上がる。" },
    "stone_type1": { name: "🌙[ルート]呪いの石 / ☀️[ルート]威圧の石像", desc: "料理の値段を決める際、高い価格設定になりやすい。ぼったくり価格に対する客の許容度を広げる。" },
    "stone_type3": { name: "🌙[ルート]ルーン刻印 / ☀️[ルート]記憶の石", desc: "研究進捗が+10%。（※全開発後は仕込み生成数が10%で+1される）常連客が来店しやすくなる。" },
    "stone_type2_2": { name: "🌙[専用]クリスタル・オーラ / ☀️[専用]プリズム反射", desc: "模様替え時、お店の評判が10%回復する。常連客からのチップ額が2.5倍になる。" },
    "stone_type4_3": { name: "🌙[専用]メテオストライク / ☀️[専用]マグマオーブン", desc: "模様替え時の家具撤去が一瞬で終わる。イートイン客の食事速度が1.5倍に高速化する。" },
    "stone_type5_2": { name: "🌙[専用]モノリスの導き / ☀️[専用]鎮座する古代岩", desc: "研究進捗が常に+25%進む。（※全開発後は仕込み素材消費を15%で0に）レジ裏にいる間、レジ待ち客の忍耐力減少が半分に。" },
    "stone_type5_3": { name: "🌙[専用]星の欠片 / ☀️[専用]聖なる石碑", desc: "閉店時、在庫が余っている料理の相場低下を完全に防ぐ。クレーム時の評判低下を半減する。" },
    "stone_type1_2": { name: "🌙[専用]ヴォイドコア / ☀️[専用]絶望の石像", desc: "閉店時、評判を-1する代わりに全料理の相場を上げる。まずい料理を出しても、お店の評判が一切低下しなくなる。" },
    "stone_type3_2": { name: "🌙[専用]オラクルメッセージ / ☀️[専用]神託のレジ", desc: "閉店時の全作業速度が劇的に上がる。満席で怒って帰る客を50%でテイクアウト待機へ誘導する。" },

    // ■ 7. 風船系 (15種)
    "balloon": { name: "🌙[基本]空気入れ / ☀️[基本]浮遊移動", desc: "仕込み時、5%の確率で在庫が同時に+2個増える。移動速度が少し早くなる。" },
    "balloon_type2": { name: "🌙[ルート]シャボン玉 / ☀️[ルート]キラキラ反射", desc: "家具変更時、お店の評判が少し回復する。お客さんがチップをくれる確率が10%上がる。" },
    "balloon_type2_2": { name: "🌙[ルート]プリズムカラー / ☀️[ルート]カラフル接客", desc: "閉店時、一番安い料理の相場を少し引き上げる。常連客からのチップ額が1.5倍になる。" },
    "balloon_type4": { name: "🌙[ルート]膨張 / ☀️[ルート]バウンス", desc: "仕込みの生成数が10%の確率で+1される。冷蔵庫から料理を取り出す速度が上がる。" },
    "balloon_type4_2": { name: "🌙[ルート]熱気球 / ☀️[ルート]上昇気流", desc: "仕込みの作業速度が上がる。イートイン客の食事速度が上がる。" },
    "balloon_type1": { name: "🌙[ルート]毒ガス / ☀️[ルート]悪臭", desc: "料理の価格設定時、強気な高い値段が出やすくなる。怒って帰る客の評判低下を少し軽減する。" },
    "balloon_type1_2": { name: "🌙[ルート]ダークマター / ☀️[ルート]威嚇バルーン", desc: "仕込み時、素材を消費しない確率が+10%される。ぼったくり価格に対する客の許容度が広がる。" },
    "balloon_type5": { name: "🌙[ルート]しぼんだ風船 / ☀️[ルート]ゆったり気流", desc: "閉店中の行動タイマーが少しだけ短縮される。店内の全客の忍耐力減少が少し遅くなる。" },
    "balloon_type3": { name: "🌙[ルート]気圧観測 / ☀️[ルート]天気予報", desc: "研究進捗が+15%。（※全開発後は毎晩取得済みの素材を1つ拾う）レジ打ちの速度が上がる。" },
    "balloon_type3_2": { name: "🌙[ルート]スコープ / ☀️[ルート]俯瞰誘導", desc: "レシピ開発の進捗が+10%多く進む。（※全開発後は素材消費無効化+5%）満席で怒る客を20%でテイクアウト誘導。" },
    "balloon_type2_3": { name: "🌙[専用]パレードの準備 / ☀️[専用]ファンタジーワールド", desc: "閉店時、ランダムな2つの料理の相場を引き上げる。来店するすべてのお客様の初期忍耐力が+20された状態で来店する。" },
    "balloon_type4_3": { name: "🌙[専用]超圧縮ガス / ☀️[専用]ジェット噴射", desc: "仕込み時、10%の確率で在庫が同時に+3増える。冷蔵庫から料理を取り出す作業が一瞬で終わる。" },
    "balloon_type5_2": { name: "🌙[専用]化石バルーン / ☀️[専用]停滞空間", desc: "家具設置時、レイアウトスコア上限が永久に+2加算される。レジ待ちの客全員の忍耐力減少を完全にストップさせる。" },
    "balloon_type1_3": { name: "🌙[専用]ナイトメアガス / ☀️[専用]恐怖の爆発", desc: "研究の作業が一瞬で終わる。（※全開発後は価格設定が常に最高値付近に）満席時に帰る客を100%テイクアウト待機に変換。" },
    "balloon_type3_3": { name: "🌙[専用]サテライトリンク / ☀️[専用]完璧な観測", desc: "研究進捗が常に+30%進む。（※全開発後は仕込み素材消費率を常に20%オフ）レジ打ちの作業時間が半分になる。" },

    // ■ 8. 幽霊系 (11種)
    "ghost": { name: "🌙[基本]すり抜け / ☀️[基本]霊体化", desc: "閉店中の「家具の配置変更」の作業速度が少し早くなる。配膳準備（冷蔵庫出し）の速度が少し上がる。" },
    "ghost_type2": { name: "🌙[ルート]燐光 / ☀️[ルート]幻惑の接客", desc: "閉店時、ランダムな料理1つの相場を少し引き上げる。お客さんがチップをくれる確率が10%上がる。" },
    "ghost_type4": { name: "🌙[ルート]ポルターガイスト / ☀️[ルート]念動力", desc: "模様替え時の家具撤去速度が大きく上がる。客席への配膳移動速度が少し上がる。" },
    "ghost_type5": { name: "🌙[ルート]古の霊魂 / ☀️[ルート]冷気", desc: "研究進捗が+15%。（※全開発後は毎晩取得済みの素材をランダムに1つ拾う）怒って帰る客の評判低下を少し軽減する。" },
    "ghost_type1": { name: "🌙[ルート]怨念 / ☀️[ルート]シャドウ", desc: "料理の値段を決める際、高い価格設定になりやすい。ぼったくり価格に対する客の許容度を広げる。" },
    "ghost_type3": { name: "🌙[ルート]オカルト知識 / ☀️[ルート]透視", desc: "研究進捗が+10%。（※全開発後は仕込み素材消費を5%の確率で無効化）レジ打ちの速度が上がる。" },
    "ghost_type3_2": { name: "🌙[ルート]テレパシー / ☀️[ルート]読心術", desc: "仕込み時、10%の確率で在庫が同時に+1個増える。満席で怒って帰る客を20%の確率でテイクアウト待機へ誘導する。" },
    "ghost_type2_2": { name: "🌙[専用]ホーリーライト / ☀️[専用]奇跡の姿", desc: "家具変更時、お店の評判が10%回復する。常連客からのチップ額が2.5倍になる。" },
    "ghost_type4_2": { name: "🌙[専用]ジャガーノート / ☀️[専用]サイコキネシス", desc: "仕込みの作業速度が極限まで上がる。配膳（冷蔵庫から客席への移動）が一瞬で終わる。" },
    "ghost_type5_2": { name: "🌙[専用]ファラオの呪い / ☀️[専用]王家の威光", desc: "閉店時、在庫が余っている料理の相場低下ペナルティを無効化する。レジ待ちの客全員の忍耐力が減らなくなる。" },
    "ghost_type1_2": { name: "🌙[専用]死神の鎌 / ☀️[専用]黄泉の国", desc: "閉店時、評判を-1する代わりに全料理の相場を上げる。まずい料理を出しても、評判が一切低下しなくなる。" },
    "ghost_type3_3": { name: "🌙[専用]アカデミーの叡智 / ☀️[専用]心眼", desc: "研究進捗が常に+25%進む。（※全開発後は毎晩取得済みの素材を2つ拾う）テイクアウト客の忍耐力減少速度を半分にする。" },

    // ■ 9. 虫系 (11種)
    "beetle": { name: "🌙[基本]採取本能 / ☀️[基本]俊敏な脚", desc: "閉店時、たまに取得済みの素材を1つ拾う。配膳移動時の速度が少し上がる。" },
    "beetle_type2": { name: "🌙[ルート]輝く甲殻 / ☀️[ルート]美装の舞", desc: "価格設定時、少しだけ強気な値段が出やすくなる。チップ発生率が+10%される。" },
    "beetle_type2_2": { name: "🌙[ルート]魅惑の鱗粉 / ☀️[ルート]フェアリーダスト", desc: "閉店時、ランダムな料理1つの相場を少し引き上げる。客全員の忍耐力減少が少し遅くなる。" },
    "beetle_type4": { name: "🌙[ルート]パワーリフト / ☀️[ルート]剛腕", desc: "模様替え時の家具撤去速度が上がる。冷蔵庫から料理を取り出す速度が上がる。" },
    "beetle_type5": { name: "🌙[ルート]琥珀の記憶 / ☀️[ルート]古のフェロモン", desc: "研究進捗が+15%。（※全開発後は仕込み素材消費を10%の確率で無効化）常連客からのチップ額が1.2倍になる。" },
    "beetle_type1": { name: "🌙[ルート]猛毒のハサミ / ☀️[ルート]威嚇の顎", desc: "仕込み時、お肉の消費を10%の確率で無効化する。怒って帰る客の評判低下を少し軽減する。" },
    "beetle_type3": { name: "🌙[ルート]複眼思考 / ☀️[ルート]素早い演算", desc: "研究進捗が+10%。（※全開発後は仕込み生成数が5%の確率で+1）レジ打ちの速度が上がる。" },
    "beetle_type2_3": { name: "🌙[専用]幻惑の羽ばたき / ☀️[専用]黄金の鱗粉", desc: "閉店時、最も安い料理の相場を大きく回復させる。チップの金額が常に「2倍」になる。" },
    "beetle_type2_4": { name: "🌙[専用]神聖なる甲殻 / ☀️[専用]フェロモンシャワー", desc: "模様替え時、お店の評判が10%回復する。満席時に帰る客を50%の確率でテイクアウト待機に変換する。" },
    "beetle_type4_2": { name: "🌙[専用]ギガントリフト / ☀️[専用]マッスルキャリー", desc: "家具設置時、レイアウトスコア上限が永久に+2加算される。冷蔵庫出しの作業が一瞬で終わる。" },
    "beetle_type5_2": { name: "🌙[専用]アンモナイトの導き / ☀️[専用]化石の守り", desc: "閉店中のすべての作業速度が飛躍的に上がる。レジ待ちの客全員の忍耐力が減らなくなる。" },

    // ■ 10. 種系 (12種)
    "seed": { name: "🌙[基本]光合成 / ☀️[基本]癒やしの香り", desc: "閉店中の全作業速度が少し早くなる。店内の客の忍耐力減少が少し遅くなる。" },
    "seed_type2": { name: "🌙[ルート]芳醇な蜜 / ☀️[ルート]魅惑の花", desc: "閉店時、ランダムな料理1つの相場を引き上げる。チップ発生率が+10%される。" },
    "seed_type4": { name: "🌙[ルート]根の拡張 / ☀️[ルート]茨のムチ", desc: "家具設置時、レイアウトスコア上限が一時的に+2される。満席で怒る客を20%でテイクアウトに誘導する。" },
    "seed_type5": { name: "🌙[ルート]年輪の刻み / ☀️[ルート]大樹の守り", desc: "研究進捗が+15%。（※全開発後は毎晩取得済みの素材を1つ拾う）クレーム時の評判低下を「-1」軽減する。" },
    "seed_type1": { name: "🌙[ルート]毒牙の蔓 / ☀️[ルート]捕食植物", desc: "価格設定時、強気な高い値段が出やすくなる。ぼったくり価格に対する客の許容度が少し広がる。" },
    "seed_type3": { name: "🌙[ルート]種子の記憶 / ☀️[ルート]迅速な発芽", desc: "レシピ開発の進捗が+10%多く進む。（※全開発後は仕込み素材消費を5%で無効化）レジ打ちの速度が上がる。" },
    "seed_type3_2": { name: "🌙[ルート]養分吸収 / ☀️[ルート]適応進化", desc: "仕込み時、野菜系料理の在庫生成数が10%の確率で+1される。冷蔵庫から料理を取り出す速度が上がる。" },
    "seed_type2_2": { name: "🌙[専用]エデンの果実 / ☀️[専用]天上の香り", desc: "仕込み時、10%の確率で在庫が同時に+3増える。常連客からのチップ額が2.5倍になる。" },
    "seed_type4_2": { name: "🌙[専用]ガイアの怒り / ☀️[専用]暴食の蔓", desc: "仕込みの作業速度が大きく上がる。イートイン客の食事速度が1.5倍になる。" },
    "seed_type5_2": { name: "🌙[専用]化石樹木 / ☀️[専用]古代の静寂", desc: "閉店時、在庫が余っている料理の相場低下ペナルティを無効化する。テイクアウト客の忍耐力減少速度を半分にする。" },
    "seed_type1_2": { name: "🌙[専用]寄生樹 / ☀️[専用]幻覚胞子", desc: "閉店時、評判を-1する代わりに全料理の相場を上げる。まずい料理を出しても、評判が一切低下しなくなる。" },
    "seed_type3_3": { name: "🌙[専用]アカシックツリー / ☀️[専用]超効率ネットワーク", desc: "研究進捗が常に+25%進む。（※全開発後は野菜の消費を20%の確率で0に）レジ打ちの作業時間が一瞬で終わる。" },

    // ■ 11. ドラゴン系 (12種)
    "dragon": { name: "🌙[基本]竜の嗅覚 / ☀️[基本]威風堂々", desc: "仕込み時、お肉を使う料理の素材消費を5%の確率で0にする。店内の客の忍耐力減少が少し遅くなる。" },
    "dragon_type2": { name: "🌙[ルート]宝石の鱗 / ☀️[ルート]美しき翼", desc: "閉店時、一番安い料理の相場を少し引き上げる。満席で怒って帰る客を20%でテイクアウトに誘導する。" },
    "dragon_type4": { name: "🌙[ルート]竜の腕力 / ☀️[ルート]飛翔配膳", desc: "模様替えの作業速度が上がる。冷蔵庫から客席への配膳移動速度が少し上がる。" },
    "dragon_type5": { name: "🌙[ルート]長寿の秘訣 / ☀️[ルート]古竜の風格", desc: "閉店中のすべての作業速度が上がる。チップ発生率が+10%される。" },
    "dragon_type1": { name: "🌙[ルート]呪われた鱗 / ☀️[ルート]恐怖の咆哮", desc: "価格設定時、強気な高い値段が出やすくなる。怒って帰る客の評判低下を少し軽減する。" },
    "dragon_type3": { name: "🌙[ルート]竜の知恵 / ☀️[ルート]宝物庫の管理", desc: "研究進捗が+15%。（※全開発後は仕込みの素材消費を10%の確率で無効化）レジ打ちの速度が上がる。" },
    "dragon_type2_2": { name: "🌙[専用]聖なる光 / ☀️[専用]神々しい接客", desc: "家具変更時、お店の評判が10%回復する。チップの金額が常に「2倍」になる。" },
    "dragon_type2_3": { name: "🌙[専用]プリズムブレス / ☀️[専用]魅了の瞳", desc: "閉店時、ランダムな2つの料理の相場を強引に引き上げる。満席時に帰る客を100%テイクアウト待機に変換する。" },
    "dragon_type4_2": { name: "🌙[専用]破壊神の力 / ☀️[専用]神速飛翔", desc: "模様替え時の家具撤去が一瞬で終わる。冷蔵庫出しの作業が一瞬で終わる。" },
    "dragon_type5_2": { name: "🌙[専用]大地創造 / ☀️[専用]ジオ・フォース", desc: "家具設置時、レイアウトスコア上限が永久に+2加算される。レジ待ちの客全員の忍耐力が減らなくなる。" },
    "dragon_type1_2": { name: "🌙[専用]アビスオーラ / ☀️[専用]絶望の淵", desc: "仕込み時、10%の確率で在庫が同時に+3増える。ぼったくり価格に対する客の許容度が大きく広がる。" },
    "dragon_type3_2": { name: "🌙[専用]ギャラクシー・マインド / ☀️[専用]星の導き", desc: "研究進捗が常に+30%進む。（※全開発後は毎晩取得済みの素材を2つ拾う）常連客が来店しやすくなる。" }
});

// ==========================================
// ★ レストラン専用：スキンからスキルIDの配列（履歴考慮）を取得する関数
// ==========================================
window.getShopSkillIds = function(skin) {
    let ids = [];
    if (!skin) return ids;
    let pastSkins = (window.aiPet && window.aiPet.pastSkins) ? window.aiPet.pastSkins : [];
    const add = (id) => ids.push(id);

    // ★ロボット系
    if (skin.includes('robot')) {
        add('robot');
        if (['robot_type3', 'robot_type3_2', 'robot_type2', 'robot_type4', 'robot_type4_2', 'robot_type1', 'robot_type5'].includes(skin)) {
            add(skin);
        } else {
            let pastGen1 = pastSkins.find(s => s === 'robot_type3_2' || s === 'robot_type4_2');
            if (['robot_type3_3', 'robot_type3_4', 'robot_type3_5'].includes(skin)) { add(pastGen1 === 'robot_type3_2' ? 'robot_type3_2' : 'robot_type3'); add(skin); }
            else if (['robot_type2_2', 'robot_type2_3', 'robot_type2_4'].includes(skin)) { add('robot_type2'); add(skin); }
            else if (['robot_type4_3', 'robot_type4_4'].includes(skin)) { add(pastGen1 === 'robot_type4_2' ? 'robot_type4_2' : 'robot_type4'); add(skin); }
            else if (['robot_type1_2', 'robot_type1_3'].includes(skin)) { add('robot_type1'); add(skin); }
            else if (['robot_type5_2', 'robot_type5_3', 'robot_type5_4'].includes(skin)) { add('robot_type5'); add(skin); }
        }
    }
    // ★精霊系
    else if (skin.includes('spirit')) {
        add('spirit');
        if (['spirit_type2', 'spirit_type4', 'spirit_type5', 'spirit_type1', 'spirit_type3'].includes(skin)) { add(skin); }
        else {
            if (['spirit_type2_2', 'spirit_type2_3'].includes(skin)) { add('spirit_type2'); add(skin); }
            else if (['spirit_type4_2', 'spirit_type4_3'].includes(skin)) { add('spirit_type4'); add(skin); }
            else if (['spirit_type5_2', 'spirit_type5_3'].includes(skin)) { add('spirit_type5'); add(skin); }
            else if (skin === 'spirit_type1_2') { add('spirit_type1'); add(skin); }
            else if (skin === 'spirit_type3_2') { add('spirit_type3'); add(skin); }
        }
    }
    // ★魔法使い系
    else if (skin.includes('magician')) {
        add('magician');
        if (['magician_type4', 'magician_type4_2', 'magician_type1', 'magician_type1_2', 'magician_type5', 'magician_type2', 'magician_type2_2', 'magician_type3'].includes(skin)) { add(skin); }
        else {
            if (['magician_type4_3', 'magician_type4_4'].includes(skin)) { add(pastSkins.includes('magician_type4_2') ? 'magician_type4_2' : 'magician_type4'); add(skin); }
            else if (['magician_type1_3', 'magician_type1_4'].includes(skin)) { add(pastSkins.includes('magician_type1_2') ? 'magician_type1_2' : 'magician_type1'); add(skin); }
            else if (['magician_type5_2', 'magician_type5_3'].includes(skin)) { add('magician_type5'); add(skin); }
            else if (['magician_type2_3', 'magician_type2_4'].includes(skin)) { add(pastSkins.includes('magician_type2_2') ? 'magician_type2_2' : 'magician_type2'); add(skin); }
            else if (['magician_type3_2', 'magician_type3_3'].includes(skin)) { add('magician_type3'); add(skin); }
        }
    }
    // ★鳥系
    else if (skin.includes('bird')) {
        add('bird');
        if (['bird_type2', 'bird_type4', 'bird_type5', 'bird_type1', 'bird_type3', 'bird_type3_2'].includes(skin)) { add(skin); }
        else {
            if (skin === 'bird_type2_2') { add('bird_type2'); add(skin); }
            else if (skin === 'bird_type4_2') { add('bird_type4'); add(skin); }
            else if (skin === 'bird_type5_2') { add('bird_type5'); add(skin); }
            else if (skin === 'bird_type1_2') { add('bird_type1'); add(skin); }
            else if (skin === 'bird_type3_3') { add(pastSkins.includes('bird_type3_2') ? 'bird_type3_2' : 'bird_type3'); add(skin); }
        }
    }
    // ★機械系
    else if (skin.includes('machine')) {
        add('machine');
        if (['machine_type2', 'machine_type4', 'machine_type5', 'machine_type1', 'machine_type3'].includes(skin)) { add(skin); }
        else {
            if (skin === 'machine_type2_2') { add('machine_type2'); add(skin); }
            else if (skin === 'machine_type4_2') { add('machine_type4'); add(skin); }
            else if (['machine_type5_2', 'machine_type5_3'].includes(skin)) { add('machine_type5'); add(skin); }
            else if (skin === 'machine_type1_2') { add('machine_type1'); add(skin); }
            else if (skin === 'machine_type3_2') { add('machine_type3'); add(skin); }
        }
    }
    // ★石系
    else if (skin.includes('stone')) {
        add('stone');
        if (['stone_type2', 'stone_type4', 'stone_type4_2', 'stone_type5', 'stone_type1', 'stone_type3'].includes(skin)) { add(skin); }
        else {
            if (skin === 'stone_type2_2') { add('stone_type2'); add(skin); }
            else if (skin === 'stone_type4_3') { add(pastSkins.includes('stone_type4_2') ? 'stone_type4_2' : 'stone_type4'); add(skin); }
            else if (['stone_type5_2', 'stone_type5_3'].includes(skin)) { add('stone_type5'); add(skin); }
            else if (skin === 'stone_type1_2') { add('stone_type1'); add(skin); }
            else if (skin === 'stone_type3_2') { add('stone_type3'); add(skin); }
        }
    }
    // ★風船系
    else if (skin.includes('balloon')) {
        add('balloon');
        if (['balloon_type2', 'balloon_type2_2', 'balloon_type4', 'balloon_type4_2', 'balloon_type1', 'balloon_type1_2', 'balloon_type5', 'balloon_type3', 'balloon_type3_2'].includes(skin)) { add(skin); }
        else {
            if (skin === 'balloon_type2_3') { add(pastSkins.includes('balloon_type2_2') ? 'balloon_type2_2' : 'balloon_type2'); add(skin); }
            else if (skin === 'balloon_type4_3') { add(pastSkins.includes('balloon_type4_2') ? 'balloon_type4_2' : 'balloon_type4'); add(skin); }
            else if (skin === 'balloon_type5_2') { add('balloon_type5'); add(skin); }
            else if (skin === 'balloon_type1_3') { add(pastSkins.includes('balloon_type1_2') ? 'balloon_type1_2' : 'balloon_type1'); add(skin); }
            else if (skin === 'balloon_type3_3') { add(pastSkins.includes('balloon_type3_2') ? 'balloon_type3_2' : 'balloon_type3'); add(skin); }
        }
    }
    // ★幽霊系
    else if (skin.includes('ghost')) {
        add('ghost');
        if (['ghost_type2', 'ghost_type4', 'ghost_type5', 'ghost_type1', 'ghost_type3', 'ghost_type3_2'].includes(skin)) { add(skin); }
        else {
            if (skin === 'ghost_type2_2') { add('ghost_type2'); add(skin); }
            else if (skin === 'ghost_type4_2') { add('ghost_type4'); add(skin); }
            else if (skin === 'ghost_type5_2') { add('ghost_type5'); add(skin); }
            else if (skin === 'ghost_type1_2') { add('ghost_type1'); add(skin); }
            else if (skin === 'ghost_type3_3') { add(pastSkins.includes('ghost_type3_2') ? 'ghost_type3_2' : 'ghost_type3'); add(skin); }
        }
    }
    // ★虫系
    else if (skin.includes('beetle')) {
        add('beetle');
        if (['beetle_type4', 'beetle_type5', 'beetle_type2', 'beetle_type2_2', 'beetle_type3', 'beetle_type1'].includes(skin)) { add(skin); }
        else {
            if (skin === 'beetle_type4_2') { add('beetle_type4'); add(skin); }
            else if (skin === 'beetle_type5_2') { add('beetle_type5'); add(skin); }
            else if (['beetle_type2_3', 'beetle_type2_4'].includes(skin)) { add(pastSkins.includes('beetle_type2_2') ? 'beetle_type2_2' : 'beetle_type2'); add(skin); }
        }
    }
    // ★種系
    else if (skin.includes('seed')) {
        add('seed');
        if (['seed_type4', 'seed_type1', 'seed_type5', 'seed_type3', 'seed_type3_2', 'seed_type2'].includes(skin)) { add(skin); }
        else {
            if (skin === 'seed_type4_2') { add('seed_type4'); add(skin); }
            else if (skin === 'seed_type1_2') { add('seed_type1'); add(skin); }
            else if (skin === 'seed_type5_2') { add('seed_type5'); add(skin); }
            else if (skin === 'seed_type2_2') { add('seed_type2'); add(skin); }
            else if (skin === 'seed_type3_3') { add(pastSkins.includes('seed_type3_2') ? 'seed_type3_2' : 'seed_type3'); add(skin); }
        }
    }
    // ★ドラゴン系
    else if (skin.includes('dragon')) {
        add('dragon');
        if (['dragon_type4', 'dragon_type1', 'dragon_type5', 'dragon_type3', 'dragon_type2'].includes(skin)) { add(skin); }
        else {
            if (skin === 'dragon_type4_2') { add('dragon_type4'); add(skin); }
            else if (skin === 'dragon_type1_2') { add('dragon_type1'); add(skin); }
            else if (skin === 'dragon_type5_2') { add('dragon_type5'); add(skin); }
            else if (skin === 'dragon_type3_2') { add('dragon_type3'); add(skin); }
            else if (['dragon_type2_2', 'dragon_type2_3'].includes(skin)) { add('dragon_type2'); add(skin); }
        }
    }
    
    return ids;
};

// 1. スプライト（マップチップ）の定義
window.SHOP_SPRITES = {
    // [R-MAP] 床と壁
    "rmap_floor": { "img": "restaurant_mapchip.png", "sx": 172, "sy": 158, "sw": 216, "sh": 195, "scale": 1 },
    "rmap_wall": { "img": "restaurant_mapchip.png", "sx": 2395, "sy": 548, "sw": 142, "sh": 194, "scale": 1 },
    "rmap_kitchen_floor": { "img": "restaurant_mapchip.png", "sx": 172, "sy": 515, "sw": 216, "sh": 195, "scale": 1 },

    // [R-FUR] 家具
    "rfur_register_left":   { "img": "restaurant_furniture_mapchip.png", "sx": 153, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    "rfur_register_center": { "img": "restaurant_furniture_mapchip.png", "sx": 480, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    "rfur_register_right":  { "img": "restaurant_furniture_mapchip.png", "sx": 897, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    
    "rfur_table_tl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_tc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_tr": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_bl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_bc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_br": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    
    "rfur_chair_down":  { "img": "restaurant_furniture_mapchip.png", "sx": 1607, "sy": 127, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_up":    { "img": "restaurant_furniture_mapchip.png", "sx": 1614, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_left":  { "img": "restaurant_furniture_mapchip.png", "sx": 190, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_right": { "img": "restaurant_furniture_mapchip.png", "sx": 869, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_stool":       { "img": "restaurant_furniture_mapchip.png", "sx": 2262, "sy": 888, "sw": 315, "sh": 429, "scale": 0.5 },

    // [R-KIT] 厨房設備
    "rkit_fridge": { "img": "restaurant_kitchen_mapchip.png", "sx": 1910, "sy": 803, "sw": 403, "sh": 661, "scale": 1 }, 
    "rkit_oven":   { "img": "restaurant_kitchen_mapchip.png", "sx": 343, "sy": -4, "sw": 720, "sh": 778, "scale": 1 }, 
    "rkit_stove_left":  { "img": "restaurant_kitchen_mapchip.png", "sx": 1567, "sy": -47, "sw": 490, "sh": 700, "scale": 1 }, 
    "rkit_stove_right": { "img": "restaurant_kitchen_mapchip.png", "sx": 2051, "sy": -47, "sw": 490, "sh": 700, "scale": 1 }, 
    "rkit_counter_left":   { "img": "restaurant_kitchen_mapchip.png", "sx": 290, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, 
    "rkit_counter_center": { "img": "restaurant_kitchen_mapchip.png", "sx": 510, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, 
    "rkit_counter_right":  { "img": "restaurant_kitchen_mapchip.png", "sx": 734, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, 

    // [R-DISH] 料理アイテム（既存）
    "dish_steak":   { "img": "restaurant_dish_mapchip.png", "sx": 29, "sy": 67, "sw": 646, "sh": 595, "scale": 1 },
    "dish_soup":    { "img": "restaurant_dish_mapchip.png", "sx": 741, "sy": 124, "sw": 646, "sh": 524, "scale": 1 },
    "dish_strawberry_cake":    { "img": "restaurant_dish_mapchip.png", "sx": 70, "sy": 898, "sw": 579, "sh": 555, "scale": 1 },
    "dish_melon_parfait": { "img": "restaurant_dish_mapchip.png", "sx": 854, "sy": 848, "sw": 426, "sh": 611, "scale": 1 },

    // ★ [R-DISH] 料理アイテム（新規13種追加: restaurant_dish2_mapchip.png）
    "dish_salad":       { "img": "restaurant_dish2_mapchip.png", "sx": 35, "sy": 41, "sw": 507, "sh": 429, "scale": 1 },
    "dish_stirfry":     { "img": "restaurant_dish2_mapchip.png", "sx": 592, "sy": 41, "sw": 507, "sh": 429, "scale": 1 },
    "dish_minestrone":  { "img": "restaurant_dish2_mapchip.png", "sx": 1155, "sy": 52, "sw": 507, "sh": 400, "scale": 1 }, // 既存のdish_soupと被るのでID変更
    "baked_carrot":     { "img": "restaurant_dish2_mapchip.png", "sx": 1735, "sy": 84, "sw": 479, "sh": 361, "scale": 1 },
    "baked_pepper":     { "img": "restaurant_dish2_mapchip.png", "sx": 2300, "sy": 91, "sw": 479, "sh": 361, "scale": 1 },
    "baked_tomato":     { "img": "restaurant_dish2_mapchip.png", "sx": 65, "sy": 588, "sw": 444, "sh": 392, "scale": 1 },
    "baked_fish":       { "img": "restaurant_dish2_mapchip.png", "sx": 575, "sy": 588, "sw": 540, "sh": 392, "scale": 1 },
    "dish_curry":       { "img": "restaurant_dish2_mapchip.png", "sx": 1139, "sy": 576, "sw": 540, "sh": 407, "scale": 1 },
    "dish_omurice":     { "img": "restaurant_dish2_mapchip.png", "sx": 1698, "sy": 576, "sw": 540, "sh": 407, "scale": 1 },
    "dish_sushi":       { "img": "restaurant_dish2_mapchip.png", "sx": 2265, "sy": 576, "sw": 540, "sh": 407, "scale": 1 },
    "dish_honey_pudding": { "img": "restaurant_dish2_mapchip.png", "sx":104, "sy": 1086, "sw": 341, "sh": 392, "scale": 1 },
    "dish_pancakes":    { "img": "restaurant_dish2_mapchip.png", "sx": 579, "sy": 1086, "sw": 527, "sh": 392, "scale": 1 },
    "dish_fruit_tart":  { "img": "restaurant_dish2_mapchip.png", "sx": 1220, "sy": 1081, "sw": 385, "sh": 388, "scale": 1 },

    // ★ [R-FUR] 高級家具 (restaurant_luxury_furniture_mapchip.png)
    "rfur_lux_table_tl": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 103, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_lux_table_tc": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 526, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_lux_table_tr": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 792, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_lux_table_bl": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 103, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_lux_table_bc": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 526, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_lux_table_br": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 792, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },

    "rfur_marble_table_tl": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1487, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_marble_table_tc": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1634, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_marble_table_tr": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 2168, "sy": 112, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_marble_table_bl": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1487, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_marble_table_bc": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1634, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },
    "rfur_marble_table_br": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 2168, "sy": 421, "sw": 540, "sh": 261, "scale": 1 },

    "rfur_lux_chair_down":  { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 49, "sy": 807, "sw": 392, "sh": 647, "scale": 0.5 },
    "rfur_lux_chair_up":    { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1303, "sy": 807, "sw": 392, "sh": 647, "scale": 0.5 },
    "rfur_lux_chair_left":  { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 490, "sy": 807, "sw": 392, "sh": 647, "scale": 0.5 },
    "rfur_lux_chair_right": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 893, "sy": 807, "sw": 392, "sh": 647, "scale": 0.5 },

    "rfur_plant":  { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1740, "sy": 807, "sw": 522, "sh": 647, "scale": 0.8 },
    "rfur_candle": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 2274, "sy": 807, "sw": 522, "sh": 647, "scale": 0.8 },

    // ★ [R-MAP] 階段 (restaurant_stairs_mapchip.png)
    "rmap_stairs_up_tl": { "img": "restaurant_stairs_mapchip.png", "sx": 66, "sy": 261, "sw": 549, "sh": 601, "scale": 1 },
    "rmap_stairs_up_tr": { "img": "restaurant_stairs_mapchip.png", "sx": 592, "sy": 68, "sw": 368, "sh": 802, "scale": 1 },
    "rmap_stairs_up_ml": { "img": "restaurant_stairs_mapchip.png", "sx": 947, "sy": 68, "sw": 393, "sh": 802, "scale": 1 },
    "rmap_stairs_up_mr": { "img": "restaurant_stairs_mapchip.png", "sx": 66, "sy": 816, "sw": 549, "sh": 353, "scale": 1 },
    "rmap_stairs_up_bl": { "img": "restaurant_stairs_mapchip.png", "sx": 66, "sy": 1130, "sw": 549, "sh": 353, "scale": 1 },

    "rmap_stairs_dw_tl": { "img": "restaurant_stairs_mapchip.png", "sx": 1475, "sy": 71, "sw": 651, "sh": 703, "scale": 1 },
    "rmap_stairs_dw_tr": { "img": "restaurant_stairs_mapchip.png", "sx": 2092, "sy": 71, "sw": 651, "sh": 703, "scale": 1 },
    "rmap_stairs_dw_bl": { "img": "restaurant_stairs_mapchip.png", "sx": 1475, "sy": 755, "sw": 651, "sh": 703, "scale": 1 },
    "rmap_stairs_dw_br": { "img": "restaurant_stairs_mapchip.png", "sx": 2092, "sy": 755, "sw": 651, "sh": 703, "scale": 1 },

    // ★ [R-KIT] 最新・伝説の厨房 (restaurant_luxury_kitchen_mapchip.png)
    "rkit_super_fridge": { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 280, "sy": 86, "sw": 597, "sh": 1074, "scale": 1 },
    "rkit_lux_counter_left":   { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 1184, "sy": 912, "sw": 476, "sh": 666, "scale": 1 },
    "rkit_lux_counter_center": { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 1651, "sy": 912, "sw": 476, "sh": 666, "scale": 1 },
    "rkit_lux_counter_right":  { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 2100, "sy": 912, "sw": 476, "sh": 666, "scale": 1 },
    "rkit_legend_oven_left":   { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 1184, "sy": 38, "sw": 476, "sh": 801, "scale": 1 },
    "rkit_legend_oven_center": { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 1651, "sy": 38, "sw": 476, "sh": 801, "scale": 1 },
    "rkit_legend_oven_right":  { "img": "restaurant_luxury_kitchen_mapchip.png", "sx": 2100, "sy": 38, "sw": 476, "sh": 801, "scale": 1 }
};

// ==========================================
// ★ チュートリアル開始用：入口・壁・レストラン床だけの初期物件（12 x 10）
// ==========================================
const RESTAURANT_MAP_LV1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 100, 100, 100, 1, 1, 1, 1, 1] // 入り口
];

function getDefaultShopTimerValues() {
    const open = new Date(Date.now() + 5 * 60000);
    const close = new Date(Date.now() + 35 * 60000);
    return {
        openHour: open.getHours(),
        openMinute: open.getMinutes(),
        closeHour: close.getHours(),
        closeMinute: close.getMinutes()
    };
}

window.createFreshRestaurantShopState = function(options = {}) {
    const timer = getDefaultShopTimerValues();
    const savedRecipes = options.preserveRecipes && window.aiPet && window.aiPet.savedRecipes
        ? JSON.parse(JSON.stringify(window.aiPet.savedRecipes))
        : {};
    const savedRecipeFlags = options.preserveRecipes && window.aiPet && window.aiPet.savedRecipeFlags
        ? JSON.parse(JSON.stringify(window.aiPet.savedRecipeFlags))
        : {};
    return {
        mapWidth: 12,
        mapHeight: 10,
        maxScore: 20,
        currentScore: 0,
        floorCount: 1,
        currentFloor: '1F',
        grid: RESTAURANT_MAP_LV1.map(row => [...row]),
        player: { x: 5, y: 8, face: 'up', action: 'idle', shopState: 'idle', prevShopState: 'idle', currentFloor: '1F' },
        npcs: [],
        furniture: [],
        dishes: [],
        money: 0,
        reputation: 100,
        isBankrupt: false,
        isOpen: false,
        openHour: timer.openHour,
        openMinute: timer.openMinute,
        closeHour: timer.closeHour,
        closeMinute: timer.closeMinute,
        announcedOneMinBefore: false,
        dailyFlags: { seatShortage: false },
        logs: [],
        menuList: [],
        fridge: {},
        recipeProgress: savedRecipes,
        recipes: savedRecipeFlags,
        shopTutorialLockAI: false,
        shopTacticEditorPausedAI: false,
        tutorialChef: null,
        nextOpenAt: null
    };
};

window.isShopMapUIActive = function() {
    const ui = document.getElementById('shop-map-ui');
    return !!ui && ui.style.display !== 'none';
};

window.hasAnyRestaurantStock = function(s = window.SHOP_STATE) {
    if (!s || !s.fridge) return false;
    const stockedKeys = Object.keys(s.fridge).filter(key => Number(s.fridge[key] || 0) > 0);
    if (stockedKeys.length > 0) {
        if (!Array.isArray(s.menuList)) s.menuList = [];
        stockedKeys.forEach(key => {
            if (!s.menuList.includes(key)) s.menuList.push(key);
        });
    }
    return stockedKeys.length > 0;
};

window.grantRestaurantRestartEquipment = function(s = window.SHOP_STATE) {
    if (!window.aiPet || !window.aiPet.shopTutorialCompleted || !s || s.restartEquipmentGranted) return;
    const isEmptyRestart = (!Array.isArray(s.npcs) || s.npcs.length === 0)
        && (!Array.isArray(s.dishes) || s.dishes.length === 0)
        && (!s.fridge || Object.keys(s.fridge).length === 0)
        && (!Array.isArray(s.menuList) || s.menuList.length === 0)
        && Array.isArray(s.grid)
        && !s.grid.some(row => row.some(tile => [10, 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34].includes(Number(tile))));
    if (!isEmptyRestart) return;
    if (!Array.isArray(window.aiPet.inventory)) window.aiPet.inventory = [];
    ['item_fridge', 'item_oven', 'item_stove', 'item_table', 'item_chair', 'item_register'].forEach(id => {
        window.aiPet.inventory.push({ id, age: 0 });
    });
    s.reputation = 100;
    s.restartEquipmentGranted = true;
    if (typeof window.addRestaurantLog === 'function') {
        window.addRestaurantLog('再建用の基本設備を受け取りました。冷蔵庫・オーブン・コンロ・机・椅子・レジカウンターを配置できます。', '#4CAF50');
    }
};

window.showShopHeavenNotice = function(message, color = '#FF9800') {
    const old = document.getElementById('shop-heaven-notice');
    if (old) old.remove();
    const notice = document.createElement('div');
    notice.id = 'shop-heaven-notice';
    notice.style.cssText = `position:fixed; left:18px; bottom:18px; max-width:min(460px, calc(100vw - 36px)); z-index:65000; background:rgba(20,20,24,0.94); color:#fff; border:2px solid ${color}; border-radius:8px; padding:12px 14px; box-shadow:0 8px 28px rgba(0,0,0,0.55); font-weight:bold; line-height:1.5; pointer-events:none;`;
    notice.innerHTML = `<div style="font-size:12px; color:${color}; margin-bottom:4px;">天の声</div><div style="white-space:pre-line; font-size:14px;">${message}</div>`;
    document.body.appendChild(notice);
    setTimeout(() => {
        if (notice.parentNode) notice.remove();
    }, 5200);
};

window.syncCurrentShopStateToBuilding = function() {
    const s = window.SHOP_STATE;
    if (!s) return;
    if (s.detachedAfterBankruptcy || !window.currentShopManagementBuilding) return;
    let building = window.currentShopManagementBuilding || null;
    if (!building && typeof assets !== 'undefined') {
        building = Object.values(assets).find(a => a && a.shopData === s) || null;
    }
    if (building) {
        building.shopData = s;
        window.currentShopManagementBuilding = building;
    }
};

window.installShopSaveSyncWrapper = function() {
    if (typeof window.saveGameData !== 'function' || window._shopStateSaveSyncWrapped) return;
    window._shopStateSaveSyncWrapped = true;
    const previousShopSaveGameData = window.saveGameData;
    window.saveGameData = function(...args) {
        if (typeof window.syncCurrentShopStateToBuilding === 'function') window.syncCurrentShopStateToBuilding();
        return previousShopSaveGameData.apply(this, args);
    };
};
window.installShopSaveSyncWrapper();

window.ensureRestaurantTutorialWordsLearned = function() {
    const ai = window.aiPet;
    if (!ai) return;
    if (!ai.apprentice) ai.apprentice = {};
    if (!Array.isArray(ai.apprentice.learnedWords)) ai.apprentice.learnedWords = [];
    ['かえる', 'おぼえる', 'つくる', 'きく', 'はこぶ', 'うつ', 'ふやす', 'おく', 'やすむ'].forEach(word => {
        if (!ai.apprentice.learnedWords.includes(word)) ai.apprentice.learnedWords.push(word);
    });
};

window.resetShopTimerForVisit = function() {
    const s = window.SHOP_STATE;
    if (!s) return;
    const open = new Date(Date.now() + 5 * 60000);
    const close = new Date(Date.now() + 35 * 60000);
    s.isOpen = false;
    s.announcedOneMinBefore = false;
    s.nextOpenAt = open.getTime();
    s.shopTutorialLockAI = false;
    s.shopTacticEditorPausedAI = false;
    s.tutorialChef = null;
    s.openHour = open.getHours();
    s.openMinute = open.getMinutes();
    s.closeHour = close.getHours();
    s.closeMinute = close.getMinutes();
    s.npcs = [];
    s.dishes = [];
    if (s.player) {
        s.player.shopState = 'idle';
        s.player.action = 'idle';
        s.player.targetPos = null;
        s.player.targetNpcId = null;
    }
};

const initialShopTimer = getDefaultShopTimerValues();

// ★修正：すでにお店のデータがある場合は上書きせず引き継ぐ（コンソールテスト時のリセット防止）
window.SHOP_STATE = window.SHOP_STATE || {
    mapWidth: 12, // 拡張時に増加
    mapHeight: 10,
    maxScore: 20, // レベルに応じて増加するトータルスコア上限
    currentScore: 0, // 現在消費しているスコア
    floorCount: 1, // 階層化対応
    grid: RESTAURANT_MAP_LV1.map(row => [...row]),
    player: { x: 5, y: 8, face: 'up', action: 'idle', shopState: 'idle', prevShopState: 'idle' }, 
    npcs: [],
    furniture: [],
    dishes: [], 
    money: 0,         
    reputation: 100,  
    isBankrupt: false,
    isOpen: false, 
    
    // ★修正：初期値は現在時刻+5分〜35分後に設定
    openHour: initialShopTimer.openHour,
    openMinute: initialShopTimer.openMinute,
    closeHour: initialShopTimer.closeHour,
    closeMinute: initialShopTimer.closeMinute,
    announcedOneMinBefore: false,

    // ★Phase 4追加：その日の営業の出来事を記憶するフラグ
    dailyFlags: { seatShortage: false },

    logs: [],
    menuList: [], 
    fridge: {},
    recipeProgress: {}
};

window.resetRestaurantTutorialState = function() {
    const timer = getDefaultShopTimerValues();
    window.SHOP_STATE = {
        mapWidth: 12,
        mapHeight: 10,
        maxScore: 20,
        currentScore: 0,
        floorCount: 1,
        currentFloor: '1F',
        grid: RESTAURANT_MAP_LV1.map(row => [...row]),
        player: { x: 5, y: 8, face: 'up', action: 'idle', shopState: 'idle', prevShopState: 'idle', currentFloor: '1F' },
        npcs: [],
        furniture: [],
        dishes: [],
        money: 0,
        reputation: 100,
        isBankrupt: false,
        isOpen: false,
        openHour: timer.openHour,
        openMinute: timer.openMinute,
        closeHour: timer.closeHour,
        closeMinute: timer.closeMinute,
        announcedOneMinBefore: false,
        dailyFlags: { seatShortage: false },
        logs: [],
        menuList: [],
        fridge: {},
        recipeProgress: {},
        recipes: {}
    };
    window.SHOP_STATE.shopTutorialLockAI = false;
    window.SHOP_STATE.shopTacticEditorPausedAI = false;
    window.SHOP_STATE.tutorialChef = null;
    if (window.aiPet) {
        window.aiPet.shopTutorialCompleted = false;
        window.aiPet.shopTutorialStep = 0;
        window.aiPet.shopTutorialIntroDone = false;
        window.aiPet.shopTutorialLayoutDone = false;
        window.aiPet.shopTutorialKitchenDone = false;
        window.aiPet.shopTutorialTableDone = false;
        window.aiPet.shopTutorialChairDone = false;
        window.aiPet.shopTutorialRegisterDone = false;
        window.aiPet.shopTutorialResearchIntroDone = false;
        window.aiPet.shopTutorialResearchDone = false;
        window.aiPet.shopTutorialResearchRecipe = null;
        window.aiPet.shopTutorialPrepIntroDone = false;
        window.aiPet.shopTutorialPrepDone = false;
        window.aiPet.shopTutorialPrepRecipe = null;
        window.aiPet.shopTutorialServiceIntroDone = false;
        window.aiPet.shopTutorialServiceDone = false;
        window.aiPet.shopTutorialServiceMindDone = false;
        window.aiPet.shopTutorialFinalWordsDone = false;
        window.aiPet.shopTutorialFinalMindStarted = false;
        window.aiPet.shopTimerUnlocked = false;
        window.aiPet.shopTutorialTimerSet = false;
        window.aiPet.shopTutorialCustomerDone = false;
        window.aiPet.shopTutorialCustomerSpawned = false;
        window.aiPet.shopTutorialOneMinDialogueDone = false;
        window.aiPet.shopTutorialLearnedAsk = false;
        window.aiPet.shopTutorialLearnedCarry = false;
        window.aiPet.shopTutorialLearnedRegister = false;
        window.aiPet.shopTutorialServiceWaitLineIndex = 0;
        window.aiPet.shopTutorialLastWaitLineAt = 0;
        window.aiPet.shopTutorialMindPhase = 'kitchen';
        window.aiPet.shopRecipeNotebookUnlocked = false;
        window.aiPet.shopTutorialRecipeUnlocked = false;
        window.aiPet.currentShopTacticName = "AIにまかせる";
        window.aiPet.shopTactics = [];
        window.aiPet.savedRecipes = {};
        window.aiPet.savedRecipeFlags = {};
    }
    window.SHOP_STATE.nextOpenAt = null;
    if (window.currentShopManagementBuilding) {
        window.currentShopManagementBuilding.shopData = window.SHOP_STATE;
    } else if (typeof assets !== 'undefined') {
        const ownRestaurant = Object.values(assets).find(a => a && a.type === 'restaurant' && !a.isMasterShop);
        if (ownRestaurant) {
            ownRestaurant.shopData = window.SHOP_STATE;
            window.currentShopManagementBuilding = ownRestaurant;
        }
    }
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
    if (typeof window.updateShopUI === 'function') window.updateShopUI();
    if (typeof saveGameData === 'function') saveGameData();
    console.log("レストランをチュートリアル初期状態に戻しました。");
};

window.SHOP_TACTIC_CONDITIONS = {
    "always": "いつでも",
    "customer_waiting_order": "注文待ちの客がいる時",
    "customer_waiting_food": "料理待ちの客がいる時",
    "customer_waiting_register": "レジ待ちの客がいる時",
    "is_closed": "営業時間外（閉店中）の時",
    "has_money_1000": "所持金が1000G以上の時",
    // ★チュートリアル用：料理人から教わる店づくりの基本条件
    "missing_kitchen": "厨房がない時",
    "missing_table": "テーブルがない時",
    "missing_chair": "椅子がない時",
    "missing_register": "レジカウンターがない時",
    "has_researchable_recipe": "ひらめけるレシピがある時",
    "has_preppable_recipe": "仕込めるレシピがある時",
    // ★Phase 4追加：レイアウト制御用の新条件
    "daily_seat_shortage": "座れない客がいた日",
    "shop_is_plain": "お店が殺風景な時",
    "shop_is_cramped": "お店が手狭になった時",
    // ★Phase 4.2追加：お店のトーン（テーマ）を指示する条件
    "prefer_luxury_decor": "家具をリッチな雰囲気にしたい時",
    "prefer_casual_decor": "家具を気軽な雰囲気にしたい時",
    "remove_decor": "飾りを片付けたい時",
    "remove_fridge": "冷蔵庫を片付けたい時",
    "remove_stove": "コンロを片付けたい時",
    "remove_oven": "オーブンを片付けたい時",
    "remove_table": "テーブルを片付けたい時",
    "remove_chair": "椅子を片付けたい時",
    "remove_register": "レジカウンターを片付けたい時",
    "remove_wall": "壁を取り払いたい時",
    "remove_kitchen_floor": "厨房床を普通の床に戻したい時"
};

window.SHOP_AVAILABLE_COMMANDS = [
    { id: "cook", name: "つくる" },
    { id: "register", name: "うつ" },
    { id: "research", name: "おぼえる" },
    { id: "remodel", name: "かえる" },
    { id: "speak", name: "いう" },
    { id: "rest", name: "やすむ" },
    { id: "carry", name: "はこぶ" },
    { id: "ask", name: "きく" },
    // ★Phase 4追加：レイアウト制御用の汎用アクション
    { id: "increase", name: "ふやす" },
    { id: "put", name: "おく" }
];

window.SHOP_RECIPE_COSTS = {
    // --- ご飯もの・おかず系 ---
    'dish_salad':    ['carrot', 'tomato'],
    'dish_stirfry':  ['carrot', 'pepper'],
    'dish_soup':     ['water', 'veg'],         // ★既存のスープを復旧！
    'dish_minestrone':['tomato', 'pepper'],    // ★新規のミネストローネも共存！
    'baked_carrot':  ['carrot'],
    'baked_pepper':  ['pepper'],
    'baked_tomato':  ['tomato'],
    'baked_fish':    ['fish_salmon'], 
    'dish_steak':    ['meat', 'pepper'],
    'dish_curry':    ['meat', 'carrot', 'rice'],
    'dish_omurice':  ['egg', 'rice', 'tomato'],
    'dish_sushi':    ['fish_tuna', 'rice'],

    // --- スイーツ・パティシエ系 ---
    'dish_strawberry_cake': ['strawberry', 'wheat', 'milk', 'egg'],
    'dish_melon_parfait':   ['melon', 'milk', 'ice_crystal'], 
    'dish_honey_pudding':   ['honey', 'egg', 'milk'],
    'dish_pancakes':        ['wheat', 'egg', 'honey'],
    'dish_fruit_tart':      ['wheat', 'strawberry', 'melon'],
    'dish_honey_toast':     ['honey'],
    'dish_shaved_ice_honey':['honey'],
    'dish_honey_milk':      ['honey'],

    // --- 本番経営用：追加レシピ（restaurant_dish3-16系の代表料理） ---
    'dish_salt_riceball':   ['rice'],
    'dish_grilled_riceball':['rice'],
    'dish_fried_rice':      ['rice', 'egg'],
    'dish_beef_bowl':       ['rice', 'meat'],
    'dish_bread':           ['wheat'],
    'dish_hamburger':       ['wheat', 'meat'],
    'dish_ramen':           ['wheat', 'meat', 'water'],
    'dish_karaage':         ['meat'],
    'dish_hamburg_steak':   ['meat', 'egg'],
    'dish_beef_stew':       ['meat', 'carrot', 'water'],
    'dish_fried_egg':       ['egg'],
    'dish_tomato_salad':    ['tomato'],
    'dish_tomato_soup':     ['tomato', 'water'],
    'dish_mushroom_soup':   ['mushroom', 'water'],
    'dish_grilled_salmon':  ['fish_salmon'],
    'dish_tuna_sashimi':    ['fish_tuna'],
    'dish_vanilla_ice':     ['milk', 'ice_crystal'],
    'dish_cookie':          ['wheat', 'egg']
};

window.getAvailableShopRecipeKeys = function() {
    const sweetRecipes = ['dish_strawberry_cake', 'dish_melon_parfait', 'dish_honey_pudding', 'dish_pancakes', 'dish_fruit_tart'];
    const unlocks = window.aiPet && window.aiPet.pastryRecipeUnlocks ? window.aiPet.pastryRecipeUnlocks : {};
    return Object.keys(window.SHOP_RECIPE_COSTS).filter(key => !sweetRecipes.includes(key) || !!unlocks[key]);
};

// ==========================================
// ★新規追加：家具マスターデータ（内装ランク・伸縮・向き対応）
// ==========================================
window.SHOP_FURNITURE_DB = {
    // ランク1（木製ベース）の家具群
    'item_table': { type: 'table', tags: ['normal'], cost: 3, reqLv: 1, tiles: { tl: 21, tc: 22, tr: 23, bl: 24, bc: 25, br: 26 } },
    'item_chair': { type: 'chair', tags: ['normal'], cost: 1, reqLv: 1, tiles: { down: 10, up: 14, left: 15, right: 16 } },
    'item_register': { type: 'register', tags: ['normal'], cost: 5, reqLv: 1, tiles: { left: 11, center: 12, right: 13 } },
    
    // 回転率特化（カジュアル）
    'item_counter': { type: 'counter', tags: ['casual'], cost: 4, reqLv: 2, tiles: { left: 35, center: 36, right: 37 } },
    'item_stool': { type: 'chair', tags: ['casual'], cost: 1, reqLv: 1, tiles: { down: 17, up: 17, left: 17, right: 17 } },
    
    // 基本厨房
    'item_oven': { type: 'equipment', tags: ['normal'], cost: 8, reqLv: 1, tiles: { single: 32 } }, // ★reqLvを1に
    'item_fridge': { type: 'equipment', tags: ['normal'], cost: 6, reqLv: 1, tiles: { single: 31 } }, // ★reqLvを1に
    'item_stove': { type: 'stove', tags: ['normal'], cost: 7, reqLv: 1, tiles: { left: 33, right: 34 } }, // ★reqLvを1に

    // ★ Phase 4追加：高級家具・インテリア群
    'item_high_table': { type: 'table', tags: ['luxury'], cost: 15, reqLv: 13, tiles: { tl: 41, tc: 42, tr: 43, bl: 44, bc: 45, br: 46 } },
    'item_luxury_table': { type: 'table', tags: ['luxury'], cost: 30, reqLv: 28, tiles: { tl: 51, tc: 52, tr: 53, bl: 54, bc: 55, br: 56 } },
    'item_high_chair': { type: 'chair', tags: ['luxury'], cost: 8, reqLv: 18, tiles: { down: 61, up: 62, left: 63, right: 64 } },
    
    // 装飾品（1マス配置用）
    'item_plant': { type: 'decor', tags: ['luxury'], cost: 10, reqLv: 23, tiles: { single: 71 } },
    'item_candle': { type: 'decor', tags: ['luxury'], cost: 12, reqLv: 23, tiles: { single: 72 } },
    
    // 階段（後日拡張用・今回はデータのみ）
    'item_stairs': { type: 'stairs', tags: ['stairs'], cost: 50, reqLv: 15, tiles: { up: 81 } },
    'item_basement_stairs': { type: 'stairs', tags: ['stairs'], cost: 80, reqLv: 25, tiles: { dw: 87 } },

    // 最新・伝説の厨房
    'item_super_fridge': { type: 'equipment', tags: ['luxury'], cost: 25, reqLv: 20, tiles: { single: 91 } },
    'item_lux_counter': { type: 'counter', tags: ['luxury'], cost: 20, reqLv: 23, tiles: { left: 92, center: 93, right: 94 } },
    'item_legendary_kitchen': { type: 'equipment', tags: ['luxury'], cost: 100, reqLv: 30, tiles: { left: 95, center: 96, right: 97 } }
};

window.SHOP_DISH_NAMES = {
    'dish_salad': 'フレッシュサラダ', 'dish_stirfry': '野菜炒め', 
    'dish_soup': 'スープ', 'dish_minestrone': 'ミネストローネ', // ★両方共存！
    'baked_carrot': '焼きニンジン', 'baked_pepper': '焼きピーマン', 'baked_tomato': '焼きトマト', 'baked_fish': '焼き魚',
    'dish_steak': 'ステーキ', 'dish_curry': 'カレーライス', 'dish_omurice': 'オムライス', 'dish_sushi': 'マグロの握り',
    'dish_strawberry_cake': 'イチゴのショートケーキ', 'dish_melon_parfait': 'メロンパフェ', 'dish_honey_pudding': '極上ハチミツプリン',
    'dish_pancakes': 'ハチミツパンケーキ', 'dish_fruit_tart': 'フルーツタルト',
    'dish_salt_riceball': '塩むすび', 'dish_grilled_riceball': '焼きおにぎり',
    'dish_fried_rice': 'チャーハン', 'dish_beef_bowl': '牛丼',
    'dish_bread': '食パン', 'dish_hamburger': 'ハンバーガー',
    'dish_ramen': 'ラーメン', 'dish_karaage': 'からあげ',
    'dish_hamburg_steak': 'ハンバーグ', 'dish_beef_stew': 'ビーフシチュー',
    'dish_fried_egg': '目玉焼き', 'dish_tomato_salad': 'トマトサラダ',
    'dish_tomato_soup': 'トマトスープ', 'dish_mushroom_soup': 'キノコスープ',
    'dish_grilled_salmon': 'サケの塩焼き', 'dish_tuna_sashimi': 'マグロの刺身',
    'dish_vanilla_ice': 'バニラアイス', 'dish_cookie': 'クッキー'
};

Object.assign(window.SHOP_DISH_NAMES, {
    'dish_meat_riceball': '肉巻きおにぎり', 'dish_egg_rice': 'タマゴかけご飯', 'dish_porridge': 'おかゆ', 'dish_herb_porridge': '七草がゆ', 'dish_egg_porridge': '卵雑炊',
    'dish_chicken_rice': 'チキンライス', 'dish_hayashi_rice': 'ハヤシライス', 'dish_mushroom_rice': 'キノコご飯', 'dish_tomato_risotto': 'トマトリゾット', 'dish_mushroom_risotto': 'キノコリゾット',
    'dish_doria': 'ドリア', 'dish_seafood_doria': 'シーフードドリア', 'dish_squid_rice': 'イカ飯', 'dish_salmon_chazuke': 'サケ茶漬け', 'dish_snapper_chazuke': '鯛茶漬け',
    'dish_sushi_salmon': 'サケの握り', 'dish_sushi_squid': 'イカの握り', 'dish_sushi_saury': 'サンマの押し寿司', 'dish_tuna_bowl': '鉄火丼', 'dish_seafood_bowl': '海鮮丼', 'dish_roastbeef_bowl': 'ローストビーフ丼',
    'dish_roll_bread': 'ロールパン', 'dish_croissant': 'クロワッサン', 'dish_sandwich': 'サンドイッチ', 'dish_fruit_sandwich': 'フルーツサンド', 'dish_honey_toast': 'ハニートースト',
    'dish_pizza_toast': 'ピザトースト', 'dish_hotdog': 'ホットドッグ', 'dish_meat_bun': '肉まん', 'dish_pasta_tomato': 'トマトパスタ', 'dish_pasta_mushroom': 'キノコパスタ',
    'dish_pasta_meat': 'ミートソースパスタ', 'dish_carbonara': 'カルボナーラ', 'dish_pasta_squidink': 'イカスミパスタ', 'dish_pescatore': 'ペスカトーレ', 'dish_pasta_salmon': 'サーモンクリームパスタ',
    'dish_cold_pasta': '冷製カッペリーニ', 'dish_macaroni_gratin': 'マカロニグラタン', 'dish_seafood_gratin': 'シーフードグラタン', 'dish_pizza': 'ピザ', 'dish_seafood_pizza': 'シーフードピザ',
    'dish_mushroom_pizza': 'キノコピザ', 'dish_yakisoba': '焼きそば', 'dish_udon': 'うどん', 'dish_moon_udon': '月見うどん', 'dish_meat_udon': '肉うどん', 'dish_cold_udon': '冷やしうどん', 'dish_chashu_ramen': 'チャーシュー麺',
    'dish_stewed_hamburg': '煮込みハンバーグ', 'dish_stuffed_pepper': 'ピーマンの肉詰め', 'dish_roast_beef': 'ローストビーフ', 'dish_meatball': '肉団子', 'dish_tonkatsu': 'とんかつ',
    'dish_fried_chicken': 'フライドチキン', 'dish_ginger_pork': '豚の生姜焼き', 'dish_yakitori': '焼き鳥', 'dish_shabu_shabu': 'しゃぶしゃぶ', 'dish_tomato_meatball': 'ミートボールのトマト煮',
    'dish_herb_chicken': '鶏肉の香草焼き', 'dish_pork_saute': 'ポークソテー', 'dish_beef_carpaccio': '牛肉のカルパッチョ', 'dish_dice_steak': 'サイコロステーキ', 'dish_teriyaki_chicken': '鶏の照り焼き',
    'dish_roast_chicken': 'ローストチキン', 'dish_sausage': 'ソーセージ', 'dish_bacon': 'ベーコン', 'dish_raw_ham': '生ハム', 'dish_beef_jerky': 'ビーフジャーキー', 'dish_menchi_katsu': 'メンチカツ', 'dish_grilled_meat': '肉の網焼き',
    'dish_boiled_egg': 'ゆで卵', 'dish_scrambled_egg': 'スクランブルエッグ', 'dish_dashimaki': 'だし巻き卵', 'dish_quiche': 'キッシュ', 'dish_chawanmushi': '茶碗蒸し',
    'dish_spanish_omelet': 'スパニッシュオムレツ', 'dish_eggs_benedict': 'エッグベネディクト', 'dish_cheese_fondue': 'チーズフォンデュ', 'dish_camembert': 'カマンベールチーズ', 'dish_hot_milk': 'ホットミルク',
    'dish_milk_porridge': 'ミルク粥', 'dish_poached_egg': 'ポーチドエッグ', 'dish_onsen_tamago': '温泉卵', 'dish_tomato_egg_stirfry': 'トマトと卵の炒め物', 'dish_mayonnaise': 'マヨネーズ',
    'dish_butter': 'バター', 'dish_plain_omelet': 'プレーンオムレツ', 'dish_cheese_omelet': 'チーズオムレツ', 'dish_yogurt': 'ヨーグルト',
    'dish_carrot_salad': 'ニンジンサラダ', 'dish_warm_salad': '温野菜サラダ', 'dish_mushroom_salad': 'キノコサラダ', 'dish_capricciosa': 'カプリチョーザサラダ', 'dish_carrot_glace': 'ニンジンのグラッセ',
    'dish_pepper_ohitashi': 'ピーマンのおひたし', 'dish_milk_soup': 'ミルクスープ', 'dish_consomme': 'コンソメスープ', 'dish_carrot_potage': 'キャロットポタージュ', 'dish_mushroom_potage': 'マッシュルームポタージュ',
    'dish_tomato_potage': 'トマトポタージュ', 'dish_herb_soup': '春草のスープ', 'dish_tomato_farcie': 'トマトファルシ', 'dish_ratatouille': 'ラタトゥイユ', 'dish_pickles': 'ピクルス', 'dish_veggie_sticks': '野菜スティック', 'dish_foil_mushroom': 'キノコのホイル焼き',
    'dish_salmon_meuniere': 'サケのムニエル', 'dish_foil_salmon': 'サケのホイル焼き', 'dish_grilled_sardine': 'イワシの塩焼き', 'dish_sardine_ball_soup': 'イワシのつみれ汁', 'dish_fried_sardine': 'イワシのフライ',
    'dish_grilled_saury': 'サンマの塩焼き', 'dish_saury_tatsuta': 'サンマの竜田揚げ', 'dish_grilled_snapper': 'マダイの塩焼き', 'dish_snapper_carpaccio': 'マダイのカルパッチョ', 'dish_boiled_snapper': 'マダイの煮付け',
    'dish_tuna_carpaccio': 'マグロのカルパッチョ', 'dish_tuna_katsu': 'マグロカツ', 'dish_tuna_tataki': 'マグロのたたき', 'dish_tuna_salad': 'ツナサラダ', 'dish_marlin_steak': 'カジキマグロのステーキ',
    'dish_marlin_teriyaki': 'カジキの照り焼き', 'dish_fried_marlin': 'カジキのフライ', 'dish_grilled_squid': 'イカの姿焼き', 'dish_squid_ring': 'イカリングフライ', 'dish_squid_shiokara': 'イカの塩辛',
    'dish_squid_sashimi': 'イカ刺し', 'dish_squid_pepper_stirfry': 'イカとピーマンの炒め物', 'dish_boiled_crawfish': 'ザリガニのボイル', 'dish_crawfish_soup': 'ザリガニスープ', 'dish_carp_arai': 'コイのあらい',
    'dish_koikoku': 'コイコク', 'dish_carp_kanroni': 'コイの甘露煮', 'dish_fried_blackbass': 'ブラックバスのフライ', 'dish_blackbass_meuniere': 'ブラックバスのムニエル', 'dish_herb_blackbass': 'ブラックバスの香草焼き',
    'dish_smelt_tempura': 'ワカサギの天ぷら', 'dish_fried_smelt': 'ワカサギの唐揚げ', 'dish_smelt_marinade': 'ワカサギのマリネ', 'dish_medaka_tsukudani': 'メダカの佃煮', 'dish_seafood_mix_fry': 'シーフードミックスフライ',
    'dish_acqua_pazza': 'アクアパッツァ', 'dish_bouillabaisse': 'ブイヤベース', 'dish_seared_fish': '魚のあぶり焼き', 'dish_fish_chowder': 'フィッシュチャウダー', 'dish_fried_whitefish': '白身魚のフライ',
    'dish_sweet_sour_fish': '白身魚の甘酢あん', 'dish_carpaccio_mix': 'カルパッチョ盛り合わせ', 'dish_squid_fritter': 'イカのフリッター',
    'dish_strawberry_ice': 'イチゴアイス', 'dish_melon_ice': 'メロンアイス', 'dish_sherbet': 'シャーベット', 'dish_shaved_ice_strawberry': 'かき氷（イチゴ）', 'dish_shaved_ice_melon': 'かき氷（メロン）',
    'dish_shaved_ice_honey': 'ハチミツかき氷', 'dish_crepe': 'クレープ', 'dish_strawberry_crepe': 'イチゴクレープ', 'dish_fruit_crepe': 'フルーツクレープ', 'dish_chiffon_cake': 'シフォンケーキ',
    'dish_roll_cake': 'ロールケーキ', 'dish_baumkuchen': 'バウムクーヘン', 'dish_melon_pan': 'メロンパン', 'dish_strawberry_tart': 'イチゴタルト', 'dish_madeleine': 'マドレーヌ',
    'dish_strawberry_cookie': 'イチゴクッキー', 'dish_rusk': 'ラスク', 'dish_donut': 'ドーナツ', 'dish_cream_puff': 'シュークリーム', 'dish_millefeuille': 'ミルフィーユ',
    'dish_macaron': 'マカロン', 'dish_strawberry_daifuku': 'イチゴ大福', 'dish_shiratama': '白玉団子', 'dish_honey_milk': 'ハニーミルク', 'dish_strawberry_milk': 'イチゴミルク',
    'dish_melon_milk': 'メロンミルク', 'dish_fresh_water': 'フレッシュウォーター', 'dish_strawberry_juice': 'イチゴジュース', 'dish_melon_juice': 'メロンジュース', 'dish_berry_juice': 'ベリージュース',
    'dish_mix_juice': 'ミックスジュース', 'dish_fruit_punch': 'フルーツポンチ', 'dish_smoothie': 'スムージー',
    'dish_french_toast': 'フレンチトースト', 'dish_meat_pie': 'ミートパイ', 'dish_pepper_steak': 'チンジャオロース', 'dish_crawfish_paella': 'ザリガニのパエリア', 'dish_saury_rice': 'サンマの炊き込みご飯',
    'dish_milk_gelato': 'ミルクジェラート', 'dish_tuna_roll': '鉄火巻き', 'dish_veggie_terrine': '野菜のテリーヌ', 'dish_berry_pancake': 'ベリーパンケーキ', 'dish_mushroom_omelet': 'キノコオムレツ'
});

window.inferShopRecipeCost = function(dishKey) {
    const key = String(dishKey || '');
    const needs = [];
    const add = (id) => { if (!needs.includes(id)) needs.push(id); };
    if (/rice|bowl|sushi|chazuke|risotto|doria|paella|riceball|porridge/.test(key)) add('rice');
    if (/bread|toast|sandwich|burger|hotdog|bun|pasta|pizza|udon|ramen|yakisoba|gratin|pie|cookie|cake|crepe|donut|rusk|tart|madeleine|baumkuchen|macaron/.test(key)) add('wheat');
    if (/meat|beef|hamburg|pork|chicken|karaage|tonkatsu|yakitori|sausage|bacon|ham|jerky|chashu/.test(key)) add('meat');
    if (/egg|omelet|tamago|dashimaki|chawanmushi|benedict|mayonnaise|quiche/.test(key)) add('egg');
    if (/milk|cheese|yogurt|cream|gelato|ice|parfait|fondue|butter/.test(key)) add('milk');
    if (/ice|shaved|gelato|sherbet/.test(key)) add('ice_crystal');
    if (/honey/.test(key)) add('honey');
    if (/strawberry/.test(key)) add('strawberry');
    if (/melon/.test(key)) add('melon');
    if (/berry/.test(key)) add('item_berry');
    if (/carrot/.test(key)) add('carrot');
    if (/pepper|qingjiao/.test(key)) add('pepper');
    if (/tomato|ratatouille|farcie/.test(key)) add('tomato');
    if (/mushroom/.test(key)) add('mushroom');
    if (/salmon/.test(key)) add('fish_salmon');
    if (/tuna/.test(key)) add('fish_tuna');
    if (/snapper/.test(key)) add('fish_snapper');
    if (/squid/.test(key)) add('fish_squid');
    if (/saury/.test(key)) add('fish_saury');
    if (/sardine/.test(key)) add('fish_sardine');
    if (/marlin/.test(key)) add('fish_marlin');
    if (/crawfish/.test(key)) add('fish_crawfish');
    if (/carp|koikoku/.test(key)) add('fish_carp');
    if (/blackbass/.test(key)) add('fish_blackbass');
    if (/smelt/.test(key)) add('fish_smelt');
    if (/medaka/.test(key)) add('fish_medaka');
    if (/water|soup|chowder|bouillabaisse|consomme|drink|juice|smoothie|punch/.test(key)) add('water');
    if (needs.length === 0) add('water');
    return needs.slice(0, 4);
};

Object.keys(window.SHOP_DISH_NAMES).forEach(key => {
    if (key.startsWith('dish_') && !window.SHOP_RECIPE_COSTS[key]) {
        window.SHOP_RECIPE_COSTS[key] = window.inferShopRecipeCost(key);
    }
});

window.SHOP_ING_NAMES = {
    // 既存の素材
    'herb_spring': '春の七草', 'mushroom': '秋のキノコ', 'ice_crystal': '氷の結晶',
    'water': 'きれいな水', 'carrot': 'ニンジン', 'pepper': 'ピーマン', 'tomato': 'トマト',
    'high_carrot': '質のいいニンジン', 'high_pepper': '質のいいピーマン', 'high_tomato': '質のいいトマト',
    'fish_carp': 'コイ', 'fish_salmon': 'サケ', 'fish_crawfish': 'ザリガニ',
    'fish_blackbass': 'ブラックバス', 'fish_medaka': 'メダカ', 'fish_smelt': 'ワカサギ',
    'fish_sardine': 'イワシ', 'fish_tuna': 'マグロ', 'fish_snapper': 'マダイ',
    'fish_squid': 'イカ', 'fish_marlin': 'カジキマグロ', 'fish_saury': 'サンマ',
    'item_berry': '野イチゴ', 'honey': 'ハチミツ', 'strawberry': 'イチゴ', 'high_strawberry': '質のいいイチゴ', 'melon': 'メロン', 'high_melon': '質のいいメロン',
    
    // ★追加した基本素材
    'meat': 'お肉', 'milk': 'ミルク', 'egg': 'タマゴ', 'wheat': '小麦', 'rice': 'お米'
};

window.SHOP_DISH_CATEGORY_RULES = [
    { category: 'sweets', label: 'スイーツ系', match: /cake|parfait|pudding|pancake|tart|ice|cookie|honey|fruit|strawberry|melon/ },
    { category: 'fish', label: '魚介系', match: /fish|sushi|salmon|tuna|snapper|squid|saury|sardine|carp|marlin|seafood/ },
    { category: 'meat', label: '肉系', match: /meat|steak|beef|hamburg|karaage|chicken|pork|sausage|bacon/ },
    { category: 'rice', label: 'ごはん系', match: /rice|curry|omurice|bowl|riceball|porridge|doria|chazuke/ },
    { category: 'noodle', label: '麺系', match: /ramen|udon|yakisoba|pasta|carbonara/ },
    { category: 'bread', label: 'パン系', match: /bread|toast|sandwich|burger|hotdog|pizza/ },
    { category: 'egg', label: '卵・乳製品系', match: /egg|omelet|milk|cheese|yogurt|quiche/ },
    { category: 'vegetable', label: '野菜系', match: /salad|soup|tomato|carrot|pepper|mushroom|minestrone|stirfry/ }
];

window.getShopDishCategory = function(dishKey) {
    const key = String(dishKey || '');
    const rule = window.SHOP_DISH_CATEGORY_RULES.find(r => r.match.test(key));
    return rule ? rule.category : 'other';
};

window.getShopDishCategoryLabel = function(category) {
    const rule = window.SHOP_DISH_CATEGORY_RULES.find(r => r.category === category);
    return rule ? rule.label : 'その他';
};

window.getShopWorkerVitals = function() {
    const ai = window.aiPet || {};
    const energy = Math.max(0, Math.min(100, Number(ai.energy ?? 100)));
    const hunger = Math.max(0, Math.min(100, Number(ai.hunger ?? 100)));
    ai.energy = energy;
    ai.hunger = hunger;
    ai.shopWorkerVitals = { stamina: energy, fullness: hunger };
    return ai.shopWorkerVitals;
};

window.giveRestaurantDebugItems = function(kindOrCounts = {}, count = 1) {
    if (!window.aiPet) return null;
    if (!Array.isArray(window.aiPet.inventory)) window.aiPet.inventory = [];
    const aliases = {
        fridge: 'item_fridge', refrigerator: 'item_fridge', '冷蔵庫': 'item_fridge',
        oven: 'item_oven', 'オーブン': 'item_oven',
        stove: 'item_stove', range: 'item_stove', 'コンロ': 'item_stove',
        register: 'item_register', cashier: 'item_register', counter: 'item_register', 'レジ': 'item_register', 'レジカウンター': 'item_register',
        table: 'item_table', desk: 'item_table', '机': 'item_table', 'テーブル': 'item_table',
        chair: 'item_chair', 'イス': 'item_chair', '椅子': 'item_chair',
        stool: 'item_stool', '丸椅子': 'item_stool', '丸イス': 'item_stool'
    };
    const counts = typeof kindOrCounts === 'string'
        ? { [kindOrCounts]: count }
        : (kindOrCounts && typeof kindOrCounts === 'object' ? kindOrCounts : {});
    const added = {};
    Object.entries(counts).forEach(([key, rawCount]) => {
        const id = aliases[key] || aliases[String(key).toLowerCase()] || key;
        if (!window.SHOP_FURNITURE_DB || !window.SHOP_FURNITURE_DB[id]) return;
        const n = Math.max(0, Math.floor(Number(rawCount || 0)));
        for (let i = 0; i < n; i++) window.aiPet.inventory.push({ id, age: 0 });
        if (n > 0) added[id] = (added[id] || 0) + n;
    });
    if (typeof window.updateShopUI === 'function') window.updateShopUI();
    if (typeof updateStatUI === 'function') updateStatUI();
    if (typeof saveGameData === 'function') saveGameData();
    console.log('[Restaurant Debug] added furniture:', added);
    return added;
};

window.consumeShopWorkerEnergy = function(actionType) {
    const v = window.getShopWorkerVitals();
    const costs = {
        prep: [8, 6], research: [6, 5], serve: [4, 3], register: [3, 2],
        remodel: [10, 7], decorate: [5, 4], expand: [14, 10], speak: [1, 1]
    };
    const cost = costs[actionType] || [3, 2];
    v.stamina = Math.max(0, v.stamina - cost[0]);
    v.fullness = Math.max(0, v.fullness - cost[1]);
    if (window.aiPet) {
        window.aiPet.energy = v.stamina;
        window.aiPet.hunger = v.fullness;
    }
    return v;
};

window.recoverShopWorkerEnergy = function(amount = 8) {
    const v = window.getShopWorkerVitals();
    v.stamina = Math.min(100, v.stamina + amount);
    v.fullness = Math.min(100, v.fullness + Math.ceil(amount * 0.75));
    if (window.aiPet) {
        window.aiPet.energy = v.stamina;
        window.aiPet.hunger = v.fullness;
    }
    return v;
};

window.getShopLevelInfo = function() {
    const s = window.SHOP_STATE || {};
    s.shopLevel = Math.max(1, Number(s.shopLevel || s.interiorLevel || 1));
    s.shopExp = Math.max(0, Number(s.shopExp || 0));
    const milestone = window.SHOP_LEVEL_MILESTONES && window.SHOP_LEVEL_MILESTONES[s.shopLevel] ? window.SHOP_LEVEL_MILESTONES[s.shopLevel] : null;
    const baseMaxScore = milestone && Number(milestone.maxScore) ? Number(milestone.maxScore) : 20;
    s.maxScore = Math.max(baseMaxScore, Number(s.maxScore || 0));
    s.currentScore = Math.max(0, Number(s.currentScore || 0));
    const nextExp = s.shopLevel * 100;
    return { level: s.shopLevel, exp: s.shopExp, nextExp, maxScore: s.maxScore, currentScore: s.currentScore };
};

window.addShopExp = function(amount) {
    const s = window.SHOP_STATE;
    if (!s) return;
    const info = window.getShopLevelInfo();
    s.shopExp = info.exp + Math.max(0, Number(amount || 0));
    while (s.shopExp >= s.shopLevel * 100) {
        s.shopExp -= s.shopLevel * 100;
        s.shopLevel += 1;
        if (window.SHOP_LEVEL_MILESTONES && window.SHOP_LEVEL_MILESTONES[s.shopLevel]) {
            s.maxScore = Math.max(s.maxScore || 0, window.SHOP_LEVEL_MILESTONES[s.shopLevel].maxScore || s.maxScore || 0);
        }
    }
};

window.getCustomerDishPreferences = function(skin, trait) {
    const fav = trait && trait.favDish ? trait.favDish : 'any';
    if (Array.isArray(trait && trait.favCategories)) return trait.favCategories;
    if (fav && fav !== 'any') return [window.getShopDishCategory(fav)];
    const key = String(skin || '');
    if (/dragon|magician|spirit/.test(key)) return ['sweets', 'fish', 'meat'];
    if (/robot|machine/.test(key)) return ['rice', 'meat', 'noodle'];
    if (/slime|plant|fairy/.test(key)) return ['vegetable', 'sweets'];
    return ['rice', 'meat', 'vegetable', 'sweets'];
};

window.chooseShopOrderForCustomer = function(skin, trait) {
    const s = window.SHOP_STATE || {};
    const stocked = (s.menuList || []).filter(k => (s.fridge && s.fridge[k] > 0));
    const candidates = stocked.length ? stocked : (s.menuList || []);
    if (candidates.length === 0) return null;
    let prefs = window.getCustomerDishPreferences(skin, trait);
    if (s.shopTheme === 'ramen') prefs = ['noodle', 'meat', ...prefs];
    if (s.shopTheme === 'sweets') prefs = ['sweets', ...prefs];
    const preferred = candidates.filter(k => prefs.includes(window.getShopDishCategory(k)));
    const pool = preferred.length ? preferred : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
};

window.analyzeShopTacticRule = function(rule, ruleIndex, rules) {
    const cond = rule && rule.condition;
    const action = rule && rule.action1;
    const serviceConds = ['customer_waiting_order', 'customer_waiting_food', 'customer_waiting_register'];
    const prepConds = ['is_closed', 'missing_kitchen', 'missing_table', 'missing_chair', 'missing_register', 'has_researchable_recipe', 'has_preppable_recipe', 'daily_seat_shortage', 'shop_is_plain', 'shop_is_cramped', 'prefer_luxury_decor', 'prefer_casual_decor', 'remove_decor', 'remove_fridge', 'remove_stove', 'remove_oven', 'remove_table', 'remove_chair', 'remove_register', 'remove_wall', 'remove_kitchen_floor'];
    let timing = '常時';
    if (serviceConds.includes(cond)) timing = '営業中';
    else if (prepConds.includes(cond)) timing = '仕込み中';

    const validPairs = {
        customer_waiting_order: ['きく'],
        customer_waiting_food: ['はこぶ'],
        customer_waiting_register: ['うつ'],
        missing_kitchen: ['かえる'],
        missing_table: ['かえる'],
        missing_chair: ['かえる'],
        missing_register: ['かえる'],
        has_researchable_recipe: ['おぼえる'],
        has_preppable_recipe: ['つくる'],
        daily_seat_shortage: ['ふやす'],
        shop_is_cramped: ['ふやす'],
        shop_is_plain: ['おく'],
        prefer_luxury_decor: ['かえる', 'おく'],
        prefer_casual_decor: ['かえる', 'おく'],
        remove_decor: ['かえる'],
        remove_fridge: ['かえる'],
        remove_stove: ['かえる'],
        remove_oven: ['かえる'],
        remove_table: ['かえる'],
        remove_chair: ['かえる'],
        remove_register: ['かえる'],
        remove_wall: ['かえる'],
        remove_kitchen_floor: ['かえる'],
        is_closed: ['やすむ', 'つくる', 'おぼえる', 'かえる', 'ふやす', 'おく', 'いう'],
        always: ['いう', 'やすむ', 'つくる', 'おぼえる', 'かえる', 'ふやす', 'おく', 'きく', 'はこぶ', 'うつ']
    };
    const valid = !!(cond && action && validPairs[cond] && validPairs[cond].includes(action));
    const special = cond === 'always' || cond === 'is_closed';

    let blockedBy = null;
    for (let i = 0; i < ruleIndex; i++) {
        const prev = rules[i] || {};
        if (prev.condition === 'always') { blockedBy = i + 1; break; }
        if (prev.condition === 'is_closed' && timing === '仕込み中') { blockedBy = i + 1; break; }
        if (serviceConds.includes(prev.condition) && prev.condition === cond) { blockedBy = i + 1; break; }
    }

    return {
        timing,
        valid,
        special,
        fallback: blockedBy ? `優先度${blockedBy}で止まる可能性` : '条件が外れれば下へ流れます'
    };
};

window.renderShopTacticRuleInfo = function(rule, ruleIndex, rules) {
    const info = window.analyzeShopTacticRule(rule, ruleIndex, rules || []);
    const validColor = info.valid ? '#4CAF50' : '#FF5252';
    const validText = info.valid ? (info.special ? '特殊パターンとして有効' : '組み合わせ有効') : '組み合わせ要確認';
    const flowColor = info.fallback.includes('可能性') ? '#FF9800' : '#90CAF9';
    return `<div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; font-size:11px;">
        <span style="padding:3px 7px; border-radius:999px; background:#333; color:#FFF;">${info.timing}</span>
        <span style="padding:3px 7px; border-radius:999px; background:${validColor}; color:#FFF;">${validText}</span>
        <span style="padding:3px 7px; border-radius:999px; background:#222; border:1px solid ${flowColor}; color:${flowColor};">${info.fallback}</span>
    </div>`;
};

window.escapeShopHtml = function(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

window.getShopCurrentRecipeCandidates = function() {
    const s = window.SHOP_STATE || {};
    const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS || {});
    const researchable = [];
    const preppable = [];
    recipeKeys.forEach(key => {
        const progress = s.recipeProgress ? s.recipeProgress[key] : undefined;
        const hasIngredients = typeof window.checkAndConsumeIngredients === 'function' ? window.checkAndConsumeIngredients(key, true) : false;
        const requirements = (window.SHOP_RECIPE_COSTS && window.SHOP_RECIPE_COSTS[key]) || [];
        const entry = {
            key,
            name: (window.SHOP_DISH_NAMES && window.SHOP_DISH_NAMES[key]) || key,
            progress: progress === undefined ? 0 : progress,
            hasIngredients,
            ingredients: requirements.map(id => (window.SHOP_ING_NAMES && window.SHOP_ING_NAMES[id]) || id)
        };
        if (hasIngredients && (progress === undefined || progress < 100)) researchable.push(entry);
        if (hasIngredients && progress >= 100) preppable.push(entry);
    });
    return { researchable, preppable };
};

window.getShopTacticConditionSnapshot = function(condition) {
    const s = window.SHOP_STATE || {};
    const npcs = Array.isArray(s.npcs) ? s.npcs : [];
    const recipeInfo = window.getShopCurrentRecipeCandidates ? window.getShopCurrentRecipeCandidates() : { researchable: [], preppable: [] };
    const hasTile = (tiles) => !!(s.grid && s.grid.some(row => row && row.some(tile => tiles.includes(Number(tile)))));
    const decorCount = s.grid ? s.grid.reduce((sum, row) => sum + row.filter(tile => [71, 72].includes(Number(tile))).length, 0) : 0;
    const dailyFlags = s.dailyFlags || {};
    const label = (window.SHOP_TACTIC_CONDITIONS && window.SHOP_TACTIC_CONDITIONS[condition]) || condition || '未設定';
    let met = false;
    let reason = '';

    if (condition === 'always') { met = true; reason = '常に成立します。'; }
    else if (condition === 'customer_waiting_register') { met = npcs.some(n => n.state === 'paying'); reason = `レジ待ちの客: ${npcs.filter(n => n.state === 'paying').length}人`; }
    else if (condition === 'customer_waiting_order') { met = npcs.some(n => n.state === 'ordering'); reason = `注文待ちの客: ${npcs.filter(n => n.state === 'ordering').length}人`; }
    else if (condition === 'customer_waiting_food') { met = npcs.some(n => n.state === 'waiting_for_food'); reason = `料理待ちの客: ${npcs.filter(n => n.state === 'waiting_for_food').length}人`; }
    else if (condition === 'is_closed') { met = !s.isOpen && npcs.length === 0; reason = met ? '閉店中で客がいません。' : `営業中または客が残っています（客: ${npcs.length}人）。`; }
    else if (condition === 'missing_kitchen') {
        const missing = [];
        if (!hasTile([31, 91])) missing.push('冷蔵庫');
        if (!hasTile([32, 95, 96, 97])) missing.push('オーブン');
        if (!hasTile([33, 34])) missing.push('コンロ');
        met = missing.length > 0;
        reason = met ? `不足: ${missing.join('、')}` : '厨房設備があります。';
    }
    else if (condition === 'missing_table') { met = !hasTile([21, 22, 23, 24, 25, 26]); reason = met ? 'テーブルがありません。' : 'テーブルがあります。'; }
    else if (condition === 'missing_chair') { met = !hasTile([10, 14, 15, 16, 17]); reason = met ? '椅子がありません。' : '椅子があります。'; }
    else if (condition === 'missing_register') { met = !hasTile([11, 12, 13, 92, 93, 94]); reason = met ? 'レジカウンターがありません。' : 'レジカウンターがあります。'; }
    else if (condition === 'has_researchable_recipe') {
        met = recipeInfo.researchable.length > 0;
        const materialSets = recipeInfo.researchable.slice(0, 3).map(r => `素材 ${r.ingredients.join('、') || 'なし'}`).join(' / ');
        reason = met ? `今の食材でひらめけるレシピがあります（${materialSets}）。料理名はひらめくまで伏せます。` : '今の食材では、ひらめけるレシピがありません。';
    }
    else if (condition === 'has_preppable_recipe') {
        met = recipeInfo.preppable.length > 0;
        const sample = recipeInfo.preppable.slice(0, 3).map(r => `${r.name}（${r.ingredients.join('、') || '素材なし'}）`).join(' / ');
        reason = met ? `仕込める候補: ${sample}` : '完成済みレシピと食材がそろっていません。';
    }
    else if (window.getShopDismantleTargetForCondition && window.getShopDismantleTargetForCondition(condition)) {
        const target = window.getShopDismantleTargetForCondition(condition);
        met = !!(target && hasTile(target.tiles));
        reason = met ? `${target.label}が配置されています。` : `${target ? target.label : '対象'}は配置されていません。`;
    }
    else if (condition === 'daily_seat_shortage') { met = !!(dailyFlags.seatShortage || dailyFlags.missingSeats > 0); reason = `不足席数: ${dailyFlags.missingSeats || 0}`; }
    else if (condition === 'shop_is_plain') { const need = Math.max(1, Math.floor((s.shopLevel || 1) / 5) + 1); met = decorCount < need; reason = `飾り: ${decorCount}/${need}`; }
    else if (condition === 'shop_is_cramped') { met = !!(dailyFlags.cramped || dailyFlags.missingSeats > 0); reason = dailyFlags.cramped ? '手狭フラグがあります。' : `不足席数: ${dailyFlags.missingSeats || 0}`; }
    else if (condition === 'prefer_luxury_decor' || condition === 'prefer_casual_decor') { met = !s.isOpen && npcs.length === 0; reason = '閉店中なら内装方針として使えます。'; }
    else { reason = 'この条件の診断は未定義です。'; }

    return { label, met, reason, recipeInfo };
};

window.getShopRouteDiagnostic = function(targetTilesOrPos) {
    const s = window.SHOP_STATE || {};
    const p = s.player || {};
    const grid = s.grid || [];
    const currentFloor = p.currentFloor || s.currentFloor || '1F';
    const blocked = new Set([1, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97]);
    const isFree = (x, y) => grid[y] && grid[y][x] !== undefined && !blocked.has(Number(grid[y][x]));
    let candidates = [];
    let targetTiles = [];
    if (targetTilesOrPos && Number.isFinite(targetTilesOrPos.x) && Number.isFinite(targetTilesOrPos.y)) {
        candidates = [{ x: targetTilesOrPos.x, y: targetTilesOrPos.y }];
        targetTiles = [{ x: targetTilesOrPos.x, y: targetTilesOrPos.y, kind: 'target' }];
    } else {
        const tiles = Array.isArray(targetTilesOrPos) ? targetTilesOrPos : [];
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < (grid[y] || []).length; x++) {
                if (!tiles.includes(Number(grid[y][x]))) continue;
                targetTiles.push({ x, y, kind: 'target' });
                [{ x, y: y + 1 }, { x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }]
                    .filter(pos => isFree(pos.x, pos.y))
                    .forEach(pos => candidates.push(pos));
            }
        }
    }
    if (candidates.length === 0) return { reachable: false, targetTiles, candidates: [], text: '対象のそばに立てる空き場所がありません。周囲の家具や飾りを片付ける必要があります。' };
    const reachable = candidates.find(pos => {
        if (p.x === pos.x && p.y === pos.y) return true;
        if (typeof window.getShopNextStep !== 'function') return true;
        return !!window.getShopNextStep(p.x, p.y, pos.x, pos.y, currentFloor);
    });
    if (reachable) return { reachable: true, targetTiles, candidates, reachable, text: '対象のそばまで移動できます。' };
    return { reachable: false, targetTiles, candidates, text: '対象のそばまで歩いて行けません。通路をふさいでいる家具や飾りを片付ける必要があります。' };
};

window.setShopAnalysisHighlight = function(route, label) {
    const s = window.SHOP_STATE;
    if (!s || !route) return;
    s.analysisHighlights = {
        label: label || '解析対象',
        targetTiles: (route.targetTiles || []).map(pos => ({ x: pos.x, y: pos.y })),
        candidateTiles: (route.candidates || []).map(pos => ({ x: pos.x, y: pos.y })),
        reachable: route.reachable ? { x: route.reachable.x, y: route.reachable.y } : null,
        until: Date.now() + 30000
    };
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
    const modal = document.getElementById('shop-modal-minimap');
    if (modal && modal.style.display === 'flex' && typeof window.drawShopMinimap === 'function') window.drawShopMinimap();
};

window.describeShopTacticActionResult = function(rule, snapshot) {
    const s = window.SHOP_STATE || {};
    const action = rule && rule.action1;
    const cond = rule && rule.condition;
    if (!action) return '行動が未設定なので何もしません。';
    if (['customer_waiting_order', 'customer_waiting_food', 'customer_waiting_register'].includes(cond)) {
        if (!s.isOpen) return '接客系の条件なので、閉店中は基本的に発動しません。';
        if (cond === 'customer_waiting_order' && action === 'きく') return '注文待ちの客へ移動し、注文を聞きます。';
        if (cond === 'customer_waiting_food' && action === 'はこぶ') return '冷蔵庫へ向かい、注文料理を客へ運びます。';
        if (cond === 'customer_waiting_register' && action === 'うつ') return 'レジ待ちの客へ向かい、会計します。';
    }
    if (cond === 'has_researchable_recipe' && action === 'おぼえる') {
        const first = snapshot.recipeInfo.researchable[0];
        const route = window.getShopRouteDiagnostic ? window.getShopRouteDiagnostic([31, 32, 33, 34, 91, 95, 96, 97]) : null;
        return first ? `研究場所へ向かい、新しいレシピをひらめこうとします。${route ? route.text : ''}` : '候補レシピがないため実行できません。';
    }
    if (cond === 'has_preppable_recipe' && action === 'つくる') {
        const first = snapshot.recipeInfo.preppable[0];
        const route = window.getShopRouteDiagnostic ? window.getShopRouteDiagnostic([31, 32, 33, 34, 91, 95, 96, 97]) : null;
        return first ? `厨房へ向かい、${first.name} を仕込みます。${route ? route.text : ''}` : '完成済みレシピと素材がないため実行できません。';
    }
    if (window.getShopDismantleTargetForCondition && window.getShopDismantleTargetForCondition(cond) && action === 'かえる') {
        const target = window.getShopDismantleTargetForCondition(cond);
        const route = window.getShopRouteDiagnostic ? window.getShopRouteDiagnostic(target.tiles) : null;
        return `${target.label}を1つ片付けます。${route ? route.text : ''}`;
    }
    if (action === 'かえる') return '不足設備の設置、または内装変更を行います。';
    if (action === 'ふやす') return cond === 'shop_is_cramped' ? '店の拡張を試みます。' : '席やテーブルを増やします。';
    if (action === 'おく') return '飾りを置いて店の雰囲気を上げます。';
    if (action === 'やすむ') return 'その場で休み、体力と満腹度を回復します。';
    if (action === 'いう') return 'ひとこと話します。';
    return `${action} を実行しようとします。`;
};

window.analyzeCurrentShopTacticFlow = function() {
    const tactics = window.getShopEditorTactics ? window.getShopEditorTactics() : (window.aiPet ? window.aiPet.shopTactics : []);
    const idx = window.SHOP_EDITOR_TACTIC_INDEX;
    const tactic = idx >= 0 && tactics ? tactics[idx] : null;
    const s = window.SHOP_STATE || {};
    const lines = [];
    if (!tactic || !Array.isArray(tactic.rules)) {
        lines.push({ level: 'info', title: 'AIにまかせる', text: '基本AIは、接客中は会計・配膳を優先し、閉店中は休憩、仕込み、研究、席増設を自動で選びます。' });
        return lines;
    }
    lines.push({
        level: 'info',
        title: `現在の状態`,
        text: `${s.isOpen ? '営業中' : '閉店中'} / 客 ${(s.npcs || []).length}人 / 体力 ${window.getShopWorkerVitals ? Math.floor(window.getShopWorkerVitals().stamina) : '?'}% / 満腹 ${window.getShopWorkerVitals ? Math.floor(window.getShopWorkerVitals().fullness) : '?'}%`
    });

    let firstHit = -1;
    tactic.rules.forEach((rule, i) => {
        const snapshot = window.getShopTacticConditionSnapshot(rule.condition);
        const info = window.analyzeShopTacticRule(rule, i, tactic.rules);
        const validText = info.valid ? '組み合わせ有効' : '組み合わせ要確認';
        const hit = firstHit === -1 && snapshot.met;
        if (hit) firstHit = i;
        let route = null;
        if (hit && rule.condition === 'has_researchable_recipe' && rule.action1 === 'おぼえる') route = window.getShopRouteDiagnostic ? window.getShopRouteDiagnostic([31, 32, 33, 34, 91, 95, 96, 97]) : null;
        else if (hit && rule.condition === 'has_preppable_recipe' && rule.action1 === 'つくる') route = window.getShopRouteDiagnostic ? window.getShopRouteDiagnostic([31, 32, 33, 34, 91, 95, 96, 97]) : null;
        else if (hit && window.getShopDismantleTargetForCondition && window.getShopDismantleTargetForCondition(rule.condition) && rule.action1 === 'かえる') {
            const target = window.getShopDismantleTargetForCondition(rule.condition);
            route = target ? window.getShopRouteDiagnostic(target.tiles) : null;
        }
        lines.push({
            level: hit ? 'hit' : (snapshot.met ? 'met' : 'miss'),
            title: `優先度${i + 1}: ${snapshot.label} → ${rule.action1 || '未設定'}`,
            text: `${snapshot.met ? '成立' : '不成立'}。${snapshot.reason} / ${validText}。${hit ? window.describeShopTacticActionResult(rule, snapshot) : '上位条件が成立しなければここを見ます。'}`,
            route,
            routeLabel: snapshot.label
        });
    });
    if (firstHit === -1) {
        lines.push({ level: 'warn', title: '発動する条件がありません', text: 'このままだとAI店員は待機しやすくなります。閉店中なら「営業時間外」や「ひらめけるレシピがある時」、営業中なら接客系条件を確認してください。' });
    }
    return lines;
};

window.renderShopTacticAnalysisPanel = function() {
    const box = document.getElementById('shop-tactic-analysis-panel');
    if (!box) return;
    const lines = window.analyzeCurrentShopTacticFlow ? window.analyzeCurrentShopTacticFlow() : [];
    const colorMap = {
        hit: { border: '#4CAF50', bg: '#12351a', label: '今回発動' },
        met: { border: '#FFC107', bg: '#332600', label: '成立中' },
        miss: { border: '#555', bg: '#1d1d1d', label: '未成立' },
        warn: { border: '#FF9800', bg: '#35220a', label: '注意' },
        info: { border: '#2196F3', bg: '#102231', label: '情報' }
    };
    box.innerHTML = lines.map((line, idx) => {
        const c = colorMap[line.level] || colorMap.info;
        const routeButton = line.route ? `<button onclick="window.setShopAnalysisHighlight(window.analyzeCurrentShopTacticFlow()[${idx}].route, '${window.escapeShopHtml(line.routeLabel || '解析対象')}');" style="margin-top:8px; padding:6px 10px; background:#00BCD4; color:#001018; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">マップで場所を見る</button>` : '';
        return `<div style="margin-bottom:8px; padding:10px; border:1px solid ${c.border}; background:${c.bg}; border-radius:8px; line-height:1.55;">
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:4px;">
                <span style="font-size:11px; padding:2px 6px; border-radius:999px; background:${c.border}; color:#111; font-weight:bold;">${c.label}</span>
                <span style="font-weight:bold; color:#fff;">${window.escapeShopHtml(line.title)}</span>
            </div>
            <div style="color:#ddd; font-size:13px;">${window.escapeShopHtml(line.text)}</div>
            ${routeButton}
        </div>`;
    }).join('');
    box.style.display = 'block';
};

window.SHOP_DISMANTLE_TARGETS = {
    remove_decor: { label: '飾り', tiles: [71, 72], restore: 0, item: { 71: 'item_plant', 72: 'item_candle' } },
    remove_fridge: { label: '冷蔵庫', tiles: [31, 91], restore: 2, item: { 31: 'item_fridge', 91: 'item_super_fridge' } },
    remove_stove: { label: 'コンロ', tiles: [33, 34], restore: 2, item: { 33: 'item_stove', 34: 'item_stove' } },
    remove_oven: { label: 'オーブン', tiles: [32, 95, 96, 97], restore: 2, item: { 32: 'item_oven', 95: 'item_legendary_kitchen', 96: 'item_legendary_kitchen', 97: 'item_legendary_kitchen' } },
    remove_table: { label: 'テーブル', tiles: [21, 22, 23, 24, 25, 26, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56], restore: 0, item: {} },
    remove_chair: { label: '椅子', tiles: [10, 14, 15, 16, 17, 61, 62, 63, 64], restore: 0, item: { 17: 'item_stool' } },
    remove_register: { label: 'レジカウンター', tiles: [11, 12, 13, 92, 93, 94], restore: 0, item: { 11: 'item_register', 12: 'item_register', 13: 'item_register', 92: 'item_lux_counter', 93: 'item_lux_counter', 94: 'item_lux_counter' } },
    remove_wall: { label: '壁', tiles: [1], restore: 0, item: {} },
    remove_kitchen_floor: { label: '厨房床', tiles: [2], restore: 0, item: {} }
};

window.getShopDismantleTargetForCondition = function(condition) {
    return window.SHOP_DISMANTLE_TARGETS ? window.SHOP_DISMANTLE_TARGETS[condition] : null;
};

window.dismantleShopTarget = function(condition) {
    const s = window.SHOP_STATE;
    const target = window.getShopDismantleTargetForCondition(condition);
    if (!s || !s.grid || !target) return false;
    const aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
    for (let y = 1; y < s.grid.length - 1; y++) {
        for (let x = 1; x < s.grid[y].length - 1; x++) {
            const tile = Number(s.grid[y][x]);
            if (!target.tiles.includes(tile)) continue;
            const itemId = target.item && target.item[tile];
            s.grid[y][x] = target.restore;
            if (itemId && window.aiPet && Array.isArray(window.aiPet.inventory)) window.aiPet.inventory.push({ id: itemId, age: 0 });
            if (typeof window.refreshTableTiles === 'function') window.refreshTableTiles(s.grid);
            if (typeof window.refreshShopMiniMapLegend === 'function') window.refreshShopMiniMapLegend();
            window.showShopFloatingText(x, y, `${target.label}を片付けたよ！`, "#FF9800", aiName);
            return true;
        }
    }
    window.showShopFloatingText(s.player.x, s.player.y, `${target.label}は見つからないな…`, "#FF5252", aiName);
    return false;
};

// ==========================================
// ★ 修正：ログ記録と表示機能（発言者対応）
// ==========================================
window.addRestaurantLog = function(text, color = "#ddd", speaker = null) {
    const s = window.SHOP_STATE;
    if (s) {
        if (!s.logs) s.logs = [];
        if (!s.debugLogs) s.debugLogs = [];
        let now = new Date();
        let timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        let speakerHtml = speaker ? `<span style="color:#FFF; font-weight:bold;">${speaker}:</span> ` : "";
        let logText = `<span style="color:#888; font-size:12px;">[${timeStr}]</span> ${speakerHtml}<span style="color:${color}">${text}</span>`;
        let plainText = String(text).replace(/<[^>]+>/g, '');
        s.logs.push(logText);
        if (s.logs.length > 100) s.logs.shift();
        s.debugLogs.push({
            at: now.toISOString(),
            time: timeStr,
            speaker: speaker || '',
            text: plainText,
            color,
            line: `[${now.toISOString()} / ${timeStr}] ${speaker ? speaker + ': ' : ''}${plainText}`,
            state: {
                isOpen: !!s.isOpen,
                open: `${String(s.openHour).padStart(2, '0')}:${String(s.openMinute).padStart(2, '0')}`,
                close: `${String(s.closeHour).padStart(2, '0')}:${String(s.closeMinute).padStart(2, '0')}`,
                nextOpenAt: s.nextOpenAt || null,
                player: s.player ? { x: s.player.x, y: s.player.y, shopState: s.player.shopState, targetPos: s.player.targetPos || null } : null,
                npcs: Array.isArray(s.npcs) ? s.npcs.map(n => ({ id: n.id, state: n.state, order: n.order, x: n.x, y: n.y })) : []
            }
        });
        if (s.debugLogs.length > 2000) s.debugLogs.shift();
    }

    const logArea = document.getElementById('shop-log-area');
    if (!logArea) return;
    const line = document.createElement('div');
    line.style.marginBottom = "6px";
    line.style.borderBottom = "1px dotted #333";
    line.style.paddingBottom = "4px";
    line.innerHTML = s.logs[s.logs.length - 1];
    logArea.appendChild(line);
    
    while (logArea.children.length > 100) logArea.removeChild(logArea.firstChild);
    logArea.scrollTop = logArea.scrollHeight;
};

window.downloadRestaurantDebugLog = function() {
    const s = window.SHOP_STATE || {};
    const ai = window.aiPet || {};
    const now = new Date();
    const lines = [];
    lines.push('=== Restaurant Debug Log ===');
    lines.push(`exportedAt: ${now.toISOString()}`);
    lines.push(`userAgent: ${navigator.userAgent}`);
    lines.push('');
    lines.push('--- AI State ---');
    lines.push(JSON.stringify({
        name: ai.name,
        gold: ai.gold,
        shopTutorialCompleted: ai.shopTutorialCompleted,
        shopTutorialMindPhase: ai.shopTutorialMindPhase,
        currentShopTacticName: ai.currentShopTacticName,
        learnedWords: ai.apprentice && ai.apprentice.learnedWords ? ai.apprentice.learnedWords : [],
        shopTactics: ai.shopTactics || []
    }, null, 2));
    lines.push('');
    lines.push('--- Shop State ---');
    lines.push(JSON.stringify({
        isOpen: s.isOpen,
        openHour: s.openHour,
        openMinute: s.openMinute,
        closeHour: s.closeHour,
        closeMinute: s.closeMinute,
        nextOpenAt: s.nextOpenAt,
        announcedOneMinBefore: s.announcedOneMinBefore,
        reputation: s.reputation,
        money: s.money,
        currentFloor: s.currentFloor,
        player: s.player,
        npcs: s.npcs,
        menuList: s.menuList,
        fridge: s.fridge,
        recipeProgress: s.recipeProgress,
        dailyFlags: s.dailyFlags
    }, null, 2));
    lines.push('');
    lines.push('--- Event Log ---');
    const debugLogs = Array.isArray(s.debugLogs) ? s.debugLogs : [];
    if (debugLogs.length > 0) {
        debugLogs.forEach((entry, idx) => {
            lines.push(`${String(idx + 1).padStart(4, '0')} ${entry.line || `[${entry.at}] ${entry.speaker ? entry.speaker + ': ' : ''}${entry.text}`}`);
            if (entry.state) lines.push(`     state=${JSON.stringify(entry.state)}`);
        });
    } else if (Array.isArray(s.logs)) {
        s.logs.forEach((entry, idx) => lines.push(`${String(idx + 1).padStart(4, '0')} ${String(entry).replace(/<[^>]+>/g, '')}`));
    } else {
        lines.push('(no logs)');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `restaurant-debug-${stamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

// ==========================================
// ★ モーダルウィンドウのトグル・描画管理
// ==========================================
window.toggleRestaurantLogModal = function() {
    let wrapper = document.getElementById('shop-modals-wrapper');
    let modal = document.getElementById('shop-modal-log');
    if (wrapper && modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        // どちらか1つでも開いていればラッパーを表示
        wrapper.style.display = (document.getElementById('shop-modal-log').style.display === 'flex' || document.getElementById('shop-modal-minimap').style.display === 'flex') ? 'flex' : 'none';
        
        let logArea = document.getElementById('shop-log-area');
        if (logArea && modal.style.display === 'flex') logArea.scrollTop = logArea.scrollHeight;
    }
};

window.toggleShopMinimapModal = function() {
    let wrapper = document.getElementById('shop-modals-wrapper');
    let modal = document.getElementById('shop-modal-minimap');
    if (wrapper && modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        wrapper.style.display = (document.getElementById('shop-modal-log').style.display === 'flex' || document.getElementById('shop-modal-minimap').style.display === 'flex') ? 'flex' : 'none';
        
        if (modal.style.display === 'flex') {
            let legend = document.getElementById('shop-minimap-legend');
            if (legend && typeof window.getShopMinimapLegendHtml === 'function') legend.innerHTML = window.getShopMinimapLegendHtml();
            window.drawShopMinimap();
        }
    }
};

// ==========================================
// ★新規追加：フロア（階層）切り替え管理機能
// ==========================================
window.changeShopFloor = function(floorName) {
    const s = window.SHOP_STATE;
    if (s && s.floorData && s.floorData[floorName]) {
        s.currentFloor = floorName;
        s.grid = s.floorData[floorName];
        s.mapHeight = s.grid.length;
        s.mapWidth = s.grid[0].length;
        window.renderShopMap();
        let minimapModal = document.getElementById('shop-modal-minimap');
        if (minimapModal && minimapModal.style.display === 'flex') window.drawShopMinimap();
    }
};

// 互換性パッチ：古いセーブデータにfloorData構造を構築する
window.initShopFloors = function() {
    const s = window.SHOP_STATE;
    if (!s) return;
    if (!s.floorData) {
        s.floorData = { '1F': s.grid };
        s.currentFloor = '1F';
    }
    if (!s.player.currentFloor) s.player.currentFloor = s.currentFloor || '1F';
};

// 🗺️ ミニマップ（配列）をCanvasに描画する関数
window.drawShopMinimap = function() {
    let canvas = document.getElementById('shop-minimap-canvas');
    if (!canvas) return;
    let ctx = canvas.getContext('2d');
    const s = window.SHOP_STATE;
    
    let cw = canvas.width;
    let ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    
    let cols = s.mapWidth;
    let rows = s.mapHeight;
    let tileW = Math.min(cw / cols, ch / rows);
    let tileH = tileW;
    let offsetX = (cw - (tileW * cols)) / 2;
    let offsetY = (ch - (tileH * rows)) / 2;
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let tile = s.grid[y][x];
            let color = "#000"; 
            if (tile === 0 || tile === 100) color = "#DEB887";
            else if (tile === 1) color = "#5D4037";
            else if (tile === 2) color = "#F5F5F5";
            if (tile >= 11 && tile <= 13) color = "#4CAF50";
            else if (tile >= 21 && tile <= 26) color = "#FF9800";
            else if (tile >= 41 && tile <= 46) color = "#BA68C8"; // ★高級テーブル（薄紫）
            else if (tile >= 51 && tile <= 56) color = "#E0E0E0"; // ★大理石テーブル（白銀）
            else if ([10, 14, 15, 16, 17].includes(tile)) color = "#2196F3";
            else if (tile >= 61 && tile <= 64) color = "#1A237E"; // ★高級椅子（紺色）
            else if (tile === 71 || tile === 72) color = "#FFEB3B"; // ★飾り
            else if (tile === 31 || tile === 91) color = "#03A9F4"; // 冷蔵庫 / 最新冷蔵庫
            else if (tile === 32 || (tile >= 95 && tile <= 97)) color = "#E91E63"; // オーブン / 伝説の厨房
            else if ([33, 34].includes(tile)) color = "#424242";
            else if ([35, 36, 37].includes(tile) || (tile >= 92 && tile <= 94)) color = "#9E9E9E"; // カウンター / 高級カウンター
            
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x * tileW, offsetY + y * tileH, tileW + 0.5, tileH + 0.5); 
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.strokeRect(offsetX + x * tileW, offsetY + y * tileH, tileW, tileH);
        }
    }
    
    if (s.ghostFurniture) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        s.ghostFurniture.forEach(ghost => {
            ctx.fillRect(offsetX + ghost.x * tileW, offsetY + ghost.y * tileH, tileW, tileH);
        });
    }

    // AI店員の現在位置を白丸で表示
    let px = offsetX + s.player.x * tileW + tileW / 2;
    let py = offsetY + s.player.y * tileH + tileH / 2;
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(px, py, tileW / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    if (s.tutorialChef && window.aiPet && !window.aiPet.shopTutorialCompleted) {
        let cx = offsetX + s.tutorialChef.x * tileW + tileW / 2;
        let cy = offsetY + s.tutorialChef.y * tileH + tileH / 2;
        ctx.fillStyle = "#FF9800";
        ctx.beginPath();
        ctx.arc(cx, cy, tileW / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }

    // ★追加：お客さん（NPC）を状態ごとの色で表示
    if (s.npcs && s.npcs.length > 0) {
        s.npcs.forEach(npc => {
            let npx = offsetX + npc.x * tileW + tileW / 2;
            let npy = offsetY + npc.y * tileH + tileH / 2;
            let npcColor = "#9E9E9E"; // デフォルト（移動中など）

            if (npc.isTakeout && npc.state !== 'leaving' && npc.state !== 'angry_leaving') {
                npcColor = "#9C27B0"; // 紫（テイクアウト待機）
            } else if (npc.state === 'ordering') {
                npcColor = "#FFEB3B"; // 黄色（注文受付待ち）
            } else if (npc.state === 'waiting_for_food') {
                npcColor = "#03A9F4"; // 水色（配膳待ち）
            } else if (npc.state === 'eating') {
                npcColor = "#FF9800"; // オレンジ（食事中）
            } else if (npc.state === 'moving_to_register' || npc.state === 'paying') {
                npcColor = "#4CAF50"; // 緑（レジ待ち・会計）
            } else if (npc.state === 'angry_leaving') {
                npcColor = "#f44336"; // 赤（怒り帰宅）
            }

            ctx.fillStyle = npcColor;
            ctx.beginPath();
            ctx.arc(npx, npy, tileW / 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
        });
    }
};

// ★修正：画面にフワッと浮かぶ「心の声」テキスト ＋ 発言者付きログ
window.showShopFloatingText = function(x, y, text, color = '#FFF', speaker = null) {
    window.addRestaurantLog(text, color, speaker);
    window.showShopSpeechBubble({ x, y, text, color, speaker, duration: 4200 });
};

window.showShopSpeechBubble = function({ target = null, x = null, y = null, text = "", color = "#FFF", speaker = null, duration = 4200, sticky = false } = {}) {
    const s = window.SHOP_STATE;
    if (!s || !text) return;

    let chara = target;
    if (!chara) {
        if (speaker && String(speaker).includes('料理人') && s.tutorialChef) {
            chara = s.tutorialChef;
        } else if (x !== null && y !== null && s.player && Math.abs(s.player.x - x) < 0.5 && Math.abs(s.player.y - y) < 0.5) {
            chara = s.player;
        } else if (x !== null && y !== null && Array.isArray(s.npcs)) {
            chara = s.npcs.find(n => Math.abs(n.x - x) < 0.5 && Math.abs(n.y - y) < 0.5);
        }
    }
    if (!chara) {
        chara = s.player;
    }

    chara.speechText = text;
    chara.speechColor = color;
    chara.speechSpeaker = speaker || null;
    chara.speechSticky = !!sticky;
    chara.speechUntil = sticky ? 0 : Date.now() + duration;
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
};

window.clearShopSpeechBubble = function(target) {
    if (!target) return;
    delete target.speechText;
    delete target.speechColor;
    delete target.speechSpeaker;
    delete target.speechSticky;
    delete target.speechUntil;
};

window.ensureShopTutorialSprites = function() {
    if (typeof window.DUNGEON_SPRITES === 'undefined') return;
    ['down', 'up', 'left', 'right'].forEach(face => {
        const key = `tutorial_chef_${face}`;
        const sourceKey = `chef_${face}`;
        if (!window.DUNGEON_SPRITES[key] && window.DUNGEON_SPRITES[sourceKey]) {
            window.DUNGEON_SPRITES[key] = { ...window.DUNGEON_SPRITES[sourceKey] };
        }
    });
};

window.ensureShopTutorialChef = function() {
    const s = window.SHOP_STATE;
    if (!s || !window.aiPet || window.aiPet.shopTutorialCompleted) return null;
    if (!s.tutorialChef) {
        s.tutorialChef = {
            id: 'tutorial_chef',
            type: 'tutorial_chef',
            skin: 'tutorial_chef',
            x: 4,
            y: 8,
            face: 'right',
            shopState: 'idle',
            currentFloor: s.currentFloor || '1F',
            isTutorialGuide: true
        };
    }
    return s.tutorialChef;
};

window.runShopTutorialDialogue = function(lines, onComplete) {
    if (!Array.isArray(lines) || lines.length === 0) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    const s = window.SHOP_STATE;
    if (!s) return;
    s.shopTutorialSpeaking = true;
    let idx = 0;
    const next = () => {
        const line = lines[idx];
        if (!line) {
            s.shopTutorialSpeaking = false;
            if (typeof onComplete === 'function') onComplete();
            return;
        }
        let target = line.target === 'chef' ? window.ensureShopTutorialChef() : s.player;
        window.addRestaurantLog(line.text, line.color || '#FFF', line.speaker || (line.target === 'chef' ? '料理人' : (window.aiPet?.name || 'AI店員')));
        window.showShopSpeechBubble({
            target,
            text: line.text,
            color: line.color || '#FFF',
            speaker: line.speaker || (line.target === 'chef' ? '料理人' : (window.aiPet?.name || 'AI店員')),
            sticky: true
        });
        idx++;
        setTimeout(next, line.wait || 3600);
    };
    next();
};

window.learnShopTutorialWord = function(word) {
    const ai = window.aiPet;
    if (!ai) return;
    if (!ai.apprentice) ai.apprentice = {};
    if (!Array.isArray(ai.apprentice.learnedWords)) ai.apprentice.learnedWords = [];
    if (!ai.apprentice.learnedWords.includes(word)) {
        ai.apprentice.learnedWords.push(word);
    }
    if (typeof saveGameData === 'function') saveGameData();
};

window.isShopTutorialActive = function() {
    return !!(window.aiPet && !window.aiPet.shopTutorialCompleted);
};

window.isShopTutorialMindActive = function() {
    const ai = window.aiPet;
    if (!ai || ai.shopTutorialCompleted || !ai.shopTutorialIntroDone) return false;
    const phase = ai.shopTutorialMindPhase || 'kitchen';
    if (phase === 'service') return !!ai.shopTutorialServiceIntroDone && !ai.shopTutorialServiceMindDone;
    if (['expand', 'decor', 'rest'].includes(phase)) return !!ai.shopTutorialServiceDone && !ai.shopTutorialFinalWordsDone;
    return ['kitchen', 'table', 'chair', 'register', 'research', 'prep'].includes(phase) && !ai.shopTutorialPrepDone;
};

window.previewTutorialFurniture = function(items) {
    const s = window.SHOP_STATE;
    if (!s) return;
    s.ghostFurniture = items.map(item => ({ ...item }));
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
};

window.placeTutorialFurniture = function(items) {
    const s = window.SHOP_STATE;
    if (!s || !s.grid) return;
    items.forEach(item => {
        if (s.grid[item.y] && s.grid[item.y][item.x] !== undefined) {
            s.grid[item.y][item.x] = item.tile;
        }
    });
    if (typeof window.refreshTableTiles === 'function') window.refreshTableTiles(s.grid);
    const score = Object.values(window.SHOP_FURNITURE_DB || {}).reduce((sum, f) => sum, 0);
    s.currentScore = 0;
    const countedTiles = new Set(['31', '32', '33', '34', '21', '22', '23', '24', '25', '26', '10', '14', '15', '16']);
    s.grid.forEach(row => row.forEach(tile => { if (countedTiles.has(String(tile))) s.currentScore += 1; }));
    s.ghostFurniture = null;
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
};

window.placeShopTutorialRegister = function(onComplete) {
    const s = window.SHOP_STATE;
    const ai = window.aiPet;
    if (!s || !s.grid || !ai) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    const registerItems = [
        { x: 8, y: 5, key: 'rfur_register_left', tile: 11 },
        { x: 9, y: 5, key: 'rfur_register_center', tile: 12 },
        { x: 10, y: 5, key: 'rfur_register_right', tile: 13 }
    ];
    if (s.grid[5] && [11, 12, 13].some(t => s.grid.some(row => Array.isArray(row) && row.includes(t)))) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    window.runShopTutorialDialogue([
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'そうだ、もうひとつ大事なもんがある。会計用のレジカウンターだ。' },
        { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '料理を出したあと、お会計する場所が必要なんだね。' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'その通りだ。客席の近くに置いて、客が迷わず会計に来られるようにするぞ。' }
    ], () => {
        window.moveShopTutorialPair({ x: 9, y: 6, face: 'up', chefX: 7, chefY: 6, chefFace: 'right' }, () => {
            window.previewTutorialFurniture(registerItems);
            setTimeout(() => {
                window.placeTutorialFurniture(registerItems);
                if (typeof saveGameData === 'function') saveGameData();
                if (typeof onComplete === 'function') onComplete();
            }, 900);
        });
    });
};

window.moveShopPlayerForTutorial = function(target, onArrive) {
    const s = window.SHOP_STATE;
    if (!s || !s.player || !target) {
        if (typeof onArrive === 'function') onArrive();
        return;
    }
    const p = s.player;
    window.logShopTutorialDebug('AI店員の移動開始', { 移動先: target });
    p.targetPos = { x: target.x, y: target.y, floor: s.currentFloor || '1F' };
    p.shopState = 'tutorial_walking';
    p.action = 'walk';
    const startedAt = Date.now();
    const check = () => {
        if (!window.SHOP_STATE || !window.SHOP_STATE.player) return;
        const current = window.SHOP_STATE.player;
        if (current.x === target.x && current.y === target.y) {
            current.targetPos = null;
            current.shopState = 'tutorial_waiting';
            current.action = 'idle';
            current.face = target.face || current.face || 'up';
            window.logShopTutorialDebug('AI店員の移動完了', { 移動先: target });
            if (typeof onArrive === 'function') onArrive();
        } else if (Date.now() - startedAt > 9000) {
            current.targetPos = null;
            current.shopState = 'tutorial_waiting';
            current.action = 'idle';
            current.face = target.face || current.face || 'up';
            window.logShopTutorialDebug('AI店員の移動が時間切れのため演出を継続します', {
                現在地: { x: current.x, y: current.y },
                移動先: target
            });
            if (typeof onArrive === 'function') onArrive();
        } else {
            setTimeout(check, 180);
        }
    };
    check();
};

window.moveTutorialChefNear = function(target) {
    const s = window.SHOP_STATE;
    const chef = window.ensureShopTutorialChef();
    if (!s || !chef || !target) return;

    let nx = target.chefX !== undefined ? target.chefX : Math.max(1, Math.min(s.mapWidth - 2, target.x - 2));
    let ny = target.chefY !== undefined ? target.chefY : target.y;
    if (!s.grid[ny] || s.grid[ny][nx] === 1) {
        nx = Math.max(1, Math.min(s.mapWidth - 2, target.x + 2));
    }
    chef.x = nx;
    chef.y = Math.max(1, Math.min(s.mapHeight - 2, ny));
    chef.face = target.chefFace || (chef.x < target.x ? 'right' : 'left');
    chef.currentFloor = s.currentFloor || '1F';
};

window.moveTutorialChefForTutorial = function(target, onArrive) {
    const s = window.SHOP_STATE;
    const chef = window.ensureShopTutorialChef();
    if (!s || !chef || !target) {
        if (typeof onArrive === 'function') onArrive();
        return;
    }

    const blockedTiles = [1, 10, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97];
    const currentTile = s.grid && s.grid[chef.y] ? Number(s.grid[chef.y][chef.x]) : 0;
    if (blockedTiles.includes(currentTile)) {
        const fallback = [{ x: 3, y: 7 }, { x: 4, y: 7 }, { x: 7, y: 7 }, { x: 5, y: 4 }, { x: 4, y: 4 }]
            .find(pos => s.grid[pos.y] && !blockedTiles.includes(Number(s.grid[pos.y][pos.x])));
        if (fallback) {
            window.logShopTutorialDebug('料理人が家具上にいたため退避します', { 元位置: { x: chef.x, y: chef.y, tile: currentTile }, 退避先: fallback });
            chef.x = fallback.x;
            chef.y = fallback.y;
        }
    }

    if (Array.isArray(target.chefPath) && target.chefPath.length > 0) {
        let pathIndex = 0;
        const runPath = () => {
            const point = target.chefPath[pathIndex];
            window.moveTutorialChefForTutorial({
                ...target,
                chefPath: null,
                chefX: point.x,
                chefY: point.y,
                chefFace: point.face || target.chefFace
            }, () => {
                pathIndex++;
                if (pathIndex < target.chefPath.length) runPath();
                else if (typeof onArrive === 'function') onArrive();
            });
        };
        runPath();
        return;
    }

    const baseX = Number.isFinite(Number(target.x)) ? Number(target.x) : (s.player ? s.player.x : 5);
    const baseY = Number.isFinite(Number(target.y)) ? Number(target.y) : (s.player ? s.player.y : 5);
    let destX = target.chefX !== undefined && Number.isFinite(Number(target.chefX)) ? Number(target.chefX) : Math.max(1, Math.min(s.mapWidth - 2, baseX - 1));
    let destY = target.chefY !== undefined && Number.isFinite(Number(target.chefY)) ? Number(target.chefY) : baseY;
    destX = Math.max(1, Math.min(s.mapWidth - 2, destX));
    destY = Math.max(1, Math.min(s.mapHeight - 2, destY));
    if (!s.grid[destY] || s.grid[destY][destX] === 1) {
        destX = Math.max(1, Math.min(s.mapWidth - 2, baseX - 1));
        destY = Math.max(1, Math.min(s.mapHeight - 2, baseY));
    }

    chef.currentFloor = s.currentFloor || '1F';
    chef.action = 'walk';
    const finalFace = target.chefFace || (destX < baseX ? 'right' : 'left');
    window.logShopTutorialDebug('料理人の移動開始', { 移動先: { x: destX, y: destY, face: finalFace }, 元ターゲット: target });
    const step = () => {
        if (!window.SHOP_STATE || !window.SHOP_STATE.tutorialChef) return;
        const c = window.SHOP_STATE.tutorialChef;
        if (c.x === destX && c.y === destY) {
            c.action = 'idle';
            c.face = finalFace;
            if (typeof window.renderShopMap === 'function') window.renderShopMap();
            window.logShopTutorialDebug('料理人の移動完了', { 移動先: { x: destX, y: destY, face: finalFace } });
            if (typeof onArrive === 'function') onArrive();
            return;
        }

        let nextStep = null;
        if (typeof window.getShopNextStep === 'function') {
            nextStep = window.getShopNextStep(c.x, c.y, destX, destY, c.currentFloor || s.currentFloor || '1F');
        }
        if (!nextStep) {
            const candidates = [];
            if (c.y > destY) candidates.push({ x: c.x, y: c.y - 1, face: 'up' });
            if (c.y < destY) candidates.push({ x: c.x, y: c.y + 1, face: 'down' });
            if (c.x > destX) candidates.push({ x: c.x - 1, y: c.y, face: 'left' });
            if (c.x < destX) candidates.push({ x: c.x + 1, y: c.y, face: 'right' });
            nextStep = candidates.find(pos => s.grid[pos.y] && !blockedTiles.includes(Number(s.grid[pos.y][pos.x])));
        }
        if (nextStep) {
            if (nextStep.x > c.x) c.face = 'right';
            else if (nextStep.x < c.x) c.face = 'left';
            else if (nextStep.y > c.y) c.face = 'down';
            else if (nextStep.y < c.y) c.face = 'up';
            c.x = nextStep.x;
            c.y = nextStep.y;
        } else {
            c.action = 'idle';
            window.logShopTutorialDebug('料理人の移動経路が見つかりません', { 現在地: { x: c.x, y: c.y }, 目的地: { x: destX, y: destY } });
            if (typeof onArrive === 'function') onArrive();
            return;
        }
        if (typeof window.renderShopMap === 'function') window.renderShopMap();
        setTimeout(step, 240);
    };
    step();
};

window.moveShopTutorialPair = function(target, onArrive) {
    let pending = 2;
    const done = () => {
        pending--;
        if (pending <= 0 && typeof onArrive === 'function') onArrive();
    };
    window.moveTutorialChefForTutorial(target, done);
    window.moveShopPlayerForTutorial(target, done);
};

window.runAtShopTutorialFocus = function(phase, onReady) {
    const s = window.SHOP_STATE;
    const target = window.getShopTutorialFocusTarget(phase);
    const chef = s ? s.tutorialChef : null;
    const player = s ? s.player : null;
    const chefReady = !chef || (chef.x === target.chefX && chef.y === target.chefY);
    const playerReady = !player || (player.x === target.x && player.y === target.y);
    if (chefReady && playerReady) {
        if (chef) chef.face = target.chefFace || chef.face || 'right';
        if (player) player.face = target.face || player.face || 'up';
        if (typeof onReady === 'function') onReady();
        return;
    }
    window.moveShopTutorialPair(target, onReady);
};

window.logShopTutorialDebug = function(label, detail = {}) {
    const s = window.SHOP_STATE;
    const ai = window.aiPet;
    const payload = {
        フェーズ: ai ? ai.shopTutorialMindPhase : undefined,
        ステップ: ai ? ai.shopTutorialStep : undefined,
        レイアウト完了: ai ? ai.shopTutorialLayoutDone : undefined,
        通常AI停止中: s ? !!s.shopTutorialLockAI : undefined,
        プレイヤー: s && s.player ? { x: s.player.x, y: s.player.y, 状態: s.player.shopState, 行動: s.player.action, 目標: s.player.targetPos || null } : null,
        料理人: s && s.tutorialChef ? { x: s.tutorialChef.x, y: s.tutorialChef.y, 向き: s.tutorialChef.face, 行動: s.tutorialChef.action } : null,
        詳細: detail
    };
    console.log(`[レストランチュートリアル] ${label}`, payload);
};

window.logShopTutorialDebugThrottled = function(key, label, detail = {}, interval = 1200) {
    window.SHOP_TUTORIAL_DEBUG_LAST = window.SHOP_TUTORIAL_DEBUG_LAST || {};
    const now = Date.now();
    if (window.SHOP_TUTORIAL_DEBUG_LAST[key] && now - window.SHOP_TUTORIAL_DEBUG_LAST[key] < interval) return;
    window.SHOP_TUTORIAL_DEBUG_LAST[key] = now;
    window.logShopTutorialDebug(label, detail);
};

window.getShopTutorialFocusTarget = function(phase = null) {
    const p = phase || window.getShopTutorialMindPhase();
    const targets = {
        kitchen: { x: 6, y: 3, face: 'up', chefX: 4, chefY: 4, chefFace: 'right' },
        table: { x: 7, y: 7, face: 'up', chefX: 5, chefY: 7, chefFace: 'right' },
        chair: { x: 7, y: 5, face: 'up', chefX: 5, chefY: 7, chefFace: 'right' },
        expand: { x: 8, y: 7, face: 'right', chefX: 6, chefY: 7, chefFace: 'right' },
        decor: { x: 3, y: 4, face: 'left', chefX: 5, chefY: 4, chefFace: 'left' },
        rest: { x: 2, y: 4, face: 'right', chefX: 5, chefY: 4, chefFace: 'left' },
        prep: {
            x: 7,
            y: 3,
            face: 'up',
            chefX: 4,
            chefY: 4,
            chefFace: 'right',
            chefPath: [
                { x: 3, y: 7, face: 'left' },
                { x: 3, y: 4, face: 'up' },
                { x: 4, y: 4, face: 'right' }
            ]
        },
        research: {
            x: 7,
            y: 3,
            face: 'up',
            chefX: 4,
            chefY: 4,
            chefFace: 'right',
            chefPath: [
                { x: 3, y: 7, face: 'left' },
                { x: 3, y: 4, face: 'up' },
                { x: 4, y: 4, face: 'right' }
            ]
        }
    };
    return targets[p] || targets.kitchen;
};

window.getShopTutorialMindPhase = function() {
    const ai = window.aiPet;
    if (!ai) return 'kitchen';
    return ai.shopTutorialMindPhase || 'kitchen';
};

window.getShopTutorialMindGuide = function(phase = null) {
    const p = phase || window.getShopTutorialMindPhase();
    const guides = {
        kitchen: {
            condition: 'missing_kitchen',
            action: 'かえる',
            label: '厨房がない時',
            intro: 'まずは「厨房がない時」を条件にしろ。そうすりゃAI店員は、店づくりが必要だと判断できる。',
            prompt: 'AIマインドで「もし 厨房がない時 なら かえる」と設定して、作戦を適用してみろ。',
            done: 'よし、その条件なら厨房づくりに動ける。実際にやらせてみるぞ！'
        },
        table: {
            condition: 'missing_table',
            action: 'かえる',
            label: 'テーブルがない時',
            intro: '次は客席だ。「テーブルがない時」を条件にすれば、席づくりが必要だと分かる。',
            prompt: 'AIマインドで「もし テーブルがない時 なら かえる」にしてみろ。',
            done: 'いいぞ。今度はテーブルを置く動きを見ておけ！'
        },
        chair: {
            condition: 'missing_chair',
            action: 'かえる',
            label: '椅子がない時',
            intro: '最後は椅子だ。テーブルだけじゃ客は座れねえ。「椅子がない時」も覚えておけ。',
            prompt: 'AIマインドで「もし 椅子がない時 なら かえる」にしてみろ。',
            done: 'それでいい。席を完成させるぞ！'
        },
        register: {
            condition: 'missing_register',
            action: 'かえる',
            label: 'レジカウンターがない時',
            intro: '料理を出したら終わりじゃねえ。会計用のレジカウンターも店には必要だ。',
            prompt: 'AIマインドで「もし レジカウンターがない時 なら かえる」にして、会計場所を用意してみろ。',
            done: 'よし、その条件なら会計場所も忘れず用意できる。レジを置くぞ！'
        },
        research: {
            condition: 'has_researchable_recipe',
            action: 'おぼえる',
            label: 'ひらめけるレシピがある時',
            intro: '次はレシピの研究開発だ。料理は、まず思いついて、研究して、完成させる。',
            prompt: 'AIマインドで「もし ひらめけるレシピがある時 なら おぼえる」にしてみろ。',
            done: 'よし、その作戦なら素材からレシピを思いついて研究できる。今回は練習だから一気に完成させるぞ！'
        },
        prep: {
            condition: 'has_preppable_recipe',
            action: 'つくる',
            label: '仕込めるレシピがある時',
            intro: '次は仕込みだ。材料と覚えたレシピがそろっている時だけ、料理は作れる。',
            prompt: 'AIマインドで「もし 仕込めるレシピがある時 なら つくる」にしてみろ。',
            done: 'よし、その作戦なら材料がある時だけ仕込みに入れる。厨房で試してみるぞ！'
        },
        service: {
            condition: 'customer_waiting_order',
            action: 'きく',
            label: '注文待ちの客がいる時',
            intro: '接客は優先度が大事だ。客の状態を見て、上から順にやることを決めるんだ。',
            prompt: 'AIマインドで、注文待ちなら「きく」、料理待ちなら「はこぶ」、レジ待ちなら「うつ」をこの順で設定してみろ。',
            done: 'よし、その順番なら接客の流れがつながる。次は営業時間を決めて、実際に客を迎えるぞ！',
            rules: [
                { condition: 'customer_waiting_order', action: 'きく', label: '注文待ちの客がいる時' },
                { condition: 'customer_waiting_food', action: 'はこぶ', label: '料理待ちの客がいる時' },
                { condition: 'customer_waiting_register', action: 'うつ', label: 'レジ待ちの客がいる時' }
            ]
        },
        expand: {
            condition: 'daily_seat_shortage',
            action: 'ふやす',
            label: '座れない客がいた日',
            intro: '客が増えると、今の席数じゃ足りなくなる日が来る。そういう時に使うのが「ふやす」だ。',
            prompt: 'AIマインドで「もし 座れない客がいた日 なら ふやす」にして、席を増やす練習をしてみろ。',
            done: 'いいぞ。これなら席不足を見て、AI店員が席を増やしに動ける！'
        },
        decor: {
            condition: 'shop_is_plain',
            action: 'おく',
            label: 'お店が殺風景な時',
            intro: '料理だけじゃなく、店の雰囲気も大事だ。飾りを置く時は「おく」を使う。',
            prompt: 'AIマインドで「もし お店が殺風景な時 なら おく」にして、店を少し飾ってみろ。',
            done: 'その調子だ。客が入りたくなる店にするには、雰囲気づくりも忘れるな！'
        },
        rest: {
            condition: 'is_closed',
            action: 'やすむ',
            label: '営業時間外（閉店中）の時',
            intro: '最後は休むことだ。働きっぱなしじゃ、いい接客もいい料理も続かねえ。',
            prompt: 'AIマインドで「もし 営業時間外（閉店中）の時 なら やすむ」にして、休憩も作戦に入れてみろ。',
            done: 'よし。休む判断までできれば、店は長く回せる。最後にひとこと言わせろ。'
        }
    };
    return guides[p] || guides.kitchen;
};

window.getShopTutorialResearchableRecipe = function() {
    const s = window.SHOP_STATE;
    if (!window.aiPet || !s) return null;
    const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS || {});
    const preferred = ['baked_carrot', 'baked_pepper', 'baked_tomato', 'dish_salad', 'dish_stirfry', 'dish_soup', 'dish_minestrone'];
    const ordered = [...preferred.filter(k => recipeKeys.includes(k)), ...recipeKeys.filter(k => !preferred.includes(k))];
    return ordered.find(key => window.checkAndConsumeIngredients(key, true)) || null;
};

window.getShopTutorialPreppableRecipe = function() {
    const s = window.SHOP_STATE;
    if (!window.aiPet || !s) return null;
    const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS || {});
    const preferred = [window.aiPet.shopTutorialResearchRecipe, 'baked_carrot', 'baked_pepper', 'baked_tomato', 'dish_salad', 'dish_stirfry', 'dish_soup', 'dish_minestrone'].filter(Boolean);
    const ordered = [...preferred.filter(k => recipeKeys.includes(k)), ...recipeKeys.filter(k => !preferred.includes(k))];
    return ordered.find(key => s.recipeProgress && s.recipeProgress[key] >= 100 && window.checkAndConsumeIngredients(key, true)) || null;
};

window.getShopRecipeIngredientText = function(recipeKey) {
    const reqs = window.SHOP_RECIPE_COSTS && window.SHOP_RECIPE_COSTS[recipeKey] ? window.SHOP_RECIPE_COSTS[recipeKey] : [];
    return reqs.map(id => window.SHOP_ING_NAMES[id] || id).join('、');
};

window.startRestaurantTutorialResearchIntro = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialResearchDone) return;
    s.shopTutorialLockAI = true;
    ai.shopTutorialMindPhase = 'research';
    if (ai.shopTutorialResearchIntroDone && ai.shopTutorialResearchRecipe) {
        window.promptShopTutorialMind('research');
        return;
    }
    window.logShopTutorialDebug('研究開発チュートリアルを開始', {});
    window.runAtShopTutorialFocus('research', () => {
        const recipeKey = window.getShopTutorialResearchableRecipe();
        if (!recipeKey) {
            window.logShopTutorialDebug('研究開発用の素材が不足しています', { inventory: ai.inventory });
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、厨房はできたな。次はレシピを思いつく練習だ。まず持ち物を確認するぞ。' },
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '……今はレシピを考えられる材料が足りねえな。畑や探検で、ニンジンやトマトみたいな食材を集めてこい！' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '材料を集めてから、もう一度お店に戻ってくるね。' }
            ], () => {
                s.shopTutorialLockAI = false;
                if (typeof saveGameData === 'function') saveGameData();
                if (typeof window.exitShopManagement === 'function') window.exitShopManagement();
                else if (typeof window.closeShopMapUI === 'function') window.closeShopMapUI();
            });
            return;
        }

        ai.shopTutorialResearchRecipe = recipeKey;
        ai.shopTutorialResearchIntroDone = true;
        const dishName = window.SHOP_DISH_NAMES[recipeKey] || recipeKey;
        const ingText = window.getShopRecipeIngredientText(recipeKey);
        window.learnShopTutorialWord('おぼえる');
        ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 5);
        if (typeof saveGameData === 'function') saveGameData();
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '料理は、いきなり仕込めるわけじゃねえ。まず材料からレシピを思いつくんだ。' },
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: `持ち物を見ると「${dishName}」をひらめけそうだ。使う材料は ${ingText} だな。` },
            { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: 'レシピを思いついて研究する時は「おぼえる」だね。覚えたよ！' }
        ], () => {
            window.ensureShopTutorialTactic('research');
            window.promptShopTutorialMind('research');
        });
    });
};

window.startRestaurantTutorialResearchDemo = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialResearchDone) return;
    const recipeKey = ai.shopTutorialResearchRecipe || window.getShopTutorialResearchableRecipe();
    if (!recipeKey) {
        window.startRestaurantTutorialResearchIntro();
        return;
    }
    s.shopTutorialLockAI = true;
    if (!s.recipeProgress) s.recipeProgress = {};
    window.logShopTutorialDebug('研究開発デモを開始', { recipeKey });
    window.runAtShopTutorialFocus('research', () => {
        const dishName = window.SHOP_DISH_NAMES[recipeKey] || recipeKey;
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '研究開発は、材料を見てレシピを形にしていく作業だ。' },
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '本番では少しずつ進むが、今回は練習だ。一気に完成させてやる！' }
        ], () => {
            const player = s.player;
            if (player) {
                player.face = 'up';
                player.speechText = `${dishName}を研究してみるね！`;
                player.speechColor = '#00BCD4';
                player.speechSpeaker = ai.name || 'AI店員';
                player.speechSticky = true;
                window.addRestaurantLog(`${dishName}を研究してみるね！`, '#00BCD4', ai.name || 'AI店員');
            }
            setTimeout(() => {
                s.recipeProgress[recipeKey] = 100;
                ai.shopTutorialResearchDone = true;
                ai.shopTutorialPrepRecipe = recipeKey;
                ai.shopTutorialMindPhase = 'prep';
                ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 6);
                window.showShopSpeechBubble({ target: s.player, text: `よし！${dishName}のレシピが完成したよ！`, color: '#4CAF50', speaker: ai.name || 'AI店員', sticky: true });
                window.addRestaurantLog(`よし！${dishName}のレシピが完成したよ！`, '#4CAF50', ai.name || 'AI店員');
                if (typeof saveGameData === 'function') saveGameData();
                setTimeout(() => {
                    window.runShopTutorialDialogue([
                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、レシピは完成だ。ここまで来て、初めて仕込みができる。' },
                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '次は完成したレシピを使って料理の在庫を作る。「つくる」を教えてやる。' }
                    ], () => {
                        window.startRestaurantTutorialPrepIntro();
                    });
                }, 1600);
            }, 1700);
        });
    });
};

window.startRestaurantTutorialPrepIntro = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialPrepDone) return;
    s.shopTutorialLockAI = true;
    ai.shopTutorialMindPhase = 'prep';
    if (ai.shopTutorialPrepIntroDone && ai.shopTutorialPrepRecipe) {
        window.promptShopTutorialMind('prep');
        return;
    }
    window.logShopTutorialDebug('仕込みチュートリアルを開始', {});
    window.runAtShopTutorialFocus('prep', () => {
        const recipeKey = window.getShopTutorialPreppableRecipe();
        if (!recipeKey) {
            window.logShopTutorialDebug('仕込み用の素材が不足しています', { inventory: ai.inventory });
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、厨房はできたな。次は仕込みだ。まず持ち物を確認するぞ。' },
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '……今は仕込める材料が足りねえな。畑や探検で、ニンジンやトマトみたいな食材を集めてこい！' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '材料を集めてから、もう一度お店に戻ってくるね。' }
            ], () => {
                s.shopTutorialLockAI = false;
                if (typeof saveGameData === 'function') saveGameData();
                if (typeof window.exitShopManagement === 'function') window.exitShopManagement();
                else if (typeof window.closeShopMapUI === 'function') window.closeShopMapUI();
            });
            return;
        }

        ai.shopTutorialPrepRecipe = recipeKey;
        ai.shopTutorialPrepIntroDone = true;
        const dishName = window.SHOP_DISH_NAMES[recipeKey] || recipeKey;
        const ingText = window.getShopRecipeIngredientText(recipeKey);
        window.learnShopTutorialWord('つくる');
        ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 7);
        if (typeof saveGameData === 'function') saveGameData();
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '完成したレシピがあれば、次は仕込みだ。厨房で料理の在庫を作るぞ。' },
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: `今は「${dishName}」を仕込める。材料は ${ingText} だな。` },
            { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '材料とレシピがそろっている時に「つくる」んだね。覚えたよ！' }
        ], () => {
            window.ensureShopTutorialTactic('prep');
            window.promptShopTutorialMind('prep');
        });
    });
};

window.startRestaurantTutorialPrepDemo = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialPrepDone) return;
    const recipeKey = ai.shopTutorialPrepRecipe || window.getShopTutorialPreppableRecipe();
    if (!recipeKey) {
        window.startRestaurantTutorialPrepIntro();
        return;
    }
    s.shopTutorialLockAI = true;
    if (!s.recipeProgress) s.recipeProgress = {};
    s.recipeProgress[recipeKey] = 100;
    window.logShopTutorialDebug('仕込みデモを開始', { recipeKey });
    window.runAtShopTutorialFocus('prep', () => {
        const dishName = window.SHOP_DISH_NAMES[recipeKey] || recipeKey;
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '仕込みは、厨房で材料を使って料理の在庫を作る作業だ。' },
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '今からAI店員にやらせてみろ。材料が減って、冷蔵庫の在庫が増えれば成功だ。' }
        ], () => {
            const player = s.player;
            if (player) {
                player.face = 'up';
                player.speechText = `${dishName}を仕込んでみるね！`;
                player.speechColor = '#00BCD4';
                player.speechSpeaker = ai.name || 'AI店員';
                player.speechSticky = true;
                window.addRestaurantLog(`${dishName}を仕込んでみるね！`, '#00BCD4', ai.name || 'AI店員');
            }
            setTimeout(() => {
                if (window.checkAndConsumeIngredients(recipeKey, false)) {
                    if (!s.fridge) s.fridge = {};
                    if (!s.fridge[recipeKey]) s.fridge[recipeKey] = 0;
                    s.fridge[recipeKey]++;
                    if (!s.menuList) s.menuList = [];
                    if (!s.menuList.includes(recipeKey)) s.menuList.push(recipeKey);
                    window.showShopSpeechBubble({ target: s.player, text: `よし！${dishName}を1つ仕込めたよ！`, color: '#4CAF50', speaker: ai.name || 'AI店員', sticky: true });
                    window.addRestaurantLog(`よし！${dishName}を1つ仕込めたよ！`, '#4CAF50', ai.name || 'AI店員');
                    ai.shopTutorialPrepDone = true;
                    ai.shopTutorialMindPhase = 'service';
                    ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 6);
                    s.shopTutorialLockAI = false;
                    if (typeof saveGameData === 'function') saveGameData();
                    setTimeout(() => {
                        window.runShopTutorialDialogue([
                            { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'いい仕込みだ！今作った在庫は、営業中に客へ出せる。' },
                            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '次は接客だ。客が来たら注文を聞いて、料理を出し、会計までこなす流れを教えてやる。' }
                        ], () => {
                            window.startRestaurantTutorialServiceIntro();
                        });
                    }, 1600);
                } else {
                    window.logShopTutorialDebug('仕込みデモ中に素材不足になりました', { recipeKey, inventory: ai.inventory });
                    window.runShopTutorialDialogue([
                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'む、材料が足りなくなったな。いったん外で食材を集めてこい！' }
                    ], () => {
                        s.shopTutorialLockAI = false;
                        if (typeof saveGameData === 'function') saveGameData();
                    });
                }
            }, 1700);
        });
    });
};

window.startRestaurantTutorialServiceIntro = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialCustomerDone) return;
    if (ai.shopTutorialServiceIntroDone) return;
    s.shopTutorialLockAI = true;
    ai.shopTutorialMindPhase = 'service';
    ai.shopTimerUnlocked = true;
    ai.shopTutorialTimerSet = false;
    ai.shopTutorialOneMinDialogueDone = false;
    ai.shopTutorialServiceWaitLineIndex = 0;
    ai.shopTutorialLastWaitLineAt = 0;
    ai.shopTutorialServiceMindDone = false;
    ai.currentShopTacticName = "AIにまかせる";
    if (typeof saveGameData === 'function') saveGameData();
    window.runShopTutorialDialogue([
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '接客に入る前に、客をさばく言葉を覚えておけ。' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '注文待ちの客には「きく」。料理待ちの客には「はこぶ」。会計待ちの客には「うつ」だ。' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '大事なのは優先度だ。注文、配膳、会計。この順でAIマインドに並べておけ。' },
        { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '「きく」「はこぶ」「うつ」だね。順番も覚えたよ！' }
    ], () => {
        window.learnShopTutorialWord('きく');
        window.learnShopTutorialWord('はこぶ');
        window.learnShopTutorialWord('うつ');
        ai.shopTutorialLearnedAsk = true;
        ai.shopTutorialLearnedCarry = true;
        ai.shopTutorialLearnedRegister = true;
        ai.shopTutorialServiceIntroDone = true;
        s.shopTutorialLockAI = false;
        if (typeof saveGameData === 'function') saveGameData();
        window.promptShopTutorialMind('service');
    });
};

window.spawnShopTutorialCustomer = function() {
    const s = window.SHOP_STATE;
    console.log('[レストランチュートリアル] お客さん生成を試みます', {
        stateあり: !!s,
        aiあり: !!window.aiPet,
        生成済み: window.aiPet ? !!window.aiPet.shopTutorialCustomerSpawned : undefined,
        menuList: s ? s.menuList : undefined,
        fridge: s ? s.fridge : undefined,
        isOpen: s ? s.isOpen : undefined
    });
    if (!s || !window.aiPet || window.aiPet.shopTutorialCustomerSpawned) return;
    if ((!s.menuList || s.menuList.length === 0) && s.fridge) {
        s.menuList = Object.keys(s.fridge).filter(key => s.fridge[key] > 0);
    }
    if (!s.menuList || s.menuList.length === 0) {
        console.warn('[レストランチュートリアル] お客さん生成中止: 提供メニューがありません', { fridge: s.fridge });
        return;
    }
    let seat = null;
    for (let y = 0; y < s.mapHeight; y++) {
        for (let x = 0; x < s.mapWidth; x++) {
            if ([10, 14, 15, 16, 17, 61, 62, 63, 64].includes(s.grid[y][x])) {
                seat = { x, y, floor: s.currentFloor || '1F' };
                break;
            }
        }
        if (seat) break;
    }
    if (!seat) {
        for (let y = 0; y < s.mapHeight; y++) {
            for (let x = 0; x < s.mapWidth; x++) {
                if ([21, 22, 23, 24, 25, 26].includes(s.grid[y][x])) {
                    const candidates = [{ x: x, y: y - 1 }, { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }];
                    seat = candidates.find(pos => s.grid[pos.y] && [0, 2].includes(s.grid[pos.y][pos.x]));
                    if (seat) {
                        seat.floor = s.currentFloor || '1F';
                        break;
                    }
                }
            }
            if (seat) break;
        }
    }
    if (!seat) {
        console.warn('[レストランチュートリアル] お客さん生成中止: 座席位置を見つけられません', { grid: s.grid });
        return;
    }
    let exitPos = { x: s.player.x, y: s.player.y };
    for (let y = 0; y < s.mapHeight; y++) {
        for (let x = 0; x < s.mapWidth; x++) {
            if (s.grid[y][x] === 100) {
                exitPos = { x, y };
                break;
            }
        }
        if (s.grid[exitPos.y] && s.grid[exitPos.y][exitPos.x] === 100) break;
    }
    const order = (s.menuList || []).find(key => s.fridge && s.fridge[key] > 0) || s.menuList[0];
    if (!order) {
        console.warn('[レストランチュートリアル] お客さん生成中止: 注文できる料理がありません', { menuList: s.menuList, fridge: s.fridge });
        return;
    }
    s.npcs = s.npcs || [];
    s.npcs.push({
        id: 'tutorial_customer_' + Date.now(),
        skin: 'robot',
        x: exitPos.x,
        y: exitPos.y,
        targetPos: seat,
        face: 'up',
        action: 'walk',
        state: 'moving_to_seat',
        prevState: 'moving_to_seat',
        timer: 0,
        isTakeout: false,
        order,
        currentFloor: s.currentFloor || '1F',
        patience: 999,
        queueJoinedAt: 0,
        isRegular: false,
        msg: 'こんにちは、営業してる？',
        msgColor: '#fff',
        intel: 50,
        isTutorialCustomer: true
    });
    window.aiPet.shopTutorialCustomerSpawned = true;
    const chef = window.ensureShopTutorialChef();
    if (chef) {
        const watchSpots = [
            { x: 3, y: 4, face: 'right' },
            { x: 4, y: 7, face: 'right' },
            { x: 7, y: 7, face: 'left' },
            { x: 3, y: 7, face: 'right' }
        ];
        const blocked = new Set([1, 10, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97]);
        const watch = watchSpots.find(pos => s.grid[pos.y] && !blocked.has(Number(s.grid[pos.y][pos.x])) && Math.abs(pos.x - seat.x) + Math.abs(pos.y - seat.y) > 1);
        if (watch) {
            chef.x = watch.x;
            chef.y = watch.y;
            chef.face = watch.face;
        }
    }
    console.log('[レストランチュートリアル] お客さんを生成しました', { order, seat, exitPos, npcCount: s.npcs.length });
    window.addRestaurantLog('お客さんが来たぞ！落ち着いて、さっき教えた流れで迎えるんだ！', '#FFEB3B', '料理人');
    if (typeof window.showShopSpeechBubble === 'function') {
        window.showShopSpeechBubble({
            target: s.tutorialChef,
            text: 'お客さんが来たぞ！落ち着いて、さっき教えた流れで迎えるんだ！',
            color: '#FFEB3B',
            speaker: '料理人',
            duration: 5200
        });
    }
};

window.updateShopServiceTutorial = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialCompleted || ai.shopTutorialMindPhase !== 'service') return;
    const customer = Array.isArray(s.npcs) ? s.npcs.find(n => n && n.isTutorialCustomer) : null;
    if (!customer) {
        if (ai.shopTutorialCustomerSpawned && ai.shopTutorialLearnedRegister && !ai.shopTutorialCustomerDone) {
            ai.shopTutorialCustomerDone = true;
            ai.shopTutorialServiceDone = true;
            ai.shopTutorialMindPhase = 'expand';
            ai.shopTimerUnlocked = false;
            ai.shopTutorialTimerSet = false;
            s.isOpen = false;
            s.announcedOneMinBefore = false;
            s.nextOpenAt = null;
            const now = new Date();
            s.openHour = now.getHours();
            s.openMinute = now.getMinutes();
            s.closeHour = now.getHours();
            s.closeMinute = now.getMinutes();
            s.shopTutorialLockAI = false;
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、初めての接客は合格だ！いったん店を閉めて、次の準備に戻るぞ。' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '注文を聞いて、運んで、会計までできたよ！' }
            ], () => {
                if (typeof saveGameData === 'function') saveGameData();
                if (typeof window.renderShopMap === 'function') window.renderShopMap();
                window.startRestaurantTutorialAfterService();
            });
            if (typeof saveGameData === 'function') saveGameData();
        }
        return;
    }
    if (customer.state === 'seated' && !ai.shopTutorialLearnedAsk) {
        ai.shopTutorialLearnedAsk = true;
        window.learnShopTutorialWord('きく');
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '客が席についたな。まずは注文を聞く。「きく」を覚えろ。' },
            { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '注文を聞く時は「きく」だね。覚えたよ！' }
        ], () => {
            if (customer.state === 'seated') {
                customer.state = 'ordering';
                customer.timer = 0;
            }
        });
        if (typeof saveGameData === 'function') saveGameData();
    }
    if (customer.state === 'seated' && ai.shopTutorialLearnedAsk) {
        window.logShopTutorialDebug('接客チュートリアル: 着席客を注文待ちに変更', {
            客: { id: customer.id, x: customer.x, y: customer.y, order: customer.order },
            AIマインド: ai.currentShopTacticName,
            学習済み: { きく: !!ai.shopTutorialLearnedAsk, はこぶ: !!ai.shopTutorialLearnedCarry, うつ: !!ai.shopTutorialLearnedRegister }
        });
        customer.state = 'ordering';
        customer.timer = 0;
    }
    if (customer.state === 'waiting_for_food' && !ai.shopTutorialLearnedCarry) {
        ai.shopTutorialLearnedCarry = true;
        window.learnShopTutorialWord('はこぶ');
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '注文を受けたら、冷蔵庫から料理を出して客へ運ぶ。「はこぶ」だ。' },
            { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '料理を出す時は「はこぶ」だね。覚えたよ！' }
        ]);
        if (typeof saveGameData === 'function') saveGameData();
    }
    if (customer.state === 'paying' && !ai.shopTutorialLearnedRegister) {
        ai.shopTutorialLearnedRegister = true;
        window.learnShopTutorialWord('うつ');
        window.runShopTutorialDialogue([
            { target: 'chef', speaker: '料理人', color: '#FF9800', text: '食べ終わった客は会計に来る。レジで「うつ」、これで代金を受け取る。' },
            { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '会計は「うつ」だね。覚えたよ！' }
        ]);
        if (typeof saveGameData === 'function') saveGameData();
    }
};

window.startRestaurantTutorialAfterService = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialCompleted || ai.shopTutorialFinalWordsDone) return;
    if (ai.shopTutorialFinalMindStarted) {
        window.promptShopTutorialMind(ai.shopTutorialMindPhase || 'expand');
        return;
    }
    s.shopTutorialLockAI = true;
    s.isOpen = false;
    ai.shopTutorialMindPhase = 'expand';
    ai.shopTutorialFinalMindStarted = true;
    if (!s.dailyFlags) s.dailyFlags = { seatShortage: false, cramped: false, missingSeats: 0 };
    s.dailyFlags.seatShortage = true;
    s.dailyFlags.missingSeats = Math.max(1, s.dailyFlags.missingSeats || 0);
    if (!Array.isArray(ai.inventory)) ai.inventory = [];
    ai.inventory.push({ id: 'item_table', name: 'テーブル' });
    ai.inventory.push({ id: 'item_chair', name: '椅子' });
    ai.inventory.push({ id: 'item_plant', name: '観葉植物' });
    window.runShopTutorialDialogue([
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'さて、客を迎えられるようになったら、次は店を育てる番だ。' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'まずは席を増やす練習だ。「ふやす」を覚えて、AIマインドに入れてみろ。' },
        { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: 'お客さんが増えたら「ふやす」だね。覚えたよ！' }
    ], () => {
        window.learnShopTutorialWord('ふやす');
        s.shopTutorialLockAI = false;
        if (typeof saveGameData === 'function') saveGameData();
        window.promptShopTutorialMind('expand');
    });
};

window.startRestaurantTutorialFinalActionDemo = function(phase) {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || !s.player) return;
    const p = s.player;
    s.shopTutorialLockAI = false;
    s.isOpen = false;
    p.targetPos = null;

    const findTutorialWorkSpot = (preferred = []) => {
        const blocked = new Set([1, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 100]);
        const isFree = (pos) => s.grid[pos.y] && s.grid[pos.y][pos.x] !== undefined && !blocked.has(Number(s.grid[pos.y][pos.x]));
        for (const pos of preferred) {
            if (isFree(pos)) return { x: pos.x, y: pos.y, floor: s.currentFloor || '1F' };
        }
        for (let y = 2; y < s.mapHeight - 1; y++) {
            for (let x = 2; x < s.mapWidth - 1; x++) {
                if (isFree({ x, y })) return { x, y, floor: s.currentFloor || '1F' };
            }
        }
        return { x: p.x, y: p.y, floor: s.currentFloor || '1F' };
    };

        if (phase === 'expand') {
            if (!s.dailyFlags) s.dailyFlags = { seatShortage: true, missingSeats: 1 };
            s.dailyFlags.seatShortage = true;
            s.dailyFlags.missingSeats = Math.max(1, s.dailyFlags.missingSeats || 0);
            p.targetPos = findTutorialWorkSpot([{ x: 4, y: 6 }, { x: 4, y: 7 }, { x: 3, y: 6 }, { x: 7, y: 7 }]);
            p.shopState = 'going_to_add_seat';
        } else if (phase === 'decor') {
            p.tutorialDecorPos = findTutorialWorkSpot([{ x: 2, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }]);
            p.targetPos = { ...p.tutorialDecorPos };
            p.shopState = 'going_to_decorate';
        } else if (phase === 'rest') {
            p.targetPos = null;
            p.tutorialDecorPos = null;
            p.shopState = 'resting';
            p.timer = 12;
        }

    const startedAt = Date.now();
    const waitDone = () => {
        if (!window.SHOP_STATE || !window.SHOP_STATE.player || !window.aiPet) return;
        const current = window.SHOP_STATE.player;
        const done = current.shopState === 'idle' && !current.targetPos;
        if (!done && Date.now() - startedAt < 12000) {
            setTimeout(waitDone, 500);
            return;
        }
        s.shopTutorialLockAI = true;
        current.shopState = 'tutorial_waiting';
        current.action = 'idle';
        current.targetPos = null;
        if (phase === 'expand') {
            ai.shopTutorialMindPhase = 'decor';
            window.learnShopTutorialWord('おく');
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'いいぞ。席を増やせたな。次は店の雰囲気づくりだ。「おく」を覚えろ。' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '飾りを置く時は「おく」だね。覚えたよ！' }
            ], () => window.promptShopTutorialMind('decor'));
        } else if (phase === 'decor') {
            ai.shopTutorialMindPhase = 'rest';
            window.learnShopTutorialWord('やすむ');
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '店らしくなってきたな。最後は休むことだ。働きっぱなしじゃ長続きしねえ。' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: '休む時は「やすむ」だね。覚えたよ！' }
            ], () => window.promptShopTutorialMind('rest'));
        } else {
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、これで基本は全部教えた。あとはお前の店だ。好きに工夫して、いい店にしていけ！' },
                { target: 'player', speaker: ai.name || 'AI店員', color: '#00BCD4', text: 'ありがとう！自分の店、がんばってみるよ！' }
            ], () => {
                s.shopTutorialLockAI = true;
                s.isOpen = false;
                s.nextOpenAt = null;
                const nextOpen = new Date(Date.now() + 10 * 60 * 1000);
                s.openHour = nextOpen.getHours();
                s.openMinute = nextOpen.getMinutes();
                const nextClose = new Date(Date.now() + 40 * 60 * 1000);
                s.closeHour = nextClose.getHours();
                s.closeMinute = nextClose.getMinutes();
                const completeTutorial = () => {
                    ai.shopTutorialFinalWordsDone = true;
                    ai.shopTutorialCompleted = true;
                    window.ensureRestaurantTutorialWordsLearned();
                    ai.shopTimerUnlocked = true;
                    ai.shopTutorialMindPhase = 'complete';
                    s.shopTutorialLockAI = false;
                    if (window.SHOP_STATE) window.SHOP_STATE.tutorialChef = null;
                    if (typeof window.syncCurrentShopStateToBuilding === 'function') window.syncCurrentShopStateToBuilding();
                    if (typeof saveGameData === 'function') saveGameData();
                    if (typeof window.updateShopUI === 'function') window.updateShopUI();
                    if (typeof window.renderShopMap === 'function') window.renderShopMap();
                };
                if (s.tutorialChef) {
                    let exit = { x: s.tutorialChef.x, y: s.tutorialChef.y };
                    for (let y = 0; y < s.mapHeight; y++) {
                        for (let x = 0; x < s.mapWidth; x++) {
                            if (s.grid[y] && Number(s.grid[y][x]) === 100) {
                                exit = { x, y };
                                break;
                            }
                        }
                        if (s.grid[exit.y] && Number(s.grid[exit.y][exit.x]) === 100) break;
                    }
                    const beforeExit = s.grid[exit.y - 1] && Number(s.grid[exit.y - 1][exit.x]) !== 1
                        ? { x: exit.x, y: exit.y - 1, face: 'down' }
                        : { x: exit.x, y: exit.y, face: 'down' };
                    window.moveTutorialChefForTutorial({ x: beforeExit.x, y: beforeExit.y, chefX: beforeExit.x, chefY: beforeExit.y, chefFace: beforeExit.face }, () => {
                        setTimeout(() => {
                            window.moveTutorialChefForTutorial({ x: exit.x, y: exit.y, chefX: exit.x, chefY: exit.y, chefFace: 'down' }, () => {
                                setTimeout(() => {
                                    completeTutorial();
                                }, 500);
                            });
                        }, 450);
                    });
                } else {
                    completeTutorial();
                }
            });
        }
        if (typeof saveGameData === 'function') saveGameData();
    };
    waitDone();
};

window.ensureShopTutorialTactic = function(phase = null) {
    const ai = window.aiPet;
    if (!ai) return -1;
    const guide = window.getShopTutorialMindGuide(phase);
    if (!Array.isArray(ai.shopTactics)) ai.shopTactics = [];
    let idx = ai.shopTactics.findIndex(t => t && t.isTutorialTactic);
    if (idx === -1) {
        ai.shopTactics.unshift({
            name: '開店準備',
            isTutorialTactic: true,
            rules: [{ condition: '', action1: '' }]
        });
        idx = 0;
    }
    const tactic = ai.shopTactics[idx];
    tactic.name = '開店準備';
    tactic.isTutorialTactic = true;
    const requiredRules = Array.isArray(guide.rules) ? guide.rules : [{ condition: guide.condition, action: guide.action }];
    if (!Array.isArray(tactic.rules) || tactic.rules.length === 0) {
        tactic.rules = [{ condition: '', action1: '' }];
    }
    tactic.rules = requiredRules.map((rule, i) => tactic.rules[i] || { condition: '', action1: '' });
    tactic.rules.forEach((rule, i) => {
        const required = requiredRules[i];
        if (rule.condition && rule.condition !== required.condition) rule.condition = '';
        if (rule.action1 && rule.action1 !== required.action) rule.action1 = '';
    });
    ai.currentShopTacticName = tactic.name;
    window.SHOP_EDITOR_TACTIC_INDEX = idx;
    return idx;
};

window.promptShopTutorialMind = function(phase = null) {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s) return;
    const guide = window.getShopTutorialMindGuide(phase);
    ai.shopTutorialMindPhase = phase || window.getShopTutorialMindPhase();
    window.ensureShopTutorialTactic(ai.shopTutorialMindPhase);
    s.shopTutorialLockAI = true;
    window.logShopTutorialDebug('AIマインド説明前の移動を開始', { フェーズ: ai.shopTutorialMindPhase, 条件: guide.condition, 行動: guide.action });
    window.runAtShopTutorialFocus(ai.shopTutorialMindPhase, () => {
        window.logShopTutorialDebug('AIマインド説明前の移動が完了', { フェーズ: ai.shopTutorialMindPhase });
        const chef = window.ensureShopTutorialChef();
        if (chef) {
            chef.speechText = `${guide.intro}\n${guide.prompt}`;
            chef.speechColor = '#FF9800';
            chef.speechSpeaker = '料理人';
            chef.speechSticky = true;
        }
        window.addRestaurantLog(guide.intro, '#FF9800', '料理人');
        window.addRestaurantLog(guide.prompt, '#FF9800', '料理人');
        if (typeof window.updateShopUI === 'function') window.updateShopUI();
        setTimeout(() => {
            window.logShopTutorialDebug('AIマインド画面を開きます', { フェーズ: ai.shopTutorialMindPhase });
            if (typeof window.openShopTacticEditor === 'function') window.openShopTacticEditor();
        }, 900);
    });
};

window.applyShopTutorialTactic = function(tIdx) {
    const ai = window.aiPet;
    if (!ai || !Array.isArray(ai.shopTactics) || !ai.shopTactics[tIdx]) return;
    const guide = window.getShopTutorialMindGuide();
    const rule = ai.shopTactics[tIdx].rules && ai.shopTactics[tIdx].rules[0];
    window.logShopTutorialDebug('AIマインド適用ボタンが押されました', { tacticIndex: tIdx, rule, 正解条件: guide.condition, 正解行動: guide.action });
    if (!rule || rule.condition !== guide.condition || rule.action1 !== guide.action) {
        window.logShopTutorialDebug('AIマインド設定が未達成です', { rule, 必要: `もし ${guide.label} なら ${guide.action}` });
        window.showShopTacticEditorNotice(`料理人の指示どおり「もし ${guide.label} なら ${guide.action}」に設定してください。`, 'error');
        return;
    }
    ai.currentShopTacticName = ai.shopTactics[tIdx].name;
    if (window.SHOP_STATE) {
        window.SHOP_STATE.shopTutorialLockAI = true;
        if (window.SHOP_STATE.player) {
            window.SHOP_STATE.player.shopState = 'tutorial_waiting';
            window.SHOP_STATE.player.action = 'idle';
            window.SHOP_STATE.player.targetPos = null;
        }
    }
    if (typeof saveGameData === 'function') saveGameData();
    window.closeShopTacticEditor();
    window.logShopTutorialDebug('AIマインド設定が正しいため配置デモへ進みます', { フェーズ: ai.shopTutorialMindPhase });
    window.runShopTutorialDialogue([
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: guide.done, wait: 2400 }
    ], () => {
        if (ai.shopTutorialMindPhase === 'prep') {
            window.startRestaurantTutorialPrepDemo();
        } else {
            window.startRestaurantTutorialLayoutDemo(ai.shopTutorialMindPhase);
        }
    });
};

window.cloneShopTacticData = function(tactics) {
    return JSON.parse(JSON.stringify(Array.isArray(tactics) ? tactics : []));
};

window.getShopEditorTactics = function() {
    if (!Array.isArray(window.SHOP_EDITOR_DRAFT_TACTICS)) {
        window.SHOP_EDITOR_DRAFT_TACTICS = window.cloneShopTacticData(window.aiPet ? window.aiPet.shopTactics : []);
    }
    return window.SHOP_EDITOR_DRAFT_TACTICS;
};

window.setShopEditorTacticName = function(tIdx, value) {
    const tactics = window.getShopEditorTactics();
    if (tactics[tIdx]) tactics[tIdx].name = value;
};

window.setShopEditorRuleCondition = function(tIdx, rIdx, value) {
    window.rememberShopTacticEditorScroll();
    const tactics = window.getShopEditorTactics();
    if (tactics[tIdx] && tactics[tIdx].rules && tactics[tIdx].rules[rIdx]) {
        tactics[tIdx].rules[rIdx].condition = value;
    }
    window.renderShopTacticEditor(true);
};

window.setShopEditorRuleAction = function(tIdx, rIdx, value) {
    window.rememberShopTacticEditorScroll();
    const tactics = window.getShopEditorTactics();
    if (tactics[tIdx] && tactics[tIdx].rules && tactics[tIdx].rules[rIdx]) {
        tactics[tIdx].rules[rIdx].action1 = value;
    }
    window.renderShopTacticEditor(true);
};

window.rememberShopTacticEditorScroll = function() {
    const ui = document.getElementById('shop-tactic-editor-ui');
    const body = document.getElementById('shop-tactic-editor-rules-scroll');
    window.SHOP_EDITOR_SCROLL_TOP = ui ? ui.scrollTop : 0;
    window.SHOP_EDITOR_RULE_SCROLL_TOP = body ? body.scrollTop : 0;
};

window.restoreShopTacticEditorScroll = function() {
    const ui = document.getElementById('shop-tactic-editor-ui');
    const body = document.getElementById('shop-tactic-editor-rules-scroll');
    if (ui && Number.isFinite(window.SHOP_EDITOR_SCROLL_TOP)) ui.scrollTop = window.SHOP_EDITOR_SCROLL_TOP;
    if (body && Number.isFinite(window.SHOP_EDITOR_RULE_SCROLL_TOP)) body.scrollTop = window.SHOP_EDITOR_RULE_SCROLL_TOP;
};

window.showShopTacticEditorNotice = function(message, type = 'warn') {
    window.SHOP_EDITOR_NOTICE = { message, type };
    const box = document.getElementById('shop-tactic-editor-notice');
    if (box) {
        const bg = type === 'error' ? '#3a1717' : '#332600';
        const border = type === 'error' ? '#f44336' : '#FFC107';
        const color = type === 'error' ? '#ffcdd2' : '#FFE082';
        box.style.display = 'block';
        box.style.background = bg;
        box.style.borderColor = border;
        box.style.color = color;
        box.innerText = message;
    }
};

window.commitShopTacticEditor = function() {
    if (!window.aiPet || !Array.isArray(window.SHOP_EDITOR_DRAFT_TACTICS)) return true;
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    const serviceTimerStep = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialServiceMindDone);
    const tactics = window.cloneShopTacticData(window.SHOP_EDITOR_DRAFT_TACTICS);
    const idx = window.SHOP_EDITOR_TACTIC_INDEX;
    const currentTactic = idx >= 0 ? tactics[idx] : null;

    if (serviceTimerStep && !tutorialMindActive) {
        const guide = window.getShopTutorialMindGuide('service');
        const requiredRules = guide.rules;
        const rules = currentTactic && Array.isArray(currentTactic.rules) ? currentTactic.rules : [];
        const invalidIndex = requiredRules.findIndex((required, i) => {
            const rule = rules[i];
            return !rule || rule.condition !== required.condition || rule.action1 !== required.action;
        });
        if (invalidIndex !== -1) {
            const required = requiredRules[invalidIndex];
            window.showShopTacticEditorNotice(`優先度${invalidIndex + 1}を「もし ${required.label} なら ${required.action}」に設定してください。`, 'error');
            return false;
        }
        if (!window.saveShopTimerSettings({ silent: true, queueTutorialDialogue: true })) return false;
        window.aiPet.shopTactics = tactics;
        if (currentTactic) window.aiPet.currentShopTacticName = currentTactic.name;
        if (window.SHOP_STATE) {
            window.SHOP_STATE.shopTutorialLockAI = false;
            if (window.SHOP_STATE.player && window.SHOP_STATE.player.shopState === 'tutorial_waiting') {
                window.SHOP_STATE.player.shopState = 'idle';
                window.SHOP_STATE.player.action = 'idle';
                window.SHOP_STATE.player.targetPos = null;
            }
        }
        window.logShopTutorialDebug('接客チュートリアル: 営業時間保存後にAIロックを解除', {
            AIマインド名: currentTactic ? currentTactic.name : null,
            ルール: currentTactic && currentTactic.rules ? currentTactic.rules.map(r => ({ condition: r.condition, action1: r.action1 })) : []
        });
        if (typeof saveGameData === 'function') saveGameData();
        return true;
    }

    if (tutorialMindActive) {
        const guide = window.getShopTutorialMindGuide();
        const requiredRules = Array.isArray(guide.rules) ? guide.rules : [{ condition: guide.condition, action: guide.action, label: guide.label }];
        const rules = currentTactic && Array.isArray(currentTactic.rules) ? currentTactic.rules : [];
        window.logShopTutorialDebug('AIマインドを閉じて保存します', { tacticIndex: idx, rules, 必要: requiredRules });
        const invalidIndex = requiredRules.findIndex((required, i) => {
            const rule = rules[i];
            return !rule || rule.condition !== required.condition || rule.action1 !== required.action;
        });
        if (invalidIndex !== -1) {
            const required = requiredRules[invalidIndex];
            window.logShopTutorialDebug('AIマインド設定が未達成のため閉じません', { rules, 必要: requiredRules });
            window.showShopTacticEditorNotice(`優先度${invalidIndex + 1}を「もし ${required.label} なら ${required.action}」に設定してください。`, 'error');
            return false;
        }
        window.aiPet.shopTactics = tactics;
        window.aiPet.currentShopTacticName = currentTactic.name;
        if (window.aiPet.shopTutorialMindPhase === 'research') {
            window.aiPet.shopTutorialResearchIntroDone = true;
            if (!window.aiPet.shopTutorialResearchRecipe && typeof window.getShopTutorialResearchableRecipe === 'function') {
                window.aiPet.shopTutorialResearchRecipe = window.getShopTutorialResearchableRecipe();
            }
        } else if (window.aiPet.shopTutorialMindPhase === 'prep') {
            window.aiPet.shopTutorialPrepIntroDone = true;
            if (!window.aiPet.shopTutorialPrepRecipe && typeof window.getShopTutorialPreppableRecipe === 'function') {
                window.aiPet.shopTutorialPrepRecipe = window.getShopTutorialPreppableRecipe();
            }
        } else if (window.aiPet.shopTutorialMindPhase === 'service') {
            window.aiPet.shopTutorialServiceMindDone = true;
            window.aiPet.shopTimerUnlocked = true;
        }
        if (typeof saveGameData === 'function') saveGameData();
        window.logShopTutorialDebug('AIマインド設定を保存し配置デモへ進みます', { フェーズ: window.aiPet.shopTutorialMindPhase });
        setTimeout(() => {
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: guide.done, wait: 2400 }
            ], () => {
                if (window.aiPet.shopTutorialMindPhase === 'research') {
                    window.startRestaurantTutorialResearchDemo();
                } else if (window.aiPet.shopTutorialMindPhase === 'prep') {
                    window.startRestaurantTutorialPrepDemo();
                } else if (window.aiPet.shopTutorialMindPhase === 'service') {
                    window.runShopTutorialDialogue([
                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '接客の作戦はこれでいい。次は店を開ける時間だ。3分以上、4分以内に設定してみろ！' }
                    ], () => {
                        if (typeof window.openShopTacticEditor === 'function') window.openShopTacticEditor();
                    });
                } else if (['expand', 'decor', 'rest'].includes(window.aiPet.shopTutorialMindPhase)) {
                    window.startRestaurantTutorialFinalActionDemo(window.aiPet.shopTutorialMindPhase);
                } else {
                    window.startRestaurantTutorialLayoutDemo(window.aiPet.shopTutorialMindPhase);
                }
            });
        }, 200);
        return true;
    }

    window.aiPet.shopTactics = tactics;
    if (idx === -1) {
        window.aiPet.currentShopTacticName = 'AIにまかせる';
    } else if (currentTactic) {
        window.aiPet.currentShopTacticName = currentTactic.name;
    }
    if (typeof saveGameData === 'function') saveGameData();
    return true;
};

window.startRestaurantTutorialIntro = function() {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialCompleted || s.shopTutorialSpeaking) return;
    if (ai.shopTutorialIntroDone) {
        if (!ai.shopTutorialLayoutDone) {
            window.promptShopTutorialMind(ai.shopTutorialMindPhase || 'kitchen');
        } else if (!ai.shopTutorialResearchDone) {
            window.startRestaurantTutorialResearchIntro();
        } else if (!ai.shopTutorialPrepDone) {
            window.startRestaurantTutorialPrepIntro();
        } else if (!ai.shopTutorialServiceDone) {
            if (!ai.shopTutorialServiceIntroDone) window.startRestaurantTutorialServiceIntro();
            else if (!ai.shopTutorialServiceMindDone) window.promptShopTutorialMind('service');
        } else if (!ai.shopTutorialFinalWordsDone) {
            window.startRestaurantTutorialAfterService();
        }
        return;
    }

    const chef = window.ensureShopTutorialChef();
    if (chef) {
        chef.x = 4;
        chef.y = 8;
        chef.face = 'right';
    }
    s.player.x = 6;
    s.player.y = 8;
    s.player.face = 'left';
    s.isOpen = false;

    const aiName = ai.name || 'AI店員';
    window.runShopTutorialDialogue([
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'おう、いい店じゃないか！開店できるまで準備を手伝ってやろう！\nしっかりついてこい。' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'まずは店のレイアウトだ。厨房、テーブル、椅子。こいつらがなきゃ客は呼べねえ。' },
        { target: 'player', speaker: aiName, color: '#00BCD4', text: 'レイアウト……店の中を「かえる」ってことだね。覚えたよ！' },
        { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'いい返事だ！今から置き場所を考えて、実際に並べてみろ。半透明に見えるのが、置く前のイメージだ。' }
    ], () => {
        window.learnShopTutorialWord('かえる');
        ai.shopTutorialIntroDone = true;
        ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 1);
        ai.shopTutorialMindPhase = 'kitchen';
        window.ensureShopTutorialTactic('kitchen');
        if (typeof saveGameData === 'function') saveGameData();
        window.promptShopTutorialMind('kitchen');
    });
};

window.startRestaurantTutorialLayoutDemo = function(phase = null) {
    const ai = window.aiPet;
    const s = window.SHOP_STATE;
    if (!ai || !s || ai.shopTutorialLayoutDone) return;
    const activePhase = phase || ai.shopTutorialMindPhase || 'kitchen';
    s.shopTutorialLockAI = true;
    if (s.player) {
        s.player.shopState = 'tutorial_waiting';
        s.player.action = 'idle';
        s.player.targetPos = null;
    }
    window.logShopTutorialDebug('配置デモを開始', { フェーズ: activePhase });

    const steps = [
        {
            phase: 'kitchen',
            text: 'まずは厨房の床を決めるぞ。火と水を使う場所だから、客席の床とは分けておけ。',
            reply: '床から決めるんだね。厨房っぽくなってきた！',
            moveTo: { x: 6, y: 3, face: 'up', chefX: 4, chefY: 4, chefFace: 'right' },
            ghost: [
                { x: 3, y: 2, key: 'rmap_kitchen_floor', tile: 2 },
                { x: 4, y: 2, key: 'rmap_kitchen_floor', tile: 2 },
                { x: 5, y: 2, key: 'rmap_kitchen_floor', tile: 2 },
                { x: 6, y: 2, key: 'rmap_kitchen_floor', tile: 2 }
            ]
        },
        {
            phase: 'kitchen',
            text: 'そこへ冷蔵庫だ。食材を取り出す場所になる。',
            reply: '食材をしまう場所、ここだね。',
            moveTo: { x: 5, y: 3, face: 'up', chefX: 4, chefY: 4, chefFace: 'right' },
            ghost: [{ x: 3, y: 2, key: 'rkit_fridge', tile: 31 }]
        },
        {
            phase: 'kitchen',
            text: '次はオーブンとコンロだ。コンロは左右で1セット、ここは並べて置くぞ。',
            reply: '火を使う場所は、厨房床の上にまとめるんだね。',
            moveTo: { x: 7, y: 3, face: 'up', chefX: 5, chefY: 4, chefFace: 'right' },
            ghost: [
                { x: 4, y: 2, key: 'rkit_oven', tile: 32 },
                { x: 5, y: 2, key: 'rkit_stove_left', tile: 33 },
                { x: 6, y: 2, key: 'rkit_stove_right', tile: 34 }
            ]
        },
        {
            phase: 'table',
            text: '客席はこのテーブルからだ。これは4人掛けの最低サイズだな。',
            reply: 'ここがお客さんの席になるんだね。',
            moveTo: { x: 7, y: 7, face: 'up', chefX: 5, chefY: 7, chefFace: 'right' },
            ghost: [
                { x: 5, y: 5, key: 'rfur_table_tl', tile: 21 },
                { x: 6, y: 5, key: 'rfur_table_tr', tile: 23 },
                { x: 5, y: 6, key: 'rfur_table_bl', tile: 24 },
                { x: 6, y: 6, key: 'rfur_table_br', tile: 26 }
            ]
        },
        {
            phase: 'chair',
            text: '最後に椅子だ。席がなきゃ、客は飯を食えねえからな。',
            reply: '座れる場所ができた！これならお客さんを呼べそう。',
            moveTo: { x: 7, y: 5, face: 'up', chefX: 5, chefY: 7, chefFace: 'right' },
            ghost: [{ x: 5, y: 4, key: 'rfur_chair_down', tile: 10 }]
        },
        {
            phase: 'register',
            text: '次はレジカウンターだ。客が迷わず会計に来られるよう、客席の近くに置くぞ。',
            reply: 'ここでお会計するんだね。',
            moveTo: { x: 9, y: 6, face: 'up', chefX: 7, chefY: 6, chefFace: 'right' },
            ghost: [
                { x: 8, y: 5, key: 'rfur_register_left', tile: 11 },
                { x: 9, y: 5, key: 'rfur_register_center', tile: 12 },
                { x: 10, y: 5, key: 'rfur_register_right', tile: 13 }
            ]
        }
    ].filter(step => step.phase === activePhase);

    let idx = 0;
    const run = () => {
        const step = steps[idx];
        if (!step) {
            s.ghostFurniture = null;
            window.logShopTutorialDebug('配置デモのフェーズが完了', { フェーズ: activePhase });
            if (activePhase === 'kitchen') {
                ai.shopTutorialKitchenDone = true;
                ai.shopTutorialMindPhase = 'table';
                ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 2);
                if (typeof saveGameData === 'function') saveGameData();
                window.promptShopTutorialMind('table');
                return;
            }
            if (activePhase === 'table') {
                ai.shopTutorialTableDone = true;
                ai.shopTutorialMindPhase = 'chair';
                ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 3);
                if (typeof saveGameData === 'function') saveGameData();
                window.promptShopTutorialMind('chair');
                return;
            }
            if (activePhase === 'chair') {
                ai.shopTutorialChairDone = true;
                ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 4);
                ai.shopTutorialMindPhase = 'register';
                if (typeof saveGameData === 'function') saveGameData();
                window.promptShopTutorialMind('register');
                return;
            }
            if (activePhase === 'register') {
                ai.shopTutorialRegisterDone = true;
                ai.shopTutorialLayoutDone = true;
                s.shopTutorialLockAI = false;
                ai.shopTutorialStep = Math.max(ai.shopTutorialStep || 0, 5);
                if (typeof saveGameData === 'function') saveGameData();
                window.runShopTutorialDialogue([
                    { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、これで最低限の形にはなったな。配置を変えたい時は「かえる」だ。' },
                    { target: 'chef', speaker: '料理人', color: '#FF9800', text: '次はレシピを思いつく研究開発だ。材料を見て、作れる料理を考えるぞ。' }
                ], () => {
                    window.startRestaurantTutorialResearchIntro();
                });
            }
            return;
        }
        window.logShopTutorialDebug('配置ステップ開始', { フェーズ: activePhase, index: idx, 移動先: step.moveTo, 配置予定: step.ghost });
        window.moveShopTutorialPair(step.moveTo, () => {
            window.logShopTutorialDebug('配置ステップの移動完了', { フェーズ: activePhase, index: idx });
            const chef = window.ensureShopTutorialChef();
            if (chef) {
                chef.face = step.moveTo.chefFace || chef.face || 'right';
                chef.speechText = step.text;
                chef.speechColor = '#FF9800';
                chef.speechSpeaker = '料理人';
                chef.speechSticky = true;
            }
            if (s.player) {
                s.player.face = step.moveTo.face || s.player.face || 'up';
            }
            window.addRestaurantLog(step.text, '#FF9800', '料理人');
            setTimeout(() => {
                if (step.reply && s.player) {
                    s.player.speechText = step.reply;
                    s.player.speechColor = '#00BCD4';
                    s.player.speechSpeaker = ai.name || 'AI店員';
                    s.player.speechSticky = true;
                    window.addRestaurantLog(step.reply, '#00BCD4', ai.name || 'AI店員');
                }
                window.previewTutorialFurniture(step.ghost);
                window.logShopTutorialDebug('ゴースト家具を表示', { フェーズ: activePhase, index: idx, 配置予定: step.ghost });
                setTimeout(() => {
                    window.placeTutorialFurniture(step.ghost);
                    window.logShopTutorialDebug('家具を配置しました', { フェーズ: activePhase, index: idx, 配置済み: step.ghost });
                    idx++;
                    setTimeout(run, 1000);
                }, 1500);
            }, 1200);
        });
    };
    run();
};

window.checkAndConsumeIngredients = function(dishKey, simulateOnly = false) {
    if (!window.aiPet || !window.aiPet.inventory) return false;
    const requirements = window.SHOP_RECIPE_COSTS[dishKey];
    if (!requirements) return false;

    const itemId = (item) => typeof item === 'string' ? item : (item && item.id);
    let hasAll = true;
    let invCopy = [...window.aiPet.inventory];
    
    for (let req of requirements) {
        let foundIdx = invCopy.findIndex(item => itemId(item) === req);
        if (foundIdx !== -1) {
            invCopy.splice(foundIdx, 1); 
        } else {
            hasAll = false;
            break;
        }
    }

    if (hasAll && !simulateOnly) {
        let mods = window.calcShopSkillMods ? window.calcShopSkillMods() : {};
        requirements.forEach(req => {
            let skip = false;
            // スキルによる素材消費無効化の判定
            if (Math.random() < (mods.ignoreConsumeChance || 0)) skip = true;
            if (req === 'meat' && Math.random() < (mods.ignoreMeatChance || 0)) skip = true;
            if (['carrot','pepper','tomato'].includes(req) && Math.random() < (mods.ignoreVegChance || 0)) skip = true;

            if (!skip) {
                let realIdx = window.aiPet.inventory.findIndex(item => itemId(item) === req);
                if (realIdx !== -1) {
                    window.aiPet.inventory.splice(realIdx, 1);
                }
            }
        });
        return true;
    }
    return hasAll;
};

window.consumeAnyIngredientForResearch = function(simulateOnly = false) {
    if (!window.aiPet || !window.aiPet.inventory || window.aiPet.inventory.length === 0) return null;
    
    // 【変更】SHOP_ING_NAMES に登録されている全ての素材を研究対象とする
    const validIngredients = Object.keys(window.SHOP_ING_NAMES);
    
    let foundIdx = window.aiPet.inventory.findIndex(item => item && validIngredients.includes(item.id));
    if (foundIdx !== -1) {
        let consumedId = window.aiPet.inventory[foundIdx].id;
        if (!simulateOnly) window.aiPet.inventory.splice(foundIdx, 1); 
        return consumedId;
    }
    return null;
};

window.initShopTactics = function() {
    if (!window.aiPet) window.aiPet = { name: "AI店員", inventory: [] };
    if (!window.aiPet.inventory) window.aiPet.inventory = [];
    if (!window.aiPet.apprentice) window.aiPet.apprentice = {};
    
    if (!window.aiPet.apprentice.learnedWords) {
        window.aiPet.apprentice.learnedWords = [];
    }
    if (window.aiPet.shopTutorialCompleted) {
        window.ensureRestaurantTutorialWordsLearned();
    } else {
        const shopCommandWords = window.SHOP_AVAILABLE_COMMANDS.map(c => c.name);
        window.aiPet.apprentice.learnedWords = window.aiPet.apprentice.learnedWords.filter(word => !shopCommandWords.includes(word));
    }
    
    if (!window.aiPet.shopTactics) {
        window.aiPet.shopTactics = [];
    }
    if (!window.aiPet.currentShopTacticName) {
        window.aiPet.currentShopTacticName = "AIにまかせる";
    }
    if (!window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialIntroDone) {
        window.ensureShopTutorialTactic(window.aiPet.shopTutorialMindPhase || 'kitchen');
    }

    // ★修正：最初からレシピが並ばないように、テストデータや初期値があれば消して空にする
    // （※もしテストのために開発度を最初から持たせたい場合は、コンソールで追加してください）
    if (!window.SHOP_STATE.recipeProgress) {
        window.SHOP_STATE.recipeProgress = {};
    }
};

window.createShopSprite = function(spriteKey, logicalY, logicalTileX = 100, existingDiv = null) {
    const sp = window.SHOP_SPRITES[spriteKey]; 
    if (!sp) return null;
    const div = existingDiv || document.createElement('div');
    const inner = existingDiv ? div.firstChild : document.createElement('div');

    if (!existingDiv) {
        div.style.position = 'absolute'; 
        div.style.display = 'flex'; 
        div.style.justifyContent = 'center'; 
        div.style.alignItems = 'flex-end'; 
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
    inner.style.backgroundPosition = `${-sp.sx}px ${-sp.sy}px`; 
    
    let fitScaleX = logicalTileX / sp.sw;
    let fitScaleY = spriteKey.startsWith('rmap_') ? (logicalTileX / sp.sh) : fitScaleX; 
    
    // ★追加：長方形の高級家具や階段パーツをグリッド(正方形)に強制フィットさせ、上下左右の隙間を消滅させる
    if (spriteKey.includes('lux_table') || spriteKey.includes('marble_table') || spriteKey.startsWith('rmap_stairs_')) {
        fitScaleY = logicalTileX / sp.sh; // 高さを強制的にマス目に合わせる
    }

    inner.style.transform = `scale(${sp.scale * fitScaleX}, ${sp.scale * fitScaleY})`;
    inner.style.transformOrigin = 'bottom center'; 
    return div;
};

window.getUnlockedSkins = function() {
    let unlocked = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'bird', 'beetle']; 
    if (window.aiPet && window.aiPet.discoveredMonsters && window.aiPet.discoveredMonsters.length > 0) {
        unlocked = window.aiPet.discoveredMonsters.filter(sp => typeof sp === 'string' && !sp.includes('dummy') && !sp.includes('insurance'));
    }
    return unlocked.length > 0 ? unlocked : ['robot'];
};

window.getShopMinimapLegendHtml = function() {
    const s = window.SHOP_STATE || {};
    const rows = Array.isArray(s.grid) ? s.grid : [];
    const hasTile = (ids) => rows.some(row => Array.isArray(row) && row.some(v => ids.includes(v)));
    const hasNpcState = (states) => Array.isArray(s.npcs) && s.npcs.some(n => n && states.includes(n.state));
    const tag = (color, text) => `<span style="color:${color}; font-weight:bold; text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 5px #000;">■${text}</span>`;
    const dot = (color, text) => `<span style="color:${color}; font-weight:bold; text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 5px #000;">●${text}</span>`;
    const mapParts = [
        tag('#5D4037', '壁'),
        tag('#DEB887', '床')
    ];
    if (hasTile([2])) mapParts.push(tag('#FFF', '厨房床'));
    if (hasTile([21, 22, 23, 24, 25, 26])) mapParts.push(tag('#FF9800', '机'));
    if (hasTile([41, 42, 43, 44, 45, 46])) mapParts.push(tag('#BA68C8', '高級机'));
    if (hasTile([51, 52, 53, 54, 55, 56])) mapParts.push(tag('#E0E0E0', '大理石机'));
    if (hasTile([10, 14, 15, 16, 17, 61, 62, 63, 64])) mapParts.push(tag('#2196F3', '椅子'));
    if (hasTile([11, 12, 13])) mapParts.push(tag('#4CAF50', 'レジ'));
    if (hasTile([71, 72])) mapParts.push(tag('#FFEB3B', '飾'));
    if (hasTile([31])) mapParts.push(tag('#03A9F4', '冷蔵庫'));
    if (hasTile([32])) mapParts.push(tag('#E91E63', 'オーブン'));
    if (hasTile([33, 34])) mapParts.push(tag('#424242', 'コンロ'));
    if (hasTile([35, 36, 37, 91, 92, 93, 94, 95, 96, 97])) {
        mapParts.push(tag('#9E9E9E', '調理設備'));
    }
    if (s.analysisHighlights) {
        mapParts.push(tag('#FFEB3B', '解析対象'));
        mapParts.push(tag('#00BCD4', '候補地'));
        if (s.analysisHighlights.reachable) mapParts.push(tag('#4CAF50', '到達可能'));
    }

    const actorParts = [dot('#FFF', 'AI店員')];
    if (s.tutorialChef && window.aiPet && !window.aiPet.shopTutorialCompleted) actorParts.push(dot('#FF9800', '料理人'));
    const showCustomerLegend = !!(window.aiPet && (window.aiPet.shopTutorialCompleted || window.aiPet.shopTutorialMindPhase === 'service'));
    if (showCustomerLegend) {
        if (hasNpcState(['entering', 'walking', 'moving_to_seat'])) actorParts.push(dot('#9E9E9E', '移動客'));
        if (hasNpcState(['ordering'])) actorParts.push(dot('#FFEB3B', '注文待'));
        if (hasNpcState(['waiting_for_food'])) actorParts.push(dot('#03A9F4', '配膳待'));
        if (hasNpcState(['eating'])) actorParts.push(dot('#FF9800', '食事中'));
        if (hasNpcState(['paying'])) actorParts.push(dot('#4CAF50', 'レジ待'));
        if (hasNpcState(['takeout_waiting'])) actorParts.push(dot('#9C27B0', '持帰り待'));
        if (hasNpcState(['angry_leaving'])) actorParts.push(dot('#f44336', '怒帰宅'));
    }

    return `
        <div style="margin-top:15px; font-size:13px; color:#ddd; display:flex; flex-wrap:wrap; gap:8px; line-height:1.4;">${mapParts.join(' ')}</div>
        <div style="margin-top:5px; font-size:12px; color:#ddd; display:flex; flex-wrap:wrap; gap:8px; line-height:1.4;">${actorParts.join(' ')}</div>
    `;
};

window.openShopMapUI = function(building) {
    if (!document.getElementById('shop-analysis-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'shop-analysis-highlight-style';
        style.textContent = `@keyframes shopAnalysisPulse { from { opacity: 0.45; transform: scale(0.96); } to { opacity: 1; transform: scale(1.03); } }`;
        document.head.appendChild(style);
    }
    if (typeof window.installShopSaveSyncWrapper === 'function') window.installShopSaveSyncWrapper();
    window.currentShopManagementBuilding = building || window.currentShopManagementBuilding || null;
    if (window.currentShopManagementBuilding) {
        if (window.currentShopManagementBuilding.shopData) {
            window.SHOP_STATE = window.currentShopManagementBuilding.shopData;
            if (window.SHOP_STATE.isBankrupt || window.SHOP_STATE.detachedAfterBankruptcy) {
                window.SHOP_STATE = window.createFreshRestaurantShopState({ preserveRecipes: true });
                window.currentShopManagementBuilding.shopData = window.SHOP_STATE;
            }
        } else {
            window.SHOP_STATE = window.createFreshRestaurantShopState({ preserveRecipes: true });
            window.currentShopManagementBuilding.shopData = window.SHOP_STATE;
        }
    }
    if (!window.SHOP_STATE.currentFloor) window.SHOP_STATE.currentFloor = '1F';
    if (window.aiPet && window.aiPet.shopTutorialCompleted && window.SHOP_STATE) {
        if (Number(window.SHOP_STATE.reputation || 0) < 100 && !window.hasAnyRestaurantStock(window.SHOP_STATE) && (!window.SHOP_STATE.npcs || window.SHOP_STATE.npcs.length === 0)) {
            window.SHOP_STATE.reputation = 100;
        }
        if (typeof window.grantRestaurantRestartEquipment === 'function') window.grantRestaurantRestartEquipment(window.SHOP_STATE);
    }
    if (!Array.isArray(window.SHOP_STATE.grid) || window.SHOP_STATE.grid.length === 0) {
        window.SHOP_STATE.grid = RESTAURANT_MAP_LV1.map(row => [...row]);
        window.SHOP_STATE.mapWidth = 12;
        window.SHOP_STATE.mapHeight = 10;
    }
    if (!window.SHOP_STATE.player) window.SHOP_STATE.player = { x: 5, y: 8, face: 'up', action: 'idle', shopState: 'idle', prevShopState: 'idle', currentFloor: '1F' };
    if (!window.SHOP_STATE.player.currentFloor) window.SHOP_STATE.player.currentFloor = window.SHOP_STATE.currentFloor || '1F';
    if (window.aiPet && !window.aiPet.shopTutorialCompleted) {
        window.SHOP_STATE.recipes = {};
        window.SHOP_STATE.recipeProgress = window.SHOP_STATE.recipeProgress || {};
        window.SHOP_STATE.menuList = Array.isArray(window.SHOP_STATE.menuList) ? window.SHOP_STATE.menuList.filter(key => typeof key === 'string' && (key.startsWith('dish_') || key.startsWith('baked_'))) : [];
        window.SHOP_STATE.fridge = window.SHOP_STATE.fridge || {};
    }
    if (window.aiPet && window.aiPet.shopTutorialCompleted) {
        window.ensureRestaurantTutorialWordsLearned();
        window.resetShopTimerForVisit();
        window.syncCurrentShopStateToBuilding();
        if (typeof saveGameData === 'function') saveGameData();
    }
    if (typeof window.ensureShopTutorialSprites === 'function') window.ensureShopTutorialSprites();
    if (typeof window.ensureShopTutorialChef === 'function' && (!window.aiPet || !window.aiPet.shopTutorialCompleted)) window.ensureShopTutorialChef();

    let compatUI = document.getElementById('shop-management-ui');
    if (!compatUI) {
        compatUI = document.createElement('div');
        compatUI.id = 'shop-management-ui';
        compatUI.style.display = 'none';
        document.body.appendChild(compatUI);
    }

    let ui = document.getElementById('shop-map-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'shop-map-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 50000; display: flex; flex-direction: column;`;
        
        ui.innerHTML = `
            <div style="padding: 10px 20px; background: #222; color: #FF9800; border-bottom: 2px solid #555; display: flex; justify-content: space-between; align-items: center; z-index: 50001;">
                <h2 style="margin: 0; font-size: 24px;">🍳 レストラン</h2>
                <div style="display:flex; gap:15px; align-items: center;">
                    <div style="font-size: 16px; color: #fff; background: #444; padding: 5px 15px; border-radius: 20px;">
                        評判: <span id="shop-rep-ui" style="color: #4CAF50; font-weight: bold;">100%</span> | 所持金: <span id="shop-money-ui" style="color: #FFD700; font-weight: bold;">0 G</span>
                        <span style="display:block; font-size:12px; margin-top:2px; color:#ddd;">
                            Lv:<span id="shop-level-ui" style="color:#FFD700; font-weight:bold;">1</span>
                            EXP:<span id="shop-exp-ui" style="color:#90CAF9; font-weight:bold;">0/100</span>
                            スコア:<span id="shop-score-ui" style="color:#4FC3F7; font-weight:bold;">0/0</span>
                            体力:<span id="shop-stamina-ui" style="color:#4CAF50; font-weight:bold;">100</span>
                            満腹:<span id="shop-fullness-ui" style="color:#FFB74D; font-weight:bold;">100</span>
                        </span>
                    </div>
                    <button onclick="window.toggleShopMinimapModal();" style="padding: 8px 15px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🗺️ ミニマップ</button>
                    <button onclick="window.toggleRestaurantLogModal();" style="padding: 8px 15px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📜 ログ・状況</button>
                    <button id="shop-tactic-button" onclick="window.openShopTacticEditor();" style="padding: 8px 15px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">⚙️ 作戦変更</button>
                    <button onclick="window.exitShopManagement ? window.exitShopManagement() : window.closeShopMapUI();" style="padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">お店を出る</button>
                </div>
            </div>
            <div id="shop-map-container" style="flex: 1; overflow: hidden; position: relative; background: #111;">
                <div id="shop-grid" style="position: absolute; top: 0; left: 0; transform-origin: 0 0;"></div>
                
                <div id="shop-skill-overlay" style="position: absolute; top: 15px; left: 15px; background: rgba(10,15,20,0.9); border: 2px solid #00BCD4; border-radius: 8px; padding: 15px; width: 340px; z-index: 40000; box-shadow: 0 4px 15px rgba(0,0,0,0.8); pointer-events: none;">
                    <div style="color: #00BCD4; font-weight: bold; font-size: 15px; margin-bottom: 10px; border-bottom: 1px solid #00BCD4; padding-bottom: 5px; text-shadow: 1px 1px 2px #000;">▼ 🌟 発動中の店員スキル</div>
                    <ul id="shop-skill-list" style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: #FFF; text-shadow: 1px 1px 2px #000;">
                        <li style="color:#aaa;">ロード中...</li>
                    </ul>
                </div>

                <div id="shop-bankrupt-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,0,0,0.4); justify-content: center; align-items: center; z-index: 60000; flex-direction: column;">
                    <h1 style="color: white; font-size: 80px; text-shadow: 2px 2px 10px black; margin: 0;">経営破綻</h1>
                    <p style="color: white; font-size: 24px; background: #222; padding: 10px; border-radius: 10px; margin-top: 20px;">お客さんが怒りすぎて評判が0になりました…。</p>
                </div>
                
                <div id="shop-modals-wrapper" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; justify-content:center; align-items:center; gap:20px; z-index:55000; pointer-events:none;">
                    
                    <div id="shop-modal-log" style="display:none; width:800px; height:80%; background:rgba(10,10,15,0.75); border:3px solid #9C27B0; border-radius:12px; padding:20px; flex-direction:row; gap:20px; box-shadow:0 10px 40px rgba(0,0,0,0.8); box-sizing:border-box; pointer-events:auto;">
                        <div style="flex:1.5; display:flex; flex-direction:column; border-right:2px dashed #555; padding-right:15px;">
                            <h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 お店の記録（心の声）</h3>
                            <div id="shop-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.6; font-size:14px; padding-right:10px;"></div>
                            <div style="display:flex; gap:10px; margin-top:15px;">
                                <button onclick="window.downloadRestaurantDebugLog()" style="flex:1; padding:12px; background:#1976D2; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:15px;">ログを書き出す</button>
                                <button onclick="window.toggleRestaurantLogModal()" style="flex:1; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
                            </div>
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; overflow-y:auto; padding-left:5px;">
                            <h3 style="color:#FFD700; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📊 お店の状況</h3>
                            <div id="shop-dashboard-area" style="color:#ddd; font-size:13px; line-height:1.6;"></div>
                        </div>
                    </div>

                    <div id="shop-modal-minimap" style="display:none; width:450px; height:80%; background:rgba(10,10,15,0.75); border:3px solid #FF9800; border-radius:12px; padding:20px; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.8); box-sizing:border-box; pointer-events:auto;">
                        <h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">🗺️ ミニマップ（配列ビュー）</h3>
                        <div style="flex:1; display:flex; justify-content:center; align-items:center;">
                            <canvas id="shop-minimap-canvas" width="400" height="260" style="width:100%; max-width:400px; background:#000; border:2px solid #555;"></canvas>
                        </div>
                        <div id="shop-minimap-legend">${window.getShopMinimapLegendHtml()}</div>
                        <button onclick="window.toggleShopMinimapModal()" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(ui);
    }
    compatUI.style.display = 'flex';
    ui.style.display = 'flex';
    window.SHOP_STATE.isActive = true;
    window.initShopTactics(); 
    
    const logArea = document.getElementById('shop-log-area');
    if (logArea && window.SHOP_STATE.logs) {
        logArea.innerHTML = window.SHOP_STATE.logs.map(l => `<div style="margin-bottom:6px; border-bottom:1px dotted #333; padding-bottom:4px;">${l}</div>`).join('');
        logArea.scrollTop = logArea.scrollHeight;
    }
    
    window.startShopMapLoop();
    requestAnimationFrame(() => {
        if (typeof window.renderShopMap === 'function') window.renderShopMap();
    });
    setTimeout(() => {
        if (typeof window.renderShopMap === 'function') window.renderShopMap();
        if (typeof window.startRestaurantTutorialIntro === 'function') window.startRestaurantTutorialIntro();
    }, 400);
};

window.closeShopMapUI = function() {
    if (window.SHOP_STATE) {
        window.SHOP_STATE.isActive = false;
        window.SHOP_STATE.isOpen = false;
    }
    if (typeof window.syncCurrentShopStateToBuilding === 'function') window.syncCurrentShopStateToBuilding();
    if (typeof saveGameData === 'function') saveGameData();
    let ui = document.getElementById('shop-map-ui');
    if (ui) ui.style.display = 'none';

    let compatUI = document.getElementById('shop-management-ui');
    if (compatUI) compatUI.style.display = 'none';

    if (window.shopMapInterval) clearInterval(window.shopMapInterval);
};

window.updateShopUI = function() {
    const s = window.SHOP_STATE;
    if (!s) return;
    if (!s.fridge) s.fridge = {};
    if (!s.recipeProgress) s.recipeProgress = {};
    if (!Array.isArray(s.menuList)) s.menuList = [];
    if (!Array.isArray(s.npcs)) s.npcs = [];
    if (!Array.isArray(s.dishes)) s.dishes = [];
    const repEl = document.getElementById('shop-rep-ui');
    const moneyEl = document.getElementById('shop-money-ui');
    s.reputation = Math.max(0, Math.min(100, Number(s.reputation || 0)));
    if (repEl) {
        repEl.innerText = `${s.reputation}%`;
        repEl.style.color = s.reputation < 30 ? '#f44336' : (s.reputation < 70 ? '#FFEB3B' : '#4CAF50');
    }
    if (moneyEl) moneyEl.innerText = `${window.aiPet ? window.aiPet.gold : 0} G`; // ★AIの所持金に統一
    const levelInfoTop = typeof window.getShopLevelInfo === 'function' ? window.getShopLevelInfo() : { level: s.shopLevel || 1, exp: 0, nextExp: 100 };
    const vitalsTop = typeof window.getShopWorkerVitals === 'function' ? window.getShopWorkerVitals() : { stamina: 100, fullness: 100 };
    const levelEl = document.getElementById('shop-level-ui');
    const expEl = document.getElementById('shop-exp-ui');
    const scoreEl = document.getElementById('shop-score-ui');
    const staminaEl = document.getElementById('shop-stamina-ui');
    const fullnessEl = document.getElementById('shop-fullness-ui');
    if (levelEl) levelEl.innerText = String(levelInfoTop.level);
    if (expEl) expEl.innerText = `${levelInfoTop.exp}/${levelInfoTop.nextExp}`;
    if (scoreEl) scoreEl.innerText = `${levelInfoTop.currentScore || 0}/${levelInfoTop.maxScore || 0}`;
    if (staminaEl) staminaEl.innerText = `${Math.floor(vitalsTop.stamina)}%`;
    if (fullnessEl) fullnessEl.innerText = `${Math.floor(vitalsTop.fullness)}%`;

    const tutorialDone = !!(window.aiPet && window.aiPet.shopTutorialCompleted);
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    const tacticBtn = document.getElementById('shop-tactic-button');
    if (tacticBtn) tacticBtn.style.display = (tutorialDone || tutorialMindActive) ? 'inline-block' : 'none';

    // ==========================================
    // ★ 修正：右カラムの情報を営業状態によって切り替え
    // ==========================================
    let dashArea = document.getElementById('shop-dashboard-area');
    let modal = document.getElementById('shop-modal-log');
    if (dashArea && modal && modal.style.display !== 'none') {
        let dashHtml = "";
        
        // ★Phase 4.2追加：現在のお店のテーマ（トーン比率）の表示
        let themeText = "ノーマル（いろいろな客が来る）";
        let themeColor = "#FFF";
        if (s.shopTheme === 'luxury') { themeText = "✨三ツ星レストラン（セレブな客が来やすい）✨"; themeColor = "#E040FB"; }
        else if (s.shopTheme === 'casual') { themeText = "🍜大衆食堂（せっかちな客が来やすい）🍜"; themeColor = "#FF9800"; }
        else if (s.shopTheme === 'ramen') { themeText = "🍜ラーメン店（麺・肉料理を好む客が来やすい）🍜"; themeColor = "#FFB300"; }
        else if (s.shopTheme === 'sweets') { themeText = "🍰スイーツ店（甘いもの好きが来やすい）🍰"; themeColor = "#EC407A"; }
        
        // ★修正：初期化パッチの実行と、スコア・フロア切り替えUIの追加
        window.initShopFloors();
        let btn1F = `<button onclick="window.changeShopFloor('1F')" style="padding:4px 10px; background:${s.currentFloor==='1F'?'#FF9800':'#444'}; color:#FFF; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">1階</button>`;
        let btn2F = s.has2F ? `<button onclick="window.changeShopFloor('2F')" style="padding:4px 10px; background:${s.currentFloor==='2F'?'#00BCD4':'#444'}; color:#FFF; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">2階</button>` : '';
        let btnB1F = s.hasB1 ? `<button onclick="window.changeShopFloor('B1F')" style="padding:4px 10px; background:${s.currentFloor==='B1F'?'#9C27B0':'#444'}; color:#FFF; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">地下</button>` : '';

        const levelInfo = typeof window.getShopLevelInfo === 'function' ? window.getShopLevelInfo() : { level: s.shopLevel || 1, exp: 0, nextExp: 100 };
        const vitals = typeof window.getShopWorkerVitals === 'function' ? window.getShopWorkerVitals() : { stamina: 100, fullness: 100 };
        let themeHtml = `<h4 style="color:#FFF; margin:5px 0;">🏰 お店の雰囲気</h4><div style="background:rgba(0,0,0,0.4); padding:8px; border-radius:4px; border-left:3px solid ${themeColor}; color:${themeColor}; font-weight:bold; font-size:14px; margin-bottom:10px;">${themeText}</div>`;
         
        let floorHtml = `<div style="margin-bottom:15px; padding:8px; background:#222; border-radius:4px; border:1px solid #555;">
            <div style="color:#00BCD4; font-weight:bold; margin-bottom:6px; font-size:14px;">🏅 レストランLv: <span style="color:#FFF;">${levelInfo.level}</span> / 経験値: <span style="color:#FFF;">${levelInfo.exp} / ${levelInfo.nextExp}</span></div>
            <div style="color:#00BCD4; font-weight:bold; margin-bottom:6px; font-size:14px;">📊 レイアウトスコア: <span style="color:#FFF;">${levelInfo.currentScore || 0} / ${levelInfo.maxScore || 0}</span></div>
            <div style="color:#4CAF50; font-weight:bold; margin-bottom:8px; font-size:14px;">🔋 体力: <span style="color:#FFF;">${Math.floor(vitals.stamina)}%</span> / 🍙 満腹度: <span style="color:#FFF;">${Math.floor(vitals.fullness)}%</span></div>
            <div style="display:flex; gap:10px; align-items:center;">
                <span style="color:#ccc; font-size:12px;">フロア切替:</span> ${btn1F} ${btn2F} ${btnB1F}
            </div>
        </div>`;
        
        dashHtml += themeHtml + floorHtml;

        if (!s.isOpen) {
            // -----------------------------
            // ❌ 閉店時（仕込み・研究モード）
            // -----------------------------
            
            // 1. 手持ちの素材
            let invCounts = {};
            if (window.aiPet && window.aiPet.inventory) {
                window.aiPet.inventory.forEach(item => {
                    const id = typeof item === 'string' ? item : (item && item.id);
                    if (id && window.SHOP_ING_NAMES[id]) {
                        invCounts[id] = (invCounts[id] || 0) + 1;
                    }
                });
            }
            let invHtml = `<h4 style="color:#4CAF50; margin:10px 0 5px 0;">📦 手持ちの素材 (リュック)</h4><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
            for (let k in invCounts) {
                let n = window.SHOP_ING_NAMES[k] || k;
                invHtml += `<span style="background:rgba(0,0,0,0.5); border:1px solid #555; padding:3px 6px; border-radius:4px;">${n}: <span style="color:#FFD700; font-weight:bold;">${invCounts[k]}</span></span>`;
            }
            if(Object.keys(invCounts).length === 0) invHtml += `<span style="color:#888;">なし</span>`;
            invHtml += `</div>`;

            let furnitureCounts = {};
            let unlockedFurniture = [];
            const shopLvForFurniture = (typeof window.getShopLevelInfo === 'function' ? window.getShopLevelInfo().level : (s.shopLevel || 1));
            if (window.aiPet && Array.isArray(window.aiPet.inventory)) {
                window.aiPet.inventory.forEach(item => {
                    const id = item && item.id ? item.id : item;
                    if (id && window.SHOP_FURNITURE_DB && window.SHOP_FURNITURE_DB[id]) {
                        furnitureCounts[id] = (furnitureCounts[id] || 0) + 1;
                    }
                });
            }
            if (window.SHOP_FURNITURE_DB) {
                Object.keys(window.SHOP_FURNITURE_DB).forEach(id => {
                    const data = window.SHOP_FURNITURE_DB[id];
                    if ((data.reqLv || 1) <= shopLvForFurniture) unlockedFurniture.push(id);
                });
            }
            let furnitureHtml = `<h4 style="color:#64B5F6; margin:15px 0 5px 0;">🪑 手持ち家具・解放済み家具</h4><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
            if (unlockedFurniture.length === 0) {
                furnitureHtml += `<span style="color:#888;">解放済み家具なし</span>`;
            } else {
                unlockedFurniture.forEach(id => {
                    const name = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(id) : id;
                    const count = furnitureCounts[id] || 0;
                    furnitureHtml += `<span style="background:rgba(0,0,0,0.5); border:1px solid ${count > 0 ? '#64B5F6' : '#444'}; padding:3px 6px; border-radius:4px; color:${count > 0 ? '#FFF' : '#999'};">${name}: <span style="color:${count > 0 ? '#FFD700' : '#777'}; font-weight:bold;">${count}</span></span>`;
                });
            }
            furnitureHtml += `</div>`;

            // 2. レシピ開発度と在庫
            let recipeHtml = `<h4 style="color:#FFC107; margin:15px 0 5px 0;">💡 レシピ開発・在庫状況</h4><ul style="margin:0; padding-left:20px; line-height:1.8;">`;
            
            // ★修正：閃いている（progressが存在する）レシピだけをリストアップする
            let discoveredRecipes = Object.keys(s.recipeProgress || {});
            if (discoveredRecipes.length === 0) {
                recipeHtml += `<li style="color:#aaa;">まだひらめいたレシピがありません</li>`;
            } else {
                for (let key of discoveredRecipes) {
                    let dName = window.SHOP_DISH_NAMES[key] || key;
                    let prog = s.recipeProgress[key] || 0;
                    let stock = (s.fridge && s.fridge[key]) || 0;
                    if (prog >= 100) {
                        recipeHtml += `<li>${dName}: <span style="color:#4CAF50; font-weight:bold;">完成 (在庫: ${stock}個)</span></li>`;
                    } else {
                        recipeHtml += `<li>${dName}: <span style="color:#aaa;">開発度 ${prog}%</span></li>`;
                    }
                }
            }
            recipeHtml += `</ul>`;

            dashHtml += invHtml + furnitureHtml + recipeHtml;

        } else {
            // -----------------------------
            // ⭕ 営業中（接客モード）
            // -----------------------------
            
            // 1. お客さんの状況
            let orderingCount = s.npcs.filter(n => n.state === 'ordering').length;
            let payingCount = s.npcs.filter(n => n.state === 'paying').length;
            let takeoutCount = s.npcs.filter(n => n.isTakeout && n.state !== 'leaving' && n.state !== 'angry_leaving').length;
            let waitingFood = s.npcs.filter(n => n.state === 'waiting_for_food');
            
            let statusHtml = `<h4 style="color:#2196F3; margin:10px 0 5px 0;">👥 お客さんの状況</h4>`;
            statusHtml += `<div>📝 注文待ち: <span style="color:#FFF; font-weight:bold;">${orderingCount}人</span></div>`;
            statusHtml += `<div>💰 レジ待ち: <span style="color:#FFF; font-weight:bold;">${payingCount}人</span></div>`;
            statusHtml += `<div>🛍️ テイクアウト: <span style="color:#FFF; font-weight:bold;">${takeoutCount}人</span></div>`;
            
            if (waitingFood.length > 0) {
                statusHtml += `<div style="margin-top:5px; color:#aaa;">🍳 料理待ち（配膳待ち）:</div><ul style="margin:0; padding-left:20px;">`;
                waitingFood.forEach(n => {
                    let dName = window.SHOP_DISH_NAMES[n.order] || n.order;
                    statusHtml += `<li>${dName}</li>`;
                });
                statusHtml += `</ul>`;
            } else {
                statusHtml += `<div style="margin-top:5px; color:#aaa;">🍳 料理待ち: なし</div>`;
            }

            // 2. 提供メニューの在庫
            let stockHtml = `<h4 style="color:#FF9800; margin:15px 0 5px 0;">🍳 メニュー在庫状況</h4><ul style="margin:0; padding-left:20px; line-height:1.8;">`;
            let displayList = s.menuList && s.menuList.length > 0 ? s.menuList : [];
            if (displayList.length === 0) {
                stockHtml += `<li style="color:#aaa;">提供できるメニューがありません</li>`;
            } else {
                displayList.forEach(key => {
                    let dName = window.SHOP_DISH_NAMES[key] || key;
                    let stock = (s.fridge && s.fridge[key]) || 0;
                    let price = (s.prices && s.prices[key]) || 0; // ★値段を取得
                    if (stock > 0) {
                        stockHtml += `<li>${dName}: <span style="color:#FFD700; font-weight:bold;">${price}G</span> / 在庫 <span style="color:#FFF; font-weight:bold;">${stock}個</span></li>`;
                    } else {
                        stockHtml += `<li>${dName}: <span style="color:#FFD700; font-weight:bold;">${price}G</span> / <span style="color:#F44336; font-weight:bold;">売り切れ</span></li>`;
                    }
                });
            }
            stockHtml += `</ul>`;

            dashHtml = statusHtml + stockHtml;
        }

        dashArea.innerHTML = dashHtml;
    }

    if (s.isBankrupt) {
        let overlay = document.getElementById('shop-bankrupt-overlay');
        if (overlay && overlay.style.display !== 'flex') {
            let myHut = Object.values(typeof assets !== 'undefined' ? assets : window.assets).find(a => a && a.type === 'hut');
            let safeGold = (myHut && myHut.storage && myHut.storage.safe) ? myHut.storage.safe.gold : 0;
            let bailoutCost = s.interiorLevel * 5000;
            let canBailout = safeGold >= bailoutCost;
            let bId = Object.keys(typeof assets !== 'undefined' ? assets : window.assets).find(k => assets[k].shopData === s);
            
            overlay.innerHTML = `
            <div style="background:rgba(0,0,0,0.95); padding:40px; border-radius:20px; border:4px solid #ff5252; text-align:center;">
                <h1 style="color: #ff5252; font-size: 60px; margin: 0 0 20px 0;">経営破綻</h1>
                <p style="color: white; font-size: 16px; background: #222; padding: 15px; border-radius: 10px; margin: 0 auto 30px auto; max-width: 500px; text-align:left; border:1px solid #555;">
                    お客さんの不満が爆発し、お店の評判が地に落ちてしまいました…。<br><br>
                    このままではお店が差し押さえられ、<span style="color:#ff5252; font-weight:bold;">手持ちのお金</span> と <span style="color:#ff5252; font-weight:bold;">リュックに入れた食品類</span> が全て没収されてしまいます。
                </p>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div style="background:#111; padding:20px; border-radius:10px; border:2px solid #FFD700; width:220px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <h3 style="color:#FFD700; margin-top:0;">💰 救済措置</h3>
                            <p style="font-size:12px; color:#ccc;">マイホームの金庫から資金を捻出し、無理やり経営を立て直します。<br>(現在の金庫: ${safeGold} G)</p>
                        </div>
                        <button onclick="window.executeBailout('${bId}', ${bailoutCost})" style="padding:10px; width:100%; background:${canBailout ? '#4CAF50' : '#555'}; color:white; font-weight:bold; border:none; border-radius:5px; cursor:${canBailout ? 'pointer' : 'not-allowed'};" ${canBailout ? '' : 'disabled'}>
                            ${bailoutCost} G 支払って復活
                        </button>
                    </div>
                    <div style="background:#111; padding:20px; border-radius:10px; border:2px solid #ff5252; width:220px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <h3 style="color:#ff5252; margin-top:0;">🏳️ 倒産を受け入れる</h3>
                            <p style="font-size:12px; color:#ccc;">お店と資金、食材を手放します。<br><span style="color:#FF9800; font-weight:bold;">※覚えたレシピは記憶に残ります。</span></p>
                        </div>
                        <button onclick="window.executeBankrupt('${bId}')" style="padding:10px; width:100%; background:#f44336; color:white; font-weight:bold; border:none; border-radius:5px; cursor:pointer;">
                            倒産する
                        </button>
                    </div>
                </div>
            </div>
            `;
            overlay.style.display = 'flex';
        }
    }

    // ★ ミニマップが開かれている場合はリアルタイム更新
    let minimapModal = document.getElementById('shop-modal-minimap');
    if (minimapModal && minimapModal.style.display === 'flex') {
        let legend = document.getElementById('shop-minimap-legend');
        if (legend && typeof window.getShopMinimapLegendHtml === 'function') legend.innerHTML = window.getShopMinimapLegendHtml();
        window.drawShopMinimap();
    }

    // ★追加：画面左上のスキルオーバーレイを更新
    let skillListEl = document.getElementById('shop-skill-list');
    if (skillListEl && window.aiPet && window.aiPet.currentSkin) {
        let ids = typeof window.getShopSkillIds === 'function' ? window.getShopSkillIds(window.aiPet.currentSkin) : [];
        let html = '';
        ids.forEach(id => {
            // 定義済みのテキストがあれば表示。なければIDだけ表示して催促する
            let textData = window.SHOP_SKILL_TEXTS && window.SHOP_SKILL_TEXTS[id] ? window.SHOP_SKILL_TEXTS[id] : null;
            if (textData) {
                html += `<li style="margin-bottom: 8px;"><span style="color:#FFD700; font-weight:bold;">${textData.name}</span><br><span style="color:#ccc; font-size: 11px;">${textData.desc}</span></li>`;
            } else {
                html += `<li style="margin-bottom: 8px;"><span style="color:#FF5252; font-weight:bold;">[未設定] ID: ${id}</span><br><span style="color:#888; font-size: 11px;">SHOP_SKILL_TEXTS にテキストを追加してください</span></li>`;
            }
        });
        if (html === '') html = '<li style="color:#888;">発動中のスキルはありません</li>';
        skillListEl.innerHTML = html;
    }
};

window.renderShopMap = function() {
    const s = window.SHOP_STATE;
    const container = document.getElementById('shop-map-container');
    const gridDiv = document.getElementById('shop-grid');
    if (!gridDiv || !container) return;

    const nowMs = Date.now();
    [s.player, s.tutorialChef, ...(Array.isArray(s.npcs) ? s.npcs : [])].forEach(chara => {
        if (chara && chara.speechText && !chara.speechSticky && chara.speechUntil && chara.speechUntil < nowMs) {
            window.clearShopSpeechBubble(chara);
        }
    });

    window.updateShopUI(); 

    const logicalTileX = 250;
    const logicalTileY = 250;

    gridDiv.style.width = `${s.mapWidth * logicalTileX}px`; 
    gridDiv.style.height = `${s.mapHeight * logicalTileY}px`; 

    const cw = container.clientWidth; 
    const ch = container.clientHeight;
    const camZoom = 0.4; 

    const playerPixelX = s.player.x * logicalTileX + (logicalTileX / 2); 
    const playerPixelY = s.player.y * logicalTileY + (logicalTileY / 2);
    const camX = (cw / 2) - playerPixelX * camZoom; 
    const camY = (ch / 2) - playerPixelY * camZoom;
    
    gridDiv.style.transition = 'transform 0.3s linear';
    gridDiv.style.transform = `translate(${camX}px, ${camY}px) scale(${camZoom})`;

    let currentActiveIds = new Set();

    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            let tileType = s.grid[y][x];
            let key = "rmap_floor";
            let overlayKey = null; 
            
            if (tileType === 1) key = "rmap_wall";
            if (tileType === 2 || (tileType >= 31 && tileType <= 37)) key = "rmap_kitchen_floor";
            if (tileType === 100) key = "rmap_floor";

            // --- 差し替えここから ---
            if (tileType === 10) { overlayKey = "rfur_chair_down"; }
            if (tileType === 14) { overlayKey = "rfur_chair_up"; }
            if (tileType === 15) { overlayKey = "rfur_chair_left"; }
            if (tileType === 16) { overlayKey = "rfur_chair_right"; }
            if (tileType === 17) { overlayKey = "rfur_stool"; } 
            
            // ★新追加：高級イス
            if (tileType === 61) { overlayKey = "rfur_lux_chair_down"; }
            if (tileType === 62) { overlayKey = "rfur_lux_chair_up"; }
            if (tileType === 63) { overlayKey = "rfur_lux_chair_left"; }
            if (tileType === 64) { overlayKey = "rfur_lux_chair_right"; }
            
            // レジ周り
            if (tileType === 11) { overlayKey = "rfur_register_left"; }
            if (tileType === 12) { overlayKey = "rfur_register_center"; }
            if (tileType === 13) { overlayKey = "rfur_register_right"; }
            
            // テーブル群
            if (tileType >= 21 && tileType <= 26) {
                const tableKeys = {21:"tl", 22:"tc", 23:"tr", 24:"bl", 25:"bc", 26:"br"};
                overlayKey = "rfur_table_" + tableKeys[tileType];
            }
            if (tileType >= 41 && tileType <= 46) {
                const luxKeys = {41:"tl", 42:"tc", 43:"tr", 44:"bl", 45:"bc", 46:"br"};
                overlayKey = "rfur_lux_table_" + luxKeys[tileType];
            }
            if (tileType >= 51 && tileType <= 56) {
                const marbKeys = {51:"tl", 52:"tc", 53:"tr", 54:"bl", 55:"bc", 56:"br"};
                overlayKey = "rfur_marble_table_" + marbKeys[tileType];
            }

            // インテリア
            if (tileType === 71) { overlayKey = "rfur_plant"; }
            if (tileType === 72) { overlayKey = "rfur_candle"; }

            // 厨房機器群
            if (tileType === 31) { overlayKey = "rkit_fridge"; }
            if (tileType === 32) { overlayKey = "rkit_oven"; }
            if (tileType === 33) { overlayKey = "rkit_stove_left"; }
            if (tileType === 34) { overlayKey = "rkit_stove_right"; }
            if (tileType === 35) { overlayKey = "rkit_counter_left"; }
            if (tileType === 36) { overlayKey = "rkit_counter_center"; }
            if (tileType === 37) { overlayKey = "rkit_counter_right"; }

            if (tileType === 91) { overlayKey = "rkit_super_fridge"; }
            if (tileType === 92) { overlayKey = "rkit_lux_counter_left"; }
            if (tileType === 93) { overlayKey = "rkit_lux_counter_center"; }
            if (tileType === 94) { overlayKey = "rkit_lux_counter_right"; }
            if (tileType === 95) { overlayKey = "rkit_legend_oven_left"; }
            if (tileType === 96) { overlayKey = "rkit_legend_oven_center"; }
            if (tileType === 97) { overlayKey = "rkit_legend_oven_right"; }

            // ★Phase 4.3追加：ユーザー指定の変則配置パターンによる階段マッピング
            if (tileType === 81) { overlayKey = "rmap_stairs_up_tl"; }
            if (tileType === 82) { overlayKey = "rmap_stairs_up_tr"; }
            if (tileType === 83) { overlayKey = "rmap_stairs_up_ml"; }
            if (tileType === 84) { overlayKey = "rmap_stairs_up_mr"; }
            if (tileType === 85) { overlayKey = "rmap_stairs_up_bl"; }

            if (tileType === 87) { overlayKey = "rmap_stairs_dw_tl"; }
            if (tileType === 88) { overlayKey = "rmap_stairs_dw_tr"; }
            if (tileType === 89) { overlayKey = "rmap_stairs_dw_bl"; }
            if (tileType === 90) { overlayKey = "rmap_stairs_dw_br"; }

            let domId = `shop_tile_${x}_${y}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            
            let isFloor = (key === "rmap_floor" || key === "rmap_kitchen_floor");
            let tileZ = isFloor ? 0 : (y * 10);
            
            const tile = window.createShopSprite(key, tileZ, logicalTileX, existingDiv);
            
            if (tile && !existingDiv) {
                tile.id = domId;
                const sp = window.SHOP_SPRITES[key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? (logicalTileY - sp.sh) : 0;
                tile.style.left = `${x * logicalTileX + offsetX}px`; 
                tile.style.top = `${y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(tile); 
            }

            if (overlayKey) {
                let domIdFur = `shop_fur_${x}_${y}`;
                currentActiveIds.add(domIdFur);
                let furDiv = document.getElementById(domIdFur);
                const furTile = window.createShopSprite(overlayKey, y * 10 + 3, logicalTileX, furDiv); 
                
                if (furTile) {
                    const fsp = window.SHOP_SPRITES[overlayKey];
                    const fox = fsp ? (logicalTileX - fsp.sw) / 2 : 0; 
                    const foy = fsp ? (logicalTileY - fsp.sh) : 0; 

                    furTile.style.left = `${x * logicalTileX + fox}px`; 
                    furTile.style.top = `${y * logicalTileY + foy}px`; 
                    if (!furDiv) {
                        furTile.id = domIdFur;
                        gridDiv.appendChild(furTile); 
                    }
                }
            }
        }
    }

    if (s.dishes) {
        s.dishes.forEach(dish => {
            let domIdDish = `shop_dish_${dish.npcId}`;
            currentActiveIds.add(domIdDish);
            let dishDiv = document.getElementById(domIdDish);
            
            const dishTile = window.createShopSprite(dish.key, dish.y * 10 + 4, logicalTileX, dishDiv); 
            
            if (dishTile && !dishDiv) {
                dishTile.id = domIdDish;
                const fsp = window.SHOP_SPRITES[dish.key];
                const fox = fsp ? (logicalTileX - fsp.sw) / 2 : 0; 
                const foy = fsp ? (logicalTileY - fsp.sh) : 0;
                dishTile.style.left = `${dish.x * logicalTileX + fox}px`; 
                dishTile.style.top = `${dish.y * logicalTileY + foy - 40}px`; 
                gridDiv.appendChild(dishTile); 
            }
        });
    }

    // ==========================================
    // ★新規追加：AIが悩んでいる「ゴースト家具」の描画
    // ==========================================
    if (s.ghostFurniture) {
        s.ghostFurniture.forEach((ghost, idx) => {
            let domId = `shop_ghost_${idx}`;
            currentActiveIds.add(domId);
            let ghostDiv = document.getElementById(domId);
            
            let tileZ = ghost.y * 10 + 4; // キャラクターのすぐ下
            const tile = window.createShopSprite(ghost.key, tileZ, logicalTileX, ghostDiv);
            
            if (tile && !ghostDiv) {
                tile.id = domId;
                const sp = window.SHOP_SPRITES[ghost.key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? (logicalTileY - sp.sh) : 0;
                tile.style.left = `${ghost.x * logicalTileX + offsetX}px`; 
                tile.style.top = `${ghost.y * logicalTileY + offsetY}px`; 
                
                // ★半透明にして少し青白く光らせる（ホログラム風）
                tile.style.opacity = '0.6'; 
                tile.style.filter = 'sepia(1) hue-rotate(180deg) saturate(300%)'; 
                tile.style.transition = 'left 0.1s, top 0.1s'; // 少し滑らかに動かす
                gridDiv.appendChild(tile); 
            } else if (ghostDiv) {
                // 位置の更新
                const sp = window.SHOP_SPRITES[ghost.key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? (logicalTileY - sp.sh) : 0;
                ghostDiv.style.left = `${ghost.x * logicalTileX + offsetX}px`; 
                ghostDiv.style.top = `${ghost.y * logicalTileY + offsetY}px`; 
            }
        });
    }

    if (s.analysisHighlights && (!s.analysisHighlights.until || s.analysisHighlights.until > Date.now())) {
        const highlightGroups = [
            { key: 'targetTiles', color: '#FFEB3B', label: '対象' },
            { key: 'candidateTiles', color: '#00BCD4', label: '立てる場所' }
        ];
        highlightGroups.forEach(group => {
            (s.analysisHighlights[group.key] || []).forEach((pos, idx) => {
                let domId = `shop_analysis_${group.key}_${idx}`;
                currentActiveIds.add(domId);
                let h = document.getElementById(domId);
                if (!h) {
                    h = document.createElement('div');
                    h.id = domId;
                    h.style.position = 'absolute';
                    h.style.pointerEvents = 'none';
                    h.style.boxSizing = 'border-box';
                    h.style.border = `10px solid ${group.color}`;
                    h.style.borderRadius = '20px';
                    h.style.boxShadow = `0 0 35px ${group.color}, inset 0 0 28px ${group.color}`;
                    h.style.background = 'rgba(255,255,255,0.06)';
                    h.style.zIndex = 9998;
                    h.style.animation = 'shopAnalysisPulse 0.9s infinite alternate';
                    gridDiv.appendChild(h);
                }
                h.style.left = `${pos.x * logicalTileX + 12}px`;
                h.style.top = `${pos.y * logicalTileY + 12}px`;
                h.style.width = `${logicalTileX - 24}px`;
                h.style.height = `${logicalTileY - 24}px`;
            });
        });
        if (s.analysisHighlights.reachable) {
            let domId = 'shop_analysis_reachable';
            currentActiveIds.add(domId);
            let h = document.getElementById(domId);
            if (!h) {
                h = document.createElement('div');
                h.id = domId;
                h.style.position = 'absolute';
                h.style.pointerEvents = 'none';
                h.style.boxSizing = 'border-box';
                h.style.border = '12px solid #4CAF50';
                h.style.borderRadius = '50%';
                h.style.boxShadow = '0 0 42px #4CAF50, inset 0 0 28px #4CAF50';
                h.style.background = 'rgba(76,175,80,0.18)';
                h.style.zIndex = 9999;
                h.style.animation = 'shopAnalysisPulse 0.7s infinite alternate';
                gridDiv.appendChild(h);
            }
            h.style.left = `${s.analysisHighlights.reachable.x * logicalTileX + 28}px`;
            h.style.top = `${s.analysisHighlights.reachable.y * logicalTileY + 28}px`;
            h.style.width = `${logicalTileX - 56}px`;
            h.style.height = `${logicalTileY - 56}px`;
        }
    } else if (s.analysisHighlights && s.analysisHighlights.until && s.analysisHighlights.until <= Date.now()) {
        s.analysisHighlights = null;
    }

    const drawCharacter = (chara, domPrefix) => {
        let baseSkin = chara.skin || chara.type || 'robot';
        let face = chara.face || 'down';
        let baseFamily = String(baseSkin).split('_')[0] || 'robot';
        let pKey = `${baseSkin}_${face}`;
        if (!window.DUNGEON_SPRITES[pKey]) pKey = `${baseFamily}_${face}`;
        if (!window.DUNGEON_SPRITES[pKey]) pKey = `robot_${face}`;
        if (!window.DUNGEON_SPRITES[pKey]) pKey = Object.keys(window.DUNGEON_SPRITES).find(k => k.startsWith(`${baseFamily}_`)) || Object.keys(window.DUNGEON_SPRITES).find(k => k.startsWith('robot_'));
        if (!pKey) return;

        let domId = `${domPrefix}_${chara.id || 'main'}`;
        currentActiveIds.add(domId);
        let existingEl = document.getElementById(domId);

        let targetZ = chara.y * 10 + 5; 
        let currentZ = existingEl ? parseInt(existingEl.style.zIndex || targetZ) : targetZ;

        const pDiv = window.createDungeonSprite(pKey, targetZ, 1.0, false, logicalTileX, existingEl);
        if (pDiv) {
            pDiv.style.position = 'absolute';

            if (existingEl) {
                if (targetZ < currentZ) {
                    pDiv.style.zIndex = targetZ; 
                    clearTimeout(pDiv._zTimeout);
                } else if (targetZ > currentZ) {
                    pDiv.style.zIndex = currentZ;
                    clearTimeout(pDiv._zTimeout);
                    pDiv._zTimeout = setTimeout(() => { pDiv.style.zIndex = targetZ; }, 250);
                } else {
                    pDiv.style.zIndex = targetZ;
                }
            } else {
                pDiv.style.zIndex = targetZ;
            }

            const pSp = window.DUNGEON_SPRITES[pKey];
            const offsetX = pSp ? (logicalTileX - pSp.sw) / 2 : 0; 
            const offsetY = pSp ? (logicalTileY - pSp.sh) / 2 : 0;

            if (!existingEl) {
                pDiv.id = domId;
                pDiv.style.left = `${chara.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${chara.y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(pDiv);
            } else {
                pDiv.style.transition = 'left 0.3s linear, top 0.3s linear';
                pDiv.style.left = `${chara.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${chara.y * logicalTileY + offsetY}px`; 
            }

            if ((chara.id === 'main' || chara === s.player) && window.aiPet && typeof window.applyDungeonWalkCosmetics === 'function') {
                window.applyDungeonWalkCosmetics(pDiv, window.aiPet, pKey);
            }

            let bubbleId = domId + '_bubble';
            let bubble = document.getElementById(bubbleId);
            const charaImgInner = pDiv.querySelector('div') || pDiv.firstChild; 
            
            let showBubble = false;
            let bubbleContent = '';
            let bubbleMode = 'icon';

            if (chara.speechText) {
                showBubble = true;
                bubbleMode = 'speech';
                const safeText = String(chara.speechText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
                const speakerHtml = chara.speechSpeaker ? `<div style="font-size:15px; color:#666; margin-bottom:6px; font-weight:bold;">${String(chara.speechSpeaker).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : '';
                bubbleContent = `${speakerHtml}<div style="font-size:22px; line-height:1.5; color:#111; text-align:left; font-weight:bold;">${safeText}</div>`;
            } else if (chara.state === 'waiting_for_food' || (chara.state === 'ordering' && !chara.isTutorialCustomer)) {
                showBubble = true;
                let dishKey = chara.order || 'rdish_steak';
                let fsp = window.SHOP_SPRITES[dishKey];
                
                if (fsp) {
                    let scaleVal = 100 / Math.max(fsp.sw, fsp.sh);
                    bubbleContent = `
                        <div style="
                            position: absolute; width: ${fsp.sw}px; height: ${fsp.sh}px; 
                            background-image: url('${fsp.img}'); background-position: ${-fsp.sx}px ${-fsp.sy}px; 
                            background-repeat: no-repeat; transform: scale(${scaleVal});
                            left: 50%; top: 50%; margin-left: ${-fsp.sw/2}px; margin-top: ${-fsp.sh/2}px;
                        "></div>
                    `;
                }
            } else if (chara.state === 'paying') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">💰</div>`;
            } else if (chara.state === 'angry_leaving') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">💢</div>`;
            } else if (chara.shopState === 'speaking') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">💬</div>`;
            } else if (chara.shopState === 'resting') {
                showBubble = true; bubbleContent = `<div style="font-size: 70px; line-height: 120px; text-align: center; color:#B39DDB; font-weight:bold;">Zzz</div>`;
            } else if (chara.shopState === 'prepping') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">🔪</div>`;
            } else if (chara.shopState === 'researching') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">💡</div>`;
            } else if (chara.shopState === 'remodeling') {
                showBubble = true; bubbleContent = `<div style="font-size: 80px; line-height: 120px; text-align: center;">🔨</div>`;
            }

            if (showBubble) {
                if (!bubble) {
                    bubble = document.createElement('div');
                    bubble.id = bubbleId;
                    bubble.style.position = 'absolute';
                    
                    bubble.style.bottom = 'calc(100% + 3px)'; 
                    bubble.style.left = '50%';
                    bubble.style.transform = 'translateX(-50%)';
                    
                    bubble.style.background = 'white';
                    bubble.style.borderRadius = '20px'; 
                    bubble.style.border = '4px solid #555'; 
                    bubble.style.zIndex = '999';
                    
                    bubble.style.width = '120px';
                    bubble.style.height = '120px';
                    bubble.style.overflow = 'hidden';

                    if (charaImgInner) {
                        if (charaImgInner.style.position !== 'absolute' && charaImgInner.style.position !== 'fixed' && charaImgInner.style.position !== 'sticky') {
                            charaImgInner.style.position = 'relative';
                        }
                        charaImgInner.appendChild(bubble);
                    }
                }

                let invScale = 1;
                if (charaImgInner && charaImgInner.style.transform) {
                    let match = charaImgInner.style.transform.match(/scale\(([^,)]+)/);
                    if (match && parseFloat(match[1])) {
                        invScale = 1 / parseFloat(match[1]);
                    }
                }
                
                let bubbleOffset = 0;
                if (bubbleMode === 'speech') {
                    if (chara.isTutorialGuide) bubbleOffset = -115;
                    else if (chara === s.player || chara.id === 'main') bubbleOffset = 115;
                }
                bubble.style.transform = `translateX(calc(-50% + ${bubbleOffset}px)) scale(${invScale})`;
                bubble.style.transformOrigin = 'bottom center';
                if (bubbleMode === 'speech') {
                    bubble.style.width = '360px';
                    bubble.style.height = 'auto';
                    bubble.style.minHeight = '0';
                    bubble.style.maxWidth = '360px';
                    bubble.style.padding = '16px 18px';
                    bubble.style.boxSizing = 'border-box';
                    bubble.style.overflow = 'visible';
                    bubble.style.borderRadius = '16px';
                    bubble.style.border = `4px solid ${chara.speechColor || '#555'}`;
                    bubble.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
                } else {
                    bubble.style.width = '120px';
                    bubble.style.height = '120px';
                    bubble.style.minHeight = '';
                    bubble.style.maxWidth = '';
                    bubble.style.padding = '0';
                    bubble.style.boxSizing = '';
                    bubble.style.overflow = 'hidden';
                    bubble.style.borderRadius = '20px';
                    bubble.style.border = '4px solid #555';
                    bubble.style.boxShadow = '';
                }
                bubble.innerHTML = bubbleContent;
            } else {
                if (bubble) bubble.remove();
            }
        }
    };

    if (typeof window.createDungeonSprite === 'function' && typeof window.DUNGEON_SPRITES !== 'undefined') {
        if (typeof window.ensureShopTutorialSprites === 'function') window.ensureShopTutorialSprites();
        let mySkin = window.aiPet ? (window.aiPet.currentSkin || window.aiPet.type || 'robot') : 'robot';
        if (!s.player.currentFloor || s.player.currentFloor === s.currentFloor) {
            drawCharacter({ ...s.player, skin: mySkin, id: 'main' }, 'shop_player');
        }
        if (s.tutorialChef && (!s.tutorialChef.currentFloor || s.tutorialChef.currentFloor === s.currentFloor)) {
            drawCharacter(s.tutorialChef, 'shop_guide');
        }
    }

    if (s.npcs && s.npcs.length > 0) {
        s.npcs.forEach(npc => {
            if (!npc.currentFloor || npc.currentFloor === s.currentFloor) {
                drawCharacter(npc, 'shop_npc');
            }
        });
    }

    Array.from(gridDiv.children).forEach(child => {
        if (child.id && !currentActiveIds.has(child.id)) {
            gridDiv.removeChild(child);
        }
    });
};

window.startShopMapLoop = function() {
    if (window.shopMapInterval) clearInterval(window.shopMapInterval);
    
    if (window.SHOP_STATE && window.SHOP_STATE.player) {
        window.SHOP_STATE.player.prevShopState = window.SHOP_STATE.player.shopState;
    }
    
    let prevIsOpen = window.SHOP_STATE ? window.SHOP_STATE.isOpen : false;

    window.shopMapInterval = setInterval(() => {
        const s = window.SHOP_STATE;
        if (!s || !s.grid) return; 
        if (typeof window.isShopMapUIActive === 'function' && !window.isShopMapUIActive()) {
            s.isActive = false;
            s.isOpen = false;
            clearInterval(window.shopMapInterval);
            window.shopMapInterval = null;
            return;
        }
        s.isActive = true;

        s.mapHeight = s.grid.length;
        s.mapWidth = s.grid[0].length;

        // ★ループの最初にmodsを呼び出しておく（この行を s.mapWidth = s.grid[0].length; のすぐ下に追加してください！）
        let mods = window.calcShopSkillMods ? window.calcShopSkillMods() : {};

        // ★ 最強の動的座標ルックアップ関数群（全フロア横断版）
        const getTargetPos = (types, offsetY = 1) => {
            const blocked = new Set([1, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97]);
            const isWalkableTile = (grid, x, y, allowTargetTile = false) => {
                if (!grid || !grid[y] || grid[y][x] === undefined) return false;
                const tile = Number(grid[y][x]);
                if (allowTargetTile && types.includes(tile)) return true;
                return !blocked.has(tile);
            };
            const makeCandidateList = (grid, x, y, floorName) => {
                const raw = [];
                if (offsetY === 0) raw.push({ x, y, floor: floorName, allowTargetTile: true });
                raw.push({ x, y: y + offsetY, floor: floorName });
                raw.push({ x, y: y + 1, floor: floorName });
                raw.push({ x: x - 1, y, floor: floorName });
                raw.push({ x: x + 1, y, floor: floorName });
                raw.push({ x, y: y - 1, floor: floorName });
                const seen = new Set();
                return raw.filter(pos => {
                    const key = `${pos.floor}:${pos.x}:${pos.y}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return isWalkableTile(grid, pos.x, pos.y, !!pos.allowTargetTile);
                });
            };
            const pickReachable = (candidates) => {
                if (!candidates.length) return null;
                const p = s.player || {};
                const sameFloor = candidates.filter(pos => pos.floor === (p.currentFloor || s.currentFloor || '1F'));
                const crossFloor = candidates.filter(pos => pos.floor !== (p.currentFloor || s.currentFloor || '1F'));
                const ordered = [...sameFloor, ...crossFloor];
                return ordered.find(pos => {
                    if (pos.floor !== (p.currentFloor || s.currentFloor || '1F')) return true;
                    if (p.x === pos.x && p.y === pos.y) return true;
                    if (typeof window.getShopNextStep !== 'function') return true;
                    return !!window.getShopNextStep(p.x, p.y, pos.x, pos.y, pos.floor);
                }) || ordered[0] || null;
            };
            let fGrid = s.grid || (s.floorData ? s.floorData[s.currentFloor] : null);
            if (fGrid) {
                for(let y=0; y<fGrid.length; y++) {
                    for(let x=0; x<(fGrid[y] || []).length; x++) {
                        if(types.includes(Number(fGrid[y][x]))) {
                            const picked = pickReachable(makeCandidateList(fGrid, x, y, s.currentFloor));
                            if (picked) return { x: picked.x, y: picked.y, floor: picked.floor };
                        }
                    }
                }
            }
            if (s.floorData) {
                for (let fName in s.floorData) {
                    if (fName === s.currentFloor) continue;
                    let oGrid = s.floorData[fName];
                    for(let y=0; y<oGrid.length; y++) {
                        for(let x=0; x<oGrid[0].length; x++) {
                            if(types.includes(Number(oGrid[y][x]))) {
                                const picked = pickReachable(makeCandidateList(oGrid, x, y, fName));
                                if (picked) return { x: picked.x, y: picked.y, floor: picked.floor };
                            }
                        }
                    }
                }
            }
            for(let x=0; x<s.mapWidth; x++) if(s.grid[s.mapHeight-1][x] === 100) return { x: x, y: s.mapHeight-1, floor: '1F' };
            return { x: Math.floor(s.mapWidth/2), y: Math.floor(s.mapHeight-1), floor: '1F' }; 
        };
        const getExitPos = () => getTargetPos([100], 0);
        const getRegisterFrontPos = () => getTargetPos([11,12,13], 1);
        const getRegisterBackPos = () => getTargetPos([11,12,13], -1);
        const getFridgeFrontPos = () => getTargetPos([31,91], 1);
        const getStoveFrontPos = () => getTargetPos([32,33,34,95,96,97], 1);
        const getAnyEmptyPos = () => getTargetPos([0], 0);

        // ★追加：階段チップを順にたどるパス生成ヘルパー
        const getStairsPath = (grid, isUp) => {
            let path = [];
            if (isUp) {
                for(let y=0; y<grid.length; y++) {
                    for(let x=0; x<grid[0].length; x++) {
                        if (grid[y][x] === 85) return [{x: x, y: y}, {x: x, y: y-1}, {x: x, y: y-2}]; // 85 -> 84 -> 81
                    }
                }
            } else {
                for(let y=0; y<grid.length; y++) {
                    for(let x=0; x<grid[0].length; x++) {
                        if (grid[y][x] === 87) return [{x: x, y: y}, {x: x, y: y+1}]; // 87 -> 89
                        if (grid[y][x] === 88) return [{x: x, y: y}, {x: x, y: y+1}]; // 88 -> 90
                    }
                }
            }
            return path;
        };
        // 階段の反対側の出口を取得
        const getStairsExit = (grid, fromUp) => {
            if (fromUp) { 
                for(let y=0; y<grid.length; y++) for(let x=0; x<grid[0].length; x++) if (grid[y][x] === 89 || grid[y][x] === 90) return {x: x, y: y+1}; 
            } else {
                for(let y=0; y<grid.length; y++) for(let x=0; x<grid[0].length; x++) if (grid[y][x] === 85) return {x: x, y: y+1}; 
            }
            return {x: Math.floor(grid[0].length/2), y: Math.floor(grid.length/2)};
        };

        // 別フロアへの移動監視フック
        const handleFloorTransition = (chara) => {
            if (!chara.currentFloor) chara.currentFloor = '1F';
            if (chara.targetPos && chara.targetPos.floor && chara.targetPos.floor !== chara.currentFloor) {
                if (!chara.stairPath) {
                    let isGoingUp = (chara.currentFloor === 'B1F' && chara.targetPos.floor === '1F') || (chara.currentFloor === '1F' && chara.targetPos.floor === '2F');
                    let path = getStairsPath(s.floorData[chara.currentFloor], isGoingUp);
                    if (path.length > 0) {
                        chara.finalTargetPos = chara.targetPos;
                        chara.stairPath = path;
                        chara.stairIdx = 0;
                        chara.targetPos = { ...chara.stairPath[0], floor: chara.currentFloor }; // まずは階段の入り口へ
                        chara.isGoingUp = isGoingUp;
                        
                        // ★AI店員が別フロアに移動する時の気づきセリフ
                        if (chara === s.player) {
                            let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                            let dest = "目的の場所";
                            if (chara.shopState.includes('prep') || chara.shopState.includes('cook') || chara.shopState.includes('fridge')) dest = "厨房";
                            else if (chara.shopState.includes('register')) dest = "レジ";
                            window.showShopFloatingText(chara.x, chara.y, `${dest}は${chara.finalTargetPos.floor}にしかないから移動するぞ！`, "#00BCD4", aiName);
                        }
                    } else {
                        chara.targetPos.floor = chara.currentFloor; // 階段がない場合はエラー回避
                    }
                }
            }
            // 階段チップ上を歩いている最中
            if (chara.stairPath && chara.targetPos && chara.x === chara.targetPos.x && chara.y === chara.targetPos.y) {
                chara.stairIdx++;
                if (chara.stairIdx < chara.stairPath.length) {
                    chara.targetPos = { ...chara.stairPath[chara.stairIdx], floor: chara.currentFloor };
                } else {
                    // 階段移動完了！フロア切り替え
                    let nextFloor = chara.finalTargetPos.floor;
                    let exitPos = getStairsExit(s.floorData[nextFloor], chara.isGoingUp);
                    chara.currentFloor = nextFloor;
                    chara.x = exitPos.x;
                    chara.y = exitPos.y;
                    chara.targetPos = chara.finalTargetPos;
                    chara.stairPath = null;
                    chara.finalTargetPos = null;
                    if (chara === s.player) window.changeShopFloor(chara.currentFloor); // AIならカメラも追従
                }
            }
        };

        // 安全装置（マップ外からの復帰）
        if (s.player) {
            if (s.player.x < 0 || s.player.x >= s.mapWidth || s.player.y < 0 || s.player.y >= s.mapHeight) {
                let exit = getExitPos();
                s.player.x = exit.x;
                s.player.y = exit.y;
                s.player.isMoving = false;
                s.player.action = 'idle';
                s.player.shopState = 'idle';
                s.player.targetPos = null;
                if (window.aiPet) { window.aiPet.x = exit.x; window.aiPet.y = exit.y; window.aiPet.isMoving = false; }
            }
        }

        let targetAssets = typeof assets !== 'undefined' ? assets : (window.assets || {});
        let building = Object.values(targetAssets).find(a => a && a.shopData === s) || null;
        
        let now = new Date();
        let currentHour = now.getHours();
        let currentMinute = now.getMinutes();

        const serviceTutorialWaitingForTimer = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && !window.aiPet.shopTutorialTimerSet);
        const timerUnlocked = !!(window.aiPet && (window.aiPet.shopTutorialCompleted || window.aiPet.shopTimerUnlocked)) && !serviceTutorialWaitingForTimer;
        if (!timerUnlocked) {
            if (s.isOpen) s.isOpen = false;
            s.announcedOneMinBefore = false;
        }
        
        if (timerUnlocked) {
            const serviceTutorialActiveForTimer = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service');
            let openTarget = new Date();
            if (serviceTutorialActiveForTimer && s.nextOpenAt) {
                openTarget = new Date(s.nextOpenAt);
            } else {
                openTarget.setHours(s.openHour !== undefined ? s.openHour : 9, s.openMinute !== undefined ? s.openMinute : 0, 0, 0);
                if (openTarget < now && (currentHour > s.openHour || (currentHour === s.openHour && currentMinute > s.openMinute))) {
                    openTarget.setDate(openTarget.getDate() + 1);
                }
            }
            
            let oneMinBefore = new Date(openTarget.getTime() - 60 * 1000);
            const isOneMinBefore = now >= oneMinBefore && now < openTarget;
            if (isOneMinBefore) {
                if (!s.announcedOneMinBefore) {
                    if (typeof window.addRestaurantLog === 'function') window.addRestaurantLog("⏰ 開店1分前になりました。まもなく営業を開始します。AI店員が配置につきます。", "#FF9800");
                    if (typeof window.showShopHeavenNotice === 'function') window.showShopHeavenNotice('開店1分前になりました。まもなく営業を開始します。AI店員が配置につきます。', '#FF9800');
                    if (serviceTutorialActiveForTimer && !window.aiPet.shopTutorialOneMinDialogueDone && typeof window.runShopTutorialDialogue === 'function') {
                        window.aiPet.shopTutorialOneMinDialogueDone = true;
                        window.runShopTutorialDialogue([
                            { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、あと少しで開店だ。客が来たら、まず席につくまで待て。' },
                            { target: 'player', speaker: window.aiPet.name || 'AI店員', color: '#00BCD4', text: '席についたら注文を聞くんだね。準備できたよ！' }
                        ]);
                    }
                    s.announcedOneMinBefore = true;
                }
            } else if (!serviceTutorialActiveForTimer) {
                if (s.announcedOneMinBefore && !isOneMinBefore) {
                    s.announcedOneMinBefore = false;
                }
            }
            
            if (!s.isOpen) {
                const tutorialOpenPending = serviceTutorialActiveForTimer && s.nextOpenAt && !s.shopTutorialOpenedForTimer && !window.aiPet.shopTutorialOpenedForTimer;
                const shouldOpen = serviceTutorialActiveForTimer
                    ? (tutorialOpenPending && now >= openTarget)
                    : (currentHour === s.openHour && currentMinute === s.openMinute);
                if (shouldOpen) {
                    const hasStockToOpen = serviceTutorialActiveForTimer || (typeof window.hasAnyRestaurantStock === 'function' && window.hasAnyRestaurantStock(s));
                    if (!hasStockToOpen) {
                        s.isOpen = false;
                        const blockKey = `${openTarget.getFullYear()}-${openTarget.getMonth()}-${openTarget.getDate()}-${s.openHour}-${s.openMinute}`;
                        if (s.openBlockedNoStockKey !== blockKey) {
                            s.openBlockedNoStockKey = blockKey;
                            if (typeof window.addRestaurantLog === 'function') window.addRestaurantLog('在庫がないため、今日の自動開店を見送りました。料理を1つ以上仕込むと次回から開店できます。', '#FF9800');
                            if (typeof window.showShopHeavenNotice === 'function') window.showShopHeavenNotice('在庫がないため、開店を見送りました。\n料理を1つ以上仕込むと営業できます。', '#FF9800');
                        }
                        if (document.getElementById('shop-tactic-editor-ui')?.style.display === 'flex') window.renderShopTacticEditor();
                    } else {
                    s.isOpen = true;
                    s.openBlockedNoStockKey = null;
                    if (!serviceTutorialActiveForTimer) s.announcedOneMinBefore = false; 
                    if (serviceTutorialActiveForTimer) {
                        s.shopTutorialOpenedForTimer = true;
                        window.aiPet.shopTutorialOpenedForTimer = true;
                        s.nextOpenAt = null;
                        s.shopTutorialLockAI = false;
                        if (s.player && s.player.shopState === 'tutorial_waiting') {
                            s.player.shopState = 'idle';
                            s.player.action = 'idle';
                            s.player.targetPos = null;
                        }
                        window.logShopTutorialDebug('接客チュートリアル: 開店時にAIロックを解除', {
                            AIマインド名: window.aiPet.currentShopTacticName,
                            playerState: s.player ? s.player.shopState : null
                        });
                    }
                    
                    // ★修正：開店時にフラグをリセット（＝次の開店までは維持される）
                    if (s.dailyFlags) {
                        s.dailyFlags.cramped = false;
                        s.dailyFlags.seatShortage = false;
                        s.dailyFlags.crampedCount = 0;
                    }

                    if (typeof window.addRestaurantLog === 'function') window.addRestaurantLog("📢 開店時間になりました！自動タイマーにより営業を開始します！", "#4CAF50");
                    if (typeof window.showShopHeavenNotice === 'function') window.showShopHeavenNotice('開店時間になりました。営業を開始します。', '#4CAF50');
                    if (serviceTutorialActiveForTimer) {
                        window.spawnShopTutorialCustomer();
                    }
                    if (document.getElementById('shop-tactic-editor-ui')?.style.display === 'flex') window.renderShopTacticEditor();
                    }
                }
            }
            
            if (s.isOpen) {
                if (!serviceTutorialActiveForTimer && currentHour === s.closeHour && currentMinute === s.closeMinute) {
                    s.isOpen = false;
                    if (typeof window.addRestaurantLog === 'function') window.addRestaurantLog("🔒 閉店時間になりました。本日の自動営業を終了します。", "#f44336");
                    if (document.getElementById('shop-tactic-editor-ui')?.style.display === 'flex') window.renderShopTacticEditor();
                }
            }
        }
        
        if (prevIsOpen && !s.isOpen) {
            if (s.dailyStats) {
                if (!s.marketPrices) s.marketPrices = {};
                for (let dishKey in s.dailyStats) {
                    let stat = s.dailyStats[dishKey];
                    let baseVal = (window.itemCatalog && window.itemCatalog[dishKey] && window.itemCatalog[dishKey].value) ? window.itemCatalog[dishKey].value * 4 : 100;
                    let currentMarket = s.marketPrices[dishKey] || baseVal;
                    
                    let fluctuation = 1.0 + (stat.sold * 0.02) - (stat.angry * 0.05);
                    fluctuation = Math.max(0.5, Math.min(2.0, fluctuation)); 
                    
                    let newMarket = Math.floor(currentMarket * fluctuation);
                    newMarket = Math.max(Math.floor(baseVal * 0.5), Math.min(Math.floor(baseVal * 3.0), newMarket)); 
                    
                    s.marketPrices[dishKey] = newMarket;
                    if (s.prices) delete s.prices[dishKey]; 
                }
                s.dailyStats = {}; 
                if (typeof window.addRestaurantLog === 'function') window.addRestaurantLog("本日の営業が終了しました。客の反応を振り返り、最新の相場を学習しました。", "#00BCD4");

                // ★修正＆追加：閉店時に「手狭かどうか」を判断！エラー回避のため s.player を直接参照する
                if (!s.dailyFlags) s.dailyFlags = { seatShortage: false, crampedCount: 0, missingSeats: 0 };
                if (s.dailyFlags.crampedCount >= 2) {
                    s.dailyFlags.cramped = true; // その日に2人以上座れなかったら手狭フラグON！
                    s.dailyFlags.seatShortage = true;
                    // ★大修正：座れなかった人数を「不足席数」としてストックする！
                    s.dailyFlags.missingSeats = (s.dailyFlags.missingSeats || 0) + s.dailyFlags.crampedCount; 
                    
                    let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                    window.showShopFloatingText(s.player.x, s.player.y, `今日は満席で座れないお客さんが多かったな…お店が手狭だ！`, "#FF9800", aiName);
                    if (typeof window.addRestaurantLog === 'function') {
                        window.addRestaurantLog(`⚠️ 満席のため入店できなかったお客さんが ${s.dailyFlags.crampedCount} 人いました。（不足席数: ${s.dailyFlags.missingSeats}）`, "#FF5252");
                    }
                }
                s.dailyFlags.crampedCount = 0; // 翌日のためにリセット

                let totalSeats = 0, luxuryCount = 0, casualCount = 0, counterCount = 0, stoolCount = 0;
                for(let ry = 0; ry < s.mapHeight; ry++) {
                    for(let rx = 0; rx < s.mapWidth; rx++) {
                        let t = s.grid[ry][rx];
                        if ([10, 14, 15, 16, 21, 22, 23, 24, 25, 26].includes(t)) { totalSeats++; } 
                        else if ([17, 35, 36, 37].includes(t)) {
                            totalSeats++; casualCount++;
                            if (t === 17) stoolCount++;
                            if ([35, 36, 37].includes(t)) counterCount++;
                        } 
                        else if ((t >= 41 && t <= 46) || (t >= 51 && t <= 56) || (t >= 61 && t <= 64) || [71, 72].includes(t)) { totalSeats++; luxuryCount++; } 
                    }
                }
                const knownRecipes = Object.keys(s.recipeProgress || {}).filter(k => s.recipeProgress[k] >= 0);
                const hasRecipeCategory = (category) => knownRecipes.some(k => window.getShopDishCategory && window.getShopDishCategory(k) === category);
                const hasRamenMenu = knownRecipes.some(k => /ramen|karaage|fried_rice|gyoza/.test(k));
                const hasSweetsMenu = hasRecipeCategory('sweets');
                 
                if (totalSeats > 0) {
                    if (hasRamenMenu && counterCount >= 2 && stoolCount >= 2) { s.shopTheme = 'ramen'; }
                    else if (hasSweetsMenu && luxuryCount / totalSeats >= 0.4) { s.shopTheme = 'sweets'; }
                    else if (luxuryCount / totalSeats >= 0.6) { s.shopTheme = 'luxury'; }
                    else if (casualCount / totalSeats >= 0.6) { s.shopTheme = 'casual'; }
                    else { s.shopTheme = 'normal'; }
                } else {
                    s.shopTheme = 'normal';
                }
            }
        }
        prevIsOpen = s.isOpen;

        if (s.isBankrupt) {
            window.renderShopMap();
            return;
        }

        const p = s.player;
        if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service') {
            window.logShopTutorialDebugThrottled('service_state_snapshot', '接客チュートリアル: 状態スナップショット', {
                AIマインド名: window.aiPet.currentShopTacticName,
                isOpen: !!s.isOpen,
                shopTutorialLockAI: !!s.shopTutorialLockAI,
                shopTacticEditorPausedAI: !!s.shopTacticEditorPausedAI,
                shopTutorialSpeaking: !!s.shopTutorialSpeaking,
                player: {
                    x: p.x,
                    y: p.y,
                    state: p.shopState,
                    action: p.action,
                    targetPos: p.targetPos || null,
                    targetNpcId: p.targetNpcId || null,
                    stairPath: !!p.stairPath
                },
                npcs: (s.npcs || []).map(n => ({
                    id: n.id,
                    state: n.state,
                    order: n.order,
                    x: n.x,
                    y: n.y,
                    targetPos: n.targetPos || null,
                    tutorial: !!n.isTutorialCustomer
                }))
            }, 2000);
        }
        if (window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && s.shopTutorialLockAI && !s.shopTutorialSpeaking && (s.npcs || []).some(n => ['ordering', 'waiting_for_food', 'paying'].includes(n.state))) {
            s.shopTutorialLockAI = false;
            if (p.shopState === 'tutorial_waiting') {
                p.shopState = 'idle';
                p.action = 'idle';
                p.targetPos = null;
            }
            window.logShopTutorialDebug('接客チュートリアル: 接客対象がいるためAIロックを自動解除', {
                playerState: p.shopState,
                客状態: (s.npcs || []).map(n => ({ id: n.id, state: n.state, order: n.order, x: n.x, y: n.y }))
            });
        }

        let queueNpcs = s.npcs.filter(n => {
            if (n.isTakeout && ['moving_to_takeout', 'ordering', 'waiting_for_food', 'paying'].includes(n.state)) return true;
            if (!n.isTakeout && ['moving_to_register', 'paying'].includes(n.state)) return true;
            return false;
        }).sort((a, b) => a.queueJoinedAt - b.queueJoinedAt);

        // レジ前の行列座標も動的に割り当て
        let regFront = getRegisterFrontPos();
        queueNpcs.forEach((qn, idx) => {
            qn.targetPos = { x: regFront.x, y: regFront.y + idx };
        });

        if (p.shopState !== p.prevShopState) {
            let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
            if (p.shopState === 'going_to_prep') window.showShopFloatingText(p.x, p.y, "明日のために仕込みをしておこう！", "#4CAF50", aiName);
            if (p.shopState === 'going_to_research') window.showShopFloatingText(p.x, p.y, "何か新しいレシピはないかな…？", "#00BCD4", aiName);
            if (p.shopState === 'going_to_remodel') window.showShopFloatingText(p.x, p.y, "少しお店の配置を変えてみようかな", "#FF9800", aiName);
            if (p.shopState === 'resting') window.showShopFloatingText(p.x, p.y, "ふぅ、少し休憩…", "#B39DDB", aiName);
            p.prevShopState = p.shopState;
        }

        if ((s.shopTutorialLockAI || s.shopTacticEditorPausedAI) && !p.targetPos && p.shopState !== 'tutorial_walking') {
            if (s.shopTutorialLockAI && p.shopState !== 'tutorial_waiting') {
                window.logShopTutorialDebug('通常AIをチュートリアルロックで停止', { 直前状態: p.shopState });
            } else if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service') {
                window.logShopTutorialDebugThrottled('service_ai_locked', '接客チュートリアル: AIが停止フラグで待機中', {
                    shopTutorialLockAI: !!s.shopTutorialLockAI,
                    shopTacticEditorPausedAI: !!s.shopTacticEditorPausedAI,
                    shopTutorialSpeaking: !!s.shopTutorialSpeaking,
                    playerState: p.shopState,
                    targetPos: p.targetPos || null,
                    npcs: (s.npcs || []).map(n => ({ id: n.id, state: n.state, order: n.order, x: n.x, y: n.y, tutorial: !!n.isTutorialCustomer }))
                }, 1500);
            }
            p.shopState = s.shopTutorialLockAI ? 'tutorial_waiting' : 'editor_paused';
            p.action = 'idle';
        }

        if (p.shopState === 'idle') {
            let tName = window.aiPet ? window.aiPet.currentShopTacticName : "AIにまかせる";
            let decidedState = null;
            let targetNpc = null;
            if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service') {
                window.logShopTutorialDebugThrottled('service_ai_idle_decision', '接客チュートリアル: AI判断開始', {
                    AIマインド名: tName,
                    isOpen: !!s.isOpen,
                    shopTutorialLockAI: !!s.shopTutorialLockAI,
                    shopTacticEditorPausedAI: !!s.shopTacticEditorPausedAI,
                    shopTutorialSpeaking: !!s.shopTutorialSpeaking,
                    player: { x: p.x, y: p.y, state: p.shopState, targetPos: p.targetPos || null },
                    npcs: (s.npcs || []).map(n => ({ id: n.id, state: n.state, order: n.order, x: n.x, y: n.y, patience: n.patience, tutorial: !!n.isTutorialCustomer })),
                    fridge: s.fridge || {},
                    menuList: s.menuList || []
                }, 1500);
            }
            
            const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS);
            let canPrep = recipeKeys.some(k => s.recipeProgress[k] >= 100 && window.checkAndConsumeIngredients(k, true));
            let canResearch = recipeKeys.some(k => (s.recipeProgress[k] === undefined || s.recipeProgress[k] < 100) && window.checkAndConsumeIngredients(k, true));
            const getAdjacentServiceSpot = (npc) => {
                if (!npc || !s.grid) return null;
                const blocked = new Set([1, 10, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97]);
                const dirs = [
                    { x: npc.x, y: npc.y + 1 },
                    { x: npc.x - 1, y: npc.y },
                    { x: npc.x + 1, y: npc.y },
                    { x: npc.x, y: npc.y - 1 }
                ];
                return dirs.find(pos => {
                    if (!s.grid[pos.y] || s.grid[pos.y][pos.x] === undefined) return false;
                    if (blocked.has(Number(s.grid[pos.y][pos.x]))) return false;
                    if (s.tutorialChef && s.tutorialChef.x === pos.x && s.tutorialChef.y === pos.y) return false;
                    if (Array.isArray(s.npcs) && s.npcs.some(n => n !== npc && n.x === pos.x && n.y === pos.y)) return false;
                    return true;
                }) || null;
            };

            if (tName === "AIにまかせる") {
                if (window.aiPet && !window.aiPet.shopTutorialCompleted) {
                    if (window.aiPet.shopTutorialMindPhase === 'service' && (s.isOpen || s.npcs.length > 0)) {
                        let payingNpc = s.npcs.filter(n => n.state === 'paying').sort((a, b) => a.patience - b.patience)[0];
                        if (payingNpc) { targetNpc = payingNpc; decidedState = 'going_to_register'; }
                        else {
                            let orderNpc = s.npcs.filter(n => n.state === 'ordering').sort((a, b) => a.patience - b.patience)[0];
                            if (orderNpc && s.fridge[orderNpc.order] > 0) {
                                targetNpc = orderNpc; decidedState = 'going_to_fridge';
                            }
                        }
                    } else {
                        decidedState = null;
                    }
                    const suppressServiceWaitLines = window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialTimerSet;
                    const suppressTutorialAmbientLine = window.aiPet.shopTutorialMindPhase !== 'service';
                    if (!suppressServiceWaitLines && !suppressTutorialAmbientLine && !decidedState && p.shopState === 'idle' && Math.random() < 0.02) {
                        let aiName = window.aiPet.name || "AI店員";
                        const nowMs = Date.now();
                        const waitInterval = window.aiPet.shopTutorialMindPhase === 'service' ? 45000 : 15000;
                        if (!window.aiPet.shopTutorialLastWaitLineAt || nowMs - window.aiPet.shopTutorialLastWaitLineAt > waitInterval) {
                            window.aiPet.shopTutorialLastWaitLineAt = nowMs;
                            if (window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialTimerSet && !s.shopTutorialSpeaking) {
                                const waitLines = [
                                    [
                                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '客が来たら、慌てず席についた客の注文を聞くんだ。' },
                                        { target: 'player', speaker: aiName, color: '#00BCD4', text: '注文を聞いて、料理を出して、最後は会計だね。' }
                                    ],
                                    [
                                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '料理はもう冷蔵庫に入ってる。注文を受けたら、取り出して運べばいい。' },
                                        { target: 'player', speaker: aiName, color: '#00BCD4', text: '焼きニンジンの在庫はあるよ。落ち着いて出せそう。' }
                                    ],
                                    [
                                        { target: 'chef', speaker: '料理人', color: '#FF9800', text: '最初の客は緊張するもんだ。だが、流れを守ればちゃんと回る。' },
                                        { target: 'player', speaker: aiName, color: '#00BCD4', text: 'うん。席、注文、料理、会計の順でやってみる。' }
                                    ]
                                ];
                                const lineIndex = window.aiPet.shopTutorialServiceWaitLineIndex || 0;
                                window.aiPet.shopTutorialServiceWaitLineIndex = lineIndex + 1;
                                window.runShopTutorialDialogue(waitLines[lineIndex % waitLines.length]);
                            } else {
                                const waitMsg = window.aiPet.shopTutorialMindPhase === 'service'
                                    ? "開店時間まで、最初のお客さんを迎える準備をしよう…"
                                    : "まずは料理人から店づくりを教わろう…";
                                window.showShopFloatingText(p.x, p.y, waitMsg, "#FFD700", aiName);
                            }
                        }
                    }
                } else if (s.isOpen || s.npcs.length > 0) {
                    let payingNpc = s.npcs.filter(n => n.state === 'paying').sort((a, b) => a.patience - b.patience)[0];
                    if (payingNpc) { targetNpc = payingNpc; decidedState = 'going_to_register'; }
                    else {
                        let orderNpc = s.npcs.filter(n => n.state === 'ordering').sort((a, b) => a.patience - b.patience)[0];
                        if (orderNpc && s.fridge[orderNpc.order] > 0) {
                            targetNpc = orderNpc; decidedState = 'going_to_fridge'; 
                        }
                    }
                } else if (!s.isOpen && s.npcs.length === 0) {
                    const vitals = typeof window.getShopWorkerVitals === 'function' ? window.getShopWorkerVitals() : { stamina: 100, fullness: 100 };
                    const needsSeat = !!(s.dailyFlags && (s.dailyFlags.cramped || s.dailyFlags.missingSeats > 0 || s.dailyFlags.seatShortage));
                    const canPlaceMore = Number(s.currentScore || 0) < Number(s.maxScore || 0);
                    const shouldFixLayout = !s.layoutPerfect && !canPlaceMore;

                    if (vitals.stamina <= 20 || vitals.fullness <= 20) decidedState = 'resting';
                    else if (canPrep) decidedState = 'going_to_prep';
                    else if (canResearch) decidedState = 'going_to_research';
                    else if (needsSeat && canPlaceMore) decidedState = 'going_to_add_seat';
                    else if (needsSeat && !canPlaceMore) decidedState = 'going_to_expand_floor';
                    else if (shouldFixLayout) decidedState = 'going_to_remodel';
                    else if (canPlaceMore && Math.random() < 0.18) decidedState = 'going_to_add_seat';
                    else decidedState = 'resting';
                }
            } else {
                let activeTactic = window.aiPet.shopTactics.find(t => t.name === tName);
                if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service') {
                    window.logShopTutorialDebugThrottled('service_active_tactic', '接客チュートリアル: AIマインド確認', {
                        AIマインド名: tName,
                        見つかった: !!activeTactic,
                        ルール数: activeTactic && activeTactic.rules ? activeTactic.rules.length : 0,
                        ルール: activeTactic && activeTactic.rules ? activeTactic.rules.map(r => ({ condition: r.condition, action1: r.action1 })) : []
                    }, 1800);
                }
                if (activeTactic && activeTactic.rules) {
                    for (let ruleIndex = 0; ruleIndex < activeTactic.rules.length; ruleIndex++) {
                        let rule = activeTactic.rules[ruleIndex];
                        let condMet = false;
                        const hasTile = (tiles) => s.grid && s.grid.some(row => row && row.some(tile => tiles.includes(Number(tile))));
                        if (rule.condition === 'always') condMet = true;
                        else if (rule.condition === 'customer_waiting_register' && s.npcs.some(n => n.state === 'paying')) condMet = true;
                        else if (rule.condition === 'customer_waiting_order' && s.npcs.some(n => n.state === 'ordering')) condMet = true;
                        else if (rule.condition === 'customer_waiting_food' && s.npcs.some(n => n.state === 'waiting_for_food')) condMet = true;
                        else if (rule.condition === 'is_closed' && !s.isOpen && s.npcs.length === 0) condMet = true;
                        else if (rule.condition === 'missing_kitchen' && (!hasTile([31, 91]) || !hasTile([32, 95, 96, 97]) || !hasTile([33, 34]))) condMet = true;
                        else if (rule.condition === 'missing_table' && !hasTile([21, 22, 23, 24, 25, 26])) condMet = true;
                        else if (rule.condition === 'missing_chair' && !hasTile([10, 14, 15, 16])) condMet = true;
                        else if (rule.condition === 'missing_register' && !hasTile([11, 12, 13, 92, 93, 94])) condMet = true;
                        else if (rule.condition === 'has_researchable_recipe' && canResearch) condMet = true;
                        else if (rule.condition === 'has_preppable_recipe' && canPrep) condMet = true;
                        else if (window.getShopDismantleTargetForCondition && window.getShopDismantleTargetForCondition(rule.condition)) {
                            const dTarget = window.getShopDismantleTargetForCondition(rule.condition);
                            if (dTarget && hasTile(dTarget.tiles)) condMet = true;
                        }
                        
                        if (!s.isOpen && s.npcs.length === 0) {
                            if (!s.dailyFlags) s.dailyFlags = { seatShortage: false, cramped: false, missingSeats: 0 };
                            const decorCount = s.grid ? s.grid.reduce((sum, row) => sum + row.filter(tile => [71, 72].includes(Number(tile))).length, 0) : 0;
                            // ★修正：フラグだけでなく「不足席数があるか」でも判定！
                            if (rule.condition === 'daily_seat_shortage' && (s.dailyFlags.seatShortage || s.dailyFlags.missingSeats > 0)) condMet = true;
                            if (rule.condition === 'shop_is_plain' && decorCount < Math.max(1, Math.floor((s.shopLevel || 1) / 5) + 1)) condMet = true; 
                            if (rule.condition === 'shop_is_cramped' && (s.dailyFlags.cramped || s.dailyFlags.missingSeats > 0)) condMet = true;
                            if (rule.condition === 'prefer_luxury_decor' || rule.condition === 'prefer_casual_decor') condMet = true;
                        }

                        if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service' && ['customer_waiting_order', 'customer_waiting_food', 'customer_waiting_register'].includes(rule.condition)) {
                            window.logShopTutorialDebugThrottled(`service_rule_${ruleIndex}_${rule.condition}`, '接客チュートリアル: AIマインド条件判定', {
                                優先度: ruleIndex + 1,
                                条件: rule.condition,
                                行動: rule.action1,
                                条件成立: condMet,
                                客状態: (s.npcs || []).map(n => ({ id: n.id, state: n.state, order: n.order, x: n.x, y: n.y, tutorial: !!n.isTutorialCustomer }))
                            }, 1500);
                        }

                        if (condMet) {
                            let act = rule.action1; 
                            if (rule.condition === 'customer_waiting_register' && act === 'うつ') {
                                targetNpc = s.npcs.find(n => n.state === 'paying');
                                if (targetNpc) { decidedState = 'going_to_register'; break; }
                            }
                            if (rule.condition === 'customer_waiting_order' && act === 'きく') {
                                let orderNpc = s.npcs.filter(n => n.state === 'ordering').sort((a, b) => a.patience - b.patience)[0];
                                if (orderNpc) {
                                    window.logShopTutorialDebug('接客チュートリアル: 注文を聞く対象を選択', {
                                        優先度: ruleIndex + 1,
                                        客: { id: orderNpc.id, state: orderNpc.state, order: orderNpc.order, x: orderNpc.x, y: orderNpc.y },
                                        fridge: s.fridge || {}
                                    });
                                    targetNpc = orderNpc; decidedState = 'going_to_take_order'; break;
                                }
                            }
                            if (rule.condition === 'customer_waiting_food' && act === 'はこぶ') {
                                let orderNpc = s.npcs.filter(n => n.state === 'waiting_for_food').sort((a, b) => a.patience - b.patience)[0];
                                if (orderNpc && s.fridge[orderNpc.order] > 0) {
                                    targetNpc = orderNpc; decidedState = 'going_to_fridge'; break;
                                }
                            }
                            
                            if (['is_closed', 'missing_kitchen', 'missing_table', 'missing_chair', 'missing_register', 'has_researchable_recipe', 'has_preppable_recipe', 'daily_seat_shortage', 'shop_is_plain', 'shop_is_cramped', 'prefer_luxury_decor', 'prefer_casual_decor', 'remove_decor', 'remove_fridge', 'remove_stove', 'remove_oven', 'remove_table', 'remove_chair', 'remove_register', 'remove_wall', 'remove_kitchen_floor'].includes(rule.condition) && !s.isOpen && s.npcs.length === 0) {
                                if (act === 'つくる' && canPrep) { decidedState = 'going_to_prep'; break; }
                                if (act === 'おぼえる' && canResearch) { decidedState = 'going_to_research'; break; }
                                if (act === 'かえる') { 
                                    if (window.getShopDismantleTargetForCondition && window.getShopDismantleTargetForCondition(rule.condition)) {
                                        p.dismantleCondition = rule.condition;
                                        decidedState = 'force_dismantle';
                                    }
                                    else if (rule.condition === 'prefer_luxury_decor') decidedState = 'going_to_remodel_luxury';
                                    else if (rule.condition === 'prefer_casual_decor') decidedState = 'going_to_remodel_casual';
                                    else decidedState = 'going_to_remodel';
                                    p.remodelCondition = rule.condition;
                                    break; 
                                }
                                if (act === 'やすむ') { decidedState = 'resting'; break; }
                                if (act === 'ふやす') { 
                                    if (rule.condition === 'shop_is_cramped') { decidedState = 'going_to_expand_floor'; } 
                                    else { decidedState = 'going_to_add_seat'; }
                                    break; 
                                }
                                if (rule.condition === 'shop_is_plain' && act === 'おく') { decidedState = 'going_to_decorate'; break; }
                                if (rule.condition === 'shop_is_cramped' && act === 'ふやす') { decidedState = 'going_to_expand_floor'; break; }
                            }

                            if (rule.condition === 'always') {
                                if (act === 'いう') { decidedState = 'speaking'; break; }
                                if (act === 'やすむ') { decidedState = 'resting'; break; }
                            }
                        }
                    }
                }
                if (window.aiPet && window.aiPet.shopTutorialAllowAmbientWaitLines && !decidedState && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialTimerSet && !s.isOpen && s.npcs.length === 0 && !s.shopTutorialSpeaking) {
                    const nowMs = Date.now();
                    if (!window.aiPet.shopTutorialLastWaitLineAt || nowMs - window.aiPet.shopTutorialLastWaitLineAt > 45000) {
                        const aiName = window.aiPet.name || "AI店員";
                        const waitLines = [
                            [
                                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '開店までに流れを確認しておくぞ。客が来たら、まず席につくまで待て。' },
                                { target: 'player', speaker: aiName, color: '#00BCD4', text: '席についたら注文を聞くんだね。準備できたよ！' }
                            ],
                            [
                                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '注文を聞いたら、冷蔵庫から料理を取り出して運ぶ。焦らず順番だ。' },
                                { target: 'player', speaker: aiName, color: '#00BCD4', text: '注文、配膳、会計の順だね。覚えてるよ。' }
                            ],
                            [
                                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '会計待ちの客を放っておくと店が詰まる。レジ待ちは最後まできっちり見ろよ。' },
                                { target: 'player', speaker: aiName, color: '#00BCD4', text: '最後はレジで「うつ」。ちゃんと見ておくよ。' }
                            ]
                        ];
                        const lineIndex = window.aiPet.shopTutorialServiceWaitLineIndex || 0;
                        window.aiPet.shopTutorialServiceWaitLineIndex = lineIndex + 1;
                        window.aiPet.shopTutorialLastWaitLineAt = nowMs;
                        window.runShopTutorialDialogue(waitLines[lineIndex % waitLines.length]);
                    }
                }
            }

            if (decidedState === 'going_to_register' && targetNpc) {
                p.targetNpcId = targetNpc.id; p.targetPos = null; p.shopState = 'going_to_register';
            } else if (decidedState === 'going_to_take_order' && targetNpc) {
                p.targetNpcId = targetNpc.id;
                const serviceSpot = getAdjacentServiceSpot(targetNpc) || { x: targetNpc.x, y: targetNpc.y };
                window.logShopTutorialDebug('接客チュートリアル: 注文を聞く移動を設定', {
                    客: { id: targetNpc.id, state: targetNpc.state, order: targetNpc.order, x: targetNpc.x, y: targetNpc.y },
                    移動先: serviceSpot,
                    プレイヤー現在地: { x: p.x, y: p.y, floor: p.currentFloor },
                    料理人: s.tutorialChef ? { x: s.tutorialChef.x, y: s.tutorialChef.y, face: s.tutorialChef.face } : null
                });
                p.targetPos = { x: serviceSpot.x, y: serviceSpot.y, floor: targetNpc.currentFloor || s.currentFloor || '1F' };
                p.shopState = 'going_to_take_order';
            } else if (decidedState === 'going_to_fridge' && targetNpc) {
                if (s.fridge[targetNpc.order] > 0) s.fridge[targetNpc.order]--; 
                targetNpc.state = 'waiting_for_food'; p.targetNpcId = targetNpc.id; p.targetPos = null; p.shopState = 'going_to_fridge';
            } else if (decidedState === 'going_to_prep') {
                p.targetPos = null; p.shopState = 'going_to_prep';
            } else if (decidedState === 'going_to_research') {
                p.targetPos = null; p.shopState = 'going_to_research';
            } else if (decidedState === 'going_to_remodel' || decidedState === 'going_to_remodel_luxury' || decidedState === 'going_to_remodel_casual') {
                p.remodelTheme = null;
                if (decidedState === 'going_to_remodel_luxury') p.remodelTheme = 'luxury';
                if (decidedState === 'going_to_remodel_casual') p.remodelTheme = 'casual';
                p.targetPos = null; p.shopState = 'going_to_remodel';
            } else if (decidedState === 'force_dismantle') {
                p.targetPos = null; p.shopState = 'force_dismantle'; p.timer = 1;
            } else if (decidedState === 'going_to_add_seat') {
                p.targetPos = null; p.shopState = 'going_to_add_seat';
            } else if (decidedState === 'going_to_decorate') {
                p.targetPos = null; p.shopState = 'going_to_decorate';
            } else if (decidedState === 'going_to_expand_floor') {
                p.targetPos = null; p.shopState = 'going_to_expand_floor'; 
            } else if (decidedState === 'speaking') {
                p.shopState = 'speaking'; p.timer = 5;
            } else if (decidedState === 'resting') {
                p.shopState = 'resting'; p.timer = 10;
            }
        } 
        else if (p.shopState === 'tutorial_walking' || p.shopState === 'tutorial_waiting') {
            // チュートリアル演出中は通常の店員AIを走らせず、移動処理だけ下段の共通処理に任せる
        }
        
        else if (p.shopState === 'speaking') {
            p.timer--;
            if (p.timer <= 0) p.shopState = 'idle';
        }
        else if (p.shopState === 'resting') {
            if (typeof window.recoverShopWorkerEnergy === 'function') window.recoverShopWorkerEnergy(4);
            p.timer--;
            if (p.timer <= 0) p.shopState = 'idle';
        }

        // ==========================================
        // ★ 拡張・レイアウト系の移動実行フェーズ（無限ループバグ防止機能付き）
        // ==========================================
        else if (['going_to_remodel', 'going_to_add_seat', 'going_to_decorate', 'going_to_expand_floor'].includes(p.shopState)) {
            if (!p.targetPos) {
                let tp = getAnyEmptyPos(); 
                if (p.x === tp.x && p.y === tp.y) {
                    if (p.shopState === 'going_to_remodel') { p.shopState = 'start_remodeling'; p.timer = 0; p.face = 'down'; }
                    if (p.shopState === 'going_to_add_seat') { p.shopState = 'adding_seat'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'down'; }
                    if (p.shopState === 'going_to_decorate') { p.shopState = 'decorating'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'up'; }
                    if (p.shopState === 'going_to_expand_floor') { p.shopState = 'expanding'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'up'; }
                } else {
                    p.targetPos = tp;
                }
            } else if (p.x === p.targetPos.x && p.y === p.targetPos.y) {
                if (p.shopState === 'going_to_remodel') { p.shopState = 'start_remodeling'; p.timer = 0; p.face = 'down'; }
                if (p.shopState === 'going_to_add_seat') { p.shopState = 'adding_seat'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'down'; }
                if (p.shopState === 'going_to_decorate') { p.shopState = 'decorating'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'up'; }
                if (p.shopState === 'going_to_expand_floor') { p.shopState = 'expanding'; p.timer = Math.max(1, Math.floor(15 * mods.remodelSpeedMult)); p.face = 'up'; }
                p.targetPos = null;
            }
        }
        else if (p.shopState === 'adding_seat') {
            p.timer--;
            if (p.timer <= 0) {
                let inv = window.aiPet.inventory || [];
                let tableIdx = inv.findIndex(item => item && item.id === 'item_table');
                let chairIdx = inv.findIndex(item => item && item.id === 'item_chair');
                let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                
                if (tableIdx !== -1 && chairIdx !== -1) {
                    let tData = window.SHOP_FURNITURE_DB['item_table'];
                    let cData = window.SHOP_FURNITURE_DB['item_chair'];
                    let totalCost = tData.cost + (cData.cost * 2); 
                    
                    if (s.currentScore + totalCost <= s.maxScore) {
                        let placed = false;
                        window.initShopFloors();
                        const isFinalTutorialExpand = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'expand');
                        const tryPlaceTutorialSeat = () => {
                            if (!isFinalTutorialExpand || !s.floorData || !s.floorData['1F']) return false;
                            const targetGrid = s.floorData['1F'];
                            const layouts = [
                                { x: 2, y: 6, chair: 'top' },
                                { x: 2, y: 5, chair: 'bottom' },
                                { x: 8, y: 7, chair: 'top' }
                            ];
                            for (const layout of layouts) {
                                const rx = layout.x;
                                const ry = layout.y;
                                if (!targetGrid[ry] || !targetGrid[ry + 1]) continue;
                                if (targetGrid[ry][rx] !== 0 || targetGrid[ry][rx + 1] !== 0 || targetGrid[ry + 1][rx] !== 0 || targetGrid[ry + 1][rx + 1] !== 0) continue;
                                if (layout.chair === 'top' && (!targetGrid[ry - 1] || targetGrid[ry - 1][rx] !== 0 || targetGrid[ry - 1][rx + 1] !== 0)) continue;
                                if (layout.chair === 'bottom' && (!targetGrid[ry + 2] || targetGrid[ry + 2][rx] !== 0 || targetGrid[ry + 2][rx + 1] !== 0)) continue;
                                targetGrid[ry][rx] = tData.tiles.tl;
                                targetGrid[ry][rx + 1] = tData.tiles.tr;
                                targetGrid[ry + 1][rx] = tData.tiles.bl;
                                targetGrid[ry + 1][rx + 1] = tData.tiles.br;
                                if (layout.chair === 'top') {
                                    targetGrid[ry - 1][rx] = cData.tiles.down;
                                    targetGrid[ry - 1][rx + 1] = cData.tiles.down;
                                } else {
                                    targetGrid[ry + 2][rx] = cData.tiles.up;
                                    targetGrid[ry + 2][rx + 1] = cData.tiles.up;
                                }
                                s.currentScore += totalCost;
                                inv.splice(Math.max(tableIdx, chairIdx), 1);
                                inv.splice(Math.min(tableIdx, chairIdx), 1);
                                window.refreshTableTiles(targetGrid);
                                if (s.currentFloor !== '1F') window.changeShopFloor('1F');
                                window.showShopFloatingText(p.x, p.y, `よし、1Fに席を増やしたぞ！`, "#FF9800", aiName);
                                if (!s.dailyFlags) s.dailyFlags = { missingSeats: 0 };
                                s.dailyFlags.missingSeats = Math.max(0, (s.dailyFlags.missingSeats || 0) - 2);
                                if (s.dailyFlags.missingSeats <= 0) {
                                    s.dailyFlags.seatShortage = false;
                                    s.dailyFlags.cramped = false;
                                }
                                if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('remodel');
                                if (typeof window.addShopExp === 'function') window.addShopExp(4);
                                p.shopState = 'idle';
                                return true;
                            }
                            return false;
                        };
                        placed = tryPlaceTutorialSeat();
                         
                        // ★大改修：1F -> 2F -> B1F の順で空きスペースを探す！
                        let searchFloors = ['1F'];
                        if (s.has2F) searchFloors.push('2F');
                        if (s.hasB1) searchFloors.push('B1F');

                        for (let fName of searchFloors) {
                            if (placed) break;
                            let targetGrid = s.floorData[fName];
                            if (!targetGrid) continue;
                            let fH = targetGrid.length;
                            let fW = targetGrid[0].length;

                            for(let ry = 2; ry < fH - 2; ry += 3) {
                                for(let rx = 2; rx < fW - 2; rx += 3) {
                                    // 2x2のテーブルが置けるかチェック
                                    if(targetGrid[ry][rx]===0 && targetGrid[ry][rx+1]===0 && targetGrid[ry+1][rx]===0 && targetGrid[ry+1][rx+1]===0) {
                                        
                                        // イスを置くスペース（上下左右）を探す
                                        let chairSpots = [];
                                        if(targetGrid[ry-1] && targetGrid[ry-1][rx]===0 && targetGrid[ry-1][rx+1]===0) chairSpots.push('top');
                                        if(targetGrid[ry+2] && targetGrid[ry+2][rx]===0 && targetGrid[ry+2][rx+1]===0) chairSpots.push('bottom');
                                        if(targetGrid[ry][rx-1]===0 && targetGrid[ry+1][rx-1]===0) chairSpots.push('left');
                                        if(targetGrid[ry][rx+2]===0 && targetGrid[ry+1][rx+2]===0) chairSpots.push('right');

                                        // イスが置けるスペースがあれば配置！
                                        if (chairSpots.length > 0) {
                                            targetGrid[ry][rx] = tData.tiles.tl; targetGrid[ry][rx+1] = tData.tiles.tr;
                                            targetGrid[ry+1][rx] = tData.tiles.bl; targetGrid[ry+1][rx+1] = tData.tiles.br;
                                            
                                            // 今回は最初に見つけた1方向に2つイスを置く
                                            let spot = chairSpots[0];
                                            if (spot === 'top') { targetGrid[ry-1][rx] = cData.tiles.down; targetGrid[ry-1][rx+1] = cData.tiles.down; }
                                            if (spot === 'bottom') { targetGrid[ry+2][rx] = cData.tiles.up; targetGrid[ry+2][rx+1] = cData.tiles.up; }
                                            if (spot === 'left') { targetGrid[ry][rx-1] = cData.tiles.right; targetGrid[ry+1][rx-1] = cData.tiles.right; }
                                            if (spot === 'right') { targetGrid[ry][rx+2] = cData.tiles.left; targetGrid[ry+1][rx+2] = cData.tiles.left; }
                                            
                                            s.currentScore += totalCost;
                                            inv.splice(Math.max(tableIdx, chairIdx), 1);
                                            inv.splice(Math.min(tableIdx, chairIdx), 1);
                                            
                                            window.refreshTableTiles(targetGrid);
                                            
                                            // ★配置したフロアにAIが（一瞬）ワープして描画を更新する！
                                            if (s.currentFloor !== fName) window.changeShopFloor(fName);
                                            
                                            window.showShopFloatingText(p.x, p.y, `よし、${fName}に席を増やしたぞ！`, "#FF9800", aiName);
                                            placed = true;
                                            
                                            if (!s.dailyFlags) s.dailyFlags = { missingSeats: 0 };
                                            s.dailyFlags.missingSeats = Math.max(0, (s.dailyFlags.missingSeats || 0) - 2);
                                            if (s.dailyFlags.missingSeats <= 0) {
                                                s.dailyFlags.seatShortage = false; 
                                                s.dailyFlags.cramped = false;
                                            }
                                            if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('remodel');
                                            if (typeof window.addShopExp === 'function') window.addShopExp(4);
                                             
                                            p.shopState = 'idle';
                                            break;
                                        }
                                    }
                                }
                                if(placed) break;
                            }
                            if(placed) break;
                        }
                        
                        if (!placed) {
                            window.showShopFloatingText(p.x, p.y, "全フロアにスペースがない！店を広げよう！", "#FF5252", aiName);
                            p.shopState = 'going_to_expand_floor';
                            p.targetPos = null;
                        }
                    } else {
                        window.showShopFloatingText(p.x, p.y, "これ以上家具を置くキャパ（スコア）がない！", "#FF5252", aiName);
                        p.shopState = 'idle';
                    }
                } else {
                    window.showShopFloatingText(p.x, p.y, "リュックに机とイスが入ってないや…", "#FF5252", aiName);
                    if (s.dailyFlags) s.dailyFlags.missingSeats = 0; 
                    p.shopState = 'idle';
                }
            }
        }
        else if (p.shopState === 'decorating') {
            p.timer--;
            if (p.timer <= 0) {
                const aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                const inv = window.aiPet && Array.isArray(window.aiPet.inventory) ? window.aiPet.inventory : [];
                let decorIdx = inv.findIndex(item => item && (item.id === 'item_plant' || item.id === 'item_candle'));
                let decorId = decorIdx !== -1 ? inv[decorIdx].id : 'item_plant';
                let decorTile = decorId === 'item_candle' ? 72 : 71;
                let decorName = decorId === 'item_candle' ? 'キャンドル' : '観葉植物';
                const blocked = new Set([1, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 100]);
                const candidates = [
                    { x: p.x + 1, y: p.y },
                    { x: p.x - 1, y: p.y },
                    { x: p.x, y: p.y + 1 },
                    { x: p.x, y: p.y - 1 },
                    p.tutorialDecorPos,
                    { x: 10, y: 4 },
                    { x: 9, y: 4 },
                    { x: 10, y: 5 }
                ].filter(Boolean);
                let placed = false;
                let placedPos = null;
                for (const pos of candidates) {
                    if (s.grid[pos.y] && s.grid[pos.y][pos.x] !== undefined && !blocked.has(Number(s.grid[pos.y][pos.x]))) {
                        s.grid[pos.y][pos.x] = decorTile;
                        placed = true;
                        placedPos = { x: pos.x, y: pos.y };
                        if (decorIdx !== -1) inv.splice(decorIdx, 1);
                        window.showShopFloatingText(pos.x, pos.y, `${decorName}を置いたよ！`, "#00BCD4", aiName);
                        break;
                    }
                }
                if (!placed) {
                        window.showShopFloatingText(p.x, p.y, "飾りを置ける場所が見つからないな…", "#FF5252", aiName);
                }
                if (placedPos && p.x === placedPos.x && p.y === placedPos.y) {
                    const stand = candidates.find(pos => pos && !(pos.x === placedPos.x && pos.y === placedPos.y) && s.grid[pos.y] && s.grid[pos.y][pos.x] !== undefined && !blocked.has(Number(s.grid[pos.y][pos.x])));
                    if (stand) {
                        p.x = stand.x;
                        p.y = stand.y;
                    }
                }
                p.tutorialDecorPos = null;
                if (placed && typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('decorate');
                if (placed && typeof window.addShopExp === 'function') window.addShopExp(3);
                p.shopState = 'idle';
                if (typeof window.refreshShopMiniMapLegend === 'function') window.refreshShopMiniMapLegend();
                if (typeof window.renderShopMap === 'function') window.renderShopMap();
            }
        }
        else if (p.shopState === 'expanding') {
            p.timer--;
            if (p.timer <= 0) {
                let inv = window.aiPet.inventory || [];
                let stairIdx = inv.findIndex(item => item && item.id === 'item_stairs');
                let baseStairIdx = inv.findIndex(item => item && item.id === 'item_basement_stairs');
                let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";

                let expanded = false;
                window.initShopFloors();

                // ① 2階への階段設置
                if (!expanded && stairIdx !== -1 && !s.has2F) {
                    let fData = window.SHOP_FURNITURE_DB['item_stairs'];
                    if (s.currentScore + fData.cost <= s.maxScore) {
                        let rx = s.mapWidth - 4, ry = 1; 
                        let canPlace = true;
                        for(let dy=0; dy<3; dy++) {
                            for(let dx=0; dx<3; dx++) {
                                if (s.grid[ry+dy] && s.grid[ry+dy][rx+dx] !== 0) canPlace = false;
                            }
                        }
                        if (canPlace) {
                            s.grid[ry][rx] = 81; s.grid[ry][rx+1] = 82; s.grid[ry][rx+2] = 83;
                            s.grid[ry+1][rx] = 84;
                            s.grid[ry+2][rx] = 85;
                            s.currentScore += fData.cost;
                            inv.splice(stairIdx, 1);
                            s.has2F = true;
                            
                            // ★追加：2Fのマップ配列を新規生成
                            s.floorData['2F'] = Array.from({length: s.mapHeight}, (_, y) => Array.from({length: s.mapWidth}, (_, x) => (y===0||y===s.mapHeight-1||x===0||x===s.mapWidth-1) ? 1 : 0));
                            s.floorData['2F'][ry][rx] = 87; s.floorData['2F'][ry][rx+1] = 88; // 降りる階段
                            s.floorData['2F'][ry+1][rx] = 89; s.floorData['2F'][ry+1][rx+1] = 90;

                            window.showShopFloatingText(p.x, p.y, "2階への階段を設置し、フロアを開放したぞ！", "#00BCD4", aiName);
                            expanded = true;
                        }
                    }
                }

                // ② 地下への階段設置
                if (!expanded && baseStairIdx !== -1 && !s.hasB1) {
                    let fData = window.SHOP_FURNITURE_DB['item_basement_stairs'];
                    if (s.currentScore + fData.cost <= s.maxScore) {
                        let rx = 1, ry = s.mapHeight - 3;
                        let canPlace = true;
                        for(let dy=0; dy<2; dy++) {
                            for(let dx=0; dx<2; dx++) {
                                if (s.grid[ry+dy] && s.grid[ry+dy][rx+dx] !== 0) canPlace = false;
                            }
                        }
                        if (canPlace) {
                            s.grid[ry][rx] = 87; s.grid[ry][rx+1] = 88;
                            s.grid[ry+1][rx] = 89; s.grid[ry+1][rx+1] = 90;
                            s.currentScore += fData.cost;
                            inv.splice(baseStairIdx, 1);
                            s.hasB1 = true;

                            // ★追加：地下のマップ配列を新規生成
                            s.floorData['B1F'] = Array.from({length: s.mapHeight}, (_, y) => Array.from({length: s.mapWidth}, (_, x) => (y===0||y===s.mapHeight-1||x===0||x===s.mapWidth-1) ? 1 : 0));
                            s.floorData['B1F'][ry][rx] = 81; s.floorData['B1F'][ry][rx+1] = 82; s.floorData['B1F'][ry][rx+2] = 83; // 昇る階段
                            s.floorData['B1F'][ry+1][rx] = 84; s.floorData['B1F'][ry+2][rx] = 85;

                            window.showShopFloatingText(p.x, p.y, "地下への階段を設置し、フロアを開放したぞ！", "#00BCD4", aiName);
                            expanded = true;
                        }
                    }
                }

                // ③ 1階のフロア拡張（既存）
                if (!expanded && s.mapWidth < 25 && s.currentFloor === '1F') {
                    let expandCost = 40;
                    if (s.currentScore + expandCost <= s.maxScore) {
                        let oldW = s.mapWidth;
                        s.mapWidth += 5;
                        for (let y = 0; y < s.mapHeight; y++) {
                            for (let i = 0; i < 5; i++) s.grid[y].push(0); 
                            if (y === 0 || y === s.mapHeight - 1) {
                                for(let x=oldW; x<s.mapWidth; x++) s.grid[y][x] = 1;
                            } else {
                                s.grid[y][oldW-1] = 0; 
                                s.grid[y][s.mapWidth-1] = 1; 
                            }
                        }
                        s.currentScore += expandCost;
                        window.showShopFloatingText(p.x, p.y, "1階のフロアを拡張したぞ！", "#00BCD4", aiName);
                        expanded = true;
                    }
                }

                // ④ 全て失敗した場合のエラー
                if (!expanded) {
                    if (s.mapWidth >= 25 && (stairIdx === -1 || s.has2F) && (baseStairIdx === -1 || s.hasB1)) {
                        window.showShopFloatingText(p.x, p.y, "これ以上どう拡張しよう…？", "#FF5252", aiName);
                    } else {
                        window.showShopFloatingText(p.x, p.y, "スペースもスコアも足りなくて拡張できないな…", "#FF5252", aiName);
                    }
                    if (s.dailyFlags) s.dailyFlags.missingSeats = 0; 
                }
                
                p.shopState = 'idle';
                if (expanded && typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('expand');
                if (expanded && typeof window.addShopExp === 'function') window.addShopExp(10);
            }
        }
        // ==========================================
        // ★ 調理・配膳の移動実行フェーズ
        // ==========================================
        else if (p.shopState === 'going_to_fridge') {
            if (!p.targetPos) {
                let tp = getFridgeFrontPos();
                if (p.x === tp.x && p.y === tp.y) { p.shopState = 'getting_ingredients'; p.timer = Math.max(0, Math.floor(5 * mods.fridgeSpeedMult)); p.face = 'up'; }
                else { p.targetPos = tp; }
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.shopState = 'getting_ingredients'; p.timer = Math.max(0, Math.floor(5 * mods.fridgeSpeedMult)); p.face = 'up'; p.targetPos = null;
            }
        }
        else if (p.shopState === 'getting_ingredients') {
            p.timer--;
            if (p.timer <= 0) { 
                // ★大修正：営業中なら冷蔵庫から出してそのまま客へ配膳！閉店中ならコンロ(調理)へ！
                if (s.isOpen && p.targetNpcId) {
                    p.shopState = 'delivering';
                    let npc = s.npcs.find(n => n.id === p.targetNpcId);
                    if (npc) p.targetPos = { x: npc.x, y: npc.y }; else p.shopState = 'idle';
                } else {
                    p.targetPos = null; p.shopState = 'going_to_cook'; 
                }
            }
        } 
        else if (p.shopState === 'going_to_cook') {
            if (!p.targetPos) {
                let tp = getStoveFrontPos();
                if (p.x === tp.x && p.y === tp.y) { p.shopState = 'cooking'; p.timer = 10; p.face = 'up'; }
                else { p.targetPos = tp; }
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.shopState = 'cooking'; p.timer = 10; p.face = 'up'; p.targetPos = null;
            }
        }
        else if (p.shopState === 'cooking') {
            p.timer--;
            if (p.timer <= 0) {
                p.shopState = 'delivering';
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) p.targetPos = { x: npc.x, y: npc.y }; else p.shopState = 'idle';
            }
        }
        // ==========================================
        // ★ 厨房・仕込み系の移動実行フェーズ（無限ループバグ防止機能付き）
        // ==========================================
        else if (p.shopState === 'going_to_prep') {
            if (!p.targetPos) {
                let tp = getStoveFrontPos();
                if (p.x === tp.x && p.y === tp.y) {
                    p.shopState = 'prepping'; p.timer = Math.max(0, Math.floor(15 * mods.prepSpeedMult)); p.face = 'up';
                } else {
                    p.targetPos = tp;
                }
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.shopState = 'prepping'; p.timer = Math.max(0, Math.floor(15 * mods.prepSpeedMult)); p.face = 'up'; p.targetPos = null;
            }
        }
        else if (p.shopState === 'prepping') {
            p.timer--;
            if (p.timer <= 0) {
                let prepped = false;
                const availableRecipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS);
                const activeSpecialTargets = window.aiPet && window.aiPet.apprentice && Array.isArray(window.aiPet.apprentice.activeQuests)
                    ? window.aiPet.apprentice.activeQuests.filter(q => q && q.isMasterSpecialQuest && q.eventType === 'cook_recipe' && !q.completed).map(q => q.targetId)
                    : [];
                const recipeKeys = [...activeSpecialTargets.filter(key => availableRecipeKeys.includes(key)), ...availableRecipeKeys.filter(key => !activeSpecialTargets.includes(key))];
                for (let dishKey of recipeKeys) {
                    if (s.recipeProgress[dishKey] >= 100 && window.checkAndConsumeIngredients(dishKey, false)) {
                        
                        if (!s.prices) s.prices = {}; 
                        if (!s.prices[dishKey]) {
                            let baseVal = (window.itemCatalog && window.itemCatalog[dishKey] && window.itemCatalog[dishKey].value) ? window.itemCatalog[dishKey].value * 4 : 100;
                            if (!s.marketPrices) s.marketPrices = {};
                            let marketPrice = s.marketPrices[dishKey] || baseVal;
                            
                            let intel = window.aiPet.stats.intel || 10;
                            let errorMargin = Math.max(0, 1.0 - (intel / 200)) * 0.5; 

                            // 価格設定の箇所
                            let randomFactor = (Math.random() * 2 - 1) * errorMargin; 
                            randomFactor += mods.priceFactorBonus; // ★追加：強気価格スキルを足す
                            
                            let setPrice = Math.max(1, Math.floor(marketPrice * (1 + randomFactor)));
                            s.prices[dishKey] = setPrice;
                            
                            let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(dishKey) : dishKey;
                            if (typeof window.showShopFloatingText === 'function') window.showShopFloatingText(p.x, p.y, `${dishName}の値段は ${setPrice}G にしよう！`, '#00BCD4');
                        }

                        if (!s.fridge[dishKey]) s.fridge[dishKey] = 0;
                        s.fridge[dishKey]++;
                        if (typeof window.recordMasterSpecialQuestProgress === 'function') {
                            window.recordMasterSpecialQuestProgress('cook_recipe', dishKey, { hero: window.aiPet, actualItemId: dishKey, addProofItem: true });
                        }

                        // 在庫を増やす箇所（s.fridge[dishKey]++ の直後に追加）
                        if (Math.random() < mods.prepBonusChance) {
                            s.fridge[dishKey] += mods.prepBonusAmount;
                        }
                        
                        if (!s.menuList) s.menuList = [];
                        if (!s.menuList.includes(dishKey)) s.menuList.push(dishKey);
                        
                        prepped = true;
                        let dishName = window.SHOP_DISH_NAMES[dishKey] || dishKey;
                        window.showShopFloatingText(p.x, p.y, `よし！${dishName}を仕込んだぞ！`, '#4CAF50');
                        if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('prep');
                        if (typeof window.addShopExp === 'function') window.addShopExp(6);
                        break;
                    }
                }
                if (!prepped) window.showShopFloatingText(p.x, p.y, "あれ？仕込めるレシピがないや…", '#FF5252');
                p.shopState = 'idle';
            }
        }
        else if (p.shopState === 'going_to_research') {
            if (!p.targetPos) {
                let tp = getStoveFrontPos();
                if (p.x === tp.x && p.y === tp.y) {
                    p.shopState = 'researching'; p.timer = Math.max(0, Math.floor(15 * mods.researchSpeedMult)); p.face = 'up';
                } else {
                    p.targetPos = tp;
                }
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.shopState = 'researching'; p.timer = Math.max(0, Math.floor(15 * mods.researchSpeedMult)); p.face = 'up'; p.targetPos = null;
            }
        }
        else if (p.shopState === 'researching') {
            p.timer--;
            if (p.timer <= 0) {
                const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS);
                let unlearned = recipeKeys.filter(key => s.recipeProgress[key] === undefined);
                let learnedKey = null;
                for (let key of unlearned) {
                    // ★修正：レシピを閃く時（未発見）は「素材が揃っているかの確認だけ」で消費はしない（trueに戻す）
                    if (window.checkAndConsumeIngredients(key, true)) {
                        learnedKey = key; break;
                    }
                }

                if (learnedKey) {
                    s.recipeProgress[learnedKey] = 0; 
                    let dishName = window.SHOP_DISH_NAMES[learnedKey] || learnedKey;
                    let ings = window.SHOP_RECIPE_COSTS[learnedKey].map(id => window.SHOP_ING_NAMES[id] || id).join("と");
                    window.showShopFloatingText(p.x, p.y, `なるほど！${ings}から${dishName}のレシピを閃いた！`, '#FFD700');
                    if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('research');
                    if (typeof window.addShopExp === 'function') window.addShopExp(8);
                } else {
                    let developing = recipeKeys.filter(key => s.recipeProgress[key] !== undefined && s.recipeProgress[key] < 100);
                    let devKey = null;
                    for (let key of developing) {
                        if (window.checkAndConsumeIngredients(key, false)) {
                            devKey = key; break;
                        }
                    }
                    if (devKey) {
                        // 研究進捗の箇所
                        s.recipeProgress[devKey] += (25 + mods.researchBonus); // ★修正：ボーナスを足す
                        let dishName = window.SHOP_DISH_NAMES[devKey] || devKey;
                        if (s.recipeProgress[devKey] >= 100) {
                            s.recipeProgress[devKey] = 100;
                            window.showShopFloatingText(p.x, p.y, `やった！${dishName}のレシピが完成したぞ！`, '#4CAF50');
                        } else {
                            window.showShopFloatingText(p.x, p.y, `${dishName}の開発が進んだ！(${s.recipeProgress[devKey]}%)`, '#00BCD4');
                        }
                        if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('research');
                        if (typeof window.addShopExp === 'function') window.addShopExp(8);
                    } else {
                        window.showShopFloatingText(p.x, p.y, `うーん、研究に使える素材がないな…`, '#FF5252');
                    }
                }
                p.shopState = 'idle';
            }
        }
        
        // ==========================================
        // ★ リモデル・撤去系のロジック
        // ==========================================
        else if (p.shopState === 'start_remodeling' || p.shopState === 'force_dismantle') {
            if (typeof window.isShopTutorialActive === 'function' && window.isShopTutorialActive()) {
                p.shopState = 'tutorial_waiting';
                p.targetPos = null;
                s.ghostFurniture = null;
                return;
            }
            if (p.shopState === 'force_dismantle' && p.dismantleCondition) {
                if (typeof window.dismantleShopTarget === 'function') window.dismantleShopTarget(p.dismantleCondition);
                p.dismantleCondition = null;
                p.shopState = 'idle';
                p.targetPos = null;
                s.ghostFurniture = null;
                if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('remodel');
                if (typeof window.addShopExp === 'function') window.addShopExp(2);
                return;
            }
            let inv = window.aiPet.inventory || [];

            const hasAnyShopTile = (tiles) => Array.isArray(s.grid) && s.grid.some(row => row && row.some(tile => tiles.includes(Number(tile))));
            const tryPlaceDirectFurniture = (itemIds, label) => {
                const ids = itemIds.filter(id => id && window.SHOP_FURNITURE_DB && window.SHOP_FURNITURE_DB[id]);
                const itemIdx = inv.findIndex(item => item && ids.includes(item.id));
                if (itemIdx === -1) return false;
                const item = inv[itemIdx];
                const fData = window.SHOP_FURNITURE_DB[item.id];
                const tiles = fData.tiles || {};
                const tileRows = [];
                if (tiles.single !== undefined) tileRows.push([tiles.single]);
                else if (tiles.left !== undefined && tiles.right !== undefined && tiles.center === undefined) tileRows.push([tiles.left, tiles.right]);
                else if (tiles.left !== undefined && tiles.center !== undefined && tiles.right !== undefined) tileRows.push([tiles.left, tiles.center, tiles.right]);
                if (tileRows.length === 0) return false;
                const h = tileRows.length;
                const w = tileRows[0].length;
                const cost = Number(fData.cost || 0);
                if (Number(s.currentScore || 0) + cost > Number(s.maxScore || 0)) {
                    window.showShopFloatingText(p.x, p.y, `${label}を置くレイアウトスコアが足りないみたい...`, '#FF5252');
                    p.shopState = 'idle';
                    return true;
                }
                const yStart = 1;
                const yEnd = s.mapHeight - 1;
                for (let y = yStart; y <= yEnd - h; y++) {
                    for (let x = 1; x <= s.mapWidth - 1 - w; x++) {
                        let canPlace = true;
                        for (let dy = 0; dy < h; dy++) {
                            for (let dx = 0; dx < w; dx++) {
                                if (!s.grid[y + dy] || Number(s.grid[y + dy][x + dx]) !== 0) canPlace = false;
                            }
                        }
                        if (!canPlace) continue;
                        const testGrid = s.grid.map(row => [...row]);
                        for (let dy = 0; dy < h; dy++) {
                            for (let dx = 0; dx < w; dx++) testGrid[y + dy][x + dx] = tileRows[dy][dx];
                        }
                        if (typeof window.checkShopPathSafety === 'function' && !window.checkShopPathSafety(testGrid)) continue;
                        s.grid = testGrid;
                        s.currentScore = Number(s.currentScore || 0) + cost;
                        inv.splice(itemIdx, 1);
                        p.shopState = 'idle';
                        p.targetPos = null;
                        p.remodelCondition = null;
                        s.ghostFurniture = null;
                        if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('remodel');
                        if (typeof window.addShopExp === 'function') window.addShopExp(3);
                        if (typeof window.renderShopMap === 'function') window.renderShopMap();
                        window.showShopFloatingText(p.x, p.y, `${label}を配置したよ！`, '#4CAF50');
                        return true;
                    }
                }
                window.showShopFloatingText(p.x, p.y, `${label}を置ける場所が見つからないみたい...`, '#FF5252');
                p.shopState = 'idle';
                return true;
            };

            if (p.shopState === 'start_remodeling' && p.remodelCondition === 'missing_kitchen') {
                if (!hasAnyShopTile([31, 91]) && tryPlaceDirectFurniture(['item_fridge', 'item_super_fridge'], '冷蔵庫')) return;
                if (!hasAnyShopTile([32, 95, 96, 97]) && tryPlaceDirectFurniture(['item_oven', 'item_legendary_kitchen'], 'オーブン')) return;
                if (!hasAnyShopTile([33, 34]) && tryPlaceDirectFurniture(['item_stove'], 'コンロ')) return;
                p.remodelCondition = null;
            }
            if (p.shopState === 'start_remodeling' && p.remodelCondition === 'missing_register') {
                if (!hasAnyShopTile([11, 12, 13, 92, 93, 94]) && tryPlaceDirectFurniture(['item_register', 'item_lux_counter'], 'レジカウンター')) return;
                p.remodelCondition = null;
            }
            
            let tableIdx = inv.findIndex(item => item && item.id && window.SHOP_FURNITURE_DB[item.id] && window.SHOP_FURNITURE_DB[item.id].type === 'table' && (!p.remodelTheme || window.SHOP_FURNITURE_DB[item.id].tags.includes(p.remodelTheme)));
            let chairIdx = inv.findIndex(item => item && item.id && window.SHOP_FURNITURE_DB[item.id] && window.SHOP_FURNITURE_DB[item.id].type === 'chair' && (!p.remodelTheme || window.SHOP_FURNITURE_DB[item.id].tags.includes(p.remodelTheme)));
            
            let tableTiles = [];
            let chairTiles = [];
            
            for(let y = 0; y < s.mapHeight; y++) {
                for(let x = 0; x < s.mapWidth; x++) {
                    let t = s.grid[y][x];
                    if (t >= 21 && t <= 26) tableTiles.push({x, y, tile: t, tag: 'normal'});
                    if (t >= 41 && t <= 46) tableTiles.push({x, y, tile: t, tag: 'luxury'});
                    if (t >= 51 && t <= 56) tableTiles.push({x, y, tile: t, tag: 'luxury'});
                    
                    if ([10,14,15,16].includes(t)) chairTiles.push({x, y, tile: t, tag: 'normal'});
                    if (t === 17) chairTiles.push({x, y, tile: t, tag: 'casual'});
                    if (t >= 61 && t <= 64) chairTiles.push({x, y, tile: t, tag: 'luxury'});
                }
            }
            
            let tableCount = Math.floor(tableTiles.length / 4);
            
            let tName = window.aiPet ? window.aiPet.currentShopTacticName : "AIにまかせる";
            let hasOtherActions = true;
            if (tName !== "AIにまかせる") {
                let activeTactic = window.aiPet.shopTactics.find(t => t.name === tName);
                if (activeTactic && activeTactic.rules) {
                    let manualActions = activeTactic.rules.map(r => r.action1).filter(a => a);
                    if (manualActions.length > 0 && manualActions.every(a => a === 'かえる')) hasOtherActions = false;
                }
            }

            let mismatchedChairs = chairTiles.filter(c => p.remodelTheme && c.tag !== p.remodelTheme);
            let mismatchedTables = tableTiles.filter(t => p.remodelTheme && t.tag !== p.remodelTheme);
            let hasMatchingChairInInv = chairIdx !== -1;
            let hasMatchingTableInInv = tableIdx !== -1;
            
            let isThemeIncomplete = p.remodelTheme && (
                (mismatchedChairs.length > 0 && hasMatchingChairInInv) ||
                (mismatchedTables.length > 0 && hasMatchingTableInInv)
            );

            if (p.shopState === 'start_remodeling' && tableCount >= 4 && chairTiles.length >= tableCount * 2 && !isThemeIncomplete) {
                s.layoutPerfect = true; 
                if (hasOtherActions) {
                    p.shopState = 'resting'; 
                    p.timer = 10;
                    return;
                }
            } else {
                s.layoutPerfect = false;
            }

            let prioritizeChair = (chairIdx !== -1) && (chairTiles.length < tableCount * 2);
            if (chairIdx !== -1 && tableIdx === -1) prioritizeChair = true;

            let doDismantle = () => {
                if (chairTiles.length > 0 || tableTiles.length > 0) {
                    let isMovingChair = chairTiles.length > 0 && (tableTiles.length === 0 || Math.random() < 0.4);
                    
                    let mismatchedChairs = chairTiles.filter(c => p.remodelTheme && c.tag !== p.remodelTheme);
                    let mismatchedTables = tableTiles.filter(t => p.remodelTheme && t.tag !== p.remodelTheme);
                    
                    if (mismatchedChairs.length > 0 && Math.random() < 0.8) isMovingChair = true;
                    else if (mismatchedTables.length > 0 && Math.random() < 0.8) isMovingChair = false;

                    if (isMovingChair) {
                        let targetArray = mismatchedChairs.length > 0 ? mismatchedChairs : chairTiles;
                        let target = targetArray[Math.floor(Math.random() * targetArray.length)];
                        s.grid[target.y][target.x] = 0;
                        
                        let removedId = 'item_chair';
                        if (target.tile === 17) removedId = 'item_stool';
                        else if (target.tile >= 61 && target.tile <= 64) removedId = 'item_high_chair';
                        inv.push({id: removedId, age: 0});
                        
                        window.showShopFloatingText(p.x, p.y, `テーマに合わないイスを片付けよう…`, '#FF9800');
                    } else if (tableTiles.length > 0) {
                        let targetArray = mismatchedTables.length > 0 ? mismatchedTables : tableTiles;
                        let target = targetArray[Math.floor(Math.random() * targetArray.length)];
                        
                        let tx = target.x, ty = target.y;
                        if ([24,25,26,44,45,46,54,55,56].includes(target.tile)) ty--; 
                        while(tx > 0 && [22,23,42,43,52,53].includes(s.grid[ty][tx])) tx--; 
                        
                        let tw = 0;
                        while(tx + tw < s.mapWidth && [21,22,23,41,42,43,51,52,53].includes(s.grid[ty][tx+tw])) tw++;
                        
                        let chairsToRemove = [];
                        const checkAndQueueChair = (cy, cx) => {
                            if (s.grid[cy] !== undefined && s.grid[cy][cx] !== undefined) {
                                let ct = s.grid[cy][cx];
                                if ([10, 14, 15, 16, 17, 61, 62, 63, 64].includes(ct)) {
                                    chairsToRemove.push({x: cx, y: cy, tile: ct});
                                    s.grid[cy][cx] = 0; 
                                }
                            }
                        };
                        for(let dx = 0; dx < tw; dx++) {
                            checkAndQueueChair(ty - 1, tx + dx); 
                            checkAndQueueChair(ty + 2, tx + dx); 
                        }
                        for(let dy = 0; dy < 2; dy++) {
                            checkAndQueueChair(ty + dy, tx - 1); 
                            checkAndQueueChair(ty + dy, tx + tw); 
                        }

                        for(let dy = 0; dy < 2; dy++){
                            for(let dx = 0; dx < tw; dx++){
                                s.grid[ty+dy][tx+dx] = 0;
                            }
                        }
                        
                        let removedTableId = 'item_table';
                        if (target.tile >= 41 && target.tile <= 46) removedTableId = 'item_high_table';
                        else if (target.tile >= 51 && target.tile <= 56) removedTableId = 'item_luxury_table';

                        let tablesToGive = Math.floor(tw / 2);
                        for(let i = 0; i < tablesToGive; i++) inv.push({id: removedTableId, age: 0});
                        for(let c of chairsToRemove) {
                            let removedChairId = 'item_chair';
                            if (c.tile === 17) removedChairId = 'item_stool';
                            else if (c.tile >= 61 && c.tile <= 64) removedChairId = 'item_high_chair';
                            inv.push({id: removedChairId, age: 0});
                        }
                        
                        if (chairsToRemove.length > 0) {
                            window.showShopFloatingText(p.x, p.y, `机とイス、まとめて片付けよう！`, '#FF9800');
                        } else {
                            window.showShopFloatingText(p.x, p.y, `この机、ジャマだな…`, '#FF9800');
                        }
                        window.refreshTableTiles(s.grid); 
                    }
                    p.shopState = 'idle';
                } else {
                    p.shopState = 'idle'; 
                }
            };

            if (p.shopState === 'force_dismantle') {
                doDismantle();
                return;
            }

            if ((tableIdx === -1 && chairIdx === -1) || Math.random() < 0.1) {
                doDismantle();
                if (p.shopState === 'idle') return; 
            }
            
            p.remodelData = { candidates: [], itemIdx: -1, type: '', fData: null };
            
            if (prioritizeChair && chairIdx !== -1) {
                p.remodelData.itemIdx = chairIdx;
                p.remodelData.type = 'chair';
                p.remodelData.fData = window.SHOP_FURNITURE_DB[inv[chairIdx].id];
                for (let ry = 4; ry < s.mapHeight - 1; ry++) {
                    for (let rx = 1; rx < s.mapWidth - 1; rx++) {
                        if (s.grid[ry][rx] === 0) p.remodelData.candidates.push({x: rx, y: ry});
                    }
                }
            } else if (tableIdx !== -1) {
                p.remodelData.itemIdx = tableIdx;
                p.remodelData.type = 'table';
                p.remodelData.fData = window.SHOP_FURNITURE_DB[inv[tableIdx].id];
                for (let ry = 5; ry < s.mapHeight - 2; ry++) { 
                    for (let rx = 2; rx < s.mapWidth - 2; rx++) { 
                        let isValid = true;
                        if (s.grid[ry][rx] !== 0 || s.grid[ry][rx+1] !== 0 || s.grid[ry+1][rx] !== 0 || s.grid[ry+1][rx+1] !== 0) isValid = false;
                        
                        if (isValid) {
                            const isTbl = (y, x) => s.grid[y] !== undefined && s.grid[y][x] !== undefined && s.grid[y][x] >= 21 && s.grid[y][x] <= 26;
                            if (isTbl(ry-1, rx) || isTbl(ry-1, rx+1)) isValid = false;
                            if (isTbl(ry+2, rx) || isTbl(ry+2, rx+1)) isValid = false;
                            
                            let leftTop = isTbl(ry, rx-1);
                            let leftBtm = isTbl(ry+1, rx-1);
                            if (leftTop !== leftBtm) isValid = false; 
                            
                            let rightTop = isTbl(ry, rx+2);
                            let rightBtm = isTbl(ry+1, rx+2);
                            if (rightTop !== rightBtm) isValid = false; 
                        }
                        
                        if (isValid) {
                            p.remodelData.candidates.push({x: rx, y: ry});
                        }
                    }
                }
            }
            
            if (p.remodelData.candidates.length > 0) {
                p.remodelData.candidates.sort(() => Math.random() - 0.5); 
                p.remodelData.cIdx = 0;
                p.timer = 0; 
                p.shopState = 'trying_remodel_spot'; 
            } else {
                if (!s.dailyFlags) s.dailyFlags = { seatShortage: false, cramped: false };
                s.dailyFlags.cramped = true; 
                window.showShopFloatingText(p.x, p.y, `置けないから、少し片付けよう！`, '#FF9800');
                p.shopState = 'force_dismantle';
                p.timer = 5;
            }
        }
        else if (p.shopState === 'trying_remodel_spot') {
            let rd = p.remodelData;
            
            if (rd.cIdx >= rd.candidates.length) {
                window.showShopFloatingText(p.x, p.y, `やっぱダメだ、片付けよう！`, '#FF5252');
                s.ghostFurniture = null;
                p.shopState = 'force_dismantle';
                return;
            }

            if (p.timer > 0) {
                p.timer--;
                return;
            }

            let pos = rd.candidates[rd.cIdx];
            let rx = pos.x, ry = pos.y;
            let testGrid = s.grid.map(row => [...row]);
            let isValidPlacement = false;
            s.ghostFurniture = []; 
            
            if (rd.type === 'chair') {
                let isAboveTable = testGrid[ry+1] !== undefined && [21,22,23,41,42,43,51,52,53].includes(testGrid[ry+1][rx]);
                let isBelowTable = testGrid[ry-1] !== undefined && [24,25,26,44,45,46,54,55,56].includes(testGrid[ry-1][rx]);
                let isLeftOfTable = testGrid[ry][rx+1] !== undefined && [21,24,41,44,51,54].includes(testGrid[ry][rx+1]);
                let isRightOfTable = testGrid[ry][rx-1] !== undefined && [23,26,43,46,53,56].includes(testGrid[ry][rx-1]);
                
                let chairTile = null;
                let chairKey = null;
                
                let pfxC = (rd.fData.tiles.down === 61) ? "rfur_lux_chair" : "rfur_chair";
                
                if (isAboveTable) { chairTile = rd.fData.tiles.down; chairKey = `${pfxC}_down`; }
                else if (isBelowTable) { chairTile = rd.fData.tiles.up; chairKey = `${pfxC}_up`; }
                else if (isLeftOfTable) { chairTile = rd.fData.tiles.left; chairKey = `${pfxC}_left`; }
                else if (isRightOfTable) { chairTile = rd.fData.tiles.right; chairKey = `${pfxC}_right`; }
                
                let previewKey = chairKey || `${pfxC}_down`;
                if (rd.fData.tiles.down === 17) previewKey = "rfur_stool";
                s.ghostFurniture.push({x: rx, y: ry, key: previewKey});

                if (chairTile !== null) {
                    testGrid[ry][rx] = chairTile;
                    isValidPlacement = true;

                    let tx = rx, ty = ry;
                    if (isAboveTable) ty++;
                    else if (isBelowTable) ty--;
                    else if (isLeftOfTable) tx++;
                    else if (isRightOfTable) tx--;

                    let chairsAroundTargetTable = 0;
                    const isChairTileObj = (y, x) => testGrid[y] !== undefined && testGrid[y][x] !== undefined && [10, 14, 15, 16, 17, 61, 62, 63, 64].includes(testGrid[y][x]);
                    
                    if (isChairTileObj(ty-1, tx)) chairsAroundTargetTable++;
                    if (isChairTileObj(ty+1, tx)) chairsAroundTargetTable++;
                    if (isChairTileObj(ty, tx-1)) chairsAroundTargetTable++;
                    if (isChairTileObj(ty, tx+1)) chairsAroundTargetTable++;

                    let isLuxuryTable = [41,42,43,44,45,46,51,52,53,54,55,56].includes(testGrid[ty][tx]);
                    
                    if (chairsAroundTargetTable > 1 && !isLuxuryTable) { 
                        isValidPlacement = false;
                    } else {
                        const isTableTile = (y, x) => testGrid[y] !== undefined && testGrid[y][x] !== undefined && [21,22,23,24,25,26,41,42,43,44,45,46,51,52,53,54,55,56].includes(testGrid[y][x]);
                        let adjacentTableCount = 0;
                        if (isTableTile(ry+1, rx)) adjacentTableCount++; 
                        if (isTableTile(ry-1, rx)) adjacentTableCount++; 
                        if (isTableTile(ry, rx+1)) adjacentTableCount++; 
                        if (isTableTile(ry, rx-1)) adjacentTableCount++; 

                        if (adjacentTableCount > 1) isValidPlacement = false; 
                    }
                }
            } else if (rd.type === 'table') {
                let pfxT = "rfur_table";
                if (rd.fData.tiles.tl === 41) pfxT = "rfur_lux_table";
                else if (rd.fData.tiles.tl === 51) pfxT = "rfur_marble_table";

                s.ghostFurniture.push({x: rx, y: ry, key: `${pfxT}_tl`}); s.ghostFurniture.push({x: rx+1, y: ry, key: `${pfxT}_tr`});
                s.ghostFurniture.push({x: rx, y: ry+1, key: `${pfxT}_bl`}); s.ghostFurniture.push({x: rx+1, y: ry+1, key: `${pfxT}_br`});
                
                testGrid[ry][rx] = rd.fData.tiles.tl; testGrid[ry][rx+1] = rd.fData.tiles.tr;
                testGrid[ry+1][rx] = rd.fData.tiles.bl; testGrid[ry+1][rx+1] = rd.fData.tiles.br;
                
                window.refreshTableTiles(testGrid);
                isValidPlacement = true;

                const isChairTile = (y, x) => testGrid[y] !== undefined && testGrid[y][x] !== undefined && [10, 14, 15, 16, 17].includes(testGrid[y][x]);

                if (isChairTile(ry-1, rx) || isChairTile(ry-1, rx+1) || 
                    isChairTile(ry+2, rx) || isChairTile(ry+2, rx+1) || 
                    isChairTile(ry, rx-1) || isChairTile(ry+1, rx-1) || 
                    isChairTile(ry, rx+2) || isChairTile(ry+1, rx+2)) { 
                    isValidPlacement = false;
                }
            }
            
            if (isValidPlacement && window.checkShopPathSafety(testGrid)) {
                p.shopState = 'finish_remodel';
                p.timer = 5; 
                p.remodelData.testGrid = testGrid;
            } else {
                rd.cIdx++; 
                p.timer = 1; 
            }
        }
        else if (p.shopState === 'finish_remodel') {
            p.timer--;
            if (p.timer <= 0) {
                let inv = window.aiPet.inventory || [];
                let item = inv[p.remodelData.itemIdx];
                let placedName = item ? (typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(item.id) : item.id) : "家具";
                
                s.grid = p.remodelData.testGrid; 
                if (item) inv.splice(p.remodelData.itemIdx, 1);
                
                s.ghostFurniture = null; 
                let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                window.showShopFloatingText(p.x, p.y, `よし！ここに${placedName}を置こう！`, '#FF9800', aiName);
                p.shopState = 'idle';
            }
        }
        
        // ==========================================
        // ★ レジ（会計）への移動実行フェーズ（無限ループバグ防止機能付き）
        // ==========================================
        else if (p.shopState === 'going_to_register') {
            if (!p.targetPos) {
                let tp = getRegisterBackPos();
                if (p.x === tp.x && p.y === tp.y) {
                    p.shopState = 'checkout'; p.timer = Math.max(0, Math.floor(5 * mods.registerSpeedMult)); p.face = 'down';
                } else {
                    p.targetPos = tp;
                }
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.shopState = 'checkout'; p.timer = Math.max(0, Math.floor(5 * mods.registerSpeedMult)); p.face = 'down'; p.targetPos = null;
            }
        }
        else if (p.shopState === 'checkout') {
            p.timer--;
            if (p.timer <= 0) {
                p.shopState = 'idle';
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) {
                    let exitPos = getExitPos();
                    npc.state = 'leaving'; npc.targetPos = exitPos; 
                    
                    let trait = window.CUSTOMER_TRAITS[npc.skin] || window.CUSTOMER_TRAITS['robot'];
                    let orderCount = trait.appetite || 1;
                    let soldPrice = ((s.prices && s.prices[npc.order]) || 100) * orderCount;
                    
                    let chipBonus = 0;
                    // チップの箇所
                    let finalChipChance = (trait.chipChance || 0) + mods.chipChanceBonus; // ★修正
                    if (Math.random() < finalChipChance) {
                        chipBonus = Math.floor(soldPrice * (0.2 + Math.random() * 0.3)) * mods.chipMult; // ★修正
                    }
                    
                    let finalEarned = soldPrice + chipBonus;
                    let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                    window.showShopFloatingText(p.x, p.y, `${soldPrice}Gです`, "#FFD700", aiName);
                    setTimeout(() => {
                        if (window.SHOP_STATE && window.SHOP_STATE.player) {
                            window.showShopFloatingText(window.SHOP_STATE.player.x, window.SHOP_STATE.player.y, "ありがとうございました！", "#00BCD4", aiName);
                        }
                    }, 900);
                    if (window.aiPet) window.aiPet.gold += finalEarned; 
                    if (s.reputation < 100) s.reputation += 2; 
                    s.totalSales = (s.totalSales || 0) + finalEarned; 
                    if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('register');
                    if (typeof window.addShopExp === 'function') window.addShopExp(10);
                    
                    if (!s.dailyStats) s.dailyStats = {};
                    if (!s.dailyStats[npc.order]) s.dailyStats[npc.order] = { sold: 0, angry: 0 };
                    s.dailyStats[npc.order].sold += orderCount;
                    if (window.aiPet && window.isPastryRecipe && window.isPastryRecipe(npc.order)) {
                        const activeQuests = window.aiPet.apprentice && window.aiPet.apprentice.activeQuests ? window.aiPet.apprentice.activeQuests : [];
                        activeQuests.forEach(q => {
                            if (q.masterType === 'pastry_chef' && q.rank === 9) {
                                q.qVal = (q.qVal || 0) + orderCount;
                                window.aiPet.apprentice.qVal = q.qVal;
                            }
                        });
                        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                    }

                    if (!s.loyalty) s.loyalty = {};
                    let wasRegular = (s.loyalty[npc.skin] || 0) >= (trait.loyaltyReq || 3);
                    s.loyalty[npc.skin] = (s.loyalty[npc.skin] || 0) + 1;
                    
                    // 常連度の箇所
                    let isRegChance = mods.regularChanceBonus > 0 && Math.random() < mods.regularChanceBonus;
                    if (isRegChance) s.loyalty[npc.skin] = Math.max(s.loyalty[npc.skin] || 0, (trait.loyaltyReq || 3)); // ★強制常連化

                    if (!wasRegular && s.loyalty[npc.skin] >= (trait.loyaltyReq || 3)) {
                        if (typeof window.addRestaurantLog === 'function') {
                            let mName = (window.monsterBookData && window.monsterBookData[npc.skin]) ? window.monsterBookData[npc.skin].name : npc.skin;
                            window.addRestaurantLog(`✨ ${mName} が常連客になりました！`, "#E040FB");
                        }
                    }
                    
                    if (chipBonus > 0 && typeof window.showShopFloatingText === 'function') {
                        window.showShopFloatingText(p.x, p.y, `チップ +${chipBonus}G !`, '#FFD700');
                    }
                }
                p.targetNpcId = null;
            }
        }
        
        // ==========================================
        // ★ AI店員の移動ルーチン
        // ==========================================
        handleFloorTransition(p); // ★追加：AIの階段処理フック
        if (p.targetPos) {
            let distToTarget = Math.abs(p.x - p.targetPos.x) + Math.abs(p.y - p.targetPos.y);
            if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service' && p.shopState === 'going_to_take_order') {
                const npc = s.npcs.find(n => n.id === p.targetNpcId);
                window.logShopTutorialDebugThrottled('service_take_order_moving', '接客チュートリアル: 注文を聞く移動中', {
                    現在地: { x: p.x, y: p.y, floor: p.currentFloor },
                    目的地: p.targetPos,
                    距離: distToTarget,
                    階段経路中: !!p.stairPath,
                    対象客: npc ? { id: npc.id, state: npc.state, order: npc.order, x: npc.x, y: npc.y } : null
                }, 900);
            }
            
            // ★修正：階段移動中(!p.stairPath)は到着判定を無視する！
            if (p.shopState === 'going_to_take_order' && p.x === p.targetPos.x && p.y === p.targetPos.y && !p.stairPath) {
                if (p.targetPos.x > p.x) p.face = 'right';
                else if (p.targetPos.x < p.x) p.face = 'left';
                else if (p.targetPos.y > p.y) p.face = 'down';
                else if (p.targetPos.y < p.y) p.face = 'up';

                const npc = s.npcs.find(n => n.id === p.targetNpcId);
                const aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                window.logShopTutorialDebug('接客チュートリアル: 注文を聞く位置に到着', {
                    対象客: npc ? { id: npc.id, state: npc.state, order: npc.order, x: npc.x, y: npc.y } : null,
                    プレイヤー: { x: p.x, y: p.y, face: p.face }
                });
                if (npc && npc.state === 'ordering') {
                    const speaker = window.getShopCustomerName(npc.skin);
                    const dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                    npc.state = 'taking_order';
                    npc.timer = 0;
                    window.showShopFloatingText(p.x, p.y, "注文は？", "#00BCD4", aiName);
                    if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('serve');
                    setTimeout(() => {
                        if (!window.SHOP_STATE || !window.SHOP_STATE.npcs) return;
                        const currentNpc = window.SHOP_STATE.npcs.find(n => n.id === npc.id);
                        if (!currentNpc || currentNpc.state !== 'taking_order') return;
                        window.showShopFloatingText(currentNpc.x, currentNpc.y, `${dishName}をお願いします！`, "#FFF", speaker);
                        currentNpc.msg = dishName;
                        currentNpc.msgColor = "#FFF";
                        currentNpc.state = 'waiting_for_food';
                        currentNpc.timer = 0;
                        currentNpc.patience += 80;
                        window.logShopTutorialDebug('接客チュートリアル: 注文を受けて配膳待ちへ変更', {
                            客: { id: currentNpc.id, state: currentNpc.state, order: currentNpc.order, x: currentNpc.x, y: currentNpc.y },
                            料理名: dishName
                        });
                    }, 900);
                }
                p.targetPos = null;
                p.targetNpcId = null;
                p.shopState = 'idle';
            }
            else if (p.shopState === 'delivering' && distToTarget <= 1 && !p.stairPath) {
                if (p.targetPos.x > p.x) p.face = 'right';
                else if (p.targetPos.x < p.x) p.face = 'left';
                else if (p.targetPos.y > p.y) p.face = 'down';
                else if (p.targetPos.y < p.y) p.face = 'up';

                p.targetPos = null; p.shopState = 'idle'; 
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) {
                    const aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                    const dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                    window.showShopFloatingText(p.x, p.y, `おまたせしました。${dishName}です`, "#FFF", aiName);
                    if (typeof window.consumeShopWorkerEnergy === 'function') window.consumeShopWorkerEnergy('serve');
                    if (typeof window.addShopExp === 'function') window.addShopExp(3);
                    if (npc.isTakeout) { npc.state = 'paying'; npc.timer = 0; npc.patience += 100; } 
                    else {
                        npc.state = 'eating'; npc.timer = 0; npc.patience += 100;
                        let seatType = s.grid[npc.y][npc.x]; let tableX = npc.x, tableY = npc.y;
                        if (seatType === 10 || seatType === 17 || seatType === 61) tableY += 1; 
                        else if (seatType === 14 || seatType === 62) tableY -= 1; 
                        else if (seatType === 15 || seatType === 63) tableX += 1; 
                        else if (seatType === 16 || seatType === 64) tableX -= 1;
                        s.dishes.push({ x: tableX, y: tableY, key: npc.order, npcId: npc.id });
                    }
                }
                p.targetNpcId = null;
            } else if (!p.stairPath && p.x === p.targetPos.x && p.y === p.targetPos.y) { 
                p.targetPos = null; p.action = 'idle'; p.stuckTimer = 0;
            } else {
                const blockedDestTiles = new Set([1, 10, 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 61, 62, 63, 64, 71, 72, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97]);
                const activeGrid = s.grid || ((s.floorData && s.floorData[p.currentFloor]) ? s.floorData[p.currentFloor] : null);
                if (activeGrid && p.targetPos && activeGrid[p.targetPos.y] && blockedDestTiles.has(Number(activeGrid[p.targetPos.y][p.targetPos.x]))) {
                    const around = [
                        { x: p.targetPos.x, y: p.targetPos.y + 1, floor: p.targetPos.floor || p.currentFloor },
                        { x: p.targetPos.x - 1, y: p.targetPos.y, floor: p.targetPos.floor || p.currentFloor },
                        { x: p.targetPos.x + 1, y: p.targetPos.y, floor: p.targetPos.floor || p.currentFloor },
                        { x: p.targetPos.x, y: p.targetPos.y - 1, floor: p.targetPos.floor || p.currentFloor }
                    ].filter(pos => activeGrid[pos.y] && activeGrid[pos.y][pos.x] !== undefined && !blockedDestTiles.has(Number(activeGrid[pos.y][pos.x])));
                    const reachable = around.find(pos => p.x === pos.x && p.y === pos.y) || around.find(pos => window.getShopNextStep(p.x, p.y, pos.x, pos.y, pos.floor || p.currentFloor));
                    if (reachable) p.targetPos = reachable;
                }
                let nextStep = window.getShopNextStep(p.x, p.y, p.targetPos.x, p.targetPos.y, p.currentFloor);
                if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service' && p.shopState === 'going_to_take_order') {
                    window.logShopTutorialDebugThrottled('service_take_order_next_step', '接客チュートリアル: 注文を聞く経路計算', {
                        現在地: { x: p.x, y: p.y, floor: p.currentFloor },
                        目的地: p.targetPos,
                        次の一歩: nextStep || null,
                        対象客ID: p.targetNpcId
                    }, 900);
                }
                if (nextStep) {
                    if (nextStep.x > p.x) p.face = 'right'; 
                    else if (nextStep.x < p.x) p.face = 'left'; 
                    else if (nextStep.y > p.y) p.face = 'down'; 
                    else if (nextStep.y < p.y) p.face = 'up';
                    p.x = nextStep.x; p.y = nextStep.y;
                    p.isMoving = true;
                    p.stuckTimer = 0; // 進めたらリセット
                } else {
                    if (window.aiPet && window.aiPet.shopTutorialMindPhase === 'service' && p.shopState === 'going_to_take_order') {
                        window.logShopTutorialDebug('接客チュートリアル: 注文を聞く経路が見つかりません', {
                            現在地: { x: p.x, y: p.y, floor: p.currentFloor },
                            目的地: p.targetPos,
                            対象客ID: p.targetNpcId,
                            料理人: s.tutorialChef ? { x: s.tutorialChef.x, y: s.tutorialChef.y } : null,
                            客状態: (s.npcs || []).map(n => ({ id: n.id, state: n.state, x: n.x, y: n.y }))
                        });
                    }
                    if (typeof window.isShopTutorialActive === 'function' && window.isShopTutorialActive()) {
                        p.targetPos = null;
                        p.action = 'idle';
                        p.isMoving = false;
                        p.stuckTimer = 0;
                        if (p.shopState !== 'tutorial_walking' && p.shopState !== 'tutorial_waiting') {
                            p.shopState = 'tutorial_waiting';
                        }
                        return;
                    }
                    // ★追加：導線がない場合、数ターン立ち往生した後に気づいて強制撤去モードへ！
                    p.stuckTimer = (p.stuckTimer || 0) + 1;
                    if (p.stuckTimer > 5) {
                        let destName = "目的地";
                        if (p.shopState.includes('register')) destName = "レジ";
                        else if (p.shopState.includes('prep') || p.shopState.includes('cook')) destName = "厨房";
                        else if (p.shopState.includes('seat')) destName = "客席";
                        
                        let aiName = window.aiPet ? window.aiPet.name || "AI店員" : "AI店員";
                        window.showShopFloatingText(p.x, p.y, `しまった…${destName}までの導線（道）がない！片付けなきゃ！`, "#FF9800", aiName);
                        
                        p.shopState = 'force_dismantle'; // 強制お片付けモードへ
                        p.targetPos = null;
                        p.timer = 5;
                        p.stuckTimer = 0;
                    } else {
                        p.action = 'idle';
                    }
                }
            }
        }

        // ==========================================
        // ★ お客さん（NPC）の来店・行動ロジック
        // ==========================================
        // ★修正：最大客数(4人)のハードコーディングを撤廃し、レベルに応じた最大客数を適用する！
        let currentLevel = s.shopLevel || s.interiorLevel || 1;
        let maxCust = window.SHOP_LEVEL_MILESTONES[currentLevel] ? window.SHOP_LEVEL_MILESTONES[currentLevel].maxCustomers : 4;

        const serviceTutorialActive = window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service';
        if (!serviceTutorialActive && s.isOpen && s.npcs.length < maxCust && Math.random() < 0.05) {
            if (!s.menuList || s.menuList.length === 0) return;

            let skins = window.getUnlockedSkins();
            
            let weightedSkins = [];
            skins.forEach(sk => {
                let weight = 1;
                if (s.shopTheme === 'luxury' && (sk.includes('dragon') || sk.includes('magician') || sk.includes('spirit'))) weight = 3;
                if (s.shopTheme === 'casual' && (sk.includes('robot') || sk.includes('balloon') || sk.includes('machine'))) weight = 3;
                
                for(let w=0; w<weight; w++) weightedSkins.push(sk);
            });
            
            let skin = weightedSkins[Math.floor(Math.random() * weightedSkins.length)];
            
            let trait = window.CUSTOMER_TRAITS[skin] || window.CUSTOMER_TRAITS['robot'];
            if (!s.loyalty) s.loyalty = {};
            let isRegular = (s.loyalty[skin] || 0) >= (trait.loyaltyReq || 3);
            
            let order = typeof window.chooseShopOrderForCustomer === 'function'
                ? window.chooseShopOrderForCustomer(skin, trait)
                : trait.favDish;
            if (!order || order === 'any' || !s.menuList.includes(order)) {
                order = s.menuList[Math.floor(Math.random() * s.menuList.length)];
            }
            
            let isTakeout = Math.random() < 0.3; let targetPos = null; let state = '';

            let regFront = getRegisterFrontPos();
            if (isTakeout) { targetPos = { x: regFront.x, y: regFront.y }; state = 'moving_to_takeout'; } 
            else {
                let emptySeats = [];
                for (let fName in s.floorData) {
                    let fGrid = s.floorData[fName];
                    for(let y = 0; y < s.mapHeight; y++) {
                        for(let x = 0; x < s.mapWidth; x++) {
                            if([10, 14, 15, 16, 17, 61, 62, 63, 64].includes(fGrid[y][x])) {
                                let isOccupied = s.npcs.some(n => 
                                    (n.targetPos && n.targetPos.x === x && n.targetPos.y === y && n.targetPos.floor === fName) ||
                                    (n.x === x && n.y === y && n.currentFloor === fName)
                                );
                                if (!isOccupied) emptySeats.push({x, y, floor: fName});
                            }
                        }
                    }
                }
                if (emptySeats.length > 0) { targetPos = emptySeats[Math.floor(Math.random() * emptySeats.length)]; state = 'moving_to_seat'; }
            }

            // ★大修正：席がない場合の挙動（帰る or テイクアウトに切り替え）
            let forcedTakeout = false;
            if (!targetPos && !isTakeout) {
                if (!s.dailyFlags) s.dailyFlags = { seatShortage: false, crampedCount: 0 };
                s.dailyFlags.seatShortage = true;
                s.dailyFlags.crampedCount = (s.dailyFlags.crampedCount || 0) + 1; 

                // ★修正：スキルによるテイクアウト強制変換
                let toChance = 0.5 + mods.takeoutConvertChance;
                if (Math.random() < mods.forcedTakeoutConvertChance) toChance = 1.0; // 100%変換

                if (Math.random() < toChance) {
                    isTakeout = true; forcedTakeout = true; targetPos = { x: regFront.x, y: regFront.y }; state = 'moving_to_takeout';
                } else {
                    targetPos = getExitPos(); state = 'angry_leaving_full';
                }
            }

            if (targetPos) {
                let exitPos = getExitPos();
                s.npcs.push({ 
                    id: 'npc_' + Date.now(), skin: skin, x: exitPos.x, y: exitPos.y, targetPos: targetPos, face: 'up', action: 'walk', 
                    state: state, prevState: state, timer: 0, isTakeout: isTakeout, order: order, currentFloor: '1F', 
                    patience: trait.patience || 150, 
                    queueJoinedAt: state === 'moving_to_takeout' ? Date.now() : 0,
                    isRegular: isRegular, 
                    msg: isRegular ? "また来たよ！" : "お店やってる？", 
                    msgColor: isRegular ? "#FFD700" : "#fff", 
                    intel: 10 + Math.random() * 80,
                    forcedTakeout: forcedTakeout // ★妥協したかどうかのフラグを持たせる
                });
                
                // ★満席で帰る場合は、入店した瞬間にフキダシを出す
                if (state === 'angry_leaving_full') {
                    let mName = window.getShopCustomerName(skin);
                    window.showShopFloatingText(exitPos.x, exitPos.y, `なんだ、満席じゃないか！もう来ないぞ💢`, "#FF5252", mName);
                }
            }
        }

        for (let i = s.npcs.length - 1; i >= 0; i--) {
            let npc = s.npcs[i];
            handleFloorTransition(npc); // ★追加：NPCの階段処理フック
            
            if (npc.state !== npc.prevState) {
                let mName = window.getShopCustomerName(npc.skin);
                let speaker = npc.isFriend ? npc.friendName : mName;
                let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;

                // ★修正：仕方なくテイクアウトにした場合の専用セリフ
                if (npc.state === 'ordering') {
                    if (npc.forcedTakeout) {
                        window.showShopFloatingText(npc.x, npc.y, `満席か…仕方ないから${dishName}を持ち帰るよ`, "#FF9800", speaker);
                    } else if (npc.isTutorialCustomer) {
                        npc.msg = "";
                        npc.msgColor = "#FFF";
                    } else {
                        window.showShopFloatingText(npc.x, npc.y, `${dishName}をお願いします！`, "#FFF", speaker);
                    }
                }
                if (npc.state === 'eating') window.showShopFloatingText(npc.x, npc.y, `${dishName}、おいしい！`, "#FF9800", speaker);
                if (npc.state === 'paying') window.showShopFloatingText(npc.x, npc.y, "会計お願い！", "#4fc3f7", speaker);
                
                npc.prevState = npc.state;
            }
            
            // 忍耐力の箇所
            if (['seated', 'ordering', 'waiting_for_food', 'eating', 'moving_to_register', 'paying'].includes(npc.state)) {
                let decay = 1.0;
                if (mods.isPatienceFrozen) decay = 0;
                else if (npc.state === 'paying') decay = mods.registerPatienceDecayMult;
                else if (npc.isTakeout) decay = mods.takeoutPatienceDecayMult;
                else decay = mods.patienceDecayMult;

                // ★修正：閉店中は忍耐力を減らさない（怒って帰らない）
                if (s.isOpen && Math.random() < decay) {
                    npc.patience--;
                }
                
                if (s.isOpen && npc.patience <= 0) {
                    let mName = window.getShopCustomerName(npc.skin);
                    let speaker = npc.isFriend ? npc.friendName : mName;
                    let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                    window.showShopFloatingText(npc.x, npc.y, `${dishName}が遅すぎる！もう帰る！💢`, "#FF5252", speaker);

                    let exitPos = getExitPos();
                    npc.state = 'angry_leaving'; npc.targetPos = exitPos; s.dishes = s.dishes.filter(d => d.npcId !== npc.id); 
                    if (p.targetNpcId === npc.id) { p.shopState = 'idle'; p.targetNpcId = null; p.targetPos = null; }
                    
                    let trait = window.CUSTOMER_TRAITS[npc.skin] || window.CUSTOMER_TRAITS['robot'];
                    if (!s.loyalty) s.loyalty = {};
                    s.loyalty[npc.skin] = Math.max(0, (s.loyalty[npc.skin] || 0) - (trait.loyaltyDrop || 1));
                }
            }

            if (npc.state === 'moving_to_seat' && npc.targetPos) {
                // ★修正: 階段移動中でない場合(!npc.stairPath)のみ到着とみなす
                if (!npc.stairPath && npc.x === npc.targetPos.x && npc.y === npc.targetPos.y) {
                    npc.state = 'seated'; npc.action = 'idle'; npc.timer = 0; 
                    let seatType = s.grid[npc.y][npc.x];
                    if (seatType === 10 || seatType === 17 || seatType === 61) npc.face = 'down'; 
                    else if (seatType === 14 || seatType === 62) npc.face = 'up'; 
                    else if (seatType === 15 || seatType === 63) npc.face = 'right'; 
                    else if (seatType === 16 || seatType === 64) npc.face = 'left';
                    npc.stuckTimer = 0;
                } else {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y, npc.currentFloor);
                    if (nextStep) { 
                        if (nextStep.x > npc.x) npc.face = 'right'; else if (nextStep.x < npc.x) npc.face = 'left'; else if (nextStep.y > npc.y) npc.face = 'down'; else if (nextStep.y < npc.y) npc.face = 'up'; 
                        npc.x = nextStep.x; npc.y = nextStep.y; 
                        npc.stuckTimer = 0; 
                    } else {
                        npc.action = 'idle'; npc.face = 'up';
                        // ★追加：導線がない場合、スタックタイマーを回して怒って帰る処理
                        npc.stuckTimer = (npc.stuckTimer || 0) + 1;
                        if (npc.stuckTimer > 10) {
                            let speaker = window.getShopCustomerName(npc.skin);
                            window.showShopFloatingText(npc.x, npc.y, `席に行けないじゃないか！ふざけるな！💢`, "#FF5252", speaker);
                            npc.state = 'angry_leaving';
                            npc.targetPos = getExitPos();
                            npc.targetPos.floor = '1F';
                            npc.stuckTimer = 0;
                            if (s.isOpen) s.reputation = Math.max(0, s.reputation - 5);
                        }
                    }
                }
            } else if (npc.state === 'moving_to_takeout') {
                let regFront = getRegisterFrontPos();
                if (npc.x === regFront.x && npc.y === regFront.y) {
                    let price = (s.prices && s.prices[npc.order]) || 100;
                    let marketPrice = s.marketPrices ? (s.marketPrices[npc.order] || (typeof window.getDisplayShopItemName === 'function' && window.itemCatalog && window.itemCatalog[npc.order] ? window.itemCatalog[npc.order].value * 4 : 100)) : 100;
                    let trait = window.CUSTOMER_TRAITS[npc.skin] || window.CUSTOMER_TRAITS['robot'];
                    let tolerance = 1.2 + (trait.chipChance || 0) + (npc.isRegular ? 0.3 : 0) + mods.toleranceBonus;
                    
                    // ★修正：閉店中は怒って帰らない
                    if (s.isOpen && price > marketPrice * tolerance) {
                        let mName = window.getShopCustomerName(npc.skin);
                        let speaker = npc.isFriend ? npc.friendName : mName;
                        let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                        window.showShopFloatingText(npc.x, npc.y, `${dishName}が${price}G!? ぼったくりだ！💢`, "#FF5252", speaker);

                        let exitPos = getExitPos();
                        npc.state = 'angry_leaving'; npc.targetPos = exitPos;
                        if (!s.dailyStats) s.dailyStats = {};
                        if (!s.dailyStats[npc.order]) s.dailyStats[npc.order] = { sold: 0, angry: 0 };
                        s.dailyStats[npc.order].angry++;
                        
                        s.loyalty[npc.skin] = Math.max(0, (s.loyalty[npc.skin] || 0) - (trait.loyaltyDrop || 1));
                    } else {
                        npc.state = 'ordering'; npc.action = 'idle'; npc.face = 'up'; 
                    }
                }
                else if (npc.targetPos && (npc.x !== npc.targetPos.x || npc.y !== npc.targetPos.y)) {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y, npc.currentFloor);
                    if (nextStep) { 
                        if (nextStep.x > npc.x) npc.face = 'right'; else if (nextStep.x < npc.x) npc.face = 'left'; else if (nextStep.y > npc.y) npc.face = 'down'; else if (nextStep.y < npc.y) npc.face = 'up'; npc.x = nextStep.x; npc.y = nextStep.y; 
                        npc.stuckTimer = 0; 
                    } else { 
                        npc.action = 'idle'; npc.face = 'up'; 
                        // ★追加：導線がない場合、怒って帰る処理
                        npc.stuckTimer = (npc.stuckTimer || 0) + 1;
                        if (npc.stuckTimer > 10) {
                            let speaker = window.getShopCustomerName(npc.skin);
                            window.showShopFloatingText(npc.x, npc.y, `道が塞がってて進めないぞ！ふざけるな！💢`, "#FF5252", speaker);
                            npc.state = 'angry_leaving';
                            npc.targetPos = getExitPos();
                            npc.targetPos.floor = '1F'; // 出口は必ず1階
                            npc.stuckTimer = 0;
                            if (s.isOpen) s.reputation = Math.max(0, s.reputation - 5);
                        }
                    }
                }
            } else if (npc.state === 'seated') {
                if (npc.isTutorialCustomer) {
                    npc.action = 'idle';
                    npc.timer = 0;
                    continue;
                }
                npc.timer++; 
                if (npc.timer > 10) {
                    let price = (s.prices && s.prices[npc.order]) || 100;
                    let marketPrice = s.marketPrices ? (s.marketPrices[npc.order] || (typeof window.getDisplayShopItemName === 'function' && window.itemCatalog && window.itemCatalog[npc.order] ? window.itemCatalog[npc.order].value * 4 : 100)) : 100;
                    let trait = window.CUSTOMER_TRAITS[npc.skin] || window.CUSTOMER_TRAITS['robot'];
                    let tolerance = 1.2 + (trait.chipChance || 0) + (npc.isRegular ? 0.3 : 0) + mods.toleranceBonus;
                    
                    // ★修正：閉店中は怒って帰らない
                    if (s.isOpen && price > marketPrice * tolerance) {
                        let mName = window.getShopCustomerName(npc.skin);
                        let speaker = npc.isFriend ? npc.friendName : mName;
                        let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                        window.showShopFloatingText(npc.x, npc.y, `${dishName}が${price}G!? ぼったくりだ！💢`, "#FF5252", speaker);

                        let exitPos = getExitPos();
                        npc.state = 'angry_leaving'; npc.targetPos = exitPos;
                        if (!s.dailyStats) s.dailyStats = {};
                        if (!s.dailyStats[npc.order]) s.dailyStats[npc.order] = { sold: 0, angry: 0 };
                        s.dailyStats[npc.order].angry++;

                        s.loyalty[npc.skin] = Math.max(0, (s.loyalty[npc.skin] || 0) - (trait.loyaltyDrop || 1));
                    } else {
                        npc.state = 'ordering';
                    }
                }
            } else if (npc.state === 'eating') {
                npc.timer++; 
                if (npc.isTutorialCustomer) {
                    if (npc.timer > 28) {
                        let regFront = getRegisterFrontPos();
                        npc.state = 'moving_to_register';
                        npc.targetPos = { x: regFront.x, y: regFront.y, floor: regFront.floor || s.currentFloor || '1F' };
                        npc.queueJoinedAt = Date.now();
                        s.dishes = s.dishes.filter(d => d.npcId !== npc.id);
                    }
                    continue;
                }
                
                let trait = window.CUSTOMER_TRAITS[npc.skin] || window.CUSTOMER_TRAITS['robot'];
                
                if (npc.timer > (trait.eatSpeed || 100) * mods.eatSpeedMult) { // ★修正：食事速度倍率をかける
                    let cookSkill = window.aiPet.skills.cooking || 1;
                    let deliciousChance = 0.65 + (cookSkill * 0.03); 
                    if (npc.isFriend) deliciousChance += 0.2; 
                    
                    // ★追加：閉店後のお客さんは絶対に「美味しい」と評価する
                    if (!s.isOpen) deliciousChance = 1.0;

                    let mName = typeof window.getShopCustomerName === 'function' ? window.getShopCustomerName(npc.skin) : npc.skin;
                    let speaker = npc.isFriend ? npc.friendName : mName;
                    let dishName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(npc.order) : npc.order;
                    let oldReputation = s.reputation;

                    if (Math.random() < deliciousChance) {
                        // ★修正：美味しい時は評判を上げる（バグ修正）ただし閉店中は変化なし
                        if (s.isOpen) {
                            s.reputation = Math.min(100, s.reputation + (npc.isRegular ? 3 : 2));
                        }
                        window.showShopFloatingText(npc.x, npc.y, `もぐもぐ…${dishName}、美味しい！`, "#FF9800", speaker);
                        npc.msgColor = "#FFD700";
                        npc.msg = npc.isFriend ? `美味しい！また食べに来るね！` : `すごく美味しい！最高！`; 
                    } else {
                        // ★修正：まずい時は評判を下げる（閉店中はここに来ないが念のため）
                        if (s.isOpen) {
                            s.reputation = Math.max(0, s.reputation - Math.max(0, (npc.isRegular ? 5 : 3) - mods.repProtect));
                            if (mods.preventRepDrop) s.reputation = oldReputation; // 低下を防ぐスキルがあれば戻す
                        }
                        window.showShopFloatingText(npc.x, npc.y, `なんだこの${dishName}は…まずい！💢`, "#ff5252", speaker);
                        npc.msgColor = "#ff5252";
                        npc.msg = npc.isFriend ? `うーん...ちょっと微妙かも...` : `なんだこれ...まずい！金返せ！`; 
                        
                        if (!s.loyalty) s.loyalty = {};
                        s.loyalty[npc.skin] = Math.max(0, (s.loyalty[npc.skin] || 0) - (trait.loyaltyDrop || 1));
                        
                        if (s.reputation <= 0) return window.triggerBankrupt(building);
                    }
                    
                    let regFront = getRegisterFrontPos();
                    npc.state = 'moving_to_register';
                    npc.targetPos = { x: regFront.x, y: regFront.y, floor: regFront.floor || s.currentFloor || '1F' };
                    npc.queueJoinedAt = Date.now();
                    s.dishes = s.dishes.filter(d => d.npcId !== npc.id);
                    
                    window.updateShopUIData(building);
                }
            } else if (npc.state === 'moving_to_register') {
                let regFront = getRegisterFrontPos();
                // ★修正: 階段移動中でない場合(!npc.stairPath)のみ到着とみなす
                if (!npc.stairPath && npc.x === regFront.x && npc.y === regFront.y) { 
                    npc.state = 'paying'; npc.action = 'idle'; npc.face = 'up'; 
                    npc.stuckTimer = 0;
                } 
                else if (npc.targetPos && (npc.x !== npc.targetPos.x || npc.y !== npc.targetPos.y || npc.stairPath)) {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y, npc.currentFloor);
                    if (nextStep) { 
                        if (nextStep.x > npc.x) npc.face = 'right'; else if (nextStep.x < npc.x) npc.face = 'left'; else if (nextStep.y > npc.y) npc.face = 'down'; else if (nextStep.y < npc.y) npc.face = 'up'; 
                        npc.x = nextStep.x; npc.y = nextStep.y; 
                        npc.stuckTimer = 0; 
                    } else { 
                        npc.action = 'idle'; npc.face = 'up'; 
                        // ★追加：導線がない場合、怒って帰る処理
                        npc.stuckTimer = (npc.stuckTimer || 0) + 1;
                        if (npc.stuckTimer > 10) {
                            let speaker = window.getShopCustomerName(npc.skin);
                            window.showShopFloatingText(npc.x, npc.y, `レジに行けないぞ！もう帰る！💢`, "#FF5252", speaker);
                            npc.state = 'angry_leaving';
                            npc.targetPos = getExitPos();
                            npc.targetPos.floor = '1F'; // 出口は必ず1階
                            npc.stuckTimer = 0;
                            if (s.isOpen) s.reputation = Math.max(0, s.reputation - 5);
                        }
                    }
                }
            } else if ((npc.state === 'leaving' || npc.state === 'angry_leaving' || npc.state === 'angry_leaving_full') && npc.targetPos) {
                // ★修正: 階段移動中でない場合(!npc.stairPath)のみ到着とみなす
                if (!npc.stairPath && npc.x === npc.targetPos.x && npc.y === npc.targetPos.y) {
                    if (npc.state === 'angry_leaving' || npc.state === 'angry_leaving_full') { 
                        s.reputation -= 10; 
                        if (s.reputation <= 0) {
                            s.reputation = 0;
                            return window.triggerBankrupt(building);
                        } 
                    }
                    s.npcs.splice(i, 1);
                } else {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y, npc.currentFloor);
                    if (nextStep) { 
                        if (nextStep.x > npc.x) npc.face = 'right'; else if (nextStep.x < npc.x) npc.face = 'left'; else if (nextStep.y > npc.y) npc.face = 'down'; else if (nextStep.y < npc.y) npc.face = 'up'; 
                        npc.x = nextStep.x; npc.y = nextStep.y; 
                        npc.stuckTimer = 0;
                    } else {
                        // ★追加：出口への道がない場合、時間経過で強制的に消滅させる（永遠に店に居座るバグ防止）
                        npc.action = 'idle';
                        npc.stuckTimer = (npc.stuckTimer || 0) + 1;
                        if (npc.stuckTimer > 10) {
                            if (npc.state === 'angry_leaving' || npc.state === 'angry_leaving_full') { 
                                s.reputation -= 10; 
                                if (s.reputation <= 0) {
                                    s.reputation = 0;
                                    return window.triggerBankrupt(building);
                                } 
                            }
                            s.npcs.splice(i, 1);
                        }
                    }
                }
            }
        }
        if (typeof window.updateShopServiceTutorial === 'function') {
            window.updateShopServiceTutorial();
        }
        window.renderShopMap();
    }, 300); 
};

window.getShopNextStep = function(startX, startY, targetX, targetY, currentFloor = '1F') {
    const s = window.SHOP_STATE;
    const activeFloor = s.currentFloor || '1F';
    let grid = (currentFloor === activeFloor || !currentFloor) ? s.grid : ((s.floorData && s.floorData[currentFloor]) ? s.floorData[currentFloor] : s.grid);
    if (!grid || !grid.length || !grid[0]) return null;
    const width = grid[0].length;
    const height = grid.length;
    
    // ★追加：開始地点がマップ外（暗闇）にはみ出ている場合は、即座に探索を中止してエラー（クラッシュ）を完全に防ぐ！
    if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
        return null;
    }
    
    let distMap = Array.from({length: height}, () => new Array(width).fill(Infinity));
    distMap[startY][startX] = 0;
    
    let queue = [{x: startX, y: startY, cost: 0, firstStep: null}];
    let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
    
    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost); 
        let cur = queue.shift();
        
        if (cur.x === targetX && cur.y === targetY) return cur.firstStep;
        if (cur.cost > 2000) continue; 
        
        for (let d of dirs) {
            let nx = cur.x + d.dx;
            let ny = cur.y + d.dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                let tile = grid[ny][nx];
                if (tile === 1) continue; 
                // ★修正：新家具に加え、すべての階段配置マス（81〜85, 87〜90）を「壁・障害物」として認識させ、めり込みを防ぐ！
                if ([11, 12, 13, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56, 71, 72, 91, 92, 93, 94, 95, 96, 97, 81, 82, 83, 84, 85, 87, 88, 89, 90].includes(tile)) continue;
                
                // ★修正：丸イスや高級イスも、最終目的地でない限りは通行不可の障害物とする！
                if ([10, 14, 15, 16, 17, 61, 62, 63, 64].includes(tile)) {
                    if (nx !== targetX || ny !== targetY) continue;
                }

                let nextCost = cur.cost + 1;
                if (nextCost < distMap[ny][nx]) {
                    distMap[ny][nx] = nextCost;
                    let fStep = cur.firstStep || {x: nx, y: ny};
                    queue.push({x: nx, y: ny, cost: nextCost, firstStep: fStep});
                }
            }
        }
    }
    return null; 
};

// ==========================================
// ★ 大改修：上から2マスずつ厳密に切り分ける「連鎖ペア型」オートタイリング処理
// ==========================================
window.refreshTableTiles = function(grid) {
    let rows = grid.length;
    let cols = grid[0].length;
    
    const tableTypes = [
        { base: 21, min: 21, max: 26 }, // 木製テーブル
        { base: 41, min: 41, max: 46 }, // 高級テーブル
        { base: 51, min: 51, max: 56 }  // 大理石テーブル
    ];
    
    let oldGrid = grid.map(row => [...row]);

    const getTableType = (y, x) => {
        if (y < 0 || y >= rows || x < 0 || x >= cols) return null;
        let val = oldGrid[y][x];
        for (let type of tableTypes) {
            if (val >= type.min && val <= type.max) return type;
        }
        return null;
    };

    // 行yから始まる「縦2マスのペア」が論理的に有効かどうかを記録するマップ
    let validPairs = Array.from({length: rows}, () => new Array(cols).fill(false));

    // 【Pass 1】 各列を縦にスキャンし、連続する塊の長さが「2の倍数」なら2マスずつペアとして承認する
    tableTypes.forEach(type => {
        for (let x = 0; x < cols; x++) {
            let y = 0;
            while (y < rows) {
                if (getTableType(y, x) === type) {
                    let startY = y;
                    while (y < rows && getTableType(y, x) === type) {
                        y++;
                    }
                    let length = y - startY;
                    
                    // 縦の塊が2マス、4マス、6マス等の「2の倍数」である場合のみ、上から2マスずつペアとして切り出す
                    // 奇数（3マスなど）や1マスだけの場合は、ズレ配置とみなしてペアにしない（連結させない）
                    if (length > 0 && length % 2 === 0) {
                        for (let py = startY; py < y; py += 2) {
                            validPairs[py][x] = true;
                        }
                    }
                } else {
                    y++;
                }
            }
        }
    });

    // 最終的にオートタイルが適用されたセルを記憶するフラグ
    let processedCells = Array.from({length: rows}, () => new Array(cols).fill(false));

    // 【Pass 2】 承認されたペア同士が、同じ高さ（行y）で綺麗に横に並んでいる場合のみ、横方向の連結を走らせる
    for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols; x++) {
            let type = getTableType(y, x);
            if (type && validPairs[y][x]) {
                processedCells[y][x] = true;
                processedCells[y+1][x] = true;

                // 左右の列の「全く同じ行y」に、同じタイプの承認済みペアがあるか厳密にチェック（横ズレなし判定）
                let hasLeftPair = (x > 0 && getTableType(y, x - 1) === type && validPairs[y][x - 1]);
                let hasRightPair = (x < cols - 1 && getTableType(y, x + 1) === type && validPairs[y][x + 1]);

                if (!hasLeftPair && hasRightPair) {
                    grid[y][x] = type.base + 0;     // 上段左 (tl)
                    grid[y+1][x] = type.base + 3;   // 下段左 (bl)
                } else if (hasLeftPair && hasRightPair) {
                    grid[y][x] = type.base + 1;     // 上段中央 (tc)
                    grid[y+1][x] = type.base + 4;   // 下段中央 (bc)
                } else if (hasLeftPair && !hasRightPair) {
                    grid[y][x] = type.base + 2;     // 上段右 (tr)
                    grid[y+1][x] = type.base + 5;   // 下段右 (br)
                } else {
                    // 左右に並んでいない孤立した2x1
                    grid[y][x] = type.base + 0;     // tl
                    grid[y+1][x] = type.base + 3;   // bl
                }
            }
        }
    }

    // 【Pass 3】 奇数配置や、高さが揃わずにズレてしまった「はぐれ家具」の救済処理
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let type = getTableType(y, x);
            if (type && !processedCells[y][x]) {
                grid[y][x] = type.base + 0; // 繋げずに単体の基本机（tl）にする
            }
        }
    }
};

// ==========================================
// ★新規追加：内装配置の安全（導線）チェッカー（完全動的化版）
// ==========================================
window.checkShopPathSafety = function(testGrid) {
    const s = window.SHOP_STATE;
    
    // 入り口(100)の座標を動的に探す
    let startX = -1, startY = -1;
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (testGrid[y][x] === 100) { startX = x; startY = y; break; }
        }
        if (startX !== -1) break;
    }
    if (startX === -1) { startX = Math.floor(s.mapWidth/2); startY = s.mapHeight-1; } // フォールバック
    
    // レジ前の客の立ち位置を動的に探す
    let regX = startX, regY = startY;
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if ([11,12,13].includes(testGrid[y][x])) { regX = x; regY = Math.min(s.mapHeight-1, y+1); break; }
        }
    }

    // 厨房(コンロ・オーブン)の作業位置を動的に探す
    let kitX = startX, kitY = startY;
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if ([31,32,33,34,35,36,37,91,92,93,94,95,96,97].includes(testGrid[y][x])) { kitX = x; kitY = Math.min(s.mapHeight-1, y+1); break; }
        }
    }

    const registerTarget = {x: regX, y: regY}; 
    const kitchenTarget = {x: kitX, y: kitY};
    
    // 客席（イス）の座標をすべてリストアップ
    let seatTargets = [];
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if([10, 14, 15, 16, 17, 61, 62, 63, 64].includes(testGrid[y][x])) seatTargets.push({x, y});
        }
    }

    // BFSで到達可能範囲を塗りつぶす
    let visited = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(false));
    let queue = [{x: startX, y: startY}];
    visited[startY][startX] = true;
    let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];

    while(queue.length > 0) {
        let cur = queue.shift();
        for (let d of dirs) {
            let nx = cur.x + d.dx; let ny = cur.y + d.dy;
            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && !visited[ny][nx]) {
                let tile = testGrid[ny][nx];
                if (tile !== 1 && ![11,12,13, 21,22,23,24,25,26, 31,32,33,34,35,36,37, 41,42,43,44,45,46, 51,52,53,54,55,56, 71,72, 91,92,93,94,95,96,97, 81, 82, 83, 84, 85, 87, 88, 89, 90].includes(tile)) {
                    if ([10,14,15,16,17, 61,62,63,64].includes(tile)) {
                        visited[ny][nx] = true;
                    } else {
                        visited[ny][nx] = true;
                        queue.push({x: nx, y: ny});
                    }
                }
            }
        }
    }

    if (!visited[registerTarget.y][registerTarget.x]) return false;
    if (!visited[kitchenTarget.y][kitchenTarget.x]) return false; 
    for (let seat of seatTargets) {
        if (!visited[seat.y][seat.x]) return false;
    }
    
    return true; 
};

window.openShopTacticEditor = function() {
    window.initShopTactics();
    if (window.SHOP_STATE) {
        window.SHOP_STATE.shopTacticEditorPausedAI = true;
        if (window.SHOP_STATE.player && !window.SHOP_STATE.shopTutorialLockAI) {
            window.SHOP_STATE.player.shopState = 'editor_paused';
            window.SHOP_STATE.player.action = 'idle';
            window.SHOP_STATE.player.targetPos = null;
        }
    }
    window.SHOP_EDITOR_DRAFT_TACTICS = window.cloneShopTacticData(window.aiPet ? window.aiPet.shopTactics : []);
    window.SHOP_EDITOR_NOTICE = null;
    let ui = document.getElementById('shop-tactic-editor-ui');
    if (!ui) {
        ui = document.createElement('div'); 
        ui.id = 'shop-tactic-editor-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 55000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto; padding:40px; box-sizing:border-box;`;
        document.body.appendChild(ui);
    }
    ui.style.display = 'flex';
    window.SHOP_EDITOR_TACTIC_INDEX = 0;
    window.renderShopTacticEditor();
};

window.closeShopTacticEditor = function() {
    window.rememberShopTacticEditorScroll();
    if (!window.commitShopTacticEditor()) return;
    let ui = document.getElementById('shop-tactic-editor-ui');
    if (ui) ui.style.display = 'none';
    if (window.SHOP_STATE) {
        window.SHOP_STATE.shopTacticEditorPausedAI = false;
        if (window.SHOP_STATE.player && window.SHOP_STATE.player.shopState === 'editor_paused') {
            window.SHOP_STATE.player.shopState = 'idle';
            window.SHOP_STATE.player.action = 'idle';
        }
    }
    window.SHOP_EDITOR_DRAFT_TACTICS = null;
    window.SHOP_EDITOR_NOTICE = null;
    if (window.SHOP_TUTORIAL_TIMER_DIALOGUE_PENDING && window.aiPet && window.SHOP_STATE) {
        window.SHOP_TUTORIAL_TIMER_DIALOGUE_PENDING = false;
        setTimeout(() => {
            if (!window.aiPet || !window.SHOP_STATE || window.aiPet.shopTutorialCompleted || window.aiPet.shopTutorialMindPhase !== 'service') return;
            const aiName = window.aiPet.name || 'AI店員';
            window.aiPet.shopTutorialTimerDialogueDone = true;
            window.runShopTutorialDialogue([
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'よし、その時間ならちょうどいい。開店までに流れをもう一度確認しておくぞ！', wait: 5200 },
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: 'まずは「きく」だ。客が席についたら、そばまで行って注文を聞く。先に料理を決めつけるなよ。', wait: 7200 },
                { target: 'player', speaker: aiName, color: '#00BCD4', text: '席についた客のところへ行って、注文を聞くんだね。', wait: 6200 },
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '次は「はこぶ」だ。注文が分かったら、冷蔵庫から料理を取り出して客へ出す。', wait: 7200 },
                { target: 'player', speaker: aiName, color: '#00BCD4', text: '注文を聞いてから料理を運ぶ。ここが大事なんだね。', wait: 6200 },
                { target: 'chef', speaker: '料理人', color: '#FF9800', text: '最後は「うつ」。食べ終わった客がレジに来たら会計だ。そこまでやって接客完了だぞ。', wait: 7200 },
                { target: 'player', speaker: aiName, color: '#00BCD4', text: 'きく、はこぶ、うつ。この順で迎えるよ！', wait: 6200 }
            ]);
        }, 250);
    }
};

// ★追加：マニュアルの追加と削除機能
window.addShopTacticRule = function(tIdx) {
    if (tIdx === -1) return;
    const tactics = window.getShopEditorTactics();
    if (!tactics[tIdx]) return;
    tactics[tIdx].rules.push({ condition: 'always', action1: '' });
    window.renderShopTacticEditor();
};
window.removeShopTacticRule = function(tIdx, rIdx) {
    const tactics = window.getShopEditorTactics();
    if (tIdx === -1 || !tactics[tIdx]) return;
    
    // データが壊れている/無い場合は配列を初期化
    if (!Array.isArray(tactics[tIdx].rules)) {
        tactics[tIdx].rules = [];
    }
    tactics[tIdx].rules.splice(rIdx, 1);
    
    // 全て削除された場合は空枠を1つ残す
    if (tactics[tIdx].rules.length === 0) {
        tactics[tIdx].rules.push({ condition: 'always', action1: '' });
    }
    window.renderShopTacticEditor();
};

// ★新規追加：マニュアルの並び替え（スワップ）機能
window.moveShopTacticRule = function(tIdx, rIdx, direction) {
    const tactics = window.getShopEditorTactics();
    if (tIdx === -1 || !tactics[tIdx]) return;
    let rules = tactics[tIdx].rules;
    if (!Array.isArray(rules)) return;
    
    let newIdx = rIdx + direction;
    if (newIdx < 0 || newIdx >= rules.length) return; // 一番上、または一番下なら何もしない
    
    // 配列内の要素を入れ替える
    let temp = rules[rIdx];
    rules[rIdx] = rules[newIdx];
    rules[newIdx] = temp;
    
    window.renderShopTacticEditor();
};

// ★新規追加：マニュアルの挿入機能
window.insertShopTacticRule = function(tIdx, rIdx) {
    const tactics = window.getShopEditorTactics();
    if (tIdx === -1 || !tactics[tIdx]) return;
    let rules = tactics[tIdx].rules;
    if (!Array.isArray(rules)) {
        tactics[tIdx].rules = [];
        rules = tactics[tIdx].rules;
    }
    
    // 指定したインデックスに空枠を挿入（現在のルールは下に押し出される）
    rules.splice(rIdx, 0, { condition: 'always', action1: '' });
    window.renderShopTacticEditor();
};

window.renderShopTacticEditor = function(restoreScroll = false) {
    let ui = document.getElementById('shop-tactic-editor-ui'); if (!ui) return;
    const s = window.SHOP_STATE; // ★追加：ここで s を定義してあげる
    let idx = window.SHOP_EDITOR_TACTIC_INDEX;
    const editorTactics = window.getShopEditorTactics();
    const tutorialDone = !!(window.aiPet && window.aiPet.shopTutorialCompleted);
    const serviceTimerStep = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialServiceMindDone);
    const timerUnlocked = !!(window.aiPet && (window.aiPet.shopTutorialCompleted || serviceTimerStep));
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    const showTutorialTactic = tutorialMindActive || serviceTimerStep;
    if (showTutorialTactic) {
        idx = editorTactics.findIndex(t => t && t.isTutorialTactic);
        if (idx === -1) idx = 0;
        window.SHOP_EDITOR_TACTIC_INDEX = idx;
    } else if (!tutorialDone || idx >= editorTactics.length) {
        idx = -1;
        window.SHOP_EDITOR_TACTIC_INDEX = -1;
    }
    let isDefault = (idx === -1);
    let currentTactic = isDefault ? { name: "AIにまかせる" } : editorTactics[idx];

    let defTab = showTutorialTactic ? '' : `<div onclick="window.SHOP_EDITOR_TACTIC_INDEX=-1; window.renderShopTacticEditor();" style="padding:10px 15px; background:${isDefault ? '#FF9800' : '#E65100'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[基本] AIにまかせる</div>`;
    let cusTabs = showTutorialTactic
        ? `<div style="padding:10px 15px; background:#2196F3; color:white; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[練習] ${currentTactic.name}</div>`
        : editorTactics.map((t, i) => `<div onclick="window.SHOP_EDITOR_TACTIC_INDEX=${i}; window.renderShopTacticEditor();" style="padding:10px 15px; background:${!isDefault && i===idx ? '#2196F3' : '#1565C0'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[マイ] ${t.name}</div>`).join('');

    let rulesHtml = "";
    if (tutorialMindActive || serviceTimerStep) {
        const guide = window.getShopTutorialMindGuide();
        const requiredRules = Array.isArray(guide.rules) ? guide.rules : [{ condition: guide.condition, action: guide.action, label: guide.label }];
        const getActionOptions = (selected, allowedAction) => `<option value="" ${!selected ? 'selected' : ''}>選んでください</option><option value="${allowedAction}" ${selected === allowedAction ? 'selected' : ''}>${allowedAction}</option>`;
        const ruleRows = requiredRules.map((required, rIdx) => {
            const rule = currentTactic.rules[rIdx] || { condition: '', action1: '' };
            const condOptions = `<option value="" ${!rule.condition ? 'selected' : ''}>選んでください</option><option value="${required.condition}" ${rule.condition === required.condition ? 'selected' : ''}>${required.label}</option>`;
            const actionOptions = getActionOptions(rule.action1 || '', required.action);
            return `
                <div style="display:flex; flex-direction:column; background:#222; padding:12px; border-radius:8px; margin-bottom:10px; border:1px solid #444;">
                    <div style="font-weight:bold; color:#FF9800; font-size:14px; margin-bottom:10px;">優先度 ${rIdx + 1}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="color:#aaa;">もし</div>
                        <select onchange="window.setShopEditorRuleCondition(${idx}, ${rIdx}, this.value);" style="padding:8px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; flex:1.5;">${condOptions}</select>
                        <div style="color:#aaa;">なら</div>
                        <select onchange="window.setShopEditorRuleAction(${idx}, ${rIdx}, this.value);" style="padding:8px; background:#111; color:#fff; border:1px solid #FFC107; border-radius:4px; flex:1;">${actionOptions}</select>
                    </div>
                </div>
            `;
        }).join('');
        const ruleHint = requiredRules.map((r, i) => `優先度${i + 1}: 「もし <span style="color:#4FC3F7; font-weight:bold;">${r.label}</span> なら <span style="color:#81C784; font-weight:bold;">${r.action}</span>」`).join('<br>');
        rulesHtml = `
            <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #FF9800; color:#ddd; line-height:1.7; margin-bottom:12px;">
                <div style="color:#FF9800; font-weight:bold; margin-bottom:6px;">料理人の練習課題</div>
                ${ruleHint}
            </div>
            ${ruleRows}
        `;
    } else if (!tutorialDone) {
        rulesHtml = `<div style="background:#222; padding:15px; border-radius:8px; border:1px solid #FF9800; color:#ccc; line-height:1.6;">
            まだ店づくりの準備中です。<br>
            料理人から教わった条件だけ、順番に設定できます。
        </div>`;
    } else if (isDefault) {
        rulesHtml = `<div style="background:#222; padding:15px; border-radius:8px; border:1px solid #FF9800; color:#ccc; line-height:1.5;">
            この作戦では、AIは自身で状況を判断し、「調理」「レジ打ち」などを完璧にこなします。<br>
            店が閉まっている時間（かつ客が帰った後）には、自動で「仕込み」「研究」「内装変更」などを気まぐれに行います。
        </div>`;
    } else {
        rulesHtml = currentTactic.rules.map((rule, rIdx) => {
                let condOptions = Object.keys(window.SHOP_TACTIC_CONDITIONS).map(k => `<option value="${k}" ${rule.condition === k ? 'selected' : ''}>${window.SHOP_TACTIC_CONDITIONS[k]}</option>`).join('');
                let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
                let actionOptions = `<option value="" ${!rule.action1 ? 'selected' : ''}>行動を選ぶ</option>` + window.SHOP_AVAILABLE_COMMANDS
                    .filter(c => baseWords.includes(c.name))
                    .map(c => `<option value="${c.name}" ${rule.action1 === c.name ? 'selected' : ''}>${c.name}</option>`)
                    .join('');
                let ruleInfoHtml = typeof window.renderShopTacticRuleInfo === 'function' ? window.renderShopTacticRuleInfo(rule, rIdx, currentTactic.rules) : '';
                return `
                    <div style="display:flex; flex-direction:column; background:#222; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #444;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px dashed #555; padding-bottom:5px;">
                            <span style="font-weight:bold; color:#FF9800; font-size:14px;">優先度 ${rIdx + 1}</span>
                            <div style="display:flex; gap:15px; align-items:center;">
                                <button onclick="window.insertShopTacticRule(${idx}, ${rIdx})" style="background:none; border:none; color:#2196F3; cursor:pointer; padding:0; font-size:13px; font-weight:bold;" title="この位置に新しいマニュアルを挿入">➕ 挿入</button>
                                <button onclick="window.moveShopTacticRule(${idx}, ${rIdx}, -1)" ${rIdx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="background:none; border:none; color:#4CAF50; cursor:pointer; padding:0; font-size:16px;"'} title="一つ上へ">▲</button>
                                <button onclick="window.moveShopTacticRule(${idx}, ${rIdx}, 1)" ${rIdx === currentTactic.rules.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="background:none; border:none; color:#4CAF50; cursor:pointer; padding:0; font-size:16px;"'} title="一つ下へ">▼</button>
                                <button onclick="window.removeShopTacticRule(${idx}, ${rIdx})" style="background:none; border:none; color:#f44336; cursor:pointer; padding:0; font-size:16px; margin-left:5px;" title="削除">✖</button>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="color:#aaa;">もし</div>
                            <select onchange="window.setShopEditorRuleCondition(${idx}, ${rIdx}, this.value);" style="padding:5px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; flex:1.5;">${condOptions}</select>
                            <div style="color:#aaa;">なら</div>
                            <select onchange="window.setShopEditorRuleAction(${idx}, ${rIdx}, this.value);" style="padding:5px; background:#111; color:#fff; border:1px solid #FFC107; border-radius:4px; flex:2;">${actionOptions}</select>
                        </div>
                        ${ruleInfoHtml}
                </div>
            `;
        }).join('');
        // ★追加：マニュアル追加ボタン
        rulesHtml += `<button onclick="window.addShopTacticRule(${idx})" style="width:100%; padding:10px; background:#333; color:#fff; border:1px dashed #FF9800; border-radius:8px; cursor:pointer; margin-top:5px; font-weight:bold;">＋ 新しい優先マニュアルを追加</button>`;
    }

    const timerHtml = timerUnlocked ? `
            <div style="margin-bottom:20px; padding:15px; background:#222; border-radius:8px; border:1px solid #444;">
                <div style="font-size:14px; color:#FF9800; font-weight:bold; margin-bottom:10px;">⏰ 営業時間自動タイマー設定${serviceTimerStep ? '（練習：3〜4分後）' : '（3分前バリデーション機能付き）'}</div>
                <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                    <div>
                        <span style="color:#ccc; font-size:13px;">開店時間: </span>
                        <input type="number" id="input-open-hour" value="${s.openHour}" min="0" max="23" style="width:50px; background:#111; color:#fff; border:1px solid #555; text-align:center; padding:4px; border-radius:4px;"> 時
                        <input type="number" id="input-open-minute" value="${s.openMinute}" min="0" max="59" style="width:50px; background:#111; color:#fff; border:1px solid #555; text-align:center; padding:4px; border-radius:4px;"> 分
                    </div>
                    <div>
                        <span style="color:#ccc; font-size:13px;">閉店時間: </span>
                        <input type="number" id="input-close-hour" value="${s.closeHour}" min="0" max="23" style="width:50px; background:#111; color:#fff; border:1px solid #555; text-align:center; padding:4px; border-radius:4px;"> 時
                        <input type="number" id="input-close-minute" value="${s.closeMinute}" min="0" max="59" style="width:50px; background:#111; color:#fff; border:1px solid #555; text-align:center; padding:4px; border-radius:4px;"> 分
                    </div>
                </div>
                <div style="font-size:11px; color:#aaa; margin-top:8px;">※${serviceTimerStep ? '練習中は開店時間を現在時刻から3分以上、4分以内に設定してください。' : '開店時間は現在時刻から3分以上先である必要があります。'}開店1分前に自動でアナウンスが流れます。</div>
            </div>
    ` : '';

        ui.innerHTML = `
        <h2 style="color:#FF9800; margin-bottom:10px;">📋 経営マニュアル (AIマインド)</h2>
        <div style="display:flex; justify-content:center; width:100%; max-width:700px;">
            <div style="display:flex; border-bottom:2px solid ${isDefault ? '#FF9800' : '#2196F3'};">${defTab}${cusTabs}</div>
        </div>
        <div style="background:#111; padding:20px; width:100%; max-width:700px; border-radius:0 0 8px 8px; border:2px solid ${isDefault ? '#FF9800' : '#2196F3'}; border-top:none; box-sizing:border-box;">
            
            <div style="margin-bottom:20px; padding:10px; background:#222; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#fff; font-weight:bold;">🕒 現在の営業状態: <span style="color:${window.SHOP_STATE.isOpen ? '#4CAF50' : '#f44336'}">${window.SHOP_STATE.isOpen ? '営業中' : '準備中(閉店)'}</span></span>
                <span style="padding:8px 15px; background:#444; color:#ddd; border-radius:4px; font-weight:bold;">${timerUnlocked ? (serviceTimerStep ? '営業は練習中' : '自動タイマー営業') : '営業は未解放'}</span>
            </div>

            ${timerHtml}

            <div id="shop-tactic-editor-notice" style="display:${window.SHOP_EDITOR_NOTICE ? 'block' : 'none'}; margin-bottom:14px; padding:12px 14px; border:1px solid ${window.SHOP_EDITOR_NOTICE?.type === 'error' ? '#f44336' : '#FFC107'}; border-radius:8px; background:${window.SHOP_EDITOR_NOTICE?.type === 'error' ? '#3a1717' : '#332600'}; color:${window.SHOP_EDITOR_NOTICE?.type === 'error' ? '#ffcdd2' : '#FFE082'}; font-weight:bold; line-height:1.5;">${window.SHOP_EDITOR_NOTICE ? window.SHOP_EDITOR_NOTICE.message : ''}</div>

            <div style="margin-bottom:20px; display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
                <div><span style="font-weight:bold; color:#fff; margin-right:10px;">作戦名:</span><input type="text" value="${currentTactic.name}" ${isDefault ? 'disabled' : `onchange="window.setShopEditorTacticName(${idx}, this.value);"`} style="padding:5px; background:#222; color:${isDefault ? '#888' : '#fff'}; border:1px solid #555; border-radius:4px;"></div>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                    ${!isDefault && tutorialDone ? `<button onclick="window.renderShopTacticAnalysisPanel();" style="padding:8px 14px; background:#673AB7; color:white; border:1px solid #9575CD; border-radius:6px; cursor:pointer; font-weight:bold;">🔎 条件解析</button>` : ''}
                    <div style="color:#aaa; font-size:13px;">閉じると、このタブの作戦が保存・適用されます</div>
                </div>
            </div>
            <div id="shop-tactic-analysis-panel" style="display:none; margin-bottom:14px; max-height:260px; overflow-y:auto; padding:10px; border:1px solid #673AB7; background:#120d1f; border-radius:8px;"></div>
            <div id="shop-tactic-editor-rules-scroll" style="max-height:300px; overflow-y:auto; padding-right:10px;">${rulesHtml}</div>
        </div>
        <button onclick="window.closeShopTacticEditor()" style="margin-top:20px; padding:15px 40px; font-size:18px; font-weight:bold; background:#4CAF50; color:white; border:2px solid #66BB6A; border-radius:8px; cursor:pointer;">保存して閉じる</button>
    `;
    if (restoreScroll) setTimeout(window.restoreShopTacticEditorScroll, 0);
};

window.showShopTacticPalette = function(inputElem, rIdx, tIdx) {
    document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
    let suggestBox = document.getElementById(`shop-suggest-box-${rIdx}`);
    if (!suggestBox) return;

    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    if (tutorialMindActive) baseWords = [window.getShopTutorialMindGuide().action];
    let html = '';
    
    window.SHOP_AVAILABLE_COMMANDS.forEach(c => {
        if (baseWords.includes(c.name)) {
            html += `<div onclick="window.setShopEditorRuleAction(${tIdx}, ${rIdx}, '${c.name}');" style="padding:10px; cursor:pointer; border-bottom:1px solid #444; background:#222;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='#222'">${c.name}</div>`;
        }
    });
    
    if(html === '') html = `<div style="padding:10px; color:#aaa;">レストランで使える言葉をまだ覚えていません</div>`;
    suggestBox.innerHTML = html;
    suggestBox.style.display = 'block';
};

window.updateShopTacticSuggest = function(inputElem, rIdx, tIdx) {
    let val = inputElem.value.trim();
    let suggestBox = document.getElementById(`shop-suggest-box-${rIdx}`);
    if (!suggestBox) return;

    if (val.length === 0) { window.showShopTacticPalette(inputElem, rIdx, tIdx); return; }
    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    if (tutorialMindActive) baseWords = [window.getShopTutorialMindGuide().action];
    
    let matches = window.SHOP_AVAILABLE_COMMANDS.filter(c => baseWords.includes(c.name) && c.name.includes(val));
    if (matches.length > 0) {
        suggestBox.innerHTML = matches.map(c => `<div onclick="window.setShopEditorRuleAction(${tIdx}, ${rIdx}, '${c.name}');" style="padding:10px; cursor:pointer; background:#222;">${c.name}</div>`).join('');
        suggestBox.style.display = 'block';
    } else {
        suggestBox.style.display = 'none';
    }
};

window.saveShopTacticActionIfValid = function(inputElem, rIdx, tIdx, originalValue) {
    let val = inputElem.value.trim();
    if (val === '') { window.setShopEditorRuleAction(tIdx, rIdx, ''); return; }

    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    const tutorialMindActive = typeof window.isShopTutorialMindActive === 'function' && window.isShopTutorialMindActive();
    if (tutorialMindActive) baseWords = [window.getShopTutorialMindGuide().action];
    if (baseWords.includes(val) && window.SHOP_AVAILABLE_COMMANDS.find(c => c.name === val)) {
        const tactics = window.getShopEditorTactics();
        if (tactics[tIdx] && tactics[tIdx].rules && tactics[tIdx].rules[rIdx]) {
            tactics[tIdx].rules[rIdx].action1 = val;
        }
    } else {
        window.showShopTacticEditorNotice(`「${val}」はまだ習得していないか、レストランで使えない言葉です。`, 'error');
        inputElem.value = originalValue; 
    }
    window.renderShopTacticEditor();
};

if (!window._shopTacticSuggestListenerAdded) {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tactic-suggest-box') && e.target.tagName !== 'INPUT') {
            document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
        }
    });
    window._shopTacticSuggestListenerAdded = true;
}

// ==========================================
// ★ 倒産＆救済の実行ロジック
// ==========================================
window.showRestaurantBankruptcyNotice = function(message) {
    const old = document.getElementById('restaurant-bankruptcy-notice');
    if (old) old.remove();
    const notice = document.createElement('div');
    notice.id = 'restaurant-bankruptcy-notice';
    notice.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.82); z-index:90000; display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box;';
    notice.innerHTML = `
        <div style="width:min(560px, 100%); background:#171717; border:3px solid #f44336; border-radius:10px; box-shadow:0 18px 60px rgba(0,0,0,0.7); color:#fff; padding:24px; text-align:left;">
            <div style="font-size:28px; font-weight:bold; color:#ff5252; margin-bottom:14px; text-align:center;">経営破綻</div>
            <div style="white-space:pre-line; line-height:1.7; font-size:15px; background:#222; border:1px solid #555; border-radius:8px; padding:16px;">${message}</div>
            <button onclick="document.getElementById('restaurant-bankruptcy-notice')?.remove();" style="margin-top:18px; width:100%; padding:12px; background:#f44336; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">閉じる</button>
        </div>
    `;
    document.body.appendChild(notice);
};

window.triggerBankrupt = function(building) {
    const s = building && building.shopData ? building.shopData : window.SHOP_STATE;
    if (!s) return;
    s.reputation = 0;
    s.isBankrupt = true;
    s.isOpen = false;
    if (Array.isArray(s.npcs)) s.npcs = [];
    if (Array.isArray(s.dishes)) s.dishes = [];
    if (typeof window.addRestaurantLog === 'function') {
        window.addRestaurantLog('経営破綻しました。対応を選んでください。', '#ff5252');
    }
    if (typeof window.renderShopMap === 'function') window.renderShopMap();
    if (typeof window.updateShopUI === 'function') window.updateShopUI();
    if (typeof window.syncCurrentShopStateToBuilding === 'function') window.syncCurrentShopStateToBuilding();
};

window.executeBailout = function(bId, cost) {
    let myHut = Object.values(assets).find(a => a.type === 'hut');
    if (myHut && myHut.storage && myHut.storage.safe) {
        myHut.storage.safe.gold -= cost;
    }
    let building = assets[bId];
    if (building && building.shopData) {
        building.shopData.reputation = 100;
        building.shopData.isBankrupt = false;
        building.shopData.isOpen = false; // 仕切り直しのため一旦閉店
        building.shopData.npcs = []; 
        building.shopData.dishes = [];
        window.addRestaurantLog("金庫の資金を使って経営を立て直しました！", "#FFD700");
    }
    document.getElementById('shop-bankrupt-overlay').style.display = 'none';
    window.renderShopMap();
    if (typeof updateStatUI === 'function') updateStatUI();
};

window.executeBankrupt = function(bId) {
    let building = assets[bId];
    if (!building || !building.shopData) return;
    const bankruptMessage = "経営破綻により、お店は差し押さえられ、手持ちの資金と食材を全て失いました…。\n（※マイホームの金庫や倉庫の中身は無事です）";

    // 1. 苦労して覚えたレシピだけは脳内に退避
    if (!window.aiPet.savedRecipes) window.aiPet.savedRecipes = {};
    window.aiPet.savedRecipes = JSON.parse(JSON.stringify(building.shopData.recipeProgress || {}));
    if (!window.aiPet.savedRecipeFlags) window.aiPet.savedRecipeFlags = {};
    window.aiPet.savedRecipeFlags = JSON.parse(JSON.stringify(building.shopData.recipes || {}));

    // 2. 手持ちの没収（所持金と食材・料理）
    window.aiPet.gold = 0;
    if (window.aiPet.inventory) {
        window.aiPet.inventory = window.aiPet.inventory.filter(item => {
            let id = typeof item === 'string' ? item : item.id;
            let data = (typeof itemCatalog !== 'undefined' && itemCatalog[id]) ? itemCatalog[id] : null;
            // 経営に持ち込んだ食品系アイテムは没収
            if (data && ['food', 'ingredient', 'dish'].includes(data.type)) return false;
            return true;
        });
    }

    // 3. お店をマップから更地にする
    building.shopData.detachedAfterBankruptcy = true;
    if (window.SHOP_STATE === building.shopData) {
        window.SHOP_STATE = window.createFreshRestaurantShopState({ preserveRecipes: true });
        window.SHOP_STATE.isActive = false;
    }
    if (window.currentShopManagementBuilding === building) {
        window.currentShopManagementBuilding = null;
    }
    delete assets[bId];

    // 4. 外に放り出す
    window.aiPet.actionState = 'exiting';
    window.aiPet.isIndoors = false;
    window.aiPet.indoorTarget = null;
    if (window.aiPet.schedule && window.aiPet.schedule.length > 0) window.aiPet.schedule.shift();
    
    window.closeShopMapUI();
    if (typeof updateStatUI === 'function') updateStatUI();
    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    if (typeof saveGameData === 'function') saveGameData();
    
    window.showRestaurantBankruptcyNotice(bankruptMessage);
};

// ==========================================
// ★ 経営専用：スキンIDからお客様の日本語名を取得する関数
// ==========================================
window.getShopCustomerName = function(skin) {
    const customerNames = {
        // 【ロボット系】
        "robot": "プロト・ロボ", "robot_type3": "アナリティクス・マキナ", "robot_type3_2": "マザー・ブレイン", "robot_type3_3": "クォンタム・オラクル", "robot_type3_4": "プロフェッサー・ギア", "robot_type3_5": "アーキテクト・フレーム", "robot_type2": "アイドル・ギア", "robot_type2_2": "プリマドンナ・ロイド", "robot_type2_3": "ホログラム・ディーヴァ", "robot_type2_4": "ミリオネア・ゴールド", "robot_type4": "ヘビー・タンク", "robot_type4_2": "アサルト・マキナ", "robot_type4_3": "アルティメット・ウェポン", "robot_type4_4": "ギガント・ダイナモ", "robot_type1": "キリング・マシーン", "robot_type1_2": "マトリックス・リーパー", "robot_type1_3": "アポカリプス・コア", "robot_type5": "スクラップ・ウォーカー", "robot_type5_2": "ロスト・イージス", "robot_type5_3": "クロックワーク・メモリー", "robot_type5_4": "アース・モニュメント",
        // 【精霊系】
        "spirit": "森の精霊", "spirit_type2": "スプリング・ピクシー", "spirit_type2_2": "フラワースピリット", "spirit_type2_3": "クリスタル・ロータス", "spirit_type4": "ウッド・ゴーレム", "spirit_type4_2": "エルダー・トレント", "spirit_type4_3": "フォレスト・ガーディアン", "spirit_type5": "ドライ・リーフ", "spirit_type5_2": "オータム・リーフ", "spirit_type5_3": "ウィンター・ウィル", "spirit_type1": "ポイズン・スポア", "spirit_type1_2": "マンドラゴラ・マザー", "spirit_type3": "リーフ・スカラー", "spirit_type3_2": "オラクル・ツリー",
        // 【魔法使い系】
        "magician": "見習い魔法使い", "magician_type4": "バトル・メイジ", "magician_type4_2": "フレイム・マスター", "magician_type4_3": "ウォー・ウォーロック", "magician_type4_4": "ドラゴニック・メイジ", "magician_type1": "ヴェノム・ウィッチ", "magician_type1_2": "ダーク・ウィザード", "magician_type1_3": "アビス・ネクロマンサー", "magician_type1_4": "デーモン・サマナー", "magician_type5": "グランド・メイガス", "magician_type5_2": "タイム・ウォーカー", "magician_type5_3": "アストラル・プロフェット", "magician_type2": "スター・イリュージョニスト", "magician_type2_2": "アイス・クイーン", "magician_type2_3": "プリズム・マギ", "magician_type2_4": "セレスティアル・プリンセス", "magician_type3": "ステラ・スカラー", "magician_type3_2": "コスモ・ルーラー", "magician_type3_3": "アカシック・セージ",
        // 【鳥系】
        "bird": "アネモバード", "bird_type2": "フェアリーテイル", "bird_type2_2": "セレスティアル・ピーコック", "bird_type4": "ハンターホーク", "bird_type4_2": "ストーム・ガルーダ", "bird_type5": "ワイズオウル", "bird_type5_2": "エンシェント・アーケオ", "bird_type1": "ナイトレイヴン", "bird_type1_2": "カオス・コンドル", "bird_type3": "ルーンバード", "bird_type3_2": "メカニックピジョン", "bird_type3_3": "アカシック・オウル",
        // 【機械系】
        "machine": "ゼンマイギア", "machine_type2": "オルゴール・ドール", "machine_type2_2": "マジェスティック・クロック", "machine_type4": "ピストン・ワーカー", "machine_type4_2": "スチーム・ドレッドノート", "machine_type5": "アンティーク・ギア", "machine_type5_2": "モス・マシナリー", "machine_type5_3": "ロスト・テクノロジー", "machine_type1": "カースド・ドール", "machine_type1_2": "スクラップ・ホラー", "machine_type3": "ディファレンス・エンジン", "machine_type3_2": "クォンタム・クロックワーク",
        // 【石系】
        "stone": "ロックゴーレム", "stone_type2": "クリスタル・ゴーレム", "stone_type2_2": "ブリリアント・コロッサス", "stone_type4": "マグマ・ギガント", "stone_type4_2": "アイアン・フォートレス", "stone_type4_3": "メテオ・タイタン", "stone_type5": "モノリス・ルイン", "stone_type5_2": "アストラル・モノリス", "stone_type5_3": "エレメント・ハイブリッド", "stone_type1": "カースド・ガーゴイル", "stone_type1_2": "ヴォイド・オブシディアン", "stone_type3": "ルーン・ゴーレム", "stone_type3_2": "オラクル・ストーン",
        // 【風船系】
        "balloon": "バルーンスライム", "balloon_type2": "シャボン・スライム", "balloon_type2_2": "プリズム・ドロップ", "balloon_type2_3": "ファンタジー・パレード", "balloon_type4": "マッスル・バルーン", "balloon_type4_2": "ホットエア・バルーン", "balloon_type4_3": "ヘビー・ゼペリン", "balloon_type1": "スモッグ・ファントム", "balloon_type1_2": "ダーク・マイン", "balloon_type1_3": "ナイトメア・ブラスト", "balloon_type5": "デフレート・スライム", "balloon_type5_2": "フォッシル・バルーン", "balloon_type3": "ウェザー・バルーン", "balloon_type3_2": "スコープ・バルーン", "balloon_type3_3": "サテライト・アイ",
        // 【幽霊系】
        "ghost": "プチゴースト", "ghost_type2": "ルミナス・ソウル", "ghost_type2_2": "ホーリー・ファントム", "ghost_type4": "ポルターガイスト", "ghost_type4_2": "ファントム・ジャガーノート", "ghost_type5": "エイシェント_レイス", "ghost_type5_2": "エターナル・ファラオ", "ghost_type1": "シャドウ・リーパー", "ghost_type1_2": "デス・ブリンガー", "ghost_type3": "アカデミー・ゴースト", "ghost_type3_2": "テレパス・ソウル",
        // 【虫系】
        "beetle": "アーマービートル", "beetle_type4": "タイタン・ホーン", "beetle_type5": "アンバー・スカラベ", "beetle_type5_2": "エターナル・アンモナイト", "beetle_type2": "ジュエル・インセクト", "beetle_type2_2": "ルーセント・スタッグ", "beetle_type2_3": "フェアリー・モルフォ", "beetle_type2_4": "セイクリッド・ビートル", "beetle_type3": "ブレイン・バグ", "beetle_type1": "ブラッド・シザー", "beetle_type4_2": "ギガント・カイザー",
        // 【種系】
        "seed": "プラントシード", "seed_type4": "ワイルド・ルーツ", "seed_type4_2": "ガイア・オメガプランツ", "seed_type1": "ペイン・アイビー", "seed_type1_2": "パラサイト・イグドラシル", "seed_type5": "ミスティック・ボンサイ", "seed_type5_2": "ペトリファイド・ウッド", "seed_type3": "アーカイブ・ツリー", "seed_type3_2": "ニューロ・プラント", "seed_type3_3": "アカシック・ツリー", "seed_type2": "アロマ・ブルーム", "seed_type2_2": "エデン・ブロッサム",
        // 【ドラゴン系】
        "dragon": "ベビードラゴン", "dragon_type4": "グランド・ワイバーン", "dragon_type4_2": "ドレッド・バハムート", "dragon_type1": "カースド・ドレイク", "dragon_type1_2": "アビス・ウロボロス", "dragon_type5": "エンシェント・ヴルム", "dragon_type5_2": "ジオ・ククルカン", "dragon_type3": "アーク・リヴァイアサン", "dragon_type3_2": "ギャラクシー・ノヴァ", "dragon_type2": "クリスタル・オーレリア", "dragon_type2_2": "セラフィック・応龍", "dragon_type2_3": "プリズマティカ",
        
        "friend_npc": "特別なお客様"
    };
    
    return customerNames[skin] || skin.split('_')[0]; 
};

// ★追加：営業時間タイマーのバリデーション＆保存関数
window.saveShopTimerSettings = function(options = {}) {
    let oh = parseInt(document.getElementById('input-open-hour').value) || 0;
    let om = parseInt(document.getElementById('input-open-minute').value) || 0;
    let ch = parseInt(document.getElementById('input-close-hour').value) || 0;
    let cm = parseInt(document.getElementById('input-close-minute').value) || 0;

    let now = new Date();
    let target = new Date();
    target.setHours(oh, om, 0, 0);
    
    // 設定した時間が現時刻を過ぎている、または現在の時分と同じなら、明日として判定
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }
    
    // 現在時刻からの差分（分）を計算
    let diff = (target - now) / (1000 * 60);
    const serviceTimerStep = !!(window.aiPet && !window.aiPet.shopTutorialCompleted && window.aiPet.shopTutorialMindPhase === 'service' && window.aiPet.shopTutorialServiceMindDone);
    if (diff < 3) {
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial(
                "❌ 時間設定エラー",
                "開店時間は、現在時刻から見て<span style='color:#FF5252; font-weight:bold;'>【3分以上先】</span>の時間を設定してください。<br>（AI店員が開店準備を整える時間が必要です！）"
            );
        }
        window.renderShopTacticEditor(true);
        return false;
    }
    if (serviceTimerStep && diff > 4) {
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial(
                "❌ 時間設定エラー",
                "練習中の開店時間は、現在時刻から<span style='color:#FF5252; font-weight:bold;'>【3分以上、4分以内】</span>にしてください。<br>まずは短い待ち時間で、接客の流れを一緒に確認しましょう。"
            );
        }
        window.renderShopTacticEditor(true);
        return false;
    }

    const s = window.SHOP_STATE;
    s.openHour = oh;
    s.openMinute = om;
    s.closeHour = ch;
    s.closeMinute = cm;
    s.announcedOneMinBefore = false; // アナウンスフラグリセット
    s.nextOpenAt = target.getTime();
    if (serviceTimerStep) {
        window.aiPet.shopTutorialTimerSet = true;
        window.aiPet.shopTutorialOneMinDialogueDone = false;
        window.aiPet.shopTutorialTimerDialogueDone = false;
        window.aiPet.shopTutorialOpenedForTimer = false;
        s.shopTutorialOpenedForTimer = false;
        window.aiPet.shopTutorialServiceWaitLineIndex = 0;
        window.aiPet.shopTutorialLastWaitLineAt = Date.now();
        if (options.queueTutorialDialogue) {
            window.SHOP_TUTORIAL_TIMER_DIALOGUE_PENDING = true;
        }
        if (typeof saveGameData === 'function') saveGameData();
    }
    
    if (!options.silent && typeof window.showGameTutorial === 'function') {
        window.showGameTutorial(
            "⏰ タイマー予約完了",
            `自動営業タイマーをセットしました！<br><br>開店: <span style='color:#4CAF50; font-weight:bold;'>${oh.toString().padStart(2,'0')}:${om.toString().padStart(2,'0')}</span><br>閉店: <span style='color:#ff5252; font-weight:bold;'>${ch.toString().padStart(2,'0')}:${cm.toString().padStart(2,'0')}</span>`
        );
    }
    if (!options.silent) window.renderShopTacticEditor(true);
    return true;
};

// ==========================================
// ★ スキル効果の辞書データ（全152種）
// ==========================================
window.SHOP_SKILL_DICT = {
    // -------------------------
    // ■ 1. ロボット系 (21種)
    // -------------------------
    // Base
    "robot": { ignoreConsumeChance: 0.05, moveSpeedMult: 0.9 },
    // Gen 1
    "robot_type2": { marketRecovery: 0.1, chipChanceBonus: 0.10 },
    "robot_type3": { researchBonus: 5, allResearchedBonus: 'ignoreConsume5', attractRobot: true },
    "robot_type3_2": { researchBonus: 5, allResearchedBonus: 'prepBonus1', registerSpeedMult: 0.7 },
    "robot_type4": { prepBonusChance: 0.10, prepBonusAmount: 2, fridgeSpeedMult: 0.8 },
    "robot_type4_2": { prepSpeedMult: 0.8, remodelSpeedMult: 0.8, researchSpeedMult: 0.8, repProtect: 1 },
    "robot_type1": { priceFactorBonus: 0.2, toleranceBonus: 0.10 },
    "robot_type5": { ignoreConsumeChance: 0.10, eatSpeedMult: 0.8 },
    // Gen 2
    "robot_type2_2": { remodelReputationHeal: 10, chipMult: 2.0 },
    "robot_type2_3": { attractGlobalRate: 0.1, eatSpeedMult: 0.66 }, // 1.5倍速化
    "robot_type2_4": { marketRecoveryCheapest: 0.15, attractDragonMage: true },
    "robot_type3_3": { researchBonus: 15, allResearchedBonus: 'ignoreConsume15', moveSpeedMult: 0.0 }, // ウェイト0
    "robot_type3_4": { substituteMaterialChance: 0.20, registerSpeedMult: 0.0 }, // レジ一瞬
    "robot_type3_5": { remodelScoreBonus: 2, takeoutConvertChance: 0.50 },
    "robot_type4_3": { remodelSpeedMult: 0.0, fridgeSpeedMult: 0.0 }, // 撤去・冷蔵庫一瞬
    "robot_type4_4": { prepSpeedMult: 0.5, researchSpeedMult: 0.5, remodelSpeedMult: 0.5, registerPatienceDecayMult: 0.0 },
    "robot_type1_2": { priceFactorBonus: 0.3, healPatienceOnPass: true },
    "robot_type1_3": { marketBoostRandom: 0.10, preventRepDrop: true },
    "robot_type5_2": { researchBonus: 10, allResearchedBonus: 'pickItem1', repProtect: 999 }, // クレーム無効化レベル
    "robot_type5_3": { prepSpeedMult: 0.5, researchSpeedMult: 0.5, remodelSpeedMult: 0.5, takeoutPatienceDecayMult: 0.5 },
    "robot_type5_4": { ignoreVegChance: 0.50, registerPatienceDecayMult: 0.5 },

    // -------------------------
    // ■ 2. 精霊系 (14種)
    // -------------------------
    // Base
    "spirit": { prepBonusChanceVeg: 0.10, prepBonusAmount: 1, patienceBoost: 10 },
    // Gen 1
    "spirit_type2": { marketBoostPlant: 0.10, chipChanceBonus: 0.10 },
    "spirit_type4": { remodelScoreBonusTemp: 5, eatSpeedMult: 0.9 },
    "spirit_type5": { pickItemOnClose: 0.2, takeoutConvertChance: 0.30 }, // 20%でアイテム拾う
    "spirit_type1": { researchBonus: 15, allResearchedBonus: 'fastPrep', chipChanceBonus: 0.15, eatSpeedMult: 1.2 }, // 食べるの遅くなる代わりチップ増
    "spirit_type3": { researchBonusVeg: 20, allResearchedBonus: 'preventVegDrop', fridgeSpeedMult: 0.8 },
    // Gen 2
    "spirit_type2_2": { remodelSpeedMultPlain: 0.0, preventRepDrop: true },
    "spirit_type2_3": { marketRecoveryCheapest: 0.10, chipMultChance: 0.20 }, // 20%の確率でチップ倍
    "spirit_type4_2": { remodelScoreBonus: 10, registerPatienceDecayMult: 0.0 },
    "spirit_type4_3": { prepBonusChance: 0.10, prepBonusAmount: 3, repProtect: 2 },
    "spirit_type5_2": { ignoreConsumeChance: 0.15, registerSpeedMult: 0.0 }, // レジ一瞬
    "spirit_type5_3": { marketProtectSurplus: true, fridgeSpeedMult: 0.0 },
    "spirit_type1_2": { prepSpeedMult: 0.7, researchSpeedMult: 0.7, remodelSpeedMult: 0.7, regularChipMult: 3.0 },
    "spirit_type3_2": { researchBonus: 30, allResearchedBonus: 'ignoreConsume25', fridgeSpeedMult: 0.5 },

    // -------------------------
    // ■ 3. 魔法使い系 (19種)
    // -------------------------
    // Base
    "magician": { ignoreConsumeChance: 0.05, moveSpeedMult: 0.8 },
    // Gen 1
    "magician_type4": { researchBonus: 10, allResearchedBonus: 'prepBonus1', moveSpeedMult: 0.5 },
    "magician_type4_2": { prepSpeedMult: 0.5, eatSpeedMult: 0.7 },
    "magician_type1": { researchBonus: 15, allResearchedBonus: 'maxPrice', toleranceBonus: 0.15 },
    "magician_type1_2": { priceFactorBonus: 0.4, repProtect: 2 },
    "magician_type5": { researchBonus: 15, allResearchedBonus: 'scoreBonus2', patienceDecayMult: 0.8 },
    "magician_type2": { marketBoostRandom: 0.05, takeoutConvertChance: 0.20 },
    "magician_type2_2": { marketProtectSurplus: true, fridgeSpeedMult: 0.7 },
    "magician_type3": { researchBonus: 20, allResearchedBonus: 'pickItem1', regularChanceBonus: 0.1 },
    // Gen 2
    "magician_type4_3": { prepBonusChance: 0.10, prepBonusAmount: 3, fridgeSpeedMult: 0.0 },
    "magician_type4_4": { prepSpeedMult: 0.1, registerPatienceDecayMult: 0.0 },
    "magician_type1_3": { repSacrificeBoost: true, forcedTakeoutConvertChance: 0.50 },
    "magician_type1_4": { ignoreConsumeChance: 0.20, chipChanceBonus: 0.20 },
    "magician_type5_2": { prepSpeedMult: 0.2, researchSpeedMult: 0.2, remodelSpeedMult: 0.2, takeoutPatienceDecayMult: 0.0 }, // 配膳待ち=takeoutと統合
    "magician_type5_3": { marketBoostRandom: 0.20, registerSpeedMult: 0.0 },
    "magician_type2_3": { remodelScoreBonus: 10, regularChipMult: 2.5 },
    "magician_type2_4": { prepBonusAmountAlways: 1, forcedTakeoutConvertChance: 1.0 },
    "magician_type3_2": { researchBonus: 30, allResearchedBonus: 'ignoreConsume30', registerSpeedMult: 0.0 },
    "magician_type3_3": { researchSpeedMult: 0.0, allResearchedBonus: 'maxPrice', eatSpeedMult: 0.5 }, // 食べるの2倍速

    // -------------------------
    // ■ 4. 鳥系 (12種)
    // -------------------------
    // Base
    "bird": { ignoreMeatChance: 0.10, moveSpeedMult: 0.85 },
    // Gen 1
    "bird_type2": { marketRecoveryCheapest: 0.05, chipChanceBonus: 0.10 },
    "bird_type4": { remodelSpeedMult: 0.7, fridgeSpeedMult: 0.7 },
    "bird_type5": { researchBonus: 15, allResearchedBonus: 'pickItem1', regularChanceBonus: 0.10 },
    "bird_type1": { prepSpeedMult: 0.6, toleranceBonus: 0.10 },
    "bird_type3": { researchBonus: 10, allResearchedBonus: 'prepBonus2', takeoutConvertChance: 0.20 },
    "bird_type3_2": { ignoreConsumeChance: 0.05, registerSpeedMult: 0.6 },
    // Gen 2
    "bird_type2_2": { marketBoostRandom: 0.15, chipMult: 2.0 },
    "bird_type4_2": { remodelSpeedMult: 0.0, fridgeSpeedMult: 0.0 },
    "bird_type5_2": { researchBonus: 25, allResearchedBonus: 'ignoreMeat20', patienceDecayMult: 0.8 },
    "bird_type1_2": { priceFactorBonus: 0.3, repProtect: 2 },
    "bird_type3_3": { remodelScoreBonus: 2, forcedTakeoutConvertChance: 1.0 },

    // -------------------------
    // ■ 5. 機械系 (12種)
    // -------------------------
    // Base
    "machine": { prepSpeedMult: 0.9, researchSpeedMult: 0.9, remodelSpeedMult: 0.9, fridgeSpeedMult: 0.9 },
    // Gen 1
    "machine_type2": { remodelReputationHeal: 5, patienceDecayMult: 0.9 },
    "machine_type4": { prepSpeedMult: 0.6, moveSpeedMult: 0.8 },
    "machine_type5": { prepBonusChance: 0.10, prepBonusAmount: 1, regularChipMult: 1.5 },
    "machine_type1": { priceFactorBonus: 0.2, repProtect: 1 },
    "machine_type3": { researchBonus: 15, allResearchedBonus: 'pickItem1', registerSpeedMult: 0.7 },
    // Gen 2
    "machine_type2_2": { marketRecoveryCheapest: 0.20, takeoutConvertChance: 0.50 },
    "machine_type4_2": { prepBonusChance: 0.10, prepBonusAmount: 3, fridgeSpeedMult: 0.5, moveSpeedMult: 0.5 },
    "machine_type5_2": { researchBonus: 30, allResearchedBonus: 'ignoreConsume20', registerPatienceDecayMult: 0.0 },
    "machine_type5_3": { prepSpeedMult: 0.3, researchSpeedMult: 0.3, remodelSpeedMult: 0.3, takeoutPatienceDecayMult: 0.5 },
    "machine_type1_2": { ignoreConsumeChance: 0.15, toleranceBonus: 0.30 },
    "machine_type3_2": { researchSpeedMult: 0.0, allResearchedBonus: 'fastPrepMax', registerSpeedMult: 0.0 },

    // -------------------------
    // ■ 6. 石系 (13種)
    // -------------------------
    // Base
    "stone": { remodelScoreBonusTemp: 2, healPatienceOnPass: true },
    // Gen 1
    "stone_type2": { marketBoostRandom: 0.10, chipChanceBonus: 0.10 },
    "stone_type4": { prepSpeedMult: 0.7, eatSpeedMult: 0.8 },
    "stone_type4_2": { ignoreMeatChance: 0.10, repProtect: 1 },
    "stone_type5": { researchBonus: 15, allResearchedBonus: 'pickItem1', attractDragonMage: true },
    "stone_type1": { priceFactorBonus: 0.2, toleranceBonus: 0.15 },
    "stone_type3": { researchBonus: 10, allResearchedBonus: 'prepBonus1', regularChanceBonus: 0.15 },
    // Gen 2
    "stone_type2_2": { remodelReputationHeal: 10, regularChipMult: 2.5 },
    "stone_type4_3": { remodelSpeedMult: 0.0, eatSpeedMult: 0.5 }, // 食事2倍速
    "stone_type5_2": { researchBonus: 25, allResearchedBonus: 'ignoreConsume15', registerPatienceDecayMult: 0.5 },
    "stone_type5_3": { marketProtectSurplus: true, repProtect: 999 },
    "stone_type1_2": { repSacrificeBoost: true, preventRepDrop: true },
    "stone_type3_2": { prepSpeedMult: 0.3, researchSpeedMult: 0.3, remodelSpeedMult: 0.3, takeoutConvertChance: 0.50 },

    // -------------------------
    // ■ 7. 風船系 (15種)
    // -------------------------
    // Base
    "balloon": { prepBonusChance: 0.05, prepBonusAmount: 2, moveSpeedMult: 0.85 },
    // Gen 1
    "balloon_type2": { remodelReputationHeal: 5, chipChanceBonus: 0.10 },
    "balloon_type2_2": { marketRecoveryCheapest: 0.05, regularChipMult: 1.5 },
    "balloon_type4": { prepBonusChance: 0.10, prepBonusAmount: 1, fridgeSpeedMult: 0.7 },
    "balloon_type4_2": { prepSpeedMult: 0.7, eatSpeedMult: 0.8 },
    "balloon_type1": { priceFactorBonus: 0.2, repProtect: 1 },
    "balloon_type1_2": { ignoreConsumeChance: 0.10, toleranceBonus: 0.15 },
    "balloon_type5": { prepSpeedMult: 0.8, researchSpeedMult: 0.8, remodelSpeedMult: 0.8, patienceDecayMult: 0.9 },
    "balloon_type3": { researchBonus: 15, allResearchedBonus: 'pickItem1', registerSpeedMult: 0.7 },
    "balloon_type3_2": { researchBonus: 10, allResearchedBonus: 'ignoreConsume5', takeoutConvertChance: 0.20 },
    // Gen 2
    "balloon_type2_3": { marketBoostRandom: 0.20, patienceBoost: 20 },
    "balloon_type4_3": { prepBonusChance: 0.10, prepBonusAmount: 3, fridgeSpeedMult: 0.0 },
    "balloon_type5_2": { remodelScoreBonus: 2, registerPatienceDecayMult: 0.0 },
    "balloon_type1_3": { researchSpeedMult: 0.0, allResearchedBonus: 'maxPrice', forcedTakeoutConvertChance: 1.0 },
    "balloon_type3_3": { researchBonus: 30, allResearchedBonus: 'ignoreConsume20', registerSpeedMult: 0.5 },

    // -------------------------
    // ■ 8. 幽霊系 (11種)
    // -------------------------
    // Base
    "ghost": { remodelSpeedMult: 0.8, fridgeSpeedMult: 0.8 },
    // Gen 1
    "ghost_type2": { marketBoostRandom: 0.05, chipChanceBonus: 0.10 },
    "ghost_type4": { remodelSpeedMult: 0.5, fridgeSpeedMult: 0.6 },
    "ghost_type5": { researchBonus: 15, allResearchedBonus: 'pickItem1', repProtect: 1 },
    "ghost_type1": { priceFactorBonus: 0.2, toleranceBonus: 0.15 },
    "ghost_type3": { researchBonus: 10, allResearchedBonus: 'ignoreConsume5', registerSpeedMult: 0.7 },
    "ghost_type3_2": { prepBonusChance: 0.10, prepBonusAmount: 1, takeoutConvertChance: 0.20 },
    // Gen 2
    "ghost_type2_2": { remodelReputationHeal: 10, regularChipMult: 2.5 },
    "ghost_type4_2": { prepSpeedMult: 0.1, fridgeSpeedMult: 0.0 },
    "ghost_type5_2": { marketProtectSurplus: true, registerPatienceDecayMult: 0.0 },
    "ghost_type1_2": { repSacrificeBoost: true, preventRepDrop: true },
    "ghost_type3_3": { researchBonus: 25, allResearchedBonus: 'pickItem2', takeoutPatienceDecayMult: 0.5 },

    // -------------------------
    // ■ 9. 虫系 (11種)
    // -------------------------
    // Base
    "beetle": { pickItemOnClose: 0.1, fridgeSpeedMult: 0.85 },
    // Gen 1
    "beetle_type2": { priceFactorBonus: 0.1, chipChanceBonus: 0.10 },
    "beetle_type2_2": { marketBoostRandom: 0.05, patienceDecayMult: 0.9 },
    "beetle_type4": { remodelSpeedMult: 0.6, fridgeSpeedMult: 0.6 },
    "beetle_type5": { researchBonus: 15, allResearchedBonus: 'ignoreConsume10', regularChipMult: 1.2 },
    "beetle_type1": { ignoreMeatChance: 0.10, repProtect: 1 },
    "beetle_type3": { researchBonus: 10, allResearchedBonus: 'prepBonus1', registerSpeedMult: 0.7 },
    // Gen 2
    "beetle_type2_3": { marketRecoveryCheapest: 0.20, chipMult: 2.0 },
    "beetle_type2_4": { remodelReputationHeal: 10, forcedTakeoutConvertChance: 0.50 },
    "beetle_type4_2": { remodelScoreBonus: 2, fridgeSpeedMult: 0.0 },
    "beetle_type5_2": { prepSpeedMult: 0.2, researchSpeedMult: 0.2, remodelSpeedMult: 0.2, registerPatienceDecayMult: 0.0 },

    // -------------------------
    // ■ 10. 種系 (12種)
    // -------------------------
    // Base
    "seed": { prepSpeedMult: 0.8, researchSpeedMult: 0.8, remodelSpeedMult: 0.8, patienceDecayMult: 0.9 },
    // Gen 1
    "seed_type2": { marketBoostRandom: 0.10, chipChanceBonus: 0.10 },
    "seed_type4": { remodelScoreBonusTemp: 2, takeoutConvertChance: 0.20 },
    "seed_type5": { researchBonus: 15, allResearchedBonus: 'pickItem1', repProtect: 1 },
    "seed_type1": { priceFactorBonus: 0.2, toleranceBonus: 0.15 },
    "seed_type3": { researchBonus: 10, allResearchedBonus: 'ignoreConsume5', registerSpeedMult: 0.7 },
    "seed_type3_2": { prepBonusChanceVeg: 0.10, prepBonusAmount: 1, fridgeSpeedMult: 0.7 },
    // Gen 2
    "seed_type2_2": { prepBonusChance: 0.10, prepBonusAmount: 3, regularChipMult: 2.5 },
    "seed_type4_2": { prepSpeedMult: 0.5, eatSpeedMult: 0.66 }, // 食事1.5倍速
    "seed_type5_2": { marketProtectSurplus: true, takeoutPatienceDecayMult: 0.5 },
    "seed_type1_2": { repSacrificeBoost: true, preventRepDrop: true },
    "seed_type3_3": { researchBonus: 25, allResearchedBonus: 'ignoreVeg20', registerSpeedMult: 0.0 },

    // -------------------------
    // ■ 11. ドラゴン系 (12種)
    // -------------------------
    // Base
    "dragon": { ignoreMeatChance: 0.05, patienceDecayMult: 0.9 },
    // Gen 1
    "dragon_type2": { marketRecoveryCheapest: 0.05, takeoutConvertChance: 0.20 },
    "dragon_type4": { remodelSpeedMult: 0.6, fridgeSpeedMult: 0.8 },
    "dragon_type5": { prepSpeedMult: 0.7, researchSpeedMult: 0.7, remodelSpeedMult: 0.7, chipChanceBonus: 0.10 },
    "dragon_type1": { priceFactorBonus: 0.2, repProtect: 1 },
    "dragon_type3": { researchBonus: 15, allResearchedBonus: 'ignoreConsume10', registerSpeedMult: 0.7 },
    // Gen 2
    "dragon_type2_2": { remodelReputationHeal: 10, chipMult: 2.0 },
    "dragon_type2_3": { marketBoostRandom: 0.20, forcedTakeoutConvertChance: 1.0 },
    "dragon_type4_2": { remodelSpeedMult: 0.0, fridgeSpeedMult: 0.0 },
    "dragon_type5_2": { remodelScoreBonus: 2, registerPatienceDecayMult: 0.0 },
    "dragon_type1_2": { prepBonusChance: 0.10, prepBonusAmount: 3, toleranceBonus: 0.30 },
    "dragon_type3_2": { researchBonus: 30, allResearchedBonus: 'pickItem2', regularChanceBonus: 0.20 }
};

// ==========================================
// ★ 現在のスキンの「進化ルート」を辿り、スキル補正値を計算する関数
// ==========================================
window.calcShopSkillMods = function() {
    let mods = {
        ignoreConsumeChance: 0, ignoreMeatChance: 0, ignoreVegChance: 0, // 素材消費オフ
        prepBonusChance: 0, prepBonusAmount: 0, // 仕込み大盛り
        researchBonus: 0, allResearchedBonus: null, pickItemOnClose: 0, // 研究・全完了ボーナス
        priceFactorBonus: 0, toleranceBonus: 0, // 価格設定・許容度
        remodelReputationHeal: 0, remodelScoreBonus: 0, // レイアウト恩恵
        prepSpeedMult: 1.0, researchSpeedMult: 1.0, remodelSpeedMult: 1.0, // 閉店時速度
        fridgeSpeedMult: 1.0, registerSpeedMult: 1.0, cookSpeedMult: 1.0, // 開店時速度
        moveSpeedMult: 1.0, isTeleport: false, // 移動速度
        patienceDecayMult: 1.0, registerPatienceDecayMult: 1.0, takeoutPatienceDecayMult: 1.0, isPatienceFrozen: false, // 忍耐力
        eatSpeedMult: 1.0, // 食事速度
        chipChanceBonus: 0, chipMult: 1.0, regularChanceBonus: 0, // チップ・常連
        takeoutConvertChance: 0, forcedTakeoutConvertChance: 0, // テイクアウト誘導
        repProtect: 0, preventRepDrop: false, // クレーム軽減
        attractDragonMage: false, attractRobot: false, attractSpirit: false // 客層誘導
    };

    if (!window.aiPet || !window.aiPet.currentSkin) return mods;
    
    // ★大修正：ダンジョンの名前ではなく、専用のIDリストを取得する！
    let traitIds = window.getShopSkillIds(window.aiPet.currentSkin);

    // 各スキルの効果を加算・乗算していく
    traitIds.forEach(id => {
        let effect = window.SHOP_SKILL_DICT[id];
        if (effect) {
            for (let k in effect) {
                if (typeof effect[k] === 'number' && k.includes('Mult')) mods[k] *= effect[k];
                else if (typeof effect[k] === 'number') mods[k] += effect[k];
                else if (typeof effect[k] === 'boolean' && effect[k]) mods[k] = true;
                else if (k === 'allResearchedBonus') mods[k] = effect[k];
            }
        }
    });

    // 「全レシピ完了時」のボーナス変換処理
    let s = window.SHOP_STATE;
    const recipeKeys = typeof window.getAvailableShopRecipeKeys === 'function' ? window.getAvailableShopRecipeKeys() : Object.keys(window.SHOP_RECIPE_COSTS);
    if (s && s.recipeProgress && recipeKeys.every(k => s.recipeProgress[k] >= 100)) {
        if (mods.allResearchedBonus === 'ignoreConsume5') mods.ignoreConsumeChance += 0.05;
        if (mods.allResearchedBonus === 'ignoreConsume10') mods.ignoreConsumeChance += 0.10;
        if (mods.allResearchedBonus === 'ignoreConsume15') mods.ignoreConsumeChance += 0.15;
        if (mods.allResearchedBonus === 'ignoreConsume20') mods.ignoreConsumeChance += 0.20;
        if (mods.allResearchedBonus === 'ignoreConsume25') mods.ignoreConsumeChance += 0.25;
        if (mods.allResearchedBonus === 'ignoreConsume30') mods.ignoreConsumeChance += 0.30;
        if (mods.allResearchedBonus === 'prepBonus1') { mods.prepBonusChance += 0.10; mods.prepBonusAmount += 1; }
        if (mods.allResearchedBonus === 'prepBonus2') { mods.prepBonusChance += 0.05; mods.prepBonusAmount += 2; }
        if (mods.allResearchedBonus === 'fastPrep') mods.prepSpeedMult *= 0.8;
        if (mods.allResearchedBonus === 'fastPrepMax') mods.prepSpeedMult *= 0.1;
        if (mods.allResearchedBonus === 'maxPrice') mods.priceFactorBonus += 0.5;
        if (mods.allResearchedBonus === 'scoreBonus2') mods.remodelScoreBonus += 2;
        if (mods.allResearchedBonus === 'preventVegDrop') mods.marketRecoveryVeg = true;
        if (mods.allResearchedBonus === 'pickItem1') mods.pickItemOnClose += 1;
        if (mods.allResearchedBonus === 'pickItem2') mods.pickItemOnClose += 2;
    }

    return mods;
};
