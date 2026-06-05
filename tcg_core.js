// ==========================================
// TCG コアシステム (tcg_core.js) - 最終完全版
// ==========================================

const savedTCG = JSON.parse(localStorage.getItem('tcg_data_v1'));

window.TCG = savedTCG || {
    myCollection: [], 
    decks: [],        
    unlockedHistory: {} 
};

window.saveTCGData = function() {
    localStorage.setItem('tcg_data_v1', JSON.stringify(window.TCG));
};

// ==========================================
// 1. マスターデータ
// ==========================================
window.TCG_MASTER = {
    // 🐉 ドラゴン
    "dragon_0": { "name": "幼竜の突進", "type": "dragon", "image": "dragon_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 1, "baseHp": 30, "skillName": "体当たり", "skillCost": 1, "baseDmg": 20, "ability": "haste", "sx": -6, "sy": 44, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_1": { "name": "探求の白竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 1, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 2, "baseHp": 20, "skillName": "知識の探求", "skillCost": 2, "baseDmg": 20, "ability": "draw_card", "sx": 559, "sy": 44, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_2": { "name": "結界竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 2, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 3, "baseHp": 60, "skillName": "バリア展開", "skillCost": 1, "baseDmg": 20, "ability": "taunt", "sx": 1085, "sy": 44, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_3": { "name": "飛翔する白竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 3, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 2, "baseHp": 30, "skillName": "滑空攻撃", "skillCost": 1, "baseDmg": 30, "ability": "flight", "sx": 27, "sy": 554, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_4": { "name": "業火の竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 4, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 5, "baseHp": 60, "skillName": "ファイアブレス", "skillCost": 3, "baseDmg": 50, "ability": "roar", "sx": 535, "sy": 554, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_5": { "name": "森に潜む竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 5, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 1, "baseHp": 30, "skillName": "威嚇", "skillCost": 1, "baseDmg": 20, "ability": "stealth", "sx": 1078, "sy": 554, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_6": { "name": "洞窟の番竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 6, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 3, "baseHp": 60, "skillName": "岩砕き", "skillCost": 2, "baseDmg": 20, "ability": "wrath", "sx": 27, "sy": 1066, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_7": { "name": "魔力解放の竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 7, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 4, "baseHp": 40, "skillName": "マジックミサイル", "skillCost": 2, "baseDmg": 40, "ability": "splash_damage", "sx": 532, "sy": 1066, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_8": { "name": "宝物庫の主", "type": "dragon", "image": "dragon_card.png", "imageIndex": 8, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 6, "baseHp": 80, "skillName": "黄金の咆哮", "skillCost": 4, "baseDmg": 60, "ability": null, "sx": 1065, "sy": 1066, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_9": { "name": "疾風の爪", "type": "dragon", "image": "dragon_card.png", "imageIndex": 9, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 2, "baseHp": 30, "skillName": "ウィンドスラッシュ", "skillCost": 1, "baseDmg": 40, "ability": null, "sx": 27, "sy": 1586, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_10": { "name": "終焉の黒球", "type": "dragon", "image": "dragon_card.png", "imageIndex": 10, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 7, "baseHp": 60, "skillName": "ブラックホール", "skillCost": 5, "baseDmg": 80, "ability": "cataclysm", "sx": 545, "sy": 1586, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_11": { "name": "力尽きた竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 11, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 1, "baseHp": 10, "skillName": "最後のあがき", "skillCost": 1, "baseDmg": 20, "ability": "death_bomb", "sx": 1064, "sy": 1646, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_12": { "name": "迅雷の竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 4, "baseHp": 40, "skillName": "ライトニングブレス", "skillCost": 2, "baseDmg": 40, "ability": "double_strike", "sx": 27, "sy": 2125, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_13": { "name": "覚醒の光", "type": "dragon", "image": "dragon_card.png", "imageIndex": 13, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 5, "baseHp": 50, "skillName": "マナチャージ", "skillCost": 1, "baseDmg": 40, "ability": "mana_ramp", "sx": 532, "sy": 2200, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    "dragon_14": { "name": "まどろみの竜", "type": "dragon", "image": "dragon_card.png", "imageIndex": 14, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 510, "baseCost": 2, "baseHp": 40, "skillName": "休息", "skillCost": 1, "baseDmg": 20, "ability": "heal_self", "sx": 1067, "sy": 2200, "sw": 504, "sh": 400, "scaleX": 0.39999999999999963, "scaleY": 0.39999999999999963 },
    // 🤖 ロボット
    "robot_0": { "name": "パンチングロボ", "type": "robot", "image": "robot_card.png", "imageIndex": 0, "offsetX": 5, "offsetY": 0, "zoomX": 335, "zoomY": 505, "baseCost": 1, "baseHp": 40, "skillName": "ストレート", "skillCost": 1, "baseDmg": 30, "ability": null, "sx": 348, "sy": -27, "sw": 339, "sh": 354, "scaleX": 0.5999999999999996, "scaleY": 0.4999999999999996 },
    "robot_1": { "name": "ビームキャノン機", "type": "robot", "image": "robot_card.png", "imageIndex": 1, "offsetX": -3, "offsetY": 0, "zoomX": 360, "zoomY": 505, "baseCost": 4, "baseHp": 40, "skillName": "極太レーザー", "skillCost": 3, "baseDmg": 60, "ability": null, "sx": 1404, "sy": -27, "sw": 339, "sh": 354, "scaleX": 0.5999999999999996, "scaleY": 0.4999999999999996 },
    "robot_2": { "name": "採掘ロボ", "type": "robot", "image": "robot_card.png", "imageIndex": 2, "offsetX": -4.5, "offsetY": 0.5, "zoomX": 360, "zoomY": 520, "baseCost": 2, "baseHp": 40, "skillName": "マテリアル発掘", "skillCost": 2, "baseDmg": 10, "ability": "mana_ramp", "sx": 2203, "sy": -27, "sw": 339, "sh": 354, "scaleX": 0.5999999999999996, "scaleY": 0.4999999999999996 },
    "robot_3": { "name": "アサシンロボ", "type": "robot", "image": "robot_card.png", "imageIndex": 3, "offsetX": 4.5, "offsetY": 0.5, "zoomX": 360, "zoomY": 520, "baseCost": 2, "baseHp": 20, "skillName": "急所蹴り", "skillCost": 1, "baseDmg": 40, "ability": "stealth", "sx": 409, "sy": 279, "sw": 339, "sh": 340, "scaleX": 0.5999999999999996, "scaleY": 0.5499999999999996 },
    "robot_4": { "name": "浮遊ビット展開機", "type": "robot", "image": "robot_card.png", "imageIndex": 4, "offsetX": 3, "offsetY": 0.5, "zoomX": 360, "zoomY": 520, "baseCost": 3, "baseHp": 30, "skillName": "オールレンジ攻撃", "skillCost": 2, "baseDmg": 20, "ability": "double_strike", "sx": 1299, "sy": 279, "sw": 339, "sh": 340, "scaleX": 0.5999999999999996, "scaleY": 0.5499999999999996 },
    "robot_5": { "name": "黄昏の監視者", "type": "robot", "image": "robot_card.png", "imageIndex": 5, "offsetX": -4.5, "offsetY": 0.5, "zoomX": 360, "zoomY": 520, "baseCost": 2, "baseHp": 50, "skillName": "索敵", "skillCost": 1, "baseDmg": 10, "ability": "taunt", "sx": 2303, "sy": 279, "sw": 339, "sh": 340, "scaleX": 0.5999999999999996, "scaleY": 0.5499999999999996 },
    "robot_6": { "name": "双剣の機神", "type": "robot", "image": "robot_card.png", "imageIndex": 6, "offsetX": 4.5, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 5, "baseHp": 50, "skillName": "ツインブレード", "skillCost": 3, "baseDmg": 40, "ability": "double_strike", "sx": 367, "sy": 577, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_7": { "name": "帯電アーマー機", "type": "robot", "image": "robot_card.png", "imageIndex": 7, "offsetX": -2, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 3, "baseHp": 50, "skillName": "放電ショック", "skillCost": 2, "baseDmg": 20, "ability": "heavy_armor", "sx": 1231, "sy": 577, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_8": { "name": "修理特化ロボ", "type": "robot", "image": "robot_card.png", "imageIndex": 8, "offsetX": -4.5, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 2, "baseHp": 30, "skillName": "オーバーホール", "skillCost": 1, "baseDmg": 10, "ability": "heal_self", "sx": 2182, "sy": 577, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_9": { "name": "格闘教官機", "type": "robot", "image": "robot_card.png", "imageIndex": 9, "offsetX": 4.5, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 3, "baseHp": 40, "skillName": "クロスカウンター", "skillCost": 2, "baseDmg": 40, "ability": "counter_attack", "sx": 367, "sy": 877, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_10": { "name": "シールド発生機", "type": "robot", "image": "robot_card.png", "imageIndex": 10, "offsetX": 2, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 4, "baseHp": 70, "skillName": "イージス展開", "skillCost": 2, "baseDmg": 20, "ability": "taunt", "sx": 1150, "sy": 877, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_11": { "name": "スクラップ機", "type": "robot", "image": "robot_card.png", "imageIndex": 11, "offsetX": -6.5, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 1, "baseHp": 10, "skillName": "ショート", "skillCost": 1, "baseDmg": 10, "ability": "self_destruct", "sx": 2173, "sy": 900, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_12": { "name": "高速スピン機", "type": "robot", "image": "robot_card.png", "imageIndex": 12, "offsetX": 4.5, "offsetY": 0, "zoomX": 345, "zoomY": 520, "baseCost": 2, "baseHp": 30, "skillName": "竜巻旋風", "skillCost": 2, "baseDmg": 30, "ability": "flight", "sx": 318, "sy": 1180, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_13": { "name": "次元転送機", "type": "robot", "image": "robot_card.png", "imageIndex": 13, "offsetX": -2, "offsetY": -0.5, "zoomX": 345, "zoomY": 525, "baseCost": 6, "baseHp": 50, "skillName": "ワープアタック", "skillCost": 4, "baseDmg": 80, "ability": "stealth", "sx": 1189, "sy": 1180, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_14": { "name": "勝利のガッツポーズ", "type": "robot", "image": "robot_card.png", "imageIndex": 14, "offsetX": -4.5, "offsetY": -0.5, "zoomX": 345, "zoomY": 525, "baseCost": 3, "baseHp": 40, "skillName": "士気高揚", "skillCost": 2, "baseDmg": 20, "ability": "draw_card", "sx": 2134, "sy": 1180, "sw": 394, "sh": 340, "scaleX": 0.4999999999999996, "scaleY": 0.5499999999999996 },
    "robot_type1_0": { "name": "キリング・マシーン", "type": "robot_type1", "image": "robot_type1_card.png", "imageIndex": 2, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 70, "skillName": "プラズマデストロイ", "skillCost": 2, "baseDmg": 60, "ability": "pierce_recoil", "evolvesFrom": "robot", "sx": 1123, "sy": 1674, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type2_0": { "name": "アイドル・ギア", "type": "robot_type2", "image": "robot_type2_card.png", "imageIndex": 11, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 60, "skillName": "ホログラムライブ", "skillCost": 1, "baseDmg": 30, "ability": "aoe_heal_play", "evolvesFrom": "robot", "sx": 675, "sy": 1022, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type3_0": { "name": "アナリティクス・マキナ", "type": "robot_type3", "image": "robot_type3_card.png", "imageIndex": 8, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 60, "skillName": "データクラッシュ", "skillCost": 2, "baseDmg": 40, "ability": "start_draw", "evolvesFrom": "robot", "sx": 670, "sy": 1011, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type3_2_0": { "name": "マザー・ブレイン", "type": "robot_type3_2", "image": "robot_type3_2_card.png", "imageIndex": 10, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 70, "skillName": "エレメンタルカノン", "skillCost": 2, "baseDmg": 40, "ability": "aura_action_cost", "evolvesFrom": "robot", "sx": 615, "sy": -6, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type4_0": { "name": "ヘビー・タンク", "type": "robot_type4", "image": "robot_type4_card.png", "imageIndex": 5, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 100, "skillName": "ギガントドリル", "skillCost": 2, "baseDmg": 40, "ability": "heavy_armor", "evolvesFrom": "robot", "sx": 1224, "sy": 995, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type4_2_0": { "name": "アサルト・マキナ", "type": "robot_type4_2", "image": "robot_type4_2_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 80, "skillName": "メテオバーン", "skillCost": 3, "baseDmg": 60, "ability": "snipe_play", "evolvesFrom": "robot", "sx": 1330, "sy": 815, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type5_0": { "name": "スクラップ・ウォーカー", "type": "robot_type5", "image": "robot_type5_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 80, "skillName": "ネイチャーバインド", "skillCost": 1, "baseDmg": 30, "ability": "end_heal", "evolvesFrom": "robot", "sx": 1291, "sy": 100, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type1_2_0": { "name": "シン・マキナ", "type": "robot_type1_2", "image": "robot_type1_2_card.png", "imageIndex": 2, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 180, "skillName": "崩星の咆哮", "skillCost": 3, "baseDmg": 90, "ability": "perfect_predation", "evolvesFrom": "robot_type1", "sx": 739, "sy": 29, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type1_3_0": { "name": "ヘル・ギア", "type": "robot_type1_3", "image": "robot_type1_3_card.png", "imageIndex": 2, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 150, "skillName": "煉獄の鎖", "skillCost": 3, "baseDmg": 100, "ability": "nightmare_rule", "evolvesFrom": "robot_type1", "sx": 618, "sy": 54, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type2_2_0": { "name": "スターライト・アーマー", "type": "robot_type2_2", "image": "robot_type2_2_card.png", "imageIndex": 2, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 140, "skillName": "ギャラクシー・ブレード", "skillCost": 2, "baseDmg": 80, "ability": "star_hope", "evolvesFrom": "robot_type2", "sx": 625, "sy": 1075, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type2_3_0": { "name": "セラフィム・ギア", "type": "robot_type2_3", "image": "robot_type2_3_card.png", "imageIndex": 11, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 120, "skillName": "神罰の光", "skillCost": 4, "baseDmg": 70, "ability": "divine_grace", "evolvesFrom": "robot_type2", "sx": 550, "sy": 1241, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type2_4_0": { "name": "ゴールデン・パラディン", "type": "robot_type2_4", "image": "robot_type2_4_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 200, "skillName": "ジャッジメント", "skillCost": 5, "baseDmg": 100, "ability": "heaven_punishment", "evolvesFrom": "robot_type2", "sx": 435, "sy": 693, "sw": 436, "sh": 341, "scaleX": 0.4499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type3_3_0": { "name": "ユニバース・コア", "type": "robot_type3_3", "image": "robot_type3_3_card.png", "imageIndex": 11, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 200, "skillName": "特異点生成", "skillCost": 4, "baseDmg": 50, "ability": "event_horizon", "evolvesFrom": "robot_type3", "sx": 758, "sy": 412, "sw": 549, "sh": 344, "scaleX": 0.39999999999999963, "scaleY": 0.5499999999999996 },
    "robot_type3_4_0": { "name": "マスター・コンソール", "type": "robot_type3_4", "image": "robot_type3_4_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 130, "skillName": "真理の書き換え", "skillCost": 2, "baseDmg": 70, "ability": "truth_overwrite", "evolvesFrom": "robot_type3_2", "sx": 492, "sy": 22, "sw": 549, "sh": 344, "scaleX": 0.39999999999999963, "scaleY": 0.5499999999999996 },
    "robot_type3_5_0": { "name": "サテライト・ルーラー", "type": "robot_type3_5", "image": "robot_type3_5_card.png", "imageIndex": 11, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 150, "skillName": "オービタル・カノン", "skillCost": 3, "baseDmg": 80, "ability": "heaven_judgement", "evolvesFrom": "robot_type3", "sx": 110, "sy": -6, "sw": 549, "sh": 344, "scaleX": 0.39999999999999963, "scaleY": 0.5499999999999996 },
    "robot_type4_3_0": { "name": "フルアーマー・タイタン", "type": "robot_type4_3", "image": "robot_type4_3_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 250, "skillName": "オメガ・バッシュ", "skillCost": 3, "baseDmg": 90, "ability": "absolute_fortress", "evolvesFrom": "robot_type4", "sx": 315, "sy": -6, "sw": 549, "sh": 344, "scaleX": 0.5499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type4_4_0": { "name": "ギガント・クラッシャー", "type": "robot_type4_4", "image": "robot_type4_4_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 190, "skillName": "次元穿孔ドリル", "skillCost": 4, "baseDmg": 120, "ability": "dimension_drill", "evolvesFrom": "robot_type4_2", "sx": 306, "sy": 68, "sw": 549, "sh": 344, "scaleX": 0.5499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type5_2_0": { "name": "クロックワーク・ゴッド", "type": "robot_type5_2", "image": "robot_type5_2_card.png", "imageIndex": 13, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 160, "skillName": "タイム・パラドックス", "skillCost": 3, "baseDmg": 80, "ability": "time_manipulation", "evolvesFrom": "robot_type5", "sx": 523, "sy": 1, "sw": 549, "sh": 344, "scaleX": 0.5499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type5_3_0": { "name": "アストロ・ダイバー", "type": "robot_type5_3", "image": "robot_type5_3_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 170, "skillName": "超新星爆発", "skillCost": 6, "baseDmg": 100, "ability": "super_gravity", "evolvesFrom": "robot_type5", "sx": 536, "sy": 594, "sw": 549, "sh": 344, "scaleX": 0.5499999999999996, "scaleY": 0.5499999999999996 },
    "robot_type5_4_0": { "name": "エンシェント・レリック", "type": "robot_type5_4", "image": "robot_type5_4_card.png", "imageIndex": 12, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 190, "skillName": "ロスト・テクノロジー", "skillCost": 2, "baseDmg": 90, "ability": "eternal_rebirth", "evolvesFrom": "robot_type5", "sx": 1066, "sy": -14, "sw": 549, "sh": 344, "scaleX": 0.5499999999999996, "scaleY": 0.5499999999999996 },

    // 🧙 魔法使い
    'magician_0': { name: "雷鎚の魔道士", type: "magician", image: "magician_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 40, skillName: "サンダースマッシュ", skillCost: 2, baseDmg: 40, ability: "splash_damage" },
    'magician_1': { name: "浮遊する魔法使い", type: "magician", image: "magician_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 20, skillName: "マジックアロー", skillCost: 1, baseDmg: 30, ability: "flight" },
    'magician_2': { name: "防壁の結界師", type: "magician", image: "magician_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 4, baseHp: 60, skillName: "魔法の盾", skillCost: 2, baseDmg: 10, ability: "taunt" },
    'magician_3': { name: "暗殺魔法", type: "magician", image: "magician_card.png", imageIndex: 3, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 20, skillName: "ダガー・スロー", skillCost: 1, baseDmg: 30, ability: "silence" },
    'magician_4': { name: "メテオストライク", type: "magician", image: "magician_card.png", imageIndex: 4, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 6, baseHp: 40, skillName: "星の怒り", skillCost: 5, baseDmg: 80, ability: "trample" },
    'magician_5': { name: "書庫の賢者", type: "magician", image: "magician_card.png", imageIndex: 5, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 30, skillName: "知識の探求", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'magician_6': { name: "地裂の杖", type: "magician", image: "magician_card.png", imageIndex: 6, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 4, baseHp: 40, skillName: "アースクエイク", skillCost: 3, baseDmg: 50, ability: "splash_damage" },
    'magician_7': { name: "魔導書の詠唱", type: "magician", image: "magician_card.png", imageIndex: 7, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 30, skillName: "魔力抽出", skillCost: 1, baseDmg: 10, ability: "mana_ramp" },
    'magician_8': { name: "財宝の発見", type: "magician", image: "magician_card.png", imageIndex: 8, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 20, skillName: "強欲な壺", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'magician_9': { name: "残像ダッシュ", type: "magician", image: "magician_card.png", imageIndex: 9, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 20, skillName: "クイックムーブ", skillCost: 1, baseDmg: 10, ability: "haste" },
    'magician_10': { name: "召喚士の契約", type: "magician", image: "magician_card.png", imageIndex: 10, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 5, baseHp: 50, skillName: "悪魔召喚", skillCost: 3, baseDmg: 60, ability: null },
    'magician_11': { name: "魔力切れ", type: "magician", image: "magician_card.png", imageIndex: 11, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 10, skillName: "ぽんこつ魔法", skillCost: 1, baseDmg: 10, ability: null },
    'magician_12': { name: "魔力キック", type: "magician", image: "magician_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 40, skillName: "エンチャント蹴り", skillCost: 2, baseDmg: 30, ability: null },
    'magician_13': { name: "氷炎の魔道士", type: "magician", image: "magician_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 4, baseHp: 40, skillName: "ダブルキャスト", skillCost: 3, baseDmg: 50, ability: "splash_damage" },
    'magician_14': { name: "癒やしの泉", type: "magician", image: "magician_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 30, skillName: "ヒールオーラ", skillCost: 2, baseDmg: 10, ability: "heal_self" },

    // 🍃 精霊
    'spirit_0': { name: "リーフブレード", type: "spirit", image: "spirit_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 20, skillName: "葉っぱ斬り", skillCost: 1, baseDmg: 30, ability: null },
    'spirit_1': { name: "森の妖精の呪文", type: "spirit", image: "spirit_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 20, skillName: "自然の導き", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'spirit_2': { name: "葉っぱの盾", type: "spirit", image: "spirit_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 50, skillName: "防御態勢", skillCost: 1, baseDmg: 10, ability: "taunt" },
    'spirit_3': { name: "キノコキック", type: "spirit", image: "spirit_card.png", imageIndex: 3, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 30, skillName: "スポアアタック", skillCost: 1, baseDmg: 20, ability: "stealth" },
    'spirit_4': { name: "茨の束縛", type: "spirit", image: "spirit_card.png", imageIndex: 4, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 40, skillName: "ソーンウィップ", skillCost: 2, baseDmg: 30, ability: "heavy_strike" },
    'spirit_5': { name: "森の狩人", type: "spirit", image: "spirit_card.png", imageIndex: 5, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 30, skillName: "ツルムチ", skillCost: 2, baseDmg: 40, ability: "flight" },
    'spirit_6': { name: "つるのムチ", type: "spirit", image: "spirit_card.png", imageIndex: 6, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 30, skillName: "ダブルウィップ", skillCost: 1, baseDmg: 20, ability: "double_strike" },
    'spirit_7': { name: "精霊のバリア", type: "spirit", image: "spirit_card.png", imageIndex: 7, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 4, baseHp: 60, skillName: "自然の守り", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'spirit_8': { name: "擬態する精霊", type: "spirit", image: "spirit_card.png", imageIndex: 8, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 20, skillName: "隠れ身", skillCost: 1, baseDmg: 10, ability: "stealth" },
    'spirit_9': { name: "風の刃", type: "spirit", image: "spirit_card.png", imageIndex: 9, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 30, skillName: "カマイタチ", skillCost: 2, baseDmg: 40, ability: "splash_damage" },
    'spirit_10': { name: "命の粉塵", type: "spirit", image: "spirit_card.png", imageIndex: 10, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 3, baseHp: 40, skillName: "癒やしの胞子", skillCost: 2, baseDmg: 10, ability: "heal_self" },
    'spirit_11': { name: "亀と長寿の精霊", type: "spirit", image: "spirit_card.png", imageIndex: 11, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 5, baseHp: 70, skillName: "のしかかり", skillCost: 3, baseDmg: 30, ability: "regeneration" },
    'spirit_12': { name: "岩石封じ", type: "spirit", image: "spirit_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 4, baseHp: 50, skillName: "ゴーレム縛り", skillCost: 3, baseDmg: 40, ability: "heavy_strike" },
    'spirit_13': { name: "マナの結晶", type: "spirit", image: "spirit_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 2, baseHp: 30, skillName: "大地の恵み", skillCost: 1, baseDmg: 10, ability: "mana_ramp" },
    'spirit_14': { name: "お昼寝", type: "spirit", image: "spirit_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 505, baseCost: 1, baseHp: 20, skillName: "すやすや", skillCost: 1, baseDmg: 10, ability: "heal_self" },

    // 🪨 ゴーレム
    'stone_0': { name: "岩石の拳", type: "stone", image: "stone_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 2, baseHp: 40, skillName: "スマッシュ", skillCost: 2, baseDmg: 30, ability: null },
    'stone_1': { name: "守護者の咆哮", type: "stone", image: "stone_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 50, skillName: "威圧", skillCost: 1, baseDmg: 20, ability: "taunt" },
    'stone_2': { name: "絶対防壁", type: "stone", image: "stone_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 4, baseHp: 80, skillName: "城壁化", skillCost: 2, baseDmg: 20, ability: "counter_attack" },
    'stone_3': { name: "投石兵", type: "stone", image: "stone_card.png", imageIndex: 3, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "大岩投げ", skillCost: 2, baseDmg: 40, ability: null },
    'stone_4': { name: "磁力ゴーレム", type: "stone", image: "stone_card.png", imageIndex: 4, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 50, skillName: "引き寄せ", skillCost: 2, baseDmg: 20, ability: "draw_card" },
    'stone_5': { name: "苔むす巨人", type: "stone", image: "stone_card.png", imageIndex: 5, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 60, skillName: "大地の休息", skillCost: 1, baseDmg: 20, ability: "heal_self" },
    'stone_6': { name: "攻城の巨岩", type: "stone", image: "stone_card.png", imageIndex: 6, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 60, skillName: "城門破り", skillCost: 4, baseDmg: 70, ability: "trample" },
    'stone_7': { name: "大地を割る者", type: "stone", image: "stone_card.png", imageIndex: 7, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 6, baseHp: 70, skillName: "アース・スタンプ", skillCost: 4, baseDmg: 80, ability: "heavy_strike" },
    'stone_8': { name: "崩れゆく石像", type: "stone", image: "stone_card.png", imageIndex: 8, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 20, skillName: "破片飛ばし", skillCost: 1, baseDmg: 20, ability: null },
    'stone_9': { name: "地盤沈下", type: "stone", image: "stone_card.png", imageIndex: 9, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 40, skillName: "クレーター生成", skillCost: 3, baseDmg: 50, ability: "heavy_strike" },
    'stone_10': { name: "ストーンミサイル", type: "stone", image: "stone_card.png", imageIndex: 10, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 20, skillName: "岩石連射", skillCost: 2, baseDmg: 40, ability: "haste" },
    'stone_11': { name: "鉄壁の軍団", type: "stone", image: "stone_card.png", imageIndex: 11, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 7, baseHp: 100, skillName: "要塞陣形", skillCost: 3, baseDmg: 40, ability: "taunt" },
    'stone_12': { name: "百裂拳のゴーレム", type: "stone", image: "stone_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 50, skillName: "ガトリングパンチ", skillCost: 3, baseDmg: 60, ability: null },
    'stone_13': { name: "双極の岩神", type: "stone", image: "stone_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 6, baseHp: 60, skillName: "氷炎撃", skillCost: 4, baseDmg: 80, ability: null },
    'stone_14': { name: "瞑想する岩", type: "stone", image: "stone_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 40, skillName: "魔力吸収", skillCost: 1, baseDmg: 10, ability: "mana_ramp" },

    // ⚙️ ぜんまい
    'machine_0': { name: "ダッシュぜんまい", type: "machine", image: "machine_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 1, baseHp: 20, skillName: "突撃", skillCost: 1, baseDmg: 20, ability: "haste" },
    'machine_1': { name: "電撃放逐機", type: "machine", image: "machine_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 30, skillName: "ショックウェーブ", skillCost: 2, baseDmg: 40, ability: null },
    'machine_2': { name: "ぜんまいシールド", type: "machine", image: "machine_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 2, baseHp: 40, skillName: "盾構え", skillCost: 1, baseDmg: 10, ability: "taunt" },
    'machine_3': { name: "溶接アーム", type: "machine", image: "machine_card.png", imageIndex: 3, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "バーナー炙り", skillCost: 2, baseDmg: 30, ability: null },
    'machine_4': { name: "歯車の結界", type: "machine", image: "machine_card.png", imageIndex: 4, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 60, skillName: "ギア・フォース", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'machine_5': { name: "設計図の解読", type: "machine", image: "machine_card.png", imageIndex: 5, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 20, skillName: "ひらめき", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'machine_6': { name: "解体ハンマー", type: "machine", image: "machine_card.png", imageIndex: 6, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "クラッシュ", skillCost: 2, baseDmg: 50, ability: null },
    'machine_7': { name: "オーバーヒート", type: "machine", image: "machine_card.png", imageIndex: 7, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 40, skillName: "リミッター解除", skillCost: 4, baseDmg: 80, ability: "death_bomb" },
    'machine_8': { name: "故障したぜんまい", type: "machine", image: "machine_card.png", imageIndex: 8, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 10, skillName: "空回り", skillCost: 1, baseDmg: 10, ability: "death_bomb" },
    'machine_9': { name: "ジャンク・キック", type: "machine", image: "machine_card.png", imageIndex: 9, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "飛び蹴り", skillCost: 1, baseDmg: 20, ability: null },
    'machine_10': { name: "覚醒の歯車", type: "machine", image: "machine_card.png", imageIndex: 10, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 50, skillName: "フル稼働", skillCost: 2, baseDmg: 30, ability: "mana_ramp" },
    'machine_11': { name: "修理の連鎖", type: "machine", image: "machine_card.png", imageIndex: 11, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "仲間を直す", skillCost: 2, baseDmg: 20, ability: "aoe_heal_play" },
    'machine_12': { name: "量産型ぜんまい", type: "machine", image: "machine_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 20, skillName: "集団攻撃", skillCost: 1, baseDmg: 20, ability: "death_bomb" },
    'machine_13': { name: "発火ぜんまい", type: "machine", image: "machine_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 20, skillName: "自爆特攻", skillCost: 2, baseDmg: 60, ability: "death_bomb" },
    'machine_14': { name: "ガラクタの山", type: "machine", image: "machine_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 40, skillName: "鉄くずの壁", skillCost: 1, baseDmg: 10, ability: "taunt" },

    // 👻 ゴースト
    'ghost_0': { name: "ポルターガイスト", type: "ghost", image: "ghost_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 2, baseHp: 30, skillName: "物投げ", skillCost: 1, baseDmg: 30, ability: "discard_hand" },
    'ghost_1': { name: "霊魂のビーム", type: "ghost", image: "ghost_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 30, skillName: "ソウルレイ", skillCost: 2, baseDmg: 50, ability: null },
    'ghost_2': { name: "魂の結晶", type: "ghost", image: "ghost_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 4, baseHp: 60, skillName: "硬化", skillCost: 1, baseDmg: 20, ability: "taunt" },
    'ghost_3': { name: "怨念の渦", type: "ghost", image: "ghost_card.png", imageIndex: 3, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 30, skillName: "ダークトルネード", skillCost: 3, baseDmg: 50, ability: "haunt" },
    'ghost_4': { name: "呪いの魔導書", type: "ghost", image: "ghost_card.png", imageIndex: 4, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 20, skillName: "禁術の詠唱", skillCost: 2, baseDmg: 20, ability: "draw_card" },
    'ghost_5': { name: "水面の浮遊霊", type: "ghost", image: "ghost_card.png", imageIndex: 5, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 20, skillName: "呪縛", skillCost: 1, baseDmg: 20, ability: "stealth" },
    'ghost_6': { name: "地縛霊", type: "ghost", image: "ghost_card.png", imageIndex: 6, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 40, skillName: "足止め", skillCost: 1, baseDmg: 20, ability: "taunt" },
    'ghost_7': { name: "霊体の盾", type: "ghost", image: "ghost_card.png", imageIndex: 7, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 60, skillName: "霊的防壁", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'ghost_8': { name: "取り憑く霊", type: "ghost", image: "ghost_card.png", imageIndex: 8, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 20, skillName: "ドレイン", skillCost: 2, baseDmg: 30, ability: "life_drain" },
    'ghost_9': { name: "悪霊の急襲", type: "ghost", image: "ghost_card.png", imageIndex: 9, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 20, skillName: "奇襲", skillCost: 1, baseDmg: 30, ability: "haste" },
    'ghost_10': { name: "エクトプラズム", type: "ghost", image: "ghost_card.png", imageIndex: 10, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 40, skillName: "霊体攻撃", skillCost: 2, baseDmg: 40, ability: "flight" },
    'ghost_11': { name: "スライム化", type: "ghost", image: "ghost_card.png", imageIndex: 11, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 10, skillName: "べとべと", skillCost: 1, baseDmg: 10, ability: "debuff_attack" },
    'ghost_12': { name: "森の悪霊", type: "ghost", image: "ghost_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 40, skillName: "養分吸収", skillCost: 2, baseDmg: 20, ability: "mana_ramp" },
    'ghost_13': { name: "次元の狭間", type: "ghost", image: "ghost_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 30, skillName: "異次元送り", skillCost: 4, baseDmg: 70, ability: "stealth" },
    'ghost_14': { name: "竜の守護霊", type: "ghost", image: "ghost_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 60, skillName: "ドラゴンソウル", skillCost: 3, baseDmg: 50, ability: "flight" },

    // 🐦 鳥
    'bird_0': { name: "筋トレバード", type: "bird", image: "bird_card.png", imageIndex: 0, offsetX: 3, offsetY: 3, zoomX: 320, zoomY: 550, baseCost: 2, baseHp: 30, skillName: "マッスルアタック", skillCost: 1, baseDmg: 30, ability: null },
    'bird_1': { name: "吹雪の翼", type: "bird", image: "bird_card.png", imageIndex: 1, offsetX: 0, offsetY: 3, zoomX: 320, zoomY: 550, baseCost: 4, baseHp: 30, skillName: "ブリザード", skillCost: 3, baseDmg: 50, ability: "flight" },
    'bird_2': { name: "盾持ち鳥", type: "bird", image: "bird_card.png", imageIndex: 2, offsetX: -3, offsetY: 3, zoomX: 320, zoomY: 550, baseCost: 3, baseHp: 40, skillName: "シールドバッシュ", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'bird_3': { name: "急降下爆撃", type: "bird", image: "bird_card.png", imageIndex: 3, offsetX: 3, offsetY: 3, zoomX: 320, zoomY: 550, baseCost: 3, baseHp: 20, skillName: "ダイブアタック", skillCost: 2, baseDmg: 50, ability: "flight" },
    'bird_4': { name: "知識のフクロウ", type: "bird", image: "bird_card.png", imageIndex: 4, offsetX: 0, offsetY: 3, zoomX: 320, zoomY: 550, baseCost: 2, baseHp: 20, skillName: "読書", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'bird_5': { name: "おやすみ鳥", type: "bird", image: "bird_card.png", imageIndex: 5, offsetX: -3, offsetY: 1.5, zoomX: 320, zoomY: 550, baseCost: 1, baseHp: 20, skillName: "羽休め", skillCost: 1, baseDmg: 10, ability: "heal_self" },
    'bird_6': { name: "ドリルバード", type: "bird", image: "bird_card.png", imageIndex: 6, offsetX: 3, offsetY: 0.5, zoomX: 320, zoomY: 550, baseCost: 2, baseHp: 20, skillName: "貫通くちばし", skillCost: 1, baseDmg: 40, ability: "stealth" },
    'bird_7': { name: "魔法の結界鳥", type: "bird", image: "bird_card.png", imageIndex: 7, offsetX: 0, offsetY: 0.5, zoomX: 320, zoomY: 550, baseCost: 4, baseHp: 50, skillName: "オーラ防壁", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'bird_8': { name: "優勝バード", type: "bird", image: "bird_card.png", imageIndex: 8, offsetX: -3, offsetY: 0.5, zoomX: 320, zoomY: 550, baseCost: 5, baseHp: 50, skillName: "チャンピオンの舞", skillCost: 2, baseDmg: 30, ability: "mana_ramp" },
    'bird_9': { name: "爆砕の翼", type: "bird", image: "bird_card.png", imageIndex: 9, offsetX: 3, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 3, baseHp: 20, skillName: "フレアダイブ", skillCost: 2, baseDmg: 60, ability: "flight" },
    'bird_10': { name: "氷柱落とし", type: "bird", image: "bird_card.png", imageIndex: 10, offsetX: 0, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 4, baseHp: 30, skillName: "アイシクル", skillCost: 2, baseDmg: 40, ability: "double_strike" },
    'bird_11': { name: "力尽きた鳥", type: "bird", image: "bird_card.png", imageIndex: 11, offsetX: -3, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 1, baseHp: 10, skillName: "墜落", skillCost: 1, baseDmg: 10, ability: "haste" },
    'bird_12': { name: "魔法修練鳥", type: "bird", image: "bird_card.png", imageIndex: 12, offsetX: 3, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 2, baseHp: 30, skillName: "詠唱", skillCost: 2, baseDmg: 20, ability: "draw_card" },
    'bird_13': { name: "ダンベルバード", type: "bird", image: "bird_card.png", imageIndex: 13, offsetX: -0.5, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 3, baseHp: 40, skillName: "ダブルダンベル", skillCost: 2, baseDmg: 40, ability: "double_strike" },
    'bird_14': { name: "瞑想バード", type: "bird", image: "bird_card.png", imageIndex: 14, offsetX: -3, offsetY: -0.5, zoomX: 320, zoomY: 550, baseCost: 2, baseHp: 30, skillName: "精神統一", skillCost: 1, baseDmg: 10, ability: "mana_ramp" },

    // 🪲 かぶとむし
    'beetle_0': { name: "岩砕きの甲虫", type: "beetle", image: "beetle_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 40, skillName: "ホーンアタック", skillCost: 2, baseDmg: 40, ability: "trample" },
    'beetle_1': { name: "魔力集中の兜", type: "beetle", image: "beetle_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 4, baseHp: 40, skillName: "エネルギー波", skillCost: 3, baseDmg: 50, ability: null },
    'beetle_2': { name: "虹色の鉄壁", type: "beetle", image: "beetle_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 4, baseHp: 60, skillName: "オーラガード", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'beetle_3': { name: "力比べの甲虫", type: "beetle", image: "beetle_card.png", imageIndex: 3, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "投げ飛ばし", skillCost: 2, baseDmg: 30, ability: null },
    'beetle_4': { name: "爆発甲虫", type: "beetle", image: "beetle_card.png", imageIndex: 4, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 20, skillName: "大爆発", skillCost: 4, baseDmg: 80, ability: null },
    'beetle_5': { name: "黄昏の甲虫", type: "beetle", image: "beetle_card.png", imageIndex: 5, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 50, skillName: "甲殻防御", skillCost: 1, baseDmg: 10, ability: "heavy_armor" },
    'beetle_6': { name: "森の暴れん坊", type: "beetle", image: "beetle_card.png", imageIndex: 6, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 40, skillName: "連続角突き", skillCost: 2, baseDmg: 50, ability: null },
    'beetle_7': { name: "自然との調和", type: "beetle", image: "beetle_card.png", imageIndex: 7, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 40, skillName: "ツルの罠", skillCost: 1, baseDmg: 20, ability: "stealth" },
    'beetle_8': { name: "知識の虫", type: "beetle", image: "beetle_card.png", imageIndex: 8, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "読書", skillCost: 2, baseDmg: 10, ability: "draw_card" },
    'beetle_9': { name: "砂煙の強襲", type: "beetle", image: "beetle_card.png", imageIndex: 9, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 20, skillName: "サンドタックル", skillCost: 1, baseDmg: 30, ability: "haste" },
    'beetle_10': { name: "地中潜行", type: "beetle", image: "beetle_card.png", imageIndex: 10, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 40, skillName: "アースダイブ", skillCost: 2, baseDmg: 40, ability: "stealth" },
    'beetle_11': { name: "ひっくり返った虫", type: "beetle", image: "beetle_card.png", imageIndex: 11, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 20, skillName: "じたばた", skillCost: 1, baseDmg: 10, ability: null },
    'beetle_12': { name: "飛翔する甲虫", type: "beetle", image: "beetle_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "フライングプレス", skillCost: 2, baseDmg: 40, ability: "haste" },
    'beetle_13': { name: "甲虫の群れ", type: "beetle", image: "beetle_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 40, skillName: "スウォーム", skillCost: 2, baseDmg: 50, ability: null },
    'beetle_14': { name: "骸の上の王", type: "beetle", image: "beetle_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 6, baseHp: 80, skillName: "王者の威厳", skillCost: 3, baseDmg: 70, ability: "trample" },

    // 🌱 つぼみ
    'seed_0': { name: "筋トレつぼみ", type: "seed", image: "seed_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 2, baseHp: 30, skillName: "ダンベル殴り", skillCost: 1, baseDmg: 30, ability: null },
    'seed_1': { name: "毒の息", type: "seed", image: "seed_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 3, baseHp: 40, skillName: "ポイズンブレス", skillCost: 2, baseDmg: 20, ability: "venom_strike" },
    'seed_2': { name: "棘の結界", type: "seed", image: "seed_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 3, baseHp: 50, skillName: "チクチクガード", skillCost: 1, baseDmg: 20, ability: "taunt" },
    'seed_3': { name: "弾むつぼみ", type: "seed", image: "seed_card.png", imageIndex: 3, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 1, baseHp: 20, skillName: "体当たり", skillCost: 1, baseDmg: 10, ability: "flight" },
    'seed_4': { name: "緑のレーザー", type: "seed", image: "seed_card.png", imageIndex: 4, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 4, baseHp: 40, skillName: "ソーラービーム", skillCost: 3, baseDmg: 60, ability: null },
    'seed_5': { name: "木登りつぼみ", type: "seed", image: "seed_card.png", imageIndex: 5, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 2, baseHp: 30, skillName: "上から目線", skillCost: 1, baseDmg: 20, ability: "stealth" },
    'seed_6': { name: "茨の鞭", type: "seed", image: "seed_card.png", imageIndex: 6, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 3, baseHp: 30, skillName: "ウィップアタック", skillCost: 2, baseDmg: 40, ability: null },
    'seed_7': { name: "魔法植物", type: "seed", image: "seed_card.png", imageIndex: 7, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 3, baseHp: 30, skillName: "魔力吸収", skillCost: 2, baseDmg: 20, ability: "draw_card" },
    'seed_8': { name: "水やり", type: "seed", image: "seed_card.png", imageIndex: 8, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 2, baseHp: 30, skillName: "成長の兆し", skillCost: 1, baseDmg: 10, ability: "mana_ramp" },
    'seed_9': { name: "地中からの強襲", type: "seed", image: "seed_card.png", imageIndex: 9, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 2, baseHp: 20, skillName: "根っこ攻撃", skillCost: 1, baseDmg: 30, ability: "haste" },
    'seed_10': { name: "光合成", type: "seed", image: "seed_card.png", imageIndex: 10, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 4, baseHp: 40, skillName: "太陽の恵み", skillCost: 2, baseDmg: 40, ability: "life_drain" },
    'seed_11': { name: "枯れたつぼみ", type: "seed", image: "seed_card.png", imageIndex: 11, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 1, baseHp: 10, skillName: "しおれる", skillCost: 1, baseDmg: 10, ability: "death_bomb" },
    'seed_12': { name: "弾き飛ばす", type: "seed", image: "seed_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 2, baseHp: 40, skillName: "バウンス", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'seed_13': { name: "夜の森の妖精", type: "seed", image: "seed_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 3, baseHp: 30, skillName: "妖精の粉", skillCost: 2, baseDmg: 30, ability: "debuff_attack" },
    'seed_14': { name: "進化の輝き", type: "seed", image: "seed_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 510, baseCost: 5, baseHp: 50, skillName: "開花の予感", skillCost: 2, baseDmg: 30, ability: "mana_ramp" },

    // 🎈 風船
    'balloon_0': { name: "氷の拳", type: "balloon", image: "balloon_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 2, baseHp: 30, skillName: "アイスパンチ", skillCost: 1, baseDmg: 30, ability: null },
    'balloon_1': { name: "魔法の射手", type: "balloon", image: "balloon_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 30, skillName: "マジックアロー", skillCost: 2, baseDmg: 40, ability: null },
    'balloon_2': { name: "氷のドーム", type: "balloon", image: "balloon_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 490, baseCost: 3, baseHp: 50, skillName: "絶対零度ガード", skillCost: 1, baseDmg: 10, ability: "taunt" },
    'balloon_3': { name: "炎の剣士", type: "balloon", image: "balloon_card.png", imageIndex: 3, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "フレイムスラッシュ", skillCost: 2, baseDmg: 40, ability: null },
    'balloon_4': { name: "氷結の読書家", type: "balloon", image: "balloon_card.png", imageIndex: 4, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "知識の探求", skillCost: 2, baseDmg: 20, ability: "draw_card" },
    'balloon_5': { name: "聖なる守護", type: "balloon", image: "balloon_card.png", imageIndex: 5, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 60, skillName: "ホーリーバリア", skillCost: 2, baseDmg: 20, ability: "taunt" },
    'balloon_6': { name: "水刃の剣士", type: "balloon", image: "balloon_card.png", imageIndex: 6, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 4, baseHp: 40, skillName: "アクアブレード", skillCost: 3, baseDmg: 50, ability: null },
    'balloon_7': { name: "光のビーム", type: "balloon", image: "balloon_card.png", imageIndex: 7, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 30, skillName: "ソーラーレイ", skillCost: 4, baseDmg: 70, ability: "debuff_attack" },
    'balloon_8': { name: "おやすみ風船", type: "balloon", image: "balloon_card.png", imageIndex: 8, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 1, baseHp: 20, skillName: "休息", skillCost: 1, baseDmg: 10, ability: "heal_self" },
    'balloon_9': { name: "風の竜巻", type: "balloon", image: "balloon_card.png", imageIndex: 9, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "トルネード", skillCost: 2, baseDmg: 40, ability: "flight" },
    'balloon_10': { name: "宇宙の理", type: "balloon", image: "balloon_card.png", imageIndex: 10, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 50, skillName: "コスモパワー", skillCost: 3, baseDmg: 20, ability: "mana_ramp" },
    'balloon_11': { name: "立ち向かう風船", type: "balloon", image: "balloon_card.png", imageIndex: 11, offsetX: 0, offsetY: 1.5, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 40, skillName: "挑発", skillCost: 1, baseDmg: 10, ability: "burst_damage" },
    'balloon_12': { name: "トゲトゲ風船", type: "balloon", image: "balloon_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 2, baseHp: 30, skillName: "ニードルアタック", skillCost: 1, baseDmg: 30, ability: null },
    'balloon_13': { name: "次元の歪み", type: "balloon", image: "balloon_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 5, baseHp: 40, skillName: "ディメンション", skillCost: 3, baseDmg: 60, ability: "stealth" },
    'balloon_14': { name: "雷の譲渡", type: "balloon", image: "balloon_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 520, baseCost: 3, baseHp: 30, skillName: "スパーク", skillCost: 2, baseDmg: 30, ability: "draw_card" },

// 🍃 精霊 (Spirit) 進化ライン
    "spirit_type2_0": { "name": "スプリング・ピクシー", "type": "spirit_type2", "image": "spirit_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "春の息吹", "skillCost": 2, "baseDmg": 20, "ability": "wind_blessing", "evolvesFrom": "spirit" },
    "spirit_type2_2_0": { "name": "フラワースピリット", "type": "spirit_type2_2", "image": "spirit_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 60, "skillName": "癒やしの香", "skillCost": 3, "baseDmg": 40, "ability": "burst_spores", "evolvesFrom": "spirit_type2" },
    // "spirit_type2_3_0": { "name": "クリスタル・ロータス", "type": "spirit_type2_3", "image": "spirit_type2_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "幻光の反射", "skillCost": 4, "baseDmg": 50, "ability": "magic_reflect", "evolvesFrom": "spirit_type2_2" },
    "spirit_type4_0": { "name": "ウッド・ゴーレム", "type": "spirit_type4", "image": "spirit_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 70, "skillName": "丸太パンチ", "skillCost": 2, "baseDmg": 50, "ability": "taunt", "evolvesFrom": "spirit" },
    "spirit_type4_2_0": { "name": "エルダー・トレント", "type": "spirit_type4_2", "image": "spirit_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 100, "skillName": "大自然の怒り", "skillCost": 4, "baseDmg": 60, "ability": "thorns", "evolvesFrom": "spirit_type4" },
    // "spirit_type4_3_0": { "name": "フォレスト・ガーディアン", "type": "spirit_type4_3", "image": "spirit_type4_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 130, "skillName": "森羅万象撃", "skillCost": 5, "baseDmg": 90, "ability": "piercing_juggernaut", "evolvesFrom": "spirit_type4_2" },
    "spirit_type5_0": { "name": "ドライ・リーフ", "type": "spirit_type5", "image": "spirit_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 30, "skillName": "かさかさの舞", "skillCost": 1, "baseDmg": 10, "ability": "mana_refund", "evolvesFrom": "spirit" },
    "spirit_type5_2_0": { "name": "オータム・リーフ", "type": "spirit_type5_2", "image": "spirit_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 50, "skillName": "紅葉の風", "skillCost": 2, "baseDmg": 30, "ability": "death_bomb", "evolvesFrom": "spirit_type5" },
    // "spirit_type5_3_0": { "name": "ウィンター・ウィル", "type": "spirit_type5_3", "image": "spirit_type5_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 100, "skillName": "絶対零度の静寂", "skillCost": 4, "baseDmg": 60, "ability": "absolute_sanctuary", "evolvesFrom": "spirit_type5_2" },
    "spirit_type1_0": { "name": "ポイズン・スポア", "type": "spirit_type1", "image": "spirit_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "猛毒胞子", "skillCost": 2, "baseDmg": 20, "ability": "venom_strike", "evolvesFrom": "spirit" },
    "spirit_type1_2_0": { "name": "マンドラゴラ・マザー", "type": "spirit_type1_2", "image": "spirit_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 70, "skillName": "発狂の悲鳴", "skillCost": 4, "baseDmg": 60, "ability": "curse_death", "evolvesFrom": "spirit_type1" },
    "spirit_type3_0": { "name": "リーフ・スカラー", "type": "spirit_type3", "image": "spirit_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "自然の記録", "skillCost": 2, "baseDmg": 30, "ability": "draw_card", "evolvesFrom": "spirit" },
    "spirit_type3_2_0": { "name": "オラクル・ツリー", "type": "spirit_type3_2", "image": "spirit_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 90, "skillName": "星の啓示", "skillCost": 0, "baseDmg": 40, "ability": "mana_sovereign", "evolvesFrom": "spirit_type3" },

    // 🧙 魔法使い (Magician) 進化ライン
    "magician_type4_0": { "name": "バトル・メイジ", "type": "magician_type4", "image": "magician_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "マジック・ブロウ", "skillCost": 2, "baseDmg": 40, "ability": "spell_echo", "evolvesFrom": "magician" },
    "magician_type4_2_0": { "name": "フレイム・マスター", "type": "magician_type4_2", "image": "magician_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "エクスプロージョン", "skillCost": 3, "baseDmg": 60, "ability": "burn_field", "evolvesFrom": "magician" },
    "magician_type4_3_0": { "name": "ウォー・ウォーロック", "type": "magician_type4_3", "image": "magician_type4_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 110, "skillName": "闘神のオーラ", "skillCost": 4, "baseDmg": 70, "ability": "impregnable_armor", "evolvesFrom": "magician_type4" },
    // "magician_type4_4_0": { "name": "ドラゴニック・メイジ", "type": "magician_type4_4", "image": "magician_type4_4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 120, "skillName": "竜鱗の拳", "skillCost": 5, "baseDmg": 90, "ability": "devour", "evolvesFrom": "magician_type4_3" },
    "magician_type1_0": { "name": "ヴェノム・ウィッチ", "type": "magician_type1", "image": "magician_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "カース・スペル", "skillCost": 2, "baseDmg": 30, "ability": "silence", "evolvesFrom": "magician" },
    "magician_type1_2_0": { "name": "ダーク・ウィザード", "type": "magician_type1_2", "image": "magician_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "ドレイン・タッチ", "skillCost": 3, "baseDmg": 40, "ability": "soul_drain", "evolvesFrom": "magician_type1" },
    "magician_type1_3_0": { "name": "アビス・ネクロマンサー", "type": "magician_type1_3", "image": "magician_type1_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 90, "skillName": "ソウル・リバース", "skillCost": 5, "baseDmg": 50, "ability": "raise_dead", "evolvesFrom": "magician_type1_2" },
    // "magician_type1_4_0": { "name": "デーモン・サマナー", "type": "magician_type1_4", "image": "magician_type1_4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 80, "skillName": "サクリファイス", "skillCost": 6, "baseDmg": 100, "ability": "doomsday_detonation", "evolvesFrom": "magician_type1_3" },
    "magician_type5_0": { "name": "グランド・メイガス", "type": "magician_type5", "image": "magician_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "洗練された魔術", "skillCost": 2, "baseDmg": 40, "ability": "mana_refund", "evolvesFrom": "magician" },
    "magician_type5_2_0": { "name": "タイム・ウォーカー", "type": "magician_type5_2", "image": "magician_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 80, "skillName": "クロノス・スライサー", "skillCost": 4, "baseDmg": 60, "ability": "time_manipulation", "evolvesFrom": "magician_type5" },
    "magician_type5_3_0": { "name": "アストラル・プロフェット", "type": "magician_type5_3", "image": "magician_type5_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "星の導き", "skillCost": 3, "baseDmg": 50, "ability": "absolute_sanctuary", "evolvesFrom": "magician_type5_2" },
    "magician_type2_0": { "name": "スター・イリュージョニスト", "type": "magician_type2", "image": "magician_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "イリュージョン", "skillCost": 2, "baseDmg": 30, "ability": "charm_enemy", "evolvesFrom": "magician" },
    "magician_type2_2_0": { "name": "アイス・クイーン", "type": "magician_type2_2", "image": "magician_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "フロスト・ノヴァ", "skillCost": 3, "baseDmg": 50, "ability": "fossilize", "evolvesFrom": "magician_type2" },
    "magician_type2_3_0": { "name": "プリズム・マギ", "type": "magician_type2_3", "image": "magician_type2_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 80, "skillName": "プリズム・リフレクト", "skillCost": 3, "baseDmg": 40, "ability": "magic_reflect", "evolvesFrom": "magician_type2_2" },
    // "magician_type2_4_0": { "name": "セレスティアル・プリンセス", "type": "magician_type2_4", "image": "magician_type2_4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "エンジェル・ハイロウ", "skillCost": 4, "baseDmg": 40, "ability": "mass_charm", "evolvesFrom": "magician_type2_3" },
    "magician_type3_0": { "name": "ステラ・スカラー", "type": "magician_type3", "image": "magician_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "天体観測", "skillCost": 1, "baseDmg": 20, "ability": "draw_card", "evolvesFrom": "magician" },
    "magician_type3_2_0": { "name": "コスモ・ルーラー", "type": "magician_type3_2", "image": "magician_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "グラビティ・フォール", "skillCost": 5, "baseDmg": 70, "ability": "mass_bounce", "evolvesFrom": "magician_type3" },
    "magician_type3_3_0": { "name": "アカシック・セージ", "type": "magician_type3_3", "image": "magician_type3_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 100, "skillName": "真理の門", "skillCost": 6, "baseDmg": 90, "ability": "absolute_evasion", "evolvesFrom": "magician_type3_2" },

    // 🐦 鳥 (Bird) 進化ライン
    "bird_type2_0": { "name": "フェアリーテイル", "type": "bird_type2", "image": "bird_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "魅惑の鱗粉", "skillCost": 2, "baseDmg": 20, "ability": "charm_enemy", "evolvesFrom": "bird" },
    "bird_type2_2_0": { "name": "セレスティアル・ピーコック", "type": "bird_type2_2", "image": "bird_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 80, "skillName": "銀河の尾羽", "skillCost": 4, "baseDmg": 60, "ability": "rebirth", "evolvesFrom": "bird_type2" },
    "bird_type4_0": { "name": "ハンターホーク", "type": "bird_type4", "image": "bird_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 50, "skillName": "ソニック・ダイブ", "skillCost": 3, "baseDmg": 50, "ability": "double_strike", "evolvesFrom": "bird" },
    "bird_type4_2_0": { "name": "ストーム・ガルーダ", "type": "bird_type4_2", "image": "bird_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "テンペスト", "skillCost": 5, "baseDmg": 80, "ability": "cataclysm", "evolvesFrom": "bird_type4" },
    "bird_type5_0": { "name": "ワイズオウル", "type": "bird_type5", "image": "bird_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "静寂の凝視", "skillCost": 2, "baseDmg": 30, "ability": "evasion", "evolvesFrom": "bird" },
    "bird_type5_2_0": { "name": "エンシェント・アーケオ", "type": "bird_type5_2", "image": "bird_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 100, "skillName": "始祖の鳴き声", "skillCost": 3, "baseDmg": 40, "ability": "absolute_sanctuary", "evolvesFrom": "bird_type5" },
    "bird_type1_0": { "name": "ナイトレイヴン", "type": "bird_type1", "image": "bird_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "凶兆のついばみ", "skillCost": 2, "baseDmg": 40, "ability": "discard_hand", "evolvesFrom": "bird" },
    "bird_type1_2_0": { "name": "カオス・コンドル", "type": "bird_type1_2", "image": "bird_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 70, "skillName": "デッド・ウィング", "skillCost": 4, "baseDmg": 80, "ability": "curse_death", "evolvesFrom": "bird_type1" },
    "bird_type3_0": { "name": "ルーンバード", "type": "bird_type3", "image": "bird_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 40, "skillName": "空中魔方陣", "skillCost": 3, "baseDmg": 40, "ability": "spell_echo", "evolvesFrom": "bird" },
    "bird_type3_2_0": { "name": "メカニックピジョン", "type": "bird_type3_2", "image": "bird_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "データリンク", "skillCost": 1, "baseDmg": 30, "ability": "mana_refund", "evolvesFrom": "bird" },
    "bird_type3_3_0": { "name": "アカシック・オウル", "type": "bird_type3_3", "image": "bird_type3_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 90, "skillName": "神眼の看破", "skillCost": 4, "baseDmg": 70, "ability": "absolute_evasion", "evolvesFrom": "bird_type3" },

    // ⚙️ ぜんまい (Machine) 進化ライン
    "machine_type2_0": { "name": "オルゴール・ドール", "type": "machine_type2", "image": "machine_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 60, "skillName": "ヒーリング・メロディ", "skillCost": 2, "baseDmg": 20, "ability": "heal_self", "evolvesFrom": "machine" },
    "machine_type2_2_0": { "name": "マジェスティック・クロック", "type": "machine_type2_2", "image": "machine_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 90, "skillName": "クロノス・ギア", "skillCost": 4, "baseDmg": 60, "ability": "time_manipulation", "evolvesFrom": "machine_type2" },
    "machine_type4_0": { "name": "ピストン・ワーカー", "type": "machine_type4", "image": "machine_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "スチームパンチ", "skillCost": 2, "baseDmg": 40, "ability": "haste", "evolvesFrom": "machine" },
    "machine_type4_2_0": { "name": "スチーム・ドレッドノート", "type": "machine_type4_2", "image": "machine_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 120, "skillName": "オーバードライブ", "skillCost": 5, "baseDmg": 80, "ability": "piercing_juggernaut", "evolvesFrom": "machine_type4" },
    "machine_type5_0": { "name": "アンティーク・ギア", "type": "machine_type5", "image": "machine_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 50, "skillName": "サビついた回転", "skillCost": 1, "baseDmg": 30, "ability": "mana_refund", "evolvesFrom": "machine" },
    "machine_type5_2_0": { "name": "モス・マシナリー", "type": "machine_type5_2", "image": "machine_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "自然修復", "skillCost": 3, "baseDmg": 40, "ability": "burst_spores", "evolvesFrom": "machine_type5" },
    "machine_type5_3_0": { "name": "ロスト・テクノロジー", "type": "machine_type5_3", "image": "machine_type5_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 150, "skillName": "静寂なる起動", "skillCost": 4, "baseDmg": 60, "ability": "impregnable_armor", "evolvesFrom": "machine_type5" },
    "machine_type1_0": { "name": "カースド・ドール", "type": "machine_type1", "image": "machine_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "ホラー・アプローチ", "skillCost": 2, "baseDmg": 30, "ability": "death_bomb", "evolvesFrom": "machine" },
    "machine_type1_2_0": { "name": "スクラップ・ホラー", "type": "machine_type1_2", "image": "machine_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 120, "skillName": "デッドリー・アマルガム", "skillCost": 6, "baseDmg": 120, "ability": "doomsday_detonation", "evolvesFrom": "machine_type1" },
    "machine_type3_0": { "name": "ディファレンス・エンジン", "type": "machine_type3", "image": "machine_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "高速演算", "skillCost": 3, "baseDmg": 40, "ability": "spell_echo", "evolvesFrom": "machine" },
    "machine_type3_2_0": { "name": "クォンタム・クロックワーク", "type": "machine_type3_2", "image": "machine_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "特異点計算", "skillCost": 0, "baseDmg": 50, "ability": "infinite_gear", "evolvesFrom": "machine_type3" },

    // 🪨 ゴーレム (Stone) 進化ライン
    "stone_type2_0": { "name": "クリスタル・ゴーレム", "type": "stone_type2", "image": "stone_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 80, "skillName": "クリスタル・レイ", "skillCost": 3, "baseDmg": 40, "ability": "magic_reflect", "evolvesFrom": "stone" },
    "stone_type2_2_0": { "name": "ブリリアント・コロッサス", "type": "stone_type2_2", "image": "stone_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 180, "skillName": "ダイヤ・プレッシャー", "skillCost": 5, "baseDmg": 60, "ability": "pure_aegis", "evolvesFrom": "stone_type2" },
    "stone_type4_0": { "name": "マグマ・ギガント", "type": "stone_type4", "image": "stone_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 90, "skillName": "ヴォルカニック・スマッシュ", "skillCost": 4, "baseDmg": 60, "ability": "burn_field", "evolvesFrom": "stone" },
    "stone_type4_2_0": { "name": "アイアン・フォートレス", "type": "stone_type4_2", "image": "stone_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "鉄の城壁", "skillCost": 3, "baseDmg": 60, "ability": "counter_attack", "evolvesFrom": "stone" },
    "stone_type4_3_0": { "name": "メテオ・タイタン", "type": "stone_type4_3", "image": "stone_type4_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 180, "skillName": "アース・シャター", "skillCost": 6, "baseDmg": 100, "ability": "trample", "evolvesFrom": "stone_type4" },
    "stone_type5_0": { "name": "モノリス・ルイン", "type": "stone_type5", "image": "stone_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 80, "skillName": "遺跡の守護", "skillCost": 2, "baseDmg": 30, "ability": "taunt", "evolvesFrom": "stone" },
    "stone_type5_2_0": { "name": "アストラル・モノリス", "type": "stone_type5_2", "image": "stone_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 140, "skillName": "悠久の刻", "skillCost": 4, "baseDmg": 30, "ability": "absolute_sanctuary", "evolvesFrom": "stone_type5" },
    "stone_type5_3_0": { "name": "エレメント・ハイブリッド", "type": "stone_type5_3", "image": "element_hybrid_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 130, "skillName": "イグニス・グレイス", "skillCost": 4, "baseDmg": 60, "ability": "splash_damage", "evolvesFrom": "stone_type5" },
    "stone_type1_0": { "name": "カースド・ガーゴイル", "type": "stone_type1", "image": "stone_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "ダーク・ダイブ", "skillCost": 3, "baseDmg": 50, "ability": "soul_drain", "evolvesFrom": "stone" },
    "stone_type1_2_0": { "name": "ヴォイド・オブシディアン", "type": "stone_type1_2", "image": "stone_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "虚無の引力", "skillCost": 5, "baseDmg": 80, "ability": "void_counter", "evolvesFrom": "stone_type1" },
    "stone_type3_0": { "name": "ルーン・ゴーレム", "type": "stone_type3", "image": "stone_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "ルーン・バレット", "skillCost": 2, "baseDmg": 30, "ability": "counter_attack", "evolvesFrom": "stone" },
    "stone_type3_2_0": { "name": "オラクル・ストーン", "type": "stone_type3_2", "image": "stone_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 90, "skillName": "重力反発", "skillCost": 0, "baseDmg": 40, "ability": "mana_sovereign", "evolvesFrom": "stone_type3" },

    // 🎈 風船 (Balloon) 進化ライン
    "balloon_type2_0": { "name": "シャボン・スライム", "type": "balloon_type2", "image": "balloon_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "プリズム・バブル", "skillCost": 2, "baseDmg": 20, "ability": "debuff_attack", "evolvesFrom": "balloon" },
    "balloon_type2_2_0": { "name": "プリズム・ドロップ", "type": "balloon_type2_2", "image": "balloon_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 60, "skillName": "グラス・シャワー", "skillCost": 3, "baseDmg": 40, "ability": "magic_reflect", "evolvesFrom": "balloon_type2" },
    "balloon_type2_3_0": { "name": "ファンタジー・パレード", "type": "balloon_type2_3", "image": "balloon_type2_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 80, "skillName": "ドリーム・フェスティバル", "skillCost": 4, "baseDmg": 30, "ability": "mass_charm", "evolvesFrom": "balloon_type2_2" },
    "balloon_type4_0": { "name": "マッスル・バルーン", "type": "balloon_type4", "image": "balloon_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "バウンド・タックル", "skillCost": 2, "baseDmg": 40, "ability": "burst_damage", "evolvesFrom": "balloon" },
    "balloon_type4_2_0": { "name": "ホットエア・バルーン", "type": "balloon_type4_2", "image": "balloon_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "バーナー・フレイム", "skillCost": 3, "baseDmg": 50, "ability": "burn_field", "evolvesFrom": "balloon_type4" },
    "balloon_type4_3_0": { "name": "ヘビー・ゼペリン", "type": "balloon_type4_3", "image": "balloon_type4_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 130, "skillName": "カーペット・ボミング", "skillCost": 5, "baseDmg": 70, "ability": "impregnable_armor", "evolvesFrom": "balloon_type4_2" },
    "balloon_type1_0": { "name": "スモッグ・ファントム", "type": "balloon_type1", "image": "balloon_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "ポイズン・スモーク", "skillCost": 2, "baseDmg": 30, "ability": "curse_death", "evolvesFrom": "balloon" },
    "balloon_type1_2_0": { "name": "ダーク・マイン", "type": "balloon_type1_2", "image": "balloon_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 50, "skillName": "コンタクト・ボム", "skillCost": 4, "baseDmg": 80, "ability": "nova_burst", "evolvesFrom": "balloon_type1" },
    "balloon_type1_3_0": { "name": "ナイトメア・ブラスト", "type": "balloon_type1_3", "image": "balloon_type1_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 70, "skillName": "絶望の破裂", "skillCost": 5, "baseDmg": 60, "ability": "mass_bounce", "evolvesFrom": "balloon_type1_2" },
    "balloon_type5_0": { "name": "デフレート・スライム", "type": "balloon_type5", "image": "balloon_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 2, "baseHp": 20, "skillName": "しわしわガード", "skillCost": 1, "baseDmg": 10, "ability": "absolute_sanctuary", "evolvesFrom": "balloon" },
    "balloon_type5_2_0": { "name": "フォッシル・バルーン", "type": "balloon_type5_2", "image": "balloon_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 90, "skillName": "エンシェント・フレア", "skillCost": 3, "baseDmg": 40, "ability": "thorns", "evolvesFrom": "balloon_type5" },
    "balloon_type3_0": { "name": "ウェザー・バルーン", "type": "balloon_type3", "image": "balloon_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "観測データ", "skillCost": 1, "baseDmg": 20, "ability": "draw_card", "evolvesFrom": "balloon" },
    "balloon_type3_2_0": { "name": "スコープ・バルーン", "type": "balloon_type3_2", "image": "balloon_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 50, "skillName": "レーザー・フォーカス", "skillCost": 3, "baseDmg": 40, "ability": "spell_echo", "evolvesFrom": "balloon_type3" },
    "balloon_type3_3_0": { "name": "サテライト・アイ", "type": "balloon_type3_3", "image": "balloon_type3_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 80, "skillName": "オービタル・ストライク", "skillCost": 5, "baseDmg": 70, "ability": "absolute_evasion", "evolvesFrom": "balloon_type3_2" },

    // 👻 ゴースト (Ghost) 進化ライン
    "ghost_type2_0": { "name": "ルミナス・ソウル", "type": "ghost_type2", "image": "ghost_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "導きの光", "skillCost": 2, "baseDmg": 30, "ability": "burst_spores", "evolvesFrom": "ghost" },
    "ghost_type2_2_0": { "name": "ホーリー・ファントム", "type": "ghost_type2_2", "image": "ghost_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 80, "skillName": "ディヴァイン・ライト", "skillCost": 4, "baseDmg": 60, "ability": "pure_aegis", "evolvesFrom": "ghost_type2" },
    "ghost_type4_0": { "name": "ポルターガイスト", "type": "ghost_type4", "image": "ghost_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 50, "skillName": "サイコ・クラッシュ", "skillCost": 3, "baseDmg": 50, "ability": "haunt", "evolvesFrom": "ghost" },
    "ghost_type4_2_0": { "name": "ファントム・ジャガーノート", "type": "ghost_type4_2", "image": "ghost_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "怨念の蹂躙", "skillCost": 5, "baseDmg": 80, "ability": "piercing_juggernaut", "evolvesFrom": "ghost_type4" },
    "ghost_type5_0": { "name": "エイシェント・レイス", "type": "ghost_type5", "image": "ghost_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "魂の吸収", "skillCost": 3, "baseDmg": 40, "ability": "soul_drain", "evolvesFrom": "ghost" },
    "ghost_type5_2_0": { "name": "エターナル・ファラオ", "type": "ghost_type5_2", "image": "ghost_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 130, "skillName": "王の呪い", "skillCost": 6, "baseDmg": 80, "ability": "soul_reap", "evolvesFrom": "ghost_type5" },
    "ghost_type1_0": { "name": "シャドウ・リーパー", "type": "ghost_type1", "image": "ghost_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 40, "skillName": "デス・サイズ", "skillCost": 3, "baseDmg": 70, "ability": "curse_death", "evolvesFrom": "ghost" },
    "ghost_type1_2_0": { "name": "デス・ブリンガー", "type": "ghost_type1_2", "image": "ghost_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 90, "skillName": "死の宣告", "skillCost": 5, "baseDmg": 100, "ability": "discard_hand", "evolvesFrom": "ghost_type1" },
    "ghost_type3_0": { "name": "アカデミー・ゴースト", "type": "ghost_type3", "image": "ghost_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "ポルター・リード", "skillCost": 2, "baseDmg": 30, "ability": "spell_echo", "evolvesFrom": "ghost" },
    "ghost_type3_2_0": { "name": "テレパス・ソウル", "type": "ghost_type3_2", "image": "ghost_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 50, "skillName": "マインド・ハック", "skillCost": 3, "baseDmg": 40, "ability": "charm_enemy", "evolvesFrom": "ghost_type3" },
    // "ghost_type3_3_0": { "name": "マスター・リッチ", "type": "ghost_type3_3", "image": "ghost_type3_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 100, "skillName": "アブソリュート・マジック", "skillCost": 6, "baseDmg": 90, "ability": "mass_bounce", "evolvesFrom": "ghost_type3_2" },

    // 🪲 かぶとむし (Beetle) 進化ライン
    "beetle_type4_0": { "name": "タイタン・ホーン", "type": "beetle_type4", "image": "beetle_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 80, "skillName": "ギガ・スロウ", "skillCost": 4, "baseDmg": 80, "ability": "trample", "evolvesFrom": "beetle" },
    "beetle_type5_0": { "name": "アンバー・スカラベ", "type": "beetle_type5", "image": "beetle_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 70, "skillName": "琥珀の盾", "skillCost": 2, "baseDmg": 20, "ability": "heavy_armor", "evolvesFrom": "beetle" },
    "beetle_type5_2_0": { "name": "エターナル・アンモナイト", "type": "beetle_type5_2", "image": "beetle_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 150, "skillName": "化石の檻", "skillCost": 4, "baseDmg": 50, "ability": "fossilize", "evolvesFrom": "beetle_type5" },
    "beetle_type2_0": { "name": "ジュエル・インセクト", "type": "beetle_type2", "image": "beetle_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 50, "skillName": "ジュエル・フラッシュ", "skillCost": 2, "baseDmg": 30, "ability": "magic_reflect", "evolvesFrom": "beetle" },
    "beetle_type2_2_0": { "name": "ルーセント・スタッグ", "type": "beetle_type2_2", "image": "beetle_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 60, "skillName": "ムーンライト・シザー", "skillCost": 3, "baseDmg": 50, "ability": "mass_charm", "evolvesFrom": "beetle" },
    "beetle_type2_3_0": { "name": "フェアリー・モルフォ", "type": "beetle_type2_3", "image": "beetle_type2_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 80, "skillName": "イリュージョン・ダンス", "skillCost": 4, "baseDmg": 50, "ability": "absolute_evasion", "evolvesFrom": "beetle_type2" },
    "beetle_type2_4_0": { "name": "セイクリッド・ビートル", "type": "beetle_type2_4", "image": "beetle_type2_4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 120, "skillName": "神光のオーラ", "skillCost": 5, "baseDmg": 80, "ability": "pure_aegis", "evolvesFrom": "beetle_type2_2" },
    "beetle_type3_0": { "name": "ブレイン・バグ", "type": "beetle_type3", "image": "beetle_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 60, "skillName": "フェロモン・コマンド", "skillCost": 0, "baseDmg": 20, "ability": "mana_sovereign", "evolvesFrom": "beetle" },
    "beetle_type1_0": { "name": "ブラッド・シザー", "type": "beetle_type1", "image": "beetle_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 60, "skillName": "ギロチン・シザー", "skillCost": 3, "baseDmg": 60, "ability": "haste", "evolvesFrom": "beetle" },
    "beetle_type4_2_0": { "name": "ギガント・カイザー", "type": "beetle_type4_2", "image": "beetle_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 200, "skillName": "カイザー・バスター", "skillCost": 6, "baseDmg": 100, "ability": "impregnable_armor", "evolvesFrom": "beetle_type4" },

    // 🌱 つぼみ (Seed) 進化ライン
    "seed_type4_0": { "name": "ワイルド・ルーツ", "type": "seed_type4", "image": "seed_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 60, "skillName": "大地の怒り", "skillCost": 3, "baseDmg": 40, "ability": "devour", "evolvesFrom": "seed" },
    "seed_type4_2_0": { "name": "ガイア・オメガプランツ", "type": "seed_type4_2", "image": "seed_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 140, "skillName": "アース・イーター", "skillCost": 6, "baseDmg": 90, "ability": "apex_predator", "evolvesFrom": "seed_type4" },
    "seed_type1_0": { "name": "ペイン・アイビー", "type": "seed_type1", "image": "seed_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 50, "skillName": "ポイズン・ソーン", "skillCost": 2, "baseDmg": 30, "ability": "venom_strike", "evolvesFrom": "seed" },
    "seed_type1_2_0": { "name": "パラサイト・イグドラシル", "type": "seed_type1_2", "image": "seed_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "デッドリー・ルーツ", "skillCost": 5, "baseDmg": 60, "ability": "life_drain", "evolvesFrom": "seed_type1" },
    "seed_type5_0": { "name": "ミスティック・ボンサイ", "type": "seed_type5", "image": "seed_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 60, "skillName": "侘び寂びの心", "skillCost": 1, "baseDmg": 30, "ability": "mana_refund", "evolvesFrom": "seed" },
    "seed_type5_2_0": { "name": "ペトリファイド・ウッド", "type": "seed_type5_2", "image": "seed_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 120, "skillName": "永遠の年輪", "skillCost": 3, "baseDmg": 50, "ability": "impregnable_armor", "evolvesFrom": "seed_type5" },
    "seed_type3_0": { "name": "アーカイブ・ツリー", "type": "seed_type3", "image": "seed_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 4, "baseHp": 50, "skillName": "歴史の葉擦れ", "skillCost": 2, "baseDmg": 40, "ability": "draw_card", "evolvesFrom": "seed" },
    "seed_type3_2_0": { "name": "ニューロ・プラント", "type": "seed_type3_2", "image": "seed_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 70, "skillName": "シナプス・リンク", "skillCost": 3, "baseDmg": 40, "ability": "spell_echo", "evolvesFrom": "seed_type3" },
    "seed_type3_3_0": { "name": "アカシック・ツリー", "type": "seed_type3_3", "image": "seed_type3_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 150, "skillName": "宇宙の理", "skillCost": 0, "baseDmg": 50, "ability": "mana_sovereign", "evolvesFrom": "seed_type3_2" },
    "seed_type2_0": { "name": "アロマ・ブルーム", "type": "seed_type2", "image": "seed_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 3, "baseHp": 40, "skillName": "魅惑の香り", "skillCost": 2, "baseDmg": 30, "ability": "charm_enemy", "evolvesFrom": "seed" },
    "seed_type2_2_0": { "name": "エデン・ブロッサム", "type": "seed_type2_2", "image": "seed_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 100, "skillName": "パラダイス・ロスト", "skillCost": 4, "baseDmg": 50, "ability": "mass_charm", "evolvesFrom": "seed_type2" },

    // 🐲 ドラゴン (Dragon) 進化ライン
    "dragon_type4_0": { "name": "グランド・ワイバーン", "type": "dragon_type4", "image": "dragon_type4_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 90, "skillName": "エアロ・ブラスト", "skillCost": 4, "baseDmg": 70, "ability": "piercing_juggernaut", "evolvesFrom": "dragon" },
    "dragon_type4_2_0": { "name": "ドレッド・バハムート", "type": "dragon_type4_2", "image": "dragon_type4_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 180, "skillName": "メガフレア", "skillCost": 6, "baseDmg": 120, "ability": "cataclysm", "evolvesFrom": "dragon_type4" },
    "dragon_type1_0": { "name": "カースド・ドレイク", "type": "dragon_type1", "image": "dragon_type1_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "ミアズマ・ブレス", "skillCost": 3, "baseDmg": 50, "ability": "roar", "evolvesFrom": "dragon" },
    "dragon_type1_2_0": { "name": "アビス・ウロボロス", "type": "dragon_type1_2", "image": "dragon_type1_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 140, "skillName": "エンドレス・ヴォイド", "skillCost": 5, "baseDmg": 100, "ability": "void_counter", "evolvesFrom": "dragon_type1" },
    "dragon_type5_0": { "name": "エンシェント・ヴルム", "type": "dragon_type5", "image": "dragon_type5_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 6, "baseHp": 100, "skillName": "アース・クエイク", "skillCost": 4, "baseDmg": 60, "ability": "absolute_sanctuary", "evolvesFrom": "dragon" },
    "dragon_type5_2_0": { "name": "ジオ・ククルカン", "type": "dragon_type5_2", "image": "dragon_type5_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 160, "skillName": "星の息吹", "skillCost": 5, "baseDmg": 80, "ability": "wrath", "evolvesFrom": "dragon_type5" },
    "dragon_type3_0": { "name": "アーク・リヴァイアサン", "type": "dragon_type3", "image": "dragon_type3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 7, "baseHp": 100, "skillName": "ハイドロ・カノン", "skillCost": 4, "baseDmg": 60, "ability": "time_manipulation", "evolvesFrom": "dragon" },
    "dragon_type3_2_0": { "name": "ギャラクシー・ノヴァ", "type": "dragon_type3_2", "image": "dragon_type3_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 10, "baseHp": 150, "skillName": "スーパーノヴァ", "skillCost": 6, "baseDmg": 100, "ability": "nova_burst", "evolvesFrom": "dragon_type3" },
    "dragon_type2_0": { "name": "クリスタル・オーレリア", "type": "dragon_type2", "image": "dragon_type2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 5, "baseHp": 70, "skillName": "ジュエル・ブレス", "skillCost": 3, "baseDmg": 50, "ability": "charm_enemy", "evolvesFrom": "dragon" },
    "dragon_type2_2_0": { "name": "セラフィック・応龍", "type": "dragon_type2_2", "image": "dragon_type2_2_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 9, "baseHp": 130, "skillName": "神々の裁き", "skillCost": 5, "baseDmg": 80, "ability": "pure_aegis", "evolvesFrom": "dragon_type2" },
    "dragon_type2_3_0": { "name": "プリズマティカ", "type": "dragon_type2_3", "image": "dragon_type2_3_card.png", "imageIndex": 0, "offsetX": 0, "offsetY": 0, "zoomX": 300, "zoomY": 500, "baseCost": 8, "baseHp": 110, "skillName": "オーロラ・レイ", "skillCost": 4, "baseDmg": 70, "ability": "magic_reflect", "evolvesFrom": "dragon_type2" },

    // 🎒 サポートカード
    'support_0': { name: "鉄鉱石の塊", type: "item", image: "support_card.png", imageIndex: 0, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 1, baseHp: 0, skillName: "錬成", skillCost: 0, baseDmg: 0, ability: "item_hp_up" },
    'support_3': { name: "建築用の木材", type: "item", image: "support_card.png", imageIndex: 3, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 2, baseHp: 0, skillName: "拠点補修", skillCost: 0, baseDmg: 0, ability: "item_taunt" },
    'support_6': { name: "三種の霊薬", type: "item", image: "support_card.png", imageIndex: 6, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 0, skillName: "ガブ飲み", skillCost: 0, baseDmg: 0, ability: "item_heal_cleanse" },
    'support_9': { name: "古の魔導書", type: "item", image: "support_card.png", imageIndex: 9, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 0, skillName: "知識の探求", skillCost: 0, baseDmg: 0, ability: "item_draw" },
    'support_12': { name: "輝くクリスタル", type: "item", image: "support_card.png", imageIndex: 12, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 0, baseHp: 0, skillName: "マナ抽出", skillCost: 0, baseDmg: 0, ability: "item_mana_boost" },
    'support_1': { name: "静寂の森の小屋", type: "field", image: "support_card.png", imageIndex: 1, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 2, baseHp: 100, skillName: "拠点防衛", skillCost: 0, baseDmg: 0, ability: "field_forest" },
    'support_4': { name: "栄華を極めた城", type: "field", image: "support_card.png", imageIndex: 4, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 5, baseHp: 200, skillName: "城壁", skillCost: 0, baseDmg: 0, ability: "field_castle" },
    'support_7': { name: "廃れたカジノ", type: "field", image: "support_card.png", imageIndex: 7, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 120, skillName: "一攫千金", skillCost: 0, baseDmg: 0, ability: "field_casino" },
    'support_10': { name: "ドクロの洞窟", type: "field", image: "support_card.png", imageIndex: 10, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 150, skillName: "恐怖のオーラ", skillCost: 0, baseDmg: 0, ability: "field_miasma" },
    'support_13': { name: "結晶の鉱脈", type: "field", image: "support_card.png", imageIndex: 13, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 4, baseHp: 150, skillName: "採掘場", skillCost: 0, baseDmg: 0, ability: "field_mana" },    'support_2': { name: "みんなで大漁", type: "action", image: "support_card.png", imageIndex: 2, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 2, baseHp: 0, skillName: "釣り上げる", skillCost: 0, baseDmg: 0, ability: "action_draw_3" },
    'support_5': { name: "武器の鍛造", type: "action", image: "support_card.png", imageIndex: 5, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 0, skillName: "カンカン", skillCost: 0, baseDmg: 20, ability: "action_atk_up" },
    'support_8': { name: "未知の洞窟探検", type: "action", image: "support_card.png", imageIndex: 8, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 3, baseHp: 0, skillName: "お宝発見", skillCost: 0, baseDmg: 0, ability: "action_search_evo" },
    'support_11': { name: "豊穣の畑仕事", type: "action", image: "support_card.png", imageIndex: 11, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 2, baseHp: 0, skillName: "収穫", skillCost: 0, baseDmg: 0, ability: "action_heal_face" },
    'support_14': { name: "キャンプファイヤー", type: "action", image: "support_card.png", imageIndex: 14, offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500, baseCost: 1, baseHp: 0, skillName: "大宴会", skillCost: 0, baseDmg: 0, ability: "action_heal_all" },
    // 👤 人物カード (Person)
    "person_farmer": {
        "name": "農家",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 0,
        "baseCost": 2,
        "baseHp": 40,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_farmer",
        "personSkills": [
            {
                "name": "おすそわけ",
                "cost": 1,
                "desc": "味方1体を 15 回復する"
            },
            {
                "name": "豊穣の祈り",
                "cost": 3,
                "desc": "1枚ドローし、最大マナを+1する"
            }
        ],
        "sx": 630,
        "sy": -118,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_fisherman": {
        "name": "漁師",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 1,
        "baseCost": 3,
        "baseHp": 40,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_fisherman",
        "personSkills": [
            {
                "name": "一本釣り",
                "cost": 1,
                "desc": "敵1体に 10 ダメージ (守護・潜伏無視)"
            },
            {
                "name": "大漁網",
                "cost": 4,
                "desc": "敵モンスター1体を山札に戻す"
            }
        ],
        "sx": 1316,
        "sy": -118,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_builder": {
        "name": "建築士",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 2,
        "baseCost": 3,
        "baseHp": 50,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_builder",
        "personSkills": [
            {
                "name": "即席バリケード",
                "cost": 2,
                "desc": "味方1体にこのターンのみ「守護」を付与"
            },
            {
                "name": "突貫工事",
                "cost": 4,
                "desc": "フィールドHP 50回復かリーダー 40回復"
            }
        ],
        "sx": 622,
        "sy": 573,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_chef": {
        "name": "料理人",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 3,
        "baseCost": 3,
        "baseHp": 40,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_chef",
        "personSkills": [
            {
                "name": "特製スパイス",
                "cost": 1,
                "desc": "指定した味方モンスターの攻撃力を 永続で+10"
            },
            {
                "name": "究極のフルコース",
                "cost": 4,
                "desc": "行動済みの味方を「未行動」に戻し、全回復"
            }
        ],
        "sx": -52,
        "sy": 573,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_smith": {
        "name": "鍛冶師",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 4,
        "baseCost": 4,
        "baseHp": 50,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_smith",
        "personSkills": [
            {
                "name": "武器研磨",
                "cost": 2,
                "desc": "味方1体の次の攻撃に「+20」ダメージを付与"
            },
            {
                "name": "会心の武具",
                "cost": 4,
                "desc": "味方1体にこのターンのみ「貫通」を付与"
            }
        ],
        "sx": 1316,
        "sy": 574,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_adventurer": {
        "name": "冒険家",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 5,
        "baseCost": 2,
        "baseHp": 30,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_adventurer",
        "personSkills": [
            {
                "name": "マッピング",
                "cost": 1,
                "desc": "カードを1枚引く"
            },
            {
                "name": "秘境の発見",
                "cost": 3,
                "desc": "山札から「進化後」モンスター1体をサーチ"
            }
        ],
        "sx": -48,
        "sy": -60,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_king": {
        "name": "王様",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 6,
        "baseCost": 6,
        "baseHp": 80,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_king",
        "personSkills": [
            {
                "name": "王の号令",
                "cost": 2,
                "desc": "味方モンスター全員の攻撃力を +10 する"
            },
            {
                "name": "王の裁き",
                "cost": 6,
                "desc": "HP 40以下の敵全員をすべて破壊する"
            }
        ],
        "sx": -49,
        "sy": 1264,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_captain": {
        "name": "隊長",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 7,
        "baseCost": 5,
        "baseHp": 60,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_captain",
        "personSkills": [
            {
                "name": "陣形指示",
                "cost": 2,
                "desc": "このターン、味方全体が受けるダメージを -10"
            },
            {
                "name": "総員突撃",
                "cost": 5,
                "desc": "このターン、味方モンスター全員が「連撃」化"
            }
        ],
        "sx": 630,
        "sy": 1264,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    },
    "person_soldier": {
        "name": "兵士",
        "type": "person",
        "image": "character_card.png",
        "imageIndex": 8,
        "baseCost": 1,
        "baseHp": 30,
        "skillName": "人物スキル",
        "skillCost": 0,
        "baseDmg": 0,
        "ability": "person_soldier",
        "personSkills": [
            {
                "name": "槍の突き",
                "cost": 1,
                "desc": "敵1体に 10 ダメージを与える"
            },
            {
                "name": "決死の覚悟",
                "cost": 3,
                "desc": "敵1体に 40 ダメージ ＆ 自身に 20 ダメージ"
            }
        ],
        "sx": 1316,
        "sy": 1264,
        "sw": 795,
        "sh": 731,
        "scaleX": 0.3,
        "scaleY": 0.29999999999999966
    }
};

// // ==========================================
// // 2. ヘルパー関数（タイプ名取得など）
// // ==========================================
// window.getCardTypeName = function(type) {
//     if (type.includes('type1')) return '闇';
//     if (type.includes('type2')) return '美';
//     if (type.includes('type3_2')) return '賢+';
//     if (type.includes('type3')) return '賢';
//     if (type.includes('type4_2')) return '活+';
//     if (type.includes('type4')) return '活';
//     if (type.includes('type5')) return '老';
//     if (type === 'robot') return '機';
    
//     const map = {
//         'dragon':'竜', 'magician':'魔', 'spirit':'精', 'stone':'岩',
//         'machine':'械', 'ghost':'霊', 'bird':'鳥', 'beetle':'虫',
//         'seed':'草', 'balloon':'風', 'item':'具', 'action':'技', 'field':'地'
//     };
//     return map[type] || '無';
// };

// window.getEvolvesFromName = function(evolvesFromType) {
//     const map = {
//         'robot': '基本ロボット (機)',
//         'robot_type1': 'キリング系 (闇)',
//         'robot_type2': 'アイドル系 (美)',
//         'robot_type3': 'アナリティクス系 (賢)',
//         'robot_type3_2': 'マザー系 (賢+)',
//         'robot_type4': 'タンク系 (活)',
//         'robot_type4_2': 'アサルト系 (活+)',
//         'robot_type5': 'スクラップ系 (老)'
//     };
//     return map[evolvesFromType] || evolvesFromType;
// };

// window.getActualCost = function(owner, card) {
//     let cost = card.cost;
//     if (card.type === 'action') {
//         if (owner.field.some(c => c.ability === 'all_zero_cost' && !c.isDead)) return 0;
//         if (owner.field.some(c => c.ability === 'aura_action_cost' && !c.isDead)) cost = Math.max(0, cost - 1);
//     }
//     return cost;
// };

// window.checkDeath = function(card, owner, htmlId) {
//     if (card.hp <= 0 && !card.isDead) {
//         if (card.ability === "eternal_rebirth" && !card._reborn) {
//             card.hp = 190; 
//             card._reborn = true;
//             window.showVFX(htmlId, 'heal', '蘇生!');
//             window.showBattleMessage(`⏳ 【悠久の再生】\n${card.name} が時を越えて復活した！`);
//         } else {
//             card.isDead = true;
//             if (!owner.graveyard) owner.graveyard = [];
//             owner.graveyard.push(card); 
//         }
//     }
// };

// // ==========================================
// // 2. 引退したAIからカードを生成する関数 (進化カード＆ボーナス対応版)
// // ==========================================
// window.generateCardFromAI = function(aiPet) {
//     let rawRace = aiPet.currentSkin || aiPet.baseType || 'robot';
    
//     // 1. まず、引退時の姿（Skin）に完全一致するカード群を探す（進化系なら確定でヒットする）
//     let candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === rawRace);
    
//     // 2. もし見つからなければ（seed_fire 等の属性違いの場合）、'_' で分割した基本種族で再検索
//     if (candidateKeys.length === 0) {
//         let baseRace = rawRace.split('_')[0];
//         candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === baseRace);
//     }
    
//     // それでも無ければデフォルトの robot を対象にする
//     if (candidateKeys.length === 0) {
//         candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === 'robot');
//     }

//     // 候補の中からランダムに1枚選ぶ（進化カードの場合は候補が1枚しかないので確定ドロップになる）
//     const masterId = candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
//     const masterData = window.TCG_MASTER[masterId];
    
//     if (!masterData) return null;

//     // AIの最終ステータスをカードの強さに還元するボーナス
//     const hpBonus = Math.floor((aiPet.stats.power || 0) / 10);
//     const dmgBonus = Math.floor((aiPet.stats.intel || 0) / 10);

//     const newCard = {
//         uid: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000), 
//         masterId: masterId, 
//         name: masterData.name, 
//         type: masterData.type,
//         cost: masterData.baseCost, 
//         hp: masterData.baseHp + hpBonus, // 育成ボーナス加算
//         skillName: masterData.skillName, 
//         skillCost: masterData.skillCost,
//         damage: masterData.baseDmg > 0 ? masterData.baseDmg + dmgBonus : 0, // 育成ボーナス加算
//         ability: masterData.ability, 
//         image: masterData.image, 
//         imageIndex: masterData.imageIndex,
//         // ==========================================
//         // ★ ここを追加！画像切り取り用の座標データをカードに引き継ぐ！
//         sx: masterData.sx,
//         sy: masterData.sy,
//         sw: masterData.sw,
//         sh: masterData.sh,
//         // ==========================================
//         evolvesFrom: masterData.evolvesFrom // ★超重要：進化元の情報を引き継ぐ
//     };

//     window.TCG.myCollection.push(newCard);
//     window.saveTCGData();
//     window.showCardUnlockPopup(newCard, "🎉 AIの生涯がカードに刻まれた！ 🎉");
//     return newCard;
// };

// window.unlockSupportCard = function(masterId, currentGen, categoryName = "サポート") {
//     const masterData = window.TCG_MASTER[masterId];
//     if (!masterData) return;
//     if (!window.TCG.unlockedHistory[currentGen]) window.TCG.unlockedHistory[currentGen] = [];
//     if (window.TCG.unlockedHistory[currentGen].includes(masterId)) return;

//     window.TCG.unlockedHistory[currentGen].push(masterId);

//     const newCard = {
//         uid: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
//         masterId: masterId, name: masterData.name, type: masterData.type,
//         cost: masterData.baseCost, hp: masterData.baseHp,
//         skillName: masterData.skillName, skillCost: masterData.skillCost,
//         damage: masterData.baseDmg, ability: masterData.ability,
//         image: masterData.image, imageIndex: masterData.imageIndex
//     };

//     window.TCG.myCollection.push(newCard);
//     window.saveTCGData();
//     window.showCardUnlockPopup(newCard, `✨ 新しい${categoryName}カードの記憶を獲得！ ✨`);
// };

// // ==========================================
// // 4. HTML描画機能（新旧ハイブリッド・完全切り抜き対応版）
// // ==========================================
// window.renderCardHTML = function(card) {
//     // ==========================================
//     // ★執念のパッチ：古いセーブデータにも最新の画角を絶対に適用する！
//     // ==========================================
//     if (typeof window.TCG_MASTER !== 'undefined') {
//         let masterData = null;
        
//         // 1. まずカードのID（masterId）からデータを引っ張る
//         if (card.masterId && window.TCG_MASTER[card.masterId]) {
//             masterData = window.TCG_MASTER[card.masterId];
//         }

//         // 2. ★最強の安全装置★
//         // IDで見つからなかった場合、あるいは「見つかったけど sx が設定されていない古いデータ」だった場合、
//         // TCG_MASTER全体から「名前が同じで、かつ sx が調整済みの最新データ」を全力で探す！
//         if (!masterData || masterData.sx === undefined) {
//             const safeName = (card.name || "").trim();
            
//             // sxを持っている同名カードを探す！
//             const adjustedKey = Object.keys(window.TCG_MASTER).find(k => {
//                 const target = window.TCG_MASTER[k];
//                 return target && target.name && target.name.trim() === safeName && target.sx !== undefined;
//             });

//             if (adjustedKey) {
//                 masterData = window.TCG_MASTER[adjustedKey]; // 調整済みデータを発見！上書き！
//             } else {
//                 // sxがなくても、とりあえず名前が一致するものを保険で探す
//                 const fallbackKey = Object.keys(window.TCG_MASTER).find(k => {
//                     const target = window.TCG_MASTER[k];
//                     return target && target.name && target.name.trim() === safeName;
//                 });
//                 if (fallbackKey) masterData = window.TCG_MASTER[fallbackKey];
//             }
//         }

//         if (masterData) {
//             // TCG_MASTER側に調整済みの座標データがあれば、カードの見た目として強制適用する！
//             if (masterData.sx !== undefined) card.sx = masterData.sx;
//             if (masterData.sy !== undefined) card.sy = masterData.sy;
//             if (masterData.sw !== undefined) card.sw = masterData.sw;
//             if (masterData.sh !== undefined) card.sh = masterData.sh;
//             if (masterData.scaleX !== undefined) card.scaleX = masterData.scaleX;
//             if (masterData.scaleY !== undefined) card.scaleY = masterData.scaleY;
//             if (masterData.image) card.image = masterData.image; 
//         }
//     }
//     // ==========================================

//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;

//     let abilityText = card.abilityTextOverride || "";
//     if (!abilityText) {
//         if (card.ability === "taunt") abilityText = "【かばう】(相手の攻撃を代わりに受ける)";
//         if (card.ability === "stealth") abilityText = "【潜伏】(攻撃するまでターゲットにされない)";
//         if (card.ability === "heal_self") abilityText = "【修復】(自分のHPを回復する)";
//         if (card.ability === "draw_card") abilityText = "【ドロー】(山札からカードを引く)";
//         if (card.ability === "flight") abilityText = "【飛行】(かばうを無視して攻撃できる)";
//         if (card.ability === "mana_ramp") abilityText = "【成長】(自分の最大マナを+1する)";
//         if (card.ability === "pierce_recoil") abilityText = "【暴走回路】(かばう無視・攻撃時自身に10ダメ)";
//         if (card.ability === "aoe_heal_play") abilityText = "【ファンサービス】(登場時、味方全員を20回復)";
//         if (card.ability === "start_draw") abilityText = "【超演算】(自ターン開始時、1枚ドロー)";
//         if (card.ability === "aura_action_cost") abilityText = "【万能魔法】(場にいる間、アクションコスト-1)";
//         if (card.ability === "heavy_armor") abilityText = "【重装甲】(受けるダメージを常に-10)";
//         if (card.ability === "snipe_play") abilityText = "【殲滅モード】(登場時、ランダムな敵に30ダメ)";
//         if (card.ability === "end_heal") abilityText = "【悠久の風化】(ターン終了時、自身のHPを20回復)";
//         if (card.ability === "god_strike") abilityText = "【神の一撃】(貫通・攻撃時ランダムな敵1体即死)";
//         if (card.ability === "cyber_miracle") abilityText = "【電脳の奇跡】(ターン終了時、味方全回復＆最大HP+10)";
//         if (card.ability === "dimension_hack") abilityText = "【超次元ハック】(登場時、敵手札2枚破壊＆2枚ドロー)";
//         if (card.ability === "all_zero_cost") abilityText = "【森羅万象】(場にいる間、アクションのコストが0)";
//         if (card.ability === "absolute_field") abilityText = "【絶対領域】(受けるあらゆるダメージを1にする)";
//         if (card.ability === "crimson_end") abilityText = "【終末の紅蓮】(登場時、敵リーダーと全敵に50ダメ)";
//         if (card.ability === "star_breath") abilityText = "【星の息吹】(ターン開始時、マナ+2＆リーダー30回復)";
//         if (card.ability === "perfect_predation") abilityText = "【完全捕食】(登場時、ランダムな敵1体を破壊し吸収)";
//         if (card.ability === "nightmare_rule") abilityText = "【悪夢の君臨】(登場時、全敵のHPを強制半減)";
//         if (card.ability === "star_hope") abilityText = "【希望の星】(登場時、味方全回復＆全員に「かばう」付与)";
//         if (card.ability === "divine_grace") abilityText = "【神の恩寵】(ターン終了時、破壊された味方1体を蘇生)";
//         if (card.ability === "heaven_punishment") abilityText = "【天罰】(登場時、全敵モンスターに50ダメージ)";
//         if (card.ability === "event_horizon") abilityText = "【事象の地平】(ターン終了時、ランダムな敵1体を山札に戻す)";
//         if (card.ability === "truth_overwrite") abilityText = "【真理の書換】(登場時、3枚ドロー＆最大マナ+3)";
//         if (card.ability === "heaven_judgement") abilityText = "【天の裁き】(ターン開始時、敵リーダーと全敵に20ダメ)";
//         if (card.ability === "absolute_fortress") abilityText = "【絶対要塞】(受けるダメージを常に -20 する)";
//         if (card.ability === "dimension_drill") abilityText = "【次元穿孔】(貫通・与ダメと同じ値を敵リーダーにも与える)";
//         if (card.ability === "time_manipulation") abilityText = "【時空操作】(登場時、行動済みの味方を未行動にする)";
//         if (card.ability === "super_gravity") abilityText = "【超重力】(登場時、自身以外の全モンスターに100ダメ)";
//         if (card.ability === "eternal_rebirth") abilityText = "【悠久の再生】(破壊された時、一度だけHP満タンで復活)";
//     }

//     // ★HTML描画用の賢い画像パス解決（キー名でもファイル名でも動くようにする）
//     let imgPath = card.image || 'characters.png';
//     if (typeof imageSources !== 'undefined' && imageSources[imgPath]) {
//         imgPath = imageSources[imgPath]; // もし「dragon_card」のようなキー名なら、実際のパスに変換
//     }

//     const flavorText = (card.type === 'item' || card.type === 'action' || card.type === 'field')
//         ? "冒険の途中で見つけた、かけがえのない記憶の欠片。" 
//         : "AIがこれまでの人生で培ってきた、確かな成長の証。";

//     let displayCost = card.cost;
//     if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
//         let owner = window.TCG_BATTLE.player.hand.includes(card) ? window.TCG_BATTLE.player : null;
//         if (!owner && window.TCG_BATTLE.cpu.hand.includes(card)) owner = window.TCG_BATTLE.cpu;
//         if (owner) displayCost = window.getActualCost(owner, card);
//     }
//     const costColor = displayCost < card.cost ? "#4CAF50" : "#FFD700";
//     const typeName = window.getCardTypeName(card.type);

//     let html = `
//     <div class="tcg-card" style="width: 180px; height: 260px; background-color: #222; border: 4px solid #555; border-radius: 12px; position: relative; font-family: sans-serif; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; user-select: none;">`;

//     if (isUnlocked) {
//         html += `<div style="position: absolute; top: 6px; left: 6px; width: 28px; height: 28px; background: ${costColor}; color: #000; border-radius: 50%; font-weight: bold; font-size: 18px; display: flex; justify-content: center; align-items: center; border: 2px solid #FFF; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${displayCost}</div>`;
//     }

//     // ==========================================
//     // ★ 画像描画エリア（新・旧 ハイブリッド判定！）
//     // ==========================================
//     if (card.sx !== undefined) {
//         // ①【新仕様】ツールで調整済みのカード（sxのデータがある場合）
//         const scX = card.scaleX !== undefined ? card.scaleX : 1.0;
//         const scY = card.scaleY !== undefined ? card.scaleY : 1.0;
//         const sw = card.sw || 50;
//         const sh = card.sh || 50;
//         const sx = card.sx || 0;
//         const sy = card.sy || 0;

//         html += `
//         <div style="width: 100%; height: 120px; background-color: #1a1a1a; overflow: hidden; display: flex; justify-content: center; align-items: center; position: relative; border-bottom: 3px solid #444;">
//             <div style="
//                 width: ${sw}px; 
//                 height: ${sh}px; 
//                 background-image: url('${imgPath}'); 
//                 background-position: ${-sx}px ${-sy}px;  /* ★修正：-を中に入れることで、--20 が 20 に正しく計算される！ */
//                 background-repeat: no-repeat;
//                 transform: scale(${scX}, ${scY});
//                 transform-origin: center center;
//                 flex-shrink: 0;
//             "></div>
//         </div>`;
//     } else {
//         // ②【旧仕様】まだツールで調整していないカード（今までの等分方式）
//         const col = (card.imageIndex || 0) % 3;
//         const row = Math.floor((card.imageIndex || 0) / 3);
//         const finalPosX = (col * 50) + (card.offsetX || 0); 
//         const finalPosY = (row * 25) + (card.offsetY || 0); 
//         const zoomX = card.zoomX || 300; 
//         const zoomY = card.zoomY || 510;

//         html += `
//         <div style="width: 100%; height: 120px; background-image: url('${imgPath}'); background-size: ${zoomX}% ${zoomY}%; background-position: ${finalPosX}% ${finalPosY}%; background-repeat: no-repeat; border-bottom: 3px solid #444;"></div>`;
//     }
//     // ==========================================

//     html += `
//         <div style="padding: 4px 8px; font-weight: bold; font-size: 14px; background: linear-gradient(to right, #444, #222); border-bottom: 2px solid #111; text-shadow: 1px 1px 2px #000; display: flex; justify-content: space-between; align-items: center;">
//             <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${card.name}</span>
//             <span style="font-size: 11px; background: rgba(0,0,0,0.6); color: #00BCD4; padding: 2px 5px; border-radius: 4px; border: 1px solid #00BCD4; margin-left: 4px; white-space: nowrap;">${typeName}</span>
//         </div>`;

//     if (isUnlocked) {
//         html += `
//         <div style="flex: 1; padding: 6px; padding-bottom: 30px; font-size: 11px; color: #ddd; background: #2a2a2a; display: flex; flex-direction: column; gap: 4px;">
//             ${abilityText ? `<div style="color: #FF9800; font-weight: bold; font-size: 10px;">${abilityText}</div>` : ''}
//             <div style="margin-top: auto; padding-top: 4px; border-top: 1px solid #444;">
//                 <div style="display:flex; justify-content:space-between; align-items:flex-end;">
//                     <div style="display:flex; flex-direction:column; gap:3px;">
//                         <span style="display:inline-block; background:#00BCD4; color:#fff; border-radius:4px; padding:2px 4px; font-size:10px; width:fit-content;">コスト ${card.skillCost}</span>
//                         <span style="font-weight:bold; font-size:12px; color:#fff;">${card.skillName}</span>
//                     </div>
//                     ${card.damage > 0 ? `<div style="color:#ff5252; font-weight:bold; font-size:13px; white-space:nowrap;">${card.damage} ダメージ</div>` : ''}
//                 </div>
//             </div>
//         </div>
//         <div style="position: absolute; bottom: -4px; right: -4px; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 8px 0 0 0; font-weight: bold; font-size: 16px; border: 2px solid #333; border-right: none; border-bottom: none; box-shadow: -2px -2px 4px rgba(0,0,0,0.3); z-index: 2;">HP ${card.hp}</div>`;
//     } else {
//         html += `<div style="flex: 1; padding: 15px 10px; font-size: 12px; line-height: 1.6; color: #bbb; background: #2a2a2a; text-align: center; display: flex; align-items: center; justify-content: center;"><span style="font-style: italic;">「${flavorText}」</span></div>`;
//     }
//     html += `</div>`;
//     return html;
// };

// // ==========================================
// // 5. UIとポップアップ関連
// // ==========================================
// window.showCardUnlockPopup = function(card, titleText = "カードを獲得しました！") {
//     let popup = document.getElementById('tcg-unlock-popup');
//     if (!popup) {
//         popup = document.createElement('div');
//         popup.id = 'tcg-unlock-popup';
//         popup.style.cssText = `
//             position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//             background: rgba(0,0,0,0.85); z-index: 100000;
//             display: flex; flex-direction: column; justify-content: center; align-items: center;
//             opacity: 0; transition: opacity 0.5s ease; pointer-events: none;
//         `;
//         document.body.appendChild(popup);
//     }
//     popup.innerHTML = `
//         <h2 style="color: #FFD700; text-shadow: 0 0 15px #FF9800; font-size: 28px; font-weight: bold; margin: 0 0 80px 0; z-index: 10; text-align: center;">${titleText}</h2>
//         <div style="transform: scale(1.5); box-shadow: 0 0 40px rgba(255,215,0,0.6); border-radius: 12px; margin-bottom: 90px; z-index: 5;">${window.renderCardHTML(card)}</div>
//         <button onclick="document.getElementById('tcg-unlock-popup').style.opacity = '0'; setTimeout(()=>document.getElementById('tcg-unlock-popup').style.pointerEvents = 'none', 500);" 
//             style="padding: 15px 40px; font-size: 20px; font-weight: bold; background: #FF9800; color: white; border: 3px solid #FFF; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.6); z-index: 10; transition: transform 0.1s;"
//             onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
//             コレクションに収納する
//         </button>
//     `;
//     popup.style.pointerEvents = 'auto';
//     setTimeout(() => popup.style.opacity = '1', 50);
// };

// window.openCardBinder = function() {
//     let binder = document.getElementById('tcg-binder-ui');
//     if (!binder) {
//         binder = document.createElement('div');
//         binder.id = 'tcg-binder-ui';
//         binder.style.cssText = `
//             position: fixed; top: 5%; left: 5%; width: 90%; height: 90%;
//             background: #1a1a1a; border: 4px solid #FF9800; border-radius: 16px;
//             z-index: 9990; display: none; flex-direction: column; overflow: hidden;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.8);
//         `;
//         document.body.appendChild(binder);
//     }
//     let gridHtml = '';
//     if (window.TCG.myCollection.length === 0) {
//         gridHtml = `<div style="color: #666; font-size: 20px; width: 100%; text-align: center; margin-top: 50px;">まだカードを持っていません。<br>AIを育成して引退させてみましょう。</div>`;
//     } else {
//         window.TCG.myCollection.forEach(card => {
//             gridHtml += `<div style="margin: 10px; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.05) translateY(-5px)'" onmouseout="this.style.transform='scale(1) translateY(0)'">${window.renderCardHTML(card)}</div>`;
//         });
//     }
//     binder.innerHTML = `
//         <div style="background: #333; padding: 15px; border-bottom: 2px solid #555; display: flex; justify-content: space-between; align-items: center;">
//             <h2 style="margin: 0; color: #FFF;">📖 カードバインダー (所持数: ${window.TCG.myCollection.length} 枚)</h2>
//             <button onclick="document.getElementById('tcg-binder-ui').style.display = 'none';" style="background: #ff5252; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">閉じる ✖</button>
//         </div>
//         <div style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-wrap: wrap; justify-content: flex-start; align-content: flex-start; background: #222;">${gridHtml}</div>
//     `;
//     binder.style.display = 'flex';
// };

// // ==========================================
// // 6. デッキ編成システム
// // ==========================================
// window.TCG.editingDeck = [];

// window.openDeckBuilder = function() {
//     let builderUI = document.getElementById('tcg-deck-builder');
//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    
//     const uiTitle = isUnlocked ? "🛠️ デッキ編成" : "📖 思い出の整理";
//     const uiCountUnit = isUnlocked ? "枚" : "個";
//     const uiSaveBtn = isUnlocked ? "デッキを保存" : "アルバムを保存";
//     const uiColArea = isUnlocked ? "🗃️ コレクション（タップでデッキに追加）" : "🗃️ 集めた思い出（タップでアルバムに配置）";
//     const uiDeckArea = isUnlocked ? "🃏 デッキ（タップで外す）" : "📖 アルバムのページ（タップで外す）";
    
//     if (!builderUI) {
//         builderUI = document.createElement('div');
//         builderUI.id = 'tcg-deck-builder';
//         builderUI.style.cssText = `
//             position: fixed; top: 2%; left: 2%; width: 96%; height: 96%;
//             background: #1a1a1a; border: 4px solid #4CAF50; border-radius: 12px;
//             z-index: 10000; display: flex; flex-direction: column; overflow: hidden;
//             box-shadow: 0 10px 40px rgba(0,0,0,0.8); font-family: sans-serif;
//         `;
//         builderUI.innerHTML = `
//             <div style="background: #2E7D32; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1B5E20;">
//                 <h2 id="db-title-text" style="margin: 0; color: #FFF; font-size: 22px;">
//                     ${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">
//                     現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})
//                     </span>
//                 </h2>
//                 <div>
//                     <button id="db-save-btn" onclick="saveDeck()" style="background: #FF9800; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px;">${uiSaveBtn}</button>
//                     <button onclick="document.getElementById('tcg-deck-builder').style.display='none'" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">閉じる ✖</button>
//                 </div>
//             </div>
//             <div style="flex: 1; display: flex; overflow: hidden;">
//                 <div style="flex: 3; background: #222; display: flex; flex-direction: column; border-right: 4px solid #444;">
//                     <div id="db-col-header" style="padding: 10px; background: #333; color: #aaa; text-align: center; font-weight: bold; border-bottom: 1px solid #111;">${uiColArea}</div>
//                     <div style="padding: 10px; background: #2a2a2a; border-bottom: 2px solid #111; display: flex; gap: 10px;">
//                         <input type="text" id="db-search-name" placeholder="🔍 カード名で検索..." oninput="refreshDeckBuilderView()" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px;">
//                         <select id="db-filter-type" onchange="refreshDeckBuilderView()" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px; cursor: pointer;">
//                             <option value="all">🌟 すべてのカード</option>
//                             <option value="evolution">✨ 進化モンスターのみ</option>
//                             <option value="monster_basic">🟢 基本モンスターのみ</option>
//                             <option value="action">⚡ アクションカード</option>
//                             <option value="item">🎒 アイテムカード</option>
//                             <option value="field">⛺ フィールドカード</option>
//                             <option value="robot">🤖 ロボット種族</option>
//                         </select>
//                     </div>
//                     <div id="db-collection-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
//                 </div>
//                 <div style="flex: 2; background: #111; display: flex; flex-direction: column;">
//                     <div id="db-deck-header" style="padding: 10px; background: #000; color: #4CAF50; text-align: center; font-weight: bold; border-bottom: 2px solid #222;">${uiDeckArea}</div>
//                     <div id="db-deck-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
//                 </div>
//             </div>
//         `;
//         document.body.appendChild(builderUI);
//     } else {
//         const titleSpan = document.getElementById('db-title-text');
//         if (titleSpan) titleSpan.innerHTML = `${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})</span>`;
//         const saveBtn = document.getElementById('db-save-btn');
//         if (saveBtn) saveBtn.innerText = uiSaveBtn;
//         const colHeader = document.getElementById('db-col-header');
//         if (colHeader) colHeader.innerText = uiColArea;
//         const deckHeader = document.getElementById('db-deck-header');
//         if (deckHeader) deckHeader.innerText = uiDeckArea;
        
//         const searchInput = document.getElementById('db-search-name');
//         if (searchInput) searchInput.value = "";
//         const filterSelect = document.getElementById('db-filter-type');
//         if (filterSelect) filterSelect.value = "all";
//     }

//     builderUI.style.display = 'flex';
//     window.refreshDeckBuilderView(); 
// };

// window.refreshDeckBuilderView = function() {
//     const collectionArea = document.getElementById('db-collection-area');
//     const deckArea = document.getElementById('db-deck-area');
//     const countDisplay = document.getElementById('db-count');
    
//     const searchInput = document.getElementById('db-search-name');
//     const searchName = searchInput ? searchInput.value.toLowerCase() : "";
//     const filterSelect = document.getElementById('db-filter-type');
//     const filterType = filterSelect ? filterSelect.value : "all";

//     let collectionHtml = '';
//     let deckHtml = '';
//     let deckCount = window.TCG.editingDeck.length;

//     if (countDisplay) {
//         countDisplay.innerText = deckCount;
//         countDisplay.style.color = deckCount >= 60 ? "#4CAF50" : "#FFD700";
//     }

//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
//     const emptyDeckText = isUnlocked ? "デッキは空です" : "アルバムのページは空です";

//     window.TCG.editingDeck.forEach(uid => {
//         const card = window.TCG.myCollection.find(c => c.uid === uid);
//         if (card) deckHtml += `<div onclick="window.toggleCardInDeck('${card.uid}')" style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(0.7) translateY(-5px)'" onmouseout="this.style.transform='scale(0.65) translateY(0)'">${window.renderCardHTML(card)}</div>`;
//     });

//     window.TCG.myCollection.forEach(card => {
//         if (!window.TCG.editingDeck.includes(card.uid)) {
//             let match = true;
//             if (searchName && !card.name.toLowerCase().includes(searchName)) match = false;
//             if (match && filterType !== 'all') {
//                 if (filterType === 'evolution') {
//                     if (!card.evolvesFrom) match = false; 
//                 } else if (filterType === 'monster_basic') {
//                     if (card.evolvesFrom || ['action', 'item', 'field'].includes(card.type)) match = false;
//                 } else if (['action', 'item', 'field'].includes(filterType)) {
//                     if (card.type !== filterType) match = false;
//                 } else {
//                     if (!card.type.startsWith(filterType)) match = false;
//                 }
//             }
//             if (match) collectionHtml += `<div onclick="window.toggleCardInDeck('${card.uid}')" style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(0.7) translateY(-5px)'" onmouseout="this.style.transform='scale(0.65) translateY(0)'">${window.renderCardHTML(card)}</div>`;
//         }
//     });

//     if (collectionArea) collectionArea.innerHTML = collectionHtml || '<div style="color:#666; width:100%; text-align:center; padding-top: 20px;">条件に合うカードが見つかりません</div>';
//     if (deckArea) deckArea.innerHTML = deckHtml || `<div style="color:#666; width:100%; text-align:center; padding-top: 20px;">${emptyDeckText}</div>`;
// };

// window.toggleCardInDeck = function(uid) {
//     const index = window.TCG.editingDeck.indexOf(uid);
//     if (index > -1) window.TCG.editingDeck.splice(index, 1);
//     else window.TCG.editingDeck.push(uid); 
//     window.refreshDeckBuilderView();
// };

// window.saveDeck = function() {
//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
//     if (window.TCG.editingDeck.length < 60) {
//         if(isUnlocked) alert(`デッキは最低60枚必要です！\n（現在は ${window.TCG.editingDeck.length} 枚です）`);
//         else alert(`アルバムを完成させるには、記憶が最低60個必要です！\n（現在は ${window.TCG.editingDeck.length} 個です）`);
//         return;
//     }
//     window.TCG.decks[0] = [...window.TCG.editingDeck]; 
//     window.saveTCGData();
//     if(isUnlocked) alert("🎉 デッキを保存しました！これでバトルに挑めます！");
//     else alert("🎉 思い出のアルバムが完成しました……！\n（何かが起こる予感がする…！）");
//     document.getElementById('tcg-deck-builder').style.display = 'none';
// };

// // ==========================================
// // 7. バトルシステム本体
// // ==========================================
// window.TCG_BATTLE = {
//     player: { hp: 200, maxMana: 1, currentMana: 1, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//     cpu:    { hp: 200, maxMana: 1, currentMana: 1, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//     turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false
// };

// function shuffleArray(array) {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

// window.startBattle = function(enemyData = null) {
//     if (!window.TCG.decks[0] || window.TCG.decks[0].length < 60) {
//         alert("デッキが保存されていないか、60枚以上ありません！先にデッキ編成を完了してください。");
//         return;
//     }

//     window.TCG_BATTLE = {
//         player: { hp: 200, maxMana: 1, currentMana: 1, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//         cpu:    { hp: 200, maxMana: 1, currentMana: 1, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//         turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false
//     };
//     const p = window.TCG_BATTLE.player;
//     const cpu = window.TCG_BATTLE.cpu;

//     let battleUI = document.getElementById('tcg-battle-ui');
//     if (!battleUI) {
//         battleUI = document.createElement('div');
//         battleUI.id = 'tcg-battle-ui';
//         battleUI.style.cssText = `
//             position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//             background: #2a2a2a; z-index: 20000; display: flex; flex-direction: column; 
//             font-family: sans-serif; color: white; overflow: hidden;
//         `;
//         document.body.appendChild(battleUI);
//     }

//     if (!document.getElementById('tcg-scroll-styles')) {
//         const style = document.createElement('style');
//         style.id = 'tcg-scroll-styles';
//         style.innerHTML = `
//             .tcg-board-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.4) rgba(0,0,0,0.3); }
//             .tcg-board-scroll::-webkit-scrollbar { height: 8px; }
//             .tcg-board-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; margin: 0 20px; }
//             .tcg-board-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }
//             .tcg-board-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.7); }
//         `;
//         document.head.appendChild(style);
//     }

//     p.deck = window.TCG.decks[0].map(uid => {
//         const originalCard = window.TCG.myCollection.find(c => c.uid === uid);
//         if (!originalCard) return null;
//         let cardCopy = JSON.parse(JSON.stringify(originalCard));
//         let master = window.TCG_MASTER[cardCopy.masterId];
//         if (master) cardCopy.hp = Math.max(cardCopy.hp, master.baseHp);
//         cardCopy.isDead = false; cardCopy.canAttack = false; cardCopy.isDefending = false;
//         return cardCopy;
//     }).filter(c => c !== null);
//     shuffleArray(p.deck);

//     if (enemyData && enemyData.deck) {
//         cpu.deck = enemyData.deck.map((dCard, i) => {
//             let master = window.TCG_MASTER[dCard.masterId];
//             if(!master) return null;
//             return {
//                 uid: 'ghost_' + i, masterId: dCard.masterId, name: dCard.name || master.name, type: master.type,
//                 cost: master.baseCost, hp: dCard.hp || master.baseHp, 
//                 skillName: master.skillName, skillCost: master.skillCost, damage: dCard.damage || master.baseDmg, 
//                 ability: master.ability, image: master.image, imageIndex: master.imageIndex,
//                 offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false
//             };
//         }).filter(c => c !== null);
//         if(cpu.deck.length < 60) {
//             alert("敵のデッキデータが不完全です。通常のCPUと対戦します。"); enemyData = null;
//         } else { shuffleArray(cpu.deck); }
//     } 

//     if (!enemyData || !enemyData.deck) {
//         const allMasterKeys = Object.keys(window.TCG_MASTER);
//         for (let i = 0; i < Math.max(60, p.deck.length); i++) {
//             let randomKey = allMasterKeys[Math.floor(Math.random() * allMasterKeys.length)];
//             let master = window.TCG_MASTER[randomKey];
//             cpu.deck.push({
//                 uid: 'cpu_' + i, masterId: randomKey, name: master.name, type: master.type,
//                 cost: master.baseCost, hp: master.baseHp, skillName: master.skillName,
//                 skillCost: master.skillCost, damage: master.baseDmg, ability: master.ability,
//                 image: master.image, imageIndex: master.imageIndex, offsetX: master.offsetX,
//                 offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false
//             });
//         }
//     }

//     window.renderBattleBoard();

//     let cpuNameLabel = document.getElementById('cpu-name-label');
//     if (!cpuNameLabel) {
//         cpuNameLabel = document.createElement('div');
//         cpuNameLabel.id = 'cpu-name-label';
//         cpuNameLabel.style.cssText = 'position:absolute; top:20px; right:30px; color:#FF5252; font-weight:bold; font-size:24px; text-shadow:0 0 10px #000; z-index:100;';
//         battleUI.appendChild(cpuNameLabel);
//     }
//     cpuNameLabel.innerHTML = enemyData ? `VS ${enemyData.playerName}` : "VS 名もなきCPU";
    
//     battleUI.style.display = 'flex';

//     const blocker = document.createElement('div');
//     blocker.id = 'tcg-battle-blocker';
//     blocker.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; z-index:25000;`;
//     document.body.appendChild(blocker);

//     const splash = document.createElement('div');
//     splash.id = 'tcg-battle-splash';
//     splash.style.cssText = `
//         position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//         background: rgba(0,0,0,0.85); z-index: 26000; display: flex;
//         justify-content: center; align-items: center; color: white;
//         font-size: 80px; font-weight: bold; font-style: italic; text-align:center; line-height:1.2;
//         text-shadow: 0 0 30px #FF9800, 5px 5px 0 #000;
//         opacity: 0; transform: scale(1.5); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//     `;
//     splash.innerHTML = enemyData ? `ONLINE BATTLE !!<br><span style="font-size:50px; color:#4fc3f7;">VS ${enemyData.playerName}</span>` : "BATTLE START !!";
//     document.body.appendChild(splash);

//     setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1)'; }, 50);

//     setTimeout(() => {
//         splash.style.opacity = '0';
//         splash.style.transform = 'scale(0.8)';
//         setTimeout(() => splash.remove(), 500);

//         let drawCount = 0;
//         const drawTimer = setInterval(() => {
//             if (drawCount < 5) {
//                 p.hand.push(p.deck.shift());
//                 cpu.hand.push(cpu.deck.shift());
//                 window.showBattleMessage(`シュッ！ (手札: ${drawCount + 1}枚)`, false, 250);
//                 window.renderBattleBoard();
//                 drawCount++;
//             } else {
//                 clearInterval(drawTimer);
//                 blocker.remove(); 
//                 window.showBattleMessage("✨ あなたの先行でスタート！\nマナを使ってカードを出そう！", false, 3000);
//             }
//         }, 350); 
//     }, 1500); 
// };

// // ==========================================
// // 8. VFX（視覚効果）＆ メッセージエンジン
// // ==========================================
// if (!document.getElementById('tcg-vfx-styles')) {
//     const style = document.createElement('style');
//     style.id = 'tcg-vfx-styles';
//     style.innerHTML = `
//         @keyframes slideUpFade { 0% { transform: translate(-50%, 0); opacity: 0; } 10% { transform: translate(-50%, -20px); opacity: 1; } 80% { transform: translate(-50%, -20px); opacity: 1; } 100% { transform: translate(-50%, -40px); opacity: 0; } }
//         @keyframes floatDmg { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -120px) scale(1.5); opacity: 0; } }
//         @keyframes slashAnim { 0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) rotate(20deg) scale(2.5); opacity: 0; } }
//         @keyframes cardDestroy {
//             0% { transform: scale(0.65) rotate(0deg); filter: brightness(1) grayscale(0%); opacity: 1; }
//             20% { transform: scale(0.7) rotate(-5deg); filter: brightness(2) grayscale(0%); opacity: 1; }
//             50% { transform: scale(0.6) rotate(10deg); filter: brightness(0.5) grayscale(100%); opacity: 0.8; }
//             100% { transform: scale(0) rotate(-20deg); filter: brightness(0) grayscale(100%); opacity: 0; }
//         }
//         @keyframes screenHit {
//             0% { transform: translate(0, 0); box-shadow: inset 0 0 0 rgba(255,0,0,0); }
//             10% { transform: translate(-15px, 10px); box-shadow: inset 0 0 150px rgba(255,0,0,0.9); }
//             20% { transform: translate(15px, -10px); }
//             30% { transform: translate(-15px, -10px); }
//             40% { transform: translate(15px, 10px); }
//             50% { transform: translate(-10px, 5px); box-shadow: inset 0 0 80px rgba(255,0,0,0.6); }
//             100% { transform: translate(0, 0); box-shadow: inset 0 0 0 rgba(255,0,0,0); }
//         }
//         .screen-shake-effect { animation: screenHit 0.5s ease-out; }
//     `;
//     document.head.appendChild(style);
// }

// window.showBattleMessage = function(text, isError = false, duration = 2000) {
//     const ui = document.getElementById('tcg-battle-ui');
//     if (!ui) return;
//     const existingCount = document.querySelectorAll('.battle-msg').length;
//     const topPos = 40 + (existingCount * 8);

//     const msg = document.createElement('div');
//     msg.className = 'battle-msg';
//     msg.innerHTML = text;
//     msg.style.cssText = `
//         position: absolute; top: ${topPos}%; left: 50%;
//         background: ${isError ? 'rgba(220, 20, 20, 0.95)' : 'rgba(20, 120, 255, 0.95)'};
//         color: #fff; padding: 15px 40px; border-radius: 12px; border: 2px solid #fff;
//         font-size: 22px; font-weight: bold; pointer-events: none; z-index: 100000;
//         box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center; white-space: pre-wrap;
//         animation: slideUpFade ${duration}ms forwards;
//     `;
//     ui.appendChild(msg);
//     setTimeout(() => msg.remove(), duration);
// };

// window.showVFX = function(targetId, type, text = "") {
//     const target = document.getElementById(targetId);
//     if (!target) return;
//     const rect = target.getBoundingClientRect();
//     const ui = document.getElementById('tcg-battle-ui');
//     if (!ui) return;
    
//     const vfxNode = document.createElement('div');
//     vfxNode.style.cssText = `
//         position: absolute; left: ${rect.left + rect.width / 2}px; top: ${rect.top + rect.height / 2}px;
//         pointer-events: none; z-index: 99999;
//     `;

//     if (type === 'damage' || type === 'heal') {
//         const isHeal = type === 'heal';
//         vfxNode.innerText = (isHeal ? "+" : "-") + text;
//         vfxNode.style.color = isHeal ? '#4CAF50' : '#ff5252';
//         vfxNode.style.fontWeight = '900';
//         vfxNode.style.fontSize = '45px';
//         vfxNode.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000';
//         vfxNode.style.animation = 'floatDmg 1.2s ease-out forwards';
//     } else if (type === 'slash') {
//         vfxNode.innerText = "💥";
//         vfxNode.style.fontSize = '80px';
//         vfxNode.style.animation = 'slashAnim 0.3s ease-out forwards';
//     }
//     ui.appendChild(vfxNode);
//     setTimeout(() => vfxNode.remove(), 1200);
// };

// // ==========================================
// // 9. バトルの描画と進行ロジック
// // ==========================================
// window.showCardDetailModal = function(ownerType, index) {
//     const card = ownerType === 'player' ? window.TCG_BATTLE.player.field[index] : window.TCG_BATTLE.cpu.field[index];
//     if (!card) return;

//     let modal = document.getElementById('tcg-card-detail-modal');
//     if (!modal) {
//         modal = document.createElement('div');
//         modal.id = 'tcg-card-detail-modal';
//         modal.style.cssText = `
//             position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//             background: rgba(0,0,0,0.85); z-index: 40000;
//             display: flex; flex-direction: column; justify-content: center; align-items: center;
//             cursor: pointer;
//         `;
//         modal.onclick = () => { modal.style.display = 'none'; };
//         document.body.appendChild(modal);
//     }
    
//     modal.innerHTML = `
//         <div style="margin-bottom: 30px; color: #00BCD4; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">
//             🔍 ${ownerType === 'player' ? '味方' : '敵'}のカード詳細
//         </div>
//         <div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(0, 188, 212, 0.6); border-radius: 12px; pointer-events: none;">
//             ${window.renderCardHTML(card)}
//         </div>
//         <div style="margin-top: 100px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">
//             画面のどこかをクリックして閉じる
//         </div>
//     `;
//     modal.style.display = 'flex';
// };

// window.renderBattleBoard = function() {
//     const battleUI = document.getElementById('tcg-battle-ui');
//     const p = window.TCG_BATTLE.player;
//     const cpu = window.TCG_BATTLE.cpu;
//     window.TCG_BATTLE.selectedAttackerIndex = window.TCG_BATTLE.selectedAttackerIndex ?? -1;
//     window.TCG_BATTLE.selectedHandCardIndex = window.TCG_BATTLE.selectedHandCardIndex ?? -1;
//     const isTargeting = window.TCG_BATTLE.selectedAttackerIndex !== -1;
//     const isEvoMode = window.TCG_BATTLE.selectedHandCardIndex !== -1;

//     let handHtml = p.hand.map((card, index) => {
//         let actualCost = window.getActualCost(p, card);
//         const canPlay = p.currentMana >= actualCost;
//         const isSelected = window.TCG_BATTLE.selectedHandCardIndex === index;
//         const opacity = canPlay ? "1" : "0.5";
//         const transform = isSelected ? "scale(0.75) translateY(-30px)" : "scale(0.6)";
//         const filter = isSelected ? "drop-shadow(0 0 20px #E91E63)" : "none";
//         const zIndex = isSelected ? 150 : index;
        
//         return `
//         <div style="transform: ${transform}; margin: -30px -20px; cursor: ${canPlay && !isTargeting ? 'pointer' : 'not-allowed'}; transition: transform 0.2s; position: relative; z-index: ${zIndex}; opacity: ${opacity}; filter: ${filter};"
//              onmouseover="if(${canPlay} && !${isTargeting} && !${isSelected}) { this.style.transform='scale(0.7) translateY(-20px)'; this.style.zIndex=100; }"
//              onmouseout="if(${canPlay} && !${isTargeting} && !${isSelected}) { this.style.transform='scale(0.6) translateY(0)'; this.style.zIndex=${index}; }"
//              onclick="if(!${isTargeting}) window.playCard(${index})">
//             ${window.renderCardHTML(card)}
//         </div>`;
//     }).join('');

//     let fieldHtml = p.field.map((card, index) => {
//         const isReady = card.canAttack;
//         const isAttackerSelected = window.TCG_BATTLE.selectedAttackerIndex === index;
//         let isEvoTarget = false;
//         if (isEvoMode) {
//             const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//             isEvoTarget = card.type === evoCard.evolvesFrom;
//         }

//         let filter = "grayscale(50%) opacity(70%)";
//         let transform = "scale(0.65)";
//         let cursor = "not-allowed";
        
//         if (isAttackerSelected) {
//             filter = "drop-shadow(0 0 20px #FFD700)"; transform = "scale(0.7) translateY(-20px)"; cursor = "pointer";
//         } else if (isEvoMode) {
//             if (isEvoTarget) { filter = "drop-shadow(0 0 20px #E91E63) brightness(1.2)"; transform = "scale(0.7) translateY(-10px)"; cursor = "pointer"; }
//             else { filter = "grayscale(80%) opacity(40%)"; }
//         } else if (isReady) {
//             filter = "drop-shadow(0 0 10px #4CAF50)"; cursor = "pointer";
//         } else if (!isReady && card.damage > 0 && !card.isDefending && card.ability !== "taunt" && p.currentMana >= 1) {
//             cursor = "pointer";
//         }

//         const animStyle = card.isDead ? "animation: cardDestroy 0.6s ease-out forwards; pointer-events: none;" : "";
//         const isDefending = card.isDefending || card.ability === "taunt";
//         if (card.isDefending) filter = "drop-shadow(0 0 15px #2196F3)";

//         return `
//         <div id="p-card-${index}" style="position: relative; transform: ${transform}; margin: -20px -15px; transition: transform 0.2s, filter 0.2s; cursor: ${cursor}; filter: ${filter}; z-index: ${isAttackerSelected || isEvoTarget ? 100 : 1}; ${animStyle}"
//              onmouseover="if((${isReady} && !${isAttackerSelected} && !${isEvoMode}) || ${isEvoTarget}) { this.style.transform='scale(0.7) translateY(-10px)' }"
//              onmouseout="if((${isReady} && !${isAttackerSelected} && !${isEvoMode}) || ${isEvoTarget}) { this.style.transform='scale(0.65) translateY(0)' }"
//              onclick="window.selectPlayerCard(${index})">
//             ${window.renderCardHTML(card)}
//             ${isDefending && !card.isDead ? `<div style="position:absolute; top:-20px; left:30%; background:#f44336; color:white; padding:2px 10px; border-radius:10px; font-weight:bold; border:2px solid #fff; z-index:10; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">🛡️ 守護</div>` : ''}
//             ${!isReady && !isAttackerSelected && !card.isDead && !isEvoMode && !isDefending ? `<div style="position:absolute; top:40%; left:10%; background:rgba(0,0,0,0.8); color:white; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:24px; transform:rotate(-15deg);">行動済み</div>` : ''}
//             ${isEvoTarget ? `<div style="position:absolute; top:40%; left:15%; background:#E91E63; color:white; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:22px; transform:rotate(-10deg); box-shadow:0 0 10px #000;">進化可能!</div>` : ''}
//             <div onclick="event.stopPropagation(); window.showCardDetailModal('player', ${index});" style="position:absolute; top:-10px; right:-10px; background:#222; color:#00BCD4; border:2px solid #00BCD4; border-radius:50%; width:36px; height:36px; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;" title="詳細を見る">🔍</div>
//         </div>`;
//     }).join('');
//     if (p.field.length === 0) fieldHtml = `<div style="color: #666; font-style: italic; margin: 0 20px;">(あなたの場)</div>`;

//     let cpuFieldHtml = cpu.field.map((card, index) => {
//         const isTaunt = card.ability === "taunt" || card.isDefending; 
//         const isStealth = card.ability === "stealth";
//         const filter = isTargeting && !isStealth ? (isTaunt ? "drop-shadow(0 0 20px #FF5252)" : "drop-shadow(0 0 10px #FF9800)") : "none";
//         const cursor = isTargeting && !isStealth ? "crosshair" : "default";
//         const opacity = isStealth ? "0.6" : "1";
//         const animStyle = card.isDead ? "animation: cardDestroy 0.6s ease-out forwards; pointer-events: none;" : "";

//         return `
//         <div id="c-card-${index}" style="position: relative; transform: scale(0.65); margin: -20px -15px; filter: ${filter}; opacity: ${opacity}; cursor: ${cursor}; transition: transform 0.2s; ${animStyle}"
//              onmouseover="if(${isTargeting} && !${isStealth} && !${card.isDead}){ this.style.transform='scale(0.7) translateY(10px)' }"
//              onmouseout="if(${isTargeting} && !${isStealth} && !${card.isDead}){ this.style.transform='scale(0.65) translateY(0)' }"
//              onclick="if(${isTargeting}) window.executeAttack('card', ${index})">
//             ${window.renderCardHTML(card)}
//             ${isTaunt && !card.isDead ? `<div style="position:absolute; top:-20px; left:30%; background:#f44336; color:white; padding:2px 10px; border-radius:10px; font-weight:bold; border:2px solid #fff; z-index:10;">🛡️ 守護</div>` : ''}
//             <div onclick="event.stopPropagation(); window.showCardDetailModal('cpu', ${index});" style="position:absolute; top:-10px; right:-10px; background:#222; color:#FF5252; border:2px solid #FF5252; border-radius:50%; width:36px; height:36px; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;" title="詳細を見る">🔍</div>
//         </div>`;
//     }).join('');
//     if (cpu.field.length === 0) cpuFieldHtml = `<div style="color: #666; font-style: italic; margin: 0 20px;">(CPUの場)</div>`;

//     battleUI.innerHTML = `
//         <div style="flex: 1; background: rgba(150,0,0,0.2); border-bottom: 2px solid #555; display: flex; flex-direction: column;">
//             <div id="cpu-face" style="padding: 10px; display: flex; justify-content: space-between; background: rgba(0,0,0,0.5); cursor: ${isTargeting ? 'crosshair' : 'default'}; transition: background 0.2s;"
//                  onmouseover="if(${isTargeting}){ this.style.background='rgba(255,0,0,0.3)' }"
//                  onmouseout="if(${isTargeting}){ this.style.background='rgba(0,0,0,0.5)' }"
//                  onclick="if(${isTargeting}) window.executeAttack('cpu', 0); else if(${isEvoMode}) { window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard(); }">
//                 <div style="font-size: 20px; font-weight: bold;">🤖 敵CPU <span style="color:#ff5252; font-size:24px;">HP: ${cpu.hp}</span> ${isTargeting ? '🎯 (ここをタップで直接攻撃)' : ''}</div>
//                 <div style="color: #FFD700;">💎 マナ: ${cpu.currentMana} / ${cpu.maxMana} | 山札: ${cpu.deck.length} | 手札: ${cpu.hand.length}</div>
//             </div>
//             <div class="tcg-board-scroll" style="flex: 1; display: flex; overflow-x: auto; overflow-y: hidden; align-items: center; width: 100%;">
//                 <div style="display: flex; gap: 5px; padding: 10px 40px; margin: auto; flex-wrap: nowrap; align-items: center;">
//                     ${cpuFieldHtml}
//                 </div>
//             </div>
//         </div>
//         <div style="flex: 1; background: rgba(0,100,200,0.2); display: flex; flex-direction: column; position: relative;"
//              onclick="if(${isTargeting} && event.target === this) { window.TCG_BATTLE.selectedAttackerIndex = -1; window.renderBattleBoard(); } else if (${isEvoMode} && event.target === this) { window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard(); }">
//             <div class="tcg-board-scroll" style="flex: 1; display: flex; overflow-x: auto; overflow-y: hidden; align-items: center; width: 100%; border-bottom: 1px dashed #555; pointer-events: none;">
//                 <div style="pointer-events: auto; display: flex; gap: 5px; padding: 10px 40px; margin: auto; flex-wrap: nowrap; align-items: center;">
//                     ${fieldHtml}
//                 </div>
//             </div>
//             <div style="height: 180px; display: flex; background: rgba(0,0,0,0.8); border-top: 3px solid #1976D2;">
//                 <div id="player-face" style="width: 200px; padding: 10px; border-right: 2px solid #333; display: flex; flex-direction: column; justify-content: space-around;">
//                     <div style="font-size: 20px; font-weight: bold;">🧑 あなた (Turn ${window.TCG_BATTLE.turn})</div>
//                     <div style="font-size: 24px; color: #4CAF50; font-weight: bold;">HP: ${p.hp}</div>
//                     <div style="font-size: 18px; color: #00BCD4;">💎 マナ: ${p.currentMana} / ${p.maxMana}</div>
//                     <div style="font-size: 14px; color: #aaa;">山札: ${p.deck.length} 枚</div>
//                 </div>
//                 <div style="flex: 1; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 10px; overflow: visible;">
//                     ${handHtml}
//                 </div>
//                 <div style="position: absolute; right: 20px; top: -60px; display: flex; gap: 10px;">
//                     <button onclick="window.endTurn()" style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #FF9800; color: #fff; border: 2px solid #FFF; border-radius: 8px; cursor: pointer;">ターン終了 ➔</button>
//                     <button onclick="document.getElementById('tcg-battle-ui').style.display='none'" style="padding: 15px 15px; background: #333; color: #fff; border: 2px solid #666; border-radius: 8px; cursor: pointer;">逃げる</button>
//                 </div>
//             </div>
//         </div>
//     `;
// };

// window.triggerPlayEffect = function(card, isPlayer) {
//     const owner = isPlayer ? window.TCG_BATTLE.player : window.TCG_BATTLE.cpu;
//     const enemy = isPlayer ? window.TCG_BATTLE.cpu : window.TCG_BATTLE.player;
//     const ownerPrefix = isPlayer ? 'p' : 'c';
//     const enemyPrefix = isPlayer ? 'c' : 'p';
//     const targetFace = isPlayer ? 'player-face' : 'cpu-face';
//     const enemyFace = isPlayer ? 'cpu-face' : 'player-face';

//     if (card.ability === "draw_card") {
//         if (owner.deck.length > 0) {
//             owner.hand.push(owner.deck.shift());
//             if (isPlayer) window.showBattleMessage(`🎴 【ドロー】\n${card.name} の効果でカードを引きました！`);
//         }
//     } else if (card.ability === "mana_ramp") {
//         if (owner.maxMana < 10) {
//             owner.maxMana++;
//             if (isPlayer) window.showBattleMessage(`💎 【成長】\n最大マナが1増えました！`);
//         }
//     } else if (card.ability === "heal_self") {
//         owner.hp += 10; window.showVFX(targetFace, 'heal', 10);
//         if (isPlayer) window.showBattleMessage(`💖 【修復】\nHPが10回復しました！`);
//     } else if (card.ability === "aoe_heal_play") {
//         owner.field.forEach((c, idx) => { if(!c.isDead) { c.hp += 20; window.showVFX(`${ownerPrefix}-card-${idx}`, 'heal', 20); } });
//         if (isPlayer) window.showBattleMessage(`✨ 【ファンサービス】\n味方全員のHPが20回復した！`);
//     } else if (card.ability === "snipe_play") {
//         if (enemy.field.length > 0) {
//             let rIdx = Math.floor(Math.random() * enemy.field.length); let tCard = enemy.field[rIdx];
//             tCard.hp -= 30; window.showVFX(`${enemyPrefix}-card-${rIdx}`, 'slash'); window.showVFX(`${enemyPrefix}-card-${rIdx}`, 'damage', 30);
//             window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${rIdx}`);
//             if (isPlayer) window.showBattleMessage(`💥 【殲滅モード】\n敵の ${tCard.name} に30ダメージ！`);
//         } else {
//             enemy.hp -= 30; window.showVFX(enemyFace, 'slash'); window.showVFX(enemyFace, 'damage', 30);
//             if (isPlayer) window.showBattleMessage(`💥 【殲滅モード】\n敵リーダーに30ダメージ！`);
//         }
//     } else if (card.ability === "dimension_hack") {
//         for(let i=0; i<2; i++) { if(enemy.hand.length > 0) enemy.hand.splice(Math.floor(Math.random()*enemy.hand.length), 1); }
//         for(let i=0; i<2; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
//         if(isPlayer) window.showBattleMessage(`🌌 【超次元ハッキング】\n相手の手札を2枚破壊し、2枚ドロー！`);
//     } else if (card.ability === "crimson_end" || card.ability === "heaven_punishment") {
//         if(card.ability === "crimson_end") { enemy.hp -= 50; window.showVFX(enemyFace, 'slash'); }
//         enemy.field.forEach((c, idx) => {
//             c.hp -= 50; window.showVFX(`${enemyPrefix}-card-${idx}`, 'slash'); window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', 50);
//             window.checkDeath(c, enemy, `${enemyPrefix}-card-${idx}`);
//         });
//         if(isPlayer) window.showBattleMessage(`🌋 【${card.name}の圧倒的な力】\n敵陣全体に50ダメージ！`);
//     } else if (card.ability === "perfect_predation") {
//         let targets = enemy.field.filter(c => !c.isDead);
//         if(targets.length > 0) {
//             let tCard = targets[Math.floor(Math.random() * targets.length)];
//             let drain = tCard.hp; tCard.hp = 0; window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${enemy.field.indexOf(tCard)}`);
//             owner.hp += drain; window.showVFX(targetFace, 'heal', drain);
//             if(isPlayer) window.showBattleMessage(`🌑 【完全捕食】\n敵を喰らい、${drain}回復！`);
//         }
//     } else if (card.ability === "nightmare_rule") {
//         enemy.field.forEach((c, idx) => {
//             if(!c.isDead) { let half = Math.ceil(c.hp / 2); c.hp -= half; window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', half); }
//         });
//         if(isPlayer) window.showBattleMessage(`⛓️ 【悪夢の君臨】\nすべての敵モンスターのHPが半減！`);
//     } else if (card.ability === "star_hope") {
//         owner.field.forEach((c, idx) => {
//             if(!c.isDead) { c.hp += 100; c.ability = "taunt"; window.showVFX(`${ownerPrefix}-card-${idx}`, 'heal', '全回復'); }
//         });
//         if(isPlayer) window.showBattleMessage(`🌟 【希望の星】\n味方全回復＆全員が「かばう」状態に！`);
//     } else if (card.ability === "truth_overwrite") {
//         for(let i=0; i<3; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
//         owner.maxMana = Math.min(10, owner.maxMana + 3); owner.currentMana = Math.min(10, owner.currentMana + 3);
//         if(isPlayer) window.showBattleMessage(`🌐 【真理の書き換え】\n3枚ドロー＆マナ最大値が3増えた！`);
//     } else if (card.ability === "time_manipulation") {
//         owner.field.forEach(c => { c.canAttack = true; c.isDefending = false; });
//         if(isPlayer) window.showBattleMessage(`⏳ 【時空操作】\nすべての味方が再び行動可能になった！`);
//     } else if (card.ability === "super_gravity") {
//         owner.field.forEach((c, idx) => { if(c !== card && !c.isDead) { c.hp -= 100; window.showVFX(`${ownerPrefix}-card-${idx}`, 'damage', 100); window.checkDeath(c, owner, `${ownerPrefix}-card-${idx}`); } });
//         enemy.field.forEach((c, idx) => { if(!c.isDead) { c.hp -= 100; window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', 100); window.checkDeath(c, enemy, `${enemyPrefix}-card-${idx}`); } });
//         if(isPlayer) window.showBattleMessage(`🌌 【超重力】\n自身以外のお互いの全モンスターに100ダメージ！`);
//     }

//     if ((card.type === "item" || card.type === "action") && card.damage > 0) {
//         enemy.hp -= card.damage; window.showVFX(enemyFace, 'slash'); window.showVFX(enemyFace, 'damage', card.damage);
//         const ui = document.getElementById('tcg-battle-ui'); ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect');
//         if (isPlayer) window.showBattleMessage(`🔥 敵リーダーに ${card.damage} ダメージ！`);
//     }

//     setTimeout(() => { window.renderBattleBoard(); }, 800);
// };

// window.playCard = function(handIndex) {
//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }
    
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     if (card.type === 'action') p.actionUsed = true;
//     if (card.type === 'item' || card.type === 'action') { window.showBattleMessage(`✨ ${card.name} を使用！`); window.triggerPlayEffect(card, true); } 
//     else { card.canAttack = false; p.field.push(card); window.showBattleMessage(`🛡️ ${card.name} を配置！`); window.triggerPlayEffect(card, true); }

//     window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard();
//     if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
// };

// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const targetCard = p.field[index];

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             evoCard.canAttack = false; p.field[index] = evoCard;  
//             window.showVFX(`p-card-${index}`, 'heal', '進化!'); window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`);
//             window.triggerPlayEffect(evoCard, true); window.renderBattleBoard();
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) window.TCG_BATTLE.selectedAttackerIndex = -1;
//     else window.TCG_BATTLE.selectedAttackerIndex = index;
//     window.renderBattleBoard();
// };

// window.executeAttack = function(targetType, enemyIndex) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const attackerIndex = window.TCG_BATTLE.selectedAttackerIndex; if (attackerIndex === -1) return;
//     const attackerCard = p.field[attackerIndex];

//     const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill";
//     const hasTaunt = cpu.field.some(c => c.ability === "taunt" || c.isDefending);
//     if (hasTaunt && !isPierce) {
//         if (targetType === 'cpu' || (targetType === 'card' && cpu.field[enemyIndex].ability !== "taunt" && !cpu.field[enemyIndex].isDefending)) {
//             window.showBattleMessage("🛡️ 敵の場に【かばう】を持つカードがいます！\n先にそちらを攻撃してください", true); return;
//         }
//     }
//     if (targetType === 'card' && cpu.field[enemyIndex].ability === "stealth") {
//         window.showBattleMessage("🌫️ この敵は【潜伏】しています！\n攻撃対象に選べません！", true); return;
//     }

//     let dmgToTarget = attackerCard.damage; let dmgToAttacker = 0; const attackerHtmlId = `p-card-${attackerIndex}`;

//     if (targetType === 'cpu') {
//         cpu.hp -= dmgToTarget; window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', dmgToTarget);
//     } else if (targetType === 'card') {
//         const targetCard = cpu.field[enemyIndex]; const targetHtmlId = `c-card-${enemyIndex}`;
//         dmgToAttacker = targetCard.damage;
//         if (targetCard.ability === "absolute_field") dmgToTarget = 1;
//         if (attackerCard.ability === "absolute_field") dmgToAttacker = 1;
//         if (targetCard.ability === "absolute_fortress") dmgToTarget = Math.max(0, dmgToTarget - 20);
//         if (attackerCard.ability === "absolute_fortress") dmgToAttacker = Math.max(0, dmgToAttacker - 20);

//         targetCard.hp -= dmgToTarget; window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmgToTarget);
//         window.checkDeath(targetCard, cpu, targetHtmlId);
//         if (targetCard.ability === "stealth") targetCard.ability = null;
//     }

//     if (attackerCard.ability === "god_strike") {
//         const otherEnemies = cpu.field.filter((c, idx) => (!c.isDead && (targetType === 'cpu' || idx !== enemyIndex)));
//         if (otherEnemies.length > 0) {
//             let tCard = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
//             tCard.hp = 0; window.checkDeath(tCard, cpu, `c-card-${cpu.field.indexOf(tCard)}`);
//             window.showBattleMessage("⚔️ 【神の一撃】が別の敵を葬り去った！", false, 1500);
//         }
//     }
//     if (attackerCard.ability === "dimension_drill" && targetType === 'card') {
//         cpu.hp -= dmgToTarget; window.showVFX('cpu-face', 'damage', dmgToTarget); window.showBattleMessage("🌪️ 【次元穿孔】敵リーダーも貫いた！", false, 1500);
//     }
//     if (attackerCard.ability === "pierce_recoil") { dmgToAttacker += 10; window.showBattleMessage("⚡ 暴走回路の反動ダメージ！", true, 1000); }

//     if (dmgToAttacker > 0) {
//         setTimeout(() => {
//             attackerCard.hp -= dmgToAttacker; window.showVFX(attackerHtmlId, 'slash'); window.showVFX(attackerHtmlId, 'damage', dmgToAttacker);
//             window.checkDeath(attackerCard, p, attackerHtmlId); window.renderBattleBoard();
//         }, 200);
//     }
    
//     if (attackerCard.ability === "stealth") attackerCard.ability = null;
//     attackerCard.canAttack = false; window.TCG_BATTLE.selectedAttackerIndex = -1; window.renderBattleBoard();

//     setTimeout(() => {
//         p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);
//         if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
//         if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
//         window.renderBattleBoard();
//     }, 800);
// };

// window.showTurnCutin = function(text, color, callback) {
//     const ui = document.getElementById('tcg-battle-ui');
//     if (!ui) { if(callback) callback(); return; }
//     if (text.includes("YOUR TURN")) window.TCG_BATTLE.player.field.forEach(c => c.isDefending = false);

//     const blocker = document.createElement('div');
//     blocker.style.cssText = `position: absolute; top:0; left:0; width:100%; height:100%; z-index:25000;`;
//     ui.appendChild(blocker);

//     const splash = document.createElement('div');
//     splash.style.cssText = `
//         position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 26000; display: flex;
//         justify-content: center; align-items: center; color: white; text-align: center;
//         font-size: 90px; font-weight: bold; font-style: italic; white-space: pre-wrap; line-height: 1.1;
//         text-shadow: 0 0 40px ${color}, 5px 5px 0 #000, -2px -2px 0 #000;
//         opacity: 0; transform: scale(1.5) skewX(-15deg); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;
//     `;
//     splash.innerHTML = text; ui.appendChild(splash);

//     setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1) skewX(-15deg)'; }, 50);
//     setTimeout(() => {
//         splash.style.opacity = '0'; splash.style.transform = 'scale(0.8) skewX(-15deg)';
//         setTimeout(() => { splash.remove(); blocker.remove(); if (callback) callback(); }, 300);
//     }, 1200);
// };

// window.showDefendHintModal = function(onConfirm) {
//     let modal = document.getElementById('tcg-defend-hint-modal');
//     if (!modal) {
//         modal = document.createElement('div'); modal.id = 'tcg-defend-hint-modal';
//         modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 30000; display: flex; justify-content: center; align-items: center;`;
//         document.body.appendChild(modal);
//     }
//     modal.innerHTML = `
//         <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 25px; width: 400px; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5);">
//             <h3 style="color: #00BCD4; margin-top: 0;">💡 マナが残っています！</h3>
//             <p style="line-height: 1.6; font-size: 15px;">行動済みのモンスターをクリックすると、<span style="color:#FFD700; font-weight:bold;">1マナ消費して「🛡️守護」の壁役にさせる</span>ことができます。<br><br>リーダーを守るためにマナを残して壁を作るのも重要な作戦です。このままターンを終了しますか？</p>
//             <label style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer; font-size: 14px; color: #ddd; background: #111; padding: 10px; border-radius: 6px;">
//                 <input type="checkbox" id="defend-hint-checkbox" style="margin-right: 10px; transform: scale(1.3); cursor: pointer;"><span>このバトル中は、次から表示しない</span>
//             </label>
//             <div style="display: flex; justify-content: space-between; gap: 10px;">
//                 <button id="btn-hint-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">盤面に戻る</button>
//                 <button id="btn-hint-ok" style="flex: 1; padding: 12px; background: #FF9800; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F57C00'" onmouseout="this.style.background='#FF9800'">ターンを終了する</button>
//             </div>
//         </div>
//     `;
//     modal.style.display = 'flex';
//     document.getElementById('btn-hint-cancel').onclick = () => { modal.style.display = 'none'; };
//     document.getElementById('btn-hint-ok').onclick = () => {
//         if (document.getElementById('defend-hint-checkbox').checked) window.TCG_BATTLE._skipDefendHint = true;
//         modal.style.display = 'none'; onConfirm(); 
//     };
// };

// window.executeRealEndTurn = function() {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     p.field.forEach((c, i) => {
//         if (c.isDead) return;
//         if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`p-card-${i}`, 'heal', 20); }
//         if (c.ability === "cyber_miracle") { p.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 10; window.showVFX(`p-card-${fi}`, 'heal', '全回復'); } }); }
//         if (c.ability === "event_horizon") {
//             const aliveEnemies = cpu.field.filter(e => !e.isDead);
//             if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; cpu.deck.push(target); window.showVFX(`c-card-${cpu.field.indexOf(target)}`, 'slash', 'バウンス'); }
//         }
//         if (c.ability === "divine_grace" && p.graveyard && p.graveyard.length > 0) {
//             let resCard = p.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
//             p.field.push(resCard); window.showBattleMessage("✨ 【神の恩寵】\n破壊された味方が復活した！");
//         }
//     });
//     p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);
//     window.showTurnCutin("ENEMY TURN", "#ff5252", () => { window.executeCPUTurn(); });
// };

// window.endTurn = function() {
//     window.TCG_BATTLE.selectedAttackerIndex = -1; window.TCG_BATTLE.player.actionUsed = false; window.renderBattleBoard();
//     if (window.TCG_BATTLE.player.currentMana >= 1 && !window.TCG_BATTLE._skipDefendHint) {
//         const canDefendCard = window.TCG_BATTLE.player.field.find(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt");
//         if (canDefendCard) { window.showDefendHintModal(window.executeRealEndTurn); return; }
//     }
//     window.executeRealEndTurn();
// };

// window.executeCPUTurn = function() {
//     const pField = window.TCG_BATTLE.player.field;
//     pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     if (cpu.maxMana < 10) cpu.maxMana++; cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
//     cpu.field.forEach((c, i) => {
//         if (c.isDead) return;
//         if (c.ability === "start_draw") { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
//         if (c.ability === "star_breath") { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
//         if (c.ability === "heaven_judgement") {
//             p.hp -= 20; window.showVFX('player-face', 'damage', 20);
//             p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`); } });
//         }
//     });
    
//     if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift());
//     cpu.field.forEach(card => card.canAttack = true);
//     window.renderBattleBoard();

//     setTimeout(() => {
//         let delay = 0;
//         cpu.field.forEach((cpuCard, cpuIndex) => {
//             if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
//             setTimeout(() => {
//                 const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
//                 const validTargets = p.field.filter(c => c.ability !== "stealth"); 
//                 let target = null; let targetHtmlId = null;

//                 const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill";
//                 if (tauntTargets.length > 0 && !isPierce) target = tauntTargets[Math.floor(Math.random() * tauntTargets.length)];
//                 else if (validTargets.length > 0 && Math.random() > 0.5) target = validTargets[Math.floor(Math.random() * validTargets.length)];

//                 let dmgToTarget = cpuCard.damage; let dmgToAttacker = target ? target.damage : 0;

//                 if (target) {
//                     targetHtmlId = `p-card-${p.field.indexOf(target)}`;
//                     if (target.ability === "absolute_field") dmgToTarget = 1;
//                     if (cpuCard.ability === "absolute_field") dmgToAttacker = 1;
//                     if (target.ability === "absolute_fortress") dmgToTarget = Math.max(0, dmgToTarget - 20);
//                     if (cpuCard.ability === "absolute_fortress") dmgToAttacker = Math.max(0, dmgToAttacker - 20);

//                     target.hp -= dmgToTarget; window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmgToTarget);
//                     window.checkDeath(target, p, targetHtmlId);
//                     if (target.ability === "stealth") target.ability = null;
//                 } else {
//                     p.hp -= dmgToTarget; window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', dmgToTarget);
//                     const ui = document.getElementById('tcg-battle-ui'); ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect');
//                 }

//                 if (cpuCard.ability === "dimension_drill" && target) { p.hp -= dmgToTarget; window.showVFX('player-face', 'damage', dmgToTarget); }
//                 if (cpuCard.ability === "god_strike") {
//                     const otherP = p.field.filter(c => c !== target && !c.isDead);
//                     if (otherP.length > 0) { let tCard = otherP[Math.floor(Math.random() * otherP.length)]; tCard.hp = 0; window.checkDeath(tCard, p, `p-card-${p.field.indexOf(tCard)}`); }
//                 }

//                 if (dmgToAttacker > 0) {
//                     setTimeout(() => { cpuCard.hp -= dmgToAttacker; window.showVFX(`c-card-${cpuIndex}`, 'slash'); window.showVFX(`c-card-${cpuIndex}`, 'damage', dmgToAttacker); window.checkDeath(cpuCard, cpu, `c-card-${cpuIndex}`); }, 200);
//                 }
                
//                 if (cpuCard.ability === "stealth") cpuCard.ability = null;
//                 cpuCard.canAttack = false; window.renderBattleBoard();
//             }, delay);
//             delay += 800;
//         });

//         setTimeout(() => {
//             pField.forEach(c => { if (c.isDefending && c._tempOriginalAbility !== undefined) c.ability = c._tempOriginalAbility; });
//             p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

//             if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

//             for (let i = cpu.hand.length - 1; i >= 0; i--) {
//                 let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
//                 if (cpu.currentMana >= actualCost) {
//                     if (card.type === 'action' && cpu.actionUsed) continue;
//                     if (card.evolvesFrom) {
//                         let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
//                         if (targetIndex !== -1) {
//                             cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); card.canAttack = false;
//                             cpu.field[targetIndex] = card; window.triggerPlayEffect(card, false); continue;
//                         } else { continue; }
//                     }
//                     cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
//                     if (card.type === 'action') cpu.actionUsed = true;
//                     if (card.type === 'item' || card.type === 'action') { window.triggerPlayEffect(card, false); } 
//                     else { card.canAttack = false; cpu.field.push(card); window.triggerPlayEffect(card, false); }
//                 }
//             }

//             cpu.field.forEach((c, i) => {
//                 if (c.isDead) return;
//                 if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
//                 if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 10; window.showVFX(`c-card-${fi}`, 'heal', '全回復'); } }); }
//                 if (c.ability === "event_horizon") {
//                     const aliveEnemies = p.field.filter(e => !e.isDead);
//                     if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
//                 }
//                 if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
//                     let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
//                     cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
//                 }
//             });
//             p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

//             window.TCG_BATTLE.turn++;
//             if (p.maxMana < 10) p.maxMana++; p.currentMana = p.maxMana; p.actionUsed = false; window.TCG_BATTLE.selectedHandCardIndex = -1; 
            
//             if (p.deck.length > 0) p.hand.push(p.deck.shift());
//             p.field.forEach(card => card.canAttack = true);
//             window.renderBattleBoard();

//             window.showTurnCutin(`TURN ${window.TCG_BATTLE.turn}\nYOUR TURN`, "#4CAF50", () => {
//                 p.field.forEach((c, i) => {
//                     if (c.isDead) return;
//                     if (c.ability === "start_draw") { if (p.deck.length > 0) p.hand.push(p.deck.shift()); window.showVFX(`p-card-${i}`, 'heal', 'Draw'); }
//                     if (c.ability === "star_breath") { p.maxMana = Math.min(10, p.maxMana+2); p.currentMana = Math.min(10, p.currentMana+2); p.hp += 30; window.showVFX('player-face', 'heal', 30); }
//                     if (c.ability === "heaven_judgement") {
//                         cpu.hp -= 20; window.showVFX('cpu-face', 'damage', 20);
//                         cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`c-card-${fi}`, 'damage', 20); window.checkDeath(f, cpu, `c-card-${fi}`); } });
//                     }
//                 });
//                 cpu.field = cpu.field.filter(c => !c.isDead);
//                 window.renderBattleBoard(); window.showBattleMessage("✨ マナが回復し、カードを1枚引きました！", false, 2000);
//             });
//         }, delay + 500);
//     }, 800); 
// };

// setInterval(() => {
//     if (!window.TCG || !window.TCG.myCollection) return;
//     const count = window.TCG.myCollection.length;
//     const isUnlocked = count >= 60; 

//     const allTextElements = document.querySelectorAll('div, h2, h3, span, div.menu-title');
//     allTextElements.forEach(el => {
//         if (el.children.length === 0 || el.classList.contains('menu-title')) { 
//             const t = el.innerText.trim();
//             if (t === '🃏 TCGメニュー' || t === 'TCGメニュー') {
//                 if (!isUnlocked) el.innerText = '📖 思い出アルバム';
//             } else if (t === '📖 思い出アルバム') {
//                 if (isUnlocked) el.innerText = '🃏 TCGメニュー';
//             }
//         }
//     });

//     const buttons = document.querySelectorAll('button');
//     buttons.forEach(btn => {
//         const t = btn.innerText;
//         if (t.includes('世界のプレイヤーと対戦') || t.includes('名もなきCPUと練習') || t.includes('デッキをオンライン登録')) {
//             btn.style.display = isUnlocked ? 'block' : 'none';
//         }
//         if (t.includes('コレクション / 編成') || t.includes('記録を見る')) {
//             if (!isUnlocked) {
//                 btn.innerText = `🗃️ 記録を見る (現在: ${count} / 60 個)`;
//             } else {
//                 btn.innerText = '🗃️ コレクション / 編成';
//             }
//         }
//     });
// }, 1000);

// // ==========================================
// // ✨ おまかせ編成 ＆ フルオートバトル 追加パッチ
// // ==========================================

// // --- 1. デッキ自動編成ロジック ---
// window.autoBuildDeck = function() {
//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
//     if (!isUnlocked) return;

//     const targetType = prompt("どの系統を中心にデッキを組みますか？\n（例: robot, dragon, magician, spirit, stone, machine, ghost, bird, beetle, seed, balloon）", "robot");
//     if (!targetType) return;

//     let myCards = [...window.TCG.myCollection];
//     let selectedUids = [];

//     // 優先度別にカードを振り分け
//     let primaryCards = myCards.filter(c => c.type.startsWith(targetType)); // 進化系含む指定種族
//     let supportCards = myCards.filter(c => ['item', 'action', 'field'].includes(c.type)); // サポート
//     let otherCards = myCards.filter(c => !c.type.startsWith(targetType) && !['item', 'action', 'field'].includes(c.type));

//     // シャッフル
//     window.shuffleArray(primaryCards); window.shuffleArray(supportCards); window.shuffleArray(otherCards);

//     // バランス： モンスター45枚、サポート15枚を目指す
//     let targetPrimary = 45; let targetSupport = 15;

//     for (let c of primaryCards) { if (selectedUids.length < 60 && targetPrimary > 0) { selectedUids.push(c.uid); targetPrimary--; } }
//     for (let c of supportCards) { if (selectedUids.length < 60 && targetSupport > 0) { selectedUids.push(c.uid); targetSupport--; } }
    
//     // 足りなければ残りの種族カードとサポートで埋める
//     for (let c of primaryCards) { if (selectedUids.length < 60 && !selectedUids.includes(c.uid)) selectedUids.push(c.uid); }
//     for (let c of supportCards) { if (selectedUids.length < 60 && !selectedUids.includes(c.uid)) selectedUids.push(c.uid); }
//     // それでも足りなければ関係ないカードで埋める
//     for (let c of otherCards) { if (selectedUids.length < 60 && !selectedUids.includes(c.uid)) selectedUids.push(c.uid); }

//     if (selectedUids.length < 60) {
//         alert("所持カードが60枚未満のため、編成できませんでした。"); return;
//     }

//     window.TCG.editingDeck = selectedUids;
//     window.refreshDeckBuilderView();
//     alert(`✨「${targetType}」中心の最強デッキを自動編成しました！\n問題なければ右上の「デッキを保存」を押してください。`);
// };

// // --- 2. 編成画面に「おまかせ編成ボタン」を差し込む ---
// window._baseOpenDeckBuilderForAuto = window._baseOpenDeckBuilderForAuto || window.openDeckBuilder;
// window.openDeckBuilder = function() {
//     window._baseOpenDeckBuilderForAuto();
//     // 描画された直後にボタンをDOMに追加
//     setTimeout(() => {
//         let saveBtn = document.getElementById('db-save-btn');
//         if (saveBtn && !document.getElementById('db-auto-btn')) {
//             let autoBtn = document.createElement('button');
//             autoBtn.id = 'db-auto-btn';
//             autoBtn.innerText = '✨ おまかせ編成';
//             autoBtn.style.cssText = 'background: #00BCD4; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px; transition: 0.2s;';
//             autoBtn.onmouseover = () => autoBtn.style.transform = 'scale(1.05)';
//             autoBtn.onmouseout = () => autoBtn.style.transform = 'scale(1)';
//             autoBtn.onclick = window.autoBuildDeck;
//             saveBtn.parentNode.insertBefore(autoBtn, saveBtn);
//         }
//     }, 100);
// };

// // --- 3. バトル画面に「AUTOボタン」を差し込む ---
// window._baseRenderBattleBoardForAuto = window._baseRenderBattleBoardForAuto || window.renderBattleBoard;
// window.renderBattleBoard = function() {
//     window._baseRenderBattleBoardForAuto();
    
//     let playerFace = document.getElementById('player-face');
//     if (playerFace && !document.getElementById('battle-auto-btn')) {
//         let btnContainer = document.createElement('div');
//         btnContainer.style.marginTop = 'auto';
//         playerFace.appendChild(btnContainer);
        
//         let autoBtn = document.createElement('button');
//         autoBtn.id = 'battle-auto-btn';
//         autoBtn.onclick = () => {
//             window.TCG_BATTLE.isAuto = !window.TCG_BATTLE.isAuto;
//             window.renderBattleBoard();
//         };
//         btnContainer.appendChild(autoBtn);
//     }
    
//     let autoBtn = document.getElementById('battle-auto-btn');
//     if (autoBtn && window.TCG_BATTLE) {
//         const isAuto = window.TCG_BATTLE.isAuto;
//         autoBtn.innerText = isAuto ? '🤖 AUTO: ON' : '👤 AUTO: OFF';
//         autoBtn.style.cssText = `padding: 8px 15px; font-size: 16px; font-weight: bold; background: ${isAuto ? '#E91E63' : '#555'}; color: #fff; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; width: 100%; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.5);`;
//     }
// };

// // --- 4. バトル進行のフラグ管理フック ---
// window._baseStartBattleForAuto = window._baseStartBattleForAuto || window.startBattle;
// window.startBattle = function(enemyData) {
//     window._baseStartBattleForAuto(enemyData);
//     if(window.TCG_BATTLE) {
//         window.TCG_BATTLE.isEnemyTurn = false;
//         window.TCG_BATTLE.isAnimating = true;
//         window.TCG_BATTLE.isAuto = false; // 初期はOFF
//     }
//     setTimeout(() => { if(window.TCG_BATTLE) window.TCG_BATTLE.isAnimating = false; }, 3500); // 最初のドロー演出完了待ち
// };

// window._baseShowTurnCutinForAuto = window._baseShowTurnCutinForAuto || window.showTurnCutin;
// window.showTurnCutin = function(text, color, callback) {
//     if (text.includes("ENEMY TURN")) window.TCG_BATTLE.isEnemyTurn = true;
//     if (text.includes("YOUR TURN")) window.TCG_BATTLE.isEnemyTurn = false;
    
//     window.TCG_BATTLE.isAnimating = true;
//     setTimeout(() => { window.TCG_BATTLE.isAnimating = false; }, 2000); // カットイン終了待ち
    
//     window._baseShowTurnCutinForAuto(text, color, callback);
// };

// // --- 5. オートバトルのAIロジック（毎秒監視） ---
// if (window.TCG_BATTLE_AUTO_LOOP) clearInterval(window.TCG_BATTLE_AUTO_LOOP);
// window.TCG_BATTLE_AUTO_LOOP = setInterval(() => {
//     if (!window.TCG_BATTLE || !document.getElementById('tcg-battle-ui') || document.getElementById('tcg-battle-ui').style.display === 'none') return;
//     if (!window.TCG_BATTLE.isAuto || window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating) return;

//     const p = window.TCG_BATTLE.player;
//     const cpu = window.TCG_BATTLE.cpu;

//     // アニメーションロックをかけるヘルパー（演出が被らないように1.5秒待機）
//     const lockAnimation = () => {
//         window.TCG_BATTLE.isAnimating = true;
//         setTimeout(() => { window.TCG_BATTLE.isAnimating = false; }, 1500);
//     };

//     // ① 攻撃可能なモンスターがいれば攻撃！
//     let attackerIndex = p.field.findIndex(c => c.canAttack && c.damage > 0 && !c.isDead);
//     if (attackerIndex !== -1) {
//         window.TCG_BATTLE.selectedAttackerIndex = attackerIndex;
//         let targetType = 'cpu'; let enemyIndex = 0;
//         const tauntTargets = cpu.field.filter(c => (c.ability === "taunt" || c.isDefending) && !c.isDead);
//         const validTargets = cpu.field.filter(c => c.ability !== "stealth" && !c.isDead); 
//         const attackerCard = p.field[attackerIndex];
//         const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill";

//         if (tauntTargets.length > 0 && !isPierce) {
//             let t = tauntTargets[Math.floor(Math.random() * tauntTargets.length)];
//             targetType = 'card'; enemyIndex = cpu.field.indexOf(t);
//         } else if (validTargets.length > 0 && Math.random() > 0.5) {
//             let t = validTargets[Math.floor(Math.random() * validTargets.length)];
//             targetType = 'card'; enemyIndex = cpu.field.indexOf(t);
//         }
//         lockAnimation();
//         window.executeAttack(targetType, enemyIndex);
//         return;
//     }

//     // ② 手札に出せるカード（進化含む）があれば出す！
//     for (let i = p.hand.length - 1; i >= 0; i--) {
//         let card = p.hand[i];
//         let actualCost = window.getActualCost(p, card);
//         if (p.currentMana >= actualCost) {
//             if (card.type === 'action' && p.actionUsed) continue;
            
//             if (card.evolvesFrom) {
//                 let targetIndex = p.field.findIndex(c => c.type === card.evolvesFrom && !c.isDead);
//                 if (targetIndex !== -1) {
//                     lockAnimation();
//                     window.TCG_BATTLE.selectedHandCardIndex = i;
//                     window.selectPlayerCard(targetIndex); // 進化実行
//                     return;
//                 }
//                 continue;
//             }
//             lockAnimation();
//             window.playCard(i); // 通常召喚・魔法使用
//             return;
//         }
//     }

//     // ③ やることがなくマナが余っていれば、1マナ防御陣形をとる！
//     let defIndex = p.field.findIndex(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && !c.isDead);
//     if (defIndex !== -1 && p.currentMana >= 1) {
//         lockAnimation();
//         window.selectPlayerCard(defIndex);
//         return;
//     }

//     // ④ マナも尽き、攻撃も終わったらターンエンド！
//     lockAnimation();
//     window.TCG_BATTLE._skipDefendHint = true; // オート中はヒントを出さず即終了
//     window.endTurn();

// }, 1500); // 1.5秒おきに状況を判断して動く（人間が見ていて気持ちいい速度）

// // ==========================================
// // ✨ 超リッチ「おまかせ編成」UI＆賢いロジック 追加パッチ
// // ==========================================

// // 1. おまかせ編成ボタンが押された時に「専用のモーダル」を開くように上書き
// window.autoBuildDeck = function() {
//     const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
//     if (!isUnlocked) {
//         alert("カードが60枚未満のため、おまかせ編成は使えません。");
//         return;
//     }
    
//     let modal = document.getElementById('tcg-auto-build-modal');
//     if (!modal) {
//         modal = document.createElement('div');
//         modal.id = 'tcg-auto-build-modal';
//         modal.style.cssText = `
//             position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//             background: rgba(0,0,0,0.85); z-index: 30000;
//             display: flex; justify-content: center; align-items: center;
//         `;
//         document.body.appendChild(modal);
//     }
    
//     // チェックボックス用の種族リスト
//     const speciesList = [
//         { id: 'robot', name: '🤖 ロボット' },
//         { id: 'dragon', name: '🐉 ドラゴン' },
//         { id: 'magician', name: '🧙 魔法使い' },
//         { id: 'spirit', name: '🍃 精霊' },
//         { id: 'stone', name: '🪨 ゴーレム' },
//         { id: 'machine', name: '⚙️ ぜんまい' },
//         { id: 'ghost', name: '👻 ゴースト' },
//         { id: 'bird', name: '🐦 鳥' },
//         { id: 'beetle', name: '🪲 虫' },
//         { id: 'seed', name: '🌱 つぼみ' },
//         { id: 'balloon', name: '🎈 風船' },
//         { id: 'support', name: '🎒 サポート(魔法/罠等)' }
//     ];
    
//     let speciesHtml = speciesList.map(s => `
//         <label style="display:flex; align-items:center; gap:5px; background:#111; padding:8px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//             <input type="checkbox" value="${s.id}" class="auto-species-cb" style="transform: scale(1.2);" ${s.id==='robot'?'checked':''}>
//             <span style="font-size:14px; color:#fff;">${s.name}</span>
//         </label>
//     `).join('');
    
//     modal.innerHTML = `
//         <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 20px; width: 500px; max-width:90%; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5); max-height:90vh; overflow-y:auto;">
//             <h3 style="color: #00BCD4; margin-top: 0; text-align:center; border-bottom:1px solid #444; padding-bottom:10px;">✨ おまかせデッキ編成</h3>
            
//             <div style="margin-bottom: 20px;">
//                 <h4 style="margin:0 0 10px 0; color:#FFD700;">1. 入れたい系統（複数選択可）</h4>
//                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
//                     ${speciesHtml}
//                 </div>
//             </div>
            
//             <div style="margin-bottom: 20px;">
//                 <h4 style="margin:0 0 10px 0; color:#FFD700;">2. デッキのコンセプト方針</h4>
//                 <div style="display:flex; flex-direction:column; gap:8px;">
//                     <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//                         <input type="radio" name="auto-concept" value="balance" checked style="transform: scale(1.3);">
//                         <div>
//                             <div style="font-weight:bold; font-size:14px; color:#fff;">⚖️ バランス型</div>
//                             <div style="font-size:11px; color:#aaa;">色々なカードを程よく配合した標準デッキ。迷ったらこれ。</div>
//                         </div>
//                     </label>
//                     <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//                         <input type="radio" name="auto-concept" value="aggro" style="transform: scale(1.3);">
//                         <div>
//                             <div style="font-weight:bold; font-size:14px; color:#fff;">⚔️ 低コスト速攻型</div>
//                             <div style="font-size:11px; color:#aaa;">コスト1〜3の軽いカードを最優先し、手数で盤面を制圧する。</div>
//                         </div>
//                     </label>
//                     <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//                         <input type="radio" name="auto-concept" value="heavy" style="transform: scale(1.3);">
//                         <div>
//                             <div style="font-weight:bold; font-size:14px; color:#fff;">🌋 高コスト重火力型</div>
//                             <div style="font-size:11px; color:#aaa;">コスト4以上の大型モンスターを主軸にした一撃必殺のロマン砲。</div>
//                         </div>
//                     </label>
//                     <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//                         <input type="radio" name="auto-concept" value="evolve" style="transform: scale(1.3);">
//                         <div>
//                             <div style="font-weight:bold; font-size:14px; color:#fff;">👑 進化特化型</div>
//                             <div style="font-size:11px; color:#aaa;">進化カードとその進化元となる基本カードを最優先でかき集める。</div>
//                         </div>
//                     </label>
//                     <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
//                         <input type="radio" name="auto-concept" value="support" style="transform: scale(1.3);">
//                         <div>
//                             <div style="font-weight:bold; font-size:14px; color:#fff;">🎒 サポート多用型</div>
//                             <div style="font-size:11px; color:#aaa;">アイテムや魔法、フィールドを大量に積み、トリッキーに戦う。</div>
//                         </div>
//                     </label>
//                 </div>
//             </div>
            
//             <div style="display: flex; justify-content: space-between; gap: 15px; margin-top:20px;">
//                 <button id="btn-auto-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">キャンセル</button>
//                 <button id="btn-auto-exec" style="flex: 2; padding: 12px; background: #00BCD4; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#26C6DA'" onmouseout="this.style.background='#00BCD4'">この条件で編成する</button>
//             </div>
//         </div>
//     `;
//     modal.style.display = 'flex';
    
//     document.getElementById('btn-auto-cancel').onclick = () => modal.style.display = 'none';
    
//     document.getElementById('btn-auto-exec').onclick = () => {
//         // 選択された系統を取得
//         const cbs = document.querySelectorAll('.auto-species-cb:checked');
//         let selectedTypes = Array.from(cbs).map(cb => cb.value);
//         if (selectedTypes.length === 0) {
//             alert("少なくとも1つの系統を選んでください！"); return;
//         }
//         // 選択されたコンセプトを取得
//         const concept = document.querySelector('input[name="auto-concept"]:checked').value;
        
//         modal.style.display = 'none';
//         window.executeAutoBuildLogic(selectedTypes, concept);
//     };
// };

// // 2. 賢い自動編成ロジック本体
// window.executeAutoBuildLogic = function(selectedTypes, concept) {
//     let myCards = [...window.TCG.myCollection];
//     let selectedUids = [];

//     // まず、指定された系統のカードだけを抽出（プール化）
//     let pool = myCards.filter(c => {
//         if (selectedTypes.includes('support') && ['item','action','field'].includes(c.type)) return true;
//         for (let t of selectedTypes) {
//             if (t !== 'support' && c.type.startsWith(t)) return true;
//         }
//         return false;
//     });
    
//     // 指定外のカード（枠が余った時の埋め合わせ用）
//     let otherPool = myCards.filter(c => !pool.includes(c));

//     // ランダム性を出すため一旦シャッフル
//     window.shuffleArray(pool);
//     window.shuffleArray(otherPool);

//     // ★ 選ばれたコンセプトによる「優先度ソート」
//     if (concept === 'aggro') {
//         // コストの低い順（軽いカードがデッキに入りやすくなる）
//         pool.sort((a, b) => a.cost - b.cost);
//     } else if (concept === 'heavy') {
//         // コストの高い順（重いカードが入りやすくなる）
//         pool.sort((a, b) => b.cost - a.cost);
//     } else if (concept === 'evolve') {
//         // 進化カードと、その土台になる基本モンスターを優先して前に持ってくる
//         pool.sort((a, b) => {
//             let aEvo = a.evolvesFrom ? 1 : 0;
//             let bEvo = b.evolvesFrom ? 1 : 0;
//             let aBase = (!a.evolvesFrom && !['item','action','field'].includes(a.type)) ? 0.5 : 0;
//             let bBase = (!b.evolvesFrom && !['item','action','field'].includes(b.type)) ? 0.5 : 0;
//             return (bEvo + bBase) - (aEvo + aBase);
//         });
//     } else if (concept === 'support') {
//         // サポートカードを優先して前に持ってくる
//         pool.sort((a, b) => {
//             let aSup = ['item','action','field'].includes(a.type) ? 1 : 0;
//             let bSup = ['item','action','field'].includes(b.type) ? 1 : 0;
//             return bSup - aSup;
//         });
//     }

//     // ソートされたプールから、上から順に最大60枚をデッキに詰める
//     for (let c of pool) {
//         if (selectedUids.length < 60) selectedUids.push(c.uid);
//     }
    
//     // もし選んだ種族だけでは60枚に届かなかった場合、関係ないカードで埋める
//     for (let c of otherPool) {
//         if (selectedUids.length < 60 && !selectedUids.includes(c.uid)) selectedUids.push(c.uid);
//     }

//     // デッキを更新して画面に反映
//     window.TCG.editingDeck = selectedUids;
//     window.refreshDeckBuilderView();
    
//     // 少し遅れて画面中央にカッコいいメッセージを出す
//     const uiTitle = document.getElementById('db-title-text');
//     if(uiTitle) {
//         let msg = document.createElement('div');
//         msg.innerHTML = "✨ 条件に合わせて最強デッキを編成しました！<br>（右上の『デッキを保存』を押してください）";
//         msg.style.cssText = "position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); background:rgba(0,188,212,0.9); color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 3s forwards;";
//         document.getElementById('tcg-deck-builder').appendChild(msg);
//         setTimeout(() => msg.remove(), 3000);
//     }
// };

// // ==========================================
// // 🪙 先攻・後攻 コイントス＆バランス調整 パッチ
// // ==========================================

// // --- 1. コイントス演出用のCSS ---
// if (!document.getElementById('tcg-cointoss-styles')) {
//     const style = document.createElement('style');
//     style.id = 'tcg-cointoss-styles';
//     style.innerHTML = `
//         @keyframes coinFlip {
//             0% { transform: rotateY(0deg) scale(1); }
//             50% { transform: rotateY(900deg) scale(1.5); }
//             100% { transform: rotateY(1800deg) scale(1); }
//         }
//         .coin-flip-anim { animation: coinFlip 2.5s cubic-bezier(0.2, 0.8, 0.4, 1) forwards; }
//     `;
//     document.head.appendChild(style);
// }

// // --- 2. プレイヤーのターン開始処理（独立化） ---
// window.startPlayerTurn = function(isFirstTurn = false) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     window.TCG_BATTLE.isEnemyTurn = false;

//     // ターン（ラウンド）数の加算：自分が先攻の時の2ターン目以降
//     if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'player') window.TCG_BATTLE.turn++;

//     // マナの回復
//     if (p.maxMana < 10) p.maxMana++;
//     p.currentMana = p.maxMana; p.actionUsed = false; window.TCG_BATTLE.selectedHandCardIndex = -1; 
    
//     let drewCard = false;
//     // ★ バランス調整：初手以外、または後攻の初手ならドロー（先攻1ターン目はドロー不可）
//     if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'cpu') && p.deck.length > 0) {
//         p.hand.push(p.deck.shift()); drewCard = true;
//     }
    
//     p.field.forEach(card => card.canAttack = true);
//     window.renderBattleBoard();

//     window.showTurnCutin(`TURN ${window.TCG_BATTLE.turn}\nYOUR TURN`, "#4CAF50", () => {
//         // ターン開始時効果
//         p.field.forEach((c, i) => {
//             if (c.isDead) return;
//             if (c.ability === "start_draw" && !c.isDead) {
//                 if (p.deck.length > 0) p.hand.push(p.deck.shift());
//                 window.showVFX(`p-card-${i}`, 'heal', 'Draw'); window.showBattleMessage("✨ 【超演算】\nターン開始時、追加で1枚ドロー！");
//             }
//             if (c.ability === "star_breath" && !c.isDead) { p.maxMana = Math.min(10, p.maxMana+2); p.currentMana = Math.min(10, p.currentMana+2); p.hp += 30; window.showVFX('player-face', 'heal', 30); }
//             if (c.ability === "heaven_judgement" && !c.isDead) {
//                 cpu.hp -= 20; window.showVFX('cpu-face', 'damage', 20);
//                 cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`c-card-${fi}`, 'damage', 20); window.checkDeath(f, cpu, `c-card-${fi}`); } });
//             }
//         });
//         cpu.field = cpu.field.filter(c => !c.isDead);
//         window.renderBattleBoard(); 
        
//         if (drewCard) window.showBattleMessage("✨ マナが回復し、カードを1枚引きました！", false, 2000);
//         else window.showBattleMessage("✨ マナが回復しました！\n（先攻1ターン目はドローなし）", false, 3500);
        
//         window.TCG_BATTLE.isAnimating = false; // オート用のロック解除
//     });
// };

// // --- 3. CPUのターン開始処理（上書き） ---
// window.executeCPUTurn = function(isFirstTurn = false) {
//     window.TCG_BATTLE.isEnemyTurn = true;
//     window.TCG_BATTLE.isAnimating = true;

//     const pField = window.TCG_BATTLE.player.field;
//     pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

//     // ターン数の加算：CPUが先攻の時の2ターン目以降
//     if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

//     if (cpu.maxMana < 10) cpu.maxMana++;
//     cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
//     // ★ バランス調整：初手以外、または後攻の初手ならドロー
//     if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
//         cpu.hand.push(cpu.deck.shift());
//     }

//     cpu.field.forEach((c, i) => {
//         if (c.isDead) return;
//         if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
//         if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
//         if (c.ability === "heaven_judgement" && !c.isDead) {
//             p.hp -= 20; window.showVFX('player-face', 'damage', 20);
//             p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`); } });
//         }
//     });
    
//     cpu.field.forEach(card => card.canAttack = true);
//     window.renderBattleBoard();

//     setTimeout(() => {
//         let delay = 0;
//         cpu.field.forEach((cpuCard, cpuIndex) => {
//             if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
//             setTimeout(() => {
//                 const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
//                 const validTargets = p.field.filter(c => c.ability !== "stealth"); 
//                 let target = null; let targetHtmlId = null;

//                 const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill";
//                 if (tauntTargets.length > 0 && !isPierce) target = tauntTargets[Math.floor(Math.random() * tauntTargets.length)];
//                 else if (validTargets.length > 0 && Math.random() > 0.5) target = validTargets[Math.floor(Math.random() * validTargets.length)];

//                 let dmgToTarget = cpuCard.damage; let dmgToAttacker = target ? target.damage : 0;

//                 if (target) {
//                     targetHtmlId = `p-card-${p.field.indexOf(target)}`;
//                     if (target.ability === "absolute_field") dmgToTarget = 1;
//                     if (cpuCard.ability === "absolute_field") dmgToAttacker = 1;
//                     if (target.ability === "absolute_fortress") dmgToTarget = Math.max(0, dmgToTarget - 20);
//                     if (cpuCard.ability === "absolute_fortress") dmgToAttacker = Math.max(0, dmgToAttacker - 20);

//                     target.hp -= dmgToTarget; window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmgToTarget);
//                     window.checkDeath(target, p, targetHtmlId);
//                     if (target.ability === "stealth") target.ability = null;
//                 } else {
//                     p.hp -= dmgToTarget; window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', dmgToTarget);
//                     const ui = document.getElementById('tcg-battle-ui'); ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect');
//                 }

//                 if (cpuCard.ability === "dimension_drill" && target) { p.hp -= dmgToTarget; window.showVFX('player-face', 'damage', dmgToTarget); }
//                 if (cpuCard.ability === "god_strike") {
//                     const otherP = p.field.filter(c => c !== target && !c.isDead);
//                     if (otherP.length > 0) { let tCard = otherP[Math.floor(Math.random() * otherP.length)]; tCard.hp = 0; window.checkDeath(tCard, p, `p-card-${p.field.indexOf(tCard)}`); }
//                 }

//                 if (dmgToAttacker > 0) {
//                     setTimeout(() => { cpuCard.hp -= dmgToAttacker; window.showVFX(`c-card-${cpuIndex}`, 'slash'); window.showVFX(`c-card-${cpuIndex}`, 'damage', dmgToAttacker); window.checkDeath(cpuCard, cpu, `c-card-${cpuIndex}`); }, 200);
//                 }
                
//                 if (cpuCard.ability === "stealth") cpuCard.ability = null;
//                 cpuCard.canAttack = false; window.renderBattleBoard();
//             }, delay);
//             delay += 800;
//         });

//         setTimeout(() => {
//             pField.forEach(c => { if (c.isDefending && c._tempOriginalAbility !== undefined) c.ability = c._tempOriginalAbility; });
//             p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

//             if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

//             for (let i = cpu.hand.length - 1; i >= 0; i--) {
//                 let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
//                 if (cpu.currentMana >= actualCost) {
//                     if (card.type === 'action' && cpu.actionUsed) continue;
//                     if (card.evolvesFrom) {
//                         let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
//                         if (targetIndex !== -1) {
//                             cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); card.canAttack = false;
//                             cpu.field[targetIndex] = card; window.triggerPlayEffect(card, false); continue;
//                         } else { continue; }
//                     }
//                     cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
//                     if (card.type === 'action') cpu.actionUsed = true;
//                     if (card.type === 'item' || card.type === 'action') { window.triggerPlayEffect(card, false); } 
//                     else { card.canAttack = false; cpu.field.push(card); window.triggerPlayEffect(card, false); }
//                 }
//             }

//             cpu.field.forEach((c, i) => {
//                 if (c.isDead) return;
//                 if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
//                 if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
//                 if (c.ability === "event_horizon") {
//                     const aliveEnemies = p.field.filter(e => !e.isDead);
//                     if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
//                 }
//                 if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
//                     let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
//                     cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
//                 }
//             });
//             p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

//             // CPUターン終了後、プレイヤーのターンを開始する
//             window.startPlayerTurn(false);

//         }, delay + 500);
//     }, 800); 
// };

// // --- 4. プレイヤーのターン終了時効果（上書き） ---
// window.executeRealEndTurn = function() {
//     window.TCG_BATTLE.isAnimating = true;
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     p.field.forEach((c, i) => {
//         if (c.isDead) return;
//         if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`p-card-${i}`, 'heal', 20); }
//         if (c.ability === "cyber_miracle") { p.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`p-card-${fi}`, 'heal', '回復'); } }); }
//         if (c.ability === "event_horizon") {
//             const aliveEnemies = cpu.field.filter(e => !e.isDead);
//             if (aliveEnemies.length > 0) {
//                 let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
//                 target.isDead = true; cpu.deck.push(target); window.showVFX(`c-card-${cpu.field.indexOf(target)}`, 'slash', 'バウンス');
//             }
//         }
//         if (c.ability === "divine_grace" && p.graveyard && p.graveyard.length > 0) {
//             let resCard = p.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
//             p.field.push(resCard); window.showBattleMessage("✨ 【神の恩寵】\n破壊された味方が復活した！");
//         }
//     });
//     p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);
//     window.showTurnCutin("ENEMY TURN", "#ff5252", () => { window.executeCPUTurn(false); });
// };

// // --- 5. バトル開始の初期化とコイントス（完全上書き） ---
// window.startBattle = function(enemyData = null) {
//     if (!window.TCG.decks[0] || window.TCG.decks[0].length < 60) {
//         alert("デッキが保存されていないか、60枚以上ありません！先にデッキ編成を完了してください。"); return;
//     }

//     // 初期化（マナは0からスタートし、ターン開始時に1になる）
//     window.TCG_BATTLE = {
//         player: { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//         cpu:    { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
//         turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false,
//         firstPlayer: 'player', isEnemyTurn: false, isAnimating: true, isAuto: false
//     };
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

//     let battleUI = document.getElementById('tcg-battle-ui');
//     if (!battleUI) {
//         battleUI = document.createElement('div');
//         battleUI.id = 'tcg-battle-ui';
//         battleUI.style.cssText = `
//             position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//             background: #2a2a2a; z-index: 20000; display: flex; flex-direction: column; 
//             font-family: sans-serif; color: white; overflow: hidden;
//         `;
//         document.body.appendChild(battleUI);
//     }

//     p.deck = window.TCG.decks[0].map(uid => {
//         const originalCard = window.TCG.myCollection.find(c => c.uid === uid);
//         if (!originalCard) return null;
//         let cardCopy = JSON.parse(JSON.stringify(originalCard));
//         let master = window.TCG_MASTER[cardCopy.masterId];
//         if (master) cardCopy.hp = Math.max(cardCopy.hp, master.baseHp);
//         cardCopy.isDead = false; cardCopy.canAttack = false; cardCopy.isDefending = false;
//         return cardCopy;
//     }).filter(c => c !== null);
//     window.shuffleArray(p.deck);

//     if (enemyData && enemyData.deck) {
//         cpu.deck = enemyData.deck.map((dCard, i) => {
//             let master = window.TCG_MASTER[dCard.masterId];
//             if(!master) return null;
//             return {
//                 uid: 'ghost_' + i, masterId: dCard.masterId, name: dCard.name || master.name, type: master.type,
//                 cost: master.baseCost, hp: dCard.hp || master.baseHp, 
//                 skillName: master.skillName, skillCost: master.skillCost, damage: dCard.damage || master.baseDmg, 
//                 ability: master.ability, image: master.image, imageIndex: master.imageIndex,
//                 offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false
//             };
//         }).filter(c => c !== null);
//         if(cpu.deck.length < 60) { alert("敵のデッキデータが不完全です。通常のCPUと対戦します。"); enemyData = null; } 
//         else { window.shuffleArray(cpu.deck); }
//     } 

//     if (!enemyData || !enemyData.deck) {
//         const allMasterKeys = Object.keys(window.TCG_MASTER);
//         for (let i = 0; i < Math.max(60, p.deck.length); i++) {
//             let randomKey = allMasterKeys[Math.floor(Math.random() * allMasterKeys.length)];
//             let master = window.TCG_MASTER[randomKey];
//             cpu.deck.push({
//                 uid: 'cpu_' + i, masterId: randomKey, name: master.name, type: master.type,
//                 cost: master.baseCost, hp: master.baseHp, skillName: master.skillName,
//                 skillCost: master.skillCost, damage: master.baseDmg, ability: master.ability,
//                 image: master.image, imageIndex: master.imageIndex, offsetX: master.offsetX,
//                 offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false
//             });
//         }
//     }

//     window.renderBattleBoard();

//     let cpuNameLabel = document.getElementById('cpu-name-label');
//     if (!cpuNameLabel) {
//         cpuNameLabel = document.createElement('div');
//         cpuNameLabel.id = 'cpu-name-label';
//         cpuNameLabel.style.cssText = 'position:absolute; top:20px; right:30px; color:#FF5252; font-weight:bold; font-size:24px; text-shadow:0 0 10px #000; z-index:100;';
//         battleUI.appendChild(cpuNameLabel);
//     }
//     cpuNameLabel.innerHTML = enemyData ? `VS ${enemyData.playerName}` : "VS 名もなきCPU";
    
//     battleUI.style.display = 'flex';

//     const blocker = document.createElement('div');
//     blocker.id = 'tcg-battle-blocker';
//     blocker.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; z-index:25000;`;
//     document.body.appendChild(blocker);

//     const splash = document.createElement('div');
//     splash.id = 'tcg-battle-splash';
//     splash.style.cssText = `
//         position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//         background: rgba(0,0,0,0.85); z-index: 26000; display: flex;
//         justify-content: center; align-items: center; color: white;
//         font-size: 80px; font-weight: bold; font-style: italic; text-align:center; line-height:1.2;
//         text-shadow: 0 0 30px #FF9800, 5px 5px 0 #000;
//         opacity: 0; transform: scale(1.5); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//     `;
//     splash.innerHTML = enemyData ? `ONLINE BATTLE !!<br><span style="font-size:50px; color:#4fc3f7;">VS ${enemyData.playerName}</span>` : "BATTLE START !!";
//     document.body.appendChild(splash);

//     setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1)'; }, 50);

//     setTimeout(() => {
//         splash.style.opacity = '0'; splash.style.transform = 'scale(0.8)';
//         setTimeout(() => {
//             splash.remove();
            
//             // 🪙 コイントス演出
//             const isPlayerFirst = Math.random() < 0.5;
//             window.TCG_BATTLE.firstPlayer = isPlayerFirst ? 'player' : 'cpu';
//             window.TCG_BATTLE.isEnemyTurn = !isPlayerFirst;
            
//             const coinUI = document.createElement('div');
//             coinUI.style.cssText = `
//                 position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//                 background: rgba(0,0,0,0.85); z-index: 26000; display: flex; flex-direction: column;
//                 justify-content: center; align-items: center; color: white;
//             `;
//             coinUI.innerHTML = `
//                 <div style="font-size: 30px; font-weight: bold; margin-bottom: 30px; color:#00BCD4;">先攻・後攻を決定します...</div>
//                 <div class="coin-flip-anim" style="width: 150px; height: 150px; background: #FFD700; border-radius: 50%; border: 10px solid #FFA000; box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; font-size: 60px; font-weight: bold; color: #B28900; text-shadow: 1px 1px 0px #FFF;">
//                     TCG
//                 </div>
//             `;
//             document.body.appendChild(coinUI);

//             setTimeout(() => {
//                 coinUI.innerHTML = `
//                     <div style="font-size: 50px; font-weight: bold; margin-bottom: 30px; color:${isPlayerFirst ? '#4CAF50' : '#ff5252'}; text-shadow: 0 0 20px ${isPlayerFirst ? '#4CAF50' : '#ff5252'};">
//                         ${isPlayerFirst ? 'あなたの先攻！' : '敵の先攻！'}
//                     </div>
//                 `;
//                 setTimeout(() => {
//                     coinUI.style.opacity = '0';
//                     coinUI.style.transition = '0.5s';
//                     setTimeout(() => {
//                         coinUI.remove();
                        
//                         // 初期ドロー (5枚ずつ)
//                         let drawCount = 0;
//                         const drawTimer = setInterval(() => {
//                             if (drawCount < 5) {
//                                 p.hand.push(p.deck.shift());
//                                 cpu.hand.push(cpu.deck.shift());
//                                 window.showBattleMessage(`シュッ！ (手札: ${drawCount + 1}枚)`, false, 250);
//                                 window.renderBattleBoard();
//                                 drawCount++;
//                             } else {
//                                 clearInterval(drawTimer);
//                                 blocker.remove(); 
                                
//                                 // ターン開始！
//                                 if (isPlayerFirst) {
//                                     window.startPlayerTurn(true);
//                                 } else {
//                                     window.showTurnCutin("ENEMY TURN", "#ff5252", () => {
//                                         window.executeCPUTurn(true);
//                                     });
//                                 }
//                             }
//                         }, 350);
//                     }, 500);
//                 }, 2000);
//             }, 2500);
//         }, 500);
//     }, 1500); 
// };

// ==========================================
// 2. ヘルパー関数（タイプ名取得など）
// ==========================================
window.getCardTypeName = function(type) {
    if (type.includes('type1')) return '闇';
    if (type.includes('type2')) return '美';
    if (type.includes('type3_2')) return '賢+';
    if (type.includes('type3_3')) return '賢++'; // 2段進化用
    if (type.includes('type3')) return '賢';
    if (type.includes('type4_2')) return '活+';
    if (type.includes('type4_3')) return '活++'; // 2段進化用
    if (type.includes('type4')) return '活';
    if (type.includes('type5_2')) return '老+';   // 2段進化用
    if (type.includes('type5')) return '老';
    if (type === 'robot') return '機';
    
    const map = {
        'dragon':'竜', 'magician':'魔', 'spirit':'精', 'stone':'岩',
        'machine':'械', 'ghost':'霊', 'bird':'鳥', 'beetle':'虫',
        'seed':'草', 'balloon':'風', 'item':'具', 'action':'技', 'field':'地'
    };
    return map[type] || '無';
};

// window.getEvolvesFromName = function(evolvesFromType) {
//     const map = {
//         'robot': '基本ロボット', 'robot_type1': 'キリング系', 'robot_type2': 'アイドル系', 'robot_type3': 'アナリティクス系', 'robot_type3_2': 'マザー系', 'robot_type4': 'タンク系', 'robot_type4_2': 'アサルト系', 'robot_type5': 'スクラップ系',
//         'dragon': '基本ドラゴン', 'dragon_type4': 'ワイバーン系', 'dragon_type1': '邪竜系', 'dragon_type5': '古竜系', 'dragon_type3': '水竜系', 'dragon_type2': '宝石竜系',
//         'magician': '基本魔法使い', 'magician_type4': '武闘派系', 'magician_type1': '魔女系', 'magician_type5': '老魔道士系', 'magician_type2': '幻術師系', 'magician_type3': '学者系',
//         'ghost': '基本ゴースト', 'ghost_type4': 'ポルターガイスト系', 'ghost_type5': '古霊系', 'ghost_type1': '悪霊系', 'ghost_type3': '学者幽霊系', 'ghost_type2': '聖霊系',
//         'seed': '基本つぼみ', 'seed_type4': '野生植物系', 'seed_type1': '毒草系', 'seed_type5': '老木系', 'seed_type3': '知識の葉系', 'seed_type2': 'アロマ系',
//         'spirit': '基本精霊', 'spirit_type4': 'ゴーレム系', 'spirit_type5': '枯葉系', 'spirit_type1': '毒キノコ系', 'spirit_type3': '記録精霊系', 'spirit_type2': '妖精系',
//         'stone': '基本ゴーレム', 'stone_type4': 'マグマ系', 'stone_type5': '遺跡系', 'stone_type1': 'ガーゴイル系', 'stone_type3': 'ルーン石系', 'stone_type2': 'クリスタル系',
//         'machine': '基本ぜんまい', 'machine_type4': 'スチーム系', 'machine_type5': 'アンティーク系', 'machine_type1': '呪い人形系', 'machine_type3': 'エンジン系', 'machine_type2': 'オルゴール系',
//         'bird': '基本鳥', 'bird_type4': '猛禽系', 'bird_type5': 'フクロウ系', 'bird_type1': 'カラス系', 'bird_type3': 'ルーン鳥系', 'bird_type2': '輝鳥系',
//         'beetle': '基本かぶとむし', 'beetle_type4': '巨角系', 'beetle_type5': '琥珀系', 'beetle_type1': '狂刃系', 'beetle_type3': '指揮官系', 'beetle_type2': '宝石虫系',
//         'balloon': '基本風船', 'balloon_type4': 'マッスル系', 'balloon_type1': 'スモッグ系', 'balloon_type5': 'デフレート系', 'balloon_type3': '気象系', 'balloon_type2': 'シャボン系'
//     };
//     return map[evolvesFromType] || evolvesFromType;
// };

// ★ マナソヴリン（コスト半減）対応
window.getActualCost = function(owner, card) {
    let cost = card.cost;
    if (owner.field.some(c => c.ability === 'mana_sovereign' && !c.isDead)) {
        cost = Math.ceil(cost / 2); // コスト半減
    }
    if (card.type === 'action') {
        if (owner.field.some(c => c.ability === 'all_zero_cost' && !c.isDead)) return 0;
        if (owner.field.some(c => c.ability === 'aura_action_cost' && !c.isDead)) cost = Math.max(0, cost - 1);
    }
    return Math.max(0, cost);
};

// ★ 新死亡時能力の追加（道連れ、全体バウンス、超新星など）
window.checkDeath = function(card, owner, htmlId, enemyOwner = null) {
    if (card.hp <= 0 && !card.isDead) {
        if ((card.ability === "eternal_rebirth" || card.ability === "rebirth") && !card._reborn) {
            card.hp = card.maxHp || 100; 
            card._reborn = true;
            window.showVFX(htmlId, 'heal', '復活!');
            window.showBattleMessage(`⏳ 【${card.ability === "rebirth" ? "輪廻転生" : "悠久の再生"}】\n${card.name} が復活した！`);
            if (card.ability === "rebirth" && enemyOwner) {
                enemyOwner.field.forEach((ec, idx) => {
                    if(!ec.isDead) {
                        ec.hp -= 30;
                        window.showVFX(`${enemyOwner === window.TCG_BATTLE.cpu ? 'c' : 'p'}-card-${idx}`, 'damage', 30);
                    }
                });
                window.showBattleMessage(`🔥 フェニックスの業火が敵を焼く！`, false, 2000);
            }
        } else {
            card.isDead = true;
            if (!owner.graveyard) owner.graveyard = [];
            owner.graveyard.push(card); 

            // --- 死亡時発動アビリティ ---
            if (card.ability === "curse_death" && enemyOwner) {
                enemyOwner.hp -= 50;
                window.showVFX(enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face', 'slash');
                window.showVFX(enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face', 'damage', 50);
                window.showBattleMessage(`💀 【死の呪い】\n敵リーダーに怨念のダメージ！`);
            }
            if (card.ability === "death_bomb" && enemyOwner) {
                enemyOwner.hp -= 20;
                const faceId = enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face';
                window.showVFX(faceId, 'slash'); window.showVFX(faceId, 'damage', 20);
                window.showBattleMessage(`💣 【誘爆】\n敵リーダーに20ダメージ！`, false, 2000, !isPlayerOwner, true);
                
                // 画面揺れ演出
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            }
            if (card.ability === "burst_spores") {
                owner.field.forEach((ac, idx) => {
                    if(!ac.isDead) { 
                        ac.hp += 30; ac.damage += 10; 
                        window.showVFX(`${owner === window.TCG_BATTLE.player ? 'p' : 'c'}-card-${idx}`, 'heal', '強化'); 
                    }
                });
                window.showBattleMessage(`🍄 【破裂胞子】\n味方全体が回復＆攻撃力UP！`);
            }
            if (card.ability === "nova_burst" && enemyOwner) {
                let dmg = card.maxHp || 100;
                enemyOwner.field.forEach((ec, idx) => {
                    if(!ec.isDead) { 
                        ec.hp -= dmg; 
                        window.showVFX(`${enemyOwner === window.TCG_BATTLE.cpu ? 'c' : 'p'}-card-${idx}`, 'damage', dmg); 
                    }
                });
                window.showBattleMessage(`💥 【超新星爆発】\n敵全体に ${dmg} ダメージ！`);
            }
            if (card.ability === "mass_bounce" && enemyOwner) {
                enemyOwner.field.forEach((ec) => {
                    if(!ec.isDead) { ec.isDead = true; enemyOwner.deck.push(ec); }
                });
                window.showBattleMessage(`🌪️ 【全バウンス】\n敵全体を山札に吹き飛ばした！`);
            }
        }
    }
};

// ==========================================
// 3. 引退したAIからカードを生成する関数 (究極バランス版)
// ==========================================
window.generateCardFromAI = function(aiPet) {
    let rawRace = aiPet.currentSkin || aiPet.baseType || 'robot';
    const isEvolved = rawRace.includes('_type'); // 進化種族かどうかの判定

    const totalStats = (aiPet.stats.power || 0) + (aiPet.stats.intel || 0) + (aiPet.stats.beauty || 0);
    
    // インフレを防ぐ平方根ボーナス計算（例: ステータス100なら10、10000なら100）
    let rawHpBonus = Math.floor(Math.sqrt(aiPet.stats.power || 0));
    let rawDmgBonus = Math.floor(Math.sqrt(aiPet.stats.intel || 0));

    let masterId, masterData, finalCost, finalHp, finalDmg;

    if (isEvolved) {
        // ==========================================
        // 【進化種族：ハクスラ（自動スケーリング）方式】
        // ==========================================
        let candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === rawRace);
        if (candidateKeys.length === 0) candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === rawRace.split('_')[0]);
        
        masterId = candidateKeys[0]; // 進化種は1種類固定
        masterData = window.TCG_MASTER[masterId];
        if (!masterData) return null;

        // ステータスに応じてコストが 1〜8 に変動する（約150ステータスごとにコストが1上がる）
        finalCost = Math.max(1, Math.min(8, Math.floor(totalStats / 150) + 1));
        
        // 本来のコストとの倍率を計算（例：本来コスト4がコスト8になったら2倍、コスト2になったら半分）
        let scale = finalCost / Math.max(1, masterData.baseCost);
        
        // 基礎ステータスをコストに合わせて伸縮
        let scaledBaseHp = Math.floor(masterData.baseHp * scale);
        let scaledBaseDmg = masterData.baseDmg > 0 ? Math.floor(masterData.baseDmg * scale) : 0;

        // 変動後のコストに応じた「キャパシティ（器）」を計算
        const maxBonusLimit = Math.max(10, finalCost * 15);
        
        // スケール後の基礎値 ＋ 育成ボーナス（上限付き）
        finalHp = scaledBaseHp + Math.min(maxBonusLimit, rawHpBonus);
        finalDmg = scaledBaseDmg + Math.min(maxBonusLimit, rawDmgBonus);

    } else {
        // ==========================================
        // 【基本種族：ハイブリッド（多様なプール）方式】
        // ==========================================
        let candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === rawRace);
        if (candidateKeys.length === 0) candidateKeys = Object.keys(window.TCG_MASTER).filter(key => window.TCG_MASTER[key].type === 'robot');

        // 強いAIほど高いコスト「まで」落ちるようになる（コスト1〜3の低コストも必ず混ざる）
        const targetCost = Math.max(1, Math.min(8, Math.floor(totalStats / 100) + 1)); 
        let validKeys = candidateKeys.filter(k => window.TCG_MASTER[k].baseCost <= Math.max(targetCost, 3)); 
        if (validKeys.length === 0) validKeys = candidateKeys; 

        masterId = validKeys[Math.floor(Math.random() * validKeys.length)];
        masterData = window.TCG_MASTER[masterId];
        if (!masterData) return null;

        finalCost = masterData.baseCost;
        
        // 本来のコストに応じた「キャパシティ（器）」を計算
        const maxBonusLimit = Math.max(10, finalCost * 15); 
        finalHp = masterData.baseHp + Math.min(maxBonusLimit, rawHpBonus);
        finalDmg = masterData.baseDmg > 0 ? masterData.baseDmg + Math.min(maxBonusLimit, rawDmgBonus) : 0;
    }

    const newCard = {
        uid: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000), 
        masterId: masterId, name: masterData.name, type: masterData.type,
        cost: finalCost, 
        hp: finalHp, maxHp: finalHp,
        skillName: masterData.skillName, skillCost: masterData.skillCost,
        damage: finalDmg,
        ability: masterData.ability, image: masterData.image, imageIndex: masterData.imageIndex,
        sx: masterData.sx, sy: masterData.sy, sw: masterData.sw, sh: masterData.sh,
        scaleX: masterData.scaleX, scaleY: masterData.scaleY, evolvesFrom: masterData.evolvesFrom
    };

    window.TCG.myCollection.push(newCard);
    window.saveTCGData();

    const isUnlocked = window.TCG.myCollection.length >= 60;
    const msg = isUnlocked ? "🎉 AIの生涯がカードに刻まれた！ 🎉" : "✨ AIとの思い出がアルバムに追加された！ ✨";
    window.showCardUnlockPopup(newCard, msg);

    // ボタンの表示（偽装）を更新
    if (typeof window.updateTcgButtonAppearance === 'function') window.updateTcgButtonAppearance();
    return newCard;
};

// ==========================================
// 📖 TCGカード解放トリガー辞書
// ==========================================
window.TCG_UNLOCK_CONDITIONS = {
    // 拾得アイテムのトリガー
    'iron': 'support_0',      // 鉄鉱石 → 鉄鉱石の塊
    'wood': 'support_3',      // 木材 → 建築用の木材
    'herb': 'support_6',      // 薬草 → 三種の霊薬
    'book': 'support_9',      // 魔導書 → 古の魔導書
    'crystal': 'support_12',  // 魔結晶 → 輝くクリスタル

    // アクション（行動）のトリガー
    'action_farm': 'support_11',  // 収穫する → 豊穣の畑仕事
    'action_fish': 'support_2',   // 釣りをする → みんなで大漁
    'action_craft': 'support_5',  // 鍛冶をする → 武器の鍛造
    'action_cave': 'support_8',   // 洞窟を探検 → 未知の洞窟探検
    'action_camp': 'support_14',  // キャンプする → キャンプファイヤー

    // フィールド（場所）のトリガー
    'visit_forest': 'support_1',  // 森へ行く → 静寂の森の小屋
    'visit_castle': 'support_4',  // 城へ行く → 栄華を極めた城
    'visit_casino': 'support_7',  // カジノへ行く → 廃れたカジノ
    'visit_cave': 'support_10',   // 洞窟へ行く → ドクロの洞窟
    'visit_mine': 'support_13'    // 鉱脈へ行く → 結晶の鉱脈
};

// ==========================================
// 🚀 汎用アンロック呼び出し関数
// ==========================================
window.triggerTCGUnlock = function(triggerKey, generation) {
    if (typeof window.unlockSupportCard !== 'function') return;
    
    // 辞書に登録されているトリガーか確認
    const targetCardId = window.TCG_UNLOCK_CONDITIONS[triggerKey];
    
    // 辞書になければ（ただの石ころやゴミなどの無関係な行動なら）完全にスルー！
    if (!targetCardId) return; 
    
    // 前回追加した「世代スケーリング付きの解放関数」を呼び出す
    window.unlockSupportCard(targetCardId, generation || 1);
};

// ==========================================
// 4. HTML描画機能（偽装対応・アビリティ完全保持版・超軽量化パッチ）
// ==========================================
window.renderCardHTML = function(card) {
    if (typeof window.TCG_MASTER !== 'undefined') {
        let masterData = null;
        if (card.masterId && window.TCG_MASTER[card.masterId]) {
            masterData = window.TCG_MASTER[card.masterId];
        }
        if (!masterData || masterData.sx === undefined) {
            const safeName = (card.name || "").trim();
            const adjustedKey = Object.keys(window.TCG_MASTER).find(k => {
                const target = window.TCG_MASTER[k];
                return target && target.name && target.name.trim() === safeName && target.sx !== undefined;
            });

            if (adjustedKey) {
                masterData = window.TCG_MASTER[adjustedKey]; 
            } else {
                const fallbackKey = Object.keys(window.TCG_MASTER).find(k => {
                    const target = window.TCG_MASTER[k];
                    return target && target.name && target.name.trim() === safeName;
                });
                if (fallbackKey) masterData = window.TCG_MASTER[fallbackKey];
            }
        }

        if (masterData) {
            if (masterData.sx !== undefined) card.sx = masterData.sx;
            if (masterData.sy !== undefined) card.sy = masterData.sy;
            if (masterData.sw !== undefined) card.sw = masterData.sw;
            if (masterData.sh !== undefined) card.sh = masterData.sh;
            if (masterData.scaleX !== undefined) card.scaleX = masterData.scaleX;
            if (masterData.scaleY !== undefined) card.scaleY = masterData.scaleY;
            if (masterData.image) card.image = masterData.image; 
        }
    }

    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;

    let abilityText = card.abilityTextOverride || "";
    if (!abilityText) {
        const texts = {
            "taunt": "【かばう】(相手の攻撃を代わりに受ける)",
            "stealth": "【潜伏】(攻撃するまでターゲットにされない)",
            "heal_self": "【修復】(自分のHPを小回復する)",
            "draw_card": "【ドロー】(山札からカードを引く)",
            "flight": "【飛行】(かばうを無視して攻撃できる)",
            "mana_ramp": "【成長】(自分の最大マナを+1する)",
            "haste": "【速攻】(場に出たターンにすぐ攻撃できる)",
            "trample": "【貫通】(敵を倒した時、超過ダメージをリーダーに与える)",
            "death_bomb": "【誘爆】(破壊された時、相手リーダーに20ダメージ)",
            "pierce_recoil": "【暴走回路】(かばう無視・攻撃時自身にダメ)",
            "aoe_heal_play": "【全体回復】(登場時、味方全員を回復)",
            "start_draw": "【超演算】(自ターン開始時、1枚ドロー)",
            "aura_action_cost": "【万能魔法】(場にいる間、アクションコスト-1)",
            "heavy_armor": "【重装甲】(受けるダメージを常に-10)",
            "snipe_play": "【殲滅】(登場時、ランダムな敵にダメージ)",
            "end_heal": "【悠久の風化】(ターン終了時、自身のHP回復)",
            "god_strike": "【神の一撃】(貫通・攻撃時敵1体即死)",
            "cyber_miracle": "【電脳の奇跡】(ターン終了時、味方全回復)",
            "dimension_hack": "【超次元ハック】(登場時、敵手札破壊＆ドロー)",
            "all_zero_cost": "【森羅万象】(場にいる間、アクションのコスト0)",
            "absolute_field": "【絶対領域】(受けるあらゆるダメージを1にする)",
            "crimson_end": "【終末の紅蓮】(登場時、敵全体に50ダメ)",
            "star_breath": "【星の息吹】(ターン開始時マナ+2＆リーダー回復)",
            "perfect_predation": "【完全捕食】(登場時、敵1体を破壊し吸収)",
            "nightmare_rule": "【悪夢の君臨】(登場時、全敵のHPを強制半減)",
            "star_hope": "【希望の星】(登場時、味方全回復＆かばう付与)",
            "divine_grace": "【神の恩寵】(ターン終了時、破壊された味方蘇生)",
            "heaven_punishment": "【天罰】(登場時、全敵モンスターに50ダメージ)",
            "event_horizon": "【事象の地平】(ターン終了時、敵1体を山札に戻す)",
            "truth_overwrite": "【真理の書換】(登場時、3枚ドロー＆最大マナ+3)",
            "heaven_judgement": "【天の裁き】(ターン開始時、敵全体に20ダメ)",
            "absolute_fortress": "【絶対要塞】(受けるダメージを常に-20する)",
            "dimension_drill": "【次元穿孔】(貫通・リーダーにも同じダメを与える)",
            "super_gravity": "【超重力】(登場時、自身以外の全モンスターに100ダメ)",
            "eternal_rebirth": "【悠久の再生】(破壊された時、一度だけHP満タンで復活)",
            "burn_field": "【焦土化】(ターン終了時、敵全体に少ダメージ)",
            "cataclysm": "【天変地異】(ターン終了時、敵全体に貫通大ダメージ)",
            "spell_echo": "【魔法反響】(登場・スキル使用時、ダメージ増幅)",
            "mana_refund": "【魔力還元】(登場・スキル使用時、マナが回復)",
            "charm_enemy": "【魅惑】(登場時、敵1体を確率で「魅了」する)",
            "mass_charm": "【全体魅了】(登場時、敵全体を確率で「魅了」する)",
            "curse_death": "【道連れ】(破壊された時、敵リーダーに大ダメージ)",
            "soul_drain": "【魂吸収】(攻撃で与えたダメージの半分を回復)",
            "soul_reap": "【魂刈り】(攻撃時、相手の最大HPも減少させる)",
            "thorns": "【茨の鎧】(攻撃を受けた時、相手にも反射ダメージ)",
            "void_counter": "【虚無】(一度だけダメージを無効化し倍返しする)",
            "devour": "【捕食】(敵を倒した時、自身のHPと攻撃力UP)",
            "apex_predator": "【頂点捕食】(敵を倒した時、ステータスが倍増する)",
            "burst_spores": "【破裂胞子】(破壊された時、味方全体を回復＆強化)",
            "absolute_sanctuary": "【絶対聖域】(ターン終了時、味方全体を回復する)",
            "mana_sovereign": "【魔力の支配者】(場にいる間、味方の全コスト半減)",
            "impregnable_armor": "【難攻不落】(30以下のダメージを完全に無効化する)",
            "pure_aegis": "【純真の盾】(かばう＋あらゆる状態異常を無効化)",
            "infinite_gear": "【無限歯車】(ターン開始時、手札が5枚になるようドロー)",
            "doomsday_detonation": "【終末起爆】(登場時、盤面全てを消し飛ばす)",
            "rebirth": "【輪廻転生】(破壊された時、一度だけ復活し敵を焼く)",
            "absolute_evasion": "【絶対回避】(敵からの攻撃を高い確率で無効化する)",
            "piercing_juggernaut": "【暴走貫通】(攻撃するたび火力が上がり、かばう無視)",
            "fossilize": "【化石化】(登場時、敵1体を確率で「スタン」させる)",
            "mass_bounce": "【全バウンス】(破壊された時、全敵を山札に戻す)",
            "nova_burst": "【超新星爆発】(破壊された時、敵全体に最大HP分ダメ)",
            "time_manipulation": "【時空操作】(登場時、行動済みの味方を未行動にする)",
            "raise_dead": "【死霊復活】(ターン終了時、破壊された味方を半分の力で蘇生)"
        };
        abilityText = texts[card.ability] || "";
    }

    // ==========================================
    // ★最強の安全装置：存在しない画像は最初から読み込まず、ダミーのグラデーションにする！
    // ==========================================
    let imgPath = card.image;
    // imgPathが未定義、あるいは "characters.png" (古くて削除された画像名) の場合は null にして通信を防ぐ
    if (!imgPath || imgPath === 'characters.png') {
        imgPath = null;
    } else if (typeof imageSources !== 'undefined' && imageSources[imgPath]) {
        imgPath = imageSources[imgPath]; 
    }

    const flavorText = (card.type === 'item' || card.type === 'action' || card.type === 'field')
        ? "冒険の途中で見つけた、かけがえのない記憶の欠片。" 
        : "AIがこれまでの人生で培ってきた、確かな成長の証。";

    let displayCost = card.cost;
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        let owner = window.TCG_BATTLE.player.hand.includes(card) ? window.TCG_BATTLE.player : null;
        if (!owner && window.TCG_BATTLE.cpu.hand.includes(card)) owner = window.TCG_BATTLE.cpu;
        if (owner) displayCost = window.getActualCost(owner, card);
    }
    const costColor = displayCost < card.cost ? "#4CAF50" : "#FFD700";
    const typeName = window.getCardTypeName(card.type);

    let html = `
    <div class="tcg-card" style="width: 180px; height: 260px; background-color: #222; border: 4px solid #555; border-radius: 12px; position: relative; font-family: sans-serif; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; user-select: none;">`;

    if (card.status === 'stunned' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:5%; background:#795548; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(-15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">🪨 化石化</div>`;
    }
    if (card.status === 'charmed' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:15%; background:#E91E63; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">💕 魅了</div>`;
    }

    if (isUnlocked) {
        html += `<div style="position: absolute; top: 6px; left: 6px; width: 28px; height: 28px; background: ${costColor}; color: #000; border-radius: 50%; font-weight: bold; font-size: 18px; display: flex; justify-content: center; align-items: center; border: 2px solid #FFF; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${displayCost}</div>`;
    }

    // ★画像パス (imgPath) が null の場合は、ダミーのCSSグラデーションを描画して通信をさせない！
    if (card.sx !== undefined) {
        const scX = card.scaleX !== undefined ? card.scaleX : 1.0;
        const scY = card.scaleY !== undefined ? card.scaleY : 1.0;
        const sw = card.sw || 50; const sh = card.sh || 50;
        const sx = card.sx || 0; const sy = card.sy || 0;

        let imgStyle = imgPath 
            ? `background-image: url('${imgPath}'); background-position: ${-sx}px ${-sy}px; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111);`; // ★エラー回避用のダミー背景

        html += `
        <div style="width: 100%; height: 120px; background-color: #1a1a1a; overflow: hidden; display: flex; justify-content: center; align-items: center; position: relative; border-bottom: 3px solid #444;">
            <div style="width: ${sw}px; height: ${sh}px; ${imgStyle} transform: scale(${scX}, ${scY}); transform-origin: center center; flex-shrink: 0;">
                ${!imgPath ? '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;">NO IMAGE</div>' : ''}
            </div>
        </div>`;
    } else {
        const col = (card.imageIndex || 0) % 3; const row = Math.floor((card.imageIndex || 0) / 3);
        const finalPosX = (col * 50) + (card.offsetX || 0); const finalPosY = (row * 25) + (card.offsetY || 0); 
        const zoomX = card.zoomX || 300; const zoomY = card.zoomY || 510;

        let imgStyle = imgPath
            ? `background-image: url('${imgPath}'); background-size: ${zoomX}% ${zoomY}%; background-position: ${finalPosX}% ${finalPosY}%; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111); display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;`; // ★エラー回避用のダミー背景

        html += `<div style="width: 100%; height: 120px; ${imgStyle} border-bottom: 3px solid #444;">${!imgPath ? 'NO IMAGE' : ''}</div>`;
    }

    html += `
        <div style="padding: 4px 8px; font-weight: bold; font-size: 14px; background: linear-gradient(to right, #444, #222); border-bottom: 2px solid #111; text-shadow: 1px 1px 2px #000; display: flex; justify-content: space-between; align-items: center;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${card.name}</span>
            ${isUnlocked ? `<span style="font-size: 11px; background: rgba(0,0,0,0.6); color: #00BCD4; padding: 2px 5px; border-radius: 4px; border: 1px solid #00BCD4; margin-left: 4px; white-space: nowrap;">${typeName}</span>` : ''}
        </div>`;

    if (isUnlocked) {
        html += `
        <div style="flex: 1; padding: 6px; padding-bottom: 30px; font-size: 11px; color: #ddd; background: #2a2a2a; display: flex; flex-direction: column; gap: 4px;">
            ${abilityText ? `<div style="color: #FF9800; font-weight: bold; font-size: 10px;">${abilityText}</div>` : ''}
            <div style="margin-top: auto; padding-top: 4px; border-top: 1px solid #444;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div style="display:flex; flex-direction:column; gap:3px;">
                        <span style="display:inline-block; background:#00BCD4; color:#fff; border-radius:4px; padding:2px 4px; font-size:10px; width:fit-content;">コスト ${card.skillCost}</span>
                        <span style="font-weight:bold; font-size:12px; color:#fff;">${card.skillName}</span>
                    </div>
                    ${card.damage > 0 ? `<div style="color:#ff5252; font-weight:bold; font-size:13px; white-space:nowrap;">${card.damage} ダメージ</div>` : ''}
                </div>
            </div>
        </div>
        <div style="position: absolute; bottom: -4px; right: -4px; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 8px 0 0 0; font-weight: bold; font-size: 16px; border: 2px solid #333; border-right: none; border-bottom: none; box-shadow: -2px -2px 4px rgba(0,0,0,0.3); z-index: 2;">HP ${card.hp}</div>`;
    } else {
        html += `<div style="flex: 1; padding: 15px 10px; font-size: 12px; line-height: 1.6; color: #bbb; background: #2a2a2a; text-align: center; display: flex; align-items: center; justify-content: center;"><span style="font-style: italic;">「${flavorText}」</span></div>`;
    }
    html += `</div>`;
    return html;
};

// ==========================================
// 5. UIとポップアップ関連 (偽装対応)
// ==========================================
window.showCardUnlockPopup = function(card, titleText = "カードを獲得しました！") {
    let popup = document.getElementById('tcg-unlock-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'tcg-unlock-popup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 100000;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.5s ease; pointer-events: none;
        `;
        document.body.appendChild(popup);
    }
    
    // ★ 偽装処理: ボタンのテキストを変える
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    const btnText = isUnlocked ? "コレクションに収納する" : "アルバムに綴じる";

    popup.innerHTML = `
        <h2 style="color: #FFD700; text-shadow: 0 0 15px #FF9800; font-size: 28px; font-weight: bold; margin: 0 0 80px 0; z-index: 10; text-align: center;">${titleText}</h2>
        <div style="transform: scale(1.5); box-shadow: 0 0 40px rgba(255,215,0,0.6); border-radius: 12px; margin-bottom: 90px; z-index: 5;">${window.renderCardHTML(card)}</div>
        <button onclick="document.getElementById('tcg-unlock-popup').style.opacity = '0'; setTimeout(()=>document.getElementById('tcg-unlock-popup').style.pointerEvents = 'none', 500);" 
            style="padding: 15px 40px; font-size: 20px; font-weight: bold; background: #FF9800; color: white; border: 3px solid #FFF; border-radius: 12px; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,0.6); z-index: 10; transition: transform 0.1s;"
            onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            ${btnText}
        </button>
    `;
    popup.style.pointerEvents = 'auto';
    setTimeout(() => popup.style.opacity = '1', 50);
};

window.openCardBinder = function() {
    let binder = document.getElementById('tcg-binder-ui');
    if (!binder) {
        binder = document.createElement('div');
        binder.id = 'tcg-binder-ui';
        binder.style.cssText = `
            position: fixed; top: 5%; left: 5%; width: 90%; height: 90%;
            background: #1a1a1a; border: 4px solid #FF9800; border-radius: 16px;
            z-index: 9990; display: none; flex-direction: column; overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        `;
        document.body.appendChild(binder);
    }
    let gridHtml = '';
    if (window.TCG.myCollection.length === 0) {
        gridHtml = `<div style="color: #666; font-size: 20px; width: 100%; text-align: center; margin-top: 50px;">まだカードを持っていません。<br>AIを育成して引退させてみましょう。</div>`;
    } else {
        window.TCG.myCollection.forEach(card => {
            gridHtml += `<div style="margin: 10px; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.05) translateY(-5px)'" onmouseout="this.style.transform='scale(1) translateY(0)'">${window.renderCardHTML(card)}</div>`;
        });
    }
    binder.innerHTML = `
        <div style="background: #333; padding: 15px; border-bottom: 2px solid #555; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; color: #FFF;">📖 カードバインダー (所持数: ${window.TCG.myCollection.length} 枚)</h2>
            <button onclick="document.getElementById('tcg-binder-ui').style.display = 'none';" style="background: #ff5252; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">閉じる ✖</button>
        </div>
        <div style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-wrap: wrap; justify-content: flex-start; align-content: flex-start; background: #222;">${gridHtml}</div>
    `;
    binder.style.display = 'flex';
};

// ==========================================
// 6. デッキ編成システム
// ==========================================
window.TCG.editingDeck = [];

window.openDeckBuilder = function() {
    let builderUI = document.getElementById('tcg-deck-builder');
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    
    const uiTitle = isUnlocked ? "🛠️ デッキ編成" : "📖 思い出の整理";
    const uiCountUnit = isUnlocked ? "枚" : "個";
    const uiSaveBtn = isUnlocked ? "デッキを保存" : "アルバムを保存";
    const uiColArea = isUnlocked ? "🗃️ コレクション（タップでデッキに追加）" : "🗃️ 集めた思い出（タップでアルバムに配置）";
    const uiDeckArea = isUnlocked ? "🃏 デッキ（タップで外す）" : "📖 アルバムのページ（タップで外す）";
    
    // ★仕様変更：デッキ3枠の初期化と現在のデッキの読み込み
    window.TCG.currentDeckIndex = window.TCG.currentDeckIndex || 0;
    while(window.TCG.decks.length < 3) window.TCG.decks.push([]);
    window.TCG.editingDeck = [...window.TCG.decks[window.TCG.currentDeckIndex]];

    if (!builderUI) {
        builderUI = document.createElement('div');
        builderUI.id = 'tcg-deck-builder';
        builderUI.style.cssText = `
            position: fixed; top: 2%; left: 2%; width: 96%; height: 96%;
            background: #1a1a1a; border: 4px solid #4CAF50; border-radius: 12px;
            z-index: 10000; display: flex; flex-direction: column; overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8); font-family: sans-serif;
        `;
        builderUI.innerHTML = `
            <div style="background: #2E7D32; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1B5E20;">
                <div style="display:flex; flex-direction:column;">
                    <h2 id="db-title-text" style="margin: 0 0 5px 0; color: #FFF; font-size: 22px;">
                        ${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">
                        現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})
                        </span>
                    </h2>
                    ${isUnlocked ? `
                    <div style="display:flex; gap:5px;" id="deck-tabs-container">
                        <button onclick="window.switchDeckSlot(0)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===0 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===0 ? '#2E7D32' : '#FFF'};">デッキ1</button>
                        <button onclick="window.switchDeckSlot(1)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===1 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===1 ? '#2E7D32' : '#FFF'};">デッキ2</button>
                        <button onclick="window.switchDeckSlot(2)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===2 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===2 ? '#2E7D32' : '#FFF'};">デッキ3</button>
                        <button onclick="window.copyDeckSlot()" style="padding:5px 10px; border-radius:4px; font-size:11px; cursor:pointer; margin-left:10px; background:#444; color:#fff; border:1px solid #666;">📋 コピー</button>
                    </div>` : ''}
                </div>
                <div>
                    ${isUnlocked ? `<button id="db-auto-btn" onclick="window.autoBuildDeck()" style="background: #00BCD4; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px; transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">✨ おまかせ編成</button>` : ''}
                    <button id="db-save-btn" onclick="window.saveDeck()" style="background: #FF9800; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px;">${uiSaveBtn}</button>
                    <button onclick="window.closeDeckBuilder()" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">閉じる ✖</button>
                </div>
            </div>
            <div style="flex: 1; display: flex; overflow: hidden;">
                <div style="flex: 3; background: #222; display: flex; flex-direction: column; border-right: 4px solid #444;">
                    <div id="db-col-header" style="padding: 10px; background: #333; color: #aaa; text-align: center; font-weight: bold; border-bottom: 1px solid #111;">${uiColArea}</div>
                    <div style="padding: 10px; background: #2a2a2a; border-bottom: 2px solid #111; display: flex; gap: 10px;">
                        <input type="text" id="db-search-name" placeholder="🔍 ${isUnlocked ? 'カード名' : '思い出'}で検索..." oninput="window.refreshDeckBuilderView()" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px;">
                        
                        <select id="db-filter-type" onchange="window.refreshDeckBuilderView()" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px; cursor: pointer; display: ${isUnlocked ? 'block' : 'none'};">
                            <option value="all">🌟 すべてのカード</option>
                            <option value="evolution">✨ 進化モンスターのみ</option>
                            <option value="monster_basic">🟢 基本モンスターのみ</option>
                            <option value="action">⚡ アクションカード</option>
                            <option value="item">🎒 アイテムカード</option>
                            <option value="field">⛺ フィールドカード</option>
                            <option value="robot">🤖 ロボット種族</option>
                            <option value="dragon">🐉 ドラゴン種族</option>
                            <option value="magician">🧙 魔法使い種族</option>
                            <option value="ghost">👻 ゴースト種族</option>
                            <option value="seed">🌱 つぼみ種族</option>
                            <option value="spirit">🍃 精霊種族</option>
                            <option value="stone">🪨 ゴーレム種族</option>
                            <option value="machine">⚙️ ぜんまい種族</option>
                            <option value="bird">🐦 鳥種族</option>
                            <option value="beetle">🪲 虫種族</option>
                            <option value="balloon">🎈 風船種族</option>
                        </select>
                    </div>
                    <div id="db-collection-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
                </div>
                <div style="flex: 2; background: #111; display: flex; flex-direction: column;">
                    <div id="db-deck-header" style="padding: 10px; background: #000; color: #4CAF50; text-align: center; font-weight: bold; border-bottom: 2px solid #222;">${uiDeckArea}</div>
                    <div id="db-deck-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(builderUI);
    } else {
        const titleSpan = document.getElementById('db-title-text');
        if (titleSpan) titleSpan.innerHTML = `${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})</span>`;
        const saveBtn = document.getElementById('db-save-btn');
        if (saveBtn) saveBtn.innerText = uiSaveBtn;
        const colHeader = document.getElementById('db-col-header');
        if (colHeader) colHeader.innerText = uiColArea;
        const deckHeader = document.getElementById('db-deck-header');
        if (deckHeader) deckHeader.innerText = uiDeckArea;
        
        const searchInput = document.getElementById('db-search-name');
        if (searchInput) searchInput.placeholder = `🔍 ${isUnlocked ? 'カード名' : '思い出'}で検索...`;
        
        const filterSelect = document.getElementById('db-filter-type');
        if (filterSelect) { filterSelect.style.display = isUnlocked ? 'block' : 'none'; filterSelect.value = "all"; }
        const autoBtn = document.getElementById('db-auto-btn');
        if (autoBtn) autoBtn.style.display = isUnlocked ? 'block' : 'none';
    }

    builderUI.style.display = 'flex';
    window.refreshDeckBuilderView(); 
};

window.refreshDeckBuilderView = function() {
    const collectionArea = document.getElementById('db-collection-area');
    const deckArea = document.getElementById('db-deck-area');
    const countDisplay = document.getElementById('db-count');
    
    // 現在の検索＆フィルター・ソートの条件を取得
    const searchInput = document.getElementById('db-search-name');
    const searchName = searchInput ? searchInput.value.toLowerCase() : "";
    const filterRace = document.getElementById('db-filter-race') ? document.getElementById('db-filter-race').value : "all";
    const filterStage = document.getElementById('db-filter-stage') ? document.getElementById('db-filter-stage').value : "all";
    const sortType = document.getElementById('db-sort') ? document.getElementById('db-sort').value : "newest";

    let collectionHtml = '';
    let deckHtml = '';
    let deckCount = window.TCG.editingDeck.length;

    if (countDisplay) {
        countDisplay.innerText = deckCount;
        countDisplay.style.color = deckCount >= 60 ? "#4CAF50" : "#FFD700";
    }

    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    const emptyDeckText = isUnlocked ? "デッキは空です" : "アルバムのページは空です";

    // --- カードのフィルタリング＆ソート処理関数 ---
    const processCards = (cardArray, isDeckArea) => {
        // 1. フィルタリング
        let filtered = cardArray.filter(card => {
            let match = true;
            // 名前検索
            if (searchName && !card.name.toLowerCase().includes(searchName)) match = false;
            
            // 種族フィルター
            if (match && filterRace !== 'all') {
                if (filterRace === 'support') {
                    if (!['item', 'action', 'field'].includes(card.type)) match = false;
                } else {
                    if (!card.type.startsWith(filterRace)) match = false;
                }
            }
            
            // 階級・進化フィルター（サポートカードは階級フィルタから除外される）
            if (match && filterStage !== 'all') {
                let isSupport = ['item', 'action', 'field'].includes(card.type);
                if (isSupport) {
                    match = false; 
                } else {
                    let isStage1 = false, isStage2 = false, isBase = false;
                    if (card.evolvesFrom) {
                        const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === card.evolvesFrom);
                        const parentData = parentKey ? window.TCG_MASTER[parentKey] : null;
                        if (parentData && parentData.evolvesFrom) isStage2 = true;
                        else isStage1 = true;
                    } else {
                        isBase = true;
                    }
                    
                    if (filterStage === 'base' && !isBase) match = false;
                    if (filterStage === 'stage1' && !isStage1) match = false;
                    if (filterStage === 'stage2' && !isStage2) match = false;
                }
            }
            return match;
        });

        // 2. ソート
        filtered.sort((a, b) => {
            let aCost = a.cost || 0; let bCost = b.cost || 0;
            let aHp = a.hp || 0; let bHp = b.hp || 0;
            let aDmg = a.damage || 0; let bDmg = b.damage || 0;
            
            if (sortType === 'cost_asc') return aCost - bCost || bHp - aHp;
            if (sortType === 'cost_desc') return bCost - aCost || bHp - aHp;
            if (sortType === 'hp_desc') return bHp - aHp || bDmg - aDmg;
            if (sortType === 'dmg_desc') return bDmg - aDmg || bHp - aHp;
            
            // newest (デフォルト): 獲得日時（UIDのタイムスタンプ等）の新しい順
            let aTime = parseInt(a.uid.split('_')[1]) || 0;
            let bTime = parseInt(b.uid.split('_')[1]) || 0;
            return bTime - aTime;
        });
        
        return filtered;
    };

    // デッキ内のカード（ユーザーが分かりやすいよう、デッキエリアもソートを適用します）
    let deckCards = window.TCG.editingDeck.map(uid => window.TCG.myCollection.find(c => c.uid === uid)).filter(c=>c);
    deckCards = processCards(deckCards, true);

    // コレクションエリアのカード（デッキに入っているものは除く）
    let collectionCards = window.TCG.myCollection.filter(card => !window.TCG.editingDeck.includes(card.uid));
    collectionCards = processCards(collectionCards, false);

    // HTMLの生成
    deckCards.forEach(card => {
        deckHtml += `<div onclick="window.showDeckCardActionMenu('${card.uid}', true)" style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(0.7) translateY(-5px)'" onmouseout="this.style.transform='scale(0.65) translateY(0)'"><div style="pointer-events:none;">${window.renderCardHTML(card)}</div></div>`;
    });

    collectionCards.forEach(card => {
        collectionHtml += `<div onclick="window.showDeckCardActionMenu('${card.uid}', false)" style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(0.7) translateY(-5px)'" onmouseout="this.style.transform='scale(0.65) translateY(0)'"><div style="pointer-events:none;">${window.renderCardHTML(card)}</div></div>`;
    });

    if (collectionArea) collectionArea.innerHTML = collectionHtml || '<div style="color:#666; width:100%; text-align:center; padding-top: 20px;">条件に合うカードが見つかりません</div>';
    if (deckArea) deckArea.innerHTML = deckHtml || `<div style="color:#666; width:100%; text-align:center; padding-top: 20px;">${emptyDeckText}</div>`;
};

window.toggleCardInDeck = function(uid) {
    const index = window.TCG.editingDeck.indexOf(uid);
    if (index > -1) window.TCG.editingDeck.splice(index, 1);
    else window.TCG.editingDeck.push(uid); 
    window.refreshDeckBuilderView();
};

window.saveDeck = function() {
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    
    // ★追加：アラートの代わりに、画面中央にリッチなポップアップを出す関数
    const showMessage = (msg, isError = false) => {
        let popup = document.createElement('div');
        popup.innerHTML = msg;
        popup.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); background:${isError ? 'rgba(244,67,54,0.95)' : 'rgba(0,188,212,0.95)'}; color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 3s forwards;`;
        let container = document.getElementById('tcg-deck-builder');
        if (container) container.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
    };

    if (window.TCG.editingDeck.length < 60) {
        if(isUnlocked) showMessage(`⚠️ デッキは最低60枚必要です！<br><span style="font-size:16px;">（現在は ${window.TCG.editingDeck.length} 枚です）</span>`, true);
        else showMessage(`⚠️ アルバムを完成させるには、記憶が最低60個必要です！<br><span style="font-size:16px;">（現在は ${window.TCG.editingDeck.length} 個です）</span>`, true);
        return;
    }
    
    window.TCG.decks[window.TCG.currentDeckIndex || 0] = [...window.TCG.editingDeck]; 
    window.saveTCGData();
    
    // ★修正：保存しても外には出ず、ポップアップだけ出して編成を続けられるようにする
    if(isUnlocked) showMessage(`🎉 デッキ ${(window.TCG.currentDeckIndex || 0) + 1} を保存しました！`);
    else showMessage("🎉 思い出のアルバムが保存されました！");
};

// ★追加：明示的に「閉じる ✖」ボタンを押した時に、カジノロビーに戻るための関数
window.closeDeckBuilder = function() {
    document.getElementById('tcg-deck-builder').style.display = 'none';
    let lobby = document.getElementById('casino-lobby-ui');
    if (lobby) {
        lobby.style.display = 'flex'; // カジノロビーを再表示する
        // ★追加：ロビーに戻ったので、ロビーBGMを掛け直す
        if (window.audioManager) window.audioManager.playBGM('card_lobby');
    }
};

// ==========================================
// 7. バトルシステム本体
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.startBattle = function(enemyData = null) {
    if (!window.TCG.decks[0] || window.TCG.decks[0].length < 60) {
        alert("デッキが保存されていないか、60枚以上ありません！先にデッキ編成を完了してください。"); return;
    }

    // 初期化（マナは0からスタート、ターン開始時に1になる）
    window.TCG_BATTLE = {
        player: { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        cpu:    { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false,
        firstPlayer: 'player', isEnemyTurn: false, isAnimating: true, isAuto: false
    };
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    let battleUI = document.getElementById('tcg-battle-ui');
    if (!battleUI) {
        battleUI = document.createElement('div');
        battleUI.id = 'tcg-battle-ui';
        battleUI.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #2a2a2a; z-index: 20000; display: flex; flex-direction: column; 
            font-family: sans-serif; color: white; overflow: hidden;
        `;
        document.body.appendChild(battleUI);
    }

    if (!document.getElementById('tcg-scroll-styles')) {
        const style = document.createElement('style');
        style.id = 'tcg-scroll-styles';
        style.innerHTML = `
            .tcg-board-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.4) rgba(0,0,0,0.3); }
            .tcg-board-scroll::-webkit-scrollbar { height: 8px; }
            .tcg-board-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius: 4px; margin: 0 20px; }
            .tcg-board-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }
            .tcg-board-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.7); }
        `;
        document.head.appendChild(style);
    }

    p.deck = window.TCG.decks[0].map(uid => {
        const originalCard = window.TCG.myCollection.find(c => c.uid === uid);
        if (!originalCard) return null;
        let cardCopy = JSON.parse(JSON.stringify(originalCard));
        let master = window.TCG_MASTER[cardCopy.masterId];
        if (master) cardCopy.hp = Math.max(cardCopy.hp, master.baseHp);
        cardCopy.maxHp = cardCopy.hp; // ★ MAX HPの保存
        cardCopy.isDead = false; cardCopy.canAttack = false; cardCopy.isDefending = false; cardCopy.status = null;
        return cardCopy;
    }).filter(c => c !== null);
    window.shuffleArray(p.deck);

    if (enemyData && enemyData.deck) {
        cpu.deck = enemyData.deck.map((dCard, i) => {
            let master = window.TCG_MASTER[dCard.masterId];
            if(!master) return null;
            return {
                uid: 'ghost_' + i, masterId: dCard.masterId, name: dCard.name || master.name, type: master.type,
                cost: master.baseCost, hp: dCard.hp || master.baseHp, maxHp: dCard.hp || master.baseHp,
                skillName: master.skillName, skillCost: master.skillCost, damage: dCard.damage || master.baseDmg, 
                ability: master.ability, image: master.image, imageIndex: master.imageIndex,
                offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null,
                // ★バグ修正：オンラインの敵データにも「進化元」情報を引き継ぐ！
                evolvesFrom: master.evolvesFrom
            };
        }).filter(c => c !== null);
        if(cpu.deck.length < 60) { alert("敵のデッキデータが不完全です。通常のCPUと対戦します。"); enemyData = null; } 
        else { window.shuffleArray(cpu.deck); }
    } 

    if (!enemyData || !enemyData.deck) {
        const allMasterKeys = Object.keys(window.TCG_MASTER);
        for (let i = 0; i < Math.max(60, p.deck.length); i++) {
            let randomKey = allMasterKeys[Math.floor(Math.random() * allMasterKeys.length)];
            let master = window.TCG_MASTER[randomKey];
            cpu.deck.push({
                uid: 'cpu_' + i, masterId: randomKey, name: master.name, type: master.type,
                cost: master.baseCost, hp: master.baseHp, maxHp: master.baseHp, skillName: master.skillName,
                skillCost: master.skillCost, damage: master.baseDmg, ability: master.ability,
                image: master.image, imageIndex: master.imageIndex, offsetX: master.offsetX,
                offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null,
                // ★バグ修正：ランダムCPUのデータにも「進化元」情報を引き継ぐ！
                evolvesFrom: master.evolvesFrom
            });
        }
    }

    window.renderBattleBoard();

    let cpuNameLabel = document.getElementById('cpu-name-label');
    if (!cpuNameLabel) {
        cpuNameLabel = document.createElement('div');
        cpuNameLabel.id = 'cpu-name-label';
        cpuNameLabel.style.cssText = 'position:absolute; top:20px; right:30px; color:#FF5252; font-weight:bold; font-size:24px; text-shadow:0 0 10px #000; z-index:100;';
        battleUI.appendChild(cpuNameLabel);
    }
    cpuNameLabel.innerHTML = enemyData ? `VS ${enemyData.playerName}` : "VS 名もなきCPU";
    
    battleUI.style.display = 'flex';

    const blocker = document.createElement('div');
    blocker.id = 'tcg-battle-blocker';
    blocker.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; z-index:25000;`;
    document.body.appendChild(blocker);

    const splash = document.createElement('div');
    splash.id = 'tcg-battle-splash';
    splash.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 26000; display: flex;
        justify-content: center; align-items: center; color: white;
        font-size: 80px; font-weight: bold; font-style: italic; text-align:center; line-height:1.2;
        text-shadow: 0 0 30px #FF9800, 5px 5px 0 #000;
        opacity: 0; transform: scale(1.5); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    splash.innerHTML = enemyData ? `ONLINE BATTLE !!<br><span style="font-size:50px; color:#4fc3f7;">VS ${enemyData.playerName}</span>` : "BATTLE START !!";
    document.body.appendChild(splash);

    setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1)'; }, 50);

    setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.transform = 'scale(0.8)';
        setTimeout(() => {
            splash.remove();
            
            // 🪙 コイントス演出
            const isPlayerFirst = Math.random() < 0.5;
            window.TCG_BATTLE.firstPlayer = isPlayerFirst ? 'player' : 'cpu';
            window.TCG_BATTLE.isEnemyTurn = !isPlayerFirst;
            
            const coinUI = document.createElement('div');
            coinUI.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); z-index: 26000; display: flex; flex-direction: column;
                justify-content: center; align-items: center; color: white;
            `;
            coinUI.innerHTML = `
                <div style="font-size: 30px; font-weight: bold; margin-bottom: 30px; color:#00BCD4;">先攻・後攻を決定します...</div>
                <div class="coin-flip-anim" style="width: 150px; height: 150px; background: #FFD700; border-radius: 50%; border: 10px solid #FFA000; box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; font-size: 60px; font-weight: bold; color: #B28900; text-shadow: 1px 1px 0px #FFF;">
                    TCG
                </div>
            `;
            document.body.appendChild(coinUI);

            setTimeout(() => {
                coinUI.innerHTML = `
                    <div style="font-size: 50px; font-weight: bold; margin-bottom: 30px; color:${isPlayerFirst ? '#4CAF50' : '#ff5252'}; text-shadow: 0 0 20px ${isPlayerFirst ? '#4CAF50' : '#ff5252'};">
                        ${isPlayerFirst ? 'あなたの先攻！' : '敵の先攻！'}
                    </div>
                `;
                setTimeout(() => {
                    coinUI.style.opacity = '0';
                    coinUI.style.transition = '0.5s';
                    setTimeout(() => {
                        coinUI.remove();

                        // ★追加：バトル開始（通常）BGMを再生
                        if (window.audioManager) window.audioManager.playBGM('card_main');
                        
                        // 初期ドロー (5枚ずつ)
                        let drawCount = 0;
                        
                        // ★仕様変更：初手で必ずコスト1のカードを1枚確保する（手札事故防止マリガン）
                        let pOneManaIdx = p.deck.findIndex(c => window.getActualCost(p, c) === 1 || c.cost === 1);
                        if (pOneManaIdx !== -1) {
                            p.hand.push(p.deck.splice(pOneManaIdx, 1)[0]);
                            drawCount = 1; // すでに1枚引いた状態からスタート
                        }
                        
                        const drawTimer = setInterval(() => {
                            if (drawCount < 5) {
                                p.hand.push(p.deck.shift()); // 足りない分を追加ドロー
                                cpu.hand.push(cpu.deck.shift());
                                window.showBattleMessage(`シュッ！ (手札: ${drawCount + 1}枚)`, false, 250);
                                window.renderBattleBoard();
                                drawCount++;
                            } else {
                                clearInterval(drawTimer);
                                blocker.remove(); 
                                
                                // ターン開始！
                                if (isPlayerFirst) {
                                    window.startPlayerTurn(true);
                                } else {
                                    window.showTurnCutin("ENEMY TURN", "#ff5252", () => {
                                        window.executeCPUTurn(true);
                                    });
                                }
                            }
                        }, 350);
                    }, 500);
                }, 2000);
            }, 2500);
        }, 500);
    }, 1500); 
};

// ==========================================
// 8. VFX（視覚効果）＆ メッセージエンジン
// ==========================================
if (!document.getElementById('tcg-vfx-styles')) {
    const style = document.createElement('style');
    style.id = 'tcg-vfx-styles';
    style.innerHTML = `
        @keyframes slideUpFade { 0% { transform: translate(-50%, 0); opacity: 0; } 10% { transform: translate(-50%, -20px); opacity: 1; } 80% { transform: translate(-50%, -20px); opacity: 1; } 100% { transform: translate(-50%, -40px); opacity: 0; } }
        @keyframes floatDmg { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -120px) scale(1.5); opacity: 0; } }
        @keyframes slashAnim { 0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) rotate(20deg) scale(2.5); opacity: 0; } }
        @keyframes cardDestroy {
            0% { transform: scale(0.65) rotate(0deg); filter: brightness(1) grayscale(0%); opacity: 1; }
            20% { transform: scale(0.7) rotate(-5deg); filter: brightness(2) grayscale(0%); opacity: 1; }
            50% { transform: scale(0.6) rotate(10deg); filter: brightness(0.5) grayscale(100%); opacity: 0.8; }
            100% { transform: scale(0) rotate(-20deg); filter: brightness(0) grayscale(100%); opacity: 0; }
        }
        @keyframes screenHit {
            0% { transform: translate(0, 0); box-shadow: inset 0 0 0 rgba(255,0,0,0); }
            10% { transform: translate(-15px, 10px); box-shadow: inset 0 0 150px rgba(255,0,0,0.9); }
            20% { transform: translate(15px, -10px); }
            30% { transform: translate(-15px, -10px); }
            40% { transform: translate(15px, 10px); }
            50% { transform: translate(-10px, 5px); box-shadow: inset 0 0 80px rgba(255,0,0,0.6); }
            100% { transform: translate(0, 0); box-shadow: inset 0 0 0 rgba(255,0,0,0); }
        }
        .screen-shake-effect { animation: screenHit 0.5s ease-out; }
    `;
    document.head.appendChild(style);
}

window.showBattleMessage = function(text, isError = false, duration = 2000) {
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;
    const existingCount = document.querySelectorAll('.battle-msg').length;
    const topPos = 40 + (existingCount * 8);

    const msg = document.createElement('div');
    msg.className = 'battle-msg';
    msg.innerHTML = text;
    msg.style.cssText = `
        position: absolute; top: ${topPos}%; left: 50%;
        background: ${isError ? 'rgba(220, 20, 20, 0.95)' : 'rgba(20, 120, 255, 0.95)'};
        color: #fff; padding: 15px 40px; border-radius: 12px; border: 2px solid #fff;
        font-size: 22px; font-weight: bold; pointer-events: none; z-index: 100000;
        box-shadow: 0 10px 20px rgba(0,0,0,0.5); text-align: center; white-space: pre-wrap;
        animation: slideUpFade ${duration}ms forwards;
    `;
    ui.appendChild(msg);
    setTimeout(() => msg.remove(), duration);
};

window.showVFX = function(targetId, type, text = "") {
    const target = document.getElementById(targetId);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;
    
    const vfxNode = document.createElement('div');
    vfxNode.style.cssText = `
        position: absolute; left: ${rect.left + rect.width / 2}px; top: ${rect.top + rect.height / 2}px;
        pointer-events: none; z-index: 99999;
    `;

    if (type === 'damage' || type === 'heal') {
        const isHeal = type === 'heal';
        vfxNode.innerText = (isHeal && typeof text === 'number' ? "+" : (typeof text === 'number' ? "-" : "")) + text;
        vfxNode.style.color = isHeal ? '#4CAF50' : '#ff5252';
        vfxNode.style.fontWeight = '900';
        vfxNode.style.fontSize = '45px';
        vfxNode.style.textShadow = '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000';
        vfxNode.style.animation = 'floatDmg 1.2s ease-out forwards';
    } else if (type === 'slash') {
        vfxNode.innerText = text || "💥";
        vfxNode.style.fontSize = '80px';
        vfxNode.style.animation = 'slashAnim 0.3s ease-out forwards';
    }
    ui.appendChild(vfxNode);
    setTimeout(() => vfxNode.remove(), 1200);
};

// ==========================================
// 9. バトルの描画と進行ロジック
// ==========================================
window.showCardDetailModal = function(ownerType, index) {
    const card = ownerType === 'player' ? window.TCG_BATTLE.player.field[index] : window.TCG_BATTLE.cpu.field[index];
    if (!card) return;

    let modal = document.getElementById('tcg-card-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-card-detail-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 40000;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            cursor: pointer;
        `;
        modal.onclick = () => { modal.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="margin-bottom: 30px; color: #00BCD4; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">
            🔍 ${ownerType === 'player' ? '味方' : '敵'}のカード詳細
        </div>
        <div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(0, 188, 212, 0.6); border-radius: 12px; pointer-events: none;">
            ${window.renderCardHTML(card)}
        </div>
        <div style="margin-top: 100px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">
            画面のどこかをクリックして閉じる
        </div>
    `;
    modal.style.display = 'flex';
};

// ★新機能：バトル状況に応じたBGMの動的切り替え
window.updateTCGBattleBGM = function() {
    if (!window.TCG_BATTLE || !window.audioManager) return;
    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;
    
    // 勝敗が決まっている場合は何もしない（勝利・敗北BGMを優先するため）
    if (p.hp <= 0 || cpu.hp <= 0) return;

    let targetBGM = 'card_main';

    // チャンスとピンチが同時に条件を達成した場合は、チャンスを優先
    if (cpu.hp < 50) {
        targetBGM = 'card_chance';
    } else if (p.hp < 50) {
        targetBGM = 'card_pinch';
    }

    // 現在のBGMタイプと異なる場合のみ切り替えを実行
    if (window.audioManager.currentBGMType !== targetBGM) {
        window.audioManager.playBGM(targetBGM);
    }
};

window.renderBattleBoard = function() {
    const battleUI = document.getElementById('tcg-battle-ui');
    if(!battleUI) return;

    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;
    window.TCG_BATTLE.selectedAttackerIndex = window.TCG_BATTLE.selectedAttackerIndex ?? -1;
    window.TCG_BATTLE.selectedHandCardIndex = window.TCG_BATTLE.selectedHandCardIndex ?? -1;
    const isTargeting = window.TCG_BATTLE.selectedAttackerIndex !== -1;
    const isEvoMode = window.TCG_BATTLE.selectedHandCardIndex !== -1;

    // ==========================================
    // ★ 画面サイズに基づく動的スケール＆絶対座標計算ロジック
    // ==========================================
    // ブラウザの実際の描画領域を取得（スクロールバー等を除外した正確な幅）
    const w = document.documentElement.clientWidth || window.innerWidth;
    const h = document.documentElement.clientHeight || window.innerHeight;
    
    // UIの縦方向の割り当て (px)
    const headerH = 60;   // 敵ステータスバー
    const footerH = 180;  // 味方ステータス＆手札バー
    const boardH = h - headerH - footerH; // 残りが盤面
    const fieldH = boardH / 2; // 盤面を敵味方で半分こ
    
    // UIの横方向の割り当て (px)
    const leftPanelW = 240;  // 左のステータス
    const rightPanelW = 160; // 右のボタン群
    const handAreaW = w - leftPanelW - rightPanelW; // 中央の手札エリア
    const fieldAreaW = w; // 盤面は画面幅いっぱい

    // --- 自動スケールと座標を計算する関数 ---
    // N枚のカードを指定エリアに収めるための倍率(scale)と左端開始位置(startX)、間隔(stepW)を返す
    const calcLayout = (count, aW, aH, overlap, maxScale = 1.0) => {
        if (count === 0) return null;
        const bw = 180; const bh = 260; // カードのベースサイズ
        const availableW = aW - 20; // 左右の安全マージン
        
        // スケール1.0の時に必要な幅を計算
        const stepW_1 = bw * (1 - overlap);
        const totalW_1 = bw + stepW_1 * (count - 1);
        
        // 幅の限界、高さの限界、最大倍率 のうち一番厳しいものに合わせる
        let scale = Math.min(availableW / totalW_1, aH / bh, maxScale);
        
        // 実際のカード描画幅と開始X座標（中央揃え）
        const stepW = bw * scale * (1 - overlap);
        const totalW = (bw * scale) + stepW * (count - 1);
        const startX = (aW - totalW) / 2;
        
        return { scale, startX, stepW };
    };

    // 手札: 重なり40% (overlap=0.4)、最大スケール0.8
    const handL = calcLayout(p.hand.length, handAreaW, footerH - 20, 0.4, 0.8);
    // プレイヤー盤面: 重なり10% (overlap=0.1)、最大スケール0.7
    const pFieldL = calcLayout(p.field.length, fieldAreaW, fieldH - 20, 0.1, 0.7);
    // CPU盤面: 重なり10% (overlap=0.1)、最大スケール0.7
    const cFieldL = calcLayout(cpu.field.length, fieldAreaW, fieldH - 20, 0.1, 0.7);

    // ==========================================
    // 手札のHTML生成 (絶対配置)
    // ==========================================
    let handHtml = p.hand.map((card, index) => {
        let actualCost = window.getActualCost(p, card);
        const canPlay = p.currentMana >= actualCost;
        const isSelected = window.TCG_BATTLE.selectedHandCardIndex === index;
        const opacity = canPlay ? "1" : "0.5";
        
        let left = handL ? handL.startX + index * handL.stepW : 0;
        let scale = handL ? handL.scale : 0.6;
        let hoverScale = Math.min(1.0, scale * 1.3); // ホバー時は少し大きく
        
        let yOffset = isSelected ? "-30px" : "0px";
        let currentScale = isSelected ? hoverScale : scale;
        
        const filter = isSelected ? "drop-shadow(0 0 20px #E91E63)" : "none";
        const zIndex = isSelected ? 150 : index;
        
        return `
        <div class="tcg-card-wrap" style="left: ${left}px; bottom: 10px; transform: scale(${currentScale}) translateY(${yOffset}); transform-origin: bottom center; cursor: ${canPlay && !isTargeting ? 'pointer' : 'not-allowed'}; z-index: ${zIndex}; opacity: ${opacity}; filter: ${filter}; width: 180px; height: 260px;"
             onmouseover="if(${canPlay} && !${isTargeting} && !${isSelected}) { this.style.transform='scale(${hoverScale}) translateY(-20px)'; }"
             onmouseout="if(${canPlay} && !${isTargeting} && !${isSelected}) { this.style.transform='scale(${scale}) translateY(0)'; }"
             onclick="if(!${isTargeting}) window.playCard(${index})">
            ${window.renderCardHTML(card)}
        </div>`;
    }).join('');

    // ==========================================
    // プレイヤーフィールドのHTML生成 (絶対配置)
    // ==========================================
    let fieldHtml = p.field.map((card, index) => {
        const isReady = card.canAttack && card.status !== 'stunned';
        // ★修正：相手ターン中は、味方カードは「自分が攻撃で選ばれている」と勘違いしないようにする
        const isAttackerSelected = (!window.TCG_BATTLE.isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex === index);
        let isEvoTarget = false;
        if (isEvoMode) {
            const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
            isEvoTarget = window.checkCanEvolve(card, evoCard); // ★新しい判定に変更
        }

        let filter = "grayscale(50%) opacity(70%)";
        let cursor = "not-allowed";
        
        if (isAttackerSelected) {
            filter = "drop-shadow(0 0 20px #FFD700)"; cursor = "pointer";
        } else if (isEvoMode) {
            if (isEvoTarget) { filter = "drop-shadow(0 0 20px #E91E63) brightness(1.2)"; cursor = "pointer"; }
            else { filter = "grayscale(80%) opacity(40%)"; }
        } else if (isReady) {
            filter = "drop-shadow(0 0 10px #4CAF50)"; cursor = "pointer";
        } else if (!isReady && card.damage > 0 && !card.isDefending && card.ability !== "taunt" && p.currentMana >= 1 && card.status !== 'stunned') {
            cursor = "pointer";
        }

        // ★修正1：純真の盾も「守護」の変数としてまとめる
        const isDefending = card.isDefending || card.ability === "taunt" || card.ability === "pure_aegis";
        if (isDefending) filter = "drop-shadow(0 0 15px #2196F3)"; // ★ついでに、元からかばうを持っているカードも青く光るように修正！
        
        let left = pFieldL ? pFieldL.startX + index * pFieldL.stepW : 0;
        let scale = pFieldL ? pFieldL.scale : 0.65;
        let hoverScale = Math.min(1.0, scale * 1.15);
        
        let currentScale = scale;
        let yOffset = "0px";
        if (isAttackerSelected) { currentScale = hoverScale; yOffset = "-20px"; } 
        else if (isEvoTarget) { currentScale = hoverScale; yOffset = "-10px"; }

        const animStyle = card.isDead ? "animation: cardDestroy 0.6s ease-out forwards; pointer-events: none;" : "";

        return `
        <div id="p-card-${index}" class="tcg-card-wrap" style="position: absolute; left: ${left}px; bottom: 10px; transform: scale(${currentScale}) translateY(${yOffset}); transform-origin: bottom center; cursor: ${cursor}; filter: ${filter}; z-index: ${isAttackerSelected || isEvoTarget ? 100 : index}; ${animStyle}; width: 180px; height: 260px; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.4, 1);"
             onmouseover="if(this.style.cursor==='pointer') { this.style.transform='scale(${hoverScale}) translateY(-15px)'; this.style.zIndex=1000; }"
             onmouseout="this.style.transform='scale(${currentScale}) translateY(${yOffset})'; this.style.zIndex=${isAttackerSelected || isEvoTarget ? 100 : index}; "
             onclick="window.selectPlayerCard(${index})">
            ${window.renderCardHTML(card)}
            ${isDefending && !card.isDead ? `<div style="position:absolute; top:-20px; left:30%; background:#f44336; color:white; padding:2px 10px; border-radius:10px; font-weight:bold; border:2px solid #fff; z-index:10; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">🛡️ 守護</div>` : ''}
            ${!isReady && !isAttackerSelected && !card.isDead && !isEvoMode && !card.isDefending && card.ability !== 'taunt' && card.ability !== 'pure_aegis' && card.status !== 'stunned' ? `<div style="position:absolute; top:40%; left:10%; background:rgba(0,0,0,0.8); color:white; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:24px; transform:rotate(-15deg);">行動済み</div>` : ''}
            ${isEvoTarget ? `<div style="position:absolute; top:40%; left:15%; background:#E91E63; color:white; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:22px; transform:rotate(-10deg); box-shadow:0 0 10px #000;">進化可能!</div>` : ''}
            <div onclick="event.stopPropagation(); window.showCardDetailModal('player', ${index});" style="position:absolute; top:-10px; right:-10px; background:#222; color:#00BCD4; border:2px solid #00BCD4; border-radius:50%; width:36px; height:36px; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;" title="詳細を見る">🔍</div>
        </div>`;
    }).join('');
    if (p.field.length === 0) fieldHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color: #666; font-style: italic; font-size:18px;">(あなたの場)</div>`;

    // ==========================================
    // CPUフィールドのHTML生成 (絶対配置)
    // ==========================================
    let cpuFieldHtml = cpu.field.map((card, index) => {
        const isTaunt = card.ability === "taunt" || card.ability === "pure_aegis" || card.isDefending;
        const isStealth = card.ability === "stealth";
        const filter = isTargeting && !isStealth ? (isTaunt ? "drop-shadow(0 0 20px #FF5252)" : "drop-shadow(0 0 10px #FF9800)") : "none";
        const cursor = isTargeting && !isStealth ? "crosshair" : "default";
        const opacity = isStealth ? "0.6" : "1";
        
        let left = cFieldL ? cFieldL.startX + index * cFieldL.stepW : 0;
        let scale = cFieldL ? cFieldL.scale : 0.65;
        let hoverScale = Math.min(1.0, scale * 1.15);
        const animStyle = card.isDead ? "animation: cardDestroy 0.6s ease-out forwards; pointer-events: none;" : "";

        // CPUのカードは上からぶら下がるように配置する
        return `
        <div id="c-card-${index}" class="tcg-card-wrap" style="left: ${left}px; top: 10px; transform: scale(${scale}); transform-origin: top center; filter: ${filter}; opacity: ${opacity}; cursor: ${cursor}; z-index: ${index}; ${animStyle}; width: 180px; height: 260px;"
             onmouseover="if(${isTargeting} && !${isStealth} && !${card.isDead}){ this.style.transform='scale(${hoverScale}) translateY(15px)'; }"
             onmouseout="if(${isTargeting} && !${isStealth} && !${card.isDead}){ this.style.transform='scale(${scale}) translateY(0)'; }"
             onclick="if(${isTargeting}) window.executeAttack('card', ${index})">
            ${window.renderCardHTML(card)}
            ${isTaunt && !card.isDead ? `<div style="position:absolute; top:-20px; left:30%; background:#f44336; color:white; padding:2px 10px; border-radius:10px; font-weight:bold; border:2px solid #fff; z-index:10;">🛡️ 守護</div>` : ''}
            <div onclick="event.stopPropagation(); window.showCardDetailModal('cpu', ${index});" style="position:absolute; top:-10px; right:-10px; background:#222; color:#FF5252; border:2px solid #FF5252; border-radius:50%; width:36px; height:36px; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;" title="詳細を見る">🔍</div>
        </div>`;
    }).join('');
    if (cpu.field.length === 0) cpuFieldHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color: #666; font-style: italic; font-size:18px;">(CPUの場)</div>`;

    let autoBtnHtml = '';
    if (window.TCG_BATTLE) {
        const isAuto = window.TCG_BATTLE.isAuto;
        autoBtnHtml = `
            <button id="battle-auto-btn" onclick="window.TCG_BATTLE.isAuto = !window.TCG_BATTLE.isAuto; window.renderBattleBoard();" 
                style="padding: 10px; font-size: 15px; font-weight: bold; background: ${isAuto ? '#E91E63' : '#555'}; color: #fff; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; width: 100%; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.5); margin-top: auto;">
                ${isAuto ? '🤖 AUTO: ON' : '👤 AUTO: OFF'}
            </button>
        `;
    }

    // ==========================================
    // ★ 完璧な全画面レイアウト ＋ ログ＆墓地ボタン追加！
    // ==========================================
    // ▼▼▼ フィールドゾーンの描画HTML生成 ▼▼▼
    const createFieldZoneHtml = (isPlayer) => {
        let owner = isPlayer ? p : cpu;
        let fieldData = window.TCG_BATTLE.currentField;
        
        if (fieldData && fieldData.owner === owner) {
            let cardHtml = window.renderCardHTML(fieldData.card);
            return `
            <div style="position: absolute; left: 20px; display:flex; flex-direction:column; align-items:center; z-index: 40;" title="${fieldData.card.name}">
                <div style="transform: scale(0.55); transform-origin: top left; width: 99px; height: 143px; pointer-events:none; filter: drop-shadow(0 0 10px #4DB6AC); z-index:50;">
                    ${cardHtml}
                </div>
                <div style="color:#4DB6AC; font-size:12px; font-weight:bold; margin-top:-5px; background:#111; padding:2px 8px; border-radius:4px; border:1px solid #4DB6AC; z-index:51;">展開中</div>
            </div>`;
        } else {
            return `
            <div style="position: absolute; left: 20px; width: 100px; height: 140px; border: 2px dashed ${isPlayer ? '#00BCD4' : '#ff5252'}; border-radius: 8px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.3); z-index: 40;">
                <span style="color: ${isPlayer ? '#00BCD4' : '#ff5252'}; font-weight: bold; font-size: 12px; opacity: 0.5;">フィールド</span>
            </div>`;
        }
    };
    let playerFieldZoneHtml = createFieldZoneHtml(true);
    let cpuFieldZoneHtml = createFieldZoneHtml(false);

    battleUI.innerHTML = `
        <style>
            #tcg-battle-ui, #tcg-battle-ui * { box-sizing: border-box !important; }
            .tcg-card-wrap { position: absolute; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.4, 1); }
            .tcg-card-wrap:hover { z-index: 1000 !important; }
            @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0.6; transform: scale(1.05); } }
        </style>

        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #111; display: flex; flex-direction: column; overflow: hidden; z-index: 20000;">
            
            <div id="cpu-face" style="flex: 0 0 ${headerH}px; background: rgba(0,0,0,0.85); border-bottom: 2px solid #ff5252; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; cursor: ${isTargeting ? 'crosshair' : 'default'}; transition: background 0.2s;"
                 onmouseover="if(${isTargeting}){ this.style.background='rgba(255,0,0,0.4)' }"
                 onmouseout="if(${isTargeting}){ this.style.background='rgba(0,0,0,0.85)' }"
                 onclick="if(${isTargeting}) window.executeAttack('cpu', 0); else if(${isEvoMode}) { window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard(); }">
                <div style="font-size: 20px; font-weight: bold; color: white; display: flex; align-items: center; white-space: nowrap;">
                    🤖 敵CPU <span style="color:#ff5252; font-size:26px; margin-left: 15px; font-weight: 900; text-shadow: 1px 1px 0 #fff;">HP: ${cpu.hp}</span> 
                    ${isTargeting ? '<span style="color:#FF9800; font-size: 16px; margin-left: 15px; animation: pulse 1s infinite alternate;">🎯 (ここをタップで直接攻撃)</span>' : ''}
                </div>
                <div style="color: #FFD700; font-size: 16px; font-weight: bold; white-space: nowrap; display:flex; align-items:center; gap:10px;">
                    💎 マナ: ${cpu.currentMana} / ${cpu.maxMana} &nbsp;|&nbsp; 🎴 山札: ${cpu.deck.length} &nbsp;|&nbsp; 🖐 手札: ${cpu.hand.length}
                    <button onclick="window.showGraveyard('cpu')" style="font-size:12px; background:#444; color:#fff; border:1px solid #666; border-radius:4px; padding:2px 8px; cursor:pointer;">💀 墓地: ${cpu.graveyard.length}</button>
                </div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; background: #1a1a1a; position: relative;">
                <div style="flex: 1; position: relative; border-bottom: 2px dashed #444; background: rgba(255,0,0,0.05);">
                    ${cpuFieldZoneHtml}${cpuFieldHtml}
                </div>
                <div style="flex: 1; position: relative; background: rgba(0,188,212,0.05);"
                     onclick="if(${isTargeting} && event.target === this) { window.TCG_BATTLE.selectedAttackerIndex = -1; window.renderBattleBoard(); } else if (${isEvoMode} && event.target === this) { window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard(); }">
                    ${playerFieldZoneHtml}${fieldHtml}
                </div>
            </div>

            <div style="flex: 0 0 ${footerH}px; background: rgba(0,0,0,0.9); border-top: 3px solid #00BCD4; display: flex; position: relative; z-index: 10;">
                <div id="player-face" style="flex: 0 0 ${leftPanelW}px; padding: 15px; border-right: 2px solid #333; display: flex; flex-direction: column; justify-content: flex-start; background: rgba(0,188,212,0.1); gap: 6px;">
                    <div style="font-size: 18px; font-weight: bold; color: white;">🧑 あなた <span style="color:#aaa; font-size:14px;">(Turn ${window.TCG_BATTLE.turn})</span></div>
                    <div style="font-size: 34px; color: #4CAF50; font-weight: 900; text-shadow: 1px 1px 0 #fff; line-height: 1;">HP: ${p.hp}</div>
                    <div style="font-size: 16px; color: #00BCD4; font-weight: bold;">💎 マナ: ${p.currentMana} / ${p.maxMana}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size: 14px; color: #aaa;">🎴 山札: ${p.deck.length} 枚</div>
                        <button onclick="window.showGraveyard('player')" style="font-size:12px; background:#444; color:#fff; border:1px solid #666; border-radius:4px; padding:2px 8px; cursor:pointer;">💀 墓地: ${p.graveyard.length}</button>
                    </div>
                    <div style="display:flex; gap:5px; margin-top:auto;">
                        ${autoBtnHtml}
                        <button onclick="window.showBattleLogUI()" style="padding: 10px; font-size: 14px; font-weight:bold; background: #673AB7; color: #fff; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; flex:1; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">📜 ログ</button>
                    </div>
                </div>
                <div style="flex: 1; position: relative; overflow: visible;">
                    ${handHtml}
                </div>
                <div style="flex: 0 0 ${rightPanelW}px; padding: 15px; border-left: 2px solid #333; display: flex; flex-direction: column; justify-content: center; gap: 15px; background: rgba(255,152,0,0.05);">
                    <button onclick="window.endTurn()" style="padding: 20px 10px; font-size: 16px; font-weight: bold; background: #FF9800; color: #fff; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.4); transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">ターン終了 ➔</button>
                    <button onclick="if(confirm('本当にバトルから逃げますか？')) { document.getElementById('tcg-battle-ui').style.display='none'; }" style="padding: 12px 10px; font-size: 14px; background: #444; color: #ccc; border: 1px solid #666; border-radius: 8px; cursor: pointer; width: 100%; transition: background 0.2s;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#444'">逃げる</button>
                </div>
            </div>
        </div>
    `;
};

// ブラウザ幅が変わった時に自動で再計算・再描画するリスナー
if (!window._tcgResizeListenerAdded) {
    window.addEventListener('resize', () => {
        if (document.getElementById('tcg-battle-ui') && document.getElementById('tcg-battle-ui').style.display !== 'none') {
            window.renderBattleBoard();
        }
    });
    window._tcgResizeListenerAdded = true;
}

// ★ プレイ時効果（新アビリティ対応版）
// ★ プレイ時効果（新アビリティ＆全ログ記録対応版）
window.triggerPlayEffect = function(card, isPlayer) {
    const owner = isPlayer ? window.TCG_BATTLE.player : window.TCG_BATTLE.cpu;
    const enemy = isPlayer ? window.TCG_BATTLE.cpu : window.TCG_BATTLE.player;
    const ownerPrefix = isPlayer ? 'p' : 'c';
    const enemyPrefix = isPlayer ? 'c' : 'p';
    const targetFace = isPlayer ? 'player-face' : 'cpu-face';
    const enemyFace = isPlayer ? 'cpu-face' : 'player-face';

    // ★追加：第4引数の「!isPlayer」で、CPUの行動はポップアップなしの裏ログに書き込む
    if (card.ability === "draw_card") {
        if (owner.deck.length > 0) {
            owner.hand.push(owner.deck.shift());
            window.showBattleMessage(`🎴 【ドロー】\n${card.name} の効果で引きました！`, false, 2000, !isPlayer);
        }
    }
    // ▼▼▼ 風の加護 ▼▼▼
    else if (card.ability === "wind_blessing") {
        owner.field.forEach((c, idx) => {
            if (c !== card && !c.isDead) {
                c.damage += 10;
                window.showVFX(`${ownerPrefix}-card-${idx}`, 'heal', '攻撃UP');
            }
        });
        window.showBattleMessage(`🍃 【風の加護】\n他の味方全員の攻撃力が上がった！`, false, 2000, !isPlayer, true);
    }
    // ▼▼▼ 咆哮 ▼▼▼
    else if (card.ability === "roar") {
        const enemyObj = isPlayer ? window.TCG_BATTLE.cpu : window.TCG_BATTLE.player;
        const enemyPrefix = isPlayer ? 'c' : 'p';
        let hit = false;
        enemyObj.field.forEach((c, idx) => {
            if (!c.isDead) {
                c.hp -= 20;
                window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', 20);
                window.checkDeath(c, enemyObj, `${enemyPrefix}-card-${idx}`, owner);
                hit = true;
            }
        });
        if (hit) {
            window.showBattleMessage(`🐉 【咆哮】\n強烈な咆哮で敵全体に20ダメージ！`, false, 2000, !isPlayer, true);
            const ui = document.getElementById('tcg-battle-ui'); 
            if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
        }
    }
    // ▼▼▼ 忘却 ▼▼▼
    else if (card.ability === "discard_hand") {
        if (enemy.hand.length > 0) {
            enemy.hand.splice(Math.floor(Math.random() * enemy.hand.length), 1);
            window.showBattleMessage(`🧠 【忘却】\n相手の手札を1枚破壊した！`, false, 2000, !isPlayer);
            window.showVFX(enemyFace, 'slash', '忘却');
        }
    }
    else if (card.ability === "mana_ramp") {
        if (owner.maxMana < 10) { owner.maxMana++; window.showBattleMessage(`💎 【成長】\n最大マナが1増えました！`, false, 2000, !isPlayer); }
    } else if (card.ability === "heal_self") {
        owner.hp += 10; window.showVFX(targetFace, 'heal', 10);
        window.showBattleMessage(`💖 【修復】\nHPが10回復しました！`, false, 2000, !isPlayer);
    } else if (card.ability === "aoe_heal_play") {
        owner.field.forEach((c, idx) => { if(!c.isDead) { c.hp += 20; window.showVFX(`${ownerPrefix}-card-${idx}`, 'heal', 20); } });
        window.showBattleMessage(`✨ 【ファンサービス】\n味方全員のHPが20回復した！`, false, 2000, !isPlayer);
    } else if (card.ability === "snipe_play") {
        if (enemy.field.length > 0) {
            let rIdx = Math.floor(Math.random() * enemy.field.length); let tCard = enemy.field[rIdx];
            tCard.hp -= 30; window.showVFX(`${enemyPrefix}-card-${rIdx}`, 'slash'); window.showVFX(`${enemyPrefix}-card-${rIdx}`, 'damage', 30);
            window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${rIdx}`, owner);
            window.showBattleMessage(`💥 【殲滅モード】\n相手の ${tCard.name} に30ダメージ！`, false, 2000, !isPlayer);
        } else {
            enemy.hp -= 30; window.showVFX(enemyFace, 'slash'); window.showVFX(enemyFace, 'damage', 30);
            window.showBattleMessage(`💥 【殲滅モード】\n相手リーダーに30ダメージ！`, false, 2000, !isPlayer);
        }
    } else if (card.ability === "dimension_hack") {
        for(let i=0; i<2; i++) { if(enemy.hand.length > 0) enemy.hand.splice(Math.floor(Math.random()*enemy.hand.length), 1); }
        for(let i=0; i<2; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
        window.showBattleMessage(`🌌 【超次元ハッキング】\n相手の手札を2枚破壊し、2枚ドロー！`, false, 2000, !isPlayer);
    } else if (card.ability === "crimson_end" || card.ability === "heaven_punishment") {
        if(card.ability === "crimson_end") { enemy.hp -= 50; window.showVFX(enemyFace, 'slash'); }
        enemy.field.forEach((c, idx) => {
            c.hp -= 50; window.showVFX(`${enemyPrefix}-card-${idx}`, 'slash'); window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', 50);
            window.checkDeath(c, enemy, `${enemyPrefix}-card-${idx}`, owner);
        });
        window.showBattleMessage(`🌋 【${card.name}の圧倒的な力】\n敵陣全体に50ダメージ！`, false, 2000, !isPlayer);
    } else if (card.ability === "perfect_predation") {
        let targets = enemy.field.filter(c => !c.isDead);
        if(targets.length > 0) {
            let tCard = targets[Math.floor(Math.random() * targets.length)];
            let drain = tCard.hp; tCard.hp = 0; window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${enemy.field.indexOf(tCard)}`, owner);
            owner.hp += drain; window.showVFX(targetFace, 'heal', drain);
            window.showBattleMessage(`🌑 【完全捕食】\n敵を喰らい、${drain}回復！`, false, 2000, !isPlayer);
        }
    } else if (card.ability === "nightmare_rule") {
        enemy.field.forEach((c, idx) => {
            if(!c.isDead) { let half = Math.ceil(c.hp / 2); c.hp -= half; window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', half); }
        });
        window.showBattleMessage(`⛓️ 【悪夢の君臨】\nすべての敵モンスターのHPが半減！`, false, 2000, !isPlayer);
    } else if (card.ability === "star_hope") {
        owner.field.forEach((c, idx) => {
            if(!c.isDead) { c.hp += 100; c.ability = "taunt"; window.showVFX(`${ownerPrefix}-card-${idx}`, 'heal', '全回復'); }
        });
        window.showBattleMessage(`🌟 【希望の星】\n味方全回復＆全員が「かばう」状態に！`, false, 2000, !isPlayer);
    } else if (card.ability === "truth_overwrite") {
        for(let i=0; i<3; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
        owner.maxMana = Math.min(10, owner.maxMana + 3); owner.currentMana = Math.min(10, owner.currentMana + 3);
        window.showBattleMessage(`🌐 【真理の書き換え】\n3枚ドロー＆マナ最大値が3増えた！`, false, 2000, !isPlayer);
    } else if (card.ability === "time_manipulation") {
        owner.field.forEach(c => { c.canAttack = true; c.isDefending = false; });
        window.showBattleMessage(`⏳ 【時空操作】\nすべての味方が再び行動可能になった！`, false, 2000, !isPlayer);
    } else if (card.ability === "super_gravity") {
        owner.field.forEach((c, idx) => { if(c !== card && !c.isDead) { c.hp -= 100; window.showVFX(`${ownerPrefix}-card-${idx}`, 'damage', 100); window.checkDeath(c, owner, `${ownerPrefix}-card-${idx}`, enemy); } });
        enemy.field.forEach((c, idx) => { if(!c.isDead) { c.hp -= 100; window.showVFX(`${enemyPrefix}-card-${idx}`, 'damage', 100); window.checkDeath(c, enemy, `${enemyPrefix}-card-${idx}`, owner); } });
        window.showBattleMessage(`🌌 【超重力】\n自身以外のお互いの全モンスターに100ダメージ！`, false, 2000, !isPlayer);
    }

    if (card.ability === "mana_refund") {
        let refund = Math.max(1, Math.ceil(card.skillCost / 2));
        owner.currentMana = Math.min(owner.maxMana, owner.currentMana + refund);
        window.showBattleMessage(`🔄 【魔力還元】\nマナが ${refund} 回復した！`, false, 2000, !isPlayer);
    } else if (card.ability === "doomsday_detonation") {
        owner.field.forEach((c, idx) => { c.hp = 0; window.checkDeath(c, owner, `${ownerPrefix}-card-${idx}`, enemy); });
        enemy.field.forEach((c, idx) => { c.hp -= 200; window.checkDeath(c, enemy, `${enemyPrefix}-card-${idx}`, owner); });
        window.showBattleMessage(`☠️ 【終末兵器】\n盤面がすべて吹き飛んだ...！`, false, 2000, !isPlayer);
    } else if (card.ability === "spell_echo" && (card.type === 'action' || card.type === 'item')) {
        card.damage = Math.floor(card.damage * 1.5);
        window.showBattleMessage(`📣 【魔法反響】\nスペルの効果が増幅！`, false, 2000, !isPlayer);
    } else if (card.ability === "charm_enemy") {
        let valid = enemy.field.filter(c => !c.isDead && c.ability !== 'pure_aegis');
        if(valid.length > 0 && Math.random() < 0.6) {
            let t = valid[Math.floor(Math.random()*valid.length)];
            t.status = "charmed"; window.showVFX(`${enemyPrefix}-card-${enemy.field.indexOf(t)}`, 'heal', '魅了');
        }
    } else if (card.ability === "mass_charm") {
        enemy.field.forEach((c, idx) => { 
            if(!c.isDead && c.ability !== 'pure_aegis' && Math.random() < 0.5){ 
                c.status="charmed"; window.showVFX(`${enemyPrefix}-card-${idx}`, 'heal', '魅了'); 
            } 
        });
    } else if (card.ability === "fossilize") {
        let valid = enemy.field.filter(c => !c.isDead && c.ability !== 'pure_aegis');
        if(valid.length > 0) {
            let t = valid[Math.floor(Math.random()*valid.length)];
            t.status = "stunned"; window.showVFX(`${enemyPrefix}-card-${enemy.field.indexOf(t)}`, 'damage', '化石化');
        }
    }

    if ((card.type === "item" || card.type === "action") && card.damage > 0) {
        enemy.hp -= card.damage; window.showVFX(enemyFace, 'slash'); window.showVFX(enemyFace, 'damage', card.damage);
        const ui = document.getElementById('tcg-battle-ui'); ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect');
        window.showBattleMessage(`🔥 相手リーダーに ${card.damage} ダメージ！`, false, 2000, !isPlayer);
    }

    setTimeout(() => { window.renderBattleBoard(); }, 800);
};

// window.playCard = function(handIndex) {
//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }
    
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     if (card.type === 'action') p.actionUsed = true;
//     if (card.type === 'item' || card.type === 'action') { window.showBattleMessage(`✨ ${card.name} を使用！`); window.triggerPlayEffect(card, true); } 
//     else { card.canAttack = false; p.field.push(card); window.showBattleMessage(`🛡️ ${card.name} を配置！`); window.triggerPlayEffect(card, true); }

//     window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard();
//     if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
// };

// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     // スタンチェック
//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             evoCard.canAttack = false; p.field[index] = evoCard;  
//             window.showVFX(`p-card-${index}`, 'heal', '進化!'); window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`);
//             window.triggerPlayEffect(evoCard, true); window.renderBattleBoard();
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
        
//         // ★魅了チェック：もし魅了状態なら選択した瞬間に自分を攻撃してしまう！
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; // 攻撃したら正気に戻る
//             targetCard.canAttack = false;
            
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
            
//             // 魅了時も行動済みとしてUI更新
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// ==========================================
// 10. ターン開始・終了処理（新アビリティ対応）
// ==========================================
window.startPlayerTurn = function(isFirstTurn = false) {
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    window.TCG_BATTLE.isEnemyTurn = false;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'player') window.TCG_BATTLE.turn++;

    if (p.maxMana < 10) p.maxMana++;
    p.currentMana = p.maxMana; p.actionUsed = false; 
    window.TCG_BATTLE.selectedHandCardIndex = -1; 
    window.TCG_BATTLE.selectedAttackerIndex = -1; // ★バグ修正：攻撃対象選択状態を毎ターン確実にリセット！
    
    let drewCard = false;
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'cpu') && p.deck.length > 0) {
        p.hand.push(p.deck.shift()); drewCard = true;
    }
    
    p.field.forEach(card => { card.canAttack = true; card._has_attacked_once = false; });
    window.renderBattleBoard();

    window.showTurnCutin(`TURN ${window.TCG_BATTLE.turn}\nYOUR TURN`, "#4CAF50", () => {
        p.field.forEach((c, i) => {
            if (c.isDead) return;
            if (c.ability === "start_draw" && !c.isDead) {
                if (p.deck.length > 0) p.hand.push(p.deck.shift());
                window.showVFX(`p-card-${i}`, 'heal', 'Draw'); 
            }
            if (c.ability === "infinite_gear" && !c.isDead) {
                while(p.hand.length < 5 && p.deck.length > 0) p.hand.push(p.deck.shift());
                window.showVFX(`p-card-${i}`, 'heal', 'Draw'); 
            }
            if (c.ability === "star_breath" && !c.isDead) { p.maxMana = Math.min(10, p.maxMana+2); p.currentMana = Math.min(10, p.currentMana+2); p.hp += 30; window.showVFX('player-face', 'heal', 30); }
            if (c.ability === "heaven_judgement" && !c.isDead) {
                cpu.hp -= 20; window.showVFX('cpu-face', 'damage', 20);
                cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`c-card-${fi}`, 'damage', 20); window.checkDeath(f, cpu, `c-card-${fi}`, p); } });
            }
        });
        cpu.field = cpu.field.filter(c => !c.isDead);
        window.renderBattleBoard(); 
        
        if (drewCard) window.showBattleMessage("✨ マナが回復し、カードを1枚引きました！", false, 2000);
        else window.showBattleMessage("✨ マナが回復しました！\n（先攻1ターン目はドローなし）", false, 3500);
        
        window.TCG_BATTLE.isAnimating = false; 
    });
};

window.executeCPUTurn = function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const pField = window.TCG_BATTLE.player.field;
    pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();

    setTimeout(() => {
        let delay = 0;
        cpu.field.forEach((cpuCard, cpuIndex) => {
            if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
            
            // 魅了チェック
            if (cpuCard.status === "charmed") {
                setTimeout(() => {
                    cpuCard.status = null; cpuCard.canAttack = false;
                    cpu.hp -= cpuCard.damage;
                    window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
                    window.renderBattleBoard();
                }, delay);
                delay += 800;
                return;
            }
            if (cpuCard.status === "stunned") {
                return; // スタンなら何もしない
            }

            setTimeout(() => {
                window.TCG_BATTLE.selectedAttackerIndex = cpuIndex; // 擬似選択
                const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const validTargets = p.field.filter(c => c.ability !== "stealth"); 
                let targetType = 'player';
                let tIndex = 0;

                const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
                
                if (tauntTargets.length > 0 && !isPierce) {
                    targetType = 'card';
                    tIndex = p.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]);
                } else if (validTargets.length > 0 && Math.random() > 0.5) {
                    targetType = 'card';
                    tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
                }

                window.executeAttack(targetType, tIndex);

            }, delay);
            delay += 800;
        });

        setTimeout(() => {
            pField.forEach(c => { if (c.isDefending && c._tempOriginalAbility !== undefined) c.ability = c._tempOriginalAbility; });
            p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

            if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

            for (let i = cpu.hand.length - 1; i >= 0; i--) {
                let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
                if (cpu.currentMana >= actualCost) {
                    if (card.type === 'action' && cpu.actionUsed) continue;
                    if (card.evolvesFrom) {
                        let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                        if (targetIndex !== -1) {
                            cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); card.canAttack = false;
                            cpu.field[targetIndex] = card; 
                            // ★追加：進化のログ（サイレントモード）
                            window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); continue;
                        } else { continue; }
                    }
                    // (executeCPUTurn の中盤の for ループ内)
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                    if (card.type === 'action') cpu.actionUsed = true;
                    
                    // ★追加：カードを出した時のログ（サイレントモード）
                    if (card.type === 'item' || card.type === 'action') { 
                        window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else { 
                        card.canAttack = false; cpu.field.push(card); 
                        window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    }
                }
            }

            // CPUのターン終了時効果
            cpu.field.forEach((c, i) => {
                if (c.isDead) return;
                c.status = null; // 状態異常クリア
                if (c.ability === "burn_field" || c.ability === "cataclysm") {
                    let dmg = c.ability === "cataclysm" ? 20 : 10;
                    p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
                }
                if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
                if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
                if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
                if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
                if (c.ability === "event_horizon") {
                    const aliveEnemies = p.field.filter(e => !e.isDead);
                    if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
                }
                if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
                    let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
                    cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
                }
            });
            p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

            window.startPlayerTurn(false);

        }, delay + 500);
    }, 800); 
};

window.executeRealEndTurn = function() {
    window.TCG_BATTLE.isAnimating = true;
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    p.field.forEach((c, i) => {
        if (c.isDead) return;
        c.status = null; // 状態異常クリア

        // ▼▼▼ 自然治癒・プレイヤー側 ▼▼▼
        if (c.ability === "regeneration" && c.hp < c.maxHp) {
            let heal = c.maxHp - c.hp; 
            c.hp = c.maxHp; 
            window.showVFX(`p-card-${i}`, 'heal', heal);
        }
        
        // ▼▼▼ 霊障・プレイヤー側 ▼▼▼
        if (c.ability === "haunt") {
            cpu.hp -= 20; 
            window.showVFX('cpu-face', 'damage', 20);
            window.showBattleMessage(`👻 【霊障】\n${c.name}の呪いでリーダーに20ダメージ！`, false, 1500, false, true);
        }

        if (c.ability === "burn_field" || c.ability === "cataclysm") {
            let dmg = c.ability === "cataclysm" ? 20 : 10;
            cpu.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`c-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, cpu, `c-card-${eidx}`, p); } });
            window.showBattleMessage("🔥 焦土の効果で敵全体にダメージ！");
        }
        if (c.ability === "absolute_sanctuary") { p.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`p-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && p.graveyard.length > 0) { let res = p.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); p.field.push(res); }

        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`p-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { p.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`p-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") {
            const aliveEnemies = cpu.field.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) {
                let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                target.isDead = true; cpu.deck.push(target); window.showVFX(`c-card-${cpu.field.indexOf(target)}`, 'slash', 'バウンス');
            }
        }
        if (c.ability === "divine_grace" && p.graveyard && p.graveyard.length > 0) {
            let resCard = p.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
            p.field.push(resCard); window.showBattleMessage("✨ 【神の恩寵】\n破壊された味方が復活した！");
        }
    });
    p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

    // ▼▼▼ ターン終了時ダメージでの勝敗判定 ▼▼▼
    if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.showTurnCutin("ENEMY TURN", "#ff5252", () => { window.executeCPUTurn(false); });
};

window.endTurn = function() {
    window.TCG_BATTLE.selectedAttackerIndex = -1; window.TCG_BATTLE.player.actionUsed = false; window.renderBattleBoard();
    if (window.TCG_BATTLE.player.currentMana >= 1 && !window.TCG_BATTLE._skipDefendHint) {
        const canDefendCard = window.TCG_BATTLE.player.field.find(c => !c.isDefending && c.ability !== "taunt" && c.ability !== "pure_aegis" && !c.isDead && c.status !== "stunned");
        if (canDefendCard) { window.showDefendHintModal(window.executeRealEndTurn); return; }
    }
    window.executeRealEndTurn();
};

window.showDefendHintModal = function(onConfirm) {
    let modal = document.getElementById('tcg-defend-hint-modal');
    if (!modal) {
        modal = document.createElement('div'); modal.id = 'tcg-defend-hint-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 30000; display: flex; justify-content: center; align-items: center;`;
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 25px; width: 400px; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5);">
            <h3 style="color: #00BCD4; margin-top: 0;">💡 マナが残っています！</h3>
            <p style="line-height: 1.6; font-size: 15px;">行動済みのモンスターをクリックすると、<span style="color:#FFD700; font-weight:bold;">1マナ消費して「🛡️守護」の壁役にさせる</span>ことができます。<br><br>リーダーを守るためにマナを残して壁を作るのも重要な作戦です。このままターンを終了しますか？</p>
            <label style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer; font-size: 14px; color: #ddd; background: #111; padding: 10px; border-radius: 6px;">
                <input type="checkbox" id="defend-hint-checkbox" style="margin-right: 10px; transform: scale(1.3); cursor: pointer;"><span>このバトル中は、次から表示しない</span>
            </label>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <button id="btn-hint-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">盤面に戻る</button>
                <button id="btn-hint-ok" style="flex: 1; padding: 12px; background: #FF9800; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F57C00'" onmouseout="this.style.background='#FF9800'">ターンを終了する</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('btn-hint-cancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btn-hint-ok').onclick = () => {
        if (document.getElementById('defend-hint-checkbox').checked) window.TCG_BATTLE._skipDefendHint = true;
        modal.style.display = 'none'; onConfirm(); 
    };
};

window.showTurnCutin = function(text, color, callback) {
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) { if(callback) callback(); return; }
    if (text.includes("YOUR TURN")) window.TCG_BATTLE.player.field.forEach(c => c.isDefending = false);

    window.TCG_BATTLE.isAnimating = true;

    const blocker = document.createElement('div');
    blocker.style.cssText = `position: absolute; top:0; left:0; width:100%; height:100%; z-index:25000;`;
    ui.appendChild(blocker);

    const splash = document.createElement('div');
    splash.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 26000; display: flex;
        justify-content: center; align-items: center; color: white; text-align: center;
        font-size: 90px; font-weight: bold; font-style: italic; white-space: pre-wrap; line-height: 1.1;
        text-shadow: 0 0 40px ${color}, 5px 5px 0 #000, -2px -2px 0 #000;
        opacity: 0; transform: scale(1.5) skewX(-15deg); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;
    `;
    splash.innerHTML = text; ui.appendChild(splash);

    setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1) skewX(-15deg)'; }, 50);
    setTimeout(() => {
        splash.style.opacity = '0'; splash.style.transform = 'scale(0.8) skewX(-15deg)';
        setTimeout(() => { splash.remove(); blocker.remove(); if (callback) callback(); }, 300);
    }, 1200);
};

// ==========================================
// 11. オートバトルのAIロジック（毎秒監視）
// ==========================================
if (window.TCG_BATTLE_AUTO_LOOP) clearInterval(window.TCG_BATTLE_AUTO_LOOP);
window.TCG_BATTLE_AUTO_LOOP = setInterval(() => {
    if (!window.TCG_BATTLE || !document.getElementById('tcg-battle-ui') || document.getElementById('tcg-battle-ui').style.display === 'none') return;
    if (!window.TCG_BATTLE.isAuto || window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating) return;

    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;

    const lockAnimation = () => {
        window.TCG_BATTLE.isAnimating = true;
        setTimeout(() => { window.TCG_BATTLE.isAnimating = false; }, 1500);
    };

    // ① 攻撃可能なモンスターがいれば攻撃！（スタン、魅了はスキップ）
    let attackerIndex = p.field.findIndex(c => c.canAttack && c.damage > 0 && !c.isDead && c.status !== 'stunned' && c.status !== 'charmed');
    if (attackerIndex !== -1) {
        window.TCG_BATTLE.selectedAttackerIndex = attackerIndex;
        let targetType = 'cpu'; let enemyIndex = 0;
        const tauntTargets = cpu.field.filter(c => (c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending) && !c.isDead);
        const validTargets = cpu.field.filter(c => c.ability !== "stealth" && !c.isDead); 
        const attackerCard = p.field[attackerIndex];
        const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill" || attackerCard.ability === "piercing_juggernaut";

        if (tauntTargets.length > 0 && !isPierce) {
            let t = tauntTargets[Math.floor(Math.random() * tauntTargets.length)];
            targetType = 'card'; enemyIndex = cpu.field.indexOf(t);
        } else if (validTargets.length > 0 && Math.random() > 0.5) {
            let t = validTargets[Math.floor(Math.random() * validTargets.length)];
            targetType = 'card'; enemyIndex = cpu.field.indexOf(t);
        }
        lockAnimation();
        window.executeAttack(targetType, enemyIndex);
        return;
    }

    // もし魅了状態の味方がいれば、自分を殴って行動終了させる（AI行動）
    let charmedIndex = p.field.findIndex(c => c.canAttack && !c.isDead && c.status === 'charmed');
    if (charmedIndex !== -1) {
        lockAnimation();
        window.selectPlayerCard(charmedIndex);
        return;
    }

    // ② 手札に出せるカード（進化含む）があれば出す
    for (let i = p.hand.length - 1; i >= 0; i--) {
        let card = p.hand[i];
        let actualCost = window.getActualCost(p, card);
        if (p.currentMana >= actualCost) {
            if (card.type === 'action' && p.actionUsed) continue;
            
            if (card.evolvesFrom) {
                let targetIndex = p.field.findIndex(c => c.type === card.evolvesFrom && !c.isDead);
                if (targetIndex !== -1) {
                    lockAnimation();
                    window.TCG_BATTLE.selectedHandCardIndex = i;
                    window.selectPlayerCard(targetIndex); 
                    return;
                }
                continue;
            }
            lockAnimation();
            window.playCard(i); 
            return;
        }
    }

    // ③ 防御
    let defIndex = p.field.findIndex(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && c.ability !== "pure_aegis" && !c.isDead && c.status !== "stunned");
    if (defIndex !== -1 && p.currentMana >= 1) {
        lockAnimation();
        window.selectPlayerCard(defIndex);
        return;
    }

    // ④ ターンエンド
    lockAnimation();
    window.TCG_BATTLE._skipDefendHint = true; 
    window.endTurn();

}, 1500);

// ==========================================
// 12. 超リッチ「おまかせ編成」UI＆賢いロジック
// ==========================================
window.autoBuildDeck = function() {
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    if (!isUnlocked) {
        alert("カードが60枚未満のため、おまかせ編成は使えません。");
        return;
    }
    
    let modal = document.getElementById('tcg-auto-build-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-auto-build-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 30000;
            display: flex; justify-content: center; align-items: center;
        `;
        document.body.appendChild(modal);
    }
    
    const speciesList = [
        { id: 'robot', name: '🤖 ロボット' }, { id: 'dragon', name: '🐉 ドラゴン' },
        { id: 'magician', name: '🧙 魔法使い' }, { id: 'spirit', name: '🍃 精霊' },
        { id: 'stone', name: '🪨 ゴーレム' }, { id: 'machine', name: '⚙️ ぜんまい' },
        { id: 'ghost', name: '👻 ゴースト' }, { id: 'bird', name: '🐦 鳥' },
        { id: 'beetle', name: '🪲 虫' }, { id: 'seed', name: '🌱 つぼみ' },
        { id: 'balloon', name: '🎈 風船' }, { id: 'support', name: '🎒 サポート' }
    ];
    
    let speciesHtml = speciesList.map(s => `
        <label style="display:flex; align-items:center; gap:5px; background:#111; padding:8px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
            <input type="checkbox" value="${s.id}" class="auto-species-cb" style="transform: scale(1.2);" ${s.id==='robot'?'checked':''}>
            <span style="font-size:14px; color:#fff;">${s.name}</span>
        </label>
    `).join('');
    
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 20px; width: 500px; max-width:90%; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5); max-height:90vh; overflow-y:auto;">
            <h3 style="color: #00BCD4; margin-top: 0; text-align:center; border-bottom:1px solid #444; padding-bottom:10px;">✨ おまかせデッキ編成</h3>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin:0 0 10px 0; color:#FFD700;">1. 入れたい系統（複数選択可）</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    ${speciesHtml}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="margin:0 0 10px 0; color:#FFD700;">2. デッキのコンセプト方針</h4>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
                        <input type="radio" name="auto-concept" value="balance" checked style="transform: scale(1.3);">
                        <div>
                            <div style="font-weight:bold; font-size:14px; color:#fff;">⚖️ バランス型</div>
                            <div style="font-size:11px; color:#aaa;">色々なカードを程よく配合した標準デッキ。迷ったらこれ。</div>
                        </div>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
                        <input type="radio" name="auto-concept" value="aggro" style="transform: scale(1.3);">
                        <div>
                            <div style="font-weight:bold; font-size:14px; color:#fff;">⚔️ 低コスト速攻型</div>
                            <div style="font-size:11px; color:#aaa;">コスト1〜3の軽いカードを最優先し、手数で盤面を制圧する。</div>
                        </div>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
                        <input type="radio" name="auto-concept" value="heavy" style="transform: scale(1.3);">
                        <div>
                            <div style="font-weight:bold; font-size:14px; color:#fff;">🌋 高コスト重火力型</div>
                            <div style="font-size:11px; color:#aaa;">大型モンスターを主軸にした一撃必殺のロマン砲。</div>
                        </div>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; background:#111; padding:10px; border-radius:6px; cursor:pointer; border:1px solid #444; transition: 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#111'">
                        <input type="radio" name="auto-concept" value="evolve" style="transform: scale(1.3);">
                        <div>
                            <div style="font-weight:bold; font-size:14px; color:#fff;">👑 進化特化型</div>
                            <div style="font-size:11px; color:#aaa;">進化カードとその進化元となる基本カードを最優先でかき集める。</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; gap: 15px; margin-top:20px;">
                <button id="btn-auto-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">キャンセル</button>
                <button id="btn-auto-exec" style="flex: 2; padding: 12px; background: #00BCD4; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#26C6DA'" onmouseout="this.style.background='#00BCD4'">この条件で編成する</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    
    document.getElementById('btn-auto-cancel').onclick = () => modal.style.display = 'none';
    
    document.getElementById('btn-auto-exec').onclick = () => {
        const cbs = document.querySelectorAll('.auto-species-cb:checked');
        let selectedTypes = Array.from(cbs).map(cb => cb.value);
        if (selectedTypes.length === 0) {
            alert("少なくとも1つの系統を選んでください！"); return;
        }
        const concept = document.querySelector('input[name="auto-concept"]:checked').value;
        modal.style.display = 'none';
        window.executeAutoBuildLogic(selectedTypes, concept);
    };
};

// ==========================================
// ★ 賢いおまかせ編成ロジック（シナジー不適合カードの除外処理追加）
// ==========================================
window.executeAutoBuildLogic = function(selectedTypes, concept) {
    let myCards = [...window.TCG.myCollection];
    let selectedUids = [];

    // 1. プール分け（指定された系統か、それ以外か）
    let pool = myCards.filter(c => {
        let cType = c.type || (window.TCG_MASTER[c.masterId] ? window.TCG_MASTER[c.masterId].type : 'robot');
        let ability = c.ability || (window.TCG_MASTER[c.masterId] ? window.TCG_MASTER[c.masterId].ability : null);

        // ★追加：種族専用フィールドカードのミスマッチをAIが判断して除外する！
        if (ability === 'field_forest') {
            // 『静寂の森の小屋』は、精霊・つぼみ・虫のいずれかが選択されている時だけプールに入れる
            if (!selectedTypes.includes('spirit') && !selectedTypes.includes('seed') && !selectedTypes.includes('beetle')) {
                return false; // それ以外のデッキなら腐るので入れない！
            }
        }

        if (selectedTypes.includes('support') && ['item','action','field'].includes(cType)) return true;
        for (let t of selectedTypes) {
            if (t !== 'support' && cType.startsWith(t)) return true;
        }
        return false;
    });
    
    let otherPool = myCards.filter(c => !pool.includes(c));

    // 2. シャッフル（同じコスト・優先度の中でランダム性を出すため）
    window.shuffleArray(pool);
    window.shuffleArray(otherPool);

    // ★進化の深さを判定するヘルパー（基本=0, 1進化=1, 2進化=2）
    const getEvoDepth = (card) => {
        if (!card.evolvesFrom) return 0;
        const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === card.evolvesFrom);
        const parentData = parentKey ? window.TCG_MASTER[parentKey] : null;
        if (parentData && parentData.evolvesFrom) return 2;
        return 1;
    };

    // 3. コンセプトに基づくソート（優先順位付け）
    const sortPool = (p) => {
        p.sort((a, b) => {
            if (concept === 'aggro') return (a.cost || 0) - (b.cost || 0); // 軽い順
            if (concept === 'heavy') return (b.cost || 0) - (a.cost || 0); // 重い順
            if (concept === 'evolve') return getEvoDepth(b) - getEvoDepth(a); // 進化形態（2進化）を最優先
            if (concept === 'support') {
                let aSup = ['item','action','field'].includes(a.type) ? 1 : 0;
                let bSup = ['item','action','field'].includes(b.type) ? 1 : 0;
                return bSup - aSup; // サポート最優先
            }
            return 0; // balance はシャッフルされた状態をベースにする
        });
    };
    sortPool(pool);
    sortPool(otherPool);

    // ★ 事故防止！進化元セット抽出ロジック（トップダウン方式）
    const tryExtractChain = (targetCard, sourcePool) => {
        let chain = [targetCard];
        let currentEvo = targetCard;
        
        while (currentEvo.evolvesFrom) {
            let baseCard = sourcePool.find(c => !chain.includes(c) && window.checkCanEvolve(c, currentEvo));
            if (!baseCard) return null; // 進化元が1枚でも足りなければ破棄
            
            chain.push(baseCard);
            currentEvo = baseCard;
        }
        return chain; // 成功すれば [2進化, 1進化, 基本種] のセットが返る
    };

    // 5. デッキ構築処理本体
    const buildDeckFromPool = (sourcePool) => {
        let remainingPool = [...sourcePool];
        
        // 手札事故防止：コスト1（基本種）を最優先で1枚確保
        if (selectedUids.length === 0) {
            let oneManaIdx = remainingPool.findIndex(c => (c.cost || 0) === 1 && !c.evolvesFrom);
            if (oneManaIdx !== -1) {
                let c = remainingPool.splice(oneManaIdx, 1)[0];
                selectedUids.push(c.uid);
            }
        }

        while (remainingPool.length > 0 && selectedUids.length < 60) {
            let card = remainingPool.shift(); 
            
            if (card.evolvesFrom) {
                let chain = tryExtractChain(card, remainingPool);
                if (chain) {
                    if (selectedUids.length + chain.length <= 60) {
                        chain.forEach(c => {
                            selectedUids.push(c.uid);
                            if (c !== card) {
                                let idx = remainingPool.findIndex(rc => rc.uid === c.uid);
                                if (idx !== -1) remainingPool.splice(idx, 1);
                            }
                        });
                    }
                } 
            } else {
                selectedUids.push(card.uid);
            }
        }
    };

    buildDeckFromPool(pool);
    let lackCount = 60 - selectedUids.length; 
    
    if (selectedUids.length < 60) buildDeckFromPool(otherPool);
    
    if (selectedUids.length < 60) {
        for (let c of myCards) {
            if (selectedUids.length < 60 && !selectedUids.includes(c.uid)) {
                selectedUids.push(c.uid);
            }
        }
    }

    // デッキを更新して画面に反映
    window.TCG.editingDeck = selectedUids;
    window.refreshDeckBuilderView();
    
    const uiTitle = document.getElementById('db-title-text');
    if (uiTitle) {
        let msgText = "✨ コンセプトに合わせて最強デッキを編成しました！";
        if (lackCount > 0) {
            msgText += `<br><span style="color:#FFC107; font-size:16px;">※指定系統や進化元カードが不足していたため、<br>他のカードで <b>${lackCount}枚分</b> 埋め合わせました。</span>`;
        }
        msgText += `<br><span style="font-size:14px;">（問題なければ右上の『デッキを保存』を押してください）</span>`;

        let msg = document.createElement('div');
        msg.innerHTML = msgText;
        msg.style.cssText = "position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); background:rgba(0,188,212,0.95); color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 4s forwards;";
        document.getElementById('tcg-deck-builder').appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
    }
};

// ==========================================
// 💀 偽装UI 強制適用パッチ（無限ループ防止版）
// ==========================================
window._applyTCGFakeUI = function(observerInstance) {
    if (!window.TCG || !window.TCG.myCollection) return;
    const count = window.TCG.myCollection.length;
    const isUnlocked = count >= 60; 

    // ★ 無限ループを防ぐため、書き換え前に監視を一時停止
    if (observerInstance) observerInstance.disconnect();

    // テキストノードを安全に置換する関数
    const replaceTextSafe = (node, searchStr, replaceStr) => {
        if (node.nodeType === 3) { // テキストノード
            if (node.nodeValue.includes(searchStr)) {
                node.nodeValue = node.nodeValue.replace(searchStr, replaceStr);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            node.childNodes.forEach(child => replaceTextSafe(child, searchStr, replaceStr));
        }
    };

    // 1. チュートリアルポップアップなどの長文テキストを置換
    if (!isUnlocked) {
        replaceTextSafe(document.body, '機能解放：カードゲーム', '新機能：思い出アルバム');
        replaceTextSafe(document.body, 'AIの記憶が「カード」として形に残るようになりました！', 'AIの記憶が「写真」として形に残るようになりました！');
        replaceTextSafe(document.body, '集めたカードを眺めたり、デッキを組んでバトルして遊びましょう！', '集めた思い出を眺めて、これまでの歩みを振り返りましょう！');
    }

    // 2. 短い単語（メニュー名やボタン）の完全一致置換
    const allTextElements = document.querySelectorAll('div, h2, h3, span, div.menu-title, p, button, a');
    allTextElements.forEach(el => {
        // 子要素を持たない（テキストのみの）要素を狙う
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) { 
            const t = el.innerText.trim();
            
            if (!isUnlocked) {
                // 解放前
                if (t === 'カード') el.innerText = 'アルバム';
                if (t === '🃏 TCGメニュー' || t === 'TCGメニュー') el.innerText = '📖 思い出アルバム';
                if (t === 'コレクション / 編成') el.innerText = `🗃️ 記録を見る (現在: ${count} / 60 個)`;
            } else {
                // 解放後（元に戻す）
                if (t === 'アルバム') el.innerText = 'カード';
                if (t === '📖 思い出アルバム') el.innerText = '🃏 TCGメニュー';
                if (t.includes('記録を見る (現在:')) el.innerText = '🗃️ コレクション / 編成';
            }
        }
    });

    // 3. 対戦機能のボタンを丸ごと隠す
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        const t = btn.innerText.trim();
        if (t.includes('世界のプレイヤーと対戦') || t.includes('名もなきCPUと練習') || t.includes('デッキをオンライン登録')) {
            btn.style.display = isUnlocked ? 'block' : 'none';
        }
    });

    // ★ 書き換えが終わったら監視を再開
    if (observerInstance) {
        observerInstance.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
};

// ★修正：MutationObserverによる毎フレーム監視を完全に廃止し、ゲームの重さを解消！
// （UIを開く各関数の中にすでにアンロック判定が入っているため、常時監視は不要でした）
if (!window._tcgObserverAdded) {
    window._tcgObserverAdded = true;
    // 起動時のみ1回だけ静的なUIを書き換えておく
    setTimeout(() => { window._applyTCGFakeUI(); }, 1000);
}

// ==========================================
// ★ 新機能：バトルログ記録用の上書き（サイレントモード＆敵の行動対応版）
// ==========================================
window._originalShowBattleMessage = window._originalShowBattleMessage || window.showBattleMessage;
window.showBattleMessage = function(text, isError = false, duration = 2000, silent = false) {
    if (window.TCG_BATTLE && window.TCG_BATTLE.battleLog) {
        window.TCG_BATTLE.battleLog.push({ text: text.replace(/\n/g, " "), isError: isError, isEnemy: silent });
    }
    // silent = true の場合、画面中央のポップアップは出さない（ログにのみ書き込む）
    if (!silent) {
        window._originalShowBattleMessage(text, isError, duration);
    }
};

window.showBattleLogUI = function() {
    let modal = document.getElementById('tcg-battle-log-modal');
    if (!modal) {
        modal = document.createElement('div'); modal.id = 'tcg-battle-log-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 40000; display: flex; justify-content: center; align-items: center;`;
        document.body.appendChild(modal);
    }
    const logs = window.TCG_BATTLE.battleLog || [];
    let logHtml = logs.map(l => {
        // ★追加：敵の行動と自分の行動をタグで分かりやすく区別！
        let prefix = l.isEnemy ? `<span style="background:#f44336; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:5px;">敵CPU</span>` : `<span style="background:#4CAF50; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; margin-right:5px;">あなた</span>`;
        return `<div style="padding:8px 5px; border-bottom:1px dashed #444; color:${l.isError?'#ff5252':'#fff'}; font-size:14px; line-height:1.4;">${prefix}${l.text}</div>`;
    }).reverse().join('');
    
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #9C27B0; border-radius: 12px; padding: 20px; width: 500px; max-height:80vh; display:flex; flex-direction:column; color: white; font-family: sans-serif; box-shadow:0 0 30px rgba(156, 39, 176, 0.5);">
            <h3 style="color: #E040FB; margin-top: 0; border-bottom:2px solid #555; padding-bottom:10px; font-size:22px;">📜 バトルログ (最新順)</h3>
            <div style="flex:1; overflow-y:auto; margin-bottom:15px; background:#111; padding:10px; border-radius:8px; border:1px inset #444;">
                ${logHtml || '<div style="color:#666; text-align:center; padding:20px;">まだログがありません</div>'}
            </div>
            <button onclick="document.getElementById('tcg-battle-log-modal').style.display='none'" style="padding:15px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #777; border-radius:8px; cursor:pointer;">閉じる</button>
        </div>
    `;
    modal.style.display = 'flex';
};

window.showGraveyard = function(type) {
    let modal = document.getElementById('tcg-graveyard-modal');
    if (!modal) {
        modal = document.createElement('div'); modal.id = 'tcg-graveyard-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 40000; display: flex; justify-content: center; align-items: center;`;
        document.body.appendChild(modal);
    }
    const owner = type === 'player' ? window.TCG_BATTLE.player : window.TCG_BATTLE.cpu;
    let title = type === 'player' ? '🧑 あなたの墓地' : '🤖 CPUの墓地';
    
    // ★修正：枠の高さをしっかり確保し、虫眼鏡ボタンを追加
    let cardsHtml = owner.graveyard.map((c, index) => `
        <div style="position:relative; width:120px; height:180px; margin-bottom:10px;">
            <div style="transform:scale(0.65); transform-origin:top left; position:absolute; top:0; left:0; pointer-events:none;">
                ${window.renderCardHTML(c)}
            </div>
            <div onclick="event.stopPropagation(); window.showGraveyardCardDetail('${type}', ${index});" style="position:absolute; top:-5px; right:-5px; background:#222; color:#aaa; border:2px solid #aaa; border-radius:50%; width:32px; height:32px; display:flex; justify-content:center; align-items:center; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;" title="詳細を見る">🔍</div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #666; border-radius: 12px; padding: 20px; width: 750px; max-width:95%; max-height:85vh; display:flex; flex-direction:column; color: white; font-family: sans-serif; box-shadow:0 0 30px rgba(0, 0, 0, 0.8);">
            <h3 style="color: #aaa; margin-top: 0; border-bottom:2px solid #555; padding-bottom:10px; font-size:22px;">💀 ${title} (${owner.graveyard.length}枚)</h3>
            <div style="flex:1; min-height: 250px; overflow-y:auto; display:flex; flex-wrap:wrap; gap:15px; padding:20px; background:#111; border-radius:8px; border:1px inset #444; align-content:flex-start;">
                ${cardsHtml || '<div style="color:#666; width:100%; text-align:center; padding:30px; font-size:18px;">墓地にカードはありません</div>'}
            </div>
            <button onclick="document.getElementById('tcg-graveyard-modal').style.display='none'" style="margin-top:15px; padding:15px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #777; border-radius:8px; cursor:pointer;">閉じる</button>
        </div>
    `;
    modal.style.display = 'flex';
};

// ★追加：墓地のカードを拡大表示するための専用関数
window.showGraveyardCardDetail = function(ownerType, index) {
    const card = ownerType === 'player' ? window.TCG_BATTLE.player.graveyard[index] : window.TCG_BATTLE.cpu.graveyard[index];
    if (!card) return;

    let modal = document.getElementById('tcg-card-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-card-detail-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 50000; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer;`;
        modal.onclick = () => { modal.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    
    // 墓地のカードなので、少し暗めの表示にする演出付き
    modal.innerHTML = `
        <div style="margin-bottom: 30px; color: #aaa; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">
            🔍 墓地のカード詳細
        </div>
        <div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(0,0,0, 0.6); border-radius: 12px; pointer-events: none; filter: grayscale(40%);">
            ${window.renderCardHTML(card)}
        </div>
        <div style="margin-top: 100px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">
            画面のどこかをクリックして閉じる
        </div>
    `;
    modal.style.display = 'flex';
};

// ==========================================
// ★ 新機能：複数デッキ枠の切り替え・コピー機能
// ==========================================
window.switchDeckSlot = function(idx) {
    // 選択中のデッキを一度保存
    window.TCG.decks[window.TCG.currentDeckIndex] = [...window.TCG.editingDeck];
    window.saveTCGData();
    
    window.TCG.currentDeckIndex = idx;
    if (!window.TCG.decks[idx]) window.TCG.decks[idx] = [];
    window.TCG.editingDeck = [...window.TCG.decks[idx]];
    
    // UIを開き直す（タブの再描画のため）
    document.getElementById('tcg-deck-builder').remove();
    window.openDeckBuilder();
};

window.copyDeckSlot = function() {
    let currentIdx = window.TCG.currentDeckIndex || 0;
    
    let modal = document.getElementById('tcg-deck-copy-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-deck-copy-modal';
        modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:50000; display:flex; justify-content:center; align-items:center;`;
        document.body.appendChild(modal);
    }
    
    let html = `
        <div style="background:#222; border:3px solid #00BCD4; border-radius:12px; padding:30px; width:450px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#00BCD4; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">📋 デッキのコピー</h2>
            <p style="color:#ccc; font-size:16px;">現在編集中の「デッキ ${currentIdx + 1}」を<br>どのデッキ枠にコピーしますか？</p>
            <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
    `;
    
    for (let i = 0; i < 3; i++) {
        if (i === currentIdx) {
            html += `<button disabled style="padding:15px; background:#444; color:#888; border:2px solid #555; border-radius:8px; font-size:18px; font-weight:bold; cursor:not-allowed;">デッキ ${i + 1} (現在編集中)</button>`;
        } else {
            let deck = window.TCG.decks[i] || [];
            let info = deck.length > 0 ? `上書き (${deck.length}枚)` : `空き枠にコピー`;
            html += `
                <button onclick="window.executeCopyDeckSlot(${i})" 
                        style="padding:15px; background:#333; color:#FFF; border:2px solid #00BCD4; border-radius:8px; font-size:18px; font-weight:bold; cursor:pointer; transition:0.2s;"
                        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    デッキ ${i + 1} へ ${info}
                </button>
            `;
        }
    }

    html += `
            </div>
            <button onclick="document.getElementById('tcg-deck-copy-modal').style.display='none'" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
        </div>
    `;
    
    modal.innerHTML = html;
    modal.style.display = 'flex';
};

window.executeCopyDeckSlot = function(targetIdx) {
    let modal = document.getElementById('tcg-deck-copy-modal');
    if (modal) modal.style.display = 'none';
    
    // 編集中の内容をターゲット先に上書き
    window.TCG.decks[targetIdx] = [...window.TCG.editingDeck];
    window.saveTCGData();
    
    // 画面中央にエモい完了メッセージを出す
    let popup = document.createElement('div');
    popup.innerHTML = `✨ デッキ ${window.TCG.currentDeckIndex + 1} を デッキ ${targetIdx + 1} にコピーしました！`;
    popup.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); background:rgba(76,175,80,0.9); color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 3s forwards;`;
    let container = document.getElementById('tcg-deck-builder');
    if (container) container.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
};

// ==========================================
// ★ 修正：バトル開始時に「選択中のデッキ」を読み込むように強制パッチ
// ==========================================
const _originalStartBattle = window.startBattle;
window.startBattle = function(enemyData = null) {
    let deckIdx = window.TCG.currentDeckIndex || 0;
    if (!window.TCG.decks[deckIdx] || window.TCG.decks[deckIdx].length < 60) {
        alert("現在選択中のデッキが60枚ありません！先にデッキ編成を完了してください。"); return;
    }
    
    // 実行時に window.TCG.decks[0] を参照している元コードを騙すため、一時的に [0] を差し替える
    let tempDeck0 = window.TCG.decks[0];
    window.TCG.decks[0] = window.TCG.decks[deckIdx];
    
    // 元の処理を実行
    _originalStartBattle(enemyData);
    
    // ログ用の配列を初期化して追加
    if (window.TCG_BATTLE) window.TCG_BATTLE.battleLog = [];
    
    // 元に戻す
    window.TCG.decks[0] = tempDeck0;
};

// ==========================================
// ★ 最終調整パッチ：バトルログ改善 ＆ デッキ選択UI
// ==========================================

// ① ログシステムの改良（サイレントモードと敵行動の分離）
window._baseShowBattleMessageForSilent = window.showBattleMessage;
window.showBattleMessage = function(text, isError = false, duration = 2000, isEnemyLog = false, silent = null) {
    if (silent === null) silent = isEnemyLog; // 前のコードとの互換性
    
    // ログに保存（サイレントでも保存する）
    if (window.TCG_BATTLE && window.TCG_BATTLE.battleLog) {
        window.TCG_BATTLE.battleLog.push({ text: text.replace(/\n/g, " "), isError: isError, isEnemy: isEnemyLog });
    }
    
    // ポップアップ演出（サイレントじゃない時だけ出す）
    if (!silent) {
        window._originalShowBattleMessage(text, isError, duration);
    }
};

// ② カード破壊時にログを追加するパッチ
const _originalCheckDeath = window.checkDeath;
window.checkDeath = function(card, owner, htmlId, enemyOwner = null) {
    if (card.hp <= 0 && !card.isDead) {
        if ((card.ability === "eternal_rebirth" || card.ability === "rebirth") && !card._reborn) {
            // 復活するのでスルー
        } else {
            const isPlayer = (owner === window.TCG_BATTLE.player);
            // ★サイレント(ポップアップなし)で、裏のログにだけ書き込む
            window.showBattleMessage(`💀 ${card.name} が破壊された！`, !isPlayer, 1500, !isPlayer, true);
        }
    }
    // 元の関数を呼び出す
    _originalCheckDeath(card, owner, htmlId, enemyOwner);
};

// ==========================================
// ★ デッキ名設定 ＆ バトルログ完全表示 ＆ 詳細UIパッチ
// ==========================================

// デッキ名の初期化
if (!window.TCG.deckNames) window.TCG.deckNames = ["デッキ 1", "デッキ 2", "デッキ 3"];

// ① 編成画面のUI上書き（デッキ名入力欄を追加）
// ==========================================
// ★ 検索フィルター＆ソート機能 大拡張パッチ
// ==========================================

window.openDeckBuilder = function() {
    // ★追加：デッキ編成BGMを再生
    if (window.audioManager) window.audioManager.playBGM('card_deck_build');

    let builderUI = document.getElementById('tcg-deck-builder');
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    
    const uiTitle = isUnlocked ? "🛠️ デッキ編成" : "📖 思い出の整理";
    const uiCountUnit = isUnlocked ? "枚" : "個";
    const uiSaveBtn = isUnlocked ? "デッキを保存" : "アルバムを保存";
    const uiColArea = isUnlocked ? "🗃️ コレクション（タップでデッキに追加）" : "🗃️ 集めた思い出（タップでアルバムに配置）";
    const uiDeckArea = isUnlocked ? "🃏 デッキ（タップで外す）" : "📖 アルバムのページ（タップで外す）";
    
    window.TCG.currentDeckIndex = window.TCG.currentDeckIndex || 0;
    while(window.TCG.decks.length < 3) window.TCG.decks.push([]);
    window.TCG.editingDeck = [...window.TCG.decks[window.TCG.currentDeckIndex]];

    let currentDeckName = window.TCG.deckNames[window.TCG.currentDeckIndex] || `デッキ ${window.TCG.currentDeckIndex + 1}`;

    if (!builderUI) {
        builderUI = document.createElement('div');
        builderUI.id = 'tcg-deck-builder';
        builderUI.style.cssText = `
            position: fixed; top: 2%; left: 2%; width: 96%; height: 96%;
            background: #1a1a1a; border: 4px solid #4CAF50; border-radius: 12px;
            z-index: 10000; display: flex; flex-direction: column; overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8); font-family: sans-serif;
        `;
        builderUI.innerHTML = `
            <div style="background: #2E7D32; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1B5E20;">
                <div style="display:flex; flex-direction:column;">
                    <h2 id="db-title-text" style="margin: 0 0 5px 0; color: #FFF; font-size: 22px;">
                        ${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">
                        現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})
                        </span>
                    </h2>
                    ${isUnlocked ? `
                    <div style="display:flex; gap:5px; align-items:center;" id="deck-tabs-container">
                        <button onclick="window.switchDeckSlot(0)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===0 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===0 ? '#2E7D32' : '#FFF'};">枠1</button>
                        <button onclick="window.switchDeckSlot(1)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===1 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===1 ? '#2E7D32' : '#FFF'};">枠2</button>
                        <button onclick="window.switchDeckSlot(2)" style="padding:5px 15px; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; border:none; background:${window.TCG.currentDeckIndex===2 ? '#FFF' : '#888'}; color:${window.TCG.currentDeckIndex===2 ? '#2E7D32' : '#FFF'};">枠3</button>
                        <input type="text" id="db-deck-name-input" value="${currentDeckName}" onchange="window.TCG.deckNames[window.TCG.currentDeckIndex] = this.value;" style="margin-left:15px; padding:5px 10px; border-radius:4px; background:#111; color:#fff; border:1px solid #444; width:200px;" placeholder="デッキ名を入力">
                        <button onclick="window.copyDeckSlot()" style="padding:5px 10px; border-radius:4px; font-size:11px; cursor:pointer; margin-left:10px; background:#444; color:#fff; border:1px solid #666;">📋 コピー</button>
                    </div>` : ''}
                </div>
                <div>
                    ${isUnlocked ? `<button id="db-auto-btn" onclick="window.autoBuildDeck()" style="background: #00BCD4; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px; transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">✨ おまかせ編成</button>` : ''}
                    <button id="db-save-btn" onclick="window.saveDeck()" style="background: #FF9800; color: #FFF; font-weight: bold; border: 2px solid #FFF; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px;">${uiSaveBtn}</button>
                    <button onclick="window.closeDeckBuilder()" style="background: #666; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">閉じる ✖</button>
                </div>
            </div>
            <div style="flex: 1; display: flex; overflow: hidden;">
                <div style="flex: 3; background: #222; display: flex; flex-direction: column; border-right: 4px solid #444;">
                    <div id="db-col-header" style="padding: 10px; background: #333; color: #aaa; text-align: center; font-weight: bold; border-bottom: 1px solid #111;">${uiColArea}</div>
                    
                    <div style="padding: 10px; background: #2a2a2a; border-bottom: 2px solid #111; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                        <input type="text" id="db-search-name" placeholder="🔍 ${isUnlocked ? 'カード名' : '思い出'}で検索..." oninput="window.refreshDeckBuilderView()" style="flex: 1; min-width: 150px; padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px;">
                        
                        <select id="db-filter-race" onchange="window.refreshDeckBuilderView()" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px; cursor: pointer; display: ${isUnlocked ? 'block' : 'none'};">
                            <option value="all">🌟 全種族</option>
                            <option value="robot">🤖 ロボット</option>
                            <option value="dragon">🐉 ドラゴン</option>
                            <option value="magician">🧙 魔法使い</option>
                            <option value="ghost">👻 ゴースト</option>
                            <option value="seed">🌱 つぼみ</option>
                            <option value="spirit">🍃 精霊</option>
                            <option value="stone">🪨 ゴーレム</option>
                            <option value="machine">⚙️ ぜんまい</option>
                            <option value="bird">🐦 鳥</option>
                            <option value="beetle">🪲 虫</option>
                            <option value="balloon">🎈 風船</option>
                            <option value="support">🎒 サポート(魔法/アイテム)</option>
                        </select>

                        <select id="db-filter-stage" onchange="window.refreshDeckBuilderView()" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px; cursor: pointer; display: ${isUnlocked ? 'block' : 'none'};">
                            <option value="all">🔰 全階級</option>
                            <option value="base">🟢 基本種のみ(たね)</option>
                            <option value="stage1">✨ 1進化のみ</option>
                            <option value="stage2">👑 2進化のみ(最終)</option>
                        </select>

                        <select id="db-sort" onchange="window.refreshDeckBuilderView()" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #111; color: white; font-size: 14px; cursor: pointer;">
                            <option value="newest">🕒 獲得が新しい順</option>
                            <option value="cost_asc">🔼 コストが低い順</option>
                            <option value="cost_desc">🔽 コストが高い順</option>
                            <option value="hp_desc">❤️ HPが高い順</option>
                            <option value="dmg_desc">⚔️ 攻撃力が高い順</option>
                        </select>
                    </div>

                    <div id="db-collection-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
                </div>
                <div style="flex: 2; background: #111; display: flex; flex-direction: column;">
                    <div id="db-deck-header" style="padding: 10px; background: #000; color: #4CAF50; text-align: center; font-weight: bold; border-bottom: 2px solid #222;">${uiDeckArea}</div>
                    <div id="db-deck-area" style="flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 10px;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(builderUI);
    } else {
        const titleSpan = document.getElementById('db-title-text');
        if (titleSpan) titleSpan.innerHTML = `${uiTitle} <span style="font-size: 16px; margin-left: 15px; background: #1B5E20; padding: 5px 10px; border-radius: 20px;">現在: <span id="db-count" style="color:#FFD700; font-weight:bold; font-size:20px;">0</span> ${uiCountUnit} (最低60${uiCountUnit})</span>`;
        const saveBtn = document.getElementById('db-save-btn');
        if (saveBtn) saveBtn.innerText = uiSaveBtn;
        const colHeader = document.getElementById('db-col-header');
        if (colHeader) colHeader.innerText = uiColArea;
        const deckHeader = document.getElementById('db-deck-header');
        if (deckHeader) deckHeader.innerText = uiDeckArea;
        
        let nameInput = document.getElementById('db-deck-name-input');
        if (nameInput) nameInput.value = currentDeckName;
        
        const autoBtn = document.getElementById('db-auto-btn');
        if (autoBtn) autoBtn.style.display = isUnlocked ? 'block' : 'none';

        // フィルター・ソートを初期化するかどうか（そのまま保持するならスキップ）
        const filterRace = document.getElementById('db-filter-race');
        if (filterRace) filterRace.style.display = isUnlocked ? 'block' : 'none';
        const filterStage = document.getElementById('db-filter-stage');
        if (filterStage) filterStage.style.display = isUnlocked ? 'block' : 'none';
    }

    builderUI.style.display = 'flex';
    window.refreshDeckBuilderView(); 
};

// ② 切り替え・保存時の名前保存
window.switchDeckSlot = function(idx) {
    let nameInput = document.getElementById('db-deck-name-input');
    if (nameInput) window.TCG.deckNames[window.TCG.currentDeckIndex] = nameInput.value;
    window.TCG.decks[window.TCG.currentDeckIndex] = [...window.TCG.editingDeck];
    window.saveTCGData();
    
    window.TCG.currentDeckIndex = idx;
    if (!window.TCG.decks[idx]) window.TCG.decks[idx] = [];
    window.TCG.editingDeck = [...window.TCG.decks[idx]];
    
    document.getElementById('tcg-deck-builder').remove();
    window.openDeckBuilder();
};

window.saveDeck = function() {
    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    const showMessage = (msg, isError = false) => {
        let popup = document.createElement('div'); popup.innerHTML = msg;
        popup.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); background:${isError ? 'rgba(244,67,54,0.95)' : 'rgba(0,188,212,0.95)'}; color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 3s forwards;`;
        let container = document.getElementById('tcg-deck-builder');
        if (container) container.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
    };

    if (window.TCG.editingDeck.length < 60) {
        if(isUnlocked) showMessage(`⚠️ デッキは最低60枚必要です！<br><span style="font-size:16px;">（現在は ${window.TCG.editingDeck.length} 枚です）</span>`, true);
        else showMessage(`⚠️ アルバムを完成させるには、記憶が最低60個必要です！<br><span style="font-size:16px;">（現在は ${window.TCG.editingDeck.length} 個です）</span>`, true);
        return;
    }
    
    let nameInput = document.getElementById('db-deck-name-input');
    if (nameInput) window.TCG.deckNames[window.TCG.currentDeckIndex || 0] = nameInput.value;
    
    window.TCG.decks[window.TCG.currentDeckIndex || 0] = [...window.TCG.editingDeck]; 
    window.saveTCGData();
    
    let dName = window.TCG.deckNames[window.TCG.currentDeckIndex || 0] || `デッキ ${(window.TCG.currentDeckIndex || 0) + 1}`;
    if(isUnlocked) showMessage(`🎉 「${dName}」 を保存しました！`);
    else showMessage("🎉 思い出のアルバムが保存されました！");
};

// ③ バトル開始前のデッキ選択UIのリッチ化（詳細表示ボタン追加）
const _coreStartBattle2 = window.startBattle;
window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    if (selectedDeckIndex === -1) {
        let modal = document.getElementById('tcg-deck-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tcg-deck-select-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:50000; display:flex; justify-content:center; align-items:center;`;
            document.body.appendChild(modal);
        }
        
        window._tempEnemyData = enemyData;
        
        let html = `
            <div style="background:#222; border:3px solid #4CAF50; border-radius:12px; padding:30px; width:550px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#4CAF50; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🛡️ 使用するデッキを選択</h2>
                <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
        `;
        
        for (let i = 0; i < 3; i++) {
            let deck = window.TCG.decks[i] || [];
            let isValid = deck.length >= 60;
            let dName = window.TCG.deckNames ? window.TCG.deckNames[i] : `デッキ ${i + 1}`;
            let color = isValid ? '#FFF' : '#666';
            let bg = isValid ? '#333' : '#222';
            let cursor = isValid ? 'pointer' : 'not-allowed';
            
            html += `
                <div style="display:flex; gap:10px;">
                    <button onclick="if(${isValid}) { document.getElementById('tcg-deck-select-modal').style.display='none'; window.startBattle(window._tempEnemyData, ${i}); }" 
                            style="flex:1; padding:15px; background:${bg}; color:${color}; border:2px solid ${isValid ? '#4CAF50' : '#444'}; border-radius:8px; font-size:18px; font-weight:bold; cursor:${cursor}; transition:0.2s;"
                            onmouseover="if(${isValid}) this.style.transform='scale(1.02)'" onmouseout="if(${isValid}) this.style.transform='scale(1)'">
                        ${dName} ${isValid ? `(${deck.length}枚)` : '(未編成)'}
                    </button>
                    <button onclick="window.showDeckDetailModal(${i})" style="padding:15px 20px; background:#2196F3; color:#fff; border:2px solid #1976D2; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">詳細 🔍</button>
                </div>
            `;
        }
    
        html += `
                </div>
                <button onclick="document.getElementById('tcg-deck-select-modal').style.display='none'" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
            </div>
        `;
        
        modal.innerHTML = html;
        modal.style.display = 'flex';
        return;
    }
    
    let tempDeck0 = window.TCG.decks[0];
    let tempCurrentIdx = window.TCG.currentDeckIndex;
    
    window.TCG.currentDeckIndex = selectedDeckIndex;
    window.TCG.decks[0] = window.TCG.decks[selectedDeckIndex];
    
    // ログ初期化
    if (!window.TCG_BATTLE) window.TCG_BATTLE = {};
    window.TCG_BATTLE.battleLog = [];
    
    _coreStartBattle2(enemyData);
    
    window.TCG.currentDeckIndex = tempCurrentIdx;
    window.TCG.decks[0] = tempDeck0;
};

// ④ デッキ詳細（中身確認）モーダルの表示関数
window.showDeckDetailModal = function(deckIndex) {
    let deck = window.TCG.decks[deckIndex] || [];
    let dName = window.TCG.deckNames ? window.TCG.deckNames[deckIndex] : `デッキ ${deckIndex + 1}`;
    
    let modal = document.getElementById('tcg-deck-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-deck-detail-modal';
        modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:55000; display:flex; justify-content:center; align-items:center;`;
        document.body.appendChild(modal);
    }
    
    let cardsHtml = '';
    if (deck.length === 0) {
        cardsHtml = `<div style="color:#666; width:100%; text-align:center; padding:30px;">カードがありません</div>`;
    } else {
        // カードごとの枚数を集計して表示
        let counts = {};
        deck.forEach(uid => {
            let card = window.TCG.myCollection.find(c => c.uid === uid);
            if (card) {
                if (!counts[card.masterId]) counts[card.masterId] = { card: card, count: 0 };
                counts[card.masterId].count++;
            }
        });
        
        Object.values(counts).forEach(data => {
            cardsHtml += `
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <div style="transform:scale(0.5); transform-origin:top center; width:180px; height:130px; margin-bottom:-130px;">${window.renderCardHTML(data.card)}</div>
                    <div style="margin-top:140px; color:#FFD700; font-weight:bold; font-size:14px; background:#000; padding:2px 8px; border-radius:10px; border:1px solid #FFD700;">x${data.count}</div>
                </div>
            `;
        });
    }

    modal.innerHTML = `
        <div style="background:#222; border:3px solid #2196F3; border-radius:12px; padding:30px; width:700px; max-width:90%; max-height:85vh; display:flex; flex-direction:column; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#2196F3; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🔍 ${dName} の詳細</h2>
            <div style="flex:1; overflow-y:auto; display:flex; flex-wrap:wrap; gap:10px; padding:15px; background:#111; border-radius:8px; border:1px inset #444; justify-content:center;">
                ${cardsHtml}
            </div>
            <button onclick="document.getElementById('tcg-deck-detail-modal').style.display='none'" style="margin-top:20px; padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">閉じる</button>
        </div>
    `;
    modal.style.display = 'flex';
};

// ⑥ 死亡処理の上書き（破壊ログを出す）
window.checkDeath = function(card, owner, htmlId, enemyOwner = null) {
    if (card.hp <= 0 && !card.isDead) {
        if ((card.ability === "eternal_rebirth" || card.ability === "rebirth") && !card._reborn) {
            card.hp = card.maxHp || 100; 
            card._reborn = true;
            window.showVFX(htmlId, 'heal', '復活!');
            window.showBattleMessage(`⏳ 【${card.ability === "rebirth" ? "輪廻転生" : "悠久の再生"}】\n${card.name} が復活した！`);
            if (card.ability === "rebirth" && enemyOwner) {
                enemyOwner.field.forEach((ec, idx) => {
                    if(!ec.isDead) {
                        ec.hp -= 30;
                        window.showVFX(`${enemyOwner === window.TCG_BATTLE.cpu ? 'c' : 'p'}-card-${idx}`, 'damage', 30);
                    }
                });
                window.showBattleMessage(`🔥 フェニックスの業火が敵を焼く！`, false, 2000);
            }
        } else {
            card.isDead = true;
            if (!owner.graveyard) owner.graveyard = [];
            owner.graveyard.push(card); 
            
            // ★ 追加：破壊ログ（サイレントモード）
            const isPlayerOwner = (owner === window.TCG_BATTLE.player);
            window.showBattleMessage(`💀 ${card.name} が破壊された！`, !isPlayerOwner, 1500, !isPlayerOwner, true);

            // --- 死亡時発動アビリティ ---
            if (card.ability === "curse_death" && enemyOwner) {
                enemyOwner.hp -= 50;
                window.showVFX(enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face', 'slash');
                window.showVFX(enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face', 'damage', 50);
                window.showBattleMessage(`💀 【死の呪い】\n敵リーダーに怨念のダメージ！`);
            }
            if (card.ability === "death_bomb" && enemyOwner) {
                enemyOwner.hp -= 20;
                const faceId = enemyOwner === window.TCG_BATTLE.cpu ? 'cpu-face' : 'player-face';
                window.showVFX(faceId, 'slash'); window.showVFX(faceId, 'damage', 20);
                window.showBattleMessage(`💣 【誘爆】\n敵リーダーに20ダメージ！`, false, 2000, !isPlayerOwner, true);
                
                // 画面揺れ演出
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            }
            if (card.ability === "burst_spores") {
                owner.field.forEach((ac, idx) => {
                    if(!ac.isDead) { 
                        ac.hp += 30; ac.damage += 10; 
                        window.showVFX(`${owner === window.TCG_BATTLE.player ? 'p' : 'c'}-card-${idx}`, 'heal', '強化'); 
                    }
                });
                window.showBattleMessage(`🍄 【破裂胞子】\n味方全体が回復＆攻撃力UP！`);
            }
            if (card.ability === "nova_burst" && enemyOwner) {
                let dmg = card.maxHp || 100;
                enemyOwner.field.forEach((ec, idx) => {
                    if(!ec.isDead) { 
                        ec.hp -= dmg; 
                        window.showVFX(`${enemyOwner === window.TCG_BATTLE.cpu ? 'c' : 'p'}-card-${idx}`, 'damage', dmg); 
                    }
                });
                window.showBattleMessage(`💥 【超新星爆発】\n敵全体に ${dmg} ダメージ！`);
            }
            if (card.ability === "mass_bounce" && enemyOwner) {
                enemyOwner.field.forEach((ec) => {
                    if(!ec.isDead) { ec.isDead = true; enemyOwner.deck.push(ec); }
                });
                window.showBattleMessage(`🌪️ 【全バウンス】\n敵全体を山札に吹き飛ばした！`);
            }
        }
    }
};

// ==========================================
// ★ 最終バグ修正パッチ（デッキ選択重複・進化バグ・墓地バグ）
// ==========================================

// 1. バトル開始処理の完全統合版（重複をなくし、進化情報も確実に引き継ぐ）
window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    if (selectedDeckIndex === -1) {
        // デッキ選択UIを表示
        let modal = document.getElementById('tcg-deck-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tcg-deck-select-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:50000; display:flex; justify-content:center; align-items:center;`;
            document.body.appendChild(modal);
        }
        
        window._tempEnemyData = enemyData;
        
        let html = `
            <div style="background:#222; border:3px solid #4CAF50; border-radius:12px; padding:30px; width:550px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#4CAF50; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🛡️ 使用するデッキを選択</h2>
                <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
        `;
        
        for (let i = 0; i < 3; i++) {
            let deck = window.TCG.decks[i] || [];
            let isValid = deck.length >= 60;
            let dName = window.TCG.deckNames ? window.TCG.deckNames[i] : `デッキ ${i + 1}`;
            let color = isValid ? '#FFF' : '#666';
            let bg = isValid ? '#333' : '#222';
            let cursor = isValid ? 'pointer' : 'not-allowed';
            
            html += `
                <div style="display:flex; gap:10px;">
                    <button onclick="if(${isValid}) { document.getElementById('tcg-deck-select-modal').style.display='none'; window.startBattle(window._tempEnemyData, ${i}); }" 
                            style="flex:1; padding:15px; background:${bg}; color:${color}; border:2px solid ${isValid ? '#4CAF50' : '#444'}; border-radius:8px; font-size:18px; font-weight:bold; cursor:${cursor}; transition:0.2s;"
                            onmouseover="if(${isValid}) this.style.transform='scale(1.02)'" onmouseout="if(${isValid}) this.style.transform='scale(1)'">
                        ${dName} ${isValid ? `(${deck.length}枚)` : '(未編成)'}
                    </button>
                    <button onclick="window.showDeckDetailModal(${i})" style="padding:15px 20px; background:#2196F3; color:#fff; border:2px solid #1976D2; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">詳細 🔍</button>
                </div>
            `;
        }
    
        html += `
                </div>
                <button onclick="document.getElementById('tcg-deck-select-modal').style.display='none'" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
            </div>
        `;
        
        modal.innerHTML = html;
        modal.style.display = 'flex';
        return;
    }
    
    // --- ここから実際のバトル準備 ---
    let deckIdx = selectedDeckIndex;
    if (!window.TCG.decks[deckIdx] || window.TCG.decks[deckIdx].length < 60) return;

    window.TCG_BATTLE = {
        player: { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        cpu:    { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false,
        currentField: null, targetingHandIndex: -1,
        firstPlayer: 'player', isEnemyTurn: false, isAnimating: true, isAuto: false,
        battleLog: [] // ログ初期化
    };
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    let battleUI = document.getElementById('tcg-battle-ui');
    if (!battleUI) {
        battleUI = document.createElement('div');
        battleUI.id = 'tcg-battle-ui';
        battleUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #2a2a2a; z-index: 20000; display: flex; flex-direction: column; font-family: sans-serif; color: white; overflow: hidden;`;
        document.body.appendChild(battleUI);
    }

    // プレイヤーデッキ構築
    p.deck = window.TCG.decks[deckIdx].map(uid => {
        const originalCard = window.TCG.myCollection.find(c => c.uid === uid);
        if (!originalCard) return null;
        let cardCopy = JSON.parse(JSON.stringify(originalCard));
        let master = window.TCG_MASTER[cardCopy.masterId];
        if (master) cardCopy.hp = Math.max(cardCopy.hp, master.baseHp);
        cardCopy.maxHp = cardCopy.hp; 
        cardCopy.isDead = false; cardCopy.canAttack = false; cardCopy.isDefending = false; cardCopy.status = null;
        // ★進化元を確実に引き継ぐ
        if (master) cardCopy.evolvesFrom = master.evolvesFrom;
        return cardCopy;
    }).filter(c => c !== null);
    window.shuffleArray(p.deck);

    // 敵デッキ構築
    if (enemyData && enemyData.deck) {
        cpu.deck = enemyData.deck.map((dCard, i) => {
            let master = window.TCG_MASTER[dCard.masterId];
            if(!master) return null;
            return {
                uid: 'ghost_' + i, masterId: dCard.masterId, name: dCard.name || master.name, type: master.type,
                cost: master.baseCost, hp: dCard.hp || master.baseHp, maxHp: dCard.hp || master.baseHp,
                skillName: master.skillName, skillCost: master.skillCost, damage: dCard.damage || master.baseDmg, 
                ability: master.ability, image: master.image, imageIndex: master.imageIndex,
                offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null,
                evolvesFrom: master.evolvesFrom // ★ここでCPUにも進化情報を付与！
            };
        }).filter(c => c !== null);
        if(cpu.deck.length < 60) { alert("敵のデッキデータが不完全です。通常のCPUと対戦します。"); enemyData = null; } 
        else { window.shuffleArray(cpu.deck); }
    } 

    if (!enemyData || !enemyData.deck) {
        const allMasterKeys = Object.keys(window.TCG_MASTER);
        for (let i = 0; i < Math.max(60, p.deck.length); i++) {
            let randomKey = allMasterKeys[Math.floor(Math.random() * allMasterKeys.length)];
            let master = window.TCG_MASTER[randomKey];
            cpu.deck.push({
                uid: 'cpu_' + i, masterId: randomKey, name: master.name, type: master.type,
                cost: master.baseCost, hp: master.baseHp, maxHp: master.baseHp, skillName: master.skillName,
                skillCost: master.skillCost, damage: master.baseDmg, ability: master.ability,
                image: master.image, imageIndex: master.imageIndex, offsetX: master.offsetX,
                offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null,
                evolvesFrom: master.evolvesFrom // ★ランダムCPUにも進化情報を付与！
            });
        }
    }

    window.renderBattleBoard();

    let cpuNameLabel = document.getElementById('cpu-name-label');
    if (!cpuNameLabel) {
        cpuNameLabel = document.createElement('div');
        cpuNameLabel.id = 'cpu-name-label';
        cpuNameLabel.style.cssText = 'position:absolute; top:20px; right:30px; color:#FF5252; font-weight:bold; font-size:24px; text-shadow:0 0 10px #000; z-index:100;';
        battleUI.appendChild(cpuNameLabel);
    }
    cpuNameLabel.innerHTML = enemyData ? `VS ${enemyData.playerName}` : "VS 名もなきCPU";
    
    battleUI.style.display = 'flex';

    const blocker = document.createElement('div'); blocker.id = 'tcg-battle-blocker'; blocker.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; z-index:25000;`; document.body.appendChild(blocker);
    const splash = document.createElement('div'); splash.id = 'tcg-battle-splash'; splash.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 26000; display: flex; justify-content: center; align-items: center; color: white; font-size: 80px; font-weight: bold; font-style: italic; text-align:center; line-height:1.2; text-shadow: 0 0 30px #FF9800, 5px 5px 0 #000; opacity: 0; transform: scale(1.5); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    splash.innerHTML = enemyData ? `ONLINE BATTLE !!<br><span style="font-size:50px; color:#4fc3f7;">VS ${enemyData.playerName}</span>` : "BATTLE START !!";
    document.body.appendChild(splash);

    setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1)'; }, 50);

    setTimeout(() => {
        splash.style.opacity = '0'; splash.style.transform = 'scale(0.8)';
        setTimeout(() => {
            splash.remove();
            
            const isPlayerFirst = Math.random() < 0.5;
            window.TCG_BATTLE.firstPlayer = isPlayerFirst ? 'player' : 'cpu';
            window.TCG_BATTLE.isEnemyTurn = !isPlayerFirst;
            
            const coinUI = document.createElement('div');
            coinUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 26000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;`;
            coinUI.innerHTML = `<div style="font-size: 30px; font-weight: bold; margin-bottom: 30px; color:#00BCD4;">先攻・後攻を決定します...</div><div class="coin-flip-anim" style="width: 150px; height: 150px; background: #FFD700; border-radius: 50%; border: 10px solid #FFA000; box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; font-size: 60px; font-weight: bold; color: #B28900; text-shadow: 1px 1px 0px #FFF;">TCG</div>`;
            document.body.appendChild(coinUI);

            setTimeout(() => {
                coinUI.innerHTML = `<div style="font-size: 50px; font-weight: bold; margin-bottom: 30px; color:${isPlayerFirst ? '#4CAF50' : '#ff5252'}; text-shadow: 0 0 20px ${isPlayerFirst ? '#4CAF50' : '#ff5252'};">${isPlayerFirst ? 'あなたの先攻！' : '敵の先攻！'}</div>`;
                setTimeout(() => {
                    coinUI.style.opacity = '0'; coinUI.style.transition = '0.5s';
                    setTimeout(() => {
                        coinUI.remove();
                        
                        let drawCount = 0;
                        let pOneManaIdx = p.deck.findIndex(c => window.getActualCost(p, c) === 1 || c.cost === 1);
                        if (pOneManaIdx !== -1) { p.hand.push(p.deck.splice(pOneManaIdx, 1)[0]); drawCount = 1; }
                        
                        const drawTimer = setInterval(() => {
                            if (drawCount < 5) {
                                p.hand.push(p.deck.shift());
                                cpu.hand.push(cpu.deck.shift());
                                window.showBattleMessage(`シュッ！ (手札: ${drawCount + 1}枚)`, false, 250);
                                window.renderBattleBoard();
                                drawCount++;
                            } else {
                                clearInterval(drawTimer);
                                blocker.remove(); 
                                if (isPlayerFirst) window.startPlayerTurn(true);
                                else window.showTurnCutin("ENEMY TURN", "#ff5252", () => { window.executeCPUTurn(true); });
                            }
                        }, 350);
                    }, 500);
                }, 2000);
            }, 2500);
        }, 500);
    }, 1500); 
};

// 2. プレイヤーのサポートカード（アイテム・アクション）墓地送りパッチ
// window.playCard = function(handIndex) {
//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }
    
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     if (card.type === 'action') p.actionUsed = true;
    
//     if (card.type === 'item' || card.type === 'action') { 
//         // ★修正：使ったカードは墓地へ送る
//         card.isDead = true;
//         p.graveyard.push(card);
//         window.showBattleMessage(`✨ ${card.name} を使用！`); 
//         window.triggerPlayEffect(card, true); 
//     } else { 
//         card.canAttack = false; p.field.push(card); 
//         window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
//         window.triggerPlayEffect(card, true); 
//     }

//     window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard();
//     if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
// };

// 3. CPUのサポートカード（アイテム・アクション）墓地送りパッチ
window._executeCPUTurnPatch = window.executeCPUTurn;
window.executeCPUTurn = function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const pField = window.TCG_BATTLE.player.field;
    pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();

    setTimeout(() => {
        let delay = 0;
        
        // 攻撃フェーズ
        cpu.field.forEach((cpuCard, cpuIndex) => {
            if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
            
            if (cpuCard.status === "charmed") {
                setTimeout(() => {
                    cpuCard.status = null; cpuCard.canAttack = false;
                    cpu.hp -= cpuCard.damage;
                    window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
                    window.renderBattleBoard();
                }, delay);
                delay += 800;
                return;
            }
            if (cpuCard.status === "stunned") return;

            setTimeout(() => {
                window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
                const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const validTargets = p.field.filter(c => c.ability !== "stealth"); 
                let targetType = 'player';
                let tIndex = 0;

                const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
                
                if (tauntTargets.length > 0 && !isPierce) {
                    targetType = 'card';
                    tIndex = p.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]);
                } else if (validTargets.length > 0 && Math.random() > 0.5) {
                    targetType = 'card';
                    tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
                }
                window.executeAttack(targetType, tIndex);
            }, delay);
            delay += 800;
        });

        // 召喚フェーズ
        setTimeout(() => {
            pField.forEach(c => { if (c.isDefending && c._tempOriginalAbility !== undefined) c.ability = c._tempOriginalAbility; });
            p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

            if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

            for (let i = cpu.hand.length - 1; i >= 0; i--) {
                let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
                if (cpu.currentMana >= actualCost) {
                    if (card.type === 'action' && cpu.actionUsed) continue;
                    if (card.evolvesFrom) {
                        let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                        if (targetIndex !== -1) {
                            cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); card.canAttack = false;
                            cpu.field[targetIndex] = card; 
                            window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); continue;
                        } else { continue; }
                    }
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                    if (card.type === 'action') cpu.actionUsed = true;
                    
                    if (card.type === 'item' || card.type === 'action') { 
                        // ★修正：使ったカードは墓地へ送る
                        card.isDead = true;
                        cpu.graveyard.push(card);
                        window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else { 
                        card.canAttack = false; cpu.field.push(card); 
                        window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    }
                }
            }

            cpu.field.forEach((c, i) => {
                if (c.isDead) return;
                c.status = null; 
                if (c.ability === "burn_field" || c.ability === "cataclysm") {
                    let dmg = c.ability === "cataclysm" ? 20 : 10;
                    p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
                }
                if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
                if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
                if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
                if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
                if (c.ability === "event_horizon") {
                    const aliveEnemies = p.field.filter(e => !e.isDead);
                    if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
                }
                if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
                    let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
                    cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
                }
            });
            p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

            // ▼▼▼ お互いのHPをチェック ▼▼▼
            if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
            if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

            window.startPlayerTurn(false);

        }, delay + 500);
    }, 800); 
};

// ==========================================
// ★ 究極の演出パッチ：カードプレイ時のカットインアニメーション
// ==========================================

// ① 新機能：カードを画面中央にデカデカと表示するアニメーション関数
window.animateCardPlay = function(card, isPlayer, onComplete) {
    const battleUI = document.getElementById('tcg-battle-ui');
    if (!battleUI) { onComplete(); return; }

    // オートバトルのループなどが被らないようにシステムをロック
    if (window.TCG_BATTLE) window.TCG_BATTLE.isAnimating = true;

    // アニメーション用の専用コンテナを作成
    const animDiv = document.createElement('div');
    animDiv.style.cssText = `
        position: absolute; top: ${isPlayer ? '80%' : '10%'}; left: 50%;
        transform: translate(-50%, -50%) scale(0.1);
        opacity: 0; z-index: 35000; pointer-events: none;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    // カードを描画し、所属陣営の色で激しく光らせる
    const glowColor = isPlayer ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 84, 0.8)';
    animDiv.innerHTML = `<div style="box-shadow: 0 0 50px ${glowColor}, inset 0 0 20px ${glowColor}; border-radius: 12px; background: #222;">${window.renderCardHTML(card)}</div>`;
    battleUI.appendChild(animDiv);

    // 1. 画面中央に飛び出して拡大
    setTimeout(() => {
        animDiv.style.top = '50%';
        animDiv.style.transform = 'translate(-50%, -50%) scale(1.6)';
        animDiv.style.opacity = '1';
        
        // 2. 1秒間見せつけた後、スッと消えながら実処理を実行
        setTimeout(() => {
            animDiv.style.transform = `translate(-50%, ${isPlayer ? '30%' : '70%'}) scale(0.8)`;
            animDiv.style.opacity = '0';
            
            // 3. アニメーション完了後にコールバック（配置や魔法効果など）を実行
            setTimeout(() => {
                animDiv.remove();
                if (window.TCG_BATTLE) window.TCG_BATTLE.isAnimating = false;
                onComplete();
            }, 300);
        }, 1000); // ここが画面に留まる時間（ミリ秒）
    }, 50);
};

// ② プレイヤーが手札からカードを出した時の処理を上書き
// window.playCard = function(handIndex) {
//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }
    
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     // ★手札から減らして画面を更新（カードが手札から中央に飛んでいくように見せる）
//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     if (card.type === 'action') p.actionUsed = true;
//     window.TCG_BATTLE.selectedHandCardIndex = -1; 
//     window.renderBattleBoard(); 

//     // ★アニメーション関数を呼び出し、終わったら効果を発動！
//     window.animateCardPlay(card, true, () => {
//         if (card.type === 'item' || card.type === 'action') { 
//             card.isDead = true;
//             p.graveyard.push(card);
//             window.showBattleMessage(`✨ ${card.name} を使用！`); 
//             window.triggerPlayEffect(card, true); 
//         } else { 
//             card.canAttack = false; p.field.push(card); 
//             window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
//             window.triggerPlayEffect(card, true); 
//         }
//         if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
//     });
// };

// ③ 進化時の処理を上書き（進化もアニメーションさせる）
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             // ★手札から消して描画
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();

//             // ★進化カードのカットイン演出
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = false; p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`);
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// ④ CPUのターン処理を完全上書き（順番にカードを出してアニメーションさせる）
window.executeCPUTurn = function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const pField = window.TCG_BATTLE.player.field;
    pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    // ターン開始時効果
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();

    // アニメーションのためのシーケンシャル処理
    setTimeout(() => {
        let delay = 0;
        
        // --- 攻撃フェーズ ---
        cpu.field.forEach((cpuCard, cpuIndex) => {
            if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
            
            if (cpuCard.status === "charmed") {
                setTimeout(() => {
                    cpuCard.status = null; cpuCard.canAttack = false;
                    cpu.hp -= cpuCard.damage;
                    window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
                    window.renderBattleBoard();
                }, delay);
                delay += 800;
                return;
            }
            if (cpuCard.status === "stunned") return;

            setTimeout(() => {
                window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
                const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const validTargets = p.field.filter(c => c.ability !== "stealth"); 
                let targetType = 'player'; let tIndex = 0;
                const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
                
                if (tauntTargets.length > 0 && !isPierce) {
                    targetType = 'card'; tIndex = p.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]);
                } else if (validTargets.length > 0 && Math.random() > 0.5) {
                    targetType = 'card'; tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
                }
                window.executeAttack(targetType, tIndex);
            }, delay);
            delay += 800;
        });

        // --- 召喚フェーズ ---
        setTimeout(() => {
            // ★CPUが出す予定のカードを先にリストアップ（マナも消費させておく）
            let cardsToPlay = [];
            for (let i = cpu.hand.length - 1; i >= 0; i--) {
                let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
                if (cpu.currentMana >= actualCost) {
                    if (card.type === 'action' && cpu.actionUsed) continue;
                    if (card.evolvesFrom) {
                        let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                        if (targetIndex !== -1) {
                            cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                            cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        }
                    } else {
                        cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                        cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        if (card.type === 'action') cpu.actionUsed = true;
                    }
                }
            }

            // 手札が減った状態を先に描画
            if (cardsToPlay.length > 0) window.renderBattleBoard(); 

            // ★抽出したカードを「順番にカットインアニメーションさせながら」発動する
            const playNextCard = (idx) => {
                if (idx >= cardsToPlay.length) {
                    finishCPUTurn(); // すべて終わったらターン終了
                    return;
                }
                
                let playData = cardsToPlay[idx];
                let card = playData.card;
                
                window.animateCardPlay(card, false, () => {
                    if (playData.isEvo) {
                        card.canAttack = false; cpu.field[playData.targetIndex] = card; 
                        window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else {
                        if (card.type === 'item' || card.type === 'action') { 
                            card.isDead = true; cpu.graveyard.push(card);
                            window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        } else { 
                            card.canAttack = false; cpu.field.push(card); 
                            window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        }
                    }
                    // 効果の演出を待ってから次のカードへ
                    setTimeout(() => { playNextCard(idx + 1); }, 1000); 
                });
            };
            
            playNextCard(0); // ループ開始

            // --- ターン終了処理 ---
            function finishCPUTurn() {
                cpu.field.forEach((c, i) => {
                    if (c.isDead) return;
                    c.status = null; 
                    if (c.ability === "burn_field" || c.ability === "cataclysm") {
                        let dmg = c.ability === "cataclysm" ? 20 : 10;
                        p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
                    }
                    if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
                    if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
                    if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
                    if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
                    if (c.ability === "event_horizon") {
                        const aliveEnemies = p.field.filter(e => !e.isDead);
                        if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
                    }
                    if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
                        let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
                        cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
                    }
                });
                p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

                if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

                window.startPlayerTurn(false);
            }

        }, delay + 500);
    }, 800); 
};

// ==========================================
// ★ 演出テンポ改善 ＆ 手札虫眼鏡 パッチ
// ==========================================

// ① ポップアップメッセージの被り防止（位置の動的調整）
window.showBattleMessage = function(text, isError = false, duration = 2000, isEnemyLog = false, silent = false) {
    if (window.TCG_BATTLE && window.TCG_BATTLE.battleLog) {
        window.TCG_BATTLE.battleLog.push({ text: text.replace(/\n/g, " "), isError: isError, isEnemy: isEnemyLog });
    }
    
    if (!silent) {
        const ui = document.getElementById('tcg-battle-ui');
        if (!ui) return;
        
        // 既存のメッセージ要素を取得してY座標をズラす（重なり防止）
        const existingMsgs = document.querySelectorAll('.battle-msg');
        let topPos = 35 + (existingMsgs.length * 12);
        if (topPos > 70) topPos = 35; // 下にはみ出さないようループさせる
        
        const msg = document.createElement('div');
        msg.className = 'battle-msg';
        msg.innerHTML = text;
        msg.style.cssText = `
            position: absolute; top: ${topPos}%; left: 50%; transform: translate(-50%, -50%);
            background: ${isError ? 'rgba(220, 20, 20, 0.95)' : 'rgba(20, 120, 255, 0.95)'};
            color: #fff; padding: 12px 30px; border-radius: 12px; border: 2px solid #fff;
            font-size: 20px; font-weight: bold; pointer-events: none; z-index: 100000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5); text-align: center; white-space: pre-wrap;
            animation: slideUpFade ${duration}ms forwards;
        `;
        ui.appendChild(msg);
        setTimeout(() => msg.remove(), duration);
    }
};

// ② 手札の虫眼鏡＆拡大表示の対応
window.showCardDetailModal = function(ownerType, index) {
    let card = null;
    if (ownerType === 'player') card = window.TCG_BATTLE.player.field[index];
    else if (ownerType === 'cpu') card = window.TCG_BATTLE.cpu.field[index];
    else if (ownerType === 'player_hand') card = window.TCG_BATTLE.player.hand[index];
    if (!card) return;

    let modal = document.getElementById('tcg-card-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-card-detail-modal';
        // ★修正：z-indexを 40000 から 60000 に上げて、墓地UIより手前に出します
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 60000;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            cursor: pointer;
        `;
        modal.onclick = () => { modal.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    
    let titleStr = ownerType === 'player_hand' ? '手札' : (ownerType === 'player' ? '味方' : '敵');
    
    modal.innerHTML = `
        <div style="margin-bottom: 30px; color: #00BCD4; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">
            🔍 ${titleStr}のカード詳細
        </div>
        <div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(0, 188, 212, 0.6); border-radius: 12px; pointer-events: none;">
            ${window.renderCardHTML(card)}
        </div>
        <div style="margin-top: 100px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">
            画面のどこかをクリックして閉じる
        </div>
    `;
    modal.style.display = 'flex';
};

// 盤面描画関数にパッチ（手札に虫眼鏡を後付け追加）
const _originalRenderBattleBoard_forHand = window.renderBattleBoard;
window.renderBattleBoard = function() {
    _originalRenderBattleBoard_forHand();
    // 描画後に手札のHTMLをハックして虫眼鏡を追加する
    const handWraps = document.querySelectorAll('#tcg-battle-ui .tcg-card-wrap[onclick*="window.playCard"]');
    handWraps.forEach((wrap, index) => {
        if (!wrap.querySelector('.hand-magnifier')) {
            const mag = document.createElement('div');
            mag.className = 'hand-magnifier';
            mag.style.cssText = `position:absolute; top:-10px; right:-10px; background:#222; color:#00BCD4; border:2px solid #00BCD4; border-radius:50%; width:36px; height:36px; display:flex; justify-content:center; align-items:center; font-size:18px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:20;`;
            mag.title = "詳細を見る";
            mag.innerHTML = "🔍";
            mag.onclick = function(e) {
                e.stopPropagation();
                window.showCardDetailModal('player_hand', index);
            };
            wrap.appendChild(mag);
        }
    });
};

// ③ カードプレイ・進化時のメッセージ表示タイミングの分離
// アニメーション開始時（1秒前）に「出した」宣言をして、アニメ完了時に「効果」を出すようにします。
// window.playCard = function(handIndex) {
//     // ▼▼▼ セーブデータの古いtypeを最新データで強制上書きするパッチ ▼▼▼
//     const tempPlayer = window.TCG_BATTLE.player;
//     if (window.TCG_MASTER[tempPlayer.hand[handIndex].masterId]) {
//         tempPlayer.hand[handIndex].type = window.TCG_MASTER[tempPlayer.hand[handIndex].masterId].type;
//     }
//     if (window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         window.TCG_BATTLE.targetingHandIndex = -1; window.renderBattleBoard(); return;
//     }

//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }

//     // ▼▼▼ フィールドカード ▼▼▼
//     if (card.type === 'field') {
//         p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//         window.playFieldCard(card, true); 
//         return;
//     }

//     // ▼▼▼ アイテム・アクションカード ▼▼▼
//     if (card.type === 'item' || card.type === 'action') {
//         if (window.requiresTarget && window.requiresTarget(card)) {
//             if (p.field.length === 0) { window.showBattleMessage("対象にできる味方モンスターがいません", true); return; }
//             window.TCG_BATTLE.targetingHandIndex = handIndex;
//             window.showBattleMessage("🎯 対象にする味方モンスターを選んでください", false, 0);
//             window.renderBattleBoard();
//         } else {
//             p.currentMana -= actualCost; if (card.type === 'action') p.actionUsed = true;
//             p.hand.splice(handIndex, 1); 
//             window.executeSupportCard(card, null, true);
//         }
//         return;
//     }
    
//     // ▼▼▼ 進化モンスター ▼▼▼
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     // ▼▼▼ 通常モンスター ▼▼▼
//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
    
//     card.canAttack = (card.ability === "haste"); // 速攻チェック
//     p.field.push(card); 
//     window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
//     window.showVFX(`p-card-${p.field.length - 1}`, 'heal', '召喚!');
//     window.triggerPlayEffect(card, true);

//     // 森の加護チェック
//     if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_forest" && ["spirit", "seed", "beetle"].includes(card.type.split('_')[0])) {
//         card.maxHp += 20; card.hp += 20;
//     }

//     window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard();
//     if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
// };

// window.playCard = function(handIndex) {
//     if (window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         window.TCG_BATTLE.targetingHandIndex = -1; window.renderBattleBoard(); return;
//     }

//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }

//     // ▼▼▼ フィールドカード ▼▼▼
//     if (card.type === 'field') {
//         p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//         window.renderBattleBoard(); // 手札から消す
//         window.animateCardPlay(card, true, () => {
//             window.playFieldCard(card, true); 
//         });
//         return;
//     }

//     // ▼▼▼ アイテム・アクションカード ▼▼▼
//     if (card.type === 'item' || card.type === 'action') {
//         if (window.requiresTarget && window.requiresTarget(card)) {
//             if (p.field.length === 0) { window.showBattleMessage("対象にできる味方モンスターがいません", true); return; }
//             window.TCG_BATTLE.targetingHandIndex = handIndex;
//             window.showBattleMessage("🎯 対象にする味方モンスターを選んでください", false, 0);
//             window.renderBattleBoard();
//         } else {
//             p.currentMana -= actualCost; if (card.type === 'action') p.actionUsed = true;
//             p.hand.splice(handIndex, 1); 
//             window.renderBattleBoard(); // 手札から消す
//             window.animateCardPlay(card, true, () => {
//                 window.executeSupportCard(card, null, true);
//             });
//         }
//         return;
//     }
    
//     // ▼▼▼ 進化モンスター ▼▼▼
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => c.type === card.evolvesFrom);
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     // ▼▼▼ 通常モンスター ▼▼▼
//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     card.canAttack = (card.ability === "haste"); 
//     p.field.push(card); 
//     window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
//     window.showVFX(`p-card-${p.field.length - 1}`, 'heal', '召喚!');
//     window.triggerPlayEffect(card, true);

//     if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_forest" && ["spirit", "seed", "beetle"].includes(card.type.split('_')[0])) {
//         card.maxHp += 20; card.hp += 20;
//     }

//     window.TCG_BATTLE.selectedHandCardIndex = -1; window.renderBattleBoard();
//     if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
// };

// 

// window.playCard = function(handIndex) {
//     // ▼ 修正：isAnimatingを触らず、専用の「playLocked」で連打を完全に防ぐ
//     if (window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating || window.TCG_BATTLE.playLocked || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         window.TCG_BATTLE.targetingHandIndex = -1; 
//         let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
//         window.renderBattleBoard(); return;
//     }

//     const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
//     if (window.TCG_MASTER[card.masterId]) card.type = window.TCG_MASTER[card.masterId].type;
//     const actualCost = window.getActualCost(p, card);
    
//     if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
//     if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }

//     // フィールドカード
//     if (card.type === 'field') {
//         window.TCG_BATTLE.playLocked = true; // カスタムロック開始
//         p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//         window.renderBattleBoard(); 
//         window.animateCardPlay(card, true, () => { 
//             window.playFieldCard(card, true); 
//             window.TCG_BATTLE.playLocked = false; // ロック解除
//         });
//         return;
//     }

//     // アイテム・アクションカード
//     if (card.type === 'item' || card.type === 'action') {
//         if (window.requiresTarget && window.requiresTarget(card)) {
//             if (p.field.length === 0) { window.showBattleMessage("対象にできる味方モンスターがいません", true); return; }
//             window.TCG_BATTLE.targetingHandIndex = handIndex;
//             window.showBattleMessage("🎯 対象にする味方モンスターを選んでください", false, 0);
            
//             let ui = document.getElementById('tcg-target-ui');
//             if (!ui) {
//                 ui = document.createElement('div');
//                 ui.id = "tcg-target-ui";
//                 ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #00BCD4; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(0,188,212,0.6); pointer-events:none;`;
//                 ui.innerHTML = `
//                     <div style="color:#00BCD4; font-size:22px; font-weight:bold; margin-bottom:5px;">🎯 対象を選択中...</div>
//                     <div style="color:#ddd; font-size:14px;">魔法をかける味方モンスターをクリックしてください<br>(もう一度手札をクリックでキャンセル)</div>
//                 `;
//                 document.body.appendChild(ui);
//             }
//             window.renderBattleBoard();
//         } else {
//             window.TCG_BATTLE.playLocked = true;
//             p.currentMana -= actualCost; if (card.type === 'action') p.actionUsed = true;
//             p.hand.splice(handIndex, 1); 
//             window.renderBattleBoard(); 
//             window.animateCardPlay(card, true, () => { 
//                 window.executeSupportCard(card, null, true); 
//                 window.TCG_BATTLE.playLocked = false;
//             });
//         }
//         return;
//     }
    
//     // 進化（対象選択モードへ）
//     if (card.evolvesFrom) {
//         const canEvolve = p.field.some(c => window.checkCanEvolve(c, card));
//         if (!canEvolve) {
//             const evoName = window.getEvolvesFromName(card.evolvesFrom);
//             window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
//         }
//         if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
//             window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         } else {
//             window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
//             window.showBattleMessage("✨ 進化させるモンスターを選んでください！\n(もう一度押すとキャンセル)");
//         }
//         window.renderBattleBoard(); return;
//     }

//     // 通常モンスター
//     window.TCG_BATTLE.playLocked = true;
//     p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
//     window.renderBattleBoard(); 

//     window.animateCardPlay(card, true, () => {
//         card.canAttack = (card.ability === "haste"); 
//         p.field.push(card); 
//         window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
//         window.showVFX(`p-card-${p.field.length - 1}`, 'heal', '召喚!');
//         window.triggerPlayEffect(card, true);

//         if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_forest" && ["spirit", "seed", "beetle"].includes(card.type.split('_')[0])) {
//             card.maxHp += 20; card.hp += 20;
//         }

//         window.TCG_BATTLE.selectedHandCardIndex = -1; 
//         window.renderBattleBoard(); 
//         window.TCG_BATTLE.playLocked = false;
//         if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
//     });
// };

window.playCard = function(handIndex) {
    if (window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    
    // 再クリックでのキャンセル処理
    if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
        window.TCG_BATTLE.targetingHandIndex = -1; 
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.renderBattleBoard(); return;
    }

    const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
    if (window.TCG_MASTER[card.masterId]) card.type = window.TCG_MASTER[card.masterId].type;
    const actualCost = window.getActualCost(p, card);
    
    if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }
    if (card.type === 'action' && p.actionUsed) { window.showBattleMessage("⚠️ アクションカードは1ターンに1回までしか使えません！", true); return; }

    // フィールドカード
    if (card.type === 'field') {
        window.TCG_BATTLE.isAnimating = true;
        window.animateCardPlay(card, true, () => { 
            p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
            window.playFieldCard(card, true); 
            window.TCG_BATTLE.isAnimating = false;
        });
        return;
    }

    // アイテム・アクションカード
    if (card.type === 'item' || card.type === 'action') {
        if (window.requiresTarget && window.requiresTarget(card)) {
            if (p.field.length === 0) { window.showBattleMessage("対象にできる味方モンスターがいません", true); return; }
            window.TCG_BATTLE.targetingHandIndex = handIndex;
            
            // ▼▼▼ 復活：キャンセルボタン付きのリッチUI ▼▼▼
            let ui = document.getElementById('tcg-target-ui');
            if (!ui) {
                ui = document.createElement('div');
                ui.id = "tcg-target-ui";
                ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #00BCD4; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(0,188,212,0.6); pointer-events:auto;`;
                ui.innerHTML = `
                    <div style="color:#00BCD4; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div>
                    <div style="color:#ddd; font-size:14px; margin-bottom:15px;">魔法をかける味方モンスターをクリックしてください</div>
                    <button id="btn-cancel-magic" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>
                `;
                document.body.appendChild(ui);
                
                document.getElementById('btn-cancel-magic').onclick = () => {
                    window.TCG_BATTLE.targetingHandIndex = -1;
                    let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();
                    window.renderBattleBoard();
                };
            }
            window.renderBattleBoard();
        } else {
            window.TCG_BATTLE.isAnimating = true;
            window.animateCardPlay(card, true, () => { 
                p.currentMana -= actualCost; if (card.type === 'action') p.actionUsed = true;
                p.hand.splice(handIndex, 1); 
                window.executeSupportCard(card, null, true); 
                window.TCG_BATTLE.isAnimating = false;
            });
        }
        return;
    }
    
    // 進化
    if (card.evolvesFrom) {
        const canEvolve = p.field.some(c => window.checkCanEvolve(c, card));
        if (!canEvolve) {
            const evoName = window.getEvolvesFromName(card.evolvesFrom);
            window.showBattleMessage(`⚠️ 盤面に進化元の\n「${evoName}」がいません！`, true); return;
        }
        if (window.TCG_BATTLE.selectedHandCardIndex === handIndex) {
            window.TCG_BATTLE.selectedHandCardIndex = -1; 
            let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        } else {
            window.TCG_BATTLE.selectedHandCardIndex = handIndex; window.TCG_BATTLE.selectedAttackerIndex = -1; 
            
            // ▼▼▼ 追加：進化用のキャンセルボタン付きリッチUI ▼▼▼
            let ui = document.getElementById('tcg-target-ui');
            if (!ui) {
                ui = document.createElement('div');
                ui.id = "tcg-target-ui";
                ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #00BCD4; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(0,188,212,0.6); pointer-events:auto;`;
                ui.innerHTML = `
                    <div style="color:#00BCD4; font-size:22px; font-weight:bold; margin-bottom:10px;">✨ 進化先を選択中...</div>
                    <div style="color:#ddd; font-size:14px; margin-bottom:15px;">進化させる盤面のモンスターをクリックしてください</div>
                    <button id="btn-cancel-evo" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>
                `;
                document.body.appendChild(ui);
                
                document.getElementById('btn-cancel-evo').onclick = () => {
                    window.TCG_BATTLE.selectedHandCardIndex = -1;
                    let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();
                    window.renderBattleBoard();
                };
            }
        }
        window.renderBattleBoard(); return;
    }

    // 通常モンスター
    window.TCG_BATTLE.isAnimating = true; 
    window.animateCardPlay(card, true, () => {
        p.currentMana -= actualCost; p.hand.splice(handIndex, 1); // 演出後に手札から消す
        card.canAttack = (card.ability === "haste"); 
        p.field.push(card); 
        window.showBattleMessage(`🛡️ ${card.name} を配置！`); 
        window.showVFX(`p-card-${p.field.length - 1}`, 'heal', '召喚!');
        window.triggerPlayEffect(card, true);

        if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_forest" && ["spirit", "seed", "beetle"].includes(card.type.split('_')[0])) {
            card.maxHp += 20; card.hp += 20;
        }

        window.TCG_BATTLE.selectedHandCardIndex = -1; 
        window.renderBattleBoard(); 
        window.TCG_BATTLE.isAnimating = false; 
        if (window.TCG_BATTLE.cpu.hp <= 0) { setTimeout(() => { alert("🎉 YOU WIN!! 相手のHPを0にしました！"); document.getElementById('tcg-battle-ui').style.display = 'none'; }, 1000); }
    });
};

// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();

//             // ★ アニメーション開始前に進化宣言メッセージを出す
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);

//             window.animateCardPlay(evoCard, true, () => {
//                 // ★ アニメーション完了後に、進化効果を発動させる
//                 evoCard.canAttack = false; p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// ==========================================
// ★ ダイレクトアタック強化 ＆ 進化バッジ表示バグ修正パッチ
// ==========================================

// ① 進化バッジ（闇+など）が正しく表示されないバグの修正
window.getCardTypeName = function(type) {
    // ★修正：上位の進化から順に判定しないと、名前に内包されて誤判定されてしまう
    if (type.includes('type1_4')) return '闇+++';
    if (type.includes('type1_3')) return '闇++';
    if (type.includes('type1_2')) return '闇+';
    if (type.includes('type1')) return '闇';
    
    if (type.includes('type2_4')) return '美+++';
    if (type.includes('type2_3')) return '美++';
    if (type.includes('type2_2')) return '美+';
    if (type.includes('type2')) return '美';
    
    if (type.includes('type3_5')) return '賢++++';
    if (type.includes('type3_4')) return '賢+++';
    if (type.includes('type3_3')) return '賢++';
    if (type.includes('type3_2')) return '賢+';
    if (type.includes('type3')) return '賢';
    
    if (type.includes('type4_4')) return '活+++';
    if (type.includes('type4_3')) return '活++';
    if (type.includes('type4_2')) return '活+';
    if (type.includes('type4')) return '活';
    
    if (type.includes('type5_4')) return '老+++';
    if (type.includes('type5_3')) return '老++';
    if (type.includes('type5_2')) return '老+';
    if (type.includes('type5')) return '老';
    
    if (type === 'robot') return '機';
    
    const map = {
        'dragon':'竜', 'magician':'魔', 'spirit':'精', 'stone':'岩',
        'machine':'械', 'ghost':'霊', 'bird':'鳥', 'beetle':'虫',
        'seed':'草', 'balloon':'風', 'item':'具', 'action':'技', 'field':'地'
    };
    return map[type] || '無';
};

// ② ダイレクトアタックの超リッチなカットイン演出関数
window.showDirectAttackCutin = function(isPlayer, isPierce) {
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;
    
    const daText = document.createElement('div');
    const textStr = isPierce ? "PIERCING ATTACK!!" : "DIRECT ATTACK!!";
    const color = isPlayer ? "#4CAF50" : "#ff5252";
    const glow = isPlayer ? "#00E676" : "#ff0000";
    
    // 斜体、ドロップシャドウ、極太フォントでカードゲームらしさを全開に
    daText.innerHTML = `<div style="font-size: 70px; font-weight: 900; font-style: italic; color: ${color}; text-shadow: 0 0 30px ${glow}, 4px 4px 0px #fff, -2px -2px 0px #000; transform: skewX(-15deg); letter-spacing: 4px; white-space: nowrap;">${textStr}</div>`;
    daText.style.cssText = `position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.1); opacity: 0; z-index: 45000; pointer-events: none; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    
    ui.appendChild(daText);
    
    // ログには残す（サイレントモード）
    window.showBattleMessage(`💥 ${isPierce ? '貫通' : 'ダイレクト'}アタック！！`, !isPlayer, 2000, !isPlayer, true);

    setTimeout(() => { 
        daText.style.transform = 'translate(-50%, -50%) scale(1.2)'; 
        daText.style.opacity = '1'; 
    }, 50);
    
    setTimeout(() => { 
        daText.style.transform = 'translate(-50%, -50%) scale(1.5)'; 
        daText.style.opacity = '0'; 
        setTimeout(() => daText.remove(), 300); 
    }, 1000);
};

// ==========================================
// ★ 進化バッジ修正 ＆ 攻撃演出の完全修復パッチ
// ==========================================

// ① 進化バッジの誤表示を修正（上位進化から判定する）
window.getCardTypeName = function(type) {
    if (type.includes('type1_4')) return '闇+++';
    if (type.includes('type1_3')) return '闇++';
    if (type.includes('type1_2')) return '闇+';
    if (type.includes('type1')) return '闇';
    
    if (type.includes('type2_4')) return '美+++';
    if (type.includes('type2_3')) return '美++';
    if (type.includes('type2_2')) return '美+';
    if (type.includes('type2')) return '美';
    
    if (type.includes('type3_5')) return '賢++++';
    if (type.includes('type3_4')) return '賢+++';
    if (type.includes('type3_3')) return '賢++';
    if (type.includes('type3_2')) return '賢+';
    if (type.includes('type3')) return '賢';
    
    if (type.includes('type4_4')) return '活+++';
    if (type.includes('type4_3')) return '活++';
    if (type.includes('type4_2')) return '活+';
    if (type.includes('type4')) return '活';
    
    if (type.includes('type5_4')) return '老+++';
    if (type.includes('type5_3')) return '老++';
    if (type.includes('type5_2')) return '老+';
    if (type.includes('type5')) return '老';
    
    if (type === 'robot') return '機';
    
    const map = {
        'dragon':'竜', 'magician':'魔', 'spirit':'精', 'stone':'岩',
        'machine':'械', 'ghost':'霊', 'bird':'鳥', 'beetle':'虫',
        'seed':'草', 'balloon':'風', 'item':'具', 'action':'技', 'field':'地'
    };
    return map[type] || '無';
};

// ② ダイレクトアタックのカットイン演出関数（安全設計）
window.showDirectAttackCutin = function(isPlayer, isPierce) {
    try {
        const ui = document.getElementById('tcg-battle-ui');
        if (!ui) return;
        
        const daText = document.createElement('div');
        const textStr = isPierce ? "PIERCING ATTACK!!" : "DIRECT ATTACK!!";
        const color = isPlayer ? "#4CAF50" : "#ff5252";
        const glow = isPlayer ? "#00E676" : "#ff0000";
        
        daText.innerHTML = `<div style="font-size: 70px; font-weight: 900; font-style: italic; color: ${color}; text-shadow: 0 0 30px ${glow}, 4px 4px 0px #fff, -2px -2px 0px #000; transform: skewX(-15deg); letter-spacing: 4px; white-space: nowrap;">${textStr}</div>`;
        daText.style.cssText = `position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.1); opacity: 0; z-index: 45000; pointer-events: none; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
        
        ui.appendChild(daText);
        
        // ログには残す（サイレントモード）
        window.showBattleMessage(`💥 ${isPierce ? '貫通' : 'ダイレクト'}アタック！！`, !isPlayer, 2000, !isPlayer, true);

        setTimeout(() => { 
            daText.style.transform = 'translate(-50%, -50%) scale(1.2)'; 
            daText.style.opacity = '1'; 
        }, 50);
        
        setTimeout(() => { 
            daText.style.transform = 'translate(-50%, -50%) scale(1.5)'; 
            daText.style.opacity = '0'; 
            setTimeout(() => daText.remove(), 300); 
        }, 1000);
    } catch (e) { console.error("Cutin Error:", e); }
};

// ==========================================
// ★ 進化バッジ色分け ＆ コイントス復活 パッチ
// ==========================================

// ① コイントスのアニメーションCSSを復活
if (!document.getElementById('tcg-cointoss-styles')) {
    const style = document.createElement('style');
    style.id = 'tcg-cointoss-styles';
    style.innerHTML = `
        @keyframes coinFlip {
            0% { transform: rotateY(0deg) scale(1); }
            50% { transform: rotateY(900deg) scale(1.5); }
            100% { transform: rotateY(1800deg) scale(1); }
        }
        .coin-flip-anim { animation: coinFlip 2.5s cubic-bezier(0.2, 0.8, 0.4, 1) forwards; }
    `;
    document.head.appendChild(style);
}

// ② 進化元をマスターデータから正確に判定して、名前を表示する
// window.getEvolvesFromName = function(evolvesFromType) {
//     const map = {
//         'robot': '基本ロボット', 'robot_type1': 'キリング系', 'robot_type2': 'アイドル系', 'robot_type3': 'アナリティクス系', 'robot_type3_2': 'マザー系', 'robot_type4': 'タンク系', 'robot_type4_2': 'アサルト系', 'robot_type5': 'スクラップ系',
//         'dragon': '基本ドラゴン', 'dragon_type4': 'ワイバーン系', 'dragon_type1': '邪竜系', 'dragon_type5': '古竜系', 'dragon_type3': '水竜系', 'dragon_type2': '宝石竜系',
//         'magician': '基本魔法使い', 'magician_type4': '武闘派系', 'magician_type1': '魔女系', 'magician_type5': '老魔道士系', 'magician_type2': '幻術師系', 'magician_type3': '学者系',
//         'ghost': '基本ゴースト', 'ghost_type4': 'ポルターガイスト系', 'ghost_type5': '古霊系', 'ghost_type1': '悪霊系', 'ghost_type3': '学者幽霊系', 'ghost_type2': '聖霊系',
//         'seed': '基本つぼみ', 'seed_type4': '野生植物系', 'seed_type1': '毒草系', 'seed_type5': '老木系', 'seed_type3': '知識の葉系', 'seed_type2': 'アロマ系',
//         'spirit': '基本精霊', 'spirit_type4': 'ゴーレム系', 'spirit_type5': '枯葉系', 'spirit_type1': '毒キノコ系', 'spirit_type3': '記録精霊系', 'spirit_type2': '妖精系',
//         'stone': '基本ゴーレム', 'stone_type4': 'マグマ系', 'stone_type5': '遺跡系', 'stone_type1': 'ガーゴイル系', 'stone_type3': 'ルーン石系', 'stone_type2': 'クリスタル系',
//         'machine': '基本ぜんまい', 'machine_type4': 'スチーム系', 'machine_type5': 'アンティーク系', 'machine_type1': '呪い人形系', 'machine_type3': 'エンジン系', 'machine_type2': 'オルゴール系',
//         'bird': '基本鳥', 'bird_type4': '猛禽系', 'bird_type5': 'フクロウ系', 'bird_type1': 'カラス系', 'bird_type3': 'ルーン鳥系', 'bird_type2': '輝鳥系',
//         'beetle': '基本かぶとむし', 'beetle_type4': '巨角系', 'beetle_type5': '琥珀系', 'beetle_type1': '狂刃系', 'beetle_type3': '指揮官系', 'beetle_type2': '宝石虫系',
//         'balloon': '基本風船', 'balloon_type4': 'マッスル系', 'balloon_type1': 'スモッグ系', 'balloon_type5': 'デフレート系', 'balloon_type3': '気象系', 'balloon_type2': 'シャボン系'
//     };
//     // ★修正：mapにない場合、マスターデータから直接名前を逆引きする
//     if (map[evolvesFromType]) return map[evolvesFromType];
//     const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === evolvesFromType);
//     if (parentKey) return window.TCG_MASTER[parentKey].name;
    
//     return evolvesFromType; 
// };

// ③ 賢いバッジ生成ロジック（+判定の正確化と、種族・属性ごとの色分け）
window.getCardBadgeInfo = function(card) {
    let text = '無'; let color = '#FFF';

    // 1. サポートカード
    if (card.type === 'item') return { text: '具', color: '#8D6E63' };
    if (card.type === 'action') return { text: '技', color: '#FFB74D' };
    if (card.type === 'field') return { text: '地', color: '#4DB6AC' };

    // 2. 進化の段階を判定
    let isStage1 = false; let isStage2 = false;
    if (card.evolvesFrom) {
        const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === card.evolvesFrom);
        const parent = parentKey ? window.TCG_MASTER[parentKey] : null;
        if (parent && parent.evolvesFrom) isStage2 = true;
        else isStage1 = true;
    }

    // 3. 属性（進化先）の判定
    let attr = '';
    if (card.type.includes('type1')) { attr = '闇'; color = '#9C27B0'; }
    else if (card.type.includes('type2')) { attr = '美'; color = '#E91E63'; }
    else if (card.type.includes('type3')) { attr = '賢'; color = '#2196F3'; }
    else if (card.type.includes('type4')) { attr = '活'; color = '#FF5722'; }
    else if (card.type.includes('type5')) { attr = '老'; color = '#795548'; }

    if (attr) {
        if (isStage2) return { text: attr + '+', color: color };
        if (isStage1) return { text: attr, color: color };
        return { text: attr, color: color }; 
    }

    // 4. 基本種族
    const raceMap = {
        'dragon': { t: '竜', c: '#FFC107' }, 'magician': { t: '魔', c: '#9C27B0' },
        'spirit': { t: '精', c: '#4CAF50' }, 'stone': { t: '岩', c: '#795548' },
        'machine': { t: '械', c: '#607D8B' }, 'ghost': { t: '霊', c: '#673AB7' },
        'bird': { t: '鳥', c: '#03A9F4' }, 'beetle': { t: '虫', c: '#8BC34A' },
        'seed': { t: '草', c: '#8BC34A' }, 'balloon': { t: '風', c: '#00BCD4' },
        'robot': { t: '機', c: '#9E9E9E' }
    };
    if (raceMap[card.type]) return { text: raceMap[card.type].t, color: raceMap[card.type].c };

    return { text: '無', color: '#999' };
};

// ④ UI描画の完全上書き（新しいカラフルなバッジを適用）
window.renderCardHTML = function(card) {
    if (typeof window.TCG_MASTER !== 'undefined') {
        let masterData = null;
        if (card.masterId && window.TCG_MASTER[card.masterId]) {
            masterData = window.TCG_MASTER[card.masterId];
        }
        if (!masterData || masterData.sx === undefined) {
            const safeName = (card.name || "").trim();
            const adjustedKey = Object.keys(window.TCG_MASTER).find(k => {
                const target = window.TCG_MASTER[k];
                return target && target.name && target.name.trim() === safeName && target.sx !== undefined;
            });
            if (adjustedKey) {
                masterData = window.TCG_MASTER[adjustedKey]; 
            } else {
                const fallbackKey = Object.keys(window.TCG_MASTER).find(k => {
                    const target = window.TCG_MASTER[k];
                    return target && target.name && target.name.trim() === safeName;
                });
                if (fallbackKey) masterData = window.TCG_MASTER[fallbackKey];
            }
        }
        if (masterData) {
            if (masterData.sx !== undefined) card.sx = masterData.sx;
            if (masterData.sy !== undefined) card.sy = masterData.sy;
            if (masterData.sw !== undefined) card.sw = masterData.sw;
            if (masterData.sh !== undefined) card.sh = masterData.sh;
            if (masterData.scaleX !== undefined) card.scaleX = masterData.scaleX;
            if (masterData.scaleY !== undefined) card.scaleY = masterData.scaleY;
            if (masterData.image) card.image = masterData.image; 
        }
    }

    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;

    let abilityText = card.abilityTextOverride || "";
    if (!abilityText) {
        const texts = {
            "taunt": "【かばう】(相手の攻撃を代わりに受ける)", "stealth": "【潜伏】(攻撃するまでターゲットにされない)",
            "heal_self": "【修復】(自分のHPを小回復する)", "draw_card": "【ドロー】(山札からカードを引く)",
            "flight": "【飛行】(かばうを無視して攻撃できる)", "mana_ramp": "【成長】(自分の最大マナを+1する)",
            "pierce_recoil": "【暴走回路】(かばう無視・攻撃時自身にダメ)", "aoe_heal_play": "【全体回復】(登場時、味方全員を回復)",
            "start_draw": "【超演算】(自ターン開始時、1枚ドロー)", "aura_action_cost": "【万能魔法】(場にいる間、アクションコスト-1)",
            "heavy_armor": "【重装甲】(受けるダメージを常に-10)", "snipe_play": "【殲滅】(登場時、ランダムな敵にダメージ)",
            "end_heal": "【悠久の風化】(ターン終了時、自身のHP回復)", "god_strike": "【神の一撃】(貫通・攻撃時敵1体即死)",
            "cyber_miracle": "【電脳の奇跡】(ターン終了時、味方全回復)", "dimension_hack": "【超次元ハック】(登場時、敵手札破壊＆ドロー)",
            "all_zero_cost": "【森羅万象】(場にいる間、アクションのコスト0)", "absolute_field": "【絶対領域】(受けるあらゆるダメージを1にする)",
            "crimson_end": "【終末の紅蓮】(登場時、敵全体に50ダメ)", "star_breath": "【星の息吹】(ターン開始時マナ+2＆リーダー回復)",
            "perfect_predation": "【完全捕食】(登場時、敵1体を破壊し吸収)", "nightmare_rule": "【悪夢の君臨】(登場時、全敵のHPを強制半減)",
            "star_hope": "【希望の星】(登場時、味方全回復＆かばう付与)", "divine_grace": "【神の恩寵】(ターン終了時、破壊された味方蘇生)",
            "heaven_punishment": "【天罰】(登場時、全敵モンスターに50ダメージ)", "event_horizon": "【事象の地平】(ターン終了時、敵1体を山札に戻す)",
            "truth_overwrite": "【真理の書換】(登場時、3枚ドロー＆最大マナ+3)", "heaven_judgement": "【天の裁き】(ターン開始時、敵全体に20ダメ)",
            "absolute_fortress": "【絶対要塞】(受けるダメージを常に-20する)", "dimension_drill": "【次元穿孔】(貫通・リーダーにも同じダメを与える)",
            "super_gravity": "【超重力】(登場時、自身以外の全モンスターに100ダメ)", "eternal_rebirth": "【悠久の再生】(破壊された時、一度だけHP満タンで復活)",
            "burn_field": "【焦土化】(ターン終了時、敵全体に少ダメージ)", "cataclysm": "【天変地異】(ターン終了時、敵全体に貫通大ダメージ)",
            "spell_echo": "【魔法反響】(登場・スキル使用時、ダメージ増幅)", "mana_refund": "【魔力還元】(登場・スキル使用時、マナが回復)",
            "charm_enemy": "【魅惑】(登場時、敵1体を確率で「魅了」する)", "mass_charm": "【全体魅了】(登場時、敵全体を確率で「魅了」する)",
            "curse_death": "【道連れ】(破壊された時、敵リーダーに大ダメージ)", "soul_drain": "【魂吸収】(攻撃で与えたダメージの半分を回復)",
            "soul_reap": "【魂刈り】(攻撃時、相手の最大HPも減少させる)", "thorns": "【茨の鎧】(攻撃を受けた時、相手にも反射ダメージ)",
            "void_counter": "【虚無】(一度だけダメージを無効化し倍返しする)", "devour": "【捕食】(敵を倒した時、自身のHPと攻撃力UP)",
            "apex_predator": "【頂点捕食】(敵を倒した時、ステータスが倍増する)", "burst_spores": "【破裂胞子】(破壊された時、味方全体を回復＆強化)",
            "absolute_sanctuary": "【絶対聖域】(ターン終了時、味方全体を回復する)", "mana_sovereign": "【魔力の支配者】(場にいる間、味方の全コスト半減)",
            "impregnable_armor": "【難攻不落】(30以下のダメージを完全に無効化する)", "pure_aegis": "【純真の盾】(かばう＋あらゆる状態異常を無効化)",
            "infinite_gear": "【無限歯車】(ターン開始時、手札が5枚になるようドロー)", "doomsday_detonation": "【終末起爆】(登場時、盤面全てを消し飛ばす)",
            "rebirth": "【輪廻転生】(破壊された時、一度だけ復活し敵を焼く)", "absolute_evasion": "【絶対回避】(敵からの攻撃を高い確率で無効化する)",
            "piercing_juggernaut": "【暴走貫通】(攻撃するたび火力が上がり、かばう無視)", "fossilize": "【化石化】(登場時、敵1体を確率で「スタン」させる)",
            "mass_bounce": "【全バウンス】(破壊された時、全敵を山札に戻す)", "nova_burst": "【超新星爆発】(破壊された時、敵全体に最大HP分ダメ)",
            "time_manipulation": "【時空操作】(登場時、行動済みの味方を未行動にする)", "raise_dead": "【死霊復活】(ターン終了時、破壊された味方を半分の力で蘇生)"
        };
        abilityText = texts[card.ability] || "";
    }

    let imgPath = card.image;
    if (!imgPath || imgPath === 'characters.png') {
        imgPath = null;
    } else if (typeof imageSources !== 'undefined' && imageSources[imgPath]) {
        imgPath = imageSources[imgPath]; 
    }

    const flavorText = (card.type === 'item' || card.type === 'action' || card.type === 'field')
        ? "冒険の途中で見つけた、かけがえのない記憶の欠片。" 
        : "AIがこれまでの人生で培ってきた、確かな成長の証。";

    let displayCost = card.cost;
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        let owner = window.TCG_BATTLE.player.hand.includes(card) ? window.TCG_BATTLE.player : null;
        if (!owner && window.TCG_BATTLE.cpu.hand.includes(card)) owner = window.TCG_BATTLE.cpu;
        if (owner) displayCost = window.getActualCost(owner, card);
    }
    const costColor = displayCost < card.cost ? "#4CAF50" : "#FFD700";
    
    // ★新しいバッジ生成システム！
    const badge = window.getCardBadgeInfo(card);

    let html = `<div class="tcg-card" style="width: 180px; height: 260px; background-color: #222; border: 4px solid #555; border-radius: 12px; position: relative; font-family: sans-serif; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; user-select: none;">`;

    if (card.status === 'stunned' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:5%; background:#795548; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(-15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">🪨 化石化</div>`;
    }
    if (card.status === 'charmed' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:15%; background:#E91E63; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">💕 魅了</div>`;
    }

    if (isUnlocked) {
        html += `<div style="position: absolute; top: 6px; left: 6px; width: 28px; height: 28px; background: ${costColor}; color: #000; border-radius: 50%; font-weight: bold; font-size: 18px; display: flex; justify-content: center; align-items: center; border: 2px solid #FFF; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${displayCost}</div>`;
    }

    if (card.sx !== undefined) {
        const scX = card.scaleX !== undefined ? card.scaleX : 1.0;
        const scY = card.scaleY !== undefined ? card.scaleY : 1.0;
        const sw = card.sw || 50; const sh = card.sh || 50;
        const sx = card.sx || 0; const sy = card.sy || 0;
        let imgStyle = imgPath 
            ? `background-image: url('${imgPath}'); background-position: ${-sx}px ${-sy}px; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111);`; 
        html += `
        <div style="width: 100%; height: 120px; background-color: #1a1a1a; overflow: hidden; display: flex; justify-content: center; align-items: center; position: relative; border-bottom: 3px solid #444;">
            <div style="width: ${sw}px; height: ${sh}px; ${imgStyle} transform: scale(${scX}, ${scY}); transform-origin: center center; flex-shrink: 0;">
                ${!imgPath ? '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;">NO IMAGE</div>' : ''}
            </div>
        </div>`;
    } else {
        const col = (card.imageIndex || 0) % 3; const row = Math.floor((card.imageIndex || 0) / 3);
        const finalPosX = (col * 50) + (card.offsetX || 0); const finalPosY = (row * 25) + (card.offsetY || 0); 
        const zoomX = card.zoomX || 300; const zoomY = card.zoomY || 510;
        let imgStyle = imgPath
            ? `background-image: url('${imgPath}'); background-size: ${zoomX}% ${zoomY}%; background-position: ${finalPosX}% ${finalPosY}%; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111); display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;`;
        html += `<div style="width: 100%; height: 120px; ${imgStyle} border-bottom: 3px solid #444;">${!imgPath ? 'NO IMAGE' : ''}</div>`;
    }

    // ★ バッジのカラーを動的に反映！
    html += `
        <div style="padding: 4px 8px; font-weight: bold; font-size: 14px; background: linear-gradient(to right, #444, #222); border-bottom: 2px solid #111; text-shadow: 1px 1px 2px #000; display: flex; justify-content: space-between; align-items: center;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${card.name}</span>
            ${isUnlocked ? `<span style="font-size: 11px; background: rgba(0,0,0,0.6); color: ${badge.color}; padding: 2px 5px; border-radius: 4px; border: 1px solid ${badge.color}; margin-left: 4px; white-space: nowrap;">${badge.text}</span>` : ''}
        </div>`;

    if (isUnlocked) {
        html += `
        <div style="flex: 1; padding: 6px; padding-bottom: 30px; font-size: 11px; color: #ddd; background: #2a2a2a; display: flex; flex-direction: column; gap: 4px;">
            ${abilityText ? `<div style="color: #FF9800; font-weight: bold; font-size: 10px;">${abilityText}</div>` : ''}
            <div style="margin-top: auto; padding-top: 4px; border-top: 1px solid #444;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div style="display:flex; flex-direction:column; gap:3px;">
                        <span style="display:inline-block; background:#00BCD4; color:#fff; border-radius:4px; padding:2px 4px; font-size:10px; width:fit-content;">コスト ${card.skillCost}</span>
                        <span style="font-weight:bold; font-size:12px; color:#fff;">${card.skillName}</span>
                    </div>
                    ${card.damage > 0 ? `<div style="color:#ff5252; font-weight:bold; font-size:13px; white-space:nowrap;">${card.damage} ダメージ</div>` : ''}
                </div>
            </div>
        </div>
        <div style="position: absolute; bottom: -4px; right: -4px; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 8px 0 0 0; font-weight: bold; font-size: 16px; border: 2px solid #333; border-right: none; border-bottom: none; box-shadow: -2px -2px 4px rgba(0,0,0,0.3); z-index: 2;">HP ${card.hp}</div>`;
    } else {
        html += `<div style="flex: 1; padding: 15px 10px; font-size: 12px; line-height: 1.6; color: #bbb; background: #2a2a2a; text-align: center; display: flex; align-items: center; justify-content: center;"><span style="font-style: italic;">「${flavorText}」</span></div>`;
    }
    html += `</div>`;
    return html;
};

// ==========================================
// ★ 進化バッジ複数表示（種族＋進化系）対応 ＆ 演出強化パッチ
// ==========================================

// ① コイントスのアニメーションCSSを復活
if (!document.getElementById('tcg-cointoss-styles')) {
    const style = document.createElement('style');
    style.id = 'tcg-cointoss-styles';
    style.innerHTML = `
        @keyframes coinFlip {
            0% { transform: rotateY(0deg) scale(1); }
            50% { transform: rotateY(900deg) scale(1.5); }
            100% { transform: rotateY(1800deg) scale(1); }
        }
        .coin-flip-anim { animation: coinFlip 2.5s cubic-bezier(0.2, 0.8, 0.4, 1) forwards; }
    `;
    document.head.appendChild(style);
}

// ② 賢いバッジ生成ロジック（配列で複数バッジを返すように変更）
window.getCardBadgeInfo = function(card) {
    let badges = [];

    // 1. サポートカード
    if (card.type === 'item') { badges.push({ text: '具', color: '#8D6E63' }); return badges; }
    if (card.type === 'action') { badges.push({ text: '技', color: '#FFB74D' }); return badges; }
    if (card.type === 'field') { badges.push({ text: '地', color: '#4DB6AC' }); return badges; }

    // 2. 基本種族の判定
    const raceMap = {
        'dragon': { t: '竜', c: '#FFC107' }, 'magician': { t: '魔', c: '#9C27B0' },
        'spirit': { t: '精', c: '#4CAF50' }, 'stone': { t: '岩', c: '#795548' },
        'machine': { t: '械', c: '#607D8B' }, 'ghost': { t: '霊', c: '#673AB7' },
        'bird': { t: '鳥', c: '#03A9F4' }, 'beetle': { t: '虫', c: '#8BC34A' },
        'seed': { t: '草', c: '#8BC34A' }, 'balloon': { t: '風', c: '#00BCD4' },
        'robot': { t: '機', c: '#9E9E9E' }
    };

    let baseType = card.type.split('_')[0]; // "beetle_type4_2" から "beetle" を抽出
    if (raceMap[baseType]) {
        badges.push({ text: raceMap[baseType].t, color: raceMap[baseType].c });
    }

    // 3. 進化の段階を判定
    let evoText = ''; let evoColor = '';
    if (card.type.includes('type1')) { evoText = '闇'; evoColor = '#9C27B0'; }
    else if (card.type.includes('type2')) { evoText = '美'; evoColor = '#E91E63'; }
    else if (card.type.includes('type3')) { evoText = '賢'; evoColor = '#2196F3'; }
    else if (card.type.includes('type4')) { evoText = '活'; evoColor = '#FF5722'; }
    else if (card.type.includes('type5')) { evoText = '老'; evoColor = '#795548'; }

    if (evoText) {
        if (card.type.includes('_4')) evoText += '+++';
        else if (card.type.includes('_3')) evoText += '++';
        else if (card.type.includes('_2')) evoText += '+';
        badges.push({ text: evoText, color: evoColor });
    }

    if (badges.length === 0) badges.push({ text: '無', color: '#999' });

    return badges;
};

// ③ UI描画の完全上書き（複数バッジを描画）
window.renderCardHTML = function(card) {
    if (typeof window.TCG_MASTER !== 'undefined') {
        let masterData = null;
        if (card.masterId && window.TCG_MASTER[card.masterId]) {
            masterData = window.TCG_MASTER[card.masterId];
        }
        if (!masterData || masterData.sx === undefined) {
            const safeName = (card.name || "").trim();
            const adjustedKey = Object.keys(window.TCG_MASTER).find(k => {
                const target = window.TCG_MASTER[k];
                return target && target.name && target.name.trim() === safeName && target.sx !== undefined;
            });
            if (adjustedKey) {
                masterData = window.TCG_MASTER[adjustedKey]; 
            } else {
                const fallbackKey = Object.keys(window.TCG_MASTER).find(k => {
                    const target = window.TCG_MASTER[k];
                    return target && target.name && target.name.trim() === safeName;
                });
                if (fallbackKey) masterData = window.TCG_MASTER[fallbackKey];
            }
        }
        if (masterData) {
            if (masterData.sx !== undefined) card.sx = masterData.sx;
            if (masterData.sy !== undefined) card.sy = masterData.sy;
            if (masterData.sw !== undefined) card.sw = masterData.sw;
            if (masterData.sh !== undefined) card.sh = masterData.sh;
            if (masterData.scaleX !== undefined) card.scaleX = masterData.scaleX;
            if (masterData.scaleY !== undefined) card.scaleY = masterData.scaleY;
            if (masterData.image) card.image = masterData.image; 
        }
    }

    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;

    let abilityText = card.abilityTextOverride || "";
    if (!abilityText) {
        const texts = {
            "taunt": "【かばう】(相手の攻撃を代わりに受ける)", "stealth": "【潜伏】(攻撃するまでターゲットにされない)",
            "heal_self": "【修復】(自分のHPを小回復する)", "draw_card": "【ドロー】(山札からカードを引く)",
            "flight": "【飛行】(かばうを無視して攻撃できる)", "mana_ramp": "【成長】(自分の最大マナを+1する)",
            "haste": "【速攻】(場に出たターンにすぐ攻撃できる)",
            "trample": "【貫通】(敵を倒した時、超過ダメージをリーダーに与える)",
            "death_bomb": "【誘爆】(破壊された時、相手リーダーに20ダメージ)",
            "burst_damage": "【破裂】(ダメージを受けた時、攻撃者に20ダメージを返す)",
            "debuff_attack": "【弱体化】(攻撃した相手の攻撃力を強制的に半分にする)",
            "venom_strike": "【猛毒】(ダメージを与えた敵モンスターを即死させる)",
            "discard_hand": "【忘却】(場に出た時、相手の手札をランダムに1枚破壊する)",
            "haunt": "【霊障】(ターン終了時、敵リーダーに20ダメージを与える)",
            "counter_attack": "【迎撃】(攻撃を受けた時、自身の攻撃力分のダメージを相手に返す)",
            "heavy_strike": "【重撃】(ダメージを与えた敵モンスターを「化石化(スタン)」させる)",
            "double_strike": "【連撃】(1ターンに2回攻撃できる)",
            "evasion": "【見切り】(敵からの攻撃を50%の確率で回避して無効化する)",
            "splash_damage": "【範囲魔法】(攻撃時、対象以外の全ての敵に10ダメージを与える)",
            "silence": "【沈黙】(ダメージを与えた相手の能力を無効化する)",
            "wind_blessing": "【風の加護】(場に出た時、自分以外の味方全員の攻撃力を+10する)",
            "regeneration": "【自然治癒】(ターン終了時、自身のHPを全回復する)",
            "self_destruct": "【自爆】(破壊された時、相手のリーダーに30ダメージを与える)",
            "roar": "【咆哮】(場に出た時、敵モンスター全体に20ダメージを与える)",
            "wrath": "【逆鱗】(ダメージを受けた時、自身の攻撃力が+20される)",
            "life_drain": "【吸収】(ダメージを与えた時、その分リーダーのHPを回復する)",
            "pierce_recoil": "【暴走回路】(かばう無視・攻撃時自身にダメ)", "aoe_heal_play": "【全体回復】(登場時、味方全員を回復)",
            "start_draw": "【超演算】(自ターン開始時、1枚ドロー)", "aura_action_cost": "【万能魔法】(場にいる間、アクションコスト-1)",
            "heavy_armor": "【重装甲】(攻撃される時、受けるダメージを常に20軽減する)", "snipe_play": "【殲滅】(登場時、ランダムな敵にダメージ)",
            "end_heal": "【悠久の風化】(ターン終了時、自身のHP回復)", "god_strike": "【神の一撃】(貫通・攻撃時敵1体即死)",
            "cyber_miracle": "【電脳の奇跡】(ターン終了時、味方全回復)", "dimension_hack": "【超次元ハック】(登場時、敵手札破壊＆ドロー)",
            "all_zero_cost": "【森羅万象】(場にいる間、アクションのコスト0)", "absolute_field": "【絶対領域】(受けるあらゆるダメージを1にする)",
            "crimson_end": "【終末の紅蓮】(登場時、敵全体に50ダメ)", "star_breath": "【星の息吹】(ターン開始時マナ+2＆リーダー回復)",
            "perfect_predation": "【完全捕食】(登場時、敵1体を破壊し吸収)", "nightmare_rule": "【悪夢の君臨】(登場時、全敵のHPを強制半減)",
            "star_hope": "【希望の星】(登場時、味方全回復＆かばう付与)", "divine_grace": "【神の恩寵】(ターン終了時、破壊された味方蘇生)",
            "heaven_punishment": "【天罰】(登場時、全敵モンスターに50ダメージ)", "event_horizon": "【事象の地平】(ターン終了時、敵1体を山札に戻す)",
            "truth_overwrite": "【真理の書換】(登場時、3枚ドロー＆最大マナ+3)", "heaven_judgement": "【天の裁き】(ターン開始時、敵全体に20ダメ)",
            "absolute_fortress": "【絶対要塞】(受けるダメージを常に-20する)", "dimension_drill": "【次元穿孔】(貫通・リーダーにも同じダメを与える)",
            "super_gravity": "【超重力】(登場時、自身以外の全モンスターに100ダメ)", "eternal_rebirth": "【悠久の再生】(破壊された時、一度だけHP満タンで復活)",
            "burn_field": "【焦土化】(ターン終了時、敵全体に少ダメージ)", "cataclysm": "【天変地異】(ターン終了時、敵全体に貫通大ダメージ)",
            "spell_echo": "【魔法反響】(登場・スキル使用時、ダメージ増幅)", "mana_refund": "【魔力還元】(登場・スキル使用時、マナが回復)",
            "charm_enemy": "【魅惑】(登場時、敵1体を確率で「魅了」する)", "mass_charm": "【全体魅了】(登場時、敵全体を確率で「魅了」する)",
            "curse_death": "【道連れ】(破壊された時、敵リーダーに大ダメージ)", "soul_drain": "【魂吸収】(攻撃で与えたダメージの半分を回復)",
            "soul_reap": "【魂刈り】(攻撃時、相手の最大HPも減少させる)", "thorns": "【茨の鎧】(攻撃を受けた時、相手にも反射ダメージ)",
            "void_counter": "【虚無】(一度だけダメージを無効化し倍返しする)", "devour": "【捕食】(敵を倒した時、自身のHPと攻撃力UP)",
            "apex_predator": "【頂点捕食】(敵を倒した時、ステータスが倍増する)", "burst_spores": "【破裂胞子】(破壊された時、味方全体を回復＆強化)",
            "absolute_sanctuary": "【絶対聖域】(ターン終了時、味方全体を回復する)", "mana_sovereign": "【魔力の支配者】(場にいる間、味方の全コスト半減)",
            "impregnable_armor": "【難攻不落】(30以下のダメージを完全に無効化する)", "pure_aegis": "【純真の盾】(かばう＋あらゆる状態異常を無効化)",
            "infinite_gear": "【無限歯車】(ターン開始時、手札が5枚になるようドロー)", "doomsday_detonation": "【終末起爆】(登場時、盤面全てを消し飛ばす)",
            "rebirth": "【輪廻転生】(破壊された時、一度だけ復活し敵を焼く)", "absolute_evasion": "【絶対回避】(敵からの攻撃を高い確率で無効化する)",
            "piercing_juggernaut": "【暴走貫通】(攻撃するたび火力が上がり、かばう無視)", "fossilize": "【化石化】(登場時、敵1体を確率で「スタン」させる)",
            "mass_bounce": "【全バウンス】(破壊された時、全敵を山札に戻す)", "nova_burst": "【超新星爆発】(破壊された時、敵全体に最大HP分ダメ)",
            "time_manipulation": "【時空操作】(登場時、行動済みの味方を未行動にする)", "raise_dead": "【死霊復活】(ターン終了時、破壊された味方を半分の力で蘇生)",
            // フィールド
            "field_forest": "【森の加護】(場にある間、自然系[精霊/草/虫]が出た時に最大HP+20)",
            "field_castle": "【鉄壁の陣】(場にある間、全プレイヤーの[守護化]コストが0になる)",
            "field_casino": "【ギャンブル】(ターン開始時、50%で1ドロー、50%でリーダーに10ダメ)",
            "field_miasma": "【瘴気】(ターン終了時、お互いのリーダーと全モンスターに10ダメ)",
            "field_mana": "【マナ活性】(お互いの最大マナが常に+2される)",
            // アクション
            "action_draw_3": "【大量ドロー】(山札からカードを3枚引く)",
            "action_atk_up": "【超強化】(指定した味方1体の攻撃力を永続で+40する)",
            "action_search_evo": "【確定サーチ】(山札から[進化後]のカードをランダムに1枚引く)",
            "action_heal_face": "【大回復】(リーダーのHPを100回復する)",
            "action_heal_all": "【全体回復】(リーダーと味方全員のHPを全回復する)",
            // アイテム
            "item_hp_up": "【装甲付与】(指定した味方1体の最大HPを+20する)",
            "item_taunt": "【拠点防衛】(指定した味方1体に[守護]を付与する)",
            "item_heal_cleanse": "【状態異常回復】(指定した味方1体を全回復し、状態異常を解除)",
            "item_draw": "【知恵】(山札からカードを1枚引く)",
            "item_mana_boost": "【マナブースト】(このターン中、マナを+2する)"
        };
        abilityText = texts[card.ability] || "";
    }

    let imgPath = card.image;
    if (!imgPath || imgPath === 'characters.png') {
        imgPath = null;
    } else if (typeof imageSources !== 'undefined' && imageSources[imgPath]) {
        imgPath = imageSources[imgPath]; 
    }

    const flavorText = (card.type === 'item' || card.type === 'action' || card.type === 'field')
        ? "冒険の途中で見つけた、かけがえのない記憶の欠片。" 
        : "AIがこれまでの人生で培ってきた、確かな成長の証。";

    let displayCost = card.cost;
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        let owner = window.TCG_BATTLE.player.hand.includes(card) ? window.TCG_BATTLE.player : null;
        if (!owner && window.TCG_BATTLE.cpu.hand.includes(card)) owner = window.TCG_BATTLE.cpu;
        if (owner) displayCost = window.getActualCost(owner, card);
    }
    const costColor = displayCost < card.cost ? "#4CAF50" : "#FFD700";
    
    // ★ 複数バッジ情報の取得
    const badges = window.getCardBadgeInfo(card);
    let badgesHtml = badges.map(b => `<span style="font-size: 11px; background: rgba(0,0,0,0.6); color: ${b.color}; padding: 2px 5px; border-radius: 4px; border: 1px solid ${b.color}; white-space: nowrap;">${b.text}</span>`).join('');

    let html = `<div class="tcg-card" style="width: 180px; height: 260px; background-color: #222; border: 4px solid #555; border-radius: 12px; position: relative; font-family: sans-serif; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; user-select: none;">`;

    if (card.status === 'stunned' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:5%; background:#795548; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(-15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">🪨 化石化</div>`;
    }
    if (card.status === 'charmed' && !card.isDead) {
        html += `<div style="position:absolute; top:35%; left:15%; background:#E91E63; color:white; padding:5px 15px; border-radius:6px; font-weight:bold; font-size:22px; transform:rotate(15deg); z-index:15; border: 2px solid #FFF; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">💕 魅了</div>`;
    }

    if (isUnlocked) {
        html += `<div style="position: absolute; top: 6px; left: 6px; width: 28px; height: 28px; background: ${costColor}; color: #000; border-radius: 50%; font-weight: bold; font-size: 18px; display: flex; justify-content: center; align-items: center; border: 2px solid #FFF; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${displayCost}</div>`;
    }

    if (card.sx !== undefined) {
        const scX = card.scaleX !== undefined ? card.scaleX : 1.0;
        const scY = card.scaleY !== undefined ? card.scaleY : 1.0;
        const sw = card.sw || 50; const sh = card.sh || 50;
        const sx = card.sx || 0; const sy = card.sy || 0;
        let imgStyle = imgPath 
            ? `background-image: url('${imgPath}'); background-position: ${-sx}px ${-sy}px; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111);`; 
        html += `
        <div style="width: 100%; height: 120px; background-color: #1a1a1a; overflow: hidden; display: flex; justify-content: center; align-items: center; position: relative; border-bottom: 3px solid #444;">
            <div style="width: ${sw}px; height: ${sh}px; ${imgStyle} transform: scale(${scX}, ${scY}); transform-origin: center center; flex-shrink: 0;">
                ${!imgPath ? '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;">NO IMAGE</div>' : ''}
            </div>
        </div>`;
    } else {
        const col = (card.imageIndex || 0) % 3; const row = Math.floor((card.imageIndex || 0) / 3);
        const finalPosX = (col * 50) + (card.offsetX || 0); const finalPosY = (row * 25) + (card.offsetY || 0); 
        const zoomX = card.zoomX || 300; const zoomY = card.zoomY || 510;
        let imgStyle = imgPath
            ? `background-image: url('${imgPath}'); background-size: ${zoomX}% ${zoomY}%; background-position: ${finalPosX}% ${finalPosY}%; background-repeat: no-repeat;`
            : `background: linear-gradient(135deg, #444, #111); display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;`;
        html += `<div style="width: 100%; height: 120px; ${imgStyle} border-bottom: 3px solid #444;">${!imgPath ? 'NO IMAGE' : ''}</div>`;
    }

    html += `
        <div style="padding: 4px 8px; font-weight: bold; font-size: 14px; background: linear-gradient(to right, #444, #222); border-bottom: 2px solid #111; text-shadow: 1px 1px 2px #000; display: flex; justify-content: space-between; align-items: center;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${card.name}</span>
            ${isUnlocked ? `<div style="display:flex; gap:2px; margin-left: 4px;">${badgesHtml}</div>` : ''}
        </div>`;

    if (isUnlocked) {
        html += `
        <div style="flex: 1; padding: 6px; padding-bottom: 30px; font-size: 11px; color: #ddd; background: #2a2a2a; display: flex; flex-direction: column; gap: 4px;">
            ${abilityText ? `<div style="color: #FF9800; font-weight: bold; font-size: 10px;">${abilityText}</div>` : ''}
            <div style="margin-top: auto; padding-top: 4px; border-top: 1px solid #444;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div style="display:flex; flex-direction:column; gap:3px;">
                        <span style="display:inline-block; background:#00BCD4; color:#fff; border-radius:4px; padding:2px 4px; font-size:10px; width:fit-content;">コスト ${card.skillCost}</span>
                        <span style="font-weight:bold; font-size:12px; color:#fff;">${card.skillName}</span>
                    </div>
                    ${card.damage > 0 ? `<div style="color:#ff5252; font-weight:bold; font-size:13px; white-space:nowrap;">${card.damage} ダメージ</div>` : ''}
                </div>
            </div>
        </div>
        <div style="position: absolute; bottom: -4px; right: -4px; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 8px 0 0 0; font-weight: bold; font-size: 16px; border: 2px solid #333; border-right: none; border-bottom: none; box-shadow: -2px -2px 4px rgba(0,0,0,0.3); z-index: 2;">HP ${card.hp}</div>`;
    } else {
        html += `<div style="flex: 1; padding: 15px 10px; font-size: 12px; line-height: 1.6; color: #bbb; background: #2a2a2a; text-align: center; display: flex; align-items: center; justify-content: center;"><span style="font-style: italic;">「${flavorText}」</span></div>`;
    }
    html += `</div>`;
    return html;
};

// ⑤ ダイレクトアタックの超リッチなカットイン演出関数
window.showDirectAttackCutin = function(isPlayer, isPierce) {
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;
    
    const daText = document.createElement('div');
    const textStr = isPierce ? "PIERCING ATTACK!!" : "DIRECT ATTACK!!";
    const color = isPlayer ? "#4CAF50" : "#ff5252";
    const glow = isPlayer ? "#00E676" : "#ff0000";
    
    // 斜体、ドロップシャドウ、極太フォントでカードゲームらしさを全開に
    daText.innerHTML = `<div style="font-size: 70px; font-weight: 900; font-style: italic; color: ${color}; text-shadow: 0 0 30px ${glow}, 4px 4px 0px #fff, -2px -2px 0px #000; transform: skewX(-15deg); letter-spacing: 4px; white-space: nowrap;">${textStr}</div>`;
    daText.style.cssText = `position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.1); opacity: 0; z-index: 45000; pointer-events: none; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    
    ui.appendChild(daText);
    
    // ログには残す（サイレントモード）
    window.showBattleMessage(`💥 ${isPierce ? '貫通' : 'ダイレクト'}アタック！！`, !isPlayer, 2000, !isPlayer, true);

    setTimeout(() => { 
        daText.style.transform = 'translate(-50%, -50%) scale(1.2)'; 
        daText.style.opacity = '1'; 
    }, 50);
    
    setTimeout(() => { 
        daText.style.transform = 'translate(-50%, -50%) scale(1.5)'; 
        daText.style.opacity = '0'; 
        setTimeout(() => daText.remove(), 300); 
    }, 1000);
};

// ⑥ 攻撃処理を上書きしてダイレクトアタック演出を組み込む
// window.executeAttack = function(targetType, enemyIndex) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const isPlayer = window.TCG_BATTLE.isEnemyTurn === false;
//     const owner = isPlayer ? p : cpu;
//     const enemy = isPlayer ? cpu : p;
//     const ownerPrefix = isPlayer ? 'p' : 'c';
//     const enemyPrefix = isPlayer ? 'c' : 'p';
    
//     const attackerIndex = window.TCG_BATTLE.selectedAttackerIndex; 
//     if (attackerIndex === -1) return;
//     const attackerCard = owner.field[attackerIndex];

//     const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill" || attackerCard.ability === "piercing_juggernaut";
//     const hasTaunt = enemy.field.some(c => c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending);
    
//     if (hasTaunt && !isPierce) {
//         if (targetType === 'cpu' || targetType === 'player' || (targetType === 'card' && enemy.field[enemyIndex].ability !== "taunt" && enemy.field[enemyIndex].ability !== "pure_aegis" && !enemy.field[enemyIndex].isDefending)) {
//             if(isPlayer) window.showBattleMessage("🛡️ 敵の場に【かばう】を持つカードがいます！\n先にそちらを攻撃してください", true); return;
//         }
//     }
//     if (targetType === 'card' && enemy.field[enemyIndex].ability === "stealth") {
//         if(isPlayer) window.showBattleMessage("🌫️ この敵は【潜伏】しています！\n攻撃対象に選べません！", true); return;
//     }

//     window.showBattleMessage(`⚔️ ${attackerCard.name} の攻撃！`, false, 1500, !isPlayer);

//     if (attackerCard.ability === "piercing_juggernaut") {
//         attackerCard.damage += 10;
//         window.showVFX(`${ownerPrefix}-card-${attackerIndex}`, 'heal', '火力UP');
//     }
    
//     let dmgToTarget = attackerCard.damage; 
//     let dmgToAttacker = 0; 
//     const attackerHtmlId = `${ownerPrefix}-card-${attackerIndex}`;
    
//     let targetDied = false;
//     let target = null;
//     let targetHtmlId = null;

//     if (targetType === 'cpu' || targetType === 'player') {
//         const faceId = isPlayer ? 'cpu-face' : 'player-face';
        
//         // ダイレクトアタック演出
//         const ui = document.getElementById('tcg-battle-ui'); 
//         if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
        
//         window.showDirectAttackCutin(isPlayer, false);

//         window.showVFX(faceId, 'slash'); 
//         window.showVFX(faceId, 'damage', dmgToTarget);
//         window.showBattleMessage(`🔥 ${isPlayer ? '敵' : '味方'}リーダーに ${dmgToTarget} ダメージ！`, false, 2000, !isPlayer, true);

//         enemy.hp -= dmgToTarget; 
//         if (attackerCard.ability === "soul_reap") {
//             enemy.hp -= 20; window.showVFX(faceId, 'damage', 20);
//         }

//         setTimeout(() => {
//             const hpSpan = isPlayer ? document.querySelector('#cpu-face span') : document.querySelector('#player-face div:nth-child(2)');
//             if (hpSpan) {
//                 hpSpan.style.transition = "all 0.1s";
//                 hpSpan.innerText = `HP: ${enemy.hp}`;
//                 hpSpan.style.color = '#ff5252';
//                 hpSpan.style.transform = 'scale(1.4)';
//                 setTimeout(() => {
//                     hpSpan.style.color = isPlayer ? '#ff5252' : '#4CAF50';
//                     hpSpan.style.transform = 'scale(1)';
//                 }, 300);
//             }
//         }, 500);

//     } else if (targetType === 'card') {
//         target = enemy.field[enemyIndex]; 
//         targetHtmlId = `${enemyPrefix}-card-${enemyIndex}`;
//         dmgToAttacker = target.damage;

//         // ▼▼▼ 迎撃 ▼▼▼
//         if (target.ability === "counter_attack") {
//             dmgToAttacker += target.damage; // 元々の反撃ダメージ（target.damage）に、迎撃分としてさらに同等のダメージを加算！
//             window.showVFX(targetHtmlId, 'slash', '迎撃');
//         }

//         if (target.ability === "absolute_field") dmgToTarget = 1;
//         if (attackerCard.ability === "absolute_field") dmgToAttacker = 1;
//         if (target.ability === "absolute_fortress") dmgToTarget = Math.max(0, dmgToTarget - 20);
//         if (attackerCard.ability === "absolute_fortress") dmgToAttacker = Math.max(0, dmgToAttacker - 20);
        
//         if (target.ability === "absolute_evasion" && Math.random() < 0.5) {
//             dmgToTarget = 0; window.showVFX(targetHtmlId, 'heal', '回避');
//         }
//         if (target.ability === "evasion" && Math.random() < 0.5) {
//             dmgToTarget = 0; window.showVFX(targetHtmlId, 'heal', '回避');
//         }
//         if (target.ability === "impregnable_armor" && dmgToTarget <= 30) {
//             dmgToTarget = 0; window.showVFX(targetHtmlId, 'heal', '無効化');
//         }
//         if (target.ability === "void_counter" && !target._void_used) {
//             target._void_used = true; dmgToAttacker += dmgToTarget * 2; dmgToTarget = 0;
//             window.showVFX(targetHtmlId, 'slash', '倍返し');
//         }
//         if (target.ability === "magic_reflect") {
//             dmgToAttacker += Math.floor(dmgToTarget / 2); dmgToTarget = Math.floor(dmgToTarget / 2);
//             window.showVFX(targetHtmlId, 'slash', '反射');
//         }
//         if (target.ability === "thorns") {
//             dmgToAttacker += Math.floor(dmgToTarget / 2); 
//             window.showVFX(targetHtmlId, 'slash', '棘');
//         }
//         if (attackerCard.ability === "soul_reap") {
//             target.maxHp = Math.max(1, target.maxHp - 20); 
//             dmgToTarget += 20; 
//         }

//         target.hp -= dmgToTarget; 
//         window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmgToTarget);
        
//         window.showBattleMessage(`💥 ${target.name} に ${dmgToTarget} ダメージ！`, false, 1500, !isPlayer, true);

//         // ▼▼▼ 猛毒処理 ▼▼▼
//         if (attackerCard.ability === "venom_strike" && target.hp > 0 && dmgToTarget > 0) {
//             target.hp = 0;
//             window.showVFX(targetHtmlId, 'slash', '猛毒');
//             window.showBattleMessage(`☠️ 【猛毒】${target.name} は毒に侵され即死した！`, false, 2000, !isPlayer, true);
//         }

//         // ▼▼▼ 重撃 ▼▼▼
//         if (attackerCard.ability === "heavy_strike" && target.hp > 0 && dmgToTarget > 0) {
//             target.status = "stunned";
//             window.showVFX(targetHtmlId, 'damage', '化石化');
//             window.showBattleMessage(`🪨 【重撃】${target.name} は重い一撃でスタンした！`, false, 2000, !isPlayer, true);
//         }

//         // ★ 破裂（カウンターダメージ）
//         if (target.ability === "burst_damage") {
//             attackerCard.hp -= 20;
//             window.showVFX(attackerHtmlId, 'slash'); window.showVFX(attackerHtmlId, 'damage', 20);
//             window.showBattleMessage(`🎈 【破裂】${target.name}の破片で 20ダメージ！`, false, 1500, !isPlayer, true);
//             if(attackerCard.hp <= 0 && !attackerCard.isDead) {
//                 window.checkDeath(attackerCard, owner, attackerHtmlId, enemy);
//             }
//         }
        
//         // ★ デバフ（攻撃力半減）
//         if (attackerCard.ability === "debuff_attack" && target.hp > 0 && !target.isDead) {
//             target.damage = Math.floor(target.damage / 2);
//             window.showVFX(targetHtmlId, 'heal', '攻撃ダウン');
//             window.showBattleMessage(`📉 【弱体化】${target.name} の攻撃力が半減した！`, false, 2000, !isPlayer, true);
//         }

//         // ★追加：トランプル（貫通）処理
//         if (attackerCard.ability === "trample" && target.hp < 0) {
//             let excess = -target.hp;
//             enemy.hp -= excess;
//             const faceId = isPlayer ? 'cpu-face' : 'player-face';
//             window.showVFX(faceId, 'damage', excess);
//             const ui = document.getElementById('tcg-battle-ui'); 
//             if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
//             window.showBattleMessage(`💥 【貫通】超過した ${excess} ダメージがリーダーに直撃！`, false, 2000, !isPlayer, true);
//         }

//         if(target.hp <= 0 && !target.isDead) targetDied = true;
//         window.checkDeath(target, enemy, targetHtmlId, owner);
//         if (target.ability === "stealth") target.ability = null;
//     }

//     if (attackerCard.ability === "soul_drain" && dmgToTarget > 0) {
//         let heal = Math.floor(dmgToTarget / 2);
//         attackerCard.hp += heal; window.showVFX(attackerHtmlId, 'heal', heal);
//     }

//     // ▼▼▼ 吸収処理 ▼▼▼
//     if (attackerCard.ability === "life_drain" && dmgToTarget > 0) {
//         owner.hp += dmgToTarget;
//         const faceId = isPlayer ? 'player-face' : 'cpu-face';
//         window.showVFX(faceId, 'heal', dmgToTarget);
//         window.showBattleMessage(`💖 【吸収】リーダーのHPが ${dmgToTarget} 回復した！`, false, 1500, !isPlayer, true);
//     }

//     if (targetDied) {
//         if (attackerCard.ability === "devour") {
//             attackerCard.maxHp = (attackerCard.maxHp||attackerCard.hp) + 20;
//             attackerCard.hp += 20; attackerCard.damage += 10;
//             window.showVFX(attackerHtmlId, 'heal', '捕食');
//         }
//         if (attackerCard.ability === "apex_predator") {
//             attackerCard.maxHp = (attackerCard.maxHp||attackerCard.hp) * 2;
//             attackerCard.hp = attackerCard.maxHp; attackerCard.damage *= 2;
//             window.showVFX(attackerHtmlId, 'heal', '超捕食');
//         }
//     }

//     if (attackerCard.ability === "god_strike") {
//         const otherEnemies = enemy.field.filter((c, idx) => (!c.isDead && (targetType !== 'card' || idx !== enemyIndex)));
//         if (otherEnemies.length > 0) {
//             let tCard = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
//             tCard.hp = 0; window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${enemy.field.indexOf(tCard)}`, owner);
//             window.showBattleMessage("⚔️ 【神の一撃】が別の敵を葬り去った！", false, 1500, !isPlayer);
//         }
//     }
//     if (attackerCard.ability === "dimension_drill" && targetType === 'card') {
//         const faceId = isPlayer ? 'cpu-face' : 'player-face';
//         const ui = document.getElementById('tcg-battle-ui'); 
//         if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
        
//         window.showDirectAttackCutin(isPlayer, true);
//         window.showVFX(faceId, 'damage', dmgToTarget); 
//         window.showBattleMessage(`🌪️ 【次元穿孔】敵リーダーも貫いた！`, false, 1500, !isPlayer, true);
        
//         enemy.hp -= dmgToTarget;
        
//         setTimeout(() => {
//             const hpSpan = isPlayer ? document.querySelector('#cpu-face span') : document.querySelector('#player-face div:nth-child(2)');
//             if (hpSpan) {
//                 hpSpan.style.transition = "all 0.1s";
//                 hpSpan.innerText = `HP: ${enemy.hp}`;
//                 hpSpan.style.color = '#ff5252';
//                 hpSpan.style.transform = 'scale(1.4)';
//                 setTimeout(() => {
//                     hpSpan.style.color = isPlayer ? '#ff5252' : '#4CAF50';
//                     hpSpan.style.transform = 'scale(1)';
//                 }, 300);
//             }
//         }, 500);
//     }
//     if (attackerCard.ability === "pierce_recoil") { dmgToAttacker += 10; }

//     if (dmgToAttacker > 0) {
//         setTimeout(() => {
//             attackerCard.hp -= dmgToAttacker; window.showVFX(attackerHtmlId, 'slash'); window.showVFX(attackerHtmlId, 'damage', dmgToAttacker);
//             window.checkDeath(attackerCard, owner, attackerHtmlId, enemy); window.renderBattleBoard();
//         }, 200);
//     }
    
//     if (attackerCard.ability === "stealth") attackerCard.ability = null;
//     attackerCard.canAttack = false; 

//     // ▼▼▼ 連撃の処理 ▼▼▼
//     if (attackerCard.ability === "double_strike" && !attackerCard._has_attacked_once) {
//         attackerCard._has_attacked_once = true;
//         window.showBattleMessage(`🌪️ 【連撃】${attackerCard.name} はもう一度攻撃できる！`, false, 1500, !isPlayer, true);
//     } else {
//         attackerCard.canAttack = false; 
//         attackerCard._has_attacked_once = false;
//     }

//     if(isPlayer) window.TCG_BATTLE.selectedAttackerIndex = -1; 

//     setTimeout(() => {
//         window.renderBattleBoard();
//         p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);
//         if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
//         if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
//         window.renderBattleBoard();
//     }, 1100);
// };

// ==========================================
// ★ バグ修正：撃破された「守護」が残り続ける問題の解決パッチ
// ==========================================

// ① 登場時効果（ダメージなど）が終わった直後に、盤面から死体を確実に取り除く
const _originalTriggerPlayEffect_fix = window.triggerPlayEffect;
window.triggerPlayEffect = function(card, isPlayer) {
    _originalTriggerPlayEffect_fix(card, isPlayer);
    
    // 元の処理が終わる頃（800ms後）に、お互いの盤面からHP0のカードを完全に削除する
    setTimeout(() => {
        if (window.TCG_BATTLE && window.TCG_BATTLE.player && window.TCG_BATTLE.cpu) {
            window.TCG_BATTLE.player.field = window.TCG_BATTLE.player.field.filter(c => !c.isDead);
            window.TCG_BATTLE.cpu.field = window.TCG_BATTLE.cpu.field.filter(c => !c.isDead);
            window.renderBattleBoard(); // 綺麗になった盤面を再描画
        }
    }, 850);
};


// ② 攻撃する際の「守護がいるか？」の判定で、念のため死体を除外する
window.executeAttack = function(targetType, enemyIndex) {
    try {
        const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
        const isPlayer = window.TCG_BATTLE.isEnemyTurn === false;
        const owner = isPlayer ? p : cpu;
        const enemy = isPlayer ? cpu : p;
        const ownerPrefix = isPlayer ? 'p' : 'c';
        const enemyPrefix = isPlayer ? 'c' : 'p';
        
        const attackerIndex = window.TCG_BATTLE.selectedAttackerIndex; 
        if (attackerIndex === -1) return;
        const attackerCard = owner.field[attackerIndex];

        const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill" || attackerCard.ability === "piercing_juggernaut";
        
        // ★修正箇所：敵の盤面に「守護」がいるか探す時、(!c.isDead)を追加して死体を無視する！
        const hasTaunt = enemy.field.some(c => (c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending) && !c.isDead);
        
        if (hasTaunt && !isPierce) {
            if (targetType === 'cpu' || targetType === 'player' || (targetType === 'card' && enemy.field[enemyIndex].ability !== "taunt" && enemy.field[enemyIndex].ability !== "pure_aegis" && !enemy.field[enemyIndex].isDefending)) {
                if(isPlayer) window.showBattleMessage("🛡️ 敵の場に【かばう】を持つカードがいます！\n先にそちらを攻撃してください", true); return;
            }
        }
        if (targetType === 'card' && enemy.field[enemyIndex].ability === "stealth") {
            if(isPlayer) window.showBattleMessage("🌫️ この敵は【潜伏】しています！\n攻撃対象に選べません！", true); return;
        }

        window.showBattleMessage(`⚔️ ${attackerCard.name} の攻撃！`, false, 1500, !isPlayer);

        if (attackerCard.ability === "piercing_juggernaut") {
            attackerCard.damage += 10;
            window.showVFX(`${ownerPrefix}-card-${attackerIndex}`, 'heal', '火力UP');
        }
        
        let dmgToTarget = attackerCard.damage; 
        let dmgToAttacker = 0; 
        const attackerHtmlId = `${ownerPrefix}-card-${attackerIndex}`;
        
        let targetDied = false;
        let target = null;
        let targetHtmlId = null;

        if (targetType === 'cpu' || targetType === 'player') {
            const faceId = isPlayer ? 'cpu-face' : 'player-face';
            
            const ui = document.getElementById('tcg-battle-ui'); 
            if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            
            window.showDirectAttackCutin(isPlayer, false);

            window.showVFX(faceId, 'slash'); 
            window.showVFX(faceId, 'damage', dmgToTarget);
            window.showBattleMessage(`🔥 ${isPlayer ? '敵' : '味方'}リーダーに ${dmgToTarget} ダメージ！`, false, 2000, !isPlayer, true);

            enemy.hp -= dmgToTarget; 
            if (attackerCard.ability === "soul_reap") {
                enemy.hp -= 20; window.showVFX(faceId, 'damage', 20);
            }

            setTimeout(() => {
                const hpSpan = isPlayer ? document.querySelector('#cpu-face span') : document.querySelector('#player-face div:nth-child(2)');
                if (hpSpan) {
                    hpSpan.style.transition = "all 0.1s";
                    hpSpan.innerText = `HP: ${enemy.hp}`;
                    hpSpan.style.color = '#ff5252';
                    hpSpan.style.transform = 'scale(1.4)';
                    setTimeout(() => {
                        hpSpan.style.color = isPlayer ? '#ff5252' : '#4CAF50';
                        hpSpan.style.transform = 'scale(1)';
                    }, 300);
                }
            }, 500);

        } else if (targetType === 'card') {
            target = enemy.field[enemyIndex]; 
            targetHtmlId = `${enemyPrefix}-card-${enemyIndex}`;
            dmgToAttacker = target.damage;

            // 迎撃
            if (target.ability === "counter_attack") {
                dmgToAttacker += target.damage;
                window.showVFX(targetHtmlId, 'slash', '迎撃');
            }

            // 重装甲
            if (target.ability === "heavy_armor") {
                dmgToTarget = Math.max(0, dmgToTarget - 20);
                window.showVFX(targetHtmlId, 'heal', '装甲化');
            }

            if (target.ability === "absolute_field") dmgToTarget = 1;
            if (attackerCard.ability === "absolute_field") dmgToAttacker = 1;
            if (target.ability === "absolute_fortress") dmgToTarget = Math.max(0, dmgToTarget - 20);
            if (attackerCard.ability === "absolute_fortress") dmgToAttacker = Math.max(0, dmgToAttacker - 20);
            
            // 見切り＆絶対回避
            if ((target.ability === "evasion" || target.ability === "absolute_evasion") && Math.random() < 0.5) {
                dmgToTarget = 0; window.showVFX(targetHtmlId, 'heal', '回避');
            }
            if (target.ability === "impregnable_armor" && dmgToTarget <= 30) {
                dmgToTarget = 0; window.showVFX(targetHtmlId, 'heal', '無効化');
            }
            if (target.ability === "void_counter" && !target._void_used) {
                target._void_used = true; dmgToAttacker += dmgToTarget * 2; dmgToTarget = 0;
                window.showVFX(targetHtmlId, 'slash', '倍返し');
            }
            if (target.ability === "magic_reflect") {
                dmgToAttacker += Math.floor(dmgToTarget / 2); dmgToTarget = Math.floor(dmgToTarget / 2);
                window.showVFX(targetHtmlId, 'slash', '反射');
            }
            if (target.ability === "thorns") {
                dmgToAttacker += Math.floor(dmgToTarget / 2); 
                window.showVFX(targetHtmlId, 'slash', '棘');
            }
            if (attackerCard.ability === "soul_reap") {
                target.maxHp = Math.max(1, target.maxHp - 20); 
                dmgToTarget += 20; 
            }

            target.hp -= dmgToTarget; 
            window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmgToTarget);
            
            window.showBattleMessage(`💥 ${target.name} に ${dmgToTarget} ダメージ！`, false, 1500, !isPlayer, true);

            // 沈黙
            if (attackerCard.ability === "silence" && target && target.ability) {
                target.ability = null; 
                window.showVFX(targetHtmlId, 'slash', '沈黙');
                window.showBattleMessage(`🔇 【沈黙】${target.name} の能力が封じられた！`, false, 2000, !isPlayer, true);
            }

            // 猛毒
            if (attackerCard.ability === "venom_strike" && target.hp > 0 && dmgToTarget > 0) {
                target.hp = 0;
                window.showVFX(targetHtmlId, 'slash', '猛毒');
                window.showBattleMessage(`☠️ 【猛毒】${target.name} は毒に侵され即死した！`, false, 2000, !isPlayer, true);
            }

            // 重撃
            if (attackerCard.ability === "heavy_strike" && target.hp > 0 && dmgToTarget > 0) {
                target.status = "stunned";
                window.showVFX(targetHtmlId, 'damage', '化石化');
                window.showBattleMessage(`🪨 【重撃】${target.name} は重い一撃でスタンした！`, false, 2000, !isPlayer, true);
            }

            // 破裂
            if (target.ability === "burst_damage") {
                attackerCard.hp -= 20;
                window.showVFX(attackerHtmlId, 'slash'); window.showVFX(attackerHtmlId, 'damage', 20);
                window.showBattleMessage(`🎈 【破裂】${target.name}の破片で 20ダメージ！`, false, 1500, !isPlayer, true);
            }

            // 貫通
            if (attackerCard.ability === "trample" && target.hp < 0) {
                let excess = -target.hp;
                enemy.hp -= excess;
                const faceId = isPlayer ? 'cpu-face' : 'player-face';
                window.showVFX(faceId, 'damage', excess);
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
                window.showBattleMessage(`💥 【貫通】超過した ${excess} ダメージがリーダーに直撃！`, false, 2000, !isPlayer, true);
            }

            let targetWasAlive = !target.isDead;
            if(target.hp <= 0 && !target.isDead) targetDied = true;
            window.checkDeath(target, enemy, targetHtmlId, owner);

            // 逆鱗
            if (targetWasAlive && !target.isDead && target.ability === "wrath" && dmgToTarget > 0) {
                target.damage += 20;
                window.showVFX(targetHtmlId, 'heal', '逆鱗(攻+20)');
                window.showBattleMessage(`💢 【逆鱗】${target.name} の攻撃力が上がった！`, false, 1500, !isPlayer, true);
            }
            
            // 自爆
            if (targetWasAlive && target.isDead && target.ability === "self_destruct" && !target._has_self_destructed) {
                target._has_self_destructed = true;
                owner.hp -= 30;
                const faceId = isPlayer ? 'player-face' : 'cpu-face';
                window.showVFX(faceId, 'damage', 30);
                window.showBattleMessage(`💥 【自爆】${target.name} の爆発でリーダーに30ダメージ！`, false, 1500, !isPlayer, true);
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            }

            if (target.ability === "stealth") target.ability = null;
        }

        // 魂吸収
        if (attackerCard.ability === "soul_drain" && dmgToTarget > 0) {
            let heal = Math.floor(dmgToTarget / 2);
            attackerCard.hp += heal; window.showVFX(attackerHtmlId, 'heal', heal);
        }

        // 吸収
        if (attackerCard.ability === "life_drain" && dmgToTarget > 0) {
            owner.hp += dmgToTarget;
            const faceId = isPlayer ? 'player-face' : 'cpu-face';
            window.showVFX(faceId, 'heal', dmgToTarget);
            window.showBattleMessage(`💖 【吸収】リーダーのHPが ${dmgToTarget} 回復した！`, false, 1500, !isPlayer, true);
        }

        // 捕食
        if (targetDied) {
            if (attackerCard.ability === "devour") {
                attackerCard.maxHp = (attackerCard.maxHp||attackerCard.hp) + 20;
                attackerCard.hp += 20; attackerCard.damage += 10;
                window.showVFX(attackerHtmlId, 'heal', '捕食');
            }
            if (attackerCard.ability === "apex_predator") {
                attackerCard.maxHp = (attackerCard.maxHp||attackerCard.hp) * 2;
                attackerCard.hp = attackerCard.maxHp; attackerCard.damage *= 2;
                window.showVFX(attackerHtmlId, 'heal', '超捕食');
            }
        }

        // 神の一撃
        if (attackerCard.ability === "god_strike") {
            const otherEnemies = enemy.field.filter((c, idx) => (!c.isDead && (targetType !== 'card' || idx !== enemyIndex)));
            if (otherEnemies.length > 0) {
                let tCard = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
                tCard.hp = 0; window.checkDeath(tCard, enemy, `${enemyPrefix}-card-${enemy.field.indexOf(tCard)}`, owner);
                window.showBattleMessage("⚔️ 【神の一撃】が別の敵を葬り去った！", false, 1500, !isPlayer);
            }
        }

        // 範囲魔法
        if (attackerCard.ability === "splash_damage") {
            const otherEnemies = enemy.field.filter((c, idx) => (!c.isDead && (targetType !== 'card' || idx !== enemyIndex)));
            if (otherEnemies.length > 0) {
                otherEnemies.forEach(c => {
                    c.hp -= 10;
                    let idx = enemy.field.indexOf(c);
                    let hId = `${enemyPrefix}-card-${idx}`;
                    window.showVFX(hId, 'damage', 10);
                    window.checkDeath(c, enemy, hId, owner);
                });
                window.showBattleMessage(`🔥 【範囲魔法】他の敵全員に 10 の巻き添えダメージ！`, false, 1500, !isPlayer, true);
                
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            }
        }

        // 次元穿孔
        if (attackerCard.ability === "dimension_drill" && targetType === 'card') {
            const faceId = isPlayer ? 'cpu-face' : 'player-face';
            const ui = document.getElementById('tcg-battle-ui'); 
            if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
            
            window.showDirectAttackCutin(isPlayer, true);
            window.showVFX(faceId, 'damage', dmgToTarget); 
            window.showBattleMessage(`🌪️ 【次元穿孔】敵リーダーも貫いた！`, false, 1500, !isPlayer, true);
            
            enemy.hp -= dmgToTarget;
            
            setTimeout(() => {
                const hpSpan = isPlayer ? document.querySelector('#cpu-face span') : document.querySelector('#player-face div:nth-child(2)');
                if (hpSpan) {
                    hpSpan.style.transition = "all 0.1s";
                    hpSpan.innerText = `HP: ${enemy.hp}`;
                    hpSpan.style.color = '#ff5252';
                    hpSpan.style.transform = 'scale(1.4)';
                    setTimeout(() => {
                        hpSpan.style.color = isPlayer ? '#ff5252' : '#4CAF50';
                        hpSpan.style.transform = 'scale(1)';
                    }, 300);
                }
            }, 500);
        }
        
        // デバフ
        if (attackerCard.ability === "debuff_attack" && target && target.hp > 0 && !target.isDead) {
            target.damage = Math.floor(target.damage / 2);
            window.showVFX(targetHtmlId, 'heal', '攻撃ダウン');
            window.showBattleMessage(`📉 【弱体化】${target.name} の攻撃力が半減した！`, false, 2000, !isPlayer, true);
        }

        if (attackerCard.ability === "pierce_recoil") { dmgToAttacker += 10; }

        // アタッカー側の反撃ダメージ処理
        if (dmgToAttacker > 0) {
            setTimeout(() => {
                attackerCard.hp -= dmgToAttacker; window.showVFX(attackerHtmlId, 'slash'); window.showVFX(attackerHtmlId, 'damage', dmgToAttacker);
                
                let attackerWasAlive = !attackerCard.isDead;
                window.checkDeath(attackerCard, owner, attackerHtmlId, enemy); 

                if (attackerWasAlive && !attackerCard.isDead && attackerCard.ability === "wrath" && dmgToAttacker > 0) {
                    attackerCard.damage += 20;
                    window.showVFX(attackerHtmlId, 'heal', '逆鱗(攻+20)');
                    window.showBattleMessage(`💢 【逆鱗】${attackerCard.name} の攻撃力が上がった！`, false, 1500, isPlayer, true);
                }
                
                if (attackerWasAlive && attackerCard.isDead && attackerCard.ability === "self_destruct" && !attackerCard._has_self_destructed) {
                    enemy.hp -= 30; 
                    const faceId = isPlayer ? 'cpu-face' : 'player-face';
                    window.showVFX(faceId, 'damage', 30);
                    window.showBattleMessage(`💥 【自爆】${attackerCard.name} の爆発でリーダーに30ダメージ！`, false, 1500, isPlayer, true);
                    const ui = document.getElementById('tcg-battle-ui'); 
                    if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
                } 
                if (attackerCard.isDead) attackerCard.canAttack = false; 
                window.renderBattleBoard();
            }, 200);
        }
        
        if (attackerCard.ability === "stealth") attackerCard.ability = null;

        if (attackerCard.ability === "double_strike" && !attackerCard._has_attacked_once && !attackerCard.isDead) {
            attackerCard._has_attacked_once = true;
            window.showBattleMessage(`🌪️ 【連撃】${attackerCard.name} はもう一度攻撃できる！`, false, 1500, !isPlayer, true);
        } else {
            attackerCard.canAttack = false; 
            attackerCard._has_attacked_once = false;
        }

        if(isPlayer) window.TCG_BATTLE.selectedAttackerIndex = -1; 

        setTimeout(() => {
            // ★修正：戦闘後も、お互いの盤面から死体を確実に取り除く
            p.field = p.field.filter(c => !c.isDead); 
            cpu.field = cpu.field.filter(c => !c.isDead);
            window.renderBattleBoard();
            
            if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
            if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
        }, 1100);
    } catch (e) {
        console.error("Attack Execution Error: ", e);
    }
};

// ==========================================
// ★ 進化バッジ正確化パッチ（ID名に依存せず進化深度を判定）
// ==========================================
// ==========================================
// ★ バグ修正：バッジ生成時のエラー回避 ＆ 欠落データ補完パッチ
// ==========================================
window.getCardBadgeInfo = function(card) {
    let badges = [];
    
    // ★追加：typeが未定義の場合、マスターデータから補完する安全装置
    let cType = card.type;
    if (!cType && window.TCG_MASTER[card.masterId]) {
        cType = window.TCG_MASTER[card.masterId].type;
    }
    cType = cType || 'robot'; // それでも無ければデフォルト

    // 1. サポートカード
    if (cType === 'item') { badges.push({ text: '具', color: '#8D6E63' }); return badges; }
    if (cType === 'action') { badges.push({ text: '技', color: '#FFB74D' }); return badges; }
    if (cType === 'field') { badges.push({ text: '地', color: '#4DB6AC' }); return badges; }

    // 2. 基本種族の判定
    const raceMap = {
        'dragon': { t: '竜', c: '#FFC107' }, 'magician': { t: '魔', c: '#9C27B0' },
        'spirit': { t: '精', c: '#4CAF50' }, 'stone': { t: '岩', c: '#795548' },
        'machine': { t: '械', c: '#607D8B' }, 'ghost': { t: '霊', c: '#673AB7' },
        'bird': { t: '鳥', c: '#03A9F4' }, 'beetle': { t: '虫', c: '#8BC34A' },
        'seed': { t: '草', c: '#8BC34A' }, 'balloon': { t: '風', c: '#00BCD4' },
        'robot': { t: '機', c: '#9E9E9E' }
    };

    let baseType = cType.split('_')[0]; 
    if (raceMap[baseType]) {
        badges.push({ text: raceMap[baseType].t, color: raceMap[baseType].c });
    }

    // 3. 進化の段階を判定
    let isStage1 = false;
    let isStage2 = false;

    if (card.evolvesFrom) {
        const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === card.evolvesFrom);
        const parentData = parentKey ? window.TCG_MASTER[parentKey] : null;

        if (parentData && parentData.evolvesFrom) {
            isStage2 = true;
        } else {
            isStage1 = true;
        }
    }

    // 4. 進化属性の判定
    let evoText = ''; let evoColor = '';
    if (cType.includes('type1')) { evoText = '闇'; evoColor = '#9C27B0'; }
    else if (cType.includes('type2')) { evoText = '美'; evoColor = '#E91E63'; }
    else if (cType.includes('type3')) { evoText = '賢'; evoColor = '#2196F3'; }
    else if (cType.includes('type4')) { evoText = '活'; evoColor = '#FF5722'; }
    else if (cType.includes('type5')) { evoText = '老'; evoColor = '#795548'; }

    if (evoText) {
        if (isStage2) evoText += '+'; 
        badges.push({ text: evoText, color: evoColor });
    }

    if (badges.length === 0) badges.push({ text: '無', color: '#999' });

    return badges;
};

// ==========================================
// ★ 進化時の攻撃権（速攻）引き継ぎパッチ
// ==========================================

// プレイヤー側のカード選択（進化・攻撃・防御）処理を上書き
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     // ▼▼▼ ここから追加（ターゲット指定魔法の発動） ▼▼▼
//     if (window.TCG_BATTLE.targetingHandIndex !== -1) {
//         const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
//         p.currentMana -= window.getActualCost(p, supportCard);
//         if (supportCard.type === 'action') p.actionUsed = true;
//         p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
//         window.TCG_BATTLE.targetingHandIndex = -1;
//         window.executeSupportCard(supportCard, targetCard, true);
//         return;
//     }

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
            
//             // ★修正：進化元の「攻撃できる状態か」を記憶しておく！
//             const canAttackInherit = targetCard.canAttack;

//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();

//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);

//             window.animateCardPlay(evoCard, true, () => {
//                 // ★修正：アニメーション完了後、記憶しておいた攻撃権を進化カードに引き継ぐ
//                 evoCard.canAttack = canAttackInherit; 
//                 p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// 敵（CPU）のターン処理を上書き（敵も進化後即殴ってくるようにする）
window.executeCPUTurn = function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const pField = window.TCG_BATTLE.player.field;
    pField.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    // ターン開始時効果
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();

    setTimeout(() => {
        let delay = 0;
        
        // --- 攻撃フェーズ ---
        cpu.field.forEach((cpuCard, cpuIndex) => {
            if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
            
            if (cpuCard.status === "charmed") {
                setTimeout(() => {
                    cpuCard.status = null; cpuCard.canAttack = false;
                    cpu.hp -= cpuCard.damage;
                    window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
                    window.renderBattleBoard();
                }, delay);
                delay += 800;
                return;
            }
            if (cpuCard.status === "stunned") return;

            setTimeout(() => {
                window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
                const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const validTargets = p.field.filter(c => c.ability !== "stealth"); 
                let targetType = 'player'; let tIndex = 0;
                const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
                
                if (tauntTargets.length > 0 && !isPierce) {
                    targetType = 'card'; tIndex = p.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]);
                } else if (validTargets.length > 0 && Math.random() > 0.5) {
                    targetType = 'card'; tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
                }
                window.executeAttack(targetType, tIndex);
            }, delay);
            delay += 800;
        });

        // --- 召喚＆進化フェーズ ---
        setTimeout(() => {
            let cardsToPlay = [];
            for (let i = cpu.hand.length - 1; i >= 0; i--) {
                let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
                if (cpu.currentMana >= actualCost) {
                    if (card.type === 'action' && cpu.actionUsed) continue;
                    if (card.evolvesFrom) {
                        let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                        if (targetIndex !== -1) {
                            cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                            cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        }
                    } else {
                        cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                        cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        if (card.type === 'action') cpu.actionUsed = true;
                    }
                }
            }

            if (cardsToPlay.length > 0) window.renderBattleBoard(); 

            const playNextCard = (idx) => {
                if (idx >= cardsToPlay.length) {
                    finishCPUTurn(); // すべて終わったらターン終了
                    return;
                }
                
                let playData = cardsToPlay[idx];
                let card = playData.card;
                
                window.animateCardPlay(card, false, () => {
                    if (playData.isEvo) {
                        // ★修正：敵CPUも進化元の攻撃権をしっかり引き継ぐ！
                        let prevCard = cpu.field[playData.targetIndex];
                        let canAttackInherit = prevCard ? prevCard.canAttack : false;
                        
                        card.canAttack = canAttackInherit; 
                        cpu.field[playData.targetIndex] = card; 
                        window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else {
                        if (card.type === 'item' || card.type === 'action') { 
                            card.isDead = true; cpu.graveyard.push(card);
                            window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        } else { 
                            card.canAttack = false; cpu.field.push(card); 
                            window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        }
                    }
                    setTimeout(() => { playNextCard(idx + 1); }, 1000); 
                });
            };
            
            playNextCard(0);

            // --- ターン終了処理 ---
            function finishCPUTurn() {
                cpu.field.forEach((c, i) => {
                    if (c.isDead) return;
                    c.status = null; 

                    // ▼▼▼ 自然治癒・CPU側 ▼▼▼
                    if (c.ability === "regeneration" && c.hp < c.maxHp) {
                        let heal = c.maxHp - c.hp; 
                        c.hp = c.maxHp; 
                        window.showVFX(`c-card-${i}`, 'heal', heal);
                    }

                    // ▼▼▼ 霊障・CPU側 ▼▼▼
                    if (c.ability === "haunt") {
                        p.hp -= 20; 
                        window.showVFX('player-face', 'damage', 20);
                        window.showBattleMessage(`👻 【霊障】\n${c.name}の呪いでリーダーに20ダメージ！`, false, 1500, true, true);
                    }

                    if (c.ability === "burn_field" || c.ability === "cataclysm") {
                        let dmg = c.ability === "cataclysm" ? 20 : 10;
                        p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
                    }
                    if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
                    if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
                    if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
                    if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
                    if (c.ability === "event_horizon") {
                        const aliveEnemies = p.field.filter(e => !e.isDead);
                        if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
                    }
                    if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
                        let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
                        cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
                    }
                });
                p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

                if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

                window.startPlayerTurn(false);
            }
        }, delay + 500);
    }, 800); 
};

// ==========================================
// ★ 割り込み防御（インタラプト・ディフェンス）＆ キャンセル実装パッチ
// ==========================================

// ① 防御ヒントの文言を「相手ターンへの割り込み」を強調するものに変更
window.showDefendHintModal = function(onConfirm) {
    let modal = document.getElementById('tcg-defend-hint-modal');
    if (!modal) {
        modal = document.createElement('div'); modal.id = 'tcg-defend-hint-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 30000; display: flex; justify-content: center; align-items: center;`;
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 25px; width: 480px; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5);">
            <h3 style="color: #00BCD4; margin-top: 0;">💡 マナが残っています！</h3>
            <p style="line-height: 1.6; font-size: 15px;">
                自分の場のモンスターをクリックすると、<span style="color:#FFD700; font-weight:bold;">1マナ消費して「🛡️守護」の壁役にさせる</span>ことができます。<br>
                （もう一度クリックで解除し、マナを戻せます）<br><br>
                さらに、マナさえ残しておけば<span style="color:#ff5252; font-weight:bold;">相手のターン中であっても、敵の攻撃の瞬間に割り込んで瞬時に守護を立てる</span>ことが可能です！<br>
                あえてマナを残してターンを終了しますか？
            </p>
            <label style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer; font-size: 14px; color: #ddd; background: #111; padding: 10px; border-radius: 6px;">
                <input type="checkbox" id="defend-hint-checkbox" style="margin-right: 10px; transform: scale(1.3); cursor: pointer;"><span>このバトル中は、次から表示しない</span>
            </label>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <button id="btn-hint-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">盤面に戻る</button>
                <button id="btn-hint-ok" style="flex: 1; padding: 12px; background: #FF9800; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F57C00'" onmouseout="this.style.background='#FF9800'">ターンを終了する</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('btn-hint-cancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btn-hint-ok').onclick = () => {
        if (document.getElementById('defend-hint-checkbox').checked) window.TCG_BATTLE._skipDefendHint = true;
        modal.style.display = 'none'; onConfirm(); 
    };
};

// ② プレイヤーカードの選択処理をアップデート（キャンセルと割り込みの許可）
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // ★ 相手ターンの場合、進化や攻撃はできないが、防御（割り込み・解除）だけは許可する
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (targetCard.ability === "taunt") {
//             window.showBattleMessage(`このカードは元々【かばう】を持っています。`, false, 1500);
//         } else if (targetCard.isDefending) {
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、\n1マナ返還されました。`, false, 1500); window.renderBattleBoard();
//         } else if (p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 相手ターンに割り込み！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); window.renderBattleBoard();
//         } else {
//             window.showBattleMessage("⚠️ マナが足りないため防御できません！", true);
//         }
//         return;
//     }

//     // 進化モードの場合
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             const canAttackInherit = targetCard.canAttack;
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = canAttackInherit; 
//                 p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // 自ターンの攻撃できない/終わったカード、または防御・解除させたい場合
//     if (!targetCard.canAttack || targetCard.damage <= 0 || targetCard.isDefending) {
//         if (targetCard.ability === "taunt") {
//             window.showBattleMessage(`このカードは元々【かばう】を持っています。`, false, 1500);
//         } else if (targetCard.isDefending) { 
//             // ★ 解除処理
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、\n1マナ返還されました。`, false, 1500); window.renderBattleBoard();
//         } else if (p.currentMana >= 1) {
//             // ★ 防御設定
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); window.renderBattleBoard();
//         } else {
//             window.showBattleMessage("⚠️ マナが足りないため防御できません！", true);
//         }
//         return;
//     }

//     // 自ターンの攻撃選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// ③ CPUターン開始時/終了時に「一時的にアビリティを書き換えるバグ」の温床を削除
window._executeCPUTurnPatch_Interrupt = window.executeCPUTurn; 
window.executeCPUTurn = function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    // ★削除: p.field.forEach(c => { if (c.isDefending) { c._tempOriginalAbility = c.ability; c.ability = "taunt"; } });
    // （元のコードではここで一時的にアビリティを書き換えていたため、次のターン以降も守護が残り続けるバグが発生していました。
    //   攻撃対象の判定で既に c.isDefending は考慮されているため、書き換え自体が不要です）

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();

    setTimeout(() => {
        let delay = 0;
        
        // --- 攻撃フェーズ ---
        cpu.field.forEach((cpuCard, cpuIndex) => {
            if (!cpuCard.canAttack || cpuCard.damage <= 0) return;
            
            // 魅了チェック
            if (cpuCard.status === "charmed") {
                setTimeout(() => {
                    cpuCard.status = null; cpuCard.canAttack = false;
                    cpu.hp -= cpuCard.damage;
                    window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
                    window.showBattleMessage(`💕 魅了により、敵が自滅攻撃！`, false, 2000, true);
                    window.renderBattleBoard();
                    
                    // ★追加：自滅によってHPが0になった場合の勝利判定
                    if (cpu.hp <= 0) { 
                        cpu.hp = 0; window.renderBattleBoard(); 
                        window.showBattleMessage("🎉 YOU WIN!!\n相手のHPを0にしました！", false, 5000); 
                        setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); 
                    }
                }, delay);
                delay += 800;
                return;
            }
            if (cpuCard.status === "stunned") return;

            setTimeout(() => {
                window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
                const tauntTargets = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const validTargets = p.field.filter(c => c.ability !== "stealth"); 
                let targetType = 'player'; let tIndex = 0;
                const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
                
                if (tauntTargets.length > 0 && !isPierce) {
                    targetType = 'card'; tIndex = p.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]);
                } else if (validTargets.length > 0 && Math.random() > 0.5) {
                    targetType = 'card'; tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
                }
                window.executeAttack(targetType, tIndex);
            }, delay);
            delay += 800;
        });

        setTimeout(() => {
            let cardsToPlay = [];
            for (let i = cpu.hand.length - 1; i >= 0; i--) {
                let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
                if (cpu.currentMana >= actualCost) {
                    if (card.type === 'action' && cpu.actionUsed) continue;
                    if (card.evolvesFrom) {
                        let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                        if (targetIndex !== -1) {
                            cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                            cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        }
                    } else {
                        cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                        cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                        if (card.type === 'action') cpu.actionUsed = true;
                    }
                }
            }

            if (cardsToPlay.length > 0) window.renderBattleBoard(); 

            const playNextCard = (idx) => {
                if (idx >= cardsToPlay.length) {
                    finishCPUTurn(); // すべて終わったらターン終了
                    return;
                }
                
                let playData = cardsToPlay[idx];
                let card = playData.card;
                
                window.animateCardPlay(card, false, () => {
                    if (playData.isEvo) {
                        let prevCard = cpu.field[playData.targetIndex];
                        let canAttackInherit = prevCard ? prevCard.canAttack : false;
                        
                        // ★追加：CPU側も進化前のステータス変動を引き継ぐ
                        if (prevCard) {
                            const hpDiff = prevCard.hp - prevCard.maxHp;
                            const masterTarget = window.TCG_MASTER[prevCard.masterId];
                            const dmgDiff = prevCard.damage - (masterTarget ? (masterTarget.baseDmg || 0) : 0);
                            
                            card.hp = Math.max(1, card.maxHp + hpDiff);
                            if (card.hp > card.maxHp) card.maxHp = card.hp;
                            card.damage = Math.max(0, card.damage + dmgDiff);
                        }
                        
                        card.canAttack = canAttackInherit; 
                        cpu.field[playData.targetIndex] = card; 
                        window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else {
                        if (card.type === 'item' || card.type === 'action') { 
                            card.isDead = true; cpu.graveyard.push(card);
                            window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        } else { 
                            card.canAttack = false; cpu.field.push(card); 
                            window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                            window.triggerPlayEffect(card, false); 
                        }
                    }
                    setTimeout(() => { playNextCard(idx + 1); }, 1000); 
                });
            };
            
            playNextCard(0);

            function finishCPUTurn() {
                // ★削除: pField.forEach(c => { if (c.isDefending && c._tempOriginalAbility !== undefined) c.ability = c._tempOriginalAbility; });

                cpu.field.forEach((c, i) => {
                    if (c.isDead) return;
                    c.status = null; 
                    if (c.ability === "burn_field" || c.ability === "cataclysm") {
                        let dmg = c.ability === "cataclysm" ? 20 : 10;
                        p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
                    }
                    if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
                    if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
                    if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
                    if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
                    if (c.ability === "event_horizon") {
                        const aliveEnemies = p.field.filter(e => !e.isDead);
                        if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
                    }
                    if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
                        let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
                        cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
                    }
                });
                p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

                if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

                window.startPlayerTurn(false);
            }

        }, delay + 500);
    }, 800); 
};

// ④ 相手ターン中でも「防御（解除）可能」なカードにはマウスポインターをつけるパッチ
const _originalRenderBattleBoard_cursorPatch2 = window.renderBattleBoard;
window.renderBattleBoard = function() {
    _originalRenderBattleBoard_cursorPatch2();
    
    const p = window.TCG_BATTLE.player;
    if (window.TCG_BATTLE.isEnemyTurn) {
        const pCards = document.querySelectorAll('#tcg-battle-ui [id^="p-card-"]');
        pCards.forEach((el, index) => {
            const card = p.field[index];
            if (card && card.ability !== "taunt" && !card.isDead && card.status !== 'stunned') {
                // すでに防御中なら解除のためクリック可能、マナが1以上あれば防御のためにクリック可能
                if (card.isDefending || p.currentMana >= 1) {
                    el.style.cursor = "pointer";
                }
            }
        });
    }
};

// ==========================================
// ★ 超絶戦術パッチ：割り込み防御（インタラプト）＆ 守護キャンセル実装
// ==========================================

// 便利な待機関数（名前被りエラー防止のため変更・統一）
window.tcgSleep = window.tcgSleep || (ms => new Promise(r => setTimeout(r, ms)));

// ① 防御ヒントの文言を「相手ターンへの割り込み」を強調するものに変更
window.showDefendHintModal = function(onConfirm) {
    let modal = document.getElementById('tcg-defend-hint-modal');
    if (!modal) {
        modal = document.createElement('div'); modal.id = 'tcg-defend-hint-modal';
        modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 30000; display: flex; justify-content: center; align-items: center;`;
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 3px solid #00BCD4; border-radius: 12px; padding: 25px; width: 480px; color: white; font-family: sans-serif; box-shadow: 0 0 30px rgba(0, 188, 212, 0.5);">
            <h3 style="color: #00BCD4; margin-top: 0;">💡 マナが残っています！</h3>
            <p style="line-height: 1.6; font-size: 15px;">
                盤面のモンスターをクリックすると、<span style="color:#FFD700; font-weight:bold;">1マナ消費して「🛡️守護」の壁役にさせる</span>ことができます。<br>
                <span style="font-size: 12px; color:#aaa;">※自分のターン中は「行動済み」のモンスターのみ指定可能ですが、<br>
                マナさえ残しておけば、<span style="color:#ff5252; font-weight:bold;">相手のターン中の【割り込み】時に「未行動」のモンスターも守護にできます！</span></span><br><br>
                あえてマナを残してターンを終了しますか？
            </p>
            <label style="display: flex; align-items: center; margin-bottom: 20px; cursor: pointer; font-size: 14px; color: #ddd; background: #111; padding: 10px; border-radius: 6px;">
                <input type="checkbox" id="defend-hint-checkbox" style="margin-right: 10px; transform: scale(1.3); cursor: pointer;"><span>このバトル中は、次から表示しない</span>
            </label>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <button id="btn-hint-cancel" style="flex: 1; padding: 12px; background: #555; color: white; border: 2px solid #777; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'">盤面に戻る</button>
                <button id="btn-hint-ok" style="flex: 1; padding: 12px; background: #FF9800; color: white; border: 2px solid #FFF; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;" onmouseover="this.style.background='#F57C00'" onmouseout="this.style.background='#FF9800'">ターンを終了する</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('btn-hint-cancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btn-hint-ok').onclick = () => {
        if (document.getElementById('defend-hint-checkbox').checked) window.TCG_BATTLE._skipDefendHint = true;
        modal.style.display = 'none'; onConfirm(); 
    };
};

// ② プレイヤーカードの選択処理をアップデート（キャンセルと割り込みの許可）
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // ★ 相手ターンの場合（割り込み処理）
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (window.TCG_BATTLE.isIntercepting) {
//             // 割り込み画面が出ている時のクリック処理
//             if (targetCard.ability === "taunt" || targetCard.isDefending) {
//                 // 守護モンスターを身代わりとして決定！
//                 window.finishIntercept('card', index);
//             } else if (p.currentMana >= 1 && (!targetCard.canAttack || targetCard.damage <= 0) && targetCard.status !== "stunned") {
//                 // マナを使ってとっさに守護を追加！
//                 p.currentMana -= 1; targetCard.isDefending = true;
//                 window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                 window.renderBattleBoard();
                
//                 // スルーボタンを消す（守護ができたので必ず受ける必要がある）
//                 let ui = document.getElementById('tcg-intercept-ui');
//                 if (ui) {
//                     let btn = ui.querySelector('button');
//                     if (btn) btn.remove();
//                     ui.querySelector('p').innerHTML = "守護モンスターが複数います。<br>どのモンスターで攻撃を受けますか？対象をクリックしてください。";
//                 }
//             } else {
//                 window.showBattleMessage("⚠️ そのカードは防御や対象に選べません", true);
//             }
//         }
//         return;
//     }

//     // 進化モードの場合
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             const canAttackInherit = targetCard.canAttack;
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = canAttackInherit; 
//                 p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // ★ 自ターンの防御付与＆キャンセル処理
//     if (!targetCard.canAttack || targetCard.damage <= 0 || targetCard.isDefending) {
//         if (targetCard.isDefending) { 
//             // 【新機能】キャンセルしてマナを返還
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、1マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } else if (targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             // 防御付与
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//             window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//             window.renderBattleBoard();
//         } else if (targetCard.ability === "taunt") {
//             window.showBattleMessage(`このカードは元々【かばう】を持っています。`, false, 1500);
//         }
//         return;
//     }

//     // 自ターンの攻撃選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// ③ ターン開始時に「後付けの防御姿勢」を完全リセットする
const _baseStartPlayerTurn = window.startPlayerTurn;
window.startPlayerTurn = function(isFirstTurn = false) {
    const p = window.TCG_BATTLE.player;
    // 自ターン開始時に、後付けの防御姿勢を解除
    p.field.forEach(c => { c.isDefending = false; });
    _baseStartPlayerTurn(isFirstTurn);
};

// ④ 割り込み処理の完了ヘルパー
window.finishIntercept = function(targetType, targetIndex) {
    window.TCG_BATTLE.isIntercepting = false;
    let interceptUI = document.getElementById("tcg-intercept-ui");
    if (interceptUI) interceptUI.remove();
    
    let resolve = window.TCG_BATTLE.interceptResolve;
    if (resolve) {
        window.TCG_BATTLE.interceptResolve = null;
        resolve({ targetType, targetIndex });
    }
};

// ⑤ CPUターン（攻撃フェーズ）を非同期化して、割り込みを可能にする大改修！
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    // ターン開始時効果
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();
    await window.tcgSleep(1000); // ★修正

    // --- 攻撃フェーズ（割り込み待機可能ループ） ---
    for (let cpuIndex = 0; cpuIndex < cpu.field.length; cpuIndex++) {
        let cpuCard = cpu.field[cpuIndex];
        if (!cpuCard || !cpuCard.canAttack || cpuCard.damage <= 0 || cpuCard.isDead) continue;
        
        if (cpuCard.status === "charmed") {
            cpuCard.status = null; cpuCard.canAttack = false;
            cpu.hp -= cpuCard.damage;
            window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
            window.renderBattleBoard();
            await sleep(800);
            continue;
        }
        if (cpuCard.status === "stunned") continue;

        // 攻撃前のアニメーション表示
        window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
        window.renderBattleBoard();
        
        const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
        
        let targetType = 'player';
        let tIndex = 0;

        if (!isPierce) {
            // ★ プレイヤーの割り込み判断＆待機処理！
            let targetInfo = await new Promise(resolve => {
                const taunts = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const canTaunt = p.field.some(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && !c.isDead && c.status !== "stunned");
                const hasMana = p.currentMana >= 1;

                // もしオートバトル中なら、自動で判断してスキップ
                if (window.TCG_BATTLE.isAuto) {
                    if (taunts.length > 0) resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[Math.floor(Math.random() * taunts.length)]) });
                    else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead);
                        if (valids.length > 0 && Math.random() > 0.5) resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        else resolve({ targetType: 'player', targetIndex: 0 });
                    }
                    return;
                }

                // マナが残っているか、守護が複数いる場合は「割り込みUI」を表示して時間を止める！
                if ((hasMana && canTaunt) || taunts.length >= 2) {
                    window.TCG_BATTLE.isIntercepting = true;
                    window.TCG_BATTLE.interceptResolve = resolve;

                    let interceptUI = document.createElement('div');
                    interceptUI.id = "tcg-intercept-ui";
                    interceptUI.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.9); padding:20px 30px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 50px rgba(255,152,0,0.8); pointer-events:auto;`;
                    
                    let html = `<h3 style="color:#ff9800; margin:0 0 15px 0; font-size:24px; text-shadow:0 2px 4px #000;">⚠️ 敵の攻撃！ (${cpuCard.name})</h3>`;
                    
                    if (hasMana && canTaunt) {
                        html += `<p style="color:#fff; font-size:16px; margin-bottom:20px; line-height:1.6;">マナを消費して「守護」を追加できます。<br>どのモンスターで攻撃を受けますか？<br><span style="color:#00BCD4;">盤面の味方をクリックして指定してください。</span></p>`;
                    } else if (taunts.length > 1) {
                        html += `<p style="color:#fff; font-size:16px; margin-bottom:20px; line-height:1.6;">守護モンスターが複数います。<br>どのモンスターで攻撃を受けますか？<br><span style="color:#00BCD4;">盤面の味方をクリックして指定してください。</span></p>`;
                    }

                    // 守護が1体もいない場合だけ「スルー」ボタンを出す
                    if (taunts.length === 0) {
                        html += `<button onclick="window.finishIntercept('player', 0)" style="padding:12px 25px; background:#f44336; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.5); transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">守護せずリーダーで受ける</button>`;
                    } else if (taunts.length === 1 && !hasMana) {
                        // マナもなく守護が1体だけの場合は、UIを出さずに自動でそこに吸い寄せる
                        window.TCG_BATTLE.isIntercepting = false;
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                        return; 
                    }
                    
                    interceptUI.innerHTML = html;
                    document.getElementById('tcg-battle-ui').appendChild(interceptUI);
                } else {
                    // 何もできない場合は自動処理
                    if (taunts.length > 0) {
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                    } else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
                        if (valids.length > 0 && Math.random() > 0.5) {
                            resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        } else {
                            resolve({ targetType: 'player', targetIndex: 0 });
                        }
                    }
                }
            });
            
            targetType = targetInfo.targetType;
            tIndex = targetInfo.targetIndex;
            
        } else {
            // 貫通攻撃の場合は割り込み不可。ランダムか顔面へ
            const validTargets = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
            if (validTargets.length > 0 && Math.random() > 0.5) {
                targetType = 'card';
                tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
            }
        }

        window.executeAttack(targetType, tIndex);
        await sleep(1500); // 攻撃演出が終わるのを待つ
    }

    // --- 召喚＆進化フェーズ ---
    let cardsToPlay = [];
    for (let i = cpu.hand.length - 1; i >= 0; i--) {
        let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
        if (cpu.currentMana >= actualCost) {
            if (card.type === 'action' && cpu.actionUsed) continue;
            if (card.evolvesFrom) {
                let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                if (targetIndex !== -1) {
                    cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                }
            } else {
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                if (card.type === 'action') cpu.actionUsed = true;
            }
        }
    }

    if (cardsToPlay.length > 0) window.renderBattleBoard(); 

    // カードを順番に出す処理
    for (let idx = 0; idx < cardsToPlay.length; idx++) {
        let playData = cardsToPlay[idx]; let card = playData.card;
        
        await new Promise(resolve => {
            window.animateCardPlay(card, false, () => {
                if (playData.isEvo) {
                    let prevCard = cpu.field[playData.targetIndex];
                    let canAttackInherit = prevCard ? prevCard.canAttack : false;
                    
                    card.canAttack = canAttackInherit; 
                    cpu.field[playData.targetIndex] = card; 
                    window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                    window.triggerPlayEffect(card, false); 
                } else {
                    if (card.type === 'item' || card.type === 'action') { 
                        card.isDead = true; cpu.graveyard.push(card);
                        window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else { 
                        card.canAttack = false; cpu.field.push(card); 
                        window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    }
                }
                setTimeout(resolve, 1000); 
            });
        });
    }

    // --- ターン終了処理 ---
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        c.status = null; 
        if (c.ability === "burn_field" || c.ability === "cataclysm") {
            let dmg = c.ability === "cataclysm" ? 20 : 10;
            p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
        }
        if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") {
            const aliveEnemies = p.field.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
        }
        if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
            let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
            cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
        }
    });
    p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.startPlayerTurn(false);
};

// ==========================================
// ★ 割り込みUI（インタラプト）視認性＆ダメージ表示 改善パッチ
// ==========================================

// ① プレイヤーカードの選択処理（割り込み中のUIテキスト変更に対応）
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // ★ 相手ターンの場合（割り込み処理）
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (window.TCG_BATTLE.isIntercepting) {
//             // 割り込み画面が出ている時のクリック処理
//             if (targetCard.ability === "taunt" || targetCard.isDefending) {
//                 // 守護モンスターを身代わりとして決定！
//                 window.finishIntercept('card', index);
//             } else if (p.currentMana >= 1 && (!targetCard.canAttack || targetCard.damage <= 0) && targetCard.status !== "stunned") {
//                 // マナを使ってとっさに守護を追加！
//                 p.currentMana -= 1; targetCard.isDefending = true;
//                 window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                 window.renderBattleBoard();
                
//                 // スルーボタンを消す（守護ができたので必ず受ける必要がある）
//                 let ui = document.getElementById('tcg-intercept-ui');
//                 if (ui) {
//                     let btn = ui.querySelector('button');
//                     if (btn) btn.remove();
//                     let pElem = ui.querySelector('p');
//                     if (pElem) pElem.innerHTML = "守護が複数います。<br><span style='color:#00BCD4; font-weight:bold;'>受ける味方をクリック</span>";
//                 }
//             } else {
//                 window.showBattleMessage("⚠️ そのカードは防御や対象に選べません", true);
//             }
//         }
//         return;
//     }

//     // 進化モードの場合
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             const canAttackInherit = targetCard.canAttack;
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard();
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = canAttackInherit; 
//                 p.field[index] = evoCard;  
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.triggerPlayEffect(evoCard, true); 
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // 自ターンの防御付与＆キャンセル処理
//     if (!targetCard.canAttack || targetCard.damage <= 0 || targetCard.isDefending) {
//         if (targetCard.isDefending) { 
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、1マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } else if (targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//             window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//             window.renderBattleBoard();
//         } else if (targetCard.ability === "taunt") {
//             window.showBattleMessage(`このカードは元々【かばう】を持っています。`, false, 1500);
//         }
//         return;
//     }

//     // 自ターンの攻撃選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
//             setTimeout(() => {
//                 if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };


// ② CPUターン（攻撃フェーズの割り込みUI表示を改善）
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    // ターン開始時効果
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();
    await window.tcgSleep(1000); // ★修正

    // --- 攻撃フェーズ ---
    for (let cpuIndex = 0; cpuIndex < cpu.field.length; cpuIndex++) {
        let cpuCard = cpu.field[cpuIndex];
        if (!cpuCard || !cpuCard.canAttack || cpuCard.damage <= 0 || cpuCard.isDead) continue;
        
        if (cpuCard.status === "charmed") {
            cpuCard.status = null; cpuCard.canAttack = false;
            cpu.hp -= cpuCard.damage;
            window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
            window.renderBattleBoard();
            await sleep(800);
            continue;
        }
        if (cpuCard.status === "stunned") continue;

        window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
        window.renderBattleBoard();
        
        const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
        
        let targetType = 'player';
        let tIndex = 0;

        if (!isPierce) {
            let targetInfo = await new Promise(resolve => {
                const taunts = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const canTaunt = p.field.some(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && !c.isDead && c.status !== "stunned");
                const hasMana = p.currentMana >= 1;

                if (window.TCG_BATTLE.isAuto) {
                    if (taunts.length > 0) resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[Math.floor(Math.random() * taunts.length)]) });
                    else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead);
                        if (valids.length > 0 && Math.random() > 0.5) resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        else resolve({ targetType: 'player', targetIndex: 0 });
                    }
                    return;
                }

                if ((hasMana && canTaunt) || taunts.length >= 2) {
                    window.TCG_BATTLE.isIntercepting = true;
                    window.TCG_BATTLE.interceptResolve = resolve;

                    let interceptUI = document.createElement('div');
                    interceptUI.id = "tcg-intercept-ui";
                    // ★修正：盤面を隠さないように右端中央に配置し、コンパクトにする
                    interceptUI.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 30px rgba(255,152,0,0.8); pointer-events:auto; width: 280px;`;
                    
                    // ★修正：敵の名前と「ダメージ数」をはっきり表示する
                    let html = `<h3 style="color:#ff9800; margin:0 0 10px 0; font-size:20px; text-shadow:0 2px 4px #000;">⚠️ 敵の攻撃！</h3>`;
                    html += `<div style="font-size:18px; color:#fff; margin-bottom: 15px; font-weight:bold;">${cpuCard.name}<br><span style="color:#ff5252; font-size:24px;">${cpuCard.damage} ダメージ</span></div>`;
                    
                    if (hasMana && canTaunt) {
                        html += `<p style="color:#ddd; font-size:13px; margin-bottom:15px; line-height:1.4;">マナを消費して「守護」を追加できます。<br><span style="color:#00BCD4; font-weight:bold;">盤面の味方をクリック</span></p>`;
                    } else if (taunts.length > 1) {
                        html += `<p style="color:#ddd; font-size:13px; margin-bottom:15px; line-height:1.4;">守護が複数います。<br><span style="color:#00BCD4; font-weight:bold;">受ける味方をクリック</span></p>`;
                    }

                    if (taunts.length === 0) {
                        html += `<button onclick="window.finishIntercept('player', 0)" style="padding:10px 15px; background:#f44336; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; width:100%; box-shadow:0 4px 10px rgba(0,0,0,0.5); transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">守護せずリーダーで受ける</button>`;
                    } else if (taunts.length === 1 && !hasMana) {
                        window.TCG_BATTLE.isIntercepting = false;
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                        return; 
                    }
                    
                    interceptUI.innerHTML = html;
                    document.getElementById('tcg-battle-ui').appendChild(interceptUI);
                } else {
                    if (taunts.length > 0) {
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                    } else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
                        if (valids.length > 0 && Math.random() > 0.5) {
                            resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        } else {
                            resolve({ targetType: 'player', targetIndex: 0 });
                        }
                    }
                }
            });
            
            targetType = targetInfo.targetType;
            tIndex = targetInfo.targetIndex;
            
        } else {
            const validTargets = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
            if (validTargets.length > 0 && Math.random() > 0.5) {
                targetType = 'card';
                tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
            }
        }

        window.executeAttack(targetType, tIndex);
        await sleep(1500); 
    }

    // --- 召喚＆進化フェーズ ---
    let cardsToPlay = [];
    for (let i = cpu.hand.length - 1; i >= 0; i--) {
        let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
        if (cpu.currentMana >= actualCost) {
            if (card.type === 'action' && cpu.actionUsed) continue;
            if (card.evolvesFrom) {
                let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                if (targetIndex !== -1) {
                    cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                }
            } else {
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                if (card.type === 'action') cpu.actionUsed = true;
            }
        }
    }

    if (cardsToPlay.length > 0) window.renderBattleBoard(); 

    for (let idx = 0; idx < cardsToPlay.length; idx++) {
        let playData = cardsToPlay[idx]; let card = playData.card;
        
        await new Promise(resolve => {
            window.animateCardPlay(card, false, () => {
                if (playData.isEvo) {
                    let prevCard = cpu.field[playData.targetIndex];
                    let canAttackInherit = prevCard ? prevCard.canAttack : false;
                    
                    card.canAttack = canAttackInherit; 
                    cpu.field[playData.targetIndex] = card; 
                    window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                    window.triggerPlayEffect(card, false); 
                } else {
                    if (card.type === 'item' || card.type === 'action') { 
                        card.isDead = true; cpu.graveyard.push(card);
                        window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else { 
                        card.canAttack = false; cpu.field.push(card); 
                        window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    }
                }
                setTimeout(resolve, 1000); 
            });
        });
    }

    // --- ターン終了処理 ---
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        c.status = null; 
        if (c.ability === "burn_field" || c.ability === "cataclysm") {
            let dmg = c.ability === "cataclysm" ? 20 : 10;
            p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
        }
        if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") {
            const aliveEnemies = p.field.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
        }
        if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
            let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
            cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
        }
    });
    p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.startPlayerTurn(false);
};

// ==========================================
// ★ バグ修正パッチ（守護進行ストップ、攻撃表示ズレ、sleep重複エラー）
// ==========================================

// 1. sleep関数の重複エラーを回避
window.tcgSleep = ms => new Promise(r => setTimeout(r, ms));

// 2. 欠落していた「割り込み完了処理（finishIntercept）」を復活
window.finishIntercept = function(targetType, targetIndex) {
    window.TCG_BATTLE.isIntercepting = false;
    let interceptUI = document.getElementById("tcg-intercept-ui");
    if (interceptUI) interceptUI.remove();
    
    let resolve = window.TCG_BATTLE.interceptResolve;
    if (resolve) {
        window.TCG_BATTLE.interceptResolve = null;
        resolve({ targetType, targetIndex });
    }
};

// 3. 盤面描画の修正：敵ターン中に味方のカードが浮き上がるバグを修正
window._originalRenderBattleBoard_fixAttacker = window._originalRenderBattleBoard_fixAttacker || window.renderBattleBoard;
window.renderBattleBoard = function() {
    window._originalRenderBattleBoard_fixAttacker();

    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;
    const isEnemyTurn = window.TCG_BATTLE.isEnemyTurn;

    const allPCards = document.querySelectorAll('#tcg-battle-ui [id^="p-card-"]');
    const allCCards = document.querySelectorAll('#tcg-battle-ui [id^="c-card-"]');

    allPCards.forEach((el, index) => {
        const card = p.field[index];
        if (!card) return;
        
        let filter = "grayscale(50%) opacity(70%)";
        let yOffset = "0px";
        let currentScale = el.style.transform.match(/scale\((.*?)\)/) ? el.style.transform.match(/scale\((.*?)\)/)[1] : 0.65;
        let isAttacker = (!isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex === index);

        if (isAttacker) {
            filter = "drop-shadow(0 0 20px #FFD700)"; 
            yOffset = "-20px"; 
        } else if (card.canAttack && card.status !== 'stunned') {
            filter = "drop-shadow(0 0 10px #4CAF50)"; 
        }

        if (card.isDefending) filter = "drop-shadow(0 0 15px #2196F3)";
        
        // ★ 割り込みUI表示中、選べる「守護」のカードを青く光らせて分かりやすくする！
        if (window.TCG_BATTLE.isIntercepting && (card.ability === 'taunt' || card.isDefending)) {
            filter = "drop-shadow(0 0 20px #00BCD4) brightness(1.2)"; 
        }

        el.style.filter = filter;
        if (!card.isDead && window.TCG_BATTLE.selectedHandCardIndex === -1) { 
             el.style.transform = `scale(${currentScale}) translateY(${yOffset})`;
        }
    });

    allCCards.forEach((el, index) => {
        const card = cpu.field[index];
        if (!card) return;
        
        let isAttacker = (isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex === index);
        let yOffset = "0px";
        let currentScale = el.style.transform.match(/scale\((.*?)\)/) ? el.style.transform.match(/scale\((.*?)\)/)[1] : 0.65;

        if (isAttacker) {
            yOffset = "20px"; // 敵は手前（下）に迫ってくるように浮き上がる
            el.style.zIndex = "100";
            el.style.filter = "drop-shadow(0 0 20px #ff5252)";
        }

        if (!card.isDead) {
             el.style.transform = `scale(${currentScale}) translateY(${yOffset})`;
        }
    });
};

// 4. CPUターンの sleep を tcgSleep に置き換え
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => card.canAttack = true);
    window.renderBattleBoard();
    await window.tcgSleep(1000);

    for (let cpuIndex = 0; cpuIndex < cpu.field.length; cpuIndex++) {
        let cpuCard = cpu.field[cpuIndex];
        if (!cpuCard || !cpuCard.canAttack || cpuCard.damage <= 0 || cpuCard.isDead) continue;
        
        if (cpuCard.status === "charmed") {
            cpuCard.status = null; cpuCard.canAttack = false;
            cpu.hp -= cpuCard.damage;
            window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
            window.renderBattleBoard();
            await window.tcgSleep(800);
            continue;
        }
        if (cpuCard.status === "stunned") continue;

        window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
        window.renderBattleBoard();
        
        const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
        
        let targetType = 'player';
        let tIndex = 0;

        if (!isPierce) {
            let targetInfo = await new Promise(resolve => {
                const taunts = p.field.filter(c => c.ability === "taunt" || c.isDefending);
                const canTaunt = p.field.some(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && !c.isDead && c.status !== "stunned");
                const hasMana = p.currentMana >= 1;

                if (window.TCG_BATTLE.isAuto) {
                    if (taunts.length > 0) resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[Math.floor(Math.random() * taunts.length)]) });
                    else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead);
                        if (valids.length > 0 && Math.random() > 0.5) resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        else resolve({ targetType: 'player', targetIndex: 0 });
                    }
                    return;
                }

                if ((hasMana && canTaunt) || taunts.length >= 2) {
                    window.TCG_BATTLE.isIntercepting = true;
                    window.TCG_BATTLE.interceptResolve = resolve;
                    window.renderBattleBoard(); // ハイライト更新

                    let interceptUI = document.createElement('div');
                    interceptUI.id = "tcg-intercept-ui";
                    interceptUI.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 30px rgba(255,152,0,0.8); pointer-events:auto; width: 280px;`;
                    
                    let html = `<h3 style="color:#ff9800; margin:0 0 10px 0; font-size:20px; text-shadow:0 2px 4px #000;">⚠️ 敵の攻撃！</h3>`;
                    html += `<div style="font-size:18px; color:#fff; margin-bottom: 15px; font-weight:bold;">${cpuCard.name}<br><span style="color:#ff5252; font-size:24px;">${cpuCard.damage} ダメージ</span></div>`;
                    
                    if (hasMana && canTaunt) {
                        html += `<p style="color:#ddd; font-size:13px; margin-bottom:15px; line-height:1.4;">マナを消費して「守護」を追加できます。<br><span style="color:#00BCD4; font-weight:bold;">盤面の味方をクリック</span></p>`;
                    } else if (taunts.length > 1) {
                        html += `<p style="color:#ddd; font-size:13px; margin-bottom:15px; line-height:1.4;">守護が複数います。<br><span style="color:#00BCD4; font-weight:bold;">受ける味方をクリック</span></p>`;
                    }

                    if (taunts.length === 0) {
                        html += `<button onclick="window.finishIntercept('player', 0)" style="padding:10px 15px; background:#f44336; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; width:100%; box-shadow:0 4px 10px rgba(0,0,0,0.5); transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">守護せずリーダーで受ける</button>`;
                    } else if (taunts.length === 1 && !hasMana) {
                        window.TCG_BATTLE.isIntercepting = false;
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                        return; 
                    }
                    
                    interceptUI.innerHTML = html;
                    document.getElementById('tcg-battle-ui').appendChild(interceptUI);
                } else {
                    if (taunts.length > 0) {
                        resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                    } else {
                        const valids = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
                        if (valids.length > 0 && Math.random() > 0.5) {
                            resolve({ targetType: 'card', targetIndex: p.field.indexOf(valids[Math.floor(Math.random() * valids.length)]) });
                        } else {
                            resolve({ targetType: 'player', targetIndex: 0 });
                        }
                    }
                }
            });
            
            targetType = targetInfo.targetType;
            tIndex = targetInfo.targetIndex;
            
        } else {
            const validTargets = p.field.filter(c => c.ability !== "stealth" && !c.isDead); 
            if (validTargets.length > 0 && Math.random() > 0.5) {
                targetType = 'card';
                tIndex = p.field.indexOf(validTargets[Math.floor(Math.random() * validTargets.length)]);
            }
        }

        window.TCG_BATTLE.selectedAttackerIndex = -1; // 攻撃終了でハイライト解除
        window.executeAttack(targetType, tIndex);
        await window.tcgSleep(1500); 

        // ▼▼▼ CPUの連撃対応 ▼▼▼
        if (cpuCard.ability === "double_strike" && cpuCard.canAttack && !cpuCard.isDead) {
            cpuIndex--; // 配列のインデックスを戻して、同じカードにもう一度攻撃させる
        }
    }

    // --- 召喚＆進化フェーズ ---
    let cardsToPlay = [];
    for (let i = cpu.hand.length - 1; i >= 0; i--) {
        let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
        if (cpu.currentMana >= actualCost) {
            if (card.type === 'action' && cpu.actionUsed) continue;
            if (card.evolvesFrom) {
                let targetIndex = cpu.field.findIndex(c => c.type === card.evolvesFrom);
                if (targetIndex !== -1) {
                    cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                }
            } else {
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                if (card.type === 'action') cpu.actionUsed = true;
            }
        }
    }

    if (cardsToPlay.length > 0) window.renderBattleBoard(); 

    for (let idx = 0; idx < cardsToPlay.length; idx++) {
        let playData = cardsToPlay[idx]; let card = playData.card;
        
        await new Promise(resolve => {
            window.animateCardPlay(card, false, () => {
                if (playData.isEvo) {
                    let prevCard = cpu.field[playData.targetIndex];
                    let canAttackInherit = prevCard ? prevCard.canAttack : false;
                    
                    card.canAttack = canAttackInherit; 
                    cpu.field[playData.targetIndex] = card; 
                    window.showBattleMessage(`✨ 敵が ${card.name} に進化した！`, false, 2000, true);
                    window.triggerPlayEffect(card, false); 
                } else {
                    if (card.type === 'item' || card.type === 'action') { 
                        card.isDead = true; cpu.graveyard.push(card);
                        window.showBattleMessage(`✨ 敵が ${card.name} を使用！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    } else { 
                        card.canAttack = false; cpu.field.push(card); 
                        window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                        window.triggerPlayEffect(card, false); 
                    }
                }
                setTimeout(resolve, 1000); 
            });
        });
    }

    // --- ターン終了処理 ---
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        c.status = null; 
        if (c.ability === "burn_field" || c.ability === "cataclysm") {
            let dmg = c.ability === "cataclysm" ? 20 : 10;
            p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
        }
        if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") {
            const aliveEnemies = p.field.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
        }
        if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
            let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
            cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
        }
    });
    p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.startPlayerTurn(false);
};

// ==========================================
// ★ 割り込み防御の完全版 ＆ 進行停止・表示バグ修正パッチ
// ==========================================

// 2. 欠落していた「割り込み完了」の処理関数を復活！
window.finishIntercept = function(targetType, targetIndex) {
    window.TCG_BATTLE.isIntercepting = false;
    let interceptUI = document.getElementById("tcg-intercept-ui");
    if (interceptUI) interceptUI.remove();
    
    let resolve = window.TCG_BATTLE.interceptResolve;
    if (resolve) {
        window.TCG_BATTLE.interceptResolve = null;
        resolve({ targetType, targetIndex });
    }
};

// 3. 盤面描画の修正：敵ターン中に味方のカードが浮き上がるバグを修正
window._originalRenderBattleBoard_fixAttacker = window._originalRenderBattleBoard_fixAttacker || window.renderBattleBoard;
window.renderBattleBoard = function() {
    window._originalRenderBattleBoard_fixAttacker();

    // ★追加：描画のたびにBGMの状況（チャンス・ピンチ）を確認
    window.updateTCGBattleBGM();

    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;
    const isEnemyTurn = window.TCG_BATTLE.isEnemyTurn;

    // プレイヤーのカード表示調整
    const allPCards = document.querySelectorAll('#tcg-battle-ui [id^="p-card-"]');
    allPCards.forEach((el, index) => {
        const card = p.field[index];
        if (!card) return;
        
        let filter = "grayscale(50%) opacity(70%)";
        let yOffset = "0px";
        let currentScale = el.style.transform.match(/scale\((.*?)\)/) ? el.style.transform.match(/scale\((.*?)\)/)[1] : 0.65;
        
        // ★修正：自分のターンでのみ「自分が攻撃中」と判定する
        let isAttacker = (!isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex === index);

        if (isAttacker) {
            filter = "drop-shadow(0 0 20px #FFD700)"; 
            yOffset = "-20px"; 
        } else if (card.canAttack && card.status !== 'stunned') {
            filter = "drop-shadow(0 0 10px #4CAF50)"; 
        }

        if (card.isDefending) filter = "drop-shadow(0 0 15px #2196F3)";
        
        // 割り込みUI表示中、クリックできる「守護」のカードを青く光らせる
        if (window.TCG_BATTLE.isIntercepting) {
            if (window.TCG_BATTLE.interceptPhase === 'adding' && !card.isDefending && card.ability !== "taunt" && card.ability !== "pure_aegis" && card.status !== "stunned") {
                filter = "drop-shadow(0 0 20px #FFD700) brightness(1.2)";
            } else if (window.TCG_BATTLE.interceptPhase === 'selecting' && (card.ability === 'taunt' || card.ability === 'pure_aegis' || card.isDefending)) {
                filter = "drop-shadow(0 0 20px #00BCD4) brightness(1.2)"; // 身代わりにできるカードは青く
            } else {
                filter = "grayscale(80%) opacity(40%)"; // それ以外は暗く
            }
        }

        el.style.filter = filter;
        if (!card.isDead && window.TCG_BATTLE.selectedHandCardIndex === -1) { 
             el.style.transform = `scale(${currentScale}) translateY(${yOffset})`;
        }
    });

    // CPUのカード表示調整
    const allCCards = document.querySelectorAll('#tcg-battle-ui [id^="c-card-"]');
    allCCards.forEach((el, index) => {
        const card = cpu.field[index];
        if (!card) return;
        
        // ★修正：敵のターンでのみ「敵が攻撃中」と判定する
        let isAttacker = (isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex === index);
        let yOffset = "0px";
        let currentScale = el.style.transform.match(/scale\((.*?)\)/) ? el.style.transform.match(/scale\((.*?)\)/)[1] : 0.65;

        if (isAttacker) {
            yOffset = "20px"; 
            el.style.zIndex = "100";
            el.style.filter = "drop-shadow(0 0 20px #ff5252)";
        }

        if (!card.isDead) {
             el.style.transform = `scale(${currentScale}) translateY(${yOffset})`;
        }
    });
};

// 4. プレイヤーのクリック処理（2段階の割り込みフェーズに対応！）
// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // ▼▼▼ 追加（ターゲット指定魔法の発動） ▼▼▼
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
        
//         // ★追加：木材を使う時、対象がすでに守護を持っていたら弾く
//         if (supportCard.ability === "item_taunt" && (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt)) {
//             window.showBattleMessage("⚠️ そのモンスターはすでに守護状態です！", true);
//             return; // キャンセルせず返す（別の味方を選び直せる）
//         }
//         p.currentMana -= window.getActualCost(p, supportCard);
//         if (supportCard.type === 'action') p.actionUsed = true;
//         p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
//         window.TCG_BATTLE.targetingHandIndex = -1;
        
//         window.renderBattleBoard(); // 一旦手札から消す
//         window.animateCardPlay(supportCard, true, () => {
//             window.executeSupportCard(supportCard, targetCard, true);
//         });
//         return;
//     }

//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
//         if (targetCard.type === evoCard.evolvesFrom) {
//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             evoCard.canAttack = false; p.field[index] = evoCard;  
//             window.showVFX(`p-card-${index}`, 'heal', '進化!'); window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`);
//             window.triggerPlayEffect(evoCard, true); window.renderBattleBoard();
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // ▼▼▼ 復活＆アップデート版：自ターンの防御付与＆キャンセル処理 ▼▼▼
//     if (!targetCard.canAttack || targetCard.damage <= 0 || targetCard.isDefending) {
//         // ① 元々守護持ち、または「木材」で永続守護になったカードは解除不可
//         if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.hasPermanentTaunt) {
//             window.showBattleMessage(`このカードは永続的な【守護】を持っています。`, false, 1500);
//         } 
//         // ② 一時的に防御姿勢をとっている場合は解除して1マナ戻す
//         else if (targetCard.isDefending) { 
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、1マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } 
//         // ③ マナを1消費して、一時的な防御姿勢をとる
//         else if (p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//             window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//             window.renderBattleBoard();
//         }
//         return;
//     }

//     if (!targetCard.canAttack || targetCard.damage <= 0) {
//         if (!targetCard.isDefending && targetCard.ability !== "taunt" && p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`); window.renderBattleBoard();
//         } else if (targetCard.isDefending) { window.showBattleMessage(`このカードはすでに防御姿勢です。`); }
//         return;
//     }

//     if (window.TCG_BATTLE.selectedAttackerIndex === index) window.TCG_BATTLE.selectedAttackerIndex = -1;
//     else window.TCG_BATTLE.selectedAttackerIndex = index;
//     window.renderBattleBoard();
// };

// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // 解決①：魔法のターゲット選択を【最優先】で処理する（防御処理より上に配置）
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
        
//         if (supportCard.ability === "item_taunt" && (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt)) {
//             window.showBattleMessage("⚠️ そのモンスターはすでに守護状態です！", true);
//             return;
//         }

//         p.currentMana -= window.getActualCost(p, supportCard);
//         if (supportCard.type === 'action') p.actionUsed = true;
//         p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
//         window.TCG_BATTLE.targetingHandIndex = -1;
        
//         window.renderBattleBoard();
//         window.animateCardPlay(supportCard, true, () => {
//             window.executeSupportCard(supportCard, targetCard, true);
//         });
//         return;
//     }

//     // 解決②：相手ターンの「守護割り込み」処理（これが消えていたためバグっていました）
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (window.TCG_BATTLE.isIntercepting) {
//             if (window.TCG_BATTLE.interceptPhase === 'adding') {
//                 if (p.currentMana >= 1 && targetCard.ability !== "taunt" && targetCard.ability !== "pure_aegis" && !targetCard.isDefending && !targetCard.hasPermanentTaunt) {
//                     p.currentMana -= 1; targetCard.isDefending = true;
//                     window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                     window.renderBattleBoard();
//                     window.finishIntercept('added', index); 
//                 } else {
//                     window.showBattleMessage("⚠️ そのカードは守護にできません！", true);
//                 }
//             } 
//             else if (window.TCG_BATTLE.interceptPhase === 'selecting') {
//                 if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt) {
//                     window.finishIntercept('card', index); 
//                 } else {
//                     window.showBattleMessage("⚠️ 守護モンスターを選んでください！", true);
//                 }
//             }
//         }
//         return;
//     }

//     // 解決③：進化処理（行動権の引き継ぎと、属性進化の判定条件を修正）
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
        
//         if (window.checkCanEvolve(targetCard, evoCard)) { // 修正: 単純一致ではなく専用関数で判定
//             const canAttackInherit = targetCard.canAttack; // 行動権の引き継ぎ
//             const hpDiff = targetCard.hp - targetCard.maxHp; 
//             const masterTarget = window.TCG_MASTER[targetCard.masterId];
//             const dmgDiff = targetCard.damage - (masterTarget ? (masterTarget.baseDmg || 0) : 0);

//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
            
//             evoCard.canAttack = canAttackInherit; 
//             evoCard.hp = Math.max(1, evoCard.maxHp + hpDiff); 
//             if (evoCard.hp > evoCard.maxHp) evoCard.maxHp = evoCard.hp; 
//             evoCard.damage = Math.max(0, evoCard.damage + dmgDiff); 
//             p.field[index] = evoCard;  

//             window.renderBattleBoard();
//             window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//             window.triggerPlayEffect(evoCard, true); 
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // 防御の付与・解除
//     if (!targetCard.canAttack || targetCard.damage <= 0 || targetCard.isDefending) {
//         if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.hasPermanentTaunt) {
//             window.showBattleMessage(`このカードは永続的な【守護】を持っています。`, false, 1500);
//         } else if (targetCard.isDefending) { 
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、1マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } else if (p.currentMana >= 1) {
//             p.currentMana -= 1; targetCard.isDefending = true; 
//             window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//             window.showBattleMessage(`🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//             window.renderBattleBoard();
//         }
//         return;
//     }

//     // 攻撃対象の選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         // 解決④：魅了の自爆で死んだ場合にバトルを終了させる
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
            
//             setTimeout(() => {
//                 if (p.hp <= 0) { 
//                     p.hp = 0; window.renderBattleBoard(); 
//                     window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); 
//                     setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); 
//                 }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// window.selectPlayerCard = function(index) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // 魔法のターゲット指定
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
        
//         if (supportCard.ability === "item_taunt" && (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt)) {
//             window.showBattleMessage("⚠️ そのモンスターはすでに守護状態です！", true);
//             return;
//         }

//         p.currentMana -= window.getActualCost(p, supportCard);
//         if (supportCard.type === 'action') p.actionUsed = true;
//         p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
//         window.TCG_BATTLE.targetingHandIndex = -1;

//         // ▼▼▼ 追加：発動時にUIを消す ▼▼▼
//         let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
//         // ▲▲▲ 追加おわり ▲▲▲
        
//         window.renderBattleBoard();
//         window.animateCardPlay(supportCard, true, () => {
//             window.executeSupportCard(supportCard, targetCard, true);
//         });
//         return;
//     }

//     // 相手ターンの「守護割り込み」処理
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (window.TCG_BATTLE.isIntercepting) {
//             if (window.TCG_BATTLE.interceptPhase === 'adding') {
//                 if (p.currentMana >= 1 && targetCard.ability !== "taunt" && targetCard.ability !== "pure_aegis" && !targetCard.isDefending && !targetCard.hasPermanentTaunt) {
//                     p.currentMana -= 1; targetCard.isDefending = true;
//                     window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                     window.renderBattleBoard();
                    
//                     // ▼▼▼ 修正：直接Promiseを解決する（エラーの元だった関数を排除） ▼▼▼
//                     let ui = document.getElementById('tcg-intercept-ui');
//                     if (ui) ui.remove();
//                     // ▼▼▼ 追加：味方を選んだら案内UIも消す ▼▼▼
//                     let targetUi = document.getElementById('tcg-target-ui'); 
//                     if (targetUi) targetUi.remove();
//                     // ▲▲▲ 追加おわり ▲▲▲

//                     if (window.TCG_BATTLE.interceptResolve) {
//                         window.TCG_BATTLE.interceptResolve('added');
//                         window.TCG_BATTLE.interceptResolve = null;
//                     }
//                 } else {
//                     window.showBattleMessage("⚠️ そのカードは守護にできません！", true);
//                 }
//             } 
//             else if (window.TCG_BATTLE.interceptPhase === 'selecting') {
//                 if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt) {
                    
//                     // ▼▼▼ 修正：必ず【オブジェクト】で結果を返してダメージ消失を防ぐ ▼▼▼
//                     let ui = document.getElementById('tcg-intercept-ui');
//                     if (ui) ui.remove();
//                     window.TCG_BATTLE.isIntercepting = false;
//                     if (window.TCG_BATTLE.interceptResolve) {
//                         window.TCG_BATTLE.interceptResolve({ targetType: 'card', targetIndex: index });
//                         window.TCG_BATTLE.interceptResolve = null;
//                     }
//                 } else {
//                     window.showBattleMessage("⚠️ 守護モンスターを選んでください！", true);
//                 }
//             }
//         }
//         return;
//     }

//     // 進化処理
//     // 進化処理
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
        
//         // ▼▼▼ 修正：分岐ルート対応の柔軟な進化判定を使用する ▼▼▼
//         if (window.checkCanEvolve(targetCard, evoCard)) { 
//             const canAttackInherit = targetCard.canAttack;
//             const hpDiff = targetCard.hp - targetCard.maxHp; 
//             const masterTarget = window.TCG_MASTER[targetCard.masterId];
//             const dmgDiff = targetCard.damage - (masterTarget ? (masterTarget.baseDmg || 0) : 0);

//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard(); // まず手札から消す

//             // ▼▼▼ 修正：進化カードもアニメーションでドーンと出す ▼▼▼
//             window.TCG_BATTLE.isAnimating = true; // 連打防止ロック
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = canAttackInherit; 
//                 evoCard.hasPermanentTaunt = targetCard.hasPermanentTaunt; 
//                 evoCard.isDefending = targetCard.isDefending;             
//                 evoCard.hp = Math.max(1, evoCard.maxHp + hpDiff); 
//                 if (evoCard.hp > evoCard.maxHp) evoCard.maxHp = evoCard.hp; 
//                 evoCard.damage = Math.max(0, evoCard.damage + dmgDiff); 
//                 p.field[index] = evoCard;  

//                 window.renderBattleBoard();
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//                 window.triggerPlayEffect(evoCard, true); 
//                 window.TCG_BATTLE.isAnimating = false; // ロック解除
//             });
            
//             evoCard.canAttack = canAttackInherit; 
//             evoCard.hasPermanentTaunt = targetCard.hasPermanentTaunt; // ←追加：永続守護の引き継ぎ
//             evoCard.isDefending = targetCard.isDefending;             // ←追加：現在の防御マークの引き継ぎ
//             evoCard.hp = Math.max(1, evoCard.maxHp + hpDiff); 
//             if (evoCard.hp > evoCard.maxHp) evoCard.maxHp = evoCard.hp; 
//             evoCard.damage = Math.max(0, evoCard.damage + dmgDiff); 
//             p.field[index] = evoCard;

//             window.renderBattleBoard();
//             window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//             window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//             window.triggerPlayEffect(evoCard, true); 
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // 防御の付与・解除
//     let isTempDefending = targetCard.isDefending && !targetCard.hasPermanentTaunt; // ←追加：一時的な防御か判定
//     if (!targetCard.canAttack || targetCard.damage <= 0 || isTempDefending) { // ←修正：永続守護ならここをスルーして攻撃可能にする
//         if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.hasPermanentTaunt) {
//             window.showBattleMessage(`このカードは永続的な【守護】を持っています。`, false, 1500);
//         } else if (targetCard.isDefending) { 
//             p.currentMana += 1; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、1マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } else {
//             // ▼▼▼ 城が出ていればコスト0、なければ1 ▼▼▼
//             let defCost = (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_castle") ? 0 : 1;
//             if (p.currentMana >= defCost) {
//                 p.currentMana -= defCost; targetCard.isDefending = true; 
//                 window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                 window.showBattleMessage(defCost === 0 ? `🏰 城の恩恵！コスト0で防御姿勢をとった！` : `🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//                 window.renderBattleBoard();
//             } else {
//                 window.showBattleMessage(`マナが足りません！\n(必要: ${defCost} / 現在: ${p.currentMana})`, true);
//             }
//         }
//         return;
//     }

//     // 攻撃対象の選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
            
//             setTimeout(() => {
//                 if (p.hp <= 0) { 
//                     p.hp = 0; window.renderBattleBoard(); 
//                     window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); 
//                     setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); 
//                 }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

// window.selectPlayerCard = function(index) {
//     if (window.TCG_BATTLE.playLocked || window.TCG_BATTLE.isAnimating) return; // ★全体ロック

//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const targetCard = p.field[index];

//     if (targetCard.status === "stunned") {
//         window.showBattleMessage("🪨 化石化して動けない！", true); return;
//     }

//     // 魔法のターゲット指定
//     if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
//         const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
        
//         if (supportCard.ability === "item_taunt" && (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt)) {
//             window.showBattleMessage("⚠️ そのモンスターはすでに守護状態です！", true);
//             return;
//         }

//         window.TCG_BATTLE.playLocked = true;
//         p.currentMana -= window.getActualCost(p, supportCard);
//         if (supportCard.type === 'action') p.actionUsed = true;
//         p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
//         window.TCG_BATTLE.targetingHandIndex = -1;
        
//         let targetUi = document.getElementById('tcg-target-ui'); 
//         if (targetUi) targetUi.remove();

//         window.renderBattleBoard();
//         window.animateCardPlay(supportCard, true, () => {
//             window.executeSupportCard(supportCard, targetCard, true);
//             window.TCG_BATTLE.playLocked = false;
//         });
//         return;
//     }

//     // 相手ターンの「守護割り込み」処理
//     if (window.TCG_BATTLE.isEnemyTurn) {
//         if (window.TCG_BATTLE.isIntercepting) {
//             if (window.TCG_BATTLE.interceptPhase === 'adding') {
//                 if (p.currentMana >= 1 && targetCard.ability !== "taunt" && targetCard.ability !== "pure_aegis" && !targetCard.isDefending && !targetCard.hasPermanentTaunt) {
//                     p.currentMana -= 1; targetCard.isDefending = true;
//                     window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                     window.renderBattleBoard();
                    
//                     let ui = document.getElementById('tcg-intercept-ui'); if (ui) ui.remove();
//                     let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();

//                     if (window.TCG_BATTLE.interceptResolve) {
//                         window.TCG_BATTLE.interceptResolve('added');
//                         window.TCG_BATTLE.interceptResolve = null;
//                     }
//                 } else {
//                     window.showBattleMessage("⚠️ そのカードは守護にできません！", true);
//                 }
//             } 
//             else if (window.TCG_BATTLE.interceptPhase === 'selecting') {
//                 if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt) {
//                     let ui = document.getElementById('tcg-intercept-ui'); if (ui) ui.remove();
//                     window.TCG_BATTLE.isIntercepting = false;
//                     if (window.TCG_BATTLE.interceptResolve) {
//                         window.TCG_BATTLE.interceptResolve({ targetType: 'card', targetIndex: index });
//                         window.TCG_BATTLE.interceptResolve = null;
//                     }
//                 } else {
//                     window.showBattleMessage("⚠️ 守護モンスターを選んでください！", true);
//                 }
//             }
//         }
//         return;
//     }

//     // 進化処理
//     if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
//         const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
//         const actualCost = window.getActualCost(p, evoCard);
        
//         if (window.checkCanEvolve(targetCard, evoCard)) { 
//             window.TCG_BATTLE.playLocked = true; // カスタムロック開始
//             const canAttackInherit = targetCard.canAttack; 
//             const hpDiff = targetCard.hp - targetCard.maxHp; 
//             const masterTarget = window.TCG_MASTER[targetCard.masterId];
//             const dmgDiff = targetCard.damage - (masterTarget ? (masterTarget.baseDmg || 0) : 0);

//             p.currentMana -= actualCost; p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); window.TCG_BATTLE.selectedHandCardIndex = -1;
//             window.renderBattleBoard(); 

//             // 進化カードのアニメーション
//             window.animateCardPlay(evoCard, true, () => {
//                 evoCard.canAttack = canAttackInherit; 
//                 evoCard.hasPermanentTaunt = targetCard.hasPermanentTaunt; 
//                 evoCard.isDefending = targetCard.isDefending;             
//                 evoCard.hp = Math.max(1, evoCard.maxHp + hpDiff); 
//                 if (evoCard.hp > evoCard.maxHp) evoCard.maxHp = evoCard.hp; 
//                 evoCard.damage = Math.max(0, evoCard.damage + dmgDiff); 
//                 p.field[index] = evoCard;  

//                 window.renderBattleBoard();
//                 window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
//                 window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
//                 window.triggerPlayEffect(evoCard, true); 
//                 window.TCG_BATTLE.playLocked = false; // カスタムロック解除
//             });
//         } else {
//             const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
//             window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
//         }
//         return;
//     }

//     // 防御の付与・解除
//     let isTempDefending = targetCard.isDefending && !targetCard.hasPermanentTaunt;
//     if (!targetCard.canAttack || targetCard.damage <= 0 || isTempDefending) {
//         if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.hasPermanentTaunt) {
//             window.showBattleMessage(`このカードは永続的な【守護】を持っています。`, false, 1500);
//         } else if (targetCard.isDefending) { 
//             let defCost = (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_castle") ? 0 : 1;
//             p.currentMana += defCost; targetCard.isDefending = false;
//             window.showBattleMessage(`🛡️ 防御姿勢を解除し、${defCost}マナ戻りました。`, false, 1500); 
//             window.renderBattleBoard();
//         } else {
//             let defCost = (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_castle") ? 0 : 1;
//             if (p.currentMana >= defCost) {
//                 p.currentMana -= defCost; targetCard.isDefending = true; 
//                 window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
//                 window.showBattleMessage(defCost === 0 ? `🏰 城の恩恵！コスト0で防御姿勢をとった！` : `🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
//                 window.renderBattleBoard();
//             } else {
//                 window.showBattleMessage(`マナが足りません！\n(必要: ${defCost} / 現在: ${p.currentMana})`, true);
//             }
//         }
//         return;
//     }

//     // 攻撃対象の選択
//     if (window.TCG_BATTLE.selectedAttackerIndex === index) {
//         window.TCG_BATTLE.selectedAttackerIndex = -1;
//     } else {
//         window.TCG_BATTLE.selectedAttackerIndex = index;
//         if (targetCard.status === "charmed") {
//             window.TCG_BATTLE.selectedAttackerIndex = -1;
//             targetCard.status = null; targetCard.canAttack = false;
//             p.hp -= targetCard.damage;
//             window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
//             window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
//             window.renderBattleBoard();
            
//             setTimeout(() => {
//                 if (p.hp <= 0) { 
//                     p.hp = 0; window.renderBattleBoard(); 
//                     window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); 
//                     setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); 
//                 }
//             }, 800);
//             return;
//         }
//     }
//     window.renderBattleBoard();
// };

window.selectPlayerCard = function(index) {
    // ▼ 修正：守護割り込み中（isIntercepting）はアニメーションロックを無視してクリック可能にする！
    if (window.TCG_BATTLE.isAnimating && !window.TCG_BATTLE.isIntercepting) return; 

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const targetCard = p.field[index];

    if (targetCard.status === "stunned") {
        window.showBattleMessage("🪨 化石化して動けない！", true); return;
    }

    // 魔法のターゲット指定
    if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
        const supportCard = p.hand[window.TCG_BATTLE.targetingHandIndex];
        
        if (supportCard.ability === "item_taunt" && (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt)) {
            window.showBattleMessage("⚠️ そのモンスターはすでに守護状態です！", true);
            return;
        }

        window.TCG_BATTLE.isAnimating = true;
        let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();

        window.animateCardPlay(supportCard, true, () => {
            p.currentMana -= window.getActualCost(p, supportCard);
            if (supportCard.type === 'action') p.actionUsed = true;
            p.hand.splice(window.TCG_BATTLE.targetingHandIndex, 1);
            window.TCG_BATTLE.targetingHandIndex = -1;
            
            window.executeSupportCard(supportCard, targetCard, true);
            window.TCG_BATTLE.isAnimating = false;
        });
        return;
    }

    // 相手ターンの「守護割り込み」処理
    if (window.TCG_BATTLE.isEnemyTurn) {
        if (window.TCG_BATTLE.isIntercepting) {
            if (window.TCG_BATTLE.interceptPhase === 'adding') {
                if (p.currentMana >= 1 && targetCard.ability !== "taunt" && targetCard.ability !== "pure_aegis" && !targetCard.isDefending && !targetCard.hasPermanentTaunt) {
                    p.currentMana -= 1; targetCard.isDefending = true;
                    window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
                    window.renderBattleBoard();
                    
                    let ui = document.getElementById('tcg-intercept-ui'); if (ui) ui.remove();
                    let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();

                    if (window.TCG_BATTLE.interceptResolve) {
                        window.TCG_BATTLE.interceptResolve('added');
                        window.TCG_BATTLE.interceptResolve = null;
                    }
                } else {
                    window.showBattleMessage("⚠️ そのカードは守護にできません！", true);
                }
            } 
            else if (window.TCG_BATTLE.interceptPhase === 'selecting') {
                if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.isDefending || targetCard.hasPermanentTaunt) {
                    let ui = document.getElementById('tcg-intercept-ui'); if (ui) ui.remove();
                    window.TCG_BATTLE.isIntercepting = false;
                    if (window.TCG_BATTLE.interceptResolve) {
                        window.TCG_BATTLE.interceptResolve({ targetType: 'card', targetIndex: index });
                        window.TCG_BATTLE.interceptResolve = null;
                    }
                } else {
                    window.showBattleMessage("⚠️ 守護モンスターを選んでください！", true);
                }
            }
        }
        return;
    }

    // 進化処理
    if (window.TCG_BATTLE.selectedHandCardIndex !== -1) {
        const evoCard = p.hand[window.TCG_BATTLE.selectedHandCardIndex];
        const actualCost = window.getActualCost(p, evoCard);
        
        if (window.checkCanEvolve(targetCard, evoCard)) { 
            window.TCG_BATTLE.isAnimating = true;
            let targetUi = document.getElementById('tcg-target-ui'); if (targetUi) targetUi.remove();

            window.animateCardPlay(evoCard, true, () => {
                const canAttackInherit = targetCard.canAttack; 
                const hpDiff = targetCard.hp - targetCard.maxHp; 
                const masterTarget = window.TCG_MASTER[targetCard.masterId];
                const dmgDiff = targetCard.damage - (masterTarget ? (masterTarget.baseDmg || 0) : 0);

                p.currentMana -= actualCost; 
                p.hand.splice(window.TCG_BATTLE.selectedHandCardIndex, 1); 
                window.TCG_BATTLE.selectedHandCardIndex = -1;
                
                evoCard.canAttack = canAttackInherit; 
                evoCard.hasPermanentTaunt = targetCard.hasPermanentTaunt; 
                evoCard.isDefending = targetCard.isDefending;             
                evoCard.hp = Math.max(1, evoCard.maxHp + hpDiff); 
                if (evoCard.hp > evoCard.maxHp) evoCard.maxHp = evoCard.hp; 
                evoCard.damage = Math.max(0, evoCard.damage + dmgDiff); 
                p.field[index] = evoCard;  

                window.renderBattleBoard();
                window.showVFX(`p-card-${index}`, 'heal', '進化!'); 
                window.showBattleMessage(`✨ ${targetCard.name} は\n${evoCard.name} に進化した！`, false, 1500, false, false);
                window.triggerPlayEffect(evoCard, true); 
                window.TCG_BATTLE.isAnimating = false;
            });
        } else {
            const evoName = window.getEvolvesFromName(evoCard.evolvesFrom);
            window.showBattleMessage(`⚠️ そのモンスターには進化できません！\n「${evoName}」を選んでください。`, true);
        }
        return;
    }

    // 防御の付与・解除
    let isTempDefending = targetCard.isDefending && !targetCard.hasPermanentTaunt;
    if (!targetCard.canAttack || targetCard.damage <= 0 || isTempDefending) {
        if (targetCard.ability === "taunt" || targetCard.ability === "pure_aegis" || targetCard.hasPermanentTaunt) {
            window.showBattleMessage(`このカードは永続的な【守護】を持っています。`, false, 1500);
        } else if (targetCard.isDefending) { 
            let defCost = (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_castle") ? 0 : 1;
            p.currentMana += defCost; targetCard.isDefending = false;
            window.showBattleMessage(`🛡️ 防御姿勢を解除し、${defCost}マナ戻りました。`, false, 1500); 
            window.renderBattleBoard();
        } else {
            let defCost = (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card.ability === "field_castle") ? 0 : 1;
            if (p.currentMana >= defCost) {
                p.currentMana -= defCost; targetCard.isDefending = true; 
                window.showVFX(`p-card-${index}`, 'heal', '防御!'); 
                window.showBattleMessage(defCost === 0 ? `🏰 城の恩恵！コスト0で防御姿勢をとった！` : `🛡️ 1マナ消費！\n${targetCard.name} が防御姿勢をとった！`, false, 1500); 
                window.renderBattleBoard();
            } else {
                window.showBattleMessage(`マナが足りません！\n(必要: ${defCost} / 現在: ${p.currentMana})`, true);
            }
        }
        return;
    }

    // 攻撃対象の選択
    if (window.TCG_BATTLE.selectedAttackerIndex === index) {
        window.TCG_BATTLE.selectedAttackerIndex = -1;
    } else {
        window.TCG_BATTLE.selectedAttackerIndex = index;
        if (targetCard.status === "charmed") {
            window.TCG_BATTLE.selectedAttackerIndex = -1;
            targetCard.status = null; targetCard.canAttack = false;
            p.hp -= targetCard.damage;
            window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', targetCard.damage);
            window.showBattleMessage(`💕 魅了されていて、味方リーダーを攻撃してしまった！`, true, 2500);
            window.renderBattleBoard();
            
            setTimeout(() => {
                if (p.hp <= 0) { 
                    p.hp = 0; window.renderBattleBoard(); 
                    window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); 
                    setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); 
                }
            }, 800);
            return;
        }
    }
    window.renderBattleBoard();
};

// 5. CPUターンの攻撃処理を async/await で直列化し、2段階の割り込みを実現
// ==========================================
// ★ 仕様変更：敵の攻撃宣言時に「誰を狙っているか」を表示する
// ==========================================
// ==========================================
// ★ バグ修正：CPUターンの攻撃スルー＆連撃無限ループ解消パッチ
// ==========================================
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true;
    window.TCG_BATTLE.isAnimating = true;

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;

    if (cpu.maxMana < 10) cpu.maxMana++;
    cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 
    
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) {
        cpu.hand.push(cpu.deck.shift());
    }

    // ターン開始時効果
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) {
            p.hp -= 20; window.showVFX('player-face', 'damage', 20);
            p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); window.checkDeath(f, p, `p-card-${fi}`, cpu); } });
        }
    });
    
    cpu.field.forEach(card => { card.canAttack = true; card._has_attacked_once = false; });
    window.renderBattleBoard();
    await window.tcgSleep(1000); 

    // --- 攻撃フェーズ ---
    for (let cpuIndex = 0; cpuIndex < cpu.field.length; cpuIndex++) {
        let cpuCard = cpu.field[cpuIndex];
        if (!cpuCard || !cpuCard.canAttack || cpuCard.damage <= 0 || cpuCard.isDead) continue;
        
        if (cpuCard.status === "charmed") {
            cpuCard.status = null; cpuCard.canAttack = false;
            cpu.hp -= cpuCard.damage;
            window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
            window.renderBattleBoard();
            if (cpu.hp <= 0) {
                cpu.hp = 0; window.renderBattleBoard();
                window.showBattleMessage("🎉 YOU WIN!!\n敵リーダーのHPが0になりました！", false, 5000);
                setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000);
                return; 
            }
            await window.tcgSleep(800);
            continue;
        }
        if (cpuCard.status === "stunned") continue;

        window.TCG_BATTLE.selectedAttackerIndex = cpuIndex;
        window.renderBattleBoard();
        
        const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";
        
        let targetType = 'player';
        let tIndex = 0;

        if (!isPierce) {
            let targetInfo = await new Promise(async resolve => {
                const getTaunts = () => p.field.filter(c => c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending);
                const getCanTaunt = () => p.field.some(c => (!c.canAttack || c.damage <= 0) && !c.isDefending && c.ability !== "taunt" && c.ability !== "pure_aegis" && !c.isDead && c.status !== "stunned");
                
                let taunts = getTaunts();
                let canTaunt = getCanTaunt();
                let hasMana = p.currentMana >= 1;

                let predictedTargetType = 'player';
                let predictedTargetIndex = 0;
                
                if (taunts.length > 0) {
                    predictedTargetType = 'card';
                    predictedTargetIndex = p.field.indexOf(taunts[Math.floor(Math.random() * taunts.length)]);
                } else {
                    let aiTarget = window._decideAITarget(cpu, p);
                    predictedTargetType = aiTarget.type;
                    predictedTargetIndex = aiTarget.index;
                }

                let targetNameStr = "";
                if (predictedTargetType === 'player') targetNameStr = "あなた (リーダー)";
                else if (predictedTargetType === 'field') targetNameStr = `フィールド『${window.TCG_BATTLE.currentField.card.name}』`;
                else if (predictedTargetType === 'card') targetNameStr = `味方『${p.field[predictedTargetIndex].name}』`;

                if (window.TCG_BATTLE.isAuto) {
                    resolve({ targetType: predictedTargetType, targetIndex: predictedTargetIndex });
                    return;
                }

                // マナがあり、守護にできるカードがあるなら「追加」を聞く
                if (hasMana && canTaunt) {
                    window.TCG_BATTLE.isIntercepting = true;
                    window.TCG_BATTLE.interceptPhase = 'asking';
                    window.renderBattleBoard();

                    let phase1Result = await new Promise(res1 => {
                        let ui = document.createElement('div');
                        ui.id = "tcg-intercept-ui";
                        ui.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 30px rgba(255,152,0,0.8); pointer-events:auto; width: 280px;`;
                        ui.innerHTML = `
                            <h3 style="color:#ff9800; margin:0 0 10px 0; font-size:20px;">⚠️ 敵の攻撃！</h3>
                            <div style="font-size:18px; color:#fff; margin-bottom: 5px; font-weight:bold;">${cpuCard.name}<br><span style="color:#ff5252; font-size:24px;">${cpuCard.damage} ダメージ</span></div>
                            <div style="font-size:14px; color:#FFEB3B; margin-bottom:15px; background:rgba(0,0,0,0.5); padding:5px; border-radius:4px; border:1px solid #FFC107;">🎯 狙い: ${targetNameStr}</div>
                            <p style="color:#ddd; font-size:13px; margin-bottom:15px;">マナを消費して「守護」を追加しますか？</p>
                            <button id="btn-add-guard" style="padding:10px; background:#00BCD4; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:10px;">🛡️ 守護を追加する (1マナ)</button>
                            <button id="btn-skip-guard" style="padding:10px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer; width:100%;">追加しない</button>
                        `;
                        document.getElementById('tcg-battle-ui').appendChild(ui);
                        
                        document.getElementById('btn-add-guard').onclick = () => { ui.remove(); res1('add'); };
                        document.getElementById('btn-skip-guard').onclick = () => { ui.remove(); res1('skip'); };
                    });

                    if (phase1Result === 'add') {
                        let addResult = await new Promise(res2 => {
                            window.TCG_BATTLE.interceptPhase = 'adding';
                            window.TCG_BATTLE.interceptResolve = res2;
                            
                            let ui = document.getElementById('tcg-target-ui');
                            if (!ui) {
                                ui = document.createElement('div');
                                ui.id = "tcg-target-ui";
                                ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #00BCD4; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(0,188,212,0.6); pointer-events:auto;`;
                                ui.innerHTML = `
                                    <div style="color:#00BCD4; font-size:22px; font-weight:bold; margin-bottom:10px;">🛡️ 守護を追加する味方を選択中...</div>
                                    <div style="color:#ddd; font-size:14px; margin-bottom:15px;">守護にしたい味方モンスターをクリックしてください</div>
                                    <button id="btn-cancel-add" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>
                                `;
                                document.body.appendChild(ui);
                                
                                document.getElementById('btn-cancel-add').onclick = () => {
                                    ui.remove();
                                    if (window.TCG_BATTLE.interceptResolve) {
                                        window.TCG_BATTLE.interceptResolve('cancel');
                                        window.TCG_BATTLE.interceptResolve = null;
                                    }
                                };
                            }
                            window.renderBattleBoard();
                        });
                        
                        if (addResult === 'added') {
                            taunts = getTaunts(); 
                        }
                    }
                }

                // 守護が2体以上なら「どれで受けるか」を聞く
                if (taunts.length >= 2) {
                    window.TCG_BATTLE.isIntercepting = true;
                    window.TCG_BATTLE.interceptPhase = 'selecting';
                    window.renderBattleBoard();
                    
                    let phase2Result = await new Promise(res3 => {
                        window.TCG_BATTLE.interceptResolve = res3;
                        let ui = document.createElement('div');
                        ui.id = "tcg-intercept-ui";
                        ui.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 30px rgba(255,152,0,0.8); pointer-events:auto; width: 280px;`;
                        ui.innerHTML = `
                            <h3 style="color:#ff9800; margin:0 0 10px 0; font-size:20px;">⚠️ 敵の攻撃！</h3>
                            <div style="font-size:18px; color:#fff; margin-bottom: 5px; font-weight:bold;">${cpuCard.name}<br><span style="color:#ff5252; font-size:24px;">${cpuCard.damage} ダメージ</span></div>
                            <p style="color:#ddd; font-size:13px; margin-bottom:15px;">守護が複数います。<br><span style="color:#00BCD4; font-weight:bold;">身代わりにする味方をクリック！</span></p>
                        `;
                        document.getElementById('tcg-battle-ui').appendChild(ui);
                    });
                    resolve(phase2Result);
                    return;
                } 
                else if (taunts.length === 1) {
                    window.TCG_BATTLE.isIntercepting = false;
                    resolve({ targetType: 'card', targetIndex: p.field.indexOf(taunts[0]) });
                    return;
                } 
                else {
                    window.TCG_BATTLE.isIntercepting = false;
                    resolve({ targetType: predictedTargetType, targetIndex: predictedTargetIndex });
                    return;
                }
            });
            
            targetType = targetInfo.targetType;
            tIndex = targetInfo.targetIndex;
            
        } else {
            let aiTarget = window._decideAITarget(cpu, p);
            targetType = aiTarget.type;
            tIndex = aiTarget.index;
        }

        // ★バグ修正：ここで selectedAttackerIndex を -1 にしてはいけない！（攻撃がキャンセルされてしまう）
        window.executeAttack(targetType, tIndex);
        await window.tcgSleep(1500); 

        // ★バグ修正：攻撃の演出が終わってから、ハイライト（選択状態）を解除する
        window.TCG_BATTLE.selectedAttackerIndex = -1;
        window.renderBattleBoard();

        // ★バグ修正：連撃処理。攻撃がキャンセルされないので正常にループが戻る
        if (cpuCard.ability === "double_strike" && cpuCard.canAttack && !cpuCard.isDead) {
            cpuIndex--; 
        }
    }

    // --- 召喚＆魔法＆進化フェーズ ---
    let cardsToPlay = [];
    for (let i = cpu.hand.length - 1; i >= 0; i--) {
        let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
        if (cpu.currentMana >= actualCost) {
            if (card.type === 'action' && cpu.actionUsed) continue;
            
            if (card.type === 'field') {
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isSupport: true, targetCard: null });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
            }
            else if (card.type === 'item' || card.type === 'action') {
                let needsTarget = window.requiresTarget ? window.requiresTarget(card) : false;
                let targetCard = null;
                let isOffensive = card.ability && (card.ability.includes('damage') || card.ability.includes('stun') || card.ability.includes('charm') || card.ability.includes('break') || card.ability.includes('debuff'));
                
                if (needsTarget) {
                    if (isOffensive) {
                        let validTargets = p.field.filter(c => !c.isDead && c.ability !== "stealth");
                        if (validTargets.length > 0) targetCard = validTargets[Math.floor(Math.random() * validTargets.length)];
                        else continue;
                    } else {
                        let validTargets = cpu.field.filter(c => !c.isDead);
                        if (card.ability === "item_taunt") validTargets = validTargets.filter(c => c.ability !== "taunt" && c.ability !== "pure_aegis" && !c.hasPermanentTaunt);
                        if (validTargets.length > 0) targetCard = validTargets[Math.floor(Math.random() * validTargets.length)];
                        else continue; 
                    }
                }
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isSupport: true, targetCard: targetCard });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                if (card.type === 'action') cpu.actionUsed = true;
            }
            else if (card.evolvesFrom) {
                let targetIndex = cpu.field.findIndex(c => window.checkCanEvolve(c, card)); 
                if (targetIndex !== -1) {
                    cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex });
                    cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
                }
            } 
            else {
                cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false });
                cpu.currentMana -= actualCost; cpu.hand.splice(i, 1);
            }
        }
    }

    if (cardsToPlay.length > 0) window.renderBattleBoard(); 

    for (let idx = 0; idx < cardsToPlay.length; idx++) {
        let playData = cardsToPlay[idx]; let card = playData.card;
        
        await new Promise(resolve => {
            window.animateCardPlay(card, false, () => {
                if (card.type === 'field') {
                    window.showBattleMessage(`⛰️ 敵がフィールド『${card.name}』を展開！`, false, 2500, true);
                    if (window.playFieldCard) window.playFieldCard(card, false);
                } 
                else if (card.type === 'item' || card.type === 'action') {
                    window.showBattleMessage(`✨ 敵が魔法『${card.name}』を使用！`, false, 2500, true);
                    if (window.executeSupportCard) {
                        window.executeSupportCard(card, playData.targetCard, false);
                    } else {
                        card.isDead = true; cpu.graveyard.push(card);
                        window.triggerPlayEffect(card, false); 
                    }
                } 
                else if (playData.isEvo) {
                    let prevCard = cpu.field[playData.targetIndex];
                    let canAttackInherit = prevCard ? prevCard.canAttack : false;
                    let hasPermanentTauntInherit = prevCard ? prevCard.hasPermanentTaunt : false; 
                    let isDefendingInherit = prevCard ? prevCard.isDefending : false;
                    
                    card.canAttack = canAttackInherit; 
                    card.hasPermanentTaunt = hasPermanentTauntInherit;
                    card.isDefending = isDefendingInherit;
                    cpu.field[playData.targetIndex] = card; 
                    window.showBattleMessage(`✨ 敵のモンスターが\n${card.name} に進化した！`, false, 2000, true);
                    window.triggerPlayEffect(card, false); 
                } 
                else {
                    card.canAttack = (card.ability === "haste"); cpu.field.push(card); 
                    window.showBattleMessage(`🛡️ 敵が ${card.name} を配置！`, false, 2000, true);
                    window.triggerPlayEffect(card, false); 
                }
                setTimeout(resolve, 1500); 
            });
        });
    }

    // --- ターン終了処理 ---
    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        c.status = null; 
        if (c.ability === "burn_field" || c.ability === "cataclysm") {
            let dmg = c.ability === "cataclysm" ? 20 : 10;
            p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } });
        }
        if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") {
            const aliveEnemies = p.field.filter(e => !e.isDead);
            if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); }
        }
        if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) {
            let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50;
            cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生');
        }
    });
    p.field = p.field.filter(c => !c.isDead); cpu.field = cpu.field.filter(c => !c.isDead);

    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.startPlayerTurn(false);
};

// ==========================================
// ★ 開発者モード用：TCGテストツール群
// ==========================================

// ① 全カードリセット
window.tcgDevResetAllCards = function() {
    if(confirm('本当に全カードとデッキをリセットしますか？\n（所持カード、デッキ、解放履歴がすべて消去されます）')) {
        window.TCG = { 
            myCollection: [], 
            decks: [[], [], []], 
            unlockedHistory: {}, 
            deckNames: ["デッキ 1", "デッキ 2", "デッキ 3"], 
            currentDeckIndex: 0 
        };
        window.saveTCGData();
        alert('TCGデータを完全にリセットしました！真っ更な状態です。');
    }
};

// ② カジノ強制オープン（60枚制限を無視）
window.tcgDevOpenCasino = function() {
    // もし myCollection が未定義なら初期化
    if (!window.TCG) window.TCG = { myCollection: [], decks: [[],[],[]] };
    if (!window.TCG.myCollection) window.TCG.myCollection = [];
    
    // 一時的に60枚制限を突破するためのダミーフラグを持たせてカジノを開く
    const originalLength = window.TCG.myCollection.length;
    
    // もし0枚なら、エラーを防ぐためにダミーを1枚だけ入れる（あとで消します）
    let dummyAdded = false;
    if (originalLength === 0) {
        window.TCG.myCollection.push({ dummy: true });
        dummyAdded = true;
    }

    // カジノオープン用のハック（既存のopenCasino関数を強引に実行）
    const tempCollection = window.TCG.myCollection;
    Object.defineProperty(window.TCG, 'myCollection', {
        get: function() { return { length: 999, forEach: tempCollection.forEach.bind(tempCollection), filter: tempCollection.filter.bind(tempCollection) }; },
        configurable: true
    });

    try {
        window.openCasino();
    } catch(e) {
        console.error(e);
        alert("カジノのオープンに失敗しました。");
    }

    // ハックをもとに戻す
    Object.defineProperty(window.TCG, 'myCollection', { value: tempCollection, configurable: true, writable: true });
    if (dummyAdded) window.TCG.myCollection.pop();
};

// ③ 好きなカードを指定枚数追加するリッチUIツール
window.tcgDevAddCardPrompt = function() {
    let existingModal = document.getElementById('tcg-dev-card-adder-modal');
    if (existingModal) existingModal.remove();

    let modal = document.createElement('div');
    modal.id = 'tcg-dev-card-adder-modal';
    modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:60000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
    
    let raceOptions = [
        {val: 'beetle', label: '🪲 カブトムシ系'},
        {val: 'dragon', label: '🐉 ドラゴン系'},
        {val: 'magician', label: '🧙 魔法使い系'},
        {val: 'spirit', label: '🍃 精霊系'},
        {val: 'stone', label: '🪨 ゴーレム系'},
        {val: 'machine', label: '⚙️ ぜんまい系'},
        {val: 'ghost', label: '👻 ゴースト系'},
        {val: 'bird', label: '🐦 鳥系'},
        {val: 'seed', label: '🌱 つぼみ系'},
        {val: 'balloon', label: '🎈 風船系'},
        {val: 'robot', label: '🤖 ロボット系'},
        {val: 'support', label: '🎒 サポート(魔法/罠等)'}
    ].map(opt => `<option value="${opt.val}">${opt.label}</option>`).join('');

    // カードリストのHTML生成
    let listHtml = Object.keys(window.TCG_MASTER).map(key => {
        let master = window.TCG_MASTER[key];
        let typeName = window.getCardTypeName(master.type);
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#222; border-radius:6px; border:1px solid #444;">
                <div style="display:flex; flex-direction:column; text-align:left;">
                    <span style="color:#00BCD4; font-size:10px;">ID: ${key}</span>
                    <span style="color:#FFF; font-size:14px; font-weight:bold;">${master.name} <span style="font-size:10px; color:#aaa;">(${typeName})</span></span>
                </div>
                <div style="display:flex; gap:5px;">
                    <button onclick="window._devAddCards('${key}', 1)" style="padding:6px 12px; background:#4CAF50; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">+1枚</button>
                    <button onclick="window._devAddCards('${key}', 4)" style="padding:6px 12px; background:#2196F3; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#1e88e5'" onmouseout="this.style.background='#2196F3'">+4枚</button>
                </div>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div style="background:#1a1a1a; border:3px solid #4CAF50; border-radius:12px; padding:20px; width:600px; max-width:95%; height:80vh; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #444; padding-bottom:10px; margin-bottom:15px;">
                <h2 style="color:#4CAF50; margin:0;">➕ テスト用カード追加</h2>
                <button onclick="document.getElementById('tcg-dev-card-adder-modal').remove()" style="background:#f44336; color:#fff; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">閉じる ✖</button>
            </div>
            
            <div style="background:#2a2a2a; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #444;">
                <h3 style="color:#FFC107; margin:0 0 10px 0; font-size:16px;">📦 種族一括追加（全進化形態を含む）</h3>
                <div style="display:flex; gap:10px; align-items:center;">
                    <select id="dev-bulk-race-select" style="padding:8px; background:#111; color:white; border:1px solid #555; border-radius:4px; flex:1;">
                        ${raceOptions}
                    </select>
                    <input type="number" id="dev-bulk-count" value="4" min="1" max="10" style="width:60px; padding:8px; background:#111; color:white; border:1px solid #555; border-radius:4px; text-align:center;"> 枚ずつ
                    <button onclick="window._devAddBulkCards()" style="padding:8px 20px; background:#FF9800; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">一括追加</button>
                </div>
            </div>

            <h3 style="color:#00BCD4; margin:0 0 10px 0; font-size:16px;">📝 個別追加リスト</h3>
            <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:10px; border-top:1px dashed #444; padding-top:10px;">
                ${listHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// 内部の追加処理用関数（トースト通知付き）
window._devAddCards = function(cardId, count, isSilent = false) {
    if(!window.TCG_MASTER[cardId]) return;
    if (!window.TCG.myCollection) window.TCG.myCollection = [];
    for(let i = 0; i < count; i++) {
        let master = window.TCG_MASTER[cardId];
        window.TCG.myCollection.push({
            uid: 'dev_' + cardId + '_' + Date.now() + '_' + i,
            masterId: cardId, 
            name: master.name, 
            type: master.type,
            cost: master.baseCost, 
            hp: master.baseHp, 
            maxHp: master.baseHp,
            skillName: master.skillName, 
            skillCost: master.skillCost,
            damage: master.baseDmg || 0, 
            ability: master.ability,
            image: master.image, 
            imageIndex: master.imageIndex,
            sx: master.sx, sy: master.sy, sw: master.sw, sh: master.sh,
            scaleX: master.scaleX, scaleY: master.scaleY,
            evolvesFrom: master.evolvesFrom
        });
    }
    window.saveTCGData();
    
    if(!isSilent) {
        let toast = document.createElement('div');
        toast.innerHTML = `✅ ${window.TCG_MASTER[cardId].name} を ${count}枚 追加しました`;
        toast.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(76,175,80,0.9); color:white; padding:10px 20px; border-radius:8px; z-index:65000; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.5); pointer-events:none; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 1500);
    }
};

window._devAddBulkCards = function() {
    let racePrefix = document.getElementById('dev-bulk-race-select').value;
    let count = parseInt(document.getElementById('dev-bulk-count').value);
    if(isNaN(count) || count <= 0) return;

    let keys = Object.keys(window.TCG_MASTER).filter(k => k.startsWith(racePrefix));
    if (keys.length === 0) return;

    keys.forEach(k => window._devAddCards(k, count, true));
    alert(`${racePrefix} 系の全カード（${keys.length}種）をそれぞれ ${count}枚ずつ 追加しました！\n（現在の総所持数: ${window.TCG.myCollection.length}枚）`);
};

// ==========================================
// ★ 柔軟な進化判定パッチ（分岐進化対応）
// ==========================================
window.checkCanEvolve = function(targetCard, evoCard) {
    if (!evoCard.evolvesFrom) return false;
    
    // ① 完全一致（基本種 -> 第1形態、または直系の進化）
    if (targetCard.type === evoCard.evolvesFrom) return true;

    // ② 柔軟判定（同じ種族・同じ属性なら、第1形態 -> 第2形態 への進化を全て許可）
    let evoBase = evoCard.type.split('_')[0]; // 例: "seed"
    let targetBase = targetCard.type.split('_')[0]; 
    
    let evoAttrMatch = evoCard.type.match(/type\d/); // 例: "type3"
    let targetAttrMatch = targetCard.type.match(/type\d/);

    if (evoBase === targetBase && evoAttrMatch && targetAttrMatch && evoAttrMatch[0] === targetAttrMatch[0]) {
        // マスターデータから進化段階（深さ）を確認
        const targetMaster = Object.values(window.TCG_MASTER).find(m => m.type === targetCard.type);
        const evoMaster = Object.values(window.TCG_MASTER).find(m => m.type === evoCard.type);
        
        if (targetMaster && evoMaster) {
            // targetCardが第1形態（evolvesFromが基本種）で、evoCardが第2形態（evolvesFromが_typeを含む）なら進化OK！
            let isTargetStage1 = targetMaster.evolvesFrom === targetBase;
            let isEvoStage2 = evoMaster.evolvesFrom && evoMaster.evolvesFrom.includes('_type');
            if (isTargetStage1 && isEvoStage2) return true;
        }
    }
    return false;
};

// エラーメッセージの表示名を親切にするパッチ
window.getEvolvesFromName = function(evolvesFromType) {
    if (!evolvesFromType) return "不明なモンスター";
    
    // 進化元が "_type" を含む（＝第2形態へ進化しようとしている）場合
    if (evolvesFromType.includes('_type')) {
        let attrMap = { 'type1': '闇', 'type2': '美', 'type3': '賢', 'type4': '活', 'type5': '老' };
        let attrMatch = evolvesFromType.match(/type\d/);
        if (attrMatch && attrMap[attrMatch[0]]) {
            return `同種族の【${attrMap[attrMatch[0]]}属性】のモンスター`;
        }
    }
    
    // 基本種族からの進化の場合の汎用名マップ
    const baseRaceMap = {
        'robot': '基本のロボット', 'dragon': '基本のドラゴン', 'magician': '基本の魔法使い', 'ghost': '基本のゴースト', 'seed': '基本のつぼみ', 'spirit': '基本の精霊', 'stone': '基本のゴーレム', 'machine': '基本のぜんまい', 'bird': '基本の鳥', 'beetle': '基本のかぶとむし', 'balloon': '基本の風船'
    };

    if (baseRaceMap[evolvesFromType]) {
        return baseRaceMap[evolvesFromType] + "モンスター";
    }

    // 万が一の保険
    const parentKey = Object.keys(window.TCG_MASTER).find(k => window.TCG_MASTER[k].type === evolvesFromType);
    if (parentKey) return window.TCG_MASTER[parentKey].name;
    
    return evolvesFromType;
};

// ==========================================
// ★ サポートカード（アクション・アイテム・フィールド）処理システム
// ==========================================

// ターゲット指定が必要なカードか判定
window.requiresTarget = function(card) {
    return ["action_atk_up", "item_hp_up", "item_taunt", "item_heal_cleanse"].includes(card.ability);
};

// アクション・アイテムの発動処理（発動後は墓地へ）
// window.executeSupportCard = function(card, targetCard, isPlayer) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const owner = isPlayer ? p : cpu;
//     let tIdx = targetCard ? owner.field.indexOf(targetCard) : -1;
//     let tId = isPlayer ? `p-card-${tIdx}` : `c-card-${tIdx}`;

//     window.showBattleMessage(`🪄 ${card.name} を発動！`, false, 2000, !isPlayer);

//     // アイテム効果
//     if (card.ability === "item_hp_up" && targetCard) {
//         targetCard.maxHp += 20; targetCard.hp += 20; window.showVFX(tId, 'heal', 'HP+20');
//     } else if (card.ability === "item_taunt" && targetCard) {
//         targetCard.isDefending = true; window.showVFX(tId, 'heal', '守護付与');
//     } else if (card.ability === "item_heal_cleanse" && targetCard) {
//         targetCard.hp = targetCard.maxHp; targetCard.status = null; window.showVFX(tId, 'heal', '全回復');
//     } else if (card.ability === "item_draw") {
//         if (owner.deck.length > 0) owner.hand.push(owner.deck.shift()); window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'ドロー');
//     } else if (card.ability === "item_mana_boost") {
//         owner.currentMana += 2; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'マナ回復');
//     }
//     // アクション効果
//     else if (card.ability === "action_draw_3") {
//         for(let i=0; i<3; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
//         window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '3ドロー');
//     } else if (card.ability === "action_atk_up" && targetCard) {
//         targetCard.damage += 40; window.showVFX(tId, 'heal', '攻+40');
//     } else if (card.ability === "action_search_evo") {
//         let evos = owner.deck.filter(c => window.TCG_MASTER[c.masterId] && window.TCG_MASTER[c.masterId].evolvesFrom);
//         if (evos.length > 0) {
//             let hit = evos[Math.floor(Math.random() * evos.length)];
//             owner.deck = owner.deck.filter(c => c !== hit); owner.hand.push(hit);
//             window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'サーチ');
//         }
//     } else if (card.ability === "action_heal_face") {
//         owner.hp += 100; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '100回復');
//     } else if (card.ability === "action_heal_all") {
//         owner.hp += 100; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '全回復');
//         owner.field.forEach((c, idx) => { c.hp = c.maxHp; window.showVFX(isPlayer ? `p-card-${idx}` : `c-card-${idx}`, 'heal'); });
//     }

//     card.isDead = true;
//     if (!owner.graveyard) owner.graveyard = [];
//     owner.graveyard.push(card); // 使い終わったら墓地へ
//     window.renderBattleBoard();
// };

// フィールドカードの展開処理
// window.playFieldCard = function(card, isPlayer) {
//     const ownerObj = isPlayer ? window.TCG_BATTLE.player : window.TCG_BATTLE.cpu;
//     if (window.TCG_BATTLE.currentField) { // 既存のフィールドがあれば墓地へ
//         window.TCG_BATTLE.currentField.owner.graveyard.push(window.TCG_BATTLE.currentField.card);
//     }
//     window.TCG_BATTLE.currentField = { card: card, owner: ownerObj };
//     window.showBattleMessage(`🗺️ フィールド展開：\n『${card.name}』！`, false, 2500, !isPlayer);
    
//     // 展開時の即時バフ（森の加護）
//     if (card.ability === "field_forest") {
//         const buffRaces = ["spirit", "seed", "beetle"];
//         const applyBuff = (pObj, pfx) => {
//             pObj.field.forEach((c, idx) => {
//                 if (buffRaces.includes(c.type.split('_')[0])) { c.maxHp += 20; c.hp += 20; window.showVFX(`${pfx}-card-${idx}`, 'heal', '森の加護'); }
//             });
//         };
//         applyBuff(window.TCG_BATTLE.player, 'p'); applyBuff(window.TCG_BATTLE.cpu, 'c');
//     }
//     window.renderBattleBoard();
// };

// ==========================================
// ★ サポートカード（アクション・アイテム・フィールド）処理システム
// ==========================================
if (!window.TCG_BATTLE) window.TCG_BATTLE = {}; 
window.TCG_BATTLE.currentField = null; 
window.TCG_BATTLE.targetingHandIndex = -1;

window.requiresTarget = function(card) {
    return ["action_atk_up", "item_hp_up", "item_taunt", "item_heal_cleanse"].includes(card.ability);
};

// window.executeSupportCard = function(card, targetCard, isPlayer) {
//     const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
//     const owner = isPlayer ? p : cpu;
//     let tIdx = targetCard ? owner.field.indexOf(targetCard) : -1;
//     let tId = isPlayer ? `p-card-${tIdx}` : `c-card-${tIdx}`;

//     window.showBattleMessage(`🪄 ${card.name} を発動！`, false, 2000, !isPlayer);

//     // 各カードの効果
//     if (card.ability === "item_hp_up" && targetCard) {
//         targetCard.maxHp += 20; targetCard.hp += 20; window.showVFX(tId, 'heal', 'HP+20');
//     } else if (card.ability === "item_taunt" && targetCard) {
//         targetCard.isDefending = true; window.showVFX(tId, 'heal', '守護付与');
//     } else if (card.ability === "item_heal_cleanse" && targetCard) {
//         targetCard.hp = targetCard.maxHp; targetCard.status = null; window.showVFX(tId, 'heal', '全回復');
//     } else if (card.ability === "item_draw") {
//         if (owner.deck.length > 0) owner.hand.push(owner.deck.shift()); window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'ドロー');
//     } else if (card.ability === "item_mana_boost") {
//         owner.currentMana += 2; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'マナ+2');
//     }
//     else if (card.ability === "action_draw_3") {
//         for(let i=0; i<3; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); }
//         window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '3ドロー');
//     } else if (card.ability === "action_atk_up" && targetCard) {
//         targetCard.damage += 40; window.showVFX(tId, 'heal', '攻+40');
//     } else if (card.ability === "action_search_evo") {
//         let evos = owner.deck.filter(c => window.TCG_MASTER[c.masterId] && window.TCG_MASTER[c.masterId].evolvesFrom);
//         if (evos.length > 0) {
//             let hit = evos[Math.floor(Math.random() * evos.length)];
//             owner.deck = owner.deck.filter(c => c !== hit); owner.hand.push(hit);
//             window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'サーチ');
//         }
//     } else if (card.ability === "action_heal_face") {
//         owner.hp += 100; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '100回復');
//     } else if (card.ability === "action_heal_all") {
//         owner.hp += 100; window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '全回復');
//         owner.field.forEach((c, idx) => { c.hp = c.maxHp; window.showVFX(isPlayer ? `p-card-${idx}` : `c-card-${idx}`, 'heal'); });
//     }

//     card.isDead = true;
//     if (!owner.graveyard) owner.graveyard = [];
//     owner.graveyard.push(card); 
//     window.renderBattleBoard();
// };

// ==========================================
// ★ バグ修正：サポートカード（魔法・アイテム）処理パッチ
// ==========================================
window.executeSupportCard = function(card, targetCard, isPlayer) {
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const owner = isPlayer ? p : cpu;
    
    // エラー防止：ターゲットIDを先に定義しておく
    let tIdx = targetCard ? owner.field.indexOf(targetCard) : -1;
    let tId = isPlayer ? `p-card-${tIdx}` : `c-card-${tIdx}`;

    // 1. まずステータスの計算だけを行う
    if (card.ability === "item_hp_up" && targetCard) { 
        targetCard.maxHp += 20; targetCard.hp += 20; 
    }
    else if (card.ability === "item_taunt" && targetCard) {
        targetCard.hasPermanentTaunt = true; 
        targetCard.isDefending = true; 
    }
    else if (card.ability === "item_heal_cleanse" && targetCard) { 
        // ★修正：現在のHPがすでに最大HPを突破している場合は、その高いHPを維持する！
        targetCard.hp = Math.max(targetCard.hp, targetCard.maxHp); 
        targetCard.status = null; 
    }
    else if (card.ability === "item_draw") { 
        if (owner.deck.length > 0) owner.hand.push(owner.deck.shift()); 
    }
    else if (card.ability === "item_mana_boost") { 
        owner.currentMana += 2; 
    }
    else if (card.ability === "action_draw_3") { 
        for(let i=0; i<3; i++) { if(owner.deck.length > 0) owner.hand.push(owner.deck.shift()); } 
    }
    else if (card.ability === "action_atk_up" && targetCard) { 
        targetCard.damage += 40; 
    }
    else if (card.ability === "action_search_evo") {
        let evos = owner.deck.filter(c => window.TCG_MASTER[c.masterId] && window.TCG_MASTER[c.masterId].evolvesFrom);
        if (evos.length > 0) {
            let hit = evos[Math.floor(Math.random() * evos.length)];
            owner.deck = owner.deck.filter(c => c !== hit); owner.hand.push(hit);
        }
    }
    else if (card.ability === "action_heal_face") { 
        owner.hp += 100; 
    }
    else if (card.ability === "action_heal_all") {
        owner.hp += 100; 
        // ★修正：全体回復も同じく突破したHPを削らないようにする
        owner.field.forEach(c => c.hp = Math.max(c.hp, c.maxHp)); 
    }

    card.isDead = true;
    if (!owner.graveyard) owner.graveyard = [];
    owner.graveyard.push(card); 
    
    // 2. 盤面を描画して、新しいステータスを画面に反映させる
    window.renderBattleBoard();

    // 3. 最後にエフェクト（VFX）とメッセージを出す
    window.showBattleMessage(`🪄 ${card.name} を発動！`, false, 2000, !isPlayer);

    if (card.ability === "item_hp_up" && targetCard) window.showVFX(tId, 'heal', 'HP+20');
    else if (card.ability === "item_taunt" && targetCard) window.showVFX(tId, 'heal', '守護付与');
    else if (card.ability === "item_heal_cleanse" && targetCard) window.showVFX(tId, 'heal', '全回復＆浄化');
    else if (card.ability === "item_draw") window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'ドロー');
    else if (card.ability === "item_mana_boost") window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'マナ+2');
    else if (card.ability === "action_draw_3") window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '3ドロー');
    else if (card.ability === "action_atk_up" && targetCard) window.showVFX(tId, 'heal', '攻+40');
    else if (card.ability === "action_search_evo") window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'サーチ');
    else if (card.ability === "action_heal_face") window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '100回復');
    else if (card.ability === "action_heal_all") {
        window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', '全回復');
        owner.field.forEach((c, idx) => { window.showVFX(isPlayer ? `p-card-${idx}` : `c-card-${idx}`, 'heal'); });
    }
};

window.playFieldCard = function(card, isPlayer) {
    const ownerObj = isPlayer ? window.TCG_BATTLE.player : window.TCG_BATTLE.cpu;
    if (window.TCG_BATTLE.currentField) {
        window.TCG_BATTLE.currentField.owner.graveyard.push(window.TCG_BATTLE.currentField.card);
    }
    window.TCG_BATTLE.currentField = { card: card, owner: ownerObj };
    window.showBattleMessage(`🗺️ フィールド展開：\n『${card.name}』！`, false, 2500, !isPlayer);
    
    if (card.ability === "field_forest") {
        const buffRaces = ["spirit", "seed", "beetle"];
        const applyBuff = (pObj, pfx) => {
            pObj.field.forEach((c, idx) => {
                if (buffRaces.includes(c.type.split('_')[0])) { c.maxHp += 20; c.hp += 20; window.showVFX(`${pfx}-card-${idx}`, 'heal', '森の加護'); }
            });
        };
        applyBuff(window.TCG_BATTLE.player, 'p'); applyBuff(window.TCG_BATTLE.cpu, 'c');
    }
    // ▼▼▼ 追加：鉱脈を出した瞬間のマナ上限突破 ▼▼▼
    else if (card.ability === "field_mana") {
        window.showBattleMessage(`💎 結晶の鉱脈！\nお互いの最大マナが ＋2 される！`, false, 2500, !isPlayer);
        [window.TCG_BATTLE.player, window.TCG_BATTLE.cpu].forEach(obj => {
            if (obj.maxMana === undefined) obj.maxMana = 1;
            obj.maxMana = Math.min(12, obj.maxMana + 2); // 上限を12まで引き上げ！
            obj.currentMana = Math.min(obj.maxMana, obj.currentMana + 2);
        });
        window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', 'マナ活性!');
    }
    // ▲▲▲ 追加おわり ▲▲▲
    window.renderBattleBoard();
};

// ==========================================
// ★ フィールド効果＆ターン進行の統合パッチ
// ==========================================

// フィールドカードのターン処理ロジック
window.triggerFieldEffects = async function(timing, isPlayerTurn) {
    if (!window.TCG_BATTLE.currentField) return;
    const fAbility = window.TCG_BATTLE.currentField.card.ability;
    const p = window.TCG_BATTLE.player; 
    const cpu = window.TCG_BATTLE.cpu;
    const activeObj = isPlayerTurn ? p : cpu;
    const activeFace = isPlayerTurn ? 'player-face' : 'cpu-face';

    if (timing === "start") {
        if (fAbility === "field_casino") {
            window.showBattleMessage(`🎰 カジノ効果発動！\n(ギャンブル判定中...)`, false, 1500, !isPlayerTurn);
            await window.tcgSleep(1000);
            
            if (Math.random() < 0.5) {
                if (activeObj.deck.length > 0) {
                    let drawnCard = activeObj.deck.shift();
                    activeObj.hand.push(drawnCard);
                    window.showVFX(activeFace, 'heal', '大当たり!');
                    window.showBattleMessage(`🎯 カジノ大当たり！カードを1枚引いた！`, false, 2000, !isPlayerTurn);
                    
                    // ▼▼▼ 修正：プレイヤーの時だけ、被らないようにレイアウトを整えて表示 ▼▼▼
                    if (isPlayerTurn) {
                        let ui = document.createElement('div');
                        // flexboxを使って縦並びを強制し、絶対に要素がかぶらないようにする
                        ui.style.cssText = `position:fixed; top:45%; left:50%; transform:translate(-50%, -50%); z-index:50000; pointer-events:none; text-align:center; transition: all 0.3s ease-out; opacity: 0; margin-top: 20px; display:flex; flex-direction:column; align-items:center; justify-content:center;`;
                        ui.innerHTML = `
                            <div style="font-size:26px; font-weight:bold; color:#FFD700; text-shadow:0 0 10px #000; background:rgba(0,0,0,0.7); padding:5px 15px; border-radius:20px; border:2px solid #FFD700; margin-bottom: 50px;">🎰 大当たり！！</div>
                            <div style="transform: scale(1.3); filter: drop-shadow(0 0 20px #FFD700); transform-origin: center top;">
                                ${window.renderCardHTML(drawnCard)}
                            </div>
                        `;
                        document.body.appendChild(ui);
                        
                        setTimeout(() => { ui.style.opacity = '1'; ui.style.marginTop = '0'; }, 50);
                        setTimeout(() => { ui.style.opacity = '0'; ui.style.marginTop = '-20px'; }, 1700);
                        setTimeout(() => ui.remove(), 2000);
                    }
                    // ▲▲▲ 修正おわり（CPUの時はドローしたというログとエフェクトだけ残る） ▲▲▲
                }
            } else {
                // ▼▼▼ 修正：変数ではなく本体データのHPを確実にマイナスする ▼▼▼
                if (isPlayerTurn) {
                    window.TCG_BATTLE.player.hp -= 10;
                } else {
                    window.TCG_BATTLE.cpu.hp -= 10;
                }
                
                // 痛そうなダメージ演出と画面揺れ
                window.showVFX(activeFace, 'slash'); // ザクッ！という斬撃
                window.showVFX(activeFace, 'damage', 10);
                window.showBattleMessage(`💥 カジノ大ハズレ... リーダーに10ダメージ！`, true, 2000, !isPlayerTurn);
                
                // 画面全体を揺らす
                let board = document.getElementById('tcg-battle-ui') || document.body;
                let originalTransform = board.style.transform;
                board.style.transition = 'transform 0.05s';
                let shakes = [10, -10, 8, -8, 5, -5, 0];
                let step = 0;
                let shakeInterval = setInterval(() => {
                    board.style.transform = `translateX(${shakes[step]}px)`;
                    step++;
                    if (step >= shakes.length) {
                        clearInterval(shakeInterval);
                        board.style.transform = originalTransform;
                        board.style.transition = '';
                    }
                }, 50);
                // ▲▲▲ 追加おわり ▲▲▲
            }
            window.renderBattleBoard();
            await window.tcgSleep(1500);
        }
        // ▼▼▼ 修正：システムにマナを10に下げられてしまうのを防ぐ ▼▼▼
        else if (fAbility === "field_mana") {
            // ベースのターン処理で10でストップしてしまっていたら、12まで上限を解放する
            if (activeObj.maxMana >= 10) {
                activeObj.maxMana = 12;
                activeObj.currentMana = 12; // 12まで全回復！
            }
            // ※毎ターンメッセージを出すとうるさいので、裏側で静かに上限突破させます
        }
    } else if (timing === "end") {
        if (fAbility === "field_miasma") {
            window.showBattleMessage(`☠️ 瘴気の沼！\nターン終了時、全員に10ダメージ！`, false, 2000, !isPlayerTurn);
            await window.tcgSleep(1000);
            [p, cpu].forEach((obj, isCPU) => {
                obj.hp -= 10; window.showVFX(isCPU ? 'cpu-face' : 'player-face', 'damage', 10);
                obj.field.forEach((c, idx) => {
                    c.hp -= 10; window.showVFX(isCPU ? `c-card-${idx}` : `p-card-${idx}`, 'damage', 10);
                    if (c.hp <= 0) c.isDead = true;
                });
            });
            p.field = p.field.filter(c => !c.isDead);
            cpu.field = cpu.field.filter(c => !c.isDead);
            window.renderBattleBoard();
            await window.tcgSleep(1500);
        }
    }
    
    // HP0になった場合のゲームセット判定
    if (p.hp <= 0) {
        p.hp = 0; 
        if (window.audioManager) window.audioManager.playBGM('card_lose'); // ★敗北BGM
        window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000);
        setTimeout(() => { document.getElementById('tcg-battle-ui').style.display = 'none'; if(window.audioManager) window.audioManager.restoreMainBGM(); }, 3000);
    } else if (cpu.hp <= 0) {
        cpu.hp = 0; 
        if (window.audioManager) window.audioManager.playBGM('card_victory'); // ★勝利BGM
        window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n敵リーダーのHPが0になりました！", false, 5000);
        setTimeout(() => { document.getElementById('tcg-battle-ui').style.display = 'none'; if(window.audioManager) window.audioManager.restoreMainBGM(); }, 3000);
    }
};

// ターン進行の横入りフック（既存の関数を包み込む）
if (!window._originalStartPlayerTurn_saved) {
    window._originalStartPlayerTurn_saved = window.startPlayerTurn;
    window._originalExecuteCPUTurn_saved = window.executeCPUTurn;
}

window.startPlayerTurn = async function(isFirstTurn = false) {
    if (!isFirstTurn) await window.triggerFieldEffects("end", false); // CPUターン終了時の効果
    
    window._originalStartPlayerTurn_saved(isFirstTurn);
    window.TCG_BATTLE.isEnemyTurn = true; // 演出中の操作ブロック
    
    // 永続守護の維持
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        window.TCG_BATTLE.player.field.forEach(c => {
            if (c.hasPermanentTaunt) c.isDefending = true;
        });
    }
    
    await window.triggerFieldEffects("start", true); // 自ターン開始時の効果
    window.TCG_BATTLE.isEnemyTurn = false; // 操作ブロック解除
};

window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true; // ターン終了直後に操作ブロック
    
    if (!isFirstTurn) await window.triggerFieldEffects("end", true); // 自ターン終了時の効果
    await window.triggerFieldEffects("start", false); // CPUターン開始時の効果
    
    // 元のCPUターン処理へ
    await window._originalExecuteCPUTurn_saved(isFirstTurn);
};

// ==========================================
// ★ 進化判定の柔軟化パッチ（分岐ルート＆階級チェック対応）
// ==========================================
window.checkCanEvolve = function(fieldCard, handCard) {
    if (!handCard.evolvesFrom) return false;
    const fMaster = window.TCG_MASTER[fieldCard.masterId];
    const fType = fMaster ? fMaster.type : fieldCard.type;
    const fEvolvesFrom = fMaster ? fMaster.evolvesFrom : fieldCard.evolvesFrom;

    // 1. 完全一致（基本種族 → 第1形態 など）
    if (fType === handCard.evolvesFrom) return true;

    // 2. 柔軟な一致（第1形態 → 第2形態 の分岐ルート対応）
    // 手札の進化条件が "xxx_typeY" などの場合
    if (handCard.evolvesFrom.includes('_type')) {
        const reqMatch = handCard.evolvesFrom.match(/^([a-z]+)_type(\d)/); 
        const fMatch = fType.match(/^([a-z]+)_type(\d)/);

        // 種族とルート属性（typeの直後の数字）が一致しているか
        if (reqMatch && fMatch && reqMatch[1] === fMatch[1] && reqMatch[2] === fMatch[2]) {
            // 【重要】盤面のカードが「第1形態」であることを確認する
            // （第1形態の evolvesFrom は "beetle" などであり "_type" を含まない）
            if (fEvolvesFrom && !fEvolvesFrom.includes('_type')) {
                return true; 
            }
        }
    }
    return false;
};

// ==========================================
// 📖 TCGボタン偽装＆アップデート処理
// ==========================================
window.updateTcgButtonAppearance = function() {
    const btn = document.getElementById('btnTcgDeck');
    if (!btn) return;

    // 現在の所持枚数をチェック
    const collectionCount = (window.TCG && window.TCG.myCollection) ? window.TCG.myCollection.length : 0;

    if (collectionCount >= 60) {
        // TCG解禁後（本来の姿）
        btn.innerHTML = '🃏 TCG';
        btn.style.background = '#9C27B0'; // 元の紫カラー
    } else {
        // TCG未解放時（アルバムに偽装）
        btn.innerHTML = '📖 アルバム';
        btn.style.background = '#795548'; // アルバム風のブラウンカラー
    }
};

// ==========================================
// ★ カードショップ ＆ レトロ・カードパック演出システム
// ==========================================

window.openCardShopUI = function() {
    let ui = document.getElementById('tcg-shop-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'tcg-shop-ui';
        ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:50000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
        document.body.appendChild(ui);
    }
    
    const gold = window.aiPet ? (window.aiPet.gold || 0) : 0;
    const canDraw = gold >= 100;
    
    ui.innerHTML = `
        <div style="background:#222; border:4px solid #00BCD4; border-radius:12px; padding:30px; width:450px; text-align:center; color:white; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#00BCD4; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">💳 カードショップ</h2>
            <div style="font-size:18px; margin-bottom:20px; color:#FFD700; font-weight:bold;">所持金: ${gold} G</div>
            <div style="font-size:13px; color:#aaa; margin-bottom:20px; line-height:1.5;">図鑑に登録された仲間と、<br>獲得したことのある魔法・罠カードが排出されます。<br>※育成ボーナス無しの初期ステータスです。</div>
            
            <div style="display:flex; flex-direction:column; gap:15px; margin-bottom:20px;">
                <button onclick="if(${canDraw}){ document.getElementById('tcg-shop-ui').style.display='none'; window.drawCardPack(); } else { alert('お金が足りません！'); }" 
                        style="padding:15px; font-size:18px; font-weight:bold; background:${canDraw ? '#E91E63' : '#555'}; color:white; border:2px solid ${canDraw ? '#FF80AB' : '#777'}; border-radius:8px; cursor:${canDraw ? 'pointer' : 'not-allowed'}; transition:0.2s;"
                        onmouseover="if(${canDraw}) this.style.transform='scale(1.05)'" onmouseout="if(${canDraw}) this.style.transform='scale(1)'">
                    カードパックを引く (100 G)
                </button>
                <button onclick="document.getElementById('tcg-shop-ui').style.display='none'; window.openCardMarketUI();" 
                        style="padding:15px; font-size:18px; font-weight:bold; background:#4CAF50; color:white; border:2px solid #81C784; border-radius:8px; cursor:pointer; transition:0.2s;"
                        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    オンライン・カード市場
                </button>
            </div>
            <button onclick="document.getElementById('tcg-shop-ui').style.display='none'; window.exitCardShop();" style="padding:10px 30px; font-size:16px; font-weight:bold; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">店を出る</button>
        </div>
    `;
    ui.style.display = 'flex';
};

window.drawCardPack = function() {
    if (!window.aiPet || (window.aiPet.gold || 0) < 100) return;
    
    let pool = [];
    
    // モンスター
    let discovered = window.aiPet.discoveredMonsters || ['robot'];
    discovered.forEach(skin => {
        Object.keys(window.TCG_MASTER).forEach(key => {
            if (window.TCG_MASTER[key].type === skin) pool.push(key);
        });
    });
    
    // サポート
    let unlockedSupport = [];
    if (window.TCG && window.TCG.myCollection) {
        window.TCG.myCollection.forEach(c => {
            if (['item', 'action', 'field'].includes(c.type)) {
                if (!unlockedSupport.includes(c.masterId)) unlockedSupport.push(c.masterId);
            }
        });
    }
    unlockedSupport.forEach(id => pool.push(id));
    if (pool.length === 0) pool = ['robot_0'];
    
    let resultId = pool[Math.floor(Math.random() * pool.length)];
    let m = window.TCG_MASTER[resultId];
    
    window.aiPet.gold -= 100;
    if (typeof updateStatUI === 'function') updateStatUI();
    
    let newCard = {
        uid: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000), 
        masterId: resultId, name: m.name, type: m.type,
        cost: m.baseCost, 
        hp: m.baseHp, maxHp: m.baseHp,
        skillName: m.skillName, skillCost: m.skillCost,
        damage: m.baseDmg || 0,
        ability: m.ability, image: m.image, imageIndex: m.imageIndex,
        sx: m.sx, sy: m.sy, sw: m.sw, sh: m.sh,
        scaleX: m.scaleX, scaleY: m.scaleY, evolvesFrom: m.evolvesFrom
    };
    
    window.TCG.myCollection.push(newCard);
    window.saveTCGData();
    
    window.showCardPackAnimation(newCard);
};

// 🎬 カードパック排出アニメーション（排出口からスライド排出 ＋ 飛んでいく完全版）
window.showCardPackAnimation = function(card) {
    let ui = document.createElement('div');
    ui.id = 'cardpack-anim-ui';
    ui.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(10, 20, 30, 0.95);
        z-index: 60000; display: flex; align-items: center; justify-content: center;
        font-family: sans-serif; perspective: 1000px;
    `;
    
    let container = document.createElement('div');
    container.style.cssText = `position: relative; width: 800px; height: 400px; display: flex; align-items: center; perspective: 1000px;`;
    
    let machineSlot = document.createElement('div');
    machineSlot.style.cssText = `
        position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 80px; height: 320px; background: linear-gradient(to right, #ccc, #eee);
        border: 4px solid #888; border-left:none; border-radius: 0 15px 15px 0;
        box-shadow: 10px 0 20px rgba(0,0,0,0.5); z-index: 10;
        display:flex; justify-content:flex-end; align-items:center;
    `;
    let hole = document.createElement('div');
    hole.style.cssText = `
        width: 10px; height: 280px; background: #111;
        border-radius: 4px; margin-right: 5px; box-shadow: inset 4px 4px 8px #000;
    `;
    machineSlot.appendChild(hole);
    container.appendChild(machineSlot);
    
    // ▼ スリットから出る様子を表現するための「覗き窓（マスク）」
    let cardWrapper = document.createElement('div');
    cardWrapper.style.cssText = `
        position: absolute; left: 80px; top: 50%; transform: translateY(-50%);
        width: 300px; height: 400px; overflow: hidden; z-index: 5;
    `;

    // ▼ 移動・拡大縮小を行うコンテナ（最初は左にずらして、排出口の奥に隠しておく）
    let slideContainer = document.createElement('div');
    slideContainer.style.cssText = `
        position: absolute; left: 0px; top: 70px; width: 180px; height: 260px;
        transform: translateX(-200px); /* 完全に排出口の奥（左枠外）に隠す */
    `;

    let flipContainer = document.createElement('div');
    flipContainer.style.cssText = `
        width: 100%; height: 100%; position: relative;
        transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform: rotateY(0deg); 
    `;

    let cardFront = document.createElement('div');
    cardFront.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        backface-visibility: hidden; transform: rotateY(180deg);
        box-shadow: 5px 5px 15px rgba(0,0,0,0.6); pointer-events: none; border-radius: 12px;
    `;
    cardFront.innerHTML = window.renderCardHTML(card);

    let cardBack = document.createElement('div');
    cardBack.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        backface-visibility: hidden; transform: rotateY(0deg);
        background: #2A00D5; border: 8px solid #E0E0E0; border-radius: 12px;
        box-shadow: 5px 5px 15px rgba(0,0,0,0.6); box-sizing: border-box;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 15px, transparent 15px, transparent 30px);
    `;
    cardBack.innerHTML = `
        <div style="width: 80px; height: 80px; background: rgba(0,0,0,0.5); border-radius: 50%; border: 4px solid #FFD700; display: flex; justify-content: center; align-items: center; color: #FFD700; font-weight: bold; font-size: 24px; font-family: monospace; transform: rotate(-15deg); box-shadow: inset 0 0 10px rgba(0,0,0,0.8);">TCG</div>
        <div style="color: white; font-weight: bold; letter-spacing: 2px; margin-top: 20px; font-size: 16px; font-family: sans-serif; text-shadow: 2px 2px 0 #000;">MEMORY PACK</div>
    `;

    flipContainer.appendChild(cardFront);
    flipContainer.appendChild(cardBack);
    slideContainer.appendChild(flipContainer);
    cardWrapper.appendChild(slideContainer);
    container.appendChild(cardWrapper);
    
    ui.appendChild(container);
    document.body.appendChild(ui);
    
    let shakeCount = 0;
    let shakeTimer = setInterval(() => {
        let x = (Math.random() - 0.5) * 6; let y = (Math.random() - 0.5) * 6;
        machineSlot.style.transform = `translate(${x}px, calc(-50% + ${y}px))`;
        shakeCount++;
        if (shakeCount > 15) { clearInterval(shakeTimer); machineSlot.style.transform = `translateY(-50%)`; }
    }, 50);

    setTimeout(() => {
        // 1. 排出口の奥（枠外）から、スムーズに右へスライドして出てくる！
        slideContainer.style.transition = "transform 0.8s ease-out";
        slideContainer.style.transform = "translateX(20px)";
        
        setTimeout(() => {
            // 2. クルッとめくれて表になる！
            flipContainer.style.transform = "rotateY(180deg)";
            
            setTimeout(() => {
                // 3. 飛んでいく前に、はみ出しを隠す制限（overflow: hidden）を解除する！
                cardWrapper.style.overflow = "visible";
                
                // 右にスライドして詳細画面へ飛んでいく
                slideContainer.style.transition = "transform 0.6s ease-in, opacity 0.6s ease-in";
                slideContainer.style.transform = "translateX(500px) scale(1.5)";
                slideContainer.style.opacity = "0";
                
                setTimeout(() => {
                    ui.remove();
                    window.showCardDetailModal(card, true);
                }, 600);
            }, 1200); 
        }, 1000); 
    }, 100);
};

// ★詳細画面の「もう1回引く」ボタンも変更
const _origShowCardDetailModal = window.showCardDetailModal;
window.showCardDetailModal = function(card, fromGacha = false) {
    _origShowCardDetailModal(card, fromGacha);
    let modal = document.getElementById('tcg-card-detail-modal');
    if (modal && fromGacha) {
        // ボタンの onclick を古い drawCarddass から新しい drawCardPack に置き換えるハック
        modal.innerHTML = modal.innerHTML.replace(/window\.drawCarddass\(\)/g, "window.drawCardPack()");
    }
};

// ==========================================
// ★ バグ修正：バトル中の詳細表示（虫眼鏡）エラー解消パッチ
// ==========================================
window.showCardDetailModal = function(ownerTypeOrCard, indexOrFromGacha) {
    let card = null;
    let fromGacha = false;
    let isBattleSimple = false;

    // ★修正：引数が「文字列（バトル中）」か「オブジェクト（バインダー等）」かで処理を分ける！
    if (typeof ownerTypeOrCard === 'string') {
        isBattleSimple = true;
        let index = indexOrFromGacha;
        if (ownerTypeOrCard === 'player') card = window.TCG_BATTLE.player.field[index];
        else if (ownerTypeOrCard === 'cpu') card = window.TCG_BATTLE.cpu.field[index];
        else if (ownerTypeOrCard === 'player_hand') card = window.TCG_BATTLE.player.hand[index];
        else if (ownerTypeOrCard === 'player_field') card = window.TCG_BATTLE.currentField.card;
        else if (ownerTypeOrCard === 'cpu_field') card = window.TCG_BATTLE.currentField.card;
    } else {
        card = ownerTypeOrCard;
        fromGacha = indexOrFromGacha === true;
    }

    if (!card) return;

    let modal = document.getElementById('tcg-card-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-card-detail-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10,15,20,0.95); z-index: 65000;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.3s;
        `;
        document.body.appendChild(modal);
    }
    
    // 背景（またはカード自身）をクリックした時に閉じる
    modal.onclick = function(e) {
        if (e.target === this || isBattleSimple) {
            modal.style.display = 'none';
        }
    };

    if (isBattleSimple) {
        // ★ バトル中は、シンプルに「カードだけを大きく拡大」するUIにする
        modal.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; pointer-events:none;">
                <div style="margin-bottom: 20px; color: #00BCD4; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">
                    🔍 カード詳細
                </div>
                <div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(0,188,212,0.6); border-radius: 12px;">
                    ${window.renderCardHTML(card)}
                </div>
                <div style="margin-top: 130px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">
                    画面をクリックして閉じる
                </div>
            </div>
        `;
    } else {
        // ガチャやバインダー用のリッチUI（ステータス表示付き）
        let isSupport = ['item','action','field'].includes(card.type);
        let s_hp = isSupport ? "---" : card.hp;
        let s_cost = card.cost;
        let s_dmg = isSupport ? "---" : (card.damage || 0);
        
        let btnHtml = '';
        if (fromGacha) {
            btnHtml = `
                <div style="display:flex; gap:20px; margin-top:30px; justify-content:center;">
                    <button onclick="document.getElementById('tcg-card-detail-modal').style.display='none'; window.drawCardPack();" style="padding:12px 30px; font-size:18px; font-weight:bold; background:#00BCD4; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.5);">もう1回引く</button>
                    <button onclick="document.getElementById('tcg-card-detail-modal').style.display='none'; window.openCardShopUI();" style="padding:12px 30px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #888; border-radius:8px; cursor:pointer;">店に戻る</button>
                </div>
            `;
        } else {
            btnHtml = `
                <div style="margin-top:30px; text-align:center;">
                    <button onclick="document.getElementById('tcg-card-detail-modal').style.display='none';" style="padding:12px 40px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #888; border-radius:8px; cursor:pointer;">閉じる</button>
                </div>
            `;
        }

        modal.innerHTML = `
            <div style="display:flex; align-items:center; gap:50px; transform:scale(0.9); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="card-detail-inner">
                <div style="transform: scale(1.5); box-shadow: 0 0 30px rgba(0,188,212,0.4); border-radius: 12px; pointer-events:none;">
                    ${window.renderCardHTML(card)}
                </div>
                
                <div style="width: 350px; background: #222; border: 4px solid #00BCD4; border-radius: 12px; padding: 25px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" onclick="event.stopPropagation()">
                    <div style="font-size:26px; font-weight:bold; color:#00BCD4; border-bottom:2px solid #444; padding-bottom:10px; margin-bottom:20px;">
                        ${card.name}
                    </div>
                    <div style="display:flex; flex-direction:column; gap:12px; font-size:18px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; background:#111; padding:10px; border-radius:6px;">
                            <span style="color:#aaa;">必要マナ</span><span style="color:#FFD700; font-weight:bold;">${s_cost}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:#111; padding:10px; border-radius:6px;">
                            <span style="color:#aaa;">HP</span><span style="color:#4CAF50; font-weight:bold;">${s_hp}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; background:#111; padding:10px; border-radius:6px;">
                            <span style="color:#aaa;">攻撃力 (威力)</span><span style="color:#ff5252; font-weight:bold;">${s_dmg}</span>
                        </div>
                    </div>
                    ${btnHtml}
                </div>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        let inner = document.getElementById('card-detail-inner');
        if (inner) inner.style.transform = 'scale(1)';
    }, 50);
};

// ==========================================
// 🌐 オンラインカードマーケットUI（完全リッチ化＆バグ修正版）
// ==========================================

// ★共通リッチメッセージ表示関数
window.showMarketMessage = function(msg, isError = false) {
    let popup = document.createElement('div');
    popup.innerHTML = msg;
    popup.style.cssText = `position:fixed; top:40%; left:50%; transform:translate(-50%,-50%); background:${isError ? 'rgba(244,67,54,0.95)' : 'rgba(0,188,212,0.95)'}; color:#fff; padding:20px 40px; border-radius:12px; font-weight:bold; font-size:20px; z-index:99999; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; pointer-events:none; animation: slideUpFade 3s forwards;`;
    let container = document.getElementById('tcg-market-ui') || document.body;
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
};

window.openCardMarketUI = async function() {
    let modal = document.getElementById('tcg-market-ui');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'tcg-market-ui';
        modal.style.cssText = `position:fixed; top:2%; left:2%; width:96%; height:96%; background:#1a1a1a; border:4px solid #00BCD4; border-radius:12px; z-index:55000; display:flex; flex-direction:column; overflow:hidden; font-family:sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8);`;
        document.body.appendChild(modal);
    }
    
    const myId = localStorage.getItem('my_player_id');
    if (!myId) {
        window.showMarketMessage("⚠️ オンライン機能を利用するにはログインが必要です。", true);
        return;
    }

    window.refreshMarketUI = async function(mode = 'buy') {
        let titleAreaHtml = `
            <div style="background:#006064; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #004D40;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <h2 style="margin:0; color:#FFF; font-size:22px;">🌐 オンライン市場</h2>
                    <div style="display:flex; gap:5px;">
                        <button onclick="window.refreshMarketUI('buy')" style="padding:8px 20px; background:${mode === 'buy' ? '#FFF' : '#333'}; color:${mode === 'buy' ? '#006064' : '#FFF'}; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">購入する</button>
                        <button onclick="window.refreshMarketUI('sell')" style="padding:8px 20px; background:${mode === 'sell' ? '#FFF' : '#333'}; color:${mode === 'sell' ? '#006064' : '#FFF'}; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">出品する</button>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-size:16px; background:#004D40; padding:5px 10px; border-radius:20px;">所持金: <span style="color:#FFD700; font-weight:bold; font-size:20px;">${window.aiPet ? window.aiPet.gold : 0}</span> G</span>
                    <button onclick="document.getElementById('tcg-market-ui').style.display='none'; window.openCardShopUI();" style="background:#666; color:white; font-weight:bold; border:2px solid #888; padding:10px 20px; border-radius:8px; cursor:pointer;">お店に戻る ✖</button>
                </div>
            </div>
        `;

        let contentHtml = `<div style="color:#aaa; width:100%; text-align:center; margin-top:50px; font-size:20px;">読込中...</div>`;
        modal.innerHTML = titleAreaHtml + `<div id="market-content-area" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-wrap:wrap; align-content:flex-start; background:#222;">${contentHtml}</div>`;
        modal.style.display = 'flex';

        if (mode === 'buy') {
            let items = await window.fetchTCGMarketItems();
            let cHtml = '';
            items.forEach(item => {
                let isMine = item.sellerId === myId;
                let btnHtml = isMine
                    ? `<button onclick="window.cancelMarketItem('${item.docId}')" style="width:100%; padding:8px; background:#f44336; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:10px;">出品を取り消す</button>`
                    : `<button onclick="window.buyMarketItem('${item.docId}', ${item.price}, '${item.sellerId}')" style="width:100%; padding:8px; background:#4CAF50; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:10px;">${item.price} G で購入</button>`;
                
                // ★修正：transform-origin: top left; に変更して右ズレを解消！
                cHtml += `
                    <div style="margin:10px; background:#111; padding:10px; border-radius:12px; border:2px solid #444; width: 140px; display:flex; flex-direction:column; align-items:center;">
                        <div style="font-size:11px; color:#00BCD4; margin-bottom:5px; text-align:center; width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">出品: ${item.sellerName}</div>
                        <div style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; pointer-events:none;">
                            ${window.renderCardHTML(item.cardData)}
                        </div>
                        ${btnHtml}
                    </div>
                `;
            });
            document.getElementById('market-content-area').innerHTML = cHtml || '<div style="color:#888; text-align:center; width:100%; margin-top:50px; font-size:20px;">現在、市場にカードはありません。</div>';
        } 
        else if (mode === 'sell') {
            let cHtml = '';
            let deckUids = [];
            if (window.TCG && window.TCG.decks) { window.TCG.decks.forEach(d => { deckUids.push(...d); }); }
            
            window.TCG.myCollection.forEach((card, idx) => {
                const inDeck = deckUids.includes(card.uid);
                const opacity = inDeck ? 0.5 : 1;
                const cursor = inDeck ? 'not-allowed' : 'pointer';
                
                // ★修正：transform-origin: top left; に変更して右ズレを解消！
                cHtml += `
                    <div style="position:relative; margin:10px; opacity:${opacity}; cursor:${cursor}; transition:transform 0.1s;"
                         onmouseover="if(!${inDeck}) this.style.transform='scale(1.05) translateY(-5px)'"
                         onmouseout="if(!${inDeck}) this.style.transform='scale(1) translateY(0)'"
                         onclick="if(!${inDeck}) window.showCardSellPricePrompt(${idx})">
                        <div style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; pointer-events:none;">
                            ${window.renderCardHTML(card)}
                        </div>
                        ${inDeck ? '<div style="position:absolute; top:40%; left:10%; background:rgba(0,0,0,0.8); color:white; padding:5px 10px; border-radius:4px; font-weight:bold; font-size:16px; transform:rotate(-15deg); pointer-events:none;">デッキ編成中</div>' : '<div style="position:absolute; bottom:-15px; left:0; width:100%; background:#FF9800; color:white; padding:5px 0; border-radius:6px; font-size:14px; font-weight:bold; text-align:center; pointer-events:none;">タップして出品</div>'}
                    </div>
                `;
            });
            document.getElementById('market-content-area').innerHTML = cHtml || '<div style="color:#888; text-align:center; width:100%; margin-top:50px; font-size:20px;">出品できるカードがありません。</div>';
        }
    };
    window.refreshMarketUI('buy');
};

// 🏷️ 出品価格を入力するリッチポップアップ
window.showCardSellPricePrompt = function(idx) {
    let card = window.TCG.myCollection[idx];
    if (!card) return;

    let modal = document.createElement('div');
    modal.id = 'tcg-sell-price-popup';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.85); z-index: 60000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 4px solid #FF9800; border-radius: 12px; padding: 30px; width: 450px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="font-size: 50px; margin-bottom: 15px;">🏷️</div>
            <h2 style="color: #FF9800; margin-top: 0; margin-bottom: 20px;">カードを出品</h2>
            <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 30px; background: #111; padding: 15px; border-radius: 8px;">
                <div style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; pointer-events:none;">
                    ${window.renderCardHTML(card)}
                </div>
                <div style="flex: 1; text-align: left;">
                    <div style="font-size: 20px; font-weight: bold; color: #FFF; margin-bottom: 10px;">${card.name}</div>
                    <div style="font-size: 14px; color: #aaa;">アルバムNo: ${card.id || idx + 1}</div>
                </div>
            </div>
            
            <div style="font-size: 16px; color: #ddd; line-height: 1.6; margin-bottom: 20px;">
                出品価格を入力してください：
            </div>
            <input type="number" id="tcg-sell-price-input" value="1000" min="100" step="10" style="padding: 15px; font-size: 24px; font-weight: bold; width: 200px; text-align: center; background: #111; border: 2px solid #FF9800; border-radius: 8px; color: #FFF; margin-bottom: 30px;">
            <div style="font-size: 14px; color: #ff5252; margin-bottom: 25px;">（※出品時に手数料として <span style="font-weight:bold;">100 G</span> が引かれます）</div>

            <div style="display: flex; gap: 20px; justify-content: center;">
                <button onclick="window.confirmSellMarket(${idx}, document.getElementById('tcg-sell-price-input').value)" 
                        style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #4CAF50; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;"
                        onmouseover="this.style.background='#43A047'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='#4CAF50'; this.style.transform='scale(1)';">
                    決定
                </button>
                <button onclick="document.getElementById('tcg-sell-price-popup').style.opacity='0'; setTimeout(()=>document.getElementById('tcg-sell-price-popup').remove(), 300);" 
                        style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #555; color: white; border: 2px solid #777; border-radius: 8px; cursor: pointer;">
                    キャンセル
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.firstElementChild.style.transform = 'scale(1)';
    }, 50);
};

// 決定ボタンを押した後の最終確認画面
window.confirmSellMarket = function(idx, price) {
    document.getElementById('tcg-sell-price-popup').remove(); 

    let priceVal = parseInt(price, 10);
    if (isNaN(priceVal) || priceVal < 100) return window.showMarketMessage("⚠️ 100 G 以上の正しい金額を入力してください", true);
    if ((window.aiPet.gold || 0) < 100) return window.showMarketMessage("⚠️ 出品手数料（100 G）が足りません！", true);

    let card = window.TCG.myCollection[idx];
    if (!card) return;

    let modal = document.createElement('div');
    modal.id = 'tcg-sell-confirm-popup';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.85); z-index: 60000;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; transition: opacity 0.3s ease;
    `;
    
    // ★修正：「undefinedの思い出」になるのを防ぐ安全な名前取得
    let pName = localStorage.getItem('my_player_name');
    if (!pName) pName = window.aiPet ? window.aiPet.name : "あなた";

    modal.innerHTML = `
        <div style="background: #2a2a2a; border: 4px solid #00BCD4; border-radius: 12px; padding: 30px; width: 450px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="font-size: 50px; margin-bottom: 15px;">📜</div>
            <h2 style="color: #00BCD4; margin-top: 0; margin-bottom: 20px;">出品最終確認</h2>
            <div style="font-size: 16px; color: #ddd; line-height: 1.6; margin-bottom: 25px;">
                以下の内容でコレクション「<span style="color:#00BCD4; font-weight:bold;">${pName}のカード</span>」から出品します。
            </div>
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 30px; background: #111; padding: 15px; border-radius: 8px;">
                <div style="transform: scale(0.65); transform-origin: top left; width: 117px; height: 169px; pointer-events:none;">
                    ${window.renderCardHTML(card)}
                </div>
                <div style="flex: 1; text-align: left;">
                    <div style="font-size: 20px; font-weight: bold; color: #FFF; margin-bottom: 10px;">${card.name}</div>
                    <div style="font-size: 14px; color: #aaa;">アルバムNo: ${card.id || idx + 1}</div>
                </div>
            </div>
            
            <div style="background:#111; border:2px solid #444; border-radius:8px; padding:15px; margin-bottom:30px; font-size: 20px; font-weight: bold;">
                出品価格： <span style="color:#FFD700;">${priceVal} G</span>
            </div>

            <div style="font-size: 14px; color: #aaa; margin-bottom: 15px;">
                出品完了時、手数料として<br>
                所持金から <span style="color:#F44336; font-weight:bold;">100 G</span> が引かれます。
            </div>
            <div style="font-size: 14px; color: #ccc; margin-bottom: 30px;">（※取り消せません）</div>

            <div style="display: flex; gap: 20px; justify-content: center;">
                <button onclick="window.promptSellMarket(${idx}, ${priceVal})" 
                        style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #E91E63; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;"
                        onmouseover="this.style.background='#C2185B'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='#E91E63'; this.style.transform='scale(1)';">
                    出品する！
                </button>
                <button onclick="document.getElementById('tcg-sell-confirm-popup').style.opacity='0'; setTimeout(()=>document.getElementById('tcg-sell-confirm-popup').remove(), 300);" 
                        style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #555; color: white; border: 2px solid #777; border-radius: 8px; cursor: pointer;">
                    キャンセル
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.firstElementChild.style.transform = 'scale(1)';
    }, 50);
};

// 出品処理本体
window.promptSellMarket = function(idx, price) {
    if (document.getElementById('tcg-sell-confirm-popup')) document.getElementById('tcg-sell-confirm-popup').remove(); 

    let card = window.TCG.myCollection[idx];
    let priceVal = parseInt(price, 10);
    // 万が一の再チェック
    if (isNaN(priceVal) || priceVal < 100) return window.showMarketMessage("⚠️ 100 G 以上の金額を入力してください", true);
    if ((window.aiPet.gold || 0) < 100) return window.showMarketMessage("⚠️ 出品手数料（100 G）が足りません！", true);

    document.getElementById('market-content-area').style.pointerEvents = 'none';

    window.aiPet.gold -= 100;
    window.TCG.myCollection.splice(idx, 1);
    window.saveTCGData();
    if (typeof updateStatUI === 'function') updateStatUI();

    window.uploadTCGMarketItem(card, priceVal).then(success => {
        if (success) {
            window.showMarketMessage(`✨ 「${card.name}」を ${priceVal} G で出品しました！`);
            document.getElementById('market-content-area').style.pointerEvents = 'auto';
            window.refreshMarketUI('sell');
        } else {
            window.showMarketMessage("❌ 出品に失敗しました。通信環境を確認してください。", true);
            window.aiPet.gold += 100;
            window.TCG.myCollection.push(card);
            window.saveTCGData();
            document.getElementById('market-content-area').style.pointerEvents = 'auto';
        }
    });
};

// 購入処理（リッチUI対応版）
window.buyMarketItem = async function(docId, price, sellerId) {
    if ((window.aiPet.gold || 0) < price) return window.showMarketMessage("⚠️ 所持金が足りません！", true);
    
    // 購入確認のリッチポップアップ
    let confirmPopup = document.createElement('div');
    confirmPopup.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:60000; display:flex; justify-content:center; align-items:center;`;
    confirmPopup.innerHTML = `
        <div style="background: #2a2a2a; border: 4px solid #4CAF50; border-radius: 12px; padding: 30px; width: 400px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
            <div style="font-size: 50px; margin-bottom: 15px;">🛒</div>
            <h2 style="color: #4CAF50; margin-top: 0; margin-bottom: 20px;">購入確認</h2>
            <p style="font-size: 18px; margin-bottom: 30px;">このカードを <span style="color:#FFD700; font-weight:bold; font-size:24px;">${price} G</span> で購入しますか？</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button id="btn-buy-yes" style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #4CAF50; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer;">購入する</button>
                <button id="btn-buy-no" style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #555; color: white; border: 2px solid #777; border-radius: 8px; cursor: pointer;">やめる</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmPopup);
    
    document.getElementById('btn-buy-no').onclick = () => confirmPopup.remove();
    document.getElementById('btn-buy-yes').onclick = async () => {
        confirmPopup.remove();
        document.getElementById('market-content-area').style.pointerEvents = 'none';

        let items = await window.fetchTCGMarketItems();
        let targetItem = items.find(i => i.docId === docId);
        
        if (!targetItem) {
            window.showMarketMessage("❌ 売り切れているか、取り消されました。", true);
            document.getElementById('market-content-area').style.pointerEvents = 'auto';
            window.refreshMarketUI('buy');
            return;
        }

        let success = await window.buyTCGMarketItem(docId, targetItem.cardData, price, sellerId);
        if (success) {
            window.aiPet.gold -= price;
            window.TCG.myCollection.push(targetItem.cardData);
            window.saveTCGData();
            if (typeof updateStatUI === 'function') updateStatUI();
            
            window.showMarketMessage(`🎉 「${targetItem.cardData.name}」を購入しました！`);
            document.getElementById('market-content-area').style.pointerEvents = 'auto';
            window.refreshMarketUI('buy');
        } else {
            window.showMarketMessage("❌ 購入に失敗しました。", true);
            document.getElementById('market-content-area').style.pointerEvents = 'auto';
        }
    };
};

// キャンセル処理（リッチUI対応版）
window.cancelMarketItem = async function(docId) {
    let confirmPopup = document.createElement('div');
    confirmPopup.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:60000; display:flex; justify-content:center; align-items:center;`;
    confirmPopup.innerHTML = `
        <div style="background: #2a2a2a; border: 4px solid #f44336; border-radius: 12px; padding: 30px; width: 400px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
            <div style="font-size: 50px; margin-bottom: 15px;">🔙</div>
            <h2 style="color: #f44336; margin-top: 0; margin-bottom: 20px;">出品の取り消し</h2>
            <p style="font-size: 16px; margin-bottom: 10px;">出品を取り消してカードを手元に戻しますか？</p>
            <p style="font-size: 14px; color: #ff5252; margin-bottom: 30px;">（※出品手数料の 100 G は返還されません）</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button id="btn-cancel-yes" style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #f44336; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer;">取り消す</button>
                <button id="btn-cancel-no" style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #555; color: white; border: 2px solid #777; border-radius: 8px; cursor: pointer;">やめる</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmPopup);
    
    document.getElementById('btn-cancel-no').onclick = () => confirmPopup.remove();
    document.getElementById('btn-cancel-yes').onclick = async () => {
        confirmPopup.remove();
        let items = await window.fetchTCGMarketItems();
        let targetItem = items.find(i => i.docId === docId);
        if (!targetItem) return window.refreshMarketUI('buy');

        let success = await window.cancelTCGMarketItem(docId);
        if (success) {
            window.TCG.myCollection.push(targetItem.cardData);
            window.saveTCGData();
            window.showMarketMessage("📦 出品を取り消し、カードを回収しました。");
            window.refreshMarketUI('buy');
        } else {
            window.showMarketMessage("❌ 取り消しに失敗しました。", true);
        }
    };
};

// ==========================================
// 🚪 カードショップから退出し、自由行動に戻す処理
// ==========================================
window.exitCardShop = function() {
    let ui = document.getElementById('tcg-shop-ui');
    if (ui) ui.style.display = 'none';
    
    if (window.aiPet) {
        window.aiPet.actionState = 'exiting';
        window.aiPet.isIndoors = false;
        window.aiPet.interactionTarget = null;
        window.aiPet.indoorTarget = null;
        window.aiPet.visualAction = null;
        window.aiPet.message = "カードショップから出たよ！";
        window.aiPet.messageTimer = 120;
    }
};

// ==========================================
// ★ フィールドカード攻撃対応パッチ
// ==========================================

// ① 盤面描画の修正：フィールドカードをクリックして攻撃できるようにする
const _originalRenderBattleBoard_fieldAttack = window.renderBattleBoard;
window.renderBattleBoard = function() {
    _originalRenderBattleBoard_fieldAttack();
    
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;
    
    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;
    const isTargeting = window.TCG_BATTLE.selectedAttackerIndex !== -1;

    // フィールドゾーンを描画し直す内部関数
    const createFieldZoneHtml = (isPlayerOwner) => {
        let owner = isPlayerOwner ? p : cpu;
        let fieldData = window.TCG_BATTLE.currentField;
        
        const zoneId = isPlayerOwner ? 'p-field-zone' : 'c-field-zone';
        
        if (fieldData && fieldData.owner === owner) {
            let cardHtml = window.renderCardHTML(fieldData.card);
            
            // ★追加：自分が攻撃モードで、敵のフィールドならターゲットにできる
            let canTarget = isTargeting && !isPlayerOwner && !window.TCG_BATTLE.isEnemyTurn;
            let filter = canTarget ? "drop-shadow(0 0 20px #FF9800) brightness(1.2)" : "drop-shadow(0 0 10px #4DB6AC)";
            let cursor = canTarget ? "crosshair" : "default";

            return `
            <div id="${zoneId}" style="position: absolute; left: 20px; top: 10px; display:flex; flex-direction:column; align-items:center; z-index: 40; filter: ${filter}; cursor: ${cursor}; transition: transform 0.2s;" title="${fieldData.card.name}"
                 onmouseover="if(${canTarget}){ this.style.transform='scale(1.05)'; }"
                 onmouseout="if(${canTarget}){ this.style.transform='scale(1)'; }"
                 onclick="if(${canTarget}) window.executeAttack('field', 0)">
                <div style="transform: scale(0.55); transform-origin: top left; width: 99px; height: 143px; pointer-events:none; z-index:50;">
                    ${cardHtml}
                </div>
                <div style="color:#4DB6AC; font-size:12px; font-weight:bold; margin-top:-5px; background:#111; padding:2px 8px; border-radius:4px; border:1px solid #4DB6AC; z-index:51;">
                    展開中 (HP: ${fieldData.card.hp})
                </div>
            </div>`;
        } else {
            return `
            <div id="${zoneId}" style="position: absolute; left: 20px; top: 10px; width: 100px; height: 140px; border: 2px dashed ${isPlayerOwner ? '#00BCD4' : '#ff5252'}; border-radius: 8px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.3); z-index: 40;">
                <span style="color: ${isPlayerOwner ? '#00BCD4' : '#ff5252'}; font-weight: bold; font-size: 12px; opacity: 0.5;">フィールド</span>
            </div>`;
        }
    };

    // 既存のフィールド描画を上書き
    const cpuFieldArea = ui.children[0].children[1]; // cpuの盤面エリア
    const playerFieldArea = ui.children[0].children[2]; // playerの盤面エリア
    
    if (cpuFieldArea && cpuFieldArea.firstElementChild) {
        let oldZone = cpuFieldArea.querySelector('#c-field-zone') || cpuFieldArea.firstElementChild;
        if (oldZone && oldZone.style.position === 'absolute') oldZone.outerHTML = createFieldZoneHtml(false);
    }
    if (playerFieldArea && playerFieldArea.firstElementChild) {
        let oldZone = playerFieldArea.querySelector('#p-field-zone') || playerFieldArea.firstElementChild;
        if (oldZone && oldZone.style.position === 'absolute') oldZone.outerHTML = createFieldZoneHtml(true);
    }
};

// ② 攻撃実行処理の拡張（targetType: 'field' の追加）
const _originalExecuteAttack_field = window.executeAttack;
window.executeAttack = function(targetType, enemyIndex) {
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const isPlayer = window.TCG_BATTLE.isEnemyTurn === false;
    const enemy = isPlayer ? cpu : p;

    // 「かばう」がいる場合はフィールドも狙えないようにする
    const attackerIndex = window.TCG_BATTLE.selectedAttackerIndex; 
    if (attackerIndex !== -1) {
        const attackerCard = (isPlayer ? p : cpu).field[attackerIndex];
        const isPierce = attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill" || attackerCard.ability === "piercing_juggernaut";
        const hasTaunt = enemy.field.some(c => (c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending) && !c.isDead);
        
        if (hasTaunt && !isPierce && targetType === 'field') {
            if(isPlayer) window.showBattleMessage("🛡️ 敵の場に【かばう】を持つカードがいます！\n先にそちらを攻撃してください", true); 
            return;
        }
    }

    // ★ フィールドへの攻撃処理
    if (targetType === 'field' && window.TCG_BATTLE.currentField) {
        const attackerCard = (isPlayer ? p : cpu).field[attackerIndex];
        let dmgToTarget = attackerCard.damage;
        
        window.showBattleMessage(`⚔️ ${attackerCard.name} の攻撃！`, false, 1500, !isPlayer);
        
        if (attackerCard.ability === "piercing_juggernaut") {
            attackerCard.damage += 10;
            window.showVFX(`${isPlayer ? 'p' : 'c'}-card-${attackerIndex}`, 'heal', '火力UP');
        }

        const fieldCard = window.TCG_BATTLE.currentField.card;
        const targetHtmlId = isPlayer ? 'c-field-zone' : 'p-field-zone';
        
        fieldCard.hp -= dmgToTarget;
        
        window.showVFX(targetHtmlId, 'slash'); 
        window.showVFX(targetHtmlId, 'damage', dmgToTarget);
        window.showBattleMessage(`💥 フィールド『${fieldCard.name}』に ${dmgToTarget} ダメージ！`, false, 2000, !isPlayer, true);

        // 破壊判定
        if (fieldCard.hp <= 0) {
            setTimeout(() => {
                window.showBattleMessage(`🏚️ フィールド『${fieldCard.name}』が破壊された！`, false, 2500, !isPlayer, true);
                const ui = document.getElementById('tcg-battle-ui'); 
                if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
                
                window.TCG_BATTLE.currentField.owner.graveyard.push(fieldCard);
                window.TCG_BATTLE.currentField = null;
                window.renderBattleBoard();
            }, 800);
        }

        // 吸収などのアタッカー側効果
        if (attackerCard.ability === "soul_drain" && dmgToTarget > 0) {
            let heal = Math.floor(dmgToTarget / 2);
            attackerCard.hp += heal; window.showVFX(`${isPlayer ? 'p' : 'c'}-card-${attackerIndex}`, 'heal', heal);
        }
        if (attackerCard.ability === "life_drain" && dmgToTarget > 0) {
            (isPlayer ? p : cpu).hp += dmgToTarget;
            window.showVFX(isPlayer ? 'player-face' : 'cpu-face', 'heal', dmgToTarget);
        }

        // 攻撃終了処理
        if (attackerCard.ability === "stealth") attackerCard.ability = null;
        if (attackerCard.ability === "double_strike" && !attackerCard._has_attacked_once && !attackerCard.isDead) {
            attackerCard._has_attacked_once = true;
            window.showBattleMessage(`🌪️ 【連撃】${attackerCard.name} はもう一度攻撃できる！`, false, 1500, !isPlayer, true);
        } else {
            attackerCard.canAttack = false; 
            attackerCard._has_attacked_once = false;
        }

        if(isPlayer) window.TCG_BATTLE.selectedAttackerIndex = -1; 
        setTimeout(() => window.renderBattleBoard(), 1100);
        return;
    }

    // 通常のカード・リーダー攻撃の場合は元の処理へ
    _originalExecuteAttack_field(targetType, enemyIndex);
};

// ③ 敵CPU＆オートバトルの「ターゲット選択AI」の拡張
// CPUが攻撃先を決める時、フィールドカードも候補に含める賢いロジックにする
const _originalCPUAttackLogic = window.executeCPUTurn;

// AI用のターゲット決定ヘルパー関数
window._decideAITarget = function(attackerObj, defenderObj) {
    const tauntTargets = defenderObj.field.filter(c => c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending);
    const validTargets = defenderObj.field.filter(c => c.ability !== "stealth"); 
    
    // 貫通系はかばうを無視できる
    const attackerCard = attackerObj.field[window.TCG_BATTLE.selectedAttackerIndex];
    const isPierce = attackerCard && (attackerCard.ability === "pierce_recoil" || attackerCard.ability === "flight" || attackerCard.ability === "god_strike" || attackerCard.ability === "dimension_drill" || attackerCard.ability === "piercing_juggernaut");
    
    if (tauntTargets.length > 0 && !isPierce) {
        return { type: 'card', index: defenderObj.field.indexOf(tauntTargets[Math.floor(Math.random() * tauntTargets.length)]) };
    } 

    // 候補リストを作成（リーダー、各モンスター、フィールド）
    let candidates = [{ type: 'player', index: 0 }]; // リーダー（cpu視点だとplayer扱い）
    
    validTargets.forEach(c => {
        candidates.push({ type: 'card', index: defenderObj.field.indexOf(c) });
    });

    if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.owner === defenderObj) {
        // フィールドカードがあれば候補に入れる（少し確率を高めにしておく）
        candidates.push({ type: 'field', index: 0 });
        candidates.push({ type: 'field', index: 0 }); 
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
};

// 敵ターンの攻撃ループの中のターゲット選択部分を書き換えるためのハック
// （オートバトル側のループもこれを使います）
setInterval(() => {
    // オートバトル時のターゲット選択を書き換え
    if (window.TCG_BATTLE && window.TCG_BATTLE.isAuto && !window.TCG_BATTLE.isEnemyTurn && !window.TCG_BATTLE.isAnimating) {
        let attackerIndex = window.TCG_BATTLE.player.field.findIndex(c => c.canAttack && c.damage > 0 && !c.isDead && c.status !== 'stunned' && c.status !== 'charmed');
        if (attackerIndex !== -1 && window.TCG_BATTLE.selectedAttackerIndex === -1) {
            window.TCG_BATTLE.selectedAttackerIndex = attackerIndex;
            let targetInfo = window._decideAITarget(window.TCG_BATTLE.player, window.TCG_BATTLE.cpu);
            // 本来のオートバトルのタイマーが拾う前に、ここで強制実行させてしまう
            window.TCG_BATTLE.isAnimating = true;
            window.executeAttack(targetInfo.type === 'player' ? 'cpu' : targetInfo.type, targetInfo.index);
            setTimeout(() => { window.TCG_BATTLE.isAnimating = false; }, 1500);
        }
    }
}, 1000);

// ついでにフィールドカードの虫眼鏡にも対応させます
const _originalRenderBattleBoard_fieldMag = window.renderBattleBoard;
window.renderBattleBoard = function() {
    _originalRenderBattleBoard_fieldMag();
    
    const pFieldZone = document.getElementById('p-field-zone');
    const cFieldZone = document.getElementById('c-field-zone');
    
    if (pFieldZone && !pFieldZone.querySelector('.field-magnifier') && window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.owner === window.TCG_BATTLE.player) {
        const mag = document.createElement('div');
        mag.className = 'field-magnifier';
        mag.style.cssText = `position:absolute; top:-10px; right:-10px; background:#222; color:#00BCD4; border:2px solid #00BCD4; border-radius:50%; width:32px; height:32px; display:flex; justify-content:center; align-items:center; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:60;`;
        mag.innerHTML = "🔍";
        mag.onclick = function(e) { e.stopPropagation(); window.showCardDetailModal('player_field'); };
        pFieldZone.appendChild(mag);
    }
    
    if (cFieldZone && !cFieldZone.querySelector('.field-magnifier') && window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.owner === window.TCG_BATTLE.cpu) {
        const mag = document.createElement('div');
        mag.className = 'field-magnifier';
        mag.style.cssText = `position:absolute; top:-10px; right:-10px; background:#222; color:#ff5252; border:2px solid #ff5252; border-radius:50%; width:32px; height:32px; display:flex; justify-content:center; align-items:center; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:60;`;
        mag.innerHTML = "🔍";
        mag.onclick = function(e) { e.stopPropagation(); window.showCardDetailModal('cpu_field'); };
        cFieldZone.appendChild(mag);
    }
};

// ======================================================================
// ★ 人物（サポート）カードシステム 完全統合版プラグイン（UI完全修復版）
// ======================================================================

console.log("🛠️ 人物カードシステムを初期化中...");

// ------------------------------------------
// 1. マスターデータの追加
// ------------------------------------------
const userSlicedPersonCards = {
    "person_farmer": { "name": "農家", "type": "person", "image": "character_card.png", "imageIndex": 0, "baseCost": 2, "baseHp": 40, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_farmer", "personSkills": [ { "name": "おすそわけ", "cost": 1, "desc": "味方1体を 15 回復する" }, { "name": "豊穣の祈り", "cost": 3, "desc": "1枚ドローし、最大マナを+1する" } ], "sx": 630, "sy": -118, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_fisherman": { "name": "漁師", "type": "person", "image": "character_card.png", "imageIndex": 1, "baseCost": 3, "baseHp": 40, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_fisherman", "personSkills": [ { "name": "一本釣り", "cost": 1, "desc": "敵1体に 10 ダメージ (守護・潜伏無視)" }, { "name": "大漁網", "cost": 4, "desc": "敵モンスター1体を山札に戻す" } ], "sx": 1316, "sy": -118, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_builder": { "name": "建築士", "type": "person", "image": "character_card.png", "imageIndex": 2, "baseCost": 3, "baseHp": 50, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_builder", "personSkills": [ { "name": "即席バリケード", "cost": 2, "desc": "味方1体にこのターンのみ「守護」を付与" }, { "name": "突貫工事", "cost": 4, "desc": "フィールドHP 50回復かリーダー 40回復" } ], "sx": 622, "sy": 573, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_chef": { "name": "料理人", "type": "person", "image": "character_card.png", "imageIndex": 3, "baseCost": 3, "baseHp": 40, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_chef", "personSkills": [ { "name": "特製スパイス", "cost": 1, "desc": "指定した味方モンスターの攻撃力を 永続で+10" }, { "name": "究極のフルコース", "cost": 4, "desc": "行動済みの味方を「未行動」に戻し、全回復" } ], "sx": -52, "sy": 573, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_smith": { "name": "鍛冶師", "type": "person", "image": "character_card.png", "imageIndex": 4, "baseCost": 4, "baseHp": 50, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_smith", "personSkills": [ { "name": "武器研磨", "cost": 2, "desc": "味方1体の次の攻撃に「+20」ダメージを付与" }, { "name": "会心の武具", "cost": 4, "desc": "味方1体にこのターンのみ「貫通」を付与" } ], "sx": 1316, "sy": 574, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_adventurer": { "name": "冒険家", "type": "person", "image": "character_card.png", "imageIndex": 5, "baseCost": 2, "baseHp": 30, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_adventurer", "personSkills": [ { "name": "マッピング", "cost": 1, "desc": "カードを1枚引く" }, { "name": "秘境の発見", "cost": 3, "desc": "山札から「進化後」モンスター1体をサーチ" } ], "sx": -48, "sy": -60, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_king": { "name": "王様", "type": "person", "image": "character_card.png", "imageIndex": 6, "baseCost": 6, "baseHp": 80, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_king", "personSkills": [ { "name": "王の号令", "cost": 2, "desc": "味方モンスター全員の攻撃力を +10 する" }, { "name": "王の裁き", "cost": 6, "desc": "HP 40以下の敵全員をすべて破壊する" } ], "sx": -49, "sy": 1264, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_captain": { "name": "隊長", "type": "person", "image": "character_card.png", "imageIndex": 7, "baseCost": 5, "baseHp": 60, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_captain", "personSkills": [ { "name": "陣形指示", "cost": 2, "desc": "このターン、味方全体が受けるダメージを -10" }, { "name": "総員突撃", "cost": 5, "desc": "このターン、味方モンスター全員が「連撃」化" } ], "sx": 630, "sy": 1264, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 },
    "person_soldier": { "name": "兵士", "type": "person", "image": "character_card.png", "imageIndex": 8, "baseCost": 1, "baseHp": 30, "skillName": "人物スキル", "skillCost": 0, "baseDmg": 0, "ability": "person_soldier", "personSkills": [ { "name": "槍の突き", "cost": 1, "desc": "敵1体に 10 ダメージを与える" }, { "name": "決死の覚悟", "cost": 3, "desc": "敵1体に 40 ダメージ ＆ 自身に 20 ダメージ" } ], "sx": 1316, "sy": 1264, "sw": 795, "sh": 731, "scaleX": 0.3, "scaleY": 0.29999999999999966 }
};
Object.assign(window.TCG_MASTER, userSlicedPersonCards);

// ------------------------------------------
// 2. カードの描画（元の描画関数を保護！）
// ------------------------------------------
if (!window._originalRenderCardHTML_Base) {
    window._originalRenderCardHTML_Base = window.renderCardHTML;
}

// ==========================================
// ★ バグ修正：アビリティ上書きを撤廃し、一時ステータスとして付与するパッチ
// ==========================================

// ==========================================
// 1. カード描画（renderCardHTML）のオーバーライド
// ==========================================
window.renderCardHTML = function(card) {
    // 【保護】人物以外のカードは元のゲームの描画関数に丸投げ
    if (card.type !== 'person' && window._originalRenderCardHTML_Base) {
        let baseHtml = window._originalRenderCardHTML_Base(card);
        
        // ★修正点：バフが付与されている場合、見た目に専用バッジを後付けする
        let badges = '';
        if (card._captain_double) badges += `<div style="background:#E91E63; color:white; padding:2px 4px; border-radius:4px; border:1px solid #fff; font-size:11px; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.5);">⚔️連撃</div>`;
        if (card._smith_trample) badges += `<div style="background:#FF9800; color:white; padding:2px 4px; border-radius:4px; border:1px solid #fff; font-size:11px; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.5);">☄️貫通</div>`;
        if (card._builder_guarded) badges += `<div style="background:#4CAF50; color:white; padding:2px 4px; border-radius:4px; border:1px solid #fff; font-size:11px; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.5);">🛡️守護</div>`;
        if (card._smith_buffed) badges += `<div style="background:#00BCD4; color:white; padding:2px 4px; border-radius:4px; border:1px solid #fff; font-size:11px; margin-bottom:2px; box-shadow:0 2px 4px rgba(0,0,0,0.5);">🗡️研磨</div>`;
        
        if (badges !== '' && !card.isDead) {
            let badgeContainer = `<div style="position:absolute; top:35px; right:5px; display:flex; flex-direction:column; z-index:10; pointer-events:none;">${badges}</div>`;
            baseHtml = baseHtml.replace('</div>', badgeContainer + '</div>'); 
        }
        return baseHtml;
    }

    // ★ ここから下は「人物カード」だけの専用描画！
    if (typeof window.TCG_MASTER !== 'undefined') {
        let masterData = card.masterId ? window.TCG_MASTER[card.masterId] : null;
        if (masterData) {
            if (masterData.sx !== undefined) card.sx = masterData.sx;
            if (masterData.sy !== undefined) card.sy = masterData.sy;
            if (masterData.sw !== undefined) card.sw = masterData.sw;
            if (masterData.sh !== undefined) card.sh = masterData.sh;
            if (masterData.scaleX !== undefined) card.scaleX = masterData.scaleX;
            if (masterData.scaleY !== undefined) card.scaleY = masterData.scaleY;
            if (masterData.image) card.image = masterData.image;
            card.personSkills = masterData.personSkills || masterData.skills;
        }
    }

    const isUnlocked = window.TCG && window.TCG.myCollection && window.TCG.myCollection.length >= 60;
    let displayCost = card.cost !== undefined ? card.cost : 0;
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        let owner = window.TCG_BATTLE.player.hand.includes(card) ? window.TCG_BATTLE.player : null;
        if (!owner && window.TCG_BATTLE.cpu.hand.includes(card)) owner = window.TCG_BATTLE.cpu;
        if (owner) displayCost = window.getActualCost(owner, card);
    }
    const costColor = displayCost < (card.cost || 0) ? "#4CAF50" : "#FFD700";
    const badges = window.getCardBadgeInfo ? window.getCardBadgeInfo(card) : [];
    let badgesHtml = badges.map(b => `<span style="font-size: 11px; background: rgba(0,0,0,0.6); color: ${b.color}; padding: 2px 5px; border-radius: 4px; border: 1px solid ${b.color}; white-space: nowrap;">${b.text}</span>`).join('');

    let imgPath = card.image;
    if (!imgPath || imgPath === 'characters.png') imgPath = null;
    else if (typeof imageSources !== 'undefined' && imageSources[imgPath]) imgPath = imageSources[imgPath];

    let html = `<div class="tcg-card" style="width: 180px; height: 260px; background-color: #222; border: 4px solid #E91E63; border-radius: 12px; position: relative; font-family: sans-serif; color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; user-select: none;">`;

    if (isUnlocked) {
        html += `<div style="position: absolute; top: 6px; left: 6px; width: 28px; height: 28px; background: ${costColor}; color: #000; border-radius: 50%; font-weight: bold; font-size: 18px; display: flex; justify-content: center; align-items: center; border: 2px solid #FFF; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${displayCost}</div>`;
    }

    if (card.sx !== undefined) {
        const scX = card.scaleX !== undefined ? card.scaleX : 1.0;
        const scY = card.scaleY !== undefined ? card.scaleY : 1.0;
        const sw = card.sw || 50; const sh = card.sh || 50;
        const sx = card.sx || 0; const sy = card.sy || 0;
        let imgStyle = imgPath ? `background-image: url('${imgPath}'); background-position: ${-sx}px ${-sy}px; background-repeat: no-repeat;` : `background: linear-gradient(135deg, #444, #111);`; 
        html += `<div style="width: 100%; height: 120px; background-color: #1a1a1a; overflow: hidden; display: flex; justify-content: center; align-items: center; position: relative; border-bottom: 3px solid #444;"><div style="width: ${sw}px; height: ${sh}px; ${imgStyle} transform: scale(${scX}, ${scY}); transform-origin: center center; flex-shrink: 0;">${!imgPath ? '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; color:#666; font-size:12px; font-weight:bold;">NO IMAGE</div>' : ''}</div></div>`;
    }

    html += `<div style="padding: 4px 8px; font-weight: bold; font-size: 14px; background: linear-gradient(to right, #444, #222); border-bottom: 2px solid #111; text-shadow: 1px 1px 2px #000; display: flex; justify-content: space-between; align-items: center;"><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${card.name}</span>${isUnlocked ? `<div style="display:flex; gap:2px; margin-left: 4px;">${badgesHtml}</div>` : ''}</div>`;

    if (isUnlocked) {
        let pSkills = card.personSkills || [];
        let skillHtml = "";
        if (pSkills.length >= 2) {
            let s1 = pSkills[0]; let s2 = pSkills[1];
            skillHtml = `
                <div style="display:flex; flex-direction:column; gap:4px; height:100%; justify-content:space-evenly; margin-top:2px;">
                    <div style="background:#111; padding:4px; border-radius:4px; border:1px solid #4CAF50; box-shadow:inset 0 0 5px rgba(0,0,0,0.5);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;"><span style="color:#4CAF50; font-weight:bold;">${s1.name}</span><span style="background:#4CAF50; color:#fff; border-radius:3px; padding:1px 4px; font-size:9px;">コスト ${s1.cost}</span></div>
                        <div style="color:#ddd; font-size:9px; line-height:1.2;">${s1.desc}</div>
                    </div>
                    <div style="background:#111; padding:4px; border-radius:4px; border:1px solid #E91E63; box-shadow:inset 0 0 5px rgba(0,0,0,0.5);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;"><span style="color:#E91E63; font-weight:bold;">${s2.name}</span><span style="background:#E91E63; color:#fff; border-radius:3px; padding:1px 4px; font-size:9px;">コスト ${s2.cost}</span></div>
                        <div style="color:#ddd; font-size:9px; line-height:1.2;">${s2.desc}</div>
                    </div>
                </div>`;
        }
        html += `<div style="flex: 1; padding: 6px; padding-bottom: 24px; font-size: 11px; color: #ddd; background: #2a2a2a; display: flex; flex-direction: column; gap: 2px;">${skillHtml}</div>
        <div style="position: absolute; bottom: -4px; right: -4px; background: #E91E63; color: white; padding: 4px 12px; border-radius: 8px 0 0 0; font-weight: bold; font-size: 16px; border: 2px solid #333; border-right: none; border-bottom: none; box-shadow: -2px -2px 4px rgba(0,0,0,0.3); z-index: 2;">HP ${card.hp !== undefined ? card.hp : '0'}</div>`;
    } else {
        html += `<div style="flex: 1; padding: 15px 10px; font-size: 12px; line-height: 1.6; color: #bbb; background: #2a2a2a; text-align: center; display: flex; align-items: center; justify-content: center;"><span style="font-style: italic;">「かつて出会った、頼もしき協力者の記憶。」</span></div>`;
    }
    html += `</div>`;
    return html;
};

// ------------------------------------------
// 3. バトル開始・ターン処理・配置処理
// ------------------------------------------
window.ensurePersonSystemInitialized = function() {
    if (window.TCG_BATTLE && !window.TCG_BATTLE.currentPerson) {
        window.TCG_BATTLE.currentPerson = { player: null, cpu: null };
        window.TCG_BATTLE.personSkillUsed = { player: false, cpu: false };
        window.TCG_BATTLE.captainGuard = { player: false, cpu: false };
    }
};

window.showDeckCardActionMenu = function(uid, isDeckArea) {
    if (isDeckArea) {
        const idx = window.TCG.editingDeck.indexOf(uid);
        if (idx !== -1) window.TCG.editingDeck.splice(idx, 1);
    } else {
        window.TCG.editingDeck.push(uid); 
    }
    window.refreshDeckBuilderView();
};

if (!window._originalStartBattle_Base) window._originalStartBattle_Base = window.startBattle;
window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    window._originalStartBattle_Base(enemyData, selectedDeckIndex);
    window.ensurePersonSystemInitialized();
};

if (!window._originalRenderBattleBoard_Base) window._originalRenderBattleBoard_Base = window.renderBattleBoard;
window.renderBattleBoard = function() {
    // ターン切り替わり検知
    if (window.TCG_BATTLE && window.TCG_BATTLE._lastEnemyTurnState !== window.TCG_BATTLE.isEnemyTurn) {
        window.TCG_BATTLE._lastEnemyTurnState = window.TCG_BATTLE.isEnemyTurn;
        if (window.TCG_BATTLE.personSkillUsed) {
            if (!window.TCG_BATTLE.isEnemyTurn) {
                window.TCG_BATTLE.personSkillUsed.player = false;
                if(window.TCG_BATTLE.player && window.TCG_BATTLE.player.field) window.TCG_BATTLE.player.field.forEach(c => { c._builder_guarded = false; c._smith_buffed = false; c._smith_trample = false; c._captain_double = false; });
            } else {
                window.TCG_BATTLE.personSkillUsed.cpu = false;
            }
        }
    }

    window._originalRenderBattleBoard_Base();
    window.ensurePersonSystemInitialized();
    
    const ui = document.getElementById('tcg-battle-ui');
    if (!ui) return;

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const isTargeting = window.TCG_BATTLE.selectedAttackerIndex !== -1;
    document.querySelectorAll('#p-person-zone, #c-person-zone').forEach(el => el.remove());

    const createPersonZoneHtml = (isPlayerOwner) => {
        try {
            let personCard = window.TCG_BATTLE.currentPerson[isPlayerOwner ? 'player' : 'cpu'];
            const zoneId = isPlayerOwner ? 'p-person-zone' : 'c-person-zone';
            const color = isPlayerOwner ? '#E91E63' : '#ff5252';
            const positionStyle = `position: absolute; right: 20px; top: 10px;`; // ★右側に配置

            if (personCard && !personCard.isDead) {
                let canTarget = isTargeting && !isPlayerOwner && !window.TCG_BATTLE.isEnemyTurn;
                let filter = canTarget ? "drop-shadow(0 0 20px #FF9800) brightness(1.2)" : `drop-shadow(0 0 10px ${color})`;
                let cursor = canTarget ? "crosshair" : "default";
                let canUseSkill = isPlayerOwner && !window.TCG_BATTLE.personSkillUsed.player && !window.TCG_BATTLE.isAnimating && !window.TCG_BATTLE.isEnemyTurn;
                let mData = window.TCG_MASTER[personCard.masterId] || {};
                let pSkills = mData.personSkills || mData.skills || [];
                let s1 = pSkills.length > 0 ? pSkills[0] : null;
                let s2 = pSkills.length > 1 ? pSkills[1] : null;

                return `
                <div id="${zoneId}" style="${positionStyle} display:flex; flex-direction:column; align-items:center; z-index: 45; filter: ${filter}; cursor: ${cursor}; transition: transform 0.2s;" title="${personCard.name}"
                     onmouseover="if(${canTarget}){ this.style.transform='scale(1.05)'; }" onmouseout="if(${canTarget}){ this.style.transform='scale(1)'; }" onclick="if(${canTarget}) window.executeAttack('person', 0)">
                    <div style="transform: scale(0.55); transform-origin: top right; width: 99px; height: 143px; pointer-events:none; z-index:50;">${window.renderCardHTML(personCard)}</div>
                    <div style="color:${color}; font-size:12px; font-weight:bold; margin-top:-5px; background:#111; padding:2px 8px; border-radius:4px; border:1px solid ${color}; z-index:51;">人物 (HP: ${personCard.hp})</div>
                    ${isPlayerOwner && s1 && s2 ? `
                    <div style="display:flex; gap:5px; margin-top:5px; z-index:55;">
                        <button onclick="event.stopPropagation(); window.openPersonSkillTarget(${0}, ${s1.cost})" style="padding:4px 8px; font-size:11px; font-weight:bold; background:${canUseSkill && p.currentMana >= s1.cost ? '#4CAF50' : '#555'}; color:white; border:1px solid #FFF; border-radius:6px; cursor:${canUseSkill && p.currentMana >= s1.cost ? 'pointer' : 'not-allowed'}; box-shadow:0 2px 4px rgba(0,0,0,0.5);" title="${s1.desc}">${s1.name}(${s1.cost}M)</button>
                        <button onclick="event.stopPropagation(); window.openPersonSkillTarget(${1}, ${s2.cost})" style="padding:4px 8px; font-size:11px; font-weight:bold; background:${canUseSkill && p.currentMana >= s2.cost ? '#E91E63' : '#555'}; color:white; border:1px solid #FFF; border-radius:6px; cursor:${canUseSkill && p.currentMana >= s2.cost ? 'pointer' : 'not-allowed'}; box-shadow:0 2px 4px rgba(0,0,0,0.5);" title="${s2.desc}">${s2.name}(${s2.cost}M)</button>
                    </div>` : ''}
                    <div class="person-magnifier" style="position:absolute; top:-10px; left:-10px; background:#222; color:${color}; border:2px solid ${color}; border-radius:50%; width:32px; height:32px; display:flex; justify-content:center; align-items:center; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.8); z-index:60; transition: transform 0.2s;"
                         onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="event.stopPropagation(); window.showCardDetailModal('${isPlayerOwner ? 'player_person' : 'cpu_person'}');">🔍</div>
                </div>`;
            } else {
                return `<div id="${zoneId}" style="${positionStyle} width: 100px; height: 140px; border: 2px dashed ${color}; border-radius: 8px; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.3); z-index: 40; filter:brightness(0.7);"><span style="color: ${color}; font-weight: bold; font-size: 12px; opacity: 0.5;">人物</span></div>`;
            }
        } catch (e) { return ''; }
    };

    const pFace = document.getElementById('player-face');
    if (pFace && pFace.nextElementSibling) {
        const pBoard = pFace.nextElementSibling; pBoard.style.position = 'relative'; pBoard.insertAdjacentHTML('beforeend', createPersonZoneHtml(true));
    }
    const cFace = document.getElementById('cpu-face');
    if (cFace && cFace.nextElementSibling) {
        const cBoard = cFace.nextElementSibling; cBoard.style.position = 'relative'; cBoard.insertAdjacentHTML('beforeend', createPersonZoneHtml(false));
    }
};

if (!window._originalPlayCard_Base) window._originalPlayCard_Base = window.playCard;
window.playCard = function(handIndex) {
    if (window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    if (window.TCG_BATTLE.targetingHandIndex !== undefined && window.TCG_BATTLE.targetingHandIndex !== -1) {
        window.TCG_BATTLE.targetingHandIndex = -1; let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove(); window.renderBattleBoard(); return;
    }

    const p = window.TCG_BATTLE.player; const card = p.hand[handIndex];
    if (window.TCG_MASTER[card.masterId]) card.type = window.TCG_MASTER[card.masterId].type;
    const actualCost = window.getActualCost(p, card);
    
    if (p.currentMana < actualCost) { window.showBattleMessage(`マナが足りません！\n(必要: ${actualCost} / 現在: ${p.currentMana})`, true); return; }

    if (card.type === 'person') {
        window.TCG_BATTLE.isAnimating = true;
        window.animateCardPlay(card, true, () => { 
            p.currentMana -= actualCost; p.hand.splice(handIndex, 1);
            window.ensurePersonSystemInitialized();
            if (window.TCG_BATTLE.currentPerson.player) p.graveyard.push(window.TCG_BATTLE.currentPerson.player);
            if (card.hp === undefined) { card.hp = window.TCG_MASTER[card.masterId].baseHp || 30; card.maxHp = card.hp; }
            card.isDead = false;
            window.TCG_BATTLE.currentPerson.player = card; window.TCG_BATTLE.personSkillUsed.player = false; 
            window.showBattleMessage(`👤 人物『${card.name}』が戦場に駆けつけた！`, false, 2500, false);
            window.TCG_BATTLE.isAnimating = false; window.renderBattleBoard();
        });
        return;
    }
    window._originalPlayCard_Base(handIndex);
};

// ------------------------------------------
// 4. スキル処理とモーダル
// ------------------------------------------
window.openPersonSkillTarget = function(skillIndex, cost) {
    if (window.TCG_BATTLE.personSkillUsed.player || window.TCG_BATTLE.isAnimating) return;
    if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }

    const personCard = window.TCG_BATTLE.currentPerson.player;
    const mData = window.TCG_MASTER[personCard.masterId];
    const skill = (mData.personSkills || mData.skills)[skillIndex];

    const needsTarget = skill.desc.includes("味方1体") || skill.desc.includes("敵1体") || skill.desc.includes("敵モンスター1体");
    if (!needsTarget) { window.executePersonSkill(skillIndex, null, true); return; }

    window.TCG_BATTLE.personTargetingIndex = skillIndex;
    let ui = document.getElementById('tcg-target-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = "tcg-target-ui";
        ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #E91E63; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(233,30,99,0.6); pointer-events:auto;`;
        ui.innerHTML = `<div style="color:#E91E63; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div><div style="color:#ddd; font-size:14px; margin-bottom:15px;">「${skill.name}」の対象となるカードをクリックしてください</div><button id="btn-cancel-person" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>`;
        document.body.appendChild(ui);
        document.getElementById('btn-cancel-person').onclick = () => { window.TCG_BATTLE.personTargetingIndex = -1; ui.remove(); };
    }
};

if (!window._originalSelectPlayerCard_Base) window._originalSelectPlayerCard_Base = window.selectPlayerCard;
window.selectPlayerCard = function(index) {
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.executePersonSkill(sIdx, window.TCG_BATTLE.player.field[index], true, true);
        return;
    }
    window._originalSelectPlayerCard_Base(index);
};

if (!window._originalExecuteAttack_Base) window._originalExecuteAttack_Base = window.executeAttack;
window.executeAttack = function(targetType, enemyIndex) {
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        if (targetType === 'card') window.executePersonSkill(sIdx, window.TCG_BATTLE.cpu.field[enemyIndex], true, false);
        else window.showBattleMessage("⚠️ そのスキルはモンスターのみ対象です", true);
        return;
    }

    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const isPlayer = window.TCG_BATTLE.isEnemyTurn === false;
    const owner = isPlayer ? p : cpu; const enemy = isPlayer ? cpu : p;
    const attackerCard = owner.field[window.TCG_BATTLE.selectedAttackerIndex];

    if (attackerCard && attackerCard._smith_buffed) {
        attackerCard.damage += 20; attackerCard._smith_buffed = false;
        window.showVFX(`${isPlayer ? 'p' : 'c'}-card-${window.TCG_BATTLE.selectedAttackerIndex}`, 'heal', '鍛冶強化+20');
    }

    if (targetType === 'person') {
        const targetPerson = window.TCG_BATTLE.currentPerson[isPlayer ? 'cpu' : 'player'];
        if (!targetPerson) return;
        let dmg = attackerCard.damage;
        if (enemy._captain_guard) dmg = Math.max(0, dmg - 10);

        window.showBattleMessage(`⚔️ ${attackerCard.name} の攻撃！`, false, 1500, !isPlayer);
        const targetHtmlId = isPlayer ? 'c-person-zone' : 'p-person-zone';
        targetPerson.hp -= dmg;
        window.showVFX(targetHtmlId, 'slash'); window.showVFX(targetHtmlId, 'damage', dmg);
        window.showBattleMessage(`💥 人物『${targetPerson.name}』に ${dmg} ダメージ！`, false, 2000, !isPlayer, true);

        if (targetPerson.hp <= 0) {
            setTimeout(() => {
                window.showBattleMessage(`🏃 人物『${targetPerson.name}』が退却した！`, false, 2500, !isPlayer, true);
                const ui = document.getElementById('tcg-battle-ui'); if (ui) { ui.classList.remove('screen-shake-effect'); void ui.offsetWidth; ui.classList.add('screen-shake-effect'); }
                enemy.graveyard.push(targetPerson); window.TCG_BATTLE.currentPerson[isPlayer ? 'cpu' : 'player'] = null; window.renderBattleBoard();
            }, 800);
        }
        if (attackerCard.ability === "stealth") attackerCard.ability = null;
        if (attackerCard.ability === "double_strike" || attackerCard._captain_double) {
            if (!attackerCard._has_attacked_once && !attackerCard.isDead) { attackerCard._has_attacked_once = true; window.showBattleMessage(`🌪️ 【連撃】${attackerCard.name} はもう一度攻撃できる！`, false, 1500, !isPlayer, true); } 
            else { attackerCard.canAttack = false; attackerCard._has_attacked_once = false; }
        } else { attackerCard.canAttack = false; }
        if(isPlayer) window.TCG_BATTLE.selectedAttackerIndex = -1; setTimeout(() => window.renderBattleBoard(), 1100); return;
    }

    if (enemy._captain_guard && attackerCard) {
        let originalDmg = attackerCard.damage; attackerCard.damage = Math.max(0, attackerCard.damage - 10);
        window._originalExecuteAttack_Base(targetType, enemyIndex);
        attackerCard.damage = originalDmg;
    } else {
        window._originalExecuteAttack_Base(targetType, enemyIndex);
    }
};

// ==========================================
// 2. スキル処理（executePersonSkill）のオーバーライド
// ==========================================
window.executePersonSkill = function(skillIndex, targetCard, isPlayer, isPlayerTarget = true) {
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const owner = isPlayer ? p : cpu; const enemy = isPlayer ? cpu : p;
    const personCard = window.TCG_BATTLE.currentPerson[isPlayer ? 'player' : 'cpu'];
    const mData = window.TCG_MASTER[personCard.masterId];
    const skill = (mData.personSkills || mData.skills)[skillIndex];

    owner.currentMana -= skill.cost; window.TCG_BATTLE.personSkillUsed[isPlayer ? 'player' : 'cpu'] = true;
    window.showBattleMessage(`👤 ${personCard.name}のスキル\n『${skill.name}』発動！`, false, 2000, !isPlayer);
    
    let tIdx = targetCard ? (isPlayerTarget ? owner.field.indexOf(targetCard) : enemy.field.indexOf(targetCard)) : -1;
    let tId = isPlayerTarget ? (isPlayer ? `p-card-${tIdx}` : `c-card-${tIdx}`) : (isPlayer ? `c-card-${tIdx}` : `p-card-${tIdx}`);

    if (personCard.masterId === 'person_farmer') {
        if (skillIndex === 0 && targetCard) { targetCard.hp += 15; window.showVFX(tId, 'heal', 15); }
        else if (skillIndex === 1) { if(owner.deck.length>0) owner.hand.push(owner.deck.shift()); owner.maxMana = Math.min(10, owner.maxMana+1); window.showVFX(isPlayer?'player-face':'cpu-face', 'heal', 'ドロー&マナ+1'); }
    } else if (personCard.masterId === 'person_fisherman') {
        if (skillIndex === 0 && targetCard) { targetCard.hp -= 10; window.showVFX(tId, 'slash'); window.showVFX(tId, 'damage', 10); window.checkDeath(targetCard, enemy, tId, owner); }
        else if (skillIndex === 1 && targetCard) { targetCard.isDead = true; enemy.deck.push(targetCard); window.showVFX(tId, 'slash', 'バウンス'); }
    } else if (personCard.masterId === 'person_builder') {
        if (skillIndex === 0 && targetCard) { targetCard.isDefending = true; targetCard._builder_guarded = true; window.showVFX(tId, 'heal', '守護'); }
        else if (skillIndex === 1) { 
            if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.owner === owner) { window.TCG_BATTLE.currentField.card.hp += 50; window.showVFX(isPlayer?'p-field-zone':'c-field-zone', 'heal', 50); }
            else { owner.hp += 40; window.showVFX(isPlayer?'player-face':'cpu-face', 'heal', 40); }
        }
    } else if (personCard.masterId === 'person_chef') {
        if (skillIndex === 0 && targetCard) { targetCard.damage += 10; if(targetCard.baseDmg !== undefined) targetCard.baseDmg += 10; window.showVFX(tId, 'heal', '攻+10'); }
        else if (skillIndex === 1 && targetCard) { targetCard.canAttack = true; targetCard.hp = targetCard.maxHp; window.showVFX(tId, 'heal', '全回復＆再行動'); }
    } else if (personCard.masterId === 'person_smith') {
        if (skillIndex === 0 && targetCard) { targetCard._smith_buffed = true; window.showVFX(tId, 'heal', '武器研磨'); }
        else if (skillIndex === 1 && targetCard) { targetCard._smith_trample = true; window.showVFX(tId, 'heal', '貫通付与'); } // ★abilityは書き換えない！
    } else if (personCard.masterId === 'person_adventurer') {
        if (skillIndex === 0) { if(owner.deck.length>0) owner.hand.push(owner.deck.shift()); window.showVFX(isPlayer?'player-face':'cpu-face', 'heal', 'ドロー'); }
        else if (skillIndex === 1) { let evos = owner.deck.filter(c => window.TCG_MASTER[c.masterId] && window.TCG_MASTER[c.masterId].evolvesFrom); if (evos.length > 0) { let hit = evos[Math.floor(Math.random() * evos.length)]; owner.deck = owner.deck.filter(c => c !== hit); owner.hand.push(hit); window.showVFX(isPlayer?'player-face':'cpu-face', 'heal', 'サーチ'); } }
    } else if (personCard.masterId === 'person_king') {
        if (skillIndex === 0) { owner.field.forEach((c, idx) => { c.damage += 10; if(c.baseDmg !== undefined) c.baseDmg += 10; window.showVFX(isPlayer?`p-card-${idx}`:`c-card-${idx}`, 'heal', '攻+10'); }); }
        else if (skillIndex === 1) { enemy.field.forEach((c, idx) => { if(c.hp <= 40) { c.hp = 0; window.checkDeath(c, enemy, isPlayer?`c-card-${idx}`:`p-card-${idx}`, owner); window.showVFX(isPlayer?`c-card-${idx}`:`p-card-${idx}`, 'slash', '裁き'); } }); }
    } else if (personCard.masterId === 'person_captain') {
        if (skillIndex === 0) { window.TCG_BATTLE.captainGuard[isPlayer ? 'player' : 'cpu'] = true; window.showVFX(isPlayer?'player-face':'cpu-face', 'heal', '陣形防御'); }
        else if (skillIndex === 1) { owner.field.forEach((c, idx) => { c._captain_double = true; window.showVFX(isPlayer?`p-card-${idx}`:`c-card-${idx}`, 'heal', '連撃付与'); }); } // ★abilityは書き換えない！
    } else if (personCard.masterId === 'person_soldier') {
        if (skillIndex === 0 && targetCard) { targetCard.hp -= 10; window.showVFX(tId, 'slash'); window.showVFX(tId, 'damage', 10); window.checkDeath(targetCard, enemy, tId, owner); }
        else if (skillIndex === 1 && targetCard) { targetCard.hp -= 40; window.showVFX(tId, 'slash'); window.showVFX(tId, 'damage', 40); window.checkDeath(targetCard, enemy, tId, owner); personCard.hp -= 20; window.showVFX(isPlayer?'p-person-zone':'c-person-zone', 'damage', 20); if (personCard.hp <= 0) { enemy.graveyard.push(personCard); window.TCG_BATTLE.currentPerson[isPlayer?'player':'cpu'] = null; } }
    }

    setTimeout(() => { enemy.field = enemy.field.filter(c => !c.isDead); owner.field = owner.field.filter(c => !c.isDead); window.renderBattleBoard(); }, 800);
};

if (!window._originalDecideAITarget_Base) window._originalDecideAITarget_Base = window._decideAITarget;
window._decideAITarget = function(attackerObj, defenderObj) {
    if (window.TCG_BATTLE.currentPerson.cpu && !window.TCG_BATTLE.personSkillUsed.cpu) {
        const pCard = window.TCG_BATTLE.currentPerson.cpu; const mData = window.TCG_MASTER[pCard.masterId];
        const pSkills = mData.personSkills || mData.skills; const s1 = pSkills[0]; const s2 = pSkills[1];
        if (attackerObj.currentMana >= s2.cost && Math.random() < 0.5) { let t = s2.desc.includes("敵") ? defenderObj.field[Math.floor(Math.random() * defenderObj.field.length)] : attackerObj.field[Math.floor(Math.random() * attackerObj.field.length)]; if (!s2.desc.includes("1体") || t) window.executePersonSkill(1, t, false, !s2.desc.includes("敵")); } 
        else if (attackerObj.currentMana >= s1.cost && Math.random() < 0.7) { let t = s1.desc.includes("敵") ? defenderObj.field[Math.floor(Math.random() * defenderObj.field.length)] : attackerObj.field[Math.floor(Math.random() * attackerObj.field.length)]; if (!s1.desc.includes("1体") || t) window.executePersonSkill(0, t, false, !s1.desc.includes("敵")); }
    }
    if (window.TCG_BATTLE.currentPerson.player && Math.random() < 0.3) {
        const taunts = defenderObj.field.filter(c => c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending);
        if (taunts.length === 0) return { type: 'person', index: 0 };
    }
    return window._originalDecideAITarget_Base ? window._originalDecideAITarget_Base(attackerObj, defenderObj) : { type: 'player', index: 0 };
};

if (!window._originalShowCardDetailModal_Base) window._originalShowCardDetailModal_Base = window.showCardDetailModal;
window.showCardDetailModal = function(ownerTypeOrCard, indexOrFromGacha) {
    if (typeof ownerTypeOrCard === 'string' && (ownerTypeOrCard === 'player_person' || ownerTypeOrCard === 'cpu_person')) {
        let card = window.TCG_BATTLE.currentPerson[ownerTypeOrCard === 'player_person' ? 'player' : 'cpu'];
        if (!card) return;
        let modal = document.getElementById('tcg-card-detail-modal');
        if (!modal) { modal = document.createElement('div'); modal.id = 'tcg-card-detail-modal'; modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,15,20,0.95); z-index: 65000; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;`; document.body.appendChild(modal); }
        modal.onclick = function(e) { if (e.target === this || true) modal.style.display = 'none'; };
        modal.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; pointer-events:none;"><div style="margin-bottom: 20px; color: #E91E63; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px #000;">🔍 人物詳細</div><div style="transform: scale(1.8); box-shadow: 0 0 40px rgba(233,30,99,0.6); border-radius: 12px;">${window.renderCardHTML(card)}</div><div style="margin-top: 130px; color: #aaa; font-size: 16px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 20px;">画面をクリックして閉じる</div></div>`;
        modal.style.display = 'flex'; setTimeout(() => modal.style.opacity = '1', 50);
        return;
    }
    if (window._originalShowCardDetailModal_Base) window._originalShowCardDetailModal_Base(ownerTypeOrCard, indexOrFromGacha);
};

console.log("✨ 人物カードシステム ＆ UI完全修復版の読み込みが完了しました！");

// ==========================================
// ★ パッチ：CPUの誤配置修正 ＆ 人物カードの世代強化システム
// ==========================================

// 1. 世代（レベル）による強化を計算する関数
window.applyPersonLevelBonus = function(card) {
    if (card.type !== 'person') return;
    
    // カードのレベルを取得（デフォルトは1）
    let level = card.level || 1; 
    let master = window.TCG_MASTER[card.masterId];
    if (!master) return;

    let baseHp = master.baseHp || 30;
    let baseCost = master.baseCost !== undefined ? master.baseCost : (master.cost || 0);

    // 【強化ロジック】 レベルが1上がるごとにHP+10 / レベルが2上がるごとにコスト-1
    let bonusHp = (level - 1) * 10;
    let discountCost = Math.floor((level - 1) / 2);

    card.maxHp = baseHp + bonusHp;
    
    // 配置コストの計算（最低でもコストは1になるように制限）
    card.cost = Math.max(1, baseCost - discountCost);
};

// 2. 盤面描画のタイミングで「敵がモンスター枠に出した人物」を強制ワープ＆強化適用
const _originalRenderBattleBoard_autoFix = window.renderBattleBoard;
window.renderBattleBoard = function() {
    
    // ★ 何よりも先に安全装置を起動！箱（currentPerson）がなければ作る
    if (window.ensurePersonSystemInitialized) window.ensurePersonSystemInitialized();

    // ★ 箱が確実に存在する場合のみ、強化やワープの処理を行う（これでエラー回避！）
    if (window.TCG_BATTLE && window.TCG_BATTLE.currentPerson) {
        const p = window.TCG_BATTLE.player; 
        const cpu = window.TCG_BATTLE.cpu;

        // 手札や盤面の人物カードに「世代強化」を適用する
        [p, cpu].forEach(owner => {
            if (!owner) return;
            owner.hand.forEach(c => { if(c.type === 'person') window.applyPersonLevelBonus(c); });
            
            // ★ currentPerson の中身をチェック
            if (window.TCG_BATTLE.currentPerson[owner === p ? 'player' : 'cpu']) {
                window.applyPersonLevelBonus(window.TCG_BATTLE.currentPerson[owner === p ? 'player' : 'cpu']);
            }
            
            // ★ 敵CPUのルール違反（モンスター枠への配置）を検知してワープさせる！
            if (owner.field) {
                for (let i = owner.field.length - 1; i >= 0; i--) {
                    let card = owner.field[i];
                    if (card.type === 'person' || (window.TCG_MASTER[card.masterId] && window.TCG_MASTER[card.masterId].type === 'person')) {
                        // モンスター枠から剥がす
                        let misplacedPerson = owner.field.splice(i, 1)[0];
                        misplacedPerson.type = 'person';
                        
                        // すでに人物枠に誰かいたら墓地へ送る
                        if (window.TCG_BATTLE.currentPerson[owner === p ? 'player' : 'cpu']) {
                            owner.graveyard.push(window.TCG_BATTLE.currentPerson[owner === p ? 'player' : 'cpu']);
                        }
                        
                        // HPの初期化と強化の適用
                        window.applyPersonLevelBonus(misplacedPerson);
                        if (misplacedPerson.hp === undefined || misplacedPerson.hp <= 0) {
                            misplacedPerson.hp = misplacedPerson.maxHp;
                        }
                        misplacedPerson.isDead = false;

                        // 人物枠に正しくセットする
                        window.TCG_BATTLE.currentPerson[owner === p ? 'player' : 'cpu'] = misplacedPerson;
                        console.log(`⚠️ ${owner === p ? 'プレイヤー' : 'CPU'} が人物をフィールドに誤配置したため、人物枠へワープさせました。`);
                    }
                }
            }
        });
    }

    _originalRenderBattleBoard_autoFix();
};

// 3. プレイヤーが手札から出す時も、強化後のHPをセットする
const _originalPlayCard_levelFix = window.playCard;
window.playCard = function(handIndex) {
    if (!window.TCG_BATTLE || window.TCG_BATTLE.isEnemyTurn || window.TCG_BATTLE.isAnimating || window.TCG_BATTLE.selectedAttackerIndex !== -1) return;
    
    const p = window.TCG_BATTLE.player; 
    const card = p.hand[handIndex];
    if (!card) return;

    if (window.TCG_MASTER[card.masterId]) card.type = window.TCG_MASTER[card.masterId].type;

    if (card.type === 'person') {
        window.applyPersonLevelBonus(card); // 強化の適用
        // playCardの元の処理に任せずにここで処理を奪うなら、HP初期化を確実に行う
        if (card.hp === undefined) {
            card.hp = card.maxHp;
        }
    }
    
    _originalPlayCard_levelFix(handIndex);
};

// ------------------------------------------
// 4. デッキ構築画面の検索フィルター UI
// ------------------------------------------
const _origOpenDeckBuilder = window.openDeckBuilder;
window.openDeckBuilder = function() {
    if (_origOpenDeckBuilder) _origOpenDeckBuilder();
    setTimeout(() => {
        const selects = document.querySelectorAll('select');
        selects.forEach(sel => {
            if (sel.innerHTML.includes('全種族') && !sel.innerHTML.includes('value="person"')) {
                sel.insertAdjacentHTML('beforeend', '<option value="person">👤 人物(サポート)</option>');
            }
        });
    }, 100);
};

// ------------------------------------------
// 5. カードアンロックのフック（師匠＆アリーナ）
// ------------------------------------------
// ① 師匠の免許皆伝（ランク10到達時）
const _origCheckMasterVisit = window.checkMasterVisit;
window.checkMasterVisit = function(masterType, visitAction) {
    console.log("[師匠報告デバッグ] TCGフック経由", {
        師匠: masterType,
        選択: visitAction
    });

    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    
    if (hero && hero.apprentice && hero.apprentice.activeQuest) {
        const rank = hero.apprentice.rank[masterType] || 1;
        const qData = hero.getMasterQuestData(masterType, rank);
        
        // クエストをクリアしてランク9→10（免許皆伝）になる瞬間を検知！
        if (qData && qData.check() && rank >= 9) {
            const masterTypeMap = { 'farming':'farmer', 'fishing':'fisherman', 'building':'builder', 'cooking':'chef', 'smithing':'smith', 'explore':'adventurer' };
            const tcgId = 'person_' + (masterTypeMap[masterType] || masterType);
            
            if (typeof window.triggerTCGUnlock === 'function') {
                window.triggerTCGUnlock(tcgId, hero.generation || 1);
            }
        }
    }
    
    // 元の処理を実行（会話UIなどを開く）
    if (_origCheckMasterVisit) _origCheckMasterVisit(masterType, visitAction);
};

// ② 城の助っ人（アリーナ終了時にログから検知）
const _origEndArena = window.endArena;
window.endArena = function(isGiveUp) {
    let state = window.ARENA_STATE;
    // バトルログの中に「城の兵士」などの文字列があれば、その戦闘で召喚されたとみなしてアンロック！
    if (state && state.log && typeof window.triggerTCGUnlock === 'function') {
        let logStr = state.log.join(" ");
        let gen = (window.aiPet && window.aiPet.generation) ? window.aiPet.generation : 1;
        
        if (logStr.includes("城の兵士")) window.triggerTCGUnlock('person_soldier', gen);
        if (logStr.includes("城の隊長")) window.triggerTCGUnlock('person_captain', gen);
        if (logStr.includes("王様"))   window.triggerTCGUnlock('person_king', gen);
    }
    
    // 元の終了処理を実行
    if (_origEndArena) _origEndArena(isGiveUp);
};

// 一時的に付与したフラグをターン切り替え時に元に戻す処理
const _originalStartPlayerTurn_resetFlags = window.startPlayerTurn;
window.startPlayerTurn = async function(isFirstTurn = false) {
    if (window.TCG_BATTLE) {
        window.TCG_BATTLE.personSkillUsed.player = false;
        window.TCG_BATTLE.captainGuard.player = false;
        window.TCG_BATTLE.player.field.forEach(c => { 
            if (c._builder_guarded) { c._builder_guarded = false; c.isDefending = false; }
            if (c._smith_trample) { c._smith_trample = false; }
            if (c._captain_double) { c._captain_double = false; }
            c._smith_buffed = false; 
        });
    }
    await _originalStartPlayerTurn_resetFlags(isFirstTurn);
};

const _originalExecuteCPUTurn_resetFlags = window.executeCPUTurn;
window.executeCPUTurn = async function(isFirstTurn = false) {
    if (window.TCG_BATTLE) {
        window.TCG_BATTLE.personSkillUsed.cpu = false;
        window.TCG_BATTLE.captainGuard.cpu = false;
        window.TCG_BATTLE.cpu.field.forEach(c => { 
            if (c._builder_guarded) { c._builder_guarded = false; c.isDefending = false; }
            if (c._smith_trample) { c._smith_trample = false; }
            if (c._captain_double) { c._captain_double = false; }
            c._smith_buffed = false; 
        });
    }
    await _originalExecuteCPUTurn_resetFlags(isFirstTurn);
};

console.log("✨ 人物カード：UIバッジ・アンロックフックのパッチ適用完了！");

// ======================================================================
// ★ 仕様追加：敵の攻撃宣言時に割り込む（インターセプト）システム
// ======================================================================

// 1. 敵の攻撃を検知して時間を止めるフック
if (!window._originalExecuteAttack_InterruptBase) {
    window._originalExecuteAttack_InterruptBase = window.executeAttack;
}

// ==========================================
// ★ バグ修正：インターセプト（割り込み）が発動しない問題の完全修正
// ==========================================

// 1. 敵の攻撃宣言時に、確実に割り込みUIを起動する
window.executeAttack = function(targetType, enemyIndex) {
    // ターゲット選択中のクリック処理
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        if (targetType === 'card') window.executePersonSkill(sIdx, window.TCG_BATTLE.cpu.field[enemyIndex], true, false);
        else window.showBattleMessage("⚠️ そのスキルはモンスターのみ対象です", true);
        
        // 割り込み中だった場合は、少し待ってから敵の攻撃を再開させる
        if (window.TCG_BATTLE._isInterrupting) setTimeout(window.resumePendingAttack, 1200);
        return;
    }

    // ★修正点1：isAnimating の条件を削除！敵ターンは操作禁止フラグが立っているため、それを無視して割り込む！
    if (window.TCG_BATTLE && window.TCG_BATTLE.isEnemyTurn && !window.TCG_BATTLE._interruptHandled) {
        const p = window.TCG_BATTLE.player;
        const personCard = window.TCG_BATTLE.currentPerson ? window.TCG_BATTLE.currentPerson.player : null;

        if (personCard && !personCard.isDead && !window.TCG_BATTLE.personSkillUsed.player) {
            let mData = window.TCG_MASTER[personCard.masterId] || {};
            let pSkills = mData.personSkills || mData.skills || [];
            let s1 = pSkills[0], s2 = pSkills[1];
            let canS1 = s1 && p.currentMana >= s1.cost;
            let canS2 = s2 && p.currentMana >= s2.cost;

            // マナが足りている場合のみ、割り込みUIを出す
            if (canS1 || canS2) {
                window.TCG_BATTLE._interruptHandled = true; 
                window.TCG_BATTLE._pendingTargetType = targetType; 
                window.TCG_BATTLE._pendingEnemyIndex = enemyIndex;
                window.TCG_BATTLE._pendingAttackerIndex = window.TCG_BATTLE.selectedAttackerIndex;
                
                window.TCG_BATTLE._isInterrupting = true; // 割り込み状態オン
                window.showPersonInterruptModal(personCard, s1, s2, canS1, canS2);
                return; 
            }
        }
    }

    window.TCG_BATTLE._interruptHandled = false;
    
    // ★ 割り込み（バウンスや破壊）によって、攻撃元の敵モンスターが消滅している場合は攻撃を不発にする
    const owner = window.TCG_BATTLE.isEnemyTurn ? window.TCG_BATTLE.cpu : window.TCG_BATTLE.player;
    const attacker = owner.field[window.TCG_BATTLE.selectedAttackerIndex];
    if (!attacker || attacker.isDead) {
        window.TCG_BATTLE.selectedAttackerIndex = -1;
        window.renderBattleBoard();
        return; 
    }

    if (window._originalExecuteAttack_InterruptBase) {
        window._originalExecuteAttack_InterruptBase(targetType, enemyIndex);
    } else if (window._originalExecuteAttack_Base) {
        window._originalExecuteAttack_Base(targetType, enemyIndex);
    }
};


// 2. 本家リスペクト！邪魔にならないスマートなサイドパネルUI
window.showPersonInterruptModal = function(personCard, s1, s2, canS1, canS2) {
    window.TCG_BATTLE._isInterrupting = true;
    
    let ui = document.createElement('div');
    ui.id = 'tcg-interrupt-ui';
    // ★ 右側にスライドインするスタイリッシュなデザインに変更
    ui.style.cssText = `position:fixed; right:30px; top:50%; transform:translateY(-50%); width:300px; background:rgba(15,15,20,0.95); border:3px solid #E91E63; border-radius:12px; padding:20px; z-index:60000; display:flex; flex-direction:column; gap:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8); animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;`;
    
    if (!document.getElementById('interrupt-style')) {
        let style = document.createElement('style'); style.id = 'interrupt-style';
        style.innerHTML = `@keyframes slideInRight { 0% { transform:translate(100%, -50%); opacity:0; } 100% { transform:translate(0, -50%); opacity:1; } }`;
        document.head.appendChild(style);
    }

    ui.innerHTML = `
        <div style="color:#FF9800; font-size:20px; font-weight:bold; text-align:center; border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:5px;">
            ⚠️ 敵の攻撃宣言！
        </div>
        <div style="color:#ddd; font-size:14px; text-align:center; line-height:1.4;">
            <span style="color:#E91E63; font-weight:bold; font-size:16px;">${personCard.name}</span> のスキルで<br>割り込みますか？
        </div>
        
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
            ${canS1 ? `<button onclick="window.confirmInterrupt(${0}, ${s1.cost})" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#00BCD4; border:2px solid #00BCD4; border-radius:8px; cursor:pointer; transition: 0.2s;" onmouseover="this.style.background='#00BCD4'; this.style.color='#fff';" onmouseout="this.style.background='#111'; this.style.color='#00BCD4';">${s1.name} (${s1.cost}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s1.name} (マナ不足)</button>`}
            
            ${canS2 ? `<button onclick="window.confirmInterrupt(${1}, ${s2.cost})" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#E91E63; border:2px solid #E91E63; border-radius:8px; cursor:pointer; transition: 0.2s;" onmouseover="this.style.background='#E91E63'; this.style.color='#fff';" onmouseout="this.style.background='#111'; this.style.color='#E91E63';">${s2.name} (${s2.cost}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s2.name} (マナ不足)</button>`}
        </div>
        
        <button onclick="window.cancelInterrupt()" style="margin-top:10px; padding:10px; font-size:14px; font-weight:bold; background:#444; color:#bbb; border:none; border-radius:8px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#444'">割り込まない</button>
    `;
    document.body.appendChild(ui);
};

// 3. 割り込みの選択結果を処理する関数
window.confirmInterrupt = function(skillIndex, cost) {
    document.getElementById('tcg-interrupt-ui').remove();
    // ★ ターゲット選択中だけ「敵のターン」フラグを一時的に解除し、プレイヤーが盤面をクリックできるようにする！
    window.TCG_BATTLE._realEnemyTurn = window.TCG_BATTLE.isEnemyTurn;
    window.TCG_BATTLE.isEnemyTurn = false; 
    
    window.openPersonSkillTarget(skillIndex, cost);
};

window.cancelInterrupt = function() {
    document.getElementById('tcg-interrupt-ui').remove();
    window.resumePendingAttack(); // スキップして敵の攻撃を再開
};

// 2. 割り込みが終わった後、止めていたCPUを再起動させる処理
window.resumePendingAttack = function() {
    window.TCG_BATTLE._isInterrupting = false;
    
    if (window.TCG_BATTLE._realEnemyTurn !== undefined) {
        window.TCG_BATTLE.isEnemyTurn = window.TCG_BATTLE._realEnemyTurn;
    }

    let tType = window.TCG_BATTLE._pendingTargetType;
    let eIdx = window.TCG_BATTLE._pendingEnemyIndex;
    let aIdx = window.TCG_BATTLE._pendingAttackerIndex;
    
    window.TCG_BATTLE._pendingTargetType = null;
    window.TCG_BATTLE._pendingEnemyIndex = null;
    window.TCG_BATTLE._pendingAttackerIndex = null;
    
    // スキルのアニメーションを待ってから判定
    setTimeout(async () => {
        const owner = window.TCG_BATTLE.isEnemyTurn ? window.TCG_BATTLE.cpu : window.TCG_BATTLE.player;
        const attacker = owner.field[aIdx];
        let result;
        
        // 割り込みスキル（大漁網など）によって攻撃元が消えていた場合
        if (!attacker || attacker.isDead) {
            window.showBattleMessage("💥 敵の攻撃は不発に終わった！", false, 1500, false, true);
            window.TCG_BATTLE.selectedAttackerIndex = -1;
            window.TCG_BATTLE.isAnimating = false; 
            window.renderBattleBoard();
        } else {
            // 生き残っていた場合は攻撃を続行！
            window.TCG_BATTLE.selectedAttackerIndex = aIdx; 
            if (window._originalExecuteAttack_InterruptBase) {
                result = await window._originalExecuteAttack_InterruptBase(tType, eIdx);
            }
        }

        // ★ ここでカギ（resolve）を回し、フリーズしていたCPUのループを解放・再開させる！
        if (window.TCG_BATTLE._interruptResolve) {
            window.TCG_BATTLE._interruptResolve(result);
            window.TCG_BATTLE._interruptResolve = null;
        }
    }, 500);
};

// 2. 割り込み中のスキル使用時に、操作禁止フラグに弾かれないようにする
window.openPersonSkillTarget = function(skillIndex, cost) {
    // ★修正点2：割り込み中(_isInterrupting)は、isAnimatingのブロックを無視して操作を許可する！
    if (window.TCG_BATTLE.personSkillUsed.player || (!window.TCG_BATTLE._isInterrupting && window.TCG_BATTLE.isAnimating)) return;
    if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }

    const personCard = window.TCG_BATTLE.currentPerson.player;
    const mData = window.TCG_MASTER[personCard.masterId];
    const skill = (mData.personSkills || mData.skills)[skillIndex];

    // ★ 料理人のスキル等も確実にターゲット要求するように設定
    const needsTarget = skill.desc.includes("1体") || skill.desc.includes("指定した") || skill.desc.includes("行動済みの味方");
    if (!needsTarget) { 
        window.executePersonSkill(skillIndex, null, true); 
        if (window.TCG_BATTLE._isInterrupting) setTimeout(window.resumePendingAttack, 1200);
        return; 
    }

    window.TCG_BATTLE.personTargetingIndex = skillIndex;
    let ui = document.getElementById('tcg-target-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = "tcg-target-ui";
        ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #E91E63; border-radius:30px; z-index:50000; text-align:center; box-shadow:0 0 20px rgba(233,30,99,0.6); pointer-events:auto;`;
        ui.innerHTML = `<div style="color:#E91E63; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div><div style="color:#ddd; font-size:14px; margin-bottom:15px;">「${skill.name}」の対象となるカードをクリックしてください</div><button id="btn-cancel-person" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>`;
        document.body.appendChild(ui);
        document.getElementById('btn-cancel-person').onclick = () => { 
            window.TCG_BATTLE.personTargetingIndex = -1; ui.remove(); 
            if (window.TCG_BATTLE._isInterrupting) window.resumePendingAttack();
        };
    }
};

if (!window._originalSelectPlayerCard_IntBase) window._originalSelectPlayerCard_IntBase = window.selectPlayerCard;
window.selectPlayerCard = function(index) {
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.executePersonSkill(sIdx, window.TCG_BATTLE.player.field[index], true, true);
        
        // スキル発動後、アニメーションを待って敵の攻撃を再開
        if (window.TCG_BATTLE._isInterrupting) setTimeout(window.resumePendingAttack, 1200);
        return;
    }
    window._originalSelectPlayerCard_IntBase(index);
};

// ======================================================================
// ★ バグ修正：CPUの処理を完全に「物理停止」させる真の割り込みパッチ
// ======================================================================

// 1. 敵の攻撃宣言時に Promise（待機命令）を使ってCPUをフリーズさせる！
if (!window._originalExecuteAttack_InterruptBase) {
    window._originalExecuteAttack_InterruptBase = window.executeAttack;
}

// 2. 敵の攻撃宣言時に時間を止める処理
const _origExecuteAttack_TS = window.executeAttack;
window.executeAttack = async function(targetType, enemyIndex) {
    // ターゲット選択中のクリックはそのまま通す
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        if (targetType === 'card') window.executePersonSkill(sIdx, window.TCG_BATTLE.cpu.field[enemyIndex], true, false);
        else window.showBattleMessage("⚠️ そのスキルはモンスターのみ対象です", true);
        
        // スキル発動後、少し待ってから「時間停止解除の合図」を出す
        setTimeout(() => { window.TCG_BATTLE._isInterrupting = false; }, 800);
        return;
    }

    // 敵CPUの攻撃宣言時、割り込みUIを起動して時を止める！
    if (window.TCG_BATTLE && window.TCG_BATTLE.isEnemyTurn && !window.TCG_BATTLE._interruptHandled) {
        const p = window.TCG_BATTLE.player;
        const personCard = window.TCG_BATTLE.currentPerson ? window.TCG_BATTLE.currentPerson.player : null;

        if (personCard && !personCard.isDead && !window.TCG_BATTLE.personSkillUsed.player) {
            let mData = window.TCG_MASTER[personCard.masterId] || {};
            let pSkills = mData.personSkills || mData.skills || [];
            let s1 = pSkills[0], s2 = pSkills[1];
            let canS1 = s1 && p.currentMana >= s1.cost;
            let canS2 = s2 && p.currentMana >= s2.cost;

            if (canS1 || canS2) {
                window.TCG_BATTLE._interruptHandled = true; 
                window.TCG_BATTLE._isInterrupting = true; // ★ 時間停止フラグON！
                let cachedAttackerIdx = window.TCG_BATTLE.selectedAttackerIndex; // 攻撃者をメモしておく
                
                // UI表示
                window.showPersonInterruptModal(personCard, s1, s2, canS1, canS2);
                
                // ★ 超重要：プレイヤーが選択を終え、かつ「スキルのアニメーション」が完全に終わるまで待機！
                // （これでサイレントキャンセルによるフリーズが100%直ります！）
                while (window.TCG_BATTLE._isInterrupting || window.TCG_BATTLE.isAnimating) {
                    await new Promise(r => setTimeout(r, 100));
                }

                // 時間が動き出した後、敵の攻撃元がまだ生きているか確認
                const owner = window.TCG_BATTLE.cpu;
                const attacker = owner.field[cachedAttackerIdx];
                if (!attacker || attacker.isDead) {
                    window.showBattleMessage("💥 敵の攻撃は不発に終わった！", false, 1500, false, true);
                    window.TCG_BATTLE.selectedAttackerIndex = -1;
                    window.renderBattleBoard();
                    return; // 攻撃キャンセル（フィズる）
                }
                
                // 攻撃元が生きているなら、攻撃者を再セットして本来の攻撃を再開！
                window.TCG_BATTLE.selectedAttackerIndex = cachedAttackerIdx;
            }
        }
    }

    window.TCG_BATTLE._interruptHandled = false;
    if (_origExecuteAttack_TS) {
        return await _origExecuteAttack_TS.apply(this, arguments);
    }
};

// ======================================================================
// ★ バグ修正：ゲーム全体の時間を停止させる「真・インターセプト」パッチ
// ======================================================================

// 1. 【最強の時間停止】JavaScriptのタイマー機能をハッキングして時を止める！
if (!window._origSetTimeout) {
    window._origSetTimeout = window.setTimeout;
    window._isSystemBypass = false;
    
    // ゲーム内のすべての待機処理を監視し、割り込み中は「見えない箱」に閉じ込める
    window.setTimeout = function(callback, delay, ...args) {
        if (window.TCG_BATTLE && window.TCG_BATTLE._isInterrupting && !window._isSystemBypass) {
            window.TCG_BATTLE._frozenTimeouts = window.TCG_BATTLE._frozenTimeouts || [];
            window.TCG_BATTLE._frozenTimeouts.push({ callback, delay, args });
            return Math.floor(Math.random() * 100000) + 900000; // 偽のタイマーIDを返して敵を騙す
        }
        return window._origSetTimeout(callback, delay, ...args);
    };
    
    // 私たちのUIやアニメーションだけは時間を無視して動けるようにする特別ルート
    window._safeSetTimeout = function(cb, ms, ...args) {
        window._isSystemBypass = true;
        let id = window._origSetTimeout(cb, ms, ...args);
        window._isSystemBypass = false;
        return id;
    };
    
    // 止まっていた時間を再び動かす処理
    window.unfreezeTime = function() {
        window.TCG_BATTLE._isInterrupting = false;
        if (window.TCG_BATTLE._frozenTimeouts) {
            let queue = [...window.TCG_BATTLE._frozenTimeouts];
            window.TCG_BATTLE._frozenTimeouts = [];
            queue.forEach(t => window._origSetTimeout(t.callback, t.delay, ...t.args));
        }
    };
}

// ======================================================================
// ★ バグ修正：無限ループ（非同期エラー）を完全解消する同期インターセプト
// ======================================================================

// 1. CPUの思考をフリーズさせる最強の wait ハッキング
if (!window._origWait_SyncTS) {
    window._origWait_SyncTS = window.wait || (ms => new Promise(r => setTimeout(r, ms)));
}
window.wait = async function(ms) {
    // 割り込み中は、ここでCPUを無限ループに閉じ込めて時間を止める
    while (window.TCG_BATTLE && window.TCG_BATTLE._isInterrupting) {
        await new Promise(r => setTimeout(r, 100));
    }
    return window._origWait_SyncTS(ms);
};

// 2. 敵の攻撃宣言時に「攻撃をキャンセルしてUIを出す」処理（★ asyncを外して同期に戻しました！）
const _origExecuteAttack_Sync = window.executeAttack;
window.executeAttack = function(targetType, enemyIndex) {
    // ターゲット選択中のクリックは通す
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.executePersonSkill(sIdx, window.TCG_BATTLE.cpu.field[enemyIndex], true, false);
        return;
    }

    // 敵CPUの攻撃宣言時、割り込み可能なら【現在の攻撃をキャンセル】してUIを出す
    if (window.TCG_BATTLE && window.TCG_BATTLE.isEnemyTurn && !window.TCG_BATTLE._interruptHandled) {
        const p = window.TCG_BATTLE.player;
        const personCard = window.TCG_BATTLE.currentPerson ? window.TCG_BATTLE.currentPerson.player : null;

        if (personCard && !personCard.isDead && !window.TCG_BATTLE.personSkillUsed.player) {
            let mData = window.TCG_MASTER[personCard.masterId] || {};
            let pSkills = mData.personSkills || mData.skills || [];
            let s1 = pSkills[0], s2 = pSkills[1];
            let canS1 = s1 && p.currentMana >= s1.cost;
            let canS2 = s2 && p.currentMana >= s2.cost;

            if (canS1 || canS2) {
                // 敵の攻撃パラメーターをメモしておく
                window.TCG_BATTLE._interruptHandled = true; 
                window.TCG_BATTLE._pendingTargetType = targetType; 
                window.TCG_BATTLE._pendingEnemyIndex = enemyIndex;
                window.TCG_BATTLE._pendingAttackerIndex = window.TCG_BATTLE.selectedAttackerIndex;
                
                // 時間停止フラグON
                window.TCG_BATTLE._isInterrupting = true; 
                
                // UIを表示
                window.showPersonInterruptModal(personCard, s1, s2, canS1, canS2);
                
                // ★ 最重要：ここで処理を `return` して中断する！
                // 元の攻撃処理を呼ばないことで、一旦「何も起きなかった」ことにしてCPUを wait でフリーズさせる！
                return; 
            }
        }
    }

    // 割り込みが終わった後、または割り込まない場合の本来の攻撃処理
    window.TCG_BATTLE._interruptHandled = false;
    if (_origExecuteAttack_Sync) {
        return _origExecuteAttack_Sync.apply(this, arguments);
    }
};

// 3. プレイヤーが選択を終えた後、キャンセルしていた攻撃を【手動で再開】させる処理
window.resumePendingAttack = function() {
    let tType = window.TCG_BATTLE._pendingTargetType;
    let eIdx = window.TCG_BATTLE._pendingEnemyIndex;
    let aIdx = window.TCG_BATTLE._pendingAttackerIndex;
    
    window.TCG_BATTLE._pendingTargetType = null;
    window.TCG_BATTLE._pendingEnemyIndex = null;
    window.TCG_BATTLE._pendingAttackerIndex = null;
    
    const owner = window.TCG_BATTLE.cpu;
    const attacker = owner.field[aIdx];
    
    // スキルの効果（大漁網など）で敵が消滅していた場合は不発！
    if (!attacker || attacker.isDead) {
        window.showBattleMessage("💥 敵の攻撃は不発に終わった！", false, 1500, false, true);
        window.TCG_BATTLE.selectedAttackerIndex = -1;
        window.renderBattleBoard();
    } else {
        // 敵が生き残っているなら、メモしておいたパラメーターで【手動で元の攻撃を実行】する！
        window.TCG_BATTLE.selectedAttackerIndex = aIdx; 
        if (_origExecuteAttack_Sync) {
            _origExecuteAttack_Sync(tType, eIdx);
        }
    }

    // ★ 最後に時間を動かす！凍結されていたCPUのループが再開する
    window.TCG_BATTLE._isInterrupting = false;
};

// 4. サイドパネルUI ＆ 各種ボタン操作（時間を止めつつ操作するためのラップ）
window.showPersonInterruptModal = function(personCard, s1, s2, canS1, canS2) {
    let ui = document.createElement('div'); ui.id = 'tcg-interrupt-ui';
    ui.style.cssText = `position:fixed; right:30px; top:50%; transform:translateY(-50%); width:300px; background:rgba(15,15,20,0.95); border:3px solid #E91E63; border-radius:12px; padding:20px; z-index:60000; display:flex; flex-direction:column; gap:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8);`;
    
    ui.innerHTML = `
        <div style="color:#FF9800; font-size:20px; font-weight:bold; text-align:center; border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:5px;">⚠️ 敵の攻撃宣言！</div>
        <div style="color:#ddd; font-size:14px; text-align:center; line-height:1.4;"><span style="color:#E91E63; font-weight:bold; font-size:16px;">${personCard.name}</span> のスキルで<br>割り込みますか？</div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
            ${canS1 ? `<button onclick="window._isSystemBypass=true; document.getElementById('tcg-interrupt-ui').remove(); window.openPersonSkillTarget(${0}, ${s1.cost}); window._isSystemBypass=false;" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#00BCD4; border:2px solid #00BCD4; border-radius:8px; cursor:pointer;">${s1.name} (${s1.cost}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s1.name} (マナ不足)</button>`}
            ${canS2 ? `<button onclick="window._isSystemBypass=true; document.getElementById('tcg-interrupt-ui').remove(); window.openPersonSkillTarget(${1}, ${s2.cost}); window._isSystemBypass=false;" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#E91E63; border:2px solid #E91E63; border-radius:8px; cursor:pointer;">${s2.name} (${s2.cost}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s2.name} (マナ不足)</button>`}
        </div>
        <button onclick="window._isSystemBypass=true; document.getElementById('tcg-interrupt-ui').remove(); window.resumePendingAttack(); window._isSystemBypass=false;" style="margin-top:10px; padding:10px; font-size:14px; font-weight:bold; background:#444; color:#bbb; border:none; border-radius:8px; cursor:pointer;">割り込まない</button>
    `;
    document.body.appendChild(ui);
};

// 5. ターゲット選択後、アニメーションを待ってから攻撃を再開させる
window.openPersonSkillTarget = function(skillIndex, cost) {
    if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }
    const personCard = window.TCG_BATTLE.currentPerson.player;
    const mData = window.TCG_MASTER[personCard.masterId];
    const skill = (mData.personSkills || mData.skills)[skillIndex];

    const needsTarget = skill.desc.includes("1体") || skill.desc.includes("指定した") || skill.desc.includes("行動済みの味方");
    if (!needsTarget) { 
        window.executePersonSkill(skillIndex, null, true); 
        // ターゲット不要スキルを使った後、800ms後に攻撃を再開
        setTimeout(window.resumePendingAttack, 800);
        return; 
    }

    window.TCG_BATTLE.personTargetingIndex = skillIndex;
    let ui = document.createElement('div'); ui.id = "tcg-target-ui";
    ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #E91E63; border-radius:30px; z-index:50000; text-align:center;`;
    ui.innerHTML = `<div style="color:#E91E63; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div><div style="color:#ddd; font-size:14px; margin-bottom:15px;">「${skill.name}」の対象となるカードをクリックしてください</div><button id="btn-cancel-person" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>`;
    document.body.appendChild(ui);
    
    document.getElementById('btn-cancel-person').onclick = () => { 
        window.TCG_BATTLE.personTargetingIndex = -1; ui.remove(); 
        window.resumePendingAttack(); // キャンセルしたので即座に再開
    };
};

const _origSelectPlayerCard_TS = window.selectPlayerCard;
window.selectPlayerCard = function(index) {
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.executePersonSkill(sIdx, window.TCG_BATTLE.player.field[index], true, true);
        
        // ターゲットを選択し終わったら、時を動かす！
        setTimeout(() => { window.TCG_BATTLE._isInterrupting = false; }, 800);
        return;
    }
    if (_origSelectPlayerCard_TS) return _origSelectPlayerCard_TS.apply(this, arguments);
};

// ==========================================
// ★ バグ修正：配列ズレによるフリーズ解消 ＆ 即時HP反映パッチ
// ==========================================

// 1. 敵の攻撃宣言時の処理（カードそのものを記憶する！）
const _origExecuteAttack_Final = window.executeAttack;
window.executeAttack = function(targetType, enemyIndex) {
    // ターゲット選択中はそのまま通す
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        window.executePersonSkill(sIdx, window.TCG_BATTLE.cpu.field[enemyIndex], true, false);
        return;
    }

    if (window.TCG_BATTLE && window.TCG_BATTLE.isEnemyTurn && !window.TCG_BATTLE._interruptHandled) {
        const p = window.TCG_BATTLE.player;
        const personCard = window.TCG_BATTLE.currentPerson ? window.TCG_BATTLE.currentPerson.player : null;

        if (personCard && !personCard.isDead && !window.TCG_BATTLE.personSkillUsed.player) {
            let mData = window.TCG_MASTER[personCard.masterId] || {};
            let pSkills = mData.personSkills || mData.skills || [];
            let s1 = pSkills[0], s2 = pSkills[1];
            let canS1 = s1 && p.currentMana >= s1.cost;
            let canS2 = s2 && p.currentMana >= s2.cost;

            if (canS1 || canS2) {
                window.TCG_BATTLE._interruptHandled = true; 
                
                // ★最重要修正：座席番号（Index）ではなく、カードの実体を直接記憶しておく！
                window.TCG_BATTLE._pendingTargetType = targetType; 
                window.TCG_BATTLE._pendingAttackerCard = window.TCG_BATTLE.cpu.field[window.TCG_BATTLE.selectedAttackerIndex];
                window.TCG_BATTLE._pendingTargetCard = targetType === 'card' ? window.TCG_BATTLE.player.field[enemyIndex] : null;
                
                window.TCG_BATTLE._isInterrupting = true; 
                window.showPersonInterruptModal(personCard, s1, s2, canS1, canS2);
                return; // ここで処理を中断！
            }
        }
    }

    window.TCG_BATTLE._interruptHandled = false;
    if (_origExecuteAttack_Final) return _origExecuteAttack_Final.apply(this, arguments);
};

// 2. 攻撃再開処理（記憶したカードを探し直す！）
window.resumePendingAttack = function() {
    window.TCG_BATTLE._isInterrupting = false; // 時間停止を解除

    let tType = window.TCG_BATTLE._pendingTargetType;
    let attackerCard = window.TCG_BATTLE._pendingAttackerCard;
    let targetCard = window.TCG_BATTLE._pendingTargetCard;
    
    // お掃除
    window.TCG_BATTLE._pendingTargetType = null;
    window.TCG_BATTLE._pendingAttackerCard = null;
    window.TCG_BATTLE._pendingTargetCard = null;
    
    // ★修正点：ズレたかもしれない現在の座席番号（Index）を探し直す！
    let newAIdx = window.TCG_BATTLE.cpu.field.indexOf(attackerCard);
    let newEIdx = tType === 'card' ? window.TCG_BATTLE.player.field.indexOf(targetCard) : 0;

    if (newAIdx === -1 || !attackerCard || attackerCard.isDead) {
        // 攻撃元が倒されていた場合
        window.showBattleMessage("💥 攻撃元の敵が消滅し、不発に終わった！", false, 1500, false, true);
        window.TCG_BATTLE.selectedAttackerIndex = -1;
        window.renderBattleBoard();
    } else if (tType === 'card' && (newEIdx === -1 || !targetCard || targetCard.isDead)) {
        // 攻撃対象が消えていた場合
        window.showBattleMessage("💨 攻撃対象が消滅し、敵の攻撃が空を切った！", false, 1500, false, true);
        window.TCG_BATTLE.selectedAttackerIndex = -1;
        window.renderBattleBoard();
    } else {
        // 全員生き残っているなら、新しい座席番号で攻撃再開！
        window.TCG_BATTLE.selectedAttackerIndex = newAIdx; 
        
        // アニメーションの余韻を少しだけ待ってから確実に実行
        setTimeout(() => {
            if (_origExecuteAttack_Final) _origExecuteAttack_Final(tType, newEIdx);
        }, 100);
    }
};

// 3. スキル使用処理（HPの即時反映 ＆ ターゲット処理の同期）
const _origExecutePersonSkill_Visual = window.executePersonSkill;
window.executePersonSkill = function(skillIndex, targetCard, isPlayer, isPlayerTarget = true) {
    _origExecutePersonSkill_Visual.apply(this, arguments);
    
    // ★修正点：スキル発動直後に、上限を超えないようにHPを計算して即座に画面を更新する！
    if (targetCard) {
        if (targetCard.hp > (targetCard.maxHp || 30)) targetCard.hp = targetCard.maxHp || 30;
    }
    window.renderBattleBoard(); 
};

// 4. ターゲット選択キャンセル時の処理修正
window.openPersonSkillTarget = function(skillIndex, cost) {
    if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }
    const personCard = window.TCG_BATTLE.currentPerson.player;
    const mData = window.TCG_MASTER[personCard.masterId];
    const skill = (mData.personSkills || mData.skills)[skillIndex];

    const needsTarget = skill.desc.includes("1体") || skill.desc.includes("指定した") || skill.desc.includes("行動済みの味方");
    if (!needsTarget) { 
        window.executePersonSkill(skillIndex, null, true); 
        setTimeout(window.resumePendingAttack, 800); // アニメーション後に再開
        return; 
    }

    window.TCG_BATTLE.personTargetingIndex = skillIndex;
    let ui = document.createElement('div'); ui.id = "tcg-target-ui";
    ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #E91E63; border-radius:30px; z-index:50000; text-align:center;`;
    ui.innerHTML = `<div style="color:#E91E63; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div><div style="color:#ddd; font-size:14px; margin-bottom:15px;">「${skill.name}」の対象となるカードをクリックしてください</div><button id="btn-cancel-person" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>`;
    document.body.appendChild(ui);
    
    document.getElementById('btn-cancel-person').onclick = () => { 
        window.TCG_BATTLE.personTargetingIndex = -1; ui.remove(); 
        window.resumePendingAttack(); 
    };
};

const _origSelectPlayerCard_Sync = window.selectPlayerCard;
window.selectPlayerCard = function(index) {
    if (window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
        let sIdx = window.TCG_BATTLE.personTargetingIndex; window.TCG_BATTLE.personTargetingIndex = -1;
        let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
        
        window.executePersonSkill(sIdx, window.TCG_BATTLE.player.field[index], true, true);
        
        // ★ スキルのVFX演出を待ってから攻撃を再開！
        setTimeout(window.resumePendingAttack, 800);
        return;
    }
    if (_origSelectPlayerCard_Sync) return _origSelectPlayerCard_Sync.apply(this, arguments);
};

// ======================================================================
// 🛠️ 最終決戦版v4：完全手動処理 ＆ 強制ターゲティング・防弾パッチ (F12用)
// ======================================================================
console.log("🛠️ すべてのバグをねじ伏せる究極のパッチを適用中...");

window.tcgSleep = ms => new Promise(r => setTimeout(r, ms));

const getTargetNameStr = (type, idx, p) => {
    if (type === 'player') return 'あなた (リーダー)';
    if (type === 'person') return `人物『${window.TCG_BATTLE.currentPerson ? (window.TCG_BATTLE.currentPerson.player ? window.TCG_BATTLE.currentPerson.player.name : window.TCG_BATTLE.currentPerson.name) : '不明'}』`;
    if (type === 'field' && window.TCG_BATTLE.currentField) return `フィールド『${window.TCG_BATTLE.currentField.card.name}』`;
    return `味方『${p.field[idx] ? p.field[idx].name : '不明'}』`;
};

const pLog = (msg, isErr = false) => { window.showBattleMessage(`🧑 [プレイヤーログ] ${msg}`, isErr, 0, true); };

const getPersonCard = () => {
    if (!window.TCG_BATTLE || !window.TCG_BATTLE.currentPerson) return null;
    if (window.TCG_BATTLE.currentPerson.player) return window.TCG_BATTLE.currentPerson.player;
    if (window.TCG_BATTLE.currentPerson.masterId) return window.TCG_BATTLE.currentPerson;
    return null;
};

// スキル分類（誤爆防止とUI制御のため）
const ALLY_SKILLS = ["おすそわけ", "特製スパイス", "武器研磨", "即席バリケード", "会心の武具"];
const ENEMY_SKILLS = ["槍の突き", "槍の突撃", "決死の覚悟", "一本釣り", "大漁網"];
const NO_TARGET_SKILLS = ["陣形指示", "総員突撃", "突貫工事", "豊穣の祈り", "マッピング", "秘境の発見", "お宝発見", "究極のフルコース"];

// =====================================
// ① 強制ターゲティング・システム（クリック監視）
// エンジンがクリックを無視するのを防ぐため、画面クリックを直接監視します
// =====================================
if (!window.__targetingClickHandlerInstalled) {
    document.addEventListener('click', (e) => {
        if (window.TCG_BATTLE && window.TCG_BATTLE.personTargetingIndex !== undefined && window.TCG_BATTLE.personTargetingIndex !== -1) {
            let cpuCardEl = e.target.closest('[id^="c-card-"]');
            let pCardEl = e.target.closest('[id^="p-card-"]');
            
            if (cpuCardEl || pCardEl) {
                e.stopPropagation(); e.preventDefault();
                
                let isAlly = !!pCardEl;
                let idx = parseInt((isAlly ? pCardEl : cpuCardEl).id.replace(/[cp]-card-/, ''));
                let targetCard = isAlly ? window.TCG_BATTLE.player.field[idx] : window.TCG_BATTLE.cpu.field[idx];
                
                if (targetCard) {
                    let sIdx = window.TCG_BATTLE.personTargetingIndex;
                    const personCard = getPersonCard(); 
                    const skillName = ((window.TCG_MASTER[personCard.masterId] || {}).personSkills || (window.TCG_MASTER[personCard.masterId] || {}).skills || [])[sIdx]?.name;

                    // 誤爆防止フィルター
                    if (isAlly && ENEMY_SKILLS.includes(skillName)) { window.showBattleMessage("⚠️ そのスキルは敵専用です！", true); return; }
                    if (!isAlly && ALLY_SKILLS.includes(skillName)) { window.showBattleMessage("⚠️ そのスキルは味方専用です！", true); return; }

                    pLog(`${isAlly ? '味方' : '敵'}カード(index:${idx})への強制クリックを検知！`);
                    window.TCG_BATTLE.personTargetingIndex = -1;
                    let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
                    window.executePersonSkill(sIdx, targetCard, !!window.TCG_BATTLE.isEnemyTurn, isAlly);
                }
            }
        }
    }, true);
    window.__targetingClickHandlerInstalled = true;
}

// =====================================
// ② 人物スキルの完全手動オーバーライド
// =====================================
if (!window._orig_executePersonSkill_V12) window._orig_executePersonSkill_V12 = window.executePersonSkill;
window.executePersonSkill = function(...args) {
    let skillIndex = args[0]; let targetCard = args[1]; let isIntercept = args[2]; let isAllyTarget = args[3];
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    const personCard = getPersonCard(); 
    const mData = personCard ? (window.TCG_MASTER[personCard.masterId] || {}) : {};
    const skill = (mData.personSkills || mData.skills || [])[skillIndex];

    let isPlayerSkill = !window.TCG_BATTLE.isEnemyTurn || isIntercept;
    pLog(`スキル発動処理を開始... (スキル名: ${skill ? skill.name : '不明'})`);

    let res = null;
    if (window.TCG_BATTLE.isEnemyTurn && isIntercept) {
        res = window.TCG_BATTLE.inputResolve || window.TCG_BATTLE.interceptResolve;
        window.TCG_BATTLE.inputResolve = null; window.TCG_BATTLE.interceptResolve = null; window.TCG_BATTLE.awaitingInput = null;
    }
    
    let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
    if (window.TCG_BATTLE) window.TCG_BATTLE.personTargetingIndex = -1;

    // 1ターン1回制限チェック
    if (isPlayerSkill && window.TCG_BATTLE.personSkillUsed && window.TCG_BATTLE.personSkillUsed.player) {
        window.showBattleMessage("⚠️ スキルは1ターンに1回しか使えません！", true);
        if (res) res('cancel'); return;
    }

    let handledManually = false;

    // ★ すべてのバグスキルをここで完全手動処理！
    if (skill && isPlayerSkill) {
        let sName = skill.name;
        
        if (sName === "おすそわけ" && targetCard) {
            targetCard.hp += 15; if (targetCard.hp > (targetCard.maxHp||100)) targetCard.hp = targetCard.maxHp||100;
            window.showVFX(`p-card-${p.field.indexOf(targetCard)}`, 'heal', '+15'); window.showBattleMessage("✨ おすそわけでHPを15回復！", false, 1500);
            handledManually = true;
        } else if (sName === "陣形指示") {
            p.tempDamageReduction = 10; window.showBattleMessage("🛡️ 陣形指示！このターン受けるダメージを-10！", false, 1500);
            handledManually = true;
        } else if (sName === "武器研磨" && targetCard) {
            targetCard.damage += 20; window.showVFX(`p-card-${p.field.indexOf(targetCard)}`, 'buff', '+20'); window.showBattleMessage("⚔️ 武器研磨！攻撃力が20アップ！", false, 1500);
            handledManually = true;
        } else if ((sName === "槍の突き" || sName === "槍の突撃") && targetCard) {
            targetCard.hp -= 10; window.showVFX(isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, 'damage', 10); window.showBattleMessage("⚔️ 槍の突き！敵に10ダメージ！", false, 1500);
            if (window.checkDeath) window.checkDeath(targetCard, isAllyTarget ? p : cpu, isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, isAllyTarget ? cpu : p);
            handledManually = true;
        } else if (sName === "決死の覚悟" && targetCard) {
            targetCard.hp -= 40; if (personCard) personCard.hp -= 20;
            window.showVFX(isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, 'damage', 40);
            if (personCard) window.showVFX('p-person', 'damage', 20); window.showBattleMessage("💥 決死の覚悟！敵に40、自身に20ダメージ！", false, 1500);
            if (window.checkDeath) window.checkDeath(targetCard, isAllyTarget ? p : cpu, isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, isAllyTarget ? cpu : p);
            if (window.checkDeath && personCard) window.checkDeath(personCard, window.TCG_BATTLE.currentPerson, 'p-person', cpu);
            handledManually = true;
        } else if (sName === "総員突撃") {
            p.field.forEach(c => { if(c) c.hasDoubleStrike = true; }); window.showBattleMessage("⚔️ 総員突撃！味方全員が連撃化！", false, 1500);
            handledManually = true;
        } else if (sName === "即席バリケード" && targetCard) {
            targetCard.isDefending = true; window.showVFX(`p-card-${p.field.indexOf(targetCard)}`, 'buff', '守護'); window.showBattleMessage("🛡️ 即席バリケード！このターンのみ守護を付与！", false, 1500);
            handledManually = true;
        } else if (sName === "突貫工事") {
            if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card) { window.TCG_BATTLE.currentField.card.hp += 50; window.showVFX('p-field', 'heal', '+50'); }
            p.hp += 40; window.showVFX('player-face', 'heal', '+40'); window.showBattleMessage("🛠️ 突貫工事！フィールドとリーダーを回復！", false, 1500);
            handledManually = true;
        } else if (sName === "豊穣の祈り") {
            if (p.deck.length > 0) p.hand.push(p.deck.shift());
            if (p.maxMana < 10) p.maxMana++; p.currentMana++; 
            window.showBattleMessage("✨ 豊穣の祈り！カードを引き、マナ回復！", false, 1500);
            handledManually = true;
        } else if (sName === "マッピング" || sName === "秘境の発見") {
            if (p.deck.length > 0) p.hand.push(p.deck.shift()); window.showBattleMessage("🗺️ 探索！カードを1枚引いた！", false, 1500);
            handledManually = true;
        } else if (sName === "お宝発見") {
            let evoIdx = p.deck.findIndex(c => c && c.evolvesFrom);
            if (evoIdx !== -1) p.hand.push(p.deck.splice(evoIdx, 1)[0]);
            else if (p.deck.length > 0) p.hand.push(p.deck.shift());
            window.showBattleMessage("💎 お宝発見！進化カードを手に入れた！", false, 1500);
            handledManually = true;
        } else if (sName === "一本釣り" && targetCard) {
            targetCard.hp -= 10; window.showVFX(isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, 'damage', 10); window.showBattleMessage("🎣 一本釣り！敵に10ダメージ！", false, 1500);
            if (window.checkDeath) window.checkDeath(targetCard, isAllyTarget ? p : cpu, isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, isAllyTarget ? cpu : p);
            handledManually = true;
        } else if (sName === "特製スパイス" && targetCard) {
            targetCard.damage += 20; window.showVFX(`p-card-${p.field.indexOf(targetCard)}`, 'buff', '+20'); window.showBattleMessage("🔥 特製スパイス！攻撃力が20アップ！", false, 1500);
            handledManually = true;
        } else if (sName === "会心の武具" && targetCard) {
            targetCard.ability = "pierce_recoil"; targetCard.badges = targetCard.badges || []; 
            if(!targetCard.badges.includes("貫通")) targetCard.badges.push("貫通");
            window.showVFX(`p-card-${p.field.indexOf(targetCard)}`, 'buff', '貫通'); window.showBattleMessage("⚔️ 会心の武具！貫通を付与！", false, 1500);
            handledManually = true;
        } else if (sName === "大漁網" && targetCard) {
            targetCard.isDead = true; cpu.deck.push(targetCard);
            window.showVFX(isAllyTarget ? `p-card-${p.field.indexOf(targetCard)}` : `c-card-${cpu.field.indexOf(targetCard)}`, 'slash', 'バウンス');
            window.showBattleMessage("🎣 大漁網！敵を山札に戻した！", false, 1500);
            handledManually = true;
        } else if (sName === "究極のフルコース") {
            p.field.forEach(c => { if (c && !c.isDead) { c.hp = c.maxHp || 100; window.showVFX(`p-card-${p.field.indexOf(c)}`, 'heal', '全回復'); } });
            window.showBattleMessage("🍽️ 究極のフルコース！味方全体を全回復！", false, 1500);
            handledManually = true;
        }

        // マナ消費と使用済みフラグのセット、UI強制更新
        if (handledManually) {
            let costVal = parseInt(skill.cost) || 0;
            if (p.currentMana >= costVal) p.currentMana -= costVal;
            if (!window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed = {};
            window.TCG_BATTLE.personSkillUsed.player = true;
            if (window.updatePlayerUI) window.updatePlayerUI();
            window.renderBattleBoard();
            pLog(`手動適用完了。`);
        }
    }

    let ret;
    try {
        if (!handledManually) {
            pLog(`エンジン標準処理へ渡します。`);
            let safeTarget = targetCard || { masterId: 'dummy' };
            ret = window._orig_executePersonSkill_V12.call(this, skillIndex, safeTarget, isIntercept, isAllyTarget);
            if (isPlayerSkill) {
                if (!window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed = {};
                window.TCG_BATTLE.personSkillUsed.player = true;
                if (window.updatePlayerUI) window.updatePlayerUI();
                window.renderBattleBoard();
            }
        }
    } catch(e) {
        pLog(`⚠️ エンジン内部エラー発生: ${e.message}`, true); console.error(e);
    } finally {
        pLog(`スキル処理完了。`);
        if (res) { setTimeout(() => { window.TCG_BATTLE.isEnemyTurn = true; window.TCG_BATTLE.isAnimating = true; res('used'); }, 800); }
    }
    return ret;
};

// =====================================
// ② 対象不要スキルの即発動
// =====================================
window.openPersonSkillTarget = function(skillIndex, cost) {
    if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }
    if (window.TCG_BATTLE.personSkillUsed && window.TCG_BATTLE.personSkillUsed.player) {
        window.showBattleMessage("⚠️ スキルは1ターンに1回しか使えません！", true); return;
    }
    
    const personCard = getPersonCard(); 
    if (!personCard) return; 
    
    const mData = window.TCG_MASTER[personCard.masterId] || {};
    const skill = (mData.personSkills || mData.skills || [])[skillIndex];
    if (!skill) return;

    if (NO_TARGET_SKILLS.includes(skill.name)) {
        pLog(`対象不要スキル即発動: ${skill.name}`);
        window.executePersonSkill(skillIndex, null, !!window.TCG_BATTLE.isEnemyTurn, false);
        return;
    }

    window.TCG_BATTLE.personTargetingIndex = skillIndex;
    let ui = document.getElementById('tcg-target-ui'); if (ui) ui.remove();
    ui = document.createElement('div'); ui.id = "tcg-target-ui";
    ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #E91E63; border-radius:30px; z-index:50000; text-align:center;`;
    ui.innerHTML = `<div style="color:#E91E63; font-size:22px; font-weight:bold; margin-bottom:10px;">🎯 対象を選択中...</div><div style="color:#ddd; font-size:14px; margin-bottom:15px;">「${skill.name}」の対象となるカードをクリックしてください</div><button id="btn-cancel-person" style="padding:8px 20px; background:#555; color:#fff; border:2px solid #777; border-radius:8px; font-weight:bold; cursor:pointer;">キャンセル</button>`;
    document.body.appendChild(ui);

    document.getElementById('btn-cancel-person').onclick = () => {
        window.TCG_BATTLE.personTargetingIndex = -1; ui.remove();
        let res = window.TCG_BATTLE.inputResolve || window.TCG_BATTLE.interceptResolve;
        if (res) { window.TCG_BATTLE.inputResolve = null; window.TCG_BATTLE.interceptResolve = null; window.TCG_BATTLE.awaitingInput = null; res('cancel'); }
    };
};

window.cancelInterrupt = function() {
    pLog(`割り込みがキャンセルされました。`);
    let ui = document.getElementById('tcg-interrupt-ui'); if (ui) ui.remove();
    let res = window.TCG_BATTLE.inputResolve || window.TCG_BATTLE.interceptResolve;
    if (res) { window.TCG_BATTLE.inputResolve = null; window.TCG_BATTLE.interceptResolve = null; window.TCG_BATTLE.awaitingInput = null; res('cancel'); }
};

// =====================================
// ③ 連撃(総員突撃)とターンのリセット
// =====================================
if (!window._orig_executeAttack_V12) window._orig_executeAttack_V12 = window.executeAttack;
window.executeAttack = function(targetType, enemyIndex) {
    let attackerIndex = -1; let attackerCard = null;
    let isPlayerAttack = !window.TCG_BATTLE.isEnemyTurn && window.TCG_BATTLE.selectedAttackerIndex !== -1;
    if (isPlayerAttack) {
        attackerIndex = window.TCG_BATTLE.selectedAttackerIndex;
        attackerCard = window.TCG_BATTLE.player.field[attackerIndex];
    }

    let ret = window._orig_executeAttack_V12.apply(this, arguments);

    if (isPlayerAttack && attackerCard && !attackerCard.isDead && attackerCard.hp > 0) {
        let hasDoubleStrike = attackerCard.ability === 'double_strike' || attackerCard.status === 'double_strike' || 
                              (attackerCard.badges && (attackerCard.badges.includes('double_strike') || attackerCard.badges.includes('連撃') || attackerCard.badges.includes('連撃バッジ') || attackerCard.badges.includes('総員突撃'))) || attackerCard.hasDoubleStrike;
        if (hasDoubleStrike && !attackerCard._doubleStrikeUsed) {
            attackerCard.canAttack = true; attackerCard._doubleStrikeUsed = true;
            window.showBattleMessage(`⚔️ 連撃発動！ ${attackerCard.name} はもう一度攻撃できる！`, false, 1500); window.renderBattleBoard();
        }
    }
    return ret;
};

if (!window._orig_startPlayerTurn_V12) window._orig_startPlayerTurn_V12 = window.startPlayerTurn;
window.startPlayerTurn = function(...args) {
    pLog(`自ターン開始。スキル制限をリセットします。`);
    if (window.TCG_BATTLE.player) {
        if (window.TCG_BATTLE.player.field) window.TCG_BATTLE.player.field.forEach(c => { if(c) c._doubleStrikeUsed = false; });
        if (window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed.player = false;
    }
    return window._orig_startPlayerTurn_V12.apply(this, args);
};

// =====================================
// ④ 敵ターンの攻撃ループ（王の裁き対策＆手動戦闘処理）
// =====================================
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true; window.TCG_BATTLE.isAnimating = true;
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    window.showBattleMessage(`🤖 [思考ログ] 敵のターン処理を開始...`, false, 0, true);

    if (p.tempDamageReduction === undefined) p.tempDamageReduction = 0;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'cpu') window.TCG_BATTLE.turn++;
    if (cpu.maxMana < 10) cpu.maxMana++; cpu.currentMana = cpu.maxMana; cpu.actionUsed = false; 

    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'player') && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift());

    cpu.field.forEach((c, i) => {
        if (c.isDead) return;
        if (c.ability === "start_draw" && !c.isDead) { if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "infinite_gear" && !c.isDead) { while(cpu.hand.length < 5 && cpu.deck.length > 0) cpu.hand.push(cpu.deck.shift()); window.showVFX(`c-card-${i}`, 'heal', 'Draw'); }
        if (c.ability === "star_breath" && !c.isDead) { cpu.maxMana = Math.min(10, cpu.maxMana+2); cpu.currentMana = Math.min(10, cpu.currentMana+2); cpu.hp += 30; window.showVFX('cpu-face', 'heal', 30); }
        if (c.ability === "heaven_judgement" && !c.isDead) { p.hp -= 20; window.showVFX('player-face', 'damage', 20); p.field.forEach((f, fi) => { if(!f.isDead){ f.hp -= 20; window.showVFX(`p-card-${fi}`, 'damage', 20); if(window.checkDeath) window.checkDeath(f, p, `p-card-${fi}`, cpu); } }); }
    });

    cpu.field.forEach(card => card.canAttack = true); window.renderBattleBoard(); await window.tcgSleep(1000);

    for (let cpuIndex = 0; cpuIndex < cpu.field.length; cpuIndex++) {
        let cpuCard = cpu.field[cpuIndex];
        if (!cpuCard || !cpuCard.canAttack || cpuCard.damage <= 0 || cpuCard.isDead) continue;

        window.showBattleMessage(`🤖 [思考ログ] 『${cpuCard.name}』の攻撃準備...`, false, 0, true);

        if (cpuCard.status === "charmed") {
            cpuCard.status = null; cpuCard.canAttack = false; cpu.hp -= cpuCard.damage;
            window.showVFX('cpu-face', 'slash'); window.showVFX('cpu-face', 'damage', cpuCard.damage);
            window.renderBattleBoard();
            if (cpu.hp <= 0) { cpu.hp = 0; window.renderBattleBoard(); window.showBattleMessage("🎉 YOU WIN!!\n敵リーダーのHPが0になりました！", false, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }
            await window.tcgSleep(800); continue;
        }
        if (cpuCard.status === "stunned") continue;

        p.field = p.field.filter(c => c && !c.isDead && c.hp > 0); cpu.field = cpu.field.filter(c => c && !c.isDead && c.hp > 0);
        window.TCG_BATTLE.selectedAttackerIndex = cpuIndex; window.renderBattleBoard();

        const isPierce = cpuCard.ability === "pierce_recoil" || cpuCard.ability === "flight" || cpuCard.ability === "god_strike" || cpuCard.ability === "dimension_drill" || cpuCard.ability === "piercing_juggernaut";

        let aiTarget = window._decideAITarget ? window._decideAITarget(cpu, p) : {type: 'player', index: 0};
        let finalTargetType = aiTarget.type; let finalTargetIndex = aiTarget.index;

        if (finalTargetType === 'card' && (!p.field[finalTargetIndex] || p.field[finalTargetIndex].isDead || p.field[finalTargetIndex].hp <= 0)) {
            finalTargetType = 'player'; finalTargetIndex = 0;
        } else if (finalTargetType === 'person' && (!window.TCG_BATTLE.currentPerson || window.TCG_BATTLE.currentPerson.player.isDead || window.TCG_BATTLE.currentPerson.player.hp <= 0)) {
            finalTargetType = 'player'; finalTargetIndex = 0;
        }
        
        let targetNameStr = getTargetNameStr(finalTargetType, finalTargetIndex, p);
        window.showBattleMessage(`🤖 『${cpuCard.name}』は【${targetNameStr}】に狙いを定めた！`, false, 0, true);

        if (!isPierce && !window.TCG_BATTLE.isAuto) {
            const personCard = getPersonCard();
            if (personCard && !personCard.isDead && (!window.TCG_BATTLE.personSkillUsed || !window.TCG_BATTLE.personSkillUsed.player)) {
                let mData = window.TCG_MASTER[personCard.masterId] || {};
                let pSkills = mData.personSkills || mData.skills || [];
                let s1 = pSkills[0], s2 = pSkills[1];
                let cost1 = parseInt(s1?.cost) || 0; let cost2 = parseInt(s2?.cost) || 0;
                let canS1 = s1 && p.currentMana >= cost1; let canS2 = s2 && p.currentMana >= cost2;

                if (canS1 || canS2) {
                    window.showBattleMessage(`🤖 [思考ログ] プレイヤーの割り込み入力を待機します...`, false, 0, true);
                    let pResult = await new Promise(resolve => {
                        window.TCG_BATTLE.interceptResolve = resolve;
                        let ui = document.createElement('div'); ui.id = 'tcg-interrupt-ui';
                        ui.style.cssText = `position:fixed; right:30px; top:50%; transform:translateY(-50%); width:300px; background:rgba(15,15,20,0.95); border:3px solid #E91E63; border-radius:12px; padding:20px; z-index:60000; display:flex; flex-direction:column; gap:12px; box-shadow:0 10px 40px rgba(0,0,0,0.8);`;
                        ui.innerHTML = `
                            <div style="color:#FF9800; font-size:20px; font-weight:bold; text-align:center; border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:5px;">⚠️ 敵の攻撃宣言！</div>
                            <div style="color:#ddd; font-size:14px; text-align:center; line-height:1.4;"><span style="color:#E91E63; font-weight:bold; font-size:16px;">${personCard.name}</span> のスキルで割り込みますか？</div>
                            <div style="font-size:13px; color:#FFEB3B; text-align:center; margin-top:5px; background:rgba(0,0,0,0.5); padding:5px; border-radius:4px; border:1px solid #FFC107;">🎯 狙い: ${targetNameStr}</div>
                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                                ${canS1 ? `<button onclick="document.getElementById('tcg-interrupt-ui').remove(); window.openPersonSkillTarget(${0}, ${cost1});" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#00BCD4; border:2px solid #00BCD4; border-radius:8px; cursor:pointer;">${s1.name} (${cost1}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s1.name} (不足)</button>`}
                                ${canS2 ? `<button onclick="document.getElementById('tcg-interrupt-ui').remove(); window.openPersonSkillTarget(${1}, ${cost2});" style="padding:12px; font-size:14px; font-weight:bold; background:#111; color:#E91E63; border:2px solid #E91E63; border-radius:8px; cursor:pointer;">${s2.name} (${cost2}M)</button>` : `<button disabled style="padding:12px; font-size:14px; font-weight:bold; background:#222; color:#555; border:2px solid #444; border-radius:8px;">${s2.name} (不足)</button>`}
                            </div>
                            <button onclick="window.cancelInterrupt()" style="margin-top:10px; padding:10px; font-size:14px; font-weight:bold; background:#444; color:#bbb; border:none; border-radius:8px; cursor:pointer;">割り込まない</button>
                        `; document.body.appendChild(ui); 
                    });
                    if (pResult === 'used') { await window.tcgSleep(900); }
                }
            }

            if (cpuCard.isDead || cpuCard.hp <= 0) {
                window.showBattleMessage("💥 攻撃元の敵が消滅し、不発に終わった！", false, 1500, false, true);
                window.TCG_BATTLE.selectedAttackerIndex = -1; window.renderBattleBoard(); await window.tcgSleep(1000); continue; 
            }

            window.showBattleMessage(`🤖 [思考ログ] ターゲットの生存確認を行います...`, false, 0, true);
            if (finalTargetType === 'card' && (!p.field[finalTargetIndex] || p.field[finalTargetIndex].isDead)) {
                finalTargetType = 'player'; finalTargetIndex = 0; targetNameStr = 'あなた (リーダー)';
            } else if (finalTargetType === 'person' && (!window.TCG_BATTLE.currentPerson || window.TCG_BATTLE.currentPerson.player.isDead)) {
                finalTargetType = 'player'; finalTargetIndex = 0; targetNameStr = 'あなた (リーダー)';
            }

            window.showBattleMessage(`🤖 [思考ログ] 守護の確認フェーズへ移行...`, false, 0, true);
            const getTauntIndices = () => { let idxs = []; p.field.forEach((c, i) => { if (c && !c.isDead && (c.ability === "taunt" || c.ability === "pure_aegis" || c.isDefending)) idxs.push(i); }); return idxs; };
            const getCanTaunt = () => p.field.some(c => c && !c.isDead && !c.isDefending && c.ability !== "taunt" && c.ability !== "pure_aegis" && c.status !== "stunned");
            
            let tauntIndices = getTauntIndices(); let canTaunt = getCanTaunt(); let hasMana = p.currentMana >= 1;

            if (hasMana && canTaunt) {
                window.TCG_BATTLE.isIntercepting = true; window.TCG_BATTLE.interceptPhase = 'asking'; window.renderBattleBoard();
                let phase1Result = await new Promise(res1 => {
                    window.TCG_BATTLE.interceptResolve = res1;
                    let ui = document.createElement('div'); ui.id = "tcg-intercept-taunt-ui";
                    ui.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; box-shadow:0 0 30px rgba(255,152,0,0.8); width: 280px;`;
                    ui.innerHTML = `
                        <h3 style="color:#ff9800; margin:0 0 10px 0;">⚠️ 敵の攻撃！</h3>
                        <div style="font-size:18px; color:#fff;">${cpuCard.name}<br><span style="color:#ff5252;">${cpuCard.damage} ダメージ</span></div>
                        <div style="font-size:13px; color:#FFEB3B; background:rgba(0,0,0,0.5); padding:5px; margin:10px 0; border:1px solid #FFC107;">🎯 狙い: ${targetNameStr}</div>
                        <p style="color:#ddd; font-size:13px;">マナを消費して「守護」を追加しますか？</p>
                        <button onclick="document.getElementById('tcg-intercept-taunt-ui').remove(); window.TCG_BATTLE.interceptResolve('add');" style="padding:10px; background:#00BCD4; color:#fff; border-radius:8px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:10px;">🛡️ 守護を追加 (1M)</button>
                        <button onclick="document.getElementById('tcg-intercept-taunt-ui').remove(); window.TCG_BATTLE.interceptResolve('skip');" style="padding:10px; background:#555; color:#fff; border-radius:8px; font-weight:bold; cursor:pointer; width:100%;">追加しない</button>
                    `; document.body.appendChild(ui);
                });

                if (phase1Result === 'add') {
                    window.TCG_BATTLE.interceptPhase = 'adding'; window.renderBattleBoard();
                    let addResult = await new Promise(res2 => {
                        window.TCG_BATTLE.interceptResolve = res2;
                        // let ui = document.createElement('div'); ui.id = "tcg-target-taunt-ui";
                        // ui.style.cssText = `position:fixed; top:25%; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); padding:15px 30px; border:3px solid #00BCD4; border-radius:30px; z-index:50000; text-align:center;`;
                        // ui.innerHTML = `
                        //     <div style="color:#00BCD4; font-size:22px; font-weight:bold; margin-bottom:10px;">🛡️ 守護にする味方をクリック</div>
                        //     <button onclick="document.getElementById('tcg-target-taunt-ui').remove(); window.TCG_BATTLE.interceptResolve('cancel');" style="padding:8px 20px; background:#555; color:#fff; border-radius:8px; cursor:pointer;">キャンセル</button>
                        // `; document.body.appendChild(ui);
                    });
                    if (addResult === 'added') { tauntIndices = getTauntIndices(); }
                }
            }

            if (tauntIndices.length >= 2) {
                window.TCG_BATTLE.isIntercepting = true; window.TCG_BATTLE.interceptPhase = 'selecting'; window.renderBattleBoard();
                let phase2Result = await new Promise(res3 => {
                    window.TCG_BATTLE.interceptResolve = res3;
                    // let ui = document.createElement('div'); ui.id = "tcg-intercept-select-ui";
                    // ui.style.cssText = `position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(0,0,0,0.9); padding:20px; border:4px solid #ff9800; border-radius:12px; z-index:40000; text-align:center; width: 280px;`;
                    // ui.innerHTML = `<h3 style="color:#ff9800; margin:0 0 10px 0;">⚠️ 敵の攻撃！</h3><div style="font-size:18px; color:#fff;">${cpuCard.name}<br>${cpuCard.damage} ダメージ</div><p style="color:#00BCD4; font-weight:bold; margin-top:10px;">身代わりにする味方をクリック！</p>`; document.body.appendChild(ui);
                });
                finalTargetType = phase2Result.targetType; finalTargetIndex = phase2Result.targetIndex; window.TCG_BATTLE.isIntercepting = false;
            } else if (tauntIndices.length === 1) {
                finalTargetType = 'card'; finalTargetIndex = tauntIndices[0]; window.TCG_BATTLE.isIntercepting = false;
            } else { window.TCG_BATTLE.isIntercepting = false; }
        }

        window.showBattleMessage(`🤖 [思考ログ] 全ての確認を終了。攻撃を実行します！`, false, 0, true);
        
        let tempPerson = window.TCG_BATTLE.currentPerson;
        if (window.TCG_BATTLE.currentPerson) window.TCG_BATTLE.currentPerson = null;

        let dmg = cpuCard.damage;
        if (finalTargetType !== 'field' && p.tempDamageReduction > 0) {
            dmg = Math.max(0, dmg - p.tempDamageReduction); window.showBattleMessage(`🛡️ 陣形指示! ダメージ軽減: ${cpuCard.damage} -> ${dmg}`, false, 800, false, true);
        }

        if (finalTargetType === 'player') {
            window.showBattleMessage(`⚔️ ${cpuCard.name} -> リーダー (${dmg} dmg)`, false, 800, false, true); p.hp -= dmg; window.showVFX('player-face', 'slash'); window.showVFX('player-face', 'damage', dmg);
        } else if (finalTargetType === 'card' && p.field[finalTargetIndex]) {
            let defender = p.field[finalTargetIndex];
            window.showBattleMessage(`⚔️ ${cpuCard.name} -> ${defender.name} (${dmg} dmg)`, false, 800, false, true); defender.hp -= dmg; cpuCard.hp -= defender.damage; 
            window.showVFX(`p-card-${finalTargetIndex}`, 'damage', dmg); window.showVFX(`c-card-${cpuIndex}`, 'damage', defender.damage);
            if (window.checkDeath) window.checkDeath(defender, p, `p-card-${finalTargetIndex}`, cpu); if (window.checkDeath) window.checkDeath(cpuCard, cpu, `c-card-${cpuIndex}`, p);
        } else if (finalTargetType === 'person' && tempPerson) {
            let person = tempPerson.player || tempPerson;
            window.showBattleMessage(`⚔️ ${cpuCard.name} -> 人物 (${dmg} dmg)`, false, 800, false, true); person.hp -= dmg; window.showVFX('p-person', 'damage', dmg);
            if (window.checkDeath) window.checkDeath(person, tempPerson, 'p-person', cpu);
        } else if (finalTargetType === 'field' && window.TCG_BATTLE.currentField) {
            let field = window.TCG_BATTLE.currentField.card;
            window.showBattleMessage(`⚔️ ${cpuCard.name} -> フィールド (${dmg} dmg)`, false, 800, false, true); field.hp -= dmg; window.showVFX('p-field', 'damage', dmg);
        }
        await window.tcgSleep(1000);

        if (tempPerson) window.TCG_BATTLE.currentPerson = tempPerson;
        p.field = p.field.filter(c => c && !c.isDead && c.hp > 0); cpu.field = cpu.field.filter(c => c && !c.isDead && c.hp > 0);
        window.TCG_BATTLE.selectedAttackerIndex = -1; window.renderBattleBoard();

        if (cpuCard.ability === "double_strike" && cpuCard.canAttack && !cpuCard.isDead && cpuCard.hp > 0 && !cpuCard._doubleStrikeUsed) { 
            window.showBattleMessage(`🤖 『${cpuCard.name}』は連撃により再度攻撃態勢に入った！`, false, 0, true); cpuCard._doubleStrikeUsed = true; cpuIndex--; 
        }
    }

    // --- 召喚フェーズ・ターン終了処理は省略なし ---
    window.showBattleMessage(`🤖 [思考ログ] 召喚フェーズへ移行...`, false, 0, true);
    let cardsToPlay = [];
    for (let i = cpu.hand.length - 1; i >= 0; i--) {
        let card = cpu.hand[i]; let actualCost = window.getActualCost(cpu, card);
        if (cpu.currentMana >= actualCost) {
            if (card.type === 'action' && cpu.actionUsed) continue;
            if (card.evolvesFrom) {
                let targetIndex = cpu.field.findIndex(c => window.checkCanEvolve ? window.checkCanEvolve(c, card) : (c.type === card.evolvesFrom));
                if (targetIndex !== -1) { cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: true, targetIndex: targetIndex }); cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); }
            } else { cardsToPlay.push({ handIndex: i, card: card, cost: actualCost, isEvo: false }); cpu.currentMana -= actualCost; cpu.hand.splice(i, 1); if (card.type === 'action') cpu.actionUsed = true; }
        }
    }
    if (cardsToPlay.length > 0) window.renderBattleBoard(); 
    for (let idx = 0; idx < cardsToPlay.length; idx++) {
        let playData = cardsToPlay[idx]; let card = playData.card;
        await new Promise(resolve => {
            if (window.animateCardPlay) { window.animateCardPlay(card, false, () => { _processCPUSummon(card, playData); setTimeout(resolve, 1000); }); } else { _processCPUSummon(card, playData); setTimeout(resolve, 1000); }
        });
    }
    function _processCPUSummon(card, playData) {
        if (playData.isEvo) { let prevCard = cpu.field[playData.targetIndex]; card.canAttack = prevCard ? prevCard.canAttack : false; cpu.field[playData.targetIndex] = card; if(window.triggerPlayEffect) window.triggerPlayEffect(card, false); } 
        else { if (card.type === 'item' || card.type === 'action') { card.isDead = true; cpu.graveyard.push(card); if(window.triggerPlayEffect) window.triggerPlayEffect(card, false); } else { card.canAttack = false; cpu.field.push(card); if(window.triggerPlayEffect) window.triggerPlayEffect(card, false); } }
    }

    cpu.field.forEach((c, i) => {
        if (c.isDead) return; c.status = null; c._doubleStrikeUsed = false; 
        if (c.ability === "burn_field" || c.ability === "cataclysm") { let dmg = c.ability === "cataclysm" ? 20 : 10; p.field.forEach((ec, eidx) => { if(!ec.isDead) { ec.hp -= dmg; window.showVFX(`p-card-${eidx}`, 'damage', dmg); if(window.checkDeath) window.checkDeath(ec, p, `p-card-${eidx}`, cpu); } }); }
        if (c.ability === "absolute_sanctuary") { cpu.field.forEach((ac, aidx) => { if(!ac.isDead) { ac.hp += 20; window.showVFX(`c-card-${aidx}`, 'heal', '聖域'); } }); }
        if (c.ability === "raise_dead" && cpu.graveyard.length > 0) { let res = cpu.graveyard.shift(); res.isDead = false; res.hp = Math.floor((res.maxHp||50)/2); cpu.field.push(res); }
        if (c.ability === "end_heal") { c.hp += 20; window.showVFX(`c-card-${i}`, 'heal', 20); }
        if (c.ability === "cyber_miracle") { cpu.field.forEach((f, fi) => { if(!f.isDead){ f.hp += 100; window.showVFX(`c-card-${fi}`, 'heal', '回復'); } }); }
        if (c.ability === "event_horizon") { const aliveEnemies = p.field.filter(e => !e.isDead); if (aliveEnemies.length > 0) { let target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]; target.isDead = true; p.deck.push(target); window.showVFX(`p-card-${p.field.indexOf(target)}`, 'slash', 'バウンス'); } }
        if (c.ability === "divine_grace" && cpu.graveyard && cpu.graveyard.length > 0) { let resCard = cpu.graveyard.shift(); resCard.isDead = false; resCard.hp = window.TCG_MASTER[resCard.masterId] ? window.TCG_MASTER[resCard.masterId].baseHp : 50; cpu.field.push(resCard); window.showVFX('cpu-face', 'heal', '蘇生'); }
    });
    p.field = p.field.filter(c => c && !c.isDead && c.hp > 0); cpu.field = cpu.field.filter(c => c && !c.isDead && c.hp > 0);

    if (p.hp <= 0) { p.hp = 0; window.renderBattleBoard(); window.showBattleMessage("💀 YOU LOSE...\nプレイヤーのHPが0になりました。", true, 5000); setTimeout(() => document.getElementById('tcg-battle-ui').style.display = 'none', 5000); return; }

    window.showBattleMessage(`🤖 [思考ログ] 敵ターン終了。`, false, 0, true);
    p.tempDamageReduction = 0; window.startPlayerTurn(false);
};

console.log("✅ 超・完全防弾パッチ適用完了！画面のクリックすらも強制制御します。");

// ======================================================================
// 🎨 演出・UIブラッシュアップ追加パッチ（tcg_core.jsの一番下に追記）
// ======================================================================

// ① ターン開始時のスキルボタン色（アクティブ化）を確実に反映する
const _polish_startPlayerTurn = window.startPlayerTurn;
window.startPlayerTurn = function(...args) {
    let ret = _polish_startPlayerTurn.apply(this, args);
    
    // ドローやマナ回復のアニメーションには時間がかかるため、
    // 確実なタイミング(100ms, 800ms, 1500ms後)で複数回UIを強制更新します。
    const forceUIUpdate = () => {
        if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
            if (window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed.player = false;
            if (window.updatePlayerUI) window.updatePlayerUI();
            if (window.renderBattleBoard) window.renderBattleBoard();
            
            // ★ ブラウザが動かされた(リサイズされた)フリをして、エンジンに画面の再計算を強制する！
            window.dispatchEvent(new Event('resize'));
        }
    };

    setTimeout(forceUIUpdate, 100);
    setTimeout(forceUIUpdate, 800);
    setTimeout(forceUIUpdate, 1500); // 演出が完全に終わった頃にダメ押し
    
    return ret;
};

// ② 人物やフィールドのダメージVFX（数字のポップアップ）の位置を正確に補正する
const _polish_showVFX = window.showVFX;
window.showVFX = function(targetId, type, text) {
    let realId = targetId;
    
    // 人物へのエフェクト宛先補正（p-person-zoneへ誘導）
    if (targetId === 'p-person') {
        if (document.getElementById('p-person-zone')) {
            realId = 'p-person-zone'; 
        }
    }
    // フィールドへのエフェクト宛先補正（title属性からdivを探し出してIDを付与）
    else if (targetId === 'p-field') {
        let fieldCard = window.TCG_BATTLE.currentField?.card;
        if (fieldCard) {
            let el = document.querySelector(`div[title="${fieldCard.name}"]`);
            if (el) {
                if (!el.id) el.id = 'p-field-zone';
                realId = el.id;
            }
        }
    }

    return _polish_showVFX.call(this, realId, type, text);
};

// ③ 人物スキル発動時に「一瞬で終わる」のを防ぐため、少しの間（ウェイト）を作る
const _polish_executePersonSkill = window.executePersonSkill;
window.executePersonSkill = function(...args) {
    let isIntercept = args[2];
    let isPlayerTurnAction = window.TCG_BATTLE && !window.TCG_BATTLE.isEnemyTurn && !isIntercept;
    
    if (isPlayerTurnAction) {
        // 自ターンのスキル発動時、1.2秒間だけ他の操作をロックして「演出を見る時間」を作る
        window.TCG_BATTLE.isAnimating = true;
        setTimeout(() => {
            if (window.TCG_BATTLE) window.TCG_BATTLE.isAnimating = false;
        }, 1200);
    }

    // 画面中央に出るログメッセージも少し長めに表示する (1.5秒 -> 2.5秒)
    const origShowMessage = window.showBattleMessage;
    window.showBattleMessage = function(msg, isErr, duration, ...rest) {
        let newDuration = duration === 1500 ? 2500 : duration;
        return origShowMessage.call(this, msg, isErr, newDuration, ...rest);
    };
    
    let ret = _polish_executePersonSkill.apply(this, args);
    
    window.showBattleMessage = origShowMessage; // 関数を元に戻す
    return ret;
};

// ======================================================================
// 🎨 追加ブラッシュアップ：UI更新の最適化 ＆ フィールド破壊処理の実装
// ======================================================================

// ① ご提案いただいた通り、ターン開始演出の「終了直後」にUI更新をねじ込みます！
window.startPlayerTurn = function(isFirstTurn = false) {
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;
    window.TCG_BATTLE.isEnemyTurn = false;

    // ★ 1ターン1回のスキル制限を解除
    if (window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed.player = false;

    if (!isFirstTurn && window.TCG_BATTLE.firstPlayer === 'player') window.TCG_BATTLE.turn++;

    if (p.maxMana < 10) p.maxMana++;
    p.currentMana = p.maxMana; p.actionUsed = false; 
    window.TCG_BATTLE.selectedHandCardIndex = -1; 
    window.TCG_BATTLE.selectedAttackerIndex = -1; 
    
    let drewCard = false;
    if ((!isFirstTurn || window.TCG_BATTLE.firstPlayer === 'cpu') && p.deck.length > 0) {
        p.hand.push(p.deck.shift()); drewCard = true;
    }
    
    p.field.forEach(card => { 
        if(card) {
            card.canAttack = true; 
            card._has_attacked_once = false; 
            card._doubleStrikeUsed = false; // 連撃フラグも解除
        }
    });
    window.renderBattleBoard();

    // アニメーション開始
    window.showTurnCutin(`TURN ${window.TCG_BATTLE.turn}\nYOUR TURN`, "#4CAF50", () => {
        p.field.forEach((c, i) => {
            if (!c || c.isDead) return;
            if (c.ability === "start_draw") {
                if (p.deck.length > 0) p.hand.push(p.deck.shift());
                window.showVFX(`p-card-${i}`, 'heal', 'Draw'); 
            }
            if (c.ability === "infinite_gear") {
                while(p.hand.length < 5 && p.deck.length > 0) p.hand.push(p.deck.shift());
                window.showVFX(`p-card-${i}`, 'heal', 'Draw'); 
            }
            if (c.ability === "star_breath") { p.maxMana = Math.min(10, p.maxMana+2); p.currentMana = Math.min(10, p.currentMana+2); p.hp += 30; window.showVFX('player-face', 'heal', 30); }
            if (c.ability === "heaven_judgement") {
                cpu.hp -= 20; window.showVFX('cpu-face', 'damage', 20);
                cpu.field.forEach((f, fi) => { if(f && !f.isDead){ f.hp -= 20; window.showVFX(`c-card-${fi}`, 'damage', 20); if(window.checkDeath) window.checkDeath(f, cpu, `c-card-${fi}`, p); } });
            }
        });
        cpu.field = cpu.field.filter(c => c && !c.isDead);
        window.renderBattleBoard(); 
        
        if (drewCard) window.showBattleMessage("✨ マナが回復し、カードを1枚引きました！", false, 2000);
        else window.showBattleMessage("✨ マナが回復しました！\n（先攻1ターン目はドローなし）", false, 3500);
        
        window.TCG_BATTLE.isAnimating = false; 
        
        // ★★★ ここです！演出が終わった瞬間に、マナとボタン色を強制更新！ ★★★
        if (window.updatePlayerUI) window.updatePlayerUI();
        window.renderBattleBoard();
    });
};

// ② フィールドカードがHP0以下になった時に「破壊（消去）」する処理を追加
// 巨大な executeCPUTurn 全体を書き換えるのではなく、敵の攻撃（executeAttack）の後に
// フィールドのHPを監視して処理するフックを追加します。
const _orig_executeAttack_FieldCheck = window.executeAttack;
window.executeAttack = function(...args) {
    let ret = _orig_executeAttack_FieldCheck.apply(this, args);
    
    // プレイヤーのフィールド（味方陣地）の破壊チェック
    if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card) {
        if (window.TCG_BATTLE.currentField.card.hp <= 0) {
            let fieldName = window.TCG_BATTLE.currentField.card.name;
            window.showBattleMessage(`💥 フィールド『${fieldName}』が破壊された！`, true, 2000, true);
            if (window.TCG_BATTLE.player.graveyard) window.TCG_BATTLE.player.graveyard.push(window.TCG_BATTLE.currentField.card);
            window.TCG_BATTLE.currentField = null; // 盤面から消す
            if (window.renderBattleBoard) window.renderBattleBoard();
        }
    }

    // 敵のフィールド（相手陣地）の破壊チェック（自分が攻撃して壊した場合）
    if (window.TCG_BATTLE.cpuField && window.TCG_BATTLE.cpuField.card) {
        if (window.TCG_BATTLE.cpuField.card.hp <= 0) {
            let fieldName = window.TCG_BATTLE.cpuField.card.name;
            window.showBattleMessage(`💥 敵のフィールド『${fieldName}』を破壊した！`, false, 2000, true);
            if (window.TCG_BATTLE.cpu.graveyard) window.TCG_BATTLE.cpu.graveyard.push(window.TCG_BATTLE.cpuField.card);
            window.TCG_BATTLE.cpuField = null; // 盤面から消す
            if (window.renderBattleBoard) window.renderBattleBoard();
        }
    }
    
    return ret;
};

// ======================================================================
// 🎨 最終お化粧パッチ（フィールド破壊 ＆ VFX位置補正）
// ======================================================================

// ① フィールドのHP0破壊処理を「盤面が描画されるタイミング」で自動チェック
if (!window._orig_renderBattleBoard_FieldFix) window._orig_renderBattleBoard_FieldFix = window.renderBattleBoard;
window.renderBattleBoard = function() {
    // フィールド破壊判定（プレイヤー）
    if (window.TCG_BATTLE.currentField && window.TCG_BATTLE.currentField.card && window.TCG_BATTLE.currentField.card.hp <= 0) {
        window.showBattleMessage(`💥 フィールド『${window.TCG_BATTLE.currentField.card.name}』が崩壊した！`, true, 2000, true);
        if (window.TCG_BATTLE.player.graveyard) window.TCG_BATTLE.player.graveyard.push(window.TCG_BATTLE.currentField.card);
        window.TCG_BATTLE.currentField = null;
    }
    // フィールド破壊判定（CPU）
    if (window.TCG_BATTLE.cpuField && window.TCG_BATTLE.cpuField.card && window.TCG_BATTLE.cpuField.card.hp <= 0) {
        window.showBattleMessage(`💥 敵のフィールド『${window.TCG_BATTLE.cpuField.card.name}』を破壊した！`, false, 2000, true);
        if (window.TCG_BATTLE.cpu.graveyard) window.TCG_BATTLE.cpu.graveyard.push(window.TCG_BATTLE.cpuField.card);
        window.TCG_BATTLE.cpuField = null;
    }
    return window._orig_renderBattleBoard_FieldFix.apply(this);
};

// ② 人物とフィールドのダメージVFX（数字ポップアップ）の飛び先を強制補正
if (!window._orig_showVFX_TargetFix) window._orig_showVFX_TargetFix = window.showVFX;
window.showVFX = function(targetId, type, text) {
    let realId = targetId;
    
    // 人物カードのID補正（HTMLに存在する 'p-person-zone' に向ける）
    if (targetId === 'p-person') {
        if (document.getElementById('p-person-zone')) realId = 'p-person-zone';
    } else if (targetId === 'c-person') {
        if (document.getElementById('c-person-zone')) realId = 'c-person-zone';
    }
    // フィールドカードのID補正（title属性からdivを探し出してIDを自動付与する）
    else if (targetId === 'p-field') {
        let fieldCard = window.TCG_BATTLE.currentField?.card;
        if (fieldCard) {
            let el = document.querySelector(`div[title="${fieldCard.name}"]`);
            if (el) {
                if (!el.id) el.id = 'p-field-zone';
                realId = el.id;
            }
        }
    } else if (targetId === 'c-field') {
        let fieldCard = window.TCG_BATTLE.cpuField?.card;
        if (fieldCard) {
            let el = document.querySelector(`div[title="${fieldCard.name}"]`);
            if (el) {
                if (!el.id) el.id = 'c-field-zone';
                realId = el.id;
            }
        }
    }
    
    // 補正した正しいIDで本来のVFX関数を呼ぶ
    return window._orig_showVFX_TargetFix.call(this, realId, type, text);
};

// ======================================================================
// 🎨 追加ブラッシュアップ：VFX（ダメージ・回復数字）の消滅防止パッチ
// ======================================================================

const _orig_showVFX_PreventWipe = window.showVFX;
window.showVFX = function(targetId, type, text) {
    let realId = targetId;
    
    // 万が一、インデックスが -1（リーダー等）になっていた場合のフェイルセーフ
    if (realId.includes('-1')) {
        if (realId.startsWith('p-card')) realId = 'player-face';
        if (realId.startsWith('c-card')) realId = 'cpu-face';
    }

    // ★ 修正の肝：演出の消滅防止
    // renderBattleBoard() による盤面リセットでVFXが消し飛ばされるのを防ぐため、
    // 描画が完了した「直後（50ミリ秒後）」にVFXを発生させます。
    setTimeout(() => {
        // 対象の要素が画面に存在する場合のみエフェクトを出す
        if (document.getElementById(realId)) {
            _orig_showVFX_PreventWipe.call(window, realId, type, text);
        } else {
            // 要素が見つからなかった場合のフォールバック（画面中央に出すなど）
            let fallbackId = realId.startsWith('p-') ? 'player-face' : 'cpu-face';
            if (document.getElementById(fallbackId)) {
                 _orig_showVFX_PreventWipe.call(window, fallbackId, type, text);
            }
        }
    }, 50);
};

// ======================================================================
// 👑 追加パッチ：王様のスキル（対象不要化 ＆ 完全手動エフェクト）
// ======================================================================

// ① 王様のスキルが選ばれたら、UIを出さずに即時発動させる
const _king_openPersonSkillTarget = window.openPersonSkillTarget;
window.openPersonSkillTarget = function(skillIndex, cost) {
    const personCard = window.TCG_BATTLE.currentPerson ? (window.TCG_BATTLE.currentPerson.player || window.TCG_BATTLE.currentPerson) : null;
    if (personCard) {
        const mData = window.TCG_MASTER[personCard.masterId] || {};
        const skill = (mData.personSkills || mData.skills || [])[skillIndex];
        
        // 王様のスキルなら、ターゲット選択UIをスキップして発動へ進む
        if (skill && (skill.name === "王の号令" || skill.name === "王の裁き")) {
            if (window.TCG_BATTLE.player.currentMana < cost) { window.showBattleMessage("⚠️ マナが足りません！", true); return; }
            if (window.TCG_BATTLE.personSkillUsed && window.TCG_BATTLE.personSkillUsed.player) {
                window.showBattleMessage("⚠️ スキルは1ターンに1回しか使えません！", true); return;
            }
            window.showBattleMessage(`🧑 [プレイヤーログ] 王様のスキル即発動: ${skill.name}`, false, 0, true);
            window.executePersonSkill(skillIndex, null, !!window.TCG_BATTLE.isEnemyTurn, false);
            return;
        }
    }
    // それ以外のスキルは今までの処理にお任せ
    return _king_openPersonSkillTarget.apply(this, arguments);
};

// ② 王様のスキル効果を安全に手動で適用し、VFXを出す
const _king_executePersonSkill = window.executePersonSkill;
window.executePersonSkill = function(...args) {
    let skillIndex = args[0]; let isIntercept = args[2];
    const personCard = window.TCG_BATTLE.currentPerson ? (window.TCG_BATTLE.currentPerson.player || window.TCG_BATTLE.currentPerson) : null;
    const mData = personCard ? (window.TCG_MASTER[personCard.masterId] || {}) : {};
    const skill = (mData.personSkills || mData.skills || [])[skillIndex];

    let isPlayerSkill = !window.TCG_BATTLE.isEnemyTurn || isIntercept;

    // 王様のスキルなら、エンジンを無視してここで完璧に処理する
    if (skill && isPlayerSkill && (skill.name === "王の号令" || skill.name === "王の裁き")) {
        const p = window.TCG_BATTLE.player;
        const cpu = window.TCG_BATTLE.cpu;
        
        let res = null;
        if (window.TCG_BATTLE.isEnemyTurn && isIntercept) {
            res = window.TCG_BATTLE.inputResolve || window.TCG_BATTLE.interceptResolve;
            window.TCG_BATTLE.inputResolve = null; window.TCG_BATTLE.interceptResolve = null; window.TCG_BATTLE.awaitingInput = null;
        }

        // 王の号令：味方全員の攻撃力+10
        if (skill.name === "王の号令") {
            p.field.forEach((c, i) => { 
                if (c && !c.isDead) {
                    c.damage += 10; 
                    window.showVFX(`p-card-${i}`, 'buff', '+10'); 
                }
            });
            window.showBattleMessage("👑 王の号令！味方全員の攻撃力が10アップ！", false, 2000);
        } 
        // 王の裁き：HP40以下の敵を全滅させる
        else if (skill.name === "王の裁き") {
            let destroyedCount = 0;
            cpu.field.forEach((c, i) => { 
                if (c && !c.isDead && c.hp <= 40) {
                    c.hp = 0; 
                    window.showVFX(`c-card-${i}`, 'damage', '破壊'); 
                    if (window.checkDeath) window.checkDeath(c, cpu, `c-card-${i}`, p);
                    destroyedCount++;
                }
            });
            if (destroyedCount > 0) {
                window.showBattleMessage(`⚔️ 王の裁き！ ${destroyedCount}体の敵を一掃した！`, false, 2500);
            } else {
                window.showBattleMessage("⚔️ 王の裁き！ だが条件を満たす敵はいなかった...", false, 2000);
            }
        }

        // マナ消費と使用済みフラグの処理
        let costVal = parseInt(skill.cost) || 0;
        if (p.currentMana >= costVal) p.currentMana -= costVal;
        if (!window.TCG_BATTLE.personSkillUsed) window.TCG_BATTLE.personSkillUsed = {};
        window.TCG_BATTLE.personSkillUsed.player = true;
        if (window.updatePlayerUI) window.updatePlayerUI();
        window.renderBattleBoard();

        if (res) {
            setTimeout(() => { window.TCG_BATTLE.isEnemyTurn = true; window.TCG_BATTLE.isAnimating = true; res('used'); }, 800);
        }
        return; // 処理が終わったのでエンジンには渡さず終了
    }

    // 王様以外のスキルは今まで通り処理
    return _king_executePersonSkill.apply(this, args);
};

// ======================================================================
// 🎰 最終お化粧パッチ v3：フィールド効果（カジノ等）＆ 永続守護の復旧
// ======================================================================

// CPUターン用の横入りフック（最新のexecuteCPUTurnを包み込む）
const _hook_executeCPUTurn_Field = window.executeCPUTurn;
window.executeCPUTurn = async function(isFirstTurn = false) {
    window.TCG_BATTLE.isEnemyTurn = true; 
    
    // フィールド効果（プレイヤー終了時 → CPU開始時）
    if (window.triggerFieldEffects) {
        if (!isFirstTurn) await window.triggerFieldEffects("end", true); 
        await window.triggerFieldEffects("start", false); 
    }
    
    // バグ修正済みの最新CPUターン処理へ
    await _hook_executeCPUTurn_Field.call(this, isFirstTurn);
};

// プレイヤーターン用の横入りフック（最新のstartPlayerTurnを包み込む）
const _hook_startPlayerTurn_Field = window.startPlayerTurn;
window.startPlayerTurn = async function(isFirstTurn = false) {
    // フィールド効果（CPU終了時）
    if (window.triggerFieldEffects) {
        if (!isFirstTurn) await window.triggerFieldEffects("end", false); 
    }
    
    // バグ修正済みの最新プレイヤーターン処理（ドローやカットイン演出）を実行
    let ret = _hook_startPlayerTurn_Field.call(this, isFirstTurn);
    
    // 永続守護の維持
    if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
        window.TCG_BATTLE.player.field.forEach(c => {
            if (c && c.hasPermanentTaunt) c.isDefending = true;
        });
    }
    
    // フィールド効果（プレイヤー開始時：カジノのギャンブル等）
    if (window.triggerFieldEffects) {
        window.TCG_BATTLE.isEnemyTurn = true; // 演出中の操作ブロック
        await window.triggerFieldEffects("start", true); 
        window.TCG_BATTLE.isEnemyTurn = false; // 操作ブロック解除
        
        // ギャンブル等の結果を画面に反映させる
        if (window.updatePlayerUI) window.updatePlayerUI();
        if (window.renderBattleBoard) window.renderBattleBoard();
    }
    
    return ret;
};

// ======================================================================
// 🎨 追加パッチ：突貫工事VFX宛先強制補正（タイマー割り込み）
// ======================================================================

const _hook_showVFX_FinalTiming = window.showVFX;
window.showVFX = function(targetId, type, text) {
    let newTargetId = targetId;
    
    // インデックスバグ対策（-1リーダー等）
    if (newTargetId.includes('-1')) {
        newTargetId = newTargetId.startsWith('p-card') ? 'player-face' : 'cpu-face';
    }

    // ★ 演出消滅防止タイマーの中身を完全に上書き
    setTimeout(() => {
        // --- タイマー発動の瞬間(0.05秒後)に、宛先を強制再計算する ---

        // 人物へのエフェクト宛先補正（HTMLに存在するゾーンIDへ）
        if (targetId === 'p-person' && document.getElementById('p-person-zone')) {
            newTargetId = 'p-person-zone'; 
        } else if (targetId === 'c-person' && document.getElementById('c-person-zone')) {
            newTargetId = 'c-person-zone';
        }
        
        // フィールドへのエフェクト宛先補正（title属性からdivを探し出してIDを自動付与）
        if (targetId === 'p-field') {
            let fieldCard = window.TCG_BATTLE.currentField?.card;
            if (fieldCard) {
                let el = document.querySelector(`div[title="${fieldCard.name}"]`);
                if (el) {
                    if (!el.id) el.id = 'p-field-zone';
                    newTargetId = el.id;
                }
            }
        } else if (targetId === 'c-field') {
            let fieldCard = window.TCG_BATTLE.cpuField?.card;
            if (fieldCard) {
                let el = document.querySelector(`div[title="${fieldCard.name}"]`);
                if (el) {
                    if (!el.id) el.id = 'c-field-zone';
                    newTargetId = el.id;
                }
            }
        }

        // --- 最終決定されたターゲットにエフェクトを出す ---
        if (document.getElementById(newTargetId)) {
            // 元のエフェクト再生関数を呼ぶ
            _orig_showVFX_PreventWipe.call(window, newTargetId, type, text);
        } else {
            // 要素がなければプレイヤー/CPUのリーダー位置へフォールバック
            let fallbackId = newTargetId.startsWith('p-') ? 'player-face' : 'cpu-face';
            if (document.getElementById(fallbackId)) {
                _orig_showVFX_PreventWipe.call(window, fallbackId, type, text);
            }
        }
    }, 50); // 演出消滅防止タイマーと同じ時間(50ミリ秒)を維持
};

// ======================================================================
// 🎖️ 追加ブラッシュアップ：隊長・鍛冶師スキルのバッジ即時反映パッチ
// ======================================================================
console.log("🎖️ バッジ即時反映パッチを適用中...");

const _hook_executePersonSkill_Badges = window.executePersonSkill;
window.executePersonSkill = function(...args) {
    let skillIndex = args[0]; let targetCard = args[1]; let isIntercept = args[2];
    const p = window.TCG_BATTLE.player;
    
    // 現在の人物カードとスキルを特定
    const getPersonCard = () => {
        if (!window.TCG_BATTLE || !window.TCG_BATTLE.currentPerson) return null;
        if (window.TCG_BATTLE.currentPerson.player) return window.TCG_BATTLE.currentPerson.player;
        if (window.TCG_BATTLE.currentPerson.masterId) return window.TCG_BATTLE.currentPerson;
        return null;
    };
    const personCard = getPersonCard(); 
    const mData = personCard ? (window.TCG_MASTER[personCard.masterId] || {}) : {};
    const skill = (mData.personSkills || mData.skills || [])[skillIndex];
    let isPlayerSkill = !window.TCG_BATTLE.isEnemyTurn || isIntercept;

    // ★ スキル実行前に、バッジのデータを確実に付与しておく
    if (skill && isPlayerSkill && p) {
        if (skill.name === "総員突撃") {
            p.field.forEach(c => { 
                if(c && !c.isDead) {
                    c.badges = c.badges || [];
                    if (!c.badges.includes("連撃")) c.badges.push("連撃");
                }
            });
        }
        else if (skill.name === "会心の武具" && targetCard) {
            targetCard.badges = targetCard.badges || [];
            if (!targetCard.badges.includes("貫通")) targetCard.badges.push("貫通");
        }
        else if (skill.name === "即席バリケード" && targetCard) {
            // ついでに建築士の守護もバッジ化しておきます
            targetCard.badges = targetCard.badges || [];
            if (!targetCard.badges.includes("守護")) targetCard.badges.push("守護");
        }
    }

    // 本来の手動スキル処理を実行
    let ret = _hook_executePersonSkill_Badges.apply(this, args);

    // ★ スキル実行後、少し待ってから確実に盤面を再描画してバッジをUIに反映
    if (isPlayerSkill && p) {
        setTimeout(() => {
            if (window.renderBattleBoard) window.renderBattleBoard();
            // ボタンの色の時と同じく、念のための画面更新シグナル
            window.dispatchEvent(new Event('resize'));
        }, 150);
    }

    return ret;
};

// ======================================================================
// 🎖️ 最終お化粧パッチ v7：バッジ可視化（後付けバフのみ表示するスマート版）
// ======================================================================

const _orig_renderBattleBoard_CleanBadges = window.renderBattleBoard;
window.renderBattleBoard = function() {
    let ret = _orig_renderBattleBoard_CleanBadges.apply(this, arguments);
    
    setTimeout(() => {
        const drawStatusBadges = (field, prefix) => {
            if (!field) return;
            field.forEach((card, i) => {
                if (!card || card.isDead) return;
                
                let el = document.getElementById(`${prefix}-card-${i}`);
                if (!el) return;
                
                let activeBadges = [];
                
                // マスターデータ（カードの元々の情報）を取得
                let mData = window.TCG_MASTER[card.masterId] || {};
                let baseAbility = mData.ability || "";
                let baseDmg = parseInt(mData.damage !== undefined ? mData.damage : (mData.attack !== undefined ? mData.attack : card.damage));
                
                // ⚔️ 連撃の判定（元々「連撃」を持っている場合はバッジを表示しない）
                let isNativeDoubleStrike = (baseAbility === 'double_strike');
                let hasBuffDoubleStrike = card.hasDoubleStrike || card.status === 'double_strike' || (card.badges && (card.badges.includes("連撃") || card.badges.includes("総員突撃")));
                if (hasBuffDoubleStrike && !isNativeDoubleStrike) {
                    activeBadges.push({text: "⚔️ 連撃", color: "#FF9800"});
                }
                
                // 💥 貫通の判定（元々「貫通系」の能力を持っている場合はバッジを表示しない）
                let isNativePierce = (baseAbility === 'pierce_recoil' || baseAbility === 'flight' || baseAbility === 'god_strike' || baseAbility === 'dimension_drill' || baseAbility === 'piercing_juggernaut');
                let hasBuffPierce = (card.ability === "pierce_recoil" && !isNativePierce) || (card.badges && card.badges.includes("貫通"));
                if (hasBuffPierce) {
                    activeBadges.push({text: "💥 貫通", color: "#E91E63"});
                }
                
                // 🔥 強化の判定（元々の攻撃力より高くなっている場合のみ表示）
                if (parseInt(card.damage) > baseDmg || (card.badges && card.badges.includes("研磨"))) {
                    activeBadges.push({text: "🔥 強化", color: "#4CAF50"});
                }

                // 古いバッジのお掃除
                let oldContainer = document.getElementById(`${prefix}-card-${i}-custom-vbadges`);
                if (oldContainer) oldContainer.remove();

                // 新しく付与
                if (activeBadges.length > 0) {
                    let container = document.createElement('div');
                    container.id = `${prefix}-card-${i}-custom-vbadges`;
                    container.style.cssText = "position:absolute; top:-15px; left:-15px; display:flex; flex-direction:column; gap:5px; z-index:999; pointer-events:none;";
                    
                    container.innerHTML = activeBadges.map(b => 
                        `<div style="background:${b.color}; color:#fff; font-size:12px; font-weight:bold; padding:4px 8px; border-radius:6px; border:2px solid #fff; box-shadow:0 3px 6px rgba(0,0,0,0.6); text-shadow:1px 1px 0 #000; letter-spacing: 1px;">${b.text}</div>`
                    ).join('');
                    
                    el.appendChild(container);
                }
            });
        };
        
        if (window.TCG_BATTLE) {
            drawStatusBadges(window.TCG_BATTLE.player?.field, 'p');
            drawStatusBadges(window.TCG_BATTLE.cpu?.field, 'c');
        }
    }, 50);

    return ret;
};

// ======================================================================
// 🎵 TCG 動的サウンド ＆ 一元化リザルトUI 統合パッチ
// ======================================================================

// ① カジノ入室時のロビーBGM再生（フック）
const _orig_openCasino_bgm = window.openCasino;
window.openCasino = function() {
    if (_orig_openCasino_bgm) _orig_openCasino_bgm.apply(this, arguments);
    if (window.audioManager) window.audioManager.playBGM('card_lobby');
};

// ② ご提示いただいた退出処理（育成BGMへの復帰を追加）
window.exitCasino = function() {
    const casinoUI = document.getElementById('casino-lobby-ui');
    if (casinoUI) casinoUI.style.display = 'none';
    
    // ★ BGMを育成モードの曲に戻す
    if (window.audioManager) window.audioManager.restoreMainBGM();
    
    if (window.aiPet && window.aiPet.indoorTarget && window.aiPet.indoorTarget.type === 'casino') {
        window.aiPet.actionState = 'exiting';
        window.aiPet.isIndoors = false;
        window.aiPet.interactionTarget = null;
        window.aiPet.indoorTarget = null;
        window.aiPet.visualAction = null;
        window.aiPet.message = "カジノから出たよ！";
        window.aiPet.messageTimer = 120;
        
        if (window.aiPet.schedule && window.aiPet.schedule.length > 0) {
            window.aiPet.schedule.shift(); 
        }
        if (typeof window.updateScheduleList === 'function') {
            window.updateScheduleList();
        }
    }
};

// ③ デッキ編成画面のBGM再生
const _orig_openDeckBuilder_bgm = window.openDeckBuilder;
window.openDeckBuilder = function() {
    if (window.audioManager) window.audioManager.playBGM('card_deck_build');
    if (_orig_openDeckBuilder_bgm) _orig_openDeckBuilder_bgm.apply(this, arguments);
};

// ④ バトル開始時のBGM再生とフラグ初期化
const _orig_startBattle_bgm = window.startBattle;
// ======================================================================
// 🎵 TCG 進行・BGM制御 修正パッチ (デッキ選択バグ修正版)
// ======================================================================

// ④ バトル開始処理の修正（BGMのタイミングとキャンセルの遷移）
window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    if (selectedDeckIndex === -1) {
        // --- 1. デッキ選択画面（モーダル）を表示するフェーズ ---
        let modal = document.getElementById('tcg-deck-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tcg-deck-select-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:55000; display:flex; justify-content:center; align-items:center;`;
            document.body.appendChild(modal);
        }
        
        window._tempEnemyData = enemyData;
        
        let html = `
            <div style="background:#222; border:3px solid #4CAF50; border-radius:12px; padding:30px; width:550px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#4CAF50; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🛡️ 使用するデッキを選択</h2>
                <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
        `;
        
        for (let i = 0; i < 3; i++) {
            let deck = window.TCG.decks[i] || [];
            let isValid = deck.length >= 60;
            let dName = window.TCG.deckNames ? window.TCG.deckNames[i] : `デッキ ${i + 1}`;
            let bg = isValid ? '#333' : '#222';
            let color = isValid ? '#FFF' : '#666';
            
            html += `
                <div style="display:flex; gap:10px;">
                    <button onclick="if(${isValid}) { document.getElementById('tcg-deck-select-modal').style.display='none'; window.startBattle(window._tempEnemyData, ${i}); }" 
                            style="flex:1; padding:15px; background:${bg}; color:${color}; border:2px solid ${isValid ? '#4CAF50' : '#444'}; border-radius:8px; font-size:18px; font-weight:bold; cursor:${isValid ? 'pointer' : 'not-allowed'}; transition:0.2s;">
                        ${dName} ${isValid ? `(${deck.length}枚)` : '(未編成)'}
                    </button>
                    <button onclick="window.showDeckDetailModal(${i})" style="padding:15px 20px; background:#2196F3; color:#fff; border:2px solid #1976D2; border-radius:8px; font-weight:bold; cursor:pointer;">詳細 🔍</button>
                </div>
            `;
        }
    
        html += `
                </div>
                <button onclick="window.cancelDeckSelection()" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
            </div>
        `;
        
        modal.innerHTML = html;
        modal.style.display = 'flex';
        
        // ★ デッキ選択中はBGMを切り替えない（ロビーBGMを継続させるため、ここで return）
        return;
    }
    
    // --- 2. デッキが選ばれ、実際にバトルを開始するフェーズ ---
    // ここで初めてBGMを切り替える
    if (window.audioManager) {
        window.audioManager.playBGM('card_main');
    }

    // 既存のバトル初期化ロジックを実行
    const p = window.TCG_BATTLE ? window.TCG_BATTLE.player : null;
    if (p) {
        // デッキの入れ替えなどの既存処理...
        let tempDeck0 = window.TCG.decks[0];
        window.TCG.decks[0] = window.TCG.decks[selectedDeckIndex];
        
        // 元のバトル開始処理（もし _coreStartBattle2 などがあれば）を呼ぶ
        if (window._coreStartBattle2) window._coreStartBattle2(enemyData);
        
        window.TCG.decks[0] = tempDeck0; // 戻しておく
        if (window.TCG_BATTLE) {
            window.TCG_BATTLE.isEnded = false;
            window.TCG_BATTLE.battleLog = [];
        }
    }
};

// ★新機能：デッキ選択をキャンセルしてロビーに戻る
window.cancelDeckSelection = function() {
    // 選択画面を閉じる
    let modal = document.getElementById('tcg-deck-select-modal');
    if (modal) modal.style.display = 'none';

    // カジノロビーを再表示
    let lobby = document.getElementById('casino-lobby-ui');
    if (lobby) {
        lobby.style.display = 'flex';
        // BGMを念のためロビーに戻す（継続しているはずですが、確実にするため）
        if (window.audioManager) window.audioManager.playBGM('card_lobby');
    }
};

// ⑤ 盤面更新時の状況監視（ピンチ・チャンス・勝敗一元管理）
const _orig_renderBattleBoard_bgm = window.renderBattleBoard;
window.renderBattleBoard = function() {
    if (_orig_renderBattleBoard_bgm) _orig_renderBattleBoard_bgm.apply(this, arguments);

    if (!window.TCG_BATTLE || window.TCG_BATTLE.isEnded) return;

    const p = window.TCG_BATTLE.player;
    const cpu = window.TCG_BATTLE.cpu;

    // 1. 動的BGM（ピンチ・チャンス）の切り替え
    if (p.hp > 0 && cpu.hp > 0 && window.audioManager) {
        let targetBGM = 'card_main';
        if (cpu.hp < 50) targetBGM = 'card_chance'; // チャンス優先
        else if (p.hp < 50) targetBGM = 'card_pinch';

        if (window.audioManager.currentBGMType !== targetBGM) {
            window.audioManager.playBGM(targetBGM);
        }
    }

    // 2. 勝敗の一元監視とリザルトUIの呼び出し
    if (p.hp <= 0) {
        window.endTCGBattle(false);
    } else if (cpu.hp <= 0) {
        window.endTCGBattle(true);
    }
};

// ⑥ 独立したリザルトUIの生成とBGM再生
window.endTCGBattle = function(isWin) {
    if (window.TCG_BATTLE.isEnded) return;
    window.TCG_BATTLE.isEnded = true;

    // ★ 勝利/敗北BGMの再生
    if (window.audioManager) {
        window.audioManager.playBGM(isWin ? 'card_victory' : 'card_lose');
    }

    // ★修正：ID変更ハックはBGM誤作動の原因だったため廃止！
    // 代わりに、CSSの !important を使って、古いタイマーによる画面消去を強制ブロックします。
    let battleUI = document.getElementById('tcg-battle-ui');
    if (battleUI) {
        battleUI.style.setProperty('display', 'flex', 'important');
    }

    // 1.5秒後（最後のダメージ演出を見せた後）にリザルトUIをポップアップ
    setTimeout(() => {
        let resultUI = document.createElement('div');
        resultUI.id = 'tcg-result-ui';
        resultUI.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); z-index: 70000;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.5s ease;
        `;
        
        let titleColor = isWin ? '#FFD700' : '#f44336';
        let titleText = isWin ? '🎉 YOU WIN!!' : '💀 YOU LOSE...';
        let subText = isWin ? '見事、相手のHPを0にしました！' : '無念...プレイヤーのHPが尽きました。';

        resultUI.innerHTML = `
            <div style="background: #2a2a2a; border: 4px solid ${titleColor}; border-radius: 12px; padding: 40px; width: 500px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transform: scale(0.9); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <h1 style="color: ${titleColor}; font-size: 40px; margin-top: 0; text-shadow: 0 0 20px ${titleColor};">${titleText}</h1>
                <p style="font-size: 18px; color: #ddd; margin-bottom: 40px;">${subText}</p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="window.closeTCGBattle('lobby')" style="padding: 15px; font-size: 18px; font-weight: bold; background: #2196F3; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎰 カジノロビーに戻る
                    </button>
                    <button onclick="window.closeTCGBattle('field')" style="padding: 15px; font-size: 18px; font-weight: bold; background: #4CAF50; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🏝️ 島（育成画面）に戻る
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(resultUI);
        
        setTimeout(() => {
            resultUI.style.opacity = '1';
            resultUI.firstElementChild.style.transform = 'scale(1)';
        }, 50);

    }, 1500); 
};

// ⑦ リザルト画面からの遷移処理
window.closeTCGBattle = function(destination) {
    let resultUI = document.getElementById('tcg-result-ui');
    if (resultUI) resultUI.remove();

    // ★修正：バトル画面を閉じる（!important 指定を解除して確実に消す）
    let battleUI = document.getElementById('tcg-battle-ui');
    if (battleUI) {
        battleUI.style.removeProperty('display');
        battleUI.style.display = 'none';
    }

    if (destination === 'lobby') {
        // カジノロビーに戻る
        if (window.audioManager) window.audioManager.playBGM('card_lobby');
        let casinoUI = document.getElementById('casino-lobby-ui');
        if (casinoUI) casinoUI.style.display = 'flex';
    } else {
        // 島に戻る (退出処理を呼ぶことでメインBGMに戻り、AIも行動を再開する)
        window.exitCasino(); 
    }
};

// ⑧ （おまけ）音楽館の曲名登録
if (window.audioManager && typeof window.openMusicHall !== 'undefined') {
    const _orig_openMusicHall = window.openMusicHall;
    window.openMusicHall = function() {
        // もし specialTracks が定義されている場所があれば、そこに曲名を追加しておくための備忘録
        // 実際には system.js 側に書き込まれているため、ここでは何もしなくてOKです
        _orig_openMusicHall.apply(this, arguments);
    };
}

// ======================================================================
// 🛠️ TCG デッキ選択画面のBGM消失 ＆ 表示バグ 完全修復パッチ
// ======================================================================

// 大元のバトル開始関数を安全に保護して退避
if (!window._ultimate_coreStartBattle) {
    window._ultimate_coreStartBattle = window._coreStartBattle2 || window.startBattle;
}

window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    let lobby = document.getElementById('casino-lobby-ui');
    
    // --- 1. デッキ選択フェーズ ---
    if (selectedDeckIndex === -1) {
        // ★重要：デッキ選択画面では、カジノロビーを消さずに裏に残しておく！
        // これにより、システムが「外に出た」と誤認して育成BGMを鳴らすのを防ぎます。
        if (lobby) lobby.style.display = 'flex'; 
        
        let modal = document.getElementById('tcg-deck-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tcg-deck-select-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:55000; display:flex; justify-content:center; align-items:center;`;
            document.body.appendChild(modal);
        }
        
        window._tempEnemyData = enemyData;
        
        let html = `
            <div style="background:#222; border:3px solid #4CAF50; border-radius:12px; padding:30px; width:550px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#4CAF50; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🛡️ 使用するデッキを選択</h2>
                <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
        `;
        
        for (let i = 0; i < 3; i++) {
            let deck = window.TCG.decks[i] || [];
            let isValid = deck.length >= 60;
            let dName = window.TCG.deckNames ? window.TCG.deckNames[i] : `デッキ ${i + 1}`;
            let bg = isValid ? '#333' : '#222';
            let color = isValid ? '#FFF' : '#666';
            
            html += `
                <div style="display:flex; gap:10px;">
                    <button onclick="if(${isValid}) { window.startBattle(window._tempEnemyData, ${i}); }" 
                            style="flex:1; padding:15px; background:${bg}; color:${color}; border:2px solid ${isValid ? '#4CAF50' : '#444'}; border-radius:8px; font-size:18px; font-weight:bold; cursor:${isValid ? 'pointer' : 'not-allowed'}; transition:0.2s;">
                        ${dName} ${isValid ? `(${deck.length}枚)` : '(未編成)'}
                    </button>
                    <button onclick="window.showDeckDetailModal(${i})" style="padding:15px 20px; background:#2196F3; color:#fff; border:2px solid #1976D2; border-radius:8px; font-weight:bold; cursor:pointer;">詳細 🔍</button>
                </div>
            `;
        }
    
        // ★修正：キャンセルボタン専用の関数を呼ぶように変更
        html += `
                </div>
                <button onclick="window.cancelDeckSelection()" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
            </div>
        `;
        
        modal.innerHTML = html;
        modal.style.display = 'flex';
        
        // ロビーBGMを強制維持
        if (window.audioManager) window.audioManager.playBGM('card_lobby');
        return;
    }
    
    // --- 2. バトル開始フェーズ ---
    // ★ デッキが選ばれ、本当にバトルが始まる瞬間に初めてカジノロビーと選択画面を消す！
    if (lobby) lobby.style.display = 'none'; 
    
    let modal = document.getElementById('tcg-deck-select-modal');
    if (modal) modal.style.display = 'none';
    
    // TCGバトル用BGM開始
    if (window.audioManager) window.audioManager.playBGM('card_main');
    
    // デッキの入れ替え
    let tempDeck0 = window.TCG.decks[0];
    let tempCurrentIdx = window.TCG.currentDeckIndex;
    window.TCG.currentDeckIndex = selectedDeckIndex;
    window.TCG.decks[0] = window.TCG.decks[selectedDeckIndex];
    
    // バトル情報の初期化
    if (!window.TCG_BATTLE) window.TCG_BATTLE = {};
    window.TCG_BATTLE.battleLog = [];
    window.TCG_BATTLE.isEnded = false;
    
    // 大元のバトル開始関数を呼ぶ
    window._ultimate_coreStartBattle(enemyData, selectedDeckIndex);
    
    // 入れ替えたデッキを元に戻す
    window.TCG.currentDeckIndex = tempCurrentIdx;
    window.TCG.decks[0] = tempDeck0;
};

// ★新設：キャンセルボタンを押した時の安全な処理
window.cancelDeckSelection = function() {
    let modal = document.getElementById('tcg-deck-select-modal');
    if (modal) modal.style.display = 'none';
    
    // カジノロビーを確実に表示状態にし、BGMもロビー用を維持する
    let lobby = document.getElementById('casino-lobby-ui');
    if (lobby) lobby.style.display = 'flex';
    
    if (window.audioManager) window.audioManager.playBGM('card_lobby');
};

// ======================================================================
// 🛠️ TCG デッキ選択・BGM・表示バグ 最終修復パッチ
// ======================================================================

// 1. カジノロビーを開く処理を上書き（ボタンを押してもロビーを消さないようにする！）
const _orig_openCasino_Final = window.openCasino;
window.openCasino = function() {
    // 既存のオープン処理を実行
    if (_orig_openCasino_Final) _orig_openCasino_Final.apply(this, arguments);

    let casinoUI = document.getElementById('casino-lobby-ui');
    if (casinoUI) {
        // ロビーのボタンから「display='none'」を削除して、画面が消えないようにするハック
        casinoUI.innerHTML = casinoUI.innerHTML.replace(/document\.getElementById\('casino-lobby-ui'\)\.style\.display='none';\s*/g, '');
    }
};

// 2. キャンセル時の処理（モーダルを消すだけ。ロビーは裏にあるのでそのまま表示される）
window.cancelDeckSelection = function() {
    let modal = document.getElementById('tcg-deck-select-modal');
    if (modal) modal.style.display = 'none';
};

// 3. バトル開始処理の「完全版」で全てを上書きし、過去のバグを吹き飛ばす！
window.startBattle = function(enemyData = null, selectedDeckIndex = -1) {
    let lobby = document.getElementById('casino-lobby-ui');
    
    // --- 【フェーズ1】デッキ選択画面の表示 ---
    if (selectedDeckIndex === -1) {
        // ★ ここではロビーも消さないし、BGMも変えない！
        let modal = document.getElementById('tcg-deck-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'tcg-deck-select-modal';
            modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:55000; display:flex; justify-content:center; align-items:center;`;
            document.body.appendChild(modal);
        }
        window._tempEnemyData = enemyData;
        let html = `
            <div style="background:#222; border:3px solid #4CAF50; border-radius:12px; padding:30px; width:550px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#4CAF50; margin-top:0; border-bottom:2px solid #444; padding-bottom:10px;">🛡️ 使用するデッキを選択</h2>
                <div style="display:flex; flex-direction:column; gap:15px; margin:20px 0;">
        `;
        for (let i = 0; i < 3; i++) {
            let deck = window.TCG.decks[i] || [];
            let isValid = deck.length >= 60;
            let dName = window.TCG.deckNames ? window.TCG.deckNames[i] : `デッキ ${i + 1}`;
            let bg = isValid ? '#333' : '#222';
            let color = isValid ? '#FFF' : '#666';
            let cursor = isValid ? 'pointer' : 'not-allowed';
            html += `
                <div style="display:flex; gap:10px;">
                    <button onclick="if(${isValid}) { document.getElementById('tcg-deck-select-modal').style.display='none'; window.startBattle(window._tempEnemyData, ${i}); }" 
                            style="flex:1; padding:15px; background:${bg}; color:${color}; border:2px solid ${isValid ? '#4CAF50' : '#444'}; border-radius:8px; font-size:18px; font-weight:bold; cursor:${cursor}; transition:0.2s;"
                            onmouseover="if(${isValid}) this.style.transform='scale(1.02)'" onmouseout="if(${isValid}) this.style.transform='scale(1)'">
                        ${dName} ${isValid ? `(${deck.length}枚)` : '(未編成)'}
                    </button>
                    <button onclick="window.showDeckDetailModal(${i})" style="padding:15px 20px; background:#2196F3; color:#fff; border:2px solid #1976D2; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">詳細 🔍</button>
                </div>
            `;
        }
        html += `
                </div>
                <button onclick="window.cancelDeckSelection()" style="padding:10px 30px; font-size:16px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
            </div>
        `;
        modal.innerHTML = html;
        modal.style.display = 'flex';
        return; 
    }
    
    // --- 【フェーズ2】実際のバトル開始 ---
    // ★ デッキが決まった「今」、初めてロビーを消してBGMを鳴らす！
    if (lobby) lobby.style.display = 'none';
    if (window.audioManager) window.audioManager.playBGM('card_main');

    let deckIdx = selectedDeckIndex;
    if (!window.TCG.decks[deckIdx] || window.TCG.decks[deckIdx].length < 60) return;

    window.TCG_BATTLE = {
        player: { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        cpu:    { hp: 200, maxMana: 0, currentMana: 0, deck: [], hand: [], field: [], actionUsed: false, graveyard: [] },
        turn: 1, selectedAttackerIndex: -1, selectedHandCardIndex: -1, _skipDefendHint: false,
        currentField: null, targetingHandIndex: -1,
        firstPlayer: 'player', isEnemyTurn: false, isAnimating: true, isAuto: false,
        battleLog: [], isEnded: false
    };
    const p = window.TCG_BATTLE.player; const cpu = window.TCG_BATTLE.cpu;

    let battleUI = document.getElementById('tcg-battle-ui');
    if (!battleUI) {
        battleUI = document.createElement('div');
        battleUI.id = 'tcg-battle-ui';
        battleUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #2a2a2a; z-index: 20000; display: flex; flex-direction: column; font-family: sans-serif; color: white; overflow: hidden;`;
        document.body.appendChild(battleUI);
    }

    // デッキ構築・シャッフル
    p.deck = window.TCG.decks[deckIdx].map(uid => {
        const originalCard = window.TCG.myCollection.find(c => c.uid === uid);
        if (!originalCard) return null;
        let cardCopy = JSON.parse(JSON.stringify(originalCard));
        let master = window.TCG_MASTER[cardCopy.masterId];
        if (master) { cardCopy.hp = Math.max(cardCopy.hp, master.baseHp); cardCopy.evolvesFrom = master.evolvesFrom; }
        cardCopy.maxHp = cardCopy.hp; cardCopy.isDead = false; cardCopy.canAttack = false; cardCopy.isDefending = false; cardCopy.status = null;
        return cardCopy;
    }).filter(c => c !== null);
    window.shuffleArray(p.deck);

    if (enemyData && enemyData.deck) {
        cpu.deck = enemyData.deck.map((dCard, i) => {
            let master = window.TCG_MASTER[dCard.masterId];
            if(!master) return null;
            return {
                uid: 'ghost_' + i, masterId: dCard.masterId, name: dCard.name || master.name, type: master.type,
                cost: master.baseCost, hp: dCard.hp || master.baseHp, maxHp: dCard.hp || master.baseHp,
                skillName: master.skillName, skillCost: master.skillCost, damage: dCard.damage || master.baseDmg, 
                ability: master.ability, image: master.image, imageIndex: master.imageIndex,
                offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null, evolvesFrom: master.evolvesFrom
            };
        }).filter(c => c !== null);
        if(cpu.deck.length < 60) { alert("敵のデッキデータが不完全です。通常のCPUと対戦します。"); enemyData = null; } 
        else { window.shuffleArray(cpu.deck); }
    } 
    if (!enemyData || !enemyData.deck) {
        const allMasterKeys = Object.keys(window.TCG_MASTER);
        for (let i = 0; i < Math.max(60, p.deck.length); i++) {
            let randomKey = allMasterKeys[Math.floor(Math.random() * allMasterKeys.length)];
            let master = window.TCG_MASTER[randomKey];
            cpu.deck.push({
                uid: 'cpu_' + i, masterId: randomKey, name: master.name, type: master.type, cost: master.baseCost, hp: master.baseHp, maxHp: master.baseHp, skillName: master.skillName, skillCost: master.skillCost, damage: master.baseDmg, ability: master.ability, image: master.image, imageIndex: master.imageIndex, offsetX: master.offsetX, offsetY: master.offsetY, zoomX: master.zoomX, zoomY: master.zoomY, canAttack: false, isDefending: false, status: null, evolvesFrom: master.evolvesFrom
            });
        }
    }

    window.renderBattleBoard();

    let cpuNameLabel = document.getElementById('cpu-name-label');
    if (!cpuNameLabel) {
        cpuNameLabel = document.createElement('div');
        cpuNameLabel.id = 'cpu-name-label';
        cpuNameLabel.style.cssText = 'position:absolute; top:20px; right:30px; color:#FF5252; font-weight:bold; font-size:24px; text-shadow:0 0 10px #000; z-index:100;';
        battleUI.appendChild(cpuNameLabel);
    }
    cpuNameLabel.innerHTML = enemyData ? `VS ${enemyData.playerName}` : "VS 名もなきCPU";
    battleUI.style.display = 'flex';

    // スプラッシュ・コイントス・ドロー演出
    const blocker = document.createElement('div'); blocker.id = 'tcg-battle-blocker'; blocker.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; z-index:25000;`; document.body.appendChild(blocker);
    const splash = document.createElement('div'); splash.id = 'tcg-battle-splash'; splash.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 26000; display: flex; justify-content: center; align-items: center; color: white; font-size: 80px; font-weight: bold; font-style: italic; text-align:center; line-height:1.2; text-shadow: 0 0 30px #FF9800, 5px 5px 0 #000; opacity: 0; transform: scale(1.5); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);`;
    splash.innerHTML = enemyData ? `ONLINE BATTLE !!<br><span style="font-size:50px; color:#4fc3f7;">VS ${enemyData.playerName}</span>` : "BATTLE START !!";
    document.body.appendChild(splash);

    setTimeout(() => { splash.style.opacity = '1'; splash.style.transform = 'scale(1)'; }, 50);
    setTimeout(() => {
        splash.style.opacity = '0'; splash.style.transform = 'scale(0.8)';
        setTimeout(() => {
            splash.remove();
            const isPlayerFirst = Math.random() < 0.5;
            window.TCG_BATTLE.firstPlayer = isPlayerFirst ? 'player' : 'cpu';
            window.TCG_BATTLE.isEnemyTurn = !isPlayerFirst;
            
            const coinUI = document.createElement('div');
            coinUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 26000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;`;
            coinUI.innerHTML = `<div style="font-size: 30px; font-weight: bold; margin-bottom: 30px; color:#00BCD4;">先攻・後攻を決定します...</div><div class="coin-flip-anim" style="width: 150px; height: 150px; background: #FFD700; border-radius: 50%; border: 10px solid #FFA000; box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; font-size: 60px; font-weight: bold; color: #B28900; text-shadow: 1px 1px 0px #FFF;">TCG</div>`;
            document.body.appendChild(coinUI);

            setTimeout(() => {
                coinUI.innerHTML = `<div style="font-size: 50px; font-weight: bold; margin-bottom: 30px; color:${isPlayerFirst ? '#4CAF50' : '#ff5252'}; text-shadow: 0 0 20px ${isPlayerFirst ? '#4CAF50' : '#ff5252'};">${isPlayerFirst ? 'あなたの先攻！' : '敵の先攻！'}</div>`;
                setTimeout(() => {
                    coinUI.style.opacity = '0'; coinUI.style.transition = '0.5s';
                    setTimeout(() => {
                        coinUI.remove();
                        let drawCount = 0;
                        let pOneManaIdx = p.deck.findIndex(c => window.getActualCost(p, c) === 1 || c.cost === 1);
                        if (pOneManaIdx !== -1) { p.hand.push(p.deck.splice(pOneManaIdx, 1)[0]); drawCount = 1; }
                        
                        const drawTimer = setInterval(() => {
                            if (drawCount < 5) {
                                p.hand.push(p.deck.shift());
                                cpu.hand.push(cpu.deck.shift());
                                window.showBattleMessage(`シュッ！ (手札: ${drawCount + 1}枚)`, false, 250);
                                window.renderBattleBoard();
                                drawCount++;
                            } else {
                                clearInterval(drawTimer);
                                blocker.remove(); 
                                if (isPlayerFirst) window.startPlayerTurn(true);
                                else window.showTurnCutin("ENEMY TURN", "#ff5252", () => { window.executeCPUTurn(true); });
                            }
                        }, 350);
                    }, 500);
                }, 2000);
            }, 2500);
        }, 500);
    }, 1500); 
};

// ======================================================================
// 🎨 TCG "YOUR TURN" 消失バグ ＆ 演出強化パッチ
// ======================================================================

window.showTurnCutin = function(text, color, callback) {
    if (text.includes("YOUR TURN")) {
        if (window.TCG_BATTLE && window.TCG_BATTLE.player) {
            window.TCG_BATTLE.player.field.forEach(c => { if (c) c.isDefending = false; });
        }
    }

    if (window.TCG_BATTLE) window.TCG_BATTLE.isAnimating = true;

    // ★修正：アニメーションをバトルUI内ではなく、画面の最前面（body）に直接描画する！
    // これにより、裏で盤面が何度再描画されても文字が消えなくなります。
    const blocker = document.createElement('div');
    blocker.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; z-index:90000;`;
    document.body.appendChild(blocker);

    const splash = document.createElement('div');
    splash.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 91000; display: flex;
        justify-content: center; align-items: center; color: white; text-align: center;
        font-size: 90px; font-weight: bold; font-style: italic; white-space: pre-wrap; line-height: 1.1;
        text-shadow: 0 0 40px ${color}, 5px 5px 0 #000, -2px -2px 0 #000;
        opacity: 0; transform: scale(1.5) skewX(-15deg); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); pointer-events: none;
    `;
    
    splash.innerHTML = text; 
    document.body.appendChild(splash);

    // アニメーション処理
    setTimeout(() => { 
        splash.style.opacity = '1'; 
        splash.style.transform = 'scale(1) skewX(-15deg)'; 
    }, 50);
    
    setTimeout(() => {
        splash.style.opacity = '0'; 
        splash.style.transform = 'scale(0.8) skewX(-15deg)';
        setTimeout(() => { 
            splash.remove(); 
            blocker.remove(); 
            if (callback) callback(); 
        }, 300);
    }, 1200);
};

// ======================================================================
// 🛠️ デッキ編成画面が裏に隠れてしまうバグの修正パッチ
// ======================================================================

const _fix_openDeckBuilder_zIndex = window.openDeckBuilder;
window.openDeckBuilder = function() {
    // 念のための安全装置（セーブデータが空だった際のエラー防止）
    window.TCG.currentDeckIndex = window.TCG.currentDeckIndex || 0;
    while(window.TCG.decks.length < 3) window.TCG.decks.push([]);
    if (!window.TCG.decks[window.TCG.currentDeckIndex]) {
        window.TCG.decks[window.TCG.currentDeckIndex] = [];
    }

    // これまでのデッキ画面を開く処理を実行
    if (_fix_openDeckBuilder_zIndex) _fix_openDeckBuilder_zIndex.apply(this, arguments);
    
    // ★ 修正：カジノロビー（z-index: 50000）のさらに上に表示されるように優先度を引き上げる！
    let builderUI = document.getElementById('tcg-deck-builder');
    if (builderUI) {
        builderUI.style.zIndex = '60000';
    }
};

// ======================================================================
// 🛠️ 勝利BGMが上書きされる（育成BGMに戻る）バグの究極防弾パッチ
// ======================================================================

const _ultimate_endTCGBattle = window.endTCGBattle;
window.endTCGBattle = function(isWin) {
    if (window.TCG_BATTLE && window.TCG_BATTLE.isEnded) return; 
    
    // ★ 究極のハック：リザルト画面中は、古いタイマーによる「育成BGMへの強制復帰」を完全にブロックする！
    if (window.audioManager && !window._orig_restoreMainBGM_tcg) {
        window._orig_restoreMainBGM_tcg = window.audioManager.restoreMainBGM;
        window.audioManager.restoreMainBGM = function() {
            console.log("TCGリザルト画面中のため、育成BGMへの誤作動をブロックしました！");
        };
    }

    // 元のリザルト表示・VictoryBGM再生処理を実行
    if (_ultimate_endTCGBattle) _ultimate_endTCGBattle.apply(this, arguments);
};

const _ultimate_closeTCGBattle = window.closeTCGBattle;
window.closeTCGBattle = function(destination) {
    // ★ リザルト画面を閉じる（ロビーや島に戻るボタンを押した）時に、ブロックを解除して元に戻す
    if (window.audioManager && window._orig_restoreMainBGM_tcg) {
        window.audioManager.restoreMainBGM = window._orig_restoreMainBGM_tcg;
        window._orig_restoreMainBGM_tcg = null;
    }

    // 元の画面遷移処理を実行
    if (_ultimate_closeTCGBattle) _ultimate_closeTCGBattle.apply(this, arguments);
};
