(function() {
    const TILE_W = 250;
    const TILE_H = 250;
    const MYHOME_MAP_LV1 = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 100, 100, 100, 1, 1, 1, 1, 1]
    ];
    const MAP_W = MYHOME_MAP_LV1[0].length;
    const MAP_H = MYHOME_MAP_LV1.length;
    const ENTRANCE_POS = { x: 5, y: 8, dir: 'up' };
    const VISITOR_ENTRY_POS = { x: 5, y: 9, dir: 'up' };
    const VISITOR_SEAT_POS = { x: 6, y: 5, dir: 'left' };
    const VISITOR_STEP_MS = 220;
    const VISITOR_MEAL_MS = 2600;

    window.MYHOME_SPRITES = window.MYHOME_SPRITES || {
        hmap_floor: { img: "restaurant_mapchip.png", sx: 172, sy: 158, sw: 216, sh: 195, scale: 1, sourceW: 2816, sourceH: 1536 },
        hmap_wall: { img: "restaurant_mapchip.png", sx: 2395, sy: 548, sw: 142, sh: 194, scale: 1, sourceW: 2816, sourceH: 1536 },
        "hfur_warehouse": {
            "img": "myhome_mapchip.png",
            "sx": 54,
            "sy": 45,
            "sw": 879,
            "sh": 662,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_safe": {
            "img": "myhome_mapchip.png",
            "sx": 1153,
            "sy": 70,
            "sw": 521,
            "sh": 655,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_freezer": {
            "img": "myhome_mapchip.png",
            "sx": 72,
            "sy": 689,
            "sw": 830,
            "sh": 520,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_dresser": {
            "img": "myhome_mapchip.png",
            "sx": 31,
            "sy": 1197,
            "sw": 957,
            "sh": 1156,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_bed": {
            "img": "myhome_mapchip.png",
            "sx": 1180,
            "sy": 1567,
            "sw": 532,
            "sh": 754,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_strategy_board": {
            "img": "myhome_mapchip.png",
            "sx": 1001,
            "sy": 825,
            "sw": 801,
            "sh": 680,
            "scale": 1,
            "x": 0,
            "y": 0,
            "sourceW": 1824,
            "sourceH": 2330
        },
        "hfur_table_tl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_table_tc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_table_tr": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 103, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_table_bl": { "img": "restaurant_furniture_mapchip.png", "sx": 2051, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_table_bc": { "img": "restaurant_furniture_mapchip.png", "sx": 2198, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_table_br": { "img": "restaurant_furniture_mapchip.png", "sx": 2295, "sy": 355, "sw": 384, "sh": 407, "scale": 1 },
        "hfur_chair_down":  { "img": "restaurant_furniture_mapchip.png", "sx": 1607, "sy": 127, "sw": 315, "sh": 510, "scale": 0.5 },
        "hfur_chair_up":    { "img": "restaurant_furniture_mapchip.png", "sx": 1614, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
        "hfur_chair_left":  { "img": "restaurant_furniture_mapchip.png", "sx": 190, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
        "hfur_chair_right": { "img": "restaurant_furniture_mapchip.png", "sx": 869, "sy": 888, "sw": 315, "sh": 510, "scale": 0.5 },
        "hfur_plant":  { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 1740, "sy": 807, "sw": 522, "sh": 647, "scale": 0.8 },
        "hfur_candle": { "img": "restaurant_luxury_furniture_mapchip.png", "sx": 2274, "sy": 807, "sw": 522, "sh": 647, "scale": 0.8 }
    };

    window.selectedMyHomeSpriteKey = window.selectedMyHomeSpriteKey || 'hfur_warehouse';
    let myHomeWordFilter = 'home';

    function getImagePath(imgName) {
        if (!imgName) return '';
        return imgName;
    }

    function resolveImageUrl(imgName) {
        if (!imgName) return '';
        if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgName]) return window.dynamicImageCatalog[imgName];
        if (typeof imageSources !== 'undefined' && imageSources[imgName]) return imageSources[imgName];
        return imgName.includes('.') ? imgName : `${imgName}.png`;
    }

    function getDefaultMyHomeObjects() {
        return [
            { id: 'warehouse', key: 'hfur_warehouse', x: 2, y: 2, name: '倉庫' },
            { id: 'freezer', key: 'hfur_freezer', x: 4, y: 2, name: '冷凍庫' },
            { id: 'safe', key: 'hfur_safe', x: 8, y: 2, name: '金庫' },
            { id: 'dresser', key: 'hfur_dresser', x: 9, y: 3, name: 'ドレッサー' },
            { id: 'strategy_board', key: 'hfur_strategy_board', x: 4, y: 4, name: '作戦会議用ホワイトボード' },
            { id: 'meeting_chair_l1', key: 'hfur_chair_left', x: 2, y: 5, name: '会議椅子' },
            { id: 'meeting_table_tl', key: 'hfur_table_tl', x: 3, y: 5, name: '会議テーブル' },
            { id: 'meeting_table_tc', key: 'hfur_table_tc', x: 4, y: 5, name: '会議テーブル' },
            { id: 'meeting_table_tr', key: 'hfur_table_tr', x: 5, y: 5, name: '会議テーブル' },
            { id: 'meeting_chair_r1', key: 'hfur_chair_right', x: 6, y: 5, name: '会議椅子' },
            { id: 'meeting_chair_l2', key: 'hfur_chair_left', x: 2, y: 6, name: '会議椅子' },
            { id: 'meeting_table_bl', key: 'hfur_table_bl', x: 3, y: 6, name: '会議テーブル' },
            { id: 'meeting_table_bc', key: 'hfur_table_bc', x: 4, y: 6, name: '会議テーブル' },
            { id: 'meeting_table_br', key: 'hfur_table_br', x: 5, y: 6, name: '会議テーブル' },
            { id: 'meeting_chair_r2', key: 'hfur_chair_right', x: 6, y: 6, name: '会議椅子' }
        ];
    }

    function createSpriteDiv(spriteKey, className, logicalX, logicalY, z, existingDiv) {
        const sp = window.MYHOME_SPRITES[spriteKey];
        if (!sp) return null;
        const div = existingDiv || document.createElement('div');
        const inner = existingDiv ? div.firstChild : document.createElement('div');
        div.className = className;
        div.dataset.spriteKey = spriteKey;
        const logicalTileX = TILE_W;
        let fitScaleX = logicalTileX / (sp.sw || 64);
        let fitScaleY = spriteKey.startsWith('hmap_') ? (logicalTileX / (sp.sh || 64)) : fitScaleX;
        const offsetX = (TILE_W - (sp.sw || 64)) / 2;
        const offsetY = TILE_H - (sp.sh || 64);
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
        div.style.cssText = `
            position:absolute;
            display:flex;
            justify-content:center;
            align-items:flex-end;
            overflow:visible;
            left:${logicalX * TILE_W + offsetX + (sp.x || 0)}px;
            top:${logicalY * TILE_H + offsetY + (sp.y || 0)}px;
            width:${sp.sw || 64}px;
            height:${sp.sh || 64}px;
            z-index:${z};
            pointer-events:none;
        `;
        inner.style.width = `${sp.sw || 64}px`;
        inner.style.height = `${sp.sh || 64}px`;
        inner.style.backgroundImage = `url('${getImagePath(sp.img)}')`;
        inner.style.backgroundPosition = `${-(sp.sx || 0)}px ${-(sp.sy || 0)}px`;
        inner.style.backgroundRepeat = 'no-repeat';
        inner.style.transform = `${sp.flip ? 'scaleX(-1) ' : ''}scale(${(sp.scale || 1) * fitScaleX}, ${(sp.scale || 1) * fitScaleY}) rotate(${sp.rotation || 0}deg)`;
        inner.style.transformOrigin = 'bottom center';
        inner.style.imageRendering = 'auto';
        return div;
    }

    function createDungeonCharacterDiv(spriteKey, x, y, z, existingDiv) {
        const sp = window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[spriteKey];
        if (!sp) return null;
        if (typeof window.createDungeonSprite === 'function') {
            const div = window.createDungeonSprite(spriteKey, z, 1.0, false, TILE_W, existingDiv);
            if (!div) return null;
            const w = Math.max(1, sp.sw || 64);
            const h = Math.max(1, sp.sh || 64);
            div.className = 'myhome-character';
            div.dataset.spriteKey = spriteKey;
            div.style.position = 'absolute';
            div.style.left = `${x * TILE_W + (TILE_W - w) / 2 + (sp.x || 0)}px`;
            div.style.top = `${y * TILE_H + (TILE_H - h) / 2 + (sp.y || 0)}px`;
            div.style.zIndex = z;
            div.style.pointerEvents = 'none';
            return div;
        }
        const sourceW = sp.sourceW || (sp.img === 'concierge_dungeon_walk.png' ? 2760 : sp.sw || 64);
        const sourceH = sp.sourceH || (sp.img === 'concierge_dungeon_walk.png' ? 1504 : sp.sh || 64);
        const div = existingDiv || document.createElement('div');
        const scale = sp.scale || 1;
        const w = Math.max(1, (sp.sw || 64) * scale);
        const h = Math.max(1, (sp.sh || 64) * scale);
        const px = x * TILE_W + TILE_W / 2;
        const py = y * TILE_H + TILE_H;
        div.className = 'myhome-character';
        div.dataset.spriteKey = spriteKey;
        const srcName = sp.img || sp.image || '';
        const imgObj = typeof images !== 'undefined' ? images[srcName] : null;
        const bgSize = imgObj && imgObj.complete && imgObj.naturalWidth ? `${imgObj.naturalWidth * scale}px ${imgObj.naturalHeight * scale}px` : `${sourceW * scale}px ${sourceH * scale}px`;
        div.style.cssText = `
            position:absolute;
            left:${px - w / 2 + (sp.x || 0)}px;
            top:${py - h + (sp.y || 0)}px;
            width:${w}px;
            height:${h}px;
            background-image:url('${resolveImageUrl(srcName)}');
            background-position:-${(sp.sx || 0) * scale}px -${(sp.sy || 0) * scale}px;
            background-repeat:no-repeat;
            background-size:${bgSize};
            transform:${sp.flip ? 'scaleX(-1)' : 'none'} rotate(${sp.rotation || 0}deg);
            z-index:${z};
            image-rendering:auto;
            pointer-events:none;
        `;
        return div;
    }

    function resolveMyHomePlayerSpriteKey(dir = 'down') {
        const ai = window.aiPet || window.hero || {};
        const skin = ai.currentSkin || ai.type || ai.baseType || 'robot';
        const baseFamily = String(skin).split('_')[0] || 'robot';
        const candidates = [
            `${skin}_${dir}`,
            `${baseFamily}_${dir}`,
            `robot_${dir}`
        ];
        for (const key of candidates) {
            if (window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[key]) return key;
        }
        if (!window.DUNGEON_SPRITES) return null;
        return Object.keys(window.DUNGEON_SPRITES).find(k => k.startsWith(`${baseFamily}_`)) ||
            Object.keys(window.DUNGEON_SPRITES).find(k => k.startsWith('robot_')) ||
            null;
    }

    function createCurrentAiCharacterDiv(x, y, z, existingDiv = null) {
        const ai = window.aiPet || window.hero || {};
        const dir = (ai.myHomeIndoor && ai.myHomeIndoor.player && ai.myHomeIndoor.player.dir) || ai.myHomeDirection || 'down';
        const spriteKey = resolveMyHomePlayerSpriteKey(dir);
        const div = spriteKey ? createDungeonCharacterDiv(spriteKey, x, y, z, existingDiv) : null;
        if (div) {
            div.className = 'myhome-player';
            if (typeof window.applyDungeonWalkCosmetics === 'function') window.applyDungeonWalkCosmetics(div, ai, spriteKey);
        }
        return div;
    }

    window.ensureMyHomeIndoorState = function() {
        const hero = window.aiPet || window.hero || {};
        if (!hero.myHomeIndoor) {
            hero.myHomeIndoor = {
                width: MAP_W,
                height: MAP_H,
                grid: MYHOME_MAP_LV1.map(row => row.slice()),
                player: { ...ENTRANCE_POS },
                concierge: { x: 5, y: 3, dir: 'down' },
                objects: [
                    { id: 'warehouse', key: 'hfur_warehouse', x: 2, y: 2, name: '倉庫' },
                    { id: 'freezer', key: 'hfur_freezer', x: 4, y: 2, name: '冷凍庫' },
                    { id: 'safe', key: 'hfur_safe', x: 7, y: 2, name: '金庫' },
                    { id: 'dresser', key: 'hfur_dresser', x: 9, y: 3, name: 'ドレッサー' }
                ],
                unlockedAt: Date.now()
            };
        }
        if (!Array.isArray(hero.myHomeIndoor.grid)) hero.myHomeIndoor.grid = MYHOME_MAP_LV1.map(row => row.slice());
        hero.myHomeIndoor.width = hero.myHomeIndoor.grid[0] ? hero.myHomeIndoor.grid[0].length : MAP_W;
        hero.myHomeIndoor.height = hero.myHomeIndoor.grid.length || MAP_H;
        if (!Array.isArray(hero.myHomeIndoor.objects)) hero.myHomeIndoor.objects = [];
        if (!Array.isArray(hero.myHomeIndoor.drops)) hero.myHomeIndoor.drops = [];
        if (!Array.isArray(hero.myHomeIndoor.logs)) hero.myHomeIndoor.logs = [];
        if (!hero.myHomeIndoor.storage) hero.myHomeIndoor.storage = { warehouse: [], freezer: [], safeGold: 0 };
        if (!hero.myHomeIndoor.decorQuest) hero.myHomeIndoor.decorQuest = { plant: false, candle: false };
        if (!hero.myHomeIndoor.environmentBonus) hero.myHomeIndoor.environmentBonus = 0;
        const existingById = new Map(hero.myHomeIndoor.objects.map(o => [o && o.id, o]).filter(([id]) => Boolean(id)));
        const existingIds = new Set(existingById.keys());
        getDefaultMyHomeObjects().forEach(obj => {
            const existing = existingById.get(obj.id);
            if (existing && (obj.id === 'strategy_board' || obj.id.startsWith('meeting_'))) {
                Object.assign(existing, obj);
            } else if (!existingIds.has(obj.id)) {
                hero.myHomeIndoor.objects.push(obj);
            }
        });
        return hero.myHomeIndoor;
    };

    window.isMyHomeIndoorUnlocked = function() {
        const hero = window.aiPet || window.hero;
        return !!(hero && (hero.conciergeEncountered || hero.conciergeUnlocked));
    };

    function setMyHomeChatMessage(text) {
        const el = document.getElementById('myhome-chat-message');
        if (el) el.textContent = text || '';
    }

    function getItemId(item) {
        if (!item) return '';
        if (typeof item === 'string') return item;
        const id = item.id || item.itemId || item.key || item.name || item.label || '';
        return typeof id === 'string' ? id : '';
    }

    function getMyHomeItemCatalog() {
        if (window.itemCatalog) return window.itemCatalog;
        if (typeof itemCatalog !== 'undefined') return itemCatalog;
        return {};
    }

    function getItemName(item) {
        if (item && typeof item === 'object') {
            const directName = item.name || item.label;
            if (typeof directName === 'string' && directName && directName !== '[object Object]') return directName;
        }
        const itemId = getItemId(item);
        const catalog = getMyHomeItemCatalog();
        const data = catalog && catalog[itemId];
        const name = data && (data.name || data.label || data.displayName || data.jpName);
        if (typeof name === 'string' && name && name !== '[object Object]') return name;
        return itemId || 'アイテム';
    }

    function addMyHomeLog(text, speaker = 'AI') {
        const state = window.ensureMyHomeIndoorState();
        const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const safeText = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeSpeaker = String(speaker || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        state.logs.push(`<span style="color:#888;font-size:12px;">[${timeStr}]</span> <b style="color:#f7e4ba;">${safeSpeaker}</b> ${safeText}`);
        if (state.logs.length > 100) state.logs.shift();
        renderMyHomeLogPanel();
    }

    function showMyHomeBubble(text, color = '#00bcd4', duration = 2400) {
        const state = window.ensureMyHomeIndoorState();
        state.player.speechText = text;
        state.player.speechColor = color;
        state.player.speechUntil = Date.now() + duration;
        window.renderMyHomeMap();
    }

    window.setMyHomeChatMessage = setMyHomeChatMessage;
    window.addMyHomeLog = addMyHomeLog;
    window.showMyHomeBubble = showMyHomeBubble;

    function attachMyHomeBubble(charaDiv, chara) {
        if (!charaDiv) return;
        const existingBubble = charaDiv.querySelector('[data-myhome-bubble="true"]');
        if (!chara || !chara.speechText) {
            if (existingBubble) existingBubble.remove();
            return;
        }
        if (chara.speechUntil && chara.speechUntil < Date.now()) {
            delete chara.speechText;
            delete chara.speechColor;
            delete chara.speechUntil;
            if (existingBubble) existingBubble.remove();
            return;
        }
        const bubble = existingBubble || document.createElement('div');
        bubble.dataset.myhomeBubble = 'true';
        const charaImgInner = charaDiv.querySelector('div') || charaDiv.firstChild || charaDiv;
        if (charaImgInner && charaImgInner.style) {
            const pos = window.getComputedStyle(charaImgInner).position;
            if (!['absolute', 'fixed', 'sticky', 'relative'].includes(pos)) charaImgInner.style.position = 'relative';
        }
        const safeText = String(chara.speechText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        let invScale = 1;
        const transform = charaImgInner && charaImgInner.style ? charaImgInner.style.transform : '';
        const match = transform && transform.match(/scale\(([^,)]+)/);
        if (match && parseFloat(match[1])) invScale = 1 / parseFloat(match[1]);
        bubble.innerHTML = `<div style="font-size:22px;line-height:1.45;color:#111;text-align:left;font-weight:bold;">${safeText}</div>`;
        bubble.style.cssText = `position:absolute;bottom:calc(100% + 3px);left:50%;transform:translateX(calc(-50% + 115px)) scale(${invScale});transform-origin:bottom center;width:360px;max-width:360px;background:#fff;border:4px solid ${chara.speechColor || '#00bcd4'};border-radius:16px;padding:16px 18px;box-sizing:border-box;box-shadow:0 6px 16px rgba(0,0,0,0.5);z-index:9999;pointer-events:none;`;
        if (!existingBubble) charaImgInner.appendChild(bubble);
    }

    function getCurrentConciergeQuest(rank) {
        const ai = window.aiPet || window.hero || {};
        const quests = ai.apprentice && Array.isArray(ai.apprentice.activeQuests) ? ai.apprentice.activeQuests : [];
        const found = quests.find(q => q && q.masterType === 'concierge' && (rank === undefined || q.rank === rank));
        return found || null;
    }

    function syncConciergeQuestValue(value) {
        const ai = window.aiPet || window.hero || {};
        if (ai.apprentice) ai.apprentice.qVal = value;
        const q = getCurrentConciergeQuest();
        if (q) q.qVal = value;
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        renderMyHomeQuestHUD();
    }

    function incrementConciergeQuestValue(amount = 1) {
        const ai = window.aiPet || window.hero || {};
        const next = ((ai.apprentice && ai.apprentice.qVal) || 0) + amount;
        syncConciergeQuestValue(next);
    }

    function addInventoryItem(itemId) {
        const ai = window.aiPet || window.hero || {};
        if (!Array.isArray(ai.inventory)) ai.inventory = [];
        ai.inventory.push({ id: itemId, age: 0 });
        if (typeof saveGameData === 'function') saveGameData();
        renderMyHomeInventoryPanel();
    }

    function removeInventoryItem(itemId) {
        const ai = window.aiPet || window.hero || {};
        if (!Array.isArray(ai.inventory)) return null;
        const idx = ai.inventory.findIndex(item => getItemId(item) === itemId || !itemId);
        if (idx < 0) return null;
        const [item] = ai.inventory.splice(idx, 1);
        if (typeof saveGameData === 'function') saveGameData();
        renderMyHomeInventoryPanel();
        return item;
    }

    function getMyHomeItemPool() {
        const catalog = getMyHomeItemCatalog();
        const ids = Object.keys(catalog || {}).filter(id => {
            const data = catalog[id] || {};
            return !data.keyItem && data.type !== 'key' && data.type !== 'furniture' && !id.startsWith('license_');
        });
        return ids.length ? ids : ['wood', 'stone', 'herb', 'water'];
    }

    function isMyHomeCellFree(state, x, y) {
        if (!state || y < 0 || x < 0 || y >= state.grid.length || x >= state.grid[y].length) return false;
        if (state.grid[y][x] !== 0 && state.grid[y][x] !== 100) return false;
        if ((state.objects || []).some(obj => obj && obj.x === x && obj.y === y)) return false;
        if ((state.drops || []).some(drop => drop && drop.x === x && drop.y === y)) return false;
        if (state.concierge && state.concierge.x === x && state.concierge.y === y) return false;
        if (state.player && state.player.x === x && state.player.y === y) return false;
        return true;
    }

    function shuffleMyHomeArray(list) {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function findEmptyMyHomeCell(preferred) {
        const state = window.ensureMyHomeIndoorState();
        const candidates = preferred ? [preferred] : [];
        const randomCandidates = [];
        for (let y = 1; y < state.grid.length - 1; y++) {
            for (let x = 1; x < state.grid[y].length - 1; x++) randomCandidates.push({ x, y });
        }
        candidates.push(...shuffleMyHomeArray(randomCandidates));
        return candidates.find(pos => isMyHomeCellFree(state, pos.x, pos.y)) || null;
    }

    window.spawnMyHomeDailyDrops = function(force = false) {
        const state = window.ensureMyHomeIndoorState();
        const cycle = Math.floor(Date.now() / (12 * 60 * 60 * 1000));
        if (!force && state.lastDropCycle === cycle) return;
        state.lastDropCycle = cycle;
        if (force) state.drops = [];
        const pool = getMyHomeItemPool();
        for (let i = 0; i < 3; i++) {
            const pos = findEmptyMyHomeCell();
            if (!pos) break;
            const itemId = pool[Math.floor(Math.random() * pool.length)];
            state.drops.push({ id: `drop_${cycle}_${i}_${Date.now()}`, x: pos.x, y: pos.y, itemId });
        }
        if (typeof saveGameData === 'function') saveGameData();
        if (window.myHomeMapOpen) window.renderMyHomeMap();
    };

    function renderMyHomeQuestHUD() {
        const ui = document.getElementById('myhome-map-ui');
        if (!ui) return;
        let hud = document.getElementById('myhome-quest-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'myhome-quest-hud';
            hud.style.cssText = 'position:absolute;right:16px;top:118px;width:min(330px,calc(100vw - 32px));z-index:24;background:rgba(20,18,24,0.74);border:1px solid rgba(247,228,186,0.45);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font-size:12px;line-height:1.45;';
            ui.appendChild(hud);
        }
        const q = getCurrentConciergeQuest();
        const score = window.getMyHomeEnvironmentScore ? window.getMyHomeEnvironmentScore() : 0;
        if (!q) {
            hud.innerHTML = `<div style="color:#f7e4ba;font-weight:bold;margin-bottom:4px;">環境スコア: ${score}</div><div style="color:#ccc;">受注中のコンシェルジュ課題はありません。</div>`;
            return;
        }
        const progress = typeof q.qVal !== 'undefined' ? `進行: ${q.qVal}` : '';
        hud.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;"><b style="color:#f7e4ba;">${q.name}</b><span style="color:#9ee493;">環境 ${score}</span></div><div style="color:#fff;">${q.desc || ''}</div><div style="color:#9ee493;margin-top:4px;">${progress}</div>`;
    }

    renderMyHomeQuestHUD = function() {
        const ui = document.getElementById('myhome-map-ui');
        if (!ui) return;
        let hud = document.getElementById('myhome-quest-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'myhome-quest-hud';
            hud.style.cssText = 'position:absolute;right:16px;top:118px;width:min(330px,calc(100vw - 32px));z-index:24;background:rgba(15,15,20,0.88);border:2px solid #FFC107;border-radius:8px;padding:10px;box-shadow:0 0 12px rgba(255,193,7,0.25);font-size:12px;line-height:1.45;';
            ui.appendChild(hud);
        }
        const q = getCurrentConciergeQuest();
        if (!q) {
            hud.style.display = 'none';
            return;
        }
        const hero = window.aiPet || window.hero || {};
        const qData = hero.getMasterQuestData ? hero.getMasterQuestData('concierge', q.rank) : null;
        const isCleared = qData && qData.check ? qData.check() : false;
        const desc = typeof window.formatQuestDescription === 'function' ? window.formatQuestDescription(q.desc || '') : (q.desc || '');
        const score = window.getMyHomeEnvironmentScore ? window.getMyHomeEnvironmentScore() : 0;
        const storageFlags = hero.myHomeQuestStorageDeposits || {};
        const progress = q.rank === 3
            ? `<span style="display:block;">倉庫に収納: ${storageFlags.warehouse ? '<b style="color:#4CAF50;">1 / 1</b>' : '0 / 1'}</span><span style="display:block;">冷凍庫に収納: ${storageFlags.freezer ? '<b style="color:#4CAF50;">1 / 1</b>' : '0 / 1'}</span>`
            : (typeof q.qVal !== 'undefined' ? `進行: ${Math.floor(q.qVal)}${q.rank === 1 ? ' / 3' : ''}` : '');
        hud.style.display = 'block';
        hud.style.border = `2px solid ${isCleared ? '#4CAF50' : '#FFC107'}`;
        hud.style.boxShadow = isCleared ? '0 0 15px rgba(76,175,80,0.4)' : '0 0 12px rgba(255,193,7,0.25)';
        hud.innerHTML = `
            <div style="font-size:12px;font-weight:bold;color:${isCleared ? '#4CAF50' : '#FFC107'};margin-bottom:5px;">📜 ${q.name}</div>
            <div style="font-size:11px;color:#ccc;line-height:1.45;">${desc}</div>
            <div style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:11px;color:#FF9800;">
                <span>${progress}${isCleared ? '<span style="display:block;color:#4CAF50;font-weight:bold;">条件達成！報告しよう</span>' : ''}</span>
                <span>環境 ${score}</span>
            </div>
        `;
    };
    window.renderMyHomeQuestHUD = renderMyHomeQuestHUD;

    function renderMyHomeInventoryPanel() {
        const panel = document.getElementById('myhome-inventory-panel');
        if (!panel) return;
        const ai = window.aiPet || window.hero || {};
        const counts = {};
        (ai.inventory || []).forEach(item => {
            const id = getItemId(item);
            if (!id) return;
            counts[id] = (counts[id] || 0) + 1;
        });
        const rows = Object.keys(counts).sort().map(id => `<div style="display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid rgba(255,255,255,0.08);padding:4px 0;"><span>${getItemName(id)}</span><b>x${counts[id]}</b></div>`);
        panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#f7e4ba;font-weight:bold;"><span>持ち物</span><button id="myhome-inventory-close" type="button" style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;line-height:1;">×</button></div>${rows.join('') || '<div style="color:#ccc;">持ち物はありません。</div>'}`;
        const close = document.getElementById('myhome-inventory-close');
        if (close) close.onclick = () => { panel.style.display = 'none'; };
    }

    function renderMyHomeLogPanel() {
        const panel = document.getElementById('myhome-log-panel');
        if (!panel) return;
        const state = window.ensureMyHomeIndoorState();
        panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#f7e4ba;font-weight:bold;"><span>会話ログ</span><button id="myhome-log-close" type="button" style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;line-height:1;">×</button></div><div style="display:flex;flex-direction:column;gap:6px;">${state.logs.map(line => `<div style="border-bottom:1px dotted rgba(255,255,255,0.18);padding-bottom:5px;">${line}</div>`).join('') || '<div style="color:#ccc;">ログはまだありません。</div>'}</div>`;
        const close = document.getElementById('myhome-log-close');
        if (close) close.onclick = () => { panel.style.display = 'none'; };
        panel.scrollTop = panel.scrollHeight;
    }

    window.getMyHomeEnvironmentScore = function() {
        const state = window.ensureMyHomeIndoorState();
        const objectScore = (state.objects || []).reduce((sum, obj) => sum + (obj && obj.id && obj.id.startsWith('meeting_') ? 0.25 : 1) + ((obj && obj.level ? obj.level - 1 : 0) * 2), 0);
        return Math.floor(objectScore + (state.environmentBonus || 0));
    };

    window.hasMyHomeFurniture = function(id) {
        const state = window.ensureMyHomeIndoorState();
        if (id === 'table' || id === 'strategy_table') return (state.objects || []).some(obj => obj && (obj.id === 'strategy_board' || obj.id.includes('meeting_table')));
        return (state.objects || []).some(obj => obj && (obj.id === id || obj.type === id));
    };

    window.getMyHomeFurnitureLevel = function(id) {
        const state = window.ensureMyHomeIndoorState();
        const obj = (state.objects || []).find(o => o && (o.id === id || o.type === id));
        return obj ? (obj.level || 1) : 0;
    };

    function getMyHomeHutAsset() {
        if (typeof window.getMyHomeAsset === 'function') {
            const hut = window.getMyHomeAsset();
            if (hut) return hut;
        }
        if (typeof assets !== 'undefined') {
            for (const k in assets) {
                if (assets[k] && assets[k].type === 'hut' && !assets[k].isMobile) return assets[k];
            }
        }
        return null;
    }

    function ensureHutStorage() {
        const hut = getMyHomeHutAsset();
        if (!hut) return null;
        if (!hut.storage) hut.storage = {};
        if (!hut.storage.warehouse) hut.storage.warehouse = { level: 1, capacity: 10, items: [] };
        if (!hut.storage.freezer) hut.storage.freezer = { level: 1, capacity: 10, items: [] };
        if (!hut.storage.safe) hut.storage.safe = { level: 1, capacity: 50000, gold: 0 };
        if (!hut.storage.dresser) hut.storage.dresser = { level: 1, capacity: 10, items: [] };
        if (!Array.isArray(hut.storage.warehouse.items)) hut.storage.warehouse.items = [];
        if (!Array.isArray(hut.storage.freezer.items)) hut.storage.freezer.items = [];
        if (!Array.isArray(hut.storage.dresser.items)) hut.storage.dresser.items = [];
        return hut.storage;
    }

    function renderMyHomeStorageItems(items) {
        if (!items || !items.length) return '<div style="color:#777;text-align:center;padding:14px;">からっぽ</div>';
        const counts = {};
        items.forEach(item => {
            const id = getItemId(item);
            if (id) counts[id] = (counts[id] || 0) + 1;
        });
        return Object.keys(counts).map(id => `<span style="background:#333;padding:5px 8px;border-radius:6px;margin:3px;font-size:12px;border:1px solid #555;display:inline-block;">${getItemName(id)} <b style="color:#FFD700;">x${counts[id]}</b></span>`).join('');
    }

    function openMyHomeStoragePanel(kind) {
        const storage = ensureHutStorage();
        if (!storage) {
            showMyHomeBubble('小屋の収納が見つからないみたい…', '#ff5252');
            return;
        }
        const isSafe = kind === 'safe';
        const label = kind === 'warehouse' ? '倉庫' : kind === 'freezer' ? '冷凍庫' : '金庫';
        const color = kind === 'warehouse' ? '#FF9800' : kind === 'freezer' ? '#4fc3f7' : '#FFD700';
        const box = storage[kind];
        let ui = document.getElementById('myhome-storage-detail-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'myhome-storage-detail-ui';
            ui.style.cssText = 'position:fixed;inset:0;z-index:130000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;font-family:sans-serif;';
            document.body.appendChild(ui);
        }
        ui.style.display = 'flex';
        ui.dataset.kind = kind;
        const body = isSafe
            ? `<div style="text-align:center;font-size:28px;color:#FFD700;font-weight:bold;padding:26px;">${window.formatLargeNumber ? window.formatLargeNumber(box.gold || 0) : (box.gold || 0)} G</div><div style="text-align:center;color:#aaa;font-size:12px;">最大容量: ${window.formatLargeNumber ? window.formatLargeNumber(box.capacity || 0) : (box.capacity || 0)} G</div>`
            : `<div style="min-height:150px;max-height:260px;overflow:auto;padding:8px;background:#151515;border-radius:8px;border:1px solid #333;">${renderMyHomeStorageItems(box.items)}</div><div style="text-align:right;color:#aaa;font-size:12px;margin-top:8px;">${(box.items || []).length} / ${box.capacity || 0}</div>`;
        ui.innerHTML = `
            <div style="width:min(520px,calc(100vw - 32px));background:linear-gradient(135deg,#1a1a1a,#111);border:2px solid ${color};border-radius:12px;color:#fff;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,0.8);">
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #333;padding-bottom:10px;margin-bottom:14px;">
                    <h2 style="margin:0;color:${color};font-size:22px;">${label}</h2>
                    <button id="myhome-storage-close" style="background:#555;color:#fff;border:1px solid #777;border-radius:6px;padding:7px 12px;cursor:pointer;">閉じる</button>
                </div>
                ${body}
                <div style="margin-top:12px;color:#ccc;font-size:12px;line-height:1.5;">AIが必要に応じて自動で出し入れします。</div>
            </div>
        `;
        const close = document.getElementById('myhome-storage-close');
        if (close) close.onclick = () => {
            ui.style.display = 'none';
            const pending = ui.dataset.fullReason;
            if (pending) {
                showMyHomeBubble(pending, '#ff9800');
                addMyHomeLog(pending);
                delete ui.dataset.fullReason;
            }
        };
        return ui;
    }

    function isMyHomeFoodItem(item) {
        const data = getMyHomeItemCatalog()[getItemId(item)] || {};
        return ['food', 'ingredient', 'dish'].includes(data.type) || data.category === 'food' || (Array.isArray(data.tags) && data.tags.includes('food'));
    }

    function getMyHomeItemValue(item) {
        const data = getMyHomeItemCatalog()[getItemId(item)] || {};
        return Number(data.value || data.price || data.sellPrice || 0);
    }

    function getMyHomeItemAge(item) {
        return item && typeof item === 'object' ? Math.max(0, Number(item.age || 0)) : 0;
    }

    function getMyHomeSmartChoice(list, score, preferHigh) {
        if (!Array.isArray(list) || !list.length) return null;
        const ai = window.aiPet || window.hero || {};
        const intel = Math.max(0, Number(ai.stats && ai.stats.intel || 0));
        const smartChance = intel / (intel + 100);
        if (Math.random() > smartChance) return list[Math.floor(Math.random() * list.length)];
        return list.reduce((best, entry) => {
            if (!best) return entry;
            const diff = Number(score(entry) || 0) - Number(score(best) || 0);
            return (preferHigh ? diff > 0 : diff < 0) ? entry : best;
        }, null);
    }

    function getMyHomeStorageAvailability(kind, mode) {
        const ai = window.aiPet || window.hero || {};
        const storage = ensureHutStorage();
        if (!storage || !storage[kind]) return false;
        const box = storage[kind];
        if (mode === 'withdraw') return kind === 'safe' ? (box.gold || 0) > 0 : Array.isArray(box.items) && box.items.length > 0;
        if (kind === 'safe') return (ai.gold || 0) > 0 && (box.gold || 0) < (box.capacity || 0);
        const candidates = (ai.inventory || []).filter(item => kind === 'freezer' ? isMyHomeFoodItem(item) : !isMyHomeFoodItem(item));
        return candidates.length > 0 && (box.level || 0) > 0 && (box.items || []).length < (box.capacity || 0);
    }

    function selectRandomMyHomeStorage(mode) {
        const kinds = ['warehouse', 'freezer', 'safe'].filter(kind => getMyHomeStorageAvailability(kind, mode));
        return kinds.length ? kinds[Math.floor(Math.random() * kinds.length)] : null;
    }

    function getActiveMyHomeHospitalityQuest() {
        const ai = window.aiPet || window.hero || {};
        const quests = ai.apprentice && Array.isArray(ai.apprentice.activeQuests) ? ai.apprentice.activeQuests : [];
        const quest = getCurrentConciergeQuest(8) || quests.find(q => q && q.isMasterSpecialQuest && q.eventType === 'hospitality' && !q.completed);
        if (!quest || ai.myHomeHospitalityDone || Number(quest.qVal || 0) >= 1) return null;
        return quest;
    }

    function setMyHomeVisitorRoute(state, target) {
        const visitor = state && state.visitor;
        if (!visitor || !target) return false;
        const playerBlock = state.player ? [state.player] : [];
        visitor.route = findMyHomePath(state, visitor, target, playerBlock);
        visitor.routeIndex = 0;
        return visitor.route.length > 0 || (visitor.x === target.x && visitor.y === target.y);
    }

    function maybeSpawnMyHomeVisitor() {
        const state = window.ensureMyHomeIndoorState();
        const score = window.getMyHomeEnvironmentScore ? window.getMyHomeEnvironmentScore() : 0;
        if (state.visitor || !getActiveMyHomeHospitalityQuest() || score < 12) return false;
        state.visitor = {
            id: `visitor_${Date.now()}`,
            ...VISITOR_ENTRY_POS,
            status: 'arriving',
            seated: false,
            route: [],
            routeIndex: 0,
            order: null
        };
        setMyHomeVisitorRoute(state, VISITOR_SEAT_POS);
        setMyHomeChatMessage('来客が入り口に到着しました。席へご案内しています。');
        addMyHomeLog('来客がマイホームを訪れました。', '来客');
        if (typeof saveGameData === 'function') saveGameData();
        return true;
    }

    function normalizeMyHomeVisitorState(state) {
        const visitor = state && state.visitor;
        if (!visitor) return null;
        if (!visitor.status) {
            visitor.status = state.tableDish ? 'eating' : 'seated';
            visitor.seated = visitor.status !== 'arriving';
        }
        if (visitor.status === 'eating' && !visitor.leaveAt) {
            visitor.leaveAt = Number(state.tableDish && state.tableDish.until) || (Date.now() + VISITOR_MEAL_MS);
        }
        return visitor;
    }

    function finishMyHomeHospitality(state) {
        const ai = window.aiPet || window.hero || {};
        state.visitor = null;
        state.tableDish = null;
        ai.myHomeHospitalityDone = true;
        const quest = getCurrentConciergeQuest(8);
        if (quest) {
            quest.qVal = 1;
            if (ai.apprentice) ai.apprentice.qVal = 1;
            if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            renderMyHomeQuestHUD();
        }
        if (typeof window.recordMasterSpecialQuestProgress === 'function') {
            window.recordMasterSpecialQuestProgress('hospitality', 'myhome_hospitality', { hero: ai });
        }
        setMyHomeChatMessage('来客は満足して帰りました。コンシェルジュに報告しましょう。');
        addMyHomeLog('来客が満足して帰りました。', '来客');
        if (typeof saveGameData === 'function') saveGameData();
        window.renderMyHomeMap();
    }

    function beginMyHomeVisitorDeparture(state, visitor) {
        visitor.status = 'departing';
        visitor.seated = false;
        delete visitor.leaveAt;
        state.tableDish = null;
        setMyHomeVisitorRoute(state, VISITOR_ENTRY_POS);
        setMyHomeChatMessage('来客がお帰りになります。入り口までお見送りします。');
        addMyHomeLog('来客がお帰りになります。', '来客');
        if (typeof saveGameData === 'function') saveGameData();
        window.renderMyHomeMap();
    }

    function updateMyHomeVisitor() {
        if (!window.myHomeMapOpen) return;
        const state = window.ensureMyHomeIndoorState();
        const spawned = maybeSpawnMyHomeVisitor();
        const visitor = normalizeMyHomeVisitorState(state);
        if (!visitor) return;
        const ai = window.aiPet || window.hero || {};
        const quest = getCurrentConciergeQuest(8);
        const questAlreadyComplete = !quest || ai.myHomeHospitalityDone || Number(quest.qVal || 0) >= 1;

        if (questAlreadyComplete && visitor.status !== 'eating' && visitor.status !== 'departing') {
            beginMyHomeVisitorDeparture(state, visitor);
            return;
        }

        if (visitor.status === 'eating') {
            if (Date.now() >= Number(visitor.leaveAt || 0)) beginMyHomeVisitorDeparture(state, visitor);
            else if (spawned) window.renderMyHomeMap();
            return;
        }

        if (visitor.status === 'seated') {
            if (spawned) window.renderMyHomeMap();
            return;
        }

        const target = visitor.status === 'departing' ? VISITOR_ENTRY_POS : VISITOR_SEAT_POS;
        if (visitor.x === target.x && visitor.y === target.y) {
            if (visitor.status === 'departing') {
                finishMyHomeHospitality(state);
            } else {
                visitor.status = 'seated';
                visitor.seated = true;
                visitor.dir = VISITOR_SEAT_POS.dir;
                visitor.route = [];
                visitor.routeIndex = 0;
                setMyHomeChatMessage('来客が席に着きました。「おもてなし」で料理を提供できます。');
                addMyHomeLog('来客が席に着きました。', '来客');
                if (typeof saveGameData === 'function') saveGameData();
                window.renderMyHomeMap();
            }
            return;
        }

        if (!Array.isArray(visitor.route) || visitor.routeIndex >= visitor.route.length) {
            if (!setMyHomeVisitorRoute(state, target)) return;
        }
        let next = visitor.route[visitor.routeIndex];
        if (state.player && next && next.x === state.player.x && next.y === state.player.y) {
            if (!setMyHomeVisitorRoute(state, target)) return;
            next = visitor.route[visitor.routeIndex];
            if (state.player && next && next.x === state.player.x && next.y === state.player.y) return;
        }
        if (!next) return;
        visitor.dir = getMyHomeStepDir(visitor, next);
        visitor.x = next.x;
        visitor.y = next.y;
        visitor.routeIndex += 1;
        window.renderMyHomeMap();
    }

    function ensureMyHomeVisitorTimer() {
        if (window.myHomeVisitorTimer) return;
        window.myHomeVisitorTimer = setInterval(updateMyHomeVisitor, VISITOR_STEP_MS);
    }

    function getMyHomeKnownWords() {
        const ai = window.aiPet || window.hero || {};
        if (!ai.apprentice) ai.apprentice = {};
        if (!Array.isArray(ai.apprentice.learnedWords)) ai.apprentice.learnedWords = [];
        return ai.apprentice.learnedWords;
    }

    function renderMyHomeWordsPanel() {
        const list = document.getElementById('myhome-words-list');
        if (!list) return;
        const ai = window.aiPet || window.hero || {};
        const allWords = getMyHomeKnownWords();
        const maxWords = typeof ai.getMaxVocabulary === 'function' ? ai.getMaxVocabulary() : 5;
        const homeWords = new Set([
            'コンシェルジュ', '掃除', '倉庫', '冷凍庫', '金庫', 'ドレッサー',
            '作戦', '会議', 'ホワイトボード', 'テーブル', 'マイホーム', '小屋',
            '睡眠', '食事', '家具', 'おもてなし', 'ベッド', 'アイテム', '食べ物',
            'お金', '入れる', 'しまう', '出す', '取り出す', 'カラーチェンジ', 'オーラ',
            'アップグレード', '強化', '改装'
        ]);
        const groups = [
            { title: '🏠 マイホーム', test: word => homeWords.has(word) || ['倉庫', '冷凍庫', '金庫', 'ドレッサー', '作戦', '掃除', 'コンシェルジュ'].some(key => String(word).includes(key)) },
            { title: '🧰 生活・回復', test: word => ['睡眠', '食事', '料理', 'お菓子作り', '調合', 'ヘアメイク', 'カラーチェンジ', 'オーラ'].includes(word) },
            { title: '💪 育成・訓練', test: word => ['勉強', '筋トレ', 'ランニング'].includes(word) },
            { title: '🎓 依頼・課題', test: word => String(word).includes('のところへ') || ['冒険家', '農家', '漁師', '料理人', '鍛冶師', '建築士', '美容師', '薬剤師', '仕立屋', 'パティシエ'].includes(word) },
            { title: '📚 その他', test: () => true }
        ];
        const words = myHomeWordFilter === 'home'
            ? allWords.filter(word => groups[0].test(word))
            : allWords.slice();
        const used = new Set();
        const makeChip = word => `<button type="button" class="myhome-word-chip" data-word="${String(word).replace(/"/g, '&quot;')}" style="background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.22);border-radius:999px;padding:5px 8px;cursor:pointer;font-size:12px;">${word}</button>`;
        let html = `
            <div style="position:sticky;top:-10px;background:rgba(20,18,24,0.92);padding:0 0 8px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.12);">
                <div style="font-size:12px;color:#f7e4ba;margin-bottom:7px;">🧠 記憶容量: <b>${allWords.length}</b> / <b>${maxWords}</b> 語</div>
                <div style="display:flex;gap:6px;">
                    <button type="button" id="myhome-filter-home" style="flex:1;background:${myHomeWordFilter === 'home' ? '#2e8b57' : 'rgba(255,255,255,0.12)'};color:#fff;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;cursor:pointer;font-size:12px;">マイホーム</button>
                    <button type="button" id="myhome-filter-all" style="flex:1;background:${myHomeWordFilter === 'all' ? '#2e8b57' : 'rgba(255,255,255,0.12)'};color:#fff;border:1px solid rgba(255,255,255,0.22);border-radius:6px;padding:6px;cursor:pointer;font-size:12px;">全言葉</button>
                </div>
            </div>
        `;
        if (!words.length) {
            html += '<div style="color:#ccc;font-size:12px;">このフィルターに表示できる言葉はまだありません。</div>';
        } else {
            groups.forEach(group => {
                const groupWords = words.filter(word => !used.has(word) && group.test(word));
                groupWords.forEach(word => used.add(word));
                if (!groupWords.length) return;
                html += `<div style="margin:10px 0 5px;color:#f7e4ba;font-size:12px;font-weight:bold;">${group.title}</div>`;
                html += `<div style="display:flex;flex-wrap:wrap;gap:6px;">${groupWords.map(makeChip).join('')}</div>`;
            });
        }
        list.innerHTML = html;
        const homeFilter = document.getElementById('myhome-filter-home');
        const allFilter = document.getElementById('myhome-filter-all');
        if (homeFilter) homeFilter.addEventListener('click', () => { myHomeWordFilter = 'home'; renderMyHomeWordsPanel(); });
        if (allFilter) allFilter.addEventListener('click', () => { myHomeWordFilter = 'all'; renderMyHomeWordsPanel(); });
        list.querySelectorAll('.myhome-word-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                handleMyHomeChat(btn.dataset.word || '');
            });
        });
    }

    function rememberMyHomeWord(rawText) {
        const word = String(rawText || '').trim();
        if (!word) return false;
        const ai = window.aiPet || window.hero || {};
        const words = getMyHomeKnownWords();
        if (words.includes(word)) return false;
        const maxWords = typeof ai.getMaxVocabulary === 'function' ? ai.getMaxVocabulary() : 5;
        if (words.length >= maxWords) {
            setMyHomeChatMessage(`これ以上は覚えられません。「忘れて」と伝えて整理してください。`);
            return false;
        }
        words.push(word);
        if (typeof saveGameData === 'function') saveGameData();
        if (typeof updateCommandHUD === 'function') updateCommandHUD();
        renderMyHomeWordsPanel();
        setMyHomeChatMessage(`「${word}」を覚えました。`);
        return true;
    }

    function forgetMyHomeWord(rawText) {
        const match = String(rawText || '').match(/^(.+?)(を)?忘れて$/);
        if (!match) return false;
        const word = match[1].trim();
        const words = getMyHomeKnownWords();
        const index = words.indexOf(word);
        if (index >= 0) {
            words.splice(index, 1);
            setMyHomeChatMessage(`「${word}」を忘れました。`);
            if (typeof saveGameData === 'function') saveGameData();
            if (typeof updateCommandHUD === 'function') updateCommandHUD();
            renderMyHomeWordsPanel();
        } else {
            setMyHomeChatMessage(`「${word}」はまだ覚えていません。`);
        }
        return true;
    }

    function getMyHomeCommandTarget(rawText) {
        const text = String(rawText || '').trim();
        const state = window.ensureMyHomeIndoorState();
        const findObject = id => (state.objects || []).find(obj => obj && obj.id === id);
        const includesAny = list => list.some(word => text.includes(word));
        if (includesAny(['会話ログ', 'ログ'])) return { kind: 'panel', panel: 'log', label: '会話ログ' };
        if (includesAny(['持ち物', 'インベントリ', 'アイテム一覧'])) return { kind: 'panel', panel: 'inventory', label: '持ち物' };
        if (includesAny(['接客', 'おもてなし'])) return { kind: 'action', action: 'hospitality', label: '接客' };
        if (includesAny(['食事', 'ごはん', 'ご飯'])) return { kind: 'action', action: 'eat', label: '食事' };
        if (includesAny(['勉強', '学習'])) return { kind: 'action', action: 'study', label: '勉強' };
        if (includesAny(['筋トレ', 'トレーニング'])) return { kind: 'action', action: 'train', label: '筋トレ' };
        if (includesAny(['ランニング', '走る', 'ジョギング'])) return { kind: 'action', action: 'run', label: 'ランニング' };
        if (includesAny(['観葉植物', '植物'])) return { kind: 'action', action: 'place_plant', label: '観葉植物' };
        if (includesAny(['キャンドル'])) return { kind: 'action', action: 'place_candle', label: 'キャンドル' };
        if (includesAny(['アップグレード', '強化', '改装']) && !includesAny(['倉庫', '冷凍庫', '冷蔵庫', '金庫'])) return { kind: 'action', action: 'upgrade', label: 'アップグレード' };
        if (includesAny(['睡眠', '寝る', 'ベッド'])) return { kind: 'action', action: 'bed', label: 'ベッド' };
        if (includesAny(['コンシェルジュ', 'メイド', '管理人'])) return { kind: 'concierge', action: 'visit', label: 'コンシェルジュ' };
        if (includesAny(['掃除', '清掃'])) return { kind: 'action', action: 'clean', label: '掃除' };
        if (includesAny(['カラーチェンジ'])) return { kind: 'object', object: findObject('dresser'), label: 'ドレッサー', action: 'dresser_color' };
        if (includesAny(['オーラ'])) return { kind: 'object', object: findObject('dresser'), label: 'ドレッサー', action: 'dresser_aura' };
        if (includesAny(['ドレッサー', '鏡', '着替え'])) return { kind: 'object', object: findObject('dresser'), label: 'ドレッサー', action: 'dresser' };
        if (includesAny(['取り出す', '取出す', '出す'])) {
            const storageKind = selectRandomMyHomeStorage('withdraw');
            return storageKind ? { kind: 'object', object: findObject(storageKind), label: storageKind === 'warehouse' ? '倉庫' : storageKind === 'freezer' ? '冷凍庫' : '金庫', action: storageKind, transferMode: 'withdraw' } : { kind: 'storage_unavailable', mode: 'withdraw', label: '取り出す' };
        }
        if (includesAny(['アイテム'])) return { kind: 'object', object: findObject('warehouse'), label: '倉庫', action: 'warehouse', transferMode: 'deposit' };
        if (includesAny(['食べ物', '食材'])) return { kind: 'object', object: findObject('freezer'), label: '冷凍庫', action: 'freezer', transferMode: 'deposit' };
        if (includesAny(['お金', '資産'])) return { kind: 'object', object: findObject('safe'), label: '金庫', action: 'safe', transferMode: 'deposit' };
        if (includesAny(['入れる', 'しまう'])) {
            const storageKind = selectRandomMyHomeStorage('deposit');
            return storageKind ? { kind: 'object', object: findObject(storageKind), label: storageKind === 'warehouse' ? '倉庫' : storageKind === 'freezer' ? '冷凍庫' : '金庫', action: storageKind, transferMode: 'deposit' } : { kind: 'storage_unavailable', mode: 'deposit', label: 'しまう' };
        }
        if (includesAny(['倉庫'])) return { kind: 'object', object: findObject('warehouse'), label: '倉庫', action: 'upgrade_storage' };
        if (includesAny(['冷凍庫', '冷蔵庫'])) return { kind: 'object', object: findObject('freezer'), label: '冷凍庫', action: 'upgrade_storage' };
        if (includesAny(['金庫'])) return { kind: 'object', object: findObject('safe'), label: '金庫', action: 'upgrade_storage' };
        if (includesAny(['作戦', '会議', 'ホワイトボード', 'テーブル'])) return { kind: 'object', object: findObject('strategy_board'), label: '作戦会議', action: 'strategy' };
        return null;
    }

    function moveToCellAndRun(pos, label, afterMove) {
        const state = window.ensureMyHomeIndoorState();
        const path = findMyHomePath(state, state.player, pos);
        if (!path.length && (state.player.x !== pos.x || state.player.y !== pos.y)) {
            setMyHomeChatMessage(`${label}へ向かう道が見つかりません。`);
            return;
        }
        setMyHomeChatMessage(`${label}へ移動するよ。`);
        showMyHomeBubble(`${label}へ移動するよ`);
        addMyHomeLog(`${label}へ移動するよ`);
        moveMyHomePlayerTo(pos, path, afterMove);
    }

    function performMyHomeClean() {
        const state = window.ensureMyHomeIndoorState();
        window.spawnMyHomeDailyDrops();
        if (!state.drops.length) {
            state.environmentBonus = (state.environmentBonus || 0) + 1;
            incrementConciergeQuestValue(1);
            setMyHomeChatMessage('部屋を掃除しました。');
            showMyHomeBubble('部屋を掃除したよ！');
            addMyHomeLog('部屋を掃除したよ！');
            if (typeof saveGameData === 'function') saveGameData();
            renderMyHomeQuestHUD();
            return;
        }
        const drop = state.drops[0];
        moveToCellAndRun({ x: drop.x, y: drop.y, dir: 'down' }, '落ちているもの', () => {
            const idx = state.drops.findIndex(d => d && d.id === drop.id);
            if (idx >= 0) state.drops.splice(idx, 1);
            addInventoryItem(drop.itemId);
            state.environmentBonus = (state.environmentBonus || 0) + 1;
            incrementConciergeQuestValue(1);
            const name = getItemName(drop.itemId);
            setMyHomeChatMessage(`${name}を取得しました。`);
            showMyHomeBubble(`${name}を拾ったよ！`);
            addMyHomeLog(`${name}を拾ったよ！`);
            if (typeof saveGameData === 'function') saveGameData();
            window.renderMyHomeMap();
        });
    }

    function placeMyHomeFurniture(id, key, name, preferred, onPlaced) {
        const state = window.ensureMyHomeIndoorState();
        if ((state.objects || []).some(obj => obj && obj.id === id)) {
            setMyHomeChatMessage(`${name}はすでに配置されています。`);
            return true;
        }
        const candidates = preferred ? [preferred] : [];
        const randomCandidates = [];
        for (let y = 1; y < state.grid.length - 1; y++) {
            for (let x = 1; x < state.grid[y].length - 1; x++) randomCandidates.push({ x, y });
        }
        candidates.push(...shuffleMyHomeArray(randomCandidates));
        let placement = null;
        for (const pos of candidates) {
            if (!isMyHomeCellFree(state, pos.x, pos.y)) continue;
            const route = getReachableAdjacentStop(state, pos, [pos]);
            if (route) {
                placement = { pos, route };
                break;
            }
        }
        if (!placement) {
            setMyHomeChatMessage(`${name}を置ける場所がありません。`);
            return false;
        }
        const { pos, route } = placement;
        setMyHomeChatMessage(`${name}の配置場所の隣まで移動します。`);
        moveMyHomePlayerTo(route.stop, route.path, () => {
            state.objects.push({ id, key, x: pos.x, y: pos.y, name, level: 1 });
            state.environmentBonus = (state.environmentBonus || 0) + 1;
            setMyHomeChatMessage(`${name}を配置しました。`);
            showMyHomeBubble(`${name}を置いたよ！`);
            addMyHomeLog(`${name}を配置しました。`);
            if (typeof onPlaced === 'function') onPlaced(state.objects[state.objects.length - 1]);
            if (typeof saveGameData === 'function') saveGameData();
            window.renderMyHomeMap();
            renderMyHomeQuestHUD();
        });
        return true;
    }

    function performMyHomeBedAction() {
        const state = window.ensureMyHomeIndoorState();
        const bed = (state.objects || []).find(obj => obj && obj.id === 'bed');
        if (!bed) {
            placeMyHomeFurniture('bed', 'hfur_bed', 'ベッド', { x: 8, y: 6 });
            return;
        }
        const stop = { x: bed.x, y: bed.y, dir: 'right' };
        const path = findMyHomePath(state, state.player, stop);
        if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) {
            setMyHomeChatMessage('ベッドまで移動できません。');
            return;
        }
        moveMyHomePlayerTo(stop, path, () => {
            state.player.dir = 'right';
            if (window.aiPet) window.aiPet.myHomeDirection = 'right';
            startMyHomeScheduledAction('sleep', '睡眠', 60, 'bed');
        });
    }

    const MY_HOME_LIFE_PATHS = {
        mentor: { name: '後進の育成', icon: '🎓', caption: '🎓 弟子を指導中...', start: '後進を育てるため、指導を始めたよ！' },
        monument: { name: 'モニュメント建造', icon: '🏛️', caption: '🏛️ 生きた証を建造中...', start: '生きた証を残すため、モニュメントを造り始めたよ！' },
        seeker: { name: '限界突破の修練', icon: '🔥', caption: '🔥 限界を超える修練中...', start: '限界の先を目指して、修練を始めたよ！' },
        guardian: { name: '村の守護者', icon: '🛡️', caption: '🛡️ 村を見守り中...', start: '村の平和を守るため、見回りを始めたよ！' },
        author: { name: '秘伝書の執筆', icon: '📚', caption: '📚 秘伝書を執筆中...', start: '後世へ知識を残すため、秘伝書を書き始めたよ！' },
        slowlife: { name: 'スローライフ', icon: '🌿', caption: '🌿 のんびり余生を満喫中...', start: 'マイホームで、のんびり自分の時間を楽しむよ！' }
    };

    function getMyHomeLifePath(ai = window.aiPet || window.hero || {}) {
        return ai.lifePath || (ai.apprentice && ai.apprentice.lifePath) || '';
    }

    function getMyHomeActionTaskName(task) {
        if (!task) return '';
        if (typeof getTaskName === 'function') return getTaskName(task.type, task);
        const names = { sleep: '睡眠', eat: '食事', study: '勉強', train: '筋トレ', run: 'ランニング' };
        return names[task.type] || task.type;
    }

    function getMyHomeActionCaption(task) {
        if (!task) return '';
        const captions = {
            sleep: '💤 休憩中...',
            eat: '🍙 食事中...',
            study: '📖 勉強中...',
            train: '💪 筋トレ中...',
            run: '🏃 ランニング中...',
            life_mentor: MY_HOME_LIFE_PATHS.mentor.caption,
            life_monument: MY_HOME_LIFE_PATHS.monument.caption,
            life_seeker: MY_HOME_LIFE_PATHS.seeker.caption,
            life_guardian: MY_HOME_LIFE_PATHS.guardian.caption,
            life_author: MY_HOME_LIFE_PATHS.author.caption,
            life_slowlife: MY_HOME_LIFE_PATHS.slowlife.caption
        };
        return captions[task.type] || `${getMyHomeActionTaskName(task)}中...`;
    }

    function drawMyHomeActionFloatingTexts(actionCtx, centerX, centerY, ai) {
        const texts = typeof floatingTexts !== 'undefined' ? floatingTexts : window.floatingTexts;
        if (!Array.isArray(texts) || !ai) return;
        const aiX = Number(ai.x || 0);
        const aiY = Number(ai.y || 0);
        texts.forEach(ft => {
            if (!ft || ft.life <= 0) return;
            const offsetX = Number(ft.x || 0) - aiX;
            const offsetY = Number(ft.y || 0) - aiY;
            if (Math.abs(offsetX) > 180 || Math.abs(offsetY) > 160) return;
            actionCtx.save();
            actionCtx.globalAlpha = Math.max(0, Math.min(1, ft.life / 30));
            actionCtx.fillStyle = ft.color || '#fff';
            actionCtx.font = 'bold 18px sans-serif';
            actionCtx.textAlign = 'center';
            actionCtx.strokeStyle = '#000';
            actionCtx.lineWidth = 3;
            actionCtx.strokeText(ft.text || '', centerX + offsetX, centerY + offsetY);
            actionCtx.fillText(ft.text || '', centerX + offsetX, centerY + offsetY);
            actionCtx.restore();
        });
    }

    function drawMyHomeActionScene(actionCtx, actionWindow, task, ai) {
        const centerX = actionWindow.width / 2;
        const centerY = 104;
        const frameX = centerX - 150;
        const frameY = centerY - 100;
        const frameW = 300;
        const frameH = 200;
        const actionCatalog = typeof catalog !== 'undefined' ? catalog : window.catalog;
        const actionImages = typeof images !== 'undefined' ? images : window.images;
        const bgData = actionCatalog && actionCatalog.hut_room;
        const bgImage = bgData && actionImages ? actionImages[bgData.img] : null;

        actionCtx.save();
        actionCtx.beginPath();
        actionCtx.rect(frameX, frameY, frameW, frameH);
        actionCtx.clip();
        if (bgData && bgImage && bgImage.complete && bgImage.naturalWidth !== 0) {
            actionCtx.drawImage(bgImage, bgData.sx, bgData.sy, bgData.sw, bgData.sh, frameX, frameY, frameW, frameH);
        } else {
            actionCtx.fillStyle = '#455a64';
            actionCtx.fillRect(frameX, frameY, frameW, frameH);
        }
        actionCtx.restore();

        if (typeof window.drawActionCharacterOnContext === 'function') {
            window.drawActionCharacterOnContext(actionCtx, ai.visualAction || 'idle', centerX, centerY, ai);
        }
        actionCtx.strokeStyle = '#fff';
        actionCtx.lineWidth = 4;
        actionCtx.strokeRect(frameX, frameY, frameW, frameH);
        drawMyHomeActionFloatingTexts(actionCtx, centerX, centerY, ai);

        const caption = getMyHomeActionCaption(task);
        actionCtx.save();
        actionCtx.font = 'bold 16px sans-serif';
        actionCtx.textAlign = 'center';
        actionCtx.textBaseline = 'alphabetic';
        actionCtx.strokeStyle = '#000';
        actionCtx.lineWidth = 4;
        actionCtx.strokeText(caption, centerX, 228);
        actionCtx.fillStyle = '#FFC107';
        actionCtx.fillText(caption, centerX, 228);
        actionCtx.restore();
    }

    function renderMyHomeActionHUD() {
        const ui = document.getElementById('myhome-map-ui');
        if (!ui) return;
        let hud = document.getElementById('myhome-action-hud');
        const ai = window.aiPet || window.hero || {};
        const task = ai.schedule && ai.schedule[0] && ai.schedule[0].myHomeIndoor ? ai.schedule[0] : null;
        if (!task) {
            if (hud) hud.style.display = 'none';
            const actionWindow = document.getElementById('myhome-action-window');
            if (actionWindow) actionWindow.style.display = 'none';
            return;
        }
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'myhome-action-hud';
            hud.style.cssText = 'position:absolute;right:16px;top:242px;width:min(330px,calc(100vw - 32px));z-index:31;background:rgba(10,18,24,0.86);border:1px solid #00bcd4;border-radius:8px;padding:12px;box-shadow:0 0 14px rgba(0,188,212,0.25);font-family:sans-serif;';
            ui.appendChild(hud);
        }
        const maxTime = task.maxDuration || Math.max(1, task.duration || 1);
        const remain = Math.max(0, task.duration || 0);
        const pct = Math.max(0, Math.min(100, 100 - (remain / maxTime) * 100));
        hud.style.display = 'block';
        const isLifePathTask = String(task.type || '').startsWith('life_');
        hud.innerHTML = `
            <div style="color:#00e5ff;font-weight:bold;font-size:13px;margin-bottom:8px;">▶ CURRENT STATUS</div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <span style="font-weight:bold;color:#fff;">${getMyHomeActionTaskName(task)}</span>
                <span style="color:#ffc107;font-size:12px;font-weight:bold;background:rgba(255,193,7,0.18);padding:2px 8px;border-radius:10px;">⏳ 残り ${remain} 分</span>
            </div>
            <div style="margin-top:10px;background:#222;height:8px;border-radius:4px;overflow:hidden;border:1px solid #444;">
                <div style="background:linear-gradient(90deg,#00bcd4,#4fc3f7);width:${pct}%;height:100%;transition:width .5s;"></div>
            </div>
            ${isLifePathTask
                ? '<div style="margin-top:10px;color:#b39ddb;font-size:11px;text-align:right;">余生の行動は自動で続きます</div>'
                : '<div style="margin-top:12px;text-align:right;"><button type="button" onclick="window.cancelMyHomeAction && window.cancelMyHomeAction();" style="background:#d32f2f;color:#fff;border:1px solid #b71c1c;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;">■ 行動を中止する</button></div>'}
        `;
        renderMyHomeActionWindow();
    }

    window.renderMyHomeActionHUD = renderMyHomeActionHUD;

    function renderMyHomeLifePathHUD() {
        const ui = document.getElementById('myhome-map-ui');
        if (!ui) return;
        const ai = window.aiPet || window.hero || {};
        const app = ai.apprentice || {};
        const path = getMyHomeLifePath(ai);
        const isRetired = !!(path || app.isGraduated);
        let hud = document.getElementById('myhome-life-path-hud');
        if (!isRetired) {
            if (hud) hud.remove();
            return;
        }
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'myhome-life-path-hud';
            hud.style.cssText = 'position:absolute;left:16px;top:118px;width:min(330px,calc(100vw - 32px));z-index:25;background:rgba(24,14,36,0.9);border:2px solid #9c27b0;border-radius:8px;padding:11px;box-shadow:0 0 16px rgba(156,39,176,0.3);font-family:sans-serif;box-sizing:border-box;';
            ui.appendChild(hud);
        }
        const info = MY_HOME_LIFE_PATHS[path];
        const fastForwarding = !!window.isFastForwardLife;
        const titleText = app.title ? `称号：${app.title}` : '免許皆伝';
        hud.innerHTML = `
            <div style="color:#ffd54f;font-size:12px;font-weight:bold;">✨ ${titleText}</div>
            <div style="margin-top:5px;color:#fff;font-size:14px;font-weight:bold;">${info ? `${info.icon} 余生：${info.name}` : '🌟 これからの生き方を考えています'}</div>
            ${info ? `<button id="btn-myhome-fast-forward-life" type="button" onclick="window.toggleMyHomeLifeFastForward && window.toggleMyHomeLifeFastForward();" style="width:100%;margin-top:9px;padding:8px;border:1px solid rgba(255,255,255,.35);border-radius:6px;color:#fff;background:${fastForwarding ? 'linear-gradient(45deg,#f44336,#e91e63)' : 'linear-gradient(45deg,#673ab7,#9c27b0)'};font-weight:bold;cursor:pointer;">${fastForwarding ? '▶ 余生の早送りを止める' : '⏩ 余生を早送りする'}</button>` : ''}
        `;
    }

    window.renderMyHomeLifePathHUD = renderMyHomeLifePathHUD;
    window.toggleMyHomeLifeFastForward = function() {
        window.isFastForwardLife = !window.isFastForwardLife;
        renderMyHomeLifePathHUD();
        const normalButton = document.getElementById('btn-fast-forward-life');
        if (normalButton) {
            normalButton.innerHTML = window.isFastForwardLife ? '▶ 早送りを止める' : '⏩ 余生を早送りする';
            normalButton.style.background = window.isFastForwardLife
                ? 'linear-gradient(45deg, #F44336, #E91E63)'
                : 'linear-gradient(45deg, #673AB7, #9C27B0)';
        }
    };

    function renderMyHomeStatusBar() {
        const ui = document.getElementById('myhome-map-ui');
        const source = document.getElementById('aiStatus');
        if (!ui || !source) return;
        let bar = document.getElementById('myhome-status-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'myhome-status-bar';
            bar.style.cssText = 'position:absolute;left:16px;right:16px;top:50px;min-height:52px;z-index:23;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:5px 10px;box-sizing:border-box;background:rgba(8,10,12,0.9);border:1px solid #34383c;border-radius:7px;font-family:sans-serif;';
            ui.appendChild(bar);
        }
        const clone = source.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('#btn-fast-forward-life').forEach(el => el.remove());
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        clone.querySelectorAll('.online-indicator').forEach(el => el.remove());
        clone.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;width:100%;';
        bar.replaceChildren(...Array.from(clone.childNodes));
    }

    window.cancelMyHomeAction = function() {
        const ai = window.aiPet || window.hero || {};
        const task = ai.schedule && ai.schedule[0] && ai.schedule[0].myHomeIndoor ? ai.schedule[0] : null;
        if (!task) return;
        const label = getMyHomeActionTaskName(task) || '行動';
        ai.schedule.shift();
        ai.visualAction = null;
        ai.actionState = 'inside';
        ai.isIndoors = true;
        setMyHomeChatMessage(`${label}を中止しました。`);
        showMyHomeBubble(`${label}を中止したよ！`);
        addMyHomeLog(`${label}を中止しました。`);
        renderMyHomeActionHUD();
        if (typeof updateScheduleList === 'function') updateScheduleList();
        if (typeof saveGameData === 'function') saveGameData();
    };

    function renderMyHomeActionWindow() {
        const ui = document.getElementById('myhome-map-ui');
        const ai = window.aiPet || window.hero || {};
        const task = ai.schedule && ai.schedule[0] && ai.schedule[0].myHomeIndoor ? ai.schedule[0] : null;
        if (!ui || !task) return;

        let actionWindow = document.getElementById('myhome-action-window');
        if (!actionWindow) {
            actionWindow = document.createElement('canvas');
            actionWindow.id = 'myhome-action-window';
            actionWindow.width = 308;
            actionWindow.height = 244;
            actionWindow.style.cssText = 'position:absolute;left:50%;top:50%;width:308px;height:244px;transform:translate(-50%,-50%);z-index:30;pointer-events:none;image-rendering:auto;';
            ui.appendChild(actionWindow);
        }

        const actionCtx = actionWindow.getContext('2d');
        actionCtx.clearRect(0, 0, actionWindow.width, actionWindow.height);
        drawMyHomeActionScene(actionCtx, actionWindow, task, ai);
        actionWindow.style.display = 'block';
    }

    function ensureMyHomeLifePathTask() {
        if (!window.myHomeMapOpen || window.isGamePaused) return false;
        const ai = window.aiPet || window.hero || {};
        const path = getMyHomeLifePath(ai);
        if (!path || !MY_HOME_LIFE_PATHS[path] || ai.isReincarnating || ai._lifePathEventPending) return false;
        if (document.getElementById('in-game-tutorial')) return false;
        const encounter = document.getElementById('encounterOverlay');
        const exam = document.getElementById('examOverlay');
        const examOpen = exam && (exam.classList.contains('active') || exam.style.display === 'flex' || exam.style.display === 'block');
        if ((encounter && encounter.classList.contains('active')) || examOpen) return false;
        if (!Array.isArray(ai.schedule)) ai.schedule = [];

        const existingTask = ai.schedule[0];
        if (existingTask) {
            if (String(existingTask.type || '').startsWith('life_')) {
                existingTask.myHomeIndoor = true;
                existingTask.myHomeAction = existingTask.type;
                existingTask.maxDuration = existingTask.maxDuration || 150;
                ai.isIndoors = true;
                ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
            }
            return false;
        }
        if (path !== 'slowlife' && !ai.godMode && (Number(ai.energy || 0) < 20 || Number(ai.hunger || 0) < 20)) return false;

        const task = {
            type: `life_${path}`,
            duration: 150,
            maxDuration: 150,
            myHomeIndoor: true,
            myHomeAction: `life_${path}`
        };
        ai.schedule.push(task);
        ai.isIndoors = true;
        ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
        if (typeof ai.processLifePathStart === 'function') ai.processLifePathStart(task);
        task._started = true;
        const info = MY_HOME_LIFE_PATHS[path];
        ai.message = info.start;
        ai.messageTimer = 150;
        setMyHomeChatMessage(info.start);
        showMyHomeBubble(info.start);
        addMyHomeLog(info.start, '余生');
        if (typeof updateScheduleList === 'function') updateScheduleList();
        if (typeof saveGameData === 'function') saveGameData();
        return true;
    }

    window.ensureMyHomeLifePathTask = ensureMyHomeLifePathTask;
    window.activateMyHomeLifePath = function(path) {
        const ai = window.aiPet || window.hero || {};
        if (!MY_HOME_LIFE_PATHS[path]) return false;
        ai.lifePath = path;
        if (ai.apprentice) ai.apprentice.lifePath = path;
        ai._lifePathEventPending = false;
        ai.schedule = [];
        ai.isIndoors = true;
        ai.actionState = 'inside';
        ai.visualAction = null;
        ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
        renderMyHomeLifePathHUD();
        const started = ensureMyHomeLifePathTask();
        renderMyHomeActionHUD();
        return started;
    };

    function ensureMyHomeActionHudTimer() {
        if (window.myHomeActionHudTimer) return;
        window.myHomeActionHudTimer = setInterval(() => {
            if (!window.myHomeMapOpen) {
                clearInterval(window.myHomeActionHudTimer);
                window.myHomeActionHudTimer = null;
                return;
            }
            ensureMyHomeLifePathTask();
            renderMyHomeActionHUD();
            renderMyHomeLifePathHUD();
            renderMyHomeStatusBar();
        }, 500);
    }

    function startMyHomeScheduledAction(type, label, duration = 60, myHomeAction = type) {
        const ai = window.aiPet || window.hero || {};
        if (!Array.isArray(ai.schedule)) ai.schedule = [];
        ai.schedule = ai.schedule.filter(task => !(task && task.myHomeIndoor && String(task.type || '').startsWith('life_')));
        const visualMap = { sleep: 'sleep', eat: 'eat_raw', study: 'study', train: 'train', run: 'move' };
        ai.schedule.unshift({
            type,
            duration,
            maxDuration: duration,
            myHomeIndoor: true,
            myHomeAction,
            _started: true
        });
        ai.isIndoors = true;
        ai.actionState = 'inside';
        ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
        ai.visualAction = visualMap[type] || 'idle';
        setMyHomeChatMessage(`${label}を始めます。`);
        showMyHomeBubble(`${label}するよ！`);
        addMyHomeLog(`${label}を始めました。`);
        renderMyHomeActionHUD();
        ensureMyHomeActionHudTimer();
        if (typeof updateUI === 'function') updateUI();
        if (typeof saveGameData === 'function') saveGameData();
    }

    function performMyHomeBasicAction(action, label) {
        if (action === 'bed') return performMyHomeBedAction();
        const pos = findEmptyMyHomeCell({ x: 7, y: 6 }) || findEmptyMyHomeCell();
        if (!pos) {
            setMyHomeChatMessage('空いている場所が見つかりません。');
            return;
        }
        const actionType = action === 'eat' ? 'eat' : (action === 'study' ? 'study' : (action === 'run' ? 'run' : 'train'));
        moveToCellAndRun({ x: pos.x, y: pos.y, dir: 'down' }, label, () => {
            startMyHomeScheduledAction(actionType, label, actionType === 'eat' ? 30 : 60, action);
        });
    }

    function syncMyHomeStorageQuestProgress(ai) {
        const flags = ai.myHomeQuestStorageDeposits || {};
        const value = (flags.warehouse ? 1 : 0) + (flags.freezer ? 1 : 0);
        if (getCurrentConciergeQuest(3)) syncConciergeQuestValue(value);
    }

    function transferMyHomeSafe(mode, ui) {
        const ai = window.aiPet || window.hero || {};
        const storage = ensureHutStorage();
        const box = storage && storage.safe;
        if (!box) return false;
        const intel = Math.max(0, Number(ai.stats && ai.stats.intel || 0));
        const smartChance = intel / (intel + 100);
        const reserve = Math.max(100, Math.min(10000, Math.floor(Math.sqrt(Math.max(1, intel)) * 100)));
        if (mode === 'withdraw') {
            if ((box.gold || 0) <= 0) {
                setMyHomeChatMessage('金庫に取り出せるGoldがありません。');
                return false;
            }
            const smartAmount = Math.max(1, Math.floor(ai.gold || 0) < reserve ? reserve - Math.floor(ai.gold || 0) : Math.floor(reserve * 0.1));
            const randomAmount = 1 + Math.floor(Math.random() * Math.max(1, box.gold || 0));
            const amount = Math.min(box.gold || 0, Math.random() < smartChance ? smartAmount : randomAmount);
            box.gold -= amount;
            ai.gold = (ai.gold || 0) + amount;
            setMyHomeChatMessage(`${amount}Gを金庫から取り出しました。`);
            showMyHomeBubble(`${amount}Gを持っていくよ！`);
            addMyHomeLog(`${amount}Gを金庫から取り出しました。`);
            return true;
        }
        if ((ai.gold || 0) <= 0) {
            setMyHomeChatMessage('預けられるGoldがありません。');
            return false;
        }
        const free = Math.max(0, (box.capacity || 0) - (box.gold || 0));
        if (free <= 0) {
            const reason = '金庫の枠を拡張しないと、しまえないみたい。';
            setMyHomeChatMessage(reason);
            if (ui) ui.dataset.fullReason = reason;
            return false;
        }
        const smartAmount = Math.max(0, Math.floor(ai.gold || 0) - reserve);
        const randomAmount = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(ai.gold || 0)));
        const amount = Math.min(free, Math.floor(ai.gold || 0), Math.random() < smartChance ? smartAmount : randomAmount);
        if (amount <= 0) {
            setMyHomeChatMessage(`手持ちに${reserve}Gほど残したいので、今は預けないようです。`);
            return false;
        }
        ai.gold -= amount;
        box.gold = (box.gold || 0) + amount;
        ai.myHomeQuestSafeDeposit = true;
        setMyHomeChatMessage(`${amount}Gを金庫に預けました。`);
        showMyHomeBubble(`${amount}Gを預けたよ！`);
        addMyHomeLog(`${amount}Gを金庫に預けました。`);
        return true;
    }

    function transferMyHomeStorage(kind, mode = 'deposit') {
        const ui = openMyHomeStoragePanel(kind);
        const storage = ensureHutStorage();
        const ai = window.aiPet || window.hero || {};
        if (!storage) return;
        let changed = false;
        if (kind === 'safe') {
            changed = transferMyHomeSafe(mode, ui);
        } else {
            const box = storage[kind];
            const label = kind === 'warehouse' ? '倉庫' : '冷凍庫';
            if (mode === 'withdraw') {
                const entries = (box.items || []).map((item, index) => ({ item, index }));
                const selected = getMyHomeSmartChoice(entries, entry => kind === 'warehouse' ? getMyHomeItemValue(entry.item) : getMyHomeItemAge(entry.item), false);
                if (!selected) {
                    setMyHomeChatMessage(`${label}は空です。`);
                } else {
                    const [item] = box.items.splice(selected.index, 1);
                    if (!Array.isArray(ai.inventory)) ai.inventory = [];
                    ai.inventory.push(item);
                    const itemName = getItemName(item);
                    setMyHomeChatMessage(`${itemName}を${label}から取り出しました。`);
                    showMyHomeBubble(`${itemName}を取り出したよ！`);
                    addMyHomeLog(`${itemName}を${label}から取り出しました。`);
                    changed = true;
                }
            } else {
                const candidates = (ai.inventory || []).map((item, index) => ({ item, index })).filter(entry => kind === 'freezer' ? isMyHomeFoodItem(entry.item) : !isMyHomeFoodItem(entry.item));
                if (!box || (box.level || 0) <= 0 || (box.items || []).length >= (box.capacity || 0)) {
                    const reason = `${label}の枠を拡張しないと、しまえないみたい。`;
                    setMyHomeChatMessage(reason);
                    if (ui) ui.dataset.fullReason = reason;
                } else {
                    const selected = getMyHomeSmartChoice(candidates, entry => kind === 'warehouse' ? getMyHomeItemValue(entry.item) : getMyHomeItemAge(entry.item), true);
                    if (!selected) {
                        setMyHomeChatMessage(kind === 'freezer' ? 'しまえる食べ物を持っていません。' : 'しまえるアイテムを持っていません。');
                    } else {
                        const [item] = ai.inventory.splice(selected.index, 1);
                        box.items.push(item);
                        if (!ai.myHomeQuestStorageDeposits) ai.myHomeQuestStorageDeposits = {};
                        ai.myHomeQuestStorageDeposits[kind] = true;
                        syncMyHomeStorageQuestProgress(ai);
                        const itemName = getItemName(item);
                        setMyHomeChatMessage(`${itemName}を${label}に入れました。`);
                        showMyHomeBubble(`${itemName}をしまったよ！`);
                        addMyHomeLog(`${itemName}を${label}に収納しました。`);
                        changed = true;
                    }
                }
            }
        }
        if (changed) openMyHomeStoragePanel(kind);
        if (typeof saveGameData === 'function') saveGameData();
        renderMyHomeInventoryPanel();
        renderMyHomeQuestHUD();
    }

    function getMyHomeUpgradeMaterialStatus(upgradeData, inventory = []) {
        const counts = {};
        inventory.forEach(item => {
            const id = getItemId(item);
            if (id) counts[id] = (counts[id] || 0) + 1;
        });
        const missing = [];
        Object.entries(upgradeData && upgradeData.materials || {}).forEach(([id, required]) => {
            const shortage = Math.max(0, Number(required || 0) - Number(counts[id] || 0));
            if (shortage > 0) missing.push(`${getItemName(id)} x${shortage}`);
        });
        return { canUpgrade: !!upgradeData && missing.length === 0, missing };
    }

    function startMyHomeStorageUpgrade(kind, label, options = {}) {
        const ai = window.aiPet || window.hero || {};
        const upgradeData = typeof buildingCatalog !== 'undefined' ? buildingCatalog[kind] : null;
        const materialStatus = getMyHomeUpgradeMaterialStatus(upgradeData, ai.inventory || []);
        if (!materialStatus.canUpgrade) {
            const message = upgradeData
                ? `${label}の拡張素材が足りないみたい。（不足: ${materialStatus.missing.join('、')}）`
                : `${label}の拡張方法が見つかりません。`;
            setMyHomeChatMessage(message);
            showMyHomeBubble(message, '#ff9800', 4200);
            addMyHomeLog(message);
            return;
        }
        const task = { type: 'build', targetBuilding: kind, duration: 60, maxDuration: 60 };
        if (typeof ai.processBuildingStart !== 'function' || !ai.processBuildingStart(task)) {
            const message = ai.message || `${label}を拡張する素材が足りないみたい。`;
            setMyHomeChatMessage(message);
            showMyHomeBubble(message, '#ff9800', 3600);
            addMyHomeLog(message);
            return;
        }
        if (!Array.isArray(ai.schedule)) ai.schedule = [];
        ai.schedule = ai.schedule.filter(scheduled => !(scheduled && scheduled.myHomeIndoor && String(scheduled.type || '').startsWith('life_')));
        const storage = ensureHutStorage();
        Object.assign(task, {
            myHomeIndoor: true,
            myHomeAction: options.myHomeAction || `upgrade_${kind}`,
            myHomeFurnitureId: kind,
            myHomeFurnitureName: label,
            myHomeUpgradeStartLevel: storage && storage[kind] ? Number(storage[kind].level || 0) : 0,
            myHomeQuestFurnitureUpgrade: !!options.questUpgrade,
            _started: true
        });
        ai.schedule.unshift(task);
        ai.isIndoors = true;
        ai.actionState = 'inside';
        ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
        ai.visualAction = 'build';
        setMyHomeChatMessage(`${label}の拡張を始めます。`);
        showMyHomeBubble(`${label}を拡張するよ！`);
        addMyHomeLog(`${label}の拡張を始めました。`);
        renderMyHomeActionHUD();
        ensureMyHomeActionHudTimer();
        if (typeof updateScheduleList === 'function') updateScheduleList();
        if (typeof saveGameData === 'function') saveGameData();
    }

    function askMyHomeDresserChoice() {
        const state = window.ensureMyHomeIndoorState();
        state.pendingDresserChoice = true;
        const message = 'カラーチェンジとオーラ、どちらにする？';
        setMyHomeChatMessage(message);
        showMyHomeBubble(message, '#ff80ab', 6000);
        addMyHomeLog(message);
        if (typeof saveGameData === 'function') saveGameData();
    }

    function openMyHomeDresserMode(mode) {
        const state = window.ensureMyHomeIndoorState();
        state.pendingDresserChoice = false;
        setMyHomeChatMessage(mode === 'aura' ? 'オーラの調整画面を開きます。' : 'カラーチェンジ画面を開きます。');
        if (typeof window.openHairdresserUI === 'function') window.openHairdresserUI(mode);
    }

    function performMyHomeObjectAction(target) {
        if (!target || !target.object) return;
        if (target.action === 'upgrade_storage') {
            startMyHomeStorageUpgrade(target.object.id, target.label);
        } else if (target.action === 'warehouse' || target.action === 'freezer' || target.action === 'safe') {
            transferMyHomeStorage(target.action, target.transferMode || 'deposit');
        } else if (target.action === 'dresser_color') {
            openMyHomeDresserMode('color');
        } else if (target.action === 'dresser_aura') {
            openMyHomeDresserMode('aura');
        } else if (target.action === 'dresser') {
            askMyHomeDresserChoice();
        } else if (target.action === 'strategy') {
            const ai = window.aiPet || window.hero || {};
            const learnedWords = ai.apprentice && Array.isArray(ai.apprentice.learnedWords) ? ai.apprentice.learnedWords : [];
            const dungeonWords = Array.isArray(window.DUNGEON_AVAILABLE_COMMANDS) ? window.DUNGEON_AVAILABLE_COMMANDS.map(c => c.name) : [];
            const hasAllDungeonWords = dungeonWords.length > 0 && dungeonWords.every(word => learnedWords.includes(word));
            const knowsStrategy = learnedWords.includes('作戦');
            if (!hasAllDungeonWords || !knowsStrategy) {
                const msg = '作戦会議には、ダンジョンで使う言葉と「作戦」の言葉が必要みたい。先にダンジョンで覚えてこよう。';
                setMyHomeChatMessage(msg);
                showMyHomeBubble(msg, '#ff9800', 4200);
                addMyHomeLog(msg);
                return;
            }
            setMyHomeChatMessage('作戦会議を開きます。');
            showMyHomeBubble('作戦を考えるよ！');
            addMyHomeLog('作戦会議を開きました。');
            window._myHomeWaitingDungeonTacticSave = true;
            if (typeof window.openDungeonTacticEditor === 'function') window.openDungeonTacticEditor();
            setTimeout(() => {
                bringMyHomeDialogueToFront();
                const ui = document.getElementById('dungeon-tactic-editor-ui');
                if (ui) ui.style.zIndex = '140000';
            }, 80);
            return;
            const aiAfterStrategyReturn = window.aiPet || window.hero || {};
            aiAfterStrategyReturn.myHomeTacticCreated = true;
            setMyHomeChatMessage('作戦会議を開きます。');
            showMyHomeBubble('作戦を考えるよ！');
            addMyHomeLog('作戦会議を開きました。');
            if (typeof window.openDungeonTacticEditor === 'function') window.openDungeonTacticEditor();
            setTimeout(bringMyHomeDialogueToFront, 80);
        } else {
            setMyHomeChatMessage(`${target.label}に到着しました。`);
        }
        renderMyHomeQuestHUD();
    }

    function performMyHomeUpgrade() {
        const state = window.ensureMyHomeIndoorState();
        const ai = window.aiPet || window.hero || {};
        const candidates = (state.objects || []).filter(obj => {
            const data = obj && typeof buildingCatalog !== 'undefined' ? buildingCatalog[obj.id] : null;
            return !!(data && data.isUpgrade && getMyHomeUpgradeMaterialStatus(data, ai.inventory || []).canUpgrade);
        });
        const target = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
        if (!target) {
            const message = '今の素材でアップグレードできる家具はないみたい。必要な素材を集めてから、もう一度試そう！';
            setMyHomeChatMessage(message);
            showMyHomeBubble(message, '#ff9800', 4200);
            addMyHomeLog(message);
            return;
        }
        const route = getReachableAdjacentStop(state, target);
        if (!route) return;
        moveMyHomePlayerTo(route.stop, route.path, () => {
            startMyHomeStorageUpgrade(target.id, target.name || target.id, {
                myHomeAction: `upgrade_random_${target.id}`,
                questUpgrade: true
            });
        });
    }

    window.finishMyHomeFurnitureUpgrade = function(task) {
        if (!task || !task._hasBeenBuilt || !task.myHomeFurnitureId) return false;
        const state = window.ensureMyHomeIndoorState();
        const storage = ensureHutStorage();
        const kind = task.myHomeFurnitureId;
        const startLevel = Number(task.myHomeUpgradeStartLevel || 0);
        const completedLevel = storage && storage[kind] ? Number(storage[kind].level || 0) : startLevel;
        if (completedLevel <= startLevel) return false;

        const target = (state.objects || []).find(obj => obj && obj.id === kind);
        if (target) target.level = Math.max(Number(target.level || 1), completedLevel);

        if (task.myHomeQuestFurnitureUpgrade) {
            const ai = window.aiPet || window.hero || {};
            ai.myHomeFurnitureUpgradedAfterQuest = true;
            state.environmentBonus = (state.environmentBonus || 0) + 2;
            const quest = getCurrentConciergeQuest(7);
            if (quest) {
                quest.qVal = 1;
                if (ai.apprentice) ai.apprentice.qVal = 1;
            }
        }

        if (typeof saveGameData === 'function') saveGameData();
        window.renderMyHomeMap();
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        renderMyHomeQuestHUD();
        return true;
    };

    function placeMyHomeDecor(kind) {
        const itemId = kind === 'candle' ? 'item_candle' : 'item_plant';
        const key = kind === 'candle' ? 'hfur_candle' : 'hfur_plant';
        const name = kind === 'candle' ? 'キャンドル' : '観葉植物';
        const state = window.ensureMyHomeIndoorState();
        if ((state.objects || []).some(obj => obj && obj.id === `decor_${kind}`)) {
            state.decorQuest[kind] = true;
            setMyHomeChatMessage(`${name}はすでに配置されています。`);
            return;
        }
        const removed = removeInventoryItem(itemId);
        if (!removed) {
            setMyHomeChatMessage(`${name}を持っていません。`);
            return;
        }
        const ok = placeMyHomeFurniture(`decor_${kind}`, key, name, null, decor => {
            decor.blocksMovement = true;
            state.decorQuest[kind] = true;
            if (typeof saveGameData === 'function') saveGameData();
            renderMyHomeQuestHUD();
        });
        if (!ok) {
            addInventoryItem(itemId);
        }
    }

    function handleMyHomeAction(target) {
        if (target.action === 'clean') return performMyHomeClean();
        if (target.action === 'bed') return performMyHomeBedAction();
        if (target.action === 'eat' || target.action === 'study' || target.action === 'train' || target.action === 'run') return performMyHomeBasicAction(target.action, target.label || 'アクション');
        if (target.action === 'upgrade') return performMyHomeUpgrade();
        if (target.action === 'place_plant') return placeMyHomeDecor('plant');
        if (target.action === 'place_candle') return placeMyHomeDecor('candle');
        if (target.action === 'hospitality') return performMyHomeHospitality();
    }

    function findMyHomeHospitalityFood() {
        const ai = window.aiPet || window.hero || {};
        const inv = Array.isArray(ai.inventory) ? ai.inventory : [];
        const catalog = getMyHomeItemCatalog();
        const candidates = inv.map((item, index) => {
            const id = getItemId(item);
            const data = catalog && catalog[id] || {};
            const name = getItemName(item);
            const isPrepared = data.type === 'dish' || /^food_practice_(normal|great)$/.test(id) || ['item_bread', 'item_lunchbox'].includes(id);
            const isBad = data.quality === 'bad' || /rotten|spoiled|burnt|dead_crop|eaten_crop|trash/i.test(id) || /腐|焦げ|枯れた|食べられた|ゴミ/.test(name);
            if (!isPrepared || isBad) return null;
            const dishBonus = data.type === 'dish' ? 100000 : 0;
            return { item, index, score: dishBonus + getMyHomeItemValue(item) };
        }).filter(Boolean);
        return candidates.reduce((best, entry) => !best || entry.score > best.score ? entry : best, null);
    }

    function getMyHomeHospitalityRoute(state, visitor) {
        const candidates = [
            { x: visitor.x + 1, y: visitor.y, dir: 'left' },
            { x: visitor.x, y: visitor.y - 1, dir: 'down' },
            { x: visitor.x - 1, y: visitor.y, dir: 'right' },
            { x: visitor.x, y: visitor.y + 1, dir: 'up' }
        ];
        let best = null;
        candidates.forEach(stop => {
            if (stop.x < 0 || stop.y < 0 || stop.y >= state.grid.length || stop.x >= state.grid[stop.y].length) return;
            if (state.grid[stop.y][stop.x] === 1) return;
            if ((state.objects || []).some(obj => obj && obj.x === stop.x && obj.y === stop.y)) return;
            if (state.concierge && state.concierge.x === stop.x && state.concierge.y === stop.y) return;
            const path = findMyHomePath(state, state.player, stop);
            if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) return;
            if (!best || path.length < best.path.length) best = { stop, path };
        });
        return best;
    }

    function performMyHomeHospitality() {
        const state = window.ensureMyHomeIndoorState();
        maybeSpawnMyHomeVisitor();
        const visitor = normalizeMyHomeVisitorState(state);
        if (!visitor) {
            setMyHomeChatMessage('まだ来客はいません。環境スコアを高めて待ちましょう。');
            return;
        }
        if (visitor.status === 'arriving') {
            setMyHomeChatMessage('来客を席へご案内しています。席に着くまで少しお待ちください。');
            return;
        }
        if (visitor.status === 'eating') {
            setMyHomeChatMessage('来客は料理を楽しんでいます。');
            return;
        }
        if (visitor.status === 'departing') {
            setMyHomeChatMessage('来客を入り口までお見送りしています。');
            return;
        }
        const foodEntry = findMyHomeHospitalityFood();
        if (!foodEntry) {
            setMyHomeChatMessage('来客に提供できる品質の料理がありません。料理を一皿用意しましょう。');
            return;
        }
        const serviceRoute = getMyHomeHospitalityRoute(state, visitor);
        if (!serviceRoute) {
            setMyHomeChatMessage('来客のそばまで移動できません。通路を確認してください。');
            return;
        }
        moveMyHomePlayerTo(serviceRoute.stop, serviceRoute.path, () => {
            const foodId = getItemId(foodEntry.item);
            const removed = removeInventoryItem(foodId);
            if (!removed) {
                setMyHomeChatMessage('提供する料理が見つかりませんでした。');
                return;
            }
            const leaveAt = Date.now() + VISITOR_MEAL_MS;
            state.tableDish = { x: 5, y: 5, itemId: foodId, until: leaveAt };
            visitor.status = 'eating';
            visitor.seated = true;
            visitor.leaveAt = leaveAt;
            visitor.order = foodId;
            setMyHomeChatMessage(`${getItemName(foodId)}を提供しました。来客が料理を楽しんでいます。`);
            showMyHomeBubble('お料理をどうぞ！');
            addMyHomeLog(`${getItemName(foodId)}を提供しました。`);
            if (typeof saveGameData === 'function') saveGameData();
            window.renderMyHomeMap();
        });
    }

    function getReachableAdjacentStop(state, target, extraBlocked = []) {
        if (!target) return null;
        const candidates = [
            { x: target.x, y: target.y + 1, dir: 'up' },
            { x: target.x + 1, y: target.y, dir: 'left' },
            { x: target.x - 1, y: target.y, dir: 'right' },
            { x: target.x, y: target.y - 1, dir: 'down' }
        ];
        let best = null;
        candidates.forEach(stop => {
            const isCurrentCell = state.player.x === stop.x && state.player.y === stop.y;
            if (!isCurrentCell && !isMyHomeCellFree(state, stop.x, stop.y)) return;
            const path = findMyHomePath(state, state.player, stop, extraBlocked);
            if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) return;
            if (!best || path.length < best.path.length) best = { stop, path };
        });
        return best;
    }

    function moveMyHomePlayerTo(stop, path, afterMove) {
        const state = window.ensureMyHomeIndoorState();
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        let route = Array.isArray(path) ? path : findMyHomePath(state, state.player, stop);
        let pathIndex = 0;
        if (window.aiPet) {
            window.aiPet.myHomeMoving = true;
            window.aiPet.myHomeDirection = state.player.dir;
            window.aiPet.visualAction = 'move';
        }
        window.renderMyHomeMap();
        window.myHomeMoveTimer = setInterval(() => {
            const p = state.player;
            if ((p.x === stop.x && p.y === stop.y) || pathIndex >= route.length) {
                clearInterval(window.myHomeMoveTimer);
                window.myHomeMoveTimer = null;
                p.dir = stop.dir || p.dir || 'down';
                if (window.aiPet) {
                    window.aiPet.myHomeMoving = false;
                    window.aiPet.myHomeDirection = p.dir;
                    window.aiPet.visualAction = 'idle';
                }
                window.renderMyHomeMap();
                if (typeof afterMove === 'function') setTimeout(afterMove, 120);
                return;
            }
            const next = route[pathIndex];
            if (state.visitor && next && state.visitor.x === next.x && state.visitor.y === next.y) return;
            pathIndex += 1;
            p.dir = getMyHomeStepDir(p, next);
            p.x = next.x;
            p.y = next.y;
            if (window.aiPet) {
                window.aiPet.myHomeDirection = p.dir;
                window.aiPet.visualAction = 'move';
            }
            window.renderMyHomeMap();
        }, 220);
    }

    function handleMyHomeChat(forcedText) {
        const input = document.getElementById('myhome-chat-input');
        if (!input) return;
        const rawText = String(forcedText !== undefined ? forcedText : input.value).trim();
        if (!rawText) return;
        window._blockChatFocus = true;
        if (forcedText === undefined) input.value = '';
        if (forgetMyHomeWord(rawText)) {
            input.focus();
            return;
        }
        const state = window.ensureMyHomeIndoorState();
        if (state.pendingDresserChoice) {
            if (rawText.includes('カラーチェンジ')) {
                state.pendingDresserChoice = false;
                const dresser = (state.objects || []).find(obj => obj && obj.id === 'dresser');
                performMyHomeObjectAction({ object: dresser, action: 'dresser_color', label: 'ドレッサー' });
                input.focus();
                return;
            }
            if (rawText.includes('オーラ')) {
                state.pendingDresserChoice = false;
                const dresser = (state.objects || []).find(obj => obj && obj.id === 'dresser');
                performMyHomeObjectAction({ object: dresser, action: 'dresser_aura', label: 'ドレッサー' });
                input.focus();
                return;
            }
            state.pendingDresserChoice = false;
            addMyHomeLog('ドレッサーの指示待ちをキャンセルしました。');
        }
        const target = getMyHomeCommandTarget(rawText);
        const wordToRemember = target
            ? (target.kind === 'concierge' ? (target.action === 'clean' ? '掃除' : 'コンシェルジュ') : target.label)
            : rawText;
        rememberMyHomeWord(wordToRemember);
        if (!target) {
            input.focus();
            return;
        }
        if (target.kind === 'storage_unavailable') {
            const message = target.mode === 'withdraw'
                ? '中身が入っている収納がありません。'
                : '今しまえる空き収納、アイテム、食べ物、Goldの組み合わせがありません。';
            setMyHomeChatMessage(message);
            showMyHomeBubble(message, '#ff9800', 3600);
            addMyHomeLog(message);
            input.focus();
            return;
        }
        if (target.kind === 'panel') {
            const panel = document.getElementById(target.panel === 'log' ? 'myhome-log-panel' : 'myhome-inventory-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if (target.panel === 'log') renderMyHomeLogPanel();
            if (target.panel === 'inventory') renderMyHomeInventoryPanel();
            input.focus();
            return;
        }
        if (target.kind === 'action') {
            handleMyHomeAction(target);
            input.focus();
            return;
        }
        if (target.object) {
            const route = getReachableAdjacentStop(state, target.object);
            if (!route) {
                setMyHomeChatMessage('そこへ向かう道が見つかりません。');
            } else {
                setMyHomeChatMessage(`${target.label}へ移動するよ。`);
                showMyHomeBubble(`${target.label}へ移動するよ`);
                addMyHomeLog(`${target.label}へ移動するよ`);
                moveMyHomePlayerTo(route.stop, route.path, () => performMyHomeObjectAction(target));
            }
            input.focus();
            return;
        }
        if (target.kind === 'concierge') {
            const concierge = state.concierge || { x: 5, y: 3 };
            const stop = { x: concierge.x, y: concierge.y + 1, dir: 'up' };
            const path = findMyHomePath(state, state.player, stop);
            setMyHomeChatMessage('コンシェルジュのところへ向かいます。');
            moveMyHomePlayerTo(stop, path, () => runMyHomeConciergeAction(target.action || 'visit'));
        } else if (target.object) {
            const route = getReachableAdjacentStop(state, target.object);
            if (!route) {
                setMyHomeChatMessage('そこへ向かう道が見つかりません。');
            } else {
                setMyHomeChatMessage(`${target.label}のところへ向かいます。`);
                moveMyHomePlayerTo(route.stop, route.path, () => setMyHomeChatMessage(`${target.label}に到着しました。`));
            }
        }
        input.focus();
    }

    function setupMyHomeChatUI(ui) {
        if (!ui || ui._myHomeChatReady) {
            renderMyHomeWordsPanel();
            return;
        }
        ui._myHomeChatReady = true;
        const input = ui.querySelector('#myhome-chat-input');
        const send = ui.querySelector('#myhome-chat-send');
        const toggle = ui.querySelector('#myhome-words-toggle');
        const close = ui.querySelector('#myhome-words-close');
        const panel = ui.querySelector('#myhome-words-panel');
        const topBar = ui.firstElementChild;
        const exitButton = topBar ? topBar.querySelector('button') : null;
        const stopMainFocus = e => {
            window._blockChatFocus = true;
            e.stopPropagation();
        };
        if (topBar && exitButton && !document.getElementById('myhome-log-toggle')) {
            const actions = document.createElement('div');
            actions.style.cssText = 'display:flex;align-items:center;gap:8px;';
            const logBtn = document.createElement('button');
            logBtn.id = 'myhome-log-toggle';
            logBtn.type = 'button';
            logBtn.textContent = '会話ログ';
            logBtn.style.cssText = 'background:#2d4f6c;color:#fff;border:1px solid #8fb9e0;border-radius:6px;padding:6px 10px;cursor:pointer;';
            const invBtn = document.createElement('button');
            invBtn.id = 'myhome-inventory-toggle';
            invBtn.type = 'button';
            invBtn.textContent = '持ち物';
            invBtn.style.cssText = 'background:#4f5f2d;color:#fff;border:1px solid #d2d68c;border-radius:6px;padding:6px 10px;cursor:pointer;';
            exitButton.parentNode.insertBefore(actions, exitButton);
            actions.appendChild(logBtn);
            actions.appendChild(invBtn);
            actions.appendChild(exitButton);
            logBtn.addEventListener('click', e => {
                stopMainFocus(e);
                const logPanel = document.getElementById('myhome-log-panel');
                if (logPanel) logPanel.style.display = logPanel.style.display === 'none' ? 'block' : 'none';
                renderMyHomeLogPanel();
            });
            invBtn.addEventListener('click', e => {
                stopMainFocus(e);
                const invPanel = document.getElementById('myhome-inventory-panel');
                if (invPanel) invPanel.style.display = invPanel.style.display === 'none' ? 'block' : 'none';
                renderMyHomeInventoryPanel();
            });
        }
        if (!document.getElementById('myhome-log-panel')) {
            const logPanel = document.createElement('div');
            logPanel.id = 'myhome-log-panel';
            logPanel.style.cssText = 'display:none;position:absolute;right:16px;top:104px;width:min(430px,calc(100vw - 32px));max-height:48vh;overflow:auto;z-index:30;background:rgba(20,18,24,0.82);border:1px solid rgba(143,185,224,0.55);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font-size:12px;line-height:1.5;';
            ui.appendChild(logPanel);
        }
        if (!document.getElementById('myhome-inventory-panel')) {
            const invPanel = document.createElement('div');
            invPanel.id = 'myhome-inventory-panel';
            invPanel.style.cssText = 'display:none;position:absolute;left:16px;top:58px;width:min(320px,calc(100vw - 32px));max-height:52vh;overflow:auto;z-index:30;background:rgba(20,18,24,0.78);border:1px solid rgba(210,214,140,0.55);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);font-size:12px;line-height:1.5;';
            ui.appendChild(invPanel);
        }
        if (input) {
            input.addEventListener('mousedown', stopMainFocus, true);
            input.addEventListener('focus', () => { window._blockChatFocus = true; });
            input.addEventListener('keydown', e => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleMyHomeChat();
                }
            });
        }
        if (send) send.addEventListener('click', e => { stopMainFocus(e); handleMyHomeChat(); });
        if (toggle) toggle.addEventListener('click', e => {
            stopMainFocus(e);
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            renderMyHomeWordsPanel();
            if (input) input.focus();
        });
        if (close) close.addEventListener('click', e => {
            stopMainFocus(e);
            if (panel) panel.style.display = 'none';
            if (input) input.focus();
        });
        renderMyHomeWordsPanel();
    }

    function runMyHomeEntryAction(action, entryOptions = {}) {
        if (!action || action === 'visit' || action === 'exam_finish') {
            window.startMyHomeMoveToConcierge(action || 'visit', { preservePosition: !!entryOptions.preservePosition });
            return;
        }
        if (action === 'clean') {
            performMyHomeClean();
            return;
        }
        const commandByAction = {
            warehouse: '倉庫',
            freezer: '冷凍庫',
            safe: '金庫',
            store_item: 'アイテム',
            store_food: '食べ物',
            store_money: 'お金',
            store_random: '入れる',
            withdraw_random: '取り出す',
            dresser: 'ドレッサー',
            dresser_color: 'カラーチェンジ',
            dresser_aura: 'オーラ',
            strategy: '作戦会議',
            bed: '睡眠',
            eat: '食事',
            study: '勉強',
            train: '筋トレ',
            run: 'ランニング',
            upgrade: 'アップグレード'
        };
        handleMyHomeChat(commandByAction[action] || action);
    }

    window.closeMyHomeMapUI = function() {
        const ai = window.aiPet || window.hero || {};
        const hadActiveTask = Array.isArray(ai.schedule) && ai.schedule.some(task => task && task.myHomeIndoor);
        if (Array.isArray(ai.schedule)) ai.schedule = ai.schedule.filter(task => !(task && task.myHomeIndoor));
        ai.visualAction = null;
        ai.isIndoors = false;
        ai.actionState = 'idle';
        ai.indoorTarget = null;
        const state = ai.myHomeIndoor;
        if (state) state.pendingDresserChoice = false;
        ['myhome-storage-detail-ui', 'hairdresser-ui'].forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) overlay.remove();
        });
        const ui = document.getElementById('myhome-map-ui');
        if (ui) ui.remove();
        window.myHomeMapOpen = false;
        window._blockChatFocus = false;
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        window.myHomeMoveTimer = null;
        if (window.myHomeVisitorTimer) clearInterval(window.myHomeVisitorTimer);
        window.myHomeVisitorTimer = null;
        if (window.myHomeActionHudTimer) clearInterval(window.myHomeActionHudTimer);
        window.myHomeActionHudTimer = null;
        if (hadActiveTask && typeof updateScheduleList === 'function') updateScheduleList();
        if (typeof updateUI === 'function') updateUI();
        if (typeof saveGameData === 'function') saveGameData();
    };

    window.prepareMyHomeForReincarnation = function() {
        ['myhome-storage-detail-ui', 'hairdresser-ui'].forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) overlay.remove();
        });
        const ui = document.getElementById('myhome-map-ui');
        if (ui) ui.remove();
        window.myHomeMapOpen = false;
        window._blockChatFocus = false;
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        if (window.myHomeVisitorTimer) clearInterval(window.myHomeVisitorTimer);
        if (window.myHomeActionHudTimer) clearInterval(window.myHomeActionHudTimer);
        window.myHomeMoveTimer = null;
        window.myHomeVisitorTimer = null;
        window.myHomeActionHudTimer = null;
        const ai = window.aiPet || window.hero || {};
        ai.myHomeMoving = false;
        ai.schedule = [];
        ai._stashedTasks = [];
        ai.pathQueue = [];
        ai.currentTask = null;
        ai.visualAction = null;
        ai.actionState = 'idle';
        ai.isIndoors = false;
        ai.indoorTarget = null;
        ai.interactionTarget = null;
        ai.exploreState = null;
        ai.fishingData = null;
        ai.visualScale = 1.0;
    };

    window.openMyHomeMapUI = function(options = {}) {
        if (!window.isMyHomeIndoorUnlocked()) return false;
        const state = window.ensureMyHomeIndoorState();
        let ui = document.getElementById('myhome-map-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'myhome-map-ui';
            ui.style.cssText = `
                position:fixed;
                inset:0;
                z-index:8990;
                background:#101018;
                color:#fff;
                display:flex;
                flex-direction:column;
                font-family:'MS Gothic', monospace;
            `;
            ui.innerHTML = `
                <div style="height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:#211b25;border-bottom:2px solid #6d5848;">
                    <div style="font-weight:bold;color:#f7e4ba;">マイホーム</div>
                    <button onclick="window.closeMyHomeMapUI()" style="background:#4b3740;color:#fff;border:1px solid #c8a96a;border-radius:6px;padding:6px 12px;cursor:pointer;">閉じる</button>
                </div>
                <div id="myhome-map-container" style="flex:1;position:relative;overflow:hidden;background:#17151b;">
                    <div id="myhome-grid" style="position:absolute;left:0;top:0;transform-origin:top left;"></div>
                </div>
                <div id="myhome-chat-panel" style="position:absolute;left:16px;bottom:16px;width:min(520px,calc(100vw - 32px));z-index:20;background:rgba(20,18,24,0.78);border:1px solid rgba(247,228,186,0.45);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);">
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="myhome-chat-input" autocomplete="off" placeholder="マイホームで話しかける..." style="flex:1;min-width:0;background:rgba(0,0,0,0.62);color:#fff;border:1px solid rgba(255,255,255,0.28);border-radius:6px;padding:9px 10px;font-size:14px;outline:none;">
                        <button id="myhome-chat-send" type="button" style="background:#2e8b57;color:#fff;border:0;border-radius:6px;padding:9px 14px;font-weight:bold;cursor:pointer;">送信</button>
                        <button id="myhome-words-toggle" type="button" style="background:rgba(255,255,255,0.14);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:6px;padding:9px 10px;cursor:pointer;">言葉</button>
                    </div>
                    <div id="myhome-chat-message" style="margin-top:6px;min-height:18px;color:#f7e4ba;font-size:12px;"></div>
                </div>
                <div id="myhome-words-panel" style="display:none;position:absolute;right:16px;bottom:16px;width:min(340px,calc(100vw - 32px));max-height:42vh;overflow:auto;z-index:21;background:rgba(20,18,24,0.72);border:1px solid rgba(247,228,186,0.45);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#f7e4ba;font-weight:bold;">
                        <span>覚えている言葉</span>
                        <button id="myhome-words-close" type="button" style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;line-height:1;">×</button>
                    </div>
                    <div id="myhome-words-list" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
                </div>
            `;
            document.body.appendChild(ui);
            const exitButton = ui.querySelector('button');
            setupMyHomeChatUI(ui);
            if (exitButton) exitButton.textContent = '出る';
        } else if (!document.getElementById('myhome-grid')) {
            const container = document.getElementById('myhome-map-container');
            if (container) {
                container.innerHTML = '<div id="myhome-grid" style="position:absolute;left:0;top:0;transform-origin:top left;"></div>';
            }
        }
        window.myHomeMapOpen = true;
        window._blockChatFocus = true;
        if (typeof window.spawnMyHomeDailyDrops === 'function') window.spawnMyHomeDailyDrops();
        setupMyHomeChatUI(ui);
        if ((options.action === 'clean' || options.visitConcierge || options.action) && !options.preservePosition) {
            state.player = { ...ENTRANCE_POS };
            if (window.aiPet) {
                window.aiPet.myHomeDirection = ENTRANCE_POS.dir;
                window.aiPet.myHomeMoving = false;
                window.aiPet.visualAction = 'idle';
            }
        }
        window.renderMyHomeMap();
        renderMyHomeStatusBar();
        renderMyHomeLifePathHUD();
        ensureMyHomeLifePathTask();
        renderMyHomeActionHUD();
        ensureMyHomeActionHudTimer();
        ensureMyHomeVisitorTimer();
        const runEntryAction = () => {
            if (!window.myHomeMapOpen || !document.getElementById('myhome-map-ui')) return;
            if (options.action === 'clean') {
                performMyHomeClean();
            } else if (options.visitConcierge || options.action) {
                runMyHomeEntryAction(options.action || 'visit', options);
            }
        };
        const encounterTriggered = typeof window.tryTriggerConciergeHomeEncounter === 'function'
            && window.tryTriggerConciergeHomeEncounter({ fromMyHomeMap: true, onComplete: runEntryAction });
        if (!encounterTriggered) setTimeout(runEntryAction, 160);
        return true;
    };

    function getMyHomeRenderNodeId(prefix, value) {
        return `myhome-render-${prefix}-${String(value).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    }

    function updateMyHomeRenderNode(gridDiv, activeIds, id, createOrUpdate) {
        let existing = document.getElementById(id);
        if (existing && !gridDiv.contains(existing)) existing = null;
        const node = createOrUpdate(existing);
        if (!node) {
            if (existing) existing.remove();
            return null;
        }
        node.id = id;
        node.dataset.myhomeRenderNode = 'true';
        activeIds.add(id);
        if (!existing) gridDiv.appendChild(node);
        else if (node !== existing) existing.replaceWith(node);
        return node;
    }

    window.renderMyHomeMap = function() {
        const container = document.getElementById('myhome-map-container');
        const gridDiv = document.getElementById('myhome-grid');
        if (!container || !gridDiv) return;
        const state = window.ensureMyHomeIndoorState();
        maybeSpawnMyHomeVisitor();
        if (gridDiv.dataset.rendererVersion !== '2') {
            gridDiv.replaceChildren();
            gridDiv.dataset.rendererVersion = '2';
        }
        const activeIds = new Set();
        gridDiv.style.width = `${state.width * TILE_W}px`;
        gridDiv.style.height = `${state.height * TILE_H}px`;

        const cw = container.clientWidth || window.innerWidth;
        const ch = container.clientHeight || Math.max(1, window.innerHeight - 42);
        const camZoom = 0.4;
        const playerPixelX = state.player.x * TILE_W + TILE_W / 2;
        const playerPixelY = state.player.y * TILE_H + TILE_H / 2;
        const camX = (cw / 2) - playerPixelX * camZoom;
        const camY = (ch / 2) - playerPixelY * camZoom;
        gridDiv.style.transform = `translate(${camX}px, ${camY}px) scale(${camZoom})`;

        for (let y = 0; y < state.grid.length; y++) {
            for (let x = 0; x < state.grid[y].length; x++) {
                const tileType = state.grid[y][x];
                const key = tileType === 1 ? 'hmap_wall' : 'hmap_floor';
                const id = getMyHomeRenderNodeId('tile', `${x}-${y}`);
                updateMyHomeRenderNode(gridDiv, activeIds, id, existing => createSpriteDiv(key, 'myhome-tile', x, y, y * 100 + x, existing));
            }
        }

        state.objects.forEach(obj => {
            const id = getMyHomeRenderNodeId('object', obj.id || `${obj.key}-${obj.x}-${obj.y}`);
            const tile = updateMyHomeRenderNode(gridDiv, activeIds, id, existing => createSpriteDiv(obj.key, 'myhome-furniture', obj.x, obj.y, 1200 + obj.y * 20 + obj.x, existing));
            if (tile) {
                tile.title = obj.name || obj.id;
            }
        });

        (state.drops || []).forEach(drop => {
            const id = getMyHomeRenderNodeId('drop', drop.id || `${drop.x}-${drop.y}-${getItemId(drop.itemId)}`);
            const itemDiv = updateMyHomeRenderNode(gridDiv, activeIds, id, existing => createDungeonCharacterDiv('spr_item_bag', drop.x, drop.y, 1300 + drop.y * 20 + drop.x, existing));
            if (itemDiv) {
                itemDiv.title = getItemName(drop.itemId);
            }
        });

        if (state.tableDish) {
            const id = getMyHomeRenderNodeId('dish', 'active');
            const dishDiv = updateMyHomeRenderNode(gridDiv, activeIds, id, existing => createDungeonCharacterDiv('spr_item_bag', state.tableDish.x, state.tableDish.y, 1500 + state.tableDish.y * 20 + state.tableDish.x, existing));
            if (dishDiv) {
                dishDiv.title = getItemName(state.tableDish.itemId);
            }
        }

        if (state.visitor) {
            const visitorKey = window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[`robot_${state.visitor.dir || 'down'}`] ? `robot_${state.visitor.dir || 'down'}` : resolveMyHomePlayerSpriteKey(state.visitor.dir || 'down');
            const id = getMyHomeRenderNodeId('visitor', 'active');
            updateMyHomeRenderNode(gridDiv, activeIds, id, existing => createDungeonCharacterDiv(visitorKey, state.visitor.x, state.visitor.y, 2100 + state.visitor.y * 20 + state.visitor.x, existing));
        }

        const concierge = state.concierge || { x: 5, y: 3, dir: 'down' };
        const conciergeKey = `concierge_${concierge.dir || 'down'}`;
        const conciergeId = getMyHomeRenderNodeId('concierge', 'main');
        updateMyHomeRenderNode(gridDiv, activeIds, conciergeId, existing => createDungeonCharacterDiv(conciergeKey, concierge.x, concierge.y, 2200 + concierge.y * 20 + concierge.x, existing));

        const player = state.player || { x: 5, y: 8, dir: 'up' };
        const playerId = getMyHomeRenderNodeId('player', 'main');
        const playerDiv = updateMyHomeRenderNode(gridDiv, activeIds, playerId, existing => createCurrentAiCharacterDiv(player.x, player.y, 2400 + player.y * 20 + player.x, existing));
        if (playerDiv) {
            attachMyHomeBubble(playerDiv, player);
        }
        gridDiv.querySelectorAll('[data-myhome-render-node="true"]').forEach(node => {
            if (!activeIds.has(node.id)) node.remove();
        });
        renderMyHomeQuestHUD();
    };

    function bringMyHomeDialogueToFront() {
        const homeUi = document.getElementById('myhome-map-ui');
        if (homeUi) homeUi.style.zIndex = '80000';
        ['encounterOverlay', 'examOverlay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.position = 'fixed';
                el.style.inset = '0';
                el.style.zIndex = '120000';
                el.style.pointerEvents = 'auto';
                if (el.parentNode) document.body.appendChild(el);
            }
        });
    }

    function myHomeCellKey(x, y) {
        return `${x},${y}`;
    }

    function getMyHomeBlockedCells(state, goal, extraBlocked = []) {
        const blocked = new Set();
        const goalKey = goal ? myHomeCellKey(goal.x, goal.y) : null;
        let goalIsFixedObject = false;
        for (let y = 0; y < state.grid.length; y++) {
            for (let x = 0; x < state.grid[y].length; x++) {
                if (state.grid[y][x] === 1) blocked.add(myHomeCellKey(x, y));
            }
        }
        (state.objects || []).forEach(obj => {
            if (!obj) return;
            blocked.add(myHomeCellKey(obj.x, obj.y));
            if (goalKey === myHomeCellKey(obj.x, obj.y)
                && (obj.blocksMovement === true || obj.id === 'decor_plant' || obj.id === 'decor_candle')) {
                goalIsFixedObject = true;
            }
        });
        if (state.concierge) blocked.add(myHomeCellKey(state.concierge.x, state.concierge.y));
        if (state.visitor) blocked.add(myHomeCellKey(state.visitor.x, state.visitor.y));
        if (goalKey && !goalIsFixedObject) blocked.delete(goalKey);
        (extraBlocked || []).forEach(pos => {
            if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) blocked.add(myHomeCellKey(pos.x, pos.y));
        });
        return blocked;
    }

    function findMyHomePath(state, start, goal, extraBlocked = []) {
        if (!state || !start || !goal) return [];
        const width = state.width || MAP_W;
        const height = state.height || MAP_H;
        const blocked = getMyHomeBlockedCells(state, goal, extraBlocked);
        const startKey = myHomeCellKey(start.x, start.y);
        const goalKey = myHomeCellKey(goal.x, goal.y);
        const queue = [{ x: start.x, y: start.y }];
        const cameFrom = new Map([[startKey, null]]);
        const dirs = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 }
        ];

        while (queue.length) {
            const cur = queue.shift();
            const curKey = myHomeCellKey(cur.x, cur.y);
            if (curKey === goalKey) break;
            dirs.forEach(d => {
                const nx = cur.x + d.x;
                const ny = cur.y + d.y;
                const nextKey = myHomeCellKey(nx, ny);
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;
                if (cameFrom.has(nextKey) || blocked.has(nextKey)) return;
                cameFrom.set(nextKey, curKey);
                queue.push({ x: nx, y: ny });
            });
        }

        if (!cameFrom.has(goalKey)) return [];
        const path = [];
        let key = goalKey;
        while (key && key !== startKey) {
            const [x, y] = key.split(',').map(Number);
            path.unshift({ x, y });
            key = cameFrom.get(key);
        }
        return path;
    }

    function getMyHomeStepDir(from, to) {
        if (!from || !to) return 'down';
        if (to.x > from.x) return 'right';
        if (to.x < from.x) return 'left';
        if (to.y < from.y) return 'up';
        if (to.y > from.y) return 'down';
        return from.dir || 'down';
    }

    function runMyHomeConciergeAction(action) {
        const ai = window.aiPet || window.hero;
        if (action === 'exam_finish') {
            if (ai && typeof ai.processApprenticeExamFinish === 'function') {
                ai.processApprenticeExamFinish({ type: 'apprentice_exam', masterType: 'concierge' });
            }
        } else if (action === 'clean') {
            performMyHomeClean();
        } else {
            if (typeof window.checkMasterVisit === 'function') window.checkMasterVisit('concierge');
        }
        bringMyHomeDialogueToFront();
    }

    window.startMyHomeMoveToConcierge = function(action = 'visit', moveOptions = {}) {
        const state = window.ensureMyHomeIndoorState();
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        const target = state.concierge || { x: 5, y: 3 };
        const stop = { x: target.x, y: target.y + 1 };
        if (!moveOptions.preservePosition) state.player = { ...ENTRANCE_POS };
        const path = findMyHomePath(state, state.player, stop);
        let pathIndex = 0;
        if (window.aiPet) {
            window.aiPet.myHomeMoving = true;
            window.aiPet.myHomeDirection = state.player.dir;
            window.aiPet.visualAction = 'move';
        }
        window.renderMyHomeMap();
        window.myHomeMoveTimer = setInterval(() => {
            const p = state.player;
            if ((p.x === stop.x && p.y === stop.y) || pathIndex >= path.length) {
                clearInterval(window.myHomeMoveTimer);
                window.myHomeMoveTimer = null;
                p.dir = 'up';
                if (window.aiPet) {
                    window.aiPet.myHomeMoving = false;
                    window.aiPet.myHomeDirection = 'up';
                    window.aiPet.visualAction = 'idle';
                }
                window.renderMyHomeMap();
                setTimeout(() => runMyHomeConciergeAction(action), 120);
                return;
            }
            const next = path[pathIndex];
            if (state.visitor && next && state.visitor.x === next.x && state.visitor.y === next.y) return;
            pathIndex += 1;
            p.dir = getMyHomeStepDir(p, next);
            p.x = next.x;
            p.y = next.y;
            if (window.aiPet) {
                window.aiPet.myHomeDirection = p.dir;
                window.aiPet.visualAction = 'move';
            }
            window.renderMyHomeMap();
        }, 220);
    };

    window.openMyHomeConciergeRoute = function() {
        window.pendingMyHomeConciergeVisit = true;
        return true;
    };

    const originalCloseDungeonTacticEditorForMyHome = window.closeDungeonTacticEditor;
    window.closeDungeonTacticEditor = function() {
        if (typeof originalCloseDungeonTacticEditorForMyHome === 'function') {
            originalCloseDungeonTacticEditorForMyHome.apply(this, arguments);
        }
        if (window._myHomeWaitingDungeonTacticSave) {
            window._myHomeWaitingDungeonTacticSave = false;
            const ai = window.aiPet || window.hero || {};
            ai.myHomeTacticCreated = true;
            showMyHomeBubble('作戦を保存したよ！');
            addMyHomeLog('作戦を保存しました。');
            renderMyHomeQuestHUD();
            if (typeof saveGameData === 'function') saveGameData();
        }
    };

    const originalUpdateQuestHUDForMyHome = window.updateQuestHUD;
    if (typeof originalUpdateQuestHUDForMyHome === 'function') {
        window.updateQuestHUD = function() {
            const result = originalUpdateQuestHUDForMyHome.apply(this, arguments);
            if (window.myHomeMapOpen && typeof window.renderMyHomeQuestHUD === 'function') window.renderMyHomeQuestHUD();
            return result;
        };
    }

    window.resetConciergeBeforeApprentice = function() {
        const ai = window.aiPet || window.hero;
        if (!ai || !ai.apprentice) return false;
        ai.apprentice.currentMaster = ai.apprentice.currentMaster === 'concierge' ? null : ai.apprentice.currentMaster;
        if (ai.apprentice.rank) delete ai.apprentice.rank.concierge;
        if (ai.apprentice.retired) delete ai.apprentice.retired.concierge;
        if (Array.isArray(ai.apprentice.activeQuests)) ai.apprentice.activeQuests = ai.apprentice.activeQuests.filter(q => q && q.masterType !== 'concierge');
        ai.myHomeTacticCreated = false;
        ai.myHomeQuestSafeDeposit = false;
        ai.myHomeQuestStorageDeposits = { warehouse: false, freezer: false };
        ai.myHomeFurnitureUpgradedAfterQuest = false;
        ai.myHomeHospitalityDone = false;
        ai.myHomeBedKitReceived = false;
        if (ai.myHomeIndoor) {
            ai.myHomeIndoor.drops = [];
            ai.myHomeIndoor.logs = [];
            ai.myHomeIndoor.visitor = null;
            ai.myHomeIndoor.tableDish = null;
            ai.myHomeIndoor.decorQuest = { plant: false, candle: false };
            ai.myHomeIndoor.objects = (ai.myHomeIndoor.objects || []).filter(obj => obj && !['bed', 'decor_plant', 'decor_candle'].includes(obj.id));
        }
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData();
        console.log('コンシェルジュ弟子入り前の状態に戻しました。');
        return true;
    };
})();
