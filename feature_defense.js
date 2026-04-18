// ==========================================
// 🛡️ 島防衛シミュレーション（feature_defense.js）完全版
// ==========================================

window.DEFENSE_CONFIG = {
    maxDeploy: 5, triggerChance: 0.3,
    baseSpeed: { 'robot': 3, 'ghost': 4, 'balloon': 2, 'stone': 2, 'machine': 4, 'bird': 5, 'dragon': 3, 'seed': 2, 'magician': 3, 'spirit': 4, 'beetle': 2 },
    facilities: {
        'castle': { name: '王城', maxHp: 2000, rebuildCost: 50000, effect: 'def_up', desc: '防御力大アップ' },
        'house': { name: '農家', maxHp: 500, rebuildCost: 2000, effect: 'heal_10', desc: '毎ターンHP10%回復' },
        'hut': { name: '小屋', maxHp: 300, rebuildCost: 500 }, // ★追加：小屋
        'restaurant': { name: 'レストラン', maxHp: 600, rebuildCost: 5000, effect: 'heal_20', desc: '毎ターンHP20%回復' },
        'smith': { name: '鍛冶屋', maxHp: 800, rebuildCost: 8000, effect: 'atk_up', desc: '攻撃力アップ' },
        'casino': { name: 'カジノ', maxHp: 1000, rebuildCost: 30000, effect: 'money_up', desc: '戦闘報酬アップ' },
        'shop': { name: 'ショップ', maxHp: 600, rebuildCost: 4000 },
        'card_shop': { name: 'カード屋', maxHp: 800, rebuildCost: 10000 }, // ★追加：カードショップ
        'farm': { name: '畑', maxHp: 300, rebuildCost: 1000 },
        'bridge': { name: '橋', maxHp: 400, rebuildCost: 1500 }
    }
};

