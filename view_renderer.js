// view_renderer.js : 描画処理 (Fixed Version v18 - Crafting Gauge & Status)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

if (typeof camera === 'undefined') {
    var camera = { x: 0, y: 0 };
}

function render() {
    if (!ctx || imagesLoaded < totalImages) return;

    // ==========================================
    // 🛠️ 1. タイトル画面の調整ツール描画処理（Shift+Dモード用）
    // ==========================================
    if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust' && typeof editingTarget !== 'undefined' && editingTarget === 'title') {
        if (window.bgTitleImg && window.bgTitleImg.complete) {
            ctx.drawImage(window.bgTitleImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (window.TITLE_SCREEN_DATA) {
            let keys = Object.keys(window.TITLE_SCREEN_DATA);
            
            // ==========================================
            // ★大修正：ドラゴン最前面 ＆ Y座標ベースの自動ソート (エディタ用)
            // ==========================================
            keys.sort((a, b) => {
                let charA = window.TITLE_SCREEN_DATA[a];
                let charB = window.TITLE_SCREEN_DATA[b];
                
                let isDragonA = a.startsWith('dragon') ? 1 : 0;
                let isDragonB = b.startsWith('dragon') ? 1 : 0;
                
                // 1. ドラゴンは無条件で他の種族より手前（後に描画）
                if (isDragonA !== isDragonB) return isDragonA - isDragonB;
                
                // 2. ドラゴン同士、または他種族同士なら Y座標でソート (Yが小さい＝上にあるほど奥)
                // ※手動設定された `z` プロパティは、微調整用の強力なオフセットとして加算する
                let scoreA = (charA.y || 0) + ((charA.z || 0) * 10000);
                let scoreB = (charB.y || 0) + ((charB.z || 0) * 10000);
                
                return scoreA - scoreB;
            });

            for (let k of keys) {
                let chara = window.TITLE_SCREEN_DATA[k];
                // ★空箱 {} トラップを回避する最強の安全装置
                if (!chara.imgObj || !(chara.imgObj instanceof Image) || !chara.imgObj.src) { 
                    chara.imgObj = new Image(); 
                    chara.imgObj.src = chara.img; 
                }
                
                if (chara.imgObj.complete) {
                    ctx.save();
                    // 描画の中心（基準点）へ移動してから回転とスケールを適用！
                    ctx.translate(chara.x || 640, chara.y || 360);
                    
                    // 回転処理を追加 (角度からラジアンへ変換)
                    if (chara.rotation) {
                        ctx.rotate(chara.rotation * Math.PI / 180);
                    }
                    
                    ctx.scale(chara.scale || 1, chara.scale || 1);
                    if (chara.flip) ctx.scale(-1, 1); // 左右反転
                    
                    // HIDEにチェックが入っていない時だけ画像を描画する
                    if (!chara.isHidden) {
                        ctx.drawImage(chara.imgObj, chara.sx || 0, chara.sy || 0, chara.sw || 150, chara.sh || 150, 
                                      -(chara.sw||150)/2, -(chara.sh||150)/2, chara.sw||150, chara.sh||150);
                    }
                    
                    // 選択中の緑枠は「見失わないよう」常に描画する
                    if (window.selectedTitleCharKey === k) {
                        ctx.strokeStyle = 'lime'; ctx.lineWidth = 2 / (chara.scale || 1);
                        ctx.strokeRect(-(chara.sw||150)/2, -(chara.sh||150)/2, chara.sw||150, chara.sh||150);
                        ctx.fillStyle = 'red'; ctx.fillRect(-2, -2, 4, 4);
                    }
                    ctx.restore();
                }
            }
        }
        return; 
    }
    
    // ==========================================
    // 🎮 2. 本番のタイトル画面の描画処理
    // ==========================================
    if (currentMode === 'title') {
        if (window.bgTitleImg && window.bgTitleImg.complete) {
            ctx.drawImage(window.bgTitleImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        let hasSaveData = !!localStorage.getItem('ai_pet_data_v1');
        
        if (window.TITLE_SCREEN_DATA && hasSaveData && window.TITLE_RANDOM_LAYOUT) {
            // 描画対象のキーだけを抽出
            let activeKeys = Object.keys(window.TITLE_SCREEN_DATA).filter(k => window.TITLE_RANDOM_LAYOUT[k]);

            // ==========================================
            // ★大修正：ドラゴン最前面 ＆ 実際の配置Y座標ベースの自動ソート (本番用)
            // ==========================================
            activeKeys.sort((a, b) => {
                let charA = window.TITLE_SCREEN_DATA[a];
                let charB = window.TITLE_SCREEN_DATA[b];
                let layoutA = window.TITLE_RANDOM_LAYOUT[a];
                let layoutB = window.TITLE_RANDOM_LAYOUT[b];
                
                let isDragonA = a.startsWith('dragon') ? 1 : 0;
                let isDragonB = b.startsWith('dragon') ? 1 : 0;
                
                // 1. ドラゴンは無条件で他の種族より手前（後に描画）
                if (isDragonA !== isDragonB) return isDragonA - isDragonB;
                
                // 2. ランダム（ダイレクト）配置された実際の Y座標でソート
                let scoreA = layoutA.y + ((charA.z || 0) * 10000);
                let scoreB = layoutB.y + ((charB.z || 0) * 10000);
                
                return scoreA - scoreB;
            });

            for (let k of activeKeys) {
                let chara = window.TITLE_SCREEN_DATA[k];
                let layout = window.TITLE_RANDOM_LAYOUT[k]; // 計算済みのランダム座標＆Flipデータ
                
                // ★空箱 {} トラップを回避する最強の安全装置
                if (!chara.imgObj || !(chara.imgObj instanceof Image) || !chara.imgObj.src) { 
                    chara.imgObj = new Image(); 
                    chara.imgObj.src = chara.img; 
                }
                
                if (chara.imgObj.complete) {
                    ctx.save();
                    // 生成されたランダム座標を使用！
                    ctx.translate(layout.x, layout.y);
                    
                    // 回転情報を適用！
                    if (layout.rotation) {
                        ctx.rotate(layout.rotation * Math.PI / 180);
                    }

                    ctx.scale(chara.scale || 1, chara.scale || 1);
                    
                    // 川をまたいだ反転ルールを適用！
                    if (layout.flip) ctx.scale(-1, 1); 
                    
                    ctx.drawImage(chara.imgObj, chara.sx || 0, chara.sy || 0, chara.sw || 150, chara.sh || 150, 
                                  -(chara.sw||150)/2, -(chara.sh||150)/2, chara.sw||150, chara.sh||150);
                    ctx.restore();
                }
            }
        }

        // ==========================================
        // ★ 絶対表示させる鉄壁のテキスト描画★
        // ==========================================
        ctx.save();
        ctx.globalAlpha = 1.0; 
        ctx.textAlign = 'right'; 
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; 

        const TEXT_X = canvas.width * 0.95;   
        const TITLE_Y = canvas.height * 0.25; 
        const SUB_Y = canvas.height * 0.35;   
        const MENU1_Y = canvas.height * 0.75; 
        const MENU2_Y = canvas.height * 0.85; 

        // 1. タイトルロゴ
        ctx.font = 'bold 80px sans-serif'; 
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000'; 
        ctx.lineWidth = 8;
        ctx.strokeText('AIテラリウム', TEXT_X, TITLE_Y); 
        ctx.fillText('AIテラリウム', TEXT_X, TITLE_Y);

        ctx.font = 'italic 30px sans-serif';
        ctx.lineWidth = 5;
        ctx.strokeText('- 観測者の島 -', TEXT_X, SUB_Y);
        ctx.fillText('- 観測者の島 -', TEXT_X, SUB_Y);

        // 2. メニュー描画
        let pulse = (Math.sin(Date.now() / 300) + 1) / 2;
        let alpha = 0.6 + (pulse * 0.4);
        ctx.font = 'bold 36px sans-serif';
        ctx.lineWidth = 6;

        let hoverNew = (window.titleMenuHover === 1);
        ctx.fillStyle = hoverNew ? `rgba(255, 215, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = hoverNew ? '#553300' : '#000000';
        ctx.strokeText('はじめから', TEXT_X, MENU1_Y);
        ctx.fillText('はじめから', TEXT_X, MENU1_Y);

        let hoverCont = (window.titleMenuHover === 2);
        // セーブがない時は「つづきから」をグレーアウト
        if (!hasSaveData) { ctx.fillStyle = 'rgba(100, 100, 100, 0.5)'; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; }
        else { ctx.fillStyle = hoverCont ? `rgba(255, 215, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`; ctx.strokeStyle = hoverCont ? '#553300' : '#000000'; }
        ctx.strokeText('つづきから', TEXT_X, MENU2_Y);
        ctx.fillText('つづきから', TEXT_X, MENU2_Y);

        // ==========================================
        // ★ リッチな確認ダイアログ（はじめから押下時）
        // ==========================================
        if (window.titleConfirmMode) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.font = 'bold 32px sans-serif';
            ctx.strokeText('現在のセーブデータは失われます。', cx, cy - 40);
            ctx.fillText('現在のセーブデータは失われます。', cx, cy - 40);
            ctx.strokeText('本当に最初から始めますか？', cx, cy);
            ctx.fillText('本当に最初から始めますか？', cx, cy);

            ctx.font = 'bold 28px sans-serif';
            
            // はい ボタン
            let hYes = (window.titleMenuHover === 3);
            ctx.fillStyle = hYes ? '#FF5252' : '#aa0000';
            ctx.fillRect(cx - 160, cy + 50, 140, 50);
            ctx.fillStyle = '#fff';
            ctx.fillText('はい', cx - 90, cy + 75);

            // いいえ ボタン
            let hNo = (window.titleMenuHover === 4);
            ctx.fillStyle = hNo ? '#4CAF50' : '#226622';
            ctx.fillRect(cx + 20, cy + 50, 140, 50);
            ctx.fillStyle = '#fff';
            ctx.fillText('いいえ', cx + 90, cy + 75);
        }

        ctx.restore();
        return; 
    }

    let isDefense = (typeof window.DEFENSE_STATE !== 'undefined' && window.DEFENSE_STATE.isActive);
    let isEmergency = (typeof window.DEFENSE_STATE !== 'undefined' && window.DEFENSE_STATE.isEmergency);

    let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});

    let camBase = aiPet;
    if (currentMode === 'grazing' && typeof getGrazingCameraTarget === 'function') {
        camBase = getGrazingCameraTarget();
    } 
    else if (isDefense) {
        if (window.DEFENSE_STATE.activeUnit) {
            let u = window.DEFENSE_STATE.activeUnit;
            let pos = window.getGridPixelPos ? window.getGridPixelPos(u.gridX, u.gridY) : {x:400, y:240};
            camBase = { x: pos.x, y: pos.y };
        } else {
            let castle = Object.values(currentAssets).find(a => a && a.type === 'castle');
            if (castle) {
                let sc = castle.scale !== undefined ? castle.scale : 0.5;
                camBase = { x: castle.dx + (castle.sw*sc)/2, y: castle.dy + (castle.sh*sc)/2 };
            } else {
                camBase = { x: 400, y: 240 };
            }
        }
    }

    let targetCamX = camBase.x - canvas.width / 2;
    let targetCamY = camBase.y - canvas.height / 2;

    camera.x += (targetCamX - camera.x) * 0.1;
    camera.y += (targetCamY - camera.y) * 0.1;

    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    
    if (currentMode !== 'ai_adjust') {
        ctx.translate(-camera.x, -camera.y);
    }

    drawInfiniteOcean();

    const groundAssets = [];
    const objectAssets = [];

    Object.keys(currentAssets).forEach(key => {
        const a = currentAssets[key];
        if (!a) return;
        if (a.type === 'ground' || a.type === 'water' || a.type === 'road') {
            groundAssets.push({key: key, data: a});
        } else {
            objectAssets.push({key: key, data: a});
        }
    });

    if (isDefense) {
        let allUnits = [...window.DEFENSE_STATE.deployedParty, ...window.DEFENSE_STATE.enemies];
        allUnits.forEach(unit => {
            if (unit.hp <= 0) return;
            let pos = window.getGridPixelPos ? window.getGridPixelPos(unit.gridX, unit.gridY) : {x:400, y:240};
            unit.x = pos.x;
            unit.y = pos.y;
            objectAssets.push({
                key: 'defense_unit_' + unit.id,
                data: { dy: pos.y, isDefenseUnit: true, unit: unit }
            });
        });
    }

    groundAssets.sort((a, b) => a.data.dy - b.data.dy);
    groundAssets.forEach(item => drawAsset(item.data, item.key));

    if (isDefense) {
        const drawGridHighlight = (gx, gy, color) => {
            let pos = window.getGridPixelPos ? window.getGridPixelPos(gx, gy) : null;
            if (!pos) return;
            ctx.save(); ctx.translate(pos.x, pos.y); ctx.beginPath();
            ctx.moveTo(0, -12.5); ctx.lineTo(25, 0); ctx.lineTo(0, 12.5); ctx.lineTo(-25, 0);
            ctx.closePath(); ctx.fillStyle = color; ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.restore();
        };

        if (window.DEFENSE_STATE.moveHighlights) window.DEFENSE_STATE.moveHighlights.forEach(g => drawGridHighlight(g.x, g.y, "rgba(33, 150, 243, 0.5)"));
        if (window.DEFENSE_STATE.attackHighlights) window.DEFENSE_STATE.attackHighlights.forEach(g => drawGridHighlight(g.x, g.y, "rgba(244, 67, 54, 0.5)"));
    }

    objectAssets.sort((a, b) => a.data.dy - b.data.dy);
    
    objectAssets.forEach(item => {
        if (item.data.isDefenseUnit) {
            let mainPetBackup = window.aiPet;
            window.aiPet = item.data.unit; window.aiPet.currentSkin = item.data.unit.skin; 
            drawAICharacter();
            
            let unit = item.data.unit;
            ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(unit.x - 20, unit.y - 50, 40, 8);
            ctx.fillStyle = unit.team === 'player' ? "#4CAF50" : "#ff5252";
            ctx.fillRect(unit.x - 20, unit.y - 50, 40 * Math.max(0, unit.hp / unit.maxHp), 8);
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.strokeRect(unit.x - 20, unit.y - 50, 40, 8);
            
            window.aiPet = mainPetBackup;
        } else {
            drawAsset(item.data, item.key);
        }
    });

    if ((isDefense || isEmergency) && window.DEFENSE_STATE.facilities) {
        window.DEFENSE_STATE.facilities.forEach(fac => {
            if (fac.hp > 0) {
                let px = 0, py = 0;
                let asset = currentAssets[fac.id];
                
                if (asset) {
                    let sc = asset.scale !== undefined ? asset.scale : 0.5;
                    px = asset.dx + (asset.sw * sc) / 2;
                    py = asset.dy + 15; 
                } else {
                    let pos = window.getGridPixelPos ? window.getGridPixelPos(fac.gridX, fac.gridY) : {x:0, y:0};
                    px = pos.x; py = pos.y - 60;
                }

                ctx.save();
                ctx.translate(px, py);
                
                if (!isDefense && isEmergency && fac.hp < fac.maxHp) {
                    ctx.fillStyle = "#ff5252"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
                    ctx.fillText("🔥 襲撃中！", 0, -25);
                    ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
                }

                ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(-30, -15, 60, 14);
                ctx.fillStyle = "#FF9800"; ctx.fillRect(-30, -15, 60 * Math.max(0, fac.hp / fac.maxHp), 14);
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.strokeRect(-30, -15, 60, 14);
                ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(`HP ${Math.floor(fac.hp)}`, 0, -8);
                ctx.restore();
            }
        });
    }

    if (currentMode === 'play' || currentMode === 'grazing') {
        Object.keys(currentAssets).forEach(key => {
            const a = currentAssets[key];
            if (a && a.type === 'farm') drawFarmStatus(a);
        });
    }

    const isShowingActionWindow = (aiPet.isIndoors || aiPet.actionState === 'camping' || aiPet.actionState === 'studying' || aiPet.actionState === 'training' || aiPet.actionState === 'sleeping' || aiPet.actionState === 'farming_work' || aiPet.actionState === 'eating' || aiPet.actionState === 'fishing' || aiPet.actionState === 'smithing' || aiPet.actionState === 'building');
    
    if (currentMode === 'grazing') {
        let mainPetBackup = aiPet; 
        const activeMap = typeof grazingData !== 'undefined' ? grazingData.maps[currentGrazingMapId] : null;
        if (activeMap && activeMap.pets) {
            activeMap.pets.forEach(pet => {
                try {
                    aiPet = pet; window.aiPet = pet; 
                    const isHiddenOnMap = pet.isIndoors || ['sleeping', 'camping', 'inside', 'explore'].includes(pet.actionState);
                    if (!isHiddenOnMap) drawAICharacter();
                    if (aiPet.messageTimer > 0) drawSpeechBubble(aiPet.message, aiPet.x, aiPet.y - (30 * aiPet.visualScale));
                } finally { aiPet = mainPetBackup; window.aiPet = mainPetBackup; }
            });
        }
    } 
    else if (!isDefense) { 
        if (currentMode === 'ai_adjust') {
            drawAICharacter();
            
            if (editingTarget === 'ai') {
                const target = typeof getAdjustTarget === 'function' ? getAdjustTarget() : null;
                if (target) {
                    ctx.save();
                    let scaleX = target.scaleX !== undefined ? target.scaleX : (target.scale !== undefined ? target.scale : 1);
                    let scaleY = target.scaleY !== undefined ? target.scaleY : (target.scale !== undefined ? target.scale : 1);
                    
                    if (typeof aiConfigs !== 'undefined' && aiConfigs[selectedAIType]) {
                        scaleX = aiConfigs[selectedAIType].scale || 0.25;
                        scaleY = scaleX;
                    }
                    
                    const dw = target.sw * scaleX;
                    const dh = target.sh * scaleY;
                    
                    const cx = aiPet.x - camera.x;
                    const cy = aiPet.y - camera.y;
                    
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 4]); 
                    
                    ctx.strokeRect(cx - dw / 2, cy - dh / 2, dw, dh);
                    
                    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
                    ctx.fillRect(cx - 15, cy - 1, 30, 2); 
                    ctx.fillRect(cx - 1, cy - 15, 2, 30); 
                }
            }
        } else {
            let mainPetBackup = aiPet; 
            if (typeof party !== 'undefined' && party.length > 0) {
                party.forEach(pet => {
                    aiPet = pet; window.aiPet = pet; 
                    const isHiddenOnMap = pet.isIndoors || ['camping', 'studying', 'training', 'sleeping', 'farming_work', 'eating', 'fishing', 'smithing', 'building'].includes(pet.actionState);
                    if (!isHiddenOnMap) drawAICharacter();
                    if (aiPet.messageTimer > 0 && !isHiddenOnMap) drawSpeechBubble(aiPet.message, aiPet.x, aiPet.y - (30 * aiPet.visualScale));
                });
            } else {
                if (!isShowingActionWindow) drawAICharacter();
                if (aiPet.messageTimer > 0 && !isShowingActionWindow) drawSpeechBubble(aiPet.message, aiPet.x, aiPet.y - (30 * aiPet.visualScale));
            }
            aiPet = mainPetBackup; window.aiPet = mainPetBackup;
        }
    }
    
    ctx.restore();

    if (currentMode === 'play' || currentMode === 'grazing' || isDefense) {
        const time = typeof aiPet.getTimePhase === 'function' ? aiPet.getTimePhase() : { id: 'day', name: '昼', color: 'rgba(0, 0, 0, 0)' };
        if (time.color !== 'rgba(0, 0, 0, 0)') { ctx.fillStyle = time.color; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        if (isDefense) { ctx.fillStyle = "rgba(100, 0, 0, 0.2)"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }

    if (!isDefense && currentMode === 'play') { 
        let defaultAnim = 'idle';
        if (aiPet.schedule && aiPet.schedule.length > 0) {
            const t = aiPet.schedule[0].type;
            if (t === 'study') defaultAnim = 'study'; else if (t === 'train') defaultAnim = 'train'; else if (t === 'rest' || t === 'sleep') defaultAnim = 'sleep'; else if (t === 'eat') defaultAnim = 'eat_raw'; else if (t === 'explore') defaultAnim = 'move'; else if (t === 'fish') defaultAnim = 'fish'; else if (t === 'cook') defaultAnim = 'cook'; else if (t === 'smith') defaultAnim = 'smith'; 
        }

        const isMultiplayer = (typeof party !== 'undefined' && party.length > 1);

        if (!isMultiplayer) {
            if (aiPet.isIndoors) { drawActionWindow(aiPet.visualAction || defaultAnim, "inside"); }
            else if (['camping', 'studying', 'training', 'sleeping', 'smithing', 'apprentice_training'].includes(aiPet.actionState)) { drawActionWindow(aiPet.visualAction || defaultAnim, "camping"); } 
            else if (aiPet.actionState === 'farming_work') { drawActionWindow(aiPet.visualAction || 'farm_plow', "farm"); } 
            else if (aiPet.actionState === 'eating') { drawActionWindow(aiPet.visualAction || 'eat_raw', "camping"); }
            else if (aiPet.actionState === 'fishing') { drawActionWindow(aiPet.visualAction || 'fish', "fishing"); }
            else if (aiPet.actionState === 'building') { drawActionWindow(aiPet.visualAction || 'smith', "camping"); }
            
            if (isShowingActionWindow && aiPet.messageTimer > 0) drawSpeechBubble(aiPet.message, canvas.width/2, canvas.height/2 - 80);
        }
    }

    drawFloatingTexts();

    if ((currentMode === 'ai_adjust' || currentMode === 'editor') && editingTarget === 'map' && selectedMapKey) drawMapPreview();
    if (currentMode === 'ai_adjust' && editingTarget === 'card' && selectedCardKey) drawCardPreview();
    if (currentMode === 'ai_adjust' && ['dmap', 'dgim', 'dtrap', 'ditem', 'dchr', 'achr', 'afld'].includes(editingTarget)) drawDungeonPreview();
    if (currentMode === 'ai_adjust' && (editingTarget === 'rasset' || editingTarget === 'sasset')) if (typeof window.drawFurniturePreview === 'function') window.drawFurniturePreview();
    if (currentMode === 'ai_adjust') drawAdjustUI();
    if (currentMode === 'grazing' || (currentMode === 'play' && typeof party !== 'undefined' && party.length > 1)) drawPartyPIPs();
}

function drawFloatingTexts() {
    if (typeof floatingTexts === 'undefined') return;
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i]; ft.y += ft.dy; ft.life--;
        let screenX = ft.x; let screenY = ft.y;
        if (currentMode !== 'ai_adjust') { screenX = ft.x - camera.x; screenY = ft.y - camera.y; }
        ctx.save(); ctx.globalAlpha = Math.max(0, ft.life / 30); 
        ctx.fillStyle = ft.color; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center"; 
        ctx.strokeStyle = "black"; ctx.lineWidth = 3;
        ctx.strokeText(ft.text, screenX, screenY); ctx.fillText(ft.text, screenX, screenY);
        ctx.restore();
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function drawInfiniteOcean() {
    const waterData = catalog['water3'] || {img:'terrain', sx:1379, sy:1342, sw:585, sh:585}; 
    const img = images[waterData.img];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const scale = 0.1; const stepX = 50; const stepY = 25; const oddOffsetX = 25;
    let startCol = -2, endCol = 20, startRow = -2, endRow = 20;
    if (currentMode !== 'ai_adjust') {
        startCol = Math.floor(camera.x / stepX) - 2; endCol = Math.floor((camera.x + canvas.width) / stepX) + 2;
        startRow = Math.floor(camera.y / stepY) - 2; endRow = Math.floor((camera.y + canvas.height) / stepY) + 2;
    }
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            let dx = c * stepX; let dy = r * stepY;
            if (r % 2 !== 0) { dx += oddOffsetX; } dx -= 25; dy -= 25;
            ctx.drawImage(img, waterData.sx, waterData.sy, waterData.sw, waterData.sh, dx, dy, waterData.sw * scale, waterData.sh * scale);
        }
    }
}

function drawAsset(a, key) {
    if (!a || !a.scale) return;
    let visualData = a;
    if (a.type === 'farm') {
        if (!a.plantedCrop) { visualData = catalog['farm'] || a; } 
        else if (a.growth < 100) { visualData = catalog['farm_growing'] || catalog['farm'] || a; } 
        else { visualData = catalog['farm_mature'] || catalog['farm'] || a; }
    }
    const imgName = visualData.img || 'field'; const img = images[imgName];
    const useScale = (visualData.scale !== undefined) ? visualData.scale : (a.scale || 0.5);
    const drawW = visualData.sw * useScale; const drawH = visualData.sh * useScale;
    
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.save(); ctx.translate(a.dx + drawW/2, a.dy + drawH/2);
        if (a.flip) ctx.scale(-1, 1);
        ctx.drawImage(img, visualData.sx, visualData.sy, visualData.sw, visualData.sh, -drawW/2, -drawH/2, drawW, drawH);
        ctx.restore();
    } else {
        ctx.save(); ctx.strokeStyle = "red"; ctx.lineWidth = 1; ctx.strokeRect(a.dx, a.dy, drawW, drawH);
        ctx.fillStyle = "red"; ctx.font = "10px sans-serif"; ctx.fillText("No Img", a.dx, a.dy + 10); ctx.restore();
    }
    if (currentMode === 'editor' && selectedAsset === a) {
        ctx.strokeStyle = 'cyan'; ctx.lineWidth = 2; ctx.strokeRect(a.dx, a.dy, drawW, drawH);
    }
}

// ==========================================
// ★究極進化：必要な瞬間に画像を裏でロードする（Just-In-Time ローダー）
// ==========================================
function drawAICharacter() {
    let targetPet = window.aiPet;
    if (!targetPet) return; 
    
    let typeToDraw = 'robot';
    if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust' && typeof editingTarget !== 'undefined' && editingTarget === 'ai') { 
        typeToDraw = typeof selectedAIType !== 'undefined' ? selectedAIType : 'robot'; 
    } else {
        typeToDraw = targetPet.currentSkin || targetPet.baseType || 'robot';
    }
    if (!typeToDraw) typeToDraw = 'robot'; 

    let conf = typeof aiConfigs !== 'undefined' ? aiConfigs[typeToDraw] : null; 
    if (!conf) conf = { scale: 0.25, actions: typeof createDefaultFrames !== 'undefined' ? createDefaultFrames() : {idle: [{sx:0,sy:0,sw:300,sh:300}]} }; 

    let currentAction = 'idle';
    if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust') { 
        currentAction = typeof editingActionType !== 'undefined' ? editingActionType : 'idle'; 
    } else {
        const state = targetPet.actionState;
        const isMoving = (state === 'moving' || state === 'moving_to_enter' || state === 'entering' || state === 'exiting');
        if (isMoving) { currentAction = 'move'; } 
        else if (targetPet.visualAction) { currentAction = targetPet.visualAction; } 
    }

    if (!conf.actions || !conf.actions[currentAction]) currentAction = 'idle';

    let imgKey = typeToDraw; 
    if (conf.img) imgKey = conf.img; 
    if (conf.actionImages && conf.actionImages[currentAction]) { imgKey = conf.actionImages[currentAction]; }
    
    let img = images[imgKey];
    let safeType = String(typeToDraw);
    let fallbackBase = safeType.includes('_') ? safeType.split('_')[0] : safeType;

    if (!img) { 
        if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) {
            images[imgKey] = new Image(); 
            images[imgKey].onerror = () => { images[imgKey].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; };
            images[imgKey].src = window.dynamicImageCatalog[imgKey]; 
            img = images[fallbackBase] || images['robot']; 
        } else {
            img = images[fallbackBase] || images['robot']; 
        }
    }

    let actionFrames = (conf.actions && conf.actions[currentAction]) ? conf.actions[currentAction] : null;
    if (!actionFrames || actionFrames.length === 0) actionFrames = [{sx:0, sy:0, sw:300, sh:300}];

    let frameIdx = targetPet.frameIndex || 0;
    if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust') {
        frameIdx = (typeof isTestPlaying !== 'undefined' && isTestPlaying) ? targetPet.frameIndex : (typeof editingFrameIndex !== 'undefined' ? editingFrameIndex : 0); 
    }
    if (typeof frameIdx !== 'number' || isNaN(frameIdx) || frameIdx >= actionFrames.length) frameIdx = 0;
    let f = actionFrames[frameIdx] || actionFrames[0];

    let sc = (conf.scale || 0.25) * (targetPet.visualScale || 1.0);
    let px = targetPet.x || 400; let py = targetPet.y || 240;

    if (typeof currentMode !== 'undefined' && currentMode === 'ai_adjust') { px = canvas.width/2; py = canvas.height/2; }

    const sw = f.sw || 300; const sh = f.sh || 300;
    const drawW = sw * sc; const drawH = sh * sc;

    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.save(); ctx.translate(px, py); if (targetPet.flip) ctx.scale(-1, 1);
        
        // ★追加・修正：防衛戦のフィルターと行動済みフィルターの適用
        if (currentMode === 'defense') {
            if (targetPet.team === 'enemy') {
                ctx.filter = 'brightness(0.6) sepia(1) hue-rotate(-50deg) saturate(3)'; // 敵の色
            } else if (targetPet.hasActed) {
                ctx.filter = 'brightness(0.4)'; // ★味方の行動済みの色（かなり暗く）
            } else {
                ctx.filter = 'none'; // 通常
            }
        }
        else if (targetPet.isSick) {
            // ★追加：育成モードで病気の場合は、毒々しい紫色（または青緑色）のフィルターをかける
            ctx.filter = 'sepia(0.8) hue-rotate(250deg) saturate(2) brightness(0.8)';
        } else {
            ctx.filter = 'none'; // 通常
        }
        
        ctx.drawImage(img, f.sx || 0, f.sy || 0, sw, sh, -drawW/2, -drawH/2, drawW, drawH); ctx.restore();
    }
}

function drawSpeechBubble(text, x, y) {
    if(!text) return;
    ctx.save(); ctx.font = "bold 14px sans-serif";
    const textMetrics = ctx.measureText(text); const boxW = textMetrics.width + 30; const boxH = 40; const radius = 10;
    const boxX = x - (boxW / 2); const boxY = y - 45; 
    ctx.fillStyle = "white"; ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, radius); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, boxY + boxH); ctx.lineTo(x - 5, boxY + boxH + 8); ctx.lineTo(x + 5, boxY + boxH); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; 
    ctx.fillText(text, x, boxY + (boxH / 2)); ctx.restore();
}

function drawActionWindow(animType, sceneType) {
    const winW = 300; const winH = 200;
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    const bx = cx - winW/2; const by = cy - winH/2;
    
    let bgKey = null; let target = aiPet.indoorTarget;
    if (sceneType === 'inside' && target) {
        if (target.type === 'hut' || target.type === 'house' || target.type === 'restaurant') bgKey = 'hut_room'; 
        else if (target.type === 'castle') bgKey = 'castle_room';
    }
    if (sceneType === 'camping' || sceneType === 'building') bgKey = 'camping_bg'; 
    if (sceneType === 'farm')    bgKey = 'farm_bg';
    if (sceneType === 'eating')  bgKey = 'eating_bg';
    
    if (sceneType === 'fishing') {
        const isSea = (aiPet.interactionTarget && aiPet.interactionTarget.type === 'sea');
        bgKey = isSea ? 'sea_bg' : 'river_bg';
    }
    
    if (sceneType === 'inside' && target) {
        if (target.type === 'mountain') bgKey = 'mountain_bg';
        if (target.type === 'nature' || target.type === 'forest') bgKey = 'forest_bg';
        if (aiPet.exploreState && aiPet.exploreState.currentFacility) {
            if (aiPet.exploreState.currentFacility === 'mountain') bgKey = 'mountain_bg';
            if (aiPet.exploreState.currentFacility === 'palms') bgKey = 'forest_bg';
        }
    }
    
    const bgData = bgKey ? catalog[bgKey] : null; const bgImg = bgData ? images[bgData.img] : null;
    
    if (window._lastLoggedBgKey !== bgKey) {
        console.log(`🖼️ 現在表示中の背景ID: [ ${bgKey} ]`, bgData);
        window._lastLoggedBgKey = bgKey;
    }

    if (bgData && bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(bx, by, winW, winH); ctx.clip(); 
        ctx.drawImage(bgImg, bgData.sx, bgData.sy, bgData.sw, bgData.sh, bx, by, winW, winH); ctx.restore();
    } else {
        ctx.fillStyle = "#455a64"; 
        if (sceneType === 'camping') ctx.fillStyle = "#263238"; 
        if (sceneType === 'farm') ctx.fillStyle = "#558b2f";    
        if (sceneType === 'fishing') {
            const isSea = (aiPet.interactionTarget && aiPet.interactionTarget.type === 'sea');
            ctx.fillStyle = isSea ? "#1565C0" : "#29B6F6";
        }
        ctx.fillRect(bx, by, winW, winH);
    }
    
    if (sceneType === 'fishing' && aiPet.fishingData) {
        if (aiPet.fishingData.phase === 'hit' || aiPet.fishingData.phase === 'result') {
            const gaugeW = 240; 
            const gaugeH = 24;  
            const gx = cx - gaugeW / 2;
            const gy = by + winH - 40; 
            
            ctx.fillStyle = "rgba(20, 40, 60, 0.85)";
            ctx.fillRect(gx, gy, gaugeW, gaugeH);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3; 
            ctx.strokeRect(gx, gy, gaugeW, gaugeH);
            
            let fPos = aiPet.fishingData.pos / 100; 
            fPos = Math.max(0, Math.min(1, fPos));
            
            const fishX = gx + (gaugeW - 30) * fPos;
            const fishY = gy + gaugeH / 2; 
            
            ctx.font = "22px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#fff"; 
            ctx.fillText("🐟", fishX + 15, fishY);
            
            ctx.fillText("🎣", gx + 15, fishY);
            
            if (aiPet.fishingData.phase === 'hit' && aiPet.fishingData.timer % 30 < 15) {
                ctx.font = "bold 36px sans-serif";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 5;
                ctx.strokeText("HIT!", cx, by + 40); 
                ctx.fillStyle = "#FF1744"; 
                ctx.fillText("HIT!", cx, by + 40);
            }
        }
    }

    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeRect(bx, by, winW, winH);

    drawCharacterInWindow(animType, cx, cy);
    
    // ★プログレスゲージの描画
    const isShowingProgress = (animType === 'cook' || animType === 'smith' || animType === 'mix' || sceneType === 'building' || (aiPet.schedule && aiPet.schedule.length > 0 && (aiPet.schedule[0].type === 'mix' || aiPet.schedule[0].type === 'tailor')));

    if (isShowingProgress && aiPet.schedule && aiPet.schedule.length > 0) {
        const task = aiPet.schedule[0];
        let data = null;
        if (task.type === 'mix') data = task.mixData; // ★最優先でmix判定を行う
        else if (task.type === 'tailor') data = task.tailorData; // ★追加：裁縫判定
        else if (animType === 'cook') data = task.cookData;
        else if (animType === 'smith') data = task.smithData;
        else if (sceneType === 'building' || task.type === 'build') data = task.buildData;
        
        if (data && task.maxDuration) {
            const gaugeW = 240; const gaugeH = 20;  
            const gx = cx - gaugeW / 2; const gy = by + winH - 55;
            
            ctx.save();
            ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left";
            
            let tName = data.targetName || data.name;
            // ★修正：拡張の場合は「作成」ではなく「拡張」と表示する
            let actionPrefix = data.isUpgrade ? "拡張" : "作成";
            ctx.fillText(`${actionPrefix}: ${tName}`, gx, gy - 8);
            
            ctx.textAlign = "right";
            if (data.successRate !== undefined) {
                ctx.fillStyle = data.successRate >= 0.8 ? "#76ff03" : (data.successRate >= 0.5 ? "#FFC107" : "#ff5252");
                ctx.fillText(`成功率: ${Math.floor(data.successRate * 100)}%`, gx + gaugeW, gy - 8);
            } else {
                ctx.fillStyle = "#8BC34A";
                ctx.fillText(`進行中...`, gx + gaugeW, gy - 8);
            }
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; ctx.fillRect(gx, gy, gaugeW, gaugeH);
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(gx, gy, gaugeW, gaugeH);
            
            let progress = 1.0 - (task.duration / task.maxDuration);
            progress = Math.max(0, Math.min(1, progress));
            // ★修正：調合(mix)と裁縫(tailor)のゲージ色分け
            ctx.fillStyle = animType === 'cook' ? "#FF9800" : (task.type === 'mix' || animType === 'mix' ? "#E040FB" : (task.type === 'tailor' ? "#FF4081" : (sceneType === 'building' || task.type === 'build' ? "#8BC34A" : "#9E9E9E")));
            ctx.fillRect(gx, gy, gaugeW * progress, gaugeH);
            ctx.restore();
        }
    }

    ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center";
    let statusText = "";
    let isMix = aiPet.schedule && aiPet.schedule.length > 0 && aiPet.schedule[0].type === 'mix';
    let isTailor = aiPet.schedule && aiPet.schedule.length > 0 && aiPet.schedule[0].type === 'tailor'; // ★追加

    if (sceneType === 'inside' && target) {
        statusText = `🏠 ${target.name}の中にいます`;
        if (isMix) statusText = "🧪 調合中...";
        else if (isTailor) statusText = "👘 裁縫中..."; // ★追加
        else if (animType === 'study') statusText = "📖 勉強中...";
        else if (animType === 'train') statusText = "💪 筋トレ中...";
        else if (animType === 'sleep') statusText = "💤 休憩中...";
        else if (animType === 'cook') statusText = "🍳 料理中...";
        else if (animType === 'smith') statusText = "🔨 鍛冶作業中...";
    }
    else if (sceneType === 'camping' || sceneType === 'building') {
        if (isMix) statusText = "🧪 調合中...";
        else if (isTailor) statusText = "👘 裁縫中..."; // ★追加
        else if (animType === 'study') statusText = "📖 勉強中...";
        else if (animType === 'train') statusText = "💪 筋トレ中...";
        else if (animType === 'sleep') statusText = "💤 休憩中...";
        else if (animType === 'cook') statusText = "🍳 料理中...";
        else if (animType === 'run') statusText = "🏃 ランニング中...";
        else if (animType === 'smith') {
            // ★修正：建築中か鍛冶中か、拡張中かを正確に判定してテキストを分ける
            let isBuildTask = aiPet.schedule && aiPet.schedule.length > 0 && aiPet.schedule[0].type === 'build';
            if (isBuildTask) {
                let bData = aiPet.schedule[0].buildData;
                if (bData && bData.isUpgrade) {
                    statusText = `🔨 ${bData.name}拡張中...`; // 例: 倉庫拡張中...
                } else {
                    statusText = "🔨 建築作業中...";
                }
            } else {
                statusText = "🔨 鍛冶作業中..."; 
            }
        }
        else statusText = "⛺ 野宿中...";
    }
    else if (sceneType === 'eating') statusText = "🍙 食事中...";
    else if (sceneType === 'fishing') {
        const isSea = (aiPet.interactionTarget && aiPet.interactionTarget.type === 'sea');
        statusText = isSea ? "🌊 海釣り中..." : "🎣 川釣り中...";
    }
    else if (sceneType === 'farm') {
        if (animType === 'farm_seed') statusText = "🌱 種まき中...";
        else if (animType === 'farm_water') statusText = "💧 水やり中...";
        else if (animType === 'farm_pest') statusText = "🐛 退治中...";
        else if (animType === 'farm_harvest') statusText = "🌾 収穫中...";
        else statusText = "🚜 畑仕事中...";
    }

    if (aiPet.schedule && aiPet.schedule.length > 0) {
        const currentTask = aiPet.schedule[0];
        if (currentTask.isBaito && currentTask.baitoActionMsg) {
            statusText = "💼 " + currentTask.baitoActionMsg; 
        }
    }
    
    ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeText(statusText, cx, by + winH + 20);
    ctx.fillStyle = "#FFC107"; ctx.fillText(statusText, cx, by + winH + 20);

    if (sceneType === 'fishing' && aiPet.fishingPopupTimer > 0) {
        ctx.save();
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        let popY = (cy - 50) - (90 - aiPet.fishingPopupTimer) * 0.5;
        let alpha = Math.min(1.0, aiPet.fishingPopupTimer / 30);
        ctx.globalAlpha = alpha;
        
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = 6;
        ctx.strokeText(aiPet.fishingPopup, cx, popY);
        
        ctx.fillStyle = "#FFD700"; 
        ctx.fillText(aiPet.fishingPopup, cx, popY);
        ctx.restore();
    }
}

// ==========================================
// ★ワイプ内描画も動的ロード対応！
// ==========================================
function drawCharacterInWindow(action, cx, cy, targetPet) {
    if (!targetPet) targetPet = typeof aiPet !== 'undefined' ? aiPet : window.aiPet;
    if (!targetPet) return; 
    
    let typeToDraw = targetPet.currentSkin || targetPet.baseType || 'robot';
    if (!typeToDraw) typeToDraw = 'robot';

    let conf = typeof aiConfigs !== 'undefined' ? aiConfigs[typeToDraw] : null; 
    if (!conf) conf = { scale: 0.25, actions: typeof createDefaultFrames !== 'undefined' ? createDefaultFrames() : {idle: [{sx:0,sy:0,sw:300,sh:300}]} };
    
    let currentAction = action || 'idle'; 
    if (!conf.actions || !conf.actions[currentAction]) currentAction = 'idle';
    
    let imgKey = typeToDraw; 
    if (conf.img) imgKey = conf.img; 
    if (conf.actionImages && conf.actionImages[currentAction]) { imgKey = conf.actionImages[currentAction]; }
    
    let img = images[imgKey]; 
    let safeType = String(typeToDraw);
    let fallbackBase = safeType.includes('_') ? safeType.split('_')[0] : safeType;

    if (!img) { 
        if (typeof window.dynamicImageCatalog !== 'undefined' && window.dynamicImageCatalog[imgKey]) {
            images[imgKey] = new Image(); 
            images[imgKey].onerror = () => { images[imgKey].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; };
            images[imgKey].src = window.dynamicImageCatalog[imgKey];
            img = images[fallbackBase] || images['robot']; 
        } else {
            img = images[fallbackBase] || images['robot']; 
        }
    }
    
    let actionFrames = (conf.actions && conf.actions[currentAction]) ? conf.actions[currentAction] : null;
    if (!actionFrames || actionFrames.length === 0) actionFrames = [{sx:0, sy:0, sw:300, sh:300}];
    
    let frameIdx = targetPet.frameIndex; 
    if (typeof frameIdx !== 'number' || isNaN(frameIdx) || frameIdx >= actionFrames.length) {
        frameIdx = 0;
    }
    let f = actionFrames[frameIdx] || actionFrames[0];
    
    let sc = 0.3; const drawW = (f.sw || 300) * sc; const drawH = (f.sh || 300) * sc;
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.save(); ctx.translate(cx, cy); 

        // ★追加：行動済みの場合はPIP（ワイプ）内でも暗くする
        if (currentMode === 'defense' && targetPet.hasActed) {
            ctx.filter = 'brightness(0.4)';
        } else {
            ctx.filter = 'none';
        }

        ctx.drawImage(img, f.sx || 0, f.sy || 0, f.sw || 300, f.sh || 300, -drawW/2, -drawH/2, drawW, drawH); ctx.restore();
    }
}

function drawFarmStatus(a) {
    const cx = a.dx + (a.sw * (a.scale || 0.5)) / 2;
    const topY = a.dy - 10;
    
    ctx.font = "10px sans-serif"; 
    ctx.textAlign = "center";
    
    if (!a.plantedCrop) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; 
        ctx.fillRect(cx - 30, topY - 15, 60, 15);
        ctx.fillStyle = "#fff"; 
        ctx.fillText("空き地", cx, topY - 4);
        return;
    }

    // ★修正：アイテムカタログから名前を取得（支給品等でエラーが出ないよう安全に処理）
    let cropData = null;
    if (typeof itemCatalog !== 'undefined') {
        cropData = itemCatalog[a.plantedCrop];
        if (a.plantedCrop === 'seed_carrot_given') cropData = itemCatalog['seed_carrot'];
    }
    // 「ニンジンの種」という表記を「ニンジン」にカットする簡易処理
    let cropName = cropData ? cropData.name.replace("の種", "") : "作物"; 

    // ★修正：成長と水分の「2本のゲージ」が入るように背景の黒枠を少し縦に広げる
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
    ctx.fillRect(cx - 50, topY - 45, 100, 45); 
    
    let text = `${cropName} (${Math.floor(a.growth)}%)`;
    let color = "#fff";
    let statusIcon = "";

    if (a.isDead) { 
        text = "枯れた..."; 
        color = "#9e9e9e"; 
    }
    else if (a.isEaten) { 
        text = "食べられた..."; 
        color = "#e57373"; 
    }
    else if (a.growth >= 100) {
        // ★追加：収穫可能になったら文字を緑にしてアピール！
        text = `✨収穫可能 (${cropName})`;
        color = "#4CAF50"; 
    }
    else {
        if (a.pestState) statusIcon = "🐛 危険!";
    }

    ctx.fillStyle = color;
    ctx.fillText(text, cx, topY - 30); // テキストを少し上に配置
    
    if (statusIcon) {
        ctx.font = "bold 12px sans-serif";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeText(statusIcon, cx, topY - 45); // 虫アイコンは枠から飛び出すように配置
        ctx.fillStyle = "#ff5252";
        ctx.fillText(statusIcon, cx, topY - 45);
        ctx.font = "10px sans-serif";
    }

    if (!a.isDead && !a.isEaten) {
        // ★追加：1. 成長進捗ゲージ（緑色）
        ctx.fillStyle = "#444"; 
        ctx.fillRect(cx - 40, topY - 18, 80, 6);
        ctx.fillStyle = "#4CAF50"; // 緑
        ctx.fillRect(cx - 40, topY - 18, 80 * (Math.max(0, a.growth) / 100), 6);

        // 2. 水分ゲージ（青色 / 30%以下で赤色）
        const water = a.waterLevel !== undefined ? a.waterLevel : 100;
        ctx.fillStyle = "#444"; 
        ctx.fillRect(cx - 40, topY - 8, 80, 6);
        ctx.fillStyle = water > 30 ? "#29b6f6" : "#ff3d00";
        ctx.fillRect(cx - 40, topY - 8, 80 * (Math.max(0, water) / 100), 6);
    }
}

function drawMapPreview() {
    const item = catalog[selectedMapKey];
    if (item) {
        const cx = canvas.width / 2; const cy = canvas.height / 2;
        const itemScale = item.scale !== undefined ? item.scale : 0.5;
        const zoom = 2.0; const drawW = item.sw * itemScale * zoom; const drawH = item.sh * itemScale * zoom;
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imgName = item.img || 'field'; const img = images[imgName];
        if(img && img.complete && img.naturalWidth !== 0) { ctx.drawImage(img, item.sx, item.sy, item.sw, item.sh, cx - drawW/2, cy - drawH/2, drawW, drawH); } else {
            ctx.fillStyle = "red"; ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.fillText("IMAGE NOT FOUND", cx, cy);
        }
        ctx.strokeStyle = 'red'; ctx.lineWidth = 3; ctx.strokeRect(cx - drawW/2, cy - drawH/2, drawW, drawH);
    }
}

// ==========================================
// ★ 4. UI描画のアップデート
// ==========================================
function drawAdjustUI() {
    if (!showAdjustUI) return;
    const panelW = 350; const panelH = 280; let panelX = 10; const panelY = 10;
    if (adjustUIPosRight) { panelX = canvas.width - panelW - 10; }
    ctx.save(); ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#555"; ctx.lineWidth = 2; ctx.strokeRect(panelX, panelY, panelW, panelH);
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    let y = panelY + 15; const x = panelX + 20; const lineHeight = 22;
    let targetName = ""; let target = getAdjustTarget();
    
    if (editingTarget === 'ai') { targetName = `AI: ${selectedAIType}`; } 
    else if (editingTarget === 'map') { targetName = `MAP: ${selectedMapKey}`; }
    else if (editingTarget === 'card') { targetName = `CARD: ${window.TCG_MASTER[selectedCardKey]?.name || selectedCardKey}`; }
    
    if (!target) { ctx.fillStyle = "white"; ctx.fillText("ターゲットが選択されていません", x, y); ctx.restore(); return; }
    ctx.font = "bold 16px monospace"; ctx.fillStyle = "#4CAF50"; ctx.fillText(`■ 調整モード: ${targetName}`, x, y); y += 30;
    
    if (editingTarget === 'ai') {
        ctx.font = "bold 16px monospace"; ctx.fillStyle = "#FFD700"; ctx.fillText(`Action: < ${editingActionType.toUpperCase()} > (Tabキー)`, x, y); y += 25;
        ctx.font = "14px monospace"; ctx.fillStyle = "white"; ctx.fillText(`Frame : [ ${editingFrameIndex + 1} / 3 ] (Fキー)`, x, y); y += lineHeight;
        ctx.fillStyle = isTestPlaying ? "#ff5555" : "#aaaaaa"; ctx.fillText(`再生  : ${isTestPlaying ? "▶ 再生中" : "⏸ 停止中"} (Spaceキー)`, x, y); y += lineHeight + 5;
        let conf = aiConfigs[selectedAIType]; let currentScale = conf.scale || 0.25;
        ctx.fillStyle = "#00e5ff"; ctx.fillText(`Scale : ${currentScale.toFixed(2)}倍 (V/Bキー)`, x, y); y += lineHeight;
    } else if (editingTarget === 'map') {
        ctx.font = "14px monospace"; ctx.fillStyle = "#00e5ff"; ctx.fillText(`ImgSrc: ${target.img || 'field'} (Tキーで切替)`, x, y); y += lineHeight;
        const sc = target.scale !== undefined ? target.scale : 0.5;
        ctx.fillStyle = "cyan"; ctx.fillText(`Scale : ${sc.toFixed(2)}倍 (V/Bキー)`, x, y); y += lineHeight;
        ctx.fillStyle = "#aaa"; ctx.fillText(`[R]反転 / [Delete]削除`, x, y); y += lineHeight;
    } else if (editingTarget === 'card') {
        ctx.font = "14px monospace"; ctx.fillStyle = "#FF9800"; ctx.fillText(`Card 切替: (Tabキー)`, x, y); y += lineHeight;
        ctx.fillStyle = "cyan"; ctx.fillText(`Scale X: ${(target.scaleX||1.0).toFixed(2)} (V/Bキー)`, x, y); y += lineHeight;
        ctx.fillStyle = "pink"; ctx.fillText(`Scale Y: ${(target.scaleY||1.0).toFixed(2)} (N/Mキー)`, x, y); y += lineHeight;
    }
    
    // 共通の座標・サイズ表示
    ctx.fillStyle = "white"; ctx.fillText(`CutPos: X:${target.sx}  Y:${target.sy} (WASD)`, x, y); y += lineHeight;
    ctx.fillText(`Size  : W:${target.sw}  H:${target.sh} (QE/ZC)`, x, y); y += lineHeight;

    y = panelY + panelH - 45; ctx.fillStyle = "#bbb"; ctx.font = "11px monospace"; ctx.fillText(`[H]UI表示切替 / [P]UI位置移動`, x, y);
    y = panelY + panelH - 25; ctx.fillStyle = "yellow"; ctx.font = "bold 14px monospace"; ctx.fillText(`[Enter] 設定を保存する`, x, y); 
    ctx.restore(); 
}

// ===== view_renderer.js : ファイル末尾の drawGrazingPIPs を上書き =====

function drawGrazingPIPs() {
    const activeMap = typeof grazingData !== 'undefined' ? grazingData.maps[currentGrazingMapId] : null;
    if (!activeMap || !activeMap.pets) return;

    let pipCount = 0;
    const pipW = 110; const pipH = 130; 
    const padding = 15;
    const startX = padding;
    const startY = canvas.height - pipH - padding;

    let mainPetBackup = aiPet; 

    activeMap.pets.forEach((pet, index) => {
        // アクション中、または施設内にいる場合に表示
        const isActing = ['farming_work', 'fishing', 'building', 'eating', 'sleeping', 'studying', 'training', 'explore', 'inside', 'camping'].includes(pet.actionState) || pet.visualAction || pet.isIndoors;

        if (isActing) {
            const bx = startX + (pipW + padding) * pipCount;
            const by = startY;

            // --- ★ここから背景画像の決定ロジック（メインゲームと同じ） ---
            let bgKey = 'camping_bg'; // デフォルト
            let target = pet.interactionTarget || pet.indoorTarget;
            
            if (pet.actionState === 'fishing') {
                const isSea = (target && target.type === 'sea');
                bgKey = isSea ? 'sea_bg' : 'river_bg';
            } else if (pet.actionState === 'farming_work') {
                bgKey = 'farm_bg';
            } else if (pet.actionState === 'eating') {
                bgKey = 'eating_bg';
            } else if (pet.isIndoors || pet.actionState === 'inside' || pet.actionState === 'explore') {
                if (target) {
                    if (target.type === 'hut' || target.type === 'house' || target.type === 'restaurant') bgKey = 'hut_room'; 
                    else if (target.type === 'castle') bgKey = 'castle_room';
                    else if (target.type === 'mountain' || target.type === 'skull') bgKey = 'mountain_bg';
                    else if (target.type === 'nature' || target.type === 'forest' || target.type === 'palms' || (pet.exploreState && pet.exploreState.currentFacility === 'palms')) bgKey = 'forest_bg';
                }
            }
            // -----------------------------------------------------------

            const bgData = catalog[bgKey];
            const bgImg = bgData ? images[bgData.img] : null;

            // 1. ベースの黒背景
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(bx, by, pipW, pipH);
            
            // 2. 背景素材の描画（フィールド背景や釣り背景）
            if (bgData && bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
                ctx.save(); 
                ctx.beginPath(); 
                ctx.rect(bx, by, pipW, pipH); 
                ctx.clip(); 
                // 画像をワイプサイズにフィットさせて切り抜く
                ctx.drawImage(bgImg, bgData.sx, bgData.sy, bgData.sw, bgData.sh, bx, by, pipW, pipH); 
                // キャラクターを目立たせるために、少しだけ暗いフィルターをかける
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
                ctx.fillRect(bx, by, pipW, pipH);
                ctx.restore();
            }

            // 3. 枠線とターゲット番号
            ctx.strokeStyle = "#4CAF50"; 
            ctx.lineWidth = 3;
            ctx.strokeRect(bx, by, pipW, pipH);

            // 上部のターゲットテキストに黒座布団を敷いて見やすくする
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(bx, by, pipW, 24);

            ctx.fillStyle = "#FFC107";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`Target: ${index + 1}`, bx + pipW/2, by + 16);

            try {
                aiPet = pet; window.aiPet = pet;

                let action = pet.visualAction || 'idle';
                if (pet.actionState === 'fishing') action = 'fish';
                else if (pet.actionState === 'farming_work') action = 'farm_plow';
                else if (['sleeping', 'camping'].includes(pet.actionState)) action = 'sleep';
                else if (pet.actionState === 'eating') action = 'eat_dish';
                else if (pet.actionState === 'studying') action = 'study';
                else if (pet.actionState === 'training') action = 'train';
                else if (['explore', 'inside'].includes(pet.actionState)) action = 'move'; 
                else if (pet.actionState === 'building') action = 'smith';
                
                // 4. キャラクターのアニメーションを描画
                drawCharacterInWindow(action, bx + pipW/2, by + pipH/2 + 5);

                let actName = '✨ 活動中';
                if (pet.actionState === 'fishing') actName = '🎣 釣り中';
                else if (pet.actionState === 'farming_work') actName = '🚜 農業中';
                else if (pet.actionState === 'building') actName = '🔨 建築中';
                else if (pet.visualAction === 'cook') actName = '🍳 料理中';
                else if (pet.visualAction === 'smith') actName = '⚒️ 鍛冶中';
                else if (['sleeping', 'camping'].includes(pet.actionState)) actName = '💤 睡眠中';
                else if (pet.actionState === 'eating') actName = '🍙 食事中';
                else if (pet.actionState === 'studying') actName = '📚 勉強中';
                else if (pet.actionState === 'training') actName = '💪 筋トレ中';
                else if (['explore', 'inside'].includes(pet.actionState)) actName = '🔦 探索中';

                // 下部のアクションテキストにも黒座布団を敷いて見やすくする
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(bx, by + pipH - 24, pipW, 24);

                ctx.fillStyle = "#FFF";
                ctx.fillText(actName, bx + pipW/2, by + pipH - 8);
            } finally {
                aiPet = mainPetBackup; window.aiPet = mainPetBackup;
            }
            pipCount++;
        }
    });
}

// ==========================================
// ★ パーティ用ワイプ（PIP）描画システム（対象のすり替えバグを修正）
// ==========================================
function drawPartyPIPs() {
    let targetList = [];
    if (currentMode === 'grazing') {
        const activeMap = typeof grazingData !== 'undefined' ? grazingData.maps[currentGrazingMapId] : null;
        if (activeMap && activeMap.pets) targetList = activeMap.pets;
    } else {
        if (typeof party !== 'undefined' && party.length > 0) targetList = party;
        else targetList = [window.aiPet];
    }

    if (!targetList || targetList.length === 0) return;

    let pipCount = 0;
    const pipW = 110; const pipH = 130; 
    const padding = 15;
    const startX = padding;
    const startY = canvas.height - pipH - padding;

    let mainPetBackup = window.aiPet; 

    targetList.forEach((pet, index) => {
        // ★ 追加：'apprentice_training'（修業中）もワイプ表示の条件に含める
        const isActing = ['farming_work', 'fishing', 'building', 'eating', 'sleeping', 'studying', 'training', 'explore', 'inside', 'camping', 'apprentice_training'].includes(pet.actionState) || pet.visualAction || pet.isIndoors;

        if (isActing) {
            const bx = startX + (pipW + padding) * pipCount;
            const by = startY;

            let bgKey = 'camping_bg';
            let target = pet.interactionTarget || pet.indoorTarget;
            
            if (pet.actionState === 'fishing') { bgKey = (target && target.type === 'sea') ? 'sea_bg' : 'river_bg'; } 
            else if (pet.actionState === 'farming_work') { bgKey = 'farm_bg'; } 
            else if (pet.actionState === 'eating') { bgKey = 'eating_bg'; } 
            else if (pet.isIndoors || pet.actionState === 'inside' || pet.actionState === 'explore') {
                if (target) {
                    if (['hut', 'house', 'restaurant'].includes(target.type)) bgKey = 'hut_room'; 
                    else if (target.type === 'castle') bgKey = 'castle_room';
                    else if (['mountain', 'skull'].includes(target.type)) bgKey = 'mountain_bg';
                    else bgKey = 'forest_bg';
                }
            }

            const bgData = catalog[bgKey];
            const bgImg = bgData ? images[bgData.img] : null;

            ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.fillRect(bx, by, pipW, pipH);
            
            if (bgData && bgImg && bgImg.complete) {
                ctx.save(); ctx.beginPath(); ctx.rect(bx, by, pipW, pipH); ctx.clip(); 
                ctx.drawImage(bgImg, bgData.sx, bgData.sy, bgData.sw, bgData.sh, bx, by, pipW, pipH); 
                ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; ctx.fillRect(bx, by, pipW, pipH);
                ctx.restore();
            }

            ctx.strokeStyle = index === activePartyIndex ? "#FFD700" : "#4CAF50"; 
            ctx.lineWidth = 3; ctx.strokeRect(bx, by, pipW, pipH);

            ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(bx, by, pipW, 24);
            ctx.fillStyle = index === activePartyIndex ? "#FFD700" : "#FFF";
            ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
            ctx.fillText(index === 0 ? "👑 主人公" : `🤝 助っ人${index}`, bx + pipW/2, by + 16);

            try {
                window.aiPet = pet;
                if (typeof aiPet !== 'undefined') aiPet = pet; // ★完全なすり替え

                let action = pet.visualAction || 'idle';
                if (pet.actionState === 'fishing') action = 'fish';
                else if (pet.actionState === 'farming_work') action = 'farm_plow';
                else if (['sleeping', 'camping'].includes(pet.actionState)) action = 'sleep';
                else if (pet.actionState === 'eating') action = 'eat_dish';
                else if (pet.actionState === 'studying' || pet.actionState === 'apprentice_training') action = 'study';
                else if (pet.actionState === 'training') action = 'train';
                else if (['explore', 'inside'].includes(pet.actionState)) action = 'move'; 
                else if (pet.actionState === 'building') action = 'smith';
                
                // ★ 引数に pet を直接渡して描画させる（誤爆の完全防止）
                drawCharacterInWindow(action, bx + pipW/2, by + pipH/2 + 5, pet);

                let actName = '✨ 活動中';
                if (pet.actionState === 'fishing') actName = '🎣 釣り';
                else if (pet.actionState === 'farming_work') actName = '🚜 農業';
                else if (pet.actionState === 'building') actName = '🔨 建築';
                else if (pet.actionState === 'apprentice_training') actName = '🎓 修業中'; // ★追加
                else if (pet.visualAction === 'cook') actName = '🍳 料理';
                else if (pet.visualAction === 'smith') actName = '⚒️ 鍛冶';
                else if (['sleeping', 'camping'].includes(pet.actionState)) actName = '💤 睡眠';
                else if (pet.actionState === 'eating') actName = '🍙 食事';
                else if (pet.actionState === 'studying') actName = '📚 勉強';
                else if (pet.actionState === 'training') actName = '💪 筋トレ';
                else if (['explore', 'inside'].includes(pet.actionState)) actName = '🔦 探索';

                ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(bx, by + pipH - 24, pipW, 24);
                ctx.fillStyle = "#FFF"; ctx.fillText(actName, bx + pipW/2, by + pipH - 8);
            } finally {
                window.aiPet = mainPetBackup;
                if (typeof aiPet !== 'undefined') aiPet = mainPetBackup; // ★元に戻す
            }
            pipCount++;
        }
    });
}

// ==========================================
// ★ 6. 新規追加: カード専用のプレビュー関数（動的ロード・完全対応版）
// ==========================================
window.drawCardPreview = function() {
    if (typeof window.TCG_MASTER === 'undefined') return;
    const target = window.TCG_MASTER[selectedCardKey];
    if (!target) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // TCGカードの標準的なイラスト枠のサイズ
    const frameW = 200;
    const frameH = 150;

    ctx.save();
    ctx.translate(cx, cy);

    // 背景と枠の描画
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(-cx, -cy, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-frameW/2, -frameH/2, frameW, frameH);
    ctx.strokeStyle = "#FFD700"; 
    ctx.lineWidth = 3;
    ctx.strokeRect(-frameW/2, -frameH/2, frameW, frameH);

    // 画像名の取得（TCG_MASTERに書いてある 'dragon_card.png' などをそのまま使う）
    let imgName = target.image || target.img || 'characters.png';

    // ==========================================
    // ★ 動的画像ローダー：キャッシュになければその場で読み込む！
    // ==========================================
    if (!images[imgName]) {
        images[imgName] = new Image();
        images[imgName].isError = false; 
        
        // 読み込みが完了したら、もう一度 render() を呼んで絵を表示させる
        images[imgName].onload = () => {
            if (typeof render === 'function') render();
        };
        // 読み込みに失敗したらエラーマークをつける
        images[imgName].onerror = () => {
            images[imgName].isError = true;
            if (typeof render === 'function') render();
        };
        
        // 読み込み開始（※もし画像が 'assets/' などの特定フォルダにある場合は、適宜パスを足してください）
        images[imgName].src = imgName; 
    }

    const img = images[imgName];

    // ==========================================
    // ★ 状態に応じた描画の分岐
    // ==========================================
    if (img && img.complete && !img.isError && img.width > 1) {
        // ① 読み込み完了：画像を切り抜いて表示
        const scX = target.scaleX || 1.0;
        const scY = target.scaleY || 1.0;
        const drawW = (target.sw || 50) * scX;
        const drawH = (target.sh || 50) * scY;

        ctx.beginPath();
        ctx.rect(-frameW/2, -frameH/2, frameW, frameH);
        ctx.clip();

        ctx.drawImage(
            img,
            target.sx || 0, target.sy || 0, target.sw || 50, target.sh || 50,
            -drawW/2, -drawH/2, drawW, drawH
        );
    } else if (img && !img.complete) {
        // ② 読み込み中：ローディング表示
        ctx.fillStyle = "#FFC107";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("⏳ 読み込み中...", 0, 0);
    } else {
        // ③ エラー：見つからない場合の警告表示
        ctx.fillStyle = "#F44336";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("❌ 画像エラー", 0, -10);
        ctx.fillStyle = "#fff";
        ctx.font = "12px monospace";
        ctx.fillText(`[ ${imgName} ]`, 0, 10);
        ctx.fillText(`が見つかりません`, 0, 25);
    }

    ctx.restore();
    
    // ガイドテキスト
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("枠内に収まるように WASD・QE/ZC・VB/NM で調整してください", cx, cy + frameH/2 + 30);
};

// ==========================================
// ★修正: ダンジョン素材のプレビュー描画関数（直接ファイル読み込み対応版）
// ==========================================
window.drawDungeonPreview = function() {
    if (!ctx || typeof window.getAdjustTarget !== 'function') return;
    
    const target = window.getAdjustTarget();
    if (!target) return;

    // 背景を暗くして見やすくする
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 画像名の取得
    let imgName = target.image || target.img;
    let imgObj = null;
    
    // ① 事前ロード済みアセットリストから探す
    if (typeof images !== 'undefined' && images[imgName]) {
        imgObj = images[imgName];
    } 
    // ② URLリスト(imageSources)から探す
    else if (typeof imageSources !== 'undefined' && imageSources[imgName]) {
        if (!window._tempDungeonImages) window._tempDungeonImages = {};
        if (!window._tempDungeonImages[imgName]) {
            let tmp = new Image();
            tmp.src = imageSources[imgName];
            window._tempDungeonImages[imgName] = tmp;
        }
        imgObj = window._tempDungeonImages[imgName];
    } 
    // ③ ★超重要: どちらにもない場合、入力された文字列を「直接ファイルパス」として読み込む！
    else {
        if (!window._tempDungeonImages) window._tempDungeonImages = {};
        if (!window._tempDungeonImages[imgName]) {
            let tmp = new Image();
            tmp.src = imgName; // HTMLと同じ階層の画像を直接指定
            window._tempDungeonImages[imgName] = tmp;
        }
        imgObj = window._tempDungeonImages[imgName];
    }

    // 画像がロード完了しており、データが壊れていないか判定
    if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
        // スケールを反映した描画サイズ
        const targetScale = target.scale !== undefined ? target.scale : 1.0;
        const drawW = (target.sw || 50) * targetScale;
        const drawH = (target.sh || 50) * targetScale;
        
        // 画面中央に配置
        const drawX = (canvas.width / 2) - (drawW / 2);
        const drawY = (canvas.height / 2) - (drawH / 2);

        // sx, sy, sw, sh で切り抜いて描画
        ctx.drawImage(imgObj, target.sx || 0, target.sy || 0, target.sw || 50, target.sh || 50, drawX, drawY, drawW, drawH);
        
        // 編集枠（赤枠）を描画
        ctx.strokeStyle = '#ff5252';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, drawW, drawH);

        // ガイド情報を描画
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Target: ${window.selectedDungeonSpriteKey}`, canvas.width / 2, drawY - 40);
        ctx.fillStyle = '#FFF';
        ctx.font = '16px monospace';
        ctx.fillText(`X:${target.sx} Y:${target.sy} W:${target.sw} H:${target.sh} Scale:${targetScale.toFixed(2)}`, canvas.width / 2, drawY - 15);
    } else {
        // 画像が読み込めていない場合のエラー表示
        ctx.fillStyle = '#ff5252';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`画像 [ ${imgName} ] が見つかりません`, canvas.width / 2, canvas.height / 2);
    }
};

// ==========================================
// ★追加: 店舗の家具（内装）プレビュー描画
// ==========================================
window.drawFurniturePreview = function() {
    const shopType = editingTarget === 'rasset' ? 'restaurant' : 'smith';
    if (typeof window.SHOP_FURNITURE_DATA === 'undefined') return;
    const list = window.SHOP_FURNITURE_DATA[shopType];
    if (!list) return;

    // お店のプレビュー枠（背景）を画面中央に描画
    const roomW = 450; // UIの幅に合わせる
    const roomH = 250; // UIの高さに合わせる
    const baseX = canvas.width / 2 - roomW / 2;
    const baseY = canvas.height / 2 - roomH / 2;

    ctx.save();
    
    // 1. 背景（床と壁）の描画
    ctx.fillStyle = '#5D4037'; // 画像がない時のフォールバック色
    ctx.fillRect(baseX, baseY, roomW, roomH);
    
    // 背景画像の動的ロード
    let bgImg = images['empty_room.png'];
    if (!bgImg) {
        bgImg = new Image(); bgImg.src = 'empty_room.png'; images['empty_room.png'] = bgImg;
    }
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, baseX, baseY, roomW, roomH);
    }

    // 2. 家具の描画用サブルーチン
    const drawItem = (f, isSelected) => {
        let fImg = images[f.img];
        if (!fImg) {
            fImg = new Image(); fImg.src = f.img; images[f.img] = fImg;
        }

        ctx.save();
        // 家具の配置座標(x, y)へ移動
        ctx.translate(baseX + f.x, baseY + f.y);
        ctx.scale(f.scale || 1, f.scale || 1);

        if (fImg.complete && fImg.naturalWidth > 0) {
            // スプライトシートから sx, sy, sw, sh で切り出して描画
            ctx.drawImage(fImg, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw, f.sh);
        } else {
            ctx.fillStyle = isSelected ? "rgba(255, 0, 0, 0.5)" : "rgba(100, 100, 100, 0.5)";
            ctx.fillRect(0, 0, f.sw, f.sh);
        }

        // 選択中のものは赤枠で囲み、基準点（左上）に緑の十字を描画
        if (isSelected) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2 / (f.scale || 1); // スケールに影響されない線の太さ
            ctx.strokeRect(0, 0, f.sw, f.sh);
            
            ctx.beginPath();
            ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
            ctx.moveTo(0, -10); ctx.lineTo(0, 10);
            ctx.strokeStyle = "lime";
            ctx.stroke();
        }
        ctx.restore();
    };

    // 3. 未選択の家具を先に描画（奥になる）
    list.forEach((f, index) => {
        if (index !== window.selectedFurnitureIndex) drawItem(f, false);
    });
    
    // 4. 選択中の家具を一番手前に描画
    if (list[window.selectedFurnitureIndex]) {
        drawItem(list[window.selectedFurnitureIndex], true);
    }

    // 5. 操作説明テキスト
    ctx.fillStyle = "white";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`[${shopType.toUpperCase()}] Tab:家具切替 | 矢印:配置移動 | WASD:切出座標 | QE/ZC:切出サイズ`, baseX, baseY - 10);

    ctx.restore();
};