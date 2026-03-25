// game_manager.js : インタラクション・探索・建築管理 (Fixed Build Area & Smithing)

// ==========================================
// ★新規：アイテム獲得時にTCGカードをアンロックする便利関数
// ==========================================
aiPet.checkItemCardUnlock = function(itemKey) {
    // 辞書に投げるだけ。辞書にないアイテム（トマトや長靴など）は自動で無視されます
    if (typeof window.triggerTCGUnlock === 'function') {
        window.triggerTCGUnlock(itemKey, this.generation);
    }
};

aiPet.buyItem = function(itemKey) {
    const item = itemCatalog[itemKey];
    if (!item) return;
    
    let price = item.value * 2;
    if (typeof aiPet.getPriceRate === 'function') { price = Math.floor(price * aiPet.getPriceRate()); }

    if (this.gold >= price) {
        this.gold -= price;
        this.inventory.push(itemKey);

        // ★追加：カード取得チェック
        this.checkItemCardUnlock(itemKey);

        this.message = `${item.name}を購入！`;
        this.messageTimer = 120;
        if(typeof updateStatUI === 'function') updateStatUI();
        if(typeof window.updateShopList === 'function' && document.getElementById('panel-shop').classList.contains('active')) { window.updateShopList(); }
        saveGameData();
        return true;
    } else {
        this.message = "お金が足りない..."; 
        this.messageTimer = 120; 
        return false;
    }
};

aiPet.rescueItem = function(itemKey) {
    const item = itemCatalog[itemKey];
    if (!item) return;
    
    let price = item.value * 2;
    const limit = (typeof BANKRUPTCY_LIMIT !== 'undefined') ? BANKRUPTCY_LIMIT : -3000;
    
    if (this.gold - price >= limit) {
        this.gold -= price;
        this.inventory.push(itemKey);

        // ★追加：カード取得チェック
        this.checkItemCardUnlock(itemKey);

        this.message = `借金して${item.name}を手に入れた...`;
        this.messageTimer = 120;
        if(typeof updateStatUI === 'function') updateStatUI();
        if(typeof window.updateRescueList === 'function' && document.getElementById('panel-rescue').classList.contains('active')) { window.updateRescueList(); }
        saveGameData();
        return true;
    } else {
        this.message = "これ以上借金できない！"; 
        this.messageTimer = 120; 
        return false;
    }
};

aiPet.triggerBankruptcy = function() {
    alert("【自己破産】\n借金が返済できず、すべてを失いました...\n(データは初期化されます)");
    // ★修正：既存のデータだけでなく、遺産やダンジョンの救助フラグなどすべてを確実に消去する
    localStorage.removeItem('map_data_v6');
    localStorage.removeItem('ai_pet_data_v1');
    localStorage.removeItem('ai_legacy_data'); 
    localStorage.removeItem('rescue_waiting_map'); 
    localStorage.removeItem('rescue_waiting_floor'); 
    location.reload();
};

