window.generateDungeonFloor = async function() {
    const s = window.DUNGEON_STATE;
    s.grid = []; s.enemies = []; s.visited = []; s.roomsInfo = []; 
    s.rescueTargets = []; s.items = []; s.traps = [];
    s.isMHDiscovered = false; 

    let floorMhType = 'none';
    let rnd = Math.random();
    if (s.floor > 1 && rnd < 0.03) floorMhType = 'large'; 
    else if (rnd < 0.13) floorMhType = 'mini';            

    const rooms = []; 

    if (floorMhType === 'large') {
        s.mapWidth = 40; s.mapHeight = 40;
        for(let y = 0; y < s.mapHeight; y++) {
            s.grid[y] = new Array(s.mapWidth).fill(1);
            s.visited[y] = new Array(s.mapWidth).fill(false); 
        }
        s.roomsInfo.push({ x: 1, y: 1, w: s.mapWidth - 2, h: s.mapHeight - 2, isDark: false, isMH: true });
        for (let y = 1; y < s.mapHeight - 1; y++) {
            for (let x = 1; x < s.mapWidth - 1; x++) s.grid[y][x] = 0;
        }
        s.player.x = Math.floor(s.mapWidth / 2);
        s.player.y = Math.floor(s.mapHeight / 2);
        rooms.push({ x: s.player.x, y: s.player.y }); 
    } else {
        s.mapWidth = 60; s.mapHeight = 60;
        for(let y = 0; y < s.mapHeight; y++) {
            s.grid[y] = new Array(s.mapWidth).fill(1);
            s.visited[y] = new Array(s.mapWidth).fill(false); 
        }

        const targetNumRooms = 5 + Math.floor(Math.random() * 3); 
        const margin = 4; 
        
        for (let attempts = 0; attempts < 200 && rooms.length < targetNumRooms; attempts++) {
            let rw = 5 + Math.floor(Math.random() * 5); 
            let rh = 5 + Math.floor(Math.random() * 5); 
            let rx = 3 + Math.floor(Math.random() * (s.mapWidth - rw - 6)); 
            let ry = 3 + Math.floor(Math.random() * (s.mapHeight - rh - 6));
            
            let overlap = s.roomsInfo.some(r => {
                return (rx - margin < r.x + r.w && rx + rw + margin > r.x &&
                        ry - margin < r.y + r.h && ry + rh + margin > r.y);
            });
            
            if (!overlap) {
                // ★ 修正3：暗闇部屋の撤廃（isDark を常に false にする）
                s.roomsInfo.push({ x: rx, y: ry, w: rw, h: rh, isDark: false, isMH: false });
                for (let y = ry; y < ry + rh; y++) { for (let x = rx; x < rx + rw; x++) s.grid[y][x] = 0; } 
                let center = { x: Math.floor(rx + rw/2), y: Math.floor(ry + rh/2) }; 
                rooms.push(center);
            }
        }

        if (floorMhType === 'mini' && s.roomsInfo.length > 0) {
            s.roomsInfo[s.roomsInfo.length - 1].isMH = true;
        }

        for (let i = 1; i < rooms.length; i++) {
            let prev = rooms[i-1];
            let cur = rooms[i];
            
            if (Math.random() < 0.5) {
                for (let x = Math.min(prev.x, cur.x); x <= Math.max(prev.x, cur.x); x++) {
                    if (s.grid[prev.y][x] === 1) s.grid[prev.y][x] = 3;
                }
                for (let y = Math.min(prev.y, cur.y); y <= Math.max(prev.y, cur.y); y++) {
                    if (s.grid[y][cur.x] === 1) s.grid[y][cur.x] = 3;
                }
            } else {
                for (let y = Math.min(prev.y, cur.y); y <= Math.max(prev.y, cur.y); y++) {
                    if (s.grid[y][prev.x] === 1) s.grid[y][prev.x] = 3;
                }
                for (let x = Math.min(prev.x, cur.x); x <= Math.max(prev.x, cur.x); x++) {
                    if (s.grid[cur.y][x] === 1) s.grid[cur.y][x] = 3;
                }
            }
        }
        s.player.x = rooms[0].x; s.player.y = rooms[0].y;
    }

    let lastRoom = rooms[rooms.length - 1]; 
    s.grid[lastRoom.y][lastRoom.x] = 2;

    s.roomsInfo.forEach(r => {
        if (Math.random() < 0.6 && !r.isMH) { 
            let gimmickTypes = [4, 5, 6, 7, 8, 9];
            let gType = gimmickTypes[Math.floor(Math.random() * gimmickTypes.length)];
            
            let innerW = r.w - 2;
            let innerH = r.h - 2;
            
            if (innerW >= 2 && innerH >= 2) {
                let gw = 2 + Math.floor(Math.random() * 2);
                let gh = 2;
                if (Math.random() < 0.5) { gw = 2; gh = 2 + Math.floor(Math.random() * 2); }
                
                let gx = r.x + 1 + Math.floor(Math.random() * (innerW - gw + 1));
                let gy = r.y + 1 + Math.floor(Math.random() * (innerH - gh + 1));
                
                for(let y = gy; y < gy + gh; y++) {
                    for(let x = gx; x < gx + gw; x++) {
                        if (Math.abs(x - s.player.x) <= 1 && Math.abs(y - s.player.y) <= 1) continue;
                        if (Math.abs(x - lastRoom.x) <= 1 && Math.abs(y - lastRoom.y) <= 1) continue;
                        
                        if (s.grid[y][x] === 0) s.grid[y][x] = gType; 
                    }
                }
            }
        }
    });

    let discovered = (window.aiPet && window.aiPet.discoveredMonsters && window.aiPet.discoveredMonsters.length > 0) 
                     ? window.aiPet.discoveredMonsters 
                     : ['robot']; 

    let baseSkins = discovered.filter(skin => !skin.includes('_'));
    let gen1Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 2);
    let gen2Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 3);

    if (baseSkins.length === 0) baseSkins = ['robot']; 

    let pool = baseSkins;
    if (s.floor >= 70) {
        pool = gen2Skins.length > 0 ? gen2Skins : (gen1Skins.length > 0 ? gen1Skins : baseSkins);
    } else if (s.floor >= 30) {
        pool = gen1Skins.length > 0 ? gen1Skins : baseSkins;
    }

    const eHpBase = s.mapType === 'crystal' ? 10 : 20; const eDmgBase = s.mapType === 'crystal' ? 2 : 5;   

    const dropTable = [ 
        { id: 'herb', name: '薬草', weight: 20 }, { id: 'item_berry', name: '野イチゴ', weight: 15 }, 
        { id: 'item_bread', name: '大きなパン', weight: 15 }, { id: 'item_seed_happy', name: 'しあわせの種', weight: 3 },
        { id: 'item_seed_mystery', name: '謎の種', weight: 5 }, 
        { id: 'item_scroll_sleep', name: '睡眠の巻物', weight: 7 }, { id: 'item_scroll_confuse', name: '混乱の巻物', weight: 7 },
        { id: 'item_wand_fire', name: '火竜の杖', weight: 7 }, { id: 'item_wand_swap', name: '場所替えの杖', weight: 5 }, 
        { id: 'item_wand_blow', name: '吹き飛ばしの杖', weight: 5 }, 
        { id: 'item_sword_iron', name: '鉄の剣', weight: 10 }, { id: 'item_sword_double', name: '連撃の剣', weight: 4 }, 
        { id: 'item_shield_wood', name: '木の盾', weight: 10 }, { id: 'item_shield_counter', name: '反撃の盾', weight: 4 }, 
        { id: 'item_shield_hara', name: 'ハラモチの盾', weight: 4 }, { id: 'item_armor_iron', name: '鉄の鎧', weight: 8 }, 
        { id: 'item_ring_haste', name: '俊足の腕輪', weight: 2 }, { id: 'item_ring_heal', name: '回復の指輪', weight: 2 } 
    ];

    const trapTypes = [ 
        { type: 'poison', name: '毒矢の罠' }, 
        { type: 'mine', name: '地雷' }, 
        { type: 'blind', name: '泥水の罠' }, 
        { type: 'bear_trap', name: 'トラバサミ' },
        { type: 'stone', name: '石ころ' }
    ];

    const getRandomPos = (r) => {
        let tx, ty, attempts = 0;
        do {
            tx = r.x + Math.floor(Math.random() * r.w); ty = r.y + Math.floor(Math.random() * r.h); attempts++;
        } while ((s.grid[ty][tx] !== 0 || (tx === s.player.x && ty === s.player.y) || s.items.some(it => it.x===tx && it.y===ty) || s.enemies.some(e => e.x===tx && e.y===ty) || s.traps.some(t => Math.abs(t.x-tx)<=2 && Math.abs(t.y-ty)<=2)) && attempts < 50);
        if (attempts < 50) return {x: tx, y: ty};
        return null;
    };

    s.roomsInfo.forEach((r, idx) => {
        let isMH = r.isMH;
        
        let eNum = isMH ? (floorMhType === 'large' ? 25 + Math.floor(Math.random()*6) : 10 + Math.floor(Math.random()*3)) : (1 + Math.floor(Math.random()*2));
        let iNum = isMH ? (floorMhType === 'large' ? 15 : 5 + Math.floor(Math.random()*4)) : (idx === 0 ? 0 : 1);
        let tNum = isMH ? (floorMhType === 'large' ? 15 : 5 + Math.floor(Math.random()*4)) : (1 + Math.floor(s.floor/10));

        for(let i=0; i<eNum; i++) {
            let pos = getRandomPos(r);
            if (pos) {
                let eSkin = pool[Math.floor(Math.random() * pool.length)]; let eType = eSkin.split('_')[0];
                let sleepVal = (isMH && floorMhType === 'mini') ? 999 : 0; 
                s.enemies.push({ id: 'e_'+Date.now()+'_'+idx+'_'+i, x: pos.x, y: pos.y, hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, damage: eDmgBase + s.floor * 2, name: `迷宮の${eType}`, type: eType, skin: eSkin, face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep: sleepVal } });
            }
        }

        let totalWeight = dropTable.reduce((sum, item) => sum + item.weight, 0);
        for(let i=0; i<iNum; i++) {
            let pos = getRandomPos(r);
            if (pos) {
                let rand = Math.random() * totalWeight; let dropped = dropTable[0];
                for (let item of dropTable) { if (rand < item.weight) { dropped = item; break; } rand -= item.weight; }
                let finalKey = dropped.id;
                let isEquip = finalKey.includes('sword') || finalKey.includes('shield') || finalKey.includes('armor') || finalKey.includes('ring');
                if (isEquip && Math.random() < 0.15) finalKey += '_curse';
                if (finalKey.includes('wand')) finalKey += `_+${3 + Math.floor(Math.random() * 3)}`;
                s.items.push({ id: `item_${Date.now()}_${idx}_${i}`, key: finalKey, name: dropped.name, x: pos.x, y: pos.y });
            }
        }

        for(let i=0; i<tNum; i++) {
            let pos = getRandomPos(r);
            if (pos) {
                let tData = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                s.traps.push({ id: `trap_${Date.now()}_${idx}_${i}`, type: tData.type, name: tData.name, x: pos.x, y: pos.y, visible: false });
            }
        }
    });

    if (typeof window.fetchRescueRequests === 'function') {
        try {
            const requests = await window.fetchRescueRequests(s.mapType);
            requests.forEach(req => {
                if (req.floor === s.floor) {
                    let r = s.roomsInfo[Math.floor(Math.random() * s.roomsInfo.length)];
                    let pos = getRandomPos(r);
                    if(pos) s.rescueTargets.push({ id: req.requesterId, name: req.requesterName, skin: req.aiSkin, x: pos.x, y: pos.y, rescued: false });
                }
            });
        } catch(e) { console.error("救助データ配置エラー:", e); }
    }

    let mySkin = s.player.skin || "";
    if (mySkin === 'spirit_type3_2') {
        for(let y=0; y<s.mapHeight; y++) { for(let x=0; x<s.mapWidth; x++) s.visited[y][x] = true; }
        window.addDungeonLog(`🌳 世界樹の記憶により、このフロアの地形を完全に把握した！`, '#00BCD4');
    }
    if (mySkin.includes('spirit_type3')) {
        s.items.forEach(it => {
            let parsed = window.parseItemString(it.key);
            if (!s.aiMemory.identified.includes(parsed.baseId)) s.aiMemory.identified.push(parsed.baseId);
        });
        window.addDungeonLog(`👁️ 鑑定眼により、フロアのアイテムの正体を見破った！`, '#00BCD4');
    }
    
    if (floorMhType === 'large') {
        s.isMHDiscovered = true;
        setTimeout(() => { if (typeof window.triggerMonsterHouseEffect === 'function') window.triggerMonsterHouseEffect(); }, 500);
    }
    
    window.updateDungeonUI();
};

window.triggerMonsterHouseEffect = function() {
    window.addDungeonLog(`🚨 モンスターハウスだ！！`, '#ff5252');
    const dgMap = document.getElementById('dg-map-container');
    if (dgMap) {
        dgMap.style.transition = 'background-color 0.1s';
        dgMap.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
        setTimeout(() => { dgMap.style.backgroundColor = 'transparent'; }, 150);
        setTimeout(() => { dgMap.style.backgroundColor = 'rgba(255, 0, 0, 0.6)'; }, 300);
        setTimeout(() => { dgMap.style.backgroundColor = 'transparent'; }, 450);
    }
};

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

