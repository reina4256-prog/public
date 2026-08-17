// Firebaseの最新モジュールをインターネット(CDN)から直接読み込む
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// ★修正：getDoc（データを読み込む部品）を追加しました
import { getFirestore, doc, setDoc, getDocs, getDoc, collection, query, where, orderBy, limit, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRumWspj5cJVyAMGqeZOtptQntL1oJasE",
  authDomain: "ai-pet-game.firebaseapp.com",
  projectId: "ai-pet-game",
  storageBucket: "ai-pet-game.firebasestorage.app",
  messagingSenderId: "748216051423",
  appId: "1:748216051423:web:ed1e8df22b8891e67d2b6a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

const CLOUD_TAVERN_UPLOAD_INTERVAL_MS = 30000;
let cloudTavernUploadTimer = null;
let p2pMatchmakingSessionActive = false;

function isRegularOnlineUser(user = auth.currentUser) {
    return !!(user && !user.isAnonymous);
}

function requireRegularOnlineUser(actionName, options = {}) {
    const user = auth.currentUser;
    if (isRegularOnlineUser(user)) return user;
    if (!options.silent) {
        const message = actionName
            ? `${actionName}を利用するには通常アカウントでのログインが必要です。`
            : 'このオンライン機能を利用するには通常アカウントでのログインが必要です。';
        if (typeof window.showGameAlert === 'function') window.showGameAlert(message);
        else alert(message);
    }
    return null;
}

function stopCloudTavernUploadTimer() {
    if (cloudTavernUploadTimer) clearInterval(cloudTavernUploadTimer);
    cloudTavernUploadTimer = null;
}

function startCloudTavernUploadTimer() {
    stopCloudTavernUploadTimer();
    if (!isRegularOnlineUser()) return;
    cloudTavernUploadTimer = setInterval(() => {
        if (!isRegularOnlineUser()) {
            stopCloudTavernUploadTimer();
            return;
        }
        let mode = 'unknown';
        try { mode = currentMode; } catch (error) {}
        if (mode === 'play' && typeof window.uploadMyAIToCloud === 'function') {
            window.uploadMyAIToCloud();
        }
    }, CLOUD_TAVERN_UPLOAD_INTERVAL_MS);
}

// 認証オブジェクトを公開せず、ゲーム側から副作用なくログイン状態だけ確認できる入口。
window.isOnlineAccountLoggedIn = function() {
    return isRegularOnlineUser();
};

// P2P対戦は通常アカウント未登録でも利用できる。匿名認証は既存クラウド機能へは通さない。
window.ensureP2PMatchmakingSession = async function() {
    p2pMatchmakingSessionActive = true;
    let user = auth.currentUser;
    try {
        if (!user) {
            const credential = await signInAnonymously(auth);
            user = credential.user;
        }
    } catch (error) {
        p2pMatchmakingSessionActive = false;
        throw error;
    }
    return {
        uid: user.uid,
        isAnonymous: !!user.isAnonymous,
        isRegularAccount: isRegularOnlineUser(user)
    };
};

window.endP2PMatchmakingSession = async function() {
    p2pMatchmakingSessionActive = false;
    if (!auth.currentUser || !auth.currentUser.isAnonymous) return false;
    await signOut(auth);
    return true;
};

window.getFirebaseAppForP2P = function() {
    return app;
};

window.getP2PMatchmakingSessionInfo = function() {
    const user = auth.currentUser;
    return user ? { uid: user.uid, isAnonymous: !!user.isAnonymous, isRegularAccount: isRegularOnlineUser(user) } : null;
};

// ★追加：データ通信を節約するためのキャッシュ（一時保存）領域
const dataCache = {
    tcgMarket: { items: [], lastFetch: 0 },
    tavernAIs: { items: [], lastFetch: 0 },   // 酒場(ステータス)AI用
    onlineDecks: { items: [], lastFetch: 0 }, // TCGオンラインデッキ用
    dungeonRank: {}, // ダンジョンランキング用（種類ごとに動的追加）
    arenaRank: {},   // アリーナランキング用（モードごとに動的追加）
    defenseRank: {}  // ★追加：防衛戦ランキング用（モードごとに動的追加）
};
const CACHE_LIFETIME = 3 * 60 * 1000; // キャッシュの有効期限（3分 = 180,000ミリ秒）

// 保護テスト中の状態をランキングや他プレイヤーのデータへ混ぜない。
// 認証と読み取りは許可し、ゲーム進行を書き換える通信だけを止める。
function blockDebugTestCloudWrite(actionName, silent = false) {
    let isActive = false;
    try {
        const session = JSON.parse(localStorage.getItem('debug_test_session_v1') || 'null');
        isActive = !!(session && session.active);
    } catch (error) {}
    if (!isActive) return false;

    console.warn(`[Debug Test] ${actionName} を停止しました。`);
    if (!silent) alert(`保護テスト中は「${actionName}」を実行できません。\n通常セーブへ戻してから実行してください。`);
    return true;
}

// ==========================================
// 🔐 新規アカウント作成処理
// ==========================================
window.handleSignUp = async function() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const errorMsg = document.getElementById('authErrorMessage');
    
    if (!email || !password || password.length < 6) {
        errorMsg.textContent = "メールアドレスと、6文字以上のパスワードを入力してください。";
        return;
    }

    try {
        errorMsg.textContent = "登録中...";
        await createUserWithEmailAndPassword(auth, email, password);
        // 成功時のUI切り替えは onAuthStateChanged が自動でやってくれます
    } catch (error) {
        console.error("登録エラー:", error);
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = "このメールアドレスは既に使われています。";
        } else {
            errorMsg.textContent = "エラーが発生しました: " + error.message;
        }
    }
};

// ==========================================
// 🔐 ログイン処理
// ==========================================
window.handleLogin = async function() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const errorMsg = document.getElementById('authErrorMessage');

    if (!email || !password) {
        errorMsg.textContent = "メールアドレスとパスワードを入力してください。";
        return;
    }

    try {
        errorMsg.textContent = "ログイン中...";
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("ログインエラー:", error);
        errorMsg.textContent = "メールアドレスかパスワードが間違っています。";
    }
};

// ==========================================
// 🔐 ログアウト処理
// ==========================================
window.handleSignOut = async function() {
    try {
        await signOut(auth);
        localStorage.removeItem('my_player_id');
        stopCloudTavernUploadTimer();
        alert("ログアウトしました。");
    } catch (error) {
        console.error("ログアウトエラー:", error);
    }
};

// ==========================================
// 🔐 ログイン状態の監視（UIの切り替え）
// ==========================================
// ==========================================
// 🔐 ログイン状態の監視（UIの切り替え）
// ==========================================
onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('btnLogin');
    const guestMenu = document.getElementById('authGuestMenu');
    const loggedInMenu = document.getElementById('authLoggedInMenu');

    if (isRegularOnlineUser(user)) {
        console.log("✅ 現在ログイン中のユーザー:", user.uid);
        localStorage.setItem('my_player_id', user.uid); 
        
        // ★ 追加：ログインに成功したら、名前が設定されているかチェックする！
        window.checkAndPromptPlayerName(user);
        
        if (loginBtn) {
            loginBtn.innerHTML = "🔓 ログイン中";
            loginBtn.style.background = "#4CAF50";
        }
        if (guestMenu) guestMenu.style.display = "none";
        if (loggedInMenu) loggedInMenu.style.display = "flex";
        startCloudTavernUploadTimer();
        
    } else {
        console.log(user && user.isAnonymous ? "🎮 P2P用の匿名セッションです" : "❌ ログアウト状態です");
        localStorage.removeItem('my_player_id');
        stopCloudTavernUploadTimer();
        if (loginBtn) {
            loginBtn.innerHTML = "🔐 ログイン";
            loginBtn.style.background = "#2196F3";
        }
        if (guestMenu) guestMenu.style.display = "block";
        if (loggedInMenu) loggedInMenu.style.display = "none";
        if (user && user.isAnonymous && !p2pMatchmakingSessionActive) {
            signOut(auth).catch(error => console.warn('古い匿名セッションの終了に失敗しました。', error));
        }
        
        // パスワード入力欄などをリセット
        const errorMsg = document.getElementById('authErrorMessage');
        if (errorMsg) errorMsg.textContent = "";
    }
});

// ==========================================
// 🏷️ プレイヤー名のチェックと登録機能
// ==========================================

// ★新規追加：ゲームに馴染むカッコいいアラートUI
window.showCustomAlert = function(title, message, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(3px);';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:#222; border:2px solid #FF9800; border-radius:8px; padding:25px; width:350px; text-align:center; color:#fff; box-shadow:0 10px 30px rgba(0,0,0,0.8); font-family:sans-serif;';
    
    box.innerHTML = `
        <div style="font-size:20px; font-weight:bold; color:#FF9800; margin-bottom:15px;">${title}</div>
        <div style="font-size:14px; line-height:1.6; margin-bottom:25px; color:#ddd;">${message.replace(/\n/g, '<br>')}</div>
        <button id="custom-alert-btn" style="background:#FF9800; color:#000; border:none; padding:12px 30px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:16px; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">OK</button>
    `;
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    document.getElementById('custom-alert-btn').onclick = () => {
        document.body.removeChild(overlay);
        if (callback) callback();
    };
};

