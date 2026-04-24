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

    // ★ 特性取得（ドロップテーブル操作用）
    let mySkinTemp = s.player.skin || "";
    let activeTraitsTemp = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(mySkinTemp).map(t => t.name) : [];

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

    // ★ 魔法使い系特性：天体観測（巻物のドロップウェイトを3倍にして実質的な出現数を増やす）
    if (activeTraitsTemp.includes('天体観測')) {
        dropTable.forEach(item => { if (item.id.includes('scroll')) item.weight *= 3; });
    }

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
            let pos = null;
            let attempts = 0;
            // ★追加：罠専用の厳密な配置チェック（入り口には置かない）
            do {
                pos = getRandomPos(r);
                if (pos) {
                    // 周囲上下左右4マスに「通路(3)」があるかチェック
                    let isEntrance = false;
                    const checkDirs = [{dx:0, dy:-1}, {dx:1, dy:0}, {dx:0, dy:1}, {dx:-1, dy:0}];
                    for (let d of checkDirs) {
                        let nx = pos.x + d.dx;
                        let ny = pos.y + d.dy;
                        if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] === 3) {
                            isEntrance = true;
                            break;
                        }
                    }
                    if (isEntrance) pos = null; // 入り口ならボツにして引き直し
                }
                attempts++;
            } while (!pos && attempts < 10);

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
    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(mySkin).map(t => t.name) : [];

    if (mySkin === 'spirit_type3_2' || activeTraits.includes('全天候衛星') || activeTraits.includes('叡智の頂点')) {
        for(let y=0; y<s.mapHeight; y++) { for(let x=0; x<s.mapWidth; x++) s.visited[y][x] = true; }
        let msg = activeTraits.includes('叡智の頂点') ? `👁️ 叡智の頂点により、フロアの全てが見通せる！` : 
                  (activeTraits.includes('全天候衛星') ? `🛰️ 全天候衛星からのスキャン完了！地形を完全に把握した！` : `🌳 世界樹の記憶により、このフロアの地形を完全に把握した！`);
        window.addDungeonLog(msg, '#00BCD4');
    }
    if (activeTraits.includes('気象観測') || activeTraits.includes('全天候衛星') || activeTraits.includes('星の預言') || activeTraits.includes('叡智の頂点')) {
        s.traps.forEach(t => t.visible = true); 
        window.addDungeonLog(`☁️ 隠された罠をすべて見破った！`, '#00BCD4');
    }
    if (activeTraits.includes('全天候衛星') || activeTraits.includes('叡智の頂点')) {
        s.items.forEach(i => i.discovered = true);
        s.isMHDiscovered = true; // モンスターハウスの察知
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