aiPet.constructBuilding = function(typeKey) {
    const buildData = buildingCatalog[typeKey]; if (!buildData) return false;
    if (this.stats.intel < buildData.reqIntel) { this.message = "作り方がわからない..."; this.messageTimer = 120; return false; }
    if (!this.godMode && this.energy < buildData.cost.energy) { this.message = "疲れて作れない..."; this.messageTimer = 120; return false; }
    
    const required = buildData.materials; const myItems = {}; 
    this.inventory.forEach(k => myItems[k] = (myItems[k] || 0) + 1);
    for (let mat in required) { if ((myItems[mat] || 0) < required[mat]) { this.message = `素材不足: ${itemCatalog[mat].name}`; this.messageTimer = 120; return false; } }

    let visualSource = catalog[typeKey];
    if (buildData.sx !== undefined) { visualSource = buildData; }
    if (!visualSource) visualSource = buildData;
    
    let targetSw = visualSource.sw || 50; let targetSh = visualSource.sh || 50;
    let targetScale = (visualSource.scale !== undefined) ? visualSource.scale : 0.5;
    const placementW = targetSw * targetScale; const placementH = targetSh * targetScale;

    let bestX = this.x; let bestY = this.y; let foundSpot = false;
    let targetFlip = false; 

    if (buildData.onWater) {
        let candidateWaters = [];
        let bridges = [];
        for (let key in assets) { if (assets[key].type === 'bridge') bridges.push(assets[key]); }
        for (let key in assets) {
            if (assets[key].type === 'water') {
                let w = assets[key]; let wScale = w.scale || 0.5;
                let wCx = w.dx + (w.sw * wScale) / 2; let wCy = w.dy + (w.sh * wScale) / 2;
                let hasBridge = false;
                bridges.forEach(b => {
                    let bScale = b.scale || 0.5; let bCx = b.dx + (b.sw * bScale) / 2; let bCy = b.dy + (b.sh * bScale) / 2;
                    if (Math.hypot(wCx - bCx, wCy - bCy) < 30) { hasBridge = true; }
                });
                if (!hasBridge) candidateWaters.push(w);
            }
        }
        
        let isHorizontalRiver = false;
        if (candidateWaters.length > 0) {
            let sampleY = candidateWaters[0].dy;
            let sameRow = candidateWaters.filter(w => Math.abs(w.dy - sampleY) < 5).length;
            isHorizontalRiver = (sameRow > 5); 
        }

        let bestWater = null; let bestScore = Infinity; 
        candidateWaters.forEach(w => {
            let wScale = w.scale || 0.5; let cx = w.dx + (w.sw * wScale) / 2; let cy = w.dy + (w.sh * wScale) / 2;
            let distToAI = Math.hypot(this.x - cx, this.y - cy); let distToBridge = Infinity;
            bridges.forEach(b => {
                let bScale = b.scale || 0.5; let bCx = b.dx + (b.sw * bScale) / 2; let bCy = b.dy + (b.sh * bScale) / 2;
                let d = Math.hypot(cx - bCx, cy - bCy);
                if (d < distToBridge) distToBridge = d;
            });
            let score = 0;
            if (bridges.length > 0 && distToBridge < 80) { score = distToBridge + (distToAI * 0.1) - 1000; } 
            else { score = distToAI; }
            if (score < bestScore) { bestScore = score; bestWater = w; }
        });

        if (bestWater) {
            let wScale = bestWater.scale || 0.5;
            bestX = bestWater.dx + (bestWater.sw * wScale) / 2 - placementW / 2;
            bestY = bestWater.dy + (bestWater.sh * wScale) / 2 - placementH / 2;
            if (typeKey === 'bridge') {
                targetScale = 0.125; 
                let newPlacementW = visualSource.sw * targetScale; let newPlacementH = visualSource.sh * targetScale;
                bestX = bestWater.dx + (bestWater.sw * wScale) / 2 - newPlacementW / 2;
                bestY = bestWater.dy + (bestWater.sh * wScale) / 2 - newPlacementH / 2 - 5;
                targetFlip = isHorizontalRiver ? true : false;
            }
            foundSpot = true;
        }
    } else {
        // ★修正: 陸上の建築場所探しをマップ全体から広く・正確に探すように変更
        for(let i=0; i<300; i++) {
            const tryX = 50 + Math.random() * 650; 
            const tryY = 50 + Math.random() * 350;

            // 建物の四隅が水の上に被らないかチェック
            if (this.isPointOnWater(tryX, tryY) || 
                this.isPointOnWater(tryX + placementW, tryY) || 
                this.isPointOnWater(tryX, tryY + placementH) || 
                this.isPointOnWater(tryX + placementW, tryY + placementH)) {
                continue; 
            }

            let hasCollision = false; 
            for (let key in assets) {
                const a = assets[key]; 
                if (a.type === 'ground' || a.type === 'water' || a.type === 'road') continue;
                const aW = (a.sw || 50) * (a.scale || 0.5); const aH = (a.sh || 50) * (a.scale || 0.5);
                if (tryX < a.dx + aW && tryX + placementW > a.dx && tryY < a.dy + aH && tryY + placementH > a.dy) { 
                    hasCollision = true; break; 
                }
            }
            if (!hasCollision) { foundSpot = true; bestX = tryX; bestY = tryY; break; }
        }
    }
    
    if (!foundSpot) { this.message = buildData.onWater ? "水辺が見つからない..." : "建設できる場所がない..."; this.messageTimer = 120; return false; }
    
    // ★修正: 即座に建てるのではなく、建築予定地を目的地にしてタスク化する
    if (!this.godMode) { this.energy -= buildData.cost.energy; }
    for (let mat in required) { const count = required[mat]; for(let i=0; i<count; i++) { const idx = this.inventory.indexOf(mat); if(idx !== -1) this.inventory.splice(idx, 1); } }

    let tx = bestX + placementW / 2;
    let ty = bestY + placementH / 2;

    this.schedule = []; // 他の予定をキャンセル
    this.schedule.push({
        type: 'build', duration: 120, maxDuration: 120,
        buildData: {
            typeKey: typeKey, name: buildData.name,
            bestX: bestX, bestY: bestY,
            targetScale: targetScale, targetFlip: targetFlip,
            visualSource: visualSource, maxDurability: buildData.maxDurability || -1
        }
    });

    let moveTarget = { type: 'building_site', name: '建設予定地', dx: bestX, dy: bestY, sw: placementW, sh: placementH, scale: 1.0 };
    this.interactionTarget = moveTarget;
    
    // ★修正：第4引数に true (水上無視フラグ) を渡す！
    if (this.setDestination(tx, ty, false, true)) {
        this.actionState = 'moving_to_enter';
        this.message = "建設予定地に向かう！"; this.messageTimer = 120;
    } else {
        this.message = "そこには行けないみたい..."; this.messageTimer = 120;
        this.schedule.shift(); // 行けない場合はキャンセル
        return false;
    }

    if(typeof updateCommandHUD === 'function') setTimeout(updateCommandHUD, 500);
    saveGameData(); return true; 
};