// ログイン直後に、名前が登録されているかチェックする
window.checkAndPromptPlayerName = async function(user) {
    if (!isRegularOnlineUser(user)) return false;
    try {
        const docRef = doc(db, "player_profiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().playerName) {
            localStorage.setItem('my_player_name', docSnap.data().playerName);
            console.log("✅ プレイヤー名確認完了:", docSnap.data().playerName);
        } else {
            // ★大修正：クラウドに名前がない（新規アカウント作成時）のスマートな連携！
            const localName = localStorage.getItem('my_player_name');
            
            if (localName && localName !== "名無し") {
                const q = query(collection(db, "player_profiles"), where("playerName", "==", localName));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    window.showCustomAlert("⚠️ 名前の重複", `オフラインで使用していた名前「${localName}」は、既にオンライン上で他のプレイヤーが使用しています。\nお手数ですが、別の名前を登録してください。`);
                    document.getElementById('playerNameOverlay').classList.add('active');
                } else {
                    await setDoc(docRef, { playerName: localName, createdAt: Date.now() });
                    window.showCustomAlert("☁️ クラウド連携完了", `現在のプレイヤー名「${localName}」をクラウドに同期しました！\nこれでオンライン機能が利用できます。`);
                }
            } else {
                document.getElementById('playerNameOverlay').classList.add('active');
            }
        }
    } catch (error) {
        console.error("名前チェックエラー:", error);
    }
};

// 登録ボタンを押した時の処理
window.registerPlayerName = async function() {
    const inputName = document.getElementById('inputPlayerName').value.trim();
    const errorMsg = document.getElementById('playerNameErrorMessage');

    if (!inputName || inputName.length < 2) {
        errorMsg.textContent = "2文字以上の名前を入力してください。";
        return;
    }

    const user = isRegularOnlineUser() ? auth.currentUser : null;
    if (!user) {
        // ★修正：ゲスト状態での登録。文言を分かりやすく変更！
        localStorage.setItem('my_player_name', inputName);
        document.getElementById('playerNameOverlay').classList.remove('active');
        
        document.body.classList.remove('is-naming');
        window.isNamingPhase = false; 
        
        window.showCustomAlert(
            "📝 登録完了", 
            `プレイヤー名を「${inputName}」に決定しました！\n\n※オンライン機能（酒場や闘技場）で遊ぶ場合は、画面下の「ログイン」ボタンからアカウントを作成してください。`, 
            () => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) chatInput.focus();
            }
        );
        return;
    }

    try {
        errorMsg.textContent = "名前が使えるか確認中...";
        errorMsg.style.color = "#aaa";

        const q = query(collection(db, "player_profiles"), where("playerName", "==", inputName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            errorMsg.textContent = "❌ その名前は既に他のプレイヤーが使用しています。";
            errorMsg.style.color = "#F44336";
            return;
        }

        await setDoc(doc(db, "player_profiles", user.uid), { playerName: inputName, createdAt: Date.now() });

        localStorage.setItem('my_player_name', inputName);
        document.getElementById('playerNameOverlay').classList.remove('active');
        
        document.body.classList.remove('is-naming');
        window.isNamingPhase = false; 
        
        window.showCustomAlert("📝 登録完了", `プレイヤー名を「${inputName}」に決定し、クラウドに保存しました！`, () => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) chatInput.focus();
        });

    } catch (error) {
        console.error("名前登録エラー:", error);
        errorMsg.textContent = "エラーが発生しました。もう一度お試しください。";
        errorMsg.style.color = "#F44336";
    }
};

// ==========================================
// ☁️ [NEW] セーブデータをクラウドにバックアップする機能
// ==========================================
window.backupSaveDataToCloud = async function() {
    if (blockDebugTestCloudWrite('クラウドバックアップ')) return false;
    const user = requireRegularOnlineUser('クラウドバックアップ', { silent: false });
    if (!user) return false;

    try {
        // 現在のゲームの状態を念のためローカルにセーブしておく
        if (typeof saveGameData === 'function') saveGameData();

        // ブラウザのローカルストレージ内のデータをすべてかき集める！
        let gameData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // ★大修正：Firebaseのシステムデータや、Live Server等の拡張機能が勝手に作った
            // ドット(.)やコロン(:)を含むゴミデータを除外し、純粋なゲームデータだけをバックアップする！
            if (!key.startsWith('firebase:') && !key.includes('.') && !key.includes('/') && !key.includes(':')) {
                gameData[key] = localStorage.getItem(key);
            }
        }

        const uploadData = {
            timestamp: Date.now(),
            saveData: gameData
        };

        // Firestoreの "user_save_data" という場所に、自分のUID名で保存
        await setDoc(doc(db, "user_save_data", user.uid), uploadData);
        alert("✅ セーブデータをクラウドに保存しました！");
        console.log("☁️ [Cloud] バックアップ完了");

    } catch (error) {
        console.error("バックアップエラー:", error);
        alert("バックアップに失敗しました...");
    }
};

// ==========================================
// ☁️ [NEW] セーブデータをクラウドからロード（復元）する機能
// ==========================================
window.restoreSaveDataFromCloud = async function() {
    if (blockDebugTestCloudWrite('クラウドからの復元')) return false;
    const user = requireRegularOnlineUser('クラウドからの復元', { silent: false });
    if (!user) return false;

    if (!confirm("⚠️ クラウドのデータで、現在のゲームデータを【上書き】します。\n（現在のプレイ状況は消えます）本当によろしいですか？")) {
        return;
    }

    try {
        const docRef = doc(db, "user_save_data", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const cloudData = docSnap.data().saveData;
            
            // クラウドのデータを、そっくりそのままブラウザに復元する
            for (const key in cloudData) {
                localStorage.setItem(key, cloudData[key]);
            }
            
            // 復元が終わったら、エモいフェードイン演出の「チケット」を置いてリロードする！
            localStorage.setItem('trigger_fade_in', 'true');
            localStorage.setItem('skip_tutorial', 'true'); // ★追加：チュートリアル出さないで！チケット
            alert("✨ データの復元に成功しました！ゲームを再起動します。");
            window.location.reload(); // F5リロードと同じ処理

        } else {
            alert("クラウドにセーブデータが見つかりませんでした。先に「クラウドにセーブ」を行ってください。");
        }
    } catch (error) {
        console.error("復元エラー:", error);
        alert("復元の途中でエラーが発生しました...");
    }
};

// ==========================================
// ☁️ 以前までの酒場＆デッキ機能（そのまま）
// ==========================================
window.uploadMyAIToCloud = async function() {
    if (blockDebugTestCloudWrite('酒場AIの公開', true)) return false;
    const user = requireRegularOnlineUser('酒場AIの公開', { silent: true });
    if (!user) return false;
    if (typeof window.aiPet === 'undefined' || !window.aiPet.stats) return;
    const myPlayerId = user.uid;
    const cloudData = {
        playerId: myPlayerId,
        playerName: localStorage.getItem('my_player_name') || "名無し", // ★これを追加！
        skin: window.aiPet.currentSkin || 'robot',
        stats: window.aiPet.stats,
        skills: window.aiPet.skills || {},
        learnedWords: (window.aiPet.apprentice && window.aiPet.apprentice.learnedWords) ? window.aiPet.apprentice.learnedWords : [],
        title: (window.aiPet.apprentice && window.aiPet.apprentice.title) ? window.aiPet.apprentice.title : "",
        lastUpdated: Date.now()
    };
    try {
        await setDoc(doc(db, "tavern_ais", myPlayerId), cloudData);
        return true;
    } catch (error) {
        console.error('酒場AI公開エラー:', error);
        return false;
    }
};

window.fetchCloudAIs = async function(forceRefresh = false) {
    if (!requireRegularOnlineUser('酒場AIの取得', { silent: true })) return [];
    if (!forceRefresh && Date.now() - dataCache.tavernAIs.lastFetch < CACHE_LIFETIME) {
        console.log("酒場AI: キャッシュから取得 (通信量0)");
        return dataCache.tavernAIs.items;
    }

    try {
        const q = query(collection(db, "tavern_ais"), orderBy("lastUpdated", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        let aiList = [];
        let myPlayerId = localStorage.getItem('my_player_id');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.playerId !== myPlayerId) aiList.push(data);
        });
        
        dataCache.tavernAIs.items = aiList;
        dataCache.tavernAIs.lastFetch = Date.now();
        return aiList;
    } catch (error) { return []; }
};

window.uploadMyDeckToCloud = async function(myId, uploadData) {
    if (blockDebugTestCloudWrite('オンラインデッキの公開')) return false;
    const user = requireRegularOnlineUser('オンラインデッキの公開', { silent: true });
    if (!user) return false;
    uploadData = Object.assign({}, uploadData, { playerId: user.uid });
    try { await setDoc(doc(db, "tcg_online_decks", user.uid), uploadData); return true; } catch (error) { return false; }
};

