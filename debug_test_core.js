// debug_test_core.js : 通常セーブを保護した再現可能な開発テスト環境
(function() {
    'use strict';

    const DB_NAME = 'game_debug_test_environment_v1';
    const DB_VERSION = 1;
    const STORE_NAME = 'snapshots';
    const MAIN_SNAPSHOT_ID = 'main-save';
    const CHECKPOINT_ID = 'test-checkpoint';
    const SESSION_KEY = 'debug_test_session_v1';

    // プレイヤーID・名前・フレンド・音量等はテスト状態と切り離し、ゲーム進行だけを退避する。
    const TRACKED_KEYS = [
        'map_catalog_v1',
        'ai_configs_v8',
        'map_data_v6',
        'ai_pet_data_v1',
        'ai_pet_data',
        'ai_legacy_data',
        'grazing_data_v1',
        'tcg_data_v1',
        'ai_pet_chat_history',
        'daily_quests',
        'last_login_date',
        'rescue_waiting_map',
        'rescue_waiting_floor',
        'tcg_tutorial_done_v2',
        'memory_tutorial_done_v1',
        'tcg_card_tutorial_done_v3',
        'online_tutorial_login_verified_v1',
        'game_tutorial_archive_v1',
        'force_first_play',
        'trigger_fade_in',
        'skip_tutorial',
        'visiting_player_id'
    ];
    const TRACKED_PREFIXES = ['unlocked_cards_gen_'];

    const SCENARIOS = {
        explore_rank3_start: {
            label: '冒険家 Rank 3：木材・石 0 / 5',
            rank: 3,
            stats: { power: 25, speed: 25, intel: 10, beauty: 10 },
            preload: []
        },
        explore_rank3_almost: {
            label: '冒険家 Rank 3：木材・石 4 / 5',
            rank: 3,
            stats: { power: 25, speed: 25, intel: 10, beauty: 10 },
            preload: ['wood', 'wood', 'wood', 'wood', 'stone', 'stone', 'stone', 'stone']
        },
        explore_rank8_start: {
            label: '冒険家 Rank 8：深層素材 0 / 3',
            rank: 8,
            stats: { power: 55, speed: 55, intel: 30, beauty: 20 },
            preload: []
        }
    };

    function readSession() {
        try {
            const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
            return parsed && parsed.active ? parsed : null;
        } catch (error) {
            console.warn('[Debug Test] セッション情報を読み込めませんでした。', error);
            return null;
        }
    }

    function writeSession(session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function getRuntimePet() {
        try {
            if (typeof aiPet !== 'undefined' && aiPet) return aiPet;
        } catch (error) {}
        return window.aiPet || null;
    }

    function saveRuntimeState() {
        try {
            if (typeof saveGameData === 'function') {
                saveGameData();
                return;
            }
        } catch (error) {
            console.warn('[Debug Test] 通常セーブ関数の呼び出しに失敗しました。', error);
        }
        if (typeof window.saveGameData === 'function') window.saveGameData();
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB が利用できません。'));
                return;
            }
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('テスト用データベースを開けませんでした。'));
        });
    }

    async function writeSnapshot(id, snapshot) {
        const db = await openDatabase();
        try {
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put({ id, snapshot });
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error || new Error('退避データを書き込めませんでした。'));
                tx.onabort = () => reject(tx.error || new Error('退避データの書き込みが中断されました。'));
            });
        } finally {
            db.close();
        }
    }

    async function readSnapshot(id) {
        const db = await openDatabase();
        try {
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const request = tx.objectStore(STORE_NAME).get(id);
                request.onsuccess = () => resolve(request.result ? request.result.snapshot : null);
                request.onerror = () => reject(request.error || new Error('退避データを読み込めませんでした。'));
            });
        } finally {
            db.close();
        }
    }

    async function deleteSnapshot(id) {
        const db = await openDatabase();
        try {
            await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).delete(id);
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error || new Error('退避データを削除できませんでした。'));
            });
        } finally {
            db.close();
        }
    }

    function isTrackedPrefix(key) {
        return TRACKED_PREFIXES.some(prefix => key.startsWith(prefix));
    }

    function captureGameState() {
        const values = {};
        TRACKED_KEYS.forEach(key => {
            values[key] = localStorage.getItem(key);
        });
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && isTrackedPrefix(key)) values[key] = localStorage.getItem(key);
        }
        return {
            version: 1,
            capturedAt: Date.now(),
            values
        };
    }

    function restoreGameState(snapshot) {
        if (!snapshot || snapshot.version !== 1 || !snapshot.values) throw new Error('退避データの形式が不正です。');

        // テスト中に新しく作られた世代別キーを先に消してから、退避時点を復元する。
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && isTrackedPrefix(key)) localStorage.removeItem(key);
        }

        TRACKED_KEYS.forEach(key => {
            const value = Object.prototype.hasOwnProperty.call(snapshot.values, key) ? snapshot.values[key] : null;
            if (value === null || value === undefined) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        });
        Object.keys(snapshot.values).forEach(key => {
            if (isTrackedPrefix(key) && snapshot.values[key] !== null) localStorage.setItem(key, snapshot.values[key]);
        });
    }

    function getItemId(item) {
        return typeof item === 'string' ? item : (item && typeof item.id === 'string' ? item.id : '');
    }

    function getExploreQuestDefinition(rank) {
        const pet = getRuntimePet();
        if (pet && typeof pet.getMasterQuestData === 'function') {
            const definition = pet.getMasterQuestData('explore', rank);
            if (definition) return definition;
        }
        const fallback = {
            3: { name: 'はじめての探索', desc: '森や山を「探検」して、木材を5つ、石を5つ集めてこよう。' },
            8: { name: '秘境の至宝', desc: '深層でしか採れない、良質な木材を3つ、硬い石を3つ集めてこよう。' }
        };
        return fallback[rank];
    }

    function ensureExploreTargets() {
        let map;
        try {
            map = JSON.parse(localStorage.getItem('map_data_v6') || 'null');
        } catch (error) {
            map = null;
        }
        if (!map || typeof map !== 'object') {
            if (typeof generateNatureMap !== 'function') return;
            map = generateNatureMap();
        }

        const entries = Object.entries(map);
        const isForest = ([key, asset]) => asset && (key.startsWith('palms') || (asset.name && asset.name.includes('森')));
        const isMountain = ([key, asset]) => asset && (key.startsWith('mountain') || (asset.name && asset.name.includes('山')));
        const missingForest = !entries.some(isForest);
        const missingMountain = !entries.some(isMountain);

        if ((missingForest || missingMountain) && typeof generateNatureMap === 'function') {
            const freshEntries = Object.entries(generateNatureMap());
            const addTarget = (predicate, suffix) => {
                const found = freshEntries.find(predicate);
                if (!found) return;
                const key = `debug_test_${suffix}_${Date.now()}`;
                map[key] = Object.assign({}, found[1], { id: key });
            };
            if (missingForest) addTarget(isForest, 'forest');
            if (missingMountain) addTarget(isMountain, 'mountain');
        }
        localStorage.setItem('map_data_v6', JSON.stringify(map));
    }

    function applyScenarioToStoredSave(scenarioId) {
        const scenario = SCENARIOS[scenarioId];
        if (!scenario) throw new Error('指定された再現条件が見つかりません。');

        let pet;
        try {
            pet = JSON.parse(localStorage.getItem('ai_pet_data_v1') || 'null');
        } catch (error) {
            pet = null;
        }
        if (!pet) {
            const runtimePet = getRuntimePet();
            if (runtimePet) pet = JSON.parse(JSON.stringify(runtimePet));
        }
        if (!pet) throw new Error('プレイヤーのセーブデータがありません。先に一度ゲームを開始してください。');

        pet.apprentice = pet.apprentice || {};
        pet.apprentice.rank = pet.apprentice.rank || {};
        pet.apprentice.retired = pet.apprentice.retired || {};
        pet.apprentice.learnedWords = Array.isArray(pet.apprentice.learnedWords) ? pet.apprentice.learnedWords : [];
        pet.apprentice.metMasters = Array.isArray(pet.apprentice.metMasters) ? pet.apprentice.metMasters : [];
        pet.apprentice.activeQuests = Array.isArray(pet.apprentice.activeQuests) ? pet.apprentice.activeQuests : [];

        pet.apprentice.currentMaster = 'explore';
        pet.apprentice.rank.explore = scenario.rank;
        delete pet.apprentice.retired.explore;
        delete pet.apprentice.lifePath;
        pet.apprentice.isGraduated = false;
        pet.apprentice.qVal = 0;
        ['探検', '森', '山', '冒険家'].forEach(word => {
            if (!pet.apprentice.learnedWords.includes(word)) pet.apprentice.learnedWords.push(word);
        });
        if (!pet.apprentice.metMasters.includes('explore')) pet.apprentice.metMasters.push('explore');
        pet.apprentice.activeQuests = pet.apprentice.activeQuests.filter(quest => !quest || quest.masterType !== 'explore');

        const quest = getExploreQuestDefinition(scenario.rank);
        if (!quest) throw new Error(`冒険家 Rank ${scenario.rank} の課題定義が見つかりません。`);
        pet.apprentice.activeQuests.push({
            name: quest.name,
            desc: quest.desc,
            rank: scenario.rank,
            masterType: 'explore',
            qVal: 0
        });

        pet.stats = pet.stats || {};
        Object.assign(pet.stats, scenario.stats, { mood: 100 });
        pet.energy = 100;
        pet.hunger = 100;
        pet.godMode = false;
        pet.debugExploreDropMode = 'normal';
        delete pet.debugForceNextAutonomousExplore;
        delete pet.lastDebugAutonomousExploreResult;
        pet.conditions = { cold: false, stomachache: false, poisoning: false };
        pet.buffs = { focus: 0, tough: 0 };
        pet.weather = 'sunny';
        pet.debugHour = 12;
        pet.schedule = [];
        pet.pathQueue = [];
        pet.actionState = 'idle';
        pet.visualAction = 'idle';
        pet.interactionTarget = null;
        pet.indoorTarget = null;
        pet.isIndoors = false;
        pet.exploreState = { depth: 0, maxDepth: 0, currentFacility: null };

        const scenarioItems = new Set(['wood', 'stone', 'high_wood', 'high_stone']);
        pet.inventory = (Array.isArray(pet.inventory) ? pet.inventory : []).filter(item => !scenarioItems.has(getItemId(item)));
        scenario.preload.forEach(itemId => pet.inventory.push(itemId));
        pet.message = `テスト条件「${scenario.label}」を開始しました。`;
        pet.messageTimer = 240;
        pet.debugTestScenario = scenarioId;
        pet.lastSaveTime = Date.now();

        localStorage.setItem('ai_pet_data_v1', JSON.stringify(pet));
        ensureExploreTargets();
    }

    function setControlsBusy(isBusy) {
        ['dbg-test-start', 'dbg-test-autonomous-explore', 'dbg-test-checkpoint-save', 'dbg-test-checkpoint-load', 'dbg-test-restore'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = isBusy;
        });
    }

    function formatTimestamp(value) {
        if (!value) return 'なし';
        try {
            return new Date(value).toLocaleString('ja-JP');
        } catch (error) {
            return '不明';
        }
    }

    async function renderStatus() {
        const status = document.getElementById('dbg-test-status');
        const session = readSession();
        let mainSnapshot = null;
        let checkpoint = null;
        try {
            [mainSnapshot, checkpoint] = await Promise.all([
                readSnapshot(MAIN_SNAPSHOT_ID),
                readSnapshot(CHECKPOINT_ID)
            ]);
        } catch (error) {
            console.warn('[Debug Test] 状態確認に失敗しました。', error);
        }

        if (status) {
            if (session) {
                const scenario = SCENARIOS[session.scenarioId];
                status.style.borderLeftColor = mainSnapshot ? '#FF9800' : '#F44336';
                status.innerHTML = `<strong style="color:#FFB74D;">テスト中</strong><br>`
                    + `条件: ${scenario ? scenario.label : '保存した再開地点'}<br>`
                    + `通常セーブ退避: ${mainSnapshot ? formatTimestamp(mainSnapshot.capturedAt) : '見つかりません'}<br>`
                    + `再開地点: ${checkpoint ? formatTimestamp(checkpoint.capturedAt) : '未保存'}`;
            } else {
                status.style.borderLeftColor = '#607D8B';
                status.innerHTML = '<strong>通常プレイ中</strong><br>テスト開始時に、現在の通常セーブを自動退避します。';
            }
        }

        const loadButton = document.getElementById('dbg-test-checkpoint-load');
        if (loadButton) loadButton.disabled = !session || !checkpoint;
        const saveButton = document.getElementById('dbg-test-checkpoint-save');
        if (saveButton) saveButton.disabled = !session;
        const restoreButton = document.getElementById('dbg-test-restore');
        if (restoreButton) restoreButton.disabled = !session || !mainSnapshot;
        const autonomousButton = document.getElementById('dbg-test-autonomous-explore');
        if (autonomousButton) autonomousButton.disabled = !session;
        const autonomousStatus = document.getElementById('dbg-test-autonomous-status');
        if (autonomousStatus) {
            const pet = getRuntimePet();
            const result = pet && pet.lastDebugAutonomousExploreResult;
            const statusLabels = {
                queued: '自律判断から探検予定を追加しました',
                blocked_resources: '体力・満腹度不足で自律行動を見送りました',
                blocked_word: '「探検」を未学習のため見送りました',
                blocked_qualification: '冒険家資格がないため見送りました'
            };
            autonomousStatus.textContent = `実行結果: ${result ? (statusLabels[result.status] || result.status) : '未実行'}`;
        }
        renderBanner();
    }

    function renderBanner() {
        const session = readSession();
        let banner = document.getElementById('debug-test-mode-banner');
        if (!session) {
            if (banner) banner.remove();
            return;
        }
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'debug-test-mode-banner';
            banner.style.cssText = 'position:fixed; top:8px; left:50%; transform:translateX(-50%); z-index:1000000; background:rgba(230,81,0,.96); color:white; border:2px solid #FFE0B2; border-radius:7px; padding:7px 10px; font:700 12px sans-serif; box-shadow:0 3px 12px rgba(0,0,0,.45); display:flex; gap:10px; align-items:center;';
            banner.innerHTML = '<span>🧪 保護テスト中（通常セーブは退避済み）</span><button type="button" style="background:white; color:#BF360C; border:none; border-radius:4px; padding:4px 8px; font-weight:bold; cursor:pointer;">通常セーブへ戻る</button>';
            banner.querySelector('button').addEventListener('click', () => window.restoreDebugMainSave());
            document.body.appendChild(banner);
        }
    }

    window.isDebugTestModeActive = function() {
        return !!readSession();
    };

    window.startDebugTestScenario = async function(scenarioId) {
        const select = document.getElementById('dbg-test-scenario');
        const selectedId = scenarioId || (select ? select.value : 'explore_rank3_start');
        const scenario = SCENARIOS[selectedId];
        if (!scenario) {
            alert('再現条件を選択してください。');
            return;
        }

        const currentSession = readSession();
        const message = currentSession
            ? `現在のテスト進行を破棄し、「${scenario.label}」へ切り替えます。よろしいですか？`
            : `現在の通常セーブを保護して、「${scenario.label}」を開始します。よろしいですか？`;
        if (!confirm(message)) return;

        setControlsBusy(true);
        let rollbackSnapshot = null;
        try {
            let mainSnapshot;
            // 途中で失敗しても、開始ボタンを押す直前の状態まで戻せるよう先に控える。
            saveRuntimeState();
            rollbackSnapshot = captureGameState();
            if (currentSession) {
                mainSnapshot = await readSnapshot(MAIN_SNAPSHOT_ID);
                if (!mainSnapshot) throw new Error('通常セーブの退避データが見つからないため、条件を切り替えられません。');
            } else {
                mainSnapshot = rollbackSnapshot;
                await writeSnapshot(MAIN_SNAPSHOT_ID, mainSnapshot);
            }

            // 条件切替時も必ず元の通常セーブを土台にし、前回テストの残留を防ぐ。
            restoreGameState(mainSnapshot);
            applyScenarioToStoredSave(selectedId);
            writeSession({
                version: 1,
                active: true,
                scenarioId: selectedId,
                startedAt: currentSession ? currentSession.startedAt : Date.now(),
                appliedAt: Date.now()
            });
            window.location.reload();
        } catch (error) {
            console.error('[Debug Test] テスト開始に失敗しました。', error);
            if (rollbackSnapshot) {
                try {
                    restoreGameState(rollbackSnapshot);
                } catch (rollbackError) {
                    console.error('[Debug Test] 開始前状態へのロールバックにも失敗しました。', rollbackError);
                }
            }
            alert(`テストを開始できませんでした。\n${error.message || error}`);
            setControlsBusy(false);
            await renderStatus();
        }
    };

    window.runDebugAutonomousExploreTest = function() {
        if (!readSession()) {
            alert('自律探検の固定実行は保護テスト中だけ使用できます。');
            return;
        }
        const pet = getRuntimePet();
        if (!pet || typeof pet.performIdleAction !== 'function') {
            alert('自律行動を実行できる状態ではありません。');
            return;
        }
        if (pet.schedule && pet.schedule.length > 0) {
            if (!confirm('現在の予定を消して、自律探検の検証を始めます。よろしいですか？')) return;
        }

        pet.schedule = [];
        pet._stashedTasks = [];
        pet.pathQueue = [];
        pet.currentTask = null;
        pet.actionState = 'idle';
        pet.visualAction = null;
        pet.isIndoors = false;
        pet.indoorTarget = null;
        pet.interactionTarget = null;
        pet.exploreState = null;
        pet.exploreTimer = 0;
        pet.visualScale = 1.0;
        pet.debugForceNextAutonomousExplore = true;
        pet.lastDebugAutonomousExploreResult = { status: 'armed', checkedAt: Date.now() };

        const overlay = document.getElementById('debugOverlay');
        if (overlay) overlay.classList.remove('active');
        if (typeof switchMode === 'function') switchMode('play');

        setTimeout(() => {
            pet.performIdleAction();
            saveRuntimeState();
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        }, 50);
    };

    window.saveDebugTestCheckpoint = async function() {
        if (!readSession()) {
            alert('再開地点はテスト中だけ保存できます。');
            return;
        }
        setControlsBusy(true);
        try {
            saveRuntimeState();
            const snapshot = captureGameState();
            await writeSnapshot(CHECKPOINT_ID, snapshot);
            const session = readSession();
            if (session) {
                session.checkpointAt = snapshot.capturedAt;
                writeSession(session);
            }
            alert('現在のテスト状態を再開地点として保存しました。');
        } catch (error) {
            console.error('[Debug Test] 再開地点を保存できませんでした。', error);
            alert(`再開地点を保存できませんでした。\n${error.message || error}`);
        } finally {
            setControlsBusy(false);
            await renderStatus();
        }
    };

    window.loadDebugTestCheckpoint = async function() {
        const session = readSession();
        if (!session) {
            alert('テスト中ではありません。');
            return;
        }
        if (!confirm('現在のテスト進行を破棄して、保存した再開地点へ戻します。よろしいですか？')) return;

        setControlsBusy(true);
        try {
            const snapshot = await readSnapshot(CHECKPOINT_ID);
            if (!snapshot) throw new Error('保存した再開地点がありません。');
            restoreGameState(snapshot);
            session.scenarioId = 'checkpoint';
            session.appliedAt = Date.now();
            writeSession(session);
            window.location.reload();
        } catch (error) {
            console.error('[Debug Test] 再開地点を復元できませんでした。', error);
            alert(`再開地点へ戻せませんでした。\n${error.message || error}`);
            setControlsBusy(false);
            await renderStatus();
        }
    };

    window.restoreDebugMainSave = async function() {
        const session = readSession();
        if (!session) {
            alert('テスト中ではありません。');
            return;
        }
        if (!confirm('テスト中の進行を破棄し、退避した通常セーブへ戻ります。よろしいですか？')) return;

        setControlsBusy(true);
        try {
            const mainSnapshot = await readSnapshot(MAIN_SNAPSHOT_ID);
            if (!mainSnapshot) throw new Error('通常セーブの退避データが見つかりません。現在のデータは変更していません。');
            restoreGameState(mainSnapshot);
            localStorage.removeItem(SESSION_KEY);
            try {
                await deleteSnapshot(CHECKPOINT_ID);
                await deleteSnapshot(MAIN_SNAPSHOT_ID);
            } catch (cleanupError) {
                // 通常セーブとセッション解除は完了済み。残った退避コピーは次回開始時に上書きされる。
                console.warn('[Debug Test] 退避コピーの後片付けだけに失敗しました。', cleanupError);
            }
            window.location.reload();
        } catch (error) {
            console.error('[Debug Test] 通常セーブを復元できませんでした。', error);
            alert(`通常セーブへ戻せませんでした。\n${error.message || error}`);
            setControlsBusy(false);
            await renderStatus();
        }
    };

    const originalLoadDebugData = window.loadDebugData;
    if (typeof originalLoadDebugData === 'function') {
        window.loadDebugData = function() {
            originalLoadDebugData.apply(this, arguments);
            renderStatus();
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderBanner();
            renderStatus();
        });
    } else {
        renderBanner();
        renderStatus();
    }
})();
