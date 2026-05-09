// ★新規追加：印の詳細説明データ（装備詳細画面で使います）
window.SEAL_DESCRIPTIONS = {
    heal: { name: '癒', desc: '与えたダメージの20%を吸収しHPを回復する。' },
    life: { name: '命', desc: '毎ターンHPが1ずつ自動回復する。' },
    sleep: { name: '眠', desc: '攻撃時、20%の確率で敵を睡眠状態にする。' },
    counter_sleep: { name: '眠', desc: '敵から直接攻撃を受けた際、15%の確率で敵を睡眠状態にする。' },
    fire: { name: '炎', desc: '通常ダメージに加え、追加で固定の炎ダメージ(+10)を与える。' },
    anti_dragon: { name: '竜', desc: 'ドラゴン系のモンスターから受けるダメージを半減する。' },
    exp: { name: '幸', desc: '敵を倒した時に得られる経験値が1.5倍になる。' },
    dodge: { name: '避', desc: '素早さによる回避とは別に、15%の確率で無条件に攻撃をかわす。' },
    double: { name: '連', desc: '通常攻撃が2回連続になる。' },
    parry: { name: '見', desc: '敵からの直接攻撃を15%の確率で弾き、無効化する。' },
    food: { name: '食', desc: '敵を倒した時、稀に食料（野イチゴやパン）をドロップする。' },
    half_hunger: { name: '腹', desc: 'お腹の減る速度が半分になる。' },
    angry: { name: '怒', desc: '自分がダメージを受けた直後のターンに攻撃すると、ダメージが1.5倍になる。' },
    counter: { name: '反', desc: '受けたダメージの半分を相手に跳ね返す。' },
    crit: { name: '会', desc: '攻撃時、15%の確率で会心の一撃（ダメージ2倍）が出る。' },
    max_hunger: { name: '膨', desc: '装備中、最大満腹度に +20 のボーナスがつく。' },
    first: { name: '先', desc: '敵が自分に隣接してきた瞬間、ターンを消費せずに先制攻撃を行う。' },
    light: { name: '軽', desc: '素早さによる回避率の上限が「75%」に引き上げられる。' },
    holy: { name: '光', desc: 'アンデッド・悪魔系モンスターに対して2倍のダメージを与える。' },
    regen: { name: '治', desc: '毎ターンHPが回復し、装備の「腹減り2倍」のデメリットを打ち消す。' },
    curse: { name: '呪', desc: '呪縛。装備から外せなくなり、武器や防具の性能が半減する。' }, // ★新規追加
    // ▼ 新規追加：状態異常対策の印
    poison_atk: { name: '毒', desc: '攻撃時、20%の確率で敵を猛毒状態にする。' },
    anti_poison: { name: '抗', desc: '敵から受ける猛毒状態を完全に防ぐ。' },
    confuse_atk: { name: '乱', desc: '攻撃時、15%の確率で敵を混乱状態にする。' },
    anti_confuse: { name: '静', desc: '敵から受ける混乱状態を完全に防ぐ。' },
    blind_atk: { name: '盲', desc: '攻撃時、15%の確率で敵を暗闇状態（命中率低下）にする。' },
    anti_blind: { name: '明', desc: '敵から受ける暗闇・視界不良状態を完全に防ぐ。' },
    seal_atk: { name: '封', desc: '攻撃時、20%の確率で敵の特殊能力（魔法やスキル）を封じる。' },
    anti_magic: { name: '魔', desc: '敵の魔法や厄介なスキルを受ける確率を一律 30% 軽減する。' },
    // ▼ 新規追加
    paralyze_atk: { name: '縛', desc: '攻撃時、15%の確率で敵を麻痺（行動不能）状態にする。' },
    anti_paralyze: { name: '動', desc: '敵からの麻痺（罠や特殊攻撃など）を完全に防ぐ。' }
};

