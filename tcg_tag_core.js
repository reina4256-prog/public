// ==========================================
// カジノTCG タッグ戦
// 4人それぞれの山札・手札・盤面を保ち、チームHPとフィールドだけを共有する。
// ==========================================
(function () {
    'use strict';

    const TAG_MAX_HP = 400;
    const TAG_MAX_MANA = 10;
    const TAG_BOARD_LIMIT = 5;
    const TAG_TIMING = Object.freeze({ beat: 240, action: 520, dialogue: 1050, cpuThink: 420 });
    window.TCG_TAG_TIMING = window.TCG_TAG_TIMING || { multiplier: 1, presets: TAG_TIMING };
    const esc = value => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
    const sample = list => list && list.length ? list[Math.floor(Math.random() * list.length)] : null;
    const shuffle = list => {
        const result = list.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    function dealerMastered() {
        const hero = window.aiPet || {};
        const apprentice = hero.apprentice || {};
        return Number(apprentice.rank && apprentice.rank.dealer) >= 10 || !!(apprentice.retired && apprentice.retired.dealer);
    }

    function playableDeckIndexes() {
        return [0, 1, 2].filter(index => window.TCG && window.TCG.decks
            && typeof window.isTCGPlayableDeck === 'function'
            && window.isTCGPlayableDeck(window.TCG.decks[index] || []));
    }

    function masterProfile(masterType) {
        const profile = typeof window.getCasinoMasterProfile === 'function'
            ? window.getCasinoMasterProfile(masterType)
            : (window.CASINO_MASTER_PROFILES || {})[masterType];
        return profile || { name: masterType === 'dealer' ? 'ディーラー' : '師匠', image: '' };
    }

    function tagCandidates() {
        const candidates = [{ id: 'dealer', kind: 'master', masterType: 'dealer', name: 'ディーラー', isResidentDealer: true }];
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        const visitors = state && Array.isArray(state.visitors) ? state.visitors : [];
        visitors.forEach(visitor => {
            if (!visitor || visitor.kind !== 'master' || !visitor.masterType) return;
            const profile = masterProfile(visitor.masterType);
            candidates.push({
                id: String(visitor.id || `master_${visitor.masterType}`),
                kind: 'master',
                masterType: visitor.masterType,
                name: visitor.name || profile.name || '来店中の師匠',
                isResidentDealer: false
            });
        });
        const seen = new Set();
        return candidates.filter(entry => {
            const key = `${entry.id}:${entry.masterType}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    window.getCasinoTCGOnlineCpuCandidates = function () {
        return tagCandidates().map(entry => JSON.parse(JSON.stringify(entry)));
    };
    window.getCasinoTCGPlayableDeckIndexes = function () { return playableDeckIndexes().slice(); };

    function avatarHtml(candidate, className) {
        if (typeof window.renderCasinoMasterAvatar === 'function') {
            return window.renderCasinoMasterAvatar(candidate.masterType, className || 'ctg-avatar');
        }
        return `<span class="${className || 'ctg-avatar'}">♟</span>`;
    }

    function removeDialog(id) {
        const old = document.getElementById(id);
        if (!old) return;
        try { if (old.open && typeof old.close === 'function') old.close(); } catch (error) { /* noop */ }
        old.remove();
    }

    function showDialog(id, label, html) {
        removeDialog(id);
        const dialog = document.createElement('dialog');
        dialog.id = id;
        dialog.className = 'ctg-dialog';
        dialog.setAttribute('aria-label', label);
        dialog.innerHTML = `${tagStyle()}${html}`;
        dialog.addEventListener('cancel', event => { event.preventDefault(); window.closeCasinoTagSetup(); });
        document.body.appendChild(dialog);
        if (typeof dialog.showModal === 'function') {
            try { dialog.showModal(); } catch (error) { dialog.setAttribute('open', ''); }
        } else dialog.setAttribute('open', '');
        return dialog;
    }

    function tagStyle() {
        return `<style>
            .ctg-dialog{width:100vw;max-width:none;height:100vh;max-height:none;margin:0;padding:0;border:0;background:transparent;color:#fff}.ctg-dialog::backdrop{background:rgba(0,0,0,.88);backdrop-filter:blur(5px)}
            .ctg-setup{width:min(980px,94vw);max-height:92vh;overflow:auto;margin:4vh auto;padding:22px;box-sizing:border-box;border:2px solid #d8b65c;border-radius:20px;background:radial-gradient(circle at 50% 0,rgba(72,50,106,.7),transparent 45%),linear-gradient(145deg,#161225,#080811);box-shadow:0 25px 80px #000,0 0 0 1px rgba(255,235,165,.25) inset;font-family:system-ui,sans-serif}
            .ctg-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-bottom:15px;border-bottom:1px solid rgba(255,225,145,.24)}.ctg-head h2{margin:0;color:#ffe28c;font:800 clamp(22px,4vw,32px) Georgia,serif}.ctg-head small{display:block;margin-bottom:4px;color:#ad9ed2;font:800 9px system-ui;letter-spacing:.22em}.ctg-close,.ctg-btn{appearance:none;border:1px solid rgba(255,225,145,.55);border-radius:10px;background:linear-gradient(#553450,#29182e);color:#fff;padding:10px 16px;font-weight:800;cursor:pointer}.ctg-btn:hover,.ctg-close:hover{filter:brightness(1.15);transform:translateY(-1px)}.ctg-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
            .ctg-note{margin:15px 0;padding:11px 14px;border-left:3px solid #dfb758;background:rgba(255,226,146,.06);color:#ded5ef;font-size:12px;line-height:1.6}.ctg-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:17px}.ctg-mode{appearance:none;display:grid;grid-template-columns:68px 1fr;gap:14px;align-items:center;min-height:140px;padding:18px;border:1px solid rgba(214,192,255,.36);border-radius:15px;background:linear-gradient(145deg,rgba(65,47,91,.75),rgba(11,14,27,.92));color:#fff;text-align:left;cursor:pointer}.ctg-mode:hover:not(:disabled){border-color:#ffe08b;transform:translateY(-2px)}.ctg-mode:disabled{opacity:.38;cursor:not-allowed}.ctg-mode>i{display:grid;place-items:center;width:62px;height:82px;border:2px solid #e9d18c;border-radius:9px;background:#241c3c;color:#ffe08b;font:900 24px Georgia,serif;transform:rotate(-3deg)}.ctg-mode strong{display:block;color:#fff1bd;font-size:20px}.ctg-mode span{display:block;margin-top:7px;color:#bcb3ce;font-size:12px;line-height:1.5}.ctg-mode b{display:block;margin-top:8px;color:#e0bd60;font-size:11px}
            .ctg-section-title{margin:19px 0 10px;color:#ffe19a;font-size:16px}.ctg-people{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.ctg-person{appearance:none;display:grid;justify-items:center;gap:6px;padding:12px 8px;border:1px solid rgba(225,196,114,.35);border-radius:13px;background:rgba(16,22,37,.82);color:#fff;cursor:pointer}.ctg-person:hover,.ctg-person.is-selected{border-color:#ffe381;background:rgba(76,56,104,.86);box-shadow:0 0 18px rgba(255,220,116,.18)}.ctg-avatar{display:block;width:68px;height:68px;overflow:hidden;border:2px solid #ddba62;border-radius:50%;background:#211324}.ctg-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 12%}.ctg-person strong{color:#fff1c2}.ctg-person small{color:#9c94ae}.ctg-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ctg-option{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid rgba(211,192,255,.32);border-radius:11px;background:rgba(20,17,34,.84);cursor:pointer}.ctg-option:has(input:checked){border-color:#ffe18b;background:rgba(75,51,102,.72)}.ctg-option input{accent-color:#d5a83e}.ctg-footer{display:flex;justify-content:space-between;gap:10px;margin-top:20px}.ctg-summary{padding:12px;border:1px dashed rgba(255,224,132,.32);border-radius:11px;color:#d5cae2;font-size:12px;line-height:1.65}
            @media(max-width:720px){.ctg-setup{width:96vw;margin:2vh auto;max-height:96vh;padding:14px}.ctg-grid,.ctg-options{grid-template-columns:1fr}.ctg-people{grid-template-columns:repeat(2,minmax(0,1fr))}.ctg-head h2{font-size:22px}}
        </style>`;
    }

    const originalCasinoTCGMenu = window.openCasinoTCGMenu;
    window.openCasinoSingleTCGMenu = function () {
        if (typeof originalCasinoTCGMenu === 'function') return originalCasinoTCGMenu();
        return false;
    };

    window.openCasinoTCGMenu = function () {
        if (!dealerMastered()) return window.openCasinoSingleTCGMenu();
        removeDialog('casino-tcg-menu-ui');
        const candidates = tagCandidates();
        const decks = playableDeckIndexes();
        const tagReady = candidates.length >= 3 && decks.length > 0;
        return showDialog('casino-tcg-menu-ui', 'TCG対戦形式の選択', `<div class="ctg-setup">
            <header class="ctg-head"><span><small>CASINO CARD LOUNGE</small><h2>対戦形式を選択</h2></span><button class="ctg-close" onclick="window.closeCasinoTCGMenu()">× 閉じる</button></header>
            <div class="ctg-grid">
                <button class="ctg-mode" onclick="window.closeCasinoTCGMenu();window.openCasinoSingleTCGMenu()"><i>1v1</i><span><strong>シングル戦</strong><span>これまで通り、ひとりの相手と勝負します。</span><b>通常ルール</b></span></button>
                <button class="ctg-mode" ${tagReady ? 'onclick="window.openCasinoTagSetup()"' : 'disabled'}><i>2v2</i><span><strong>タッグ戦</strong><span>相棒と共有HPを守り、交互に行動する4人対戦です。</span><b>${tagReady ? '免許皆伝ルール' : (decks.length ? '現在は参加者が足りません' : '保存済み60枚デッキが必要です')}</b></span></button>
                <button class="ctg-mode" ${decks.length ? 'onclick="window.closeCasinoTCGMenu();window.openCasinoTCGOnlineMenu()"' : 'disabled'}><i>ONLINE</i><span><strong>オンライン対戦</strong><span>ルームコードでシングル戦・タッグ戦を遊びます。空席は師匠CPUが担当します。</span><b>${decks.length ? 'フルメッシュ P2P' : '保存済み60枚デッキが必要です'}</b></span></button>
            </div>
            <p class="ctg-note">タッグ戦では、ディーラーと現在来店中の師匠から相棒を1人選びます。残った候補から対戦相手2人が決まります。</p>
        </div>`);
    };

    window.closeCasinoTagSetup = function () {
        removeDialog('casino-tcg-tag-setup-ui');
        if (window.casinoMapOpen) {
            const map = document.getElementById('casino-map-ui');
            if (map) map.style.display = 'flex';
        }
    };

    window.openCasinoTagSetup = function (allyId) {
        removeDialog('casino-tcg-menu-ui');
        const candidates = tagCandidates();
        const decks = playableDeckIndexes();
        if (candidates.length < 3 || !decks.length) return false;
        const selectedAlly = candidates.find(entry => entry.id === allyId) || null;
        const people = candidates.map(candidate => `<button class="ctg-person${selectedAlly && selectedAlly.id === candidate.id ? ' is-selected' : ''}" onclick="window.openCasinoTagSetup('${esc(candidate.id)}')">${avatarHtml(candidate)}<strong>${esc(candidate.name)}</strong><small>${candidate.isResidentDealer ? '常駐ディーラー' : '本日来店中'}</small></button>`).join('');
        const deckOptions = decks.map((index, optionIndex) => {
            const name = window.TCG.deckNames && window.TCG.deckNames[index] ? window.TCG.deckNames[index] : `デッキ ${index + 1}`;
            return `<label class="ctg-option"><input type="radio" name="ctg-deck" value="${index}" ${optionIndex === 0 ? 'checked' : ''}><span><strong>${esc(name)}</strong><small>保存済み60枚デッキ</small></span></label>`;
        }).join('');
        showDialog('casino-tcg-tag-setup-ui', 'TCGタッグ戦の編成', `<div class="ctg-setup">
            <header class="ctg-head"><span><small>TAG TEAM REGISTRATION</small><h2>タッグを編成</h2></span><button class="ctg-close" onclick="window.closeCasinoTagSetup()">× 閉じる</button></header>
            <h3 class="ctg-section-title">1. 相棒を選択</h3><div class="ctg-people">${people}</div>
            <h3 class="ctg-section-title">2. チーム内の先頭を選択</h3><div class="ctg-options">
                <label class="ctg-option"><input type="radio" name="ctg-first" value="player" checked><span><strong>自分から行動</strong><small>味方チームが先攻なら自分が最初</small></span></label>
                <label class="ctg-option"><input type="radio" name="ctg-first" value="ally"><span><strong>相棒から行動</strong><small>味方チームが先攻なら相棒が最初</small></span></label>
            </div>
            <h3 class="ctg-section-title">3. 使用デッキを選択</h3><div class="ctg-options">${deckOptions}</div>
            <div class="ctg-summary">${selectedAlly ? `相棒は <strong>${esc(selectedAlly.name)}</strong>。対戦相手は、残った${Math.max(2, candidates.length - 1)}人から2人をランダムに選びます。` : '先に相棒を1人選んでください。'}</div>
            <footer class="ctg-footer"><button class="ctg-btn" onclick="window.openCasinoTCGMenu()">← 対戦形式へ</button><button class="ctg-btn" ${selectedAlly ? `onclick="window.confirmCasinoTagSetup('${esc(selectedAlly.id)}')"` : 'disabled'}>対戦相手を決める →</button></footer>
        </div>`);
        return true;
    };

    window.confirmCasinoTagSetup = function (allyId) {
        const dialog = document.getElementById('casino-tcg-tag-setup-ui');
        const ally = tagCandidates().find(entry => entry.id === allyId);
        if (!dialog || !ally) return false;
        const first = dialog.querySelector('input[name="ctg-first"]:checked');
        const deck = dialog.querySelector('input[name="ctg-deck"]:checked');
        const opponents = shuffle(tagCandidates().filter(entry => entry.id !== allyId)).slice(0, 2);
        if (opponents.length < 2 || !deck) return false;
        const setup = { ally, opponents, playerFirst: !first || first.value === 'player', deckIndex: Number(deck.value) };
        window.CASINO_TCG_TAG_LAST_SETUP = JSON.parse(JSON.stringify(setup));
        removeDialog('casino-tcg-tag-setup-ui');
        return startTagBattle(setup);
    };

    // Battle engine is defined below. Keeping this public entry makes same-condition rematches deterministic.
    function startTagBattle(setup) {
        return window.startCasinoTCGTagBattleEngine(setup);
    }
})();

(function () {
    'use strict';

    const MAX_HP = 400;
    const BASE_MANA_CAP = 10;
    const BOARD_LIMIT = 5;
    const schedule = (callback, ms) => {
        const timing = window.TCG_TAG_TIMING || {};
        return setTimeout(callback, Math.max(0, Number(ms) || 0) * Math.max(0.05, Number(timing.multiplier) || 1));
    };
    const wait = ms => new Promise(resolve => schedule(resolve, ms));
    const esc = value => String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
    const shuffle = list => {
        const result = list.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };
    const sample = list => list && list.length ? list[Math.floor(Math.random() * list.length)] : null;

    function state() { return window.TCG_TAG_BATTLE || null; }
    function actor(id) { const battle = state(); return battle && battle.actors[id]; }
    function teamOf(actorOrId) { const unit = typeof actorOrId === 'string' ? actor(actorOrId) : actorOrId; return unit && state().teams[unit.team]; }
    function teamActors(teamId) {
        const battle = state();
        return battle ? battle.teamActorIds[teamId].map(id => battle.actors[id]) : [];
    }
    function alliedActors(unit) { return teamActors(unit.team); }
    function enemyActors(unit) { return teamActors(unit.team === 'player' ? 'enemy' : 'player'); }
    function currentActor() { const battle = state(); return battle && battle.actors[battle.order[battle.cursor]]; }
    function localActorId() {
        const battle = state();
        return battle && battle.networkMode ? battle.localActorId : 'player';
    }
    function actionActorId() {
        const battle = state();
        return battle && (battle._networkIntentActorId || localActorId());
    }
    function actionActor() { return actor(actionActorId()); }
    function isNetworkClient() {
        const battle = state();
        return !!(battle && battle.networkMode && !battle.isNetworkAuthority);
    }
    function forwardNetworkIntent(type, payload) {
        if (!isNetworkClient()) return false;
        if (typeof window.sendCasinoTCGNetworkIntent === 'function') {
            window.sendCasinoTCGNetworkIntent(Object.assign({ type }, payload || {}));
        }
        return true;
    }
    function livingCards(unit) { return (unit && unit.field || []).filter(card => card && !card.isDead); }
    function allTeamCards(teamId, includePerson) {
        const cards = [];
        teamActors(teamId).forEach(unit => {
            livingCards(unit).forEach(card => cards.push({ actor: unit, card, zone: 'card' }));
            if (includePerson && unit.person && !unit.person.isDead) cards.push({ actor: unit, card: unit.person, zone: 'person' });
        });
        return cards;
    }
    function randomChoice(list) { return list.length ? list[Math.floor(Math.random() * list.length)] : null; }

    function profileFor(masterType) {
        const casino = typeof window.getCasinoMasterProfile === 'function' ? window.getCasinoMasterProfile(masterType) : null;
        const deck = typeof window.getTCGMasterDeckProfile === 'function' ? window.getTCGMasterDeckProfile(masterType) : null;
        return { casino: casino || { name: masterType, image: '' }, deck: deck || { strategy: {} } };
    }

    function runtimeCard(source, ownerId, sequence) {
        const masterId = source && source.masterId;
        const definition = window.TCG_MASTER && window.TCG_MASTER[masterId] || {};
        const baseHp = Number(source && source.hp);
        const baseDmg = Number(source && source.damage);
        const card = Object.assign({}, definition, source || {});
        card.masterId = masterId;
        card.name = card.name || definition.name || masterId || 'カード';
        card.type = definition.type || card.type || 'monster';
        card.cost = Number.isFinite(Number(definition.baseCost)) ? Number(definition.baseCost) : Number(card.cost) || 0;
        card.baseCost = card.cost;
        card.maxHp = Number.isFinite(baseHp) && baseHp > 0 ? baseHp : Number(definition.baseHp) || 0;
        card.hp = card.maxHp;
        card.damage = Number.isFinite(baseDmg) ? baseDmg : Number(definition.baseDmg) || 0;
        card.baseDmg = card.damage;
        card.ability = definition.ability || card.ability || '';
        card.evolvesFrom = definition.evolvesFrom || card.evolvesFrom || '';
        card.isDead = false;
        card.canAttack = false;
        card.isDefending = false;
        card.status = null;
        card._tagOwnerId = ownerId;
        card._tagId = `${ownerId}_${sequence}_${Math.random().toString(36).slice(2, 8)}`;
        return card;
    }

    function playerDeck(index) {
        const uids = window.TCG && window.TCG.decks ? (window.TCG.decks[index] || []) : [];
        return uids.map(uid => {
            const owned = window.TCG.myCollection.find(card => card && card.uid === uid);
            return owned ? Object.assign({}, owned) : null;
        }).filter(Boolean);
    }

    function npcDeck(masterType) {
        return typeof window.createMasterFixedTCGDeck === 'function' ? window.createMasterFixedTCGDeck(masterType) : [];
    }

    function buildActor(id, team, role, participant, deckSources) {
        participant = participant || {};
        const profile = profileFor(participant.masterType);
        const deck = shuffle(deckSources.map((source, index) => runtimeCard(source, id, index)));
        const participantData = Object.assign({}, participant);
        delete participantData.deck;
        return {
            id, team, role,
            participant: participantData,
            masterType: participant.masterType || '',
            name: participant.name || (role === 'player' ? ((window.aiPet && window.aiPet.name) || 'あなた') : (profile.casino.name || '師匠')),
            image: role === 'player' ? '' : (profile.casino.image || ''),
            strategy: profile.deck.strategy || {},
            deck, hand: [], field: [], person: null, graveyard: [],
            maxMana: 0, currentMana: 0, actionUsed: false, personSkillUsed: false,
            isHuman: participant.isHuman == null ? role === 'player' : !!participant.isHuman,
            controllerId: participant.controllerId || '',
            fallbackCpu: participant.fallbackCpu || null,
            turnCount: 0
        };
    }

    function drawCard(unit, options) {
        options = Object.assign({ normal: false, count: 1 }, options || {});
        let drawn = 0;
        for (let i = 0; i < options.count; i++) {
            if (!unit.deck.length) {
                if (options.normal && teamActors(unit.team).every(member => member.deck.length === 0)) {
                    const losingTeam = unit.team;
                    const winningTeam = losingTeam === 'player' ? 'enemy' : 'player';
                    finishBattle(winningTeam, `${teamOf(unit).label}の山札が2人とも尽きた`);
                }
                continue;
            }
            unit.hand.push(unit.deck.shift());
            drawn++;
        }
        return drawn;
    }

    function openingHand(unit) {
        if (unit.isHuman) {
            const cheapIndex = unit.deck.findIndex(card => card.cost <= 1 && card.type !== 'field');
            if (cheapIndex >= 0) unit.hand.push(unit.deck.splice(cheapIndex, 1)[0]);
        }
        while (unit.hand.length < 5 && unit.deck.length) unit.hand.push(unit.deck.shift());
    }

    function buildOrder(playerFirst, playerTeamWonCoin) {
        const playerPair = playerFirst ? ['player', 'ally'] : ['ally', 'player'];
        const enemyPair = Math.random() < 0.5 ? ['enemy1', 'enemy2'] : ['enemy2', 'enemy1'];
        return playerTeamWonCoin
            ? [playerPair[0], enemyPair[0], playerPair[1], enemyPair[1]]
            : [enemyPair[0], playerPair[0], enemyPair[1], playerPair[1]];
    }

    function createBattle(setup) {
        const ally = setup.ally;
        const opponents = setup.opponents;
        const actors = {
            player: buildActor('player', 'player', 'player', { id: 'player', masterType: '', name: (window.aiPet && window.aiPet.name) || 'あなた' }, playerDeck(setup.deckIndex)),
            ally: buildActor('ally', 'player', 'ally', ally, npcDeck(ally.masterType)),
            enemy1: buildActor('enemy1', 'enemy', 'enemy', opponents[0], npcDeck(opponents[0].masterType)),
            enemy2: buildActor('enemy2', 'enemy', 'enemy', opponents[1], npcDeck(opponents[1].masterType))
        };
        if (Object.values(actors).some(unit => unit.deck.length < 60)) return null;
        const playerTeamWonCoin = Math.random() < 0.5;
        const order = buildOrder(!!setup.playerFirst, playerTeamWonCoin);
        const battle = {
            version: 1,
            setup: JSON.parse(JSON.stringify(setup)),
            actors,
            teamActorIds: { player: ['player', 'ally'], enemy: ['enemy1', 'enemy2'] },
            teams: {
                player: { id: 'player', label: 'あなたのチーム', hp: MAX_HP, maxHp: MAX_HP, field: null, turnsThisRound: 0, captainGuard: false },
                enemy: { id: 'enemy', label: '相手チーム', hp: MAX_HP, maxHp: MAX_HP, field: null, turnsThisRound: 0, captainGuard: false }
            },
            order, cursor: 0, turnNumber: 0, round: 1,
            firstActorId: order[0], playerTeamWonCoin,
            isAnimating: true, isEnded: false, autoPlayer: false,
            selectedAttacker: null, pendingTarget: null, pendingPersonSkill: null,
            allyHandOpen: false, log: [], dialogueQueue: [], dialogueBusy: false,
            resultRecorded: false, lastAction: '', effectDepth: 0
        };
        Object.values(actors).forEach(openingHand);
        return battle;
    }

    function createNetworkBattle(setup) {
        const seats = Array.isArray(setup && setup.seats) ? setup.seats : [];
        const expectedIds = setup && setup.mode === 'single'
            ? ['player', 'enemy1']
            : ['player', 'ally', 'enemy1', 'enemy2'];
        if (seats.length !== expectedIds.length) return null;
        const actors = {};
        for (const actorId of expectedIds) {
            const seat = seats.find(entry => entry && entry.actorId === actorId);
            if (!seat || !Array.isArray(seat.deck)) return null;
            const team = actorId === 'player' || actorId === 'ally' ? 'player' : 'enemy';
            const role = actorId === 'player' ? 'player' : actorId === 'ally' ? 'ally' : 'enemy';
            actors[actorId] = buildActor(actorId, team, role, seat, seat.deck);
        }
        if (Object.values(actors).some(unit => unit.deck.length < 60)) return null;
        const teamActorIds = setup.mode === 'single'
            ? { player: ['player'], enemy: ['enemy1'] }
            : { player: ['player', 'ally'], enemy: ['enemy1', 'enemy2'] };
        const playerOrder = teamActorIds.player.slice();
        const enemyOrder = teamActorIds.enemy.slice();
        if (playerOrder.length > 1 && Math.random() < 0.5) playerOrder.reverse();
        if (enemyOrder.length > 1 && Math.random() < 0.5) enemyOrder.reverse();
        const playerTeamWonCoin = Math.random() < 0.5;
        const order = [];
        const first = playerTeamWonCoin ? playerOrder : enemyOrder;
        const second = playerTeamWonCoin ? enemyOrder : playerOrder;
        for (let i = 0; i < Math.max(first.length, second.length); i++) {
            if (first[i]) order.push(first[i]);
            if (second[i]) order.push(second[i]);
        }
        const maxHp = setup.mode === 'single' ? 200 : 400;
        const battle = {
            version: 2,
            networkMode: setup.mode,
            networkRoomCode: setup.roomCode || '',
            isNetworkAuthority: true,
            localActorId: setup.localActorId || 'player',
            setup: JSON.parse(JSON.stringify(Object.assign({}, setup, { seats: seats.map(seat => Object.assign({}, seat, { deck: [] })) }))),
            actors,
            teamActorIds,
            teams: {
                player: { id: 'player', label: 'あなたのチーム', hp: maxHp, maxHp, field: null, turnsThisRound: 0, captainGuard: false },
                enemy: { id: 'enemy', label: '相手チーム', hp: maxHp, maxHp, field: null, turnsThisRound: 0, captainGuard: false }
            },
            order, cursor: 0, turnNumber: 0, round: 1,
            firstActorId: order[0], playerTeamWonCoin,
            isAnimating: true, isEnded: false, autoPlayer: false,
            selectedAttacker: null, pendingTarget: null, pendingPersonSkill: null,
            allyHandOpen: false, log: [], dialogueQueue: [], dialogueBusy: false,
            resultRecorded: false, lastAction: '', effectDepth: 0
        };
        Object.values(actors).forEach(openingHand);
        return battle;
    }

    function battleStyle() {
        return `<style>
            #tcg-tag-battle-ui{--tag-card-scale:.5;position:fixed;inset:0;z-index:35000;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(circle at 50% 43%,#12251e 0,#070d0d 52%,#030507 100%);color:#fff;font-family:system-ui,sans-serif;user-select:none}.ctgb-small-btn{appearance:none;border:1px solid #a89360;border-radius:7px;padding:6px 9px;background:#282333;color:#eee;font-size:10px;font-weight:bold;cursor:pointer}.ctgb-small-btn.is-on{background:#815c11;border-color:#ffe077;color:#fff}
            .ctgb-enemy-console{display:grid;grid-template-columns:minmax(190px,270px) minmax(390px,1fr) auto;align-items:center;gap:14px;min-height:76px;padding:5px 16px;background:linear-gradient(90deg,#0c0509,#080708 48%,#050607);border-bottom:1px solid #a62a46;box-shadow:0 4px 18px #000;z-index:5}.ctgb-team-summary{position:relative;min-width:0;padding:4px 10px;border-left:3px solid #d04865}.ctgb-team-summary small{display:block;color:#c98b9b;font-size:9px;font-weight:900;letter-spacing:.16em}.ctgb-team-summary strong{display:block;color:#fff;font-size:14px;white-space:nowrap}.ctgb-team-summary b{display:block;color:#ff718b;font:900 24px/1 Georgia,serif;text-shadow:1px 2px #000}.ctgb-team-summary.player{border-left-color:#15b8cd}.ctgb-team-summary.player small{color:#79dce7}.ctgb-team-summary.player b{color:#6ee37c}.ctgb-team-summary.is-target{cursor:pointer;border-radius:8px;box-shadow:0 0 16px #ffe36b;background:rgba(255,221,87,.11)}.ctgb-controls{display:flex;justify-content:flex-end;gap:6px}.ctgb-roster{display:flex;justify-content:center;gap:8px;min-width:0}.ctgb-actor-hud{position:relative;display:grid;grid-template-columns:42px minmax(92px,1fr);gap:7px;align-items:center;min-width:160px;max-width:245px;padding:4px 7px;border:1px solid rgba(202,178,133,.28);border-radius:10px;background:rgba(16,13,19,.78);transition:.16s}.ctgb-actor-hud.is-active{border-color:#ffe16d;box-shadow:0 0 14px rgba(255,217,75,.5);background:#312611}.ctgb-actor-hud.is-clickable{cursor:pointer;border-color:#ffe275;box-shadow:0 0 14px #ffd856}.ctgb-avatar{display:block;width:38px;height:38px;border:2px solid #d4b153;border-radius:50%;overflow:hidden;background:#24182a}.ctgb-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 12%}.ctgb-player-avatar{display:grid;place-items:center;font-size:22px}.ctgb-actor-copy{min-width:0}.ctgb-actor-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff0b5;font-size:11px;font-weight:900}.ctgb-resources{display:flex;gap:7px;color:#a9a2b2;font-size:8px;white-space:nowrap}.ctgb-resources b{color:#fff;font-size:10px}.ctgb-order-no{position:absolute;left:-5px;top:-6px;display:grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#211d26;border:1px solid #766f80;color:#bbb;font-size:9px;font-weight:900}.ctgb-actor-hud.is-active .ctgb-order-no{background:#ffd84d;border-color:#fff;color:#241700}
            .ctgb-orderbar{display:flex;align-items:center;justify-content:center;gap:6px;min-height:27px;padding:2px 10px;background:rgba(3,5,8,.94);border-bottom:1px solid #5d4e2c;z-index:4}.ctgb-top-title{margin-right:8px;color:#ffe18c;font:900 12px Georgia,serif;letter-spacing:.08em}.ctgb-order{display:flex;gap:4px;align-items:center;overflow:auto}.ctgb-order span{display:grid;place-items:center;min-width:30px;height:19px;padding:0 6px;border:1px solid #4e4b57;border-radius:999px;background:#17171d;color:#aaa;font-size:8px}.ctgb-order span.is-current{border-color:#ffe16d;background:#674d16;color:#fff;box-shadow:0 0 9px #ffd75a}
            .ctgb-stage{position:relative;flex:1;min-height:0;display:grid;place-items:center;padding:8px 32px 3px;overflow:hidden;perspective:1100px}.ctgb-table-surface{position:relative;width:min(1160px,96vw);height:100%;max-height:590px;min-height:330px;display:grid;grid-template-rows:1fr 1fr;overflow:hidden;border:2px solid #604a29;border-radius:26px;background:linear-gradient(180deg,rgba(43,14,21,.7) 0,rgba(14,29,25,.92) 47%,rgba(4,55,52,.88) 53%,rgba(3,35,35,.92) 100%);box-shadow:0 24px 50px #000,0 0 0 5px rgba(16,12,12,.92),0 0 0 6px #705630;transform:rotateX(10deg);transform-origin:center center}.ctgb-table-surface:before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0,transparent 19.7%,rgba(216,183,108,.055) 20%,transparent 20.3%);z-index:0}.ctgb-team-zone{position:relative;z-index:1;display:grid;grid-template-columns:88px minmax(0,1fr) minmax(0,1fr) 76px 76px;align-items:center;gap:6px;min-height:0;padding:11px 16px}.ctgb-team-zone.is-enemy{border-bottom:1px solid rgba(219,66,91,.4);background:linear-gradient(180deg,rgba(60,16,23,.18),rgba(0,0,0,.05))}.ctgb-team-zone.is-player{border-top:1px solid rgba(0,232,236,.55);background:linear-gradient(0deg,rgba(0,89,85,.2),rgba(0,0,0,.04))}.ctgb-team-zone:after{position:absolute;left:50%;top:8%;bottom:8%;width:1px;background:rgba(228,213,169,.09);content:""}.ctgb-zone-caption{position:absolute;left:50%;z-index:0;transform:translateX(-50%);color:rgba(220,224,214,.28);font-size:13px;font-style:italic;pointer-events:none}.ctgb-team-zone.is-enemy .ctgb-zone-caption{top:8px}.ctgb-team-zone.is-player .ctgb-zone-caption{bottom:8px}.ctgb-board-lane{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;height:100%;padding:18px 2px 4px;border-radius:12px;transition:.16s}.ctgb-board-lane.is-active{background:radial-gradient(circle,rgba(255,218,84,.16),transparent 70%);box-shadow:inset 0 0 18px rgba(255,218,84,.12)}.ctgb-board-lane.is-illegal{filter:brightness(.45)}.ctgb-lane-name{position:absolute;top:3px;left:50%;transform:translateX(-50%);z-index:4;max-width:90%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(255,243,204,.68);font-size:9px;font-weight:800}.ctgb-board-empty{color:rgba(200,210,202,.28);font-size:10px}.ctgb-slot{position:relative;flex:0 0 90px;width:90px;height:130px;border:1px dashed rgba(220,219,198,.24);border-radius:8px;background:rgba(0,0,0,.18);overflow:hidden;transition:.14s}.ctgb-slot+.ctgb-slot{margin-left:-7px}.ctgb-slot.is-clickable{z-index:3;cursor:pointer;border-color:#ffe275;box-shadow:0 0 14px rgba(255,224,101,.72)}.ctgb-slot.is-selected{z-index:4;border:2px solid #ffbd43;box-shadow:0 0 20px #ff9d00;transform:translateY(-7px)}.ctgb-cardscale{display:block;width:180px;height:260px;transform:scale(var(--tag-card-scale));transform-origin:top left;pointer-events:none}.ctgb-slot.is-exhausted .ctgb-cardscale{filter:brightness(.45) grayscale(.25)}.ctgb-exhausted-label{position:absolute;left:50%;top:50%;z-index:8;transform:translate(-50%,-50%) rotate(-13deg);padding:3px 7px;border:1px solid rgba(255,255,255,.8);border-radius:5px;background:rgba(8,9,12,.88);color:#eee;font-size:12px;font-weight:900;white-space:nowrap;text-shadow:0 2px 3px #000;pointer-events:none}.ctgb-card-state{position:absolute;left:3px;right:3px;bottom:3px;display:flex;justify-content:space-between;z-index:3;padding:2px 4px;border-radius:4px;background:rgba(0,0,0,.86);font-size:9px;font-weight:bold}.ctgb-card-state .hp{color:#7af09c}.ctgb-card-state .atk{color:#ffb36b}.ctgb-guard{position:absolute;top:3px;right:3px;z-index:4;padding:1px 4px;border-radius:4px;background:#176ca0;font-size:8px}.ctgb-stunned{filter:grayscale(1) brightness(.55)}.ctgb-magnifier{position:absolute;right:3px;top:3px;z-index:9;display:grid;place-items:center;width:22px;height:22px;border:1px solid #fff;border-radius:50%;background:#17191f;color:#55e7f3;font-size:11px;line-height:1;box-shadow:0 2px 7px #000;cursor:pointer;pointer-events:auto}.ctgb-magnifier:hover{transform:scale(1.14);background:#284753}.ctgb-slot .ctgb-magnifier{right:2px;top:22px}.ctgb-board-object .ctgb-magnifier{right:2px;top:2px;width:18px;height:18px;font-size:9px}.ctgb-ally-card .ctgb-magnifier{right:1px;top:17px;width:13px;height:13px;font-size:7px}.ctgb-hand-card .ctgb-magnifier{right:3px;top:3px}.ctgb-team-zone.is-enemy .ctgb-slot,.ctgb-team-zone.is-enemy .ctgb-board-object[data-card-id]{transform:rotate(180deg)}.ctgb-team-zone.is-enemy .ctgb-slot.is-selected{transform:rotate(180deg) translateY(7px)}.ctgb-team-zone.is-enemy .ctgb-slot .ctgb-magnifier,.ctgb-team-zone.is-enemy .ctgb-slot .ctgb-card-state,.ctgb-team-zone.is-enemy .ctgb-slot .ctgb-guard,.ctgb-team-zone.is-enemy .ctgb-slot .ctgb-exhausted-label,.ctgb-team-zone.is-enemy .ctgb-board-object .ctgb-magnifier,.ctgb-team-zone.is-enemy .ctgb-board-object .ctgb-card-state{transform:rotate(180deg)}.ctgb-team-zone.is-enemy .ctgb-slot .ctgb-exhausted-label{transform:translate(-50%,-50%) rotate(167deg)}
            .ctgb-side-column{position:relative;display:grid;justify-items:center;align-content:center;gap:4px;min-width:0}.ctgb-side-label{color:rgba(233,221,184,.53);font-size:8px;font-weight:800}.ctgb-board-object{position:relative;display:grid;place-items:center;width:72px;height:104px;border:1px dashed rgba(198,171,113,.48);border-radius:9px;background:rgba(0,0,0,.24);color:rgba(210,201,185,.42);font-size:9px;overflow:hidden}.ctgb-board-object .ctgb-cardscale{transform:scale(.4)}.ctgb-board-object.is-clickable{cursor:pointer;border-color:#ffe275;box-shadow:0 0 15px #ffdb55}.ctgb-field-object{border-color:rgba(66,195,189,.5)}.ctgb-person-object{border-color:rgba(212,57,133,.55)}.ctgb-person-skills{position:absolute;top:108px;z-index:7;display:grid;gap:2px;width:82px}.ctgb-person-skills .ctgb-small-btn{overflow:hidden;padding:3px 4px;text-overflow:ellipsis;white-space:nowrap;font-size:8px}.ctgb-center{position:absolute;left:50%;top:50%;z-index:14;transform:translate(-50%,-50%);display:grid;justify-items:center;pointer-events:none}.ctgb-turn{padding:5px 13px;border:1px solid #ffe17a;border-radius:999px;background:rgba(10,8,14,.96);color:#ffe69b;font-size:10px;font-weight:900;box-shadow:0 0 16px #000}.ctgb-bubble{display:none;position:absolute;z-index:30;max-width:min(330px,56vw);padding:10px 12px;border:2px solid #e6c873;border-radius:12px;background:rgba(15,11,20,.97);box-shadow:0 8px 25px #000;color:#fff8d7;font-size:12px;line-height:1.5;pointer-events:none}.ctgb-bubble.is-show{display:block}.ctgb-bubble strong{display:block;color:#eac868;font-size:10px}.ctgb-toast{position:absolute;left:50%;top:50%;z-index:35;transform:translate(-50%,-50%);max-width:70vw;padding:11px 18px;border:2px solid #e1bd59;border-radius:13px;background:rgba(4,5,8,.94);color:#fff2bf;text-align:center;font-weight:800;box-shadow:0 8px 28px #000;pointer-events:none}
            .ctgb-player-console{flex:0 0 164px;display:grid;grid-template-columns:300px minmax(0,1fr) 170px;min-height:0;border-top:2px solid #04bdcd;background:rgba(3,6,9,.98);box-shadow:0 -5px 18px #000;z-index:5}.ctgb-player-status{display:grid;align-content:center;gap:5px;padding:7px 12px;border-right:1px solid #2a5260;background:linear-gradient(90deg,#062020,#071115)}.ctgb-player-status .ctgb-roster{display:grid;grid-template-columns:1fr 1fr;gap:5px}.ctgb-player-status .ctgb-actor-hud{grid-template-columns:30px minmax(0,1fr);min-width:0;padding:3px 5px}.ctgb-player-status .ctgb-avatar{width:27px;height:27px}.ctgb-player-status .ctgb-resources{gap:4px;font-size:7px}.ctgb-player-status .ctgb-resources span:nth-child(n+3){display:none}.ctgb-hand-area{position:relative;display:flex;min-width:0;padding:4px 7px}.ctgb-ally-hand{position:absolute;left:7px;right:7px;top:4px;z-index:12;display:flex;align-items:center;gap:4px;height:24px;overflow-x:auto}.ctgb-ally-hand:has(.ctgb-ally-card){top:-59px;height:57px;padding:2px 5px;border:1px solid #514763;border-radius:8px 8px 0 0;background:rgba(10,8,16,.96);box-shadow:0 -5px 14px #000}.ctgb-ally-hand>button{flex:0 0 auto;border:1px solid #7e7292;border-radius:5px;background:#272132;color:#d8c9ed;font-size:9px;cursor:pointer}.ctgb-ally-card{position:relative;flex:0 0 38px;width:38px;height:55px;overflow:hidden;border:1px solid #635875;border-radius:4px}.ctgb-ally-card .ctgb-cardscale{transform:scale(.21)}.ctgb-ally-card .ctgb-cost{width:13px;height:13px;font-size:7px}.ctgb-hand{display:flex;flex:1;align-items:flex-end;justify-content:center;gap:2px;overflow-x:auto;min-height:0;padding-top:29px}.ctgb-hand-card{position:relative;flex:0 0 86px;width:86px;height:125px;padding:0;overflow:hidden;border:2px solid transparent;border-radius:8px;background:#101317;cursor:pointer;transition:.14s}.ctgb-hand-card:hover:not(.is-disabled){z-index:4;transform:translateY(-8px);border-color:#ffe27a}.ctgb-hand-card.is-disabled{filter:brightness(.45);cursor:not-allowed}.ctgb-hand-card .ctgb-cardscale{transform:scale(.48)}.ctgb-cost{position:absolute;left:3px;top:3px;z-index:5;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#59a9ff;color:#061529;font-size:10px;font-weight:900;border:1px solid #fff}.ctgb-actions{display:grid;align-content:center;gap:10px;padding:12px;border-left:1px solid #312b1b;background:#100e08}.ctgb-end{min-height:62px;border:2px solid #ffe078;border-radius:10px;background:linear-gradient(#e19016,#7b4304);color:#fff;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 4px 14px #000}.ctgb-forfeit{border:1px solid #555;border-radius:8px;padding:8px;background:#3f3f42;color:#ddd;font-weight:700;cursor:pointer}
            .ctgb-overlay{position:absolute;inset:0;z-index:60;display:grid;place-items:center;background:rgba(0,0,0,.7);backdrop-filter:blur(2px)}.ctgb-panel{width:min(660px,90vw);max-height:82vh;overflow:auto;padding:19px;border:2px solid #dfbd60;border-radius:15px;background:linear-gradient(145deg,#201529,#090b12);box-shadow:0 20px 70px #000}.ctgb-panel h3{margin:0 0 9px;color:#ffe28a}.ctgb-panel h4{margin:14px 0 7px;color:#d9ccea;font-size:12px}.ctgb-panel p{color:#d3c8dd;font-size:12px;line-height:1.6}.ctgb-panel-buttons{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.ctgb-panel button{border:1px solid #d6bd75;border-radius:8px;padding:9px 12px;background:#432c4b;color:#fff;font-weight:bold;cursor:pointer}.ctgb-panel button:hover{filter:brightness(1.2)}.ctgb-defense-flow{display:grid;grid-template-columns:minmax(0,1fr) 38px minmax(0,1fr);align-items:stretch;gap:8px;margin:12px 0;padding:10px;border:1px solid #554761;border-radius:11px;background:rgba(0,0,0,.3)}.ctgb-defense-unit{display:grid;align-content:center;gap:3px;min-height:74px;padding:9px;border:1px solid #6b5b76;border-radius:9px;background:#18131e}.ctgb-defense-unit.is-attacker{border-color:#c45165;background:#261018}.ctgb-defense-unit.is-target{border-color:#51b9c8;background:#0c2225}.ctgb-defense-unit small{color:#aaa;font-size:9px}.ctgb-defense-unit strong{overflow:hidden;text-overflow:ellipsis;color:#fff;font-size:14px}.ctgb-defense-unit span{color:#ffe7a1;font-size:12px;font-weight:900}.ctgb-defense-arrow{display:grid;place-items:center;color:#ffcb45;font-size:27px;font-weight:900;text-shadow:0 0 12px #ff612e}.ctgb-defense-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.ctgb-panel .ctgb-defense-choice{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;text-align:left}.ctgb-defense-choice strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ctgb-defense-choice span{color:#ffe6a0;font-size:11px}.ctgb-defense-choice small{grid-column:1/-1;color:#bfb4c8;font-size:9px}.ctgb-defense-skip{margin-top:10px;background:#28272d!important;color:#ddd!important}
            .ctgb-detail-overlay{position:fixed;inset:0;z-index:120000;display:grid;place-items:center;background:rgba(2,4,7,.9);backdrop-filter:blur(5px);cursor:pointer}.ctgb-detail-content{display:grid;justify-items:center;gap:18px;color:#fff}.ctgb-detail-title{color:#70e9f2;font-size:20px;font-weight:900;text-shadow:0 2px 5px #000}.ctgb-detail-space{display:grid;place-items:center;width:270px;height:390px}.ctgb-detail-card{width:180px;height:260px;transform:scale(1.48);filter:drop-shadow(0 0 24px rgba(39,220,235,.55));pointer-events:none}.ctgb-detail-close{padding:7px 15px;border:1px solid #716985;border-radius:999px;background:rgba(0,0,0,.55);color:#c9c3d1;font-size:11px}
            .ctgb-cinematic-layer{position:fixed;inset:0;z-index:100000;overflow:hidden;background:rgba(0,0,0,.68);pointer-events:none}.ctgb-cinematic-title{position:absolute;left:50%;top:18%;transform:translate(-50%,-50%) scale(1.5) skewX(-14deg);opacity:0;color:#fff;font:900 clamp(40px,7vw,92px)/1 Georgia,serif;font-style:italic;letter-spacing:.06em;text-align:center;text-shadow:0 0 38px var(--ctgb-glow,#f4bc3c),5px 5px #000;transition:.28s cubic-bezier(.18,.85,.25,1.25)}.ctgb-cinematic-title small{display:block;margin-top:10px;color:#ffe59a;font:900 clamp(14px,2vw,24px)/1 system-ui,sans-serif;letter-spacing:.18em}.ctgb-cinematic-layer.is-show .ctgb-cinematic-title{transform:translate(-50%,-50%) scale(1) skewX(-14deg);opacity:1}.ctgb-coin-wrap{position:absolute;left:50%;top:54%;width:170px;height:170px;transform:translate(-50%,-50%);perspective:800px}.ctgb-coin{position:relative;width:100%;height:100%;border:10px solid #bf7808;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff5a8,#ffd12c 35%,#bd6d02 78%);box-shadow:inset 0 0 20px rgba(80,36,0,.65),0 15px 45px #000,0 0 45px #ffd747;transform-style:preserve-3d;animation:ctgbCoinFlip 2.1s cubic-bezier(.2,.8,.4,1) both}.ctgb-coin:before,.ctgb-coin:after{position:absolute;inset:0;display:grid;place-items:center;border-radius:50%;backface-visibility:hidden;color:#9a5d00;font:900 43px Georgia,serif;text-shadow:1px 2px #fff3a2;content:"TCG"}.ctgb-coin:after{transform:rotateY(180deg);content:"2v2"}.ctgb-card-cutin{position:fixed;z-index:105000;width:180px;height:260px;opacity:0;transform:translate(-50%,-50%) scale(.12);transform-origin:center;transition:left .38s cubic-bezier(.2,.8,.25,1),top .38s cubic-bezier(.2,.8,.25,1),transform .38s cubic-bezier(.18,.9,.25,1.3),opacity .25s;pointer-events:none}.ctgb-card-cutin.is-center{left:50%!important;top:50%!important;opacity:1;transform:translate(-50%,-50%) scale(1.3);filter:drop-shadow(0 0 34px var(--ctgb-glow,#5ee7f0))}.ctgb-card-cutin.is-exit{opacity:0;transform:translate(-50%,-50%) scale(.28)}.ctgb-card-cutin-label{position:fixed;left:50%;top:12%;z-index:105001;transform:translateX(-50%) skewX(-12deg);color:#fff;font:900 clamp(24px,4vw,48px) Georgia,serif;font-style:italic;text-align:center;text-shadow:0 0 25px var(--ctgb-glow,#5ee7f0),3px 3px #000;pointer-events:none}.ctgb-attack-layer{position:fixed;inset:0;z-index:104000;overflow:hidden;pointer-events:none}.ctgb-attack-clone{position:fixed;z-index:2;transform:translate(-50%,-50%);transition:left .32s cubic-bezier(.18,.8,.2,1),top .32s cubic-bezier(.18,.8,.2,1),transform .32s;filter:drop-shadow(0 0 20px #ffd85d);pointer-events:none}.ctgb-attack-beam{position:fixed;z-index:1;height:7px;border-radius:999px;background:linear-gradient(90deg,#fff7a4,#ffbd21 42%,#ff4235);box-shadow:0 0 9px #fff,0 0 22px #ffad21;transform-origin:left center;opacity:0}.ctgb-attack-beam.is-fire{animation:ctgbBeamFire .38s ease-out forwards}.ctgb-direct-cutin{position:fixed;left:50%;top:40%;z-index:4;transform:translate(-50%,-50%) scale(.2) skewX(-15deg);opacity:0;color:#ffdf62;font:900 clamp(38px,6vw,78px) Georgia,serif;font-style:italic;white-space:nowrap;text-shadow:0 0 30px #ff3d00,4px 4px #fff,-2px -2px #000;animation:ctgbDirect .75s ease-out forwards}.ctgb-impact-spark{position:fixed;z-index:4;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 0 12px 8px #ffd33d,0 0 35px 20px #ff4d24;animation:ctgbImpact .5s ease-out forwards;pointer-events:none}.ctgb-damage-number{position:fixed;z-index:106000;transform:translate(-50%,-50%);color:#fff0a0;font:900 clamp(22px,3vw,42px) Georgia,serif;font-style:italic;text-shadow:0 0 12px #f00,3px 3px #000;animation:ctgbDamageFloat .7s ease-out forwards;pointer-events:none}.ctgb-screen-shake{animation:ctgbScreenShake .38s linear}.ctgb-impact-hit{animation:ctgbTargetHit .5s ease-out}
            @keyframes ctgbCoinFlip{0%{transform:rotateY(0) rotateZ(-8deg) scale(.8)}48%{transform:rotateY(1260deg) rotateZ(8deg) scale(1.35)}100%{transform:rotateY(2520deg) rotateZ(0) scale(1)}}@keyframes ctgbBeamFire{0%{opacity:0;clip-path:inset(0 100% 0 0)}25%{opacity:1}70%{opacity:1;clip-path:inset(0 0 0 0)}100%{opacity:0;clip-path:inset(0 0 0 100%)}}@keyframes ctgbDirect{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) skewX(-15deg)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.12) skewX(-15deg)}70%{opacity:1;transform:translate(-50%,-50%) scale(1) skewX(-15deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.4) skewX(-15deg)}}@keyframes ctgbImpact{0%{opacity:1;transform:translate(-50%,-50%) scale(.2)}100%{opacity:0;transform:translate(-50%,-50%) scale(4)}}@keyframes ctgbDamageFloat{0%{opacity:0;transform:translate(-50%,-20%) scale(.4)}30%{opacity:1;transform:translate(-50%,-70%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-150%) scale(.9)}}@keyframes ctgbScreenShake{0%,100%{transform:none}20%{transform:translateX(8px)}40%{transform:translateX(-7px)}60%{transform:translateX(5px)}80%{transform:translateX(-3px)}}@keyframes ctgbTargetHit{0%,100%{filter:none}30%{filter:brightness(2.4) saturate(1.8);transform:scale(1.08)}55%{filter:brightness(.55)}}
            @media(max-width:1100px){#tcg-tag-battle-ui{--tag-card-scale:.42}.ctgb-enemy-console{grid-template-columns:190px 1fr auto;gap:7px;padding-inline:8px}.ctgb-actor-hud{grid-template-columns:34px minmax(76px,1fr);min-width:130px}.ctgb-avatar{width:31px;height:31px}.ctgb-team-zone{grid-template-columns:70px minmax(0,1fr) minmax(0,1fr) 61px 61px;padding-inline:9px}.ctgb-slot{flex-basis:76px;width:76px;height:110px}.ctgb-slot+.ctgb-slot{margin-left:-8px}.ctgb-board-object{width:58px;height:84px}.ctgb-board-object .ctgb-cardscale{transform:scale(.32)}.ctgb-player-console{grid-template-columns:260px minmax(0,1fr) 140px}.ctgb-hand-card{flex-basis:73px;width:73px;height:107px}.ctgb-hand-card .ctgb-cardscale{transform:scale(.405)}.ctgb-hand{min-height:113px}.ctgb-player-console{flex-basis:145px}}
            @media(max-width:760px){#tcg-tag-battle-ui{--tag-card-scale:.33;overflow:auto}.ctgb-enemy-console{position:sticky;top:0;grid-template-columns:135px minmax(310px,1fr) 84px;min-width:650px;min-height:62px;padding:4px 7px}.ctgb-team-summary b{font-size:18px}.ctgb-team-summary strong{font-size:11px}.ctgb-roster{justify-content:flex-start}.ctgb-actor-hud{min-width:138px}.ctgb-orderbar{justify-content:flex-start;min-width:650px}.ctgb-top-title{display:none}.ctgb-stage{flex:0 0 390px;display:block;min-width:650px;padding:8px 12px;overflow-x:auto;perspective:none}.ctgb-table-surface{width:700px;height:365px;min-height:0;transform:none}.ctgb-team-zone{grid-template-columns:55px 245px 245px 48px 48px;gap:3px;padding:6px}.ctgb-slot{flex-basis:59px;width:59px;height:86px}.ctgb-slot+.ctgb-slot{margin-left:-10px}.ctgb-board-object{width:45px;height:66px}.ctgb-board-object .ctgb-cardscale{transform:scale(.25)}.ctgb-person-skills{top:69px;width:60px}.ctgb-person-skills .ctgb-small-btn{font-size:7px}.ctgb-player-console{flex:0 0 146px;grid-template-columns:210px minmax(360px,1fr) 90px;min-width:660px}.ctgb-player-status{padding:5px}.ctgb-player-status .ctgb-team-summary b{font-size:16px}.ctgb-hand-card{flex-basis:66px;width:66px;height:96px}.ctgb-hand-card .ctgb-cardscale{transform:scale(.365)}.ctgb-hand{min-height:101px}.ctgb-actions{padding:6px}.ctgb-end{min-height:52px;font-size:11px}.ctgb-forfeit{font-size:9px;padding:5px}.ctgb-center{position:fixed;top:50%}}
        </style>`;
    }

    function renderNativeCard(card) {
        if (typeof window.renderCardHTML === 'function') {
            try { return window.renderCardHTML(card); } catch (error) { /* fallback */ }
        }
        return `<div style="width:180px;height:260px;background:#29233b;color:white;padding:12px;box-sizing:border-box"><strong>${esc(card.name)}</strong></div>`;
    }

    function findTagCard(cardId) {
        const battle = state();
        if (!battle || !cardId) return null;
        for (const unit of Object.values(battle.actors)) {
            const card = [unit.person].concat(unit.hand, unit.deck, unit.field, unit.graveyard).find(entry => entry && entry._tagId === cardId);
            if (card) return card;
        }
        return Object.values(battle.teams).map(team => team.field).find(card => card && card._tagId === cardId) || null;
    }

    function cardElement(card) {
        if (!card || !card._tagId) return null;
        return Array.from(document.querySelectorAll('#tcg-tag-battle-ui [data-card-id]')).find(element => element.getAttribute('data-card-id') === card._tagId) || null;
    }

    function elementCenter(element, fallbackX, fallbackY) {
        if (!element) return { x: fallbackX == null ? window.innerWidth / 2 : fallbackX, y: fallbackY == null ? window.innerHeight / 2 : fallbackY };
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
    }

    window.showCasinoTagCardDetail = function (cardId) {
        const card = findTagCard(cardId);
        if (!card) return;
        const old = document.getElementById('ctgb-card-detail');
        if (old) old.remove();
        const owner = ownerOf(card);
        const overlay = document.createElement('div');
        overlay.id = 'ctgb-card-detail';
        overlay.className = 'ctgb-detail-overlay';
        overlay.onclick = () => overlay.remove();
        overlay.innerHTML = `<div class="ctgb-detail-content"><div class="ctgb-detail-title">🔍 ${esc(owner ? `${owner.name}のカード` : 'カード詳細')}</div><div class="ctgb-detail-space"><div class="ctgb-detail-card">${renderNativeCard(card)}</div></div><div class="ctgb-detail-close">画面をクリックして閉じる</div></div>`;
        document.body.appendChild(overlay);
    };

    async function showTagBattleOpening(battle) {
        const root = document.getElementById('tcg-tag-battle-ui');
        if (!root || !battle) return;
        const old = document.getElementById('ctgb-opening-cinematic');
        if (old) old.remove();
        const layer = document.createElement('div');
        layer.id = 'ctgb-opening-cinematic';
        layer.className = 'ctgb-cinematic-layer';
        layer.style.setProperty('--ctgb-glow', '#ffad21');
        layer.innerHTML = battle.networkMode === 'single'
            ? '<div class="ctgb-cinematic-title">ONLINE BATTLE START!!<small>1 VS 1 CARD DUEL</small></div>'
            : '<div class="ctgb-cinematic-title">TAG BATTLE START!!<small>2 VS 2 CARD DUEL</small></div>';
        document.body.appendChild(layer);
        await wait(40);
        layer.classList.add('is-show');
        await wait(850);
        layer.classList.remove('is-show');
        await wait(260);
        if (!document.body.contains(layer) || battle.isEnded) { layer.remove(); return; }
        layer.innerHTML = '<div class="ctgb-cinematic-title">COIN TOSS<small>先攻チームを決定します</small></div><div class="ctgb-coin-wrap"><div class="ctgb-coin"></div></div>';
        void layer.offsetWidth;
        layer.classList.add('is-show');
        await wait(2200);
        const local = battle.actors[localActorId()] || battle.actors.player;
        const localTeamWonCoin = battle.playerTeamWonCoin === (!local || local.team === 'player');
        layer.style.setProperty('--ctgb-glow', localTeamWonCoin ? '#22e4ef' : '#ff405e');
        layer.innerHTML = `<div class="ctgb-cinematic-title" style="top:50%">${localTeamWonCoin ? 'YOUR TEAM FIRST!' : 'OPPONENT TEAM FIRST!'}<small>${localTeamWonCoin ? 'あなたのチームが先攻' : '相手チームが先攻'}</small></div>`;
        void layer.offsetWidth;
        layer.classList.add('is-show');
        await wait(1050);
        layer.classList.remove('is-show');
        await wait(300);
        layer.remove();
    }

    async function showTagTurnCutin(unit) {
        const battle = state();
        if (!battle || !unit || !document.getElementById('tcg-tag-battle-ui')) return;
        const old = document.getElementById('ctgb-turn-cinematic');
        if (old) old.remove();
        const layer = document.createElement('div');
        const local = battle.actors[localActorId()] || battle.actors.player;
        const label = unit.id === localActorId() ? 'YOUR TURN' : local && unit.team === local.team ? 'ALLY TURN' : 'ENEMY TURN';
        const color = local && unit.team === local.team ? '#22dcea' : '#ff4c68';
        layer.id = 'ctgb-turn-cinematic';
        layer.className = 'ctgb-cinematic-layer';
        layer.style.setProperty('--ctgb-glow', color);
        layer.innerHTML = `<div class="ctgb-cinematic-title" style="top:50%">${label}<small>${esc(unit.name)}のターン</small></div>`;
        document.body.appendChild(layer);
        await wait(35);
        layer.classList.add('is-show');
        await wait(900);
        layer.classList.remove('is-show');
        await wait(280);
        layer.remove();
    }

    function playAnimationEndpoint(unit, card) {
        if (card.type === 'field') return document.querySelector(`#tcg-tag-battle-ui [data-team-field="${unit.team}"]`);
        if (card.type === 'person') return document.querySelector(`#tcg-tag-battle-ui [data-person-actor="${unit.id}"]`);
        if (card.type === 'action' || card.type === 'item') return document.querySelector(`#tcg-tag-battle-ui [data-actor="${unit.id}"]`);
        return document.querySelector(`#tcg-tag-battle-ui [data-board-actor="${unit.id}"]`);
    }

    async function showTagCardPlay(unit, card, caption) {
        const root = document.getElementById('tcg-tag-battle-ui');
        if (!root || !unit || !card) return;
        const sourceElement = cardElement(card) || document.querySelector(`#tcg-tag-battle-ui [data-actor="${unit.id}"]`);
        const start = elementCenter(sourceElement, window.innerWidth / 2, unit.team === 'player' ? window.innerHeight * .8 : window.innerHeight * .2);
        const end = elementCenter(playAnimationEndpoint(unit, card), window.innerWidth / 2, unit.team === 'player' ? window.innerHeight * .65 : window.innerHeight * .35);
        const layer = document.createElement('div');
        const glow = unit.team === 'player' ? '#29e6ef' : '#ff4d69';
        layer.className = 'ctgb-cinematic-layer';
        layer.style.background = 'rgba(0,0,0,.58)';
        layer.style.setProperty('--ctgb-glow', glow);
        layer.innerHTML = `<div class="ctgb-card-cutin-label">${esc(unit.name)}<br><span style="font-size:.55em;color:#ffe598">${esc(caption || card.name)}</span></div><div class="ctgb-card-cutin">${renderNativeCard(card)}</div>`;
        document.body.appendChild(layer);
        const focus = layer.querySelector('.ctgb-card-cutin');
        focus.style.left = `${start.x}px`; focus.style.top = `${start.y}px`;
        await wait(35);
        focus.classList.add('is-center');
        await wait(1050);
        focus.classList.remove('is-center');
        focus.style.left = `${end.x}px`; focus.style.top = `${end.y}px`;
        focus.classList.add('is-exit');
        await wait(420);
        layer.remove();
    }

    function targetElement(target) {
        if (!target) return null;
        if (target.card) return cardElement(target.card);
        if (target.zone === 'field') return document.querySelector(`#tcg-tag-battle-ui [data-team-field="${target.team}"]`);
        if (target.zone === 'leader') return document.querySelector(`#tcg-tag-battle-ui [data-team-leader="${target.team}"]`);
        if (target.actor) return document.querySelector(`#tcg-tag-battle-ui [data-actor="${target.actor.id}"]`);
        return null;
    }

    async function showTagAttack(attackerUnit, attackerCard, target) {
        const root = document.getElementById('tcg-tag-battle-ui');
        const sourceElement = cardElement(attackerCard);
        const destinationElement = targetElement(target);
        if (!root || !sourceElement || !destinationElement) { await wait(220); return; }
        const start = elementCenter(sourceElement);
        const end = elementCenter(destinationElement);
        const dx = end.x - start.x; const dy = end.y - start.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const layer = document.createElement('div');
        layer.className = 'ctgb-attack-layer';
        layer.innerHTML = `<div class="ctgb-attack-beam"></div>${target.zone === 'leader' ? '<div class="ctgb-direct-cutin">DIRECT ATTACK!!</div>' : ''}<div class="ctgb-attack-clone"><div class="ctgb-cardscale">${renderNativeCard(attackerCard)}</div></div>`;
        document.body.appendChild(layer);
        const clone = layer.querySelector('.ctgb-attack-clone');
        const beam = layer.querySelector('.ctgb-attack-beam');
        clone.style.setProperty('--tag-card-scale', getComputedStyle(root).getPropertyValue('--tag-card-scale') || '.5');
        clone.style.left = `${start.x}px`; clone.style.top = `${start.y}px`;
        clone.style.width = `${start.width || 90}px`; clone.style.height = `${start.height || 130}px`;
        clone.style.overflow = 'hidden'; clone.style.borderRadius = '8px';
        beam.style.left = `${start.x}px`; beam.style.top = `${start.y}px`; beam.style.width = `${distance}px`; beam.style.transform = `rotate(${angle}deg)`;
        await wait(35);
        beam.classList.add('is-fire');
        clone.style.left = `${start.x + dx * .82}px`; clone.style.top = `${start.y + dy * .82}px`; clone.style.transform = 'translate(-50%,-50%) scale(1.12) rotate(-4deg)';
        await wait(360);
        const spark = document.createElement('div');
        spark.className = 'ctgb-impact-spark'; spark.style.left = `${end.x}px`; spark.style.top = `${end.y}px`; layer.appendChild(spark);
        destinationElement.classList.add('ctgb-impact-hit');
        root.classList.remove('ctgb-screen-shake'); void root.offsetWidth; root.classList.add('ctgb-screen-shake');
        clone.style.left = `${start.x}px`; clone.style.top = `${start.y}px`; clone.style.opacity = '0'; clone.style.transform = 'translate(-50%,-50%) scale(.72)';
        await wait(420);
        destinationElement.classList.remove('ctgb-impact-hit');
        root.classList.remove('ctgb-screen-shake');
        layer.remove();
    }

    async function showTagImpact(target, amount, defeated) {
        const element = targetElement(target);
        if (!element) { await wait(120); return; }
        if (target.zone === 'leader' && target.team && state() && state().teams[target.team]) {
            const hp = element.querySelector('b');
            if (hp) hp.textContent = `HP: ${Math.max(0, state().teams[target.team].hp)} / ${state().teams[target.team].maxHp}`;
        } else if (target.card) {
            const hp = element.querySelector('.ctgb-card-state .hp');
            if (hp) hp.textContent = `♥${Math.max(0, Number(target.card.hp) || 0)}`;
        }
        const center = elementCenter(element);
        const number = document.createElement('div');
        number.className = 'ctgb-damage-number';
        number.style.left = `${center.x}px`; number.style.top = `${center.y}px`;
        number.textContent = amount > 0 ? `-${amount}${defeated ? '  BREAK!' : ''}` : 'BLOCK!';
        document.body.appendChild(number);
        await wait(520);
        number.remove();
    }

    function actualCost(unit, card) {
        let cost = Number(card.cost) || 0;
        if (card._nextActionFree && (card.type === 'action' || card.type === 'item')) cost = 0;
        if ((unit._allZeroCost || livingCards(unit).some(entry => entry.ability === 'all_zero_cost')) && (card.type === 'action' || card.type === 'item')) cost = 0;
        const sovereign = livingCards(unit).some(entry => entry.ability === 'mana_sovereign');
        if (sovereign) cost = Math.floor(cost / 2);
        if ((card.type === 'action' || card.type === 'item') && livingCards(unit).some(entry => entry.ability === 'aura_action_cost')) cost -= 1;
        cost = Math.max(0, cost);
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        return supportExpansion && typeof supportExpansion.adjustCost === 'function'
            ? supportExpansion.adjustCost(unit, card, cost)
            : cost;
    }

    function isMonster(card) { return card && !['person', 'field', 'action', 'item'].includes(card.type); }
    function evolutionCandidates(unit, card) {
        if (!unit || !card || !card.evolvesFrom) return [];
        return unit.field.map((base, index) => ({ base, index })).filter(entry => entry.base && !entry.base.isDead && !entry.base.cannotEvolve
            && (entry.base.type === card.evolvesFrom || entry.base._supportEvolutionType === card.evolvesFrom));
    }

    function canEvolve(unit, card) {
        const candidates = evolutionCandidates(unit, card);
        return candidates.length ? candidates[0].index : -1;
    }

    function guardCost() {
        const battle = state();
        return battle && (battle.teams.player.field && battle.teams.player.field.ability === 'field_castle'
            || battle.teams.enemy.field && battle.teams.enemy.field.ability === 'field_castle') ? 0 : 1;
    }

    function hasGuardBypass(card) {
        return ['flight', 'god_strike', 'dimension_drill', 'piercing_juggernaut', 'pierce_recoil'].includes(card.ability) || card._smith_trample;
    }

    function guardsFor(teamId) {
        return allTeamCards(teamId, false).filter(entry => entry.card.ability === 'taunt' || entry.card.hasPermanentTaunt
            || entry.card.ability === 'pure_aegis' || entry.card.isDefending || entry.card._builder_guarded)
            .filter(entry => !entry.card._supportEntangled);
    }

    function legalAttackTargets(attackerUnit, attackerCard) {
        const opposingTeam = attackerUnit.team === 'player' ? 'enemy' : 'player';
        const guards = guardsFor(opposingTeam);
        if (guards.length && !hasGuardBypass(attackerCard)) return guards;
        const targets = allTeamCards(opposingTeam, true).filter(entry => entry.card.ability !== 'stealth');
        const opposing = state().teams[opposingTeam];
        if (opposing.field) targets.push({ actor: null, card: opposing.field, zone: 'field', team: opposingTeam });
        targets.push({ actor: null, card: null, zone: 'leader', team: opposingTeam });
        return targets;
    }

    function selectableKey(target) {
        if (!target) return '';
        if (target.zone === 'actor') return `actor:${target.actor.id}`;
        if (target.zone === 'leader' || target.zone === 'field') return `${target.zone}:${target.team}`;
        return `${target.zone}:${target.actor.id}:${target.card._tagId}`;
    }

    function targetFromSelectableKey(key) {
        const battle = state();
        const parts = String(key || '').split(':');
        if (!battle || !parts[0]) return null;
        if (parts[0] === 'leader') return { actor: null, card: null, zone: 'leader', team: parts[1] };
        if (parts[0] === 'field') {
            const team = battle.teams[parts[1]];
            return team && team.field ? { actor: null, card: team.field, zone: 'field', team: parts[1] } : null;
        }
        if (parts[0] === 'actor') {
            const unit = battle.actors[parts[1]];
            return unit ? { actor: unit, card: null, zone: 'actor', team: unit.team } : null;
        }
        const unit = battle.actors[parts[1]];
        if (!unit) return null;
        let card = livingCards(unit).find(entry => entry._tagId === parts[2]);
        if (!card && unit.person && unit.person._tagId === parts[2]) card = unit.person;
        return card ? { actor: unit, card, zone: parts[0], team: unit.team } : null;
    }

    function playerCanAct() {
        const battle = state();
        const current = currentActor();
        const controlled = actionActorId();
        return !!(battle && !battle.isEnded && !battle.isAnimating && current && current.id === controlled
            && current.isHuman && !(battle.autoPlayer && controlled === localActorId()));
    }

    function avatarHtml(unit) {
        const avatar = unit.isHuman
            ? `<span class="ctgb-avatar ctgb-player-avatar">${unit.id === localActorId() ? '♛' : '♟'}</span>`
            : (typeof window.renderCasinoMasterAvatar === 'function'
                ? window.renderCasinoMasterAvatar(unit.masterType, 'ctgb-avatar')
                : '<span class="ctgb-avatar">♟</span>');
        return avatar;
    }

    function actorHudHtml(unit) {
        const battle = state();
        const active = currentActor();
        const actorTarget = battle.pendingTarget && battle.pendingTarget.find(target => target.zone === 'actor' && target.actor.id === unit.id);
        const orderNumber = battle.order.indexOf(unit.id) + 1;
        return `<div class="ctgb-actor-hud${active && active.id === unit.id ? ' is-active' : ''}${actorTarget ? ' is-clickable' : ''}" data-actor="${unit.id}" ${actorTarget ? `onclick="window.selectCasinoTagTarget('${esc(selectableKey(actorTarget))}')"` : ''}>
            <span class="ctgb-order-no">${orderNumber}</span>${avatarHtml(unit)}
            <span class="ctgb-actor-copy"><span class="ctgb-actor-name">${esc(unit.name)}</span><span class="ctgb-resources"><span>◆ <b>${unit.currentMana}/${unit.maxMana}</b></span><span>✋ <b>${unit.hand.length}</b></span><span>▣ <b>${unit.deck.length}</b></span><span>☠ <b>${unit.graveyard.length}</b></span></span></span>
        </div>`;
    }

    function magnifierHtml(card) {
        if (!card || !card._tagId) return '';
        return `<span class="ctgb-magnifier" role="button" aria-label="${esc(card.name)}の詳細を見る" title="詳細を見る" onclick="event.stopPropagation();window.showCasinoTagCardDetail('${esc(card._tagId)}')">🔍</span>`;
    }

    function boardLaneHtml(unit) {
        const battle = state();
        const active = currentActor();
        const targetMode = !!battle.pendingTarget;
        const actorHasTarget = targetMode && battle.pendingTarget.some(target => target.actor && target.actor.id === unit.id);
        const illegal = targetMode && !actorHasTarget;
        const cards = livingCards(unit).map(card => {
            const target = battle.pendingTarget && battle.pendingTarget.find(entry => entry.card === card);
            const selected = battle.selectedAttacker && battle.selectedAttacker.card === card;
            const clickableAttacker = playerCanAct() && unit.id === localActorId() && card.canAttack && card.status !== 'stunned' && card.status !== 'fossilized';
            const click = target
                ? `window.selectCasinoTagTarget('${esc(selectableKey(target))}')`
                : clickableAttacker ? `window.selectCasinoTagAttacker('${unit.id}','${card._tagId}')` : '';
            const classes = ['ctgb-slot'];
            if (target || clickableAttacker) classes.push('is-clickable');
            if (selected) classes.push('is-selected');
            if (card.status === 'stunned' || card.status === 'fossilized') classes.push('ctgb-stunned');
            const exhausted = !!(active && active.id === unit.id && !card.canAttack);
            if (exhausted) classes.push('is-exhausted');
            const actionState = card.status === 'stunned' || card.status === 'fossilized'
                ? '<span class="ctgb-exhausted-label">行動不能</span>'
                : exhausted ? '<span class="ctgb-exhausted-label">行動済み</span>' : '';
            return `<div class="${classes.join(' ')}" data-card-id="${esc(card._tagId)}" ${click ? `onclick="${click}"` : ''}><div class="ctgb-cardscale">${renderNativeCard(card)}</div>${magnifierHtml(card)}${card.ability === 'taunt' || card.ability === 'pure_aegis' || card.isDefending ? '<span class="ctgb-guard">守護</span>' : ''}${actionState}<span class="ctgb-card-state"><i class="atk">⚔${card.damage}</i><i class="hp">♥${Math.max(0, card.hp)}</i></span></div>`;
        }).join('');
        return `<div class="ctgb-board-lane${active && active.id === unit.id ? ' is-active' : ''}${illegal ? ' is-illegal' : ''}" data-board-actor="${unit.id}"><span class="ctgb-lane-name">${esc(unit.name)}のカード</span>${cards || '<span class="ctgb-board-empty">モンスターなし</span>'}</div>`;
    }

    function personColumnHtml(unit) {
        const battle = state();
        const active = currentActor();
        const personTarget = battle.pendingTarget && battle.pendingTarget.find(target => target.zone === 'person' && target.actor.id === unit.id);
        const skills = unit.person && window.TCG_MASTER && window.TCG_MASTER[unit.person.masterId]
            ? (window.TCG_MASTER[unit.person.masterId].personSkills || window.TCG_MASTER[unit.person.masterId].skills || []) : [];
        const skillButtons = unit.id === localActorId() && active && active.id === unit.id && !unit.personSkillUsed && !battle.isAnimating && !battle.autoPlayer
            ? `<div class="ctgb-person-skills">${skills.map((skill, index) => `<button class="ctgb-small-btn" ${unit.currentMana >= Number(skill.cost || 0) ? `onclick="window.openCasinoTagPersonSkill(${index})"` : 'disabled'} title="${esc(skill.desc || '')}">${esc(skill.name)} ${Number(skill.cost) || 0}M</button>`).join('')}</div>` : '';
        const person = unit.person && !unit.person.isDead
            ? `<div class="ctgb-board-object ctgb-person-object${personTarget ? ' is-clickable' : ''}" data-card-id="${esc(unit.person._tagId)}" ${personTarget ? `onclick="window.selectCasinoTagTarget('${esc(selectableKey(personTarget))}')"` : ''}><div class="ctgb-cardscale">${renderNativeCard(unit.person)}</div>${magnifierHtml(unit.person)}</div>`
            : '<div class="ctgb-board-object ctgb-person-object">人物</div>';
        return `<div class="ctgb-side-column" data-person-actor="${unit.id}"><span class="ctgb-side-label">${esc(unit.name)}・人物</span>${person}${skillButtons}</div>`;
    }

    function fieldColumnHtml(teamId) {
        const battle = state();
        const team = battle.teams[teamId];
        const fieldTarget = battle.pendingTarget && battle.pendingTarget.find(target => target.zone === 'field' && target.team === teamId);
        const field = team.field
            ? `<div class="ctgb-board-object ctgb-field-object${fieldTarget ? ' is-clickable' : ''}" data-card-id="${esc(team.field._tagId)}" ${fieldTarget ? `onclick="window.selectCasinoTagTarget('${esc(selectableKey(fieldTarget))}')"` : ''}><div class="ctgb-cardscale">${renderNativeCard(team.field)}</div>${magnifierHtml(team.field)}<span class="ctgb-card-state"><i></i><i class="hp">♥${Math.max(0, team.field.hp)}</i></span></div>`
            : '<div class="ctgb-board-object ctgb-field-object">フィールド</div>';
        return `<div class="ctgb-side-column" data-team-field="${teamId}"><span class="ctgb-side-label">共有フィールド</span>${field}</div>`;
    }

    function teamSummaryHtml(teamId) {
        const battle = state();
        const team = battle.teams[teamId];
        const local = battle.actors[localActorId()];
        const localTeam = local ? local.team : 'player';
        const visualSide = teamId === localTeam ? 'player' : 'enemy';
        const leaderTarget = battle.pendingTarget && battle.pendingTarget.find(target => target.zone === 'leader' && target.team === teamId);
        return `<div class="ctgb-team-summary ${visualSide}${leaderTarget ? ' is-target' : ''}" data-team-leader="${teamId}" ${leaderTarget ? `onclick="window.selectCasinoTagTarget('${esc(selectableKey(leaderTarget))}')"` : ''}><small>${visualSide === 'enemy' ? 'OPPONENT TEAM' : 'YOUR TEAM'}</small><strong>${esc(visualSide === 'enemy' ? '相手チーム' : 'あなたのチーム')}</strong><b>HP: ${Math.max(0, team.hp)} / ${team.maxHp}</b></div>`;
    }

    function teamZoneHtml(teamId) {
        const battle = state();
        const local = battle.actors[localActorId()];
        const localTeam = local ? local.team : 'player';
        const actorIds = battle.teamActorIds[teamId].slice();
        if (teamId === localTeam) actorIds.sort((a, b) => (a === localActorId() ? 1 : 0) - (b === localActorId() ? 1 : 0));
        const units = actorIds.map(id => battle.actors[id]);
        const fillers = units.length === 1 ? '<div class="ctgb-board-lane"><span class="ctgb-board-empty">シングル戦</span></div>' : '';
        const personFillers = units.length === 1 ? '<div class="ctgb-side-column"><div class="ctgb-board-object ctgb-person-object">—</div></div>' : '';
        const visualSide = teamId === localTeam ? 'player' : 'enemy';
        return `<section class="ctgb-team-zone is-${visualSide}"><span class="ctgb-zone-caption">${visualSide === 'enemy' ? '相手チームの場' : 'あなたのチームの場'}</span>${fieldColumnHtml(teamId)}${units.map(boardLaneHtml).join('')}${fillers}${units.map(personColumnHtml).join('')}${personFillers}</section>`;
    }

    function handHtml() {
        const battle = state();
        const unit = battle.actors[localActorId()];
        if (!unit) return '';
        const enabled = playerCanAct() && !battle.pendingTarget && !battle.selectedAttacker;
        return unit.hand.map((card, index) => {
            const cost = actualCost(unit, card);
            const legalMonster = !isMonster(card) || (card.evolvesFrom ? canEvolve(unit, card) >= 0 : unit.field.length < BOARD_LIMIT);
            const legal = enabled && unit.currentMana >= cost && (card.type !== 'action' || !unit.actionUsed)
                && legalMonster;
            return `<button class="ctgb-hand-card${legal ? '' : ' is-disabled'}" data-card-id="${esc(card._tagId)}" data-hand-index="${index}" ${legal ? `onclick="window.playCasinoTagCard(${index})"` : 'aria-disabled="true"'} title="${esc(card.name)}"><span class="ctgb-cost">${cost}</span><span class="ctgb-cardscale">${renderNativeCard(card)}</span>${magnifierHtml(card)}</button>`;
        }).join('');
    }

    function allyHandHtml() {
        const battle = state();
        const local = battle.actors[localActorId()];
        const ally = local && teamActors(local.team).find(unit => unit.id !== local.id);
        if (!ally) return '<span style="color:#888;font-size:9px">シングル戦</span>';
        if (!battle.allyHandOpen) return `<span style="color:#bba9d0;font-size:9px">${esc(ally.name)}の手札 ${ally.hand.length}枚</span>`;
        return ally.hand.map(card => `<span class="ctgb-ally-card" data-card-id="${esc(card._tagId)}" title="${esc(card.name)}・${actualCost(ally, card)}M"><span class="ctgb-cardscale">${renderNativeCard(card)}</span><span class="ctgb-cost">${actualCost(ally, card)}</span>${magnifierHtml(card)}</span>`).join('') || '<span style="font-size:9px;color:#888">手札なし</span>';
    }

    window.renderCasinoTCGTagBattle = function () {
        const battle = state();
        if (!battle) return;
        if (!battle.isEnded && window.audioManager) {
            const targetBGM = battle.teams.enemy.hp < 100 ? 'card_chance' : battle.teams.player.hp < 100 ? 'card_pinch' : 'card_main';
            if (window.audioManager.currentBGMType !== targetBGM) window.audioManager.playBGM(targetBGM);
        }
        let ui = document.getElementById('tcg-tag-battle-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'tcg-tag-battle-ui';
            document.body.appendChild(ui);
        }
        const active = currentActor();
        const local = battle.actors[localActorId()] || battle.actors.player;
        const localTeamId = local ? local.team : 'player';
        const enemyTeamId = localTeamId === 'player' ? 'enemy' : 'player';
        const localUnits = teamActors(localTeamId).slice().sort((a, b) => (a.id === localActorId() ? 1 : 0) - (b.id === localActorId() ? 1 : 0));
        const enemyUnits = teamActors(enemyTeamId);
        const order = battle.order.map((id, index) => `<span class="${index === battle.cursor ? 'is-current' : ''}">${index + 1} ${esc(battle.actors[id].name)}</span>`).join('');
        const inactiveActionLabel = active && active.id === localActorId() ? '処理中…' : active ? `${esc(active.name)}のターン` : '進行中…';
        const timer = battle.networkMode && battle.networkDeadline ? `<span class="ctgb-network-timer" data-deadline="${Number(battle.networkDeadline)}">--</span>` : '';
        ui.innerHTML = `${battleStyle()}<header class="ctgb-enemy-console">${teamSummaryHtml(enemyTeamId)}<div class="ctgb-roster">${enemyUnits.map(actorHudHtml).join('')}</div><div class="ctgb-controls">${battle.networkMode ? '<span class="ctgb-small-btn">P2P</span>' : `<button class="ctgb-small-btn${battle.autoPlayer ? ' is-on' : ''}" onclick="window.toggleCasinoTagAuto()">AUTO ${battle.autoPlayer ? 'ON' : 'OFF'}</button>`}</div></header>
            <div class="ctgb-orderbar"><span class="ctgb-top-title">${battle.networkMode === 'single' ? 'ONLINE SINGLE' : 'TAG TEAM TCG'} · ROUND ${battle.round}</span>${timer}<div class="ctgb-order">${order}</div></div>
            <main class="ctgb-stage">
                <div class="ctgb-table-surface">${teamZoneHtml(enemyTeamId)}${teamZoneHtml(localTeamId)}</div>
                <div class="ctgb-center"><span class="ctgb-turn">${active ? `${esc(active.name)} のターン` : ''}</span></div>
                <div id="ctgb-bubble" class="ctgb-bubble"></div><div id="ctgb-transient"></div>
            </main>
            <footer class="ctgb-player-console"><div class="ctgb-player-status">${teamSummaryHtml(localTeamId)}<div class="ctgb-roster">${localUnits.map(actorHudHtml).join('')}</div></div><div class="ctgb-hand-area"><div class="ctgb-ally-hand"><button onclick="window.toggleCasinoTagAllyHand()">相棒の手札 ${battle.allyHandOpen ? '▲' : '▼'}</button>${allyHandHtml()}</div><div class="ctgb-hand">${handHtml()}</div></div><div class="ctgb-actions">${playerCanAct() && battle.pendingTarget ? '<button class="ctgb-end" onclick="window.cancelCasinoTagTarget()">対象選択をやめる</button>' : playerCanAct() ? '<button class="ctgb-end" onclick="window.endCasinoTagPlayerTurn()">ターン終了 ➜</button>' : `<button class="ctgb-end" disabled>${inactiveActionLabel}</button>`}<button class="ctgb-forfeit" onclick="window.requestCasinoTagForfeit()">投了する</button></div></footer>`;
        if (battle.networkDefense && battle.networkDefense.actorId === localActorId()) renderNetworkDefenseOverlay();
        if (battle.networkMode && battle.isNetworkAuthority && typeof window.onCasinoTCGNetworkStateChanged === 'function') window.onCasinoTCGNetworkStateChanged();
    };

    function toast(message, duration) {
        const holder = document.getElementById('ctgb-transient');
        if (!holder) return;
        holder.innerHTML = `<div class="ctgb-toast">${esc(message).replace(/\n/g, '<br>')}</div>`;
        schedule(() => { if (holder) holder.innerHTML = ''; }, duration || 900);
    }

    async function dialogue(unit, event, details, priority, allowEnded) {
        const battle = state();
        if (!battle || !unit || unit.isHuman) return;
        const text = typeof window.getCasinoMasterGameDialogue === 'function'
            ? window.getCasinoMasterGameDialogue(unit.masterType, event, details || {})
            : '';
        if (!text) return;
        battle.dialogueQueue.push({ unit, text, priority: Number(priority) || 0, allowEnded: !!allowEnded });
        battle.dialogueQueue.sort((a, b) => b.priority - a.priority);
        if (battle.dialogueBusy) return;
        battle.dialogueBusy = true;
        while (battle.dialogueQueue.length) {
            const entry = battle.dialogueQueue.shift();
            if (battle.isEnded && !entry.allowEnded) continue;
            const bubble = document.getElementById('ctgb-bubble');
            const seat = document.querySelector(`[data-actor="${entry.unit.id}"]`);
            if (bubble && seat) {
                const seatRect = seat.getBoundingClientRect();
                const rootRect = document.getElementById('tcg-tag-battle-ui').getBoundingClientRect();
                bubble.style.left = `${clamp(seatRect.left - rootRect.left + 74, 8, rootRect.width - 345)}px`;
                bubble.style.top = `${clamp(seatRect.top - rootRect.top + 28, 44, rootRect.height - 130)}px`;
                bubble.innerHTML = `<strong>${esc(entry.unit.name)}</strong>${esc(entry.text)}`;
                bubble.classList.add('is-show');
                await wait(900);
                bubble.classList.remove('is-show');
            }
        }
        battle.dialogueBusy = false;
    }

    window.toggleCasinoTagAllyHand = function () {
        const battle = state(); if (!battle) return;
        battle.allyHandOpen = !battle.allyHandOpen;
        window.renderCasinoTCGTagBattle();
    };

    window.focusCasinoTagSeat = function (actorId) {
        const battle = state();
        if (!battle || !battle.actors[actorId]) return;
        battle.mobileFocusActorId = actorId;
        window.renderCasinoTCGTagBattle();
    };

    window.toggleCasinoTagAuto = function () {
        const battle = state(); if (!battle || battle.isEnded) return;
        if (battle.networkMode) return;
        battle.autoPlayer = !battle.autoPlayer;
        window.renderCasinoTCGTagBattle();
        const active = currentActor();
        if (battle.autoPlayer && active && active.id === 'player' && !battle.isAnimating) runCpuTurn(active);
    };

    window.startCasinoTCGTagBattleEngine = function (setup) {
        const battle = createBattle(setup);
        if (!battle) {
            if (typeof window.showGameAlert === 'function') window.showGameAlert('タッグ戦用デッキを準備できませんでした。');
            return false;
        }
        const single = document.getElementById('tcg-battle-ui');
        if (single) single.remove();
        const map = document.getElementById('casino-map-ui');
        if (map) map.style.display = 'none';
        window.DEALER_TCG_CONTEXT = null;
        window.TCG_BATTLE = null;
        window.TCG_TAG_BATTLE = battle;
        if (window.audioManager) window.audioManager.playBGM('card_main');
        window.renderCasinoTCGTagBattle();
        (async () => {
            await showTagBattleOpening(battle);
            if (state() !== battle || battle.isEnded) return;
            await Promise.all([dialogue(battle.actors.ally, 'start', {}, 1), dialogue(battle.actors.enemy1, 'start', {}, 1), dialogue(battle.actors.enemy2, 'start', {}, 1)]);
            if (state() === battle && !battle.isEnded) beginTurn();
        })();
        return true;
    };

    window.startCasinoTCGNetworkBattleEngine = function (setup) {
        const battle = createNetworkBattle(setup || {});
        if (!battle) return false;
        const single = document.getElementById('tcg-battle-ui'); if (single) single.remove();
        const map = document.getElementById('casino-map-ui'); if (map) map.style.display = 'none';
        window.DEALER_TCG_CONTEXT = null;
        window.TCG_BATTLE = null;
        window.TCG_TAG_BATTLE = battle;
        if (window.audioManager) window.audioManager.playBGM('card_main');
        window.renderCasinoTCGTagBattle();
        (async () => {
            await showTagBattleOpening(battle);
            if (state() !== battle || battle.isEnded) return;
            await Promise.all(Object.values(battle.actors).filter(unit => !unit.isHuman).map(unit => dialogue(unit, 'start', {}, 1)));
            if (state() === battle && !battle.isEnded) beginTurn();
        })();
        return true;
    };

    window.exportCasinoTCGNetworkSnapshot = function () {
        const battle = state();
        if (!battle || !battle.networkMode) return null;
        const refs = {
            pendingTargetKeys: Array.isArray(battle.pendingTarget) ? battle.pendingTarget.map(selectableKey) : [],
            selectedAttacker: battle.selectedAttacker ? { actorId: battle.selectedAttacker.actor.id, cardId: battle.selectedAttacker.card._tagId } : null,
            pendingPlay: battle.pendingPlay ? { actorId: battle.pendingPlay.unit.id, handIndex: battle.pendingPlay.handIndex } : null,
            pendingPersonSkill: battle.pendingPersonSkill ? { actorId: battle.pendingPersonSkill.unit.id, index: battle.pendingPersonSkill.index } : null
        };
        const transient = ['pendingTarget', 'selectedAttacker', 'pendingPlay', 'pendingPersonSkill'];
        const saved = {};
        transient.forEach(key => { saved[key] = battle[key]; battle[key] = null; });
        let data;
        try {
            const omitted = new Set(['_networkIntentActorId', '_defenseResolve', '_defenseOptions', '_defenseContext', '_defenseActorId']);
            data = JSON.parse(JSON.stringify(battle, (key, value) => omitted.has(key) || key === 'dialogueQueue' || typeof value === 'function' ? undefined : value));
        } finally {
            transient.forEach(key => { battle[key] = saved[key]; });
        }
        data.networkRefs = refs;
        return data;
    };

    window.installCasinoTCGNetworkSnapshot = function (snapshot, localId, authority) {
        if (!snapshot) return false;
        const battle = typeof snapshot === 'string' ? JSON.parse(snapshot) : JSON.parse(JSON.stringify(snapshot));
        if (!battle.networkMode) return false;
        const refs = battle.networkRefs || {};
        delete battle.networkRefs;
        battle.localActorId = localId || battle.localActorId || 'player';
        battle.isNetworkAuthority = !!authority;
        battle.dialogueQueue = [];
        battle.dialogueBusy = false;
        battle.pendingTarget = null;
        battle.selectedAttacker = null;
        battle.pendingPlay = null;
        battle.pendingPersonSkill = null;
        window.TCG_BATTLE = null;
        window.TCG_TAG_BATTLE = battle;
        const localUnit = battle.actors[battle.localActorId];
        if (battle.isEnded && battle.winnerTeam) {
            battle.result = battle.winnerTeam === 'draw' ? 'draw' : localUnit && battle.winnerTeam === localUnit.team ? 'win' : 'loss';
        }
        if (Array.isArray(refs.pendingTargetKeys)) battle.pendingTarget = refs.pendingTargetKeys.map(targetFromSelectableKey).filter(Boolean);
        if (refs.selectedAttacker) {
            const unit = battle.actors[refs.selectedAttacker.actorId];
            const card = unit && livingCards(unit).find(entry => entry._tagId === refs.selectedAttacker.cardId);
            if (card) battle.selectedAttacker = { actor: unit, card };
        }
        if (refs.pendingPlay) {
            const unit = battle.actors[refs.pendingPlay.actorId];
            if (unit) battle.pendingPlay = { unit, handIndex: Number(refs.pendingPlay.handIndex) };
        }
        if (refs.pendingPersonSkill) {
            const unit = battle.actors[refs.pendingPersonSkill.actorId];
            if (unit) battle.pendingPersonSkill = { unit, index: Number(refs.pendingPersonSkill.index) };
        }
        const map = document.getElementById('casino-map-ui'); if (map) map.style.display = 'none';
        window.renderCasinoTCGTagBattle();
        if (battle.isEnded) schedule(showResultPanel, 20);
        return true;
    };

    window.applyCasinoTCGNetworkIntent = function (actorId, intent) {
        const battle = state();
        const unit = battle && battle.actors[actorId];
        if (!battle || !battle.networkMode || !battle.isNetworkAuthority || !unit || !intent) return false;
        if (unit.controllerId && intent.controllerId && unit.controllerId !== intent.controllerId) return false;
        battle._networkIntentActorId = actorId;
        try {
            if (intent.type === 'select_attacker') window.selectCasinoTagAttacker(actorId, intent.cardId);
            else if (intent.type === 'select_target') window.selectCasinoTagTarget(intent.key);
            else if (intent.type === 'cancel_target') window.cancelCasinoTagTarget();
            else if (intent.type === 'play_card') window.playCasinoTagCard(Number(intent.handIndex), intent.expansionChoices || null);
            else if (intent.type === 'person_skill') window.openCasinoTagPersonSkill(Number(intent.index));
            else if (intent.type === 'end_turn') window.endCasinoTagPlayerTurn();
            else if (intent.type === 'defense') window.resolveCasinoTagDefense(Number(intent.index));
            else if (intent.type === 'forfeit') window.confirmCasinoTagForfeit();
            else return false;
        } finally {
            delete battle._networkIntentActorId;
        }
        return true;
    };

    window.replaceCasinoTCGNetworkSeatWithCpu = function (actorId, fallback) {
        const battle = state();
        const unit = battle && battle.actors[actorId];
        if (!battle || !battle.networkMode || !unit) return false;
        fallback = fallback || unit.fallbackCpu || {};
        unit.isHuman = false;
        unit.controllerId = '';
        unit.fallbackCpu = fallback;
        unit.participant = Object.assign({}, unit.participant, fallback, { isHuman: false, controllerId: '' });
        if (fallback.name) unit.name = fallback.name;
        if (fallback.masterType) {
            unit.masterType = fallback.masterType;
            const profile = profileFor(fallback.masterType);
            unit.image = profile.casino.image || unit.image;
            unit.strategy = profile.deck.strategy || {};
        }
        window.renderCasinoTCGTagBattle();
        if (battle.isNetworkAuthority && currentActor() === unit && !battle.isAnimating) runCpuTurn(unit);
        return true;
    };

    window.promoteCasinoTCGNetworkAuthority = function (localId) {
        const battle = state();
        if (!battle || !battle.networkMode) return false;
        battle.localActorId = localId || battle.localActorId;
        battle.isNetworkAuthority = true;
        battle.isAnimating = false;
        battle.networkDefense = null;
        battle.pendingTarget = null;
        battle.pendingPlay = null;
        battle.pendingPersonSkill = null;
        battle.selectedAttacker = null;
        window.renderCasinoTCGTagBattle();
        const unit = currentActor();
        if (unit && !unit.isHuman) runCpuTurn(unit);
        else if (unit && typeof window.onCasinoTCGNetworkTurnReady === 'function') window.onCasinoTCGNetworkTurnReady(unit, battle);
        return true;
    };

    window.selectCasinoTagAttacker = function (actorId, cardId) {
        if (forwardNetworkIntent('select_attacker', { actorId, cardId })) return;
        const battle = state();
        if (!playerCanAct() || actorId !== actionActorId()) return;
        const unit = actor(actorId);
        const card = livingCards(unit).find(entry => entry._tagId === cardId);
        if (!card || !card.canAttack || card.status === 'stunned' || card.status === 'fossilized') return;
        battle.selectedAttacker = { actor: unit, card };
        battle.pendingTarget = legalAttackTargets(unit, card);
        window.renderCasinoTCGTagBattle();
    };

    window.cancelCasinoTagTarget = function () {
        if (forwardNetworkIntent('cancel_target')) return;
        const battle = state();
        if (!battle || battle.isAnimating) return;
        battle.selectedAttacker = null; battle.pendingTarget = null; battle.pendingPlay = null; battle.pendingPersonSkill = null;
        window.renderCasinoTCGTagBattle();
    };

    window.selectCasinoTagTarget = function (key) {
        if (forwardNetworkIntent('select_target', { key })) return;
        const battle = state();
        if (!battle || !battle.pendingTarget) return;
        const target = battle.pendingTarget.find(entry => selectableKey(entry) === key);
        if (!target) return;
        if (battle.pendingPlay) {
            const pending = battle.pendingPlay;
            battle.pendingPlay = null;
            battle.pendingTarget = null;
            battle.isAnimating = true;
            playCard(pending.unit, pending.handIndex, target).then(() => {
                if (!battle.isEnded) {
                    battle.isAnimating = false;
                    window.renderCasinoTCGTagBattle();
                }
            });
            return;
        }
        if (battle.pendingPersonSkill) {
            const pending = battle.pendingPersonSkill;
            battle.pendingPersonSkill = null;
            battle.pendingTarget = null;
            battle.isAnimating = true;
            window.renderCasinoTCGTagBattle();
            executePersonSkill(pending.unit, pending.index, target).then(() => {
                battle.isAnimating = false;
                window.renderCasinoTCGTagBattle();
            });
            return;
        }
        if (!battle.selectedAttacker) return;
        const selected = battle.selectedAttacker;
        battle.selectedAttacker = null;
        battle.pendingTarget = null;
        battle.isAnimating = true;
        window.renderCasinoTCGTagBattle();
        resolveAttack(selected.actor, selected.card, target).then(() => {
            if (!battle.isEnded) {
                battle.isAnimating = false;
                window.renderCasinoTCGTagBattle();
            }
        });
    };

    window.endCasinoTagPlayerTurn = function () {
        if (forwardNetworkIntent('end_turn')) return;
        const battle = state();
        if (!playerCanAct()) return;
        battle.selectedAttacker = null;
        battle.pendingTarget = null;
        battle.isAnimating = true;
        advanceTurn();
    };

    window.requestCasinoTagForfeit = function () {
        const battle = state(); if (!battle || battle.isEnded) return;
        const root = document.getElementById('tcg-tag-battle-ui'); if (!root) return;
        const overlay = document.createElement('div'); overlay.className = 'ctgb-overlay';
        overlay.innerHTML = `<div class="ctgb-panel"><h3>対戦を投了しますか？</h3><p>${battle.networkMode ? 'あなたのチームの敗北として対戦を終了します。' : 'この対戦は敗北として記録され、対戦相手2人・相棒との戦績にも反映されます。'}</p><div class="ctgb-panel-buttons"><button onclick="this.closest('.ctgb-overlay').remove()">続ける</button><button onclick="window.confirmCasinoTagForfeit()">投了する</button></div></div>`;
        root.appendChild(overlay);
    };

    window.confirmCasinoTagForfeit = function () {
        if (forwardNetworkIntent('forfeit')) return;
        const battle = state();
        const unit = actionActor();
        const losingTeam = unit ? unit.team : 'player';
        finishBattle(losingTeam === 'player' ? 'enemy' : 'player', '投了');
    };

    function healTeam(teamId, amount) {
        const team = state().teams[teamId];
        const before = team.hp;
        team.hp = clamp(team.hp + Math.max(0, Number(amount) || 0), 0, team.maxHp);
        return team.hp - before;
    }

    function damageTeam(teamId, amount) {
        const team = state().teams[teamId];
        const before = team.hp;
        let damage = Math.max(0, Math.floor(Number(amount) || 0));
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.beforeTagTeamDamage === 'function') {
            damage = supportExpansion.beforeTagTeamDamage(team, damage);
        }
        if (team.captainGuard) damage = Math.max(0, damage - 10);
        team.hp -= damage;
        if (before > 100 && team.hp <= 100 && !team.pinchAnnounced) {
            team.pinchAnnounced = true;
            const speaker = teamActors(teamId).find(unit => unit.role !== 'player');
            if (speaker) dialogue(speaker, 'pinch', {}, 12);
        }
        return damage;
    }

    function ownerOf(card) { return card && actor(card._tagOwnerId); }

    function healCard(card, amount, includeMax) {
        if (!card || card.isDead) return 0;
        const value = Math.max(0, Math.floor(Number(amount) || 0));
        if (includeMax) card.maxHp = Math.max(0, Number(card.maxHp) || 0) + value;
        const before = Number(card.hp) || 0;
        card.hp = Math.min(Number(card.maxHp) || before + value, before + value);
        return card.hp - before;
    }

    function clearStatus(card) {
        if (!card) return;
        card.status = null;
        delete card._silenced;
        delete card._charmed;
        delete card._stunned;
    }

    function removeFromZones(card, preserveFieldMana) {
        const battle = state();
        const manaWasActive = Object.values(battle.teams).some(team => team.field && team.field.ability === 'field_mana');
        Object.values(battle.actors).forEach(unit => {
            unit.field = unit.field.filter(entry => entry !== card);
            if (unit.person === card) unit.person = null;
            unit.hand = unit.hand.filter(entry => entry !== card);
            unit.deck = unit.deck.filter(entry => entry !== card);
        });
        Object.values(battle.teams).forEach(team => { if (team.field === card) team.field = null; });
        const manaIsActive = Object.values(battle.teams).some(team => team.field && team.field.ability === 'field_mana');
        if (!preserveFieldMana && manaWasActive && !manaIsActive) {
            Object.values(battle.actors).forEach(unit => {
                unit.maxMana = Math.max(0, unit.maxMana - 2);
                unit.currentMana = Math.min(unit.currentMana, unit.maxMana);
            });
        }
    }

    async function destroyCard(card, sourceUnit, reason) {
        if (!card || card.isDead) return false;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.preventTagDestroy === 'function' && supportExpansion.preventTagDestroy(card, reason)) {
            toast(`${card.name}は護りの衣で効果を防いだ！`, 700);
            return false;
        }
        card.isDead = true;
        const originalOwner = ownerOf(card);
        removeFromZones(card, reason === 'replace');
        if (originalOwner && !originalOwner.graveyard.includes(card)) originalOwner.graveyard.push(card);
        if (supportExpansion && typeof supportExpansion.onTagCardDestroyed === 'function') supportExpansion.onTagCardDestroyed(card, originalOwner, reason);
        const enemyTeam = originalOwner && originalOwner.team === 'player' ? 'enemy' : 'player';
        const ownTeam = originalOwner && originalOwner.team;
        const ability = card.ability;
        if (ability === 'death_bomb' && enemyTeam) damageTeam(enemyTeam, 20);
        if (ability === 'self_destruct' && enemyTeam && !card._has_self_destructed) {
            card._has_self_destructed = true; damageTeam(enemyTeam, 30);
        }
        if (ability === 'curse_death' && enemyTeam) damageTeam(enemyTeam, 50);
        if (ability === 'burst_spores' && ownTeam) {
            allTeamCards(ownTeam, false).forEach(entry => { healCard(entry.card, 30); entry.card.damage += 10; });
        }
        if (ability === 'mass_bounce' && enemyTeam) {
            const targets = allTeamCards(enemyTeam, false).slice();
            targets.forEach(entry => moveCardToDeck(entry.card));
        }
        if (ability === 'nova_burst' && enemyTeam) {
            const targets = allTeamCards(enemyTeam, false).slice();
            for (const target of targets) await dealCardDamage(target.card, Number(card.maxHp) || 0, originalOwner || sourceUnit, { noEvasion: true });
        }
        if (ability === 'rebirth' && !card._tagRebirthed && originalOwner) {
            card._tagRebirthed = true; card.isDead = false; card.hp = Math.max(1, Number(card.maxHp) || 1);
            originalOwner.graveyard = originalOwner.graveyard.filter(entry => entry !== card);
            if (isMonster(card) && originalOwner.field.length < BOARD_LIMIT) originalOwner.field.push(card);
            else if (card.type === 'person' && !originalOwner.person) originalOwner.person = card;
            const targets = allTeamCards(enemyTeam, false).slice();
            for (const target of targets) await dealCardDamage(target.card, 30, originalOwner, { noEvasion: true });
        }
        if (ability === 'eternal_rebirth' && !card._tagEternalRebirth && originalOwner) {
            card._tagEternalRebirth = true; card.isDead = false; card.hp = Math.max(1, Number(card.maxHp) || 1);
            originalOwner.graveyard = originalOwner.graveyard.filter(entry => entry !== card);
            if (isMonster(card) && originalOwner.field.length < BOARD_LIMIT) originalOwner.field.push(card);
        }
        toast(`${card.name} が${reason === 'bounce' ? '戦場を離れた' : '倒れた'}！`, 650);
        return true;
    }

    function moveCardToDeck(card) {
        const originalOwner = ownerOf(card);
        if (!originalOwner) return false;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.preventTagBounce === 'function' && supportExpansion.preventTagBounce(card)) {
            toast(`${card.name}は護りの衣で山札戻しを防いだ！`, 700);
            return false;
        }
        removeFromZones(card);
        originalOwner.graveyard = originalOwner.graveyard.filter(entry => entry !== card);
        card.isDead = false; card.canAttack = false; card.status = null;
        originalOwner.deck.push(card);
        return true;
    }

    function moveCardToHand(card) {
        const originalOwner = ownerOf(card);
        if (!originalOwner) return false;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.preventTagBounce === 'function' && supportExpansion.preventTagBounce(card)) {
            toast(`${card.name}は護りの衣で手札戻しを防いだ！`, 700);
            return false;
        }
        removeFromZones(card);
        originalOwner.graveyard = originalOwner.graveyard.filter(entry => entry !== card);
        card.isDead = false; card.canAttack = false; card.status = null;
        originalOwner.hand.push(card);
        return true;
    }

    async function dealCardDamage(card, amount, sourceUnit, options) {
        options = options || {};
        if (!card || card.isDead) return { damage: 0, died: false, evaded: false };
        if (card._advancedDamageShield) {
            delete card._advancedDamageShield;
            if (Array.isArray(card.badges)) card.badges = card.badges.filter(entry => entry !== '星の結界');
            return { damage: 0, died: false, shielded: true };
        }
        if (!options.noEvasion && (card.ability === 'evasion' && Math.random() < 0.5 || card.ability === 'absolute_evasion' && Math.random() < 0.8)) {
            return { damage: 0, died: false, evaded: true };
        }
        let damage = Math.max(0, Math.floor(Number(amount) || 0));
        if (card.ability === 'void_counter' && !card._tagVoidCounterUsed && damage > 0) {
            card._tagVoidCounterUsed = true;
            if (options.sourceCard && !options.sourceCard.isDead) {
                options.sourceCard.hp -= damage * 2;
                if (options.sourceCard.hp <= 0) await destroyCard(options.sourceCard, ownerOf(card), 'void_counter');
            }
            return { damage: 0, died: false, countered: true };
        }
        if (card.ability === 'absolute_field' && damage > 0) damage = 1;
        if (card.ability === 'impregnable_armor' && damage <= 30) damage = 0;
        if (['heavy_armor', 'absolute_fortress'].includes(card.ability)) damage = Math.max(0, damage - 20);
        const owner = ownerOf(card);
        if (owner && state().teams[owner.team].captainGuard) damage = Math.max(0, damage - 10);
        if (card._advancedStatusImmune && card.status) card.status = null;
        card.hp -= damage;
        if (damage > 0 && card.ability === 'wrath') card.damage += 20;
        if (damage > 0 && card.ability === 'burst_damage' && sourceUnit) {
            if (options.sourceCard && !options.sourceCard.isDead) {
                options.sourceCard.hp -= 20;
                if (options.sourceCard.hp <= 0) await destroyCard(options.sourceCard, ownerOf(card), 'burst_damage');
            } else damageTeam(sourceUnit.team, 20);
        }
        const died = card.hp <= 0;
        if (died) await destroyCard(card, sourceUnit, 'damage');
        return { damage, died, evaded: false };
    }

    async function cleanDeadCards(sourceUnit) {
        const battle = state();
        if (!battle) return;
        const cards = [];
        Object.values(battle.actors).forEach(unit => {
            unit.field.forEach(card => { if (card && card.hp <= 0 && !card.isDead) cards.push(card); });
            if (unit.person && unit.person.hp <= 0 && !unit.person.isDead) cards.push(unit.person);
        });
        Object.values(battle.teams).forEach(team => { if (team.field && team.field.hp <= 0 && !team.field.isDead) cards.push(team.field); });
        for (const card of cards) await destroyCard(card, sourceUnit, 'damage');
    }

    function checkBattleEnd(reason) {
        const battle = state();
        if (!battle || battle.isEnded) return true;
        const playerDead = battle.teams.player.hp <= 0;
        const enemyDead = battle.teams.enemy.hp <= 0;
        if (playerDead && enemyDead) { finishBattle('draw', reason || '同時決着'); return true; }
        if (playerDead) { finishBattle('enemy', reason || '共有HPが0になった'); return true; }
        if (enemyDead) { finishBattle('player', reason || '共有HPが0になった'); return true; }
        return false;
    }

    function useAttackCount(card) {
        if (card.ability === 'double_strike' || card._captain_double || card.hasDoubleStrike || card._advancedOverclock) {
            card._tagAttacksThisTurn = (card._tagAttacksThisTurn || 0) + 1;
            card.canAttack = card._tagAttacksThisTurn < 2;
        } else card.canAttack = false;
    }

    async function resolveAttack(attackerUnit, attackerCard, target) {
        const battle = state();
        if (!battle || battle.isEnded || !livingCards(attackerUnit).includes(attackerCard)) return;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.redirectTagConfusedAttack === 'function') {
            target = supportExpansion.redirectTagConfusedAttack({
                battle, unit: attackerUnit, card: attackerCard, target,
                legalTargets: () => legalAttackTargets(attackerUnit, attackerCard)
            });
        }
        const defended = await resolveDefenseIntercept(attackerUnit, attackerCard, target);
        if (battle.isEnded || !livingCards(attackerUnit).includes(attackerCard)) return;
        if (attackerCard.status === 'stunned' || attackerCard.status === 'fossilized' || attackerCard._supportEntangled) {
            attackerCard.canAttack = false;
            toast(`${attackerCard.name}は行動不能になり、攻撃できない！`, 800);
            return;
        }
        target = defended || target;
        const currentLegal = legalAttackTargets(attackerUnit, attackerCard);
        if (!currentLegal.some(entry => selectableKey(entry) === selectableKey(target))) {
            target = randomChoice(currentLegal);
            if (!target) return;
        }
        await dialogue(attackerUnit, 'attack', { card: attackerCard.name, target: target.card ? target.card.name : 'リーダー' }, 2);
        toast(`${attackerUnit.name}：${attackerCard.name}の攻撃！`, 650);
        await wait(260);
        let attackDamage = Math.max(0, Number(attackerCard.damage) || 0);
        if (attackerCard._smith_buffed) { attackDamage += 20; delete attackerCard._smith_buffed; }
        if (attackerCard._advancedNextDamageMultiplier) {
            attackDamage = Math.floor(attackDamage * attackerCard._advancedNextDamageMultiplier);
            delete attackerCard._advancedNextDamageMultiplier;
        }
        if (attackerCard.status === 'charmed') {
            const friendlyFireTarget = { actor: null, card: null, zone: 'leader', team: attackerUnit.team };
            await showTagAttack(attackerUnit, attackerCard, friendlyFireTarget);
            const friendlyDamage = damageTeam(attackerUnit.team, attackDamage);
            await showTagImpact(friendlyFireTarget, friendlyDamage, false);
            attackerCard.status = null;
            useAttackCount(attackerCard);
            toast(`${attackerCard.name}は魅了され、味方チームを攻撃した！`, 800);
            checkBattleEnd('魅了による同士討ち');
            return;
        }
        await showTagAttack(attackerUnit, attackerCard, target);
        let dealt = 0;
        let targetDied = false;
        if (target.zone === 'leader') {
            dealt = damageTeam(target.team, attackDamage);
            await showTagImpact(target, dealt, false);
        } else if (target.zone === 'field') {
            const result = await dealCardDamage(target.card, attackDamage, attackerUnit, { sourceCard: attackerCard });
            dealt = result.damage; targetDied = result.died;
            await showTagImpact(target, dealt, targetDied);
        } else {
            const defender = target.card;
            const retaliation = target.zone === 'card' ? Math.max(0, Number(defender.damage) || 0) : 0;
            const result = await dealCardDamage(defender, attackerCard.ability === 'god_strike' ? Math.max(attackDamage, defender.hp) : attackDamage, attackerUnit, { sourceCard: attackerCard });
            dealt = result.damage; targetDied = result.died;
            await showTagImpact(target, dealt, targetDied);
            if (attackerCard.ability === 'venom_strike' && dealt > 0 && !result.died && target.zone === 'card') await destroyCard(defender, attackerUnit, 'venom');
            if (attackerCard.ability === 'debuff_attack' && dealt > 0 && !defender.isDead) defender.damage = Math.floor(defender.damage / 2);
            if (attackerCard.ability === 'heavy_strike' && dealt > 0 && !defender._advancedStatusImmune) defender.status = 'stunned';
            if (attackerCard.ability === 'silence' && dealt > 0) { defender.ability = ''; defender._silenced = true; }
            if (retaliation > 0 && livingCards(attackerUnit).includes(attackerCard)) {
                const retaliationResult = await dealCardDamage(attackerCard, retaliation, ownerOf(defender));
                await showTagImpact({ actor: attackerUnit, card: attackerCard, zone: 'card', team: attackerUnit.team }, retaliationResult.damage, retaliationResult.died);
            }
        }
        if (attackerCard.ability === 'trample' && target.card && targetDied) {
            const overflow = Math.max(0, attackDamage - Math.max(0, Number(target.card.maxHp) || 0));
            if (overflow) damageTeam(attackerUnit.team === 'player' ? 'enemy' : 'player', overflow);
        }
        if (attackerCard.ability === 'dimension_drill' && target.zone === 'card') damageTeam(attackerUnit.team === 'player' ? 'enemy' : 'player', dealt);
        if (attackerCard.ability === 'splash_damage') {
            const opposing = attackerUnit.team === 'player' ? 'enemy' : 'player';
            const others = allTeamCards(opposing, false).filter(entry => entry.card !== target.card).slice();
            for (const entry of others) await dealCardDamage(entry.card, 10, attackerUnit, { noEvasion: true });
        }
        if (attackerCard.ability === 'god_strike') {
            const opposing = attackerUnit.team === 'player' ? 'enemy' : 'player';
            const other = randomChoice(allTeamCards(opposing, false).filter(entry => entry.card !== target.card));
            if (other) await destroyCard(other.card, attackerUnit, 'god_strike');
        }
        if (attackerCard.ability === 'life_drain' || attackerCard.ability === 'soul_drain') healTeam(attackerUnit.team, attackerCard.ability === 'soul_drain' ? Math.floor(dealt / 2) : dealt);
        if (attackerCard.ability === 'soul_reap' && target.card && !target.card.isDead) {
            target.card.maxHp = Math.max(1, target.card.maxHp - dealt); target.card.hp = Math.min(target.card.hp, target.card.maxHp);
        }
        if (target.card && target.card.ability === 'thorns' && dealt > 0 && livingCards(attackerUnit).includes(attackerCard)) await dealCardDamage(attackerCard, 20, ownerOf(target.card), { noEvasion: true });
        if (target.card && (target.card.ability === 'counter_attack' || target.card._supportCounter) && dealt > 0 && livingCards(attackerUnit).includes(attackerCard)) await dealCardDamage(attackerCard, Number(target.card.damage) || 0, ownerOf(target.card), { noEvasion: true });
        if (attackerCard.ability === 'pierce_recoil' && livingCards(attackerUnit).includes(attackerCard)) await dealCardDamage(attackerCard, 10, attackerUnit, { noEvasion: true });
        if (targetDied && attackerCard.ability === 'devour' && !attackerCard.isDead) { attackerCard.maxHp += 20; attackerCard.hp += 20; attackerCard.damage += 10; }
        if (targetDied && attackerCard.ability === 'apex_predator' && !attackerCard.isDead) { attackerCard.maxHp *= 2; attackerCard.hp = attackerCard.maxHp; attackerCard.damage *= 2; }
        if (attackerCard.ability === 'piercing_juggernaut' && !attackerCard.isDead) attackerCard.damage += 10;
        if (attackerCard.ability === 'stealth') attackerCard.ability = '';
        useAttackCount(attackerCard);
        await cleanDeadCards(attackerUnit);
        if (!checkBattleEnd('攻撃効果')) {
            await wait(260);
            window.renderCasinoTCGTagBattle();
        }
    }

    function targetForNewGuard(attackerUnit, attackerCard, originalTarget) {
        const legal = legalAttackTargets(attackerUnit, attackerCard);
        if (legal.some(entry => selectableKey(entry) === selectableKey(originalTarget))) return originalTarget;
        return randomChoice(legal) || originalTarget;
    }

    function canGuard(unit) {
        const cost = guardCost();
        return unit.currentMana >= cost && livingCards(unit).some(card => !card.isDefending && card.status !== 'stunned' && card.status !== 'fossilized' && !card._supportEntangled);
    }

    async function cpuGuard(unit) {
        if (!canGuard(unit)) return null;
        const candidates = livingCards(unit).filter(card => !card.isDefending && card.status !== 'stunned' && card.status !== 'fossilized' && !card._supportEntangled)
            .sort((a, b) => b.hp - a.hp);
        const chosen = candidates[0];
        if (!chosen) return null;
        unit.currentMana -= guardCost(); chosen.isDefending = true;
        toast(`${unit.name}が${chosen.name}を守護化！`, 650);
        await dialogue(unit, 'tcg_guard_intercept', { card: chosen.name }, 8);
        await wait(180);
        return { actor: unit, card: chosen, zone: 'card', team: unit.team };
    }

    function playerDefenseOptions(unit) {
        const options = [];
        if (canGuard(unit)) livingCards(unit).filter(card => !card.isDefending && card.status !== 'stunned' && card.status !== 'fossilized' && !card._supportEntangled).forEach(card => options.push({ type: 'guard', card }));
        if (unit.person && !unit.personSkillUsed) {
            const master = window.TCG_MASTER && window.TCG_MASTER[unit.person.masterId];
            (master && (master.personSkills || master.skills) || []).forEach((skill, index) => {
                if (unit.currentMana >= Number(skill.cost || 0)) options.push({ type: 'skill', skill, index });
            });
        }
        return options;
    }

    function defenseTargetName(target) {
        const battle = state();
        if (!target) return '不明な対象';
        if (target.zone === 'leader') return `${battle.teams[target.team].label}（共有HP）`;
        if (target.zone === 'field') return `${battle.teams[target.team].label}の共有フィールド「${target.card.name}」`;
        if (target.actor && target.card) return `${target.actor.name}の「${target.card.name}」`;
        if (target.actor) return target.actor.name;
        return target.card ? target.card.name : '不明な対象';
    }

    function defenseTargetStats(target) {
        const battle = state();
        if (!target) return '';
        if (target.zone === 'leader') {
            const team = battle.teams[target.team];
            return `♥ 共有HP ${Math.max(0, team.hp)} / ${team.maxHp}`;
        }
        if (!target.card) return '';
        if (target.zone === 'field' || target.zone === 'person') return `♥ ${Math.max(0, target.card.hp)} / ${Math.max(0, target.card.maxHp)}`;
        return `⚔ ${Math.max(0, Number(target.card.damage) || 0)}　♥ ${Math.max(0, target.card.hp)} / ${Math.max(0, target.card.maxHp)}`;
    }

    function renderNetworkDefenseOverlay() {
        const battle = state();
        const request = battle && battle.networkDefense;
        if (!battle || !request || request.actorId !== localActorId()) return;
        const root = document.getElementById('tcg-tag-battle-ui');
        if (!root || document.getElementById('ctgb-defense')) return;
        const guardButtons = (request.options || []).map((option, index) => option.type === 'guard'
            ? `<button class="ctgb-defense-choice" onclick="window.resolveCasinoTagDefense(${index})"><strong>🛡 ${esc(option.name)}</strong><span>${guardCost()}M</span><small>⚔ ${option.damage || 0}　♥ ${option.hp || 0} / ${option.maxHp || 0}</small></button>` : '').join('');
        const skillButtons = (request.options || []).map((option, index) => option.type === 'skill'
            ? `<button class="ctgb-defense-choice" onclick="window.resolveCasinoTagDefense(${index})"><strong>👤 ${esc(option.name)}</strong><span>${option.cost || 0}M</span><small>${esc(option.desc || '人物カードの割り込み効果')}</small></button>` : '').join('');
        const overlay = document.createElement('div'); overlay.className = 'ctgb-overlay'; overlay.id = 'ctgb-defense';
        overlay.innerHTML = `<div class="ctgb-panel"><h3>相手の攻撃に割り込みますか？</h3><div class="ctgb-defense-flow"><div class="ctgb-defense-unit is-attacker"><small>攻撃カード</small><strong>${esc(request.attackerName)}「${esc(request.attackerCardName)}」</strong><span>⚔ ${request.attackerDamage || 0}</span></div><div class="ctgb-defense-arrow">➜</div><div class="ctgb-defense-unit is-target"><small>現在の攻撃対象</small><strong>${esc(request.targetName)}</strong><span>${esc(request.targetStats || '')}</span></div></div>${guardButtons ? `<h4>守護に出すモンスターを選択</h4><div class="ctgb-defense-choices">${guardButtons}</div>` : ''}${skillButtons ? `<h4>人物カードで割り込む</h4><div class="ctgb-defense-choices">${skillButtons}</div>` : ''}<button class="ctgb-defense-skip" onclick="window.resolveCasinoTagDefense(-1)">何もしない</button></div>`;
        root.appendChild(overlay);
    }

    function askHumanDefense(unit, attackerUnit, attackerCard, originalTarget) {
        const battle = state();
        const options = playerDefenseOptions(unit);
        if (!options.length) return Promise.resolve(null);
        return new Promise(resolve => {
            battle._defenseResolve = resolve;
            battle._defenseActorId = unit.id;
            battle._defenseContext = { attackerUnit, attackerCard, originalTarget };
            if (battle.networkMode) {
                battle._defenseOptions = options;
                battle.networkDefense = {
                    actorId: unit.id,
                    attackerName: attackerUnit.name,
                    attackerCardName: attackerCard.name,
                    attackerDamage: Math.max(0, Number(attackerCard.damage) || 0),
                    targetName: defenseTargetName(originalTarget),
                    targetStats: defenseTargetStats(originalTarget),
                    options: options.map(option => option.type === 'guard'
                        ? { type: 'guard', name: option.card.name, damage: option.card.damage, hp: option.card.hp, maxHp: option.card.maxHp }
                        : { type: 'skill', name: option.skill.name, cost: Number(option.skill.cost) || 0, desc: option.skill.desc || '' })
                };
                window.renderCasinoTCGTagBattle();
                if (typeof window.onCasinoTCGNetworkDefenseRequested === 'function') window.onCasinoTCGNetworkDefenseRequested(unit, battle);
                return;
            }
            const root = document.getElementById('tcg-tag-battle-ui');
            if (!root) {
                battle._defenseResolve = null; battle._defenseContext = null;
                resolve(null); return;
            }
            const guardButtons = options.map((option, index) => option.type === 'guard'
                ? `<button class="ctgb-defense-choice" onclick="window.resolveCasinoTagDefense(${index})"><strong>🛡 ${esc(option.card.name)}</strong><span>${guardCost()}M</span><small>⚔ ${Math.max(0, Number(option.card.damage) || 0)}　♥ ${Math.max(0, option.card.hp)} / ${Math.max(0, option.card.maxHp)}</small></button>`
                : '').join('');
            const skillButtons = options.map((option, index) => option.type === 'skill'
                ? `<button class="ctgb-defense-choice" onclick="window.resolveCasinoTagDefense(${index})"><strong>👤 ${esc(option.skill.name)}</strong><span>${Number(option.skill.cost) || 0}M</span><small>${esc(option.skill.desc || '人物カードの割り込み効果')}</small></button>`
                : '').join('');
            battle._defenseOptions = options;
            const overlay = document.createElement('div'); overlay.className = 'ctgb-overlay'; overlay.id = 'ctgb-defense';
            overlay.innerHTML = `<div class="ctgb-panel"><h3>相手の攻撃に割り込みますか？</h3><div class="ctgb-defense-flow"><div class="ctgb-defense-unit is-attacker"><small>攻撃カード</small><strong>${esc(attackerUnit.name)}「${esc(attackerCard.name)}」</strong><span>⚔ ${Math.max(0, Number(attackerCard.damage) || 0)}　♥ ${Math.max(0, attackerCard.hp)} / ${Math.max(0, attackerCard.maxHp)}</span></div><div class="ctgb-defense-arrow">➜</div><div class="ctgb-defense-unit is-target"><small>現在の攻撃対象</small><strong>${esc(defenseTargetName(originalTarget))}</strong><span>${esc(defenseTargetStats(originalTarget))}</span></div></div><p>守護を選ぶと、この攻撃の向きとダメージ対象が選んだカードへ変わります。</p>${guardButtons ? `<h4>守護に出すモンスターを選択</h4><div class="ctgb-defense-choices">${guardButtons}</div>` : ''}${skillButtons ? `<h4>人物カードで割り込む</h4><div class="ctgb-defense-choices">${skillButtons}</div>` : ''}<button class="ctgb-defense-skip" onclick="window.resolveCasinoTagDefense(-1)">何もしない</button></div>`;
            root.appendChild(overlay);
        });
    }

    window.resolveCasinoTagDefense = async function (index) {
        if (forwardNetworkIntent('defense', { index: Number(index) })) return;
        const battle = state();
        if (!battle || !battle._defenseResolve) return;
        const resolve = battle._defenseResolve;
        const options = battle._defenseOptions || [];
        const context = battle._defenseContext;
        const unit = battle.actors[battle._defenseActorId || actionActorId()];
        battle._defenseResolve = null; battle._defenseOptions = null; battle._defenseContext = null; battle._defenseActorId = null;
        battle.networkDefense = null;
        const overlay = document.getElementById('ctgb-defense'); if (overlay) overlay.remove();
        const choice = options[Number(index)];
        const resumeNetworkTimer = () => {
            const current = currentActor();
            if (battle.networkMode && current && current.isHuman && typeof window.onCasinoTCGNetworkDefenseResolved === 'function') {
                window.onCasinoTCGNetworkDefenseResolved(current, battle);
            }
        };
        if (choice && choice.type === 'guard') {
            unit.currentMana -= guardCost(); choice.card.isDefending = true;
            window.renderCasinoTCGTagBattle();
            toast(`${choice.card.name}を守護化！`, 600);
            await wait(180);
            resumeNetworkTimer();
            resolve({ guarded: true, guardTarget: { actor: unit, card: choice.card, zone: 'card', team: unit.team } });
            return;
        }
        if (choice && choice.type === 'skill') {
            await executePersonSkill(unit, choice.index, null, { intercept: true, attacker: context.attackerCard });
            resumeNetworkTimer();
            resolve({ skill: true }); return;
        }
        resumeNetworkTimer();
        resolve(null);
    };

    async function resolveDefenseIntercept(attackerUnit, attackerCard, originalTarget) {
        const battle = state();
        const defendingTeam = attackerUnit.team === 'player' ? 'enemy' : 'player';
        let redirectTarget = null;
        for (const defender of teamActors(defendingTeam)) {
            if (defender.isHuman && !(defender.id === 'player' && battle.autoPlayer && !battle.networkMode)) {
                const response = await askHumanDefense(defender, attackerUnit, attackerCard, originalTarget);
                if (response && response.guardTarget) redirectTarget = response.guardTarget;
            } else {
                if (!defender.personSkillUsed) await attemptCpuPersonSkill(defender, true, attackerCard);
                if (!redirectTarget && Math.random() < 0.58) redirectTarget = await cpuGuard(defender);
            }
            if (battle.isEnded) return originalTarget;
            if (redirectTarget) break;
        }
        if (redirectTarget) {
            const legal = legalAttackTargets(attackerUnit, attackerCard);
            const selectedGuard = legal.find(entry => selectableKey(entry) === selectableKey(redirectTarget));
            if (selectedGuard) {
                toast(`${defenseTargetName(selectedGuard)}が攻撃を引き受けた！`, 720);
                await wait(220);
                return selectedGuard;
            }
        }
        return targetForNewGuard(attackerUnit, attackerCard, originalTarget);
    }

    function playTargets(unit, card) {
        if (card.evolvesFrom) {
            return evolutionCandidates(unit, card).map(entry => ({ actor: unit, card: entry.base, zone: 'evolution', team: unit.team }));
        }
        const allyCards = allTeamCards(unit.team, false);
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        if (['item_hp_up', 'item_heal_cleanse', 'item_taunt', 'action_atk_up'].includes(card.ability)) return allyCards;
        if (['dimension_hack', 'discard_hand'].includes(card.ability)) return teamActors(enemyTeam).map(targetActor => ({ actor: targetActor, card: null, zone: 'actor' }));
        if (card.ability === 'action_heal_all') return [];
        return [];
    }

    function supportExpansionContext(unit, card, choices) {
        return {
            battle: state(), unit, card, choices,
            allTeamCards, teamActors,
            helpers: {
                allTeamCards, teamActors, enemyActors, ownerOf, destroyCard, dealCardDamage,
                damageTeam, healTeam, healCard, clearStatus, moveCardToDeck, removeFromZones,
                cleanDeadCards, actualCost, isMonster, boardLimit: BOARD_LIMIT
            }
        };
    }

    window.playCasinoTagCard = async function (handIndex, suppliedExpansionChoices) {
        const battle = state();
        const unit = battle && actionActor();
        if (!unit || !playerCanAct()) return;
        const card = unit.hand[Number(handIndex)];
        if (!card) return;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && supportExpansion.isExpansionCard(card)) {
            const choices = suppliedExpansionChoices || await supportExpansion.prepareTagChoices(supportExpansionContext(unit, card, null));
            if (!choices) { toast(`${card.name}を使える対象がいません。`, 900); return; }
            if (forwardNetworkIntent('play_card', { handIndex: Number(handIndex), expansionChoices: choices })) return;
            if (!unit.hand.includes(card) || !playerCanAct()) return;
            battle.isAnimating = true;
            playCard(unit, Number(handIndex), { expansionChoices: choices }).then(() => {
                if (!battle.isEnded) { battle.isAnimating = false; window.renderCasinoTCGTagBattle(); }
            });
            return;
        }
        if (forwardNetworkIntent('play_card', { handIndex: Number(handIndex) })) return;
        const targets = playTargets(unit, card);
        if (card.evolvesFrom && !targets.length) {
            toast(`進化元（${card.evolvesFrom}）が場にいないため、このカードは出せません。`, 1000);
            return;
        }
        if (['item_hp_up', 'item_heal_cleanse', 'item_taunt', 'action_atk_up'].includes(card.ability) && !targets.length) {
            toast('対象にできる味方モンスターがいません。', 800); return;
        }
        if (targets.length && (!card.evolvesFrom || targets.length > 1)) {
            battle.pendingPlay = { unit, handIndex: Number(handIndex) };
            battle.pendingTarget = targets;
            window.renderCasinoTCGTagBattle();
            if (card.evolvesFrom) toast('進化させるモンスターを選んでください。', 900);
            return;
        }
        battle.isAnimating = true;
        playCard(unit, Number(handIndex), card.evolvesFrom ? targets[0] : null).then(() => {
            if (!battle.isEnded) { battle.isAnimating = false; window.renderCasinoTCGTagBattle(); }
        });
    };

    function fieldManaCap() {
        const battle = state();
        return battle && [battle.teams.player.field, battle.teams.enemy.field].some(card => card && card.ability === 'field_mana') ? 12 : BASE_MANA_CAP;
    }

    function refundMana(unit, card, amount) {
        if (card && card.ability === 'mana_refund') {
            unit.currentMana = Math.min(fieldManaCap(), unit.currentMana + Math.max(1, Math.floor((Number(amount) || Number(card.cost) || 0) / 2)));
        }
    }

    async function playCard(unit, handIndex, target) {
        const battle = state();
        if (!battle || battle.isEnded) return false;
        const card = unit.hand[handIndex];
        if (!card) return false;
        const cost = actualCost(unit, card);
        if (unit.currentMana < cost) return false;
        if (card.type === 'action' && unit.actionUsed) return false;
        let evolutionIndex = -1;
        if (isMonster(card) && card.evolvesFrom) {
            const candidates = evolutionCandidates(unit, card);
            if (!candidates.length) return false;
            if (target && target.card) {
                const selected = candidates.find(entry => entry.base === target.card);
                if (!selected) return false;
                evolutionIndex = selected.index;
            } else {
                if (unit.isHuman && candidates.length > 1) return false;
                evolutionIndex = candidates[0].index;
            }
        } else if (isMonster(card) && unit.field.length >= BOARD_LIMIT) return false;
        await showTagCardPlay(unit, card);
        unit.currentMana -= cost;
        unit.hand.splice(handIndex, 1);
        if (card.type === 'action') unit.actionUsed = true;
        if (card.type === 'person') {
            if (unit.person) await destroyCard(unit.person, unit, 'replace');
            card.isDead = false; card.canAttack = false; unit.person = card; unit.personSkillUsed = false;
        } else if (card.type === 'field') {
            const team = teamOf(unit);
            const manaWasActive = Object.values(battle.teams).some(entry => entry.field && entry.field.ability === 'field_mana');
            if (team.field) await destroyCard(team.field, unit, 'replace');
            card.isDead = false; team.field = card;
            const manaIsActive = Object.values(battle.teams).some(entry => entry.field && entry.field.ability === 'field_mana');
            if (!manaWasActive && manaIsActive) {
                Object.values(battle.actors).forEach(entry => {
                    entry.maxMana = Math.min(12, entry.maxMana + 2);
                    entry.currentMana = Math.min(12, entry.currentMana + 2);
                });
            } else if (manaWasActive && !manaIsActive) {
                Object.values(battle.actors).forEach(entry => {
                    entry.maxMana = Math.max(0, entry.maxMana - 2);
                    entry.currentMana = Math.min(entry.currentMana, entry.maxMana);
                });
            }
        } else if (card.type === 'action' || card.type === 'item') {
            await activatePlayEffect(card, unit, target);
            const originalOwner = ownerOf(card) || unit;
            card.isDead = true;
            originalOwner.graveyard.push(card);
            const supportExpansion = window.TCG_SUPPORT_EXPANSION;
            if (card._supportBanishAfterUse) { delete card._supportBanishAfterUse; card._supportBanishOnGrave = true; }
            if (supportExpansion && typeof supportExpansion.onTagCardDestroyed === 'function') supportExpansion.onTagCardDestroyed(card, originalOwner, 'support_used');
            refundMana(unit, card, cost);
        } else {
            if (evolutionIndex >= 0) {
                const base = unit.field[evolutionIndex];
                await destroyCard(base, unit, 'evolve');
                card.canAttack = !!(base && base.canAttack) || card.ability === 'haste';
                card.hp = card.maxHp;
                unit.field.splice(Math.min(evolutionIndex, unit.field.length), 0, card);
            } else {
                card.canAttack = card.ability === 'haste';
                unit.field.push(card);
            }
            const sharedField = teamOf(unit).field;
            if (sharedField && sharedField.ability === 'field_forest' && ['spirit', 'seed', 'beetle'].includes(String(card.type || '').split('_')[0])) {
                card.maxHp += 20; card.hp += 20;
            }
            await activatePlayEffect(card, unit, target);
        }
        if (unit._supportStrategyTax && (isMonster(card) ? 'monster' : card.type) === unit._supportStrategyTax.type) delete unit._supportStrategyTax;
        delete card._supportFreeOnce; delete card._supportBounceTax; delete card._supportRunDiscount;
        toast(`${unit.name}が「${card.name}」を使用！`, 700);
        await dialogue(unit, 'play', { card: card.name }, 2);
        await cleanDeadCards(unit);
        checkBattleEnd('カード効果');
        await wait(220);
        return true;
    }

    async function damageEnemyCards(unit, amount) {
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        const targets = allTeamCards(enemyTeam, false).slice();
        for (const entry of targets) await dealCardDamage(entry.card, amount, unit, { noEvasion: true });
    }

    async function activatePlayEffect(card, unit, target) {
        const battle = state();
        const ownTeam = unit.team;
        const enemyTeam = ownTeam === 'player' ? 'enemy' : 'player';
        const ability = card.ability;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && supportExpansion.isExpansionCard(card)) {
            const context = supportExpansionContext(unit, card, target && target.expansionChoices);
            if (!context.choices && typeof supportExpansion.autoTagChoices === 'function') context.choices = supportExpansion.autoTagChoices(context);
            await supportExpansion.resolveTagEffect(context);
        }
        else if (ability === 'draw_card') drawCard(unit, { count: 1 });
        else if (ability === 'heal_self') healTeam(ownTeam, 10);
        else if (ability === 'mana_ramp') {
            unit.maxMana = Math.min(fieldManaCap(), unit.maxMana + 1); unit.currentMana = Math.min(fieldManaCap(), unit.currentMana + 1);
        } else if (ability === 'item_hp_up' && target && target.card) {
            target.card.maxHp += 20; target.card.hp += 20;
        } else if (ability === 'item_taunt' && target && target.card) { target.card.isDefending = true; target.card.hasPermanentTaunt = true; }
        else if (ability === 'item_heal_cleanse' && target && target.card) { target.card.hp = Math.max(target.card.hp, target.card.maxHp); clearStatus(target.card); }
        else if (ability === 'item_draw') drawCard(unit, { count: 1 });
        else if (ability === 'item_mana_boost') unit.currentMana = Math.min(fieldManaCap(), unit.currentMana + 2);
        else if (ability === 'action_draw_3') drawCard(unit, { count: 3 });
        else if (ability === 'action_atk_up' && target && target.card) target.card.damage += 40;
        else if (ability === 'action_search_evo') {
            const index = unit.deck.findIndex(entry => entry.evolvesFrom);
            if (index >= 0) unit.hand.push(unit.deck.splice(index, 1)[0]);
        } else if (ability === 'action_heal_face') healTeam(ownTeam, 100);
        else if (ability === 'action_heal_all') { healTeam(ownTeam, 100); allTeamCards(ownTeam, false).forEach(entry => { entry.card.hp = Math.max(entry.card.hp, entry.card.maxHp); }); }
        else if (ability === 'aoe_heal_play') allTeamCards(ownTeam, false).forEach(entry => healCard(entry.card, 20));
        else if (ability === 'snipe_play') {
            const picked = randomChoice(allTeamCards(enemyTeam, false));
            if (picked) await dealCardDamage(picked.card, 30, unit, { noEvasion: true }); else damageTeam(enemyTeam, 30);
        } else if (ability === 'roar') await damageEnemyCards(unit, 20);
        else if (ability === 'wind_blessing') allTeamCards(ownTeam, false).filter(entry => entry.card !== card).forEach(entry => { entry.card.damage += 10; });
        else if (ability === 'crimson_end') { damageTeam(enemyTeam, 50); await damageEnemyCards(unit, 50); }
        else if (ability === 'perfect_predation') {
            const picked = randomChoice(allTeamCards(enemyTeam, false));
            if (picked) { const heal = Number(picked.card.hp) || 0; await destroyCard(picked.card, unit, 'predation'); healTeam(ownTeam, heal); }
        } else if (ability === 'nightmare_rule') {
            for (const entry of allTeamCards(enemyTeam, false).slice()) {
                entry.card.hp = Math.max(1, Math.floor(entry.card.hp / 2));
            }
        } else if (ability === 'star_hope') {
            allTeamCards(ownTeam, false).forEach(entry => { entry.card.hp = entry.card.maxHp; entry.card.isDefending = true; entry.card.hasPermanentTaunt = true; });
        } else if (ability === 'heaven_punishment') await damageEnemyCards(unit, 50);
        else if (ability === 'truth_overwrite') {
            drawCard(unit, { count: 3 }); unit.maxMana = Math.min(fieldManaCap(), unit.maxMana + 3); unit.currentMana = Math.min(fieldManaCap(), unit.currentMana + 3);
        } else if (ability === 'super_gravity') {
            const targets = allTeamCards('player', false).concat(allTeamCards('enemy', false)).filter(entry => entry.card !== card);
            for (const entry of targets) await dealCardDamage(entry.card, 100, unit, { noEvasion: true });
        } else if (ability === 'charm_enemy') {
            const picked = randomChoice(allTeamCards(enemyTeam, false));
            if (picked && !picked.card._advancedStatusImmune && picked.card.ability !== 'pure_aegis' && Math.random() < 0.6) picked.card.status = 'charmed';
        } else if (ability === 'mass_charm') {
            allTeamCards(enemyTeam, false).forEach(entry => { if (!entry.card._advancedStatusImmune && entry.card.ability !== 'pure_aegis' && Math.random() < 0.5) entry.card.status = 'charmed'; });
        } else if (ability === 'fossilize') {
            const picked = randomChoice(allTeamCards(enemyTeam, false));
            if (picked && !picked.card._advancedStatusImmune && picked.card.ability !== 'pure_aegis') picked.card.status = 'fossilized';
        } else if (ability === 'doomsday_detonation') {
            const sacrifices = livingCards(unit).slice();
            for (const sacrifice of sacrifices) await destroyCard(sacrifice, unit, 'doomsday');
            const targets = allTeamCards(enemyTeam, false).slice();
            for (const entry of targets) await dealCardDamage(entry.card, 200, unit, { noEvasion: true });
        } else if (ability === 'time_manipulation') {
            allTeamCards(ownTeam, false).forEach(entry => { entry.card.canAttack = true; entry.card._tagAttacksThisTurn = 0; });
        } else if (ability === 'discard_hand') {
            const victim = target && target.zone === 'actor' ? target.actor : randomChoice(enemyActors(unit).filter(entry => entry.hand.length));
            if (victim) {
                const discarded = victim.hand.splice(Math.floor(Math.random() * victim.hand.length), 1)[0];
                if (discarded) victim.graveyard.push(discarded);
            }
        } else if (ability === 'dimension_hack') {
            const victim = target && target.zone === 'actor' ? target.actor : randomChoice(enemyActors(unit));
            if (victim) {
                for (let i = 0; i < 2 && victim.hand.length; i++) {
                    const discarded = victim.hand.splice(Math.floor(Math.random() * victim.hand.length), 1)[0];
                    if (discarded) victim.graveyard.push(discarded);
                }
            }
            drawCard(unit, { count: 2 });
        } else if (ability === 'mana_refund') {
            unit.currentMana = Math.min(unit.maxMana, unit.currentMana + Math.max(1, Math.ceil((Number(card.skillCost) || 0) / 2)));
        } else if (ability === 'action_zero_cost' || ability === 'all_zero_cost') unit._allZeroCost = true;
        else if (ability === 'burst_spores') { /* death trigger */ }
        else if (ability === 'star_breath') { /* start trigger */ }
        else if (ability === 'divine_grace') { /* end trigger */ }
        else if (ability === 'event_horizon') { /* end trigger */ }
        else if (ability === 'raise_dead') { /* end trigger */ }
    }

    function skillData(unit, index) {
        if (!unit || !unit.person) return null;
        const master = window.TCG_MASTER && window.TCG_MASTER[unit.person.masterId];
        const skills = master && (master.personSkills || master.skills) || [];
        return skills[Number(index)] || null;
    }

    function skillTargetSide(skill) {
        if (!skill) return '';
        if (skill.target === 'ally' || /味方1体|味方モンスター/.test(skill.desc || '')) return 'ally';
        if (skill.target === 'enemy' || /敵1体|敵モンスター1体/.test(skill.desc || '')) return 'enemy';
        return '';
    }

    window.openCasinoTagPersonSkill = function (index) {
        if (forwardNetworkIntent('person_skill', { index: Number(index) })) return;
        const battle = state();
        const unit = battle && actionActor();
        const skill = skillData(unit, index);
        if (!unit || !skill || !playerCanAct() || unit.personSkillUsed || unit.currentMana < Number(skill.cost || 0)) return;
        const side = skillTargetSide(skill);
        if (side) {
            const teamId = side === 'ally' ? unit.team : (unit.team === 'player' ? 'enemy' : 'player');
            const targets = allTeamCards(teamId, false);
            if (!targets.length) { toast('対象にできるモンスターがいません。', 800); return; }
            battle.pendingPersonSkill = { unit, index: Number(index) };
            battle.pendingTarget = targets;
            window.renderCasinoTCGTagBattle();
            return;
        }
        battle.isAnimating = true;
        executePersonSkill(unit, Number(index), null).then(() => {
            if (!battle.isEnded) { battle.isAnimating = false; window.renderCasinoTCGTagBattle(); }
        });
    };

    function preferredSkillTarget(unit, skill, interceptAttacker) {
        const side = skillTargetSide(skill);
        if (side === 'enemy') {
            if (interceptAttacker) {
                const owner = ownerOf(interceptAttacker);
                if (owner) return { actor: owner, card: interceptAttacker, zone: 'card' };
            }
            return allTeamCards(unit.team === 'player' ? 'enemy' : 'player', false).sort((a, b) => b.card.damage - a.card.damage)[0] || null;
        }
        if (side === 'ally') return allTeamCards(unit.team, false).sort((a, b) => (a.card.hp / Math.max(1, a.card.maxHp)) - (b.card.hp / Math.max(1, b.card.maxHp)))[0] || null;
        return null;
    }

    async function executePersonSkill(unit, index, target, options) {
        options = options || {};
        const battle = state();
        const skill = skillData(unit, index);
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (!battle || !skill || !unit.person || unit.personSkillUsed || unit.currentMana < Number(skill.cost || 0)) return false;
        if (supportExpansion && typeof supportExpansion.canUseTagPersonSkill === 'function' && !supportExpansion.canUseTagPersonSkill(unit, index)) {
            toast('王冠では同じ人物スキルを2回使えません。', 850);
            return false;
        }
        if (!target) target = preferredSkillTarget(unit, skill, options.attacker);
        const side = skillTargetSide(skill);
        if (side && (!target || !target.card)) return false;
        await showTagCardPlay(unit, unit.person, `PERSON SKILL：${skill.name}`);
        if (state() !== battle || battle.isEnded || !unit.person) return false;
        unit.currentMana -= Number(skill.cost) || 0;
        unit.personSkillUsed = true;
        const person = unit.person;
        const id = person.masterId;
        const ownTeam = unit.team;
        const enemyTeam = ownTeam === 'player' ? 'enemy' : 'player';
        const card = target && target.card;
        toast(`${unit.name}：人物スキル「${skill.name}」！`, 750);
        await dialogue(unit, 'person_skill', { skill: skill.name, card: person.name }, options.intercept ? 10 : 4);

        if (id === 'person_farmer') {
            if (index === 0) healCard(card, 15);
            else { drawCard(unit, { count: 1 }); unit.maxMana = Math.min(fieldManaCap(), unit.maxMana + 1); }
        } else if (id === 'person_fisherman') {
            if (index === 0) await dealCardDamage(card, 10, unit, { noEvasion: true });
            else moveCardToDeck(card);
        } else if (id === 'person_builder') {
            if (index === 0) { card.isDefending = true; card._builder_guarded = true; }
            else if (teamOf(unit).field) healCard(teamOf(unit).field, 50); else healTeam(ownTeam, 40);
        } else if (id === 'person_chef') {
            if (index === 0) card.damage += 10;
            else { card.canAttack = true; card.hp = card.maxHp; card._tagAttacksThisTurn = 0; }
        } else if (id === 'person_smith') {
            if (index === 0) card._smith_buffed = true; else card._smith_trample = true;
        } else if (id === 'person_adventurer') {
            if (index === 0) drawCard(unit, { count: 1 });
            else {
                const found = unit.deck.findIndex(entry => entry.evolvesFrom);
                if (found >= 0) unit.hand.push(unit.deck.splice(found, 1)[0]);
            }
        } else if (id === 'person_king') {
            if (index === 0) allTeamCards(ownTeam, false).forEach(entry => { entry.card.damage += 10; });
            else {
                const doomed = allTeamCards(enemyTeam, false).filter(entry => entry.card.hp <= 40).slice();
                for (const entry of doomed) await destroyCard(entry.card, unit, 'judgement');
            }
        } else if (id === 'person_captain') {
            if (index === 0) battle.teams[ownTeam].captainGuard = true;
            else allTeamCards(ownTeam, false).forEach(entry => { entry.card._captain_double = true; });
        } else if (id === 'person_soldier') {
            await dealCardDamage(card, index === 0 ? 10 : 40, unit, { noEvasion: true });
            if (index === 1 && unit.person) await dealCardDamage(unit.person, 20, unit, { noEvasion: true });
        } else if (id === 'person_pharmacist') {
            if (index === 0) { healCard(card, 30); clearStatus(card); }
            else { card.hp = card.maxHp; clearStatus(card); card._advancedStatusImmune = true; }
        } else if (id === 'person_pastry_chef') {
            if (index === 0) card.damage += 25;
            else allTeamCards(ownTeam, false).forEach(entry => { entry.card.damage += 20; });
        } else if (id === 'person_hairdresser') {
            card.damage = Math.max(0, card.damage - (index === 0 ? 20 : 10));
            if (index === 1 && !card._advancedStatusImmune) card.status = 'charmed';
        } else if (id === 'person_tailor') {
            if (index === 0) { clearStatus(card); card._advancedStatusImmune = true; }
            else allTeamCards(ownTeam, false).forEach(entry => { entry.card.maxHp += 20; entry.card.hp += 20; });
        } else if (id === 'person_concierge') {
            if (index === 0) allTeamCards(ownTeam, false).forEach(entry => { healCard(entry.card, 30); clearStatus(entry.card); });
            else card._advancedNextDamageMultiplier = 2;
        } else if (id === 'person_dealer') {
            if (index === 0) {
                drawCard(unit, { count: 2 });
                if (unit.hand.length) { const discarded = unit.hand.splice(Math.floor(Math.random() * unit.hand.length), 1)[0]; if (discarded) unit.graveyard.push(discarded); }
            } else if (Math.random() < 0.5) await dealCardDamage(card, 100, unit, { noEvasion: true });
            else if (unit.person) await dealCardDamage(unit.person, 20, unit, { noEvasion: true });
        } else if (id === 'person_salesperson') {
            if (index === 0) {
                const count = Math.min(2, unit.hand.length, unit.deck.length);
                for (let i = 0; i < count; i++) { const discarded = unit.hand.pop(); if (discarded) unit.graveyard.push(discarded); }
                drawCard(unit, { count });
            } else moveCardToHand(card);
        } else if (id === 'person_scientist') {
            if (index === 0) { card.canAttack = true; card._advancedOverclock = true; card._tagAttacksThisTurn = 0; }
            else if (card) {
                const hadBuff = card._advancedNextDamageMultiplier || card._smith_buffed || card._smith_trample || card._captain_double || card.isDefending;
                delete card._advancedNextDamageMultiplier; delete card._smith_buffed; delete card._smith_trample; delete card._captain_double; card.isDefending = false;
                if (!hadBuff) {
                    const victim = ownerOf(card);
                    if (victim && victim.hand.length) { const discarded = victim.hand.splice(Math.floor(Math.random() * victim.hand.length), 1)[0]; victim.graveyard.push(discarded); }
                }
            }
        } else if (id === 'person_fortune_teller') {
            if (index === 0) {
                const top = shuffle(unit.deck.splice(0, Math.min(3, unit.deck.length))); unit.deck.unshift(...top); drawCard(unit, { count: 1 });
            } else {
                allTeamCards(ownTeam, true).forEach(entry => { entry.card._advancedDamageShield = true; });
            }
        }
        await cleanDeadCards(unit);
        checkBattleEnd('人物スキル');
        if (supportExpansion && typeof supportExpansion.afterTagPersonSkill === 'function') supportExpansion.afterTagPersonSkill(unit, index);
        await wait(220);
        return true;
    }

    async function attemptCpuPersonSkill(unit, intercept, attackerCard) {
        if (!unit || !unit.person || unit.personSkillUsed) return false;
        const master = window.TCG_MASTER && window.TCG_MASTER[unit.person.masterId];
        const skills = master && (master.personSkills || master.skills) || [];
        const affordable = skills.map((skill, index) => ({ skill, index })).filter(entry => unit.currentMana >= Number(entry.skill.cost || 0));
        if (!affordable.length) return false;
        const preference = unit.strategy.personSkill || {};
        const chance = clamp(Number(intercept ? preference.interrupt : preference.main) || (intercept ? 38 : 70), 0, 100) / 100;
        if (Math.random() > chance) return false;
        const chosen = affordable.sort((a, b) => Number(b.skill.cost || 0) - Number(a.skill.cost || 0))[0];
        const target = preferredSkillTarget(unit, chosen.skill, attackerCard);
        if (skillTargetSide(chosen.skill) && !target) return false;
        return executePersonSkill(unit, chosen.index, target, { intercept, attacker: attackerCard });
    }

    function reviveOwnerCard(unit, fullHealth) {
        const index = [...unit.graveyard].reverse().findIndex(card => card && isMonster(card));
        if (index < 0 || unit.field.length >= BOARD_LIMIT) return null;
        const actualIndex = unit.graveyard.length - 1 - index;
        const card = unit.graveyard.splice(actualIndex, 1)[0];
        card.isDead = false; card.status = null; card.canAttack = false;
        card.hp = fullHealth ? card.maxHp : Math.max(1, Math.ceil(card.maxHp / 2));
        unit.field.push(card);
        return card;
    }

    async function teamFieldTiming(teamId, timing, activeUnit) {
        const battle = state();
        const field = battle.teams[teamId].field;
        if (!field) return;
        const ability = field.ability;
        if (timing === 'start' && ability === 'field_casino') {
            if (Math.random() < 0.5) drawCard(activeUnit, { count: 1 });
            else damageTeam(teamId, 10);
        }
        if (timing === 'end' && ability === 'field_miasma') {
            damageTeam('player', 10); damageTeam('enemy', 10);
            const cards = allTeamCards('player', false).concat(allTeamCards('enemy', false)).slice();
            for (const entry of cards) await dealCardDamage(entry.card, 10, activeUnit, { noEvasion: true });
        }
    }

    async function startCardEffects(unit) {
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        for (const card of livingCards(unit).slice()) {
            if (card.ability === 'start_draw') drawCard(unit, { count: 1 });
            else if (card.ability === 'star_breath') {
                unit.maxMana = Math.min(fieldManaCap(), unit.maxMana + 2);
                unit.currentMana = Math.min(fieldManaCap(), unit.currentMana + 2);
                healTeam(unit.team, 30);
            } else if (card.ability === 'heaven_judgement') {
                damageTeam(enemyTeam, 20); await damageEnemyCards(unit, 20);
            } else if (card.ability === 'infinite_gear') {
                drawCard(unit, { count: Math.max(0, 5 - unit.hand.length) });
            }
            await cleanDeadCards(unit);
            if (checkBattleEnd(`${card.name}の開始時効果`)) return;
        }
    }

    async function endCardEffects(unit) {
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        for (const card of livingCards(unit).slice()) {
            if (card.ability === 'end_heal') healCard(card, 20);
            else if (card.ability === 'regeneration') card.hp = card.maxHp;
            else if (card.ability === 'haunt') damageTeam(enemyTeam, 20);
            else if (card.ability === 'burn_field') {
                damageTeam(enemyTeam, 10);
                for (const entry of allTeamCards(enemyTeam, false).slice()) await dealCardDamage(entry.card, 10, unit, { noEvasion: true });
            } else if (card.ability === 'cataclysm') {
                damageTeam(enemyTeam, 20);
                for (const entry of allTeamCards(enemyTeam, false).slice()) await dealCardDamage(entry.card, 20, unit, { noEvasion: true });
            } else if (card.ability === 'absolute_sanctuary') {
                allTeamCards(unit.team, false).forEach(entry => healCard(entry.card, 20));
            } else if (card.ability === 'cyber_miracle') {
                allTeamCards(unit.team, false).forEach(entry => { entry.card.hp = entry.card.maxHp; });
            } else if (card.ability === 'divine_grace') reviveOwnerCard(unit, true);
            else if (card.ability === 'raise_dead') reviveOwnerCard(unit, false);
            else if (card.ability === 'event_horizon') {
                const picked = randomChoice(allTeamCards(enemyTeam, false)); if (picked) moveCardToDeck(picked.card);
            }
            await cleanDeadCards(unit);
            if (checkBattleEnd(`${card.name}の終了時効果`)) return;
        }
    }

    function cleanupAtTurnStart(unit) {
        unit.actionUsed = false; unit.personSkillUsed = false;
        unit._allZeroCost = false;
        livingCards(unit).forEach(card => {
            card.isDefending = card.ability === 'taunt' || card.ability === 'pure_aegis' || card.ability === 'support_wall_guard' || !!card.hasPermanentTaunt;
            delete card._builder_guarded; delete card._smith_buffed; delete card._smith_trample; delete card._captain_double;
            delete card._advancedStatusImmune; delete card._advancedDamageShield; delete card._advancedOverclock;
            card._tagAttacksThisTurn = 0;
            if (card.status === 'stunned' || card.status === 'fossilized') {
                card.canAttack = false; card._tagClearStatusAtEnd = true;
            } else card.canAttack = !['support_wall_guard', 'support_seed_wait'].includes(card.ability) && !card._supportEntangled && !card._supportRescuedDisabled;
        });
        state().teams[unit.team].captainGuard = false;
    }

    async function beginTurn() {
        const battle = state();
        if (!battle || battle.isEnded) return;
        if (battle.networkMode && !battle.isNetworkAuthority) return;
        const unit = currentActor();
        if (battle.networkMode && typeof window.onCasinoTCGNetworkTurnStarting === 'function') window.onCasinoTCGNetworkTurnStarting(unit, battle);
        battle.isAnimating = true;
        battle.selectedAttacker = null; battle.pendingTarget = null; battle.pendingPlay = null; battle.pendingPersonSkill = null;
        window.renderCasinoTCGTagBattle();
        await showTagTurnCutin(unit);
        if (state() !== battle || battle.isEnded) return;
        const isSupportExtraTurn = !!unit._supportStartingExtraTurn;
        delete unit._supportStartingExtraTurn;
        cleanupAtTurnStart(unit);
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.onTagTurnStart === 'function') {
            supportExpansion.onTagTurnStart(supportExpansionContext(unit, null, null));
        }
        const team = battle.teams[unit.team];
        if (!isSupportExtraTurn && team.turnsThisRound === 0) await teamFieldTiming(unit.team, 'start', unit);
        await cleanDeadCards(unit);
        if (checkBattleEnd('フィールド開始時効果')) return;
        if (isSupportExtraTurn) {
            unit.currentMana = 3;
        } else {
            unit.maxMana = Math.min(fieldManaCap(), unit.maxMana + 1);
            unit.currentMana = unit.maxMana;
            if (battle.turnNumber > 0) drawCard(unit, { normal: true, count: 1 });
        }
        if (battle.isEnded) return;
        await startCardEffects(unit);
        await cleanDeadCards(unit);
        if (checkBattleEnd('ターン開始効果')) return;
        unit.turnCount++;
        battle.isAnimating = false;
        window.renderCasinoTCGTagBattle();
        toast(`${unit.name}のターン`, 600);
        await dialogue(unit, 'turn_start', { mana: unit.currentMana }, 1);
        if (battle.networkMode && unit.isHuman && typeof window.onCasinoTCGNetworkTurnReady === 'function') {
            window.onCasinoTCGNetworkTurnReady(unit, battle);
        }
        if (!unit.isHuman || (!battle.networkMode && unit.id === 'player' && battle.autoPlayer)) runCpuTurn(unit);
    }

    async function advanceTurn() {
        const battle = state();
        if (!battle || battle.isEnded) return;
        const unit = currentActor();
        battle.isAnimating = true;
        await endCardEffects(unit);
        if (battle.isEnded || checkBattleEnd('カード終了時効果')) return;
        livingCards(unit).forEach(card => {
            if (card._tagClearStatusAtEnd) { card.status = null; delete card._tagClearStatusAtEnd; }
            delete card._builder_guarded; delete card._smith_buffed; delete card._smith_trample; delete card._captain_double;
        });
        battle.teams[unit.team].captainGuard = false;
        const team = battle.teams[unit.team];
        team.turnsThisRound++;
        if (team.turnsThisRound >= teamActors(unit.team).length) await teamFieldTiming(unit.team, 'end', unit);
        await cleanDeadCards(unit);
        if (checkBattleEnd('ターン終了効果')) return;
        const supportExpansion = window.TCG_SUPPORT_EXPANSION;
        if (supportExpansion && typeof supportExpansion.onTagTurnEnd === 'function') {
            supportExpansion.onTagTurnEnd(supportExpansionContext(unit, null, null));
        }
        if (supportExpansion && typeof supportExpansion.consumeTagExtraTurn === 'function' && supportExpansion.consumeTagExtraTurn(unit)) {
            battle.turnNumber++;
            unit._supportStartingExtraTurn = true;
            battle.mobileFocusActorId = null;
            window.renderCasinoTCGTagBattle();
            await wait(260);
            beginTurn();
            return;
        }
        battle.turnNumber++;
        battle.cursor = (battle.cursor + 1) % battle.order.length;
        if (battle.cursor === 0) {
            battle.round++;
            battle.teams.player.turnsThisRound = 0;
            battle.teams.enemy.turnsThisRound = 0;
        }
        battle.mobileFocusActorId = null;
        window.renderCasinoTCGTagBattle();
        await wait(260);
        beginTurn();
    }

    function cpuFieldValue(unit, card) {
        if (!card) return -Infinity;
        const ownTeam = teamOf(unit);
        const enemyTeam = state().teams[unit.team === 'player' ? 'enemy' : 'player'];
        const abilityWeights = { field_forest: 30, field_castle: 42, field_casino: 18, field_miasma: 28, field_mana: 38 };
        let value = (Number(card.hp) || Number(card.maxHp) || 0) / 5 + (abilityWeights[card.ability] || 12);
        if (card.ability === 'field_forest') value += allTeamCards(unit.team, false).filter(entry => ['spirit', 'seed', 'beetle'].includes(String(entry.card.type || '').split('_')[0])).length * 8;
        if (card.ability === 'field_castle') value += guardsFor(unit.team).length * 7;
        if (card.ability === 'field_miasma') value += ownTeam.hp > enemyTeam.hp ? 14 : -18;
        if (card.ability === 'field_mana') value += unit.maxMana < 7 ? 18 : -4;
        return value;
    }

    function cpuDefenseReserve(unit) {
        if (!unit.strategy || !unit.strategy.defense) return 0;
        const defense = unit.strategy && unit.strategy.defense || {};
        const hasGuardCandidate = livingCards(unit).some(card => card.status !== 'stunned' && card.status !== 'fossilized');
        const hasPersonReaction = !!(unit.person && !unit.personSkillUsed);
        if (!hasGuardCandidate && !hasPersonReaction) return 0;
        const personCosts = hasPersonReaction
            ? ((window.TCG_MASTER[unit.person.masterId] || {}).personSkills || []).map(skill => Number(skill.cost) || 0)
            : [];
        const cheapestReaction = Math.min(...[hasGuardCandidate ? guardCost() : Infinity].concat(personCosts.length ? personCosts : [Infinity]));
        if (!Number.isFinite(cheapestReaction)) return 0;
        return Math.min(unit.currentMana, Math.max(0, cheapestReaction + (Number(defense.reserveBonus) || 0)));
    }

    function cpuCanPlay(unit, card) {
        if (!card || unit.currentMana < actualCost(unit, card)) return false;
        const cost = actualCost(unit, card);
        if (teamOf(unit).hp > 100 && unit.currentMana - cost < cpuDefenseReserve(unit)) return false;
        if (card.type === 'action' && unit.actionUsed) return false;
        if (isMonster(card)) return card.evolvesFrom ? canEvolve(unit, card) >= 0 : unit.field.length < BOARD_LIMIT;
        if (['item_hp_up', 'item_heal_cleanse', 'item_taunt', 'action_atk_up'].includes(card.ability)) return allTeamCards(unit.team, false).length > 0;
        if (card.type === 'field' && teamOf(unit).field) {
            const current = teamOf(unit).field;
            const currentValue = cpuFieldValue(unit, current);
            const replacementValue = cpuFieldValue(unit, card);
            const damagedEnough = current.hp <= Math.max(20, current.maxHp * 0.25);
            if (!damagedEnough && replacementValue <= currentValue) return false;
        }
        return true;
    }

    function cpuCardScore(unit, card) {
        const strategy = unit.strategy || {};
        const actionBias = strategy.actionBias || {};
        let score = actualCost(unit, card) * 7 + Math.random() * 18;
        if (card.type === 'person') score += Number(actionBias.person) || 24;
        else if (card.type === 'field') score += Number(actionBias.field) || 18;
        else if (card.type === 'action' || card.type === 'item') score += Number(actionBias.support) || 15;
        else if (canEvolve(unit, card) >= 0) score += Number(actionBias.evolve) || 30;
        else score += Number(actionBias.summon) || 20;
        if (card.ability === 'action_heal_face' && teamOf(unit).hp < 220) score += 55;
        if (['taunt', 'pure_aegis', 'absolute_fortress'].includes(card.ability) && teamOf(unit).hp < 220) score += 35;
        if (card.type === 'field' && !teamOf(unit).field) score += 30;
        return score;
    }

    function cpuPlayTarget(unit, card) {
        const targets = playTargets(unit, card);
        if (!targets.length) return null;
        if (['item_heal_cleanse', 'item_hp_up', 'item_taunt'].includes(card.ability)) {
            return targets.sort((a, b) => (a.card.hp / Math.max(1, a.card.maxHp)) - (b.card.hp / Math.max(1, b.card.maxHp)))[0];
        }
        if (card.ability === 'action_atk_up') return targets.sort((a, b) => b.card.damage - a.card.damage)[0];
        return randomChoice(targets);
    }

    function cpuAttackTarget(unit, card) {
        const legal = legalAttackTargets(unit, card);
        if (!legal.length) return null;
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        const leader = legal.find(target => target.zone === 'leader');
        if (leader && state().teams[enemyTeam].hp <= card.damage) return leader;
        const kills = legal.filter(target => target.card && target.card.hp <= card.damage).sort((a, b) => b.card.damage - a.card.damage);
        if (kills.length) return kills[0];
        const focus = unit.strategy.attackFocus || {};
        if (leader && Math.random() * 100 < (Number(focus.leader) || 32)) return leader;
        return legal.filter(target => target.zone !== 'leader').sort((a, b) => b.card.damage - a.card.damage)[0] || leader || randomChoice(legal);
    }

    async function runCpuMainPhase(unit) {
        const battle = state();
        let plays = 0;
        while (!battle.isEnded) {
            const choices = unit.hand.map((card, index) => ({ card, index })).filter(entry => cpuCanPlay(unit, entry.card));
            if (!choices.length) break;
            choices.sort((a, b) => cpuCardScore(unit, b.card) - cpuCardScore(unit, a.card));
            const choice = choices[0];
            const played = await playCard(unit, choice.index, cpuPlayTarget(unit, choice.card));
            if (!played || battle.isEnded) break;
            plays++;
            window.renderCasinoTCGTagBattle();
            await wait(240);
            if (unit.person && !unit.personSkillUsed) await attemptCpuPersonSkill(unit, false, null);
        }
        return plays;
    }

    async function runCpuAttacks(unit) {
        const battle = state();
        for (const card of livingCards(unit).slice()) {
            while (!battle.isEnded && card.canAttack && livingCards(unit).includes(card)) {
                const target = cpuAttackTarget(unit, card);
                if (!target) { card.canAttack = false; break; }
                await resolveAttack(unit, card, target);
                await wait(230);
            }
        }
    }

    async function runCpuTurn(unit) {
        const battle = state();
        if (!battle || battle.isEnded || currentActor() !== unit || battle.isAnimating) return;
        battle.isAnimating = true;
        window.renderCasinoTCGTagBattle();
        await wait(300);
        await attemptCpuPersonSkill(unit, false, null);
        await runCpuMainPhase(unit);
        await runCpuAttacks(unit);
        if (!battle.isEnded) {
            const postCombatPlays = await runCpuMainPhase(unit);
            if (postCombatPlays > 0) await runCpuAttacks(unit);
        }
        if (!battle.isEnded) advanceTurn();
    }

    function tagOpponentDetails(unit) {
        return {
            id: unit.participant.id || unit.masterType || unit.id,
            opponentId: unit.participant.id || unit.masterType || unit.id,
            type: unit.participant.kind || 'master',
            opponentType: unit.participant.kind || 'master',
            name: unit.name,
            opponentName: unit.name,
            masterType: unit.masterType
        };
    }

    function recordTagResult(result) {
        const battle = state();
        if (!battle || battle.resultRecorded) return;
        battle.resultRecorded = true;
        const ally = battle.actors.ally;
        const opponents = [battle.actors.enemy1, battle.actors.enemy2].map(tagOpponentDetails);
        if (typeof window.recordDealerCasinoGameResult === 'function') {
            window.recordDealerCasinoGameResult('tcg', result, {
                mode: 'tag', tcgMode: 'tag', netCoins: 0,
                opponents,
                partner: {
                    id: ally.participant.id || ally.masterType || 'ally',
                    name: ally.name,
                    type: ally.participant.kind || 'master',
                    masterType: ally.masterType
                }
            });
        }
    }

    async function finishBattle(winner, reason) {
        const battle = state();
        if (!battle || battle.isEnded) return;
        battle.isEnded = true; battle.isAnimating = true;
        battle.selectedAttacker = null; battle.pendingTarget = null; battle.pendingPlay = null; battle.pendingPersonSkill = null;
        if (battle._defenseResolve) {
            const resolve = battle._defenseResolve; battle._defenseResolve = null; resolve(null);
        }
        battle.winnerTeam = winner;
        const local = battle.actors[localActorId()] || battle.actors.player;
        const result = winner === 'draw' ? 'draw' : local && winner === local.team ? 'win' : 'loss';
        battle.result = result; battle.resultReason = reason || '';
        if (!battle.networkMode) recordTagResult(result);
        else if (typeof window.onCasinoTCGNetworkBattleEnded === 'function') window.onCasinoTCGNetworkBattleEnded(winner, reason || '');
        window.renderCasinoTCGTagBattle();
        toast(result === 'win' ? 'VICTORY！' : result === 'loss' ? 'DEFEAT…' : 'DRAW', 1200);
        await wait(700);
        for (const unit of Object.values(battle.actors)) {
            if (!unit.isHuman) await dialogue(unit, winner === 'draw' ? 'draw' : unit.team === winner ? 'win' : 'loss', {}, 20, true);
        }
        showResultPanel();
    }

    function showResultPanel() {
        const battle = state();
        const root = document.getElementById('tcg-tag-battle-ui');
        if (!battle || !root) return;
        const old = document.getElementById('ctgb-result'); if (old) old.remove();
        const title = battle.result === 'win' ? '勝利' : battle.result === 'loss' ? '敗北' : '引き分け';
        const color = battle.result === 'win' ? '#ffe077' : battle.result === 'loss' ? '#ff9797' : '#9bddff';
        const panel = document.createElement('div'); panel.className = 'ctgb-overlay'; panel.id = 'ctgb-result';
        const playerNames = teamActors('player').map(unit => unit.name).join(' ＆ ');
        const enemyNames = teamActors('enemy').map(unit => unit.name).join(' ＆ ');
        const buttons = battle.networkMode
            ? '<button onclick="window.requestCasinoTCGNetworkRematch()">再戦ロビーへ</button><button onclick="window.closeCasinoTCGNetworkMatch()">対戦を終了</button>'
            : '<button onclick="window.closeCasinoTCGTagBattle(\'replay\')">同じ条件で再戦</button><button onclick="window.closeCasinoTCGTagBattle(\'reselect\')">編成を選び直す</button><button onclick="window.closeCasinoTCGTagBattle(\'table\')">TCGロビーへ</button>';
        panel.innerHTML = `<div class="ctgb-panel" style="text-align:center"><small style="color:#b9a8c7;letter-spacing:.2em">${battle.networkMode ? 'ONLINE RESULT' : 'TAG TEAM RESULT'}</small><h3 style="font-size:34px;color:${color};margin-top:5px">${title}</h3><p>${esc(battle.resultReason || '決着')}</p><p>${esc(playerNames)}<br>VS<br>${esc(enemyNames)}</p><div class="ctgb-panel-buttons" style="justify-content:center">${buttons}</div></div>`;
        root.appendChild(panel);
        if (window.audioManager) window.audioManager.playBGM(battle.result === 'win' ? 'card_victory' : battle.result === 'loss' ? 'card_lose' : 'card_lobby');
    }

    window.closeCasinoTCGTagBattle = function (destination) {
        const battle = state();
        const setup = battle && JSON.parse(JSON.stringify(battle.setup));
        const ui = document.getElementById('tcg-tag-battle-ui'); if (ui) ui.remove();
        window.TCG_TAG_BATTLE = null;
        const map = document.getElementById('casino-map-ui'); if (map) map.style.display = 'flex';
        if (window.audioManager) window.audioManager.playBGM('card_lobby');
        if (destination === 'replay' && setup) {
            schedule(() => window.startCasinoTCGTagBattleEngine(setup), 80);
        } else if (destination === 'reselect') {
            schedule(() => window.openCasinoTagSetup(setup && setup.ally && setup.ally.id), 80);
        } else if (typeof window.openCasinoTCGMenu === 'function') {
            schedule(() => window.openCasinoTCGMenu(), 80);
        }
    };
})();
