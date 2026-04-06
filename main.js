// main.js : 初期化、入力イベント、ゲームループ (全種族ダンジョン・店舗家具エディタ対応版)

setTimeout(() => {
    let targetCatalog = null;
    if (typeof catalog !== 'undefined') targetCatalog = catalog;
    else if (typeof window.catalog !== 'undefined') targetCatalog = window.catalog;
    
    if (!targetCatalog) {
        window.catalog = {};
        targetCatalog = window.catalog;
    }

    targetCatalog['restaurant'] = {
        name: 'レストラン', type: 'restaurant',
        img: 'field_4', sx: 278, sy: 115, sw: 222, sh: 220, scale: 0.5,
        materials: { 'stone': 5, 'wood': 5 }, 
        reqBuildLevel: 3,
        isIndoors: true,
        bgImage: 'empty_room.png', 
        shopData: { recipes: {}, inventory: {}, prices: {}, reputation: 10, interiorLevel: 1, totalSales: 0, isOpen: false }
    };

    targetCatalog['smith'] = {
        name: '鍛冶屋', type: 'smith',
        img: 'field_4', sx: 271, sy: 365, sw: 241, sh: 248, scale: 0.5,
        materials: { 'stone': 5, 'iron': 5 }, 
        reqBuildLevel: 3,
        isIndoors: true,
        bgImage: 'empty_room.png', 
        shopData: { recipes: {}, inventory: {}, prices: {}, reputation: 10, interiorLevel: 1, totalSales: 0, isOpen: false }
    };

    targetCatalog['shop'] = {
        name: 'ショップ', type: 'shop',
        img: 'field_3', sx: 749, sy: 86, sw: 231, sh: 237, scale: 0.5,
        materials: { 'wood': 10, 'stone': 5 },
        reqBuildLevel: 4,
        isIndoors: true,
        bgImage: 'empty_room.png',
        shopData: { recipes: {}, inventory: {}, prices: {}, reputation: 10, interiorLevel: 1, totalSales: 0, isOpen: false }
    };
    targetCatalog['blacksmith'] = targetCatalog['smith'];
}, 1000);

window.getPersonalityType = function(stats) {
    if (!stats) return "普通";
    if (stats.mood <= 30) return "憂鬱";
    if (stats.power > stats.intel && stats.power > stats.beauty) return "熱血";
    if (stats.intel > stats.power && stats.intel > stats.beauty) return "知的";
    if (stats.beauty > stats.power && stats.beauty > stats.intel) return "魅惑";
    return "普通";
};

console.log("Main.js Loaded: All Species Dungeon Supported");

let imagesLoaded = 0;
const images = {};
const totalImages = Object.keys(imageSources).length;
let gameStarted = false; 

const checkLoad = () => { 
    imagesLoaded++; 
    if(imagesLoaded >= totalImages && !gameStarted) { 
        startGameSequence();
    } 
};

window.checkLoginBonus = function() {
    if (!window.aiPet || !window.aiPet.id) return;
    const today = new Date().toLocaleDateString('ja-JP'); 
    const lastLoginDate = localStorage.getItem('last_login_date');
    if (lastLoginDate !== today) {
        if (typeof window.aiPet.gold === 'undefined') window.aiPet.gold = 0;
        window.aiPet.gold += 100;
        localStorage.setItem('last_login_date', today);
        saveGameData();
        if (typeof updateStatUI === 'function') updateStatUI();
        const overlay = document.getElementById('loginBonusOverlay');
        if (overlay) overlay.classList.add('active');
    }
};

window.closeLoginBonus = function() {
    const overlay = document.getElementById('loginBonusOverlay');
    if (overlay) overlay.classList.remove('active');
};

// ▼▼▼ 追加：TCGボタン偽装＆アップデート処理 ▼▼▼
window.updateTcgButtonAppearance = function() {
    const btn = document.getElementById('btnTcgDeck');
    if (!btn) return;

    // 現在の所持枚数をチェック
    const collectionCount = (window.TCG && window.TCG.myCollection) ? window.TCG.myCollection.length : 0;

    if (collectionCount >= 60) {
        // TCG解禁後（本来の姿）
        btn.innerHTML = '🃏 TCG';
        btn.style.background = '#9C27B0'; // 元の紫カラー
    } else {
        // TCG未解放時（アルバムに偽装）
        btn.innerHTML = '📖 アルバム';
        btn.style.background = '#795548'; // アルバム風のブラウンカラー
    }
};

function startGameSequence() {
    if(gameStarted) return;
    gameStarted = true;
    createPalette(); 

    const forceFirstPlay = localStorage.getItem('force_first_play');
    const triggerFadeIn = localStorage.getItem('trigger_fade_in'); 
    const isNewGame = (forceFirstPlay === 'true' || (typeof isFirstPlay !== 'undefined' && isFirstPlay));

    const els = ['canvas-wrapper', 'aiStatus', 'info-column', 'gameControls'];

    if (isNewGame) {
        els.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
        });
        switchMode('play'); 
        localStorage.removeItem('force_first_play'); 
        if (typeof startPersonalityTest === 'function') startPersonalityTest(); 
    } else if (triggerFadeIn === 'true') {
        localStorage.removeItem('trigger_fade_in'); 
        switchMode('play');
        els.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
        });
        setTimeout(() => {
            els.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.transition = 'opacity 2.5s ease-in-out';
                    setTimeout(() => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }, 50); 
                }
            });
            setTimeout(checkLoginBonus, 2500);
        }, 100);
    } else {
        switchMode('play'); 
        els.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.transition = 'none'; el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
        });
        setTimeout(checkLoginBonus, 500);
    }

    // ▼▼▼ 追加：UIが表示されるタイミングでボタン表示を更新 ▼▼▼
    if (typeof window.updateTcgButtonAppearance === 'function') window.updateTcgButtonAppearance();
    // ▲▲▲ 追加おわり ▲▲▲

    requestAnimationFrame(render);
}

window.getDailyQuests = function() {
    const today = new Date().toLocaleDateString('ja-JP');
    let dailyData = JSON.parse(localStorage.getItem('daily_quests') || 'null');
    if (!dailyData || dailyData.date !== today) {
        dailyData = { date: today, quests: [ { type: 'study', title: "📚 勉強を3回する", current: 0, target: 3, rewarded: false, reward: 50 }, { type: 'train', title: "💪 筋トレを3回する", current: 0, target: 3, rewarded: false, reward: 50 }, { type: 'eat', title: "🍖 食事を3回する", current: 0, target: 3, rewarded: false, reward: 50 } ] };
        localStorage.setItem('daily_quests', JSON.stringify(dailyData));
    }
    return dailyData;
};

window.progressDailyQuest = function(actionType) {
    if (actionType === 'rest') actionType = 'sleep';
    let data = window.getDailyQuests(); let updated = false;
    data.quests.forEach(q => {
        if (q.type === actionType && q.current < q.target) {
            q.current++; updated = true;
            if (q.current === q.target && typeof window.addFloatingText === 'function' && window.aiPet) { window.addFloatingText(window.aiPet.x, window.aiPet.y - 60, "デイリー達成！", "#4CAF50"); }
        }
    });
    if (updated) {
        localStorage.setItem('daily_quests', JSON.stringify(data));
        const overlay = document.getElementById('dailyQuestOverlay');
        if (overlay && overlay.classList.contains('active')) window.renderDailyQuestUI(); 
    }
};

window.openDailyQuest = function() { window.renderDailyQuestUI(); const overlay = document.getElementById('dailyQuestOverlay'); if (overlay) overlay.classList.add('active'); };

