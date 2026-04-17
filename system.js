// system.js : システム・データ管理・共通変数

// --- グローバル変数 ---
var isDragging = false;
var selectedAsset = null;

// ==========================================
// ★ BGM管理マネージャー (全曲コレクション対応版)
// ==========================================
window.audioManager = {
    currentAudio: null,
    currentBGMType: null,
    isPlayingTitle: false,

    // --- タイトル画面専用の再生処理 ---
    playTitleMusic: function(unlockedSpeciesArray = []) {
        if (this.isPlayingTitle) return;
        this.isPlayingTitle = true;
        this.stopBGM();

        // ★修正：進化キャラをベース種族に変換し、重複のないリストを作る
        let baseUnlocked = new Set();
        const baseSpeciesList = ['robot', 'spirit', 'magician', 'stone', 'balloon', 'bird', 'beetle', 'seed', 'ghost', 'machine', 'dragon'];
        
        if (unlockedSpeciesArray && unlockedSpeciesArray.length > 0) {
            unlockedSpeciesArray.forEach(sp => {
                for (let base of baseSpeciesList) {
                    if (sp === base || (typeof sp === 'string' && sp.startsWith(base + '_'))) {
                        baseUnlocked.add(base);
                        break;
                    }
                }
            });
        }

        let candidates = ['main']; 
        baseUnlocked.forEach(base => candidates.push(base));

        if (baseUnlocked.size >= 11) {
            candidates.push('song');
        }

        let selectedTrack = candidates[Math.floor(Math.random() * candidates.length)];
        
        let trackKey = 'title_' + selectedTrack; 
        let src = `./bgm_${trackKey}.mp3`;
        
        this.currentAudio = new Audio(src);
        this.currentAudio.loop = true; 
        this.currentAudio.volume = (typeof aiPet !== 'undefined' && aiPet.bgmVolume !== undefined) ? aiPet.bgmVolume : 0.5;

        let playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log("[BGM] タイトル曲の自動再生待機中:", e));
        }

        if (typeof window.aiPet !== 'undefined') {
            if (!window.aiPet.unlockedBGMs) window.aiPet.unlockedBGMs = [];
            if (!window.aiPet.unlockedBGMs.includes(trackKey)) {
                window.aiPet.unlockedBGMs.push(trackKey);
                if (typeof window.saveGameData === 'function') window.saveGameData();
            }
        }
    },

    stopTitleMusic: function() {
        this.isPlayingTitle = false;
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    },

    // --- 通常のインゲームBGM処理 ---
    playBGM: function(type) {
        // ★修正：進化キャラ名をベース種族に変換する処理から、
        // title_, personality, inheritance（引継ぎ）を除外してそのまま鳴らす
        if (!type.startsWith('title_') && type !== 'personality' && type !== 'inheritance') {
            const baseSpeciesList = ['robot', 'spirit', 'magician', 'stone', 'balloon', 'bird', 'beetle', 'seed', 'ghost', 'machine', 'dragon'];
            for (let base of baseSpeciesList) {
                if (type === base || (typeof type === 'string' && type.startsWith(base + '_'))) {
                    type = base;
                    break;
                }
            }
        }

        if (this.currentAudio && this.currentBGMType === type) return; 
        if (this.currentAudio) { this.stopBGM(); }
        
        this.currentBGMType = type;
        const src = `./bgm_${type}.mp3`; 
        
        this.currentAudio = new Audio(src);
        this.currentAudio.loop = true;
        this.currentAudio.volume = (typeof aiPet !== 'undefined' && aiPet.bgmVolume !== undefined) ? aiPet.bgmVolume : 0.5;
        
        let playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log(`[BGM] ユーザー操作待ちのため再生を保留しました: ${e.name}`);
                this.currentAudio = null; 
            });
        }
        
        // ==========================================
        // ★絶対仕様：鳴らした曲は、それがどんなBGMであれ「すべて」音楽館の履歴に登録する！
        // ==========================================
        if (typeof window.aiPet !== 'undefined') {
            if (!window.aiPet.unlockedBGMs) window.aiPet.unlockedBGMs = [];
            if (!window.aiPet.unlockedBGMs.includes(type)) {
                window.aiPet.unlockedBGMs.push(type);
                if (typeof window.saveGameData === 'function') window.saveGameData();
            }
        }
    },
    
    stopBGM: function() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    },
    
    setVolume: function(v) {
        if (typeof aiPet !== 'undefined') aiPet.bgmVolume = v;
        if (this.currentAudio) this.currentAudio.volume = v;
    },
    
    restoreMainBGM: function() {
        if (typeof window.DEFENSE_STATE !== 'undefined' && window.DEFENSE_STATE.isEmergency) {
            this.playBGM('defense_start');
            return;
        }
        if (typeof aiPet !== 'undefined' && aiPet.type) {
            this.playBGM(aiPet.type);
        }
    }
};

