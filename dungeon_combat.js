window.dealDungeonDamage = function(attacker, defender) {
    if (defender.hp <= 0) return;
    const s = window.DUNGEON_STATE;
    
    let aIsPlayer = (attacker === s.player);
    let aTraits = aIsPlayer ? window.getPlayerDungeonTraits(attacker.skin).map(t => t.name) : [];
    let dTraits = !aIsPlayer ? window.getPlayerDungeonTraits(defender.skin).map(t => t.name) : [];

    // ★ 特性：未来予知（プレイヤーが殴られる時、15%で回避）
    if (!aIsPlayer && dTraits.includes('未来予知') && Math.random() < 0.15) {
        window.addDungeonLog(`未来予知！ ${defender.name} は攻撃を完全に見切った！`, '#00BCD4');
        return;
    }
    // ★ 特性：データ収集（敵ロボットの回避バフ）
    if (!aIsPlayer && defender.highDodge && Math.random() < 0.8) {
        window.addDungeonLog(`${defender.name} のデータ予測により攻撃がかわされた！`, '#aaa');
        defender.highDodge = false; // 消費
        return;
    }

    let aAtk = attacker.basePwr || attacker.damage || 5;
    let dDef = defender.def || 0;

    let wEff = null; let sEff = null;
    let sealBonus = 0; let isDoubleSeal = false;

    if (aIsPlayer) {
        wEff = attacker.equipWeapon ? window.getDungeonItemEffect(attacker.equipWeapon) : null;
        if (wEff) {
            aAtk += wEff.atk;
            if (wEff.traits.includes('holy') && (defender.type === 'ghost' || defender.type === 'spirit')) sealBonus += 15;
            if (wEff.traits.includes('fire')) sealBonus += 10;
            if (wEff.traits.includes('anti_dragon') && defender.type === 'dragon') sealBonus += 15;
        }
        // ★ 特性：最終兵器
        if (aTraits.includes('最終兵器')) aAtk += 10;
        // ★ 特性：殺戮回路
        if (aTraits.includes('殺戮回路') && attacker.hp >= attacker.maxHp) aAtk = Math.floor(aAtk * 1.5);
        // ★ 特性：終焉の炉心
        if (aTraits.includes('終焉の炉心')) isDoubleSeal = true;
    } else {
        sEff = defender.equipShield ? window.getDungeonItemEffect(defender.equipShield) : null;
        if (sEff) dDef += sEff.def;
        // ★ 特性：頑丈な装甲 / 重装甲
        if (dTraits.includes('重装甲')) dDef += 6;
        else if (dTraits.includes('頑丈な装甲')) dDef += 3;
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
    if (aIsPlayer && wEff && wEff.traits.includes('crit') && Math.random() < 0.15) { dmg *= 2; window.addDungeonLog(`💥 会心の一撃！`, '#FFEB3B'); }
    if (!aIsPlayer && sEff && sEff.traits.includes('parry') && Math.random() < 0.15) { window.addDungeonLog(`🛡️ 見切り！ ${defender.name} は攻撃を弾いた！`, '#4fc3f7'); return; }

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

    // ★ 特性：ウイルス侵蝕（殴った敵を毒にする）
    if (aIsPlayer && aTraits.includes('ウイルス侵蝕')) { defender.status.poison += 3; }
    // ★ 敵特性：サビ撒き
    if (!aIsPlayer && attacker.skin && attacker.skin.includes('robot_type5')) {
        if (defender.equipWeapon) {
            let pBase = window.parseItemString(defender.equipWeapon);
            if (pBase.plus > 0) {
                defender.equipWeapon = `${pBase.baseId}_+${pBase.plus - 1}` + (pBase.seals.length>0 ? '_'+pBase.seals.join('_') : '');
                window.addDungeonLog(`サビ撒き！ ${attacker.name} の武器が劣化してしまった！`, '#9C27B0');
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
            // ★ 特性：成金趣味
            let dropChance = aTraits.includes('成金趣味') ? 0.6 : 0.1;
            if (Math.random() < dropChance) {
                let items = Object.keys(itemCatalog).filter(k => k.startsWith('item_'));
                let droppedKey = items[Math.floor(Math.random() * items.length)];
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
        if (eSkin === 'spirit_type5_2' && Math.random() < 0.2) {
            window.addDungeonLog(`🍂 落葉に遮られ、${defender.name}への攻撃が外れた！`, '#aaa'); return;
        }
        if (eSkin === 'spirit_type4') finalDamage = Math.max(1, finalDamage - 3);
        if (isMagic && eSkin === 'spirit_type2_3' && Math.random() < 0.5) {
            window.addDungeonLog(`🪞 鏡面反射！ 魔法が跳ね返された！`, '#FF5252');
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
            if (heal > 0) { s.player.hp = Math.min(s.player.maxHp, s.player.hp + heal); window.addDungeonLog(`🌱 怨念の根でHPを ${heal} 吸収した！`, '#4CAF50'); }
        }

    } else {
        // --- 敵からの攻撃 ---
        let eSkin = attacker.skin || attacker.type || "";

        // --- 1. プレイヤー(防御側)のバフ ---
        if (activeTraits.includes('妖精の加護') && Math.random() < 0.1) {
            window.addDungeonLog(`✨ 妖精の加護が光り、ダメージを無効化した！`, '#4CAF50'); return; 
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
        if (eSkin === 'spirit') {
            let heal = Math.floor(finalDamage * 0.5);
            if (heal > 0) { attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal); window.addDungeonLog(`💧 体力を吸収された！`, '#aaa'); }
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
    }
};