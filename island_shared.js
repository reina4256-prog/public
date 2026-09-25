// Shared legacy island generation and BGM. No save loading or life update loop.
window.audioManager = {
    currentAudio: null,
    currentBGMType: null,
    isPlayingTitle: false,

    getVolume: function() {
        if (window.GameSettings && typeof window.GameSettings.getBgmVolume === 'function') {
            return window.GameSettings.getBgmVolume();
        }
        return (typeof aiPet !== 'undefined' && aiPet.bgmVolume !== undefined) ? aiPet.bgmVolume : 0.5;
    },

    unlockBGM: function(trackKey) {
        if (typeof window.aiPet === 'undefined') return;
        if (!window.aiPet.unlockedBGMs) window.aiPet.unlockedBGMs = [];
        if (!window.aiPet.unlockedBGMs.includes(trackKey)) {
            window.aiPet.unlockedBGMs.push(trackKey);
            if (typeof window.saveGameData === 'function') window.saveGameData();
        }
    },

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
        this.currentAudio.volume = this.getVolume();

        let playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => this.unlockBGM(trackKey))
                .catch(e => console.log("[BGM] タイトル曲の自動再生待機中:", e));
        } else {
            this.unlockBGM(trackKey);
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
    playBGM: function(type, options) {
        options = options && typeof options === 'object' ? options : {};
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
        this.currentAudio.loop = options.loop !== false;
        this.currentAudio.volume = this.getVolume();
        let targetAudioRef = this.currentAudio; // ★追加：今のオーディオ参照を記憶しておく
        if (!targetAudioRef.loop) {
            targetAudioRef.addEventListener('ended', () => {
                if (this.currentAudio !== targetAudioRef) return;
                this.currentAudio = null;
                this.currentBGMType = null;
                if (typeof options.onEnded === 'function') options.onEnded();
            }, { once: true });
        }

        let playPromise = targetAudioRef.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => this.unlockBGM(type))
                .catch(e => {
                    // ★大修正：曲の連続切り替えによる意図的な中断（AbortError）は正常な挙動なので無視する！
                    if (e.name === 'AbortError') return;

                    console.log(`[BGM] ユーザー操作待ち、または再生エラーのため保留しました: ${e.name}`);

                    // ★大修正：エラーが起きた曲が「今まさに管理している最新の曲」である場合のみnullにする（多重再生バグ防止）
                    if (this.currentAudio === targetAudioRef) {
                        this.currentAudio = null;
                        this.currentBGMType = null;
                    }
                });
        } else {
            this.unlockBGM(type);
        }
    },
    
    stopBGM: function() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    },
    
    setVolume: function(v) {
        const volume = Math.max(0, Math.min(1, Number(v) || 0));
        if (window.GameSettings && typeof window.GameSettings.setBgmVolume === 'function') {
            window.GameSettings.setBgmVolume(volume);
            return;
        }
        if (typeof aiPet !== 'undefined') aiPet.bgmVolume = volume;
        if (this.currentAudio) this.currentAudio.volume = volume;
    },
    
    restoreMainBGM: function() {
        // ==========================================
        // ★絶対防波堤：ダンジョン探索中は、裏で育成タイマーが動いていても絶対に育成BGMの乱入を許さない！
        // ==========================================
        if (typeof window.DUNGEON_STATE !== 'undefined' && window.DUNGEON_STATE.active) {
            return;
        }

        if (typeof window.DEFENSE_STATE !== 'undefined' && window.DEFENSE_STATE.isEmergency) {
            this.playBGM('defense_start');
            return;
        }
        if (typeof aiPet !== 'undefined' && aiPet.type) {
            this.playBGM(aiPet.type);
        }
    }
};

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

    // ★追加: 薬剤師との出会い用に、メインエリアに薬局を1つ確定配置
    spawnObjects({ pharmacy: 1 }, 'main');

    // レアエリア（川を渡った先）: 洞窟、クリスタル、少数の森・山を配置
    spawnObjects({ skull: 1, crystal: 2, mountain: 1, palms: 1 }, 'rare');

    // ★修正: 確定配置した薬局に「師匠の拠点」としてのフラグを付与する
    for (let k in newAssets) {
        // type ではなく name で確実に捕まえて書き換える
        if (newAssets[k].name === '薬局') {
            newAssets[k].type = 'pharmacy';
            newAssets[k].isMasterShop = true;
            newAssets[k].masterType = 'pharmacist';
        }
    }

    window.DemoRules?.hideFacilities(newAssets, true);
    return newAssets;
}