var editingTarget = 'ai'; 
var selectedMapKey = 'grass1';
var selectedAIType = 'robot';
var editingActionType = 'idle';
var editingFrameIndex = 0;
var isTestPlaying = false;
var isRouletteSpinning = false;
var offsetX = 0; 
var offsetY = 0;

// 調整モードUIの表示状態管理
var showAdjustUI = true;   
var adjustUIPosRight = false; 

// --- 設定定数 ---
var BANKRUPTCY_LIMIT = -3000; 
var DEBT_TIME_LIMIT = 72 * 60; 

// --- 言語設定 ---
var currentLang = (navigator.language || navigator.userLanguage || 'ja').startsWith('ja') ? 'ja' : 'en';

function t(key) {
    if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang][key]) {
        return translations[currentLang][key];
    }
    if (typeof translations !== 'undefined' && translations.ja && translations.ja[key]) {
        return translations.ja[key];
    }
    return key;
}

// カタログ読み込み
let catalog;
try {
    let savedCatalog = JSON.parse(localStorage.getItem('map_catalog_v1'));
    if (savedCatalog) {
        catalog = savedCatalog;
        for (let key in defaultCatalog) {
            if (!catalog[key]) {
                catalog[key] = JSON.parse(JSON.stringify(defaultCatalog[key]));
            }
        }
    } else { 
        catalog = JSON.parse(JSON.stringify(defaultCatalog)); 
    }
} catch(e) { 
    catalog = JSON.parse(JSON.stringify(defaultCatalog)); 
}

// ポップアップ演出（✨専用の即消滅ロジック追加版）
var floatingTexts = [];
function addFloatingText(x, y, text, color) {
    if (text === "✨") {
        // キラキラ専用：寿命を短く(15)、上に昇る速度をほぼゼロ(-0.1)にして、その場で弾けて消えるようにする
        floatingTexts.push({ x: x, y: y, text: text, color: color || "white", life: 15, dy: -0.1 });
    } else {
        // 通常のテキスト（ダメージや美しさUP等）は今まで通りフワッと昇る
        floatingTexts.push({ x: x, y: y, text: text, color: color || "white", life: 60, dy: -1.0 });
    }
}

