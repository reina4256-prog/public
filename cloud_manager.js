// Firebaseの最新モジュールをインターネット(CDN)から直接読み込む
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// ★修正：getDoc（データを読み込む部品）を追加しました
import { getFirestore, doc, setDoc, getDocs, getDoc, collection, query, where, orderBy, limit, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

    if (user) {
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
        
    } else {
        console.log("❌ ログアウト状態です");
        if (loginBtn) {
            loginBtn.innerHTML = "🔐 ログイン";
            loginBtn.style.background = "#2196F3";
        }
        if (guestMenu) guestMenu.style.display = "block";
        if (loggedInMenu) loggedInMenu.style.display = "none";
        
        // パスワード入力欄などをリセット
        const errorMsg = document.getElementById('authErrorMessage');
        if (errorMsg) errorMsg.textContent = "";
    }
});

// ==========================================
// 🏷️ プレイヤー名のチェックと登録機能
// ==========================================

// ログイン直後に、名前が登録されているかチェックする
window.checkAndPromptPlayerName = async function(user) {
    try {
        const docRef = doc(db, "player_profiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().playerName) {
            // 既に名前があればローカルに保存して終了
            localStorage.setItem('my_player_name', docSnap.data().playerName);
            console.log("✅ プレイヤー名確認完了:", docSnap.data().playerName);
        } else {
            // まだ名前がない場合は、登録画面を強制表示！
            document.getElementById('playerNameOverlay').classList.add('active');
        }
    } catch (error) {
        console.error("名前チェックエラー:", error);
    }
};

// 登録ボタンを押した時の処理（重複チェック！）
window.registerPlayerName = async function() {
    const user = auth.currentUser;
    if (!user) return;

    const inputName = document.getElementById('inputPlayerName').value.trim();
    const errorMsg = document.getElementById('playerNameErrorMessage');

    if (!inputName || inputName.length < 2) {
        errorMsg.textContent = "2文字以上の名前を入力してください。";
        return;
    }

    try {
        errorMsg.textContent = "名前が使えるか確認中...";
        errorMsg.style.color = "#aaa";

        // Firestoreの「player_profiles」全体から、同じ名前の人がいないか検索する！
        const q = query(collection(db, "player_profiles"), where("playerName", "==", inputName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // 既に同じ名前の人が見つかった場合
            errorMsg.textContent = "❌ その名前は既に他のプレイヤーが使用しています。";
            errorMsg.style.color = "#F44336";
            return;
        }

        // 誰も使っていなければ、自分のUIDの場所に名前を保存する
        await setDoc(doc(db, "player_profiles", user.uid), {
            playerName: inputName,
            createdAt: Date.now()
        });

        // ローカルにも保存して、画面を閉じる
        localStorage.setItem('my_player_name', inputName);
        document.getElementById('playerNameOverlay').classList.remove('active');
        alert(`プレイヤー名を「${inputName}」に決定しました！`);

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
    const user = auth.currentUser;
    if (!user) return alert("ログインが必要です！");

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
    const user = auth.currentUser;
    if (!user) return alert("ログインが必要です！");

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
    if (typeof window.aiPet === 'undefined' || !window.aiPet.stats) return;
    let myPlayerId = localStorage.getItem('my_player_id');
    if (!myPlayerId) {
        myPlayerId = 'player_' + Date.now() + Math.floor(Math.random() * 1000);
        localStorage.setItem('my_player_id', myPlayerId);
    }
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
    try { await setDoc(doc(db, "tavern_ais", myPlayerId), cloudData); } catch (error) { }
};

window.fetchCloudAIs = async function() {
    try {
        const q = query(collection(db, "tavern_ais"), orderBy("lastUpdated", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        let aiList = [];
        let myPlayerId = localStorage.getItem('my_player_id');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.playerId !== myPlayerId) aiList.push(data);
        });
        return aiList;
    } catch (error) { return []; }
};

window.uploadMyDeckToCloud = async function(myId, uploadData) {
    try { await setDoc(doc(db, "tcg_online_decks", myId), uploadData); return true; } catch (error) { return false; }
};

window.fetchOnlineDecks = async function() {
    try {
        const q = query(collection(db, "tcg_online_decks"), orderBy("updatedAt", "desc"), limit(15));
        const querySnapshot = await getDocs(q);
        let deckList = [];
        let myId = localStorage.getItem('my_player_id');
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.playerId !== myId) deckList.push(data);
        });
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
    const user = auth.currentUser;
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

