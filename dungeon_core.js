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

// ==========================================
// ★ 言葉の閃きシステム コアロジック
// ==========================================
window.triggerDungeonInspiration = function(wordId) {
    const ai = window.aiPet;
    if (!ai || !ai.apprentice) return;
    if (!ai.apprentice.learnedWords) ai.apprentice.learnedWords = [];

    const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === wordId);
    if (!cmdInfo) return;

    const wordName = cmdInfo.name;
    if (ai.apprentice.learnedWords.includes(wordName)) return; // 既に知っていれば何もしない

    // 閃いた！
    ai.apprentice.learnedWords.push(wordName);
    ai.apprentice.dungeonVocabBonus = (ai.apprentice.dungeonVocabBonus || 0) + 1; // 記憶容量の永続拡張
    
    window.addDungeonLog(`💡 閃き！ ${ai.name || "AI"} は「${wordName}」という言葉を理解した！`, '#FFD700');
    
    if (typeof window.showDungeonDamageEffect === 'function' && window.DUNGEON_STATE.player) {
        window.showDungeonDamageEffect(window.DUNGEON_STATE.player.x, window.DUNGEON_STATE.player.y, "💡", false);
    }
    window.updateDungeonUI(); // 即座にUI(使える言葉リスト)に反映
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
    const ringNames = randomizeArray(['赤い指輪', '青い指輪', '輝く指輪', 'くすんだ指輪', 'ドクロの指輪', '黄金の指輪', 'ガラスの指輪', 'トゲトゲの指輪']); // ★追加
    
    // 実際のアイテムID
    const realGrasses = ['herb', 'item_berry', 'item_seed_happy']; 
    const realScrolls = ['item_scroll_sleep', 'item_scroll_confuse', 'item_scroll_identify']; 
    const realWands = ['item_wand_fire', 'item_wand_swap', 'item_wand_blow'];
    const realRings = ['item_ring_haste', 'item_ring_heal']; // ★追加
    
    // 今回の冒険のハッシュマップ（正体と見た目の紐付け）
    s.sessionItemDict = {};
    // AIの記憶（完全に識別したか、仮名をつけているか、一度装備して一部判明したか）
    s.aiMemory = { identified: [], tempNames: {}, knownEquips: [] }; // ★修正

    realGrasses.forEach((id, idx) => s.sessionItemDict[id] = grassNames[idx]);
    realScrolls.forEach((id, idx) => s.sessionItemDict[id] = scrollNames[idx]);
    realWands.forEach((id, idx) => s.sessionItemDict[id] = wandNames[idx]);
    realRings.forEach((id, idx) => s.sessionItemDict[id] = ringNames[idx]); // ★追加

    // ★追加: デバッグの階層指定があれば優先、無ければ1階から
    let floor = startFloor || (window.dungeonState && window.dungeonState.floor) || 1;
    s.mapType = mapType; s.floor = floor;
    if (window.dungeonState) window.dungeonState = null; // リセット
    
    let currentSkin = 'robot'; let currentType = 'robot';
    // ★追加：ペットの名前を取得（無ければ "AI" にする）
    let pName = (window.aiPet && window.aiPet.name) ? window.aiPet.name : "AI"; 

    if (window.aiPet) {
        currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        currentType = currentSkin.split('_')[0]; 
    }
    
    s.player.type = currentType;
    s.player.skin = currentSkin;
    s.player.name = pName; // ★修正：プレイヤーのデータに名前をセット（これでundefinedになりません！）
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
        s.player.maxInventory = 20; // ★追加：クリスタル迷宮は厳しい20枠制限
    } else {
        if (window.aiPet) {
            let pwr = window.aiPet.stats.power || 10;
            let gen = window.aiPet.generation || 1;
            let age = window.aiPet.age || 0;
            s.player.maxHp = 100 + (pwr * 2) + (gen * 5) + (age * 2);
            s.player.hp = Math.max(1, Math.floor(s.player.maxHp * (pEnergy / 100))); // 現在の体力割合
            s.player.hunger = pHunger; // 満腹度を引き継ぐ
            s.player.basePwr = pwr;
            // ★ オブジェクトのまま持ち込まないよう、純粋な文字列のIDだけを抽出して持ち込む！
            s.player.tempInventory = window.aiPet.inventory ? window.aiPet.inventory.map(i => typeof i === 'string' ? i : i.id).filter(i => i) : [];
            s.player.maxInventory = Infinity; // ★追加：スカルダンジョンは持ち込み自由（無限大！）
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
                <div style="font-size: 22px; font-weight:bold; color:${titleColor}; margin-bottom:5px; display:flex; align-items:center; gap:10px;">
                    <span>${titleName} B<span id="dg-floor">1</span>F</span>
                    <span id="dg-tactic-badge" style="background:#2196F3; color:white; padding:4px 10px; border-radius:12px; font-weight:bold; font-size:12px; border:2px solid #FFF;">🚩 現在の作戦：AIにまかせる</span>
                </div>
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
            <div style="background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:5px; margin-bottom:15px; pointer-events:auto; border:1px solid #555;">
                <div style="display:flex; gap:10px; width:100%;">
                    <input type="text" id="dg-chat-input" placeholder="作戦名を指示..." style="padding:8px; border-radius:4px; border:none; outline:none; width:200px;">
                    <button onclick="window.processDungeonChat()" style="padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">作戦変更</button>
                </div>
                <button onclick="window.toggleDungeonTacticViewer()" style="width:100%; padding:6px; font-size:12px; font-weight:bold; background:#333; color:#FFC107; border:1px solid #FFC107; border-radius:4px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.5);">📋 作戦リスト確認</button>
            </div>
            <div style="display:flex; gap:15px; pointer-events:auto; justify-content:center; width:100%;">
                <button id="dg-auto-btn" onclick="window.toggleDungeonAuto()" style="width: 250px; padding: 15px 20px; font-size: 22px; font-weight: bold; background: #2196F3; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #0D47A1';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #0D47A1';">🔄 AUTO 開始</button>
            </div>
        </div>
        <!-- ★追加：ログとマップを束ねて、自動的に並べるための親コンテナ（Flexbox） -->
        <div id="dg-modals-container" style="position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); width:95vw; height:75vh; pointer-events:none; z-index:100; display:flex; justify-content:center; align-items:center; gap:20px; flex-wrap:wrap;">
            
            <div id="dg-modal-log" style="display:none; flex: 1 1 400px; max-width:600px; height:100%; max-height:600px; background:rgba(10,10,15,0.9); border:3px solid #9C27B0; border-radius:12px; padding:20px; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.8); pointer-events:auto; box-sizing:border-box;">
                <h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 冒険の記録</h3>
                <div id="dg-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.8; font-size:16px; padding-right:10px;"></div>
                <button onclick="window.toggleDungeonModal('log')" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
            </div>
            
            <div id="dg-modal-minimap" style="display:none; flex: 1 1 400px; max-width:500px; height:100%; max-height:600px; background:rgba(10,10,15,0.8); border:3px solid #2196F3; border-radius:12px; padding:20px; flex-direction:column; align-items:center; box-shadow:0 10px 40px rgba(0,0,0,0.8); pointer-events:auto; box-sizing:border-box;">
                <h3 style="color:#FFF; margin-top:0; width:100%; border-bottom:1px solid #555; padding-bottom:10px; text-align:center; flex-shrink:0;">🗺️ ミニマップ</h3>
                
                <div id="dg-minimap-content" style="background:rgba(0,0,0,0.4); border:2px solid #555; position:relative; margin:15px 0; overflow:hidden; flex:1; width:100%; display:flex; justify-content:center; align-items:center;">
                    <style>
                        #dg-minimap-content canvas { max-width: 100%; max-height: 100%; width: auto !important; height: auto !important; object-fit: contain; }
                    </style>
                </div>
                
                <button onclick="window.toggleDungeonModal('minimap')" style="padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%; flex-shrink:0;">閉じる</button>
            </div>

        </div>
    `;
    
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
                // ★ 持ち帰る時に「鮮度(age: 0)」のオブジェクト形式に再変換して村へ返す！
                window.aiPet.inventory = s.player.tempInventory.map(i => ({ id: i, age: 0 })); 
            } else if (s.mapType === 'crystal') {
                s.player.tempInventory.forEach(item => window.aiPet.inventory.push({ id: item, age: 0 }));
            }
        } else {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = []; // スカルで死んだらロスト
            }
            // クリスタルで死んだ場合は、元々のインベントリは失われない
        }
        
        itemsReward.forEach(item => window.aiPet.inventory.push({ id: item, age: 0 })); 
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
    
    // ★ 作戦の切り替え処理
    const s = window.DUNGEON_STATE;
    s.player.currentTacticName = text; // チャット入力された言葉を現在の作戦名として設定
    window.addDungeonLog(`📣 作戦を「${text}」に切り替えた！`, '#4fc3f7');
    
    if (typeof saveGameData === 'function') saveGameData();
    window.updateDungeonUI();
};


window.toggleDungeonModal = function(type) {
    const logModal = document.getElementById('dg-modal-log'); 
    const mapModal = document.getElementById('dg-modal-minimap');
    
    // ★修正：もう片方を閉じる処理を削除し、完全に独立して開閉できるようにする
    if (type === 'log') { 
        logModal.style.display = logModal.style.display === 'none' ? 'flex' : 'none'; 
    } else if (type === 'minimap') { 
        mapModal.style.display = mapModal.style.display === 'none' ? 'flex' : 'none'; 
        if (mapModal.style.display === 'flex') window.drawMinimap(); 
    }
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

    let s = window.DUNGEON_STATE; // ★短縮用に変数化
    if (!s || !s.active || !window.audioManager) return;

    let targetBGM = window.getDungeonBGM(s.mapType, s.floor);
    const protectedBGMs = ['dungeon_death', 'dungeon_escape', 'dungeon_monsterhouse', 'dungeon_wind'];
    
    // ★オーディオマネージャーのラグを考慮し、最後にリクエストしたBGMを正とする
    let current = s._lastRequestedBGM || window.audioManager.currentBGMType;

    // フロア移動直後（ターン数が0の時）は、強制的にイベントBGMフラグを解除して通常曲に戻す
    if ((s.floorTurn || 0) === 0 || (s.turnCount || 0) === 0) {
        if (current === 'dungeon_monsterhouse' || current === 'dungeon_wind') {
            
            // ★大改修：大部屋（開幕）モンスターハウスの誤爆リセットを防止！
            // 降りた瞬間のログを確認し、開幕MHの場合は曲を止めないようにする
            let isOpeningMH = false;
            if (s.logs && s.logs.length > 0) {
                // ★修正：大部屋開幕時は敵やアイテムの出現ログが大量に流れて押し出されるため、余裕を持って直近50件をチェックする！
                let recentLogs = s.logs.slice(-50).map(l => typeof l === 'string' ? l : (l.text || ''));
                if (recentLogs.some(msg => msg.includes('モンスターハウスだ！！') || msg.includes('魔物の巣窟に迷い込んだ！'))) {
                    isOpeningMH = true;
                }
            }

            // 開幕MHではない（＝前の階層のMHや風の警告を引きずっているだけ）場合のみ、通常BGMに戻してリセットする
            if (!isOpeningMH) {
                s._lastRequestedBGM = targetBGM;
                window.audioManager.playBGM(targetBGM);
                return;
            }
        }
    }

    // ★ 現在リクエストされているBGMがターゲットと違い、かつ保護対象のBGMが鳴っていなければ切り替える
    if (current !== targetBGM && !protectedBGMs.includes(current)) {
        s._lastRequestedBGM = targetBGM;
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

// ==========================================
// ★ ダンジョン専用：作戦エディタUIシステム
// ==========================================

window.initDungeonTactics = function() {
    if (!window.aiPet) return;
    if (!window.aiPet.dungeonTactics || window.aiPet.dungeonTactics.length === 0) {
        window.aiPet.dungeonTactics = [
            { name: "カスタム作戦1", rules: [{ condition: "always", action: "たたかう" }] },
            { name: "カスタム作戦2", rules: [{ condition: "always", action: "たたかう" }] },
            { name: "カスタム作戦3", rules: [{ condition: "always", action: "たたかう" }] }
        ];
    }
};

window.openDungeonTacticEditor = function() {
    window.initDungeonTactics();
    
    let ui = document.getElementById('dungeon-tactic-editor-ui');
    if (!ui) {
        ui = document.createElement('div'); ui.id = 'dungeon-tactic-editor-ui';
        ui.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 55000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto; padding:40px; box-sizing:border-box;`;
        document.body.appendChild(ui);
    }
    ui.style.display = 'flex';
    
    window.DUNGEON_EDITOR_TACTIC_INDEX = 0;
    window.renderDungeonTacticEditor();
};