// マップ生成 (改良版: 川2列/2行、レアエリア分離)
function generateNatureMap() {
    const newAssets = {};
    const canvasWidth = 800; const canvasHeight = 480;
    const stepX = 50; const stepY = 25; const oddOffsetX = 25;
    const rows = Math.ceil(canvasHeight / stepY) + 2; // 約22行
    const cols = Math.ceil(canvasWidth / stepX) + 2;  // 約18列
    const useScale = 0.1;

    // 川の方向をランダムに決定 (true: 横方向の川, false: 縦方向の川)
    const isHorizontalRiver = Math.random() < 0.5;
    
    // 川の開始位置 (広いメインエリアを確保するため、画面の端の方に寄せる)
    const riverStartRow = 14; // 横の場合、14行目と15行目が川
    const riverStartCol = 12; // 縦の場合、12列目と13列目が川

    // 地形(床)の生成
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let dx = c * stepX; let dy = r * stepY;
            if (r % 2 === 1) { dx += oddOffsetX; }
            dx -= 25; dy -= 25;
            
            // 川の判定 (必ず2行 または 2列)
            let isWater = false;
            if (isHorizontalRiver) {
                if (r === riverStartRow || r === riverStartRow + 1) isWater = true;
            } else {
                if (c === riverStartCol || c === riverStartCol + 1) isWater = true;
            }

            const uid = "bg_" + r + "_" + c;
            
            if (isWater) {
                const waterType = 'water1';
                const data = catalog[waterType] || defaultCatalog[waterType];
                newAssets[uid] = {
                    img: data.img, sx: data.sx, sy: data.sy, sw: data.sw, sh: data.sh,
                    dx: dx, dy: dy, scale: useScale, type: 'water', name: data.name, flip: false
                };
            } else {
                const grassType = ['grass1', 'grass2', 'grass3'][Math.floor(Math.random() * 3)];
                const data = catalog[grassType] || defaultCatalog[grassType];
                newAssets[uid] = {
                    img: data.img, sx: data.sx, sy: data.sy, sw: data.sw, sh: data.sh,
                    dx: dx, dy: dy, scale: useScale, type: 'ground', name: data.name, flip: false
                };
            }
        }
    }

    // オブジェクトを特定のエリアに配置する内部関数
    function spawnObjects(config, targetArea) {
        for (let typeKey in config) {
            const count = config[typeKey];
            const data = catalog[typeKey] || defaultCatalog[typeKey];
            if (!data) continue;
            
            let spawned = 0;
            let attempts = 0;
            while (spawned < count && attempts < 100) {
                attempts++;
                const r = Math.floor(Math.random() * (rows - 4)) + 2;
                const c = Math.floor(Math.random() * (cols - 2)) + 1;
                
                // 水上の場合はスキップ
                let isWater = false;
                if (isHorizontalRiver) {
                    if (r === riverStartRow || r === riverStartRow + 1) isWater = true;
                } else {
                    if (c === riverStartCol || c === riverStartCol + 1) isWater = true;
                }
                if (isWater) continue;

                // 配置場所が川の向こう側(レアエリア)かどうかの判定
                let isAcrossRiver = false;
                if (isHorizontalRiver) {
                    if (r > riverStartRow + 1) isAcrossRiver = true;
                } else {
                    if (c > riverStartCol + 1) isAcrossRiver = true;
                }

                // 指定されたエリアと一致しない場合はやり直し
                if (targetArea === 'main' && isAcrossRiver) continue;
                if (targetArea === 'rare' && !isAcrossRiver) continue;

                const uid = typeKey + "_" + Date.now() + Math.random();
                let dx = c * stepX; let dy = r * stepY;
                if (r % 2 === 1) dx += oddOffsetX;
                dx -= 25 + (Math.random() * 20 - 10); dy -= 40; 
                
                newAssets[uid] = {
                    img: data.img, sx: data.sx, sy: data.sy, sw: data.sw, sh: data.sh,
                    dx: dx, dy: dy, scale: 0.5, 
                    type: data.type || 'nature', name: data.name,
                    resources: (facilityData[typeKey] ? 5 : -1), flip: false
                };
                spawned++;
            }
        }
    }

    // メインエリア（広い陸地）: 森と山を配置
    spawnObjects({ mountain: 5, palms: 7 }, 'main');

    // ★追加: 農家との出会い用に、メインエリアに畑を1つ確定配置
    spawnObjects({ farm: 1 }, 'main');

    // ★追加: 料理人との出会い用に、メインエリアにレストランを1つ確定配置
    spawnObjects({ restaurant: 1 }, 'main');

    // レアエリア（川を渡った先）: 洞窟、クリスタル、少数の森・山を配置
    spawnObjects({ skull: 1, crystal: 2, mountain: 1, palms: 1 }, 'rare');

    return newAssets;
}

// データの読み込み
let assets = JSON.parse(localStorage.getItem('map_data_v6')) || generateNatureMap();

if (assets) {
    for (let key in assets) {
        const a = assets[key];
        if (a.type === 'farm' && (a.img === 'terrain' || a.sx === 100)) {
            const correct = defaultCatalog['farm']; 
            if (correct) {
                console.log(`Fixing broken farm: ${key}`);
                a.img = correct.img;
                a.sx = correct.sx;
                a.sy = correct.sy;
                a.sw = correct.sw;
                a.sh = correct.sh;
                if (!a.scale) a.scale = correct.scale || 0.5;
            }
        }
    }
}

// AIデータ初期化
let savedPet = JSON.parse(localStorage.getItem('ai_pet_data_v1'));

// ★追加: 起動時にセーブデータがなかったかを記録しておく
var isFirstPlay = (savedPet === null);

