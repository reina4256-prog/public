// ==========================================
// ★ ダンジョン専用：作戦（AIマインド）条件と判定
// ==========================================
window.DUNGEON_TACTIC_CONDITIONS = {
    "always": "いつでも",
    "hp_under_30": "HPが30%以下",
    "hp_under_50": "HPが50%以下",
    "hunger_under_20": "満腹度が20%以下",
    "status_bad": "状態異常のとき",
    "enemy_adjacent": "敵が隣接している",
    "enemy_count_2_over": "視界に敵が2体以上いる",
    "unexplored_exist": "未探索エリアがある",
    "monster_house": "モンスターハウスにいる",
    "wind_blowing": "風が吹いてきた",
    "level_low": "フロアに対してレベルが低い",
    "stairs_found": "階段を見つけている", // ★追加（カンマを忘れずに）
    "path_blocked": "道がふさがっている",
    // ★追加：熟練ムーブ用の環境・アイテム条件
    "on_stairs": "階段の上にいる",
    "in_room": "部屋にいる",
    "inventory_full": "持ち物がいっぱい",
    "on_item_any": "アイテムの上にいる",
    "on_item_food": "食べ物の上にいる",
    "on_item_equip": "装備品の上にいる",
    "on_item_unidentified": "未識別アイテムの上にいる",
    "uncollected_item_exist": "未回収のアイテムがある",
    "has_unidentified_item": "未識別アイテムを持っている", // ★追加
    // ★追加：装備・合成用のマインド条件
    "no_weapon": "武器を装備していない",
    "no_shield": "盾を装備していない",
    "no_armor": "鎧を装備していない",
    "no_accessory": "アクセサリーを装備していない",
    "can_synth_equip": "合成できる装備がある",
    "can_synth_item": "合成できるアイテム(異種)がある"
};

window.checkDungeonTacticCondition = function(cond, s, p) {
    if (cond === "always") return true;
    
    let hpRate = p.hp / p.maxHp;
    let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (p.maxHunger || 100);
    let hungerRate = p.hunger / maxH;
    
    let isDarkRoom = false;
    let currentRoom = s.roomsInfo ? s.roomsInfo.find(r => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) : null;
    if (currentRoom) isDarkRoom = currentRoom.isDark;
    let isBlind = (p.status && p.status.blind > 0) || isDarkRoom;
    
    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && !e.isInvisible);
    if (isBlind) visibleEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) <= 1 && !e.isInvisible);
    let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) === 1);

    // ★追加：敵が2体以上見えたら退避メモリをセット。見えなくなっても3ターンは警戒を解かない
    if (visibleEnemies.length >= 2) {
        p._fleeMemory = 3;
    } else if (p._fleeMemory > 0) {
        p._fleeMemory--;
    }

    switch(cond) {
        case "hp_under_30": return hpRate <= 0.3;
        case "hp_under_50": return hpRate <= 0.5;
        case "hunger_under_20": return hungerRate <= 0.2;
        case "status_bad": 
            return p.status && (p.status.poison > 0 || p.status.confusion > 0 || p.status.sleep > 0 || p.status.paralyzed > 0 || p.status.blind > 0 || p.status.burn > 0 || p.status.frozen > 0 || p.status.fear > 0);
        case "enemy_adjacent": return adjacentEnemies.length > 0;
        case "enemy_count_2_over": return visibleEnemies.length >= 2 || (p._fleeMemory > 0);
        case "monster_house": return currentRoom && currentRoom.isMH;
        case "wind_blowing": return (s.floorTurn || 0) >= 700;
        case "level_low": 
            let targetLevel = s.floor <= 5 ? (s.floor * 2 + 1) : (s.floor + 5);
            return (p.level || 1) < targetLevel;
        case "stairs_found": 
            return s.stairs && s.visited[s.stairs.y] && s.visited[s.stairs.y][s.stairs.x];
        case "unexplored_exist":
            for(let ry=0; ry<s.mapHeight; ry++) { 
                for(let rx=0; rx<s.mapWidth; rx++) { 
                    if (!s.visited[ry][rx] && s.grid[ry][rx] !== 1) return true; 
                } 
            }
            return false;
    }
    return false;
};

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
            if (e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h) {
                if (e.status && e.status.sleep > 0) e.status.sleep = 0;
                e.isMHActivated = true; // ★追加：モンスターハウスの敵はずっとプレイヤーを追跡するようになる
            }
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
                let grownKey = '';
                
                // ★ 大当たり枠：「しあわせの種」は 5% の低確率で実る
                if (Math.random() < 0.05) {
                    grownKey = 'item_seed_happy';
                } else {
                    // ★ 通常枠：実装済みの食べられるアイテムから均等にランダム
                    let commonItems = [
                        'herb',
                        'item_bread',
                        'item_berry',
                        'herb_antidote',
                        'herb_mint',
                        'herb_eyedrop',
                        'herb_paralysis'
                    ];
                    grownKey = commonItems[Math.floor(Math.random() * commonItems.length)];
                }
                
                s.items.push({ x: timer.x, y: timer.y, key: grownKey });
                window.addDungeonLog(`🌱 土に植えられていた種が成長し、アイテムを実らせた！`, '#4CAF50');
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
// ★ ダンジョン用：汎用経路探索ロジック（BFS + 氷の床シミュレート）
// ==========================================
window.getSmartNextStep = function(startX, startY, targetCondition, avoidRoom = false, strictSafe = false) {
    const s = window.DUNGEON_STATE;
    let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
    distMap[startY][startX] = 0;
    
    let queue = [{x: startX, y: startY, cost: 0, firstStep: null}];
    
    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
    let isFlying = (s.player.skin && (s.player.skin.includes('balloon') || s.player.skin.includes('ghost') || s.player.skin.includes('bird'))) || activeTraits.includes('妖精の羽') || activeTraits.includes('反重力');
    let hasColdResist = activeTraits.includes('耐冷構造') || activeTraits.includes('星の化身');

    let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
    
    while (queue.length > 0) {
        // コスト順にソート（Dijkstra法）
        queue.sort((a, b) => a.cost - b.cost);
        let cur = queue.shift();
        
        if (targetCondition(cur.x, cur.y) && cur.firstStep) return cur.firstStep;
        
        if (cur.cost > 2000 && strictSafe) continue; // 安全第一なら無理な探索はしない
        if (cur.cost > 5000) continue; // フリーズ防止のハードリミット
        
        for (let d of dirs) {
            let initialNx = cur.x + d.dx;
            let initialNy = cur.y + d.dy;
            
            if (initialNx >= 0 && initialNx < s.mapWidth && initialNy >= 0 && initialNy < s.mapHeight) {
                let tile = s.grid[initialNy][initialNx];
                if (tile === 1) continue; // 壁
                if (!isFlying && (tile === 4 || tile === 10)) continue; // 飛行不可時の水・溝
                
                let nx = initialNx; let ny = initialNy;
                
                let hitTrapInitial = s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny);
                
                // 氷の床の滑りシミュレート（罠があればそこで止まる）
                if (!hitTrapInitial && tile === 8 && !hasColdResist) {
                    while (s.grid[ny][nx] === 8) {
                        let nextX = nx + d.dx; let nextY = ny + d.dy;
                        if (nextX < 0 || nextX >= s.mapWidth || nextY < 0 || nextY >= s.mapHeight || s.grid[nextY][nextX] === 1) break;
                        nx = nextX; ny = nextY;
                        if (s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny)) break;
                    }
                }

                if (avoidRoom && s.roomsInfo) {
                    let inRoom = s.roomsInfo.find(rm => nx >= rm.x && nx < rm.x + rm.w && ny >= rm.y && ny < rm.y + rm.h);
                    if (inRoom) continue;
                }

                let hitTrapFinal = s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny);
                let moveCost = 1;
                
                // ★大修正：罠の絶対回避をやめ、コスト1000として評価する（他に道がない時だけ踏むようになる）
                if (hitTrapFinal) {
                    if (strictSafe) continue; 
                    else moveCost += 1000; 
                }
                if (tile === 5) moveCost += (s.player.hp <= 20 && strictSafe) ? 9999 : 20;

                let nextCost = cur.cost + moveCost;
                if (nextCost < distMap[ny][nx]) {
                    distMap[ny][nx] = nextCost;
                    let fStep = cur.firstStep || {x: initialNx, y: initialNy};
                    queue.push({x: nx, y: ny, cost: nextCost, firstStep: fStep});
                }
            }
        }
    }
    return null;
};

// ==========================================
// ★新規追加：AIが印の価値を判断するためのスコア辞書
// ==========================================
window.getDungeonSealScore = function(sealId) {
    // ★修正：現在の作戦（ダンジョン内）またはエディタで選択中の作戦からスコアを取得する
    let customScore = undefined;
    if (sealId !== 'curse') {
        let tacticName = null;
        if (window.DUNGEON_STATE && window.DUNGEON_STATE.active && window.DUNGEON_STATE.player && window.DUNGEON_STATE.player.currentTacticName) {
            tacticName = window.DUNGEON_STATE.player.currentTacticName;
        }
        
        // 作戦エディタを開いている場合は、編集中の作戦のスコアを取得
        if (typeof window.DUNGEON_EDITOR_TACTIC_INDEX !== 'undefined' && window.DUNGEON_EDITOR_TACTIC_INDEX !== -1) {
            if (window.aiPet && window.aiPet.dungeonTactics && window.aiPet.dungeonTactics[window.DUNGEON_EDITOR_TACTIC_INDEX]) {
                tacticName = window.aiPet.dungeonTactics[window.DUNGEON_EDITOR_TACTIC_INDEX].name;
            }
        }

        if (tacticName && tacticName !== "AIにまかせる" && window.aiPet && window.aiPet.dungeonTactics) {
            let activeTactic = window.aiPet.dungeonTactics.find(t => t.name === tacticName);
            if (activeTactic && activeTactic.sealPreferences && typeof activeTactic.sealPreferences[sealId] === 'number') {
                customScore = activeTactic.sealPreferences[sealId];
            }
        }
    }

    if (customScore !== undefined) return customScore;

    const scores = {
        'curse': 9999, // ★呪縛は絶対に外せない（枠を埋め続けるペナルティ）
        // ▼ 新規追加：状態異常無効化系は非常に価値が高い（100〜95帯）
        'anti_poison': 98, 'anti_confuse': 98, 'anti_blind': 95, 'anti_magic': 95, 'anti_paralyze': 98, // ★追加
        'double': 100, 'crit': 95, 'heal': 90, 'dodge': 85, 'parry': 85, 'anti_dragon': 80, 'holy': 80,
        // ▼ 新規追加：状態異常付与系は便利だが優先度は少し下
        'poison_atk': 75, 'confuse_atk': 75, 'blind_atk': 75, 'seal_atk': 75, 'paralyze_atk': 75, // ★追加
        'angry': 75, 'first': 70, 'counter': 70,
        'life': 65, 'regen': 65, 'max_hunger': 60, 'half_hunger': 60,
        'sleep': 50, 'counter_sleep': 50,
        'fire': 40, 'exp': 40, 'food': 30, 'light': 30
    };
    return scores[sealId] || 10;
};