window.closeDungeonTacticEditor = function() {
    let ui = document.getElementById('dungeon-tactic-editor-ui');
    if (ui) ui.style.display = 'none';
    
    // AIの待機状態を解除して小屋から出させる（終了シグナルを送信）
    if (window.aiPet && window.aiPet.schedule && window.aiPet.schedule.length > 0) {
        if (window.aiPet.schedule[0].type === '作戦会議') {
            window.aiPet.schedule[0]._waitingFinish = false; 
        }
    }
};

window.showDungeonTacticMsg = function(msg, color = '#4CAF50') {
    let el = document.getElementById('dungeon-tactic-editor-msg');
    if (!el) return;
    el.innerHTML = msg;
    el.style.color = color;
    el.style.opacity = 1;
    clearTimeout(window._dungeonTacticMsgTimer);
    window._dungeonTacticMsgTimer = setTimeout(() => { el.style.opacity = 0; }, 2000);
};

// ==========================================
// ★ ダンジョン用：カテゴリ別スキルパレット表示
// ==========================================
window.showDungeonTacticPalette = function(inputElem, rIdx, tIdx, actNum) {
    document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
    let suggestBox = document.getElementById(`dg-suggest-box-${rIdx}-${actNum}`);
    if (!suggestBox) return;

    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    if (inputElem.value.trim() === "" || inputElem.value.trim() === inputElem.defaultValue) {
        // ダンジョン用コマンドのカテゴリ定義
        let categories = {
            "🏃 移動・向き": ["うえ", "した", "ひだり", "みぎ", "うえむき", "したむき", "ひだりむき", "みぎむき"],
            "⚔️ 攻撃・戦闘": ["たたかう", "なげる", "にげる"],
            "💚 回復・使用": ["かいふく", "たべる", "つかう"],
            "🎒 アイテム操作": ["そうび", "はずす", "しらべる", "なまえ", "おく", "ごうせい"]
        };

        let html = '';
        for (let cat in categories) {
            let wordsInCat = learnedWords.filter(w => categories[cat].includes(w));
            
            if (wordsInCat.length > 0) {
                html += `<div style="font-weight:bold; color:#FFC107; padding:8px 5px; background:#333; border-bottom:1px solid #555; position:sticky; top:0;">${cat}</div>`;
                wordsInCat.forEach(w => {
                    let cmdInfo = typeof window.DUNGEON_AVAILABLE_COMMANDS !== 'undefined' ? window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w) : null;
                    if (!cmdInfo) return;
                    html += `<div onclick="window.aiPet.dungeonTactics[${tIdx}].rules[${rIdx}]['action${actNum}'] = '${w}'; window.renderDungeonTacticEditor();" style="padding:10px 8px; cursor:pointer; border-bottom:1px solid #444; background:#222; font-size:12px;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='#222'">
                        <span style="color:#FFF; font-weight:bold; font-size:14px;">${w}</span>
                    </div>`;
                });
            }
        }
        if(html === '') html = `<div style="padding:10px; color:#aaa;">使用できる言葉がありません</div>`;
        suggestBox.innerHTML = html;
        suggestBox.style.display = 'block';
    } else {
        window.updateDungeonTacticSuggest(inputElem, rIdx, tIdx, actNum);
    }
};