const initBaseType = 'robot'; 
const initTrait = charaTraits[initBaseType]; 

let aiPet = savedPet || {
    // 初期位置を(400,240)から少し左上のメインエリア内(300,200)に固定
    x: 300, y: 200, targetX: 300, targetY: 200,
    baseType: initBaseType, currentSkin: initBaseType,
    generation: 1, age: 0, lifespan: initTrait.lifespan,
    visualAction: null, visualActionTimer: 0,
    skills: { cooking: 0, smithing: 0 },
    shopExp: 0, shopLevel: 1, shopBalance: 0,
    debugHour: -1, targetProject: "",
    castleRank: 1, questBoard: [], activeQuests: [], casinoCoins: 0,
    inventory: [], facilityProgress: {}, discoveredItems: {},
    gold: 0, debtTimer: 0,
    exploreState: { depth: 0, maxDepth: 0, currentFacility: null },
    frameIndex: 1, frameStep: 1, tick: 0, exploreTimer: 0,
    stats: { intel: 10, power: 10, mood: 10 },
    energy: 100, hunger: 100,
    message: "", messageTimer: 0,
    schedule: [], lastSaveTime: Date.now(), flip: false,
    weather: 'sunny', weatherTimer: 0,
    idleTimer: 0, actionState: 'idle', 
    interactionTarget: null, interactionTimer: 0, visualScale: 1.0,

    // ★追加: 弟子入りシステム用の器
    apprentice: {
        currentMaster: null,     // 現在弟子入りしているジャンル（'farming', 'cooking' など）
        attempts: {},            // ジャンルごとの志願回数（例: { farming: 1 }。最大3）
        rank: {},                // 免許皆伝ランク（例: { farming: 0 }。最大10）
        isExcommunicated: false, // 破門状態かどうか
        popularity: 0,           // 評価値（破門解除用のポイント）
        inventory: [],           // 支給品専用インベントリ（私的利用不可）
        learnedWords: []         // チャットで教えられて記憶した言葉
    }
};

// 互換性チェック
if (!aiPet.inventory) aiPet.inventory = [];
if (!aiPet.skills) aiPet.skills = { cooking: 0, smithing: 0 };
if (typeof aiPet.energy === 'undefined') aiPet.energy = 100;
if (typeof aiPet.hunger === 'undefined') aiPet.hunger = 100;
if (typeof aiPet.weather === 'undefined') aiPet.weather = 'sunny';
if (typeof aiPet.debtTimer === 'undefined') aiPet.debtTimer = 0;

// ★追加: 既存セーブデータロード時の「弟子入りデータ」欠損対策
if (!aiPet.apprentice) {
    aiPet.apprentice = {
        currentMaster: null, attempts: {}, rank: {}, 
        isExcommunicated: false, popularity: 0, inventory: [], learnedWords: []
    };
    // ★追加：BGM解放フラグと音量設定
    aiPet.unlockedBGMs = aiPet.unlockedBGMs || [];
    aiPet.bgmVolume = aiPet.bgmVolume !== undefined ? aiPet.bgmVolume : 0.5;
}

// 発見済みモンスターリストの初期化とチェック
if (!aiPet.discoveredMonsters) aiPet.discoveredMonsters = [];
function checkDiscovery() {
    if (!aiPet.discoveredMonsters.includes(aiPet.currentSkin)) {
        aiPet.discoveredMonsters.push(aiPet.currentSkin);
        addFloatingText(aiPet.x, aiPet.y - 50, "New Discovery!", "cyan");
        // ★修正: ここでの自動セーブを削除（初回プレイ判定を妨害するため）
        // セーブはゲーム本編が始まってから行われるようにします。
    }
}
checkDiscovery();

// ===== system.js 追加・修正 =====

// 1. 放牧用データ構造の初期化 (aiPet初期化の下あたりに追加)
let savedGrazingData = JSON.parse(localStorage.getItem('grazing_data_v1'));
let grazingData = savedGrazingData || {
    unlockedMaps: 1, // 現在解放されている放牧マップ数（最大5）
    discoveredFacilities: ['farm', 'hut'], // 本編で踏破済みの施設（初期テスト用にいくつか入れておきます）
    maps: [
        { id: 0, isInitialized: false, assets: {}, pets: [], stash: [], lastOfflineTime: Date.now() }
    ]
};

