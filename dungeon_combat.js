window.dealDungeonDamage = function(attacker, defender) {
    if (defender.hp <= 0) return;
    const s = window.DUNGEON_STATE;
    
    let aIsPlayer = (attacker === s.player);
    let aTraits = aIsPlayer ? window.getPlayerDungeonTraits(attacker.skin).map(t => t.name) : [];
    let dTraits = !aIsPlayer ? window.getPlayerDungeonTraits(defender.skin).map(t => t.name) : [];

    // ★ 追加：必中判定（プレイヤーの「神眼」 or 敵の「真理の目」）
    let isSureHit = (aIsPlayer && aTraits.includes('神眼')) || (!aIsPlayer && attacker.skin && attacker.skin.includes('bird_type3_3'));

    // ★ カブトムシ系：皇帝の威圧（50%の確率で強制ミス、残る50%は後続の計算で会心化）
    let isEmperor = (aIsPlayer && aTraits.includes('皇帝の威圧'));
    if (isEmperor) {
        if (Math.random() < 0.5) {
            window.addDungeonLog(`👑 皇帝の威圧... しかし攻撃は空を切った！`, '#9E9E9E');
            return; // 強制ミス
        }
        attacker._isEmperorCrit = true; // 後続のダメージ計算で必ず会心にするためのフラグ
    }

    // ==========================================
    // ★ 風船系の戦闘前処理（フラグ・倍率の仕込み）
    // ==========================================
    // [回避] 自：熱気球（炎印の武器装備時、回避率+15%）
    let hasFireSeal = (defender === s.player && defender.equipWeapon && typeof window.getDungeonItemEffect === 'function' && window.getDungeonItemEffect(defender.equipWeapon) === 'fire');
    defender._balloonDodgeBonus = (dTraits.includes('熱気球') && hasFireSeal) ? 0.15 : 0;

    // [会心無効] 自：しわしわボディ（敵からのクリティカルを完全に防ぐフラグ）
    defender._isCritImmune = dTraits.includes('しわしわボディ');

    // [防御倍率] 自：圧縮筋肉（満腹度30以下で防御力2倍）
    if (defender === s.player && dTraits.includes('圧縮筋肉') && (s.player.hunger || 0) <= 30) {
        defender._defMultiplier = (defender._defMultiplier || 1.0) * 2.0;
    }
    // [防御倍率] 敵：ガス抜け（物理ダメージをほとんど受け付けない）
    if (!aIsPlayer && defender.skin && defender.skin.includes('balloon_type5')) {
        defender._defMultiplier = (defender._defMultiplier || 1.0) * 10.0;
    }

    // [攻撃倍率] 自：悪夢の住人（睡眠・混乱の敵に3倍ダメージ）
    let isNightmareTarget = (defender.status && (defender.status.sleep > 0 || defender.status.confusion > 0));
    if (aTraits.includes('悪夢の住人') && isNightmareTarget) {
        attacker._atkMultiplier = (attacker._atkMultiplier || 1.0) * 3.0;
    }

    // ★ カブトムシ系特性：群れの統率者（満腹度80%以上で回避率大幅UP）
    let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : 100;
    if (!aIsPlayer && dTraits.includes('群れの統率者') && defender.hunger >= maxH * 0.8 && Math.random() < 0.3) {
        if (isSureHit) window.addDungeonLog(`👁️ 真理の目が群れの統率を破った！`, '#FF5252');
        else { window.addDungeonLog(`🦋 統率された動き！ ${defender.name} は攻撃を完全にかわした！`, '#00BCD4'); return; }
    }
    
    // ★ カブトムシ系敵特性：完全硬化（ダメージ無効バリア）
    if (!aIsPlayer && defender._hardened > 0) {
        window.addDungeonLog(`🛡️ 完全硬化中！ ${defender.name} は殻にこもり攻撃を弾いた！`, '#aaa');
        defender._hardened--; // 攻撃を受けるたびにバリア耐久が減る
        return; 
    }

    // ★ 特性：未来予知（プレイヤーが殴られる時、15%で回避）
    if (!aIsPlayer && dTraits.includes('未来予知') && Math.random() < 0.15) {
        if (isSureHit) window.addDungeonLog(`👁️ 真理の目が未来予知を破った！`, '#FF5252');
        else { window.addDungeonLog(`未来予知！ ${defender.name} は攻撃を完全に見切った！`, '#00BCD4'); return; }
    }
    // ★ 特性：データ収集（敵ロボットの回避バフ）
    // ※バグ修正：プレイヤーの攻撃時（aIsPlayer）に敵が回避判定を行うように修正
    if (aIsPlayer && defender.highDodge && Math.random() < 0.8) {
        if (isSureHit) {
            window.addDungeonLog(`👁️ 神眼が ${defender.name} の予測回避を無効化した！`, '#FFD700');
            defender.highDodge = false;
        } else {
            window.addDungeonLog(`${defender.name} のデータ予測により攻撃がかわされた！`, '#aaa');
            defender.highDodge = false; // 消費
            return;
        }
    }

    // ★ 風船系：熱気球（回避ボーナス）
    if (defender._balloonDodgeBonus > 0 && Math.random() < defender._balloonDodgeBonus) {
        if (isSureHit) window.addDungeonLog(`👁️ 神眼が熱気球の回避を無効化した！`, '#FFD700');
        else { window.addDungeonLog(`🎈 熱気球！ ${defender.name} は攻撃をふわりとかわした！`, '#00BCD4'); return; }
    }

    let aAtk = attacker.basePwr || attacker.damage || 5;
    let dDef = defender.def || 0;

    // ★ 風船系：仕込んでおいた攻防倍率の適用
    aAtk = Math.floor(aAtk * (attacker._atkMultiplier || 1.0));
    dDef = Math.floor(dDef * (defender._defMultiplier || 1.0));

    let wEff = null; let sEff = null;
    let sealBonus = 0; let isDoubleSeal = false;

    if (aIsPlayer) {
        wEff = attacker.equipWeapon ? window.getDungeonItemEffect(attacker.equipWeapon) : null;
        if (wEff) {
            aAtk += wEff.atk;
            // ★ 修正：聖なる甲殻（[光]の印がすべての悪魔・闇落ち系に効く）
            let isUndead = (defender.type === 'ghost' || defender.type === 'spirit');
            let isDemonOrDark = (defender.type === 'demon' || (defender.skin && defender.skin.includes('type1')));
            if (wEff.traits.includes('holy') && (isUndead || (aTraits.includes('聖なる甲殻') && isDemonOrDark))) {
                sealBonus += 15;
            }
            if (wEff.traits.includes('fire')) sealBonus += 10;
            if (wEff.traits.includes('anti_dragon') && defender.type === 'dragon') sealBonus += 15;
        }
        // ★ 追加：魅惑の鱗粉などによる攻撃力デバフの適用
        aAtk = Math.max(1, aAtk + (attacker.atkBuff || 0));

        // ★ カブトムシ系敵特性：神聖領域（隣接時、プレイヤーの攻撃力激減）
        if (s.enemies.some(e => e.hp > 0 && e.skin && e.skin.includes('beetle_type2_4') && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1)) {
             aAtk = Math.max(1, Math.floor(aAtk / 2));
             window.addDungeonLog(`✨ 神聖領域の影響で、攻撃力が激減してしまった！`, '#aaa');
        }

        // ★ 特性：最終兵器
        if (aTraits.includes('最終兵器')) aAtk += 10;
        // ★ 特性：殺戮回路
        if (aTraits.includes('殺戮回路') && attacker.hp >= attacker.maxHp) aAtk = Math.floor(aAtk * 1.5);
        // ★ 特性：終焉の炉心
        if (aTraits.includes('終焉の炉心')) isDoubleSeal = true;
        
        // ★ カブトムシ系特性：剛力（所持アイテムが多いほど攻撃力UP！最大+20前後）
        if (aTraits.includes('剛力') && s.player.tempInventory) {
            aAtk += s.player.tempInventory.length;
        }
    } else {
        sEff = defender.equipShield ? window.getDungeonItemEffect(defender.equipShield) : null;
        if (sEff) dDef += sEff.def;
        // ★ 特性：頑丈な装甲 / 重装甲
        if (dTraits.includes('重装甲')) dDef += 6;
        else if (dTraits.includes('頑丈な装甲')) dDef += 3;
        
        // ★ カブトムシ系特性：硬い外殻（防御力+2）
        if (dTraits.includes('硬い外殻')) dDef += 2;
        
        // ★ カブトムシ系特性：群れの統率者（満腹度80%以上で防御力大幅UP）
        if (dTraits.includes('群れの統率者') && defender.hunger >= maxH * 0.8) {
            dDef += 10;
        }
    }

    // ★ カブトムシ系敵特性：挟み切り（プレイヤーの防御力を半減）
    if (!aIsPlayer && attacker.skin && attacker.skin.includes('beetle_type1') && Math.random() < 0.25) {
        window.addDungeonLog(`✂️ 挟み切り！ ${defender.name} の装甲が切り裂かれた！`, '#FF5252');
        dDef = Math.floor(dDef / 2);
    }

    // ★ 敵特性：アームスマッシュ（盾無視）
    if (!aIsPlayer && attacker.skin && attacker.skin.includes('robot_type4_2') && Math.random() < 0.3) {
        window.addDungeonLog(`💥 アームスマッシュ！ ${defender.name} の防御を貫いた！`, '#FF5252');
        dDef = 0;
    }
    // ★ 敵特性：絶対防御陣（正面からの物理無効）
    if (!aIsPlayer && defender.skin && defender.skin.includes('robot_type5_2')) {
        let isFront = false;
        if (attacker.face === 'up' && defender.face === 'down') isFront = true;
        if (attacker.face === 'down' && defender.face === 'up') isFront = true;
        if (attacker.face === 'left' && defender.face === 'right') isFront = true;
        if (attacker.face === 'right' && defender.face === 'left') isFront = true;
        if (isFront) {
            window.addDungeonLog(`絶対防御陣により攻撃が弾かれた！`, '#aaa');
            return;
        }
    }

    let dmg = Math.max(1, aAtk - dDef);
    
    // ★ 追加：ルーン魔方陣（タイルID:11）によるダメージ半減
    if (s.grid[defender.y] && s.grid[defender.y][defender.x] === 11) {
        window.addDungeonLog(`✡️ ルーン魔方陣が光り、ダメージを半減した！`, '#E040FB');
        dmg = Math.max(1, Math.floor(dmg / 2));
    }

    if (aIsPlayer && wEff && wEff.traits.includes('crit') && Math.random() < 0.15 && !defender._isCritImmune) { 
        // ★ 特性：冥界の風（会心ダメージ3倍）
        if (aTraits.includes('冥界の風')) {
            dmg *= 3; window.addDungeonLog(`🌪️ 冥界の風！ 破壊的な会心の一撃！(ダメージ3倍)`, '#9C27B0'); 
        } else {
            dmg *= 2; window.addDungeonLog(`💥 会心の一撃！`, '#FFEB3B'); 
        }
    }

    // ★ カブトムシ系特性：皇帝の威圧（当たれば必ず強烈な会心の一撃！）
    if (attacker._isEmperorCrit) {
        dmg = Math.floor(dmg * 2.5); // 通常の会心よりさらに強力な 2.5倍
        window.addDungeonLog(`👑 皇帝の威圧！ 圧倒的な一撃が ${defender.name} を粉砕する！`, '#FFD700');
        delete attacker._isEmperorCrit; // フラグをリセット
    }

    // ★ 修正：盾の見切り（parry）も必中で貫通する
    if (!aIsPlayer && sEff && sEff.traits.includes('parry') && Math.random() < 0.15) {
        if (isSureHit) window.addDungeonLog(`👁️ 真理の目が盾の見切りを貫通した！`, '#FF5252');
        else { window.addDungeonLog(`🛡️ 見切り！ ${defender.name} は攻撃を弾いた！`, '#4fc3f7'); return; }
    }

    let finalSealDmg = isDoubleSeal ? sealBonus * 2 : sealBonus;
    dmg += finalSealDmg;

    // ★ 特性：古代の盾
    if (!aIsPlayer && dTraits.includes('古代の盾')) dmg = Math.max(1, dmg - 5);
    // ★ 敵特性：神託の盾（偶数ターンはダメージ1）
    if (aIsPlayer && defender.skin && defender.skin.includes('robot_type3_3') && (s.turnCount || 0) % 2 === 0) {
        window.addDungeonLog(`神託の盾が輝き、ダメージが 1 に軽減された！`, '#00BCD4');
        dmg = 1;
    }

    // ★ 敵特性：データ吸収（HPではなく満腹度を奪う）
    if (!aIsPlayer && attacker.skin && attacker.skin.includes('robot_type1_2')) {
        window.addDungeonLog(`データ吸収！ ${defender.name} の満腹度が奪われた！`, '#9C27B0');
        defender.hunger = Math.max(0, defender.hunger - dmg);
        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(defender.x, defender.y, `-${dmg} Food`, false);
        return;
    }

    defender.hp -= dmg;
    
    // ==========================================
    // ★ ここがすべてを解決する魔法の1行です！！
    // これにより、updateDungeonUIで元の「完璧なCSSアニメーション」が発動します！
    // ==========================================
    defender.damageAnim = true; 
    
    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(defender.x, defender.y, dmg, defender === s.player);
    window.addDungeonLog(`${defender.name} に ${dmg} ダメージ！`, defender === s.player ? '#ff5252' : '#FF9800');

    // ★ 追加：武器の[癒]の印の効果 ＆ カブトムシ系「血の飢え」による倍化
    if (aIsPlayer && wEff && wEff.traits.includes('heal')) {
        let healAmt = Math.max(1, Math.floor(dmg * 0.2));
        if (aTraits.includes('血の飢え')) healAmt *= 2; // ★血の飢えで2倍！
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
        window.addDungeonLog(`💧 [癒]の印でHPを ${healAmt} 吸収した！`, '#4CAF50');
    }

    // ★ 特性：ウイルス侵蝕（殴った敵を毒にする）
    if (aIsPlayer && aTraits.includes('ウイルス侵蝕')) { defender.status.poison += 3; }
    // ★ 敵特性：サビ撒き
    if (!aIsPlayer && attacker.skin && attacker.skin.includes('robot_type5')) {
        if (defender.equipWeapon) {
            // ★ カブトムシ系特性：琥珀コーティング（サビ無効）
            if (dTraits.includes('琥珀コーティング')) {
                window.addDungeonLog(`✨ 琥珀コーティングが ${defender.name} の武器をサビから守った！`, '#FFD700');
            } else {
                let pBase = window.parseItemString(defender.equipWeapon);
                if (pBase.plus > 0) {
                    defender.equipWeapon = `${pBase.baseId}_+${pBase.plus - 1}` + (pBase.seals.length>0 ? '_'+pBase.seals.join('_') : '');
                    window.addDungeonLog(`サビ撒き！ ${attacker.name} の武器が劣化してしまった！`, '#9C27B0');
                }
            }
        }
    }
    // ★ 敵特性：ホログラム（ダメージを受けると分身生成）
    if (aIsPlayer && defender.skin && defender.skin.includes('robot_type2_3') && defender.hp > 0 && Math.random() < 0.3) {
        let ex = defender.x; let ey = defender.y;
        let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}];
        for (let d of dirs) { if (s.grid[ey+d.dy][ex+d.dx] !== 1 && !s.enemies.some(e=>e.x===ex+d.dx&&e.y===ey+d.dy)) { ex+=d.dx; ey+=d.dy; break; } }
        if (ex !== defender.x || ey !== defender.y) {
            window.addDungeonLog(`${defender.name} のホログラム（分身）が現れた！`, '#00BCD4');
            s.enemies.push({ id: 'e_holo_'+Date.now(), x: ex, y: ey, hp: 1, maxHp: 1, damage: defender.damage, name: `分身の${defender.type}`, type: defender.type, skin: defender.skin, face: defender.face, attackAnim: false, status: { poison:0, confusion:0 } });
        }
    }
    // ★ 敵特性：データ収集（殴られたら回避アップ）
    if (aIsPlayer && defender.skin && defender.skin.includes('robot_type3')) defender.highDodge = true;

    // 撃破時の処理
    if (defender.hp <= 0) {
        window.addDungeonLog(`${defender.name} を倒した！`, '#FFD700');
        if (aIsPlayer) {
            // ★ 特性：学習機能
            let expGain = aTraits.includes('学習機能') ? 24 : 20;
            attacker.exp = (attacker.exp || 0) + expGain;

            // ★修正：レベルアップに必要な経験値をスケールさせる（Lv1=100, Lv2=150, Lv3=200...）
            let requiredExp = 100 + ((attacker.level || 1) - 1) * 50; 

            if (attacker.exp >= requiredExp) {
                attacker.exp -= requiredExp; 
                attacker.level = (attacker.level || 1) + 1; 
                attacker.maxHp += 20; 
                attacker.hp = attacker.maxHp; 
                attacker.basePwr += 5; // 攻撃力の上がり幅を少しマイルドに調整
                
                // ★修正：「省エネ」の最大満腹度+20を考慮して全回復させる
                let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (attacker.maxHunger || 100);
                if (aTraits.includes('省エネ')) maxH += 20;
                attacker.hunger = maxH; 

                attacker.levelUpAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(attacker.x, attacker.y, 'level_up');
                window.addDungeonLog(`✨ レベルアップ！ Lv.${attacker.level} になった！(体力・満腹度 全回復)`, '#E040FB');
            }
            // ★ 特性：始祖の血（ごく稀に最大HP+1）
            if (aTraits.includes('始祖の血') && Math.random() < 0.05) {
                attacker.maxHp += 1;
                attacker.hp += 1; // 上限が上がった分、現在HPも回復
                window.addDungeonLog(`🩸 始祖の血が脈打つ！ 最大HPが 1 上がった！`, '#FF5252');
            }

            // ★ 特性：成金趣味 ＆ カラスの嗅覚
            let dropChance = aTraits.includes('成金趣味') ? 0.6 : 0.1;
            if (aTraits.includes('カラスの嗅覚') && dropChance < 0.2) dropChance = 0.2; // 嗅覚持ちはベースのドロップ率も少し上げる
            
            // ★ カブトムシ系特性：希少種（ドロップ率 +20%）
            if (aTraits.includes('希少種')) dropChance += 0.2;

            if (Math.random() < dropChance) {
                let items = Object.keys(itemCatalog).filter(k => k.startsWith('item_'));
                let droppedKey = items[Math.floor(Math.random() * items.length)];

                // ★ 特性：カラスの嗅覚（指輪や命の草などの確率を大幅アップ）
                if (aTraits.includes('カラスの嗅覚') && Math.random() < 0.5) {
                    let rareItems = items.filter(k => k.includes('ring') || k.includes('herb_life') || k.includes('scroll_bless') || k.includes('wand_magic'));
                    if (rareItems.length > 0) {
                        droppedKey = rareItems[Math.floor(Math.random() * rareItems.length)];
                        window.addDungeonLog(`🦅 カラスの嗅覚がレアアイテムを嗅ぎつけた！`, '#FFD700');
                    }
                }

                s.player.tempInventory.push(droppedKey); 
                window.addDungeonLog(`敵は ${window.getDungeonItemEffect(droppedKey).name} を落とした！`, '#4CAF50');
            }
        }
        // ★ 敵特性：メルトダウン（死亡時爆発）
        if (!aIsPlayer && defender.skin && defender.skin.includes('robot_type1_3')) {
            window.addDungeonLog(`💥 メルトダウン！ ${defender.name} が大爆発を起こした！`, '#FF5252');
            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(defender.x, defender.y, 'fire');
            if (Math.abs(s.player.x - defender.x) <= 1 && Math.abs(s.player.y - defender.y) <= 1) s.player.hp -= 30;
            s.enemies.forEach(e => { if(e!==defender && Math.abs(e.x - defender.x) <= 1 && Math.abs(e.y - defender.y) <= 1) e.hp -= 30; });
        }
        // ★ 敵特性：時間逆行
        if (!aIsPlayer && defender.skin && defender.skin.includes('robot_type5_3') && !defender.hasRevived) {
            window.addDungeonLog(`⏳ 時間逆行！ ${defender.name} は時を戻して復活した！`, '#E040FB');
            defender.hp = defender.maxHp; defender.hasRevived = true;
        }
    }
};

