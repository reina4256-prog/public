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