// 2. 施設踏破の記録用ヘルパー関数（後で ai_core.js から呼び出します）
window.recordDiscoveredFacility = function(facilityType) {
    if (!grazingData.discoveredFacilities.includes(facilityType)) {
        grazingData.discoveredFacilities.push(facilityType);
        saveGameData();
        console.log(`[Grazing] 放牧エディタのパレットに ${facilityType} が追加されました！`);
    }
};

aiPet.getCurrentHour = function() { 
    if (typeof this.debugHour === 'number' && this.debugHour >= 0) return this.debugHour; 
    return new Date().getHours(); 
};

aiPet.getTimePhase = function() {
    const h = this.getCurrentHour();
    if (h >= 5 && h < 10) return { id: 'morning', name: '朝', color: 'rgba(255, 200, 100, 0.1)' };
    if (h >= 10 && h < 16) return { id: 'day', name: '昼', color: 'rgba(0, 0, 0, 0)' };
    if (h >= 16 && h < 19) return { id: 'evening', name: '夕', color: 'rgba(200, 100, 50, 0.2)' };
    return { id: 'night', name: '夜', color: 'rgba(0, 0, 50, 0.5)' };
};

const weatherTypes = [
    { id: 'sunny',    name: '快晴', icon: '☀', effect: null },
    { id: 'cloudy',   name: '曇り', icon: '☁', effect: 'cloudy' },
    { id: 'rain',     name: '雨',   icon: '☔', effect: 'rain' },
    { id: 'thunder',  name: '雷',   icon: '⚡', effect: 'thunder' },
    { id: 'snow',     name: '雪',   icon: '⛄', effect: 'snow' },
    { id: 'hail',     name: 'あられ', icon: '🌨', effect: 'hail' },
    { id: 'clear',    name: '晴れ', icon: '🌤', effect: null }
];

// 3. 既存の saveGameData 関数を上書き（grazingDataの保存を追加）
function saveGameData() {
    aiPet.lastSaveTime = Date.now();
    localStorage.setItem('map_catalog_v1', JSON.stringify(catalog));
    localStorage.setItem('ai_configs_v8', JSON.stringify(aiConfigs));
    localStorage.setItem('map_data_v6', JSON.stringify(assets));
    localStorage.setItem('ai_pet_data_v1', JSON.stringify(aiPet));
    // ▼ 追加
    localStorage.setItem('grazing_data_v1', JSON.stringify(grazingData));
}

function resetGameData() {
    if(confirm("本当にデータをリセットしますか？\n(マップ配置やステータスが初期化されます)")) {
        localStorage.removeItem('map_data_v6');
        localStorage.removeItem('ai_pet_data_v1');
        localStorage.removeItem('ai_configs_v8');
        localStorage.removeItem('grazing_data_v1');
        // ★修正: リセット後、フラグを強制的に立ててからリロードする
        localStorage.setItem('force_first_play', 'true');
        location.reload();
    }
}

function getAssetKey(targetAsset) { 
    for(let k in assets) if(assets[k] === targetAsset) return k; 
    return null; 
}

function processOfflineProgression() {
    const now = Date.now(); const lastTime = aiPet.lastSaveTime; let elapsedMin = Math.floor((now - lastTime) / (1000 * 60));
    if (elapsedMin < 0) elapsedMin = 0; if (elapsedMin <= 0) return; 
    let reportLog = []; let totalTimeSpent = 0;
    const offlineHungerRate = 0.5 + (aiPet.stats.power * 0.005); const offlineEnergyRate = 0.5;

    while (elapsedMin > 0 && aiPet.schedule.length > 0) {
        if (aiPet.energy <= 5 || aiPet.hunger <= 5) { reportLog.push("⛔ [中断] 限界で動けませんでした..."); break; }
        const task = aiPet.schedule[0]; const spend = Math.min(task.duration, elapsedMin);
        task.duration -= spend; elapsedMin -= spend; totalTimeSpent += spend;

        if (task.type !== 'project') {
            if (task.type !== 'rest') { aiPet.energy -= spend * offlineEnergyRate; aiPet.hunger -= spend * offlineHungerRate; } 
            else { 
                const effData = (typeof getActionEfficiency !== 'undefined') ? getActionEfficiency('rest') : {rate:1};
                aiPet.energy += spend * 1.0 * effData.rate; aiPet.hunger -= spend * 0.2; 
            }
        }
        
        if (task.duration <= 0) aiPet.schedule.shift();
    }
    
    if (aiPet.gold < 0) {
        aiPet.debtTimer += Math.floor(totalTimeSpent); 
    } else {
        aiPet.debtTimer = 0;
    }

    if (totalTimeSpent > 0 && document.getElementById('reportOverlay')) {
        const contentEl = document.getElementById('reportContent'); 
        const overlayEl = document.getElementById('reportOverlay');
        if (contentEl && overlayEl) { 
            contentEl.innerText = `経過時間: ${totalTimeSpent}分\n(オフライン進行しました)`; 
            overlayEl.classList.add('active'); 
        }
    }
    aiPet.lastSaveTime = Date.now(); saveGameData();
}