window.fetchOnlineDecks = async function(forceRefresh = false) {
    if (!requireRegularOnlineUser('オンラインデッキの取得', { silent: true })) return [];
    if (!forceRefresh && Date.now() - dataCache.onlineDecks.lastFetch < CACHE_LIFETIME) {
        console.log("TCGデッキ: キャッシュから取得 (通信量0)");
        return dataCache.onlineDecks.items;
    }

    try {
        const q = query(collection(db, "tcg_online_decks"), orderBy("updatedAt", "desc"), limit(15));
        const querySnapshot = await getDocs(q);
        let deckList = [];
        let myId = localStorage.getItem('my_player_id');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.playerId !== myId) deckList.push(data);
        });
        
        dataCache.onlineDecks.items = deckList;
        dataCache.onlineDecks.lastFetch = Date.now();
        return deckList;
    } catch (error) { return []; }
};

// ==========================================
// 🗡️ ダンジョン：オンラインランキング機能（エラー回避版）
// ==========================================

// ---------------------------------------------------------
// 修正箇所①：スカルダンジョンの記録が更新されないバグの修正
// ---------------------------------------------------------
window.updateDungeonRanking = async function(mapType, reachedFloor, aiLevel = 1) {
    if (blockDebugTestCloudWrite('ダンジョンランキング更新', true)) return false;
    const user = requireRegularOnlineUser('ダンジョンランキング更新', { silent: true });
    if (!user) return; 

    const playerName = localStorage.getItem('my_player_name') || "名無し";
    const aiSkin = window.aiPet ? (window.aiPet.currentSkin || window.aiPet.baseType || 'robot') : 'robot';
    
    const collectionName = `dungeon_rankings_${mapType}`;

    try {
        const docRef = doc(db, collectionName, user.uid);
        const docSnap = await getDoc(docRef);
        
        let shouldUpdate = true;
        let parsedFloor = parseInt(reachedFloor, 10) || 1;

        if (docSnap.exists()) {
            const currentRecord = parseInt(docSnap.data().floor, 10) || 0;
            // ★修正：同階層（タイ記録）でも、新しいAI情報で上書き更新できるように「<」に変更
            if (parsedFloor < currentRecord) shouldUpdate = false;
        }

        if (shouldUpdate) {
            // ★修正：スカルダンジョン等の特殊モードで player オブジェクトが無い場合のクラッシュ（保存失敗）を防止！
            let eqWeapon = null; let eqShield = null;
            if (typeof window.DUNGEON_STATE !== 'undefined' && window.DUNGEON_STATE && window.DUNGEON_STATE.player) {
                eqWeapon = window.DUNGEON_STATE.player.equipWeapon || null;
                eqShield = window.DUNGEON_STATE.player.equipShield || null;
            }

            await setDoc(docRef, {
                playerId: user.uid,
                playerName: playerName,
                mapType: mapType,
                floor: parsedFloor,
                aiSkin: aiSkin,
                aiLevel: mapType === 'crystal' ? aiLevel : null, 
                updatedAt: Date.now(),
                aiStats: window.aiPet ? window.aiPet.stats : null,
                equipWeapon: eqWeapon,
                equipShield: eqShield
            });
            console.log(`☁️ [Ranking] ${mapType} B${parsedFloor}F の記録を更新しました！`);
        }
    } catch (error) {
        console.error("ランキング登録エラー:", error);
    }
};

