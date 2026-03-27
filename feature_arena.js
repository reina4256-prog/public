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
    window.DUNGEON_SPRITES["arena_fisherman"] = { "img": "fisherman_battle_enemy.png", "sx": 839, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_builder"] = { "img": "builder_battle_enemy.png", "sx": 839, "sy": 0, "sw": 1248, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_smithing"] = { "img": "smith_battle_enemy.png", "sx": 794, "sy": 0, "sw": 1344, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_cooking"] = { "img": "chef_battle_enemy.png", "sx": 439, "sy": 0, "sw": 1766, "sh": 1536, "scale": 0.15000000000000002 };
    window.DUNGEON_SPRITES["arena_explore"] = { "img": "adventurer_battle_enemy.png", "sx": 794, "sy": 0, "sw": 1344, "sh": 1536, "scale": 0.15000000000000002 };
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
    ]
};

// ★修正：全11種族の専用二つ名と基礎ステータス（speed追加）
window.ARENA_ENEMIES = {
    "robot": { name: "試作決戦兵器プロト・ロボ", hp: 150, atk: 25, def: 10, speed: 20, spriteKey: "arena_robot", type: "robot" },
    "ghost": { name: "彷徨えるプチゴースト", hp: 120, atk: 30, def: 5, speed: 40, spriteKey: "arena_ghost", type: "ghost" },
    "balloon": { name: "浮遊するバルーンスライム", hp: 180, atk: 20, def: 5, speed: 30, spriteKey: "arena_balloon", type: "balloon" },
    "stone": { name: "剛腕のロックゴーレム", hp: 250, atk: 30, def: 20, speed: 5, spriteKey: "arena_stone", type: "stone" },
    "machine": { name: "暴走ゼンマイギア", hp: 130, atk: 28, def: 12, speed: 35, spriteKey: "arena_machine", type: "machine" },
    "bird": { name: "疾風のアネモバード", hp: 110, atk: 35, def: 8, speed: 60, spriteKey: "arena_bird", type: "bird" },
    "dragon": { name: "荒ぶるベビードラゴン", hp: 200, atk: 40, def: 15, speed: 25, spriteKey: "arena_dragon", type: "dragon" },
    "seed": { name: "猛毒のプラントシード", hp: 140, atk: 22, def: 10, speed: 15, spriteKey: "arena_seed", type: "seed" },
    "magician": { name: "炎の魔術見習い", hp: 100, atk: 45, def: 5, speed: 25, spriteKey: "arena_magician", type: "magician" },
    "spirit": { name: "怒れる森の精霊", hp: 160, atk: 20, def: 15, speed: 35, spriteKey: "arena_spirit", type: "spirit" },
    "beetle": { name: "鉄壁のアーマービートル", hp: 220, atk: 25, def: 25, speed: 10, spriteKey: "arena_beetle", type: "beetle" }
};

// ★進化系のエネミーデータをツリーから自動生成して追加登録する
if (typeof evolutionRequirements !== 'undefined') {
    let tier0 = ["robot", "ghost", "balloon", "stone", "machine", "bird", "dragon", "seed", "magician", "spirit", "beetle"];
    
    tier0.forEach(baseKey => {
        let baseStats = window.ARENA_ENEMIES[baseKey];
        if (!baseStats || !evolutionRequirements[baseKey]) return;
        
        // Tier 1 の生成
        evolutionRequirements[baseKey].forEach(evo => {
            let bonusHp = evo.req.power ? 50 : 0;
            let bonusAtk = (evo.req.power || evo.req.dark) ? 10 : 0;
            let bonusDef = evo.req.beauty ? 10 : 0;
            let bonusSpd = evo.req.intel ? 10 : (evo.req.old ? -5 : 0);

            window.ARENA_ENEMIES[evo.next] = {
                name: `【${evo.name}】${baseStats.name}`, 
                hp: Math.floor(baseStats.hp * 1.5) + bonusHp,
                atk: Math.floor(baseStats.atk * 1.5) + bonusAtk,
                def: Math.floor(baseStats.def * 1.5) + bonusDef,
                speed: Math.max(5, Math.floor(baseStats.speed * 1.5) + bonusSpd),
                spriteKey: window.DUNGEON_SPRITES[`arena_${evo.next}`] ? `arena_${evo.next}` : baseStats.spriteKey,
                type: evo.next,
                evoName: evo.name // ★行動パターン分岐用に記憶
            };

            // Tier 2 の生成
            if (evolutionRequirements[evo.next]) {
                evolutionRequirements[evo.next].forEach(evo2 => {
                    let bonusHp2 = evo2.req.power ? 100 : 0;
                    let bonusAtk2 = (evo2.req.power || evo2.req.dark) ? 20 : 0;
                    let bonusDef2 = evo2.req.beauty ? 20 : 0;
                    let bonusSpd2 = evo2.req.intel ? 20 : (evo2.req.old ? -10 : 0);

                    window.ARENA_ENEMIES[evo2.next] = {
                        name: `【${evo2.name}】${baseStats.name}`, 
                        hp: Math.floor(baseStats.hp * 2.5) + bonusHp + bonusHp2,
                        atk: Math.floor(baseStats.atk * 2.5) + bonusAtk + bonusAtk2,
                        def: Math.floor(baseStats.def * 2.5) + bonusDef + bonusDef2,
                        speed: Math.max(5, Math.floor(baseStats.speed * 2.5) + bonusSpd + bonusSpd2),
                        spriteKey: window.DUNGEON_SPRITES[`arena_${evo2.next}`] ? `arena_${evo2.next}` : baseStats.spriteKey,
                        type: evo2.next,
                        evoName: evo2.name // ★行動パターン分岐用に記憶
                    };
                });
            }
        });
    });
}

// ★すべての新コマンド・陣形・召喚スキルを登録
window.ARENA_SKILLS = {
    "たたかう": { type: "attack", cost: 0, power: 1.0, target: "single", name: "通常攻撃", allowedTypes: "all" },
    "かいふく": { type: "heal", cost: 10, power: 40, target: "self", name: "自己回復", allowedTypes: "all" },
    "ほのお":   { type: "magic", cost: 15, power: 1.5, target: "all", name: "灼熱の炎", allowedTypes: ["dragon", "magician", "ghost"] },
    "まもる":   { type: "defend", cost: 5, power: 0, target: "self", name: "防御態勢", allowedTypes: ["stone", "machine", "robot", "beetle"] },
    "いのる":   { type: "heal_all", cost: 20, power: 30, target: "party", name: "奇跡の祈り", allowedTypes: ["spirit", "magician", "bird", "seed"] },
    
    "うえ": { type: "move", dir: "up", cost: 0, name: "前進（前衛）", allowedTypes: "all" },
    "した": { type: "move", dir: "down", cost: 0, name: "後退（後衛）", allowedTypes: "all" },
    "ひだり": { type: "move", dir: "left", cost: 0, name: "左へ移動", allowedTypes: "all" },
    "みぎ": { type: "move", dir: "right", cost: 0, name: "右へ移動", allowedTypes: "all" },

    "筋トレ": { type: "buff", stat: "atk", cost: 5, name: "筋力アップ", allowedTypes: "all" },
    "勉強": { type: "buff", stat: "intel", cost: 5, name: "知力アップ", allowedTypes: "all" },
    "睡眠": { type: "sleep", cost: 0, name: "居眠り回復", allowedTypes: "all" },

    "冒険家": { type: "summon", master: "explore", cost: 15, name: "冒険家の呼出", allowedTypes: "all" },
    "漁師": { type: "summon", master: "fishing", cost: 15, name: "漁師の呼出", allowedTypes: "all" },
    "料理人": { type: "summon", master: "cooking", cost: 15, name: "料理人の呼出", allowedTypes: "all" },
    "農家": { type: "summon", master: "farming", cost: 15, name: "農家の呼出", allowedTypes: "all" },
    "建築士": { type: "summon", master: "building", cost: 15, name: "建築士の呼出", allowedTypes: "all" },
    "鍛冶師": { type: "summon", master: "smithing", cost: 15, name: "鍛冶師の呼出", allowedTypes: "all" },

    "建築": { type: "random_build", cost: 10, name: "即席建築", allowedTypes: "all" },
    "釣り": { type: "fishing", cost: 5, name: "フィッシング", allowedTypes: "all" },
    "探検": { type: "explore", cost: 10, name: "秘境探検", allowedTypes: "all" },
    "城":   { type: "call_rescue", cost: 20, name: "城の援軍要請", allowedTypes: "all" },
    "小屋": { type: "build_hut", cost: 10, name: "小屋立てこもり", allowedTypes: "all" },
    "橋":   { type: "build_bridge", cost: 10, name: "橋で距離を取る", allowedTypes: "all" },
    "畑":   { type: "build_farm", cost: 10, name: "畑の開墾", allowedTypes: "all" },
    
    "たべる": { type: "eat", cost: 0, name: "食料を食べる", allowedTypes: "all" },
    "そうび": { type: "equip", cost: 0, name: "武器を装備", allowedTypes: "all" },
    "はずす": { type: "unequip", cost: 0, name: "装備を外す", allowedTypes: "all" }
};

window.ARENA_STATE = {
    active: false, wave: 1, healPots: 3, party: [], enemies: [], log: [], autoMode: false, isProcessing: false,
    guests: [], farmTimer: 0
};
window.ARENA_RECEPTION_STATE = { party: [], available: [] };