function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2); 
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportAIConfig() {
    downloadJSON(aiConfigs, "ai_config_export.json");
    alert("AI設定をダウンロードしました。");
}

function exportMapData() {
    downloadJSON(assets, "map_data_export.json");
    alert("マップデータをダウンロードしました。");
}

function exportCatalogData() {
    downloadJSON(catalog, "catalog_data_export.json");
    alert("カタログデータ（画像設定）をダウンロードしました。\n内容を data.js の defaultCatalog に上書きしてください。");
}

function importGameData(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.robot && data.robot.actions) {
                aiConfigs = data;
                localStorage.setItem('ai_configs_v8', JSON.stringify(aiConfigs));
                alert("AI設定データを読み込みました！");
            } else if (Object.keys(data).some(k => k.startsWith('bg_') || k.startsWith('mountain'))) {
                assets = data;
                localStorage.setItem('map_data_v6', JSON.stringify(assets));
                alert("マップデータを読み込みました！");
            } else { alert("不明なデータ形式です。"); }
            if(typeof createPalette === 'function') createPalette();
            if(typeof switchMode === 'function') switchMode(currentMode); 
        } catch(err) { alert("読み込みエラー: " + err); }
    };
    reader.readAsText(file);
    inputElement.value = "";
}

// --- 追加: 性格診断と初期設定ロジック (全11種族対応版) ---
// ★修正: 11種族すべての初期スコアを0で定義
let personalityScores = {
    robot: 0, spirit: 0, magician: 0, machine: 0, stone: 0, 
    ghost: 0, seed: 0, bird: 0, balloon: 0, dragon: 0, beetle: 0
};
let currentQuestionIndex = 0;
let determinedSkin = 'robot';
window.isGamePaused = false; 

window.startPersonalityTest = function() {
    // ==========================================
    // ★追加：タイトルBGMを止めて、性格診断BGMをループ再生！
    // ==========================================
    if (window.audioManager) {
        if (window.audioManager.stopTitleMusic) window.audioManager.stopTitleMusic();
        if (window.audioManager.playBGM) window.audioManager.playBGM('personality');
    }

    window.isGamePaused = true;
    // スコアリセット
    for (let key in personalityScores) personalityScores[key] = 0;
    currentQuestionIndex = 0;
    document.getElementById('questionOverlay').classList.add('active');
    document.getElementById('resultOverlay').classList.remove('active');
    showQuestion();
};

function showQuestion() {
    const q = personalityQuestions[currentQuestionIndex];
    document.getElementById('question-text').innerText = q.text;
    document.getElementById('question-progress').innerText = `${currentQuestionIndex + 1} / ${personalityQuestions.length}`;
    
    const choicesDiv = document.getElementById('question-choices');
    choicesDiv.innerHTML = "";
    
    q.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.style.padding = "15px 20px";
        btn.style.fontSize = "16px";
        btn.style.background = "#333";
        btn.style.textAlign = "left";
        btn.style.border = "1px solid #555";
        btn.innerText = choice.text;
        btn.onmouseover = () => btn.style.background = "#444";
        btn.onmouseout = () => btn.style.background = "#333";
        // 選択時にポイントオブジェクトを渡す
        btn.onclick = () => answerQuestion(choice.points);
        choicesDiv.appendChild(btn);
    });
}