// ==========================================
// ⚔️ ダンジョン戦闘の中央処理関数（全特性対応）
// ==========================================
window.executeDungeonCombat = function(isPlayerAttacking, attacker, defender, baseDamage, isMagic = false) {
    const s = window.DUNGEON_STATE;
    let finalDamage = baseDamage;
    let activeTraits = [];
    if (s.player.skin) activeTraits = window.getPlayerDungeonTraits(s.player.skin).map(t => t.name);

    if (isPlayerAttacking) {
        let eSkin = defender.skin || defender.type || "";

        // --- 1. プレイヤー(攻撃側)のバフ ---
        if (activeTraits.includes('大地の力') && (s.grid[s.player.y][s.player.x] === 6 || s.grid[s.player.y][s.player.x] === 7)) finalDamage += 10;
        if (activeTraits.includes('耐冷構造') && (s.grid[s.player.y][s.player.x] === 8 || s.grid[s.player.y][s.player.x] === 9)) finalDamage += 5;
        if (activeTraits.includes('大樹の怒り') && s.player._wrath) {
            finalDamage *= 2; s.player._wrath = false;
            window.addDungeonLog(`🌿 大樹の怒り解放！ 強烈な一撃！`, '#FF9800');
        }

        // --- 2. 敵(防御側)の回避と防御特性 ---
        let isSureHit = activeTraits.includes('神眼'); // プレイヤー攻撃時の必中フラグ

        if (eSkin === 'spirit_type5_2' && Math.random() < 0.2) {
            if (isSureHit) window.addDungeonLog(`👁️ 神眼が落葉の目眩ましを見破った！`, '#FFD700');
            else { window.addDungeonLog(`🍂 落葉に遮られ、${defender.name}への攻撃が外れた！`, '#aaa'); return; }
        }
        if (eSkin === 'spirit_type4') finalDamage = Math.max(1, finalDamage - 3);
        if (isMagic && eSkin === 'spirit_type2_3' && Math.random() < 0.5) {
            window.addDungeonLog(`🪞 鏡面反射！ 魔法が跳ね返された！`, '#FF5252');
            s.player.hp -= finalDamage; s.player.damageAnim = true; return;
        }
        
        // ★ 風船系敵特性：シャボンバリア（魔法ダメージを完全に反射）
        if (isMagic && eSkin === 'balloon_type2') {
            window.addDungeonLog(`🫧 シャボンバリア！ 薄い膜が魔法を完全に跳ね返した！`, '#FF5252');
            s.player.hp -= finalDamage; s.player.damageAnim = true; return;
        }

        if (eSkin === 'spirit_type3_2' && Math.random() < 0.5) {
            let otherEnemies = s.enemies.filter(e => e.hp > 0 && e.id !== defender.id && window.isTileVisible(s, e.x, e.y));
            if (otherEnemies.length > 0) {
                let scapegoat = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
                window.addDungeonLog(`🌀 因果改変！ ダメージが ${scapegoat.name} に押し付けられた！`, '#9C27B0');
                scapegoat.hp -= finalDamage; scapegoat.damageAnim = true;
                if (scapegoat.hp <= 0) window.addDungeonLog(`💀 ${scapegoat.name} を倒した！`, '#FF5252');
                return;
            }
        }

        // --- 3. ダメージ処理 ---
        defender.hp -= finalDamage; defender.damageAnim = true;
        window.addDungeonLog(`💥 ${defender.name} に ${finalDamage} ダメージ！`, '#FFF');

        // --- 4. 攻撃後の追加効果（ノックバック、反撃、吸収など） ---
        if (defender.hp > 0) {
            if (activeTraits.includes('ヘビーパンチ') && Math.random() < 0.2 && !isMagic) {
                let dx = defender.x - s.player.x; let dy = defender.y - s.player.y;
                if (s.grid[defender.y + dy] && s.grid[defender.y + dy][defender.x + dx] !== 1) {
                    defender.x += dx; defender.y += dy; window.addDungeonLog(`👊 ヘビーパンチ！ 敵を吹き飛ばした！`, '#00BCD4');
                }
            }
            if (eSkin === 'spirit_type4_3') {
                let recoil = Math.floor(finalDamage * 0.2);
                if (recoil > 0) { s.player.hp -= recoil; window.addDungeonLog(`🌵 カウンター・ソーン！ ${recoil} の反撃を受けた！`, '#FF5252'); }
            }
            if (eSkin === 'spirit_type1' && Math.abs(defender.x - s.player.x) <= 1 && Math.abs(defender.y - s.player.y) <= 1) {
                if (!activeTraits.includes('毒素体質') && !activeTraits.includes('清浄なる輝き')) {
                    s.player.status.poison = 10; window.addDungeonLog(`🍄 猛毒胞子を浴びてしまった！`, '#FF5252');
                }
            }
        } else if (defender.hp <= 0) {
            window.addDungeonLog(`💀 ${defender.name} を倒した！`, '#FF5252');
            if (eSkin === 'spirit_type1_2') {
                let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
                let eRoom = s.roomsInfo.find(r => defender.x >= r.x && defender.x < r.x+r.w && defender.y >= r.y && defender.y < r.y+r.h);
                if ((pRoom && eRoom && pRoom === eRoom) || (Math.abs(defender.x - s.player.x) <= 2 && Math.abs(defender.y - s.player.y) <= 2)) {
                    let screamDmg = Math.floor(s.player.hp * 0.5);
                    s.player.hp -= screamDmg; s.player.damageAnim = true;
                    window.addDungeonLog(`😱 死の絶叫！ 鼓膜を破る叫びで ${screamDmg} ダメージ！`, '#FF5252');
                }
            }
        }
        
        if (activeTraits.includes('怨念の根') && !isMagic) {
            let heal = Math.floor(finalDamage * 0.3);
            if (activeTraits.includes('血の飢え')) heal *= 2; // ★血の飢えで吸収量が倍化！
            if (heal > 0) { s.player.hp = Math.min(s.player.maxHp, s.player.hp + heal); window.addDungeonLog(`🌱 怨念の根でHPを ${heal} 吸収した！`, '#4CAF50'); }
        }

    } else {
        // --- 敵からの攻撃 ---
        let eSkin = attacker.skin || attacker.type || "";
        let isEnemySureHit = eSkin === 'bird_type3_3'; // 敵の必中フラグ（真理の目）
        let oldStatus = JSON.parse(JSON.stringify(s.player.status || {})); // ★ 状態異常記録

        // ★ 風船系敵特性：機雷爆発（隣接自爆）
        if (eSkin === 'balloon_type1_2') {
            window.addDungeonLog(`💣 機雷爆発！ ${attacker.name} が自爆攻撃を仕掛けてきた！`, '#FF5252');
            finalDamage = Math.max(1, Math.floor(s.player.maxHp / 2));
            attacker.hp = 0; // 自爆
        }
        // ★ 風船系敵特性：バーナー放射
        if (eSkin === 'balloon_type4_2') {
            window.addDungeonLog(`🔥 バーナー放射！ 頭上から回避不能の炎を浴びせた！`, '#FF5252');
            finalDamage += 15;
            isEnemySureHit = true; // 回避不能
        }

        // --- 1. プレイヤー(防御側)のバフ ---
        // ★ 風船系特性：虹色の膜 / 不朽の硬度（魔法・属性ダメージ・固定ダメージの半減）
        if (isMagic && (activeTraits.includes('虹色の膜') || activeTraits.includes('不朽の硬度'))) {
            finalDamage = Math.max(1, Math.floor(finalDamage / 2));
            window.addDungeonLog(activeTraits.includes('虹色の膜') ? `🌈 虹色の膜が魔法ダメージを半減した！` : `💎 不朽の硬度がダメージを半減した！`, '#00BCD4');
        }

        if (activeTraits.includes('妖精の加護') && Math.random() < 0.1) {
            if (isEnemySureHit) window.addDungeonLog(`👁️ 真理の目が妖精の加護を打ち消した！`, '#FF5252');
            else { window.addDungeonLog(`✨ 妖精の加護が光り、ダメージを無効化した！`, '#4CAF50'); return; }
        }
        if (activeTraits.includes('哀愁の波動')) {
            let pRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x+r.w && s.player.y >= r.y && s.player.y < r.y+r.h);
            let eRoom = s.roomsInfo.find(r => attacker.x >= r.x && attacker.x < r.x+r.w && attacker.y >= r.y && attacker.y < r.y+r.h);
            if ((pRoom && eRoom && pRoom === eRoom) || (Math.abs(attacker.x - s.player.x) <= 2 && Math.abs(attacker.y - s.player.y) <= 2)) {
                finalDamage = Math.max(1, Math.floor(finalDamage * 0.9)); 
            }
        }
        if (activeTraits.includes('大地の力') && (s.grid[s.player.y][s.player.x] === 6 || s.grid[s.player.y][s.player.x] === 7)) {
            finalDamage = Math.max(1, finalDamage - 10);
        }

        // --- 2. ダメージ処理 ---
        defender.hp -= finalDamage; defender.damageAnim = true;
        window.addDungeonLog(`💥 ${attacker.name} から ${finalDamage} ダメージを受けた！`, '#FF9800');
        
        if (activeTraits.includes('大樹の怒り')) s.player._wrath = true;

        // --- 3. 攻撃後の追加効果（敵のスキル発動） ---
        
        // ★ カブトムシ系敵特性：大地の怒り（インベントリからアイテムを強制ドロップ）
        if (eSkin === 'beetle_type4_2' && Math.random() < 0.15) {
            window.addDungeonLog(`🌋 ${attacker.name} の大地の怒り！ 地面が激しく揺れる！`, '#FF5252');
            s.player.damageAnim = true;
            if (s.player.tempInventory && s.player.tempInventory.length > 0) {
                // インベントリからランダムに1つアイテムを落とす
                let dropIdx = Math.floor(Math.random() * s.player.tempInventory.length);
                let droppedItem = s.player.tempInventory.splice(dropIdx, 1)[0];
                // プレイヤーの足元にアイテムを配置
                s.items.push({ key: droppedItem, x: s.player.x, y: s.player.y });
                window.addDungeonLog(`💥 転倒してしまい、持っていたアイテムを落としてしまった！`, '#FF9800');
                if (typeof window.updateDungeonUI === 'function') window.updateDungeonUI();
            }
        }
        
        // ★ カブトムシ系敵特性：カチ上げ（落下ダメージ＋麻痺による行動不能）
        if (eSkin === 'beetle_type4' && Math.random() < 0.15) {
            let fallDmg = Math.floor(s.player.maxHp * 0.1); // 最大HPの10%の固定ダメージ
            s.player.hp -= fallDmg;
            s.player.status.paralyzed = (s.player.status.paralyzed || 0) + 1; // 1ターン行動不能
            window.addDungeonLog(`🚀 カチ上げられた！ 空中に打ち上げられ、落下して ${fallDmg} ダメージ！`, '#FF5252');
        }

        // ★ カブトムシ系敵特性：フェロモン指揮（周囲の敵を集結）
        if (eSkin === 'beetle_type3' && Math.random() < 0.20) {
            window.addDungeonLog(`🔊 ${attacker.name} がフェロモンを放ち、周囲の敵を呼び寄せた！`, '#FF5252');
            s.enemies.forEach(e => {
                if (e.hp > 0 && e !== attacker && Math.random() < 0.5) { 
                    let dirs = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}, {dx:1,dy:1}, {dx:-1,dy:-1}, {dx:1,dy:-1}, {dx:-1,dy:1}];
                    for(let d of dirs) {
                        let nx = s.player.x + d.dx; let ny = s.player.y + d.dy;
                        if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(en=>en.hp>0 && en.x===nx && en.y===ny) && !(nx===s.player.x && ny===s.player.y)) {
                            e.x = nx; e.y = ny; e.warpAnim = true; break;
                        }
                    }
                }
            });
        }
        
        // ★ カブトムシ系敵特性：完全硬化（殻にこもり、次の2回の攻撃を無効化するバリア）
        if (eSkin === 'beetle_type5_2' && Math.random() < 0.15) {
            attacker._hardened = 2; // 2回無効化
            window.addDungeonLog(`🐚 ${attacker.name} は殻にこもり、完全硬化した！(攻撃2回無効)`, '#FFF');
        }

        // ★ カブトムシ系敵特性：鱗粉の風（ランダム状態異常）
        if (eSkin === 'beetle_type2_3' && Math.random() < 0.20 && !activeTraits.includes('清浄なる輝き')) {
            window.addDungeonLog(`🦋 鱗粉の風が舞い散る！`, '#E040FB');
            let r = Math.random();
            if (r < 0.33) { s.player.status.poison += 5; window.addDungeonLog(`🍄 猛毒を浴びた！`, '#9C27B0'); }
            else if (r < 0.66) { s.player.status.sleep += 3; window.addDungeonLog(`💤 強烈な睡魔に襲われた！`, '#B39DDB'); }
            else { s.player.status.confusion += 5; window.addDungeonLog(`🌀 混乱してしまった！`, '#FF9800'); }
        }

        // ★ 新規追加：鳥系の敵スキル「突風」（20%でノックバック）
        if (eSkin && eSkin.includes('bird') && Math.random() < 0.20) {
            // プレイヤーが2進化特性「暴風の主」を持っていたら無効化＆カウンター！
            if (dTraits.includes('暴風の主')) {
                window.addDungeonLog(`🌪️ ${attacker.name} の突風！しかし ${defender.name} は風を支配し、逆に弾き返した！`, '#00BCD4');
                let dx = Math.sign(attacker.x - defender.x); let dy = Math.sign(attacker.y - defender.y);
                if (dx === 0 && dy === 0) dx = 1; // 同座標フェイルセーフ
                let nx = attacker.x + dx; let ny = attacker.y + dy;
                
                if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny && e !== attacker)) {
                    attacker.x = nx; attacker.y = ny;
                } else {
                    window.addDungeonLog(`💥 ${attacker.name} は壁に激突した！(10ダメージ)`, '#FF5252');
                    attacker.hp -= 10;
                }
            // ★ 風船系特性：弾む体（吹き飛ばしを無効化）
            } else if (dTraits.includes('弾む体')) {
                window.addDungeonLog(`🎈 ${attacker.name} の突風！しかし ${defender.name} は弾む体で吹き飛ばしを無効化した！`, '#00BCD4');
            } else {
                window.addDungeonLog(`🌪️ ${attacker.name} の突風！ 1マス吹き飛ばされた！`, '#00BCD4');
                let dx = Math.sign(defender.x - attacker.x); let dy = Math.sign(defender.y - attacker.y);
                if (dx === 0 && dy === 0) dx = 1; // 同座標フェイルセーフ
                let nx = defender.x + dx; let ny = defender.y + dy;
                
                if (s.grid[ny] && s.grid[ny][nx] !== 1 && !s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) {
                    defender.x = nx; defender.y = ny;
                } else {
                    window.addDungeonLog(`💥 壁に激突した！(5ダメージ)`, '#FF5252');
                    defender.hp -= 5;
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, 5, true);
                }
            }
        }

        // ★追加：鳥系の攻撃時スキル（鱗粉、尾羽、石化）
        if (eSkin.includes('bird_type2_2') && Math.random() < 0.2 && !activeTraits.includes('清浄なる輝き')) {
            window.addDungeonLog(`🌌 銀河の尾羽が煌めく！ 状態異常が撒き散らされた！`, '#E040FB');
            let r = Math.random();
            if (r < 0.33) { s.player.status.poison += 5; window.addDungeonLog(`🍄 猛毒を浴びた！`, '#9C27B0'); }
            else if (r < 0.66) { s.player.status.sleep += 3; window.addDungeonLog(`💤 強烈な睡魔に襲われた！`, '#B39DDB'); }
            else { s.player.status.confusion += 10; window.addDungeonLog(`🌀 混乱してしまった！`, '#FF9800'); }
        } else if (eSkin.includes('bird_type2') && Math.random() < 0.3) {
            let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);
            s.player.hunger = Math.min(maxH, s.player.hunger + 5);
            s.player.atkBuff = (s.player.atkBuff || 0) - 1;
            window.addDungeonLog(`✨ 魅惑の鱗粉！ お腹が少し膨れたが、攻撃力が下がってしまった！`, '#E040FB');
        }
        if (eSkin.includes('bird_type5_2') && Math.random() < 0.15 && !activeTraits.includes('清浄なる輝き')) {
            s.player.status.petrified = 3;
            window.addDungeonLog(`🗿 化石の呪い！ 体が石化して動けない！`, '#757575');
        }

        if (eSkin === 'spirit') {
            let heal = Math.floor(finalDamage * 0.5);
            if (heal > 0) { attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal); window.addDungeonLog(`💧 体力を吸収された！`, '#aaa'); }
        }

        // ==========================================
        // ★ 風船系の被弾後・死亡時リアクション
        // ==========================================
        // 【自】爆発反応装甲：近接ダメージを受けた時に固定10ダメージを返す
        if (dTraits.includes('爆発反応装甲') && finalDamage > 0) {
            window.addDungeonLog(`💥 爆発反応装甲が起動！ ${attacker.name} に爆発を返した！`, '#FF5722');
            attacker.hp = Math.max(0, attacker.hp - 10);
        }

        // 【敵】絶望の破裂：死亡時に「恐怖（行動不可）」と「毒」をばら撒く
        if (!aIsPlayer && defender.hp <= 0 && defender.skin && defender.skin.includes('balloon_type1_3')) {
            window.addDungeonLog(`☠️ ${defender.name} の絶望の破裂！ 毒と絶望のガスが撒き散らされた！`, '#9C27B0');
            s.player.status.poison = (s.player.status.poison || 0) + 5;
            s.player.status.fear = (s.player.status.fear || 0) + 3; // ★ sleepではなく、専用のfearステータスを使用
        }
        if (eSkin === 'spirit_type2' && Math.random() < 0.1 && !activeTraits.includes('清浄なる輝き')) {
            s.player.status.sleep = 3; window.addDungeonLog(`💤 睡眠の粉を吸い込んで眠ってしまった！`, '#B39DDB');
        }
        if (eSkin === 'spirit_type4_2' && !activeTraits.includes('清浄なる輝き')) {
            s.player.status.paralyzed = 2; window.addDungeonLog(`🌿 根に絡みつかれ、足止めされた！`, '#FF9800');
        }
        if (eSkin === 'spirit_type5_3' && !activeTraits.includes('清浄なる輝き')) {
            s.player.status.paralyzed = 1; window.addDungeonLog(`❄️ 凍結の吐息で体が凍りついた！`, '#00BCD4');
        }

        // ==========================================
        // ★ 風船系のデバフ反射・吸収処理
        // ==========================================
        let gainedPoison = s.player.status.poison > (oldStatus.poison || 0);
        let gainedSleep = s.player.status.sleep > (oldStatus.sleep || 0);
        let gainedConfusion = s.player.status.confusion > (oldStatus.confusion || 0);
        let gainedParalyze = s.player.status.paralyzed > (oldStatus.paralyzed || 0);
        let gainedPetrify = s.player.status.petrified > (oldStatus.petrified || 0);
        let gainedFear = s.player.status.fear > (oldStatus.fear || 0);

        if (activeTraits.includes('毒ガスタンク') && gainedPoison) {
            s.player.atkBuff = (s.player.atkBuff || 0) + 5;
            window.addDungeonLog(`🎈 毒ガスタンク起動！ 毒を力に変えて攻撃力が上がった！`, '#FFD700');
        }
        if (activeTraits.includes('美しき反射') && (gainedPoison || gainedSleep || gainedConfusion || gainedParalyze || gainedPetrify || gainedFear)) {
            let adj = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) <= 1 && Math.abs(e.y - s.player.y) <= 1);
            if (adj.length > 0) {
                adj.forEach(e => {
                    if (gainedPoison) e.status.poison = (e.status.poison || 0) + 5;
                    if (gainedSleep || gainedParalyze || gainedFear || gainedPetrify) e.status.sleep = (e.status.sleep || 0) + 3;
                    if (gainedConfusion) e.status.confusion = (e.status.confusion || 0) + 5;
                });
                window.addDungeonLog(`🪞 美しき反射！ 受けた状態異常を周囲の敵にそっくりそのまま返した！`, '#E040FB');
            }
        }
    }
};