window.fetchDungeonRanking = async function(mapType) {
    try {
        // ★ 修正：コレクションを分けているので、orderBy（並び替え）単体でエラーなく取得できる！
        const collectionName = `dungeon_rankings_${mapType}`;
        const q = query(collection(db, collectionName), orderBy("floor", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let rankList = [];
        querySnapshot.forEach((doc) => {
            rankList.push(doc.data());
        });
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
    const user = auth.currentUser;
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
    const myId = auth.currentUser ? auth.currentUser.uid : null;
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
    const user = auth.currentUser;
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

setInterval(() => {
    // 【絶対安全装置】
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode === 'play') { window.uploadMyAIToCloud(); }
}, 30000);

// ==========================================
// ⚔️ 闘技場（アリーナ）：オンラインランキング機能
// ==========================================

window.updateArenaRanking = async function(reachedWave, partyData) {
    const user = auth.currentUser;
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

window.fetchArenaRanking = async function(mode = 'normal') {
    try {
        // ★修正：引数のモードで取得先のコレクションを切り替える
        const collectionName = mode === 'boss' ? "arena_rankings_boss" : "arena_rankings";
        const q = query(collection(db, collectionName), orderBy("wave", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        let rankList = [];
        querySnapshot.forEach((doc) => {
            rankList.push(doc.data());
        });
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
    let myId = localStorage.getItem('my_player_id');
    if (!myId) return;

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
    if (user) setTimeout(() => { if (typeof window.processTradeMailbox === 'function') window.processTradeMailbox(); }, 5000);
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
    const user = auth.currentUser;
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

window.fetchTCGMarketItems = async function() {
    try {
        const q = query(collection(db, "tcg_market"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        let items = [];
        snap.forEach(d => {
            let data = d.data();
            data.docId = d.id;
            items.push(data);
        });
        return items;
    } catch(e) { console.error(e); return []; }
};

window.buyTCGMarketItem = async function(docId, cardData, price, sellerId) {
    const user = auth.currentUser;
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
    try { await deleteDoc(doc(db, "tcg_market", docId)); return true; } 
    catch(e) { console.error(e); return false; }
};

// ==========================================
// 🚀 Steam IDを利用した完全自動ログイン処理
// ==========================================
window.performSteamAutoLogin = async function() {
    if (typeof require === 'undefined') return false; // ブラウザ版の場合はスキップ
    const { ipcRenderer } = require('electron');
    if (!ipcRenderer) return false;

    try {
        // Electron側からSteam情報を取得
        const steamInfo = await ipcRenderer.invoke('get-steam-info');
        if (!steamInfo) {
            console.log("Steam情報が取得できませんでした。オフラインモードで続行します。");
            return false;
        }

        const steamId = steamInfo.steamId;
        const steamName = steamInfo.name;

        // Steam IDから擬似的なメールアドレスとパスワードを生成
        const email = `steam_${steamId}@aipetgame.local`;
        const password = `SteamAuto_${steamId}_SecretKey`; // 簡易的なパスワード

        try {
            // ログイン試行
            await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Steam連携ログイン成功:", steamName);
            localStorage.setItem('my_player_name', steamName); // ローカルにも名前を保存
            return true;
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                // アカウントが存在しない場合は新規作成してログイン
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("✨ Steam連携アカウント新規作成成功:", steamName);
                localStorage.setItem('my_player_name', steamName);
                return true;
            }
            console.error("Steam連携ログインエラー:", err);
            return false;
        }
    } catch (e) {
        console.error("Steam連携 IPC通信エラー:", e);
        return false;
    }
};

// ファイル読み込み時に自動でログインを実行する
setTimeout(() => {
    window.performSteamAutoLogin();
}, 1000); // 起動直後の安全のために1秒後に実行