window.renderDailyQuestUI = function() {
    const data = window.getDailyQuests(); const container = document.getElementById('dailyQuestContent'); if (!container) return;
    let html = ""; let allCleared = true;
    data.quests.forEach((q, index) => {
        const isCleared = q.current >= q.target; if (!isCleared || !q.rewarded) allCleared = false;
        html += `<div style="background: #333; padding: 10px; border-radius: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${isCleared ? '#4CAF50' : '#FF9800'};">`;
        html += `<div><div style="font-weight: bold; color: ${isCleared ? '#8BC34A' : '#fff'};">${q.title}</div><div style="font-size: 12px; color: #aaa;">進捗: ${q.current} / ${q.target}</div></div>`;
        if (q.rewarded) html += `<button class="quiz-btn" style="background: #555; cursor: not-allowed; font-size: 12px; padding: 5px 10px;" disabled>受取済</button>`;
        else if (isCleared) html += `<button class="quiz-btn" style="background: #FFC107; color: #000; font-size: 12px; padding: 5px 10px; font-weight: bold;" onclick="claimDailyReward(${index})">🎁 ${q.reward}G 獲得</button>`;
        else html += `<button class="quiz-btn" style="background: #444; color: #888; font-size: 12px; padding: 5px 10px;" disabled>未達成</button>`;
        html += `</div>`;
    });
    if (allCleared) html += `<div style="text-align: center; color: #FFD700; font-weight: bold; margin-top: 15px;">✨ 本日のクエストをすべてクリアしました！ ✨</div>`;
    container.innerHTML = html;
};

window.claimDailyReward = function(index) {
    let data = window.getDailyQuests(); let q = data.quests[index];
    if (q && q.current >= q.target && !q.rewarded) {
        q.rewarded = true;
        if (window.aiPet) {
            if (typeof window.aiPet.gold === 'undefined') window.aiPet.gold = 0;
            window.aiPet.gold += q.reward; saveGameData();
            if (typeof updateStatUI === 'function') updateStatUI();
        }
        localStorage.setItem('daily_quests', JSON.stringify(data)); window.renderDailyQuestUI(); 
    }
};

const dummyImageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
for(let key in imageSources) {
    images[key] = new Image(); images[key].onload = checkLoad;
    images[key].onerror = () => { console.warn(`❌ 画像が見つかりません: [ ${imageSources[key]} ]`); images[key].src = dummyImageSrc; checkLoad(); }; 
    images[key].src = imageSources[key];
}

setTimeout(() => { if (!gameStarted) startGameSequence(); }, 3000);

let currentMode = 'play'; let isDevMode = false;   

window.switchMode = function(mode) {
    currentMode = mode; document.body.className = "mode-" + mode;
    const navBtns = document.querySelectorAll('.nav-btn');
    if (navBtns) {
        navBtns.forEach(b => { 
            if (mode === 'debug' && b.id === 'btnDebug') b.classList.add('active');
            else if (mode !== 'debug' && b.id.toLowerCase().includes(mode.replace('_',''))) b.classList.add('active');
            else b.classList.remove('active');
        });
    }
    const gameControls = document.getElementById('gameControls'); 
    const debugOverlay = document.getElementById('debugOverlay'); 
    const help = document.getElementById('controls-help');
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
    document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));

    // ==========================================
    // ★追加：Play Mode以外の時はゲームのメインUIをすべて隠す！
    // ==========================================
    const mainUIElements = [
        document.getElementById('aiStatus'),      // 上部のステータスバー
        document.getElementById('info-column'),   // 右側のコマンドセンター
        document.getElementById('chat-container') // 下部のチャット欄（※IDはHTMLに合わせて適宜読み替えてください）
    ];
    // もしチャット欄のIDが 'chat-container' ではない場合を考慮し、chatInputの親要素も隠す
    const chatInput = document.getElementById('chatInput');
    if (chatInput && chatInput.parentElement) {
        mainUIElements.push(chatInput.parentElement);
    }

    if (mode === 'play') { 
        if(gameControls) gameControls.style.display = 'flex'; 
        if(help) help.style.display = 'none';
        const defPanel = document.getElementById('panel-default'); if(defPanel) defPanel.classList.add('active');
        
        // UIを再表示
        mainUIElements.forEach(el => { if (el) el.style.display = ''; });

    } else if (mode === 'debug') { 
        if(gameControls) gameControls.style.display = 'none'; 
        if(help) help.style.display = 'none';
        if(debugOverlay) { debugOverlay.classList.add('active'); if(typeof loadDebugData === 'function') loadDebugData(); }
        
        // UIを隠す
        mainUIElements.forEach(el => { if (el) el.style.display = 'none'; });

    } else { 
        // editor, ai_adjust などの開発モード
        if(gameControls) gameControls.style.display = 'none'; 
        if(help) help.style.display = 'block';
        const sidePanel = document.getElementById('side-panel'); if(sidePanel) { sidePanel.classList.add('active'); sidePanel.style.display = 'flex'; }
        
        // UIを隠す（これでチャット欄などにフォーカスを奪われなくなります！）
        mainUIElements.forEach(el => { if (el) el.style.display = 'none'; });
    }
    
    selectedAsset = null; createPalette(); render();
};

function createPalette() {
    const el = document.getElementById('palette'); if(!el) return; el.innerHTML = '';
    for (let id in catalog) {
        if (currentMode === 'grazing_editor') {
            const itemType = catalog[id].type;
            if (itemType === 'building' && typeof grazingData !== 'undefined' && !grazingData.discoveredFacilities.includes(id)) continue; 
        }
        const item = catalog[id]; const btn = document.createElement('div'); btn.className = 'palette-item';
        let psw = item.sw || 50; let psh = item.sh || 50; const size = 50, ratio = size / Math.max(1, psw, psh);
        btn.style.width = size + 'px'; btn.style.height = size + 'px';
        const imgName = item.img || 'field'; const imgUrl = imageSources[imgName];
        btn.style.backgroundImage = `url(${imgUrl})`; btn.style.backgroundPosition = `-${(item.sx||0) * ratio}px -${(item.sy||0) * ratio}px`;
        if (images[imgName] && images[imgName].complete) btn.style.backgroundSize = `${images[imgName].width * ratio}px ${images[imgName].height * ratio}px`; 
        else btn.style.backgroundSize = 'cover'; 
        
        btn.onclick = () => {
            if (currentMode === 'editor' || currentMode === 'grazing_editor') {
                const uid = id + "_" + Date.now(); const initScale = (item.scale !== undefined) ? item.scale : 0.5;
                const dropX = (canvas.width/2 - 50) + camera.x; const dropY = (canvas.height/2 - 50) + camera.y;
                assets[uid] = { ...item, dx: dropX, dy: dropY, scale: initScale, flip: false, img: item.img || 'field' }; selectedAsset = assets[uid];
            } else if (currentMode === 'ai_adjust') { editingTarget = 'map'; selectedMapKey = id; }
            if(typeof render === 'function') render();
        };
        el.appendChild(btn);
    }
}

// ==========================================
// ★ AI調整用の直接入力UIパネル（家具エディタ機能追加版）
// ==========================================
window.editingTarget = 'ai'; window.selectedCardKey = ''; window.selectedDungeonSpriteKey = 'skull_floor'; 
window.selectedFurnitureIndex = 0; window.copiedFrameData = null; 