function answerQuestion(points) {
    // ★修正: 渡されたポイントオブジェクトの中身をそれぞれ加算する
    for (let species in points) {
        if (personalityScores[species] !== undefined) {
            personalityScores[species] += points[species];
        }
    }
    
    currentQuestionIndex++;
    if (currentQuestionIndex < personalityQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('questionOverlay').classList.remove('active');
    
    let maxScore = -1;
    let bestTypes = []; // 同点だった場合の候補リスト

    // ★修正: 11種族の中で最高得点を持つ種族を探す
    for (const [type, score] of Object.entries(personalityScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestTypes = [type]; // リストをリセットして追加
        } else if (score === maxScore) {
            bestTypes.push(type); // 同点なら候補に追加
        }
    }
    
    // 同点が複数いる場合はランダムで1つ決定
    determinedSkin = bestTypes[Math.floor(Math.random() * bestTypes.length)];
    console.log(`[性格診断結果] 最終スコア:`, personalityScores);
    console.log(`[性格診断結果] 決定種族: ${determinedSkin} (スコア: ${maxScore})`);

    const data = typeof monsterBookData !== 'undefined' && monsterBookData[determinedSkin] ? monsterBookData[determinedSkin] : { name: determinedSkin, desc: "未知の存在です。" };
    
    const resultNameEl = document.getElementById('result-name');
    if(resultNameEl) resultNameEl.innerText = data.name;
    const resultDescEl = document.getElementById('result-desc');
    if(resultDescEl) resultDescEl.innerText = data.desc;
    
    const canvas = document.getElementById('resultCanvas');
    if (canvas && typeof drawStatusIconOnCanvas === 'function') {
        drawStatusIconOnCanvas(canvas, determinedSkin);
    }
    
    document.getElementById('resultOverlay').classList.add('active');
}

window.confirmInitialPet = function() {
    document.getElementById('resultOverlay').classList.remove('active');
    window.isGamePaused = true; 
    
    if (window.audioManager && window.audioManager.stopBGM) {
        window.audioManager.stopBGM();
    }

    // ==========================================
    // ★究極修正1：これが「完全なニューゲーム」か「引継ぎ中」かを判定する！
    // ==========================================
    const isNGPlus = !!window.pendingInheritanceData;

    document.body.classList.add('is-naming');
    if (!document.getElementById('naming-shield-css')) {
        const style = document.createElement('style');
        style.id = 'naming-shield-css';
        style.innerHTML = `
            body.is-naming .overlay.active { display: none !important; }
            body.is-naming #playerNameOverlay.active { display: flex !important; z-index: 999999 !important; }
        `;
        document.head.appendChild(style);
    }

    if (window.aiPet) {
        window.aiPet.gold = 0;
        window.aiPet.age = 0;

        // ★究極修正2：「完全なニューゲーム」の時だけ歴史を白紙にする！
        if (!isNGPlus) {
            window.aiPet.discoveredMonsters = [];
            window.aiPet.unlockedBGMs = [];
            window.aiPet.generation = 1;
        }
        
        window.aiPet.apprentice = {
            learnedWords: [], rank: {}, attempts: {}, metMasters: [], retired: {}
        };
    }
    
    if (typeof party !== 'undefined') window.party = [];
    
    if (typeof assets !== 'undefined') {
        for (let k in assets) delete assets[k]; 
        if (typeof generateNatureMap === 'function') {
            let newMap = generateNatureMap();
            for (let k in newMap) { assets[k] = newMap[k]; }
        }
    }
    
    window.playerName = null;
    window.isLoggedIn = false;
    
    if (typeof applyInitialPet === 'function') applyInitialPet(determinedSkin);
    
    let petKey = determinedSkin || 'robot';
    if (window.aiPet) {
        window.aiPet.currentSkin = petKey;
        window.aiPet.type = petKey;
        window.aiPet.visualAction = 'idle'; 
        if (typeof camera !== 'undefined') camera.target = window.aiPet; 
        
        window.isNamingPhase = true;
        const originalUpdate = window.aiPet.update;
        window.aiPet.update = function(dt) {
            if (window.isNamingPhase) return; 
            if (originalUpdate) originalUpdate.call(this, dt);
        };
    }
    
    if (!window.images) window.images = {};
    if (!window.images[petKey] || !window.images[petKey].complete) {
        window.images[petKey] = new Image();
        let srcPath = (window.dynamicImageCatalog && window.dynamicImageCatalog[petKey]) 
                    ? window.dynamicImageCatalog[petKey] 
                    : petKey + '.png';
        window.images[petKey].src = srcPath;
    }

    saveGameData();

    window.isGamePaused = false;
    if (typeof switchMode === 'function') switchMode('play');
    
    const els = ['canvas-wrapper', 'aiStatus', 'info-column', 'gameControls'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) { 
            el.style.display = ''; // ★究極修正3：隠れていたゲーム画面を確実に復元する
            el.style.opacity = '0'; 
            el.style.pointerEvents = 'none'; 
        }
    });
    
    setTimeout(() => {
        els.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.transition = 'opacity 2.5s ease-in-out';
                setTimeout(() => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }, 50); 
            }
        });
        
        setTimeout(() => {
            if (typeof checkLoginBonus === 'function') checkLoginBonus();
            
            // ★究極修正4：引継ぎ（NG+）なら絶対に名前入力をスキップする！
            if (isNGPlus || localStorage.getItem('my_player_name')) {
                document.body.classList.remove('is-naming');
                window.isNamingPhase = false;
            } else {
                if (typeof openNameInputUI === 'function') {
                    openNameInputUI();
                } else {
                    let overlay = document.getElementById('playerNameOverlay');
                    if(overlay) overlay.classList.add('active');
                }
            }
        }, 2500);
    }, 100);

    if (typeof window.updateTcgButtonAppearance === 'function') window.updateTcgButtonAppearance();
};

