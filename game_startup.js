// Shared local startup must remain available without Firebase or a network connection.
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

window.executeNewGameInitialization = async function(isOffline) {
    let protectedSession;
    try { protectedSession = JSON.parse(localStorage.getItem('debug_test_session_v1') || 'null'); }
    catch (error) { console.error(error); return false; }
    if (protectedSession && protectedSession.active) return false;
    const residentRestart = window.Residents && window.aiPet ? window.Residents.newGameArchive(window.aiPet) : null;
    if (residentRestart) {
        try { localStorage.setItem('ai_pet_data_v1', JSON.stringify(residentRestart)); }
        catch (error) { console.error(error); window.ResidentUI.notify('保存できませんでした。もう一度お試しください。'); return false; }
    }
    if (isOffline) {
        window.skipAutoLogin = true;
        if (typeof window.silentSignOutForNewGame === 'function') await window.silentSignOutForNewGame();
        localStorage.removeItem('my_player_name');
        localStorage.removeItem('my_player_id');
    }

    // 古いデータの破壊
    const safeKeys = ['bgm_volume', 'se_volume'];
    if (residentRestart) safeKeys.push('ai_pet_data_v1');
    for (let i = localStorage.length - 1; i >= 0; i--) {
        let k = localStorage.key(i);
        if (!safeKeys.includes(k)) localStorage.removeItem(k);
    }
    localStorage.setItem('force_first_play', 'true');

    if (residentRestart) Object.assign(window.aiPet, residentRestart);
    window.disposeResidentHome?.();
    delete window.aiPet.pendingInheritanceData;
    delete window.aiPet.demoProgress;
    delete window.aiPet.demoImport;
    window.pendingInheritanceData = null;
    window._residentSuccessionResuming = false;
    window._residentDeathShopOpened = false;

    if (typeof assets !== 'undefined') {
        for (let k in assets) delete assets[k];
    }
    if (window.TCG) window.TCG.myCollection = [];

    // システムの準備が整ったので、性格診断（ゲーム本編）へ！
    window.startActualGame(true);
};

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

if (window.GameRelease && !window.GameRelease.online) {
    window.skipAutoLogin = true;
    window.isOnlineAccountLoggedIn = () => false;
    window.checkOnlineFeatureAccess = () => false;
    window.showNewGameLoginChoice = () => window.executeNewGameInitialization(true);
    window.showContinueLoginChoice = () => {
        window.forceResetArenaForLoad();
        window.startActualGame(false);
    };
}