// ==========================================
// ★ ダンジョン用：最適な合成候補を探索・キャッシュするロジック
// ==========================================
window.calculateBestSynth = function(s) {
    let p = s.player;
    p._synthCacheTurn = s.turnCount;
    let bestSameSynth = null; let bestSameScore = -9999;
    let bestDiffSynth = null; let bestDiffScore = -9999;

    // ★新規追加：現在装備している防具（盾・鎧）の印をすべて合算して把握する
    let currentDefSeals = [];
    if (p.equipShield) currentDefSeals.push(...window.getDungeonItemEffect(p.equipShield).traits);
    if (p.equipArmor) currentDefSeals.push(...window.getDungeonItemEffect(p.equipArmor).traits);
    
    // 重複しても効果が加算されない（無駄になる）印のリスト
    const nonStackableSeals = ['anti_poison', 'anti_confuse', 'anti_blind', 'anti_magic', 'anti_paralyze', 'half_hunger'];

    let allItems = []; 
    if (p.equipWeapon) allItems.push({ id: p.equipWeapon, isEquipped: true, slot: 'equipWeapon', idx: -1 });
    if (p.equipShield) allItems.push({ id: p.equipShield, isEquipped: true, slot: 'equipShield', idx: -1 });
    if (p.equipArmor) allItems.push({ id: p.equipArmor, isEquipped: true, slot: 'equipArmor', idx: -1 });
    if (p.equipAccessory) allItems.push({ id: p.equipAccessory, isEquipped: true, slot: 'equipAccessory', idx: -1 });
    
    if (p.tempInventory) {
        for (let i = 0; i < p.tempInventory.length; i++) {
            allItems.push({ id: p.tempInventory[i], isEquipped: false, slot: null, idx: i });
        }
    }

    let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(p.skin).map(t => t.name) : [];

    let effCache = {};
    for (let item of allItems) effCache[item.id] = window.getDungeonItemEffect(item.id);

    for (let base of allItems) {
        let bEff = effCache[base.id];
        let pBase = window.parseItemString(base.id);
        let isWand = pBase.baseId.includes('wand'); 
        
        if (!bEff || (!bEff.equipType && !isWand)) continue; 
        
        // ▼ 修正：呪われていると「判明している」場合のみベースを避ける（未識別なら透視できず突っ込む）
        if (bEff.traits.includes('curse') && bEff.isStatsKnown && !base.isEquipped) continue;
        
        let bScore = typeof window.evaluateEquipmentScore === 'function' ? window.evaluateEquipmentScore(base.id, base.isEquipped ? base.id : null) : 10;
        
        // 呪い装備は評価スコアが-10000になっているため、装備中ならペナルティを相殺して合成候補に挙がるようにする
        if (base.isEquipped && bEff.traits.includes('curse')) bScore += 15000;

        if (bEff.traits && bEff.traits.length > 0) bScore += bEff.traits.length * 1000; 
        if (bEff.maxSeals) bScore += bEff.maxSeals * 200; 

        if (!base.isEquipped && !isWand && bEff.equipType) {
            let slotMap = { 'weapon': 'equipWeapon', 'shield': 'equipShield', 'armor': 'equipArmor', 'accessory': 'equipAccessory' };
            let slotName = slotMap[bEff.equipType];
            let equippedId = s.player[slotName];
            
            if (equippedId) {
                let eqEff = effCache[equippedId] || window.getDungeonItemEffect(equippedId);
                let baseValue = (bEff.atk || 0) + (bEff.def || 0) + (bEff.traits ? bEff.traits.length * 15 : 0);
                let eqValue = (eqEff.atk || 0) + (eqEff.def || 0) + (eqEff.traits ? eqEff.traits.length * 15 : 0);
                if (baseValue > eqValue) bScore += 5000; 
            } else {
                bScore += 1000;
            }
        }

        for (let mat of allItems) {
            if (base === mat) continue; 
            
            let mEff = effCache[mat.id];
            // ▼ 修正：未識別なら呪いを透視できないようにする（チート完全排除）
            if (!mEff || (mEff.traits.includes('curse') && mEff.isStatsKnown)) continue; 
            
            if (mat.isEquipped && mEff.equipType !== bEff.equipType) continue;
            
            let pMat = window.parseItemString(mat.id);
            
            if (isWand) {
                if (pMat.baseId === pBase.baseId) { 
                    let score = bScore + 100; 
                    if (score > bestSameScore) {
                        bestSameScore = score;
                        bestSameSynth = { type: 'wand', baseItem: base, matItem: mat, isSame: true };
                    }
                }
                continue; 
            }

            if (mEff.equipType === bEff.equipType) {
                let baseTotalValue = (bEff.atk || 0) + (bEff.def || 0) + (bEff.traits ? bEff.traits.length * 15 : 0);
                let matTotalValue = (mEff.atk || 0) + (mEff.def || 0) + (mEff.traits ? mEff.traits.length * 15 : 0);
                if (mat.isEquipped && matTotalValue > baseTotalValue) continue;

                if (matTotalValue > baseTotalValue && !mat.isEquipped) {
                    if (!(base.isEquipped && bEff.traits.includes('curse'))) {
                        continue; 
                    }
                }

                let hasValue = pMat.plus > 0 || pMat.seals.length > 0 || mEff.equipType === 'accessory'; 
                if (hasValue || pMat.plus === 0) {
                    if (bScore > bestSameScore) {
                        bestSameScore = bScore;
                        bestSameSynth = { type: bEff.equipType, baseItem: base, matItem: mat, isSame: true };
                    }
                }
            } else {
                if (mat.isEquipped) continue;

                let seal = window.getSealFromItem(pMat.baseId, bEff.equipType);
                if (seal) {
                    // 防具への合成で、すでに別の防具に付いている「重複無効な印」なら合成をスキップする
                    if ((bEff.equipType === 'shield' || bEff.equipType === 'armor') && nonStackableSeals.includes(seal) && currentDefSeals.includes(seal)) {
                        continue; 
                    }

                    if (!bEff.traits.includes(seal)) { 
                        if (pBase.seals.length >= bEff.maxSeals) {
                            let newSealScore = window.getDungeonSealScore(seal);
                            let minCurrentScore = Math.min(...pBase.seals.map(sealId => window.getDungeonSealScore(sealId)));
                            if (newSealScore <= minCurrentScore) continue;
                        }

                        if (bScore > bestDiffScore) {
                            bestDiffScore = bScore;
                            bestDiffSynth = { type: bEff.equipType, baseItem: base, matItem: mat, isSame: false, seal: seal };
                        }
                    }
                }
            }
        }
    }
    p._bestSameSynth = bestSameSynth;
    p._bestDiffSynth = bestDiffSynth;
};

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

    // ==========================================
    // ★新生版：MH交戦フラグのグローバル管理と制圧判定（通路でも判定！）
    // ==========================================
    // 1. MHに入ったら交戦状態を記憶する
    if (currentRoom && currentRoom.isMH) {
        s.player._engagedMHRoom = currentRoom;
    }

    // 2. 交戦中なら、通路にいても常に「敵が残っているか」を監視する
    if (s.player._engagedMHRoom) {
        let r = s.player._engagedMHRoom;
        
        // 部屋の中の敵
        let enemiesInRoom = s.enemies.filter(e => 
            e.hp > 0 && e.type !== 'stone' && e.type !== 'npc' && (!e.skin || !e.skin.includes('stone')) &&
            e.x >= r.x && e.x < r.x + r.w && e.y >= r.y && e.y < r.y + r.h
        );
        // AIの視界内の敵（通路まで追ってきた敵）
        let visibleEnemies = s.enemies.filter(e => 
            e.hp > 0 && e.type !== 'stone' && e.type !== 'npc' && (!e.skin || !e.skin.includes('stone')) &&
            window.isTileVisible(s, e.x, e.y)
        );

        // 部屋の中が空っぽ ＆ 視界にも敵がいないなら制圧完了！
        if (enemiesInRoom.length === 0 && visibleEnemies.length === 0) {
            r.isMH = false;
            s.player._engagedMHRoom = null;
            window.addDungeonLog(`🎉 モンスターハウスの敵をすべて退けた！静けさを取り戻した。`, '#FFD700');
        }
    }
    
    let isDarkRoom = currentRoom ? currentRoom.isDark : false;
    let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom;
    if (activeTraits.includes('発光体')) { isDarkRoom = false; isBlind = false; }

    // ★ 修正：透明化している敵（オーロラ・イリュージョン等）は視界から除外する
    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && !e.isInvisible);
    if (isBlind) visibleEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1 && !e.isInvisible); 
    
    // 隣接している敵は透明でも感知できる
    let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1);
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

    let isFlying = (s.player.skin && (s.player.skin.includes('balloon') || s.player.skin.includes('ghost') || s.player.skin.includes('bird'))) || activeTraits.includes('妖精の羽') || activeTraits.includes('反重力');

    const getSmartNextStep = function(startX, startY, isTargetFunc, avoidEnemies = false, ignoreObstacles = false) {
        let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
        distMap[startY][startX] = 0; let queue = [{x: startX, y: startY, cost: 0}];
        let parent = {}; let foundTarget = null;
        let hasColdResist = activeTraits.includes('耐冷構造') || activeTraits.includes('星の化身'); 
        
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
                        // ★追加：障害物無視モードなら壁もコストを払ってルート計算に入れる
                        if (ignoreObstacles) { moveCost = 50; } 
                        else if ((activeTraits.includes('重機動アーム') || activeTraits.includes('星の砕き手') || activeTraits.includes('星の化身')) && nx > 0 && nx < s.mapWidth - 1 && ny > 0 && ny < s.mapHeight - 1) moveCost = 2; 
                        else if (activeTraits.includes('幽体') && nx > 0 && nx < s.mapWidth - 1 && ny > 0 && ny < s.mapHeight - 1) moveCost = 3;
                        else continue; 
                    }
                    if (!isFlying && (tile === 4 || tile === 10)) {
                        // ★追加：障害物無視モードなら水脈や溝もルート計算に入れる
                        if (ignoreObstacles) { moveCost = 50; }
                        else continue; 
                    }
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

    // ==========================================
    // ★ 究極改修：ダンジョン専用 AIマインド (文脈解釈＆案B＆立ち往生)
    // ==========================================
    if (!chosenCommand && !isConfused) {
        let currentTacticName = s.player.currentTacticName || "AIにまかせる"; 
        
        // ★ デフォルト作戦「AIにまかせる」の場合は、既存の賢いIf-Elseロジックへ通す
        if (currentTacticName !== "AIにまかせる") {
            let activeTactic = (ai.dungeonTactics || []).find(t => t.name === currentTacticName);
            let ruleMatched = false;
            s.player._activeRuleIndex = -1; // ★ 追加：ターン開始時に思考の現在地をリセット
            
            if (activeTactic && activeTactic.rules) {
                for (let i = 0; i < activeTactic.rules.length; i++) {
                    let rule = activeTactic.rules[i];
                    
                    // ★大改修：MH交戦中なら、部屋の外（通路）にいても強制的に条件をクリアさせる！
                    let isConditionMet = window.checkDungeonTacticCondition(rule.condition, s, s.player);
                    if (rule.condition === 'monster_house' && s.player._engagedMHRoom) {
                        isConditionMet = true;
                    }
                    
                    if (isConditionMet) {
                        ruleMatched = true;
                        s.player._activeRuleIndex = i; // ★ 追加：UIハイライト用に現在の行番号を記録
                        
                        // ★ 案B：第1候補、第2候補を順に評価
                        let actions = [rule.action1, rule.action2].filter(a => a);
                        for (let actName of actions) {
                            if (!myWords.includes(actName)) continue;
                            
                            // 💡 文脈解釈ロジック
                            if (rule.condition === 'stairs_found' && actName === 'した') {
                                // 階段の座標を直接取得する
                                let targetX = -1, targetY = -1;
                                for(let ry=0; ry<s.mapHeight; ry++) {
                                    for(let rx=0; rx<s.mapWidth; rx++) {
                                        if (s.grid[ry][rx] === 2 && s.visited && s.visited[ry][rx]) { targetX = rx; targetY = ry; break; }
                                    }
                                    if (targetX !== -1) break;
                                }
                                
                                if (targetX !== -1) {
                                    // ★追加：すでに階段の上にいる場合は、強制的にフロアを降りる！
                                    if (s.player.x === targetX && s.player.y === targetY) {
                                        chosenCommand = 'descend_stairs';
                                        thoughtLog = `作戦【${currentTacticName}】：階段を降りることを決意した！`; break;
                                    } else {
                                        let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetX && y === targetY);
                                        let isEnemyInWay = nextStep ? s.enemies.some(e => e.hp > 0 && e.x === nextStep.x && e.y === nextStep.y) : false;
                                        if (nextStep && !isEnemyInWay) {
                                            if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                            else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                            else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                            else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                            thoughtLog = `作戦【${currentTacticName}】：階段へ向かっている！`; break;
                                        }
                                    }
                                }
                            }
                            else if (rule.condition === 'unexplored_exist' && actName === 'しらべる') {
                                let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] !== 1 && (!s.visited || !s.visited[y][x]));
                                let isEnemyInWay = nextStep ? s.enemies.some(e => e.hp > 0 && e.x === nextStep.x && e.y === nextStep.y) : false;
                                if (nextStep && !isEnemyInWay) {
                                    if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                    else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                    else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                    else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                    thoughtLog = `作戦【${currentTacticName}】：未探索エリアへ進んでいる！`; break;
                                }
                            }
                            else if ((rule.condition === 'monster_house' || rule.condition === 'enemy_count_2_over') && actName === 'にげる') {
                                // ★修正：突撃フラグが立っている間は、退避せずに敵に向かっていく（怒りの突撃で無限ループ防止）
                                if (s.player._commitFight > 0) {
                                    let targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                    if (targetEnemy) {
                                        // ★修正：敵に隣接しているなら、移動ではなく「たたかう」を実行させる
                                        if (adjacentEnemies.length > 0 && validCmdIds.includes('attack')) {
                                            chosenCommand = 'attack';
                                            thoughtLog = `作戦【${currentTacticName}】：怒りの突撃！敵を殲滅する！`; break;
                                        } else {
                                            let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetEnemy.x && y === targetEnemy.y);
                                            if (nextStep) {
                                                if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                                else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                                else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                                else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                                thoughtLog = `作戦【${currentTacticName}】：怒りの突撃！敵を殲滅する！`; break;
                                            }
                                        }
                                    }
                                } else {
                                    let isCorridor = (s.grid[s.player.y][s.player.x] === 3);
                                    if (isCorridor) {
                                        // すでに通路に退避完了している場合は、下位の作戦（アイテム回収など）に落ちないようにその場で迎撃・待機する
                                        let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1);
                                        if (adjacentEnemies.length > 0) {
                                            s.player._waitCount = 0; // 敵が隣接したらカウントリセット
                                            chosenCommand = 'attack'; thoughtLog = `作戦【${currentTacticName}】：退避した通路で敵を迎撃する！`; break;
                                        } else {
                                            // ★修正：一定ターン待っても敵が来ない（遠距離攻撃で削られ続ける）なら、突撃フラグを立てる
                                            s.player._waitCount = (s.player._waitCount || 0) + 1;
                                            if (s.player._waitCount > 3) {
                                                window.addDungeonLog(`💢 ${aiName} は遠隔攻撃にしびれを切らし、突撃を決意した！`, '#ff5252');
                                                s.player._commitFight = 6;
                                                s.player._waitCount = 0;
                                                chosenCommand = 'attack'; thoughtLog = `作戦【${currentTacticName}】：しびれを切らした！次から突撃する！`; break;
                                            } else {
                                                chosenCommand = 'attack'; thoughtLog = `作戦【${currentTacticName}】：通路へ退避完了！敵の追撃を警戒し、待ち構えている！`; break;
                                            }
                                        }
                                    } else {
                                        let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.roomsInfo.find(rm => x >= rm.x && x < rm.x + rm.w && y >= rm.y && y < rm.y + rm.h), true);
                                        let isEnemyInWay = nextStep ? s.enemies.some(e => e.hp > 0 && e.x === nextStep.x && e.y === nextStep.y) : false;
                                        if (nextStep && !isEnemyInWay) {
                                            if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                            else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                            else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                            else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                            thoughtLog = `作戦【${currentTacticName}】：通路へ退避している！`; break;
                                        }
                                    }
                                }
                            }
                            else if (rule.condition === 'wind_blowing' && actName === 'にげる') {
                                let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] !== 1 && (!s.visited || !s.visited[y][x]));
                                let isEnemyInWay = nextStep ? s.enemies.some(e => e.hp > 0 && e.x === nextStep.x && e.y === nextStep.y) : false;
                                if (nextStep && !isEnemyInWay) {
                                    if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                    else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                    else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                    else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                    thoughtLog = `作戦【${currentTacticName}】：風から逃れるため、未探索エリアへ全力で急行している！`; break;
                                }
                            }
                            // ★追加：アイテムの上に乗るだけ（拾わない）の移動マクロ
                            else if (rule.condition === 'uncollected_item_exist' && actName === 'うえ') {
                                let targetItem = null; let minDist = 9999;
                                let isInvFull = s.player.tempInventory.length >= (s.player.maxInventory || 20); // ★追加：カバンが満杯か確認

                                for (let item of s.items) {
                                    if (item.x === s.player.x && item.y === s.player.y) continue;
                                    
                                    // ==========================================
                                    // ★大修正：自分が意図的に捨てたゴミアイテム（_discarded）は、絶対にターゲットにしない！
                                    // ==========================================
                                    if (item._discarded) continue;
                                    
                                    // ★追加：カバンが満杯の時、すでに一度乗って確認した（_visited）アイテムは、用済みとしてスルーする！
                                    if (isInvFull && item._visited) continue;

                                    // ★追加：視界内か踏破済みのアイテムのみ対象にする
                                    if (!window.isTileVisible(s, item.x, item.y) && !(s.visited && s.visited[item.y] && s.visited[item.y][item.x])) continue;
                                    let d = Math.abs(item.x - s.player.x) + Math.abs(item.y - s.player.y);
                                    if (d < minDist) { minDist = d; targetItem = item; }
                                }
                                if (targetItem) {
                                    let nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetItem.x && y === targetItem.y);
                                    let isEnemyInWay = nextStep ? s.enemies.some(e => e.hp > 0 && e.x === nextStep.x && e.y === nextStep.y) : false;
                                    if (nextStep && !isEnemyInWay) {
                                        if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                        else if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                        else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                        else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                        
                                        // ★修正：「乗るだけ」の作戦なので、カバンの空きに関わらずオートピックを強制停止する
                                        s.player._preventAutoPick = true; 
                                        
                                        thoughtLog = `作戦【${currentTacticName}】：アイテムの上へ向かっている！`; break;
                                    }
                                }
                            }
                            // ★追加：カバンの中の未識別アイテムへのアクション（種類を自動判別）
                            else if (rule.condition === 'has_unidentified_item') {
                                let targetIdx = -1;
                                for (let i = 0; i < s.player.tempInventory.length; i++) {
                                    let itemId = s.player.tempInventory[i];
                                    let parsed = window.parseItemString(itemId);
                                    let eff = window.getDungeonItemEffect(itemId);
                                    let tName = s.aiMemory.tempNames[parsed.baseId];
                                    // ★修正：装備品の未鑑定状態も未識別としてピックアップ
                                    let isUnidConsumable = s.sessionItemDict && s.sessionItemDict[parsed.baseId] && !s.aiMemory.identified.includes(parsed.baseId) && (!tName || tName.startsWith("謎の"));
                                    let isUnidEquip = (eff.equipType !== null || eff.isWeapon || eff.isShield) && !eff.isStatsKnown;
                                    if (!isUnidConsumable && !isUnidEquip) continue;

                                    // 見た目でカテゴリを判別する（★草系とパンを完全網羅）
                                    let isFood = parsed.baseId === 'herb' || parsed.baseId.startsWith('herb_') || parsed.baseId.includes('berry') || parsed.baseId.includes('seed') || parsed.baseId === 'item_bread';
                                    let isMagic = parsed.baseId.includes('scroll') || parsed.baseId.includes('wand');

                                    // ★追加：回数が0の杖は「つかう」対象から除外して無限ループを防ぐ
                                    if (actName === 'つかう' && parsed.baseId.includes('wand') && parsed.plus <= 0) continue;

                                    // ★完全修正：すでに「謎の杖」と保留名がついている場合、射線が通る（壁がない）直線上に「敵・罠・ギミック」がいないと温存する
                                    if (actName === 'つかう' && parsed.baseId.includes('wand') && tName === "謎の杖") {
                                        let hasValidTarget = false;
                                        let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
                                        for (let d of dirs) {
                                            let cx = s.player.x, cy = s.player.y;
                                            for (let r = 1; r <= 999; r++) {
                                                cx += d.dx; cy += d.dy;
                                                if (cx < 0 || cx >= s.mapWidth || cy < 0 || cy >= s.mapHeight) break;
                                                
                                                let tile = s.grid[cy][cx];
                                                if (tile === 1) break; // 壁があったら透視しない（この方向のチェック終了）
                                                
                                                // ★復活：敵、見えている罠、またはすべてのギミック（階段・水脈・マグマ・草地・氷・溝）を有効なターゲットとして許可！
                                                if (s.enemies.some(e => e.hp > 0 && e.x === cx && e.y === cy) ||
                                                    (s.traps && s.traps.some(t => t.visible && t.x === cx && t.y === cy)) ||
                                                    [2, 4, 5, 6, 7, 8, 9, 10].includes(tile)) {
                                                    hasValidTarget = true; break;
                                                }
                                            }
                                            if (hasValidTarget) break;
                                        }
                                        if (!hasValidTarget) continue;
                                    }

                                    // ★今回追加：謎の巻物の温存フィルター（通路なら周囲1マス、部屋なら部屋内に敵がいる時だけ温存を解除する）
                                    if (actName === 'つかう' && parsed.baseId.includes('scroll') && tName === "謎の巻物") {
                                        let pRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                                        let hasTargets = false;
                                        if (pRoom) {
                                            hasTargets = s.enemies.some(e => e.hp > 0 && e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h);
                                        } else {
                                            hasTargets = s.enemies.some(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                                        }
                                        if (!hasTargets) continue;
                                    }

                                    if ((actName === 'たべる' && isFood) || (actName === 'つかう' && isMagic) || actName === 'しらべる' || actName === 'なまえ') {
                                        targetIdx = i; break;
                                    }
                                }
                                
                                if (targetIdx !== -1) {
                                    let cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === actName);
                                    if (cmdInfo && validCmdIds.includes(cmdInfo.id)) {
                                        chosenCommand = cmdInfo.id;
                                        s.player._bestItemIdx = targetIdx;
                                        if (actName === 'しらべる') s.player._identifyTargetIdx = targetIdx;
                                        if (actName === 'なまえ') s.player._nameTargetIdx = targetIdx;
                                        thoughtLog = `作戦【${currentTacticName}】：カバンの未識別アイテムに「${actName}」を実行する！`; break;
                                    } else {
                                        window.addDungeonLog(`💭 思考キャンセル：「${actName}」はまだ閃いていないため実行できない。`, '#757575');
                                    }
                                } else {
                                    window.addDungeonLog(`💭 思考キャンセル：「${actName}」に適した未識別アイテムがないため次を検討。`, '#757575');
                                }
                            }
                            // ★追加：階段の上での「素振り回復」の限界チェック（満タンならフォールバック）
                            else if (rule.condition === 'on_stairs' && actName === 'たたかう') {
                                let isHpFull = s.player.hp >= s.player.maxHp;
                                let isEnemyAdjacent = s.enemies.some(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                                
                                // ★追加：満腹度が40以下の場合、回復系の特性・印がない限りは自然回復しないためフォールバックさせる
                                let hasRegen = false;
                                ['equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
                                    if (s.player[slot]) {
                                        let tr = window.getDungeonItemEffect(s.player[slot]).traits;
                                        if (tr.includes('regen') || tr.includes('life')) hasRegen = true;
                                    }
                                });
                                let canRegen = s.player.hunger > 40 || hasRegen || activeTraits.includes('大地の恵み') || activeTraits.includes('天使の加護');

                                if (isEnemyAdjacent || (!isHpFull && canRegen)) {
                                    chosenCommand = 'attack';
                                    thoughtLog = isEnemyAdjacent ? `作戦【${currentTacticName}】：階段の上で敵を迎撃する！` : `作戦【${currentTacticName}】：階段の上で安全に体力を回復している...`;
                                    break;
                                }
                                // HP満タン、敵がいない、または回復手段がない場合はスルーされフォールバックする
                            }
                            // ★追加：部屋の中での「罠警戒歩行」（素振りと移動を交互に行う）
                            else if (rule.condition === 'in_room' && actName === 'たたかう') {
                                let isEnemyAdjacent = s.enemies.some(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                                if (isEnemyAdjacent) {
                                    chosenCommand = 'attack';
                                    thoughtLog = `作戦【${currentTacticName}】：敵が接近！罠の警戒を解き、迎撃する！`;
                                    s.player._trapCheckToggle = false;
                                    break;
                                } else {
                                    // 目的地への次の一歩を取得
                                    let nextStep = null;
                                    
                                    // ==========================================
                                    // ★大改修：一番近いアイテムをターゲットにする（配列順依存からの脱却）
                                    // ==========================================
                                    let uncollectedItem = null;
                                    let minItemDist = 9999;
                                    let isInvFull = s.player.tempInventory && s.player.tempInventory.length >= (s.player.maxInventory || 20);
                                    
                                    for (let i of s.items) {
                                        // 自分の足元はノーカン
                                        if (i.x === s.player.x && i.y === s.player.y) continue;
                                        
                                        // ★完全修正：自分が意図的に「投げた」「置いた」ゴミアイテムは、カバンに空きがあろうが絶対にターゲットにしない！
                                        if (i._discarded) continue;
                                        
                                        // ★修正：カバンが満杯の時、既に上に乗って「拾えない」と確認したアイテムをスルー
                                        if (isInvFull && i._visited) continue; 
                                        
                                        // 視界内、または踏破済みの部屋にあるアイテムのみ
                                        if (window.isTileVisible(s, i.x, i.y) || (s.visited && s.visited[i.y] && s.visited[i.y][i.x])) {
                                            // プレイヤーからの距離（マンハッタン距離）を計算
                                            let d = Math.abs(i.x - s.player.x) + Math.abs(i.y - s.player.y);
                                            if (d < minItemDist) {
                                                minItemDist = d;
                                                uncollectedItem = i; // 一番近いものを更新
                                            }
                                        }
                                    }
                                    
                                    let stairX = -1, stairY = -1;
                                    for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (s.grid[ry][rx] === 2 && s.visited && s.visited[ry][rx]) { stairX = rx; stairY = ry; break; } } if (stairX !== -1) break; }

                                    // ★追加：AIの本来の目的（探索継続か、降りるべきか）を判定
                                    let hasUnexplored = false;
                                    for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (!s.visited[ry][rx] && s.grid[ry][rx] !== 1) { hasUnexplored = true; break; } } if (hasUnexplored) break; }
                                    
                                    // ★大改修：AIの自己判断をやめ、「プレイヤーが組んだ作戦の優先順位」を読み取って目的地を同期させる！
                                    let simTarget = null;
                                    for (let j = 0; j < activeTactic.rules.length; j++) {
                                        let r = activeTactic.rules[j];
                                        if (r.condition === 'uncollected_item_exist' && uncollectedItem && (r.action1 === 'うえ' || r.action2 === 'うえ')) {
                                            simTarget = 'item'; break;
                                        }
                                        if (r.condition === 'stairs_found' && stairX !== -1 && (r.action1 === 'した' || r.action2 === 'した')) {
                                            simTarget = 'stairs'; break;
                                        }
                                        if (r.condition === 'unexplored_exist' && hasUnexplored && (r.action1 === 'しらべる' || r.action2 === 'しらべる')) {
                                            simTarget = 'unexplored'; break;
                                        }
                                    }

                                    if (simTarget === 'item' && uncollectedItem) {
                                        nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => x === uncollectedItem.x && y === uncollectedItem.y);
                                    } else if (simTarget === 'stairs' && stairX !== -1 && !(s.player.x === stairX && s.player.y === stairY)) {
                                        nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => x === stairX && y === stairY);
                                    } else if (simTarget === 'unexplored' && hasUnexplored) {
                                        nextStep = window.getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] !== 1 && (!s.visited || !s.visited[y][x]));
                                    }

                                    if (nextStep) {
                                        let dirStr = ''; let cmdStr = '';
                                        if (nextStep.x > s.player.x) { dirStr = 'right'; cmdStr = 'move_right'; }
                                        else if (nextStep.x < s.player.x) { dirStr = 'left'; cmdStr = 'move_left'; }
                                        else if (nextStep.y > s.player.y) { dirStr = 'down'; cmdStr = 'move_down'; }
                                        else if (nextStep.y < s.player.y) { dirStr = 'up'; cmdStr = 'move_up'; }

                                        // ==========================================
                                        // ★新規追加：AIの「プロフェッショナル安全確認」ロジック
                                        // ==========================================
                                        s._trapCheckedTiles = s._trapCheckedTiles || {}; // 素振り履歴＆足跡を保存するメモリ
                                        
                                        // ★大改修：自分が今立っているマスは「実際に歩いて罠がなかった（または踏み抜いた）」ので安全リストに登録！
                                        s._trapCheckedTiles[`${s.player.x},${s.player.y}`] = true;

                                        let isSafeTile = false;
                                        
                                        // 部屋の出入りを判定
                                        let inRoomNow = s.roomsInfo && s.roomsInfo.some(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
                                        let nextInRoom = s.roomsInfo && s.roomsInfo.some(r => nextStep.x >= r.x && nextStep.x < r.x + r.w && nextStep.y >= r.y && nextStep.y < r.y + r.h);
                                        
                                        // 以下のいずれかの条件を満たせば、罠がない「安全なマス」とみなす
                                        // （※ s.visited は視界フラグでありチートになるため削除しました！）
                                        
                                        if (s._trapCheckedTiles[`${nextStep.x},${nextStep.y}`]) isSafeTile = true; // 1. 過去に素振りした、または「実際に歩いた」マス
                                        if (!inRoomNow && nextInRoom) isSafeTile = true; // 2. 部屋に入った1歩目（入り口に罠は配置されない）
                                        if (s.items.some(i => i.x === nextStep.x && i.y === nextStep.y)) isSafeTile = true; // 3. アイテムが落ちている
                                        if (nextStep.x === stairX && nextStep.y === stairY) isSafeTile = true; // 4. 階段がある
                                        if ([4, 5, 6, 7, 8, 9, 10].includes(s.grid[nextStep.y][nextStep.x])) isSafeTile = true; // 5. 罠が置けないギミックマス
                                        // ★追加：既に視界にハッキリ見えている罠は「素振りで探す」必要がないため、そのまま踏みに行く
                                        if (s.traps && s.traps.some(t => t.visible && t.x === nextStep.x && t.y === nextStep.y)) isSafeTile = true;

                                        // ★安全なマスなら素振りをスキップ、それ以外はトグルに従って素振り！
                                        if (isSafeTile || (s.player._trapCheckToggle && s.player.face === dirStr)) {
                                            if (s.player.face !== dirStr) s.player.face = dirStr; // 向きだけは合わせる
                                            chosenCommand = cmdStr; // そのまま一歩進む
                                            
                                            thoughtLog = isSafeTile ? 
                                                `作戦【${currentTacticName}】：安全なマスのため、素振りを省略してサクサク進んだ。` : 
                                                `作戦【${currentTacticName}】：素振りで安全を確認し、一歩進んだ。`;
                                                
                                            s.player._trapCheckToggle = false;
                                            break;
                                        } else {
                                            s.player.face = dirStr; // 進行方向を向く
                                            chosenCommand = 'attack'; // 攻撃（素振り）で罠をあばく
                                            thoughtLog = `作戦【${currentTacticName}】：罠を警戒し、未知のマスへ進む前に素振りで確認している！`;
                                            s.player._trapCheckToggle = true;
                                            
                                            // ★素振りしたマスを記憶し、同じフロアにいる間は二度と素振りしないようにする
                                            // (実際に空振りできた後でフラグを立てるため保留)
                                            s.player._pendingTrapCheckPos = {x: nextStep.x, y: nextStep.y};
                                            break;
                                        }
                                    }
                                    // 目的地がなければスルー（フォールバック）
                                    s.player._trapCheckToggle = false;
                                }
                            }
                            // ★追加：足元アイテムへの直接コマンドと、種別不適合時のフォールバック処理
                            else if (rule.condition.startsWith('on_item_')) {
                                let groundItem = s.items.find(i => i.x === s.player.x && i.y === s.player.y);
                                // ★修正：既にアクション済みのアイテムならスルーして無限ループを防ぐ
                                if (groundItem && !groundItem._visited) {
                                    let canExecute = false;
                                    // ★完全修正：不確実な type プロパティではなく、確実な effectデータから種類を判定する！
                                    let eff = window.getDungeonItemEffect(groundItem.key);
                                    
                                    if (actName === 'たべる' && (groundItem.type === 'food' || (eff.isConsumable && !groundItem.key.includes('scroll') && !groundItem.key.includes('wand')))) canExecute = true;
                                    else if (actName === 'そうび' && ['weapon', 'shield', 'accessory'].includes(eff.equipType)) canExecute = true;
                                    else if (actName === 'つかう' && (groundItem.key.includes('scroll') || groundItem.key.includes('wand'))) canExecute = true;
                                    else if (actName === 'かいふく' && (groundItem.type === 'potion' || (eff.isConsumable && !groundItem.key.includes('scroll') && !groundItem.key.includes('wand') && eff.hp > 0))) canExecute = true;
                                    else if (actName === 'なまえ') canExecute = true;
                                    else if (actName === 'しらべる') canExecute = true;

                                    let failReason = "";
                                    if (actName === 'たべる' && !(groundItem.type === 'food' || (eff.isConsumable && !groundItem.key.includes('scroll') && !groundItem.key.includes('wand')))) failReason = "食べ物ではない";
                                    else if (actName === 'そうび' && !['weapon', 'shield', 'accessory'].includes(eff.equipType)) failReason = "装備品ではない";
                                    else if (actName === 'つかう' && !(groundItem.key.includes('scroll') || groundItem.key.includes('wand'))) failReason = "魔法アイテムではない";
                                    else if (actName === 'かいふく' && !(groundItem.type === 'potion' || (eff.isConsumable && !groundItem.key.includes('scroll') && !groundItem.key.includes('wand') && eff.hp > 0))) failReason = "回復薬ではない";

                                    if (canExecute) {
                                        let cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === actName);
                                        let baseCmdId = cmdInfo ? cmdInfo.id : actName; 
                                        chosenCommand = 'ground_' + baseCmdId; 
                                        s.player._targetGroundItem = groundItem;
                                        groundItem._visited = true; 
                                        thoughtLog = `作戦【${currentTacticName}】：足元の ${eff.logName} に対して「${actName}」を実行する！`; break;
                                    } else {
                                        window.addDungeonLog(`💭 思考キャンセル：足元のアイテムが${failReason}ため「${actName}」を諦めた。`, '#757575');
                                    }
                                }
                            }
                            // ★追加：スタック（道がふさがっている）時の打開ロジック（指揮官の指示がある場合のみ発動）
                            else if (
                                (rule.condition === 'path_blocked' && actName === 'なげる') ||
                                (rule.condition === 'path_blocked' && actName === 'つかう') || // ★追加：「つかう」も打開ロジックとして認める！
                                ((rule.condition === 'in_room' || rule.condition === 'unexplored_exist') && actName === 'つかう')
                            ) {
                                // 目的地（未探索エリア、なければ階段）を決定
                                let targetFn = null;
                                let hasUnexplored = false;
                                for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (!s.visited[ry][rx] && s.grid[ry][rx] !== 1) { hasUnexplored = true; break; } } if (hasUnexplored) break; }
                                
                                if (hasUnexplored) {
                                    targetFn = (x, y) => s.grid[y][x] !== 1 && (!s.visited || !s.visited[y][x]);
                                } else {
                                    let stairX = -1, stairY = -1;
                                    for(let ry=0; ry<s.mapHeight; ry++) { for(let rx=0; rx<s.mapWidth; rx++) { if (s.grid[ry][rx] === 2 && s.visited && s.visited[ry][rx]) { stairX = rx; stairY = ry; break; } } if (stairX !== -1) break; }
                                    if (stairX !== -1) targetFn = (x, y) => x === stairX && y === stairY;
                                }

                                if (targetFn) {
                                    // ★大修正：window.getSmartNextStepではなく、ローカルのgetSmartNextStepを呼ぶ！
                                    let normalStep = getSmartNextStep(s.player.x, s.player.y, targetFn, false, false); // 通常のルート
                                    let forceStep  = getSmartNextStep(s.player.x, s.player.y, targetFn, false, true);  // ★追加：水脈や壁を「無視」した強行ルート

                                    // 通常の道はないが、障害物を無視すれば道がある＝「罠や水脈、壁で道が完全にふさがっている（スタック）」と判定！
                                    if (!normalStep && forceStep) {
                                        let targetDir = '';
                                        if (unsafeStep.x > s.player.x) targetDir = 'right';
                                        else if (unsafeStep.x < s.player.x) targetDir = 'left';
                                        else if (unsafeStep.y > s.player.y) targetDir = 'down';
                                        else if (unsafeStep.y < s.player.y) targetDir = 'up';

                                        let bestItemIdx = -1;
                                        for (let i = 0; i < s.player.tempInventory.length; i++) {
                                            let itemId = s.player.tempInventory[i];
                                            let parsed = window.parseItemString(itemId);
                                            let effect = window.getDungeonItemEffect(itemId);
                                            
                                            // 打開用の杖を探す
                                            if (parsed.baseId.includes('wand')) {
                                                // 指示が「つかう」なら回数1以上、「なげる」なら回数0の杖のみを厳格にピックアップ
                                                if (actName === 'つかう' && effect.charges > 0) { bestItemIdx = i; break; }
                                                if (actName === 'なげる' && effect.charges <= 0) { bestItemIdx = i; break; }
                                            }
                                        }

                                        if (bestItemIdx !== -1 && targetDir !== '') {
                                            s.player.face = targetDir; // 障害物の方向を向く
                                            chosenCommand = actName === 'つかう' ? 'use' : 'throw';
                                            s.player._bestItemIdx = bestItemIdx;   // つかう用変数
                                            s.player._targetItemIdx = bestItemIdx; // なげる用変数
                                            let itemName = window.getDungeonItemEffect(s.player.tempInventory[bestItemIdx]).name;
                                            thoughtLog = `作戦【${currentTacticName}】：道がふさがっている！障害物へ向けて ${itemName} を「${actName}」し、打開を試みる！`;
                                            break;
                                        }
                                    }
                                }
                                // スタックしていない、または該当する杖がない場合は、通常の「つかう/なげる」に誤爆しないようスキップする
                                continue; 
                            }
                            else {
                                // 通常のコマンド実行可否判定
                                let cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === actName);
                                if (cmdInfo && validCmdIds.includes(cmdInfo.id)) {
                                    let canDo = true;
                                    let failReason = "";
                                    let silentFail = false; // ★新規追加：自明な失敗によるログスパムを防止するフラグ

                                    if (['eat', 'use', 'throw', 'put_down'].includes(cmdInfo.id) && (!s.player.tempInventory || s.player.tempInventory.length === 0)) { canDo = false; failReason = "カバンが空だった"; silentFail = true; }
                                    
                                    // ★追加：そうび、ごうせいの実行可否（在庫）チェック！無い場合はフォールバックさせる
                                    if (cmdInfo.id === 'equip') {
                                        let hasEquipable = s.player.tempInventory && s.player.tempInventory.some(i => {
                                            let e = window.getDungeonItemEffect(i);
                                            return (!s.player.equipWeapon && (e.equipType === 'weapon' || e.isWeapon)) ||
                                                   (!s.player.equipShield && (e.equipType === 'shield' || e.isShield)) ||
                                                   (!s.player.equipArmor && e.equipType === 'armor') ||
                                                   (!s.player.equipAccessory && e.equipType === 'accessory');
                                        });
                                        if (!hasEquipable) { canDo = false; failReason = "装備できるものがなかった"; silentFail = true; }
                                    }
                                    if (cmdInfo.id === 'synthesize') {
                                        if (s.player._synthCacheTurn !== s.turnCount) window.calculateBestSynth(s);
                                        if (!s.player._bestSameSynth && !s.player._bestDiffSynth) { canDo = false; failReason = "合成できる組み合わせがなかった"; silentFail = true; }
                                    }

                                    // ==========================================
                                    // ★新規追加：「おく」「なげる」作戦が選ばれた時、不要なアイテム（ゴミ）を優先的に選別する！
                                    // ==========================================
                                    if (cmdInfo.id === 'put_down' || cmdInfo.id === 'throw') {
                                        let allEquippedTraits = [];
                                        ['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
                                            if (s.player[slot]) allEquippedTraits.push(...window.getDungeonItemEffect(s.player[slot]).traits);
                                        });

                                        let bestTrashIdx = -1;
                                        let highestTrashScore = -999;

                                        for (let i = 0; i < s.player.tempInventory.length; i++) {
                                            let itemId = s.player.tempInventory[i];
                                            let effect = window.getDungeonItemEffect(itemId);
                                            let parsed = window.parseItemString(itemId);
                                            let trashScore = 0;

                                            // 1. 使用用途がないアイテム（超優先ゴミ）
                                            if (effect.logName.includes('師匠のお弁当') || effect.logName.includes('達人の秘伝書')) trashScore += 1000;
                                            
                                            // 2. 呪われた未装備アイテム（超優先ゴミ）
                                            if (effect.traits.includes('curse')) trashScore += 800;

                                            // 3. 回数0の杖（印が合成済みなら特大ゴミ、未合成でも優先度高）
                                            if (parsed.baseId.includes('wand') && effect.charges <= 0) {
                                                if (effect.traits.some(t => allEquippedTraits.includes(t))) trashScore += 600;
                                                else trashScore += 400; 
                                            }

                                            // 4. 同じ効果＆既に効果として合成済みのアクセサリ
                                            if (effect.equipType === 'accessory') {
                                                let alreadyHasTrait = effect.traits.some(t => allEquippedTraits.includes(t));
                                                let dupCount = s.player.tempInventory.filter(k => window.parseItemString(k).baseId === parsed.baseId).length;
                                                if (alreadyHasTrait || dupCount >= 2) trashScore += 500;
                                            }

                                            // 5. フォールバック（どうしても捨てる必要がある場合の優先度）
                                            if (parsed.baseId === 'item_scroll_wet') trashScore += 300;
                                            else if (parsed.baseId === 'herb' && s.player.hp >= s.player.maxHp) trashScore += 10; 
                                            else if (effect.isConsumable) trashScore += 5; // 装備品よりは消費アイテムを捨てる
                                            else trashScore += 1; // 装備品はなるべく捨てない

                                            if (trashScore > highestTrashScore) {
                                                highestTrashScore = trashScore;
                                                bestTrashIdx = i;
                                            }
                                        }

                                        if (bestTrashIdx !== -1) {
                                            s.player._targetItemIdx = bestTrashIdx;
                                            s.player._trashTargetName = window.getDungeonItemEffect(s.player.tempInventory[bestTrashIdx]).name;
                                        } else {
                                            canDo = false; failReason = "捨てるべき不要なアイテムがなかった"; silentFail = true;
                                        }
                                    }

                                    // ★新規追加：「つかう」「たべる」「かいふく」が強制されたときの無駄撃ち防止＆対象アイテム選定
                                    if (canDo && (cmdInfo.id === 'use' || cmdInfo.id === 'eat' || cmdInfo.id === 'heal')) {
                                        let bestIdx = -1;
                                        let highestScore = -9999;
                                        let activeTraitsForScore = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
                                        
                                        for (let i = 0; i < s.player.tempInventory.length; i++) {
                                            let itemId = s.player.tempInventory[i];
                                            let effect = window.getDungeonItemEffect(itemId);
                                            let parsed = window.parseItemString(itemId);
                                            let bId = parsed.baseId;
                                            
                                            // ▼ ここから修正 ▼
                                            let isFoodObj = bId === 'herb' || bId.startsWith('herb_') || bId.includes('berry') || bId.includes('seed') || bId === 'item_bread';
                                            let isMagicObj = bId.includes('wand') || bId.includes('scroll');

                                            // 用途不適合ならスキップ（草は使わない、魔法は食べない）
                                            if (cmdInfo.id === 'eat' && !isFoodObj) continue; 
                                            if (cmdInfo.id === 'heal' && (!isFoodObj || effect.hp <= 0)) continue;
                                            if (cmdInfo.id === 'use' && !isMagicObj) continue;
                                            // ▲ ここまで修正 ▲
                                            
                                            // 魔法の杖で回数0なら絶対に「つかう」候補にしない（無限素振りバグ防止）
                                            if (cmdInfo.id === 'use' && bId.includes('wand') && effect.charges <= 0) continue;
                                            
                                            let score = 0;
                                            let isUnid = s.sessionItemDict && s.sessionItemDict[bId] && !s.aiMemory.identified.includes(bId);
                                            let tName = s.aiMemory && s.aiMemory.tempNames[bId];
                                            let isTrulyUnid = isUnid && (!tName || tName.startsWith("謎の"));
                                            
                                            if (isTrulyUnid) {
                                                score += 1000; // まったく分からない未識別の実験は最優先
                                            } else {
                                                // 識別済み（または「火の杖？」など正体がほぼ判明している）アイテムの無駄遣い防止
                                                if (cmdInfo.id === 'use') {
                                                    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && !e.isInvisible);
                                                    
                                                    // ★新規追加：すでに眠り・混乱・麻痺・石化している敵は「脅威」から除外する！（死体蹴り防止）
                                                    let activeEnemies = visibleEnemies.filter(e => !(e.status.sleep > 0) && !(e.status.confusion > 0) && !(e.status.paralyzed > 0) && !(e.status.petrified > 0));

                                                    if (activeEnemies.length === 0) {
                                                        score -= 5000; // 脅威がいない（または全員無力化済み）なら絶対に無駄撃ちしない！
                                                    } else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe') || effect.traits.includes('seal_aoe')) {
                                                        if (activeEnemies.length >= 2) {
                                                            score += 2000; // 動ける敵が2体以上いる時だけ全体巻物を読む
                                                        } else {
                                                            score -= 5000; // 1体なら巻物はもったいないので温存する
                                                        }
                                                    } else if (effect.traits.includes('fire_damage') || effect.traits.includes('blow_back') || effect.traits.includes('freeze_effect') || effect.traits.includes('swap_pos')) {
                                                        // 杖は「脅威となる敵が隣接している」か「HPが半分以下でピンチ」の時だけ振る（遠くから連打しない）
                                                        let adjacentActive = activeEnemies.filter(e => Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                                                        if (adjacentActive.length > 0 || (s.player.hp / s.player.maxHp < 0.5)) {
                                                            score += 1500; 
                                                        } else {
                                                            score -= 5000; 
                                                        }
                                                    } else if (effect.traits.includes('warp_self')) {
                                                        if (activeEnemies.length >= 2 || (s.player.hp / s.player.maxHp < 0.4)) score += 1000;
                                                        else score -= 5000;
                                                    } else {
                                                        score -= 5000;
                                                    }
                                                } else if (cmdInfo.id === 'eat' || cmdInfo.id === 'heal') {
                                                    let hpRate = s.player.hp / s.player.maxHp;
                                                    let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);
                                                    let hungerRate = s.player.hunger / maxH;
                                                    
                                                    if (bId === 'item_bread' && hungerRate >= 1.0) score += 600; // パンで最大満腹度アップ狙い
                                                    else if (bId === 'herb' && hpRate >= 1.0 && activeTraitsForScore.includes('大地の恵み')) score += 600; // 草で最大HPアップ狙い
                                                    else if (effect.traits.includes('level_up')) score += 800; // しあわせの種
                                                    else if (effect.hp > 0 && hpRate < 1.0) score += 500;
                                                    else if (effect.hunger > 0 && hungerRate < 1.0) score += 500;
                                                    else score -= 5000; // 満タンの時に普通の草やパンを無駄食いしない
                                                }
                                            }
                                            
                                            let scoreLimit = -1000;
                                            // 持ち物がいっぱいで整理が目的の作戦なら、無駄遣いでも消費を優先させる！
                                            if (rule.condition === 'inventory_full') scoreLimit = -9999;

                                            if (score > scoreLimit && score > highestScore) { // スコアが著しく低い（無駄遣い）ものは選ばない
                                                highestScore = score;
                                                bestIdx = i;
                                            }
                                        }
                                        
                                        if (bestIdx !== -1) {
                                            s.player._bestItemIdx = bestIdx;
                                        } else {
                                            canDo = false; failReason = "状況に適したアイテムがなかった（無駄撃ち防止）"; silentFail = true;
                                        }
                                    }

                                    if (canDo) {
                                        chosenCommand = cmdInfo.id;
                                        if (cmdInfo.id === 'put_down' || cmdInfo.id === 'throw') {
                                            thoughtLog = `作戦【${currentTacticName}】：カバン整理のため、不要な ${s.player._trashTargetName} に対して「${actName}」を実行！`;
                                        } else {
                                            thoughtLog = `作戦【${currentTacticName}】：条件を満たし「${actName}」を実行！`; 
                                        }
                                        break;
                                    } else {
                                        if (!silentFail) {
                                            window.addDungeonLog(`💭 思考キャンセル：「${actName}」を試みたが、${failReason}ため次を検討。`, '#757575');
                                        }
                                    }
                                } else if (!validCmdIds.includes(cmdInfo?.id)) {
                                    window.addDungeonLog(`💭 思考キャンセル：「${actName}」はまだ閃いていないため実行できない。`, '#757575');
                                }
                            }
                        }
                        
                        // ★大修正：行動が決定した場合のみ、作戦の評価を終了する（フォールバックの完全対応）
                        if (chosenCommand) break; 
                    }
                }
            }
            
            // ⚠️ プレイヤーの責任：何も実行できなかった場合の立ち往生ペナルティ
            if (!chosenCommand) {
                window.addDungeonLog(`💦 ${aiName} はどうしていいか分からず、立ち往生している...！`, '#ff5252');
                chosenCommand = 'skip';
                thoughtLog = `⚠️ 作戦【${currentTacticName}】に欠陥があり、動けません！`;
                s.player._activeRuleIndex = -1; // ★追加：UIのテレメトリハイライトを消去
            }
        }
    }
    // ==========================================

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
                let isMagic = baseItemKey.includes('scroll') || baseItemKey.includes('wand'); 
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
                    else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe') || effect.traits.includes('seal_aoe')) { 
                        let activeVisible = visibleEnemies.filter(e => !(e.status.sleep > 0) && !(e.status.confusion > 0) && !(e.status.paralyzed > 0) && !(e.status.petrified > 0));
                        let activeAdjacent = adjacentEnemies.filter(e => !(e.status.sleep > 0) && !(e.status.confusion > 0) && !(e.status.paralyzed > 0) && !(e.status.petrified > 0));
                        if (activeVisible.length >= 3 || activeAdjacent.length >= 2) score = 90; 
                        else if (activeVisible.length >= 2) score = 75; 
                        else score = -1; // 脅威がいない（全員無力化済み）場合は温存
                    } 
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
                if (s.player._synthCacheTurn !== s.turnCount) window.calculateBestSynth(s);
                synthInfo = s.player._bestSameSynth || s.player._bestDiffSynth;
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
                    // ★追加：目標レベルに達しているかどうかで、ストイックなAIのセリフを分岐させる
                    if (s.player.level < targetLevel) {
                        thoughtLog = `探索完了。目標Lv${targetLevel}まで修練する！`; 
                    } else {
                        thoughtLog = `探索完了。風が吹くまで限界まで修練する！`; 
                    }
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
                        let maxInv = s.player.maxInventory || 20; // ★上限を動的に取得
                        if (iqRank >= 1 && s.player.tempInventory.length < maxInv && s.items) {
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

                        // ★追加：通路での「反復横跳び防止 ＆ 迎撃マクロ」
                        if (chosenCommand && chosenCommand.startsWith('move_')) {
                            let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 
                            let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y) && !e.isInvisible);
                            let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1);
                            
                            // 通路にいて、視界に敵がいるが隣接していない場合
                            if (isCorridor && visibleEnemies.length > 0 && adjacentEnemies.length === 0) {
                                // ★修正：一定ターン待っても敵が来ない（遠距離攻撃で削られ続ける）なら、突撃フラグを立てて部屋に突入する！
                                s.player._waitCount = (s.player._waitCount || 0) + 1;
                                if (s.player._waitCount > 3) {
                                    window.addDungeonLog(`💢 ${aiName} は遠隔攻撃にしびれを切らし、突撃を決意した！`, '#ff5252');
                                    s.player._commitFight = 6;
                                    s.player._waitCount = 0;
                                    // 突撃フラグが立ったため、移動コマンドをキャンセルせずに続行させる
                                } else if (s.player._commitFight > 0) {
                                    s.player._waitCount = 0; // すでに突撃中なら待機せずに進む
                                } else {
                                    // 部屋に戻ろうとする移動コマンドをキャンセルし、その場で素振りして敵が寄ってくるのを待つ！
                                    chosenCommand = 'attack';
                                    thoughtLog = `作戦【${s.player.currentTacticName || 'AIにまかせる'}】：通路へ退避完了！敵の追撃を警戒し、待ち構えている！`;
                                }
                            } else {
                                s.player._waitCount = 0; // 敵がいない、または隣接した場合はカウントリセット
                            }
                        }
                    }
                }
            }

            if (!chosenCommand) {
                let smartValidCmds = validCmdIds.filter(cmd => {
                    if (cmd === 'eat') return s.player.tempInventory.some(i => { let bId = window.parseItemString(i).baseId; let e = window.getDungeonItemEffect(i); return e.isConsumable && !bId.includes('scroll') && !bId.includes('wand'); });
                    if (cmd === 'use') return s.player.tempInventory.some(i => { let bId = window.parseItemString(i).baseId; return bId.includes('scroll') || bId.includes('wand'); });
                    if (cmd === 'heal') return s.player.tempInventory.some(i => { let bId = window.parseItemString(i).baseId; let e = window.getDungeonItemEffect(i); return e.isConsumable && !bId.includes('scroll') && !bId.includes('wand') && e.hp > 0; });
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
        let checkCmdId = chosenCommand.startsWith('ground_') ? chosenCommand.replace('ground_', '') : chosenCommand;
        const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === checkCmdId); 
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
        s.player._sightUp = false; // ★追加：目薬草の効果（およびその他の一時フロア効果）を確実にリセット
        
        // ==========================================
        // ★完全修正：階を降りたら、前世の「安全確認メモリ」を完全に消去する！
        // ==========================================
        s._trapCheckedTiles = {}; 
        s.player._trapCheckToggle = false; 

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
                window.addDungeonLog(`🔍 ${aiName} は「しらべる」を使って ${window.getDungeonItemEffect(itemId).logName} であることを見抜いた！`, '#FFD700');
            }
        } s.player._identifyTargetIdx = null;
    }
    else if (chosenCommand === 'flee') {
        if (enemyInSight) {
            const canFlee = (tx, ty) => tx >= 0 && tx < s.mapWidth && ty >= 0 && ty < s.mapHeight && s.grid[ty][tx] !== 1 && (isFlying || (s.grid[ty][tx] !== 4 && s.grid[ty][tx] !== 10)) && (!s.traps || !s.traps.some(t => t.visible && t.x === tx && t.y === ty)) && !s.enemies.some(e => e.hp > 0 && e.x === tx && e.y === ty); 
            let moved = false;
            // まずは敵から遠ざかる方向を試す
            if (s.player.x < enemyInSight.x && canFlee(s.player.x - 1, s.player.y)) { newX--; s.player.face = 'left'; moved = true; }
            else if (s.player.x > enemyInSight.x && canFlee(s.player.x + 1, s.player.y)) { newX++; s.player.face = 'right'; moved = true; }
            else if (s.player.y < enemyInSight.y && canFlee(s.player.x, s.player.y - 1)) { newY--; s.player.face = 'up'; moved = true; }
            else if (s.player.y > enemyInSight.y && canFlee(s.player.x, s.player.y + 1)) { newY++; s.player.face = 'down'; moved = true; }
            
            // 遠ざかるのが無理なら、横に避ける
            if (!moved) {
                if (canFlee(s.player.x - 1, s.player.y)) { newX--; s.player.face = 'left'; moved = true; }
                else if (canFlee(s.player.x + 1, s.player.y)) { newX++; s.player.face = 'right'; moved = true; }
                else if (canFlee(s.player.x, s.player.y - 1)) { newY--; s.player.face = 'up'; moved = true; }
                else if (canFlee(s.player.x, s.player.y + 1)) { newY++; s.player.face = 'down'; moved = true; }
            }
            if (moved && !isConfused) window.addDungeonLog(`敵を避けるように走った！`, '#00BCD4');
            else if (!isConfused) window.addDungeonLog(`逃げ道が塞がれている！`, '#FF5252');
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
                        let itm = s.items[itemIdx]; 
                        
                        // 生成時やドロップ時に回数を持たせるように改修したため、拾った瞬間のズルい魔力充填は削除します！
                        let pItem = window.parseItemString(itm.key);
                        let eff = window.getDungeonItemEffect(itm.key);

                        // ★ 閃き：アイテムに接触したことで関連コマンドを閃く！
                        if (typeof window.triggerDungeonInspiration === 'function') {
                            if (eff.equipType) window.triggerDungeonInspiration('equip');
                            if (eff.isConsumable && eff.traits.length === 0) window.triggerDungeonInspiration('eat'); // 草・パン
                            if (eff.isConsumable && eff.traits.length > 0) window.triggerDungeonInspiration('use');   // 杖・巻物
                        }

                        let maxInv = s.player.maxInventory || 20; // ★上限を動的に取得
                        
                        // ★新規追加：プレイヤーの作戦に「足元アイテム」の指示があり、条件を満たす場合はオートピックを保留する
                        let shouldRetainOnGround = false;
                        let activeTactic = (ai.dungeonTactics || []).find(t => t.name === s.player.currentTacticName);
                        if (activeTactic && activeTactic.rules && !itm._visited) {
                            let eff = window.getDungeonItemEffect(itm.key);
                            let bId = window.parseItemString(itm.key).baseId;
                            let isFoodObj = bId === 'herb' || bId.startsWith('herb_') || bId.includes('berry') || bId.includes('seed') || bId === 'item_bread';
                            let isEquipObj = eff.equipType !== null || eff.isWeapon || eff.isShield;
                            let tName = s.aiMemory && s.aiMemory.tempNames[bId];
                            let isUnidConsumable = s.sessionItemDict && s.sessionItemDict[bId] && s.aiMemory && !s.aiMemory.identified.includes(bId) && (!tName || tName.startsWith("謎の"));
                            let isUnidEquip = isEquipObj && !eff.isStatsKnown;
                            let isUnidObj = isUnidConsumable || isUnidEquip;
                            
                            for (let r of activeTactic.rules) {
                                if (r.condition.startsWith('on_item_')) {
                                    let match = (r.condition === 'on_item_any') || 
                                                (r.condition === 'on_item_food' && isFoodObj) || 
                                                (r.condition === 'on_item_equip' && isEquipObj) || 
                                                (r.condition === 'on_item_unidentified' && isUnidObj);
                                    if (match) {
                                        let acts = [r.action1, r.action2].filter(a => a);
                                        if (acts.some(a => ['たべる', 'かいふく', 'つかう', 'そうび', 'しらべる', 'なまえ'].includes(a))) {
                                            shouldRetainOnGround = true; break;
                                        }
                                    }
                                }
                            }
                        }

                        // ★完全修正：アイテム側、プレイヤー側、作戦による保留をすべて判定！
                        let canPick = s.player.tempInventory.length < maxInv && !itm._preventAutoPick && !s.player._preventAutoPick && !shouldRetainOnGround;
                        
                        if (canPick) {
                            s.player.tempInventory.push(itm.key); window.addDungeonLog(`足元から ${eff.logName} を拾った！`, '#4CAF50'); s.items.splice(itemIdx, 1);
                        } else {
                            if (s.player.tempInventory.length >= maxInv) {
                                window.addDungeonLog(`カバンがいっぱいで ${eff.logName} を拾えない！`, '#FF9800'); 
                                
                                // ★追加：カバンがいっぱいで拾えなかった場合、AIに「一度上に乗って確認した」という記憶を焼き付ける
                                itm._visited = true; 
                                
                                // ★ 閃き：持ちきれない体験から整理系コマンドを閃く
                                if (typeof window.triggerDungeonInspiration === 'function') {
                                    window.triggerDungeonInspiration('put_down');
                                    window.triggerDungeonInspiration('throw');
                                    window.triggerDungeonInspiration('synthesize');
                                }
                            } else {
                                // ★追加：意図的に拾わなかった（ただ乗っただけ、または捨てたゴミの上を通った）場合
                                window.addDungeonLog(`足元に ${eff.logName} があるが、今は拾わずにやり過ごした。`, '#aaa');
                            }
                        }
                        
                        // ★追加：1ターン分だけ「拾わない」状態を維持したら、次ターンのために解除しておく
                        s.player._preventAutoPick = false;
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
                        let defTraits = [];
                        if (s.player.equipShield) defTraits.push(...window.getDungeonItemEffect(s.player.equipShield).traits);
                        if (s.player.equipArmor) defTraits.push(...window.getDungeonItemEffect(s.player.equipArmor).traits);

                        if (trap.type === 'poison') {
                            if (s.player.skin && s.player.skin.includes('spirit_type1')) {
                                window.addDungeonLog(`🍄 毒矢が刺さったが、毒素体質により逆に体力が回復した！`, '#4CAF50');
                                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 10); if (typeof window.showDungeonHealEffect === 'function') window.showDungeonHealEffect(s.player.x, s.player.y, 10);
                            } else if (defTraits.includes('anti_poison')) {
                                window.addDungeonLog(`☠️ 毒矢が刺さったが、[抗]の印が毒を防いだ！`, '#00BCD4');
                                s.player.damageAnim = true; s.player.hp -= 5;
                            } else { window.addDungeonLog(`☠️ 毒矢の罠！ 毒状態になった！`, '#FF5252'); s.player.damageAnim = true; s.player.hp -= 5; s.player.status.poison = 10; }
                            window.updateDungeonUI();
                        } 
                        else if (trap.type === 'mine') { 
                            let dmg = Math.floor(s.player.hp / 2);
                            if (activeTraits.includes('不朽の硬度')) { dmg = Math.floor(dmg / 2); window.addDungeonLog(`💣 地雷が大爆発！しかし 不朽の硬度 でダメージを抑えた！`, '#00BCD4'); } 
                            else { window.addDungeonLog(`💣 地雷が大爆発！(HPが半分になった！)`, '#FF5252'); }
                            s.player.hp -= dmg; s.player.damageAnim = true; if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "BOOM", true);
                        }
                        else if (trap.type === 'blind') { 
                            if (defTraits.includes('anti_blind')) {
                                window.addDungeonLog(`泥水を被ったが、[明]の印が目を保護した！`, '#00BCD4');
                            } else {
                                window.addDungeonLog(`泥水を被り、視界が奪われた！`, '#9C27B0'); s.player.status.blind += 15; 
                            }
                        }
                        else if (trap.type === 'bear_trap') { 
                            if (defTraits.includes('anti_paralyze')) {
                                window.addDungeonLog(`トラバサミに挟まれたが、[動]の印が麻痺を防いだ！`, '#00BCD4'); s.player.hp -= 10; s.player.damageAnim = true;
                            } else {
                                window.addDungeonLog(`トラバサミに引っかかり、足が痺れた！`, '#FF9800'); s.player.status.paralyzed += 3; s.player.hp -= 10; s.player.damageAnim = true; 
                            }
                        }
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
    } else {
        // ★新規追加：移動しなかったターン（足踏み、攻撃、足元を調べた後など）でも、足元に拾えるアイテムがあれば拾う！
        if (s.items && !chosenCommand.startsWith('ground_')) {
            let itemIdx = s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y && !i._discarded);
            if (itemIdx !== -1) {
                let itm = s.items[itemIdx];
                let maxInv = s.player.maxInventory || 20;
                let canPick = s.player.tempInventory.length < maxInv && !itm._preventAutoPick && !s.player._preventAutoPick;
                if (canPick) {
                    let eff = window.getDungeonItemEffect(itm.key);
                    s.player.tempInventory.push(itm.key); 
                    window.addDungeonLog(`足元から ${eff.logName} を拾った！`, '#4CAF50'); 
                    s.items.splice(itemIdx, 1);
                    if (typeof window.triggerDungeonInspiration === 'function') {
                        if (eff.equipType) window.triggerDungeonInspiration('equip');
                        if (eff.isConsumable && eff.traits.length === 0) window.triggerDungeonInspiration('eat');
                        if (eff.isConsumable && eff.traits.length > 0) window.triggerDungeonInspiration('use');
                    }
                }
            }
        }
        s.player._preventAutoPick = false;
    } // ← ③ 移動判定全体を閉じる
    // ★追加：足元アイテムの直接装備ロジック（システム側の吸収）
    if (chosenCommand === 'ground_equip') {
        let item = s.player._targetGroundItem;
        let isInvFull = s.player.tempInventory.length >= (s.player.maxInventory || 20);
        let eff = window.getDungeonItemEffect(item.key);
        let slotMap = { 'weapon': 'equipWeapon', 'shield': 'equipShield', 'armor': 'equipArmor', 'accessory': 'equipAccessory' };
        let slotName = slotMap[eff.equipType];
        let currentEquipId = s.player[slotName]; 
        
        if (isInvFull) {
            if (currentEquipId) {
                s.items.push({ key: currentEquipId, x: s.player.x, y: s.player.y });
                window.addDungeonLog(`足元の ${eff.logName} を装備し、${window.getDungeonItemEffect(currentEquipId).logName} を床に置いた！`, '#4CAF50');
            } else {
                let droppedKey = s.player.tempInventory.pop();
                s.items.push({ key: droppedKey, x: s.player.x, y: s.player.y });
                window.addDungeonLog(`足元の ${eff.logName} を装備し、代わりに ${window.getDungeonItemEffect(droppedKey).logName} を床に置いた！`, '#4CAF50');
            }
        } else {
            window.addDungeonLog(`足元の ${eff.logName} を装備した！`, '#4CAF50');
        }
        
        s.player[slotName] = item.key;
        s.aiMemory.knownEquips = s.aiMemory.knownEquips || [];
        if (!s.aiMemory.knownEquips.includes(item.key)) s.aiMemory.knownEquips.push(item.key);
        s.items = s.items.filter(i => i !== item); 
        s.player._targetGroundItem = null;

        // ★追加：未識別の装備を身に着けた瞬間に「しらべる」「なまえをつける」を閃く
        let bId = window.parseItemString(item.key).baseId;
        if (s.sessionItemDict && s.sessionItemDict[bId] && s.aiMemory && !s.aiMemory.identified.includes(bId)) {
            if (typeof window.triggerDungeonInspiration === 'function') {
                window.triggerDungeonInspiration('identify');
                window.triggerDungeonInspiration('name_item');
            }
        }

        // ★追加：呪われた装備を身に着けてしまった瞬間に「はずす」を閃く
        if (eff.traits.includes('curse') && typeof window.triggerDungeonInspiration === 'function') {
            window.addDungeonLog(`しかし ${eff.logName} は呪われており、体にガッチリと張り付いてしまった！`, '#9C27B0');
            window.triggerDungeonInspiration('unequip');
        }

        return 'equip_ground'; 
    }
    
    // ★追加：足元のアイテムを「しらべる」「なまえ」
    if (chosenCommand === 'ground_identify') {
        let item = s.player._targetGroundItem;
        let bId = window.parseItemString(item.key).baseId;
        if (!s.aiMemory.identified.includes(bId)) {
            s.aiMemory.identified.push(bId);
            window.addDungeonLog(`🔍 ${aiName} は足元のアイテムを調べ、${window.getDungeonItemEffect(item.key).logName} であることを見抜いた！`, '#FFD700');
        } else {
            window.addDungeonLog(`足元のアイテムはすでに ${window.getDungeonItemEffect(item.key).logName} であることが分かっている。`, '#aaa');
        }
        let maxInv = s.player.maxInventory || 20;
        if (s.player.tempInventory.length < maxInv) {
            s.player.tempInventory.push(item.key);
            window.addDungeonLog(`そして ${window.getDungeonItemEffect(item.key).logName} をカバンにしまった。`, '#4CAF50');
            s.items = s.items.filter(i => i !== item);
        }
        s.player._targetGroundItem = null;
        return 'continue';
    }
    if (chosenCommand === 'ground_name_item') {
        let item = s.player._targetGroundItem;
        let bId = window.parseItemString(item.key).baseId;
        if (!s.aiMemory.identified.includes(bId) && !s.aiMemory.tempNames[bId]) {
            s.aiMemory.tempNames[bId] = "謎のアイテム";
            window.addDungeonLog(`💡 AIは足元のアイテムを【謎のアイテム？】と名付けた！`, '#FFD700');
        } else {
            window.addDungeonLog(`足元のアイテムはすでに名前がついているか、識別済みだ。`, '#aaa');
        }
        let maxInv = s.player.maxInventory || 20;
        if (s.player.tempInventory.length < maxInv) {
            s.player.tempInventory.push(item.key);
            window.addDungeonLog(`そして ${window.getDungeonItemEffect(item.key).logName} をカバンにしまった。`, '#4CAF50');
            s.items = s.items.filter(i => i !== item);
        }
        s.player._targetGroundItem = null;
        return 'continue';
    }
    // ★追加：カバンの中のアイテムに名前をつける
    if (chosenCommand === 'name_item') {
        let idx = s.player._nameTargetIdx;
        if (idx !== undefined && s.player.tempInventory[idx]) {
            let itemId = s.player.tempInventory[idx]; 
            let bId = window.parseItemString(itemId).baseId;
            if (!s.aiMemory.identified.includes(bId) && !s.aiMemory.tempNames[bId]) {
                let tName = bId.includes('scroll') ? "謎の巻物" : bId.includes('wand') ? "謎の杖" : bId === 'herb' || bId.includes('seed') ? "謎の草" : "謎のアイテム";
                s.aiMemory.tempNames[bId] = tName;
                window.addDungeonLog(`💡 AIは手持ちのアイテムを【${tName}？】ととりあえず名付けた！`, '#FFD700');
            } else {
                window.addDungeonLog(`そのアイテムはすでに名前がついているか、識別済みだ。`, '#aaa');
            }
        }
        s.player._nameTargetIdx = null;
        return 'continue';
    }
    if (chosenCommand === 'attack') {
        // ==========================================
        // ★大改修：罠警戒の素振りの時は、オートエイム（勝手な振り向き）を禁止し、向いている方向の敵だけを殴る！
        // ==========================================
        let targetEnemy = enemyAdjacent;
        
        // ▼ 新規追加：敵が隣接している場合は、素振りフラグを強制解除してオートエイム（戦闘）を優先する！
        if (enemyAdjacent) {
            s.player._trapCheckToggle = false;
            // ★さらに追加：敵を殴るのに夢中で「罠チェック」はできていないため、保留していた安全マスの記憶を消去する！
            s.player._pendingTrapCheckPos = null; 
        } else if (s.player._trapCheckToggle) {
            let tx = s.player.x, ty = s.player.y;
            if (s.player.face === 'up') ty--; else if (s.player.face === 'down') ty++; else if (s.player.face === 'left') tx--; else if (s.player.face === 'right') tx++;
            // 進行方向のマスにいる敵だけを攻撃対象に絞り込む
            targetEnemy = s.enemies.find(e => e.hp > 0 && e.x === tx && e.y === ty) || null;
        }

        if (targetEnemy && !isConfused) {
            // ★修正：enemyAdjacentをtargetEnemyに置き換え
            if (targetEnemy.x < s.player.x) s.player.face = 'left'; else if (targetEnemy.x > s.player.x) s.player.face = 'right';
            else if (targetEnemy.y < s.player.y) s.player.face = 'up'; else if (targetEnemy.y > s.player.y) s.player.face = 'down';
            s.player.attackAnim = true; 
            if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
            window.dealDungeonDamage(s.player, targetEnemy);
            let atkWait = targetEnemy.warpAnim ? 400 : 150; window.updateDungeonUI(); await sleep(atkWait);
            let wEff = s.player.equipWeapon ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
            // ▼ 修正：wEff.traits が存在するかどうかを && で追加チェック
            if (wEff && wEff.traits && wEff.traits.includes('double') && targetEnemy.hp > 0) { 
                let isBaseDouble = window.parseItemString(s.player.equipWeapon).baseId === 'item_sword_double';
                let logMsg = isBaseDouble ? `⚔️ 連撃の剣が発動！怒涛の連続攻撃！` : `⚔️ [連]の印が発動！怒涛の連続攻撃！`;
                window.addDungeonLog(logMsg, '#FFD700'); s.player.attackAnim = true; 
                window.dealDungeonDamage(s.player, targetEnemy); window.updateDungeonUI(); await sleep(150);
            }
            
            // ★追加：敵を殴ってしまったので、素振りによる安全確認は失敗
            s.player._pendingTrapCheckPos = null;
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
                
                // 混乱時は狙ったマスへの安全確認ができない
                s.player._pendingTrapCheckPos = null;
            } else { 
                window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); 
                
                // ★追加：本当に空振りできたので、保留していたマスの安全フラグを立てる！
                if (s.player._pendingTrapCheckPos) {
                    s._trapCheckedTiles[`${s.player._pendingTrapCheckPos.x},${s.player._pendingTrapCheckPos.y}`] = true;
                    s.player._pendingTrapCheckPos = null;
                }
            }
        }

        let tx = s.player.x; let ty = s.player.y;
        if (s.player.face === 'up') ty--; else if (s.player.face === 'down') ty++; else if (s.player.face === 'left') tx--; else if (s.player.face === 'right') tx++;
        if (s.traps) {
            let hiddenTrap = s.traps.find(t => t.x === tx && t.y === ty && !t.visible);
            if (hiddenTrap) { hiddenTrap.visible = true; window.addDungeonLog(`👀 目の前に隠された罠を発見した！`, '#FFD700'); }
        }
    } 
    else if (['heal', 'eat', 'use', 'ground_eat', 'ground_heal', 'ground_use'].includes(chosenCommand)) {
        let isGround = chosenCommand.startsWith('ground_');
        // 'ground_' のプレフィックスを外すだけで、元のコマンドIDに綺麗に戻ります
        let realCommand = isGround ? chosenCommand.replace('ground_', '') : chosenCommand;
        let targetItemId = isGround ? (s.player._targetGroundItem ? s.player._targetGroundItem.key : null) : s.player.tempInventory[s.player._bestItemIdx];

        if ((isGround && targetItemId) || (!isGround && typeof s.player._bestItemIdx === 'number' && s.player._bestItemIdx !== -1 && targetItemId)) {
            let itemId = targetItemId; 
            let effect = window.getDungeonItemEffect(itemId);
            let parsed = window.parseItemString(itemId); let baseId = parsed.baseId;
            let isUnidentified = s.sessionItemDict && s.sessionItemDict[baseId] && !s.aiMemory.identified.includes(baseId);
            let isMagicItem = baseId.includes('scroll') || baseId.includes('wand');
            let isOverTech = itemId.includes('wand') && activeTraits.includes('オーバーテクノロジー') && Math.random() < 0.25;

            chosenCommand = realCommand; // ★ 以降の巨大な判定ロジックを一切壊さず完全に流用する

            // ★追加：未識別アイテムを使用・消費した瞬間に「しらべる」「なまえをつける」を閃く
            if (isUnidentified && typeof window.triggerDungeonInspiration === 'function') {
                window.triggerDungeonInspiration('identify');
                window.triggerDungeonInspiration('name_item');
            }

            if (chosenCommand === 'eat' || chosenCommand === 'heal') {
                if (!effect.isConsumable && activeTraits.includes('ガラクタ吸収')) {
                    window.addDungeonLog(`⚙️ ${aiName} は ${effect.logName} をガリガリと噛み砕いて消化した！`, '#4CAF50');
                    s.player.hp = Math.min(s.player.maxHp, s.player.hp + 30); 
                    if (isGround) s.items = s.items.filter(i => i !== s.player._targetGroundItem); else s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                    return 'continue';
                }
                if (isMagicItem && !isUnidentified) { window.addDungeonLog(`${aiName} は ${effect.logName} を食べようとしたが、食べ物ではないことに気づいた！`, '#aaa'); s.player._bestItemIdx = -1; return 'continue'; }
                window.addDungeonLog(`${aiName} は ${effect.logName} を食べた！`, '#4CAF50');
                let limitBreakMsg = ""; 
                // ★ 種系特性：大地の恵み（HP満タンでなくても確率で最大HPアップ）
                let isHerbBreak = (baseId === 'herb' && s.player.hp >= s.player.maxHp);
                if (baseId === 'herb' && activeTraits.includes('大地の恵み') && s.player.hp < s.player.maxHp && Math.random() < 0.5) isHerbBreak = true; 
                
                if (isHerbBreak) { s.player.maxHp += 1; limitBreakMsg += `最大HPが ${s.player.maxHp} に！ `; }
                if (baseId === 'item_bread' && s.player.hunger >= maxH) { s.player.maxHunger = maxH + 5; limitBreakMsg += `最大満腹度が ${s.player.maxHunger} に！`; }
                if (limitBreakMsg !== "") window.addDungeonLog(`💪 上限突破！ ${limitBreakMsg}`, '#FF9800');
                if (effect.hp > 0 || effect.hunger > 0) window.addDungeonLog(`HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                
                // ▼ 新規追加：状態異常回復アイテムの効果発動
                if (effect.traits && effect.traits.includes('cure_poison')) {
                    s.player.status.poison = 0; window.addDungeonLog(`✨ 体から毒が完全に抜け去った！`, '#4CAF50');
                }
                if (effect.traits && effect.traits.includes('cure_confuse_sleep')) {
                    s.player.status.confusion = 0; s.player.status.sleep = 0; window.addDungeonLog(`✨ 頭がスッキリして正気を取り戻した！`, '#4CAF50');
                }
                if (effect.traits && effect.traits.includes('cure_blind_reveal_traps')) {
                    s.player.status.blind = 0; s.player._sightUp = true; // 階層リセット確認用フラグとして維持
                    if (s.traps) {
                        s.traps.forEach(t => t.visible = true); // ★フロアの全罠を可視化！
                    }
                    window.addDungeonLog(`✨ 目が冴え渡り、暗闇が晴れ、フロアの隠された罠をすべて見破った！`, '#00BCD4');
                }
                // ▼ 追加
                if (effect.traits && effect.traits.includes('cure_paralyze')) {
                    s.player.status.paralyzed = 0; window.addDungeonLog(`✨ 足の痺れが完全に消え去った！`, '#4CAF50');
                }

                // ★完全版適用：過去に構築された完璧なレベルアップ・ステータス底上げ処理
                if (effect.traits && effect.traits.includes('level_up')) {
                    let statMult = (s.mapType === 'skull' && activeTraits.includes('宇宙の樹')) ? 2 : 1;
                    // 通常の火力上昇+1に合わせ、竜の血ボーナスもスケールダウン
                    let pwrBonus = (s.mapType === 'skull' && activeTraits.includes('竜の血')) ? 2 : 1;

                    if (s.mapType === 'crystal') {
                        s.player.level = (s.player.level || 1) + 1; 
                        s.player.maxHp += 5; 
                        s.player.hp = s.player.maxHp; 
                        s.player.hunger = maxH; 
                        s.player.basePwr += 1;
                        window.addDungeonLog(`✨ 奇跡が起きた！Lv.${s.player.level}にレベルアップし、全回復した！`, '#E040FB');
                    } else {
                        // スカルダンジョン用のしあわせの種効果
                        s.player.maxHp += 5 * statMult; 
                        s.player.hp = s.player.maxHp; 
                        s.player.hunger = maxH; 
                        s.player.basePwr += pwrBonus * statMult;
                        
                        if (window.DUNGEON_STATE.player.intel) window.DUNGEON_STATE.player.intel += 1 * statMult;
                        if (window.DUNGEON_STATE.player.speed) window.DUNGEON_STATE.player.speed += 1 * statMult;

                        window.addDungeonLog(`✨ 奇跡が起きた！能力が底上げされ、全回復した！`, '#E040FB');
                        if (statMult > 1) window.addDungeonLog(`🌌 宇宙の樹の力で、ステータス上昇値が2倍になった！`, '#00BCD4');
                        if (activeTraits.includes('竜の血')) window.addDungeonLog(`🐉 竜の血がたぎり、活力が追加で上昇した！`, '#FF5252');
                    }
                    s.player.levelUpAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');

                    // ★追加：HP回復等がない草は基本の消費ロジックから漏れる恐れがあるため、ここで明示的にカバンから消す
                    if (!(effect.hp > 0 || effect.hunger > 0)) {
                        s.player.tempInventory.splice(s.player._bestItemIdx, 1);
                    }
                }

                // ★大修正：草や食べ物は「使えば完全に識別される」王道仕様！
                if (isUnidentified) {
                    s.aiMemory.identified.push(baseId);
                    window.addDungeonLog(`💡 AIはこのアイテムが ${effect.logName} であることを完全に理解した！`, '#FFD700');
                }

                if (isGround) s.items = s.items.filter(i => i !== s.player._targetGroundItem); else s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); s.player.hunger = Math.min(maxH, s.player.hunger + effect.hunger); 
            } 
            else if (chosenCommand === 'use') {
                if (!isMagicItem && !isUnidentified) { window.addDungeonLog(`${aiName} は ${effect.logName} を使おうとしたが、使い方が分からなかった！`, '#aaa'); s.player._bestItemIdx = -1; return 'continue'; }
                if (itemId.includes('wand') && effect.charges <= 0) { window.addDungeonLog(`${aiName} は ${effect.logName} を振ったが、魔力が残っていなかった！`, '#aaa'); window.updateDungeonUI(); return 'continue'; }

                window.addDungeonLog(`${aiName} は ${effect.logName} を使った！`, '#00BCD4'); 
                if (activeTraits.includes('魔力飛行')) s.player._magicFlight = true;
                
                if (itemId.includes('wand')) {
                    if (isOverTech) { window.addDungeonLog(`✨ オーバーテクノロジー！ 杖の魔力を消費せずに放つ！`, '#FFD700'); } 
                    else { 
                        if (!isGround) {
                            let nextChg = parsed.plus - 1;
                            s.player.tempInventory[s.player._bestItemIdx] = `${parsed.baseId}${nextChg >= 0 ? '_+' : '_'}${nextChg}`; 
                        }
                    }
                } else {
                    if (isGround) s.items = s.items.filter(i => i !== s.player._targetGroundItem); else s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                }
            }
            
            let effectTriggered = false;

            // ==========================================
            // ★新規追加：識別の巻物の効果（自動判定＆ラッキー全鑑定）
            // ==========================================
            if (baseId === 'item_scroll_identify' && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');

                // カバンの中の未識別アイテムをリストアップ
                let unids = [];
                for (let i = 0; i < s.player.tempInventory.length; i++) {
                    let invId = s.player.tempInventory[i];
                    let invParsed = window.parseItemString(invId);
                    if (s.sessionItemDict && s.sessionItemDict[invParsed.baseId] && !s.aiMemory.identified.includes(invParsed.baseId)) {
                        let score = 0;
                        // 優先順位付け（指輪:100 > 杖:80 > 武器盾鎧:60 > その他:10）
                        if (invParsed.baseId.includes('ring') || invParsed.baseId.includes('bracelet')) score = 100;
                        else if (invParsed.baseId.includes('wand')) score = 80;
                        else if (invParsed.baseId.includes('sword') || invParsed.baseId.includes('shield') || invParsed.baseId.includes('armor')) score = 60;
                        else score = 10;
                        
                        unids.push({ idx: i, id: invId, baseId: invParsed.baseId, score: score });
                    }
                }

                if (unids.length > 0) {
                    // 5%の確率で全鑑定（大当たり）
                    if (Math.random() < 0.05) {
                        window.addDungeonLog(`✨ ラッキー！ 巻物が激しく光り輝いた！`, '#FFD700');
                        unids.forEach(u => {
                            if (!s.aiMemory.identified.includes(u.baseId)) s.aiMemory.identified.push(u.baseId);
                        });
                        window.addDungeonLog(`なんと、カバンの中の未識別アイテムがすべて識別された！`, '#4CAF50');
                    } else {
                        // 優先度順にソート（スコア降順）
                        unids.sort((a, b) => b.score - a.score);
                        let target = unids[0];
                        
                        // 識別処理
                        s.aiMemory.identified.push(target.baseId);
                        let targetEff = window.getDungeonItemEffect(target.id);
                        
                        // ★修正：自分で名前をつけていない場合は「紫の草」などの未識別時の見た目の名前をそのまま呼ぶ！
                        let tName = s.aiMemory.tempNames[target.baseId] || targetEff.name;
                        
                        // AIの思考と結果をログに出力
                        window.addDungeonLog(`💭 AI：カバンの中身を確認...よし、優先度の高い ${tName} を識別しよう！`, '#B0BEC5');
                        window.addDungeonLog(`🔍 ${aiName} は巻物を読み、アイテムが ${targetEff.logName} であることを完全に理解した！`, '#FFD700');
                    }
                } else {
                    window.addDungeonLog(`しかし、カバンの中に識別するアイテムがなかった！`, '#aaa');
                }
                effectTriggered = true;
            }

            // ▼ 新規追加：封魔の巻物
            if (effect.traits.includes('seal_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                let pRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                let targets = pRoom ? s.enemies.filter(e => e.hp > 0 && e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h) : s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                
                if (targets.length > 0) {
                    targets.forEach(e => { 
                        e.status.sealed = (e.status.sealed || 0) + 15; 
                        window.addDungeonLog(`${e.name} の口が塞がれ、特殊能力が封印された！🤐`, '#9C27B0');
                    });
                    effectTriggered = true;
                } else {
                    window.addDungeonLog(`巻物を読んだが、何も起きなかった...`, '#aaa');
                }
            }

            // ★ 修正：未識別アイテムを「使う・飲む・読む」した時点で、「調べる」「名前をつける」の概念を閃く！
            if (isUnidentified && typeof window.triggerDungeonInspiration === 'function') {
                window.triggerDungeonInspiration('identify');
                window.triggerDungeonInspiration('name_item');
            }

            if (effect.traits.includes('sleep_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                
                // ★修正：部屋か通路かで効果範囲を変え、対象がいるかチェックする
                let pRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                let targets = [];
                if (pRoom) {
                    targets = s.enemies.filter(e => e.hp > 0 && e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h);
                } else {
                    targets = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                }

                if (targets.length > 0) {
                    targets.forEach(e => { 
                        e.status.sleep += 15; 
                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); 
                        window.addDungeonLog(`${e.name} は深い眠りについた...💤`, '#B39DDB');
                    });
                    
                    if (activeTraits.includes('学識') && Math.random() < 0.25) {
                        window.addDungeonLog(`📖 学識！ 巻物の効果がもう一度発動した！`, '#E040FB');
                        targets.forEach(e => { 
                            e.status.sleep += 15; 
                            window.addDungeonLog(`${e.name} はさらに深く眠りに落ちた...💤`, '#B39DDB');
                        });
                    }
                    effectTriggered = true; // 効果が出たので学習する
                } else {
                    window.addDungeonLog(`巻物を読んだが、何も起きなかった...`, '#aaa');
                }
            }
            if (effect.traits.includes('confuse_aoe') && (chosenCommand === 'use' || isUnidentified)) {
                s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                
                let pRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                let targets = [];
                if (pRoom) {
                    targets = s.enemies.filter(e => e.hp > 0 && e.x >= pRoom.x && e.x < pRoom.x + pRoom.w && e.y >= pRoom.y && e.y < pRoom.y + pRoom.h);
                } else {
                    targets = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                }

                if (targets.length > 0) {
                    targets.forEach(e => { 
                        e.status.confusion += 15; 
                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); 
                        window.addDungeonLog(`${e.name} は大混乱に陥った！🌀`, '#FF9800');
                    });
                    
                    if (activeTraits.includes('学識') && Math.random() < 0.25) {
                        window.addDungeonLog(`📖 学識！ 巻物の効果がもう一度発動した！`, '#E040FB');
                        targets.forEach(e => { 
                            e.status.confusion += 15; 
                            window.addDungeonLog(`${e.name} はさらにひどく混乱した！🌀`, '#FF9800');
                        });
                    }
                    effectTriggered = true; // 効果が出たので学習する
                } else {
                    window.addDungeonLog(`巻物を読んだが、何も起きなかった...`, '#aaa');
                }
            }
            if ((effect.traits.includes('fire_damage') || effect.traits.includes('swap_pos') || effect.traits.includes('blow_back') || effect.traits.includes('freeze_effect')) && (chosenCommand === 'use' || isUnidentified)) {
                
                let isCosmicDragon = activeTraits.includes('宇宙竜');
                if (isCosmicDragon) {
                    let recoil = Math.max(1, Math.floor(s.player.maxHp * 0.1));
                    s.player.hp -= recoil;
                    window.addDungeonLog(`🌌 宇宙竜の反動！ 巨大な魔力と引き換えに身を削った！(HP-${recoil})`, '#FF5252');
                }

                // ★大改修：レイキャスト化のエイム対象を、全方位の「敵」「罠」「すべてのギミック」に拡張し、透視も防ぐ
                let validTargets = [];
                let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
                for (let d of dirs) {
                    let cx = s.player.x, cy = s.player.y;
                    for (let r = 1; r <= 999; r++) { // ★修正：20マス制限を撤廃。配列の限界まで索敵する
                        cx += d.dx; cy += d.dy;
                        if (cx < 0 || cx >= s.mapWidth || cy < 0 || cy >= s.mapHeight) break;
                        let tile = s.grid[cy][cx];
                        if (tile === 1) break; // 壁で射線が遮られたら、この方向の索敵は終了

                        let eHit = s.enemies.find(e => e.hp > 0 && e.x === cx && e.y === cy);
                        if (eHit) { validTargets.push({ x: cx, y: cy, type: 'enemy' }); break; }
                        
                        let tHit = s.traps && s.traps.find(t => t.visible && t.x === cx && t.y === cy);
                        if (tHit) { validTargets.push({ x: cx, y: cy, type: 'trap' }); break; }
                        
                        // 2:階段, 4:浅瀬, 5:マグマ, 6:緑草, 7:土草, 8:氷, 9:深水, 10:溝 はすべてギミックとしてエイム対象にする
                        if ([2, 4, 5, 6, 7, 8, 9, 10].includes(tile)) {
                            validTargets.push({ x: cx, y: cy, type: 'gimmick' }); break;
                        }
                    }
                }

                let targetObj = null;
                if (effect.traits.includes('swap_pos') && (s.player.hp / s.player.maxHp < 0.5)) {
                    let farTargets = validTargets.filter(t => Math.abs(t.x - s.player.x) > 1 || Math.abs(t.y - s.player.y) > 1);
                    if (farTargets.length > 0) targetObj = farTargets.sort((a,b) => (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)) - (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)))[0];
                }
                if (!targetObj && validTargets.length > 0) {
                    // 敵・罠・ギミックを問わず、一番近い有効なターゲットを狙う
                    targetObj = validTargets.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                }

                if (targetObj) {
                    if (targetObj.x < s.player.x) s.player.face = 'left'; else if (targetObj.x > s.player.x) s.player.face = 'right'; else if (targetObj.y < s.player.y) s.player.face = 'up'; else if (targetObj.y > s.player.y) s.player.face = 'down';
                }
                // ★重要：ここで updateDungeonUI を呼ぶことで、発射前にキャラクターの「見た目」の向きを確実に更新させる
                window.updateDungeonUI(); await sleep(150);

                let magicColor = effect.traits.includes('fire_damage') ? '#FF5252' : effect.traits.includes('freeze_effect') ? '#00BCD4' : '#E040FB';
                let casts = isOverTech ? 2 : 1;

                // ★ループ化により、オーバーテクノロジーの追撃コードを自動化！
                for (let cast = 0; cast < casts; cast++) {
                    if (cast === 1) {
                        window.addDungeonLog(`✨ オーバーテクノロジーによる連続発動！ さらにもう一撃！`, '#E040FB');
                        await sleep(150);
                    }

                    s.player.magicAnim = true; 
                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');

                    // レイキャスト計算（向いている方向へ1マスずつ進む）
                    let dx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0;
                    let dy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
                    let hitX = s.player.x, hitY = s.player.y;
                    let hitObj = null;

                    for (let r = 1; r <= 999; r++) { // ★修正：20マス制限を撤廃。壁か配列の限界まで飛んでいく
                        hitX += dx; hitY += dy;
                        if (hitX < 0 || hitX >= s.mapWidth || hitY < 0 || hitY >= s.mapHeight) break;
                        
                        let tile = s.grid[hitY][hitX];
                        
                        // 1. 敵に衝突
                        let eHit = s.enemies.find(e => e.hp > 0 && e.x === hitX && e.y === hitY);
                        if (eHit) { hitObj = { type: 'enemy', entity: eHit }; break; }

                        // 2. 罠に衝突（場所替え・吹き飛ばしのみ反応）
                        let trapTarget = s.traps && s.traps.find(t => t.x === hitX && t.y === hitY && t.visible); // ※見えている罠にのみ当たる
                        if (trapTarget && (effect.traits.includes('swap_pos') || effect.traits.includes('blow_back'))) {
                            hitObj = { type: 'trap', entity: trapTarget }; break;
                        }

                        // 3. 壁に衝突
                        if (tile === 1) { hitObj = { type: 'wall' }; break; }
                        
                        // ★大修正：すべてのギミック（床と通路以外）に対する着弾判定
                        if ([2, 4, 5, 6, 7, 8, 9, 10].includes(tile)) {
                            // 炎は草地に当たる
                            if (effect.traits.includes('fire_damage') && (tile === 6 || tile === 7)) { hitObj = { type: 'gimmick', x: hitX, y: hitY, tile: tile }; break; }
                            // 氷は水脈に当たる
                            if (effect.traits.includes('freeze_effect') && (tile === 4 || tile === 9)) { hitObj = { type: 'gimmick', x: hitX, y: hitY, tile: tile }; break; }
                            // 場所替え・吹き飛ばしは全てのギミックに容赦なく当たる
                            if (effect.traits.includes('swap_pos') || effect.traits.includes('blow_back')) {
                                hitObj = { type: 'gimmick', x: hitX, y: hitY, tile: tile }; break;
                            }
                        }
                    }

                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, hitX, hitY, magicColor);
                    await sleep(150); 

                    // ★着弾後の処理
                    if (hitObj) {
                        if (hitObj.type === 'enemy') {
                            let targetEnemy = hitObj.entity;

                            // ★ 追加：魔法反射特性の統合処理
                            let eSkin = targetEnemy.skin || targetEnemy.type || "";
                            let isReflected = false;
                            let reflectMult = 1.0;
                            let reflectMsg = "";

                            if (eSkin === 'spirit_type2_3' && Math.random() < 0.5) { isReflected = true; reflectMsg = `🪞 鏡面反射！ 魔法が跳ね返された！`; }
                            else if (eSkin === 'balloon_type2') { isReflected = true; reflectMsg = `🫧 シャボンバリア！ 薄い膜が魔法を完全に跳ね返した！`; }
                            else if (eSkin === 'ghost_type3_3') { isReflected = true; reflectMsg = `🪞 魔法反射！ 魔法がそのまま跳ね返された！`; }
                            else if (eSkin === 'magician_type4_3') { isReflected = true; reflectMult = 1.5; reflectMsg = `🪞 魔法鎧！ 魔法が 1.5倍 の威力になって跳ね返された！`; }

                            if (isReflected) {
                                window.addDungeonLog(reflectMsg, '#FF5252');
                                // 炎の杖（ダメージ魔法）なら反射ダメージを計算、それ以外（氷結や場所替え）は無効化扱い
                                if (effect.traits.includes('fire_damage')) {
                                    let baseMagicDmg = Math.floor(40 * (effect.magicPowerMult || 1.0));
                                    if (isCosmicDragon) baseMagicDmg *= 5;
                                    let finalRefDmg = Math.floor(baseMagicDmg * reflectMult);
                                    
                                    if (activeTraits.includes('万物の法則')) {
                                        window.addDungeonLog(`🌌 万物の法則 が反射ダメージを完全に打ち消した！`, '#00BCD4');
                                    } else {
                                        if (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度')) {
                                            finalRefDmg = Math.max(1, Math.floor(finalRefDmg / 2));
                                            window.addDungeonLog(`🌈 特性により反射ダメージを半減した！`, '#00BCD4');
                                        }
                                        s.player.hp -= finalRefDmg; s.player.damageAnim = true;
                                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, finalRefDmg, true);
                                    }
                                }
                                continue; // 魔法の効果を無効化して次の弾へ
                            }

                            if (effect.traits.includes('fire_damage')) {
                                let baseMagicDmg = Math.floor(40 * (effect.magicPowerMult || 1.0));
                                if (isCosmicDragon) baseMagicDmg *= 5;
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
                            }
                            else if (effect.traits.includes('freeze_effect')) {
                                targetEnemy.status.paralyzed = (targetEnemy.status.paralyzed || 0) + 1;
                                window.addDungeonLog(`❄️ 氷結の魔法が ${targetEnemy.name} を凍らせた！`, '#00BCD4');
                                if (activeTraits.includes('不死の大魔導')) {
                                    let splashTargets = s.enemies.filter(e => e.hp > 0 && e !== targetEnemy && Math.abs(e.x - targetEnemy.x) <= 1 && Math.abs(e.y - targetEnemy.y) <= 1);
                                    splashTargets.forEach(oe => { oe.status.paralyzed = (oe.status.paralyzed || 0) + 1; });
                                    if (splashTargets.length > 0) window.addDungeonLog(`🌌 不死の大魔導！ 冷気が周囲を巻き込んで拡大した！`, '#00BCD4');
                                }
                            }
                            else if (effect.traits.includes('swap_pos')) {
                                let px = s.player.x, py = s.player.y;
                                s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px; targetEnemy.y = py;
                                window.addDungeonLog(`🌀 魔法の力で ${targetEnemy.name} と場所を入れ替わった！`, '#00BCD4');
                                if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                            }
                            else if (effect.traits.includes('blow_back')) {
                                let pushDist = 5; let nx = targetEnemy.x, ny = targetEnemy.y;
                                for(let k=0; k<pushDist; k++) {
                                    if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                        nx += dx; ny += dy;
                                    } else {
                                        if (targetEnemy.skin && targetEnemy.skin.includes('stone')) { window.addDungeonLog(`🪨 石の体！ ${targetEnemy.name} は吹き飛ばしを無効化した！`, '#aaa'); break; }
                                        let blowDmg = Math.floor(20 * (effect.magicPowerMult || 1.0)); 
                                        if (isCosmicDragon) blowDmg *= 5; 
                                        targetEnemy.hp -= blowDmg; targetEnemy.damageAnim = true;
                                        if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                        window.addDungeonLog(`💥 ${targetEnemy.name} は壁に激突した！(${blowDmg}ダメージ)`, '#FF5252');
                                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, blowDmg, false);
                                        break;
                                    }
                                }
                                targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                                window.addDungeonLog(`💨 ${targetEnemy.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                            }
                        } 
                        else if (hitObj.type === 'gimmick') {
                            let gNames = {2: "階段", 4: "浅瀬", 5: "マグマ", 6: "草地", 7: "土の床", 8: "氷の床", 9: "深い水脈", 10: "溝"};
                            let gName = gNames[hitObj.tile] || "特殊な地形";

                            if ((hitObj.tile === 6 || hitObj.tile === 7) && effect.traits.includes('fire_damage')) {
                                s.grid[hitObj.y][hitObj.x] = 5; 
                                window.addDungeonLog(`🔥 炎の魔法が${gName}に引火し、マグマ溜まりに変わった！`, '#FF5252');
                            }
                            else if ((hitObj.tile === 4 || hitObj.tile === 9) && effect.traits.includes('freeze_effect')) {
                                s.grid[hitObj.y][hitObj.x] = 8; 
                                window.addDungeonLog(`❄️ 氷結の魔法が${gName}を凍らせ、氷の床に変わった！`, '#00BCD4');
                            }
                            else if (effect.traits.includes('swap_pos')) {
                                // ★修正：階段も含め、ギミック地形とプレイヤーの足元のタイルを完全に入れ替える！
                                let px = s.player.x, py = s.player.y;
                                let pTile = s.grid[py][px];
                                let targetTile = s.grid[hitObj.y][hitObj.x];
                                s.grid[py][px] = targetTile;
                                s.grid[hitObj.y][hitObj.x] = pTile;
                                s.player.x = hitObj.x; s.player.y = hitObj.y;
                                window.addDungeonLog(`🌀 魔法の力で ${gName} と場所を入れ替わった！`, '#00BCD4');
                                if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(px, py, 'warp'); window.playDungeonVFX(s.player.x, s.player.y, 'warp'); }
                            }
                            else if (effect.traits.includes('blow_back')) {
                                // ★修正：階段も含め、ギミック地形そのものを数マス奥へ吹き飛ばす！
                                let pushDist = 5; let nx = hitObj.x, ny = hitObj.y;
                                let targetTile = s.grid[hitObj.y][hitObj.x];
                                for(let k=0; k<pushDist; k++) {
                                    if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e.x===nx+dx&&e.y===ny+dy) && !(s.traps&&s.traps.some(t=>t.x===nx+dx&&t.y===ny+dy))) {
                                        nx += dx; ny += dy;
                                    } else { break; }
                                }
                                if (nx !== hitObj.x || ny !== hitObj.y) {
                                    // 跡地は部屋なら「0(床)」、通路なら「3」に戻す
                                    let isRoom = s.roomsInfo && s.roomsInfo.some(r => hitObj.x >= r.x && hitObj.x < r.x + r.w && hitObj.y >= r.y && hitObj.y < r.y + r.h);
                                    s.grid[hitObj.y][hitObj.x] = isRoom ? 0 : 3; 
                                    // 吹き飛ばし先にギミック地形を上書き
                                    s.grid[ny][nx] = targetTile;
                                }
                                window.addDungeonLog(`💨 ${gName} が風圧で遠くへ吹き飛んでいった！`, '#00BCD4');
                            }
                        }
                        else if (hitObj.type === 'trap') {
                            let trap = hitObj.entity;
                            if (effect.traits.includes('swap_pos')) {
                                let px = s.player.x, py = s.player.y;
                                s.player.x = trap.x; s.player.y = trap.y; trap.x = px; trap.y = py;
                                window.addDungeonLog(`🌀 魔法の力で ${trap.name} と場所を入れ替わった！`, '#00BCD4');
                                if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(trap.x, trap.y, 'warp'); }
                            }
                            else if (effect.traits.includes('blow_back')) {
                                let pushDist = 5; let nx = trap.x, ny = trap.y;
                                for(let k=0; k<pushDist; k++) {
                                    if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e.x===nx+dx&&e.y===ny+dy) && !s.traps.some(t=>t!==trap&&t.x===nx+dx&&t.y===ny+dy)) {
                                        nx += dx; ny += dy;
                                    } else { break; }
                                }
                                trap.x = nx; trap.y = ny;
                                window.addDungeonLog(`💨 ${trap.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                            }
                        }
                        else if (hitObj.type === 'wall') {
                            window.addDungeonLog(`魔法は壁に当たって消えた...`, '#aaa');
                        }
                    } else {
                        window.addDungeonLog(`魔法は虚空に消えていった...`, '#aaa');
                    }
                    
                    // ★修正：魔法の性質によって、学習（推測）できる条件を分ける
                    if (effect.traits.includes('fire_damage') || effect.traits.includes('freeze_effect')) {
                        effectTriggered = true; // 属性魔法は飛んでいくエフェクト（熱や冷気）で判別可能
                    // ★修正：対象がギミック（階段、水脈、草地などすべて）に命中して効果が発動した場合もしっかり学習する
                    } else if (hitObj && (hitObj.type === 'enemy' || hitObj.type === 'trap' || hitObj.type === 'gimmick')) {
                        effectTriggered = true; // 対象に命中し効果が発動した時のみ判別可能
                    }
                }
            }
            if (effect.traits.includes('warp_self') && (chosenCommand === 'use' || isUnidentified)) {
                if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'warp');
                let wx, wy; 
                do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); 
                } while (s.grid[wy][wx] !== 0 || (activeTraits.includes('特異点') && s.enemies.some(e => e.hp > 0 && Math.abs(e.x - wx) <= 2 && Math.abs(e.y - wy) <= 2)));
                s.player.x = wx; s.player.y = wy; window.addDungeonLog(`🌀 ${aiName} は別の場所へワープした！`, '#E040FB'); window.updateDungeonUI();
                effectTriggered = true;
            }

            // ★修正：「つかう」コマンドの識別ロジック（巻物は不発でも絶対識別！）
            if (chosenCommand === 'use') {
                if (isUnidentified) {
                    if (baseId.includes('scroll')) {
                        // 巻物は読んだ瞬間に内容がわかるため、効果の不発に関わらず完全識別！
                        s.aiMemory.identified.push(baseId);
                        window.addDungeonLog(`💡 AIはこの巻物が【${effect.realName}】だと完全に理解した！`, '#FFD700');
                    } else if (effectTriggered) {
                        // 杖などは効果が発動した場合のみ推測
                        let tName = "謎の杖";
                        if (effect.traits.includes('fire_damage')) tName = "火の杖";
                        else if (effect.traits.includes('swap_pos')) tName = "入れ替わりの杖";
                        else if (effect.traits.includes('blow_back')) tName = "吹き飛ばしの杖";
                        
                        let currentTempName = s.aiMemory.tempNames[baseId];
                        if (!currentTempName || currentTempName.startsWith("謎の")) {
                            s.aiMemory.tempNames[baseId] = tName;
                            window.addDungeonLog(`💡 AIは効果からこのアイテムを【${tName}？】と推測して名付けた！`, '#FFD700');
                        }
                    } else {
                        // 杖などで不発だった場合
                        let tName = baseId.includes('wand') ? "謎の杖" : "謎のアイテム";
                        let currentTempName = s.aiMemory.tempNames[baseId];
                        // ★完全修正：すでに「謎の杖」と名付けている場合は、再度ログを出さない（スパム防止）
                        if (currentTempName !== tName) {
                            s.aiMemory.tempNames[baseId] = tName;
                            window.addDungeonLog(`💡 AIは効果が分からなかったため、とりあえず保留で【${tName}？】と名付けた！`, '#FFD700');
                        }
                    }
                }
            }

        } else { window.addDungeonLog(`しかし使えるアイテムを持っていなかった！`, '#ff5252'); }
    } 
    else if (chosenCommand === 'equip') {
        let equippedSomething = false;
        const tryEquip = (slotName, typeName, logName) => {
            if (equippedSomething || s.player[slotName]) return;
            
            // ★大修正：カバンの中にある装備可能なアイテムをすべてピックアップしてスコア付けする
            let candidates = s.player.tempInventory.map((itemId, index) => {
                let eff = window.getDungeonItemEffect(itemId);
                let isTarget = eff.equipType === typeName || (typeName === 'weapon' && eff.isWeapon) || (typeName === 'shield' && eff.isShield);
                if (!isTarget) return null;
                
                let score = 0;
                if (typeName === 'weapon') score += (eff.atk || 0);
                else if (typeName === 'shield' || typeName === 'armor') score += (eff.def || 0);
                else score += (eff.traits.length * 10); // アクセサリは印が多いものを優先

                // ★呪われている装備は極端にスコアを下げ、「他に装備するものがない時」だけ仕方なく着るようにする
                if (eff.traits.includes('curse')) score -= 1000;
                
                return { index: index, itemId: itemId, score: score };
            }).filter(c => c !== null);

            if (candidates.length > 0) {
                // スコアが高い順（降順）に並び替え、一番強いものをベスト候補に選ぶ
                candidates.sort((a, b) => b.score - a.score);
                let bestIdx = candidates[0].index;

                s.player[slotName] = s.player.tempInventory[bestIdx]; 
                s.player.tempInventory.splice(bestIdx, 1); // 選んだアイテムをカバンから消す
                
                let parsedEq = window.parseItemString(s.player[slotName]);
                if (parsedEq.seals.includes('curse') && activeTraits.includes('浄化の光')) {
                    parsedEq.seals = parsedEq.seals.filter(seal => seal !== 'curse');
                    s.player[slotName] = `${parsedEq.baseId}_+${parsedEq.plus}` + (parsedEq.seals.length > 0 ? '_' + parsedEq.seals.join('_') : '');
                    window.addDungeonLog(`✨ 浄化の光！ 装備に宿っていた呪いが完全に消え去った！`, '#FFEB3B');
                }
                
                // ★大修正：装備したアイテムは「部分識別済み（+値と呪いだけは分かっている状態）」のメモリに登録される
                s.aiMemory.knownEquips = s.aiMemory.knownEquips || [];
                if (!s.aiMemory.knownEquips.includes(s.player[slotName])) {
                    s.aiMemory.knownEquips.push(s.player[slotName]);
                }

                window.addDungeonLog(`${window.getDungeonItemEffect(s.player[slotName]).logName} を装備した！`, '#FFD700');
                equippedSomething = true;

                // ★追加：未識別の装備を身に着けた瞬間に「しらべる」「なまえをつける」を閃く
                let bId = window.parseItemString(s.player[slotName]).baseId;
                if (s.sessionItemDict && s.sessionItemDict[bId] && s.aiMemory && !s.aiMemory.identified.includes(bId)) {
                    if (typeof window.triggerDungeonInspiration === 'function') {
                        window.triggerDungeonInspiration('identify');
                        window.triggerDungeonInspiration('name_item');
                    }
                }

                // ★追加：呪われた装備を身に着けてしまった瞬間に「はずす」を閃く
                let equipEff = window.getDungeonItemEffect(s.player[slotName]);
                if (equipEff.traits.includes('curse') && typeof window.triggerDungeonInspiration === 'function') {
                    window.addDungeonLog(`しかし装備は呪われており、体にガッチリと張り付いてしまった！`, '#9C27B0');
                    window.triggerDungeonInspiration('unequip');
                }
            }
        };
        
        tryEquip('equipWeapon', 'weapon', '武器'); 
        tryEquip('equipShield', 'shield', '盾'); 
        tryEquip('equipArmor', 'armor', '鎧'); 
        tryEquip('equipAccessory', 'accessory', '装飾品'); 
        
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
            if (eff.traits.includes('curse')) { 
                window.addDungeonLog(`しかし ${eff.logName} は呪われていて外せなかった！`, '#9C27B0');
                // ★ 閃き：呪いで外せない体験から、通常時に「装備を外す」コマンドの概念を閃く
                if (typeof window.triggerDungeonInspiration === 'function') {
                    window.triggerDungeonInspiration('unequip');
                }
            } 
            else { s.player.tempInventory.push(s.player[target]); window.addDungeonLog(`装備をはずして鞄にしまった。`, '#aaa'); s.player[target] = null; }
        } else { window.addDungeonLog(`はずす装備がなかった。`, '#aaa'); }
    } 
    else if (chosenCommand === 'synthesize') {
        window.calculateBestSynth(s);
        let info = s.player._synthInfo || s.player._bestSameSynth || s.player._bestDiffSynth;
        s.player._synthInfo = null;
        
        // ==========================================
        // ★新規追加：合成のベースと素材を賢く逆転させる（器の大きさ判定）
        // ==========================================
        if (info) {
            let bD = window.getDungeonItemEffect(info.baseItem.id);
            let mD = window.getDungeonItemEffect(info.matItem.id);
            let pB = window.parseItemString(info.baseItem.id);
            let pM = window.parseItemString(info.matItem.id);
            
            let bMax = bD.maxSeals || 0;
            let mMax = mD.maxSeals || 0;
            
            let willDiscard = false;
            if (info.isSame) {
                let mSeals = [...(pM.seals || [])];
                if (mD.traits) mD.traits.forEach(tr => { if (window.SEAL_DESCRIPTIONS && window.SEAL_DESCRIPTIONS[tr]) mSeals.push(tr); });
                let merged = new Set([...(pB.seals || []), ...mSeals]);
                if (merged.size > bMax) willDiscard = true;
            } else {
                let merged = new Set([...(pB.seals || []), info.seal].filter(x=>x));
                if (merged.size > bMax) willDiscard = true;
            }
            
            // ★新規追加：ベース装備が呪われているか判定（元々の特性、または付与された印）
            let bIsCursed = (bD.traits && bD.traits.includes('curse')) || (pB.seals && pB.seals.includes('curse'));
            
            // ★大修正：異種合成の場合はベースの逆転を行ってはいけない！（装備種別が変わってしまうため）
            // 逆転（スワップ）は「同種合成（info.isSame）」の時のみに限定する！
            if (info.isSame) {
                if (!bIsCursed && ((willDiscard && mMax > bMax) || (mMax >= bMax + 2))) {
                    let temp = info.baseItem;
                    info.baseItem = info.matItem;
                    info.matItem = temp;
                    window.addDungeonLog(`💭 AI：${bD.logName} より ${mD.logName} の方が器（印枠）が大きいため、ベースを逆転させる！`, '#B0BEC5');
                } else if (bIsCursed && ((willDiscard && mMax > bMax) || (mMax >= bMax + 2))) {
                    // ★呪いでスワップできなかった場合の無念の思考ログ
                    window.addDungeonLog(`💭 AI：ベースを逆転させたいが、${bD.logName} の呪縛が強くて溶かし込めない！このまま合成するしかない...`, '#B0BEC5');
                }
            }
        }
        // ==========================================

        if (info) {
            let baseItem = info.baseItem; let matItem = info.matItem;
            let parsedBase = window.parseItemString(baseItem.id); let parsedMat = window.parseItemString(matItem.id);
            let bData = window.getDungeonItemEffect(baseItem.id); let mData = window.getDungeonItemEffect(matItem.id);
            
            let newEquipStr = "";
            if (info.isSame) {
                if (parsedBase.baseId.includes('wand')) {
                    let newCharges = parsedBase.plus + parsedMat.plus; 
                    newEquipStr = `${parsedBase.baseId}${newCharges >= 0 ? '_+' : '_'}${newCharges}`;
                    window.addDungeonLog(`🔨 ${aiName} は ${bData.logName} と ${mData.logName} の魔力を一つに束ねた！`, '#FFD700');
                } else {
                    let matSeals = [...parsedMat.seals];
                    
                    // ★完全修正：正しい辞書(SEAL_DESCRIPTIONS)を参照し、日本語名ではなく「英語キー(tr)」を保存する！
                    if (mData.traits) {
                        mData.traits.forEach(tr => {
                            // SEAL_DESCRIPTIONSに登録されている正当な印データであれば、そのまま英語キー(tr)を追加
                            if (window.SEAL_DESCRIPTIONS && window.SEAL_DESCRIPTIONS[tr]) {
                                // ★修正：ベース装備が「生まれつき」または「既に印として」その能力を持っている場合は抽出しない
                                if (!matSeals.includes(tr) && !bData.traits.includes(tr)) {
                                    matSeals.push(tr);
                                }
                            }
                        });
                    }

                    let mergedSeals = [...new Set([...parsedBase.seals, ...matSeals])];
                    if (mergedSeals.length > bData.maxSeals) {
                        // ★大修正：AIが印の価値を判断し、スコアの高いものを残して低いものを押し出す！
                        mergedSeals.sort((a, b) => window.getDungeonSealScore(b) - window.getDungeonSealScore(a));
                        let droppedSeals = mergedSeals.slice(bData.maxSeals);
                        mergedSeals = mergedSeals.slice(0, bData.maxSeals);
                        
                        let droppedNames = droppedSeals.map(s => `[${window.SEAL_DESCRIPTIONS[s] ? window.SEAL_DESCRIPTIONS[s].name : s}]`).join('');
                        window.addDungeonLog(`限界を超えた魔力により、価値の低い ${droppedNames} の印が押し出されて消滅した！`, '#FF9800');
                    }
                    // ★大修正：アクセサリも「+1」の同種合成ボーナスを得られるように制限を解除！
                    let plusBonus = 1;
                    let newPlus = parsedBase.plus + parsedMat.plus + plusBonus; 
                    newEquipStr = `${parsedBase.baseId}`;
                    if (newPlus > 0) newEquipStr += `_+${newPlus}`;
                    else if (newPlus < 0) newEquipStr += `_${newPlus}`;
                    if (mergedSeals.length > 0) newEquipStr += '_' + mergedSeals.join('_');
                    window.addDungeonLog(`🔨 ${aiName} は ${bData.logName} と ${mData.logName} を合成した！`, '#FFD700');
                }
            } else {
                // ★修正：万が一ベースがすでに固有能力として持っている場合は、印として追加しない
                if (!bData.traits.includes(info.seal)) {
                    parsedBase.seals.push(info.seal);
                }
                if (parsedBase.seals.length > bData.maxSeals) {
                    // ★大修正：AIが印の価値を判断し、スコアの高いものを残して低いものを押し出す！
                    parsedBase.seals.sort((a, b) => window.getDungeonSealScore(b) - window.getDungeonSealScore(a));
                    let droppedSeals = parsedBase.seals.slice(bData.maxSeals);
                    parsedBase.seals = parsedBase.seals.slice(0, bData.maxSeals);
                    
                    let droppedNames = droppedSeals.map(s => `[${window.SEAL_DESCRIPTIONS[s] ? window.SEAL_DESCRIPTIONS[s].name : s}]`).join('');
                    window.addDungeonLog(`限界を超えた魔力により、価値の低い ${droppedNames} の印が押し出されて消滅した！`, '#FF9800');
                }
                
                // ★修正：マイナス値（呪いによる劣化など）も消えずに引き継がれるように、符号によって結合方法を変更！
                newEquipStr = `${parsedBase.baseId}`; 
                if (parsedBase.plus > 0) newEquipStr += `_+${parsedBase.plus}`;
                else if (parsedBase.plus < 0) newEquipStr += `_${parsedBase.plus}`;
                if (parsedBase.seals.length > 0) newEquipStr += '_' + parsedBase.seals.join('_');
                
                window.addDungeonLog(`🔨 ${aiName} は ${bData.logName} に ${mData.logName} を溶かし込んだ！`, '#E040FB');
                    
                // ==========================================
                // ★新規追加：印からの推測・学習システム！
                // ==========================================
                // ベースがステータス判明済み（装備中 or 装備した事がある）なら、付与された印を見て素材の正体を推測する！
                let bIsStatsKnown = baseItem.isEquipped || (s.aiMemory && s.aiMemory.knownEquips && s.aiMemory.knownEquips.includes(baseItem.id));
                let isMatUnidentified = s.sessionItemDict && s.sessionItemDict[parsedMat.baseId] && s.aiMemory && !s.aiMemory.identified.includes(parsedMat.baseId);
                
                if (bIsStatsKnown && isMatUnidentified) {
                    let mBaseId = parsedMat.baseId;
                    
                    // ★追加：現在ついている推測名を取得
                    let currentTempName = s.aiMemory.tempNames[mBaseId];
                    
                    // ▼ 修正：mBaseId === 'herb' を mBaseId.includes('herb') に変更し、新しい草も一網打尽に識別させる
                    if (mBaseId.includes('scroll') || mBaseId.includes('herb') || mBaseId.includes('berry') || mBaseId.includes('seed') || mBaseId.includes('bread')) {
                        // 草や巻物なら完全識別
                        s.aiMemory.identified.push(mBaseId);
                        window.addDungeonLog(`💡 合成で付与された印から、AIは素材が【${mData.realName}】だと完全に理解した！`, '#FFD700');
                    } else {
                        // 杖や指輪は仮名推測
                        let tName = mBaseId.includes('wand') ? "謎の杖" : mBaseId.includes('ring') ? "謎の指輪" : "謎のアイテム";
                        
                        // ★修正：武器に合成した時の印と、盾・鎧に合成した時の印の「両方」から正体を推測できるようにする！
                        if (info.seal === 'fire' || info.seal === 'anti_dragon') tName = "火の杖";
                        else if (info.seal === 'first' || info.seal === 'light') tName = "俊足の腕輪";
                        else if (info.seal === 'holy' || info.seal === 'regen') tName = "回復の指輪";
                        
                        // 推測名がまだない、または「謎の〜」の場合のみ推測を行う
                        if (!currentTempName || currentTempName.startsWith("謎の")) {
                            s.aiMemory.tempNames[mBaseId] = tName;
                            window.addDungeonLog(`💡 合成で付与された印から、AIは素材を【${tName}？】と推測して名付けた！`, '#FFD700');
                        }
                    }
                }
            }
            
            // ★大修正：素材とベースの正確な更新処理（スマート乗り換え対応）
            if (matItem.isEquipped && !baseItem.isEquipped) {
                s.player[matItem.slot] = newEquipStr; 
                s.player.tempInventory.splice(baseItem.idx, 1); 
                
                // 装備枠に入れたので、knownEquips に登録して外した時も見え続けるようにする
                s.aiMemory.knownEquips = s.aiMemory.knownEquips || [];
                if (!s.aiMemory.knownEquips.includes(newEquipStr)) s.aiMemory.knownEquips.push(newEquipStr);

                window.addDungeonLog(`完成した ${window.getDungeonItemEffect(newEquipStr).logName} をそのまま装備した！`, '#00BCD4');
            } else {
                if (matItem.isEquipped) s.player[matItem.slot] = null; 
                else s.player.tempInventory.splice(matItem.idx, 1);
                
                if (baseItem.isEquipped) {
                    s.player[baseItem.slot] = newEquipStr;
                    
                    // ★追加：ベースが装備中だった場合のみ、新しく生まれたアイテムを knownEquips に登録する！
                    s.aiMemory.knownEquips = s.aiMemory.knownEquips || [];
                    if (!s.aiMemory.knownEquips.includes(newEquipStr)) s.aiMemory.knownEquips.push(newEquipStr);
                } else {
                    let actualBaseIdx = baseItem.idx;
                    if (!matItem.isEquipped && matItem.idx < baseItem.idx) actualBaseIdx--;
                    s.player.tempInventory[actualBaseIdx] = newEquipStr;
                }
                // ★王道仕様：未装備のものをベースにして合成した場合は、メモリには登録しない！(見えないまま)
            }
            
            window.addDungeonLog(`✨ ${window.getDungeonItemEffect(newEquipStr).logName} が完成した！`, '#FFD700');
            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');

            // ★追加：未識別アイテムを合成した瞬間に「しらべる」「なまえをつける」を閃く
            let bIdBase = parsedBase.baseId; let bIdMat = parsedMat.baseId;
            let isBaseUnid = s.sessionItemDict && s.sessionItemDict[bIdBase] && s.aiMemory && !s.aiMemory.identified.includes(bIdBase);
            let isMatUnid = s.sessionItemDict && s.sessionItemDict[bIdMat] && s.aiMemory && !s.aiMemory.identified.includes(bIdMat);
            if ((isBaseUnid || isMatUnid) && typeof window.triggerDungeonInspiration === 'function') {
                window.triggerDungeonInspiration('identify');
                window.triggerDungeonInspiration('name_item');
            }

            // ★追加：合成によって「呪い」が付与・維持された瞬間に「はずす」を閃く
            let newEff = window.getDungeonItemEffect(newEquipStr);
            if (newEff.traits.includes('curse') && typeof window.triggerDungeonInspiration === 'function') {
                // 装備中のものを合成したなら演出を追加
                if (baseItem.isEquipped || (matItem.isEquipped && !baseItem.isEquipped)) {
                    window.addDungeonLog(`呪縛が強まり、装備が体にガッチリと張り付いてしまった！`, '#9C27B0');
                }
                window.triggerDungeonInspiration('unequip');
            }

        } else { window.addDungeonLog(`合成できる装備がなかった。`, '#aaa'); }
    }
    // 修正後→
    else if (chosenCommand === 'put_down') {
        if (typeof s.player._targetItemIdx === 'number' && s.player._targetItemIdx !== -1 && s.player.tempInventory[s.player._targetItemIdx]) {
            let itemKey = s.player.tempInventory[s.player._targetItemIdx];
            s.player.lostItems = s.player.lostItems || []; s.player.lostItems.push(itemKey); // ★化石の記憶用のロスト記録
            
            let preLen = s.items.length; // ★追加：アイテム配置前の長さを記憶
            window.scatterItem(s, s.player.x, s.player.y, itemKey); s.player.tempInventory.splice(s.player._targetItemIdx, 1);
            window.addDungeonLog(`${aiName} は足元に ${window.getDungeonItemEffect(itemKey).logName} を置いた。`, '#aaa');
            
            // ★追加：置いたアイテムに3種の「完全無視フラグ」を焼き付ける！
            for (let i = preLen; i < s.items.length; i++) {
                s.items[i]._discarded = true;     // 1. 探索作戦のターゲットにしない
                s.items[i]._visited = true;       // 2. 足元アクションを誤爆させない
                s.items[i]._preventAutoPick = true; // 3. 自動で拾わせない
            }
            
            if (itemKey === 'item_seed_mystery' && s.grid[s.player.y][s.player.x] === 7) {
                if (!s.floorTimers) s.floorTimers = []; s.floorTimers.push({ type: 'seed', x: s.player.x, y: s.player.y, turns: 15 });
                window.addDungeonLog(`種を土に植えた！ しばらく待てば育つかもしれない...`, '#4CAF50'); s.items.pop(); 
            }
        } s.player._targetItemIdx = null;
    }
    else if (chosenCommand === 'throw') {
        if (typeof s.player._targetItemIdx === 'number' && s.player._targetItemIdx !== -1 && s.player.tempInventory[s.player._targetItemIdx]) {
            let itemKey = s.player.tempInventory[s.player._targetItemIdx];
            let parsedItem = window.parseItemString(itemKey);
            let eff = window.getDungeonItemEffect(itemKey);
            let isWand = parsedItem.baseId.includes('wand');

            // ★修正：投げたアイテムをカバンから確実に削除する（無限増殖バグを修正！）
            s.player.tempInventory.splice(s.player._targetItemIdx, 1); 
            s.player.lostItems = s.player.lostItems || []; s.player.lostItems.push(itemKey); // ★化石の記憶用のロスト記録
            window.addDungeonLog(`${aiName} は ${eff.logName} を投げた！`, '#00BCD4');
            
            // ★追加：未識別アイテムを投げた瞬間に「しらべる」「なまえをつける」を閃く
            if (s.sessionItemDict && s.sessionItemDict[parsedItem.baseId] && s.aiMemory && !s.aiMemory.identified.includes(parsedItem.baseId)) {
                if (typeof window.triggerDungeonInspiration === 'function') {
                    window.triggerDungeonInspiration('identify');
                    window.triggerDungeonInspiration('name_item');
                }
            }

            let dx = s.player.face === 'right' ? 1 : s.player.face === 'left' ? -1 : 0; let dy = s.player.face === 'down' ? 1 : s.player.face === 'up' ? -1 : 0;
            let tx = s.player.x, ty = s.player.y; let hitEnemy = null; let hitObj = null;
            
            // ★追加：投げたものが「杖」なら、ギミックや罠にも当たる軌道計算を行う
            if (isWand) {
                for (let r = 1; r <= 10; r++) { // 投擲の最大距離は10マス
                    tx += dx; ty += dy;
                    if (tx < 0 || tx >= s.mapWidth || ty < 0 || ty >= s.mapHeight) break;
                    let tile = s.grid[ty][tx];
                    if (tile === 1) { hitObj = { type: 'wall' }; tx -= dx; ty -= dy; break; }
                    
                    let eHit = s.enemies.find(e => e.hp > 0 && e.x === tx && e.y === ty);
                    if (eHit) { hitObj = { type: 'enemy', entity: eHit }; hitEnemy = eHit; break; }
                    
                    let trapTarget = s.traps && s.traps.find(t => t.x === tx && t.y === ty && t.visible);
                    if (trapTarget && (eff.traits.includes('swap_pos') || eff.traits.includes('blow_back'))) {
                        hitObj = { type: 'trap', entity: trapTarget }; break;
                    }
                    if ([2, 4, 5, 6, 7, 8, 9, 10].includes(tile)) {
                        if (eff.traits.includes('fire_damage') && (tile === 6 || tile === 7)) { hitObj = { type: 'gimmick', x: tx, y: ty, tile: tile }; break; }
                        if (eff.traits.includes('freeze_effect') && (tile === 4 || tile === 9)) { hitObj = { type: 'gimmick', x: tx, y: ty, tile: tile }; break; }
                        if (eff.traits.includes('swap_pos') || eff.traits.includes('blow_back')) { hitObj = { type: 'gimmick', x: tx, y: ty, tile: tile }; break; }
                    }
                }
            } else {
                for (let dist = 1; dist <= 10; dist++) {
                    tx += dx; ty += dy;
                    if (s.grid[ty][tx] === 1) { tx -= dx; ty -= dy; break; } 
                    hitEnemy = s.enemies.find(e => e.hp > 0 && e.x === tx && e.y === ty);
                    if (hitEnemy) break;
                }
            }

            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(s.player.x, s.player.y, tx, ty, isWand ? '#E040FB' : '#FFF');
            await sleep(200);

            // ★追加：杖が何かに当たって割れた場合の魔法発動ロジック
            if (isWand && hitObj && hitObj.type !== 'wall') {
                window.addDungeonLog(`💥 投げた ${eff.logName} が割れ、閉じ込められていた魔法が発動した！`, '#E040FB');
                
                let isCosmicDragon = activeTraits.includes('宇宙竜');
                if (hitObj.type === 'enemy') {
                    let targetEnemy = hitObj.entity;
                    let eSkin = targetEnemy.skin || targetEnemy.type || "";
                    let isReflected = false; let reflectMult = 1.0; let reflectMsg = "";
                    if (eSkin === 'spirit_type2_3' && Math.random() < 0.5) { isReflected = true; reflectMsg = `🪞 鏡面反射！ 魔法が跳ね返された！`; }
                    else if (eSkin === 'balloon_type2') { isReflected = true; reflectMsg = `🫧 シャボンバリア！ 薄い膜が魔法を完全に跳ね返した！`; }
                    else if (eSkin === 'ghost_type3_3') { isReflected = true; reflectMsg = `🪞 魔法反射！ 魔法がそのまま跳ね返された！`; }
                    else if (eSkin === 'magician_type4_3') { isReflected = true; reflectMult = 1.5; reflectMsg = `🪞 魔法鎧！ 魔法が 1.5倍 の威力になって跳ね返された！`; }

                    if (isReflected) {
                        window.addDungeonLog(reflectMsg, '#FF5252');
                        if (eff.traits.includes('fire_damage')) {
                            let baseMagicDmg = Math.floor(40 * (eff.magicPowerMult || 1.0));
                            if (isCosmicDragon) baseMagicDmg *= 5;
                            let finalRefDmg = Math.floor(baseMagicDmg * reflectMult);
                            if (activeTraits.includes('万物の法則')) { window.addDungeonLog(`🌌 万物の法則 が反射ダメージを完全に打ち消した！`, '#00BCD4'); }
                            else {
                                if (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度')) { finalRefDmg = Math.max(1, Math.floor(finalRefDmg / 2)); window.addDungeonLog(`🌈 特性により反射ダメージを半減した！`, '#00BCD4'); }
                                s.player.hp -= finalRefDmg; s.player.damageAnim = true;
                                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, finalRefDmg, true);
                            }
                        }
                    } else {
                        if (eff.traits.includes('fire_damage')) {
                            let baseMagicDmg = Math.floor(40 * (eff.magicPowerMult || 1.0));
                            if (isCosmicDragon) baseMagicDmg *= 5;
                            targetEnemy.hp -= baseMagicDmg; targetEnemy.damageAnim = true;
                            if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'fire'); 
                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(targetEnemy.x, targetEnemy.y, baseMagicDmg, false);
                            window.addDungeonLog(`🔥 灼熱の炎が ${targetEnemy.name} を焼き尽くす！(${baseMagicDmg}ダメージ)`, '#FF5252');
                            if (activeTraits.includes('不死の大魔導')) {
                                let splashTargets = s.enemies.filter(e => e.hp > 0 && e !== targetEnemy && Math.abs(e.x - targetEnemy.x) <= 1 && Math.abs(e.y - targetEnemy.y) <= 1);
                                splashTargets.forEach(oe => { oe.hp -= baseMagicDmg; oe.damageAnim = true; if (oe.status && oe.status.sleep > 0) oe.status.sleep = 0; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(oe.x, oe.y, 'fire'); if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(oe.x, oe.y, baseMagicDmg, false); });
                            }
                        } else if (eff.traits.includes('freeze_effect')) {
                            targetEnemy.status.paralyzed = (targetEnemy.status.paralyzed || 0) + 1;
                            window.addDungeonLog(`❄️ 氷結の魔法が ${targetEnemy.name} を凍らせた！`, '#00BCD4');
                            if (activeTraits.includes('不死の大魔導')) {
                                let splashTargets = s.enemies.filter(e => e.hp > 0 && e !== targetEnemy && Math.abs(e.x - targetEnemy.x) <= 1 && Math.abs(e.y - targetEnemy.y) <= 1);
                                splashTargets.forEach(oe => { oe.status.paralyzed = (oe.status.paralyzed || 0) + 1; });
                            }
                        } else if (eff.traits.includes('swap_pos')) {
                            let px = s.player.x, py = s.player.y;
                            s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px; targetEnemy.y = py;
                            window.addDungeonLog(`🌀 魔法の力で ${targetEnemy.name} と場所を入れ替わった！`, '#00BCD4');
                            if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                        } else if (eff.traits.includes('blow_back')) {
                            let pushDist = 5; let nx = targetEnemy.x, ny = targetEnemy.y;
                            for(let k=0; k<pushDist; k++) {
                                if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                    nx += dx; ny += dy;
                                } else {
                                    if (targetEnemy.skin && targetEnemy.skin.includes('stone')) { window.addDungeonLog(`🪨 石の体！ ${targetEnemy.name} は吹き飛ばしを無効化した！`, '#aaa'); break; }
                                    let blowDmg = Math.floor(20 * (eff.magicPowerMult || 1.0)); 
                                    if (isCosmicDragon) blowDmg *= 5; 
                                    targetEnemy.hp -= blowDmg; targetEnemy.damageAnim = true;
                                    if (targetEnemy.status && targetEnemy.status.sleep > 0) targetEnemy.status.sleep = 0;
                                    window.addDungeonLog(`💥 ${targetEnemy.name} は壁に激突した！(${blowDmg}ダメージ)`, '#FF5252');
                                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, blowDmg, false);
                                    break;
                                }
                            }
                            targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                            window.addDungeonLog(`💨 ${targetEnemy.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                        }
                    }
                } else if (hitObj.type === 'gimmick') {
                    let gNames = {2: "階段", 4: "浅瀬", 5: "マグマ", 6: "草地", 7: "土の床", 8: "氷の床", 9: "深い水脈", 10: "溝"};
                    let gName = gNames[hitObj.tile] || "特殊な地形";
                    if ((hitObj.tile === 6 || hitObj.tile === 7) && eff.traits.includes('fire_damage')) { s.grid[hitObj.y][hitObj.x] = 5; window.addDungeonLog(`🔥 炎の魔法が${gName}に引火し、マグマ溜まりに変わった！`, '#FF5252'); }
                    else if ((hitObj.tile === 4 || hitObj.tile === 9) && eff.traits.includes('freeze_effect')) { s.grid[hitObj.y][hitObj.x] = 8; window.addDungeonLog(`❄️ 氷結の魔法が${gName}を凍らせ、氷の床に変わった！`, '#00BCD4'); }
                    else if (eff.traits.includes('swap_pos')) {
                        let px = s.player.x, py = s.player.y; let pTile = s.grid[py][px]; let targetTile = s.grid[hitObj.y][hitObj.x];
                        s.grid[py][px] = targetTile; s.grid[hitObj.y][hitObj.x] = pTile;
                        s.player.x = hitObj.x; s.player.y = hitObj.y;
                        window.addDungeonLog(`🌀 魔法の力で ${gName} と場所を入れ替わった！`, '#00BCD4');
                        if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(px, py, 'warp'); window.playDungeonVFX(s.player.x, s.player.y, 'warp'); }
                    } else if (eff.traits.includes('blow_back')) {
                        let pushDist = 5; let nx = hitObj.x, ny = hitObj.y; let targetTile = s.grid[hitObj.y][hitObj.x];
                        for(let k=0; k<pushDist; k++) {
                            if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e.x===nx+dx&&e.y===ny+dy) && !(s.traps&&s.traps.some(t=>t.x===nx+dx&&t.y===ny+dy))) { nx += dx; ny += dy; } else { break; }
                        }
                        if (nx !== hitObj.x || ny !== hitObj.y) {
                            let isRoom = s.roomsInfo && s.roomsInfo.some(r => hitObj.x >= r.x && hitObj.x < r.x + r.w && hitObj.y >= r.y && hitObj.y < r.y + r.h);
                            s.grid[hitObj.y][hitObj.x] = isRoom ? 0 : 3; s.grid[ny][nx] = targetTile;
                        }
                        window.addDungeonLog(`💨 ${gName} が風圧で遠くへ吹き飛んでいった！`, '#00BCD4');
                    }
                } else if (hitObj.type === 'trap') {
                    let trap = hitObj.entity;
                    if (eff.traits.includes('swap_pos')) {
                        let px = s.player.x, py = s.player.y; s.player.x = trap.x; s.player.y = trap.y; trap.x = px; trap.y = py;
                        window.addDungeonLog(`🌀 魔法の力で ${trap.name} と場所を入れ替わった！`, '#00BCD4');
                        if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(trap.x, trap.y, 'warp'); }
                    } else if (eff.traits.includes('blow_back')) {
                        let pushDist = 5; let nx = trap.x, ny = trap.y;
                        for(let k=0; k<pushDist; k++) {
                            if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e.x===nx+dx&&e.y===ny+dy) && !s.traps.some(t=>t!==trap&&t.x===nx+dx&&t.y===ny+dy)) { nx += dx; ny += dy; } else { break; }
                        }
                        trap.x = nx; trap.y = ny; window.addDungeonLog(`💨 ${trap.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                    }
                }
                
                // 魔法効果が発動し、もし未識別なら完全識別する！
                if (s.sessionItemDict && s.sessionItemDict[parsedItem.baseId] && !s.aiMemory.identified.includes(parsedItem.baseId)) {
                    s.aiMemory.identified.push(parsedItem.baseId);
                    window.addDungeonLog(`💡 AIは杖を投げて割れた時の魔法効果から、これが【${eff.realName}】だと完全に理解した！`, '#FFD700');
                }
                // 杖は割れて消滅したので、地面には落ちない（scatterItemを呼ばない）
            } else if (hitEnemy) {
                // 杖以外のアイテム、または杖だが壁の手前で敵に当たった物理ダメージ
                if (hitEnemy.status && hitEnemy.status.sleep > 0) hitEnemy.status.sleep = 0; window.dealDungeonDamage(s.player, hitEnemy); 
                
                let preLen = s.items.length; 
                window.scatterItem(s, tx, ty, itemKey); 
                for (let i = preLen; i < s.items.length; i++) {
                    s.items[i]._discarded = true; s.items[i]._visited = true; s.items[i]._preventAutoPick = true;
                }
            } else { 
                window.addDungeonLog(`アイテムは地面に落ちた。`, '#aaa'); 
                let preLen = s.items.length; 
                window.scatterItem(s, tx, ty, itemKey); 
                for (let i = preLen; i < s.items.length; i++) {
                    s.items[i]._discarded = true; s.items[i]._visited = true; s.items[i]._preventAutoPick = true;
                }
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
                if (s.player._gravitySkip) { 
                    s.player.status.paralyzed = Math.max(s.player.status.paralyzed || 0, 1);
                    window.addDungeonLog(`⏬ 重力操作！ 体が鉛のように重くて動けない！`, '#9C27B0'); 
                }
            }
            // ★修正：俊足の腕輪の行動回数増加も廃止（回避率アップ効果は戦闘ロジックに移行）
            if (s.player._magicFlight) { actionCount += 1; s.player._magicFlight = false; window.addDungeonLog(`🪽 魔力飛行の恩恵で行動回数がアップしている！`, '#00e676'); }
            if (activeTraits.includes('クイック・アクト') && Math.random() < 0.10) { actionCount += 1; window.addDungeonLog(`⏱️ クイック・アクト発動！ 瞬時に体を動かす！`, '#00BCD4'); }
            if (activeTraits.includes('クロックアップ') && s.player.hp <= s.player.maxHp * 0.3) { if (actionCount < 2) actionCount = 2; window.addDungeonLog(`⏱️ クロックアップ！ ピンチにより思考と運動が加速している！`, '#FFD700'); }

            if (actionCount > 1) window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676');

            s.player._atkMultiplier = 1.0; 
            let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1);
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
                        let mName = window.getDungeonMonsterName ? window.getDungeonMonsterName(eSkin) : eType; // ★追加
                        s.enemies.push({ id: 'e_spawn_'+Date.now(), x: ex, y: ey, hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, damage: eDmgBase + s.floor * 2, name: `迷宮の${mName}`, type: eType, skin: eSkin, face: 'down', attackAnim: false, status: { poison:0, confusion:0, sleep:0, burn:0, frozen:0, miss_next:false, death_count:0, fear:0, blind:0 } });
                        if (s.player._isGrinding) window.addDungeonLog(`どこからか 新たな魔物の気配がする...！`, '#FF9800');
                        else window.addDungeonLog(`どこからか魔物の気配がする...`, '#aaa');
                    }
                }
            }
            
            // ==========================================
            // ★ フェイルセーフ：重なり弾き出し処理
            // ==========================================
            // プレイヤーと敵の重なりを解消
            s.enemies.forEach(e => {
                if (e.hp > 0 && e.x === s.player.x && e.y === s.player.y) {
                    let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:-1,dy:1}];
                    for (let d of dirs) {
                        let nx = e.x + d.dx; let ny = e.y + d.dy;
                        if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1 && !s.enemies.some(oe => oe.hp > 0 && oe.x === nx && oe.y === ny) && !(nx === s.player.x && ny === s.player.y)) {
                            e.x = nx; e.y = ny; e.warpAnim = true;
                            window.addDungeonLog(`💥 重力異常！ ${e.name} が弾き出された！`, '#FF9800');
                            break;
                        }
                    }
                }
            });
            // 敵同士の重なりを解消
            for (let i = 0; i < s.enemies.length; i++) {
                let e1 = s.enemies[i];
                if (e1.hp <= 0) continue;
                for (let j = i + 1; j < s.enemies.length; j++) {
                    let e2 = s.enemies[j];
                    if (e2.hp <= 0) continue;
                    if (e1.x === e2.x && e1.y === e2.y) {
                        let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:-1,dy:1}];
                        for (let d of dirs) {
                            let nx = e2.x + d.dx; let ny = e2.y + d.dy;
                            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1 && !s.enemies.some(oe => oe.hp > 0 && oe.x === nx && oe.y === ny) && !(nx === s.player.x && ny === s.player.y)) {
                                e2.x = nx; e2.y = ny; e2.warpAnim = true;
                                break;
                            }
                        }
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

    // ★追加: ターン開始時の「きれいな状態」を記録
    let turnStartStatus = JSON.parse(JSON.stringify(s.player.status || {}));

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
            if (e.status.blind > 0) e.status.blind--;
            if (e.status.sleep > 0 && e.status.sleep < 999) e.status.sleep--; // MH開幕の永続睡眠は減らさない
            if (e.status.frozen > 0) e.status.frozen--;
            if (e.status.paralyzed > 0) e.status.paralyzed--;
            if (e.status.petrified > 0) e.status.petrified--;
            if (e.status.fear > 0) e.status.fear--;
            if (e.status.sealed > 0) e.status.sealed--; 
        } else { 
            e.status = { poison: 0, confusion: 0, sleep: 0, burn: 0, frozen: 0, blind: 0, paralyzed: 0, petrified: 0, fear: 0, sealed: 0 }; 
        }
        
        if (e.hp <= 0) { window.addDungeonLog(`${e.name} は倒れた！`, '#FFD700'); continue; }
        if (e.charmed) { e.charmed = false; continue; }
        
        // 行動不可系の状態異常でターンスキップ
        if (e.status.frozen > 0) continue;
        if (e.status.paralyzed > 0) continue;
        if (e.status.petrified > 0) continue;
        if (e.status.fear > 0) continue;

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
            let isEnemyBlind = e && e.status && e.status.blind > 0;
            let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
            
            // ★ 暗闇状態のハック：隣接(1)していない限り、プレイヤーを見失っている扱いにする
            if (isEnemyBlind && dist > 1) {
                dist = 999;
            }
            
            let ex = e.x, ey = e.y, moveDir = '';
            let hasAttacked = false;
            
            // ★新規追加：直線上で、間に壁や他の敵がいないかを判定するフラグ（射線チェック）
            let isLineClear = false;
            if (e.x === s.player.x || e.y === s.player.y) {
                isLineClear = true;
                if (e.x === s.player.x) {
                    for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) {
                        if(s.grid[y][e.x]===1 || s.enemies.some(oe => oe.hp > 0 && oe.x === e.x && oe.y === y)) { isLineClear = false; break; }
                    }
                } else {
                    for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) {
                        if(s.grid[e.y][x]===1 || s.enemies.some(oe => oe.hp > 0 && oe.x === x && oe.y === e.y)) { isLineClear = false; break; }
                    }
                }
            }

            // ▼ 新規追加：封印状態の判定と、スキルスキップ用の隠蔽ハック
            let isSealed = e.status && e.status.sealed > 0;
            
            let originalSkin = e.skin;
            if (isSealed) e.skin = "sealed_dummy"; // 一時的に種族特性を消し、スキル発動を抑制する

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
            if (!hasAttacked && e.skin === 'bird_type5' && !window.isTileVisible(s, e.x, e.y) && dist > 1 && dist <= 5 && isLineClear) {
                window.addDungeonLog(`🌑 暗闇の中から ${e.name} の魔法攻撃が飛んできた！`, '#9C27B0');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#9C27B0');
                await sleep(150); e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'bird_type1' && dist <= 1) {
                let itemIdx = s.items ? s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y) : -1;
                if (itemIdx !== -1) {
                    let stolen = s.items[itemIdx]; s.items.splice(itemIdx, 1);
                    window.addDungeonLog(`🦅 ${e.name} は足元の ${window.getDungeonItemEffect(stolen.key).name} をひったくった！`, '#FF9800');
                    let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0 || (wx === s.player.x && wy === s.player.y) || s.enemies.some(en => en.hp > 0 && en.x === wx && en.y === wy));
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
            if (!hasAttacked && e.skin === 'seed_type4' && dist > 1 && dist <= 2 && isLineClear) {
                window.addDungeonLog(`🌿 ${e.name} の根のムチ！ 遠くから叩き据えられた！`, '#FF5252');
                s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 2; 
                e.attackAnim = true; 
                window.dealDungeonDamage(e, s.player); // ★修正：防御力計算とダメージのポップアップを適用！
                hasAttacked = true;
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
                if (canSeePlayer && dist > 1 && isLineClear) {
                    if (e.x < s.player.x) e.face = 'right'; else if (e.x > s.player.x) e.face = 'left'; else if (e.y < s.player.y) e.face = 'down'; else if (e.y > s.player.y) e.face = 'up';
                    window.addDungeonLog(`📡 ${e.name} の古代兵器！ ランダムな状態異常ビームを放った！`, '#E040FB');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                    let r = Math.random();
                    if (r < 0.33) { s.player.status.poison += 5; window.addDungeonLog(`🍄 猛毒を浴びた！`, '#9C27B0'); }
                    else if (r < 0.66) { s.player.status.sleep += 3; window.addDungeonLog(`💤 強烈な睡魔に襲われた！`, '#B39DDB'); }
                    else { s.player.status.confusion += 5; window.addDungeonLog(`🌀 混乱してしまった！`, '#FF9800'); }
                    e.attackAnim = true; hasAttacked = true;
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
            if (isEnemyBlind && dist > 1) canSeePlayerForRock = false; // ★暗闇ハック
            let eRoomForRock = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
            let inSameRoomForRock = (pRoomForStone && eRoomForRock && pRoomForStone === eRoomForRock);
            if (!hasAttacked && e.skin === 'stone_type5') {
                if (dist > 1 && !e._mimicRevealed) continue; 
                else if (dist === 1 && !e._mimicRevealed) { e._mimicRevealed = true; window.addDungeonLog(`🧱 壁だと思っていたものが動き出した！ ${e.name} の擬態だ！`, '#FF9800'); }
            }
            if (!hasAttacked && e.skin === 'stone_type2' && canSeePlayerForRock && dist > 1 && isLineClear && Math.random() < 0.3) {
                window.addDungeonLog(`💎 ${e.name} のクリスタル・レイ！ 直線状に眩ばゆい光線が放たれた！`, '#00BCD4');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#00BCD4');
                s.player.status.blind = (s.player.status.blind || 0) + 10; s.player.hp -= 15; s.player.damageAnim = true; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type1' && canSeePlayerForRock && dist > 1 && isLineClear && Math.random() < 0.25) {
                window.addDungeonLog(`🗿 ${e.name} の石化睨み！ 眼が合い、体が石になってしまった！`, '#757575');
                if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#757575');
                s.player.status.petrified = (s.player.status.petrified || 0) + 3; hasAttacked = true;
            }
            if (!hasAttacked && e.skin === 'stone_type3' && canSeePlayerForRock && dist > 1 && dist <= 4 && Math.random() < 0.25) {
                // ★修正：プレイヤーが視界内かつ4マス以内にいて、足元に罠がない時だけ発動する
                let existingTrap = s.traps && s.traps.find(t => t.x === s.player.x && t.y === s.player.y);
                if (!existingTrap) {
                    window.addDungeonLog(`✡️ ${e.name} のルーン設置！ 足元に地雷が召喚された！`, '#E040FB');
                    s.traps.push({ type: 'mine', x: s.player.x, y: s.player.y, visible: true }); 
                    hasAttacked = true;
                }
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
            if (isEnemyBlind && dist > 1) canSeePlayer = false; // ★暗闇ハック
            let inSameRoom = (pRoomForStone && eRoomForRock && pRoomForStone === eRoomForRock);
            let magicMult = activeTraits.includes('万物の法則') ? 0 : (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度') ? 0.5 : 1);

            if (!hasAttacked && e.skin && e.skin.includes('magician') && canSeePlayer) {
                if (e.skin === 'magician' && dist > 1 && dist <= 3 && isLineClear && Math.random() < 0.5) {
                    window.addDungeonLog(`🔥 ${e.name} の初級魔法！ 火の玉が飛んできた！`, '#FF5252');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FF5252');
                    let dmg = Math.max(1, Math.floor(10 * magicMult));
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則が魔法を完全に打ち消した！`, '#00BCD4'); else { s.player.hp -= dmg; s.player.damageAnim = true; }
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type4_2' && dist > 1 && dist <= 5 && isLineClear && Math.random() < 0.4) {
                    window.addDungeonLog(`🌋 ${e.name} のファイアボール！ 直線状に爆発が走る！`, '#FF5252');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FF9800');
                    let dmg = Math.max(1, Math.floor(25 * magicMult));
                    if (magicMult === 0) window.addDungeonLog(`🌌 万物の法則が炎を完全に打ち消した！`, '#00BCD4'); else { s.player.hp -= dmg; s.player.damageAnim = true; }
                    hasAttacked = true;
                }
                else if (e.skin === 'magician_type1' && dist > 1 && dist <= 3 && isLineClear && Math.random() < 0.3) {
                    window.addDungeonLog(`💀 ${e.name} のウィークネス！ 力が抜け、攻撃力が下がってしまった！`, '#9C27B0');
                    s.player.atkBuff = (s.player.atkBuff || 0) - 10; hasAttacked = true;
                }
                else if (e.skin === 'magician_type2_2' && dist > 1 && dist <= 4 && isLineClear && Math.random() < 0.3) {
                    window.addDungeonLog(`❄️ ${e.name} のフロスト墓標！ 氷の壁に閉じ込められ、凍りついてしまった！`, '#00BCD4');
                    s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 3; hasAttacked = true;
                }
                else if (e.skin === 'magician_type5_2' && dist > 1 && dist <= 3 && isLineClear && Math.random() < 0.25) {
                    window.addDungeonLog(`⏳ ${e.name} のタイム・ストップ！ 時間が止められ、体が全く動かない！`, '#E040FB');
                    s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 2; hasAttacked = true;
                }
                else if (e.skin === 'magician_type5_3' && dist > 1 && dist <= 4 && isLineClear && Math.random() < 0.3) {
                    window.addDungeonLog(`👁️‍🗨️ ${e.name} の予言！ 足元に危険な魔力が集まっている！`, '#FFD700');
                    s.traps.push({ type: 'mine', x: s.player.x, y: s.player.y, visible: true }); hasAttacked = true;
                }
                else if (e.skin === 'magician_type2_3' && dist > 1 && dist <= 3 && isLineClear && Math.random() < 0.3) {
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
                else if (e.skin === 'magician_type3_3' && dist > 1 && dist <= 4 && isLineClear && Math.random() < 0.15) {
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
                let adjEnemies = s.enemies.filter(oe => oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) + Math.abs(e.y - e.y) === 1);
                if (adjEnemies.length > 0) {
                    targetEnemyForAroma = adjEnemies[Math.floor(Math.random() * adjEnemies.length)];
                    window.addDungeonLog(`🌸 芳醇な香りに惑わされ、${e.name} は ${targetEnemyForAroma.name} に襲い掛かった！`, '#FF5252');
                    e.attackAnim = true;
                    window.dealDungeonDamage(e, targetEnemyForAroma);
                    hasAttacked = true;
                }
            }
            
            // ▼ 隠蔽していたスキンを元に戻し、通常攻撃や移動の処理へ進む
            if (isSealed) e.skin = originalSkin;

            if (isEnemyConfused) {
                const dirs = [];
                if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                if (dist <= 1 && Math.random() < 0.5) { e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true; moveDir = ''; }
            } 
            else {
                if (e.type === 'magician' && dist > 1 && dist <= 3 && isLineClear) {
                    if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                    window.updateDungeonUI(); 
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                    await sleep(150); 
                    e.attackAnim = true; e.isPiercing = (Math.random() < 0.20); window.dealDungeonDamage(e, s.player); e.isPiercing = false; hasAttacked = true;
                }
                else if (dist <= 1) {
                    if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                    e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true;
                } 
                // ▼ 修正：同じ部屋（大部屋MH含む）にいる場合は、距離に関係なくプレイヤーに向かって追尾するようにする！（※暗闇状態の時は除く）
                else if (dist < 6 || (inSameRoomForSD && !isEnemyBlind)) {
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

                // ★追加：鳥の索敵、またはモンハウで目覚めた敵はBFSで賢く追跡する
                if (!hasAttacked && (e.skin === 'bird_type3_2' || e.isMHActivated) && dist > 1) {
                    let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
                    distMap[e.y][e.x] = 0; let queue = [{x: e.x, y: e.y}]; let parent = {}; let found = false;
                    while(queue.length > 0) {
                        let cur = queue.shift();
                        if (cur.x === s.player.x && cur.y === s.player.y) { found = true; break; }
                        // ★処理落ち防止：20歩以上見つからなければ諦める
                        if (distMap[cur.y][cur.x] > 20) break;
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
                    } else if (e.isMHActivated) {
                        // 見失った場合はMH状態を解除し、元の徘徊ロジックに戻す
                        e.isMHActivated = false;
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

                    // ★ 閃き：視界内で敵が動くのを見て「移動（方向）」を閃く！
                    if (window.isTileVisible(s, e.x, e.y) && typeof window.triggerDungeonInspiration === 'function') {
                        if (moveDir === 'up') window.triggerDungeonInspiration('move_up');
                        else if (moveDir === 'down') window.triggerDungeonInspiration('move_down');
                        else if (moveDir === 'left') window.triggerDungeonInspiration('move_left');
                        else if (moveDir === 'right') window.triggerDungeonInspiration('move_right');
                    }

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

    // ▼ ここから下をすべて追加！
    // ==========================================
    // ★大改修：敵の全行動終了後に、状態異常の「事後防衛」を一括で行う！
    // ==========================================
    let gainedPoison = s.player.status.poison > (turnStartStatus.poison || 0);
    let gainedSleep = s.player.status.sleep > (turnStartStatus.sleep || 0);
    let gainedConfusion = s.player.status.confusion > (turnStartStatus.confusion || 0);
    let gainedParalyze = s.player.status.paralyzed > (turnStartStatus.paralyzed || 0);
    let gainedPetrify = s.player.status.petrified > (turnStartStatus.petrified || 0);
    let gainedFear = s.player.status.fear > (turnStartStatus.fear || 0);
    let gainedBurn = s.player.status.burn > (turnStartStatus.burn || 0);
    let gainedFrozen = s.player.status.frozen > (turnStartStatus.frozen || 0);
    let gainedBlind = s.player.status.blind > (turnStartStatus.blind || 0);

    let defTraits = [];
    if (s.player.equipShield) defTraits.push(...window.getDungeonItemEffect(s.player.equipShield).traits);
    if (s.player.equipArmor) defTraits.push(...window.getDungeonItemEffect(s.player.equipArmor).traits);
    
    if (gainedPoison && defTraits.includes('anti_poison')) { s.player.status.poison = turnStartStatus.poison || 0; gainedPoison = false; window.addDungeonLog(`🛡️ [抗]の印が 毒 を完全に防いだ！`, '#00BCD4'); }
    if (gainedConfusion && defTraits.includes('anti_confuse')) { s.player.status.confusion = turnStartStatus.confusion || 0; gainedConfusion = false; window.addDungeonLog(`🛡️ [静]の印が 混乱 を完全に防いだ！`, '#00BCD4'); }
    if (gainedBlind && defTraits.includes('anti_blind')) { s.player.status.blind = turnStartStatus.blind || 0; gainedBlind = false; window.addDungeonLog(`🛡️ [明]の印が 暗闇 を完全に防いだ！`, '#00BCD4'); }
    if (gainedParalyze && defTraits.includes('anti_paralyze')) { s.player.status.paralyzed = turnStartStatus.paralyzed || 0; gainedParalyze = false; window.addDungeonLog(`🛡️ [動]の印が 麻痺 を完全に防いだ！`, '#00BCD4'); }

    let isEdenActive = activeTraits.includes('エデンの果実') && (s.player.hunger >= (typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : 100));
    if (isEdenActive && (gainedPoison || gainedSleep || gainedConfusion || gainedParalyze || gainedPetrify || gainedFear || gainedBurn || gainedFrozen || gainedBlind)) {
        if (gainedPoison) s.player.status.poison = turnStartStatus.poison || 0;
        if (gainedSleep) s.player.status.sleep = turnStartStatus.sleep || 0;
        if (gainedConfusion) s.player.status.confusion = turnStartStatus.confusion || 0;
        if (gainedParalyze) s.player.status.paralyzed = turnStartStatus.paralyzed || 0;
        if (gainedPetrify) s.player.status.petrified = turnStartStatus.petrified || 0;
        if (gainedFear) s.player.status.fear = turnStartStatus.fear || 0;
        if (gainedBurn) s.player.status.burn = turnStartStatus.burn || 0;
        if (gainedFrozen) s.player.status.frozen = turnStartStatus.frozen || 0;
        if (gainedBlind) s.player.status.blind = turnStartStatus.blind || 0;
        window.addDungeonLog(`🌸 エデンの果実！ 楽園の加護がすべての異常を無効化した！`, '#FFD700');
        gainedPoison = gainedSleep = gainedConfusion = gainedParalyze = gainedPetrify = gainedFear = gainedBurn = gainedFrozen = gainedBlind = false;
    }

    if (activeTraits.includes('自然適応') && (gainedPoison || gainedSleep || gainedParalyze || gainedBurn || gainedFrozen)) {
        if (gainedPoison) s.player.status.poison = turnStartStatus.poison || 0;
        if (gainedSleep) s.player.status.sleep = turnStartStatus.sleep || 0;
        if (gainedParalyze) s.player.status.paralyzed = turnStartStatus.paralyzed || 0;
        if (gainedBurn) s.player.status.burn = turnStartStatus.burn || 0;
        if (gainedFrozen) s.player.status.frozen = turnStartStatus.frozen || 0;
        window.addDungeonLog(`🛡️⚙️ 自然適応！ 機械の体は自然界の異常を完全にシャットアウトした！`, '#00BCD4');
        gainedPoison = gainedSleep = gainedParalyze = gainedBurn = gainedFrozen = false;
    }

    if (activeTraits.includes('漆黒の鏡') && (gainedPoison || gainedSleep || gainedConfusion || gainedParalyze || gainedPetrify || gainedFear || gainedBurn || gainedFrozen || gainedBlind)) {
        let adj = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
        if (adj.length > 0) {
            adj.forEach(e => {
                if (gainedPoison) e.status.poison = (e.status.poison || 0) + 5;
                if (gainedBurn) e.status.burn = (e.status.burn || 0) + 5;
                if (gainedSleep || gainedParalyze || gainedFear || gainedPetrify || gainedFrozen) e.status.sleep = (e.status.sleep || 0) + 3;
                if (gainedConfusion || gainedBlind) e.status.confusion = (e.status.confusion || 0) + 5;
            });
            window.addDungeonLog(`🪞 漆黒の鏡！ 受けた呪いを周囲の敵に反射した！`, '#9C27B0');
        }
        if (gainedPoison) s.player.status.poison = turnStartStatus.poison || 0;
        if (gainedSleep) s.player.status.sleep = turnStartStatus.sleep || 0;
        if (gainedConfusion) s.player.status.confusion = turnStartStatus.confusion || 0;
        if (gainedParalyze) s.player.status.paralyzed = turnStartStatus.paralyzed || 0;
        if (gainedPetrify) s.player.status.petrified = turnStartStatus.petrified || 0;
        if (gainedFear) s.player.status.fear = turnStartStatus.fear || 0;
        if (gainedBurn) s.player.status.burn = turnStartStatus.burn || 0;
        if (gainedFrozen) s.player.status.frozen = turnStartStatus.frozen || 0;
        if (gainedBlind) s.player.status.blind = turnStartStatus.blind || 0;
    }
    
    if (activeTraits.includes('美しき反射') && (gainedPoison || gainedSleep || gainedConfusion || gainedParalyze || gainedPetrify || gainedFear || gainedBurn || gainedFrozen || gainedBlind)) {
        let adj = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
        if (adj.length > 0) {
            adj.forEach(e => {
                if (gainedPoison) e.status.poison = (e.status.poison || 0) + 5;
                if (gainedBurn) e.status.burn = (e.status.burn || 0) + 5;
                if (gainedSleep || gainedParalyze || gainedFear || gainedPetrify || gainedFrozen) e.status.sleep = (e.status.sleep || 0) + 3;
                if (gainedConfusion || gainedBlind) e.status.confusion = (e.status.confusion || 0) + 5;
            });
            window.addDungeonLog(`🪞 美しき反射！ 受けた状態異常を周囲の敵にそっくりそのまま返した！`, '#E040FB');
        }
    }
};

// ==========================================
// ★ ダンジョン用：作戦条件判定の厳密化フック
// ==========================================
if (typeof window._origCheckDungeonCondition === 'undefined') {
    // 既存の判定関数を退避
    window._origCheckDungeonCondition = window.checkDungeonTacticCondition;
    
    window.checkDungeonTacticCondition = function(cond, s, p) {
        // 1. 階段の判定：s.stairs変数に依存せず、グリッドから直接「発見済み階段」を探す
        if (cond === 'stairs_found') {
            for(let ry=0; ry<s.mapHeight; ry++) {
                for(let rx=0; rx<s.mapWidth; rx++) {
                    if (s.grid[ry][rx] === 2 && s.visited && s.visited[ry][rx]) return true;
                }
            }
            return false;
        }
        
        // ★追加：熟練ムーブ用の環境条件
        if (cond === 'on_stairs') {
            return s.grid[p.y][p.x] === 2 && s.visited && s.visited[p.y][p.x];
        }
        if (cond === 'in_room') {
            return s.roomsInfo && s.roomsInfo.some(rm => p.x >= rm.x && p.x < rm.x + rm.w && p.y >= rm.y && p.y < rm.y + rm.h);
        }
        if (cond === 'inventory_full') {
            let maxInv = s.player.maxInventory || 20;
            return s.player.tempInventory && s.player.tempInventory.length >= maxInv;
        }

        // ★追加：カバンの中の未識別アイテム判定
        if (cond === 'has_unidentified_item') {
            return s.player.tempInventory && s.player.tempInventory.some(i => {
                let eff = window.getDungeonItemEffect(i);
                let bId = window.parseItemString(i).baseId;
                let tName = s.aiMemory && s.aiMemory.tempNames[bId];
                // ★修正：装備品の未鑑定状態も未識別として扱う
                let isUnidConsumable = s.sessionItemDict && s.sessionItemDict[bId] && s.aiMemory && !s.aiMemory.identified.includes(bId) && (!tName || tName.startsWith("謎の"));
                let isUnidEquip = (eff.equipType !== null || eff.isWeapon || eff.isShield) && !eff.isStatsKnown;
                return isUnidConsumable || isUnidEquip;
            });
        }

        // ★追加：装備・合成条件
        if (cond === 'no_weapon') return !p.equipWeapon;
        if (cond === 'no_shield') return !p.equipShield;
        if (cond === 'no_armor') return !p.equipArmor;
        if (cond === 'no_accessory') return !p.equipAccessory;
        
        if (cond === 'can_synth_equip') {
            if (p._synthCacheTurn !== s.turnCount) window.calculateBestSynth(s);
            return !!p._bestSameSynth;
        }
        if (cond === 'can_synth_item') {
            if (p._synthCacheTurn !== s.turnCount) window.calculateBestSynth(s);
            return !!p._bestDiffSynth;
        }

        // ★追加：足元アイテムの細分化条件
        let groundItem = s.items && s.items.find(i => i.x === p.x && i.y === p.y);
        if (cond === 'on_item_any') return !!groundItem;
        if (cond === 'on_item_food' || cond === 'on_item_equip' || cond === 'on_item_unidentified') {
            if (!groundItem) return false;
            let eff = window.getDungeonItemEffect(groundItem.key); // ★確実な判定用
            
            if (cond === 'on_item_food') return groundItem.type === 'food' || eff.isConsumable;
            if (cond === 'on_item_equip') return ['weapon', 'shield', 'accessory'].includes(eff.equipType);
            if (cond === 'on_item_unidentified') {
                let eff = window.getDungeonItemEffect(groundItem.key);
                let bId = window.parseItemString(groundItem.key).baseId;
                let tName = s.aiMemory && s.aiMemory.tempNames[bId];
                let isUnidConsumable = s.sessionItemDict && s.sessionItemDict[bId] && s.aiMemory && !s.aiMemory.identified.includes(bId) && (!tName || tName.startsWith("謎の"));
                let isUnidEquip = (eff.equipType !== null || eff.isWeapon || eff.isShield) && !eff.isStatsKnown;
                return isUnidConsumable || isUnidEquip;
            }
        }
        
        // ★追加：未回収のアイテムがあるか
        if (cond === 'uncollected_item_exist') {
            let isInvFull = s.player.tempInventory && s.player.tempInventory.length >= (s.player.maxInventory || 20);
            return s.items && s.items.some(i => 
                (i.x !== p.x || i.y !== p.y) && 
                // ==========================================
                // ★完全同期：条件判定の時点でも「ゴミ」と「満杯時のスルー品」を無いものとして扱う！
                // ==========================================
                !i._discarded && 
                !(isInvFull && i._visited) && 
                (window.isTileVisible(s, i.x, i.y) || (s.visited && s.visited[i.y] && s.visited[i.y][i.x]))
            );
        }

        // 2. 未探索エリアの判定：BFSで「到達可能な」未踏マスがあるかチェックする
        if (cond === 'unexplored_exist') {
            let queue = [{x: p.x, y: p.y}];
            let bfsVisited = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(false));
            bfsVisited[p.y][p.x] = true;
            let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
            let count = 0;
            
            while(queue.length > 0) {
                let curr = queue.shift();
                
                // 未探索かつ壁でないマスを発見したら、到達可能な未探索エリアが存在する！
                if (s.grid[curr.y][curr.x] !== 1 && (!s.visited || !s.visited[curr.y][curr.x])) return true;
                
                // フリーズ防止のセーフティ（最大1000マス探索）
                if (count++ > 1000) break; 
                
                for(let d of dirs) {
                    let nx = curr.x + d.dx, ny = curr.y + d.dy;
                    if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                        // 敵がいても気にせず進める（敵は壁ではない）
                        if (!bfsVisited[ny][nx] && s.grid[ny][nx] !== 1) {
                            bfsVisited[ny][nx] = true;
                            queue.push({x: nx, y: ny});
                        }
                    }
                }
            }
            return false; // 到達可能な範囲に未踏マスは無い
        }
        
        // それ以外の条件は元の関数（デフォルト）に任せる
        if (typeof window._origCheckDungeonCondition === 'function') {
            return window._origCheckDungeonCondition(cond, s, p);
        }
        return false;
    };
}