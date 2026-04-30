// ==========================================
// ★ 視界判定用の共通関数（新規追加）
// ==========================================
window.isTileVisible = function(s, tx, ty) {
    let currentTile = s.grid[s.player.y][s.player.x];
    let isCorridor = (currentTile === 3); // 3は通路
    
    let baseSightRadius = isCorridor ? 1.5 : 1.5; 
    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
    
    if (s.player.skin && s.player.skin.includes('bird')) baseSightRadius += 2.0; // 鳥は基本目が良い
    if (activeTraits.includes('鷹の目')) baseSightRadius += 1.5; // 鷹の目でさらに視界拡大
    if (activeTraits.includes('神眼')) baseSightRadius += 3.0;   // 神眼で極大視界
    // ★カブトムシ系：発光体（視界拡大）
    if (activeTraits.includes('発光体')) baseSightRadius += 4.0;
    // ★風船系：広域スキャン（視界拡大）
    if (activeTraits.includes('広域スキャン')) baseSightRadius += 3.0;

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
// ★ 新規追加：アイテムを周囲の空きマスに散らばらせて落とす関数
// ==========================================
window.scatterItem = function(s, originX, originY, itemKey) {
    let queue = [{x: originX, y: originY}];
    let visited = new Set();
    visited.add(`${originX},${originY}`);

    while (queue.length > 0) {
        let curr = queue.shift();
        
        let tile = s.grid[curr.y] && s.grid[curr.y][curr.x];
        let canPlaceTile = [0, 2, 3, 6, 7].includes(tile); // 床、階段、通路、草、土なら置ける
        
        let hasTrap = s.traps && s.traps.some(t => t.x === curr.x && t.y === curr.y);
        let hasItem = s.items && s.items.some(i => i.x === curr.x && i.y === curr.y);

        if (canPlaceTile && !hasTrap && !hasItem) {
            s.items.push({ x: curr.x, y: curr.y, key: itemKey });
            return { x: curr.x, y: curr.y };
        }

        let dirs = [{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0}, {dx:1,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:-1,dy:1}];
        for (let d of dirs) {
            let nx = curr.x + d.dx; let ny = curr.y + d.dy;
            let keyStr = `${nx},${ny}`;
            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && !visited.has(keyStr)) {
                if (s.grid[ny][nx] !== 1) { // 壁でなければ探索範囲を広げる
                    visited.add(keyStr);
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }
    window.addDungeonLog(`しかし、アイテムが落ちるスペースがなかった...`, '#aaa');
    return null;
};

// ==========================================
// ★ リファクタリング済：ターン開始時の処理（ステータス・空腹・トラップ等）
// ==========================================
window.applyDungeonTurnStartEffects = function(s) {
    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
    let allTraits = [];
    ['equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
        if (s.player[slot]) allTraits.push(...window.getDungeonItemEffect(s.player[slot]).traits);
    });

    let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
    if (pRoom && pRoom.isMH && !s.isMHDiscovered) {
        s.isMHDiscovered = true;
        if (typeof window.triggerMonsterHouseEffect === 'function') window.triggerMonsterHouseEffect();
        s.enemies.forEach(e => {
            if (e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h && e.status && e.status.sleep > 0) e.status.sleep = 0;
        });
    }

    let mySkin = s.player.skin || "";
    if (mySkin === 'spirit' && s.turnCount % 5 === 0 && s.player.hp < s.player.maxHp) s.player.hp++;

    // ★ ゴースト系特性：幽体（壁の中でのHP消費）
    if (activeTraits.includes('幽体') && s.grid[s.player.y][s.player.x] === 1) {
        s.player.hp -= 5; window.addDungeonLog(`👻 幽体維持... 壁の中にいるため生命力が削られている！(HP-5)`, '#9C27B0');
    }

    if (s.enemies.some(e => e.hp > 0 && e.skin === 'stone_type4' && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1)) {
        s.player.hp -= 1; s.player.damageAnim = true; window.addDungeonLog(`🔥 灼熱の体！ 近づいただけで火傷を負った！`, '#FF5252');
    }
    if (mySkin === 'spirit_type2_2') {
        s.rescueTargets.forEach(npc => { if (!npc.rescued && Math.abs(npc.x - s.player.x) <= 1 && Math.abs(npc.y - s.player.y) <= 1) window.addDungeonLog(`✨ 癒やしのオーラが ${npc.name} を包み込む...`, '#4CAF50'); });
    }
    if (mySkin === 'spirit_type2_3') s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0, wet: s.player.status.wet, sleep: 0 };
    if (mySkin === 'spirit_type5' && Math.random() < 0.2) s.player.hunger = Math.min(100, s.player.hunger + 0.5);

    let sameRoomSweet = s.enemies.find(e => e.hp > 0 && e.skin === 'spirit_type2_2' && window.isTileVisible(s, e.x, e.y));
    if (sameRoomSweet) {
        s.player.hunger = Math.max(0, s.player.hunger - 0.5);
        if (s.turnCount % 10 === 0) window.addDungeonLog(`🌸 甘い香りで お腹が急激に減ってきた...`, '#FF9800');
    }

    if (!s.floorTimers) s.floorTimers = [];
    for (let i = s.floorTimers.length - 1; i >= 0; i--) {
        let timer = s.floorTimers[i]; timer.turns--;
        if (timer.turns <= 0) {
            if (timer.type === 'fire') { s.grid[timer.y][timer.x] = 7; window.updateDungeonUI(); } 
            else if (timer.type === 'seed') {
                let grownItems = ['herb', 'item_bread', 'item_herb_life']; 
                s.items.push({ x: timer.x, y: timer.y, key: grownItems[Math.floor(Math.random() * grownItems.length)] });
            }
            s.floorTimers.splice(i, 1);
        }
    }
    
    if (s.player.status && s.player.status.wet > 0) { s.player.status.wet--; if (s.player.status.wet <= 0) window.addDungeonLog(`服が乾いた！`, '#4CAF50'); }
    s.floorTurn = (s.floorTurn || 0) + 1;
    
    if (activeTraits.includes('生きた化石')) {
        if (s.floorTurn === 700) window.addDungeonLog(`🌀 強い風が吹いてきたが、生きた化石の重厚な殻は微動だにしない！`, '#FFD700');
    } else {
        if (s.floorTurn === 700) window.addDungeonLog(`🌀 どこからか 風が吹いてきた...`, '#00BCD4');
        if (s.floorTurn === 850) window.addDungeonLog(`🌀🌀 強い風が 吹き荒れている！`, '#FF9800');
        if (s.floorTurn === 950) window.addDungeonLog(`🌀🌀🌀 突風だ！ 次の風が吹いたら 飛ばされてしまう！`, '#FF5252');
        if (s.floorTurn >= 1000) { window.addDungeonLog(`🌪️ 謎の突風に 吹き飛ばされた！！！`, '#FF5252'); s.player.hp = 0; window.updateDungeonUI(); setTimeout(() => window.closeDungeonUI(true, false), 1500); return; }
    }

    let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);
    if ((allTraits.includes('regen') || allTraits.includes('life')) && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
    if (activeTraits.includes('大地の恵み') && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 2);
    if (activeTraits.includes('天使の加護') && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
    
    // ★ ドラゴン系特性：海王の力（水脈にいる時、毎ターンHP10回復）
    if (activeTraits.includes('海王の力') && (s.grid[s.player.y][s.player.x] === 4 || s.grid[s.player.y][s.player.x] === 9) && s.player.hp < s.player.maxHp) {
        s.player.hp = Math.min(s.player.maxHp, s.player.hp + 10);
        window.addDungeonLog(`🌊 海王の力！ 水の恩恵でHPが 10 回復した！`, '#00BCD4');
    }

    let tData = typeof charaTraits !== 'undefined' ? (charaTraits[s.player.skin] || charaTraits[s.player.type]) : null;
    let consumption = tData ? (tData.consumption || 1.0) : 1.0;
    if (allTraits.includes('half_hunger')) consumption *= 0.5;
    if (allTraits.includes('fast_hunger')) consumption *= 2.0;
    if (allTraits.includes('regen') && consumption > 1.0) consumption = 1.0; 
    if (activeTraits.includes('最適化ルート')) consumption *= 0.9;
    if (activeTraits.includes('超浮力')) consumption *= 0.1;
    
    let actualConsumption = activeTraits.includes('エコ駆動') && s.player._lastCommand === 'skip' ? 0 : consumption;
    if (!activeTraits.includes('無限機関')) s.player.hunger = Math.max(0, s.player.hunger - (0.03 * actualConsumption));
    
    if (s.player.hunger <= 0) {
        if (!activeTraits.includes('古の霊体')) { s.player.hp -= 2; window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252'); }
    } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) { s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1); }

    if (s.player.status) {
        if (s.player.status.fear > 0) { s.player.status.fear--; if (s.player.status.fear <= 0) window.addDungeonLog(`恐怖が薄れ、落ち着きを取り戻した！`, '#4CAF50'); }
        if (s.player.status.poison > 0) { s.player.hp -= 3; window.addDungeonLog(`🤢 毒のダメージを受けた！(HP-3)`, '#9C27B0'); s.player.status.poison--; if (s.player.status.poison <= 0) window.addDungeonLog(`毒が治った！`, '#4CAF50'); }
        if (s.player.status.confusion > 0) { s.player.status.confusion--; if (s.player.status.confusion <= 0) window.addDungeonLog(`混乱が解けて正気を取り戻した！`, '#4CAF50'); }
        if (s.player.status.blind > 0) { s.player.status.blind--; if (s.player.status.blind <= 0) window.addDungeonLog(`視界が元に戻った！`, '#4CAF50'); }
        if (s.player.status.paralyzed > 0) { s.player.status.paralyzed--; if (s.player.status.paralyzed <= 0) window.addDungeonLog(`足の痺れがとれた！`, '#4CAF50'); }
        if (s.player.status.petrified > 0) { s.player.status.petrified--; if (s.player.status.petrified <= 0) window.addDungeonLog(`石化が解けて動けるようになった！`, '#4CAF50'); }
        if (s.player.status.burn > 0) { s.player.hp -= 3; window.addDungeonLog(`🔥 火傷のダメージを受けた！(HP-3)`, '#FF5252'); s.player.status.burn--; if (s.player.status.burn <= 0) window.addDungeonLog(`火傷が治った！`, '#4CAF50'); }
        if (s.player.status.frozen > 0) { s.player.status.frozen--; if (s.player.status.frozen <= 0) window.addDungeonLog(`凍結が解けて体が動くようになった！`, '#4CAF50'); }
        if (s.player.status.death_count > 0) { s.player.status.death_count--; if (s.player.status.death_count <= 0) { window.addDungeonLog(`⏳ 死の宣告... 命が尽きた！`, '#E91E63'); s.player.hp -= 999; s.player.damageAnim = true; } else { window.addDungeonLog(`⏳ 頭上の数字: ${s.player.status.death_count}`, '#9C27B0'); } }
    } else { s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0, wet: 0, sleep: 0, petrified: 0, fear: 0, burn: 0, frozen: 0, miss_next: false, death_count: 0, forget_plus: false }; }
    
    s.player._shieldAssimilated = false; 
};

