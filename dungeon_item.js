// ★上書き：アイテムの効果計算（呪いペナルティと新アイテム対応）
window.getDungeonItemEffect = function(itemId) {
    // ==========================================
    // ★追加：データが空の場合は安全なダミーを返してエラーを防ぐ！
    // ==========================================
    if (!itemId || typeof itemId !== 'string') {
        return { hp: 0, hunger: 0, isConsumable: false, equipType: null, atk: 0, def: 0, name: '不明なアイテム', realName: '不明なアイテム', maxSeals: 0, charges: 0, traits: [], isIdentified: false };
    }

    let parsed = window.parseItemString(itemId);
    let baseId = parsed.baseId; let plus = parsed.plus; let seals = parsed.seals;
    const s = window.DUNGEON_STATE;

    // --- 未識別名の判定ロジック ---
    let displayName = null;
    let isIdentified = (s.aiMemory && s.aiMemory.identified.includes(baseId));

    // リーフ・スカラー（spirit_type3）なら最初から全識別
    if (s.player.skin && s.player.skin.includes('spirit_type3')) isIdentified = true;

    if (!isIdentified && s.sessionItemDict && s.sessionItemDict[baseId]) {
        // まだ鑑定されていない場合、偽名をメインにする
        displayName = s.sessionItemDict[baseId];
        // もしAIが「なまえ（仮名）」をつけていれば、それを横に添える
        if (s.aiMemory && s.aiMemory.tempNames && s.aiMemory.tempNames[baseId]) {
            displayName += ` (${s.aiMemory.tempNames[baseId]}？)`;
        }
    }

    // 正体が分かっている場合の基本名取得
    let realName = (typeof itemCatalog !== 'undefined' && itemCatalog[baseId]) ? itemCatalog[baseId].name : baseId;
    if (baseId === 'item_sword_iron') realName = "鉄の剣";
    else if (baseId === 'item_shield_wood') realName = "木の盾";
    else if (baseId === 'item_wand_swap') realName = "場所替えの杖";
    else if (baseId === 'item_wand_blow') realName = "吹き飛ばしの杖";
    else if (baseId === 'item_scroll_confuse') realName = "混乱の巻物";
    else if (baseId === 'item_wand_fire') realName = "火竜の杖";
    else if (baseId === 'item_scroll_sleep') realName = "睡眠の巻物";
    else if (baseId === 'item_scroll_identify') realName = "識別の巻物";

    // 表示用の最終的な名前を決定
    let finalName = displayName || realName;

    // ==========================================
    // ★ 修正：表示制御（リザルト画面での印消失バグ対応）
    // ==========================================
    const isEquipped = (s.player.equipWeapon === itemId || s.player.equipShield === itemId || s.player.equipArmor === itemId || s.player.equipAccessory === itemId);
    
    // 武器や盾は拾った時点で（装備しなくても）＋値と印を常に表示させるように変更
    let isEquipment = baseId.includes('sword') || baseId.includes('shield') || baseId.includes('armor') || baseId.includes('ring');
    let isDungeonFinished = !s.active; // リザルト画面では無条件で全て開示する

    if (isIdentified || isEquipped || baseId.includes('wand') || isEquipment || isDungeonFinished) {
        if (baseId.includes('wand')) finalName += ` [${plus}]`;
        else if (plus > 0) finalName += ` +${plus}`;

        const sealMap = { heal:'癒', life:'命', sleep:'眠', counter_sleep:'眠', fire:'炎', anti_dragon:'竜', exp:'幸', dodge:'避', double:'連', parry:'見', food:'食', half_hunger:'腹', angry:'怒', counter:'反', crit:'会', max_hunger:'膨', first:'先', light:'軽', holy:'光', regen:'治', curse:'呪' };
        if (seals.length > 0) {
            finalName += " " + seals.map(s => `[${sealMap[s] || s}]`).join('');
        }
    }

    let effect = { 
        hp: 0, hunger: 0,
        isConsumable: false, equipType: null,
        atk: 0, def: 0, name: finalName, realName: realName, maxSeals: 3, charges: 0,
        traits: [...seals], isIdentified: isIdentified
    };

    if (baseId.startsWith('dish_')) { effect.hp = 30; effect.hunger = 40; effect.isConsumable = true; }
    else if (baseId === 'item_bread') { effect.hp = 0; effect.hunger = 50; effect.isConsumable = true; }
    else if (baseId === 'item_berry' || baseId.includes('apple') || baseId.includes('fruit')) { effect.hp = 10; effect.hunger = 15; effect.isConsumable = true; }
    else if (baseId === 'herb' || baseId.includes('potion')) { effect.hp = 50; effect.hunger = 5; effect.isConsumable = true; }
    else if (baseId.includes('fish') || baseId.includes('meat')) { effect.hp = 15; effect.hunger = 25; effect.isConsumable = true; }
    else if (baseId === 'item_seed_happy') { effect.isConsumable = true; effect.traits.push('level_up'); }
    else if (baseId === 'item_scroll_sleep') { effect.isConsumable = true; effect.traits.push('sleep_aoe'); }
    else if (baseId === 'item_scroll_confuse') { effect.isConsumable = true; effect.traits.push('confuse_aoe'); }
    
    // ==========================================
    // ★ 杖の専用処理（ゴーレム以外の誤装備を防止）
    // ==========================================
    else if (baseId.includes('wand')) {
        effect.isConsumable = true;
        effect.charges = plus; 
        effect.maxSeals = 0; 
        
        // ★修正：ルーンゴーレム(stone_type3)の時だけ武器として認識させる
        let isGolem = window.DUNGEON_STATE && window.DUNGEON_STATE.player.skin && window.DUNGEON_STATE.player.skin.includes('stone_type3');
        effect.equipType = isGolem ? 'weapon' : null; 
        effect.atk = isGolem ? 15 : 0; 

        if (baseId === 'item_wand_fire') effect.traits.push('fire_damage');
        else if (baseId === 'item_wand_swap') effect.traits.push('swap_pos');
        else if (baseId === 'item_wand_blow') effect.traits.push('blow_back');
    }
    
    else if (baseId === 'item_sword_iron' || baseId.includes('sword') || baseId.includes('weapon')) {
        effect.equipType = 'weapon'; effect.atk = 15 + (plus * 2); effect.maxSeals = 4;
        if (baseId === 'item_sword_double' && !effect.traits.includes('double')) effect.traits.push('double');
    }
    else if (baseId === 'item_shield_wood' || baseId.includes('shield')) {
        effect.equipType = 'shield'; effect.def = 8 + (plus * 2); effect.maxSeals = 2;
        if (baseId === 'item_shield_counter' && !effect.traits.includes('counter')) { effect.traits.push('counter'); effect.maxSeals = 3; }
        if (baseId === 'item_shield_hara' && !effect.traits.includes('half_hunger')) { effect.traits.push('half_hunger'); effect.maxSeals = 3; }
    }
    else if (baseId.includes('armor') || baseId.includes('mail') || baseId.includes('robe')) {
        effect.equipType = 'armor'; effect.def = 15 + (plus * 2); effect.maxSeals = 3;
    }
    else if (baseId.includes('ring') || baseId.includes('bracelet')) {
        effect.equipType = 'accessory'; effect.maxSeals = 1;
        if (baseId === 'item_ring_haste' && !effect.traits.includes('fast_move')) effect.traits.push('fast_move');
        if (baseId === 'item_ring_heal') {
            if (!effect.traits.includes('regen_hp')) effect.traits.push('regen_hp');
            if (!effect.traits.includes('fast_hunger')) effect.traits.push('fast_hunger');
        }
    }

    if (effect.traits.includes('curse')) {
        if (effect.atk > 0) effect.atk = Math.max(1, Math.floor(effect.atk / 2));
        if (effect.def > 0) effect.def = Math.max(1, Math.floor(effect.def / 2));
    }

    effect.isWeapon = (effect.equipType === 'weapon');
    effect.isShield = (effect.equipType === 'shield');
    return effect;
};