function initAdjustUI() {
    const panel = document.createElement('div'); panel.id = 'ai-adjust-panel';
    panel.style.cssText = `position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.85); color:white; padding:15px; border-radius:8px; display:none; z-index:9999; font-family:monospace; box-shadow:0 4px 10px rgba(0,0,0,0.5);`;
    
    panel.innerHTML = `
        <div style="margin-bottom:10px; font-weight:bold; border-bottom:1px solid #555; padding-bottom:5px;">✂ Adjust Mode (Direct Input)</div>
        <div style="margin-bottom:10px;">
            <label style="margin-right:10px; cursor:pointer;"><input type="radio" name="adjTarget" value="ai" checked> AI</label>
            <label style="margin-right:10px; cursor:pointer;"><input type="radio" name="adjTarget" value="map"> MAP</label>
            <label style="margin-right:10px; cursor:pointer;"><input type="radio" name="adjTarget" value="card"> CARD</label>
            <div style="margin-top: 5px;">
                <label style="margin-right:10px; cursor:pointer; color:#00BCD4;"><input type="radio" name="adjTarget" value="dmap"> D-MAP</label>
                <label style="margin-right:10px; cursor:pointer; color:#2196F3;"><input type="radio" name="adjTarget" value="dgim"> D-GIM(地形)</label>
                <label style="margin-right:10px; cursor:pointer; color:#9C27B0;"><input type="radio" name="adjTarget" value="dtrap"> D-TRAP(罠)</label>
            </div>
            <div style="margin-top: 5px;">
                <label style="margin-right:10px; cursor:pointer; color:#FFEB3B;"><input type="radio" name="adjTarget" value="ditem"> D-ITEM(拾)</label>
                <label style="margin-right:10px; cursor:pointer; color:#4CAF50;"><input type="radio" name="adjTarget" value="dchr"> D-CHR</label>
            </div>
            <div style="margin-top: 5px;">
                <label style="margin-right:10px; cursor:pointer; color:#ff5252;"><input type="radio" name="adjTarget" value="achr"> ARENA-CHR</label>
                <label style="cursor:pointer; color:#FF9800;"><input type="radio" name="adjTarget" value="afld"> ARENA-FLD</label>
            </div>
            <div style="margin-top: 5px;">
                <label style="margin-right:10px; cursor:pointer; color:#E040FB;"><input type="radio" name="adjTarget" value="rasset"> R-ASSET</label>
                <label style="cursor:pointer; color:#7C4DFF;"><input type="radio" name="adjTarget" value="sasset"> S-ASSET</label>
            </div>
        </div>
        <div id="ai-adjust-status" style="margin-bottom:10px; font-size:12px; color:#00ff00;"></div>
        <div style="margin:10px 0; display:flex; align-items:center;" id="adj-act-wrap">
            <label style="width:60px; color:#FFD700;">Action:</label>
            <select id="adjust-action-select" style="flex:1; background:#222; color:#fff; border:1px solid #555; padding:4px;">
                ${['idle','move','study','train','sleep','eat_dish','eat_raw','fish','cook','smith','farm_plow','farm_seed','farm_water','farm_pest','farm_harvest'].map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
        </div>
        <div style="margin:8px 0; display:flex; align-items:center;">
            <label style="width:55px;">IMG: </label><input type="text" id="direct-input-image" style="flex:1; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:3px;">
        </div>
        ${['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY'].map(f => `
            <div style="margin:8px 0; display:flex; align-items:center;">
                <label style="width:55px;">${f.toUpperCase()}: </label>
                <input type="number" step="${f.includes('scale') ? '0.05' : '1'}" id="direct-input-${f}" style="width:70px; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:3px;">
            </div>
        `).join('')}
        <div style="margin-top:15px; display:flex; gap:8px;">
            <button id="adj-btn-copy" style="flex:1; padding:6px; background:#444; color:white; border:none; cursor:pointer; border-radius:4px; font-weight:bold;">Copy</button>
            <button id="adj-btn-paste" style="flex:1; padding:6px; background:#444; color:white; border:none; cursor:pointer; border-radius:4px; font-weight:bold;">Paste</button>
        </div>
    `;
    document.body.appendChild(panel);

    document.querySelectorAll('input[name="adjTarget"]').forEach(el => el.addEventListener('change', e => {
        editingTarget = e.target.value;
        if (editingTarget === 'card' && !selectedCardKey && typeof window.TCG_MASTER !== 'undefined') selectedCardKey = Object.keys(window.TCG_MASTER)[0];
        window.selectedFurnitureIndex = 0; 
        if (typeof render === 'function') render();
    }));

    document.getElementById('adjust-action-select').addEventListener('change', e => {
        if (typeof editingActionType !== 'undefined') { editingActionType = e.target.value; editingFrameIndex = 0; if(typeof render === 'function') render(); }
    });

    document.getElementById('direct-input-image').addEventListener('input', e => {
        const target = getAdjustTarget(); if (target) { target.image = e.target.value; if(target.img !== undefined) target.img = e.target.value; if(typeof render === 'function') render(); }
    });
    document.getElementById('direct-input-image').addEventListener('change', () => { if(typeof saveGameData === 'function') saveGameData(); });

    ['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY'].forEach(f => {
        const input = document.getElementById('direct-input-' + f);
        input.addEventListener('input', e => {
            const target = getAdjustTarget(); if (target) { target[f] = parseFloat(e.target.value) || (f.includes('scale') ? 1 : 0); if(typeof render === 'function') render(); }
        });
        input.addEventListener('change', () => { if(typeof saveGameData === 'function') saveGameData(); });
    });

    document.getElementById('adj-btn-copy').onclick = function() {
         const target = getAdjustTarget();
         if(target) {
             window.copiedFrameData = { sx: target.sx, sy: target.sy, sw: target.sw, sh: target.sh, scaleX: target.scaleX, scaleY: target.scaleY, scale: target.scale };
             this.innerText = 'Copied!'; this.style.background = '#2e8b57'; setTimeout(() => { this.innerText = 'Copy'; this.style.background = '#444'; }, 1000);
         }
    };
    
    document.getElementById('adj-btn-paste').onclick = function() {
         const target = getAdjustTarget();
         if(target && window.copiedFrameData) {
             target.sx = window.copiedFrameData.sx; target.sy = window.copiedFrameData.sy; target.sw = window.copiedFrameData.sw; target.sh = window.copiedFrameData.sh;
             if(window.copiedFrameData.scaleX !== undefined) target.scaleX = window.copiedFrameData.scaleX;
             if(window.copiedFrameData.scaleY !== undefined) target.scaleY = window.copiedFrameData.scaleY;
             if(window.copiedFrameData.scale !== undefined) target.scale = window.copiedFrameData.scale;
             if(typeof render === 'function') render(); if(typeof saveGameData === 'function') saveGameData();
             this.innerText = 'Pasted!'; this.style.background = '#b22222'; setTimeout(() => { this.innerText = 'Paste'; this.style.background = '#444'; }, 1000);
         }
    };

    setInterval(() => {
        const p = document.getElementById('ai-adjust-panel'); if (!p) return;
        document.getElementsByName('adjTarget').forEach(r => { if (r.value === editingTarget) r.checked = true; });

        const statusEl = document.getElementById('ai-adjust-status');
        if (statusEl) {
            if (editingTarget === 'ai') statusEl.innerText = `Target: ${selectedAIType || 'None'}`;
            else if (editingTarget === 'map') statusEl.innerText = `Target: ${selectedMapKey || 'None'}`;
            else if (editingTarget === 'card') statusEl.innerText = `Target: ${window.TCG_MASTER ? window.TCG_MASTER[selectedCardKey]?.name : 'None'}`;
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget)) statusEl.innerText = `Target: ${window.selectedDungeonSpriteKey || 'None'}`; // ★修正
            else if (editingTarget === 'rasset') {
                let fData = window.SHOP_FURNITURE_DATA && window.SHOP_FURNITURE_DATA['restaurant'] ? window.SHOP_FURNITURE_DATA['restaurant'][window.selectedFurnitureIndex] : null;
                statusEl.innerText = `Target: ${fData ? fData.name : 'None'} (${window.selectedFurnitureIndex+1})`;
            }
            else if (editingTarget === 'sasset') {
                let fData = window.SHOP_FURNITURE_DATA && window.SHOP_FURNITURE_DATA['smith'] ? window.SHOP_FURNITURE_DATA['smith'][window.selectedFurnitureIndex] : null;
                statusEl.innerText = `Target: ${fData ? fData.name : 'None'} (${window.selectedFurnitureIndex+1})`;
            }
        }
        
        if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust') {
            const target = getAdjustTarget();
            if (target) {
                p.style.display = 'block';
                document.getElementById('adj-act-wrap').style.display = (editingTarget === 'ai') ? 'flex' : 'none';
                
                const sel = document.getElementById('adjust-action-select');
                if (sel && document.activeElement !== sel && typeof editingActionType !== 'undefined') sel.value = editingActionType;

                const imgEl = document.getElementById('direct-input-image');
                if (imgEl && document.activeElement !== imgEl) imgEl.value = target.image || target.img || '';

                ['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY'].forEach(f => {
                    const el = document.getElementById('direct-input-' + f);
                    if (document.activeElement !== el) {
                        // 家具の場合は scaleX 欄に scale（配置倍率）を表示する
                        if (f === 'scaleX' && ['dmap', 'dchr', 'achr', 'afld', 'rasset', 'sasset'].includes(editingTarget)) {
                            el.value = target.scale !== undefined ? target.scale : 1;
                        } else { el.value = target[f] !== undefined ? target[f] : (f.includes('scale') ? 1 : 0); }
                    }
                });
            } else { p.style.display = 'none'; }
        } else { p.style.display = 'none'; }
    }, 100);
}

