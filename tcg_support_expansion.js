// tcg_support_expansion.js : support_card2 / support_card3 の追加サポートカード30枚
(function () {
    'use strict';

    const ACTION_IMAGE = 'support_card2.jpg';
    const ITEM_IMAGE = 'support_card3.jpg';
    const EXPANSION_KEY = 'support_card_2_3';

    const actionDefinitions = [
        ['勉強', 1, '選択学習', 'action_study_filter', '山札の上3枚から1枚を手札に加え、その後手札1枚を山札の一番下へ置く。'],
        ['ランニング', 1, '再出走', 'action_running_bounce', '味方モンスター1体を手札へ戻す。このターン中、そのカードのコストを2減らす。'],
        ['作戦会議', 2, '種別封鎖', 'action_strategy_tax', '相手1人の手札を確認して種別を1つ宣言。次にその相手が使う宣言種別のカードはコスト+2。'],
        ['建築', 3, '即席城壁', 'action_build_wall', '自分の空き枠に「石の壁」（攻撃0/HP80・守護・攻撃不可）を配置する。'],
        ['料理', 1, '盛り付け交換', 'action_cooking_swap_hp', '味方モンスター2体の現在HPを入れ替える（それぞれ最大HPまで）。'],
        ['調合', 2, '状態転写', 'action_mix_transfer', '味方1体の状態異常を解除し、同じ状態異常を敵1体へ移す。'],
        ['裁縫', 2, '護りの衣', 'action_tailor_protect', '味方1体は次の自分ターン開始まで、相手効果による破壊と手札・山札戻しを受けない。'],
        ['カラーチェンジ', 1, '系統染色', 'action_color_lineage', '味方の通常モンスター1体に、場を離れるまで別の進化元系統を1つ追加する。'],
        ['網の修理', 2, '捕縛網', 'action_net_bind', '敵モンスター1体は、次のその持ち主のターン終了まで攻撃と守護参加ができない。'],
        ['ごうせい', 4, '進化合成', 'action_synthesis_evolve', '自分のモンスター1体を犠牲にし、その直接進化先を手札か山札からコストなしで出す。登場したカードはこのターン攻撃不可。'],
        ['なげる', 1, '投擲', 'action_throw_item', '手札のアイテム1枚を捨て、敵1体か敵リーダーに「20＋その印刷コスト×10」ダメージ。'],
        ['皿洗い', 3, '盤面洗浄', 'action_dishwash_reset', '全モンスターの状態異常・後付け能力・能力値変化を消し、印刷時の能力値へ戻す。現在HPは回復しない。'],
        ['救助', 4, '緊急蘇生', 'action_rescue_revive', '自分の墓地からコスト4以下のモンスター1体をHP1で出す。次の自分ターン開始まで攻撃・能力発動不可。'],
        ['秘伝書の執筆', 3, '奥義継承', 'action_secret_recover', '同名以外のアクション1枚を自分の墓地から手札へ戻す。そのカードは次回コスト0で、使用後は対戦から除外。'],
        ['一か八かの大穴', 1, 'トップ勝負', 'action_high_stakes', '自分と相手1人が山札の上を公開。高コスト側は手札、低コスト側は墓地へ置く。同値なら両方手札へ。']
    ];

    const itemDefinitions = [
        ['ただの石', 0, '石つぶて', 'item_plain_stone', '敵モンスター1体に10ダメージ。リーダーは対象にできない。'],
        ['大きなパン', 2, '腹いっぱい', 'item_big_bread', '味方リーダーの最大HPを30増やし、30回復する。'],
        ['しあわせの種', 2, '予告召喚', 'item_happy_seed', '自分の空き枠に芽（攻撃0/HP10）を置き、山札のコスト3以下の通常モンスター1枚を予約。次の自分ターン開始時に入れ替える。'],
        ['混乱の巻物', 2, '混乱', 'item_confusion_scroll', '敵モンスター1体の次の攻撃対象を、攻撃可能な対象からランダムに変更する。'],
        ['封魔の巻物', 2, '封魔', 'item_seal_scroll', '敵モンスター1体の固有能力を、次のその持ち主のターン終了まで無効化する。能力値は変わらない。'],
        ['火竜の杖', 4, '火竜の息', 'item_fire_dragon_wand', '選んだ相手1人の全モンスターに30ダメージ、敵の共有リーダーに20ダメージ。'],
        ['場所替えの杖', 5, '場所替え', 'item_swap_wand', '印刷コストが同じ味方と敵のモンスター各1体の場所を交換する。両方とも行動済みになる。'],
        ['吹き飛ばしの杖', 3, '吹き飛ばし', 'item_blow_wand', '印刷コスト4以下の敵モンスター1体を持ち主の手札へ戻す。そのカードの次回コスト+1。'],
        ['連撃の剣', 5, '連撃付与', 'item_double_sword', '味方モンスター1体は、場にいる間1ターンに2回攻撃できる（重複不可）。'],
        ['反撃の盾', 3, '反撃付与', 'item_counter_shield', '味方モンスター1体は、戦闘で生き残った時、攻撃者へ自身の攻撃力分のダメージを返す（重複不可）。'],
        ['ハラモチの盾', 2, '腹持ち防御', 'item_hara_shield', '味方リーダーが次に受けるダメージを半分にする。1回だけ有効で重複不可。'],
        ['回復の指輪', 2, '再生付与', 'item_heal_ring', '味方モンスター1体は、持ち主のターン開始時にHPを10回復する（重複不可）。'],
        ['王冠', 4, '二重号令', 'item_crown', 'このターン、自分の人物カードは2種類の人物スキルを各1回ずつ使える。コストは通常どおり。'],
        ['悠久の懐中時計', 8, '追加時間', 'item_eternal_watch', 'このターンの後に追加ターンを得る。追加ターンはドロー・最大マナ増加なし、使用可能マナ3で開始。1対戦1回。'],
        ['幻影のカードパック', 4, '幻影開封', 'item_phantom_pack', 'デッキに入っていないコスト4以下の通常モンスターをランダムに3種類表示し、1枚を一時的に手札へ加える。']
    ];

    function installDefinition(masterId, data, image, imageIndex, type) {
        const imageWidth = image === ACTION_IMAGE ? 2122 : 1600;
        const imageHeight = image === ACTION_IMAGE ? 2016 : 2656;
        const cellWidth = imageWidth / 3;
        const cellHeight = imageHeight / 5;
        const column = imageIndex % 3;
        const row = Math.floor(imageIndex / 3);
        window.TCG_MASTER[masterId] = {
            name: data[0], type, image, imageIndex,
            offsetX: 0, offsetY: 0, zoomX: 300, zoomY: 500,
            memorySx: column * cellWidth, memorySy: row * cellHeight,
            memorySw: cellWidth, memorySh: cellHeight,
            memoryScaleX: 180 / cellWidth, memoryScaleY: 120 / cellHeight,
            baseCost: data[1], baseHp: 0, skillName: data[2], skillCost: 0, baseDmg: 0,
            ability: data[3], abilityTextOverride: `【${data[2]}】${data[4]}`,
            supportExpansion: EXPANSION_KEY
        };
    }

    if (!window.TCG_MASTER) window.TCG_MASTER = {};
    actionDefinitions.forEach((data, index) => installDefinition(`support2_${index}`, data, ACTION_IMAGE, index, 'action'));
    itemDefinitions.forEach((data, index) => installDefinition(`support3_${index}`, data, ITEM_IMAGE, index, 'item'));
    window.TCG_MASTER.support_token_wall = {
        name: '石の壁', type: 'support_token_wall', image: ACTION_IMAGE, imageIndex: 3, zoomX: 300, zoomY: 500,
        baseCost: 0, baseHp: 80, baseDmg: 0, ability: 'support_wall_guard', cannotEvolve: true, supportExpansion: EXPANSION_KEY,
        abilityTextOverride: '【即席城壁】攻撃できない。敵の攻撃を引き受ける。進化できない。'
    };
    window.TCG_MASTER.support_token_sprout = {
        name: 'しあわせの芽', type: 'support_token_sprout', image: ITEM_IMAGE, imageIndex: 2, zoomX: 300, zoomY: 500,
        baseCost: 0, baseHp: 10, baseDmg: 0, ability: 'support_seed_wait', cannotEvolve: true, supportExpansion: EXPANSION_KEY,
        abilityTextOverride: '【発芽待ち】攻撃できない。次の持ち主ターン開始時、予約したモンスターと入れ替わる。'
    };

    const actionUnlocks = {
        study: 'support2_0', run: 'support2_1', '作戦会議': 'support2_2', build: 'support2_3',
        cook: 'support2_4', mix: 'support2_5', tailor: 'support2_6', hairdresser_color: 'support2_7',
        'カラーチェンジ': 'support2_7', '網の修理': 'support2_8', synthesize: 'support2_9', 'ごうせい': 'support2_9',
        throw: 'support2_10', 'なげる': 'support2_10', '皿洗い': 'support2_11', rescue: 'support2_12', '救助': 'support2_12',
        life_author: 'support2_13', writing: 'support2_13', '秘伝書の執筆': 'support2_13', 'カジノ': 'support2_14', '一か八かの大穴': 'support2_14'
    };
    const itemUnlocks = {
        stone: 'support3_0', item_bread: 'support3_1', item_seed_happy: 'support3_2', item_scroll_confuse: 'support3_3',
        item_scroll_seal: 'support3_4', item_wand_fire: 'support3_5', item_wand_swap: 'support3_6', item_wand_blow: 'support3_7',
        item_sword_double: 'support3_8', item_shield_counter: 'support3_9', item_shield_hara: 'support3_10', item_ring_heal: 'support3_11',
        eq_crown: 'support3_12', eternal_watch: 'support3_13', mat_card_1: 'support3_14'
    };
    Object.assign(window.TCG_UNLOCK_CONDITIONS || (window.TCG_UNLOCK_CONDITIONS = {}), itemUnlocks);
    Object.entries(actionUnlocks).forEach(([key, cardId]) => { window.TCG_UNLOCK_CONDITIONS[`support_action_${key}`] = cardId; });

    window.triggerTCGSupportActionUnlock = function (actionName, generation) {
        const cardId = actionUnlocks[actionName];
        if (!cardId || typeof window.unlockSupportCard !== 'function') return;
        window.unlockSupportCard(cardId, generation || (window.aiPet && window.aiPet.generation) || 1);
    };

    function normalizeInventoryId(entry) {
        return typeof entry === 'string' ? entry : entry && entry.id;
    }

    function triggerItemUnlock(itemId, generation) {
        if (!itemId) return;
        const exact = itemUnlocks[itemId];
        const prefix = exact ? itemId : Object.keys(itemUnlocks).find(key => String(itemId).startsWith(`${key}_+`) || String(itemId).startsWith(`${key}_-`));
        const cardId = exact || (prefix && itemUnlocks[prefix]);
        if (cardId && typeof window.unlockSupportCard === 'function') window.unlockSupportCard(cardId, generation || 1);
    }

    window.reconcileTCGSupportExpansionUnlocks = function () {
        const pet = window.aiPet;
        if (!pet || !Array.isArray(pet.inventory)) return;
        const generation = pet.generation || 1;
        new Set(pet.inventory.map(normalizeInventoryId).filter(Boolean)).forEach(itemId => triggerItemUnlock(itemId, generation));
    };

    if (window.AICharacter && window.AICharacter.prototype) {
        const previousItemUnlock = window.AICharacter.prototype.checkItemCardUnlock;
        window.AICharacter.prototype.checkItemCardUnlock = function (itemKey) {
            if (previousItemUnlock) previousItemUnlock.apply(this, arguments);
            triggerItemUnlock(normalizeInventoryId(itemKey), this.generation || 1);
            if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock(normalizeInventoryId(itemKey), this.generation || 1);
        };
    }
    if (window.aiPet) {
        const previousPetItemUnlock = window.aiPet.checkItemCardUnlock;
        window.aiPet.checkItemCardUnlock = function (itemKey) {
            if (previousPetItemUnlock) previousPetItemUnlock.apply(this, arguments);
            triggerItemUnlock(normalizeInventoryId(itemKey), this.generation || 1);
            if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock(normalizeInventoryId(itemKey), this.generation || 1);
        };
    }
    ['openCasinoTCGMenu', 'openDeckBuilder'].forEach(function (name) {
        const previous = window[name];
        if (!previous) return;
        window[name] = function () {
            window.reconcileTCGSupportExpansionUnlocks();
            return previous.apply(this, arguments);
        };
    });
    if (typeof window.applyHairdresserCosmetic === 'function') {
        const previousApplyHairdresserCosmetic = window.applyHairdresserCosmetic;
        window.applyHairdresserCosmetic = function () {
            const result = previousApplyHairdresserCosmetic.apply(this, arguments);
            const options = arguments[3] || {};
            if (options.mode !== 'aura') window.triggerTCGSupportActionUnlock('カラーチェンジ', (window.aiPet && window.aiPet.generation) || 1);
            return result;
        };
    }

    function masterOf(card) { return card && window.TCG_MASTER && window.TCG_MASTER[card.masterId]; }
    function isExpansionCard(card) { const master = masterOf(card); return !!(master && master.supportExpansion === EXPANSION_KEY); }
    function isMonster(card) { return !!card && !['action', 'item', 'field', 'person'].includes(card.type); }
    function printedCost(card) { const master = masterOf(card); return Number(master && master.baseCost !== undefined ? master.baseCost : card && card.cost) || 0; }
    function living(cards) { return (cards || []).filter(card => card && !card.isDead && Number(card.hp) > 0); }
    function randomOne(list) { return list && list.length ? list[Math.floor(Math.random() * list.length)] : null; }
    function removeOne(list, value) { const index = list ? list.indexOf(value) : -1; if (index >= 0) list.splice(index, 1); return index; }
    function cardLabel(card) {
        if (!card) return 'リーダー';
        const stats = isMonster(card) ? ` / ⚔${Number(card.damage) || 0} ♥${Math.max(0, Number(card.hp) || 0)}` : '';
        return `${card.name || 'カード'}（${printedCost(card)}M${stats}）`;
    }
    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function chooseOne(title, options, detail) {
        options = (options || []).filter(Boolean);
        if (!options.length) return Promise.resolve(null);
        if (options.length === 1 || typeof document === 'undefined' || !document.body) return Promise.resolve(options[0].value);
        return new Promise(resolve => {
            const old = document.getElementById('tcg-support-expansion-choice');
            if (old) old.remove();
            const overlay = document.createElement('div');
            overlay.id = 'tcg-support-expansion-choice';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:76000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:18px;font-family:sans-serif;';
            overlay.innerHTML = `<div style="width:min(720px,94vw);max-height:86vh;overflow:auto;background:#20252c;border:3px solid #63d8e5;border-radius:18px;padding:22px;color:#fff;box-shadow:0 20px 70px #000;"><h2 style="margin:0 0 8px;color:#76e8f3;font-size:22px;">${escapeHtml(title)}</h2>${detail ? `<p style="margin:0 0 16px;color:#ccd3da;line-height:1.6;">${escapeHtml(detail)}</p>` : ''}<div data-options style="display:grid;gap:9px;"></div><button data-cancel style="margin-top:16px;padding:9px 24px;background:#555;color:#fff;border:1px solid #888;border-radius:8px;cursor:pointer;">キャンセル</button></div>`;
            const list = overlay.querySelector('[data-options]');
            options.forEach((option, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.style.cssText = 'text-align:left;padding:12px 15px;background:#313944;color:#fff;border:1px solid #71808f;border-radius:9px;cursor:pointer;font-size:15px;line-height:1.45;';
                button.innerHTML = `<strong>${escapeHtml(option.label)}</strong>${option.detail ? `<br><small style="color:#b8c4cf;">${escapeHtml(option.detail)}</small>` : ''}`;
                button.onclick = () => { overlay.remove(); resolve(options[index].value); };
                list.appendChild(button);
            });
            overlay.querySelector('[data-cancel]').onclick = () => { overlay.remove(); resolve(null); };
            document.body.appendChild(overlay);
        });
    }

    function makeRuntimeCard(masterId, ownerId, tagMode) {
        const master = window.TCG_MASTER[masterId];
        if (!master) return null;
        const card = Object.assign({}, master, {
            uid: `support_temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            masterId, name: master.name, type: master.type, cost: Number(master.baseCost) || 0,
            hp: Number(master.baseHp) || 0, maxHp: Number(master.baseHp) || 0,
            damage: Number(master.baseDmg) || 0, ability: master.ability, evolvesFrom: master.evolvesFrom || '',
            isDead: false, canAttack: false, isDefending: false, status: null, _supportTemporary: true
        });
        if (tagMode) {
            card._tagOwnerId = ownerId;
            card._tagId = `${ownerId}_support_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        }
        return card;
    }

    function resetCardToPrinted(card) {
        const master = masterOf(card);
        if (!card || !master) return;
        card.damage = Number(master.baseDmg) || 0;
        card.maxHp = Number(master.baseHp) || 0;
        card.ability = master.ability || '';
        card.evolvesFrom = master.evolvesFrom || '';
        card.status = null;
        delete card.hasPermanentTaunt;
        if (card.ability === 'support_wall_guard') card.hasPermanentTaunt = true;
        card.isDefending = card.ability === 'taunt' || card.ability === 'pure_aegis' || card.ability === 'support_wall_guard';
        ['_supportProtected', '_supportEntangled', '_supportConfused', '_supportSilencedAbility', '_supportEvolutionType', '_supportCounter', '_supportRegen', '_advancedStatusImmune', '_advancedDamageShield', '_advancedNextDamageMultiplier', '_advancedOverclock', '_smith_buffed', '_smith_trample', '_captain_double', '_builder_guarded'].forEach(key => delete card[key]);
        card.hasDoubleStrike = false;
    }

    function possibleLineages() {
        const labels = new Map();
        Object.values(window.TCG_MASTER || {}).forEach(master => {
            if (master && master.evolvesFrom && !labels.has(master.evolvesFrom)) {
                const base = Object.values(window.TCG_MASTER).find(candidate => candidate && candidate.type === master.evolvesFrom && !candidate.evolvesFrom);
                labels.set(master.evolvesFrom, base ? base.name : master.evolvesFrom);
            }
        });
        return Array.from(labels, ([value, label]) => ({ value, label: `${label}系統` }));
    }

    function phantomCandidates(excludedMasterIds) {
        const excluded = new Set(excludedMasterIds || []);
        return Object.entries(window.TCG_MASTER || {}).filter(([masterId, master]) => {
            return master && isMonster(master) && !master.evolvesFrom && Number(master.baseCost) <= 4 && !excluded.has(masterId) && !master.supportExpansion;
        });
    }

    // 追加カードはマスターデータの文章と画像グリッドを常に優先する。
    if (typeof window.renderCardHTML === 'function') {
        const previousRender = window.renderCardHTML;
        window.renderCardHTML = function (card) {
            const master = masterOf(card);
            if (master && master.supportExpansion === EXPANSION_KEY) {
                card.image = master.image; card.imageIndex = master.imageIndex;
                card.offsetX = master.offsetX || 0; card.offsetY = master.offsetY || 0;
                card.zoomX = master.zoomX || 300; card.zoomY = master.zoomY || 500;
                card.abilityTextOverride = master.abilityTextOverride;
                delete card.sx; delete card.sy; delete card.sw; delete card.sh; delete card.scaleX; delete card.scaleY;
            }
            return previousRender.apply(this, arguments);
        };
    }

    if (typeof window.getCardBadgeInfo === 'function') {
        const previousBadges = window.getCardBadgeInfo;
        window.getCardBadgeInfo = function (card) {
            const badges = previousBadges(card) || [];
            const add = (text, color) => { if (!badges.some(badge => badge.text === text)) badges.push({ text, color }); };
            if (card && card._supportProtected) add('🧵 効果保護', '#AB47BC');
            if (card && card._supportEntangled) add('🕸 捕縛', '#78909C');
            if (card && card._supportConfused) add('🌀 混乱', '#EC407A');
            if (card && card._supportSilencedAbility !== undefined) add('📜 封魔', '#7E57C2');
            if (card && card._supportRegen) add('💍 再生10', '#66BB6A');
            if (card && card._supportCounter) add('🛡 反撃', '#42A5F5');
            if (card && card._supportEvolutionType) add('🎨 進化系統追加', '#FF7043');
            return badges;
        };
    }

    function cardTypeGroup(card) { return isMonster(card) ? 'monster' : card && card.type; }
    function adjustedSupportCost(owner, card, baseCost) {
        let cost = Math.max(0, Number(baseCost) || 0);
        if (card && card._supportFreeOnce) cost = 0;
        else {
            if (card && card._supportRunDiscount) cost -= 2;
            if (card && card._supportBounceTax) cost += 1;
        }
        if (owner && owner._supportStrategyTax && cardTypeGroup(card) === owner._supportStrategyTax.type) cost += 2;
        return Math.max(0, cost);
    }

    if (typeof window.getActualCost === 'function') {
        const previousActualCost = window.getActualCost;
        window.getActualCost = function (owner, card) {
            return adjustedSupportCost(owner, card, previousActualCost.apply(this, arguments));
        };
    }

    if (typeof window.checkCanEvolve === 'function') {
        const previousCanEvolve = window.checkCanEvolve;
        window.checkCanEvolve = function (base, evolution) {
            if (base && (base.cannotEvolve || masterOf(base)?.cannotEvolve)) return false;
            if (base && evolution && base._supportEvolutionType && base._supportEvolutionType === evolution.evolvesFrom) return true;
            return previousCanEvolve.apply(this, arguments);
        };
    }

    function singleSides(isPlayer) {
        const battle = window.TCG_BATTLE;
        return { battle, owner: isPlayer ? battle.player : battle.cpu, enemy: isPlayer ? battle.cpu : battle.player, side: isPlayer ? 'player' : 'cpu' };
    }

    function singleCardId(card, owner) {
        const side = owner === window.TCG_BATTLE.player ? 'p' : 'c';
        return `${side}-card-${owner.field.indexOf(card)}`;
    }

    function damageSingleCard(card, amount, owner, sourceOwner) {
        if (!card || card.isDead) return 0;
        const damage = Math.max(0, Math.floor(Number(amount) || 0));
        card.hp -= damage;
        if (typeof window.showVFX === 'function') window.showVFX(singleCardId(card, owner), 'damage', damage);
        if (typeof window.checkDeath === 'function') window.checkDeath(card, owner, singleCardId(card, owner), sourceOwner);
        return damage;
    }

    function damageSingleLeader(owner, amount) {
        const damage = Math.max(0, Math.floor(Number(amount) || 0));
        owner.hp -= damage;
        return damage;
    }

    function installSingleLeaderDamageShield(owner) {
        if (!owner) return;
        if (!owner._supportHpShieldAccessor) {
            let hpValue = Number(owner.hp) || 0;
            Object.defineProperty(owner, 'hp', {
                configurable: true,
                enumerable: true,
                get() { return hpValue; },
                set(nextValue) {
                    let resolved = Number(nextValue);
                    if (!Number.isFinite(resolved)) resolved = hpValue;
                    if (this._supportHaraShield && resolved < hpValue) {
                        const incoming = hpValue - resolved;
                        resolved = hpValue - Math.ceil(incoming / 2);
                        delete this._supportHaraShield;
                    }
                    hpValue = resolved;
                }
            });
            Object.defineProperty(owner, '_supportHpShieldAccessor', { value: true, configurable: true, writable: true, enumerable: false });
        }
        owner._supportHaraShield = true;
    }

    function destroySingleCard(card, owner, enemy, reason) {
        if (!card || card.isDead) return false;
        if (card._supportProtected && ['effect', 'bounce'].includes(reason)) return false;
        card.hp = 0;
        if (typeof window.checkDeath === 'function') window.checkDeath(card, owner, singleCardId(card, owner), enemy);
        return !!card.isDead;
    }

    function bounceSingleCard(card, owner) {
        if (!card || card._supportProtected) return false;
        removeOne(owner.field, card);
        card.isDead = false; card.canAttack = false; card.isDefending = false;
        card._supportBounceTax = true;
        owner.hand.push(card);
        return true;
    }

    async function prepareSingleChoices(card) {
        const { owner, enemy } = singleSides(true);
        const ability = card.ability;
        const chooseCard = (title, cards, detail) => chooseOne(title, cards.map(value => ({ value, label: cardLabel(value) })), detail);
        const result = {};
        if (ability === 'action_study_filter') {
            const top = owner.deck.slice(0, 3); result.pick = await chooseCard('勉強：手札へ加えるカード', top); if (!result.pick) return null;
            const candidates = owner.hand.concat(result.pick); result.bottom = await chooseCard('勉強：山札の一番下へ置くカード', candidates); if (!result.bottom) return null;
        } else if (ability === 'action_running_bounce' || ability === 'action_tailor_protect' || ability === 'item_double_sword' || ability === 'item_counter_shield' || ability === 'item_heal_ring') {
            result.friend = await chooseCard(`${card.name}：味方を選択`, living(owner.field)); if (!result.friend) return null;
        } else if (ability === 'action_strategy_tax') {
            const groups = ['monster', 'action', 'item', 'field', 'person'];
            result.type = await chooseOne('作戦会議：封鎖する種別', groups.map(value => ({ value, label: value === 'monster' ? 'モンスター' : ({ action: 'アクション', item: 'アイテム', field: 'フィールド', person: '人物' }[value]) })), `相手の手札：${enemy.hand.map(entry => entry.name).join('、') || 'なし'}`); if (!result.type) return null;
        } else if (ability === 'action_build_wall' || ability === 'item_happy_seed') {
            if (living(owner.field).length >= 5) return null;
            if (ability === 'item_happy_seed') {
                const seeds = owner.deck.filter(entry => isMonster(entry) && !entry.evolvesFrom && printedCost(entry) <= 3);
                result.seed = await chooseCard('しあわせの種：育てるカード', seeds); if (!result.seed) return null;
            }
        } else if (ability === 'action_cooking_swap_hp') {
            const friends = living(owner.field); result.first = await chooseCard('料理：1体目を選択', friends); if (!result.first) return null;
            result.second = await chooseCard('料理：2体目を選択', friends.filter(entry => entry !== result.first)); if (!result.second) return null;
        } else if (ability === 'action_mix_transfer') {
            result.friend = await chooseCard('調合：状態異常を取り出す味方', living(owner.field).filter(entry => entry.status)); if (!result.friend) return null;
            result.enemy = await chooseCard('調合：状態異常を移す敵', living(enemy.field)); if (!result.enemy) return null;
        } else if (ability === 'action_color_lineage') {
            result.friend = await chooseCard('カラーチェンジ：味方を選択', living(owner.field).filter(entry => !entry.evolvesFrom)); if (!result.friend) return null;
            result.lineage = await chooseOne('追加する進化系統', possibleLineages()); if (!result.lineage) return null;
        } else if (ability === 'action_net_bind' || ability === 'item_plain_stone' || ability === 'item_confusion_scroll' || ability === 'item_seal_scroll') {
            result.enemy = await chooseCard(`${card.name}：敵を選択`, living(enemy.field)); if (!result.enemy) return null;
        } else if (ability === 'action_synthesis_evolve') {
            const candidates = living(owner.field).filter(base => owner.hand.concat(owner.deck).some(evo => evo.evolvesFrom && (evo.evolvesFrom === base.type || evo.evolvesFrom === base._supportEvolutionType)));
            result.friend = await chooseCard('ごうせい：素材にする味方', candidates); if (!result.friend) return null;
            const evolutions = owner.hand.concat(owner.deck).filter(evo => evo.evolvesFrom && (evo.evolvesFrom === result.friend.type || evo.evolvesFrom === result.friend._supportEvolutionType));
            result.evolution = await chooseCard('ごうせい：呼び出す進化先', evolutions); if (!result.evolution) return null;
        } else if (ability === 'action_throw_item') {
            result.item = await chooseCard('なげる：捨てるアイテム', owner.hand.filter(entry => entry !== card && entry.type === 'item')); if (!result.item) return null;
            const targets = living(enemy.field).map(value => ({ value, label: cardLabel(value) })).concat([{ value: 'leader', label: '敵リーダー' }]);
            result.target = await chooseOne('なげる：対象を選択', targets); if (!result.target) return null;
        } else if (ability === 'action_rescue_revive') {
            result.revive = await chooseCard('救助：蘇生するカード', owner.graveyard.filter(entry => isMonster(entry) && printedCost(entry) <= 4)); if (!result.revive || living(owner.field).length >= 5) return null;
        } else if (ability === 'action_secret_recover') {
            result.recover = await chooseCard('秘伝書の執筆：継承するアクション', owner.graveyard.filter(entry => entry.type === 'action' && entry.masterId !== card.masterId)); if (!result.recover) return null;
        } else if (ability === 'item_fire_dragon_wand' || ability === 'action_high_stakes' || ability === 'item_big_bread' || ability === 'action_dishwash_reset' || ability === 'item_hara_shield' || ability === 'item_crown' || ability === 'item_eternal_watch') {
            // シングルでは相手・リーダーが1人なので追加選択なし。
        } else if (ability === 'item_swap_wand') {
            result.friend = await chooseCard('場所替え：味方を選択', living(owner.field).filter(friend => living(enemy.field).some(foe => printedCost(foe) === printedCost(friend)))); if (!result.friend) return null;
            result.enemy = await chooseCard('場所替え：交換する敵', living(enemy.field).filter(foe => printedCost(foe) === printedCost(result.friend))); if (!result.enemy) return null;
        } else if (ability === 'item_blow_wand') {
            result.enemy = await chooseCard('吹き飛ばし：敵を選択', living(enemy.field).filter(entry => printedCost(entry) <= 4)); if (!result.enemy) return null;
        } else if (ability === 'item_phantom_pack') {
            const excluded = owner.deck.map(entry => entry.masterId);
            const pool = phantomCandidates(excluded).sort(() => Math.random() - 0.5).slice(0, 3);
            result.phantomMasterId = await chooseOne('幻影のカードパック：1枚を選択', pool.map(([value, master]) => ({ value, label: `${master.name}（${master.baseCost}M）` }))); if (!result.phantomMasterId) return null;
        }
        return result;
    }

    function autoSingleChoices(card, isPlayer) {
        const { owner, enemy } = singleSides(isPlayer);
        const friend = living(owner.field)[0]; const foe = living(enemy.field)[0];
        const ability = card.ability; const result = {};
        if (ability === 'action_study_filter') { result.pick = owner.deck[0]; result.bottom = owner.hand[owner.hand.length - 1] || result.pick; }
        else if (['action_running_bounce', 'action_tailor_protect', 'item_double_sword', 'item_counter_shield', 'item_heal_ring'].includes(ability)) result.friend = friend;
        else if (ability === 'action_strategy_tax') result.type = cardTypeGroup(enemy.hand[0]) || 'monster';
        else if (ability === 'item_happy_seed') result.seed = owner.deck.find(entry => isMonster(entry) && !entry.evolvesFrom && printedCost(entry) <= 3);
        else if (ability === 'action_cooking_swap_hp') { const list = living(owner.field).sort((a, b) => a.hp - b.hp); result.first = list[0]; result.second = list[list.length - 1]; }
        else if (ability === 'action_mix_transfer') { result.friend = living(owner.field).find(entry => entry.status); result.enemy = foe; }
        else if (ability === 'action_color_lineage') { result.friend = living(owner.field).find(entry => !entry.evolvesFrom); result.lineage = possibleLineages()[0] && possibleLineages()[0].value; }
        else if (['action_net_bind', 'item_plain_stone', 'item_confusion_scroll', 'item_seal_scroll', 'item_blow_wand'].includes(ability)) result.enemy = foe;
        else if (ability === 'action_synthesis_evolve') { result.friend = living(owner.field).find(base => owner.hand.concat(owner.deck).some(evo => evo.evolvesFrom === base.type || evo.evolvesFrom === base._supportEvolutionType)); result.evolution = result.friend && owner.hand.concat(owner.deck).find(evo => evo.evolvesFrom === result.friend.type || evo.evolvesFrom === result.friend._supportEvolutionType); }
        else if (ability === 'action_throw_item') { result.item = owner.hand.find(entry => entry !== card && entry.type === 'item'); result.target = foe || 'leader'; }
        else if (ability === 'action_rescue_revive') result.revive = owner.graveyard.find(entry => isMonster(entry) && printedCost(entry) <= 4);
        else if (ability === 'action_secret_recover') result.recover = owner.graveyard.find(entry => entry.type === 'action' && entry.masterId !== card.masterId);
        else if (ability === 'item_swap_wand') { result.friend = living(owner.field).find(a => living(enemy.field).some(b => printedCost(a) === printedCost(b))); result.enemy = result.friend && living(enemy.field).find(b => printedCost(b) === printedCost(result.friend)); }
        else if (ability === 'item_phantom_pack') { const pool = phantomCandidates(owner.deck.map(entry => entry.masterId)); result.phantomMasterId = pool[0] && pool[0][0]; }
        return result;
    }

    function resolveSingleEffect(card, choices, isPlayer) {
        const { battle, owner, enemy } = singleSides(isPlayer);
        choices = choices || {};
        const ability = card.ability;
        if (ability === 'action_study_filter' && choices.pick) {
            removeOne(owner.deck, choices.pick); owner.hand.push(choices.pick);
            if (choices.bottom) { removeOne(owner.hand, choices.bottom); owner.deck.push(choices.bottom); }
        } else if (ability === 'action_running_bounce' && choices.friend) {
            removeOne(owner.field, choices.friend); choices.friend.isDead = false; choices.friend.canAttack = false; choices.friend._supportRunDiscount = true; owner.hand.push(choices.friend);
        } else if (ability === 'action_strategy_tax') enemy._supportStrategyTax = { type: choices.type || 'monster' };
        else if (ability === 'action_build_wall' && living(owner.field).length < 5) { const wall = makeRuntimeCard('support_token_wall'); wall.isDefending = true; wall.hasPermanentTaunt = true; owner.field.push(wall); }
        else if (ability === 'action_cooking_swap_hp' && choices.first && choices.second) { const hp = choices.first.hp; choices.first.hp = Math.min(choices.first.maxHp, choices.second.hp); choices.second.hp = Math.min(choices.second.maxHp, hp); }
        else if (ability === 'action_mix_transfer' && choices.friend && choices.enemy) { choices.enemy.status = choices.friend.status; choices.friend.status = null; }
        else if (ability === 'action_tailor_protect' && choices.friend) choices.friend._supportProtected = true;
        else if (ability === 'action_color_lineage' && choices.friend) choices.friend._supportEvolutionType = choices.lineage;
        else if (ability === 'action_net_bind' && choices.enemy) { choices.enemy._supportEntangled = true; choices.enemy.canAttack = false; choices.enemy.isDefending = false; }
        else if (ability === 'action_synthesis_evolve' && choices.friend && choices.evolution) {
            destroySingleCard(choices.friend, owner, enemy, 'sacrifice'); owner.field = owner.field.filter(entry => !entry.isDead);
            removeOne(owner.hand, choices.evolution); removeOne(owner.deck, choices.evolution); choices.evolution.isDead = false; choices.evolution.hp = choices.evolution.maxHp; choices.evolution.canAttack = false; owner.field.push(choices.evolution);
        } else if (ability === 'action_throw_item' && choices.item) {
            removeOne(owner.hand, choices.item); choices.item.isDead = true; owner.graveyard.push(choices.item);
            const damage = 20 + printedCost(choices.item) * 10;
            if (choices.target === 'leader') damageSingleLeader(enemy, damage); else damageSingleCard(choices.target, damage, enemy, owner);
        } else if (ability === 'action_dishwash_reset') living(owner.field).concat(living(enemy.field)).forEach(resetCardToPrinted);
        else if (ability === 'action_rescue_revive' && choices.revive && living(owner.field).length < 5) { removeOne(owner.graveyard, choices.revive); choices.revive.isDead = false; choices.revive.hp = 1; choices.revive.canAttack = false; choices.revive._supportRescuedDisabled = true; choices.revive._supportAbilityBeforeRescue = choices.revive.ability; choices.revive.ability = ''; owner.field.push(choices.revive); }
        else if (ability === 'action_secret_recover' && choices.recover) { removeOne(owner.graveyard, choices.recover); choices.recover.isDead = false; choices.recover._supportFreeOnce = true; choices.recover._supportBanishAfterUse = true; owner.hand.push(choices.recover); }
        else if (ability === 'action_high_stakes') {
            const own = owner.deck.shift(); const other = enemy.deck.shift();
            if (own && other) { if (printedCost(own) >= printedCost(other)) owner.hand.push(own); else { own.isDead = true; owner.graveyard.push(own); } if (printedCost(other) >= printedCost(own)) enemy.hand.push(other); else { other.isDead = true; enemy.graveyard.push(other); } }
            else { if (own) owner.hand.push(own); if (other) enemy.hand.push(other); }
        } else if (ability === 'item_plain_stone' && choices.enemy) damageSingleCard(choices.enemy, 10, enemy, owner);
        else if (ability === 'item_big_bread') { owner.maxHp = (owner.maxHp || 200) + 30; owner.hp = Math.min(owner.maxHp, owner.hp + 30); }
        else if (ability === 'item_happy_seed' && choices.seed && living(owner.field).length < 5) { removeOne(owner.deck, choices.seed); const sprout = makeRuntimeCard('support_token_sprout'); sprout._supportSeedCard = choices.seed; owner.field.push(sprout); }
        else if (ability === 'item_confusion_scroll' && choices.enemy) choices.enemy._supportConfused = true;
        else if (ability === 'item_seal_scroll' && choices.enemy && choices.enemy._supportSilencedAbility === undefined) { choices.enemy._supportSilencedAbility = choices.enemy.ability; choices.enemy.ability = ''; }
        else if (ability === 'item_fire_dragon_wand') { living(enemy.field).slice().forEach(target => damageSingleCard(target, 30, enemy, owner)); damageSingleLeader(enemy, 20); }
        else if (ability === 'item_swap_wand' && choices.friend && choices.enemy) { const fi = owner.field.indexOf(choices.friend), ei = enemy.field.indexOf(choices.enemy); if (fi >= 0 && ei >= 0) { owner.field[fi] = choices.enemy; enemy.field[ei] = choices.friend; choices.friend.canAttack = false; choices.enemy.canAttack = false; } }
        else if (ability === 'item_blow_wand' && choices.enemy) bounceSingleCard(choices.enemy, enemy);
        else if (ability === 'item_double_sword' && choices.friend) choices.friend.hasDoubleStrike = true;
        else if (ability === 'item_counter_shield' && choices.friend) choices.friend._supportCounter = true;
        else if (ability === 'item_hara_shield') installSingleLeaderDamageShield(owner);
        else if (ability === 'item_heal_ring' && choices.friend) choices.friend._supportRegen = true;
        else if (ability === 'item_crown') { battle._supportCrownSide = isPlayer ? 'player' : 'cpu'; battle._supportCrownSkills = []; if (battle.personSkillUsed) battle.personSkillUsed[isPlayer ? 'player' : 'cpu'] = false; }
        else if (ability === 'item_eternal_watch' && !owner._supportWatchUsed) { owner._supportWatchUsed = true; owner._supportExtraTurn = true; }
        else if (ability === 'item_phantom_pack' && choices.phantomMasterId) { const phantom = makeRuntimeCard(choices.phantomMasterId); if (phantom) owner.hand.push(phantom); }
        owner.field = owner.field.filter(entry => entry && !entry.isDead);
        enemy.field = enemy.field.filter(entry => entry && !entry.isDead);
    }

    function finishExpansionSupport(card, owner) {
        card.isDead = true;
        if (!owner.graveyard) owner.graveyard = [];
        if (!owner.graveyard.includes(card)) owner.graveyard.push(card);
        if (card._supportBanishAfterUse) { removeOne(owner.graveyard, card); card._supportBanished = true; delete card._supportBanishAfterUse; }
        delete card._supportFreeOnce; delete card._supportBounceTax; delete card._supportRunDiscount;
        if (owner._supportStrategyTax && cardTypeGroup(card) === owner._supportStrategyTax.type) delete owner._supportStrategyTax;
    }

    async function playSingleExpansion(handIndex) {
        const battle = window.TCG_BATTLE; if (!battle || battle.isEnemyTurn || battle.isAnimating || battle.selectedAttackerIndex !== -1) return;
        const owner = battle.player; const card = owner.hand[handIndex]; if (!card) return;
        const cost = window.getActualCost(owner, card);
        if (owner.currentMana < cost) { window.showBattleMessage(`マナが足りません！（必要:${cost}）`, true); return; }
        if (card.type === 'action' && owner.actionUsed) { window.showBattleMessage('アクションカードは1ターンに1回までです。', true); return; }
        const choices = await prepareSingleChoices(card);
        if (choices === null) { window.showBattleMessage(`${card.name}を使える対象がありません。`, true); return; }
        if (!owner.hand.includes(card) || battle.isEnemyTurn) return;
        battle.isAnimating = true;
        await new Promise(resolve => {
            if (typeof window.animateCardPlay === 'function') window.animateCardPlay(card, true, resolve); else resolve();
        });
        owner.currentMana -= cost; if (card.type === 'action') owner.actionUsed = true;
        removeOne(owner.hand, card); resolveSingleEffect(card, choices, true); finishExpansionSupport(card, owner);
        battle.isAnimating = false; battle.selectedHandCardIndex = -1;
        if (typeof window.showBattleMessage === 'function') window.showBattleMessage(`🪄 ${card.name} を発動！`, false, 1800);
        if (typeof window.renderBattleBoard === 'function') window.renderBattleBoard();
    }

    if (typeof window.executeSupportCard === 'function') {
        const previousExecuteSupport = window.executeSupportCard;
        window.executeSupportCard = function (card, targetCard, isPlayer) {
            if (!isExpansionCard(card)) {
                const result = previousExecuteSupport.apply(this, arguments);
                const sides = window.TCG_BATTLE && singleSides(!!isPlayer);
                if (sides && card && card._supportBanishAfterUse) finishExpansionSupport(card, sides.owner);
                return result;
            }
            const sides = singleSides(!!isPlayer);
            resolveSingleEffect(card, autoSingleChoices(card, !!isPlayer), !!isPlayer);
            finishExpansionSupport(card, sides.owner);
            if (typeof window.showBattleMessage === 'function') window.showBattleMessage(`🪄 ${card.name} を発動！`, false, 1800, !isPlayer);
            if (typeof window.renderBattleBoard === 'function') window.renderBattleBoard();
        };
    }

    if (typeof window.playCard === 'function') {
        const previousPlayCard = window.playCard;
        window.playCard = function (handIndex) {
            const battle = window.TCG_BATTLE; const owner = battle && battle.player; const card = owner && owner.hand[handIndex];
            if (card && isExpansionCard(card)) return playSingleExpansion(handIndex);
            const watched = card; const taxMatched = owner && owner._supportStrategyTax && cardTypeGroup(card) === owner._supportStrategyTax.type;
            const result = previousPlayCard.apply(this, arguments);
            if (watched) setTimeout(() => {
                if (!owner.hand.includes(watched)) {
                    if (taxMatched) delete owner._supportStrategyTax;
                    if (watched._supportBanishAfterUse && owner.graveyard && owner.graveyard.includes(watched)) finishExpansionSupport(watched, owner);
                    delete watched._supportBounceTax; delete watched._supportRunDiscount;
                }
            }, 1200);
            return result;
        };
    }
    if (typeof window.executeTCGMainAction === 'function') {
        const previousMainAction = window.executeTCGMainAction;
        window.executeTCGMainAction = async function (action) {
            const card = action && action.card;
            const side = action && action.side;
            const battle = window.TCG_BATTLE;
            const owner = battle && side && battle[side];
            const taxMatched = owner && owner._supportStrategyTax && cardTypeGroup(card) === owner._supportStrategyTax.type;
            const result = await previousMainAction.apply(this, arguments);
            if (result && taxMatched) delete owner._supportStrategyTax;
            if (result && card) { delete card._supportBounceTax; delete card._supportRunDiscount; }
            return result;
        };
    }

    if (typeof window.getTCGLegalGuardActions === 'function') {
        const previousGuardActions = window.getTCGLegalGuardActions;
        window.getTCGLegalGuardActions = function () {
            return (previousGuardActions.apply(this, arguments) || []).filter(action => !action.card || !action.card._supportEntangled);
        };
    }
    if (typeof window.selectPlayerCard === 'function') {
        const previousSelectPlayerCard = window.selectPlayerCard;
        window.selectPlayerCard = function (index) {
            const battle = window.TCG_BATTLE;
            const card = battle && battle.player && battle.player.field[index];
            const selectingAnotherEffect = battle && ((battle.targetingHandIndex !== undefined && battle.targetingHandIndex !== -1)
                || (battle.selectedHandCardIndex !== undefined && battle.selectedHandCardIndex !== -1)
                || (battle.personTargetingIndex !== undefined && battle.personTargetingIndex !== -1)
                || battle.isIntercepting);
            if (card && card._supportEntangled && !selectingAnotherEffect) {
                window.showBattleMessage(`${card.name}は網に捕らわれ、攻撃・守護参加ができません。`, true);
                return;
            }
            return previousSelectPlayerCard.apply(this, arguments);
        };
    }

    function processSingleTurnStart(side) {
        const battle = window.TCG_BATTLE; if (!battle) return;
        const owner = battle[side]; if (!owner) return;
        living(owner.field).slice().forEach(card => {
            if (card._supportProtected) delete card._supportProtected;
            if (card._supportRescuedDisabled) { delete card._supportRescuedDisabled; card.ability = card._supportAbilityBeforeRescue || masterOf(card)?.ability || ''; delete card._supportAbilityBeforeRescue; card.canAttack = true; }
            if (card._supportRegen) card.hp = Math.min(card.maxHp, card.hp + 10);
            if (card._supportSeedCard) {
                const replacement = card._supportSeedCard; removeOne(owner.field, card);
                replacement.isDead = false; replacement.hp = replacement.maxHp; replacement.canAttack = false; owner.field.push(replacement);
            }
        });
        owner.hand.forEach(card => { if (card._supportRunDiscount) delete card._supportRunDiscount; });
    }

    function processSingleTurnEnd(side) {
        const battle = window.TCG_BATTLE; if (!battle) return;
        const owner = battle[side]; if (!owner) return;
        living(owner.field).forEach(card => {
            if (card._supportEntangled) delete card._supportEntangled;
            if (card._supportSilencedAbility !== undefined) { card.ability = card._supportSilencedAbility; delete card._supportSilencedAbility; }
        });
        delete owner._supportStrategyTax;
        if (battle._supportCrownSide === side) { delete battle._supportCrownSide; delete battle._supportCrownSkills; }
    }

    if (typeof window.startPlayerTurn === 'function') {
        const previousStartPlayer = window.startPlayerTurn;
        window.startPlayerTurn = async function () { processSingleTurnStart('player'); return await previousStartPlayer.apply(this, arguments); };
    }
    if (typeof window.executeCPUTurn === 'function') {
        const previousCpuTurn = window.executeCPUTurn;
        window.executeCPUTurn = async function () {
            processSingleTurnStart('cpu');
            const result = await previousCpuTurn.apply(this, arguments);
            processSingleTurnEnd('cpu');
            return result;
        };
    }
    if (typeof window.executeRealEndTurn === 'function') {
        const previousRealEndTurn = window.executeRealEndTurn;
        window.executeRealEndTurn = function () {
            const battle = window.TCG_BATTLE; const owner = battle && battle.player;
            processSingleTurnEnd('player');
            if (owner && owner._supportExtraTurn) {
                delete owner._supportExtraTurn;
                battle.selectedAttackerIndex = -1; battle.selectedHandCardIndex = -1; battle.isEnemyTurn = false;
                owner.actionUsed = false; owner.currentMana = 3;
                if (battle.personSkillUsed) battle.personSkillUsed.player = false;
                living(owner.field).forEach(card => { card.canAttack = !card._supportEntangled && !card._supportRescuedDisabled; card._has_attacked_once = false; card._doubleStrikeUsed = false; });
                if (typeof window.showTurnCutin === 'function') window.showTurnCutin('EXTRA TURN', '#FFD54F', () => { battle.isAnimating = false; window.renderBattleBoard(); });
                return;
            }
            return previousRealEndTurn.apply(this, arguments);
        };
    }

    if (typeof window.executeAttack === 'function') {
        const previousAttack = window.executeAttack;
        window.executeAttack = async function (targetType, targetIndex) {
            const battle = window.TCG_BATTLE;
            if (!battle) return previousAttack.apply(this, arguments);
            const attackerOwner = battle.isEnemyTurn ? battle.cpu : battle.player;
            const defenderOwner = battle.isEnemyTurn ? battle.player : battle.cpu;
            const attacker = attackerOwner.field[battle.selectedAttackerIndex];
            if (attacker && ['support_wall_guard', 'support_seed_wait'].includes(attacker.ability)) { battle.selectedAttackerIndex = -1; window.showBattleMessage(`${attacker.name}は攻撃できません。`, true); window.renderBattleBoard(); return; }
            if (attacker && attacker._supportEntangled) { battle.selectedAttackerIndex = -1; window.showBattleMessage(`${attacker.name}は網に捕らわれている！`, true); window.renderBattleBoard(); return; }
            if (attacker && attacker._supportConfused) {
                delete attacker._supportConfused;
                const options = living(defenderOwner.field).map((_, index) => ({ type: 'card', index })).concat([{ type: battle.isEnemyTurn ? 'player' : 'cpu', index: 0 }]);
                const picked = randomOne(options); if (picked) { targetType = picked.type; targetIndex = picked.index; }
            }
            const defender = targetType === 'card' ? defenderOwner.field[targetIndex] : null;
            let originalAbility;
            if (defender && defender._supportCounter && defender.ability !== 'counter_attack') { originalAbility = defender.ability; defender.ability = 'counter_attack'; }
            try { return await previousAttack.call(this, targetType, targetIndex); }
            finally { if (defender && originalAbility !== undefined) defender.ability = originalAbility; }
        };
    }

    if (typeof window.openPersonSkillTarget === 'function') {
        const previousOpenSkill = window.openPersonSkillTarget;
        window.openPersonSkillTarget = function (skillIndex) {
            const battle = window.TCG_BATTLE;
            if (battle && battle._supportCrownSide === 'player' && (battle._supportCrownSkills || []).includes(Number(skillIndex))) { window.showBattleMessage('王冠では同じ人物スキルを2回使えません。', true); return; }
            return previousOpenSkill.apply(this, arguments);
        };
    }
    if (typeof window.executePersonSkill === 'function') {
        const previousPersonSkill = window.executePersonSkill;
        window.executePersonSkill = function (skillIndex) {
            const battle = window.TCG_BATTLE; const side = battle && battle.isEnemyTurn ? 'cpu' : 'player';
            if (battle && battle._supportCrownSide === side && (battle._supportCrownSkills || []).includes(Number(skillIndex))) return false;
            const result = previousPersonSkill.apply(this, arguments);
            if (battle && battle._supportCrownSide === side) {
                const used = battle._supportCrownSkills || (battle._supportCrownSkills = []);
                if (!used.includes(Number(skillIndex))) used.push(Number(skillIndex));
                if (used.length < 2 && battle.personSkillUsed) battle.personSkillUsed[side] = false;
            }
            return result;
        };
    }

    // checkDeath 後に芽が破壊された場合、予約カードを山札の一番下へ戻す。
    if (typeof window.checkDeath === 'function') {
        const previousCheckDeath = window.checkDeath;
        window.checkDeath = function (card, owner) {
            const result = previousCheckDeath.apply(this, arguments);
            if (card && card.isDead && card._supportSeedCard && owner && owner.deck) { owner.deck.push(card._supportSeedCard); delete card._supportSeedCard; }
            return result;
        };
    }

    function tagCardById(battle, cardId) {
        if (!cardId || !battle) return null;
        for (const unit of Object.values(battle.actors || {})) {
            const found = [unit.person].concat(unit.hand || [], unit.deck || [], unit.field || [], unit.graveyard || []).find(card => card && card._tagId === cardId);
            if (found) return found;
        }
        return Object.values(battle.teams || {}).map(team => team.field).find(card => card && card._tagId === cardId) || null;
    }

    function tagActorById(battle, actorId) { return battle && battle.actors && battle.actors[actorId]; }

    function tagAutoChoices(ctx) {
        const unit = ctx.unit, card = ctx.card, enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        const friends = ctx.allTeamCards(unit.team, false); const foes = ctx.allTeamCards(enemyTeam, false);
        const result = {}, friend = friends[0], foe = foes[0];
        if (card.ability === 'action_study_filter') { result.pickId = unit.deck[0] && unit.deck[0]._tagId; result.bottomId = unit.hand[unit.hand.length - 1] && unit.hand[unit.hand.length - 1]._tagId || result.pickId; }
        else if (['action_running_bounce', 'action_tailor_protect', 'item_double_sword', 'item_counter_shield', 'item_heal_ring'].includes(card.ability)) result.friendId = friend && friend.card._tagId;
        else if (card.ability === 'action_strategy_tax') { const actor = ctx.teamActors(enemyTeam)[0]; result.actorId = actor && actor.id; result.type = actor && cardTypeGroup(actor.hand[0]) || 'monster'; }
        else if (card.ability === 'item_happy_seed') result.seedId = unit.deck.find(entry => isMonster(entry) && !entry.evolvesFrom && printedCost(entry) <= 3)?._tagId;
        else if (card.ability === 'action_cooking_swap_hp') { result.firstId = friends[0] && friends[0].card._tagId; result.secondId = friends[1] && friends[1].card._tagId; }
        else if (card.ability === 'action_mix_transfer') { result.friendId = friends.find(entry => entry.card.status)?.card._tagId; result.enemyId = foe && foe.card._tagId; }
        else if (card.ability === 'action_color_lineage') { result.friendId = friends.find(entry => !entry.card.evolvesFrom)?.card._tagId; result.lineage = possibleLineages()[0]?.value; }
        else if (['action_net_bind', 'item_plain_stone', 'item_confusion_scroll', 'item_seal_scroll', 'item_blow_wand'].includes(card.ability)) result.enemyId = foe && foe.card._tagId;
        else if (card.ability === 'action_synthesis_evolve') { const base = living(unit.field).find(entry => unit.hand.concat(unit.deck).some(evo => evo.evolvesFrom === entry.type || evo.evolvesFrom === entry._supportEvolutionType)); result.friendId = base && base._tagId; result.evolutionId = base && unit.hand.concat(unit.deck).find(evo => evo.evolvesFrom === base.type || evo.evolvesFrom === base._supportEvolutionType)?._tagId; }
        else if (card.ability === 'action_throw_item') { result.itemId = unit.hand.find(entry => entry !== card && entry.type === 'item')?._tagId; result.targetId = foe && foe.card._tagId || 'leader'; }
        else if (card.ability === 'action_rescue_revive') result.reviveId = unit.graveyard.find(entry => isMonster(entry) && printedCost(entry) <= 4)?._tagId;
        else if (card.ability === 'action_secret_recover') result.recoverId = unit.graveyard.find(entry => entry.type === 'action' && entry.masterId !== card.masterId)?._tagId;
        else if (card.ability === 'action_high_stakes' || card.ability === 'item_fire_dragon_wand') result.actorId = ctx.teamActors(enemyTeam)[0]?.id;
        else if (card.ability === 'item_swap_wand') { const first = friends.find(a => foes.some(b => printedCost(a.card) === printedCost(b.card))); result.friendId = first && first.card._tagId; result.enemyId = first && foes.find(b => printedCost(b.card) === printedCost(first.card))?.card._tagId; }
        else if (card.ability === 'item_phantom_pack') result.phantomMasterId = phantomCandidates(unit.deck.map(entry => entry.masterId))[0]?.[0];
        return result;
    }

    async function prepareTagChoices(ctx) {
        const unit = ctx.unit, card = ctx.card, enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        const friends = ctx.allTeamCards(unit.team, false), foes = ctx.allTeamCards(enemyTeam, false), result = {};
        const chooseEntry = (title, entries) => chooseOne(title, entries.map(entry => ({ value: entry.card._tagId, label: `${entry.actor ? entry.actor.name + '：' : ''}${cardLabel(entry.card)}` })));
        if (card.ability === 'action_build_wall' && unit.field.length >= 5) return null;
        if (card.ability === 'action_study_filter') {
            const top = unit.deck.slice(0, 3); result.pickId = await chooseOne('勉強：手札へ加えるカード', top.map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.pickId) return null;
            result.bottomId = await chooseOne('勉強：山札の一番下へ置くカード', unit.hand.concat(top.find(entry => entry._tagId === result.pickId)).filter(Boolean).map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.bottomId) return null;
        } else if (['action_running_bounce', 'action_tailor_protect', 'item_double_sword', 'item_counter_shield', 'item_heal_ring'].includes(card.ability)) { result.friendId = await chooseEntry(`${card.name}：味方を選択`, friends); if (!result.friendId) return null; }
        else if (card.ability === 'action_strategy_tax' || card.ability === 'action_high_stakes' || card.ability === 'item_fire_dragon_wand') {
            result.actorId = await chooseOne(`${card.name}：相手を選択`, ctx.teamActors(enemyTeam).map(actor => ({ value: actor.id, label: `${actor.name}（手札${actor.hand.length}・山札${actor.deck.length}）` }))); if (!result.actorId) return null;
            if (card.ability === 'action_strategy_tax') { const actor = tagActorById(ctx.battle, result.actorId); result.type = await chooseOne('作戦会議：封鎖する種別', ['monster', 'action', 'item', 'field', 'person'].map(value => ({ value, label: value === 'monster' ? 'モンスター' : ({ action: 'アクション', item: 'アイテム', field: 'フィールド', person: '人物' }[value]) })), `相手の手札：${actor.hand.map(entry => entry.name).join('、') || 'なし'}`); if (!result.type) return null; }
        } else if (card.ability === 'item_happy_seed') { if (unit.field.length >= 5) return null; const seeds = unit.deck.filter(entry => isMonster(entry) && !entry.evolvesFrom && printedCost(entry) <= 3); result.seedId = await chooseOne('しあわせの種：育てるカード', seeds.map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.seedId) return null; }
        else if (card.ability === 'action_cooking_swap_hp') { result.firstId = await chooseEntry('料理：1体目', friends); if (!result.firstId) return null; result.secondId = await chooseEntry('料理：2体目', friends.filter(entry => entry.card._tagId !== result.firstId)); if (!result.secondId) return null; }
        else if (card.ability === 'action_mix_transfer') { result.friendId = await chooseEntry('調合：状態異常を取り出す味方', friends.filter(entry => entry.card.status)); if (!result.friendId) return null; result.enemyId = await chooseEntry('調合：状態異常を移す敵', foes); if (!result.enemyId) return null; }
        else if (card.ability === 'action_color_lineage') { result.friendId = await chooseEntry('カラーチェンジ：味方を選択', friends.filter(entry => !entry.card.evolvesFrom)); if (!result.friendId) return null; result.lineage = await chooseOne('追加する進化系統', possibleLineages()); if (!result.lineage) return null; }
        else if (['action_net_bind', 'item_plain_stone', 'item_confusion_scroll', 'item_seal_scroll'].includes(card.ability)) { result.enemyId = await chooseEntry(`${card.name}：敵を選択`, foes); if (!result.enemyId) return null; }
        else if (card.ability === 'action_synthesis_evolve') { const bases = living(unit.field).filter(base => unit.hand.concat(unit.deck).some(evo => evo.evolvesFrom === base.type || evo.evolvesFrom === base._supportEvolutionType)); result.friendId = await chooseOne('ごうせい：素材', bases.map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.friendId) return null; const base = tagCardById(ctx.battle, result.friendId); const evos = unit.hand.concat(unit.deck).filter(evo => evo.evolvesFrom === base.type || evo.evolvesFrom === base._supportEvolutionType); result.evolutionId = await chooseOne('ごうせい：進化先', evos.map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.evolutionId) return null; }
        else if (card.ability === 'action_throw_item') { result.itemId = await chooseOne('なげる：捨てるアイテム', unit.hand.filter(entry => entry !== card && entry.type === 'item').map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.itemId) return null; result.targetId = await chooseOne('なげる：対象', foes.map(entry => ({ value: entry.card._tagId, label: `${entry.actor.name}：${cardLabel(entry.card)}` })).concat([{ value: 'leader', label: '敵共有リーダー' }])); if (!result.targetId) return null; }
        else if (card.ability === 'action_rescue_revive') { if (unit.field.length >= 5) return null; result.reviveId = await chooseOne('救助：蘇生するカード', unit.graveyard.filter(entry => isMonster(entry) && printedCost(entry) <= 4).map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.reviveId) return null; }
        else if (card.ability === 'action_secret_recover') { result.recoverId = await chooseOne('秘伝書の執筆：継承するカード', unit.graveyard.filter(entry => entry.type === 'action' && entry.masterId !== card.masterId).map(value => ({ value: value._tagId, label: cardLabel(value) }))); if (!result.recoverId) return null; }
        else if (card.ability === 'item_swap_wand') { const eligible = friends.filter(a => foes.some(b => printedCost(a.card) === printedCost(b.card))); result.friendId = await chooseEntry('場所替え：味方', eligible); if (!result.friendId) return null; const friend = tagCardById(ctx.battle, result.friendId); result.enemyId = await chooseEntry('場所替え：敵', foes.filter(entry => printedCost(entry.card) === printedCost(friend))); if (!result.enemyId) return null; }
        else if (card.ability === 'item_blow_wand') { result.enemyId = await chooseEntry('吹き飛ばし：敵', foes.filter(entry => printedCost(entry.card) <= 4)); if (!result.enemyId) return null; }
        else if (card.ability === 'item_phantom_pack') { const pool = phantomCandidates(unit.deck.map(entry => entry.masterId)).sort(() => Math.random() - 0.5).slice(0, 3); result.phantomMasterId = await chooseOne('幻影のカードパック：1枚を選択', pool.map(([value, master]) => ({ value, label: `${master.name}（${master.baseCost}M）` }))); if (!result.phantomMasterId) return null; }
        return result;
    }

    async function resolveTagEffect(ctx) {
        const { card, unit, battle } = ctx, h = ctx.helpers, choices = ctx.choices || tagAutoChoices(ctx), enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        const find = id => tagCardById(battle, id); const owner = target => h.ownerOf(target); const friend = find(choices.friendId); const enemy = find(choices.enemyId);
        const ability = card.ability;
        if (ability === 'action_study_filter') { const pick = find(choices.pickId), bottom = find(choices.bottomId); if (pick) { removeOne(unit.deck, pick); unit.hand.push(pick); } if (bottom) { removeOne(unit.hand, bottom); unit.deck.push(bottom); } }
        else if (ability === 'action_running_bounce' && friend) { const targetOwner = owner(friend); removeOne(targetOwner.field, friend); friend.isDead = false; friend.canAttack = false; friend._supportRunDiscount = true; targetOwner.hand.push(friend); }
        else if (ability === 'action_strategy_tax') { const targetActor = tagActorById(battle, choices.actorId); if (targetActor) targetActor._supportStrategyTax = { type: choices.type || 'monster' }; }
        else if (ability === 'action_build_wall' && unit.field.length < 5) { const wall = makeRuntimeCard('support_token_wall', unit.id, true); wall.isDefending = true; wall.hasPermanentTaunt = true; unit.field.push(wall); }
        else if (ability === 'action_cooking_swap_hp') { const a = find(choices.firstId), b = find(choices.secondId); if (a && b) { const hp = a.hp; a.hp = Math.min(a.maxHp, b.hp); b.hp = Math.min(b.maxHp, hp); } }
        else if (ability === 'action_mix_transfer' && friend && enemy) { enemy.status = friend.status; friend.status = null; }
        else if (ability === 'action_tailor_protect' && friend) friend._supportProtected = true;
        else if (ability === 'action_color_lineage' && friend) friend._supportEvolutionType = choices.lineage;
        else if (ability === 'action_net_bind' && enemy) { enemy._supportEntangled = true; enemy.canAttack = false; enemy.isDefending = false; }
        else if (ability === 'action_synthesis_evolve') { const base = find(choices.friendId), evo = find(choices.evolutionId); if (base && evo) { await h.destroyCard(base, unit, 'sacrifice'); removeOne(unit.hand, evo); removeOne(unit.deck, evo); evo.isDead = false; evo.hp = evo.maxHp; evo.canAttack = false; unit.field.push(evo); } }
        else if (ability === 'action_throw_item') { const item = find(choices.itemId); if (item) { removeOne(unit.hand, item); item.isDead = true; unit.graveyard.push(item); const damage = 20 + printedCost(item) * 10; if (choices.targetId === 'leader') h.damageTeam(enemyTeam, damage); else { const target = find(choices.targetId); if (target) await h.dealCardDamage(target, damage, unit, { noEvasion: true }); } } }
        else if (ability === 'action_dishwash_reset') h.allTeamCards('player', false).concat(h.allTeamCards('enemy', false)).forEach(entry => resetCardToPrinted(entry.card));
        else if (ability === 'action_rescue_revive') { const revive = find(choices.reviveId); if (revive && unit.field.length < 5) { removeOne(unit.graveyard, revive); revive.isDead = false; revive.hp = 1; revive.canAttack = false; revive._supportRescuedDisabled = true; revive._supportAbilityBeforeRescue = revive.ability; revive.ability = ''; unit.field.push(revive); } }
        else if (ability === 'action_secret_recover') { const recover = find(choices.recoverId); if (recover) { removeOne(unit.graveyard, recover); recover.isDead = false; recover._supportFreeOnce = true; recover._supportBanishAfterUse = true; unit.hand.push(recover); } }
        else if (ability === 'action_high_stakes') { const rival = tagActorById(battle, choices.actorId), own = unit.deck.shift(), other = rival && rival.deck.shift(); if (own && other) { if (printedCost(own) >= printedCost(other)) unit.hand.push(own); else { own.isDead = true; unit.graveyard.push(own); } if (printedCost(other) >= printedCost(own)) rival.hand.push(other); else { other.isDead = true; rival.graveyard.push(other); } } else { if (own) unit.hand.push(own); if (other) rival.hand.push(other); } }
        else if (ability === 'item_plain_stone' && enemy) await h.dealCardDamage(enemy, 10, unit, { noEvasion: true });
        else if (ability === 'item_big_bread') { const team = battle.teams[unit.team]; team.maxHp += 30; h.healTeam(unit.team, 30); }
        else if (ability === 'item_happy_seed') { const seed = find(choices.seedId); if (seed && unit.field.length < 5) { removeOne(unit.deck, seed); const sprout = makeRuntimeCard('support_token_sprout', unit.id, true); sprout._supportSeedCard = seed; unit.field.push(sprout); } }
        else if (ability === 'item_confusion_scroll' && enemy) enemy._supportConfused = true;
        else if (ability === 'item_seal_scroll' && enemy && enemy._supportSilencedAbility === undefined) { enemy._supportSilencedAbility = enemy.ability; enemy.ability = ''; }
        else if (ability === 'item_fire_dragon_wand') { const rival = tagActorById(battle, choices.actorId); if (rival) for (const target of living(rival.field).slice()) await h.dealCardDamage(target, 30, unit, { noEvasion: true }); h.damageTeam(enemyTeam, 20); }
        else if (ability === 'item_swap_wand' && friend && enemy) { const friendOwner = owner(friend), enemyOwner = owner(enemy), fi = friendOwner.field.indexOf(friend), ei = enemyOwner.field.indexOf(enemy); if (fi >= 0 && ei >= 0) { friendOwner.field[fi] = enemy; enemyOwner.field[ei] = friend; friend.canAttack = false; enemy.canAttack = false; } }
        else if (ability === 'item_blow_wand' && enemy && !enemy._supportProtected) { const targetOwner = owner(enemy); removeOne(targetOwner.field, enemy); enemy.isDead = false; enemy.canAttack = false; enemy._supportBounceTax = true; targetOwner.hand.push(enemy); }
        else if (ability === 'item_double_sword' && friend) friend.hasDoubleStrike = true;
        else if (ability === 'item_counter_shield' && friend) friend._supportCounter = true;
        else if (ability === 'item_hara_shield') battle.teams[unit.team]._supportHaraShield = true;
        else if (ability === 'item_heal_ring' && friend) friend._supportRegen = true;
        else if (ability === 'item_crown') { unit._supportCrownSkills = []; unit.personSkillUsed = false; }
        else if (ability === 'item_eternal_watch' && !unit._supportWatchUsed) { unit._supportWatchUsed = true; unit._supportExtraTurn = true; }
        else if (ability === 'item_phantom_pack' && choices.phantomMasterId) { const phantom = makeRuntimeCard(choices.phantomMasterId, unit.id, true); if (phantom) unit.hand.push(phantom); }
        if (unit._supportStrategyTax && cardTypeGroup(card) === unit._supportStrategyTax.type) delete unit._supportStrategyTax;
        if (card._supportBanishAfterUse) { card._supportBanishAfterUse = false; card._supportBanishOnGrave = true; }
        delete card._supportFreeOnce; delete card._supportBounceTax; delete card._supportRunDiscount;
        return true;
    }

    function onTagTurnStart(ctx) {
        const unit = ctx.unit, h = ctx.helpers;
        living(unit.field).slice().forEach(card => {
            delete card._supportProtected;
            if (card._supportRescuedDisabled) { delete card._supportRescuedDisabled; card.ability = card._supportAbilityBeforeRescue || masterOf(card)?.ability || ''; delete card._supportAbilityBeforeRescue; card.canAttack = true; }
            if (card._supportRegen) h.healCard(card, 10);
            if (card._supportSeedCard) { const seed = card._supportSeedCard; removeOne(unit.field, card); seed.isDead = false; seed.hp = seed.maxHp; seed.canAttack = false; unit.field.push(seed); }
        });
        unit.hand.forEach(card => delete card._supportRunDiscount);
    }

    function onTagTurnEnd(ctx) {
        const unit = ctx.unit;
        living(unit.field).forEach(card => {
            delete card._supportEntangled;
            if (card._supportSilencedAbility !== undefined) { card.ability = card._supportSilencedAbility; delete card._supportSilencedAbility; }
        });
        delete unit._supportStrategyTax; delete unit._supportCrownSkills;
    }

    window.TCG_SUPPORT_EXPANSION = {
        key: EXPANSION_KEY,
        isExpansionCard,
        adjustCost: adjustedSupportCost,
        prepareTagChoices,
        autoTagChoices: tagAutoChoices,
        resolveTagEffect,
        resetCardToPrinted,
        onTagTurnStart,
        onTagTurnEnd,
        beforeTagTeamDamage(team, amount) {
            let damage = Math.max(0, Math.floor(Number(amount) || 0));
            if (team && team._supportHaraShield) { damage = Math.ceil(damage / 2); delete team._supportHaraShield; }
            return damage;
        },
        preventTagDestroy(card, reason) { return !!(card && card._supportProtected && !['damage', 'combat', 'sacrifice', 'evolve', 'replace'].includes(reason)); },
        preventTagBounce(card) { return !!(card && card._supportProtected); },
        redirectTagConfusedAttack(ctx) {
            if (!ctx.card || !ctx.card._supportConfused) return ctx.target;
            delete ctx.card._supportConfused;
            return randomOne(ctx.legalTargets()) || ctx.target;
        },
        onTagCardDestroyed(card, originalOwner) {
            if (card && card._supportSeedCard && originalOwner) { originalOwner.deck.push(card._supportSeedCard); delete card._supportSeedCard; }
            if (card && card._supportBanishOnGrave && originalOwner) { removeOne(originalOwner.graveyard, card); card._supportBanished = true; delete card._supportBanishOnGrave; }
        },
        afterTagPersonSkill(unit, index) {
            if (!unit || !Array.isArray(unit._supportCrownSkills)) return;
            if (!unit._supportCrownSkills.includes(Number(index))) unit._supportCrownSkills.push(Number(index));
            if (unit._supportCrownSkills.length < 2) unit.personSkillUsed = false;
        },
        canUseTagPersonSkill(unit, index) { return !(unit && Array.isArray(unit._supportCrownSkills) && unit._supportCrownSkills.includes(Number(index))); },
        consumeTagExtraTurn(unit) { if (!unit || !unit._supportExtraTurn) return false; delete unit._supportExtraTurn; return true; },
        addTagBadges(card, badges) {
            if (card && card._supportProtected) badges.push('🧵');
            if (card && card._supportEntangled) badges.push('🕸');
            if (card && card._supportRegen) badges.push('💍');
            return badges;
        }
    };

    console.log('🃏 support_card2 / support_card3：追加サポートカード30枚を読み込みました。');
})();