function applyInitialPet(skinKey) {
    const baseStats = initialBaseStats[skinKey] || { intel: 10, power: 10, mood: 100 };
    const traitData = charaTraits[skinKey] || charaTraits['robot'];
    
    // ==========================================
    // ★追加: 描画エンジンのために必要なプロパティと物理サイズを補完！
    // ==========================================
    aiPet.type = skinKey; 
    aiPet.skin = skinKey; 
    
    // ★修正：再生はせず、BGMの解放（音楽館への登録）と音量の初期化のみ行う
    aiPet.unlockedBGMs = aiPet.unlockedBGMs || [];
    if (!aiPet.unlockedBGMs.includes(skinKey)) {
        aiPet.unlockedBGMs.push(skinKey);
    }
    aiPet.bgmVolume = aiPet.bgmVolume !== undefined ? aiPet.bgmVolume : 0.5;

    aiPet.baseType = skinKey;
    aiPet.currentSkin = skinKey;
    aiPet.x = 400; // 画面中央X
    aiPet.y = 240; // 画面中央Y
    aiPet.sw = 50; // 幅
    aiPet.sh = 50; // 高さ
    // ==========================================

    aiPet.stats = { intel: baseStats.intel, power: baseStats.power, mood: baseStats.mood, speed: baseStats.speed || 10 };
    aiPet.energy = 100;
    aiPet.hunger = 100;
    aiPet.age = 0;
    aiPet.lifespan = traitData.lifespan || 100;
    aiPet.isSick = false; // 病気フラグ
    aiPet.darknessCounter = 0;       // 闇落ちポイント
    aiPet.consecutiveSleepCount = 0; // 連続睡眠カウント
    
    // 新しい人生が始まる時に、前世の記憶や履歴を完全に消去する！
    aiPet.apprentice = {
        currentMaster: null, attempts: {}, rank: {}, 
        isExcommunicated: false, popularity: 0, inventory: [], learnedWords: []
    };
    aiPet.actionHistory = { study: 0, train: 0, work: 0, rest: 0, care: 0, free: 0 };
    aiPet.skills = { cooking: 1, smithing: 1, building: 1 };
    aiPet.inventory = [];
    aiPet.schedule = [];
    aiPet.actionState = 'idle';
    aiPet.visualAction = 'idle'; // ★修正: nullだと描画されないため'idle'に
    aiPet.isReincarnating = false; 
    
    if (!aiPet.discoveredMonsters) aiPet.discoveredMonsters = [];
    if (!aiPet.discoveredMonsters.includes(skinKey)) {
        aiPet.discoveredMonsters.push(skinKey);
    }
}