window.getAdjustTarget = function() {
    if (typeof currentMode === 'undefined' || currentMode !== 'ai_adjust') return null;
    let target = null;
    
    if (editingTarget === 'ai') { 
        if(typeof aiConfigs !== 'undefined' && aiConfigs[selectedAIType] && aiConfigs[selectedAIType].actions[editingActionType]) { target = aiConfigs[selectedAIType].actions[editingActionType][editingFrameIndex]; }
    } else if (editingTarget === 'map') { 
        if(typeof catalog !== 'undefined') target = catalog[selectedMapKey]; 
    } else if (editingTarget === 'card') {
        if(typeof window.TCG_MASTER !== 'undefined' && window.TCG_MASTER[selectedCardKey]) {
            target = window.TCG_MASTER[selectedCardKey];
            if (target.sx === undefined) {
                let base = null;
                if (typeof aiConfigs !== 'undefined' && aiConfigs[target.type] && aiConfigs[target.type].actions && aiConfigs[target.type].actions.idle) base = aiConfigs[target.type].actions.idle[0];
                else if (typeof catalog !== 'undefined' && catalog[target.type]) base = catalog[target.type];
                target.sx = base ? (base.sx || 0) : 0; target.sy = base ? (base.sy || 0) : 0;
                target.sw = base ? (base.sw || 150) : 150; target.sh = base ? (base.sh || 150) : 150;
                target.scaleX = 1.0; target.scaleY = 1.0;
                if (!target.image) target.image = base ? (base.img || base.image || 'characters') : 'characters';
            }
        }
    // ★ 修正：dgim(地形ギミック), dtrap(罠), ditem(アイテム) を追加
    } else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget)) {
        if (typeof window.DUNGEON_SPRITES !== 'undefined') {
            const keys = Object.keys(window.DUNGEON_SPRITES).filter(k => {
                if (editingTarget === 'dmap') return k.startsWith('skull_') || k.startsWith('crystal_');
                if (editingTarget === 'dgim') return k.startsWith('gimmick_');
                if (editingTarget === 'dtrap') return k.startsWith('trap_');
                if (editingTarget === 'ditem') return k.startsWith('spr_item_');
                if (editingTarget === 'dchr') return !k.startsWith('skull_') && !k.startsWith('crystal_') && !k.startsWith('gimmick_') && !k.startsWith('trap_') && !k.startsWith('spr_item_') && !k.startsWith('arena_');
                if (editingTarget === 'achr') return k.startsWith('arena_') && !k.startsWith('arena_fld_');
                if (editingTarget === 'afld') return k.startsWith('arena_fld_');
                return false;
            });
            if (keys.length > 0 && !keys.includes(window.selectedDungeonSpriteKey)) window.selectedDungeonSpriteKey = keys[0];
            target = window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey];
        }
    } else if (editingTarget === 'rasset') {
        if (typeof window.SHOP_FURNITURE_DATA !== 'undefined' && window.SHOP_FURNITURE_DATA['restaurant']) {
            let list = window.SHOP_FURNITURE_DATA['restaurant'];
            if (window.selectedFurnitureIndex >= list.length) window.selectedFurnitureIndex = 0;
            target = list[window.selectedFurnitureIndex];
        }
    } else if (editingTarget === 'sasset') {
        if (typeof window.SHOP_FURNITURE_DATA !== 'undefined' && window.SHOP_FURNITURE_DATA['smith']) {
            let list = window.SHOP_FURNITURE_DATA['smith'];
            if (window.selectedFurnitureIndex >= list.length) window.selectedFurnitureIndex = 0;
            target = list[window.selectedFurnitureIndex];
        }
    }
    return target;
};

