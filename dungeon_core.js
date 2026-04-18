window.DUNGEON_AVAILABLE_COMMANDS = [
    { id: "move_up", name: "うえ" }, { id: "move_down", name: "した" },
    { id: "move_left", name: "ひだり" }, { id: "move_right", name: "みぎ" },
    { id: "face_up", name: "うえむき" }, { id: "face_down", name: "したむき" }, // ★追加(0ターン)
    { id: "face_left", name: "ひだりむき" }, { id: "face_right", name: "みぎむき" }, // ★追加(0ターン)
    { id: "attack", name: "たたかう" }, { id: "heal", name: "かいふく" },
    { id: "eat", name: "たべる" }, 
    { id: "equip", name: "そうび" }, { id: "unequip", name: "はずす" },
    { id: "flee", name: "にげる" },
    { id: "use", name: "つかう" },
    { id: "synthesize", name: "ごうせい" },
    { id: "identify", name: "しらべる" }, // ★追加（鑑定）
    { id: "name_item", name: "なまえ" },    // ★追加（推測して仮名をつける）
    { id: 'throw', name: 'なげる' },
    { id: 'put_down', name: 'おく' }
];

window.DUNGEON_STATE = {
    active: false, isAuto: false, mapWidth: 30, mapHeight: 30, floor: 1, mapType: 'skull',
    player: { x: 15, y: 15, hp: 100, maxHp: 100, face: 'down', type: 'robot', skin: 'robot', attackAnim: false, atkBuff: 0, defBuff: 0, hunger: 100, level: 1, exp: 0, nextExp: 20, tempInventory: [] },
    enemies: [], grid: [], log: []
};

window.dungeonAutoInterval = null;