// ★上書き：アイテムの効果計算（王道ローグライクの識別システム＆色分けログ対応）
window.getDungeonItemEffect = function(itemId) {
    if (!itemId || typeof itemId !== 'string') {
        return { hp: 0, hunger: 0, isConsumable: false, equipType: null, atk: 0, def: 0, name: '不明なアイテム', logName: '不明なアイテム', realName: '不明なアイテム', maxSeals: 0, charges: 0, traits: [], isIdentified: false, isStatsKnown: false, isEquipped: false };
    }

    let parsed = window.parseItemString(itemId);
    let baseId = parsed.baseId; let plus = parsed.plus; let seals = parsed.seals;
    const s = window.DUNGEON_STATE || {}; 
    const p = s.player || {}; 

    let isIdentified = (s.aiMemory && s.aiMemory.identified && s.aiMemory.identified.includes(baseId));
    let activeTraits = (p.skin && window.getPlayerDungeonTraits) ? window.getPlayerDungeonTraits(p.skin).map(t => t.name) : [];
    if (p.skin && p.skin.includes('spirit_type3')) isIdentified = true;

    let isEquipNow = (p.equipWeapon === itemId || p.equipShield === itemId || p.equipArmor === itemId || p.equipAccessory === itemId);
    let isInInv = p.tempInventory && p.tempInventory.includes(itemId);

    // ★大修正：_known フラグがついている個体は、部分識別済みとして扱う！（同名アイテムの勘違い防止）
    let isEquipIdentified = isIdentified || itemId.includes('_known');
    let isDungeonFinished = !s.active; 
    let isStatsKnown = isEquipNow || isEquipIdentified || isDungeonFinished;

    let displayName = null;
    if (!isIdentified && s.sessionItemDict && s.sessionItemDict[baseId]) {
        displayName = s.sessionItemDict[baseId];
        if (s.aiMemory && s.aiMemory.tempNames && s.aiMemory.tempNames[baseId]) {
            // ★修正：「謎の〜」で始まる仮名も隠さずにしっかり表示させる
            displayName += ` (${s.aiMemory.tempNames[baseId]}？)`;
        }
    }

    let realName = (typeof itemCatalog !== 'undefined' && itemCatalog[baseId]) ? itemCatalog[baseId].name : baseId;
    if (baseId === 'item_sword_iron') realName = "鉄の剣";
    else if (baseId === 'item_shield_wood') realName = "木の盾";
    else if (baseId === 'item_wand_swap') realName = "場所替えの杖";
    else if (baseId === 'item_wand_blow') realName = "吹き飛ばしの杖";
    else if (baseId === 'item_scroll_confuse') realName = "混乱の巻物";
    else if (baseId === 'item_wand_fire') realName = "火竜の杖";
    else if (baseId === 'item_scroll_sleep') realName = "睡眠の巻物";
    else if (baseId === 'item_scroll_identify') realName = "識別の巻物";
    // ▼ 新規追加
    else if (baseId === 'herb_antidote') realName = "解毒の草";
    else if (baseId === 'herb_mint') realName = "ハッカの葉";
    else if (baseId === 'herb_eyedrop') realName = "目薬草";
    else if (baseId === 'herb_paralysis') realName = "シビレ消し草"; // ★追加
    else if (baseId === 'item_scroll_seal') realName = "封魔の巻物";

    let isBaseEquip = baseId.includes('sword') || baseId.includes('shield') || baseId.includes('armor');
    let finalName = (isBaseEquip ? realName : (displayName || realName));

    if (baseId.includes('wand')) {
        if (isIdentified || isDungeonFinished) {
            finalName += ` [${plus}]`;
        } else if (plus <= 0) {
            finalName += ` (魔力切れ?)`; 
        }
    } else {
        if (isStatsKnown) {
            const sealMap = { heal:'癒', life:'命', sleep:'眠', counter_sleep:'眠', fire:'炎', anti_dragon:'竜', exp:'幸', dodge:'避', double:'連', parry:'見', food:'食', half_hunger:'腹', angry:'怒', counter:'反', crit:'会', max_hunger:'膨', first:'先', light:'軽', holy:'光', regen:'治', curse:'呪', poison_atk:'毒', anti_poison:'抗', confuse_atk:'乱', anti_confuse:'静', blind_atk:'盲', anti_blind:'明', seal_atk:'封', anti_magic:'魔', paralyze_atk:'縛', anti_paralyze:'動' }; // ★追加
            if (seals.length > 0) {
                finalName += " " + seals.map(sl => `[${sealMap[sl] || sl}]`).join('');
            }
            
            if (plus > 0) finalName += ` +${plus}`;
            else if (plus < 0) finalName += ` ${plus}`; 
        }
    }

    let logColor = '#B0BEC5'; 
    if (isEquipNow) {
        logColor = '#FFD700'; 
    } else if (isStatsKnown || isIdentified) {
        logColor = '#4FC3F7'; 
    }
    let logName = `<span style="color:${logColor}; font-weight:bold;">${finalName}</span>`;

    let effect = { 
        hp: 0, hunger: 0, isConsumable: false, equipType: null, atk: 0, def: 0, 
        name: finalName, logName: logName, realName: realName, maxSeals: 3, charges: 0,
        traits: [...seals], isIdentified: isIdentified, isStatsKnown: isStatsKnown, isEquipped: isEquipNow
    };

    if (baseId.startsWith('dish_')) { effect.hp = 30; effect.hunger = 40; effect.isConsumable = true; }
    else if (baseId === 'item_bread') { effect.hp = 0; effect.hunger = 50; effect.isConsumable = true; }
    else if (baseId === 'item_berry' || baseId.includes('apple') || baseId.includes('fruit')) { effect.hp = 10; effect.hunger = 15; effect.isConsumable = true; }
    else if (baseId === 'herb' || baseId.includes('potion')) { effect.hp = 50; effect.hunger = 5; effect.isConsumable = true; }
    else if (baseId.includes('fish') || baseId.includes('meat')) { effect.hp = 15; effect.hunger = 25; effect.isConsumable = true; }
    else if (baseId === 'item_seed_happy') { effect.isConsumable = true; effect.traits.push('level_up'); }
    else if (baseId === 'item_scroll_sleep') { effect.isConsumable = true; effect.traits.push('sleep_aoe'); }
    else if (baseId === 'item_scroll_confuse') { effect.isConsumable = true; effect.traits.push('confuse_aoe'); }
    else if (baseId === 'item_scroll_identify') { effect.isConsumable = true; } 
    // ▼ 新規追加：状態異常対策アイテムの効果フラグ
    else if (baseId === 'herb_antidote') { effect.hp = 20; effect.isConsumable = true; effect.traits.push('cure_poison'); }
    else if (baseId === 'herb_mint') { effect.hp = 10; effect.isConsumable = true; effect.traits.push('cure_confuse_sleep'); }
    else if (baseId === 'herb_eyedrop') { effect.hp = 10; effect.isConsumable = true; effect.traits.push('cure_blind_reveal_traps'); }
    else if (baseId === 'herb_paralysis') { effect.hp = 20; effect.isConsumable = true; effect.traits.push('cure_paralyze'); } // ★追加
    else if (baseId === 'item_scroll_seal') { effect.isConsumable = true; effect.traits.push('seal_aoe'); }
    
    else if (baseId.includes('wand')) {
        effect.isConsumable = true; effect.charges = plus; effect.maxSeals = 0; 
        let isGolem = window.DUNGEON_STATE && window.DUNGEON_STATE.player.skin && window.DUNGEON_STATE.player.skin.includes('stone_type3');
        effect.equipType = isGolem ? 'weapon' : null; effect.atk = isGolem ? 15 : 0; 
        if (baseId === 'item_wand_fire') effect.traits.push('fire_damage');
        else if (baseId === 'item_wand_swap') effect.traits.push('swap_pos');
        else if (baseId === 'item_wand_blow') effect.traits.push('blow_back');
        if (activeTraits.includes('氷結の杖')) effect.traits.push('freeze_effect');
    }
    else if (baseId === 'item_sword_iron' || baseId.includes('sword') || baseId.includes('weapon')) {
        effect.equipType = 'weapon'; effect.atk = Math.max(1, 15 + plus * 2); effect.maxSeals = 4;
        if (baseId === 'item_sword_double' && !effect.traits.includes('double')) effect.traits.push('double');
    }
    else if (baseId === 'item_shield_wood' || baseId.includes('shield')) {
        effect.equipType = 'shield'; effect.def = Math.max(0, 8 + plus * 2); effect.maxSeals = 2;
        if (baseId === 'item_shield_counter' && !effect.traits.includes('counter')) { effect.traits.push('counter'); effect.maxSeals = 3; }
        if (baseId === 'item_shield_hara' && !effect.traits.includes('half_hunger')) { effect.traits.push('half_hunger'); effect.maxSeals = 3; }
    }
    else if (baseId.includes('armor') || baseId.includes('mail') || baseId.includes('robe')) {
        effect.equipType = 'armor'; effect.def = Math.max(0, 15 + plus * 2); effect.maxSeals = 3;
    }
    // ▼ 修正：「spring」などの単語に反応しないよう、確実に「item_ring_」で判定する！
    else if (baseId.includes('item_ring_') || baseId.includes('bracelet')) {
        effect.equipType = 'accessory'; effect.maxSeals = 1;
        if (baseId === 'item_ring_haste' && !effect.traits.includes('fast_move')) effect.traits.push('fast_move');
        if (baseId === 'item_ring_heal') {
            if (!effect.traits.includes('regen_hp')) effect.traits.push('regen_hp');
            if (!effect.traits.includes('fast_hunger')) effect.traits.push('fast_hunger');
        }
    }

    if (effect.traits.includes('curse') && activeTraits.includes('呪いの竜鱗')) {
        if (effect.atk > 0) effect.atk *= 2;
        if (effect.def > 0) effect.def *= 2;
    }
    if (activeTraits.includes('虹色の加護')) effect.maxSeals = 99; 
    if (activeTraits.includes('不死の大魔導') && baseId.includes('wand')) effect.magicPowerMult = 3.0;
    else if (activeTraits.includes('魔力の才') && (baseId.includes('wand') || baseId.includes('scroll'))) effect.magicPowerMult = 1.2;
    else effect.magicPowerMult = 1.0;

    effect.isWeapon = (effect.equipType === 'weapon');
    effect.isShield = (effect.equipType === 'shield');
    return effect;
};

