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
            // ★修正: maxHungerTimeのNaNエラーを防ぐため固定値に変更
            if (mySkin === 'spirit_type5' && Math.random() < 0.2) s.player.hunger = Math.min(100, s.player.hunger + 0.5);

            let sameRoomSweet = s.enemies.find(e => e.hp > 0 && e.skin === 'spirit_type2_2' && window.isTileVisible(s, e.x, e.y));
            if (sameRoomSweet) {
                // ★修正: maxHungerTimeのNaNエラーを防ぐため固定値に変更
                s.player.hunger = Math.max(0, s.player.hunger - 0.5);
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
            
            // ★ カブトムシ系特性：生きた化石（風による強制ゲームオーバーを無効化）
            if (activeTraits.includes('生きた化石')) {
                if (s.floorTurn === 700) window.addDungeonLog(`🌀 強い風が吹いてきたが、生きた化石の重厚な殻は微動だにしない！`, '#FFD700');
                // 以降の風の警告やゲームオーバー処理を完全にスキップ
            } else {
                if (s.floorTurn === 700) window.addDungeonLog(`🌀 どこからか 風が吹いてきた...`, '#00BCD4');
                if (s.floorTurn === 850) window.addDungeonLog(`🌀🌀 強い風が 吹き荒れている！`, '#FF9800');
                if (s.floorTurn === 950) window.addDungeonLog(`🌀🌀🌀 突風だ！ 次の風が吹いたら 飛ばされてしまう！`, '#FF5252');
                if (s.floorTurn >= 1000) {
                    window.addDungeonLog(`🌪️ 謎の突風に 吹き飛ばされた！！！`, '#FF5252');
                    s.player.hp = 0; window.updateDungeonUI(); setTimeout(() => window.closeDungeonUI(true, false), 1500); return; 
                }
            }

            let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);

            if ((allTraits.includes('regen') || allTraits.includes('life')) && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
            if (activeTraits.includes('大地の恵み') && s.player.hp < s.player.maxHp) s.player.hp = Math.min(s.player.maxHp, s.player.hp + 2);

            if (allTraits.includes('half_hunger')) consumption *= 0.5;
            if (allTraits.includes('fast_hunger')) consumption *= 2.0;
            if (allTraits.includes('regen') && consumption > 1.0) consumption = 1.0; 

            // ★追加: 鳥系の特性「最適化ルート」
            if (activeTraits.includes('最適化ルート')) consumption *= 0.9;

            // ★ 風船系：超浮力（腹減り速度を極端に抑える）
            if (activeTraits.includes('超浮力')) consumption *= 0.1;

            // ★修正: 0.15だとAUTO時に早すぎるため 0.03（約5倍長持ち）に緩和
            if (!activeTraits.includes('無限機関')) s.player.hunger = Math.max(0, s.player.hunger - (0.03 * consumption));
            
            if (s.player.hunger <= 0) {
                s.player.hp -= 2; window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252');
            } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) {
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
            }

            if (s.player.status) {
                if (s.player.status.fear > 0) {
                    s.player.status.fear--;
                    if (s.player.status.fear <= 0) window.addDungeonLog(`恐怖が薄れ、落ち着きを取り戻した！`, '#4CAF50');
                }
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
                // ★追加：石化ステータスのターン経過
                if (s.player.status.petrified > 0) {
                    s.player.status.petrified--;
                    if (s.player.status.petrified <= 0) window.addDungeonLog(`石化が解けて動けるようになった！`, '#4CAF50');
                }
            } else {
                s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0, wet: 0, sleep: 0, petrified: 0, fear: 0 };
            }

            // ★カブトムシ系：妖精の羽（常に浮遊）を追加
            let isFlying = (s.player.skin && (s.player.skin.includes('balloon') || s.player.skin.includes('ghost') || s.player.skin.includes('bird'))) || activeTraits.includes('妖精の羽');
            let realSpd = Math.floor(ai.stats.speed || 10);
            let actionCount = 1 + Math.floor(realSpd / 50); 
            if (acEff && acEff.traits.includes('fast_move')) {
                let plus = parseInt(s.player.equipAccessory.match(/_\+(\d+)/)?.[1] || 0);
                actionCount += 1 + Math.floor(plus / 5);
            }
            // ★追加：魔力飛行のバフ消費
            if (s.player._magicFlight) {
                actionCount += 1;
                s.player._magicFlight = false; // 1ターンで消費
                window.addDungeonLog(`🪽 魔力飛行の恩恵で行動回数がアップしている！`, '#00e676');
            }
            if (actionCount > 1) { window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676'); }

            s.player._hornThrustUsed = false; // ★カブトムシ系：角突きの1ターン1回制限フラグをリセット

            for (let actStep = 0; actStep < actionCount; actStep++) {
                if (s.player.hp <= 0) break; 

                // ★修正：神眼の判定を「1アクションごと」に行うようにループ内に移動（2回行動時の罠激突を防止）
                if (activeTraits.includes('神眼') && s.traps) {
                    s.traps.forEach(t => {
                        if (!t.visible && Math.abs(t.x - s.player.x) <= 1 && Math.abs(t.y - s.player.y) <= 1) {
                            t.visible = true;
                            window.addDungeonLog(`👁️ 神眼が足元の罠を見破った！`, '#FFD700');
                        }
                    });
                }

                let currentRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
                let isDarkRoom = currentRoom ? currentRoom.isDark : false;
                let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom;
                
                // ★カブトムシ系：発光体（暗闇・視界不良を無効化）
                if (activeTraits.includes('発光体')) {
                    isDarkRoom = false;
                    isBlind = false;
                }

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
                                            
                                            if (!isFlying && (tile === 4 || tile === 10)) continue; // ★追加: 10(溝)
                                            if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) continue;
                                            if (tile === 5) {
                                                if (s.player.hp <= 20) continue; 
                                                moveCost = 20; 
                                            }
                                            
                                            // ★氷と罠を迂回シミュレート
                                            // 風船やゴーストのハードコーディング罠回避を削除（全種族共通で罠を踏む前提）
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
                                            // ★修正：_unreachableItems (ブラックリスト) に入っているアイテムは無視する
                                            let visibleItems = s.items.filter(i => window.isTileVisible(s, i.x, i.y) && s.grid[i.y][i.x] !== 5 && (!s.player._unreachableItems || !s.player._unreachableItems.includes(`${i.x},${i.y}`))); 
                                            if (visibleItems.length > 0) {
                                                let currentTargetStillValid = s.player._itemTargetPos && visibleItems.some(i => i.x === s.player._itemTargetPos.x && i.y === s.player._itemTargetPos.y);
                                                if (currentTargetStillValid) {
                                                    targetPos = s.player._itemTargetPos;
                                                } else {
                                                    let nearestItem = visibleItems.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                                    targetPos = { x: nearestItem.x, y: nearestItem.y };
                                                    s.player._itemTargetPos = targetPos;
                                                }
                                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                                                
                                                if (nextStep) {
                                                    thoughtLog = currentTargetStillValid ? "あそこのアイテムを目指して進もう。" : "あそこにアイテムが落ちている！拾いに行こう。";
                                                } else {
                                                    // ★追加：到達不可能なアイテムだったのでブラックリストに入れて諦める
                                                    if (!s.player._unreachableItems) s.player._unreachableItems = [];
                                                    s.player._unreachableItems.push(`${targetPos.x},${targetPos.y}`);
                                                    s.player._itemTargetPos = null;
                                                }
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
                                if (!isFlying && (s.grid[ny][nx] === 4 || s.grid[ny][nx] === 10)) return false; 
                                // ★追加：見えている罠をランダム行動で踏まないようにする
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

                if (typeof chosenCommand === 'object' && chosenCommand !== null) chosenCommand = chosenCommand.id;

                // ★ 風船系：夢の鼓動（時間経過で稀にアイテムがしあわせの種に変化）
                if (activeTraits.includes('夢の鼓動') && Math.random() < 0.005) {
                    let normalItems = s.player.tempInventory.filter(i => !i.includes('happy') && !i.includes('bless') && !i.includes('weapon') && !i.includes('shield') && !i.includes('armor'));
                    if (normalItems.length > 0) {
                         let target = normalItems[Math.floor(Math.random() * normalItems.length)];
                         let idx = s.player.tempInventory.indexOf(target);
                         s.player.tempInventory[idx] = 'item_seed_happy';
                         window.addDungeonLog(`🌟 夢の鼓動！ カバンの中のアイテムが「しあわせの種」に変化した！`, '#FFD700');
                    }
                }

                let isParalyzed = s.player.status && s.player.status.paralyzed > 0;
                let isPetrified = s.player.status && s.player.status.petrified > 0;
                let isFear = s.player.status && s.player.status.fear > 0;
                // ★修正：石化や恐怖の場合は移動だけでなく攻撃やアイテム使用も完全に封じる
                if ((isParalyzed || isPetrified || isFear) && ['move_up', 'move_down', 'move_left', 'move_right', 'flee', 'attack', 'throw', 'put_down'].includes(chosenCommand)) {
                    if (isPetrified) window.addDungeonLog(`🗿 体が石化して動けない！`, '#757575');
                    else if (isFear) window.addDungeonLog(`😱 恐怖で足がすくんで動けない！`, '#9C27B0');
                    else window.addDungeonLog(`⚡ 足が痺れて動けない！`, '#FF9800');
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
                    // ★追加：神鳥の舞（フロア移動時全回復）
                    if (activeTraits && activeTraits.includes('神鳥の舞')) {
                        s.player.hp = s.player.maxHp;
                        window.addDungeonLog(`✨ 神鳥の舞が発動！ 体力が完全に回復した！`, '#4CAF50');
                    }
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
                    s.player.status = { poison: 0, paralyzed: 0, blind: 0, confusion: 0, wet: 0, sleep: 0, petrified: 0 };
                    s.player.atkBuff = 0; // ★追加：階層移動で攻撃力デバフもリセット
                    s.player._itemTargetPos = null; s.player._unreachableItems = []; // ★追加：アイテムターゲットとブラックリストをリセット
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
                        // ★修正：逃げる時も見えている罠を避けるように条件を追加
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
                        
                        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
                        let isWall = s.grid[newY][newX] === 1;
                        let isWaterOrDitch = s.grid[newY][newX] === 4 || s.grid[newY][newX] === 10; // ★追加: 10(溝)

                        if (isWall) {
                            if (activeTraits.includes('重機動アーム') && newX > 0 && newX < s.mapWidth-1 && newY > 0 && newY < s.mapHeight-1) {
                                window.addDungeonLog(`💥 重機動アームで壁を粉砕した！`, '#FFD700');
                                s.grid[newY][newX] = 0; 
                            } else {
                                window.addDungeonLog(`ガンッ！ 壁にぶつかった！`, '#aaa');
                                continue;
                            }
                        } else if (!isFlying && isWaterOrDitch) {
                            window.addDungeonLog(`ガンッ！ 水脈や溝にぶつかった！`, '#aaa');
                            continue;
                        }

                        let hitEnemy = s.enemies.find(e => e.x === newX && e.y === newY && e.hp > 0);
                        if (hitEnemy) {
                            if (activeTraits.includes('角突き') && !s.player._hornThrustUsed) {
                                window.addDungeonLog(`🪲 角突き！ 突進の勢いで ${hitEnemy.name} を撥ね飛ばした！`, '#FFD700');
                                s.player.attackAnim = true;
                                window.dealDungeonDamage(s.player, hitEnemy);
                                // 吹き飛ばし処理
                                let dx = Math.sign(hitEnemy.x - s.player.x); let dy = Math.sign(hitEnemy.y - s.player.y);
                                if (dx === 0 && dy === 0) dx = 1;
                                let nx = hitEnemy.x + dx; let ny = hitEnemy.y + dy;
                                if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(e => e.hp > 0 && e !== hitEnemy && e.x === nx && e.y === ny)) {
                                    hitEnemy.x = nx; hitEnemy.y = ny; hitEnemy.warpAnim = true;
                                }
                                s.player._hornThrustUsed = true;
                                actStep--; // ★ターン消費なし！（もう一度行動できる）
                                await sleep(100);
                                continue;
                            } else {
                                window.addDungeonLog(`ゴツン！ 敵にぶつかった！`, '#FF9800'); s.player.attackAnim = true;
                            }
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

                            // ★修正: 風船・ゴーストのハードコーディング罠回避を削除（罠回避は特性システムに一任）
                            // ★カブトムシ系：妖精の羽（罠を完全に無効化）
                            if (s.traps && !activeTraits.includes('妖精の羽')) {
                                let trap = s.traps.find(t => t.x === s.player.x && t.y === s.player.y);
                                let oldStatus = JSON.parse(JSON.stringify(s.player.status || {})); // ★ 状態異常記録
                                
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
                                        if (activeTraits.includes('不朽の硬度')) {
                                            dmg = Math.floor(dmg / 2);
                                            window.addDungeonLog(`💣 地雷が大爆発！しかし 不朽の硬度 でダメージを抑えた！`, '#00BCD4'); 
                                        } else {
                                            window.addDungeonLog(`💣 地雷が大爆発！(HPが半分になった！)`, '#FF5252'); 
                                        }
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

                                    // ★ 風船系パッシブ：毒ガスタンク＆美しき反射（罠によるデバフ）
                                    if (trap && !activeTraits.includes('大地の恵み')) {
                                        let gainedPoison = s.player.status.poison > (oldStatus.poison || 0);
                                        let gainedBlind = s.player.status.blind > (oldStatus.blind || 0);
                                        let gainedParalyze = s.player.status.paralyzed > (oldStatus.paralyzed || 0);
                                        
                                        if (activeTraits.includes('毒ガスタンク') && gainedPoison) {
                                            s.player.atkBuff = (s.player.atkBuff || 0) + 5;
                                            window.addDungeonLog(`🎈 毒ガスタンク起動！ 毒を力に変えて攻撃力が上がった！`, '#FFD700');
                                        }
                                        if (activeTraits.includes('美しき反射') && (gainedPoison || gainedBlind || gainedParalyze)) {
                                            let adj = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
                                            if (adj.length > 0) {
                                                adj.forEach(e => {
                                                    if (gainedPoison) e.status.poison = (e.status.poison || 0) + 5;
                                                    if (gainedBlind) e.status.confusion = (e.status.confusion || 0) + 5; // 盲目→混乱へ変換
                                                    if (gainedParalyze) e.status.sleep = (e.status.sleep || 0) + 3; // 麻痺→睡眠へ変換
                                                });
                                                window.addDungeonLog(`🪞 美しき反射！ 罠で受けた状態異常を周囲の敵にばら撒いた！`, '#E040FB');
                                            }
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

                    // ★ 追加：素振り（攻撃行動）による目の前の罠発見
                    let tx = s.player.x; let ty = s.player.y;
                    if (s.player.face === 'up') ty--; else if (s.player.face === 'down') ty++; else if (s.player.face === 'left') tx--; else if (s.player.face === 'right') tx++;
                    
                    if (s.traps) {
                        let hiddenTrap = s.traps.find(t => t.x === tx && t.y === ty && !t.visible);
                        if (hiddenTrap) {
                            hiddenTrap.visible = true;
                            window.addDungeonLog(`👀 目の前に隠された罠を発見した！`, '#FFD700');
                        }
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
                            
                            // ★追加：魔力飛行の発動
                            if (activeTraits.includes('魔力飛行')) {
                                s.player._magicFlight = true;
                            }
                            
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

            // ★ 風船系敵特性：ガス抜け（2ターンに1回しか行動しない）
            if (e.skin === 'balloon_type5') {
                e._gasSkip = !e._gasSkip;
                if (e._gasSkip) continue;
            }
            
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

                // ★追加：暴風域（周囲2マスの者を吹き飛ばす）
                if (e.skin && e.skin === 'bird_type4_2') {
                    let blowTargets = [];
                    if (dist > 0 && dist <= 2) blowTargets.push(s.player);
                    s.enemies.forEach(oe => { if (oe !== e && oe.hp > 0 && Math.abs(oe.x - e.x) + Math.abs(oe.y - e.y) <= 2 && Math.abs(oe.x - e.x) + Math.abs(oe.y - e.y) > 0) blowTargets.push(oe); });
                    if (blowTargets.length > 0) {
                        window.addDungeonLog(`🌪️ ${e.name} の暴風域！ 周囲が吹き飛ばされる！`, '#00BCD4');
                        blowTargets.forEach(tgt => {
                            let dx = Math.sign(tgt.x - e.x); let dy = Math.sign(tgt.y - e.y);
                            if (dx === 0 && dy === 0) dx = 1; // 座標被り回避
                            if (tgt === s.player && activeTraits.includes('暴風の主')) {
                                window.addDungeonLog(`しかし ${s.player.name} は風を支配し、逆に弾き返した！`, '#00BCD4');
                                if (s.grid[e.y-dy] && s.grid[e.y-dy][e.x-dx] !== 1) { e.x -= dx; e.y -= dy; }
                            } else {
                                if (s.grid[tgt.y+dy] && s.grid[tgt.y+dy][tgt.x+dx] !== 1) { tgt.x += dx; tgt.y += dy; }
                            }
                        });
                        window.updateDungeonUI(); await sleep(100);
                        dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y); // 距離再計算
                    }
                }

                // ★追加：死肉喰らい（倒れた敵を食べる）
                if (!hasAttacked && e.skin && e.skin === 'bird_type1_2' && e.hp < e.maxHp) {
                    let corpseIdx = s.enemies.findIndex(oe => oe !== e && oe.hp <= 0 && !oe.eaten);
                    if (corpseIdx !== -1) {
                        let corpse = s.enemies[corpseIdx];
                        corpse.eaten = true;
                        e.x = corpse.x; e.y = corpse.y; 
                        e.hp = e.maxHp; e.damage += 5; e.atkBuff = (e.atkBuff || 0) + 5;
                        window.addDungeonLog(`🍖 ${e.name} は ${corpse.name} の死肉を喰らい、完全回復＆パワーアップした！`, '#FF5252');
                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'heal');
                        hasAttacked = true;
                    }
                }

                // ★追加：急降下（3マス離れていると一気に詰めて大ダメージ）
                if (!hasAttacked && e.skin && e.skin === 'bird_type4' && dist === 3) {
                    let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                    if (e.x === s.player.x || e.y === s.player.y) {
                        let clear = true;
                        if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][e.x]===1) clear=false; }
                        else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[e.y][x]===1) clear=false; }
                        
                        if (clear) {
                            window.addDungeonLog(`🦅 ${e.name} の急降下！ 一気に距離を詰めてきた！`, '#FF5252');
                            e.x = s.player.x - dx; e.y = s.player.y - dy; // プレイヤーの隣に着地
                            e.attackAnim = true;
                            let origDmg = e.damage; e.damage = Math.floor(e.damage * 1.5);
                            window.dealDungeonDamage(e, s.player);
                            e.damage = origDmg;
                            hasAttacked = true;
                        }
                    }
                }

                // ★ 風船系敵特性：バウンド・プレス（2マス先からジャンプして踏みつけ＆麻痺）
                if (!hasAttacked && e.skin === 'balloon_type4' && dist === 2) {
                    let dx = Math.sign(s.player.x - e.x); let dy = Math.sign(s.player.y - e.y);
                    if ((e.x === s.player.x || e.y === s.player.y) && s.grid[s.player.y - dy][s.player.x - dx] !== 1) {
                        window.addDungeonLog(`🎈 ${e.name} のバウンド・プレス！ 大ジャンプで押し潰してきた！`, '#FF5252');
                        e.x = s.player.x - dx; e.y = s.player.y - dy; // プレイヤーの隣に着地
                        e.attackAnim = true;
                        window.dealDungeonDamage(e, s.player);
                        s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 1; // 1ターン行動不能
                        window.addDungeonLog(`⚡ 押し潰されて動けない！`, '#FF9800');
                        hasAttacked = true;
                    }
                }

                // ★ 風船系敵特性：落雷予測（プレイヤーの頭上に雷を落とす）
                if (!hasAttacked && e.skin === 'balloon_type3' && Math.random() < 0.20) {
                    let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
                    let eRoom = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
                    let canSee = window.isTileVisible(s, e.x, e.y);
                    if ((pRoom && eRoom && pRoom === eRoom) || canSee) {
                        window.addDungeonLog(`☁️ ${e.name} の落雷予測！ プレイヤーの頭上に雷が落ちる！`, '#FFD700');
                        let pTile = s.grid[s.player.y][s.player.x];
                        let dmg = 15;
                        if (pTile === 4 || pTile === 9) { // 水脈や浅瀬
                            dmg *= 2;
                            window.addDungeonLog(`⚡ 水場にいたため、雷のダメージが倍増した！`, '#FF5252');
                        }
                        let activeTraits = window.getPlayerDungeonTraits ? window.getPlayerDungeonTraits(s.player.skin).map(t => t.name) : [];
                        if (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度')) {
                            dmg = Math.max(1, Math.floor(dmg / 2));
                            window.addDungeonLog(`🌈 特性により雷のダメージを半減した！`, '#00BCD4');
                        }
                        s.player.hp -= dmg; s.player.damageAnim = true;
                        if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, dmg, true);
                        hasAttacked = true;
                    }
                }

                // ★ 風船系敵特性：狙撃レンズ（直線状に入った瞬間に遠距離レーザー）
                if (!hasAttacked && e.skin === 'balloon_type3_2') {
                    if (e.x === s.player.x || e.y === s.player.y) {
                        let clear = true;
                        if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][e.x]===1) clear=false; }
                        else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[e.y][x]===1) clear=false; }
                        
                        if (clear) {
                            window.addDungeonLog(`🎯 ${e.name} の狙撃レンズ！ 視界に入った瞬間にレーザーで撃ち抜かれた！`, '#FF5252');
                            if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#FFD700');
                            e.attackAnim = true;
                            let origDmg = e.damage; e.damage = Math.floor(e.damage * 1.5);
                            window.dealDungeonDamage(e, s.player);
                            e.damage = origDmg;
                            hasAttacked = true;
                        }
                    }
                }

                // ★ 風船系敵特性：衛星軌道レーザー（3ターン後に部屋全体に即死級ダメージ）
                if (e.skin === 'balloon_type3_3') {
                    let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
                    let eRoom = s.roomsInfo.find(r => e.x >= r.x && e.x < r.x+r.w && e.y >= r.y && e.y < r.y+r.h);
                    
                    if (pRoom && eRoom && pRoom === eRoom) {
                        e._laserTimer = (e._laserTimer || 0) + 1;
                        hasAttacked = true; // ★ 照準中は移動・通常攻撃を行わない
                        if (e._laserTimer === 1) window.addDungeonLog(`⚠️ ${e.name} が衛星軌道レーザーの照準を合わせた！(発射まで あと3ターン)`, '#FF5252');
                        else if (e._laserTimer === 2) window.addDungeonLog(`⚠️ 衛星レーザー発射まで あと2ターン！`, '#FF5252');
                        else if (e._laserTimer === 3) window.addDungeonLog(`⚠️ 衛星レーザー発射まで あと1ターン！ 部屋から逃げろ！`, '#FF5252');
                        else if (e._laserTimer >= 4) {
                            window.addDungeonLog(`🛰️ 衛星軌道レーザー発射！！！ 部屋全体が焼き尽くされた！`, '#FFD700');
                            s.player.hp -= 999; s.player.damageAnim = true;
                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, 999, true);
                            if (typeof window.playDungeonVFX === 'function') {
                                for(let ry=pRoom.y; ry<pRoom.y+pRoom.h; ry++) {
                                    for(let rx=pRoom.x; rx<pRoom.x+pRoom.w; rx++) {
                                        if (s.grid[ry][rx] !== 1) window.playDungeonVFX(rx, ry, 'fire');
                                    }
                                }
                            }
                            s.enemies.forEach(oe => {
                                if (oe !== e && oe.hp > 0 && oe.x >= pRoom.x && oe.x < pRoom.x+pRoom.w && oe.y >= pRoom.y && oe.y < pRoom.y+pRoom.h) {
                                    oe.hp -= 999; oe.damageAnim = true;
                                }
                            });
                            e._laserTimer = 0;
                        }
                    } else {
                        if (e._laserTimer > 0) window.addDungeonLog(`💨 対象が部屋から出たため、衛星レーザーの照準がリセットされた。`, '#aaa');
                        e._laserTimer = 0;
                    }
                }

                // ★追加：夜行性（視界外から正確に魔法攻撃）
                if (!hasAttacked && e.skin && e.skin === 'bird_type5' && !window.isTileVisible(s, e.x, e.y) && dist <= 5) {
                    window.addDungeonLog(`🌑 暗闇の中から ${e.name} の魔法攻撃が飛んできた！`, '#9C27B0');
                    if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#9C27B0');
                    await sleep(150);
                    e.attackAnim = true; window.dealDungeonDamage(e, s.player);
                    hasAttacked = true;
                }

                // ★追加：ひったくり（足元のアイテムを奪ってワープ）
                if (!hasAttacked && e.skin && e.skin === 'bird_type1' && dist === 1) {
                    let itemIdx = s.items ? s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y) : -1;
                    if (itemIdx !== -1) {
                        let stolen = s.items[itemIdx];
                        s.items.splice(itemIdx, 1);
                        window.addDungeonLog(`🦅 ${e.name} は足元の ${window.getDungeonItemEffect(stolen.key).name} をひったくった！`, '#FF9800');
                        let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0);
                        e.x = wx; e.y = wy; e.warpAnim = true;
                        window.addDungeonLog(`🌀 そしてどこかへワープして逃げた！`, '#E040FB');
                        hasAttacked = true;
                    }
                }

                // ★追加：ルーン魔方陣（足元に魔法陣を描く）
                if (!hasAttacked && e.skin && e.skin === 'bird_type3' && Math.random() < 0.2 && s.grid[e.y][e.x] === 0) {
                    window.addDungeonLog(`✡️ ${e.name} は足元にルーン魔方陣を描いた！`, '#E040FB');
                    s.grid[e.y][e.x] = 11; // 11: ルーン魔方陣
                    hasAttacked = true;
                }

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

                    // ★追加：追跡レーダー（通常移動を上書きし、障害物を完璧に迂回する）
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
                                    if (distMap[ny][nx] === Infinity) {
                                        distMap[ny][nx] = distMap[cur.y][cur.x] + 1;
                                        parent[`${nx},${ny}`] = {x: cur.x, y: cur.y, dir: d.cmd};
                                        queue.push({x: nx, y: ny});
                                    }
                                }
                            }
                        }
                        if (found) {
                            let curr = {x: s.player.x, y: s.player.y};
                            while(parent[`${curr.x},${curr.y}`] && (parent[`${curr.x},${curr.y}`].x !== e.x || parent[`${curr.x},${curr.y}`].y !== e.y)) {
                                curr = parent[`${curr.x},${curr.y}`];
                            }
                            if (parent[`${curr.x},${curr.y}`]) {
                                ex = curr.x; ey = curr.y; moveDir = parent[`${curr.x},${curr.y}`].dir;
                            }
                        }
                    }
                }

                if (hasAttacked) { window.updateDungeonUI(); await sleep(150); continue; }
                if (moveDir !== '') {
                    let occupied = s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === ex && oe.y === ey);
                    let playerHit = (ex === s.player.x && ey === s.player.y);
                    if (!occupied && !playerHit) { 
                        let isEnemyFlying = e.type === 'balloon' || e.type === 'ghost' || e.type === 'bird';
                        if (!isEnemyFlying && (s.grid[ey][ex] === 4 || s.grid[ey][ex] === 10)) continue; // ★追加: 敵AIの溝回避
                        
                        e.x = ex; e.y = ey; e.face = moveDir; 
                        // ★ 風船系敵特性：爆弾投下（移動時に確率で地雷を設置）
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