// ★修正: 第2引数(startFloor)を受け取れるようにする
window.openDungeonUI = function(mapType = 'skull', startFloor = null) {
    const s = window.DUNGEON_STATE;
    
    // ==========================================
    // ★ 新規追加：未識別アイテムのランダム辞書生成
    // ==========================================
    const randomizeArray = (arr) => arr.slice().sort(() => Math.random() - 0.5);
    
    // 見た目のバリエーション
    const grassNames = randomizeArray(['赤い草', '青い草', '黄色い草', '緑の草', '紫の草', '白い草', '黒い草', '虹色の草', '星型の草']);
    const scrollNames = randomizeArray(['シワシワの巻物', '古びた巻物', '濡れた巻物', '燃えかけの巻物', '金箔の巻物', '血塗られた巻物', '星印の巻物', '無地の巻物']);
    const wandNames = randomizeArray(['曲がった杖', 'まっすぐな杖', 'ドクロの杖', '水晶の杖', '短い杖', '長い杖', '黄金の杖', '黒檀の杖']);
    
    // 実際のアイテムID
    const realGrasses = ['herb', 'item_berry', 'item_seed_happy']; // パンや魚は識別済みとする
    const realScrolls = ['item_scroll_sleep', 'item_scroll_confuse', 'item_scroll_identify']; // ★識別の巻物を後で追加します
    const realWands = ['item_wand_fire', 'item_wand_swap', 'item_wand_blow'];
    
    // 今回の冒険のハッシュマップ（正体と見た目の紐付け）
    s.sessionItemDict = {};
    // AIの記憶（完全に識別したか、仮名をつけているか）
    s.aiMemory = { identified: [], tempNames: {} };

    realGrasses.forEach((id, idx) => s.sessionItemDict[id] = grassNames[idx]);
    realScrolls.forEach((id, idx) => s.sessionItemDict[id] = scrollNames[idx]);
    realWands.forEach((id, idx) => s.sessionItemDict[id] = wandNames[idx]);

    // ★追加: デバッグの階層指定があれば優先、無ければ1階から
    let floor = startFloor || (window.dungeonState && window.dungeonState.floor) || 1;
    s.mapType = mapType; s.floor = floor;
    if (window.dungeonState) window.dungeonState = null; // リセット
    
    let currentSkin = 'robot'; let currentType = 'robot';
    if (window.aiPet) {
        currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        currentType = currentSkin.split('_')[0]; 
    }
    
    s.player.type = currentType;
    s.player.skin = currentSkin;
    s.player.atkBuff = 0; s.player.defBuff = 0;

    // ★追加：育成モードからのステータス引継ぎ
    let pEnergy = window.aiPet && window.aiPet.energy !== undefined ? window.aiPet.energy : 100;
    let pHunger = window.aiPet && window.aiPet.hunger !== undefined ? window.aiPet.hunger : 100;
    
    s.player.maxHunger = 100; // 上限突破用

    if (mapType === 'crystal') {
        s.player.maxHp = 100;
        s.player.hp = Math.max(1, Math.floor(100 * (pEnergy / 100))); // 現在の体力割合を引き継ぐ
        s.player.hunger = pHunger; // 満腹度を引き継ぐ
        s.player.level = 1;
        s.player.exp = 0;
        s.player.nextExp = 20;
        s.player.basePwr = 10;
        s.player.tempInventory = []; 
    } else {
        if (window.aiPet) {
            let pwr = window.aiPet.stats.power || 10;
            let gen = window.aiPet.generation || 1;
            let age = window.aiPet.age || 0;
            s.player.maxHp = 100 + (pwr * 2) + (gen * 5) + (age * 2);
            s.player.hp = Math.max(1, Math.floor(s.player.maxHp * (pEnergy / 100))); // 現在の体力割合
            s.player.hunger = pHunger; // 満腹度を引き継ぐ
            s.player.basePwr = pwr;
            s.player.tempInventory = window.aiPet.inventory ? [...window.aiPet.inventory] : [];
        }
    }
    
    window.generateDungeonFloor(); s.active = true;

    let dungeonUI = document.getElementById('dungeon-main-ui');
    if (!dungeonUI) {
        dungeonUI = document.createElement('div'); dungeonUI.id = 'dungeon-main-ui';
        dungeonUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 30000; display: flex; flex-direction: column; color: white; font-family: monospace, sans-serif; overflow: hidden;`;
        document.body.appendChild(dungeonUI);
    }
    
    let titleColor = mapType === 'crystal' ? '#E040FB' : '#00BCD4';
    let titleName = mapType === 'crystal' ? '💎 クリスタル迷宮' : '🗡️ スカルダンジョン';
    let levelHtml = mapType === 'crystal' ? `<span style="display:inline-block; margin-left:15px; color:#E040FB; font-weight:bold;">Lv.${s.player.level}</span>` : '';

    // ★ 修正：ステータスパネルの中に「持ち込みアイテム」の表示枠を追加
    dungeonUI.innerHTML = `
        <style>
            @keyframes atk-up { 0% { transform: translateY(0); } 50% { transform: translateY(-30px); } 100% { transform: translateY(0); } }
            @keyframes atk-down { 0% { transform: translateY(0); } 50% { transform: translateY(30px); } 100% { transform: translateY(0); } }
            @keyframes atk-left { 0% { transform: translateX(0); } 50% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
            @keyframes atk-right { 0% { transform: translateX(0); } 50% { transform: translateX(30px); } 100% { transform: translateX(0); } }
            .anim-atk-up { animation: atk-up 0.15s ease-out; } .anim-atk-down { animation: atk-down 0.15s ease-out; }
            .anim-atk-left { animation: atk-left 0.15s ease-out; } .anim-atk-right { animation: atk-right 0.15s ease-out; }
            
            /* ★追加：ダメージエフェクト（赤く光って揺れる） */
            @keyframes dmg-shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                50% { transform: translateX(8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                75% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                100% { transform: translateX(0); filter: none; }
            }
            .anim-damage { animation: dmg-shake 0.2s ease-in-out; }
            
            /* ★追加：画面全体の振動 */
            @keyframes screen-shake {
                0% { transform: translate(0, 0); }
                20% { transform: translate(-3px, 3px); }
                40% { transform: translate(3px, -3px); }
                60% { transform: translate(-3px, -3px); }
                80% { transform: translate(3px, 3px); }
                100% { transform: translate(0, 0); }
            }
            .anim-screen-shake { animation: screen-shake 0.15s ease-in-out; }
            
            /* ★追加：ダメージ数値のポップアップ */
            /* ★追加：ダメージ数値のポップアップ */
            @keyframes dmg-popup {
                0% { transform: translateY(0) scale(1.5); opacity: 1; }
                100% { transform: translateY(-60px) scale(1); opacity: 0; }
            }
            .dmg-text {
                position: absolute; font-weight: bold; font-size: 36px;
                text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
                pointer-events: none; z-index: 1000;
                animation: dmg-popup 0.6s ease-out forwards;
            }
            
            /* ★追加：吹き飛ばし（ノックバック）の回転エフェクト */
            @keyframes spin-knockback {
                0% { transform: rotate(0deg) scale(1.2); filter: drop-shadow(0 0 10px #FF9800); }
                100% { transform: rotate(360deg) scale(1); filter: none; }
            }
            .anim-knockback { animation: spin-knockback 0.3s ease-out !important; }
            /* ★追加：ワープ、魔法、レベルアップのエフェクト */
            @keyframes warp-out-in {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0) rotate(180deg); opacity: 0; }
                100% { transform: scale(1) rotate(360deg); opacity: 1; }
            }
            .anim-warp { animation: warp-out-in 0.4s ease-in-out; }
            
            @keyframes magic-cast {
                0% { filter: drop-shadow(0 0 15px #00BCD4) brightness(1.5); transform: translateY(0); }
                50% { filter: drop-shadow(0 0 25px #E040FB) brightness(2); transform: translateY(-10px); }
                100% { filter: none; brightness(1); transform: translateY(0); }
            }
            .anim-magic { animation: magic-cast 0.5s ease-out; }
            
            @keyframes level-up-glow {
                0% { filter: drop-shadow(0 0 10px #FFD700) brightness(1.5); }
                50% { filter: drop-shadow(0 0 40px #FFEB3B) brightness(2.5); transform: scale(1.2); }
                100% { filter: none; transform: scale(1); }
            }
            .anim-levelup { animation: level-up-glow 0.8s ease-out; z-index: 10; position: relative; }
        </style>
        <div id="dg-map-container" style="position:absolute; width:100%; height:100%; overflow:hidden;">
            <div id="dg-grid" style="position:absolute; top:0; left:0; transition: transform 0.2s linear; transform-origin: 0 0;"></div>
        </div>
        <div style="position:absolute; top:0; left:0; width:100%; padding:20px; display:flex; justify-content:space-between; pointer-events:none; box-sizing:border-box; z-index:50;">
            <div style="pointer-events:auto; background:rgba(0,0,0,0.85); padding:15px 20px; border-radius:8px; border:2px solid #555; min-width:300px;">
                <div style="font-size: 22px; font-weight:bold; color:${titleColor}; margin-bottom:5px;">${titleName} B<span id="dg-floor">1</span>F</div>
                <div style="font-size: 18px;">
                    <span style="display:inline-block; width:100px;">HP: <span id="dg-hp" style="color:#4CAF50; font-weight:bold;">100</span> / <span id="dg-max-hp">100</span></span>
                    <span style="display:inline-block; margin-left:15px;">満腹: <span id="dg-hunger" style="color:#FF9800; font-weight:bold;">100</span>%</span>
                    <span id="dg-level-display">${levelHtml}</span>
                </div>
                <div id="dg-inventory-container" style="margin-top: 12px; border-top: 1px dashed #555; padding-top: 8px; display: block;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 12px; color: #aaa;">🎒 持ち込みアイテム (自動消費)</span>
                        <button onclick="window.showEquipDetailsModal()" style="padding:4px 8px; background:#FF9800; color:#fff; border:none; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.5);">🔍 装備詳細と印</button>
                    </div>
                    <div id="dg-inventory-list" style="font-size: 13px; max-height: 60px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 5px;">
                        </div>
                </div>
            </div>
            <div style="pointer-events:auto; display:flex; gap:10px; align-items:flex-start;">
                <button onclick="window.toggleDungeonModal('minimap')" style="padding:10px 15px; background:#2196F3; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">🗺️ マップ</button>
                <button onclick="window.toggleDungeonModal('log')" style="padding:10px 15px; background:#9C27B0; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">📜 ログ</button>
                <button onclick="window.closeDungeonUI(false)" style="padding:10px 15px; background:#ff5252; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">帰還する</button>
            </div>
        </div>
        <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); pointer-events:none; width:100%; display:flex; flex-direction:column; align-items:center; z-index:50;">
            <div style="background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; display:flex; gap:10px; margin-bottom:15px; pointer-events:auto; border:1px solid #555;">
                <input type="text" id="dg-chat-input" placeholder="AIに言葉を教える..." style="padding:8px; border-radius:4px; border:none; outline:none; width:200px;">
                <button onclick="window.processDungeonChat()" style="padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">送信</button>
            </div>
            <div style="color:#FFD700; font-size:16px; font-weight:bold; margin-bottom:10px; text-shadow:2px 2px 4px #000;">🧠 使える言葉</div>
            <div id="dg-known-words" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:20px; pointer-events:auto;"></div>
            <div style="display:flex; gap:15px; pointer-events:auto;">
                <button id="dg-step-btn" onclick="window.processDungeonTurn()" style="padding: 15px 30px; font-size: 20px; font-weight: bold; background: #4CAF50; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #2E7D32, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #2E7D32';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #2E7D32';">▶ 1ターン</button>
                <button id="dg-auto-btn" onclick="window.toggleDungeonAuto()" style="padding: 15px 20px; font-size: 18px; font-weight: bold; background: #2196F3; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #0D47A1';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #0D47A1';">🔄 AUTO 開始</button>
            </div>
        </div>
        <div id="dg-modal-log" style="display:none; position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); width:80%; max-width:600px; height:50%; background:rgba(10,10,15,0.9); border:3px solid #9C27B0; border-radius:12px; padding:20px; flex-direction:column; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8);"><h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 冒険の記録</h3><div id="dg-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.8; font-size:16px; padding-right:10px;"></div><button onclick="window.toggleDungeonModal('log')" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button></div>
        <div id="dg-modal-minimap" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(10,10,15,0.8); border:3px solid #2196F3; border-radius:12px; padding:20px; flex-direction:column; align-items:center; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8); width:90vw; max-width:500px; height:80vh; max-height:600px;">
            <h3 style="color:#FFF; margin-top:0; width:100%; border-bottom:1px solid #555; padding-bottom:10px; text-align:center; flex-shrink:0;">🗺️ ミニマップ</h3>
            
            <div id="dg-minimap-content" style="background:rgba(0,0,0,0.4); border:2px solid #555; position:relative; margin:15px 0; overflow:hidden; flex:1; width:100%; display:flex; justify-content:center; align-items:center;">
                <style>
                    #dg-minimap-content canvas {
                        max-width: 100%;
                        max-height: 100%;
                        width: auto !important;
                        height: auto !important;
                        object-fit: contain;
                    }
                </style>
            </div>
            
            <button onclick="window.toggleDungeonModal('minimap')" style="padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%; flex-shrink:0;">閉じる</button>
        </div>
    `;
    
    let pName = (window.aiPet && window.aiPet.name) ? window.aiPet.name : "AI";
    dungeonUI.style.display = 'flex';
    window.addDungeonLog(`=== ${pName} の冒険が始まった ===`, titleColor); 
    
    document.getElementById('dg-chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.processDungeonChat();
    });
    
    window.updateDungeonUI();
};

window.closeDungeonUI = function(isGameOver = false, isRescued = false) {
    const s = window.DUNGEON_STATE; s.active = false;
    if (s.isAuto) window.toggleDungeonAuto();
    
    // ★修正：死んだ時だけでなく「無事に帰還した時」もしっかりランキングに記録を送信する！
    if (typeof window.updateDungeonRanking === 'function') {
        window.updateDungeonRanking(s.mapType, s.floor, s.player.level);
    }
    
    let reachedFloor = s.floor; 
    let goldReward = reachedFloor * (s.mapType === 'crystal' ? 100 : 50); 
    let itemsReward = [];
    
    if (reachedFloor > 1 && (!isGameOver || isRescued)) {
        let numItems = Math.floor(reachedFloor / 2);
        const dropPool = s.mapType === 'crystal' ? ['crystal', 'item_berry'] : ['stone', 'iron', 'item_berry']; 
        for (let i = 0; i < numItems; i++) itemsReward.push(dropPool[Math.floor(Math.random() * dropPool.length)]);
        
        if (s.mapType === 'skull') {
            if (reachedFloor >= 5) itemsReward.push('mat_castle_1');
            if (reachedFloor >= 10) itemsReward.push('mat_castle_2');
            if (reachedFloor >= 20) itemsReward.push('mat_castle_3');
        } else if (s.mapType === 'crystal') {
            if (reachedFloor >= 5) itemsReward.push('mat_casino_1');
            if (reachedFloor >= 10) itemsReward.push('mat_casino_2');
            if (reachedFloor >= 20) itemsReward.push('mat_casino_3');
            if (reachedFloor >= 25) itemsReward.push('mat_card_1');
        }
    }
    
    if (isGameOver && !isRescued) { 
        goldReward = Math.floor(goldReward / 2); 
        itemsReward = itemsReward.slice(0, Math.floor(itemsReward.length / 2)); 
    }
    
    if (window.aiPet) {
        if (typeof window.aiPet.gold === 'undefined') window.aiPet.gold = 0;
        window.aiPet.gold += goldReward;
        
        // ★修正：武器と盾だけでなく、鎧と装飾品も一旦鞄に戻して持ち帰る準備をする
        if (s.player.equipWeapon) { s.player.tempInventory.push(s.player.equipWeapon); s.player.equipWeapon = null; }
        if (s.player.equipShield) { s.player.tempInventory.push(s.player.equipShield); s.player.equipShield = null; }
        if (s.player.equipArmor) { s.player.tempInventory.push(s.player.equipArmor); s.player.equipArmor = null; }
        if (s.player.equipAccessory) { s.player.tempInventory.push(s.player.equipAccessory); s.player.equipAccessory = null; }
        
        if (!window.aiPet.inventory) window.aiPet.inventory = [];

        // ★大改修：クリスタルダンジョンでも生還すれば道中のアイテムを持ち帰れる！
        if (!isGameOver || isRescued) {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = [...s.player.tempInventory]; 
            } else if (s.mapType === 'crystal') {
                s.player.tempInventory.forEach(item => window.aiPet.inventory.push(item));
            }
        } else {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = []; // スカルで死んだらロスト
            }
            // クリスタルで死んだ場合は、元々のインベントリは失われない
        }
        
        itemsReward.forEach(item => window.aiPet.inventory.push(item)); 
        if (typeof saveGameData === 'function') saveGameData();
        
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
        }
    }

    // ==========================================
    // ★大追加：死んだ時の状況を「ミニチュア画面」としてコピーして表示する！
    // ==========================================
    let snapshotHtml = "";
    if (isGameOver && !isRescued) {
        let gridDiv = document.getElementById('dg-grid');
        if (gridDiv) {
            // 倒れた瞬間のマップDOMを丸ごとクローン
            let cloneGrid = gridDiv.cloneNode(true);
            cloneGrid.id = ''; 
            
            let boxW = 400; let boxH = 220; // 状況を表示する小窓のサイズ
            let logicalTileX = 100; let logicalTileY = 100;
            let prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
            let floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
            if (floorSp) { logicalTileX = floorSp.sw * (floorSp.scale || 1.0); logicalTileY = floorSp.sh * (floorSp.scale || 1.0); }
            
            // 死んだ時のプレイヤー座標を中心にカメラを合わせ直す
            let camZoom = 0.7; // ちょっとズームして状況を見やすく
            let px = s.player.x * logicalTileX + (logicalTileX / 2);
            let py = s.player.y * logicalTileY + (logicalTileY / 2);
            let nCamX = (boxW / 2) - px * camZoom;
            let nCamY = (boxH / 2) - py * camZoom;
            
            cloneGrid.style.transform = `translate(${nCamX}px, ${nCamY}px) scale(${camZoom})`;
            cloneGrid.style.transition = 'none'; // カメラのパンを防ぐ
            
            // 枠組みの作成
            let wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = `${boxW}px`;
            wrapper.style.height = `${boxH}px`;
            wrapper.style.margin = '0 auto 10px auto';
            wrapper.style.border = '3px solid #ff5252';
            wrapper.style.borderRadius = '8px';
            wrapper.style.backgroundColor = '#000';
            wrapper.style.overflow = 'hidden';
            wrapper.appendChild(cloneGrid);
            
            // ★死ぬ直前のログ（死因）を最新4行だけ抽出して貼り付ける
            let logHtml = "";
            let logArea = document.getElementById('dg-log-area');
            if (logArea && logArea.children.length > 0) {
                let lastLogs = Array.from(logArea.children).slice(-4);
                logHtml = `<div style="text-align:left; background:rgba(0,0,0,0.8); padding:8px; border-radius:6px; font-size:13px; color:#ddd; margin-bottom:15px; border:1px dashed #ff5252;">`;
                lastLogs.forEach(l => logHtml += `<div style="margin-bottom:3px;">${l.innerHTML}</div>`);
                logHtml += `</div>`;
            }

            snapshotHtml = `<div style="color:#ff5252; font-size:16px; margin-bottom:5px; font-weight:bold;">📷 倒れた瞬間の状況</div>` + wrapper.outerHTML + logHtml;
        }
    }
    // ==========================================

    let rewardHtml = `<div style="font-size:22px; margin-bottom:20px;">到達フロア: <b>B${reachedFloor}F</b></div>`;
    rewardHtml += `<div style="color:#FFD700; font-size:24px; font-weight:bold; margin-bottom:15px;">💰 ${goldReward} G 獲得！</div>`;
    
    if (itemsReward.length > 0 || (!isGameOver || isRescued)) {
        // 表示用に、持ち帰ったすべてを合算
        let displayRewards = [...itemsReward];
        if (!isGameOver || isRescued) {
            if (s.mapType === 'crystal') displayRewards = displayRewards.concat(s.player.tempInventory);
        }
        
        if (displayRewards.length > 0) {
            let itemCounts = {}; displayRewards.forEach(i => itemCounts[i] = (itemCounts[i]||0) + 1);
            rewardHtml += `<div style="text-align:left; background:#222; padding:15px; border-radius:8px; border:2px solid #555; width:80%; margin:0 auto; max-height: 200px; overflow-y: auto;">`;
            rewardHtml += `<div style="color:#aaa; font-size:14px; margin-bottom:5px;">▼ 持ち帰ったアイテム</div>`;
            for(let key in itemCounts) {
                // ★完全修正：getDungeonItemEffect を通すことで、＋値も印もすべて綺麗な日本語に翻訳される！
                let eff = window.getDungeonItemEffect(key);
                let itemName = eff ? eff.name : key;
                
                let nameColor = key.startsWith('mat_') ? '#E040FB' : '#FFF';
                // 装備品は特別な色（金色）にする
                if (eff && (eff.equipType !== null)) nameColor = '#FFD700';
                
                rewardHtml += `<div style="font-size:18px; color:${nameColor};">🎁 ${itemName} <span style="color:#4CAF50;">x ${itemCounts[key]}</span></div>`;
            }
            rewardHtml += `</div>`;
        }
    } else {
        rewardHtml += `<div style="color:#aaa; margin-top:20px;">アイテムの獲得はありませんでした。</div>`;
    }

    let actionButtons = "";
    if (isGameOver && !isRescued) {
        actionButtons = `
            <div style="display:flex; gap:15px; justify-content:center; margin-top:25px;">
                <button onclick="window.sendRescueRequest('${s.mapType}', ${s.floor})" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#2196F3; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #0D47A1;">
                    🆘 救助を要請する
                </button>
                <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#444; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #222;">
                    諦めて村へ戻る
                </button>
            </div>
            <div style="font-size:12px; color:#ff9800; margin-top:10px;">※救助を要請すると、助けが来るまでゲームが進行できなくなります。</div>
        `;
    } else {
        let titleWord = isRescued ? '👼 救助されました！' : '✨ 探索完了！';
        actionButtons = `
            <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                    style="margin-top:30px; padding:15px 40px; font-size:20px; font-weight:bold; background:#4CAF50; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 6px 0 #2E7D32;">
                ${isRescued ? '冒険を再開する！' : '村へ戻る ➔'}
            </button>
        `;
    }

    let resultUI = document.getElementById('dg-result-ui');
    if (!resultUI) {
        resultUI = document.createElement('div'); resultUI.id = 'dg-result-ui';
        resultUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 40000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif; overflow-y:auto;`;
        document.body.appendChild(resultUI);
    }
    
    let resultTitle = isGameOver && !isRescued ? '💀 探索失敗...' : (isRescued ? '👼 救助成功！' : '✨ 探索完了！');
    let titleColorStr = isGameOver && !isRescued ? '#ff5252' : '#FFD700';

    resultUI.innerHTML = `
        <div style="background:#1a1a1a; border:4px solid ${titleColorStr}; border-radius:12px; padding:30px; text-align:center; min-width:400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); margin: 20px 0;">
            <h2 style="color:${titleColorStr}; font-size:32px; margin-top:0; margin-bottom:15px;">${resultTitle}</h2>
            ${snapshotHtml} ${rewardHtml}
            ${actionButtons}
        </div>
    `;
    resultUI.style.display = 'flex';
};

window.processDungeonChat = function() {
    const input = document.getElementById('dg-chat-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = "";
    
    const ai = window.aiPet;
    if (!ai || !ai.apprentice) return;
    if (!ai.apprentice.learnedWords) ai.apprentice.learnedWords = [];
    
    const forgetMatch = text.match(/(.+)を(?:忘|わす)れて/);
    if (forgetMatch) {
        let targetWord = forgetMatch[1].trim();
        const idx = ai.apprentice.learnedWords.indexOf(targetWord);
        if (idx !== -1) {
            ai.apprentice.learnedWords.splice(idx, 1);
            window.addDungeonLog(`「${targetWord}」という言葉を忘れた...`, '#FF9800');
            if (typeof saveGameData === 'function') saveGameData();
        }
        window.updateDungeonUI();
        return;
    }
    
    const maxWords = (typeof ai.getMaxVocabulary === 'function') ? ai.getMaxVocabulary() : 5;
    if (ai.apprentice.learnedWords.includes(text)) {
        window.addDungeonLog(`「${text}」はもう知ってるよ！`, '#aaa');
    } else if (ai.apprentice.learnedWords.length >= maxWords) {
        window.addDungeonLog(`記憶がいっぱいで「${text}」は覚えられない...`, '#ff5252');
    } else {
        ai.apprentice.learnedWords.push(text);
        window.addDungeonLog(`「${text}」という言葉を学習した！`, '#FFD700');
        if (typeof saveGameData === 'function') saveGameData();
    }
    window.updateDungeonUI();
};


window.toggleDungeonModal = function(type) {
    const logModal = document.getElementById('dg-modal-log'); const mapModal = document.getElementById('dg-modal-minimap');
    if (type === 'log') { logModal.style.display = logModal.style.display === 'none' ? 'flex' : 'none'; mapModal.style.display = 'none'; } 
    else if (type === 'minimap') { mapModal.style.display = mapModal.style.display === 'none' ? 'flex' : 'none'; logModal.style.display = 'none'; if (mapModal.style.display === 'flex') window.drawMinimap(); }
};

window.toggleDungeonAuto = function() {
    window.DUNGEON_STATE.isAuto = !window.DUNGEON_STATE.isAuto;
    const btn = document.getElementById('dg-auto-btn');
    if (window.DUNGEON_STATE.isAuto) {
        btn.innerHTML = "⏸ AUTO 停止"; btn.style.background = "#FF9800"; btn.style.boxShadow = "0 8px 0 #E65100, 0 15px 20px rgba(0,0,0,0.5)";
        window.dungeonAutoInterval = setInterval(() => { if (window.DUNGEON_STATE.active) window.processDungeonTurn(); }, 350);
    } else {
        btn.innerHTML = "🔄 AUTO 開始"; btn.style.background = "#2196F3"; btn.style.boxShadow = "0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5)";
        clearInterval(window.dungeonAutoInterval);
    }
};



// 救助要請ボタンを押した時の処理
window.sendRescueRequest = async function(mapType, floor) {
    // ボタンを無効化
    event.target.disabled = true;
    event.target.innerHTML = "⏳ 要請送信中...";
    
    if (typeof window.requestRescue === 'function') {
        const success = await window.requestRescue(mapType, floor);
        if (success) {
            // 要請に成功したら、ゲーム全体を「救助待ち画面」で覆ってロックする
            document.getElementById('dg-result-ui').style.display = 'none';
            document.getElementById('dungeon-main-ui').style.display = 'none';
            window.showRescueWaitingScreen();
        } else {
            alert("通信エラー：救助要請を送信できませんでした。ログイン状態を確認してください。");
            event.target.disabled = false;
            event.target.innerHTML = "🆘 救助を要請する";
        }
    }
};

// 救助待ち画面の表示（ゲームのロック）
window.showRescueWaitingScreen = function() {
    let waitingUI = document.getElementById('rescue-waiting-ui');
    if (!waitingUI) {
        waitingUI = document.createElement('div'); waitingUI.id = 'rescue-waiting-ui';
        waitingUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 50000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
        document.body.appendChild(waitingUI);
    }
    
    waitingUI.innerHTML = `
        <div style="text-align:center;">
            <h1 style="color:#2196F3; font-size:40px; margin-bottom:10px;">🆘 救助待ち...</h1>
            <p style="font-size:18px; color:#aaa; line-height:1.6; margin-bottom:30px;">
                他の冒険者が同じダンジョンを探索し、<br>
                あなたの倒れた階層にたどり着くのを待っています。<br>
                （この画面を閉じたりリロードしても状態は保持されます）
            </p>
            <div id="rescue-check-status" style="font-size:24px; font-weight:bold; color:#FFD700; margin-bottom:30px;">
                📡 空の彼方へ通信中...
            </div>
            <button onclick="window.cancelRescueRequest()" 
                    style="padding:12px 20px; font-size:16px; background:#444; color:white; border:none; border-radius:8px; cursor:pointer;">
                救助を諦めて村へ戻る（アイテムは全て失われます）
            </button>
        </div>
    `;
    waitingUI.style.display = 'flex';
    
    // ★修正: 20秒ごとに救助されたかチェックする（無料枠節約のために間隔を延長！）
    window.rescueCheckInterval = setInterval(async () => {
        if (typeof window.checkMyRescueStatus === 'function') {
            const isRescued = await window.checkMyRescueStatus();
            if (isRescued) {
                clearInterval(window.rescueCheckInterval);
                document.getElementById('rescue-check-status').innerHTML = "👼 救助されました！！";
                document.getElementById('rescue-check-status').style.color = "#4CAF50";
                
                // 3秒後に救助待ち画面を消して、ダンジョンUIを再開モードで開く
                setTimeout(() => {
                    document.getElementById('rescue-waiting-ui').style.display = 'none';
                    localStorage.removeItem('rescue_waiting_map');
                    localStorage.removeItem('rescue_waiting_floor');
                    
                    // HPと満腹度を半分にして復活！
                    window.DUNGEON_STATE.player.hp = Math.floor(window.DUNGEON_STATE.player.maxHp / 2);
                    window.DUNGEON_STATE.player.hunger = 50;
                    
                    // リザルト画面（救助成功版）を表示して再開
                    window.closeDungeonUI(false, true); 
                }, 3000);
            }
        }
    }, 20000);
};

// 救助を諦める処理
window.cancelRescueRequest = function() {
    if (confirm("本当に救助を諦めますか？（持ち物は全て失われます）")) {
        clearInterval(window.rescueCheckInterval);
        document.getElementById('rescue-waiting-ui').style.display = 'none';
        localStorage.removeItem('rescue_waiting_map');
        localStorage.removeItem('rescue_waiting_floor');
        // 諦めた場合は完全にロスト（何も渡さずUIを消す）
        if (window.aiPet) window.aiPet.inventory = [];
        if (typeof saveGameData === 'function') saveGameData();
    }
};

// ゲーム読み込み時に救助待ち状態なら画面をロックする（main.jsなどの初期化処理に後で追加します）
if (localStorage.getItem('rescue_waiting_map')) {
    setTimeout(window.showRescueWaitingScreen, 1000);
}

// ==========================================
// 🚪 ダンジョン突入用フック ＆ 拠点時間停止パッチ
// ==========================================
(function() {
    if (typeof window.aiPet === 'undefined') return;

    if (!window.aiPet._dungeonPatchApplied) {
        window.aiPet._dungeonPatchApplied = true;

        // ダンジョン突入処理の共通関数
        const handleDungeonEntry = function(context) {
            if (context.interactionTarget && (context.interactionTarget.type === 'skull' || context.interactionTarget.type === 'crystal')) {
                let isMasterExplorer = (context.apprentice && context.apprentice.rank && context.apprentice.rank['explore'] >= 10);
                context.actionState = 'idle'; context.isIndoors = false; context.indoorTarget = null;
                
                // ★大修正：皆伝済みなら全消去して突入、未皆伝なら現在のタスクだけ消して追い出す！
                if (isMasterExplorer) {
                    context.schedule = []; // 予定を全クリア
                    if (typeof window.triggerTCGUnlock === 'function') {
                        if (context.interactionTarget.type === 'skull') window.triggerTCGUnlock('visit_cave', context.generation);
                        if (context.interactionTarget.type === 'crystal') window.triggerTCGUnlock('visit_mine', context.generation);
                    }
                    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                    if (typeof window.openDungeonUI === 'function') window.openDungeonUI(context.interactionTarget.type);
                } else {
                    context.message = "ここから先は危険だ...\n（免許皆伝が必要）"; context.messageTimer = 120;
                    if (context.schedule.length > 0 && context.schedule[0].type === 'explore') context.schedule.shift();
                    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                }
                return true;
            }
            return false;
        };

        // 探索・移動衝突時にフック
        const _origExplore = window.aiPet.processExploration;
        const _safeExplore = function() {
            if (handleDungeonEntry(this)) return;
            if (typeof _origExplore === 'function') _origExplore.call(this);
        };
        window.aiPet.processExploration = _safeExplore;
        if (window.AICharacter) window.AICharacter.prototype.processExploration = _safeExplore;

        const _origEnter = window.aiPet.executeEnterAction;
        const _safeEnter = function() {
            if (handleDungeonEntry(this)) return;
            if (typeof _origEnter === 'function') _origEnter.call(this);
        };
        window.aiPet.executeEnterAction = _safeEnter;
        if (window.AICharacter) window.AICharacter.prototype.executeEnterAction = _safeEnter;

        // ダンジョン中は拠点の時間（update）を完全に止める
        const _baseUpdate = window.aiPet.update;
        const _safeUpdate = function(dt) {
            if (window.DUNGEON_STATE && window.DUNGEON_STATE.active) return;
            if (typeof _baseUpdate === 'function') _baseUpdate.call(this, dt);
        };
        window.aiPet.update = _safeUpdate;
        if (window.AICharacter) window.AICharacter.prototype.update = _safeUpdate;
    }
})();

// ==========================================
// 🔒 ダンジョンの入り口の免許皆伝チェック（UI制御）
// ==========================================
if (typeof window._originalOpenDungeonUI === 'undefined' && typeof window.openDungeonUI === 'function') {
    window._originalOpenDungeonUI = window.openDungeonUI;
    
    window.openDungeonUI = function(dungeonType, startFloor) { 
        let isMasterExplorer = (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.rank && window.aiPet.apprentice.rank['explore'] >= 10);
        
        if (!isMasterExplorer && window.currentMode !== 'debug') {
            window.aiPet.actionState = 'idle';
            window.aiPet.message = "ここから先は危険だ...\n（※入るには「冒険家」の免許皆伝が必要です）";
            window.aiPet.messageTimer = 180;
            return; 
        }
        
        window._originalOpenDungeonUI(dungeonType, startFloor);
    };
}

// ======================================================================
// 🎵 ダンジョン（ローグライク）BGM 完全統合 ＆ 重複再生防止パッチ
// ======================================================================

// ① BGMの選曲ロジック（ダンジョンの種類と階層の深さからBGMを決定）
window.getDungeonBGM = function(mapType, floor) {
    let phase = 1;
    if (floor >= 70) phase = 3;
    else if (floor >= 30) phase = 2;

    let baseName = mapType === 'crystal' ? 'dungeon_crystal_' : 'dungeon_skull_';
    return baseName + phase; 
};

// ② ダンジョン突入時（フロア生成時）のBGM切り替えフック
const _orig_openDungeonUI_bgm = window.openDungeonUI;
window.openDungeonUI = function(mapType = 'skull', startFloor = null) {
    if (_orig_openDungeonUI_bgm) _orig_openDungeonUI_bgm.apply(this, arguments);

    if (window.audioManager && window.DUNGEON_STATE) {
        let targetBGM = window.getDungeonBGM(window.DUNGEON_STATE.mapType, window.DUNGEON_STATE.floor);
        // ★修正：二重再生を防ぐため、システムに「今からこれを鳴らす」と記憶させる
        window.DUNGEON_STATE._lastRequestedBGM = targetBGM;
        window.audioManager.playBGM(targetBGM);
    }
};

// ③ 階段を降りた（フロアが切り替わった）時のBGM更新チェック
const _orig_updateDungeonUI_bgm = window.updateDungeonUI;
window.updateDungeonUI = function() {
    if (_orig_updateDungeonUI_bgm) _orig_updateDungeonUI_bgm.apply(this, arguments);

    if (!window.DUNGEON_STATE || !window.DUNGEON_STATE.active || !window.audioManager) return;

    let targetBGM = window.getDungeonBGM(window.DUNGEON_STATE.mapType, window.DUNGEON_STATE.floor);
    const protectedBGMs = ['dungeon_death', 'dungeon_escape', 'dungeon_monsterhouse', 'dungeon_wind'];
    
    // ★オーディオマネージャーのラグを考慮し、最後にリクエストしたBGMを正とする
    let current = window.DUNGEON_STATE._lastRequestedBGM || window.audioManager.currentBGMType;

    // フロア移動直後（ターン数が0の時）は、強制的にイベントBGMフラグを解除して通常曲に戻す
    if ((window.DUNGEON_STATE.floorTurn || 0) === 0 || (window.DUNGEON_STATE.turnCount || 0) === 0) {
        if (current === 'dungeon_monsterhouse' || current === 'dungeon_wind') {
            window.DUNGEON_STATE._lastRequestedBGM = targetBGM;
            window.audioManager.playBGM(targetBGM);
            return;
        }
    }

    // ★ 現在リクエストされているBGMがターゲットと違い、かつ保護対象のBGMが鳴っていなければ切り替える
    if (current !== targetBGM && !protectedBGMs.includes(current)) {
        window.DUNGEON_STATE._lastRequestedBGM = targetBGM;
        window.audioManager.playBGM(targetBGM);
    }
};

// ④ ターン進行中の特殊イベント（モンスターハウス、風の警告、死亡）のフック
const _orig_addDungeonLog_bgm = window.addDungeonLog;
window.addDungeonLog = function(msg, color) {
    if (_orig_addDungeonLog_bgm) _orig_addDungeonLog_bgm.apply(this, arguments);
    if (!window.audioManager || !window.DUNGEON_STATE) return;

    let triggerBGM = null;
    if (msg.includes('モンスターハウスだ！！') || msg.includes('魔物の巣窟に迷い込んだ！')) {
        triggerBGM = 'dungeon_monsterhouse';
    } else if (msg.includes('どこからか 風が吹いてきた...')) {
        triggerBGM = 'dungeon_wind';
    } else if (msg.includes('は倒れてしまった...')) {
        triggerBGM = 'dungeon_death';
    }

    // ★ 重複再生防止ロック
    if (triggerBGM && window.DUNGEON_STATE._lastRequestedBGM !== triggerBGM) {
        window.DUNGEON_STATE._lastRequestedBGM = triggerBGM;
        window.audioManager.playBGM(triggerBGM);
    }
};

// モンスターハウスの関数が直接呼ばれた場合もBGMを切り替える
if (typeof window.triggerMonsterHouseEffect !== 'undefined') {
    const _orig_triggerMonsterHouseEffect_bgm = window.triggerMonsterHouseEffect;
    window.triggerMonsterHouseEffect = function() {
        if (window.audioManager && window.DUNGEON_STATE && window.DUNGEON_STATE._lastRequestedBGM !== 'dungeon_monsterhouse') {
            window.DUNGEON_STATE._lastRequestedBGM = 'dungeon_monsterhouse';
            window.audioManager.playBGM('dungeon_monsterhouse');
        }
        if (_orig_triggerMonsterHouseEffect_bgm) _orig_triggerMonsterHouseEffect_bgm.apply(this, arguments);
    };
}

// ⑤ ダンジョンから退出した時の処理（生還BGM と 育成BGMへの復帰）
const _orig_closeDungeonUI_bgm = window.closeDungeonUI;
window.closeDungeonUI = function(isGameOver = false, isRescued = false) {
    if (window.audioManager && window.DUNGEON_STATE) {
        // 生還した場合（ゲームオーバーではない、または救助された）はクリアBGMを鳴らす
        let escapeBGM = 'dungeon_escape';
        if (!isGameOver || isRescued) {
            if (window.DUNGEON_STATE._lastRequestedBGM !== escapeBGM) {
                window.DUNGEON_STATE._lastRequestedBGM = escapeBGM;
                window.audioManager.playBGM(escapeBGM);
            }
        }

        // リザルト画面を閉じる際に育成BGMへ戻す
        setTimeout(() => {
            const resultUI = document.getElementById('dg-result-ui');
            if (resultUI) {
                const buttons = resultUI.querySelectorAll('button');
                buttons.forEach(btn => {
                    const oldClick = btn.onclick;
                    btn.onclick = function(e) {
                        if (oldClick) oldClick.call(this, e);
                        if (window.audioManager) window.audioManager.restoreMainBGM();
                        // 退出時にBGMリクエスト履歴をクリア
                        if (window.DUNGEON_STATE) window.DUNGEON_STATE._lastRequestedBGM = null;
                    };
                });
            }
        }, 100);
    }

    if (_orig_closeDungeonUI_bgm) _orig_closeDungeonUI_bgm.apply(this, arguments);
};