// ★修正: 第2引数(startFloor)を受け取れるようにする
window.openDungeonUI = function(mapType = 'skull', startFloor = null) {
    const s = window.DUNGEON_STATE;
    
    // ==========================================
    // ★ 新規追加：未識別アイテムのランダム辞書生成
    // ==========================================
    const randomizeArray = (arr) => arr.slice().sort(() => Math.random() - 0.5);
    
    // 見た目のバリエーション
    const grassNames = randomizeArray(['赤い草', '青い草', '黄色い草', '緑の草', '紫の草', '白い草', '黒い草', '虹色の草', '星型の草']);
    const scrollNames = randomizeArray(['シワシワの巻物', '古びた巻物', '濡れた巻物', '燃えかけの巻物', '金箔の巻物', '血塗られた巻物', '星印の巻物', '無地の巻物']);
    const wandNames = randomizeArray(['曲がった杖', 'まっすぐな杖', 'ドクロの杖', '水晶の杖', '短い杖', '長い杖', '黄金の杖', '黒檀の杖']);
    
    // 実際のアイテムID
    const realGrasses = ['herb', 'item_berry', 'item_seed_happy']; // パンや魚は識別済みとする
    const realScrolls = ['item_scroll_sleep', 'item_scroll_confuse', 'item_scroll_identify']; // ★識別の巻物を後で追加します
    const realWands = ['item_wand_fire', 'item_wand_swap', 'item_wand_blow'];
    
    // 今回の冒険のハッシュマップ（正体と見た目の紐付け）
    s.sessionItemDict = {};
    // AIの記憶（完全に識別したか、仮名をつけているか）
    s.aiMemory = { identified: [], tempNames: {} };

    realGrasses.forEach((id, idx) => s.sessionItemDict[id] = grassNames[idx]);
    realScrolls.forEach((id, idx) => s.sessionItemDict[id] = scrollNames[idx]);
    realWands.forEach((id, idx) => s.sessionItemDict[id] = wandNames[idx]);

    // ★追加: デバッグの階層指定があれば優先、無ければ1階から
    let floor = startFloor || (window.dungeonState && window.dungeonState.floor) || 1;
    s.mapType = mapType; s.floor = floor;
    if (window.dungeonState) window.dungeonState = null; // リセット
    
    let currentSkin = 'robot'; let currentType = 'robot';
    if (window.aiPet) {
        currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        currentType = currentSkin.split('_')[0]; 
    }
    
    s.player.type = currentType;
    s.player.skin = currentSkin;
    s.player.atkBuff = 0; s.player.defBuff = 0;

    // ★追加：育成モードからのステータス引継ぎ
    let pEnergy = window.aiPet && window.aiPet.energy !== undefined ? window.aiPet.energy : 100;
    let pHunger = window.aiPet && window.aiPet.hunger !== undefined ? window.aiPet.hunger : 100;
    
    s.player.maxHunger = 100; // 上限突破用

    if (mapType === 'crystal') {
        s.player.maxHp = 100;
        s.player.hp = Math.max(1, Math.floor(100 * (pEnergy / 100))); // 現在の体力割合を引き継ぐ
        s.player.hunger = pHunger; // 満腹度を引き継ぐ
        s.player.level = 1;
        s.player.exp = 0;
        s.player.nextExp = 20;
        s.player.basePwr = 10;
        s.player.tempInventory = []; 
    } else {
        if (window.aiPet) {
            let pwr = window.aiPet.stats.power || 10;
            let gen = window.aiPet.generation || 1;
            let age = window.aiPet.age || 0;
            s.player.maxHp = 100 + (pwr * 2) + (gen * 5) + (age * 2);
            s.player.hp = Math.max(1, Math.floor(s.player.maxHp * (pEnergy / 100))); // 現在の体力割合
            s.player.hunger = pHunger; // 満腹度を引き継ぐ
            s.player.basePwr = pwr;
            s.player.tempInventory = window.aiPet.inventory ? [...window.aiPet.inventory] : [];
        }
    }
    
    window.generateDungeonFloor(); s.active = true;

    let dungeonUI = document.getElementById('dungeon-main-ui');
    if (!dungeonUI) {
        dungeonUI = document.createElement('div'); dungeonUI.id = 'dungeon-main-ui';
        dungeonUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 30000; display: flex; flex-direction: column; color: white; font-family: monospace, sans-serif; overflow: hidden;`;
        document.body.appendChild(dungeonUI);
    }
    
    let titleColor = mapType === 'crystal' ? '#E040FB' : '#00BCD4';
    let titleName = mapType === 'crystal' ? '💎 クリスタル迷宮' : '🗡️ スカルダンジョン';
    let levelHtml = mapType === 'crystal' ? `<span style="display:inline-block; margin-left:15px; color:#E040FB; font-weight:bold;">Lv.${s.player.level}</span>` : '';

    // ★ 修正：ステータスパネルの中に「持ち込みアイテム」の表示枠を追加
    dungeonUI.innerHTML = `
        <style>
            @keyframes atk-up { 0% { transform: translateY(0); } 50% { transform: translateY(-30px); } 100% { transform: translateY(0); } }
            @keyframes atk-down { 0% { transform: translateY(0); } 50% { transform: translateY(30px); } 100% { transform: translateY(0); } }
            @keyframes atk-left { 0% { transform: translateX(0); } 50% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
            @keyframes atk-right { 0% { transform: translateX(0); } 50% { transform: translateX(30px); } 100% { transform: translateX(0); } }
            .anim-atk-up { animation: atk-up 0.15s ease-out; } .anim-atk-down { animation: atk-down 0.15s ease-out; }
            .anim-atk-left { animation: atk-left 0.15s ease-out; } .anim-atk-right { animation: atk-right 0.15s ease-out; }
            
            /* ★追加：ダメージエフェクト（赤く光って揺れる） */
            @keyframes dmg-shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                50% { transform: translateX(8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                75% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                100% { transform: translateX(0); filter: none; }
            }
            .anim-damage { animation: dmg-shake 0.2s ease-in-out; }
            
            /* ★追加：画面全体の振動 */
            @keyframes screen-shake {
                0% { transform: translate(0, 0); }
                20% { transform: translate(-3px, 3px); }
                40% { transform: translate(3px, -3px); }
                60% { transform: translate(-3px, -3px); }
                80% { transform: translate(3px, 3px); }
                100% { transform: translate(0, 0); }
            }
            .anim-screen-shake { animation: screen-shake 0.15s ease-in-out; }
            
            /* ★追加：ダメージ数値のポップアップ */
            /* ★追加：ダメージ数値のポップアップ */
            @keyframes dmg-popup {
                0% { transform: translateY(0) scale(1.5); opacity: 1; }
                100% { transform: translateY(-60px) scale(1); opacity: 0; }
            }
            .dmg-text {
                position: absolute; font-weight: bold; font-size: 36px;
                text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
                pointer-events: none; z-index: 1000;
                animation: dmg-popup 0.6s ease-out forwards;
            }
            
            /* ★追加：吹き飛ばし（ノックバック）の回転エフェクト */
            @keyframes spin-knockback {
                0% { transform: rotate(0deg) scale(1.2); filter: drop-shadow(0 0 10px #FF9800); }
                100% { transform: rotate(360deg) scale(1); filter: none; }
            }
            .anim-knockback { animation: spin-knockback 0.3s ease-out !important; }
            /* ★追加：ワープ、魔法、レベルアップのエフェクト */
            @keyframes warp-out-in {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0) rotate(180deg); opacity: 0; }
                100% { transform: scale(1) rotate(360deg); opacity: 1; }
            }
            .anim-warp { animation: warp-out-in 0.4s ease-in-out; }
            
            @keyframes magic-cast {
                0% { filter: drop-shadow(0 0 15px #00BCD4) brightness(1.5); transform: translateY(0); }
                50% { filter: drop-shadow(0 0 25px #E040FB) brightness(2); transform: translateY(-10px); }
                100% { filter: none; brightness(1); transform: translateY(0); }
            }
            .anim-magic { animation: magic-cast 0.5s ease-out; }
            
            @keyframes level-up-glow {
                0% { filter: drop-shadow(0 0 10px #FFD700) brightness(1.5); }
                50% { filter: drop-shadow(0 0 40px #FFEB3B) brightness(2.5); transform: scale(1.2); }
                100% { filter: none; transform: scale(1); }
            }
            .anim-levelup { animation: level-up-glow 0.8s ease-out; z-index: 10; position: relative; }
        </style>
        <div id="dg-map-container" style="position:absolute; width:100%; height:100%; overflow:hidden;">
            <div id="dg-grid" style="position:absolute; top:0; left:0; transition: transform 0.2s linear; transform-origin: 0 0;"></div>
        </div>
        <div style="position:absolute; top:0; left:0; width:100%; padding:20px; display:flex; justify-content:space-between; pointer-events:none; box-sizing:border-box; z-index:50;">
            <div style="pointer-events:auto; background:rgba(0,0,0,0.85); padding:15px 20px; border-radius:8px; border:2px solid #555; min-width:300px;">
                <div style="font-size: 22px; font-weight:bold; color:${titleColor}; margin-bottom:5px;">${titleName} B<span id="dg-floor">1</span>F</div>
                <div style="font-size: 18px;">
                    <span style="display:inline-block; width:100px;">HP: <span id="dg-hp" style="color:#4CAF50; font-weight:bold;">100</span> / <span id="dg-max-hp">100</span></span>
                    <span style="display:inline-block; margin-left:15px;">満腹: <span id="dg-hunger" style="color:#FF9800; font-weight:bold;">100</span>%</span>
                    <span id="dg-level-display">${levelHtml}</span>
                </div>
                <div id="dg-inventory-container" style="margin-top: 12px; border-top: 1px dashed #555; padding-top: 8px; display: block;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 12px; color: #aaa;">🎒 持ち込みアイテム (自動消費)</span>
                        <button onclick="window.showEquipDetailsModal()" style="padding:4px 8px; background:#FF9800; color:#fff; border:none; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.5);">🔍 装備詳細と印</button>
                    </div>
                    <div id="dg-inventory-list" style="font-size: 13px; max-height: 60px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 5px;">
                        </div>
                </div>
            </div>
            <div style="pointer-events:auto; display:flex; gap:10px; align-items:flex-start;">
                <button onclick="window.toggleDungeonModal('minimap')" style="padding:10px 15px; background:#2196F3; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">🗺️ マップ</button>
                <button onclick="window.toggleDungeonModal('log')" style="padding:10px 15px; background:#9C27B0; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">📜 ログ</button>
                <button onclick="window.closeDungeonUI(false)" style="padding:10px 15px; background:#ff5252; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">帰還する</button>
            </div>
        </div>
        <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); pointer-events:none; width:100%; display:flex; flex-direction:column; align-items:center; z-index:50;">
            <div style="background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; display:flex; gap:10px; margin-bottom:15px; pointer-events:auto; border:1px solid #555;">
                <input type="text" id="dg-chat-input" placeholder="AIに言葉を教える..." style="padding:8px; border-radius:4px; border:none; outline:none; width:200px;">
                <button onclick="window.processDungeonChat()" style="padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">送信</button>
            </div>
            <div style="color:#FFD700; font-size:16px; font-weight:bold; margin-bottom:10px; text-shadow:2px 2px 4px #000;">🧠 使える言葉</div>
            <div id="dg-known-words" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:20px; pointer-events:auto;"></div>
            <div style="display:flex; gap:15px; pointer-events:auto;">
                <button id="dg-step-btn" onclick="window.processDungeonTurn()" style="padding: 15px 30px; font-size: 20px; font-weight: bold; background: #4CAF50; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #2E7D32, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #2E7D32';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #2E7D32';">▶ 1ターン</button>
                <button id="dg-auto-btn" onclick="window.toggleDungeonAuto()" style="padding: 15px 20px; font-size: 18px; font-weight: bold; background: #2196F3; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #0D47A1';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #0D47A1';">🔄 AUTO 開始</button>
            </div>
        </div>
        <div id="dg-modal-log" style="display:none; position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); width:80%; max-width:600px; height:50%; background:rgba(10,10,15,0.9); border:3px solid #9C27B0; border-radius:12px; padding:20px; flex-direction:column; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8);"><h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 冒険の記録</h3><div id="dg-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.8; font-size:16px; padding-right:10px;"></div><button onclick="window.toggleDungeonModal('log')" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button></div>
        <div id="dg-modal-minimap" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(10,10,15,0.8); border:3px solid #2196F3; border-radius:12px; padding:20px; flex-direction:column; align-items:center; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8); width:90vw; max-width:500px; height:80vh; max-height:600px;">
            <h3 style="color:#FFF; margin-top:0; width:100%; border-bottom:1px solid #555; padding-bottom:10px; text-align:center; flex-shrink:0;">🗺️ ミニマップ</h3>
            
            <div id="dg-minimap-content" style="background:rgba(0,0,0,0.4); border:2px solid #555; position:relative; margin:15px 0; overflow:hidden; flex:1; width:100%; display:flex; justify-content:center; align-items:center;">
                <style>
                    #dg-minimap-content canvas {
                        max-width: 100%;
                        max-height: 100%;
                        width: auto !important;
                        height: auto !important;
                        object-fit: contain;
                    }
                </style>
            </div>
            
            <button onclick="window.toggleDungeonModal('minimap')" style="padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%; flex-shrink:0;">閉じる</button>
        </div>
    `;
    
    let pName = (window.aiPet && window.aiPet.name) ? window.aiPet.name : "AI";
    dungeonUI.style.display = 'flex';
    window.addDungeonLog(`=== ${pName} の冒険が始まった ===`, titleColor); 
    
    document.getElementById('dg-chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.processDungeonChat();
    });
    
    window.updateDungeonUI();
};

window.closeDungeonUI = function(isGameOver = false, isRescued = false) {
    const s = window.DUNGEON_STATE; s.active = false;
    if (s.isAuto) window.toggleDungeonAuto();
    
    // ★修正：死んだ時だけでなく「無事に帰還した時」もしっかりランキングに記録を送信する！
    if (typeof window.updateDungeonRanking === 'function') {
        window.updateDungeonRanking(s.mapType, s.floor, s.player.level);
    }
    
    let reachedFloor = s.floor; 
    let goldReward = reachedFloor * (s.mapType === 'crystal' ? 100 : 50); 
    let itemsReward = [];
    
    if (reachedFloor > 1 && (!isGameOver || isRescued)) {
        let numItems = Math.floor(reachedFloor / 2);
        const dropPool = s.mapType === 'crystal' ? ['crystal', 'item_berry'] : ['stone', 'iron', 'item_berry']; 
        for (let i = 0; i < numItems; i++) itemsReward.push(dropPool[Math.floor(Math.random() * dropPool.length)]);
        
        if (s.mapType === 'skull') {
            if (reachedFloor >= 5) itemsReward.push('mat_castle_1');
            if (reachedFloor >= 10) itemsReward.push('mat_castle_2');
            if (reachedFloor >= 20) itemsReward.push('mat_castle_3');
        } else if (s.mapType === 'crystal') {
            if (reachedFloor >= 5) itemsReward.push('mat_casino_1');
            if (reachedFloor >= 10) itemsReward.push('mat_casino_2');
            if (reachedFloor >= 20) itemsReward.push('mat_casino_3');
            if (reachedFloor >= 25) itemsReward.push('mat_card_1');
        }
    }
    
    if (isGameOver && !isRescued) { 
        goldReward = Math.floor(goldReward / 2); 
        itemsReward = itemsReward.slice(0, Math.floor(itemsReward.length / 2)); 
    }
    
    if (window.aiPet) {
        if (typeof window.aiPet.gold === 'undefined') window.aiPet.gold = 0;
        window.aiPet.gold += goldReward;
        
        // ★修正：武器と盾だけでなく、鎧と装飾品も一旦鞄に戻して持ち帰る準備をする
        if (s.player.equipWeapon) { s.player.tempInventory.push(s.player.equipWeapon); s.player.equipWeapon = null; }
        if (s.player.equipShield) { s.player.tempInventory.push(s.player.equipShield); s.player.equipShield = null; }
        if (s.player.equipArmor) { s.player.tempInventory.push(s.player.equipArmor); s.player.equipArmor = null; }
        if (s.player.equipAccessory) { s.player.tempInventory.push(s.player.equipAccessory); s.player.equipAccessory = null; }
        
        if (!window.aiPet.inventory) window.aiPet.inventory = [];

        // ★大改修：クリスタルダンジョンでも生還すれば道中のアイテムを持ち帰れる！
        if (!isGameOver || isRescued) {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = [...s.player.tempInventory]; 
            } else if (s.mapType === 'crystal') {
                s.player.tempInventory.forEach(item => window.aiPet.inventory.push(item));
            }
        } else {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = []; // スカルで死んだらロスト
            }
            // クリスタルで死んだ場合は、元々のインベントリは失われない
        }
        
        itemsReward.forEach(item => window.aiPet.inventory.push(item)); 
        if (typeof saveGameData === 'function') saveGameData();
        
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
        }
    }

    // ==========================================
    // ★大追加：死んだ時の状況を「ミニチュア画面」としてコピーして表示する！
    // ==========================================
    let snapshotHtml = "";
    if (isGameOver && !isRescued) {
        let gridDiv = document.getElementById('dg-grid');
        if (gridDiv) {
            // 倒れた瞬間のマップDOMを丸ごとクローン
            let cloneGrid = gridDiv.cloneNode(true);
            cloneGrid.id = ''; 
            
            let boxW = 400; let boxH = 220; // 状況を表示する小窓のサイズ
            let logicalTileX = 100; let logicalTileY = 100;
            let prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
            let floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
            if (floorSp) { logicalTileX = floorSp.sw * (floorSp.scale || 1.0); logicalTileY = floorSp.sh * (floorSp.scale || 1.0); }
            
            // 死んだ時のプレイヤー座標を中心にカメラを合わせ直す
            let camZoom = 0.7; // ちょっとズームして状況を見やすく
            let px = s.player.x * logicalTileX + (logicalTileX / 2);
            let py = s.player.y * logicalTileY + (logicalTileY / 2);
            let nCamX = (boxW / 2) - px * camZoom;
            let nCamY = (boxH / 2) - py * camZoom;
            
            cloneGrid.style.transform = `translate(${nCamX}px, ${nCamY}px) scale(${camZoom})`;
            cloneGrid.style.transition = 'none'; // カメラのパンを防ぐ
            
            // 枠組みの作成
            let wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = `${boxW}px`;
            wrapper.style.height = `${boxH}px`;
            wrapper.style.margin = '0 auto 10px auto';
            wrapper.style.border = '3px solid #ff5252';
            wrapper.style.borderRadius = '8px';
            wrapper.style.backgroundColor = '#000';
            wrapper.style.overflow = 'hidden';
            wrapper.appendChild(cloneGrid);
            
            // ★死ぬ直前のログ（死因）を最新4行だけ抽出して貼り付ける
            let logHtml = "";
            let logArea = document.getElementById('dg-log-area');
            if (logArea && logArea.children.length > 0) {
                let lastLogs = Array.from(logArea.children).slice(-4);
                logHtml = `<div style="text-align:left; background:rgba(0,0,0,0.8); padding:8px; border-radius:6px; font-size:13px; color:#ddd; margin-bottom:15px; border:1px dashed #ff5252;">`;
                lastLogs.forEach(l => logHtml += `<div style="margin-bottom:3px;">${l.innerHTML}</div>`);
                logHtml += `</div>`;
            }

            snapshotHtml = `<div style="color:#ff5252; font-size:16px; margin-bottom:5px; font-weight:bold;">📷 倒れた瞬間の状況</div>` + wrapper.outerHTML + logHtml;
        }
    }
    // ==========================================

    let rewardHtml = `<div style="font-size:22px; margin-bottom:20px;">到達フロア: <b>B${reachedFloor}F</b></div>`;
    rewardHtml += `<div style="color:#FFD700; font-size:24px; font-weight:bold; margin-bottom:15px;">💰 ${goldReward} G 獲得！</div>`;
    
    if (itemsReward.length > 0 || (!isGameOver || isRescued)) {
        // 表示用に、持ち帰ったすべてを合算
        let displayRewards = [...itemsReward];
        if (!isGameOver || isRescued) {
            if (s.mapType === 'crystal') displayRewards = displayRewards.concat(s.player.tempInventory);
        }
        
        if (displayRewards.length > 0) {
            let itemCounts = {}; displayRewards.forEach(i => itemCounts[i] = (itemCounts[i]||0) + 1);
            rewardHtml += `<div style="text-align:left; background:#222; padding:15px; border-radius:8px; border:2px solid #555; width:80%; margin:0 auto; max-height: 200px; overflow-y: auto;">`;
            rewardHtml += `<div style="color:#aaa; font-size:14px; margin-bottom:5px;">▼ 持ち帰ったアイテム</div>`;
            for(let key in itemCounts) {
                // ★完全修正：getDungeonItemEffect を通すことで、＋値も印もすべて綺麗な日本語に翻訳される！
                let eff = window.getDungeonItemEffect(key);
                let itemName = eff ? eff.name : key;
                
                let nameColor = key.startsWith('mat_') ? '#E040FB' : '#FFF';
                // 装備品は特別な色（金色）にする
                if (eff && (eff.equipType !== null)) nameColor = '#FFD700';
                
                rewardHtml += `<div style="font-size:18px; color:${nameColor};">🎁 ${itemName} <span style="color:#4CAF50;">x ${itemCounts[key]}</span></div>`;
            }
            rewardHtml += `</div>`;
        }
    } else {
        rewardHtml += `<div style="color:#aaa; margin-top:20px;">アイテムの獲得はありませんでした。</div>`;
    }

    let actionButtons = "";
    if (isGameOver && !isRescued) {
        actionButtons = `
            <div style="display:flex; gap:15px; justify-content:center; margin-top:25px;">
                <button onclick="window.sendRescueRequest('${s.mapType}', ${s.floor})" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#2196F3; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #0D47A1;">
                    🆘 救助を要請する
                </button>
                <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#444; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #222;">
                    諦めて村へ戻る
                </button>
            </div>
            <div style="font-size:12px; color:#ff9800; margin-top:10px;">※救助を要請すると、助けが来るまでゲームが進行できなくなります。</div>
        `;
    } else {
        let titleWord = isRescued ? '👼 救助されました！' : '✨ 探索完了！';
        actionButtons = `
            <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                    style="margin-top:30px; padding:15px 40px; font-size:20px; font-weight:bold; background:#4CAF50; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 6px 0 #2E7D32;">
                ${isRescued ? '冒険を再開する！' : '村へ戻る ➔'}
            </button>
        `;
    }

    let resultUI = document.getElementById('dg-result-ui');
    if (!resultUI) {
        resultUI = document.createElement('div'); resultUI.id = 'dg-result-ui';
        resultUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 40000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif; overflow-y:auto;`;
        document.body.appendChild(resultUI);
    }
    
    let resultTitle = isGameOver && !isRescued ? '💀 探索失敗...' : (isRescued ? '👼 救助成功！' : '✨ 探索完了！');
    let titleColorStr = isGameOver && !isRescued ? '#ff5252' : '#FFD700';

    resultUI.innerHTML = `
        <div style="background:#1a1a1a; border:4px solid ${titleColorStr}; border-radius:12px; padding:30px; text-align:center; min-width:400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); margin: 20px 0;">
            <h2 style="color:${titleColorStr}; font-size:32px; margin-top:0; margin-bottom:15px;">${resultTitle}</h2>
            ${snapshotHtml} ${rewardHtml}
            ${actionButtons}
        </div>
    `;
    resultUI.style.display = 'flex';
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
            
            let zzz = enemyDiv.querySelector('.zzz-mark');
            if (e.charmed) {
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
            if (s.grid[y][x] === 1) dot.style.backgroundColor = '#444'; else if (s.grid[y][x] === 2) dot.style.backgroundColor = '#00BCD4'; else dot.style.backgroundColor = '#888'; 
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
// ★ 視界判定用の共通関数（新規追加）
// ==========================================
window.isTileVisible = function(s, tx, ty) {
    let currentTile = s.grid[s.player.y][s.player.x];
    let isCorridor = (currentTile === 3); // 3は通路
    
    let baseSightRadius = isCorridor ? 1.5 : 1.5; 
    if (s.player.type === 'bird') baseSightRadius += 2.0; // 鳥は通路でも目が良い

    // ①自分の周囲の狭い円形は常に見える
    const dist = Math.sqrt(Math.pow(tx - s.player.x, 2) + Math.pow(ty - s.player.y, 2));
    if (dist <= baseSightRadius) return true;

    // ②自分が部屋にいる場合、その部屋の全域（＋周囲1マスの壁）は見える
    if (!isCorridor && s.roomsInfo) {
        for (let r of s.roomsInfo) {
            // 自分がこの部屋の中にいるか？
            if (s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) {
                // 対象のタイルがこの部屋（周囲の壁を含む）か？
                if (tx >= r.x - 1 && tx < r.x + r.w + 1 && ty >= r.y - 1 && ty < r.y + r.h + 1) {
                    return true;
                }
            }
        }
    }
    return false;
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

// ==========================================
// 🚪 ダンジョン突入用フック ＆ 拠点時間停止パッチ
// ==========================================
(function() {
    if (typeof window.aiPet === 'undefined') return;

    if (!window.aiPet._dungeonPatchApplied) {
        window.aiPet._dungeonPatchApplied = true;

        // ダンジョン突入処理の共通関数
        const handleDungeonEntry = function(context) {
            if (context.interactionTarget && (context.interactionTarget.type === 'skull' || context.interactionTarget.type === 'crystal')) {
                context.actionState = 'idle'; context.isIndoors = false; context.indoorTarget = null;
                context.schedule = []; // 予定をクリア
                
                // TCGアンロック
                if (typeof window.triggerTCGUnlock === 'function') {
                    if (context.interactionTarget.type === 'skull') window.triggerTCGUnlock('visit_cave', context.generation);
                    if (context.interactionTarget.type === 'crystal') window.triggerTCGUnlock('visit_mine', context.generation);
                }

                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.openDungeonUI === 'function') window.openDungeonUI(context.interactionTarget.type);
                return true;
            }
            return false;
        };

        // 探索・移動衝突時にフック
        const _origExplore = window.aiPet.processExploration;
        const _safeExplore = function() {
            if (handleDungeonEntry(this)) return;
            if (typeof _origExplore === 'function') _origExplore.call(this);
        };
        window.aiPet.processExploration = _safeExplore;
        if (window.AICharacter) window.AICharacter.prototype.processExploration = _safeExplore;

        const _origEnter = window.aiPet.executeEnterAction;
        const _safeEnter = function() {
            if (handleDungeonEntry(this)) return;
            if (typeof _origEnter === 'function') _origEnter.call(this);
        };
        window.aiPet.executeEnterAction = _safeEnter;
        if (window.AICharacter) window.AICharacter.prototype.executeEnterAction = _safeEnter;

        // ダンジョン中は拠点の時間（update）を完全に止める
        const _baseUpdate = window.aiPet.update;
        const _safeUpdate = function(dt) {
            if (window.DUNGEON_STATE && window.DUNGEON_STATE.active) return;
            if (typeof _baseUpdate === 'function') _baseUpdate.call(this, dt);
        };
        window.aiPet.update = _safeUpdate;
        if (window.AICharacter) window.AICharacter.prototype.update = _safeUpdate;
    }
})();

// ==========================================
// 🔒 ダンジョンの入り口の免許皆伝チェック（UI制御）
// ==========================================
if (typeof window._originalOpenDungeonUI === 'undefined' && typeof window.openDungeonUI === 'function') {
    window._originalOpenDungeonUI = window.openDungeonUI;
    
    window.openDungeonUI = function(dungeonType, startFloor) { 
        let isMasterExplorer = (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.rank && window.aiPet.apprentice.rank['explore'] >= 10);
        
        if (!isMasterExplorer && window.currentMode !== 'debug') {
            window.aiPet.actionState = 'idle';
            window.aiPet.message = "ここから先は危険だ...\n（※入るには「冒険家」の免許皆伝が必要です）";
            window.aiPet.messageTimer = 180;
            return; 
        }
        
        window._originalOpenDungeonUI(dungeonType, startFloor);
    };
}


// ==========================================
// 🔄 ダンジョンのターン進行ロジック（完全版）
// ==========================================
window.processDungeonTurn = async function() { 
    const s = window.DUNGEON_STATE; 
    if (s.isProcessingTurn) return;
    s.isProcessingTurn = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    try {
        const ai = window.aiPet; const aiName = ai.name || "AI"; 
        
        let tData = typeof charaTraits !== 'undefined' ? (charaTraits[s.player.skin] || charaTraits[s.player.type]) : null;
        let consumption = tData ? (tData.consumption || 1.0) : 1.0;
        
        let shEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
        let arEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
        let acEff = s.player.equipAccessory ? window.getDungeonItemEffect(s.player.equipAccessory) : null;
        
        let allTraits = [];
        if (shEff) allTraits.push(...shEff.traits);
        if (arEff) allTraits.push(...arEff.traits);
        if (acEff) allTraits.push(...acEff.traits);

        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];

        let rawIntel = window.aiPet && window.aiPet.stats && window.aiPet.stats.intel ? window.aiPet.stats.intel : 10;
        if (typeof rawIntel === 'string') {
            rawIntel = parseFloat(rawIntel.replace(/,/g, '').replace(/[a-zA-Z]/g, ''));
        }
        if (isNaN(rawIntel)) rawIntel = 10;

        let iqRank = 0;
        if (rawIntel >= 1000000) iqRank = 3;      
        else if (rawIntel >= 10000) iqRank = 2;   
        else if (rawIntel >= 100) iqRank = 1;     

        if (s.isAuto || s.turnPassed) {

            // ★ モンスターハウス入室チェック
            let playerRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
            if (playerRoom && playerRoom.isMH && !s.isMHDiscovered) {
                s.isMHDiscovered = true;
                if (typeof window.triggerMonsterHouseEffect === 'function') window.triggerMonsterHouseEffect();
                s.enemies.forEach(e => {
                    if (e.x >= playerRoom.x && e.x < playerRoom.x + playerRoom.w && e.y >= playerRoom.y && e.y < playerRoom.y + playerRoom.h) {
                        if (e.status && e.status.sleep > 0) e.status.sleep = 0;
                    }
                });
            }

            let mySkin = s.player.skin || "";
            if (mySkin === 'spirit' && s.turnCount % 5 === 0 && s.player.hp < s.player.maxHp) s.player.hp++;
            if (mySkin === 'spirit_type2_2') {
                s.rescueTargets.forEach(npc => {
                    if (!npc.rescued && Math.abs(npc.x - s.player.x) <= 1 && Math.abs(npc.y - s.player.y) <= 1) {
                        window.addDungeonLog(`✨ 癒やしのオーラが ${npc.name} を包み込む...`, '#4CAF50');
                    }
                });
            }
            if (mySkin === 'spirit_type2_3') s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0, wet: s.player.status.wet, sleep: 0 };
            if (mySkin === 'spirit_type5' && Math.random() < 0.2) s.player.hunger += (1 / s.maxHungerTime);

            let sameRoomSweet = s.enemies.find(e => e.hp > 0 && e.skin === 'spirit_type2_2' && window.isTileVisible(s, e.x, e.y));
            if (sameRoomSweet) {
                s.player.hunger -= (1 / s.maxHungerTime);
                if (s.turnCount % 10 === 0) window.addDungeonLog(`🌸 甘い香りで お腹が急激に減ってきた...`, '#FF9800');
            }

            if (!s.floorTimers) s.floorTimers = [];
            for (let i = s.floorTimers.length - 1; i >= 0; i--) {
                let timer = s.floorTimers[i];
                timer.turns--;
                if (timer.turns <= 0) {
                    if (timer.type === 'fire') {
                        s.grid[timer.y][timer.x] = 7; window.updateDungeonUI();
                    } else if (timer.type === 'seed') {
                        let grownItems = ['herb', 'item_bread', 'item_herb_life']; 
                        let resultItem = grownItems[Math.floor(Math.random() * grownItems.length)];
                        s.items.push({ x: timer.x, y: timer.y, key: resultItem });
                    }
                    s.floorTimers.splice(i, 1);
                }
            }
            
            if (s.player.status && s.player.status.wet > 0) {
                s.player.status.wet--;
                if (s.player.status.wet <= 0) window.addDungeonLog(`服が乾いた！`, '#4CAF50');
            }
            
            let actStep = 1;
            
            s.floorTurn = (s.floorTurn || 0) + 1;
            if (s.floorTurn === 700) window.addDungeonLog(`🌀 どこからか 風が吹いてきた...`, '#00BCD4');
            if (s.floorTurn === 850) window.addDungeonLog(`🌀🌀 強い風が 吹き荒れている！`, '#FF9800');
            if (s.floorTurn === 950) window.addDungeonLog(`🌀🌀🌀 突風だ！ 次の風が吹いたら 飛ばされてしまう！`, '#FF5252');
            if (s.floorTurn >= 1000) {
                window.addDungeonLog(`🌪️ 謎の突風に 吹き飛ばされた！！！`, '#FF5252');
                s.player.hp = 0; window.updateDungeonUI(); setTimeout(() => window.closeDungeonUI(true, false), 1500); return; 
            }

            let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);

            if ((allTraits.includes('regen') || allTraits.includes('life')) && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
            if (activeTraits.includes('大地の恵み') && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 2);

            if (allTraits.includes('half_hunger')) consumption *= 0.5;
            if (allTraits.includes('fast_hunger')) consumption *= 2.0;
            if (allTraits.includes('regen') && consumption > 1.0) consumption = 1.0; 

            if (!activeTraits.includes('無限機関')) s.player.hunger = Math.max(0, s.player.hunger - (0.15 * consumption)); 
            
            if (s.player.hunger <= 0) {
                s.player.hp -= 2; window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252');
            } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) {
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
            }

            if (s.player.status) {
                if (s.player.status.poison > 0) {
                    s.player.hp -= 3; window.addDungeonLog(`🤢 毒のダメージを受けた！(HP-3)`, '#9C27B0');
                    s.player.status.poison--;
                    if (s.player.status.poison <= 0) window.addDungeonLog(`毒が治った！`, '#4CAF50');
                }
                if (s.player.status.confusion > 0) {
                    s.player.status.confusion--;
                    if (s.player.status.confusion <= 0) window.addDungeonLog(`混乱が解けて正気を取り戻した！`, '#4CAF50');
                }
                if (s.player.status.blind > 0) {
                    s.player.status.blind--;
                    if (s.player.status.blind <= 0) window.addDungeonLog(`視界が元に戻った！`, '#4CAF50');
                }
                if (s.player.status.paralyzed > 0) {
                    s.player.status.paralyzed--;
                    if (s.player.status.paralyzed <= 0) window.addDungeonLog(`足の痺れがとれた！`, '#4CAF50');
                }
            } else {
                s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0, wet: 0, sleep: 0 };
            }

            let isFlying = s.player.type === 'balloon' || s.player.type === 'ghost' || s.player.type === 'bird';
            let realSpd = Math.floor(ai.stats.speed || 10);
            let actionCount = 1 + Math.floor(realSpd / 50); 
            if (acEff && acEff.traits.includes('fast_move')) {
                let plus = parseInt(s.player.equipAccessory.match(/_\+(\d+)/)?.[1] || 0);
                actionCount += 1 + Math.floor(plus / 5);
            }
            if (actionCount > 1) { window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676'); }

            for (let actStep = 0; actStep < actionCount; actStep++) {
                if (s.player.hp <= 0) break; 

                let currentRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                let isDarkRoom = currentRoom ? currentRoom.isDark : false;
                let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom;
                
                let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y));
                if (isBlind) visibleEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1); 
                
                let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                let enemyAdjacent = adjacentEnemies.length > 0 ? adjacentEnemies[0] : null; 
                let enemyInSight = visibleEnemies.length > 0 ? visibleEnemies[0] : null;

                s.enemies.forEach(e => { 
                    if (e.hp > 0 && s.player.type === 'magician' && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                        if (!isBlind && window.isTileVisible(s, e.x, e.y)) {
                            let clear = true;
                            if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][s.player.x]===1) clear=false; }
                            else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[s.player.y][x]===1) clear=false; }
                            if(clear) enemyAdjacent = e; 
                        }
                    }
                });

                if (enemyAdjacent && ai.stats && ai.stats.beauty > 20) {
                    if (enemyAdjacent.type !== 'robot' && enemyAdjacent.type !== 'machine' && enemyAdjacent.type !== 'stone') {
                        let charmChance = Math.min(0.25, ai.stats.beauty / 400); 
                        if (Math.random() < charmChance) {
                            window.addDungeonLog(`敵は ${aiName} の美しさにみとれて動けない！`, '#E040FB');
                            enemyAdjacent.charmed = true; 
                        }
                    }
                }

                let chosenCommand = null; 
                let smartChance = Math.min(0.95, (ai.stats.intel || 10) / 100); 
                let thoughtLog = "";
                
                let myWords = (ai.apprentice && ai.apprentice.learnedWords) ? ai.apprentice.learnedWords : [];
                let validCmdIds = []; myWords.forEach(w => { let cmd = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w); if (cmd && cmd.id) validCmdIds.push(cmd.id); });
                let pType = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(ai.stats) : '普通';

                let isConfused = s.player.status && s.player.status.confusion > 0;
                if (isConfused) { window.addDungeonLog(`🌀 ${aiName} は混乱してフラフラしている！`, '#FF9800'); smartChance = 0; }

                if (pType === 'のんびり屋' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は面倒くさがって立ち止まった...`, '#aaa'); chosenCommand = 'skip'; } 
                else if (pType === '憂鬱' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は暗い気持ちになり、ため息をついた...`, '#aaa'); chosenCommand = 'skip'; } 
                else if ((pType === 'アイドル' || pType === '芸術家') && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は敵の前で優雅にポーズを決めた！`, '#FFD700'); chosenCommand = 'skip'; } 
                else if (pType === 'せっかち' && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は先走って空回りした！`, '#FF9800'); chosenCommand = 'skip'; }

                if (chosenCommand !== 'skip') {
                    if (validCmdIds.length === 0 || isConfused) { 
                        let randomActions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack'];
                        chosenCommand = randomActions[Math.floor(Math.random() * randomActions.length)];
                    } else {
                        if (Math.random() < smartChance) {
                            let bestItemIdx = -1; let bestItemScore = -1; let bestItemCmd = '';
                            let hpRate = s.player.hp / s.player.maxHp;
                            
                            if (validCmdIds.includes('identify') && adjacentEnemies.length === 0 && iqRank >= 1) {
                                let unkItemIdx = s.player.tempInventory.findIndex(i => {
                                    let bId = window.parseItemString(i).baseId;
                                    return s.sessionItemDict[bId] && !s.aiMemory.identified.includes(bId);
                                });
                                if (unkItemIdx !== -1 && Math.random() < 0.2) {
                                    chosenCommand = 'identify';
                                    s.player._identifyTargetIdx = unkItemIdx;
                                }
                            }

                            for(let i=0; i<s.player.tempInventory.length; i++) {
                                let itemId = s.player.tempInventory[i];
                                let effect = window.getDungeonItemEffect(itemId);
                                if (!effect.isConsumable) continue;
                                if (itemId.includes('wand') && effect.charges <= 0) continue;
                                
                                let baseItemKey = itemId.split('_+')[0];
                                let isUnidentified = s.sessionItemDict && s.sessionItemDict[baseItemKey] && !s.aiMemory.identified.includes(baseItemKey);
                                let isMagic = effect.traits.length > 0 && !effect.traits.includes('level_up'); 
                                let score = 0;
                                
                                if (isUnidentified) {
                                    let hasTempName = s.aiMemory.tempNames[baseItemKey] !== undefined;
                                    if (hpRate < 0.25 || (visibleEnemies.length >= 2 && hpRate < 0.5)) {
                                        score = 85; 
                                    } else if (!hasTempName) {
                                        if (baseItemKey.includes('wand')) {
                                            let targetInLine = visibleEnemies.some(e => e.x === s.player.x || e.y === s.player.y);
                                            score = targetInLine ? 45 : -1;
                                        } else {
                                            score = (adjacentEnemies.length === 0 && visibleEnemies.length === 0 && hpRate > 0.8) ? 30 : -1;
                                        }
                                    } else {
                                        score = -1; 
                                    }
                                } else {
                                    if (effect.traits.includes('level_up')) {
                                        if (hpRate < 0.4 || (visibleEnemies.length >= 2 && hpRate < 0.5) || s.player.hunger < 20) score = 100; 
                                    } else if (effect.traits.includes('warp_self')) {
                                        if (adjacentEnemies.length >= 2 || (hpRate < 0.3 && adjacentEnemies.length >= 1)) score = 95;
                                    } else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe')) {
                                        if (visibleEnemies.length >= 3 || adjacentEnemies.length >= 2) score = 90; else if (visibleEnemies.length >= 2) score = 75; 
                                    } else if (effect.traits.includes('fire_damage') || effect.traits.includes('blow_back')) {
                                        if (adjacentEnemies.length >= 1) score = 85; else if (visibleEnemies.length >= 2) score = 80;
                                    } else if (effect.traits.includes('swap_pos')) {
                                        let farEnemies = visibleEnemies.filter(e => Math.abs(e.x - s.player.x) > 1 || Math.abs(e.y - s.player.y) > 1);
                                        if (farEnemies.length > 0) {
                                            if (hpRate < 0.5 && adjacentEnemies.length >= 1) score = 95; 
                                            else if (adjacentEnemies.length >= 2) score = 85; 
                                            else score = -1;
                                        } else {
                                            score = -1; 
                                        }
                                    } else {
                                        if (effect.hp > 0 && s.player.hp < s.player.maxHp) { if (hpRate < 0.3) score = 95; else if (hpRate < 0.6) score = 40; else score = 10; }
                                        if (effect.hunger > 0 && s.player.hunger < maxH) { if (s.player.hunger < 20) score = Math.max(score, 90); else if (s.player.hunger < 40) score = Math.max(score, 30); else score = Math.max(score, 10); }
                                        
                                        let isHpFull = s.player.hp >= s.player.maxHp; let isHungerFull = s.player.hunger >= maxH;
                                        if (baseItemKey === 'herb' && isHpFull) { if (iqRank >= 2 && adjacentEnemies.length === 0) score = 25; else score = -1; }
                                        else if (baseItemKey === 'item_bread' && isHungerFull) { if (iqRank >= 2 && adjacentEnemies.length === 0) score = 25; else score = -1; }
                                        else if (isHpFull && isHungerFull && effect.traits.length === 0) { score = -1; }
                                    }
                                }
                                
                                if (score > bestItemScore) { 
                                    bestItemScore = score; bestItemIdx = i; bestItemCmd = isMagic ? 'use' : 'eat'; 
                                    if (bestItemCmd === 'eat' && effect.hp > 0 && validCmdIds.includes('heal')) bestItemCmd = 'heal'; 
                                    
                                    if (effect.traits.includes('swap_pos')) s.player._bestItemThought = "囲まれた！遠くの敵と場所を入れ替わって脱出する！";
                                    else if (effect.traits.includes('fire_damage')) s.player._bestItemThought = "邪魔な敵を炎の魔法で焼き払おう！";
                                    else if (effect.traits.includes('blow_back')) s.player._bestItemThought = "敵を遠くへ吹き飛ばして距離を取る！";
                                    else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe')) s.player._bestItemThought = "敵が多い！魔法で一網打尽にしよう！";
                                    else if (effect.traits.includes('warp_self')) s.player._bestItemThought = "ここは危険すぎる！ワープして逃げよう！";
                                    else if (effect.traits.includes('level_up')) s.player._bestItemThought = "ピンチだ！このアイテムで限界を突破しよう！";
                                    else if (effect.hp > 0) s.player._bestItemThought = "体力が減っている。回復アイテムを使おう。";
                                    else if (effect.hunger > 0) s.player._bestItemThought = "お腹が空いたので食料を食べよう。";
                                    else s.player._bestItemThought = "このアイテムを使ってみよう。";
                                }
                            }
                            s.player._bestItemIdx = bestItemIdx;

                            let getSmartNextStep = function(startX, startY, isTargetFunc, avoidEnemies = false) {
                                let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
                                distMap[startY][startX] = 0;
                                let queue = [{x: startX, y: startY, cost: 0}];
                                let parent = {}; let foundTarget = null;
                                
                                let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
                                let hasColdResist = activeTraits.includes('耐冷構造');
                                
                                while(queue.length > 0) {
                                    queue.sort((a, b) => a.cost - b.cost); 
                                    let cur = queue.shift();
                                    
                                    if (isTargetFunc(cur.x, cur.y)) { foundTarget = cur; break; }
                                    
                                    let dirs = [ {dx:0,dy:-1,cmd:'move_up'}, {dx:1,dy:0,cmd:'move_right'}, {dx:0,dy:1,cmd:'move_down'}, {dx:-1,dy:0,cmd:'move_left'} ];
                                    for(let d of dirs) {
                                        if (!validCmdIds.includes(d.cmd)) continue;
                                        let nx = cur.x + d.dx; let ny = cur.y + d.dy;
                                        
                                        if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                                            let tile = s.grid[ny][nx];
                                            let moveCost = 1; 
                                            
                                            if (tile === 1) {
                                                if (activeTraits.includes('重機動アーム') && (nx > 0 && nx < s.mapWidth - 1 && ny > 0 && ny < s.mapHeight - 1)) {
                                                    moveCost = 2; 
                                                } else {
                                                    continue; 
                                                }
                                            }
                                            
                                            if (!isFlying && tile === 4) continue; 
                                            if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) continue;
                                            if (tile === 5) {
                                                if (s.player.hp <= 20) continue; 
                                                moveCost = 20; 
                                            }
                                            
                                            // ★氷と罠を迂回シミュレート
                                            let willHitTrap = s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny);
                                            if (tile === 8 && !hasColdResist) {
                                                let sx = nx, sy = ny;
                                                while (true) {
                                                    if (s.traps && s.traps.some(t => t.visible && t.x === sx && t.y === sy)) {
                                                        willHitTrap = true; break;
                                                    }
                                                    let nextTile = (s.grid[sy + d.dy] && s.grid[sy + d.dy][sx + d.dx] !== undefined) ? s.grid[sy + d.dy][sx + d.dx] : 1;
                                                    if (nextTile === 1 || (!isFlying && nextTile === 4)) break;
                                                    if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === sx + d.dx && e.y === sy + d.dy)) break;
                                                    sx += d.dx; sy += d.dy;
                                                    if (nextTile !== 8) {
                                                        if (s.traps && s.traps.some(t => t.visible && t.x === sx && t.y === sy)) willHitTrap = true;
                                                        break;
                                                    }
                                                }
                                                if (willHitTrap) moveCost += 1000; 
                                                else moveCost += 5; 
                                            } else if (willHitTrap) {
                                                moveCost += 1000; 
                                            }
                                            
                                            let nextCost = cur.cost + moveCost;
                                            if (nextCost < distMap[ny][nx]) {
                                                distMap[ny][nx] = nextCost;
                                                parent[`${nx},${ny}`] = {x: cur.x, y: cur.y};
                                                queue.push({x: nx, y: ny, cost: nextCost});
                                            }
                                        }
                                    }
                                }
                                
                                if (!foundTarget) return null; 
                                let curr = foundTarget;
                                while(curr.x !== startX || curr.y !== startY) { 
                                    let p = parent[`${curr.x},${curr.y}`]; 
                                    if (p.x === startX && p.y === startY) return curr; 
                                    curr = p; 
                                }
                                return null;
                            };

                            let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 
                            let tacticalMove = null; let tacticalWait = false;
                            if (s.player._commitFight > 0) s.player._commitFight--;

                            if (visibleEnemies.length >= 2 && !isCorridor && iqRank >= 1 && !s.player._commitFight) {
                                let nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.visited[y][x] && s.grid[y][x] === 3 && !s.enemies.some(e => e.hp>0 && e.x===x && e.y===y), true);
                                if (nextStep) {
                                    if (nextStep.x === s.player.lastX && nextStep.y === s.player.lastY) { window.addDungeonLog(`${aiName} は逃げ道で挟み撃ちにされそうになり、覚悟を決めた！`, '#ff5252'); s.player._commitFight = 6; } 
                                    else {
                                        if (nextStep.x < s.player.x) tacticalMove = 'move_left'; else if (nextStep.x > s.player.x) tacticalMove = 'move_right';
                                        else if (nextStep.y < s.player.y) tacticalMove = 'move_up'; else if (nextStep.y > s.player.y) tacticalMove = 'move_down';
                                    }
                                } else { window.addDungeonLog(`${aiName} は逃げ道が塞がれていることに気づき、覚悟を決めた！`, '#ff5252'); s.player._commitFight = 6; }
                            }
                            else if (isCorridor && visibleEnemies.length > 0 && adjacentEnemies.length === 0 && iqRank >= 1) {
                                let nearestDist = Infinity; visibleEnemies.forEach(e => { let d = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y); if (d < nearestDist) nearestDist = d; });
                                if (nearestDist === 2 || visibleEnemies.length >= 2) {
                                    s.player._waitCount = (s.player._waitCount || 0) + 1;
                                    if (s.player._waitCount <= 4) { tacticalWait = true; } else { window.addDungeonLog(`${aiName} は待ちくたびれて突撃を決意した！`, '#ff5252'); s.player._commitFight = 6; s.player._waitCount = 0; }
                                } else { s.player._waitCount = 0; }
                            } else { s.player._waitCount = 0; }

                            let isHpFull = s.player.hp >= s.player.maxHp;
                            let shouldEquipAcc = false;
                            if (!s.player.equipAccessory) {
                                let accs = s.player.tempInventory.filter(i => window.getDungeonItemEffect(i).equipType === 'accessory');
                                if (accs.length > 0) {
                                    let hasOtherThanRegen = accs.some(i => !window.getDungeonItemEffect(i).traits.includes('regen_hp'));
                                    if (hasOtherThanRegen || !isHpFull) shouldEquipAcc = true; 
                                }
                            }

                            let synthInfo = null;
                            const trySynth = (equipSlot, eType) => {
                                if (!s.player[equipSlot]) return null;
                                let parsedBase = window.parseItemString(s.player[equipSlot]);
                                let bData = window.getDungeonItemEffect(s.player[equipSlot]);
                                
                                for (let i = 0; i < s.player.tempInventory.length; i++) {
                                    let matItem = s.player.tempInventory[i];
                                    let parsedMat = window.parseItemString(matItem);
                                    let matEff = window.getDungeonItemEffect(matItem);
                                    
                                    let isMatUnidentified = s.sessionItemDict && s.sessionItemDict[parsedMat.baseId] && !s.aiMemory.identified.includes(parsedMat.baseId);
                                    if (s.player.skin && s.player.skin.includes('spirit_type3')) isMatUnidentified = false;
                                    if (isMatUnidentified) continue; 
                                    
                                    if (matEff.equipType === eType) {
                                        return { type: eType, matIdx: i, isSame: true }; 
                                    }
                                    
                                    if (iqRank >= 2) {
                                        let seal = window.getSealFromItem(parsedMat.baseId, eType);
                                        if (seal && !parsedBase.seals.includes(seal)) {
                                            if (parsedBase.seals.length < bData.maxSeals) {
                                                return { type: eType, matIdx: i, isSame: false, seal: seal };
                                            }
                                        }
                                    }
                                }
                                return null;
                            };

                            if (validCmdIds.includes('synthesize') && adjacentEnemies.length === 0 && iqRank >= 1) {
                                synthInfo = trySynth('equipWeapon', 'weapon') || trySynth('equipShield', 'shield') || trySynth('equipArmor', 'armor') || trySynth('equipAccessory', 'accessory');
                            }

                            let targetPos = null;
                            let isOnStairs = s.grid[s.player.y][s.player.x] === 2;
                            let hasFood = s.player.hunger > 30;
                            let windDanger = s.floorTurn >= 850;
                            
                            let targetLevel = s.floor <= 5 ? (s.floor * 2 + 1) : (s.floor + 5);
                            
                            let hasUnexplored = false;
                            for(let ry=0; ry<s.mapHeight; ry++) {
                                for(let rx=0; rx<s.mapWidth; rx++) {
                                    if (!s.visited[ry][rx] && s.grid[ry][rx] !== 1) { hasUnexplored = true; break; }
                                }
                                if (hasUnexplored) break;
                            }
                            
                            let wantsToDescend = true; 
                            let wantsToGrind = false;
                            let isHpPinch = s.player.hp < s.player.maxHp * 0.5; 

                            if (iqRank >= 1 && hasFood && !windDanger) {
                                if (iqRank >= 2 && s.player.level < targetLevel) wantsToGrind = true; 
                                if (iqRank >= 3 && s.floorTurn < 850) wantsToGrind = true; 
                                
                                if (hasUnexplored && !wantsToGrind) {
                                    wantsToDescend = false; 
                                    thoughtLog = "未踏破エリアの探索を優先しよう。";
                                } else if (wantsToGrind) {
                                    wantsToDescend = false;
                                    thoughtLog = `探索完了。目標Lv${targetLevel}まで修練する！`;
                                } else {
                                    thoughtLog = "この階層での目的は果たした。階段を探そう。";
                                }
                            } else if (!hasFood) {
                                wantsToDescend = true; wantsToGrind = false;
                                thoughtLog = "空腹だ... 探索を切り上げて先へ進もう。";
                            } else if (windDanger) {
                                wantsToDescend = true; wantsToGrind = false;
                                thoughtLog = "風が強くなってきた！ 急いで階段を降りなければ！";
                            }
                            
                            s.player._isGrinding = wantsToGrind; 

                            if (isOnStairs) {
                                if (wantsToDescend) {
                                    chosenCommand = 'descend_stairs';
                                } else if (adjacentEnemies.length === 0 && visibleEnemies.length === 0) {
                                    if (hasUnexplored && isHpPinch) {
                                        chosenCommand = 'skip'; thoughtLog = "探索を続けるため、階段で傷を癒やしている。";
                                    } else if (wantsToGrind && !isHpFull) {
                                        chosenCommand = 'skip'; thoughtLog = "修練に備え、階段の上で体力を回復している。";
                                    }
                                }
                            }

                            if (!chosenCommand) {
                                if (validCmdIds.includes('put_down')) {
                                    let seedIdx = s.player.tempInventory.findIndex(i => i === 'item_seed_mystery');
                                    let isOnDirt = s.grid[s.player.y][s.player.x] === 7;
                                    let noItemHere = !s.items.some(i => i.x === s.player.x && i.y === s.player.y);
                                    if (seedIdx !== -1 && isOnDirt && noItemHere) {
                                        chosenCommand = 'put_down'; s.player._targetItemIdx = seedIdx;
                                        thoughtLog = "土の床だ。種を植えて育ててみよう。";
                                    }
                                }

                                if (!chosenCommand && validCmdIds.includes('throw') && enemyInSight) {
                                    let targetInLine = visibleEnemies.find(e => e.x === s.player.x || e.y === s.player.y);
                                    if (targetInLine) {
                                        let throwIdx = s.player.tempInventory.findIndex(i => {
                                            if (!i) return false;
                                            if (i === 'item_scroll_wet') return true;
                                            let parsedId = window.parseItemString(i).baseId;
                                            let isUnidentified = s.sessionItemDict && s.sessionItemDict[parsedId] && (!s.aiMemory || !s.aiMemory.identified || !s.aiMemory.identified.includes(parsedId));
                                            return isUnidentified;
                                        });
                                        if (throwIdx !== -1) {
                                            chosenCommand = 'throw'; s.player._targetItemIdx = throwIdx;
                                            thoughtLog = "直線の敵に向かって、謎のアイテムを投げて効果を試そう！";
                                        }
                                    }
                                }

                                if (!chosenCommand) {
                                    if (bestItemScore >= 80 && validCmdIds.includes(bestItemCmd)) { 
                                        chosenCommand = bestItemCmd; thoughtLog = s.player._bestItemThought;
                                    }
                                    else if (s.player.equipAccessory && window.getDungeonItemEffect(s.player.equipAccessory).traits.includes('regen_hp') && isHpFull && validCmdIds.includes('unequip') && iqRank >= 1 && !allTraits.includes('regen')) {
                                        let eff = window.getDungeonItemEffect(s.player.equipAccessory);
                                        if (!eff.traits.includes('curse')) { chosenCommand = 'unequip'; s.player._unequipTarget = 'equipAccessory'; thoughtLog = "HPが満タンなので回復の指輪を外す。"; }
                                    }
                                    else if (synthInfo) { chosenCommand = 'synthesize'; s.player._synthInfo = synthInfo; thoughtLog = "手持ちの装備を合成して強化しよう！"; }
                                    else if (tacticalMove) { chosenCommand = tacticalMove; thoughtLog = "多勢に無勢だ、通路へ退いて各個撃破を狙う！"; } 
                                    else if (tacticalWait && validCmdIds.includes('attack')) { chosenCommand = 'attack'; thoughtLog = "通路に陣取り、敵が来るのを待ち構えている！"; }
                                    else if (bestItemScore >= 25 && validCmdIds.includes(bestItemCmd)) { 
                                        chosenCommand = bestItemCmd; thoughtLog = s.player._bestItemThought;
                                    }
                                    else if ((!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                             (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                             (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                             shouldEquipAcc) {
                                        if (validCmdIds.includes('equip')) { chosenCommand = 'equip'; thoughtLog = "拾った装備を身につけよう。"; }
                                    } 
                                    else if (adjacentEnemies.length > 0 && validCmdIds.includes('attack')) { chosenCommand = 'attack'; } 
                                    else if (s.player._commitFight > 0 && visibleEnemies.length > 0) {
                                        let targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                        let nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetEnemy.x && y === targetEnemy.y);
                                        if (nextStep) {
                                            if (nextStep.x < s.player.x) chosenCommand = 'move_left'; else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                            else if (nextStep.y < s.player.y) chosenCommand = 'move_up'; else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                        }
                                    }
                                    else {
                                        let nextStep = null;

                                        // 1. アイテム回収チェック（ターゲットロック固定）
                                        if (iqRank >= 1 && s.player.tempInventory.length < 20 && s.items) {
                                            let visibleItems = s.items.filter(i => window.isTileVisible(s, i.x, i.y) && s.grid[i.y][i.x] !== 5); 
                                            if (visibleItems.length > 0) {
                                                let currentTargetStillValid = s.player._itemTargetPos && visibleItems.some(i => i.x === s.player._itemTargetPos.x && i.y === s.player._itemTargetPos.y);
                                                if (currentTargetStillValid) {
                                                    targetPos = s.player._itemTargetPos;
                                                    thoughtLog = "あそこのアイテムを目指して進もう。";
                                                } else {
                                                    let nearestItem = visibleItems.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                                    targetPos = { x: nearestItem.x, y: nearestItem.y };
                                                    s.player._itemTargetPos = targetPos;
                                                    thoughtLog = "あそこにアイテムが落ちている！拾いに行こう。";
                                                }
                                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                            } else {
                                                s.player._itemTargetPos = null;
                                            }
                                        } else {
                                            s.player._itemTargetPos = null;
                                        }

                                        // 2. 本来の目的（階段・探索・パトロール）の実行
                                        if (!nextStep) {
                                            if (wantsToDescend) {
                                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] === 2 && s.visited[y][x]);
                                                if (!nextStep && hasUnexplored) {
                                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                                                }
                                            } else if (hasUnexplored) {
                                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                                            } else if (wantsToGrind && isHpPinch) {
                                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] === 2 && s.visited[y][x]); 
                                                thoughtLog = "傷ついた。安全な階段へ退避しよう。";
                                            } else if (wantsToGrind && !isHpPinch) {
                                                let knownEnemies = s.enemies.filter(e => e.hp > 0 && s.visited[e.y] && s.visited[e.y][e.x]);
                                                let knownEnemy = null;
                                                
                                                if (s.player._patrolTargetId) {
                                                    knownEnemy = knownEnemies.find(e => e.id === s.player._patrolTargetId);
                                                }
                                                if (!knownEnemy && knownEnemies.length > 0) {
                                                    knownEnemy = knownEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                                }
                                                
                                                if (knownEnemy) {
                                                    s.player._patrolTargetId = knownEnemy.id; 
                                                    s.player._patrolTarget = null; 
                                                    targetPos = { x: knownEnemy.x, y: knownEnemy.y };
                                                    thoughtLog = `レーダーに敵影(${knownEnemy.name})を捕捉！ 狩りに向かう！`;
                                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                                } 
                                                
                                                if (!nextStep) {
                                                    s.player._patrolTargetId = null; 
                                                    if (!s.player._patrolTarget || (s.player.x === s.player._patrolTarget.x && s.player.y === s.player._patrolTarget.y)) {
                                                        let tgtRoom = s.roomsInfo[Math.floor(Math.random() * s.roomsInfo.length)];
                                                        s.player._patrolTarget = { x: tgtRoom.x + Math.floor(Math.random() * tgtRoom.w), y: tgtRoom.y + Math.floor(Math.random() * tgtRoom.h) };
                                                    }
                                                    targetPos = s.player._patrolTarget;
                                                    thoughtLog = "フロアを巡回中...";
                                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                                }
                                            }
                                        }

                                        // 3. どうしてもやることがない時は敵への接近や未踏破への最終フォールバック
                                        if (!nextStep && s.player.hp > s.player.maxHp * 0.4 && enemyInSight) {
                                            if (enemyInSight.type === 'beetle' && iqRank >= 1) thoughtLog = "カブトムシとの正面衝突は避けた方がいいな。";
                                            else nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === enemyInSight.x && y === enemyInSight.y);
                                        }
                                        
                                        if (!nextStep) nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);

                                        if (nextStep) {
                                            if (nextStep.x < s.player.x) chosenCommand = 'move_left'; else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                            else if (nextStep.y < s.player.y) chosenCommand = 'move_up'; else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                        } else {
                                            thoughtLog = "どうしていいか分からずオロオロしている...";
                                            chosenCommand = 'skip';
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (!chosenCommand) {
                    let smartValidCmds = validCmdIds.filter(cmd => {
                        if (cmd === 'eat') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0; });
                        if (cmd === 'use') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length > 0; });
                        if (cmd === 'heal') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0 && e.hp > 0; });
                        if (cmd === 'equip') return (
                                 (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                 (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                 (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                 (!s.player.equipAccessory && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'accessory'))
                            );
                        if (cmd === 'unequip') {
                            let canUnequip = false;
                            ['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
                                if (s.player[slot]) {
                                    let eff = window.getDungeonItemEffect(s.player[slot]);
                                    if (!eff.traits.includes('curse')) canUnequip = true;
                                }
                            });
                            return canUnequip;
                        }
                        if (cmd === 'attack') return enemyAdjacent != null;
                        if (['move_up', 'move_down', 'move_left', 'move_right'].includes(cmd)) {
                            let nx = s.player.x + (cmd === 'move_right' ? 1 : cmd === 'move_left' ? -1 : 0); let ny = s.player.y + (cmd === 'move_down' ? 1 : cmd === 'move_up' ? -1 : 0);
                            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1) {
                                if (!isFlying && s.grid[ny][nx] === 4) return false; 
                                return true;
                            }
                            return false;
                        }
                        return true;
                    });
                    if (smartValidCmds.length > 0) chosenCommand = smartValidCmds[Math.floor(Math.random() * smartValidCmds.length)];
                    else { window.addDungeonLog(`${aiName} はどうしていいか分からずオロオロしている...`, '#888'); chosenCommand = 'skip'; }
                }

                if (typeof chosenCommand === 'object' && chosenCommand !== null) chosenCommand = chosenCommand.id;

                let isParalyzed = s.player.status && s.player.status.paralyzed > 0;
                if (isParalyzed && ['move_up', 'move_down', 'move_left', 'move_right', 'flee'].includes(chosenCommand)) {
                    window.addDungeonLog(`⚡ 足が痺れて動けない！`, '#FF9800');
                    chosenCommand = 'skip';
                }

                if (chosenCommand !== 'skip' && chosenCommand !== 'descend_stairs') {
                    const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === chosenCommand); 
                    if (cmdInfo && !isConfused) {
                        let thoughtStr = thoughtLog ? ` (💭${thoughtLog})` : "";
                        window.addDungeonLog(`${aiName} は「${cmdInfo.name}」と考えた！${thoughtStr}`, '#B0BEC5'); 
                    } else if (!isConfused) { 
                        chosenCommand = 'attack'; 
                        window.addDungeonLog(`⚠️ ${aiName} は未知の行動に混乱し、とっさに身構えた！`, '#ff5252'); 
                    }
                } else if (chosenCommand === 'descend_stairs') {
                    window.addDungeonLog(`💭 階段を降りる決断をした。（${thoughtLog}）`, '#B0BEC5');
                } else if (chosenCommand === 'skip') {
                    if (thoughtLog && !isConfused) window.addDungeonLog(`💭 立ち止まって様子を見ている。（${thoughtLog}）`, '#B0BEC5');
                }

                if (['face_up', 'face_down', 'face_left', 'face_right'].includes(chosenCommand)) {
                    if (chosenCommand === 'face_up') s.player.face = 'up';
                    else if (chosenCommand === 'face_down') s.player.face = 'down';
                    else if (chosenCommand === 'face_left') s.player.face = 'left';
                    else if (chosenCommand === 'face_right') s.player.face = 'right';
                    
                    window.addDungeonLog(`👀 ${aiName} は向きを変えて狙いを定めた！`, '#aaa');
                    window.updateDungeonUI();
                    
                    actStep--; 
                    await sleep(100); 
                    continue; 
                }

                if (chosenCommand === 'descend_stairs') {
                    window.addDungeonLog(`階段を降りて次のフロアへ進む！`, '#00BCD4');
                    if (activeTraits && activeTraits.includes('管理者権限')) {
                        let items = Object.keys(itemCatalog).filter(k => k.startsWith('item_'));
                        let droppedKey = items[Math.floor(Math.random() * items.length)];
                        s.player.tempInventory.push(droppedKey); 
                        window.addDungeonLog(`💻 管理者権限により ${window.getDungeonItemEffect(droppedKey).name} を生成した！`, '#E040FB');
                    }

                    let fade = document.getElementById('dg-fade-overlay');
                    if (!fade) {
                        fade = document.createElement('div'); fade.id = 'dg-fade-overlay';
                        fade.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:black; z-index:99999; opacity:0; transition:opacity 0.6s ease; display:flex; justify-content:center; align-items:center; color:white; font-size:42px; font-weight:bold; pointer-events:none; letter-spacing: 4px;';
                        document.body.appendChild(fade);
                    }
                    fade.innerHTML = `<div style="text-align:center;"><span style="color:#00BCD4; font-size:24px;">地下深くへ...</span><br>B${s.floor + 1} F</div>`;
                    fade.style.opacity = 1; await sleep(800); 

                    s.floor++; s.turnCount = 0; s.floorTurn = 0; 
                    s.player.status = { poison: 0, paralyzed: 0, blind: 0, confusion: 0, wet: 0, sleep: 0 };
                    window.generateDungeonFloor(); window.updateDungeonUI(); 
                    
                    await sleep(300); fade.style.opacity = 0; await sleep(600); 
                    
                    s.isProcessingTurn = false;
                    return; 
                }

                let newX = s.player.x; let newY = s.player.y;

                if (chosenCommand === 'move_up') { newY--; s.player.face = 'up'; }
                else if (chosenCommand === 'move_down') { newY++; s.player.face = 'down'; }
                else if (chosenCommand === 'move_left') { newX--; s.player.face = 'left'; } 
                else if (chosenCommand === 'move_right'){ newX++; s.player.face = 'right'; }
                else if (chosenCommand === 'identify') {
                    let idx = s.player._identifyTargetIdx;
                    if (idx !== undefined && s.player.tempInventory[idx]) {
                        let itemId = s.player.tempInventory[idx];
                        let bId = window.parseItemString(itemId).baseId;
                        if (!s.aiMemory.identified.includes(bId)) {
                            s.aiMemory.identified.push(bId);
                            let realName = window.getDungeonItemEffect(itemId).realName;
                            window.addDungeonLog(`🔍 ${aiName} は「しらべる」を使って ${realName} だと見抜いた！`, '#FFD700');
                        }
                    }
                    s.player._identifyTargetIdx = null;
                }
                else if (chosenCommand === 'flee') {
                    if (enemyInSight) {
                        if (s.player.x < enemyInSight.x && s.grid[s.player.y][s.player.x - 1] !== 1 && (isFlying || s.grid[s.player.y][s.player.x - 1] !== 4)) { newX--; s.player.face = 'left'; }
                        else if (s.player.x > enemyInSight.x && s.grid[s.player.y][s.player.x + 1] !== 1 && (isFlying || s.grid[s.player.y][s.player.x + 1] !== 4)) { newX++; s.player.face = 'right'; }
                        else if (s.player.y < enemyInSight.y && s.grid[s.player.y - 1][s.player.x] !== 1 && (isFlying || s.grid[s.player.y - 1][s.player.x] !== 4)) { newY--; s.player.face = 'up'; }
                        else if (s.player.y > enemyInSight.y && s.grid[s.player.y + 1][s.player.x] !== 1 && (isFlying || s.grid[s.player.y + 1][s.player.x] !== 4)) { newY++; s.player.face = 'down'; }
                        if(!isConfused) window.addDungeonLog(`敵から遠ざかるように走った！`, '#00BCD4');
                    } else { if(!isConfused) window.addDungeonLog(`キョロキョロしている。（敵がいない）`, '#aaa'); }
                }

                if (newX !== s.player.x || newY !== s.player.y) {
                    if (newX >= 0 && newX < s.mapWidth && newY >= 0 && newY < s.mapHeight) {
                        
                        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
                        let isWall = s.grid[newY][newX] === 1;
                        let isWater = s.grid[newY][newX] === 4;

                        if (isWall) {
                            if (activeTraits.includes('重機動アーム') && newX > 0 && newX < s.mapWidth-1 && newY > 0 && newY < s.mapHeight-1) {
                                window.addDungeonLog(`💥 重機動アームで壁を粉砕した！`, '#FFD700');
                                s.grid[newY][newX] = 0; 
                            } else {
                                window.addDungeonLog(`ガンッ！ 壁にぶつかった！`, '#aaa');
                                continue;
                            }
                        } else if (!isFlying && isWater) {
                            window.addDungeonLog(`ガンッ！ 水脈にぶつかった！`, '#aaa');
                            continue;
                        }

                        let hitEnemy = s.enemies.find(e => e.x === newX && e.y === newY && e.hp > 0);
                        if (hitEnemy) { 
                            window.addDungeonLog(`ゴツン！ 敵にぶつかった！`, '#FF9800'); s.player.attackAnim = true; 
                        } 
                        else { 
                            s.player.lastX = s.player.x; s.player.lastY = s.player.y; 
                            s.player.x = Math.round(newX); s.player.y = Math.round(newY);

                            let hasColdResist = activeTraits.includes('耐冷構造');
                            
                            if (s.grid[s.player.y][s.player.x] === 8 && !isFlying && !hasColdResist) {
                                window.addDungeonLog(`🧊 ツルッ！ 氷の床を滑っていく！`, '#00BCD4');
                                let slipDx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0;
                                let slipDy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
                                
                                if (slipDx !== 0 || slipDy !== 0) {
                                    while (true) {
                                        let nx = s.player.x + slipDx;
                                        let ny = s.player.y + slipDy;
                                        
                                        if (nx < 0 || nx >= s.mapWidth || ny < 0 || ny >= s.mapHeight) break;
                                        
                                        let nextTile = s.grid[ny][nx];
                                        if (nextTile === 1) {
                                            window.addDungeonLog(`💥 ガンッ！ 壁に激突した！(5ダメージ)`, '#aaa');
                                            s.player.damageAnim = true; s.player.hp -= 5;
                                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 5, true);
                                            break;
                                        }
                                        
                                        let eHit = s.enemies.find(e => e.hp > 0 && e.x === nx && e.y === ny);
                                        if (eHit) {
                                            window.addDungeonLog(`💥 ゴツン！ ${eHit.name} に激突した！`, '#FF9800');
                                            eHit.damageAnim = true; eHit.hp -= 10;
                                            s.player.damageAnim = true; s.player.hp -= 5;
                                            if (typeof window.showDungeonDamageEffect === 'function') {
                                                window.showDungeonDamageEffect(eHit.x, eHit.y, 10, false);
                                                window.showDungeonDamageEffect(s.player.x, s.player.y, 5, true);
                                            }
                                            break;
                                        }
                                        
                                        s.player.x = nx; s.player.y = ny;
                                        
                                        if (nextTile !== 8) {
                                            break; 
                                        }
                                    }
                                }
                            }

                            if (s.grid[s.player.y][s.player.x] === 9 && !hasColdResist) {
                                if (!s.player.status.wet) {
                                    window.addDungeonLog(`💦 浅瀬に入り、服が水浸しになった！`, '#00BCD4');
                                }
                                s.player.status.wet = 15; 
                            }

                            if (activeTraits.includes('癒やしの舞') && s.player.hp < s.player.maxHp) {
                                let currentRoom = s.roomsInfo.find(r => newX >= r.x && newX < r.x + r.w && newY >= r.y && newY < r.y + r.h);
                                if (currentRoom) {
                                    let enemiesInRoom = s.enemies.some(e => e.hp > 0 && e.x >= currentRoom.x && e.x < currentRoom.x + currentRoom.w && e.y >= currentRoom.y && e.y < currentRoom.y + currentRoom.h);
                                    if (!enemiesInRoom) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
                                }
                            }

                            if (s.grid[s.player.y][s.player.x] === 5) {
                                window.addDungeonLog(`🔥 マグマを踏んで火傷した！(HP-10)`, '#FF5252');
                                s.player.hp -= 10;
                                s.player.damageAnim = true;
                                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "10", true);
                            }

                            if (s.items) {
                                let itemIdx = s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y);
                                if (itemIdx !== -1) {
                                    let itm = s.items[itemIdx];
                                    let eff = window.getDungeonItemEffect(itm.key); 
                                    if (s.player.tempInventory.length < 20) { 
                                        s.player.tempInventory.push(itm.key); 
                                        window.addDungeonLog(`足元から ${eff.name} を拾った！`, '#4CAF50'); 
                                        s.items.splice(itemIdx, 1);
                                    } else { 
                                        window.addDungeonLog(`カバンがいっぱいで ${eff.name} を拾えない！`, '#FF9800'); 
                                    }
                                }
                            }

                            if (s.traps && s.player.type !== 'balloon' && s.player.type !== 'ghost') { 
                                let trap = s.traps.find(t => t.x === s.player.x && t.y === s.player.y);
                                
                                if (trap && activeTraits.includes('大地の恵み')) {
                                    window.addDungeonLog(`大地の恵みにより、罠が作動しなかった！`, '#4CAF50');
                                    trap.visible = true; 
                                }
                                else if (trap && !s.player.status.paralyzed) { 
                                    if (!trap.visible) window.addDungeonLog(`カシャッ！ 何か罠を踏んだ！`, '#ff5252');
                                    trap.visible = true;
                                    if (trap.type === 'poison') {
                                        if (s.player.skin && s.player.skin.includes('spirit_type1')) {
                                            window.addDungeonLog(`🍄 毒矢が刺さったが、毒素体質により逆に体力が回復した！`, '#4CAF50');
                                            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 10);
                                            if (typeof window.showDungeonHealEffect === 'function') window.showDungeonHealEffect(s.player.x, s.player.y, 10);
                                        } else {
                                            window.addDungeonLog(`☠️ 毒矢の罠！ 毒状態になった！`, '#FF5252');
                                            s.player.damageAnim = true;
                                            s.player.hp -= 5;
                                            s.player.status.poison = 10;
                                        }
                                        trap.visible = true;
                                        window.updateDungeonUI();
                                    } 
                                    else if (trap.type === 'mine') { 
                                        let dmg = Math.floor(s.player.hp / 2);
                                        window.addDungeonLog(`💣 地雷が大爆発！(HPが半分になった！)`, '#FF5252'); 
                                        s.player.hp -= dmg; 
                                        s.player.damageAnim = true;
                                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "BOOM", true);
                                    }
                                    else if (trap.type === 'blind') { window.addDungeonLog(`泥水を被り、視界が奪われた！`, '#9C27B0'); s.player.status.blind += 15; }
                                    else if (trap.type === 'bear_trap') { window.addDungeonLog(`トラバサミに引っかかり、足が痺れた！`, '#FF9800'); s.player.status.paralyzed += 3; s.player.hp -= 10; s.player.damageAnim = true; }
                                    else if (trap.type === 'stone') {
                                        window.addDungeonLog(`ツルッ！ 石ころにつまずいて転んだ！`, '#FF9800');
                                        s.player.damageAnim = true;
                                        s.player.hp -= 2;
                                        
                                        trap.visible = true; 
                                        window.updateDungeonUI();

                                        if (s.player.tempInventory.length > 0) {
                                            let dropIdx = Math.floor(Math.random() * s.player.tempInventory.length);
                                            let dropKey = s.player.tempInventory[dropIdx];
                                            s.player.tempInventory.splice(dropIdx, 1);
                                            
                                            let dropX = s.player.x;
                                            let dropY = s.player.y;
                                            let candidates = [];
                                            
                                            for (let dy = -1; dy <= 1; dy++) {
                                                for (let dx = -1; dx <= 1; dx++) {
                                                    if (dx === 0 && dy === 0) continue;
                                                    let cx = s.player.x + dx;
                                                    let cy = s.player.y + dy;
                                                    
                                                    if (cx >= 0 && cx < s.mapWidth && cy >= 0 && cy < s.mapHeight) {
                                                        let tile = s.grid[cy][cx];
                                                        if (tile === 0 || tile === 2 || tile === 3 || tile === 6 || tile === 7) {
                                                            let hasItem = s.items.some(it => it.x === cx && it.y === cy);
                                                            let hasTrap = s.traps.some(t => t.x === cx && t.y === cy);
                                                            if (!hasItem && !hasTrap) {
                                                                candidates.push({ x: cx, y: cy });
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            
                                            if (candidates.length > 0) {
                                                let chosen = candidates[Math.floor(Math.random() * candidates.length)];
                                                dropX = chosen.x;
                                                dropY = chosen.y;
                                            }
                                            
                                            s.items.push({ x: dropX, y: dropY, key: dropKey });
                                            window.addDungeonLog(`カバンから ${window.getDungeonItemEffect(dropKey).name} が転がり落ちた！`, '#FF5252');
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (!hitEnemy && s.player.equipWeapon && window.getDungeonItemEffect(s.player.equipWeapon).traits.includes('first')) {
                            let newlyAdjacent = s.enemies.find(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                            if (newlyAdjacent) {
                                window.addDungeonLog(`⚡ 疾風迅雷！敵の気配を察知して先制攻撃を叩き込んだ！`, '#FFD700');
                                if (newlyAdjacent.x < s.player.x) s.player.face = 'left'; else if (newlyAdjacent.x > s.player.x) s.player.face = 'right'; else if (newlyAdjacent.y < s.player.y) s.player.face = 'up'; else if (newlyAdjacent.y > s.player.y) s.player.face = 'down';
                                s.player.attackAnim = true; window.dealDungeonDamage(s.player, newlyAdjacent); window.updateDungeonUI(); await sleep(200);
                            }
                        }
                    } else { window.addDungeonLog(`ガンッ！ 壁や水脈にぶつかった！`, '#aaa'); }
                }
                else if (chosenCommand === 'attack') {
                    let dmg = (s.player.equipWeapon && window.getDungeonItemEffect) ? window.getDungeonItemEffect(s.player.equipWeapon).atk : 5;

                    if (enemyAdjacent && !isConfused) {
                        if (enemyAdjacent.x < s.player.x) s.player.face = 'left'; else if (enemyAdjacent.x > s.player.x) s.player.face = 'right';
                        else if (enemyAdjacent.y < s.player.y) s.player.face = 'up'; else if (enemyAdjacent.y > s.player.y) s.player.face = 'down';
                        s.player.attackAnim = true; 
                        
                        // ★ 攻撃時に敵を起こす
                        if (enemyAdjacent.status && enemyAdjacent.status.sleep > 0) enemyAdjacent.status.sleep = 0;
                        window.dealDungeonDamage(s.player, enemyAdjacent);
                        
                        let atkWait = enemyAdjacent.warpAnim ? 400 : 150; window.updateDungeonUI(); await sleep(atkWait);
                        
                        let wEff = s.player.equipWeapon ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
                        if (wEff && wEff.traits.includes('double') && enemyAdjacent.hp > 0) { 
                            window.addDungeonLog(`⚔️ 連撃の剣が発動！怒涛の連続攻撃！`, '#FFD700');
                            s.player.attackAnim = true; 
                            
                            window.dealDungeonDamage(s.player, enemyAdjacent);
                            window.updateDungeonUI(); await sleep(150);
                        }
                    } else { 
                        s.player.attackAnim = true; 
                        if (isConfused) {
                            let dirs = ['up', 'down', 'left', 'right']; s.player.face = dirs[Math.floor(Math.random() * dirs.length)];
                            let hx = s.player.x, hy = s.player.y;
                            if (s.player.face === 'up') hy--; else if (s.player.face === 'down') hy++; else if (s.player.face === 'left') hx--; else if (s.player.face === 'right') hx++;
                            let hitE = s.enemies.find(e => e.hp > 0 && e.x === hx && e.y === hy);
                            if (hitE) { 
                                window.addDungeonLog(`混乱したままデタラメに殴ったら当たった！`, '#FF9800'); 
                                if (hitE.status && hitE.status.sleep > 0) hitE.status.sleep = 0;
                                window.dealDungeonDamage(s.player, hitE); 
                            }
                            else { window.addDungeonLog(`明後日の方向を殴っている！`, '#aaa'); }
                        } else { window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
                    }
                } else if (chosenCommand === 'heal' || chosenCommand === 'eat' || chosenCommand === 'use') {
                    if (s.player._bestItemIdx !== undefined && s.player._bestItemIdx !== -1 && s.player.tempInventory[s.player._bestItemIdx]) {
                        let itemId = s.player.tempInventory[s.player._bestItemIdx]; 
                        let effect = window.getDungeonItemEffect(itemId);
                        let parsed = window.parseItemString(itemId);
                        let baseId = parsed.baseId;
                        let isUnidentified = s.sessionItemDict && s.sessionItemDict[baseId] && !s.aiMemory.identified.includes(baseId);
                        
                        let isMagicItem = effect.traits.length > 0 && !effect.traits.includes('level_up');

                        if (chosenCommand === 'eat' || chosenCommand === 'heal') {
                            if (isMagicItem && !isUnidentified) {
                                window.addDungeonLog(`${aiName} は ${effect.name} を食べようとしたが、食べ物ではないことに気づいた！`, '#aaa');
                                s.player._bestItemIdx = -1; continue;
                            }
                            window.addDungeonLog(`${aiName} は ${effect.name} を食べた！`, '#4CAF50'); 
                            let limitBreakMsg = ""; 
                            if (baseId === 'herb' && s.player.hp >= s.player.maxHp) { s.player.maxHp += 1; limitBreakMsg += `最大HPが ${s.player.maxHp} に！ `; }
                            if (baseId === 'item_bread' && s.player.hunger >= maxH) { s.player.maxHunger = maxH + 5; limitBreakMsg += `最大満腹度が ${s.player.maxHunger} に！`; }
                            if (limitBreakMsg !== "") window.addDungeonLog(`💪 上限突破！ ${limitBreakMsg}`, '#FF9800');
                            if (effect.hp > 0 || effect.hunger > 0) window.addDungeonLog(`HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                            
                            s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                            s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); s.player.hunger = Math.min(maxH, s.player.hunger + effect.hunger); 
                        } 
                        else if (chosenCommand === 'use') {
                            if (!isMagicItem && !isUnidentified) {
                                window.addDungeonLog(`${aiName} は ${effect.name} を使おうとしたが、使い方が分からなかった！`, '#aaa');
                                s.player._bestItemIdx = -1; continue;
                            }
                            if (itemId.includes('wand') && effect.charges <= 0) {
                                window.addDungeonLog(`${aiName} は ${effect.name} を振ったが、魔力が残っていなかった！`, '#aaa');
                                window.updateDungeonUI(); continue;
                            }

                            window.addDungeonLog(`${aiName} は ${effect.name} を使った！`, '#00BCD4'); 
                            
                            if (itemId.includes('wand')) {
                                s.player.tempInventory[s.player._bestItemIdx] = `${parsed.baseId}_+${parsed.plus - 1}`;
                            } else {
                                s.player.tempInventory.splice(s.player._bestItemIdx, 1);
                            }
                        }
                        
                        let effectTriggered = false; 

                        if (effect.traits.includes('level_up')) {
                            s.player.level = (s.player.level || 1) + 1; s.player.maxHp += 20; s.player.hp = s.player.maxHp; s.player.hunger = maxH; s.player.basePwr += 8;
                            s.player.levelUpAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                            window.addDungeonLog(`✨ 奇跡が起きた！Lv.${s.player.level}にレベルアップし、全回復した！`, '#E040FB');
                            effectTriggered = true;
                        }
                        if (effect.traits.includes('sleep_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                            s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.charmed = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                            window.addDungeonLog(`部屋中の魔物たちが深い眠りについた...💤`, '#B39DDB');
                            effectTriggered = true;
                        }
                        if (effect.traits.includes('confuse_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                            s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.confusion += 15; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                            window.addDungeonLog(`部屋中の魔物たちが大混乱に陥った！🌀`, '#FF9800');
                            effectTriggered = true;
                        }
                        if ((effect.traits.includes('fire_damage') || effect.traits.includes('swap_pos') || effect.traits.includes('blow_back')) && (chosenCommand === 'use' || isUnidentified)) {
                            s.player.magicAnim = true; 
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            
                            let targetEnemy = enemyAdjacent;
                            
                            if (effect.traits.includes('swap_pos')) {
                                let farEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && (Math.abs(e.x - s.player.x) > 1 || Math.abs(e.y - s.player.y) > 1));
                                if (farEnemies.length > 0) {
                                    let hpRateExec = s.player.hp / s.player.maxHp;
                                    if (hpRateExec < 0.5) {
                                        targetEnemy = farEnemies.sort((a,b) => (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)) - (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)))[0];
                                        window.addDungeonLog(`💡 ${aiName} はピンチを察知し、あえて遠くの敵に狙いを定めた！`, '#FFD700');
                                    }
                                } else {
                                    targetEnemy = null; 
                                }
                            }

                            if (!targetEnemy) { 
                                let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y)); 
                                if (visibleEnemies.length > 0) targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0]; 
                            }
                            
                            if (targetEnemy) {
                                if (targetEnemy.x < s.player.x) s.player.face = 'left'; 
                                else if (targetEnemy.x > s.player.x) s.player.face = 'right';
                                else if (targetEnemy.y < s.player.y) s.player.face = 'up';
                                else if (targetEnemy.y > s.player.y) s.player.face = 'down';
                                window.updateDungeonUI(); 
                                await sleep(150); 

                                let magicColor = effect.traits.includes('fire_damage') ? '#FF5252' : '#00BCD4';
                                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, magicColor);
                                await sleep(150); 

                                if (effect.traits.includes('fire_damage')) {
                                    targetEnemy.hp -= 40; targetEnemy.damageAnim = true;
                                    // ★ 魔法攻撃時に敵を起こす
                                    if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'fire'); 
                                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(targetEnemy.x, targetEnemy.y, 40, false);
                                    window.addDungeonLog(`🔥 灼熱の炎が ${targetEnemy.name} を焼き尽くす！(40ダメージ)`, '#FF5252');
                                }
                                if (effect.traits.includes('swap_pos')) {
                                    let px = s.player.x, py = s.player.y;
                                    s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px; targetEnemy.y = py;
                                    window.addDungeonLog(`🌀 魔法の力で ${targetEnemy.name} と場所を入れ替わった！`, '#00BCD4');
                                    if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                                }
                                if (effect.traits.includes('blow_back')) {
                                    let dx = Math.sign(targetEnemy.x - s.player.x); let dy = Math.sign(targetEnemy.y - s.player.y);
                                    if (dx === 0 && dy === 0) dx = 1;
                                    let pushDist = 5; let nx = targetEnemy.x, ny = targetEnemy.y;
                                    for(let k=0; k<pushDist; k++) {
                                        if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                            nx += dx; ny += dy;
                                        } else {
                                            targetEnemy.hp -= 20; targetEnemy.damageAnim = true;
                                            // ★ 吹き飛ばし激突時に敵を起こす
                                            if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                            window.addDungeonLog(`💥 ${targetEnemy.name} は壁に激突した！(20ダメージ)`, '#FF5252');
                                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, 20, false);
                                            break;
                                        }
                                    }
                                    targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                                    window.addDungeonLog(`💨 ${targetEnemy.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                                }
                                effectTriggered = true; 
                            } else { 
                                window.addDungeonLog(`しかし誰もいなかった...`, '#aaa'); 
                            }
                        }
                        if (effect.traits.includes('warp_self') && (chosenCommand === 'use' || isUnidentified)) {
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'warp');
                            let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0);
                            s.player.x = wx; s.player.y = wy; window.addDungeonLog(`🌀 ${aiName} は別の場所へワープした！`, '#E040FB'); window.updateDungeonUI();
                            effectTriggered = true;
                        }

                        if (isUnidentified) {
                            let canName = false;
                            if (chosenCommand === 'eat' || chosenCommand === 'heal') canName = true; 
                            if (chosenCommand === 'use' && effectTriggered) canName = true; 

                            if (canName && validCmdIds.includes('name_item')) {
                                let tempName = "謎のアイテム";
                                if (effect.hp > 0) tempName = "回復の草";
                                else if (effect.hunger > 0) tempName = "腹ごなしの草";
                                else if (effect.traits.includes('level_up')) tempName = "しあわせの草";
                                else if (effect.traits.includes('sleep_aoe')) tempName = "睡眠の巻物";
                                else if (effect.traits.includes('confuse_aoe')) tempName = "混乱の巻物";
                                else if (effect.traits.includes('fire_damage')) tempName = "火の杖";
                                else if (effect.traits.includes('swap_pos')) tempName = "入れ替わりの杖";
                                else if (effect.traits.includes('blow_back')) tempName = "吹き飛ばしの杖";
                                else if (effect.traits.includes('warp_self')) tempName = "ワープのアイテム";
                                
                                s.aiMemory.tempNames[baseId] = tempName;
                                window.addDungeonLog(`💡 ${aiName} は「なまえ」を使い、これを【${tempName}？】と名付けた！`, '#FFD700');
                            } else if (validCmdIds.includes('name_item')) {
                                window.addDungeonLog(`しかし、何も起きなかったので ${aiName} は名前をつけられなかった...`, '#888');
                            } else {
                                window.addDungeonLog(`しかし ${aiName} はこれが何というアイテムなのか分からなかった...（「なまえ」を知らない）`, '#888');
                            }
                        }

                    } else { window.addDungeonLog(`しかし使えるアイテムを持っていなかった！`, '#ff5252'); }
                } else if (chosenCommand === 'equip') {
                    let equippedSomething = false;
                    const tryEquip = (slotName, typeName, logName) => {
                        if (equippedSomething || s.player[slotName]) return;
                        let idx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).equipType === typeName || (typeName==='weapon' && window.getDungeonItemEffect(i).isWeapon) || (typeName==='shield' && window.getDungeonItemEffect(i).isShield));
                        if (idx !== -1) {
                            s.player[slotName] = s.player.tempInventory[idx]; s.player.tempInventory.splice(idx, 1);
                            window.addDungeonLog(`${logName}（${window.getDungeonItemEffect(s.player[slotName]).name}）を装備した！`, '#FFD700'); equippedSomething = true;
                        }
                    };
                    tryEquip('equipWeapon', 'weapon', '武器'); tryEquip('equipShield', 'shield', '盾'); tryEquip('equipArmor', 'armor', '鎧'); tryEquip('equipAccessory', 'accessory', '装飾品'); 
                    if (!equippedSomething) window.addDungeonLog(`装備できるものを持っていなかった...`, '#aaa');
                } else if (chosenCommand === 'unequip') {
                    let target = s.player._unequipTarget; s.player._unequipTarget = null; 
                    if (!target) {
                        const checkCanUnequip = (slot) => s.player[slot] && !window.getDungeonItemEffect(s.player[slot]).traits.includes('curse');
                        if (checkCanUnequip('equipAccessory')) target = 'equipAccessory';
                        else if (checkCanUnequip('equipWeapon')) target = 'equipWeapon';
                        else if (checkCanUnequip('equipShield')) target = 'equipShield';
                        else if (checkCanUnequip('equipArmor')) target = 'equipArmor';
                    }
                    if (target && s.player[target]) {
                        let eff = window.getDungeonItemEffect(s.player[target]);
                        if (eff.traits.includes('curse')) {
                            window.addDungeonLog(`しかし ${eff.name} は呪われていて外せなかった！`, '#9C27B0');
                        } else {
                            s.player.tempInventory.push(s.player[target]);
                            window.addDungeonLog(`装備をはずして鞄にしまった。`, '#aaa');
                            s.player[target] = null;
                        }
                    } else { window.addDungeonLog(`はずす装備がなかった。`, '#aaa'); }
                } else if (chosenCommand === 'synthesize') {
                    if (s.player._synthInfo) {
                        let info = s.player._synthInfo; s.player._synthInfo = null;
                        let baseEquip = s.player[info.type === 'weapon' ? 'equipWeapon' : info.type === 'shield' ? 'equipShield' : info.type === 'armor' ? 'equipArmor' : 'equipAccessory'];
                        let matEquip = s.player.tempInventory[info.matIdx];
                        let parsedBase = window.parseItemString(baseEquip); let parsedMat = window.parseItemString(matEquip);
                        let bData = window.getDungeonItemEffect(baseEquip); let mData = window.getDungeonItemEffect(matEquip);
                        
                        let newEquipStr = "";
                        let canSynth = true;

                        if (info.isSame) {
                            if (parsedBase.baseId.includes('wand')) {
                                let newCharges = parsedBase.plus + parsedMat.plus;
                                newEquipStr = `${parsedBase.baseId}_+${newCharges}`;
                                window.addDungeonLog(`🔨 ${aiName} は ${bData.name} と ${mData.name} の魔力を一つに束ねた！`, '#FFD700');
                            } else {
                                let mergedSeals = [...new Set([...parsedBase.seals, ...parsedMat.seals])];
                                
                                if (mergedSeals.length > bData.maxSeals) {
                                    mergedSeals = mergedSeals.slice(0, bData.maxSeals);
                                }
                                
                                let newPlus = parsedBase.plus + parsedMat.plus + 1; 
                                newEquipStr = `${parsedBase.baseId}_+${newPlus}`; 
                                if (mergedSeals.length > 0) newEquipStr += '_' + mergedSeals.join('_');
                                window.addDungeonLog(`🔨 ${aiName} は ${bData.name} と ${mData.name} を合成した！`, '#FFD700');
                            }
                        } else {
                            if (parsedBase.seals.length >= bData.maxSeals && !parsedBase.seals.includes(info.seal)) {
                                window.addDungeonLog(`印の限界数（${bData.maxSeals}個）に達しているためこれ以上異種合成できない！`, '#ff9800');
                                canSynth = false;
                            } else {
                                parsedBase.seals.push(info.seal); newEquipStr = `${parsedBase.baseId}`; if (parsedBase.plus > 0) newEquipStr += `_+${parsedBase.plus}`;
                                newEquipStr += '_' + parsedBase.seals.join('_'); window.addDungeonLog(`🔨 ${aiName} は ${bData.name} に ${mData.name} を溶かし込んだ！`, '#E040FB');
                            }
                        }

                        if (canSynth) {
                            s.player.tempInventory.splice(info.matIdx, 1);
                            if (info.type === 'weapon') s.player.equipWeapon = newEquipStr; else if (info.type === 'shield') s.player.equipShield = newEquipStr; else if (info.type === 'armor') s.player.equipArmor = newEquipStr; else if (info.type === 'accessory') s.player.equipAccessory = newEquipStr;
                            window.addDungeonLog(`✨ ${window.getDungeonItemEffect(newEquipStr).name} が完成した！`, '#FFD700');
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                        }
                    } else { window.addDungeonLog(`合成できる装備がなかった。`, '#aaa'); }
                }
                else if (chosenCommand === 'put_down') {
                    if (s.player._targetItemIdx !== undefined && s.player._targetItemIdx !== -1) {
                        let itemKey = s.player.tempInventory[s.player._targetItemIdx];
                        s.items.push({ x: s.player.x, y: s.player.y, key: itemKey });
                        s.player.tempInventory.splice(s.player._targetItemIdx, 1);
                        window.addDungeonLog(`${aiName} は足元に ${window.getDungeonItemEffect(itemKey).name} を置いた。`, '#aaa');
                        
                        if (itemKey === 'item_seed_mystery' && s.grid[s.player.y][s.player.x] === 7) {
                            if (!s.floorTimers) s.floorTimers = [];
                            s.floorTimers.push({ type: 'seed', x: s.player.x, y: s.player.y, turns: 15 });
                            window.addDungeonLog(`種を土に植えた！ しばらく待てば育つかもしれない...`, '#4CAF50');
                            s.items.pop(); 
                        }
                    }
                    s.player._targetItemIdx = null;
                }
                else if (chosenCommand === 'throw') {
                    if (s.player._targetItemIdx !== undefined && s.player._targetItemIdx !== -1) {
                        let itemKey = s.player.tempInventory[s.player._targetItemIdx];
                        s.player.tempInventory.splice(s.player._targetItemIdx, 1);
                        
                        window.addDungeonLog(`${aiName} は ${window.getDungeonItemEffect(itemKey).name} を投げた！`, '#00BCD4');
                        
                        let dx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0;
                        let dy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
                        let tx = s.player.x, ty = s.player.y;
                        let hitEnemy = null;
                        
                        for (let dist = 1; dist <= 10; dist++) {
                            tx += dx; ty += dy;
                            if (s.grid[ty][tx] === 1) { tx -= dx; ty -= dy; break; } 
                            hitEnemy = s.enemies.find(e => e.hp > 0 && e.x === tx && e.y === ty);
                            if (hitEnemy) break;
                        }
                        
                        if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, tx, ty, '#FFF');
                        await sleep(200);

                        if (hitEnemy) {
                            // ★ 投擲ダメージで敵を起こす
                            if (hitEnemy.status && hitEnemy.status.sleep > 0) hitEnemy.status.sleep = 0;
                            window.dealDungeonDamage(s.player, hitEnemy); 
                        } else {
                            window.addDungeonLog(`アイテムは地面に落ちた。`, '#aaa');
                            s.items.push({ x: tx, y: ty, key: itemKey });
                        }
                    }
                    s.player._targetItemIdx = null;
                }

                if (s.rescueTargets) {
                    let targetToRescue = s.rescueTargets.find(t => t.x === s.player.x && t.y === s.player.y && !t.rescued);
                    if (targetToRescue) {
                        targetToRescue.rescued = true; window.addDungeonLog(`倒れていた ${targetToRescue.name} を救助した！！`, '#FFEB3B');
                        if (typeof window.completeRescue === 'function') window.completeRescue(targetToRescue.id);
                        s.player.hp = s.player.maxHp; s.player.hunger = maxH; window.addDungeonLog(`感謝の光に包まれ、体力と満腹度が全回復した！✨`, '#4CAF50');
                    }
                }

                let waitTime = 150;
                if (s.player.levelUpAnim) waitTime = 800; else if (s.player.magicAnim) waitTime = 500;
                window.updateDungeonUI();
                
                if (actionCount > 1 && actStep < actionCount - 1) { await sleep(Math.max(200, waitTime)); } else if (chosenCommand !== 'attack') { await sleep(waitTime); }
            } 
        }

        // ==========================================
        // ★ 敵のターン
        // ==========================================
        for (let e of s.enemies) {
            if (e.hp <= 0) continue;
            
            if (e.status) {
                if (e.status.poison > 0) {
                    e.hp -= Math.max(1, Math.floor(e.maxHp * 0.05)); e.damageAnim = true;
                    e.status.poison--;
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(e.x, e.y, "Poison", false);
                }
                if (e.status.confusion > 0) e.status.confusion--;
                if (e.status.sleep === undefined) e.status.sleep = 0;
            } else { e.status = { poison: 0, confusion: 0, sleep: 0 }; }
            
            if (e.hp <= 0) { window.addDungeonLog(`${e.name} は毒で倒れた！`, '#FFD700'); continue; }
            if (e.charmed) { e.charmed = false; continue; }

            // ==========================================
            // ★ 敵の睡眠チェック（モンスターハウス対応）
            // ==========================================
            if (e.status.sleep > 0) {
                // 通常睡眠なら5%の確率で自然に起きる。MHの深い眠り(999)なら自然には起きない
                if (e.status.sleep < 999 && Math.random() < 0.05) {
                    e.status.sleep = 0;
                    window.addDungeonLog(`${e.name} は目を覚ました！`, '#aaa');
                } else {
                    continue; // 寝ているのでターンスキップ
                }
            }

            let actions = 1;
            if (e.type === 'machine' && Math.random() < 0.2) actions = 2; 

            for (let a = 0; a < actions; a++) {
                if (e.hp <= 0) break;
                
                let isEnemyConfused = e.status && e.status.confusion > 0;
                let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                let ex = e.x, ey = e.y, moveDir = '';
                let hasAttacked = false;

                if (isEnemyConfused) {
                    const dirs = [];
                    if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                    if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                    if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                    if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                    if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                    
                    if (dist === 1 && Math.random() < 0.5) { 
                        e.attackAnim = true; 
                        window.dealDungeonDamage(e, s.player); 
                        hasAttacked = true; moveDir = ''; 
                    }
                } 
                else {
                    if (e.type === 'magician' && dist <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                        let clear = true;
                        if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][s.player.x]===1) clear=false; }
                        else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[s.player.y][x]===1) clear=false; }
                        
                        if (clear) {
                            if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                            window.updateDungeonUI(); 
                            
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                            await sleep(150); 
                            
                            e.attackAnim = true; 
                            e.isPiercing = (Math.random() < 0.20); 
                            window.dealDungeonDamage(e, s.player); 
                            e.isPiercing = false; 
                            hasAttacked = true;
                        }
                    }
                    else if (dist === 1) {
                        if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                        e.attackAnim = true; 
                        window.dealDungeonDamage(e, s.player); 
                        hasAttacked = true;
                    } 
                    else if (dist < 6) {
                        if (Math.abs(s.player.x - e.x) > Math.abs(s.player.y - e.y)) {
                            if (e.x < s.player.x && s.grid[e.y][e.x+1] !== 1) { ex++; moveDir = 'right'; } else if (e.x > s.player.x && s.grid[e.y][e.x-1] !== 1) { ex--; moveDir = 'left'; }
                        } else {
                            if (e.y < s.player.y && s.grid[e.y+1][e.x] !== 1) { ey++; moveDir = 'down'; } else if (e.y > s.player.y && s.grid[e.y-1][e.x] !== 1) { ey--; moveDir = 'up'; }
                        }
                    } else {
                        if (Math.random() < 0.6) {
                            const dirs = [];
                            if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                            if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                            if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                            if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                            if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                        }
                    }
                }

                if (hasAttacked) { window.updateDungeonUI(); await sleep(150); continue; }

                if (moveDir !== '') {
                    let occupied = s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === ex && oe.y === ey);
                    let playerHit = (ex === s.player.x && ey === s.player.y);
                    if (!occupied && !playerHit) { 
                        let isEnemyFlying = e.type === 'balloon' || e.type === 'ghost' || e.type === 'bird';
                        if (!isEnemyFlying && s.grid[ey][ex] === 4) continue; 
                        
                        e.x = ex; e.y = ey; e.face = moveDir; 
                        let newDist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                        
                        if (newDist === 1 && s.player.equipWeapon && window.getDungeonItemEffect(s.player.equipWeapon).traits.includes('first')) {
                            window.addDungeonLog(`⚡ 疾風迅雷！敵の接近を察知して先制攻撃を叩き込んだ！`, '#FFD700');
                            if (e.x < s.player.x) s.player.face = 'left'; else if (e.x > s.player.x) s.player.face = 'right'; else if (e.y < s.player.y) s.player.face = 'up'; else if (e.y > s.player.y) s.player.face = 'down';
                            s.player.attackAnim = true; 
                            
                            window.dealDungeonDamage(s.player, e); 
                            
                            window.updateDungeonUI(); await sleep(200);
                        }
                    }
                }
            }
        }

        s.turnCount = (s.turnCount || 0) + 1;
        let spawnRate = s.player._isGrinding ? 12 : Math.max(15, 40 - Math.floor(s.floor / 2)); 
        
        if (s.turnCount % spawnRate === 0 && s.enemies.filter(e => e.hp > 0).length < 15) {
            let rooms = s.roomsInfo;
            if (rooms && rooms.length > 0) {
                let r = rooms[Math.floor(Math.random() * rooms.length)];
                let ex, ey; let attempts = 0;
                do { ex = r.x + Math.floor(Math.random() * r.w); ey = r.y + Math.floor(Math.random() * r.h); attempts++;
                } while (attempts < 10 && (s.grid[ey][ex] !== 0 || (ex === s.player.x && ey === s.player.y) || window.isTileVisible(s, ex, ey)));
                
                if (attempts < 10) {
                    let discovered = (window.aiPet && window.aiPet.discoveredMonsters && window.aiPet.discoveredMonsters.length > 0) 
                                     ? window.aiPet.discoveredMonsters 
                                     : ['robot'];

                    let baseSkins = discovered.filter(skin => !skin.includes('_'));
                    let gen1Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 2);
                    let gen2Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 3);

                    if (baseSkins.length === 0) baseSkins = ['robot'];

                    let pool = baseSkins;
                    if (s.floor >= 70) {
                        pool = gen2Skins.length > 0 ? gen2Skins : (gen1Skins.length > 0 ? gen1Skins : baseSkins);
                    } else if (s.floor >= 30) {
                        pool = gen1Skins.length > 0 ? gen1Skins : baseSkins;
                    }

                    let eSkin = pool[Math.floor(Math.random() * pool.length)];
                    let eType = eSkin.split('_')[0]; 

                    const eHpBase = s.mapType === 'crystal' ? 10 : 20; const eDmgBase = s.mapType === 'crystal' ? 2 : 5;
                    s.enemies.push({ id: 'e_spawn_'+Date.now(), x: ex, y: ey, hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, damage: eDmgBase + s.floor * 2, name: `迷宮の${eType}`, type: eType, skin: eSkin, face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep:0 } });
                    
                    if (s.player._isGrinding) window.addDungeonLog(`どこからか 新たな魔物の気配がする...！`, '#FF9800');
                    else window.addDungeonLog(`どこからか魔物の気配がする...`, '#aaa');
                }
            }
        }

        window.updateDungeonUI();

        if (s.player.hp <= 0) {
            window.addDungeonLog(`${aiName} は倒れてしまった...`, '#ff5252');
            if (s.isAuto) window.toggleDungeonAuto(); 
            setTimeout(() => { if (typeof window.updateDungeonRanking === 'function') window.updateDungeonRanking(s.mapType, s.floor, s.player.level); window.closeDungeonUI(true); }, 1500);
        }
    } catch (e) { console.error("【DungeonTurnエラー】処理中にエラーが発生しました:", e); } finally { s.isProcessingTurn = false; }
};