// ★完全修正：アイテム文字列から「マイナス値」も正確に分解する
window.parseItemString = function(itemId) {
    if (!itemId || typeof itemId !== 'string') return { baseId: 'unknown', plus: 0, seals: [] };
    let baseId = "";
    
    const baseEquipIds = [
        'item_sword_double', 'item_sword_iron', 
        'item_shield_counter', 'item_shield_hara', 'item_shield_wood', 
        'item_armor_iron', 'item_ring_haste', 'item_ring_heal',
        'item_wand_fire', 'item_wand_swap', 'item_wand_blow', 
        'item_scroll_sleep', 'item_scroll_confuse', 'item_scroll_identify'
    ];
    for(let b of baseEquipIds) { if (itemId.startsWith(b)) { baseId = b; break; } }
    if (!baseId) {
        let keys = [];
        if (typeof itemCatalog !== 'undefined') keys = Object.keys(itemCatalog).sort((a,b) => b.length - a.length);
        for(let k of keys) { if (itemId.startsWith(k)) { baseId = k; break; } }
    }
    if (!baseId) baseId = itemId.split('_+')[0].split('_-')[0]; 

    let plusMatch = itemId.match(/_([+-]\d+)/);
    let plus = plusMatch ? parseInt(plusMatch[1]) : 0;

    let remainder = itemId.replace(baseId, '').replace(/_[+-]\d+/, '');
    
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
        // ▼ 新規追加：武器への合成印
        if (itemBaseId === 'herb_antidote') return 'poison_atk';
        if (itemBaseId === 'herb_mint') return 'confuse_atk';
        if (itemBaseId === 'herb_eyedrop') return 'blind_atk';
        if (itemBaseId === 'herb_paralysis') return 'paralyze_atk'; // ★追加
        if (itemBaseId === 'item_scroll_seal') return 'seal_atk';
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
        // ▼ 新規追加：盾・鎧への合成印
        if (itemBaseId === 'herb_antidote') return 'anti_poison';
        if (itemBaseId === 'herb_mint') return 'anti_confuse';
        if (itemBaseId === 'herb_eyedrop') return 'anti_blind';
        if (itemBaseId === 'herb_paralysis') return 'anti_paralyze'; // ★追加
        if (itemBaseId === 'item_scroll_seal') return 'anti_magic';
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