window.fetchDungeonRanking = async function(mapType, forceRefresh = false) {
    if (!requireRegularOnlineUser('ダンジョンランキング取得', { silent: true })) return [];
    if (!dataCache.dungeonRank[mapType]) dataCache.dungeonRank[mapType] = { items: [], lastFetch: 0 };
    
    if (!forceRefresh && Date.now() - dataCache.dungeonRank[mapType].lastFetch < CACHE_LIFETIME) {
        console.log(`ダンジョン(${mapType}): キャッシュから取得 (通信量0)`);
        return dataCache.dungeonRank[mapType].items;
    }

    try {
        // ★ 修正：コレクションを分けているので、orderBy（並び替え）単体でエラーなく取得できる！
        const collectionName = `dungeon_rankings_${mapType}`;
        const q = query(collection(db, collectionName), orderBy("floor", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let rankList = [];
        querySnapshot.forEach((doc) => {
            rankList.push(doc.data());
        });
        
        dataCache.dungeonRank[mapType].items = rankList;
        dataCache.dungeonRank[mapType].lastFetch = Date.now();
        return rankList;
    } catch (error) {
        console.error("ランキング取得エラー:", error);
        return [];
    }
};

// ==========================================
// 🏆 ダンジョン：ランキングUIの描画処理（総合UI統合版＆詳細表示UIパッチ）
// ==========================================
window.renderDungeonRankingList = async function(mapType) {
    const tStatus = document.getElementById('main-tab-status'); 
    const tDungeon = document.getElementById('main-tab-dungeon'); 
    const tArena = document.getElementById('main-tab-arena');
    
    if (tStatus) { tStatus.style.background = '#222'; tStatus.style.color = '#aaa'; tStatus.style.borderBottom = '3px solid transparent'; }
    if (tDungeon) { tDungeon.style.background = '#333'; tDungeon.style.color = '#FFF'; tDungeon.style.borderBottom = '3px solid #00BCD4'; tDungeon.style.borderRight = '1px solid #444'; } 
    if (tArena) { tArena.style.background = '#222'; tArena.style.color = '#aaa'; tArena.style.borderBottom = '3px solid transparent'; tArena.style.borderLeft = '1px solid #444'; }

    // ★修正：他のサブタブを完全に非表示
    const subStatus = document.getElementById('sub-tabs-status');
    const subArena = document.getElementById('sub-tabs-arena');
    const subDungeon = document.getElementById('sub-tabs-dungeon');
    if (subStatus) subStatus.style.display = 'none';
    if (subArena) subArena.style.display = 'none';
    if (subDungeon) subDungeon.style.display = 'flex';

    const tSkull = document.getElementById('rank-tab-skull');
    const tCrystal = document.getElementById('rank-tab-crystal');
    
    if (mapType === 'skull') {
        if (tSkull) { tSkull.style.background = '#00BCD4'; tSkull.style.color = '#000'; tSkull.style.border = 'none'; }
        if (tCrystal) { tCrystal.style.background = '#222'; tCrystal.style.color = '#E040FB'; tCrystal.style.border = '1px solid #E040FB'; }
    } else {
        if (tCrystal) { tCrystal.style.background = '#E040FB'; tCrystal.style.color = '#000'; tCrystal.style.border = 'none'; }
        if (tSkull) { tSkull.style.background = '#222'; tSkull.style.color = '#00BCD4'; tSkull.style.border = '1px solid #00BCD4'; }
    }

    const list = document.getElementById('ranking-list-container');
    if(!list) return;
    list.innerHTML = `<div style="text-align:center; color:#aaa; margin-top:50px; font-size:18px;">📡 クラウドから${mapType === 'skull' ? 'スカル' : 'クリスタル'}の記録を取得中...</div>`;

    if (typeof window.fetchDungeonRanking === 'function') {
        const rankList = await window.fetchDungeonRanking(mapType);
        
        if (rankList.length === 0) {
            list.innerHTML = `<div style="text-align:center; color:#888; margin-top:50px; font-size:18px;">まだ記録がありません。<br>一番乗りを目指そう！</div>`;
            return;
        }

        let html = '';
        rankList.forEach((data, index) => {
            // (中略) 前回と同じ表示処理なのでそのまま
            let rankIcon = `<span style="color:#888; font-size:20px; font-weight:bold;">${index + 1}位</span>`;
            if (index === 0) rankIcon = "<span style='color:#FFD700; font-size:24px; font-weight:bold; text-shadow:0 0 5px #FFD700;'>🥇 1位</span>";
            if (index === 1) rankIcon = "<span style='color:#C0C0C0; font-size:22px; font-weight:bold;'>🥈 2位</span>";
            if (index === 2) rankIcon = "<span style='color:#CD7F32; font-weight:bold;'>🥉 3位</span>";

            let typeIcon = data.aiSkin ? (data.aiSkin.split('_')[0] === 'ghost' ? '👻' : '🤖') : '🤖'; 
            let petNameStr = (typeof monsterBookData !== 'undefined' && monsterBookData[data.aiSkin] ? monsterBookData[data.aiSkin].name : data.aiSkin);
            let lvText = mapType === 'crystal' && data.aiLevel ? `<span style="font-size:14px; color:#E040FB; margin-left:10px; background:rgba(224,64,251,0.2); padding:2px 6px; border-radius:4px;">Lv.${data.aiLevel}</span>` : '';
            
            let isMe = (data.playerId === localStorage.getItem('my_player_id'));
            let pName = data.playerName || "名無しプレイヤー";
            if (isMe) pName = `✨ ${pName} (あなた)`;

            html += `
                <div style="background: ${isMe ? 'rgba(76, 175, 80, 0.15)' : '#222'}; border: 2px solid ${isMe ? '#4CAF50' : '#444'}; border-radius: 8px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="width:80px; text-align:center;">${rankIcon}</div>
                        <div>
                            <div style="font-size:16px; font-weight:bold; cursor:pointer; color:#4CAF50; text-decoration:underline; margin-bottom:4px;" 
                                 onclick="window.openPlayerDetail('${data.playerId}', '${mapType}')" title="クリックで詳細を見る">
                                ${pName}
                            </div>
                            <div style="font-size:16px; color:#FFF;">${typeIcon} ${petNameStr} ${lvText}</div>
                        </div>
                    </div>
                    <div style="font-size:32px; font-weight:bold; color:${mapType === 'skull' ? '#00BCD4' : '#E040FB'}; text-shadow:0 2px 4px rgba(0,0,0,0.5);">
                        B${data.floor}F
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    }
};

// -------------------------------
// ★ 詳細パネルを表示する関数（ダンジョン用：フレンド＆訪問ボタン追加版）
// -------------------------------
window.openPlayerDetail = async function(playerId, mapType) {
    if (!requireRegularOnlineUser('プレイヤー詳細取得', { silent: true })) return false;
    const detailArea = document.getElementById('ranking-detail-area');
    const content = document.getElementById('ranking-detail-content');
    const title = document.getElementById('ranking-detail-title');
    
    if(!detailArea || !content) return;
    
    content.innerHTML = `<div style="color:#aaa; text-align:center; padding: 20px;">📡 読込中...</div>`;
    detailArea.style.display = 'flex';

    const collectionName = `dungeon_rankings_${mapType}`;

    try {
        const docRef = doc(db, collectionName, playerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            title.innerHTML = `🏷️ ${data.playerName} の詳細`;
            
            let petNameStr = (typeof monsterBookData !== 'undefined' && monsterBookData[data.aiSkin] ? monsterBookData[data.aiSkin].name : data.aiSkin);
            let wName = data.equipWeapon ? (typeof itemCatalog !== 'undefined' && itemCatalog[data.equipWeapon] ? itemCatalog[data.equipWeapon].name : (data.equipWeapon === 'item_sword_iron' ? '鉄の剣' : data.equipWeapon)) : "なし";
            let sName = data.equipShield ? (typeof itemCatalog !== 'undefined' && itemCatalog[data.equipShield] ? itemCatalog[data.equipShield].name : (data.equipShield === 'item_shield_wood' ? '木の盾' : data.equipShield)) : "なし";
            
            let html = `
                <div style="font-size: 14px; color: #ccc; line-height: 1.8;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>🗡️ 到達フロア:</span>
                        <span style="color: ${mapType === 'skull' ? '#00BCD4' : '#E040FB'}; font-weight: bold; font-size: 18px;">B${data.floor}F</span>
                    </div>

                    <hr style="border-color: #444; margin: 15px 0;">
                    
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">▼ 最終装備</div>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; background: rgba(255,215,0,0.1); padding: 5px 10px; border-radius: 4px; border:1px solid #FFD700;">
                            <span>⚔️ 武器:</span>
                            <span style="color:#FFD700; font-weight:bold;">${wName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; background: rgba(79,195,247,0.1); padding: 5px 10px; border-radius: 4px; border:1px solid #4fc3f7;">
                            <span>🛡️ 盾:</span>
                            <span style="color:#4fc3f7; font-weight:bold;">${sName}</span>
                        </div>
                    </div>
                    
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">▼ 育成ステータス</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; background: rgba(255,82,82,0.1); padding: 5px 10px; border-radius: 4px;">
                            <span>💪 活力:</span>
                            <span style="color:#ff5252; font-weight:bold;">${Math.floor(data.aiStats ? data.aiStats.power : 0)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; background: rgba(79,195,247,0.1); padding: 5px 10px; border-radius: 4px;">
                            <span>🧠 賢さ:</span>
                            <span style="color:#4fc3f7; font-weight:bold;">${Math.floor(data.aiStats ? data.aiStats.intel : 0)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; background: rgba(224,64,251,0.1); padding: 5px 10px; border-radius: 4px;">
                            <span>✨ 美しさ:</span>
                            <span style="color:#e040fb; font-weight:bold;">${Math.floor(data.aiStats ? data.aiStats.beauty : 0)}</span>
                        </div>
                    </div>

                    <hr style="border-color: #444; margin: 20px 0 15px 0;">
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button onclick="window.visitPlayerIsland('${playerId}', '${data.playerName}')" style="padding:12px; background:#E040FB; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; transition:0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">✈️ この人の島へ遊びに行く</button>
                        <button onclick="window.addFriend('${playerId}', '${data.playerName}')" style="padding:10px; background:#4CAF50; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:14px; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">🤝 フレンドに追加する</button>
                    </div>
                </div>
            `;
            content.innerHTML = html;
        } else {
            content.innerHTML = `<div style="color:#FF5722; text-align:center; padding: 20px;">エラー：データが見つかりませんでした。</div>`;
        }
    } catch (error) {
        console.error("プレイヤー詳細取得エラー:", error);
        content.innerHTML = `<div style="color:#FF5722; text-align:center; padding: 20px;">エラーが発生しました。</div>`;
    }
};

// ==========================================
// 🆘 ダンジョン：風来救助（お助け）機能
// ==========================================

// 倒れた時に救助要請を出す
window.requestRescue = async function(mapType, floor) {
    if (blockDebugTestCloudWrite('救助要請')) return false;
    const user = requireRegularOnlineUser('救助要請', { silent: true });
    if (!user) return false;

    const playerName = localStorage.getItem('my_player_name') || "名無し";
    const aiSkin = window.aiPet ? (window.aiPet.currentSkin || window.aiPet.baseType || 'robot') : 'robot';
    
    // 自分自身の救助要請データを作成
    const requestData = {
        requesterId: user.uid,
        requesterName: playerName,
        mapType: mapType,
        floor: floor,
        aiSkin: aiSkin,
        status: 'waiting', // waiting, rescued
        createdAt: Date.now()
    };

    try {
        await setDoc(doc(db, "rescue_requests", user.uid), requestData);
        // localStorageに「救助待ち状態」を保存し、ゲームの進行をロックする
        localStorage.setItem('rescue_waiting_map', mapType);
        localStorage.setItem('rescue_waiting_floor', floor);
        console.log("☁️ [Rescue] 救助要請を送信しました。");
        return true;
    } catch (error) {
        console.error("救助要請エラー:", error);
        return false;
    }
};

// 現在出ている救助要請（自分以外）を取得する
window.fetchRescueRequests = async function(mapType) {
    const user = requireRegularOnlineUser('救助要請取得', { silent: true });
    if (!user) return [];
    const myId = user.uid;
    try {
        const q = query(collection(db, "rescue_requests"), where("mapType", "==", mapType), where("status", "==", "waiting"));
        const querySnapshot = await getDocs(q);
        let requests = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.requesterId !== myId) requests.push(data);
        });
        return requests;
    } catch (error) {
        console.error("救助要請取得エラー:", error);
        return [];
    }
};

// 対象のプレイヤーを救助したことをサーバーに報告する
window.completeRescue = async function(requesterId) {
    if (blockDebugTestCloudWrite('救助完了報告')) return false;
    if (!requireRegularOnlineUser('救助完了報告', { silent: true })) return false;
    try {
        // ステータスを 'rescued' に更新する
        await setDoc(doc(db, "rescue_requests", requesterId), { status: 'rescued' }, { merge: true });
        console.log(`☁️ [Rescue] ${requesterId} の救助を完了しました！`);
    } catch (error) {
        console.error("救助完了報告エラー:", error);
    }
};

// 自分が救助されたかどうか（定期的に）チェックする
window.checkMyRescueStatus = async function() {
    const user = requireRegularOnlineUser('救助状態確認', { silent: true });
    if (!user) return false;

    // そもそも救助待ち状態でなければチェックしない
    if (!localStorage.getItem('rescue_waiting_map')) return false;

    try {
        const docRef = doc(db, "rescue_requests", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().status === 'rescued') {
            return true; // 救助された！
        }
        return false;
    } catch (error) {
        return false;
    }
};

// ==========================================
// ⚔️ 闘技場（アリーナ）：オンラインランキング機能
// ==========================================

window.updateArenaRanking = async function(reachedWave, partyData) {
    if (blockDebugTestCloudWrite('アリーナランキング更新', true)) return false;
    const user = requireRegularOnlineUser('アリーナランキング更新', { silent: true });
    if (!user) return; 

    const playerName = localStorage.getItem('my_player_name') || "名無し";
    // ★修正：モードによって保存先のコレクションを分ける
    const mode = window.ARENA_STATE.mode;
    const collectionName = mode === 'boss' ? "arena_rankings_boss" : "arena_rankings";

    try {
        const docRef = doc(db, collectionName, user.uid);
        const docSnap = await getDoc(docRef);
        
        let shouldUpdate = true;
        if (docSnap.exists()) {
            const currentRecord = docSnap.data().wave;
            if (reachedWave <= currentRecord) shouldUpdate = false;
        }

        if (shouldUpdate) {
            await setDoc(docRef, {
                playerId: user.uid,
                playerName: playerName,
                wave: reachedWave,
                party: partyData,
                updatedAt: Date.now()
            });
            console.log(`☁️ [Ranking] ${mode === 'boss' ? 'ボスラッシュ' : 'アリーナ'} 第${reachedWave}戦 の記録を保存しました！`);
        }
    } catch (error) {
        console.error("アリーナランキング登録エラー:", error);
    }
};

window.fetchArenaRanking = async function(mode = 'normal', forceRefresh = false) {
    if (!requireRegularOnlineUser('アリーナランキング取得', { silent: true })) return [];
    if (!dataCache.arenaRank[mode]) dataCache.arenaRank[mode] = { items: [], lastFetch: 0 };
    
    if (!forceRefresh && Date.now() - dataCache.arenaRank[mode].lastFetch < CACHE_LIFETIME) {
        console.log(`アリーナ(${mode}): キャッシュから取得 (通信量0)`);
        return dataCache.arenaRank[mode].items;
    }

    try {
        // ★修正：引数のモードで取得先のコレクションを切り替える
        const collectionName = mode === 'boss' ? "arena_rankings_boss" : "arena_rankings";
        const q = query(collection(db, collectionName), orderBy("wave", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let rankList = [];
        querySnapshot.forEach((doc) => {
            rankList.push(doc.data());
        });
        
        dataCache.arenaRank[mode].items = rankList;
        dataCache.arenaRank[mode].lastFetch = Date.now();
        return rankList;
    } catch (error) {
        console.error("アリーナランキング取得エラー:", error);
        return [];
    }
};

// ==========================================
// 🤝 店舗経営：フレンドとの非同期アイテム通信システム
// ==========================================

// フレンドがテイクアウトしたアイテムを、相手のクラウドデータに送る
window.sendItemToFriend = async function(friendId, friendName, itemId, price = 0) {
    if (blockDebugTestCloudWrite('フレンドへのアイテム送信')) return false;
    if (!requireRegularOnlineUser('フレンドへのアイテム送信', { silent: true })) return false;
    if (!friendId) return;
    let itemName = window.getDisplayShopItemName ? window.getDisplayShopItemName(itemId) : itemId;
    if (typeof addFloatingText === 'function' && window.aiPet) addFloatingText(window.aiPet.x, window.aiPet.y - 80, `🎁 ${friendName}にお土産を渡した！`, "#E040FB");

    try {
        const docRef = doc(db, "user_save_data", friendId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            if (data.saveData && data.saveData.ai_pet_data_v1) {
                let friendPetData = JSON.parse(data.saveData.ai_pet_data_v1);
                
                // 1. アイテム追加＆代金引き落とし（自己破産上等！）
                if (!friendPetData.inventory) friendPetData.inventory = [];
                friendPetData.inventory.push(itemId);
                friendPetData.gold = (friendPetData.gold || 0) - price;
                
                // 2. ★超重要：独自レシピの感染（伝播）処理
                if (itemId.startsWith('custom_') && window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) {
                    if (!friendPetData.customRecipes) friendPetData.customRecipes = {};
                    friendPetData.customRecipes[itemId] = window.aiPet.customRecipes[itemId]; // レシピ図鑑をコピー
                    
                    // フレンドの島の店舗データにも「習得済み」としてねじ込む
                    if (data.saveData.map_data) {
                        try {
                            let fAssets = JSON.parse(data.saveData.map_data);
                            let itemType = window.aiPet.customRecipes[itemId].type;
                            for (let k in fAssets) {
                                let b = fAssets[k];
                                if ((b.type === 'restaurant' && itemType === 'dish') || (b.type === 'smith' && itemType === 'equipment')) {
                                    if (!b.shopData) b.shopData = { recipes: {} };
                                    if (!b.shopData.recipes) b.shopData.recipes = {};
                                    b.shopData.recipes[itemId] = { learned: true }; // フレンドの店でも販売開始！
                                }
                            }
                            data.saveData.map_data = JSON.stringify(fAssets);
                        } catch(e) { console.error("レシピ感染エラー", e); }
                    }
                }
                
                data.saveData.ai_pet_data_v1 = JSON.stringify(friendPetData);
                await setDoc(docRef, data);
            }
        }
    } catch (error) {}
};

// フレンドがイートインした時に、相手のクラウドデータのステータス（体力・満腹度）を回復させる
window.sendFoodEffectToFriend = async function(friendId, friendName, itemId, price = 0) {
    if (blockDebugTestCloudWrite('フレンドへの料理効果送信')) return false;
    if (!requireRegularOnlineUser('フレンドへの料理効果送信', { silent: true })) return false;
    if (!friendId) return;
    let itemName = window.getDisplayShopItemName ? window.getDisplayShopItemName(itemId) : itemId;
    if (typeof addFloatingText === 'function' && window.aiPet) addFloatingText(window.aiPet.x, window.aiPet.y - 80, `✨ ${friendName}の元気が回復した！`, "#E040FB");

    try {
        const docRef = doc(db, "user_save_data", friendId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            if (data.saveData && data.saveData.ai_pet_data_v1) {
                let friendPetData = JSON.parse(data.saveData.ai_pet_data_v1);
                
                // 1. 回復と代金引き落とし
                let healHp = 30; let healHunger = 40;
                if (itemId.includes('fish') || itemId.includes('meat') || itemId.startsWith('custom_')) { healHp = 50; healHunger = 60; }
                
                friendPetData.energy = Math.min(100, (friendPetData.energy || 0) + healHp);
                friendPetData.hunger = Math.min(100, (friendPetData.hunger || 0) + healHunger);
                friendPetData.gold = (friendPetData.gold || 0) - price;
                
                // 2. ★超重要：独自レシピの感染処理（食べただけでも閃く！）
                if (itemId.startsWith('custom_') && window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) {
                    if (!friendPetData.customRecipes) friendPetData.customRecipes = {};
                    friendPetData.customRecipes[itemId] = window.aiPet.customRecipes[itemId]; 
                    
                    if (data.saveData.map_data) {
                        try {
                            let fAssets = JSON.parse(data.saveData.map_data);
                            let itemType = window.aiPet.customRecipes[itemId].type;
                            for (let k in fAssets) {
                                let b = fAssets[k];
                                if ((b.type === 'restaurant' && itemType === 'dish') || (b.type === 'smith' && itemType === 'equipment')) {
                                    if (!b.shopData) b.shopData = { recipes: {} };
                                    if (!b.shopData.recipes) b.shopData.recipes = {};
                                    b.shopData.recipes[itemId] = { learned: true }; 
                                }
                            }
                            data.saveData.map_data = JSON.stringify(fAssets);
                        } catch(e) {}
                    }
                }
                
                data.saveData.ai_pet_data_v1 = JSON.stringify(friendPetData);
                await setDoc(docRef, data);
            }
        }
    } catch (error) {}
};

// ==========================================
// ✈️ 島訪問＆フレンド機能：データ取得とリスト管理
// ==========================================

// 指定した他プレイヤーのセーブデータをクラウドから取得する
window.fetchPlayerSaveData = async function(playerId) {
    if (!requireRegularOnlineUser('プレイヤーデータ取得', { silent: true })) return null;
    try {
        const docRef = doc(db, "user_save_data", playerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().saveData; 
        }
        return null;
    } catch (error) {
        console.error("データ取得エラー:", error);
        return null;
    }
};

window.addFriend = function(playerId, playerName, skin) {
    if (!playerId) return;
    if (playerId === localStorage.getItem('my_player_id')) { alert("自分自身はフレンドに追加できません！"); return; }
    let list = JSON.parse(localStorage.getItem('my_friend_list') || '[]');
    if (!list.find(f => f.id === playerId)) {
        list.push({ id: playerId, name: playerName, skin: skin || 'robot' }); // ★skinを保存
        localStorage.setItem('my_friend_list', JSON.stringify(list));
        alert(`🤝 「${playerName}」をフレンドに追加しました！\nお店に遊びに来てくれるようになります！`);
        if(typeof window.backupSaveDataToCloud === 'function') window.backupSaveDataToCloud();
    } else { alert(`「${playerName}」は既にフレンドに登録されています。`); }
};

// ==========================================
// 🤝 フレンドリストUI（リッチ版）と画面上へのボタン配置
// ==========================================
window.openFriendListUI = function() {
    let list = JSON.parse(localStorage.getItem('my_friend_list') || '[]');
    
    let html = `
        <div style="background: linear-gradient(135deg, #2a0845, #111); padding:25px; border-radius:16px; border:3px solid #E040FB; width:400px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #444; padding-bottom:15px; margin-bottom:20px;">
                <h2 style="margin:0; color:#E040FB; font-size:24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">🤝 フレンドリスト</h2>
                <button onclick="document.getElementById('friend-list-ui').remove()" style="background:transparent; border:none; color:#aaa; font-size:28px; cursor:pointer; line-height:1;">×</button>
            </div>
    `;
    
    if (list.length === 0) {
        html += `
            <div style="text-align:center; padding:40px 0; color:#aaa; font-size:16px; line-height:1.6;">
                まだフレンドがいません。<br>
                <span style="color:#FFD700;">「ランキング」</span>から気になるプレイヤーを探して<br>
                フレンドに追加してみましょう！
            </div>
        `;
    } else {
        html += `<div style="max-height:400px; overflow-y:auto; padding-right:10px;">`;
        list.forEach(f => {
            html += `
                <div style="background: rgba(255,255,255,0.05); padding:15px; margin-bottom:12px; border-radius:10px; border:1px solid #555; display:flex; justify-content:space-between; align-items:center; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                    <div style="font-weight:bold; font-size:18px; color:#FFF;">${f.name}</div>
                    <button onclick="window.visitPlayerIsland('${f.id}', '${f.name}')" style="padding:10px 15px; background:#E040FB; color:#fff; border:1px solid #FFF; border-radius:8px; cursor:pointer; font-weight:bold; font-size:14px; box-shadow:0 4px 0 #8e24aa; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">✈️ 遊びに行く</button>
                </div>
            `;
        });
        html += `</div>`;
    }
    html += `</div>`;
    
    let ui = document.getElementById('friend-list-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'friend-list-ui';
        // 背景を少しぼかしてエモくする
        ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:80000; display:flex; justify-content:center; align-items:center; font-family:sans-serif; backdrop-filter:blur(4px);`;
        document.body.appendChild(ui);
    }
    ui.innerHTML = html;
};

// ==========================================
// ⚖️ オンライン取引所（郵便受けシステム＆チャット連携）
// ==========================================

// 取引記録をホストの郵便受けに送信
window.sendTradeToHost = async function(hostId, visitorName, tradeType, itemId, price) {
    if (blockDebugTestCloudWrite('訪問先との取引')) return false;
    if (!requireRegularOnlineUser('訪問先との取引', { silent: true })) return false;
    if (!hostId) return;
    try {
        const docRef = doc(db, "trade_mailbox", hostId);
        const docSnap = await getDoc(docRef);
        let trades = docSnap.exists() ? (docSnap.data().trades || []) : [];
        
        trades.push({ visitorName: visitorName, tradeType: tradeType, itemId: itemId, price: price, timestamp: Date.now() });
        await setDoc(docRef, { trades: trades });
    } catch (error) { console.error("送信エラー:", error); }
};

// ログイン時に溜まった取引を精算
window.processTradeMailbox = async function() {
    if (blockDebugTestCloudWrite('取引メールの精算', true)) return false;
    const user = requireRegularOnlineUser('取引メールの精算', { silent: true });
    if (!user) return false;
    let myId = user.uid;

    try {
        const docRef = doc(db, "trade_mailbox", myId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().trades && docSnap.data().trades.length > 0) {
            let trades = docSnap.data().trades;
            let reportHtml = "";
            let totalProfit = 0; 
            
            let shopBuilding = null;
            for (let k in window.assets) { if (window.assets[k].type === 'shop') { shopBuilding = window.assets[k]; break; } }

            if (shopBuilding) {
                if (!shopBuilding.shopData) shopBuilding.shopData = { inventory: {}, marketTrend: {} };
                let s = shopBuilding.shopData;
                if (!s.marketTrend) s.marketTrend = {};
                if (!s.inventory) s.inventory = {};

                trades.forEach(t => {
                    let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(t.itemId) : t.itemId;
                    let timeStr = new Date(t.timestamp).toLocaleString('ja-JP', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
                    
                    if (t.tradeType === 'visitor_sell') {
                        // ホスト（自分）は在庫を得てお金を失う（相場は下がる）
                        s.inventory[t.itemId] = (s.inventory[t.itemId] || 0) + 1;
                        s.marketTrend[t.itemId] = (s.marketTrend[t.itemId] || 0) + 1; 
                        window.aiPet.gold -= t.price; 
                        totalProfit -= t.price;
                        reportHtml += `<div style="background:#222; border-left:4px solid #F44336; padding:10px; margin-bottom:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#aaa;">${timeStr}</div><div style="font-size:14px; font-weight:bold; color:#FFF;">📥 買取 (${t.visitorName}さん): <span style="color:#FFC107;">${itemName}</span></div></div><div style="font-size:18px; font-weight:bold; color:#F44336;">-${t.price} G</div></div>`;
                    } else if (t.tradeType === 'visitor_buy') {
                        // ホスト（自分）は在庫を失いお金を得る（相場は上がる）
                        if (s.inventory[t.itemId] > 0) s.inventory[t.itemId]--;
                        if (s.marketTrend[t.itemId] > 0) s.marketTrend[t.itemId]--; 
                        window.aiPet.gold += t.price; 
                        totalProfit += t.price;
                        reportHtml += `<div style="background:#222; border-left:4px solid #4CAF50; padding:10px; margin-bottom:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#aaa;">${timeStr}</div><div style="font-size:14px; font-weight:bold; color:#FFF;">📤 売却 (${t.visitorName}さん): <span style="color:#FFC107;">${itemName}</span></div></div><div style="font-size:18px; font-weight:bold; color:#4CAF50;">+${t.price} G</div></div>`;
                    } else if (t.tradeType === 'tcg_sold') {
                        // TCGの売上通知
                        window.aiPet.gold += t.price; 
                        totalProfit += t.price;
                        reportHtml += `<div style="background:#222; border-left:4px solid #E040FB; padding:10px; margin-bottom:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#aaa;">${timeStr}</div><div style="font-size:14px; font-weight:bold; color:#FFF;">🃏 カード売上 (${t.visitorName}さん買上): <span style="color:#E040FB;">${t.itemId}</span></div></div><div style="font-size:18px; font-weight:bold; color:#E040FB;">+${t.price} G</div></div>`;
                    } 
                });
            }

            await setDoc(docRef, { trades: [] });
            if (typeof saveGameData === 'function') saveGameData();
            window.showTradeReportUI(reportHtml, totalProfit);
        }
    } catch (error) {}
};

window.showTradeReportUI = function(reportHtml, totalProfit) {
    let profitColor = totalProfit >= 0 ? '#4CAF50' : '#F44336';
    let profitSign = totalProfit > 0 ? '+' : '';
    let html = `
        <div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:25px; border-radius:12px; border:2px solid #FF9800; width:450px; max-width:90%; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8);">
            <h2 style="margin:0 0 15px 0; color:#FF9800; text-align:center; font-size:24px;">📝 留守中の取引レポート</h2>
            ${window.aiPet.gold < 0 ? `<div style="background:#b71c1c; color:#fff; padding:10px; border-radius:6px; font-weight:bold; text-align:center; margin-bottom:15px;">⚠️ 警告：資金がショートしています！（破産寸前）</div>` : ""}
            <div style="font-size:14px; color:#ccc; margin-bottom:15px; text-align:center;">あなたが留守の間に、他プレイヤーのAIがおつかいに来ました。</div>
            <div style="max-height:300px; overflow-y:auto; background:#111; padding:15px; border-radius:8px; border:1px inset #333; margin-bottom:20px;">${reportHtml}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#222; padding:15px; border-radius:8px; margin-bottom:20px;">
                <span style="font-size:16px; color:#aaa;">総利益 (赤字は出費):</span>
                <span style="font-size:24px; font-weight:bold; color:${profitColor};">${profitSign}${totalProfit} G</span>
            </div>
            <button onclick="document.getElementById('trade-report-ui').remove()" style="width:100%; padding:15px; background:#FF9800; color:#000; border:none; border-radius:8px; font-size:18px; font-weight:bold; cursor:pointer;">確認した</button>
        </div>
    `;
    let ui = document.createElement('div');
    ui.id = 'trade-report-ui';
    ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:99999; display:flex; justify-content:center; align-items:center; font-family:sans-serif; backdrop-filter:blur(3px);`;
    ui.innerHTML = html;
    document.body.appendChild(ui);
};

onAuthStateChanged(auth, (user) => {
    if (isRegularOnlineUser(user)) setTimeout(() => { if (typeof window.processTradeMailbox === 'function') window.processTradeMailbox(); }, 5000);
});

// ★チャット指示のキャッチ
if (typeof window.originalSendChat === 'undefined') {
    window.originalSendChat = window.sendChat;
    window.sendChat = function() {
        let input = document.getElementById('chatInput');
        if (input) {
            let text = input.value.trim();
            if (text && text.includes('ショップ') && (text.includes('おつかい') || text.includes('売って') || text.includes('買って') || text.includes('行って'))) {
                let building = null;
                for (let k in window.assets) { if (window.assets[k].type === 'shop') { building = window.assets[k]; break; } }
                
                if (building) {
                    window.aiPet.message = `わかった！ショップでおつかいしてくるね！`;
                    window.aiPet.messageTimer = 180;
                    window.aiPet.schedule = [{ type: 'auto_trade', buildingId: building.id || Object.keys(assets).find(k=>assets[k]===building), targetX: building.x + 80, targetY: building.y + 120, duration: 150, phase: 'moving' }];
                    input.value = "";
                    return; 
                } else {
                    window.aiPet.message = `この島にはショップがないみたい...`;
                    window.aiPet.messageTimer = 180;
                    input.value = "";
                    return;
                }
            }
        }
        if (typeof window.originalSendChat === 'function') window.originalSendChat();
    };
}

// ==========================================
// 🃏 TCG オンラインマーケット機能
// ==========================================
window.uploadTCGMarketItem = async function(cardData, price) {
    if (blockDebugTestCloudWrite('TCGマーケットへの出品')) return false;
    const user = requireRegularOnlineUser('TCGマーケットへの出品', { silent: true });
    if (!user) return false;
    const playerName = localStorage.getItem('my_player_name') || "名無し";
    const docId = 'market_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    try {
        await setDoc(doc(db, "tcg_market", docId), {
            sellerId: user.uid,
            sellerName: playerName,
            price: price,
            cardData: cardData,
            createdAt: Date.now()
        });
        return true;
    } catch(e) { console.error(e); return false; }
};

window.fetchTCGMarketItems = async function(forceRefresh = false) {
    if (!requireRegularOnlineUser('TCGマーケット取得', { silent: true })) return [];
    // ★追加: キャッシュが有効（3分以内）なら、データベース通信をせずにキャッシュを返す
    if (!forceRefresh && Date.now() - dataCache.tcgMarket.lastFetch < CACHE_LIFETIME) {
        console.log("TCGマーケット: キャッシュからデータを取得しました (通信量0)");
        return dataCache.tcgMarket.items;
    }

    try {
        const q = query(collection(db, "tcg_market"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        let items = [];
        snap.forEach(d => {
            let data = d.data();
            data.docId = d.id;
            items.push(data);
        });
        
        // ★追加: 取得したデータをキャッシュに保存し、取得時間を更新
        dataCache.tcgMarket.items = items;
        dataCache.tcgMarket.lastFetch = Date.now();
        
        return items;
    } catch(e) { console.error(e); return []; }
};

window.buyTCGMarketItem = async function(docId, cardData, price, sellerId) {
    if (blockDebugTestCloudWrite('TCGマーケットでの購入')) return false;
    const user = requireRegularOnlineUser('TCGマーケットでの購入', { silent: true });
    if (!user) return false;
    try {
        // 先に市場から削除（購入成立）
        await deleteDoc(doc(db, "tcg_market", docId));
        // メールボックスに売上を送信
        const myName = localStorage.getItem('my_player_name') || "名無し";
        const mailRef = doc(db, "trade_mailbox", sellerId);
        const mailSnap = await getDoc(mailRef);
        let trades = mailSnap.exists() ? (mailSnap.data().trades || []) : [];
        trades.push({ visitorName: myName, tradeType: 'tcg_sold', itemId: cardData.name, price: price, timestamp: Date.now() });
        await setDoc(mailRef, { trades: trades });
        return true;
    } catch(e) { console.error(e); return false; }
};

window.cancelTCGMarketItem = async function(docId) {
    if (blockDebugTestCloudWrite('TCGマーケット出品の取消')) return false;
    if (!requireRegularOnlineUser('TCGマーケット出品の取消', { silent: true })) return false;
    try { await deleteDoc(doc(db, "tcg_market", docId)); return true; } 
    catch(e) { console.error(e); return false; }
};

// ==========================================
// 🛡️ 防衛戦：オンラインランキング機能
// ==========================================
window.updateDefenseRanking = async function(mode, wave, partyData) {
    if (blockDebugTestCloudWrite('防衛戦ランキング更新', true)) return false;
    const user = requireRegularOnlineUser('防衛戦ランキング更新', { silent: true });
    if (!user) return;
    const playerName = localStorage.getItem('my_player_name') || "名無し";
    const collectionName = mode === 'endless' ? "defense_rankings_endless" : "defense_rankings_normal";

    try {
        const docRef = doc(db, collectionName, user.uid);
        const docSnap = await getDoc(docRef);
        let shouldUpdate = true;
        if (docSnap.exists()) {
            const currentRecord = docSnap.data().wave;
            if (wave <= currentRecord) shouldUpdate = false; // 過去の記録より低ければ更新しない
        }
        if (shouldUpdate) {
            await setDoc(docRef, {
                playerId: user.uid, playerName: playerName, wave: wave, party: partyData, updatedAt: Date.now()
            });
            console.log(`☁️ [Ranking] 防衛戦(${mode}) WAVE ${wave} の記録を保存しました！`);
        }
    } catch (error) { console.error("防衛戦ランキング登録エラー:", error); }
};

window.fetchDefenseRanking = async function(mode = 'normal', forceRefresh = false) {
    if (!requireRegularOnlineUser('防衛戦ランキング取得', { silent: true })) return [];
    if (!dataCache.defenseRank[mode]) dataCache.defenseRank[mode] = { items: [], lastFetch: 0 };
    if (!forceRefresh && Date.now() - dataCache.defenseRank[mode].lastFetch < CACHE_LIFETIME) {
        console.log(`防衛戦(${mode}): キャッシュから取得 (通信量0)`);
        return dataCache.defenseRank[mode].items;
    }
    try {
        const collectionName = mode === 'endless' ? "defense_rankings_endless" : "defense_rankings_normal";
        const q = query(collection(db, collectionName), orderBy("wave", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let rankList = [];
        querySnapshot.forEach((doc) => rankList.push(doc.data()));

        dataCache.defenseRank[mode].items = rankList;
        dataCache.defenseRank[mode].lastFetch = Date.now();
        return rankList;
    } catch (error) { return []; }
};

// ==========================================
// 🚀 Steam IDを利用した完全自動ログイン処理
// ==========================================
window.silentSignOutForNewGame = async function() {
    window.skipAutoLogin = true; 
    try { await signOut(auth); } catch (e) {}
    stopCloudTavernUploadTimer();
    localStorage.removeItem('my_player_name');
    localStorage.removeItem('my_player_id');
};

window.performSteamAutoLogin = async function() {
    if (window.skipAutoLogin || localStorage.getItem('force_first_play') === 'true') return false;

    if (typeof require === 'undefined') return false; 
    const { ipcRenderer } = require('electron');
    if (!ipcRenderer) return false;

    try {
        const steamInfo = await ipcRenderer.invoke('get-steam-info');
        if (!steamInfo) {
            console.log("Steam情報が取得できませんでした。");
            return false;
        }

        // ★重要：数秒かかる通信から戻ってきた後、再びフラグをチェックする！
        if (window.skipAutoLogin || localStorage.getItem('force_first_play') === 'true') {
            console.log("🚫 ニューゲームが選択されたため、遅延していたSteamログインをキャンセルしました。");
            return false;
        }

        const steamId = steamInfo.steamId;
        const steamName = steamInfo.name;
        const email = `steam_${steamId}@aipetgame.local`;
        const password = `SteamAuto_${steamId}_SecretKey`; 

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Steam連携ログイン成功:", steamName);
            localStorage.setItem('my_player_name', steamName); 
            return true;
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("✨ Steam連携アカウント新規作成成功:", steamName);
                localStorage.setItem('my_player_name', steamName);
                return true;
            }
            return false;
        }
    } catch (e) {
        return false;
    }
};

// Steam連携はタイトル画面でプレイヤーが選択した時だけ実行する。

// ==========================================
// 🛡️ [究極版] ゲーム開始フロー＆アカウント統合制御システム
// ==========================================

// 汎用：リッチな選択ダイアログ生成エンジン
window.showRichChoiceDialog = function(title, description, buttons) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a1a; border:2px solid #00BCD4; border-radius:12px; padding:30px; width:450px; text-align:center; color:#fff; box-shadow:0 15px 50px rgba(0,0,0,0.9); font-family:sans-serif;';
    
    let html = `
        <div style="font-size:24px; font-weight:bold; color:#00BCD4; margin-bottom:15px; text-shadow:0 2px 4px rgba(0,0,0,0.5);">${title}</div>
        <div style="font-size:14px; line-height:1.6; margin-bottom:30px; color:#ccc;">${description.replace(/\n/g, '<br>')}</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
    `;
    
    buttons.forEach((btn, index) => {
        const bg = btn.color || '#333';
        const textCol = btn.textColor || '#fff';
        const border = btn.border || 'none';
        html += `<button id="rich-btn-${index}" style="background:${bg}; color:${textCol}; border:${border}; padding:14px 20px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:16px; transition:0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">${btn.text}</button>`;
    });
    
    html += `</div>`;
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    buttons.forEach((btn, index) => {
        document.getElementById(`rich-btn-${index}`).onclick = () => {
            if (!btn.keepOpen) document.body.removeChild(overlay);
            if (btn.action) btn.action();
        };
    });
};

// 1. 【新規プレイ】「はじめから」選択時のログインフロー
window.showNewGameLoginChoice = function() {
    const hasElectron = (typeof require !== 'undefined');
    
    let buttons = [];
    if (hasElectron) {
        buttons.push({ text: '🎮 Steamアカウントで遊ぶ（推奨）', color: '#1b2838', border: '1px solid #66c0f4', action: () => {
            window.performSteamAutoLogin().then((success) => {
                if (success) {
                    window.showCustomAlert("連携完了", "Steamアカウントでログインしました！", () => window.executeNewGameInitialization(false));
                } else {
                    window.showCustomAlert("エラー", "Steam連携に失敗しました。\nオフラインまたはメールで開始してください。", window.showNewGameLoginChoice);
                }
            });
        }});
    }
    
    buttons.push({ text: '✉️ メール・パスワードで登録して遊ぶ', color: '#2196F3', action: () => window.showEmailRegistrationUI(true) });
    buttons.push({ text: '📴 ログインせずに遊ぶ（オフライン）', color: '#444', action: () => {
        window.showCustomAlert("確認", "オフラインで開始します。\n※オンライン機能（闘技場など）で遊ぶ場合は、あとから設定メニューでアカウントを作成できます。", () => window.executeNewGameInitialization(true));
    }});
    buttons.push({ text: '戻る', color: 'transparent', textColor: '#888', action: () => {} });

    window.showRichChoiceDialog("✨ 新しい冒険の準備", "オンライン機能（酒場や闘技場）を利用するために、\nアカウントの登録をおすすめします。", buttons);
};

// 2. 【既存プレイ】「つづきから」選択時（未ログイン者）のフロー
window.showContinueLoginChoice = function() {
    let buttons = [
        { text: '✉️ ログイン・登録して遊ぶ', color: '#4CAF50', action: () => window.showEmailRegistrationUI(false) },
        { text: '📴 そのまま（オフライン）で遊ぶ', color: '#444', action: async () => {
            window.skipAutoLogin = true;
            try { await signOut(auth); } catch (e) {}
            stopCloudTavernUploadTimer();
            localStorage.removeItem('my_player_id');
            window.forceResetArenaForLoad(); // ★オフライン進行時もリセット
            window.startActualGame(false);
        }},
        { text: '戻る', color: 'transparent', textColor: '#888', action: () => {} }
    ];
    window.showRichChoiceDialog("📡 オンライン接続", "現在オフライン（ゲスト）状態です。\nクラウド同期やオンライン機能を利用しますか？", buttons);
};

// 3. 【実際の初期化処理】（フロー完了後に呼ばれる）
window.executeNewGameInitialization = async function(isOffline) {
    if (blockDebugTestCloudWrite('ニューゲームの初期化')) return false;
    if (isOffline) {
        window.skipAutoLogin = true;
        try { await signOut(auth); } catch(e){}
        stopCloudTavernUploadTimer();
        localStorage.removeItem('my_player_name');
        localStorage.removeItem('my_player_id');
    }
    
    // 古いデータの破壊
    const safeKeys = ['bgm_volume', 'se_volume'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
        let k = localStorage.key(i);
        if (!safeKeys.includes(k)) localStorage.removeItem(k);
    }
    localStorage.setItem('force_first_play', 'true');

    if (typeof assets !== 'undefined') {
        for (let k in assets) delete assets[k];
    }
    if (window.TCG) window.TCG.myCollection = [];
    
    // システムの準備が整ったので、性格診断（ゲーム本編）へ！
    window.startActualGame(true);
};

// 4. 【データ競合解決】既存アカウントにログインした際の選択
window.handleDataConflict = function(cloudData) {
    let buttons = [
        { text: '☁️ クラウドのデータで再開（ロード）', color: '#00BCD4', action: () => {
            for (const key in cloudData) { localStorage.setItem(key, cloudData[key]); }
            localStorage.setItem('trigger_fade_in', 'true');
            window.showCustomAlert("復元完了", "クラウドのデータを復元しました。\nゲームを再起動します。", () => window.location.reload());
        }},
        { text: '💾 現在のデータで上書き（セーブ）', color: '#FF9800', action: () => {
            window.backupSaveDataToCloud();
            window.startActualGame(false);
        }}
    ];
    window.showRichChoiceDialog("⚠️ データの競合を検知", "このアカウントには既にクラウドセーブが存在します。\nどちらのデータを使用しますか？", buttons);
};

// ★新規追加：ゲームロード時に闘技場の状態を強制リセットする安全装置
window.forceResetArenaForLoad = function() {
    if (typeof window.exitArenaFacility === 'function') {
        window.exitArenaFacility();
    }
    
    // ★追加：データロード完了後に確実にAIを外に出すための監視ループ
    let resetTimer = setInterval(() => {
        if (window.aiPet) {
            window.aiPet.actionState = 'idle';
            window.aiPet.isIndoors = false;
            window.aiPet.interactionTarget = null;
            window.aiPet.indoorTarget = null;
            clearInterval(resetTimer);
        }
    }, 100);

    if (window.ARENA_STATE) window.ARENA_STATE.active = false;
    let arenaUi = document.getElementById('arena-reception-ui');
    let battleUi = document.getElementById('arena-battle-ui');
    let intUi = document.getElementById('arena-interval-ui');
    if (arenaUi) arenaUi.style.display = 'none';
    if (battleUi) battleUi.style.display = 'none';
    if (intUi) intUi.style.display = 'none';
};

// １．つづきからを選択したときに呼ばれる関数
window.showEmailRegistrationUI = function(isNewGame) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);';
    
    overlay.innerHTML = `
        <div style="background:#222; border:2px solid #2196F3; border-radius:12px; padding:30px; width:400px; color:#fff; font-family:sans-serif; box-shadow:0 15px 50px rgba(33,150,243,0.3);">
            <div style="font-size:22px; font-weight:bold; color:#2196F3; margin-bottom:10px; text-align:center;">アカウント設定</div>
            <div style="font-size:12px; color:#FF9800; margin-bottom:20px; background:rgba(255,152,0,0.1); padding:10px; border-radius:6px; border:1px solid #FF9800; line-height:1.5;">
                ※架空のメールアドレスも使用可能ですが、パスワードを忘れた場合の復旧（再発行）は二度とできなくなります。<br>自己責任でご利用ください。
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-size:13px; color:#aaa; display:block; margin-bottom:5px;">メールアドレス</label>
                <input type="email" id="temp-email" style="width:100%; padding:10px; background:#111; color:#fff; border:1px solid #444; border-radius:4px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom:20px;">
                <label style="font-size:13px; color:#aaa; display:block; margin-bottom:5px;">パスワード (6文字以上)</label>
                <input type="password" id="temp-pass" style="width:100%; padding:10px; background:#111; color:#fff; border:1px solid #444; border-radius:4px; box-sizing:border-box;">
            </div>
            
            <div id="temp-err" style="color:#F44336; font-size:13px; margin-bottom:15px; text-align:center; min-height:15px;"></div>
            
            <div style="display:flex; gap:10px;">
                <button id="temp-btn-submit" style="flex:1; background:#2196F3; color:#fff; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer;">ログイン / 新規登録</button>
                <button id="temp-btn-cancel" style="padding:12px 20px; background:#444; color:#fff; border:none; border-radius:6px; cursor:pointer;">戻る</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('temp-btn-cancel').onclick = () => document.body.removeChild(overlay);
    
    document.getElementById('temp-btn-submit').onclick = async () => {
        const email = document.getElementById('temp-email').value;
        const pass = document.getElementById('temp-pass').value;
        const err = document.getElementById('temp-err');
        
        if (!email || pass.length < 6) { err.textContent = "正しい情報を入力してください"; return; }
        
        err.style.color = "#aaa";
        err.textContent = "通信中...";
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            document.body.removeChild(overlay);
            
            if (isNewGame) {
                window.showCustomAlert("エラー", "そのアカウントは既に存在します。\n既存のデータで遊ぶ場合はタイトル画面の「つづきから」を選んでください。", () => {
                    signOut(auth); 
                });
            } else {
                const user = auth.currentUser;
                const docRef = doc(db, "user_save_data", user.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists() && docSnap.data().saveData) {
                    window.handleDataConflict(docSnap.data().saveData);
                } else {
                    window.showCustomAlert("ログイン完了", "ログインしました。\n現在のデータをクラウドに保存します。", () => {
                        window.backupSaveDataToCloud();
                        window.forceResetArenaForLoad(); // ★ここで闘技場を強制リセット
                        window.startActualGame(false);
                    });
                }
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, pass);
                    document.body.removeChild(overlay);
                    
                    if (isNewGame) {
                        window.showCustomAlert("登録完了", "新規アカウントを作成しました。\n冒険をはじめます！", () => {
                            window.forceResetArenaForLoad(); // ★ここでもリセット
                            window.executeNewGameInitialization(false);
                        });
                    } else {
                        window.showCustomAlert("登録完了", "アカウントを作成しました。\n現在のデータをクラウドに保存します。", () => {
                            window.backupSaveDataToCloud();
                            window.forceResetArenaForLoad(); // ★ここでもリセット
                            window.startActualGame(false);
                        });
                    }
                } catch (createErr) {
                    err.style.color = "#F44336";
                    err.textContent = "登録エラー: " + createErr.message;
                }
            } else {
                err.style.color = "#F44336";
                err.textContent = "パスワードが違うか、ロックされています。";
            }
        }
    };
};

// 6. 【ソフトゲート】オフライン時のオンライン機能へのアクセス制御
window.checkOnlineFeatureAccess = function() {
    if (isRegularOnlineUser()) return true; // 通常アカウントでログイン済みなら通す
    
    window.showRichChoiceDialog(
        "🔐 オンライン機能",
        "この機能（闘技場・ランキング・フレンド等）で遊ぶには、\nアカウント登録（ログイン）が必要です。",
        [
            { text: '今すぐ登録・ログインする', color: '#2196F3', action: () => window.showEmailRegistrationUI(false) },
            { text: '閉じる', color: '#444', action: () => {} }
        ]
    );
    return false;
};

// 各オンラインUIを開く既存の関数を上書きして、ソフトゲートをかませる
const _legacy_openArenaReception = typeof window.openArenaReception === 'function' ? window.openArenaReception : null;
if (_legacy_openArenaReception) {
    window.openArenaReception = function() {
        if (window.checkOnlineFeatureAccess()) _legacy_openArenaReception();
    };
}
const _legacy_renderDungeonRankingList = typeof window.renderDungeonRankingList === 'function' ? window.renderDungeonRankingList : null;
if (_legacy_renderDungeonRankingList) {
    window.renderDungeonRankingList = function(mapType) {
        if (window.checkOnlineFeatureAccess()) _legacy_renderDungeonRankingList(mapType);
    };
}
