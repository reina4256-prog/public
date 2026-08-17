(function () {
    'use strict';

    const TILE_SIZE = 160;
    const ROOM_W = 14;
    const ROOM_H = 10;
    const MAP_W = ROOM_W * 3;
    const MAP_H = ROOM_H * 2;
    const MOVE_INTERVAL_MS = 190;
    const ENTRANCE_POS = { x: 21, y: 18, dir: 'up' };
    const EXIT_POS = { x: 21, y: 19, dir: 'down' };

    const ROOM_ORDER = [
        ['prayer', 'throne', 'laboratory'],
        ['operations', 'guardroom', 'auction']
    ];

    const ROOM_DATA = {
        prayer: { name: '祈祷室', floor: 'castle_prayer_floor', wall: 'castle_prayer_wall', feature: 'castle_prayer_feature', color: '#8c6ed6' },
        throne: { name: '玉座の間', floor: 'castle_throne_floor', wall: 'castle_throne_wall', feature: 'castle_throne_feature', color: '#d5aa45' },
        laboratory: { name: '研究室', floor: 'castle_laboratory_floor', wall: 'castle_laboratory_wall', feature: 'castle_laboratory_feature', color: '#78a7a0' },
        operations: { name: '作戦会議室', floor: 'castle_operations_floor', wall: 'castle_operations_wall', feature: 'castle_operations_feature', color: '#b47c49' },
        guardroom: { name: '詰所', floor: 'castle_guardroom_floor', wall: 'castle_guardroom_wall', feature: 'castle_guardroom_feature', color: '#9b806d' },
        auction: { name: '競売所', floor: 'castle_auction_floor', wall: 'castle_auction_wall', feature: 'castle_auction_feature', color: '#b58b56' }
    };

    const DEFAULT_CASTLE_SPRITES = {
        castle_prayer_floor: { img: 'prayroom_mapchip.png', sx: 10, sy: 185, sw: 135, sh: 140, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_prayer_wall: { img: 'prayroom_mapchip.png', sx: 10, sy: 775, sw: 270, sh: 250, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_prayer_feature: { img: 'prayroom_mapchip.png', sx: 10, sy: 775, sw: 800, sh: 250, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },

        castle_throne_floor: { img: 'throneroom_mapchip.png', sx: 2, sy: 120, sw: 134, sh: 124, scale: 1, x: 0, y: 0, sourceW: 2752, sourceH: 1536 },
        castle_throne_wall: { img: 'throneroom_mapchip.png', sx: 75, sy: 820, sw: 260, sh: 260, scale: 1, x: 0, y: 0, sourceW: 2752, sourceH: 1536 },
        castle_throne_feature: { img: 'throneroom_mapchip.png', sx: 70, sy: 820, sw: 1300, sh: 320, scale: 1, x: 0, y: 0, sourceW: 2752, sourceH: 1536 },

        castle_laboratory_floor: { img: 'labo_mapchip.png', sx: 5, sy: 95, sw: 135, sh: 135, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_laboratory_wall: { img: 'labo_mapchip.png', sx: 20, sy: 770, sw: 270, sh: 260, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_laboratory_feature: { img: 'labo_mapchip.png', sx: 20, sy: 770, sw: 800, sh: 300, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },

        castle_operations_floor: { img: 'operationroom_mapchip.png', sx: 50, sy: 120, sw: 220, sh: 190, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_operations_wall: { img: 'operationroom_mapchip.png', sx: 45, sy: 705, sw: 280, sh: 300, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_operations_feature: { img: 'operationroom_mapchip.png', sx: 45, sy: 705, sw: 760, sh: 310, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },

        castle_guardroom_floor: { img: 'dutyroom_mapchip.png', sx: 5, sy: 100, sw: 190, sh: 190, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_guardroom_wall: { img: 'dutyroom_mapchip.png', sx: 10, sy: 770, sw: 280, sh: 260, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_guardroom_feature: { img: 'dutyroom_mapchip.png', sx: 10, sy: 770, sw: 700, sh: 270, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },

        castle_auction_floor: { img: 'auctionroom_mapchip.png', sx: 10, sy: 145, sw: 200, sh: 200, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_auction_wall: { img: 'auctionroom_mapchip.png', sx: 40, sy: 770, sw: 280, sh: 260, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 },
        castle_auction_feature: { img: 'auctionroom_mapchip.png', sx: 40, sy: 770, sw: 920, sh: 270, scale: 1, x: 0, y: 0, sourceW: 2816, sourceH: 1536 }
    };

    window.CASTLE_SPRITES = window.CASTLE_SPRITES || {};
    Object.entries(DEFAULT_CASTLE_SPRITES).forEach(([key, value]) => {
        if (!window.CASTLE_SPRITES[key]) window.CASTLE_SPRITES[key] = { ...value };
    });
    window.selectedCastleSpriteKey = window.selectedCastleSpriteKey || 'castle_throne_floor';

    const NPC_DATA = {
        fortune_teller: {
            name: '占い師', room: 'prayer', x: 7, y: 4, dir: 'down', sprite: 'fortune_teller', color: '#c9a7ff',
            aliases: ['占い師', '占い', '祈祷室', '祈祷', '星'],
            dialogue: '星が囁いているわ。あなたの未来には、まだ見ぬ輝きが隠されていると。'
        },
        king: {
            name: '王様', room: 'throne', x: 21, y: 4, dir: 'down', sprite: 'king', color: '#ffd45f',
            aliases: ['王様', '国王', '王', '玉座の間', '玉座', '防衛戦', '防衛'],
            dialogue: 'よくぞ参った。島を守る覚悟があるなら、余にそなたの力を示してみよ。'
        },
        scientist: {
            name: '科学者', room: 'laboratory', x: 35, y: 4, dir: 'down', sprite: 'scientist', color: '#74e0d0',
            aliases: ['科学者', '科学', '研究室', '研究', '発明'],
            dialogue: 'あちゃー！また爆発しちゃった！でも失敗は成功の母だよね！'
        },
        captain: {
            name: '隊長', room: 'operations', x: 7, y: 14, dir: 'down', sprite: 'captain', color: '#7eb4ff',
            aliases: ['隊長', '作戦会議室', '作戦会議', '闘技場', 'アリーナ'],
            dialogue: '訓練に来たか？ 闘技場では力だけでなく、準備と作戦が勝敗を分ける。'
        },
        soldier: {
            name: '兵士', room: 'guardroom', x: 21, y: 14, dir: 'down', sprite: 'soldier', color: '#ff8178',
            aliases: ['兵士', '詰所', '警備'],
            dialogue: 'お疲れさまです！ 城内の警備は異常ありません。どうぞごゆっくり！'
        },
        salesperson: {
            name: '販売員', room: 'auction', x: 35, y: 14, dir: 'down', sprite: 'merchant', color: '#ffd36b',
            aliases: ['販売員', '商人', '競売所', '競売', 'オークション'],
            dialogue: 'チャリン♪ うんうん、今日もいい音が鳴ってるね！儲け話なら私に任せな！'
        }
    };

    function roomIdAt(x, y) {
        const col = Math.max(0, Math.min(2, Math.floor(x / ROOM_W)));
        const row = Math.max(0, Math.min(1, Math.floor(y / ROOM_H)));
        return ROOM_ORDER[row][col];
    }

    function isVerticalOpening(y) {
        return (y >= 3 && y <= 6) || (y >= 13 && y <= 16);
    }

    function isHorizontalOpening(x) {
        const localX = x % ROOM_W;
        return localX >= 5 && localX <= 8;
    }

    function createCastleGrid() {
        const grid = [];
        for (let y = 0; y < MAP_H; y++) {
            const row = [];
            for (let x = 0; x < MAP_W; x++) {
                let type = 0;
                const isEntrance = y === MAP_H - 1 && x >= EXIT_POS.x - 1 && x <= EXIT_POS.x + 1;
                if ((x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1) && !isEntrance) type = 1;
                if ((x === ROOM_W - 1 || x === ROOM_W || x === ROOM_W * 2 - 1 || x === ROOM_W * 2) && !isVerticalOpening(y)) type = 1;
                if ((y === ROOM_H - 1 || y === ROOM_H) && !isHorizontalOpening(x)) type = 1;
                if (isEntrance) type = 100;
                row.push(type);
            }
            grid.push(row);
        }
        return grid;
    }

    const CASTLE_GRID = createCastleGrid();

    function ensureCastleState() {
        const ai = window.aiPet || window.hero || {};
        if (!ai.castleIndoor || typeof ai.castleIndoor !== 'object') {
            ai.castleIndoor = {
                width: MAP_W,
                height: MAP_H,
                player: { ...ENTRANCE_POS },
                npcDirections: {},
                logs: [],
                enteredAt: Date.now()
            };
        }
        const state = ai.castleIndoor;
        state.width = MAP_W;
        state.height = MAP_H;
        if (!state.player || !Number.isFinite(state.player.x) || !Number.isFinite(state.player.y)) state.player = { ...ENTRANCE_POS };
        if (!state.npcDirections || typeof state.npcDirections !== 'object') state.npcDirections = {};
        if (!Array.isArray(state.logs)) state.logs = [];
        return state;
    }

    function resolvePlayerSpriteKey(dir) {
        const ai = window.aiPet || window.hero || {};
        const skin = ai.currentSkin || ai.type || ai.baseType || 'robot';
        const base = String(skin).split('_')[0] || 'robot';
        const candidates = [`${skin}_${dir}`, `${base}_${dir}`, `robot_${dir}`];
        for (const key of candidates) {
            if (window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[key]) return key;
        }
        return window.DUNGEON_SPRITES ? Object.keys(window.DUNGEON_SPRITES).find(key => key.startsWith(`${base}_`)) : null;
    }

    function createMapChipDiv(spriteKey, x, y, widthTiles, heightTiles, className) {
        const sp = window.CASTLE_SPRITES[spriteKey];
        if (!sp) return null;
        const wrapper = document.createElement('div');
        const inner = document.createElement('div');
        const drawW = Math.max(1, widthTiles * TILE_SIZE);
        const drawH = Math.max(1, heightTiles * TILE_SIZE);
        const sw = Math.max(1, Number(sp.sw) || 1);
        const sh = Math.max(1, Number(sp.sh) || 1);
        wrapper.className = className || 'castle-mapchip';
        wrapper.dataset.spriteKey = spriteKey;
        wrapper.style.cssText = `position:absolute;left:${x * TILE_SIZE + (sp.x || 0)}px;top:${y * TILE_SIZE + (sp.y || 0)}px;width:${drawW}px;height:${drawH}px;overflow:hidden;pointer-events:none;`;
        inner.style.cssText = `position:absolute;left:0;top:0;width:${sw}px;height:${sh}px;background-image:url('${sp.img}');background-position:-${Number(sp.sx) || 0}px -${Number(sp.sy) || 0}px;background-repeat:no-repeat;transform-origin:top left;transform:scale(${(drawW / sw) * (Number(sp.scale) || 1)}, ${(drawH / sh) * (Number(sp.scale) || 1)});image-rendering:auto;`;
        wrapper.appendChild(inner);
        return wrapper;
    }

    function createCharacterDiv(spriteKey, x, y, z) {
        const sp = window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[spriteKey];
        if (!sp || typeof window.createDungeonSprite !== 'function') return null;
        const div = window.createDungeonSprite(spriteKey, z, 1, false, TILE_SIZE);
        if (!div) return null;
        const scale = Number(sp.scale) || 1;
        const visualBottom = (Number(sp.sh) || 1) / 2 + ((Number(sp.sh) || 1) * scale) / 2;
        div.style.left = `${x * TILE_SIZE + TILE_SIZE / 2 - (Number(sp.sw) || 1) / 2 + (sp.x || 0)}px`;
        div.style.top = `${y * TILE_SIZE + TILE_SIZE - visualBottom + (sp.y || 0)}px`;
        div.style.zIndex = String(z);
        div.style.pointerEvents = 'none';
        return div;
    }

    function addSpeechBubble(characterDiv, text, color) {
        if (!characterDiv || !text) return;
        const bubble = document.createElement('div');
        bubble.className = 'castle-speech-bubble';
        bubble.textContent = text;
        bubble.style.cssText = `position:absolute;left:50%;top:35%;transform:translate(-50%,-100%);min-width:420px;max-width:620px;padding:18px 24px;border-radius:18px;background:rgba(12,14,22,.94);border:4px solid ${color || '#d6c38a'};color:#fff;font:bold 30px/1.45 'MS Gothic',monospace;text-align:center;box-shadow:0 12px 28px rgba(0,0,0,.55);z-index:20;white-space:normal;`;
        characterDiv.appendChild(bubble);
    }

    function getStepDirection(from, to) {
        if (to.x > from.x) return 'right';
        if (to.x < from.x) return 'left';
        if (to.y > from.y) return 'down';
        return 'up';
    }

    function cellKey(x, y) {
        return `${x},${y}`;
    }

    function getBlockedCells(goal) {
        const blocked = new Set();
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                if (CASTLE_GRID[y][x] === 1) blocked.add(cellKey(x, y));
            }
        }
        Object.values(NPC_DATA).forEach(npc => blocked.add(cellKey(npc.x, npc.y)));
        if (goal) blocked.delete(cellKey(goal.x, goal.y));
        return blocked;
    }

    function findPath(start, goal) {
        if (!start || !goal) return [];
        const startKey = cellKey(start.x, start.y);
        const goalKey = cellKey(goal.x, goal.y);
        const blocked = getBlockedCells(goal);
        const queue = [{ x: start.x, y: start.y }];
        const cameFrom = new Map([[startKey, null]]);
        const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }];
        while (queue.length) {
            const current = queue.shift();
            const currentKey = cellKey(current.x, current.y);
            if (currentKey === goalKey) break;
            dirs.forEach(dir => {
                const x = current.x + dir.x;
                const y = current.y + dir.y;
                const key = cellKey(x, y);
                if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H || cameFrom.has(key) || blocked.has(key)) return;
                cameFrom.set(key, currentKey);
                queue.push({ x, y });
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

    function getNpcRoute(npc) {
        const state = ensureCastleState();
        const candidates = [
            { x: npc.x, y: npc.y + 1, dir: 'up' },
            { x: npc.x - 1, y: npc.y, dir: 'right' },
            { x: npc.x + 1, y: npc.y, dir: 'left' },
            { x: npc.x, y: npc.y - 1, dir: 'down' }
        ];
        let best = null;
        candidates.forEach(stop => {
            if (stop.x < 0 || stop.y < 0 || stop.x >= MAP_W || stop.y >= MAP_H || CASTLE_GRID[stop.y][stop.x] === 1) return;
            const path = findPath(state.player, stop);
            if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) return;
            if (!best || path.length < best.path.length) best = { stop, path };
        });
        return best;
    }

    function setCastleMessage(text) {
        const el = document.getElementById('castle-chat-message');
        if (el) el.textContent = text || '';
    }

    function addCastleLog(text) {
        const state = ensureCastleState();
        state.logs.push(String(text || ''));
        if (state.logs.length > 40) state.logs.shift();
    }

    function showPlayerBubble(text, duration) {
        const state = ensureCastleState();
        state.player.speechText = text;
        state.player.speechUntil = Date.now() + (duration || 2400);
        window.renderCastleMap();
        setTimeout(() => {
            const current = ensureCastleState();
            if (current.player.speechUntil <= Date.now()) {
                current.player.speechText = '';
                window.renderCastleMap();
            }
        }, (duration || 2400) + 50);
    }

    function showNpcBubble(id, text, duration) {
        const state = ensureCastleState();
        state.npcSpeech = { id, text, until: Date.now() + (duration || 4200) };
        window.renderCastleMap();
        setTimeout(() => {
            const current = ensureCastleState();
            if (current.npcSpeech && current.npcSpeech.until <= Date.now()) {
                current.npcSpeech = null;
                window.renderCastleMap();
            }
        }, (duration || 4200) + 50);
    }

    function movePlayer(stop, path, onArrive) {
        const state = ensureCastleState();
        if (window.castleMoveTimer) clearInterval(window.castleMoveTimer);
        const route = Array.isArray(path) ? path : findPath(state.player, stop);
        let index = 0;
        const ai = window.aiPet || window.hero || {};
        ai.castleMoving = true;
        ai.visualAction = 'move';
        window.renderCastleMap();
        window.castleMoveTimer = setInterval(() => {
            const player = state.player;
            if ((player.x === stop.x && player.y === stop.y) || index >= route.length) {
                clearInterval(window.castleMoveTimer);
                window.castleMoveTimer = null;
                player.dir = stop.dir || player.dir || 'down';
                ai.castleMoving = false;
                ai.visualAction = 'idle';
                window.renderCastleMap();
                if (typeof onArrive === 'function') setTimeout(onArrive, 140);
                return;
            }
            const next = route[index++];
            player.dir = getStepDirection(player, next);
            player.x = next.x;
            player.y = next.y;
            ai.castleDirection = player.dir;
            window.renderCastleMap();
        }, MOVE_INTERVAL_MS);
    }

    function faceNpcTowardPlayer(id) {
        const state = ensureCastleState();
        const npc = NPC_DATA[id];
        if (!npc) return;
        state.npcDirections[id] = getStepDirection(npc, state.player);
    }

    function createDialogueButton(label, color, action, disabled) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.disabled = !!disabled;
        button.style.cssText = `width:100%;padding:12px 16px;border-radius:8px;border:1px solid ${disabled ? '#555' : color};background:${disabled ? '#252525' : color};color:${disabled ? '#777' : '#fff'};font-weight:bold;font-size:16px;cursor:${disabled ? 'not-allowed' : 'pointer'};`;
        if (!disabled) button.addEventListener('click', action);
        return button;
    }

    window.closeCastleDialogue = function () {
        const overlay = document.getElementById('castle-dialogue-ui');
        if (overlay) overlay.remove();
        const input = document.getElementById('castle-chat-input');
        if (input) input.focus();
    };

    function showNpcDialogue(id) {
        const npc = NPC_DATA[id];
        if (!npc) return;
        window.closeCastleDialogue();
        faceNpcTowardPlayer(id);
        showNpcBubble(id, npc.dialogue, 5200);
        setCastleMessage(`${npc.name}「${npc.dialogue}」`);
        addCastleLog(`${npc.name}「${npc.dialogue}」`);

        const overlay = document.createElement('div');
        overlay.id = 'castle-dialogue-ui';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:56000;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;font-family:sans-serif;';
        const panel = document.createElement('div');
        panel.style.cssText = `width:min(560px,94vw);background:linear-gradient(180deg,#242532,#151620);border:3px solid ${npc.color};border-radius:14px;padding:24px;color:#fff;box-shadow:0 16px 50px rgba(0,0,0,.7);`;
        const title = document.createElement('h2');
        title.textContent = npc.name;
        title.style.cssText = `margin:0 0 14px;color:${npc.color};font-size:27px;`;
        const text = document.createElement('p');
        text.textContent = npc.dialogue;
        text.style.cssText = 'font-size:17px;line-height:1.8;margin:0 0 20px;white-space:pre-wrap;';
        const actions = document.createElement('div');
        actions.style.cssText = 'display:grid;gap:10px;';
        panel.append(title, text, actions);

        if (id === 'king') {
            actions.appendChild(createDialogueButton('通常防衛戦を受注する', '#a52f37', () => window.startCastleDefenseQuest('normal')));
            const endlessUnlocked = Number((window.aiPet && window.aiPet.defenseWave) || 1) > 10;
            actions.appendChild(createDialogueButton(endlessUnlocked ? 'エンドレス防衛戦を受注する' : 'エンドレス防衛戦（WAVE 10クリアで解放）', '#7134a8', () => window.startCastleDefenseQuest('endless'), !endlessUnlocked));
        } else if (id === 'captain') {
            actions.appendChild(createDialogueButton('闘技場クエストを受注する', '#285f9c', () => window.startCastleArenaQuest()));
        } else if (id === 'fortune_teller' || id === 'scientist' || id === 'salesperson') {
            const note = document.createElement('div');
            note.textContent = '修行課題は現在準備中です。';
            note.style.cssText = 'padding:9px 12px;border:1px dashed #666;border-radius:7px;color:#aaa;text-align:center;font-size:13px;';
            actions.appendChild(note);
        }
        actions.appendChild(createDialogueButton('会話を終える', '#494b58', () => window.closeCastleDialogue()));
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    function findNpcFromCommand(rawText) {
        const text = String(rawText || '').trim();
        return Object.entries(NPC_DATA).find(([, npc]) => npc.aliases.some(alias => text.includes(alias))) || null;
    }

    function handleCastleChat(forcedText) {
        const input = document.getElementById('castle-chat-input');
        const rawText = String(forcedText !== undefined ? forcedText : (input ? input.value : '')).trim();
        if (!rawText) return;
        if (input && forcedText === undefined) input.value = '';
        window._blockChatFocus = true;

        if (['出る', '退出', '城の外', '外へ'].some(word => rawText.includes(word))) {
            const state = ensureCastleState();
            const path = findPath(state.player, EXIT_POS);
            setCastleMessage('城の出口へ移動するよ。');
            showPlayerBubble('城の出口へ移動するよ');
            addCastleLog('城の出口へ移動するよ。');
            movePlayer({ ...EXIT_POS, dir: 'down' }, path, () => window.closeCastleMapUI());
            if (input) input.focus();
            return;
        }

        const found = findNpcFromCommand(rawText);
        if (!found) {
            const message = '誰のところへ向かうか分からなかったよ。王様、隊長、兵士、占い師、科学者、販売員の名前で教えてね。';
            setCastleMessage(message);
            showPlayerBubble('行き先をもう一度教えてね', 3000);
            addCastleLog(message);
            if (input) input.focus();
            return;
        }
        const [id, npc] = found;
        const route = getNpcRoute(npc);
        if (!route) {
            setCastleMessage(`${npc.name}のところへ向かう道が見つかりません。`);
            if (input) input.focus();
            return;
        }
        setCastleMessage(`${npc.name}のところへ移動するよ。`);
        showPlayerBubble(`${npc.name}のところへ移動するよ`);
        addCastleLog(`${npc.name}のところへ移動するよ。`);
        movePlayer(route.stop, route.path, () => showNpcDialogue(id));
        if (input) input.focus();
    }

    window.sendCastleChatCommand = function (text) {
        handleCastleChat(text);
    };

    function setupChatUI(ui) {
        const input = ui.querySelector('#castle-chat-input');
        const send = ui.querySelector('#castle-chat-send');
        const toggle = ui.querySelector('#castle-destinations-toggle');
        const panel = ui.querySelector('#castle-destinations-panel');
        const close = ui.querySelector('#castle-destinations-close');
        if (input && !input.dataset.bound) {
            input.dataset.bound = 'true';
            input.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleCastleChat();
                }
            });
        }
        if (send && !send.dataset.bound) {
            send.dataset.bound = 'true';
            send.addEventListener('click', () => handleCastleChat());
        }
        if (toggle && !toggle.dataset.bound) {
            toggle.dataset.bound = 'true';
            toggle.addEventListener('click', () => {
                if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
        }
        if (close && !close.dataset.bound) {
            close.dataset.bound = 'true';
            close.addEventListener('click', () => { if (panel) panel.style.display = 'none'; });
        }
    }

    function ensureStaticMap(gridDiv, forceRebuild) {
        if (!forceRebuild && gridDiv.dataset.castleStaticVersion === '1') return;
        gridDiv.replaceChildren();
        gridDiv.dataset.castleStaticVersion = '1';
        gridDiv.style.width = `${MAP_W * TILE_SIZE}px`;
        gridDiv.style.height = `${MAP_H * TILE_SIZE}px`;
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                const room = ROOM_DATA[roomIdAt(x, y)];
                const wall = CASTLE_GRID[y][x] === 1;
                const tile = createMapChipDiv(wall ? room.wall : room.floor, x, y, 1, 1, wall ? 'castle-wall-tile' : 'castle-floor-tile');
                if (tile) {
                    tile.style.zIndex = String(wall ? 80 + y : y);
                    if (CASTLE_GRID[y][x] === 100) tile.style.filter = 'brightness(1.18)';
                    gridDiv.appendChild(tile);
                }
            }
        }

        ROOM_ORDER.forEach((row, roomRow) => row.forEach((id, roomCol) => {
            const room = ROOM_DATA[id];
            const baseX = roomCol * ROOM_W;
            const baseY = roomRow * ROOM_H;
            const feature = createMapChipDiv(room.feature, baseX + 4, baseY + 1, 6, 2, 'castle-room-feature');
            if (feature) {
                feature.style.zIndex = String(300 + baseY);
                feature.style.border = `5px solid ${room.color}`;
                feature.style.borderRadius = '16px';
                feature.style.boxShadow = '0 18px 34px rgba(0,0,0,.35)';
                gridDiv.appendChild(feature);
            }
            const label = document.createElement('div');
            label.className = 'castle-room-label';
            label.textContent = room.name;
            label.style.cssText = `position:absolute;left:${baseX * TILE_SIZE + 32}px;top:${baseY * TILE_SIZE + 28}px;z-index:${500 + baseY};padding:12px 24px;border-radius:999px;background:rgba(8,10,18,.82);border:4px solid ${room.color};color:#fff;font:bold 32px 'MS Gothic',monospace;letter-spacing:3px;box-shadow:0 8px 20px rgba(0,0,0,.45);pointer-events:none;`;
            gridDiv.appendChild(label);
        }));

        const exit = document.createElement('div');
        exit.textContent = '城の出口';
        exit.style.cssText = `position:absolute;left:${(EXIT_POS.x - 1) * TILE_SIZE}px;top:${(MAP_H - 1) * TILE_SIZE + 96}px;width:${TILE_SIZE * 3}px;text-align:center;color:#fff0b5;font:bold 28px 'MS Gothic',monospace;z-index:600;text-shadow:0 3px 5px #000;pointer-events:none;`;
        gridDiv.appendChild(exit);
    }

    function renderDynamicCharacters(gridDiv) {
        gridDiv.querySelectorAll('[data-castle-dynamic="true"]').forEach(node => node.remove());
        const state = ensureCastleState();
        Object.entries(NPC_DATA).forEach(([id, npc]) => {
            const dir = state.npcDirections[id] || npc.dir;
            const spriteKey = `${npc.sprite}_${dir}`;
            const character = createCharacterDiv(spriteKey, npc.x, npc.y, 3000 + npc.y * 20 + npc.x);
            if (!character) return;
            character.dataset.castleDynamic = 'true';
            character.dataset.castleNpc = id;
            character.classList.add('castle-npc');
            const label = document.createElement('div');
            label.textContent = npc.name;
            label.style.cssText = `position:absolute;left:50%;top:35%;transform:translate(-50%,-100%);padding:7px 14px;border-radius:999px;background:rgba(5,7,12,.88);border:3px solid ${npc.color};color:#fff;font:bold 25px 'MS Gothic',monospace;white-space:nowrap;z-index:15;`;
            character.appendChild(label);
            if (state.npcSpeech && state.npcSpeech.id === id && state.npcSpeech.until > Date.now()) addSpeechBubble(character, state.npcSpeech.text, npc.color);
            gridDiv.appendChild(character);
        });

        const player = state.player;
        const playerKey = resolvePlayerSpriteKey(player.dir || 'up');
        const playerDiv = createCharacterDiv(playerKey, player.x, player.y, 5000 + player.y * 20 + player.x);
        if (playerDiv) {
            playerDiv.dataset.castleDynamic = 'true';
            playerDiv.classList.add('castle-player');
            if (player.speechText && player.speechUntil > Date.now()) addSpeechBubble(playerDiv, player.speechText, '#6ecff6');
            if (typeof window.applyDungeonWalkCosmetics === 'function') window.applyDungeonWalkCosmetics(playerDiv, window.aiPet || window.hero || {}, playerKey);
            gridDiv.appendChild(playerDiv);
        }
    }

    window.renderCastleMap = function (forceRebuild) {
        const container = document.getElementById('castle-map-container');
        const gridDiv = document.getElementById('castle-grid');
        if (!container || !gridDiv) return;
        ensureStaticMap(gridDiv, !!forceRebuild);
        renderDynamicCharacters(gridDiv);
        const state = ensureCastleState();
        const cw = container.clientWidth || window.innerWidth;
        const ch = container.clientHeight || Math.max(1, window.innerHeight - 46);
        const zoom = cw < 700 ? 0.34 : 0.43;
        const playerX = state.player.x * TILE_SIZE + TILE_SIZE / 2;
        const playerY = state.player.y * TILE_SIZE + TILE_SIZE / 2;
        const scaledW = MAP_W * TILE_SIZE * zoom;
        const scaledH = MAP_H * TILE_SIZE * zoom;
        let camX = cw / 2 - playerX * zoom;
        let camY = ch / 2 - playerY * zoom;
        camX = scaledW > cw ? Math.max(cw - scaledW, Math.min(0, camX)) : (cw - scaledW) / 2;
        camY = scaledH > ch ? Math.max(ch - scaledH, Math.min(0, camY)) : (ch - scaledH) / 2;
        gridDiv.style.transform = `translate(${camX}px,${camY}px) scale(${zoom})`;
    };

    window.openCastleMapUI = function (options) {
        const opts = options || {};
        const state = ensureCastleState();
        const ai = window.aiPet || window.hero || {};
        if (!opts.preservePosition) state.player = { ...ENTRANCE_POS };
        if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('visit_castle', ai.generation || 1);
        if (typeof window.unlockCastlePersonCards === 'function') window.unlockCastlePersonCards(ai.generation || 1);

        let ui = document.getElementById('castle-map-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'castle-map-ui';
            ui.style.cssText = `position:fixed;inset:0;z-index:8990;background:#0c1018;color:#fff;display:flex;flex-direction:column;font-family:'MS Gothic',monospace;`;
            ui.innerHTML = `
                <div style="height:46px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:linear-gradient(90deg,#281d37,#17263a);border-bottom:2px solid #c8a75b;box-sizing:border-box;">
                    <div style="font-weight:bold;color:#ffe7a6;letter-spacing:2px;">王城</div>
                    <button id="castle-exit-button" type="button" style="background:#4a3642;color:#fff;border:1px solid #d4b66c;border-radius:6px;padding:6px 12px;cursor:pointer;">城を出る</button>
                </div>
                <div id="castle-map-container" style="flex:1;position:relative;overflow:hidden;background:radial-gradient(circle at center,#242b39,#0c1018);">
                    <div id="castle-grid" style="position:absolute;left:0;top:0;transform-origin:top left;transition:transform .16s linear;"></div>
                </div>
                <div id="castle-chat-panel" style="position:absolute;left:16px;bottom:16px;width:min(590px,calc(100vw - 32px));z-index:20;background:rgba(13,16,25,.86);border:1px solid rgba(255,227,157,.56);border-radius:9px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);box-sizing:border-box;">
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input id="castle-chat-input" autocomplete="off" placeholder="例：王様のところへ行って" style="flex:1;min-width:0;background:rgba(0,0,0,.65);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:9px 10px;font-size:14px;outline:none;">
                        <button id="castle-chat-send" type="button" style="background:#315e8b;color:#fff;border:0;border-radius:6px;padding:9px 14px;font-weight:bold;cursor:pointer;">送信</button>
                        <button id="castle-destinations-toggle" type="button" style="background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:6px;padding:9px 10px;cursor:pointer;">行き先</button>
                    </div>
                    <div id="castle-chat-message" style="margin-top:6px;min-height:18px;color:#ffe7a6;font-size:12px;">名前や部屋をチャットで指示すると、そこまで歩いて会話します。</div>
                </div>
                <div id="castle-destinations-panel" style="display:none;position:absolute;right:16px;bottom:16px;width:min(340px,calc(100vw - 32px));z-index:21;background:rgba(13,16,25,.9);border:1px solid rgba(255,227,157,.56);border-radius:9px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#ffe7a6;font-weight:bold;"><span>チャットで伝える行き先</span><button id="castle-destinations-close" type="button" style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;">×</button></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
                        ${Object.values(NPC_DATA).map(npc => `<button type="button" onclick="window.sendCastleChatCommand('${npc.name}')" style="padding:9px;border-radius:6px;border:1px solid ${npc.color};background:#232735;color:#fff;cursor:pointer;font-weight:bold;">${npc.name}</button>`).join('')}
                        <button type="button" onclick="window.sendCastleChatCommand('城を出る')" style="grid-column:1/-1;padding:9px;border-radius:6px;border:1px solid #b8945d;background:#3b3130;color:#fff;cursor:pointer;font-weight:bold;">城を出る</button>
                    </div>
                </div>`;
            document.body.appendChild(ui);
            ui.querySelector('#castle-exit-button').addEventListener('click', () => window.sendCastleChatCommand('城を出る'));
        }
        ui.style.display = 'flex';
        setupChatUI(ui);
        window.castleMapOpen = true;
        window._blockChatFocus = true;
        ai.isIndoors = true;
        ai.actionState = 'inside';
        ai.visualAction = 'idle';
        ai.castleDirection = state.player.dir;
        const currentAssets = typeof assets !== 'undefined' ? assets : (window.assets || {});
        ai.indoorTarget = Object.values(currentAssets).find(asset => asset && asset.type === 'castle') || { type: 'castle', name: '王城' };
        if (window.audioManager) window.audioManager.playBGM('arena_lobby');
        window.renderCastleMap(!!opts.forceRebuild);
        setTimeout(() => {
            const input = document.getElementById('castle-chat-input');
            if (input) input.focus();
        }, 80);
        return true;
    };

    window.suspendCastleMapUI = function () {
        const ui = document.getElementById('castle-map-ui');
        if (ui) ui.style.display = 'none';
        window.closeCastleDialogue();
        if (window.castleMoveTimer) clearInterval(window.castleMoveTimer);
        window.castleMoveTimer = null;
    };

    window.returnToCastleMap = function (npcId) {
        ['arena-reception-ui', 'arena-battle-ui', 'arena-interval-ui', 'defense-sortie-ui', 'def-result-overlay'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
        window._castleArenaQuestOrigin = false;
        if (window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE.castleQuestOrigin = false;
        window.openCastleMapUI({ preservePosition: true });
        const npc = NPC_DATA[npcId];
        if (npc) setCastleMessage(`${npc.name}のいる${ROOM_DATA[npc.room].name}へ戻りました。`);
    };

    window.closeCastleMapUI = function () {
        window.closeCastleDialogue();
        const ui = document.getElementById('castle-map-ui');
        if (ui) ui.remove();
        if (window.castleMoveTimer) clearInterval(window.castleMoveTimer);
        window.castleMoveTimer = null;
        window.castleMapOpen = false;
        window._blockChatFocus = false;
        window._castleArenaQuestOrigin = false;
        if (window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE.castleQuestOrigin = false;
        if (window.DEFENSE_STATE) window.DEFENSE_STATE.castleQuestOrigin = false;
        const ai = window.aiPet || window.hero || {};
        ai.castleMoving = false;
        ai.isIndoors = false;
        ai.actionState = 'idle';
        ai.visualAction = 'idle';
        ai.indoorTarget = null;
        ai.interactionTarget = null;
        ai.message = 'お城から出たよ！';
        ai.messageTimer = 120;
        if (Array.isArray(ai.schedule) && ai.schedule.length && ai.schedule[0] && (ai.schedule[0].type === 'visit' || ai.schedule[0].type === '城に行く')) ai.schedule.shift();
        if (Number.isFinite(ai.y)) ai.y += 20;
        if (window.audioManager) window.audioManager.restoreMainBGM();
        if (typeof updateScheduleList === 'function') updateScheduleList();
        if (typeof updateUI === 'function') updateUI();
        if (typeof saveGameData === 'function') saveGameData();
    };

    window.startCastleDefenseQuest = function (mode) {
        window.closeCastleDialogue();
        if (!window.DEFENSE_STATE || typeof window.openDefenseSortieUI !== 'function') {
            setCastleMessage('防衛戦の準備がまだ整っていません。');
            return false;
        }
        if (mode === 'endless' && Number((window.aiPet && window.aiPet.defenseWave) || 1) <= 10) return false;
        if (window.DEFENSE_STATE.emergencyTimer) clearInterval(window.DEFENSE_STATE.emergencyTimer);
        window.DEFENSE_STATE.emergencyTimer = null;
        window.DEFENSE_STATE.isEmergency = false;
        window.DEFENSE_STATE.castleQuestOrigin = true;
        window.DEFENSE_STATE.questAcceptedAt = Date.now();
        const marquee = document.getElementById('emergency-marquee');
        if (marquee) marquee.style.display = 'none';
        window.suspendCastleMapUI();
        window.openDefenseSortieUI(mode === 'endless' ? 'endless' : 'normal');
        return true;
    };

    window.startCastleArenaQuest = function () {
        window.closeCastleDialogue();
        if (typeof window.openArenaReception !== 'function') {
            setCastleMessage('闘技場の準備がまだ整っていません。');
            return false;
        }
        if (typeof window.checkOnlineFeatureAccess === 'function' && !window.checkOnlineFeatureAccess()) {
            setCastleMessage('闘技場クエストにはログインが必要です。');
            return false;
        }
        window._castleArenaQuestOrigin = true;
        window.suspendCastleMapUI();
        window.openArenaReception();
        if (window.ARENA_RECEPTION_STATE) window.ARENA_RECEPTION_STATE.castleQuestOrigin = true;
        return true;
    };

    window.addEventListener('resize', () => {
        if (window.castleMapOpen) window.renderCastleMap();
    });
})();