window.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.code === 'KeyD' || (e.key && e.key.toLowerCase() === 'd'))) { 
        e.preventDefault(); isDevMode = !isDevMode; const nav = document.getElementById('nav'); if (nav) nav.style.display = isDevMode ? 'flex' : 'none'; 
        if (isDevMode) { if (document.activeElement) document.activeElement.blur(); } else { const chatInput = document.getElementById('chatInput'); if (chatInput) chatInput.focus(); }
        return; 
    }

    const repeatableKeys = ['w', 'a', 's', 'd', 'q', 'e', 'z', 'c', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (e.repeat && e.key && !repeatableKeys.includes(e.key.toLowerCase()) && !repeatableKeys.includes(e.key)) return;

    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        if (document.activeElement === document.getElementById('chatInput')) { if (e.key === 'Enter') { e.preventDefault(); sendChat(); return; } }
        return;
    }

    if (isDevMode) {
        if (e.key === '1') switchMode('editor'); if (e.key === '2') switchMode('ai_adjust'); if (e.key === '3') switchMode('play'); if (e.key === '4') switchMode('debug');
        
        if (e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            if (currentMode === 'editor' || currentMode === 'grazing_editor') exportMapData();
            else if (currentMode === 'ai_adjust') {
                if (editingTarget === 'card' && typeof window.TCG_MASTER !== 'undefined') {
                    console.log("▼▼▼ TCG_MASTER ▼▼▼\n" + JSON.stringify(window.TCG_MASTER, null, 4)); alert("カードデータをコンソールに出力しました！");
                } else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && typeof window.DUNGEON_SPRITES !== 'undefined') { // ★修正
                    console.log("▼▼▼ DUNGEON_SPRITES ▼▼▼\n" + JSON.stringify(window.DUNGEON_SPRITES, null, 4)); alert("ダンジョン素材をコンソールに出力しました！");
                } else if (['rasset', 'sasset'].includes(editingTarget) && typeof window.SHOP_FURNITURE_DATA !== 'undefined') {
                    console.log("▼▼▼ SHOP_FURNITURE_DATA ▼▼▼\n" + JSON.stringify(window.SHOP_FURNITURE_DATA, null, 4)); alert("家具配置データをコンソールに出力しました！\nこれを ui_controller.js に貼り付けてください。");
                } else { if(typeof exportAIConfig === 'function') exportAIConfig(); }
            } else alert("エディタまたはAI調整モードで実行してください");
        }
    }

    if (currentMode === 'play') return;
    if (!isDevMode) return;

    if (currentMode === 'ai_adjust') {
        if (e.key.toLowerCase() === 'h') { showAdjustUI = !showAdjustUI; render(); return; }
        if (e.key.toLowerCase() === 'p') { adjustUIPosRight = !adjustUIPosRight; render(); return; }

        if (e.shiftKey) {
            const speciesMap = { 'Digit1':'robot', 'Digit2':'spirit', 'Digit3':'magician', 'Digit4':'machine', 'Digit5':'stone', 'Digit6':'ghost', 'Digit7':'seed', 'Digit8':'bird', 'Digit9':'balloon', 'Digit0':'dragon', 'Minus':'beetle' };
            const baseSpecies = speciesMap[e.code];
            if (baseSpecies) {
                if (window.lastSwitchTime && Date.now() - window.lastSwitchTime < 200) return; window.lastSwitchTime = Date.now();
                const getEvolutionTree = (base) => { if (typeof charaTraits !== 'undefined') return Object.keys(charaTraits).filter(k => k === base || k.startsWith(base + '_')); return [base]; };
                const cycle = getEvolutionTree(baseSpecies); let idx = cycle.indexOf(selectedAIType);
                if (idx === -1) selectedAIType = cycle[0]; else selectedAIType = cycle[(idx + 1) % cycle.length];
                editingActionType = 'idle'; editingFrameIndex = 0; 
                if (typeof aiConfigs !== 'undefined') {
                    if (!aiConfigs[selectedAIType]) aiConfigs[selectedAIType] = { scale: 0.25, actions: { idle: [{sx:0, sy:0, sw:50, sh:50}] } };
                    if (aiConfigs[selectedAIType] && !aiConfigs[selectedAIType].actions[editingActionType]) {
                        const available = Object.keys(aiConfigs[selectedAIType].actions); if (available.length > 0) editingActionType = available[0];
                    }
                }
                saveGameData(); render(); return; 
            }
        }

        // ★修正：Tabまたは「. (ピリオド)」で次へ、「, (カンマ)」で前へ戻る
        let isNext = (e.key === 'Tab' && !e.shiftKey) || e.key === '.';
        let isPrev = e.key === ',';

        if (isNext || isPrev) { 
            e.preventDefault(); 
            if (editingTarget === 'ai') {
                const currentIndex = actionTypes.indexOf(editingActionType); 
                let nextIndex = isPrev ? (currentIndex - 1 + actionTypes.length) % actionTypes.length : (currentIndex + 1) % actionTypes.length;
                editingActionType = actionTypes[nextIndex]; editingFrameIndex = 0; 
            } else if (editingTarget === 'card' && typeof window.TCG_MASTER !== 'undefined') {
                const keys = Object.keys(window.TCG_MASTER); let idx = keys.indexOf(selectedCardKey);
                if (isPrev) idx = (idx - 1 + keys.length) % keys.length; else idx = (idx + 1) % keys.length;
                selectedCardKey = keys[idx];
            } else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && typeof window.DUNGEON_SPRITES !== 'undefined') { // ★修正
                const keys = Object.keys(window.DUNGEON_SPRITES).filter(k => {
                    if (editingTarget === 'dmap') return k.startsWith('skull_') || k.startsWith('crystal_');
                    if (editingTarget === 'dgim') return k.startsWith('gimmick_'); // ★追加
                    if (editingTarget === 'dtrap') return k.startsWith('trap_'); // ★追加
                    if (editingTarget === 'ditem') return k.startsWith('spr_item_'); // ★追加
                    if (editingTarget === 'dchr') return !k.startsWith('skull_') && !k.startsWith('crystal_') && !k.startsWith('gimmick_') && !k.startsWith('trap_') && !k.startsWith('spr_item_') && !k.startsWith('arena_'); // ★修正
                    if (editingTarget === 'achr') return k.startsWith('arena_') && !k.startsWith('arena_fld_');
                    if (editingTarget === 'afld') return k.startsWith('arena_fld_');
                    return false;
                });
                if (keys.length > 0) {
                    let currentKey = window.selectedDungeonSpriteKey || keys[0]; 
                    if (!keys.includes(currentKey)) currentKey = keys[0];
                    let idx = keys.indexOf(currentKey);
                    if (isPrev) idx = (idx - 1 + keys.length) % keys.length; else idx = (idx + 1) % keys.length;
                    window.selectedDungeonSpriteKey = keys[idx];
                }
            } else if (['rasset', 'sasset'].includes(editingTarget) && typeof window.SHOP_FURNITURE_DATA !== 'undefined') {
                let listKey = editingTarget === 'rasset' ? 'restaurant' : 'smith';
                let list = window.SHOP_FURNITURE_DATA[listKey];
                if (list && list.length > 0) {
                    if (isPrev) window.selectedFurnitureIndex = (window.selectedFurnitureIndex - 1 + list.length) % list.length;
                    else window.selectedFurnitureIndex = (window.selectedFurnitureIndex + 1) % list.length;
                }
            }
            render(); return; 
        }
        
        if (editingTarget === 'ai' && e.key === ' ') { isTestPlaying = !isTestPlaying; e.preventDefault(); }
        if (editingTarget === 'ai' && e.key.toLowerCase() === 'f') { editingFrameIndex = (editingFrameIndex + 1) % 3; render(); }

        if (e.key.toLowerCase() === 'v') { 
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) aiConfigs[selectedAIType].scale = Math.max(0.1, (aiConfigs[selectedAIType].scale||0.25) - 0.05);
            else if (editingTarget === 'map' && catalog[selectedMapKey]) catalog[selectedMapKey].scale = Math.max(0.1, (catalog[selectedMapKey].scale||1.0) - 0.05);
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleX = Math.max(0.1, (window.TCG_MASTER[selectedCardKey].scaleX||1.0) - 0.05);
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale = Math.max(0.1, (window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale||1.0) - 0.05); // ★修正
            else if (['rasset', 'sasset'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) t.scale = Math.max(0.1, (t.scale||1.0) - 0.05); }
        }
        if (e.key.toLowerCase() === 'b') { 
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) aiConfigs[selectedAIType].scale = (aiConfigs[selectedAIType].scale||0.25) + 0.05;
            else if (editingTarget === 'map' && catalog[selectedMapKey]) catalog[selectedMapKey].scale = (catalog[selectedMapKey].scale||1.0) + 0.05;
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleX = (window.TCG_MASTER[selectedCardKey].scaleX||1.0) + 0.05;
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale = (window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale||1.0) + 0.05; // ★修正
            else if (['rasset', 'sasset'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) t.scale = (t.scale||1.0) + 0.05; }
        }
        if (e.key.toLowerCase() === 'n') { if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleY = Math.max(0.1, (window.TCG_MASTER[selectedCardKey].scaleY||1.0) - 0.05); }
        if (e.key.toLowerCase() === 'm') { if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleY = (window.TCG_MASTER[selectedCardKey].scaleY||1.0) + 0.05; }
    }

    let target = null;
    if ((currentMode === 'editor' || currentMode === 'grazing_editor') && selectedAsset) target = selectedAsset; 
    else if (currentMode === 'ai_adjust') target = typeof window.getAdjustTarget === 'function' ? window.getAdjustTarget() : null;

    if (!target && (currentMode === 'editor' || currentMode === 'grazing_editor')) {
        const camStep = 20;
        if (e.key.toLowerCase() === 'w') camera.y -= camStep; if (e.key.toLowerCase() === 's') camera.y += camStep;
        if (e.key.toLowerCase() === 'a') camera.x -= camStep; if (e.key.toLowerCase() === 'd') camera.x += camStep;
        render(); return;
    }

    if (!target) { render(); return; }

    if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'c') {
            window.copiedFrameData = { sx: target.sx, sy: target.sy, sw: target.sw, sh: target.sh };
            console.log("Frame Copied:", window.copiedFrameData); e.preventDefault(); return;
        }
        if (e.key.toLowerCase() === 'v') {
            if (window.copiedFrameData) {
                target.sx = window.copiedFrameData.sx; target.sy = window.copiedFrameData.sy; target.sw = window.copiedFrameData.sw; target.sh = window.copiedFrameData.sh;
                console.log("Frame Pasted!"); saveGameData(); render();
            }
            e.preventDefault(); return;
        }
    }

    const step = e.shiftKey ? 10 : 1; const key = e.key.toLowerCase();
    
    if (key === 'w') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.dy -= step; else target.sy -= step; }
    if (key === 's') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.dy += step; else target.sy += step; }
    if (key === 'a') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.dx -= step; else target.sx -= step; }
    if (key === 'd') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.dx += step; else target.sx += step; }
    
    if (key === 'q') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.scale = Math.max(0.1, target.scale - 0.05); else target.sw -= step; }
    if (key === 'e') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.scale += 0.05; else target.sw += step; }
    if (key === 'z') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.scale = Math.max(0.1, target.scale - 0.05); else target.sh -= step; }
    if (key === 'c') { if(currentMode === 'editor' || currentMode === 'grazing_editor') target.scale += 0.05; else target.sh += step; }
    
    // ★追加：家具の配置位置（X/Y）の調整（矢印キー）
    if (['rasset', 'sasset'].includes(editingTarget)) {
        if (e.key === 'ArrowUp') { target.y -= step; e.preventDefault(); }
        if (e.key === 'ArrowDown') { target.y += step; e.preventDefault(); }
        if (e.key === 'ArrowLeft') { target.x -= step; e.preventDefault(); }
        if (e.key === 'ArrowRight') { target.x += step; e.preventDefault(); }
    }
    
    if (key === 'r' && (currentMode === 'editor' || currentMode === 'grazing_editor')) target.flip = !target.flip;
    if (key === 'delete' && (currentMode === 'editor' || currentMode === 'grazing_editor') && selectedAsset) { 
        for(let k in assets) { if (assets[k] === selectedAsset) { delete assets[k]; break; } } 
        selectedAsset = null; 
    }
    
    if (key === 'enter') { saveGameData(); console.log("Saved."); }
    
    render();
    
    // ★追加：家具の編集中に、開いている店舗UIがあれば即座に再描画して反映させる
    if (['rasset', 'sasset'].includes(editingTarget)) {
        let ui = document.getElementById('shop-management-ui');
        if (ui && ui.style.display !== 'none' && window.aiPet && window.aiPet.indoorTarget) {
            if (typeof window.openShopManagementUI === 'function') window.openShopManagementUI(window.aiPet.indoorTarget);
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (currentMode === 'editor' || currentMode === 'grazing_editor') {
        selectedAsset = null; let hitKey = null;
        for (let key in assets) {
            const a = assets[key]; const dw = a.sw * a.scale, dh = a.sh * a.scale;
            const checkX = mx + camera.x; const checkY = my + camera.y;
            if (checkX > a.dx && checkX < a.dx + dw && checkY > a.dy && checkY < a.dy + dh) hitKey = key;
        }
        if (hitKey) { selectedAsset = assets[hitKey]; isDragging = true; offsetX = (mx + camera.x) - selectedAsset.dx; offsetY = (my + camera.y) - selectedAsset.dy; }
    }
    render();
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedAsset && (currentMode === 'editor' || currentMode === 'grazing_editor')) {
        const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        selectedAsset.dx = (mx + camera.x) - offsetX; selectedAsset.dy = (my + camera.y) - offsetY; render();
    }
});

