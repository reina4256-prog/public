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
    let moveRevision = 0;

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

    function resolveMyHomePlayerSpriteKey(dir = 'down', targetPet = null) {
        const ai = targetPet || window.aiPet || window.hero || {};
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
        return !!(
            hero &&
            (hero.conciergeEncountered || hero.conciergeUnlocked) &&
            getMyHomeHutAsset()
        );
    };

    function setMyHomeChatMessage(text) {
        const ai = window.aiPet || window.hero;
        if (ai) { ai.message = text || ''; ai.messageTimer = text ? 100 : 0; }
        if (text) showMyHomeBubble(text);
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
        window.GameLog?.add(text, { speaker, scene: 'myhome' });
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
        const item = { id: itemId, age: 0, freshnessStartedAt: Date.now() };
        ai.inventory.push(typeof window.normalizeInventoryFreshnessItem === 'function' ? window.normalizeInventoryFreshnessItem(item) : item);
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
        const now = window.GameShell ? window.GameShell.worldNow() : Date.now();
        const cycle = Math.floor((now - (Number(state.dropClockOffsetMs) || 0)) / (12 * 60 * 60 * 1000));
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
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
    }
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
                if (assets[k] && assets[k].type === 'hut' && !assets[k].isMobile && !window.Residents?.isResidentHome(window.aiPet, assets[k], assets)) return assets[k];
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
        if (window.GameShell && window.GameShell.isPaused()) return;
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
        if (typeof window.updateCommandHUD === 'function') window.updateCommandHUD();
    }

    function rememberMyHomeWord(rawText) {
        return !window.learnIndoorChatWord(rawText, setMyHomeChatMessage, { command: !!getMyHomeCommandTarget(rawText) }).blocked;
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
        if (typeof updateAIStatusText === 'function') updateAIStatusText();
        const task = window.aiPet?.schedule?.[0];
        if (task?.myHomeIndoor) renderMyHomeActionWindow();
        else document.getElementById('myhome-action-window')?.remove();
    }

    window.renderMyHomeActionHUD = renderMyHomeActionHUD;

    function renderMyHomeLifePathHUD() {
        if (typeof updateAIStatusText === 'function') updateAIStatusText();
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
        if (typeof updateStatUI === 'function') updateStatUI();
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
        if (window.aiPet?.myHomeExiting || window.aiPet?.myHomeIndoor?.introEscort) return false;
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
            if (window.GameShell && window.GameShell.isPaused()) return;
            if (!window.myHomeMapOpen) {
                clearInterval(window.myHomeActionHudTimer);
                window.myHomeActionHudTimer = null;
                return;
            }
            ensureMyHomeLifePathTask();
            renderMyHomeActionHUD();
            renderMyHomeLifePathHUD();
            renderMyHomeStatusBar();
            window.renderMyHomeMap();
        }, 500);
    }

    function startMyHomeScheduledAction(type, label, duration = 60, myHomeAction = type) {
        const ai = window.aiPet || window.hero || {};
        if ((type === 'sleep' || type === 'rest') && typeof window.triggerTCGUnlock === 'function') {
            window.triggerTCGUnlock('action_camp', ai.generation || 1);
        }
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
        window.ScheduleRuntime?.adoptHomeTask(ai.schedule[0]);
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
                    let [item] = box.items.splice(selected.index, 1);
                    if (kind === 'freezer' && typeof window.resumeInventoryItemFreshness === 'function') {
                        item = window.resumeInventoryItemFreshness(item);
                    }
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
                        let [item] = ai.inventory.splice(selected.index, 1);
                        if (kind === 'freezer' && typeof window.freezeInventoryItemFreshness === 'function') {
                            item = window.freezeInventoryItemFreshness(item);
                        }
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
        const revision = ++moveRevision;
        if (window.aiPet) window.aiPet.myHomeExiting = false;
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
            if (window.GameShell && window.GameShell.isPaused()) return;
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
                if (typeof afterMove === 'function') window.GameShell.deferScene(() => { if (revision === moveRevision) afterMove(); }, 120);
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
        if (window.GameShell && window.GameShell.isPaused()) return;
        const input = document.getElementById('chatInput');
        if (!input) return;
        const enteredText = String(forcedText !== undefined ? forcedText : input.value).trim();
        const rawText = window.GameI18n ? window.GameI18n.toJapaneseInput(enteredText) : enteredText;
        if (!rawText) return;
        window._blockChatFocus = false;
        if (forcedText === undefined) input.value = '';
        if (window.aiPet?.myHomeIndoor?.introEscort) {
            setMyHomeChatMessage('コンシェルジュについていこう。');
            return;
        }
        if (['出る', 'でる', '外に出る', '退出', 'exit', 'leave'].includes(rawText.toLowerCase())) {
            window.requestMyHomeExit();
            return;
        }
        if (['やめる', '中止', 'キャンセル', 'stop', 'cancel'].includes(rawText.toLowerCase())) {
            if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
            window.myHomeMoveTimer = null;
            moveRevision++;
            if (window.aiPet) window.aiPet.myHomeExiting = false;
            if (window.aiPet) window.aiPet.myHomeMoving = false;
            window.cancelMyHomeAction();
            return;
        }
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
        if (!target && getMyHomeKnownWords().some(word => rawText === word || rawText === word + 'のところへ')) {
            window.requestMyHomeExit(() => {
                input.value = enteredText;
                window.sendChat();
            });
            return;
        }
        const wordToRemember = target
            ? (target.kind === 'concierge' ? (target.action === 'clean' ? '掃除' : 'コンシェルジュ') : target.label)
            : rawText;
        if (!rememberMyHomeWord(wordToRemember)) return;
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
            if (target.panel === 'log') { window.GameLog?.open(); return; }
            if (target.panel !== 'log' && typeof window.switchRightPanel === 'function') {
                window.switchRightPanel('inventory');
                return;
            }
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

    // The shell owns chat, vocabulary, status and log controls.

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

    window.requestMyHomeExit = function(afterExit) {
        if (!window.myHomeMapOpen || window.GameShell.isPaused()) return false;
        const state = window.ensureMyHomeIndoorState();
        if (state.introEscort) return false;
        const route = findMyHomePath(state, state.player, ENTRANCE_POS);
        if (!route.length && (state.player.x !== ENTRANCE_POS.x || state.player.y !== ENTRANCE_POS.y)) {
            setMyHomeChatMessage('そこへ向かう道が見つかりません。');
            return false;
        }
        window.cancelMyHomeAction();
        setMyHomeChatMessage('入り口へ向かいます。');
        moveMyHomePlayerTo({ ...ENTRANCE_POS, dir: 'down' }, route, () => {
            addMyHomeLog('マイホームから出ました。');
            window.closeMyHomeMapUI();
            if (typeof afterExit === 'function') afterExit();
        });
        window.aiPet.myHomeExiting = true;
        return true;
    };
    window.startMyHomeRoutineAction = action => runMyHomeEntryAction(action);
    window.cancelMyHomeRoutineMovement = function() {
        moveRevision++;
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        window.myHomeMoveTimer = null;
    };

    window.prepareMyHomeIntroEscort = function() {
        const state = window.ensureMyHomeIndoorState();
        if (state.introEscort) return;
        state.introEscort = { phase: 'greeting', target: { ...state.concierge } };
        state.player = { ...ENTRANCE_POS };
        state.concierge = { x: ENTRANCE_POS.x, y: ENTRANCE_POS.y - 1, dir: 'down' };
    };

    window.startMyHomeIntroEscort = function(onComplete) {
        const state = window.ensureMyHomeIndoorState();
        if (!state.introEscort || !window.myHomeMapOpen) return;
        const escort = state.introEscort;
        escort.phase = 'walking';
        const revision = ++moveRevision;
        if (window.myHomeMoveTimer) clearInterval(window.myHomeMoveTimer);
        window.aiPet.myHomeMoving = true;
        window.aiPet.visualAction = 'move';
        window.myHomeMoveTimer = setInterval(() => {
            if (window.GameShell.isPaused() || revision !== moveRevision) return;
            const leader = state.concierge;
            const follower = state.player;
            if (leader.x === escort.target.x && leader.y === escort.target.y) {
                const stop = { x: leader.x, y: leader.y + 1, dir: 'up' };
                if (follower.x !== stop.x || follower.y !== stop.y) {
                    const step = findMyHomePath(state, follower, stop)[0];
                    if (!step) return;
                    follower.dir = getMyHomeStepDir(follower, step);
                    follower.x = step.x; follower.y = step.y;
                } else {
                    clearInterval(window.myHomeMoveTimer);
                    window.myHomeMoveTimer = null;
                    leader.dir = 'down'; follower.dir = 'up';
                    delete state.introEscort;
                    window.aiPet.myHomeMoving = false;
                    window.aiPet.visualAction = 'idle';
                    if (typeof saveGameData === 'function') saveGameData();
                    if (onComplete) window.GameShell.deferScene(onComplete);
                }
            } else {
                const step = findMyHomePath(state, leader, escort.target, [follower])[0];
                if (!step || (state.visitor && step.x === state.visitor.x && step.y === state.visitor.y)) return;
                const oldLeader = { x: leader.x, y: leader.y };
                leader.dir = getMyHomeStepDir(leader, step);
                leader.x = step.x; leader.y = step.y;
                follower.dir = getMyHomeStepDir(follower, oldLeader);
                follower.x = oldLeader.x; follower.y = oldLeader.y;
            }
            window.aiPet.myHomeDirection = follower.dir;
            window.renderMyHomeMap();
        }, VISITOR_STEP_MS);
        window.renderMyHomeMap();
    };

    window.closeMyHomeMapUI = function() {
        moveRevision++;
        const ai = window.aiPet || window.hero || {};
        ai.myHomeExiting = false;
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
        if (window.GameShell) window.GameShell.leaveScene('myhome');
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
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof saveGameData === 'function') saveGameData();
    };

    window.prepareMyHomeForReincarnation = function() {
        moveRevision++;
        ['myhome-storage-detail-ui', 'hairdresser-ui'].forEach(id => {
            const overlay = document.getElementById(id);
            if (overlay) overlay.remove();
        });
        const ui = document.getElementById('myhome-map-ui');
        if (window.GameShell) window.GameShell.leaveScene('myhome');
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
        const ai = window.aiPet || window.hero || {};
        if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('visit_forest', ai.generation || 1);
        let ui = document.getElementById('myhome-map-ui');
        const freshEntry = !ui;
        if (freshEntry) ai.myHomeExiting = false;
        if (!ui) {
            const origin = { x: ai.x, y: ai.y, camera: typeof camera !== 'undefined' ? { ...camera } : null };
            ui = document.createElement('div');
            ui.id = 'myhome-map-ui';
            ui.style.cssText = 'position:absolute;inset:0;background:#101018;color:#fff;display:flex;flex-direction:column;';
            ui.innerHTML = '<div id="myhome-map-container" style="flex:1;position:relative;overflow:hidden;background:#17151b;"><div id="myhome-grid" style="position:absolute;left:0;top:0;transform-origin:top left;"></div></div>';
            window.GameShell.enterScene('myhome', ui, {
                chat: handleMyHomeChat,
                resize: () => window.renderMyHomeMap(),
                resume: () => window.renderMyHomeMap(),
                dispose: () => {
                    ai.x = origin.x;
                    ai.y = origin.y;
                    if (origin.camera && typeof camera !== 'undefined') Object.assign(camera, origin.camera);
                }
            });
            if (typeof window.switchRightPanel === 'function') window.switchRightPanel('default');
        }
        window.myHomeMapOpen = true;
        ai.isIndoors = true;
        ai.actionState = 'inside';
        ai.indoorTarget = { type: 'hut', name: 'マイホーム' };
        window._blockChatFocus = false;
        if (typeof window.spawnMyHomeDailyDrops === 'function') window.spawnMyHomeDailyDrops();
        if (freshEntry && !options.preservePosition && !state.introEscort) {
            state.player = { ...ENTRANCE_POS };
            ai.myHomeDirection = ENTRANCE_POS.dir;
            ai.myHomeMoving = false;
            ai.visualAction = 'idle';
        }
        window.renderMyHomeMap();
        renderMyHomeStatusBar();
        ensureMyHomeLifePathTask();
        renderMyHomeActionHUD();
        ensureMyHomeActionHudTimer();
        ensureMyHomeVisitorTimer();
        const runEntryAction = () => {
            if (!window.myHomeMapOpen) return;
            if (state.introEscort) {
                window.startMyHomeIntroEscort(() => {
                    if (options.action && !['visit', 'exam_finish'].includes(options.action)) runMyHomeEntryAction(options.action, { preservePosition: true });
                });
            } else if (options.visitConcierge || options.action) {
                runMyHomeEntryAction(options.action || 'visit', { ...options, preservePosition: !freshEntry || !!options.preservePosition });
            }
        };
        const encounterTriggered = !options.skipEncounter && typeof window.tryTriggerConciergeHomeEncounter === 'function'
            && window.tryTriggerConciergeHomeEncounter({ fromMyHomeMap: true, onComplete: runEntryAction });
        if (!encounterTriggered && !options.skipEncounter) window.GameShell.deferScene(runEntryAction, 160);
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
        if (!window.GameShell || !window.GameShell.isPaused()) maybeSpawnMyHomeVisitor();
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

    window.startMyHomeExamProgress = function(task, overlay) {
        if (!window.myHomeMapOpen || task.masterType !== 'concierge' || !window.GameShell) return;
        const ai = window.aiPet;
        const home = document.getElementById('myhome-map-ui');
        window.GameShell.setExclusiveUpdate(overlay, () => {
            if (window.aiPet !== ai || !window.myHomeMapOpen || !home?.isConnected ||
                ai.schedule?.[0] !== task || task.aborted) {
                if (ai.schedule?.[0] === task) ai.schedule.shift();
                overlay.remove();
                window.GameShell.endExclusive(overlay);
                return;
            }
            task.duration = Math.max(0, task.duration - 1);
            window.updateExamUI(task);
            if (task.duration > 0) return;
            // Consume only this exam. Do not run ordinary task rewards or world ticks.
            ai.schedule.shift();
            ai.visualAction = null;
            ai.actionState = 'inside';
            ai.isIndoors = true;
            ai.indoorTarget = 'hut';
            ai.processApprenticeExamFinish(task);
            window.updateScheduleList?.();
            // Acquire the result-dialogue pause before releasing the exam owner.
            window.GameShell.syncOverlays();
            window.GameShell.endExclusive(overlay);
        });
    };

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

    window.startMyHomeMoveToConcierge = function(action = 'visit') {
        const state = window.ensureMyHomeIndoorState();
        const target = state.concierge || { x: 5, y: 3 };
        const stop = { x: target.x, y: target.y + 1, dir: 'up' };
        const path = findMyHomePath(state, state.player, stop);
        if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) {
            setMyHomeChatMessage('そこへ向かう道が見つかりません。');
            return;
        }
        moveMyHomePlayerTo(stop, path, () => runMyHomeConciergeAction(action));
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

    // Quest HUD is shared with the island; no recursive wrapper is needed.


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
    // Resident houses share this module's room geometry, sprites and pathfinding.
    const residentBeds = [2, 4, 6, 8].map((x, slot) => ({ id: 'bed_' + slot, key: 'hfur_bed', x, y: 1, name: 'ベッド' }));
    const residentFurniture = [
        { id: 'warehouse', key: 'hfur_warehouse', x: 2, y: 5, name: '倉庫' },
        { id: 'freezer', key: 'hfur_freezer', x: 4, y: 5, name: '冷凍庫' },
        { id: 'safe', key: 'hfur_safe', x: 7, y: 5, name: '金庫' },
        { id: 'dresser', key: 'hfur_dresser', x: 9, y: 5, name: 'ドレッサー' }
    ];
    const residentRoom = { width: MAP_W, height: MAP_H, grid: MYHOME_MAP_LV1, objects: [...residentBeds, ...residentFurniture] };
    let residentVisit = null;
    window.getVisitedResidentHomeId = () => residentVisit?.buildingId || null;
    window.residentIndoorPath = (from, to) => findMyHomePath(residentRoom, from, to);
    function residentOccupants() {
        if (!residentVisit) return [];
        return Object.values(window.aiPet.residentState.people).filter(p => p.home?.buildingId === residentVisit.buildingId);
    }
    function residentStorage(kind) {
        const ui = window.ResidentUI;
        const view = ui.modal(kind === 'dresser' ? 'ドレッサー' : '住人を選択');
        const people = residentOccupants().filter(p => kind !== 'dresser' || p.location?.kind === 'home');
        if (!people.length) ui.element('p', '対象の住人はいません。', view.card);
        for (const person of people) {
            const row = ui.element('div', undefined, view.card);
            ui.literal('p', ui.name(person), row); ui.element('span', ui.place(person), row);
            ui.literal('p', (person.possessions.warehouse?.length || 0) + '/10 · ' + (person.possessions.freezer?.length || 0) + '/10', row);
            ui.button(row, kind === 'dresser' ? '外見を変更' : '詳しく見る', () => {
                if (kind !== 'dresser') { ui.showPerson(person.personId, kind === 'safe' ? null : kind); return; }
                const edit = ui.modal('外見を変更');
                const label = ui.element('label', '色合い', edit.card);
                const input = ui.element('input', undefined, label); input.type = 'range'; input.min = 0; input.max = 359;
                input.value = person.profile.cosmetic?.hue || 0;
                const auraLabel = ui.element('label', 'オーラ', edit.card);
                const aura = ui.element('select', undefined, auraLabel);
                for (const [value, text] of [['none', 'なし'], ['sparkle', 'きらきら'], ['heart', 'ハート'], ['music', 'おんぷ'], ['bubble', 'バブル']]) {
                    const option = ui.element('option', text, aura); option.value = value; option.selected = value === (person.profile.cosmetic?.aura || 'none');
                }
                ui.button(edit.card, '保存', () => ui.safe(() => {
                    const draft = JSON.parse(JSON.stringify(window.aiPet));
                    const target = draft.residentState.people[person.personId];
                    if (target.location?.kind !== 'home' || target.home?.buildingId !== residentVisit?.buildingId) return;
                    target.profile.cosmetic = { ...(target.profile.cosmetic || {}), hue: Number(input.value), aura: aura.value, auraApplied: aura.value !== 'none' };
                    window.Residents.saveWorld(draft, assets); window.aiPet.residentState = draft.residentState;
                    edit.close(); window.renderResidentHome();
                }));
            });
        }
    }
    function requestResidentFurniture(kind, selected) {
        if (!residentVisit) return;
        residentVisit.path = []; residentVisit.arrive = null;
        const ui = window.ResidentUI;
        const people = residentOccupants();
        const person = selected || (people.length === 1 ? people[0] : null);
        residentVisit.choice?.remove();
        residentVisit.pendingFurniture = null;
        if (!person) {
            const panel = ui.element('div', undefined, residentVisit.root);
            panel.className = 'resident-name-question'; residentVisit.choice = panel;
            ui.element('p', people.length ? '誰の？ 名前を教えてね。' : '対象の住人はいません。', panel);
            residentVisit.pendingFurniture = kind;
            for (const candidate of people) {
                const pick = ui.button(panel, '', () => requestResidentFurniture(kind, candidate));
                pick.dataset.i18nSkip = '';
                pick.textContent = ui.name(candidate) + ' · ' + (candidate.home.slot + 1);
            }
            return;
        }
        const object = kind === 'bed' ? residentBeds[person.home.slot] : residentFurniture.find(f => f.id === kind);
        if (!object) return;
        moveResidentVisitor({ x: object.x, y: object.y + 1 }, () => {
            const current = window.aiPet.residentState.people[person.personId];
            if (current?.home?.buildingId !== residentVisit?.buildingId) return;
            if (kind === 'dresser') residentStorage(kind);
            else ui.showPerson(person.personId, ['bed', 'safe'].includes(kind) ? null : kind);
        });
    }
    function moveResidentVisitor(goal, callback) {
        if (!residentVisit || window.GameShell.isPaused()) return;
        const path = findMyHomePath(residentRoom, residentVisit.player, goal);
        if (!path.length && (goal.x !== residentVisit.player.x || goal.y !== residentVisit.player.y)) return;
        residentVisit.path = path; residentVisit.arrive = callback; residentVisit.elapsed = 0;
    }
    function closeResidentHome(save = true) {
        if (!residentVisit) return;
        residentVisit = null;
        window.GameShell.leaveScene('resident-home');
        const hero = window.aiPet; hero.isIndoors = false; hero.indoorTarget = null;
        hero.interactionTarget = null; hero.exploreState = null; hero.actionState = 'idle';
        if (save) saveGameData();
    }
    window.disposeResidentHome = () => closeResidentHome(false);
    window.stepResidentHome = function(ms) {
        if (!residentVisit || window.GameShell.isPaused()) return;
        if (!Object.values(assets).some(a => a.instanceId === residentVisit.buildingId)) { closeResidentHome(); return; }
        residentVisit.elapsed += ms;
        if (residentVisit.elapsed < 220) return;
        residentVisit.elapsed = 0;
        if (residentVisit.path.length) {
            const step = residentVisit.path.shift();
            residentVisit.player.dir = getMyHomeStepDir(residentVisit.player, step);
            Object.assign(residentVisit.player, step);
        } else if (residentVisit.arrive) {
            const callback = residentVisit.arrive; residentVisit.arrive = null; callback();
        }
    };
    window.openResidentHomeUI = function(hut) {
        if (!window.Residents.isResidentHome(window.aiPet, hut, assets)) return false;
        if (residentVisit) return true;
        const root = document.createElement('div'); root.id = 'resident-home-ui';
        root.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#17151b;';
        const grid = document.createElement('div'); grid.style.cssText = 'position:absolute;transform-origin:top left;'; root.appendChild(grid);
        residentVisit = { buildingId: hut.instanceId, root, grid, player: { ...ENTRANCE_POS }, path: [], elapsed: 0, nodes: new Map() };
        const controls = document.createElement('div'); controls.className = 'resident-home-controls'; root.appendChild(controls);
        window.ResidentUI.button(controls, '住人名簿', () => window.ResidentUI.roster());
        window.ResidentUI.button(controls, '外に出る', () => moveResidentVisitor(ENTRANCE_POS, closeResidentHome));
        const origin = { x: window.aiPet.x, y: window.aiPet.y, camera: typeof camera !== 'undefined' ? { ...camera } : null };
        window.GameShell.enterScene('resident-home', root, {
            resize: () => window.renderResidentHome(), resume: () => window.renderResidentHome(),
            chat: text => {
                // Resolve player-created names before translating command aliases.
                if (residentVisit.pendingFurniture) {
                    const matches = residentOccupants().filter(p => window.ResidentUI.name(p) === text.trim());
                    if (matches.length === 1) { requestResidentFurniture(residentVisit.pendingFurniture, matches[0]); return true; }
                }
                const raw = window.GameI18n ? window.GameI18n.toJapaneseInput(text.trim()) : text.trim();
                const normalized = raw.toLowerCase();
                const matches = word => normalized === word || normalized === (window.translateGameText?.(word) || word).toLowerCase();
                if (['出る', 'でる', '外に出る', '島'].some(matches)) moveResidentVisitor(ENTRANCE_POS, closeResidentHome);
                else if (matches('住人名簿')) window.ResidentUI.roster();
                else if (['やめる', '中止', 'キャンセル'].some(matches)) { residentVisit.path = []; residentVisit.arrive = null; residentVisit.pendingFurniture = null; residentVisit.choice?.remove(); }
                else {
                    const object = residentFurniture.find(f => matches(f.name) || raw === f.name + 'のところへ');
                    if (matches('ベッド')) requestResidentFurniture('bed');
                    else if (object) requestResidentFurniture(object.id);
                    else if (residentVisit.pendingFurniture) return true;
                    else if (getMyHomeKnownWords().some(word => raw === word || raw === word + 'のところへ')) {
                        moveResidentVisitor(ENTRANCE_POS, () => {
                            closeResidentHome();
                            const input = document.getElementById('chatInput');
                            if (input) { input.value = text; window.sendChat(); }
                        });
                    } else {
                        window.learnIndoorChatWord(text, message => {
                            window.renderResidentHome();
                            const player = residentVisit?.nodes.get('player');
                            if (!player) return;
                            player.querySelector('.resident-learning-bubble')?.remove();
                            const bubble = document.createElement('div');
                            bubble.className = 'resident-learning-bubble';
                            bubble.textContent = window.GameI18n ? window.GameI18n.translate(message) : message;
                            bubble.style.cssText = 'position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:440px;padding:20px;background:white;color:#222;border:4px solid #80d8ff;border-radius:16px;font-size:26px;white-space:pre-wrap;z-index:5000;';
                            player.appendChild(bubble);
                            setTimeout(() => bubble.remove(), 5000);
                        });
                    }
                }
                return true;
            },
            dispose: () => { window.aiPet.x = origin.x; window.aiPet.y = origin.y; if (origin.camera && typeof camera !== 'undefined') Object.assign(camera, origin.camera); residentVisit = null; }
        });
        window.aiPet.isIndoors = true; window.aiPet.actionState = 'inside'; window.aiPet.indoorTarget = hut;
        root.addEventListener('click', event => {
            if (event.target.closest('button') || !residentVisit) return;
            const rect = grid.getBoundingClientRect();
            const goal = { x: Math.floor((event.clientX - rect.left) / (TILE_W * .4)), y: Math.floor((event.clientY - rect.top) / (TILE_H * .4)) };
            const object = residentFurniture.find(f => f.x === goal.x && f.y === goal.y);
            if (object) moveResidentVisitor({ x: goal.x, y: goal.y + 1 }, () => residentStorage(object.id));
            else if (goal.y === 9 && goal.x >= 4 && goal.x <= 6) moveResidentVisitor(ENTRANCE_POS, closeResidentHome);
            else if (goal.x > 0 && goal.x < 11 && goal.y > 0 && goal.y < 9 && !residentRoom.objects.some(f => f.x === goal.x && f.y === goal.y)) moveResidentVisitor(goal);
        });
        window.renderResidentHome(); return true;
    };
    window.renderResidentHome = function() {
        if (!residentVisit) return;
        const { grid, root, player, nodes } = residentVisit;
        const active = new Set();
        const put = (key, build) => {
            active.add(key); const previous = nodes.get(key); const node = build(previous);
            if (!node) return; if (!previous) grid.appendChild(node); nodes.set(key, node);
        };
        grid.style.width = `${MAP_W * TILE_W}px`; grid.style.height = `${MAP_H * TILE_H}px`;
        grid.style.transform = `translate(${root.clientWidth / 2 - (player.x + .5) * TILE_W * .4}px, ${root.clientHeight / 2 - (player.y + .5) * TILE_H * .4}px) scale(.4)`;
        for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) put('tile_' + x + '_' + y, old => createSpriteDiv(MYHOME_MAP_LV1[y][x] === 1 ? 'hmap_wall' : 'hmap_floor', 'myhome-tile', x, y, y * 100 + x, old));
        for (const object of residentRoom.objects) put(object.id, old => createSpriteDiv(object.key, 'myhome-furniture', object.x, object.y, 1200 + object.y * 20, old));
        for (const person of residentOccupants()) {
            const slot = person.home.slot;
            put('theme_' + slot, old => {
                const node = old || document.createElement('div');
                node.style.cssText = `position:absolute;left:${(1 + slot * 2) * TILE_W}px;top:${TILE_H}px;width:${TILE_W * 2}px;height:${TILE_H * 3}px;background:hsla(${person.roomTheme?.hue || 0},65%,55%,.2);pointer-events:none;z-index:1100;`;
                return node;
            });
            if (person.location?.kind !== 'home') continue;
            put(person.personId, old => {
                const key = resolveMyHomePlayerSpriteKey('down', person.profile);
                const node = createDungeonCharacterDiv(key, person.location.x, person.location.y, 2100 + person.location.y * 20, old);
                if (node) { window.applyDungeonWalkCosmetics?.(node, person.profile, key); node.title = window.ResidentUI.name(person); }
                return node;
            });
        }
        put('player', old => {
            const key = resolveMyHomePlayerSpriteKey(player.dir);
            const node = createDungeonCharacterDiv(key, player.x, player.y, 2400 + player.y * 20, old);
            if (node) window.applyDungeonWalkCosmetics?.(node, window.aiPet, key); return node;
        });
        for (const [key, node] of nodes) if (!active.has(key)) { node.remove(); nodes.delete(key); }
    };
})();
