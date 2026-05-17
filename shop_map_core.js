// ==========================================
// 📄 shop_map_core.js
// 店舗（レストラン等）の屋内物理マップシステム
// ==========================================

// 1. スプライト（マップチップ）の定義
window.SHOP_SPRITES = {
    // [R-MAP] 床と壁
    "rmap_floor": { "img": "restaurant_mapchip.png", "sx": 172, "sy": 158, "sw": 216, "sh": 195, "scale": 1 },
    "rmap_wall": { "img": "restaurant_mapchip.png", "sx": 2395, "sy": 548, "sw": 142, "sh": 194, "scale": 1 },
    "rmap_kitchen_floor": { "img": "restaurant_mapchip.png", "sx": 172, "sy": 515, "sw": 216, "sh": 195, "scale": 1 },

    // [R-FUR] 家具
    "rfur_register_left":   { "img": "restaurant_furniture_mapchip.png", "sx": 153, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    "rfur_register_center": { "img": "restaurant_furniture_mapchip.png", "sx": 480, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    "rfur_register_right":  { "img": "restaurant_furniture_mapchip.png", "sx": 897, "sy": 103, "sw": 378, "sh": 528, "scale": 1 },
    
    "rfur_table_tl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_tc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_tr": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_bl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_bc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    "rfur_table_br": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
    
    "rfur_chair_down":  { "img": "restaurant_furniture_mapchip.png", "sx": 1607, "sy": 127, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_up":    { "img": "restaurant_furniture_mapchip.png", "sx": 1614, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_left":  { "img": "restaurant_furniture_mapchip.png", "sx": 190, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_chair_right": { "img": "restaurant_furniture_mapchip.png", "sx": 869, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
    "rfur_stool":       { "img": "restaurant_furniture_mapchip.png", "sx": 2262, "sy": 888, "sw": 315, "sh": 429, "scale": 0.5 },

    // [R-KIT] 厨房設備 (新ID: 31〜37)
    "rkit_fridge": { "img": "restaurant_kitchen_mapchip.png", "sx": 1910, "sy": 803, "sw": 403, "sh": 661, "scale": 1 }, // 31
    "rkit_oven":   { "img": "restaurant_kitchen_mapchip.png", "sx": 343, "sy": -4, "sw": 720, "sh": 778, "scale": 1 }, // 32
    "rkit_stove_left":  { "img": "restaurant_kitchen_mapchip.png", "sx": 1567, "sy": -47, "sw": 490, "sh": 700, "scale": 1 }, // 33
    "rkit_stove_right": { "img": "restaurant_kitchen_mapchip.png", "sx": 2051, "sy": -47, "sw": 490, "sh": 700, "scale": 1 }, // 34
    "rkit_counter_left":   { "img": "restaurant_kitchen_mapchip.png", "sx": 290, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, // 35
    "rkit_counter_center": { "img": "restaurant_kitchen_mapchip.png", "sx": 510, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, // 36
    "rkit_counter_right":  { "img": "restaurant_kitchen_mapchip.png", "sx": 734, "sy": 779, "sw": 372, "sh": 615, "scale": 1 }, // 37

    // [R-DISH] 料理アイテム
    "rdish_steak":   { "img": "restaurant_dish_mapchip.png", "sx": 12, "sy": -195, "sw": 646, "sh": 843, "scale": 1 },
    "rdish_soup":    { "img": "restaurant_dish_mapchip.png", "sx": 741, "sy": -195, "sw": 646, "sh": 843, "scale": 1 },
    "rdish_cake":    { "img": "restaurant_dish_mapchip.png", "sx": 49, "sy": 615, "sw": 646, "sh": 843, "scale": 1 },
    "rdish_parfait": { "img": "restaurant_dish_mapchip.png", "sx": 731, "sy": 615, "sw": 646, "sh": 843, "scale": 1 }
};

// ==========================================
// 2. マップデータ定義 (超拡張版: 20x13)
// ==========================================
const RESTAURANT_MAP_LV1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
    [1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 31, 2, 32, 2, 33, 34, 2, 1, 0, 11, 12, 13, 0, 0, 0, 0, 0, 0, 1], 
    [1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 2, 35, 36, 37, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 21, 22, 23, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 15, 24, 25, 26, 16, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 14, 14, 14, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 100, 100, 1, 1, 1, 1, 1, 1, 1, 1], 
];

window.SHOP_STATE = {
    mapWidth: 20,
    mapHeight: 13,
    grid: RESTAURANT_MAP_LV1,
    player: { x: 10, y: 11, face: 'up', action: 'idle', shopState: 'idle' }, 
    npcs: [],
    furniture: [],
    dishes: [], 
    money: 0,         
    reputation: 100,  
    isBankrupt: false,
    isOpen: true
};

window.createShopSprite = function(spriteKey, logicalY, logicalTileX = 100, existingDiv = null) {
    const sp = window.SHOP_SPRITES[spriteKey]; 
    if (!sp) return null;
    const div = existingDiv || document.createElement('div');
    const inner = existingDiv ? div.firstChild : document.createElement('div');

    if (!existingDiv) {
        div.style.position = 'absolute'; 
        div.style.display = 'flex'; 
        div.style.justifyContent = 'center'; 
        div.style.alignItems = 'flex-end'; 
        div.style.overflow = 'visible'; 
        inner.style.backgroundRepeat = 'no-repeat'; 
        inner.style.flexShrink = '0';
        div.appendChild(inner);
    }
    div.style.width = `${sp.sw}px`; 
    div.style.height = `${sp.sh}px`;
    div.style.zIndex = logicalY; 
    
    inner.style.width = `${sp.sw}px`; 
    inner.style.height = `${sp.sh}px`;
    inner.style.backgroundImage = `url('${sp.img}')`; 
    inner.style.backgroundPosition = `${-sp.sx}px ${-sp.sy}px`; 
    
    let fitScaleX = logicalTileX / sp.sw;
    let fitScaleY = spriteKey.startsWith('rmap_') ? (logicalTileX / sp.sh) : fitScaleX; 
    
    inner.style.transform = `scale(${sp.scale * fitScaleX}, ${sp.scale * fitScaleY})`;
    inner.style.transformOrigin = 'bottom center'; 
    return div;
};

window.getUnlockedSkins = function() {
    let unlocked = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'bird', 'beetle']; 
    if (window.aiPet && window.aiPet.discoveredMonsters && window.aiPet.discoveredMonsters.length > 0) {
        unlocked = window.aiPet.discoveredMonsters.filter(sp => typeof sp === 'string' && !sp.includes('dummy') && !sp.includes('insurance'));
    }
    return unlocked.length > 0 ? unlocked : ['robot'];
};

window.openShopMapUI = function() {
    let ui = document.getElementById('shop-map-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'shop-map-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 50000; display: flex; flex-direction: column;`;
        
        ui.innerHTML = `
            <div style="padding: 10px 20px; background: #222; color: #FF9800; border-bottom: 2px solid #555; display: flex; justify-content: space-between; align-items: center; z-index: 50001;">
                <h2 style="margin: 0; font-size: 24px;">🍳 レストラン (フェーズ2：行列システム稼働中)</h2>
                <div style="display:flex; gap:20px; align-items: center;">
                    <div style="font-size: 18px; color: #fff; background: #444; padding: 5px 15px; border-radius: 20px;">
                        評判: <span id="shop-rep-ui" style="color: #4CAF50; font-weight: bold;">100%</span> | 
                        所持金: <span id="shop-money-ui" style="color: #FFD700; font-weight: bold;">0 G</span>
                    </div>
                    <button onclick="window.closeShopMapUI();" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">お店を出る</button>
                </div>
            </div>
            <div id="shop-map-container" style="flex: 1; overflow: hidden; position: relative; background: #111;">
                <div id="shop-grid" style="position: absolute; top: 0; left: 0; transform-origin: 0 0;"></div>
                <div id="shop-bankrupt-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,0,0,0.4); justify-content: center; align-items: center; z-index: 60000; flex-direction: column;">
                    <h1 style="color: white; font-size: 80px; text-shadow: 2px 2px 10px black; margin: 0;">経営破綻</h1>
                    <p style="color: white; font-size: 24px; background: #222; padding: 10px; border-radius: 10px; margin-top: 20px;">お客さんが怒りすぎて評判が0になりました…。</p>
                </div>
            </div>
        `;
        document.body.appendChild(ui);
    }
    ui.style.display = 'flex';
    window.startShopMapLoop();
};

window.closeShopMapUI = function() {
    let ui = document.getElementById('shop-map-ui');
    if (ui) ui.style.display = 'none';
    if (window.shopMapInterval) clearInterval(window.shopMapInterval);
};

window.updateShopUI = function() {
    const s = window.SHOP_STATE;
    const repEl = document.getElementById('shop-rep-ui');
    const moneyEl = document.getElementById('shop-money-ui');
    if (repEl) {
        repEl.innerText = `${s.reputation}%`;
        repEl.style.color = s.reputation < 30 ? '#f44336' : (s.reputation < 70 ? '#FFEB3B' : '#4CAF50');
    }
    if (moneyEl) moneyEl.innerText = `${s.money} G`;

    if (s.isBankrupt) {
        document.getElementById('shop-bankrupt-overlay').style.display = 'flex';
    }
};

window.renderShopMap = function() {
    const s = window.SHOP_STATE;
    const container = document.getElementById('shop-map-container');
    const gridDiv = document.getElementById('shop-grid');
    if (!gridDiv || !container) return;

    window.updateShopUI(); 

    const logicalTileX = 250;
    const logicalTileY = 250;

    gridDiv.style.width = `${s.mapWidth * logicalTileX}px`; 
    gridDiv.style.height = `${s.mapHeight * logicalTileY}px`; 

    const cw = container.clientWidth; 
    const ch = container.clientHeight;
    const camZoom = 0.4; 

    const playerPixelX = s.player.x * logicalTileX + (logicalTileX / 2); 
    const playerPixelY = s.player.y * logicalTileY + (logicalTileY / 2);
    const camX = (cw / 2) - playerPixelX * camZoom; 
    const camY = (ch / 2) - playerPixelY * camZoom;
    
    gridDiv.style.transition = 'transform 0.3s linear';
    gridDiv.style.transform = `translate(${camX}px, ${camY}px) scale(${camZoom})`;

    let currentActiveIds = new Set();

    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            let tileType = s.grid[y][x];
            let key = "rmap_floor";
            let overlayKey = null; 
            
            if (tileType === 1) key = "rmap_wall";
            if (tileType === 2 || (tileType >= 31 && tileType <= 37)) key = "rmap_kitchen_floor";
            if (tileType === 100) key = "rmap_floor";

            if (tileType === 10) { overlayKey = "rfur_chair_down"; }
            if (tileType === 11) { overlayKey = "rfur_register_left"; }
            if (tileType === 12) { overlayKey = "rfur_register_center"; }
            if (tileType === 13) { overlayKey = "rfur_register_right"; }
            if (tileType === 14) { overlayKey = "rfur_chair_up"; }
            if (tileType === 15) { overlayKey = "rfur_chair_left"; }
            if (tileType === 16) { overlayKey = "rfur_chair_right"; }
            if (tileType === 21) { overlayKey = "rfur_table_tl"; }
            if (tileType === 22) { overlayKey = "rfur_table_tc"; }
            if (tileType === 23) { overlayKey = "rfur_table_tr"; }
            if (tileType === 24) { overlayKey = "rfur_table_bl"; }
            if (tileType === 25) { overlayKey = "rfur_table_bc"; }
            if (tileType === 26) { overlayKey = "rfur_table_br"; }
            if (tileType === 31) { overlayKey = "rkit_fridge"; }
            if (tileType === 32) { overlayKey = "rkit_oven"; }
            if (tileType === 33) { overlayKey = "rkit_stove_left"; }
            if (tileType === 34) { overlayKey = "rkit_stove_right"; }
            if (tileType === 35) { overlayKey = "rkit_counter_left"; }
            if (tileType === 36) { overlayKey = "rkit_counter_center"; }
            if (tileType === 37) { overlayKey = "rkit_counter_right"; }

            let domId = `shop_tile_${x}_${y}`;
            currentActiveIds.add(domId);
            let existingDiv = document.getElementById(domId);
            
            let isFloor = (key === "rmap_floor" || key === "rmap_kitchen_floor");
            let tileZ = isFloor ? 0 : (y * 10);
            
            const tile = window.createShopSprite(key, tileZ, logicalTileX, existingDiv);
            
            if (tile && !existingDiv) {
                tile.id = domId;
                const sp = window.SHOP_SPRITES[key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? (logicalTileY - sp.sh) : 0;
                tile.style.left = `${x * logicalTileX + offsetX}px`; 
                tile.style.top = `${y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(tile); 
            }

            if (overlayKey) {
                let domIdFur = `shop_fur_${x}_${y}`;
                currentActiveIds.add(domIdFur);
                let furDiv = document.getElementById(domIdFur);
                const furTile = window.createShopSprite(overlayKey, y * 10 + 3, logicalTileX, furDiv); 
                
                if (furTile && !furDiv) {
                    furTile.id = domIdFur;
                    const fsp = window.SHOP_SPRITES[overlayKey];
                    const fox = fsp ? (logicalTileX - fsp.sw) / 2 : 0; 
                    const foy = fsp ? (logicalTileY - fsp.sh) : 0;
                    furTile.style.left = `${x * logicalTileX + fox}px`; 
                    furTile.style.top = `${y * logicalTileY + foy}px`; 
                    gridDiv.appendChild(furTile); 
                }
            }
        }
    }

    if (s.dishes) {
        s.dishes.forEach(dish => {
            let domIdDish = `shop_dish_${dish.npcId}`;
            currentActiveIds.add(domIdDish);
            let dishDiv = document.getElementById(domIdDish);
            
            const dishTile = window.createShopSprite(dish.key, dish.y * 10 + 4, logicalTileX, dishDiv); 
            
            if (dishTile && !dishDiv) {
                dishTile.id = domIdDish;
                const fsp = window.SHOP_SPRITES[dish.key];
                const fox = fsp ? (logicalTileX - fsp.sw) / 2 : 0; 
                const foy = fsp ? (logicalTileY - fsp.sh) : 0;
                dishTile.style.left = `${dish.x * logicalTileX + fox}px`; 
                dishTile.style.top = `${dish.y * logicalTileY + foy - 40}px`; 
                gridDiv.appendChild(dishTile); 
            }
        });
    }

    const drawCharacter = (chara, domPrefix) => {
        let baseSkin = chara.skin || chara.type || 'robot';
        let face = chara.face || 'down';
        let pKey = `${baseSkin}_${face}`;
        if (!window.DUNGEON_SPRITES[pKey]) pKey = `robot_${face}`;

        let domId = `${domPrefix}_${chara.id || 'main'}`;
        currentActiveIds.add(domId);
        let existingEl = document.getElementById(domId);

        let targetZ = chara.y * 10 + 5; 
        let currentZ = existingEl ? parseInt(existingEl.style.zIndex || targetZ) : targetZ;

        const pDiv = window.createDungeonSprite(pKey, targetZ, 1.0, false, logicalTileX, existingEl);
        if (pDiv) {
            pDiv.style.position = 'absolute';

            if (existingEl) {
                if (targetZ < currentZ) {
                    pDiv.style.zIndex = targetZ; 
                    clearTimeout(pDiv._zTimeout);
                } else if (targetZ > currentZ) {
                    pDiv.style.zIndex = currentZ;
                    clearTimeout(pDiv._zTimeout);
                    pDiv._zTimeout = setTimeout(() => { pDiv.style.zIndex = targetZ; }, 250);
                } else {
                    pDiv.style.zIndex = targetZ;
                }
            } else {
                pDiv.style.zIndex = targetZ;
            }

            const pSp = window.DUNGEON_SPRITES[pKey];
            const offsetX = pSp ? (logicalTileX - pSp.sw) / 2 : 0; 
            const offsetY = pSp ? (logicalTileY - pSp.sh) / 2 : 0;

            if (!existingEl) {
                pDiv.id = domId;
                pDiv.style.left = `${chara.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${chara.y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(pDiv);
            } else {
                pDiv.style.transition = 'left 0.3s linear, top 0.3s linear';
                pDiv.style.left = `${chara.x * logicalTileX + offsetX}px`; 
                pDiv.style.top = `${chara.y * logicalTileY + offsetY}px`; 
            }

            let bubbleId = domId + '_bubble';
            let bubble = document.getElementById(bubbleId);
            const charaImgInner = pDiv.querySelector('div') || pDiv.firstChild; 
            
            let showBubble = false;
            let bubbleContent = '';

            if (chara.state === 'ordering' || chara.state === 'waiting_for_food') {
                showBubble = true;
                let dishKey = chara.order || 'rdish_steak';
                let fsp = window.SHOP_SPRITES[dishKey];
                
                if (fsp) {
                    let scaleVal = 100 / Math.max(fsp.sw, fsp.sh);
                    
                    bubbleContent = `
                        <div style="
                            position: absolute;
                            width: ${fsp.sw}px; 
                            height: ${fsp.sh}px; 
                            background-image: url('${fsp.img}'); 
                            background-position: ${-fsp.sx}px ${-fsp.sy}px; 
                            background-repeat: no-repeat;
                            transform: scale(${scaleVal});
                            left: 50%;
                            top: 50%;
                            margin-left: ${-fsp.sw/2}px;
                            margin-top: ${-fsp.sh/2}px;
                        "></div>
                    `;
                }
            } else if (chara.state === 'paying') {
                showBubble = true;
                bubbleContent = `<div style="font-size: 70px; line-height: 100px; text-align: center;">💰</div>`;
            } else if (chara.state === 'angry_leaving') {
                showBubble = true;
                bubbleContent = `<div style="font-size: 70px; line-height: 100px; text-align: center;">💢</div>`;
            }

            if (showBubble) {
                if (!bubble) {
                    bubble = document.createElement('div');
                    bubble.id = bubbleId;
                    bubble.style.position = 'absolute';
                    
                    bubble.style.bottom = 'calc(100% + 3px)'; 
                    bubble.style.left = '50%';
                    
                    bubble.style.background = 'white';
                    bubble.style.borderRadius = '15px'; 
                    bubble.style.border = '4px solid #555'; 
                    bubble.style.zIndex = '999';
                    
                    bubble.style.width = '100px';
                    bubble.style.height = '100px';
                    bubble.style.overflow = 'hidden';

                    if (charaImgInner) {
                        if (charaImgInner.style.position !== 'absolute' && charaImgInner.style.position !== 'fixed' && charaImgInner.style.position !== 'sticky') {
                            charaImgInner.style.position = 'relative';
                        }
                        charaImgInner.appendChild(bubble);
                    }
                }

                let invScale = 1;
                if (charaImgInner && charaImgInner.style.transform) {
                    let match = charaImgInner.style.transform.match(/scale\(([^,)]+)/);
                    if (match && parseFloat(match[1])) {
                        invScale = 1 / parseFloat(match[1]);
                    }
                }
                
                bubble.style.transform = `translateX(-50%) scale(${invScale})`;
                bubble.style.transformOrigin = 'bottom center';

                bubble.innerHTML = bubbleContent;
            } else {
                if (bubble) bubble.remove();
            }
        }
    };

    if (typeof window.createDungeonSprite === 'function' && typeof window.DUNGEON_SPRITES !== 'undefined') {
        let mySkin = window.aiPet ? (window.aiPet.currentSkin || window.aiPet.type || 'robot') : 'robot';
        drawCharacter({ ...s.player, skin: mySkin, id: 'main' }, 'shop_player');
    }

    if (s.npcs && s.npcs.length > 0) {
        s.npcs.forEach(npc => {
            drawCharacter(npc, 'shop_npc');
        });
    }

    Array.from(gridDiv.children).forEach(child => {
        if (child.id && !currentActiveIds.has(child.id)) {
            gridDiv.removeChild(child);
        }
    });
};

// ==========================================
// 7. AIの自律移動ループと経路探索ロジック
// ==========================================
window.startShopMapLoop = function() {
    if (window.shopMapInterval) clearInterval(window.shopMapInterval);
    
    window.shopMapInterval = setInterval(() => {
        const s = window.SHOP_STATE;
        
        if (s.isBankrupt) {
            window.renderShopMap();
            return;
        }

        const p = s.player;

        // ==========================================
        // ★大追加：レジ待ち行列（ダイナミック・キュー）の計算
        // レジに用がある人たちを集めて、並んだ時間順にソート。
        // 順番に応じて目標の並び位置(y=3, 4, 5...)を割り当てる。
        // ==========================================
        let queueNpcs = s.npcs.filter(n => {
            if (n.isTakeout && ['moving_to_takeout', 'ordering', 'waiting_for_food', 'paying'].includes(n.state)) return true;
            if (!n.isTakeout && ['moving_to_register', 'paying'].includes(n.state)) return true;
            return false;
        }).sort((a, b) => a.queueJoinedAt - b.queueJoinedAt);

        // 順番に従って目標座標を更新
        queueNpcs.forEach((qn, idx) => {
            qn.targetPos = { x: 11, y: 3 + idx };
        });

        // --- プレイヤー（AI店員）の営業思考ロジック ---
        if (p.shopState === 'idle') {
            let payingNpc = s.npcs.find(n => n.state === 'paying');
            if (payingNpc) {
                p.targetNpcId = payingNpc.id;
                p.targetPos = { x: 11, y: 1 }; 
                p.shopState = 'going_to_register';
            } else {
                let orderNpc = s.npcs.find(n => n.state === 'ordering');
                if (orderNpc) {
                    orderNpc.state = 'waiting_for_food';
                    p.targetNpcId = orderNpc.id;
                    p.targetPos = { x: 1, y: 3 }; 
                    p.shopState = 'going_to_fridge';
                }
            }
        } else if (p.shopState === 'going_to_fridge' && !p.targetPos) {
            p.shopState = 'getting_ingredients';
            p.timer = 5; 
            p.face = 'up'; 
        } else if (p.shopState === 'getting_ingredients') {
            p.timer--;
            if (p.timer <= 0) {
                p.targetPos = { x: 5, y: 3 }; 
                p.shopState = 'going_to_cook';
            }
        } else if (p.shopState === 'going_to_cook' && !p.targetPos) {
            p.shopState = 'cooking';
            p.timer = 10; 
            p.face = 'up'; 
        } else if (p.shopState === 'cooking') {
            p.timer--;
            if (p.timer <= 0) {
                p.shopState = 'delivering';
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) {
                    p.targetPos = { x: npc.x, y: npc.y }; 
                } else {
                    p.shopState = 'idle';
                }
            }
        } else if (p.shopState === 'going_to_register' && !p.targetPos) {
            p.shopState = 'checkout';
            p.timer = 5; 
            p.face = 'down'; 
        } else if (p.shopState === 'checkout') {
            p.timer--;
            if (p.timer <= 0) {
                p.shopState = 'idle';
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) {
                    npc.state = 'leaving';
                    npc.targetPos = { x: 10, y: 12 }; 
                    s.money += 1000; 
                    if (s.reputation < 100) s.reputation += 2; 
                }
                p.targetNpcId = null;
            }
        }

        // --- プレイヤーの移動処理 ---
        if (p.targetPos) {
            let distToTarget = Math.abs(p.x - p.targetPos.x) + Math.abs(p.y - p.targetPos.y);
            
            if (p.shopState === 'delivering' && distToTarget <= 2) {
                p.targetPos = null;
                p.shopState = 'idle'; 
                
                let npc = s.npcs.find(n => n.id === p.targetNpcId);
                if (npc) {
                    if (npc.isTakeout) {
                        npc.state = 'paying';
                        npc.timer = 0;
                        npc.patience += 100; 
                    } else {
                        npc.state = 'eating';
                        npc.timer = 0;
                        npc.patience += 100;
                        
                        let seatType = s.grid[npc.y][npc.x];
                        let tableX = npc.x, tableY = npc.y;
                        if (seatType === 10) tableY += 1;
                        else if (seatType === 14) tableY -= 1;
                        else if (seatType === 15) tableX += 1;
                        else if (seatType === 16) tableX -= 1;

                        s.dishes.push({ x: tableX, y: tableY, key: npc.order, npcId: npc.id });
                    }
                }
                p.targetNpcId = null;
                
            } else if (p.x === p.targetPos.x && p.y === p.targetPos.y) {
                p.targetPos = null; 
                p.action = 'idle';
            } else {
                let nextStep = window.getShopNextStep(p.x, p.y, p.targetPos.x, p.targetPos.y);
                if (nextStep) {
                    if (nextStep.x > p.x) p.face = 'right';
                    else if (nextStep.x < p.x) p.face = 'left';
                    else if (nextStep.y > p.y) p.face = 'down';
                    else if (nextStep.y < p.y) p.face = 'up';
                    p.x = nextStep.x;
                    p.y = nextStep.y;
                    p.action = 'walk';
                } else {
                    p.targetPos = null; 
                    p.action = 'idle';
                }
            }
        }

        if (s.isOpen && s.npcs.length < 4 && Math.random() < 0.05) {
            let skins = window.getUnlockedSkins();
            let skin = skins[Math.floor(Math.random() * skins.length)];
            let orderDishes = ['rdish_steak', 'rdish_soup', 'rdish_cake', 'rdish_parfait'];
            let order = orderDishes[Math.floor(Math.random() * orderDishes.length)];
            
            let isTakeout = Math.random() < 0.3; 
            let targetPos = null;
            let state = '';

            if (isTakeout) {
                // 目標座標は行列ロジックで上書きされるが、初期値として設定
                targetPos = { x: 11, y: 3 };
                state = 'moving_to_takeout';
            } else {
                let emptySeats = [];
                for(let y = 0; y < s.mapHeight; y++) {
                    for(let x = 0; x < s.mapWidth; x++) {
                        if([10, 14, 15, 16].includes(s.grid[y][x])) {
                            let isOccupied = s.npcs.some(n => n.targetPos && n.targetPos.x === x && n.targetPos.y === y);
                            if (!isOccupied) emptySeats.push({x, y});
                        }
                    }
                }
                if (emptySeats.length > 0) {
                    targetPos = emptySeats[Math.floor(Math.random() * emptySeats.length)];
                    state = 'moving_to_seat';
                }
            }

            if (targetPos) {
                s.npcs.push({
                    id: 'npc_' + Date.now(),
                    skin: skin,
                    x: 10, y: 12, 
                    targetPos: targetPos, 
                    face: 'up', action: 'walk', 
                    state: state, 
                    timer: 0,
                    isTakeout: isTakeout,
                    order: order,
                    patience: 150,
                    queueJoinedAt: state === 'moving_to_takeout' ? Date.now() : 0 // ★追加：行列に並んだ時間
                });
            }
        }

        for (let i = s.npcs.length - 1; i >= 0; i--) {
            let npc = s.npcs[i];
            
            if (['seated', 'ordering', 'waiting_for_food', 'eating', 'moving_to_register', 'paying'].includes(npc.state)) {
                npc.patience--;
                if (npc.patience <= 0) {
                    npc.state = 'angry_leaving'; 
                    npc.targetPos = { x: 10, y: 12 };
                    s.dishes = s.dishes.filter(d => d.npcId !== npc.id); 
                    if (p.targetNpcId === npc.id) {
                        p.shopState = 'idle'; 
                        p.targetNpcId = null;
                        p.targetPos = null;
                    }
                }
            }

            if (npc.state === 'moving_to_seat' && npc.targetPos) {
                if (npc.x === npc.targetPos.x && npc.y === npc.targetPos.y) {
                    npc.state = 'seated';
                    npc.action = 'idle';
                    npc.timer = 0; 
                    
                    let seatType = s.grid[npc.y][npc.x];
                    if (seatType === 10) npc.face = 'down';     
                    else if (seatType === 14) npc.face = 'up';  
                    else if (seatType === 15) npc.face = 'right';
                    else if (seatType === 16) npc.face = 'left';
                    else npc.face = 'down';
                } else {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y);
                    if (nextStep) {
                        if (nextStep.x > npc.x) npc.face = 'right';
                        else if (nextStep.x < npc.x) npc.face = 'left';
                        else if (nextStep.y > npc.y) npc.face = 'down';
                        else if (nextStep.y < npc.y) npc.face = 'up';
                        npc.x = nextStep.x;
                        npc.y = nextStep.y;
                    }
                }
            } else if (npc.state === 'moving_to_takeout') {
                // ★修正：列の先頭(11,3)に着いた時のみ注文ステータスへ
                if (npc.x === 11 && npc.y === 3) {
                    npc.state = 'ordering'; 
                    npc.action = 'idle';
                    npc.face = 'up'; 
                } else if (npc.targetPos && (npc.x !== npc.targetPos.x || npc.y !== npc.targetPos.y)) {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y);
                    if (nextStep) {
                        if (nextStep.x > npc.x) npc.face = 'right';
                        else if (nextStep.x < npc.x) npc.face = 'left';
                        else if (nextStep.y > npc.y) npc.face = 'down';
                        else if (nextStep.y < npc.y) npc.face = 'up';
                        npc.x = nextStep.x;
                        npc.y = nextStep.y;
                    }
                } else {
                    // 自分の並ぶ位置に着いたが先頭ではない時は待機
                    npc.action = 'idle';
                    npc.face = 'up';
                }
            } else if (npc.state === 'seated') {
                npc.timer++;
                if (npc.timer > 10) {
                    npc.state = 'ordering';
                }
            } else if (npc.state === 'eating') {
                npc.timer++;
                if (npc.timer > 15) {
                    npc.state = 'moving_to_register';
                    npc.queueJoinedAt = Date.now(); // ★追加：行列に並んだ時間
                    s.dishes = s.dishes.filter(d => d.npcId !== npc.id);
                }
            } else if (npc.state === 'moving_to_register') {
                // ★修正：列の先頭(11,3)に着いた時のみ支払いステータスへ
                if (npc.x === 11 && npc.y === 3) {
                    npc.state = 'paying';
                    npc.action = 'idle';
                    npc.face = 'up'; 
                } else if (npc.targetPos && (npc.x !== npc.targetPos.x || npc.y !== npc.targetPos.y)) {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y);
                    if (nextStep) {
                        if (nextStep.x > npc.x) npc.face = 'right';
                        else if (nextStep.x < npc.x) npc.face = 'left';
                        else if (nextStep.y > npc.y) npc.face = 'down';
                        else if (nextStep.y < npc.y) npc.face = 'up';
                        npc.x = nextStep.x;
                        npc.y = nextStep.y;
                    }
                } else {
                    npc.action = 'idle';
                    npc.face = 'up';
                }
            } else if ((npc.state === 'leaving' || npc.state === 'angry_leaving') && npc.targetPos) {
                if (npc.x === npc.targetPos.x && npc.y === npc.targetPos.y) {
                    if (npc.state === 'angry_leaving') {
                        s.reputation -= 10; 
                        if (s.reputation <= 0) {
                            s.reputation = 0;
                            s.isBankrupt = true; 
                        }
                    }
                    s.npcs.splice(i, 1);
                } else {
                    let nextStep = window.getShopNextStep(npc.x, npc.y, npc.targetPos.x, npc.targetPos.y);
                    if (nextStep) {
                        if (nextStep.x > npc.x) npc.face = 'right';
                        else if (nextStep.x < npc.x) npc.face = 'left';
                        else if (nextStep.y > npc.y) npc.face = 'down';
                        else if (nextStep.y < npc.y) npc.face = 'up';
                        npc.x = nextStep.x;
                        npc.y = nextStep.y;
                    }
                }
            }
        }
        
        window.renderShopMap();
    }, 300); 
};

window.getShopNextStep = function(startX, startY, targetX, targetY) {
    const s = window.SHOP_STATE;
    let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
    distMap[startY][startX] = 0;
    
    let queue = [{x: startX, y: startY, cost: 0, firstStep: null}];
    let dirs = [{dx: 0, dy: -1}, {dx: 0, dy: 1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}];
    
    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost); 
        let cur = queue.shift();
        
        if (cur.x === targetX && cur.y === targetY) return cur.firstStep;
        if (cur.cost > 2000) continue; 
        
        for (let d of dirs) {
            let nx = cur.x + d.dx;
            let ny = cur.y + d.dy;
            
            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                let tile = s.grid[ny][nx];
                if (tile === 1) continue; 
                if ([11, 12, 13, 21, 22, 23, 24, 25, 26, 31, 32, 33, 34, 35, 36, 37].includes(tile)) continue;
                if ([10, 14, 15, 16].includes(tile)) {
                    if (nx !== targetX || ny !== targetY) continue;
                }

                let nextCost = cur.cost + 1;
                if (nextCost < distMap[ny][nx]) {
                    distMap[ny][nx] = nextCost;
                    let fStep = cur.firstStep || {x: nx, y: ny};
                    queue.push({x: nx, y: ny, cost: nextCost, firstStep: fStep});
                }
            }
        }
    }
    return null; 
};