window.addEventListener('mouseup', () => { isDragging = false; if (currentMode === 'editor' || currentMode === 'grazing_editor') saveGameData(); });

window.onload = () => { 
    if(typeof applyTranslations === 'function') applyTranslations();
    const nav = document.getElementById('nav'); if (nav) nav.style.display = 'none'; 
    if (!window.isGamePaused) switchMode('play'); 
    if(typeof processOfflineProgression === 'function') processOfflineProgression(); 
    
    setInterval(() => { 
        if (typeof window.isGamePaused !== 'undefined' && window.isGamePaused) {
            const canvasEl = document.getElementById('gameCanvas');
            if (canvasEl) { const ctxEl = canvasEl.getContext('2d'); ctxEl.fillStyle = '#222'; ctxEl.fillRect(0, 0, canvasEl.width, canvasEl.height); }
            return;
        }
        if (currentMode === 'grazing') { if (typeof updateGrazingLoop === 'function') updateGrazingLoop(); } 
        else {
            if (typeof party !== 'undefined' && party.length > 0) {
                let activeBackup = window.aiPet; party.forEach(pet => { window.aiPet = pet; if (pet.update) pet.update(); }); window.aiPet = activeBackup; 
            } else if(typeof aiPet !== 'undefined' && aiPet.update) aiPet.update(); 
        }
        render(); 
        if (currentMode !== 'grazing' && typeof updateStatUI === 'function') updateStatUI(); 
    }, 50); 
    setInterval(saveGameData, 10000); 
};

if(document.readyState === 'complete') initAdjustUI(); else window.addEventListener('load', initAdjustUI);

// ==========================================
// ★ 【フェーズ1】店舗データの初期化 ＆ 古いデータの強制リセット
// ==========================================
setInterval(() => {
    if (typeof assets === 'undefined') return;
    for (let k in assets) {
        let a = assets[k];
        if (a.type === 'restaurant' || a.type === 'smith') {
            let isRest = a.type === 'restaurant';
            
            // ★修正：野イチゴだけでなく、鉄鉱石やただの石を商品にしている古い鍛冶屋データも強制リセットする！
            if (!a.shopData || (a.shopData.recipes && (a.shopData.recipes['item_berry'] || a.shopData.recipes['iron'] || a.shopData.recipes['stone']))) {
                a.shopData = {
                    recipes: isRest ? { 'dish_stirfry': { learned: true, learnedOrder: 1 } } : { 'item_sword_iron': { learned: true, learnedOrder: 1 } },
                    inventory: isRest ? { 'dish_stirfry': 5 } : { 'item_sword_iron': 3 },
                    prices: isRest ? { 'dish_stirfry': 50 } : { 'item_sword_iron': 100 },
                    reputation: 10, interiorLevel: 1, totalSales: 0,
                    isOpen: false,
                    logs: ["お店を新しく建てました！"]
                };
            }
        }
    }
}, 2000);

// ==========================================
// ★新規追加：別タブ（バックグラウンド）での進行処理
// ==========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // タブが隠れた時間を記録
        window.bgTimeStart = Date.now();
    } else {
        // タブに戻ってきた時の処理
        if (window.bgTimeStart && window.aiPet && typeof window.aiPet.update === 'function') {
            let elapsedMs = Date.now() - window.bgTimeStart;
            let missedFrames = Math.floor(elapsedMs / 16.666); // 60fps換算で失われたフレーム数を計算
            
            // 5秒以上（約300フレーム）離れていた場合のみ一気に処理を進める
            if (missedFrames > 300) {
                // 最大1時間分（216,000フレーム）まで許容して高速処理
                let catchUpFrames = Math.min(missedFrames, 216000);
                console.log(`[Background Sync] バックグラウンドで ${Math.floor(elapsedMs/1000)}秒 経過。${catchUpFrames}フレーム分を処理します。`);
                
                // ★重要：描画系の処理をスキップしてブラウザのフリーズを防ぐフラグ
                window.isCatchingUp = true; 
                for (let i = 0; i < catchUpFrames; i++) {
                    window.aiPet.update();
                }
                window.isCatchingUp = false; // フラグ解除
                
                // キャッチアップ完了後にUIを1回だけ一括更新
                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.updateStatusUI === 'function') window.updateStatusUI();
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                if (typeof window.addFloatingText === 'function') {
                    window.addFloatingText(window.aiPet.x, window.aiPet.y - 60, "⏰ 経過時間を処理しました！", "#FFC107");
                }
            }
            window.bgTimeStart = null;
        }
    }
});

// =========================================
// ★ 統合デバッグ用関数群
// =========================================

// 1. 選択制リセット
window.customResetGameData = function() {
    let resetMap = document.getElementById('chk-reset-map').checked;
    let resetAI = document.getElementById('chk-reset-ai').checked;
    let resetAIData = document.getElementById('chk-reset-ai-data').checked;
    let resetLegacy = document.getElementById('chk-reset-legacy').checked;
    let resetRescue = document.getElementById('chk-reset-rescue').checked;
    let resetGrazing = document.getElementById('chk-reset-grazing').checked;

    if (!confirm("選択したデータをリセットします。本当によろしいですか？")) return;

    if (resetMap) { localStorage.removeItem('map_data_v6'); }
    if (resetAI) {
        localStorage.removeItem('ai_configs_v8');
    }
    if (resetAIData) {
        localStorage.removeItem('ai_pet_data_v1');
    }
    if (resetLegacy) { localStorage.removeItem('ai_legacy_data'); }
    if (resetRescue) { 
        localStorage.removeItem('rescue_waiting_map'); 
        localStorage.removeItem('rescue_waiting_floor'); 
    }
    if (resetGrazing) { localStorage.removeItem('grazing_data_v1'); }

    localStorage.setItem('force_first_play', 'true');
    location.reload();
};