// ★完全修正：アイテム文字列から「ベース名」「＋値」「印の配列」を正確に分解する
window.parseItemString = function(itemId) {
    // ==========================================
    // ★追加：データが空だったり文字列じゃない場合は安全なダミーを返してエラーを防ぐ！
    // ==========================================
    if (!itemId || typeof itemId !== 'string') return { baseId: 'unknown', plus: 0, seals: [] };

    let baseId = "";
    
    // ★修正：新しく追加した杖や巻物も「ベース装備」として正しく認識させる
    const baseEquipIds = [
        'item_sword_double', 'item_sword_iron', 
        'item_shield_counter', 'item_shield_hara', 'item_shield_wood', 
        'item_armor_iron',
        'item_ring_haste', 'item_ring_heal',
        'item_wand_fire', 'item_wand_swap', 'item_wand_blow', // ★追加
        'item_scroll_sleep', 'item_scroll_confuse' // ★追加
    ];
    
    for(let b of baseEquipIds) {
        if (itemId.startsWith(b)) { baseId = b; break; }
    }
    
    if (!baseId) {
        let keys = [];
        if (typeof itemCatalog !== 'undefined') keys = Object.keys(itemCatalog).sort((a,b) => b.length - a.length);
        for(let k of keys) { if (itemId.startsWith(k)) { baseId = k; break; } }
    }
    
    if (!baseId) baseId = itemId.split('_+')[0]; 

    let plusMatch = itemId.match(/_\+(\d+)/);
    let plus = plusMatch ? parseInt(plusMatch[1]) : 0;

    let remainder = itemId.replace(baseId, '').replace(/_\+\d+/, '');
    
    let seals = [];
    const validSeals = Object.keys(window.SEAL_DESCRIPTIONS || {});
    let sortedSeals = [...validSeals].sort((a,b) => b.length - a.length);
    
    for (let s of sortedSeals) {
        if (remainder.includes(s)) {
            seals.push(s);
            remainder = remainder.replace(new RegExp(s, 'g'), '');
        }
    }
    return { baseId: baseId, plus: plus, seals: seals };
};