// サジェスト関数の引数拡張パッチ (UI用)
window.updateDungeonTacticSuggest = function(inputElem, rIdx, tIdx, actNum) {
    let val = inputElem.value.trim();
    let suggestBox = document.getElementById(`dg-suggest-box-${rIdx}-${actNum}`);
    if (!suggestBox) return;

    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    if (val.length === 0) {
        window.showDungeonTacticPalette(inputElem, rIdx, tIdx, actNum);
        return;
    }
    
    let matches = window.DUNGEON_AVAILABLE_COMMANDS.filter(c => learnedWords.includes(c.name) && c.name.includes(val));
    if (matches.length > 0) {
        suggestBox.innerHTML = matches.map(c => {
            return `<div onclick="window.aiPet.dungeonTactics[${tIdx}].rules[${rIdx}]['action${actNum}'] = '${c.name}'; window.renderDungeonTacticEditor();" style="padding:8px; cursor:pointer; border-bottom:1px solid #444; background:#222;" onmouseover="this.style.background='#444'" onmouseout="this.style.background='#222'">${c.name}</div>`;
        }).join('');
        suggestBox.style.display = 'block';
    } else {
        suggestBox.style.display = 'none';
    }
};

window.saveDungeonTacticActionIfValid = function(inputElem, rIdx, tIdx, actNum, originalValue) {
    let val = inputElem.value.trim();
    if (val === '') {
        window.aiPet.dungeonTactics[tIdx].rules[rIdx][`action${actNum}`] = '';
        window.renderDungeonTacticEditor();
        return;
    }

    let baseWords = window.aiPet.apprentice && window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    if (learnedWords.includes(val) && window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === val)) {
        window.aiPet.dungeonTactics[tIdx].rules[rIdx][`action${actNum}`] = val;
        window.renderDungeonTacticEditor();
    } else {
        window.showDungeonTacticMsg(`「${val}」はまだ習得していないか、ダンジョンで使えない言葉です！`, '#FF5252');
        inputElem.value = originalValue; 
        window.aiPet.dungeonTactics[tIdx].rules[rIdx][`action${actNum}`] = originalValue;
    }
};