// 2. 弟子入りの強制変更（裏の職業の個別リセット・皆伝仕様 完全対応版）
window.forceApprenticeState = function() {
    let master = document.getElementById('dbg-master-sel').value;
    let rank = parseInt(document.getElementById('dbg-rank-input').value);
    
    if (!window.aiPet) return;
    if (!window.aiPet.apprentice) window.aiPet.apprentice = { currentMaster: null, rank: {}, retired: {}, learnedWords: [] };
    
    // ★現在就いている職業と、変更しようとしている職業が「同じ」かどうかを判定
    let isCurrentMaster = (window.aiPet.apprentice.currentMaster === master);

    // ▼ ランク0（未入門）が選ばれた場合の完全リセット処理
    if (rank === 0) {
        // 該当職業のランクと皆伝履歴（retired）だけをピンポイントで削除
        delete window.aiPet.apprentice.rank[master]; 
        if (window.aiPet.apprentice.retired) delete window.aiPet.apprentice.retired[master];
        
        // ★修正：今就いている職業をリセットした時「だけ」現在のクエスト進行を白紙にする！
        // （裏の職業をリセットした時はスルーされるので、今のクエストは守られます）
        if (isCurrentMaster) {
            window.aiPet.apprentice.currentMaster = null;
            window.aiPet.apprentice.activeQuest = null;
            window.aiPet.apprentice.isGraduated = false;
            window.aiPet.apprentice.qVal = 0;
        }
        
        window.aiPet.message = "デバッグの力で、記録を白紙に戻したよ！";
        
    } else {
        // ▼ ランク1以上の通常処理
        window.aiPet.apprentice.rank[master] = rank;
        
        if (rank >= 10) {
            // ランク10（免許皆伝）の処理
            if (!window.aiPet.apprentice.retired) window.aiPet.apprentice.retired = {};
            window.aiPet.apprentice.retired[master] = true;
            
            // もし今就いている職業を皆伝させたなら、卒業状態にする
            if (isCurrentMaster) {
                window.aiPet.apprentice.isGraduated = true;
                window.aiPet.apprentice.activeQuest = null;
                window.aiPet.apprentice.qVal = 0;
            }
            window.aiPet.message = "デバッグの力で免許皆伝した！";
        } else {
            // 修行中ランク（1〜9）への変更
            if (window.aiPet.apprentice.retired) delete window.aiPet.apprentice.retired[master];
            
            // 別の職業のランクをいじった場合は、強制的にその職業に転職させる
            window.aiPet.apprentice.currentMaster = master;
            window.aiPet.apprentice.isGraduated = false;
            window.aiPet.apprentice.qVal = 0;
            
            let qData = typeof window.aiPet.getMasterQuestData === 'function' ? window.aiPet.getMasterQuestData() : null;
            if (qData && qData[master] && qData[master][rank]) {
                window.aiPet.apprentice.activeQuest = qData[master][rank];
                if (typeof window.aiPet.apprentice.activeQuest.setup === 'function') {
                    window.aiPet.apprentice.activeQuest.setup(); 
                }
            } else {
                window.aiPet.apprentice.activeQuest = null;
            }
            window.aiPet.message = "デバッグの力でランクを変更した！";
        }
    }
    
    window.aiPet.messageTimer = 180;

    // UIとセーブデータの即時更新
    if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
    if (typeof window.updateStatUI === 'function') window.updateStatUI();
    if (typeof window.saveGameData === 'function') window.saveGameData();

    if (rank === 0) {
        alert(`【弟子入りリセット】\n現在のクエスト状態を維持したまま、${master} の履歴だけを「未入門」にリセットしました！`);
    } else {
        alert(`【弟子入り強制適用】\n師匠: ${master}\nランク: ${rank} に設定しました！`);
    }
};

// 3. 城の強制配置と襲撃トグル
window.forceBuildCastle = function() {
    let currentAssets = (typeof assets !== 'undefined') ? assets : window.assets;
    if (!currentAssets) return;
    
    // 既に城があるかチェック
    let hasCastle = Object.values(currentAssets).some(a => a.type === 'castle');
    if (hasCastle) {
        alert("すでに城が存在します！");
        return;
    }

    // マップ中央付近に無理やり配置
    let debugCastleId = "fac_debug_castle_" + Date.now();
    currentAssets[debugCastleId] = {
        id: debugCastleId, type: 'castle', hp: 5000, maxHp: 5000,
        gridX: 10, gridY: 10, visual: 'castle_build' // 座標や画像名は適宜調整
    };
    alert("城を座標(10, 10)に強制配置しました！");
};

window.toggleDefenseAttack = function() {
    if (typeof window.DEFENSE_STATE === 'undefined') window.DEFENSE_STATE = { noAttack: false };
    window.DEFENSE_STATE.noAttack = !window.DEFENSE_STATE.noAttack;
    
    let btn = document.getElementById('btn-toggle-attack');
    if (window.DEFENSE_STATE.noAttack) {
        btn.innerText = "🛡️ 襲撃イベント: OFF (安全)";
        btn.style.background = "#4CAF50"; // 緑にして安全をアピール
    } else {
        btn.innerText = "🛡️ 襲撃イベント: ON";
        btn.style.background = "#555";
    }
};

// 3-B. WAVE指定スタート / 防衛回数変更
window.debugStartArena = function() {
    let wave = parseInt(document.getElementById('dbg-arena-wave').value);
    // ※実際のWAVE開始関数（例: startArenaWave(wave)）に繋ぎ変えてください
    if (typeof window.startArena === 'function') {
        window.startArena(wave);
        alert(`アリーナ WAVE ${wave} からスタートします！`);
    } else {
        alert(`アリーナ開始関数が見つかりません。内部変数(arenaWave)等を直接書き換えます。`);
        window.currentArenaWave = wave; // 仮
    }
};

window.debugSetDefenseCount = function() {
    let count = parseInt(document.getElementById('dbg-defense-count').value);
    // ※実際の防衛回数管理変数に繋いでください
    if (window.aiPet) window.aiPet.defenseCount = count;
    alert(`防衛の襲撃回数を ${count} 回目に設定しました。`);
};

// 4. TCGカタログ (お友達向け)
window.showTCGCardCatalog = function() {
    // 汎用チュートリアル関数を利用してカタログを表示
    if (typeof window.showGameTutorial === 'function') {
        let msg = "<h3>【デバッグ】実装済みカード一覧</h3><div style='height:250px; overflow-y:scroll; text-align:left; font-size:12px;'>";
        
        // window.tcgCardData 等にカード定義があると仮定。適宜変数名を変更してください。
        let cardDataObj = (typeof window.tcgCards !== 'undefined') ? window.tcgCards : {}; 
        
        for (let key in cardDataObj) {
            let c = cardDataObj[key];
            msg += `<div style="margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:4px;">
                <strong style="color:#FFD700;">${c.name}</strong> (Cost:${c.cost})<br>
                効果: ${c.desc || '説明なし'}
            </div>`;
        }
        if (Object.keys(cardDataObj).length === 0) {
            msg += "カードデータが見つかりません。(変数 window.tcgCards などを確認してください)";
        }
        msg += "</div>";
        window.showGameTutorial("カードカタログ", msg, () => {});
    }
};

// =========================================
// ★ アリーナ・ダンジョン強制スタート機能
// =========================================
window.debugStartArena = function() {
    let wave = parseInt(document.getElementById('dbg-arena-wave').value) || 1;
    window.currentArenaWave = wave; // 変数にセットしておく
    
    // 城がない場合の警告
    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
    let hasCastle = Object.values(currentAssets).some(a => a && a.type === 'castle');
    if (!hasCastle) {
        if (!confirm("⚠️ 城が建っていません！\nエラーになる可能性がありますが、強制的にアリーナ受付を開きますか？")) return;
    }

    if (typeof window.openArenaReception === 'function') {
        window.openArenaReception();
        alert(`アリーナ受付を開きました。\nパーティを編成して「出陣する」を押すと、指定したWAVE ${wave} からスタートします！`);
    }
};