// ★新規追加：異種合成時に「どの印がつくか」を定義する辞書
window.getSealFromItem = function(itemBaseId, targetEquipType) {
    if (targetEquipType === 'weapon') {
        if (itemBaseId === 'herb' || itemBaseId === 'item_berry') return 'heal';
        if (itemBaseId === 'item_scroll_sleep') return 'sleep';
        if (itemBaseId === 'item_wand_fire') return 'fire';
        if (itemBaseId === 'item_seed_happy') return 'exp';
        if (itemBaseId === 'item_sword_double') return 'double';
        if (itemBaseId === 'item_shield_hara') return 'food';
        if (itemBaseId === 'item_shield_counter') return 'angry';
        if (itemBaseId === 'item_bread') return 'crit';
        if (itemBaseId === 'item_ring_haste') return 'first';
        if (itemBaseId === 'item_ring_heal') return 'holy';
    } else if (targetEquipType === 'shield' || targetEquipType === 'armor') {
        if (itemBaseId === 'herb' || itemBaseId === 'item_berry') return 'life';
        if (itemBaseId === 'item_scroll_sleep') return 'counter_sleep';
        if (itemBaseId === 'item_wand_fire') return 'anti_dragon';
        if (itemBaseId === 'item_seed_happy') return 'dodge';
        if (itemBaseId === 'item_sword_double') return 'parry';
        if (itemBaseId === 'item_shield_hara') return 'half_hunger';
        if (itemBaseId === 'item_shield_counter') return 'counter';
        if (itemBaseId === 'item_bread') return 'max_hunger';
        if (itemBaseId === 'item_ring_haste') return 'light';
        if (itemBaseId === 'item_ring_heal') return 'regen';
    }
    return null;
};

// ★新規追加：装備の印を合算した「真の最大満腹度」を計算する
window.getRealMaxHunger = function() {
    let s = window.DUNGEON_STATE;
    if (!s || !s.player) return 100;
    
    let baseMax = s.player.maxHunger || 100; // パンで増えた基礎上限
    let bonus = 0;
    
    let sEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
    let aEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
    let acEff = s.player.equipAccessory ? window.getDungeonItemEffect(s.player.equipAccessory) : null;
    
    let allTraits = [];
    if (sEff) allTraits.push(...sEff.traits);
    if (aEff) allTraits.push(...aEff.traits);
    if (acEff) allTraits.push(...acEff.traits);
    
    // ★印の数だけ加算する（盾と鎧の両方につければ +40 になる！）
    bonus = allTraits.filter(t => t === 'max_hunger').length * 20; 
    
    return baseMax + bonus;
};