window.renderDungeonTacticEditor = function() {
    let ui = document.getElementById('dungeon-tactic-editor-ui'); if (!ui) return;
    let idx = window.DUNGEON_EDITOR_TACTIC_INDEX;
    
    // ★デフォルト作戦をインデックス -1 として扱う
    let isDefault = (idx === -1);
    let currentTactic = isDefault ? { name: "AIにまかせる", rules: [{ condition: "always", action1: "（AI独自の生存本能で行動）" }] } : window.aiPet.dungeonTactics[idx];

    let defTab = `<div onclick="window.DUNGEON_EDITOR_TACTIC_INDEX=-1; window.renderDungeonTacticEditor();" style="padding:10px 15px; background:${isDefault ? '#4CAF50' : '#2E7D32'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[基本] AIにまかせる</div>`;
    let cusTabs = window.aiPet.dungeonTactics.map((t, i) => `<div onclick="window.DUNGEON_EDITOR_TACTIC_INDEX=${i}; window.renderDungeonTacticEditor();" style="padding:10px 15px; background:${!isDefault && i===idx ? '#2196F3' : '#1565C0'}; color:white; cursor:pointer; border-radius:8px 8px 0 0; font-weight:bold; margin-right:5px; font-size:12px;">[マイ] ${t.name}</div>`).join('');

    let rulesHtml = "";
    if (isDefault) {
        rulesHtml = `<div style="background:#222; padding:15px; border-radius:8px; border:1px solid #4CAF50; color:#ccc; line-height:1.5;">この作戦では、AIはプレイヤーの命令を受けず、自身の知能と生存本能だけを頼りにダンジョンを探索します。<br>（※カスタム作戦のように立ち往生することはありません）</div>`;
    } else if (typeof window.DUNGEON_TACTIC_CONDITIONS !== 'undefined') {
        rulesHtml = currentTactic.rules.map((rule, rIdx) => {
            let condOptions = Object.keys(window.DUNGEON_TACTIC_CONDITIONS).map(k => `<option value="${k}" ${rule.condition === k ? 'selected' : ''}>${window.DUNGEON_TACTIC_CONDITIONS[k]}</option>`).join('');

            return `
                <div style="display:flex; flex-direction:column; background:#222; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #444;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="font-weight:bold; color:#FF9800; width:50px;">優先度 ${rIdx + 1}</div>
                        <div style="color:#aaa;">もし</div>
                        <select onchange="window.aiPet.dungeonTactics[${idx}].rules[${rIdx}].condition = this.value;" style="padding:5px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; flex:1.5;">${condOptions}</select>
                        <div style="color:#aaa;">なら</div>
                        
                        <div style="display:flex; flex-direction:column; flex:2; gap:4px;">
                            <div class="tactic-action-input-wrapper" style="position:relative;">
                                <input type="text" value="${rule.action1 || ''}" 
                                    onclick="window.showDungeonTacticPalette(this, ${rIdx}, ${idx}, 1)"
                                    oninput="window.updateDungeonTacticSuggest(this, ${rIdx}, ${idx}, 1)" 
                                    onchange="window.saveDungeonTacticActionIfValid(this, ${rIdx}, ${idx}, 1, '${rule.action1 || ''}')"
                                    placeholder="第1候補 (例:つかう)" style="padding:5px; background:#111; color:#fff; border:1px solid #FFC107; border-radius:4px; width:100%; box-sizing:border-box;">
                                <div id="dg-suggest-box-${rIdx}-1" class="tactic-suggest-box" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:200px; overflow-y:auto; background:#111; border:1px solid #555; z-index:100; box-shadow:0 4px 10px rgba(0,0,0,0.8);"></div>
                            </div>
                            <div class="tactic-action-input-wrapper" style="position:relative;">
                                <input type="text" value="${rule.action2 || ''}" 
                                    onclick="window.showDungeonTacticPalette(this, ${rIdx}, ${idx}, 2)"
                                    oninput="window.updateDungeonTacticSuggest(this, ${rIdx}, ${idx}, 2)"
                                    onchange="window.saveDungeonTacticActionIfValid(this, ${rIdx}, ${idx}, 2, '${rule.action2 || ''}')"
                                    placeholder="第2候補 (例:にげる)" style="padding:5px; background:#111; color:#fff; border:1px solid #555; border-radius:4px; width:100%; box-sizing:border-box;">
                                <div id="dg-suggest-box-${rIdx}-2" class="tactic-suggest-box" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:150px; overflow-y:auto; background:#111; border:1px solid #555; z-index:100;"></div>
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:2px;">
                            <button ${rIdx===0 ? 'disabled style="opacity:0.3"' : `onclick="let r=window.aiPet.dungeonTactics[${idx}].rules; let tmp=r[${rIdx}]; r[${rIdx}]=r[${rIdx}-1]; r[${rIdx}-1]=tmp; window.renderDungeonTacticEditor();"`} style="background:#555; color:#fff; border:none; padding:2px 8px; cursor:pointer;">▲</button>
                            <button ${rIdx===currentTactic.rules.length-1 ? 'disabled style="opacity:0.3"' : `onclick="let r=window.aiPet.dungeonTactics[${idx}].rules; let tmp=r[${rIdx}]; r[${rIdx}]=r[${rIdx}+1]; r[${rIdx}+1]=tmp; window.renderDungeonTacticEditor();"`} style="background:#555; color:#fff; border:none; padding:2px 8px; cursor:pointer;">▼</button>
                        </div>
                        <button onclick="window.aiPet.dungeonTactics[${idx}].rules.splice(${rIdx}, 1); window.renderDungeonTacticEditor();" style="background:#f44336; color:white; border:none; border-radius:4px; padding:5px; margin-left:5px; cursor:pointer; font-size:11px;">削除</button>
                    </div>
                    
                    ${rule.condition === 'stairs_found' && (rule.action1 === 'した' || rule.action2 === 'した') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: 階段のマスへ向かって自動で移動し、フロアを下ります</div>` : ''}
                    ${rule.condition === 'unexplored_exist' && (rule.action1 === 'しらべる' || rule.action2 === 'しらべる') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: マップの未探索エリアへ向かって自動で探索を進めます</div>` : ''}
                    ${rule.condition === 'monster_house' && (rule.action1 === 'にげる' || rule.action2 === 'にげる') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: 大部屋を避け、一番近い通路（安全地帯）へ退避します</div>` : ''}
                    ${rule.condition === 'wind_blowing' && (rule.action1 === 'にげる' || rule.action2 === 'にげる') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: 風から逃れるため、未探索エリアへ全力で急行します</div>` : ''}
                    ${rule.condition === 'uncollected_item_exist' && (rule.action1 === 'うえ' || rule.action2 === 'うえ') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: アイテムを拾わずに、上に乗って待機します</div>` : ''}
                    ${rule.condition.startsWith('on_item_') && ['たべる', 'かいふく', 'つかう', 'そうび', 'しらべる', 'なまえ'].includes(rule.action1 || rule.action2) ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: カバンに入れず、足元のアイテムに直接アクションします</div>` : ''}
                    ${rule.condition === 'on_stairs' && (rule.action1 === 'たたかう' || rule.action2 === 'たたかう') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: 体力が満タンになるまで足踏み回復し、終わると次の行動へ移ります</div>` : ''}
                    ${rule.condition === 'in_room' && (rule.action1 === 'たたかう' || rule.action2 === 'たたかう') ? `<div style="font-size:11px; color:#FFD700; margin-top:5px; width:100%; text-shadow:0 0 3px #000;">💡 文脈解釈: 部屋を歩く際、進行方向へ素振りをして罠を確認しながら慎重に進みます</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // 💡 注意：updateDungeonTacticSuggest と saveDungeonTacticActionIfValid に引数(候補番号)を足す必要があります。
    // （サジェスト関数内で action の代わりに action1 / action2 に保存するよう改修）

    ui.innerHTML = `
        <h2 style="color:#4fc3f7; margin-bottom:10px;">🎒 ダンジョン作戦会議 (AIマインド)</h2>
        <div id="dungeon-tactic-editor-msg" style="height:20px; margin-bottom:10px; transition:opacity 0.3s; opacity:0; font-weight:bold; text-align:center;"></div>
        
        <div style="display:flex; justify-content:center; width:100%; max-width:850px;">
            <div style="display:flex; border-bottom:2px solid ${isDefault ? '#4CAF50' : '#2196F3'};">
                ${defTab}${cusTabs}
            </div>
        </div>
        <div style="background:#111; padding:20px; width:100%; max-width:850px; border-radius:0 0 8px 8px; border:2px solid ${isDefault ? '#4CAF50' : '#2196F3'}; border-top:none; box-sizing:border-box;">
            <div style="margin-bottom:20px; display:flex; align-items:center;">
                <span style="font-weight:bold; color:#fff; margin-right:10px;">作戦名:</span>
                <input type="text" value="${currentTactic.name}" ${isDefault ? 'disabled' : `onchange="window.aiPet.dungeonTactics[${idx}].name = this.value;"`} style="padding:5px; background:#222; color:${isDefault ? '#888' : '#fff'}; border:1px solid #555; border-radius:4px; width:200px;">
            </div>
            
            <div style="margin-bottom:20px; max-height:400px; overflow-y:auto; padding-right:10px;">
                <p style="color:#aaa; font-size:12px; margin-bottom:10px;">※上にあるルールほど優先して行動します。第1候補ができない時は第2候補を実行します。</p>
                ${rulesHtml}
                ${!isDefault ? `<button onclick="window.aiPet.dungeonTactics[${idx}].rules.push({condition:'always', action1: '', action2: ''}); window.renderDungeonTacticEditor();" style="background:#4CAF50; color:white; border:none; border-radius:4px; padding:10px; cursor:pointer; width:100%; font-weight:bold; margin-top:10px;">＋ 新しいルールを追加する</button>` : ''}
            </div>
            
            ${!isDefault ? `
                <div style="margin-top:20px; padding:15px; background:#1a1a1a; border:1px dashed #555; border-radius:8px;">
                    <div style="font-size:13px; color:#FFC107; margin-bottom:10px; font-weight:bold;">✨ おまかせ構築（AIが現在の語彙から自動で考えます）</div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.autoSetDungeonTactic('offensive', ${idx})" style="flex:1; padding:10px; background:#B71C1C; color:#fff; border:1px solid #E53935; border-radius:4px; cursor:pointer; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.5); transition:0.1s;" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='none';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.5)';">⚔️ ガンガンいく</button>
                        <button onclick="window.autoSetDungeonTactic('defensive', ${idx})" style="flex:1; padding:10px; background:#1B5E20; color:#fff; border:1px solid #43A047; border-radius:4px; cursor:pointer; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.5); transition:0.1s;" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='none';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.5)';">💚 いのちだいじに</button>
                        <button onclick="window.autoSetDungeonTactic('explore', ${idx})" style="flex:1; padding:10px; background:#01579B; color:#fff; border:1px solid #1E88E5; border-radius:4px; cursor:pointer; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.5); transition:0.1s;" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='none';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.5)';">🗺️ 探索優先</button>
                    </div>
                </div>
            ` : ''}
        </div>
        <button onclick="window.closeDungeonTacticEditor()" style="margin-top:30px; padding:15px 40px; font-size:18px; font-weight:bold; background:#555; color:white; border:2px solid #777; border-radius:8px; cursor:pointer;">会議を終える</button>
    `;
};

// パレット・サジェストの外側をクリックした時に閉じる処理（ダンジョン版）
if (!window._dgTacticSuggestListenerAdded) {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.tactic-action-input-wrapper')) {
            document.querySelectorAll('.tactic-suggest-box').forEach(el => el.style.display = 'none');
        }
    });
    window._dgTacticSuggestListenerAdded = true;
}

// ==========================================
// ★ ダンジョン用：おまかせ作戦構築ロジック
// ==========================================
window.autoSetDungeonTactic = function(policy, tIdx) {
    let ai = window.aiPet;
    if (!ai) return;
    
    // AIが現在知っている言葉をリストアップ（「たたかう」は最初から知っている前提）
    let baseWords = ai.apprentice && ai.apprentice.learnedWords ? ai.apprentice.learnedWords : [];
    let learnedWords = Array.from(new Set([...baseWords, "たたかう"]));

    // 複数の言葉候補から、AIが知っているものを1つ探して返すヘルパー関数
    const getKnownWord = (wordCandidates) => {
        return wordCandidates.find(w => learnedWords.includes(w)) || '';
    };

    let rules = [];

    // ★ 絶対優先の生存本能（方針に関わらず、知っていれば最上段にセット）
    let healWord = getKnownWord(["かいふく", "たべる"]);
    let fleeWord = getKnownWord(["にげる"]);
    
    // タイムリミット時は無条件で逃げる（階段・未探索へ急行する文脈解釈を利用）
    if (fleeWord) rules.push({ condition: 'wind_blowing', action1: fleeWord, action2: '' });

    if (policy === 'offensive') {
        // --- ⚔️ ガンガンいこうぜ ---
        let atkWord = getKnownWord(["たたかう", "なげる", "つかう"]);
        let itemWord = getKnownWord(["つかう", "なげる"]);
        
        if (healWord) rules.push({ condition: 'hp_under_30', action1: healWord, action2: fleeWord || atkWord });
        if (itemWord) rules.push({ condition: 'enemy_count_2_over', action1: itemWord, action2: atkWord });
        if (atkWord)  rules.push({ condition: 'enemy_adjacent', action1: atkWord, action2: '' });
        
        // 敵がいない時はテキトーに移動
        let moveWord = getKnownWord(["しらべる", "した", "うえ", "みぎ", "ひだり"]);
        rules.push({ condition: 'always', action1: moveWord || "たたかう", action2: '' });

    } else if (policy === 'defensive') {
        // --- 💚 いのちだいじに ---
        if (healWord) rules.push({ condition: 'hp_under_50', action1: healWord, action2: fleeWord });
        if (fleeWord) rules.push({ condition: 'hp_under_30', action1: fleeWord, action2: healWord });
        if (fleeWord) rules.push({ condition: 'monster_house', action1: fleeWord, action2: '' }); // モンスターハウスは即退避
        
        let statusWord = getKnownWord(["かいふく", "つかう"]);
        if (statusWord) rules.push({ condition: 'status_bad', action1: statusWord, action2: fleeWord });
        
        if (fleeWord) rules.push({ condition: 'enemy_count_2_over', action1: fleeWord, action2: getKnownWord(["たたかう"]) });

        let moveWord = getKnownWord(["しらべる", "した"]);
        rules.push({ condition: 'always', action1: getKnownWord(["たたかう"]), action2: moveWord });

    } else if (policy === 'explore') {
        // --- 🗺️ 探索優先 ---
        if (healWord) rules.push({ condition: 'hp_under_30', action1: healWord, action2: fleeWord });
        
        // 階段を見つけたら即降りる（文脈解釈）
        let stairsWord = getKnownWord(["した"]);
        if (stairsWord) rules.push({ condition: 'stairs_found', action1: stairsWord, action2: getKnownWord(["たたかう"]) });
        
        // 未探索があれば調べる（文脈解釈）
        let exploreWord = getKnownWord(["しらべる"]);
        if (exploreWord) rules.push({ condition: 'unexplored_exist', action1: exploreWord, action2: getKnownWord(["たたかう"]) });
        
        rules.push({ condition: 'always', action1: getKnownWord(["たたかう"]), action2: exploreWord || stairsWord });
    }

    // ルールのクリーンアップ（空のルールを排除し、最大8個までに制限）
    let finalRules = [];
    rules.forEach(r => {
        if (r.action1 !== '' || r.action2 !== '') {
            finalRules.push({
                condition: r.condition,
                action1: r.action1,
                action2: r.action2
            });
        }
    });

    // 構築したルールを適用して再描画
    ai.dungeonTactics[tIdx].rules = finalRules.slice(0, 8);
    
    // 方針名を作戦名に反映
    let policyNames = { 'offensive': 'ガンガンいく', 'defensive': 'いのちだいじに', 'explore': '探索優先' };
    ai.dungeonTactics[tIdx].name = policyNames[policy] + " (自動)";

    window.renderDungeonTacticEditor();
    window.showDungeonTacticMsg(`手持ちの言葉から自動構築しました！`, '#FFD700');
};

// ==========================================
// ★ ダンジョン用：作戦リスト確認ウィンドウ（インゲーム用）
// ==========================================
window.toggleDungeonTacticViewer = function() {
    let viewer = document.getElementById('dg-in-battle-tactic-viewer');
    if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'dg-in-battle-tactic-viewer';
        viewer.style.cssText = `position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: rgba(10,10,15,0.95); border: 3px solid #00BCD4; border-radius: 12px; padding: 20px; display: none; flex-direction: column; z-index: 70000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: white; font-family: sans-serif; box-sizing: border-box;`;
        document.body.appendChild(viewer);
    }

    if (viewer.style.display === 'flex') {
        viewer.style.display = 'none';
    } else {
        let ai = window.aiPet;
        if (!ai || !window.DUNGEON_STATE || !window.DUNGEON_STATE.player) return;

        let myTactics = ai.dungeonTactics || [];
        let defaultTacticName = "AIにまかせる";
        
        // 使える指示ワード一覧
        let allTacticNames = [`<span style="color:#4CAF50;">${defaultTacticName}</span>`];
        myTactics.forEach(t => allTacticNames.push(`<span style="color:#2196F3;">${t.name}</span>`));

        let currentTacticName = window.DUNGEON_STATE.player.currentTacticName || defaultTacticName;
        let currentTactic = currentTacticName === defaultTacticName ? 
            { name: defaultTacticName, rules: [{ condition: "always", action1: "（AI独自の生存本能で行動）" }] } : 
            myTactics.find(t => t.name === currentTacticName);
            
        if (!currentTactic) currentTactic = { name: "不明な作戦", rules: [] };
        
        let rulesHtml = "";
        if (currentTactic.name === defaultTacticName) {
            rulesHtml = `<div style="background:#222; padding:15px; border-radius:8px; border:1px solid #4CAF50; color:#ccc; line-height:1.5;">この作戦では、AIはプレイヤーの命令を受けず、自身の知能と生存本能だけを頼りにダンジョンを探索します。<br>（※カスタム作戦のように立ち往生することはありません）</div>`;
        } else {
            rulesHtml = currentTactic.rules.map((r, i) => {
                let condStr = window.DUNGEON_TACTIC_CONDITIONS ? (window.DUNGEON_TACTIC_CONDITIONS[r.condition] || r.condition) : r.condition;
                let a1 = r.action1 || ''; let a2 = r.action2 || '';
                let actStr = a1 ? `<span style="font-weight:bold; color:#FFF;">${a1}</span>` : '';
                if (a2) actStr += ` <span style="color:#aaa; font-size:12px;">(できなければ: ${a2})</span>`;
                
                // シナジー可視化（確認用）
                let synergyHtml = "";
                if (r.condition === 'stairs_found' && (a1 === 'した' || a2 === 'した')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: 階段へ向かって自動で移動し、フロアを下ります</div>`;
                else if (r.condition === 'unexplored_exist' && (a1 === 'しらべる' || a2 === 'しらべる')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: マップの未探索エリアへ向かって自動で探索を進めます</div>`;
                else if (r.condition === 'monster_house' && (a1 === 'にげる' || a2 === 'にげる')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: 大部屋を避け、一番近い通路（安全地帯）へ退避します</div>`;
                else if (r.condition === 'wind_blowing' && (a1 === 'にげる' || a2 === 'にげる')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: 風から逃れるため、未探索エリアへ全力で急行します</div>`;
                // ★追加：新しい文脈解釈のヒント
                else if (r.condition === 'uncollected_item_exist' && (a1 === 'うえ' || a2 === 'うえ')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: アイテムを拾わずに、上に乗って待機します</div>`;
                else if (r.condition.startsWith('on_item_') && ['たべる', 'かいふく', 'つかう', 'そうび', 'しらべる', 'なまえ'].includes(a1) || ['たべる', 'かいふく', 'つかう', 'そうび', 'しらべる', 'なまえ'].includes(a2)) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: カバンに入れず、足元のアイテムに直接アクションします</div>`;
                else if (r.condition === 'on_stairs' && (a1 === 'たたかう' || a2 === 'たたかう')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: 体力が満タンになるまで足踏み回復し、終わると次の行動へ移ります</div>`;
                else if (r.condition === 'in_room' && (a1 === 'たたかう' || a2 === 'たたかう')) synergyHtml = `<div style="font-size:11px; color:#FFD700; margin-top:5px;">💡 文脈解釈: 部屋を歩く際、進行方向へ素振りをして罠を確認しながら慎重に進みます</div>`;

                // ★修正：テレメトリ用に class="dg-rule-row" を確実に付与し、光るための余白(border-left)を設ける
                return `<div class="dg-rule-row" style="background:#222; padding:8px; border-bottom:1px solid #444; font-size:14px; border-left: 6px solid transparent; transition: all 0.3s ease;">
                    <span style="color:#FF9800; font-weight:bold;">${i+1}.</span> もし <span style="color:#ddd;">${condStr}</span> なら
                    ${actStr}
                    ${synergyHtml}
                </div>`;
            }).join('');
            
            if (!rulesHtml) rulesHtml = `<div style="color:#888;">ルールが設定されていません。</div>`;
        }

        viewer.innerHTML = `
            <h3 style="color:#00BCD4; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📋 現在の作戦とチャット指示</h3>
            <div style="font-size:14px; color:#ccc; margin-bottom:10px;">
                チャット欄に以下の作戦名を入力して送信すると、AIに作戦変更を指示できます。<br>
                <b>使える指示ワード：</b> ${allTacticNames.join(', ')}
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #444; flex:1; overflow-y:auto;">
                <div style="color:#FFC107; font-weight:bold; font-size:18px; margin-bottom:10px;">現在の作戦：${currentTactic.name}</div>
                ${rulesHtml}
            </div>
            <button onclick="window.toggleDungeonTacticViewer()" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>
        `;
        viewer.style.display = 'flex';
        
        // ★追加：モーダルを開いた瞬間に、現在の思考状態をUIに反映させる！
        if (typeof window.updateTacticTelemetryUI === 'function') window.updateTacticTelemetryUI(window.DUNGEON_STATE);
    }
};

// ★ ダンジョン用：AIの装備品品定め（スコアリング）ロジック
window.evaluateEquipmentScore = function(itemStr, currentEquipStr) {
    if (!itemStr) return -9999;
    let eff = typeof window.getDungeonItemEffect === 'function' ? window.getDungeonItemEffect(itemStr) : null;
    let parsed = typeof window.parseItemString === 'function' ? window.parseItemString(itemStr) : { plus: 0 };
    if (!eff) return -9999;

    let score = 0;
    if (eff.traits && eff.traits.includes('curse') && eff.isStatsKnown) return -10000;

    if (itemStr === currentEquipStr) score += 50;

    let maxSeals = eff.maxSeals || 0;
    let currentTraitsCount = eff.traits ? eff.traits.length : 0;
    score += (currentTraitsCount * 200); 
    score += (maxSeals * 150);            

    let atk = eff.atk || 0;
    let def = eff.def || 0;
    score += (atk * 15) + (def * 15);
    score += (parsed.plus * 20);

    return score;
};