window.DEFENSE_SKILL_DB = {
    'robot': [ { req: 0, name: 'アイアンナックル', type: 'melee', power: 1.2, range: 1, effect: 'impact' }, { req: 40, name: 'ロケットパンチ', type: 'shoot', power: 1.5, range: 2, effect: 'beam' }, { req: 100, name: '殲滅レーザー', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
    'spirit': [ { req: 0, name: '精霊の光', type: 'shoot', power: 1.1, range: 2, effect: 'beam' }, { req: 50, name: 'ホーリーレイ', type: 'shoot', power: 1.6, range: 3, effect: 'beam' }, { req: 120, name: 'スターダスト', type: 'shoot', power: 2.8, range: 4, effect: 'explosion' } ],
    'bird': [ { req: 0, name: 'つつく', type: 'melee', power: 1.2, range: 1, effect: 'slash' }, { req: 40, name: 'ウィンドカッター', type: 'shoot', power: 1.4, range: 3, effect: 'slash' }, { req: 100, name: 'トルネード', type: 'shoot', power: 2.2, range: 3, effect: 'explosion' } ],
    'dragon': [ { req: 0, name: 'かみつく', type: 'melee', power: 1.3, range: 1, effect: 'slash' }, { req: 60, name: 'ファイアブレス', type: 'shoot', power: 1.8, range: 3, effect: 'explosion' }, { req: 150, name: 'メテオストライク', type: 'shoot', power: 3.0, range: 5, effect: 'explosion' } ],
    'ghost': [ { req: 0, name: 'おどかす', type: 'melee', power: 1.1, range: 1, effect: 'impact' }, { req: 40, name: 'ポルターガイスト', type: 'shoot', power: 1.5, range: 3, effect: 'explosion' }, { req: 100, name: 'カオティックフレア', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
    'magician': [ { req: 0, name: 'マジックスタッフ', type: 'melee', power: 1.1, range: 1, effect: 'impact' }, { req: 40, name: 'ファイアボール', type: 'shoot', power: 1.6, range: 3, effect: 'explosion' }, { req: 100, name: 'アルテマ', type: 'shoot', power: 2.6, range: 4, effect: 'beam' } ],
    'machine': [ { req: 0, name: 'ドリルアタック', type: 'melee', power: 1.3, range: 1, effect: 'slash' }, { req: 50, name: 'ガトリングガン', type: 'shoot', power: 1.4, range: 3, effect: 'impact' }, { req: 120, name: 'サテライトキャノン', type: 'shoot', power: 2.8, range: 5, effect: 'beam' } ],
    'stone': [ { req: 0, name: 'ロッククラッシュ', type: 'melee', power: 1.4, range: 1, effect: 'impact' }, { req: 50, name: 'ストーンエッジ', type: 'shoot', power: 1.5, range: 2, effect: 'slash' }, { req: 110, name: 'アースクエイク', type: 'shoot', power: 2.4, range: 3, effect: 'explosion' } ],
    'balloon': [ { req: 0, name: 'バウンス', type: 'melee', power: 1.0, range: 1, effect: 'impact' }, { req: 30, name: 'エアショット', type: 'shoot', power: 1.3, range: 2, effect: 'impact' }, { req: 90, name: 'バーストストーム', type: 'shoot', power: 2.1, range: 3, effect: 'explosion' } ],
    'seed': [ { req: 0, name: 'つるのムチ', type: 'melee', power: 1.1, range: 2, effect: 'slash' }, { req: 40, name: 'タネマシンガン', type: 'shoot', power: 1.4, range: 3, effect: 'impact' }, { req: 100, name: 'ソーラービーム', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
    'beetle': [ { req: 0, name: 'ホーンタックル', type: 'melee', power: 1.3, range: 1, effect: 'impact' }, { req: 50, name: 'ソニックブーム', type: 'shoot', power: 1.4, range: 3, effect: 'slash' }, { req: 110, name: 'ギガインパクト', type: 'melee', power: 2.8, range: 1, effect: 'explosion' } ],
    'default': [ { req: 0, name: 'たいあたり', type: 'melee', power: 1.1, range: 1, effect: 'impact' }, { req: 50, name: '気合弾', type: 'shoot', power: 1.5, range: 2, effect: 'beam' } ]
};

window.DEFENSE_STATE = { 
    isActive: false, isEmergency: false, emergencyTimer: null, 
    deployedParty: [], enemies: [], facilities: [], turn: 1, autoMode: false, animMode: true, activeUnit: null, 
    moveHighlights: [], attackHighlights: [],
    waveConfig: { totalToSpawn: 0, spawnedSoFar: 0, turnsUntilNextSpawn: 0 },
    mode: 'normal', mockTarget: null
};

if (typeof window.wait === 'undefined') window.wait = ms => new Promise(r => setTimeout(r, ms));

window.getGridPixelPos = function(gx, gy) {
    if (typeof gx !== 'number' || isNaN(gx)) gx = 10;
    if (typeof gy !== 'number' || isNaN(gy)) gy = 6;
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let castle = Object.values(currentAssets).find(a => a && a.type === 'castle');
    let cdx = 400, cdy = 240; 
    if (castle) {
        let sc = castle.scale !== undefined ? castle.scale : 0.5;
        cdx = castle.dx + (castle.sw * sc) / 2; cdy = castle.dy + (castle.sh * sc) / 2 + 20; 
    }
    let cGx = 10; let cGy = 6;
    let diffGx = gx - cGx; let diffGy = gy - cGy;
    let px = cdx + (diffGx * 50); let py = cdy + (diffGy * 25);
    let castleOdd = (cGy % 2 !== 0); let targetOdd = (gy % 2 !== 0);
    if (!castleOdd && targetOdd) px += 25; if (castleOdd && !targetOdd) px -= 25;
    return { x: px, y: py };
};

window.isTerrainPassable = function(gx, gy) {
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let isLand = false; let isWater = false;
    Object.values(currentAssets).forEach(a => {
        if (a && a.gridX === gx && a.gridY === gy) {
            if (['water', 'sea', 'river', 'water3'].includes(a.type)) isWater = true;
            else if (['ground', 'road', 'bridge', 'farm', 'castle', 'house', 'restaurant', 'smith', 'shop', 'casino'].includes(a.type)) isLand = true;
        }
    });
    if (isWater && !isLand) return false; 
    if (isLand) return true; 
    return false; 
};

window.getValidLandGrids = function() {
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let grids = []; let gridSet = new Set();
    Object.values(currentAssets).forEach(a => {
        if (a && ['ground', 'road', 'bridge', 'farm'].includes(a.type)) {
            let gx = a.gridX; let gy = a.gridY;
            if (gx !== undefined && gy !== undefined) {
                let key = gx + ',' + gy;
                if (!gridSet.has(key) && window.isTerrainPassable(gx, gy)) { gridSet.add(key); grids.push({x: gx, y: gy}); }
            }
        }
    });
    if (grids.length === 0) grids.push({x: 10, y: 6}); 
    return grids;
};

window.isGridOccupied = function(gx, gy) {
    if (window.DEFENSE_STATE.castleGrid && gx === window.DEFENSE_STATE.castleGrid.x && gy === window.DEFENSE_STATE.castleGrid.y) return true; 
    let p = window.DEFENSE_STATE.deployedParty.some(u => u.gridX === gx && u.gridY === gy && u.hp > 0);
    let e = window.DEFENSE_STATE.enemies.some(u => u.gridX === gx && u.gridY === gy && u.hp > 0);
    let f = window.DEFENSE_STATE.facilities.some(fac => fac.gridX === gx && fac.gridY === gy && fac.hp > 0);
    return p || e || f;
};

window.getMovableGrids = function(unit) {
    let speed = Math.min(Math.floor(unit.speed), 30); let cx = unit.gridX; let cy = unit.gridY; let grids = [];
    for (let x = cx - speed; x <= cx + speed; x++) {
        for (let y = cy - speed; y <= cy + speed; y++) {
            let dist = Math.abs(x - cx) + Math.abs(y - cy); if (dist > speed) continue; 
            if (!window.isTerrainPassable(x, y)) continue; 
            if (window.isGridOccupied(x, y) && (x !== cx || y !== cy)) continue; 
            grids.push({x, y});
        }
    }
    return grids;
};

window.getAttackableGrids = function(unit) {
    let cx = unit.gridX; let cy = unit.gridY; let maxRange = unit.maxRange || 1; let grids = [];
    for (let x = cx - maxRange; x <= cx + maxRange; x++) {
        for (let y = cy - maxRange; y <= cy + maxRange; y++) {
            let dist = Math.abs(x - cx) + Math.abs(y - cy); if (dist > maxRange || dist === 0) continue; 
            grids.push({x, y});
        }
    }
    return grids;
};

window.calculateSRPGPath = function(unit, targetX, targetY) {
    let speed = Math.min(Math.floor(unit.speed), 30); let curX = unit.gridX; let curY = unit.gridY; let bestX = curX; let bestY = curY;
    let minDist = Math.abs(curX - targetX) + Math.abs(curY - targetY);
    for (let x = curX - speed; x <= curX + speed; x++) {
        for (let y = curY - speed; y <= curY + speed; y++) {
            let dist = Math.abs(x - curX) + Math.abs(y - curY); if (dist > speed) continue; 
            if (!window.isTerrainPassable(x, y)) continue; 
            if (window.isGridOccupied(x, y)) continue; 
            
            let tDist = Math.abs(x - targetX) + Math.abs(y - targetY);
            if (tDist < minDist) { minDist = tDist; bestX = x; bestY = y; }
        }
    }
    if (Math.abs(curX - targetX) + Math.abs(curY - targetY) <= unit.maxRange) return {x: curX, y: curY};
    if (window.DEFENSE_STATE.castleGrid && targetX === window.DEFENSE_STATE.castleGrid.x && targetY === window.DEFENSE_STATE.castleGrid.y) {
        if (Math.abs(curX - targetX) + Math.abs(curY - targetY) <= unit.maxRange) return {x: curX, y: curY};
        if (bestX === targetX && bestY === targetY) {
            bestX = (curX < targetX) ? targetX - 1 : (curX > targetX) ? targetX + 1 : targetX;
            bestY = (curY < targetY) ? targetY - 1 : (curY > targetY) ? targetY + 1 : targetY;
        }
    }
    return {x: bestX, y: bestY};
};

window.showDefenseMessage = async function(text, color) {
    let msg = document.createElement('div');
    msg.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); font-size:48px; font-weight:bold; color:${color}; text-shadow: 0 4px 10px rgba(0,0,0,0.8), 0 0 20px ${color}, 0 0 40px ${color}; z-index:60000; opacity:0; transition:opacity 0.2s; pointer-events:none; white-space:nowrap; font-family:sans-serif; letter-spacing:4px;`;
    msg.innerText = text; document.body.appendChild(msg);
    requestAnimationFrame(() => msg.style.opacity = '1'); await window.wait(1500); msg.style.opacity = '0'; await window.wait(300); msg.remove();
};

window.startDefenseMonitor = function() {
    setInterval(() => {
        // ★追加：デバッグで襲撃イベントOFFに設定されている場合はスキップ
        if (window.DEFENSE_STATE && window.DEFENSE_STATE.noAttack) return;
        
        if (window.DEFENSE_STATE.isActive || window.DEFENSE_STATE.isEmergency) return;
        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        let hasCastle = Object.values(currentAssets).some(a => a && a.type === 'castle');
        if (hasCastle && Math.random() < window.DEFENSE_CONFIG.triggerChance) window.triggerEmergency();
    }, 60000); 
};

window.triggerEmergency = function() {
    if (window.DEFENSE_STATE.isEmergency) return;
    window.DEFENSE_STATE.isEmergency = true;

    // ★追加：襲撃BGMの再生（bgm_defense_start.mp3）
    if (window.audioManager) {
        window.audioManager.playBGM('defense_start');
    }
    
    let marquee = document.getElementById('emergency-marquee');
    if (!marquee) {
        marquee = document.createElement('div'); marquee.id = 'emergency-marquee';
        marquee.style.cssText = `position:fixed; top:60px; left:0; width:100vw; background:rgba(255,0,0,0.85); color:white; font-size:24px; font-weight:bold; padding:10px 0; z-index:40000; overflow:hidden; white-space:nowrap; border-top:2px solid #FFEB3B; border-bottom:2px solid #FFEB3B; box-shadow:0 0 20px red; pointer-events:none;`;
        let style = document.createElement('style'); style.innerHTML = `@keyframes alert-marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`;
        document.head.appendChild(style); document.body.appendChild(marquee);
    }
    marquee.innerHTML = `<div style="display:inline-block; padding-left:20px; animation:alert-marquee 12s linear infinite;">🚨 【緊急防衛クエスト】島に魔物が接近中！「王城」へ向かい迎撃せよ！！（放置すると施設が破壊されます） 🚨</div>`;
    marquee.style.display = 'block';

    window.DEFENSE_STATE.facilities = [];
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let castleAsset = Object.values(currentAssets).find(a => a && a.type === 'castle');
    let cx = 10; let cy = 6; 

    Object.values(currentAssets).forEach(a => {
        if (a) {
            if (a === castleAsset) { a.gridX = cx; a.gridY = cy; } 
            else if (castleAsset) {
                let diffPx = a.dx - castleAsset.dx; let diffPy = a.dy - castleAsset.dy;
                let dGy = Math.round(diffPy / 25); let oddOffset = (dGy % 2 !== 0) ? 25 : 0;
                let dGx = Math.round((diffPx - oddOffset) / 50);
                a.gridX = cx + dGx; a.gridY = cy + dGy;
            }
        }
    });

    Object.keys(currentAssets).forEach(key => {
        let a = currentAssets[key];
        let validTypes = Object.keys(window.DEFENSE_CONFIG.facilities);
        if (a && validTypes.includes(a.type)) {
            let conf = window.DEFENSE_CONFIG.facilities[a.type];
            window.DEFENSE_STATE.facilities.push({ id: key, type: a.type, name: conf.name, team: 'facility', gridX: a.gridX, gridY: a.gridY, hp: conf.maxHp, maxHp: conf.maxHp });
        }
    });

    if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
    
    window.DEFENSE_STATE.emergencyTimer = setInterval(() => {
        if (window.DEFENSE_STATE.isEmergency && !window.DEFENSE_STATE.isActive) {
            let targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0 && f.type !== 'castle'); 
            if (!targetFac) targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0);
            
            if (targetFac) {
                targetFac.hp -= 50; 
                // ★追加: 放置ダメージを大元データにも同期
                let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                if (currentAssets[targetFac.id]) currentAssets[targetFac.id].hp = targetFac.hp;

                if (typeof floatingTexts !== 'undefined') {
                    let pos = window.getGridPixelPos(targetFac.gridX, targetFac.gridY);
                    floatingTexts.push({ text: `-50`, x: pos.x, y: pos.y - 50, color: "#ff5252", life: 60, dy: -1 });
                }
                
                if (targetFac.hp <= 0) {
                    if (targetFac.type === 'castle') {
                        clearInterval(window.DEFENSE_STATE.emergencyTimer);
                        // ★追加：襲撃BGMを停止
                        if (window.audioManager) { window.audioManager.stopBGM(); }
                        marquee.style.display = 'none'; window.DEFENSE_STATE.isEmergency = false;
                        alert("防衛を放置したため、王城が陥落してしまいました..."); window.executeAbandon(); 
                    } else {
                        let delAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                        if (delAssets[targetFac.id]) delete delAssets[targetFac.id];
                    }
                }
            }
        }
    }, 30000); 
};

if (typeof window.originalOpenArenaReception === 'undefined') {
    window.originalOpenArenaReception = window.openArenaReception;
}
window.openArenaReception = function() {
    if (window.DEFENSE_STATE.isActive) return; 

    // ★追加：ロビーBGMを再生（襲撃BGMなどを上書き）
    if (window.audioManager) {
        window.audioManager.playBGM('defense_lobby');
    }

    let currentWave = window.aiPet.defenseWave || 1;
    let isEndlessUnlocked = currentWave > 10;
    let isEmergency = window.DEFENSE_STATE.isEmergency;

    let arenaHtml = `<button onclick="this.parentElement.parentElement.remove(); window.originalOpenArenaReception();" style="padding:15px; font-size:20px; font-weight:bold; background:#1976D2; color:white; border:3px solid #2196F3; border-radius:8px; cursor:pointer; width:100%; margin-bottom:15px;">⚔️ 闘技場（アリーナ）</button>`;

    let emergencyHtml = isEmergency ?
        `<button onclick="this.parentElement.parentElement.remove(); window.openDefenseSortieUI('normal');" style="padding:15px; font-size:20px; font-weight:bold; background:#b71c1c; color:white; border:3px solid #ff5252; border-radius:8px; cursor:pointer; box-shadow: 0 0 15px rgba(255,0,0,0.5); width:100%; margin-bottom:15px;">🚨 緊急防衛クエストに出撃</button>` :
        `<div style="padding:15px; font-size:18px; color:#888; background:#222; border:2px dashed #444; border-radius:8px; text-align:center; margin-bottom:15px;">現在、島の平和は保たれています</div>`;

    let endlessHtml = isEndlessUnlocked ?
        `<button onclick="this.parentElement.parentElement.remove(); window.openDefenseSortieUI('endless');" style="padding:15px; font-size:20px; font-weight:bold; background:#4A148C; color:white; border:3px solid #E040FB; border-radius:8px; cursor:pointer; box-shadow: 0 0 15px rgba(224,64,251,0.5); width:100%; margin-bottom:15px;">♾️ エンドレス防衛戦（限界突破）</button>` :
        `<div style="padding:15px; font-size:16px; color:#555; background:#111; border:2px solid #333; border-radius:8px; text-align:center; margin-bottom:15px;">🔒 エンドレス防衛戦（WAVE10クリアで解放）</div>`;

    let choiceUi = document.createElement('div');
    choiceUi.id = 'castle-reception-overlay'; // ★追加: 削除しやすいようにIDを付与
    choiceUi.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 55000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
    choiceUi.innerHTML = `
        <div style="background:#1a1a1a; border:4px solid #FFD700; border-radius:12px; padding:30px; width:80%; max-width:500px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#FFD700; font-size:32px; margin-top:0; margin-bottom:25px; border-bottom:2px solid #444; padding-bottom:10px;">🏰 王城 総合受付</h2>
            ${arenaHtml}
            ${emergencyHtml}
            ${endlessHtml}
            <button onclick="this.parentElement.parentElement.remove(); document.getElementById('dungeon-ranking-ui').classList.add('active'); window.switchRankingCategory('defense');" style="padding:15px; font-size:18px; font-weight:bold; background:#004D40; color:#fff; border:2px solid #00695C; border-radius:8px; cursor:pointer; width:100%; margin-bottom:20px;">👥 フレンド模擬戦（ランキングから選択）</button>
            <button onclick="window.exitCastleReception();" style="padding:12px; font-size:16px; background:#444; color:white; border:2px solid #777; border-radius:8px; cursor:pointer; width:100%;">退出する</button>
        </div>
    `;
    document.body.appendChild(choiceUi);
};

// ★追加: 城から完全に退出してAIを自由行動に戻す処理
window.exitCastleReception = function() {
    let ui = document.getElementById('castle-reception-overlay');
    if (ui) ui.remove(); // UIを閉じる

    // ★追加：城から出たら、育成モードのキャラクターBGMに戻す
    if (window.audioManager) {
        window.audioManager.restoreMainBGM();
    }

    if (window.aiPet) {
        window.aiPet.isIndoors = false;     // 屋内判定を解除
        window.aiPet.indoorTarget = null;   // ターゲット施設を解除
        window.aiPet.actionState = 'idle';  // 行動状態をアイドルに戻す
        window.aiPet.visualAction = 'idle'; // アニメーションを元に戻す
        window.aiPet.message = "お城から出たよ！";
        window.aiPet.messageTimer = 120;
        
        // 出てすぐに再入室しないよう、少しだけキャラクターを下にずらす
        window.aiPet.y += 20; 
        
        if (typeof saveGameData === 'function') saveGameData();
    }
};

window.assignSkillsToUnit = function(unit, pwr, int) {
    let statTotal = pwr + int; 
    let exactSkin = unit.skin || 'robot';
    let skinBase = exactSkin.split('_')[0];
    
    // '_'の数や 'type' という文字列から正確な進化レベルを算出
    let evoLevel = 0;
    if (exactSkin.includes('_type')) {
        let parts = exactSkin.split('_');
        evoLevel = parts.length > 2 ? 2 : 1; // _typeX_Y なら2進化、 _typeX なら1進化
    } else if (exactSkin !== skinBase) {
        evoLevel = 1; // ゲストキャラなどのイレギュラー対応
    }
    
    // ベースとなる種族の基本技を取得（これは全進化系が共通で引き継ぐ）
    let skillList = window.DEFENSE_SKILL_DB[exactSkin] ? [...window.DEFENSE_SKILL_DB[exactSkin]] : [...(window.DEFENSE_SKILL_DB[skinBase] || window.DEFENSE_SKILL_DB['default'])];
    
    // ==========================================
    // 🔥 スパロボ風！全100種族の固有必殺技ディクショナリ
    // 1進化は威力2.0〜2.5（中堅技）、2進化は威力3.5〜4.5（究極技）
    // ==========================================
    const EVO_SKILLS_MAP = {
        // --- 🤖 Robot Tree ---
        "robot_type3": [ { req: 60, name: 'アナライズ・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'オプティカル・スキャン', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "robot_type3_2": [ { req: 120, name: 'ロジック・デストラクト', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'マトリックス・レイ', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "robot_type3_3": [ { req: 120, name: '確率改竄ストライク', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ディバイン・オラクル', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "robot_type3_4": [ { req: 120, name: 'アシッド・インジェクション', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ケミカル・ハザード', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "robot_type3_5": [ { req: 120, name: 'データ・デリート', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ワールド・エンド・コード', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "robot_type2": [ { req: 60, name: 'ライブ・ビート', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ソニック・ボイス', type: 'shoot', power: 2.5, range: 3, effect: 'slash' } ],
        "robot_type2_2": [ { req: 120, name: 'グラン・ジュテ・スラッシュ', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ピルエット・ストライク', type: 'shoot', power: 4.5, range: 4, effect: 'impact' } ],
        "robot_type2_3": [ { req: 120, name: 'ヴァーチャル・エコー', type: 'shoot', power: 3.5, range: 4, effect: 'beam' }, { req: 150, name: 'シンフォニック・レイ', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "robot_type2_4": [ { req: 120, name: 'ゴールデン・スマッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ミリオン・ダラー・キャノン', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "robot_type4": [ { req: 60, name: 'ヘビー・パイルバンカー', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: '装甲粉砕砲', type: 'shoot', power: 2.5, range: 3, effect: 'explosion' } ],
        "robot_type4_2": [ { req: 120, name: 'アサルト・クロー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'フルバースト・ガトリング', type: 'shoot', power: 4.5, range: 4, effect: 'impact' } ],
        "robot_type4_3": [ { req: 120, name: 'ジェノサイド・ナックル', type: 'melee', power: 3.5, range: 1, effect: 'explosion' }, { req: 150, name: 'アルティメット・デストロイヤー', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "robot_type4_4": [ { req: 120, name: 'ギガント・プレッシャー', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ダイナモ・オーバーロード', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "robot_type1": [ { req: 60, name: 'ブラッド・スクレイパー', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'キリング・レイ', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "robot_type1_2": [ { req: 120, name: 'ナイトメア・サイズ', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'サイバー・カタストロフ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "robot_type1_3": [ { req: 120, name: 'ドゥームズデイ・スマッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'アポカリプス・フレア', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "robot_type5": [ { req: 60, name: 'スクラップ・ナックル', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ジャンク・バズーカ', type: 'shoot', power: 2.5, range: 3, effect: 'explosion' } ],
        "robot_type5_2": [ { req: 120, name: 'イージス・バッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'エンシェント・レーザー', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "robot_type5_3": [ { req: 120, name: 'クロック・スラッシュ', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'エターナル・ギア・ストライク', type: 'shoot', power: 4.5, range: 4, effect: 'impact' } ],
        "robot_type5_4": [ { req: 120, name: 'ネイチャー・スマッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'アース・プロミネンス', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🧚 Spirit Tree ---
        "spirit_type2": [ { req: 60, name: 'スプリング・ブリーズ', type: 'shoot', power: 2.0, range: 3, effect: 'slash' }, { req: 80, name: 'フラワリング・アロー', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "spirit_type2_2": [ { req: 120, name: 'ネイチャー・ヒーリング', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ペタル・ストーム', type: 'shoot', power: 4.5, range: 4, effect: 'slash' } ],
        "spirit_type2_3": [ { req: 120, name: 'クリスタル・シュート', type: 'shoot', power: 3.5, range: 4, effect: 'beam' }, { req: 150, name: 'プリズム・ロータス・バースト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "spirit_type4": [ { req: 60, name: 'ウッド・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ガイア・インパクト', type: 'shoot', power: 2.5, range: 3, effect: 'explosion' } ],
        "spirit_type4_2": [ { req: 120, name: 'エルダー・ウィップ', type: 'melee', power: 3.5, range: 2, effect: 'slash' }, { req: 150, name: '大地の怒り', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "spirit_type4_3": [ { req: 120, name: 'ガーディアン・ファング', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ワイルド・ロア', type: 'shoot', power: 4.5, range: 3, effect: 'impact' } ],
        "spirit_type5": [ { req: 60, name: 'カサカサ・カッター', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ドライ・リーフ・ストーム', type: 'shoot', power: 2.5, range: 3, effect: 'slash' } ],
        "spirit_type5_2": [ { req: 120, name: 'オータム・ブレード', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: '紅葉乱舞', type: 'shoot', power: 4.5, range: 4, effect: 'slash' } ],
        "spirit_type5_3": [ { req: 120, name: '氷結の風', type: 'shoot', power: 3.5, range: 3, effect: 'slash' }, { req: 150, name: 'アブソリュート・ゼロ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "spirit_type1": [ { req: 60, name: 'ポイズン・タッチ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ベノム・スポア', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "spirit_type1_2": [ { req: 120, name: 'マンドラゴラ・スクリーム', type: 'shoot', power: 3.5, range: 3, effect: 'impact' }, { req: 150, name: 'カース・オブ    ・マザー', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "spirit_type3": [ { req: 60, name: '知識のページ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ルーン・ストライク', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "spirit_type3_2": [ { req: 120, name: 'オラクル・ヴィジョン', type: 'shoot', power: 3.5, range: 4, effect: 'beam' }, { req: 150, name: '星の神託', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🧙‍♀️ Magician Tree ---
        "magician_type4": [ { req: 60, name: 'マジック・ナックル', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'バトル・スマッシュ', type: 'shoot', power: 2.5, range: 3, effect: 'impact' } ],
        "magician_type4_2": [ { req: 120, name: 'フレイム・ナックル', type: 'melee', power: 3.5, range: 1, effect: 'explosion' }, { req: 150, name: 'バーン・アウト', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "magician_type4_3": [ { req: 120, name: '闘神の魔拳', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ウォー・バスター', type: 'shoot', power: 4.5, range: 4, effect: 'slash' } ],
        "magician_type4_4": [ { req: 120, name: 'ドラゴン・ファング', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ドラゴニック・ブレス', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "magician_type1": [ { req: 60, name: 'ヴェノム・カッター', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ダーク・ボルト', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "magician_type1_2": [ { req: 120, name: 'ドレイン・タッチ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ブラック・ホール', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type1_3": [ { req: 120, name: 'ネクロ・コマンド', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'アビス・ゲート', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type1_4": [ { req: 120, name: 'デーモン・クロー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'サモン・メテオ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type5": [ { req: 60, name: 'グランド・マジック', type: 'shoot', power: 2.0, range: 4, effect: 'beam' }, { req: 80, name: 'エンシェント・フレア', type: 'shoot', power: 2.5, range: 4, effect: 'explosion' } ],
        "magician_type5_2": [ { req: 120, name: 'タイム・ストップ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'クロノ・ブレイク', type: 'shoot', power: 4.5, range: 5, effect: 'slash' } ],
        "magician_type5_3": [ { req: 120, name: 'アストラル・レイ', type: 'shoot', power: 3.5, range: 5, effect: 'beam' }, { req: 150, name: 'コズミック・バースト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type2": [ { req: 60, name: 'イリュージョン・エッジ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'スター・シュート', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "magician_type2_2": [ { req: 120, name: 'アイス・コフィン', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ダイヤモンド・ダスト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type2_3": [ { req: 120, name: 'プリズム・カッター', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'レインボー・スプラッシュ', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "magician_type2_4": [ { req: 120, name: 'セレスティアル・ライト', type: 'shoot', power: 3.5, range: 4, effect: 'beam' }, { req: 150, name: 'ホーリー・ジャッジメント', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type3": [ { req: 60, name: 'ステラ・ストライク', type: 'shoot', power: 2.0, range: 4, effect: 'beam' }, { req: 80, name: 'アストロ・シュート', type: 'shoot', power: 2.5, range: 4, effect: 'impact' } ],
        "magician_type3_2": [ { req: 120, name: 'コスモ・プレッシャー', type: 'shoot', power: 3.5, range: 4, effect: 'impact' }, { req: 150, name: 'ユニバース・メテオ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "magician_type3_3": [ { req: 120, name: 'アカシック・ブレイド', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'エターナル・ノヴァ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🦅 Bird Tree ---
        "bird_type2": [ { req: 60, name: 'フェアリー・ウィング', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'イリュージョン・ダスト', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "bird_type2_2": [ { req: 120, name: 'ギャラクシー・フェザー', type: 'shoot', power: 3.5, range: 4, effect: 'slash' }, { req: 150, name: 'スターダスト・レイ', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "bird_type4": [ { req: 60, name: 'ハンター・ダイブ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ソニック・クロー', type: 'melee', power: 2.5, range: 1, effect: 'slash' } ],
        "bird_type4_2": [ { req: 120, name: 'ストーム・ウィング', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ガルーダ・テンペスト', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "bird_type5": [ { req: 60, name: 'サイレント・グライド', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'シャドウ・ストライク', type: 'melee', power: 2.5, range: 1, effect: 'slash' } ],
        "bird_type5_2": [ { req: 120, name: 'アーケオ・ファング', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'アンシエント・ロア', type: 'shoot', power: 4.5, range: 3, effect: 'impact' } ],
        "bird_type1": [ { req: 60, name: 'ダーク・ダイブ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ナイトメア・フェザー', type: 'shoot', power: 2.5, range: 3, effect: 'slash' } ],
        "bird_type1_2": [ { req: 120, name: 'カオス・スクリーム', type: 'shoot', power: 3.5, range: 3, effect: 'impact' }, { req: 150, name: 'デッド・ウィンド', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "bird_type3": [ { req: 60, name: 'ルーン・カッター', type: 'shoot', power: 2.0, range: 3, effect: 'slash' }, { req: 80, name: 'マジック・フェザー', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "bird_type3_2": [ { req: 120, name: 'メカニック・シュート', type: 'shoot', power: 3.5, range: 4, effect: 'impact' }, { req: 150, name: 'データ・ストライク', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "bird_type3_3": [ { req: 120, name: 'アカシック・アイ', type: 'shoot', power: 3.5, range: 5, effect: 'beam' }, { req: 150, name: 'コズミック・ロア', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- ⚙️ Machine Tree ---
        "machine_type2": [ { req: 60, name: 'オルゴール・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'メロディ・ウェーブ', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "machine_type2_2": [ { req: 120, name: 'クロノス・ブレイド', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'グランド・オーケストラ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "machine_type4": [ { req: 60, name: 'ピストン・パンチ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'スチーム・バースト', type: 'shoot', power: 2.5, range: 3, effect: 'explosion' } ],
        "machine_type4_2": [ { req: 120, name: 'ドレッド・インパクト', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ギガ・スチーム・カノン', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "machine_type5": [ { req: 60, name: 'アンティーク・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ラスティ・ギア', type: 'shoot', power: 2.5, range: 3, effect: 'slash' } ],
        "machine_type5_2": [ { req: 120, name: 'モス・ホイップ', type: 'melee', power: 3.5, range: 2, effect: 'slash' }, { req: 150, name: 'ネイチャー・カノン', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "machine_type5_3": [ { req: 120, name: 'ロスト・インパクト', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'エターナル・サイレンス', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "machine_type1": [ { req: 60, name: 'カース・クロー', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'マイト・オブ・ホラー', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "machine_type1_2": [ { req: 120, name: 'スクラップ・クラッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'カオス・ミキサー', type: 'melee', power: 4.5, range: 1, effect: 'slash' } ],
        "machine_type3": [ { req: 60, name: 'ギア・カッター', type: 'shoot', power: 2.0, range: 3, effect: 'slash' }, { req: 80, name: '計算式・零', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "machine_type3_2": [ { req: 120, name: 'クォンタム・エッジ', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ディメンション・ブレイク', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🪨 Stone Tree ---
        "stone_type2": [ { req: 60, name: 'クリスタル・ナックル', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'シャイン・レーザー', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "stone_type2_2": [ { req: 120, name: 'ブリリアント・ブレード', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ジェム・カタストロフ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "stone_type4": [ { req: 60, name: 'マグマ・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ヴォルカニック・バースト', type: 'shoot', power: 2.5, range: 3, effect: 'explosion' } ],
        "stone_type4_2": [ { req: 120, name: 'アイアン・バッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'フォートレス・カノン', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "stone_type4_3": [ { req: 120, name: 'メテオ・ナックル', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ギガ・タイタン・プレス', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "stone_type5": [ { req: 60, name: 'モノリス・スタンプ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ルイン・ブラスト', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "stone_type5_2": [ { req: 120, name: 'アストラル・プレッシャー', type: 'shoot', power: 3.5, range: 3, effect: 'impact' }, { req: 150, name: 'ガイア・ブレイク', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "stone_type5_3": [ { req: 120, name: 'ツイン・エレメント', type: 'shoot', power: 3.5, range: 4, effect: 'slash' }, { req: 150, name: 'アブソリュート・メルトダウン', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "stone_type1": [ { req: 60, name: 'カース・バイト', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ダーク・ペトリファイ', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "stone_type1_2": [ { req: 120, name: 'ヴォイド・クラッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ブラック・エンド', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "stone_type3": [ { req: 60, name: 'ルーン・ストライク', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: '古代語魔法・破', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "stone_type3_2": [ { req: 120, name: 'オラクル・バッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'サテライト・ジャッジメント', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],

        // --- 🎈 Balloon Tree ---
        "balloon_type2": [ { req: 60, name: 'シャボン・スプラッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'レインボー・バブル', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "balloon_type2_2": [ { req: 120, name: 'プリズム・バウンス', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'クリスタル・ドロップ', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "balloon_type2_3": [ { req: 120, name: 'パレード・タックル', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ドリーム・カーニバル', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "balloon_type4": [ { req: 60, name: 'マッスル・バウンス', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'マッスル・プレッシャー', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "balloon_type4_2": [ { req: 120, name: 'バーナー・ストライク', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'エアリアル・ファイア', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "balloon_type4_3": [ { req: 120, name: 'ゼペリン・プレス', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ヘビー・ボム', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "balloon_type1": [ { req: 60, name: 'スモッグ・アタック', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'トキシック・ブレス', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "balloon_type1_2": [ { req: 120, name: 'マイン・タックル', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'デッドリー・ブラスト', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "balloon_type1_3": [ { req: 120, name: 'ナイトメア・バンプ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'カオス・ブラスト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "balloon_type5": [ { req: 60, name: 'デフレート・プレス', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'しわしわタックル', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "balloon_type5_2": [ { req: 120, name: 'フォッシル・スマッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'エンシェント・フレア', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "balloon_type3": [ { req: 60, name: 'ウェザー・ストライク', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'ライトニング・ボルト', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "balloon_type3_2": [ { req: 120, name: 'スコープ・バッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'データ・ストーム', type: 'shoot', power: 4.5, range: 4, effect: 'slash' } ],
        "balloon_type3_3": [ { req: 120, name: 'サテライト・フォール', type: 'shoot', power: 3.5, range: 4, effect: 'impact' }, { req: 150, name: 'オービタル・レーザー', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],

        // --- 👻 Ghost Tree ---
        "ghost_type2": [ { req: 60, name: 'ルミナス・タッチ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ホーリー・ライト', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "ghost_type2_2": [ { req: 120, name: 'セラフィック・レイ', type: 'shoot', power: 3.5, range: 5, effect: 'beam' }, { req: 150, name: 'ヘヴンズ・ゲート', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "ghost_type4": [ { req: 60, name: 'ポルター・スマッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'テレキネシス・スロー', type: 'shoot', power: 2.5, range: 3, effect: 'impact' } ],
        "ghost_type4_2": [ { req: 120, name: 'ジャガーノート・パンチ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ファントム・デストロイ', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "ghost_type5": [ { req: 60, name: 'エイシェント・タッチ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: '忘却の風', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "ghost_type5_2": [ { req: 120, name: 'ファラオ・カース', type: 'shoot', power: 3.5, range: 3, effect: 'slash' }, { req: 150, name: '王の裁き', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "ghost_type1": [ { req: 60, name: 'シャドウ・サイズ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'デッドリー・シェイド', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "ghost_type1_2": [ { req: 120, name: 'デス・ブリンガー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ファントム・オブ・カオス', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "ghost_type3": [ { req: 60, name: 'アカデミー・ストライク', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: '知識の奔流', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "ghost_type3_2": [ { req: 120, name: 'テレパス・ブレイク', type: 'shoot', power: 3.5, range: 4, effect: 'impact' }, { req: 150, name: 'マインド・クラッシュ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🪲 Beetle Tree ---
        "beetle_type4": [ { req: 60, name: 'タイタン・シザース', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ギガ・ホーン・ブレイク', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "beetle_type5": [ { req: 60, name: 'アンバー・クラッシュ', type: 'melee', power: 2.0, range: 1, effect: 'impact' }, { req: 80, name: 'スカラベ・ストライク', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "beetle_type5_2": [ { req: 120, name: 'エターナル・シェル', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'アンモナイト・フォール', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "beetle_type2": [ { req: 60, name: 'ジュエル・ホーン', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'プリズム・フラッシュ', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "beetle_type2_2": [ { req: 120, name: 'ルーセント・ブレイド', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ムーンライト・レイ', type: 'shoot', power: 4.5, range: 4, effect: 'beam' } ],
        "beetle_type2_3": [ { req: 120, name: 'フェアリー・ダスト', type: 'shoot', power: 3.5, range: 3, effect: 'slash' }, { req: 150, name: 'モルフォ・イリュージョン', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "beetle_type2_4": [ { req: 120, name: 'セイクリッド・ホーン', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ホーリー・バースト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "beetle_type3": [ { req: 60, name: 'ブレイン・コマンド', type: 'shoot', power: 2.0, range: 3, effect: 'impact' }, { req: 80, name: 'フェロモン・ストライク', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "beetle_type1": [ { req: 60, name: 'ブラッド・シザース', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'マッド・デストロイ', type: 'melee', power: 2.5, range: 1, effect: 'impact' } ],
        "beetle_type4_2": [ { req: 120, name: '皇帝の凱歌', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: '巨神・突貫衝', type: 'melee', power: 4.5, range: 2, effect: 'explosion' } ],

        // --- 🌱 Seed Tree ---
        "seed_type4": [ { req: 60, name: 'ワイルド・バイン', type: 'melee', power: 2.0, range: 2, effect: 'slash' }, { req: 80, name: 'アース・ブレイク', type: 'shoot', power: 2.5, range: 3, effect: 'impact' } ],
        "seed_type4_2": [ { req: 120, name: 'ガイア・バイト', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'オメガ・プレッシャー', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "seed_type1": [ { req: 60, name: 'ペイン・ソーン', type: 'melee', power: 2.0, range: 2, effect: 'slash' }, { req: 80, name: 'ヴェノム・スプラッシュ', type: 'shoot', power: 2.5, range: 3, effect: 'beam' } ],
        "seed_type1_2": [ { req: 120, name: 'パラサイト・ドレイン', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'カオス・イグドラシル', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "seed_type5": [ { req: 60, name: 'ミスティック・ブランチ', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: '侘び寂びの風', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "seed_type5_2": [ { req: 120, name: 'ペトリファイド・スマッシュ', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'エターナル・ロック', type: 'shoot', power: 4.5, range: 4, effect: 'explosion' } ],
        "seed_type3": [ { req: 60, name: 'アーカイブ・リーフ', type: 'shoot', power: 2.0, range: 3, effect: 'slash' }, { req: 80, name: 'レコード・ストライク', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "seed_type3_2": [ { req: 120, name: 'ニューロ・ウィップ', type: 'melee', power: 3.5, range: 2, effect: 'slash' }, { req: 150, name: 'インテリジェント・レイ', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ],
        "seed_type3_3": [ { req: 120, name: 'アカシック・ルート', type: 'melee', power: 3.5, range: 2, effect: 'slash' }, { req: 150, name: '真理の光', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "seed_type2": [ { req: 60, name: 'アロマ・ブリーズ', type: 'shoot', power: 2.0, range: 3, effect: 'beam' }, { req: 80, name: 'ブルーム・バースト', type: 'shoot', power: 2.5, range: 4, effect: 'explosion' } ],
        "seed_type2_2": [ { req: 120, name: 'エデン・ウィップ', type: 'melee', power: 3.5, range: 2, effect: 'slash' }, { req: 150, name: 'パラダイス・ロスト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],

        // --- 🐉 Dragon Tree ---
        "dragon_type4": [ { req: 60, name: 'グランド・クロー', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ワイバーン・ロア', type: 'shoot', power: 2.5, range: 3, effect: 'impact' } ],
        "dragon_type4_2": [ { req: 120, name: 'ドレッド・ファング', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'バハムート・フレア', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "dragon_type1": [ { req: 60, name: 'カースド・ファング', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'デッドリー・ブレス', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "dragon_type1_2": [ { req: 120, name: 'アビス・クロー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ウロボロス・カタストロフ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "dragon_type5": [ { req: 60, name: 'エンシェント・バイト', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'ガイア・ブレス', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "dragon_type5_2": [ { req: 120, name: 'ジオ・ストライク', type: 'melee', power: 3.5, range: 1, effect: 'impact' }, { req: 150, name: 'ククルカン・テンペスト', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "dragon_type3": [ { req: 60, name: 'アーク・ウォーター', type: 'shoot', power: 2.0, range: 4, effect: 'beam' }, { req: 80, name: 'リヴァイアサン・ウェーブ', type: 'shoot', power: 2.5, range: 5, effect: 'explosion' } ],
        "dragon_type3_2": [ { req: 120, name: 'ギャラクシー・クロー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'スーパー・ノヴァ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "dragon_type2": [ { req: 60, name: 'クリスタル・ファング', type: 'melee', power: 2.0, range: 1, effect: 'slash' }, { req: 80, name: 'オーレリア・レイ', type: 'shoot', power: 2.5, range: 4, effect: 'beam' } ],
        "dragon_type2_2": [ { req: 120, name: 'セラフィック・クロー', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'ホーリー・ブレス', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' } ],
        "dragon_type2_3": [ { req: 120, name: 'プリズマティカ・ウィング', type: 'melee', power: 3.5, range: 1, effect: 'slash' }, { req: 150, name: 'オーロラ・バースト', type: 'shoot', power: 4.5, range: 5, effect: 'beam' } ]
    };

    // ★ 現在のスキン名（exactSkin）に完全一致する固有技を取得
    let myEvoSkills = EVO_SKILLS_MAP[exactSkin] || [];

    // ★ 技リストにマージする
    if (myEvoSkills.length > 0) {
        skillList.push(...myEvoSkills);
    } 
    // イレギュラーや未定義の進化レベル用フォールバック
    else if (evoLevel >= 1) {
        skillList.push(
            { req: 60, name: '覚醒の一撃', type: 'melee', power: 2.0, range: 1, effect: 'slash' },
            { req: 80, name: 'エヴォルブラスター', type: 'shoot', power: 2.5, range: 3, effect: 'beam' }
        );
        if (evoLevel >= 2) {
            skillList.push(
                { req: 120, name: '真・覚醒乱舞', type: 'melee', power: 3.5, range: 1, effect: 'explosion' },
                { req: 150, name: 'メテオデストロイ', type: 'shoot', power: 4.5, range: 5, effect: 'explosion' }
            );
        }
    }

    // 技の習得条件（ステータス）を満たしているかチェックし、進化レベルに応じて威力を底上げ
    unit.skills = skillList.filter(s => statTotal >= s.req).map(s => {
        return { ...s, power: s.power + (evoLevel * 0.2) }; 
    });
    
    if (unit.skills.length === 0) unit.skills = [window.DEFENSE_SKILL_DB['default'][0]]; 
    unit.maxRange = Math.max(...unit.skills.map(s => s.range));
    unit.minRange = Math.min(...unit.skills.map(s => s.range)); 
};

window.startMockBattlePrep = function(index) {
    let targetData = window.arenaRankDataCache ? window.arenaRankDataCache[index] : null;
    if (!targetData) return;
    
    let rankingUi = document.getElementById('dungeon-ranking-ui');
    if (rankingUi) rankingUi.classList.remove('active');
    
    window.DEFENSE_STATE.mockTarget = targetData;
    window.openDefenseSortieUI('mock');
};

window.openDefenseSortieUI = function(mode) {
    window.DEFENSE_STATE.nextMode = mode || 'normal';
    
    let ui = document.getElementById('defense-sortie-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'defense-sortie-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(20,10,10,0.95); z-index: 60000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto;`;
        document.body.appendChild(ui);
    }
    
    // ★ 修正：出撃メンバー（meとpast）に元ステータスの `pwr` を持たせておく！
    let pwr = Math.floor(window.aiPet.stats.power || 10); let int = Math.floor(window.aiPet.stats.intel || 10);
    // ★修正: 実際の素早さステータスを取得
    let realSpd = Math.floor(window.aiPet.stats.speed || 10);
    let baseSpd = window.DEFENSE_CONFIG.baseSpeed[window.aiPet.currentSkin ? window.aiPet.currentSkin.split('_')[0] : 'robot'] || 3;
    
    let currentAI = {
        id: "me", name: window.aiPet.name || "現在のAI", skin: window.aiPet.currentSkin || 'robot',
        hp: Math.floor(100 + (pwr * 2)), maxHp: Math.floor(100 + (pwr * 2)),
        atk: Math.floor(10 + pwr * 0.5), def: Math.floor(5 + pwr * 0.2), intel: int, pwr: pwr, 
        // ★修正: 素早さステータス10につき移動力が1マス増えるようにする（ベース値＋ボーナス）
        speed: Math.floor(baseSpd + (realSpd / 20)), isMe: true
    };
    window.assignSkillsToUnit(currentAI, pwr, int);

    let availableAIs = [];
    let discovered = (window.aiPet && window.aiPet.discoveredMonsters) ? window.aiPet.discoveredMonsters : [];
    let savedStats = (window.aiPet && window.aiPet.savedGrazeStats) ? window.aiPet.savedGrazeStats : {};
    let pastId = 0;
    
    discovered.forEach(skinKey => {
        if (skinKey === window.aiPet.currentSkin) return;
        let sName = (typeof monsterBookData !== 'undefined' && monsterBookData[skinKey]) ? monsterBookData[skinKey].name : skinKey;
        let sPwr = 10; let sInt = 10; let sSpd = 10;
        if (savedStats[skinKey] && savedStats[skinKey].stats) { 
            sPwr = Math.floor(savedStats[skinKey].stats.power || sPwr); 
            sInt = Math.floor(savedStats[skinKey].stats.intel || sInt); 
            sSpd = Math.floor(savedStats[skinKey].stats.speed || sSpd); // ★追加
        }
        let bSpd = window.DEFENSE_CONFIG.baseSpeed[skinKey.split('_')[0]] || 3;

        let pastAI = {
            id: "past_" + pastId++, name: `${sName}`, skin: skinKey, 
            hp: Math.floor(80 + sPwr * 2), maxHp: Math.floor(80 + sPwr * 2),
            atk: Math.floor(8 + sPwr * 0.4), def: 5, intel: sInt, pwr: sPwr, 
            // ★修正: 過去AIも実際の素早さステータスを反映
            speed: Math.floor(bSpd + (sSpd / 20)), isMe: false
        };
        window.assignSkillsToUnit(pastAI, sPwr, sInt); availableAIs.push(pastAI);
    });

    window.DEFENSE_STATE.preDeployed = [currentAI]; window.DEFENSE_STATE.availableRoster = availableAIs;
    window.renderDefenseSortieUI();
};

window.renderDefenseSortieUI = function() {
    let ui = document.getElementById('defense-sortie-ui'); if (!ui) return;
    let max = window.DEFENSE_CONFIG.maxDeploy; let party = window.DEFENSE_STATE.preDeployed; let roster = window.DEFENSE_STATE.availableRoster;
    
    let isEndless = window.DEFENSE_STATE.nextMode === 'endless';
    let isMock = window.DEFENSE_STATE.nextMode === 'mock';

    let partyHtml = party.map((p, index) => `
        <div onclick="window.removeDefenseMember(${index})" style="background:#222; border:2px solid ${p.isMe ? '#4CAF50' : '#E040FB'}; border-radius:8px; padding:10px; width:160px; text-align:center; cursor:${p.isMe ? 'default' : 'pointer'}; position:relative;">
            <div style="font-size:14px; color:${p.isMe ? '#4CAF50' : '#E040FB'}; font-weight:bold;">${p.name}</div>
            <div style="font-size:12px; color:#ddd; margin-top:4px;">HP: ${p.hp} / ${p.maxHp}</div>
            <div style="font-size:11px; color:#aaa; margin-top:2px;">移動: ${p.speed} | 射程: ${p.minRange}～${p.maxRange}</div>
            <button onclick="event.stopPropagation(); window.showDefenseUnitDetails('party', ${index})" style="margin-top:8px; padding:4px 10px; font-size:11px; background:#333; border:1px solid #777; color:white; border-radius:4px; cursor:pointer; width:100%;">📊 詳細を見る</button>
            ${!p.isMe ? `<div style="position:absolute; top:-10px; right:-10px; background:red; color:white; border-radius:50%; width:22px; height:22px; font-weight:bold; line-height:22px; box-shadow:0 2px 5px rgba(0,0,0,0.5);">×</div>` : ''}
        </div>
    `).join('');
    for(let i = party.length; i < max; i++) partyHtml += `<div style="background:#111; border:2px dashed #555; border-radius:8px; padding:10px; width:160px; display:flex; align-items:center; justify-content:center; color:#555; font-size:14px; font-weight:bold;">出撃枠 ${i+1}</div>`;

    let rosterHtml = roster.length > 0 ? roster.map((p, index) => `
        <div onclick="window.addDefenseMember(${index})" style="background:#1a1a1a; border:1px solid #444; border-radius:8px; padding:10px; width:150px; text-align:center; cursor:pointer; position:relative;">
            <div style="font-size:12px; color:#fff; font-weight:bold;">${p.name}</div>
            <div style="font-size:11px; color:#aaa; margin-top:4px;">HP: ${p.hp}</div>
            <div style="font-size:10px; color:#888; margin-top:2px;">移動: ${p.speed} | 射程: ${p.minRange}～${p.maxRange}</div>
            <button onclick="event.stopPropagation(); window.showDefenseUnitDetails('roster', ${index})" style="margin-top:8px; padding:4px 10px; font-size:11px; background:#333; border:1px solid #555; color:#ddd; border-radius:4px; cursor:pointer; width:100%;">📊 詳細</button>
            <div style="font-size:11px; color:#FF9800; margin-top:6px; font-weight:bold;">+ 迎撃部隊へ</div>
        </div>
    `).join('') : `<div style="color:#888; width:100%; text-align:center; padding-top:20px;">出撃可能な過去の戦力がいません</div>`;

    let currentWave = window.aiPet.defenseWave || 1;
    let totalE = Math.min(3 + currentWave * 2, 15);
    let bestRecord = window.aiPet.bestEndlessWave || 0;
    
    let headerInfo = '';
    if (isEndless) {
        headerInfo = `<h1 style="color:#E040FB; font-size:32px; margin-top:30px;">♾️ エンドレス防衛戦</h1>
                      <p style="font-size:16px; color:#ccc;">限界突破サバイバル（最高到達記録：<span style="color:#FFD700; font-weight:bold;">WAVE ${bestRecord}</span>）</p>`;
    } else if (isMock) {
        let tName = window.DEFENSE_STATE.mockTarget ? window.DEFENSE_STATE.mockTarget.playerName : "ライバル";
        headerInfo = `<h1 style="color:#00E5FF; font-size:32px; margin-top:30px;">👥 模擬戦</h1>
                      <p style="font-size:16px; color:#ccc;">VS <span style="color:#FFF; font-weight:bold;">${tName}</span> の防衛パーティ</p>`;
    } else {
        headerInfo = `<h1 style="color:#FFD700; font-size:32px; margin-top:30px;">👑 王様「島を防衛せよ！」</h1>
                      <p style="font-size:16px; color:#ccc;">現在の防衛ウェーブ：<span style="color:#FF5252; font-weight:bold; font-size:20px;">${currentWave}</span> （予想敵戦力: 約 ${totalE} 体）</p>`;
    }

    let btnColor = isEndless ? '#4A148C' : (isMock ? '#006064' : '#b71c1c');
    let btnBorder = isEndless ? '#E040FB' : (isMock ? '#00E5FF' : '#ff5252');
    let btnText = isMock ? '⚔️ 模擬戦開始' : '⚔️ 出撃する';

    ui.innerHTML = `
        <button onclick="document.getElementById('defense-sortie-ui').remove(); window.openArenaReception();" style="position:absolute; top:20px; right:20px; background:#444; border:none; padding:10px 20px; color:white; border-radius:8px; cursor:pointer; font-weight:bold;">キャンセル</button>
        ${headerInfo}
        <div style="display:flex; width:95%; max-width:1000px; gap:20px; margin-bottom:30px;">
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555;"><div style="font-size:18px; color:#4fc3f7; margin-bottom:15px; font-weight:bold;">▼ 迎撃部隊（最大 ${max} 体）</div><div style="display:flex; gap:10px; flex-wrap:wrap;">${partyHtml}</div></div>
            <div style="flex:1; background:rgba(0,0,0,0.5); padding:20px; border-radius:12px; border:2px solid #555; max-height:400px; overflow-y:auto;"><div style="font-size:18px; color:#FFC107; margin-bottom:15px; font-weight:bold;">▼ 待機中の相棒たち（タップで追加）</div><div style="display:flex; gap:10px; flex-wrap:wrap;">${rosterHtml}</div></div>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:40px;">
            <button onclick="window.startDefenseSimulation()" style="padding:15px 60px; font-size:24px; font-weight:bold; background:${btnColor}; color:white; border:3px solid ${btnBorder}; border-radius:8px; cursor:pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition:transform 0.1s;">${btnText}</button>
        </div>
    `;
    ui.style.display = 'flex';
};

window.showDefenseUnitDetails = function(listType, index) {
    let unit = listType === 'party' ? window.DEFENSE_STATE.preDeployed[index] : window.DEFENSE_STATE.availableRoster[index];
    if (!unit) return;

    let skillsHtml = unit.skills.map(s => {
        let typeColor = s.type === 'melee' ? '#FF9800' : '#00E5FF';
        let typeName = s.type === 'melee' ? '格闘' : '射撃';
        return `
            <div style="background:#111; margin-bottom:8px; padding:10px; border-left:4px solid ${typeColor}; border-radius:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div style="color:${typeColor}; font-weight:bold; font-size:16px;">${s.name}</div>
                    <div style="background:#333; padding:2px 6px; border-radius:4px; font-size:10px; color:#ddd;">${typeName}</div>
                </div>
                <div style="display:flex; gap:15px; color:#ccc; font-size:13px;">
                    <div>💥 威力倍率: <span style="color:#fff; font-weight:bold;">x${s.power.toFixed(1)}</span></div>
                    <div>🎯 射程: <span style="color:#fff; font-weight:bold;">${s.range}</span></div>
                </div>
            </div>
        `;
    }).join('');

    let modal = document.createElement('div');
    modal.id = 'def-unit-modal';
    modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:65000; display:flex; justify-content:center; align-items:center;`;
    
    modal.innerHTML = `
        <div style="background:#222; border:2px solid #777; border-radius:12px; padding:25px; width:90%; max-width:450px; color:white; font-family:sans-serif; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute; top:15px; right:15px; background:#f44336; color:white; border:none; border-radius:4px; padding:8px 12px; cursor:pointer; font-weight:bold; font-size:16px;">✕ 閉じる</button>
            <h2 style="color:#FFD700; margin-top:0; font-size:24px; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:10px;">${unit.name} <span style="font-size:14px; color:#aaa; font-weight:normal;">のステータス</span></h2>
            <div style="display:flex; background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #333;">
                <div style="flex:1; border-right:1px solid #444; padding-right:15px;">
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">耐久 (HP)</div><div style="font-size:20px; font-weight:bold; color:#4CAF50; margin-bottom:10px;">${unit.hp} <span style="font-size:14px; color:#888;">/ ${unit.maxHp}</span></div>
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">攻撃力 (ATK)</div><div style="font-size:18px; font-weight:bold; margin-bottom:10px;">${unit.atk}</div>
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">防御力 (DEF)</div><div style="font-size:18px; font-weight:bold;">${unit.def}</div>
                </div>
                <div style="flex:1; padding-left:15px;">
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">移動力 (SPD)</div><div style="font-size:20px; font-weight:bold; color:#2196F3; margin-bottom:10px;">${unit.speed} <span style="font-size:12px; color:#888; font-weight:normal;">マス</span></div>
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">賢さ (INT)</div><div style="font-size:18px; font-weight:bold; margin-bottom:10px;">${unit.intel}</div>
                    <div style="color:#aaa; font-size:12px; margin-bottom:2px;">射程範囲</div><div style="font-size:18px; font-weight:bold; color:#FF9800;">${unit.minRange} ～ ${unit.maxRange}</div>
                </div>
            </div>
            <h3 style="color:#4CAF50; font-size:18px; margin-bottom:10px; border-left:4px solid #4CAF50; padding-left:10px;">習得済みの技</h3>
            <div style="max-height:220px; overflow-y:auto; padding-right:10px; background:#1a1a1a; padding:10px; border-radius:8px; border:1px solid #333;">${skillsHtml}</div>
        </div>
    `;
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};

window.addDefenseMember = function(index) {
    if (window.DEFENSE_STATE.preDeployed.length >= window.DEFENSE_CONFIG.maxDeploy) return;
    window.DEFENSE_STATE.preDeployed.push(window.DEFENSE_STATE.availableRoster.splice(index, 1)[0]);
    window.renderDefenseSortieUI();
};
window.removeDefenseMember = function(index) {
    let member = window.DEFENSE_STATE.preDeployed[index];
    if (member.isMe) return; 
    window.DEFENSE_STATE.preDeployed.splice(index, 1);
    window.DEFENSE_STATE.availableRoster.push(member);
    window.renderDefenseSortieUI();
};

window.generateEnemyWave = function(wave, count) {
    let enemies = []; 
    let discovered = (window.aiPet && window.aiPet.discoveredMonsters) ? window.aiPet.discoveredMonsters : ['robot'];
    if (discovered.length === 0) discovered = ['robot'];
    for (let i = 0; i < count; i++) {
        let randomSkin = discovered[Math.floor(Math.random() * discovered.length)];
        let sName = (typeof monsterBookData !== 'undefined' && monsterBookData[randomSkin]) ? monsterBookData[randomSkin].name : randomSkin;
        
        // ベース種族と進化段階の取得
        let baseSkin = randomSkin.split('_')[0]; 
        let evoLevel = randomSkin.includes('_') ? parseInt(randomSkin.split('_')[1]) || 1 : 0; 
        let baseSpd = window.DEFENSE_CONFIG.baseSpeed[baseSkin] || 3;
        
        // WAVE進行と進化段階によるステータス強化
        let pwr = Math.floor(10 + (wave * 1.5) + (evoLevel * 5)); 
        let int = Math.floor(8 + (wave * 1.2) + (evoLevel * 4));
        
        let e = { 
            name: `幻影の${sName}`, 
            skin: randomSkin, 
            hp: 80 + pwr * 2, maxHp: 80 + pwr * 2, 
            atk: 10 + Math.floor(pwr * 0.4), 
            def: 5 + Math.floor(evoLevel * 2), 
            intel: int, 
            speed: baseSpd + Math.floor(evoLevel * 0.5), 
            team: 'enemy', isBoss: false, gridX: -100, gridY: -100 
        };
        window.assignSkillsToUnit(e, pwr, int); enemies.push(e);
    }
    return enemies;
};

window.spawnReinforcements = async function(requestCount) {
    let cfg = window.DEFENSE_STATE.waveConfig;
    if (window.DEFENSE_STATE.mode !== 'endless' && cfg.spawnedSoFar >= cfg.totalToSpawn) return; 

    let count = window.DEFENSE_STATE.mode === 'endless' ? requestCount : Math.min(requestCount, cfg.totalToSpawn - cfg.spawnedSoFar);
    let currentWave = window.DEFENSE_STATE.mode === 'endless' ? (window.aiPet.currentEndlessWave || 1) : (window.aiPet.defenseWave || 1);
    let newEnemies = window.generateEnemyWave(currentWave, count);
    
    let landGrids = window.getValidLandGrids();
    let cx = window.DEFENSE_STATE.castleGrid.x; let cy = window.DEFENSE_STATE.castleGrid.y;
    
    if (count > 0 && cfg.spawnedSoFar > 0) {
        await window.showDefenseMessage("⚠️ 敵の増援が接近中！", "#FF9800");
    }

    for (let i = 0; i < newEnemies.length; i++) {
        let e = newEnemies[i]; 
        e.id = `enemy_${cfg.spawnedSoFar + i}`; 
        
        landGrids.sort((a,b) => {
            let dA = Math.abs(a.x - cx) + Math.abs(a.y - cy);
            let dB = Math.abs(b.x - cx) + Math.abs(b.y - cy);
            return (dB + Math.random()*5) - (dA + Math.random()*5); 
        });

        let spawnPos = { x: cx, y: cy };
        for (let j=0; j<landGrids.length; j++) {
            if (!window.isGridOccupied(landGrids[j].x, landGrids[j].y)) { spawnPos = landGrids[j]; break; }
        }
        
        e.gridX = spawnPos.x; e.gridY = spawnPos.y;
        window.DEFENSE_STATE.enemies.push(e); 
        window.DEFENSE_STATE.activeUnit = e; 
        window.addDefenseLog(`・敵増援 [${e.name}] が出現！`); 
        await window.wait(300);
    }
    
    cfg.spawnedSoFar += count;
    cfg.turnsUntilNextSpawn = 3; 
    window.DEFENSE_STATE.activeUnit = null;
};

window.startDefenseSimulation = function() {
    if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
    document.getElementById('defense-sortie-ui').style.display = 'none';
    let marquee = document.getElementById('emergency-marquee'); if (marquee) marquee.style.display = 'none';
    
    let style = document.getElementById('def-hide-style');
    if (!style) { style = document.createElement('style'); style.id = 'def-hide-style'; document.head.appendChild(style); }
    style.innerHTML = `#nav, #aiStatus, #info-column, #gameControls, #action-buttons-row, #chat-input-row, .main-toolbar, #toolbar, .mobile-only-btn, #main-tab-container, .tabs, #tabs, .main-tab, .sub-tab { display: none !important; }`;

    window.currentMode = 'defense';
    window.DEFENSE_STATE.mode = window.DEFENSE_STATE.nextMode || 'normal';

    // ★追加：戦闘モードに応じたBGMの再生
    if (window.audioManager) {
        if (window.DEFENSE_STATE.mode === 'endless') {
            window.audioManager.playBGM('defense_endless');
        } else if (window.DEFENSE_STATE.mode === 'mock') {
            window.audioManager.playBGM('defense_friend');
        } else {
            window.audioManager.playBGM('defense_main_theme');
        }
    }

    // ★修正：ランキング用に今回の出撃パーティを「完全な状態」で記録
    window.aiPet.lastDefenseParty = JSON.parse(JSON.stringify(window.DEFENSE_STATE.preDeployed));

    if (window.aiPet) {
        window.aiPet.isIndoors = false; window.aiPet.indoorTarget = null; window.aiPet.actionState = 'idle'; window.aiPet.visualAction = 'idle'; window.aiPet.messageTimer = 0; window.aiPet.message = "";
        if (!window._originalAiPetUpdate && typeof window.aiPet.update === 'function') {
            window._originalAiPetUpdate = window.aiPet.update;
            window.aiPet.update = function(dt) { if (window.currentMode === 'defense') return; if (window._originalAiPetUpdate) window._originalAiPetUpdate.call(this, dt); };
        }
    }
    
    window.DEFENSE_STATE.isActive = true; window.DEFENSE_STATE.turn = 1; window.DEFENSE_STATE.autoMode = false; window.DEFENSE_STATE.animMode = true; window.DEFENSE_STATE.isProcessingPhase = true; 
    window.DEFENSE_STATE.deployedParty = []; window.DEFENSE_STATE.enemies = []; window.DEFENSE_STATE.moveHighlights = []; window.DEFENSE_STATE.attackHighlights = [];
    
    window.createDefenseControls(); window.initDefenseGridMap();
};

window.initDefenseGridMap = async function() {
    // ★修正: 以前の施設の状態（HP）を一時保存しておく
    let oldFacilities = window.DEFENSE_STATE.facilities || [];
    window.DEFENSE_STATE.facilities = [];
    
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let castleAsset = Object.values(currentAssets).find(a => a && a.type === 'castle');
    let cx = 10; let cy = 6; 
    window.DEFENSE_STATE.castleGrid = {x: cx, y: cy};

    Object.keys(currentAssets).forEach(key => {
        let a = currentAssets[key];
        let validTypes = Object.keys(window.DEFENSE_CONFIG.facilities);
        // if (a && validTypes.includes(a.type)) {
        //     let conf = window.DEFENSE_CONFIG.facilities[a.type];
        //     // ★修正: 保存しておいた以前のデータからHPを復元する
        //     let loadedFac = oldFacilities.find(f => f.id === key);
        //     let currentHp = loadedFac ? loadedFac.hp : conf.maxHp;
        //     window.DEFENSE_STATE.facilities.push({ id: key, type: a.type, name: conf.name, team: 'facility', gridX: a.gridX, gridY: a.gridY, hp: currentHp, maxHp: conf.maxHp });
        // }
        if (a && validTypes.includes(a.type)) {
            let conf = window.DEFENSE_CONFIG.facilities[a.type];
            // ★修正: 大元のデータ(assets)にHPがなければMAXで初期化し、あればそれを引き継ぐ
            if (a.hp === undefined) a.hp = conf.maxHp;
            window.DEFENSE_STATE.facilities.push({ id: key, type: a.type, name: conf.name, team: 'facility', gridX: a.gridX, gridY: a.gridY, hp: a.hp, maxHp: conf.maxHp });
        }
    });

    if (window.DEFENSE_STATE.facilities.length === 0) window.DEFENSE_STATE.facilities.push({ id: 'fallback', type: 'castle', name: '王城(仮)', team: 'facility', gridX: cx, gridY: cy, hp: 2000, maxHp: 2000 });

    window.renderUnitOnGrid = function(unit) {}; window.renderFacilityOnGrid = function(fac) {};

    if (window.DEFENSE_STATE.mode === 'endless') {
        window.aiPet.currentEndlessWave = 1;
        await window.showDefenseMessage("♾️ ENDLESS BATTLE START", "#E040FB");
    } else if (window.DEFENSE_STATE.mode === 'mock') {
        await window.showDefenseMessage("👥 MOCK BATTLE START", "#00E5FF");
    } else {
        await window.showDefenseMessage("⚔️ DEFENSE BATTLE START", "#FFD700");
    }

    let landGrids = window.getValidLandGrids();
    let preParty = window.DEFENSE_STATE.preDeployed || [];
    for (let i = 0; i < preParty.length; i++) {
        let p = preParty[i]; p.team = 'player';
        
        landGrids.sort((a,b) => { return (Math.abs(a.x - cx) + Math.abs(a.y - cy)) - (Math.abs(b.x - cx) + Math.abs(b.y - cy)); });
        let spawnPos = { x: cx, y: cy };
        for (let j=0; j<landGrids.length; j++) {
            if (!window.isGridOccupied(landGrids[j].x, landGrids[j].y)) { spawnPos = landGrids[j]; break; }
        }
        
        p.gridX = spawnPos.x; p.gridY = spawnPos.y;
        window.DEFENSE_STATE.deployedParty.push(p); window.DEFENSE_STATE.activeUnit = p; 
        window.addDefenseLog(`・味方 [${p.name}] が防衛ラインに到着！`); await window.wait(200); 
    }

    // ★ 修正：模擬戦時は相手の「完全なステータスと技」をそのまま復元する
    if (window.DEFENSE_STATE.mode === 'endless') {
        window.DEFENSE_STATE.waveConfig = { totalToSpawn: 99999, spawnedSoFar: 0, turnsUntilNextSpawn: 0 };
        await window.spawnReinforcements(4); 
    } else if (window.DEFENSE_STATE.mode === 'mock') {
        window.DEFENSE_STATE.waveConfig = { totalToSpawn: 0, spawnedSoFar: 0, turnsUntilNextSpawn: 0 }; 
        let targetParty = window.DEFENSE_STATE.mockTarget.party || [];
        
        for (let i = 0; i < targetParty.length; i++) {
            let pData = targetParty[i];
            let e = {
                id: `mock_enemy_${i}`, name: `[幻影] ${pData.name || '不明'}`, skin: pData.skin || 'robot',
                hp: pData.maxHp || 100, maxHp: pData.maxHp || 100,
                atk: pData.atk || 10, def: pData.def || 5,
                intel: pData.intel || 10, speed: pData.speed || 3,
                team: 'enemy', isBoss: false, gridX: -100, gridY: -100
            };
            
            // 保存されていた pwr (またはatkからの逆算)を使って本来の強力な技を持たせる
            let ePwr = pData.pwr !== undefined ? pData.pwr : Math.floor((e.atk - 10) * 2);
            window.assignSkillsToUnit(e, ePwr, e.intel);
            
            landGrids.sort((a,b) => {
                let dA = Math.abs(a.x - cx) + Math.abs(a.y - cy);
                let dB = Math.abs(b.x - cx) + Math.abs(b.y - cy);
                return (dB + Math.random()*2) - (dA + Math.random()*2); 
            });
            let spawnPos = { x: cx, y: cy };
            for (let j=0; j<landGrids.length; j++) {
                if (!window.isGridOccupied(landGrids[j].x, landGrids[j].y)) { spawnPos = landGrids[j]; break; }
            }
            e.gridX = spawnPos.x; e.gridY = spawnPos.y;
            window.DEFENSE_STATE.enemies.push(e); window.DEFENSE_STATE.activeUnit = e; 
            window.addDefenseLog(`・敵陣営 [${e.name}] が配置された！`); await window.wait(200);
        }
    } else {
        let currentWave = window.aiPet.defenseWave || 1;
        let totalE = Math.min(3 + currentWave * 2, 15);
        window.DEFENSE_STATE.waveConfig = { totalToSpawn: totalE, spawnedSoFar: 0, turnsUntilNextSpawn: 0 };
        await window.spawnReinforcements(3 + Math.floor(currentWave / 3)); 
    }
    
    window.DEFENSE_STATE.activeUnit = null; 
    window.addDefenseLog(`▼ 防衛戦 第 1 ターン開始`);
    
    await window.showDefenseMessage("🔵 PLAYER PHASE", "#2196F3");
    window.DEFENSE_STATE.phase = 'player'; window.DEFENSE_STATE.isProcessingPhase = false; 
    
    if (window.DEFENSE_STATE.autoMode) setTimeout(() => { window.processPhaseAI(); }, 500);
};

window.createDefenseControls = function() {
    let controls = document.getElementById('defense-controls');
    if (!controls) {
        controls = document.createElement('div'); controls.id = 'defense-controls';
        controls.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); width:800px; max-width:95vw; height:120px; background:rgba(0,0,0,0.85); border:2px solid #555; border-radius:8px; display:grid; grid-template-columns: 2fr 1fr; z-index:50000; box-shadow:0 0 20px rgba(0,0,0,0.8);`;
        document.body.appendChild(controls);
    }
    if (!document.getElementById('defense-log')) {
        let log = document.createElement('div'); log.id = 'defense-log';
        log.style.cssText = `padding:10px; font-size:14px; color:#aaa; font-family:sans-serif; overflow-y:auto; line-height:1.5;`;
        controls.appendChild(log);
    }
    if (!document.getElementById('defense-btns')) {
        let btns = document.createElement('div'); btns.id = 'defense-btns';
        btns.style.cssText = `display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:6px; border-left:2px solid #444; padding:10px;`;
        btns.innerHTML = `
            <button id="def-btn-auto" onclick="window.toggleDefenseAuto()" style="width:48%; padding:8px 0; font-weight:bold; font-size:12px; background:#444; color:white; border:none; border-radius:4px; cursor:pointer;">AUTO OFF</button>
            <button id="def-btn-anim" onclick="window.toggleDefenseAnim()" style="width:48%; padding:8px 0; font-weight:bold; font-size:12px; background:#FF9800; color:white; border:none; border-radius:4px; cursor:pointer;">演出 ON</button>
            <button id="def-btn-skip" onclick="window.skipDefenseTurn()" style="width:100%; padding:8px 0; font-weight:bold; font-size:14px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">1フェイズ進む</button>
            <button onclick="window.giveUpDefense()" style="width:100%; padding:6px 0; font-size:11px; background:#b71c1c; color:white; border:none; border-radius:4px; cursor:pointer;">撤退する</button>
        `;
        controls.appendChild(btns);
    }
    controls.style.display = 'grid'; let log = document.getElementById('defense-log'); if (log) log.innerHTML = '';
};

window.toggleDefenseAuto = function() {
    let btn = document.getElementById('def-btn-auto'); window.DEFENSE_STATE.autoMode = !window.DEFENSE_STATE.autoMode;
    if (window.DEFENSE_STATE.autoMode) { btn.innerText = "AUTO ON"; btn.style.background = "#4CAF50"; if (!window.DEFENSE_STATE.isProcessingPhase) window.processPhaseAI(); } 
    else { btn.innerText = "AUTO OFF"; btn.style.background = "#444"; }
};

window.toggleDefenseAnim = function() {
    let btn = document.getElementById('def-btn-anim'); window.DEFENSE_STATE.animMode = !window.DEFENSE_STATE.animMode;
    if (window.DEFENSE_STATE.animMode) { btn.innerText = "演出 ON"; btn.style.background = "#FF9800"; } else { btn.innerText = "演出 OFF"; btn.style.background = "#444"; }
};

window.skipDefenseTurn = function() { if (window.DEFENSE_STATE.autoMode) return; if (window.DEFENSE_STATE.isProcessingPhase) return; window.processPhaseAI(); };
window.addDefenseLog = function(msg) { let log = document.getElementById('defense-log'); if (log) { log.innerHTML += `<div>${msg}</div>`; log.scrollTop = log.scrollHeight; } };

window.processPhaseAI = async function() {
    if (window.DEFENSE_STATE.isProcessingPhase) return; window.DEFENSE_STATE.isProcessingPhase = true;
    let phase = window.DEFENSE_STATE.phase; let units = (phase === 'player') ? window.DEFENSE_STATE.deployedParty : window.DEFENSE_STATE.enemies;
    let aliveUnits = units.filter(u => u.hp > 0); aliveUnits.sort((a,b) => b.speed - a.speed);

    // ★ ターン開始時に全員の行動済フラグをリセットし、待機アニメにする
    aliveUnits.forEach(u => { u.hasActed = false; u.visualAction = 'idle'; });

    for (let i = 0; i < aliveUnits.length; i++) {
        let unit = aliveUnits[i]; if (!window.DEFENSE_STATE.isActive || unit.hp <= 0) continue;
        window.DEFENSE_STATE.activeUnit = unit; 
        
        // ★ 自分のターンが来たアピール
        unit.visualAction = 'move'; await window.wait(200); unit.visualAction = 'idle';
        
        let actionCount = 1 + Math.floor(unit.speed / 10);
        if (actionCount > 1) {
            window.addDefenseLog(`<span style="color:#00e676; font-weight:bold;">💨 ${unit.name} は素早さを活かして ${actionCount}回 連続行動する！</span>`);
        }

        // 行動回数ぶんループして動かす
        for (let act = 0; act < actionCount; act++) {
            if (!window.DEFENSE_STATE.isActive || unit.hp <= 0) break;

            // ==========================================
            // ★追加修正：連続行動中に敵が全滅した場合、行動を即キャンセルして増援（WAVE進行）を呼ぶ！
            // ==========================================
            if (phase === 'player') {
                let aliveEnemiesCheck = window.DEFENSE_STATE.enemies.filter(e => e.hp > 0);
                if (aliveEnemiesCheck.length === 0) {
                    let cfg = window.DEFENSE_STATE.waveConfig;
                    if (window.DEFENSE_STATE.mode === 'mock') {
                        // 模擬戦なら勝利終了
                        window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(true); }, 1000);
                        break;
                    } else if (window.DEFENSE_STATE.mode === 'endless') {
                        // エンドレスならWAVE進行
                        window.aiPet.currentEndlessWave++;
                        cfg.spawnedSoFar = 0; 
                        await window.showDefenseMessage(`WAVE ${window.aiPet.currentEndlessWave} 到達！`, "#E040FB");
                        window.addDefenseLog(`【WAVE CLEAR】 さらに強力な敵が接近中...！`);
                        await window.wait(1000);
                        await window.spawnReinforcements(3 + Math.floor(window.aiPet.currentEndlessWave / 2));
                        break; // 敵が湧いたので、今の連続行動はいったん終了（次のキャラへ）
                    } else {
                        // 通常防衛戦
                        if (cfg.spawnedSoFar >= cfg.totalToSpawn) { 
                            window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(true); }, 1000); 
                            break;
                        } else {
                            // まだ湧く敵が残っていれば即座に湧かせる
                            await window.spawnReinforcements(Math.min(3, cfg.totalToSpawn - cfg.spawnedSoFar));
                            break;
                        }
                    }
                }
            } else if (phase === 'enemy') {
                let alivePlayersCheck = window.DEFENSE_STATE.deployedParty.filter(p => p.hp > 0);
                if (alivePlayersCheck.length === 0) {
                    window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(false); }, 1000);
                    break;
                }
            }
            // ==========================================
            
            await window.thinkDefenseAI(unit);
            
            // 連続行動の間に少しウェイトを入れる
            if (act < actionCount - 1 && window.DEFENSE_STATE.isActive) {
                await window.wait(300);
            }
        }
        
        unit.hasActed = true; // 行動終了フラグ
        if (!window.DEFENSE_STATE.isActive) break; await window.wait(300); 
    }

    if (!window.DEFENSE_STATE.isActive) return;
    window.DEFENSE_STATE.activeUnit = null; 

    if (window.DEFENSE_STATE.phase === 'player') {
        window.DEFENSE_STATE.phase = 'enemy'; await window.showDefenseMessage("🔴 ENEMY PHASE", "#f44336"); window.addDefenseLog(`🔴 敵フェイズ`);
        // ★追加：敵フェーズBGMに変更
        if (window.audioManager) window.audioManager.playBGM('defense_enemy');
        window.DEFENSE_STATE.isProcessingPhase = false; if (window.DEFENSE_STATE.autoMode) setTimeout(() => { window.processPhaseAI(); }, 500);
    } else {
        window.DEFENSE_STATE.turn++; window.DEFENSE_STATE.phase = 'player';
        window.addDefenseLog(`▼ 防衛戦 第 ${window.DEFENSE_STATE.turn} ターン開始`); 

        if (window.DEFENSE_STATE.mode === 'normal') {
            let cfg = window.DEFENSE_STATE.waveConfig;
            if (cfg.spawnedSoFar < cfg.totalToSpawn) {
                cfg.turnsUntilNextSpawn--;
                let aliveEnemies = window.DEFENSE_STATE.enemies.filter(e => e.hp > 0);
                if (cfg.turnsUntilNextSpawn <= 0 || aliveEnemies.length === 0) {
                    await window.spawnReinforcements(Math.min(3, cfg.totalToSpawn - cfg.spawnedSoFar));
                }
            }
        }

        await window.showDefenseMessage("🔵 PLAYER PHASE", "#2196F3");
        window.addDefenseLog(`🔵 味方フェイズ`); window.DEFENSE_STATE.isProcessingPhase = false;
        // ★追加：プレイヤーフェーズ開始時に元の戦闘BGMに戻す
        if (window.audioManager) {
            if (window.DEFENSE_STATE.mode === 'endless') window.audioManager.playBGM('defense_endless');
            else if (window.DEFENSE_STATE.mode === 'mock') window.audioManager.playBGM('defense_friend');
            else window.audioManager.playBGM('defense_main_theme');
        }
        if (window.DEFENSE_STATE.autoMode) setTimeout(() => { window.processPhaseAI(); }, 500);
    }
};

window.thinkDefenseAI = async function(unit) {
    let isPlayer = (unit.team === 'player');
    let targetList = isPlayer ? window.DEFENSE_STATE.enemies : [...window.DEFENSE_STATE.deployedParty, ...window.DEFENSE_STATE.facilities];
    
    let validTargets = []; let ax = unit.gridX; let ay = unit.gridY;

    targetList.forEach(t => {
        if (t.hp <= 0) return;
        let dist = Math.abs(ax - t.gridX) + Math.abs(ay - t.gridY);
        let usableSkills = unit.skills.filter(s => s.range >= dist);
        if (usableSkills.length > 0) {
            usableSkills.sort((a,b) => b.power - a.power); validTargets.push({ target: t, dist: dist, skill: usableSkills[0] });
        }
    });

    window.DEFENSE_STATE.moveHighlights = window.getMovableGrids(unit); await window.wait(400); 

    if (validTargets.length > 0) {
        window.DEFENSE_STATE.moveHighlights = []; 
        validTargets.sort((a,b) => (a.target.type === 'castle' ? -1 : (b.target.type === 'castle' ? 1 : a.dist - b.dist)));
        window.DEFENSE_STATE.attackHighlights = window.getAttackableGrids(unit); await window.wait(400);
        await window.executeDefenseBattle(unit, validTargets[0].target, validTargets[0].skill);
        window.DEFENSE_STATE.attackHighlights = []; return;
    }

    let moveTarget = null; let minDist = 9999;
    targetList.forEach(t => {
        if (t.hp <= 0) return;
        let dist = Math.abs(ax - t.gridX) + Math.abs(ay - t.gridY);
        if (t.type === 'castle') { moveTarget = t; minDist = dist - 1000; } else if (dist < minDist) { moveTarget = t; minDist = dist; }
    });

    if (moveTarget) {
        let nextGrid = window.calculateSRPGPath(unit, moveTarget.gridX, moveTarget.gridY);
        if (nextGrid && (nextGrid.x !== unit.gridX || nextGrid.y !== unit.gridY)) {
            unit.visualAction = 'move'; // 移動アニメ開始
            unit.flip = (nextGrid.x < unit.gridX); // 進行方向を向く
            
            // ★ 1マスずつ目的地まで移動する処理
            let curX = unit.gridX; let curY = unit.gridY;
            while (curX !== nextGrid.x || curY !== nextGrid.y) {
                if (curX < nextGrid.x) curX++;
                else if (curX > nextGrid.x) curX--;
                else if (curY < nextGrid.y) curY++;
                else if (curY > nextGrid.y) curY--;
                
                unit.gridX = curX; unit.gridY = curY;
                await window.wait(150); // 1マス進むスピード（0.15秒）
            }
            
            unit.visualAction = 'idle'; // 移動完了で待機アニメへ
            window.DEFENSE_STATE.moveHighlights = []; 
            
            // 移動後の攻撃判定
            ax = unit.gridX; ay = unit.gridY; let afterMoveTargets = [];
            targetList.forEach(t => {
                if (t.hp <= 0) return;
                let dist = Math.abs(ax - t.gridX) + Math.abs(ay - t.gridY);
                let usableSkills = unit.skills.filter(s => s.range >= dist);
                if (usableSkills.length > 0) { usableSkills.sort((a,b) => b.power - a.power); afterMoveTargets.push({ target: t, dist: dist, skill: usableSkills[0] }); }
            });
            if (afterMoveTargets.length > 0) {
                window.DEFENSE_STATE.attackHighlights = window.getAttackableGrids(unit); await window.wait(400);
                afterMoveTargets.sort((a,b) => (a.target.type === 'castle' ? -1 : (b.target.type === 'castle' ? 1 : a.dist - b.dist)));
                await window.executeDefenseBattle(unit, afterMoveTargets[0].target, afterMoveTargets[0].skill);
                window.DEFENSE_STATE.attackHighlights = [];
            }
        }
    }
    window.DEFENSE_STATE.moveHighlights = [];
};

window.getCutsceneSpriteHtml = function(u, direction, domId) {
    if (u.team === 'facility') {
        // ★修正: カタログから実際のマップチップデータを取得して表示
        let conf = (typeof catalog !== 'undefined') ? catalog[u.type] : null;
        if (!conf) {
            let emoji = '🏠'; if (u.type === 'castle') emoji = '🏰'; if (u.type === 'farm') emoji = '🚜';
            return `<div id="${domId}" style="font-size:150px; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.8)); transition: transform 0.3s;">${emoji}</div>`;
        }
        let imgName = conf.img || 'field';
        let img = (typeof images !== 'undefined') ? images[imgName] : null;
        let iw = img ? img.naturalWidth : 1000;
        let sc = 1.5;
        let sx = conf.sx || 0; let sy = conf.sy || 0; let sw = conf.sw || 100; let sh = conf.sh || 100;
        
        return `<div id="${domId}" class="cutscene-actor-facility" style="width: ${sw * sc}px; height: ${sh * sc}px; overflow:hidden; position:relative; transition: transform 0.3s; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.8));">
                    <div style="transform: scaleX(${direction}); width:100%; height:100%;">
                        <img src="${img ? img.src : ''}" style="position:absolute; top:-${sy * sc}px; left:-${sx * sc}px; width:${iw * sc}px; max-width:none;">
                    </div>
                </div>`;
    }
    
    let exactSkin = u.skin || 'robot'; let baseSkin = exactSkin.split('_')[0];
    let conf = null; if (typeof aiConfigs !== 'undefined') conf = aiConfigs[exactSkin] || aiConfigs[baseSkin];
    
    let imgKey = (conf && conf.img) ? conf.img : exactSkin; 
    let img = (typeof images !== 'undefined') ? (images[imgKey] || images[baseSkin] || images['robot']) : null;
    let iw = img ? img.naturalWidth : 1000;
    
    let sc = 1.5; // リッチに見えるよう少し拡大
    let filter = u.team === 'enemy' ? 'brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(3)' : 'none';
    
    // アニメーションループで制御できるよう data属性 を付与
    return `<div id="${domId}" class="cutscene-actor" data-skin="${exactSkin}" data-action="idle" data-frame="0" data-tick="0" data-scale="${sc}" style="width: 100px; height: 100px; overflow:hidden; position:relative; filter:${filter}; transition: transform 0.3s;">
                <div style="transform: scaleX(${direction}); width:100%; height:100%;">
                    <img src="${img ? img.src : ''}" style="position:absolute; top:0px; left:0px; width:${iw * sc}px; max-width:none;">
                </div>
            </div>`;
};

window.showDefenseCutscene = async function(act, def, damageVal, skill, canCounter, counterDmg, counterSkill) {
    if (!window.DEFENSE_STATE.animMode) return; 

    // ★追加：自ら攻撃を仕掛けた場合のみ、種族専用BGMを流す
    if (act.team === 'player' && window.DEFENSE_STATE.phase === 'player') {
        let baseSkin = (act.skin || 'robot').split('_')[0]; // 進化後もベース種族を取得
        if (window.audioManager) window.audioManager.playBGM('defense_' + baseSkin);
    }

    let cutUi = document.createElement('div'); cutUi.id = 'def-cutscene';
    cutUi.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:70000; display:flex; flex-direction:column; overflow:hidden; font-family:sans-serif; transition:opacity 0.2s; background: linear-gradient(to bottom, #1976D2, #81D4FA);`;
    
    let leftUnit = act; let rightUnit = def;
    let leftHp = leftUnit.hp; let rightHp = rightUnit.hp;

    cutUi.innerHTML = `
        <div id="cut-speedlines" style="position:absolute; top:0; left:-50%; width:200%; height:100%; background: repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.6) 80px, rgba(255,255,255,0.6) 120px); transform: skewX(-20deg); opacity:0; transition:opacity 0.1s;"></div>
        <style>@keyframes slide-speed { 0% { transform: skewX(-20deg) translateX(0); } 100% { transform: skewX(-20deg) translateX(-160px); } } @keyframes shake-hit { 0% {transform:translate(15px,15px)} 25% {transform:translate(-15px,-15px)} 50% {transform:translate(15px,-15px)} 75% {transform:translate(-15px,15px)} 100% {transform:translate(0,0)} }</style>
        <div style="position:absolute; top:20px; left:20px; width:40%; background:rgba(0,0,50,0.8); border:3px solid #4CAF50; border-radius:10px; padding:10px; color:white; z-index:70010;">
            <div style="font-size:24px; font-weight:bold; color:#4CAF50; margin-bottom:5px;">${leftUnit.name}</div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;"><span>HP</span><span id="hud-l-hp-text">${leftHp} / ${leftUnit.maxHp||leftUnit.hp}</span></div>
            <div style="width:100%; height:15px; background:#333; border-radius:5px; overflow:hidden;"><div id="hud-l-hp-bar" style="width:${(leftHp/(leftUnit.maxHp||leftUnit.hp))*100}%; height:100%; background:#4CAF50; transition:width 0.3s ease-out;"></div></div>
        </div>
        <div style="position:absolute; top:20px; right:20px; width:40%; background:rgba(50,0,0,0.8); border:3px solid #ff5252; border-radius:10px; padding:10px; color:white; z-index:70010;">
            <div style="font-size:24px; font-weight:bold; color:#ff5252; margin-bottom:5px; text-align:right;">${rightUnit.name}</div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;"><span>HP</span><span id="hud-r-hp-text">${rightHp} / ${rightUnit.maxHp||rightUnit.hp}</span></div>
            <div style="width:100%; height:15px; background:#333; border-radius:5px; overflow:hidden; transform:scaleX(-1);"><div id="hud-r-hp-bar" style="width:${(rightHp/(rightUnit.maxHp||rightUnit.hp))*100}%; height:100%; background:#ff5252; transition:width 0.3s ease-out;"></div></div>
        </div>
        <div id="cut-actor-stage" style="position:absolute; top:20%; left:0; width:100%; height:60%; display:flex; justify-content:center; align-items:center; z-index:70001;"></div>
        <div id="cut-flash" style="position:absolute; top:0; left:0; width:100%; height:100%; background:white; z-index:70002; opacity:0; pointer-events:none;"></div>
        <div id="cut-dmg-text" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(0); font-size:150px; font-weight:bold; color:#ff5252; font-style:italic; text-shadow: 0 0 20px #000, 4px 4px 0 #fff; opacity:0; z-index:70020; pointer-events:none;">0</div>
        <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:80%; max-width:800px; background:rgba(0,0,20,0.9); border:4px solid #2196F3; border-radius:10px; padding:20px; color:white; font-size:28px; font-weight:bold; box-shadow:0 10px 30px rgba(0,0,0,0.8); z-index:70020;">
            <div id="cut-dialogue" style="letter-spacing:2px;"></div>
        </div>
    `;
    document.body.appendChild(cutUi);

    let stage = document.getElementById('cut-actor-stage'); let dialogue = document.getElementById('cut-dialogue'); let speedlines = document.getElementById('cut-speedlines'); let dmgText = document.getElementById('cut-dmg-text');

    // カットシーン専用アニメーションループ
    let isCutsceneActive = true;
    let cutsceneLoop = () => {
        if (!isCutsceneActive) return;
        document.querySelectorAll('.cutscene-actor').forEach(el => {
            let exactSkin = el.getAttribute('data-skin'); let action = el.getAttribute('data-action');
            let baseSkin = exactSkin.split('_')[0];
            let conf = (typeof aiConfigs !== 'undefined') ? (aiConfigs[exactSkin] || aiConfigs[baseSkin]) : null;
            if (conf && conf.actions && conf.actions[action]) {
                let frames = conf.actions[action]; let tick = parseInt(el.getAttribute('data-tick')) + 1; let frameIdx = parseInt(el.getAttribute('data-frame'));
                if (tick >= 8) { 
                    tick = 0; 
                    if (action === 'sleep' && frameIdx >= frames.length - 1) frameIdx = frames.length - 1; // 死亡時は倒れたまま
                    else frameIdx = (frameIdx + 1) % frames.length; 
                }
                el.setAttribute('data-tick', tick); el.setAttribute('data-frame', frameIdx);
                let f = frames[frameIdx]; let sc = parseFloat(el.getAttribute('data-scale') || "1.5");
                el.style.width = (f.sw * sc) + 'px'; el.style.height = (f.sh * sc) + 'px';
                let imgEl = el.querySelector('img'); if (imgEl) { imgEl.style.left = -(f.sx * sc) + 'px'; imgEl.style.top = -(f.sy * sc) + 'px'; }
            }
        });
        requestAnimationFrame(cutsceneLoop);
    };
    requestAnimationFrame(cutsceneLoop);

    const playAnimPhase = async (aUnit, dUnit, damageVal, useSkill, isCounter) => {
        let isActLeft = (aUnit === leftUnit);
        
        dialogue.innerHTML = isCounter ? `${aUnit.name}「甘いッ！ 反撃だ！！」<br><span style="color:#FFC107;">『${useSkill.name}』！！</span>` : `${aUnit.name}「いくぞッ！」<br><span style="color:#00E5FF;">『${useSkill.name}』！！</span>`;
        
        // --- 1. アタッカー側の画面のみ表示 ---
        stage.innerHTML = window.getCutsceneSpriteHtml(aUnit, isActLeft ? 1 : -1, 'actor-act');
        let actDom = document.getElementById('actor-act');
        actDom.style.position = 'absolute';
        actDom.style.transform = `translateX(0)`; // 画面中央
        await window.wait(800);

        // --- 2. 突撃 or 発射 ---
        if (useSkill.type === 'melee') {
            actDom.setAttribute('data-action', 'move');
            actDom.style.transition = 'transform 0.3s ease-in';
            actDom.style.transform = `translateX(${isActLeft ? '100vw' : '-100vw'})`;
            await window.wait(300);
        } else {
            actDom.setAttribute('data-action', 'idle');
            actDom.style.filter = 'brightness(1.5) drop-shadow(0 0 20px cyan)';
            await window.wait(200);

            let fxOut = document.createElement('div'); cutUi.appendChild(fxOut);
            if (useSkill.name.includes('アースクエイク')) {
                actDom.style.animation = 'shake-hit 0.5s infinite'; // 地震は自分が揺れる
            } else if (useSkill.effect === 'beam') {
                // ★修正: 発射位置をキャラクターの前方(45vw)に調整
                fxOut.style.cssText = `position:absolute; top:50%; ${isActLeft ? 'left:45vw' : 'right:45vw'}; width:150vw; height:100px; background:linear-gradient(to ${isActLeft ? 'right' : 'left'}, cyan, white, transparent); box-shadow:0 0 50px cyan; mix-blend-mode:screen; z-index:70005;`;
                fxOut.animate([{ transform: `translateY(-50%) scaleX(0)`, opacity: 1, transformOrigin: isActLeft ? 'left' : 'right' }, { transform: `translateY(-50%) scaleX(1)`, opacity: 1, transformOrigin: isActLeft ? 'left' : 'right' }], { duration: 300, fill: 'forwards' });
            } else if (useSkill.effect === 'explosion' || useSkill.name.includes('スターダスト') || useSkill.name.includes('ファイア')) {
                // ★修正: 上空に向けて光球（エネルギー）を放ち上げる演出に変更！
                fxOut.style.cssText = `position:absolute; top:50%; ${isActLeft ? 'left:40vw' : 'right:40vw'}; width:80px; height:80px; background:radial-gradient(circle, white, #FF9800, transparent); border-radius:50%; box-shadow: 0 0 30px #FF9800; z-index:70005;`;
                fxOut.animate([
                    { transform: `translate(-50%, -50%) scale(0.5)`, top: '50%', opacity: 1 },
                    { transform: `translate(-50%, -50%) scale(1.5)`, top: '-20%', opacity: 0 }
                ], { duration: 400, fill: 'forwards', easing: 'ease-out' });
            } else {
                // 通常の飛ぶエフェクト
                let rot = isActLeft ? 45 : -45;
                fxOut.style.cssText = `position:absolute; top:50%; left:50%; width:100vw; height:20px; background:white; box-shadow:0 0 20px yellow; border-radius:50%; z-index:70005;`;
                fxOut.animate([{ transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(0) translateX(${isActLeft ? '0vw' : '0vw'})`, opacity: 1 }, { transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(1) translateX(${isActLeft ? '50vw' : '-50vw'})`, opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' });
            }
            await window.wait(400);
            if(fxOut) fxOut.remove();
            if(actDom.style.animation) actDom.style.animation = 'none';
        }

        // --- 3. ディフェンダー側の画面に切り替え ---
        stage.innerHTML = window.getCutsceneSpriteHtml(dUnit, isActLeft ? -1 : 1, 'actor-def');
        let defDom = document.getElementById('actor-def');
        defDom.style.position = 'absolute';
        defDom.style.transform = `translateX(0)`; // 防御側を中央に
        await window.wait(100);

        // --- 4. 攻撃の着弾 ---
        let fxDiv = document.createElement('div'); cutUi.appendChild(fxDiv);
        if (useSkill.type === 'melee') {
            stage.innerHTML += window.getCutsceneSpriteHtml(aUnit, isActLeft ? 1 : -1, 'actor-act');
            actDom = document.getElementById('actor-act');
            actDom.style.position = 'absolute';
            actDom.setAttribute('data-action', 'move');
            actDom.style.transform = `translateX(${isActLeft ? '-50vw' : '50vw'})`;
            await window.wait(50);
            
            actDom.style.transition = 'transform 0.15s ease-out';
            actDom.style.transform = `translateX(${isActLeft ? '-15vw' : '15vw'})`; 
            speedlines.style.opacity = '1'; speedlines.style.animation = 'slide-speed 0.2s infinite linear'; 
            await window.wait(150);
            speedlines.style.opacity = '0'; speedlines.style.animation = 'none';
        } else {
            // ★修正: 遠距離技ごとの多彩な「着弾」エフェクト
            if (useSkill.name.includes('アースクエイク')) {
                // 地震の着弾エフェクト (土煙)
                fxDiv.style.cssText = `position:absolute; bottom:0; left:50%; width:600px; height:300px; background:radial-gradient(ellipse, rgba(139,69,19,0.8) 0%, transparent 70%); z-index:70005;`;
                fxDiv.animate([{ transform: `translate(-50%, 50px) scale(0.5)`, opacity: 1 }, { transform: `translate(-50%, -50px) scale(1.5)`, opacity: 0 }], { duration: 500, fill: 'forwards', easing: 'ease-out' });
                defDom.style.animation = 'shake-hit 0.5s infinite'; // 激しく揺らす
            } else if (useSkill.effect === 'beam') {
                fxDiv.style.cssText = `position:absolute; top:50%; left:50%; width:100vw; height:250px; background:linear-gradient(to bottom, transparent, cyan, white, cyan, transparent); box-shadow:0 0 50px cyan; mix-blend-mode:screen; z-index:70005;`;
                fxDiv.animate([{ transform: `translate(-50%, -50%) scaleY(0)`, opacity: 1 }, { transform: `translate(-50%, -50%) scaleY(1.2)`, opacity: 1, offset: 0.2 }, { transform: `translate(-50%, -50%) scaleY(0)`, opacity: 0 }], { duration: 400, fill: 'forwards', easing: 'ease-out' });
            } else if (useSkill.effect === 'explosion') {
                fxDiv.style.cssText = `position:absolute; top:50%; left:50%; width:400px; height:400px; background:radial-gradient(circle, white 10%, yellow 30%, red 70%, transparent 100%); border-radius:50%; mix-blend-mode:screen; z-index:70005;`;
                fxDiv.animate([{ transform: `translate(-50%,-50%) scale(0)`, opacity: 1, filter: 'brightness(2)' }, { transform: `translate(-50%,-50%) scale(1.5)`, opacity: 1, filter: 'brightness(1)', offset: 0.5 }, { transform: `translate(-50%,-50%) scale(2.5)`, opacity: 0, filter: 'brightness(0.5)' }], { duration: 500, fill: 'forwards', easing: 'ease-out' });
            } else {
                let rot = isActLeft ? 45 : -45;
                fxDiv.style.cssText = `position:absolute; top:50%; left:50%; width:150vw; height:50px; background:white; box-shadow:0 0 40px yellow; border-radius:50%; z-index:70005;`;
                fxDiv.animate([{ transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(0) translateX(${isActLeft ? '-50vw' : '50vw'})`, opacity: 1 }, { transform: `translate(-50%,-50%) rotate(${rot}deg) scaleX(1) translateX(0)`, opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' });
            }
            await window.wait(300);
            if(defDom.style.animation === 'shake-hit 0.5s infinite') defDom.style.animation = 'none';
        }

        // ★修正: ダメージと振動（回避演出の追加）
        let flash = document.getElementById('cut-flash'); 
        if (damageVal > 0) {
            flash.style.transition = 'none'; flash.style.opacity = '0.8'; setTimeout(() => { flash.style.transition = 'opacity 0.4s'; flash.style.opacity = '0'; }, 50);
            defDom.style.animation = 'shake-hit 0.3s'; defDom.style.filter = "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)";
            dmgText.innerText = damageVal; dmgText.style.color = "#ff5252";
        } else {
            // MISS時の回避演出（スッと横に避ける）
            defDom.style.transition = 'transform 0.1s';
            defDom.style.transform = `translateX(${isActLeft ? '30vw' : '-30vw'})`; // 少し後ろに下がる
            dmgText.innerText = "MISS"; dmgText.style.color = "#aaa";
        }
        
        dmgText.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.1s'; dmgText.style.transform = 'translate(-50%,-50%) scale(1)'; dmgText.style.opacity = '1';

        // HPバー更新
        if (damageVal > 0) {
            if (dUnit === leftUnit) { 
                leftHp = Math.max(0, leftHp - damageVal); document.getElementById('hud-l-hp-text').innerText = `${leftHp} / ${leftUnit.maxHp||leftUnit.hp}`; document.getElementById('hud-l-hp-bar').style.width = `${(leftHp / (leftUnit.maxHp||leftUnit.hp)) * 100}%`;
            } else { 
                rightHp = Math.max(0, rightHp - damageVal); document.getElementById('hud-r-hp-text').innerText = `${rightHp} / ${rightUnit.maxHp||rightUnit.hp}`; document.getElementById('hud-r-hp-bar').style.width = `${(rightHp / (rightUnit.maxHp||rightUnit.hp)) * 100}%`;
            }
        }

        // --- 5. 死亡演出 ---
        let currentDefHp = (dUnit === leftUnit) ? leftHp : rightHp;
        if (currentDefHp <= 0) {
            await window.wait(500);
            if (dUnit.team !== 'facility') {
                defDom.style.animation = 'none'; 
                defDom.setAttribute('data-action', 'sleep'); // 睡眠アニメ（死亡）に変更
                dialogue.innerHTML = `${dUnit.name}「ぐあああっ……ここまで、か……」`;
                defDom.style.transition = 'transform 1s ease-in, opacity 1s, filter 1s';
                defDom.style.transform = `translateX(${isActLeft ? '20vw' : '-20vw'}) translateY(50px) rotate(${isActLeft ? 90 : -90}deg)`; // 倒れる
                defDom.style.opacity = '0.5'; defDom.style.filter = 'grayscale(1)';
                await window.wait(1500); // 倒れるのをしっかり見せる
            } else {
                dialogue.innerHTML = `${dUnit.name} が破壊された！！`;
                defDom.style.transition = 'opacity 1s'; defDom.style.opacity = '0';
                await window.wait(1500);
            }
        } else {
            await window.wait(1000);
        }
        
        fxDiv.remove(); dmgText.style.transform = 'translate(-50%,-50%) scale(0)'; dmgText.style.opacity = '0'; stage.innerHTML = '';
    };

    await window.wait(200); await playAnimPhase(act, def, damageVal, skill, false);
    if (canCounter && leftHp > 0 && rightHp > 0) { 
        await window.wait(200); await playAnimPhase(def, act, counterDmg, counterSkill, true); 
    }
    
    isCutsceneActive = false; // アニメーションループ停止
    cutUi.style.opacity = '0'; await window.wait(200); cutUi.remove();
};

window.executeDefenseBattle = async function(attacker, defender, actSkill) {
    // ★追加: 回避判定（素早さ1差につき5%回避、最大80%）
    let isHit = true;
    if (defender.speed > attacker.speed && defender.team !== 'facility') {
        let dodgeChance = Math.min(0.8, (defender.speed - attacker.speed) * 0.05);
        if (Math.random() < dodgeChance) isHit = false;
    }
    // 回避時はダメージ0にする
    let dmg = isHit ? Math.max(1, Math.floor(attacker.atk * actSkill.power) - Math.floor((defender.def || 0) * 0.5)) : 0;

    let canCounter = false; let counterDmg = 0; let counterSkill = null; let isCounterHit = true;
    if (defender.hp - dmg > 0 && defender.team !== 'facility') {
        let dist = Math.abs(attacker.gridX - defender.gridX) + Math.abs(attacker.gridY - defender.gridY);
        let usableCounterSkills = defender.skills.filter(s => s.range >= dist);
        if (usableCounterSkills.length > 0) {
            canCounter = true; usableCounterSkills.sort((a,b) => b.power - a.power); counterSkill = usableCounterSkills[0];
            
            // ★追加: 反撃の回避判定
            if (attacker.speed > defender.speed) {
                let cDodgeChance = Math.min(0.8, (attacker.speed - defender.speed) * 0.05);
                if (Math.random() < cDodgeChance) isCounterHit = false;
            }
            counterDmg = isCounterHit ? Math.max(1, Math.floor(defender.atk * counterSkill.power) - Math.floor((attacker.def || 0) * 0.5)) : 0;
        }
    }

    if (window.DEFENSE_STATE.animMode) await window.showDefenseCutscene(attacker, defender, dmg, actSkill, canCounter, counterDmg, counterSkill);

    // 攻撃の反映
    let color = attacker.team === 'player' ? '#4CAF50' : '#ff5252';
    if (dmg > 0) {
        defender.hp -= dmg;
        if (defender.team === 'facility') {
            let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
            if (currentAssets[defender.id]) currentAssets[defender.id].hp = defender.hp;
        }
        window.addDefenseLog(`<span style="color:${color};">${attacker.name}の『${actSkill.name}』！ ${defender.name} に ${dmg} のダメージ！</span>`);
    } else {
        window.addDefenseLog(`<span style="color:${color};">${attacker.name}の『${actSkill.name}』！ しかし ${defender.name} に避けられた！(MISS)</span>`);
    }

    if (!window.DEFENSE_STATE.animMode) {
        if (dmg > 0) {
            let mainUi = document.getElementById('main-container'); if (mainUi) { mainUi.classList.add('arena-shake'); setTimeout(() => mainUi.classList.remove('arena-shake'), 300); }
            let pos = window.getGridPixelPos(defender.gridX, defender.gridY);
            if (typeof floatingTexts !== 'undefined') floatingTexts.push({ text: `-${dmg}`, x: pos.x, y: pos.y - 50, color: "#ff5252", life: 60, dy: -1 });
        } else {
            let pos = window.getGridPixelPos(defender.gridX, defender.gridY);
            if (typeof floatingTexts !== 'undefined') floatingTexts.push({ text: `MISS`, x: pos.x, y: pos.y - 50, color: "#aaa", life: 60, dy: -1 });
        }
        attacker.visualAction = 'move'; await window.wait(300); attacker.visualAction = 'idle'; await window.wait(200);
    }

    // 反撃の反映
    if (canCounter) {
        let cColor = defender.team === 'player' ? '#4CAF50' : '#ff5252';
        if (counterDmg > 0) {
            attacker.hp -= counterDmg;
            window.addDefenseLog(`<span style="color:${cColor};">${defender.name}の反撃『${counterSkill.name}』！ ${attacker.name} に ${counterDmg} のダメージ！</span>`);
            if (!window.DEFENSE_STATE.animMode) {
                let pos = window.getGridPixelPos(attacker.gridX, attacker.gridY);
                if (typeof floatingTexts !== 'undefined') floatingTexts.push({ text: `-${counterDmg}`, x: pos.x, y: pos.y - 50, color: "#ff5252", life: 60, dy: -1 });
                defender.visualAction = 'move'; await window.wait(300); defender.visualAction = 'idle'; await window.wait(200);
            }
        } else {
            window.addDefenseLog(`<span style="color:${cColor};">${defender.name}の反撃『${counterSkill.name}』！ しかし避けられた！(MISS)</span>`);
            if (!window.DEFENSE_STATE.animMode) {
                let pos = window.getGridPixelPos(attacker.gridX, attacker.gridY);
                if (typeof floatingTexts !== 'undefined') floatingTexts.push({ text: `MISS`, x: pos.x, y: pos.y - 50, color: "#aaa", life: 60, dy: -1 });
            }
        }
    }

    const checkDeath = async (unit) => {
        if (unit.hp <= 0) {
            window.addDefenseLog(`<span style="color:#FFC107; font-weight:bold;">${unit.name} は撃破された...！</span>`);
            if (unit.type === 'castle' && window.DEFENSE_STATE.mode !== 'mock') {
                window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(false); }, 1000);
            } else if (unit.team === 'enemy') {
                let aliveEnemies = window.DEFENSE_STATE.enemies.filter(e => e.hp > 0);
                let cfg = window.DEFENSE_STATE.waveConfig;
                
                if (aliveEnemies.length === 0) {
                    if (window.DEFENSE_STATE.mode === 'mock') {
                        window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(true); }, 1000);
                    } else if (window.DEFENSE_STATE.mode === 'endless') {
                        window.aiPet.currentEndlessWave++;
                        cfg.spawnedSoFar = 0; 
                        await window.showDefenseMessage(`WAVE ${window.aiPet.currentEndlessWave} 到達！`, "#E040FB");
                        window.addDefenseLog(`【WAVE CLEAR】 さらに強力な敵が接近中...！`);
                        await window.wait(1000);
                        await window.spawnReinforcements(3 + Math.floor(window.aiPet.currentEndlessWave / 2));
                    } else {
                        if (cfg.spawnedSoFar >= cfg.totalToSpawn) { 
                            window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(true); }, 1000); 
                        }
                    }
                }
            } else if (unit.team === 'player' && (window.DEFENSE_STATE.mode === 'endless' || window.DEFENSE_STATE.mode === 'mock')) {
                let alivePlayers = window.DEFENSE_STATE.deployedParty.filter(p => p.hp > 0);
                if (alivePlayers.length === 0) {
                    window.DEFENSE_STATE.isActive = false; setTimeout(() => { window.endDefenseBattle(false); }, 1000);
                }
            }
        }
    };
    await checkDeath(defender);
    if (canCounter && window.DEFENSE_STATE.isActive) await checkDeath(attacker);
};

window.endDefenseBattle = async function(isWin) {
    if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
    window.DEFENSE_STATE.isActive = false;
    await window.wait(500);

    // ★追加：勝利時はクリアBGM、敗北時や全滅時は無音にして絶望感を出す
    if (window.audioManager) {
        if (isWin) window.audioManager.playBGM('defense_clear');
        else window.audioManager.stopBGM();
    }
    
    let overlay = document.createElement('div'); overlay.id = 'def-result-overlay';
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:80000; display:flex; justify-content:center; align-items:center; flex-direction:column; font-family:sans-serif;`;
    document.body.appendChild(overlay);

    if (window.DEFENSE_STATE.mode === 'mock') {
        let tName = window.DEFENSE_STATE.mockTarget ? window.DEFENSE_STATE.mockTarget.playerName : "ライバル";
        overlay.innerHTML = `
            <div style="background:#222; border:4px solid #00E5FF; border-radius:12px; padding:40px; text-align:center; box-shadow:0 0 30px #00E5FF; width:80%; max-width:600px;">
                <h1 style="color:#00E5FF; font-size:36px; margin-bottom:10px;">${isWin ? '🎉 模擬戦 勝利！' : '💀 模擬戦 敗北...'}</h1>
                <p style="color:#fff; font-size:18px; margin-bottom:30px;">${tName} のパーティとの戦闘訓練が終了しました。</p>
                <button onclick="window.closeDefenseResult(); window.openArenaReception();" style="padding:15px 50px; font-size:22px; font-weight:bold; background:#004D40; color:white; border:none; border-radius:8px; cursor:pointer;">受付へ戻る</button>
            </div>
        `;
    } else if (window.DEFENSE_STATE.mode === 'endless') {
        let reachedWave = window.aiPet.currentEndlessWave || 1;
        let bestRecord = window.aiPet.bestEndlessWave || 0;
        let isNewRecord = reachedWave > bestRecord;
        if (isNewRecord) window.aiPet.bestEndlessWave = reachedWave; 
        
        // ★追加：エンドレス防衛の記録をクラウドに送信！
        if (typeof window.updateDefenseRanking === 'function') window.updateDefenseRanking('endless', reachedWave, window.aiPet.lastDefenseParty);

        overlay.innerHTML = `
            <div style="background:#222; border:4px solid #E040FB; border-radius:12px; padding:40px; text-align:center; box-shadow:0 0 30px #E040FB; width:80%; max-width:600px;">
                <h1 style="color:#E040FB; font-size:36px; margin-bottom:10px;">💀 全滅...サバイバル終了 💀</h1>
                <p style="color:#fff; font-size:18px; margin-bottom:30px;">圧倒的な戦力の前に、防衛部隊は倒れました。</p>
                <div style="background:#111; border:2px solid #555; border-radius:8px; padding:20px; margin-bottom:30px;">
                    <div style="color:#aaa; font-size:16px;">到達ウェーブ</div>
                    <div style="color:#FFD700; font-size:42px; font-weight:bold; text-shadow:0 0 10px #FFD700;">WAVE ${reachedWave}</div>
                    ${isNewRecord ? `<div style="color:#ff5252; font-weight:bold; margin-top:10px; animation:shake-hit 0.5s infinite;">🏆 NEW RECORD!</div>` : ''}
                </div>
                <button onclick="window.closeDefenseResult()" style="padding:15px 50px; font-size:22px; font-weight:bold; background:#4A148C; color:white; border:none; border-radius:8px; cursor:pointer;">島へ戻る</button>
            </div>
        `;
    } else {
        if (isWin) {
            window.aiPet.defenseWave = (window.aiPet.defenseWave || 1) + 1; 
            // ★追加：通常防衛の記録をクラウドに送信！
            if (typeof window.updateDefenseRanking === 'function') window.updateDefenseRanking('normal', window.aiPet.defenseWave - 1, window.aiPet.lastDefenseParty);
            window.showDefenseResultUI(overlay);
        } else {
            window.showRebuildUI(overlay);
        }
    }
};

window.showDefenseResultUI = function(overlay) {
    let currentWave = window.aiPet.defenseWave - 1;
    overlay.innerHTML = `
        <div style="background:#222; border:4px solid #FFD700; border-radius:12px; padding:40px; text-align:center; box-shadow:0 0 30px #FFD700; width:80%; max-width:600px;">
            <h1 style="color:#FFD700; font-size:40px; margin-bottom:10px;">🎖️ 防衛成功！ 🎖️</h1>
            <p style="color:#fff; font-size:20px; margin-bottom:30px;">見事、魔物の群れから島を守り抜きました！</p>
            <div style="background:#111; border:2px solid #555; border-radius:8px; padding:20px; margin-bottom:30px;">
                <div style="color:#aaa; font-size:16px;">クリアしたウェーブ</div><div style="color:#FF5252; font-size:36px; font-weight:bold;">WAVE ${currentWave}</div>
            </div>
            <button onclick="window.closeDefenseResult()" style="padding:15px 50px; font-size:22px; font-weight:bold; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer;">島へ戻る</button>
        </div>
    `;
};

window.showRebuildUI = function(overlay) {
    let destroyed = window.DEFENSE_STATE.facilities.filter(f => f.hp <= 0);
    // ★修正1：正しい所持金変数（aiPet.gold）を参照する
    let currentMoney = (window.aiPet && window.aiPet.gold) ? window.aiPet.gold : 0;

    if (destroyed.length === 0) {
        overlay.innerHTML = `<div style="background:#222; border:4px solid #F44336; border-radius:12px; padding:40px; text-align:center;"><h1 style="color:#F44336;">防衛戦終了</h1><p style="color:#fff;">破壊された施設はありませんでした。</p><button onclick="window.closeDefenseResult()" style="padding:15px 40px; font-size:20px; cursor:pointer;">島へ戻る</button></div>`;
        return;
    }

    let listHtml = destroyed.map(f => {
        let conf = window.DEFENSE_CONFIG.facilities[f.type]; let cost = conf ? conf.rebuildCost : 5000;
        return `<label style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:15px; border:1px solid #444; border-radius:6px; margin-bottom:10px; cursor:pointer;"><div style="display:flex; align-items:center; gap:15px;"><input type="checkbox" class="rebuild-checkbox" data-id="${f.id}" data-cost="${cost}" onchange="window.updateRebuildCost()" style="width:20px; height:20px; cursor:pointer;"><span style="color:#fff; font-size:18px; font-weight:bold;">${f.name}</span></div><div style="color:#FFC107; font-size:18px;">${cost} G</div></label>`;
    }).join('');

    // ★修正2：flexboxを使って、リスト部分だけがスクロールし、ボタンは常に画面内に残るようにする
    overlay.innerHTML = `
        <div style="background:#222; border:4px solid #F44336; border-radius:12px; padding:25px; text-align:center; box-shadow:0 0 30px #F44336; width:90%; max-width:700px; max-height:85vh; display:flex; flex-direction:column; box-sizing:border-box;">
            <h1 style="color:#F44336; font-size:32px; margin-top:0; margin-bottom:10px; flex-shrink:0;">☠️ 島が荒れ果ててしまった... ☠️</h1>
            <p style="color:#ccc; font-size:16px; margin-bottom:15px; flex-shrink:0;">魔物の攻撃により、いくつかの施設が破壊されました。<br><strong style="color:#ff5252;">復興しない施設は島から完全に消滅します。</strong></p>
            <div style="text-align:right; color:#fff; font-size:18px; margin-bottom:10px; flex-shrink:0;">現在の所持金：<span style="color:#FFC107;">${currentMoney} G</span></div>
            
            <div style="background:#111; padding:15px; border-radius:8px; margin-bottom:20px; flex:1; overflow-y:auto; text-align:left;">${listHtml}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; background:#333; padding:15px; border-radius:8px; margin-bottom:20px; flex-shrink:0;">
                <div style="color:#fff; font-size:20px;">復興費用の合計：</div><div id="rebuild-total-cost" style="color:#FFC107; font-size:28px; font-weight:bold;">0 G</div>
            </div>
            
            <div style="display:flex; gap:20px; justify-content:center; flex-shrink:0;">
                <button id="btn-rebuild-exec" onclick="window.executeRebuild()" style="flex:1; padding:15px; font-size:18px; font-weight:bold; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer;">選択した施設を復興</button>
                <button onclick="window.executeAbandon()" style="flex:1; padding:15px; font-size:18px; font-weight:bold; background:#444; color:#aaa; border:2px solid #666; border-radius:8px; cursor:pointer;">復興を諦める</button>
            </div>
        </div>
    `;
};

window.updateRebuildCost = function() {
    let checkboxes = document.querySelectorAll('.rebuild-checkbox'); let total = 0;
    checkboxes.forEach(cb => { if (cb.checked) total += parseInt(cb.dataset.cost); });
    
    // ★修正1：正しい所持金変数（aiPet.gold）を参照
    let currentMoney = (window.aiPet && window.aiPet.gold) ? window.aiPet.gold : 0;
    
    let costText = document.getElementById('rebuild-total-cost'); let execBtn = document.getElementById('btn-rebuild-exec');
    costText.innerText = `${total} G`;
    if (total > currentMoney) { costText.style.color = '#ff5252'; execBtn.style.opacity = '0.5'; execBtn.style.pointerEvents = 'none'; execBtn.innerText = '所持金が足りません'; } 
    else { costText.style.color = '#FFC107'; execBtn.style.opacity = '1'; execBtn.style.pointerEvents = 'auto'; execBtn.innerText = '選択した施設を復興'; }
};

// ==========================================
// ★追加: 防衛機能専用のリッチなアラート＆確認ダイアログ
// ==========================================
window.showDefenseAlert = function(title, message, callback) {
    let overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:95000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
    overlay.innerHTML = `
        <div style="background:#222; border:3px solid #FFD700; border-radius:12px; padding:30px; width:80%; max-width:400px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8); color:#fff;">
            <h2 style="color:#FFD700; margin-top:0; margin-bottom:15px; font-size:24px;">${title}</h2>
            <p style="font-size:16px; color:#ccc; margin-bottom:25px; line-height:1.5;">${message}</p>
            <button id="def-alert-ok" style="padding:12px 40px; font-size:18px; font-weight:bold; background:#2196F3; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.5);">確認</button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('def-alert-ok').onclick = () => { overlay.remove(); if(callback) callback(); };
};

window.showDefenseConfirm = function(title, message, onYes) {
    let overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:95000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
    overlay.innerHTML = `
        <div style="background:#222; border:3px solid #ff5252; border-radius:12px; padding:30px; width:80%; max-width:400px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.8); color:#fff;">
            <h2 style="color:#ff5252; margin-top:0; margin-bottom:15px; font-size:24px;">${title}</h2>
            <p style="font-size:16px; color:#ccc; margin-bottom:25px; line-height:1.5;">${message}</p>
            <div style="display:flex; gap:15px; justify-content:center;">
                <button id="def-conf-yes" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#b71c1c; color:white; border:none; border-radius:6px; cursor:pointer;">はい</button>
                <button id="def-conf-no" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer;">いいえ</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('def-conf-yes').onclick = () => { overlay.remove(); if(onYes) onYes(); };
    document.getElementById('def-conf-no').onclick = () => { overlay.remove(); };
};

// ==========================================
// ★修正: リッチUIを呼び出すように実行処理を変更
// ==========================================
window.executeRebuild = function() {
    let checkboxes = document.querySelectorAll('.rebuild-checkbox'); let totalCost = 0; let toDelete = [];
    checkboxes.forEach(cb => { if (cb.checked) totalCost += parseInt(cb.dataset.cost); else toDelete.push(cb.dataset.id); });
    
    let currentMoney = (window.aiPet && window.aiPet.gold) ? window.aiPet.gold : 0;
    if (totalCost > currentMoney) return; 
    
    if (window.aiPet && typeof window.aiPet.gold !== 'undefined') window.aiPet.gold -= totalCost;
    if (typeof updateStatusUI === 'function') updateStatusUI(); 

    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    toDelete.forEach(id => { if (currentAssets && currentAssets[id]) delete currentAssets[id]; });
    
    // アラートの中身を判定
    let msgTitle = ""; let msgBody = "";
    if (totalCost > 0) {
        msgTitle = "🛠️ 復興完了";
        msgBody = `<span style="color:#FFD700; font-weight:bold; font-size:20px;">${totalCost} G</span> を支払って施設を復興しました！<br><span style="color:#ff5252; font-size:14px; display:block; margin-top:10px;">（チェックしなかった施設は消滅しました）</span>`;
    } else if (toDelete.length > 0) {
        msgTitle = "🏚️ 施設消滅";
        msgBody = "復興しなかったため、破壊された施設はすべて消滅しました...";
    }

    if (msgTitle) {
        window.showDefenseAlert(msgTitle, msgBody, () => { window.closeDefenseResult(); });
    } else {
        window.closeDefenseResult();
    }
};

window.executeAbandon = function() {
    window.showDefenseConfirm(
        "⚠️ 復興の放棄", 
        '本当にすべての復興を諦めますか？<br><span style="color:#ff5252; font-size:14px; display:block; margin-top:10px;">（破壊された施設は完全に島から消滅します）</span>', 
        () => {
            let destroyed = window.DEFENSE_STATE.facilities.filter(f => f.hp <= 0);
            let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
            destroyed.forEach(f => { if (currentAssets && currentAssets[f.id]) delete currentAssets[f.id]; });
            
            window.showDefenseAlert("🏚️ 施設消滅", "復興を放棄したため、破壊された施設はすべて消滅しました...", () => {
                window.closeDefenseResult();
            });
        }
    );
};

window.closeDefenseResult = function() {
    let overlay = document.getElementById('def-result-overlay'); if (overlay) overlay.remove();
    window._executeGiveUp(); 
};

window.giveUpDefense = function(skipConfirm = false) {
    if (skipConfirm) {
        window._executeGiveUp(); return;
    }
    
    let isMock = window.DEFENSE_STATE.mode === 'mock';
    let titleTxt = isMock ? "模擬戦の終了" : "撤退の確認";
    let descTxt = isMock ? "模擬戦を中止して受付に戻りますか？<br>（※ペナルティはありません）" : "城を捨てて撤退しますか？<br>（※城は破壊され、敗北扱いになります）";
    let btnTxt = isMock ? "中止する" : "撤退する";
    let btnColor = isMock ? "#006064" : "#b71c1c";
    let bdColor = isMock ? "#00E5FF" : "#ff5252";

    let modal = document.createElement('div');
    modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:90000; display:flex; justify-content:center; align-items:center;`;
    modal.innerHTML = `
        <div style="background:#222; border:3px solid ${bdColor}; border-radius:12px; padding:30px; width:80%; max-width:400px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:${bdColor}; margin-top:0; margin-bottom:15px; font-size:24px;">${titleTxt}</h2>
            <p style="font-size:16px; color:#ccc; margin-bottom:25px; line-height:1.5;">${descTxt}</p>
            <div style="display:flex; gap:15px; justify-content:center;">
                <button id="btn-giveup-yes" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:${btnColor}; color:white; border:none; border-radius:6px; cursor:pointer;">${btnTxt}</button>
                <button id="btn-giveup-no" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer;">キャンセル</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('btn-giveup-yes').onclick = () => {
        modal.remove();
        if (isMock) { window.endDefenseBattle(false); } 
        else { 
            // ★修正: 撤退した場合は「王城が破壊された（敗北）」として復興UIを呼び出す！
            let castle = window.DEFENSE_STATE.facilities.find(f => f.type === 'castle');
            if (castle) {
                castle.hp = 0;
                let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                if (currentAssets[castle.id]) currentAssets[castle.id].hp = 0;
            }
            window.endDefenseBattle(false); 
        }
    };
    document.getElementById('btn-giveup-no').onclick = () => { modal.remove(); };
};

window._executeGiveUp = function() {
    if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
    window.DEFENSE_STATE.isActive = false; window.DEFENSE_STATE.isEmergency = false; window.currentMode = 'play'; 
    let controls = document.getElementById('defense-controls'); if (controls) controls.style.display = 'none';
    let style = document.getElementById('def-hide-style'); if (style) style.innerHTML = '';

    // ★追加：すべての防衛フェーズが終わり、育成モードのキャラクターBGMに戻す
    if (window.audioManager) {
        window.audioManager.restoreMainBGM();
    }

    if (typeof render === 'function') render();
};

window.renderDefenseRankingList = async function(mode = 'normal') {
    const tabNormal = document.getElementById('rank-tab-def-normal');
    const tabEndless = document.getElementById('rank-tab-def-endless');
    
    if (tabNormal && tabEndless) {
        if (mode === 'normal') {
            tabNormal.style.background = '#4CAF50'; tabNormal.style.color = '#fff'; tabNormal.style.border = 'none';
            tabEndless.style.background = '#222'; tabEndless.style.color = '#E040FB'; tabEndless.style.border = '1px solid #E040FB';
        } else {
            tabEndless.style.background = '#E040FB'; tabEndless.style.color = '#fff'; tabEndless.style.border = 'none';
            tabNormal.style.background = '#222'; tabNormal.style.color = '#4CAF50'; tabNormal.style.border = '1px solid #4CAF50';
        }
    }

    const list = document.getElementById('ranking-list-container');
    if(!list) return;
    
    list.style.display = 'block'; list.style.width = '100%';
    list.innerHTML = `<div style="text-align:center; color:#FFF; margin-top:50px; font-size:18px; font-weight:bold;">📡 防衛記録を取得中...</div>`;
    
    let detailArea = document.getElementById('ranking-detail-area');
    if (detailArea) detailArea.style.display = 'none'; 

    let myId = localStorage.getItem('my_player_id') || 'local_me';
    
    // ★修正：クラウドからランキングと他プレイヤーのパーティを取得する
    let rankList = [];
    if (typeof window.fetchDefenseRanking === 'function') {
        rankList = await window.fetchDefenseRanking(mode);
    }

    // 通信エラー等で空だった場合のフェイルセーフ（自分の記録だけ表示）
    if (rankList.length === 0) {
        let recordWave = mode === 'normal' ? ((window.aiPet && window.aiPet.defenseWave) ? window.aiPet.defenseWave - 1 : 0) : ((window.aiPet && window.aiPet.bestEndlessWave) ? window.aiPet.bestEndlessWave : 0);
        if (recordWave > 0 && window.aiPet && window.aiPet.lastDefenseParty) {
            let myName = window.aiPet.name || '現在のAI';
            rankList.push({ playerId: myId, playerName: myName, wave: recordWave, party: window.aiPet.lastDefenseParty });
        }
    }

    window.arenaRankDataCache = rankList; 

    if (!rankList || rankList.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#888; margin-top:50px; font-size:18px;">まだ記録がありません。<br>王城から出撃して島を防衛しよう！</div>`;
        return;
    }

    let html = '';
    rankList.forEach((data, index) => {
        let rankIcon = `<span style="color:#888; font-size:20px; font-weight:bold;">${index + 1}位</span>`;
        if (index === 0) rankIcon = "<span style='color:#FFD700; font-size:24px; font-weight:bold; text-shadow:0 0 5px #FFD700;'>🥇 1位</span>";
        
        let isMe = (data.playerId === myId);
        let pName = data.playerName || "名無しプレイヤー";
        if (isMe) pName = `✨ ${pName} (あなた)`;
        
        let leaderSkin = (data.party && data.party.length > 0 && data.party[0].skin) ? data.party[0].skin : 'robot';
        let typeIcon = leaderSkin.split('_')[0] === 'ghost' ? '👻' : '🤖'; 
        let petNameStr = (typeof monsterBookData !== 'undefined' && monsterBookData[leaderSkin] ? monsterBookData[leaderSkin].name : leaderSkin);

        let themeColor = mode === 'normal' ? '#4CAF50' : '#E040FB';

        html += `
            <div style="background: ${isMe ? 'rgba(76, 175, 80, 0.15)' : '#222'}; border: 2px solid ${isMe ? themeColor : '#444'}; border-radius: 8px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="width:80px; text-align:center;">${rankIcon}</div>
                    <div>
                        <div style="font-size:16px; font-weight:bold; color:${themeColor}; margin-bottom:4px;">${pName}</div>
                        <div style="font-size:14px; color:#aaa;">リーダー: ${typeIcon} ${petNameStr}</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="font-size:32px; font-weight:bold; color:${themeColor}; text-shadow:0 2px 4px rgba(0,0,0,0.5);">WAVE ${data.wave || 1}</div>
                    <button onclick="window.startMockBattlePrep(${index})" style="background:#004D40; color:white; border:1px solid #00E5FF; border-radius:4px; padding:8px 12px; font-weight:bold; cursor:pointer; white-space:nowrap; transition:0.2s;">⚔️ 挑む</button>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
};

// 🛡️ 防衛モニター（襲撃判定）の起動処理
if (!window._defenseMonitorStarted) {
    window.startDefenseMonitor();
    window._defenseMonitorStarted = true;
    console.log("Defense monitor started.");
}

// ==========================================
// 🔧 デバッグ用：防衛機能テスト ＆ 演出確認 ＆ 施設HP管理 UI
// ==========================================
// ==========================================
// 🔧 デバッグ用：防衛機能テスト ＆ 演出確認 ＆ 施設HP管理 UI
// ==========================================
setTimeout(() => {
    // UI(HTML)は index.html のアコーディオン内に統合済みのためDOM生成処理は削除

    // --- 共通機能 ---
    window.applyDebugMaxDeploy = function() {
        let val = parseInt(document.getElementById('debug-max-deploy').value);
        if (val >= 1 && val <= 15) { window.DEFENSE_CONFIG.maxDeploy = val; alert("適用しました"); }
    };

    window.forceTriggerDefense = function() {
        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        let hasCastle = Object.values(currentAssets).some(a => a && a.type === 'castle');
        if (!hasCastle) { alert("⚠️ 島に「王城」が建っていないため、襲撃イベントを開始できません！"); return; }
        if (typeof switchMode === 'function') switchMode('play');
        window.triggerEmergency();
    };

    // --- 復興UI 強制テスト実行関数 ---
    window.debugForceRebuildUI = function() {
        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        let hasCastle = Object.values(currentAssets).some(a => a && a.type === 'castle');
        if (!hasCastle) { alert("⚠️ 島に「王城」が建っていないため、テストできません！"); return; }
        
        // 全施設を強制的にHP0にして敗北処理へ流し込む
        window.DEFENSE_STATE.facilities = [];
        Object.keys(currentAssets).forEach(key => {
            let a = currentAssets[key];
            if (a && window.DEFENSE_CONFIG.facilities[a.type]) {
                let conf = window.DEFENSE_CONFIG.facilities[a.type];
                window.DEFENSE_STATE.facilities.push({ id: key, type: a.type, name: conf.name, team: 'facility', gridX: a.gridX, gridY: a.gridY, hp: 0, maxHp: conf.maxHp });
                currentAssets[key].hp = 0; // マップ上の大元データも0にする
            }
        });

        if (typeof switchMode === 'function') switchMode('play');
        window.DEFENSE_STATE.mode = 'normal';
        window.endDefenseBattle(false); // 敗北扱いで終了
    };

    // --- 演出テスト実行関数 ---
    window.runDebugCutscene = async function() {
        let atkSkin = document.getElementById('dbg-atk-skin').value || 'robot';
        let defSkin = document.getElementById('dbg-def-skin').value || 'dragon';
        let skillName = document.getElementById('dbg-skill-name').value;
        let doCounter = document.getElementById('dbg-do-counter').checked;
        let doKill = document.getElementById('dbg-do-kill').checked;

        let atk = { name: 'テスト攻撃手', skin: atkSkin, hp: 100, maxHp: 100, team: 'player', atk: 30 };
        let def = { name: 'テスト防衛手', skin: defSkin, hp: doKill ? 40 : 100, maxHp: 100, team: 'enemy', atk: 20, def: 5 };
        
        let skill = window.DEFENSE_SKILL_DB['default'][0];
        for (let k in window.DEFENSE_SKILL_DB) {
            let found = window.DEFENSE_SKILL_DB[k].find(s => s.name === skillName);
            if (found) { skill = found; break; }
        }

        let cSkill = window.DEFENSE_SKILL_DB['dragon'][0] || window.DEFENSE_SKILL_DB['default'][0];

        window.DEFENSE_STATE.animMode = true; // 強制的にアニメON
        await window.showDefenseCutscene(atk, def, 50, skill, doCounter, 10, cSkill);
    };

    // --- 施設HPリスト更新＆変更関数 ---
    window.refreshDebugFacilities = function() {
        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        let listHtml = '';
        Object.keys(currentAssets).forEach(key => {
            let a = currentAssets[key];
            if (a && window.DEFENSE_CONFIG.facilities[a.type]) {
                let conf = window.DEFENSE_CONFIG.facilities[a.type];
                let currentHp = a.hp !== undefined ? a.hp : conf.maxHp;
                listHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#222; padding:5px; margin-bottom:4px; border-radius:4px; font-size:12px; color:#fff;">
                        <span>${conf.name} (${key.substring(0,4)}...)</span>
                        <div>
                            <input type="number" id="fac-hp-${key}" value="${Math.floor(currentHp)}" style="width:50px; background:#111; color:#fff; border:1px solid #555;"> / ${conf.maxHp}
                            <button onclick="window.applyDebugFacilityHp('${key}', ${conf.maxHp})" style="background:#4CAF50; color:#fff; border:none; padding:2px 5px; cursor:pointer;">反映</button>
                        </div>
                    </div>
                `;
            }
        });
        let listDom = document.getElementById('dbg-facility-list');
        if (listDom) listDom.innerHTML = listHtml || '<div style="color:#888;">施設がありません</div>';
    };

    window.applyDebugFacilityHp = function(key, maxHp) {
        let input = document.getElementById(`fac-hp-${key}`);
        if(!input) return;
        let newHp = parseInt(input.value);
        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        
        if (currentAssets[key]) {
            // 1. 大元のセーブデータを更新
            currentAssets[key].hp = Math.max(0, Math.min(maxHp, newHp));
            
            // 2. 現在画面に表示されている「防衛用のHPバー」も同時に更新！
            if (window.DEFENSE_STATE && window.DEFENSE_STATE.facilities) {
                let activeFac = window.DEFENSE_STATE.facilities.find(f => f.id === key);
                if (activeFac) activeFac.hp = currentAssets[key].hp;
            }
            
            alert("HPを更新しました！マップに即座に反映されます。");
        }
    };

    // デバッグメニューを開いた時に一度リストを生成
    setTimeout(window.refreshDebugFacilities, 500);
}, 2000);

// ======================================================================
// 🛡️ 襲撃イベント発生＆進行ブロック 完全防弾パッチ
// ======================================================================

// 1. 現在が「完全に野外で自由行動中」であるかを判定する最強のチェッカー
window.isFreeExploring = function() {
    // モードが play または grazing 以外ならNG (ダンジョンや開発モード等)
    if (typeof window.currentMode !== 'undefined' && window.currentMode !== 'play' && window.currentMode !== 'grazing') return false;
    
    // AIが屋内にいる（カジノやお店などに入っている）ならNG
    if (window.aiPet && window.aiPet.isIndoors) return false;

    // 画面を覆い隠す巨大なUIが開いているならNG
    const blockingUIs = [
        'tcg-battle-ui',
        'tcg-deck-builder',
        'casino-lobby-ui',
        'tcg-market-ui',
        'tcg-shop-ui',
        'arena-reception-ui',
        'arena-battle-ui',
        'arena-friend-select-ui',
        'arena-interval-ui'
    ];
    for (let id of blockingUIs) {
        let el = document.getElementById(id);
        // display が none でも空文字（初期状態）でもない場合＝表示されている
        if (el && el.style.display !== 'none' && el.style.display !== '') return false;
    }

    return true; // すべてクリアなら自由行動中！
};

// 2. 襲撃モニターの完全上書き
window.startDefenseMonitor = function() {
    // 既存のタイマーがあれば消す
    if (window.DEFENSE_STATE && window.DEFENSE_STATE._monitorTimer) {
        clearInterval(window.DEFENSE_STATE._monitorTimer);
    }
    
    let timerId = setInterval(() => {
        if (!window.DEFENSE_STATE) return;
        // デバッグで襲撃OFFならスキップ
        if (window.DEFENSE_STATE.noAttack) return;
        // 既に襲撃中・防衛戦中ならスキップ
        if (window.DEFENSE_STATE.isActive || window.DEFENSE_STATE.isEmergency) return;
        
        // ★追加：自由行動中でなければ襲撃は発生させない！！
        if (!window.isFreeExploring()) return;

        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
        let hasCastle = Object.values(currentAssets).some(a => a && a.type === 'castle');
        if (hasCastle && Math.random() < window.DEFENSE_CONFIG.triggerChance) window.triggerEmergency();
    }, 60000); 
    
    if (window.DEFENSE_STATE) window.DEFENSE_STATE._monitorTimer = timerId;
};

// 3. 襲撃イベント本体の完全上書き
window.triggerEmergency = function() {
    if (window.DEFENSE_STATE.isEmergency) return;
    
    // ★念のための追加：ここでも自由行動中でなければ弾く
    if (!window.isFreeExploring()) return;

    window.DEFENSE_STATE.isEmergency = true;

    if (window.audioManager) {
        window.audioManager.playBGM('defense_start');
    }
    
    let marquee = document.getElementById('emergency-marquee');
    if (!marquee) {
        marquee = document.createElement('div'); marquee.id = 'emergency-marquee';
        marquee.style.cssText = `position:fixed; top:60px; left:0; width:100vw; background:rgba(255,0,0,0.85); color:white; font-size:24px; font-weight:bold; padding:10px 0; z-index:40000; overflow:hidden; white-space:nowrap; border-top:2px solid #FFEB3B; border-bottom:2px solid #FFEB3B; box-shadow:0 0 20px red; pointer-events:none;`;
        let style = document.createElement('style'); style.innerHTML = `@keyframes alert-marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }`;
        document.head.appendChild(style); document.body.appendChild(marquee);
    }
    marquee.innerHTML = `<div style="display:inline-block; padding-left:20px; animation:alert-marquee 12s linear infinite;">🚨 【緊急防衛クエスト】島に魔物が接近中！「王城」へ向かい迎撃せよ！！（放置すると施設が破壊されます） 🚨</div>`;
    marquee.style.display = 'block';

    window.DEFENSE_STATE.facilities = [];
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let castleAsset = Object.values(currentAssets).find(a => a && a.type === 'castle');
    let cx = 10; let cy = 6; 

    Object.values(currentAssets).forEach(a => {
        if (a) {
            if (a === castleAsset) { a.gridX = cx; a.gridY = cy; } 
            else if (castleAsset) {
                let diffPx = a.dx - castleAsset.dx; let diffPy = a.dy - castleAsset.dy;
                let dGy = Math.round(diffPy / 25); let oddOffset = (dGy % 2 !== 0) ? 25 : 0;
                let dGx = Math.round((diffPx - oddOffset) / 50);
                a.gridX = cx + dGx; a.gridY = cy + dGy;
            }
        }
    });

    Object.keys(currentAssets).forEach(key => {
        let a = currentAssets[key];
        let validTypes = Object.keys(window.DEFENSE_CONFIG.facilities);
        if (a && validTypes.includes(a.type)) {
            let conf = window.DEFENSE_CONFIG.facilities[a.type];
            window.DEFENSE_STATE.facilities.push({ id: key, type: a.type, name: conf.name, team: 'facility', gridX: a.gridX, gridY: a.gridY, hp: conf.maxHp, maxHp: conf.maxHp });
        }
    });

    if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
    
    window.DEFENSE_STATE.emergencyTimer = setInterval(() => {
        // ★追加：放置ダメージの進行も、自由行動中でなければストップ（時間停止）させる！
        if (!window.isFreeExploring()) return;

        if (window.DEFENSE_STATE.isEmergency && !window.DEFENSE_STATE.isActive) {
            let targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0 && f.type !== 'castle'); 
            if (!targetFac) targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0);
            
            if (targetFac) {
                targetFac.hp -= 50; 
                let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                if (currentAssets[targetFac.id]) currentAssets[targetFac.id].hp = targetFac.hp;

                if (typeof floatingTexts !== 'undefined') {
                    let pos = window.getGridPixelPos(targetFac.gridX, targetFac.gridY);
                    floatingTexts.push({ text: `-50`, x: pos.x, y: pos.y - 50, color: "#ff5252", life: 60, dy: -1 });
                }
                
                if (targetFac.hp <= 0) {
                    if (targetFac.type === 'castle') {
                        clearInterval(window.DEFENSE_STATE.emergencyTimer);
                        if (window.audioManager) { window.audioManager.stopBGM(); }
                        let marquee = document.getElementById('emergency-marquee');
                        if (marquee) marquee.style.display = 'none'; 
                        window.DEFENSE_STATE.isEmergency = false;
                        alert("防衛を放置したため、王城が陥落してしまいました..."); window.executeAbandon(); 
                    } else {
                        let delAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                        if (delAssets[targetFac.id]) delete delAssets[targetFac.id];
                    }
                }
            }
        }
    }, 30000); 
};