// ==========================================
// 1. 受付画面
// ==========================================
window.openArenaReception = function() {
    // ▼▼▼ 追加：城に入った時のカードアンロック ▼▼▼
    if (window.aiPet && typeof window.triggerTCGUnlock === 'function') {
        window.triggerTCGUnlock('visit_castle', window.aiPet.generation);
    }
    // ▲▲▲ 追加おわり ▲▲▲
    if (typeof window.ARENA_RECEPTION_STATE === 'undefined' || !window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE = { party: [], available: [] };
    const encounterUi = document.getElementById('encounterOverlay'); if (encounterUi) encounterUi.classList.remove('active');
    const statusUi = document.getElementById('statusOverlay'); if (statusUi) statusUi.classList.remove('active');

    let ui = document.getElementById('arena-reception-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-reception-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 50000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto;`;
        document.body.appendChild(ui);
    }
    
    let pwr = Math.floor(window.aiPet.stats.power || 10); let int = Math.floor(window.aiPet.stats.intel || 10); 
    let spd = Math.floor(window.aiPet.stats.speed || 10); // ★追加
    window.ARENA_RECEPTION_STATE.party = [{
        id: "me", name: window.aiPet.name || "現在のAI", skin: window.aiPet.currentSkin || 'robot',
        hp: Math.floor(100 + (pwr * 2)), maxHp: Math.floor(100 + (pwr * 2)), mp: Math.floor(int * 2), maxMp: Math.floor(int * 2),
        atk: Math.floor(10 + pwr * 0.5), def: Math.floor(5 + pwr * 0.2), intel: int, speed: spd, // ★speed追加
        words: window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? [...window.aiPet.apprentice.learnedWords] : [],
        isMe: true
    }];

    window.ARENA_RECEPTION_STATE.available = [];
    let discovered = (window.aiPet && window.aiPet.discoveredMonsters) ? window.aiPet.discoveredMonsters : [];
    let savedStats = (window.aiPet && window.aiPet.savedGrazeStats) ? window.aiPet.savedGrazeStats : {};
    let pastId = 0;
    discovered.forEach(skinKey => {
        if (skinKey === window.aiPet.currentSkin) return;
        let sName = (typeof monsterBookData !== 'undefined' && monsterBookData[skinKey]) ? monsterBookData[skinKey].name : skinKey;
        let sPwr = Math.floor(Math.max(5, pwr - 5)); let sInt = Math.floor(Math.max(5, int - 5)); let sSpd = Math.floor(Math.max(5, spd - 5)); // ★追加
        let sWords = ["たたかう", "かいふく", ["ほのお", "まもる", "いのる"][Math.floor(Math.random() * 3)]];
        if (savedStats[skinKey]) {
            if (savedStats[skinKey].stats) { 
                sPwr = Math.floor(savedStats[skinKey].stats.power || sPwr); 
                sInt = Math.floor(savedStats[skinKey].stats.intel || sInt); 
                sSpd = Math.floor(savedStats[skinKey].stats.speed || sSpd); // ★追加
            }
            if (savedStats[skinKey].learnedWords && savedStats[skinKey].learnedWords.length > 0) sWords = [...savedStats[skinKey].learnedWords];
        }
        window.ARENA_RECEPTION_STATE.available.push({
            id: "past_" + pastId++, name: `幻影の${sName}`, skin: skinKey, hp: Math.floor(80 + sPwr), maxHp: Math.floor(80 + sPwr), mp: Math.floor(sInt * 2), maxMp: Math.floor(sInt * 2),
            atk: Math.floor(8 + sPwr * 0.4), def: 5, intel: sInt, speed: sSpd, words: sWords, isMe: false // ★speed追加
        });
    });
    if (typeof window.renderArenaReception === 'function') window.renderArenaReception();
};

window.renderArenaReception = function() {
    let ui = document.getElementById('arena-reception-ui'); if (!ui) return;
    let rState = window.ARENA_RECEPTION_STATE;
    
    // ★追加：選択中のモードを状態として保持する（未定義ならnormal）
    if (!rState.selectedMode) rState.selectedMode = 'normal';

    let partyHtml = rState.party.map((p, index) => `
        <div onclick="window.removeArenaPartyMember(${index})" style="background:#222; border:2px solid ${p.isMe ? '#4CAF50' : '#FFD700'}; border-radius:8px; padding:10px; width:150px; text-align:center; cursor:${p.isMe ? 'default' : 'pointer'}; position:relative;">
            <div style="font-size:16px; color:${p.isMe ? '#4CAF50' : '#FFD700'}; font-weight:bold; margin-bottom:5px;">${p.name}</div>
            <div style="font-size:12px; color:#aaa;">HP:${p.hp} / MP:${p.mp}</div>
            ${!p.isMe ? `<div style="position:absolute; top:-10px; right:-10px; background:red; color:white; border-radius:50%; width:20px; height:20px; font-weight:bold; line-height:20px;">×</div>` : ''}
        </div>
    `).join('');
    for(let i=rState.party.length; i<4; i++) partyHtml += `<div style="background:#111; border:2px dashed #555; border-radius:8px; padding:10px; width:150px; text-align:center; display:flex; align-items:center; justify-content:center; color:#555;">EMPTY</div>`;
    
    let availableHtml = rState.available.length > 0 ? rState.available.map((p, index) => `
        <div onclick="window.addArenaPartyMember(${index})" style="background:#1a1a1a; border:1px solid #444; border-radius:8px; padding:10px; width:140px; text-align:center; cursor:pointer;">
            <div style="font-size:14px; color:#fff; font-weight:bold; margin-bottom:5px;">${p.name}</div>
            <div style="font-size:12px; color:#888;">HP:${p.hp} / MP:${p.mp}</div>
            <div style="font-size:10px; color:#4fc3f7; margin-top:5px;">+ パーティへ</div>
        </div>
    `).join('') : `<div style="color:#888; text-align:center; width:100%; padding:20px;">図鑑に登録された仲間が見つかりません</div>`;

    let highestWave = window.aiPet.arenaHighestWave || 1;
    let bossUnlocked = highestWave >= 51; 

    // ★修正：onchangeイベントで選択状態を記憶させ、再描画時にも復元する
    ui.innerHTML = `
        <h1 style="color:#ff5252; font-size:36px; margin-top:30px; text-shadow: 0 0 10px red;">⚔️ 闘技場 受付 ⚔️</h1>
        <p style="font-size:14px; color:#ccc; margin-bottom:10px;">全滅すれば寿命が削られるデスマッチ...。挑む覚悟はあるか？</p>
        
        <div style="margin-bottom:20px; background:#111; padding:10px 20px; border-radius:8px; border:2px solid #555; display:flex; gap:15px; justify-content:center; align-items:center;">
            <span style="color:#FFD700; font-weight:bold;">挑戦モード:</span>
            <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                <input type="radio" name="arenaMode" value="normal" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value" ${rState.selectedMode === 'normal' ? 'checked' : ''}> 通常エンドレス
            </label>
            ${bossUnlocked ? `
                <label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#ff5252;">
                    <input type="radio" name="arenaMode" value="boss" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value" ${rState.selectedMode === 'boss' ? 'checked' : ''}> ボスラッシュ
                </label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#4fc3f7;">
                    <input type="radio" name="arenaMode" value="friend" onchange="window.ARENA_RECEPTION_STATE.selectedMode=this.value" ${rState.selectedMode === 'friend' ? 'checked' : ''}> フレンド(幻影)バトル
                </label>
            ` : `<span style="color:#666; font-size:12px;">(WAVE 50突破で新モード解放...)</span>`}
        </div>

        <div style="display:flex; width:90%; max-width:900px; gap:20px; margin-bottom:30px;">
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555;"><div style="font-size:18px; color:#4fc3f7; margin-bottom:15px; font-weight:bold; text-align:center;">▼ 出撃パーティ (最大4人)</div><div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">${partyHtml}</div></div>
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555; max-height: 300px; overflow-y:auto;"><div style="font-size:18px; color:#FFC107; margin-bottom:15px; font-weight:bold; text-align:center;">▼ 図鑑の仲間たち</div><div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">${availableHtml}</div></div>
        </div>
        <div style="display:flex; gap:20px;">
            <button onclick="window.commitArenaBattle()" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#b71c1c; color:white; border:3px solid #ff5252; border-radius:8px; cursor:pointer; box-shadow: 0 0 15px rgba(255,0,0,0.5);">出陣する</button>
            <button onclick="document.getElementById('arena-reception-ui').style.display='none'; window.exitArenaFacility();" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#444; color:white; border:3px solid #777; border-radius:8px; cursor:pointer;">やめておく</button>
        </div>
    `;
    ui.style.display = 'flex';
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
    window.startArenaBattle();
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
    document.getElementById('arena-reception-ui').style.display = 'none';

    // ★追加: デバッグ用のWAVE指定があればそれを使い、無ければ1にする
    let startWave = window.currentArenaWave || 1;
    window.ARENA_STATE.wave = startWave; 
    window.currentArenaWave = null; // 使い終わったらリセット
    
    window.ARENA_STATE.healPots = 3; window.ARENA_STATE.active = true; window.ARENA_STATE.autoMode = false; window.ARENA_STATE.isProcessing = false;
    let darkUI = document.createElement('div');
    darkUI.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index: 55000; display:flex; justify-content:center; align-items:center; color:#ff5252; font-size:36px; font-weight:bold; opacity:0; transition: opacity 1s;`;
    darkUI.innerText = "血湧き肉躍る狂宴の幕開けだ……！"; document.body.appendChild(darkUI);
    setTimeout(() => { darkUI.style.opacity = 1; }, 100);
    setTimeout(() => { darkUI.style.opacity = 0; setTimeout(() => { darkUI.remove(); window.initArenaBattleField(); }, 1000); }, 3000);
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

    state.party.forEach((p, idx) => {
        p.row = 'front'; p.col = idx;
        p.buffAtk = 1.0; p.buffIntel = 1.0; p.isEquipped = false;
        p.isSleeping = false; p.shield = false; p.exploreTimer = 0; p.hutHp = 0;

        // ★追加：WAVE開始時に、受付時の「本来のステータス」を復元する（デバフの永続化を防ぐ）
        let origP = window.ARENA_RECEPTION_STATE.party.find(rp => rp.id === p.id);
        if (origP) {
            p.atk = origP.atk;
            p.def = origP.def;
            p.intel = origP.intel;
            // 最大HP/MPも念のためリセット（現在HP/MPの減りはそのまま引き継ぐ）
            p.maxHp = origP.maxHp;
            p.maxMp = origP.maxMp;
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
    let spdMultiplier = 1 + (waveMinus * 0.05); // ★追加（素早さもWAVEで微増）

    if (isBossWave) {
        let bossType = state.bossQueue[state.bossesDefeated] || state.bossQueue[state.bossQueue.length - 1];
        let rKey = Object.keys(window.ARENA_ENEMIES).find(k => window.ARENA_ENEMIES[k].type === bossType);
        if (!rKey) rKey = Object.keys(window.ARENA_ENEMIES).find(k => window.ARENA_ENEMIES[k].type === bossType.split('_')[0]) || 'robot';
        
        let base = window.ARENA_ENEMIES[rKey];
        
        let eHp = Math.floor(base.hp * hpMultiplier * 3 + 2000);
        let eAtk = Math.floor(base.atk * atkMultiplier * 1.5 + 50);
        let eDef = Math.floor(base.def * defMultiplier * 2);
        let eSpd = Math.floor(base.speed * spdMultiplier * 1.5); // ★追加

        state.enemies.push({
            id: `e_boss`, baseName: base.name, name: `【BOSS】巨魁なる${base.name}`, spriteKey: base.spriteKey, type: base.type,
            hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd, // ★speed追加
            buffAtk: 1.0, buffDef: 1.0, isBoss: true, patternStep: 0,
            bossTypeKey: bossType, row: 'front' 
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
            let eSpd = fp.speed || 10; // ★追加

            state.enemies.push({
                id: `e_f_${i}`, baseName: fp.name, name: `幻影の${fp.name}`, spriteKey: spriteKey, type: aType, skin: fp.skin || 'robot',
                hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd, // ★speed追加
                intel: fp.intel || 20, mp: fp.maxMp || 100, maxMp: fp.maxMp || 100, words: fp.words || ["たたかう"],
                buffAtk: 1.0, buffDef: 1.0, isFriend: true, row: i < 2 ? 'front' : 'back', col: i % 2
            });
        });

    } else {
        let enemyCount = Math.min(8, 1 + Math.floor(state.wave / 2));
        let letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
        let tempEnemies = [];
        let nameCounts = {};
        
        for(let i=0; i<enemyCount; i++) {
            let rKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            let base = window.ARENA_ENEMIES[rKey]; 
            nameCounts[base.name] = (nameCounts[base.name] || 0) + 1;
            tempEnemies.push(base);
        }
        
        const getSuffix = (index) => String.fromCharCode(65 + (index % 26)); 
        
        for(let i=0; i<tempEnemies.length; i++) {
            let base = tempEnemies[i];
            let totalSame = nameCounts[base.name];
            
            let eHp = Math.floor(base.hp * hpMultiplier + (state.wave * 10));
            let eAtk = Math.floor(base.atk * atkMultiplier + (state.wave * 2));
            let eDef = Math.floor(base.def * defMultiplier + (state.wave * 1));
            let eSpd = Math.floor(base.speed * spdMultiplier); // ★追加

            state.enemySpawnCounts[base.name] = (state.enemySpawnCounts[base.name] || 0) + 1;
            let spawnIndex = state.enemySpawnCounts[base.name] - 1; 
            
            let finalName = base.name;
            if (totalSame > 1) finalName = `${base.name} ${getSuffix(spawnIndex)}`;

            state.enemies.push({
                id: `e_${i}`, baseName: base.name, name: finalName, spriteKey: base.spriteKey, type: base.type,
                hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd, buffAtk: 1.0, buffDef: 1.0, // ★speed追加
                row: i < 4 ? 'front' : 'back' 
            });
        }
    }
    window.renderArenaBattle();
};

window.renderArenaBattle = function() {
    let ui = document.getElementById('arena-battle-ui'); if (!ui) return;
    let state = window.ARENA_STATE;

    let enemyCount = state.enemies.length;
    let enemyScaleRate = enemyCount > 6 ? 0.5 : (enemyCount > 4 ? 0.65 : 1.0);

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

        let imgContent = sp ? `
            <div style="width:${finalW}px; height:${finalH}px; margin: 0 auto; position: relative; transition: all 0.2s; ${e.hp <= 0 ? 'opacity:0; transform:scale(0.5);' : ''}">
                <div class="${e.flash ? 'enemy-flash' : ''}" style="position: absolute; top: 0; left: 0; width: ${sp.sw}px; height: ${sp.sh}px; background: url('${sp.img}') -${sp.sx}px -${sp.sy}px; transform: scale(${finalScale}); transform-origin: top left;"></div>
            </div>` 
        : `<img src="robot_battle_enemy.png" class="${e.flash ? 'enemy-flash' : ''}" style="height: ${250 * enemyScaleRate * bossScale}px; transition: all 0.2s; ${e.hp <= 0 ? 'opacity:0; transform:scale(0.5);' : ''}">`;

        let rowTag = e.row === 'back' ? `<div style="font-size:10px; color:#aaa; margin-top:2px;">[後衛]</div>` : `<div style="font-size:10px; color:#ff9800; margin-top:2px;">[前衛]</div>`;
        let scaleStyle = e.row === 'back' ? `transform: scale(0.85);` : ``; 

        return `<div id="ui_enemy_${e.id}" style="text-align:center; display:flex; flex-direction:column; align-items:center; margin: 5px; ${isHidden ? 'opacity:0.4;' : ''} ${scaleStyle} transition: all 0.3s;">
            ${isHidden ? `<div style="color:#aaa; font-weight:bold; margin-bottom:50px;">(探検中...)</div>` : imgContent}
            <div style="background:rgba(0,0,0,0.7); color:white; font-weight:bold; font-size:${Math.max(10, 14 * enemyScaleRate)}px; padding:2px 8px; border-radius:4px; margin-top:5px; transition: opacity 0.2s; ${e.hp <= 0 ? 'opacity:0;' : ''}">
                ${e.name} <span style="font-size:12px;">${statusIcons}</span>
            </div>
            ${e.hp > 0 && !e.isBoss ? rowTag : ''}
        </div>`;
    });

    let enemiesHtml = "";
    state.enemies.forEach((e, i) => { if (e.row === 'back') enemiesHtml += enemyHtmlList[i]; }); 
    // ★修正：'front' か判定するのではなく「'back' 以外すべて」として描画漏れを完全に防ぐ
    state.enemies.forEach((e, i) => { if (e.row !== 'back') enemiesHtml += enemyHtmlList[i]; }); 

    let partyAndGuests = [];
    state.party.forEach(p => partyAndGuests.push({ ...p, isParty: true }));
    state.guests.forEach(g => {
        if (['farming', 'soldier', 'captain', 'king'].includes(g.type)) {
            let gName = g.type === 'farming' ? '🎃身代わりカボチャ' : (g.type === 'soldier' ? '⚔️城の兵士' : (g.type === 'captain' ? '🛡️城の隊長' : '👑王様'));
            partyAndGuests.push({ isParty: false, name: gName, hp: g.hp, maxHp: g.maxHp, mp: 0, maxMp: 0, row: 'front', col: 1.5, typeStr: g.type });
        }
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
        let content = `
        <div style="order:${p.col}; width:130px; background:rgba(20,20,30,0.8); border:2px solid ${p.isParty ? '#555' : '#E91E63'}; padding:8px; border-radius:6px; display:flex; flex-direction:column; ${isHidden || p.hp <= 0 ? 'opacity:0.4;' : ''}">
            <div style="color:${p.hp <= 0 ? '#888' : (p.isParty ? '#FFD700' : '#E91E63')}; font-weight:bold; font-size:13px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${p.name} <span style="font-size:12px;">${statusIcons}</span>
            </div>
            ${isHidden ? `<div style="color:#aaa; font-size:12px; font-weight:bold; text-align:center; margin:10px 0;">(探検中...)</div>` : `
                <div style="color:#76ff03; font-size:12px; font-weight:bold;">HP: ${Math.max(0, p.hp)}</div>
                ${p.isParty ? `<div style="color:#4fc3f7; font-size:12px; font-weight:bold; margin-bottom:4px;">MP: ${Math.max(0, p.mp)}</div>
                <div style="margin-top:auto; display:flex; flex-wrap:wrap; max-height:35px; overflow-y:auto;">${wordsHtml}</div>` : ''}
            `}
        </div>`;
        if (p.row === 'back') backRowHtml += content; else frontRowHtml += content;
    });

    let nonTargetGuestsHtml = state.guests.map(g => {
        if (['farming', 'soldier', 'captain', 'king'].includes(g.type)) return '';
        let emoji = "👤";
        if(g.type === 'explore') emoji = "🗺️"; if(g.type === 'fishing') emoji = "🎣";
        if(g.type === 'cooking') emoji = "🍲"; if(g.type === 'building') emoji = "🧱"; if(g.type === 'smithing') emoji = "🔨";
        return `<div style="background:#111; border:2px solid #E91E63; border-radius:50%; width:40px; height:40px; display:flex; justify-content:center; align-items:center; font-size:24px; box-shadow:0 0 10px #E91E63; margin-right:10px;" title="${g.type}">${emoji}</div>`;
    }).join('');

    let logHtml = state.log.map(l => `<div style="margin-bottom:6px; border-bottom:1px solid #333; padding-bottom:4px;">${l}</div>`).join('');
    let isBusy = state.isProcessing || state.autoMode || state.skipMode;

    ui.innerHTML = `
        <div style="position:absolute; top:20px; left:20px; background:rgba(0,0,0,0.7); color:white; padding:10px 20px; border-radius:8px; font-size:24px; font-weight:bold; border:2px solid #FFC107;">WAVE ${state.wave}</div>
        
        <div style="flex:1; display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; padding-top:50px;">${enemiesHtml}</div>
        
        <div style="height:230px; background:rgba(0,0,0,0.85); border-top:4px solid #FFF; display:flex; padding:10px; gap:10px; position:relative;">
            <div style="position:absolute; top:-50px; right:20px; display:flex;">${nonTargetGuestsHtml}</div>
            
            <div id="arena-log-container" style="flex:2; border:2px solid #444; border-radius:8px; padding:10px; font-size:15px; color:#FFF; line-height:1.5; overflow-y:auto; display:flex; flex-direction:column; justify-content:flex-start;">
                ${logHtml}
            </div>
            
            <div style="flex:4; display:flex; flex-direction:column; justify-content:center; gap:5px; border:1px solid #333; border-radius:8px; background:#111; padding:5px;">
                <div style="display:flex; justify-content:center; gap:10px; min-height:85px; align-items:center;">${backRowHtml}</div>
                <div style="display:flex; justify-content:center; gap:10px; min-height:85px; align-items:center;">${frontRowHtml}</div>
            </div>
            
            <div style="flex:1.5; display:flex; flex-direction:column; justify-content:center; gap:10px;">
                <button onclick="window.processArenaTurn()" ${isBusy ? 'disabled' : ''} style="padding:12px; font-size:16px; font-weight:bold; background:${isBusy ? '#555' : '#4CAF50'}; color:white; border:2px solid #FFF; border-radius:8px; cursor:${isBusy ? 'not-allowed' : 'pointer'};">▶ 1ターン</button>
                <button onclick="window.toggleArenaAuto()" ${state.skipMode ? 'disabled' : ''} style="padding:12px; font-size:16px; font-weight:bold; background:${state.autoMode ? '#FF9800' : (state.skipMode ? '#555' : '#2196F3')}; color:white; border:2px solid #FFF; border-radius:8px; cursor:${state.skipMode ? 'not-allowed' : 'pointer'};">${state.autoMode ? '⏸ AUTO停止' : '⏩ AUTO進行'}</button>
                <button onclick="window.skipArenaWave()" ${isBusy ? 'disabled' : ''} style="padding:12px; font-size:16px; font-weight:bold; background:${isBusy ? '#555' : '#9C27B0'}; color:white; border:2px solid #FFF; border-radius:8px; cursor:${isBusy ? 'not-allowed' : 'pointer'};">⏭ スキップ</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        let logContainer = document.getElementById('arena-log-container');
        if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
    }, 10);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
window.toggleArenaAuto = function() { let state = window.ARENA_STATE; state.autoMode = !state.autoMode; window.renderArenaBattle(); if (state.autoMode && !state.isProcessing) window.processArenaTurn(); };

// 本格RPGエフェクト関数
window.showArenaEffect = function(targetId, typeStr) {
    let eDiv = document.getElementById(`ui_enemy_${targetId}`); if(!eDiv) return;
    eDiv.style.position = 'relative';
    let fxContainer = document.createElement('div'); fxContainer.style.cssText = `position:absolute; top:50%; left:50%; width:100px; height:100px; transform:translate(-50%, -50%); z-index:100; pointer-events:none;`; eDiv.appendChild(fxContainer);
    if (typeStr === 'beetle' || typeStr === 'seed') {
        let color = typeStr === 'seed' ? '#4CAF50' : '#FFF'; let shadow = typeStr === 'seed' ? '#8BC34A' : '#FFD700';
        let line1 = document.createElement('div'); let line2 = document.createElement('div');
        let baseStyle = `position:absolute; top:50%; left:50%; width:140px; height:6px; background:${color}; box-shadow:0 0 10px ${shadow}, 0 0 20px ${shadow}; border-radius:50%; transform-origin:center; opacity:0;`;
        line1.style.cssText = baseStyle + `transform:translate(-50%, -50%) rotate(45deg) scaleX(0); transition:transform 0.1s ease-out, opacity 0.1s;`; line2.style.cssText = baseStyle + `transform:translate(-50%, -50%) rotate(-45deg) scaleX(0); transition:transform 0.1s ease-out 0.05s, opacity 0.1s 0.05s;`;
        fxContainer.appendChild(line1); fxContainer.appendChild(line2);
        setTimeout(() => { line1.style.transform = 'translate(-50%, -50%) rotate(45deg) scaleX(1)'; line1.style.opacity = '1'; }, 10); setTimeout(() => { line2.style.transform = 'translate(-50%, -50%) rotate(-45deg) scaleX(1)'; line2.style.opacity = '1'; }, 60); setTimeout(() => { line1.style.opacity = '0'; line2.style.opacity = '0'; }, 200);
    } else if (typeStr === 'robot' || typeStr === 'stone') {
        let color = typeStr === 'robot' ? '#FF5722' : '#795548'; let blast = document.createElement('div');
        blast.style.cssText = `position:absolute; top:50%; left:50%; width:30px; height:30px; background:${color}; border-radius:50%; box-shadow:0 0 30px #FFC107, 0 0 50px #FF5252; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);`; fxContainer.appendChild(blast);
        let spikes = document.createElement('div'); spikes.style.cssText = `position:absolute; top:50%; left:50%; width:120px; height:120px; background:repeating-conic-gradient(from 0deg, transparent 0deg 20deg, #FFEB3B 20deg 30deg); transform:translate(-50%, -50%) scale(0); opacity:1; border-radius:50%; transition:all 0.15s ease-out; mask-image:radial-gradient(circle, transparent 20%, black 70%); -webkit-mask-image:radial-gradient(circle, transparent 20%, black 70%);`; fxContainer.appendChild(spikes);
        setTimeout(() => { blast.style.transform = 'translate(-50%, -50%) scale(4)'; blast.style.opacity = '0'; spikes.style.transform = 'translate(-50%, -50%) scale(1.5)'; spikes.style.opacity = '0'; }, 10);
    } else if (typeStr === 'magician' || typeStr === 'ghost') {
        let color = typeStr === 'magician' ? '#E040FB' : '#673AB7'; let ring = document.createElement('div'); ring.style.cssText = `position:absolute; top:50%; left:50%; width:10px; height:10px; border:6px solid ${color}; border-radius:50%; box-shadow:0 0 20px ${color} inset, 0 0 20px ${color}; transform:translate(-50%, -50%) scale(12); opacity:0; transition:all 0.2s ease-in;`; fxContainer.appendChild(ring);
        let core = document.createElement('div'); core.style.cssText = `position:absolute; top:50%; left:50%; width:80px; height:80px; background:${color}; border-radius:50%; filter:blur(12px); transform:translate(-50%, -50%) scale(0); opacity:0; transition:all 0.15s ease-out 0.2s;`; fxContainer.appendChild(core);
        setTimeout(() => { ring.style.transform = 'translate(-50%, -50%) scale(0.5)'; ring.style.opacity = '1'; }, 10); setTimeout(() => { ring.style.opacity = '0'; core.style.transform = 'translate(-50%, -50%) scale(1.5)'; core.style.opacity = '1'; }, 200); setTimeout(() => { core.style.opacity = '0'; }, 350);
    } else if (typeStr === 'dragon') {
        let fire = document.createElement('div'); fire.style.cssText = `position:absolute; bottom:0; left:50%; width:90px; height:0px; background:linear-gradient(to top, #FFEB3B, #FF9800, #F44336, transparent); filter:blur(4px); transform:translateX(-50%); border-radius:40px 40px 0 0; transition:height 0.2s ease-out, opacity 0.2s ease-out 0.1s; opacity:1;`; fxContainer.appendChild(fire);
        setTimeout(() => { fire.style.height = '140px'; }, 10); setTimeout(() => { fire.style.opacity = '0'; }, 250);
    } else if (typeStr === 'spirit' || typeStr === 'bird' || typeStr === 'balloon') {
        let color = typeStr === 'spirit' ? '#00BCD4' : (typeStr === 'bird' ? '#81D4FA' : '#FFFFFF'); let wave = document.createElement('div'); wave.style.cssText = `position:absolute; top:50%; left:50%; width:20px; height:20px; border:6px solid ${color}; border-radius:50%; box-shadow:0 0 15px ${color}; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.25s ease-out;`; fxContainer.appendChild(wave);
        let wave2 = document.createElement('div'); wave2.style.cssText = `position:absolute; top:50%; left:50%; width:20px; height:20px; border:3px solid ${color}; border-radius:50%; transform:translate(-50%, -50%) scale(0.5); opacity:1; transition:all 0.3s ease-out 0.05s;`; fxContainer.appendChild(wave2);
        setTimeout(() => { wave.style.transform = 'translate(-50%, -50%) scale(7)'; wave.style.opacity = '0'; wave2.style.transform = 'translate(-50%, -50%) scale(9)'; wave2.style.opacity = '0'; }, 10);
    } else if (typeStr === 'machine') {
        let bolt = document.createElement('div'); bolt.style.cssText = `position:absolute; top:50%; left:50%; width:100px; height:100px; transform:translate(-50%, -50%);`; bolt.innerHTML = `<svg viewBox="0 0 100 100" style="width:100%; height:100%; filter:drop-shadow(0 0 8px #FFEB3B);"><polyline points="50,0 35,45 65,45 50,100" fill="none" stroke="#FFF" stroke-width="8" stroke-linejoin="miter"/></svg>`; bolt.style.opacity = '0'; bolt.style.transition = 'opacity 0.05s'; fxContainer.appendChild(bolt);
        setTimeout(() => { bolt.style.opacity = '1'; }, 10); setTimeout(() => { bolt.style.opacity = '0'; }, 60); setTimeout(() => { bolt.style.opacity = '1'; }, 100); setTimeout(() => { bolt.style.opacity = '0'; }, 180);
    } else {
        let hit = document.createElement('div'); hit.style.cssText = `position:absolute; top:50%; left:50%; width:80px; height:80px; background:radial-gradient(circle, #FFF 10%, #FF9800 50%, transparent 80%); transform:translate(-50%, -50%) scale(0); opacity:1; transition:all 0.15s ease-out;`; fxContainer.appendChild(hit);
        setTimeout(() => { hit.style.transform = 'translate(-50%, -50%) scale(2)'; hit.style.opacity = '0'; }, 10);
    }
    setTimeout(() => { fxContainer.remove(); }, 600);
};

// ==========================================
// ★新規追加：AIの行動価値を評価するスコアリングエンジン（敵味方兼用版）
// ==========================================
window.evaluateArenaSkillScore = function(p, skillName, state, isEnemy = false) {
    let score = 0;
    let skill = window.ARENA_SKILLS[skillName];
    if (!skill) return -1000;

    let typeStr = (p.skin || 'robot').split('_')[0];
    if (skill.allowedTypes !== "all" && !skill.allowedTypes.includes(typeStr)) return -1000;
    if ((p.mp || 0) < skill.cost) return -1000;

    let myHpRate = p.hp / p.maxHp;
    
    // ★修正：isEnemy フラグによって、「味方」と「敵」の認識を反転させる
    let aliveOpponents = isEnemy ? state.party.filter(pt => pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) : state.enemies.filter(e => e.hp > 0);
    let myTeam = isEnemy ? state.enemies.filter(e => e.hp > 0) : state.party.filter(pt => pt.hp > 0 && pt.exploreTimer === 0);
    
    let teamHpRates = myTeam.map(pt => pt.hp / pt.maxHp);
    let lowestHpRate = teamHpRates.length > 0 ? Math.min(...teamHpRates) : 1.0;

    switch(skill.type) {
        case "attack":
            score = 50; 
            if (p.row === 'front') score += 20; 
            if (p.buffAtk > 1.0) score += 30;   
            if (p.isEquipped) score += 20;
            break;
        case "magic":
            score = 50;
            if (aliveOpponents.length >= 2) score += 40; 
            if (p.buffIntel > 1.0) score += 30; 
            if (p.row === 'back') score += 20;  
            break;
        case "heal":
        case "eat":
            if (myHpRate < 0.3) score = 150; 
            else if (myHpRate < 0.6) score = 80;
            else score = -500; 
            break;
        case "heal_all":
            if (lowestHpRate < 0.4) score = 200; 
            else if (lowestHpRate < 0.7) score = 100;
            else score = -500;
            break;
        case "defend":
            if (myHpRate < 0.5 && p.row === 'front') score = 90; 
            else score = 10;
            break;
        case "sleep":
            if (p.mp < skill.cost + 15) score = 120; 
            else if (myHpRate < 0.4) score = 60; 
            else score = -500; 
            break;
        case "buff":
            if (skill.stat === 'atk' && (p.buffAtk || 1.0) < 2.0) score = 70;
            else if (skill.stat === 'intel' && (p.buffIntel || 1.0) < 2.0) score = 70;
            else score = -500; 
            break;
        case "move":
            if (skill.dir === 'up' && p.row === 'back' && myHpRate > 0.6) score = 60; 
            else if (skill.dir === 'down' && p.row === 'front' && myHpRate < 0.4) score = 100; 
            else score = 5;
            break;
        case "summon":
            if (!state.guests.some(g => g.type === skill.master)) score = 110;
            else score = -1000; 
            break;
        case "call_rescue":
            if (!state.guests.some(g => ['soldier', 'captain', 'king'].includes(g.type))) score = 110;
            else score = -1000;
            break;
        case "equip":
            if (!p.isEquipped) score = 80; 
            else score = -1000; 
            break;
        case "build_hut":
            if ((p.hutHp || 0) <= 0 && myHpRate < 0.6) score = 90; 
            else score = -10;
            break;
        case "build_bridge":
            if (lowestHpRate < 0.5) score = 80; 
            else score = 10;
            break;
        case "build_farm":
            if (state.farmTimer === 0 && myHpRate > 0.6) score = 80; 
            else score = -10;
            break;
        case "random_build":
            if (myHpRate > 0.5) score = 60;
            else score = 10;
            break;
        case "explore":
            if (myHpRate > 0.8 && lowestHpRate > 0.6) score = 70; 
            else score = -500; 
            break;
        case "fishing":
            score = 40;
            break;
        default:
            score = 30;
    }
    return score;
};

// ==========================================
// ★究極改修：素早さ順行動＆連続行動＆回避搭載の最強ターン処理
// ==========================================
window.processArenaTurn = async function() {
    let state = window.ARENA_STATE;
    if (state.isProcessing && !state.skipMode) return;
    state.isProcessing = true;

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

    // --- ① ターン開始時：タイマー・ゲスト・回復処理 ---
    let startLogs = [];
    
    if (state.farmTimer > 0) {
        state.farmTimer--;
        if (state.farmTimer === 0) {
            if (Math.random() < 0.3) {
                startLogs.push(`しかし、設置した畑は虫に食い荒らされていた...(失敗)`);
            } else {
                state.party.forEach(p => { 
                    if(p.hp > 0) { 
                        let heal = Math.max(50, Math.floor(p.maxHp * 0.15));
                        p.hp = Math.min(p.maxHp, p.hp + heal); p.buffAtk += 0.2; 
                    }
                });
                startLogs.push(`【大豊作！】畑から作物が供給され、味方全員の体力回復＆攻撃アップ！🌱`);
            }
        }
    }

    for (let p of state.party) {
        if (p.hp <= 0) continue;
        if (p.exploreTimer > 0) {
            p.exploreTimer--;
            if (p.exploreTimer === 0) {
                if (p.exploreOriginalTurn === 2) {
                    let healHp = Math.max(30, Math.floor(p.maxHp * 0.2)); let healMp = Math.max(20, Math.floor(p.maxMp * 0.2));
                    p.hp = Math.min(p.maxHp, p.hp + healHp); p.mp = Math.min(p.maxMp, p.mp + healMp);
                    startLogs.push(`${p.name} が探検から帰還！見つけた食料で回復した！🍖`);
                } else if (p.exploreOriginalTurn === 3) {
                    let aliveEnemies = state.enemies.filter(e => e.hp > 0);
                    if (aliveEnemies.length > 0) {
                        let t = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                        let logDmg = Math.max(40, Math.floor(p.atk * p.buffAtk * 0.8));
                        t.hp -= logDmg; t.flash = true;
                        startLogs.push(`${p.name} が探検から帰還！拾った丸太を ${t.name} に投げつけ ${logDmg} ダメージ！🪵`);
                        setTimeout(()=>{ t.flash = false; render(); }, 150);
                    }
                } else if (p.exploreOriginalTurn >= 4) {
                    state.party.forEach(pt => { pt.buffAtk += 0.5; pt.buffIntel += 0.5; });
                    startLogs.push(`【奇跡】${p.name} が探検から帰還！大いなる財宝の力で味方全員が超強化！💎`);
                }
            }
        }
        if (p.isSleeping && p.exploreTimer === 0) {
            p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.2)); p.mp = Math.min(p.maxMp, p.mp + 15);
            startLogs.push(`${p.name} は眠って体力・MPを回復した！(💤)`); p.isSleeping = false; 
        }
        if (p.hutHp > 0 && p.exploreTimer === 0 && !p.isSleeping) {
            let healHp = Math.max(15, Math.floor(p.maxHp * 0.1));
            p.hp = Math.min(p.maxHp, p.hp + healHp); p.mp = Math.min(p.maxMp, p.mp + 10);
            startLogs.push(`${p.name} は小屋の中で安全に回復した！(🏠)`);
        }
    }

    for (let e of state.enemies) {
        if (e.hp <= 0) continue;
        if (e.exploreTimer > 0) {
            e.exploreTimer--;
            if (e.exploreTimer === 0) {
                if (e.exploreOriginalTurn === 2) {
                    let healHp = Math.max(30, Math.floor(e.maxHp * 0.2));
                    e.hp = Math.min(e.maxHp, e.hp + healHp); e.mp = Math.min(e.maxMp || 100, (e.mp||0) + 20);
                    startLogs.push(`<span style="color:#ff5252;">${e.name} が探検から帰還し、回復した！🍖</span>`);
                } else if (e.exploreOriginalTurn === 3) {
                    let aliveParty = state.party.filter(p => p.hp > 0);
                    if (aliveParty.length > 0) {
                        let t = aliveParty[Math.floor(Math.random() * aliveParty.length)];
                        let logDmg = Math.max(40, Math.floor(e.atk * e.buffAtk * 0.8));
                        t.hp -= logDmg; t.flash = true;
                        startLogs.push(`<span style="color:#ff5252;">${e.name} が帰還！ ${t.name} に丸太を投げつけ ${logDmg} ダメージ！🪵</span>`);
                        setTimeout(()=>{ t.flash = false; render(); }, 150);
                    }
                } else if (e.exploreOriginalTurn >= 4) {
                    state.enemies.forEach(en => { en.buffAtk = (en.buffAtk||1) + 0.5; en.buffDef = (en.buffDef||1) + 0.5; });
                    startLogs.push(`<span style="color:#ff5252;">【驚愕】${e.name} が財宝を持ち帰り、敵全員が超強化！💎</span>`);
                }
            }
        }
        if (e.isSleeping && e.exploreTimer === 0) {
            e.hp = Math.min(e.maxHp, e.hp + Math.floor(e.maxHp * 0.2));
            startLogs.push(`<span style="color:#ff5252;">${e.name} は眠って体力を回復した！(💤)</span>`); e.isSleeping = false; 
        }
        if (e.hutHp > 0 && e.exploreTimer === 0 && !e.isSleeping) {
            let healHp = Math.max(15, Math.floor(e.maxHp * 0.1));
            e.hp = Math.min(e.maxHp, e.hp + healHp);
            startLogs.push(`<span style="color:#ff5252;">${e.name} は小屋の中で回復した！(🏠)</span>`);
        }
    }

    if (state.guests.some(g => g.type === 'cooking')) {
        state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) p.hp = Math.min(p.maxHp, p.hp + Math.max(20, Math.floor(p.maxHp * 0.15))); });
        startLogs.push(`料理人の特製スープで味方全員のHPが回復！(🍲)`);
    }
    if (state.guests.some(g => g.type === 'building')) {
        state.party.forEach(p => { if(p.hp > 0 && p.exploreTimer === 0) p.shield = true; });
        startLogs.push(`建築士が味方陣地に「防壁」を展開した！(🧱)`);
    }
    if (state.guests.some(g => g.type === 'king')) {
        state.party.forEach(p => { if(p.hp > 0) p.buffAtk += 0.1; });
        let defDrop = Math.max(2, Math.floor(avgInt * 0.05));
        state.enemies.forEach(e => { if(e.hp > 0) e.def = Math.max(0, e.def - defDrop); });
        startLogs.push(`王様の号令！味方の攻撃力が上がり、敵の防御力が下がった！(👑)`);
    }

    if (startLogs.length > 0) {
        state.log.push(...startLogs.map(t => `<span style="color:#76ff03;">${t}</span>`));
        render(); await wait(800);
    }

    let aliveEnemies = state.enemies.filter(e => e.hp > 0);
    for (let g of state.guests) {
        if (aliveEnemies.length === 0) break;
        let t = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        if (g.type === 'smithing') {
            let dmg = Math.max(30, Math.floor(avgAtk * 0.8)); t.hp -= dmg; t.flash = true;
            state.log.push(`<span style="color:#FF9800;">鍛冶師のハンマー！ ${t.name} に ${dmg} のダメージ！(🔨)</span>`);
            render(); await wait(150); t.flash = false; render(); await wait(400);
        } else if (g.type === 'fishing') {
            let dmg = Math.max(15, Math.floor(avgAtk * 0.4)); t.hp -= dmg; t.flash = true;
            state.log.push(`<span style="color:#00BCD4;">漁師の大物釣り！ ${t.name} に ${dmg} のダメージ！(🎣)</span>`);
            render(); await wait(150); t.flash = false; render(); await wait(400);
        } else if (g.type === 'explore') {
            let defDrop = Math.max(5, Math.floor(avgInt * 0.1)); t.def = Math.max(0, t.def - defDrop);
            state.log.push(`<span style="color:#E040FB;">冒険家の罠！ ${t.name} の防御力が大幅に下がった！(🗺️)</span>`);
            render(); await wait(500);
        } else if (g.type === 'soldier') {
            let dmg = Math.max(20, Math.floor(avgAtk * 0.6)); t.hp -= dmg; t.flash = true;
            state.log.push(`<span style="color:#FFF;">城の兵士の攻撃！ ${t.name} に ${dmg} のダメージ！(⚔️)</span>`);
            render(); await wait(150); t.flash = false; render(); await wait(400);
        } else if (g.type === 'captain') {
            let dmg = Math.max(35, Math.floor(avgAtk * 1.2)); t.hp -= dmg; t.flash = true;
            state.log.push(`<span style="color:#FFD700;">城の隊長の強撃！ ${t.name} に ${dmg} のダメージ！(🛡️)</span>`);
            render(); await wait(150); t.flash = false; render(); await wait(400);
        }
    }

    // ==========================================
    // ★② 素早さによる行動順ソート＆連続行動キュー作成
    // ==========================================
    let allFighters = [];
    state.party.forEach(p => { if (p.hp > 0 && p.exploreTimer === 0 && !p.isSleeping) allFighters.push({ isEnemy: false, obj: p }); });
    state.enemies.forEach(e => { if (e.hp > 0 && e.exploreTimer === 0 && !e.isSleeping) allFighters.push({ isEnemy: true, obj: e }); });
    
    // 素早さ順に行動順を並び替える
    allFighters.sort((a, b) => (b.obj.speed || 10) - (a.obj.speed || 10));

    for (let fighter of allFighters) {
        let actor = fighter.obj;
        if (actor.hp <= 0) continue; 
        
        let alivePartyCheck = state.party.filter(p => p.hp > 0);
        let aliveEnemiesCheck = state.enemies.filter(e => e.hp > 0);
        if (alivePartyCheck.length === 0 || aliveEnemiesCheck.length === 0) break; // 勝負がついた

        let actionCount = 1 + Math.floor((actor.speed || 10) / 50);
        if (actionCount > 1) {
            let color = fighter.isEnemy ? "#ff5252" : "#00e676";
            state.log.push(`<span style="color:${color}; font-weight:bold;">💨 ${actor.name} は素早さを活かして ${actionCount}回 連続行動する！</span>`);
            render(); await wait(400);
        }

        // ==========================================
        // ③ キャラクターごとの行動ループ
        // ==========================================
        for (let act = 0; act < actionCount; act++) {
            if (actor.hp <= 0) break;

            alivePartyCheck = state.party.filter(p => p.hp > 0);
            aliveEnemiesCheck = state.enemies.filter(e => e.hp > 0);
            if (alivePartyCheck.length === 0 || aliveEnemiesCheck.length === 0) {
                actionCount = 0; // 残りの行動回数を破棄
                break;
            }

            if (!fighter.isEnemy) {
                // ---------- 味方のアクション ----------
                let p = actor;
                let typeStr = (p.skin || 'robot').split('_')[0];
                let validWords = p.words.length > 0 ? [...p.words] : ["たたかう"];
                let chosenSkillName = "たたかう";

                let scoredSkills = validWords.map(w => {
                    return { name: w, score: window.evaluateArenaSkillScore(p, w, state, false) };
                }).filter(s => s.score > -100);

                let smartChance = Math.min(0.95, (p.intel || 10) / 100); 
                if (scoredSkills.length === 0) { chosenSkillName = "たたかう"; }
                else {
                    scoredSkills.sort((a, b) => b.score - a.score); 
                    if (Math.random() < smartChance) {
                        let topScore = scoredSkills[0].score;
                        let topSkills = scoredSkills.filter(s => s.score === topScore);
                        chosenSkillName = topSkills[Math.floor(Math.random() * topSkills.length)].name;
                    } else {
                        chosenSkillName = scoredSkills[Math.floor(Math.random() * scoredSkills.length)].name;
                    }
                }

                let skill = window.ARENA_SKILLS[chosenSkillName] || window.ARENA_SKILLS["たたかう"];

                if (skill.allowedTypes !== "all" && !skill.allowedTypes.includes(typeStr)) {
                    state.log.push(`<span style="color:#4fc3f7;">${p.name} は「${chosenSkillName}」を使おうとしたが失敗した...</span>`); render(); await wait(400); continue;
                }
                if (p.mp < skill.cost) {
                    state.log.push(`<span style="color:#4fc3f7;">${p.name} は「${chosenSkillName}」を使おうとしたがMPが足りない！</span>`); render(); await wait(400); continue;
                }

                state.log.push(`<span style="color:#4fc3f7;">${p.name} は「${chosenSkillName}」を使った！</span>`);
                render(); await wait(400);
                p.mp -= skill.cost;

                if (skill.type === "move") {
                    if (skill.dir === 'up') p.row = 'front'; if (skill.dir === 'down') p.row = 'back';
                    if (skill.dir === 'left') p.col = Math.max(0, p.col - 1); if (skill.dir === 'right') p.col = Math.min(3, p.col + 1);
                    state.log.push(`<span style="color:#FFF;">陣形を「${skill.name}」に変更した！</span>`); render(); await wait(500);
                }
                else if (skill.type === "buff") {
                    if (skill.stat === 'atk') p.buffAtk += 0.5; if (skill.stat === 'intel') p.buffIntel += 0.5;
                    state.log.push(`<span style="color:#FFC107;">気合が入り、${skill.name}した！</span>`); render(); await wait(500);
                }
                else if (skill.type === "sleep") {
                    p.isSleeping = true; state.log.push(`<span style="color:#aaa;">${p.name} は その場でぐっすり眠りについた...💤</span>`); render(); await wait(500); break; // 眠ったら連続行動もストップ
                }
                else if (skill.type === "summon") {
                    if (!state.guests.some(g => g.type === skill.master)) {
                        let masterHP = Math.max(10, Math.floor(avgHp * (skill.master === 'farming' ? 1.5 : 0.3))); 
                        state.guests.push({ type: skill.master, hp: masterHP, maxHp: masterHP });
                        state.log.push(`<span style="color:#E91E63; font-weight:bold;">${skill.name}により師匠が駆けつけた！！</span>`);
                    } else { state.log.push(`<span style="color:#aaa;">しかし、既に呼ばれていた！(失敗)</span>`); }
                    render(); await wait(500);
                }
                else if (skill.type === "call_rescue") {
                    let rTypes = ['soldier', 'soldier', 'captain', 'king']; let gType = rTypes[Math.floor(Math.random() * rTypes.length)];
                    let gHp = Math.floor(avgHp * (gType === 'captain' ? 0.8 : (gType === 'soldier' ? 0.5 : 0.3))); gHp = Math.max(10, gHp);
                    state.guests.push({ type: gType, hp: gHp, maxHp: gHp });
                    state.log.push(`<span style="color:#FFD700; font-weight:bold;">城から援軍が到着した！</span>`); render(); await wait(500);
                }
                else if (skill.type === "build_hut") {
                    p.hutHp = 5; state.log.push(`<span style="color:#FFF;">${p.name} は頑丈な小屋に立てこもった！(🏠)</span>`); render(); await wait(500);
                }
                else if (skill.type === "build_bridge") {
                    state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0) pt.row = 'back'; });
                    state.log.push(`<span style="color:#00BCD4;">橋を架けて、味方全員が後衛に退避した！</span>`); render(); await wait(500);
                }
                else if (skill.type === "build_farm") {
                    state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">急いで畑を耕した！</span>`); render(); await wait(500);
                }
                else if (skill.type === "random_build") {
                    let rnd = Math.random();
                    if (rnd < 0.25) { p.hutHp = 5; state.log.push(`<span style="color:#FFF;">小屋が完成し、中に立てこもった！</span>`); }
                    else if (rnd < 0.5) { state.party.forEach(pt => pt.row = 'back'); state.log.push(`<span style="color:#00BCD4;">橋が完成し、全員で後衛に退避した！</span>`); }
                    else if (rnd < 0.75) { state.farmTimer = 4; state.log.push(`<span style="color:#4CAF50;">畑が完成した！収穫を待とう...</span>`); }
                    else { 
                        let bHp = Math.max(10, Math.floor(avgHp * 0.5)); state.guests.push({ type: 'soldier', hp: bHp, maxHp: bHp }); 
                        state.log.push(`<span style="color:#FFD700;">城の設備を作り、兵士を呼び込んだ！</span>`); 
                    }
                    render(); await wait(500);
                }
                else if (skill.type === "explore") {
                    p.exploreOriginalTurn = 2 + Math.floor(Math.random() * 3); p.exploreTimer = p.exploreOriginalTurn;
                    state.log.push(`<span style="color:#E040FB;">「ちょっと探検してくる！」 ${p.name} は戦場から姿を消した...</span>`); render(); await wait(500); break; // 探検に出たら連続行動ストップ
                }
                else if (skill.type === "fishing") {
                    let r = Math.random();
                    if (r < 0.33) {
                        let t = aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)];
                        
                        // ★回避判定バグ修正：正しくカッコで括る！
                        let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                        if (Math.random() < dodgeChance) {
                            state.log.push(`<span style="color:#aaa;">大物が釣れたが、${t.name} は素早く躱した！(MISS)</span>`);
                        } else {
                            let fishDmg = Math.max(30, Math.floor(p.atk * p.buffAtk * 0.6));
                            t.hp -= fishDmg; t.flash = true;
                            state.log.push(`<span style="color:#00BCD4;">大物が釣れた！暴れる魚が ${t.name} に ${fishDmg} のダメージ！🎣</span>`);
                            render(); await wait(150); t.flash = false;
                        }
                        render(); await wait(500);
                    } else if (r < 0.66) {
                        let fishHeal = Math.max(40, Math.floor(p.maxHp * 0.2)); p.hp = Math.min(p.maxHp, p.hp + fishHeal); 
                        state.log.push(`<span style="color:#76ff03;">新鮮な魚を刺身にして食べた！HP回復！🍣</span>`); render(); await wait(500);
                    } else {
                        state.log.push(`<span style="color:#aaa;">...空き缶が釣れた。(失敗)</span>`); render(); await wait(500);
                    }
                }
                else if (skill.type === "eat") {
                    let eatHealHp = Math.max(50, Math.floor(p.maxHp * 0.25)); let eatHealMp = Math.max(20, Math.floor(p.maxMp * 0.15));
                    p.hp = Math.min(p.maxHp, p.hp + eatHealHp); p.mp = Math.min(p.maxMp, p.mp + eatHealMp);
                    state.log.push(`<span style="color:#76ff03;">持っていた食料を食べた！HPとMPが大回復！🍖</span>`); render(); await wait(500);
                }
                else if (skill.type === "equip") {
                    p.buffAtk += 0.5; p.isEquipped = true; state.log.push(`<span style="color:#FFC107;">武器を構えた！攻撃力大幅アップ！🗡️</span>`); render(); await wait(500);
                }
                else if (skill.type === "unequip") {
                    if (p.isEquipped) { p.buffAtk = Math.max(1.0, p.buffAtk - 0.5); p.isEquipped = false; state.log.push(`<span style="color:#aaa;">重い装備を外して身軽になった。</span>`); }
                    else { state.log.push(`<span style="color:#aaa;">しかし何も装備していなかった。</span>`); }
                    render(); await wait(500);
                }
                else if (skill.type === "attack" || skill.type === "magic") {
                    let target = aliveEnemiesCheck[Math.floor(Math.random() * aliveEnemiesCheck.length)];
                    let targets = skill.target === "all" ? aliveEnemiesCheck : [target];
                    
                    for(let t of targets) { if(!state.skipMode) window.showArenaEffect(t.id, typeStr); }
                    await wait(350); 
                    for(let t of targets) { t.flash = true; }
                    render(); await wait(150);
                    for(let t of targets) { t.flash = false; }
                    render();
                    
                    for(let t of targets) {
                        // ★回避判定バグ修正：正しくカッコで括る！
                        let dodgeChance = Math.min(0.8, Math.max(0, ((t.speed || 10) - (p.speed || 10)) * 0.05));
                        if (Math.random() < dodgeChance) {
                            state.log.push(`<span style="color:#aaa;">${t.name} は攻撃をヒラリと避けた！(MISS)</span>`);
                            continue;
                        }

                        let finalAtk = p.atk * p.buffAtk;
                        if (skill.type === "magic") finalAtk = p.intel * p.buffIntel;
                        let dmgMultiplier = 1.0;
                        if (p.row === 'back' && skill.type === "attack") dmgMultiplier = 0.7; 
                        if (p.hutHp > 0) dmgMultiplier *= 0.8; 
                        
                        let dmg = Math.floor(finalAtk * skill.power * dmgMultiplier) - Math.floor(t.def * 0.5);
                        dmg = Math.max(1, dmg); 
                        t.hp -= dmg;
                        state.log.push(`<span style="color:#FFF;">${t.name} に ${dmg} のダメージ！</span>`);
                    }
                    render(); await wait(600);
                } 
                else if (skill.type === "heal") {
                    p.hp = Math.min(p.maxHp, p.hp + skill.power + Math.floor(p.intel * p.buffIntel * 0.5));
                    state.log.push(`<span style="color:#76ff03;">${p.name} のHPが回復した！</span>`); render(); await wait(600);
                } else if (skill.type === "heal_all") {
                    for (let pt of state.party) { if(pt.hp > 0 && pt.exploreTimer === 0) pt.hp = Math.min(pt.maxHp, pt.hp + skill.power + Math.floor(p.intel * pt.buffIntel * 0.3)); }
                    state.log.push(`<span style="color:#76ff03;">味方全員のHPが回復した！</span>`); render(); await wait(600);
                } else if (skill.type === "defend") {
                    p.shield = true; state.log.push(`<span style="color:#FFF;">${p.name} は身を固めている！（次ダメージ半減）</span>`); render(); await wait(600);
                }

            } else {
                // ---------- 敵のアクション ----------
                let e = actor;
                
                let targets = [];
                state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) targets.push({ obj: pt, isGuest: false, row: pt.row, col: pt.col }); });
                state.guests.forEach(g => { if (g.hp > 0 && ['farming', 'soldier', 'captain', 'king'].includes(g.type)) targets.push({ obj: g, isGuest: true, type: g.type, row: 'front', col: 1.5 }); });
                
                if (targets.length === 0) {
                    state.party.forEach(pt => { if (pt.hp > 0 && pt.exploreTimer === 0) targets.push({ obj: pt, isGuest: false, row: pt.row, col: pt.col }); });
                    if (targets.length === 0) break;
                }

                let hateList = targets.map(t => {
                    let hate = 10;
                    if (t.row === 'back') hate -= 6; 
                    if (t.isGuest) {
                        if (t.type === 'captain') hate += 100; 
                        if (t.type === 'farming') hate += 200; 
                        if (t.type === 'soldier') hate += 5;
                        if (t.type === 'king') hate += 5;
                    } else { hate += (3 - t.col) * 2; }
                    return { target: t, hate: Math.max(1, hate) };
                });
                
                let totalHate = hateList.reduce((s, i) => s + i.hate, 0);
                let rHate = Math.random() * totalHate;
                let finalTargetData = hateList[0].target;
                for (let item of hateList) {
                    rHate -= item.hate;
                    if (rHate <= 0) { finalTargetData = item.target; break; }
                }

                let targetObj = finalTargetData.obj;
                let defValue = finalTargetData.isGuest ? Math.floor(avgDef * 0.5) : targetObj.def;
                
                let baseAtk = e.atk * (e.buffAtk || 1.0);
                let dmgMultiplier = 1.0;
                if (e.hutHp > 0) dmgMultiplier *= 0.8;
                
                let dmg = 0; let logMsg = null;
                let actionType = "attack"; let skillName = "通常攻撃";
                
                let r = Math.random();
                if (e.isBoss) {
                    // 万が一辞書にない種族が来た場合のフォールバック（保険）
                    let fallbackPatterns = [
                        { actionType: "buff_atk", skillName: "威圧" },
                        { actionType: "attack", skillName: "強撃" },
                        { actionType: "heavy", skillName: "粉砕" },
                        { actionType: "magic_all", skillName: "魔力解放" },
                        { actionType: "buff_def", skillName: "防壁" },
                        { actionType: "heavy_magic", skillName: "裁き" }
                    ];

                    // 自分の種族ID（robot_type1_2 など）に完全一致するパターンを辞書から取得
                    let targetKey = e.bossTypeKey || e.type || "";
                    let bossPatterns = (window.ARENA_BOSS_PATTERNS && window.ARENA_BOSS_PATTERNS[targetKey]) 
                                       ? window.ARENA_BOSS_PATTERNS[targetKey] 
                                       : fallbackPatterns;

                    let pat = bossPatterns[e.patternStep % bossPatterns.length];
                    e.patternStep++; 
                    actionType = pat.actionType; 
                    skillName = pat.skillName;

                } else if (e.isFriend) {
                    let validWords = e.words && e.words.length > 0 ? [...e.words] : ["たたかう"];
                    let scoredSkills = validWords.map(w => {
                        return { name: w, score: window.evaluateArenaSkillScore(e, w, state, true) };
                    }).filter(s => s.score > -100);

                    let smartChance = Math.min(0.95, (e.intel || 10) / 100); 
                    if (scoredSkills.length === 0) skillName = "たたかう";
                    else {
                        scoredSkills.sort((a, b) => b.score - a.score); 
                        if (Math.random() < smartChance) {
                            let topSkills = scoredSkills.filter(s => s.score === scoredSkills[0].score);
                            skillName = topSkills[Math.floor(Math.random() * topSkills.length)].name;
                        } else {
                            skillName = scoredSkills[Math.floor(Math.random() * scoredSkills.length)].name;
                        }
                    }
                    
                    let skill = window.ARENA_SKILLS[skillName] || window.ARENA_SKILLS["たたかう"];
                    e.mp = Math.max(0, (e.mp || 0) - (skill.cost || 0)); 
                    
                    actionType = skill.type;
                    if (actionType === "attack") actionType = "heavy"; 
                    if (actionType === "magic") actionType = skill.target === "all" ? "magic_all" : "heavy_magic";
                } else {
                    if (e.type === 'robot') { if (r < 0.3) { actionType = "heavy"; skillName = "ロケットパンチ"; } else if (r < 0.5) { actionType = "buff_atk"; skillName = "リミッター解除"; } }
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

                if (actionType === "move") {
                    let skill = window.ARENA_SKILLS[skillName];
                    if (skill && skill.dir === 'up') e.row = 'front';
                    if (skill && skill.dir === 'down') e.row = 'back';
                    state.log.push(`<span style="color:#ff5252;">${e.name} が陣形を「${skillName}」に変更した！</span>`);
                    render(); await wait(600); continue;
                } else if (actionType === "buff" || actionType === "buff_atk") {
                    let skill = window.ARENA_SKILLS[skillName];
                    if (skill && skill.stat === 'intel') e.buffDef = (e.buffDef||1) + 0.5; 
                    else e.buffAtk = (e.buffAtk||1) + 0.5;
                    state.log.push(`<span style="color:#ff5252;">${e.name} が気合を入れた！（効果アップ）</span>`);
                    render(); await wait(600); continue;
                } else if (actionType === "sleep") {
                    e.isSleeping = true; state.log.push(`<span style="color:#ff5252;">${e.name} は その場でぐっすり眠りについた...💤</span>`); render(); await wait(600); break;
                } else if (actionType === "summon" || actionType === "call_rescue") {
                    let skill = window.ARENA_SKILLS[skillName]; let masterType = skill ? skill.master : null;
                    if (actionType === "call_rescue") { let rTypes = ['soldier', 'soldier', 'captain', 'king']; masterType = rTypes[Math.floor(Math.random() * rTypes.length)]; }
                    if (masterType) {
                        let gHp = masterType === 'captain' ? 100 : (masterType === 'soldier' ? 50 : (masterType === 'king' ? 30 : 20));
                        if (state.mode === 'boss' || state.mode === 'normal') {
                            let calcWave = state.mode === 'boss' ? state.wave * 50 : state.wave; 
                            let waveMinus = calcWave - 1; let hpMult = 1 + (waveMinus * 0.3) + (Math.pow(1.04, waveMinus) - 1);
                            gHp = Math.floor(gHp * hpMult);
                        }
                        let gAtk = Math.max(20, Math.floor(e.atk * 0.5)); let gDef = Math.max(5, Math.floor(e.def * 0.5));
                        let spriteKey = "arena_" + masterType; let mName = "幻影の助っ人";
                        if (masterType === 'soldier') mName = "城の兵士"; else if (masterType === 'captain') mName = "城の隊長"; else if (masterType === 'king') mName = "王様"; else if (masterType === 'explore') mName = "冒険家"; else if (masterType === 'fishing') { mName = "漁師"; spriteKey = "arena_fisherman"; } 
                        else if (masterType === 'cooking') mName = "料理人"; else if (masterType === 'farming') mName = "農家"; else if (masterType === 'building') mName = "建築士"; else if (masterType === 'smithing') mName = "鍛冶師";
                        
                        state.enemies.push({ id: `e_${state.enemies.length}_${Date.now()}`, baseName: mName, name: mName, spriteKey: spriteKey, type: masterType, hp: gHp, maxHp: gHp, atk: gAtk, def: gDef, buffAtk: 1.0, buffDef: 1.0, row: 'back', col: 0 });
                        state.log.push(`<span style="color:#ff5252;">なんと！${e.name} が ${mName} を呼び出した！！</span>`);
                    }
                    render(); await wait(600); continue;
                } else if (actionType === "build_hut") {
                    e.hutHp = 5; state.log.push(`<span style="color:#ff5252;">${e.name} は頑丈な小屋に立てこもった！(🏠)</span>`); render(); await wait(600); continue;
                } else if (actionType === "build_bridge") {
                    state.enemies.forEach(en => { if (en.hp > 0 && en.exploreTimer === 0) en.row = 'back'; });
                    state.log.push(`<span style="color:#ff5252;">${e.name} が橋を架け、敵全員が後衛に退避した！</span>`); render(); await wait(600); continue;
                } else if (actionType === "build_farm") {
                    state.log.push(`<span style="color:#ff5252;">${e.name} は急いで畑を耕した！</span>`);
                    state.enemies.forEach(en => { if(en.hp > 0) en.hp = Math.min(en.maxHp, en.hp + Math.max(50, Math.floor(en.maxHp * 0.15))); });
                    render(); await wait(600); continue;
                } else if (actionType === "random_build") {
                    let rnd = Math.random();
                    if (rnd < 0.33) { e.hutHp = 5; state.log.push(`<span style="color:#ff5252;">${e.name} は小屋を作り立てこもった！</span>`); }
                    else if (rnd < 0.66) { state.enemies.forEach(en => en.row = 'back'); state.log.push(`<span style="color:#ff5252;">敵陣に橋が完成し、敵が退避した！</span>`); }
                    else { e.shield = true; state.log.push(`<span style="color:#ff5252;">敵陣に防壁が完成した！</span>`); }
                    render(); await wait(600); continue;
                } else if (actionType === "explore") {
                    e.exploreOriginalTurn = 2 + Math.floor(Math.random() * 3); e.exploreTimer = e.exploreOriginalTurn;
                    state.log.push(`<span style="color:#ff5252;">${e.name} は戦場から姿を消した... (探検中)</span>`); render(); await wait(600); break;
                } else if (actionType === "fishing") {
                    let r = Math.random();
                    if (r < 0.33) {
                        // ★敵の回避判定
                        let dodgeChance = Math.min(0.8, Math.max(0, ((targetObj.speed||10) - (e.speed||10)) * 0.05));
                        if (Math.random() < dodgeChance) {
                            state.log.push(`<span style="color:#aaa;">敵が釣り上げた大物を ${targetObj.name||"味方"} はヒラリと避けた！(MISS)</span>`);
                        } else {
                            targetObj.flash = true;
                            let fishDmg = Math.max(30, Math.floor(e.atk * e.buffAtk * 0.6)); targetObj.hp -= fishDmg; 
                            state.log.push(`<span style="color:#ff5252;">${e.name} が釣った大物が ${targetObj.name||"味方"} に ${fishDmg} のダメージ！🎣</span>`);
                            render(); await wait(150); targetObj.flash = false;
                        }
                        render(); await wait(500);
                    } else if (r < 0.66) {
                        let fishHeal = Math.max(40, Math.floor(e.maxHp * 0.2)); e.hp = Math.min(e.maxHp, e.hp + fishHeal); 
                        state.log.push(`<span style="color:#ff5252;">${e.name} は魚を食べてHP回復！🍣</span>`); render(); await wait(600);
                    } else { state.log.push(`<span style="color:#aaa;">${e.name} は空き缶を釣った。(失敗)</span>`); render(); await wait(600); }
                    continue;
                } else if (actionType === "eat") {
                    let eatHealHp = Math.max(50, Math.floor(e.maxHp * 0.25)); let eatHealMp = Math.max(20, Math.floor((e.maxMp||100) * 0.15));
                    e.hp = Math.min(e.maxHp, e.hp + eatHealHp); e.mp = Math.min(e.maxMp || 100, (e.mp || 0) + eatHealMp);
                    state.log.push(`<span style="color:#ff5252;">${e.name} は食料を食べて回復した！🍖</span>`); render(); await wait(600); continue;
                } else if (actionType === "equip") {
                    e.buffAtk = (e.buffAtk||1) + 0.5; e.isEquipped = true; state.log.push(`<span style="color:#ff5252;">${e.name} が武器を構えた！攻撃力大幅アップ！🗡️</span>`); render(); await wait(600); continue;
                } else if (actionType === "unequip") {
                    if (e.isEquipped) { e.buffAtk = Math.max(1.0, e.buffAtk - 0.5); e.isEquipped = false; state.log.push(`<span style="color:#aaa;">${e.name} は装備を外した。</span>`); }
                    else { state.log.push(`<span style="color:#aaa;">${e.name} は何も装備していなかった。</span>`); }
                    render(); await wait(600); continue;
                } else if (actionType === "defend" || actionType === "buff_def") {
                    e.shield = true; state.log.push(`<span style="color:#ff5252;">${e.name} は身を固めている！（次ダメージ半減）</span>`); render(); await wait(600); continue;
                } else if (actionType === "heal_all") {
                    let healAmount = Math.floor(e.maxHp * 0.2); state.enemies.forEach(en => { if(en.hp>0) en.hp = Math.min(en.maxHp, en.hp + healAmount); });
                    state.log.push(`<span style="color:#ff5252;">${e.name} の【${skillName}】！ 敵全体の体力が回復した！</span>`); render(); await wait(600); continue;
                } else if (actionType === "heal_ally" || actionType === "heal_self" || actionType === "heal") {
                    let healAmount = Math.floor(e.maxHp * 0.2);
                    if (actionType === "heal_ally") {
                        let lowestE = state.enemies.filter(en=>en.hp>0).sort((a,b)=>a.hp-b.hp)[0]; lowestE.hp = Math.min(lowestE.maxHp, lowestE.hp + healAmount);
                    } else { e.hp = Math.min(e.maxHp, e.hp + healAmount); }
                    state.log.push(`<span style="color:#ff5252;">${e.name} の【${skillName}】！ 敵の体力が回復した！</span>`); render(); await wait(600); continue;
                } else if (actionType === "debuff_def") {
                    state.party.forEach(pt => { if(pt.hp > 0) pt.def = Math.max(0, Math.floor(pt.def * 0.9)); });
                    state.log.push(`<span style="color:#9C27B0;">${e.name} の【${skillName}】！ 味方全体の防御力が下げられた！</span>`); render(); await wait(600); continue;
                } 
                else if (actionType === "summon_enemy") {
                    let aliveEnemiesCount = state.enemies.filter(en => en.hp > 0).length;
                    if (aliveEnemiesCount < 8 && !e.isBoss && !e.isFriend) {
                        let rKey = null;
                        if (e.type === 'seed' || e.type === 'ghost') {
                            let possibleKeys = Object.keys(window.ARENA_ENEMIES).filter(k => window.ARENA_ENEMIES[k].type === e.type); rKey = possibleKeys[0];
                        } else {
                            let discoveredTypes = (window.aiPet.discoveredMonsters || []).map(k => k.split('_')[0]);
                            let enemyKeys = Object.keys(window.ARENA_ENEMIES).filter(k => discoveredTypes.includes(window.ARENA_ENEMIES[k].type));
                            if (enemyKeys.length === 0) enemyKeys = ['robot']; rKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
                        }
                        
                        let base = window.ARENA_ENEMIES[rKey]; let spawnCount = state.enemySpawnCounts[base.name] || 0;
                        const getSuffix = (index) => String.fromCharCode(65 + (index % 26));

                        if (spawnCount === 1) { let existing = state.enemies.find(en => en.baseName === base.name); if (existing && existing.name === base.name) existing.name = `${base.name} A`; }
                        state.enemySpawnCounts[base.name] = spawnCount + 1; let spawnIndex = state.enemySpawnCounts[base.name] - 1; let newName = (state.enemySpawnCounts[base.name] > 1) ? `${base.name} ${getSuffix(spawnIndex)}` : base.name;

                        let waveMinus = state.wave - 1; let hpMultiplier = 1 + (waveMinus * 0.3) + (Math.pow(1.04, waveMinus) - 1); let atkMultiplier = 1 + (waveMinus * 0.2) + (Math.pow(1.03, waveMinus) - 1); let defMultiplier = 1 + (waveMinus * 0.1) + (Math.pow(1.02, waveMinus) - 1); let spdMultiplier = 1 + (waveMinus * 0.05);

                        let eHp = Math.floor(base.hp * hpMultiplier + (state.wave * 10)); let eAtk = Math.floor(base.atk * atkMultiplier + (state.wave * 2)); let eDef = Math.floor(base.def * defMultiplier + (state.wave * 1)); let eSpd = Math.floor((base.speed||10) * spdMultiplier);

                        state.enemies.push({ id: `e_${state.enemies.length}_${Date.now()}`, baseName: base.name, name: newName, spriteKey: base.spriteKey, type: base.type, hp: eHp, maxHp: eHp, atk: eAtk, def: eDef, speed: eSpd, buffAtk: 1.0, buffDef: 1.0, row: 'back' });
                        state.log.push(`<span style="color:#00BCD4;">${e.name} の【${skillName}】！ 新たな魔物（${newName}）が現れた！</span>`);
                        render(); await wait(800); continue;
                    } else { state.log.push(`<span style="color:#aaa;">${e.name} は【${skillName}】を使ったが、これ以上は現れなかった...</span>`); render(); await wait(800); continue; }
                }

                if (actionType === "magic_all") {
                    let dmg = Math.max(1, Math.floor(baseAtk * 0.8));
                    state.log.push(`<span style="color:#ff5252;">${e.name} の【${skillName}】！</span>`);
                    render(); await wait(300);

                    let allTargets = [];
                    state.party.forEach(pt => { if(pt.hp > 0 && pt.exploreTimer === 0 && !pt.isSleeping) allTargets.push({obj: pt, isGuest: false}); });
                    state.guests.forEach(g => { if(g.hp > 0 && ['farming', 'soldier', 'captain', 'king'].includes(g.type)) allTargets.push({obj: g, isGuest: true}); });
                    
                    for (let tInfo of allTargets) {
                        let pt = tInfo.obj;
                        // ★敵の回避判定
                        let dodgeChance = Math.min(0.8, Math.max(0, ((pt.speed||10) - (e.speed||10)) * 0.05));
                        let curName = tInfo.isGuest ? (pt.type === 'farming' ? '身代わりカボチャ' : (pt.type === 'soldier' ? '兵士' : (pt.type === 'captain' ? '隊長' : '王様'))) : pt.name;

                        if (Math.random() < dodgeChance) {
                            state.log.push(`<span style="color:#aaa;">${curName} は魔法をヒラリと避けた！(MISS)</span>`);
                            continue;
                        }

                        let pDef = tInfo.isGuest ? Math.floor(avgDef * 0.5) : pt.def;
                        let pDmg = Math.max(1, dmg - Math.floor(pDef * 0.5));
                        if (!tInfo.isGuest) {
                            if (pt.shield) { pDmg = Math.floor(pDmg / 2); pt.shield = false; }
                            if (pt.hutHp > 0) { pDmg = Math.floor(pDmg / 2); pt.hutHp--; }
                        }
                        pt.hp -= pDmg;
                        
                        state.log.push(`<span style="color:#ff5252;">${curName} は ${pDmg} のダメージを受けた！</span>`);
                        if (!state.skipMode) { let ui = document.getElementById('arena-battle-ui'); if (ui) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 200); } }
                        render(); await wait(300); 
                    }
                    continue; 
                }

                let captain = state.guests.find(g => g.type === 'captain' && g.hp > 0);
                if (captain && !finalTargetData.isGuest && Math.random() < 0.5) {
                    targetObj = captain; finalTargetData = { obj: captain, isGuest: true }; defValue = Math.floor(avgDef * 0.5); 
                    state.log.push(`<span style="color:#FFD700;">城の隊長が身を挺して ${targetObj.name || "味方"} をかばった！！🛡️</span>`);
                    render(); await wait(500);
                }

                let tName = finalTargetData.isGuest ? (targetObj.type === 'farming' ? '身代わりカボチャ' : (targetObj.type === 'soldier' ? '兵士' : (targetObj.type === 'captain' ? '隊長' : '王様'))) : targetObj.name;
                
                dmg = 0;
                if (actionType === "heavy" || actionType === "heavy_magic" || actionType === "attack") {
                    // ★敵の回避判定
                    let dodgeChance = Math.min(0.8, Math.max(0, ((targetObj.speed||10) - (e.speed||10)) * 0.05));
                    if (Math.random() < dodgeChance) {
                        logMsg = `<span style="color:#aaa;">${e.name} の攻撃！ しかし ${tName} は素早く避けた！(MISS)</span>`;
                    } else {
                        if (e.row === 'back' && actionType === "attack") dmgMultiplier *= 0.7; 
                        baseAtk *= dmgMultiplier;
                        
                        if (actionType === "heavy" || actionType === "heavy_magic") { dmg = Math.max(1, Math.floor(baseAtk * 1.5) - Math.floor(defValue * 0.5)); } 
                        else { dmg = Math.max(1, Math.floor(baseAtk) - Math.floor(defValue * 0.5)); }
                        
                        if (!finalTargetData.isGuest) {
                            if (targetObj.shield) { dmg = Math.floor(dmg / 2); targetObj.shield = false; }
                            if (targetObj.hutHp > 0) { dmg = Math.floor(dmg / 2); targetObj.hutHp--; }
                        }
                        targetObj.hp -= dmg;
                        if (actionType === "attack") logMsg = `<span style="color:#ff5252;">${e.name} の攻撃！ ${tName} は ${dmg} のダメージを受けた！</span>`;
                        else logMsg = `<span style="color:#ff5252;">${e.name} の【${skillName}】！ 強烈な一撃が ${tName} に ${dmg} ダメージ！</span>`;
                    }
                }

                if (logMsg) state.log.push(logMsg);
                
                if (!state.skipMode && dmg > 0) {
                    let ui = document.getElementById('arena-battle-ui');
                    if (ui) { ui.classList.add('arena-shake', 'arena-damage-red'); setTimeout(() => ui.classList.remove('arena-shake', 'arena-damage-red'), 500); }
                }
                render(); await wait(800);
            }
        }
    }

    state.isProcessing = false;

    // --- ④ 勝敗判定 ---
    let partyAlive = state.party.some(p => p.hp > 0);
    let enemyAlive = state.enemies.filter(e => e.hp > 0).length > 0;

    if (!partyAlive) {
        state.autoMode = false; state.skipMode = false; render(); await wait(1000); 
        if (state.mode === 'friend') {
            let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
            state.active = false; state.autoMode = false;

            let resUi = document.createElement('div');
            resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
            resUi.innerHTML = `
                <div style="background:#111; border:4px solid #9E9E9E; padding:40px; border-radius:12px; text-align:center;">
                    <h2 style="color:#9E9E9E; font-size:36px; margin-top:0;">🤝 フレンドバトル 敗北...</h2>
                    <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">惜しくもフレンドの幻影に敗れてしまった。<br>※フレンドバトルでの寿命ペナルティはありません。</div>
                    <div style="margin-bottom: 30px;">
                        <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer;">📜 最後の戦闘ログを確認</button>
                    </div>
                    <div style="display:flex; gap:20px; justify-content:center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove(); window.openArenaReception();" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">受付（ロビー）へ戻る</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove(); window.exitArenaFacility();" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
                    </div>
                </div>
            `;
            document.body.appendChild(resUi);
        } else {
            window.endArena(false); 
        }
    } else if (!enemyAlive) {
        state.log.push(`<span style="color:#FFD700; font-weight:bold;">${state.mode === 'friend' ? 'フレンドバトル' : `第 ${state.wave} 戦`}、勝利！！</span>`);
        state.autoMode = false; state.skipMode = false; render(); await wait(1500); 
        
        if (state.mode === 'friend') {
            if (window.aiPet) window.aiPet.gold = (window.aiPet.gold || 0) + 1000;
            if (typeof saveGameData === 'function') saveGameData();

            let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
            state.active = false; state.autoMode = false;

            let resUi = document.createElement('div');
            resUi.style.cssText = `position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index: 60000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;`;
            resUi.innerHTML = `
                <div style="background:#111; border:4px solid #4fc3f7; padding:40px; border-radius:12px; text-align:center;">
                    <h2 style="color:#4fc3f7; font-size:36px; margin-top:0;">🤝 フレンドバトル 勝利！</h2>
                    <div style="color:#FFD700; font-size:20px; font-weight:bold; margin-bottom:20px;">報酬: 1,000 G 獲得！</div>
                    <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">見事、フレンドの幻影に打ち勝った！<br>他のプレイヤーにも挑戦してみよう！</div>
                    <div style="margin-bottom: 30px;">
                        <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer;">📜 最後の戦闘ログを確認</button>
                    </div>
                    <div style="display:flex; gap:20px; justify-content:center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove(); window.openArenaReception();" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">受付（ロビー）へ戻る</button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove(); window.exitArenaFacility();" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
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
                    if (boss && !window.aiPet.defeatedArenaBosses.includes(boss.bossTypeKey)) {
                        window.aiPet.defeatedArenaBosses.push(boss.bossTypeKey);
                    }
                }
            }
            
            let maxWaves = state.mode === 'boss' ? state.bossQueue.length : state.bossQueue.length * 50;
            
            if (state.wave >= maxWaves) {
                let partyToSave = state.party.map(p => {
                    let origP = window.ARENA_RECEPTION_STATE.party.find(rp => rp.id === p.id) || p;
                    return { ...p, atk: origP.atk || p.atk, def: origP.def || p.def, intel: origP.intel || p.intel, speed: origP.speed || p.speed };
                });
                if (typeof window.updateArenaRanking === 'function') window.updateArenaRanking(state.wave, partyToSave);

                if (window.aiPet) window.aiPet.gold = (window.aiPet.gold || 0) + 50000;
                if (window.aiPet) window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, maxWaves);
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
                        <div style="color:#aaa; font-size:16px; margin-bottom:30px; background:#222; padding:10px; border-radius:4px;">立ちはだかる全 ${state.bossQueue.length} 体のボスを撃破した！闘技場の覇者よ、見事なり！<br>さらなる強敵（新種族）を育成して、再び挑んでくれ！</div>
                        
                        <div style="margin-bottom: 30px;">
                            <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.5); transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">📜 最後の戦闘ログを確認</button>
                        </div>

                        <div style="display:flex; gap:20px; justify-content:center;">
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.openArenaReception();" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">受付（ロビー）へ戻る</button>
                            <button onclick="this.parentElement.parentElement.parentElement.remove(); window.exitArenaFacility();" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(resUi);
            } else {
                window.showArenaInterval(); 
            }
        }
    } else {
        render();
        if (state.autoMode && state.active && !state.skipMode) setTimeout(() => { if (window.ARENA_STATE.autoMode && window.ARENA_STATE.active) window.processArenaTurn(); }, 800);
    }
};

window.showArenaInterval = function() {
    if (window.aiPet) window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, window.ARENA_STATE.wave + 1);
    let ui = document.getElementById('arena-interval-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'arena-interval-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 52000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
        document.body.appendChild(ui);
    }
    let state = window.ARENA_STATE;

    let partyStatusHtml = state.party.map(p => `
        <div style="flex:1; background:rgba(20,20,30,0.8); border:2px solid #555; padding:10px; border-radius:6px; margin: 0 5px; min-width: 120px; ${p.hp <= 0 ? 'opacity:0.4;' : ''}">
            <div style="color:${p.hp <= 0 ? '#888' : '#FFD700'}; font-weight:bold; font-size:14px; margin-bottom:4px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
            <div style="color:#76ff03; font-size:13px; font-weight:bold; text-align:center;">HP: ${Math.max(0, p.hp)} / ${p.maxHp}</div>
            <div style="color:#4fc3f7; font-size:13px; font-weight:bold; text-align:center;">MP: ${Math.max(0, p.mp)} / ${p.maxMp}</div>
        </div>
    `).join('');

    ui.innerHTML = `
        <h2 style="color:#FFC107; font-size:36px; margin-bottom:10px;">🏆 第 ${state.wave} 戦 突破！</h2>
        <div style="font-size:18px; color:#ccc; margin-bottom:20px;">次の戦いへ進むか、ここで報酬を得て帰還するか選んでください。</div>
        <div style="display:flex; width:90%; max-width:800px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; gap:5px;">${partyStatusHtml}</div>
        
        <div style="background:#222; padding:20px; border:2px solid #4CAF50; border-radius:8px; margin-bottom:20px; text-align:center;">
            <div style="font-size:20px; color:#4CAF50; font-weight:bold; margin-bottom:10px;">🧪 支給された回復薬: 残り ${state.healPots} 個</div>
            <button onclick="window.useArenaHeal()" ${state.healPots <= 0 ? 'disabled' : ''} style="padding:10px 20px; font-size:16px; background:${state.healPots > 0 ? '#388E3C' : '#555'}; color:white; border:none; border-radius:4px; cursor:${state.healPots > 0 ? 'pointer' : 'not-allowed'};">薬を使いパーティを全回復する</button>
        </div>

        <div style="margin-bottom: 20px;">
            <button onclick="window.toggleArenaResultLog()" style="padding:12px 24px; font-size:16px; font-weight:bold; background:#9C27B0; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.5); transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">📜 このウェーブの戦闘ログを見る</button>
        </div>

        <div style="display:flex; gap:20px;">
            <button onclick="window.nextArenaWave()" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#b71c1c; color:white; border:3px solid #ff5252; border-radius:8px; cursor:pointer;">次の階級へ進む</button>
            <button onclick="window.endArena(true)" style="padding:15px 40px; font-size:22px; font-weight:bold; background:#444; color:white; border:3px solid #FF9800; border-radius:8px; cursor:pointer;">棄権して帰還する (寿命 -3)</button>
        </div>
    `;
    ui.style.display = 'flex';
};

window.useArenaHeal = function() {
    if (window.ARENA_STATE.healPots > 0) {
        window.ARENA_STATE.healPots--;
        window.ARENA_STATE.party.forEach(p => { if(p.hp > 0) { p.hp = p.maxHp; p.mp = p.maxMp; } });
        window.showArenaInterval(); window.renderArenaBattle();
    }
};
window.nextArenaWave = function() { document.getElementById('arena-interval-ui').style.display = 'none'; window.ARENA_STATE.wave++; window.startArenaWave(); };

window.endArena = function(isGiveUp) {
    if (window.aiPet && !isGiveUp) window.aiPet.arenaHighestWave = Math.max(window.aiPet.arenaHighestWave || 0, window.ARENA_STATE.wave);
    let ui = document.getElementById('arena-battle-ui'); if (ui) ui.style.display = 'none';
    let intUi = document.getElementById('arena-interval-ui'); if (intUi) intUi.style.display = 'none';
    let state = window.ARENA_STATE; state.active = false; state.autoMode = false;
    let title = isGiveUp ? "🏳️ 闘技場 棄権" : "💀 闘技場 全滅...";
    let color = isGiveUp ? "#FF9800" : "#ff5252"; let penalty = isGiveUp ? 3 : 10;
    
    if (window.aiPet && typeof window.aiPet.lifespan !== 'undefined') window.aiPet.lifespan = Math.max(1, window.aiPet.lifespan - penalty);
    let rewardGold = state.wave * 500;
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
                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.openArenaReception();" style="padding:15px 30px; font-size:18px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">受付（ロビー）へ戻る</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.exitArenaFacility();" style="padding:15px 30px; font-size:18px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">城の外へ出る</button>
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

window.skipArenaWave = async function() {
    let state = window.ARENA_STATE;
    if (state.isProcessing || state.skipMode) return;
    
    // スキップフラグを立ててAUTO進行をオフにする
    state.skipMode = true;
    state.autoMode = false;
    window.renderArenaBattle(); // ボタンを無効化するために一度再描画

    // 敵か味方のどちらかが全滅するまで、裏でターン処理を回し続ける
    while (state.active && state.party.some(p => p.hp > 0) && state.enemies.some(e => e.hp > 0)) {
        await window.processArenaTurn();
    }
    
    // 処理が終わったらスキップモードを解除して最終結果を描画
    state.skipMode = false;
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
        logModal.style.cssText = `position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: rgba(10,10,15,0.95); border: 3px solid #9C27B0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; z-index: 70000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: white; font-family: sans-serif; box-sizing: border-box;`;
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