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

    // ★修正：起動時はタイトルではなく、まず「ロゴ画面」にする
    switchMode('logo'); 
    
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) { canvasWrapper.style.opacity = '1'; canvasWrapper.style.pointerEvents = 'auto'; }

    requestAnimationFrame(render);
}

window.startActualGame = function(isNewGameMenuClicked) {
    // ★追加：ゲーム本編に入ったらタイトルBGMを止める
    if (window.audioManager && window.audioManager.stopTitleMusic) {
        window.audioManager.stopTitleMusic();
    }

    if (isNewGameMenuClicked) {
        localStorage.setItem('force_first_play', 'true');
    }

    // ==========================================
    // ★新規追加：闘技場（城など）の強制リセット処理をここで確実に行う！
    // ==========================================
    if (typeof window.exitArenaFacility === 'function') {
        window.exitArenaFacility();
    }
    if (window.ARENA_STATE) window.ARENA_STATE.active = false;
    let arenaUi = document.getElementById('arena-reception-ui');
    let battleUi = document.getElementById('arena-battle-ui');
    let intUi = document.getElementById('arena-interval-ui');
    if (arenaUi) arenaUi.style.display = 'none';
    if (battleUi) battleUi.style.display = 'none';
    if (intUi) intUi.style.display = 'none';
    window.isInArena = false; // 念のためのフラグ解除

    // ==========================================
    // ★大元凶の解決：ダンジョン・パーティデータの残留による「アップデート権の強奪」を防止！
    // ==========================================
    if (typeof party !== 'undefined') window.party = [];

    // ==========================================
    // 1. 本物の保護 ＆ 偽物の完全消去
    // ==========================================
    if (typeof assets !== 'undefined') {
        const petTypes = ['robot', 'spirit', 'magician', 'stone', 'balloon', 'bird', 'beetle', 'seed', 'ghost', 'machine', 'dragon'];
        for (let k in assets) {
            // 本物のAIペットは絶対に消さない（シールド）
            if (window.aiPet && k === window.aiPet.id) continue;
            
            let t = assets[k].type || '';
            if (petTypes.includes(t) || k.includes('dummy') || k.includes('insurance') || k.includes('robot') || t.includes('insurance') || t.includes('dummy')) {
                delete assets[k];
            }
        }
        // エンジン（メインループ）に本物を確実に接続
        if (window.aiPet && window.aiPet.id) {
            assets[window.aiPet.id] = window.aiPet;
        }
    }

    // ==========================================
    // 2. 画像のロード ＆ 脳の強制再起動
    // ==========================================
    if (window.aiPet) {
        let trueSkin = null;

        try {
            let saveData = localStorage.getItem('ai_pet_data_v1') || localStorage.getItem('ai_pet_data');
            if (saveData) {
                let parsed = JSON.parse(saveData);
                trueSkin = parsed.currentSkin || parsed.type || parsed.baseType;
            }
        } catch(e) {}
        
        trueSkin = trueSkin || window.aiPet.currentSkin || window.aiPet.type || 'robot';

        window.aiPet.currentSkin = trueSkin;
        window.aiPet.type = trueSkin;

        window.aiPet.actionState = 'idle';
        window.aiPet.visualAction = 'idle';
        window.aiPet.isIndoors = false; // ★追加：建物内フラグを強制解除
        window.aiPet.indoorTarget = null; // ★追加：ターゲット解除
        window.aiPet.schedule = []; 
        window.aiPet.pathQueue = []; // 念のため移動経路も完全に消去
        window.aiPet.frameIndex = 0;
        
        if (!window.aiPet.sw) window.aiPet.sw = 50;
        if (!window.aiPet.sh) window.aiPet.sh = 50;
        if (!window.images) window.images = {};

        let baseImg = trueSkin;
        if (typeof aiConfigs !== 'undefined' && aiConfigs[trueSkin] && aiConfigs[trueSkin].img) {
            baseImg = aiConfigs[trueSkin].img;
        }
        if (!window.images[baseImg]) {
            window.images[baseImg] = new Image();
            let srcPath = (window.dynamicImageCatalog && window.dynamicImageCatalog[baseImg]) 
                        ? window.dynamicImageCatalog[baseImg] : baseImg + '.png';
            window.images[baseImg].src = srcPath;
        }

        if (typeof aiConfigs !== 'undefined' && aiConfigs[trueSkin] && aiConfigs[trueSkin].actionImages) {
            for (let actKey in aiConfigs[trueSkin].actionImages) {
                let actImgName = aiConfigs[trueSkin].actionImages[actKey];
                if (!window.images[actImgName]) {
                    window.images[actImgName] = new Image();
                    let srcPath = (window.dynamicImageCatalog && window.dynamicImageCatalog[actImgName]) 
                                ? window.dynamicImageCatalog[actImgName] : actImgName + '.png';
                    window.images[actImgName].src = srcPath;
                }
            }
        }
        
        if (typeof camera !== 'undefined') camera.target = window.aiPet;
    }

    window.isGamePaused = false;

    // ==========================================
    // 3. フェードイン等のUI制御
    // ==========================================
    const forceFirstPlay = localStorage.getItem('force_first_play');
    const triggerFadeIn = localStorage.getItem('trigger_fade_in'); 
    const isNewGame = (forceFirstPlay === 'true' || (typeof isFirstPlay !== 'undefined' && isFirstPlay));

    const els = ['canvas-wrapper', 'aiStatus', 'info-column', 'gameControls'];

    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
    });

    if (isNewGame) {
        switchMode('play'); 
        localStorage.removeItem('force_first_play'); 
        if (typeof startPersonalityTest === 'function') startPersonalityTest(); 
    } else if (triggerFadeIn === 'true') {
        localStorage.removeItem('trigger_fade_in'); 
        switchMode('play');
        setTimeout(() => {
            els.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.transition = 'opacity 2.5s ease-in-out';
                    setTimeout(() => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }, 50); 
                }
            });
            setTimeout(() => { if (typeof checkLoginBonus === 'function') checkLoginBonus(); }, 2500);
        }, 100);
    } else {
        switchMode('play'); 
        setTimeout(() => {
            els.forEach((id) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.transition = 'opacity 1.5s ease-in-out';
                    setTimeout(() => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }, 50); 
                }
            });
            setTimeout(() => { if (typeof checkLoginBonus === 'function') checkLoginBonus(); }, 1500);
        }, 100);
    }

    if (typeof window.updateTcgButtonAppearance === 'function') window.updateTcgButtonAppearance();
};

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

    } else if (mode === 'title') {
        // ★追加：タイトル画面ではゲームUIを全て隠す
        if(gameControls) gameControls.style.display = 'none'; 
        if(help) help.style.display = 'none';
        const sidePanel = document.getElementById('side-panel'); if(sidePanel) { sidePanel.classList.remove('active'); sidePanel.style.display = 'none'; }
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
// ★タイトル画面調整用データ
window.selectedTitleCharKey = 'robot';
window.bgTitleImg = new Image(); window.bgTitleImg.src = 'bg_game_title.png';
window.TITLE_SCREEN_DATA = {
    "robot": {
        "img": "title_robot.png",
        "x": 172,
        "y": 407,
        "sx": 963,
        "sy": 74,
        "sw": 839,
        "sh": 1319,
        "scale": 0.05000000000000001,
        "imgObj": {},
        "isHidden": false
    },
    "robot_type1": {
        "img": "title_robot_type1.png",
        "x": 149,
        "y": 385,
        "sx": 490,
        "sy": -24,
        "sw": 441,
        "sh": 811,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "robot_type1_2": {
        "img": "title_robot_type1_2.png",
        "x": 128,
        "y": 360,
        "sx": 410,
        "sy": -24,
        "sw": 565,
        "sh": 792,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -2
    },
    "robot_type1_3": {
        "img": "title_robot_type1_3.png",
        "x": 173,
        "y": 340,
        "sx": 869,
        "sy": 74,
        "sw": 1001,
        "sh": 1397,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -2
    },
    "robot_type2": {
        "img": "title_robot_type2.png",
        "x": 152,
        "y": 298,
        "sx": 29,
        "sy": -12,
        "sw": 1746,
        "sh": 2403,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "z": -3
    },
    "robot_type2_2": {
        "img": "title_robot_type2_2.png",
        "x": 201,
        "y": 289,
        "sx": 963,
        "sy": 65,
        "sw": 847,
        "sh": 1392,
        "scale": 0.060000000000000005,
        "imgObj": {},
        "isHidden": false,
        "z": -3
    },
    "robot_type2_3": {
        "img": "title_robot_type2_3.png",
        "x": 230,
        "y": 109,
        "sx": 474,
        "sy": 54,
        "sw": 448,
        "sh": 700,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 20
    },
    "robot_type2_4": {
        "img": "title_robot_type2_4.png",
        "x": 384,
        "y": 51,
        "sx": 586,
        "sy": 23,
        "sw": 1544,
        "sh": 1319,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "rotation": -10
    },
    "robot_type3": {
        "img": "title_robot_type3.png",
        "x": 196,
        "y": 314,
        "sx": 446,
        "sy": 16,
        "sw": 519,
        "sh": 727,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -3
    },
    "robot_type3_2": {
        "img": "title_robot_type3_2.png",
        "x": 203,
        "y": 361,
        "sx": 402,
        "sy": 34,
        "sw": 630,
        "sh": 711,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "robot_type3_3": {
        "img": "title_robot_type3_3.png",
        "x": 72,
        "y": 138,
        "sx": 340,
        "sy": 9,
        "sw": 750,
        "sh": 716,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "rotation": 5
    },
    "robot_type3_4": {
        "img": "title_robot_type3_4.png",
        "x": 101,
        "y": 330,
        "sx": 485,
        "sy": 14,
        "sw": 450,
        "sh": 738,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -3
    },
    "robot_type3_5": {
        "img": "title_robot_type3_5.png",
        "x": 170,
        "y": 143,
        "sx": 310,
        "sy": 16,
        "sw": 814,
        "sh": 786,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "robot_type4": {
        "img": "title_robot_type4.png",
        "x": 241,
        "y": 337,
        "sx": 946,
        "sy": 18,
        "sw": 829,
        "sh": 1489,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "robot_type4_2": {
        "img": "title_robot_type4_2.png",
        "x": 259,
        "y": 307,
        "sx": 339,
        "sy": 34,
        "sw": 802,
        "sh": 700,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "robot_type4_3": {
        "img": "title_robot_type4_3.png",
        "x": 573,
        "y": 89,
        "sx": 351,
        "sy": 22,
        "sw": 680,
        "sh": 760,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10,
        "flip": true
    },
    "robot_type4_4": {
        "img": "title_robot_type4_4.png",
        "x": 264,
        "y": 274,
        "sx": 725,
        "sy": 33,
        "sw": 1289,
        "sh": 1491,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "z": -2
    },
    "robot_type5": {
        "img": "title_robot_type5.png",
        "x": 287,
        "y": 334,
        "sx": 104,
        "sy": 44,
        "sw": 684,
        "sh": 1171,
        "scale": 0.06000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 0
    },
    "robot_type5_2": {
        "img": "title_robot_type5_2.png",
        "x": 271,
        "y": 355,
        "sx": 500,
        "sy": 74,
        "sw": 441,
        "sh": 673,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "robot_type5_3": {
        "img": "title_robot_type5_3.png",
        "x": 241,
        "y": 369,
        "sx": 418,
        "sy": 16,
        "sw": 571,
        "sh": 770,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "robot_type5_4": {
        "img": "title_robot_type5_4.png",
        "x": 104,
        "y": 369,
        "sx": 963,
        "sy": 47,
        "sw": 839,
        "sh": 1398,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "spirit": {
        "img": "title_spirit.png",
        "x": 327,
        "y": 256,
        "sx": 963,
        "sy": 74,
        "sw": 839,
        "sh": 1319,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type1": {
        "img": "title_spirit_type1.png",
        "x": 438,
        "y": 265,
        "sx": 310,
        "sy": 397,
        "sw": 319,
        "sh": 413,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type1_2": {
        "img": "title_spirit_type1_2.png",
        "x": 346,
        "y": 267,
        "sx": 395,
        "sy": 8,
        "sw": 615,
        "sh": 702,
        "scale": 0.060000000000000005,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type2": {
        "img": "title_spirit_type2.png",
        "x": 312,
        "y": 272,
        "sx": 450,
        "sy": 29,
        "sw": 531,
        "sh": 764,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type2_2": {
        "img": "title_spirit_type2_2.png",
        "x": 328,
        "y": 288,
        "sx": 328,
        "sy": 34,
        "sw": 745,
        "sh": 764,
        "scale": 0.0600000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type2_3": {
        "img": "title_spirit_type2_3.png",
        "x": 314,
        "y": 299,
        "sx": 377,
        "sy": -12,
        "sw": 690,
        "sh": 773,
        "scale": 0.060000000000000026,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type3": {
        "img": "title_spirit_type3.png",
        "x": 348,
        "y": 322,
        "sx": 854,
        "sy": 74,
        "sw": 977,
        "sh": 1432,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type3_2": {
        "img": "title_spirit_type3_2.png",
        "x": 364,
        "y": 292,
        "sx": 321,
        "sy": 37,
        "sw": 794,
        "sh": 749,
        "scale": 0.06000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type4": {
        "img": "title_spirit_type4.png",
        "x": 377,
        "y": 306,
        "sx": 868,
        "sy": 125,
        "sw": 1036,
        "sh": 1319,
        "scale": 0.02499999999999998,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type4_2": {
        "img": "title_spirit_type4_2.png",
        "x": 311,
        "y": 254,
        "sx": 361,
        "sy": 23,
        "sw": 745,
        "sh": 753,
        "scale": 0.07,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "spirit_type4_3": {
        "img": "title_spirit_type4_3.png",
        "x": 382,
        "y": 253,
        "sx": 93,
        "sy": 20,
        "sw": 839,
        "sh": 940,
        "scale": 0.06000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "z": -1
    },
    "spirit_type5": {
        "img": "title_spirit_type5.png",
        "x": 406,
        "y": 290,
        "sx": 808,
        "sy": 74,
        "sw": 1091,
        "sh": 1359,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false
    },
    "spirit_type5_2": {
        "img": "title_spirit_type5_2.png",
        "x": 394,
        "y": 283,
        "sx": 435,
        "sy": 52,
        "sw": 649,
        "sh": 722,
        "scale": 0.060000000000000026,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "spirit_type5_3": {
        "img": "title_spirit_type5_3.png",
        "x": 319,
        "y": 313,
        "sx": 442,
        "sy": 31,
        "sw": 576,
        "sh": 681,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician": {
        "img": "title_magician.png",
        "x": 462,
        "y": 271,
        "sx": 772,
        "sy": 74,
        "sw": 1212,
        "sh": 1399,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type1": {
        "img": "title_magician_type1.png",
        "x": 484,
        "y": 278,
        "sx": 453,
        "sy": 60,
        "sw": 525,
        "sh": 655,
        "scale": 0.0700000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type1_2": {
        "img": "title_magician_type1_2.png",
        "x": 481,
        "y": 62,
        "sx": 411,
        "sy": 20,
        "sw": 566,
        "sh": 712,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "magician_type1_3": {
        "img": "title_magician_type1_3.png",
        "x": 498,
        "y": 293,
        "sx": 370,
        "sy": 30,
        "sw": 614,
        "sh": 743,
        "scale": 0.06000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type1_4": {
        "img": "title_magician_type1_4.png",
        "x": 330,
        "y": 140,
        "sx": 772,
        "sy": 74,
        "sw": 1400,
        "sh": 1399,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "rotation": -15
    },
    "magician_type2": {
        "img": "title_magician_type2.png",
        "x": 495,
        "y": 259,
        "sx": 411,
        "sy": -5,
        "sw": 588,
        "sh": 748,
        "scale": 0.07000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "magician_type2_2": {
        "img": "title_magician_type2_2.png",
        "x": 446,
        "y": 293,
        "sx": 703,
        "sy": 104,
        "sw": 1275,
        "sh": 1399,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "magician_type2_3": {
        "img": "title_magician_type2_3.png",
        "x": 473,
        "y": 310,
        "sx": 52,
        "sy": -31,
        "sw": 1013,
        "sh": 1102,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type2_4": {
        "img": "title_magician_type2_4.png",
        "x": 537,
        "y": 271,
        "sx": 772,
        "sy": 43,
        "sw": 1212,
        "sh": 1496,
        "scale": 0.04000000000000001,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "magician_type3": {
        "img": "title_magician_type3.png",
        "x": 533,
        "y": 292,
        "sx": 439,
        "sy": 31,
        "sw": 567,
        "sh": 678,
        "scale": 0.07000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type3_2": {
        "img": "title_magician_type3_2.png",
        "x": 565,
        "y": 257,
        "sx": 772,
        "sy": 74,
        "sw": 1250,
        "sh": 1400,
        "scale": 0.04000000000000001,
        "imgObj": {},
        "isHidden": false,
        "z": -1
    },
    "magician_type3_3": {
        "img": "title_magician_type3_3.png",
        "x": 625,
        "y": 245,
        "sx": 419,
        "sy": 10,
        "sw": 589,
        "sh": 715,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type4": {
        "img": "title_magician_type4.png",
        "x": 506,
        "y": 325,
        "sx": 421,
        "sy": 35,
        "sw": 614,
        "sh": 821,
        "scale": 0.07000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type4_2": {
        "img": "title_magician_type4_2.png",
        "x": 427,
        "y": 315,
        "sx": 637,
        "sy": 74,
        "sw": 1540,
        "sh": 1403,
        "scale": 0.04000000000000001,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type4_3": {
        "img": "title_magician_type4_3.png",
        "x": 581,
        "y": 278,
        "sx": 263,
        "sy": 29,
        "sw": 843,
        "sh": 716,
        "scale": 0.07000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type4_4": {
        "img": "title_magician_type4_4.png",
        "x": 454,
        "y": 329,
        "sx": 129,
        "sy": -8,
        "sw": 803,
        "sh": 931,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type5": {
        "img": "title_magician_type5.png",
        "x": 559,
        "y": 291,
        "sx": 772,
        "sy": 74,
        "sw": 1212,
        "sh": 1399,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false
    },
    "magician_type5_2": {
        "img": "title_magician_type5_2.png",
        "x": 517,
        "y": 254,
        "sx": 43,
        "sy": -18,
        "sw": 1047,
        "sh": 1037,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "z": -2
    },
    "magician_type5_3": {
        "img": "title_magician_type5_3.png",
        "x": 469,
        "y": 249,
        "sx": 259,
        "sy": 127,
        "sw": 1232,
        "sh": 1995,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false,
        "z": -2
    },
    "stone": {
        "img": "title_stone.png",
        "x": 603,
        "y": 420,
        "sx": 791,
        "sy": 74,
        "sw": 1212,
        "sh": 1399,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "stone_type1": {
        "img": "title_stone_type1.png",
        "x": 626,
        "y": 397,
        "sx": 285,
        "sy": -21,
        "sw": 828,
        "sh": 830,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": false,
        "z": -1
    },
    "stone_type1_2": {
        "img": "title_stone_type1_2.png",
        "x": 664,
        "y": 371,
        "sx": 368,
        "sy": 20,
        "sw": 670,
        "sh": 732,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -2,
        "flip": true
    },
    "stone_type2": {
        "img": "title_stone_type2.png",
        "x": 589,
        "y": 388,
        "sx": 366,
        "sy": 7,
        "sw": 721,
        "sh": 789,
        "scale": 0.1,
        "imgObj": {},
        "isHidden": false,
        "z": -2,
        "flip": true
    },
    "stone_type2_2": {
        "img": "title_stone_type2_2.png",
        "x": 632,
        "y": 361,
        "sx": 366,
        "sy": -8,
        "sw": 699,
        "sh": 807,
        "scale": 0.1,
        "imgObj": {},
        "isHidden": false,
        "flip": false,
        "z": -3
    },
    "stone_type3": {
        "img": "title_stone_type3.png",
        "x": 563,
        "y": 375,
        "sx": 791,
        "sy": 74,
        "sw": 1212,
        "sh": 1399,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 0,
        "z": -3,
        "flip": true
    },
    "stone_type3_2": {
        "img": "title_stone_type3_2.png",
        "x": 692,
        "y": 350,
        "sx": 368,
        "sy": 42,
        "sw": 664,
        "sh": 733,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -3,
        "flip": true
    },
    "stone_type4": {
        "img": "title_stone_type4.png",
        "x": 540,
        "y": 357,
        "sx": -67,
        "sy": -9,
        "sw": 1065,
        "sh": 1228,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "z": -4,
        "flip": true
    },
    "stone_type4_2": {
        "img": "title_stone_type4_2.png",
        "x": 585,
        "y": 354,
        "sx": 765,
        "sy": 74,
        "sw": 1212,
        "sh": 1399,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "z": -4
    },
    "stone_type4_3": {
        "img": "title_stone_type4_3.png",
        "x": 663,
        "y": 339,
        "sx": 399,
        "sy": -13,
        "sw": 655,
        "sh": 773,
        "scale": 0.11000000000000003,
        "imgObj": {},
        "isHidden": false,
        "z": -5
    },
    "stone_type5": {
        "img": "title_stone_type5.png",
        "x": 613,
        "y": 338,
        "sx": 34,
        "sy": 36,
        "sw": 995,
        "sh": 1108,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": false,
        "z": -5
    },
    "stone_type5_2": {
        "img": "title_stone_type5_2.png",
        "x": 716,
        "y": 332,
        "sx": 349,
        "sy": -21,
        "sw": 742,
        "sh": 838,
        "scale": 0.1,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "z": -4
    },
    "stone_type5_3": {
        "img": "title_stone_type5_3.png",
        "x": 685,
        "y": 322,
        "sx": 10,
        "sy": -69,
        "sw": 1026,
        "sh": 1233,
        "scale": 0.08,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "z": -6
    },
    "balloon": {
        "img": "title_balloon.png",
        "x": 309,
        "y": 364,
        "sx": 344,
        "sy": 14,
        "sw": 796,
        "sh": 760,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false
    },
    "balloon_type1": {
        "img": "title_balloon_type1.png",
        "x": 400,
        "y": 111,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "balloon_type1_2": {
        "img": "title_balloon_type1_2.png",
        "x": 345,
        "y": 351,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.07,
        "imgObj": {},
        "isHidden": false
    },
    "balloon_type1_3": {
        "img": "title_balloon_type1_3.png",
        "x": 432,
        "y": 142,
        "sx": 202,
        "sy": 4,
        "sw": 924,
        "sh": 760,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "rotation": -10
    },
    "balloon_type2": {
        "img": "title_balloon_type2.png",
        "x": 339,
        "y": 76,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false
    },
    "balloon_type2_2": {
        "img": "title_balloon_type2_2.png",
        "x": 394,
        "y": 382,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05,
        "imgObj": {},
        "isHidden": false
    },
    "balloon_type2_3": {
        "img": "title_balloon_type2_3.png",
        "x": 205,
        "y": 200,
        "sx": 424,
        "sy": 4,
        "sw": 1842,
        "sh": 1345,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "balloon_type3": {
        "img": "title_balloon_type3.png",
        "x": 69,
        "y": 195,
        "sx": 259,
        "sy": 4,
        "sw": 829,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "balloon_type3_2": {
        "img": "title_balloon_type3_2.png",
        "x": 484,
        "y": 338,
        "sx": 830,
        "sy": 25,
        "sw": 1224,
        "sh": 1394,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "balloon_type3_3": {
        "img": "title_balloon_type3_3.png",
        "x": 502,
        "y": 359,
        "sx": 322,
        "sy": 131,
        "sw": 1762,
        "sh": 1720,
        "scale": 0.03,
        "imgObj": {},
        "isHidden": false,
        "z": 0,
        "flip": true
    },
    "balloon_type4": {
        "img": "title_balloon_type4.png",
        "x": 622,
        "y": 133,
        "sx": 86,
        "sy": 4,
        "sw": 1147,
        "sh": 761,
        "scale": 0.07000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "balloon_type4_2": {
        "img": "title_balloon_type4_2.png",
        "x": 674,
        "y": 106,
        "sx": 278,
        "sy": 3,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "rotation": -10
    },
    "balloon_type4_3": {
        "img": "title_balloon_type4_3.png",
        "x": 718,
        "y": 290,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 0,
        "flip": true,
        "z": -5
    },
    "balloon_type5": {
        "img": "title_balloon_type5.png",
        "x": 519,
        "y": 379,
        "sx": 344,
        "sy": 4,
        "sw": 644,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "balloon_type5_2": {
        "img": "title_balloon_type5_2.png",
        "x": 669,
        "y": 249,
        "sx": 344,
        "sy": 4,
        "sw": 797,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "bird": {
        "img": "title_bird.png",
        "x": 450,
        "y": 464,
        "sx": 344,
        "sy": 14,
        "sw": 796,
        "sh": 760,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "bird_type1": {
        "img": "title_bird_type1.png",
        "x": 466,
        "y": 118,
        "sx": 298,
        "sy": 4,
        "sw": 805,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false,
        "rotation": -5
    },
    "bird_type1_2": {
        "img": "title_bird_type1_2.png",
        "x": 730,
        "y": 226,
        "sx": 58,
        "sy": 27,
        "sw": 877,
        "sh": 891,
        "scale": 0.06000000000000001,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "bird_type2": {
        "img": "title_bird_type2.png",
        "x": 287,
        "y": 459,
        "sx": 599,
        "sy": 68,
        "sw": 1439,
        "sh": 1435,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false
    },
    "bird_type2_2": {
        "img": "title_bird_type2_2.png",
        "x": 633,
        "y": 53,
        "sx": 73,
        "sy": 4,
        "sw": 1205,
        "sh": 761,
        "scale": 0.06000000000000001,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false,
        "rotation": -10
    },
    "bird_type3": {
        "img": "title_bird_type3.png",
        "x": 510,
        "y": 148,
        "sx": 235,
        "sy": 4,
        "sw": 850,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false,
        "rotation": 10
    },
    "bird_type3_2": {
        "img": "title_bird_type3_2.png",
        "x": 404,
        "y": 462,
        "sx": 344,
        "sy": 5,
        "sw": 1413,
        "sh": 1951,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false
    },
    "bird_type3_3": {
        "img": "title_bird_type3_3.png",
        "x": 621,
        "y": 273,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false
    },
    "bird_type4": {
        "img": "title_bird_type4.png",
        "x": 389,
        "y": 182,
        "sx": 270,
        "sy": 4,
        "sw": 848,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "bird_type4_2": {
        "img": "title_bird_type4_2.png",
        "x": 279,
        "y": 73,
        "sx": 264,
        "sy": 4,
        "sw": 995,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false,
        "rotation": -15
    },
    "bird_type5": {
        "img": "title_bird_type5.png",
        "x": 122,
        "y": 306,
        "sx": 64,
        "sy": 42,
        "sw": 2002,
        "sh": 1893,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": true,
        "z": -4,
        "isHidden": false
    },
    "bird_type5_2": {
        "img": "title_bird_type5_2.png",
        "x": 221,
        "y": 267,
        "sx": 210,
        "sy": 4,
        "sw": 1125,
        "sh": 771,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -4,
        "isHidden": false
    },
    "beetle": {
        "img": "title_beetle.png",
        "x": 529,
        "y": 329,
        "sx": 344,
        "sy": 14,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -5,
        "isHidden": false
    },
    "beetle_type1": {
        "img": "title_beetle_type1.png",
        "x": 548,
        "y": 325,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -6,
        "isHidden": false
    },
    "beetle_type2": {
        "img": "title_beetle_type2.png",
        "x": 570,
        "y": 320,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -5,
        "isHidden": false
    },
    "beetle_type2_2": {
        "img": "title_beetle_type2_2.png",
        "x": 585,
        "y": 316,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -6,
        "isHidden": false
    },
    "beetle_type2_3": {
        "img": "title_beetle_type2_3.png",
        "x": 539,
        "y": 447,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false
    },
    "beetle_type2_4": {
        "img": "title_beetle_type2_4.png",
        "x": 598,
        "y": 452,
        "sx": 231,
        "sy": 4,
        "sw": 853,
        "sh": 762,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "beetle_type3": {
        "img": "title_beetle_type3.png",
        "x": 565,
        "y": 155,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": false,
        "z": 1,
        "isHidden": false,
        "rotation": 10
    },
    "beetle_type4": {
        "img": "title_beetle_type4.png",
        "x": 461,
        "y": 399,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "beetle_type4_2": {
        "img": "title_beetle_type4_2.png",
        "x": 404,
        "y": 247,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -2,
        "isHidden": false
    },
    "beetle_type5": {
        "img": "title_beetle_type5.png",
        "x": 606,
        "y": 315,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 760,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "z": -7,
        "isHidden": false
    },
    "beetle_type5_2": {
        "img": "title_beetle_type5_2.png",
        "x": 426,
        "y": 248,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": false,
        "z": -3,
        "isHidden": false
    },
    "seed": {
        "img": "title_seed.png",
        "x": 351,
        "y": 427,
        "sx": 344,
        "sy": 14,
        "sw": 796,
        "sh": 762,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type1": {
        "img": "title_seed_type1.png",
        "x": 311,
        "y": 401,
        "sx": 827,
        "sy": 25,
        "sw": 1214,
        "sh": 1472,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type1_2": {
        "img": "title_seed_type1_2.png",
        "x": 423,
        "y": 410,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 762,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type2": {
        "img": "title_seed_type2.png",
        "x": 365,
        "y": 389,
        "sx": 47,
        "sy": 4,
        "sw": 796,
        "sh": 1240,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type2_2": {
        "img": "title_seed_type2_2.png",
        "x": 421,
        "y": 360,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type3": {
        "img": "title_seed_type3.png",
        "x": 365,
        "y": 459,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "seed_type3_2": {
        "img": "title_seed_type3_2.png",
        "x": 379,
        "y": 415,
        "sx": 64,
        "sy": 4,
        "sw": 813,
        "sh": 1164,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "seed_type3_3": {
        "img": "title_seed_type3_3.png",
        "x": 391,
        "y": 346,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "flip": true
    },
    "seed_type4": {
        "img": "title_seed_type4.png",
        "x": 225,
        "y": 441,
        "sx": 895,
        "sy": 4,
        "sw": 1002,
        "sh": 1390,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "flip": false
    },
    "seed_type4_2": {
        "img": "title_seed_type4_2.png",
        "x": 508,
        "y": 430,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type5": {
        "img": "title_seed_type5.png",
        "x": 214,
        "y": 457,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "seed_type5_2": {
        "img": "title_seed_type5_2.png",
        "x": 215,
        "y": 360,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.15000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "ghost": {
        "img": "title_ghost.png",
        "x": 258,
        "y": 167,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 762,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": -15
    },
    "ghost_type1": {
        "img": "title_ghost_type1.png",
        "x": 116,
        "y": 107,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "ghost_type1_2": {
        "img": "title_ghost_type1_2.png",
        "x": 275,
        "y": 118,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "ghost_type2": {
        "img": "title_ghost_type2.png",
        "x": 274,
        "y": 203,
        "sx": 707,
        "sy": 53,
        "sw": 1219,
        "sh": 1348,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "ghost_type2_2": {
        "img": "title_ghost_type2_2.png",
        "x": 83,
        "y": 244,
        "sx": 65,
        "sy": 50,
        "sw": 1656,
        "sh": 1963,
        "scale": 0.020000000000000004,
        "imgObj": {},
        "isHidden": false,
        "flip": false,
        "rotation": 5
    },
    "ghost_type3": {
        "img": "title_ghost_type3.png",
        "x": 434,
        "y": 195,
        "sx": 75,
        "sy": 4,
        "sw": 777,
        "sh": 1062,
        "scale": 0.04000000000000003,
        "imgObj": {},
        "isHidden": false,
        "flip": true,
        "rotation": 10
    },
    "ghost_type3_2": {
        "img": "title_ghost_type3_2.png",
        "x": 383,
        "y": 149,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 5
    },
    "ghost_type4": {
        "img": "title_ghost_type4.png",
        "x": 435,
        "y": 37,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "ghost_type4_2": {
        "img": "title_ghost_type4_2.png",
        "x": 214,
        "y": 158,
        "sx": 849,
        "sy": 51,
        "sw": 971,
        "sh": 1106,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "isHidden": false,
        "rotation": 10
    },
    "ghost_type5": {
        "img": "title_ghost_type5.png",
        "x": 698,
        "y": 248,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "ghost_type5_2": {
        "img": "title_ghost_type5_2.png",
        "x": 518,
        "y": 52,
        "sx": 344,
        "sy": 4,
        "sw": 796,
        "sh": 761,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "isHidden": false
    },
    "machine": {
        "img": "title_machine.png",
        "x": 401,
        "y": 318,
        "sx": 772,
        "sy": 4,
        "sw": 1257,
        "sh": 1499,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": true,
        "isHidden": false
    },
    "machine_type1": {
        "img": "title_machine_type1.png",
        "x": 130,
        "y": 396,
        "sx": 314,
        "sy": -54,
        "sw": 821,
        "sh": 841,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": false,
        "isHidden": false
    },
    "machine_type1_2": {
        "img": "title_machine_type1_2.png",
        "x": 419,
        "y": 85,
        "sx": 61,
        "sy": 4,
        "sw": 1257,
        "sh": 771,
        "scale": 0.060000000000000005,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 10
    },
    "machine_type2": {
        "img": "title_machine_type2.png",
        "x": 322,
        "y": 338,
        "sx": 772,
        "sy": 4,
        "sw": 1257,
        "sh": 1500,
        "scale": 0.030000000000000013,
        "imgObj": {},
        "flip": false,
        "isHidden": false
    },
    "machine_type2_2": {
        "img": "title_machine_type2_2.png",
        "x": 677,
        "y": 277,
        "sx": 339,
        "sy": 4,
        "sw": 728,
        "sh": 814,
        "scale": 0.060000000000000005,
        "imgObj": {},
        "flip": true,
        "isHidden": false
    },
    "machine_type3": {
        "img": "title_machine_type3.png",
        "x": 192,
        "y": 261,
        "sx": 772,
        "sy": 4,
        "sw": 1257,
        "sh": 1499,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": false,
        "z": -1,
        "isHidden": false
    },
    "machine_type3_2": {
        "img": "title_machine_type3_2.png",
        "x": 610,
        "y": 238,
        "sx": 313,
        "sy": 4,
        "sw": 693,
        "sh": 873,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "isHidden": false
    },
    "machine_type4": {
        "img": "title_machine_type4.png",
        "x": 632,
        "y": 307,
        "sx": 772,
        "sy": 4,
        "sw": 1347,
        "sh": 1499,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": true,
        "z": 1,
        "isHidden": false
    },
    "machine_type4_2": {
        "img": "title_machine_type4_2.png",
        "x": 341,
        "y": 303,
        "sx": 290,
        "sy": -4,
        "sw": 802,
        "sh": 823,
        "scale": 0.060000000000000005,
        "imgObj": {},
        "flip": true,
        "isHidden": false
    },
    "machine_type5": {
        "img": "title_machine_type5.png",
        "x": 356,
        "y": 250,
        "sx": 340,
        "sy": -8,
        "sw": 703,
        "sh": 867,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": false,
        "z": -2,
        "isHidden": false
    },
    "machine_type5_2": {
        "img": "title_machine_type5_2.png",
        "x": 215,
        "y": 327,
        "sx": 772,
        "sy": 4,
        "sw": 1257,
        "sh": 1499,
        "scale": 0.030000000000000006,
        "imgObj": {},
        "flip": false,
        "isHidden": false
    },
    "machine_type5_3": {
        "img": "title_machine_type5_3.png",
        "x": 583,
        "y": 299,
        "sx": 131,
        "sy": -22,
        "sw": 655,
        "sh": 836,
        "scale": 0.05000000000000002,
        "imgObj": {},
        "flip": true,
        "isHidden": false
    },
    "dragon": {
        "img": "title_dragon.png",
        "x": 1,
        "y": 389,
        "sx": 338,
        "sy": 41,
        "sw": 692,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 35
    },
    "dragon_type1": {
        "img": "title_dragon_type1.png",
        "x": 837,
        "y": 65,
        "sx": -42,
        "sy": 31,
        "sw": 1132,
        "sh": 926,
        "scale": 0.2,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "rotation": -30
    },
    "dragon_type1_2": {
        "img": "title_dragon_type1_2.png",
        "x": 1,
        "y": 130,
        "sx": 323,
        "sy": 31,
        "sw": 814,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 40
    },
    "dragon_type2": {
        "img": "title_dragon_type2.png",
        "x": 812,
        "y": 162,
        "sx": 338,
        "sy": 31,
        "sw": 692,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "rotation": -35
    },
    "dragon_type2_2": {
        "img": "title_dragon_type2_2.png",
        "x": 821,
        "y": 521,
        "sx": 487,
        "sy": 31,
        "sw": 1614,
        "sh": 1387,
        "scale": 0.2,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "rotation": 15
    },
    "dragon_type2_3": {
        "img": "title_dragon_type2_3.png",
        "x": 24,
        "y": 494,
        "sx": 332,
        "sy": 12,
        "sw": 780,
        "sh": 703,
        "scale": 0.3,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": -5
    },
    "dragon_type3": {
        "img": "title_dragon_type3.png",
        "x": -26,
        "y": 218,
        "sx": 227,
        "sy": 15,
        "sw": 884,
        "sh": 731,
        "scale": 0.2,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 30
    },
    "dragon_type3_2": {
        "img": "title_dragon_type3_2.png",
        "x": 821,
        "y": 249,
        "sx": 304,
        "sy": -2,
        "sw": 764,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "rotation": -35
    },
    "dragon_type4": {
        "img": "title_dragon_type4.png",
        "x": -18,
        "y": 308,
        "sx": 235,
        "sy": 31,
        "sw": 849,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 30,
        "z": -1
    },
    "dragon_type4_2": {
        "img": "title_dragon_type4_2.png",
        "x": 820,
        "y": 328,
        "sx": 641,
        "sy": 31,
        "sw": 1413,
        "sh": 1437,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "rotation": -20
    },
    "dragon_type5": {
        "img": "title_dragon_type5.png",
        "x": 47,
        "y": -10,
        "sx": 162,
        "sy": 31,
        "sw": 2419,
        "sh": 1432,
        "scale": 0.10000000000000002,
        "imgObj": {},
        "flip": false,
        "isHidden": false,
        "rotation": 45
    },
    "dragon_type5_2": {
        "img": "title_dragon_type5_2.png",
        "x": 772,
        "y": 41,
        "sx": 338,
        "sy": 31,
        "sw": 692,
        "sh": 703,
        "scale": 0.2,
        "imgObj": {},
        "flip": true,
        "isHidden": false,
        "z": -2,
        "rotation": -25
    }
};

// ==========================================
// ★ AI調整用の直接入力UIパネル（追加表示ボタン追加版）
// ==========================================
function initAdjustUI() {
    const panel = document.createElement('div'); panel.id = 'ai-adjust-panel';
    panel.style.cssText = `position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.85); color:white; padding:15px; border-radius:8px; display:none; z-index:9999; font-family:monospace; box-shadow:0 4px 10px rgba(0,0,0,0.5); width:320px;`;
    
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
                <label style="margin-right:10px; cursor:pointer; color:#E040FB;"><input type="radio" name="adjTarget" value="rasset"> ASSET</label>
                <label style="margin-right:10px; cursor:pointer; color:#7C4DFF;"><input type="radio" name="adjTarget" value="sasset"> S-ASSET</label>
                <label style="cursor:pointer; color:#FF5722;"><input type="radio" name="adjTarget" value="title"> TITLE</label>
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
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
            ${['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY'].map(f => `
                <div style="display:flex; align-items:center;">
                    <label style="width:55px;">${f.toUpperCase()}:</label>
                    <input type="number" step="${f.includes('scale') ? '0.01' : '1'}" id="direct-input-${f}" style="width:70px; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:3px;">
                </div>
            `).join('')}
            
            <div style="display:flex; align-items:center;">
                <label style="width:55px;">ROT: </label>
                <input type="number" step="1" id="direct-input-rotation" style="width:70px; background:#222; color:#fff; border:1px solid #555; padding:4px; border-radius:3px;">
            </div>
            
            <div style="display:flex; align-items:center;">
                <label style="width:55px; color:#ff9800;">HIDE: </label>
                <input type="checkbox" id="direct-input-hide" style="cursor:pointer; width:16px; height:16px;">
            </div>
        </div>

        <div id="title-bulk-hide-btns" style="margin-top:12px; display:none; grid-template-columns: 1fr 1fr; gap:6px; border-top:1px dashed #555; padding-top:10px;">
            <button id="adj-btn-show-all" style="padding:6px; background:#4CAF50; color:white; border:none; cursor:pointer; border-radius:4px; font-size:10px; font-weight:bold;">ALL SHOW</button>
            <button id="adj-btn-hide-all" style="padding:6px; background:#f44336; color:white; border:none; cursor:pointer; border-radius:4px; font-size:10px; font-weight:bold;">ALL HIDE</button>
            <button id="adj-btn-show-species" style="padding:6px; background:#2196F3; color:white; border:none; cursor:pointer; border-radius:4px; font-size:10px; font-weight:bold;" title="同じ種族（進化系含む）だけを表示">SPECIES ONLY</button>
            <button id="adj-btn-add-species" style="padding:6px; background:#9C27B0; color:white; border:none; cursor:pointer; border-radius:4px; font-size:10px; font-weight:bold;" title="現在の表示に同じ種族を追加する">ADD SPECIES</button>
        </div>

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

    ['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY', 'rotation'].forEach(f => {
        const input = document.getElementById('direct-input-' + f);
        if (input) {
            input.addEventListener('input', e => {
                const target = getAdjustTarget(); 
                if (target) { 
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = f.includes('scale') ? 1 : 0;

                    if (f === 'scaleX' && ['dmap', 'dchr', 'achr', 'afld', 'rasset', 'sasset', 'title'].includes(editingTarget)) {
                        target.scale = val;
                    } else {
                        target[f] = val;
                    }
                    if(typeof render === 'function') render(); 
                }
            });
            input.addEventListener('change', () => { if(typeof saveGameData === 'function') saveGameData(); });
        }
    });

    document.getElementById('direct-input-hide').addEventListener('change', e => {
        const target = getAdjustTarget(); 
        if (target) { 
            target.isHidden = e.target.checked; 
            if(typeof render === 'function') render(); 
        }
    });

    document.getElementById('adj-btn-show-all').onclick = function() {
        if (editingTarget === 'title' && window.TITLE_SCREEN_DATA) {
            for (let k in window.TITLE_SCREEN_DATA) { window.TITLE_SCREEN_DATA[k].isHidden = false; }
            if(typeof render === 'function') render();
        }
    };
    document.getElementById('adj-btn-hide-all').onclick = function() {
        if (editingTarget === 'title' && window.TITLE_SCREEN_DATA) {
            for (let k in window.TITLE_SCREEN_DATA) { window.TITLE_SCREEN_DATA[k].isHidden = true; }
            if(typeof render === 'function') render();
        }
    };
    document.getElementById('adj-btn-show-species').onclick = function() {
        if (editingTarget === 'title' && window.selectedTitleCharKey && window.TITLE_SCREEN_DATA) {
            let base = window.selectedTitleCharKey.split('_')[0];
            for (let k in window.TITLE_SCREEN_DATA) { 
                if (k === base || k.startsWith(base + '_')) window.TITLE_SCREEN_DATA[k].isHidden = false;
                else window.TITLE_SCREEN_DATA[k].isHidden = true;
            }
            if(typeof render === 'function') render();
        }
    };
    // ★追加：既存の表示を消さずに、選択中の種族を「追加」で表示するボタン
    document.getElementById('adj-btn-add-species').onclick = function() {
        if (editingTarget === 'title' && window.selectedTitleCharKey && window.TITLE_SCREEN_DATA) {
            let base = window.selectedTitleCharKey.split('_')[0];
            for (let k in window.TITLE_SCREEN_DATA) { 
                if (k === base || k.startsWith(base + '_')) {
                    window.TITLE_SCREEN_DATA[k].isHidden = false;
                }
            }
            if(typeof render === 'function') render();
        }
    };

    document.getElementById('adj-btn-copy').onclick = function() {
         const target = getAdjustTarget();
         if(target) {
             window.copiedFrameData = { sx: target.sx, sy: target.sy, sw: target.sw, sh: target.sh, scaleX: target.scaleX, scaleY: target.scaleY, scale: target.scale, rotation: target.rotation };
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
             if(window.copiedFrameData.rotation !== undefined) target.rotation = window.copiedFrameData.rotation;
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
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget)) statusEl.innerText = `Target: ${window.selectedDungeonSpriteKey || 'None'}`;
            // ★修正：R-ASSETが選ばれた時、新しいスプライトキーを表示する
            else if (editingTarget === 'rasset') {
                statusEl.innerText = `Target: ${window.selectedShopSpriteKey || 'None'}`;
            }
            else if (editingTarget === 'sasset') {
                let fData = window.SHOP_FURNITURE_DATA && window.SHOP_FURNITURE_DATA['smith'] ? window.SHOP_FURNITURE_DATA['smith'][window.selectedFurnitureIndex] : null;
                statusEl.innerText = `Target: ${fData ? fData.name : 'None'} (${window.selectedFurnitureIndex+1})`;
            }
            else if (editingTarget === 'title') {
                statusEl.innerText = `Target: ${window.selectedTitleCharKey}`;
            }
        }
        
        if (typeof window.showAdjustUI === 'undefined') window.showAdjustUI = true;
        if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust') {
            const target = getAdjustTarget();
            if (target && window.showAdjustUI) {
                p.style.display = 'block';
                document.getElementById('adj-act-wrap').style.display = (editingTarget === 'ai') ? 'flex' : 'none';
                
                const sel = document.getElementById('adjust-action-select');
                if (sel && document.activeElement !== sel && typeof editingActionType !== 'undefined') sel.value = editingActionType;

                const imgEl = document.getElementById('direct-input-image');
                if (imgEl && document.activeElement !== imgEl) imgEl.value = target.image || target.img || '';

                ['sx', 'sy', 'sw', 'sh', 'scaleX', 'scaleY', 'rotation'].forEach(f => {
                    const el = document.getElementById('direct-input-' + f);
                    if (el && document.activeElement !== el) {
                        if (f === 'scaleX' && ['dmap', 'dchr', 'achr', 'afld', 'rasset', 'sasset', 'title'].includes(editingTarget)) {
                            el.value = target.scale !== undefined ? target.scale : 1;
                        } else { 
                            el.value = target[f] !== undefined ? target[f] : (f.includes('scale') ? 1 : 0); 
                        }
                    }
                });

                const hideEl = document.getElementById('direct-input-hide');
                if (hideEl && document.activeElement !== hideEl) hideEl.checked = !!target.isHidden;
                
                // ★修正：grid形式にしたボタンコンテナを表示
                const bulkBtns = document.getElementById('title-bulk-hide-btns');
                if (bulkBtns) bulkBtns.style.display = (editingTarget === 'title') ? 'grid' : 'none';
                
            } else { p.style.display = 'none'; }
        } else { p.style.display = 'none'; }
    }, 100);
}

window.getCombinedAdjustAssetKeys = function() {
    const keys = [];
    if (typeof window.SHOP_SPRITES !== 'undefined') keys.push(...Object.keys(window.SHOP_SPRITES));
    if (typeof window.MYHOME_SPRITES !== 'undefined') keys.push(...Object.keys(window.MYHOME_SPRITES));
    return keys;
};

window.getCombinedAdjustAsset = function(key) {
    if (typeof window.SHOP_SPRITES !== 'undefined' && window.SHOP_SPRITES[key]) return window.SHOP_SPRITES[key];
    if (typeof window.MYHOME_SPRITES !== 'undefined' && window.MYHOME_SPRITES[key]) return window.MYHOME_SPRITES[key];
    return null;
};

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
        const keys = window.getCombinedAdjustAssetKeys ? window.getCombinedAdjustAssetKeys() : [];
        if (keys.length > 0) {
            if (!keys.includes(window.selectedShopSpriteKey)) window.selectedShopSpriteKey = keys[0];
            target = window.getCombinedAdjustAsset(window.selectedShopSpriteKey);
        }
    }else if (editingTarget === 'sasset') {
        if (typeof window.SHOP_FURNITURE_DATA !== 'undefined' && window.SHOP_FURNITURE_DATA['smith']) {
            let list = window.SHOP_FURNITURE_DATA['smith'];
            if (window.selectedFurnitureIndex >= list.length) window.selectedFurnitureIndex = 0;
            target = list[window.selectedFurnitureIndex];
        }
    } else if (editingTarget === 'title') {
        target = window.TITLE_SCREEN_DATA[window.selectedTitleCharKey];
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
                } else if (editingTarget === 'rasset') {
                    console.log("■■■ SHOP_SPRITES ■■■\n" + JSON.stringify(window.SHOP_SPRITES || {}, null, 4));
                    console.log("■■■ MYHOME_SPRITES ■■■\n" + JSON.stringify(window.MYHOME_SPRITES || {}, null, 4));
                    alert("ASSET用スプライト定義をコンソールに出力しました。");
                } else if (editingTarget === 'sasset' && typeof window.SHOP_FURNITURE_DATA !== 'undefined') {
                    console.log("▼▼▼ SHOP_FURNITURE_DATA ▼▼▼\n" + JSON.stringify(window.SHOP_FURNITURE_DATA, null, 4)); alert("家具配置データをコンソールに出力しました！\nこれを ui_controller.js に貼り付けてください。");
                } else if (editingTarget === 'title') {
                    console.log("▼▼▼ TITLE_SCREEN_DATA ▼▼▼\n" + JSON.stringify(window.TITLE_SCREEN_DATA, null, 4)); alert("タイトルキャラの座標・切り抜きデータをコンソールに出力しました！");
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
            } else if (editingTarget === 'rasset' && typeof window.SHOP_SPRITES !== 'undefined') {
                const keys = window.getCombinedAdjustAssetKeys ? window.getCombinedAdjustAssetKeys() : Object.keys(window.SHOP_SPRITES);
                if (keys.length > 0) {
                    let currentKey = window.selectedShopSpriteKey || keys[0];
                    if (!keys.includes(currentKey)) currentKey = keys[0];
                    let idx = keys.indexOf(currentKey);
                    if (isPrev) idx = (idx - 1 + keys.length) % keys.length; else idx = (idx + 1) % keys.length;
                    window.selectedShopSpriteKey = keys[idx];
                }
            } else if (editingTarget === 'sasset' && typeof window.SHOP_FURNITURE_DATA !== 'undefined') {
                // (sassetの切り替えはそのまま)
                let list = window.SHOP_FURNITURE_DATA['smith'];
                if (list && list.length > 0) {
                    if (isPrev) window.selectedFurnitureIndex = (window.selectedFurnitureIndex - 1 + list.length) % list.length;
                    else window.selectedFurnitureIndex = (window.selectedFurnitureIndex + 1) % list.length;
                }
            } else if (editingTarget === 'title') {
                const keys = Object.keys(window.TITLE_SCREEN_DATA);
                let idx = keys.indexOf(window.selectedTitleCharKey);
                if (isPrev) idx = (idx - 1 + keys.length) % keys.length; else idx = (idx + 1) % keys.length;
                window.selectedTitleCharKey = keys[idx];
            }
            render(); return;
        }
        
        if (editingTarget === 'ai' && e.key === ' ') { isTestPlaying = !isTestPlaying; e.preventDefault(); }
        if (editingTarget === 'ai' && e.key.toLowerCase() === 'f') { editingFrameIndex = (editingFrameIndex + 1) % 3; render(); }

        // ★修正: 縮小限界を 0.1 から 0.01 へ解除
        if (e.key.toLowerCase() === 'v') { 
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) aiConfigs[selectedAIType].scale = Math.max(0.01, (aiConfigs[selectedAIType].scale||0.25) - 0.05);
            else if (editingTarget === 'map' && catalog[selectedMapKey]) catalog[selectedMapKey].scale = Math.max(0.01, (catalog[selectedMapKey].scale||1.0) - 0.05);
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleX = Math.max(0.01, (window.TCG_MASTER[selectedCardKey].scaleX||1.0) - 0.05);
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale = Math.max(0.01, (window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale||1.0) - 0.05);
            else if (['rasset', 'sasset', 'title'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) t.scale = Math.max(0.01, (t.scale||1.0) - 0.05); }
        }
        if (e.key.toLowerCase() === 'b') { 
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) aiConfigs[selectedAIType].scale = (aiConfigs[selectedAIType].scale||0.25) + 0.05;
            else if (editingTarget === 'map' && catalog[selectedMapKey]) catalog[selectedMapKey].scale = (catalog[selectedMapKey].scale||1.0) + 0.05;
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) window.TCG_MASTER[selectedCardKey].scaleX = (window.TCG_MASTER[selectedCardKey].scaleX||1.0) + 0.05;
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale = (window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey].scale||1.0) + 0.05;
            else if (['rasset', 'sasset', 'title'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) t.scale = (t.scale||1.0) + 0.05; }
        }

        // ★追加: Nキー（左回転）と Mキー（右回転）5度ずつ回転
        if (e.key.toLowerCase() === 'n') { 
            let applyRot = (obj) => { obj.rotation = ((obj.rotation || 0) - 5) % 360; };
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) applyRot(aiConfigs[selectedAIType]);
            else if (editingTarget === 'map' && catalog[selectedMapKey]) applyRot(catalog[selectedMapKey]);
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) applyRot(window.TCG_MASTER[selectedCardKey]);
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) applyRot(window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]);
            else if (['rasset', 'sasset', 'title'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) applyRot(t); }
        }
        if (e.key.toLowerCase() === 'm') { 
            let applyRot = (obj) => { obj.rotation = ((obj.rotation || 0) + 5) % 360; };
            if (editingTarget === 'ai' && aiConfigs[selectedAIType]) applyRot(aiConfigs[selectedAIType]);
            else if (editingTarget === 'map' && catalog[selectedMapKey]) applyRot(catalog[selectedMapKey]);
            else if (editingTarget === 'card' && window.TCG_MASTER[selectedCardKey]) applyRot(window.TCG_MASTER[selectedCardKey]);
            else if (['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget) && window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]) applyRot(window.DUNGEON_SPRITES[window.selectedDungeonSpriteKey]);
            else if (['rasset', 'sasset', 'title'].includes(editingTarget)) { let t = getAdjustTarget(); if (t) applyRot(t); }
        }
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
    
    // ★追加：家具・タイトルキャラの配置位置（X/Y）の調整（矢印キー）
    if (['rasset', 'sasset', 'title'].includes(editingTarget)) {
        if (e.key === 'ArrowUp') { target.y -= step; e.preventDefault(); }
        if (e.key === 'ArrowDown') { target.y += step; e.preventDefault(); }
        if (e.key === 'ArrowLeft') { target.x -= step; e.preventDefault(); }
        if (e.key === 'ArrowRight') { target.x += step; e.preventDefault(); }
    }
    
    // ★追加：[キーで奥へ、]キーで手前へ移動（Z軸の調整）
    if (editingTarget === 'title') {
        if (e.key === '[') { target.z = (target.z || 0) - 1; e.preventDefault(); } // 奥へ
        if (e.key === ']') { target.z = (target.z || 0) + 1; e.preventDefault(); } // 手前へ
    }
    
    // ★修正：title編集時もRキーで左右反転できるようにする
    if (key === 'r' && (currentMode === 'editor' || currentMode === 'grazing_editor' || editingTarget === 'title')) target.flip = !target.flip;
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
        if (editingTarget === 'rasset' && typeof window.renderMyHomeMap === 'function') window.renderMyHomeMap();
    }
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // ==========================================
    // ★ロゴ画面をクリックしたら、暗転中に超高速でプリロードしてタイトルへ！
    // ==========================================
    if (currentMode === 'logo') {
        if (window.isTitleTransitioning) return; // 連打防止
        window.isTitleTransitioning = true;
        
        let fader = document.createElement('div');
        fader.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:#050505; z-index:99999; opacity:0; transition:opacity 0.3s ease; pointer-events:none;`;
        document.body.appendChild(fader);

        setTimeout(() => {
            fader.style.opacity = '1';

            setTimeout(() => {
                let unlocked = [];
                
                try {
                    let saveData = localStorage.getItem('ai_pet_data_v1') || localStorage.getItem('ai_pet_data');
                    if (saveData) {
                        let parsed = JSON.parse(saveData);
                        let list1 = Array.isArray(parsed.discoveredMonsters) ? parsed.discoveredMonsters : [];
                        let list2 = (parsed.aiPet && Array.isArray(parsed.aiPet.discoveredMonsters)) ? parsed.aiPet.discoveredMonsters : [];
                        let list3 = (window.aiPet && Array.isArray(window.aiPet.discoveredMonsters)) ? window.aiPet.discoveredMonsters : [];
                        unlocked = [...new Set([...list1, ...list2, ...list3])];
                    } else if (window.aiPet && window.aiPet.discoveredMonsters) {
                        unlocked = window.aiPet.discoveredMonsters;
                    }
                } catch(err) {}

                unlocked = unlocked.filter(sp => typeof sp === 'string' && !sp.includes('dummy') && !sp.includes('insurance'));
                unlocked = [...new Set(unlocked)]; 
                
                if (typeof window.generateTitleLayout === 'function') {
                    window.generateTitleLayout(unlocked);
                }

                let activeKeys = Object.keys(window.TITLE_SCREEN_DATA || {}).filter(k => window.TITLE_RANDOM_LAYOUT && window.TITLE_RANDOM_LAYOUT[k]);
                
                let loadPromises = activeKeys.map(k => {
                    return new Promise(resolve => {
                        let chara = window.TITLE_SCREEN_DATA[k];
                        
                        // ==========================================
                        // ★究極修正：単なる空箱 {} だった場合は、本物の Image() で上書きする！
                        // ==========================================
                        if (!chara.imgObj || !(chara.imgObj instanceof Image)) {
                            chara.imgObj = new Image();
                        }

                        if (chara.imgObj.src && chara.imgObj.src.includes(chara.img) && chara.imgObj.complete && chara.imgObj.naturalWidth !== 0) {
                            resolve(); return;
                        }

                        chara.imgObj.onload = () => resolve();
                        chara.imgObj.onerror = () => resolve(); 
                        chara.imgObj.src = chara.img;

                        setTimeout(() => { if (chara.imgObj.complete) resolve(); }, 50);
                    });
                });

                if (!window.bgTitleImg) window.bgTitleImg = new Image();
                loadPromises.push(new Promise(resolve => {
                    if (window.bgTitleImg.src && window.bgTitleImg.src.includes('bg_game_title.png') && window.bgTitleImg.complete) {
                        resolve(); return;
                    }
                    window.bgTitleImg.onload = () => resolve();
                    window.bgTitleImg.onerror = () => resolve();
                    window.bgTitleImg.src = 'bg_game_title.png';
                    setTimeout(() => { if (window.bgTitleImg.complete) resolve(); }, 50);
                }));

                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 400));

                Promise.race([Promise.all(loadPromises), timeoutPromise]).then(() => {
                    switchMode('title'); 
                    
                    if (window.audioManager && window.audioManager.playTitleMusic) {
                        window.audioManager.playTitleMusic(unlocked);
                    }

                    fader.style.opacity = '0';
                    setTimeout(() => {
                        fader.remove();
                        window.isTitleTransitioning = false;
                    }, 300);
                });

            }, 300); 
        }, 10);
        return; 
    }

    // ==========================================
    // タイトル画面：マウスクリック判定
    // ==========================================
    if (currentMode === 'title') {
        if (window.titleConfirmMode) {
            if (window.titleMenuHover === 3) { 
                window.titleConfirmMode = false;
                
                if (localStorage.getItem('my_player_id')) {
                    if (typeof window.showCustomAlert === 'function') {
                        window.showCustomAlert("⚠️ プレイ制限", "現在オンラインアカウントで連携中です。\n誤操作によるデータ消失を防ぐため、「はじめから」は選択できません。\n\n既存のデータで遊ぶ場合は「つづきから」を選択してください。");
                    }
                    return; 
                }

                // クラスを外して通常のゲームレイアウト（+AIコマンドセンター）に戻す
                document.getElementById('canvas-wrapper').classList.remove('fullscreen-mode');
                
                if (typeof window.showNewGameLoginChoice === 'function') {
                    window.showNewGameLoginChoice();
                } else {
                    window.executeNewGameInitialization(true);
                }
            } else if (window.titleMenuHover === 4) { 
                window.titleConfirmMode = false;
            }
            return;
        }

        if (window.titleMenuHover === 1) { 
            window.titleConfirmMode = true;
        } else if (window.titleMenuHover === 2) { 
            // クラスを外して通常のゲームレイアウト（+AIコマンドセンター）に戻す
            document.getElementById('canvas-wrapper').classList.remove('fullscreen-mode');

            if (!localStorage.getItem('my_player_id') && !window.skipAutoLogin && typeof window.showContinueLoginChoice === 'function') {
                window.showContinueLoginChoice();
            } else {
                window.startActualGame(false);
            }
        }
        return;
    }

    if (currentMode === 'editor' || currentMode === 'grazing_editor') {
        selectedAsset = null; let hitKey = null;
        for (let key in assets) {
            const a = assets[key]; const dw = a.sw * a.scale, dh = a.sh * a.scale;
            const checkX = mx + camera.x; const checkY = my + camera.y;
            if (checkX > a.dx && checkX < a.dx + dw && checkY > a.dy && checkY < a.dy + dh) hitKey = key;
        }
        if (hitKey) { selectedAsset = assets[hitKey]; isDragging = true; offsetX = (mx + camera.x) - selectedAsset.dx; offsetY = (my + camera.y) - selectedAsset.dy; }
    } else if (currentMode === 'ai_adjust' && typeof editingTarget !== 'undefined' && editingTarget === 'title') {
        let t = window.getAdjustTarget();
        if (t) {
            let dw = (t.sw || 150) * (t.scale || 1); let dh = (t.sh || 150) * (t.scale || 1);
            let left = (t.x || 640) - dw/2; let right = (t.x || 640) + dw/2;
            let top = (t.y || 360) - dh/2; let bottom = (t.y || 360) + dh/2;
            if (mx >= left && mx <= right && my >= top && my <= bottom) {
                window.isDraggingTitle = true; window.titleDragOffsetX = mx - (t.x || 640); window.titleDragOffsetY = my - (t.y || 360);
            }
        }
    }
    render();
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // ==========================================
    // ★タイトル画面：マウスホバー判定
    // ==========================================
    if (currentMode === 'title') {
        window.titleMenuHover = 0;
        
        if (window.titleConfirmMode) {
            // 確認ダイアログ中のホバー判定
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            if (my > cy + 40 && my < cy + 100) {
                if (mx > cx - 180 && mx < cx - 20) window.titleMenuHover = 3; // はい
                if (mx > cx + 20 && mx < cx + 180) window.titleMenuHover = 4; // いいえ
            }
            return;
        }

        const TEXT_X = canvas.width * 0.95;   
        const MENU1_Y = canvas.height * 0.75; 
        const MENU2_Y = canvas.height * 0.85; 

        if (mx > TEXT_X - 250 && mx < TEXT_X + 20) {
            if (my > MENU1_Y - 30 && my < MENU1_Y + 30) window.titleMenuHover = 1; 
            if (my > MENU2_Y - 30 && my < MENU2_Y + 30) window.titleMenuHover = 2; 
        }
        return; 
    }

    if (isDragging && selectedAsset && (currentMode === 'editor' || currentMode === 'grazing_editor')) {
        selectedAsset.dx = (mx + camera.x) - offsetX; selectedAsset.dy = (my + camera.y) - offsetY; render();
    } else if (window.isDraggingTitle && currentMode === 'ai_adjust' && typeof editingTarget !== 'undefined' && editingTarget === 'title') {
        let t = window.getAdjustTarget();
        if (t) { t.x = mx - window.titleDragOffsetX; t.y = my - window.titleDragOffsetY; render(); }
    }
});

window.addEventListener('mouseup', () => { isDragging = false; if (currentMode === 'editor' || currentMode === 'grazing_editor') saveGameData(); });

window.onload = () => { 
    if(typeof applyTranslations === 'function') applyTranslations();
    const nav = document.getElementById('nav'); if (nav) nav.style.display = 'none'; 
    // ★修正：勝手にプレイ画面に切り替わる古い処理を削除（タイトル画面を維持します）
    // if (!window.isGamePaused) switchMode('play'); 
    if(typeof processOfflineProgression === 'function') processOfflineProgression();
    
    setInterval(() => { 
        if (typeof window.isGamePaused !== 'undefined' && window.isGamePaused) {
            const canvasEl = document.getElementById('gameCanvas');
            if (canvasEl) { const ctxEl = canvasEl.getContext('2d'); ctxEl.fillStyle = '#222'; ctxEl.fillRect(0, 0, canvasEl.width, canvasEl.height); }
            return;
        }

        // ★追加：ロゴモードの時は、専用のロゴ描画だけを行って処理を終わる
        if (typeof currentMode !== 'undefined' && currentMode === 'logo') {
            if (typeof window.drawStudioLogo === 'function') window.drawStudioLogo();
            return;
        }

        // （以下、既存の処理が続きます）
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
                
                let initialRecipes = isRest ? { 'dish_stirfry': { learned: false, mastery: 0, learnedOrder: 1 } } : { 'eq_sword': { learned: false, mastery: 0, learnedOrder: 1 } };
                let initialProgress = {};
                
                // ★追加：過去に倒産して「退避したレシピ」があれば復元する！
                if (isRest && window.aiPet && window.aiPet.savedRecipeFlags && Object.keys(window.aiPet.savedRecipeFlags).length > 0) {
                    initialRecipes = JSON.parse(JSON.stringify(window.aiPet.savedRecipeFlags));
                    initialProgress = JSON.parse(JSON.stringify(window.aiPet.savedRecipes || {}));
                }

                a.shopData = {
                    recipes: initialRecipes,
                    recipeProgress: initialProgress,
                    inventory: {},
                    prices: isRest ? { 'dish_stirfry': 100 } : { 'eq_sword': 300 },
                    reputation: 10, interiorLevel: 1, totalSales: 0,
                    isOpen: false,
                    logs: ["お店を新しく建てました！まずは研究開発から始めましょう。"]
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

    // プレイヤーデータをリセットする場合のみ、初回プレイ用のフラグを立てる
    if (resetAIData) {
        localStorage.setItem('force_first_play', 'true');
    }

    // 削除したデータをゲーム状態に反映させるため、必ずリロードを実行する
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

// ==========================================
// ★ Two-Sided Studio 鏡面ロゴ描画システム
// ==========================================
window.drawStudioLogo = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 背景を黒で塗りつぶす
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const text = "Two-Sided Studio";

    // --- 上部（現実）のロゴ ---
    ctx.font = 'bold 50px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(text, cx, cy - 30);

    // --- 境界線（ふたつの世界を隔てる線） ---
    ctx.beginPath();
    ctx.moveTo(cx - 250, cy);
    ctx.lineTo(cx + 250, cy);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- 下部（AI・裏側）の鏡面ロゴ ---
    ctx.save();
    ctx.translate(cx, cy + 30); // 反転の基準点へ移動
    ctx.scale(1, -1);           // Y軸を反転（鏡面反射）
    
    // 透明度を下げて、水面に映ったように描画
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText(text, 0, 0);
    ctx.restore();

    // --- Click to Start の点滅アニメーション ---
    let alpha = (Math.sin(Date.now() / 400) + 1) / 2; // 0.0 ~ 1.0を波打つ
    ctx.font = '16px sans-serif';
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.fillText("- Click to Start -", cx, canvas.height - 50);
};

// ==========================================
// ★ タイトル画面 ダイレクト配置ジェネレーター (119体フル表示対応版)
// ==========================================
window.generateTitleLayout = function(unlockedKeys) {
    window.TITLE_RANDOM_LAYOUT = {}; 
    if (!window.TITLE_SCREEN_DATA) return;

    // 解放済みのキャラクターで、かつエディタ(TITLE_SCREEN_DATA)にデータがあるものを抽出
    let available = [...new Set(unlockedKeys)].filter(k => window.TITLE_SCREEN_DATA[k]);

    // シャッフルや11体制限を行わず、すべて「TITLE_SCREEN_DATA」の座標・設定そのままで描画用レイアウトに登録！
    available.forEach(k => {
        let orig = window.TITLE_SCREEN_DATA[k];
        window.TITLE_RANDOM_LAYOUT[k] = {
            x: orig.x,
            y: orig.y,
            flip: orig.flip ? true : false,
            rotation: orig.rotation || 0 // 回転情報もそのまま引き継ぐ
        };
    });
};