// ==========================================
// ★新規追加：印のチェックボックスUIを動的に生成・制限する機能
// ==========================================
window.updateDebugSeals = function(type) {
    let selectId = type === 'weapon' ? 'dbg-dungeon-weapon' : 'dbg-dungeon-shield';
    let containerId = type === 'weapon' ? 'dbg-weapon-seals-container' : 'dbg-shield-seals-container';
    let itemId = document.getElementById(selectId).value;
    let container = document.getElementById(containerId);
    
    if (!itemId) {
        container.innerHTML = '<span style="color:#888; font-size:10px;">(装備なし)</span>';
        return;
    }

    // 装備の「印の最大枠数」を取得
    let effect = (window.getDungeonItemEffect) ? window.getDungeonItemEffect(itemId) : { maxSeals: 3 };
    let maxSeals = effect.maxSeals || 0;
    
    // 武器用・盾用の印リスト
    const WEAPON_SEALS = ['heal', 'sleep', 'fire', 'exp', 'double', 'crit', 'holy', 'angry', 'first', 'curse'];
    const SHIELD_SEALS = ['life', 'counter_sleep', 'anti_dragon', 'dodge', 'parry', 'half_hunger', 'counter', 'max_hunger', 'light', 'regen', 'curse'];
    
    let availableSeals = type === 'weapon' ? WEAPON_SEALS : SHIELD_SEALS;
    
    let html = `<span style="color:#FFD700; font-size:10px; margin-right:5px; background:#444; padding:2px 4px; border-radius:3px;">空き枠:<span id="dbg-${type}-slots">${maxSeals}</span></span>`;
    
    availableSeals.forEach(s => {
        let sealData = window.SEAL_DESCRIPTIONS && window.SEAL_DESCRIPTIONS[s];
        if (sealData) {
            html += `<label style="font-size:11px; margin-right:3px; cursor:pointer; color:#ccc;" title="${sealData.desc}">
                        <input type="checkbox" class="dbg-seal-${type}" value="${s}" onchange="window.checkDebugSealLimit('${type}', ${maxSeals})">
                        [${sealData.name}]
                     </label>`;
        }
    });
    container.innerHTML = html;
};

// 印の数が上限に達したら、それ以上のチェックをロックする
window.checkDebugSealLimit = function(type, max) {
    let checkboxes = document.querySelectorAll(`.dbg-seal-${type}`);
    let checkedCount = 0;
    checkboxes.forEach(cb => { if(cb.checked) checkedCount++; });
    
    let slotsEl = document.getElementById(`dbg-${type}-slots`);
    if(slotsEl) slotsEl.innerText = Math.max(0, max - checkedCount);

    checkboxes.forEach(cb => {
        if (!cb.checked) {
            cb.disabled = (checkedCount >= max); // 上限到達時は未チェックのものを操作不可に
        }
    });
};

// ページ読み込み時にUIを初期化する（少し遅延させてSEAL_DESCRIPTIONSの読み込みを待つ）
setTimeout(() => {
    if (document.getElementById('dbg-dungeon-weapon')) window.updateDebugSeals('weapon');
    if (document.getElementById('dbg-dungeon-shield')) window.updateDebugSeals('shield');
}, 500);

// ==========================================
// ★修正：バグを排除し、チェックボックス対応にしたデバッグ開始関数
// ==========================================
window.debugStartDungeon = function() {
    let type = document.getElementById('dbg-dungeon-type').value;
    let floor = parseInt(document.getElementById('dbg-dungeon-floor').value) || 1;

    let dbgLevel = parseInt(document.getElementById('dbg-dungeon-level')?.value) || 1;
    let dbgPlus = parseInt(document.getElementById('dbg-dungeon-plus')?.value) || 0;
    
    let baseWeapon = document.getElementById('dbg-dungeon-weapon')?.value || '';
    let baseShield = document.getElementById('dbg-dungeon-shield')?.value || '';
    let dbgArmor = document.getElementById('dbg-dungeon-armor')?.value || '';
    let dbgAccessory = document.getElementById('dbg-dungeon-accessory')?.value || '';

    // ★チェックされた印を配列として取得する
    let wSeals = Array.from(document.querySelectorAll('.dbg-seal-weapon:checked')).map(cb => cb.value);
    let sSeals = Array.from(document.querySelectorAll('.dbg-seal-shield:checked')).map(cb => cb.value);

    // ★装備ID生成関数（配列を受け取るように修正）
    const buildEquipStr = (base, plus, sealsArray) => {
        if (!base) return '';
        let result = base;
        if (plus > 0) result += `_+${plus}`;
        if (sealsArray && sealsArray.length > 0) result += '_' + sealsArray.join('_');
        return result;
    };

    let finalWeapon = buildEquipStr(baseWeapon, dbgPlus, wSeals);
    let finalShield = buildEquipStr(baseShield, dbgPlus, sSeals);
    let finalArmor = buildEquipStr(dbgArmor, dbgPlus, []);

    if (typeof window.openDungeonUI === 'function') {
        window.openDungeonUI(type, floor);
        
        let s = window.DUNGEON_STATE;
        if (s) {
            if (dbgLevel > 1) {
                s.player.level = dbgLevel;
                s.player.maxHp = 100 + (dbgLevel * 20);
                s.player.hp = s.player.maxHp;
                s.player.basePwr = 10 + (dbgLevel * 5);
            }

            if (finalWeapon) s.player.equipWeapon = finalWeapon;
            if (finalShield) s.player.equipShield = finalShield;
            if (finalArmor)  s.player.equipArmor = finalArmor;
            if (dbgAccessory) s.player.equipAccessory = dbgAccessory;

            // ★修正：条件分岐のバグを排除し、必ず4スロットをチェックする
            for (let i = 1; i <= 4; i++) {
                let itemSelect = document.getElementById(`dbg-item-${i}`);
                let itemPlus = parseInt(document.getElementById(`dbg-item-${i}-plus`)?.value) || 0;
                let isIdentified = document.getElementById(`dbg-item-${i}-id`)?.checked;

                if (itemSelect && itemSelect.value) {
                    let baseId = itemSelect.value;
                    let finalId = baseId;
                    
                    if (baseId.includes('wand') && itemPlus > 0) {
                        finalId += `_+${itemPlus}`;
                    }
                    
                    s.player.tempInventory.push(finalId);
                    
                    if (isIdentified) {
                        if (!s.aiMemory.identified.includes(baseId)) s.aiMemory.identified.push(baseId);
                    } else {
                        s.aiMemory.identified = s.aiMemory.identified.filter(id => id !== baseId);
                    }
                }
            }

            window.updateDungeonUI();

            setTimeout(() => { 
                window.addDungeonLog(`🔧 [DEBUG] 装備(${dbgPlus > 0 ? '+'+dbgPlus : '強化なし'}) と アイテムを強制付与しました。`, '#E040FB'); 
            }, 1000);
        }
        
        alert(`${type === 'crystal' ? 'クリスタル迷宮' : 'スカルダンジョン'} の ${floor}F に突入しました！`);
    }
};

// ==========================================
// 🖥️ PCゲーム向け：画面自動ズーム処理 (Electron専用)
// ==========================================
window.autoZoomGame = function() {
    const container = document.getElementById('game-container');
    if (!container) return;

    // Electronのズーム機能はリセット（1.0倍に固定）
    if (typeof require !== 'undefined') {
        const { webFrame } = require('electron');
        webFrame.setZoomFactor(1.0);
    }
    
    const BASE_WIDTH = 1280;  
    const BASE_HEIGHT = 720;  

    // ウィンドウサイズに合わせて倍率を計算
    const scale = Math.min(
        window.innerWidth / BASE_WIDTH,
        window.innerHeight / BASE_HEIGHT
    );

    // CSSのtransformで画面をぴったりフィットさせる
    container.style.transform = `scale(${scale})`;
    container.style.left = `${(window.innerWidth - BASE_WIDTH) / 2}px`;
    container.style.top = `${(window.innerHeight - BASE_HEIGHT) / 2}px`;
};

// ウィンドウサイズが変更されたら再計算
window.addEventListener('resize', window.autoZoomGame);
// 起動直後に1回実行
setTimeout(window.autoZoomGame, 100);