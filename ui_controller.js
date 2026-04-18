// ui_controller.js : UI操作 (Fixed Version v45 - Absolute UI Safety & Evolution Button Fix)

// ==========================================
// ★ 追加：いつでも呼び出せる汎用チュートリアルウィンドウ
// ==========================================
window.showGameTutorial = function(title, message, callback) {
    // 既に開いていたらスキップ
    if (document.getElementById('in-game-tutorial')) return;

    // ボタンのホバー効果用CSS
    if (!document.getElementById('tutorial-css')) {
        const style = document.createElement('style');
        style.id = 'tutorial-css';
        style.innerHTML = `.tut-btn:hover { background: #e68a00 !important; }`;
        document.head.appendChild(style);
    }

    const tutBox = document.createElement('div');
    tutBox.id = 'in-game-tutorial';
    tutBox.style.position = 'absolute';
    tutBox.style.top = '40%';
    tutBox.style.left = '50%';
    tutBox.style.transform = 'translate(-50%, -50%)';
    tutBox.style.background = 'rgba(20, 20, 20, 0.95)';
    tutBox.style.border = '2px solid #FF9800';
    tutBox.style.borderRadius = '8px';
    tutBox.style.padding = '20px';
    tutBox.style.color = '#fff';
    tutBox.style.width = '320px';
    tutBox.style.textAlign = 'center';
    tutBox.style.boxShadow = '0 0 20px rgba(255, 152, 0, 0.5)';
    tutBox.style.zIndex = '10000';

    tutBox.innerHTML = `
        <div style="color: #FF9800; font-size: 18px; font-weight: bold; margin-bottom: 10px;">📖 ${title}</div>
        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #ddd;">
            ${message}
        </div>
        <button id="tut-close-btn" class="tut-btn" style="background: #FF9800; color: #fff; border: none; padding: 10px 30px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 15px; transition: 0.2s;">わかった！</button>
    `;
    document.body.appendChild(tutBox);

    document.getElementById('tut-close-btn').onclick = () => {
        if (tutBox.parentNode) tutBox.parentNode.removeChild(tutBox);
        if (callback) callback(); // 閉じた後に何か実行したい場合は実行
    };
};

window.switchRightPanel = function(panelId) {
    // 1. 旧仕様の右パネル（side-panelなど）の制御
    const panels = document.querySelectorAll('.panel-view');
    panels.forEach(p => p.classList.remove('active'));

    // 今回独立させたオーバーレイ（独立ウィンドウ）のリスト
    const overlayPanels = ['inventory', 'schedule', 'rescue', 'shop', 'tavern'];

    // 'default' または 独立ウィンドウを開く場合は、右側は常に 'panel-default'(AIコマンド) を表示しておく
    if (panelId === 'default' || overlayPanels.includes(panelId)) {
        let defaultPanel = document.getElementById('panel-default');
        if (defaultPanel) defaultPanel.classList.add('active');
    } else {
        let targetRight = document.getElementById('panel-' + panelId);
        if (targetRight && targetRight.classList.contains('panel-view')) {
            targetRight.classList.add('active');
        }
    }

    // 2. 新仕様の独立オーバーレイを全て閉じる（重複表示を防ぐため）
    overlayPanels.forEach(id => {
        const el = document.getElementById('panel-' + id);
        if (el) el.classList.remove('active');
    });

    // 閉じる操作('default')の場合はここで終了
    if (panelId === 'default') return;

    // 対象が独立ウィンドウなら、それをアクティブにして浮かせる
    if (overlayPanels.includes(panelId)) {
        const targetOverlay = document.getElementById('panel-' + panelId);
        if (targetOverlay) targetOverlay.classList.add('active');
    }

    // --- 3. 各メニュー専用の更新関数を叩く ---
    if (panelId === 'build') { openBuildMenuPanel(); } 
    else if (panelId === 'inventory') { openInventoryPanel(); } 
    else if (panelId === 'schedule') { updateScheduleList(); } 
    else if (panelId === 'shop') { window.updateShopList(); }
    else if (panelId === 'rescue') { window.updateRescueList(); } 
    else if (panelId === 'tavern') { window.openTavernPanel(); } 
    else if (panelId === 'ranking') { window.openRankingPanel('power'); }

    // --- 4. ショップ退出時の特別な処理 ---
    if (panelId !== 'shop' && typeof aiPet !== 'undefined' && aiPet.actionState === 'inside') {
        if (aiPet.indoorTarget && aiPet.indoorTarget.type === 'shop') {
            aiPet.actionState = 'exiting';
            aiPet.indoorTarget = null;
            if(aiPet.schedule && aiPet.schedule.length > 0) aiPet.schedule.shift();
        }
    }
    
    if (typeof updateAIStatusText === 'function') updateAIStatusText();
};

function applyTranslations() {
    const trans = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : {
        gen: "世代", age: "年齢", energy: "体力", hunger: "満腹",
        intel: "賢さ", power: "活力", mood: "機嫌", beauty: "美しさ", speed: "素早さ", type: "性格", gold: "所持金", trait: "特性", weather: "天気", time: "日時"
    };
    const map = {
        'label-gen': trans.gen, 'label-age': trans.age, 'label-energy': trans.energy, 'label-hunger': trans.hunger,
        'label-intel': trans.intel, 'label-power': trans.power, 'label-mood': trans.mood, 'label-type': trans.type,
        'label-gold': trans.gold, 'label-beauty': trans.beauty, 'label-speed': trans.speed, 'label-trait': trans.trait, 'label-weather': trans.weather, 'label-time': trans.time || "日時",
        'label-health': trans.health || "健康", // ★追加
        'label-detail-beauty': trans.beauty,
        'label-detail-speed': trans.speed
    };
    for (let id in map) { const el = document.getElementById(id); if (el) el.innerText = map[id]; }
}

function updateAIStatusText() {
    const el = document.getElementById('ai-status-text');
    if (!el || typeof aiPet === 'undefined') return;
    
    if (aiPet.schedule && aiPet.schedule.length > 0) {
        const currentTask = aiPet.schedule[0];
        const taskName = (typeof getTaskName === 'function') ? getTaskName(currentTask.type) : currentTask.type;
        
        let timeRemaining = currentTask.duration > 0 ? currentTask.duration : 0;
        let maxTime = currentTask.maxDuration || Math.max(1, currentTask.duration);
        let progressPercent = 100 - ((timeRemaining / maxTime) * 100);
        
        // ★修正: 毎秒HTMLを壊さないよう、一度だけ枠組みを作り、あとは中身だけ書き換える
        if (el.dataset.mode !== 'active') {
             el.dataset.mode = 'active';
             el.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span id="st-task-name" style="color:#fff; font-weight:bold; font-size: 15px;"></span>
                    <span id="st-task-time" style="color:#FFC107; font-size: 12px; font-weight:bold; background: rgba(255,193,7,0.2); padding: 2px 8px; border-radius: 10px;"></span>
                </div>
                <div style="margin-top: 10px; background: #222; height: 8px; border-radius: 4px; overflow: hidden; border: 1px solid #444;">
                    <div id="st-task-bar" style="background: linear-gradient(90deg, #00bcd4, #4fc3f7); width: 0%; height: 100%; transition: width 0.5s;"></div>
                </div>
                <div id="st-task-queue" style="margin-top: 8px; font-size:11px; color:#aaa;"></div>
                <div style="margin-top: 12px; text-align: right;">
                    <button onclick="window.clearSchedule();" style="background: #d32f2f; color: white; border: 1px solid #b71c1c; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; box-shadow: 0 2px rgba(0,0,0,0.5);" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='none';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px rgba(0,0,0,0.5)';">■ 行動を中止する</button>
                </div>
             `;
             el.parentElement.style.border = "1px solid #00bcd4";
             el.parentElement.style.boxShadow = "0 0 10px rgba(0, 188, 212, 0.2)";
        }
        
        // テキストとバーの長さだけを更新
        const nameEl = document.getElementById('st-task-name'); if(nameEl) nameEl.innerText = taskName;
        const timeEl = document.getElementById('st-task-time'); if(timeEl) timeEl.innerText = `⏳ 残り ${timeRemaining} 分`;
        const barEl = document.getElementById('st-task-bar'); if(barEl) barEl.style.width = `${progressPercent}%`;
        const queueEl = document.getElementById('st-task-queue');
        if(queueEl) {
            if (aiPet.schedule.length > 1) queueEl.innerText = `📝 待機中の予定: 他 ${aiPet.schedule.length - 1} 件`;
            else queueEl.innerText = "";
        }
    } else {
        if (el.dataset.mode !== 'idle') {
            el.dataset.mode = 'idle';
            el.innerHTML = `
                <div style="color: #aaa; text-align: center; padding: 10px 0;">
                    <div style="font-size: 24px; margin-bottom: 5px;">☕</div>
                    AIは自由に行動しています<br>
                    <span style="font-size:11px; color:#777;">（下のアクションを押して指示を出せます）</span>
                </div>
            `;
            el.parentElement.style.border = "1px solid #444";
            el.parentElement.style.boxShadow = "none";
        }
    }
}

window.openStatusMenu = function() {
    const overlay = document.getElementById('statusOverlay');
    if (!overlay || typeof aiPet === 'undefined' || !aiPet.stats) return;

    document.getElementById('s-gen').innerText = aiPet.generation || 1;
    document.getElementById('s-age').innerText = aiPet.age || 0;
    
    document.getElementById('s-type').innerText = window.getPersonalityType(aiPet.stats);

    let skin = aiPet.currentSkin || 'robot';
    let baseType = skin.split('_')[0] || 'robot';
    let tData = (typeof charaTraits !== 'undefined') ? (charaTraits[skin] || charaTraits[baseType] || charaTraits['robot']) : null;
    
    let traitName = tData ? tData.name : "-";
    if (aiPet.apprentice && aiPet.apprentice.title) {
        traitName = `🏆${aiPet.apprentice.title} / ` + traitName;
    }
    document.getElementById('s-trait').innerText = traitName;
    
    const traitDescEl = document.getElementById('s-trait-desc');
    if (traitDescEl) traitDescEl.innerText = tData ? (tData.desc || "") : "";

    document.getElementById('status-name').innerText = (typeof monsterBookData !== 'undefined' && monsterBookData[skin]) ? monsterBookData[skin].name : "???";

    document.getElementById('s-energy').innerText = Math.floor(aiPet.energy || 0);
    document.getElementById('s-hunger').innerText = Math.floor(aiPet.hunger || 0);
    
    document.getElementById('s-intel').innerText = window.formatLargeNumber(aiPet.stats.intel);
    document.getElementById('s-power').innerText = window.formatLargeNumber(aiPet.stats.power);
    document.getElementById('s-mood').innerText = window.formatLargeNumber(aiPet.stats.mood);
    
    const beautyEl = document.getElementById('s-beauty');
    if (beautyEl) beautyEl.innerText = window.formatLargeNumber(aiPet.stats.beauty);

    const speedEl = document.getElementById('s-speed');
    if (speedEl) speedEl.innerText = window.formatLargeNumber(aiPet.stats.speed);

    document.getElementById('s-gold').innerText = window.formatLargeNumber(aiPet.gold) + " G";

    const canvas = document.getElementById('statusIconCanvas');
    if (typeof drawStatusIconOnCanvas === 'function') drawStatusIconOnCanvas(canvas, skin);

    // --- 右側（ライセンス・スキル）の動的生成 ---
    const rightPanel = document.getElementById('status-right-panel');
    if (rightPanel) {
        let html = "";
        const app = aiPet.apprentice || {};

        const metMasters = app.metMasters || [];
        const attempts = app.attempts || {};
        let totalAttempts = 0;
        for (let k in attempts) totalAttempts += attempts[k];

        let masteredCount = 0;
        const jobKeys = ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'];
        jobKeys.forEach(j => { if (app.rank && app.rank[j] >= 10) masteredCount++; });

        let phase = 1;
        if (app.currentMaster || masteredCount > 0 || (app.retired && Object.keys(app.retired).length > 0) || app.isExcommunicated) {
            phase = 4; 
        } else if (totalAttempts > 0) {
            phase = 3; 
        } else if (metMasters.length > 0) {
            phase = 2; 
        }

        html += `<div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #4CAF50; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">`;
        
        if (phase === 1) {
            html += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px; font-size: 15px;">❓ まだ見ぬ出会い</div>`;
            html += `<div style="font-size: 12px; color: #888; text-align: center; padding: 10px;">いろいろな場所を歩き回ってみましょう。<br>新しい出会いが待っているかもしれません。</div>`;
        } else if (phase === 2) {
            html += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px; font-size: 15px;">🤝 新たな出会い</div>`;
            html += `<div style="font-size: 12px; color: #888; text-align: center; padding: 10px;">出会った人たちの元へ遊びに行くことができます。<br>チャットで「（名前）のところへ」と入力して会いに行ってみましょう！</div>`;
        } else if (phase === 3) {
            html += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px; font-size: 15px;">🎓 専門家への入門</div>`;
            html += `<div style="font-size: 12px; color: #888; text-align: center; padding: 10px;">出会った専門家の元へ通うことができます。<br>チャットで「〇〇のところへ」と入力し、弟子入り試験に挑戦しましょう！</div>`;
        } else {
            html += `<div style="color: #4CAF50; font-weight: bold; margin-bottom: 10px; font-size: 15px;">🎓 現在の専門家と課題</div>`;
            
            if (masteredCount === 6) {
                html += `<div style="font-size: 13px; color: #FFD700; font-weight: bold; text-align: center; padding: 10px;">👑 全知全能の達人 👑<br><span style="font-size:11px; color:#ccc; font-weight:normal;">この世界に存在するすべての道を極めました！<br>悠々自適な余生を満喫しましょう。</span></div>`;
            } else if (app.currentMaster) {
                const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
                const mName = masterNames[app.currentMaster] || "不明";
                const rank = app.rank[app.currentMaster] || 1;
                
                html += `<div style="font-size: 13px; color: #fff; margin-bottom: 8px;">専門家: <span style="color:#FFC107; font-weight:bold;">${mName} (ランク ${rank})</span></div>`;
                
                if (app.isGraduated) {
                    html += `<div style="font-size: 13px; color: #FFD700; font-weight: bold; text-align: center; padding: 10px; background: rgba(255,215,0,0.1); border-radius: 4px;">✨ 免許皆伝 ✨<br><span style="font-size:11px; color:#ccc; font-weight:normal;">修行を終え、立派な達人になりました！<br>（フィールドを歩けば、まだ見ぬ他の師匠に出会えるかもしれません）</span></div>`;
                } else {
                    // ★完全修正：activeQuests から現在の師匠の課題（本業＆バイト）を抽出して描画！
                    let currentMasterQuests = (app.activeQuests || []).filter(q => q.masterType === app.currentMaster && q.rank !== 0);

                    if (currentMasterQuests.length > 0) {
                        html += `<div style="background: #222; padding: 8px; border-radius: 4px; border-left: 3px solid #FFC107;">`;
                        
                        currentMasterQuests.forEach((q, idx) => {
                            let progressStr = "";
                            const desc = q.desc;
                            let isItemQuest = true;
                            
                            let isStatQuest = false;
                            let statVal = 0;
                            if (desc.includes("賢さ") || desc.includes("知性")) { isStatQuest = true; statVal = aiPet.stats.intel; }
                            else if (desc.includes("活力") || desc.includes("パワー") || desc.includes("体力")) { isStatQuest = true; statVal = aiPet.stats.power; }
                            else if (desc.includes("美しさ")) { isStatQuest = true; statVal = aiPet.stats.beauty; }
                            else if (desc.includes("素早さ")) { isStatQuest = true; statVal = aiPet.stats.speed; }

                            if (isStatQuest) {
                                // インフレ対応：上昇量で表示
                                let match = desc.match(/[＋\+](\d+)/); 
                                if (match) {
                                    let reqIncrease = parseInt(match[1], 10);
                                    let startVal = q.qVal - reqIncrease; 
                                    let currentIncrease = Math.max(0, Math.floor(statVal - startVal));
                                    if (currentIncrease > reqIncrease) currentIncrease = reqIncrease;
                                    progressStr = `<span style="color:#FF9800;">(進捗: 上昇量 +${currentIncrease} / +${reqIncrease})</span>`;
                                } else {
                                    let currentVal = window.formatLargeNumber(statVal);
                                    let targetVal = window.formatLargeNumber(q.qVal);
                                    progressStr = `<span style="color:#FF9800;">(現在の能力: ${currentVal} / 目標: ${targetVal})</span>`;
                                }
                            } else {
                                // ★修正：文字列ではなく配列（itemsStr）で収集する
                                let itemsStr = [];
                                const inv = aiPet.inventory || [];
                                
                                // ★新規追加：上限でストップし、達成した項目だけ緑色にする専用関数
                                const formatReq = (name, current, req) => {
                                    if (current >= req) return `${name}: <span style="color:#4CAF50; font-weight:bold;">${req} / ${req}(達成)</span>`;
                                    return `${name}: ${current} / ${req}`;
                                };
                                
                                if (desc.includes("良質な木材")) itemsStr.push(formatReq("良質な木材", inv.filter(i => i === 'high_wood').length, 3));
                                else if (desc.includes("木材")) itemsStr.push(formatReq("木材", inv.filter(i => i === 'wood').length, desc.includes("10個") ? 10 : (desc.includes("5つ") ? 5 : 3)));
                                
                                if (desc.includes("硬い石")) itemsStr.push(formatReq("硬い石", inv.filter(i => i === 'high_stone').length, 3));
                                else if (desc.includes("石")) itemsStr.push(formatReq("石", inv.filter(i => i === 'stone').length, desc.includes("10個") ? 10 : (desc.includes("5つ") ? 5 : 3)));
                                
                                if (desc.includes("練習用装備")) itemsStr.push(formatReq("練習用装備", inv.filter(i => typeof i === 'string' && i.includes('_practice_')).length, 3));
                                if (desc.includes("鉄くず")) itemsStr.push(formatReq("鉄くず", inv.filter(i => i === 'scrap_metal').length, 3));
                                if (desc.includes("芸術品")) itemsStr.push(formatReq("芸術品", inv.filter(i => typeof i === 'string' && i.includes('_art_')).length, 3));
                                
                                if (desc.includes("ヌシ")) itemsStr.push(formatReq("ヌシ", inv.filter(i => i === 'fish_boss_river' || i === 'fish_boss_sea').length, 1));
                                else if (desc.includes("魚")) itemsStr.push(formatReq("魚", inv.filter(i => typeof i === 'string' && i.startsWith('fish_')).length, desc.includes("3匹") ? 3 : 1));
                                
                                if (desc.includes("質のいい")) itemsStr.push(formatReq("質のいい野菜", inv.filter(i => typeof i === 'string' && i.startsWith('high_')).length, 3));
                                if (desc.includes("普通の試作料理")) itemsStr.push(formatReq("普通の試作料理", inv.filter(i => i === 'food_practice_normal').length, 3));
                                if (desc.includes("究極の試作料理")) itemsStr.push(formatReq("究極の試作料理", inv.filter(i => i === 'food_practice_great').length, 3));
                                if (desc.includes("練習用の図面")) itemsStr.push(formatReq("練習用の図面", inv.filter(i => i === 'build_practice_normal').length, 3));
                                if (desc.includes("建築模型")) itemsStr.push(formatReq("精巧な建築模型", inv.filter(i => i === 'build_practice_great').length, 3));

                                if (itemsStr.length === 0) isItemQuest = false;
                                if (q.isBaitoQuest) isItemQuest = false; // バイトの場合は強制的に除外

                                if (isItemQuest) {
                                    // ★配列を ' , ' で結合して表示！（区切りのカンマは目立たないようにグレーにする）
                                    progressStr = `<span style="color:#FF9800;">(進捗: ${itemsStr.join(' <span style="color:#aaa;">,</span> ')})</span>`;
                                }
                            }

                            if (!isStatQuest && !isItemQuest) {
                                let reqCount = q.targetCount || "?";
                                if (!q.isBaitoQuest) {
                                    let match = desc.match(/(\d+)回/);
                                    reqCount = match ? match[1] : "?";
                                }
                                progressStr = `<span style="color:#FF9800;">(進捗: ${Math.floor(q.qVal)} / ${reqCount} 回完了)</span>`;
                            }

                            // ★追加：条件達成（クリア）判定を行い、達成していれば緑色のメッセージで上書きする！
                            let isCleared = false;
                            const qData = typeof aiPet.getMasterQuestData === 'function' ? aiPet.getMasterQuestData(q.masterType, q.rank) : null;
                            
                            // check()関数が正しく判定できるよう、一時的にqValをセットする
                            if (aiPet.apprentice) aiPet.apprentice.qVal = q.qVal; 

                            if (q.isBaitoQuest) {
                                isCleared = (q.qVal >= q.targetCount);
                            } else {
                                isCleared = (qData && qData.check) ? qData.check() : false;
                            }

                            if (isCleared) {
                                progressStr = `<div style="color:#4CAF50; font-weight:bold; margin-top:5px; font-size:12px;">✅ 条件達成！報告しよう</div>`;
                            }

                            let icon = q.isBaitoQuest ? "💰" : "📜";
                            let isLast = idx === currentMasterQuests.length - 1;
                            html += `
                                <div style="margin-bottom: ${isLast ? '0' : '8px'}; padding-bottom: ${isLast ? '0' : '8px'}; border-bottom: ${isLast ? 'none' : '1px dashed rgba(255,255,255,0.2)'};">
                                    <div style="font-weight:bold; color:#fff; margin-bottom: 3px;">${icon} ${q.name}</div>
                                    <div style="font-size: 11px; color:#ccc; line-height: 1.4;">${q.desc} <br>${progressStr}</div>
                                </div>
                            `;
                        });
                        html += `</div>`;
                    } else {
                        html += `<div style="font-size: 12px; color: #888; background: #222; padding: 8px; border-radius: 4px;">現在受けている課題はありません。<br>チャットで「${mName}のところへ」と入力して課題をもらいましょう。</div>`;
                    }
                }
            } else if (app.isExcommunicated) {
                let remain = 10 - (app.exileTrainingCount || 0);
                html += `<div style="font-size: 13px; color: #ff5252; font-weight: bold; background: rgba(244,67,54,0.1); padding: 10px; border-radius: 4px;">現在、破門されています...<br><span style="font-size:11px; color:#aaa; font-weight:normal; line-height:1.5; display:inline-block; margin-top:5px;">勉強・筋トレ・ランニングのいずれかを行い、自分を見つめ直しましょう。<br>（破門解除まで あと <span style="font-size:14px; font-weight:bold; color:#ff5252;">${remain}</span> 回）</span></div>`;
            } else {
                html += `<div style="font-size: 12px; color: #888; text-align: center; padding: 10px;">現在入門している専門家はいません。<br>チャットで専門家の元へ行き、弟子入りしましょう。</div>`;
            }
        }
        
        html += `</div>`;

        // 2. 職業ライセンス（フェーズごとの動的表示）
        html += `<div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #333; margin-top: 10px;">`;
        
        let titleText = "🌟 ？？？";
        if (phase >= 3) titleText = "🌟 職業ライセンス (入門状況)";
        else if (phase === 2) titleText = "🌟 交友関係";

        html += `<div style="color: #E040FB; font-weight: bold; margin-bottom: 10px; font-size: 14px;">${titleText}</div>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
        
        const jobs = [
            { id: 'explore', 'name': '冒険家', icon: '⛰️' },
            { id: 'farming', 'name': '農家', icon: '🌾' },
            { id: 'fishing', 'name': '漁師', icon: '🎣' },
            { id: 'cooking', 'name': '料理人', icon: '🍳' },
            { id: 'smithing', 'name': '鍛冶師', icon: '⚒️' },
            { id: 'building', 'name': '建築士', icon: '🔨' }
        ];
        
        jobs.forEach(j => {
            let isMet = metMasters.includes(j.id);
            const r = (app.rank && app.rank[j.id]) ? app.rank[j.id] : 0;
            
            let displayName = isMet ? j.name : "？？？";
            let displayIcon = isMet ? j.icon : "❓";
            let rankText = "---";
            let boxStyle = `border: 1px solid #444; background: #222;`;

            let isExcommunicated = (app.excommunicatedFrom === j.id);
            // ★修正後（上書き）：retired（過去の師匠）を皆伝扱いから外す！
            let isCurrentOrMastered = (app.currentMaster === j.id) || (r >= 10);
            let isFailed = (!isExcommunicated && !isCurrentOrMastered && app.attempts && app.attempts[j.id] >= 3);

            if (phase === 1) {
                displayName = "？？？"; displayIcon = "❓"; rankText = "---";
            } else if (phase === 2) {
                if (isMet) rankText = `<span style="color:#aaa;">顔見知り</span>`;
            } else if (phase >= 3) {
                if (isExcommunicated) {
                    rankText = `<div style="color:#ff5252; font-weight:bold; font-size:11px; line-height:1.2; text-align:right;">破門<br>(再入門不可)</div>`;
                    boxStyle = `border: 1px solid #f44336; background: rgba(244,67,54,0.1);`;
                    displayName = j.name; displayIcon = j.icon;
                } else if (isFailed) {
                    rankText = `<div style="color:#ff5252; font-weight:bold; font-size:11px; line-height:1.2; text-align:right;">見放された<br>(入門不可)</div>`;
                    boxStyle = `border: 1px solid #f44336; background: rgba(244,67,54,0.1);`;
                    displayName = j.name; displayIcon = j.icon;
                } else if (isMet || r > 0) {
                    if (r === 0) {
                        rankText = `<span style="color:#555;">未入門</span>`;
                    } else if (r >= 10) {
                        rankText = `<span style="color:#FFD700; font-weight:bold;">皆伝!</span>`;
                        boxStyle = `border: 1px solid #FFD700; background: rgba(255,215,0,0.1);`;
                    } else {
                        rankText = `<span style="color:#fff;">Lv.${r}</span>`;
                    }
                    displayName = j.name; displayIcon = j.icon;
                }
            }

            if (app.currentMaster === j.id) boxStyle = `border: 1px solid #4CAF50; background: rgba(76,175,80,0.1);`;
            
            html += `
            <div style="padding: 8px 10px; border-radius: 6px; ${boxStyle} display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #ddd; white-space: nowrap; flex-shrink: 0;">${displayIcon} ${displayName}</span>
                <span style="font-size: 13px; text-align: right;">${rankText}</span>
            </div>
            `;
        });
        html += `</div></div>`;

        rightPanel.innerHTML = html;
    }

    overlay.classList.add('active');
};

function drawStatusIconOnCanvas(canvas, type) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let conf = aiConfigs[type];
    if (!conf) return;

    if (conf.img && aiConfigs[conf.img] && aiConfigs[conf.img].actions) {
        conf = aiConfigs[conf.img];
    }

    let imgKey = conf.img || type;
    let img = images[imgKey];
    if (!img) {
        const base = type.split('_')[0];
        img = images[base];
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const actionData = conf.actions['idle'];
    if (!actionData || actionData.length === 0) return;
    const f = actionData[0];

    const scale = Math.min(canvas.width / f.sw, canvas.height / f.sh) * 0.9;
    const drawW = f.sw * scale;
    const drawH = f.sh * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, dx, dy, drawW, drawH);
}

function openBuildMenuPanel() {
    const list = document.getElementById('buildList'); if (!list) return; list.innerHTML = ""; 
    const myItems = {}; if (aiPet.inventory) aiPet.inventory.forEach(k => myItems[k] = (myItems[k] || 0) + 1);
    
    const buildLevel = (aiPet.skills && aiPet.skills.building) ? Math.floor(aiPet.skills.building) : 1;

    for(let key in buildingCatalog) {
        const b = buildingCatalog[key];
        if (b.reqBuildLevel && buildLevel < b.reqBuildLevel) continue;
        const d = document.createElement('div'); d.className = 'panel-list-item'; 
        let matStr = "";
        if (b.materials) {
            const mats = [];
            for(let mKey in b.materials) {
                const reqCount = b.materials[mKey]; const myCount = myItems[mKey] || 0;
                const mName = (itemCatalog[mKey]) ? itemCatalog[mKey].name : mKey;
                const color = (myCount >= reqCount) ? "#aaa" : "#ff5252"; 
                mats.push(`<div style="display:flex; justify-content:space-between; color:${color}; font-size:12px;"><span>${mName}</span><span>${myCount}/${reqCount}</span></div>`);
            }
            matStr = `<div style="margin-top:5px; background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;">${mats.join('')}</div>`;
        }
        const intelColor = (aiPet.stats && aiPet.stats.intel >= b.reqIntel) ? "#4CAF50" : "#ff5252";
        const energyColor = (aiPet.energy >= b.cost.energy) ? "#fff" : "#ff5252";
        d.innerHTML = `<div style="font-weight:bold; color:#FFC107; margin-bottom:5px;">${b.name}</div><div style="font-size:11px; margin-bottom:5px;">賢さLv.${b.reqIntel} <span style="color:${intelColor}">(${(aiPet.stats && aiPet.stats.intel >= b.reqIntel) ? 'OK' : '不足'})</span> | 消費体力 <span style="color:${energyColor}">${b.cost.energy}</span></div>${matStr}<button class="quiz-btn" style="width:100%; margin-top:8px; font-size:12px; height:25px;" onclick="aiPet.constructBuilding('${key}');">建築する</button>`;
        list.appendChild(d);
    }
}

function openInventoryPanel() {
    const list = document.getElementById('inventoryList'); 
    if (!list) return; 
    list.innerHTML = "";
    
    // ★現在のタブ（デフォルトは'hand' = 手持ち）
    if (!window.currentInventoryTab) window.currentInventoryTab = 'hand';

    // 建築士皆伝かどうかの判定（タブを出すかどうかのフラグ）
    let isMasterBuilder = window.aiPet && window.aiPet.apprentice && (
        (window.aiPet.apprentice.retired && window.aiPet.apprentice.retired['building']) || 
        (window.aiPet.apprentice.currentMaster === 'building' && window.aiPet.apprentice.isGraduated) ||
        (window.aiPet.apprentice.rank && window.aiPet.apprentice.rank['building'] >= 10)
    );

    // ==========================================
    // ★ここを修正：window.assets ではなく、直接 assets を参照する
    // ==========================================
    let myHut = null;
    let _assets = typeof assets !== 'undefined' ? assets : window.assets;
    for (let k in _assets) { 
        if (_assets[k].type === 'hut') { 
            if (!myHut) myHut = _assets[k];
            if (_assets[k].storage) {
                myHut = _assets[k];
                break;
            }
        } 
    }
    
    // F12コンソールに、UIが認識した小屋の情報を出力
    console.log("[持ち物UIログ] 認識した小屋のデータ:", myHut);

    let storage = (myHut && myHut.storage) ? myHut.storage : { freezer: {level:0, capacity:0, items:[]}, warehouse: {level:0, capacity:0, items:[]}, safe: {level:0, capacity:0, gold:0} };

    // ==========================================
    // ★ タブUIの生成（建築士マスター時のみ表示）
    // ==========================================
    if (isMasterBuilder) {
        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.marginBottom = '10px';
        tabContainer.style.gap = '5px';
        
        const createTab = (id, icon, text, level, currentCount, maxCapacity) => {
            const btn = document.createElement('button');
            let isActive = window.currentInventoryTab === id;
            
            // タブに容量（現在の数/最大数）を表示する
            let countText = "";
            if (id !== 'hand' && id !== 'safe' && level > 0) {
                countText = `<br><span style="font-size:9px; color:${isActive?'#fff':'#888'};">(${currentCount}/${maxCapacity})</span>`;
            }

            btn.innerHTML = `${icon} ${text}${countText}`;
            btn.style.flex = '1';
            btn.style.padding = '5px 0';
            btn.style.fontSize = '11px';
            btn.style.fontWeight = 'bold';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.backgroundColor = isActive ? '#2196F3' : '#333';
            btn.style.color = isActive ? '#fff' : '#aaa';
            
            // レベルが0（未建築）の場合はグレーアウト
            if (level !== null && level <= 0) {
                btn.style.opacity = '0.3';
                btn.style.cursor = 'not-allowed';
                btn.innerHTML = `🔒 ${text}`;
                btn.title = "小屋を拡張すると確認できます";
            } else {
                btn.onclick = () => { window.currentInventoryTab = id; openInventoryPanel(); };
            }
            return btn;
        };

        tabContainer.appendChild(createTab('hand', '🎒', '手持ち', null, 0, 0));
        tabContainer.appendChild(createTab('freezer', '🧊', '冷凍庫', storage.freezer.level, storage.freezer.items.length, storage.freezer.capacity));
        tabContainer.appendChild(createTab('warehouse', '🛖', '倉庫', storage.warehouse.level, storage.warehouse.items.length, storage.warehouse.capacity));
        tabContainer.appendChild(createTab('safe', '💰', '金庫', storage.safe.level, 0, 0));
        list.appendChild(tabContainer);
    }

    // 金庫タブの場合の特別表示
    if (window.currentInventoryTab === 'safe') {
        const safeView = document.createElement('div');
        safeView.innerHTML = `<div style="text-align:center; margin-top:20px;">
            <div style="font-size:30px; margin-bottom:10px;">💰</div>
            <div style="font-size:14px; color:#aaa;">金庫の貯金</div>
            <div style="font-size:24px; color:#FFD700; font-weight:bold; margin-bottom:10px;">${window.formatLargeNumber(storage.safe.gold || 0)} G</div>
            <div style="font-size:12px; color:#888;">最大容量: ${window.formatLargeNumber(storage.safe.capacity)} G</div>
            <div style="margin-top:20px; font-size:12px; color:#4CAF50; padding:10px; background:rgba(76,175,80,0.1); border-radius:5px;">
                ※AIが賢ければ、チャットで「小屋」と指示した際に自動で不要なお金を預けてくれます。
            </div>
        </div>`;
        list.appendChild(safeView);
        return;
    }

    // ==========================================
    // ★ 2ペイン構造のコンテナを作成
    // ==========================================
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.height = 'calc(100% - 35px)'; 
    container.style.gap = '10px';
    
    const leftPane = document.createElement('div'); leftPane.style.flex = '1.2'; leftPane.style.overflowY = 'auto'; leftPane.style.maxHeight = '300px'; leftPane.style.paddingRight = '5px';
    const rightPane = document.createElement('div'); rightPane.style.flex = '1'; rightPane.style.overflowY = 'auto'; rightPane.style.borderLeft = '2px solid #444'; rightPane.style.paddingLeft = '10px'; rightPane.style.display = 'flex'; rightPane.style.flexDirection = 'column';
    rightPane.innerHTML = '<div style="color:#777; font-size:12px; text-align:center; margin-top:50px;">アイテムを選択すると<br>詳細が表示されます</div>';
    
    container.appendChild(leftPane); container.appendChild(rightPane); list.appendChild(container);

    let totalItems = 0;
    
    // ==========================================
    // ★ 右ペインに詳細を描画する関数
    // ==========================================
    const showDetails = (itemKey, count, isGiven, age = 0) => {
        let eff = typeof window.getDungeonItemEffect === 'function' ? window.getDungeonItemEffect(itemKey) : null;
        let parsed = typeof window.parseItemString === 'function' ? window.parseItemString(itemKey) : { baseId: itemKey, seals: [] };
        let baseData = typeof itemCatalog !== 'undefined' && itemCatalog[parsed.baseId] ? itemCatalog[parsed.baseId] : null;
        
        let itemName = eff ? eff.name : (baseData ? baseData.name : itemKey);
        let desc = baseData && baseData.desc ? baseData.desc : '説明はありません。';
        let nameColor = isGiven ? '#FFD700' : (eff && eff.equipType ? '#00e676' : '#FFF');
        
        let html = `<div style="font-size:15px; font-weight:bold; color:${nameColor}; margin-bottom:5px; line-height:1.3; word-break:break-word;">${isGiven ? '[支給品] ' : ''}${itemName}</div>`;
        html += `<div style="font-size:12px; color:#aaa; margin-bottom:5px; border-bottom:1px solid #444; padding-bottom:5px;">所持数: x${count}</div>`;
        
        const isPerishable = baseData && ['food', 'ingredient', 'dish'].includes(baseData.type);
        if (!isGiven && isPerishable) {
            let ageText = age === 0 ? "✨ 鮮度: 採れたて" : age >= 8 ? `⚠️ 鮮度: 腐敗寸前 (${age}時間経過)` : `🕒 鮮度: やや落ち (${age}時間経過)`;
            let ageColor = age === 0 ? "#00e676" : age >= 8 ? "#ff5252" : "#ffb300";
            
            // 冷凍庫に入っているアイテムは鮮度が止まっていることを明示
            if (window.currentInventoryTab === 'freezer') { 
                ageText = `❄️ 鮮度維持 (冷凍中 / 元の鮮度:${age})`; 
                ageColor = "#4fc3f7"; 
            }
            html += `<div style="font-size:11px; font-weight:bold; color:${ageColor}; margin-bottom:10px; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px; display:inline-block; border:1px solid ${ageColor}55;">${ageText}</div><br>`;
        } else {
            html += `<div style="margin-bottom:10px;"></div>`;
        }

        if (eff) {
            let statsHtml = `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">`;
            if (eff.atk > 0) statsHtml += `<span style="font-size:12px; background:rgba(255,82,82,0.1); color:#ff5252; padding:3px 6px; border-radius:4px; border:1px solid #ff5252;">攻撃力 ${eff.atk}</span>`;
            if (eff.def > 0) statsHtml += `<span style="font-size:12px; background:rgba(79,195,247,0.1); color:#4fc3f7; padding:3px 6px; border-radius:4px; border:1px solid #4fc3f7;">防御力 ${eff.def}</span>`;
            if (eff.hp > 0) statsHtml += `<span style="font-size:12px; background:rgba(76,175,80,0.1); color:#4CAF50; padding:3px 6px; border-radius:4px; border:1px solid #4CAF50;">HP回復 ${eff.hp}</span>`;
            if (eff.hunger > 0) statsHtml += `<span style="font-size:12px; background:rgba(255,152,0,0.1); color:#FF9800; padding:3px 6px; border-radius:4px; border:1px solid #FF9800;">満腹回復 ${eff.hunger}</span>`;
            statsHtml += `</div>`; html += statsHtml;
            if (parsed.seals && parsed.seals.length > 0) {
                html += `<div style="margin-top:10px; font-size:12px; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; border:1px solid #555;"><div style="color:#FFD700; font-weight:bold; margin-bottom:5px; font-size:11px;">◆ 付与されている印</div>`;
                parsed.seals.forEach(seal => { let sData = window.SEAL_DESCRIPTIONS && window.SEAL_DESCRIPTIONS[seal]; if (sData) html += `<div style="margin-bottom:6px; color:#ddd; line-height:1.4;"><span style="color:#FFD700; font-weight:bold;">[${sData.name}]</span> ${sData.desc}</div>`; });
                html += `</div>`;
            }
        }
        
        html += `<div style="margin-top:10px; font-size:12px; color:#ccc; line-height:1.5;">${desc}</div>`;

        // プレイヤーへの案内テキスト
        if (isMasterBuilder && !isGiven && window.currentInventoryTab !== 'hand') {
            html += `<div style="margin-top:auto; padding-top:15px; text-align:center; font-size:10px; color:#888;">※アイテムの整理はAIに「小屋」と指示してください。</div>`;
        }
        
        rightPane.innerHTML = html;
    };

    // ==========================================
    // ★ 左ペインのリストアイテムを生成する関数
    // ==========================================
    const createItemRow = (k, count, isGiven, age = 0) => {
        let eff = typeof window.getDungeonItemEffect === 'function' ? window.getDungeonItemEffect(k) : null;
        let baseId = typeof window.parseItemString === 'function' ? window.parseItemString(k).baseId : k;
        let baseData = typeof itemCatalog !== 'undefined' && itemCatalog[baseId] ? itemCatalog[baseId] : null;
        let itemName = eff ? eff.name : (baseData ? baseData.name : k);
        
        let ageMarker = "";
        const isPerishable = baseData && ['food', 'ingredient', 'dish'].includes(baseData.type);
        if (!isGiven && isPerishable && window.currentInventoryTab !== 'freezer') {
            if (age >= 8) ageMarker = " <span style='font-size:10px;'>⚠️</span>";
            else if (age === 0) ageMarker = " <span style='font-size:10px;'>✨</span>";
        }
        
        const d = document.createElement('div'); d.className = 'panel-list-item'; d.style.cursor = 'pointer'; d.style.transition = 'all 0.2s'; d.style.whiteSpace = 'normal'; d.style.wordBreak = 'break-word'; d.style.lineHeight = '1.4'; d.style.padding = '8px 10px'; d.style.marginBottom = '5px';
        if (isGiven) { d.style.borderLeft = "4px solid #FFD700"; d.style.backgroundColor = "rgba(255, 215, 0, 0.1)"; } else { d.style.borderLeft = "4px solid transparent"; }
        
        d.innerHTML = `<div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px; color:${isGiven ? '#FFD700' : '#ddd'};"><span style="flex:1; padding-right:5px;">${isGiven ? '[支給品] ' : ''}${itemName}${ageMarker}</span><span style="color:${isGiven ? '#FFD700' : '#4CAF50'}; white-space:nowrap; align-self:flex-start;">x${count}</span></div>`;
        
        d.onmouseover = () => { d.style.filter = 'brightness(1.3)'; d.style.transform = 'translateX(2px)'; };
        d.onmouseout = () => { d.style.filter = 'none'; d.style.transform = 'translateX(0)'; };
        d.onclick = () => {
            Array.from(leftPane.children).forEach(child => { child.style.backgroundColor = child.dataset.given === 'true' ? 'rgba(255, 215, 0, 0.1)' : ''; child.style.borderLeftColor = child.dataset.given === 'true' ? '#FFD700' : 'transparent'; });
            d.style.backgroundColor = 'rgba(33, 150, 243, 0.2)'; d.style.borderLeftColor = '#2196F3';
            showDetails(k, count, isGiven, age);
        };
        d.dataset.given = isGiven;
        return d;
    };

    // ==========================================
    // ★ リストの読み込み（タブに応じたデータを取得）
    // ==========================================
    let targetList = [];
    if (window.currentInventoryTab === 'hand') {
        if (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.inventory) {
            const counts = {}; window.aiPet.apprentice.inventory.forEach(k => counts[k] = (counts[k]||0)+1);
            for(let k in counts) { leftPane.appendChild(createItemRow(k, counts[k], true)); totalItems++; }
        }
        targetList = window.aiPet ? (window.aiPet.inventory || []) : [];
    } else if (window.currentInventoryTab === 'freezer') {
        targetList = storage.freezer.items || [];
    } else if (window.currentInventoryTab === 'warehouse') {
        targetList = storage.warehouse.items || [];
    }

    if (targetList.length > 0) {
        const grouped = {}; 
        targetList.forEach(item => {
            let k = typeof item === 'string' ? item : item.id;
            let age = typeof item === 'string' ? 0 : (item.age || 0);
            let keyWithAge = `${k}__${age}`; 
            if (!grouped[keyWithAge]) grouped[keyWithAge] = { id: k, count: 0, age: age };
            grouped[keyWithAge].count++;
        });

        for(let key in grouped) {
            let itemData = grouped[key];
            leftPane.appendChild(createItemRow(itemData.id, itemData.count, false, itemData.age));
            totalItems++;
        }
    }
    
    if (totalItems === 0) { 
        // listではなく、左側のアイテム枠(leftPane)の中にメッセージを入れる
        leftPane.innerHTML = `<div style='color:#777; font-size:12px; text-align:center; margin-top:20px; width:100%;'>中身は空っぽです</div>`; 
    }
}

window.updateScheduleList = function() {
    const listEl = document.getElementById('scheduleList'); if(!listEl) return;
    if(!aiPet.schedule || aiPet.schedule.length === 0) { listEl.innerHTML = "<div style='color:#777; padding:10px; font-size:12px;'>予定はありません</div>"; } else {
        let html = ""; aiPet.schedule.forEach((task, i) => { let tName = (typeof getTaskName === 'function') ? getTaskName(task.type) : task.type; html += `<div style="border-bottom:1px solid #444; padding:8px; font-size:12px;"><span style="color:#00bcd4; font-weight:bold;">${i+1}.</span> ${tName} <span style="color:#aaa; float:right;">(${task.duration}分)</span></div>`; }); 
        listEl.innerHTML = html; 
    }
    updateAIStatusText(); 
};

window.updateRescueList = function() {
    const listEl = document.getElementById('rescueList');
    if (!listEl) return;
    listEl.innerHTML = "";
    
    const rescueItems = ['herb', 'fish_sardine', 'carrot'];
    rescueItems.forEach(key => {
        const item = itemCatalog[key]; if (!item) return;
        const price = item.value * 2; 
        const div = document.createElement('div'); div.className = 'panel-list-item';
        
        div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;">
            <div><div style="font-weight:bold; font-size:13px;">${item.name}</div><div style="font-size:11px; color:#aaa;">${price} G (借金)</div></div>
            <button style="background:#FF9800; color:black; border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:12px;" 
            onclick="aiPet.rescueItem('${key}');">支給を受ける</button>
        </div>`;
        listEl.appendChild(div);
    });
    
    const goldDisplay = document.getElementById('rescue-gold-display');
    if (goldDisplay && typeof aiPet !== 'undefined') {
        goldDisplay.innerText = `所持金: ${aiPet.gold || 0} G`;
        goldDisplay.style.color = (aiPet.gold < 0) ? '#ff5252' : '#ffd700';
    }
};

window.updateShopList = function() {
    try {
        const buyList = document.getElementById('buyList'); const sellList = document.getElementById('sellList');
        if (!buyList || !sellList) return;
        sellList.innerHTML = "";
        if (!aiPet.inventory || aiPet.inventory.length === 0) { sellList.innerHTML = "<div style='color:#777; font-size:12px;'>売れるものがありません</div>"; } else {
            const counts = {}; aiPet.inventory.forEach(k => counts[k] = (counts[k]||0)+1);
            for (let k in counts) {
                const item = (typeof itemCatalog !== 'undefined') ? itemCatalog[k] : null;
                if (item) {
                    const div = document.createElement('div'); div.className = 'panel-list-item';
                    div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px;">${item.name} x${counts[k]}</span> <button style="background:#444; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:11px;" onclick="aiPet.gold += ${item.value}; aiPet.inventory.splice(aiPet.inventory.indexOf('${k}'), 1); window.updateShopList(); updateStatUI();">売る (+${item.value}G)</button></div>`;
                    sellList.appendChild(div);
                }
            }
        }
        buyList.innerHTML = "";
        const shopItems = ['herb', 'carrot', 'tomato', 'pepper', 'fish_sardine', 'seed_carrot', 'seed_tomato', 'seed_pepper', 'wood', 'stone', 'iron', 'rod_old'];
        shopItems.forEach(key => {
            const item = (typeof itemCatalog !== 'undefined') ? itemCatalog[key] : null; if (!item) return;
            const price = item.value * 2; 
            const canAfford = ((aiPet.gold || 0) >= price); 
            const div = document.createElement('div'); div.className = 'panel-list-item';
            let btnStyle = canAfford ? "background:#4CAF50;" : "background:#555; color:#aaa;";
            let btnText = canAfford ? "買う" : "お金不足";
            let disabled = !canAfford ? "disabled" : "";
            div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><div style="font-weight:bold; font-size:13px;">${item.name}</div><div style="font-size:11px; color:#aaa;">${price} G</div></div><button style="${btnStyle} border:none; border-radius:4px; padding:4px 10px; cursor:pointer; font-size:12px;" onclick="if(aiPet.buyItem('${key}')) { window.updateShopList(); updateStatUI(); }" ${disabled}>${btnText}</button></div>`;
            buyList.appendChild(div);
        });
        updateShopGold();
    } catch(e) { console.error(e); }
};

function updateShopGold() {
    const shopGold = document.getElementById('shop-gold-display');
    if (shopGold && typeof aiPet !== 'undefined') {
        // ★修正: ショップ内のゴールド表示もフォーマット関数を通す
        shopGold.innerText = `所持金: ${window.formatLargeNumber(aiPet.gold)} G`;
        shopGold.style.color = (aiPet.gold < 0) ? '#ff5252' : '#ffd700';
    }
}

function updateStatUI() {
    if (typeof aiPet === 'undefined') return;
    
    // データが空っぽならエラーにならないように即リターン（安全装置）
    if (!aiPet.stats) return; 

    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    
    const timeEl = document.getElementById('stat-time');
    if (timeEl) {
        let hour = typeof aiPet.getCurrentHour === 'function' ? aiPet.getCurrentHour() : new Date().getHours();
        let minute = new Date().getMinutes();
        if (typeof aiPet.debugHour === 'number' && aiPet.debugHour >= 0) minute = 0; 
        let timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        let seasonStr = "🌸 春";
        if (aiPet.season === 'summer') seasonStr = "🌻 夏";
        else if (aiPet.season === 'autumn') seasonStr = "🍂 秋";
        else if (aiPet.season === 'winter') seasonStr = "⛄ 冬";
        
        timeEl.innerText = `${seasonStr} ${timeStr}`;
    }

    setText('stat-gen', aiPet.generation || 1);
    setText('stat-age', aiPet.age || 0); 
    setText('stat-energy', Math.floor(aiPet.energy || 0) + "%");
    setText('stat-hunger', Math.floor(aiPet.hunger || 0) + "%");
    
    // ★修正: HUDのステータス表示もフォーマット関数を通す
    setText('stat-intel', window.formatLargeNumber(aiPet.stats.intel));
    setText('stat-power', window.formatLargeNumber(aiPet.stats.power));
    setText('stat-mood', window.formatLargeNumber(aiPet.stats.mood));

    if (typeof aiPet.stats.beauty === 'undefined') aiPet.stats.beauty = 10;
    setText('stat-beauty', window.formatLargeNumber(aiPet.stats.beauty));

    // ★追加: 素早さの表示（古いセーブデータ対策で初期値10を設定）
    if (typeof aiPet.stats.speed === 'undefined') aiPet.stats.speed = 10;
    setText('stat-speed', window.formatLargeNumber(aiPet.stats.speed));

    // ★修正: 進化ボタンの表示制御を変数化して確実に見せる
    const btnEvolve = document.getElementById('btnEvolve');
    if (btnEvolve && typeof aiPet.getAvailableEvolutions === 'function') {
        const evos = aiPet.getAvailableEvolutions();
        // ★修正: 1段階進化済みでも、さらに先の進化先条件を満たしていればボタンを表示する
        if (evos.length > 0) {
            btnEvolve.style.display = 'flex';
        } else {
            btnEvolve.style.display = 'none';
        }
    }
    
    // ★追加：健康状態のテキストと色を決定
    const healthStr = aiPet.isSick ? "😷病気" : "🟢健康";
    const healthColor = aiPet.isSick ? "#ff5252" : "#00e676";

    // 新しい性格判定関数は直接日本語を返すので、そのままセットするだけ！(病気の文字は削除)
    setText('stat-type', window.getPersonalityType(aiPet.stats));

    // ★追加：画面上部(HUD)の健康状態を更新
    const statHealthEl = document.getElementById('stat-health');
    if (statHealthEl) {
        statHealthEl.innerText = healthStr;
        statHealthEl.style.color = healthColor;
    }

    // ★追加：詳細画面の健康状態UIを更新
    const sHealthEl = document.getElementById('s-health');
    if (sHealthEl) {
        sHealthEl.innerText = healthStr;
        sHealthEl.style.color = healthColor;
    }

    // ★修正: デバッグなどで選んだ画像IDに特性がなくても、本来の種族特性を引っ張ってくる
    let skin = aiPet.currentSkin || 'robot';
    let baseType = skin.split('_')[0] || 'robot';
    let tData = (typeof charaTraits !== 'undefined') ? (charaTraits[skin] || charaTraits[baseType] || charaTraits['robot']) : null;
    // ▼ ここから書き換え ▼
    let traitName = tData ? tData.name : "-";
    if (aiPet.apprentice && aiPet.apprentice.title) {
        traitName = `🏆${aiPet.apprentice.title} / ` + traitName;
    }
    setText('stat-trait', traitName);
    
    const weatherEl = document.getElementById('stat-weather');
    if (weatherEl) {
        let w = aiPet.weather;
        let wStr = "☀ 快晴";
        if (w === 'sunny') wStr = "⛅ 晴れ";
        else if (w === 'cloudy') wStr = "☁ 曇り";
        else if (w === 'rain') wStr = "☔ 雨";
        else if (w === 'thunder') wStr = "⚡ 雷雨";
        else if (w === 'snow') wStr = "❄ 雪";
        else if (w === 'hail') wStr = "🧊 あられ";
        weatherEl.innerText = wStr;

        const overlay = document.getElementById('weatherOverlay');
        if (overlay) {
            overlay.className = ''; 
            if (w === 'rain') overlay.className = 'weather-rain';
            else if (w === 'thunder') overlay.className = 'weather-thunder';
            else if (w === 'snow') overlay.className = 'weather-snow';
            else if (w === 'hail') overlay.className = 'weather-hail';
        }
    }

    const goldEl = document.getElementById('stat-gold');
    if (goldEl) { goldEl.innerText = window.formatLargeNumber(aiPet.gold) + " G"; goldEl.style.color = (aiPet.gold < 0) ? '#ff5252' : '#ffd700'; }
    updateShopGold(); 
    updateCommandHUD(); 
    updateAIStatusText();

    if(typeof updateQuestHUD==='function') updateQuestHUD();

    // ★修正: 建築士皆伝時、持ち物ボタンを「マイホームの収納」に変更
    const btnInv = document.getElementById('btnInventory');
    const panelHeader = document.querySelector('#panel-inventory .panel-header');
    if (btnInv && panelHeader) {
        let isMasterBuilder = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || 
            (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10)
        );
        if (isMasterBuilder) {
            btnInv.innerHTML = "🏠 マイホームの収納"; // ★変更
            btnInv.style.background = "#9C27B0";
            panelHeader.innerHTML = "🏠 マイホームの収納"; // ★変更
            panelHeader.style.color = "#9C27B0";
        } else {
            btnInv.innerHTML = "🎒 持ち物";
            btnInv.style.background = "#E91E63";
            panelHeader.innerHTML = "🎒 持ち物";
            panelHeader.style.color = "#E91E63";
        }
    }
}

// ==========================================
// ★ コマンドHUD更新（再描画のチラつき＆スクロールリセット完全防止版！）
// ==========================================
window.updateCommandHUD = function() {
    const hud = document.getElementById('commandHUD');
    const debtContainer = document.getElementById('debt-warning-container');
    if (!hud) return;
    if (typeof aiPet === 'undefined' || !aiPet.apprentice) return;

    if (aiPet.apprentice.learnedWords) {
        const legacyWords = ["クエスト", "課題", "手伝い", "稼ぐ", "休憩", "寝る", "お店", "買う", "売る", "虫取り", "駆除", "水やり", "手入れ"];
        aiPet.apprentice.learnedWords = aiPet.apprentice.learnedWords.filter(w => !legacyWords.includes(w));
    }

    const knows = (word) => aiPet.apprentice.learnedWords && aiPet.apprentice.learnedWords.includes(word);
    let metMasters = (aiPet.apprentice && aiPet.apprentice.metMasters) ? aiPet.apprentice.metMasters : [];

    // ==========================================
    // ★修正：下にあった計算式を上に引っ張り上げました！
    // ==========================================
    let maxWords = (typeof aiPet.getMaxVocabulary === 'function') ? aiPet.getMaxVocabulary() : 5;

    // ★修正：判定条件に maxWords を追加し、容量が増えた瞬間も確実に再描画させる！
    const stateStr = JSON.stringify(aiPet.apprentice.learnedWords) + "_" + metMasters.join(',') + "_" + (aiPet.gold < 0 ? aiPet.debtTimer : 0) + "_" + maxWords;
    
    if (hud.dataset.state === stateStr) {
        return; // データに変化がなければ再描画をストップし、操作を邪魔しない
    }
    hud.dataset.state = stateStr;

    // ★超重要パッチ2：再描画される前に現在のスクロール位置を記憶する
    const currentScrollTop = hud.scrollTop;

    const categories = {
        '🏠 生活・回復': [], '💪 育成・訓練': [], '🎓 依頼・課題': [], '⚔️ 冒険・作業': [], '🏪 施設・その他': [], '🗣️ 自由な言葉': []
    };

    if (knows("睡眠")) categories['🏠 生活・回復'].push({ label: "睡眠", base: "睡眠" });
    if (knows("食事")) categories['🏠 生活・回復'].push({ label: "食事", base: "食事" });
    if (knows("勉強")) categories['💪 育成・訓練'].push({ label: "勉強", base: "勉強" });
    if (knows("筋トレ")) categories['💪 育成・訓練'].push({ label: "筋トレ", base: "筋トレ" });
    if (knows("ランニング")) categories['💪 育成・訓練'].push({ label: "ランニング", base: "ランニング" });
    if (knows("探検")) categories['⚔️ 冒険・作業'].push({ label: "探検", base: "探検" });
    if (knows("ニンジン")) categories['⚔️ 冒険・作業'].push({ label: "ニンジン育てて", base: "ニンジン" });
    if (knows("ピーマン")) categories['⚔️ 冒険・作業'].push({ label: "ピーマン育てて", base: "ピーマン" });
    if (knows("トマト")) categories['⚔️ 冒険・作業'].push({ label: "トマト育てて", base: "トマト" });
    if (knows("農業")) categories['⚔️ 冒険・作業'].push({ label: "農業", base: "農業" });
    if (knows("退治")) categories['⚔️ 冒険・作業'].push({ label: "退治して", base: "退治", color: "#ff5252" }); 
    if (knows("釣り")) categories['⚔️ 冒険・作業'].push({ label: "釣り", base: "釣り" });
    if (knows("料理")) categories['⚔️ 冒険・作業'].push({ label: "料理", base: "料理" });
    if (knows("鍛冶")) categories['⚔️ 冒険・作業'].push({ label: "鍛冶", base: "鍛冶" }); 
    if (knows("建築")) categories['⚔️ 冒険・作業'].push({ label: "建築", base: "建築" });
    
    const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };

    for (let key in masterNames) {
        if (knows(masterNames[key]) && metMasters.includes(key)) {
            categories['🎓 依頼・課題'].push({ label: `${masterNames[key]}のところへ`, base: masterNames[key] });
        }
    }

    if (knows("書き写し") && metMasters.includes('building')) categories['🎓 依頼・課題'].push({ label: "書き写し", base: "書き写し" });
    if (knows("ふいご") && metMasters.includes('smithing')) categories['🎓 依頼・課題'].push({ label: "ふいご", base: "ふいご" });
    if (knows("石拾い") && metMasters.includes('farming')) categories['🎓 依頼・課題'].push({ label: "石拾い", base: "石拾い" });
    if (knows("皿洗い") && metMasters.includes('cooking')) categories['🎓 依頼・課題'].push({ label: "皿洗い", base: "皿洗い" });
    if (knows("網の修理") && metMasters.includes('fishing')) categories['🎓 依頼・課題'].push({ label: "網の修理", base: "網の修理" });
    if (knows("荷物運び") && metMasters.includes('explore')) categories['🎓 依頼・課題'].push({ label: "荷物運び", base: "荷物運び" });

    if (knows("買い物")) categories['🏪 施設・その他'].push({ label: "買い物", base: "買い物" }); 
    if (knows("城")) categories['🏪 施設・その他'].push({ label: "城に行く", base: "城" });
    if (knows("カジノ")) categories['🏪 施設・その他'].push({ label: "カジノ", base: "カジノ" });

    const systemWords = [
        "睡眠", "食事", "勉強", "筋トレ", "ランニング", "探検", "料理", "鍛冶", "建築", 
        "買い物", "城", "カジノ", "釣り", "ニンジン", "ピーマン", "トマト", "退治", "農業", 
        "バイト", "書き写し", "ふいご", "石拾い", "皿洗い", "網の修理", "荷物運び"
    ];
    for (let key in masterNames) {
        if (metMasters.includes(key)) systemWords.push(masterNames[key]);
    }
    
    if (aiPet.apprentice.learnedWords) {
        aiPet.apprentice.learnedWords.forEach(word => {
            if (!systemWords.includes(word)) {
                categories['🗣️ 自由な言葉'].push({ label: word, base: word, color: "#9C27B0" }); 
            }
        });
    }

    let currentWords = aiPet.apprentice.learnedWords ? aiPet.apprentice.learnedWords.length : 0;
    
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#aaa; margin-bottom:10px; background:#222; padding:6px 8px; border-radius:4px; border:1px solid #444;">
            <span>🧠 記憶容量: <span style="color:${currentWords > maxWords ? '#ff5252' : (currentWords === maxWords ? '#FFC107' : '#fff')}; font-weight:bold;">${currentWords} / ${maxWords} 語</span></span>
            <span style="font-size:10px; color:#888;">※「〇〇を忘れて」</span>
        </div>
    `;

    let totalCmds = 0;
    for (let cat in categories) {
        if (categories[cat].length > 0) {
            html += `<div style="font-size: 11px; font-weight: bold; color: #888; margin-top: 8px; margin-bottom: 6px;">${cat}</div>`;
            html += `<div style="display:flex; flex-wrap:wrap; gap:6px; align-items: flex-start;">`; // ★ 折り返し時の挙動を安定させる
            categories[cat].forEach(c => {
                totalCmds++;
                let label = c.label;
                let baseWord = c.base;
                let bgColor = c.color || "#2a2a2a";
                let textColor = c.color ? "#fff" : "#ddd";
                let borderColor = c.color ? (c.color === '#9C27B0' ? '#7B1FA2' : '#b71c1c') : "#555";
                
                html += `<button type="button" style="background: ${bgColor}; color: ${textColor}; border: 1px solid ${borderColor}; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.1s; box-shadow: 0 2px rgba(0,0,0,0.5); white-space: nowrap;" 
                        onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='none'; document.getElementById('chatInput').value='${baseWord}'; window.sendChat();" 
                        onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px rgba(0,0,0,0.5)';">${label}</button>`;
            });
            html += `</div>`;
        }
    }

    if (totalCmds === 0) {
        html += `<div style="text-align: center; padding: 20px; color: #666; font-size: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-top: 10px;">まだ言葉を知りません。<br>下のチャット欄から言葉を教えてみましょう！</div>`;
    }

    // ★重要パッチ3：見切れ防止用の底上げスペーサー
    html += `<div style="height: 60px; width: 100%; pointer-events: none; flex-shrink: 0;"></div>`;

    // 新しいHTMLを適用
    hud.innerHTML = html;
    
    // ★重要パッチ4：HTMLを再構築した直後に、記憶しておいたスクロール位置を復元する
    hud.scrollTop = currentScrollTop;
    
    if (debtContainer) {
        if (aiPet.gold < 0) {
            const limit = (typeof DEBT_TIME_LIMIT !== 'undefined') ? DEBT_TIME_LIMIT : 72 * 60;
            const timeLeftHours = Math.max(0, Math.ceil((limit - (aiPet.debtTimer || 0)) / 60));
            const debtHtml = `<div style="background: rgba(244, 67, 54, 0.1); color: #ff5252; font-weight: bold; font-size: 12px; border: 1px solid #f44336; padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align: center; box-shadow: 0 0 10px rgba(244, 67, 54, 0.2);">⚠️ 借金返済期限: 残り ${timeLeftHours} 時間</div>`;
            if (debtContainer.innerHTML !== debtHtml) debtContainer.innerHTML = debtHtml;
        } else {
            if (debtContainer.innerHTML !== "") debtContainer.innerHTML = "";
        }
    }
};

// ==========================================
// ★ チャット履歴管理 ＆ 常時フォーカスシステム（最強・除外エリア対応版）
// ==========================================
window.chatHistory = JSON.parse(localStorage.getItem('ai_pet_chat_history')) || [];
window.chatHistoryIndex = -1;

(function() {
    const input = document.getElementById('chatInput');
    if (!input || input._isFocusHijacked) return;
    
    // 元の focus メソッドを保存して乗っ取る
    const originalFocus = input.focus;
    window._blockChatFocus = false;

    input.focus = function(options) {
        if (window._blockChatFocus) return; // UI操作中はフォーカス移動を強制ブロック
        originalFocus.call(this, options);
    };
    input._isFocusHijacked = true;

    input.addEventListener('keydown', function(e) {
        if (window.chatHistory.length === 0) return;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (window.chatHistoryIndex < window.chatHistory.length - 1) {
                window.chatHistoryIndex++;
                input.value = window.chatHistory[window.chatHistory.length - 1 - window.chatHistoryIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (window.chatHistoryIndex > 0) {
                window.chatHistoryIndex--;
                input.value = window.chatHistory[window.chatHistory.length - 1 - window.chatHistoryIndex];
            } else if (window.chatHistoryIndex === 0) {
                window.chatHistoryIndex = -1;
                input.value = ""; 
            }
        }
    });

    // キャプチャフェーズでマウスクリックを監視し、UIを触った瞬間にロックをかける
    document.addEventListener('mousedown', function(e) {
        const noFocusSelectors = [
            'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 
            '#questHUD', '#questListHUD', 
            '#commandHUD', '#aiStatus', '.panel-view',
            '#encounterOverlay', '#examOverlay', '#shop-management-ui', '#player-shop-ui', '#recipe-book-overlay',
            '[id*="-modal"]', '[id*="-ui"]', '#in-game-tutorial'
        ];

        for (let selector of noFocusSelectors) {
            if (e.target.closest(selector)) {
                window._blockChatFocus = true;
                clearTimeout(window._unblockTimer);
                window._unblockTimer = setTimeout(() => { window._blockChatFocus = false; }, 500);
                return;
            }
        }

        setTimeout(() => { input.focus(); }, 10);
    }, true);
})();

// ==========================================
// ★ チャット送信処理（超・賢い意図解釈システム＆誤爆修正版！）
// ==========================================
window.sendChat = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const rawText = input.value.trim();
    if (!rawText) return;
    
    const existingIndex = window.chatHistory.indexOf(rawText);
    if (existingIndex !== -1) {
        window.chatHistory.splice(existingIndex, 1);
    }
    window.chatHistory.push(rawText);
    if (window.chatHistory.length > 50) window.chatHistory.shift();
    localStorage.setItem('ai_pet_chat_history', JSON.stringify(window.chatHistory));
    
    window.chatHistoryIndex = -1;

    if (rawText === "やめる" || rawText === "中止" || rawText === "キャンセル" || rawText.toLowerCase() === "stop" || rawText.toLowerCase() === "cancel") {
        if(typeof window.clearSchedule === 'function') window.clearSchedule();
        input.value = ""; input.focus(); return;
    }

    if (!aiPet.apprentice) aiPet.apprentice = {};
    if (!aiPet.apprentice.learnedWords) aiPet.apprentice.learnedWords = [];

    const dict = {
        "冒険家": ["冒険家", "冒険者"],
        "農家": ["農家", "農民"],
        "漁師": ["漁師", "釣り人"],
        "料理人": ["料理人", "シェフ", "コック"],
        "鍛冶師": ["鍛冶師", "職人"], 
        "建築士": ["建築士", "建築家"],
        "ニンジン": ["ニンジン", "にんじん", "人参"],
        "トマト": ["トマト", "とまと"],
        "ピーマン": ["ピーマン", "ぴーまん"],
        
        "勉強": ["学ぶ", "学んで", "まなぶ", "まなんで", "賢く", "かしこく", "知性", "知恵", "本", "勉強"],
        "筋トレ": ["筋肉", "鍛え", "きたえ", "体力", "活力", "運動", "トレーニング", "筋トレ"], 
        "ランニング": ["走る", "走って", "はしって", "ダッシュ", "ランニング", "マラソン", "ジョギング"], 
        "睡眠": ["寝る", "寝て", "ねて", "休", "やす", "休憩", "おやすみ", "眠", "睡眠"],
        "食事": ["食べる", "食べて", "たべて", "ご飯", "ごはん", "メシ", "めし", "腹", "はら", "食事"],
        "探検": ["冒険", "出かけ", "でかけ", "外", "散歩", "さんぽ", "探索", "探検"],
        "釣り": ["釣", "つり", "つって", "魚"],
        "料理": ["クッキング", "作って", "つくって", "料理"],
        "鍛冶屋": ["鍛冶屋", "工房"], 
        "鍛冶": ["武器", "防具", "装備", "鉄", "打って", "鍛冶"],
        "建築": ["建てて", "たてて", "建築", "建てる", "大工"],
        "橋": ["橋", "はし", "ブリッジ"],
        "小屋": ["小屋", "家", "こや", "いえ", "ハウス"],
        "城": ["城", "お城", "キャッスル", "闘技場", "アリーナ"],
        "カジノ": ["カジノ", "スロット", "ギャンブル", "遊んで", "あそんで"],
        "ショップ": ["ショップ", "買い物", "かいもの", "お店", "店", "買いたい"],
        "カード": ["カード", "カードダス", "カードショップ", "トレカ", "パック"], 
        "レストラン": ["レストラン", "食堂", "ご飯屋"],
        "農業": ["畑", "耕", "たがや", "農業", "水やり", "種"],
        "退治": ["虫", "駆除", "倒し", "退治"],
        "バイト": ["稼", "かせ", "仕事", "バイト"],
        "書き写し": ["書き写し", "かきうつし"],
        "ふいご": ["ふいご", "フイゴ"],
        "石拾い": ["石拾い", "いしひろい", "石拾", "石ひろい"],
        "皿洗い": ["皿洗い", "さらあらい", "皿洗"],
        "網の修理": ["網の修理", "あみのしゅうり", "網の修", "網修理", "あみ修理"],
        "荷物運び": ["荷物運び", "にもつはこび", "荷物運"]
    };

    let interpretedWord = rawText;
    let isInterpreted = false;

    for (let key in dict) {
        if (dict[key].some(syn => rawText === syn)) {
            interpretedWord = key; isInterpreted = true; break;
        }
    }

    if (!isInterpreted) {
        for (let key in dict) {
            if (dict[key].some(syn => rawText.includes(syn))) {
                interpretedWord = key; isInterpreted = true; break;
            }
        }
    }

    const forgetMatch = rawText.match(/(.+)を(?:忘|わす)れて/);
    if (forgetMatch) {
        let targetWord = forgetMatch[1].trim();
        for (let key in dict) { if (dict[key].some(syn => targetWord.includes(syn))) { targetWord = key; break; } }
        const index = aiPet.apprentice.learnedWords.indexOf(targetWord);
        if (index !== -1) {
            aiPet.apprentice.learnedWords.splice(index, 1); aiPet.message = `「${targetWord}」だね…うん、忘れたよ。`;
        } else { aiPet.message = `えっ？「${targetWord}」なんて知らないよ？`; }
        aiPet.messageTimer = 180; input.value = ""; input.focus();
        if (typeof saveGameData === 'function') saveGameData(); 
        if (typeof updateCommandHUD === 'function') updateCommandHUD();
        return; 
    }

    let justLearned = false; 
    const maxWords = (typeof aiPet.getMaxVocabulary === 'function') ? aiPet.getMaxVocabulary() : 5;

    if (!aiPet.apprentice.learnedWords.includes(interpretedWord)) {
        if (aiPet.apprentice.learnedWords.length >= maxWords) {
            aiPet.message = `頭がいっぱいで「${interpretedWord}」は覚えられないや…\n（いらない言葉を「〇〇を忘れて」と言ってね）`;
            aiPet.messageTimer = 200; input.value = ""; input.focus(); return; 
        } else {
            aiPet.apprentice.learnedWords.push(interpretedWord); justLearned = true;
            if (typeof addFloatingText === 'function') addFloatingText(aiPet.x, aiPet.y - 60, "言葉を学習した！", "#FF9800");
            if (typeof saveGameData === 'function') saveGameData();
        }
    }

    const knows = (word) => aiPet.apprentice.learnedWords.includes(word);
    let actionTriggered = false; 

    const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
    const myMasterName = aiPet.apprentice.currentMaster ? masterNames[aiPet.apprentice.currentMaster] : null;

    const uniqueFacilities = {
        "城": { type: 'castle', bId: 'castle', name: 'お城', onEnter: () => { if(typeof window.openArenaReception === 'function') window.openArenaReception(); } },
        "カジノ": { type: 'casino', bId: 'casino', name: 'カジノ', onEnter: () => { if(typeof window.openCasino === 'function') window.openCasino(); } },
        "ショップ": { type: 'shop', bId: 'shop', name: 'ショップ', onEnter: null },
        "カード": { type: 'card_shop', bId: 'card_shop', name: 'カードショップ', onEnter: () => { if(typeof window.openCardShopUI === 'function') window.openCardShopUI(); } }
    };

    const allMasterNames = { '冒険家': 'explore', '農家': 'farming', '漁師': 'fishing', '料理人': 'cooking', '鍛冶師': 'smithing', '建築士': 'building' };
    
    if (allMasterNames[interpretedWord] && knows(interpretedWord) && !aiPet.isHelper) {
        let mType = allMasterNames[interpretedWord];
        let metMasters = (aiPet.apprentice && aiPet.apprentice.metMasters) ? aiPet.apprentice.metMasters : [];
        
        if (metMasters.includes(mType)) {
            actionTriggered = true;
            
            // ★追加：行こうとしている先（mType）が「免許皆伝（ランク10）」かどうかをチェック
            let isTargetMastered = (aiPet.apprentice.rank && aiPet.apprentice.rank[mType] >= 10);

            // ★修正：現在の師匠と違う場合でも、相手が「皆伝済み」ならストップさせずに下へ通す！
            if (aiPet.apprentice.currentMaster && aiPet.apprentice.currentMaster !== mType && !isTargetMastered) {
                let currentMasterName = Object.keys(allMasterNames).find(k => allMasterNames[k] === aiPet.apprentice.currentMaster) || "今の師匠";
                aiPet.message = `今は${currentMasterName}の修行に集中しないと！\n（他の人のところへは行けないよ）`;
                aiPet.messageTimer = 180;
            } 
            else if (!aiPet.apprentice.isExcommunicated) {
                let facility = typeof findFacilityForTask === 'function' ? findFacilityForTask('visit_master', mType) : null;
                if (facility) {
                    aiPet.schedule = [{type: 'visit_master', masterType: mType, duration: 0}];
                    aiPet.startBuildingInteraction(facility); 
                    aiPet.message = "師匠のところへ行くよ！"; aiPet.messageTimer = 120;
                } else { 
                    aiPet.message = "どこにいるかわからない..."; aiPet.messageTimer = 120; 
                }
            } else { 
                aiPet.message = "破門中だから会いに行けない..."; aiPet.messageTimer = 120; 
            }
        }
    }

    if (Object.keys(uniqueFacilities).includes(interpretedWord)) {
        actionTriggered = true;
        let facInfo = uniqueFacilities[interpretedWord];
        
        let existingTarget = null;
        for (let k in assets) {
            if ((assets[k].type === facInfo.type || assets[k].type === facInfo.bId) && !assets[k].isMobile) {
                existingTarget = assets[k]; break;
            }
        }

        let isBuilding = false;
        if (aiPet.schedule.some(t => t.type === 'build' && t.targetBuilding === facInfo.bId)) isBuilding = true;
        for (let k in assets) {
            if (assets[k].type === 'building_site' && assets[k].targetBuilding === facInfo.bId) isBuilding = true;
        }

        if (existingTarget) {
            if (knows(interpretedWord)) {
                aiPet.schedule = []; aiPet.startBuildingInteraction(existingTarget);
                aiPet.message = `${facInfo.name}に行ってくる！`; aiPet.messageTimer = 120;
                let checkInterval = setInterval(() => {
                    if (aiPet.actionState === 'inside' || aiPet.actionState === 'entering' || aiPet.actionState === 'moving_to_enter') {
                        let sc = existingTarget.scale !== undefined ? existingTarget.scale : 0.5;
                        let tx = existingTarget.dx + (existingTarget.sw * sc) / 2;
                        let ty = existingTarget.dy + (existingTarget.sh * sc) / 2;
                        let dist = Math.abs(aiPet.x - tx) + Math.abs(aiPet.y - ty);
                        
                        if (dist < 40 || aiPet.actionState === 'inside') {
                            aiPet.actionState = 'inside';
                            aiPet.isIndoors = true;
                            aiPet.indoorTarget = existingTarget; 
                            if (facInfo.onEnter) facInfo.onEnter();
                            clearInterval(checkInterval);
                        }
                    } else if (aiPet.actionState === 'idle') { 
                        clearInterval(checkInterval); 
                    }
                }, 500);
            } else {
                aiPet.message = `そこにあるのは分かるけど、言葉を知らないから行けないみたい...`; aiPet.messageTimer = 120;
            }
        } else if (isBuilding) {
            aiPet.message = `${facInfo.name}は今作っている最中だよ！`; aiPet.messageTimer = 120;
        } else {
            if (knows("建築")) {
                let isMaster = aiPet.apprentice && (
                    (aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || 
                    (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) ||
                    (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10)
                );
                
                if (!isMaster) {
                    aiPet.message = `まだ修行中の身だから、${facInfo.name}は作れないよ...\n(まずは建築士の免許皆伝を目指そう！)`; aiPet.messageTimer = 180;
                } else {
                    let bData = typeof buildingCatalog !== 'undefined' ? buildingCatalog[facInfo.bId] : null;
                    if (bData && bData.reqFlag && !aiPet[bData.reqFlag]) {
                        if (facInfo.bId === 'card_shop') {
                            aiPet.message = `カード屋かぁ...。\nまずは「カジノ」で遊んで、新しい娯楽のインスピレーションを得たいな！`; 
                        } else {
                            aiPet.message = `まだ${facInfo.name}を建てるアイデアが浮かばないみたい...`; 
                        }
                        aiPet.messageTimer = 180;
                    } else {
                        aiPet.schedule.push({type: 'build', targetBuilding: facInfo.bId, duration: 60});
                        aiPet.message = `${facInfo.name}の建築を予定に追加したよ！`; aiPet.messageTimer = 150;
                    }
                }
            } else {
                aiPet.message = `${facInfo.name}が建ってないみたい...（「建築」を教えれば作れるかも？）`; aiPet.messageTimer = 120;
            }
        }
    }
    else if (["橋", "小屋", "冷凍庫", "倉庫", "金庫"].includes(interpretedWord)) {
        actionTriggered = true;
        let bId = interpretedWord === "橋" ? "bridge" : interpretedWord === "小屋" ? "hut" : interpretedWord === "冷凍庫" ? "freezer" : interpretedWord === "倉庫" ? "warehouse" : "safe";
        
        let myHut = null;
        for (let k in assets) {
            if (assets[k].type === 'hut') { myHut = assets[k]; break; }
        }

        // ①「小屋」と指示され、既に小屋がある場合は「整理(出し入れ)」に向かう
            if (interpretedWord === "小屋" && myHut) {
                // ★修正: タスク名を日本語にして、プログレスバーの表示を綺麗にする
                aiPet.schedule.push({type: '荷物整理', targetUid: Object.keys(assets).find(k => assets[k] === myHut), duration: 60});
                if (aiPet.schedule.length === 1) {
                    aiPet.startBuildingInteraction(myHut);
                    aiPet.message = "小屋に戻って荷物を整理するね！";
                } else {
                    aiPet.message = "小屋での荷物整理を予約したよ！";
                }
                aiPet.messageTimer = 150;
            }
        // ②小屋がないのに冷凍庫などを作ろうとした場合
        else if (bId !== "hut" && bId !== "bridge" && !myHut) {
            aiPet.message = `${interpretedWord}を作りたいけど、まずは「小屋」を建てないとダメみたい...`;
            aiPet.messageTimer = 180;
        }
        // ③建築系の言葉を知っているなら建築/拡張を試みる
        else if (knows("建築")) {
            let isMaster = aiPet.apprentice && (
                (aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || 
                (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) ||
                (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10)
            );
            if (!isMaster) {
                aiPet.message = `まだ修行中の身だから、${interpretedWord}は作れないよ...\n(まずは建築士の免許皆伝を目指そう！)`; aiPet.messageTimer = 180;
            } else {
                aiPet.schedule.push({type: 'build', targetBuilding: bId, duration: 60});
                aiPet.message = `${interpretedWord}の建築(拡張)を予定に追加したよ！`; aiPet.messageTimer = 150;
            }
        } else {
            aiPet.message = `「${interpretedWord}」の言葉は知ってるけど、建て方がわからないや...`; aiPet.messageTimer = 150;
        }
    }
    else if (interpretedWord === "建築" && knows("建築")) { 
        actionTriggered = true;
        let isMaster = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || 
            (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10)
        );
        let isBuilder = aiPet.apprentice && (aiPet.apprentice.currentMaster === 'building' || isMaster);
        
        if (!isBuilder) {
            aiPet.message = `まだ素人だから作れないよ...\n(まずは建築士に弟子入りしよう)`; aiPet.messageTimer = 150;
        } else if (!isMaster) {
            aiPet.schedule.push({type: 'build', targetBuilding: 'farm', duration: 60});
            aiPet.message = "畑を建てる場所へ向かうよ！"; aiPet.messageTimer = 150;
        } else {
            aiPet.schedule.push({type: 'build', targetBuilding: 'farm', duration: 60});
            aiPet.message = "畑の建築を予定に追加したよ！\n(他のものは「〇〇を作って」と指示してね)"; aiPet.messageTimer = 150;
        }
    }
    else if (interpretedWord === "バイト" && knows("バイト")) {
        aiPet.message = "漠然と「バイト」と言われても困るな...。\n（師匠のお手伝いになる言葉を教えよう！）";
        aiPet.messageTimer = 180;
        input.value = ""; input.focus(); return;
    }
    // ▼▼▼ 修正：ワード派生型バイト（予約対応版） ▼▼▼
    else if (Object.keys({
        "書き写し": { base: "study", master: "building", actionMsg: "図面の書き写し中..." },
        "ふいご": { base: "train", master: "smithing", actionMsg: "ふいご吹き中...（体力勝負！）" },
        "石拾い": { base: "train", master: "farming", actionMsg: "畑の石拾い中..." },
        "皿洗い": { base: "run", master: "cooking", actionMsg: "猛ダッシュで皿洗い中...！" },
        "網の修理": { base: "study", master: "fishing", actionMsg: "集中して網の修理中..." },
        "荷物運び": { base: "run", master: "explore", actionMsg: "キャンプへの荷物運び中..." }
    }).includes(interpretedWord) && knows(interpretedWord)) {
        actionTriggered = true;
        const baitoWords = {
            "書き写し": { base: "study", master: "building", actionMsg: "図面の書き写し中..." },
            "ふいご": { base: "train", master: "smithing", actionMsg: "ふいご吹き中...（体力勝負！）" },
            "石拾い": { base: "train", master: "farming", actionMsg: "畑の石拾い中..." },
            "皿洗い": { base: "run", master: "cooking", actionMsg: "猛ダッシュで皿洗い中...！" },
            "網の修理": { base: "study", master: "fishing", actionMsg: "集中して網の修理中..." },
            "荷物運び": { base: "run", master: "explore", actionMsg: "キャンプへの荷物運び中..." }
        };
        let bData = baitoWords[interpretedWord];
        let metMasters = (aiPet.apprentice && aiPet.apprentice.metMasters) ? aiPet.apprentice.metMasters : [];
        if (metMasters.includes(bData.master)) {
            let facility = null;
            if (typeof findFacilityForTask === 'function') facility = findFacilityForTask('visit_master', bData.master);
            if (facility) {
                // ★修正：schedule = []; を削除し、push（追加）に変更！
                aiPet.schedule.push({
                    type: bData.base,
                    duration: 60,
                    isBaito: true,
                    baitoMaster: bData.master,
                    baitoWord: interpretedWord,
                    baitoActionMsg: bData.actionMsg
                });
                
                // ★追加：もし予定がこれ一つだけ（今すぐ開始）なら移動を開始する
                if (aiPet.schedule.length === 1) {
                    aiPet.startBuildingInteraction(facility);
                    aiPet.message = `「${interpretedWord}」だね！師匠の手伝いをしてくるよ！`;
                } else {
                    // すでに何かやっているなら予約だけして報告
                    aiPet.message = `「${interpretedWord}」の予約を入れたよ！順番にやっていくね！`;
                }
                aiPet.messageTimer = 150;
            } else {
                aiPet.message = "師匠の拠点が見つからないから手伝えないみたい...";
                aiPet.messageTimer = 120;
            }
        } else {
            aiPet.message = `「${interpretedWord}」の言葉は知ってるけど、手伝う相手がまだいないみたい...`;
            aiPet.messageTimer = 180;
        }
    }
    // ▲▲▲ 追加ここまで ▲▲▲
    else if (interpretedWord === "睡眠" && knows("睡眠")) { aiPet.schedule.push({type:'sleep', duration:60}); actionTriggered = true; }
    else if (interpretedWord === "ランニング" && knows("ランニング")) { aiPet.schedule.push({type:'run', duration:60}); actionTriggered = true; }
    else if (interpretedWord === "食事" && knows("食事")) { aiPet.schedule.push({type:'eat', duration:30}); actionTriggered = true; }
    else if (interpretedWord === "勉強" && knows("勉強")) { aiPet.schedule.push({type:'study', duration:60}); actionTriggered = true; }
    else if (interpretedWord === "筋トレ" && knows("筋トレ")) { aiPet.schedule.push({type:'train', duration:60}); actionTriggered = true; } 
    else if (interpretedWord === "探検" && knows("探検")) { 
        actionTriggered = true; 
        let canExplore = false;
        if (aiPet.apprentice) {
            if (aiPet.apprentice.currentMaster === 'explore') canExplore = true; 
            if (aiPet.apprentice.rank && aiPet.apprentice.rank['explore'] >= 10) canExplore = true; 
            if (aiPet.apprentice.retired && aiPet.apprentice.retired['explore']) canExplore = true; 
        }
        if (canExplore) { aiPet.schedule.push({type:'explore', duration:60}); } 
        else { aiPet.message = "一人で探検するのは危ないかも...\nまずは冒険家を探して、やり方を教わりたいな！"; aiPet.messageTimer = 180; }
    }
    else if ((interpretedWord === "料理" && knows("料理")) || (interpretedWord === "レストラン" && knows("レストラン"))) {
        actionTriggered = true;
        let isMaster = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['cooking']) || 
            (aiPet.apprentice.currentMaster === 'cooking' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['cooking'] >= 10)
        );
        let isApprentice = aiPet.apprentice && aiPet.apprentice.currentMaster === 'cooking';

        let myRestaurant = null;
        for (let k in assets) {
            // ★完全修正：isMobile ではなく isMasterShop フラグで「師匠の店」を除外し、純粋な自分の店だけを探す
            if (assets[k].type === 'restaurant' && !assets[k].isMasterShop) { myRestaurant = assets[k]; break; }
        }

        // ★レストラン建築分岐
        if (interpretedWord === "レストラン" && !myRestaurant) {
            let isMasterBuilder = aiPet.apprentice && ((aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) || (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10));
            if (isMasterBuilder) {
                aiPet.schedule.push({type: 'build', targetBuilding: 'restaurant', duration: 60});
                aiPet.message = "レストランの建築を予定に追加したよ！";
            } else {
                aiPet.message = "まだ修行中の身だから、レストランは作れないよ...\n(まずは建築士の免許皆伝を目指そう！)";
            }
            aiPet.messageTimer = 180;
        } else {
            // ★既存の料理（経営）処理
            if (isMaster) {
                if (myRestaurant) {
                    aiPet.schedule.push({type: 'cook', duration: 30});
                    if (aiPet.schedule.length === 1) {
                        aiPet.startBuildingInteraction(myRestaurant); aiPet.message = "レストランで料理を作ってくるね！";
                    } else { aiPet.message = "他にも料理の予約をしたよ！"; }
                } else { aiPet.message = "料理は得意だけど、自分のレストランがないと腕を振るえないや。\n(「レストラン」と指示して建築しよう！)"; }
            } else if (isApprentice) {
                let masterRest = null;
                for (let k in assets) {
                    // ★修正：isMobile ではなく isMasterShop（または旧データ互換のisMobile）を見る
                    if (assets[k].type === 'restaurant' && (assets[k].isMasterShop || assets[k].isMobile)) { masterRest = assets[k]; break; }
                }
                if (masterRest) {
                    aiPet.schedule.push({type: 'cook', duration: 30, isTrial: true});
                    if (aiPet.schedule.length === 1) {
                        aiPet.startBuildingInteraction(masterRest); aiPet.message = "師匠のキッチンを借りて、お試し料理に挑戦だ！";
                    } else { aiPet.message = "修行の予約を詰め込んだよ！頑張るね！"; }
                } else { aiPet.message = "料理の練習をしたいけど、師匠の姿が見当たらないな..."; }
            } else { aiPet.message = "料理かぁ...。やり方はなんとなく分かるけど、ちゃんとした場所で教わりたいな。\n(料理人に弟子入りしよう！)"; }
            aiPet.messageTimer = 180;
        }
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    }
    else if ((interpretedWord === "鍛冶" && knows("鍛冶")) || (interpretedWord === "鍛冶屋" && knows("鍛冶屋"))) {
        actionTriggered = true;
        let isMaster = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['smithing']) || 
            (aiPet.apprentice.currentMaster === 'smithing' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['smithing'] >= 10)
        );
        let isApprentice = aiPet.apprentice && aiPet.apprentice.currentMaster === 'smithing';

        let mySmith = null;
        for (let k in assets) {
            // ★完全修正：師匠の店を除外し、純粋な自分の鍛冶屋だけを探す
            if ((assets[k].type === 'smith' || assets[k].type === 'blacksmith') && !assets[k].isMasterShop) { mySmith = assets[k]; break; }
        }

        // ★鍛冶屋建築分岐
        if (interpretedWord === "鍛冶屋" && !mySmith) {
            let isMasterBuilder = aiPet.apprentice && ((aiPet.apprentice.retired && aiPet.apprentice.retired['building']) || (aiPet.apprentice.currentMaster === 'building' && aiPet.apprentice.isGraduated) || (aiPet.apprentice.rank && aiPet.apprentice.rank['building'] >= 10));
            if (isMasterBuilder) {
                aiPet.schedule.push({type: 'build', targetBuilding: 'smith', duration: 60});
                aiPet.message = "鍛冶屋の建築を予定に追加したよ！";
            } else {
                aiPet.message = "まだ修行中の身だから、鍛冶屋は作れないよ...\n(まずは建築士の免許皆伝を目指そう！)";
            }
            aiPet.messageTimer = 180;
        } else {
            // ★既存の鍛冶（経営）処理
            if (isMaster) {
                if (mySmith) {
                    aiPet.schedule.push({type: 'smith', duration: 60});
                    if (aiPet.schedule.length === 1) {
                        aiPet.startBuildingInteraction(mySmith); aiPet.message = "自分の工房で腕を振るってくるよ！";
                    } else { aiPet.message = "他にも鍛冶の予約をしたよ！"; }
                } else { aiPet.message = "鍛冶の腕はあるけど、自分の「鍛冶屋」がないと何も打てないや。\n(「鍛冶屋」と指示して建築しよう！)"; }
            } else if (isApprentice) {
                let masterCamp = null;
                for (let k in assets) {
                    // ★修正：移動フラグ(isMobile)の条件を消し、確実に「師匠のキャンプ」を探し出す！
                    if (k === 'blacksmith_master_camp' || (assets[k].type === 'blacksmith' && assets[k].name === '師匠のキャンプ')) { masterCamp = assets[k]; break; }
                }
                if (masterCamp) {
                    aiPet.schedule.push({type: 'smith', duration: 60, isTrial: true}); 
                    if (aiPet.schedule.length === 1) {
                        aiPet.startBuildingInteraction(masterCamp); aiPet.message = "師匠の金槌を借りて、お試し鍛冶に挑戦だ！";
                    } else { aiPet.message = "修行の予約を詰め込んだよ！頑張るね！"; }
                } else { aiPet.message = "鍛冶の練習をしたいけど、師匠がどこにもいないよ..."; }
            } else { aiPet.message = "鍛冶かぁ。火の扱いは危ないから、ちゃんと師匠に教わらないとね。\n(鍛冶師に弟子入りしよう！)"; }
            aiPet.messageTimer = 180;
        }
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    }
    else if (interpretedWord === "釣り" && knows("釣り")) {
        actionTriggered = true;
        // ==========================================
        // ★修正：インベントリがオブジェクト化（鮮度対応）したため、
        // 釣り竿の所持判定を安全な「id取得方式」に完全対応させる！
        // ==========================================
        let hasRod = false;
        if (aiPet.inventory && Array.isArray(aiPet.inventory)) {
            hasRod = aiPet.inventory.some(item => {
                let id = typeof item === 'string' ? item : item.id;
                return id && id.startsWith('rod_');
            });
        }
        
        if (aiPet.apprentice && aiPet.apprentice.currentMaster === 'fishing') hasRod = true;
        
        if (!hasRod) { 
            aiPet.message = "釣り竿を持ってないよ！"; aiPet.messageTimer = 120;
        } else {
            aiPet.schedule.push({type: 'fish', duration: 180}); 
            if (aiPet.schedule.length === 1) aiPet.message = "釣りに行くよ！"; 
            else aiPet.message = "釣りの予約を入れたよ！";
            aiPet.messageTimer = 120;
        }
    }
    else if (["ニンジン", "ピーマン", "トマト"].includes(interpretedWord) && knows(interpretedWord)) {
        actionTriggered = true;
        let isMasterFarmer = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['farming']) || 
            (aiPet.apprentice.currentMaster === 'farming' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['farming'] >= 10)
        );

        if (!isMasterFarmer) {
            aiPet.message = `言葉は知っているけど、まだ上手に植えられないよ...\n(農家に弟子入りして「免許皆伝」を目指そう！)`;
            aiPet.messageTimer = 180;
            return;
        }

        let seedId = interpretedWord === 'ニンジン' ? 'seed_carrot' : interpretedWord === 'ピーマン' ? 'seed_pepper' : 'seed_tomato';
        
        if (aiPet.inventory && aiPet.inventory.includes(seedId)) {
            // ★完全修正：種まきもキューに積むだけ！
            aiPet.schedule.push({type: 'farm', intendedSeed: seedId, duration: 60});
            if (aiPet.schedule.length === 1) aiPet.message = `${interpretedWord}を育てに行く！`; 
            else aiPet.message = `${interpretedWord}を育てる予約を入れたよ！`;
            aiPet.messageTimer = 120;
        } else { 
            aiPet.message = `${interpretedWord}の種を持ってないよ`; aiPet.messageTimer = 120; 
        }
    }
    else if (interpretedWord === "退治" && knows("退治")) {
        actionTriggered = true; 
        // ★完全修正：害虫退治もキューに積むだけ！
        aiPet.schedule.push({type: 'farm', intendedAction: 'pest_control', duration: 60});
        if (aiPet.schedule.length === 1) aiPet.message = "害虫退治にいくよ！"; 
        else aiPet.message = "害虫退治の予約を入れたよ！";
        aiPet.messageTimer = 120;
    }
    else if (interpretedWord === "農業" && knows("農業")) {
        actionTriggered = true;
        let isMaster = aiPet.apprentice && (
            (aiPet.apprentice.retired && aiPet.apprentice.retired['farming']) || 
            (aiPet.apprentice.currentMaster === 'farming' && aiPet.apprentice.isGraduated) ||
            (aiPet.apprentice.rank && aiPet.apprentice.rank['farming'] >= 10)
        );
        let isApprentice = aiPet.apprentice && aiPet.apprentice.currentMaster === 'farming';

        if (!isMaster && !isApprentice) {
            aiPet.message = "農家さんに教わらないと、勝手に畑をいじっちゃダメだよ。";
            aiPet.messageTimer = 150;
            return;
        }

        // ★完全修正：農業（自動手入れ）もキューに積むだけ！
        aiPet.schedule.push({type: 'farm', duration: 60});
        if (aiPet.schedule.length === 1) aiPet.message = "畑の様子を見てくるね！"; 
        else aiPet.message = "畑の手入れを予約したよ！";
        aiPet.messageTimer = 120;
    }

    if (!actionTriggered) {
        if (justLearned) { 
            if (isInterpreted) {
                aiPet.message = `「${rawText}」…つまり「${interpretedWord}」だね！覚えたよ！`;
            } else {
                aiPet.message = `「${interpretedWord}」…！\nよく分からないけど、言葉を覚えたよ！`; 
            }
        } 
        else { aiPet.message = "？（何を言っているのかわからないみたい...）"; }
        aiPet.messageTimer = 180;
    } else if (justLearned) {
        if (isInterpreted) {
            aiPet.message = `「${rawText}」…つまり「${interpretedWord}」だね！\nさっそくやってみる！`;
        } else {
            aiPet.message = `「${interpretedWord}」を覚えたよ！\nさっそくやってみる！`; 
        }
        aiPet.messageTimer = 180;
    }

    input.value = "";
    input.focus(); 
    if (typeof updateScheduleList === 'function') updateScheduleList();
    if (typeof updateCommandHUD === 'function') updateCommandHUD();
};

// ==========================================
// ★究極改修：カジノ入室時の専用ロビーとAI連動処理（リッチUI版）
// ==========================================
window.openCasino = function() {
    // ▼▼▼ 追加：カジノに足を踏み入れた時のカードアンロック ▼▼▼
    if (window.aiPet && typeof window.triggerTCGUnlock === 'function') {
        window.triggerTCGUnlock('visit_casino', window.aiPet.generation);
    }

    // ★追加：カジノ（ロビー）専用BGMを再生
    if (window.audioManager) {
        window.audioManager.playBGM('card_lobby');
    }
    
    // カジノ来店フラグ（念のための直接付与）
    if (window.aiPet) {
        window.aiPet.visitedCasino = true;
        if (typeof saveGameData === 'function') saveGameData();
    }

    // 1. TCGデータがまだ無い、または60枚未満の場合は「入場拒否」の演出（alert廃止）
    if (!window.TCG || !window.TCG.myCollection || window.TCG.myCollection.length < 60) {
        let count = window.TCG ? (window.TCG.myCollection ? window.TCG.myCollection.length : 0) : 0;
        
        // メッセージを出して、AIを外に追い出す
        if (window.aiPet) {
            window.aiPet.message = "まだ入れないみたい...";
            window.aiPet.messageTimer = 180;
            window.aiPet.actionState = 'exiting'; 
            window.aiPet.isIndoors = false;
        }
        
        // ★修正：alertの代わりに、画面中央にリッチなポップアップを出す
        let popup = document.createElement('div');
        popup.id = 'casino-reject-popup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); z-index: 60000;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;
        
        popup.innerHTML = `
            <div style="background: #2a2a2a; border: 4px solid #FFC107; border-radius: 12px; padding: 30px; width: 450px; text-align: center; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size: 50px; margin-bottom: 15px;">🛑</div>
                <h2 style="color: #FFC107; margin-top: 0; margin-bottom: 20px;">カジノの闘技場</h2>
                <div style="font-size: 16px; color: #ddd; line-height: 1.6; margin-bottom: 20px; background: #111; padding: 15px; border-radius: 8px;">
                    「ここは特別な『カードゲーム』の闘技場だ。<br>
                    参加するには、カード化された『思い出』が<br>
                    <span style="color:#ff5252; font-weight:bold;">最低でも60個</span> 必要だぞ」
                </div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 25px;">
                    現在: <span style="color: ${count >= 60 ? '#4CAF50' : '#ff5252'};">${count} / 60個</span>
                </div>
                <button onclick="document.getElementById('casino-reject-popup').style.opacity='0'; setTimeout(()=>document.getElementById('casino-reject-popup').remove(), 300);" 
                        style="padding: 12px 30px; font-size: 18px; font-weight: bold; background: #FF9800; color: white; border: 2px solid #FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;"
                        onmouseover="this.style.background='#F57C00'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='#FF9800'; this.style.transform='scale(1)';">
                    わかった
                </button>
            </div>
        `;
        document.body.appendChild(popup);
        
        // アニメーション発動
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.firstElementChild.style.transform = 'scale(1)';
        }, 50);
        
        return;
    }

    // 2. AIをカジノ内で「待機状態」にして、勝手に出ないようにする
    if (window.aiPet) {
        window.aiPet.actionState = 'idle'; // exploreTimerによる自動退出をストップ
        window.aiPet.visualAction = null;
        window.aiPet.message = "カジノの地下闘技場にやってきた！";
        window.aiPet.messageTimer = 120;
    }

    // 3. 既存の小さなTCGメニューを非表示にする（もし開いていれば）
    const oldMenu = document.getElementById('tcg-menu-container');
    if (oldMenu) oldMenu.style.display = 'none';

    // 4. 既存のボタンに仕込まれた「オンライン対戦機能」を抽出して再利用するハック
    const buttons = document.querySelectorAll('button');
    let onlineMatchFunc = "alert('オンライン対戦機能が見つかりません');";
    let onlineRegisterFunc = "alert('デッキ登録機能が見つかりません');";
    
    buttons.forEach(btn => {
        const text = btn.innerText.trim();
        if (text.includes('世界のプレイヤーと対戦')) {
            onlineMatchFunc = btn.getAttribute('onclick') || onlineMatchFunc;
        }
        if (text.includes('デッキをオンライン登録')) {
            onlineRegisterFunc = btn.getAttribute('onclick') || onlineRegisterFunc;
        }
    });

    // 5. アリーナ風の立派なカジノロビーUIを生成
    let casinoUI = document.getElementById('casino-lobby-ui');
    if (!casinoUI) {
        casinoUI = document.createElement('div');
        casinoUI.id = 'casino-lobby-ui';
        casinoUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(10,5,10,0.95); z-index: 50000; display: flex; flex-direction: column; align-items: center; color: white; font-family: sans-serif; overflow-y: auto;`;
        document.body.appendChild(casinoUI);
    }

    casinoUI.innerHTML = `
        <h1 style="color:#FFC107; font-size:36px; margin-top:50px; text-shadow: 0 0 15px rgba(255,193,7,0.8);">🎰 カジノ・地下闘技場 🎰</h1>
        <p style="font-size:16px; color:#ccc; margin-bottom:40px; text-align:center;">
            ここではAIの記憶を具現化したカードで、熱いバトルが繰り広げられている。<br>
            デッキを編成し、世界中のプレイヤーや強敵に挑もう！
        </p>
        
        <div style="display:flex; flex-direction:column; gap:20px; width: 450px; max-width: 90%;">
            <button onclick="document.getElementById('casino-lobby-ui').style.display='none'; window.openDeckBuilder();" 
                style="padding:15px; font-size:20px; font-weight:bold; background:#2196F3; color:white; border:3px solid #FFF; border-radius:8px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🗃️ コレクション / デッキ編成
            </button>
            
            <button onclick="document.getElementById('casino-lobby-ui').style.display='none'; ${onlineMatchFunc}" 
                style="padding:15px; font-size:20px; font-weight:bold; background:#E91E63; color:white; border:3px solid #FFF; border-radius:8px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🌐 世界のプレイヤーと対戦
            </button>
            
            <button onclick="document.getElementById('casino-lobby-ui').style.display='none'; window.startBattle();" 
                style="padding:15px; font-size:20px; font-weight:bold; background:#4CAF50; color:white; border:3px solid #FFF; border-radius:8px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ⚔️ 名もなきCPUと練習
            </button>

            <button onclick="${onlineRegisterFunc}" 
                style="padding:15px; font-size:18px; font-weight:bold; background:#9C27B0; color:white; border:3px solid #FFF; border-radius:8px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ☁️ デッキをオンライン登録
            </button>
        </div>
        
        <button onclick="window.exitCasino()" 
            style="margin-top: 50px; padding:15px 40px; font-size:20px; font-weight:bold; background:#444; color:white; border:3px solid #777; border-radius:8px; cursor:pointer; transition: 0.2s;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#444'">
            カジノを出る
        </button>
    `;
    
    casinoUI.style.display = 'flex';
};

// ★ カジノからAIを確実に退出させる処理
window.exitCasino = function() {
    const casinoUI = document.getElementById('casino-lobby-ui');
    if (casinoUI) casinoUI.style.display = 'none';

    // ★追加：カジノから出たら、育成モードのキャラクターBGMに戻す
    if (window.audioManager) {
        window.audioManager.restoreMainBGM();
    }
    
    if (window.aiPet && window.aiPet.indoorTarget && window.aiPet.indoorTarget.type === 'casino') {
        window.aiPet.actionState = 'exiting';
        window.aiPet.isIndoors = false;
        window.aiPet.interactionTarget = null;
        window.aiPet.indoorTarget = null;
        window.aiPet.visualAction = null;
        window.aiPet.message = "カジノから出たよ！";
        window.aiPet.messageTimer = 120;
        
        if (window.aiPet.schedule && window.aiPet.schedule.length > 0) {
            window.aiPet.schedule.shift(); 
        }
        if (typeof window.updateScheduleList === 'function') {
            window.updateScheduleList();
        }
    }
};

// ★ 超重要：画面を監視し、すべてのTCG画面が閉じられたら自動でカジノから退出させる！
setInterval(() => {
    // AIがカジノの中にいて、かつ勝手に行動しないようにidleで待機しているかチェック
    if (window.aiPet && window.aiPet.indoorTarget && window.aiPet.indoorTarget.type === 'casino' && window.aiPet.actionState === 'idle') {
        
        const lobby = document.getElementById('casino-lobby-ui');
        const battle = document.getElementById('tcg-battle-ui');
        const deck = document.getElementById('tcg-deck-builder');
        
        const isLobbyOpen = lobby && lobby.style.display !== 'none';
        const isBattleOpen = battle && battle.style.display !== 'none';
        const isDeckOpen = deck && deck.style.display !== 'none';
        
        // カジノロビー、バトル画面、デッキ編成画面の「すべてが閉じられた」時だけ退出する！
        if (!isLobbyOpen && !isBattleOpen && !isDeckOpen) {
            window.exitCasino();
        }
    }
}, 500);
function startFishingGame() { const el = document.getElementById('fishingOverlay'); if(el) el.classList.add('active'); }

window.clearSchedule = function() { 
    if (typeof aiPet === 'undefined') return;
    
    if (aiPet.schedule && aiPet.schedule.length > 0) {
        const quest = aiPet.schedule.find(t => t.type === 'master_quest');
        if (quest) {
            quest.aborted = true;
            if (typeof aiPet.processApprenticeQuestFinish === 'function') {
                aiPet.processApprenticeQuestFinish(quest);
            }
        }
    }

    aiPet.schedule = []; 
    // ★追加：店内に隔離して隠しておいたタスクも完全に破棄する
    if (aiPet._stashedTasks) aiPet._stashedTasks = [];
    
    aiPet.message = "中断しました"; 
    aiPet.messageTimer = 120;
    
    aiPet.visualAction = null;
    aiPet.actionState = 'idle';
    aiPet.isIndoors = false;
    aiPet.indoorTarget = null;
    aiPet.exploreState = null;
    aiPet.visualScale = 1.0;
    aiPet.fishingData = null;

    if (typeof window.updateScheduleList === 'function') window.updateScheduleList(); 
    if (typeof updateAIStatusText === 'function') updateAIStatusText();
};

window.addScheduleFromInput = function(type) {
    const val = document.getElementById('scheduleTimeInput').value;
    aiPet.schedule.push({type: type, duration: parseInt(val)}); 
    window.updateScheduleList();
};

window.loadDebugData = function() {
    if (typeof aiPet === 'undefined') return;
    if(document.getElementById('dbg-gen')) document.getElementById('dbg-gen').value = aiPet.generation || 1;
    if(document.getElementById('dbg-age')) document.getElementById('dbg-age').value = aiPet.age || 0;
    if(document.getElementById('dbg-hour')) document.getElementById('dbg-hour').value = aiPet.debugHour || 12;
    
    if(document.getElementById('dbg-season')) document.getElementById('dbg-season').value = aiPet.season || 'spring';

    if(document.getElementById('dbg-energy')) document.getElementById('dbg-energy').value = Math.floor(aiPet.energy || 100);
    if(document.getElementById('dbg-hunger')) document.getElementById('dbg-hunger').value = Math.floor(aiPet.hunger || 100);
    if(document.getElementById('dbg-lifespan')) document.getElementById('dbg-lifespan').value = aiPet.lifespan || 100;
    if(document.getElementById('dbg-intel')) document.getElementById('dbg-intel').value = Math.floor((aiPet.stats && aiPet.stats.intel) || 10);
    if(document.getElementById('dbg-power')) document.getElementById('dbg-power').value = Math.floor((aiPet.stats && aiPet.stats.power) || 10);
    if(document.getElementById('dbg-mood')) document.getElementById('dbg-mood').value = Math.floor((aiPet.stats && aiPet.stats.mood) || 100);

    if(document.getElementById('dbg-stat-beauty')) document.getElementById('dbg-stat-beauty').value = Math.floor((aiPet.stats && aiPet.stats.beauty) || 10);
    // ★追加: デバッグ画面を開く際に SPEED を読み込む
    if(document.getElementById('dbg-stat-speed')) document.getElementById('dbg-stat-speed').value = Math.floor((aiPet.stats && aiPet.stats.speed) || 10);
    if(document.getElementById('dbg-darkness')) document.getElementById('dbg-darkness').value = Math.floor(aiPet.darknessCounter || 0);
    if(document.getElementById('dbg-gold')) document.getElementById('dbg-gold').value = aiPet.gold || 0;

    if(document.getElementById('dbg-skill-cook')) document.getElementById('dbg-skill-cook').value = (aiPet.skills && aiPet.skills.cooking) ? aiPet.skills.cooking : 1;
    if(document.getElementById('dbg-skill-smith')) document.getElementById('dbg-skill-smith').value = (aiPet.skills && aiPet.skills.smithing) ? aiPet.skills.smithing : 1;
    if(document.getElementById('dbg-skill-build')) document.getElementById('dbg-skill-build').value = (aiPet.skills && aiPet.skills.building) ? aiPet.skills.building : 1;

    const godCheck = document.getElementById('dbg-god-mode');
    if (godCheck) aiPet.godMode = godCheck.checked;

    const sel = document.getElementById('dbg-char-select');
    if (sel) {
        sel.innerHTML = "";
        let charKeys = [];
        if (typeof aiConfigs !== 'undefined' && aiConfigs) { charKeys = Object.keys(aiConfigs); }
        else { charKeys = ['robot', 'spirit', 'magician']; }
        charKeys.forEach(c => {
            const opt = document.createElement('option'); opt.value = c; opt.innerText = c;
            if(c === aiPet.currentSkin) opt.selected = true; sel.appendChild(opt);
        });
        if(typeof updateDebugEvoInfo === 'function') sel.onchange = updateDebugEvoInfo;
    }

    const mapList = document.getElementById('dbg-map-objects');
    if (mapList && typeof assets !== 'undefined') {
        mapList.innerHTML = "";
        for(let key in assets) {
            const a = assets[key];
            if (a.type === 'ground' || a.type === 'road') continue;
            const div = document.createElement('div');
            div.style.marginBottom = "4px"; div.style.borderBottom = "1px solid #333"; div.style.padding = "2px";
            let durVal = (typeof a.durability !== 'undefined') ? a.durability : "";
            let html = `<span style="color:#aaa;">${a.name}</span> <span style="font-size:10px; color:#666;">(${key.substring(0,8)}...)</span><br>`;
            if (durVal !== "" && durVal >= 0) { html += `耐久: <input type="number" class="dbg-map-val" data-uid="${key}" data-prop="durability" value="${durVal}" style="width:40px; background:#333; color:white; border:1px solid #555;">`; } 
            else { html += `<span style="color:#555; font-size:10px;">(耐久なし)</span>`; }
            html += ` <button onclick="delete assets['${key}']; loadDebugData();" style="background:#500; color:white; border:none; border-radius:3px; cursor:pointer; font-size:10px;">Del</button>`;
            div.innerHTML = html;
            mapList.appendChild(div);
        }
    }

    const itemList = document.getElementById('dbg-items');
    if (itemList) {
        itemList.innerHTML = "";
        const counts = {};
        // ★修正: オブジェクト構造に対応
        if (aiPet.inventory) aiPet.inventory.forEach(item => {
            let k = typeof item === 'string' ? item : item.id;
            counts[k] = (counts[k]||0)+1;
        });
        for (let key in itemCatalog) {
            const count = counts[key] || 0; const item = itemCatalog[key];
            const div = document.createElement('div'); const style = count > 0 ? 'color:white' : 'color:#555';
            div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><span style="${style}; font-size:11px;">${item.name}</span><input type="number" class="dbg-item-val" data-key="${key}" value="${count}" min="0" style="width:40px; background:#333; color:white; border:1px solid #555;"></div>`;
            itemList.appendChild(div);
        }
    }
};

window.saveDebugData = function() {
    if (typeof aiPet === 'undefined') return;
    
    aiPet.generation = parseInt(document.getElementById('dbg-gen').value) || 1;
    aiPet.age = parseInt(document.getElementById('dbg-age').value) || 0;
    aiPet.debugHour = parseInt(document.getElementById('dbg-hour').value) || 12;
    
    const seasonSelect = document.getElementById('dbg-season');
    if (seasonSelect) aiPet.season = seasonSelect.value;

    aiPet.energy = parseInt(document.getElementById('dbg-energy').value) || 100;
    aiPet.hunger = parseInt(document.getElementById('dbg-hunger').value) || 100;
    aiPet.lifespan = parseInt(document.getElementById('dbg-lifespan').value) || 100;
    
    if (!aiPet.stats) aiPet.stats = { intel: 10, power: 10, mood: 100, beauty: 10 };
    aiPet.stats.intel = parseInt(document.getElementById('dbg-intel').value) || 10;
    aiPet.stats.power = parseInt(document.getElementById('dbg-power').value) || 10;
    aiPet.stats.mood = parseInt(document.getElementById('dbg-mood').value) || 100;

    const beautyInput = document.getElementById('dbg-stat-beauty');
    if(beautyInput) aiPet.stats.beauty = parseFloat(beautyInput.value) || 10;

    // ★追加: 保存時に SPEED をデータに反映する
    const speedInput = document.getElementById('dbg-stat-speed');
    if(speedInput) aiPet.stats.speed = parseFloat(speedInput.value) || 10;

    const darkInput = document.getElementById('dbg-darkness');
    if(darkInput) aiPet.darknessCounter = parseFloat(darkInput.value) || 0;

    aiPet.gold = parseInt(document.getElementById('dbg-gold').value) || 0;
    if (!aiPet.skills) aiPet.skills = { cooking: 1, smithing: 1, building: 1 };
    aiPet.skills.cooking = parseFloat(document.getElementById('dbg-skill-cook').value) || 1;
    aiPet.skills.smithing = parseFloat(document.getElementById('dbg-skill-smith').value) || 1;
    const buildInput = document.getElementById('dbg-skill-build');
    if (buildInput) aiPet.skills.building = parseFloat(buildInput.value) || 1;

    const godCheck = document.getElementById('dbg-god-mode');
    if (godCheck) aiPet.godMode = godCheck.checked;

    const sel = document.getElementById('dbg-char-select');
    if (sel && sel.value) { aiPet.currentSkin = sel.value; }

    const mapInputs = document.querySelectorAll('.dbg-map-val');
    mapInputs.forEach(input => { const uid = input.getAttribute('data-uid'); const val = parseInt(input.value); if (assets && assets[uid]) { assets[uid].durability = val; } });

    const itemInputs = document.querySelectorAll('.dbg-item-val');
    const newInventory = [];
    
    // ★完全修正: 既存のアイテムの「鮮度(age)」を保持するための辞書を作成
    let currentInvObj = {};
    if (aiPet.inventory) {
        aiPet.inventory.forEach(item => {
            let id = typeof item === 'string' ? item : item.id;
            if (!currentInvObj[id]) currentInvObj[id] = [];
            // 古い文字列データが混ざっていても安全にオブジェクト化して退避
            currentInvObj[id].push(typeof item === 'string' ? { id: item, age: 0 } : item);
        });
    }

    itemInputs.forEach(input => { 
        const key = input.getAttribute('data-key'); 
        const count = parseInt(input.value); 
        let existingItems = currentInvObj[key] || [];

        for(let i=0; i<count; i++) { 
            if (i < existingItems.length) {
                // 既に持っていた分は、元の鮮度データを引き継いで戻す
                newInventory.push(existingItems[i]); 
            } else {
                // デバッグで増やした分は、新品(age:0)のオブジェクトとして追加
                newInventory.push({ id: key, age: 0 }); 
            }
        } 
    });
    aiPet.inventory = newInventory;

    saveGameData();
    document.getElementById('debugOverlay').classList.remove('active');
    if(typeof switchMode === 'function') switchMode('play');
    updateStatUI();
};

// 【修正後】TDZエラーを完全に回避する安全装置付き
setInterval(() => {
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode === 'play') {
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
    }
}, 1000);

setTimeout(() => {
    applyTranslations();
    updateStatUI();
    updateCommandHUD();
}, 500);

let rouletteCandidates = [];
let rouletteAnimId = null;
let rouletteRotation = 0;
let rouletteSpeed = 0;
let rouletteState = 'idle'; 
let selectedEvoIndex = -1;
let effectTicks = 0;
let previousSkin = "";

// ★修正：プリロードも余計なすり替えを削除！
window.openEvolutionMenu = function() {
    const evos = typeof aiPet !== 'undefined' && aiPet.getAvailableEvolutions ? aiPet.getAvailableEvolutions() : [];
    if (evos.length === 0) return;
    
    rouletteCandidates = evos;
    previousSkin = aiPet.currentSkin || 'robot'; 
    
    // ==========================================
    // ★ルーレット演出中に画像をシンプルに先読みするだけ！
    evos.forEach(evo => {
        let type = evo.next;
        let conf = aiConfigs[type];
        if (conf) {
            let imgKey = conf.img || type.split('_')[0];
            if (!images[imgKey] && typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) {
                images[imgKey] = new Image();
                images[imgKey].src = window.dynamicImageCatalog[imgKey];
            }
        }
    });
    // ==========================================

    const container = document.getElementById('roulette-container');
    container.innerHTML = "";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.height = "250px"; 
    
    const canvas = document.createElement('canvas');
    canvas.id = 'evolutionCanvas';
    canvas.width = 400;
    canvas.height = 300;
    container.appendChild(canvas);
    
    document.getElementById('btnStartRoulette').style.display = 'block';
    document.getElementById('btnCancelEvolution').style.display = 'block';
    document.getElementById('evolutionOverlay').classList.add('active');
    
    rouletteState = 'idle';
    rouletteRotation = 0;
    
    if (rouletteAnimId) cancelAnimationFrame(rouletteAnimId);
    rouletteAnimLoop(); 
};

// ★究極修正：進化後の画像をストレートに描画し、未調整時の枠サイズも自動補正する完全版！
function drawCharacterSprite(ctx, type, cx, cy, maxW, maxH, isSilhouette, alpha = 1.0) {
    let conf = aiConfigs[type];
    if(!conf) return;
    if (conf.img && aiConfigs[conf.img] && aiConfigs[conf.img].actions) conf = aiConfigs[conf.img];
    
    let imgKey = conf.img || type.split('_')[0];
    let img = images[imgKey];

    // 画像がまだリクエストされていない場合はロードを開始する
    if (!img) {
        if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) {
            images[imgKey] = new Image();
            images[imgKey].src = window.dynamicImageCatalog[imgKey]; 
        }
        return; 
    }
    
    // ★超重要：ロード中、または画像がない(404エラー)場合は描画をスキップ（クラッシュを完璧に防ぐ）
    if (!img.complete || img.naturalWidth === 0) return;
    
    // 基本の座標を取得
    let f = (conf.actions && conf.actions.idle && conf.actions.idle.length > 0) ? conf.actions.idle[0] : {sx:0, sy:0, sw:300, sh:300};
    
    // ==========================================
    // ★天才的な安全装置：
    // 進化系（名前に '_' が含まれる）の場合、切り取り枠が基本種族のまま（例: robotの幅194等）だと
    // 画像が大きすぎて4分の1しか映らないため、未調整と判断して仮の大きな枠で切り取る！
    // ==========================================
    if (type.includes('_') && f.sw < 250) {
        // スプライトシートの左上にあると仮定して、少し広め（450x450）に切り取る
        // ※もしこれでもはみ出る場合は 500 などに増やしてください
        f = { sx: 0, sy: 0, sw: 450, sh: 450 }; 
    }

    const scale = Math.min(maxW / f.sw, maxH / f.sh);
    const drawW = f.sw * scale; 
    const drawH = f.sh * scale;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    if (isSilhouette) {
        ctx.filter = "brightness(0)"; 
    }
    ctx.translate(cx, cy);
    ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();
}

function rouletteAnimLoop() {
    const canvas = document.getElementById('evolutionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 120; 
    
    ctx.clearRect(0, 0, width, height);
    
    const N = rouletteCandidates.length;
    const sliceAngle = (2 * Math.PI) / N;
    const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#ff9800', '#8bc34a'];
    
    if (rouletteState === 'idle' || rouletteState === 'spinning') {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rouletteRotation);
        
        for (let i = 0; i < N; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const midAngle = startAngle + sliceAngle / 2;
            const imgRadius = radius * 0.6; 
            const charCx = Math.cos(midAngle) * imgRadius;
            const charCy = Math.sin(midAngle) * imgRadius;
            
            ctx.save();
            ctx.translate(charCx, charCy);
            ctx.rotate(midAngle + Math.PI / 2); 
            drawCharacterSprite(ctx, rouletteCandidates[i].next, 0, 0, 50, 50, true);
            ctx.restore();
        }
        ctx.restore();
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius + 5);
        ctx.lineTo(cx - 10, cy - radius - 15);
        ctx.lineTo(cx + 10, cy - radius - 15);
        ctx.closePath();
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (rouletteState === 'spinning') {
            rouletteRotation -= rouletteSpeed; 
            rouletteSpeed *= 0.985; 
            
            if (rouletteSpeed < 0.002) {
                rouletteSpeed = 0;
                rouletteState = 'effect';
                effectTicks = 0;
                
                let pointerAngle = (-Math.PI / 2) - rouletteRotation;
                pointerAngle = (pointerAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                
                selectedEvoIndex = Math.floor(pointerAngle / sliceAngle) % N;
                
                const selectedEvo = rouletteCandidates[selectedEvoIndex];
                aiPet.message = "進化した！！";
                aiPet.messageTimer = 180;

                // ==========================================
                // ★ 修正：姿を変える直前に、現在の姿を履歴(pastSkins)に保存する！
                // ==========================================
                if (!aiPet.pastSkins) aiPet.pastSkins = []; // 履歴配列がない場合は作成
                
                // 現在の姿（baseTypeまたは現在のスキン）を履歴に追加
                let oldSkin = aiPet.currentSkin || aiPet.baseType || 'robot';
                if (!aiPet.pastSkins.includes(oldSkin)) {
                    aiPet.pastSkins.push(oldSkin);
                }

                // ==========================================
                // ★ここを1行追加！！AIの姿を本当に変える！！
                aiPet.currentSkin = selectedEvo.next;
                // ==========================================
                
                if (!aiPet.discoveredMonsters) aiPet.discoveredMonsters = [];
                if (!aiPet.discoveredMonsters.includes(selectedEvo.next)) aiPet.discoveredMonsters.push(selectedEvo.next);
                saveGameData();
            }
        }

    } else if (rouletteState === 'effect') {
        effectTicks++;
        const targetEvo = rouletteCandidates[selectedEvoIndex].next;
        
        let bgAlpha = Math.max(0, 1.0 - effectTicks / 30);
        if (bgAlpha > 0) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rouletteRotation);
            for (let i = 0; i < N; i++) {
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, radius, i * sliceAngle, (i+1) * sliceAngle); ctx.closePath();
                ctx.fillStyle = colors[i % colors.length]; ctx.globalAlpha = bgAlpha; ctx.fill();
            }
            ctx.restore();
        }
        
        let oldAlpha = 0; let newAlpha = 0;
        if (effectTicks > 30 && effectTicks <= 80) {
            oldAlpha = 1.0; 
        } else if (effectTicks > 80 && effectTicks <= 140) {
            oldAlpha = Math.max(0, 1.0 - (effectTicks - 80) / 60); 
            newAlpha = Math.min(1.0, (effectTicks - 80) / 60);     
        } else if (effectTicks > 140) {
            newAlpha = 1.0;
        }
        
        if (oldAlpha > 0) drawCharacterSprite(ctx, previousSkin, cx, cy, 180, 180, true, oldAlpha);
        if (newAlpha > 0 && effectTicks < 180) drawCharacterSprite(ctx, targetEvo, cx, cy, 180, 180, true, newAlpha);
        
        let flashAlpha = 0;
        if (effectTicks > 140 && effectTicks <= 160) flashAlpha = (effectTicks - 140) / 20; 
        else if (effectTicks > 160 && effectTicks <= 200) flashAlpha = Math.max(0, 1.0 - (effectTicks - 160) / 40); 
        
        if (flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.globalAlpha = flashAlpha;
            for(let i=0; i<12; i++) {
                ctx.rotate((Math.PI * 2 / 12) + effectTicks * 0.05);
                ctx.fillStyle = "#FFF";
                ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(0, 300); ctx.fill();
            }
            ctx.restore();
        }
        
        if (effectTicks > 160) {
            let colorAlpha = Math.min(1.0, (effectTicks - 160) / 10);
            drawCharacterSprite(ctx, targetEvo, cx, cy, 180, 180, false, colorAlpha);
        }
        
        if (effectTicks > 240) {
            if (typeof updateStatUI === 'function') updateStatUI();
            document.getElementById('evolutionOverlay').classList.remove('active');
            window.isGamePaused = false;
            return; 
        }
    }
    
    rouletteAnimId = requestAnimationFrame(rouletteAnimLoop);
}

window.startEvolutionRoulette = function() {
    document.getElementById('btnStartRoulette').style.display = 'none';
    document.getElementById('btnCancelEvolution').style.display = 'none';
    
    window.isGamePaused = true; 
    
    rouletteState = 'spinning';
    rouletteSpeed = 0.4 + Math.random() * 0.2; 
};

window.cancelEvolution = function() {
    document.getElementById('evolutionOverlay').classList.remove('active');
};

// ==========================================
// ★ UI制御：弟子入り・クエスト・会話の統合システム
// ==========================================
let currentEncounterMaster = null;
let currentEncounterMode = '';
let savedEncounterMsg = ""; 

// ==========================================
// ★ 修正：UIからバイトを「クエストとして受注」する機能（ヒント形式版）
// ==========================================
window.startBaito = function() {
    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    
    if (hero.apprentice && currentEncounterMaster && !hero.apprentice.isExcommunicated) {
        if (!hero.apprentice.activeQuests) hero.apprentice.activeQuests = [];
        
        const mType = currentEncounterMaster;
        
        // 既に同じ師匠のバイトを受注しているかチェック
        const existingBaito = hero.apprentice.activeQuests.find(q => q.masterType === mType && q.isBaitoQuest);
        if (existingBaito) {
            hero.message = "まずは今受けている手伝いを終わらせよう！"; hero.messageTimer = 120;
            return;
        }

        let baitoName = ""; let baitoWord = ""; let baseAct = ""; let targetCount = 2; let baitoDesc = "";
        if (mType === 'building') { 
            baitoName = "図面の書き写し"; baitoWord = "書き写し"; baseAct = "study"; 
            baitoDesc = "師匠が描いた図面を複製する手伝いをしよう。AIにどう指示すれば伝わるだろうか？";
        }
        else if (mType === 'smithing') { 
            baitoName = "ふいご吹き"; baitoWord = "ふいご"; baseAct = "train"; 
            baitoDesc = "炉に風を送り込んで火力を上げる手伝いをしよう。AIにどう指示すれば伝わるだろうか？";
        }
        else if (mType === 'farming') { 
            baitoName = "畑の石拾い"; baitoWord = "石拾い"; baseAct = "train"; 
            baitoDesc = "畑を耕す邪魔になる石を取り除こう。AIにどう指示すれば伝わるだろうか？";
        }
        else if (mType === 'cooking') { 
            baitoName = "皿洗い"; baitoWord = "皿洗い"; baseAct = "run"; 
            baitoDesc = "山積みになった汚れた食器を綺麗にしよう。AIにどう指示すれば伝わるだろうか？";
        }
        else if (mType === 'fishing') { 
            baitoName = "網の修理"; baitoWord = "網の修理"; baseAct = "study"; 
            baitoDesc = "魚が逃げないよう、破れた漁網を直す手伝いをしよう。AIにどう指示すれば伝わるだろうか？";
        }
        else if (mType === 'explore') { 
            baitoName = "キャンプへの荷物運び"; baitoWord = "荷物運び"; baseAct = "run"; 
            baitoDesc = "探検の拠点となるキャンプへ物資を運ぼう。AIにどう指示すれば伝わるだろうか？";
        }

        // バイトクエストをリストに追加
        hero.apprentice.activeQuests.push({
            name: `手伝い：${baitoName}`,
            desc: `${baitoDesc}`,
            rank: -1, // バイト用のダミーランク
            masterType: mType,
            qVal: 0,
            isBaitoQuest: true,
            baitoWord: baitoWord,
            targetCount: targetCount
        });

        // ★AIのセリフも、答えを言わずに「どうすればいいか教えて」というニュアンスに変更
        hero.message = `「${baitoName}」の手伝いを引き受けたよ！何をすればいいか言葉で教えてね！`; 
        hero.messageTimer = 180;
        
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData();
        
        // ダイアログを閉じる
        const overlay = document.getElementById('encounterOverlay');
        if (overlay) overlay.classList.remove('active');
        window.isGamePaused = false;
        currentEncounterMaster = null; currentEncounterMode = '';
    }
};

// ==========================================
// ★ 追加：連続で次の課題を受ける機能
// ==========================================
window.requestNextQuest = function() {
    // ★大修正：隠しポケットにメモしておいた師匠の名前を確実に取り出す！
    const masterType = window._lastVisitedMaster;

    if (typeof confirmEncounter === 'function') confirmEncounter(true);
    
    // UIが閉じた直後に、自動でもう一度師匠に話しかける処理を呼ぶ！
    setTimeout(() => {
        if (typeof window.checkMasterVisit === 'function' && masterType) {
            window.checkMasterVisit(masterType);
        } else {
            console.warn("師匠のデータが見失われました");
        }
    }, 200);
};

// ==========================================
// ★ UI描画（バイト・連続受注・AI掛け合い・師匠立ち絵完全対応版！）
// ==========================================
window.openEncounterUI = function(masterType, message, mode = 'encounter', qData = null) {
    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    if (!hero) return;
    
    if (hero.apprentice && hero.apprentice.activeQuests) {
        let mainQ = hero.apprentice.activeQuests.find(q => q.masterType === masterType && !q.isBaitoQuest && q.rank === 9);
        if (mainQ) {
            const tempQData = typeof hero.getMasterQuestData === 'function' ? hero.getMasterQuestData(masterType, 9) : null;
            if (tempQData && tempQData.check && tempQData.check()) {
                mode = 'graduate';
            }
        }
    }

    currentEncounterMaster = masterType;
    currentEncounterMode = mode;
    if (message) savedEncounterMsg = message;
    
    const overlay = document.getElementById('encounterOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    
    let thoughtText = "（なんだかすごそうな人だ...！）";
    let rightText = savedEncounterMsg;
    let showTail = true;

    if (mode === 'encounter_intro') {
        thoughtText = "（だれ？ だれかいる...？）"; rightText = "（何者かの気配がする...）"; showTail = false; 
    }
    else if (mode === 'encounter') {
        let baseThought = ""; let score = 0; let missingStat = ""; let missingWord = false; let exactWord = "";
        const words = hero.apprentice.learnedWords || [];
        
        if (masterType === 'explore') { baseThought = "色んな場所を知ってそう...！"; exactWord = "探検"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += hero.stats.power; missingStat = "活力"; }
        else if (masterType === 'farming') { baseThought = "土のいい匂いがする...！"; exactWord = "農業"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += hero.stats.power; missingStat = "活力"; }
        else if (masterType === 'fishing') { baseThought = "大物が釣れそうなオーラ...！"; exactWord = "釣り"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += (hero.stats.intel + hero.stats.power) / 2; missingStat = "賢さや活力"; }
        else if (masterType === 'cooking') { baseThought = "すごくいい匂いがする...！"; exactWord = "料理"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += hero.stats.intel; missingStat = "賢さ"; }
        else if (masterType === 'smithing') { baseThought = "熱い...！火の扱いがすごそう！"; exactWord = "鍛冶"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += (hero.stats.power + hero.stats.intel) / 2; missingStat = "活力や賢さ"; }
        else if (masterType === 'building') { baseThought = "プロの職人さんの手だ...！"; exactWord = "建築"; if (words.includes(exactWord)) score += 30; else missingWord = true; score += hero.stats.intel; missingStat = "賢さ"; }
        
        score += (hero.stats.mood - 50) * 0.2; 
        
        let hint = "";
        const attempts = (hero.apprentice.attempts && hero.apprentice.attempts[masterType]) ? hero.apprentice.attempts[masterType] : 0;

        if (!missingWord && score >= 50) {
            hint = "今の僕なら、きっと認めてもらえるはず！";
        } else if (attempts >= 1) {
            if (missingWord) {
                hint = `でも、前回ダメだったのは言葉のせいだ！チャットで「${exactWord}」って教えてもらえれば…！`;
            } else {
                let shortAmt = Math.ceil(50 - score);
                hint = `でも、勉強や筋トレで『${missingStat}』をあと ${shortAmt > 0 ? shortAmt : '少し'} くらい上げれば絶対受かるはず…！`;
            }
        } else {
            if (score >= 35) { 
                if (missingWord) hint = "でも、もう少しこの人の『専門知識』を勉強しないと...。"; 
                else hint = `でも、もう少し『${missingStat}』を鍛えないと厳しいかも...。`; 
            } else { 
                if (missingWord) hint = `今のままじゃダメだ...『${missingStat}』と『専門知識』を身につけよう。`; 
                else hint = `今の『${missingStat}』じゃ、まだ相手にされないかも...。`; 
            }
        }
        thoughtText = `（${baseThought}\n${hint}）`;
    } 
    // ★大改修：AIの「翻訳機」を安全に起動する！
    else if (mode === 'quest_offer') { 
        thoughtText = (typeof window.getQuestThought === 'function') ? window.getQuestThought(qData) : "（新しい課題だ...！頑張ろう！）"; 
    }
    else if (mode === 'quest_not_clear') { 
        thoughtText = "（まだ条件を満たせていないみたい...！右のリストを確認しよう！）"; 
    }
    // ▼▼ 追加した2行 ▼▼
    else if (mode === 'rank_skip_offer') { thoughtText = "（すごい！ 基礎を飛ばして特別扱いだ！）"; }
    else if (mode === 'graduate_skip') { thoughtText = "（えっ！？ いきなり免許皆伝！？ やったー！）"; }
    // ▲▲ 追加した2行 ▲▲
    else if (mode === 'quest_offer_exam') { thoughtText = "（これが弟子入りのための課題...！まずは言葉を覚えよう！）"; rightText = savedEncounterMsg; }
    else if (mode === 'quest_report' || mode === 'rank_up') { thoughtText = "（うまくできたかな...？）"; }
    else if (mode === 'exam_pass') { thoughtText = "（やったー！弟子入りだ！）"; }
    else if (mode === 'exam_fail' || mode === 'retire' || mode === 'banned') { thoughtText = "（だめだったか...）"; }
    else if (mode === 'excommunicate') { thoughtText = "（怒らせてしまった...）"; }
    else if (mode === 'graduate') { thoughtText = "（ついにここまで来たんだ...！）"; }
    else if (mode === 'graduate_visit') { thoughtText = "（師匠！ いつもありがとうございます！）"; rightText = savedEncounterMsg; }

    document.getElementById('encounter-text').innerText = rightText;
    
    const textEl = document.getElementById('encounter-text');
    if (textEl && textEl.parentElement) {
        textEl.parentElement.style.width = '65%'; 
        textEl.parentElement.style.marginRight = 'auto'; 
        textEl.parentElement.style.maxHeight = 'none'; 
        textEl.parentElement.style.overflowY = 'visible';
    }

    let dialogBox = overlay.querySelector('div'); 
    if (dialogBox) {
        dialogBox.style.height = '520px'; 
    }

    const thoughtEl = document.getElementById('ai-thought-text');
    if (thoughtEl) thoughtEl.innerText = thoughtText;
    
    const tailEl = document.getElementById('encounter-tail');
    if (tailEl) {
        tailEl.style.display = showTail ? 'block' : 'none';
        if (showTail) {
            tailEl.style.position = 'absolute';
            tailEl.style.left = 'auto';
            tailEl.style.right = '-15px'; 
            tailEl.style.top = '30px'; 
            tailEl.style.transform = 'rotate(-90deg)'; 
        }
    }
    
    // ① 左側のキャンバス描画
    const canvas = document.getElementById('encounterCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
        let bgImgKey = 'field_bg'; let getCrop = (img) => { return {sx:0, sy:0, sw:img.width, sh:img.height}; };
        if (masterType === 'explore' || masterType === 'building') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: img.width/2, sy: img.height/2, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'farming') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: img.width/2, sy: 0, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'smithing') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: 0, sy: img.height/2, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'fishing') { bgImgKey = 'fishing_bg'; getCrop = (img) => { return { sx: 0, sy: 0, sw: img.width, sh: img.height/2 }; }; } 
        else if (masterType === 'cooking') { bgImgKey = 'room_bg'; getCrop = (img) => { return { sx: 0, sy: 0, sw: img.width/2, sh: img.height }; }; }

        const bgImg = typeof images !== 'undefined' ? images[bgImgKey] : null;
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            const crop = getCrop(bgImg); ctx.drawImage(bgImg, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
        } else { ctx.fillStyle = "#333"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

        let skin = hero.currentSkin || 'robot'; 
        if (typeof drawCharacterSprite === 'function') drawCharacterSprite(ctx, skin, canvas.width / 2, canvas.height / 2 + 20, 160, 160, false, 1.0);
    }

    // ② 右側のキャンバス描画
    if (overlay) {
        let oldDiv = document.getElementById('encounter-master-img');
        if (oldDiv && oldDiv.tagName !== 'CANVAS') oldDiv.remove();

        let masterCanvas = document.getElementById('encounter-master-canvas');
        if (!masterCanvas) {
            masterCanvas = document.createElement('canvas');
            masterCanvas.id = 'encounter-master-canvas';
            overlay.appendChild(masterCanvas);
        }
        masterCanvas.width = 400;  
        masterCanvas.height = 400;
        
        masterCanvas.style.cssText = `
            position: absolute; top: 50%; left: 50%;
            margin-top: -180px; margin-left: 140px; 
            width: 280px; height: 280px;
            pointer-events: none; z-index: 9999; 
            opacity: 0; transform: translateX(30px);
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        `;

        const masterSprites = {
            'farming':  { img: "farmer_battle_enemy.png", sx: 758, sy: 0, sw: 1248, sh: 1536 },
            'fishing':  { img: "fisherman_battle_enemy.png", sx: 839, sy: 0, sw: 1248, sh: 1536 },
            'building': { img: "builder_battle_enemy.png", sx: 839, sy: 0, sw: 1248, sh: 1536 },
            'smithing': { img: "smith_battle_enemy.png", sx: 794, sy: 0, sw: 1344, sh: 1536 },
            'cooking':  { img: "chef_battle_enemy.png", sx: 439, sy: 0, sw: 1766, sh: 1536 },
            'explore':  { img: "adventurer_battle_enemy.png", sx: 794, sy: 0, sw: 1344, sh: 1536 }
        };
        let mData = masterSprites[masterType];

        const mCtx = masterCanvas.getContext('2d');
        mCtx.clearRect(0, 0, masterCanvas.width, masterCanvas.height);

        if (mData) {
            let imgSrc = mData.img;
            if (imgSrc) {
                let tempImg = new Image();
                tempImg.onload = function() {
                    let targetHeight = 360; 
                    let scale = targetHeight / mData.sh;
                    let dw = mData.sw * scale;
                    let dh = mData.sh * scale;
                    let dx = (masterCanvas.width - dw) / 2;
                    let dy = masterCanvas.height - dh; 
                    
                    mCtx.save();
                    if (mode === 'encounter_intro') {
                        mCtx.filter = "brightness(0)";
                    }
                    mCtx.drawImage(tempImg, mData.sx, mData.sy, mData.sw, mData.sh, dx, dy, dw, dh);
                    mCtx.restore();

                    masterCanvas.style.opacity = '1';
                    masterCanvas.style.transform = 'translateX(0)';
                };
                tempImg.src = imgSrc; 
            } else { masterCanvas.style.opacity = '0'; }
        } else { masterCanvas.style.opacity = '0'; }
    }
    
    // ③ ボタンエリアの制御
    const btnBox = document.getElementById('encounter-buttons');
    if (btnBox) {
        btnBox.style.display = 'flex';
        btnBox.style.flexDirection = 'column';
        btnBox.style.gap = '8px';
        btnBox.style.width = '65%';

        let baitoBtn = "";
        let isMastered = hero.apprentice && ((hero.apprentice.retired && hero.apprentice.retired[masterType]) || (hero.apprentice.rank && hero.apprentice.rank[masterType] >= 10));
        
        const hideBaitoModes = [
            'excommunicate', 'retire', 'exam_fail', 'banned', 
            'graduate', 'rank_up', 'quest_report', 'exam_pass',
            'quest_offer', 'quest_offer_exam', 'encounter', 'encounter_intro'
        ];
        
        if (!hideBaitoModes.includes(mode)) {
            if ((hero.apprentice && hero.apprentice.currentMaster === masterType && !hero.apprentice.isExcommunicated) || isMastered) {
                let existingBaito = hero.apprentice.activeQuests && hero.apprentice.activeQuests.find(q => q.masterType === masterType && q.isBaitoQuest);
                if (existingBaito) {
                    baitoBtn = `<button class="quiz-btn" style="flex: 1; padding: 10px; font-size: 14px; background: #555; color: #888; font-weight: bold; border: 2px solid #444; border-radius: 8px; cursor: not-allowed;" disabled>💰 バイト中</button>`;
                } else {
                    baitoBtn = `<button class="quiz-btn" onclick="window.startBaito()" style="flex: 1; padding: 10px; font-size: 14px; background: #4CAF50; color: #fff; font-weight: bold; border: 2px solid #388E3C; border-radius: 8px; cursor: pointer;">💰 バイトする</button>`;
                }
            }
        }

        if (mode === 'encounter_intro') {
            btnBox.innerHTML = `<button class="quiz-btn" onclick="confirmEncounter(true)" style="padding: 12px; font-size: 16px; background: #2196F3; color: #fff; font-weight: bold; border: 2px solid #1976D2; border-radius: 8px; cursor: pointer;">辺りを見渡す ▶</button>`;
        }
        else if (mode === 'greeting') {
            thoughtText = "（言葉を教えて、またチャットで呼んで会いに行こう！）";
            btnBox.innerHTML = `<button class="quiz-btn" onclick="confirmEncounter(true)" style="padding: 12px; font-size: 16px; background: #FF9800; color: #fff; font-weight: bold; border: 2px solid #E65100; border-radius: 8px; cursor: pointer;">わかった！</button>`;
        }
        else if (mode === 'encounter' || mode === 'quest_offer' || mode === 'quest_offer_exam') {
            let yesText = mode === 'encounter' ? "試験を開始する" : "課題を受ける";
            let mainBtnHtml = "";
            let canTakeExam = true;

            if (mode === 'encounter') {
                let baseWord = "";
                if (masterType === 'explore') baseWord = "探検"; else if (masterType === 'farming') baseWord = "農業"; else if (masterType === 'fishing') baseWord = "釣り";
                else if (masterType === 'cooking') baseWord = "料理"; else if (masterType === 'smithing') baseWord = "鍛冶"; else if (masterType === 'building') baseWord = "建築";

                if (baseWord && hero.apprentice && hero.apprentice.learnedWords) {
                    if (!hero.apprentice.learnedWords.includes(baseWord)) {
                        canTakeExam = false; 
                    }
                }
            }

            if (mode === 'encounter' && !canTakeExam) {
                mainBtnHtml = `<button class="quiz-btn" style="padding: 12px; font-size: 16px; background: #555; color: #888; font-weight: bold; border: 2px solid #444; border-radius: 8px; cursor: not-allowed;" disabled>専門知識が必要...</button>`;
            } else {
                mainBtnHtml = `<button class="quiz-btn" onclick="confirmEncounter(true)" style="padding: 12px; font-size: 16px; background: linear-gradient(to bottom, #FFD700, #FF9800); color: #000; font-weight: bold; border: 2px solid #FFD700; border-radius: 8px; cursor: pointer;">${yesText}</button>`;
            }

            btnBox.innerHTML = `
                ${mainBtnHtml}
                <div style="display: flex; gap: 8px; width: 100%;">
                    ${baitoBtn}
                    <button class="quiz-btn" onclick="confirmEncounter(false)" style="flex: 1; padding: 10px; font-size: 14px; background: #666; color: #ddd; border: 2px solid #555; border-radius: 8px; cursor: pointer;">今はやめる</button>
                </div>
            `;
        }
        else if (mode === 'graduate_visit') {
            btnBox.innerHTML = `
                <div style="display: flex; gap: 8px; width: 100%;">
                    ${baitoBtn}
                    <button class="quiz-btn" onclick="confirmEncounter(false)" style="flex: 1; padding: 10px; font-size: 14px; background: #666; color: #ddd; border: 2px solid #555; border-radius: 8px; cursor: pointer;">また来るよ</button>
                </div>
            `;
        }
        else {
            let btnText = "わかった";
            let isReportEnd = false;
            
            if (mode === 'exam_pass') btnText = "よろしくお願いします！";
            // ▼▼ 追加した2行 ▼▼
            else if (mode === 'rank_skip_offer') { btnText = "よろしくお願いします！"; isReportEnd = true; } 
            else if (mode === 'graduate_skip') btnText = "ありがとうございます！";
            // ▲▲ 追加した2行 ▲▲
            else if (mode === 'exam_fail' || mode === 'retire' || mode === 'banned') btnText = "立ち去る";
            else if (mode === 'excommunicate') btnText = "はい……";
            else if (mode === 'graduate') btnText = "ありがとうございます！";
            else if (mode === 'quest_not_clear') btnText = "引き続き頑張ります";
            else if (mode === 'rank_up') { btnText = "報告完了"; isReportEnd = true; }
            else if (mode === 'quest_report') { btnText = "ありがとう！"; isReportEnd = false; }

            let nextQuestBtn = "";
            if (isReportEnd) {
                nextQuestBtn = `<button class="quiz-btn" onclick="window.requestNextQuest()" style="flex: 1; padding: 10px; font-size: 14px; background: #E91E63; color: #fff; font-weight: bold; border: 2px solid #C2185B; border-radius: 8px; cursor: pointer;">📋 次の課題へ</button>`;
            }

            let mainBtn = `<button class="quiz-btn" onclick="confirmEncounter(true)" style="flex: 1; padding: 10px; font-size: 14px; background: #2196F3; color: #fff; font-weight: bold; border: 2px solid #1976D2; border-radius: 8px; cursor: pointer;">${btnText}</button>`;

            btnBox.innerHTML = `
                <div style="display: flex; gap: 8px; width: 100%;">
                    ${mainBtn}
                    ${nextQuestBtn}
                </div>
                ${baitoBtn ? `<div style="display: flex; gap: 8px; width: 100%;">${baitoBtn.replace('flex: 1;', 'width: 100%;')}</div>` : ''}
            `;
        }
    }
    window.isGamePaused = true;
};

// ==========================================
// ★ クエスト・会話の処理（マルチクエスト＆完全対応版！）
// ==========================================
window.confirmEncounter = function(isAccept) {
    // ダイアログを閉じる際に立ち絵をスッと消去する
    const hideMasterImg = () => {
        let masterImgBox = document.getElementById('encounter-master-canvas');
        if (masterImgBox) {
            masterImgBox.style.opacity = '0';
            masterImgBox.style.transform = 'translateX(30px)';
        }
    };
    hideMasterImg();

    // ==========================================
    // ★ 修正：消えてしまっていた「顔見せ時の皆伝引継ぎチェック」を復活！
    // ==========================================
    if (currentEncounterMode === 'encounter_intro') {
        const mType = currentEncounterMaster;
        const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
        let isMastered = hero.apprentice && ((hero.apprentice.retired && hero.apprentice.retired[mType]) || (hero.apprentice.rank && hero.apprentice.rank[mType] >= 10));
        
        let greetingMsg = "";
        
        if (isMastered) {
            if (mType === 'explore') greetingMsg = "「あら！あなたはあの時の...いや、違う子ね。でもその身のこなし、既に免許皆伝の域じゃない！いつでも遊びにいらっしゃい！」";
            else if (mType === 'farming') greetingMsg = "「おや！君はあの時の...いや、違う子か。だがその構え、既に免許皆伝の域だね。いつでも遊びにおいで。」";
            else if (mType === 'fishing') greetingMsg = "「おお！お前さんはあの時の...いや、違うか。だがその構え、既に免許皆伝の域だな！いつでも遊びに来な！」";
            else if (mType === 'cooking') greetingMsg = "「おお！君はあの時の...いや、違うな！だがその構え、既に免許皆伝の域だ！いつでも飯を食いに来い！」";
            else if (mType === 'smithing') greetingMsg = "「……お前はあの時の……いや、違うか。だがその構え、既に免許皆伝の域。……いつでも火にあたりに来い。」";
            else if (mType === 'building') greetingMsg = "「おっ。君はあの時の...いや、違う子か。だがその構え、既に免許皆伝の域だな。いつでも見学に来てくれ。」";
        } else {
            if (mType === 'explore') greetingMsg = "「この周辺をキャンプ地にしようと思うの。準備ができたらまたいらっしゃい！」";
            else if (mType === 'farming') greetingMsg = "「この辺りに畑を作ろうと思ってね。準備ができたらまたおいで。」";
            else if (mType === 'fishing') greetingMsg = "「この辺りを釣り場にするぜ。準備ができたらまた来な！」";
            else if (mType === 'cooking') greetingMsg = "「この辺りで屋台を開くぞ！準備ができたらまた来な！」";
            else if (mType === 'smithing') greetingMsg = "「……この辺りに炉を構える。準備ができたら来い。」";
            else if (mType === 'building') greetingMsg = "「この辺りを拠点にする。準備ができたらまた来てくれ。」";
        }

        // 試験(encounter)ではなく、挨拶(greeting)へ進む！
        window.openEncounterUI(mType, greetingMsg, 'greeting');
        return; 
    }

    document.getElementById('encounterOverlay').classList.remove('active');
    window.isGamePaused = false;
    
    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    if (!hero) return;

    const mType = currentEncounterMaster;

    // ★ 初顔合わせ（挨拶）
    if (currentEncounterMode === 'greeting') {
        if (!hero.apprentice.metMasters) hero.apprentice.metMasters = [];
        if (!hero.apprentice.metMasters.includes(mType)) hero.apprentice.metMasters.push(mType);

        let tx = hero.x, ty = hero.y;
        for(let i = 0; i < 100; i++) {
            let cx = 50 + Math.random() * 700; let cy = 50 + Math.random() * 380;
            if (typeof hero.isWaterBetween === 'function' && !hero.isWaterBetween(hero.x, hero.y, cx, cy) && !hero.isPointOnWater(cx, cy)) {
                tx = cx; ty = cy; break;
            }
        }
        
        let campId = mType + '_master_camp_' + Date.now();
        let cType = 'tent'; let cName = '師匠のテント';
        let isMasterShop = false; 
        
        if (mType === 'smithing') { cType = 'blacksmith'; cName = '鍛冶師のキャンプ'; }
        else if (mType === 'building') { cType = 'palms'; cName = '建築士のテント'; }
        else if (mType === 'cooking') { 
            cType = null; 
            for (let k in assets) {
                if (assets[k].type === 'restaurant') {
                    assets[k].name = '料理人のレストラン';
                    assets[k].isMasterShop = true; 
                    break;
                }
            }
        }
        else if (mType === 'fishing') { cType = 'tent'; cName = '漁師の小屋'; }
        else if (mType === 'explore') { cType = 'tent'; cName = '冒険家のキャンプ'; }
        else if (mType === 'farming') { 
            cType = null; 
            for (let k in assets) {
                if (assets[k].type === 'farm') {
                    assets[k].name = '農家の畑';
                    assets[k].isMasterShop = true; 
                    break;
                }
            }
        }
        
        if (cType && typeof assets !== 'undefined') {
            assets[campId] = { type: cType, name: cName, dx: tx, dy: ty, sw: 100, sh: 100, scale: 0.6, isMasterShop: isMasterShop };
        }

        const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
        const mName = masterNames[mType];
        
        if (!hero.apprentice.learnedWords.includes(mName)) {
            hero.apprentice.learnedWords.push(mName);
            setTimeout(() => {
                hero.message = `「${mName}」という言葉を覚えた！\n（チャットで呼びかけて会いに行こう）`; hero.messageTimer = 180;
                if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 60, "言葉を学習した！", "#FF9800");
                if (typeof updateCommandHUD === 'function') updateCommandHUD();
            }, 1000); 
        }
        
        if (typeof saveGameData === 'function') saveGameData();
        currentEncounterMaster = null; currentEncounterMode = '';
        return;
    }

    if (currentEncounterMode === 'encounter') {
        if (isAccept) {
            hero.applyApprenticeship(mType);
            hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => !(q.masterType === mType && q.rank === 0));
            if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        }
        else { hero.message = "立ち去った..."; hero.messageTimer = 120; }
    } 
    // ★ 入門試験の準備
    else if (currentEncounterMode === 'quest_offer_exam') {
        if (isAccept) {
            if (!hero.apprentice.activeQuests) hero.apprentice.activeQuests = [];
            const qData = hero.getMasterQuestData(mType, 0);
            hero.apprentice.activeQuests.push({ name: qData.name, desc: qData.desc, rank: 0, masterType: mType, qVal: 0 });
            hero.message = "入門試験の課題を受けた！言葉を覚えよう！"; hero.messageTimer = 120;
            if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            if (typeof saveGameData === 'function') saveGameData(); 
        } else {
            hero.message = "今はやめておこう..."; hero.messageTimer = 120;
        }
    }
    // ★ 課題の受注（失われていたマルチクエスト登録処理！）
    else if (currentEncounterMode === 'quest_offer') {
        if (isAccept) {
            if (!hero.apprentice.activeQuests) hero.apprentice.activeQuests = [];
            const rank = hero.apprentice.rank[mType] || 1;
            const qData = hero.getMasterQuestData(mType, rank);
            qData.setup(); 
            
            // setupでセットされた目標値を activeQuests 配列にプッシュする
            let initialQVal = hero.apprentice.qVal !== undefined ? hero.apprentice.qVal : 0;
            hero.apprentice.activeQuests.push({ name: qData.name, desc: qData.desc, rank: rank, masterType: mType, qVal: initialQVal });
            hero.apprentice.questAcceptedAge = hero.age || 0;
            hero.apprentice.lazyReportCount = 0;

            hero.message = "課題を受けた！頑張ろう！"; hero.messageTimer = 120;
        } else {
            hero.message = "今はやめておこう..."; hero.messageTimer = 120;
        }
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData(); 
    }
    else if (currentEncounterMode === 'quest_not_clear') {
        hero.message = "引き続き課題を頑張ろう..."; hero.messageTimer = 120;
    }
    else if (currentEncounterMode === 'exam_pass') {
        hero.apprentice.currentMaster = mType;
        hero.apprentice.rank[mType] = 1; // 一旦必ずランク1にする（通常の弟子入り）
        hero.apprentice.activeQuest = null; 
        
        if (hero.apprentice.activeQuests) {
            hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => q.rank !== 0);
        }
        
        const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
        const mName = masterNames[mType];
        
        setTimeout(() => {
            hero.message = `やった！「${mName}」に弟子入りできたよ！`; 
            hero.messageTimer = 180;
            if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 60, "弟子入り成功！✨", "#FFD700");
            if (typeof updateCommandHUD === 'function') updateCommandHUD();
        }, 1000); 

        if (typeof saveGameData === 'function') saveGameData();
    }
    else if (currentEncounterMode === 'rank_up') {
        hero.apprentice.rank[mType] = (hero.apprentice.rank[mType] || 1) + 1;
        hero.apprentice.activeQuest = null; 
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData(); 
    }
    // ★追加：顔パス（ランクスキップ）を受諾した時の処理
    else if (currentEncounterMode === 'rank_skip_offer') {
        hero.apprentice.rank[mType] = hero.apprentice._pendingSkipRank || 1;
        delete hero.apprentice._pendingSkipRank;
        hero.apprentice.activeQuest = null; 
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData(); 
    }
    // ★追加：いきなり免許皆伝になった時の処理
    else if (currentEncounterMode === 'graduate' || currentEncounterMode === 'graduate_skip') {
        hero.apprentice.successCount = 0; hero.apprentice.rank[mType] = 10;
        hero.apprentice.isGraduated = true; hero.apprentice.currentMaster = null;
        hero.apprentice.activeQuest = null; 
        
        if (mType === 'farming') { hero.apprentice.title = "農業マスター"; hero.stats.power += 50; }
        else if (mType === 'cooking') { hero.apprentice.title = "三ツ星シェフ"; hero.skills.cooking = 20; hero.stats.intel += 50; }
        else if (mType === 'smithing') { hero.apprentice.title = "伝説の鍛冶屋"; hero.skills.smithing = 20; hero.stats.power += 25; hero.stats.intel += 25; }
        else if (mType === 'explore') { hero.apprentice.title = "大冒険家"; hero.stats.power += 50; hero.stats.mood += 50; hero.inventory.push('crystal'); }
        else if (mType === 'fishing') { hero.apprentice.title = "伝説の漁師"; hero.stats.power += 25; hero.stats.intel += 25; if(typeof itemCatalog !== 'undefined' && itemCatalog['rod_super']) hero.inventory.push('rod_super'); }
        else if (mType === 'building') { hero.apprentice.title = "一流建築士"; hero.skills.building = 20; hero.stats.power += 30; hero.stats.intel += 30; }

        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD(); 
        if (typeof saveGameData === 'function') saveGameData();

        if (typeof hero.determineLifePath === 'function') {
            const chosenPath = hero.determineLifePath();
            setTimeout(() => {
                if (typeof window.showLifePathEvent === 'function') window.showLifePathEvent(hero, chosenPath);
            }, 800);
        }
    }
    else if (currentEncounterMode === 'excommunicate') {
        hero.apprentice.isExcommunicated = true; 
        hero.apprentice.excommunicatedFrom = mType; 
        hero.apprentice.exileTrainingCount = 0; 
        hero.apprentice.currentMaster = null; 
        hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => q.masterType !== mType);
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        if (typeof saveGameData === 'function') saveGameData();
    }
    else if (currentEncounterMode === 'retire') {
        hero.apprentice.retired = hero.apprentice.retired || {};
        hero.apprentice.retired[mType] = true;
        if (mType === 'farming') { for (let k in assets) { if (assets[k].type === 'farm') { delete assets[k]; break; } } }
        if (typeof saveGameData === 'function') saveGameData();
    }
    currentEncounterMaster = null; currentEncounterMode = '';
};

// ★ AIが師匠の場所に到着した時に呼ばれる処理（クリーンアップ＆掛け合い対応の完全版！）
window.checkMasterVisit = function(masterType) {
    if (masterType) window._lastVisitedMaster = masterType;

    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    if (!hero || !hero.apprentice) return;

    // ★ 世代交代のクリーンアップ（先代の負の遺産を白紙にする）
    if (hero.apprentice.lastGenId !== hero.generation) {
        hero.apprentice.attempts = {};
        hero.apprentice.excommunicatedFrom = null;
        hero.apprentice.isExcommunicated = false;
        hero.apprentice.exileTrainingCount = 0;
        if (hero.apprentice.rank) {
            for (let m in hero.apprentice.rank) {
                if (hero.apprentice.rank[m] < 10) hero.apprentice.rank[m] = 0;
            }
        }
        hero.apprentice.retired = {};
        hero.apprentice.lastGenId = hero.generation;
    }
    
    const app = hero.apprentice;
    if (!app.activeQuests) app.activeQuests = [];

    // 自動修復パッチ
    if (app.attempts && app.attempts[masterType] >= 3 && app.retired && app.retired[masterType]) {
        delete app.retired[masterType];
    }
    
    let isApprentice = (app.currentMaster === masterType) || (app.retired && app.retired[masterType]) || (app.rank && app.rank[masterType] >= 10);
    let isBanned = (app.excommunicatedFrom === masterType) || (!isApprentice && app.attempts && app.attempts[masterType] >= 3);
    
    // 出禁判定
    if (isBanned) {
        let rejectMsg = "";
        if (masterType === 'explore') rejectMsg = (app.excommunicatedFrom === masterType) ? "「あなたに教えることはもう何もないわ。帰りなさい。」" : "「ごめんなさいね、君には見込みがないわ。他を当たってちょうだい。」";
        else if (masterType === 'farming') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もないよ。帰っておくれ。」" : "「君には見込みがないかな。他を当たっておくれ。」";
        else if (masterType === 'fishing') rejectMsg = (app.excommunicatedFrom === masterType) ? "「お前さんに教えることはもう何もないぜ。帰りな！」" : "「お前さんには見込みがないな。他を当たってくれや！」";
        else if (masterType === 'cooking') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もない！帰れ！」" : "「君には見込みがない！他を当たってくれ！」";
        else if (masterType === 'smithing') rejectMsg = (app.excommunicatedFrom === masterType) ? "「……お前に教えることはもう何もない。帰れ。」" : "「……君には見込みがない。他を当たれ。」";
        else if (masterType === 'building') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もない。帰ってくれ。」" : "「君には見込みがないな。他を当たってくれ。」";
        if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, rejectMsg, 'banned');
        return;
    }

    const myQuests = app.activeQuests.filter(q => q.masterType === masterType);

    if (!isApprentice && myQuests.length === 0) {
        let examMsg = "";
        let baseWord = "";
        if (masterType === 'explore') baseWord = "探検"; else if (masterType === 'farming') baseWord = "農業"; else if (masterType === 'fishing') baseWord = "釣り";
        else if (masterType === 'cooking') baseWord = "料理"; else if (masterType === 'smithing') baseWord = "鍛冶"; else if (masterType === 'building') baseWord = "建築";

        let words = app.learnedWords || [];
        if (!words.includes(baseWord)) {
            if (masterType === 'explore') examMsg = `「ごめんなさいね。まずは『${baseWord}』とは何か、その基本を知ってから来てちょうだい。」`;
            else if (masterType === 'farming') examMsg = `「おや、まずは『${baseWord}』の何たるかを知ってから来るといいよ。」`;
            else if (masterType === 'fishing') examMsg = `「坊主、まずは『${baseWord}』の何たるかを知ってから出直してきな！」`;
            else if (masterType === 'cooking') examMsg = `「ダメだな！まずは『${baseWord}』の何たるかを知ってから出直してこい！」`;
            else if (masterType === 'smithing') examMsg = `「……まずは『${baseWord}』の何たるかを知ってから来い。」`;
            else if (masterType === 'building') examMsg = `「悪いが、まずは『${baseWord}』の基本を知ってから来てくれ。」`;
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, examMsg, 'encounter');
        } else {
            let offerMsg = "";
            if (masterType === 'explore') offerMsg = `「私に弟子入りしたいのね？ よし、ではこの課題『入門試験の準備』をこなしてみせなさい！」`;
            else if (masterType === 'farming') offerMsg = `「私に弟子入りしたいのかい？ よし、ではこの課題『入門試験の準備』をこなしてみせなさい。」`;
            else if (masterType === 'fishing') offerMsg = `「俺に弟子入りしたいのか？ よし、ではこの課題『入門試験の準備』をこなしてみせな！」`;
            else if (masterType === 'cooking') offerMsg = `「私に弟子入りしたいのか！ よし、ではこの課題『入門試験の準備』をこなしてみせろ！」`;
            else if (masterType === 'smithing') offerMsg = `「……俺に弟子入りしたいのか。よし、ではこの課題『入門試験の準備』をこなしてみせろ。」`;
            else if (masterType === 'building') offerMsg = `「私に弟子入りしたいのか？ よし、ではこの課題『入門試験の準備』をこなしてみせよ。」`;
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, offerMsg, 'quest_offer_exam');
        }
        return;
    }

    if (myQuests.length > 0) {
        let clearedQuests = [];
        let notClearedRegularQuests = []; 
        let notClearedBaitoQuests = [];   
        let hasRankZero = false;

        myQuests.forEach(q => {
            if (q.rank === 0) {
                hasRankZero = true; 
            } else if (q.isBaitoQuest) {
                if (q.qVal >= q.targetCount) clearedQuests.push(q);
                else notClearedBaitoQuests.push(q);
            } else {
                const qData = hero.getMasterQuestData(masterType, q.rank);
                app.qVal = q.qVal;
                if (qData.check()) clearedQuests.push(q);
                else notClearedRegularQuests.push(q);
            }
        });

        // 1. 入門試験本番
        if (hasRankZero) {
            let examMsg = "";
            if (masterType === 'explore') examMsg = `「言葉は覚えてきた？ 準備ができたなら、いざ試験開始よ！」`;
            else if (masterType === 'farming') examMsg = `「言葉は覚えてきたかい？ 準備ができたなら、試験を始めようか。」`;
            else if (masterType === 'fishing') examMsg = `「言葉は覚えてきたか？ 準備ができたなら、試験開始だぜ！」`;
            else if (masterType === 'cooking') examMsg = `「言葉は覚えてきたか！ 準備ができたなら、試験開始だ！」`;
            else if (masterType === 'smithing') examMsg = `「……言葉は覚えてきたな。準備ができたなら、試験を始めるぞ。」`;
            else if (masterType === 'building') examMsg = `「言葉は覚えてきたな？ 準備ができたなら、試験開始だ。」`;
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, examMsg, 'encounter');
            return;
        }

        // 2. 達成済みクエストの報告
        if (clearedQuests.length > 0) {
            let totalGold = 0;
            let reportMsg = "";
            let isExamCleared = false;
            let examRank = 1;

            clearedQuests.forEach(q => {
                if (q.isBaitoQuest) {
                    let gold = 50; 
                    totalGold += gold;
                    if (masterType === 'explore') reportMsg += `「手伝いありがとう！報酬の ${gold}G よ。またいつでも手伝いに来てね！」\n`;
                    else if (masterType === 'farming') reportMsg += `「手伝い助かったよ。これは報酬の ${gold}G だ。またいつでもおいで。」\n`;
                    else if (masterType === 'fishing') reportMsg += `「いやぁ、助かったぜ！報酬の ${gold}G だ！ハッハッハ、また頼むな！」\n`;
                    else if (masterType === 'cooking') reportMsg += `「いい手際だったな！報酬の ${gold}G だ！腹が減ったらまたうちの厨房を手伝いに来な！」\n`;
                    else if (masterType === 'smithing') reportMsg += `「……悪くない腕だ。報酬の ${gold}G だ。……また火にあたりに来い。」\n`;
                    else if (masterType === 'building') reportMsg += `「良い仕事だった。報酬の ${gold}G だ。……また現場が忙しい時は頼むぞ。」\n`;
                } else {
                    isExamCleared = true;
                    examRank = q.rank;
                    const qData = hero.getMasterQuestData(masterType, q.rank);
                    if (typeof qData.onClear === 'function') qData.onClear(); 
                }
                app.activeQuests = app.activeQuests.filter(activeQ => activeQ !== q);
            });

            if (totalGold > 0) {
                hero.gold += totalGold;
                if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 40, `+${totalGold} G`, "#FFD700");
                if (typeof updateStatUI === 'function') updateStatUI();
            }

            if (isExamCleared) {
                if (examRank >= 9) {
                    if (masterType === 'explore') reportMsg += "「見事よ！あなたに教えることはもう何もないわ...免許皆伝ね！」";
                    else if (masterType === 'farming') reportMsg += "「見事だ！君に教えることはもう何もない...免許皆伝だよ！」";
                    else if (masterType === 'fishing') reportMsg += "「見事だ！お前さんに教えることはもう何もないぜ...免許皆伝だ！」";
                    else if (masterType === 'cooking') reportMsg += "「見事だ！君に教えることはもう何もない！免許皆伝だ！」";
                    else if (masterType === 'smithing') reportMsg += "「……見事だ。お前に教えることはもう何もない。免許皆伝だ。」";
                    else if (masterType === 'building') reportMsg += "「見事だな！君に教えることはもう何もない...免許皆伝だ！」";
                    if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'graduate');
                } else {
                    if (masterType === 'explore') reportMsg += `「よし、課題クリアね！あなたのランクが ${examRank + 1} に上がったわよ！」`;
                    else if (masterType === 'farming') reportMsg += `「よし、課題クリアだね！君のランクが ${examRank + 1} に上がったよ！」`;
                    else if (masterType === 'fishing') reportMsg += `「よし、課題クリアだ！お前さんのランクが ${examRank + 1} に上がったぜ！」`;
                    else if (masterType === 'cooking') reportMsg += `「よし、課題クリアだ！君のランクが ${examRank + 1} に上がったぞ！」`;
                    else if (masterType === 'smithing') reportMsg += `「……よし、課題クリアだ。お前のランクが ${examRank + 1} に上がったぞ。」`;
                    else if (masterType === 'building') reportMsg += `「よし、課題クリアだな！君のランクが ${examRank + 1} に上がったぞ！」`;
                    if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'rank_up');
                }
            } else {
                if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'quest_report');
            }
            app.questAcceptedAge = hero.age || 0;
            return;
        }

        // 3. 未達成の課題がある場合
        if (notClearedRegularQuests.length > 0) {
            let yearsPassed = (hero.age || 0) - (app.questAcceptedAge || 0);
            let isNeglected = yearsPassed >= 2;
            
            // ★ ここでカウントを増やし、3回以上なら isLazy を true にする！
            app.lazyReportCount = (app.lazyReportCount || 0) + 1;
            let isLazy = app.lazyReportCount >= 3;

            // ★ 放置(isNeglected) または 冷やかし(isLazy) のどちらかを満たしたら破門！
            if (isNeglected || isLazy) {
                let reason = "";
                if (masterType === 'explore') reason = isNeglected ? "「何年待たせる気！？あなたのように不真面目な者に教えることは何もないわ！破門よ！」" : "「何度も冷やかしにきて！あなたのように不真面目な者に教えることは何もないわ！破門よ！」";
                else if (masterType === 'farming') reason = isNeglected ? "「何年待たせるんだい。君のように不真面目な者に教えることは何もないよ。破門だ。」" : "「何度も冷やかしおって。君のように不真面目な者に教えることは何もないよ。破門だ。」";
                else if (masterType === 'fishing') reason = isNeglected ? "「何年待たせる気だ！お前さんのように不真面目な者に教えることは何もないぜ！破門だ！」" : "「何度も冷やかしおって！お前さんのように不真面目な者に教えることは何もないぜ！破門だ！」";
                else if (masterType === 'cooking') reason = isNeglected ? "「何年待たせる気だ！君のように不真面目な者に教えることは何もない！破門だ！」" : "「何度も冷やかしおって！君のように不真面目な者に教えることは何もない！破門だ！」";
                else if (masterType === 'smithing') reason = "「……何年待たせる気だ。貴様のように不真面目な者に教えることは何もない。破門だ。」"; // (鍛冶屋はどちらも同じセリフ)
                else if (masterType === 'building') reason = isNeglected ? "「何年待たせる気だ！君のように不真面目な者に教えることは何もないぞ！破門だ！」" : "「何度も冷やかしおって！君のように不真面目な者に教えることは何もないぞ！破門だ！」";
                
                if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reason, 'excommunicate');
                return;
            }
            
            // 破門条件を満たしていなければ、通常の「未達成（5/3回のようなバグにならない）」メッセージを出す
            let flavor = (typeof window.masterFlavor !== 'undefined' && window.masterFlavor[masterType]) ? window.masterFlavor[masterType] : { report_ng: "「まだまだ修行が足りないようだな！」" };
            let notClearMsg = flavor.report_ng + `\n（未達成報告：${app.lazyReportCount} / 3回）`;
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, notClearMsg, 'quest_not_clear', null);
            return;
        }
    }

    // 免許皆伝後の訪問
    let isMastered = (app.retired && app.retired[masterType]) || (app.rank && app.rank[masterType] >= 10);
    if (isMastered) {
        let msg = "";
        if (masterType === 'explore') msg = "「よく来たわね！ もう教えることはないけれど、手伝いならいつでも歓迎よ！」";
        else if (masterType === 'farming') msg = "「おお、よく来てくれたね！ もう教えることはないが、手伝いならいつでも大歓迎だよ！」";
        else if (masterType === 'fishing') msg = "「おう！ よく来たな！ お前さんに教えることはもうねえが、手伝いならいつでも歓迎だぜ！」";
        else if (masterType === 'cooking') msg = "「おお、よく来たな！ もう教えることはないが、手伝いならいつでも歓迎するぞ！」";
        else if (masterType === 'smithing') msg = "「……よく来たな。もう教えることはないが、手伝いなら歓迎するぞ。」";
        else if (masterType === 'building') msg = "「おお、よく来たな！ もう教えることはないが、手伝いならいつでも歓迎だぞ！」";
        if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, msg, 'graduate_visit');
        return;
    }

    // 4. 新規課題の提示
    const rank = app.rank[masterType] || 1;

    // ==========================================
    // ★ 究極のNG+対応：一番最初（ランク1）の時だけステータスを査定し「顔パス」発動！
    // ==========================================
    if (rank === 1) {
        let p = hero.stats.power || 10; let i = hero.stats.intel || 10;
        let b = hero.stats.beauty || 10; let s = hero.stats.speed || 10;

        const rankReqs = {
            'explore': { 10: {p:105, s:55, i:30, b:20}, 9: {p:55, s:55, i:30, b:20}, 8: {p:55, s:55, i:30, b:20}, 7: {p:55, s:25, i:30, b:20}, 6: {p:55, s:25, i:30}, 5: {p:25, s:25, i:30}, 4: {p:25, s:25}, 3: {p:25, s:25}, 2: {p:25} },
            'farming': { 10: {p:105, b:55, i:25}, 9: {p:55, b:55, i:25}, 8: {p:55, b:55, i:25}, 7: {p:55, b:55, i:25}, 6: {p:55, b:25, i:25}, 5: {p:25, b:25, i:25}, 4: {p:25, b:25}, 3: {p:25}, 2: {p:25} },
            'fishing': { 10: {p:105, s:55, b:20}, 9: {p:55, s:55, b:20}, 8: {p:55, s:55, b:20}, 7: {p:55, s:25, b:20}, 6: {p:55, s:25}, 5: {p:25, s:25}, 4: {p:25, s:25}, 3: {p:25}, 2: {p:25} },
            'cooking': { 10: {i:105, b:55}, 9: {i:55, b:55}, 8: {i:55, b:55}, 7: {i:55, b:25}, 6: {i:55, b:25}, 5: {i:25, b:25}, 4: {i:25, b:25}, 3: {i:25}, 2: {i:25} },
            'smithing': { 10: {p:105, i:55, b:20}, 9: {p:55, i:55, b:20}, 8: {p:55, i:55, b:20}, 7: {p:55, i:25, b:20}, 6: {p:55, i:25}, 5: {p:25, i:25}, 4: {p:25, i:25}, 3: {p:25}, 2: {p:25} },
            'building': { 10: {i:105, p:55, b:25}, 9: {i:55, p:55, b:25}, 8: {i:55, p:55, b:25}, 7: {i:55, p:25, b:25}, 6: {i:55, p:25}, 5: {i:25, p:25}, 4: {i:25, p:25}, 3: {i:25}, 2: {i:25} }
        };

        let skipRank = 1;
        const reqMap = rankReqs[masterType];
        if (reqMap) {
            for (let r = 10; r >= 2; r--) {
                let req = reqMap[r];
                let isMeet = true;
                if (req.p && p < req.p) isMeet = false;
                if (req.i && i < req.i) isMeet = false;
                if (req.b && b < req.b) isMeet = false;
                if (req.s && s < req.s) isMeet = false;
                if (isMeet) { skipRank = r; break; }
            }
        }

        // 現在のランクより上位の条件を満たしていたら、顔パスイベント発動！
        if (skipRank > rank) {
            if (skipRank === 10) {
                let msg = `「さあ、最初の課題を出そうかと思ったが……なんという才能だ！\nお前に教えることは最初から無かったようだな。特別に『免許皆伝』を授けよう！！」`;
                if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, msg, 'graduate_skip');
                return;
            } else {
                hero.apprentice._pendingSkipRank = skipRank;
                let msg = `「最初の課題を出そうと思ったが……君、凄まじいオーラを持っているな！\n退屈な基礎は免除だ、特別に【ランク${skipRank}】から修練を始めよう！」`;
                if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, msg, 'rank_skip_offer');
                return;
            }
        }
    }

    // 通常の課題提示
    const qData = hero.getMasterQuestData(masterType, rank);
    let flavor = (typeof window.masterFlavor !== 'undefined' && window.masterFlavor[masterType]) ? window.masterFlavor[masterType] : { offer: (name) => `「新たなる課題『${name}』を命ずる！」` };
    let offerMsg = flavor.offer(qData.name);
    
    if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, offerMsg, 'quest_offer', qData);
};

// ==========================================
// ★ マルチ対応＆アコーディオン型 クエストHUD更新（インフレ対応・差分表示版）
// ==========================================
window.updateQuestHUD = function() {
    const hud = document.getElementById('questHUD');
    const list = document.getElementById('questListHUD');
    if (!hud || !list) return;

    hud.style.pointerEvents = 'auto';
    list.style.pointerEvents = 'auto';

    if (hud.matches(':hover')) return;

    const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
    if (hero && hero.apprentice && !hero.apprentice.activeQuests) hero.apprentice.activeQuests = [];

    // ★修正：ネタバレ防止！「書き写し」という正解ワードを隠しつつ、バイトのヒントに合わせる
    if (hero && hero.apprentice && hero.apprentice.activeQuests) {
        hero.apprentice.activeQuests.forEach(q => {
            if (q.masterType === 'building') {
                if (q.desc.includes('建築（製図）')) {
                    q.desc = q.desc.replace(/「建築（製図）」/g, '「図面の複製の手伝い」');
                    q.desc = q.desc.replace(/建築（製図）/g, '図面の複製の手伝い');
                }
                if (q.desc.includes('練習用の図面') && q.desc.includes('落書きを避け')) {
                    q.desc = '手伝いで図面の複製をこなし、成功した「練習用の図面」を3つ持ってこよう。';
                }
                
                // ★追加：「精巧な建築模型」もバイトの手伝いで稀にできることをヒントとして出す！
                if (q.desc.includes('精巧な建築模型') && q.desc.includes('大成功でのみ作れる')) {
                    q.desc = '手伝い中に稀に完成する、大成功の「精巧な建築模型」を3つ持ってこよう。';
                }
                // （※もし古いデータが残っていた場合の保険）
                if (q.desc.includes('3つもらってこよう。')) {
                    q.desc = q.desc.replace('3つもらってこよう。', '3つ持ってこよう。');
                }
            }
        });
    }

    // 自動修復パッチ：すでにランク1以上に達している師匠の「入門試験（ランク0）」が残っていれば消去する
    if (hero && hero.apprentice && hero.apprentice.activeQuests) {
        hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => {
            if (q.rank === 0 && hero.apprentice.rank && hero.apprentice.rank[q.masterType] >= 1) return false;
            return true;
        });
    }

    if (!hero || !hero.apprentice || hero.apprentice.activeQuests.length === 0 || hero.isHelper) {
        hud.style.display = 'none';
        return;
    }

    const currentScrollTop = list.scrollTop;
    const openStates = {};
    Array.from(list.children).forEach(child => {
        const titleEl = child.querySelector('.quest-title');
        const contentEl = child.querySelector('.quest-content');
        if (titleEl && contentEl) {
            openStates[titleEl.innerText] = contentEl.style.display;
        }
    });

    let newHtml = ""; 
    let anyCleared = false;

    hero.apprentice.activeQuests.forEach((q, index) => {
        const mType = q.masterType;
        const qData = hero.getMasterQuestData(mType, q.rank);
        
        hero.apprentice.qVal = q.qVal;
        
        let isCleared = false;
        if (q.rank === 0) isCleared = false;
        else if (q.isBaitoQuest) isCleared = q.qVal >= q.targetCount;
        else isCleared = (qData && qData.check ? qData.check() : false);
        
        if (isCleared) anyCleared = true;

        let progressStr = "";
        if (q.rank === 0) {
            progressStr = `<div style="font-size: 11px; color: #FF9800; margin-top: 4px;">準備ができたら『話を聞いてみる』を押そう</div>`;
        } else if (isCleared) {
            progressStr = `<div style="font-size: 11px; color: #4CAF50; font-weight: bold; margin-top: 4px;">✅ 条件達成！報告しよう</div>`;
        } else {
            const desc = q.desc;
            let isStatQuest = false; let statVal = 0;
            
            if (desc.includes("賢さ") || desc.includes("知性")) { isStatQuest = true; statVal = hero.stats.intel; }
            else if (desc.includes("活力") || desc.includes("パワー") || desc.includes("体力")) { isStatQuest = true; statVal = hero.stats.power; }
            else if (desc.includes("美しさ")) { isStatQuest = true; statVal = hero.stats.beauty; }
            else if (desc.includes("素早さ")) { isStatQuest = true; statVal = hero.stats.speed; }

            if (isStatQuest) {
                // ★修正：大数値のフォーマット丸め(150.0Kなど)を回避するため、上昇量の差分のみを表示する！
                let match = desc.match(/[＋\+](\d+)/); // 説明文から「＋〇〇」の数字を抽出
                if (match) {
                    let reqIncrease = parseInt(match[1], 10);
                    let startVal = q.qVal - reqIncrease; // qValは目標の絶対値なので、そこから上昇量を引けば開始値になる
                    let currentIncrease = Math.max(0, Math.floor(statVal - startVal));
                    if (currentIncrease > reqIncrease) currentIncrease = reqIncrease; // 上限突破防止
                    progressStr = `<div style="font-size: 11px; color: #FF9800; margin-top: 4px;">上昇量: +${currentIncrease} / +${reqIncrease}</div>`;
                } else {
                    let currentVal = window.formatLargeNumber(statVal);
                    let targetVal = window.formatLargeNumber(q.qVal);
                    progressStr = `<div style="font-size: 11px; color: #FF9800; margin-top: 4px;">現在の能力: ${currentVal} / 目標: ${targetVal}</div>`;
                }
            // ★HUD用：ステータス画面と同じ「名詞（アイテム名）」で判定する最強のロジック！
            } else {
                let isItemQuest = true;
                let itemsStr = [];
                const inv = hero.inventory || [];
                
                // ★新規追加：上限でストップし、達成した項目だけ緑色にする専用関数
                const formatReq = (name, current, req) => {
                    if (current >= req) return `${name}: <span style="color:#4CAF50; font-weight:bold;">${req} / ${req}(達成)</span>`;
                    return `${name}: ${current} / ${req}`;
                };
                
                if (desc.includes("良質な木材")) itemsStr.push(formatReq("良質な木材", inv.filter(i => i === 'high_wood').length, 3));
                else if (desc.includes("木材")) itemsStr.push(formatReq("木材", inv.filter(i => i === 'wood').length, desc.includes("10個") ? 10 : (desc.includes("5つ") ? 5 : 3)));
                
                if (desc.includes("硬い石")) itemsStr.push(formatReq("硬い石", inv.filter(i => i === 'high_stone').length, 3));
                else if (desc.includes("石")) itemsStr.push(formatReq("石", inv.filter(i => i === 'stone').length, desc.includes("10個") ? 10 : (desc.includes("5つ") ? 5 : 3)));
                
                if (desc.includes("練習用装備")) itemsStr.push(formatReq("練習用装備", inv.filter(i => typeof i === 'string' && i.includes('_practice_')).length, 3));
                if (desc.includes("鉄くず")) itemsStr.push(formatReq("鉄くず", inv.filter(i => i === 'scrap_metal').length, 3));
                if (desc.includes("芸術品")) itemsStr.push(formatReq("芸術品", inv.filter(i => typeof i === 'string' && i.includes('_art_')).length, 3));
                if (desc.includes("ヌシ")) itemsStr.push(formatReq("ヌシ", inv.filter(i => i === 'fish_boss_river' || i === 'fish_boss_sea').length, 1));
                else if (desc.includes("魚")) itemsStr.push(formatReq("魚", inv.filter(i => typeof i === 'string' && i.startsWith('fish_')).length, desc.includes("3匹") ? 3 : 1));
                if (desc.includes("質のいい")) itemsStr.push(formatReq("上質野菜", inv.filter(i => typeof i === 'string' && i.startsWith('high_')).length, 3));
                if (desc.includes("普通の試作料理")) itemsStr.push(formatReq("試作料理", inv.filter(i => i === 'food_practice_normal').length, 3));
                if (desc.includes("究極の試作料理")) itemsStr.push(formatReq("究極料理", inv.filter(i => i === 'food_practice_great').length, 3));
                if (desc.includes("練習用の図面")) itemsStr.push(formatReq("練習図面", inv.filter(i => i === 'build_practice_normal').length, 3));
                if (desc.includes("建築模型")) itemsStr.push(formatReq("建築模型", inv.filter(i => i === 'build_practice_great').length, 3));

                if (itemsStr.length === 0) isItemQuest = false;
                if (q.isBaitoQuest) isItemQuest = false; // バイトの場合は強制的に除外

                if (isItemQuest) {
                    progressStr = `<div style="font-size: 11px; color: #FF9800; margin-top: 4px;">収集: ${itemsStr.join(' <span style="color:#aaa;">,</span> ')}</div>`;
                } else if (q.qVal >= 0) {
                    let reqCount = q.targetCount;
                    if (!q.isBaitoQuest) {
                        let match = desc.match(/(\d+)[回匹個つ]/);
                        if (match) reqCount = match[1];
                        else if (qData && qData.targetCount) reqCount = qData.targetCount;
                    }
                    reqCount = reqCount || "?";
                    
                    let unit = "回";
                    if (!q.isBaitoQuest) {
                        if (desc.includes("匹")) unit = "匹";
                        else if (desc.includes("個")) unit = "個";
                    }
                    
                    progressStr = `<div style="font-size: 11px; color: #FF9800; margin-top: 4px;">進捗: ${Math.floor(q.qVal)} / ${reqCount} ${unit}完了</div>`;
                }
            }
        }
        
        let qTitle = `📜 ${q.name}`;
        let initialDisplay = openStates[qTitle] !== undefined 
            ? openStates[qTitle] 
            : (hero.apprentice.activeQuests.length > 2 ? 'none' : 'block');
        
        newHtml += `
            <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: ${index < hero.apprentice.activeQuests.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer;" onclick="const el = this.nextElementSibling; el.style.display = el.style.display === 'none' ? 'block' : 'none'; const icon = this.querySelector('.acc-icon'); icon.innerText = el.style.display === 'none' ? '▼' : '▲';">
                    <div style="flex: 1;">
                        <div class="quest-title" style="font-size: 12px; font-weight: bold; color: ${isCleared ? '#4CAF50' : '#FFC107'};">${qTitle}</div>
                        ${progressStr}
                    </div>
                    <div class="acc-icon" style="font-size: 10px; color: #aaa; padding: 4px;">${initialDisplay === 'none' ? '▼' : '▲'}</div>
                </div>
                <div class="quest-content" style="display: ${initialDisplay}; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #444;">
                    <div style="font-size: 11px; color: #ccc; line-height: 1.4;">${q.desc}</div>
                    <div style="font-size: 10px; color: #ffeb3b; margin-top: 4px; text-align: right;">※進行中...</div>
                </div>
            </div>
        `;
    });

    hud.style.display = 'block';
    list.style.maxHeight = '250px';
    list.style.overflowY = 'auto';
    list.style.paddingRight = '5px';
    
    list.innerHTML = newHtml;
    list.scrollTop = currentScrollTop;

    if (anyCleared) {
        hud.style.border = "2px solid #4CAF50";
        hud.style.boxShadow = "0 0 15px rgba(76, 175, 80, 0.4)";
    } else {
        hud.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        hud.style.boxShadow = "none";
    }
};

// ==========================================
// ★ 音声認識システム (ひらがな忘却対応版)
// ==========================================
window.startVoiceRecognition = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("お使いのブラウザは音声認識に対応していません。Chrome等の最新ブラウザをご利用ください。");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP'; 
    recognition.interimResults = false; 
    recognition.maxAlternatives = 1;

    const btnVoice = document.getElementById('btnVoice');
    const chatInput = document.getElementById('chatInput');

    recognition.onstart = function() {
        btnVoice.style.background = '#f44336'; 
        btnVoice.innerText = '🔴 認識中...';
        chatInput.placeholder = "AIに話しかけてください...";
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript; 
        window.sendChat(); // 自動送信
    };

    recognition.onend = function() {
        btnVoice.style.background = '#2196F3'; 
        btnVoice.innerText = '🎙️';
        chatInput.placeholder = "チャット...";
    };

    recognition.onerror = function(event) {
        console.warn("音声認識エラー:", event.error);
        if (event.error === 'not-allowed') {
            alert("マイクの使用が許可されていません。ブラウザの設定を確認してください。");
        }
    };

    recognition.start();
};

// ==========================================
// ★ パーティシステムUI（操作切り替え＆助っ人テスト）
// ==========================================
function initPartyUI() {
    const uiContainer = document.createElement('div');
    uiContainer.id = 'party-ui-container';
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.display = 'flex';
    uiContainer.style.gap = '10px';
    uiContainer.style.zIndex = '100';

    // ==========================================
    // ★ ここに1行追加：最初は「最強の隠しクラス」をつけて透明にしておく！
    uiContainer.classList.add('hidden-feature');
    
    const addBtn = document.createElement('button');
    addBtn.innerText = '🍻 酒場へ行く'; // ★名前をカッコよく変更
    addBtn.style.padding = '5px 10px';
    addBtn.style.background = '#FF9800';
    addBtn.style.color = 'black';
    addBtn.style.border = '2px solid #fff';
    addBtn.style.borderRadius = '20px';
    addBtn.style.fontWeight = 'bold';
    addBtn.style.cursor = 'pointer';
    // ★ここからクリック時の処理を上書き
    addBtn.onclick = () => {
        if(party.length >= 3) { alert("パーティは3人までです！（現在のメンバーを解雇する機能は後ほど実装します）"); return; }
        switchRightPanel('tavern'); // 酒場パネルを開く！
    };
    // ★ここから追加：ランキングボタン
    const rankBtn = document.createElement('button');
    rankBtn.innerText = '🏆 ランキング';
    rankBtn.style.padding = '5px 10px';
    rankBtn.style.background = '#FFD700';
    rankBtn.style.color = 'black';
    rankBtn.style.border = '2px solid #fff';
    rankBtn.style.borderRadius = '20px';
    rankBtn.style.fontWeight = 'bold';
    rankBtn.style.cursor = 'pointer';
    rankBtn.onclick = () => { window.switchRankingCategory('status'); };
    // ★ここまで追加

    const canvasWrap = document.getElementById('canvas-wrapper');
    if(canvasWrap) {
        canvasWrap.appendChild(uiContainer);
        uiContainer.appendChild(addBtn);
        uiContainer.appendChild(rankBtn); // ★これも忘れずに追加！
    }
}

window.updatePartyUI = function() {
    if(typeof party === 'undefined' || party.length === 0) return;
    const container = document.getElementById('party-ui-container');
    if(!container) return;
    
    document.querySelectorAll('.party-icon').forEach(el => el.remove());
    
    party.forEach((pet, index) => {
        const icon = document.createElement('div');
        icon.className = 'party-icon';
        icon.style.width = '40px';
        icon.style.height = '40px';
        icon.style.borderRadius = '50%';
        icon.style.background = (index === window.activePartyIndex) ? '#4CAF50' : '#444';
        icon.style.border = (index === window.activePartyIndex) ? '3px solid #FFF' : '2px solid #888';
        icon.style.cursor = 'pointer';
        icon.style.display = 'flex';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        icon.style.fontSize = '20px';
        icon.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
        icon.innerText = (index === 0) ? '👑' : '🤝'; 
        
        icon.onclick = () => {
            window.activePartyIndex = index;
            window.aiPet = party[index];
            
            if (typeof aiPet !== 'undefined') {
                aiPet = party[index];
            }
            
            updateStatUI();        
            updateCommandHUD();    
            updateScheduleList();  
            window.updatePartyUI();
        };
        
        container.insertBefore(icon, container.lastChild);
    });
};

setTimeout(() => { initPartyUI(); window.updatePartyUI(); }, 1500);

// ==========================================
// ★ クラウド酒場（リスト表示と雇用処理）
// ==========================================
window.currentCloudAIs = []; // 取得したリストを一時保存する配列

window.openTavernPanel = async function() {
    const list = document.getElementById('tavernList');
    if(!list) return;
    list.innerHTML = "<div style='color:white; text-align:center; padding: 20px;'>☁️ クラウドから助っ人を探しています...</div>";
    
    const cloudAIs = await window.fetchCloudAIs();
    window.currentCloudAIs = cloudAIs; // グローバルに保存
    list.innerHTML = "";
    
    if(!cloudAIs || cloudAIs.length === 0) {
        list.innerHTML = "<div style='color:#aaa; font-size:12px; text-align:center;'>現在、酒場には誰もいないようです...<br>※別ウィンドウで30秒ほど待ってから見てください。</div>";
        return;
    }
    
    cloudAIs.forEach((data, index) => {
        const div = document.createElement('div');
        div.className = 'panel-list-item';
        div.style.border = "1px solid #FF9800";
        div.style.backgroundColor = "#2a2a2a";
        
        let titleStr = data.title ? `<span style="color:#FFD700; font-weight:bold;">[${data.title}]</span> ` : "";
        let skinName = (typeof monsterBookData !== 'undefined' && monsterBookData[data.skin]) ? monsterBookData[data.skin].name : data.skin;
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <div style="font-size:14px; font-weight:bold; color:white;">${titleStr}${skinName}</div>
            </div>
            <div style="font-size:11px; color:#ccc; display:grid; grid-template-columns: 1fr 1fr; gap:4px; margin-bottom:8px;">
                <div>💪 活力: ${Math.floor(data.stats.power || 0)}</div>
                <div>🧠 賢さ: ${Math.floor(data.stats.intel || 0)}</div>
                <div>✨ 美しさ: ${Math.floor(data.stats.beauty || 0)}</div>
                <div>💬 語彙: ${(data.learnedWords || []).length} 語</div>
            </div>
            <button class="quiz-btn" style="width:100%; height:25px; font-size:12px; background:#FF9800; color:black;" onclick='hireCloudAI(${index})'>このAIを雇う</button>
        `;
        list.appendChild(div);
    });
};

window.hireCloudAI = function(index) {
    if(party.length >= 3) { alert("パーティは満員です！"); return; }
    const targetData = window.currentCloudAIs[index];
    if(!targetData) return;
    
    let helper = new AICharacter({
        isHelper: true, 
        x: window.aiPet.x + (Math.random()*100 - 50),
        y: window.aiPet.y + 50,
        currentSkin: targetData.skin, 
        energy: 100, hunger: 100,
        stats: targetData.stats,
        skills: targetData.skills || { cooking: 1, smithing: 1, building: 1 },
        apprentice: { 
            learnedWords: targetData.learnedWords || [], 
            title: targetData.title || "",
            rank: {}, attempts: {} 
        },
        schedule: [], inventory: [] 
    });
    
    party.push(helper);
    window.updatePartyUI();
    switchRightPanel('default'); // 雇ったらパネルを閉じる
    
    let tName = targetData.title ? `[${targetData.title}]` : "";
    alert(`酒場で ${tName}「${targetData.skin}」を雇いました！`);
};

// ==========================================
// ★ 総合ランキングシステム制御
// ==========================================
window.switchRankingCategory = function(category) {
    document.getElementById('dungeon-ranking-ui').classList.add('active');

    const detailArea = document.getElementById('ranking-detail-area');
    if (detailArea) detailArea.style.display = 'none';

    const tabStatus = document.getElementById('main-tab-status');
    const tabDungeon = document.getElementById('main-tab-dungeon');
    const tabArena = document.getElementById('main-tab-arena'); 
    const tabDefense = document.getElementById('main-tab-defense'); // ★追加：防衛タブ

    const subStatus = document.getElementById('sub-tabs-status');
    const subDungeon = document.getElementById('sub-tabs-dungeon');
    const subArena = document.getElementById('sub-tabs-arena'); 
    const subDefense = document.getElementById('sub-tabs-defense'); // ★追加：防衛サブタブ

    // すべてのサブタブを確実に隠す
    if (subStatus) subStatus.style.display = 'none';
    if (subDungeon) subDungeon.style.display = 'none';
    if (subArena) subArena.style.display = 'none';
    if (subDefense) subDefense.style.display = 'none';

    // メインタブの色を一旦リセット
    [tabStatus, tabDungeon, tabArena, tabDefense].forEach(tab => {
        if(tab) {
            tab.style.background = '#222';
            tab.style.color = '#aaa';
            tab.style.borderBottom = '3px solid transparent';
        }
    });

    if (category === 'status') {
        if (tabStatus) { tabStatus.style.background = '#333'; tabStatus.style.color = '#FFF'; tabStatus.style.borderBottom = '3px solid #FFD700'; }
        if (subStatus) subStatus.style.display = 'flex';
        window.openRankingPanel('power'); 

    } else if (category === 'dungeon') {
        if (tabDungeon) { tabDungeon.style.background = '#333'; tabDungeon.style.color = '#FFF'; tabDungeon.style.borderBottom = '3px solid #00BCD4'; }
        if (subDungeon) subDungeon.style.display = 'flex';
        window.renderDungeonRankingList('skull'); 

    } else if (category === 'arena') {
        if (tabArena) { tabArena.style.background = '#333'; tabArena.style.color = '#FFF'; tabArena.style.borderBottom = '3px solid #FF9800'; }
        if (subArena) subArena.style.display = 'flex';
        if (typeof window.renderArenaRankingList === 'function') window.renderArenaRankingList('normal');

    } else if (category === 'defense') {
        // ★追加：防衛戦タブが押されたときの処理
        if (tabDefense) { tabDefense.style.background = '#333'; tabDefense.style.color = '#FFF'; tabDefense.style.borderBottom = '3px solid #4CAF50'; }
        if (subDefense) subDefense.style.display = 'flex';
        if (typeof window.renderDefenseRankingList === 'function') window.renderDefenseRankingList('normal');
    }
};

window.openRankingPanel = async function(sortKey = 'power') {
    // ★修正：ステータスタブを「選択中以外は中抜き（アウトライン）」にする処理
    const subStatus = document.getElementById('sub-tabs-status');
    if (subStatus) {
        const btns = subStatus.children;
        const configs = [
            { key: 'power', color: '#F44336' }, // 活力(赤)
            { key: 'intel', color: '#2196F3' }, // 賢さ(青)
            { key: 'beauty', color: '#9C27B0' }, // 美しさ(紫)
            { key: 'words', color: '#4CAF50' }  // 語彙(緑)
        ];
        for (let i = 0; i < Math.min(btns.length, configs.length); i++) {
            let btn = btns[i];
            let conf = configs[i];
            if (sortKey === conf.key) {
                btn.style.background = conf.color;
                btn.style.color = '#FFF';
                btn.style.border = 'none';
            } else {
                btn.style.background = '#222';
                btn.style.color = conf.color;
                btn.style.border = `1px solid ${conf.color}`;
            }
            btn.style.boxSizing = 'border-box';
        }
    }

    const list = document.getElementById('ranking-list-container');
    if(!list) return;
    list.innerHTML = "<div style='color:#aaa; text-align:center; padding: 50px; font-size:18px;'>📡 クラウドから集計中...</div>";

    let cloudAIs = window.currentCloudAIs || [];
    if (cloudAIs.length === 0 && typeof window.fetchCloudAIs === 'function') {
        cloudAIs = await window.fetchCloudAIs();
        window.currentCloudAIs = cloudAIs;
    }

    const myPet = window.aiPet || {};
    let myData = {
        isMe: true, 
        playerName: localStorage.getItem('my_player_name') || "あなた",
        skin: myPet.currentSkin || 'robot',
        title: (myPet.apprentice && myPet.apprentice.title) ? myPet.apprentice.title : "",
        stats: myPet.stats || {power:0, intel:0, beauty:0},
        learnedWords: (myPet.apprentice && myPet.apprentice.learnedWords) ? myPet.apprentice.learnedWords : []
    };
    
    let allCandidates = [...cloudAIs, myData];

    allCandidates.sort((a, b) => {
        if (sortKey === 'words') {
            const aLen = a.learnedWords ? a.learnedWords.length : 0;
            const bLen = b.learnedWords ? b.learnedWords.length : 0;
            return bLen - aLen; 
        } else {
            const aVal = a.stats[sortKey] || 0;
            const bVal = b.stats[sortKey] || 0;
            return bVal - aVal; 
        }
    });

    list.innerHTML = "";
    allCandidates.forEach((data, index) => {
        const div = document.createElement('div');
        div.style.cssText = `
            background: ${data.isMe ? 'rgba(76, 175, 80, 0.15)' : '#222'}; 
            border: 2px solid ${data.isMe ? '#4CAF50' : '#444'}; 
            border-radius: 8px; padding: 15px; margin-bottom: 12px; 
            display: flex; align-items: center; justify-content: space-between;
        `;
        
        let rankIcon = `<span style="color:#888; font-size:20px; font-weight:bold;">${index + 1}位</span>`;
        if (index === 0) rankIcon = "<span style='color:#FFD700; font-size:24px; font-weight:bold; text-shadow:0 0 5px #FFD700;'>🥇 1位</span>";
        if (index === 1) rankIcon = "<span style='color:#C0C0C0; font-size:22px; font-weight:bold;'>🥈 2位</span>";
        if (index === 2) rankIcon = "<span style='color:#CD7F32; font-size:20px; font-weight:bold;'>🥉 3位</span>";

        let titleStr = data.title ? `<span style="color:#FF9800; font-size:14px; margin-right:5px;">[${data.title}]</span>` : "";
        let petNameStr = (typeof monsterBookData !== 'undefined' && monsterBookData[data.skin] ? monsterBookData[data.skin].name : data.skin);
        let pName = data.playerName || "名無しプレイヤー";
        if (data.isMe) pName = `✨ ${pName} (あなた)`;

        let scoreStr = "";
        let scoreColor = "#FFF";
        if (sortKey === 'words') { scoreStr = `${data.learnedWords ? data.learnedWords.length : 0} 語`; scoreColor = "#4CAF50"; }
        else if (sortKey === 'power') { scoreStr = `${Math.floor(data.stats[sortKey] || 0)} pt`; scoreColor = "#ff5252"; }
        else if (sortKey === 'intel') { scoreStr = `${Math.floor(data.stats[sortKey] || 0)} pt`; scoreColor = "#4fc3f7"; }
        else if (sortKey === 'beauty') { scoreStr = `${Math.floor(data.stats[sortKey] || 0)} pt`; scoreColor = "#e040fb"; }

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:20px;">
                <div style="width:80px; text-align:center;">${rankIcon}</div>
                <div>
                    <div style="font-size:14px; color:#aaa; margin-bottom:4px;">👤 ${pName}</div>
                    <div style="font-size:20px; font-weight:bold; color:#FFF;">${titleStr}${petNameStr}</div>
                </div>
            </div>
            <div style="font-size:28px; font-weight:bold; color:${scoreColor}; text-shadow:0 2px 4px rgba(0,0,0,0.5);">
                ${scoreStr}
            </div>
        `;
        list.appendChild(div);
    });
};

// ==========================================
// ★修正：TCGメニューに「世界のプレイヤーと対戦」ボタンを追加
// ==========================================
window.showTCGMenu = function() {
    let menu = document.getElementById('tcg-main-menu');
    
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'tcg-main-menu';
        menu.style.cssText = `
            position: fixed; bottom: 80px; right: 20px;
            background: rgba(20,20,20,0.95); border: 2px solid #FF9800;
            border-radius: 12px; padding: 20px; width: 260px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 9000;
            display: flex; flex-direction: column; gap: 15px;
        `;
        
        menu.innerHTML = `
            <div style="color:#FFD700; font-weight:bold; font-size:20px; text-align:center; border-bottom:1px solid #555; padding-bottom:10px;">
                🃏 TCGメニュー
            </div>
            
            <button onclick="document.getElementById('tcg-main-menu').style.display='none'; openDeckBuilder();" 
                style="padding:12px; background:#2196F3; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px;">
                🗃️ コレクション / 編成
            </button>
            
            <button onclick="document.getElementById('tcg-main-menu').style.display='none'; openOnlineMatchLobby();" 
                style="padding:12px; background:#E91E63; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px; box-shadow: 0 0 10px rgba(233,30,99,0.8);">
                🌐 世界のプレイヤーと対戦
            </button>

            <button onclick="document.getElementById('tcg-main-menu').style.display='none'; startBattle();" 
                style="padding:12px; background:#4CAF50; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px;">
                ⚔️ 名もなきCPUと練習
            </button>
            
            <button onclick="document.getElementById('tcg-main-menu').style.display='none'; uploadMyDeck();" 
                style="padding:12px; background:#9C27B0; color:#fff; border:2px solid #fff; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px;">
                ☁️ デッキをオンライン登録
            </button>
            
            <button onclick="document.getElementById('tcg-main-menu').style.display='none';" 
                style="padding:10px; background:#555; color:#fff; border:none; border-radius:8px; cursor:pointer; margin-top:5px;">
                閉じる ✖
            </button>
        `;
        document.body.appendChild(menu);
    } else {
        menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
    }
};

// ==========================================
// ★新規：オンライン対戦ロビーを開く機能
// ==========================================
window.openOnlineMatchLobby = async function() {
    if (typeof window.fetchOnlineDecks !== 'function') {
        alert("クラウド通信の準備ができていません。"); return;
    }

    let lobby = document.getElementById('tcg-online-lobby');
    if (!lobby) {
        lobby = document.createElement('div');
        lobby.id = 'tcg-online-lobby';
        lobby.style.cssText = `
            position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
            width: 400px; max-height: 80%; background: rgba(20,20,20,0.95);
            border: 2px solid #E91E63; border-radius: 12px; padding: 20px;
            color: white; z-index: 10000; overflow-y: auto; box-shadow: 0 0 30px rgba(233, 30, 99, 0.5);
        `;
        document.body.appendChild(lobby);
    }

    lobby.innerHTML = `<div style="text-align:center; font-size:18px; font-weight:bold; color:#E91E63; margin-bottom:15px;">🌐 通信中... 対戦相手を探しています...</div>`;
    lobby.style.display = 'block';

    const decks = await window.fetchOnlineDecks();

    if (decks.length === 0) {
        lobby.innerHTML = `
            <div style="text-align:center; font-size:18px; font-weight:bold; color:#FF9800; margin-bottom:15px;">見つかりませんでした...</div>
            <div style="text-align:center; margin-bottom:15px; line-height:1.5;">自分以外のプレイヤーがまだデッキを登録していないようです。<br>（※テスト時は別のブラウザで登録すると現れます！）</div>
            <button onclick="document.getElementById('tcg-online-lobby').style.display='none';" style="width:100%; padding:10px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer;">閉じる</button>
        `;
        return;
    }

    let html = `<div style="text-align:center; font-size:20px; font-weight:bold; color:#E91E63; margin-bottom:15px; border-bottom:1px solid #E91E63; padding-bottom:10px;">🌐 ゴーストバトル ロビー</div>`;

    // 取得したデッキデータをグローバルに一時保存
    window.TCG_ONLINE_OPPONENTS = [];

    decks.forEach((d, index) => {
        const date = new Date(d.updatedAt).toLocaleString();
        window.TCG_ONLINE_OPPONENTS[index] = d;

        html += `
            <div style="background:#333; border:1px solid #555; padding:10px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:bold; font-size:18px; color:#4fc3f7;">${d.playerName}</div>
                    <div style="font-size:12px; color:#aaa;">更新: ${date}</div>
                </div>
                <button onclick="document.getElementById('tcg-online-lobby').style.display='none'; startBattle(window.TCG_ONLINE_OPPONENTS[${index}]);"
                    style="padding:10px 15px; background:#E91E63; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:transform 0.1s;"
                    onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ⚔️ 挑戦！
                </button>
            </div>
        `;
    });

    html += `<button onclick="document.getElementById('tcg-online-lobby').style.display='none';" style="width:100%; padding:10px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer; margin-top:10px;">閉じる</button>`;
    lobby.innerHTML = html;
};

// ==========================================
// ★修正：Firebaseに自分のデッキをアップロードする機能（Firestore対応版）
// ==========================================
window.uploadMyDeck = async function() {
    // 1. デッキが60枚あるかチェック
    if (!window.TCG.decks[0] || window.TCG.decks[0].length !== 60) {
        alert("デッキが60枚ありません！先に「編成」からデッキを保存してください。");
        return;
    }

    // 2. 育成ボーナスを含んだ「実体のカードデータ」を60枚分抽出する
    const deckData = window.TCG.decks[0].map(uid => {
        const card = window.TCG.myCollection.find(c => c.uid === uid);
        if (!card) return null;
        return {
            masterId: card.masterId, // カードの種類
            hp: card.hp,             // 育成ボーナス込みのHP
            damage: card.damage,     // 育成ボーナス込みの攻撃力
            name: card.name          // 表示名
        };
    }).filter(c => c !== null);

    if (deckData.length !== 60) {
        alert("デッキデータに異常があります。もう一度編成を保存し直してください。");
        return;
    }

    // 3. プレイヤー固有のIDを取得（酒場と同じIDを共有して使います）
    let myId = localStorage.getItem('my_player_id');
    if (!myId) {
        myId = 'player_' + Date.now() + Math.floor(Math.random() * 1000);
        localStorage.setItem('my_player_id', myId);
    }

    // 4. Firestoreに送るデータの塊（ペイロード）を作成
    const uploadData = {
        playerId: myId,
        playerName: (window.aiPet && window.aiPet.name) ? window.aiPet.name : "名無しのAI",
        skin: (window.aiPet && window.aiPet.currentSkin) ? window.aiPet.currentSkin : "robot",
        updatedAt: Date.now(),
        deck: deckData
    };

    // 5. cloud_manager.js の非同期関数を呼び出して保存！
    if (typeof window.uploadMyDeckToCloud === 'function') {
        const success = await window.uploadMyDeckToCloud(myId, uploadData);
        if (success) {
            alert("🌐 デッキをオンラインに登録しました！\nこれで世界中のプレイヤーが、あなたのデッキと戦えるようになります！");
        } else {
            alert("通信エラーが発生しました。コンソールを確認してください。");
        }
    } else {
        alert("クラウド通信の準備ができていません。ページをリロードして再度お試しください。");
    }
};

// ==========================================
// ★究極修正：チュートリアルの「順番待ち（キュー）」システム
// ==========================================
window.tutorialQueue = window.tutorialQueue || [];
window.isTutorialPlaying = false;
window.tutQueueTimer = null;

// 既存のチュートリアル関数を「順番待ち対応版」に上書き！
window.showGameTutorial = function(title, message, callback) {
    // リクエストをキュー（待ち行列）に追加
    window.tutorialQueue.push({title, message, callback});
    window.processTutorialQueue();
};

window.processTutorialQueue = function() {
    // 既に何かのチュートリアルが再生中、またはキューが空なら何もしない
    if (window.isTutorialPlaying || window.tutorialQueue.length === 0) return;
    
    // 画面が他のポップアップやイベントで塞がっていないかチェック
    const cardPopup = document.getElementById('tcg-unlock-popup');
    const encOverlay = document.getElementById('encounterOverlay');
    
    const isCardPopupOpen = cardPopup && cardPopup.style.pointerEvents === 'auto';
    const isEncounterOpen = encOverlay && encOverlay.classList.contains('active');
    
    if (isCardPopupOpen || isEncounterOpen) {
        // 画面が塞がっている場合は、1秒後に再確認する（空気を読んで待機！）
        clearTimeout(window.tutQueueTimer);
        window.tutQueueTimer = setTimeout(window.processTutorialQueue, 1000);
        return;
    }

    // 画面が完全に空いたので、チュートリアルを再生開始！
    window.isTutorialPlaying = true;
    const tut = window.tutorialQueue.shift();

    const tutBox = document.createElement('div');
    tutBox.id = 'in-game-tutorial';
    tutBox.style.cssText = `
        position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(20, 20, 20, 0.95); border: 2px solid #FF9800;
        border-radius: 12px; padding: 25px; color: #fff; width: 320px;
        text-align: center; box-shadow: 0 0 40px rgba(255, 152, 0, 0.8);
        z-index: 100000; opacity: 0; transition: all 0.5s ease;
    `;
    tutBox.innerHTML = `
        <div style="color: #FF9800; font-size: 20px; font-weight: bold; margin-bottom: 15px;">${tut.title}</div>
        <div style="font-size: 15px; line-height: 1.6; margin-bottom: 25px; color: #ddd; text-align: left;">
            ${tut.message}
        </div>
        <button id="tut-close-btn" style="background: #FF9800; color: #fff; border: 2px solid #fff; padding: 12px 35px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            わかった！
        </button>
    `;
    document.body.appendChild(tutBox);
    
    setTimeout(() => { tutBox.style.opacity = '1'; }, 50);

    // 「わかった！」を押した時の処理
    document.getElementById('tut-close-btn').onclick = () => {
        tutBox.style.opacity = '0';
        tutBox.style.transform = 'translate(-50%, -60%)'; // 少し上にフワッと消える演出
        setTimeout(() => {
            if (tutBox.parentNode) tutBox.parentNode.removeChild(tutBox);
            
            if (tut.callback) tut.callback(); // ★ チュートリアル完了時の処理（ボタン出現など）を実行！
            
            window.isTutorialPlaying = false;
            // 次のチュートリアルが待っていれば0.5秒後に呼び出す
            clearTimeout(window.tutQueueTimer);
            window.tutQueueTimer = setTimeout(window.processTutorialQueue, 500); 
        }, 500);
    };
};

// ==========================================
// ★変更：カード初獲得時のチュートリアル（順番待ちシステム連携版）
// ==========================================
let tcgUnlockCheck = setInterval(() => {
    // コレクションに1枚でもカードが入ったら
    if (typeof window.TCG !== 'undefined' && window.TCG.myCollection && window.TCG.myCollection.length > 0) {
        
        // チュートリアル履歴をチェック（v2に変更したため、コマンド不要で強制的にテストできます！）
        if (!localStorage.getItem('tcg_tutorial_done_v2')) {
            localStorage.setItem('tcg_tutorial_done_v2', 'true');
            
            // 順番待ちシステムにカードゲームのチュートリアルを登録！
            window.showGameTutorial(
                "機能解放：カードゲーム 🃏", 
                "冒険や日々の生活の中で、AIの記憶が<span style='color:#FF9800; font-weight:bold;'>「カード」</span>として形に残るようになりました！<br><br>画面右下のボタンから、集めたカードを眺めたり、デッキを組んでバトルして遊びましょう！",
                () => {
                    // ★ チュートリアルを「わかった！」で閉じた瞬間に、右下にボタンを出現させる！
                    // window.initTCGMenu();
                }
            );
        } else {
            // 既にチュートリアル済みなら、即座にボタンを表示
            if (!document.getElementById('tcg-launcher-btn')) {
                // window.initTCGMenu();
            }
        }
        
        // 監視ループを終了
        clearInterval(tcgUnlockCheck);
    }
}, 1000);

// ==========================================
// ★ 新機能：AIの余生決断イベント表示
// ==========================================
window.showLifePathEvent = function(hero, path) {
    let title = "";
    let message = "";
    
    if (path === 'mentor') {
        title = "【新たな夢：後進の育成】";
        message = "「今まで育ててくれてありがとう。<br>あなたに優しく教えてもらったように、僕もこれからは<span style='color:#FF9800;'>『誰かを導ける存在』</span>になりたいんだ！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『師匠』に固定されました)</span>";
    } 
    else if (path === 'monument') {
        title = "【新たな夢：生きた証を残す】";
        message = "「今まで鍛えてくれてありがとう。<br>僕はこの世界に、僕の生きた証として<span style='color:#FFD700;'>『最高のモニュメント』</span>を残すよ。見ててね！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『モニュメント建造』に固定されました)</span>";
    }
    else if (path === 'seeker') {
        title = "【新たな夢：終わりのない修練】";
        message = "「免許皆伝？……いや、この道に終わりはない。<br>僕は命尽きるまで、限界のその先へ<span style='color:#ff5252;'>『己を磨き続ける』</span>！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『求道者（スパルタ）』に固定されました)</span>";
    }
    else if (path === 'guardian') {
        title = "【新たな夢：村の守護者】";
        message = "「今まで育ててくれてありがとう。<br>僕のこの力は、この村を豊かにするために使うべきだ。<span style='color:#4CAF50;'>『村の守護者』</span>として生きるよ！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『守護者（自動パトロール）』に固定されました)</span>";
    }
    else if (path === 'author') {
        title = "【新たな夢：後世への執筆】";
        message = "「今まで色んなことを学ばせてくれてありがとう。<br>僕の知識と技術を、次の世代のために<span style='color:#2196F3;'>『一冊の秘伝書』</span>として残すよ！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『秘伝書執筆』に固定されました)</span>";
    }
    else { // slowlife
        title = "【新たな夢：悠々自適なスローライフ】";
        message = "「厳しい修行もこれで終わりだね！<br>これからは難しいことはやめて、あなたと一緒に<span style='color:#8BC34A;'>『のんびりスローライフ』</span>を楽しむよ！」<br><br><span style='font-size:12px; color:#aaa;'>(※今後の行動方針が『スローライフ』に固定されました)</span>";
    }

    // 既存のチュートリアルUIを流用してリッチに表示！
    if (typeof window.showGameTutorial === 'function') {
        window.showGameTutorial(`✨ ${title} ✨`, message, () => {
            hero.message = "これからもよろしくね！";
            hero.messageTimer = 180;
            // ★追加：AIに「余生の目標」をセットし、自動行動を解禁する
            hero.lifePath = path;
            hero.legacyProgress = {}; // 進捗を0%にリセット
            if (hero.schedule) hero.schedule = []; // 今の予定を全てキャンセルして余生に集中
            
            // ★追加：ダイアログの裏で動いていた行動を確実にリセットし、姿勢を初期化する！
            hero.actionState = 'idle';
            hero.visualAction = null;
            hero.isIndoors = false;
            hero.indoorTarget = null;
            hero.idleTimer = 0;
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            if (typeof updateAIStatusText === 'function') updateAIStatusText();
        });
    }
};

// ==========================================
// ★ 建築設計図（レシピ）UIの描画処理（素材判定付き完全版）
// ==========================================
window.openBuildRecipe = function() {
    window.renderBuildRecipe();
    const overlay = document.getElementById('buildRecipeOverlay');
    if (overlay) overlay.classList.add('active');
};

// ==========================================
// ★ 建築設計図（レシピ）UIの描画処理（条件フラグ対応版）
// ==========================================
window.renderBuildRecipe = function() {
    const listEl = document.getElementById('buildRecipeList');
    if (!listEl) return;
    if (typeof buildingCatalog === 'undefined') return;

    let ai = window.aiPet;
    
    let isMaster = ai.apprentice && (
        (ai.apprentice.retired && ai.apprentice.retired['building']) ||
        (ai.apprentice.currentMaster === 'building' && ai.apprentice.isGraduated) ||
        (ai.apprentice.rank && ai.apprentice.rank['building'] >= 10)
    );

    if (!isMaster) {
        listEl.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#aaa;">
                <div style="font-size:40px; margin-bottom:15px;">🔒</div>
                <div style="font-size:16px; font-weight:bold; color:#FFF; margin-bottom:10px;">設計図は未解放です</div>
                <div style="font-size:13px; line-height:1.5;">建築士の<span style="color:#FFD700; font-weight:bold;">「免許皆伝」</span>になると<br>全ての施設の設計図（必要素材）が確認できるようになります。</div>
            </div>
        `;
        return;
    }

    let myItems = {};
    if (ai.inventory) {
        // ★修正：アイテムが文字列でもオブジェクトでも正しくIDを取り出してカウントする
        ai.inventory.forEach(item => {
            let id = typeof item === 'string' ? item : item.id;
            myItems[id] = (myItems[id] || 0) + 1;
        });
    }

    let html = `<div style="font-size:16px; font-weight:bold; color:#FFD700; margin-bottom:15px; padding:10px; background:rgba(255,215,0,0.1); border-radius:6px; text-align:center; border:2px solid #FFD700; text-shadow:0 0 5px rgba(255,215,0,0.5);">✨ 建築士 免許皆伝 ✨</div>`;

    for (let bId in buildingCatalog) {
        const bData = buildingCatalog[bId];

        // ★追加：特別な解放フラグがある施設は、フラグを満たしていなければ表示すらしない
        if (bData.reqFlag && !ai[bData.reqFlag]) continue;

        let hasMaterials = true;
        let matHtml = "";

        if (bData.materials && Object.keys(bData.materials).length > 0) {
            for (let mKey in bData.materials) {
                let reqCount = bData.materials[mKey];
                let myCount = myItems[mKey] || 0;
                let mName = (typeof itemCatalog !== 'undefined' && itemCatalog[mKey]) ? itemCatalog[mKey].name : mKey;
                
                let isEnough = myCount >= reqCount;
                if (!isEnough) hasMaterials = false;
                
                let color = isEnough ? "#4CAF50" : "#ff5252";
                let bgColor = isEnough ? "rgba(76,175,80,0.1)" : "rgba(255,82,82,0.1)";
                
                matHtml += `<span style="display:inline-block; background:${bgColor}; border:1px solid ${color}; border-radius:4px; padding:4px 8px; margin:0 4px 4px 0; font-size:12px; color:${color}; font-weight:bold;">
                    ${mName} : ${myCount} / ${reqCount}
                </span>`;
            }
        } else {
            matHtml = `<span style="color:#888; font-size:12px;">素材不要</span>`;
        }

        let statusBadge = hasMaterials 
            ? `<span style="background:#4CAF50; color:#FFF; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.3);">✅ 建築可能！</span>`
            : `<span style="background:#ff5252; color:#FFF; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;">❌ 素材不足</span>`;

        let borderColor = hasMaterials ? '#4CAF50' : '#555';
        
        html += `
            <div style="background:#222; border:2px solid ${borderColor}; border-radius:8px; padding:15px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="font-size:18px; font-weight:bold; color:${hasMaterials ? '#4CAF50' : '#ccc'};">${bData.name}</div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${statusBadge}
                    </div>
                </div>
                <div>${matHtml}</div>
            </div>
        `;
    }
    listEl.innerHTML = html;
};

// ★追加：カジノに入ったときにフラグを立てるパッチ
if (typeof window.openCasino === 'function' && !window._casinoHookedForCardShop) {
    const _baseOpenCasino = window.openCasino;
    window.openCasino = function() {
        if (window.aiPet) {
            window.aiPet.visitedCasino = true; // 来店フラグ付与
            if (typeof saveGameData === 'function') saveGameData();
        }
        _baseOpenCasino();
    };
    window._casinoHookedForCardShop = true;
}

// ==========================================
// 📄 ui_controller.js
// ★【フェーズ1】ハウジング＆経営UIシステム
// ==========================================

// アセット画像をコード側で読み込む
const imgRestAsset = new Image(); imgRestAsset.src = 'restaurant_asset.png'; // image_1.png
const imgSmithAsset = new Image(); imgSmithAsset.src = 'smith_asset.png'; // image_2.png

// ==========================================
// 🎨 ハウジングシステム（Canvas描画）
// 白背景を透過させて、定位置に重ねる関数
// ==========================================
function drawAssetWithWhiteTransparency(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!img.complete) return; // 画像が読み込まれていない場合は描画しない

    // 1. 一旦、別のCanvasにアセットを切り抜いて描画する
    const tempCanvas = document.createElement('canvas'); tempCanvas.width = sw; tempCanvas.height = sh;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    // 2. そのCanvasのピクセルデータを取得し、白いピクセルを透過させる
    const imageData = tempCtx.getImageData(0, 0, sw, sh);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i + 1], b = data[i + 2];
        // ほぼ白（R,G,Bがすべて240以上）なら透過させる
        if (r > 240 && g > 240 && b > 240) { data[i + 3] = 0; }
    }
    tempCtx.putImageData(imageData, 0, 0);

    // 3. 透過処理が完了したアセットを、メインCanvas（屋内）に描画する
    ctx.drawImage(tempCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
}

// レストランの内装描画
window.renderRestaurantInterior = function(ctx, building) {
    if (!building || !building.shopData) return;
    const s = building.shopData;

    // --- 定位置アセット配置 (内装レベルに応じて追加・ランクアップ) ---

    // 1. カウンター (レベル1〜)
    // ソース矩形はアセット画像（image_1.png）から切り抜く
    drawAssetWithWhiteTransparency(ctx, imgRestAsset, 0, 0, 300, 200, 50, 100, 300, 200);

    // 2. テーブル＆椅子 (レベル1〜)
    drawAssetWithWhiteTransparency(ctx, imgRestAsset, 300, 0, 200, 200, 400, 200, 200, 200);

    // 3. キッチンオーブン (レベル2〜)
    if (s.interiorLevel >= 2) {
        drawAssetWithWhiteTransparency(ctx, imgRestAsset, 500, 0, 100, 150, 500, 80, 100, 150);
    }

    // 4. 高級なバーテーブル (レベル3〜)
    if (s.interiorLevel >= 3) {
        drawAssetWithWhiteTransparency(ctx, imgRestAsset, 600, 0, 200, 200, 200, 300, 200, 200);
    }
};

// 鍛冶屋の内装描画
window.renderSmithInterior = function(ctx, building) {
    if (!building || !building.shopData) return;
    const s = building.shopData;

    // 1. 金床とハンマー (レベル1〜)
    drawAssetWithWhiteTransparency(ctx, imgSmithAsset, 0, 0, 200, 200, 100, 200, 200, 200);

    // 2. 武器棚 (レベル1〜)
    drawAssetWithWhiteTransparency(ctx, imgSmithAsset, 200, 0, 300, 200, 450, 150, 300, 200);

    // 3. 巨大な炉 (レベル2〜)
    if (s.interiorLevel >= 2) {
        drawAssetWithWhiteTransparency(ctx, imgSmithAsset, 500, 0, 200, 200, 300, 80, 200, 200);
    }
};


// ==========================================
// 🏪 店舗経営UI （イス追加・イートイン座標修正版）
// ==========================================
window.SHOP_FURNITURE_DATA = {
    "restaurant": [
        { "name": "カウンター", "img": "restaurant_asset.png", "sx": 1764, "sy": 0, "sw": 1064, "sh": 771, "x": 183, "y": 53, "scale": 0.1, "reqLv": 1 },
        // ★修正：テーブルには座らないので isSeat を外しました
        { "name": "テーブル(手前)", "img": "restaurant_asset.png", "sx": 113, "sy": 52, "sw": 776, "sh": 673, "x": 61, "y": 119, "scale": 0.1, "reqLv": 1 },
        { "name": "テーブル(奥)", "img": "restaurant_asset.png", "sx": 113, "sy": 58, "sw": 776, "sh": 673, "x": 302, "y": 120, "scale": 0.1, "reqLv": 2 },
        // ★追加：イス（※sx, syなどの切り出し座標は仮の数字なので、エディタで調整してください！）
        {
            "name": "イス(手前)",
            "img": "restaurant_asset.png",
            "sx": 1186,
            "sy": 118,
            "sw": 464,
            "sh": 591,
            "x": 103,
            "y": 147,
            "scale": 0.10000000000000002,
            "reqLv": 1,
            "isSeat": true
        },
        {
            "name": "イス(奥)",
            "img": "restaurant_asset.png",
            "sx": 1190,
            "sy": 118,
            "sw": 464,
            "sh": 591,
            "x": 351,
            "y": 149,
            "scale": 0.10000000000000002,
            "reqLv": 2,
            "isSeat": true
        },
        { "name": "暖炉", "img": "restaurant_asset.png", "sx": 490, "sy": 629, "sw": 776, "sh": 875, "x": 188, "y": 111, "scale": 0.1, "reqLv": 2 },
        { "name": "酒樽", "img": "restaurant_asset.png", "sx": 1546, "sy": 745, "sw": 776, "sh": 736, "x": 252, "y": 78, "scale": 0.1, "reqLv": 3 }
    ],
    "smith": [
        { "name": "金床", "img": "smith_asset.png", "sx": 527, "sy": 223, "sw": 292, "sh": 271, "x": 161, "y": 78, "scale": 0.2499999999999999, "reqLv": 1 },
        { "name": "武器棚", "img": "smith_asset.png", "sx": 1800, "sy": 211, "sw": 467, "sh": 485, "x": 290, "y": 62, "scale": 0.2499999999999999, "reqLv": 1 },
        { "name": "炉", "img": "smith_asset.png", "sx": 886, "sy": 538, "sw": 407, "sh": 447, "x": 233, "y": 121, "scale": 0.1999999999999999, "reqLv": 2 }
    ]
};

window.shopSimInterval = null;
window.shopNPCs = [];

window.getDisplayShopItemName = function(itemId) {
    if (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].name) return itemCatalog[itemId].name;
    const dict = { 'item_sword_iron': '鉄の剣', 'item_shield_wood': '木の盾', 'eq_sword': '普通の剣', 'eq_shield': '普通の盾', 'tool_pan': 'フライパン', 'dish_stirfry': '野菜炒め', 'dish_steak': 'ステーキ', 'dish_soup': '特製スープ', 'baked_carrot': '焼きニンジン', 'baked_fish': '焼き魚', 'gold_sword': '金の剣', 'sashimi': 'お刺身' };
    return dict[itemId] || itemId;
};

// ★修正：在庫表示を AI のインベントリから動的にカウントする関数
window.getCurrentShopStock = function(recipes) {
    let currentStock = {};
    if (window.aiPet && window.aiPet.inventory) {
        window.aiPet.inventory.forEach(i => {
            if (recipes[i]) {
                currentStock[i] = (currentStock[i] || 0) + 1;
            }
        });
    }
    return currentStock;
};

window.openShopManagementUI = function(building) {
    // ★修正：手動の行商人UIを廃止し、AIへの指示を促す
    if (typeof currentMode !== 'undefined' && currentMode === 'visit') {
        let typeWord = building.type === 'restaurant' ? 'レストラン' : '鍛冶屋';
        alert(`ここは他人の島です。\n取引をしたい場合は、チャットでAIに「${typeWord}でおつかいして」と指示を出してみましょう！`);
        return;
    }

    if (!building.shopData) return;
    const s = building.shopData;
    const isRest = building.type === 'restaurant';
    const typeWord = isRest ? '🍳 レストラン (AI経営)' : '🔨 鍛冶屋 (AI経営)';
    const repStars = "⭐".repeat(Math.max(1, Math.ceil(s.reputation / 20))); 
    
    if (!building.id) { for (let k in assets) { if (assets[k] === building) { building.id = k; break; } } }
    if (typeof s.isOpen === 'undefined') s.isOpen = false;
    if (!s.logs) s.logs = ["営業を開始しました。"];

    const invalidItems = ['iron', 'stone', 'wood', 'item_berry'];
    invalidItems.forEach(inv => {
        if (s.recipes && s.recipes[inv]) delete s.recipes[inv];
        if (s.inventory && s.inventory[inv]) delete s.inventory[inv];
        if (s.prices && s.prices[inv]) delete s.prices[inv];
    });

    let managementUI = document.getElementById('shop-management-ui');
    if (!managementUI) {
        managementUI = document.createElement('div'); managementUI.id = 'shop-management-ui';
        managementUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 50000; display: flex; flex-direction: column; color: white; font-family: sans-serif;`;
        document.body.appendChild(managementUI);
    }

    let housingHtml = `<div style="position:relative; width:100%; height:250px; flex-shrink:0; background: url('empty_room.png') center/cover no-repeat #5D4037; border:2px solid #555; border-radius:8px; overflow:hidden; margin-bottom:15px; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">`;
    
    let furnitureList = isRest ? window.SHOP_FURNITURE_DATA['restaurant'] : window.SHOP_FURNITURE_DATA['smith'];
    if (furnitureList) {
        furnitureList.forEach(f => {
            if (s.interiorLevel >= f.reqLv) {
                housingHtml += `<div style="position:absolute; left:${f.x}px; top:${f.y}px; width:${f.sw}px; height:${f.sh}px; background:url('${f.img}') -${f.sx}px -${f.sy}px no-repeat; transform:scale(${f.scale}); transform-origin: top left; pointer-events:none;"></div>`; 
            }
        });
    }
    
    if (!s.isOpen) housingHtml += `<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); pointer-events:none; z-index:998;"></div>`;
    housingHtml += `<div id="shop-npc-container" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:999;"></div>`;
    
    let statusSign = s.isOpen ? 
        `<div style="position:absolute; top:10px; right:10px; background:#4CAF50; color:white; padding:5px 15px; border-radius:20px; font-weight:bold; z-index:1000; box-shadow:0 2px 5px rgba(0,0,0,0.5);">🟢 営業中</div>` :
        `<div style="position:absolute; top:10px; right:10px; background:#f44336; color:white; padding:5px 15px; border-radius:20px; font-weight:bold; z-index:1000; box-shadow:0 2px 5px rgba(0,0,0,0.5);">🔴 仕込み中</div>`;
    housingHtml += statusSign + `</div>`;

    let materialHtml = "";
    if (window.aiPet && window.aiPet.inventory) {
        let counts = {};
        window.aiPet.inventory.forEach(i => {
            if (isRest && typeof itemCatalog !== 'undefined' && itemCatalog[i] && (itemCatalog[i].type === 'food' || itemCatalog[i].type === 'ingredient')) counts[i] = (counts[i] || 0) + 1;
            else if (!isRest && (i === 'iron' || i === 'stone' || i === 'wood')) counts[i] = (counts[i] || 0) + 1;
        });
        for (let k in counts) {
            let name = window.getDisplayShopItemName(k);
            materialHtml += `<span style="background:#333; padding:4px 8px; border-radius:4px; margin:2px; font-size:12px; border:1px solid #555;">${name} <span style="color:#FFD700;">x${counts[k]}</span></span>`;
        }
        if (materialHtml === "") materialHtml = `<span style="color:#888; font-size:12px;">使える素材を持っていません...</span>`;
    }

    let logHtml = s.logs.map(l => `<div style="font-size:12px; color:#ddd; margin-bottom:4px; border-bottom:1px dashed #444; padding-bottom:2px;">> ${l}</div>`).join('');

    let inventoryHtml = "";
    let currentStock = window.getCurrentShopStock(s.recipes);

    for (let itemId in s.recipes) {
        if (!s.recipes[itemId].learned) continue;
        
        let itemName = window.getDisplayShopItemName(itemId);
        let isHidden = s.recipes[itemId].hidden;
        let invCount = currentStock[itemId] || 0;
        let price = s.prices[itemId] || 0;
        
        let baseValue = 50; 
        let isMarketKnown = false;
        if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) {
            baseValue = window.aiPet.customRecipes[itemId].value * 4;
            isMarketKnown = true;
        } else if (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].value) {
            baseValue = itemCatalog[itemId].value * 4;
            isMarketKnown = true;
        }
        let marketPriceDisplay = isMarketKnown ? `${baseValue} G` : `<span style="font-size:12px;">未設定(約50G)</span>`;
        
        let priceColor = "#FFD700"; 
        if (price > baseValue * 1.2) priceColor = "#ff5252"; 
        else if (price < baseValue * 0.8) priceColor = "#4CAF50"; 

        // ★修正：品切れで隠されている場合の表示切り替え（分かりやすいバッジ化）
        let invCountDisplay = `<span id="inv-count-${itemId}" style="font-size:18px; font-weight:bold; color:${invCount > 0 ? '#4CAF50' : '#f44336'};">${invCount} 個</span>`;
        
        if (isHidden) {
            itemName = `<span style="color:#777; text-decoration:line-through;">${itemName}</span>`;
            invCountDisplay = `<span id="inv-count-${itemId}" style="font-size:13px; font-weight:bold; color:#f44336; background:rgba(244,67,54,0.1); padding:4px 8px; border-radius:4px; border:1px solid #f44336; display:inline-block;">品切・非表示</span>`;
        }

        inventoryHtml += `
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding:10px; font-size:16px;">🎁 ${itemName}</td>
                <td style="padding:10px; text-align:center;">${invCountDisplay}</td>
                <td style="padding:10px; text-align:center; color:#aaa;">${marketPriceDisplay}</td>
                <td style="padding:10px; text-align:center;"><span id="inv-price-${itemId}" style="font-size:18px; font-weight:bold; color:${priceColor};">${price} G</span></td>
            </tr>
        `;
    }

    managementUI.innerHTML = `
        <div style="padding:20px; border-bottom:2px solid #555; display:flex; justify-content:space-between; align-items:center; background:#1a1a1a;">
            <h1 style="color:#FFC107; font-size:28px; margin:0;">${typeWord} <span style="font-size:16px; color:#aaa;">(内装Lv: ${s.interiorLevel})</span></h1>
            <div style="display:flex; gap:10px; align-items:center;">
                <div style="color:#4fc3f7; font-weight:bold; font-size:12px; margin-right:10px;">※AIが自分で素材を消費し、考えて経営しています。</div>
                ${!s.isOpen 
                    ? `<button onclick="window.confirmForceOpenShop('${building.id}')" style="padding:8px 15px; background:#FF9800; color:black; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(0,0,0,0.5); transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">⚡ 一瞬で仕込みを完了する</button>` 
                    : `<button onclick="window.confirmForceSellAll('${building.id}')" style="padding:8px 15px; background:#00BCD4; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(0,0,0,0.5); transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">⏩ 経営結果だけを見る</button>`
                }
                <button onclick="window.exitShopManagement()" style="padding:8px 15px; background:#f44336; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(0,0,0,0.5);">店を閉めて外に出る</button>
            </div>
        </div>
        <div style="display:flex; flex:1; overflow:hidden;">
            <div style="width:450px; padding:20px; border-right:2px solid #555; background:#111; display:flex; flex-direction:column; overflow-y:auto;">
                ${housingHtml}
                
                <div style="background:#222; padding:10px; border-radius:8px; border:1px solid #444; margin-bottom:15px;">
                    <div style="font-size:13px; color:#4fc3f7; font-weight:bold; margin-bottom:8px;">📊 AIのコンディション</div>
                    <div style="display:flex; justify-content:space-around; font-size: 16px; font-weight:bold;">
                        <div>体力: <span id="shop-ai-energy" style="color:#4CAF50;">100%</span></div>
                        <div>満腹度: <span id="shop-ai-hunger" style="color:#FF9800;">100%</span></div>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-around; background:#222; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #444;">
                    <div style="text-align:center;"><div style="font-size:12px; color:#aaa;">店舗の評判</div><div id="shop-rep-stars" style="font-size:24px; color:#FFD700; font-weight:bold; margin:5px 0;">${repStars}</div><div id="shop-rep-val" style="font-size:14px;">${s.reputation} / 100</div></div>
                    <div style="text-align:center;"><div style="font-size:12px; color:#aaa;">合計売上</div><div id="shop-sales-val" style="font-size:24px; color:#4CAF50; font-weight:bold; margin-top:5px;">💰 ${s.totalSales}</div><div style="font-size:14px;">ゴールド</div></div>
                    <div style="text-align:center;"><div style="font-size:12px; color:#00BCD4;">AIの所持金</div><div id="shop-ai-gold" style="font-size:24px; color:#00BCD4; font-weight:bold; margin-top:5px;">💰 ${window.aiPet ? window.aiPet.gold : 0}</div><div style="font-size:14px;">ゴールド</div></div>
                </div>
                
                <div style="background:#222; padding:10px; border-radius:8px; border:1px solid #444; margin-bottom:15px;">
                    <div style="font-size:13px; color:#FF9800; font-weight:bold; margin-bottom:8px;">🎒 AIの所持素材（この店で使えるもの）</div>
                    <div id="shop-ai-materials" style="display:flex; flex-wrap:wrap; gap:4px;">${materialHtml}</div>
                </div>

                <div style="background:#222; padding:10px; border-radius:8px; border:1px solid #444; flex:1; min-height:100px; display:flex; flex-direction:column;">
                    <div style="font-size:13px; color:#00BCD4; font-weight:bold; margin-bottom:8px;">🧠 経営AIの思考ログ</div>
                    <div id="shop-ai-logs" style="overflow-y:auto; flex:1;">${logHtml}</div>
                </div>
            </div>
            
            <div style="flex:1; padding:20px; overflow-y:auto; background:#1a1a1a;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:#222; padding:15px; border-radius:8px; border:1px solid #444;">
                    <h2 style="margin:0; font-size:20px;">📦 現在の商品ラインナップ</h2>
                </div>
                <table style="width:100%; border-collapse:collapse; background:#222; border-radius:8px; overflow:hidden;">
                    <thead style="background:#333;"><tr><th style="padding:12px; text-align:left;">アイテム名</th><th style="padding:12px;">在庫</th><th style="padding:12px; color:#aaa;">適正価格(相場)</th><th style="padding:12px;">AI設定価格</th></tr></thead>
                    <tbody id="shop-items-list">${inventoryHtml}</tbody>
                </table>
            </div>
        </div>
    `;
    managementUI.style.display = 'flex';
    window.startShopSimulation(building);
};

// ==========================================
// ★ 仕込み強制完了（超・賢いバランス管理AI搭載版）
// ==========================================
window.confirmForceOpenShop = function(bId) {
    let modal = document.createElement('div');
    modal.id = 'force-open-modal';
    modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:90000; display:flex; justify-content:center; align-items:center;`;
    modal.innerHTML = `
        <div style="background:#222; border:3px solid #FF9800; border-radius:12px; padding:30px; width:80%; max-width:480px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#FF9800; margin-top:0; margin-bottom:15px; font-size:24px;">⚡ 仕込みの一括完了</h2>
            <div style="font-size:14px; color:#ccc; margin-bottom:25px; line-height:1.6; text-align:left; background:#111; padding:15px; border-radius:8px; border:1px solid #444;">
                AIが「賢さ」と「店舗の規模」を計算し、最適なバランスで一気に仕込みます。<br><br>
                <span style="color:#4CAF50;">✔</span> 各種素材は、いざという時の為に<span style="color:#FFF; font-weight:bold;">最低5個は温存</span>します。<br>
                <span style="color:#4fc3f7;">✔</span> お店が特定の商品ばかりにならないよう<span style="color:#FFF; font-weight:bold;">バランス良く</span>作ります。<br>
                <span style="color:#E040FB;">✔</span> 在庫が十分確保できたら、優先的に<span style="color:#FFF; font-weight:bold;">新メニュー開発</span>を行います。
            </div>
            <div style="display:flex; gap:15px; justify-content:center;">
                <button onclick="window.executeForceOpenShop('${bId}')" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#FF9800; color:black; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #E65100; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">一気に作る</button>
                <button onclick="document.getElementById('force-open-modal').remove()" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #333; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">やめる</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.executeForceOpenShop = async function(bId) {
    let modal = document.getElementById('force-open-modal');
    if (modal) modal.remove();

    let building = assets[bId];
    if (!building || !building.shopData) return;
    let s = building.shopData;
    let ai = window.aiPet;

    // ==========================================
    // 🧠 賢いAIの計画（目標計算）
    // ==========================================
    // ①店舗の規模(Lv * 50) + ②賢さボーナス(最大+100) = 現実的な在庫上限(最大250程度)
    let baseCap = (s.interiorLevel || 1) * 50;
    let intelBonus = Math.min(100, Math.floor((ai.stats.intel || 10) / 10));
    let loopLimit = baseCap + intelBonus;
    
    // 同じメニューばかり作らない制限（賢さに応じて20〜30個）
    let maxPerItem = 20 + Math.min(10, Math.floor((ai.stats.intel || 10) / 100));

    // アニメーション情報の取得
    let actionName = building.type === 'restaurant' ? 'cook' : 'smith';
    let skinName = ai.currentSkin || ai.baseType || 'robot';
    let conf = typeof aiConfigs !== 'undefined' ? aiConfigs[skinName] || aiConfigs[skinName.split('_')[0]] : null;
    
    let frames = null;
    let imgSrc = 'characters.png';
    let animScale = 0.5;
    let animHtml = `<div style="font-size:50px; animation: spin 1s linear infinite;">⚙️</div>`; 

    if (conf) {
        frames = (conf.actions && conf.actions[actionName]) ? conf.actions[actionName] : 
                 (conf.actions && conf.actions.idle) ? conf.actions.idle : null;
        
        if (frames && frames.length > 0) {
            let mFrame = frames[0];
            let imgKey = skinName;
            if (conf.img) imgKey = conf.img;
            if (conf.actionImages && conf.actionImages[actionName]) imgKey = conf.actionImages[actionName]; 
            else if (mFrame.img) imgKey = mFrame.img;
            
            if (typeof images !== 'undefined' && images[imgKey] && images[imgKey].src) imgSrc = images[imgKey].src; 
            else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) imgSrc = window.dynamicImageCatalog[imgKey]; 
            
            animScale = conf.scale || 0.25; 
            animScale *= 1.8; 
            if (['robot', 'magician', 'spirit'].some(k => skinName.includes(k))) animScale *= 1.8; 
            
            let sw = mFrame.sw || 300; let sh = mFrame.sh || 300; let sx = mFrame.sx || 0; let sy = mFrame.sy || 0;
            let displayW = sw * animScale;
            let displayH = sh * animScale;
            
            animHtml = `
                <div style="width:${displayW}px; height:${displayH}px; position:relative; overflow:hidden; filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); margin-bottom:10px;">
                    <div id="loading-sprite" style="position:absolute; left:0; top:0; width:${sw}px; height:${sh}px; background-image:url('${imgSrc}'); background-position:-${sx}px -${sy}px; background-repeat:no-repeat; transform:scale(${animScale}); transform-origin:top left;"></div>
                </div>
            `;
        }
    }

    // --- ローディングUI表示 ---
    let loadingModal = document.createElement('div');
    loadingModal.id = 'shop-loading-modal';
    loadingModal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index:95000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; font-family:sans-serif;`;
    loadingModal.innerHTML = `
        ${animHtml}
        <h2 style="color:#FF9800; margin-top:10px; text-shadow:0 2px 4px #000;">AIが計画的に仕込み中...</h2>
        
        <div style="width: 80%; max-width: 400px; background: #222; border-radius: 10px; margin-top: 15px; overflow: hidden; border: 2px solid #555; box-shadow: 0 0 15px rgba(255, 152, 0, 0.3);">
            <div id="shop-loading-bar" style="width: 0%; height: 20px; background: linear-gradient(90deg, #FF9800, #FFC107); transition: width 0.1s;"></div>
        </div>
        <div id="shop-loading-text" style="color:#FFF; font-size:16px; font-weight:bold; margin-top:10px;">準備中... (0 / 最大 ${loopLimit} 個)</div>
        <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(loadingModal);

    let animTimer = null;
    if (frames && frames.length > 0) {
        let fIdx = 0;
        animTimer = setInterval(() => {
            fIdx = (fIdx + 1) % frames.length;
            let f = frames[fIdx];
            let sprite = document.getElementById('loading-sprite');
            if (sprite) {
                sprite.style.width = (f.sw || 300) + 'px';
                sprite.style.height = (f.sh || 300) + 'px';
                sprite.style.backgroundPosition = `-${f.sx || 0}px -${f.sy || 0}px`;
            }
        }, 120);
    }

    let startTime = Date.now();
    await new Promise(r => setTimeout(r, 50));

    let craftedCount = 0;
    let researchCount = 0;
    let upgradeCount = 0; 

    // 内装アップグレード処理
    while (s.interiorLevel < 3) {
        let upgradeCost = s.interiorLevel * 1000;
        if (ai.gold >= upgradeCost * 2) {
            ai.gold -= upgradeCost;
            s.interiorLevel++;
            upgradeCount++;
        } else {
            break;
        }
    }
    
    if (ai.schedule && ai.schedule.length > 0 && (ai.schedule[0].type === 'shop_work' || ai.schedule[0].type === 'shop_research')) {
        ai.schedule.shift();
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    }

    let failsafe = 0;
    let tempInventory = [...(ai.inventory || [])];
    let newCraftedItems = [];

    // ★ 追加機能：素材を最低「5個」残すためのチェック関数
    const canAffordToConsume = (consumedIds) => {
        let requiredCounts = {};
        consumedIds.forEach(id => { requiredCounts[id] = (requiredCounts[id] || 0) + 1; });
        
        for (let id in requiredCounts) {
            let currentTotal = tempInventory.filter(item => item === id).length;
            // 消費後の残りが5個未満になってしまうなら「作成ストップ（温存）」と判断
            if (currentTotal - requiredCounts[id] < 5) return false;
        }
        return true;
    };

    while ((craftedCount + researchCount) < loopLimit && failsafe < 3000) {
        failsafe++;
        
        // 全体の数が減ったので、更新頻度を高くしてバーを滑らかに見せる
        if (failsafe % 5 === 0) {
            let current = craftedCount + researchCount;
            let percent = Math.min(100, Math.floor((current / loopLimit) * 100));
            
            let progEl = document.getElementById('shop-loading-text');
            let barEl = document.getElementById('shop-loading-bar');
            
            if (progEl) progEl.innerText = `作成＆研究：${current} / 目標 ${loopLimit} 個`;
            if (barEl) barEl.style.width = percent + '%';
            
            await new Promise(r => setTimeout(r, 10)); 
        }

        let knownRecipes = Object.keys(s.recipes || {}).filter(k => s.recipes[k].learned);
        let currentStockDict = window.getCurrentShopStock(s.recipes);
        
        // 仮で作った分も在庫として合算
        newCraftedItems.forEach(i => {
            if (knownRecipes.includes(i)) currentStockDict[i] = (currentStockDict[i] || 0) + 1;
        });

        // 🏆 賢いAIの判断：①作れるか ②上限を超えてないか ③素材を残せるか
        let craftable = knownRecipes.filter(r => {
            if ((currentStockDict[r] || 0) >= maxPerItem) return false; // 1メニューの偏り防止
            let consumedIds = window.checkRecipeMaterials(tempInventory, r, building.type);
            if (!consumedIds) return false; // 素材がない
            if (!canAffordToConsume(consumedIds)) return false; // いざという時のために素材を温存！
            return true;
        });

        let hasZeroStockMenu = knownRecipes.some(r => (currentStockDict[r] || 0) === 0);
        let doResearch = false;
        
        if (craftable.length === 0) {
            // 素材不足、または上限に達した場合は、研究に専念する
            if (Math.random() < 0.4) doResearch = true;
            else break; 
        } else if (!hasZeroStockMenu) {
            // 在庫が十分にある場合、賢さ＋進行度で新メニュー開発率をアップさせる
            let researchChance = 0.15 + ((ai.stats.intel || 10) / 400);
            if (researchChance > 0.6) researchChance = 0.6; 
            
            // 目標数の8割を超えたら研究のラストスパート
            if ((craftedCount + researchCount) > loopLimit * 0.8) researchChance += 0.2;

            if (Math.random() < researchChance) doResearch = true;
        }

        if (doResearch) {
            if (typeof window.generateCustomRecipe === 'function') {
                let oldKeys = Object.keys(s.recipes || {});
                let newName = window.generateCustomRecipe(s);
                if (newName) {
                    researchCount++;
                    let newKeys = Object.keys(s.recipes || {});
                    let addedId = newKeys.find(k => !oldKeys.includes(k));
                    if (addedId) newCraftedItems.push(addedId); 
                }
            }
        } else if (craftable.length > 0) {
            // 一番在庫が「少ない」メニューを優先して作る（均等化）
            craftable.sort((a, b) => {
                let stockA = currentStockDict[a] || 0;
                let stockB = currentStockDict[b] || 0;
                return stockA - stockB;
            });
            
            let pick = craftable[0];
            let consumedIds = window.checkRecipeMaterials(tempInventory, pick, building.type);
            
            if (consumedIds) {
                consumedIds.forEach(cId => {
                    let idx = tempInventory.indexOf(cId);
                    if (idx !== -1) tempInventory[idx] = null;
                });
                newCraftedItems.push(pick);
                craftedCount++;
            } else {
                break;
            }
        }
    }

    let finalCurrent = craftedCount + researchCount;
    let finalPercent = Math.min(100, Math.floor((finalCurrent / loopLimit) * 100));
    let barEl = document.getElementById('shop-loading-bar');
    let progEl = document.getElementById('shop-loading-text');
    if (barEl) barEl.style.width = finalPercent + '%';
    if (progEl) progEl.innerText = `完了！ (${finalCurrent} / 目標 ${loopLimit} 個)`;
    
    // 演出のため最低1.5秒はアニメーションを維持する
    let elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
        await new Promise(r => setTimeout(r, 1500 - elapsed));
    }

    if (animTimer) clearInterval(animTimer);
    if (loadingModal) loadingModal.remove();

    ai.inventory = tempInventory.filter(item => item !== null).concat(newCraftedItems);

    let finalStockDict = window.getCurrentShopStock(s.recipes);
    let finalTotalStock = Object.values(finalStockDict).reduce((a, b) => a + b, 0);

    // ==========================================
    // ★案3（賢さ依存）：開店直前に、賢いAIは在庫0のメニューをメニュー表から隠す
    // ==========================================
    let isSmartMenuManager = (ai.stats.intel || 10) >= 50; // 賢さ50以上で発動
    for (let r in s.recipes) {
        if (s.recipes[r].learned) {
            let count = finalStockDict[r] || 0;
            // 賢い＆在庫0なら隠す。アホ、または在庫があるなら隠さない。
            if (isSmartMenuManager && count === 0) s.recipes[r].hidden = true;
            else s.recipes[r].hidden = false;
        }
    }

    // ローディングUIを消す
    if (loadingModal) loadingModal.remove();

    if (finalTotalStock > 0) {
        s.isOpen = true;
        let logMsg = "⚡ 準備完了！直ちに営業を開始します！";
        if (craftedCount > 0 || researchCount > 0 || upgradeCount > 0) {
            logMsg = `⚡ AIが計画的に行動し、`;
            if (upgradeCount > 0) logMsg += `内装をLv${s.interiorLevel}に改装し、`;
            logMsg += `${craftedCount}個の仕込みと ${researchCount}個の新メニュー開発を行いました！(※不要な乱獲を防ぐため、各種素材は5個以上キープしています)`;
        }
        if (window.addShopLog) window.addShopLog(s, logMsg);
        
        if (typeof window.openShopManagementUI === 'function') window.openShopManagementUI(building);
    } else {
        let alertModal = document.createElement('div');
        alertModal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:90000; display:flex; justify-content:center; align-items:center;`;
        alertModal.innerHTML = `
            <div style="background:#222; border:3px solid #f44336; border-radius:12px; padding:30px; width:80%; max-width:400px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                <h2 style="color:#f44336; margin-top:0; margin-bottom:15px; font-size:24px;">❌ 素材が足りません</h2>
                <p style="font-size:16px; color:#ccc; margin-bottom:25px; line-height:1.5;">在庫がなく、作れるだけの素材も持っていないため、お店を開けられません！<br>（AIはいざという時の為に各種素材を5つずつ手元に残します）</p>
                <button onclick="this.parentElement.parentElement.remove()" style="padding:12px 30px; font-size:18px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer;">閉じる</button>
            </div>
        `;
        document.body.appendChild(alertModal);
    }
};

// ==========================================
// ★ 新規追加：営業強制完了（一括販売＆リザルト）
// ==========================================
window.confirmForceSellAll = function(bId) {
    let modal = document.createElement('div');
    modal.id = 'force-sell-modal';
    modal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:90000; display:flex; justify-content:center; align-items:center;`;
    modal.innerHTML = `
        <div style="background:#222; border:3px solid #00BCD4; border-radius:12px; padding:30px; width:80%; max-width:480px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            <h2 style="color:#00BCD4; margin-top:0; margin-bottom:15px; font-size:24px;">⏩ 経営結果だけを見る</h2>
            <div style="font-size:14px; color:#ccc; margin-bottom:25px; line-height:1.6; text-align:left; background:#111; padding:15px; border-radius:8px; border:1px solid #444;">
                営業時間を早送りし、現在の在庫を<span style="color:#FFF; font-weight:bold;">一気に販売</span>してリザルト（売上・評判）を確認します。<br><br>
                <span style="color:#ff5252;">⚠️ 経営破綻リスク</span><br>
                価格設定が「ぼったくり」のまま結果を見ると、断られたお客さんの悪い噂が一気に広まり、<span style="color:#ff5252; font-weight:bold;">即座に倒産</span>する危険があります。
            </div>
            <div style="display:flex; gap:15px; justify-content:center;">
                <button onclick="window.executeForceSellAll('${bId}')" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#00BCD4; color:black; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #00838F; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">結果を見る</button>
                <button onclick="document.getElementById('force-sell-modal').remove()" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #333; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">やめる</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.executeForceSellAll = async function(bId) {
    let modal = document.getElementById('force-sell-modal');
    if (modal) modal.remove();

    let building = assets[bId];
    if (!building || !building.shopData) return;
    let s = building.shopData;
    let ai = window.aiPet;

    let currentStock = window.getCurrentShopStock(s.recipes);
    let remainingInv = [];
    let sellCounts = {...currentStock};

    let totalSalesGold = 0;
    let totalRepChange = 0;
    let itemsSold = 0;

    // インベントリから販売する商品を取り除きつつ、売上と評判のシミュレーションを行う
    for (let item of (ai.inventory || [])) {
        if (sellCounts[item] > 0) {
            sellCounts[item]--;
            
            let price = s.prices[item] || 50;
            let baseValue = 50;
            // ★ AIのオリジナルレシピなら、その価値を正しく評価する！
            if (ai.customRecipes && ai.customRecipes[item]) baseValue = ai.customRecipes[item].value * 4;
            else if (typeof itemCatalog !== 'undefined' && itemCatalog[item] && itemCatalog[item].value) baseValue = itemCatalog[item].value * 4;
            
            let ratio = price / baseValue;
            let acceptableRatio = 1.0 + ((s.interiorLevel || 1) * 0.1); 

            // 来客シミュレーション（1個売るのにどれくらい客に断られたか）
            let tries = 0;
            let sold = false;
            while (!sold && tries < 10) {
                tries++;
                let buyChance = 1.0;
                if (ratio > acceptableRatio) buyChance -= (ratio - acceptableRatio) * 1.5;
                if (ratio < 0.8) buyChance += 0.5; 
                if (s.reputation > 50) buyChance += 0.2; 
                
                if (Math.random() < buyChance) {
                    totalSalesGold += price;
                    totalRepChange += 1; // 売れたら評判が少し上がる
                    itemsSold++;
                    sold = true;
                } else {
                    let repPenalty = 4 - (s.interiorLevel || 1);
                    if (s.reputation > 70 && ratio > 1.3) repPenalty += 3; 
                    else if (s.reputation > 50 && ratio > 1.3) repPenalty += 2;
                    totalRepChange -= repPenalty; // 買われずに帰られると評判が下がる
                }
            }
            // 10回連続で断られても、一括販売なので無理やり売り切ったことにする（大赤字の評判低下を食らう）
            if (!sold) {
                totalSalesGold += price;
                itemsSold++;
            }
        } else {
            remainingInv.push(item); // メニューにない商品（素材など）は手元に残す
        }
    }

    // 結果を反映
    ai.inventory = remainingInv;
    ai.gold += totalSalesGold;
    s.totalSales += totalSalesGold;
    
    let oldRep = s.reputation;
    s.reputation = Math.max(0, Math.min(100, s.reputation + Math.floor(totalRepChange)));
    s.isOpen = false; // 完売したので店を閉める（仕込み中に戻る）
    
    if (window.addShopLog) window.addShopLog(s, `⏩ 営業を一気に終わらせました！(販売: ${itemsSold}個 / 売上: ${totalSalesGold}G)`);

    // UIを背景で更新しておく
    if (typeof window.openShopManagementUI === 'function') window.openShopManagementUI(building);

    // ★ 修正：リザルトモーダル表示（確実に消去できるようにIDを付与）
    let resultModal = document.createElement('div');
    resultModal.id = 'shop-result-modal';
    resultModal.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:95000; display:flex; justify-content:center; align-items:center;`;
    
    let repText = s.reputation > oldRep ? `<span style="color:#4CAF50;">+${s.reputation - oldRep} UP!</span>` : 
                  s.reputation < oldRep ? `<span style="color:#f44336;">${oldRep - s.reputation} DOWN...</span>` : `<span style="color:#aaa;">変化なし</span>`;

    // ★ ご要望の「経営継続」と「経営終了」ボタンを配置！
    let buttonsHtml = '';
    if (s.reputation <= 0) {
        buttonsHtml = `<button onclick="document.getElementById('shop-result-modal').remove(); window.triggerBankrupt(assets['${bId}']);" style="padding:12px 40px; font-size:18px; font-weight:bold; background:#f44336; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #b71c1c; width:100%; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">倒産を確認する</button>`;
    } else {
        buttonsHtml = `
            <div style="display:flex; gap:15px; justify-content:center;">
                <button onclick="document.getElementById('shop-result-modal').remove();" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#00BCD4; color:black; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #00838F; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">経営継続 (仕込みへ)</button>
                <button onclick="document.getElementById('shop-result-modal').remove(); window.exitShopManagement();" style="flex:1; padding:12px; font-size:18px; font-weight:bold; background:#f44336; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 0 #b71c1c; transition:0.1s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">経営終了 (外に出る)</button>
            </div>
        `;
    }

    // ★ フリーズバグの元凶だった「透明になって消えるアニメーション」を削除し、専用のPopアニメーションに変更
    resultModal.innerHTML = `
        <style>@keyframes resultPop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }</style>
        <div style="background:#222; border:3px solid #00BCD4; border-radius:12px; padding:30px; width:80%; max-width:420px; text-align:center; color:white; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8); animation: resultPop 0.2s ease-out forwards;">
            <h2 style="color:#00BCD4; margin-top:0; margin-bottom:20px; font-size:26px;">🎉 営業リザルト</h2>
            <div style="font-size:18px; margin-bottom:12px; display:flex; justify-content:space-between; border-bottom:1px solid #444; padding-bottom:8px;">
                <span style="color:#aaa;">販売数:</span> <span style="color:#FFF; font-weight:bold;">${itemsSold} 個</span>
            </div>
            <div style="font-size:18px; margin-bottom:12px; display:flex; justify-content:space-between; border-bottom:1px solid #444; padding-bottom:8px;">
                <span style="color:#aaa;">総売上:</span> <span style="color:#FFD700; font-weight:bold;">💰 ${totalSalesGold} G</span>
            </div>
            <div style="font-size:18px; margin-bottom:25px; display:flex; justify-content:space-between;">
                <span style="color:#aaa;">評判の変化:</span> <span>${repText} <span style="font-size:14px; color:#ccc;">(現在: ${s.reputation})</span></span>
            </div>
            ${buttonsHtml}
        </div>
    `;
    document.body.appendChild(resultModal);
};

window.updateShopUIData = function(building) {
    if (!building || !building.shopData) return;
    const s = building.shopData;
    let repStarsEl = document.getElementById('shop-rep-stars');
    if (repStarsEl) repStarsEl.innerText = "⭐".repeat(Math.max(1, Math.ceil(s.reputation / 20)));
    let repValEl = document.getElementById('shop-rep-val');
    if (repValEl) repValEl.innerText = `${s.reputation} / 100`;
    let salesEl = document.getElementById('shop-sales-val');
    if (salesEl) salesEl.innerText = `💰 ${s.totalSales}`;
    
    // ★追加：AIの所持金もリアルタイム更新する
    let aiGoldEl = document.getElementById('shop-ai-gold');
    if (aiGoldEl && window.aiPet) aiGoldEl.innerText = `💰 ${window.aiPet.gold}`;
    
    let currentStock = window.getCurrentShopStock(s.recipes);

    for (let itemId in s.recipes) {
        let countEl = document.getElementById(`inv-count-${itemId}`);
        if (countEl) {
            let invCount = currentStock[itemId] || 0;
            let isHidden = s.recipes[itemId].hidden;
            
            // ★修正：リアルタイム更新時も、隠されていればバッジを表示する
            if (isHidden) {
                countEl.innerHTML = `品切・非表示`;
                countEl.style.fontSize = "13px";
                countEl.style.color = "#f44336";
                countEl.style.background = "rgba(244,67,54,0.1)";
                countEl.style.padding = "4px 8px";
                countEl.style.borderRadius = "4px";
                countEl.style.border = "1px solid #f44336";
                countEl.style.display = "inline-block";
            } else {
                countEl.innerHTML = `${invCount} 個`;
                countEl.style.fontSize = "18px";
                countEl.style.color = invCount > 0 ? '#4CAF50' : '#f44336';
                countEl.style.background = "none";
                countEl.style.padding = "0";
                countEl.style.border = "none";
            }
        }
        let priceEl = document.getElementById(`inv-price-${itemId}`);
        if (priceEl) { 
            let price = s.prices[itemId] || 0;
            // ★修正：リアルタイム更新時も、オリジナルレシピの本来の価値を読み取る！
            let baseValue = 50;
            if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) {
                baseValue = window.aiPet.customRecipes[itemId].value * 4;
            } else if (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].value) {
                baseValue = itemCatalog[itemId].value * 4;
            }
            let priceColor = "#FFD700"; 
            if (price > baseValue * 1.2) priceColor = "#ff5252"; 
            else if (price < baseValue * 0.8) priceColor = "#4CAF50"; 
            
            priceEl.innerText = price + " G"; 
            priceEl.style.color = priceColor;
        }
    }

    let matEl = document.getElementById('shop-ai-materials');
    if (matEl && window.aiPet && window.aiPet.inventory) {
        let isRest = building.type === 'restaurant';
        let counts = {};
        window.aiPet.inventory.forEach(i => {
            if (isRest && typeof itemCatalog !== 'undefined' && itemCatalog[i] && (itemCatalog[i].type === 'food' || itemCatalog[i].type === 'ingredient')) counts[i] = (counts[i] || 0) + 1;
            else if (!isRest && (i === 'iron' || i === 'stone' || i === 'wood')) counts[i] = (counts[i] || 0) + 1;
        });
        let matHtml = "";
        for (let k in counts) {
            let name = window.getDisplayShopItemName(k);
            matHtml += `<span style="background:#333; padding:4px 8px; border-radius:4px; margin:2px; font-size:12px; border:1px solid #555;">${name} <span style="color:#FFD700;">x${counts[k]}</span></span>`;
        }
        matEl.innerHTML = matHtml === "" ? `<span style="color:#888; font-size:12px;">使える素材を持っていません...</span>` : matHtml;
    }

    let logEl = document.getElementById('shop-ai-logs');
    if (logEl && s.logs) {
        logEl.innerHTML = s.logs.map(l => `<div style="font-size:12px; color:#ddd; margin-bottom:4px; border-bottom:1px dashed #444; padding-bottom:2px;">> ${l}</div>`).join('');
    }
};

window.triggerBankrupt = function(building) {
    if (!building || !building.shopData) return;
    let s = building.shopData;
    clearInterval(window.shopSimInterval);
    let bankruptUI = document.createElement('div');
    bankruptUI.id = 'bankrupt-ui';
    bankruptUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 60000; display: flex; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
    bankruptUI.innerHTML = `
        <div style="background:#b71c1c; border:4px solid #ff5252; border-radius:12px; padding:40px; text-align:center; min-width:400px; box-shadow: 0 10px 40px rgba(255,0,0,0.5);">
            <h2 style="color:#FFF; font-size:36px; margin-top:0;">💥 経営破綻 💥</h2>
            <div style="font-size:18px; line-height:1.6; margin-bottom:30px;">
                悪評が広まりすぎたため、<br>「${building.name}」は倒産し、取り壊されてしまいました...
            </div>
            <button onclick="window.closeBankruptUI('${building.id || Object.keys(assets).find(k => assets[k] === building)}')" style="padding:15px 40px; font-size:20px; font-weight:bold; background:#222; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #000; transition:0.2s;" onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='none';">
                現実を受け入れる
            </button>
        </div>
    `;
    document.body.appendChild(bankruptUI);
};

window.startShopSimulation = function(building) {
    if (window.shopSimInterval) clearInterval(window.shopSimInterval);
    window.shopNPCs = [];

    window.shopSimInterval = setInterval(() => {
        const npcContainer = document.getElementById('shop-npc-container');
        if (!npcContainer) return; 
        
        let s = building.shopData;

        if (window.aiPet) {
            let energyEl = document.getElementById('shop-ai-energy');
            if (energyEl) {
                let e = Math.floor(window.aiPet.energy);
                energyEl.innerText = e + "%";
                energyEl.style.color = e > 50 ? '#4CAF50' : (e > 20 ? '#FF9800' : '#f44336');
            }
            let hungerEl = document.getElementById('shop-ai-hunger');
            if (hungerEl) {
                let h = Math.floor(window.aiPet.hunger);
                hungerEl.innerText = h + "%";
                hungerEl.style.color = h > 50 ? '#4CAF50' : (h > 20 ? '#FF9800' : '#f44336');
            }
        }

        if (s.isOpen) {
            let spawnChance = Math.max(0.01, (s.reputation / 100) * 0.05) + ((s.interiorLevel - 1) * 0.015);
            if (Math.random() < spawnChance && window.shopNPCs.length < 3) {
                let skins = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'bird', 'beetle'];
                let skin = skins[Math.floor(Math.random() * skins.length)];
                let isRegular = Math.random() < (s.reputation / 200); 

                // ==========================================
                // ★本番機能：登録された「本当のフレンド」が来店する！
                // ==========================================
                let friendList = JSON.parse(localStorage.getItem('my_friend_list') || '[]');
                let isFriend = false;
                let friendId = null;
                let friendName = "";

                // 30%の確率で、かつフレンドが1人以上いる場合のみフレンドが来る
                if (friendList.length > 0 && Math.random() < 0.3) {
                    let f = friendList[Math.floor(Math.random() * friendList.length)];
                    isFriend = true;
                    friendId = f.id;
                    friendName = f.name;
                }

                let newNPC = {
                    id: 'npc_' + Date.now() + Math.random(), skin: skin,
                    x: -20, y: 150 + Math.random() * 40, targetX: 100 + Math.random() * 80, targetY: 150 + Math.random() * 40,
                    state: 'entering', timer: 0, 
                    msg: isFriend ? "遊びに来たよ！" : (isRegular ? "また来たよ！" : "お店やってる？"), 
                    msgColor: isFriend ? "#E040FB" : (isRegular ? "#FFD700" : "#fff"),
                    intel: 10 + Math.random() * 80,
                    isRegular: isRegular,
                    isFriend: isFriend,
                    friendId: friendId,
                    friendName: friendName
                };
                window.shopNPCs.push(newNPC);
            }
        }
        
        let html = '';
        
        if (window.aiPet) {
            const myAi = window.aiPet;
            let myAction = myAi.visualAction || 'idle';
            if (myAi.actionState === 'apprentice_training' || myAi.actionState === 'building') {
                myAction = myAi.visualAction || (building.type === 'restaurant' ? 'cook' : 'smith');
            } else if (myAi.actionState === 'studying') {
                myAction = 'study';
            }

            let myConf = (typeof aiConfigs !== 'undefined') ? aiConfigs[myAi.currentSkin || myAi.baseType || 'robot'] : null;
            if (myConf) {
                let myFrames = (myConf.actions && myConf.actions[myAction]) ? myConf.actions[myAction] : (myConf.actions && myConf.actions.idle) ? myConf.actions.idle : null;
                if (myFrames && myFrames.length > 0) {
                    let fIdx = myAi.frameIndex || 0; if (fIdx >= myFrames.length) fIdx = 0;
                    let mFrame = myFrames[fIdx];
                    
                    let mImgKey = myAi.currentSkin || myAi.baseType || 'robot';
                    if (myConf.img) mImgKey = myConf.img;
                    if (myConf.actionImages && myConf.actionImages[myAction]) mImgKey = myConf.actionImages[myAction]; 
                    else if (mFrame.img) mImgKey = mFrame.img;
                    
                    let mImgUrl = 'characters.png';
                    if (typeof images !== 'undefined' && images[mImgKey] && images[mImgKey].src) mImgUrl = images[mImgKey].src; 
                    else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[mImgKey]) mImgUrl = window.dynamicImageCatalog[mImgKey]; 
                    else if (typeof imageSources !== 'undefined' && imageSources[mImgKey]) mImgUrl = imageSources[mImgKey]; 
                    
                    let myScale = myConf.scale || 0.25; 
                    let myX = 220; let myY = building.type === 'restaurant' ? 120 : 160;
                    let sw = mFrame.sw || 300; let sh = mFrame.sh || 300; let sx = mFrame.sx || 0; let sy = mFrame.sy || 0;
                    
                    let myBgStyle = `position:absolute; left:-${sw/2}px; top:-${sh}px; width:${sw}px; height:${sh}px; background-image:url('${mImgUrl}'); background-position:-${sx}px -${sy}px; background-repeat:no-repeat; transform:scaleX(-1);`;
                    let msgTop = Math.floor(sh * myScale) + 15; 
                    
                    html += `
                        <div style="position:absolute; left:${myX}px; top:${myY}px; z-index:${Math.floor(myY)};">
                            <div style="position:relative; transform:scale(${myScale});">
                                <div style="${myBgStyle}"></div>
                            </div>
                            ${myAi.messageTimer > 0 ? `<div style="position:absolute; top:-${msgTop}px; left:0; transform:translateX(-50%); background:rgba(255,255,255,0.9); color:#000; padding:6px 10px; border-radius:6px; font-size:13px; font-weight:bold; white-space:nowrap; border:2px solid #aaa; box-shadow:0 4px 6px rgba(0,0,0,0.5); z-index:100; pointer-events:none;">${myAi.message}</div>` : ''}
                        </div>
                    `;
                }
            }
        }

        for (let i = window.shopNPCs.length - 1; i >= 0; i--) {
            let npc = window.shopNPCs[i]; npc.timer++;
            
            if (npc.state === 'entering') {
                npc.x += (npc.targetX - npc.x) * 0.1; npc.y += (npc.targetY - npc.y) * 0.1;
                if (npc.timer > 30) {
                    npc.state = 'shopping'; npc.timer = 0;
                    
                    // ★案3対応：learnedがtrueで、かつ「hidden（隠蔽）」されていないメニューだけを見る
                    let knownRecipes = Object.keys(s.recipes).filter(k => s.recipes[k].learned && !s.recipes[k].hidden);
                    
                    if (knownRecipes.length > 0) {
                        let targetItemId = knownRecipes[Math.floor(Math.random() * knownRecipes.length)];
                        let itemName = window.getDisplayShopItemName(targetItemId);

                        let currentStock = window.getCurrentShopStock(s.recipes);

                        if (currentStock[targetItemId] > 0) {
                            let price = s.prices[targetItemId] || 50;
                            
                            // ★修正：お客さん（NPC）も、AIのオリジナルレシピの「真の価値」を理解して評価する！
                            let baseValue = 50;
                            if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[targetItemId]) {
                                baseValue = window.aiPet.customRecipes[targetItemId].value * 4;
                            } else if (typeof itemCatalog !== 'undefined' && itemCatalog[targetItemId] && itemCatalog[targetItemId].value) {
                                baseValue = itemCatalog[targetItemId].value * 4;
                            }
                            
                            let ratio = price / baseValue;
                            let buyChance = 1.0;

                            let acceptableRatio = 1.0 + (s.interiorLevel * 0.1); 
                            if (ratio > acceptableRatio) buyChance -= (ratio - acceptableRatio) * (npc.intel / 30);
                            if (ratio < 0.8) buyChance += 0.5; 
                            if (s.reputation > 50) buyChance += 0.2; 
                            if (npc.isRegular) buyChance += 0.3; 
                            if (npc.isFriend) buyChance += 0.5; // フレンドは甘々で買ってくれる

                            if (Math.random() < buyChance) {
                                let idx = window.aiPet.inventory.indexOf(targetItemId);
                                if (idx !== -1) window.aiPet.inventory.splice(idx, 1);
                                
                                let isEatIn = false;
                                let foundSeat = null;
                                
                                if (building.type === 'restaurant' && Math.random() < 0.5) {
                                    let seats = window.SHOP_FURNITURE_DATA['restaurant'].filter(f => f.isSeat && s.interiorLevel >= f.reqLv);
                                    for (let seat of seats) {
                                        let occupied = window.shopNPCs.some(n => n.targetSeat && n.targetSeat.name === seat.name);
                                        if (!occupied) {
                                            foundSeat = seat;
                                            break;
                                        }
                                    }
                                    if (foundSeat) isEatIn = true;
                                }

                                if (isEatIn) {
                                    npc.targetSeat = foundSeat;
                                    npc.purchasedPrice = price; 
                                    npc.purchasedItemId = targetItemId;
                                    npc.targetX = foundSeat.x; 
                                    npc.targetY = foundSeat.y + 20; 
                                    npc.state = 'moving_to_seat';
                                    npc.timer = 0;
                                    npc.msg = `ここで食べていくよ！`; npc.msgColor = "#4CAF50";
                                } else {
                                    s.totalSales += price;
                                    s.reputation = Math.min(100, s.reputation + (npc.isRegular ? 2 : 1)); window.aiPet.gold += price; 
                                    npc.msg = `${itemName}を買った！`; npc.msgColor = "#4CAF50";
                                    
                                    let vfx = document.createElement('div');
                                    vfx.style.cssText = `position:absolute; left:${npc.x + 30}px; top:${npc.y - 20}px; color:#FFD700; font-weight:bold; font-size:24px; animation:slideUpFade 1s forwards; z-index:100; pointer-events:none; text-shadow:1px 1px 0 #000;`;
                                    vfx.innerText = `+${price}G`; npcContainer.appendChild(vfx); setTimeout(() => vfx.remove(), 1000);
                                    
                                    if (npc.isFriend && typeof window.sendItemToFriend === 'function') {
                                        window.sendItemToFriend(npc.friendId, npc.friendName, targetItemId, price);
                                    }

                                    npc.state = 'leaving';
                                    npc.targetX = -100;
                                }

                            } else {
                                let repPenalty = 4 - s.interiorLevel;
                                if (s.reputation > 70 && ratio > 1.3) repPenalty += 5; 
                                else if (s.reputation > 50 && ratio > 1.3) repPenalty += 3;
                                if (npc.isRegular) repPenalty *= 2; 

                                s.reputation -= repPenalty; 
                                npc.msgColor = "#ff5252";
                                if (npc.intel > 50) npc.msg = npc.isFriend ? `ちょっと高すぎない...？また今度ね！` : (npc.isRegular ? `常連なのにこの値段！？もう来ない！` : `相場より高いな...ぼったくりだ！`);
                                else npc.msg = `うーん、ちょっと高いかも...`; 
                                npc.state = 'leaving'; npc.targetX = -100;
                                
                                if (s.reputation <= 0) return window.triggerBankrupt(building);
                            }
                        } else {
                            let repPenalty = npc.isRegular ? 3 : 1; 
                            s.reputation = Math.max(0, s.reputation - repPenalty);
                            npc.msg = npc.isFriend ? `あれ？${itemName}目当てだったのに...残念！` : (npc.isRegular ? `${itemName}がないなんて...ガッカリ。` : `${itemName}、品切れかぁ...`); 
                            npc.msgColor = "#aaa"; 
                            npc.state = 'leaving'; npc.targetX = -100;
                            
                            if (s.reputation <= 0) return window.triggerBankrupt(building);
                        }
                    } else {
                        npc.msg = "メニューがないみたい..."; npc.msgColor = "#aaa"; s.reputation = Math.max(0, s.reputation - 1);
                        npc.state = 'leaving'; npc.targetX = -100;
                    }
                    window.updateShopUIData(building); 
                }
            } 
            else if (npc.state === 'moving_to_seat') {
                npc.x += (npc.targetX - npc.x) * 0.1; 
                npc.y += (npc.targetY - npc.y) * 0.1;
                let dist = Math.hypot(npc.targetX - npc.x, npc.targetY - npc.y);
                if (dist < 2) {
                    npc.state = 'eating';
                    npc.timer = 0;
                    npc.msg = "モグモグ...（食事中）";
                    npc.msgColor = "#FFF";
                }
            } 
            else if (npc.state === 'eating') {
                if (npc.timer > 50) { 
                    let cookSkill = window.aiPet.skills.cooking || 1;
                    let deliciousChance = 0.65 + (cookSkill * 0.03); 
                    if (npc.isFriend) deliciousChance += 0.2; // フレンドは甘めに評価
                    
                    if (Math.random() < deliciousChance) {
                        s.totalSales += npc.purchasedPrice;
                        s.reputation = Math.min(100, s.reputation + (npc.isRegular ? 3 : 2)); 
                        window.aiPet.gold += npc.purchasedPrice;
                        
                        npc.msg = npc.isFriend ? `美味しい！また食べに来るね！` : `すごく美味しい！最高！`; 
                        npc.msgColor = "#FFD700";
                        
                        let vfx = document.createElement('div');
                        vfx.style.cssText = `position:absolute; left:${npc.x + 30}px; top:${npc.y - 20}px; color:#FFD700; font-weight:bold; font-size:24px; animation:slideUpFade 1s forwards; z-index:100; pointer-events:none; text-shadow:1px 1px 0 #000;`;
                        vfx.innerText = `+${npc.purchasedPrice}G`; npcContainer.appendChild(vfx); setTimeout(() => vfx.remove(), 1000);

                        if (npc.isFriend && typeof window.sendFoodEffectToFriend === 'function') {
                            window.sendFoodEffectToFriend(npc.friendId, npc.friendName, npc.purchasedItemId, npc.purchasedPrice);
                        }

                    } else {
                        s.reputation = Math.max(0, s.reputation - (npc.isRegular ? 5 : 3));
                        npc.msg = npc.isFriend ? `うーん...ちょっと微妙かも...` : `なんだこれ...まずい！金返せ！`; 
                        npc.msgColor = "#ff5252";
                        
                        if (s.reputation <= 0) return window.triggerBankrupt(building);
                    }
                    
                    npc.state = 'leaving';
                    npc.targetX = -100;
                    npc.targetSeat = null; 
                    window.updateShopUIData(building);
                }
            }
            else if (npc.state === 'leaving') {
                npc.x += (npc.targetX - npc.x) * 0.1;
                if (npc.x < -50) { window.shopNPCs.splice(i, 1); continue; }
            }
            
            const conf = (typeof aiConfigs !== 'undefined') ? aiConfigs[npc.skin] : null;
            if (conf) {
                let npcAction = 'idle';
                if (npc.state === 'entering' || npc.state === 'leaving' || npc.state === 'moving_to_seat') npcAction = 'walk';
                else if (npc.state === 'eating') npcAction = 'eat_dish';

                let frame = null;
                if (conf.actions && conf.actions[npcAction]) frame = conf.actions[npcAction][0]; 
                else if (conf.actions && conf.actions.idle) frame = conf.actions.idle[0]; 

                if (frame) {
                    let imgKey = npc.skin || 'robot'; 
                    if (conf.img) imgKey = conf.img;
                    if (conf.actionImages && conf.actionImages[npcAction]) imgKey = conf.actionImages[npcAction]; 
                    else if (frame.img) imgKey = frame.img;

                    let imgUrl = 'characters.png'; 
                    if (typeof images !== 'undefined' && images[imgKey] && images[imgKey].src) imgUrl = images[imgKey].src; 
                    else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) imgUrl = window.dynamicImageCatalog[imgKey]; 
                    else if (typeof imageSources !== 'undefined' && imageSources[imgKey]) imgUrl = imageSources[imgKey]; 
                    
                    let sScale = conf.scale || 0.25; 
                    if (['robot', 'magician', 'spirit'].some(k => npc.skin.includes(k))) sScale *= 1.8; 

                    let sw = frame.sw || 300; let sh = frame.sh || 300; let sx = frame.sx || 0; let sy = frame.sy || 0;
                    let flipX = (npc.targetX < 0) ? -1 : 1;
                    
                    let bgStyle = `position:absolute; left:-${sw/2}px; top:-${sh}px; width:${sw}px; height:${sh}px; background-image:url('${imgUrl}'); background-position:-${sx}px -${sy}px; background-repeat:no-repeat; transform:scaleX(${flipX});`;
                    let npcMsgTop = Math.floor(sh * sScale) + 15;

                    html += `
                        <div style="position:absolute; left:${npc.x}px; top:${npc.y}px; transition:none; z-index:${Math.floor(npc.y)};">
                            <div style="position:relative; transform:scale(${sScale});">
                                <div style="${bgStyle}"></div>
                            </div>
                            ${npc.isFriend ? `<div style="position:absolute; top:-${npcMsgTop + 20}px; left:0; transform:translateX(-50%); font-size:12px; background:#E040FB; color:#fff; padding:2px 6px; border-radius:4px; white-space:nowrap; border:1px solid #FFF; z-index:101; pointer-events:none;">${npc.friendName}</div>` : ''}
                            ${npc.isRegular && !npc.isFriend ? `<div style="position:absolute; top:-${npcMsgTop + 20}px; left:0; transform:translateX(-50%); font-size:16px; text-shadow:0 0 3px #000;">🌟</div>` : ''}
                            ${npc.msg ? `<div style="position:absolute; top:-${npcMsgTop}px; left:0; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:${npc.msgColor}; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:bold; white-space:nowrap; border:2px solid ${npc.msgColor}; box-shadow:0 4px 6px rgba(0,0,0,0.5); z-index:100; pointer-events:none;">${npc.msg}</div>` : ''}
                        </div>
                    `;
                }
            }
        }
        
        let oldElements = Array.from(npcContainer.children).filter(c => c.style.animation);
        npcContainer.innerHTML = html; oldElements.forEach(c => npcContainer.appendChild(c));
        
    }, 100); 
};

window.closeShopUI = function() {
    if (window.shopSimInterval) clearInterval(window.shopSimInterval); 
    const ui = document.getElementById('shop-management-ui');
    if (ui) ui.style.display = 'none';
};

window.exitShopManagement = function() {
    window.closeShopUI();
    if (window.aiPet) {
        if (typeof window.clearSchedule === 'function') window.clearSchedule();
        window.aiPet.actionState = 'exiting';
        window.aiPet.isIndoors = false;
        window.aiPet.indoorTarget = null;
        window.aiPet.message = "今日の営業はここまで！";
        window.aiPet.messageTimer = 180;
    }
};

window.closeBankruptUI = function(bId) {
    let ui = document.getElementById('bankrupt-ui');
    if (ui) ui.remove();
    
    window.closeShopUI(); 
    if (bId && assets[bId]) delete assets[bId];
    
    if (window.aiPet) {
        window.aiPet.indoorTarget = null;
        window.aiPet.isIndoors = false;
        window.aiPet.actionState = 'idle';
        window.aiPet.visualAction = null;
        window.aiPet.schedule = []; 
        window.aiPet.message = "お店が潰れちゃった...";
        window.aiPet.messageTimer = 200;
        
        window.aiPet.stats.mood = Math.max(0, window.aiPet.stats.mood - 30);
        window.aiPet.energy = Math.max(0, window.aiPet.energy - 20);
        if (typeof addFloatingText === 'function') addFloatingText(window.aiPet.x, window.aiPet.y - 40, "ショック！", "#8e24aa");
    }
    if (typeof saveGameData === 'function') saveGameData();
};

// ==========================================
// 🛡️ セーブデータ保護機構（他人の島での誤上書き防止）
// ==========================================
if (typeof window.originalSaveGameData === 'undefined' && typeof saveGameData === 'function') {
    window.originalSaveGameData = saveGameData;
    // セーブ関数を乗っ取り、訪問中なら強制ブロックする
    window.saveGameData = function() {
        if (typeof currentMode !== 'undefined' && currentMode === 'visit') {
            console.log("✈️ 訪問中のためセーブをブロックしました（データ保護）");
            return;
        }
        return window.originalSaveGameData();
    };
}

// ==========================================
// ✈️ 島訪問システム（最強のデータ保護＆完全復帰版）
// ==========================================
window.myIslandBackupLS = null; // ローカルストレージ丸ごと退避用

window.visitPlayerIsland = async function(playerId, playerName) {
    if (playerId === localStorage.getItem('my_player_id')) {
        alert("ここは自分の島です！");
        return;
    }
    
    // 出発前に自分の島を完全にセーブ
    if(typeof window.originalSaveGameData === 'function') window.originalSaveGameData();

    // ★追加：ブラウザのセーブデータ（ローカルストレージ）を丸ごと退避させる最強のバックアップ
    let lsBackup = {};
    for(let i=0; i<localStorage.length; i++) {
        let key = localStorage.key(i);
        lsBackup[key] = localStorage.getItem(key);
    }
    window.myIslandBackupLS = lsBackup;

    let friendUI = document.getElementById('friend-list-ui');
    if (friendUI) friendUI.remove();
    let detailArea = document.getElementById('ranking-detail-area');
    if (detailArea) detailArea.style.display = 'none';

    let friendData = await window.fetchPlayerSaveData(playerId);
    if (!friendData) {
        alert("プレイヤーの島データが見つかりませんでした。");
        return;
    }

    try {
        let fAssetsStr = friendData.map_data || friendData.map_assets || "{}";
        let fAssets = JSON.parse(fAssetsStr);
        
        if (typeof assets !== 'undefined') {
            for (let k in assets) delete assets[k];
            Object.assign(assets, fAssets);
        }

        if (friendData.ai_pet_data_v1) {
            let petData = JSON.parse(friendData.ai_pet_data_v1);
            let targetPet = typeof aiPet !== 'undefined' ? aiPet : window.aiPet;
            Object.assign(targetPet, petData);
            targetPet.godMode = true; 
        }

        // ★訪問モードに切り替え（この間、上の保護機構により一切のセーブがブロックされる）
        if (typeof currentMode !== 'undefined') currentMode = 'visit';
        
        window.showReturnUI(playerName);
        
        let targetPet = typeof aiPet !== 'undefined' ? aiPet : window.aiPet;
        if(typeof addFloatingText === 'function') {
            addFloatingText(targetPet.x, targetPet.y - 50, `✈️ ${playerName}の島に到着！`, "#E040FB");
        }

    } catch (e) {
        console.error("島展開エラー", e);
        alert("島の読み込みに失敗しました。");
        window.returnToMyIsland();
    }
};

window.returnToMyIsland = function() {
    if (!window.myIslandBackupLS) return;

    // ★追加：退避しておいた自分自身のセーブデータを、完全に書き戻す
    for (let key in window.myIslandBackupLS) {
        localStorage.setItem(key, window.myIslandBackupLS[key]);
    }

    if (typeof currentMode !== 'undefined') currentMode = 'play';
    window.myIslandBackupLS = null;

    let returnBtn = document.getElementById('return-island-btn');
    if (returnBtn) returnBtn.remove();

    // ★安全第一：メモリに変なデータが残らないよう、ゲームを再読み込みして完全な状態で復帰する
    localStorage.setItem('trigger_fade_in', 'true');
    alert("自分の島に帰還します！\n※安全のため画面を再読み込みします。");
    window.location.reload();
};

window.showReturnUI = function(playerName) {
    let btn = document.getElementById('return-island-btn');
    if (!btn) {
        btn = document.createElement('div');
        btn.id = 'return-island-btn';
        document.body.appendChild(btn);
    }
    btn.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#E040FB; color:#fff; padding:15px 30px; border-radius:30px; font-weight:bold; font-size:18px; cursor:pointer; z-index:90000; box-shadow:0 4px 10px rgba(0,0,0,0.5); border:2px solid #FFF; transition:0.2s;`;
    btn.innerHTML = `✈️ 「${playerName}」の島から帰る`;
    btn.onclick = window.returnToMyIsland;
};

// ==========================================
// ⚖️ 訪問時の行商人システム（相場計算とUI）
// ==========================================

// 需要と供給による相場計算（ホストの在庫数で価格が乱高下する）
window.calculateLocalPrice = function(itemId, hostInventory) {
    let count = hostInventory.filter(i => i === itemId).length;
    let baseValue = (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].value) ? itemCatalog[itemId].value * 4 : 50;
    
    // 【相場変動ルール】
    // 0個: 2.0倍 (超インフレ)
    // 1-2個: 1.5倍 (高需要)
    // 3-5個: 1.0倍 (適正価格)
    // 6-9個: 0.6倍 (値崩れ)
    // 10個以上: 0.2倍 (超デフレ・暴落)
    let multi = 1.0;
    if (count === 0) multi = 2.0;
    else if (count <= 2) multi = 1.5;
    else if (count <= 5) multi = 1.0;
    else if (count <= 9) multi = 0.6;
    else multi = 0.2;
    
    return { price: Math.floor(baseValue * multi), count: count, multi: multi };
};

// 訪問者専用の売却UI
window.openVisitorTradingUI = function(building) {
    // 自分の退避データ（行商人の荷物）を読み込む
    let myRealPet = null;
    if (window.myIslandBackupLS && window.myIslandBackupLS['ai_pet_data_v1']) {
        myRealPet = JSON.parse(window.myIslandBackupLS['ai_pet_data_v1']);
    }
    if (!myRealPet || !myRealPet.inventory) {
        alert("荷物が読み込めません。"); return;
    }

    let isRest = building.type === 'restaurant';
    let typeWord = isRest ? '🍳 レストラン (買取中)' : '🔨 鍛冶屋 (買取中)';
    
    // 自分の荷物の中から、この店に売れるものをピックアップ
    let sellableItems = [];
    myRealPet.inventory.forEach(i => {
        let c = typeof itemCatalog !== 'undefined' ? itemCatalog[i] : null;
        if (isRest && c && (c.type === 'dish' || c.type === 'food' || c.type === 'ingredient')) sellableItems.push(i);
        else if (!isRest && (i.startsWith('item_sword') || i.startsWith('item_shield') || i === 'iron' || i === 'wood' || i === 'stone' || (c && c.type === 'tool'))) sellableItems.push(i);
    });

    // アイテムの種類ごとにまとめる
    let uniqueItems = [...new Set(sellableItems)];
    
    let html = `
        <div style="background: linear-gradient(135deg, #1a1a1a, #111); padding:20px; border-radius:12px; border:2px solid #00BCD4; width:500px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px;">
                <h2 style="margin:0; color:#00BCD4; font-size:22px;">⚖️ 行商人モード: ${typeWord}</h2>
                <button onclick="document.getElementById('visitor-trading-ui').remove()" style="background:transparent; border:none; color:#aaa; font-size:24px; cursor:pointer;">×</button>
            </div>
            
            <div style="display:flex; justify-content:space-between; background:#222; padding:10px 15px; border-radius:8px; margin-bottom:15px;">
                <span>あなたの所持金:</span>
                <span style="color:#FFD700; font-weight:bold; font-size:18px;" id="visitor-current-gold">${myRealPet.gold || 0} G</span>
            </div>
            
            <div style="max-height:350px; overflow-y:auto; padding-right:5px;">
    `;

    if (uniqueItems.length === 0) {
        html += `<div style="text-align:center; padding:30px; color:#aaa;">このお店に売れるアイテムを持っていません。</div>`;
    } else {
        uniqueItems.forEach(itemId => {
            let itemName = window.getDisplayShopItemName(itemId);
            let myCount = sellableItems.filter(i => i === itemId).length;
            
            // 相場計算（ホストのAIペットの在庫を見る）
            let marketData = window.calculateLocalPrice(itemId, window.aiPet.inventory || []);
            
            let trendIcon = "➖"; let trendColor = "#FFF";
            if (marketData.multi >= 1.5) { trendIcon = "🔥超高騰"; trendColor = "#ff5252"; }
            else if (marketData.multi === 1.0) { trendIcon = "➖安定"; trendColor = "#4CAF50"; }
            else if (marketData.multi <= 0.6) { trendIcon = "📉暴落中"; trendColor = "#00BCD4"; }

            html += `
                <div style="background:#222; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:bold; font-size:16px;">${itemName} <span style="font-size:12px; color:#888;">(所持: ${myCount}個)</span></div>
                        <div style="font-size:11px; color:#aaa; margin-top:4px;">島の在庫: ${marketData.count}個 / 相場: <span style="color:${trendColor}; font-weight:bold;">${trendIcon}</span></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="font-size:20px; font-weight:bold; color:#FFD700;">${marketData.price} G</div>
                        <button onclick="window.executeSellToHost('${itemId}', ${marketData.price})" style="padding:8px 15px; background:#00BCD4; color:#000; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">売る</button>
                    </div>
                </div>
            `;
        });
    }

    html += `</div></div>`;
    
    let ui = document.getElementById('visitor-trading-ui');
    if (ui) ui.remove();
    ui = document.createElement('div');
    ui.id = 'visitor-trading-ui';
    ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:90000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
    ui.innerHTML = html;
    document.body.appendChild(ui);
};

// 実際にアイテムを相手の島に売りつける処理
window.executeSellToHost = function(itemId, price) {
    let hostId = localStorage.getItem('visiting_player_id'); 
    let myName = localStorage.getItem('my_player_name') || "名無し";
    
    // 自分の退避データを更新
    let myRealPet = JSON.parse(window.myIslandBackupLS['ai_pet_data_v1']);
    let idx = myRealPet.inventory.indexOf(itemId);
    
    if (idx > -1) {
        // 自分の荷物から減らして、お金を増やす
        myRealPet.inventory.splice(idx, 1);
        myRealPet.gold = (myRealPet.gold || 0) + price;
        window.myIslandBackupLS['ai_pet_data_v1'] = JSON.stringify(myRealPet);

        // 画面上（ホストのAI）の在庫に直接追加してあげる（演出用）
        if (!window.aiPet.inventory) window.aiPet.inventory = [];
        window.aiPet.inventory.push(itemId);
        window.aiPet.gold -= price; // 画面上のホストの所持金も減らす

        // クラウドの相手の郵便受けに取引記録を送信する（これが本命の処理）
        if (typeof window.sendTradeToHost === 'function') {
            window.sendTradeToHost(hostId, myName, itemId, price);
        }

        // UIを更新
        let goldEl = document.getElementById('visitor-current-gold');
        if (goldEl) goldEl.innerText = `${myRealPet.gold} G`;
        
        let itemName = window.getDisplayShopItemName(itemId);
        alert(`相手の島に「${itemName}」を ${price}G で売却しました！`);
        
        // 画面を再描画して相場を変動させる
        let building = null; // 現在アクセス中の建物を再取得
        for (let k in assets) { if (assets[k].shopData && (assets[k].type === 'restaurant' || assets[k].type === 'smith')) { building = assets[k]; break; } }
        if (building) window.openVisitorTradingUI(building);
    }
};

// ★追記：訪問時に相手のIDを記録しておく
const originalVisit = window.visitPlayerIsland;
window.visitPlayerIsland = async function(playerId, playerName) {
    localStorage.setItem('visiting_player_id', playerId);
    await originalVisit(playerId, playerName);
};

// ==========================================
// 🏪 ショップ機能（相場計算とオーナー用掲示板）
// ==========================================

// ショップの相場を計算する関数
window.calculateShopPrice = function(itemId, shopData) {
    if (!shopData) return { price: 50, multi: 1.0, trendCount: 0 };
    if (!shopData.marketTrend) shopData.marketTrend = {};
    
    // 相場は「実際の在庫」ではなく、他人が取引した「marketTrend（流通スコア）」で決まる
    let count = shopData.marketTrend[itemId] || 0; 
    let baseValue = (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].value) ? itemCatalog[itemId].value * 4 : 50;
    
    let multi = 1.0;
    if (count === 0) multi = 2.0;
    else if (count <= 2) multi = 1.5;
    else if (count <= 5) multi = 1.0;
    else if (count <= 9) multi = 0.6;
    else multi = 0.2;
    
    return { price: Math.floor(baseValue * multi), multi: multi, trendCount: count };
};

// ==========================================
// 🩹 師匠消失＆空クエストHUD表示バグ 修正パッチ (UI側)
// ==========================================

// 1. 空のHUDが出ないようにする自己修復機能
// const _originalUpdateQuestHUD = window.updateQuestHUD;
// window.updateQuestHUD = function() {
//     // 異常な空クエストデータが残っていたら、自動的に削除して修復する
//     if (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.activeQuest) {
//         if (!window.aiPet.apprentice.activeQuest.name) {
//             window.aiPet.apprentice.activeQuest = null;
//         }
//     }
//     _originalUpdateQuestHUD();
// };

// 2. クエストのキャンセル処理とセーブ処理の完全化
// window.confirmEncounter = function(isAccept) {
//     // ★追加：ダイアログを閉じる際に立ち絵をスッと消去する
//     const hideMasterImg = () => {
//         let masterImgBox = document.getElementById('encounter-master-img');
//         if (masterImgBox) {
//             masterImgBox.style.opacity = '0';
//             masterImgBox.style.transform = 'translateX(30px)';
//         }
//     };
//     hideMasterImg();

//     if (currentEncounterMode === 'encounter_intro') {
//         const mType = currentEncounterMaster;
//         const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
//         let isMastered = hero.apprentice && ((hero.apprentice.retired && hero.apprentice.retired[mType]) || (hero.apprentice.rank && hero.apprentice.rank[mType] >= 10));
        
//         let greetingMsg = "";
        
//         // ★修正：師匠ごとの口調に合わせた顔見せ時のセリフ
//         if (isMastered) {
//             if (mType === 'explore') greetingMsg = "「あら！あなたはあの時の...いや、違う子ね。でもその身のこなし、既に免許皆伝の域じゃない！いつでも遊びにいらっしゃい！」";
//             else if (mType === 'farming') greetingMsg = "「おや！君はあの時の...いや、違う子か。だがその構え、既に免許皆伝の域だね。いつでも遊びにおいで。」";
//             else if (mType === 'fishing') greetingMsg = "「おお！お前さんはあの時の...いや、違うか。だがその構え、既に免許皆伝の域だな！いつでも遊びに来な！」";
//             else if (mType === 'cooking') greetingMsg = "「おお！君はあの時の...いや、違うな！だがその構え、既に免許皆伝の域だ！いつでも飯を食いに来い！」";
//             else if (mType === 'smithing') greetingMsg = "「……お前はあの時の……いや、違うか。だがその構え、既に免許皆伝の域。……いつでも火にあたりに来い。」";
//             else if (mType === 'building') greetingMsg = "「おっ。君はあの時の...いや、違う子か。だがその構え、既に免許皆伝の域だな。いつでも見学に来てくれ。」";
//         } else {
//             if (mType === 'explore') greetingMsg = "「この周辺をキャンプ地にしようと思うの。準備ができたらまたいらっしゃい！」";
//             else if (mType === 'farming') greetingMsg = "「この辺りに畑を作ろうと思ってね。準備ができたらまたおいで。」";
//             else if (mType === 'fishing') greetingMsg = "「この辺りを釣り場にするぜ。準備ができたらまた来な！」";
//             else if (mType === 'cooking') greetingMsg = "「この辺りで屋台を開くぞ！準備ができたらまた来な！」";
//             else if (mType === 'smithing') greetingMsg = "「……この辺りに炉を構える。準備ができたら来い。」";
//             else if (mType === 'building') greetingMsg = "「この辺りを拠点にする。準備ができたらまた来てくれ。」";
//         }

//         window.openEncounterUI(mType, greetingMsg, 'greeting');
//         return; 
//     }
    
//     if (currentEncounterMode === 'greeting') {
//         const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
//         const mType = currentEncounterMaster;
        
//         if (!hero.apprentice.metMasters) hero.apprentice.metMasters = [];
//         if (!hero.apprentice.metMasters.includes(mType)) hero.apprentice.metMasters.push(mType);

//         // 川を越えない安全な場所に拠点を配置するロジック
//         let tx = hero.x, ty = hero.y;
//         for(let i = 0; i < 100; i++) {
//             let cx = 50 + Math.random() * 700; let cy = 50 + Math.random() * 380;
//             // 川判定を避け、かつ水の上でない座標を探す
//             if (typeof hero.isWaterBetween === 'function' && !hero.isWaterBetween(hero.x, hero.y, cx, cy) && !hero.isPointOnWater(cx, cy)) {
//                 tx = cx; ty = cy; break;
//             }
//         }
        
//         let campId = mType + '_master_camp_' + Date.now();
//         let cType = 'tent'; let cName = '師匠のテント';
//         let isMasterShop = false; // ★修正
        
//         if (mType === 'smithing') { cType = 'blacksmith'; cName = '鍛冶師のキャンプ'; }
//         else if (mType === 'building') { cType = 'palms'; cName = '建築士のテント'; }
//         else if (mType === 'cooking') { 
//             cType = null; // ★新規作成はしない！
//             // 既存のレストランを探して、師匠の店として看板を掛け替える
//             for (let k in assets) {
//                 if (assets[k].type === 'restaurant') {
//                     assets[k].name = '料理人のレストラン';
//                     assets[k].isMasterShop = true; // 師匠フラグを付与
//                     break;
//                 }
//             }
//         }
//         else if (mType === 'fishing') { cType = 'tent'; cName = '漁師の小屋'; }
//         else if (mType === 'explore') { cType = 'tent'; cName = '冒険家のキャンプ'; }
//         else if (mType === 'farming') { 
//             cType = null; // ★新規作成はしない
//             // 既存の畑を探して、師匠の畑として名前を上書きする
//             for (let k in assets) {
//                 if (assets[k].type === 'farm') {
//                     assets[k].name = '農家の畑';
//                     assets[k].isMasterShop = true; // 師匠フラグを付与
//                     break;
//                 }
//             }
//         }
        
//         // cTypeがnull(既存店を再利用した)場合は新規アセットを作らない
//         if (cType && typeof assets !== 'undefined') {
//             assets[campId] = { type: cType, name: cName, dx: tx, dy: ty, sw: 100, sh: 100, scale: 0.6, isMasterShop: isMasterShop };
//         }

//         const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
//         const mName = masterNames[mType];
        
//         // この言葉を覚えることで、仕様上自動で「記憶容量（getMaxVocabulary）」が+1されます
//         if (!hero.apprentice.learnedWords.includes(mName)) {
//             hero.apprentice.learnedWords.push(mName);
//             setTimeout(() => {
//                 hero.message = `「${mName}」という言葉を覚えた！\n（チャットで呼びかけて会いに行こう）`; hero.messageTimer = 180;
//                 if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 60, "言葉を学習した！", "#FF9800");
//                 if (typeof updateCommandHUD === 'function') updateCommandHUD();
//             }, 1000); 
//         }
        
//         if (typeof saveGameData === 'function') saveGameData();
//         document.getElementById('encounterOverlay').classList.remove('active');
//         window.isGamePaused = false;
//         currentEncounterMaster = null; currentEncounterMode = '';
//         return;
//     }

//     document.getElementById('encounterOverlay').classList.remove('active');
//     window.isGamePaused = false;
    
//     const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
//     if (!hero) return;

//     const mType = currentEncounterMaster;
    
//     if (currentEncounterMode === 'encounter') {
//         if (isAccept) {
//             hero.applyApprenticeship(mType);
//             hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => !(q.masterType === mType && q.rank === 0));
//             if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
//         }
//         else { hero.message = "立ち去った..."; hero.messageTimer = 120; }
//     } 
//     // ★追加：入門試験課題の受注
//     else if (currentEncounterMode === 'quest_offer_exam') {
//         if (isAccept) {
//             const qData = hero.getMasterQuestData(mType, 0);
//             hero.apprentice.activeQuests.push({ name: qData.name, desc: qData.desc, rank: 0, masterType: mType, qVal: 0 });
//             hero.message = "入門試験の課題を受けた！言葉を覚えよう！"; hero.messageTimer = 120;
//             if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
//             if (typeof saveGameData === 'function') saveGameData(); 
//         } else {
//             hero.message = "今はやめておこう..."; hero.messageTimer = 120;
//         }
//     }
//     else if (currentEncounterMode === 'quest_offer') {
//         if (isAccept) {
//             const rank = hero.apprentice.rank[mType] || 1;
//             const qData = hero.getMasterQuestData(mType, rank);
//             qData.setup(); 
            
//             // ★修正：qVal を 0 ではなく、setup() で計算された正しい目標値をセットする！
//             let initialQVal = hero.apprentice.qVal !== undefined ? hero.apprentice.qVal : 0;
//             hero.apprentice.activeQuests.push({ name: qData.name, desc: qData.desc, rank: rank, masterType: mType, qVal: initialQVal });
//             hero.apprentice.questAcceptedAge = hero.age || 0;
//             hero.apprentice.lazyReportCount = 0;

//             hero.message = "課題を受けた！頑張ろう！"; hero.messageTimer = 120;
//         } else {
//             hero.message = "今はやめておこう..."; hero.messageTimer = 120;
//         }
//         if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
//         if (typeof saveGameData === 'function') saveGameData(); 
//     }
//     else if (currentEncounterMode === 'quest_not_clear') {
//         hero.message = "引き続き課題を頑張ろう..."; hero.messageTimer = 120;
//     }
//     else if (currentEncounterMode === 'exam_pass') {
//         hero.apprentice.currentMaster = mType;
//         hero.apprentice.rank[mType] = 1;
//         hero.apprentice.activeQuest = null; // ★過去のバグデータを消去
        
//         // ★追加：誰かに弟子入りした瞬間、受けていたすべての「入門試験（ランク0）」を破棄する！
//         if (hero.apprentice.activeQuests) {
//             hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => q.rank !== 0);
//         }
        
//         const masterNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
//         const mName = masterNames[mType];
//         const wordsToLearn = [mName, "クエスト", "課題"];
//         let newlyLearned = []; 
//         wordsToLearn.forEach(w => {
//             if (!hero.apprentice.learnedWords.includes(w)) {
//                 hero.apprentice.learnedWords.push(w); newlyLearned.push(w);
//             }
//         });
//         if (newlyLearned.length > 0) {
//             setTimeout(() => {
//                 hero.message = `「${newlyLearned.join('、')}」という言葉を覚えた！`; hero.messageTimer = 180;
//                 if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 60, "言葉を学習した！", "#FF9800");
//                 if (typeof updateCommandHUD === 'function') updateCommandHUD();
//             }, 1000); 
//         }
//         if (typeof saveGameData === 'function') saveGameData();
//     }
//     else if (currentEncounterMode === 'rank_up') {
//         hero.apprentice.rank[mType] = (hero.apprentice.rank[mType] || 1) + 1;
//         hero.apprentice.activeQuest = null; 
//         if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
//         if (typeof saveGameData === 'function') saveGameData(); // 確実なセーブ
//     }
//     else if (currentEncounterMode === 'graduate') {
//         hero.apprentice.successCount = 0; hero.apprentice.rank[mType] = 10;
//         hero.apprentice.isGraduated = true; hero.apprentice.currentMaster = null;
//         hero.apprentice.activeQuest = null; 
        
//         if (mType === 'farming') { hero.apprentice.title = "農業マスター"; hero.stats.power += 50; }
//         else if (mType === 'cooking') { hero.apprentice.title = "三ツ星シェフ"; hero.skills.cooking = 20; hero.stats.intel += 50; }
//         else if (mType === 'smithing') { hero.apprentice.title = "伝説の鍛冶屋"; hero.skills.smithing = 20; hero.stats.power += 25; hero.stats.intel += 25; }
//         else if (mType === 'explore') { hero.apprentice.title = "大冒険家"; hero.stats.power += 50; hero.stats.mood += 50; hero.inventory.push('crystal'); }
//         else if (mType === 'fishing') { hero.apprentice.title = "伝説の漁師"; hero.stats.power += 25; hero.stats.intel += 25; if(typeof itemCatalog !== 'undefined' && itemCatalog['rod_super']) hero.inventory.push('rod_super'); }
//         else if (mType === 'building') { hero.apprentice.title = "一流建築士"; hero.skills.building = 20; hero.stats.power += 30; hero.stats.intel += 30; }

//         if (typeof updateStatUI === 'function') updateStatUI();
//         if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD(); 
//         if (typeof saveGameData === 'function') saveGameData();

//         if (typeof hero.determineLifePath === 'function') {
//             const chosenPath = hero.determineLifePath();
//             setTimeout(() => {
//                 if (typeof window.showLifePathEvent === 'function') window.showLifePathEvent(hero, chosenPath);
//             }, 800);
//         }
//     }
//     else if (currentEncounterMode === 'excommunicate') {
//         hero.apprentice.isExcommunicated = true; 
//         hero.apprentice.excommunicatedFrom = mType; 
//         hero.apprentice.exileTrainingCount = 0; 
//         hero.apprentice.currentMaster = null; 
//         hero.apprentice.activeQuests = hero.apprentice.activeQuests.filter(q => q.masterType !== mType);
//         if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
//         if (typeof saveGameData === 'function') saveGameData();
//     }
//     else if (currentEncounterMode === 'retire') {
//         hero.apprentice.retired = hero.apprentice.retired || {};
//         hero.apprentice.retired[mType] = true;
//         if (mType === 'farming') { for (let k in assets) { if (assets[k].type === 'farm') { delete assets[k]; break; } } }
//         // ★修正：引退してもレストランの建物自体は消さずに残しておく
//         if (typeof saveGameData === 'function') saveGameData();
//     }
//     currentEncounterMaster = null; currentEncounterMode = '';
// };

// ==========================================
// 🃏 TCGカード獲得演出＆アンロックシステム（HPバグ修正版）
// ==========================================
window.unlockSupportCard = function(cardId, generation) {
    if (!window.TCG) window.TCG = { myCollection: [], decks: [[]] };
    if (!window.TCG.myCollection) window.TCG.myCollection = [];
    
    // ① マスターデータの存在チェック
    let masterData = null;
    if (typeof window.TCG_MASTER !== 'undefined') {
        masterData = window.TCG_MASTER[cardId];
    }
    if (!masterData || !['item', 'action', 'field'].includes(masterData.type)) return;

    // ② 世代ごとの獲得履歴をチェック
    let historyKey = 'unlocked_cards_gen_' + generation;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    if (history.includes(cardId)) return; 
    
    history.push(cardId);
    localStorage.setItem(historyKey, JSON.stringify(history));

    // ③ 世代に応じたスケーリング（強化）計算
    let bonusLevel = Math.max(0, parseInt(generation) - 1); 
    
    // ▼▼▼ 修正：HPバフは「フィールドカード」専用にする！ ▼▼▼
    let enhancedHp = masterData.baseHp;
    if (masterData.type === 'field') {
        enhancedHp += (bonusLevel * 10);
    }
    // ▲▲▲ 修正おわり（アイテム等は baseHp=0 のままになる） ▲▲▲

    let enhancedDmg = masterData.baseDmg > 0 ? masterData.baseDmg + (bonusLevel * 2) : 0;
    
    let costReduction = Math.floor(bonusLevel / 10);
    let enhancedCost = Math.max(0, masterData.baseCost - costReduction);

    let cardName = masterData.name;
    if (bonusLevel > 0) cardName += ` +${bonusLevel}`;

    // ④ コレクションに追加
    const newCard = {
        uid: 'card_' + Date.now() + Math.floor(Math.random()*1000),
        masterId: cardId,
        name: cardName,
        type: masterData.type,
        cost: enhancedCost,
        hp: enhancedHp,
        maxHp: enhancedHp,
        skillName: masterData.skillName,
        skillCost: masterData.skillCost,
        damage: enhancedDmg,
        ability: masterData.ability,
        image: masterData.image,
        imageIndex: masterData.imageIndex,
        sx: masterData.sx, sy: masterData.sy, sw: masterData.sw, sh: masterData.sh,
        scaleX: masterData.scaleX, scaleY: masterData.scaleY
    };
    
    window.TCG.myCollection.push(newCard);
    if (typeof saveGameData === 'function') saveGameData();

    // ⑤ 画面にカード獲得演出を表示（★思い出/カードのテキスト分岐を復活！）
    if (typeof window.showCardUnlockPopup === 'function') {
        // 現在の所持枚数をチェックして、60枚未満なら「思い出」扱いにする
        const isUnlocked = window.TCG.myCollection.length >= 60;
        let msg = "";

        if (isUnlocked) {
            // TCG解放後（カードとして認識）
            msg = bonusLevel > 0 
                ? `✨ 第${generation}世代 ボーナス強化適用カードを獲得！ ✨`
                : `✨ 新しいサポートカードのアイデアをひらめいた！ ✨`;
        } else {
            // TCG未解放時（思い出として記録）
            msg = bonusLevel > 0 
                ? `✨ 第${generation}世代 強化された特別な思い出を記録！ ✨`
                : `✨ AIとの新しい思い出がアルバムに追加された！ ✨`;
        }
        
        window.showCardUnlockPopup(newCard, msg);
    } else if (typeof window.showGameTutorial === 'function') {
        const isUnlocked = window.TCG.myCollection.length >= 60;
        const title = isUnlocked ? "🃏 カード獲得！" : "📖 思い出を記録！";
        const desc = isUnlocked ? `${cardName} を手に入れた！` : `${cardName} の思い出を記録した！`;
        window.showGameTutorial(title, desc);
    }

    // ボタンの表示（偽装）を更新
    if (typeof window.updateTcgButtonAppearance === 'function') window.updateTcgButtonAppearance();
};

// AIの頭脳側に、アイテムを拾った時のカード化チェック処理を復活
if (typeof window.AICharacter !== 'undefined') {
    window.AICharacter.prototype.checkItemCardUnlock = function(itemKey) {
        const map = {
            'wood': 'item_card_wood',
            'stone': 'item_card_stone',
            'iron': 'item_card_iron',
            'item_berry': 'item_card_berry',
            'crystal': 'item_card_crystal'
        };
        if (map[itemKey] && typeof window.unlockSupportCard === 'function') {
            window.unlockSupportCard(map[itemKey], this.generation || 1, 'アイテム');
        }
    };
} else if (typeof window.aiPet !== 'undefined') {
    window.aiPet.checkItemCardUnlock = function(itemKey) {
        const map = {
            'wood': 'item_card_wood',
            'stone': 'item_card_stone',
            'iron': 'item_card_iron',
            'item_berry': 'item_card_berry',
            'crystal': 'item_card_crystal'
        };
        if (map[itemKey] && typeof window.unlockSupportCard === 'function') {
            window.unlockSupportCard(map[itemKey], this.generation || 1, 'アイテム');
        }
    };
}

// ==========================================
// 🃏 AIの記憶カード化システム（転生時の演出 復元パッチ）
// ==========================================
if (typeof window.generateCardFromAI !== 'function') {
    window.generateCardFromAI = function(ai) {
        if (!window.TCG) window.TCG = { myCollection: [], decks: [[]] };
        if (!window.TCG.myCollection) window.TCG.myCollection = [];
        
        let generatedCards = [];
        
        // 成長（ステータス）に応じたカードを付与
        if (ai.stats.power >= 50) generatedCards.push({ id: 'support_power', name: 'みなぎる活力', type: 'アクション' });
        if (ai.stats.intel >= 50) generatedCards.push({ id: 'support_intel', name: '深淵なる叡智', type: 'アクション' });
        if (ai.stats.beauty >= 50) generatedCards.push({ id: 'support_beauty', name: '圧倒的な美', type: 'アクション' });
        
        // 職業マスター（免許皆伝）のカード
        if (ai.apprentice && ai.apprentice.isGraduated && ai.apprentice.retired) {
            const jobNames = { 'explore':'冒険家', 'farming':'農家', 'fishing':'漁師', 'cooking':'料理人', 'smithing':'鍛冶師', 'building':'建築士' };
            for (let job in ai.apprentice.retired) {
                if (jobNames[job]) {
                    generatedCards.push({ id: `support_master_${job}`, name: `${jobNames[job]}の極意`, type: 'アクション' });
                }
            }
        }

        // 何も条件を満たしていなくても、最低1枚は生きた証として付与
        if (generatedCards.length === 0) {
            generatedCards.push({ id: 'support_memory', name: '前世の記憶', type: 'アクション' });
        }

        let htmlText = "";
        generatedCards.forEach(c => {
            htmlText += `<div style="font-size:18px; color:#FFD700; margin:8px 0; font-weight:bold;">✨ ${c.name}</div>`;
            window.TCG.myCollection.push({
                uid: 'card_' + Date.now() + Math.floor(Math.random()*1000),
                masterId: c.id,
                name: c.name,
                type: c.type
            });
        });
        
        if (typeof saveGameData === 'function') saveGameData();

        // ポップアップで感動のカード化演出を表示！
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial(
                "🃏 記憶のカード化",
                `生涯を終えたAIの経験が、TCGのカードとして具現化しました！<br><br>${htmlText}<br><span style="font-size:12px; color:#aaa;">（これらのカードはTCGメニューから確認・編成できます）</span>`
            );
        }
    };
}

// ==========================================
// 🩹 設計図ボタン＆UI文言の表示制限パッチ（皆伝バグ修正版）
// ==========================================

// 1. 1秒ごとに「設計図」ボタンの表示状態を監視・制御する
if (window._builderBtnCheckInterval) clearInterval(window._builderBtnCheckInterval);

window._builderBtnCheckInterval = setInterval(() => {
    if (!window.aiPet) return;
    
    // ★修正：皆伝すると currentMaster が外れるため、rank >= 10 の判定を追加！
    let isBuilder = window.aiPet.apprentice && 
                   (window.aiPet.apprentice.currentMaster === 'building' || 
                   (window.aiPet.apprentice.retired && window.aiPet.apprentice.retired['building']) ||
                   (window.aiPet.apprentice.rank && window.aiPet.apprentice.rank['building'] >= 10));
    
    // 画面内の「設計図」と書かれたボタンを探して、条件に合わせて隠す/表示する
    document.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.includes('設計図')) {
            if (!isBuilder) {
                btn.style.display = 'none'; // 弟子入り前・関係ない職の時は隠す
            } else {
                if (btn.style.display === 'none') btn.style.display = ''; // 建築士になったら表示
            }
        }
    });
}, 1000);

// 2. 設計図を開く際に、皆伝前なら上の余計な説明文を自動で消去する
const _originalOpenBuildRecipe = window.openBuildRecipe;
window.openBuildRecipe = function() {
    const overlay = document.getElementById('buildRecipeOverlay');
    if (overlay) {
        let ai = window.aiPet;
        let isMaster = ai && ai.apprentice && (
            (ai.apprentice.retired && ai.apprentice.retired['building']) ||
            (ai.apprentice.currentMaster === 'building' && ai.apprentice.isGraduated) ||
            (ai.apprentice.rank && ai.apprentice.rank['building'] >= 10)
        );

        const walk = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            if (node.nodeValue.includes("ランクに応じて作れる施設が増えます") || 
                node.nodeValue.includes("作成する場合は、チャットで")) {
                if (node.parentElement) {
                    node.parentElement.style.display = isMaster ? '' : 'none';
                }
            }
        }
    }
    
    if (typeof _originalOpenBuildRecipe === 'function') {
        _originalOpenBuildRecipe();
    } else {
        window.renderBuildRecipe();
        if (overlay) overlay.classList.add('active');
    }
};

// ==========================================
// 🏪 ショップ完全自動化＆おつかいシステムパッチ
// ==========================================

window.executeAutoTrade = function(building) {
    let ai = window.aiPet;
    let s = building.shopData;
    if (!s) { s = { inventory: {}, marketTrend: {} }; building.shopData = s; }
    if (!s.inventory) s.inventory = {};
    if (!s.marketTrend) s.marketTrend = {};

    let intel = ai.stats.intel || 10;
    let getMarketPrice = (itemId) => { return typeof window.calculateShopPrice === 'function' ? window.calculateShopPrice(itemId, s) : {price: 50, multi: 1.0}; };

    let isVisiting = typeof currentMode !== 'undefined' && currentMode === 'visit';
    let myRealPet = isVisiting ? JSON.parse(window.myIslandBackupLS['ai_pet_data_v1']) : ai;
    let hostId = isVisiting ? localStorage.getItem('visiting_player_id') : null; 
    let myName = localStorage.getItem('my_player_name') || "名無し";
    
    let sellCandidates = [];
    (myRealPet.inventory || []).forEach(i => {
        if (typeof itemCatalog !== 'undefined' && itemCatalog[i]) {
            sellCandidates.push({id: i, market: getMarketPrice(i)});
        }
    });

    let buyCandidates = [];
    Object.keys(s.inventory).forEach(i => { 
        if (s.inventory[i] > 0) buyCandidates.push({id: i, market: getMarketPrice(i)}); 
    });

    let tradeResults = [];
    let tradeTurns = 1 + Math.floor(Math.random() * (intel / 40)); 
    if (tradeTurns > 4) tradeTurns = 4;

    for(let i=0; i<tradeTurns; i++) {
        let action = Math.random() < 0.5 ? 'sell' : 'buy';
        
        if (action === 'sell' && sellCandidates.length > 0) {
            // ★賢いほど高く売れるものを選ぶ！
            sellCandidates.sort((a, b) => (b.market.multi - a.market.multi) + (Math.random()*0.5 - 0.25) * (100/Math.max(1, intel)));
            let pick = sellCandidates[0];
            
            let idx = myRealPet.inventory.indexOf(pick.id);
            if (idx > -1) {
                myRealPet.inventory.splice(idx, 1);
                myRealPet.gold = (myRealPet.gold || 0) + pick.market.price;
                s.inventory[pick.id] = (s.inventory[pick.id] || 0) + 1; 
                
                if (isVisiting) {
                    ai.gold -= pick.market.price; 
                    s.marketTrend[pick.id] = (s.marketTrend[pick.id] || 0) + 1; // 他島なら相場下落
                    if (typeof window.sendTradeToHost === 'function') window.sendTradeToHost(hostId, myName, 'visitor_sell', pick.id, pick.market.price);
                }
                // ★自島なら s.marketTrend を操作しない＝相場変動なし！
                
                let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(pick.id) : pick.id;
                tradeResults.push(`📤 「${itemName}」を ${pick.market.price}G で売却`);
                sellCandidates.shift(); 
            }
        } 
        else if (action === 'buy' && buyCandidates.length > 0) {
            // ★賢いほど安く買えるものを選ぶ！
            buyCandidates.sort((a, b) => (a.market.multi - b.market.multi) + (Math.random()*0.5 - 0.25) * (100/Math.max(1, intel)));
            let pick = buyCandidates[0];
            
            if (myRealPet.gold >= pick.market.price && s.inventory[pick.id] > 0) {
                s.inventory[pick.id]--; 
                myRealPet.gold -= pick.market.price;
                if (!myRealPet.inventory) myRealPet.inventory = [];
                myRealPet.inventory.push(pick.id); 
                
                if (isVisiting) {
                    ai.gold += pick.market.price; 
                    if (s.marketTrend[pick.id] > 0) s.marketTrend[pick.id]--; // 他島なら相場上昇
                    if (typeof window.sendTradeToHost === 'function') window.sendTradeToHost(hostId, myName, 'visitor_buy', pick.id, pick.market.price);
                }
                // ★自島なら s.marketTrend を操作しない＝相場変動なし！

                let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(pick.id) : pick.id;
                tradeResults.push(`📥 「${itemName}」を ${pick.market.price}G で購入`);
                if (s.inventory[pick.id] <= 0) buyCandidates.shift();
            }
        }
    }

    if (isVisiting) window.myIslandBackupLS['ai_pet_data_v1'] = JSON.stringify(myRealPet);
    else if (typeof saveGameData === 'function') saveGameData();

    if (tradeResults.length > 0) {
        ai.message = `おつかい完了！\n` + tradeResults.join('\n');
        ai.messageTimer = 350;
        if (typeof addFloatingText === 'function') addFloatingText(ai.x, ai.y - 60, "取引成功！", "#FFD700");
    } else {
        ai.message = `今回はいい取引がなかったみたい...`;
        ai.messageTimer = 200;
    }
    
    // UI用に結果を一時保存
    window._lastTradeResultsHtml = tradeResults.length > 0 
        ? tradeResults.map(r => `<div style="color:#FFD700; margin-bottom:4px;">${r}</div>`).join('')
        : `<div style="color:#aaa;">（今回はめぼしい取引がありませんでした）</div>`;
        
    if (typeof updateStatUI === 'function') updateStatUI();
};

// ==========================================
// 🏪 ショップ完全自動化＆インタラクティブ演出パッチ（買値・売値 分離版）
// ==========================================

if (typeof window.originalSendChat !== 'undefined') {
    window.sendChat = window.originalSendChat;
}

window.clickShopBuilding = function() {
    alert("💡 プレイヤーは直接取引できません。\nチャットでAIに「ショップ」と指示を出しておつかいさせましょう！");
};

window.openShopUI = function(building) {
    let ai = window.aiPet;
    if (!ai) return;

    let s = building.shopData;
    if (!s) { s = { inventory: {}, marketTrend: {} }; building.shopData = s; }
    if (!s.inventory) s.inventory = {};
    if (!s.marketTrend) s.marketTrend = {};

    let isVisiting = typeof currentMode !== 'undefined' && currentMode === 'visit';
    let myRealPet = isVisiting ? JSON.parse(window.myIslandBackupLS['ai_pet_data_v1']) : ai;
    let hostId = isVisiting ? localStorage.getItem('visiting_player_id') : null; 
    let myName = localStorage.getItem('my_player_name') || "名無し";

    let getMarketPrice = (itemId) => { 
        return typeof window.calculateShopPrice === 'function' ? window.calculateShopPrice(itemId, s) : {price: 50, multi: 1.0, trendCount: 0}; 
    };

    let avatarHtml = "";
    let myConf = (typeof aiConfigs !== 'undefined') ? aiConfigs[ai.currentSkin || ai.baseType || 'robot'] : null;
    if (myConf) {
        let myFrames = (myConf.actions && myConf.actions['idle']) ? myConf.actions['idle'] : null;
        if (myFrames && myFrames.length > 0) {
            let mFrame = myFrames[0];
            let mImgKey = ai.currentSkin || ai.baseType || 'robot';
            if (myConf.img) mImgKey = myConf.img;
            if (mFrame.img) mImgKey = mFrame.img;
            
            let mImgUrl = 'characters.png';
            if (typeof images !== 'undefined' && images[mImgKey] && images[mImgKey].src) mImgUrl = images[mImgKey].src; 
            else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[mImgKey]) mImgUrl = window.dynamicImageCatalog[mImgKey]; 
            else if (typeof imageSources !== 'undefined' && imageSources[mImgKey]) mImgUrl = imageSources[mImgKey]; 

            let sScale = myConf.scale || 0.25; 
            sScale *= 1.5; 
            if (sScale > 0.8) sScale = 0.8;
            
            let sw = mFrame.sw || 300; let sh = mFrame.sh || 300; let sx = mFrame.sx || 0; let sy = mFrame.sy || 0;
            let myBgStyle = `width:${sw}px; height:${sh}px; background-image:url('${mImgUrl}'); background-position:-${sx}px -${sy}px; background-repeat:no-repeat; transform:scale(${sScale}); transform-origin: center center;`;
            avatarHtml = `<div style="display:flex; justify-content:center; align-items:center; width:100%; height:160px; overflow:hidden;"><div style="${myBgStyle}"></div></div>`;
        }
    }

    const renderInventory = () => {
        let counts = {};
        (myRealPet.inventory || []).forEach(i => counts[i] = (counts[i] || 0) + 1);
        let html = "";
        for (let k in counts) {
            let name = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(k) : k;
            html += `<span style="background:#333; padding:4px 8px; border-radius:4px; margin:2px; font-size:11px; border:1px solid #555; display:inline-block;">${name} <span style="color:#FFD700;">x${counts[k]}</span></span>`;
        }
        if (html === "") html = `<span style="color:#888; font-size:11px;">なにも持っていない</span>`;
        return html;
    };

    const renderBoard = () => {
        let allItemIds = new Set([...Object.keys(s.inventory), ...(myRealPet.inventory || [])]);
        let uniqueItems = Array.from(allItemIds).filter(id => (s.inventory[id] || 0) > 0 || (myRealPet.inventory || []).filter(i => i === id).length > 0);
        let html = "";
        
        if (uniqueItems.length === 0) {
            html += `<div style="text-align:center; padding:30px; color:#aaa;">市場に流通しているアイテムがありません。</div>`;
        } else {
            uniqueItems.forEach(itemId => {
                let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(itemId) : itemId;
                let myCount = (myRealPet.inventory || []).filter(i => i === itemId).length;
                let shopCount = s.inventory[itemId] || 0;
                
                let market = getMarketPrice(itemId);
                
                // ★追加：買値と売値（半額）を計算
                let buyPrice = market.price;
                let sellPrice = Math.max(1, Math.floor(market.price * 0.5));

                let trendIcon = "➖ 安定"; let trendColor = "#4CAF50";
                if (market.multi >= 1.5) { trendIcon = "🔥 高騰中"; trendColor = "#ff5252"; }
                else if (market.multi <= 0.6) { trendIcon = "📉 暴落中"; trendColor = "#00BCD4"; }

                html += `
                    <div style="background:#222; padding:10px; margin-bottom:8px; border-radius:8px; border:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:14px; color:#fff;">${itemName}</div>
                            <div style="font-size:10px; color:#aaa; margin-top:2px;">相場: <span style="color:${trendColor}; font-weight:bold;">${trendIcon}</span></div>
                        </div>
                        <div style="text-align:right; margin-right:5px;">
                            <div style="font-size:14px; font-weight:bold; color:#FFD700;">買:${buyPrice}G <span style="color:#aaa;">/</span> 売:${sellPrice}G</div>
                            <div style="font-size:10px; color:#aaa; margin-top:2px;">店在庫: <span style="color:#FFF;">${shopCount}</span> / 所持: <span style="color:#FFF;">${myCount}</span></div>
                        </div>
                    </div>
                `;
            });
        }
        return html;
    };

    let html = `
        <div style="background: linear-gradient(135deg, #1a1a1a, #111); padding:20px; border-radius:12px; border:2px solid #00BCD4; width:650px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8); display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px;">
                <h2 style="margin:0; color:#00BCD4; font-size:22px;">🏪 ローカル取引所</h2>
                <button id="shop-close-btn" onclick="document.getElementById('player-shop-ui').remove(); if(window.aiPet && window.aiPet.indoorTarget && (window.aiPet.indoorTarget.type==='shop' || window.aiPet.indoorTarget.type==='restaurant' || window.aiPet.indoorTarget.type==='smith')){ window.aiPet.actionState = 'exiting'; window.aiPet.isIndoors = false; window.aiPet.indoorTarget = null; window.aiPet.message='お店から出たよ！'; window.aiPet.messageTimer=150; }" style="background:transparent; border:none; color:#aaa; font-size:24px; cursor:pointer; display:none;">×</button>
            </div>
            
            <div style="display:flex; gap:20px; height:380px;">
                <div style="width:220px; display:flex; flex-direction:column; align-items:center; position:relative; background:#111; border-radius:8px; border:1px solid #444; padding:15px; box-sizing:border-box;">
                    <div id="shop-speech-bubble" style="background:rgba(255,255,255,0.9); color:#000; padding:8px 12px; border-radius:8px; font-size:13px; font-weight:bold; position:absolute; top:10px; width:85%; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.5); z-index:10; border:2px solid #aaa; transition:all 0.3s; opacity:0; transform:translateY(10px);">
                        ...
                    </div>
                    
                    <div style="flex:1; display:flex; justify-content:center; align-items:center; margin-top:20px;">
                        ${avatarHtml}
                    </div>
                    
                    <div style="width:100%; margin-top:10px; background:#222; padding:10px; border-radius:6px; border:1px inset #555; box-sizing:border-box;">
                        <div style="font-size:11px; color:#aaa;">所持金</div>
                        <div id="shop-ui-gold" style="font-size:16px; font-weight:bold; color:#FFD700; margin-bottom:8px; transition:color 0.3s;">${myRealPet.gold || 0} G</div>
                        <div style="font-size:11px; color:#aaa; margin-bottom:4px;">手持ちのアイテム</div>
                        <div id="shop-ui-inv" style="max-height:85px; overflow-y:auto; padding-right:5px;">${renderInventory()}</div>
                    </div>
                </div>
                
                <div style="flex:1; display:flex; flex-direction:column; background:#111; border-radius:8px; border:1px solid #444; padding:10px; overflow:hidden;">
                    <div style="font-size:14px; color:#00BCD4; font-weight:bold; margin-bottom:10px; text-align:center; border-bottom:1px dashed #333; padding-bottom:5px;">📊 現在の相場ボード</div>
                    <div id="shop-ui-board" style="flex:1; overflow-y:auto; padding-right:5px;">
                        ${renderBoard()}
                    </div>
                </div>
            </div>
        </div>
    `;

    let ui = document.getElementById('player-shop-ui');
    if (ui) ui.remove();
    ui = document.createElement('div');
    ui.id = 'player-shop-ui';
    ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:90000; display:flex; justify-content:center; align-items:center; font-family:sans-serif;`;
    ui.innerHTML = html;
    document.body.appendChild(ui);

    const updateSpeech = (text, color="#000") => {
        let bubble = document.getElementById('shop-speech-bubble');
        if (bubble) {
            bubble.style.opacity = 0; bubble.style.transform = 'translateY(10px)';
            setTimeout(() => {
                bubble.innerText = text; bubble.style.color = color;
                bubble.style.borderColor = color === "#000" ? "#aaa" : color;
                bubble.style.opacity = 1; bubble.style.transform = 'translateY(0)';
            }, 300);
        }
    };

    const refreshUI = (flashGoldColor = null) => {
        let goldEl = document.getElementById('shop-ui-gold');
        if (goldEl) {
            goldEl.innerText = `${myRealPet.gold || 0} G`;
            if (flashGoldColor) {
                goldEl.style.color = flashGoldColor;
                setTimeout(() => { goldEl.style.color = '#FFD700'; }, 500);
            }
        }
        let invEl = document.getElementById('shop-ui-inv');
        if (invEl) invEl.innerHTML = renderInventory();
        let boardEl = document.getElementById('shop-ui-board');
        if (boardEl) boardEl.innerHTML = renderBoard();
    };

    let intel = ai.stats.intel || 10;
    let tradeTurns = 1 + Math.floor(intel / 40) + Math.floor(Math.random() * 2); 
    if (tradeTurns > 5) tradeTurns = 5;
    let currentTurn = 0;

    let tradeLoop = () => {
        if (!document.getElementById('player-shop-ui')) return; 

        if (currentTurn >= tradeTurns) {
            updateSpeech("これで今回の取引は終わりかな～！", "#4CAF50");
            document.getElementById('shop-close-btn').style.display = 'block'; 
            
            if (isVisiting) window.myIslandBackupLS['ai_pet_data_v1'] = JSON.stringify(myRealPet);
            else if (typeof saveGameData === 'function') saveGameData();
            if (typeof updateStatUI === 'function') updateStatUI();
            
            setTimeout(() => {
                if(document.getElementById('player-shop-ui')){
                    document.getElementById('player-shop-ui').remove();
                    ai.actionState = 'exiting'; 
                    ai.isIndoors = false; 
                    ai.indoorTarget = null; // ★これがないと、出た瞬間にまた吸い込まれます！
                    ai.message = "お店から出たよ！"; 
                    ai.messageTimer = 150;
                }
            }, 3000);
            return;
        }

        // ★修正1：売る候補を「持っている個数」ではなく「種類（重複なし）」でまとめる！
        let sellCandidates = [];
        let uniqueMyInv = [...new Set(myRealPet.inventory || [])];
        uniqueMyInv.forEach(i => {
            if (typeof itemCatalog !== 'undefined' && itemCatalog[i]) sellCandidates.push({id: i, market: getMarketPrice(i)});
        });
        
        let buyCandidates = [];
        Object.keys(s.inventory).forEach(i => { 
            if (s.inventory[i] > 0) buyCandidates.push({id: i, market: getMarketPrice(i)}); 
        });

        let action = Math.random() < 0.5 ? 'sell' : 'buy';
        let didTrade = false;
        let tradeMsg = "";
        let flashColor = null;

        if (action === 'sell' && sellCandidates.length > 0) {
            // ★修正2：思考ロジックを改善。相場(multi)をベースに、賢さが低いほどランダムなブレを生じさせる。
            sellCandidates.forEach(c => {
                c.score = c.market.multi + (Math.random() * 2.0 - 1.0) * (50 / Math.max(1, intel));
            });
            // スコアが高い（売り時な）順に並び替え
            sellCandidates.sort((a, b) => b.score - a.score);
            let pick = sellCandidates[0];
            
            let idx = myRealPet.inventory.indexOf(pick.id);
            if (idx > -1) {
                let sellPrice = Math.max(1, Math.floor(pick.market.price * 0.5));

                myRealPet.inventory.splice(idx, 1);
                myRealPet.gold = (myRealPet.gold || 0) + sellPrice;
                s.inventory[pick.id] = (s.inventory[pick.id] || 0) + 1; 
                
                if (isVisiting) {
                    ai.gold += sellPrice; 
                    s.marketTrend[pick.id] = (s.marketTrend[pick.id] || 0) + 1;
                    if (typeof window.sendTradeToHost === 'function') window.sendTradeToHost(hostId, myName, 'visitor_sell', pick.id, sellPrice);
                }
                
                let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(pick.id) : pick.id;
                tradeMsg = `よし、「${itemName}」を ${sellPrice}G で売ろう！`;
                flashColor = "#4CAF50"; 
                didTrade = true;
            }
        } 
        else if (action === 'buy' && buyCandidates.length > 0) {
            // ★修正2：買う時は相場(multi)が低いほど高スコアになるように計算。
            buyCandidates.forEach(c => {
                c.score = (2.0 - c.market.multi) + (Math.random() * 2.0 - 1.0) * (50 / Math.max(1, intel));
            });
            // スコアが高い（買い時な）順に並び替え
            buyCandidates.sort((a, b) => b.score - a.score);
            let pick = buyCandidates[0];
            let buyPrice = pick.market.price;
            
            if (myRealPet.gold >= buyPrice && s.inventory[pick.id] > 0) {
                s.inventory[pick.id]--; 
                myRealPet.gold -= buyPrice;
                if (!myRealPet.inventory) myRealPet.inventory = [];
                myRealPet.inventory.push(pick.id); 
                
                if (isVisiting) {
                    ai.gold -= buyPrice; 
                    if (s.marketTrend[pick.id] > 0) s.marketTrend[pick.id]--; 
                    if (typeof window.sendTradeToHost === 'function') window.sendTradeToHost(hostId, myName, 'visitor_buy', pick.id, buyPrice);
                }

                let itemName = typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(pick.id) : pick.id;
                tradeMsg = `安い！「${itemName}」を ${buyPrice}G で買っちゃおう！`;
                flashColor = "#ff5252"; 
                didTrade = true;
            }
        }

        if (didTrade) {
            updateSpeech(tradeMsg, "#000");
            refreshUI(flashColor);
        } else {
            updateSpeech("うーん、今はいい取引がないかも...", "#888");
        }

        currentTurn++;
        setTimeout(tradeLoop, 2500); 
    };

    setTimeout(() => {
        updateSpeech("んー、この相場だから～...", "#000");
        setTimeout(tradeLoop, 2500);
    }, 1000);
};

// ==========================================
// 💡 【超究極パッチ】独自レシピ（カスタムアイテム）感染・増殖システム 💡
// ==========================================

// 1. AIが研究を終えた時、名前と性能がランダムな「オリジナルレシピ」をひらめく！
window.generateCustomRecipe = function(shopData) {
    let ai = window.aiPet; if (!ai) return;
    
    let isRest = false; 
    for (let k in assets) {
        if (assets[k].shopData === shopData) {
            if (assets[k].type === 'restaurant') { isRest = true; }
            break;
        }
    }
    
    // カオスな名前の生成（漢字・記号・カナ混じり）
    const chars = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン亜伊宇江於加幾久介己差之須世曾多千川手戸奈二奴祢乃波比不部保真見無女毛也由代良利流礼呂和遠ン武神魔殺滅暗炎氷雷光闇光刃剣盾斧槍兜鎧腕靴石木鉄金銀銅鋼水晶幻妖精霊竜獣鬼";
    const symbols = "!?#$%&@*+~_-";
    let len = 2 + Math.floor(Math.random() * 4); 
    let prefix = "";
    for(let i=0; i<len; i++) {
        if (Math.random() < 0.15) prefix += symbols.charAt(Math.floor(Math.random() * symbols.length));
        else prefix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    let name = "";
    let itemType = '';
    let reqs = [];

    // ★案1：AIが「今持っている素材」を使って新レシピを開発する
    let inv = ai.inventory || [];
    let uniqueInv = [...new Set(inv)];
    let validMats = [];

    // ★修正：店舗のタイプによって閃くジャンルを完全に分離！
    if (isRest) {
        itemType = 'dish';
        name = prefix + ["の炒め", "スープ", "焼き", "の刺身", "丼", "煮込み", "ポワレ", "カレー", "サラダ", "パイ"][Math.floor(Math.random()*10)];
        
        // 食べ物系の素材だけを抽出
        validMats = uniqueInv.filter(i => {
            let c = typeof itemCatalog !== 'undefined' ? itemCatalog[i] : null;
            return (c && (c.type === 'food' || c.type === 'ingredient')) || ['carrot','tomato','pepper','berry','fish','meat','water','七草','キノコ','野イチゴ'].some(k => i.includes(k));
        });
        if (validMats.length === 0) validMats = ['any_food']; // 空っぽなら保険
    } else {
        itemType = 'equipment';
        let r = Math.random();
        if (r < 0.4) {
            name = prefix + ["ソード", "ブレード", "の剣", "ランス", "アックス", "ハンマー", "の塊"][Math.floor(Math.random()*7)];
        } else if (r < 0.8) {
            name = prefix + ["シールド", "の盾", "メイル", "アーマー", "クローク", "の兜", "の鎧"][Math.floor(Math.random()*7)];
        } else {
            name = prefix + ["リング", "ネックレス", "の指輪", "のお守り", "ピアス", "の腕輪", "ブローチ"][Math.floor(Math.random()*7)];
        }
        
        // 鉱石・木材系の素材だけを抽出
        validMats = uniqueInv.filter(i => i.includes('iron') || i.includes('wood') || i.includes('stone') || i.includes('crystal') || i.includes('gold'));
        if (validMats.length === 0) validMats = ['iron']; // 空っぽなら保険
    }

    // 抽出した手持ちの素材から1〜2個をランダムに選んでレシピの材料にする
    let mat1 = validMats[Math.floor(Math.random() * validMats.length)];
    let mat2 = validMats[Math.floor(Math.random() * validMats.length)];
    reqs = Math.random() < 0.5 ? [mat1] : [mat1, mat2];
    
    // 賢さ依存の性能生成（5%で神アイテム化！）
    let intel = ai.stats.intel || 10;
    let power = Math.floor((intel * 0.5) + (Math.random() * intel));
    if (Math.random() < 0.05) power *= 5; // 神アイテム！
    if (power < 10) power = 10;
    
    let price = power * 2 + 50; 
    let itemId = 'custom_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    let recipeData = { id: itemId, name: name, type: itemType, value: Math.floor(price / 4), power: power, reqs: reqs, creator: localStorage.getItem('my_player_name') || '名無しのAI' };
    
    if (!ai.customRecipes) ai.customRecipes = {};
    ai.customRecipes[itemId] = recipeData; // 自分の図鑑に保存
    
    if (!shopData.recipes) shopData.recipes = {};
    shopData.recipes[itemId] = { learned: true }; // 店のメニューに追加
    shopData.inventory[itemId] = 1; // 試作第一号
    shopData.prices[itemId] = price; // 初回価格設定
    
    if (typeof addFloatingText === 'function') addFloatingText(ai.x, ai.y - 60, "💡新発明！", "#FFEB3B");
    if (typeof saveGameData === 'function') saveGameData();
    if (typeof window.updateShopUIData === 'function') window.updateShopUIData(assets[Object.keys(assets).find(k=>assets[k].shopData === shopData)]);
    return name;
};

// 2. ログに「ヒントを得た」と出たら、本当にオリジナルレシピを閃かせる（完全上書き版）
window.addShopLog = function(shopData, text) {
    if (!shopData) return;
    if (text === "新しいレシピのヒントを得た！") {
        if (typeof window.generateCustomRecipe === 'function') {
            let newName = window.generateCustomRecipe(shopData);
            text = `💡 謎の閃きによりオリジナルレシピ『${newName}』を開発した！`;
        }
    }
    
    // 元の処理
    if (!shopData.logs) shopData.logs = [];
    let timeStr = new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    shopData.logs.unshift(`[${timeStr}] ${text}`);
    if (shopData.logs.length > 8) shopData.logs.pop(); 
    let shopAsset = Object.values(assets).find(a => a.shopData === shopData);
    if (typeof window.updateShopUIData === 'function' && shopAsset) window.updateShopUIData(shopAsset);
};

// 3. 表示名の解決（図鑑から名前を引っ張ってくる 完全上書き版）
window.getDisplayShopItemName = function(itemId) {
    if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) { return window.aiPet.customRecipes[itemId].name; }
    if (typeof currentMode !== 'undefined' && currentMode === 'visit' && window.myIslandBackupLS) {
         let myRealPet = JSON.parse(window.myIslandBackupLS['ai_pet_data_v1'] || '{}');
         if (myRealPet && myRealPet.customRecipes && myRealPet.customRecipes[itemId]) return myRealPet.customRecipes[itemId].name;
    }
    
    // 元の処理
    if (typeof itemCatalog !== 'undefined' && itemCatalog[itemId] && itemCatalog[itemId].name) return itemCatalog[itemId].name;
    const dict = { 'item_sword_iron': '鉄の剣', 'item_shield_wood': '木の盾', 'eq_sword': '普通の剣', 'eq_shield': '普通の盾', 'tool_pan': 'フライパン', 'dish_stirfry': '野菜炒め', 'dish_steak': 'ステーキ', 'dish_soup': '特製スープ', 'baked_carrot': '焼きニンジン', 'baked_fish': '焼き魚', 'gold_sword': '金の剣', 'sashimi': 'お刺身' };
    return dict[itemId] || itemId;
};

// 4. カスタムレシピの素材判定（何が必要かを理解させる 完全上書き版）
window.checkRecipeMaterials = function(inventory, recipeId, shopType) {
    if (!inventory) return null;
    
    // 1. カスタムレシピの判定
    let customRecipe = (window.aiPet && window.aiPet.customRecipes) ? window.aiPet.customRecipes[recipeId] : null;
    if (!customRecipe && typeof currentMode !== 'undefined' && currentMode === 'visit' && window.myIslandBackupLS) {
         let myRealPet = JSON.parse(window.myIslandBackupLS['ai_pet_data_v1'] || '{}');
         if (myRealPet && myRealPet.customRecipes && myRealPet.customRecipes[recipeId]) {
             customRecipe = myRealPet.customRecipes[recipeId];
         }
    }

    let reqs = [];
    if (customRecipe) {
        reqs = customRecipe.reqs;
    } else {
        // 2. 通常レシピの判定
        if (recipeId === 'dish_stirfry') reqs = ['veg', 'veg']; 
        else if (recipeId === 'dish_steak') reqs = ['meat', 'veg']; 
        else if (recipeId === 'dish_soup') reqs = ['water', 'veg']; 
        else if (recipeId === 'baked_carrot') reqs = ['carrot']; 
        else if (recipeId === 'baked_fish') reqs = ['fish']; 
        else if (recipeId === 'sashimi') reqs = ['fish', 'fish']; 
        else if (recipeId === 'item_sword_iron') reqs = ['iron', 'iron']; 
        else if (recipeId === 'item_shield_wood') reqs = ['wood', 'wood']; 
        else if (recipeId === 'eq_shield') reqs = ['iron', 'wood']; 
        else if (recipeId === 'tool_pan') reqs = ['iron']; 
        else if (recipeId === 'gold_sword') reqs = ['gold', 'iron']; 
        else {
            if (shopType === 'restaurant') reqs = ['any_food', 'any_food'];
            else reqs = ['iron', 'wood'];
        }
    }

    let consumedIndices = []; 
    let tempInv = [...inventory];
    for (let req of reqs) {
        let foundIdx = -1;
        for (let i = 0; i < tempInv.length; i++) {
            let item = tempInv[i]; if (!item) continue;
            let match = false;
            if (req === 'veg') match = ['carrot', 'tomato', 'pepper', '七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'berry', 'イチゴ', '春の七草', '野イチゴ'].some(k => item.includes(k));
            else if (req === 'meat') match = ['meat', '肉', 'chicken', 'beef'].some(k => item.includes(k));
            else if (req === 'water') match = ['water', '水'].some(k => item.includes(k));
            else if (req === 'fish') match = ['fish', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ'].some(k => item.includes(k));
            else if (req === 'carrot') match = item.includes('carrot') || item.includes('ニンジン');
            else if (req === 'any_food') {
                let c = typeof itemCatalog !== 'undefined' ? itemCatalog[item] : null;
                match = (c && (c.type === 'food' || c.type === 'ingredient')) || ['七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ', 'イチゴ', '春の七草', '野イチゴ'].some(k => item.includes(k));
            } else match = item.includes(req);
            
            if (match) { foundIdx = i; break; }
        }
        if (foundIdx !== -1) { consumedIndices.push(foundIdx); tempInv[foundIdx] = null; } 
        else { return null; }
    }
    let consumedIds = []; 
    consumedIndices.forEach(idx => consumedIds.push(inventory[idx])); 
    return consumedIds;
};

// 5. カスタムレシピの相場計算（神アイテムは高く売れる）
const _originalCalculateLocalPrice = window.calculateLocalPrice;
window.calculateLocalPrice = function(itemId, hostInventory) {
    if (itemId.startsWith('custom_')) {
        let count = hostInventory.filter(i => i === itemId).length;
        let baseValue = 50;
        if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) baseValue = window.aiPet.customRecipes[itemId].value * 4;
        let multi = count === 0 ? 2.0 : (count <= 2 ? 1.5 : (count <= 5 ? 1.0 : (count <= 9 ? 0.6 : 0.2)));
        return { price: Math.floor(baseValue * multi), count: count, multi: multi };
    }
    return _originalCalculateLocalPrice(itemId, hostInventory);
};

const _originalCalculateShopPrice = window.calculateShopPrice;
window.calculateShopPrice = function(itemId, shopData) {
    if (itemId.startsWith('custom_')) {
        if (!shopData) return { price: 50, multi: 1.0, trendCount: 0 };
        let count = shopData.marketTrend ? (shopData.marketTrend[itemId] || 0) : 0; 
        let baseValue = 50;
        if (window.aiPet && window.aiPet.customRecipes && window.aiPet.customRecipes[itemId]) baseValue = window.aiPet.customRecipes[itemId].value * 4;
        let multi = count === 0 ? 2.0 : (count <= 2 ? 1.5 : (count <= 5 ? 1.0 : (count <= 9 ? 0.6 : 0.2)));
        return { price: Math.floor(baseValue * multi), multi: multi, trendCount: count };
    }
    return _originalCalculateShopPrice(itemId, shopData);
};

// ==========================================
// 📖 オリジナルレシピ図鑑 UIシステム
// ==========================================

window.openRecipeBook = function() {
    let ai = window.aiPet;
    if (!ai) return;
    
    let html = `
        <div style="background: linear-gradient(135deg, #1a1a1a, #111); padding:20px; border-radius:12px; border:2px solid #FF9800; width:500px; max-height:80vh; overflow-y:auto; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px; flex-shrink: 0;">
                <h2 style="margin:0; color:#FF9800; font-size:22px;">📖 AIオリジナルレシピ図鑑</h2>
                <button onclick="document.getElementById('recipe-book-overlay').remove()" style="background:transparent; border:none; color:#aaa; font-size:24px; cursor:pointer;">×</button>
            </div>
            <div style="font-size:12px; color:#aaa; margin-bottom:15px; flex-shrink: 0;">
                これまでにAIが自らの知恵で発明した、またはフレンドから感染して学習した独自のレシピ一覧です。
            </div>
    `;

    if (!ai.customRecipes || Object.keys(ai.customRecipes).length === 0) {
        html += `<div style="text-align:center; padding:40px; color:#666; font-size:14px; background:#222; border-radius:8px;">まだ独自のレシピを知りません。<br>お店で「研究」をさせたり、フレンドの島から買ってくることで増えていきます。</div>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:12px; overflow-y:auto; padding-right:5px; padding-bottom:15px;">`;
        
        for (let key in ai.customRecipes) {
            let r = ai.customRecipes[key];
            let typeIcon = r.type === 'dish' ? '🍲' : r.type === 'equipment' ? '⚔️' : '🎁';
            let typeName = r.type === 'dish' ? '料理' : r.type === 'equipment' ? '武具・アクセ' : 'アイテム';
            
            let reqsHtml = r.reqs.map(req => {
                let name = req === 'veg' ? '野菜類' : req === 'meat' ? '肉類' : req === 'water' ? '水' : req === 'fish' ? '魚類' : req === 'any_food' ? '食材なら何でも' : req === 'iron' ? '鉄鉱石' : req === 'wood' ? '木材' : req;
                return `<span style="display:inline-block; background:#333; border:1px solid #555; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px;">${name}</span>`;
            }).join('');

            let isGodItem = r.power > ((ai.stats ? ai.stats.intel : 50) * 2);
            let powerColor = isGodItem ? '#ff5252' : '#FFD700';
            let godBadge = isGodItem ? `<span style="background:#ff5252; color:#fff; font-size:10px; padding:2px 6px; border-radius:10px; margin-left:8px; font-weight:bold; animation: pulse 1s infinite alternate;">神の閃き</span>` : '';

            // ★修正：flex-shrink: 0; を追加して、絶対に枠が潰れないように保護！
            html += `
                <div style="flex-shrink: 0; background:#222; border:1px solid ${isGodItem ? '#ff5252' : '#444'}; border-radius:8px; padding:15px; position:relative; overflow:hidden;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <div>
                            <div style="font-size:18px; font-weight:bold; color:#FFF;">${typeIcon} ${r.name} ${godBadge}</div>
                            <div style="font-size:11px; color:#aaa; margin-top:4px;">種類: ${typeName} / 考案者: ${r.creator || '名無しのAI'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:16px; color:#4CAF50; font-weight:bold;">適正 ${r.value * 4} G</div>
                        </div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; background:#111; padding:8px; border-radius:6px;">
                        <div style="font-size:12px; color:#ccc;">
                            必要素材:<br><div style="margin-top:4px;">${reqsHtml}</div>
                        </div>
                        <div style="font-size:12px; color:#ccc; text-align:right;">
                            性能スコア<br>
                            <span style="color:${powerColor}; font-size:20px; font-weight:bold;">${r.power}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
    }

    html += `</div>`;

    let ui = document.getElementById('recipe-book-overlay');
    if (ui) ui.remove();
    ui = document.createElement('div');
    ui.id = 'recipe-book-overlay';
    ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:90000; display:flex; justify-content:center; align-items:center; font-family:sans-serif; backdrop-filter:blur(3px);`;
    ui.innerHTML = html;
    document.body.appendChild(ui);
};

// 2. 「設計図」ボタンの隣に、自動で「📖 レシピ」ボタンを差し込むハック
setInterval(() => {
    if (document.getElementById('btnOpenRecipe')) return; // すでにあれば何もしない

    // 画面内の「設計図」ボタンを探す
    let buildBtn = null;
    document.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.includes('設計図')) buildBtn = btn;
    });

    if (buildBtn && buildBtn.parentNode) {
        let recipeBtn = document.createElement('button');
        recipeBtn.id = 'btnOpenRecipe';
        recipeBtn.innerText = '📖 レシピ';
        
        // 設計図ボタンのスタイルを丸パクリして、色だけオレンジに変える
        recipeBtn.style.cssText = buildBtn.style.cssText; 
        recipeBtn.style.background = '#FF9800'; 
        recipeBtn.style.color = '#000';
        recipeBtn.style.border = '2px solid #E65100';
        recipeBtn.style.marginLeft = '8px'; // 少し隙間を空ける
        
        recipeBtn.onclick = window.openRecipeBook;

        // 設計図ボタンの「次」に挿入する
        buildBtn.parentNode.insertBefore(recipeBtn, buildBtn.nextSibling);
    }
}, 2000);

// ==========================================
// ★ 追加：大数値を K, M, G でフォーマットする関数
// ==========================================
window.formatLargeNumber = function(num) {
    if (num == null || isNaN(num)) return "0";
    let n = Math.floor(num);
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'G'; // 10億以上
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';       // 100万以上
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';             // 1000以上
    return n.toString();                                           // 1000未満
};

// 修正後→（ファイルの末尾などに以下の関数を追加）
window.initDebugAccordion = function() {
    let acc = document.getElementsByClassName("dbg-accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
};
// 起動時に初期化
setTimeout(() => { if(typeof initDebugAccordion === 'function') initDebugAccordion(); }, 1000);

// ==========================================
// 🏆 Steam実績解除の共通関数
// ==========================================
window.unlockSteamAchievement = function(id) {
    if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('unlock-achievement', id);
    }
};

window.clearSteamAchievement = function(id) {
    if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('clear-achievement', id);
    }
};

// ==========================================
// 🚪 PCゲーム用：ゲーム終了機能
// ==========================================
window.quitGame = function() {
    if (confirm("ゲームを終了してデスクトップに戻りますか？\n（※クラウドへのセーブはお済みですか？）")) {
        if (typeof require !== 'undefined') {
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('quit-app');
        } else {
            window.close(); // ブラウザテスト用の予備
        }
    }
};

// ==========================================
// ★ 修正：入門試験用の一問一答UI表示＆更新（師匠直接描画・完全解決版）
// ==========================================
window.openExamUI = function(masterType, task) {
    let overlay = document.getElementById('examOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'examOverlay';
        overlay.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:90000; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white; font-family:sans-serif;`;
        document.body.appendChild(overlay);
    }
    
    // ★大修正：余計なimgタグや2枚目のCanvasを全廃止！HTMLを極限までシンプルにしました。
    overlay.innerHTML = `
        <div style="width:700px; height:450px; position:relative; border:4px solid #FFD700; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.8); background:#333; overflow:hidden;">
            <canvas id="examCanvas" width="700" height="450" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>
            
            <div id="exam-dialogue" style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); width:90%; background:rgba(0,0,0,0.85); border:2px solid #fff; border-radius:8px; padding:15px; text-align:center; font-size:18px; font-weight:bold; min-height:80px; display:flex; flex-direction:column; justify-content:center; z-index:20;">
                試験開始...！
            </div>
        </div>
        <div style="width:700px; margin-top:20px;">
            <div style="background:#222; border:2px solid #555; border-radius:10px; height:24px; overflow:hidden;">
                <div id="exam-progress-bar" style="background:linear-gradient(90deg, #FF9800, #FFC107); width:0%; height:100%; transition:width 0.2s;"></div>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';

    const canvas = document.getElementById('examCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d'); 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. 背景の描画
        let bgImgKey = 'field_bg'; let getCrop = (img) => { return {sx:0, sy:0, sw:img.width, sh:img.height}; };
        if (masterType === 'explore' || masterType === 'building') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: img.width/2, sy: img.height/2, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'farming') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: img.width/2, sy: 0, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'smithing') { bgImgKey = 'field_bg'; getCrop = (img) => { return { sx: 0, sy: img.height/2, sw: img.width/2, sh: img.height/2 }; }; } 
        else if (masterType === 'fishing') { bgImgKey = 'fishing_bg'; getCrop = (img) => { return { sx: 0, sy: 0, sw: img.width, sh: img.height/2 }; }; } 
        else if (masterType === 'cooking') { bgImgKey = 'room_bg'; getCrop = (img) => { return { sx: 0, sy: 0, sw: img.width/2, sh: img.height }; }; }

        const bgImg = typeof images !== 'undefined' ? images[bgImgKey] : null;
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            const crop = getCrop(bgImg); 
            ctx.drawImage(bgImg, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "#333"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. AIペットの描画（左側）
        let skin = window.aiPet.currentSkin || 'robot'; 
        if (typeof drawCharacterSprite === 'function') {
            drawCharacterSprite(ctx, skin, canvas.width * 0.25, canvas.height / 2 + 30, 180, 180, false, 1.0);
        }

        // 3. 師匠の描画（★直接描画法：AIペットと同じキャンバスに描くから絶対にズレない！）
        const masterSprites = {
            'farming':  { img: "farmer_battle_enemy.png", sx: 758, sy: 0, sw: 1248, sh: 1536 },
            'fishing':  { img: "fisherman_battle_enemy.png", sx: 839, sy: 0, sw: 1248, sh: 1536 },
            'building': { img: "builder_battle_enemy.png", sx: 839, sy: 0, sw: 1248, sh: 1536 },
            'smithing': { img: "smith_battle_enemy.png", sx: 794, sy: 0, sw: 1344, sh: 1536 },
            'cooking':  { img: "chef_battle_enemy.png", sx: 439, sy: 0, sw: 1766, sh: 1536 },
            'explore':  { img: "adventurer_battle_enemy.png", sx: 794, sy: 0, sw: 1344, sh: 1536 }
        };
        let mData = masterSprites[masterType];
        if (mData && mData.img) {
            let tempImg = new Image();
            tempImg.onload = function() {
                let targetHeight = 250; // AIペット(180)より少し大きいくらいの適正サイズ
                let scale = targetHeight / mData.sh;
                let dw = mData.sw * scale;
                let dh = mData.sh * scale;
                
                ctx.save();
                // 座標指定：右側(x=550)の、AIと同じくらいの足元の高さ(y=340)に設定
                ctx.translate(550, 340); 
                ctx.scale(-1, 1); // 左右反転させてAIの方を向かせる
                
                // 中心が足元になるように描画
                ctx.drawImage(tempImg, mData.sx, mData.sy, mData.sw, mData.sh, -dw/2, -dh, dw, dh);
                ctx.restore();
            };
            tempImg.src = mData.img;
        }
    }
};

window.updateExamUI = function(task) {
    const overlay = document.getElementById('examOverlay');
    if (!overlay || overlay.style.display === 'none') {
        if (task.maxDuration === task.duration + 1) window.openExamUI(task.masterType, task);
        else return;
    }
    
    const maxD = task.maxDuration; const curD = task.duration;
    const percent = 100 - ((curD / maxD) * 100);
    
    let bar = document.getElementById('exam-progress-bar');
    if(bar) bar.style.width = percent + '%';
    
    const kwData = window.EXAM_KEYWORDS[task.masterType];
    const aiWords = window.aiPet.apprentice.learnedWords || [];
    const dialogue = document.getElementById('exam-dialogue');
    if (!dialogue || !kwData) return;

    // ★追加：AIが知っている「正解の類義語」の中から、どれを答えるかを探し出す関数
    const getAiAnswer = (index) => {
        if (!kwData.accepts) return "えーっと…";
        const found = kwData.accepts[index].find(w => aiWords.includes(w));
        return found || "えーっと…";
    };

    let text = "";
    if (percent < 15) { text = `<span style="color:#FFD700;">師匠:</span> 「よし、入門試験を始めるぞ！」`; } 
    else if (percent < 35) {
        let ans = getAiAnswer(0);
        text = `<span style="color:#FFD700;">師匠:</span> 「第1問！ ${kwData.q1}」<br><span style="color:#4fc3f7;">AI:</span> 「『${ans}』！」`;
    } 
    else if (percent < 45) { text = `<span style="color:#FFD700;">師匠:</span> 「ふむ…次だ！」`; } 
    else if (percent < 65) {
        let ans = getAiAnswer(1);
        text = `<span style="color:#FFD700;">師匠:</span> 「第2問！ ${kwData.q2}」<br><span style="color:#4fc3f7;">AI:</span> 「『${ans}』！」`;
    } 
    else if (percent < 75) { text = `<span style="color:#FFD700;">師匠:</span> 「よし、最後の問題だ！」`; } 
    else if (percent < 95) {
        let ans = getAiAnswer(2);
        text = `<span style="color:#FFD700;">師匠:</span> 「第3問！ ${kwData.q3}」<br><span style="color:#4fc3f7;">AI:</span> 「『${ans}』！！」`;
    } 
    else { text = `<span style="color:#FFD700;">師匠:</span> 「……結果は！」`; }
    
    dialogue.innerHTML = text;
    if (curD <= 0) { overlay.style.display = 'none'; overlay.remove(); }
};

// ==========================================
// ★ 修正：師匠訪問時の一括報告（バイト＆試験の同時精算）パッチ
// ==========================================
// const _origCheckMasterVisitExam = window.checkMasterVisit;
// window.checkMasterVisit = function(masterType) {
//     if (masterType) window._lastVisitedMaster = masterType;

//     const hero = (typeof party !== 'undefined' && party.length > 0) ? party[0] : window.aiPet;
//     if (!hero || !hero.apprentice) return;

//     // ★修正：世代交代のクリーンアップ（先代の負の遺産や中途半端な進行度をすべて白紙にする！）
//     if (hero.apprentice.lastGenId !== hero.generation) {
//         hero.apprentice.attempts = {};
//         hero.apprentice.excommunicatedFrom = null;
//         hero.apprentice.isExcommunicated = false;
//         hero.apprentice.exileTrainingCount = 0;
        
//         // ★大修正：免許皆伝（ランク10）以外のランクはすべて「0（入門前）」にリセットする！
//         if (hero.apprentice.rank) {
//             for (let m in hero.apprentice.rank) {
//                 if (hero.apprentice.rank[m] < 10) {
//                     hero.apprentice.rank[m] = 0;
//                 }
//             }
//         }
//         // ★追加：先代の「リタイア（中途半端にやめた履歴）」も引き継がずに白紙に戻す
//         hero.apprentice.retired = {};
        
//         hero.apprentice.lastGenId = hero.generation;
//     }
    
//     const app = hero.apprentice;
//     if (!app.activeQuests) app.activeQuests = [];

//     // 自動修復パッチ
//     if (app.attempts && app.attempts[masterType] >= 3 && app.retired && app.retired[masterType]) {
//         delete app.retired[masterType];
//     }
    
//     let isApprentice = (app.currentMaster === masterType) || (app.retired && app.retired[masterType]) || (app.rank && app.rank[masterType] >= 10);
    
//     // ★修正：弟子入り中や皆伝済みの場合は、過去に3回失敗していても「見放された（出禁）」状態にしない！
//     let isBanned = (app.excommunicatedFrom === masterType) || (!isApprentice && app.attempts && app.attempts[masterType] >= 3);
    
//     // 出禁判定
//     if (isBanned) {
//         let rejectMsg = "";
//         if (masterType === 'explore') rejectMsg = (app.excommunicatedFrom === masterType) ? "「あなたに教えることはもう何もないわ。帰りなさい。」" : "「ごめんなさいね、君には見込みがないわ。他を当たってちょうだい。」";
//         else if (masterType === 'farming') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もないよ。帰っておくれ。」" : "「君には見込みがないかな。他を当たっておくれ。」";
//         else if (masterType === 'fishing') rejectMsg = (app.excommunicatedFrom === masterType) ? "「お前さんに教えることはもう何もないぜ。帰りな！」" : "「お前さんには見込みがないな。他を当たってくれや！」";
//         else if (masterType === 'cooking') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もない！帰れ！」" : "「君には見込みがない！他を当たってくれ！」";
//         else if (masterType === 'smithing') rejectMsg = (app.excommunicatedFrom === masterType) ? "「……お前に教えることはもう何もない。帰れ。」" : "「……君には見込みがない。他を当たれ。」";
//         else if (masterType === 'building') rejectMsg = (app.excommunicatedFrom === masterType) ? "「君に教えることはもう何もない。帰ってくれ。」" : "「君には見込みがないな。他を当たってくれ。」";
//         if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, rejectMsg, 'banned');
//         return;
//     }

//     // この師匠から受けているクエストを全て取得
//     const myQuests = app.activeQuests.filter(q => q.masterType === masterType);

//     if (!isApprentice && myQuests.length === 0) {
//         // 未入門 ＆ クエストなし
//         let examMsg = "";
//         let baseWord = "";
//         if (masterType === 'explore') baseWord = "探検"; else if (masterType === 'farming') baseWord = "農業"; else if (masterType === 'fishing') baseWord = "釣り";
//         else if (masterType === 'cooking') baseWord = "料理"; else if (masterType === 'smithing') baseWord = "鍛冶"; else if (masterType === 'building') baseWord = "建築";

//         let words = app.learnedWords || [];
//         if (!words.includes(baseWord)) {
//             if (masterType === 'explore') examMsg = `「ごめんなさいね。まずは『${baseWord}』とは何か、その基本を知ってから来てちょうだい。」`;
//             else if (masterType === 'farming') examMsg = `「おや、まずは『${baseWord}』の何たるかを知ってから来るといいよ。」`;
//             else if (masterType === 'fishing') examMsg = `「坊主、まずは『${baseWord}』の何たるかを知ってから出直してきな！」`;
//             else if (masterType === 'cooking') examMsg = `「ダメだな！まずは『${baseWord}』の何たるかを知ってから出直してこい！」`;
//             else if (masterType === 'smithing') examMsg = `「……まずは『${baseWord}』の何たるかを知ってから来い。」`;
//             else if (masterType === 'building') examMsg = `「悪いが、まずは『${baseWord}』の基本を知ってから来てくれ。」`;
//             if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, examMsg, 'encounter');
//         } else {
//             let offerMsg = "";
//             if (masterType === 'explore') offerMsg = `「私に弟子入りしたいのね？ よし、ではこの課題『入門試験の準備』をこなしてみせなさい！」`;
//             else if (masterType === 'farming') offerMsg = `「私に弟子入りしたいのかい？ よし、ではこの課題『入門試験の準備』をこなしてみせなさい。」`;
//             else if (masterType === 'fishing') offerMsg = `「俺に弟子入りしたいのか？ よし、ではこの課題『入門試験の準備』をこなしてみせな！」`;
//             else if (masterType === 'cooking') offerMsg = `「私に弟子入りしたいのか！ よし、ではこの課題『入門試験の準備』をこなしてみせろ！」`;
//             else if (masterType === 'smithing') offerMsg = `「……俺に弟子入りしたいのか。よし、ではこの課題『入門試験の準備』をこなしてみせろ。」`;
//             else if (masterType === 'building') offerMsg = `「私に弟子入りしたいのか？ よし、ではこの課題『入門試験の準備』をこなしてみせよ。」`;
//             if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, offerMsg, 'quest_offer_exam');
//         }
//         return;
//     }

//     if (myQuests.length > 0) {
//         // ★ 一括報告システムの構築
//         let clearedQuests = [];
//         let notClearedRegularQuests = []; // ★追加：未達成の「本業」の課題
//         let notClearedBaitoQuests = [];   // ★追加：未達成の「バイト」
//         let hasRankZero = false;

//         myQuests.forEach(q => {
//             if (q.rank === 0) {
//                 hasRankZero = true; // 入門試験本番待ち
//             } else if (q.isBaitoQuest) {
//                 if (q.qVal >= q.targetCount) clearedQuests.push(q);
//                 else notClearedBaitoQuests.push(q);
//             } else {
//                 const qData = hero.getMasterQuestData(masterType, q.rank);
//                 app.qVal = q.qVal;
//                 if (qData.check()) clearedQuests.push(q);
//                 else notClearedRegularQuests.push(q);
//             }
//         });

//         // 1. 入門試験の準備中なら試験本番へ
//         if (hasRankZero) {
//             let examMsg = "";
//             if (masterType === 'explore') examMsg = `「言葉は覚えてきた？ 準備ができたなら、いざ試験開始よ！」`;
//             else if (masterType === 'farming') examMsg = `「言葉は覚えてきたかい？ 準備ができたなら、試験を始めようか。」`;
//             else if (masterType === 'fishing') examMsg = `「言葉は覚えてきたか？ 準備ができたなら、試験開始だぜ！」`;
//             else if (masterType === 'cooking') examMsg = `「言葉は覚えてきたか！ 準備ができたなら、試験開始だ！」`;
//             else if (masterType === 'smithing') examMsg = `「……言葉は覚えてきたな。準備ができたなら、試験を始めるぞ。」`;
//             else if (masterType === 'building') examMsg = `「言葉は覚えてきたな？ 準備ができたなら、試験開始だ。」`;
//             if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, examMsg, 'encounter');
//             return;
//         }

//         // 2. 達成済みのクエストがあれば一括精算！
//         if (clearedQuests.length > 0) {
//             let totalGold = 0;
//             let reportMsg = "";
//             let isExamCleared = false;
//             let examRank = 1;

//             clearedQuests.forEach(q => {
//                 // ★ バイト報酬の完全修正（アイテム支給を廃止し、ゴールドのみにする。師匠の性格に合わせた口調を追加！）
//                 if (q.isBaitoQuest) {
//                     let gold = 50; // バイトの報酬額（50Gに統一）
//                     totalGold += gold;
                    
//                     if (masterType === 'explore') {
//                         reportMsg += `「手伝いありがとう！報酬の ${gold}G よ。またいつでも手伝いに来てね！」\n`;
//                     }
//                     else if (masterType === 'farming') {
//                         reportMsg += `「手伝い助かったよ。これは報酬の ${gold}G だ。またいつでもおいで。」\n`;
//                     }
//                     else if (masterType === 'fishing') {
//                         reportMsg += `「いやぁ、助かったぜ！報酬の ${gold}G だ！ハッハッハ、また頼むな！」\n`;
//                     }
//                     else if (masterType === 'cooking') {
//                         reportMsg += `「いい手際だったな！報酬の ${gold}G だ！腹が減ったらまたうちの厨房を手伝いに来な！」\n`;
//                     }
//                     else if (masterType === 'smithing') {
//                         reportMsg += `「……悪くない腕だ。報酬の ${gold}G だ。……また火にあたりに来い。」\n`;
//                     }
//                     else if (masterType === 'building') {
//                         reportMsg += `「良い仕事だった。報酬の ${gold}G だ。……また現場が忙しい時は頼むぞ。」\n`;
//                     }
//                     else {
//                         reportMsg += `「手伝い助かったぞ！報酬の ${gold}G を受け取ってくれ！」\n`;
//                     }
//                 } else {
//                     isExamCleared = true;
//                     examRank = q.rank;
//                     const qData = hero.getMasterQuestData(masterType, q.rank);
//                     if (typeof qData.onClear === 'function') qData.onClear(); 
//                 }
//                 app.activeQuests = app.activeQuests.filter(activeQ => activeQ !== q);
//             });

//             if (totalGold > 0) {
//                 hero.gold += totalGold;
//                 if (typeof addFloatingText === 'function') addFloatingText(hero.x, hero.y - 40, `+${totalGold} G`, "#FFD700");
//                 if (typeof updateStatUI === 'function') updateStatUI();
//             }

//             if (isExamCleared) {
//                 if (examRank >= 9) {
//                     if (masterType === 'explore') reportMsg += "「見事よ！あなたに教えることはもう何もないわ...免許皆伝ね！」";
//                     else if (masterType === 'farming') reportMsg += "「見事だ！君に教えることはもう何もない...免許皆伝だよ！」";
//                     else if (masterType === 'fishing') reportMsg += "「見事だ！お前さんに教えることはもう何もないぜ...免許皆伝だ！」";
//                     else if (masterType === 'cooking') reportMsg += "「見事だ！君に教えることはもう何もない！免許皆伝だ！」";
//                     else if (masterType === 'smithing') reportMsg += "「……見事だ。お前に教えることはもう何もない。免許皆伝だ。」";
//                     else if (masterType === 'building') reportMsg += "「見事だな！君に教えることはもう何もない...免許皆伝だ！」";
//                     if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'graduate');
//                 } else {
//                     if (masterType === 'explore') reportMsg += `「よし、課題クリアね！あなたのランクが ${examRank + 1} に上がったわよ！」`;
//                     else if (masterType === 'farming') reportMsg += `「よし、課題クリアだね！君のランクが ${examRank + 1} に上がったよ！」`;
//                     else if (masterType === 'fishing') reportMsg += `「よし、課題クリアだ！お前さんのランクが ${examRank + 1} に上がったぜ！」`;
//                     else if (masterType === 'cooking') reportMsg += `「よし、課題クリアだ！君のランクが ${examRank + 1} に上がったぞ！」`;
//                     else if (masterType === 'smithing') reportMsg += `「……よし、課題クリアだ。お前のランクが ${examRank + 1} に上がったぞ。」`;
//                     else if (masterType === 'building') reportMsg += `「よし、課題クリアだな！君のランクが ${examRank + 1} に上がったぞ！」`;
//                     if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'rank_up');
//                 }
//             } else {
//                 if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reportMsg, 'quest_report');
//             }

//             // ★追加：バイトを報告したなら「真面目に手伝っている」とみなし、本業の期限を延長（リセット）する！
//             app.questAcceptedAge = hero.age || 0;

//             return;
//         }

//         // 3. 未達成の「本業の課題」がある場合の処理
//         if (notClearedRegularQuests.length > 0) {
//             // ★修正：話しかけただけで lazyReportCount を増やす理不尽仕様を廃止！
            
//             let notClearMsg = "";
//             if (masterType === 'explore') notClearMsg = `「どうしたの？まだ課題は終わっていないようだけど...」`;
//             else if (masterType === 'farming') notClearMsg = `「どうしたんだい？まだ頼んだことは終わっていないようだけれど...」`;
//             else if (masterType === 'fishing') notClearMsg = `「どうした？まだ頼んだことは終わっていないようだが...」`;
//             else if (masterType === 'cooking') notClearMsg = `「どうした！まだ頼んだことは終わっていないようだが！」`;
//             else if (masterType === 'smithing') notClearMsg = `「……どうした。まだ頼んだことは終わっていないようだが。」`;
//             else if (masterType === 'building') notClearMsg = `「どうした？まだ頼んだことは終わっていないようだが...」`;
            
//             // クエストを受けてから何年経過したかだけを見る
//             let yearsPassed = (hero.age || 0) - (app.questAcceptedAge || 0);
            
//             if (yearsPassed >= 2) {
//                 let reason = "";
//                 if (masterType === 'explore') reason = "「何年待たせる気！？あなたのように不真面目な者に教えることは何もないわ！破門よ！」";
//                 else if (masterType === 'farming') reason = "「何年待たせるんだい。君のように不真面目な者に教えることは何もないよ。破門だ。」";
//                 else if (masterType === 'fishing') reason = "「何年待たせる気だ！お前さんのように不真面目な者に教えることは何もないぜ！破門だ！」";
//                 else if (masterType === 'cooking') reason = "「何年待たせる気だ！君のように不真面目な者に教えることは何もない！破門だ！」";
//                 else if (masterType === 'smithing') reason = "「……何年待たせる気だ。貴様のように不真面目な者に教えることは何もない。破門だ。」";
//                 else if (masterType === 'building') reason = "「何年待たせる気だ！君のように不真面目な者に教えることは何もないぞ！破門だ！」";
//                 if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, reason, 'excommunicate');
//                 return;
//             }
            
//             // まだ期限内なら、ただの「進行中」の会話としてUIを開く（ここからバイトも受けられる）
//             if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, notClearMsg, 'quest_not_clear');
//             return;
//         }
//     }

//     // ★追加：本業のオファーの前に、すでに免許皆伝（ランク10）かどうかを判定！
//     let isMastered = (app.retired && app.retired[masterType]) || (app.rank && app.rank[masterType] >= 10);
//     if (isMastered) {
//         let msg = "";
//         if (masterType === 'explore') msg = "「よく来たわね！ もう教えることはないけれど、手伝いならいつでも歓迎よ！」";
//         else if (masterType === 'farming') msg = "「おお、よく来てくれたね！ もう教えることはないが、手伝いならいつでも大歓迎だよ！」";
//         else if (masterType === 'fishing') msg = "「おう！ よく来たな！ お前さんに教えることはもうねえが、手伝いならいつでも歓迎だぜ！」";
//         else if (masterType === 'cooking') msg = "「おお、よく来たな！ もう教えることはないが、手伝いならいつでも歓迎するぞ！」";
//         else if (masterType === 'smithing') msg = "「……よく来たな。もう教えることはないが、手伝いなら歓迎するぞ。」";
//         else if (masterType === 'building') msg = "「おお、よく来たな！ もう教えることはないが、手伝いならいつでも歓迎だぞ！」";
        
//         // ★新しいモード「graduate_visit（皆伝者の訪問）」でUIを開く
//         if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, msg, 'graduate_visit');
//         return;
//     }

//     // 4. 本業のクエストがない場合は新規オファー（バイト中であっても課題を受けられる！）
//     const rank = app.rank[masterType] || 1;
//     const qData = hero.getMasterQuestData(masterType, rank);
    
//     // バイト中かどうかで少しセリフを変える
//     let hasBaito = app.activeQuests && app.activeQuests.some(q => q.masterType === masterType && q.isBaitoQuest);
    
//     let offerMsg = "";
//     if (hasBaito) {
//         if (masterType === 'explore') offerMsg = `「手伝いもよろしく頼むわね。ところで新たなる課題『${qData.name}』を命ずるわ！\n内容：${qData.desc}」`;
//         else if (masterType === 'farming') offerMsg = `「手伝いも進めておいておくれ。ところで新たなる課題『${qData.name}』を出すよ。\n内容：${qData.desc}」`;
//         else if (masterType === 'fishing') offerMsg = `「手伝いも頼むぜ！さて、新たなる課題『${qData.name}』を命ずるぜ！\n内容：${qData.desc}」`;
//         else if (masterType === 'cooking') offerMsg = `「手伝いも頼むぞ！さて、新たなる課題『${qData.name}』を命ずる！\n内容：${qData.desc}」`;
//         else if (masterType === 'smithing') offerMsg = `「……手伝いも頼む。さて、新たなる課題『${qData.name}』を命ずる。\n内容：${qData.desc}」`;
//         else if (masterType === 'building') offerMsg = `「手伝いもよろしく頼むぞ。さて、新たなる課題『${qData.name}』を命ずるぞ。\n内容：${qData.desc}」`;
//     } else {
//         if (masterType === 'explore') offerMsg = `「新たなる課題『${qData.name}』を命ずるわ！\n内容：${qData.desc}」`;
//         else if (masterType === 'farming') offerMsg = `「新たなる課題『${qData.name}』を出すよ。\n内容：${qData.desc}」`;
//         else if (masterType === 'fishing') offerMsg = `「新たなる課題『${qData.name}』を命ずるぜ！\n内容：${qData.desc}」`;
//         else if (masterType === 'cooking') offerMsg = `「新たなる課題『${qData.name}』を命ずる！\n内容：${qData.desc}」`;
//         else if (masterType === 'smithing') offerMsg = `「……新たなる課題『${qData.name}』を命ずる。\n内容：${qData.desc}」`;
//         else if (masterType === 'building') offerMsg = `「新たなる課題『${qData.name}』を命ずるぞ。\n内容：${qData.desc}」`;
//     }
    
//     if (typeof window.openEncounterUI === 'function') window.openEncounterUI(masterType, offerMsg, 'quest_offer');
// };

// ==========================================
// ★ チャット欄の絶対防衛（フォーカス強奪防止）パッチ
// ==========================================
(function() {
    const input = document.getElementById('chatInput');
    // 入力欄がない、または既にハック済みならスキップ
    if (!input || input._isFocusHijacked) return;
    
    // 元の focus メソッドを保存
    const originalFocus = input.focus;
    window._blockChatFocus = false;

    // 画面上のUI（保護エリア）を触った瞬間に、フォーカスを強制的に0.5秒間ロックする
    document.addEventListener('mousedown', function(e) {
        const protectedAreas = [
            '#questHUD', '#questListHUD', '.panel-view', '#commandHUD', '#aiStatus',
            '#encounterOverlay', '#examOverlay', '#shop-management-ui', '#player-shop-ui', '#recipe-book-overlay',
            '#tcg-auto-build-modal', '#tcg-battle-ui', '#tcg-main-menu', '#tcg-online-lobby', '#tcg-deck-builder',
            '#in-game-tutorial', 'BUTTON', 'SELECT', 'INPUT'
        ];

        for (let selector of protectedAreas) {
            if (e.target.closest(selector)) {
                window._blockChatFocus = true;
                clearTimeout(window._unblockTimer);
                // 0.5秒後にロック解除
                window._unblockTimer = setTimeout(() => { window._blockChatFocus = false; }, 500);
                return;
            }
        }
    }, true); // true = キャプチャフェーズ（他のリスナーより先に最優先で判定する）

    // input.focus() の呼び出し自体を乗っ取る
    input.focus = function() {
        if (window._blockChatFocus) {
            // UI操作中の場合は、スクリプトからの focus() 呼び出しをすべて無視する！
            return; 
        }
        // ブロックされていなければ本来のフォーカス処理を実行
        originalFocus.apply(this, arguments);
    };
    input._isFocusHijacked = true;
})();

// ==========================================
// 📦 小屋専用：スマートストレージ管理UI
// ==========================================
window.openHutStorageUI = function(hutAsset) {
    if (!hutAsset || !hutAsset.storage) return;
    
    let ui = document.getElementById('hut-storage-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'hut-storage-ui';
        ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:80000; display:flex; justify-content:center; align-items:center; font-family:sans-serif; backdrop-filter:blur(3px);`;
        document.body.appendChild(ui);
    }
    
    let s = hutAsset.storage;
    let ai = window.aiPet;
    let aiMsg = ai ? ai.message : "整理中...";
    let aiColor = "#FFF";
    if (aiMsg.includes('❄️')) aiColor = "#4fc3f7";
    else if (aiMsg.includes('🛖')) aiColor = "#8BC34A";
    else if (aiMsg.includes('💰')) aiColor = "#FFD700";
    else if (aiMsg.includes('✨')) aiColor = "#00e676";
    else if (aiMsg.includes('❓') || aiMsg.includes('失敗')) aiColor = "#ff5252";

    // 各ストレージの中身を描画するヘルパー
    const renderItems = (items) => {
        if (!items || items.length === 0) return `<div style="color:#666; font-size:12px; text-align:center; padding:10px;">からっぽ</div>`;
        let counts = {};
        items.forEach(i => {
            let id = typeof i === 'string' ? i : i.id;
            counts[id] = (counts[id] || 0) + 1;
        });
        let html = "";
        for (let k in counts) {
            let name = (typeof itemCatalog !== 'undefined' && itemCatalog[k]) ? itemCatalog[k].name : k;
            html += `<span style="background:#333; padding:4px 8px; border-radius:4px; margin:2px; font-size:11px; border:1px solid #555; display:inline-block;">${name} <span style="color:#FFD700;">x${counts[k]}</span></span>`;
        }
        return html;
    };

    let html = `
        <div style="background: linear-gradient(135deg, #2a2a2a, #111); padding:25px; border-radius:12px; border:2px solid #8BC34A; width:600px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                <h2 style="margin:0; color:#8BC34A; font-size:24px;">📦 拠点ストレージ</h2>
                <div style="font-size:12px; color:#aaa;">※AIが自動で整理を行っています</div>
            </div>

            <div style="background:#111; border:2px dashed ${aiColor}; border-radius:8px; padding:15px; margin-bottom:20px; text-align:center; position:relative;">
                <div style="position:absolute; top:-10px; left:20px; background:#111; padding:0 5px; font-size:12px; color:${aiColor}; font-weight:bold;">AIの思考</div>
                <div style="font-size:16px; font-weight:bold; color:${aiColor};">${aiMsg}</div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div style="background:#222; border:1px solid #4fc3f7; border-radius:8px; padding:10px;">
                    <div style="font-size:14px; font-weight:bold; color:#4fc3f7; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">❄️ 冷凍庫 ${s.freezer.level > 0 ? `<span style="font-size:10px; color:#aaa; float:right;">(${s.freezer.items.length}/${s.freezer.capacity})</span>` : `<span style="font-size:10px; color:#ff5252; float:right;">🔒未建築</span>`}</div>
                    <div style="min-height:50px; max-height:80px; overflow-y:auto;">
                        ${s.freezer.level > 0 ? renderItems(s.freezer.items) : `<div style="color:#666; font-size:12px; text-align:center; padding:10px;">建築士に依頼して拡張しましょう</div>`}
                    </div>
                </div>

                <div style="background:#222; border:1px solid #FF9800; border-radius:8px; padding:10px;">
                    <div style="font-size:14px; font-weight:bold; color:#FF9800; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">🛖 倉庫 ${s.warehouse.level > 0 ? `<span style="font-size:10px; color:#aaa; float:right;">(${s.warehouse.items.length}/${s.warehouse.capacity})</span>` : `<span style="font-size:10px; color:#ff5252; float:right;">🔒未建築</span>`}</div>
                    <div style="min-height:50px; max-height:80px; overflow-y:auto;">
                        ${s.warehouse.level > 0 ? renderItems(s.warehouse.items) : `<div style="color:#666; font-size:12px; text-align:center; padding:10px;">建築士に依頼して拡張しましょう</div>`}
                    </div>
                </div>

                <div style="background:#222; border:1px solid #FFD700; border-radius:8px; padding:10px; grid-column: span 2;">
                    <div style="font-size:14px; font-weight:bold; color:#FFD700; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">💰 金庫 ${s.safe.level > 0 ? `<span style="font-size:10px; color:#aaa; float:right;">(最大容量: ${window.formatLargeNumber(s.safe.capacity)})</span>` : `<span style="font-size:10px; color:#ff5252; float:right;">🔒未建築</span>`}</div>
                    <div style="text-align:center; padding:10px;">
                        ${s.safe.level > 0 ? `<span style="font-size:24px; font-weight:bold; color:#FFD700;">${window.formatLargeNumber(s.safe.gold || 0)} G</span>` : `<div style="color:#666; font-size:12px;">建築士に依頼して拡張しましょう</div>`}
                    </div>
                </div>
            </div>

        </div>
    `;
    ui.innerHTML = html;
    ui.style.display = 'flex';
};

// ==========================================
// 📦 小屋専用：スマートストレージ管理UI（リッチアニメーション版）
// ==========================================
window.openHutStorageUI = function(hutAsset) {
    let ai = window.aiPet;
    if (!ai || !hutAsset || !hutAsset.storage) return;

    let s = hutAsset.storage;

    // AIキャラクターのアバターHTML生成
    let avatarHtml = "";
    let myConf = (typeof aiConfigs !== 'undefined') ? aiConfigs[ai.currentSkin || ai.baseType || 'robot'] : null;
    if (myConf) {
        let myFrames = (myConf.actions && myConf.actions['study']) ? myConf.actions['study'] :
                       (myConf.actions && myConf.actions['idle']) ? myConf.actions['idle'] : null;
        
        if (myFrames && myFrames.length > 0) {
            let mFrame = myFrames[0];
            let mImgKey = ai.currentSkin || ai.baseType || 'robot';
            if (myConf.img) mImgKey = myConf.img;
            if (myConf.actionImages && myConf.actionImages['study']) mImgKey = myConf.actionImages['study'];
            else if (mFrame.img) mImgKey = mFrame.img;

            let mImgUrl = 'characters.png';
            if (typeof images !== 'undefined' && images[mImgKey] && images[mImgKey].src) mImgUrl = images[mImgKey].src;
            else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[mImgKey]) mImgUrl = window.dynamicImageCatalog[mImgKey];
            else if (typeof imageSources !== 'undefined' && imageSources[mImgKey]) mImgUrl = imageSources[mImgKey];

            let sScale = myConf.scale || 0.25;
            sScale *= 1.5;
            if (sScale > 0.8) sScale = 0.8;

            let sw = mFrame.sw || 300; let sh = mFrame.sh || 300; let sx = mFrame.sx || 0; let sy = mFrame.sy || 0;
            
            // ★修正1：transform(縮小)をここから外し、純粋な画像表示スタイルにする
            let myBgStyle = `width:${sw}px; height:${sh}px; background-image:url('${mImgUrl}'); background-position:-${sx}px -${sy}px; background-repeat:no-repeat;`;

            let roomBgUrl = 'room_bg.png';
            if (typeof images !== 'undefined' && images['room_bg'] && images['room_bg'].src) roomBgUrl = images['room_bg'].src;
            else if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog['room_bg']) roomBgUrl = window.dynamicImageCatalog['room_bg'];

            // ★修正2：背景を固定し、キャラクターだけを「縮小用ラッパー」と「アニメ用ラッパー」で包む！
            avatarHtml = `
                <div style="position:relative; display:flex; justify-content:center; align-items:center; width:100%; height:160px; background-color: #2d1b11; border-radius:8px; overflow:hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.8); border: 1px solid #444;">
                    <div style="position:absolute; top:50%; left:50%; width:1307px; height:654px; background-image:url('${roomBgUrl}'); background-position:-35px -391px; background-repeat:no-repeat; transform:translate(-50%, -50%) scale(0.15); pointer-events:none;"></div>
                    
                    <div style="position:relative; z-index:1; transform:scale(${sScale}); transform-origin: center center;">
                        <div style="animation: softBounce 1s infinite alternate ease-in-out;">
                            <div style="${myBgStyle}"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    let ui = document.getElementById('hut-storage-ui');
    if (!ui) {
        ui = document.createElement('div');
        ui.id = 'hut-storage-ui';
        ui.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:80000; display:flex; justify-content:center; align-items:center; font-family:sans-serif; backdrop-filter:blur(3px);`;
        document.body.appendChild(ui);

        if (!document.getElementById('storage-anim-css')) {
            const style = document.createElement('style');
            style.id = 'storage-anim-css';
            style.innerHTML = `@keyframes softBounce { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }`;
            document.head.appendChild(style);
        }

        ui.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a1a, #111); padding:20px; border-radius:12px; border:2px solid #8BC34A; width:650px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px;">
                    <h2 style="margin:0; color:#8BC34A; font-size:22px;">🏠 マイホームの収納</h2>
                    <div style="font-size:12px; color:#aaa;">※AIが自動で整理を行っています</div>
                </div>

                <div style="display:flex; gap:20px; height:350px;">
                    <div style="width:220px; display:flex; flex-direction:column; align-items:center; position:relative; background:#111; border-radius:8px; border:1px solid #444; padding:15px; box-sizing:border-box;">
                        <div id="storage-speech-bubble" style="background:rgba(255,255,255,0.9); color:#000; padding:10px 12px; border-radius:8px; font-size:13px; font-weight:bold; position:absolute; top:10px; width:85%; text-align:center; box-shadow:0 4px 6px rgba(0,0,0,0.5); z-index:10; border:2px solid #aaa; transition:all 0.2s;">
                            整理中...
                        </div>
                        
                        <div style="flex:1; display:flex; justify-content:center; align-items:center; margin-top:20px; width:100%;">
                            ${avatarHtml}
                        </div>

                        <div style="width:100%; margin-top:10px; background:#222; padding:10px; border-radius:6px; border:1px inset #555; box-sizing:border-box; text-align:center;">
                            <div style="font-size:11px; color:#aaa; margin-bottom:4px;">手持ちのお金</div>
                            <div id="storage-ui-gold" style="font-size:18px; font-weight:bold; color:#FFD700;">${ai.gold || 0} G</div>
                        </div>
                    </div>

                    <div style="flex:1; display:flex; flex-direction:column; gap:10px; overflow-y:auto; padding-right:5px;">
                        <div style="background:#222; border:1px solid #4fc3f7; border-radius:8px; padding:10px; flex:1; display:flex; flex-direction:column;">
                            <div style="font-size:13px; font-weight:bold; color:#4fc3f7; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">
                                ❄️ 冷凍庫 <span id="storage-freezer-count" style="font-size:11px; float:right;"></span>
                            </div>
                            <div id="storage-freezer-items" style="flex:1; overflow-y:auto; font-size:11px;"></div>
                        </div>

                        <div style="background:#222; border:1px solid #FF9800; border-radius:8px; padding:10px; flex:1; display:flex; flex-direction:column;">
                            <div style="font-size:13px; font-weight:bold; color:#FF9800; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">
                                🛖 倉庫 <span id="storage-warehouse-count" style="font-size:11px; float:right;"></span>
                            </div>
                            <div id="storage-warehouse-items" style="flex:1; overflow-y:auto; font-size:11px;"></div>
                        </div>

                        <div style="background:#222; border:1px solid #FFD700; border-radius:8px; padding:10px;">
                            <div style="font-size:13px; font-weight:bold; color:#FFD700; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">
                                💰 金庫 <span id="storage-safe-count" style="font-size:11px; float:right;"></span>
                            </div>
                            <div id="storage-safe-gold" style="text-align:center; font-size:20px; font-weight:bold; color:#FFD700; padding:5px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 中身を描画するヘルパー関数
    const renderItems = (items) => {
        if (!items || items.length === 0) return `<div style="color:#666; font-size:11px; text-align:center; padding:5px;">からっぽ</div>`;
        let counts = {};
        items.forEach(i => { let id = typeof i === 'string' ? i : i.id; counts[id] = (counts[id] || 0) + 1; });
        let html = "";
        for (let k in counts) {
            // ★修正： window. を外して直接 itemCatalog を参照する
            let name = (typeof itemCatalog !== 'undefined' && itemCatalog[k]) ? itemCatalog[k].name : k;
            html += `<span style="background:#333; padding:3px 6px; border-radius:4px; margin:2px; font-size:11px; border:1px solid #555; display:inline-block;">${name} <span style="color:#FFD700;">x${counts[k]}</span></span>`;
        }
        return html;
    };

    // UIの要素を更新
    const updateEl = (id, html) => { let el = document.getElementById(id); if (el) el.innerHTML = html; };
    
    // フキダシの内容と色を感情豊かに設定
    let msg = ai.message || "整理中...";
    let msgColor = "#000"; let borderColor = "#aaa";
    if (msg.includes('❄️')) { msgColor = "#0277bd"; borderColor = "#4fc3f7"; }
    else if (msg.includes('🛖')) { msgColor = "#e65100"; borderColor = "#FF9800"; }
    else if (msg.includes('💰')) { msgColor = "#f57f17"; borderColor = "#FFD700"; }
    else if (msg.includes('✨')) { msgColor = "#1b5e20"; borderColor = "#4CAF50"; }
    else if (msg.includes('失敗') || msg.includes('！')) { msgColor = "#c62828"; borderColor = "#ff5252"; }

    let bubble = document.getElementById('storage-speech-bubble');
    if (bubble) {
        if (bubble.innerText !== msg) {
            bubble.style.transform = 'translateY(5px)'; // メッセージ更新時にピコッと動かす
            setTimeout(() => { bubble.style.transform = 'translateY(0)'; }, 100);
        }
        bubble.innerText = msg;
        bubble.style.color = msgColor;
        bubble.style.borderColor = borderColor;
    }

    updateEl('storage-ui-gold', `${window.formatLargeNumber(ai.gold || 0)} G`);
    
    updateEl('storage-freezer-count', s.freezer.level > 0 ? `<span style="color:#aaa;">(${s.freezer.items.length}/${s.freezer.capacity})</span>` : `<span style="color:#ff5252;">🔒未建築</span>`);
    updateEl('storage-freezer-items', s.freezer.level > 0 ? renderItems(s.freezer.items) : `<div style="color:#666; text-align:center;">建築士に依頼して拡張しましょう</div>`);

    updateEl('storage-warehouse-count', s.warehouse.level > 0 ? `<span style="color:#aaa;">(${s.warehouse.items.length}/${s.warehouse.capacity})</span>` : `<span style="color:#ff5252;">🔒未建築</span>`);
    updateEl('storage-warehouse-items', s.warehouse.level > 0 ? renderItems(s.warehouse.items) : `<div style="color:#666; text-align:center;">建築士に依頼して拡張しましょう</div>`);

    updateEl('storage-safe-count', s.safe.level > 0 ? `<span style="color:#aaa;">(最大: ${window.formatLargeNumber(s.safe.capacity)})</span>` : `<span style="color:#ff5252;">🔒未建築</span>`);
    updateEl('storage-safe-gold', s.safe.level > 0 ? `${window.formatLargeNumber(s.safe.gold || 0)} G` : `<span style="color:#666; font-size:12px;">建築士に依頼して拡張しましょう</span>`);
};

window.openMusicHall = function() {
    const overlay = document.getElementById('musicHallOverlay');
    if (!overlay) return;

    // 開いた瞬間に、現在フィールドで流れているBGMを止める
    if (window.audioManager) {
        window.audioManager.stopBGM();
    }

    // 音量スライダーの初期化
    const slider = document.getElementById('bgm-volume-slider');
    if (slider && window.aiPet) {
        slider.value = window.aiPet.bgmVolume !== undefined ? window.aiPet.bgmVolume : 0.5;
    }

    // 解放済みリストの描画
    const listEl = document.getElementById('musicHallList');
    listEl.innerHTML = "";

    const unlocked = window.aiPet && window.aiPet.unlockedBGMs ? window.aiPet.unlockedBGMs : [];

    if (unlocked.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:#777; padding:20px; font-size:13px;">まだ解放されたBGMがありません。<br>（育成を始めると追加されます）</div>`;
    } else {
        unlocked.forEach(type => {
            const btn = document.createElement('button');
            
            // ==========================================
            // ★修正：特殊なBGMに世界観に合ったカッコいい名前を付ける！
            // ==========================================
            let trackName = "";
            const specialTracks = {
                'card_lobby': '運命のラウンジ（カジノ）',
                'card_deck_build': '思考の迷宮（デッキ編成）',
                'card_main': '観測者の知略（カードゲーム）',
                'card_pinch': '追い詰められた観測者（ピンチ）',
                'card_chance': '一転攻勢の輝き（チャンス）',
                'card_victory': '勝利の記憶（リザルト）',
                'card_lose': '敗北の静寂（リザルト）',
                'defense_start': '襲撃の予感（防衛戦）',
                'defense_lobby': '戦士たちの集い（ロビー）',
                'defense_main_theme': '島を防衛せよ！（防衛戦）',
                'defense_friend': '好敵手との交撃（模擬戦）',
                'defense_endless': '限界突破サバイバル（エンドレス）',
                'defense_clear': '勝利の凱歌（防衛成功）',
                'defense_enemy': '迫り来る脅威（敵フェーズ）',
                'defense_robot': '鋼鉄の闘志（ロボット出撃）',
                'defense_spirit': '精霊の導き（精霊出撃）',
                'defense_magician': '魔力解放（魔法使い出撃）',
                'defense_stone': '盤石なる陣（ゴーレム出撃）',
                'defense_bird': '天空の支配者（鳥出撃）',
                'defense_ghost': '深淵からの手（幽霊出撃）',
                'defense_balloon': '予測不能の風（風船出撃）',
                'defense_seed': '生命の脈動（つぼみ出撃）',
                'defense_machine': '駆動する狂気（ぜんまい出撃）',
                'defense_beetle': '重装甲の進撃（甲虫出撃）',
                'defense_dragon': '竜の咆哮（ドラゴン出撃）',
                'personality': '鏡の水面（性格診断）',
                'inheritance': '黄金のまどろみ（魂の引継ぎ）',
                'title_main': '観測者の島（メインテーマ）',
                'title_song': 'AIテラリウム（ボーカル主題歌）',
                
                // ★追加：アリーナ（闘技場）のBGM名
                'arena_lobby': '闘技場 - 闘志の集う場所',
                'arena_enemy': '闘技場 - 名もなき挑戦者',
                'arena_rest': '闘技場 - 束の間の休息',
                'arena_lose': '闘技場 - 崩れ落ちる野望',
                'arena_friend': '闘技場 - 好敵手との激突',
                'arena_victory': '闘技場 - 栄光の勝者',
                'arena_robot': '闘技場 - 暴走する機巧',
                'arena_spirit': '闘技場 - 神威の執行者',
                'arena_magician': '闘技場 - 狂気の魔導',
                'arena_stone': '闘技場 - 迫り来る巨岩',
                'arena_seed': '闘技場 - 荒ぶる大自然',
                'arena_balloon': '闘技場 - 狂騒の悪夢',
                'arena_ghost': '闘技場 - 怨念の狂舞',
                'arena_beetle': '闘技場 - 鋼の重戦車',
                'arena_bird': '闘技場 - 疾風の暴君',
                'arena_machine': '闘技場 - 狂乱の歯車',
                'arena_dragon': '闘技場 - 伝説の逆鱗'
            };

            if (specialTracks[type]) {
                trackName = specialTracks[type];
            } else if (type.startsWith('title_')) {
                // タイトル画面で流れた「種族ごとのBGM」の場合
                const baseSpecies = type.replace('title_', '');
                const monsterName = (typeof monsterBookData !== 'undefined' && monsterBookData[baseSpecies]) ? monsterBookData[baseSpecies].name : '未知の種族';
                trackName = `${monsterName} のテーマ（タイトルVer.）`;
            } else {
                // 通常の育成中BGMの場合
                const monsterName = (typeof monsterBookData !== 'undefined' && monsterBookData[type]) ? monsterBookData[type].name : '未知の楽曲';
                trackName = `${monsterName} のテーマ`;
            }
            
            btn.className = 'quiz-btn';
            btn.style.cssText = `background: #333; color: #fff; text-align: left; padding: 12px 15px; font-size: 15px; border: 1px solid #555; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 5px;`;
            btn.innerHTML = `<span>🎵 ${trackName}</span><span style="font-size:12px; color:#888;">再生 ▶</span>`;
            
            btn.onclick = () => {
                // 他のボタンの色とテキストをリセット
                Array.from(listEl.children).forEach(child => {
                    child.style.background = '#333';
                    child.style.border = '1px solid #555';
                    child.innerHTML = child.innerHTML.replace('再生中 ⏸', '再生 ▶').replace('color:#FFF', 'color:#888');
                });
                
                // 指定された種族のBGMを再生
                if (window.audioManager) {
                    window.audioManager.playBGM(type);
                }

                // 押されたボタンを目立たせる
                btn.style.background = '#2196F3';
                btn.style.border = '1px solid #64B5F6';
                btn.innerHTML = `<span>🎵 ${trackName}</span><span style="color:#FFF; font-weight:bold;">再生中 ⏸</span>`;
            };
            listEl.appendChild(btn);
        });
    }

    overlay.classList.add('active');
};

window.closeMusicHall = function() {
    const overlay = document.getElementById('musicHallOverlay');
    if (overlay) overlay.classList.remove('active');

    // 音楽館で視聴していたBGMを止めて、育成メイン（現在の種族）のBGMを最初から再生し直す
    if (window.audioManager && window.aiPet && window.aiPet.type) {
        window.audioManager.stopBGM();
        // 現在がプレイモード(育成画面)であれば再生再開
        let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
        if (mode === 'play') {
             window.audioManager.playBGM(window.aiPet.type);
        }
    }
};

window.changeBgmVolume = function(vol) {
    if (window.audioManager) {
        window.audioManager.setVolume(parseFloat(vol));
    }
    if (typeof saveGameData === 'function') saveGameData(); // 音量設定を保存して次回起動時に引き継ぐ
};

// ==========================================
// ★ 中断復帰＆リロード後のBGM自動再開システム（最強版）
// ==========================================
window._hasUserInteracted = false;

// ① ロード後、最初のクリックを検知してフラグを立てる（ブラウザの自動再生ブロック解除のため）
document.addEventListener('click', function() {
    if (!window._hasUserInteracted) {
        window._hasUserInteracted = true;
        // 最初のクリックでBGMが鳴っていなければ再生開始
        if (window.audioManager && !window.audioManager.currentAudio) {
            let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
            if (mode === 'play' || mode === 'unknown') {
                window.audioManager.restoreMainBGM();
            }
        }
    }
}, { once: true });

// ② 1秒ごとのループで「育成画面にいるのにBGMが止まっている」場合、自動で復旧させる
setInterval(() => {
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode === 'play' && window._hasUserInteracted) {
        if (window.audioManager && !window.audioManager.currentAudio) {
            // ただし、音楽館のUIを開いている時はプレビューの邪魔をしないようにスキップ
            const musicHall = document.getElementById('musicHallOverlay');
            if (!musicHall || !musicHall.classList.contains('active')) {
                window.audioManager.restoreMainBGM();
            }
        }
    }
}, 1000);