aiPet.demolishBuilding = function(uid) {
    const asset = assets[uid]; if (!asset) return;
    delete assets[uid]; this.message = "解体完了。"; this.messageTimer = 120; this.actionState = 'idle'; saveGameData();
};

aiPet.checkCastleQuest = function() {
    const rank = this.castleRank || 1; if (!this.questBoard) this.questBoard = [];
    while (this.questBoard.length < 3) {
        const newQuest = { type: 'delivery', target: 'stone', count: 3, reward: 100, timeLeft: 200 };
        this.questBoard.push(newQuest);
    }
    saveGameData();
};

aiPet.workFarm = function() {
    const farm = this.interactionTarget;
    if (!farm || farm.type !== 'farm') return;

    if (this.intendedSeed) {
        farm.waterLevel = 100; farm.pestState = false; farm.pestTimer = 0; farm.careCount = 0; farm.isDead = false; farm.isEaten = false;
        
        if (this.intendedSeed === 'seed_carrot_given') {
            // ★特別仕様の作物としてマーキング
            farm.plantedCrop = 'carrot_special'; 
            farm.growth = 0;
            this.message = `支給されたニンジンの種を植えたよ！`; 
        } else {
            // 通常の種
            const seedIndex = this.inventory.indexOf(this.intendedSeed);
            if (seedIndex !== -1) {
                this.inventory.splice(seedIndex, 1);
                farm.plantedCrop = this.intendedSeed.replace('seed_', '');
                farm.growth = 0;
                this.message = `${itemCatalog[farm.plantedCrop].name}の種を植えたよ！`;
            }
        }
        this.intendedSeed = null;
    } else {
        // 1. 枯れた・食べられた畑の片付け
        if (farm.isDead || farm.isEaten) {
            const isApprentice = this.apprentice && this.apprentice.currentMaster === 'farming';
            const itemKey = farm.isDead ? 'dead_crop' : 'eaten_crop';
            
            // 弟子入り中ならアイテムとして回収、そうでなければただの片付け
            if (isApprentice) {
                this.inventory.push(itemKey);
                this.message = `${itemCatalog[itemKey].name}を回収して片付けたよ...`;
            } else {
                this.message = "ダメになった野菜を片付けたよ。";
            }
            
            farm.plantedCrop = null; farm.growth = 0; 
            farm.isDead = false; farm.isEaten = false; farm.pestState = false;
            this.messageTimer = 120;
        } 
        // 2. 害虫退治
        else if (this.intendedAction === 'pest_control' && farm.pestState) {
            farm.pestState = false; farm.pestTimer = 0; farm.careCount = (farm.careCount || 0) + 2; 
            this.message = "害虫・害獣を退治したよ！"; this.messageTimer = 120; this.intendedAction = null;
        } 
        // 3. 収穫
        else if (farm.growth >= 100) {
            let itemKey = farm.plantedCrop === 'carrot_special' ? 'carrot' : farm.plantedCrop;
            
            // 世話を頑張ったボーナス
            if (farm.careCount >= 3 && Math.random() < 0.5) { 
                if (itemKey === 'carrot') itemKey = 'high_carrot'; 
                if (itemKey === 'pepper') itemKey = 'high_pepper'; 
                if (itemKey === 'tomato') itemKey = 'high_tomato';
                this.message = `大成功！${itemCatalog[itemKey].name}を収穫した！`;
            } else { 
                this.message = `やったー！${itemCatalog[itemKey].name}を収穫したよ！`; 
            }
            
            this.inventory.push(itemKey); 
            this.messageTimer = 150; 
            farm.plantedCrop = null; farm.growth = 0; 
            farm.isDead = false; farm.isEaten = false; farm.pestState = false; farm.careCount = 0;
        } 
        // 4. 水やり・手入れ
        else {
            farm.waterLevel = 100; 
            farm.growth += 20; 
            if (farm.growth > 100) farm.growth = 100;
            farm.careCount = (farm.careCount || 0) + 1;
            this.message = "畑に水をやり、手入れをしたよ"; this.messageTimer = 120;
        }
        
        // インベントリパネルが開いていれば更新
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) { openInventoryPanel(); }
        }
    }

    // ==========================================
    // ★カード解禁・保存処理
    // ==========================================
    if (typeof window.triggerTCGUnlock === 'function') {
        // 「収穫したよ！」という合図（action_farm）だけを送る
        window.triggerTCGUnlock('action_farm', this.generation);
    }

    saveGameData();
};