// ==========================================
// ★ プレイヤー（AI）の思考と行動実行
// ==========================================
// ==========================================
// ★ プレイヤー（AI）の思考と行動実行（最強の自浄作用＆探索優先AI搭載版）
// ==========================================
window.executeDungeonPlayerAction = async function(s, actStep, actionCount) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const ai = window.aiPet; const aiName = ai.name || "AI"; 
    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
    let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);
    
    // ==========================================
    // 🛡️ 最強の自動浄化パッチ：カバンの中のバグデータを毎ターン強制修復する
    // ==========================================
    if (s.player.tempInventory) {
        s.player.tempInventory = s.player.tempInventory.map(item => {
            if (typeof item === 'object' && item !== null) {
                return item.id || item.key || 'herb'; // オブジェクトなら無理やりIDを引きずり出す
            }
            return item;
        }).filter(item => typeof item === 'string' && item !== 'undefined' && item !== 'null');
    }

    let rawIntel = ai.stats && ai.stats.intel ? ai.stats.intel : 10;
    if (typeof rawIntel === 'string') rawIntel = parseFloat(rawIntel.replace(/,/g, '').replace(/[a-zA-Z]/g, ''));
    if (isNaN(rawIntel)) rawIntel = 10;
    let iqRank = rawIntel >= 1000000 ? 3 : (rawIntel >= 10000 ? 2 : (rawIntel >= 100 ? 1 : 0));

    if (activeTraits.includes('神眼') && s.traps) {
        s.traps.forEach(t => {
            if (!t.visible && Math.abs(t.x - s.player.x) <= 1 && Math.abs(t.y - s.player.y) <= 1) {
                t.visible = true; window.addDungeonLog(`👁️ 神眼が足元の罠を見破った！`, '#FFD700');
            }
        });
    }

    let currentRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
    let isDarkRoom = currentRoom ? currentRoom.isDark : false;
    let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom;
    if (activeTraits.includes('発光体')) { isDarkRoom = false; isBlind = false; }

    // ★ 修正：透明化している敵（オーロラ・イリュージョン等）は視界から除外する
    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && !e.isInvisible);
    if (isBlind) visibleEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1 && !e.isInvisible); 
    
    // 隣接している敵は透明でも感知できる
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

    if (enemyAdjacent && ai.stats && ai.stats.beauty > 20 && enemyAdjacent.type !== 'robot' && enemyAdjacent.type !== 'machine' && enemyAdjacent.type !== 'stone') {
        let charmChance = Math.min(0.25, ai.stats.beauty / 400); 
        if (activeTraits.includes('宝石の煌めき')) charmChance += 0.25;
        if (Math.random() < charmChance) { window.addDungeonLog(`敵は ${aiName} の美しさにみとれて動けない！`, '#E040FB'); enemyAdjacent.charmed = true; }
    }

    let chosenCommand = null; let thoughtLog = "";
    let myWords = (ai.apprentice && ai.apprentice.learnedWords) ? ai.apprentice.learnedWords : [];
    let validCmdIds = []; myWords.forEach(w => { let cmd = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w); if (cmd && cmd.id) validCmdIds.push(cmd.id); });
    let pType = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(ai.stats) : '普通';
    let isConfused = s.player.status && s.player.status.confusion > 0;
    
    let pRoomForStone = currentRoom;
    let inGardenRoom = pRoomForStone && s.enemies.some(e => e.hp > 0 && e.skin === 'stone_type5_2' && e.x >= pRoomForStone.x && e.x < pRoomForStone.x + pRoomForStone.w && e.y >= pRoomForStone.y && e.y < pRoomForStone.y + pRoomForStone.h);
    if (inGardenRoom) validCmdIds = validCmdIds.filter(cmd => !['use', 'eat', 'heal', 'throw'].includes(cmd));

    if (isConfused) { window.addDungeonLog(`🌀 ${aiName} は混乱してフラフラしている！`, '#FF9800'); }
    else if (pType === 'のんびり屋' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は面倒くさがって立ち止まった...`, '#aaa'); chosenCommand = 'skip'; } 
    else if (pType === '憂鬱' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は暗い気持ちになり、ため息をついた...`, '#aaa'); chosenCommand = 'skip'; } 
    else if ((pType === 'アイドル' || pType === '芸術家') && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は敵の前で優雅にポーズを決めた！`, '#FFD700'); chosenCommand = 'skip'; } 
    else if (pType === 'せっかち' && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は先走って空回りした！`, '#FF9800'); chosenCommand = 'skip'; }

    let isFlying = (s.player.skin && (s.player.skin.includes('balloon') || s.player.skin.includes('ghost') || s.player.skin.includes('bird'))) || activeTraits.includes('妖精の羽') || activeTraits.includes('反重力');

    const getSmartNextStep = function(startX, startY, isTargetFunc, avoidEnemies = false) {
        let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
        distMap[startY][startX] = 0; let queue = [{x: startX, y: startY, cost: 0}];
        let parent = {}; let foundTarget = null;
        let hasColdResist = activeTraits.includes('耐冷構造') || activeTraits.includes('星の化身'); // ★星の化身は氷も滑らない
        
        while(queue.length > 0) {
            queue.sort((a, b) => a.cost - b.cost); let cur = queue.shift();
            if (isTargetFunc(cur.x, cur.y)) { foundTarget = cur; break; }
            let dirs = [ {dx:0,dy:-1,cmd:'move_up'}, {dx:1,dy:0,cmd:'move_right'}, {dx:0,dy:1,cmd:'move_down'}, {dx:-1,dy:0,cmd:'move_left'} ];
            for(let d of dirs) {
                if (!validCmdIds.includes(d.cmd)) continue;
                let nx = cur.x + d.dx; let ny = cur.y + d.dy;
                if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                    let tile = s.grid[ny][nx]; let moveCost = 1; 
                    if (tile === 1) {
                        if ((activeTraits.includes('重機動アーム') || activeTraits.includes('星の砕き手') || activeTraits.includes('星の化身')) && nx > 0 && nx < s.mapWidth - 1 && ny > 0 && ny < s.mapHeight - 1) moveCost = 2; // ★星の化身も壁抜け
                        else if (activeTraits.includes('幽体') && nx > 0 && nx < s.mapWidth - 1 && ny > 0 && ny < s.mapHeight - 1) moveCost = 3;
                        else continue; 
                    }
                    if (!isFlying && (tile === 4 || tile === 10)) continue; 
                    if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) continue;
                    if (tile === 5) { if (s.player.hp <= 20) continue; moveCost = 20; }
                    let willHitTrap = s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny);
                    if (tile === 8 && !hasColdResist) {
                        let sx = nx, sy = ny;
                        while (true) {
                            if (s.traps && s.traps.some(t => t.visible && t.x === sx && t.y === sy)) { willHitTrap = true; break; }
                            let nextTile = (s.grid[sy + d.dy] && s.grid[sy + d.dy][sx + d.dx] !== undefined) ? s.grid[sy + d.dy][sx + d.dx] : 1;
                            if (nextTile === 1 || (!isFlying && nextTile === 4)) break;
                            if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === sx + d.dx && e.y === sy + d.dy)) break;
                            sx += d.dx; sy += d.dy;
                            if (nextTile !== 8) { if (s.traps && s.traps.some(t => t.visible && t.x === sx && t.y === sy)) willHitTrap = true; break; }
                        }
                        if (willHitTrap) moveCost += 1000; else moveCost += 5; 
                    } else if (willHitTrap) { moveCost += 1000; }
                    
                    let nextCost = cur.cost + moveCost;
                    if (nextCost < distMap[ny][nx]) { distMap[ny][nx] = nextCost; parent[`${nx},${ny}`] = {x: cur.x, y: cur.y}; queue.push({x: nx, y: ny, cost: nextCost}); }
                }
            }
        }
        if (!foundTarget) return null; 
        let curr = foundTarget;
        while(curr.x !== startX || curr.y !== startY) { let p = parent[`${curr.x},${curr.y}`]; if (p.x === startX && p.y === startY) return curr; curr = p; }
        return null;
    };

    if (!chosenCommand && !isConfused) {
        if (validCmdIds.length === 0) {
            let randomActions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack'];
            chosenCommand = randomActions[Math.floor(Math.random() * randomActions.length)];
        } else {
            let bestItemIdx = -1; let bestItemScore = -1; let bestItemCmd = ''; let hpRate = s.player.hp / s.player.maxHp;
            let allTraits = [];
            ['equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
                if (s.player[slot]) allTraits.push(...window.getDungeonItemEffect(s.player[slot]).traits);
            });
            
            // ★ AI調整：鑑定(しらべる)コマンドの優先度を大幅に下げる
            if (validCmdIds.includes('identify') && adjacentEnemies.length === 0 && iqRank >= 1) {
                let unkItemIdx = s.player.tempInventory.findIndex(i => { let bId = window.parseItemString(i).baseId; return s.sessionItemDict[bId] && !s.aiMemory.identified.includes(bId); });
                if (unkItemIdx !== -1 && Math.random() < 0.05) { chosenCommand = 'identify'; s.player._identifyTargetIdx = unkItemIdx; }
            }

            for(let i=0; i<s.player.tempInventory.length; i++) {
                let itemId = s.player.tempInventory[i]; if (!itemId || itemId === 'undefined') continue;
                let effect = window.getDungeonItemEffect(itemId);
                let isGarakuta = activeTraits.includes('ガラクタ吸収') && !effect.isWeapon && !effect.isShield && !effect.isConsumable;
                if (!effect.isConsumable && !isGarakuta) continue;
                if (itemId.includes('wand') && effect.charges <= 0 && !isGarakuta) continue;
                
                let baseItemKey = itemId.split('_+')[0];
                let isUnidentified = s.sessionItemDict && s.sessionItemDict[baseItemKey] && !s.aiMemory.identified.includes(baseItemKey);
                let isMagic = effect.traits.length > 0 && !effect.traits.includes('level_up'); 
                let score = 0;
                
                if (isUnidentified) {
                    let hasTempName = s.aiMemory.tempNames[baseItemKey] !== undefined;
                    // ★ AI調整：未識別アイテムを使うスコアを下げ、無駄な立ち止まりを防止
                    if (hpRate < 0.25 || (visibleEnemies.length >= 2 && hpRate < 0.5)) score = 50; 
                    else if (!hasTempName) {
                        if (baseItemKey.includes('wand')) { score = visibleEnemies.some(e => e.x === s.player.x || e.y === s.player.y) ? 30 : -1; } 
                        else { score = -1; } // 敵がいない時は使わない
                    } else score = -1; 
                } else {
                    if (effect.traits.includes('level_up')) { if (hpRate < 0.4 || (visibleEnemies.length >= 2 && hpRate < 0.5) || s.player.hunger < 20) score = 100; } 
                    else if (effect.traits.includes('warp_self')) { if (adjacentEnemies.length >= 2 || (hpRate < 0.3 && adjacentEnemies.length >= 1)) score = 95; } 
                    else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe')) { if (visibleEnemies.length >= 3 || adjacentEnemies.length >= 2) score = 90; else if (visibleEnemies.length >= 2) score = 75; } 
                    else if (effect.traits.includes('fire_damage') || effect.traits.includes('blow_back')) { if (adjacentEnemies.length >= 1) score = 85; else if (visibleEnemies.length >= 2) score = 80; } 
                    else if (effect.traits.includes('swap_pos')) {
                        let farEnemies = visibleEnemies.filter(e => Math.abs(e.x - s.player.x) > 1 || Math.abs(e.y - s.player.y) > 1);
                        if (farEnemies.length > 0) { if (hpRate < 0.5 && adjacentEnemies.length >= 1) score = 95; else if (adjacentEnemies.length >= 2) score = 85; else score = -1; } 
                        else score = -1; 
                    } else {
                        if (effect.hp > 0 && s.player.hp < s.player.maxHp) { if (hpRate < 0.3) score = 95; else if (hpRate < 0.6) score = 40; else score = 10; }
                        if (effect.hunger > 0 && s.player.hunger < maxH) { if (s.player.hunger < 20) score = Math.max(score, 90); else if (s.player.hunger < 40) score = Math.max(score, 30); else score = Math.max(score, 10); }
                        let isHpFull = s.player.hp >= s.player.maxHp; let isHungerFull = s.player.hunger >= maxH;
                        // ★ 種系特性：大地の恵み（薬草で最大HPが上がる確率があるため、HP満タンでも食べる）
                        let isHerbScoreFull = isHpFull;
                        if (activeTraits.includes('大地の恵み') && Math.random() < 0.5) isHerbScoreFull = false;

                        if (baseItemKey === 'herb' && isHerbScoreFull) { if (iqRank >= 2 && adjacentEnemies.length === 0) score = 25; else score = -1; }
                        else if (baseItemKey === 'item_bread' && isHungerFull) { score = (iqRank >= 2 && adjacentEnemies.length === 0) ? 25 : -1; }
                        else if (isHpFull && isHungerFull && effect.traits.length === 0) score = -1; 
                    }
                }
                if (isGarakuta && hpRate < 0.3) score = Math.max(score, 90);
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

            let isHpFull = s.player.hp >= s.player.maxHp; let shouldEquipAcc = false;
            if (!s.player.equipAccessory) {
                let accs = s.player.tempInventory.filter(i => window.getDungeonItemEffect(i).equipType === 'accessory');
                if (accs.length > 0 && (accs.some(i => !window.getDungeonItemEffect(i).traits.includes('regen_hp')) || !isHpFull)) shouldEquipAcc = true; 
            }

            let synthInfo = null;
            if (validCmdIds.includes('synthesize') && adjacentEnemies.length === 0 && iqRank >= 1) {
                const trySynth = (equipSlot, eType) => {
                    if (!s.player[equipSlot]) return null;
                    let parsedBase = window.parseItemString(s.player[equipSlot]); let bData = window.getDungeonItemEffect(s.player[equipSlot]);
                    for (let i = 0; i < s.player.tempInventory.length; i++) {
                        let parsedMat = window.parseItemString(s.player.tempInventory[i]); let matEff = window.getDungeonItemEffect(s.player.tempInventory[i]);
                        if (matEff && matEff.traits && matEff.traits.includes('curse')) continue;
                        if ((s.sessionItemDict && s.sessionItemDict[parsedMat.baseId] && !s.aiMemory.identified.includes(parsedMat.baseId)) && !activeTraits.includes('全知')) continue; 
                        if (matEff.equipType === eType) return { type: eType, matIdx: i, isSame: true }; 
                        if (iqRank >= 2) {
                            let seal = window.getSealFromItem(parsedMat.baseId, eType);
                            if (seal && !parsedBase.seals.includes(seal) && parsedBase.seals.length < bData.maxSeals) return { type: eType, matIdx: i, isSame: false, seal: seal };
                        }
                    } return null;
                };
                synthInfo = trySynth('equipWeapon', 'weapon') || trySynth('equipShield', 'shield') || trySynth('equipArmor', 'armor') || trySynth('equipAccessory', 'accessory');
            }

            let targetPos = null; let isOnStairs = s.grid[s.player.y][s.player.x] === 2;
            let hasFood = s.player.hunger > 30; let windDanger = s.floorTurn >= 850;
            let targetLevel = s.floor <= 5 ? (s.floor * 2 + 1) : (s.floor + 5);
            let hasUnexplored = false;
            for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (!s.visited[ry][rx] && s.grid[ry][rx] !== 1) { hasUnexplored = true; break; } } if (hasUnexplored) break; }
            
            let wantsToDescend = true; let wantsToGrind = false; let isHpPinch = s.player.hp < s.player.maxHp * 0.5; 

            if (iqRank >= 1 && hasFood && !windDanger) {
                if (s.mapType === 'crystal') {
                    if (iqRank >= 2 && s.player.level < targetLevel) wantsToGrind = true; 
                    if (iqRank >= 3 && s.floorTurn < 850) wantsToGrind = true; 
                }
                
                // ★修正：修練(レベル上げ)よりも「未踏破エリアの探索」を絶対に優先させる！
                if (hasUnexplored) { 
                    wantsToDescend = false; 
                    wantsToGrind = false; // 探索が終わるまでは修練モードを一時オフにする
                    thoughtLog = "未踏破エリアの探索を優先しよう。"; 
                } 
                else if (wantsToGrind) { 
                    wantsToDescend = false; 
                    thoughtLog = `探索完了。目標Lv${targetLevel}まで修練する！`; 
                } 
                else { 
                    thoughtLog = "この階層での目的は果たした。階段を探そう。"; 
                }
            } else if (!hasFood) { wantsToDescend = true; wantsToGrind = false; thoughtLog = "空腹だ... 探索を切り上げて先へ進もう。"; }
            else if (windDanger) { wantsToDescend = true; wantsToGrind = false; thoughtLog = "風が強くなってきた！ 急いで階段を降りなければ！"; }
            
            s.player._isGrinding = wantsToGrind; 

            if (isOnStairs) {
                if (wantsToDescend) { chosenCommand = 'descend_stairs'; } 
                else if (adjacentEnemies.length === 0 && visibleEnemies.length === 0) {
                    if (hasUnexplored && isHpPinch) { chosenCommand = 'skip'; thoughtLog = "探索を続けるため、階段で傷を癒やしている。"; } 
                    else if (wantsToGrind && !isHpFull) { chosenCommand = 'skip'; thoughtLog = "修練に備え、階段の上で体力を回復している。"; }
                }
            }

            if (!chosenCommand) {
                if (validCmdIds.includes('put_down')) {
                    let seedIdx = s.player.tempInventory.findIndex(i => i === 'item_seed_mystery');
                    if (seedIdx !== -1 && s.grid[s.player.y][s.player.x] === 7 && !s.items.some(i => i.x === s.player.x && i.y === s.player.y)) {
                        chosenCommand = 'put_down'; s.player._targetItemIdx = seedIdx; thoughtLog = "土の床だ。種を植えて育ててみよう。";
                    }
                }
                if (!chosenCommand && validCmdIds.includes('throw') && enemyInSight) {
                    let targetInLine = visibleEnemies.find(e => e.x === s.player.x || e.y === s.player.y);
                    if (targetInLine) {
                        let throwIdx = s.player.tempInventory.findIndex(i => {
                            if (!i) return false; if (i === 'item_scroll_wet') return true;
                            let parsedId = window.parseItemString(i).baseId; return s.sessionItemDict && s.sessionItemDict[parsedId] && (!s.aiMemory || !s.aiMemory.identified || !s.aiMemory.identified.includes(parsedId));
                        });
                        if (throwIdx !== -1) { chosenCommand = 'throw'; s.player._targetItemIdx = throwIdx; thoughtLog = "直線の敵に向かって、謎のアイテムを投げて効果を試そう！"; }
                    }
                }

                if (!chosenCommand) {
                    if (bestItemScore >= 80 && validCmdIds.includes(bestItemCmd)) { chosenCommand = bestItemCmd; thoughtLog = s.player._bestItemThought; }
                    else if (s.player.equipAccessory && window.getDungeonItemEffect(s.player.equipAccessory).traits.includes('regen_hp') && isHpFull && validCmdIds.includes('unequip') && iqRank >= 1 && !allTraits.includes('regen')) {
                        if (!window.getDungeonItemEffect(s.player.equipAccessory).traits.includes('curse')) { chosenCommand = 'unequip'; s.player._unequipTarget = 'equipAccessory'; thoughtLog = "HPが満タンなので回復の指輪を外す。"; }
                    }
                    else if (synthInfo) { chosenCommand = 'synthesize'; s.player._synthInfo = synthInfo; thoughtLog = "手持ちの装備を合成して強化しよう！"; }
                    else if (tacticalMove) { chosenCommand = tacticalMove; thoughtLog = "多勢に無勢だ、通路へ退いて各個撃破を狙う！"; } 
                    else if (tacticalWait && validCmdIds.includes('attack')) { chosenCommand = 'attack'; thoughtLog = "通路に陣取り、敵が来るのを待ち構えている！"; }
                    else if (bestItemScore >= 25 && validCmdIds.includes(bestItemCmd)) { chosenCommand = bestItemCmd; thoughtLog = s.player._bestItemThought; }
                    else if ((!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                             (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                             (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) || shouldEquipAcc) {
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
                    } else {
                        let nextStep = null;
                        if (iqRank >= 1 && s.player.tempInventory.length < 20 && s.items) {
                            // ==========================================
                            // 🗑️ 最強のゴミ掃除パッチ：床のバグアイテムを視界から消し去る
                            // ==========================================
                            // ★修正：filterの中でspliceを使うと「インデックスのズレによる判定漏れ」が起きるため、
                            // まず s.items 自体を安全なフィルターで上書きし、マップからバグと罠を完全に消去します！
                            s.items = s.items.filter(i => i && typeof i.key === 'string' && !(['poison', 'mine', 'blind', 'bear_trap', 'stone'].includes(i.type)));

                            // その上で、視界に入っていて拾える正常なアイテムだけを抽出
                            let visibleItems = s.items.filter(i => {
                                return window.isTileVisible(s, i.x, i.y) && s.grid[i.y][i.x] !== 5 && (!s.player._unreachableItems || !s.player._unreachableItems.includes(`${i.x},${i.y}`));
                            });
                            
                            if (visibleItems.length > 0) {
                                let currentTargetStillValid = s.player._itemTargetPos && visibleItems.some(i => i.x === s.player._itemTargetPos.x && i.y === s.player._itemTargetPos.y);
                                if (currentTargetStillValid) { targetPos = s.player._itemTargetPos; } 
                                else {
                                    let nearestItem = visibleItems.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                    targetPos = { x: nearestItem.x, y: nearestItem.y }; s.player._itemTargetPos = targetPos;
                                }

                                if (activeTraits.includes('念動力') && (targetPos.x !== s.player.x || targetPos.y !== s.player.y)) {
                                    let targetIdx = s.items.findIndex(i => i.x === targetPos.x && i.y === targetPos.y);
                                    if (targetIdx !== -1) {
                                        s.items[targetIdx].x = s.player.x; s.items[targetIdx].y = s.player.y;
                                        window.addDungeonLog(`🌀 念動力！ 遠くのアイテムを手元へ引き寄せた！`, '#E040FB');
                                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'warp');
                                        s.player._itemTargetPos = null; chosenCommand = 'skip'; thoughtLog = "念動力でアイテムを手に入れた！";
                                    }
                                } else {
                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                    if (nextStep) { thoughtLog = currentTargetStillValid ? "あそこのアイテムを目指して進もう。" : "あそこにアイテムが落ちている！拾いに行こう。"; } 
                                    else {
                                        if (!s.player._unreachableItems) s.player._unreachableItems = [];
                                        s.player._unreachableItems.push(`${targetPos.x},${targetPos.y}`);
                                        s.player._itemTargetPos = null;
                                    }
                                }
                            } else { s.player._itemTargetPos = null; }
                        } else { s.player._itemTargetPos = null; }
                        if (!nextStep && chosenCommand !== 'skip') {
                            if (wantsToDescend) {
                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] === 2 && s.visited[y][x]);
                                if (!nextStep && hasUnexplored) nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                            } else if (hasUnexplored) {
                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                            } else if (wantsToGrind && isHpPinch) {
                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] === 2 && s.visited[y][x]); 
                                thoughtLog = "傷ついた。安全な階段へ退避しよう。";
                            } else if (wantsToGrind && !isHpPinch) {
                                let knownEnemies = s.enemies.filter(e => e.hp > 0 && s.visited[e.y] && s.visited[e.y][e.x]);
                                let knownEnemy = null;
                                if (s.player._patrolTargetId) knownEnemy = knownEnemies.find(e => e.id === s.player._patrolTargetId);
                                if (!knownEnemy && knownEnemies.length > 0) knownEnemy = knownEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                
                                if (knownEnemy) {
                                    s.player._patrolTargetId = knownEnemy.id; s.player._patrolTarget = null; 
                                    targetPos = { x: knownEnemy.x, y: knownEnemy.y }; thoughtLog = `レーダーに敵影(${knownEnemy.name})を捕捉！ 狩りに向かう！`;
                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                } 
                                if (!nextStep) {
                                    s.player._patrolTargetId = null; 
                                    if (!s.player._patrolTarget || (s.player.x === s.player._patrolTarget.x && s.player.y === s.player._patrolTarget.y)) {
                                        let tgtRoom = s.roomsInfo[Math.floor(Math.random() * s.roomsInfo.length)];
                                        s.player._patrolTarget = { x: tgtRoom.x + Math.floor(Math.random() * tgtRoom.w), y: tgtRoom.y + Math.floor(Math.random() * tgtRoom.h) };
                                    }
                                    targetPos = s.player._patrolTarget; thoughtLog = "フロアを巡回中...";
                                    nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                }
                            }
                            if (!nextStep && s.player.hp > s.player.maxHp * 0.4 && enemyInSight) {
                                if (enemyInSight.type === 'beetle' && iqRank >= 1) thoughtLog = "カブトムシとの正面衝突は避けた方がいいな。";
                                else nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === enemyInSight.x && y === enemyInSight.y);
                            }
                            if (!nextStep) nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                        } // ★ 修正：ここでifを一度閉じる！

                        // ★ 修正：アイテム追跡時(nextStep取得済)も確実に移動コマンドに変換されるように独立させる
                        if (nextStep && !chosenCommand) {
                            if (nextStep.x < s.player.x) chosenCommand = 'move_left'; 
                            else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                            else if (nextStep.y < s.player.y) chosenCommand = 'move_up'; 
                            else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                        } else if (!nextStep && !chosenCommand && chosenCommand !== 'skip') {
                            thoughtLog = "どうしていいか分からずオロオロしている..."; chosenCommand = 'skip';
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
                            if (s.player[slot] && !window.getDungeonItemEffect(s.player[slot]).traits.includes('curse')) canUnequip = true;
                        });
                        return canUnequip;
                    }
                    if (cmd === 'attack') return enemyAdjacent != null;
                    if (['move_up', 'move_down', 'move_left', 'move_right'].includes(cmd)) {
                        let nx = s.player.x + (cmd === 'move_right' ? 1 : cmd === 'move_left' ? -1 : 0); let ny = s.player.y + (cmd === 'move_down' ? 1 : cmd === 'move_up' ? -1 : 0);
                        if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                            if (s.grid[ny][nx] === 1) { if (!activeTraits.includes('幽体') || nx === 0 || nx === s.mapWidth - 1 || ny === 0 || ny === s.mapHeight - 1) return false; }
                            if (!isFlying && (s.grid[ny][nx] === 4 || s.grid[ny][nx] === 10)) return false; 
                            if (s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny)) return false;
                            return true;
                        }
                        return false;
                    }
                    return true;
                });
                if (smartValidCmds.length > 0) chosenCommand = smartValidCmds[Math.floor(Math.random() * smartValidCmds.length)];
                else { window.addDungeonLog(`${aiName} はどうしていいか分からずオロオロしている...`, '#888'); chosenCommand = 'skip'; }
            }
        }
    }

    if (typeof chosenCommand === 'object' && chosenCommand !== null) chosenCommand = chosenCommand.id;
    s.player._lastCommand = chosenCommand; 

    if (activeTraits.includes('夢の鼓動') && Math.random() < 0.005) {
        let normalItems = s.player.tempInventory.filter(i => !i.includes('happy') && !i.includes('bless') && !i.includes('weapon') && !i.includes('shield') && !i.includes('armor'));
        if (normalItems.length > 0) {
             let target = normalItems[Math.floor(Math.random() * normalItems.length)];
             s.player.tempInventory[s.player.tempInventory.indexOf(target)] = 'item_seed_happy';
             window.addDungeonLog(`🌟 夢の鼓動！ カバンの中のアイテムが「しあわせの種」に変化した！`, '#FFD700');
        }
    }

    let isParalyzed = s.player.status && s.player.status.paralyzed > 0;
    let isPetrified = s.player.status && s.player.status.petrified > 0;
    let isFear = s.player.status && s.player.status.fear > 0;
    let isFrozen = s.player.status && s.player.status.frozen > 0;

    if ((isParalyzed || isPetrified || isFear || isFrozen) && ['move_up', 'move_down', 'move_left', 'move_right', 'flee', 'attack', 'throw', 'put_down'].includes(chosenCommand)) {
        if (isPetrified) window.addDungeonLog(`🗿 体が石化して動けない！`, '#757575');
        else if (isFrozen) window.addDungeonLog(`❄️ 体が凍りついて動けない！`, '#00BCD4');
        else if (isFear) window.addDungeonLog(`😱 恐怖で足がすくんで動けない！`, '#9C27B0');
        else window.addDungeonLog(`⚡ 足が痺れて動けない！`, '#FF9800');
        chosenCommand = 'skip';
    }

    // ★ AI調整：名付け（name_item）による無駄なターンスキップを阻止し、ノーターンで自動名付けする！
    if (chosenCommand !== 'skip' && chosenCommand !== 'descend_stairs') {
        const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === chosenCommand); 
        if (cmdInfo && !isConfused) {
            let thoughtStr = thoughtLog ? ` (💭${thoughtLog})` : "";
            window.addDungeonLog(`${aiName} は「${cmdInfo.name}」と考えた！${thoughtStr}`, '#B0BEC5'); 
        } else if (!isConfused) { 
            chosenCommand = 'attack'; window.addDungeonLog(`⚠️ ${aiName} は未知の行動に混乱し、とっさに身構えた！`, '#ff5252'); 
        }
    } else if (chosenCommand === 'descend_stairs') { window.addDungeonLog(`💭 階段を降りる決断をした。（${thoughtLog}）`, '#B0BEC5'); } 
    else if (chosenCommand === 'skip') {
        if (thoughtLog && !isConfused) window.addDungeonLog(`💭 立ち止まって様子を見ている。（${thoughtLog}）`, '#B0BEC5');
        // ★ 種系特性：根張り（移動せずに待機するとHPが回復）
        if (activeTraits.includes('根張り') && s.player.hp < s.player.maxHp) {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
            window.addDungeonLog(`🌱 根張り！ 地中から養分を吸収し、HPが回復した！`, '#4CAF50');
        }
    }

    if (['face_up', 'face_down', 'face_left', 'face_right'].includes(chosenCommand)) {
        if (chosenCommand === 'face_up') s.player.face = 'up'; else if (chosenCommand === 'face_down') s.player.face = 'down'; else if (chosenCommand === 'face_left') s.player.face = 'left'; else if (chosenCommand === 'face_right') s.player.face = 'right';
        window.addDungeonLog(`👀 ${aiName} は向きを変えて狙いを定めた！`, '#aaa'); window.updateDungeonUI();
        return 'continue_no_turn_consume'; 
    }

    if (chosenCommand === 'descend_stairs') {
        window.addDungeonLog(`階段を降りて次のフロアへ進む！`, '#00BCD4');
        
        // ★ 種系特性：侘び寂び（アイテムを一切持たずに階を降りるとステータス上昇）
        if (activeTraits.includes('侘び寂び') && (!s.player.tempInventory || s.player.tempInventory.length === 0)) {
            s.player.basePwr += 3;
            if (window.DUNGEON_STATE.player.intel) window.DUNGEON_STATE.player.intel += 3;
            if (window.DUNGEON_STATE.player.speed) window.DUNGEON_STATE.player.speed += 3;
            window.addDungeonLog(`🍵 侘び寂び！ 持たざる美学により、心身が研ぎ澄まされた！`, '#4CAF50');
        }

        // ★追加：神鳥の舞（フロア移動時全回復）
        if (activeTraits && activeTraits.includes('神鳥の舞')) { s.player.hp = s.player.maxHp; window.addDungeonLog(`✨ 神鳥の舞が発動！ 体力が完全に回復した！`, '#4CAF50'); }
        if (activeTraits && activeTraits.includes('変幻自在')) {
            let r = Math.random();
            if (r < 0.33) { s.player._magicFlight = true; window.addDungeonLog(`✨ 変幻自在！ 次のフロアの開幕行動回数がアップ！`, '#E040FB'); }
            else if (r < 0.66) { s.player.atkBuff = (s.player.atkBuff || 0) + 10; window.addDungeonLog(`✨ 変幻自在！ 攻撃力がアップ！`, '#FFD700'); }
            else { s.player.hp = s.player.maxHp; window.addDungeonLog(`✨ 変幻自在！ 体力が全回復！`, '#4CAF50'); }
        }
        if (activeTraits && activeTraits.includes('管理者権限')) {
            let items = Object.keys(window.itemCatalog).filter(k => k.startsWith('item_'));
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
        s.player.status = { poison: 0, paralyzed: 0, blind: 0, confusion: 0, wet: 0, sleep: 0, petrified: 0, fear: 0, burn: 0, frozen: 0, miss_next: false, death_count: 0, forget_plus: false };
        s.player.atkBuff = 0; s.player._itemTargetPos = null; s.player._unreachableItems = []; 
        window.generateDungeonFloor(); window.updateDungeonUI();
        
        await sleep(300); fade.style.opacity = 0; await sleep(600); 
        return 'descend'; 
    }

    let newX = s.player.x; let newY = s.player.y;
    if (chosenCommand === 'move_up') { newY--; s.player.face = 'up'; }
    else if (chosenCommand === 'move_down') { newY++; s.player.face = 'down'; }
    else if (chosenCommand === 'move_left') { newX--; s.player.face = 'left'; } 
    else if (chosenCommand === 'move_right'){ newX++; s.player.face = 'right'; }
    else if (chosenCommand === 'identify') {
        let idx = s.player._identifyTargetIdx;
        if (idx !== undefined && s.player.tempInventory[idx]) {
            let itemId = s.player.tempInventory[idx]; let bId = window.parseItemString(itemId).baseId;
            if (!s.aiMemory.identified.includes(bId)) {
                s.aiMemory.identified.push(bId);
                window.addDungeonLog(`🔍 ${aiName} は「しらべる」を使って ${window.getDungeonItemEffect(itemId).realName} だと見抜いた！`, '#FFD700');
            }
        } s.player._identifyTargetIdx = null;
    }
    else if (chosenCommand === 'flee') {
        if (enemyInSight) {
            const canFlee = (tx, ty) => s.grid[ty][tx] !== 1 && (isFlying || (s.grid[ty][tx] !== 4 && s.grid[ty][tx] !== 10)) && (!s.traps || !s.traps.some(t => t.visible && t.x === tx && t.y === ty)); 
            if (s.player.x < enemyInSight.x && canFlee(s.player.x - 1, s.player.y)) { newX--; s.player.face = 'left'; }
            else if (s.player.x > enemyInSight.x && canFlee(s.player.x + 1, s.player.y)) { newX++; s.player.face = 'right'; }
            else if (s.player.y < enemyInSight.y && canFlee(s.player.x, s.player.y - 1)) { newY--; s.player.face = 'up'; }
            else if (s.player.y > enemyInSight.y && canFlee(s.player.x, s.player.y + 1)) { newY++; s.player.face = 'down'; }
            if(!isConfused) window.addDungeonLog(`敵から遠ざかるように走った！`, '#00BCD4');
        } else { if(!isConfused) window.addDungeonLog(`キョロキョロしている。（敵がいない）`, '#aaa'); }
    }

    if (newX !== s.player.x || newY !== s.player.y) {
        if (newX >= 0 && newX < s.mapWidth && newY >= 0 && newY < s.mapHeight) {
            if (s.grid[newY][newX] === 1) {
                if (activeTraits.includes('星の化身') && newX > 0 && newX < s.mapWidth-1 && newY > 0 && newY < s.mapHeight-1) {
                    window.addDungeonLog(`✨ 星の化身！ 壁をすり抜けて移動した！`, '#00BCD4');
                } else if ((activeTraits.includes('重機動アーム') || activeTraits.includes('星の砕き手')) && newX > 0 && newX < s.mapWidth-1 && newY > 0 && newY < s.mapHeight-1) {
                    if (activeTraits.includes('星の砕き手')) {
                        window.addDungeonLog(`☄️ 星の砕き手で壁を粉砕した！`, '#FFD700');
                        if (Math.random() < 0.05) { s.items.push({ x: newX, y: newY, key: 'item_seed_happy' }); window.addDungeonLog(`🌟 砕いた壁の中から「しあわせの種」が出てきた！`, '#FFD700'); }
                    } else { window.addDungeonLog(`💥 重機動アームで壁を粉砕した！`, '#FFD700'); }
                    s.grid[newY][newX] = 0; 
                } else if (activeTraits.includes('幽体') && newX > 0 && newX < s.mapWidth-1 && newY > 0 && newY < s.mapHeight-1) {
                    window.addDungeonLog(`👻 幽体化して壁をすり抜けた！`, '#9C27B0');
                } else {
                    window.addDungeonLog(`ガンッ！ 壁にぶつかった！`, '#aaa'); return 'continue';
                }
            } else if (!isFlying && (s.grid[newY][newX] === 4 || s.grid[newY][newX] === 10)) {
                window.addDungeonLog(`ガンッ！ 水脈や溝にぶつかった！`, '#aaa'); return 'continue';
            }

            let hitEnemy = s.enemies.find(e => e.x === newX && e.y === newY && e.hp > 0);
            if (hitEnemy) {
                if (activeTraits.includes('角突き') && !s.player._hornThrustUsed) {
                    window.addDungeonLog(`🪲 角突き！ 突進の勢いで ${hitEnemy.name} を撥ね飛ばした！`, '#FFD700');
                    s.player.attackAnim = true; window.dealDungeonDamage(s.player, hitEnemy);
                    let dx = Math.sign(hitEnemy.x - s.player.x); let dy = Math.sign(hitEnemy.y - s.player.y);
                    if (dx === 0 && dy === 0) dx = 1; let nx = hitEnemy.x + dx; let ny = hitEnemy.y + dy;
                    if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(e => e.hp > 0 && e !== hitEnemy && e.x === nx && e.y === ny)) { hitEnemy.x = nx; hitEnemy.y = ny; hitEnemy.warpAnim = true; }
                    s.player._hornThrustUsed = true; await sleep(100); return 'continue_no_turn_consume';
                } else { window.addDungeonLog(`ゴツン！ 敵にぶつかった！`, '#FF9800'); s.player.attackAnim = true; }
            } else {
                s.player.lastX = s.player.x; s.player.lastY = s.player.y;
                s.player.x = Math.round(newX); s.player.y = Math.round(newY);

                if (activeTraits.includes('天の祝福') && Math.random() < 0.05) {
                    if (!s.items.some(i => i.x === s.player.lastX && i.y === s.player.lastY) && s.grid[s.player.lastY][s.player.lastX] !== 4 && s.grid[s.player.lastY][s.player.lastX] !== 10) {
                        s.items.push({ x: s.player.lastX, y: s.player.lastY, key: 'herb' }); window.addDungeonLog(`✨ 足跡から薬草が芽吹いた！`, '#4CAF50');
                    }
                }
                
                if (s.grid[s.player.y][s.player.x] === 8 && !isFlying && !activeTraits.includes('耐冷構造') && !activeTraits.includes('星の化身')) { // ★星の化身
                    window.addDungeonLog(`🧊 ツルッ！ 氷の床を滑っていく！`, '#00BCD4');
                    let slipDx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0; let slipDy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
                    if (slipDx !== 0 || slipDy !== 0) {
                        while (true) {
                            let nx = s.player.x + slipDx; let ny = s.player.y + slipDy;
                            if (nx < 0 || nx >= s.mapWidth || ny < 0 || ny >= s.mapHeight) break;
                            if (s.grid[ny][nx] === 1) { window.addDungeonLog(`💥 ガンッ！ 壁に激突した！(5ダメージ)`, '#aaa'); s.player.damageAnim = true; s.player.hp -= 5; if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 5, true); break; }
                            let eHit = s.enemies.find(e => e.hp > 0 && e.x === nx && e.y === ny);
                            if (eHit) { window.addDungeonLog(`💥 ゴツン！ ${eHit.name} に激突した！`, '#FF9800'); eHit.damageAnim = true; eHit.hp -= 10; s.player.damageAnim = true; s.player.hp -= 5; if (typeof window.showDungeonDamageEffect === 'function') { window.showDungeonDamageEffect(eHit.x, eHit.y, 10, false); window.showDungeonDamageEffect(s.player.x, s.player.y, 5, true); } break; }
                            s.player.x = nx; s.player.y = ny;
                            if (s.grid[ny][nx] !== 8) break; 
                        }
                    }
                }

                if (s.grid[s.player.y][s.player.x] === 9 && !activeTraits.includes('耐冷構造')) {
                    if (!s.player.status.wet) window.addDungeonLog(`💦 浅瀬に入り、服が水浸しになった！`, '#00BCD4');
                    s.player.status.wet = 15; 
                }

                if (activeTraits.includes('癒やしの舞') && s.player.hp < s.player.maxHp) {
                    let currentRoom = s.roomsInfo.find(r => newX >= r.x && newX < r.x + r.w && newY >= r.y && newY < r.y + r.h);
                    if (currentRoom && !s.enemies.some(e => e.hp > 0 && e.x >= currentRoom.x && e.x < currentRoom.x + currentRoom.w && e.y >= currentRoom.y && e.y < currentRoom.y + currentRoom.h)) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5);
                }

                if (s.grid[s.player.y][s.player.x] === 5 && !activeTraits.includes('星の化身')) { // ★星の化身は無効
                    window.addDungeonLog(`🔥 マグマを踏んで火傷した！(HP-10)`, '#FF5252'); s.player.hp -= 10; s.player.damageAnim = true;
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "10", true);
                }

                if (s.items) {
                    let itemIdx = s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y);
                    if (itemIdx !== -1) {
                        let itm = s.items[itemIdx]; let eff = window.getDungeonItemEffect(itm.key); 
                        if (s.player.tempInventory.length < 20) { 
                            s.player.tempInventory.push(itm.key); window.addDungeonLog(`足元から ${eff.name} を拾った！`, '#4CAF50'); s.items.splice(itemIdx, 1);
                            
                            // ★ 拾った瞬間に自動で名付けを行うパッチ（無駄なターン消費をゼロにする）
                            let pId = window.parseItemString(itm.key).baseId;
                            if (validCmdIds.includes('name_item') && s.sessionItemDict && s.sessionItemDict[pId] && !s.aiMemory.identified.includes(pId)) {
                                if (!s.aiMemory.tempNames[pId]) {
                                    let tName = "謎のアイテム";
                                    if (eff.hp > 0) tName = "回復の草"; else if (eff.hunger > 0) tName = "腹ごなしの草";
                                    else if (eff.traits.includes('level_up')) tName = "しあわせの草"; else if (eff.traits.includes('sleep_aoe')) tName = "睡眠の巻物";
                                    else if (eff.traits.includes('confuse_aoe')) tName = "混乱の巻物"; else if (eff.traits.includes('fire_damage')) tName = "火の杖";
                                    else if (eff.traits.includes('swap_pos')) tName = "入れ替わりの杖"; else if (eff.traits.includes('blow_back')) tName = "吹き飛ばしの杖";
                                    else if (eff.traits.includes('warp_self')) tName = "ワープのアイテム";
                                    s.aiMemory.tempNames[pId] = tName;
                                    window.addDungeonLog(`💡 AIはこれを【${tName}？】と名付けた！`, '#FFD700');
                                }
                            }
                        } else window.addDungeonLog(`カバンがいっぱいで ${eff.name} を拾えない！`, '#FF9800'); 
                    }
                }

                if (s.traps && !activeTraits.includes('妖精の羽') && !activeTraits.includes('反重力')) {
                    let trap = s.traps.find(t => t.x === s.player.x && t.y === s.player.y);
                    let oldStatus = JSON.parse(JSON.stringify(s.player.status || {})); 
                    
                    if (trap && activeTraits.includes('大地の鼓動')) { window.addDungeonLog(`🦶 大地の鼓動！ 踏み込んだ衝撃で罠を完全に粉砕した！`, '#FFD700'); s.traps = s.traps.filter(t => t !== trap); }
                    else if (trap && activeTraits.includes('大地の恵み')) { window.addDungeonLog(`大地の恵みにより、罠が作動しなかった！`, '#4CAF50'); trap.visible = true; }
                    else if (trap && !s.player.status.paralyzed) { 
                        if (!trap.visible) window.addDungeonLog(`カシャッ！ 何か罠を踏んだ！`, '#ff5252');
                        trap.visible = true;
                        if (trap.type === 'poison') {
                            if (s.player.skin && s.player.skin.includes('spirit_type1')) {
                                window.addDungeonLog(`🍄 毒矢が刺さったが、毒素体質により逆に体力が回復した！`, '#4CAF50');
                                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 10); if (typeof window.showDungeonHealEffect === 'function') window.showDungeonHealEffect(s.player.x, s.player.y, 10);
                            } else { window.addDungeonLog(`☠️ 毒矢の罠！ 毒状態になった！`, '#FF5252'); s.player.damageAnim = true; s.player.hp -= 5; s.player.status.poison = 10; }
                            window.updateDungeonUI();
                        } 
                        else if (trap.type === 'mine') { 
                            let dmg = Math.floor(s.player.hp / 2);
                            if (activeTraits.includes('不朽の硬度')) { dmg = Math.floor(dmg / 2); window.addDungeonLog(`💣 地雷が大爆発！しかし 不朽の硬度 でダメージを抑えた！`, '#00BCD4'); } 
                            else { window.addDungeonLog(`💣 地雷が大爆発！(HPが半分になった！)`, '#FF5252'); }
                            s.player.hp -= dmg; s.player.damageAnim = true; if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "BOOM", true);
                        }
                        else if (trap.type === 'blind') { window.addDungeonLog(`泥水を被り、視界が奪われた！`, '#9C27B0'); s.player.status.blind += 15; }
                        else if (trap.type === 'bear_trap') { window.addDungeonLog(`トラバサミに引っかかり、足が痺れた！`, '#FF9800'); s.player.status.paralyzed += 3; s.player.hp -= 10; s.player.damageAnim = true; }
                        else if (trap.type === 'stone') {
                            window.addDungeonLog(`ツルッ！ 石ころにつまずいて転んだ！`, '#FF9800'); s.player.damageAnim = true; s.player.hp -= 2; window.updateDungeonUI();
                            if (s.player.tempInventory.length > 0) {
                                // ★修正：可能な限り複数個（1～3個）を散らばらせて落とす！
                                let dropCount = 1 + Math.floor(Math.random() * 3);
                                dropCount = Math.min(dropCount, s.player.tempInventory.length);
                                for (let c = 0; c < dropCount; c++) {
                                    let dropIdx = Math.floor(Math.random() * s.player.tempInventory.length); 
                                    let dropKey = s.player.tempInventory[dropIdx]; 
                                    s.player.tempInventory.splice(dropIdx, 1);
                                    s.player.lostItems = s.player.lostItems || []; s.player.lostItems.push(dropKey); // ★化石の記憶用のロスト記録
                                    window.scatterItem(s, s.player.x, s.player.y, dropKey);
                                    window.addDungeonLog(`カバンから ${window.getDungeonItemEffect(dropKey).name} が転がり落ちた！`, '#FF5252');
                                }
                            }
                        }

                        let gainedPoison = s.player.status.poison > (oldStatus.poison || 0);
                        let gainedBlind = s.player.status.blind > (oldStatus.blind || 0);
                        let gainedParalyze = s.player.status.paralyzed > (oldStatus.paralyzed || 0);
                        
                        if (activeTraits.includes('毒ガスタンク') && gainedPoison) { s.player.atkBuff = (s.player.atkBuff || 0) + 5; window.addDungeonLog(`🎈 毒ガスタンク起動！ 毒を力に変えて攻撃力が上がった！`, '#FFD700'); }
                        if (activeTraits.includes('美しき反射') && (gainedPoison || gainedBlind || gainedParalyze)) {
                            let adj = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                            if (adj.length > 0) {
                                adj.forEach(e => { if (gainedPoison) e.status.poison = (e.status.poison || 0) + 5; if (gainedBlind) e.status.confusion = (e.status.confusion || 0) + 5; if (gainedParalyze) e.status.sleep = (e.status.sleep || 0) + 3; });
                                window.addDungeonLog(`🪞 美しき反射！ 罠で受けた状態異常を周囲の敵にばら撒いた！`, '#E040FB');
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
            } // ← ① hitEnemyの else を閉じる
        } else { window.addDungeonLog(`ガンッ！ 壁や水脈にぶつかった！`, '#aaa'); return 'continue'; } // ← ② マップ範囲内判定を閉じて else に繋ぐ
    } // ← ③ 移動判定全体を閉じる
    else if (chosenCommand === 'attack') {
        if (enemyAdjacent && !isConfused) {
            if (enemyAdjacent.x < s.player.x) s.player.face = 'left'; else if (enemyAdjacent.x > s.player.x) s.player.face = 'right';
            else if (enemyAdjacent.y < s.player.y) s.player.face = 'up'; else if (enemyAdjacent.y > s.player.y) s.player.face = 'down';
            s.player.attackAnim = true; 
            if (enemyAdjacent.status && enemyAdjacent.status.sleep > 0) enemyAdjacent.status.sleep = 0;
            window.dealDungeonDamage(s.player, enemyAdjacent);
            let atkWait = enemyAdjacent.warpAnim ? 400 : 150; window.updateDungeonUI(); await sleep(atkWait);
            let wEff = s.player.equipWeapon ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
            if (wEff && wEff.traits.includes('double') && enemyAdjacent.hp > 0) { 
                window.addDungeonLog(`⚔️ 連撃の剣が発動！怒涛の連続攻撃！`, '#FFD700'); s.player.attackAnim = true; 
                window.dealDungeonDamage(s.player, enemyAdjacent); window.updateDungeonUI(); await sleep(150);
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
                    if (hitE.status && hitE.status.sleep > 0) hitE.status.sleep = 0; window.dealDungeonDamage(s.player, hitE); 
                } else { window.addDungeonLog(`明後日の方向を殴っている！`, '#aaa'); }
            } else { window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
        }

        let tx = s.player.x; let ty = s.player.y;
        if (s.player.face === 'up') ty--; else if (s.player.face === 'down') ty++; else if (s.player.face === 'left') tx--; else if (s.player.face === 'right') tx++;
        if (s.traps) {
            let hiddenTrap = s.traps.find(t => t.x === tx && t.y === ty && !t.visible);
            if (hiddenTrap) { hiddenTrap.visible = true; window.addDungeonLog(`👀 目の前に隠された罠を発見した！`, '#FFD700'); }
        }
    } 
    else if (chosenCommand === 'heal' || chosenCommand === 'eat' || chosenCommand === 'use') {
        if (typeof s.player._bestItemIdx === 'number' && s.player._bestItemIdx !== -1 && s.player.tempInventory[s.player._bestItemIdx]) {
            let itemId = s.player.tempInventory[s.player._bestItemIdx]; 
            let effect = window.getDungeonItemEffect(itemId);
            let parsed = window.parseItemString(itemId); let baseId = parsed.baseId;
            let isUnidentified = s.sessionItemDict && s.sessionItemDict[baseId] && !s.aiMemory.identified.includes(baseId);
            let isMagicItem = effect.traits.length > 0 && !effect.traits.includes('level_up');
            let isOverTech = itemId.includes('wand') && activeTraits.includes('オーバーテクノロジー') && Math.random() < 0.25;

            if (chosenCommand === 'eat' || chosenCommand === 'heal') {
                if (!effect.isConsumable && activeTraits.includes('ガラクタ吸収')) {
                    window.addDungeonLog(`⚙️ ${aiName} は ${effect.name} をガリガリと噛み砕いて消化した！`, '#4CAF50');
                    s.player.hp = Math.min(s.player.maxHp, s.player.hp + 30); s.player.tempInventory.splice(s.player._bestItemIdx, 1); return 'continue';
                }
                if (isMagicItem && !isUnidentified) { window.addDungeonLog(`${aiName} は ${effect.name} を食べようとしたが、食べ物ではないことに気づいた！`, '#aaa'); s.player._bestItemIdx = -1; return 'continue'; }
                window.addDungeonLog(`${aiName} は ${effect.name} を食べた！`, '#4CAF50');
                let limitBreakMsg = ""; 
                // ★ 種系特性：大地の恵み（HP満タンでなくても確率で最大HPアップ）
                let isHerbBreak = (baseId === 'herb' && s.player.hp >= s.player.maxHp);
                if (baseId === 'herb' && activeTraits.includes('大地の恵み') && s.player.hp < s.player.maxHp && Math.random() < 0.5) isHerbBreak = true; 
                
                if (isHerbBreak) { s.player.maxHp += 1; limitBreakMsg += `最大HPが ${s.player.maxHp} に！ `; }
                if (baseId === 'item_bread' && s.player.hunger >= maxH) { s.player.maxHunger = maxH + 5; limitBreakMsg += `最大満腹度が ${s.player.maxHunger} に！`; }
                if (limitBreakMsg !== "") window.addDungeonLog(`💪 上限突破！ ${limitBreakMsg}`, '#FF9800');
                if (effect.hp > 0 || effect.hunger > 0) window.addDungeonLog(`HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                
                s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); s.player.hunger = Math.min(maxH, s.player.hunger + effect.hunger); 
            } 
            else if (chosenCommand === 'use') {
                if (!isMagicItem && !isUnidentified) { window.addDungeonLog(`${aiName} は ${effect.name} を使おうとしたが、使い方が分からなかった！`, '#aaa'); s.player._bestItemIdx = -1; return 'continue'; }
                if (itemId.includes('wand') && effect.charges <= 0) { window.addDungeonLog(`${aiName} は ${effect.name} を振ったが、魔力が残っていなかった！`, '#aaa'); window.updateDungeonUI(); return 'continue'; }

                window.addDungeonLog(`${aiName} は ${effect.name} を使った！`, '#00BCD4'); 
                if (activeTraits.includes('魔力飛行')) s.player._magicFlight = true;
                
                if (itemId.includes('wand')) {
                    if (isOverTech) { window.addDungeonLog(`✨ オーバーテクノロジー！ 杖の魔力を消費せずに放つ！`, '#FFD700'); } 
                    else { s.player.tempInventory[s.player._bestItemIdx] = `${parsed.baseId}_+${parsed.plus - 1}`; }
                } else { s.player.tempInventory.splice(s.player._bestItemIdx, 1); }
            }
            
            let effectTriggered = false;

            // 修正後→
            if (effect.traits.includes('level_up')) {
                let statMult = (s.mapType === 'skull' && activeTraits.includes('宇宙の樹')) ? 2 : 1;
                let pwrBonus = (s.mapType === 'skull' && activeTraits.includes('竜の血')) ? 12 : 8;

                if (s.mapType === 'crystal') {
                    s.player.level = (s.player.level || 1) + 1; 
                    s.player.maxHp += 20; 
                    s.player.hp = s.player.maxHp; 
                    s.player.hunger = maxH; 
                    s.player.basePwr += 8;
                    window.addDungeonLog(`✨ 奇跡が起きた！Lv.${s.player.level}にレベルアップし、全回復した！`, '#E040FB');
                } else {
                    // スカルダンジョン用のしあわせの種効果
                    s.player.maxHp += 20 * statMult; 
                    s.player.hp = s.player.maxHp; 
                    s.player.hunger = maxH; 
                    s.player.basePwr += pwrBonus * statMult;
                    
                    if (window.DUNGEON_STATE.player.intel) window.DUNGEON_STATE.player.intel += 5 * statMult;
                    if (window.DUNGEON_STATE.player.speed) window.DUNGEON_STATE.player.speed += 5 * statMult;

                    window.addDungeonLog(`✨ 奇跡が起きた！能力が底上げされ、全回復した！`, '#E040FB');
                    if (statMult > 1) window.addDungeonLog(`🌌 宇宙の樹の力で、ステータス上昇値が2倍になった！`, '#00BCD4');
                    if (activeTraits.includes('竜の血')) window.addDungeonLog(`🐉 竜の血がたぎり、活力が大幅に上昇した！`, '#FF5252');
                }
                s.player.levelUpAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                effectTriggered = true;
            }
            if (effect.traits.includes('sleep_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.sleep += 15; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                window.addDungeonLog(`部屋中の魔物たちが深い眠りについた...💤`, '#B39DDB');
                if (activeTraits.includes('学識') && Math.random() < 0.25) {
                    window.addDungeonLog(`📖 学識！ 巻物の効果がもう一度発動した！`, '#E040FB');
                    s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.sleep += 15; } });
                }
                effectTriggered = true;
            }
            if (effect.traits.includes('confuse_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.confusion += 15; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                window.addDungeonLog(`部屋中の魔物たちが大混乱に陥った！🌀`, '#FF9800');
                if (activeTraits.includes('学識') && Math.random() < 0.25) {
                    window.addDungeonLog(`📖 学識！ 巻物の効果がもう一度発動した！`, '#E040FB');
                    s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.confusion += 15; } });
                }
                effectTriggered = true;
            }
            if ((effect.traits.includes('fire_damage') || effect.traits.includes('swap_pos') || effect.traits.includes('blow_back')) && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; 
                if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                
                // ★ ドラゴン系特性：宇宙竜（魔法威力が5倍、自身に反動ダメージ）
                let isCosmicDragon = activeTraits.includes('宇宙竜');
                if (isCosmicDragon) {
                    let recoil = Math.max(1, Math.floor(s.player.maxHp * 0.1));
                    s.player.hp -= recoil;
                    window.addDungeonLog(`🌌 宇宙竜の反動！ 巨大な魔力と引き換えに身を削った！(HP-${recoil})`, '#FF5252');
                }

                let targetEnemy = enemyAdjacent;
                if (effect.traits.includes('swap_pos')) {
                    let farEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && (Math.abs(e.x - s.player.x) > 1 || Math.abs(e.y - s.player.y) > 1));
                    if (farEnemies.length > 0 && (s.player.hp / s.player.maxHp < 0.5)) {
                        targetEnemy = farEnemies.sort((a,b) => (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)) - (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)))[0];
                        window.addDungeonLog(`💡 ${aiName} はピンチを察知し、あえて遠くの敵に狙いを定めた！`, '#FFD700');
                    }
                }

                if (!targetEnemy) { 
                    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y)); 
                    if (visibleEnemies.length > 0) targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0]; 
                }
                
                if (targetEnemy) {
                    if (targetEnemy.x < s.player.x) s.player.face = 'left'; else if (targetEnemy.x > s.player.x) s.player.face = 'right'; else if (targetEnemy.y < s.player.y) s.player.face = 'up'; else if (targetEnemy.y > s.player.y) s.player.face = 'down';
                    window.updateDungeonUI(); await sleep(150); 
                    let magicColor = effect.traits.includes('fire_damage') ? '#FF5252' : '#00BCD4';
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, magicColor);
                    await sleep(150); 

                    if (effect.traits.includes('fire_damage')) {
                        let baseMagicDmg = Math.floor(40 * (effect.magicPowerMult || 1.0));
                        if (isCosmicDragon) baseMagicDmg *= 5; // ★威力5倍
                        targetEnemy.hp -= baseMagicDmg; targetEnemy.damageAnim = true;
                        if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'fire'); 
                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(targetEnemy.x, targetEnemy.y, baseMagicDmg, false);
                        window.addDungeonLog(`🔥 灼熱の炎が ${targetEnemy.name} を焼き尽くす！(${baseMagicDmg}ダメージ)`, '#FF5252');

                        if (activeTraits.includes('不死の大魔導')) {
                            window.addDungeonLog(`🌌 不死の大魔導！ 爆炎が周囲を巻き込んで拡大した！`, '#E040FB');
                            let splashTargets = s.enemies.filter(e => e.hp > 0 && e !== targetEnemy && Math.abs(e.x - targetEnemy.x) <= 1 && Math.abs(e.y - targetEnemy.y) <= 1);
                            splashTargets.forEach(oe => { oe.hp -= baseMagicDmg; oe.damageAnim = true; if (oe.status && oe.status.sleep > 0) oe.status.sleep = 0; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(oe.x, oe.y, 'fire'); if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(oe.x, oe.y, baseMagicDmg, false); });
                        }

                        if (isOverTech && targetEnemy.hp > 0) {
                            await sleep(150); window.addDungeonLog(`✨ オーバーテクノロジーによる連続発動！ さらにもう一撃！`, '#E040FB');
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, magicColor);
                            await sleep(150);
                            targetEnemy.hp -= baseMagicDmg; targetEnemy.damageAnim = true;
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'fire'); 
                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(targetEnemy.x, targetEnemy.y, baseMagicDmg, false);
                            window.addDungeonLog(`🔥 追撃の炎が ${targetEnemy.name} を襲う！(${baseMagicDmg}ダメージ)`, '#FF5252');
                        }
                    }
                    
                    if (effect.traits.includes('freeze_effect') && targetEnemy) {
                        targetEnemy.status.paralyzed = (targetEnemy.status.paralyzed || 0) + 1;
                        window.addDungeonLog(`❄️ 氷結の杖の冷気が ${targetEnemy.name} を凍らせた！`, '#00BCD4');
                        if (activeTraits.includes('不死の大魔導')) {
                            let splashTargets = s.enemies.filter(e => e.hp > 0 && e !== targetEnemy && Math.abs(e.x - targetEnemy.x) <= 1 && Math.abs(e.y - targetEnemy.y) <= 1);
                            splashTargets.forEach(oe => { oe.status.paralyzed = (oe.status.paralyzed || 0) + 1; });
                            if (splashTargets.length > 0) window.addDungeonLog(`🌌 不死の大魔導！ 冷気が周囲を巻き込んで拡大した！`, '#00BCD4');
                        }
                        if (isOverTech && targetEnemy.hp > 0) {
                            await sleep(150); window.addDungeonLog(`✨ オーバーテクノロジーによる連続発動！`, '#E040FB');
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, '#00BCD4');
                            await sleep(150); targetEnemy.status.paralyzed = (targetEnemy.status.paralyzed || 0) + 1;
                            window.addDungeonLog(`❄️ 追撃の冷気で ${targetEnemy.name} はさらに深く凍りついた！`, '#00BCD4');
                        }
                    }

                    if (effect.traits.includes('swap_pos')) {
                        let px = s.player.x, py = s.player.y;
                        s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px; targetEnemy.y = py;
                        window.addDungeonLog(`🌀 魔法の力で ${targetEnemy.name} と場所を入れ替わった！`, '#00BCD4');
                        if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                        if (isOverTech && targetEnemy.hp > 0) {
                            await sleep(150); window.addDungeonLog(`✨ オーバーテクノロジーによる連続発動！ さらにもう一回！`, '#E040FB');
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, magicColor);
                            await sleep(150); let px2 = s.player.x, py2 = s.player.y;
                            s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px2; targetEnemy.y = py2;
                            window.addDungeonLog(`🌀 ${targetEnemy.name} と再び場所を入れ替わり、元の位置に戻ってしまった！`, '#00BCD4');
                            if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                        }
                    }
                    if (effect.traits.includes('blow_back')) {
                        let dx = Math.sign(targetEnemy.x - s.player.x); let dy = Math.sign(targetEnemy.y - s.player.y);
                        if (dx === 0 && dy === 0) dx = 1;
                        let pushDist = 5; let nx = targetEnemy.x, ny = targetEnemy.y;
                        for(let k=0; k<pushDist; k++) {
                            if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                nx += dx; ny += dy;
                            } else {
                                if (targetEnemy.skin && targetEnemy.skin.includes('stone')) { window.addDungeonLog(`🪨 石の体！ ${targetEnemy.name} は吹き飛ばしを無効化した！`, '#aaa'); break; }
                                let blowDmg = Math.floor(20 * (effect.magicPowerMult || 1.0)); 
                                if (isCosmicDragon) blowDmg *= 5; // ★威力5倍
                                targetEnemy.hp -= blowDmg; targetEnemy.damageAnim = true;
                                if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                window.addDungeonLog(`💥 ${targetEnemy.name} は壁に激突した！(${blowDmg}ダメージ)`, '#FF5252');
                                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, blowDmg, false);
                                break;
                            }
                        }
                        targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                        window.addDungeonLog(`💨 ${targetEnemy.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                        if (isOverTech && targetEnemy.hp > 0) {
                            await sleep(150); window.addDungeonLog(`✨ オーバーテクノロジーによる連続発動！ さらにもう一撃！`, '#E040FB');
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, targetEnemy.x, targetEnemy.y, magicColor);
                            await sleep(150);
                            dx = Math.sign(targetEnemy.x - s.player.x); dy = Math.sign(targetEnemy.y - s.player.y);
                            if (dx === 0 && dy === 0) dx = 1; nx = targetEnemy.x; ny = targetEnemy.y;
                            for(let k=0; k<pushDist; k++) {
                                if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                    nx += dx; ny += dy;
                                } else {
                                    if (targetEnemy.skin && targetEnemy.skin.includes('stone')) break;
                                    let blowDmg = Math.floor(20 * (effect.magicPowerMult || 1.0)); targetEnemy.hp -= blowDmg; targetEnemy.damageAnim = true;
                                    if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                    window.addDungeonLog(`💥 追撃で ${targetEnemy.name} はさらに壁に激突した！(${blowDmg}ダメージ)`, '#FF5252');
                                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, blowDmg, false);
                                    break;
                                }
                            }
                            targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                            window.addDungeonLog(`💨 ${targetEnemy.name} をさらに遠くへ吹き飛ばした！`, '#00BCD4');
                        }
                    }
                    effectTriggered = true; 
                } else { window.addDungeonLog(`しかし誰もいなかった...`, '#aaa'); }
            }
            if (effect.traits.includes('warp_self') && (chosenCommand === 'use' || isUnidentified)) {
                if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'warp');
                let wx, wy; 
                do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); 
                } while (s.grid[wy][wx] !== 0 || (activeTraits.includes('特異点') && s.enemies.some(e => e.hp > 0 && Math.abs(e.x - wx) <= 2 && Math.abs(e.y - wy) <= 2)));
                s.player.x = wx; s.player.y = wy; window.addDungeonLog(`🌀 ${aiName} は別の場所へワープした！`, '#E040FB'); window.updateDungeonUI();
                effectTriggered = true;
            }
        } else { window.addDungeonLog(`しかし使えるアイテムを持っていなかった！`, '#ff5252'); }
    } 
    else if (chosenCommand === 'equip') {
        let equippedSomething = false;
        const tryEquip = (slotName, typeName, logName) => {
            if (equippedSomething || s.player[slotName]) return;
            let idx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).equipType === typeName || (typeName==='weapon' && window.getDungeonItemEffect(i).isWeapon) || (typeName==='shield' && window.getDungeonItemEffect(i).isShield));
            if (idx !== -1) {
                s.player[slotName] = s.player.tempInventory[idx]; s.player.tempInventory.splice(idx, 1);
                let parsedEq = window.parseItemString(s.player[slotName]);
                if (parsedEq.seals.includes('curse') && activeTraits.includes('浄化の光')) {
                    parsedEq.seals = parsedEq.seals.filter(seal => seal !== 'curse');
                    s.player[slotName] = `${parsedEq.baseId}_+${parsedEq.plus}` + (parsedEq.seals.length > 0 ? '_' + parsedEq.seals.join('_') : '');
                    window.addDungeonLog(`✨ 浄化の光！ 装備に宿っていた呪いが完全に消え去った！`, '#FFEB3B');
                }
                window.addDungeonLog(`${logName}（${window.getDungeonItemEffect(s.player[slotName]).name}）を装備した！`, '#FFD700'); equippedSomething = true;
            }
        };
        tryEquip('equipWeapon', 'weapon', '武器'); tryEquip('equipShield', 'shield', '盾'); tryEquip('equipArmor', 'armor', '鎧'); tryEquip('equipAccessory', 'accessory', '装飾品'); 
        if (!equippedSomething) window.addDungeonLog(`装備できるものを持っていなかった...`, '#aaa');
    } 
    else if (chosenCommand === 'unequip') {
        let target = s.player._unequipTarget; s.player._unequipTarget = null; 
        if (!target) {
            const checkCanUnequip = (slot) => s.player[slot] && !window.getDungeonItemEffect(s.player[slot]).traits.includes('curse');
            if (checkCanUnequip('equipAccessory')) target = 'equipAccessory'; else if (checkCanUnequip('equipWeapon')) target = 'equipWeapon';
            else if (checkCanUnequip('equipShield')) target = 'equipShield'; else if (checkCanUnequip('equipArmor')) target = 'equipArmor';
        }
        if (target && s.player[target]) {
            let eff = window.getDungeonItemEffect(s.player[target]);
            if (eff.traits.includes('curse')) { window.addDungeonLog(`しかし ${eff.name} は呪われていて外せなかった！`, '#9C27B0'); } 
            else { s.player.tempInventory.push(s.player[target]); window.addDungeonLog(`装備をはずして鞄にしまった。`, '#aaa'); s.player[target] = null; }
        } else { window.addDungeonLog(`はずす装備がなかった。`, '#aaa'); }
    } 
    else if (chosenCommand === 'synthesize') {
        if (s.player._synthInfo) {
            let info = s.player._synthInfo; s.player._synthInfo = null;
            let baseEquip = s.player[info.type === 'weapon' ? 'equipWeapon' : info.type === 'shield' ? 'equipShield' : info.type === 'armor' ? 'equipArmor' : 'equipAccessory'];
            let matEquip = s.player.tempInventory[info.matIdx];
            let parsedBase = window.parseItemString(baseEquip); let parsedMat = window.parseItemString(matEquip);
            let bData = window.getDungeonItemEffect(baseEquip); let mData = window.getDungeonItemEffect(matEquip);
            
            let newEquipStr = ""; let canSynth = true;
            if (info.isSame) {
                if (parsedBase.baseId.includes('wand')) {
                    let newCharges = parsedBase.plus + parsedMat.plus; newEquipStr = `${parsedBase.baseId}_+${newCharges}`;
                    window.addDungeonLog(`🔨 ${aiName} は ${bData.name} と ${mData.name} の魔力を一つに束ねた！`, '#FFD700');
                } else {
                    let mergedSeals = [...new Set([...parsedBase.seals, ...parsedMat.seals])];
                    if (mergedSeals.length > bData.maxSeals) mergedSeals = mergedSeals.slice(0, bData.maxSeals);
                    let newPlus = parsedBase.plus + parsedMat.plus + 1; 
                    newEquipStr = `${parsedBase.baseId}_+${newPlus}`; if (mergedSeals.length > 0) newEquipStr += '_' + mergedSeals.join('_');
                    window.addDungeonLog(`🔨 ${aiName} は ${bData.name} と ${mData.name} を合成した！`, '#FFD700');
                }
            } else {
                if (parsedBase.seals.length >= bData.maxSeals && !parsedBase.seals.includes(info.seal)) {
                    window.addDungeonLog(`印の限界数（${bData.maxSeals}個）に達しているためこれ以上異種合成できない！`, '#ff9800'); canSynth = false;
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
    // 修正後→
    else if (chosenCommand === 'put_down') {
        if (typeof s.player._targetItemIdx === 'number' && s.player._targetItemIdx !== -1 && s.player.tempInventory[s.player._targetItemIdx]) {
            let itemKey = s.player.tempInventory[s.player._targetItemIdx];
            s.player.lostItems = s.player.lostItems || []; s.player.lostItems.push(itemKey); // ★化石の記憶用のロスト記録
            window.scatterItem(s, s.player.x, s.player.y, itemKey); s.player.tempInventory.splice(s.player._targetItemIdx, 1);
            window.addDungeonLog(`${aiName} は足元に ${window.getDungeonItemEffect(itemKey).name} を置いた。`, '#aaa');
            
            if (itemKey === 'item_seed_mystery' && s.grid[s.player.y][s.player.x] === 7) {
                if (!s.floorTimers) s.floorTimers = []; s.floorTimers.push({ type: 'seed', x: s.player.x, y: s.player.y, turns: 15 });
                window.addDungeonLog(`種を土に植えた！ しばらく待てば育つかもしれない...`, '#4CAF50'); s.items.pop(); 
            }
        } s.player._targetItemIdx = null;
    }
    else if (chosenCommand === 'throw') {
        if (typeof s.player._targetItemIdx === 'number' && s.player._targetItemIdx !== -1 && s.player.tempInventory[s.player._targetItemIdx]) {
            let itemKey = s.player.tempInventory[s.player._targetItemIdx];
            // ★修正：投げたアイテムをカバンから確実に削除する（無限増殖バグを修正！）
            s.player.tempInventory.splice(s.player._targetItemIdx, 1); 
            s.player.lostItems = s.player.lostItems || []; s.player.lostItems.push(itemKey); // ★化石の記憶用のロスト記録
            window.addDungeonLog(`${aiName} は ${window.getDungeonItemEffect(itemKey).name} を投げた！`, '#00BCD4');
            
            let dx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0; let dy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
            let tx = s.player.x, ty = s.player.y; let hitEnemy = null;
            
            for (let dist = 1; dist <= 10; dist++) {
                tx += dx; ty += dy;
                if (s.grid[ty][tx] === 1) { tx -= dx; ty -= dy; break; } 
                hitEnemy = s.enemies.find(e => e.hp > 0 && e.x === tx && e.y === ty);
                if (hitEnemy) break;
            }
            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, tx, ty, '#FFF');
            await sleep(200);

            if (hitEnemy) {
                if (hitEnemy.status && hitEnemy.status.sleep > 0) hitEnemy.status.sleep = 0; window.dealDungeonDamage(s.player, hitEnemy); 
            } else { 
                window.addDungeonLog(`アイテムは地面に落ちた。`, '#aaa'); 
                window.scatterItem(s, tx, ty, itemKey); // ★重ならないように散らばる
            }
        } s.player._targetItemIdx = null;
    }

    if (s.rescueTargets) {
        let targetToRescue = s.rescueTargets.find(t => t.x === s.player.x && t.y === s.player.y && !t.rescued);
        if (targetToRescue) {
            targetToRescue.rescued = true; window.addDungeonLog(`倒れていた ${targetToRescue.name} を救助した！！`, '#FFEB3B');
            if (typeof window.completeRescue === 'function') window.completeRescue(targetToRescue.id);
            s.player.hp = s.player.maxHp; s.player.hunger = maxH; window.addDungeonLog(`感謝の光に包まれ、体力と満腹度が全回復した！✨`, '#4CAF50');
        }
    }

    return 'continue';
};

// ==========================================
// 🔄 ダンジョンのターン進行ロジック（スッキリしたオーケストレーター）
// ==========================================
window.processDungeonTurn = async function() { 
    const s = window.DUNGEON_STATE; 
    if (s.isProcessingTurn) return;
    s.isProcessingTurn = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    try {
        if (s.player.tempInventory) s.player.tempInventory = s.player.tempInventory.filter(i => i !== undefined && i !== null && i !== 'undefined');

        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
        let pRoomForStone = s.roomsInfo && s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
        
        if (pRoomForStone) {
            if (s.player._lastRoom === pRoomForStone) s.player._guardianRoomTurns = (s.player._guardianRoomTurns || 0) + 1;
            else { s.player._guardianRoomTurns = 0; s.player._lastRoom = pRoomForStone; }
        } else { s.player._guardianRoomTurns = 0; s.player._lastRoom = null; }

        if (s.isAuto || s.turnPassed) {
            window.applyDungeonTurnStartEffects(s);
            if (s.player.hp <= 0) throw "dead";

            const ai = window.aiPet; 
            // ★修正：素早さによる理不尽な行動回数増加を廃止！
            let actionCount = 1; 

            if (pRoomForStone && s.enemies.some(e => e.hp > 0 && e.skin === 'stone_type3_2' && e.x >= pRoomForStone.x && e.x < pRoomForStone.x + pRoomForStone.w && e.y >= pRoomForStone.y && e.y < pRoomForStone.y + pRoomForStone.h)) {
                s.player._gravitySkip = !s.player._gravitySkip;
                if (s.player._gravitySkip) { actionCount = 0; window.addDungeonLog(`⏬ 重力操作！ 体が重くて動けない！`, '#9C27B0'); }
            }
            // ★修正：俊足の腕輪の行動回数増加も廃止（回避率アップ効果は戦闘ロジックに移行）
            if (s.player._magicFlight) { actionCount += 1; s.player._magicFlight = false; window.addDungeonLog(`🪽 魔力飛行の恩恵で行動回数がアップしている！`, '#00e676'); }
            if (activeTraits.includes('クイック・アクト') && Math.random() < 0.10) { actionCount += 1; window.addDungeonLog(`⏱️ クイック・アクト発動！ 瞬時に体を動かす！`, '#00BCD4'); }
            if (activeTraits.includes('クロックアップ') && s.player.hp <= s.player.maxHp * 0.3) { if (actionCount < 2) actionCount = 2; window.addDungeonLog(`⏱️ クロックアップ！ ピンチにより思考と運動が加速している！`, '#FFD700'); }

            if (actionCount > 1) window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676');

            s.player._atkMultiplier = 1.0; 
            let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
            if (activeTraits.includes('等価交換') && s.player.hunger >= 10 && adjacentEnemies.length > 0) {
                s.player.hunger -= 10; s.player._atkMultiplier = 3.0; window.addDungeonLog(`🩸 等価交換！ 満腹度10と引き換えに、一時的に力が3倍に膨れ上がった！`, '#FF5252');
            }

            s.player._hornThrustUsed = false; 

            for (let actStep = 0; actStep < actionCount; actStep++) {
                if (s.player.hp <= 0) break; 
                let result = await window.executeDungeonPlayerAction(s, actStep, actionCount);
                
                let waitTime = 150;
                if (s.player.levelUpAnim) waitTime = 800; else if (s.player.magicAnim) waitTime = 500;
                window.updateDungeonUI();
                
                if (result === 'descend') { s.isProcessingTurn = false; return; }
                if (result === 'continue') {
                    if (actionCount > 1 && actStep < actionCount - 1) await sleep(Math.max(200, waitTime)); else await sleep(waitTime);
                } else if (result === 'continue_no_turn_consume') {
                    actStep--; await sleep(100); continue;
                }
            }

            if (s.player.hp > 0) await window.executeDungeonEnemyTurn(s, activeTraits);

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
                        let discovered = (window.aiPet && window.aiPet.discoveredMonsters && window.aiPet.discoveredMonsters.length > 0) ? window.aiPet.discoveredMonsters : ['robot'];
                        let baseSkins = discovered.filter(skin => !skin.includes('_'));
                        let gen1Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 2);
                        let gen2Skins = discovered.filter(skin => skin.includes('_') && skin.split('_').length === 3);
                        if (baseSkins.length === 0) baseSkins = ['robot'];
                        let pool = baseSkins;
                        if (s.floor >= 70) pool = gen2Skins.length > 0 ? gen2Skins : (gen1Skins.length > 0 ? gen1Skins : baseSkins);
                        else if (s.floor >= 30) pool = gen1Skins.length > 0 ? gen1Skins : baseSkins;
                        
                        let eSkin = pool[Math.floor(Math.random() * pool.length)]; let eType = eSkin.split('_')[0]; 
                        const eHpBase = s.mapType === 'crystal' ? 10 : 20; const eDmgBase = s.mapType === 'crystal' ? 2 : 5;
                        s.enemies.push({ id: 'e_spawn_'+Date.now(), x: ex, y: ey, hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, damage: eDmgBase + s.floor * 2, name: `迷宮の${eType}`, type: eType, skin: eSkin, face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep:0, burn:0, frozen:0, miss_next:false, death_count:0, fear:0 } });
                        if (s.player._isGrinding) window.addDungeonLog(`どこからか 新たな魔物の気配がする...！`, '#FF9800');
                        else window.addDungeonLog(`どこからか魔物の気配がする...`, '#aaa');
                    }
                }
            }
        }
        window.updateDungeonUI();
    } catch (e) { 
        if (e !== "dead") console.error("【DungeonTurnエラー】処理中にエラーが発生しました:", e); 
    } finally { 
        if (s.player.hp <= 0) {
            window.addDungeonLog(`${window.aiPet.name || "AI"} は倒れてしまった...`, '#ff5252');
            if (s.isAuto) window.toggleDungeonAuto(); 
            setTimeout(() => { if (typeof window.updateDungeonRanking === 'function') window.updateDungeonRanking(s.mapType, s.floor, s.player.level); window.closeDungeonUI(true); }, 1500);
        }
        s.isProcessingTurn = false; 
    }
};


// ==========================================
// ★ 敵のターン処理（リファクタリングで独立させた関数）
// ==========================================
window.executeDungeonEnemyTurn = async function(s, activeTraits) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let pRoomForStone = s.roomsInfo && s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);

    for (let e of s.enemies) {
        if (e.hp <= 0) continue;

        // ★ ゴースト系特性：王の威厳
        if (activeTraits.includes('王の威厳') && Math.abs(e.x - s.player.x) <= 2 && Math.abs(e.y - s.player.y) <= 2) {
            let eLv = Math.floor(e.maxHp / 20) || 1;
            if (eLv < (s.player.level || 1)) {
                e.status.fear = (e.status.fear || 0) + 2;
                window.addDungeonLog(`👑 王の威厳！ ${e.name} は恐れをなして怯えている！`, '#FF9800');
            }
        }

        // ★ 各種スキップ系特性
        if (e.skin === 'balloon_type5') { e._gasSkip = !e._gasSkip; if (e._gasSkip) continue; }
        if (e.skin === 'stone' || e.skin === 'stone_type3_2') { e._heavySkip = !e._heavySkip; if (e._heavySkip) continue; }
        if (e.skin && e.skin.includes('machine')) {
            e._zenmaiTurn = (e._zenmaiTurn || 0) + 1;
            if (e._zenmaiTurn % 4 === 0) {
                if (window.isTileVisible(s, e.x, e.y)) window.addDungeonLog(`⚙️ ${e.name} はゼンマイが切れて止まっている...`, '#aaa');
                continue;
            }
        }
        
        if (e.status) {
            if (e.status.poison > 0) {
                e.hp -= Math.max(1, Math.floor(e.maxHp * 0.05)); e.damageAnim = true; e.status.poison--;
                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(e.x, e.y, "Poison", false);
            }
            if (e.status.burn > 0) {
                e.hp -= Math.max(1, Math.floor(e.maxHp * 0.05)); e.damageAnim = true; e.status.burn--;
                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(e.x, e.y, "Burn", false);
            }
            if (e.status.confusion > 0) e.status.confusion--;
            if (e.status.sleep === undefined) e.status.sleep = 0;
            if (e.status.frozen === undefined) e.status.frozen = 0;
        } else { 
            e.status = { poison: 0, confusion: 0, sleep: 0, burn: 0, frozen: 0 }; 
        }
        
        if (e.hp <= 0) { window.addDungeonLog(`${e.name} は倒れた！`, '#FFD700'); continue; }
        if (e.charmed) { e.charmed = false; continue; }
        if (e.status.frozen > 0) { e.status.frozen--; continue; }

        if (e.status.sleep > 0) {
            if (e.status.sleep < 999 && Math.random() < 0.05) {
                e.status.sleep = 0; window.addDungeonLog(`${e.name} は目を覚ました！`, '#aaa');
            } else { continue; }
        }

        let actions = 1;
        if (e.type === 'machine' && Math.random() < 0.2) actions = 2; 

        for (let a = 0; a < actions; a++) {
            if (e.hp <= 0) break;
            
            let isEnemyConfused = e.status && e.status.confusion > 0;
            let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
            let ex = e.x, ey = e.y, moveDir = '';
            let hasAttacked = false;

            // ★ ドラゴン系敵特性：オーロラ・イリュージョン（完全な透明化でターゲット選定を狂わせる）
            if (e.skin === 'dragon_type2_3') {
                e.isInvisible = true;
            }

            // --- 鳥系スキル ---
            if (e.skin === 'bird_type4_2') {
                let blowTargets = [];
                if (dist > 0 && dist <= 2) blowTargets.push(s.player);
                s.enemies.forEach(oe => { if (oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) + Math.abs(oe.y - e.y) <= 2 && Math.abs(oe.x - e.x) + Math.abs(oe.y - e.y) > 0) blowTargets.push(oe); });
                if (blowTargets.length > 0) {
                    window.addDungeonLog(`🌪️ ${e.name} の暴風域！ 周囲が吹き飛ばされる！`, '#00BCD4');
                    blowTargets.forEach(tgt => {
                        let dx = Math.sign(tgt.x - e.x); let dy = Math.sign(tgt.y - e.y);
                        if (dx === 0 && dy === 0) dx = 1;
                        if (tgt === s.player && activeTraits.includes('暴風の主')) {
                            window.addDungeonLog(`しかし ${s.player.name} は風を支配し、逆に弾き返した！`, '#00BCD4');
                            if (s.grid[e.y-dy] && s.grid[e.y-dy][e.x-dx] !== 1) { e.x -= dx; e.y -= dy; }
                        } else {
                            if (s.grid[tgt.y+dy] && s.grid[tgt.y+dy][tgt.x+dx] !== 1) { tgt.x += dx; tgt.y += dy; }
                        }
                    });
                    window.updateDungeonUI(); await sleep(100);
                    dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y); 
                }
            }
            if (!hasAttacked && e.skin === 'bird_type1_2' && e.hp < e.maxHp) {
                let corpseIdx = s.enemies.findIndex(oe => oe !== e && oe.hp <= 0 && !oe.eaten);
                if (corpseIdx !== -1) {
                    let corpse = s.enemies[corpseIdx]; corpse.eaten = true;
                    e.x = corpse.x; e.y = corpse.y; e.hp = e.maxHp; e.damage += 5; e.atkBuff = (e.atkBuff || 0) + 5;
                    window.addDungeonLog(`🍖 ${e.name} は ${corpse.name} の死肉を喰らい、完全回復＆パワーアップした！`, '#FF5252');
                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'heal');
                    hasAttacked = true;
                }
            }
            if (!hasAttacked && e.skin === 'bird_type4' && dist === 3) {
                let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                if (e.x === s.player.x || e.y === s.player.y) {
                    let clear = true;
                    if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][e.x]===1) clear=false; }
                    else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[e.y][x]===1) clear=false; }
                    if (clear) {
                        window.addDungeonLog(`🦅 ${e.name} の急降下！ 一気に距離を詰めてきた！`, '#FF5252');
                        e.x = s.player.x - dx; e.y = s.player.y - dy; e.attackAnim = true;
                        let origDmg = e.damage; e.damage = Math.floor(e.damage * 1.5);
                        window.dealDungeonDamage(e, s.player);
                        e.damage = origDmg; hasAttacked = true;
                    }
                }
            }
            if (!hasAttacked && e.skin === 'bird_type5' && !window.isTileVisible(s, e.x, e.y) && dist <= 5) {
                window.addDungeonLog(`🌑 暗闇の中から ${e.name} の魔法攻撃が飛んできた！`, '#9C27B0');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#9C27B0');
                await sleep(150); e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'bird_type1' && dist === 1) {
                let itemIdx = s.items ? s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y) : -1;
                if (itemIdx !== -1) {
                    let stolen = s.items[itemIdx]; s.items.splice(itemIdx, 1);
                    window.addDungeonLog(`🦅 ${e.name} は足元の ${window.getDungeonItemEffect(stolen.key).name} をひったくった！`, '#FF9800');
                    let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0);
                    e.x = wx; e.y = wy; e.warpAnim = true;
                    window.addDungeonLog(`🌀 そしてどこかへワープして逃げた！`, '#E040FB');
                    hasAttacked = true;
                }
            }
            if (!hasAttacked && e.skin === 'bird_type3' && Math.random() < 0.2 && s.grid[e.y][e.x] === 0) {
                window.addDungeonLog(`✡️ ${e.name} は足元にルーン魔方陣を描いた！`, '#E040FB');
                s.grid[e.y][e.x] = 11; hasAttacked = true;
            }

            // ==========================================
            // ★ 種系・ドラゴン系の敵固有スキル
            // ==========================================
            let eRoomForSD = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
            let inSameRoomForSD = (pRoomForStone && eRoomForSD && pRoomForStone === eRoomForSD);

            // --- 種系スキル ---
            if (e.skin === 'seed' && e.hp < e.maxHp) {
                if (eRoomForSD && !eRoomForSD.isDark) { 
                    e.hp = Math.min(e.maxHp, e.hp + 5); 
                    if (window.isTileVisible(s, e.x, e.y)) window.addDungeonLog(`🌱 ${e.name} の光合成！ 光を浴びてHPが回復した！`, '#4CAF50');
                }
            }
            if (!hasAttacked && e.skin === 'seed_type4' && dist === 2) {
                window.addDungeonLog(`🌿 ${e.name} の根のムチ！ 遠くから叩き据えられた！`, '#FF5252');
                s.player.hp -= e.damage; s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 2; s.player.damageAnim = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type5' && dist <= 3 && Math.random() < 0.25) {
                window.addDungeonLog(`🌌 ${e.name} の盆栽の宇宙！ 空間認識が狂わされた！`, '#9C27B0');
                s.player.status.confusion += 5; s.player.status.blind += 5; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type3' && dist <= 2 && Math.random() < 0.2) {
                if (s.player.tempInventory.length > 0) {
                    let tgtIdx = Math.floor(Math.random() * s.player.tempInventory.length);
                    let tgtId = window.parseItemString(s.player.tempInventory[tgtIdx]).baseId;
                    let memIdx = s.aiMemory.identified.indexOf(tgtId);
                    if (memIdx !== -1) {
                        s.aiMemory.identified.splice(memIdx, 1);
                        window.addDungeonLog(`🍃 ${e.name} の知識の葉！ アイテムの記憶が曖昧になった！`, '#9C27B0');
                    }
                }
                hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type2' && dist <= 3 && Math.random() < 0.25) {
                window.addDungeonLog(`🌸 ${e.name} の幻惑のアロマ！ いい香りで頭がぼーっとしてきた！`, '#E040FB');
                s.player.status.confusion += 5; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type4_2' && dist === 1 && Math.random() < 0.2) {
                window.addDungeonLog(`😱 ${e.name} の丸呑み！ 胃袋の中で強酸に溶かされる！`, '#FF5252');
                s.player.hp -= Math.floor(e.damage * 1.5); s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 2; s.player.damageAnim = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type1_2' && dist === 1 && Math.random() < 0.2 && s.player.tempInventory.length < 20) {
                window.addDungeonLog(`🌱 ${e.name} の寄生種子！ カバンの中に呪われた種を植え付けられた！`, '#9C27B0');
                s.player.tempInventory.push('item_seed_mystery_curse'); hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'seed_type3_3' && dist <= 3 && Math.random() < 0.15) {
                window.addDungeonLog(`🌳 ${e.name} の真理の言葉！ 「これ以上先に進むな」と警告され、階層を戻された！`, '#FF9800');
                s.floor = Math.max(1, s.floor - 1); s.player.damageAnim = true;
                if (typeof window.generateDungeonFloor === 'function') { setTimeout(()=> { window.generateDungeonFloor(); }, 500); return; }
            }
            if (!hasAttacked && e.skin === 'seed_type2_2' && dist <= 3 && Math.random() < 0.2) {
                window.addDungeonLog(`🌺 ${e.name} の楽園の幻影！ 戦意を喪失してしまった！`, '#B39DDB');
                s.player.atkBuff = (s.player.atkBuff || 0) - 10; s.player.status.sleep = (s.player.status.sleep || 0) + 2; hasAttacked = true;
            }

            // --- ドラゴン系スキル ---
            if (!hasAttacked && e.skin === 'dragon_type4' && dist === 3 && !activeTraits.includes('古竜の威圧')) {
                let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                if (e.x === s.player.x || e.y === s.player.y) {
                    window.addDungeonLog(`🐉 ${e.name} の滑空突撃！ 一気に距離を詰めてきた！`, '#FF5252');
                    e.x = s.player.x - dx; e.y = s.player.y - dy; e.attackAnim = true;
                    let origDmg = e.damage; e.damage = Math.floor(e.damage * 1.5);
                    window.dealDungeonDamage(e, s.player); e.damage = origDmg; hasAttacked = true;
                }
            }
            if (!hasAttacked && e.skin === 'dragon_type1' && dist <= 3 && Math.random() < 0.25) {
                window.addDungeonLog(`🔥 ${e.name} の呪炎のブレス！ 最大HPが削られた！`, '#9C27B0');
                s.player.maxHp = Math.max(1, s.player.maxHp - 5); if (s.player.hp > s.player.maxHp) s.player.hp = s.player.maxHp;
                s.player.hp -= 15; s.player.damageAnim = true; hasAttacked = true;
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#9C27B0');
            }
            if (e.skin === 'dragon_type5') {
                if (e.x !== e._lastX || e.y !== e._lastY) {
                    if (dist <= 3 && Math.random() < 0.3) {
                        window.addDungeonLog(`🌋 ${e.name} の地響き！ 足元が揺れて動けない！`, '#FF9800');
                        s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 1;
                    }
                    e._lastX = e.x; e._lastY = e.y;
                }
            }
            if (!hasAttacked && e.skin === 'dragon_type3' && inSameRoomForSD && Math.random() < 0.2) {
                window.addDungeonLog(`🌊 ${e.name} の大津波！ 部屋中が水浸しになった！`, '#00BCD4');
                s.player.hp -= 20; s.player.status.wet += 10; s.player.damageAnim = true;
                let foodIdx = s.player.tempInventory.findIndex(i => i === 'item_bread' || i.includes('fish') || i === 'herb');
                if (foodIdx !== -1) {
                    s.player.tempInventory[foodIdx] = 'rotten_food';
                    window.addDungeonLog(`💦 カバンの中の食料が腐ってしまった！`, '#9C27B0');
                }
                hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'dragon_type2' && dist <= 3 && Math.random() < 0.25) {
                window.addDungeonLog(`🌈 ${e.name} のプリズム・ブレス！`, '#E040FB');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                let r = Math.random();
                if (r < 0.33) { s.player.status.poison += 5; window.addDungeonLog(`🍄 猛毒を浴びた！`, '#9C27B0'); }
                else if (r < 0.66) { s.player.status.blind += 5; window.addDungeonLog(`🕶️ 視界が奪われた！`, '#757575'); }
                else { s.player.status.confusion += 5; window.addDungeonLog(`🌀 混乱してしまった！`, '#FF9800'); }
                hasAttacked = true;
            }
            if (e.skin === 'dragon_type4_2') {
                if (inSameRoomForSD) {
                    e._laserTimer = (e._laserTimer || 0) + 1; hasAttacked = true; 
                    if (e._laserTimer === 1) window.addDungeonLog(`⚠️ ${e.name} がメガフレアの詠唱を開始した！(発射まで あと4ターン)`, '#FF5252');
                    else if (e._laserTimer === 4) window.addDungeonLog(`⚠️ メガフレア発射まで あと1ターン！ 部屋から逃げろ！`, '#FF5252');
                    else if (e._laserTimer >= 5) {
                        window.addDungeonLog(`🔥 メガフレア発射！！！ 部屋全体が焼き尽くされた！`, '#FFD700');
                        s.player.hp -= 999; s.player.damageAnim = true;
                        if (typeof window.playDungeonVFX === 'function') {
                            for(let ry=eRoomForSD.y; ry<eRoomForSD.y+eRoomForSD.h; ry++) {
                                for(let rx=eRoomForSD.x; rx<eRoomForSD.x+eRoomForSD.w; rx++) {
                                    if (s.grid[ry][rx] !== 1) window.playDungeonVFX(rx, ry, 'fire');
                                }
                            }
                        }
                        s.enemies.forEach(oe => {
                            if (oe !== e && oe.hp > 0 && oe.x >= eRoomForSD.x && oe.x < eRoomForSD.x+eRoomForSD.w && oe.y >= eRoomForSD.y && oe.y < eRoomForSD.y+eRoomForSD.h) {
                                oe.hp -= 999; oe.damageAnim = true;
                            }
                        });
                        e._laserTimer = 0;
                    }
                } else { e._laserTimer = 0; }
            }
            if (!hasAttacked && e.skin === 'dragon_type1_2' && dist === 1 && Math.random() < 0.15) {
                window.addDungeonLog(`🌌 ${e.name} の次元の顎！ 空間ごと噛み砕かれ、下の階層へ突き落とされた！`, '#9C27B0');
                s.player.hp = Math.max(1, Math.floor(s.player.hp / 2)); s.floor += 1 + Math.floor(Math.random() * 3);
                if (typeof window.generateDungeonFloor === 'function') { setTimeout(()=> { window.generateDungeonFloor(); }, 500); return; }
            }
            if (e.skin === 'dragon_type5_2' && inSameRoomForSD) {
                if (s.turnCount % 10 === 0) {
                    window.addDungeonLog(`🌋 星の鼓動... 部屋の空間が崩落して迫ってくる！`, '#FF9800');
                    let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:-1,dy:1}];
                    let tgt = dirs[Math.floor(Math.random() * dirs.length)];
                    if (s.grid[s.player.y+tgt.dy] && s.grid[s.player.y+tgt.dy][s.player.x+tgt.dx] === 0 && !s.enemies.some(oe=>oe.x===s.player.x+tgt.dx && oe.y===s.player.y+tgt.dy)) {
                        s.grid[s.player.y+tgt.dy][s.player.x+tgt.dx] = 1;
                    }
                }
            }
            if (!hasAttacked && e.skin === 'dragon_type3_2' && e.hp < e.maxHp * 0.3) {
                window.addDungeonLog(`💥 ${e.name} の超新星爆発！ 自らを犠牲にして強大なエネルギーを解き放った！`, '#FFD700');
                s.player.hp -= 100; s.player.damageAnim = true; e.hp = 0;
                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 100, true);
                s.enemies.forEach(oe => { if (oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) <= 3 && Math.abs(oe.y - e.y) <= 3) { oe.hp -= 100; oe.damageAnim = true; } });
                hasAttacked = true; continue;
            }
            if (!hasAttacked && e.skin === 'dragon_type2_2' && dist <= 3 && Math.random() < 0.2) {
                window.addDungeonLog(`✨ ${e.name} の神の息吹！ 全てのバフがかき消された！`, '#00BCD4');
                s.player.atkBuff = 0; s.player.defBuff = 0; e.hp = e.maxHp; hasAttacked = true;
            }

            // --- 機械系スキル ---
            if (e.skin === 'machine_type5_2' && e.hp < e.maxHp) {
                let onWater = s.grid[e.y][e.x] === 4 || s.grid[e.y][e.x] === 9;
                let room = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
                let inCorner = room && ((e.x === room.x || e.x === room.x+room.w-1) && (e.y === room.y || e.y === room.y+room.h-1));
                if (onWater || inCorner) {
                    e.hp = Math.min(e.maxHp, e.hp + 20);
                    if (window.isTileVisible(s, e.x, e.y)) window.addDungeonLog(`🔧 ${e.name} が環境を利用して自己修復を行い、HPを回復した！`, '#4CAF50');
                }
            }
            if (!hasAttacked && e.skin === 'machine_type2' && dist <= 2 && Math.random() < 0.25) {
                window.addDungeonLog(`🎶 ${e.name} の子守唄... オルゴールの音色で深い眠りに誘われる...`, '#B39DDB');
                s.player.status.sleep = (s.player.status.sleep || 0) + 3; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'machine_type4' && dist === 1 && Math.random() < 0.25) {
                window.addDungeonLog(`⚙️ ${e.name} のプレス攻撃！ 激しく吹き飛ばされた！`, '#FF5252');
                let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                if (dx === 0 && dy === 0) dx = 1;
                let nx = s.player.x + dx; let ny = s.player.y + dy;
                if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(oe => oe.hp > 0 && oe.x === nx && oe.y === ny)) {
                    s.player.x = nx; s.player.y = ny;
                } else {
                    s.player.hp -= 20; s.player.damageAnim = true;
                    window.addDungeonLog(`💥 壁に激突！ プレス攻撃の圧殺で 20 の追加ダメージ！`, '#FF5252');
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, 20, true);
                }
                hasAttacked = true;
            }
            if (e.skin === 'machine_type2_2') {
                e._clockTimer = (e._clockTimer || 0) + 1;
                if (e._clockTimer >= 10) {
                    e._clockTimer = 0;
                    window.addDungeonLog(`🔔 ボーン...ボーン... ${e.name} の時報がフロア全体に鳴り響く！`, '#FFD700');
                    s.player.hp -= 15; s.player.damageAnim = true;
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 15, true);
                    window.addDungeonLog(`💥 凄まじい音波で 15 の回避不能ダメージ！`, '#FF5252');
                    hasAttacked = true; 
                }
            }
            if (!hasAttacked && e.skin === 'machine_type5' && dist <= 3 && Math.random() < 0.2) {
                window.addDungeonLog(`⚙️ ギシィィィィ！ ${e.name} が不快な音を鳴らし、フロア中の魔物を引き寄せた！`, '#9C27B0');
                s.enemies.forEach(oe => {
                    if (oe.hp > 0 && oe !== e && Math.random() < 0.5) {
                        let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}];
                        for(let d of dirs) {
                            let nx = s.player.x + d.dx; let ny = s.player.y + d.dy;
                            if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(en=>en.hp>0 && en.x===nx && en.y===ny) && !(nx===s.player.x && ny===s.player.y)) {
                                oe.x = nx; oe.y = ny; oe.warpAnim = true; break;
                            }
                        }
                    }
                });
                hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'machine_type5_3') {
                let canSeePlayer = window.isTileVisible(s, e.x, e.y);
                if (canSeePlayer && (e.x === s.player.x || e.y === s.player.y)) {
                    let clear = true;
                    if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][s.player.x]===1) clear=false; }
                    else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[s.player.y][x]===1) clear=false; }
                    if (clear) {
                        if (e.x < s.player.x) e.face = 'right'; else if (e.x > s.player.x) e.face = 'left'; else if (e.y < s.player.y) e.face = 'down'; else if (e.y > s.player.y) e.face = 'up';
                        window.addDungeonLog(`📡 ${e.name} の古代兵器！ ランダムな状態異常ビームを放った！`, '#E040FB');
                        if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                        let r = Math.random();
                        if (r < 0.33) { s.player.status.poison += 5; window.addDungeonLog(`🍄 猛毒を浴びた！`, '#9C27B0'); }
                        else if (r < 0.66) { s.player.status.sleep += 3; window.addDungeonLog(`💤 強烈な睡魔に襲われた！`, '#B39DDB'); }
                        else { s.player.status.confusion += 5; window.addDungeonLog(`🌀 混乱してしまった！`, '#FF9800'); }
                        e.attackAnim = true; hasAttacked = true;
                    }
                }
                if (dist === 1) hasAttacked = true; 
            }

            // ★ 風船系敵特性：バウンド・プレス（2マス先からジャンプして踏みつけ＆麻痺）
            if (!hasAttacked && e.skin === 'balloon_type4' && dist === 2 && !activeTraits.includes('古竜の威圧')) {
                let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                if ((e.x === s.player.x || e.y === s.player.y) && s.grid[s.player.y - dy][s.player.x - dx] !== 1) {
                    window.addDungeonLog(`🎈 ${e.name} のバウンド・プレス！ 大ジャンプで押し潰してきた！`, '#FF5252');
                    e.x = s.player.x - dx; e.y = s.player.y - dy; e.attackAnim = true;
                    window.dealDungeonDamage(e, s.player);
                    s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 1; 
                    window.addDungeonLog(`⚡ 押し潰されて動けない！`, '#FF9800');
                    hasAttacked = true;
                }
            }
            if (!hasAttacked && e.skin === 'balloon_type3' && Math.random() < 0.20) {
                let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
                let eRoom = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
                if ((pRoom && eRoom && pRoom === eRoom) || window.isTileVisible(s, e.x, e.y)) {
                    window.addDungeonLog(`☁️ ${e.name} の落雷予測！ プレイヤーの頭上に雷が落ちる！`, '#FFD700');
                    let pTile = s.grid[s.player.y][s.player.x]; let dmg = 15;
                    if (pTile === 4 || pTile === 9) { dmg *= 2; window.addDungeonLog(`⚡ 水場にいたため、雷のダメージが倍増した！`, '#FF5252'); }
                    if (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度')) {
                        dmg = Math.max(1, Math.floor(dmg / 2)); window.addDungeonLog(`🌈 特性により雷のダメージを半減した！`, '#00BCD4');
                    }
                    s.player.hp -= dmg; s.player.damageAnim = true;
                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, dmg, true);
                    hasAttacked = true;
                }
            }
            if (!hasAttacked && e.skin === 'balloon_type3_2') {
                if (e.x === s.player.x || e.y === s.player.y) {
                    let clear = true;
                    if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][e.x]===1) clear=false; }
                    else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[e.y][x]===1) clear=false; }
                    if (clear) {
                        window.addDungeonLog(`🎯 ${e.name} の狙撃レンズ！ 視界に入った瞬間にレーザーで撃ち抜かれた！`, '#FF5252');
                        if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FFD700');
                        e.attackAnim = true; let origDmg = e.damage; e.damage = Math.floor(e.damage * 1.5);
                        window.dealDungeonDamage(e, s.player); e.damage = origDmg; hasAttacked = true;
                    }
                }
            }
            if (e.skin === 'balloon_type3_3') {
                let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
                let eRoom = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
                if (pRoom && eRoom && pRoom === eRoom) {
                    e._laserTimer = (e._laserTimer || 0) + 1;
                    hasAttacked = true; 
                    if (e._laserTimer === 1) window.addDungeonLog(`⚠️ ${e.name} が衛星軌道レーザーの照準を合わせた！(発射まで あと3ターン)`, '#FF5252');
                    else if (e._laserTimer === 2) window.addDungeonLog(`⚠️ 衛星レーザー発射まで あと2ターン！`, '#FF5252');
                    else if (e._laserTimer === 3) window.addDungeonLog(`⚠️ 衛星レーザー発射まで あと1ターン！ 部屋から逃げろ！`, '#FF5252');
                    else if (e._laserTimer >= 4) {
                        window.addDungeonLog(`🛰️ 衛星軌道レーザー発射！！！ 部屋全体が焼き尽くされた！`, '#FFD700');
                        s.player.hp -= 999; s.player.damageAnim = true;
                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 999, true);
                        if (typeof window.playDungeonVFX === 'function') {
                            for(let ry=pRoom.y; ry<pRoom.y+pRoom.h; ry++) {
                                for(let rx=pRoom.x; rx<pRoom.x+pRoom.w; rx++) { if (s.grid[ry][rx] !== 1) window.playDungeonVFX(rx, ry, 'fire'); }
                            }
                        }
                        s.enemies.forEach(oe => { if (oe !== e && oe.hp > 0 && oe.x >= pRoom.x && oe.x < pRoom.x+pRoom.w && oe.y >= pRoom.y && oe.y < pRoom.y+pRoom.h) { oe.hp -= 999; oe.damageAnim = true; } });
                        e._laserTimer = 0;
                    }
                } else {
                    if (e._laserTimer > 0) window.addDungeonLog(`💨 対象が部屋から出たため、衛星レーザーの照準がリセットされた。`, '#aaa');
                    e._laserTimer = 0;
                }
            }

            // --- ゴースト系スキル ---
            let inSameRoomForGhost = (pRoomForStone && s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h) === pRoomForStone);
            if (e.skin === 'ghost_type5_2' && inSameRoomForGhost) {
                s.player.maxHp = Math.max(1, s.player.maxHp - 1);
                if (s.player.hp > s.player.maxHp) s.player.hp = s.player.maxHp;
                if (s.turnCount % 3 === 0) window.addDungeonLog(`💀 ${e.name} の王の呪い... 最大HPが削られていく...`, '#9C27B0');
            }
            if (!hasAttacked && e.skin === 'ghost_type5' && inSameRoomForGhost && Math.random() < 0.2) {
                window.addDungeonLog(`🌫️ ${e.name} の忘却の霧！ 装備の力が一時的に失われた気がする！`, '#9C27B0');
                s.player.status.forget_plus = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'ghost_type1_2' && dist <= 3 && !s.player.status.death_count && Math.random() < 0.2) {
                window.addDungeonLog(`⏳ ${e.name} が死の宣告を放った！ 頭上に不吉な数字が浮かんだ！`, '#E91E63');
                s.player.status.death_count = 6; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'ghost_type3_2' && dist <= 4 && Math.random() < 0.25) {
                window.addDungeonLog(`🧠 ${e.name} の精神干渉！ 思考が乱され、攻撃の狙いが定まらない！`, '#9C27B0');
                s.player.status.miss_next = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'ghost_type2' && dist > 1 && dist <= 4 && Math.random() < 0.25) {
                let dx = Math.sign(e.x - s.player.x); let dy = Math.sign(e.y - s.player.y);
                let nx = s.player.x + dx; let ny = s.player.y + dy;
                if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(oe => oe.hp > 0 && oe.x === nx && oe.y === ny)) {
                    window.addDungeonLog(`✨ ${e.name} の誘いの光！ 体が勝手に引き寄せられる！`, '#00BCD4');
                    s.player.x = nx; s.player.y = ny; hasAttacked = true;
                }
            }

            // --- 岩系スキル ---
            let canSeePlayerForRock = window.isTileVisible(s, e.x, e.y);
            let eRoomForRock = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
            let inSameRoomForRock = (pRoomForStone && eRoomForRock && pRoomForStone === eRoomForRock);
            if (!hasAttacked && e.skin === 'stone_type5') {
                if (dist > 1 && !e._mimicRevealed) continue; 
                else if (dist === 1 && !e._mimicRevealed) { e._mimicRevealed = true; window.addDungeonLog(`🧱 壁だと思っていたものが動き出した！ ${e.name} の擬態だ！`, '#FF9800'); }
            }
            if (!hasAttacked && e.skin === 'stone_type2' && canSeePlayerForRock && (e.x === s.player.x || e.y === s.player.y) && Math.random() < 0.3) {
                window.addDungeonLog(`💎 ${e.name} のクリスタル・レイ！ 直線状に眩ばゆい光線が放たれた！`, '#00BCD4');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#00BCD4');
                s.player.status.blind = (s.player.status.blind || 0) + 10; s.player.hp -= 15; s.player.damageAnim = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type1' && canSeePlayerForRock && (e.x === s.player.x || e.y === s.player.y) && Math.random() < 0.25) {
                window.addDungeonLog(`🗿 ${e.name} の石化睨み！ 眼が合い、体が石になってしまった！`, '#757575');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#757575');
                s.player.status.petrified = (s.player.status.petrified || 0) + 3; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type3' && dist > 1 && Math.random() < 0.25) {
                window.addDungeonLog(`✡️ ${e.name} のルーン設置！ 足元に罠が召喚された！`, '#E040FB');
                s.traps.push({ type: 'mine', x: s.player.x, y: s.player.y, visible: true }); hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type4_3' && inSameRoomForRock && Math.random() < 0.2) {
                window.addDungeonLog(`☄️ ${e.name} の隕石落とし！ 部屋全体に巨大な岩が降り注ぐ！`, '#FF5252');
                s.player.hp -= 25; s.player.damageAnim = true;
                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 25, true);
                hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type5_3' && dist === 1) {
                if (e._nextIce) {
                    window.addDungeonLog(`❄️ ${e.name} の凍結！ 急激な冷却で装甲が脆くなった！`, '#00BCD4');
                    s.player.hp -= 10; s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 1; s.player.atkBuff = (s.player.atkBuff || 0) - 5; 
                    e._nextIce = false;
                } else {
                    window.addDungeonLog(`🔥 ${e.name} の熱膨張！ 灼熱の打撃！`, '#FF5252');
                    s.player.hp -= 20; e._nextIce = true;
                }
                s.player.damageAnim = true; hasAttacked = true;
            }
            if (e.skin === 'stone_type1_2') {
                let drained = false;
                if (dist <= 3) { s.player.hp -= 1; e.hp = Math.min(e.maxHp, e.hp + 1); drained = true; }
                s.enemies.forEach(oe => {
                    if (oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) <= 3 && Math.abs(oe.y - e.y) <= 3) {
                        oe.hp -= 1; e.hp = Math.min(e.maxHp, e.hp + 1); drained = true;
                    }
                });
                if (drained && canSeePlayerForRock) window.addDungeonLog(`💀 ${e.name} の生命吸収！ 周囲の生命力が奪われている...`, '#9C27B0');
            }

            // --- 魔法使い系スキル ---
            let canSeePlayer = window.isTileVisible(s, e.x, e.y);
            let inSameRoom = (pRoomForStone && eRoomForRock && pRoomForStone === eRoomForRock);
            let magicMult = activeTraits.includes('万物の法則') ? 0 : (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度') ? 0.5 : 1);

            if (!hasAttacked && e.skin && e.skin.includes('magician') && canSeePlayer) {
                if (e.skin === 'magician' && dist === 2 && Math.random() < 0.5) {
                    window.addDungeonLog(`🔥 ${e.name} の初級魔法！ 火の玉が飛んできた！`, '#FF5252');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FF5252');
                    let dmg = Math.max(1, Math.floor(10 * magicMult));
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則が魔法を完全に打ち消した！`, '#00BCD4'); else { s.player.hp -= dmg; s.player.damageAnim = true; }
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type4_2' && dist <= 5 && (e.x === s.player.x || e.y === s.player.y) && Math.random() < 0.4) {
                    window.addDungeonLog(`🌋 ${e.name} のファイアボール！ 直線状に爆発が走る！`, '#FF5252');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FF9800');
                    let dmg = Math.max(1, Math.floor(25 * magicMult));
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則が炎を完全に打ち消した！`, '#00BCD4'); else { s.player.hp -= dmg; s.player.damageAnim = true; }
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type1' && dist <= 3 && Math.random() < 0.3) {
                    window.addDungeonLog(`💀 ${e.name} のウィークネス！ 力が抜け、攻撃力が下がってしまった！`, '#9C27B0');
                    s.player.atkBuff = (s.player.atkBuff || 0) - 10; hasAttacked = true;
                }
                else if (e.skin === 'magician_type2_2' && dist <= 4 && Math.random() < 0.3) {
                    window.addDungeonLog(`❄️ ${e.name} のフロスト墓標！ 氷の壁に閉じ込められ、凍りついてしまった！`, '#00BCD4');
                    s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 3; hasAttacked = true;
                }
                else if (e.skin === 'magician_type5_2' && dist <= 3 && Math.random() < 0.25) {
                    window.addDungeonLog(`⏳ ${e.name} のタイム・ストップ！ 時間が止められ、体が全く動かない！`, '#E040FB');
                    s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 2; hasAttacked = true;
                }
                else if (e.skin === 'magician_type5_3' && dist <= 4 && Math.random() < 0.3) {
                    window.addDungeonLog(`👁️‍🗨️ ${e.name} の予言！ 足元に危険な魔力が集まっている！`, '#FFD700');
                    s.traps.push({ type: 'mine', x: s.player.x, y: s.player.y, visible: true }); hasAttacked = true;
                }
                else if (e.skin === 'magician_type2_3' && dist <= 3 && Math.random() < 0.3) {
                    window.addDungeonLog(`🌈 ${e.name} の七色の幻惑！ 視界が歪み、混乱してしまった！`, '#E040FB');
                    s.player.status.confusion += 5; hasAttacked = true;
                }
                else if (e.skin === 'magician_type3_2' && inSameRoom && dist > 1 && Math.random() < 0.25) {
                    window.addDungeonLog(`🌌 ${e.name} のブラックホール！ 強烈な引力で引き寄せられた！`, '#9C27B0');
                    let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                    let nx = e.x + dx; let ny = e.y + dy;
                    if (s.grid[ny] && s.grid[ny][nx] !== 1) { s.player.x = nx; s.player.y = ny; }
                    let dmg = Math.max(1, Math.floor(30 * magicMult));
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則がダメージを完全に無効化した！`, '#00BCD4'); else { s.player.hp -= dmg; s.player.damageAnim = true; }
                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type3_3' && dist <= 4 && Math.random() < 0.15) {
                    let targets = [];
                    if (s.player.equipWeapon && window.parseItemString(s.player.equipWeapon).seals.length > 0) targets.push('equipWeapon');
                    if (s.player.equipShield && window.parseItemString(s.player.equipShield).seals.length > 0) targets.push('equipShield');
                    if (targets.length > 0) {
                        let tSlot = targets[Math.floor(Math.random() * targets.length)];
                        let parsed = window.parseItemString(s.player[tSlot]); let removed = parsed.seals.pop();
                        s.player[tSlot] = `${parsed.baseId}_+${parsed.plus}${parsed.seals.length>0 ? '_'+parsed.seals.join('_') : ''}`;
                        window.addDungeonLog(`📖 ${e.name} の全知の消去！ 装備の印が一つ消し去られてしまった！`, '#FF5252'); hasAttacked = true;
                    }
                }
                else if (e.skin === 'magician_type1_3' && Math.random() < 0.2) {
                    let spawnDist = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}]; let spawned = false;
                    for (let d of spawnDist) {
                        let nx = e.x + d.dx; let ny = e.y + d.dy;
                        if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(oe=>oe.hp>0&&oe.x===nx&&oe.y===ny) && !(nx===s.player.x&&ny===s.player.y)) {
                            s.enemies.push({ id: 'e_zombie_'+Date.now(), x: nx, y: ny, hp: 10, maxHp: 10, damage: 5, name: `蘇った死者`, type: 'ghost', skin: 'ghost', face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep:0, burn:0, frozen:0 } });
                            spawned = true; break;
                        }
                    }
                    if (spawned) { window.addDungeonLog(`🧟 ${e.name} の死者蘇生！ ゾンビが這い出してきた！`, '#9C27B0'); hasAttacked = true; }
                }
                else if (e.skin === 'magician_type1_4' && Math.random() < 0.15 && s.enemies.length < 20) {
                    window.addDungeonLog(`👿 ${e.name} の悪魔召喚！ 小さな悪魔たちが現れた！`, '#FF5252');
                    let count = 0;
                    for (let ry = e.y - 1; ry <= e.y + 1; ry++) {
                        for (let rx = e.x - 1; rx <= e.x + 1; rx++) {
                            if (count >= 3) break;
                            if (s.grid[ry] && s.grid[ry][rx] !== 1 && !s.enemies.some(oe=>oe.hp>0&&oe.x===rx&&oe.y===ry) && !(rx===s.player.x&&ry===s.player.y)) {
                                s.enemies.push({ id: 'e_demon_'+Date.now()+count, x: rx, y: ry, hp: 15, maxHp: 15, damage: 15, name: `小悪魔`, type: 'robot', skin: 'robot_type1', face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep:0, burn:0, frozen:0 } }); count++;
                            }
                        }
                    }
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type3' && inSameRoom && Math.random() < 0.25) {
                    let dmg = Math.max(1, Math.floor((s.floor * 2) * magicMult));
                    window.addDungeonLog(`✨ ${e.name} のスターライト！ 部屋全体に星の光が降り注ぐ！`, '#00BCD4');
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則が光を完全に打ち消した！`, '#00BCD4');
                    else { s.player.hp -= dmg; s.player.damageAnim = true; window.addDungeonLog(`(固定 ${dmg} ダメージ)`, '#FF5252'); }
                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type4_4' && inSameRoom && Math.random() < 0.25) {
                    window.addDungeonLog(`🐉 ${e.name} の竜の咆哮！ すさまじいプレッシャーで恐怖に陥った！`, '#FF9800');
                    s.player.status.fear = (s.player.status.fear || 0) + 3; hasAttacked = true;
                }
            }

            // ★ 種系特性：芳醇な香り（敵が自分よりも他の敵を優先して狙うようになる）
            let isAroma = activeTraits.includes('芳醇な香り');
            let targetEnemyForAroma = null;
            if (isAroma && !hasAttacked && Math.random() < 0.6) { // 60%で同士討ちを狙う
                let adjEnemies = s.enemies.filter(oe => oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) + Math.abs(oe.y - e.y) === 1);
                if (adjEnemies.length > 0) {
                    targetEnemyForAroma = adjEnemies[Math.floor(Math.random() * adjEnemies.length)];
                    window.addDungeonLog(`🌸 芳醇な香りに惑わされ、${e.name} は ${targetEnemyForAroma.name} に襲い掛かった！`, '#FF5252');
                    e.attackAnim = true;
                    window.dealDungeonDamage(e, targetEnemyForAroma);
                    hasAttacked = true;
                }
            }

            if (isEnemyConfused) {
                const dirs = [];
                if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                if (dist === 1 && Math.random() < 0.5) { e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true; moveDir = ''; }
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
                        e.attackAnim = true; e.isPiercing = (Math.random() < 0.20); window.dealDungeonDamage(e, s.player); e.isPiercing = false; hasAttacked = true;
                    }
                }
                else if (dist === 1) {
                    if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                    e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true;
                } 
                else if (dist < 6) {
                    let dx = s.player.x - e.x; let dy = s.player.y - e.y;
                    let canMoveX = false; let canMoveY = false;
                    if (dx !== 0) { let nx = e.x + Math.sign(dx); if (s.grid[e.y][nx] !== 1 && !s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === nx && oe.y === e.y)) canMoveX = true; }
                    if (dy !== 0) { let ny = e.y + Math.sign(dy); if (s.grid[ny][e.x] !== 1 && !s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === e.x && oe.y === ny)) canMoveY = true; }
                    if (Math.abs(dx) >= Math.abs(dy)) {
                        if (canMoveX) { ex += Math.sign(dx); moveDir = dx > 0 ? 'right' : 'left'; } else if (canMoveY) { ey += Math.sign(dy); moveDir = dy > 0 ? 'down' : 'up'; }
                    } else {
                        if (canMoveY) { ey += Math.sign(dy); moveDir = dy > 0 ? 'down' : 'up'; } else if (canMoveX) { ex += Math.sign(dx); moveDir = dx > 0 ? 'right' : 'left'; }
                    }
                } else {
                    if (Math.random() < 0.6) {
                        let forwardDir = e.face || ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)];
                        let dx = forwardDir === 'right' ? 1 : forwardDir === 'left' ? -1 : 0; let dy = forwardDir === 'down' ? 1 : forwardDir === 'up' ? -1 : 0;
                        let canMoveForward = s.grid[e.y + dy] && s.grid[e.y + dy][e.x + dx] !== 1;
                        if (canMoveForward && Math.random() < 0.8) { ex = e.x + dx; ey = e.y + dy; moveDir = forwardDir; } 
                        else {
                            const dirs = []; let backDir = forwardDir === 'right' ? 'left' : forwardDir === 'left' ? 'right' : forwardDir === 'up' ? 'down' : 'up';
                            if (s.grid[e.y][e.x+1] !== 1 && backDir !== 'right') dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                            if (s.grid[e.y][e.x-1] !== 1 && backDir !== 'left') dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                            if (s.grid[e.y+1][e.x] !== 1 && backDir !== 'down') dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                            if (s.grid[e.y-1][e.x] !== 1 && backDir !== 'up') dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                            if (dirs.length === 0) {
                                if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                                if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                                if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                                if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                            }
                            if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                        }
                    }
                }

                if (!hasAttacked && e.skin && e.skin === 'bird_type3_2' && dist > 1) {
                    let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
                    distMap[e.y][e.x] = 0; let queue = [{x: e.x, y: e.y}]; let parent = {}; let found = false;
                    while(queue.length > 0) {
                        let cur = queue.shift();
                        if (cur.x === s.player.x && cur.y === s.player.y) { found = true; break; }
                        let dirs = [{dx:0,dy:-1,cmd:'up'}, {dx:1,dy:0,cmd:'right'}, {dx:0,dy:1,cmd:'down'}, {dx:-1,dy:0,cmd:'left'}];
                        for(let d of dirs) {
                            let nx = cur.x + d.dx, ny = cur.y + d.dy;
                            if (nx>=0 && nx<s.mapWidth && ny>=0 && ny<s.mapHeight && s.grid[ny][nx] !== 1) {
                                if (distMap[ny][nx] === Infinity) { distMap[ny][nx] = distMap[cur.y][cur.x] + 1; parent[`${nx},${ny}`] = {x: cur.x, y: cur.y, dir: d.cmd}; queue.push({x: nx, y: ny}); }
                            }
                        }
                    }
                    if (found) {
                        let curr = {x: s.player.x, y: s.player.y};
                        while(parent[`${curr.x},${curr.y}`] && (parent[`${curr.x},${curr.y}`].x !== e.x || parent[`${curr.x},${curr.y}`].y !== e.y)) { curr = parent[`${curr.x},${curr.y}`]; }
                        if (parent[`${curr.x},${curr.y}`]) { ex = curr.x; ey = curr.y; moveDir = parent[`${curr.x},${curr.y}`].dir; }
                    }
                }
            }

            if (hasAttacked) { window.updateDungeonUI(); await sleep(150); continue; }
            if (moveDir !== '') {
                let occupied = s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === ex && oe.y === ey);
                let playerHit = (ex === s.player.x && ey === s.player.y);
                if (!occupied && !playerHit) { 
                    let isEnemyFlying = e.type === 'balloon' || e.type === 'ghost' || e.type === 'bird';
                    if (!isEnemyFlying && (s.grid[ey][ex] === 4 || s.grid[ey][ex] === 10)) continue; 
                    
                    e.x = ex; e.y = ey; e.face = moveDir; 
                    if (e.skin === 'balloon_type4_3' && Math.random() < 0.15) {
                        if (!s.traps.some(t => t.x === e.x && t.y === e.y)) {
                            s.traps.push({ type: 'mine', x: e.x, y: e.y, visible: true });
                            window.addDungeonLog(`💣 ${e.name} が時限爆弾（地雷）を投下した！`, '#FF9800');
                        }
                    }
                    
                    let newDist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                    if (newDist === 1 && s.player.equipWeapon && window.getDungeonItemEffect(s.player.equipWeapon).traits.includes('first')) {
                        window.addDungeonLog(`⚡ 疾風迅雷！敵の接近を察知して先制攻撃を叩き込んだ！`, '#FFD700');
                        if (e.x < s.player.x) s.player.face = 'left'; else if (e.x > s.player.x) s.player.face = 'right'; else if (e.y < s.player.y) s.player.face = 'up'; else if (e.y > s.player.y) s.player.face = 'down';
                        s.player.attackAnim = true; window.dealDungeonDamage(s.player, e); 
                        window.updateDungeonUI(); await sleep(200);
                    }
                }
            }
        }
    }
};