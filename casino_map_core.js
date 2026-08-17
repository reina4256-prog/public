// ==========================================
// カジノ屋内マップ・ディーラー職 共通基盤
// ==========================================
(function () {
    'use strict';

    const CASINO_MATERIALS = ['mat_casino_1', 'mat_casino_2', 'mat_casino_3'];
    const CASINO_GAMES = ['poker', 'daifugo', 'tcg'];
    const CASINO_STAT_GAMES = ['poker', 'daifugo', 'indianPoker', 'texasHoldem', 'tcg', 'slot'];
    const CASINO_GAME_META = {
        poker: { name: '5カードドロー', shortName: 'ポーカー', icon: '♠' },
        daifugo: { name: '大富豪', shortName: '大富豪', icon: '♣' },
        indianPoker: { name: 'インディアンポーカー', shortName: 'インディアン', icon: '♦' },
        texasHoldem: { name: 'テキサスホールデム', shortName: 'ホールデム', icon: '♥' },
        tcg: { name: 'TCGバトル', shortName: 'TCG', icon: '✦' },
        slot: { name: 'スロット', shortName: 'スロット', icon: '7' }
    };
    const CASINO_TRUMP_GAME_CATALOG = {
        indianPoker: {
            menuId: 'indian_poker',
            name: 'インディアンポーカー',
            icon: '♦',
            price: 100,
            desc: '2～4人で遊ぶ、自分の札だけが見えない読み合いのゲーム。'
        },
        texasHoldem: {
            menuId: 'texas_holdem',
            name: 'テキサスホールデム',
            icon: '♥',
            price: 100,
            desc: '5～8人で遊ぶ、手札2枚と共通札5枚を使うポーカー。'
        }
    };

    window.CASINO_MATERIALS = CASINO_MATERIALS.slice();
    window.CASINO_RANK9_GAMES = CASINO_GAMES.slice();
    window.CASINO_STAT_GAMES = CASINO_STAT_GAMES.slice();
    window.CASINO_GAME_META = Object.assign({}, CASINO_GAME_META);
    window.CASINO_TRUMP_GAME_CATALOG = Object.assign({}, CASINO_TRUMP_GAME_CATALOG);

    window.playCasinoGameBGM = function (type, options) {
        if (!type || !window.audioManager || typeof window.audioManager.playBGM !== 'function') return;
        window.audioManager.playBGM(type, options);
    };

    window.restoreCasinoLobbyBGM = function () {
        if (!window.casinoMapOpen) return;
        window.playCasinoGameBGM('card_lobby');
    };

    function itemId(item) {
        if (typeof window.getInventoryItemId === 'function') return window.getInventoryItemId(item);
        return typeof item === 'string' ? item : (item && item.id);
    }

    function getAssets() {
        try {
            return typeof assets !== 'undefined' && assets ? assets : {};
        } catch (e) {
            return {};
        }
    }

    window.getCasinoAsset = function () {
        return Object.values(getAssets()).find(asset => asset && asset.type === 'casino') || null;
    };

    window.hasBuiltCasino = function () {
        return !!window.getCasinoAsset();
    };

    window.ensureDealerCasinoState = function (hero) {
        hero = hero || window.aiPet;
        if (!hero) return null;
        if (!Number.isFinite(Number(hero.casinoCoins))) hero.casinoCoins = 0;
        hero.casinoCoins = Math.max(0, Math.floor(Number(hero.casinoCoins) || 0));
        if (!hero.dealerProgress || typeof hero.dealerProgress !== 'object') hero.dealerProgress = {};
        const progress = hero.dealerProgress;
        if (!progress.purchasedTrumpDecks || typeof progress.purchasedTrumpDecks !== 'object') progress.purchasedTrumpDecks = {};
        if (!progress.purchasedTrumpGames || typeof progress.purchasedTrumpGames !== 'object' || Array.isArray(progress.purchasedTrumpGames)) progress.purchasedTrumpGames = {};
        Object.keys(CASINO_TRUMP_GAME_CATALOG).forEach(game => {
            const purchase = progress.purchasedTrumpGames[game];
            if (purchase === true) progress.purchasedTrumpGames[game] = { purchasedAt: 0 };
            else if (!purchase || typeof purchase !== 'object') delete progress.purchasedTrumpGames[game];
        });
        if (!progress.purchasedCasinoEquipment || typeof progress.purchasedCasinoEquipment !== 'object') progress.purchasedCasinoEquipment = {};
        ['slot_machine', 'poker_table', 'tcg_table', 'casino_chair'].forEach(type => {
            progress.purchasedCasinoEquipment[type] = Math.max(0, Math.floor(Number(progress.purchasedCasinoEquipment[type]) || 0));
        });
        ['neon_sign', 'lounge_sofa', 'coin_monument'].forEach(type => {
            delete progress.purchasedCasinoEquipment[type];
        });
        if (!progress.stats || typeof progress.stats !== 'object') progress.stats = {};
        CASINO_STAT_GAMES.forEach(game => {
            if (!progress.stats[game] || typeof progress.stats[game] !== 'object') {
                progress.stats[game] = { plays: 0, wins: 0, losses: 0, draws: 0, netCoins: 0 };
            }
            const stats = progress.stats[game];
            ['plays', 'wins', 'losses', 'draws'].forEach(key => {
                stats[key] = Math.max(0, Math.floor(Number(stats[key]) || 0));
            });
            stats.plays = Math.max(stats.plays, stats.wins + stats.losses + stats.draws);
            stats.netCoins = Number(stats.netCoins) || 0;
            if (!stats.opponents || typeof stats.opponents !== 'object' || Array.isArray(stats.opponents)) stats.opponents = {};
            Object.keys(stats.opponents).forEach(key => {
                const opponent = stats.opponents[key];
                if (!opponent || typeof opponent !== 'object') {
                    delete stats.opponents[key];
                    return;
                }
                ['plays', 'wins', 'losses', 'draws'].forEach(counter => {
                    opponent[counter] = Math.max(0, Math.floor(Number(opponent[counter]) || 0));
                });
                opponent.plays = Math.max(opponent.plays, opponent.wins + opponent.losses + opponent.draws);
            });
            if (game === 'tcg') {
                if (!stats.modes || typeof stats.modes !== 'object' || Array.isArray(stats.modes)) stats.modes = {};
                ['single', 'tag'].forEach(mode => {
                    if (!stats.modes[mode] || typeof stats.modes[mode] !== 'object') stats.modes[mode] = {};
                    const record = stats.modes[mode];
                    ['plays', 'wins', 'losses', 'draws'].forEach(counter => {
                        record[counter] = Math.max(0, Math.floor(Number(record[counter]) || 0));
                    });
                    record.plays = Math.max(record.plays, record.wins + record.losses + record.draws);
                });
                const modeTotals = ['single', 'tag'].reduce((sum, mode) => {
                    const record = stats.modes[mode];
                    sum.plays += record.plays; sum.wins += record.wins; sum.losses += record.losses; sum.draws += record.draws;
                    return sum;
                }, { plays: 0, wins: 0, losses: 0, draws: 0 });
                if (modeTotals.plays < stats.plays) {
                    const legacySingle = stats.modes.single;
                    legacySingle.wins += Math.max(0, stats.wins - modeTotals.wins);
                    legacySingle.losses += Math.max(0, stats.losses - modeTotals.losses);
                    legacySingle.draws += Math.max(0, stats.draws - modeTotals.draws);
                    legacySingle.plays += stats.plays - modeTotals.plays;
                    legacySingle.plays = Math.max(legacySingle.plays, legacySingle.wins + legacySingle.losses + legacySingle.draws);
                }
                if (!stats.partners || typeof stats.partners !== 'object' || Array.isArray(stats.partners)) stats.partners = {};
                Object.keys(stats.partners).forEach(key => {
                    const partner = stats.partners[key];
                    if (!partner || typeof partner !== 'object') { delete stats.partners[key]; return; }
                    ['plays', 'wins', 'losses', 'draws'].forEach(counter => {
                        partner[counter] = Math.max(0, Math.floor(Number(partner[counter]) || 0));
                    });
                    partner.plays = Math.max(partner.plays, partner.wins + partner.losses + partner.draws);
                });
                if (!stats.pvp || typeof stats.pvp !== 'object' || Array.isArray(stats.pvp)) stats.pvp = {};
                ['single', 'tag'].forEach(mode => {
                    if (!stats.pvp[mode] || typeof stats.pvp[mode] !== 'object') stats.pvp[mode] = {};
                    const record = stats.pvp[mode];
                    ['plays', 'wins', 'losses', 'draws'].forEach(counter => {
                        record[counter] = Math.max(0, Math.floor(Number(record[counter]) || 0));
                    });
                    record.plays = Math.max(record.plays, record.wins + record.losses + record.draws);
                });
            }
        });
        progress.casinoRecordVersion = 2;
        if (!progress.rank9Wins || typeof progress.rank9Wins !== 'object') {
            progress.rank9Wins = { poker: 0, daifugo: 0, tcg: 0 };
        }
        if (!Array.isArray(progress.visitorMasterHistory)) progress.visitorMasterHistory = [];
        const apprentice = hero.apprentice || {};
        const knownMasters = new Set(progress.visitorMasterHistory);
        (apprentice.metMasters || []).forEach(masterType => knownMasters.add(masterType));
        Object.keys(apprentice.rank || {}).forEach(masterType => {
            if (Number(apprentice.rank[masterType]) > 0) knownMasters.add(masterType);
        });
        Object.keys(apprentice.retired || {}).forEach(masterType => {
            if (apprentice.retired[masterType]) knownMasters.add(masterType);
        });
        progress.visitorMasterHistory = [...knownMasters];
        return progress;
    };

    window.hasPurchasedCasinoTrumpGame = function (game, hero) {
        const progress = window.ensureDealerCasinoState(hero || window.aiPet);
        return !!(progress && progress.purchasedTrumpGames && progress.purchasedTrumpGames[game]);
    };

    window.isCasinoRecordUnlocked = function (hero) {
        hero = hero || window.aiPet;
        const app = hero && hero.apprentice;
        return !!(app && (
            (app.rank && Number(app.rank.dealer) >= 10)
            || (app.retired && app.retired.dealer)
        ));
    };

    function containsItem(value, targetId, seen) {
        if (value == null) return false;
        if (itemId(value) === targetId) return true;
        if (typeof value !== 'object') return false;
        seen = seen || new WeakSet();
        if (seen.has(value)) return false;
        seen.add(value);
        if (Array.isArray(value)) return value.some(entry => containsItem(entry, targetId, seen));
        return Object.keys(value).some(key => {
            if (['img', 'image', 'sprite', 'src'].includes(key)) return false;
            return containsItem(value[key], targetId, seen);
        });
    }

    window.hasCasinoMaterialAnywhere = function (materialId) {
        if (!CASINO_MATERIALS.includes(materialId)) return false;
        const hero = window.aiPet;
        if (hero && containsItem(hero.inventory || [], materialId)) return true;
        return containsItem(getAssets(), materialId);
    };

    window.hasAllCasinoMaterials = function () {
        return CASINO_MATERIALS.every(id => window.hasCasinoMaterialAnywhere(id));
    };

    window.syncCasinoLegacyProgress = function () {
        const hero = window.aiPet;
        if (!hero) return null;
        window.ensureDealerCasinoState(hero);
        const built = window.hasBuiltCasino();
        const hasAnyMaterial = CASINO_MATERIALS.some(id => window.hasCasinoMaterialAnywhere(id));
        if (built || hasAnyMaterial) hero.casinoMaterialRumorHeard = true;
        if (built) hero.casinoRecipeUnlocked = true;
        return hero;
    };

    window.canReceiveCasinoMaterial = function (materialId) {
        if (!CASINO_MATERIALS.includes(materialId)) return false;
        const hero = window.syncCasinoLegacyProgress();
        if (!hero || !hero.casinoMaterialRumorHeard) return false;
        // 消費・破壊後は再取得できるが、手持ち・収納・マップ全体には同種を1個だけ存在させる。
        return !window.hasCasinoMaterialAnywhere(materialId);
    };

    function rectFor(asset) {
        const scale = Number(asset && asset.scale) || 0.5;
        const width = Math.max(1, (Number(asset && asset.sw) || 50) * scale);
        const height = Math.max(1, (Number(asset && asset.sh) || 50) * scale);
        return {
            left: Number(asset && asset.dx) || 0,
            top: Number(asset && asset.dy) || 0,
            right: (Number(asset && asset.dx) || 0) + width,
            bottom: (Number(asset && asset.dy) || 0) + height,
            width,
            height,
            cx: (Number(asset && asset.dx) || 0) + width / 2,
            cy: (Number(asset && asset.dy) || 0) + height / 2
        };
    }

    function bridgeComponents(bridges) {
        const adjacency = bridges.map(() => []);
        for (let i = 0; i < bridges.length; i++) {
            for (let j = i + 1; j < bridges.length; j++) {
                const a = bridges[i].rect;
                const b = bridges[j].rect;
                const gapX = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
                const gapY = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
                const centerDistance = Math.hypot(a.cx - b.cx, a.cy - b.cy);
                if ((gapX <= 18 && gapY <= 18) || centerDistance < 150) {
                    adjacency[i].push(j);
                    adjacency[j].push(i);
                }
            }
        }
        const components = [];
        const visited = new Set();
        bridges.forEach((bridge, start) => {
            if (visited.has(start)) return;
            const queue = [start];
            const component = [];
            visited.add(start);
            while (queue.length) {
                const index = queue.shift();
                component.push(bridges[index]);
                adjacency[index].forEach(next => {
                    if (!visited.has(next)) {
                        visited.add(next);
                        queue.push(next);
                    }
                });
            }
            components.push(component);
        });
        return components;
    }

    window.isCasinoBridgeRouteComplete = function () {
        const entries = Object.entries(getAssets());
        const waters = entries.filter(([, asset]) => asset && asset.type === 'water').map(([, asset]) => rectFor(asset));
        const bridges = entries.filter(([, asset]) => asset && asset.type === 'bridge').map(([id, asset]) => ({ id, asset, rect: rectFor(asset) }));
        if (waters.length === 0 || bridges.length < 2) return false;

        const waterBounds = waters.reduce((bounds, rect) => ({
            left: Math.min(bounds.left, rect.left),
            top: Math.min(bounds.top, rect.top),
            right: Math.max(bounds.right, rect.right),
            bottom: Math.max(bounds.bottom, rect.bottom)
        }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
        const horizontalRiver = (waterBounds.right - waterBounds.left) >= (waterBounds.bottom - waterBounds.top);
        const margin = 12;

        return bridgeComponents(bridges).some(component => {
            if (component.length < 2) return false;
            if (horizontalRiver) {
                const reachesNear = component.some(bridge => bridge.rect.top <= waterBounds.top + margin);
                const reachesFar = component.some(bridge => bridge.rect.bottom >= waterBounds.bottom - margin);
                return reachesNear && reachesFar;
            }
            const reachesNear = component.some(bridge => bridge.rect.left <= waterBounds.left + margin);
            const reachesFar = component.some(bridge => bridge.rect.right >= waterBounds.right - margin);
            return reachesNear && reachesFar;
        });
    };

    window.isDealerDeckBuildingUnlocked = function (hero) {
        hero = hero || window.aiPet;
        const app = hero && hero.apprentice;
        return !!(app && ((app.rank && Number(app.rank.dealer) >= 6) || (app.retired && app.retired.dealer)));
    };

    window.CASINO_MASTER_FAVORITE_GAMES = {
        explore: 'poker', farming: 'daifugo', fishing: 'poker', cooking: 'daifugo',
        building: 'poker', smithing: 'poker', pharmacist: 'tcg', hairdresser: 'daifugo',
        pastry_chef: 'daifugo', concierge: 'poker', tailor: 'tcg', dealer: 'all',
        fortune_teller: 'poker', scientist: 'tcg', salesperson: 'daifugo'
    };

    const CASINO_MASTER_PROFILES = {
        explore: {
            name: '冒険家', image: 'adventurer_battle_enemy.png',
            lines: {
                start: 'さあ、未知の勝負へ出発よ！　思い切って挑みなさい！',
                play: 'いい流れね。この先に逆転の道があるか、確かめてみましょう！',
                pass: '今は進まないのも立派な判断よ。次の好機を探すわ！',
                win: 'ふふん、今回の勝負も見事に踏破したわ！',
                loss: 'やるじゃない！　次はもっと険しい勝負に挑みましょう！',
                draw: '引き分けね。まだ見ぬ決着を探しに、もう一度よ！'
            }
        },
        farming: {
            name: '農家', image: 'farmer_battle_enemy.png',
            lines: {
                start: '慌てなくていいよ。札も作物も、育つ流れをよく見るんだ。',
                play: 'よし、この一手を蒔いておこう。実るかどうか楽しみだね。',
                pass: '今は土を休ませる番だ。次の巡りを待とう。',
                win: 'こつこつ積み重ねた分、いい実りになったね。',
                loss: '見事な収穫だよ。こちらも畑からやり直してみよう。',
                draw: 'どちらの畑も豊作だ。次の勝負で決めようか。'
            }
        },
        fishing: {
            name: '漁師', image: 'fisherman_battle_enemy.png',
            lines: {
                start: 'でっかい勝負を釣り上げようぜ！　糸を切らすなよ！',
                play: '食いついた！　この一手は逃がさねえぞ！',
                pass: '今は潮待ちだ。焦って竿を上げるこたぁねえ。',
                win: 'よっしゃ、大物だ！　今夜はこいつで祝おうぜ！',
                loss: '逃がしたか！　だが次の当たりはもっとでかいぜ！',
                draw: '同じ獲物を掛けたみてえだな。もう一投いこうぜ！'
            }
        },
        cooking: {
            name: '料理人', image: 'chef_battle_enemy.png',
            lines: {
                start: '勝負の火加減は任せろ！　最高の一皿に仕上げるぞ！',
                play: 'ここで一気に火を入れる！　この一手を味わいな！',
                pass: '今は寝かせる時間だ。焦げつかせるわけにはいかん！',
                win: '完成だ！　勝利の味は格別だろう！',
                loss: 'うまい！　今日の主役はお前の一皿だ！',
                draw: '甲乙つけがたい味だな。もう一皿、勝負だ！'
            }
        },
        building: {
            name: '建築士', image: 'builder_battle_enemy.png',
            lines: {
                start: '勝ち筋を組み立てよう。土台から一手ずつ確実に。',
                play: 'この一手で構造がつながる。完成形が見えてきた。',
                pass: '無理な増築は崩壊を招く。ここは待つべきだ。',
                win: '設計どおりだ。強い勝負には、強い骨組みがある。',
                loss: '見事な設計だ。次はその構造も計算に入れよう。',
                draw: '強度は互角か。次の図面で差をつけよう。'
            }
        },
        smithing: {
            name: '鍛冶師', image: 'smith_battle_enemy.png',
            lines: {
                start: '……札を構えろ。勝負で腕を鈍らせるな。',
                play: '……打つ。ここが勝負の芯だ。',
                pass: '……今は熱が足りん。待つ。',
                win: '……よく鍛えた一手だ。悪くない。',
                loss: '……見事だ。次は、さらに鍛え直す。',
                draw: '……刃は互角か。もう一度だ。'
            }
        },
        pharmacist: {
            name: '薬剤師', image: 'pharmacist_battle_enemy.png',
            lines: {
                start: '勝負もお薬も用量が大切です。どうぞ無理はなさらずに。',
                play: 'では、この一手を処方いたしましょう。効き目はすぐに出ますよ。',
                pass: '今は経過観察といたしましょう。焦りは禁物です。',
                win: 'ふふ、処方どおりの結果ですね。お大事になさってください。',
                loss: 'これはよく効きましたね。次は配合を変えてみましょう。',
                draw: '効能は同じようですね。もう一度、試してみましょうか。'
            }
        },
        hairdresser: {
            name: '美容師', image: 'hairdresser_battle_enemy.png',
            lines: {
                start: '今日の勝負、最高に盛っていこ〜♡　かわいく勝つよ！',
                play: 'ここで流れをアレンジ！　めっちゃいい感じじゃない？',
                pass: '今はあえて引き算ね。次の一手をもっと映えさせよっ♡',
                win: 'やった〜！　勝ってる私たち、超イケてる♡',
                loss: 'え〜っ、でも今の一手すっごく映えてた！　もう一回ね♡',
                draw: 'おそろいの結果じゃん♡　次はもっと派手に決めよ！'
            }
        },
        pastry_chef: {
            name: 'パティシエ', image: 'pastry_chef_battle_enemy.png',
            lines: {
                start: 'ボンソワール！　甘く華やかな勝負を始めようじゃないか！',
                play: 'ここで香りを重ねよう。逆転のデセールはこれからさ！',
                pass: '生地を休ませるように、今は静かに待つとしよう。',
                win: '甘美なフィナーレだ！　勝利の余韻を召し上がれ！',
                loss: 'ほろ苦さもまた一興。君の勝利に拍手を贈ろう！',
                draw: '同じ甘さに仕上がったね。次の一皿で決めよう！'
            }
        },
        concierge: {
            name: 'コンシェルジュ', image: 'concierge_battle_enemy.png',
            lines: {
                start: 'お席の準備は整っております。どうぞ、心ゆくまでお楽しみくださいませ。',
                play: 'こちらの一手をご用意いたしました。いかがでございましょう。',
                pass: 'ただいまは見送らせていただきます。次の機会をお待ちくださいませ。',
                win: 'お相手いただき、誠にありがとうございました。よい勝負でございました。',
                loss: 'お見事でございます。素晴らしい勝利を心よりお祝い申し上げます。',
                draw: '互角でございましたね。よろしければ、もう一勝負いかがでしょうか。'
            }
        },
        tailor: {
            name: '仕立屋', image: 'tailor_battle_enemy.png',
            lines: {
                start: 'ふふっ、素敵な勝負の物語を一手ずつ紡いでまいりましょう。',
                play: 'この一手を縫い合わせれば、流れがきれいにつながりそうです。',
                pass: 'ここは糸を休ませましょう。ほつれを急いではいけません。',
                win: 'きれいに仕立て上がりました。とても素敵な勝負でしたね。',
                loss: 'まあ、見事な仕上がりです。次は私も工夫いたしますね。',
                draw: '同じ模様になりましたね。続きを一緒に紡ぎましょう。'
            }
        },
        fortune_teller: {
            name: '占い師', image: 'fortune_teller_battle_enemy.png',
            lines: {
                start: '星々は静かに巡っています。けれど最後の一手を選ぶのは、あなたです。',
                play: '運命の糸が揺れました。この一手が未来を変えるでしょう。',
                pass: '今は星が沈む刻。次の巡りを待ちましょう。',
                win: 'この結末も星図のうち。ですが、とても美しい輝きでした。',
                loss: 'あなたが運命を書き換えましたね。見事でございます。',
                draw: '二つの未来が重なりました。次の星巡りで決めましょう。'
            }
        },
        scientist: {
            name: '科学者', image: 'scientist_battle_enemy.png',
            lines: {
                start: '対戦データの採取を開始するよ！　面白い仮説を見せてくれ！',
                play: 'この一手を投入！　さあ、盤面がどう反応するか観測しよう！',
                pass: 'サンプル不足だ。ここは追加データを待つのが合理的だね。',
                win: '仮説どおり！　いやあ、実に美しい結果だ！',
                loss: '予想外だ！　最高のデータをありがとう、再検証しよう！',
                draw: '数値は完全に一致した。条件を変えて再実験だ！'
            }
        },
        salesperson: {
            name: '販売員', image: 'merchant_battle_enemy.png',
            lines: {
                start: 'いらっしゃいませ！　本日のおすすめは、熱い真剣勝負でございます！',
                play: 'こちらの一手、今だけの大サービス！　お見逃しなく！',
                pass: 'ただいま入荷待ちでして。次の好機まで少々お待ちください！',
                win: '毎度ありがとうございます！　勝利までお買い上げいただきました！',
                loss: 'お見事です！　その勝ち筋、ぜひ仕入れさせてください！',
                draw: '同額査定ですね！　もう一勝負で価値を決めましょう！'
            }
        },
        dealer: {
            name: 'ディーラー', image: 'dealer_battle_enemy.png',
            lines: {
                start: 'ベットを確認したわ。さあ、テーブルでは運も実力のうちよ。',
                play: 'この一手で流れを変えるわ。あなたはどう返す？',
                pass: '今は降りるわ。勝負どころを見誤るほど甘くないの。',
                win: '今回はハウスの勝ちね。でも、次の挑戦を待っているわ。',
                loss: 'お見事。あなたの読みが一枚上だったわ。',
                draw: '互角ね。次のディールで決着をつけましょう。'
            }
        }
    };
    const CASINO_MASTER_TCG_LINES = {
        explore: {
            tcg_play: '新しい道を切り開くわ！　『{card}』を場に出す！',
            tcg_attack: '『{card}』、{target}へ突撃よ！　迷わず進みなさい！',
            tcg_damaged: '{damage}ダメージね……険しいほど、乗り越えがいがあるわ！',
            tcg_pinch: '崖っぷちね……でも、ここから見つかる道だってあるわ！',
            tcg_chance: '相手はもう息切れ寸前よ！　勝利まで一気に踏破するわ！'
        },
        farming: {
            tcg_play: 'この一枚を丁寧に育てよう。『{card}』を場に出すよ。',
            tcg_attack: '『{card}』、{target}へ行っておいで。今が実りの時だ。',
            tcg_damaged: '{damage}ダメージか。嵐のあとも、畑はまた芽吹くものだよ。',
            tcg_pinch: 'ずいぶん荒れた畑になったね……ここから手入れし直そう。',
            tcg_chance: '相手の実りが少なくなってきたね。収穫まであと少しだ。'
        },
        fishing: {
            tcg_play: 'いい獲物だ！　『{card}』を場へ放つぜ！',
            tcg_attack: '『{card}』、{target}に食らいつけ！　その当たりを逃がすな！',
            tcg_damaged: '{damage}ダメージか！　こいつは強烈な引きだぜ！',
            tcg_pinch: '糸が切れそうだ……だが、まだ竿は離さねえぞ！',
            tcg_chance: '相手が弱ってきたな！　今こそ一気に釣り上げるぜ！'
        },
        cooking: {
            tcg_play: '素材はこれだ！　『{card}』を場に出して仕上げるぞ！',
            tcg_attack: '『{card}』、{target}へ熱々の一撃をお見舞いしろ！',
            tcg_damaged: '{damage}ダメージだと！　強火すぎるが、まだ焦げちゃいない！',
            tcg_pinch: '火加減が危ないな……ここから立て直して最高の一皿にするぞ！',
            tcg_chance: '相手はもう煮詰まっている！　仕上げの一手を入れるぞ！'
        },
        building: {
            tcg_play: '次の構造材は『{card}』だ。盤面へ組み込もう。',
            tcg_attack: '『{card}』、{target}へ攻撃。弱点を正確に崩すんだ。',
            tcg_damaged: '{damage}ダメージを確認。損傷箇所を補強して立て直す。',
            tcg_pinch: '基礎まで揺らいでいる……だが、崩れる前に補強できる。',
            tcg_chance: '相手の構造は限界に近い。完成まで、あと一手だ。'
        },
        smithing: {
            tcg_play: '……『{card}』を打つ。場に出ろ。',
            tcg_attack: '……『{card}』、{target}を断て。',
            tcg_damaged: '……{damage}ダメージ。まだ、折れてはいない。',
            tcg_pinch: '……刃こぼれか。ここから鍛え直す。',
            tcg_chance: '……相手の刃が鈍った。仕留める。'
        },
        pharmacist: {
            tcg_play: 'こちらを処方いたします。『{card}』を場へ。',
            tcg_attack: '『{card}』、{target}へ投与いたします。少々刺激がございますよ。',
            tcg_damaged: '{damage}ダメージですね。症状を確認して、すぐ処置いたします。',
            tcg_pinch: '容体が思わしくありませんね……ですが、まだ治療法はございます。',
            tcg_chance: 'お相手はかなりお疲れのご様子です。決着の処方をいたしましょう。'
        },
        hairdresser: {
            tcg_play: '『{card}』をセット〜♡　盤面、めっちゃ映えてきたじゃん！',
            tcg_attack: '『{card}』、{target}を大胆にカットしちゃって〜♡',
            tcg_damaged: '{damage}ダメージ！？　ちょっと乱れたけど、すぐ直すから！',
            tcg_pinch: 'え、かなりヤバめ！？　ここから最高に盛り直すよ〜！',
            tcg_chance: '相手、もうクタクタじゃん！　フィニッシュまで可愛く決めよ♡'
        },
        pastry_chef: {
            tcg_play: '華やかな一枚を添えよう。『{card}』を場へ！',
            tcg_attack: '『{card}』、{target}へ甘く鋭い一撃を贈ろう！',
            tcg_damaged: '{damage}ダメージとは、なんともほろ苦いアクセントだね！',
            tcg_pinch: '崩れかけたデセールほど腕が鳴る。美しく立て直そう！',
            tcg_chance: 'フィナーレは近い！　相手へ最高の一皿を届けよう！'
        },
        concierge: {
            tcg_play: '『{card}』をご用意いたしました。どうぞ場へお進みくださいませ。',
            tcg_attack: '『{card}』、{target}へのお相手をお願いいたします。',
            tcg_damaged: '{damage}ダメージ、確かに承りました。まだ勝負は続いております。',
            tcg_pinch: '厳しい状況でございますね。最後まで最善のおもてなしを尽くします。',
            tcg_chance: 'お相手はお疲れのご様子です。決着まで丁寧にご案内いたします。'
        },
        tailor: {
            tcg_play: '『{card}』を盤面へ縫い合わせましょう。素敵な仕上がりです。',
            tcg_attack: '『{card}』、{target}へ針路を合わせてくださいませ。',
            tcg_damaged: '{damage}ダメージですか。少しほつれましたが、すぐに繕えます。',
            tcg_pinch: '生地が裂けそうですね……ここから丁寧に仕立て直しましょう。',
            tcg_chance: 'お相手の糸が細くなっています。物語を仕上げる時ですね。'
        },
        fortune_teller: {
            tcg_play: '星が『{card}』を示しました。運命の盤面へお進みなさい。',
            tcg_attack: '『{card}』、星の導きに従い{target}へ向かいなさい。',
            tcg_damaged: '{damage}ダメージ……星図が大きく揺らぎましたね。',
            tcg_pinch: '私の星が陰っています……けれど、未来はまだ一つではありません。',
            tcg_chance: 'お相手の星が弱まっています。決着の刻が近いようです。'
        },
        scientist: {
            tcg_play: '実験個体『{card}』を投入！　盤面反応を観測しよう！',
            tcg_attack: '『{card}』、{target}へ攻撃実験開始！　結果を記録するよ！',
            tcg_damaged: '{damage}ダメージを観測！　予想以上に興味深い出力だ！',
            tcg_pinch: '危険域に突入したね！　だからこそ逆転仮説を検証する価値がある！',
            tcg_chance: '相手HPが危険域だ！　決着条件を満たす実験へ移ろう！'
        },
        salesperson: {
            tcg_play: '本日のおすすめ『{card}』、ただいま場へ入荷いたしました！',
            tcg_attack: '『{card}』から{target}へ、特別攻撃をお届けいたします！',
            tcg_damaged: '{damage}ダメージ、確かに頂戴しました！　返品はいたしませんよ！',
            tcg_pinch: '在庫も体力も残りわずか！　ここから大逆転セールです！',
            tcg_chance: 'お相手のHPは残りわずか！　決着の品をおすすめいたします！'
        },
        dealer: {
            tcg_play: '『{card}』を場に出すわ。次の一手、読めるかしら？',
            tcg_attack: '『{card}』、{target}へベットよ。さあ、受けてみなさい。',
            tcg_damaged: '{damage}ダメージね。いい一撃だけど、勝負はまだ終わらないわ。',
            tcg_pinch: '追い詰められたわね……でも、最後の一枚まで勝負するわ。',
            tcg_chance: 'あなたのHPはもうわずか。ここでショーダウンといきましょう。'
        }
    };
    const CASINO_MASTER_TCG_ACTION_LINES = {
        explore: {
            tcg_summon: '新しい仲間を見つけたわ！　『{card}』、一緒に道を切り開くわよ！',
            tcg_evolve: '道は先へ続いているわ！　『{name}』から『{card}』へ進化よ！',
            tcg_person: '頼れる案内役の登場ね！　人物カード『{card}』を迎えるわ！',
            tcg_field: 'ここが次の探索地よ！　フィールド『{card}』を展開するわ！',
            tcg_action: '迷っている暇はないわ！　アクション『{card}』を実行よ！',
            tcg_support: '遠征の備えは万全よ！　サポート『{card}』を使うわ！',
            tcg_person_skill: '地形を読めば活路は見えるわ！　「{skill}」を使う！',
            tcg_person_interrupt: 'その一歩、待ちなさい！　「{skill}」で割り込むわ！',
            tcg_guard_prepare: '危険な道ほど備えが大切よ。『{card}』に守護を任せるわ！',
            tcg_guard_intercept: 'その道は通さないわ！　『{card}』が守護に入る！',
            tcg_turn_start: 'さあ、次のルートを探すわよ！　このターンも前進あるのみ！',
            tcg_turn_end: 'ここで野営よ。残したマナも、次の危険に備えておくわ！',
            tcg_trigger: '盤面が動いたわ。{effect}！　状況を見て次の道を探すわよ！'
        },
        farming: {
            tcg_summon: '元気な芽が出たね。『{card}』を盤面で育てよう。',
            tcg_evolve: 'よく育ったね。『{name}』から『{card}』へ、大きく実ったよ。',
            tcg_person: '手入れを手伝ってもらおう。人物カード『{card}』を迎えるよ。',
            tcg_field: 'まずは良い土からだ。フィールド『{card}』を広げよう。',
            tcg_action: '今が手入れの頃合いだね。アクション『{card}』を使うよ。',
            tcg_support: '必要な道具は揃えてあるよ。サポート『{card}』を使おう。',
            tcg_person_skill: '丁寧な手入れが実りにつながる。「{skill}」を使うよ。',
            tcg_person_interrupt: 'そのまま踏み込ませるわけにはいかないね。「{skill}」で止めよう。',
            tcg_guard_prepare: '嵐が来る前に支柱を立てよう。『{card}』に守護を頼むよ。',
            tcg_guard_intercept: '大事な畑は守らないとね。『{card}』、受け止めておくれ。',
            tcg_turn_start: '新しい朝だね。今日の盤面も、じっくり育てていこう。',
            tcg_turn_end: '急いでも実りは早まらないよ。残したマナは次の手入れに回そう。',
            tcg_trigger: '育てた力が働いたね。{effect}。この変化も次の実りにつなげよう。'
        },
        fishing: {
            tcg_summon: 'いい獲物が来たぜ！　『{card}』、盤面へ飛び込め！',
            tcg_evolve: 'でかい引きだ！　『{name}』から『{card}』へ釣り上げるぜ！',
            tcg_person: '腕の立つ船員を乗せるぜ！　人物カード『{card}』だ！',
            tcg_field: '魚影はここだ！　フィールド『{card}』に網を張るぜ！',
            tcg_action: '当たりを逃すな！　アクション『{card}』を仕掛けるぜ！',
            tcg_support: '道具の出し惜しみはなしだ！　サポート『{card}』を使うぜ！',
            tcg_person_skill: 'ここが勝負の潮目だ！　「{skill}」を食らえ！',
            tcg_person_interrupt: 'その竿さばき、待った！　「{skill}」で横から掛けるぜ！',
            tcg_guard_prepare: '荒波に備えて船を固めるぞ。『{card}』、守護につけ！',
            tcg_guard_intercept: 'そいつは通さねえ！　『{card}』が受け止めるぜ！',
            tcg_turn_start: '潮が変わったな！　次の一投で大物を狙うぜ！',
            tcg_turn_end: '今は糸を張ったまま待つぜ。残したマナも立派な仕掛けだ。',
            tcg_trigger: '食いついたぞ！　{effect}！　この当たりを逃すんじゃねえ！'
        },
        cooking: {
            tcg_summon: '新しい素材を投入だ！　『{card}』、盤面へ入れ！',
            tcg_evolve: '火が通ったぞ！　『{name}』を『{card}』へ仕上げる！',
            tcg_person: '頼れる料理人を呼ぶぞ！　人物カード『{card}』、厨房へ！',
            tcg_field: '最高の厨房を用意した！　フィールド『{card}』を展開だ！',
            tcg_action: 'ここで味を決める！　アクション『{card}』を発動だ！',
            tcg_support: '調理道具の出番だな！　サポート『{card}』を使うぞ！',
            tcg_person_skill: '仕上げの技を見せてやる！　「{skill}」だ！',
            tcg_person_interrupt: 'その手はまだ早い！　「{skill}」で割り込ませてもらうぞ！',
            tcg_guard_prepare: '焦げ付く前に蓋をする！　『{card}』、守護を頼んだぞ！',
            tcg_guard_intercept: 'その一撃は厨房に通さん！　『{card}』、受け止めろ！',
            tcg_turn_start: 'さあ次の皿だ！　熱いうちに一気に仕上げるぞ！',
            tcg_turn_end: 'ここは弱火で寝かせる。残したマナが次の隠し味だ！',
            tcg_trigger: 'いい反応だ！　{effect}！　このまま最高の一皿に仕上げるぞ！'
        },
        building: {
            tcg_summon: '新しい部材を配置する。『{card}』を盤面へ組み込もう。',
            tcg_evolve: '構造を更新する。『{name}』から『{card}』へ増築だ。',
            tcg_person: '現場監督を追加する。人物カード『{card}』を配置しよう。',
            tcg_field: '基礎から組み直す。フィールド『{card}』を施工する。',
            tcg_action: '工程を一つ進める。アクション『{card}』を実行する。',
            tcg_support: '必要な資材を投入する。サポート『{card}』を使用しよう。',
            tcg_person_skill: '設計どおりに進める。「{skill}」を実行する。',
            tcg_person_interrupt: 'その工程には修正が必要だ。「{skill}」で割り込む。',
            tcg_guard_prepare: '先に耐力を確保する。『{card}』を守護へ回そう。',
            tcg_guard_intercept: '荷重はこちらで受ける。『{card}』が攻撃を支える。',
            tcg_turn_start: '次の工程を開始する。盤面の完成度を上げよう。',
            tcg_turn_end: 'この工程はここまでだ。残したマナは補強用に確保する。',
            tcg_trigger: '構造変化を確認。{effect}。計算に入れて次の工程へ進む。'
        },
        smithing: {
            tcg_summon: '……素材を置く。『{card}』、出ろ。',
            tcg_evolve: '……鍛え直す。『{name}』から『{card}』へ。',
            tcg_person: '……職人を呼ぶ。人物カード『{card}』だ。',
            tcg_field: '……炉を作る。フィールド『{card}』を展開。',
            tcg_action: '……打つ。アクション『{card}』を使う。',
            tcg_support: '……道具だ。サポート『{card}』を使う。',
            tcg_person_skill: '……技を入れる。「{skill}」。',
            tcg_person_interrupt: '……待て。「{skill}」で割り込む。',
            tcg_guard_prepare: '……守りを鍛える。『{card}』、守護につけ。',
            tcg_guard_intercept: '……通さん。『{card}』で受ける。',
            tcg_turn_start: '……火を入れる。次を打つ。',
            tcg_turn_end: '……今は冷ます。マナは残す。',
            tcg_trigger: '……反応した。{effect}。まだ打てる。'
        },
        pharmacist: {
            tcg_summon: '新しい処方を加えます。『{card}』を盤面へどうぞ。',
            tcg_evolve: '薬効を高めましょう。『{name}』から『{card}』へ調合いたします。',
            tcg_person: '専門家に診ていただきましょう。人物カード『{card}』をお呼びします。',
            tcg_field: '治療環境を整えます。フィールド『{card}』を展開いたします。',
            tcg_action: '適切な処置を行います。アクション『{card}』を投与いたします。',
            tcg_support: '補助薬もございます。サポート『{card}』をお使いください。',
            tcg_person_skill: '症状に合わせた処置です。「{skill}」を施します。',
            tcg_person_interrupt: 'その処置は危険ですね。「{skill}」で介入いたします。',
            tcg_guard_prepare: '予防も大切です。『{card}』に守護を処方いたします。',
            tcg_guard_intercept: 'こちらで受け止めましょう。『{card}』、守護をお願いいたします。',
            tcg_turn_start: '次の診察を始めましょう。盤面の状態を確認いたします。',
            tcg_turn_end: '今は経過観察といたします。残したマナは緊急処置用です。',
            tcg_trigger: '効果を確認いたしました。{effect}。引き続き経過を診ましょう。'
        },
        hairdresser: {
            tcg_summon: '新しい子をセット〜♡　『{card}』、めっちゃ盛ってこ！',
            tcg_evolve: '大胆イメチェンいくよ〜！　『{name}』から『{card}』にチェンジ♡',
            tcg_person: '最強のスタイリスト登場♡　人物カード『{card}』をセット！',
            tcg_field: 'ステージごと映えさせよ！　フィールド『{card}』を展開〜♡',
            tcg_action: 'ここでアレンジ入れちゃう！　アクション『{card}』だよ♡',
            tcg_support: '小物使いも大事じゃん？　サポート『{card}』をオン♡',
            tcg_person_skill: 'もっと可愛く仕上げるよ〜！　「{skill}」いっちゃえ♡',
            tcg_person_interrupt: 'ちょっと待った〜！　「{skill}」で流れ変えちゃう♡',
            tcg_guard_prepare: '崩れる前にキープしよ！　『{card}』に守護をセット♡',
            tcg_guard_intercept: 'その攻撃、全然映えないって！　『{card}』がブロック♡',
            tcg_turn_start: '次のアレンジいくよ〜！　盤面もっと盛ってこ♡',
            tcg_turn_end: 'ここはキープで正解♡　残したマナで次もっと映えさせよ！',
            tcg_trigger: '見て見て、変化きた〜！　{effect}！　めっちゃいい感じ♡'
        },
        pastry_chef: {
            tcg_summon: '新たな素材を添えよう！　『{card}』、華やかに登場だ！',
            tcg_evolve: '美しい変化だ！　『{name}』から『{card}』へ仕上げよう！',
            tcg_person: '名匠を厨房へ迎えよう！　人物カード『{card}』だ！',
            tcg_field: '舞台も一皿の一部さ。フィールド『{card}』を広げよう！',
            tcg_action: 'ここで香りを重ねる！　アクション『{card}』をどうぞ！',
            tcg_support: '繊細な飾り付けを加えよう。サポート『{card}』だ！',
            tcg_person_skill: '秘伝の技を披露しよう！　「{skill}」を召し上がれ！',
            tcg_person_interrupt: 'フィナーレにはまだ早い！　「{skill}」を挟ませてもらおう！',
            tcg_guard_prepare: '崩れぬよう土台を固めよう。『{card}』に守護を託す！',
            tcg_guard_intercept: 'その刺激は私が受け止めよう！　『{card}』、守護の出番だ！',
            tcg_turn_start: '次の皿を始めよう！　甘く鮮やかなターンにするよ！',
            tcg_turn_end: '生地を休ませる時間だ。残したマナが次の香りを育てる。',
            tcg_trigger: '素晴らしい反応だ！　{effect}！　味わいが一段深くなったね！'
        },
        concierge: {
            tcg_summon: '新しいお席をご用意いたしました。『{card}』、どうぞ盤面へ。',
            tcg_evolve: 'より上質なお姿へご案内いたします。『{name}』から『{card}』へ。',
            tcg_person: '担当者をお呼びいたしました。人物カード『{card}』でございます。',
            tcg_field: '会場を整えさせていただきます。フィールド『{card}』を展開いたします。',
            tcg_action: 'こちらの手配を進めます。アクション『{card}』でございます。',
            tcg_support: 'お役立ていただける品でございます。サポート『{card}』をどうぞ。',
            tcg_person_skill: '最善のサービスをご提供いたします。「{skill}」を使用いたします。',
            tcg_person_interrupt: '恐れ入りますが、こちらで失礼いたします。「{skill}」で割り込みます。',
            tcg_guard_prepare: '万一に備え、警護を手配いたします。『{card}』に守護をお願いいたします。',
            tcg_guard_intercept: 'こちらから先はお通しできません。『{card}』がお相手いたします。',
            tcg_turn_start: 'お待たせいたしました。次のターンも心を込めてご案内いたします。',
            tcg_turn_end: 'ただいまは控えさせていただきます。残したマナは次のご要望に備えます。',
            tcg_trigger: '手配が整いました。{effect}。引き続き最善を尽くしてまいります。'
        },
        tailor: {
            tcg_summon: '新しい一枚を縫い留めましょう。『{card}』を盤面へ。',
            tcg_evolve: '美しい仕立て直しです。『{name}』から『{card}』へ。',
            tcg_person: '物語を紡ぐ方をお迎えします。人物カード『{card}』です。',
            tcg_field: '背景から整えましょう。フィールド『{card}』を広げますね。',
            tcg_action: 'ここに新しい模様を加えます。アクション『{card}』です。',
            tcg_support: '仕上げの小物を添えましょう。サポート『{card}』を使いますね。',
            tcg_person_skill: '丁寧に縫い合わせましょう。「{skill}」を使います。',
            tcg_person_interrupt: 'その糸は少し乱れていますね。「{skill}」で整えさせてください。',
            tcg_guard_prepare: 'ほつれる前に補強しましょう。『{card}』に守護を縫い付けます。',
            tcg_guard_intercept: '大切な布地は傷つけさせません。『{card}』が受け止めます。',
            tcg_turn_start: '続きを紡いでまいりましょう。次はどんな模様になるでしょう。',
            tcg_turn_end: 'ここで糸を休ませますね。残したマナは次の仕上げに使いましょう。',
            tcg_trigger: '縫い目が応えてくれました。{effect}。きれいにつながりましたね。'
        },
        fortune_teller: {
            tcg_summon: '星が新たな影を映しました。『{card}』、運命の盤面へ。',
            tcg_evolve: '星巡りが姿を変えます。『{name}』から『{card}』へ。',
            tcg_person: '導き手の星が昇りました。人物カード『{card}』をお迎えします。',
            tcg_field: '運命の舞台を開きましょう。フィールド『{card}』を展開します。',
            tcg_action: '未来の糸を一つ選びます。アクション『{card}』を。',
            tcg_support: '星の助けを借りましょう。サポート『{card}』を使います。',
            tcg_person_skill: 'この星の配置ならば……「{skill}」を選びましょう。',
            tcg_person_interrupt: 'その未来はまだ確定していません。「{skill}」で書き換えます。',
            tcg_guard_prepare: '凶兆に備えましょう。『{card}』へ守護の星を重ねます。',
            tcg_guard_intercept: 'その運命は結界の先へ進めません。『{card}』が受け止めます。',
            tcg_turn_start: '新しい星巡りです。次の未来を読み解きましょう。',
            tcg_turn_end: '今は星が沈む刻。残したマナも次の巡りへ託します。',
            tcg_trigger: '星図が揺らぎました。{effect}。これも運命の一節です。'
        },
        scientist: {
            tcg_summon: '新しい実験個体を投入！　『{card}』、盤面反応を開始！',
            tcg_evolve: '進化データを観測！　『{name}』から『{card}』へ変換だ！',
            tcg_person: '共同研究者を追加するよ！　人物カード『{card}』だ！',
            tcg_field: '実験環境を変更！　フィールド『{card}』を展開する！',
            tcg_action: '仮説を実行に移す！　アクション『{card}』を投入！',
            tcg_support: '補助装置を接続！　サポート『{card}』を使用するよ！',
            tcg_person_skill: '興味深い仮説だ！　「{skill}」を検証しよう！',
            tcg_person_interrupt: 'その結果には対照実験が必要だ！　「{skill}」で介入する！',
            tcg_guard_prepare: '防御実験を開始！　『{card}』へ守護機能を付与する！',
            tcg_guard_intercept: '衝撃データを採取するよ！　『{card}』で受け止める！',
            tcg_turn_start: '次の試行を開始！　新しい盤面データを集めよう！',
            tcg_turn_end: 'ここで観測時間を置こう。残したマナも次の実験条件だ！',
            tcg_trigger: '反応を確認！　{effect}！　実に興味深いデータだ！'
        },
        salesperson: {
            tcg_summon: '新商品を入荷いたしました！　『{card}』、ただいま盤面へ！',
            tcg_evolve: '上位モデルへ交換です！　『{name}』から『{card}』へ！',
            tcg_person: '担当スタッフをご紹介！　人物カード『{card}』でございます！',
            tcg_field: '売り場を一新いたします！　フィールド『{card}』を展開！',
            tcg_action: '本日の目玉企画です！　アクション『{card}』を実施いたします！',
            tcg_support: 'こちらも併せておすすめです！　サポート『{card}』をどうぞ！',
            tcg_person_skill: '特別サービスのお時間です！　「{skill}」をご提供！',
            tcg_person_interrupt: '少々お待ちください！　「{skill}」を緊急入荷いたしました！',
            tcg_guard_prepare: '保証も万全でございます！　『{card}』に守護をお付けします！',
            tcg_guard_intercept: 'こちらは通行対象外です！　『{card}』が返品対応いたします！',
            tcg_turn_start: 'いらっしゃいませ！　次のターンもおすすめ満載でございます！',
            tcg_turn_end: 'ただいま品揃えを調整中です！　残したマナは次の目玉商品へ！',
            tcg_trigger: '効果を確認いたしました！　{effect}！　大変お得な展開です！'
        },
        dealer: {
            tcg_summon: '新しいカードを切るわ。『{card}』をテーブルへ。',
            tcg_evolve: '札を一段上げるわ。『{name}』から『{card}』へ進化よ。',
            tcg_person: '切り札の人物を出すわ。人物カード『{card}』よ。',
            tcg_field: 'テーブルそのものを変えるわ。フィールド『{card}』を展開。',
            tcg_action: 'ここで流れに賭けるわ。アクション『{card}』を発動。',
            tcg_support: '手札を支える一枚よ。サポート『{card}』を使うわ。',
            tcg_person_skill: '勝負どころね。「{skill}」にベットするわ。',
            tcg_person_interrupt: 'その一手にはコールよ。「{skill}」で割り込むわ。',
            tcg_guard_prepare: '保険も勝負のうちよ。『{card}』を守護へ回すわ。',
            tcg_guard_intercept: 'そのベットは受け止めるわ。『{card}』が守護に入る。',
            tcg_turn_start: '次のディールよ。流れをこちらへ引き寄せるわ。',
            tcg_turn_end: '今はチェック。残したマナまで読めるかしら？',
            tcg_trigger: '効果が出たわ。{effect}。この結果も計算に入れる。'
        }
    };
    Object.keys(CASINO_MASTER_TCG_ACTION_LINES).forEach(masterType => {
        CASINO_MASTER_TCG_LINES[masterType] = Object.assign(
            CASINO_MASTER_TCG_LINES[masterType] || {},
            CASINO_MASTER_TCG_ACTION_LINES[masterType]
        );
    });
    window.CASINO_MASTER_PROFILES = CASINO_MASTER_PROFILES;

    window.getCasinoMasterProfile = function (masterType) {
        return CASINO_MASTER_PROFILES[masterType] || null;
    };

    window.getCasinoMasterGameDialogue = function (masterType, event, details) {
        const profile = CASINO_MASTER_PROFILES[masterType];
        const fallback = CASINO_MASTER_PROFILES.dealer;
        let line = profile && profile.lines && profile.lines[event];
        if (!line) line = CASINO_MASTER_TCG_LINES[masterType] && CASINO_MASTER_TCG_LINES[masterType][event];
        if (!line) line = CASINO_MASTER_TCG_LINES.dealer[event];
        if (!line) line = fallback.lines[event] || fallback.lines.play;
        details = details || {};
        if (Array.isArray(line)) line = line[Math.floor(Math.random() * line.length)] || '';
        return String(line)
            .replace(/\{card\}/g, String(details.card || 'このカード'))
            .replace(/\{target\}/g, String(details.target || '相手'))
            .replace(/\{damage\}/g, String(details.damage || ''))
            .replace(/\{action\}/g, String(details.action || ''))
            .replace(/\{name\}/g, String(details.name || 'このカード'))
            .replace(/\{skill\}/g, String(details.skill || '人物スキル'))
            .replace(/\{effect\}/g, String(details.effect || '効果が発動した'))
            .replace(/\{source\}/g, String(details.source || details.card || 'カード'))
            .replace(/\{field\}/g, String(details.field || details.card || 'フィールド'))
            .replace(/\{mana\}/g, String(details.mana === undefined ? '' : details.mana))
            .replace(/\{count\}/g, String(details.count === undefined ? '' : details.count))
            .replace(/\{reason\}/g, String(details.reason || ''));
    };

    window.renderCasinoMasterAvatar = function (masterType, className) {
        const profile = CASINO_MASTER_PROFILES[masterType];
        if (!profile) return '';
        return `<span class="${className || 'casino-master-avatar'}" data-casino-master="${masterType}" title="${profile.name}"><img src="${profile.image}" alt=""></span>`;
    };

    window.recordCasinoMasterConversation = function (masterType) {
        const hero = window.aiPet;
        if (!hero || !CASINO_MASTER_PROFILES[masterType]) return false;
        const progress = window.ensureDealerCasinoState(hero);
        if (!progress.visitorMasterHistory.includes(masterType)) {
            progress.visitorMasterHistory.push(masterType);
            if (typeof window.saveGameData === 'function') window.saveGameData();
        }
        return true;
    };

    window.hasCasinoMasterConversation = function (masterType) {
        const hero = window.aiPet || {};
        const progress = window.ensureDealerCasinoState(hero);
        if (!progress || !CASINO_MASTER_PROFILES[masterType]) return false;
        if (progress.visitorMasterHistory.includes(masterType)) return true;
        const app = hero.apprentice || {};
        if ((app.metMasters || []).includes(masterType)) return true;
        if (Number(app.rank && app.rank[masterType]) > 0 || !!(app.retired && app.retired[masterType])) return true;
        const personMap = window.MASTER_PERSON_CARD_MAP || {};
        const aliases = masterType === 'salesperson'
            ? ['salesperson', 'sales', 'shop_clerk']
            : masterType === 'fortune_teller'
                ? ['fortune_teller', 'fortuneteller', 'fortune']
                : [masterType];
        const ids = aliases.map(alias => personMap[alias]).filter(Boolean);
        const collection = window.TCG && Array.isArray(window.TCG.myCollection) ? window.TCG.myCollection : [];
        return ids.some(masterId => collection.some(card => card && card.masterId === masterId));
    };

    window.getCasinoEligibleGameMasters = function () {
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        const visitors = state && Array.isArray(state.visitors) ? state.visitors : [];
        return visitors.filter(visitor =>
            visitor
            && visitor.kind === 'master'
            && visitor.masterType
            && window.hasCasinoMasterConversation(visitor.masterType)
        );
    };

    window.setCasinoCardGameContext = function (context) {
        const next = Object.assign({ source: 'table', lockedVisitors: [] }, context || {});
        if (!Array.isArray(next.lockedVisitors)) next.lockedVisitors = [];
        window._casinoCardGameContext = next;
        return next;
    };

    window.getCasinoCardGameContext = function () {
        return window._casinoCardGameContext || { source: 'table', lockedVisitors: [] };
    };

    window.clearCasinoCardGameContext = function () {
        window._casinoCardGameContext = null;
    };

    function normalizeCasinoResult(result) {
        if (result === 'win' || result === true) return 'win';
        if (result === 'draw') return 'draw';
        return 'loss';
    }

    function casinoOpponentList(details) {
        if (Array.isArray(details.opponents)) return details.opponents.filter(Boolean);
        if (details.opponentId || details.opponentName || details.opponentType) {
            return [{
                id: details.opponentId,
                name: details.opponentName,
                type: details.opponentType,
                masterType: details.masterType
            }];
        }
        return [];
    }

    function recordCasinoOpponent(stats, opponent, fallbackResult, playedAt, index) {
        const result = normalizeCasinoResult(opponent.result !== undefined ? opponent.result : fallbackResult);
        const type = String(opponent.type || opponent.opponentType || (opponent.masterType ? 'master' : 'opponent'));
        const id = String(opponent.id || opponent.opponentId || opponent.masterType || opponent.name || `opponent_${index}`);
        const key = `${type}:${id}`;
        if (!stats.opponents[key] || typeof stats.opponents[key] !== 'object') {
            stats.opponents[key] = {
                id,
                type,
                masterType: String(opponent.masterType || ''),
                name: String(opponent.name || opponent.opponentName || id),
                plays: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                lastPlayedAt: 0
            };
        }
        const record = stats.opponents[key];
        record.id = id;
        record.type = type;
        record.masterType = String(opponent.masterType || record.masterType || '');
        record.name = String(opponent.name || opponent.opponentName || record.name || id);
        record.plays = Math.max(0, Math.floor(Number(record.plays) || 0)) + 1;
        if (result === 'win') record.wins = Math.max(0, Math.floor(Number(record.wins) || 0)) + 1;
        else if (result === 'draw') record.draws = Math.max(0, Math.floor(Number(record.draws) || 0)) + 1;
        else record.losses = Math.max(0, Math.floor(Number(record.losses) || 0)) + 1;
        record.lastPlayedAt = playedAt;
    }

    window.recordDealerCasinoGameResult = function (game, result, details) {
        if (!CASINO_STAT_GAMES.includes(game) || !window.aiPet) return false;
        details = details || {};
        const progress = window.ensureDealerCasinoState(window.aiPet);
        const stats = progress.stats[game];
        const normalizedResult = normalizeCasinoResult(result);
        const playedAt = Date.now();
        stats.plays += 1;
        if (normalizedResult === 'win') stats.wins += 1;
        else if (normalizedResult === 'draw') stats.draws += 1;
        else stats.losses += 1;
        stats.netCoins += Number(details.netCoins) || 0;
        stats.lastPlayedAt = playedAt;
        casinoOpponentList(details).forEach((opponent, index) => {
            recordCasinoOpponent(stats, opponent, normalizedResult, playedAt, index);
        });
        if (game === 'tcg') {
            const tcgMode = details.tcgMode === 'tag' || details.mode === 'tag' ? 'tag' : 'single';
            const modeRecord = stats.modes[tcgMode];
            modeRecord.plays += 1;
            if (normalizedResult === 'win') modeRecord.wins += 1;
            else if (normalizedResult === 'draw') modeRecord.draws += 1;
            else modeRecord.losses += 1;
            modeRecord.lastPlayedAt = playedAt;
            if (tcgMode === 'tag' && details.partner && typeof details.partner === 'object') {
                const partner = details.partner;
                const key = String(partner.id || partner.masterType || partner.name || 'partner');
                if (!stats.partners[key] || typeof stats.partners[key] !== 'object') {
                    stats.partners[key] = {
                        id: key,
                        name: String(partner.name || key),
                        type: String(partner.type || 'master'),
                        masterType: String(partner.masterType || ''),
                        plays: 0, wins: 0, losses: 0, draws: 0
                    };
                }
                const partnerRecord = stats.partners[key];
                partnerRecord.name = String(partner.name || partnerRecord.name || key);
                partnerRecord.type = String(partner.type || partnerRecord.type || 'master');
                partnerRecord.masterType = String(partner.masterType || partnerRecord.masterType || '');
                partnerRecord.plays += 1;
                if (normalizedResult === 'win') partnerRecord.wins += 1;
                else if (normalizedResult === 'draw') partnerRecord.draws += 1;
                else partnerRecord.losses += 1;
                partnerRecord.lastPlayedAt = playedAt;
            }
        }

        if (game === 'poker' && details.opponentType === 'dealer' && normalizedResult === 'win') progress.beatDealerPoker = true;
        if (game === 'poker' && progress.trackRank4PokerProfit) {
            progress.rank4PokerProfit = Math.max(0, (Number(progress.rank4PokerProfit) || 0) + (Number(details.netCoins) || 0));
        }
        if (game === 'daifugo' && Number(details.place) === 1) progress.wonDaifugo = true;
        if (game === 'tcg' && details.mode === 'dealer' && normalizedResult === 'win') progress.beatDealerTCG = true;
        if (game === 'tcg' && details.mode === 'self' && normalizedResult === 'win') progress.beatOwnDeckTCG = true;

        if (CASINO_GAMES.includes(game) && progress.rank9Tracking && normalizedResult === 'win') {
            progress.rank9Wins[game] = (Number(progress.rank9Wins[game]) || 0) + 1;
        }
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
        return true;
    };

    window.syncCasinoLegacyProgress();
})();

// ==========================================
// 5列・目押し対応スロット
// ==========================================
(function () {
    'use strict';

    const REEL_COUNT = 5;
    const VISIBLE_ROWS = 3;
    const PAYLINES = [
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2],
        [0, 1, 2, 1, 0],
        [2, 1, 0, 1, 2]
    ];
    const PAYLINE_NAMES = ['上段', '中段', '下段', 'V字', '逆V字'];
    const PAYLINE_COLORS = [
        'rgba(255,96,143,.48)',
        'rgba(255,213,106,.58)',
        'rgba(92,213,255,.48)',
        'rgba(190,127,255,.42)',
        'rgba(89,225,174,.42)'
    ];
    const SYMBOLS = [
        { id: 'spirit', name: 'チェリー', role: 'CHERRY', file: 'lillesymbol_spirit.png', imageW: 1786, imageH: 2400, crop: [0, 1200, 893, 1200], color: '#ef476f', payouts: { 3: 1, 4: 3, 5: 8 }, damage: 8 },
        { id: 'robot', name: 'レモン', role: 'LEMON', file: 'lillesymbol_robot.png', imageW: 1952, imageH: 2174, crop: [0, 1087, 976, 1087], color: '#ffe45e', payouts: { 3: 2, 4: 5, 5: 12 }, damage: 10 },
        { id: 'seed', name: 'プラム', role: 'PLUM', file: 'lillesymbol_seed.png', imageW: 1694, imageH: 2528, crop: [0, 1264, 847, 1264], color: '#d65db1', payouts: { 3: 3, 4: 7, 5: 16 }, damage: 12 },
        { id: 'balloon', name: 'スイカ', role: 'WATERMELON', file: 'lillesymbol_balloon.png', imageW: 2122, imageH: 2016, crop: [0, 0, 1061, 1008], color: '#4caf50', payouts: { 3: 4, 4: 10, 5: 24 }, damage: 14 },
        { id: 'beetle', name: 'ベル', role: 'BELL', file: 'lillesymbol_beetle.png', imageW: 1920, imageH: 2228, crop: [960, 0, 960, 1114], color: '#ffb300', payouts: { 3: 5, 4: 12, 5: 30 }, damage: 16 },
        { id: 'bird', name: 'クローバー', role: 'CLOVER', file: 'lillesymbol_bird.png', imageW: 1952, imageH: 2174, crop: [0, 1087, 976, 1087], color: '#5ad05a', payouts: { 3: 6, 4: 16, 5: 40 }, damage: 18 },
        { id: 'stone', name: 'ダイヤモンド', role: 'DIAMOND', file: 'lillesymbol_stone.png', imageW: 1952, imageH: 2174, crop: [0, 0, 976, 800], color: '#78ddff', payouts: { 3: 8, 4: 22, 5: 60 }, damage: 22 },
        { id: 'machine', name: 'BAR', role: 'BAR', file: 'lillesymbol_machine.png', imageW: 1952, imageH: 2174, crop: [0, 1087, 976, 1087], color: '#ff8f3d', payouts: { 3: 10, 4: 30, 5: 90 }, damage: 26 },
        { id: 'dragon', name: '7', role: 'SEVEN', file: 'lillesymbol_dragon.png', imageW: 1984, imageH: 2132, crop: [0, 1066, 992, 1066], color: '#ffd54a', payouts: { 3: 15, 4: 60, 5: 250 }, damage: 42 },
        { id: 'ghost', name: 'WILD', role: 'WILD', file: 'lillesymbol_ghost.png', imageW: 1952, imageH: 2174, crop: [0, 0, 976, 1087], color: '#46f0d0', payouts: { 3: 20, 4: 80, 5: 400 }, damage: 30, wild: true },
        { id: 'magician', name: 'SCATTER', role: 'SCATTER', file: 'lillesymbol_magician.png', imageW: 1920, imageH: 2220, crop: [0, 0, 960, 1110], color: '#bf75ff', payouts: { 3: 3, 4: 10, 5: 50 }, damage: 24, scatter: true }
    ];
    const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map(symbol => [symbol.id, symbol]));
    const SLOT_WIN_BGM_BY_SYMBOL = {
        spirit: 'slot_cherry',
        robot: 'slot_lemon',
        seed: 'slot_plum',
        balloon: 'slot_watermelon',
        beetle: 'slot_bell',
        bird: 'slot_clover',
        stone: 'slot_dia',
        machine: 'slot_bar',
        dragon: 'slot_seven',
        ghost: 'slot_wild',
        magician: 'slot_scatter'
    };
    const symbolImages = {};
    let slotState = null;
    let animationFrame = null;
    let slotBattleState = null;
    let slotBattleFrame = null;
    let slotBattleLastSettings = null;
    const SLOT_BATTLE_FIXED_HP = 1000;
    const SLOT_BATTLE_PLAYER_STATS = { power: 100, intel: 100, speed: 100 };
    const SLOT_BATTLE_MASTER_STATS = {
        explore: { power: 90, intel: 80, speed: 130 },
        farming: { power: 100, intel: 140, speed: 60 },
        fishing: { power: 120, intel: 60, speed: 120 },
        cooking: { power: 150, intel: 100, speed: 50 },
        smithing: { power: 160, intel: 80, speed: 60 },
        building: { power: 110, intel: 150, speed: 40 },
        pharmacist: { power: 60, intel: 160, speed: 80 },
        tailor: { power: 70, intel: 150, speed: 80 },
        pastry_chef: { power: 90, intel: 140, speed: 70 },
        hairdresser: { power: 60, intel: 110, speed: 130 },
        concierge: { power: 70, intel: 160, speed: 70 },
        dealer: { power: 90, intel: 130, speed: 80 },
        fortune_teller: { power: 50, intel: 170, speed: 80 },
        scientist: { power: 60, intel: 170, speed: 70 },
        salesperson: { power: 80, intel: 100, speed: 120 },
        soldier: { power: 160, intel: 50, speed: 90 },
        captain: { power: 120, intel: 80, speed: 100 },
        king: { power: 150, intel: 120, speed: 30 }
    };
    const SLOT_BATTLE_MASTER_PRESENTATION = {
        explore: { title: '高速探索型', color: '#54d7ff', specialName: '未踏ルート開拓', kind: 'explore', big: '道が見えたわ！　一気に進むわよ！', special: '未知への扉、今ここで開くわ！', pinch: '険しいほど燃えるわ。ここから踏破よ！' },
        farming: { title: '育成・補助型', color: '#78dc78', specialName: '大豊作', kind: 'farming', big: 'いい流れが育ってきたね。', special: '待ったかいがあったよ。大豊作だ！', pinch: '荒れた畑も、ここから育て直せるよ。' },
        fishing: { title: '力と反応の両立型', color: '#58bfff', specialName: '大物一本釣り', kind: 'fishing', big: '食いついた！　この当たりは逃がさねえ！', special: '来たぞ大物！　一気に釣り上げるぜ！', pinch: '糸はまだ切れちゃいねえ。勝負はここからだ！' },
        cooking: { title: '高火力・仕上げ型', color: '#ff9a55', specialName: '灼熱フルコース', kind: 'cooking', big: '火力を上げるぞ！　仕上げの時間だ！', special: '灼熱のフルコース、熱いうちに食らいな！', pinch: 'まだ焦げちゃいない！　ここから仕上げるぞ！' },
        smithing: { title: '最大火力型', color: '#d4e1eb', specialName: '一閃鍛造', kind: 'smithing', big: '……芯を捉えた。打ち切る。', special: '……一閃。これが鍛えた一撃だ。', pinch: '……まだ折れていない。鍛え直す。' },
        building: { title: '防壁・設計型', color: '#e4b86a', specialName: '完全要塞', kind: 'building', big: '構造がつながった。完成まで一気に組む。', special: '完全要塞、建造完了。ここからは崩れない。', pinch: '基礎は残っている。補強すれば立て直せる。' },
        pharmacist: { title: '回復・解除型', color: '#67e0b4', specialName: '完全調合', kind: 'pharmacist', big: '効き目が出てまいりましたね。', special: '完全調合です。すべての症状を治しましょう。', pinch: 'まだ治療法はございます。ご安心ください。' },
        tailor: { title: '防護・強化型', color: '#d9a8ff', specialName: '運命の縫い直し', kind: 'tailor', big: '流れがきれいにつながりました。', special: 'ほつれた運命も、私が美しく縫い直します。', pinch: 'ここから丁寧に仕立て直しましょう。' },
        pastry_chef: { title: '全体強化型', color: '#ff9ed2', specialName: '祝祭のデセール', kind: 'pastry', big: '華やかな仕上がりになってきたね！', special: '祝祭のデセールだ！　甘い逆転を召し上がれ！', pinch: 'ほろ苦さのあとにこそ、最高の甘さが来るのさ！' },
        hairdresser: { title: '高速妨害型', color: '#ff74bd', specialName: 'スタイリングラッシュ', kind: 'hairdresser', big: '流れ、めっちゃいい感じに盛れてる！', special: 'スタイリングラッシュ！　最高にアガってこ〜♡', pinch: 'まだ直せるし！　ここから盛り返すよ〜♡' },
        concierge: { title: '回復・支援特化型', color: '#f2dfae', specialName: '至高のおもてなし', kind: 'concierge', big: 'よい流れをご用意できました。', special: '至高のおもてなしで、勝負を整えさせていただきます。', pinch: '最後まで最善のおもてなしを尽くします。' },
        dealer: { title: '知略・変化対応型', color: '#ffd65c', specialName: 'ロイヤルディール', kind: 'dealer', big: 'いい流れね。ここで勝負を動かすわ。', special: 'ロイヤルディール。切り札を公開するわ！', pinch: '追い詰められた時こそ、最後の一枚が生きるのよ。' },
        fortune_teller: { title: '特殊・予測特化型', color: '#bd83ff', specialName: '星命転換', kind: 'fortune', big: '星々が大きく動き始めました。', special: '星命転換――この瞬間、未来を書き換えます。', pinch: '未来はまだ一つではありません。' },
        scientist: { title: '特殊効果最大化型', color: '#65e8ff', specialName: '限界突破実験', kind: 'scientist', big: '予想以上の反応だ！　実に面白い！', special: '限界突破実験、開始！　最大出力を観測しよう！', pinch: '危険域だからこそ、逆転仮説を試す価値がある！' },
        salesperson: { title: '高速回転・再利用型', color: '#ffe36a', specialName: 'タイムセールラッシュ', kind: 'salesperson', big: '今だけの大チャンスでございます！', special: 'タイムセールラッシュ！　勢いごとお届けします！', pinch: 'ここから大逆転セールを開催いたします！' },
        soldier: { name: '兵士', image: 'soldier_battle_enemy.png', title: '速攻火力型', color: '#ff695f', specialName: '突撃号令', kind: 'soldier', start: '正面から勝負だ！　準備はいいな！', big: '好機だ！　一気に押し込む！', special: '突撃号令！　全力で突破する！', pinch: 'まだ戦える！　最後まで退かない！', win: '勝負あり！　いい戦いだった！', loss: '見事だ！　次は負けないぞ！', draw: '互角か。もう一度勝負だ！' },
        captain: { name: '隊長', image: 'captain_battle_enemy.png', title: '指揮・攻速両立型', color: '#6da7ff', specialName: '陣形展開', kind: 'captain', start: '状況を見極めろ。勝機は必ず作れる。', big: '陣形が整った。攻勢に移る！', special: '陣形展開！　守りから一気に攻めるぞ！', pinch: '隊列を立て直せ。まだ決着ではない！', win: '作戦どおりだ。よく戦った。', loss: 'こちらの読み負けだ。見事だった。', draw: '戦力は互角だ。次で決めよう。' },
        king: { name: '王様', image: 'king_battle_enemy.png', title: '重厚な決着型', color: '#ffd45f', specialName: '王威の裁定', kind: 'king', start: '余の前で、そなたの勝負を示してみよ。', big: '見事な巡りよ。ここで裁定を下そう。', special: '王威の裁定――この一撃を受けてみよ！', pinch: '王たる者、最後まで堂々と立つものよ。', win: 'よき勝負であった。胸を張るがよい。', loss: 'そなたの勝利だ。見事であった。', draw: '互いに譲らぬか。もう一度だ。' }
    };

    function localDayKey(date) {
        date = date || new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function hash(text) {
        let value = 2166136261;
        String(text || '').split('').forEach(char => {
            value ^= char.charCodeAt(0);
            value = Math.imul(value, 16777619);
        });
        return value >>> 0;
    }

    function seededRandom(seed) {
        let value = seed >>> 0;
        return function () {
            value += 0x6D2B79F5;
            let mixed = value;
            mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
            mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
            return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
        };
    }

    function dailyLuckFor(dayKey) {
        const roll = hash(`casino_slot_luck_${dayKey}`) % 100;
        if (roll < 10) return 1;
        if (roll < 30) return 2;
        if (roll < 70) return 3;
        if (roll < 90) return 4;
        return 5;
    }

    function ensureSlotDailyState() {
        const hero = window.aiPet;
        const progress = hero && typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero)
            : null;
        if (!progress) return null;
        const key = localDayKey();
        if (!progress.slotDaily || progress.slotDaily.dayKey !== key) {
            progress.slotDaily = {
                dayKey: key,
                luck: dailyLuckFor(key),
                spins: 0,
                wins: 0,
                losses: 0,
                lossStreak: 0,
                freeSpins: 0,
                assistSpins: 0,
                payoutBoost: 1,
                stageHp: 100,
                enemy: null,
                enemyGap: 0
            };
        }
        const daily = progress.slotDaily;
        daily.luck = Math.max(1, Math.min(5, Math.floor(Number(daily.luck) || dailyLuckFor(key))));
        ['spins', 'wins', 'losses', 'lossStreak', 'freeSpins', 'assistSpins', 'enemyGap'].forEach(field => {
            daily[field] = Math.max(0, Math.floor(Number(daily[field]) || 0));
        });
        daily.payoutBoost = Math.max(1, Number(daily.payoutBoost) || 1);
        daily.stageHp = Math.max(0, Math.min(100, Number(daily.stageHp) || 100));
        if (daily.enemy && typeof daily.enemy === 'object') {
            daily.enemy.hp = Math.max(0, Math.min(100, Number(daily.enemy.hp) || 100));
            daily.enemy.stunned = !!daily.enemy.stunned;
        } else {
            daily.enemy = null;
        }
        return daily;
    }

    function shuffled(values, random) {
        const result = values.slice();
        for (let index = result.length - 1; index > 0; index--) {
            const other = Math.floor(random() * (index + 1));
            [result[index], result[other]] = [result[other], result[index]];
        }
        return result;
    }

    function buildReelStrip(daily, reelIndex) {
        const counts = {
            spirit: 5, robot: 4, seed: 4, balloon: 3, beetle: 3,
            bird: 2, stone: 2, machine: 2, dragon: 1, ghost: 1, magician: 1
        };
        if (daily.luck <= 2) {
            counts.spirit += 3 - daily.luck;
            counts.robot += 3 - daily.luck;
            counts.seed += 1;
        } else if (daily.luck >= 4) {
            counts.stone += 1;
            counts.machine += 1;
            if (daily.luck >= 5) {
                counts.dragon += 1;
                counts.ghost += 1;
                counts.magician += 1;
            }
        }
        const pool = [];
        Object.entries(counts).forEach(([id, count]) => {
            for (let index = 0; index < count; index++) pool.push(id);
        });
        return shuffled(pool, seededRandom(hash(`${daily.dayKey}_${daily.luck}_reel_${reelIndex}`)));
    }

    function loadSymbolImages() {
        SYMBOLS.forEach(symbol => {
            if (symbolImages[symbol.id]) return;
            const image = new Image();
            image.src = symbol.file;
            symbolImages[symbol.id] = image;
        });
    }

    function roundRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    function setSlotNotice(message, tone) {
        if (slotState) {
            slotState.notice = String(message || '');
            slotState.noticeTone = tone || 'normal';
        }
        const notice = document.getElementById('casino-slot-notice');
        if (!notice) return;
        notice.textContent = String(message || '');
        notice.dataset.tone = tone || 'normal';
    }

    function refreshSlotHud() {
        const hero = window.aiPet || {};
        const daily = slotState && slotState.daily ? slotState.daily : ensureSlotDailyState();
        const coin = document.getElementById('casino-slot-coins');
        const free = document.getElementById('casino-slot-free-spins');
        const boost = document.getElementById('casino-slot-boost');
        const boostLabel = document.getElementById('casino-slot-boost-label');
        const condition = document.getElementById('casino-slot-condition');
        const dayKey = document.getElementById('casino-slot-day-key');
        const spinButton = document.getElementById('casino-slot-spin');
        if (coin) coin.textContent = Math.max(0, Math.floor(Number(hero.casinoCoins) || 0)).toLocaleString();
        if (free) free.textContent = String(daily ? daily.freeSpins : 0);
        if (boost) {
            const multiplier = slotState && slotState.spinning
                ? Math.max(1, Number(slotState.activePayoutBoost) || 1)
                : (daily ? Math.max(1, Number(daily.payoutBoost) || 1) : 1);
            boost.textContent = `×${multiplier.toFixed(1)}`;
        }
        if (boostLabel) boostLabel.textContent = slotState && slotState.spinning ? '今回倍率' : '次回倍率';
        if (condition && daily) {
            condition.textContent = `${'★'.repeat(daily.luck)}${'☆'.repeat(5 - daily.luck)}`;
            condition.title = `${daily.dayKey}の当たりやすさ。現実時間の日付が変わると更新されます。`;
        }
        if (dayKey && daily) dayKey.textContent = `${daily.dayKey} 0:00～`;
        if (spinButton) {
            spinButton.disabled = !!(slotState && slotState.spinning);
            spinButton.textContent = daily && daily.freeSpins > 0 ? `FREE SPIN（残り${daily.freeSpins}）` : 'SPIN';
        }
        for (let index = 0; index < REEL_COUNT; index++) {
            const button = document.querySelector(`[data-slot-stop="${index}"]`);
            const reel = slotState && slotState.reels[index];
            if (!button) continue;
            const enabled = !!(slotState && slotState.spinning && reel && reel.status === 'spinning');
            button.disabled = !enabled;
            button.classList.toggle('is-stopped', !!reel && reel.status === 'stopped');
            button.classList.toggle('is-stopping', !!reel && reel.status === 'stopping');
        }
    }

    function drawSymbolCell(ctx, symbolId, x, y, width, height, activeLine) {
        const symbol = SYMBOL_BY_ID[symbolId] || SYMBOL_BY_ID.spirit;
        ctx.save();
        roundRect(ctx, x + 5, y + 4, width - 10, height - 8, 12);
        ctx.lineWidth = activeLine ? 6 : 2;
        ctx.strokeStyle = activeLine ? symbol.color : 'rgba(40,20,35,.25)';
        ctx.stroke();
        ctx.clip();
        const image = symbolImages[symbol.id];
        if (image && image.complete && image.naturalWidth) {
            const [sx, sy, sw, sh] = symbol.crop;
            const fit = Math.min((width - 20) / Math.max(1, sw), (height - 18) / Math.max(1, sh));
            const drawW = sw * fit;
            const drawH = sh * fit;
            ctx.drawImage(image, sx, sy, sw, sh, x + (width - drawW) / 2, y + (height - drawH) / 2, drawW, drawH);
        } else {
            ctx.fillStyle = symbol.color;
            ctx.font = `900 ${Math.max(16, Math.floor(height * .2))}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol.role, x + width / 2, y + height / 2);
        }
        ctx.restore();
    }

    function reelVisibleSymbol(reel, row) {
        const base = Math.round(reel.position);
        return reel.strip[(base + row + reel.strip.length) % reel.strip.length];
    }

    function currentSlotGrid() {
        return slotState.reels.map(reel => {
            const base = Math.round(reel.position);
            return Array.from({ length: VISIBLE_ROWS }, (_, row) => reel.strip[(base + row + reel.strip.length) % reel.strip.length]);
        });
    }

    function drawSlotReels() {
        if (!slotState || !slotState.reelCtx) return;
        const ctx = slotState.reelCtx;
        const canvas = ctx.canvas;
        const cellW = canvas.width / REEL_COUNT;
        const cellH = canvas.height / VISIBLE_ROWS;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#160a13';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        slotState.reels.forEach((reel, reelIndex) => {
            const base = Math.floor(reel.position);
            const fraction = reel.position - base;
            for (let row = -1; row <= VISIBLE_ROWS; row++) {
                const symbolIndex = (base + row + reel.strip.length) % reel.strip.length;
                const y = (row - fraction) * cellH;
                const lineHit = slotState.winCells && slotState.winCells.has(`${reelIndex},${row}`);
                drawSymbolCell(ctx, reel.strip[symbolIndex], reelIndex * cellW, y, cellW, cellH, lineHit);
            }
            ctx.strokeStyle = 'rgba(255,213,106,.66)';
            ctx.lineWidth = 4;
            ctx.strokeRect(reelIndex * cellW + 2, 2, cellW - 4, canvas.height - 4);
        });

        PAYLINES.forEach((line, lineIndex) => {
            ctx.save();
            ctx.strokeStyle = PAYLINE_COLORS[lineIndex];
            ctx.lineWidth = lineIndex < 3 ? 2.5 : 2;
            ctx.setLineDash(lineIndex < 3 ? [12, 9] : [8, 10]);
            ctx.beginPath();
            ctx.moveTo(0, (line[0] + .5) * cellH);
            line.forEach((row, reelIndex) => {
                ctx.lineTo((reelIndex + .5) * cellW, (row + .5) * cellH);
            });
            ctx.lineTo(canvas.width, (line[REEL_COUNT - 1] + .5) * cellH);
            ctx.stroke();
            ctx.restore();
        });
    }

    function stageActorFrom(source, fallbackSkin) {
        const actor = Object.assign({}, source || {});
        actor.currentSkin = actor.currentSkin || actor.baseType || fallbackSkin || 'robot';
        actor.baseType = actor.baseType || actor.currentSkin || fallbackSkin || 'robot';
        actor.frameIndex = 0;
        return actor;
    }

    function drawStageActor(ctx, action, x, y, actor, mirrored, silhouette) {
        if (typeof window.drawActionCharacterOnContext !== 'function') {
            ctx.save();
            ctx.translate(x, y);
            if (mirrored) ctx.scale(-1, 1);
            ctx.fillStyle = silhouette ? '#050405' : '#ffe082';
            ctx.font = '88px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(silhouette ? '♟' : '★', 0, 0);
            ctx.restore();
            return;
        }
        if (!mirrored && !silhouette) {
            window.drawActionCharacterOnContext(ctx, action, x, y, actor);
            return;
        }
        const buffer = slotState.enemyCanvas;
        const bufferCtx = slotState.enemyCtx;
        bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
        window.drawActionCharacterOnContext(bufferCtx, action, buffer.width / 2, buffer.height * .55, actor);
        ctx.save();
        ctx.translate(x + buffer.width / 2, y - buffer.height * .55);
        if (mirrored) ctx.scale(-1, 1);
        if (silhouette) ctx.filter = 'brightness(0)';
        ctx.drawImage(buffer, 0, 0);
        ctx.restore();
    }

    function drawStageBar(ctx, x, y, width, value, color, label, alignRight) {
        const hp = Math.max(0, Math.min(100, Number(value) || 0));
        ctx.fillStyle = 'rgba(0,0,0,.72)';
        roundRect(ctx, x, y, width, 22, 11);
        ctx.fill();
        const fillW = Math.max(0, (width - 4) * hp / 100);
        if (fillW > 0) {
            ctx.fillStyle = color;
            roundRect(ctx, alignRight ? x + width - 2 - fillW : x + 2, y + 2, fillW, 18, 9);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px sans-serif';
        ctx.textAlign = alignRight ? 'right' : 'left';
        ctx.fillText(`${label} ${Math.ceil(hp)}`, alignRight ? x + width : x, y - 5);
    }

    function drawSlotStage(now) {
        if (!slotState || !slotState.stageCtx) return;
        const ctx = slotState.stageCtx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const offset = slotState.stageOffset || 0;
        const reaching = now < slotState.reachUntil;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, reaching ? '#4b123e' : '#09152d');
        gradient.addColorStop(.58, reaching ? '#6e183f' : '#1a2050');
        gradient.addColorStop(1, '#09050c');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(116,215,255,.2)';
        for (let index = 0; index < 18; index++) {
            const x = ((index * 83 - offset * .18) % (width + 100) + width + 100) % (width + 100) - 50;
            const y = 28 + (index * 37) % 95;
            ctx.fillRect(x, y, 3, 3);
        }
        for (let index = 0; index < 9; index++) {
            const buildingW = 90 + (index % 3) * 28;
            const x = ((index * 165 - offset * .32) % (width + 220) + width + 220) % (width + 220) - 120;
            const buildingH = 45 + (index % 4) * 18;
            ctx.fillStyle = index % 2 ? 'rgba(26,7,41,.92)' : 'rgba(12,10,39,.94)';
            ctx.fillRect(x, height - 72 - buildingH, buildingW, buildingH);
            ctx.fillStyle = 'rgba(255,70,172,.35)';
            for (let windowIndex = 0; windowIndex < 4; windowIndex++) {
                ctx.fillRect(x + 14 + windowIndex * 20, height - 60 - buildingH, 8, 10);
            }
        }
        ctx.fillStyle = '#100917';
        ctx.fillRect(0, height - 72, width, 72);
        ctx.strokeStyle = reaching ? 'rgba(255,210,90,.72)' : 'rgba(70,224,255,.32)';
        ctx.lineWidth = 3;
        for (let index = -3; index < 12; index++) {
            const x = ((index * 120 - offset * .8) % (width + 240) + width + 240) % (width + 240) - 120;
            ctx.beginPath();
            ctx.moveTo(width / 2, height - 72);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        const effectActive = now < slotState.effectUntil;
        const action = effectActive ? slotState.effectAction : 'move';
        const frameSpeed = effectActive && slotState.effectFast ? 70 : 170;
        slotState.stagePet.frameIndex = Math.floor(now / frameSpeed) % 3;
        drawStageActor(ctx, action, 160, height - 105, slotState.stagePet, false, false);
        drawStageBar(ctx, 28, 38, 230, slotState.daily.stageHp, '#4ee28c', 'PLAYER', false);

        if (slotState.daily.enemy) {
            slotState.enemyPet.currentSkin = slotState.daily.enemy.skin || slotState.enemyPet.currentSkin;
            slotState.enemyPet.baseType = slotState.daily.enemy.skin || slotState.enemyPet.baseType;
            slotState.enemyPet.frameIndex = Math.floor(now / 190) % 3;
            drawStageActor(ctx, 'move', width - 330, height - 105, slotState.enemyPet, true, true);
            drawStageBar(ctx, width - 258, 38, 230, slotState.daily.enemy.hp, '#ff5a6d', 'ENEMY', true);
        }

        if (reaching) {
            ctx.fillStyle = 'rgba(255,212,82,.96)';
            ctx.font = '900 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#ff3f90';
            ctx.shadowBlur = 20;
            ctx.fillText(slotState.reachText || 'REACH!', width / 2, 52);
            ctx.shadowBlur = 0;
        } else if (effectActive && slotState.effectText) {
            ctx.fillStyle = '#fff1a8';
            ctx.font = '900 27px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = slotState.effectColor || '#ffca54';
            ctx.shadowBlur = 18;
            ctx.fillText(slotState.effectText, width / 2, 54);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = 'rgba(255,255,255,.82)';
            ctx.font = '700 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(slotState.daily.enemy ? 'SILHOUETTE BATTLE' : 'NEON JOURNEY', width / 2, 42);
        }
    }

    function detectSlotReach() {
        if (!slotState || !slotState.spinning) return;
        const spinning = slotState.reels.map((reel, index) => reel.status === 'spinning' ? index : -1).filter(index => index >= 0);
        const stoppedCount = slotState.reels.filter(reel => reel.status === 'stopped').length;
        if (spinning.length !== 1 || stoppedCount !== REEL_COUNT - 1) return;
        const remaining = spinning[0];
        const grid = currentSlotGrid();
        let target = '';
        for (const line of PAYLINES) {
            const ids = [];
            for (let reelIndex = 0; reelIndex < REEL_COUNT; reelIndex++) {
                if (reelIndex === remaining) continue;
                ids.push(grid[reelIndex][line[reelIndex]]);
            }
            const nonWild = ids.filter(id => id !== 'ghost' && id !== 'magician');
            if (!nonWild.length) {
                target = 'ghost';
                break;
            }
            const unique = [...new Set(nonWild)];
            if (unique.length === 1 && ids.filter(id => id === unique[0] || id === 'ghost').length >= 3) {
                target = unique[0];
                break;
            }
        }
        const scatterCount = grid.reduce((total, column, reelIndex) => {
            if (reelIndex === remaining) return total;
            return total + column.filter(id => id === 'magician').length;
        }, 0);
        if (scatterCount >= 2) target = 'magician';
        if (!target) return;
        const symbol = SYMBOL_BY_ID[target];
        slotState.reachUntil = performance.now() + 2600;
        slotState.reachText = target === 'magician'
            ? 'SCATTER REACH!'
            : ['dragon', 'machine', 'ghost'].includes(target) ? `${symbol.role} SUPER REACH!` : `${symbol.role} REACH!`;
        window.playCasinoGameBGM('slot_reach');
        const shell = document.querySelector('.casino-slot-shell');
        if (shell) {
            shell.classList.remove('is-reaching');
            void shell.offsetWidth;
            shell.classList.add('is-reaching');
            setTimeout(() => {
                if (shell) shell.classList.remove('is-reaching');
            }, 1600);
        }
        setSlotNotice(`最後のリールで${symbol.name}がそろえば当たり！`, 'reach');
    }

    function evaluateSlotGrid(grid, bet) {
        const wins = [];
        const cells = new Set();
        PAYLINES.forEach((line, lineIndex) => {
            const ids = line.map((row, reelIndex) => grid[reelIndex][row]);
            let target = ids.find(id => id !== 'ghost') || 'ghost';
            if (target === 'magician') return;
            let count = 0;
            for (const id of ids) {
                if (id === target || id === 'ghost') count += 1;
                else break;
            }
            if (count < 3) return;
            const symbol = SYMBOL_BY_ID[target] || SYMBOL_BY_ID.ghost;
            const multiplier = Number(symbol.payouts[count]) || 0;
            if (!multiplier) return;
            wins.push({ kind: 'line', lineIndex, symbolId: target, count, multiplier, ids });
            for (let reelIndex = 0; reelIndex < count; reelIndex++) cells.add(`${reelIndex},${line[reelIndex]}`);
        });
        let scatterCount = 0;
        grid.forEach((column, reelIndex) => {
            column.forEach((id, row) => {
                if (id === 'magician') {
                    scatterCount += 1;
                    if (scatterCount <= 5) cells.add(`${reelIndex},${row}`);
                }
            });
        });
        if (scatterCount >= 3) {
            const count = Math.min(5, scatterCount);
            wins.push({
                kind: 'scatter', lineIndex: -1, symbolId: 'magician', count,
                multiplier: Number(SYMBOL_BY_ID.magician.payouts[count]) || 0
            });
        }
        const baseMultiplier = wins.reduce((total, win) => total + win.multiplier, 0);
        return { wins, cells, scatterCount, baseMultiplier, basePayout: baseMultiplier * bet };
    }

    function uniqueWinCounts(wins) {
        const counts = {};
        wins.forEach(win => {
            counts[win.symbolId] = Math.max(Number(counts[win.symbolId]) || 0, Number(win.count) || 0);
        });
        return counts;
    }

    function statIncreaseForCount(count) {
        if (count >= 5) return 3;
        if (count >= 4) return 1;
        return 0;
    }

    function spawnSlotEnemyIfNeeded() {
        const daily = slotState.daily;
        if (daily.enemy) return;
        daily.enemyGap += 1;
        const roll = seededRandom(hash(`${daily.dayKey}_enemy_${daily.spins}`))();
        const chance = .12 + daily.luck * .025;
        if (daily.enemyGap < 6 && roll >= chance) return;
        let skins = [];
        try {
            if (typeof aiConfigs !== 'undefined' && aiConfigs) {
                skins = Object.keys(aiConfigs).filter(key => key && key !== (window.aiPet && window.aiPet.currentSkin));
            }
        } catch (error) {
            skins = [];
        }
        if (!skins.length) skins = ['robot', 'spirit', 'magician', 'stone', 'bird', 'dragon'];
        const skin = skins[hash(`${daily.dayKey}_${daily.spins}_skin`) % skins.length];
        daily.enemy = { skin, hp: 100, stunned: false };
        daily.enemyGap = 0;
        slotState.enemyPet = stageActorFrom({ currentSkin: skin, baseType: skin }, skin);
        slotState.effectUntil = performance.now() + 1800;
        slotState.effectAction = 'move';
        slotState.effectFast = false;
        slotState.effectText = 'ENEMY APPEARED!';
        slotState.effectColor = '#ff4c86';
    }

    function choosePrimaryEffect(counts) {
        const priority = ['dragon', 'ghost', 'magician', 'machine', 'stone', 'bird', 'beetle', 'balloon', 'seed', 'robot', 'spirit'];
        return priority.find(id => Number(counts[id]) >= 3) || '';
    }

    function restoreSlotIdleBGM() {
        if (!slotState || slotState.spinning || !document.getElementById('casino-slot-ui')) return;
        window.playCasinoGameBGM(slotState.daily.freeSpins > 0 ? 'slot_free' : 'slot_main');
    }

    function playSlotWinBGM(result) {
        const primarySymbol = choosePrimaryEffect(uniqueWinCounts(result.wins));
        const bgmType = SLOT_WIN_BGM_BY_SYMBOL[primarySymbol];
        if (!bgmType) {
            restoreSlotIdleBGM();
            return;
        }
        window.playCasinoGameBGM(bgmType, {
            loop: false,
            onEnded: restoreSlotIdleBGM
        });
    }

    function applySlotEffects(result) {
        const hero = window.aiPet || {};
        if (!hero.stats) hero.stats = { power: 10, intel: 10, beauty: 10, speed: 10 };
        const daily = slotState.daily;
        const counts = uniqueWinCounts(result.wins);
        const statMessages = [];
        const statBindings = [
            ['machine', 'power', '力'],
            ['magician', 'intel', '賢さ'],
            ['bird', 'speed', '素早さ'],
            ['stone', 'beauty', '美しさ']
        ];
        statBindings.forEach(([symbolId, stat, label]) => {
            const amount = statIncreaseForCount(Number(counts[symbolId]) || 0);
            if (!amount) return;
            hero.stats[stat] = (Number(hero.stats[stat]) || 0) + amount;
            statMessages.push(`${label}+${amount}`);
        });

        const bonusMessages = [];
        if (counts.robot >= 3) {
            daily.assistSpins = Math.max(daily.assistSpins, counts.robot >= 5 ? 2 : 1);
            bonusMessages.push(`次回目押し補助${daily.assistSpins}回`);
        }
        if (counts.seed >= 3) {
            daily.payoutBoost = Math.max(daily.payoutBoost, counts.seed >= 5 ? 2 : 1.5);
            bonusMessages.push(`次回配当×${daily.payoutBoost.toFixed(1)}`);
        }
        if (counts.balloon >= 3) daily.stageHp = Math.min(100, daily.stageHp + (counts.balloon >= 5 ? 45 : 24));
        if (counts.spirit >= 3) daily.stageHp = Math.min(100, daily.stageHp + (counts.spirit >= 5 ? 60 : 20));
        if (daily.enemy && counts.beetle >= 3) daily.enemy.stunned = true;

        let battleMessage = '';
        if (daily.enemy && result.wins.length) {
            let damage = Object.entries(counts).reduce((total, [id, count]) => {
                const symbol = SYMBOL_BY_ID[id];
                return total + (symbol ? symbol.damage + Math.max(0, count - 3) * Math.ceil(symbol.damage * .45) : 0);
            }, 0);
            if (counts.ghost >= 3) damage *= 2;
            daily.enemy.hp = Math.max(0, daily.enemy.hp - damage);
            battleMessage = `敵に${damage}ダメージ`;
            if (daily.enemy.hp <= 0) {
                const reward = 20 + daily.luck * 5;
                hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) + reward;
                battleMessage = `敵を撃破！ BATTLE BONUS +${reward}コイン`;
                daily.enemy = null;
                daily.stageHp = Math.min(100, daily.stageHp + 25);
            }
        } else if (daily.enemy && !result.wins.length) {
            if (daily.enemy.stunned) {
                daily.enemy.stunned = false;
                battleMessage = 'ベルの音で敵の反撃を防いだ！';
            } else {
                daily.stageHp = Math.max(0, daily.stageHp - 18);
                battleMessage = '敵の反撃！ 演出HP -18';
                if (daily.stageHp <= 0) {
                    daily.stageHp = 100;
                    daily.enemy = null;
                    battleMessage = '敵は去っていった。演出HPを回復して再出発！';
                }
            }
        }

        const primary = choosePrimaryEffect(counts);
        const effectMap = {
            machine: ['train', false, 'BAR TRAINING!', '#ff9b4a'],
            magician: ['study', false, 'MAGIC STUDY!', '#bf75ff'],
            bird: ['move', true, 'CLOVER RUN!', '#65e66a'],
            dragon: ['move', true, 'DRAGON SEVEN!', '#ffd54a'],
            ghost: ['move', true, 'WILD DOUBLE!', '#46f0d0'],
            stone: ['idle', false, 'DIAMOND BARRIER!', '#78ddff'],
            beetle: ['idle', false, 'BELL STUN!', '#ffb300'],
            balloon: ['eat_raw', false, 'WATERMELON HEAL!', '#4caf50'],
            seed: ['idle', false, 'PLUM GROWTH!', '#d65db1'],
            robot: ['idle', false, 'LEMON ASSIST!', '#ffe45e'],
            spirit: ['idle', false, 'CHERRY HEAL!', '#ef476f']
        };
        if (primary && effectMap[primary]) {
            const [action, fast, text, color] = effectMap[primary];
            slotState.effectAction = action;
            slotState.effectFast = fast;
            slotState.effectText = text;
            slotState.effectColor = color;
            slotState.effectUntil = performance.now() + 2300;
        }
        if (typeof window.updateStatUI === 'function' && statMessages.length) window.updateStatUI();
        return [statMessages.join('、'), bonusMessages.join('、'), battleMessage].filter(Boolean).join(' ／ ');
    }

    function recordSlotResult(won, netCoins) {
        if (typeof window.recordDealerCasinoGameResult !== 'function') return;
        window.recordDealerCasinoGameResult('slot', won ? 'win' : 'loss', {
            netCoins,
            opponentId: 'slot_machine',
            opponentName: 'スロット台',
            opponentType: 'machine'
        });
    }

    function finishCasinoSlotSpin() {
        if (!slotState || !slotState.spinning) return;
        const hero = window.aiPet;
        const daily = slotState.daily;
        const grid = currentSlotGrid();
        const result = evaluateSlotGrid(grid, slotState.bet);
        const boost = Math.max(1, Number(slotState.activePayoutBoost) || 1);
        const payout = Math.floor(result.basePayout * boost);
        result.payout = payout;
        result.wins.forEach(win => {
            if (win.kind !== 'scatter') return;
            const freeAward = win.count >= 5 ? 10 : win.count >= 4 ? 5 : 3;
            daily.freeSpins += freeAward;
        });
        if (payout > 0) hero.casinoCoins += payout;
        const effectMessage = applySlotEffects(result);
        const won = result.wins.length > 0;
        if (won) {
            daily.wins += 1;
            daily.lossStreak = 0;
        } else {
            daily.losses += 1;
            daily.lossStreak += 1;
        }
        recordSlotResult(won, payout - slotState.spinCost);
        slotState.winCells = result.cells;
        slotState.spinning = false;
        const lineNames = result.wins.map(win => {
            const location = win.kind === 'scatter' ? '画面内' : (PAYLINE_NAMES[win.lineIndex] || `ライン${win.lineIndex + 1}`);
            return `${location}：${SYMBOL_BY_ID[win.symbolId].name}${win.count}個`;
        }).join('・');
        if (won) {
            const boostText = boost > 1 ? `（成長倍率×${boost.toFixed(1)}）` : '';
            setSlotNotice(`${lineNames}成立！ +${payout}コイン${boostText}${effectMessage ? ` ／ ${effectMessage}` : ''}`, 'win');
        } else {
            setSlotNotice(effectMessage || '今回はラインがそろいませんでした。もう一度狙ってみよう。', 'lose');
        }
        slotState.reachUntil = 0;
        if (won) playSlotWinBGM(result);
        else restoreSlotIdleBGM();
        refreshSlotHud();
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
    }

    function onCasinoSlotReelStopped() {
        if (!slotState) return;
        refreshSlotHud();
        if (slotState.reels.every(reel => reel.status === 'stopped')) {
            finishCasinoSlotSpin();
        } else {
            detectSlotReach();
        }
    }

    window.stopCasinoSlotReel = function (index) {
        index = Math.floor(Number(index));
        if (!slotState || !slotState.spinning || index < 0 || index >= REEL_COUNT) return false;
        const reel = slotState.reels[index];
        if (!reel || reel.status !== 'spinning') return false;
        const now = performance.now();
        reel.status = 'stopping';
        reel.stopStartedAt = now;
        reel.stopDuration = slotState.activeAssist ? 440 : 300;
        reel.stopStartPosition = reel.position;
        reel.stopTargetPosition = Math.ceil(reel.position + reel.speed * (slotState.activeAssist ? .19 : .14));
        refreshSlotHud();
        return true;
    };

    window.startCasinoSlotSpin = function () {
        if (!slotState || slotState.spinning) return false;
        const hero = window.aiPet;
        const latestDaily = ensureSlotDailyState();
        if (!hero || !latestDaily) return false;
        if (latestDaily !== slotState.daily) {
            slotState.daily = latestDaily;
            slotState.reels.forEach((reel, index) => {
                reel.strip = buildReelStrip(latestDaily, index);
                reel.position = hash(`${latestDaily.dayKey}_${index}_position`) % reel.strip.length;
            });
        }
        const betInput = document.getElementById('casino-slot-bet');
        const bet = [1, 5, 10].includes(Number(betInput && betInput.value)) ? Number(betInput.value) : 1;
        const free = latestDaily.freeSpins > 0;
        if (!free && Number(hero.casinoCoins || 0) < bet) {
            setSlotNotice('カジノコインが足りません。カジノへ戻り、ディーラーから購入してください。', 'lose');
            return false;
        }
        if (free) latestDaily.freeSpins -= 1;
        else hero.casinoCoins -= bet;
        slotState.bet = bet;
        slotState.spinCost = free ? 0 : bet;
        slotState.activePayoutBoost = latestDaily.payoutBoost;
        latestDaily.payoutBoost = 1;
        slotState.activeAssist = latestDaily.assistSpins > 0;
        if (slotState.activeAssist) latestDaily.assistSpins -= 1;
        latestDaily.spins += 1;
        spawnSlotEnemyIfNeeded();
        const speedScale = (1 - (latestDaily.luck - 3) * .025) * (slotState.activeAssist ? .68 : 1);
        slotState.reels.forEach((reel, index) => {
            reel.status = 'spinning';
            reel.speed = (3.05 + index * .17) * speedScale;
            reel.stopStartedAt = 0;
        });
        slotState.spinning = true;
        slotState.winCells = new Set();
        slotState.reachUntil = 0;
        slotState.lastFrameAt = performance.now();
        setSlotNotice(slotState.activeAssist ? 'LEMON ASSIST中。リールがゆっくり回っています。1～5で停止！' : '停止ボタン、数字キー1～5、またはリールを押して止めよう！', 'normal');
        window.playCasinoGameBGM(free ? 'slot_free' : 'slot_main');
        refreshSlotHud();
        if (typeof window.saveGameData === 'function') window.saveGameData();
        return true;
    };

    function slotAnimationLoop(now) {
        if (!slotState || !document.getElementById('casino-slot-ui')) return;
        const previous = Number(slotState.lastFrameAt) || now;
        const delta = Math.min(.05, Math.max(0, (now - previous) / 1000));
        slotState.lastFrameAt = now;
        slotState.stageOffset = (Number(slotState.stageOffset) || 0) + delta * 120;
        slotState.reels.forEach(reel => {
            if (reel.status === 'spinning') {
                reel.position += reel.speed * delta;
            } else if (reel.status === 'stopping') {
                const progress = Math.max(0, Math.min(1, (now - reel.stopStartedAt) / reel.stopDuration));
                const eased = 1 - Math.pow(1 - progress, 3);
                reel.position = reel.stopStartPosition + (reel.stopTargetPosition - reel.stopStartPosition) * eased;
                if (progress >= 1) {
                    reel.position = ((reel.stopTargetPosition % reel.strip.length) + reel.strip.length) % reel.strip.length;
                    reel.status = 'stopped';
                    onCasinoSlotReelStopped();
                }
            }
        });
        drawSlotStage(now);
        drawSlotReels();
        animationFrame = requestAnimationFrame(slotAnimationLoop);
    }

    function slotStyleHtml() {
        return `<style>
            #casino-slot-ui::backdrop{background:rgba(0,0,0,.9);backdrop-filter:blur(4px)}
            .casino-slot-shell{width:min(1120px,100vw);height:100vh;max-height:100vh;overflow:auto;box-sizing:border-box;padding:14px 22px 22px;background:radial-gradient(circle at 50% 8%,#4d1436,#10070e 48%,#050305);color:#fff;border-left:3px solid #d6a744;border-right:3px solid #d6a744;box-shadow:0 0 70px #000,inset 0 0 34px rgba(255,71,143,.12)}
            .casino-slot-head{display:flex;align-items:center;gap:14px;min-height:56px;padding:5px 4px 12px;border-bottom:1px solid rgba(255,218,116,.3)}
            .casino-slot-title{margin:0;color:#ffe082;font-size:clamp(21px,3vw,30px);letter-spacing:.08em;text-shadow:0 0 18px rgba(255,75,159,.55)}
            .casino-slot-wallet{display:flex;gap:12px;margin-left:auto;align-items:center;flex-wrap:wrap;justify-content:flex-end}
            .casino-slot-chip{padding:7px 11px;border:1px solid rgba(255,218,116,.45);border-radius:999px;background:rgba(0,0,0,.38);font-size:12px;color:#d8c8ce;white-space:nowrap}.casino-slot-chip b{color:#ffe082;font-size:14px}
            .casino-slot-back{appearance:none;padding:10px 15px;border:1px solid #c86c83;border-radius:9px;background:linear-gradient(#713149,#35131f);color:#fff;font-weight:900;cursor:pointer}
            .casino-slot-stage-frame{position:relative;margin:13px 0 10px;border:3px solid #d6a744;border-radius:16px;overflow:hidden;background:#071127;box-shadow:0 0 0 2px #5b2615 inset,0 0 24px rgba(255,73,154,.25)}
            #casino-slot-stage{display:block;width:100%;height:min(25vh,270px);min-height:170px}
            .casino-slot-reel-frame{position:relative;padding:9px;border:4px solid #e0b54e;border-radius:18px;background:linear-gradient(145deg,#6c273e,#221019);box-shadow:0 0 0 2px #3b1622 inset,0 11px 28px #000}
            .casino-slot-reel-frame:before,.casino-slot-reel-frame:after{content:'';position:absolute;left:12px;right:12px;height:4px;background:linear-gradient(90deg,transparent,#ffec99,transparent);z-index:3}.casino-slot-reel-frame:before{top:33.33%}.casino-slot-reel-frame:after{top:66.66%}
            #casino-slot-reels{display:block;width:100%;height:min(41vh,450px);min-height:270px;border-radius:10px;cursor:pointer;touch-action:manipulation}
            .casino-slot-stop-row{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:11px 7px 0}
            .casino-slot-stop{appearance:none;min-height:52px;border:2px solid #ff8ab9;border-radius:50px;background:radial-gradient(circle at 50% 30%,#ff5a9b,#8d1748 62%,#3d0a21);color:#fff;font-size:17px;font-weight:950;cursor:pointer;box-shadow:0 5px 0 #360719,0 0 14px rgba(255,63,140,.3);transition:transform .12s,filter .12s}
            .casino-slot-stop:not(:disabled):active{transform:translateY(4px);box-shadow:0 1px 0 #360719}.casino-slot-stop:disabled{filter:grayscale(.8);opacity:.45;cursor:default}.casino-slot-stop.is-stopping{filter:hue-rotate(55deg);opacity:.8}.casino-slot-stop.is-stopped{background:#29202a;color:#9b8f96}
            .casino-slot-controls{display:grid;grid-template-columns:minmax(150px,220px) 1fr minmax(170px,250px);gap:13px;align-items:stretch;margin-top:13px}
            .casino-slot-bet,.casino-slot-status-box{display:grid;gap:5px;padding:10px 13px;border:1px solid #68414d;border-radius:11px;background:rgba(0,0,0,.34);color:#cdbdc2;font-size:11px}.casino-slot-bet select{width:100%;padding:7px;border:1px solid #a8783b;border-radius:7px;background:#160a10;color:#fff;font-weight:bold}
            #casino-slot-spin{appearance:none;border:3px solid #ffe68a;border-radius:14px;background:radial-gradient(circle at 50% 30%,#ffd95a,#c27d18 62%,#69400e);color:#2a1204;font-size:clamp(20px,3vw,29px);font-weight:1000;letter-spacing:.11em;cursor:pointer;text-shadow:0 1px rgba(255,255,255,.4);box-shadow:0 7px 0 #5e3307,0 0 25px rgba(255,202,40,.3)}#casino-slot-spin:disabled{filter:grayscale(.7);opacity:.55;cursor:default}
            .casino-slot-status-box b{color:#ffe082}.casino-slot-status-box>span{display:flex;justify-content:space-between;gap:8px}
            #casino-slot-notice{min-height:22px;margin:12px 4px 0;text-align:center;color:#e4d5da;font-weight:800;font-size:13px;line-height:1.55}#casino-slot-notice[data-tone="win"]{color:#ffe082;text-shadow:0 0 12px rgba(255,215,72,.45)}#casino-slot-notice[data-tone="lose"]{color:#ff9dad}#casino-slot-notice[data-tone="reach"]{color:#ffdf70;animation:slotNoticePulse .55s ease-in-out infinite alternate}
            .casino-slot-help{margin-top:9px;border:1px solid #4e3039;border-radius:10px;background:rgba(0,0,0,.28);color:#c7b7bd;font-size:12px}.casino-slot-help summary{padding:10px 13px;color:#ffe0a0;font-weight:bold;cursor:pointer}.casino-slot-help div{padding:0 13px 12px;line-height:1.65}
            .casino-slot-shell.is-reaching{animation:slotShellReach .18s ease-in-out 5 alternate}
            @keyframes slotShellReach{from{filter:none}to{filter:brightness(1.22);box-shadow:0 0 85px #ff3f91,inset 0 0 45px rgba(255,214,77,.28)}}@keyframes slotNoticePulse{from{transform:scale(.99)}to{transform:scale(1.02)}}
            @media(max-width:720px){.casino-slot-shell{padding:8px 8px 16px}.casino-slot-head{align-items:flex-start;flex-wrap:wrap}.casino-slot-wallet{order:3;width:100%;margin-left:0;justify-content:flex-start}.casino-slot-controls{grid-template-columns:1fr 1fr}.casino-slot-status-box{grid-column:1/-1}.casino-slot-stop-row{gap:5px}.casino-slot-stop{min-height:44px;font-size:13px}.casino-slot-reel-frame{padding:5px}.casino-slot-title{font-size:20px}#casino-slot-stage{height:180px}#casino-slot-reels{height:300px}}
        </style>`;
    }

    function slotHelpHtml() {
        return `<details class="casino-slot-help"><summary>配当とシンボル効果</summary><div>
            上段・中段・下段・V字・逆V字の5本が有効です。各ラインの左端から同じシンボルが3・4・5列続くと配当。WILDはSCATTER以外を代用し、SCATTERは画面内3個以上でフリースピンです。<br>
            BAR：筋トレ・力上昇 ／ SCATTER：勉強・賢さ上昇 ／ クローバー：ランニング・素早さ上昇 ／ ダイヤ：美しさ上昇。能力は4個で+1、5個で+3です。<br>
            ベル：敵を気絶 ／ スイカ・チェリー：演出HP回復 ／ プラム：次回配当倍率 ／ レモン：次回目押し補助 ／ 7・WILD：大ダメージ。
        </div></details>`;
    }

    function closeSlotOverlayElement() {
        const overlay = document.getElementById('casino-slot-ui');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
    }

    window.openCasinoSlotGame = function () {
        const hero = window.aiPet;
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        const installedCount = state
            ? (state.objects || []).filter(obj => obj && obj.equipmentType === 'slot_machine' && !obj.installing).length
            : 0;
        const installed = installedCount > 0;
        if (!hero || !window.casinoMapOpen || !installed) {
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('設置済みのスロット台が見つかりません。');
            return false;
        }
        window.closeCasinoSlotGame({ reopening: true });
        loadSymbolImages();
        const daily = ensureSlotDailyState();
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-slot-ui';
        overlay.setAttribute('aria-label', '5列目押しスロット');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:#050305;color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `${slotStyleHtml()}<div class="casino-slot-shell">
            <div class="casino-slot-head">
                <h2 class="casino-slot-title">🎰 SLOT ARENA</h2>
                <div class="casino-slot-wallet">
                    <span class="casino-slot-chip">コイン <b id="casino-slot-coins">0</b></span>
                    <span class="casino-slot-chip">FREE <b id="casino-slot-free-spins">0</b></span>
                    <span class="casino-slot-chip"><span id="casino-slot-boost-label">次回倍率</span> <b id="casino-slot-boost">×1.0</b></span>
                </div>
                ${installedCount >= 2 ? '<button type="button" class="casino-slot-back" style="border-color:#ffe082;background:linear-gradient(#8a6420,#382306);" onclick="window.openCasinoSlotBattleLobby()">⚔ 師匠対戦</button>' : ''}
                <button type="button" class="casino-slot-back" onclick="window.closeCasinoSlotGame()">← カジノへ戻る</button>
            </div>
            <div class="casino-slot-stage-frame"><canvas id="casino-slot-stage" width="1000" height="260"></canvas></div>
            <div class="casino-slot-reel-frame"><canvas id="casino-slot-reels" width="1000" height="450"></canvas></div>
            <div class="casino-slot-stop-row">${Array.from({ length: REEL_COUNT }, (_, index) => `<button type="button" class="casino-slot-stop" data-slot-stop="${index}" onclick="window.stopCasinoSlotReel(${index})" disabled>STOP ${index + 1}</button>`).join('')}</div>
            <div class="casino-slot-controls">
                <label class="casino-slot-bet"><span>1回のBET</span><select id="casino-slot-bet"><option value="1">1コイン</option><option value="5">5コイン</option><option value="10">10コイン</option></select></label>
                <button type="button" id="casino-slot-spin" onclick="window.startCasinoSlotSpin()">SPIN</button>
                <div class="casino-slot-status-box"><span>本日のコンディション <b id="casino-slot-condition"></b></span><span>更新 <b id="casino-slot-day-key">${daily.dayKey} 0:00～</b></span></div>
            </div>
            <div id="casino-slot-notice" aria-live="polite">SPINを押して、流れているリールを狙って止めよう。</div>
            ${slotHelpHtml()}
        </div>`;
        document.body.appendChild(overlay);

        const reelCanvas = overlay.querySelector('#casino-slot-reels');
        const stageCanvas = overlay.querySelector('#casino-slot-stage');
        const enemyCanvas = document.createElement('canvas');
        enemyCanvas.width = 300;
        enemyCanvas.height = 220;
        const reels = Array.from({ length: REEL_COUNT }, (_, index) => {
            const strip = buildReelStrip(daily, index);
            return {
                strip,
                position: hash(`${daily.dayKey}_${daily.spins}_${index}_open`) % strip.length,
                speed: 0,
                status: 'stopped',
                stopStartedAt: 0
            };
        });
        slotState = {
            daily,
            reels,
            spinning: false,
            bet: 1,
            spinCost: 0,
            activePayoutBoost: 1,
            activeAssist: false,
            winCells: new Set(),
            reelCtx: reelCanvas.getContext('2d'),
            stageCtx: stageCanvas.getContext('2d'),
            enemyCanvas,
            enemyCtx: enemyCanvas.getContext('2d'),
            stagePet: stageActorFrom(hero, hero.currentSkin || hero.baseType || 'robot'),
            enemyPet: stageActorFrom(daily.enemy ? { currentSkin: daily.enemy.skin, baseType: daily.enemy.skin } : null, 'robot'),
            stageOffset: 0,
            effectUntil: 0,
            effectAction: 'move',
            effectFast: false,
            effectText: '',
            effectColor: '#ffd54a',
            reachUntil: 0,
            reachText: '',
            lastFrameAt: performance.now(),
            notice: ''
        };
        window.playCasinoGameBGM(daily.freeSpins > 0 ? 'slot_free' : 'slot_main');
        reelCanvas.addEventListener('click', event => {
            if (!slotState || !slotState.spinning) return;
            const rect = reelCanvas.getBoundingClientRect();
            const index = Math.max(0, Math.min(REEL_COUNT - 1, Math.floor((event.clientX - rect.left) / Math.max(1, rect.width) * REEL_COUNT)));
            window.stopCasinoSlotReel(index);
        });
        overlay.addEventListener('keydown', event => {
            if (/^[1-5]$/.test(event.key)) {
                event.preventDefault();
                window.stopCasinoSlotReel(Number(event.key) - 1);
            } else if (event.code === 'Space' && event.target && !['SELECT', 'INPUT', 'BUTTON'].includes(event.target.tagName)) {
                event.preventDefault();
                window.startCasinoSlotSpin();
            }
        });
        overlay.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoSlotGame();
        });
        if (typeof overlay.showModal === 'function') {
            try {
                overlay.showModal();
            } catch (error) {
                console.warn('スロットUIをtop layerへ移動できなかったため、通常表示を使用します。', error);
                overlay.setAttribute('open', '');
            }
        } else {
            overlay.setAttribute('open', '');
        }
        overlay.tabIndex = -1;
        overlay.focus();
        refreshSlotHud();
        drawSlotReels();
        drawSlotStage(performance.now());
        animationFrame = requestAnimationFrame(slotAnimationLoop);
        return true;
    };

    window.closeCasinoSlotGame = function (options) {
        options = options || {};
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        if (slotState && slotState.spinning) {
            slotState.spinning = false;
            slotState.daily.losses += 1;
            slotState.daily.lossStreak += 1;
            recordSlotResult(false, -slotState.spinCost);
        }
        closeSlotOverlayElement();
        slotState = null;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (!options.reopening && window.casinoMapOpen && typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        if (!options.reopening) window.restoreCasinoLobbyBGM();
        const input = document.getElementById('casino-chat-input');
        if (!options.reopening && input) setTimeout(() => input.focus(), 0);
    };

    function casinoSlotBattleInstalledCount() {
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        return state
            ? (state.objects || []).filter(obj => obj && obj.equipmentType === 'slot_machine' && !obj.installing).length
            : 0;
    }

    function casinoSlotBattleEscape(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function casinoSlotBattleOpponents() {
        const dealerProfile = typeof window.getCasinoMasterProfile === 'function'
            ? window.getCasinoMasterProfile('dealer')
            : null;
        const opponents = [{
            id: 'dealer',
            kind: 'dealer',
            type: 'dealer',
            masterType: 'dealer',
            name: dealerProfile && dealerProfile.name ? dealerProfile.name : 'ディーラー',
            image: dealerProfile && dealerProfile.image ? dealerProfile.image : 'dealer_battle_enemy.png'
        }];
        const visitors = typeof window.getCasinoEligibleGameMasters === 'function'
            ? window.getCasinoEligibleGameMasters()
            : [];
        visitors.slice(0, 3).forEach(visitor => {
            if (!visitor || !visitor.masterType || opponents.some(entry => entry.masterType === visitor.masterType)) return;
            const profile = typeof window.getCasinoMasterProfile === 'function'
                ? window.getCasinoMasterProfile(visitor.masterType)
                : null;
            opponents.push({
                id: visitor.id || `master_${visitor.masterType}`,
                kind: 'master',
                type: 'master',
                masterType: visitor.masterType,
                name: visitor.name || (profile && profile.name) || visitor.masterType,
                image: (profile && profile.image) || ''
            });
        });
        return opponents;
    }

    window.getCasinoSlotBattleOpponents = casinoSlotBattleOpponents;
    window.canStartCasinoSlotMasterBattle = function () {
        return casinoSlotBattleInstalledCount() >= 2 && casinoSlotBattleOpponents().length > 0;
    };

    function normalizeCasinoSlotBattleStat(value) {
        const raw = Math.max(1, Number(value) || 1);
        return Math.max(50, Math.min(200, Math.round(100 + 40 * Math.log10(raw / 100))));
    }

    function casinoSlotBattlePlayerStats(mode) {
        if (mode !== 'trained') {
            return Object.assign({ hp: SLOT_BATTLE_FIXED_HP, maxHp: SLOT_BATTLE_FIXED_HP }, SLOT_BATTLE_PLAYER_STATS);
        }
        const hero = window.aiPet || {};
        const stats = hero.stats || {};
        const rawPower = Math.max(1, Number(stats.power) || 10);
        const generation = Math.max(0, Number(hero.generation || hero.generationCount) || 0);
        const age = Math.max(0, Number(hero.age) || 0);
        const dungeonHp = Math.max(1, 100 + rawPower * 2 + generation * 5 + age * 2);
        const maxHp = Math.max(700, Math.min(1800, Math.round(1000 + 250 * Math.log10(dungeonHp / 400))));
        const energy = Math.max(0, Math.min(100, Number.isFinite(Number(hero.energy)) ? Number(hero.energy) : 100));
        return {
            hp: Math.max(1, Math.floor(maxHp * energy / 100)),
            maxHp,
            power: normalizeCasinoSlotBattleStat(stats.power),
            intel: normalizeCasinoSlotBattleStat(stats.intel),
            speed: normalizeCasinoSlotBattleStat(stats.speed)
        };
    }

    function casinoSlotBattleMasterStats(masterType) {
        const stats = SLOT_BATTLE_MASTER_STATS[masterType] || SLOT_BATTLE_PLAYER_STATS;
        return Object.assign({ hp: SLOT_BATTLE_FIXED_HP, maxHp: SLOT_BATTLE_FIXED_HP }, stats);
    }

    function casinoSlotBattleMasterPresentation(masterType, opponent) {
        const profile = typeof window.getCasinoMasterProfile === 'function' ? window.getCasinoMasterProfile(masterType) : null;
        const presentation = SLOT_BATTLE_MASTER_PRESENTATION[masterType] || SLOT_BATTLE_MASTER_PRESENTATION.dealer;
        return Object.assign({}, presentation, {
            masterType,
            name: (opponent && opponent.name) || presentation.name || (profile && profile.name) || masterType,
            image: (opponent && opponent.image) || presentation.image || (profile && profile.image) || ''
        });
    }

    function casinoSlotBattleDialogueText(event, details) {
        if (!slotBattleState || !slotBattleState.opponent) return '';
        details = details || {};
        const masterType = slotBattleState.opponent.masterType;
        const presentation = SLOT_BATTLE_MASTER_PRESENTATION[masterType] || SLOT_BATTLE_MASTER_PRESENTATION.dealer;
        if (presentation[event]) return String(presentation[event]);
        const profile = typeof window.getCasinoMasterProfile === 'function' ? window.getCasinoMasterProfile(masterType) : null;
        const mappedEvent = event === 'attack' || event === 'big' ? 'play' : event === 'damaged' ? 'tcg_damaged' : event;
        if (profile && typeof window.getCasinoMasterGameDialogue === 'function') {
            return window.getCasinoMasterGameDialogue(masterType, mappedEvent, details);
        }
        const fallbacks = {
            attack: 'ここで攻める！',
            damaged: `${details.damage || ''}ダメージか。まだ勝負は終わらない！`,
            start: 'さあ、勝負を始めよう！',
            win: '今回は私の勝ちだね。',
            loss: '見事だ。あなたの勝ちだよ。',
            draw: '互角だね。もう一度勝負しよう。'
        };
        return fallbacks[event] || fallbacks.attack;
    }

    function showCasinoSlotDialog(dialog) {
        document.body.appendChild(dialog);
        if (typeof dialog.showModal === 'function') {
            try {
                dialog.showModal();
            } catch (error) {
                dialog.setAttribute('open', '');
            }
        } else {
            dialog.setAttribute('open', '');
        }
        dialog.tabIndex = -1;
        dialog.focus();
    }

    function removeCasinoSlotBattleLobby() {
        const lobby = document.getElementById('casino-slot-battle-lobby');
        if (!lobby) return;
        if (typeof lobby.close === 'function' && lobby.open) lobby.close();
        lobby.remove();
    }

    function casinoSlotBattleLobbyNotice(message, tone) {
        const notice = document.getElementById('casino-slot-battle-lobby-notice');
        if (!notice) return;
        notice.textContent = String(message || '');
        notice.dataset.tone = tone || 'normal';
    }

    window.refreshCasinoSlotBattleLobbyPreview = function () {
        const lobby = document.getElementById('casino-slot-battle-lobby');
        if (!lobby) return;
        const selected = lobby.querySelector('input[name="casino-slot-battle-opponent"]:checked');
        const modeInput = lobby.querySelector('input[name="casino-slot-battle-stat-mode"]:checked');
        const mode = modeInput && modeInput.value === 'trained' ? 'trained' : 'fixed';
        const opponents = casinoSlotBattleOpponents();
        const opponent = opponents.find(entry => entry.masterType === (selected && selected.value)) || opponents[0];
        const player = casinoSlotBattlePlayerStats(mode);
        const master = casinoSlotBattleMasterStats(opponent && opponent.masterType);
        const preview = document.getElementById('casino-slot-battle-stat-preview');
        if (preview) {
            preview.innerHTML = `<div><strong>あなた</strong><span>HP ${player.hp}/${player.maxHp}</span><span>Power ${player.power}</span><span>Intel ${player.intel}</span><span>Speed ${player.speed}</span></div>
                <b>VS</b>
                <div><strong>${casinoSlotBattleEscape(opponent ? opponent.name : '')}</strong><span>HP ${master.hp}/${master.maxHp}</span><span>Power ${master.power}</span><span>Intel ${master.intel}</span><span>Speed ${master.speed}</span></div>`;
        }
    };

    window.openCasinoSlotBattleLobby = function (options) {
        options = options || {};
        if (casinoSlotBattleInstalledCount() < 2) {
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('師匠戦には、設置済みのスロット台が2台以上必要です。');
            return false;
        }
        if (slotBattleState && slotBattleState.active) return false;
        window.closeCasinoSlotGame({ reopening: true });
        removeCasinoSlotBattleLobby();
        if (slotBattleState) cleanupCasinoSlotMasterBattle(false);
        loadSymbolImages();
        const opponents = casinoSlotBattleOpponents();
        if (!opponents.length) {
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('対戦できる師匠がいません。');
            return false;
        }
        const previous = Object.assign({
            masterType: opponents[0].masterType,
            statMode: 'fixed',
            duration: 90,
            bet: 0
        }, slotBattleLastSettings || {}, options.settings || {});
        if (options.preferredMasterType && opponents.some(entry => entry.masterType === options.preferredMasterType)) {
            previous.masterType = options.preferredMasterType;
        }
        if (!opponents.some(entry => entry.masterType === previous.masterType)) previous.masterType = opponents[0].masterType;
        const hero = window.aiPet || {};
        const opponentCards = opponents.map(opponent => {
            const checked = opponent.masterType === previous.masterType ? 'checked' : '';
            return `<label class="csbl-opponent"><input type="radio" name="casino-slot-battle-opponent" value="${casinoSlotBattleEscape(opponent.masterType)}" ${checked} onchange="window.refreshCasinoSlotBattleLobbyPreview()"><span class="csbl-avatar">${opponent.image ? `<img src="${casinoSlotBattleEscape(opponent.image)}" alt="">` : '♟'}</span><strong>${casinoSlotBattleEscape(opponent.name)}</strong><small>${opponent.masterType === 'dealer' ? '常駐' : '来店中'}</small></label>`;
        }).join('');
        const lobby = document.createElement('dialog');
        lobby.id = 'casino-slot-battle-lobby';
        lobby.setAttribute('aria-label', 'スロット師匠戦ルール設定');
        lobby.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483100;background:rgba(5,3,5,.96);color:#fff;font-family:sans-serif;';
        lobby.innerHTML = `<style>
            #casino-slot-battle-lobby::backdrop{background:rgba(0,0,0,.9);backdrop-filter:blur(5px)}
            .csbl-shell{width:min(980px,96vw);max-height:94vh;overflow:auto;margin:3vh auto;padding:24px;box-sizing:border-box;border:3px solid #d9ad49;border-radius:18px;background:radial-gradient(circle at 50% 0,#4b1835,#1b0b13 55%,#090507);box-shadow:0 0 55px #000}
            .csbl-head{display:flex;gap:14px;align-items:center;border-bottom:1px solid #7d5530;padding-bottom:14px}.csbl-head h2{margin:0;color:#ffe082}.csbl-head span{margin-left:auto;color:#ffe082;font-weight:bold}
            .csbl-group{margin-top:18px;padding:15px;border:1px solid #6c4450;border-radius:12px;background:rgba(0,0,0,.28)}.csbl-group h3{margin:0 0 11px;color:#ffd67a}
            .csbl-opponents{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:10px}.csbl-opponent{position:relative;display:grid;justify-items:center;gap:4px;padding:10px;border:2px solid #69424e;border-radius:12px;background:#251018;cursor:pointer}.csbl-opponent:has(input:checked){border-color:#ffd45d;background:#4a2b12;box-shadow:0 0 18px rgba(255,206,80,.28)}.csbl-opponent input{position:absolute;opacity:0}.csbl-avatar{width:76px;height:76px;display:grid;place-items:center;overflow:hidden;border-radius:50%;background:#0c080a}.csbl-avatar img{width:100%;height:100%;object-fit:cover}.csbl-opponent small{color:#bdaeb3}
            .csbl-rules{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}.csbl-rule{display:grid;gap:8px}.csbl-rule input,.csbl-rule select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #a97940;border-radius:8px;background:#13090d;color:#fff;font-weight:bold}.csbl-mode{display:flex;gap:8px;flex-wrap:wrap}.csbl-mode label{flex:1;padding:9px;border:1px solid #68414d;border-radius:8px;background:#180b10;cursor:pointer}.csbl-mode label:has(input:checked){border-color:#ffd45d;background:#473016}
            #casino-slot-battle-stat-preview{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;margin-top:14px}#casino-slot-battle-stat-preview>div{display:flex;flex-wrap:wrap;gap:6px 12px;padding:12px;border-radius:10px;background:#10090c}#casino-slot-battle-stat-preview strong{width:100%;color:#ffe082}#casino-slot-battle-stat-preview span{font-size:12px;color:#ddd}#casino-slot-battle-stat-preview>b{color:#ffcb4f;font-size:22px}
            .csbl-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.csbl-actions button{padding:12px 18px;border:2px solid #7f5360;border-radius:9px;background:#3b1a25;color:#fff;font-weight:bold;cursor:pointer}.csbl-actions .primary{border-color:#ffe082;background:linear-gradient(#dca936,#7b4b08);color:#241300;font-size:17px}
            #casino-slot-battle-lobby-notice{min-height:22px;margin-top:12px;text-align:center;color:#d9c9ce;font-weight:bold}#casino-slot-battle-lobby-notice[data-tone="lose"]{color:#ff98aa}
            @media(max-width:720px){.csbl-shell{padding:14px}.csbl-opponents{grid-template-columns:repeat(2,1fr)}.csbl-rules{grid-template-columns:1fr}.csbl-actions{flex-wrap:wrap}.csbl-actions button{flex:1}}
        </style><div class="csbl-shell">
            <div class="csbl-head"><h2>⚔ スロット師匠戦</h2><span>所持 ${Math.max(0, Math.floor(Number(hero.casinoCoins) || 0)).toLocaleString()}コイン</span></div>
            <section class="csbl-group"><h3>対戦相手</h3><div class="csbl-opponents">${opponentCards}</div></section>
            <section class="csbl-group"><h3>対戦ルール</h3><div class="csbl-rules">
                <div class="csbl-rule"><b>ステータス</b><div class="csbl-mode"><label><input type="radio" name="casino-slot-battle-stat-mode" value="fixed" ${previous.statMode !== 'trained' ? 'checked' : ''} onchange="window.refreshCasinoSlotBattleLobbyPreview()">固定</label><label><input type="radio" name="casino-slot-battle-stat-mode" value="trained" ${previous.statMode === 'trained' ? 'checked' : ''} onchange="window.refreshCasinoSlotBattleLobbyPreview()">育成値参照</label></div></div>
                <label class="csbl-rule"><b>制限時間（30秒以上）</b><input id="casino-slot-battle-duration" type="number" min="30" step="1" value="${Math.max(30, Math.floor(Number(previous.duration) || 90))}"></label>
                <label class="csbl-rule"><b>賭け金</b><select id="casino-slot-battle-bet">${[0, 10, 50, 100].map(value => `<option value="${value}" ${Number(previous.bet) === value ? 'selected' : ''}>${value === 0 ? '0コイン（練習）' : `${value}コイン`}</option>`).join('')}</select></label>
            </div><div id="casino-slot-battle-stat-preview"></div></section>
            <div id="casino-slot-battle-lobby-notice" aria-live="polite">勝者は賭け金の2倍を受け取り、引き分けは返金されます。</div>
            <div class="csbl-actions"><button type="button" onclick="window.closeCasinoSlotBattleLobby()">← カジノへ戻る</button><button type="button" class="primary" onclick="window.startCasinoSlotMasterBattleFromLobby()">対戦開始</button></div>
        </div>`;
        lobby.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoSlotBattleLobby();
        });
        showCasinoSlotDialog(lobby);
        window.refreshCasinoSlotBattleLobbyPreview();
        window.playCasinoGameBGM('slot_main');
        return true;
    };

    window.closeCasinoSlotBattleLobby = function () {
        removeCasinoSlotBattleLobby();
        if (window.casinoMapOpen && typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        window.restoreCasinoLobbyBGM();
        const input = document.getElementById('casino-chat-input');
        if (input) setTimeout(() => input.focus(), 0);
    };

    window.startCasinoSlotMasterBattleFromLobby = function () {
        const lobby = document.getElementById('casino-slot-battle-lobby');
        if (!lobby) return false;
        const selected = lobby.querySelector('input[name="casino-slot-battle-opponent"]:checked');
        const modeInput = lobby.querySelector('input[name="casino-slot-battle-stat-mode"]:checked');
        const durationInput = document.getElementById('casino-slot-battle-duration');
        const betInput = document.getElementById('casino-slot-battle-bet');
        const duration = Math.floor(Number(durationInput && durationInput.value));
        const bet = Number(betInput && betInput.value);
        if (!Number.isFinite(duration) || duration < 30) {
            casinoSlotBattleLobbyNotice('制限時間は30秒以上の整数で入力してください。', 'lose');
            return false;
        }
        if (![0, 10, 50, 100].includes(bet)) {
            casinoSlotBattleLobbyNotice('賭け金を選び直してください。', 'lose');
            return false;
        }
        const opponents = casinoSlotBattleOpponents();
        const opponent = opponents.find(entry => entry.masterType === (selected && selected.value));
        if (!opponent) {
            casinoSlotBattleLobbyNotice('対戦相手を選び直してください。', 'lose');
            return false;
        }
        const hero = window.aiPet || {};
        if (Math.max(0, Number(hero.casinoCoins) || 0) < bet) {
            casinoSlotBattleLobbyNotice('カジノコインが足りません。', 'lose');
            return false;
        }
        const settings = {
            masterType: opponent.masterType,
            opponentId: opponent.id,
            statMode: modeInput && modeInput.value === 'trained' ? 'trained' : 'fixed',
            duration: Math.min(Number.MAX_SAFE_INTEGER / 1000, duration),
            bet
        };
        slotBattleLastSettings = Object.assign({}, settings);
        hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) - bet;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        removeCasinoSlotBattleLobby();
        const started = openCasinoSlotMasterBattle(settings, opponent);
        if (!started) {
            hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) + bet;
            if (typeof window.saveGameData === 'function') window.saveGameData();
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('対戦を開始できなかったため、賭け金を返金しました。');
            if (window.casinoMapOpen && typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
            window.restoreCasinoLobbyBGM();
        }
        return started;
    };

    function casinoSlotBattleStatMultiplier(value) {
        return Math.max(.7, Math.min(1.5, .6 + (Number(value) || 100) * .004));
    }

    function casinoSlotBattleCooldownMultiplier(value) {
        return Math.max(.7, Math.min(1.25, 1.3 - (Number(value) || 100) * .003));
    }

    function createCasinoSlotBattleReels(seed, sideKey) {
        const neutral = { dayKey: `master_battle_${seed}`, luck: 3 };
        return Array.from({ length: REEL_COUNT }, (_, index) => {
            const strip = buildReelStrip(neutral, index);
            return {
                strip,
                position: hash(`${seed}_${sideKey}_${index}`) % strip.length,
                speed: 0,
                status: 'stopped',
                stopStartedAt: 0,
                stopDuration: 300,
                stopStartPosition: 0,
                stopTargetPosition: 0
            };
        });
    }

    function createCasinoSlotBattleSide(key, name, stats, seed, identity) {
        identity = identity || {};
        return {
            key,
            name,
            masterType: identity.masterType || (key === 'player' ? 'player' : ''),
            image: identity.image || '',
            title: identity.title || (key === 'player' ? '挑戦者' : ''),
            accent: identity.color || (key === 'player' ? '#ffd45f' : '#ff78b3'),
            specialName: identity.specialName || 'ジャックポットラッシュ',
            specialKind: identity.kind || 'player',
            hp: stats.hp,
            maxHp: stats.maxHp,
            power: stats.power,
            intel: stats.intel,
            speed: stats.speed,
            barrier: 0,
            specialGauge: 0,
            effectBoost: 1,
            assistCharges: 0,
            pendingInterference: 0,
            speedCredit: 0,
            lastEffectSymbol: '',
            spinCount: 0,
            spinning: false,
            readyAt: 0,
            spinStartedAt: 0,
            autoStopAt: [],
            currentInterferencePenalty: 0,
            reels: createCasinoSlotBattleReels(seed, key),
            winCells: new Set(),
            reelCtx: null
        };
    }

    function casinoSlotBattleSideHtml(side, isPlayer) {
        const prefix = isPlayer ? 'player' : 'master';
        const portrait = isPlayer
            ? '<canvas id="csb-player-avatar" width="140" height="140" aria-label="現在育成中のキャラクター"></canvas>'
            : side.image
                ? `<img src="${casinoSlotBattleEscape(side.image)}" alt="">`
                : '<span>♟</span>';
        return `<section class="csb-side csb-${prefix}" style="--csb-accent:${casinoSlotBattleEscape(side.accent)}">
            <div class="csb-side-head"><div class="csb-identity"><span class="csb-portrait">${portrait}</span><div><strong>${casinoSlotBattleEscape(side.name)}</strong><small>${casinoSlotBattleEscape(side.title)}</small></div></div>${isPlayer ? '' : '<div id="csb-master-dialogue" class="csb-dialogue" aria-live="polite"></div>'}</div>
            <div class="csb-hp-line"><b id="csb-${prefix}-hp-text">${side.hp} / ${side.maxHp}</b></div>
            <div class="csb-hp"><i id="csb-${prefix}-hp-bar" style="width:${Math.max(0, Math.min(100, side.hp / side.maxHp * 100))}%"></i></div>
            <div class="csb-gauge"><span title="${casinoSlotBattleEscape(side.specialName)}">固有技</span><i><b id="csb-${prefix}-special" style="width:0%"></b></i></div>
            <div id="csb-${prefix}-statuses" class="csb-statuses" aria-label="現在の効果"></div>
            <div class="csb-reel-frame"><canvas id="csb-${prefix}-reels" width="600" height="360"></canvas></div>
            <div class="csb-stop-row">${Array.from({ length: REEL_COUNT }, (_, index) => isPlayer
                ? `<button type="button" data-csb-stop="${index}" onclick="window.stopCasinoSlotBattleReel(${index})" disabled>${index + 1}</button>`
                : `<button type="button" disabled>CPU ${index + 1}</button>`).join('')}</div>
            ${isPlayer
                ? '<button type="button" id="csb-player-spin" class="csb-spin" onclick="window.startCasinoSlotBattleSpin()">SPIN</button>'
                : '<div id="csb-master-status" class="csb-cpu-status">待機中</div>'}
        </section>`;
    }

    function drawCasinoSlotBattlePlayerAvatarCanvas(canvas, player, now) {
        if (!canvas || !player) return;
        const ctx = canvas.getContext && canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (typeof window.drawActionCharacterOnContext === 'function' && player.avatarPet) {
            player.avatarPet.frameIndex = Math.floor((Number(now) || 0) / 170) % 3;
            window.drawActionCharacterOnContext(ctx, 'move', canvas.width / 2, canvas.height / 2, player.avatarPet);
            return;
        }
        ctx.fillStyle = '#ffe082';
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', canvas.width / 2, canvas.height / 2);
    }

    function drawCasinoSlotBattlePlayerAvatar(now) {
        if (!slotBattleState || !slotBattleState.player) return;
        const canvas = document.getElementById('csb-player-avatar');
        drawCasinoSlotBattlePlayerAvatarCanvas(canvas, slotBattleState.player, now);
    }

    function casinoSlotBattleStyleHtml() {
        return `<style>
            #casino-slot-master-battle::backdrop{background:rgba(0,0,0,.94);backdrop-filter:blur(4px)}
            .csb-portrait canvas{display:block;width:100%;height:100%}.csb-cutin canvas{width:92px;height:92px;object-fit:cover;border-radius:50%;border:3px solid var(--cutin-color);background:#10080d}.csb-cutin.level-5 canvas{width:125px;height:125px}
            .csb-shell{width:100vw;height:100vh;overflow:auto;box-sizing:border-box;padding:8px 14px 14px;background:radial-gradient(circle at 50% 0,#45152f,#10070d 50%,#040204);color:#fff}
            .csb-head{display:flex;align-items:center;gap:10px;min-height:52px;border-bottom:2px solid #a97a32;padding:3px 4px 8px}.csb-head h2{margin:0;color:#ffe082;font-size:clamp(18px,2.2vw,28px)}.csb-timer{margin-left:auto;display:grid;justify-items:center}.csb-timer small{color:#cbbbc0}.csb-timer b{font-size:25px;color:#fff09a}.csb-head button{padding:9px 12px;border:1px solid #8b5d6d;border-radius:8px;background:#381522;color:#fff;font-weight:bold;cursor:pointer}.csb-head .csb-exit{border-color:#c86c83;background:#5a2033}.csb-head .csb-info{min-width:42px;color:#ffe082}
            .csb-rule-line{text-align:center;padding:5px;color:#bfaeb4;font-size:11px}.csb-arena-wrap{overflow-x:auto}.csb-arena{display:grid;grid-template-columns:minmax(420px,1fr) minmax(420px,1fr);gap:14px;min-width:860px;max-width:1260px;margin:0 auto}.csb-side{position:relative;padding:10px 12px 12px;border:3px solid var(--csb-accent,#d6a744);border-radius:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--csb-accent) 28%,#381020),#180b11 58%,#090507);box-shadow:0 0 24px #000;overflow:visible}.csb-side-head{min-height:62px;display:flex;justify-content:space-between;gap:10px;align-items:center}.csb-identity{display:flex;align-items:center;gap:9px;min-width:150px}.csb-identity>div{display:grid;gap:2px}.csb-identity strong{color:#ffe082;font-size:19px;white-space:nowrap}.csb-identity small{color:var(--csb-accent);font-size:10px;font-weight:bold}.csb-portrait{width:58px;height:58px;flex:0 0 58px;display:grid;place-items:center;overflow:hidden;border:2px solid var(--csb-accent);border-radius:50%;background:#10080d;box-shadow:0 0 14px color-mix(in srgb,var(--csb-accent) 55%,transparent);font-size:28px}.csb-portrait img{width:100%;height:100%;object-fit:cover}.csb-dialogue{position:relative;max-width:260px;min-height:22px;padding:8px 10px;border:1px solid var(--csb-accent);border-radius:11px;background:rgba(10,5,8,.9);color:#fff;font-size:12px;line-height:1.45;opacity:0;transform:translateY(5px) scale(.97);transition:.18s;pointer-events:none}.csb-dialogue::after{content:'';position:absolute;left:-8px;bottom:10px;border-width:6px 8px 6px 0;border-style:solid;border-color:transparent var(--csb-accent) transparent transparent}.csb-dialogue.show{opacity:1;transform:none;animation:csbDialogue .28s ease-out}.csb-dialogue[data-tone="special"]{background:linear-gradient(135deg,#3d1456,#160919);box-shadow:0 0 20px color-mix(in srgb,var(--csb-accent) 55%,transparent)}
            .csb-hp-line{display:flex;justify-content:space-between;margin-top:2px;font-size:13px}.csb-hp{height:16px;margin-top:3px;border-radius:9px;background:#250b12;overflow:hidden;border:1px solid #6a3642}.csb-hp i{display:block;height:100%;background:linear-gradient(90deg,#21b865,#8bea63);transition:width .2s}.csb-master .csb-hp i{background:linear-gradient(90deg,#db3458,#ff8a66)}.csb-gauge{display:flex;align-items:center;gap:7px;margin:6px 0 4px;font-size:10px;color:#c9b8be}.csb-gauge>i{flex:1;height:7px;background:#25112d;border-radius:5px;overflow:hidden}.csb-gauge b{display:block;height:100%;background:linear-gradient(90deg,#8b3eff,#ec8cff);transition:width .2s}.csb-statuses{min-height:24px;display:flex;align-items:center;gap:5px;overflow:hidden;margin-bottom:4px}.csb-status{display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border:1px solid #67505a;border-radius:12px;background:#130a0e;color:#ddd;font-size:10px;white-space:nowrap}.csb-status.good{border-color:#4c9d75;color:#8ff0b8}.csb-status.bad{border-color:#a95167;color:#ff9caf}.csb-status.guard{border-color:#4e94b4;color:#8edfff}.csb-status.empty{opacity:.45}
            .csb-reel-frame{position:relative;padding:5px;border:3px solid var(--csb-accent);border-radius:13px;background:#190a12;box-shadow:inset 0 0 18px #000}.csb-reel-frame canvas{display:block;width:100%;height:min(34vh,310px);min-height:210px;border-radius:8px;cursor:pointer;touch-action:manipulation}.csb-stop-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:7px}.csb-stop-row button{min-height:35px;border:1px solid var(--csb-accent);border-radius:20px;background:#6f173b;color:#fff;font-weight:bold;cursor:pointer}.csb-stop-row button:disabled{background:#292027;color:#7f7478;border-color:#55424a}.csb-spin{display:block;width:70%;min-height:43px;margin:8px auto 0;border:2px solid #ffe68a;border-radius:12px;background:linear-gradient(#ffd95a,#a76510);color:#2a1204;font-size:20px;font-weight:1000;cursor:pointer}.csb-spin:disabled{filter:grayscale(.8);opacity:.55}.csb-cpu-status{height:43px;display:grid;place-items:center;margin-top:8px;color:var(--csb-accent);font-weight:bold}
            .csb-side.csb-hit{animation:csbShake .28s ease-out}.csb-side.csb-heal{animation:csbHealGlow .55s ease-out}.csb-side.csb-guard{animation:csbGuardGlow .55s ease-out}.csb-fx-projectile,.csb-fx-number,.csb-match-banner,.csb-cutin{position:fixed;z-index:12;pointer-events:none}.csb-fx-projectile{width:54px;height:54px;display:grid;place-items:center;border-radius:50%;font-size:31px;filter:drop-shadow(0 0 12px currentColor);background:radial-gradient(circle,rgba(255,255,255,.92),currentColor 34%,transparent 72%)}.csb-fx-number{min-width:88px;text-align:center;font-size:clamp(24px,3vw,42px);font-weight:1000;text-shadow:0 3px 3px #000,0 0 16px currentColor;animation:csbFloat 1s ease-out forwards}.csb-fx-number.damage{color:#ff6678}.csb-fx-number.heal{color:#72f4a5}.csb-fx-number.guard{color:#72d8ff}.csb-fx-number.support{color:#ffe881;font-size:clamp(18px,2vw,29px)}.csb-match-banner{padding:8px 22px;border:2px solid currentColor;border-radius:30px;background:rgba(12,5,9,.93);font-size:clamp(22px,3vw,42px);font-weight:1000;letter-spacing:2px;text-shadow:0 0 14px currentColor;animation:csbMatch 1s ease-out forwards}.csb-cutin{display:flex;align-items:center;gap:15px;min-width:330px;max-width:min(620px,70vw);padding:12px 28px;border:3px solid var(--cutin-color,#ffe082);border-radius:18px;background:linear-gradient(105deg,color-mix(in srgb,var(--cutin-color) 55%,#160816),#160816 68%,transparent);box-shadow:0 0 38px color-mix(in srgb,var(--cutin-color) 65%,transparent);animation:csbCutin .9s ease-in-out forwards}.csb-cutin.level-5{max-width:760px;padding:18px 36px}.csb-cutin img{width:92px;height:92px;object-fit:cover;border-radius:50%;border:3px solid var(--cutin-color)}.csb-cutin.level-5 img{width:125px;height:125px}.csb-cutin-text{display:grid}.csb-cutin-text small{color:#fff;font-weight:bold}.csb-cutin-text strong{color:var(--cutin-color);font-size:clamp(23px,3vw,42px);line-height:1.1;text-shadow:0 0 16px currentColor}.csb-cutin-text span{margin-top:4px;color:#fff;font-size:13px}
            .csb-layer{position:fixed;inset:0;z-index:20;display:grid;place-items:center;background:rgba(0,0,0,.76);padding:18px}.csb-panel{width:min(560px,92vw);max-height:90vh;overflow:auto;padding:24px;box-sizing:border-box;border:3px solid #d5a846;border-radius:16px;background:linear-gradient(#35131f,#16090e);text-align:center;box-shadow:0 20px 70px #000}.csb-panel h2{margin-top:0;color:#ffe082}.csb-panel p{line-height:1.7;color:#e1d2d7}.csb-panel-actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:center}.csb-panel-actions button{padding:11px 15px;border:2px solid #9a6977;border-radius:8px;background:#48202d;color:#fff;font-weight:bold;cursor:pointer}.csb-panel-actions .primary{border-color:#ffe082;background:#9a6919}.csb-result-error{min-height:20px;color:#ff9faf;font-weight:bold;margin-top:10px}.csb-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left}.csb-info-grid span{padding:8px;border:1px solid #563643;border-radius:8px;background:#10080c;font-size:12px}.csb-detail-log{display:grid;gap:6px;text-align:left}.csb-detail-log span{padding:7px 9px;border-left:3px solid #74606a;background:#10080c;font-size:12px}.csb-detail-log .damage{border-color:#ff6678}.csb-detail-log .support{border-color:#72f4a5}.csb-detail-log .special{border-color:#c986ff}.csb-result-master{display:flex;align-items:center;gap:12px;margin:0 auto 16px;padding:10px;border:1px solid #73505c;border-radius:12px;background:#10080c;text-align:left}.csb-result-master img{width:72px;height:72px;object-fit:cover;border-radius:50%;border:2px solid #ffe082}.csb-result-master blockquote{margin:0;color:#f4e8ec;line-height:1.55}
            @keyframes csbDialogue{0%{opacity:0;transform:translateY(8px) scale(.94)}70%{transform:translateY(-2px) scale(1.02)}100%{opacity:1;transform:none}}@keyframes csbShake{0%,100%{transform:none}25%{transform:translate(-7px,2px)}50%{transform:translate(6px,-2px)}75%{transform:translate(-3px,1px)}}@keyframes csbHealGlow{40%{box-shadow:0 0 42px #4aff8e,inset 0 0 30px rgba(74,255,142,.35)}}@keyframes csbGuardGlow{40%{box-shadow:0 0 42px #54cfff,inset 0 0 30px rgba(84,207,255,.35)}}@keyframes csbFloat{0%{opacity:0;transform:translate(-50%,20px) scale(.7)}20%{opacity:1;transform:translate(-50%,0) scale(1.15)}100%{opacity:0;transform:translate(-50%,-70px) scale(.95)}}@keyframes csbMatch{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}22%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(.9)}}@keyframes csbCutin{0%{opacity:0;transform:translateX(80px) skewX(-8deg)}16%{opacity:1;transform:translateX(0) skewX(0)}72%{opacity:1;transform:none}100%{opacity:0;transform:translateX(-70px)}}
            @media(max-width:720px){.csb-shell{padding:5px}.csb-head{flex-wrap:wrap}.csb-timer{margin-left:auto}.csb-rule-line{display:none}.csb-arena{min-width:790px;grid-template-columns:390px 390px}.csb-side{padding:7px}.csb-reel-frame canvas{height:235px}.csb-dialogue{max-width:185px;font-size:10px}.csb-portrait{width:48px;height:48px;flex-basis:48px}.csb-side-head{min-height:54px}.csb-cutin{max-width:75vw}}
        </style>`;
    }

    function casinoSlotBattleRoot() {
        return document.getElementById('casino-slot-master-battle');
    }

    function casinoSlotBattleSideElement(side) {
        const root = casinoSlotBattleRoot();
        return root && side ? root.querySelector(`.csb-${side.key}`) : null;
    }

    function casinoSlotBattleRemoveLater(element, milliseconds) {
        if (!element) return;
        setTimeout(() => {
            if (element && typeof element.remove === 'function') element.remove();
        }, milliseconds);
    }

    function casinoSlotBattlePulseSide(side, className, delay) {
        const element = casinoSlotBattleSideElement(side);
        if (!element) return;
        setTimeout(() => {
            element.classList.remove('csb-hit', 'csb-heal', 'csb-guard');
            void element.offsetWidth;
            element.classList.add(className);
            setTimeout(() => element.classList.remove(className), 620);
        }, Math.max(0, Number(delay) || 0));
    }

    function casinoSlotBattleFloatingText(side, text, tone, delay) {
        const root = casinoSlotBattleRoot();
        const target = casinoSlotBattleSideElement(side);
        if (!root || !target) return;
        setTimeout(() => {
            if (!casinoSlotBattleRoot()) return;
            const rect = target.getBoundingClientRect();
            const element = document.createElement('div');
            element.className = `csb-fx-number ${tone || 'support'}`;
            element.textContent = String(text || '');
            element.style.left = `${rect.left + rect.width / 2}px`;
            element.style.top = `${rect.top + Math.min(190, rect.height * .38)}px`;
            root.appendChild(element);
            casinoSlotBattleRemoveLater(element, 1050);
        }, Math.max(0, Number(delay) || 0));
    }

    function casinoSlotBattleEmitVisual(kind, source, target, options) {
        options = options || {};
        const root = casinoSlotBattleRoot();
        const sourceElement = casinoSlotBattleSideElement(source);
        const targetElement = casinoSlotBattleSideElement(target || source);
        if (!root || !sourceElement || !targetElement) return;
        const projectileKinds = ['damage', 'heavy', 'debuff', 'magic', 'copy'];
        const colorByKind = { damage: '#ff6a60', heavy: '#ff304f', debuff: '#ffcc55', magic: '#c774ff', copy: '#a7b1ff' };
        const iconByKind = { damage: '✦', heavy: '💥', debuff: '🔔', magic: '✧', copy: '👻' };
        if (projectileKinds.includes(kind)) {
            const from = sourceElement.getBoundingClientRect();
            const to = targetElement.getBoundingClientRect();
            const startX = from.left + from.width / 2;
            const startY = from.top + Math.min(235, from.height * .46);
            const endX = to.left + to.width / 2;
            const endY = to.top + Math.min(190, to.height * .38);
            const projectile = document.createElement('div');
            projectile.className = 'csb-fx-projectile';
            projectile.textContent = options.icon || iconByKind[kind];
            projectile.style.color = options.color || colorByKind[kind];
            projectile.style.left = `${startX - 27}px`;
            projectile.style.top = `${startY - 27}px`;
            root.appendChild(projectile);
            const frames = [
                { transform: 'translate(0,0) scale(.45)', opacity: 0 },
                { transform: `translate(${(endX - startX) * .42}px,${(endY - startY) * .42 - 45}px) scale(1.15)`, opacity: 1, offset: .45 },
                { transform: `translate(${endX - startX}px,${endY - startY}px) scale(${kind === 'heavy' ? 1.6 : .75})`, opacity: 1 }
            ];
            if (typeof projectile.animate === 'function') {
                const animation = projectile.animate(frames, { duration: kind === 'heavy' ? 560 : 430, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
                if (animation && animation.finished) animation.finished.catch(() => {}).finally(() => projectile.remove());
            } else {
                casinoSlotBattleRemoveLater(projectile, 580);
            }
            const hitDelay = kind === 'heavy' ? 510 : 390;
            casinoSlotBattlePulseSide(target || source, 'csb-hit', hitDelay);
            if (options.amount !== undefined) casinoSlotBattleFloatingText(target || source, `-${Math.max(0, Math.round(options.amount))}`, 'damage', hitDelay);
            if (options.text) casinoSlotBattleFloatingText(target || source, options.text, kind === 'debuff' ? 'support' : 'damage', hitDelay + 80);
            return;
        }
        const localSide = target || source;
        const tone = kind === 'heal' ? 'heal' : kind === 'guard' ? 'guard' : 'support';
        if (kind === 'heal') casinoSlotBattlePulseSide(localSide, 'csb-heal');
        if (kind === 'guard') casinoSlotBattlePulseSide(localSide, 'csb-guard');
        const prefix = options.amount !== undefined ? `${kind === 'heal' || kind === 'guard' ? '+' : ''}${Math.round(options.amount)}` : '';
        casinoSlotBattleFloatingText(localSide, [options.icon, prefix, options.text].filter(Boolean).join(' '), tone);
    }

    function showCasinoSlotBattleCutin(side, title, subtitle, level) {
        const root = casinoSlotBattleRoot();
        if (!root || !side) return;
        const old = root.querySelector('.csb-cutin');
        if (old) old.remove();
        const cutin = document.createElement('div');
        cutin.className = `csb-cutin level-${level || 4}`;
        cutin.style.setProperty('--cutin-color', side.accent || '#ffe082');
        const portrait = side.image
            ? `<img src="${casinoSlotBattleEscape(side.image)}" alt="">`
            : side.key === 'player' ? '<canvas width="140" height="140" data-csb-player-cutin></canvas>' : '';
        cutin.innerHTML = `${portrait}<div class="csb-cutin-text"><small>${casinoSlotBattleEscape(side.name)}</small><strong>${casinoSlotBattleEscape(title)}</strong><span>${casinoSlotBattleEscape(subtitle || '')}</span></div>`;
        const viewportWidth = Number(window.innerWidth) || 1200;
        const desiredWidth = level >= 5 ? 700 : 560;
        const sideRect = casinoSlotBattleSideElement(side);
        const left = level >= 5
            ? Math.max(18, (viewportWidth - desiredWidth) / 2)
            : Math.max(18, Math.min(viewportWidth - desiredWidth - 18, sideRect ? sideRect.getBoundingClientRect().left + 18 : 18));
        cutin.style.left = `${left}px`;
        cutin.style.top = level >= 5 ? '25vh' : '31vh';
        root.appendChild(cutin);
        const playerCutin = cutin.querySelector('[data-csb-player-cutin]');
        if (playerCutin) drawCasinoSlotBattlePlayerAvatarCanvas(playerCutin, side, performance.now());
        casinoSlotBattleRemoveLater(cutin, level >= 5 ? 1120 : 960);
    }

    function showCasinoSlotBattleMatch(side, win) {
        const root = casinoSlotBattleRoot();
        const sideElement = casinoSlotBattleSideElement(side);
        if (!root || !sideElement || !win) return;
        const rect = sideElement.getBoundingClientRect();
        const symbol = SYMBOL_BY_ID[win.symbolId];
        const banner = document.createElement('div');
        banner.className = 'csb-match-banner';
        banner.style.color = side.accent || '#ffe082';
        banner.style.left = `${rect.left + rect.width / 2}px`;
        banner.style.top = `${rect.top + Math.min(285, rect.height * .55)}px`;
        banner.textContent = `${symbol ? symbol.name : win.symbolId} × ${win.count}`;
        root.appendChild(banner);
        casinoSlotBattleRemoveLater(banner, 1050);
        if (win.count >= 4) {
            const title = win.count >= 5 ? '5 MATCH!' : '4 MATCH!';
            showCasinoSlotBattleCutin(side, title, `${symbol ? symbol.name : ''}の効果が大幅強化！`, win.count);
            if (side.key === 'master') casinoSlotBattleMasterSpeak('big', { force: win.count >= 5, tone: 'special' });
        }
    }

    function casinoSlotBattleMasterSpeak(event, options) {
        if (!slotBattleState || !slotBattleState.master) return false;
        options = options || {};
        const now = performance.now();
        slotBattleState.dialogueFlags = slotBattleState.dialogueFlags || {};
        if (options.once && slotBattleState.dialogueFlags[options.once]) return false;
        if (!options.force && now < (Number(slotBattleState.dialogueCooldownUntil) || 0)) return false;
        const text = options.text || casinoSlotBattleDialogueText(event, options.details);
        if (!text) return false;
        const bubble = document.getElementById('csb-master-dialogue');
        if (!bubble) return false;
        if (slotBattleState.dialogueTimer) clearTimeout(slotBattleState.dialogueTimer);
        bubble.textContent = text;
        bubble.dataset.tone = options.tone || 'normal';
        bubble.classList.remove('show');
        void bubble.offsetWidth;
        bubble.classList.add('show');
        const duration = Math.max(1800, Number(options.duration) || (event === 'special' ? 3900 : 3000));
        slotBattleState.dialogueCooldownUntil = now + Math.max(duration, Number(options.cooldown) || 4500);
        if (options.once) slotBattleState.dialogueFlags[options.once] = true;
        slotBattleState.dialogueTimer = setTimeout(() => bubble.classList.remove('show'), duration);
        return true;
    }

    function drawCasinoSlotBattleReels(side) {
        if (!side || !side.reelCtx) return;
        const ctx = side.reelCtx;
        const canvas = ctx.canvas;
        const cellW = canvas.width / REEL_COUNT;
        const cellH = canvas.height / VISIBLE_ROWS;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#160a13';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        side.reels.forEach((reel, reelIndex) => {
            const base = Math.floor(reel.position);
            const fraction = reel.position - base;
            for (let row = -1; row <= VISIBLE_ROWS; row++) {
                const symbolIndex = (base + row + reel.strip.length) % reel.strip.length;
                const y = (row - fraction) * cellH;
                const lineHit = side.winCells && side.winCells.has(`${reelIndex},${row}`);
                drawSymbolCell(ctx, reel.strip[symbolIndex], reelIndex * cellW, y, cellW, cellH, lineHit);
            }
            ctx.strokeStyle = side.key === 'player' ? 'rgba(255,213,106,.7)' : 'rgba(255,125,170,.7)';
            ctx.lineWidth = 3;
            ctx.strokeRect(reelIndex * cellW + 2, 2, cellW - 4, canvas.height - 4);
        });
        PAYLINES.forEach((line, lineIndex) => {
            ctx.save();
            ctx.strokeStyle = PAYLINE_COLORS[lineIndex];
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 9]);
            ctx.beginPath();
            ctx.moveTo(0, (line[0] + .5) * cellH);
            line.forEach((row, reelIndex) => ctx.lineTo((reelIndex + .5) * cellW, (row + .5) * cellH));
            ctx.lineTo(canvas.width, (line[REEL_COUNT - 1] + .5) * cellH);
            ctx.stroke();
            ctx.restore();
        });
    }

    function casinoSlotBattleGrid(side) {
        return side.reels.map(reel => {
            const base = Math.round(reel.position);
            return Array.from({ length: VISIBLE_ROWS }, (_, row) => reel.strip[(base + row + reel.strip.length) % reel.strip.length]);
        });
    }

    function addCasinoSlotBattleLog(message, tone) {
        if (!slotBattleState) return;
        slotBattleState.logs.unshift({ message: String(message || ''), tone: tone || 'normal' });
        slotBattleState.logs = slotBattleState.logs.slice(0, 10);
        const log = document.getElementById('casino-slot-battle-log');
        if (log) log.innerHTML = slotBattleState.logs.map(entry => `<span class="${casinoSlotBattleEscape(entry.tone)}">${casinoSlotBattleEscape(entry.message)}</span>`).join('');
        const details = document.querySelector('[data-csb-detail-log]');
        if (details) details.innerHTML = slotBattleState.logs.map(entry => `<span class="${casinoSlotBattleEscape(entry.tone)}">${casinoSlotBattleEscape(entry.message)}</span>`).join('');
    }

    function casinoSlotBattleLabel(side) {
        return side && side.key === 'player' ? 'あなた' : (side ? side.name : '相手');
    }

    function casinoSlotBattleDealDamage(source, target, baseAmount, multiplier, label) {
        if (!slotBattleState || !slotBattleState.active) return 0;
        const amount = Math.max(1, Math.round(baseAmount * multiplier * casinoSlotBattleStatMultiplier(source.power)));
        const blocked = Math.min(target.barrier, amount);
        target.barrier -= blocked;
        const damage = amount - blocked;
        target.hp = Math.max(0, target.hp - damage);
        addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}の${label}：${damage}ダメージ${blocked ? `（Barrier ${blocked}吸収）` : ''}`, 'damage');
        if (damage > 0) {
            const heavy = baseAmount >= 35 || multiplier >= 4;
            casinoSlotBattleEmitVisual(heavy ? 'heavy' : 'damage', source, target, { amount: damage, icon: heavy ? '💥' : '✦' });
        } else if (blocked > 0) {
            casinoSlotBattleEmitVisual('guard', target, target, { icon: '🛡', text: 'BLOCK' });
        }
        if (source.key === 'master' && damage > 0) {
            casinoSlotBattleMasterSpeak('attack', { details: { damage }, cooldown: 4800 });
        } else if (target.key === 'master' && damage > 0) {
            const hpRate = target.maxHp > 0 ? target.hp / target.maxHp : 0;
            if (hpRate <= .35) {
                casinoSlotBattleMasterSpeak('pinch', { force: true, once: 'pinch', tone: 'special', duration: 3500 });
            } else if (damage >= 35) {
                casinoSlotBattleMasterSpeak('damaged', { details: { damage }, cooldown: 5200 });
            }
        }
        if (target.hp <= 0) finishCasinoSlotMasterBattle(source.key === 'player' ? 'win' : 'loss', 'ko');
        return damage;
    }

    function casinoSlotBattleHeal(side, baseAmount, multiplier, label) {
        const amount = Math.max(1, Math.round(baseAmount * multiplier * casinoSlotBattleStatMultiplier(side.intel)));
        const before = side.hp;
        side.hp = Math.min(side.maxHp, side.hp + amount);
        const healed = side.hp - before;
        addCasinoSlotBattleLog(`${casinoSlotBattleLabel(side)}の${label}：HP ${healed}回復`, 'support');
        if (healed > 0) casinoSlotBattleEmitVisual('heal', side, side, { icon: '✚', amount: healed });
        return healed;
    }

    function casinoSlotBattleAddBarrier(side, baseAmount, label) {
        const amount = Math.max(1, Math.round(baseAmount * casinoSlotBattleStatMultiplier(side.intel)));
        side.barrier = Math.min(side.maxHp, side.barrier + amount);
        addCasinoSlotBattleLog(`${casinoSlotBattleLabel(side)}：${label || 'Barrier'} +${amount}`, 'support');
        casinoSlotBattleEmitVisual('guard', side, side, { icon: '🛡', amount, text: 'BARRIER' });
        return amount;
    }

    function casinoSlotBattleAddInterference(source, target, stacks, label) {
        stacks = Math.max(1, Math.floor(stacks));
        target.pendingInterference = Math.min(8, target.pendingInterference + stacks);
        addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}の${label || '妨害'}：${casinoSlotBattleLabel(target)}へ妨害 ${stacks}`, 'special');
        casinoSlotBattleEmitVisual('debuff', source, target, { icon: '🔔', text: `妨害 +${stacks}` });
        return stacks;
    }

    function casinoSlotBattleActivateSpecial(source, target) {
        if (!slotBattleState || !slotBattleState.active) return;
        const name = source.specialName || 'ジャックポットラッシュ';
        showCasinoSlotBattleCutin(source, name, source.key === 'master' ? casinoSlotBattleDialogueText('special') : '運を力に変えて、一気に攻める！', 5);
        addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}の固有特殊技「${name}」！`, 'special');
        if (source.key === 'master') casinoSlotBattleMasterSpeak('special', { force: true, tone: 'special', duration: 3900 });
        const boost = () => {
            source.effectBoost = Math.min(2.5, Math.max(source.effectBoost, 1) + .65 * casinoSlotBattleStatMultiplier(source.intel));
            casinoSlotBattleEmitVisual('support', source, source, { icon: '✨', text: `次効果 ×${source.effectBoost.toFixed(2)}` });
        };
        switch (source.specialKind) {
            case 'explore':
                casinoSlotBattleDealDamage(source, target, 72, 1, name);
                source.speedCredit = Math.min(1200, source.speedCredit + 520);
                casinoSlotBattleEmitVisual('support', source, source, { icon: '🧭', text: '次回転加速' });
                break;
            case 'farming':
                casinoSlotBattleHeal(source, 105, 1, name);
                boost();
                break;
            case 'fishing':
                casinoSlotBattleDealDamage(source, target, 84, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleAddInterference(source, target, 1, name);
                break;
            case 'cooking':
                casinoSlotBattleDealDamage(source, target, 108, 1, name);
                break;
            case 'smithing':
                casinoSlotBattleDealDamage(source, target, 96, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleAddBarrier(source, 42, name);
                break;
            case 'building':
                casinoSlotBattleAddBarrier(source, 125, name);
                casinoSlotBattleDealDamage(source, target, 34, 1, name);
                break;
            case 'pharmacist':
                source.pendingInterference = 0;
                casinoSlotBattleHeal(source, 130, 1, name);
                casinoSlotBattleEmitVisual('support', source, source, { icon: '✚', text: '妨害完全解除' });
                break;
            case 'tailor':
                casinoSlotBattleAddBarrier(source, 95, name);
                casinoSlotBattleHeal(source, 45, 1, name);
                break;
            case 'pastry':
                casinoSlotBattleHeal(source, 60, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleDealDamage(source, target, 48, 1, name);
                boost();
                break;
            case 'hairdresser':
                casinoSlotBattleAddInterference(source, target, 3, name);
                source.speedCredit = Math.min(1200, source.speedCredit + 900);
                casinoSlotBattleDealDamage(source, target, 35, 1, name);
                break;
            case 'concierge':
                casinoSlotBattleHeal(source, 90, 1, name);
                casinoSlotBattleAddBarrier(source, 75, name);
                break;
            case 'dealer':
                casinoSlotBattleDealDamage(source, target, 64, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleAddBarrier(source, 45, name);
                source.assistCharges = Math.min(5, source.assistCharges + 2);
                break;
            case 'fortune':
                casinoSlotBattleDealDamage(source, target, 54, 1, name);
                if (!slotBattleState || !slotBattleState.active) break;
                source.assistCharges = Math.min(5, source.assistCharges + 3);
                boost();
                break;
            case 'scientist':
                casinoSlotBattleDealDamage(source, target, 66, casinoSlotBattleStatMultiplier(source.intel), name);
                break;
            case 'salesperson':
                casinoSlotBattleDealDamage(source, target, 55, 1, name);
                if (!slotBattleState || !slotBattleState.active) break;
                source.speedCredit = Math.min(1200, source.speedCredit + 1200);
                source.assistCharges = Math.min(5, source.assistCharges + 1);
                casinoSlotBattleEmitVisual('support', source, source, { icon: '⚡', text: '即時再入荷' });
                break;
            case 'soldier':
                casinoSlotBattleDealDamage(source, target, 120, 1, name);
                break;
            case 'captain':
                casinoSlotBattleAddBarrier(source, 55, name);
                casinoSlotBattleDealDamage(source, target, 74, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleAddInterference(source, target, 1, name);
                break;
            case 'king':
                casinoSlotBattleDealDamage(source, target, 140, 1, name);
                break;
            default:
                casinoSlotBattleDealDamage(source, target, 74, 1, name);
                if (slotBattleState && slotBattleState.active) casinoSlotBattleHeal(source, 30, 1, name);
                break;
        }
    }

    function applyCasinoSlotBattleSymbol(source, target, symbolId, multiplier, options) {
        if (!slotBattleState || !slotBattleState.active) return;
        options = options || {};
        multiplier = Math.max(.1, Number(multiplier) || 1);
        let boost = options.ignoreBoost ? 1 : Math.max(1, Number(source.effectBoost) || 1);
        if (symbolId !== 'seed' && !options.ignoreBoost) source.effectBoost = 1;
        const strength = multiplier * boost;
        if (symbolId === 'spirit') {
            casinoSlotBattleHeal(source, 12, strength, 'チェリー');
        } else if (symbolId === 'robot') {
            source.assistCharges = Math.min(5, source.assistCharges + Math.max(1, Math.ceil(strength)));
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：レモン目押し補助 ${source.assistCharges}回`, 'support');
            casinoSlotBattleEmitVisual('support', source, source, { icon: '🎯', text: `目押し ×${source.assistCharges}` });
        } else if (symbolId === 'seed') {
            source.effectBoost = Math.min(2.5, Math.max(1, source.effectBoost) + .18 * strength * casinoSlotBattleStatMultiplier(source.intel));
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：次の効果 ×${source.effectBoost.toFixed(2)}`, 'support');
            casinoSlotBattleEmitVisual('support', source, source, { icon: '✨', text: `次効果 ×${source.effectBoost.toFixed(2)}` });
        } else if (symbolId === 'balloon') {
            casinoSlotBattleHeal(source, 20, strength, 'スイカ');
            if (source.pendingInterference > 0) {
                source.pendingInterference = Math.max(0, source.pendingInterference - Math.max(1, Math.ceil(strength)));
                addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：妨害を解除`, 'support');
                casinoSlotBattleEmitVisual('support', source, source, { icon: '💧', text: '妨害解除' });
            }
        } else if (symbolId === 'beetle') {
            const stacks = Math.max(1, Math.ceil(strength * casinoSlotBattleStatMultiplier(source.intel)));
            casinoSlotBattleAddInterference(source, target, stacks, 'ベル');
        } else if (symbolId === 'bird') {
            source.speedCredit = Math.min(1200, source.speedCredit + Math.round(180 * strength * casinoSlotBattleStatMultiplier(source.intel)));
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：次の回転待ち時間短縮`, 'support');
            casinoSlotBattleEmitVisual('support', source, source, { icon: '💨', text: '待ち時間短縮' });
        } else if (symbolId === 'stone') {
            const barrier = Math.max(1, Math.round(22 * strength * casinoSlotBattleStatMultiplier(source.intel)));
            source.barrier = Math.min(source.maxHp, source.barrier + barrier);
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：Barrier +${barrier}`, 'support');
            casinoSlotBattleEmitVisual('guard', source, source, { icon: '🛡', amount: barrier, text: 'BARRIER' });
        } else if (symbolId === 'machine') {
            casinoSlotBattleDealDamage(source, target, 22, strength, 'BAR攻撃');
        } else if (symbolId === 'dragon') {
            casinoSlotBattleDealDamage(source, target, 38, strength, '7攻撃');
        } else if (symbolId === 'ghost') {
            const copied = source.lastEffectSymbol;
            if (copied && copied !== 'ghost') {
                addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}のWILD：${SYMBOL_BY_ID[copied].name}を複製`, 'special');
                casinoSlotBattleEmitVisual('copy', source, target, { icon: '👻', text: 'COPY' });
                applyCasinoSlotBattleSymbol(source, target, copied, strength * .75, { ignoreBoost: true, copied: true });
            } else {
                casinoSlotBattleHeal(source, 10, strength, 'WILD');
            }
            return;
        } else if (symbolId === 'magician') {
            const gaugeAdded = Math.max(5, Math.round(20 * strength * casinoSlotBattleStatMultiplier(source.intel)));
            source.specialGauge += gaugeAdded;
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(source)}：特殊ゲージ ${Math.min(100, source.specialGauge)}%`, 'special');
            casinoSlotBattleEmitVisual('support', source, source, { icon: '✧', text: `特殊 +${gaugeAdded}%` });
            while (source.specialGauge >= 100 && slotBattleState && slotBattleState.active) {
                source.specialGauge -= 100;
                casinoSlotBattleActivateSpecial(source, target);
            }
        }
        if (symbolId !== 'ghost') source.lastEffectSymbol = symbolId;
    }

    function finishCasinoSlotBattleSideSpin(side) {
        if (!slotBattleState || !slotBattleState.active || !side) return;
        const target = side.key === 'player' ? slotBattleState.master : slotBattleState.player;
        const result = evaluateSlotGrid(casinoSlotBattleGrid(side), 1);
        side.winCells = result.cells;
        if (result.wins.length) {
            const strongestWin = result.wins.reduce((best, win) => !best || win.count > best.count ? win : best, null);
            showCasinoSlotBattleMatch(side, strongestWin);
        }
        result.wins.forEach(win => {
            if (!slotBattleState || !slotBattleState.active) return;
            const amplification = win.count >= 5 ? 7 : win.count >= 4 ? 4 : 2;
            applyCasinoSlotBattleSymbol(side, target, win.symbolId, amplification);
        });
        if (result.wins.length) {
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(side)}：${result.wins.map(win => `${SYMBOL_BY_ID[win.symbolId].name}${win.count}`).join('・')} 成立`, 'special');
        }
        side.spinning = false;
        side.spinCount += 1;
        const cooldown = 1500 * casinoSlotBattleCooldownMultiplier(side.speed);
        side.readyAt = performance.now() + Math.max(350, cooldown + side.currentInterferencePenalty - side.speedCredit);
        side.speedCredit = 0;
        side.currentInterferencePenalty = 0;
        refreshCasinoSlotBattleHud(performance.now());
    }

    function onCasinoSlotBattleReelStopped(side, reelIndex) {
        if (!slotBattleState || !slotBattleState.active || !side) return;
        const target = side.key === 'player' ? slotBattleState.master : slotBattleState.player;
        const symbolId = reelVisibleSymbol(side.reels[reelIndex], 1);
        applyCasinoSlotBattleSymbol(side, target, symbolId, 1);
        if (!slotBattleState || !slotBattleState.active) return;
        if (side.reels.every(reel => reel.status === 'stopped')) finishCasinoSlotBattleSideSpin(side);
    }

    function requestCasinoSlotBattleReelStop(side, index) {
        index = Math.floor(Number(index));
        if (!slotBattleState || !slotBattleState.active || slotBattleState.pauseStartedAt || !side || !side.spinning || index < 0 || index >= REEL_COUNT) return false;
        const reel = side.reels[index];
        if (!reel || reel.status !== 'spinning') return false;
        const now = performance.now();
        reel.status = 'stopping';
        reel.stopStartedAt = now;
        reel.stopDuration = side.assistActive ? 460 : 300;
        reel.stopStartPosition = reel.position;
        reel.stopTargetPosition = Math.ceil(reel.position + reel.speed * (side.assistActive ? .21 : .14));
        return true;
    }

    function startCasinoSlotBattleSideSpin(side, isMaster) {
        if (!slotBattleState || !slotBattleState.active || slotBattleState.pauseStartedAt || !side || side.spinning || performance.now() < side.readyAt) return false;
        const now = performance.now();
        const interference = Math.max(0, Math.floor(side.pendingInterference));
        side.pendingInterference = 0;
        side.currentInterferencePenalty = interference * 300;
        side.assistActive = side.assistCharges > 0;
        if (side.assistActive) side.assistCharges -= 1;
        const reelSpeedScale = (side.assistActive ? .72 : 1) * (1 + Math.min(.28, interference * .04));
        side.reels.forEach((reel, index) => {
            reel.status = 'spinning';
            reel.speed = (3.05 + index * .17) * reelSpeedScale;
            reel.stopStartedAt = 0;
        });
        side.spinning = true;
        side.winCells = new Set();
        side.spinStartedAt = now;
        side.readyAt = Number.POSITIVE_INFINITY;
        if (isMaster) {
            const reactionScale = casinoSlotBattleCooldownMultiplier(side.speed);
            side.autoStopAt = Array.from({ length: REEL_COUNT }, (_, index) => now + (650 + index * 235 + Math.random() * 180) * reactionScale);
        } else {
            side.autoStopAt = Array.from({ length: REEL_COUNT }, (_, index) => now + 7000 + index * 220);
        }
        if (interference) {
            addCasinoSlotBattleLog(`${casinoSlotBattleLabel(side)}：妨害${interference}を受けて回転`, 'damage');
            casinoSlotBattleEmitVisual('support', side, side, { icon: '🔔', text: `妨害 ×${interference}` });
        }
        refreshCasinoSlotBattleHud(now);
        return true;
    }

    window.startCasinoSlotBattleSpin = function () {
        return startCasinoSlotBattleSideSpin(slotBattleState && slotBattleState.player, false);
    };

    window.stopCasinoSlotBattleReel = function (index) {
        return requestCasinoSlotBattleReelStop(slotBattleState && slotBattleState.player, index);
    };

    function formatCasinoSlotBattleTime(milliseconds) {
        let seconds = Math.max(0, Math.ceil(milliseconds / 1000));
        const days = Math.floor(seconds / 86400);
        seconds -= days * 86400;
        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        if (days > 0) return `${days}日 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }

    function refreshCasinoSlotBattleHud(now) {
        if (!slotBattleState) return;
        now = Number(now) || performance.now();
        [['player', slotBattleState.player], ['master', slotBattleState.master]].forEach(([prefix, side]) => {
            const hpText = document.getElementById(`csb-${prefix}-hp-text`);
            const hpBar = document.getElementById(`csb-${prefix}-hp-bar`);
            const special = document.getElementById(`csb-${prefix}-special`);
            const statuses = document.getElementById(`csb-${prefix}-statuses`);
            if (hpText) hpText.textContent = `${Math.ceil(side.hp)} / ${side.maxHp}`;
            if (hpBar) hpBar.style.width = `${Math.max(0, Math.min(100, side.hp / side.maxHp * 100))}%`;
            if (special) special.style.width = `${Math.max(0, Math.min(100, side.specialGauge))}%`;
            if (statuses) {
                const chips = [];
                if (side.barrier > 0) chips.push(`<span class="csb-status guard">🛡 ${Math.ceil(side.barrier)}</span>`);
                if (side.effectBoost > 1.01) chips.push(`<span class="csb-status good">✨ ×${side.effectBoost.toFixed(2)}</span>`);
                if (side.assistCharges > 0) chips.push(`<span class="csb-status good">🎯 ${side.assistCharges}</span>`);
                if (side.pendingInterference > 0) chips.push(`<span class="csb-status bad">🔔 ${Math.floor(side.pendingInterference)}</span>`);
                if (side.speedCredit > 0) chips.push('<span class="csb-status good">💨 短縮</span>');
                const html = chips.join('');
                if (statuses.dataset.value !== html) {
                    statuses.dataset.value = html;
                    statuses.innerHTML = html;
                }
            }
        });
        const remaining = Math.max(0, slotBattleState.durationMs - (now - slotBattleState.startedAt));
        const timer = document.getElementById('casino-slot-battle-timer');
        if (timer) timer.textContent = formatCasinoSlotBattleTime(remaining);
        const spin = document.getElementById('csb-player-spin');
        if (spin) {
            const ready = slotBattleState.active && !slotBattleState.player.spinning && now >= slotBattleState.player.readyAt;
            spin.disabled = !ready;
            spin.textContent = ready ? 'SPIN' : slotBattleState.player.spinning ? '回転中' : `READY ${(Math.max(0, slotBattleState.player.readyAt - now) / 1000).toFixed(1)}`;
        }
        for (let index = 0; index < REEL_COUNT; index++) {
            const button = document.querySelector(`[data-csb-stop="${index}"]`);
            const reel = slotBattleState.player.reels[index];
            if (button) button.disabled = !slotBattleState.active || !slotBattleState.player.spinning || reel.status !== 'spinning';
        }
        const cpu = document.getElementById('csb-master-status');
        if (cpu) {
            cpu.textContent = slotBattleState.master.spinning
                ? 'SPINNING...'
                : now >= slotBattleState.master.readyAt ? 'SPIN!' : `READY ${(Math.max(0, slotBattleState.master.readyAt - now) / 1000).toFixed(1)}`;
        }
    }

    function updateCasinoSlotBattleSide(side, now, delta, isMaster) {
        if (!side) return;
        if (side.spinning) {
            side.reels.forEach((reel, index) => {
                if (reel.status === 'spinning' && now >= side.autoStopAt[index]) requestCasinoSlotBattleReelStop(side, index);
                if (reel.status === 'spinning') {
                    reel.position += reel.speed * delta;
                } else if (reel.status === 'stopping') {
                    const progress = Math.max(0, Math.min(1, (now - reel.stopStartedAt) / reel.stopDuration));
                    const eased = 1 - Math.pow(1 - progress, 3);
                    reel.position = reel.stopStartPosition + (reel.stopTargetPosition - reel.stopStartPosition) * eased;
                    if (progress >= 1) {
                        reel.position = ((reel.stopTargetPosition % reel.strip.length) + reel.strip.length) % reel.strip.length;
                        reel.status = 'stopped';
                        onCasinoSlotBattleReelStopped(side, index);
                    }
                }
            });
        } else if (isMaster && slotBattleState && slotBattleState.active && now >= side.readyAt) {
            startCasinoSlotBattleSideSpin(side, true);
        }
        drawCasinoSlotBattleReels(side);
    }

    function casinoSlotMasterBattleAnimationLoop(now) {
        if (!slotBattleState || !document.getElementById('casino-slot-master-battle')) return;
        const previous = Number(slotBattleState.lastFrameAt) || now;
        const delta = Math.min(.05, Math.max(0, (now - previous) / 1000));
        slotBattleState.lastFrameAt = now;
        if (slotBattleState.active && !slotBattleState.pauseStartedAt) {
            updateCasinoSlotBattleSide(slotBattleState.player, now, delta, false);
            updateCasinoSlotBattleSide(slotBattleState.master, now, delta, true);
            if (slotBattleState.active && now - slotBattleState.startedAt >= slotBattleState.durationMs) {
                const result = slotBattleState.player.hp === slotBattleState.master.hp
                    ? 'draw'
                    : slotBattleState.player.hp > slotBattleState.master.hp ? 'win' : 'loss';
                finishCasinoSlotMasterBattle(result, 'time');
            }
        } else {
            drawCasinoSlotBattleReels(slotBattleState.player);
            drawCasinoSlotBattleReels(slotBattleState.master);
        }
        const visualNow = slotBattleState.pauseStartedAt || now;
        refreshCasinoSlotBattleHud(visualNow);
        drawCasinoSlotBattlePlayerAvatar(visualNow);
        slotBattleFrame = requestAnimationFrame(casinoSlotMasterBattleAnimationLoop);
    }

    function casinoSlotBattleRecordResult(result, netCoins) {
        if (!slotBattleState || typeof window.recordDealerCasinoGameResult !== 'function') return;
        const opponent = slotBattleState.opponent;
        window.recordDealerCasinoGameResult('slot', result, {
            netCoins,
            mode: 'master',
            opponents: [{
                id: opponent.id || opponent.masterType,
                name: opponent.name,
                type: opponent.masterType === 'dealer' ? 'dealer' : 'master',
                masterType: opponent.masterType,
                result
            }]
        });
    }

    function finishCasinoSlotMasterBattle(result, reason, options) {
        if (!slotBattleState || !slotBattleState.active) return false;
        options = options || {};
        slotBattleState.active = false;
        slotBattleState.result = result;
        slotBattleState.reason = reason;
        slotBattleState.player.spinning = false;
        slotBattleState.master.spinning = false;
        const hero = window.aiPet || {};
        const bet = slotBattleState.settings.bet;
        let award = 0;
        let netCoins = -bet;
        if (result === 'win') {
            award = bet * 2;
            netCoins = bet;
        } else if (result === 'draw') {
            award = bet;
            netCoins = 0;
        }
        hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) + award;
        casinoSlotBattleRecordResult(result, netCoins);
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (options.suppressPanel) return true;
        const label = result === 'win' ? '勝利！' : result === 'draw' ? '引き分け' : reason === 'forfeit' ? '棄権敗北' : '敗北…';
        const detail = reason === 'ko'
            ? 'HPが0になり、決着しました。'
            : reason === 'time' ? '制限時間終了時の残りHPで決着しました。' : '対戦を棄権しました。';
        const reward = result === 'win'
            ? `勝利報酬 ${award}コイン（収支 +${netCoins}）`
            : result === 'draw' ? `賭け金 ${award}コインを返金しました。` : `賭け金 ${bet}コインを失いました。`;
        const masterEvent = result === 'win' ? 'loss' : result === 'draw' ? 'draw' : 'win';
        const resultQuote = casinoSlotBattleDialogueText(masterEvent);
        const masterPortrait = slotBattleState.master.image
            ? `<img src="${casinoSlotBattleEscape(slotBattleState.master.image)}" alt="">`
            : '';
        const old = document.getElementById('casino-slot-battle-result');
        if (old) old.remove();
        const layer = document.createElement('div');
        layer.id = 'casino-slot-battle-result';
        layer.className = 'csb-layer';
        layer.innerHTML = `<div class="csb-panel"><h2>${label}</h2><div class="csb-result-master">${masterPortrait}<blockquote>${casinoSlotBattleEscape(resultQuote)}</blockquote></div><p>${detail}<br>${reward}</p><div class="csb-panel-actions"><button class="primary" onclick="window.rematchCasinoSlotMasterBattle()">同じ条件でもう一戦</button><button onclick="window.returnCasinoSlotBattleToLobby()">ロビーに戻る</button><button onclick="window.closeCasinoSlotMasterBattle()">カジノに戻る</button></div><div id="casino-slot-battle-result-error" class="csb-result-error"></div></div>`;
        const battle = document.getElementById('casino-slot-master-battle');
        if (battle) battle.appendChild(layer);
        addCasinoSlotBattleLog(`${slotBattleState.opponent.name}戦：${label}`, result === 'win' ? 'support' : result === 'draw' ? 'special' : 'damage');
        return true;
    }

    function cleanupCasinoSlotMasterBattle(restoreCasino) {
        if (slotBattleFrame) cancelAnimationFrame(slotBattleFrame);
        slotBattleFrame = null;
        if (slotBattleState && slotBattleState.dialogueTimer) clearTimeout(slotBattleState.dialogueTimer);
        const battle = document.getElementById('casino-slot-master-battle');
        if (battle) {
            if (typeof battle.close === 'function' && battle.open) battle.close();
            battle.remove();
        }
        slotBattleState = null;
        if (restoreCasino) {
            if (window.casinoMapOpen && typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
            window.restoreCasinoLobbyBGM();
            const input = document.getElementById('casino-chat-input');
            if (input) setTimeout(() => input.focus(), 0);
        }
    }

    function openCasinoSlotMasterBattle(settings, opponent) {
        if (casinoSlotBattleInstalledCount() < 2) return false;
        cleanupCasinoSlotMasterBattle(false);
        removeCasinoSlotBattleLobby();
        const opponents = casinoSlotBattleOpponents();
        opponent = opponent || opponents.find(entry => entry.masterType === settings.masterType);
        if (!opponent) {
            const profile = typeof window.getCasinoMasterProfile === 'function' ? window.getCasinoMasterProfile(settings.masterType) : null;
            opponent = { id: settings.opponentId || settings.masterType, masterType: settings.masterType, name: (profile && profile.name) || settings.masterType, image: (profile && profile.image) || '' };
        }
        const seed = `${Date.now()}_${Math.random()}`;
        const playerStats = casinoSlotBattlePlayerStats(settings.statMode);
        const masterStats = casinoSlotBattleMasterStats(opponent.masterType);
        const masterPresentation = casinoSlotBattleMasterPresentation(opponent.masterType, opponent);
        opponent.name = masterPresentation.name;
        opponent.image = masterPresentation.image;
        const playerName = window.aiPet && window.aiPet.name ? window.aiPet.name : 'あなた';
        const player = createCasinoSlotBattleSide('player', playerName, playerStats, seed, { title: '挑戦者', color: '#ffd45f', specialName: 'ジャックポットラッシュ', kind: 'player' });
        const playerSource = window.aiPet || {};
        player.avatarPet = stageActorFrom(playerSource, playerSource.currentSkin || playerSource.baseType || 'robot');
        const master = createCasinoSlotBattleSide('master', opponent.name, masterStats, seed, masterPresentation);
        const now = performance.now();
        player.readyAt = now;
        master.readyAt = now + 650;
        slotBattleState = {
            settings: Object.assign({}, settings),
            opponent: Object.assign({}, opponent),
            player,
            master,
            active: true,
            result: null,
            logs: [],
            pauseStartedAt: 0,
            startedAt: now,
            durationMs: settings.duration * 1000,
            lastFrameAt: now
        };
        const battle = document.createElement('dialog');
        battle.id = 'casino-slot-master-battle';
        battle.setAttribute('aria-label', `スロット対戦 vs ${opponent.name}`);
        battle.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483200;background:#040204;color:#fff;font-family:sans-serif;';
        battle.innerHTML = `${casinoSlotBattleStyleHtml()}<div class="csb-shell"><header class="csb-head"><h2>🎰 REALTIME SLOT BATTLE</h2><div class="csb-timer"><small>残り時間</small><b id="casino-slot-battle-timer"></b></div><button type="button" class="csb-info" onclick="window.openCasinoSlotBattleHelp()">？ 効果</button><button type="button" class="csb-info" onclick="window.openCasinoSlotBattleLogDetails()">戦闘詳細</button><button type="button" class="csb-exit" onclick="window.requestCloseCasinoSlotMasterBattle()">← カジノへ戻る</button></header><div class="csb-rule-line">${settings.statMode === 'trained' ? '育成値参照' : '固定ステータス'} ／ 賭け金 ${settings.bet}コイン ／ ${casinoSlotBattleEscape(master.title)}「${casinoSlotBattleEscape(master.specialName)}」</div><div class="csb-arena-wrap"><main class="csb-arena">${casinoSlotBattleSideHtml(player, true)}${casinoSlotBattleSideHtml(master, false)}</main></div></div>`;
        battle.addEventListener('cancel', event => {
            event.preventDefault();
            const info = document.getElementById('casino-slot-battle-info');
            if (info) {
                window.closeCasinoSlotBattleInfo();
                return;
            }
            if (document.getElementById('casino-slot-battle-forfeit')) {
                window.cancelCasinoSlotBattleForfeit();
                return;
            }
            window.requestCloseCasinoSlotMasterBattle();
        });
        battle.addEventListener('keydown', event => {
            if (/^[1-5]$/.test(event.key)) {
                event.preventDefault();
                window.stopCasinoSlotBattleReel(Number(event.key) - 1);
            } else if (event.code === 'Space' && event.target && !['INPUT', 'SELECT', 'BUTTON'].includes(event.target.tagName)) {
                event.preventDefault();
                window.startCasinoSlotBattleSpin();
            }
        });
        showCasinoSlotDialog(battle);
        player.reelCtx = battle.querySelector('#csb-player-reels').getContext('2d');
        master.reelCtx = battle.querySelector('#csb-master-reels').getContext('2d');
        battle.querySelector('#csb-player-reels').addEventListener('click', event => {
            if (!slotBattleState || !slotBattleState.player.spinning) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const index = Math.max(0, Math.min(REEL_COUNT - 1, Math.floor((event.clientX - rect.left) / Math.max(1, rect.width) * REEL_COUNT)));
            window.stopCasinoSlotBattleReel(index);
        });
        drawCasinoSlotBattleReels(player);
        drawCasinoSlotBattleReels(master);
        drawCasinoSlotBattlePlayerAvatar(now);
        addCasinoSlotBattleLog(`${opponent.name}との対戦開始！`, 'special');
        refreshCasinoSlotBattleHud(now);
        casinoSlotBattleMasterSpeak('start', { force: true, once: 'start', duration: 3800 });
        window.playCasinoGameBGM('slot_main');
        slotBattleFrame = requestAnimationFrame(casinoSlotMasterBattleAnimationLoop);
        return true;
    }

    function openCasinoSlotBattleInfo(title, bodyHtml) {
        const battle = casinoSlotBattleRoot();
        if (!battle) return false;
        pauseCasinoSlotMasterBattle();
        const old = document.getElementById('casino-slot-battle-info');
        if (old) old.remove();
        const layer = document.createElement('div');
        layer.id = 'casino-slot-battle-info';
        layer.className = 'csb-layer';
        layer.innerHTML = `<div class="csb-panel"><h2>${casinoSlotBattleEscape(title)}</h2>${bodyHtml}<div class="csb-panel-actions"><button class="primary" onclick="window.closeCasinoSlotBattleInfo()">対戦へ戻る</button></div></div>`;
        battle.appendChild(layer);
        return true;
    }

    function pauseCasinoSlotMasterBattle() {
        if (!slotBattleState || !slotBattleState.active || slotBattleState.pauseStartedAt) return false;
        slotBattleState.pauseStartedAt = performance.now();
        return true;
    }

    function resumeCasinoSlotMasterBattle() {
        if (!slotBattleState || !slotBattleState.pauseStartedAt) return false;
        const now = performance.now();
        const pausedFor = Math.max(0, now - slotBattleState.pauseStartedAt);
        slotBattleState.startedAt += pausedFor;
        slotBattleState.lastFrameAt = now;
        [slotBattleState.player, slotBattleState.master].forEach(side => {
            if (!side) return;
            if (Number.isFinite(side.readyAt)) side.readyAt += pausedFor;
            if (side.spinStartedAt) side.spinStartedAt += pausedFor;
            side.autoStopAt = (side.autoStopAt || []).map(value => Number.isFinite(value) ? value + pausedFor : value);
            (side.reels || []).forEach(reel => {
                if (reel.stopStartedAt) reel.stopStartedAt += pausedFor;
            });
        });
        slotBattleState.pauseStartedAt = 0;
        refreshCasinoSlotBattleHud(now);
        return true;
    }

    window.closeCasinoSlotBattleInfo = function () {
        const layer = document.getElementById('casino-slot-battle-info');
        if (layer) layer.remove();
        resumeCasinoSlotMasterBattle();
        return true;
    };

    window.openCasinoSlotBattleHelp = function () {
        const special = slotBattleState && slotBattleState.master ? slotBattleState.master.specialName : '';
        return openCasinoSlotBattleInfo('対戦シンボル効果', `<div class="csb-info-grid"><span>🍒 チェリー：HP回復</span><span>🍋 レモン：次回目押し補助</span><span>✨ プラム：次の効果を強化</span><span>🍉 スイカ：回復・妨害解除</span><span>🔔 ベル：相手の次回転を妨害</span><span>💨 クローバー：回転待ち短縮</span><span>💎 ダイヤ：攻撃を防ぐバリア</span><span>BAR：通常攻撃</span><span>7：大攻撃</span><span>👻 WILD：直前効果を複製</span><span>✧ SCATTER：固有特殊ゲージ</span><span>3・4・5一致：効果が2・4・7倍</span></div><p>相手の固有特殊技：<strong style="color:#ffe082">${casinoSlotBattleEscape(special)}</strong></p>`);
    };

    window.openCasinoSlotBattleLogDetails = function () {
        const logs = slotBattleState && Array.isArray(slotBattleState.logs) ? slotBattleState.logs : [];
        const html = logs.length
            ? logs.map(entry => `<span class="${casinoSlotBattleEscape(entry.tone)}">${casinoSlotBattleEscape(entry.message)}</span>`).join('')
            : '<span>まだ戦闘記録はありません。</span>';
        return openCasinoSlotBattleInfo('戦闘詳細', `<div class="csb-detail-log" data-csb-detail-log>${html}</div>`);
    };

    window.requestCloseCasinoSlotMasterBattle = function () {
        if (!slotBattleState) return false;
        if (!slotBattleState.active) {
            cleanupCasinoSlotMasterBattle(true);
            return true;
        }
        if (document.getElementById('casino-slot-battle-forfeit')) return false;
        const layer = document.createElement('div');
        layer.id = 'casino-slot-battle-forfeit';
        layer.className = 'csb-layer';
        layer.innerHTML = `<div class="csb-panel"><h2>⚠ 対戦を棄権しますか？</h2><p>対戦中にカジノへ戻ると、<strong style="color:#ff9faf;">棄権敗北</strong>として戦績に記録され、賭け金は戻りません。<br>それでもカジノへ戻りますか？</p><div class="csb-panel-actions"><button class="primary" onclick="window.cancelCasinoSlotBattleForfeit()">対戦を続ける</button><button onclick="window.confirmCasinoSlotBattleForfeit()">棄権して戻る</button></div></div>`;
        const battle = document.getElementById('casino-slot-master-battle');
        if (battle) battle.appendChild(layer);
        pauseCasinoSlotMasterBattle();
        return true;
    };

    window.cancelCasinoSlotBattleForfeit = function () {
        const layer = document.getElementById('casino-slot-battle-forfeit');
        if (layer) layer.remove();
        resumeCasinoSlotMasterBattle();
        return true;
    };

    window.confirmCasinoSlotBattleForfeit = function () {
        if (!slotBattleState || !slotBattleState.active) return false;
        finishCasinoSlotMasterBattle('loss', 'forfeit', { suppressPanel: true });
        cleanupCasinoSlotMasterBattle(true);
        return true;
    };

    window.rematchCasinoSlotMasterBattle = function () {
        if (!slotBattleState || slotBattleState.active) return false;
        const settings = Object.assign({}, slotBattleState.settings);
        const opponent = Object.assign({}, slotBattleState.opponent);
        const hero = window.aiPet || {};
        if (Math.max(0, Number(hero.casinoCoins) || 0) < settings.bet) {
            const error = document.getElementById('casino-slot-battle-result-error');
            if (error) error.textContent = '同じ賭け金で再戦するためのカジノコインが足りません。';
            return false;
        }
        hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) - settings.bet;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        cleanupCasinoSlotMasterBattle(false);
        const started = openCasinoSlotMasterBattle(settings, opponent);
        if (!started) {
            hero.casinoCoins = Math.max(0, Number(hero.casinoCoins) || 0) + settings.bet;
            if (typeof window.saveGameData === 'function') window.saveGameData();
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('再戦を開始できなかったため、賭け金を返金しました。');
            cleanupCasinoSlotMasterBattle(true);
        }
        return started;
    };

    window.returnCasinoSlotBattleToLobby = function () {
        if (!slotBattleState || slotBattleState.active) return false;
        const settings = Object.assign({}, slotBattleState.settings);
        cleanupCasinoSlotMasterBattle(false);
        return window.openCasinoSlotBattleLobby({ settings, preferredMasterType: settings.masterType });
    };

    window.closeCasinoSlotMasterBattle = function () {
        if (!slotBattleState) return false;
        if (slotBattleState.active) return window.requestCloseCasinoSlotMasterBattle();
        cleanupCasinoSlotMasterBattle(true);
        return true;
    };
})();

// ==========================================
// 5カードドロー・ポーカー
// ==========================================
(function () {
    'use strict';

    const SUITS = [
        { id: 'spade', mark: '♠', color: '#111' },
        { id: 'heart', mark: '♥', color: '#c62828' },
        { id: 'dia', mark: '♦', color: '#c62828' },
        { id: 'club', mark: '♣', color: '#111' }
    ];
    const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const HAND_NAMES = ['ハイカード', 'ワンペア', 'ツーペア', 'スリーカード', 'ストレート', 'フラッシュ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ'];
    let pokerState = null;
    let pokerAnimationTimer = null;

    function clearPokerAnimationTimer() {
        if (pokerAnimationTimer) clearTimeout(pokerAnimationTimer);
        pokerAnimationTimer = null;
    }

    function schedulePokerAnimation(callback, delay) {
        clearPokerAnimationTimer();
        pokerAnimationTimer = setTimeout(() => {
            pokerAnimationTimer = null;
            callback();
        }, delay);
    }

    function shuffledDeck() {
        const deck = [];
        SUITS.forEach(suit => RANKS.forEach(rank => deck.push({ suit: suit.id, mark: suit.mark, color: suit.color, rank })));
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function evaluate(hand) {
        const ranks = hand.map(card => card.rank).sort((a, b) => b - a);
        const counts = {};
        ranks.forEach(rank => { counts[rank] = (counts[rank] || 0) + 1; });
        const groups = Object.keys(counts).map(Number).sort((a, b) => counts[b] - counts[a] || b - a);
        const flush = hand.every(card => card.suit === hand[0].suit);
        const unique = [...new Set(ranks)];
        let straightHigh = 0;
        if (unique.length === 5 && unique[0] - unique[4] === 4) straightHigh = unique[0];
        else if (unique.join(',') === '14,5,4,3,2') straightHigh = 5;
        if (straightHigh && flush) return { category: 8, values: [straightHigh], name: HAND_NAMES[8] };
        if (counts[groups[0]] === 4) return { category: 7, values: [groups[0], groups[1]], name: HAND_NAMES[7] };
        if (counts[groups[0]] === 3 && counts[groups[1]] === 2) return { category: 6, values: [groups[0], groups[1]], name: HAND_NAMES[6] };
        if (flush) return { category: 5, values: ranks, name: HAND_NAMES[5] };
        if (straightHigh) return { category: 4, values: [straightHigh], name: HAND_NAMES[4] };
        if (counts[groups[0]] === 3) return { category: 3, values: [groups[0], ...groups.slice(1).sort((a, b) => b - a)], name: HAND_NAMES[3] };
        if (counts[groups[0]] === 2 && counts[groups[1]] === 2) {
            const pairs = [groups[0], groups[1]].sort((a, b) => b - a);
            return { category: 2, values: [...pairs, groups[2]], name: HAND_NAMES[2] };
        }
        if (counts[groups[0]] === 2) return { category: 1, values: [groups[0], ...groups.slice(1).sort((a, b) => b - a)], name: HAND_NAMES[1] };
        return { category: 0, values: ranks, name: HAND_NAMES[0] };
    }

    function compareHands(a, b) {
        if (a.category !== b.category) return a.category > b.category ? 1 : -1;
        const length = Math.max(a.values.length, b.values.length);
        for (let i = 0; i < length; i++) {
            const av = a.values[i] || 0;
            const bv = b.values[i] || 0;
            if (av !== bv) return av > bv ? 1 : -1;
        }
        return 0;
    }

    function cardHtml(card, index, selectable, selected, hidden, animation = '', delay = 0) {
        const click = selectable ? `onclick="window.toggleCasinoPokerCard(${index})"` : '';
        const art = typeof window.renderCasinoTrumpCard === 'function'
            ? window.renderCasinoTrumpCard(card, { hidden, width: 82, height: 116 })
            : `<span style="display:block;width:82px;height:116px;background:#fff;color:${card.color};">${RANK_LABEL[card.rank] || card.rank}${card.mark}</span>`;
        const slotClasses = ['casino-poker-card-slot', animation, selected ? 'is-selected' : ''].filter(Boolean).join(' ');
        return `<span class="${slotClasses}" style="--poker-card-delay:${delay}ms;"><button type="button" class="casino-poker-card${selected ? ' is-selected' : ''}" ${click} aria-pressed="${selected ? 'true' : 'false'}" aria-label="${hidden ? '伏せ札' : `${RANK_LABEL[card.rank] || card.rank}${card.mark}`}">${art}</button></span>`;
    }

    function opponentChoices() {
        const context = typeof window.getCasinoCardGameContext === 'function'
            ? window.getCasinoCardGameContext()
            : { source: 'table', lockedVisitors: [] };
        const locked = context.source === 'conversation' && Array.isArray(context.lockedVisitors)
            ? context.lockedVisitors.filter(Boolean)
            : [];
        const source = locked.length
            ? locked
            : (typeof window.getCasinoEligibleGameMasters === 'function' ? window.getCasinoEligibleGameMasters() : []);
        const result = locked.length
            ? []
            : [{ id: 'dealer', name: 'ディーラー', type: 'dealer', masterType: 'dealer' }];
        source.forEach(visitor => {
            if (!visitor || result.some(entry => entry.id === visitor.id)) return;
            result.push({
                id: visitor.id,
                name: visitor.name || '来客',
                type: visitor.kind || 'guest',
                masterType: visitor.masterType || '',
                kind: visitor.kind || 'guest'
            });
        });
        return result;
    }

    function pokerOpponentPreviewHtml(opponent) {
        if (!opponent) return '<span class="casino-poker-opponent-empty">対戦相手を選択してください。</span>';
        const avatar = opponent.masterType && typeof window.renderCasinoMasterAvatar === 'function'
            ? window.renderCasinoMasterAvatar(opponent.masterType, 'casino-poker-master-avatar')
            : '';
        const profile = opponent.masterType && typeof window.getCasinoMasterProfile === 'function'
            ? window.getCasinoMasterProfile(opponent.masterType)
            : null;
        return `${avatar}<span><small>${opponent.type === 'dealer' ? 'HOUSE DEALER' : 'CASINO VISITOR'}</small><strong>${opponent.name}</strong><b>${profile ? '会話済み・本日来店中' : '対戦できます'}</b></span>`;
    }

    function setupHtml() {
        const hero = window.aiPet || {};
        const context = typeof window.getCasinoCardGameContext === 'function'
            ? window.getCasinoCardGameContext()
            : { source: 'table', lockedVisitors: [] };
        const opponentList = opponentChoices();
        const preferred = window._casinoPreferredPokerOpponent || 'dealer';
        const selectedOpponent = opponentList.find(opponent => opponent.id === preferred) || opponentList[0];
        const locked = context.source === 'conversation' && opponentList.length === 1;
        const options = opponentList.map(opponent => `<option value="${opponent.id}" ${opponent.id === (selectedOpponent && selectedOpponent.id) ? 'selected' : ''}>${opponent.name}</option>`).join('');
        return `
            <div class="casino-poker-setup">
                <div class="casino-poker-intro">
                    <span class="casino-poker-intro-icon">♠</span>
                    <div><strong>5枚の手札で${selectedOpponent ? selectedOpponent.name : '対戦相手'}と勝負</strong><small>交換は最大2回。勝利でベット分のコインを獲得します。</small></div>
                </div>
                <div class="casino-poker-settings">
                    <label><span>対戦相手${locked ? '（会話相手に固定）' : ''}</span><select id="casino-poker-opponent" onchange="window.refreshCasinoPokerOpponentPreview()" ${locked ? 'disabled' : ''}>${options}</select></label>
                    <label><span>ベット</span><span class="casino-poker-bet-control"><input id="casino-poker-bet" type="number" min="1" max="100" value="1"><b>コイン</b></span></label>
                    <div class="casino-poker-wallet"><span>所持コイン</span><strong>🪙 ${Number(hero.casinoCoins || 0).toLocaleString()}</strong></div>
                </div>
                <div id="casino-poker-opponent-preview" class="casino-poker-opponent-preview">${pokerOpponentPreviewHtml(selectedOpponent)}</div>
                <div id="casino-poker-setup-notice" class="casino-poker-notice" aria-live="polite"></div>
                <button type="button" class="casino-poker-btn casino-poker-btn-primary casino-poker-deal-btn" onclick="window.startCasinoPokerRound()"><span>カードを配る</span><small>BET &amp; DEAL</small></button>
            </div>`;
    }

    function pokerStyleHtml() {
        return `<style>
            #casino-poker-ui::backdrop{background:rgba(0,0,0,.82);backdrop-filter:blur(3px)}
            .casino-poker-shell{width:min(960px,95vw);max-height:95vh;overflow:auto;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(32,7,17,.98),rgba(10,3,7,.99));padding:22px 28px 26px;box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 24px 80px #000,0 0 42px rgba(200,153,57,.2)}
            .casino-poker-header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-bottom:18px;border-bottom:1px solid rgba(255,213,106,.28)}
            .casino-poker-title{display:flex;align-items:center;gap:12px;margin:0;color:#ffd56a;font-size:clamp(22px,3vw,30px);letter-spacing:.04em;text-shadow:0 2px 14px rgba(255,190,55,.28)}
            .casino-poker-title-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#ffd86e,#9c6516);color:#21070f;box-shadow:0 0 20px rgba(255,202,40,.32)}
            .casino-poker-btn{appearance:none;border:1px solid rgba(255,218,128,.65);border-radius:10px;padding:12px 22px;color:#fff;background:linear-gradient(180deg,#633047,#351421);font-weight:800;font-size:15px;letter-spacing:.03em;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.12);transition:transform .16s,filter .16s,box-shadow .16s}
            .casino-poker-btn:hover{transform:translateY(-2px);filter:brightness(1.13);box-shadow:0 8px 22px rgba(0,0,0,.42),0 0 14px rgba(255,196,72,.18)}
            .casino-poker-btn:active{transform:translateY(1px)}
            .casino-poker-btn-primary{border-color:#ffe08a;background:linear-gradient(180deg,#d79b2d,#8e5412);color:#1b0803;text-shadow:0 1px rgba(255,255,255,.35)}
            .casino-poker-close{display:flex;align-items:center;gap:8px;padding:10px 16px;background:linear-gradient(180deg,#5a2638,#2b101a);color:#f9d9e3;border-color:#9b536a}
            .casino-poker-close b{font-size:20px;line-height:1}
            #casino-poker-content{margin-top:20px}
            .casino-poker-setup{display:grid;gap:20px;max-width:720px;margin:14px auto 2px}
            .casino-poker-intro{display:flex;align-items:center;gap:16px;padding:17px 20px;border:1px solid rgba(255,213,106,.3);border-radius:14px;background:linear-gradient(90deg,rgba(131,74,20,.22),rgba(82,24,49,.2))}
            .casino-poker-intro-icon{display:grid;place-items:center;width:50px;height:50px;flex:none;border-radius:12px;background:#13070b;color:#ffd56a;font-size:30px;box-shadow:inset 0 0 0 1px #a66f20}
            .casino-poker-intro strong,.casino-poker-intro small{display:block}.casino-poker-intro strong{font-size:18px;color:#fff0c2}.casino-poker-intro small{margin-top:5px;color:#beaeb4;line-height:1.5}
            .casino-poker-settings{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
            .casino-poker-settings label,.casino-poker-wallet{display:grid;gap:7px;padding:14px;border:1px solid #5b3541;border-radius:12px;background:rgba(255,255,255,.035)}
            .casino-poker-settings label>span:first-child,.casino-poker-wallet span{color:#c8b9be;font-size:12px;font-weight:bold;letter-spacing:.08em}
            .casino-poker-settings select,.casino-poker-settings input{width:100%;min-height:40px;box-sizing:border-box;border:1px solid #8a5c68;border-radius:8px;background:#13070c;color:#fff;padding:8px 10px;font-weight:bold;outline:none}
            .casino-poker-settings select:focus,.casino-poker-settings input:focus{border-color:#ffd56a;box-shadow:0 0 0 2px rgba(255,213,106,.18)}
            .casino-poker-bet-control{display:flex;align-items:center;gap:7px}.casino-poker-bet-control b{white-space:nowrap;color:#ffd56a;font-size:12px}
            .casino-poker-wallet strong{align-self:center;color:#ffd56a;font-size:19px}
            .casino-poker-opponent-preview{display:flex;align-items:center;gap:12px;min-height:70px;padding:10px 14px;border:1px solid rgba(255,213,106,.3);border-radius:12px;background:rgba(10,25,20,.62)}.casino-poker-opponent-preview>span:last-child{display:grid;gap:2px}.casino-poker-opponent-preview small{color:#c99c45;font-size:9px;font-weight:900;letter-spacing:.16em}.casino-poker-opponent-preview strong{color:#fff0c2;font-size:17px}.casino-poker-opponent-preview b{color:#9fd8b8;font-size:10px}.casino-poker-master-avatar{display:block;width:56px;height:56px;flex:0 0 56px;overflow:hidden;border:2px solid #d6ad5d;border-radius:50%;background:#160a0e;box-shadow:0 0 0 2px #050304,0 0 14px rgba(255,213,106,.2)}.casino-poker-master-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 12%}
            .casino-poker-notice{min-height:18px;text-align:center;color:#ff9e9e;font-size:12px;font-weight:bold}
            .casino-poker-deal-btn{display:grid;place-items:center;justify-self:center;min-width:250px;padding:14px 28px}.casino-poker-deal-btn span{font-size:18px}.casino-poker-deal-btn small{margin-top:2px;font-size:9px;letter-spacing:.22em;opacity:.72}
            .casino-poker-round{text-align:center}
            .casino-poker-round-head{display:flex;justify-content:center;align-items:center;gap:12px;margin:2px 0 14px}.casino-poker-round-head strong{font-size:20px}.casino-poker-chip{padding:5px 10px;border:1px solid #a97322;border-radius:999px;background:rgba(166,111,32,.18);color:#ffd56a;font-size:12px;font-weight:bold}
            .casino-poker-opponent-hud{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto 12px;max-width:720px}.casino-poker-opponent-copy{display:grid;gap:3px;min-width:0;text-align:left}.casino-poker-opponent-copy small{color:#c99c45;font-size:9px;font-weight:900;letter-spacing:.16em}.casino-poker-opponent-copy strong{color:#fff0c2;font-size:17px}.casino-poker-opponent-speech{position:relative;max-width:520px;padding:9px 13px;border:1px solid #d4ae66;border-radius:4px 13px 13px 13px;background:rgba(10,8,8,.88);color:#fff6e6;font-size:12px;font-weight:bold;line-height:1.5;text-align:left}.casino-poker-opponent-speech:before{content:'';position:absolute;left:-8px;top:0;border-width:0 8px 9px 0;border-style:solid;border-color:transparent #d4ae66 transparent transparent}
            .casino-poker-table{position:relative;padding:16px 18px 18px;border:1px solid rgba(206,159,57,.38);border-radius:20px;background:radial-gradient(ellipse at center,#184c3b 0,#0d3028 55%,#071b17 100%);box-shadow:inset 0 0 35px rgba(0,0,0,.72),0 8px 26px rgba(0,0,0,.4)}
            .casino-poker-hand-label{display:flex;justify-content:center;align-items:center;gap:9px;margin:0 0 9px;color:#f4e7d2;font-size:14px;font-weight:800;letter-spacing:.08em}.casino-poker-hand-label span{color:#c6a15e;font-size:11px}
            .casino-poker-cards{display:flex;justify-content:center;gap:10px;min-height:130px;overflow:visible;padding:10px 4px 2px}
            .casino-poker-divider{display:flex;align-items:center;gap:12px;margin:13px 4px;color:#d6a83e;font-size:11px;font-weight:bold;letter-spacing:.18em}.casino-poker-divider:before,.casino-poker-divider:after{content:'';height:1px;flex:1;background:linear-gradient(90deg,transparent,#a97824,transparent)}
            .casino-poker-card-slot{position:relative;display:inline-block;width:88px;height:122px;flex:0 0 88px;transform-origin:center bottom}
            .casino-poker-card{width:88px;height:122px;padding:0;border:3px solid #f1eee8;border-radius:10px;background:#fff;overflow:hidden;box-sizing:border-box;box-shadow:0 5px 13px rgba(0,0,0,.56);cursor:default;transition:transform .18s,box-shadow .18s,border-color .18s;transform-origin:center}
            .casino-poker-card-slot.is-selected:after{content:'交換';position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);z-index:4;padding:3px 9px;border-radius:999px;background:#ffca28;color:#271300;font-size:10px;font-weight:900;box-shadow:0 2px 8px #000}
            .casino-poker-card[onclick]{cursor:pointer}.casino-poker-card[onclick]:hover{transform:translateY(-7px);box-shadow:0 10px 18px rgba(0,0,0,.62),0 0 13px rgba(255,213,106,.32)}
            .casino-poker-card.is-selected{transform:translateY(-10px);border-color:#ffca28;box-shadow:0 11px 20px rgba(0,0,0,.62),0 0 20px #ffca28}
            .poker-deal{opacity:0;animation:pokerCardDeal .46s cubic-bezier(.2,.8,.24,1.12) forwards;animation-delay:var(--poker-card-delay)}
            .poker-discard{animation:pokerCardDiscard .46s cubic-bezier(.55,.06,.68,.19) forwards;animation-delay:var(--poker-card-delay)}
            .poker-draw{opacity:0;animation:pokerCardDraw .5s cubic-bezier(.2,.85,.22,1.13) forwards;animation-delay:var(--poker-card-delay)}
            .poker-reveal .casino-poker-card{animation:pokerCardReveal .5s ease-out both;animation-delay:var(--poker-card-delay)}
            @keyframes pokerCardDeal{0%{opacity:0;transform:translate(210px,-135px) rotate(18deg) scale(.62)}70%{opacity:1;transform:translate(-5px,3px) rotate(-2deg) scale(1.03)}100%{opacity:1;transform:none}}
            @keyframes pokerCardDiscard{0%{opacity:1;transform:none}100%{opacity:0;transform:translate(-80px,130px) rotate(-18deg) scale(.72)}}
            @keyframes pokerCardDraw{0%{opacity:0;transform:translate(180px,-115px) rotate(15deg) scale(.66)}100%{opacity:1;transform:none}}
            @keyframes pokerCardReveal{0%{transform:rotateY(90deg);filter:brightness(1.8)}100%{transform:rotateY(0);filter:none}}
            .casino-poker-footer{min-height:92px;display:grid;place-items:center;margin-top:16px}
            .casino-poker-instruction{display:grid;gap:9px;place-items:center;color:#d7cbd0}.casino-poker-instruction p{margin:0;font-size:13px}.casino-poker-selected-count{color:#ffd56a;font-weight:900}
            .casino-poker-status{display:flex;align-items:center;justify-content:center;gap:12px;color:#ffe6a7;font-weight:800;letter-spacing:.04em}.casino-poker-status:before{content:'';width:18px;height:18px;border:3px solid rgba(255,213,106,.3);border-top-color:#ffd56a;border-radius:50%;animation:pokerSpin .8s linear infinite}@keyframes pokerSpin{to{transform:rotate(360deg)}}
            .casino-poker-showdown{font-size:22px;color:#ffd56a;text-shadow:0 0 18px rgba(255,202,40,.55);animation:pokerShowdown .65s ease-in-out infinite alternate}@keyframes pokerShowdown{from{transform:scale(.97);opacity:.72}to{transform:scale(1.04);opacity:1}}
            .casino-poker-result{display:grid;gap:8px;place-items:center;animation:pokerResultIn .48s cubic-bezier(.2,.8,.2,1.15) both}@keyframes pokerResultIn{from{opacity:0;transform:scale(.8) translateY(14px)}to{opacity:1;transform:none}}
            .casino-poker-result-label{font-size:34px;font-weight:950;letter-spacing:.08em;text-shadow:0 0 22px currentColor}.casino-poker-result-detail{color:#ded1d5;font-size:14px}.casino-poker-result-coins{font-size:18px;font-weight:900}
            .casino-poker-result-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin-top:4px}.casino-poker-result-notice{color:#ff9e9e;font-size:12px;font-weight:bold}
            @media(max-width:720px){.casino-poker-shell{padding:16px 12px}.casino-poker-settings{grid-template-columns:1fr}.casino-poker-cards{justify-content:flex-start;overflow-x:auto;padding-bottom:14px}.casino-poker-title{font-size:20px}.casino-poker-close span{display:none}}
            @media(prefers-reduced-motion:reduce){.poker-deal,.poker-discard,.poker-draw,.poker-reveal .casino-poker-card,.casino-poker-result,.casino-poker-status:before,.casino-poker-showdown{animation-duration:.01ms!important;animation-delay:0ms!important}}
        </style>`;
    }

    window.openCasinoPoker = function () {
        clearPokerAnimationTimer();
        pokerState = null;
        window.restoreCasinoLobbyBGM();
        let old = document.getElementById('casino-poker-ui');
        if (old) old.remove();
        // encounterOverlayを含む通常のz-index階層より確実に前へ出すため、
        // 対応ブラウザではdialogのtop layerを使用する。
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-poker-ui';
        overlay.setAttribute('aria-label', '5カードドロー・ポーカー');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:radial-gradient(circle,#4c1026,#050305 75%);color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `${pokerStyleHtml()}<div class="casino-poker-shell"><div class="casino-poker-header"><h2 class="casino-poker-title"><span class="casino-poker-title-mark">♠</span><span>5カードドロー・ポーカー</span></h2><button type="button" class="casino-poker-btn casino-poker-close" onclick="window.closeCasinoPoker()"><b>×</b><span>テーブルを離れる</span></button></div><div id="casino-poker-content">${setupHtml()}</div></div>`;
        overlay.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoPoker();
        });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try {
                overlay.showModal();
            } catch (error) {
                console.warn('ポーカーUIをtop layerへ移動できなかったため、通常の最前面表示を使用します。', error);
                overlay.setAttribute('open', '');
            }
        } else {
            overlay.setAttribute('open', '');
        }
        window._casinoPreferredPokerOpponent = null;
    };

    window.closeCasinoPoker = function () {
        clearPokerAnimationTimer();
        pokerState = null;
        if (typeof window.clearCasinoCardGameContext === 'function') window.clearCasinoCardGameContext();
        const overlay = document.getElementById('casino-poker-ui');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
        window.restoreCasinoLobbyBGM();
    };

    window.refreshCasinoPokerOpponentPreview = function () {
        const select = document.getElementById('casino-poker-opponent');
        const preview = document.getElementById('casino-poker-opponent-preview');
        if (!preview) return;
        const opponents = opponentChoices();
        const opponent = opponents.find(entry => entry.id === (select && select.value)) || opponents[0];
        preview.innerHTML = pokerOpponentPreviewHtml(opponent);
    };

    window.startCasinoPokerRound = function () {
        const hero = window.aiPet;
        const betInput = document.getElementById('casino-poker-bet');
        const opponentInput = document.getElementById('casino-poker-opponent');
        const bet = Math.floor(Number(betInput && betInput.value) || 0);
        const notice = document.getElementById('casino-poker-setup-notice');
        if (!hero || bet < 1 || bet > 100) {
            if (notice) notice.textContent = 'ベットは1～100コインで指定してください。';
            return;
        }
        if (hero.casinoCoins < bet) {
            if (notice) notice.textContent = 'カジノコインが足りません。';
            return;
        }
        const opponents = opponentChoices();
        const opponent = opponents.find(entry => entry.id === (opponentInput && opponentInput.value)) || opponents[0];
        beginPokerRound(bet, opponent);
    };

    function beginPokerRound(bet, opponent) {
        const hero = window.aiPet;
        if (!hero || !opponent || hero.casinoCoins < bet) return false;
        const deck = shuffledDeck();
        hero.casinoCoins -= bet;
        clearPokerAnimationTimer();
        pokerState = {
            deck,
            bet,
            opponent,
            player: deck.splice(0, 5),
            enemy: deck.splice(0, 5),
            selected: new Set(),
            playerExchangeIndices: [],
            enemyExchangeIndices: [],
            exchangeRound: 1,
            maxExchanges: 2,
            phase: 'dealing',
            opponentSpeech: opponent.masterType && typeof window.getCasinoMasterGameDialogue === 'function'
                ? window.getCasinoMasterGameDialogue(opponent.masterType, 'start')
                : ''
        };
        window.playCasinoGameBGM('poker_main');
        const round = pokerState;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        renderRound();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        schedulePokerAnimation(() => {
            if (pokerState !== round || round.phase !== 'dealing') return;
            round.phase = 'exchange';
            renderRound();
        }, 1380);
        return true;
    }

    window.replayCasinoPoker = function () {
        if (!pokerState || pokerState.phase !== 'result') return;
        const bet = pokerState.bet;
        const opponent = pokerState.opponent;
        if (!window.aiPet || window.aiPet.casinoCoins < bet) {
            pokerState.replayNotice = `次のベットに${bet}コイン必要です。`;
            renderRound();
            return;
        }
        beginPokerRound(bet, opponent);
    };

    window.showCasinoPokerSetup = function () {
        clearPokerAnimationTimer();
        pokerState = null;
        const content = document.getElementById('casino-poker-content');
        if (content) content.innerHTML = setupHtml();
        window.restoreCasinoLobbyBGM();
    };

    window.toggleCasinoPokerCard = function (index) {
        if (!pokerState || pokerState.phase !== 'exchange') return;
        if (pokerState.selected.has(index)) pokerState.selected.delete(index);
        else pokerState.selected.add(index);
        renderRound();
    };

    function dealerExchangeIndices(hand) {
        const evalResult = evaluate(hand);
        const counts = {};
        hand.forEach(card => { counts[card.rank] = (counts[card.rank] || 0) + 1; });
        if (evalResult.category >= 4) return [];
        const repeated = new Set(Object.keys(counts).filter(rank => counts[rank] >= 2).map(Number));
        if (repeated.size) return hand.map((card, index) => repeated.has(card.rank) ? -1 : index).filter(index => index >= 0);
        return hand.map((card, index) => card.rank >= 12 ? -1 : index).filter(index => index >= 0);
    }

    window.drawCasinoPoker = function () {
        if (!pokerState || pokerState.phase !== 'exchange') return;
        const round = pokerState;
        round.playerExchangeIndices = [...round.selected].sort((a, b) => a - b);
        round.enemyExchangeIndices = dealerExchangeIndices(round.enemy);
        if (round.opponent.masterType && typeof window.getCasinoMasterGameDialogue === 'function') {
            round.opponentSpeech = window.getCasinoMasterGameDialogue(round.opponent.masterType, 'play');
        }
        round.phase = 'discarding';
        renderRound();
        schedulePokerAnimation(() => {
            if (pokerState !== round || round.phase !== 'discarding') return;
            round.playerExchangeIndices.forEach(index => { round.player[index] = round.deck.shift(); });
            round.enemyExchangeIndices.forEach(index => { round.enemy[index] = round.deck.shift(); });
            round.selected.clear();
            round.phase = 'drawing';
            renderRound();
            schedulePokerAnimation(() => {
                if (pokerState !== round || round.phase !== 'drawing') return;
                if (round.exchangeRound < round.maxExchanges) {
                    round.exchangeRound++;
                    round.playerExchangeIndices = [];
                    round.enemyExchangeIndices = [];
                    round.phase = 'exchange';
                    renderRound();
                } else {
                    resolvePokerRound(round);
                }
            }, 760);
        }, 540);
    };

    function resolvePokerRound(round) {
        if (pokerState !== round || round.phase !== 'drawing' || round.resolved) return;
        round.resolved = true;
        const playerResult = evaluate(round.player);
        const enemyResult = evaluate(round.enemy);
        const comparison = compareHands(playerResult, enemyResult);
        const hero = window.aiPet;
        let result = 'loss';
        let payout = 0;
        if (comparison > 0) { result = 'win'; payout = round.bet * 2; }
        else if (comparison === 0) { result = 'draw'; payout = round.bet; }
        hero.casinoCoins += payout;
        round.result = result;
        round.playerResult = playerResult;
        round.enemyResult = enemyResult;
        round.netCoins = payout - round.bet;
        if (round.opponent.masterType && typeof window.getCasinoMasterGameDialogue === 'function') {
            const opponentEvent = result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw';
            round.opponentSpeech = window.getCasinoMasterGameDialogue(round.opponent.masterType, opponentEvent);
        }
        round.phase = 'reveal';
        if (typeof window.recordDealerCasinoGameResult === 'function') {
            window.recordDealerCasinoGameResult('poker', result, {
                netCoins: round.netCoins,
                bet: round.bet,
                opponentId: round.opponent.id,
                opponentName: round.opponent.name,
                opponentType: round.opponent.type,
                masterType: round.opponent.masterType || ''
            });
        }
        renderRound();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        schedulePokerAnimation(() => {
            if (pokerState !== round || round.phase !== 'reveal') return;
            round.phase = 'result';
            if (round.result !== 'draw') window.playCasinoGameBGM(round.result === 'win' ? 'poker_win' : 'poker_lose');
            renderRound();
        }, 1120);
    }

    function renderRound() {
        const content = document.getElementById('casino-poker-content');
        if (!content || !pokerState) return;
        const phase = pokerState.phase;
        const reveal = phase === 'reveal' || phase === 'result';
        const playerExchange = new Set(pokerState.playerExchangeIndices || []);
        const enemyExchange = new Set(pokerState.enemyExchangeIndices || []);
        const enemyCards = pokerState.enemy.map((card, index) => {
            let animation = '';
            let delay = 0;
            if (phase === 'dealing') { animation = 'poker-deal'; delay = index * 180; }
            else if (phase === 'discarding' && enemyExchange.has(index)) { animation = 'poker-discard'; delay = enemyExchange.has(index) ? [...enemyExchange].indexOf(index) * 55 : 0; }
            else if (phase === 'drawing' && enemyExchange.has(index)) { animation = 'poker-draw'; delay = [...enemyExchange].indexOf(index) * 80; }
            else if (phase === 'reveal') { animation = 'poker-reveal'; delay = index * 120; }
            return cardHtml(card, index, false, false, !reveal, animation, delay);
        }).join('');
        const playerCards = pokerState.player.map((card, index) => {
            let animation = '';
            let delay = 0;
            if (phase === 'dealing') { animation = 'poker-deal'; delay = index * 180 + 90; }
            else if (phase === 'discarding' && playerExchange.has(index)) { animation = 'poker-discard'; delay = [...playerExchange].indexOf(index) * 55; }
            else if (phase === 'drawing' && playerExchange.has(index)) { animation = 'poker-draw'; delay = [...playerExchange].indexOf(index) * 80; }
            return cardHtml(card, index, phase === 'exchange', pokerState.selected.has(index), false, animation, delay);
        }).join('');

        let footer = '';
        if (phase === 'dealing') footer = `<div class="casino-poker-status">カードを配っています…</div>`;
        else if (phase === 'exchange') {
            const finalExchange = pokerState.exchangeRound >= pokerState.maxExchanges;
            const zeroLabel = finalExchange ? '交換せずに勝負する' : '交換せずに2回目へ進む';
            footer = `<div class="casino-poker-instruction"><p>交換したいカードを選択してください。交換は最大${pokerState.maxExchanges}回です。</p><div class="casino-poker-selected-count">交換 ${pokerState.exchangeRound} / ${pokerState.maxExchanges}　・　選択 ${pokerState.selected.size}枚</div><button type="button" class="casino-poker-btn casino-poker-btn-primary" onclick="window.drawCasinoPoker()">${pokerState.selected.size ? '選んだカードを交換する' : zeroLabel}</button></div>`;
        }
        else if (phase === 'discarding') footer = `<div class="casino-poker-status">選んだカードを回収しています…</div>`;
        else if (phase === 'drawing') footer = `<div class="casino-poker-status">新しいカードを配っています…</div>`;
        else if (phase === 'reveal') footer = `<div class="casino-poker-showdown">SHOWDOWN</div>`;
        else if (phase === 'result') {
            const label = pokerState.result === 'win' ? 'WIN' : pokerState.result === 'draw' ? 'DRAW' : 'LOSE';
            const color = pokerState.result === 'win' ? '#ffdc62' : pokerState.result === 'draw' ? '#80d8ff' : '#ff8a80';
            footer = `<div class="casino-poker-result" style="color:${color};"><div class="casino-poker-result-label">${label}</div><div class="casino-poker-result-coins">${pokerState.netCoins >= 0 ? '+' : ''}${pokerState.netCoins} コイン</div><div class="casino-poker-result-detail">あなた：${pokerState.playerResult.name}　／　${pokerState.opponent.name}：${pokerState.enemyResult.name}</div>${pokerState.replayNotice ? `<div class="casino-poker-result-notice">${pokerState.replayNotice}</div>` : ''}<div class="casino-poker-result-actions"><button type="button" class="casino-poker-btn casino-poker-btn-primary" onclick="window.replayCasinoPoker()">同じ条件ですぐ再戦</button><button type="button" class="casino-poker-btn" onclick="window.showCasinoPokerSetup()">設定を変更</button></div></div>`;
        }
        const opponentAvatar = pokerState.opponent.masterType && typeof window.renderCasinoMasterAvatar === 'function'
            ? window.renderCasinoMasterAvatar(pokerState.opponent.masterType, 'casino-poker-master-avatar')
            : '';
        const opponentHud = opponentAvatar
            ? `<div class="casino-poker-opponent-hud">${opponentAvatar}<span class="casino-poker-opponent-copy"><small>OPPONENT</small><strong>${pokerState.opponent.name}</strong></span>${pokerState.opponentSpeech ? `<span class="casino-poker-opponent-speech">${pokerState.opponentSpeech}</span>` : ''}</div>`
            : '';
        content.innerHTML = `<div class="casino-poker-round"><div class="casino-poker-round-head"><strong>${pokerState.opponent.name}との勝負</strong><span class="casino-poker-chip">BET ${pokerState.bet}</span></div>${opponentHud}<div class="casino-poker-table"><div class="casino-poker-hand-label">${pokerState.opponent.name}<span>${reveal ? pokerState.enemyResult.name : 'HAND'}</span></div><div class="casino-poker-cards">${enemyCards}</div><div class="casino-poker-divider">DRAW POKER</div><div class="casino-poker-cards">${playerCards}</div><div class="casino-poker-hand-label" style="margin:10px 0 0;">あなた<span>${phase === 'result' || phase === 'reveal' ? pokerState.playerResult.name : 'YOUR HAND'}</span></div></div><div class="casino-poker-footer">${footer}</div></div>`;
    }
})();

// ==========================================
// 設定式・大富豪（4～6人戦）
// ==========================================
(function () {
    'use strict';

    window.CASINO_DAIFUGO_RULES = window.CASINO_DAIFUGO_RULES || {
        joker: { name: 'ジョーカー', desc: '最強の単体札として1枚を加える。', default: true },
        spade3: { name: 'スペード3返し', desc: '単体ジョーカーにスペード3で勝てる。', default: true },
        revolution: { name: '革命', desc: '同じ数字4枚で強弱を反転する。', default: true },
        stairs: { name: '階段', desc: '同一スートの連続3枚以上を出せる。', default: true },
        stairRevolution: { name: '階段革命', desc: '5枚以上の階段で革命が起きる。', default: true },
        eightCut: { name: '8切り', desc: '8を含む札で場を流す。', default: true },
        suitLock: { name: 'しばり', desc: '同じスート構成が続くと、その構成に固定する。', default: false },
        numericLock: { name: '数しばり', desc: '連続する強さが続くと、次も隣接数字に限定する。', default: false },
        capitalFall: { name: '都落ち', desc: '前回の大富豪が次戦で1位を逃すと最下位扱い。', default: false },
        forbiddenFinish: { name: '反則上がり', desc: '8・ジョーカー・通常時2・革命時3で上がると最下位。', default: true },
        fiveSkip: { name: '5スキップ', desc: '5の枚数だけ次の手番を飛ばす。', default: false },
        sixReverse: { name: '6リバース', desc: '6を出すと手番方向が反転する。', default: false },
        sevenPass: { name: '7渡し', desc: '7を出した人が手札から1枚選び、次の人へ渡す。', default: false },
        nineReverse: { name: '9リバース', desc: '9を出すと手番方向が反転する。', default: false },
        nineRescue: { name: '9救急', desc: '9を出した人が手札から1枚選んで捨てる。', default: false },
        tenDiscard: { name: '10捨て', desc: '10を出した人が手札から1枚選んで捨てる。', default: false },
        elevenBack: { name: 'イレブンバック', desc: '11を含む場が流れるまで強弱を一時反転する。', default: false },
        queenBomber: { name: 'クイーンボンバー', desc: 'Qを出した人が数字を選び、全員の手札から捨てる。', default: false },
        kingRevolution: { name: 'K革命', desc: 'Kを3枚以上出すと革命が起きる。', default: false },
        aceSkip: { name: 'Aスキップ', desc: 'Aの枚数だけ次の手番を飛ばす。', default: false },
        sandstorm: { name: '砂嵐', desc: '3を3枚出すと、数字に関係なく3枚組へ勝てる。', default: false },
        emperor: { name: 'エンペラー', desc: '4スートが揃った連続4枚を特殊階段として出せる。', default: false },
        gekokujo: { name: '下克上', desc: 'スペード3で上がった場合、その勝者を大富豪として記録する。', default: false },
        diamond3Start: { name: 'ダイヤ3始め', desc: '初戦はダイヤ3を持つ人から開始する。', default: true }
    };

    // ローカルルールは地域差が大きいため、既知ルールを標準登録しつつ後から追加できる形にする。
    window.registerCasinoDaifugoRule = function (id, definition) {
        if (!id || !definition || typeof definition !== 'object' || !definition.name) return false;
        window.CASINO_DAIFUGO_RULES[id] = Object.assign({ desc: '', default: false }, definition);
        return true;
    };

    const SUITS = ['spade', 'heart', 'dia', 'club'];
    const SUIT_MARK = { spade: '♠', heart: '♥', dia: '♦', club: '♣' };
    const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2', 16: 'JOKER' };
    const DEFAULT_PLAYER_NAMES = ['あなた', 'ディーラー', 'CPU・ルビー', 'CPU・サファイア', 'CPU・エメラルド', 'CPU・アメジスト'];
    const CPU_PLAYER_NAMES = ['CPU・ルビー', 'CPU・サファイア', 'CPU・エメラルド', 'CPU・アメジスト', 'CPU・トパーズ'];
    const PLAYER_NAMES = DEFAULT_PLAYER_NAMES.slice();
    let df = null;
    let cpuTimer = null;
    let daifugoSetupMasterIds = [];

    function resetDaifugoPlayerNames() {
        PLAYER_NAMES.length = 0;
        PLAYER_NAMES.push(...DEFAULT_PLAYER_NAMES);
    }

    function daifugoLaunchContext() {
        return typeof window.getCasinoCardGameContext === 'function'
            ? window.getCasinoCardGameContext()
            : { source: 'table', lockedVisitors: [] };
    }

    function availableDaifugoMasters() {
        const context = daifugoLaunchContext();
        if (context.source === 'conversation' && Array.isArray(context.lockedVisitors) && context.lockedVisitors.length) {
            return context.lockedVisitors.filter(visitor => visitor && visitor.masterType);
        }
        const visitors = typeof window.getCasinoEligibleGameMasters === 'function'
            ? window.getCasinoEligibleGameMasters()
            : [];
        return [
            { id: 'dealer', kind: 'master', masterType: 'dealer', name: 'ディーラー', isResidentDealer: true },
            ...visitors
        ];
    }

    function selectedDaifugoMasters() {
        const available = availableDaifugoMasters();
        return daifugoSetupMasterIds
            .map(id => available.find(visitor => visitor && visitor.id === id))
            .filter(Boolean)
            .slice(0, 4);
    }

    function setDaifugoSpeech(player, event) {
        if (!df || !Array.isArray(df.participants)) return;
        const participant = df.participants[player];
        if (!participant || !participant.masterType || typeof window.getCasinoMasterGameDialogue !== 'function') return;
        df.speech = {
            player,
            masterType: participant.masterType,
            name: participant.name || PLAYER_NAMES[player],
            text: window.getCasinoMasterGameDialogue(participant.masterType, event)
        };
    }

    function daifugoParticipantSetupHtml() {
        const context = daifugoLaunchContext();
        const available = availableDaifugoMasters();
        const locked = context.source === 'conversation' && available.length === 1;
        if (!available.length) {
            return `<section class="df-master-setup"><div class="df-master-heading"><div><small>MASTER GUESTS</small><h3>参加する師匠</h3></div><span>対戦枠内で任意</span></div><div class="df-master-empty">参加できる師匠はいません。空席には一般CPUが参加します。</div></section>`;
        }
        const cards = available.map(visitor => {
            const checked = daifugoSetupMasterIds.includes(visitor.id);
            const avatar = typeof window.renderCasinoMasterAvatar === 'function'
                ? window.renderCasinoMasterAvatar(visitor.masterType, 'df-master-avatar')
                : '';
            const status = locked
                ? '会話相手として参加固定'
                : visitor.isResidentDealer
                    ? 'カジノ常駐・任意参加'
                    : '本日来店中・会話済み';
            return `<label class="df-master-choice${locked ? ' is-locked' : ''}"><input type="checkbox" data-df-master-id="${visitor.id}" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''} onchange="window.toggleDaifugoMasterParticipant(this)"><span class="df-master-check">✓</span>${avatar}<span class="df-master-copy"><strong>${visitor.name}</strong><small>${status}</small></span></label>`;
        }).join('');
        return `<section class="df-master-setup"><div class="df-master-heading"><div><small>MASTER GUESTS</small><h3>参加する師匠</h3></div><span>${locked ? '会話相手に固定' : '対戦人数 − あなた1名まで'}　<b id="df-master-selected-count">${daifugoSetupMasterIds.length}</b>名</span></div><div class="df-master-grid">${cards}</div><p>${locked ? '本人との会話から始めたため、ほかの師匠には変更できません。残席は一般CPUが入ります。' : 'ディーラーを含めて任意に選択できます。空席には一般CPUが入り、対戦人数は自動変更されません。'}</p><div id="casino-daifugo-participant-notice" class="df-notice" aria-live="polite"></div></section>`;
    }

    function ruleEnabled(id) {
        return !!(df && df.rules && df.rules[id]);
    }

    function makeDeck() {
        const deck = [];
        SUITS.forEach(suit => {
            for (let rank = 3; rank <= 15; rank++) deck.push({ suit, rank, id: `${suit}_${rank}_${Math.random()}` });
        });
        if (ruleEnabled('joker')) deck.push({ suit: 'joker', rank: 16, joker: true, id: `joker_${Math.random()}` });
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function strength(rank) {
        if (rank === 16) return 99;
        const reversed = !!df.revolution !== !!df.elevenBack;
        return reversed ? 18 - rank : rank;
    }

    function suitSignature(cards) {
        return cards.map(card => card.suit).sort().join(',');
    }

    function containsJoker(cards) {
        return cards.some(card => card && card.joker);
    }

    function suitCounts(cards) {
        const counts = {};
        let jokers = 0;
        cards.forEach(card => {
            if (card && card.joker) {
                jokers++;
                return;
            }
            const suit = card && card.suit;
            if (suit) counts[suit] = (counts[suit] || 0) + 1;
        });
        return { counts, jokers };
    }

    function suitLockAllows(cards, signature) {
        const required = String(signature || '').split(',').filter(Boolean);
        if (cards.length !== required.length) return false;
        const remaining = {};
        required.forEach(suit => { remaining[suit] = (remaining[suit] || 0) + 1; });
        let jokers = 0;
        for (const card of cards) {
            if (card && card.joker) {
                jokers++;
                continue;
            }
            const suit = card && card.suit;
            if (!suit || !remaining[suit]) return false;
            remaining[suit]--;
        }
        return Object.values(remaining).reduce((sum, count) => sum + count, 0) === jokers;
    }

    function suitPatternsCompatible(leftCards, rightCards) {
        if (leftCards.length !== rightCards.length) return false;
        const left = suitCounts(leftCards);
        const right = suitCounts(rightCards);
        const suits = new Set([...Object.keys(left.counts), ...Object.keys(right.counts)]);
        let unmatchedLeft = 0;
        let unmatchedRight = 0;
        suits.forEach(suit => {
            unmatchedLeft += Math.max(0, (left.counts[suit] || 0) - (right.counts[suit] || 0));
            unmatchedRight += Math.max(0, (right.counts[suit] || 0) - (left.counts[suit] || 0));
        });
        return unmatchedLeft <= right.jokers && unmatchedRight <= left.jokers;
    }

    function compatibleSuitSignature(leftCards, rightCards) {
        if (!suitPatternsCompatible(leftCards, rightCards)) return null;
        const leftJokers = suitCounts(leftCards).jokers;
        const rightJokers = suitCounts(rightCards).jokers;
        if (leftJokers < rightJokers) return suitSignature(leftCards);
        if (rightJokers < leftJokers) return suitSignature(rightCards);
        return suitSignature(leftCards);
    }

    function sequenceRankOptions(cards) {
        if (cards.length < 3) return [];
        const nonJokers = cards.filter(card => !card.joker);
        const jokerCount = cards.length - nonJokers.length;
        if (!nonJokers.length) return [];
        if (!nonJokers.every(card => card.suit === nonJokers[0].suit)) return [];
        if (new Set(nonJokers.map(card => card.rank)).size !== nonJokers.length) return [];
        const options = [];
        const lastStart = 15 - cards.length + 1;
        for (let start = 3; start <= lastStart; start++) {
            const end = start + cards.length - 1;
            if (!nonJokers.every(card => card.rank >= start && card.rank <= end)) continue;
            const occupied = new Set(nonJokers.map(card => card.rank));
            let missing = 0;
            for (let rank = start; rank <= end; rank++) if (!occupied.has(rank)) missing++;
            if (missing === jokerCount) options.push(end);
        }
        return options;
    }

    function classify(cards) {
        if (!cards.length) return null;
        if (cards.length === 1) return { type: 'group', count: 1, rank: cards[0].rank, cards };
        const nonJokers = cards.filter(card => !card.joker);
        const sameRank = nonJokers.length === 0 || nonJokers.every(card => card.rank === nonJokers[0].rank);
        if (sameRank) return { type: 'group', count: cards.length, rank: nonJokers.length ? nonJokers[0].rank : 16, cards };

        if (ruleEnabled('stairs') && cards.length >= 3) {
            const rankOptions = sequenceRankOptions(cards);
            if (rankOptions.length) {
                const sorted = cards.slice().sort((a, b) => a.rank - b.rank);
                return { type: 'sequence', count: cards.length, rank: rankOptions[0], rankOptions, cards: sorted };
            }
        }

        if (ruleEnabled('emperor') && cards.length === 4 && new Set(cards.map(card => card.suit)).size === 4) {
            const sortedRanks = cards.map(card => card.rank).sort((a, b) => a - b);
            if (sortedRanks.every((rank, index) => index === 0 || rank === sortedRanks[index - 1] + 1)) {
                return { type: 'sequence', count: 4, rank: sortedRanks[3], cards, emperor: true };
            }
        }
        return null;
    }

    function canBeat(play) {
        if (!play) return false;
        const rankOptions = Array.isArray(play.rankOptions) && play.rankOptions.length ? play.rankOptions : [play.rank];
        const chooseRank = candidates => {
            if (!candidates.length) return false;
            candidates.sort((a, b) => strength(a) - strength(b));
            play.rank = candidates[0];
            return true;
        };
        if (!df.lastPlay) return chooseRank(rankOptions.slice());
        const last = df.lastPlay;
        if (ruleEnabled('spade3') && last.count === 1 && last.cards[0].joker && play.count === 1 && play.cards[0].suit === 'spade' && play.cards[0].rank === 3) return true;
        if (ruleEnabled('sandstorm') && play.type === 'group' && play.count === 3 && play.rank === 3 && last.type === 'group' && last.count === 3) return true;
        if (play.type !== last.type || play.count !== last.count) return false;
        if (df.suitLock && !suitLockAllows(play.cards, df.suitLock)) return false;
        const jokerPlay = containsJoker(play.cards);
        const legalRanks = rankOptions.filter(rank => {
            if (df.numericLock != null && !jokerPlay && Math.abs(rank - last.rank) !== 1) return false;
            return strength(rank) > strength(last.rank);
        });
        return chooseRank(legalRanks);
    }

    function nextActive(from, steps) {
        steps = Math.max(1, Number(steps) || 1);
        let current = from;
        let moved = 0;
        let guard = 0;
        while (moved < steps && guard++ < 30) {
            current = (current + df.direction + df.playerCount) % df.playerCount;
            if (!df.finished.includes(current) && !df.disqualified.includes(current)) moved++;
        }
        return current;
    }

    function activeCount() {
        return df.playerCount - df.finished.length - df.disqualified.length;
    }

    function addDfLog(text) {
        df.logs.push(String(text));
        if (df.logs.length > 80) df.logs.shift();
    }

    function lowCardIndex(hand) {
        if (!hand.length) return -1;
        let best = 0;
        for (let i = 1; i < hand.length; i++) if (strength(hand[i].rank) < strength(hand[best].rank)) best = i;
        return best;
    }

    function discardLowest(player) {
        const index = lowCardIndex(df.hands[player]);
        if (index >= 0) {
            const [card] = df.hands[player].splice(index, 1);
            addDfLog(`${PLAYER_NAMES[player]}は${cardLabel(card)}を捨てた。`);
        }
    }

    function giveLowest(player) {
        const index = lowCardIndex(df.hands[player]);
        if (index < 0) return;
        const target = nextActive(player, 1);
        const [card] = df.hands[player].splice(index, 1);
        df.hands[target].push(card);
        sortHand(df.hands[target]);
        addDfLog(`${PLAYER_NAMES[player]}は${PLAYER_NAMES[target]}へ1枚渡した。`);
    }

    function applyQueenBomber(rank) {
        // ボンバーだけで他プレイヤーが上がって順位が壊れないよう、最後の1枚は残す。
        df.hands.forEach((hand, index) => {
            const filtered = hand.filter(card => card.rank !== rank);
            df.hands[index] = filtered.length || !hand.length ? filtered : [hand[0]];
        });
        addDfLog(`クイーンボンバー！ ${RANK_LABEL[rank] || rank}が全員の手札から消えた。`);
    }

    function sortHand(hand) {
        hand.sort((a, b) => a.rank - b.rank || SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit));
    }

    function ranksFromOrder(order) {
        const ranks = Array.from({ length: df.playerCount }, () => '平民');
        if (!Array.isArray(order) || order.length !== df.playerCount) return ranks;
        if (df.rankSettings.daifugo) {
            ranks[order[0]] = '大富豪';
            ranks[order[order.length - 1]] = '大貧民';
        }
        if (df.rankSettings.fugo && order.length >= 4) {
            ranks[order[1]] = '富豪';
            ranks[order[order.length - 2]] = '貧民';
        }
        return ranks;
    }

    function rankExchangePairs() {
        const pairs = [];
        const pairFor = (upperRank, lowerRank, count) => {
            const upper = df.ranks.indexOf(upperRank);
            const lower = df.ranks.indexOf(lowerRank);
            if (upper >= 0 && lower >= 0) pairs.push({ upper, lower, count, upperRank, lowerRank });
        };
        if (df.rankSettings.daifugo) pairFor('大富豪', '大貧民', 2);
        if (df.rankSettings.fugo) pairFor('富豪', '貧民', 1);
        return pairs;
    }

    function cpuExchangeCardIds(player, count, strongest) {
        return df.hands[player].map(card => ({ card, score: strength(card.rank) }))
            .sort((a, b) => strongest ? b.score - a.score : a.score - b.score)
            .slice(0, count)
            .map(entry => entry.card.id);
    }

    function takeCardsById(player, ids) {
        const wanted = new Set(ids);
        const taken = [];
        df.hands[player] = df.hands[player].filter(card => {
            if (!wanted.has(card.id)) return true;
            taken.push(card);
            return false;
        });
        return taken;
    }

    function performRankExchange(pair, humanCardIds) {
        const upperIds = pair.upper === 0 ? humanCardIds : cpuExchangeCardIds(pair.upper, pair.count, false);
        const lowerIds = pair.lower === 0 ? humanCardIds : cpuExchangeCardIds(pair.lower, pair.count, true);
        const upperCards = takeCardsById(pair.upper, upperIds);
        const lowerCards = takeCardsById(pair.lower, lowerIds);
        df.hands[pair.upper].push(...lowerCards);
        df.hands[pair.lower].push(...upperCards);
        sortHand(df.hands[pair.upper]);
        sortHand(df.hands[pair.lower]);
        addDfLog(`${PLAYER_NAMES[pair.upper]}（${pair.upperRank}）と${PLAYER_NAMES[pair.lower]}（${pair.lowerRank}）が${pair.count}枚交換した。`);
    }

    function beginDaifugoTurns() {
        df.exchangeMode = null;
        df.exchangeQueue = [];
        df.selected.clear();
        let starter = 0;
        if (df.matchIndex === 0 && ruleEnabled('diamond3Start')) {
            const found = df.hands.findIndex(hand => hand.some(card => card.suit === 'dia' && card.rank === 3));
            if (found >= 0) starter = found;
        } else {
            const lowestRank = df.rankSettings.daifugo ? '大貧民' : df.rankSettings.fugo ? '貧民' : '';
            const found = lowestRank ? df.ranks.indexOf(lowestRank) : -1;
            if (found >= 0) starter = found;
        }
        df.current = starter;
        addDfLog(`第${df.matchIndex + 1}戦開始。${PLAYER_NAMES[starter]}から。`);
        const firstMaster = Array.isArray(df.participants)
            ? df.participants.findIndex((participant, index) => index > 0 && participant && participant.masterType)
            : -1;
        if (firstMaster > 0) setDaifugoSpeech(firstMaster, 'start');
        renderDaifugo();
        scheduleCpu();
    }

    function advanceRankExchange() {
        df.exchangeMode = null;
        df.selected.clear();
        while (df.exchangeQueue.length) {
            const pair = df.exchangeQueue.shift();
            if (pair.upper === 0 || pair.lower === 0) {
                df.exchangeMode = { pair, count: pair.count, role: pair.upper === 0 ? pair.upperRank : pair.lowerRank };
                df.current = null;
                addDfLog(`${df.exchangeMode.role}の交換札を${pair.count}枚選んでください。`);
                renderDaifugo();
                return;
            }
            performRankExchange(pair, []);
        }
        beginDaifugoTurns();
    }

    function prepareRankExchange() {
        if (df.matchIndex === 0) return false;
        df.exchangeQueue = rankExchangePairs();
        if (!df.exchangeQueue.length) return false;
        advanceRankExchange();
        return true;
    }

    function forbiddenFinish(play) {
        if (!ruleEnabled('forbiddenFinish') || !play) return false;
        return play.cards.some(card => card.joker || card.rank === 8 || (!df.revolution && card.rank === 15) || (df.revolution && card.rank === 3));
    }

    function applyEffects(player, play) {
        let skip = 1;
        const choices = [];
        const ranks = play.cards.map(card => card.rank);
        if (ruleEnabled('revolution') && play.type === 'group' && play.count >= 4) {
            df.revolution = !df.revolution;
            addDfLog('革命！ カードの強さが反転した。');
        }
        if (ruleEnabled('stairRevolution') && play.type === 'sequence' && play.count >= 5) {
            df.revolution = !df.revolution;
            addDfLog('階段革命！ カードの強さが反転した。');
        }
        if (ruleEnabled('kingRevolution') && play.rank === 13 && play.count >= 3) {
            df.revolution = !df.revolution;
            addDfLog('K革命！');
        }
        if (ruleEnabled('sixReverse') && ranks.includes(6)) { df.direction *= -1; addDfLog('6リバース！ 手番が反転した。'); }
        if (ruleEnabled('nineReverse') && ranks.includes(9)) { df.direction *= -1; addDfLog('9リバース！ 手番が反転した。'); }
        if (ruleEnabled('elevenBack') && ranks.includes(11)) { df.elevenBack = true; addDfLog('イレブンバック！ 場が流れるまで強弱反転。'); }
        if (ruleEnabled('fiveSkip') && ranks.includes(5)) {
            const skipCount = play.cards.filter(card => card.rank === 5).length;
            skip += skipCount;
            addDfLog(`5スキップ！ ${skipCount}人の手番を飛ばす。`);
        }
        if (ruleEnabled('aceSkip') && ranks.includes(14)) {
            const skipCount = play.cards.filter(card => card.rank === 14).length;
            skip += skipCount;
            addDfLog(`Aスキップ！ ${skipCount}人の手番を飛ばす。`);
        }
        if (ruleEnabled('sevenPass') && ranks.includes(7)) {
            if (player === 0 && df.hands[player].length) choices.push({ type: 'give', rule: '7渡し', target: nextActive(player, 1) });
            else giveLowest(player);
        }
        if (ruleEnabled('nineRescue') && ranks.includes(9)) {
            if (player === 0 && df.hands[player].length) choices.push({ type: 'discard', rule: '9救急' });
            else discardLowest(player);
        }
        if (ruleEnabled('tenDiscard') && ranks.includes(10)) {
            if (player === 0 && df.hands[player].length) choices.push({ type: 'discard', rule: '10捨て' });
            else discardLowest(player);
        }
        if (ruleEnabled('queenBomber') && ranks.includes(12)) {
            const available = [];
            for (let rank = 3; rank <= 15; rank++) if (df.hands.some(hand => hand.some(card => card.rank === rank))) available.push(rank);
            if (available.length) {
                if (player === 0) choices.push({ type: 'bomb', rule: 'クイーンボンバー', ranks: available });
                else applyQueenBomber(available[Math.floor(Math.random() * available.length)]);
            }
        }
        return { skip, choices };
    }

    function clearTrick(leader) {
        df.lastPlay = null;
        df.passes = 0;
        df.suitLock = null;
        df.numericLock = null;
        df.previousSuit = null;
        df.previousRank = null;
        df.elevenBack = false;
        df.current = df.finished.includes(leader) || df.disqualified.includes(leader) ? nextActive(leader, 1) : leader;
        addDfLog('場が流れた。');
    }

    function finishPlayer(player, play) {
        if (df.hands[player].length > 0) return false;
        if (df.finished.includes(player) || df.disqualified.includes(player)) return true;
        if (forbiddenFinish(play)) {
            if (!df.disqualified.includes(player)) df.disqualified.push(player);
            addDfLog(`${PLAYER_NAMES[player]}は反則上がり。最下位扱い！`);
        } else {
            if (ruleEnabled('gekokujo') && play && play.cards.some(card => card.suit === 'spade' && card.rank === 3)) {
                df.finished.unshift(player);
                addDfLog('下克上！ スペード3上がりで大富豪の座を奪った！');
            } else {
                df.finished.push(player);
            }
            addDfLog(`${PLAYER_NAMES[player]}が${df.finished.length}位で上がった！`);
        }
        return true;
    }

    function finalizePlayedTurn(completion) {
        const { player, play, skip, spade3Return } = completion;
        const finishedNow = completion.finishedNow || finishPlayer(player, play);
        if (checkRoundEnd()) return;
        if (spade3Return) {
            addDfLog('スペード3返し！');
            clearTrick(player);
        } else if (ruleEnabled('eightCut') && play.cards.some(card => card.rank === 8)) {
            addDfLog('8切り！');
            clearTrick(player);
        } else {
            const nextPlayer = finishedNow ? nextActive(player, 1) : nextActive(player, skip);
            // スキップで一周して最後に出した本人へ戻った場合、その札を自分で更新させず場を流す。
            if (!finishedNow && nextPlayer === player) clearTrick(player);
            else df.current = nextPlayer;
        }
        renderDaifugo();
        scheduleCpu();
    }

    function playCards(player, indices) {
        const hand = df.hands[player];
        const cards = indices.map(index => hand[index]).filter(Boolean);
        const play = classify(cards);
        if (!canBeat(play)) return false;
        const oldLast = df.lastPlay;
        const spade3Return = !!(ruleEnabled('spade3') && oldLast && oldLast.count === 1 && oldLast.cards[0].joker && play.count === 1 && play.cards[0].suit === 'spade' && play.cards[0].rank === 3);
        indices.slice().sort((a, b) => b - a).forEach(index => hand.splice(index, 1));
        df.lastPlay = play;
        df.lastPlayer = player;
        df.playSerial = (Number(df.playSerial) || 0) + 1;
        df.passes = 0;
        const nextSuitLock = ruleEnabled('suitLock') && oldLast ? compatibleSuitSignature(oldLast.cards, play.cards) : null;
        if (nextSuitLock) {
            if (!df.suitLock) addDfLog('しばり成立！ 同じスート構成だけ出せる。');
            if (!df.suitLock) df.suitLock = nextSuitLock;
        }
        if (ruleEnabled('numericLock') && oldLast && Math.abs(play.rank - oldLast.rank) === 1) {
            if (df.numericLock == null) addDfLog('数しばり成立！ 隣接する数字だけ出せる。');
            df.numericLock = play.rank;
        }
        addDfLog(`${PLAYER_NAMES[player]}: ${cards.map(cardLabel).join(' ')}${play.type === 'sequence' ? '（階段）' : ''}`);
        setDaifugoSpeech(player, 'play');
        const effects = applyEffects(player, play);
        const finishedNow = finishPlayer(player, play);
        const completion = { player, play, skip: effects.skip, spade3Return, finishedNow };
        const actionableChoices = effects.choices.filter(choice => choice.type === 'bomb' || df.hands[player].length);
        if (actionableChoices.length) {
            df.pendingAction = { player, queue: actionableChoices, completion };
            df.current = null;
            df.selected.clear();
            renderDaifugo();
            return true;
        }
        finalizePlayedTurn(completion);
        return true;
    }

    function passTurn(player) {
        if (!df.lastPlay) return false;
        df.passes++;
        addDfLog(`${PLAYER_NAMES[player]}はパス。`);
        setDaifugoSpeech(player, 'pass');
        const nextPlayer = nextActive(player, 1);
        const returnedToLastPlayer = df.lastPlayer != null && nextPlayer === df.lastPlayer;
        const lastPlayerIsActive = df.lastPlayer != null
            && !df.finished.includes(df.lastPlayer)
            && !df.disqualified.includes(df.lastPlayer);
        const requiredPasses = activeCount() - (lastPlayerIsActive ? 1 : 0);
        // A/5スキップなどで飛ばされた人はパス数に含まれない。
        // そのため回数だけでなく、手番が最後に出した人へ一周した時点でも場を流す。
        // 最後に出した人が上がり済みなら、残っている全員がパスするまで待つ。
        if (df.passes >= Math.max(1, requiredPasses) || returnedToLastPlayer) {
            clearTrick(df.lastPlayer == null ? player : df.lastPlayer);
        } else {
            df.current = nextPlayer;
        }
        renderDaifugo();
        scheduleCpu();
        return true;
    }

    function candidatePlays(hand) {
        const result = [];
        const seen = new Set();
        const addCandidate = indices => {
            const sorted = indices.slice().sort((a, b) => a - b);
            const key = sorted.join(',');
            if (seen.has(key)) return;
            seen.add(key);
            result.push({ indices: sorted, play: classify(sorted.map(index => hand[index])) });
        };
        hand.forEach((card, index) => addCandidate([index]));
        const byRank = {};
        const jokerIndex = hand.findIndex(card => card.joker);
        hand.forEach((card, index) => {
            if (card.joker) return;
            if (!byRank[card.rank]) byRank[card.rank] = [];
            byRank[card.rank].push(index);
        });
        Object.values(byRank).forEach(indices => {
            for (let count = 2; count <= indices.length; count++) {
                addCandidate(indices.slice(0, count));
            }
            if (jokerIndex >= 0) {
                for (let normalCount = 1; normalCount <= indices.length; normalCount++) {
                    addCandidate([...indices.slice(0, normalCount), jokerIndex]);
                }
            }
        });
        if (ruleEnabled('stairs')) {
            SUITS.forEach(suit => {
                const bySuitRank = new Map();
                hand.forEach((card, index) => {
                    if (!card.joker && card.suit === suit) bySuitRank.set(card.rank, index);
                });
                for (let count = 3; count <= 13; count++) {
                    for (let start = 3; start + count - 1 <= 15; start++) {
                        const indices = [];
                        let missing = 0;
                        for (let rank = start; rank < start + count; rank++) {
                            if (bySuitRank.has(rank)) indices.push(bySuitRank.get(rank));
                            else missing++;
                        }
                        if (missing === 0 || (missing === 1 && jokerIndex >= 0)) {
                            if (missing === 1) indices.push(jokerIndex);
                            addCandidate(indices);
                        }
                    }
                }
            });
        }
        return result.filter(candidate => candidate.play && canBeat(candidate.play)).sort((a, b) => strength(a.play.rank) - strength(b.play.rank) || a.play.count - b.play.count);
    }

    function cpuMove() {
        if (!df || df.roundOver || df.current == null || df.current === 0 || df.exchangeMode || df.pendingAction) return;
        const player = df.current;
        const candidates = candidatePlays(df.hands[player]);
        if (candidates.length) {
            const candidate = candidates[0];
            playCards(player, candidate.indices);
        } else {
            passTurn(player);
        }
    }

    function scheduleCpu() {
        if (cpuTimer) clearTimeout(cpuTimer);
        if (!df || df.roundOver || df.current == null || df.current === 0 || df.exchangeMode || df.pendingAction) return;
        cpuTimer = setTimeout(cpuMove, 520);
    }

    function cardLabel(card) {
        if (card.joker) return 'JOKER';
        return `${RANK_LABEL[card.rank] || card.rank}${SUIT_MARK[card.suit]}`;
    }

    function playerCardHtml(card, index) {
        const selected = df.selected.has(index);
        const art = typeof window.renderCasinoTrumpCard === 'function'
            ? window.renderCasinoTrumpCard(card, { width: 62, height: 88 })
            : cardLabel(card);
        return `<button type="button" class="df-player-card${selected ? ' is-selected' : ''}" data-df-card-index="${index}" onclick="window.toggleDaifugoCard(${index})" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${cardLabel(card)}" style="--df-card-index:${index};margin-left:${index ? '-13px' : '0'};z-index:${index};">${art}</button>`;
    }

    function updateDaifugoSelectionUi() {
        if (!df) return;
        document.querySelectorAll('#casino-daifugo-content [data-df-card-index]').forEach(button => {
            const selected = df.selected.has(Number(button.dataset.dfCardIndex));
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        const count = document.getElementById('df-selected-count');
        if (count) count.textContent = String(df.selected.size);
        const error = document.getElementById('df-action-error');
        if (error) {
            error.textContent = df.notice || '';
            error.hidden = !df.notice;
        }
    }

    function checkRoundEnd() {
        const remaining = Array.from({ length: df.playerCount }, (_, player) => player).filter(player => !df.finished.includes(player) && !df.disqualified.includes(player));
        if (remaining.length > 1) return false;
        if (remaining.length === 1) df.finished.push(remaining[0]);
        df.disqualified.forEach(player => { if (!df.finished.includes(player)) df.finished.push(player); });
        if (ruleEnabled('capitalFall') && df.previousWinner != null && df.finished[0] !== df.previousWinner) {
            const oldWinnerIndex = df.finished.indexOf(df.previousWinner);
            if (oldWinnerIndex >= 0) {
                df.finished.splice(oldWinnerIndex, 1);
                df.finished.push(df.previousWinner);
                addDfLog(`${PLAYER_NAMES[df.previousWinner]}は都落ちで最下位扱い。`);
            }
        }
        df.previousWinner = df.finished[0];
        df.ranks = ranksFromOrder(df.finished);
        const firstMaster = Array.isArray(df.participants)
            ? df.participants.findIndex((participant, index) => index > 0 && participant && participant.masterType)
            : -1;
        if (firstMaster > 0) setDaifugoSpeech(firstMaster, df.finished[0] === firstMaster ? 'win' : 'loss');
        const rankSummary = df.ranks.map((rank, player) => rank === '平民' ? '' : `${PLAYER_NAMES[player]}=${rank}`).filter(Boolean).join(' ／ ');
        if (rankSummary) addDfLog(`次戦の階級：${rankSummary}`);
        df.roundOver = true;
        const playerPlace = df.finished.indexOf(0) + 1;
        const playerFinishedInWinningHalf = playerPlace <= Math.ceil(df.playerCount / 2);
        window.playCasinoGameBGM(playerFinishedInWinningHalf ? 'daifugo_win' : 'daifugo_lose');
        const payoutTable = { 1: 40, 2: 15, 3: 5 };
        const payout = payoutTable[playerPlace] || 0;
        window.aiPet.casinoCoins += payout;
        df.seriesPlaces.push(playerPlace);
        if (typeof window.recordDealerCasinoGameResult === 'function') {
            const opponents = df.participants.slice(1).map((participant, index) => {
                const player = index + 1;
                const opponentPlace = df.finished.indexOf(player) + 1;
                return {
                    id: participant && participant.id || `daifugo_cpu_${index}`,
                    name: participant && participant.name || PLAYER_NAMES[player],
                    type: participant && participant.kind || 'cpu',
                    masterType: participant && participant.masterType || '',
                    result: playerPlace < opponentPlace ? 'win' : playerPlace > opponentPlace ? 'loss' : 'draw'
                };
            });
            window.recordDealerCasinoGameResult('daifugo', playerPlace === 1 ? 'win' : 'loss', {
                place: playerPlace,
                netCoins: payout - 10,
                matches: 1,
                opponents
            });
        }
        addDfLog(`第${df.matchIndex + 1}戦終了。あなたは${playerPlace}位、配当${payout}コイン。`);
        renderDaifugo();
        return true;
    }

    function startRound() {
        window.playCasinoGameBGM('daifugo_main');
        df.roundOver = false;
        df.finished = [];
        df.disqualified = [];
        df.lastPlay = null;
        df.lastPlayer = null;
        df.passes = 0;
        df.revolution = false;
        df.elevenBack = false;
        df.direction = 1;
        df.suitLock = null;
        df.numericLock = null;
        df.selected = new Set();
        df.pendingAction = null;
        df.exchangeMode = null;
        df.exchangeQueue = [];
        df.notice = '';
        df.playSerial = 0;
        df.lastAnimatedPlaySerial = 0;
        const deck = makeDeck();
        df.hands = Array.from({ length: df.playerCount }, () => []);
        deck.forEach((card, index) => df.hands[index % df.playerCount].push(card));
        df.hands.forEach(sortHand);
        if (!prepareRankExchange()) beginDaifugoTurns();
    }

    function ruleSetupHtml() {
        const saved = JSON.parse(localStorage.getItem('casino_daifugo_rules_v1') || '{}');
        const savedRanks = JSON.parse(localStorage.getItem('casino_daifugo_rank_settings_v1') || '{}');
        const checks = Object.entries(window.CASINO_DAIFUGO_RULES).map(([id, rule]) => {
            const checked = saved[id] !== undefined ? !!saved[id] : !!rule.default;
            return `<label class="df-rule-card"><input type="checkbox" data-df-rule="${id}" ${checked ? 'checked' : ''}><span class="df-rule-toggle"></span><span class="df-rule-copy"><b>${rule.name}</b><small>${rule.desc}</small></span></label>`;
        }).join('');
        const rankOptions = [
            { id: 'daifugo', name: '大富豪 ON', desc: '2戦目以降、大富豪・大貧民を設定して2枚交換する。' },
            { id: 'fugo', name: '富豪 ON', desc: '2戦目以降、富豪・貧民を設定して1枚交換する。' }
        ].map(option => {
            const checked = savedRanks[option.id] !== undefined ? !!savedRanks[option.id] : true;
            return `<label class="df-rule-card"><input type="checkbox" data-df-rank-setting="${option.id}" ${checked ? 'checked' : ''}><span class="df-rule-toggle"></span><span class="df-rule-copy"><b>${option.name}</b><small>${option.desc}</small></span></label>`;
        }).join('');
        const coins = Number(window.aiPet && window.aiPet.casinoCoins || 0).toLocaleString();
        return `<div class="df-setup"><div class="df-setup-summary"><div><small>ENTRY</small><strong>1戦 10コイン</strong><span>配当：1位 40 ／ 2位 15 ／ 3位 5 ／ 4位以下 0</span></div><div class="df-wallet"><small>所持コイン</small><strong>🪙 ${coins}</strong></div></div>${daifugoParticipantSetupHtml()}<div class="df-match-setting"><label><span>プレイ人数</span><select id="daifugo-player-count" onchange="window.validateDaifugoParticipantCount()"><option value="4">4人</option><option value="5">5人</option><option value="6">6人</option></select></label><label><span>対戦数を選択</span><select id="daifugo-match-count"><option value="1">1戦</option><option value="3">3戦</option><option value="5">5戦</option><option value="10">10戦</option></select></label><p>初戦は全員平民。選択した対戦数 × 10コインを開始時に支払います。</p></div><div class="df-rule-heading"><div><small>CLASS SETTINGS</small><h3>階級・交換設定</h3></div><span>初戦終了後から適用</span></div><div class="df-rank-settings">${rankOptions}</div><div class="df-rule-heading"><div><small>LOCAL RULES</small><h3>ローカルルール設定</h3></div><span>クリックで ON / OFF</span></div><div class="df-rules-grid">${checks}</div><div id="casino-daifugo-notice" class="df-notice" aria-live="polite"></div><button type="button" class="df-btn df-btn-primary df-start-btn" onclick="window.startCasinoDaifugoSeries()"><span>対戦を開始する</span><small>START MATCH</small></button></div>`;
    }

    function daifugoStyleHtml() {
        return `<style>
            #casino-daifugo-ui::backdrop{background:rgba(0,0,0,.84);backdrop-filter:blur(3px)}
            .df-shell{width:min(1080px,97vw);max-height:96vh;overflow:auto;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(31,7,17,.98),rgba(7,4,6,.99));padding:20px 24px 24px;box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 24px 80px #000,0 0 42px rgba(200,153,57,.2)}
            .df-header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-bottom:17px;border-bottom:1px solid rgba(255,213,106,.28)}
            .df-title{display:flex;align-items:center;gap:12px;margin:0;color:#ffd56a;font-size:clamp(22px,3vw,29px);letter-spacing:.04em;text-shadow:0 2px 14px rgba(255,190,55,.28)}.df-title-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#ffd86e,#9c6516);color:#21070f;box-shadow:0 0 20px rgba(255,202,40,.32)}
            .df-btn{appearance:none;border:1px solid rgba(255,218,128,.65);border-radius:10px;padding:11px 20px;color:#fff;background:linear-gradient(180deg,#633047,#351421);font-weight:800;font-size:14px;letter-spacing:.03em;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.12);transition:transform .16s,filter .16s,box-shadow .16s}.df-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.13);box-shadow:0 8px 22px rgba(0,0,0,.42),0 0 14px rgba(255,196,72,.18)}.df-btn:disabled{opacity:.35;cursor:not-allowed}.df-btn-primary{border-color:#ffe08a;background:linear-gradient(180deg,#d79b2d,#8e5412);color:#1b0803;text-shadow:0 1px rgba(255,255,255,.35)}.df-btn-pass{background:linear-gradient(180deg,#495963,#27323a);border-color:#71838d}.df-close{display:flex;align-items:center;gap:8px;padding:10px 16px;background:linear-gradient(180deg,#5a2638,#2b101a);color:#f9d9e3;border-color:#9b536a}.df-close b{font-size:20px;line-height:1}
            #casino-daifugo-content{margin-top:18px}.df-setup{display:grid;gap:16px}.df-setup-summary{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:16px 18px;border:1px solid rgba(255,213,106,.3);border-radius:14px;background:linear-gradient(90deg,rgba(131,74,20,.22),rgba(82,24,49,.2))}.df-setup-summary div{display:grid;gap:4px}.df-setup-summary small,.df-rule-heading small{color:#d7a63a;font-size:9px;font-weight:900;letter-spacing:.2em}.df-setup-summary strong{color:#fff0c2;font-size:18px}.df-setup-summary span{color:#c5b6bb;font-size:12px}.df-wallet{text-align:right}.df-wallet strong{color:#ffd56a}
            .df-master-setup{display:grid;gap:10px;padding:14px;border:1px solid #5b4634;border-radius:13px;background:linear-gradient(135deg,rgba(81,53,19,.22),rgba(21,53,42,.34))}.df-master-heading{display:flex;align-items:end;justify-content:space-between;gap:12px}.df-master-heading small{color:#d7a63a;font-size:9px;font-weight:900;letter-spacing:.2em}.df-master-heading h3{margin:3px 0 0;color:#fff0c2;font-size:16px}.df-master-heading>span{color:#b9aaa8;font-size:11px}.df-master-heading b{color:#ffd56a}.df-master-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.df-master-choice{position:relative;display:grid;grid-template-columns:20px 46px minmax(0,1fr);align-items:center;gap:8px;min-height:64px;padding:8px 9px;border:1px solid #4c5f54;border-radius:10px;background:rgba(4,23,16,.62);cursor:pointer;transition:border-color .15s,background .15s}.df-master-choice:hover{border-color:#d3aa56;background:rgba(28,55,38,.8)}.df-master-choice input{position:absolute;opacity:0}.df-master-check{display:grid;place-items:center;width:18px;height:18px;border:1px solid #65776d;border-radius:4px;color:transparent;background:#14231c;font-size:11px;font-weight:900}.df-master-choice input:checked+.df-master-check{border-color:#e4b95f;background:#b47a1d;color:#1b0c04}.df-master-choice.is-locked{cursor:default}.df-master-avatar,.df-seat-avatar,.df-speech-avatar{display:block;overflow:hidden;border:2px solid #d0a34f;border-radius:50%;background:#160a0e;box-shadow:0 0 0 2px rgba(0,0,0,.55)}.df-master-avatar{width:42px;height:42px}.df-master-avatar img,.df-seat-avatar img,.df-speech-avatar img{width:100%;height:100%;object-fit:cover;object-position:center 12%}.df-master-copy{display:grid;gap:2px;min-width:0}.df-master-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f5e7cc;font-size:12px}.df-master-copy small{color:#90aa9c;font-size:9px}.df-master-setup>p{margin:0;color:#9faea6;font-size:10px;line-height:1.5}.df-master-empty{padding:12px;border:1px dashed #56665e;border-radius:9px;color:#a8b5ae;font-size:11px;text-align:center}
            .df-match-setting{display:flex;align-items:end;gap:14px;padding:14px;border:1px solid #56343e;border-radius:12px;background:rgba(255,255,255,.03)}.df-match-setting label{display:grid;gap:7px;min-width:190px}.df-match-setting label span{color:#c8b9be;font-size:12px;font-weight:bold}.df-match-setting select{min-height:40px;border:1px solid #8a5c68;border-radius:8px;background:#13070c;color:#fff;padding:8px 10px;font-weight:bold;outline:none}.df-match-setting select:focus{border-color:#ffd56a;box-shadow:0 0 0 2px rgba(255,213,106,.18)}.df-match-setting p{margin:0 0 9px;color:#9f9196;font-size:11px}
            .df-rule-heading{display:flex;justify-content:space-between;align-items:end;margin-top:2px}.df-rule-heading h3{margin:3px 0 0;color:#fff0c2}.df-rule-heading>span{color:#97878d;font-size:11px}.df-rank-settings,.df-rules-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 5px 2px 2px}.df-rules-grid{max-height:39vh;overflow:auto}.df-rule-card{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:10px;min-height:54px;padding:10px 12px;border:1px solid #54313c;border-radius:10px;background:rgba(62,24,39,.45);cursor:pointer;transition:border-color .15s,background .15s}.df-rule-card:hover{border-color:#9d6a2c;background:rgba(82,33,48,.58)}.df-rule-card input{position:absolute;opacity:0;pointer-events:none}.df-rule-toggle{position:relative;width:34px;height:19px;border-radius:999px;background:#3b3336;box-shadow:inset 0 0 0 1px #62565a}.df-rule-toggle:after{content:'';position:absolute;width:15px;height:15px;left:2px;top:2px;border-radius:50%;background:#8c8084;transition:transform .16s,background .16s}.df-rule-card input:checked+.df-rule-toggle{background:#8b5a13;box-shadow:inset 0 0 0 1px #d39b3d}.df-rule-card input:checked+.df-rule-toggle:after{transform:translateX(15px);background:#ffe08a}.df-rule-copy{display:grid;gap:3px;min-width:0}.df-rule-copy b{color:#eadde1;font-size:12px;line-height:1.35}.df-rule-copy small{color:#9f9196;font-size:10px;line-height:1.55;white-space:normal;overflow-wrap:break-word}.df-notice{min-height:18px;text-align:center;color:#ff9e9e;font-size:12px;font-weight:bold}.df-start-btn{display:grid;place-items:center;justify-self:center;min-width:260px;padding:13px 28px}.df-start-btn span{font-size:17px}.df-start-btn small{font-size:9px;letter-spacing:.2em;opacity:.7}
            .df-game-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}.df-game-head-left{display:flex;flex-wrap:wrap;align-items:center;gap:7px}.df-round-chip,.df-state-chip{padding:5px 10px;border:1px solid #a97322;border-radius:999px;background:rgba(166,111,32,.18);color:#ffd56a;font-size:11px;font-weight:bold}.df-state-chip{border-color:#577a69;background:rgba(41,101,71,.2);color:#9fe3bb}.df-state-chip.is-revolution{border-color:#d05151;background:rgba(165,31,31,.25);color:#ff9d9d}.df-state-chip.is-lock{border-color:#4e87a4;background:rgba(34,104,139,.22);color:#a9e2ff}.df-state-chip.is-reverse{border-color:#8c68ac;background:rgba(102,55,143,.25);color:#ddb9ff}.df-active-rules{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;padding:8px 10px;border:1px solid #49373d;border-radius:10px;background:rgba(255,255,255,.025)}.df-active-rules-head{display:flex;align-items:center;gap:6px;flex:0 0 auto;padding-top:3px;color:#dccbd0;font-size:10px}.df-active-rules-head span{display:grid;place-items:center;min-width:18px;height:18px;border-radius:50%;background:#a87322;color:#1d0a09;font-weight:900}.df-active-rules-list{display:flex;flex-wrap:wrap;gap:5px;max-height:50px;overflow:auto}.df-active-rule,.df-no-rules{padding:3px 8px;border:1px solid #75542a;border-radius:999px;background:rgba(168,105,25,.17);color:#ffe6a5;font-size:9px;font-weight:bold;white-space:nowrap}.df-no-rules{border-color:#52685d;background:rgba(35,75,55,.2);color:#afd2bc}.df-game-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:14px}.df-main-board{min-width:0}.df-players{display:grid;grid-template-columns:1fr 1fr;gap:7px}.df-player-seat{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border:1px solid #52685d;border-radius:10px;background:rgba(9,34,24,.78);transition:border-color .2s,box-shadow .2s}.df-player-seat.is-current{border-color:#ffca28;box-shadow:0 0 13px rgba(255,202,40,.2)}.df-player-seat.is-finished{border-color:#a78032;background:rgba(77,57,17,.36)}.df-player-name{display:flex;align-items:center;gap:7px;font-weight:800}.df-seat-avatar{width:28px;height:28px;flex:0 0 28px}.df-rank{padding:2px 6px;border:1px solid rgba(255,213,106,.32);border-radius:999px;color:#ffe3a0;font-size:9px;font-style:normal}.df-turn-dot{width:8px;height:8px;border-radius:50%;background:#52685d}.df-player-seat.is-current .df-turn-dot{background:#ffca28;box-shadow:0 0 8px #ffca28}.df-player-count{color:#c2d4ca;font-size:11px}.df-place{color:#ffd56a;font-weight:900}.df-master-speech{display:flex;align-items:center;gap:10px;margin:9px 0;padding:8px 11px;border:1px solid #d0a34f;border-radius:12px;background:linear-gradient(90deg,rgba(29,14,9,.92),rgba(9,25,19,.9));box-shadow:0 5px 14px rgba(0,0,0,.25)}.df-speech-avatar{width:40px;height:40px;flex:0 0 40px}.df-master-speech span:last-child{display:grid;gap:2px;text-align:left}.df-master-speech b{color:#f2c86d;font-size:10px}.df-master-speech em{color:#fff3d7;font-size:12px;font-style:normal;font-weight:bold;line-height:1.45}
            .df-table{position:relative;margin:13px 0;padding:25px 20px 14px;min-height:112px;display:grid;place-items:center;border:2px solid #b48532;border-radius:54px;background:radial-gradient(ellipse at center,#1d6441 0,#103d2c 58%,#09251c 100%);box-shadow:inset 0 0 32px rgba(0,0,0,.68),0 8px 24px rgba(0,0,0,.36)}.df-table:before{content:'TABLE';position:absolute;bottom:8px;color:rgba(255,224,153,.25);font-size:9px;font-weight:900;letter-spacing:.24em}.df-field-meta{position:absolute;top:9px;left:20px;display:flex;align-items:center;gap:7px;padding:4px 9px;border:1px solid rgba(255,220,129,.38);border-radius:999px;background:rgba(5,25,17,.68);color:#c7d9cf;font-size:9px;box-shadow:0 3px 10px rgba(0,0,0,.25)}.df-field-meta b{color:#ffe096;font-size:10px}.df-field-count{padding-left:7px;border-left:1px solid rgba(255,255,255,.18);color:#fff;font-weight:900}.df-field-kind{color:#9bc7ac}.df-field-cards{display:flex;align-items:center;justify-content:center;min-height:80px;padding-top:5px;color:#a6c9b4;font-weight:bold}.df-field-empty{color:#8eae9c;font-size:12px;letter-spacing:.08em}.df-field-card{position:relative;display:inline-block;transform:rotate(var(--df-angle,0deg));filter:drop-shadow(0 7px 5px rgba(0,0,0,.44))}.df-field-card+.df-field-card{margin-left:-24px}.df-field-card.is-new{animation:dfCardPlay .42s cubic-bezier(.2,.82,.2,1.12) both}@keyframes dfCardPlay{from{opacity:0;transform:translate(var(--df-from-x,0),var(--df-from-y,-70px)) rotate(14deg) scale(.7)}to{opacity:1;transform:rotate(var(--df-angle,0deg)) scale(1)}}
            .df-your-hand-label{display:flex;justify-content:space-between;align-items:center;margin:0 4px 4px;color:#eadde1;font-size:12px;font-weight:bold}.df-your-hand-label span{color:#ffd56a}.df-hand{min-height:108px;overflow-x:auto;padding:16px 10px 5px;box-sizing:border-box}.df-hand-track{display:flex;align-items:flex-end;justify-content:center;width:max-content;min-width:100%;box-sizing:border-box}.df-player-card{width:66px;height:92px;padding:0;overflow:hidden;border:2px solid #eee;border-radius:7px;background:#fff;box-sizing:border-box;box-shadow:0 5px 12px rgba(0,0,0,.48);cursor:pointer;position:relative;flex:0 0 66px;transition:transform .16s,border-color .16s,box-shadow .16s}.df-player-card:hover{transform:translateY(-8px);z-index:100!important}.df-player-card.is-selected{transform:translateY(-14px);border:4px solid #ffca28;box-shadow:0 9px 17px rgba(0,0,0,.55),0 0 17px #ffca28}.df-actions{min-height:66px;display:flex;justify-content:center;align-items:center;gap:10px}.df-selected-note{color:#d8c7cd;font-size:12px}.df-thinking{display:flex;align-items:center;gap:10px;color:#ffe09b;font-weight:bold}.df-thinking:before{content:'';width:16px;height:16px;border:3px solid rgba(255,213,106,.3);border-top-color:#ffd56a;border-radius:50%;animation:dfSpin .8s linear infinite}@keyframes dfSpin{to{transform:rotate(360deg)}}
            .df-log-panel{display:flex;flex-direction:column;min-height:0;border:1px solid #52685d;border-radius:12px;background:rgba(3,18,11,.9);overflow:hidden}.df-log-head{padding:11px 12px;border-bottom:1px solid #334b3e;color:#ffd56a;font-size:12px;font-weight:900;letter-spacing:.09em}.df-log-body{height:430px;overflow:auto;padding:10px 12px;font-size:11px;line-height:1.55;color:#b9cbc1}.df-log-line{padding:3px 0;border-bottom:1px solid rgba(255,255,255,.035)}
            .df-result-card{display:grid;gap:9px;place-items:center;padding:16px 24px;border:2px solid #d2a342;border-radius:14px;background:linear-gradient(145deg,rgba(115,68,16,.3),rgba(59,18,38,.48));animation:dfResultIn .4s cubic-bezier(.2,.8,.2,1.12) both}@keyframes dfResultIn{from{opacity:0;transform:scale(.86) translateY(12px)}to{opacity:1;transform:none}}.df-result-card h3{margin:0;color:#ffd56a;font-size:22px}.df-result-card p{margin:0;color:#ded1d5}.df-result-place{font-size:30px;color:#fff0bd;font-weight:950}.df-error{color:#ff9e9e;font-size:12px;font-weight:bold}.df-bomb-ranks{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}.df-bomb-ranks .df-btn{min-width:42px;padding:8px 11px}
            @media(max-width:820px){.df-shell{padding:15px 11px}.df-game-layout{grid-template-columns:1fr}.df-log-body{height:150px}.df-rules-grid,.df-rank-settings{grid-template-columns:1fr}.df-master-grid{grid-template-columns:1fr 1fr}.df-setup-summary,.df-match-setting{align-items:stretch;flex-direction:column}.df-players{grid-template-columns:1fr}.df-close span{display:none}.df-active-rules{display:grid;gap:6px}.df-active-rules-list{max-height:68px}}
            @media(max-width:520px){.df-master-grid{grid-template-columns:1fr}.df-master-heading{align-items:flex-start;flex-direction:column}}
            @media(prefers-reduced-motion:reduce){.df-field-card,.df-result-card,.df-thinking:before{animation-duration:.01ms!important}}
        </style>`;
    }

    window.openCasinoDaifugo = function () {
        resetDaifugoPlayerNames();
        window.restoreCasinoLobbyBGM();
        const context = daifugoLaunchContext();
        daifugoSetupMasterIds = context.source === 'conversation' && Array.isArray(context.lockedVisitors)
            ? context.lockedVisitors.filter(Boolean).map(visitor => visitor.id).slice(0, 1)
            : ['dealer'];
        window._casinoDaifugoOpponentName = null;
        if (cpuTimer) clearTimeout(cpuTimer);
        cpuTimer = null;
        df = null;
        const old = document.getElementById('casino-daifugo-ui');
        if (old) old.remove();
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-daifugo-ui';
        overlay.setAttribute('aria-label', '大富豪');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:radial-gradient(circle,#3b1022,#050305 72%);color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `${daifugoStyleHtml()}<div class="df-shell"><div class="df-header"><h2 class="df-title"><span class="df-title-mark">♣</span><span>大富豪</span></h2><button type="button" class="df-btn df-close" onclick="window.closeCasinoDaifugo()"><b>×</b><span>テーブルを離れる</span></button></div><div id="casino-daifugo-content">${ruleSetupHtml()}</div></div>`;
        overlay.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoDaifugo();
        });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try { overlay.showModal(); }
            catch (error) { console.warn('大富豪UIをtop layerへ移動できませんでした。', error); overlay.setAttribute('open', ''); }
        } else {
            overlay.setAttribute('open', '');
        }
    };

    window.closeCasinoDaifugo = function () {
        if (cpuTimer) clearTimeout(cpuTimer);
        cpuTimer = null;
        df = null;
        daifugoSetupMasterIds = [];
        resetDaifugoPlayerNames();
        const ui = document.getElementById('casino-daifugo-ui');
        if (ui) {
            if (typeof ui.close === 'function' && ui.open) ui.close();
            ui.remove();
            window.restoreCasinoLobbyBGM();
        }
        if (typeof window.clearCasinoCardGameContext === 'function') window.clearCasinoCardGameContext();
    };

    window.toggleDaifugoMasterParticipant = function (input) {
        if (!input || !input.dataset || !input.dataset.dfMasterId) return;
        const id = input.dataset.dfMasterId;
        if (input.checked && !daifugoSetupMasterIds.includes(id)) {
            if (daifugoSetupMasterIds.length >= 4) {
                input.checked = false;
                ['casino-daifugo-participant-notice', 'casino-daifugo-notice'].forEach(id => {
                    const notice = document.getElementById(id);
                    if (notice) notice.textContent = '参加候補はディーラーと来店中の師匠を合わせて最大4名です。';
                });
                return;
            }
            daifugoSetupMasterIds.push(id);
        } else if (!input.checked) {
            daifugoSetupMasterIds = daifugoSetupMasterIds.filter(value => value !== id);
        }
        const count = document.getElementById('df-master-selected-count');
        if (count) count.textContent = String(daifugoSetupMasterIds.length);
        window.validateDaifugoParticipantCount();
    };

    window.validateDaifugoParticipantCount = function () {
        const playerCountInput = document.getElementById('daifugo-player-count');
        const notices = ['casino-daifugo-participant-notice', 'casino-daifugo-notice']
            .map(id => document.getElementById(id))
            .filter(Boolean);
        if (!playerCountInput || !notices.length) return true;
        const playerCount = Math.max(4, Math.min(6, Number(playerCountInput.value) || 4));
        const selectedCount = selectedDaifugoMasters().length;
        if (selectedCount > playerCount - 1) {
            notices.forEach(notice => {
                notice.textContent = `選択した師匠${selectedCount}名は${playerCount}人対戦の対戦枠を超えています。対戦人数を増やすか、師匠の選択人数を減らしてください。`;
            });
            return false;
        }
        notices.forEach(notice => { notice.textContent = ''; });
        return true;
    };

    window.startCasinoDaifugoSeries = function () {
        const hero = window.aiPet;
        const matchCount = Math.max(1, Number(document.getElementById('daifugo-match-count').value) || 1);
        const selectedMasters = selectedDaifugoMasters();
        const playerCount = Math.max(4, Math.min(6, Number(document.getElementById('daifugo-player-count').value) || 4));
        if (!window.validateDaifugoParticipantCount()) return;
        const cost = matchCount * 10;
        if (!hero || hero.casinoCoins < cost) {
            const notice = document.getElementById('casino-daifugo-notice');
            if (notice) notice.textContent = `参加費${cost}コインが必要です。`;
            return;
        }
        const rules = {};
        document.querySelectorAll('[data-df-rule]').forEach(input => { rules[input.dataset.dfRule] = input.checked; });
        const rankSettings = { daifugo: false, fugo: false };
        document.querySelectorAll('[data-df-rank-setting]').forEach(input => { rankSettings[input.dataset.dfRankSetting] = input.checked; });
        localStorage.setItem('casino_daifugo_rules_v1', JSON.stringify(rules));
        localStorage.setItem('casino_daifugo_rank_settings_v1', JSON.stringify(rankSettings));
        hero.casinoCoins -= cost;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        const opponents = selectedMasters.slice(0, playerCount - 1).map(visitor => Object.assign({}, visitor));
        let cpuIndex = 0;
        while (opponents.length < playerCount - 1) {
            opponents.push({
                id: `daifugo_cpu_${cpuIndex}`,
                kind: 'cpu',
                name: CPU_PLAYER_NAMES[cpuIndex % CPU_PLAYER_NAMES.length]
            });
            cpuIndex++;
        }
        resetDaifugoPlayerNames();
        opponents.forEach((participant, index) => { PLAYER_NAMES[index + 1] = participant.name; });
        df = {
            rules,
            rankSettings,
            playerCount,
            participants: [null, ...opponents],
            matchCount,
            matchIndex: 0,
            seriesPlaces: [],
            logs: [],
            selected: new Set(),
            previousWinner: null,
            speech: null,
            ranks: Array.from({ length: playerCount }, () => '平民')
        };
        startRound();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
    };

    window.toggleDaifugoCard = function (index) {
        const choosingCards = !!(df && (df.exchangeMode || df.pendingAction));
        if (!df || df.roundOver || (!choosingCards && df.current !== 0)) return;
        if (df.pendingAction && df.pendingAction.queue[0] && df.pendingAction.queue[0].type === 'bomb') return;
        df.notice = '';
        if (df.selected.has(index)) df.selected.delete(index); else df.selected.add(index);
        updateDaifugoSelectionUi();
    };

    window.confirmDaifugoExchange = function () {
        if (!df || !df.exchangeMode || df.roundOver) return;
        const pair = df.exchangeMode.pair;
        if (df.selected.size !== pair.count) {
            df.notice = `${pair.count}枚ちょうど選んでください。`;
            updateDaifugoSelectionUi();
            return;
        }
        const cardIds = [...df.selected].map(index => df.hands[0][index]).filter(Boolean).map(card => card.id);
        if (cardIds.length !== pair.count) return;
        df.notice = '';
        performRankExchange(pair, cardIds);
        advanceRankExchange();
    };

    window.confirmDaifugoCardAction = function () {
        if (!df || !df.pendingAction || df.roundOver) return;
        const action = df.pendingAction.queue[0];
        if (!action || action.type === 'bomb') return;
        if (df.selected.size !== 1) {
            df.notice = '手札から1枚選んでください。';
            updateDaifugoSelectionUi();
            return;
        }
        const index = [...df.selected][0];
        const card = df.hands[0][index];
        if (!card) return;
        df.hands[0].splice(index, 1);
        if (action.type === 'give') {
            df.hands[action.target].push(card);
            sortHand(df.hands[action.target]);
            addDfLog(`7渡し：あなたは${PLAYER_NAMES[action.target]}へ${cardLabel(card)}を渡した。`);
        } else {
            addDfLog(`${action.rule}：あなたは${cardLabel(card)}を捨てた。`);
        }
        df.pendingAction.queue.shift();
        df.selected.clear();
        df.notice = '';
        while (df.pendingAction.queue.length && df.pendingAction.queue[0].type !== 'bomb' && !df.hands[0].length) df.pendingAction.queue.shift();
        if (df.pendingAction.queue.length) {
            renderDaifugo();
            return;
        }
        const completion = df.pendingAction.completion;
        df.pendingAction = null;
        finalizePlayedTurn(completion);
    };

    window.chooseDaifugoBombRank = function (rank) {
        if (!df || !df.pendingAction || df.roundOver) return;
        const action = df.pendingAction.queue[0];
        rank = Number(rank);
        if (!action || action.type !== 'bomb' || !action.ranks.includes(rank)) return;
        applyQueenBomber(rank);
        df.pendingAction.queue.shift();
        df.selected.clear();
        df.notice = '';
        while (df.pendingAction.queue.length && df.pendingAction.queue[0].type !== 'bomb' && !df.hands[0].length) df.pendingAction.queue.shift();
        if (df.pendingAction.queue.length) {
            renderDaifugo();
            return;
        }
        const completion = df.pendingAction.completion;
        df.pendingAction = null;
        finalizePlayedTurn(completion);
    };

    window.playSelectedDaifugoCards = function () {
        if (!df || df.current !== 0 || df.roundOver) return;
        const indices = [...df.selected].sort((a, b) => a - b);
        const cards = indices.map(index => df.hands[0][index]).filter(Boolean);
        const play = classify(cards);
        if (!indices.length || !canBeat(play)) {
            df.notice = 'その組み合わせは今の場には出せません。';
            updateDaifugoSelectionUi();
            return;
        }
        df.notice = '';
        df.selected.clear();
        playCards(0, indices);
    };

    window.passCasinoDaifugo = function () {
        if (df && df.current === 0 && !df.roundOver) {
            df.notice = '';
            passTurn(0);
        }
    };

    window.nextCasinoDaifugoMatch = function () {
        if (!df || !df.roundOver) return;
        df.matchIndex++;
        if (df.matchIndex >= df.matchCount) {
            renderDaifugo();
            return;
        }
        startRound();
    };

    function renderDaifugo() {
        const content = document.getElementById('casino-daifugo-content');
        if (!content || !df) return;
        const matchDone = df.roundOver;
        const seriesDone = matchDone && df.matchIndex + 1 >= df.matchCount;
        const playSerial = Number(df.playSerial) || 0;
        const animateField = !!df.lastPlay && df.lastAnimatedPlaySerial !== playSerial;
        const playOrigins = [
            { x: '0px', y: '125px' },
            { x: '0px', y: '-125px' },
            { x: '-240px', y: '0px' },
            { x: '240px', y: '0px' }
        ];
        const origin = playOrigins[df.lastPlayer] || playOrigins[1];
        const fieldCount = df.lastPlay ? df.lastPlay.cards.length : 0;
        const fieldKind = df.lastPlay
            ? (df.lastPlay.type === 'sequence' ? '階段' : fieldCount === 1 ? 'シングル' : `${fieldCount}枚組`)
            : '';
        const field = df.lastPlay
            ? df.lastPlay.cards.map((card, index) => {
                const angle = (index - (fieldCount - 1) / 2) * 4;
                return `<span class="df-field-card${animateField ? ' is-new' : ''}" style="--df-angle:${angle}deg;--df-from-x:${origin.x};--df-from-y:${origin.y};z-index:${index + 1};animation-delay:${index * 70}ms;">${typeof window.renderCasinoTrumpCard === 'function' ? window.renderCasinoTrumpCard(card, { width: 55, height: 76 }) : `<span>${cardLabel(card)}</span>`}</span>`;
            }).join('')
            : '<span class="df-field-empty">場は空です</span>';
        const fieldMeta = df.lastPlay
            ? `<div class="df-field-meta" data-df-player="${df.lastPlayer}"><b>${PLAYER_NAMES[df.lastPlayer]}</b><span class="df-field-count">${fieldCount}枚</span><span class="df-field-kind">${fieldKind}</span></div>`
            : '<div class="df-field-meta"><b>場札</b><span class="df-field-kind">次の一手を待っています</span></div>';
        const activeRules = Object.entries(df.rules || {})
            .filter(([id, enabled]) => enabled && window.CASINO_DAIFUGO_RULES[id])
            .map(([id]) => window.CASINO_DAIFUGO_RULES[id]);
        const activeRulesHtml = activeRules.length
            ? activeRules.map(rule => `<span class="df-active-rule" title="${rule.desc}">${rule.name}</span>`).join('')
            : '<span class="df-no-rules">基本ルールのみ</span>';
        const hands = df.hands.map((hand, player) => {
            const place = df.finished.indexOf(player);
            const classes = ['df-player-seat', df.current === player && !matchDone ? 'is-current' : '', place >= 0 ? 'is-finished' : ''].filter(Boolean).join(' ');
            const rank = df.ranks[player] || '平民';
            const participant = Array.isArray(df.participants) ? df.participants[player] : null;
            const avatar = participant && participant.masterType && typeof window.renderCasinoMasterAvatar === 'function'
                ? window.renderCasinoMasterAvatar(participant.masterType, 'df-seat-avatar')
                : '';
            return `<div class="${classes}"><span class="df-player-name"><i class="df-turn-dot"></i>${avatar}${PLAYER_NAMES[player]}<em class="df-rank">${rank}</em></span><span class="df-player-count">${player === 0 ? `${hand.length}枚` : `🂠 × ${hand.length}`}${place >= 0 ? `　<b class="df-place">${place + 1}位</b>` : ''}</span></div>`;
        }).join('');
        let actions = '';
        if (seriesDone) {
            const counts = Array.from({ length: df.playerCount }, (_, index) => index + 1).map(place => `${place}位 ${df.seriesPlaces.filter(value => value === place).length}回`).join(' ／ ');
            const finalPlace = df.seriesPlaces[df.seriesPlaces.length - 1] || df.playerCount;
            actions = `<div class="df-result-card"><h3>全${df.matchCount}戦終了</h3><div class="df-result-place">最終戦 ${finalPlace}位</div><p>${counts}</p><button type="button" class="df-btn" onclick="window.closeCasinoDaifugo()">テーブルを離れる</button></div>`;
        } else if (matchDone) {
            const place = df.seriesPlaces[df.seriesPlaces.length - 1] || df.playerCount;
            actions = `<div class="df-result-card"><h3>第${df.matchIndex + 1}戦終了</h3><div class="df-result-place">${place}位</div><button type="button" class="df-btn df-btn-primary" onclick="window.nextCasinoDaifugoMatch()">次の対戦へ</button></div>`;
        } else if (df.pendingAction) {
            const choice = df.pendingAction.queue[0];
            if (choice.type === 'bomb') {
                const buttons = choice.ranks.map(rank => `<button type="button" class="df-btn" onclick="window.chooseDaifugoBombRank(${rank})">${RANK_LABEL[rank] || rank}</button>`).join('');
                actions = `<span class="df-selected-note">クイーンボンバー：全員の手札から捨てる数字を選択</span><span class="df-bomb-ranks">${buttons}</span>`;
            } else {
                const detail = choice.type === 'give' ? `${PLAYER_NAMES[choice.target]}へ渡す札` : '捨てる札';
                actions = `<span class="df-selected-note">${choice.rule}：${detail}を1枚選択　（選択中 <b id="df-selected-count">${df.selected.size}</b>枚）</span><button type="button" class="df-btn df-btn-primary" onclick="window.confirmDaifugoCardAction()">この札を選ぶ</button><span id="df-action-error" class="df-error" ${df.notice ? '' : 'hidden'}>${df.notice || ''}</span>`;
            }
        } else if (df.exchangeMode) {
            actions = `<span class="df-selected-note">${df.exchangeMode.role}として渡す札を <b>${df.exchangeMode.count}枚</b> 選択　（選択中 <b id="df-selected-count">${df.selected.size}</b>枚）</span><button type="button" class="df-btn df-btn-primary" onclick="window.confirmDaifugoExchange()">この札を交換する</button><span id="df-action-error" class="df-error" ${df.notice ? '' : 'hidden'}>${df.notice || ''}</span>`;
        } else if (df.current === 0) {
            actions = `<span class="df-selected-note">選択中 <b id="df-selected-count">${df.selected.size}</b>枚</span><button type="button" class="df-btn df-btn-primary" onclick="window.playSelectedDaifugoCards()">選んだ札を出す</button><button type="button" class="df-btn df-btn-pass" onclick="window.passCasinoDaifugo()" ${df.lastPlay ? '' : 'disabled'}>パス</button><span id="df-action-error" class="df-error" ${df.notice ? '' : 'hidden'}>${df.notice || ''}</span>`;
        } else {
            actions = `<span class="df-thinking">${PLAYER_NAMES[df.current]}が考えています…</span>`;
        }
        const playerCards = df.hands[0].map(playerCardHtml).join('');
        const handTitle = df.exchangeMode ? '交換する手札を選択' : df.pendingAction ? (df.pendingAction.queue[0].type === 'bomb' ? '捨てる数字を選択' : `${df.pendingAction.queue[0].rule}の札を選択`) : 'あなたの手札';
        const stateChips = [
            `<span class="df-state-chip${df.revolution ? ' is-revolution' : ''}">${df.revolution ? '革命中' : '通常'}</span>`,
            df.elevenBack ? '<span class="df-state-chip is-revolution">11バック</span>' : '',
            df.suitLock ? '<span class="df-state-chip is-lock">しばり中</span>' : '',
            df.numericLock != null ? '<span class="df-state-chip is-lock">数しばり中</span>' : '',
            df.direction < 0 ? '<span class="df-state-chip is-reverse">リバース中</span>' : ''
        ].filter(Boolean).join('');
        const speechAvatar = df.speech && typeof window.renderCasinoMasterAvatar === 'function'
            ? window.renderCasinoMasterAvatar(df.speech.masterType, 'df-speech-avatar')
            : '';
        const speechHtml = df.speech
            ? `<div class="df-master-speech">${speechAvatar}<span><b>${df.speech.name}</b><em>${df.speech.text}</em></span></div>`
            : '';
        content.innerHTML = `<div class="df-game-head"><div class="df-game-head-left"><span class="df-round-chip">第${df.matchIndex + 1} / ${df.matchCount}戦</span>${stateChips}</div><span class="df-round-chip">${df.playerCount}人・参加費 10</span></div><div class="df-active-rules"><div class="df-active-rules-head"><b>適用ルール</b><span>${activeRules.length}</span></div><div class="df-active-rules-list">${activeRulesHtml}</div></div><div class="df-game-layout"><div class="df-main-board"><div class="df-players">${hands}</div>${speechHtml}<div class="df-table">${fieldMeta}<div class="df-field-cards">${field}</div></div><div class="df-your-hand-label"><b>${handTitle}</b><span>${df.hands[0].length}枚</span></div><div class="df-hand"><div class="df-hand-track">${playerCards}</div></div><div class="df-actions">${actions}</div></div><aside class="df-log-panel"><div class="df-log-head">GAME LOG</div><div class="df-log-body">${df.logs.slice(-32).map(line => `<div class="df-log-line">${line}</div>`).join('')}</div></aside></div>`;
        if (df.lastPlay) df.lastAnimatedPlaySerial = playSerial;
    }
})();

// ==========================================
// インディアンポーカー（2～4人戦）
// ==========================================
(function () {
    'use strict';

    const SUITS = [
        { id: 'spade', mark: '♠', color: '#111' },
        { id: 'heart', mark: '♥', color: '#c62828' },
        { id: 'dia', mark: '♦', color: '#c62828' },
        { id: 'club', mark: '♣', color: '#111' }
    ];
    const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const NAMES = ['あなた', 'ディーラー', 'CPU・ルビー', 'CPU・サファイア'];
    let indianState = null;

    function dealerRank() {
        const hero = window.aiPet || {};
        return hero.apprentice && hero.apprentice.rank ? Number(hero.apprentice.rank.dealer) || 0 : 0;
    }

    function shuffledDeck() {
        const deck = [];
        SUITS.forEach(suit => {
            for (let rank = 2; rank <= 14; rank++) deck.push({ suit: suit.id, mark: suit.mark, color: suit.color, rank });
        });
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function cardLabel(card) {
        return `${RANK_LABEL[card.rank] || card.rank}${card.mark}`;
    }

    function cardHtml(card, hidden) {
        if (typeof window.renderCasinoTrumpCard === 'function') {
            return window.renderCasinoTrumpCard(card, { hidden, width: 92, height: 130 });
        }
        return `<span class="ip-fallback${hidden ? ' is-hidden' : ''}" style="color:${card.color};">${hidden ? '🂠' : cardLabel(card)}</span>`;
    }

    function setupHtml() {
        const coins = Number(window.aiPet && window.aiPet.casinoCoins || 0).toLocaleString();
        return `<div class="ip-setup"><div class="ip-intro"><span>♦</span><div><strong>自分の札だけ見えない心理戦</strong><small>相手の額のカードを見て「勝負」か「降りる」を選択。Aが最強で、同じ数字は山分けです。</small></div></div><div class="ip-settings"><label><span>プレイ人数</span><select id="indian-poker-player-count"><option value="2">2人</option><option value="3">3人</option><option value="4">4人</option></select></label><label><span>アンティ</span><span class="ip-ante"><input id="indian-poker-ante" type="number" min="1" max="100" value="5"><b>コイン</b></span></label><div><span>所持コイン</span><strong>🪙 ${coins}</strong></div></div><div id="indian-poker-notice" class="ip-notice" aria-live="polite"></div><button type="button" class="ip-btn ip-btn-primary ip-start" onclick="window.startCasinoIndianPoker()"><span>カードを掲げる</span><small>ANTE &amp; DEAL</small></button></div>`;
    }

    function styleHtml() {
        return `<style>
            #casino-indian-poker-ui::backdrop{background:rgba(0,0,0,.84);backdrop-filter:blur(3px)}
            .ip-shell{width:min(940px,95vw);max-height:95vh;overflow:auto;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(32,7,17,.98),rgba(9,3,6,.99));padding:22px 28px 26px;box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 24px 80px #000,0 0 42px rgba(200,153,57,.2)}
            .ip-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:18px;border-bottom:1px solid rgba(255,213,106,.28)}.ip-title{display:flex;align-items:center;gap:12px;margin:0;color:#ffd56a;font-size:clamp(22px,3vw,29px)}.ip-title-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#ffd86e,#9c6516);color:#21070f;font-size:25px}
            .ip-btn{appearance:none;border:1px solid rgba(255,218,128,.65);border-radius:10px;padding:11px 20px;color:#fff;background:linear-gradient(180deg,#633047,#351421);font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.12);transition:transform .16s,filter .16s}.ip-btn:hover{transform:translateY(-2px);filter:brightness(1.13)}.ip-btn-primary{border-color:#ffe08a;background:linear-gradient(180deg,#d79b2d,#8e5412);color:#1b0803}.ip-btn-fold{border-color:#82909a;background:linear-gradient(180deg,#52616b,#29343b)}.ip-close{display:flex;gap:8px;align-items:center;background:linear-gradient(180deg,#5a2638,#2b101a);color:#f9d9e3;border-color:#9b536a}
            #casino-indian-poker-content{margin-top:20px}.ip-setup{display:grid;gap:20px;max-width:730px;margin:12px auto}.ip-intro{display:flex;align-items:center;gap:16px;padding:17px 20px;border:1px solid rgba(255,213,106,.3);border-radius:14px;background:linear-gradient(90deg,rgba(131,74,20,.22),rgba(82,24,49,.2))}.ip-intro>span{display:grid;place-items:center;width:50px;height:50px;flex:none;border-radius:12px;background:#13070b;color:#d72d3c;font-size:30px;box-shadow:inset 0 0 0 1px #a66f20}.ip-intro strong,.ip-intro small{display:block}.ip-intro strong{color:#fff0c2;font-size:18px}.ip-intro small{margin-top:5px;color:#beaeb4;line-height:1.5}.ip-settings{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}.ip-settings>label,.ip-settings>div{display:grid;gap:7px;padding:14px;border:1px solid #5b3541;border-radius:12px;background:rgba(255,255,255,.035)}.ip-settings span{color:#c8b9be;font-size:12px;font-weight:bold}.ip-settings select,.ip-settings input{width:100%;min-height:40px;box-sizing:border-box;border:1px solid #8a5c68;border-radius:8px;background:#13070c;color:#fff;padding:8px 10px;font-weight:bold}.ip-settings strong{align-self:center;color:#ffd56a;font-size:19px}.ip-ante{display:flex;align-items:center;gap:7px}.ip-ante b{color:#ffd56a;font-size:11px;white-space:nowrap}.ip-notice{min-height:18px;text-align:center;color:#ff9e9e;font-size:12px;font-weight:bold}.ip-start{display:grid;place-items:center;justify-self:center;min-width:250px}.ip-start small{font-size:9px;letter-spacing:.2em;opacity:.7}
            .ip-round{display:grid;gap:15px}.ip-round-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.ip-chip{padding:5px 10px;border:1px solid #a97322;border-radius:999px;background:rgba(166,111,32,.18);color:#ffd56a;font-size:11px;font-weight:bold}.ip-table{padding:24px 20px;border:2px solid #b48532;border-radius:70px;background:radial-gradient(ellipse at center,#1d6441 0,#103d2c 58%,#09251c 100%);box-shadow:inset 0 0 35px rgba(0,0,0,.7),0 8px 24px rgba(0,0,0,.4)}.ip-players{display:grid;grid-template-columns:repeat(var(--ip-count),minmax(0,1fr));gap:14px}.ip-player{display:grid;gap:8px;justify-items:center;padding:13px 8px;border:1px solid rgba(255,231,172,.25);border-radius:14px;background:rgba(2,22,14,.45)}.ip-player.is-you{border-color:#d4a53d;box-shadow:0 0 18px rgba(255,205,80,.16)}.ip-player.is-folded{filter:grayscale(.8);opacity:.48}.ip-name{display:flex;align-items:center;gap:6px;color:#f1e5d0;font-size:12px;font-weight:900}.ip-status{padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.1);color:#bdcec4;font-size:9px}.ip-card{width:98px;height:136px;padding:3px;border:0;border-radius:10px;background:#fff;overflow:hidden;box-sizing:border-box;box-shadow:0 7px 16px rgba(0,0,0,.55);transform:rotate(var(--ip-tilt,0deg))}.ip-fallback{display:grid;place-items:center;width:92px;height:130px;background:#fff;font-size:30px}.ip-fallback.is-hidden{background:repeating-linear-gradient(45deg,#5b1734,#5b1734 8px,#d49a31 8px,#d49a31 12px);color:#fff}.ip-hint{text-align:center;color:#c9dbd1;font-size:12px}.ip-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;min-height:54px}.ip-result{display:grid;gap:7px;place-items:center}.ip-result h3{margin:0;color:#ffd56a;font-size:29px}.ip-result strong{font-size:20px}.ip-result p{margin:0;color:#d7cbd0}.ip-result-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:9px;margin-top:5px}
            @media(max-width:720px){.ip-shell{padding:16px 12px}.ip-settings{grid-template-columns:1fr}.ip-players{grid-template-columns:repeat(2,minmax(0,1fr))}.ip-card{width:82px;height:116px}.ip-close span{display:none}}
        </style>`;
    }

    function recordResult(result, netCoins, state) {
        if (!state || typeof window.recordDealerCasinoGameResult !== 'function') return;
        const opponents = Array.from({ length: state.playerCount - 1 }, (_, index) => {
            const player = index + 1;
            let versusResult = 'loss';
            if (state.active[0]) {
                if (!state.active[player]) versusResult = 'win';
                else if (state.cards[0].rank > state.cards[player].rank) versusResult = 'win';
                else if (state.cards[0].rank === state.cards[player].rank) versusResult = 'draw';
            }
            return {
                id: player === 1 ? 'dealer' : `indian_cpu_${index}`,
                name: NAMES[player],
                type: player === 1 ? 'dealer' : 'cpu',
                masterType: player === 1 ? 'dealer' : '',
                result: versusResult
            };
        });
        window.recordDealerCasinoGameResult('indianPoker', result, { netCoins, opponents });
    }

    function beginRound(playerCount, ante) {
        const hero = window.aiPet;
        if (!hero || hero.casinoCoins < ante) return false;
        const deck = shuffledDeck();
        hero.casinoCoins -= ante;
        indianState = {
            playerCount,
            ante,
            pot: ante * playerCount,
            cards: deck.splice(0, playerCount),
            active: Array.from({ length: playerCount }, () => true),
            phase: 'decision',
            logs: ['相手のカードを確認した。自分のカードはまだ見えない。']
        };
        window.playCasinoGameBGM('indian_main');
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        renderIndianPoker();
        return true;
    }

    window.openCasinoIndianPoker = function () {
        if (dealerRank() < 6) return;
        indianState = null;
        window.restoreCasinoLobbyBGM();
        const old = document.getElementById('casino-indian-poker-ui');
        if (old) old.remove();
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-indian-poker-ui';
        overlay.setAttribute('aria-label', 'インディアンポーカー');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:radial-gradient(circle,#3b1022,#050305 72%);color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `${styleHtml()}<div class="ip-shell"><div class="ip-header"><h2 class="ip-title"><span class="ip-title-mark">♦</span>インディアンポーカー</h2><button type="button" class="ip-btn ip-close" onclick="window.closeCasinoIndianPoker()"><b>×</b><span>テーブルを離れる</span></button></div><div id="casino-indian-poker-content">${setupHtml()}</div></div>`;
        overlay.addEventListener('cancel', event => { event.preventDefault(); window.closeCasinoIndianPoker(); });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try { overlay.showModal(); }
            catch (error) { console.warn('インディアンポーカーUIをtop layerへ移動できませんでした。', error); overlay.setAttribute('open', ''); }
        } else overlay.setAttribute('open', '');
    };

    window.closeCasinoIndianPoker = function () {
        indianState = null;
        const overlay = document.getElementById('casino-indian-poker-ui');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
        window.restoreCasinoLobbyBGM();
    };

    window.showCasinoIndianPokerSetup = function () {
        indianState = null;
        const content = document.getElementById('casino-indian-poker-content');
        if (content) content.innerHTML = setupHtml();
        window.restoreCasinoLobbyBGM();
    };

    window.startCasinoIndianPoker = function () {
        const countInput = document.getElementById('indian-poker-player-count');
        const anteInput = document.getElementById('indian-poker-ante');
        const playerCount = Math.max(2, Math.min(4, Number(countInput && countInput.value) || 2));
        const ante = Math.floor(Number(anteInput && anteInput.value) || 0);
        const notice = document.getElementById('indian-poker-notice');
        if (ante < 1 || ante > 100) {
            if (notice) notice.textContent = 'アンティは1～100コインで指定してください。';
            return;
        }
        if (!window.aiPet || window.aiPet.casinoCoins < ante) {
            if (notice) notice.textContent = 'カジノコインが足りません。';
            return;
        }
        beginRound(playerCount, ante);
    };

    window.replayCasinoIndianPoker = function () {
        if (!indianState || indianState.phase !== 'result') return;
        if (!window.aiPet || window.aiPet.casinoCoins < indianState.ante) {
            indianState.notice = `次のアンティに${indianState.ante}コイン必要です。`;
            renderIndianPoker();
            return;
        }
        beginRound(indianState.playerCount, indianState.ante);
    };

    window.resolveCasinoIndianPoker = function (choice) {
        if (!indianState || indianState.phase !== 'decision') return;
        const state = indianState;
        if (choice === 'fold') {
            state.active[0] = false;
            state.logs.push('あなたは勝負から降りた。');
        } else {
            state.logs.push('あなたは勝負を選んだ。');
        }
        for (let player = 1; player < state.playerCount; player++) {
            const visibleMax = Math.max(...state.cards.filter((card, index) => index !== player && state.active[index]).map(card => card.rank));
            const foldChance = visibleMax >= 14 ? 0.78 : visibleMax >= 13 ? 0.62 : visibleMax >= 11 ? 0.42 : 0.16;
            state.active[player] = Math.random() >= foldChance;
            state.logs.push(`${NAMES[player]}は${state.active[player] ? '勝負を選んだ' : '降りた'}。`);
        }
        let activePlayers = state.active.map((active, player) => active ? player : -1).filter(player => player >= 0);
        if (!activePlayers.length) {
            state.active[1] = true;
            activePlayers = [1];
            state.logs.push(`${NAMES[1]}が最後まで勝負に残った。`);
        }
        const high = Math.max(...activePlayers.map(player => state.cards[player].rank));
        const winners = activePlayers.filter(player => state.cards[player].rank === high);
        const playerWon = state.active[0] && winners.includes(0);
        const payout = playerWon ? Math.floor(state.pot / winners.length) : 0;
        window.aiPet.casinoCoins += payout;
        state.payout = payout;
        state.netCoins = payout - state.ante;
        state.winners = winners;
        state.result = playerWon ? (winners.length > 1 ? 'draw' : 'win') : 'loss';
        state.phase = 'result';
        if (state.result !== 'draw') window.playCasinoGameBGM(state.result === 'win' ? 'indian_win' : 'indian_lose');
        recordResult(state.result, state.netCoins, state);
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        renderIndianPoker();
    };

    function renderIndianPoker() {
        const content = document.getElementById('casino-indian-poker-content');
        if (!content || !indianState) return;
        const state = indianState;
        const reveal = state.phase === 'result';
        const players = state.cards.map((card, player) => {
            const hidden = player === 0 && !reveal;
            const status = reveal ? (state.winners.includes(player) ? 'WINNER' : state.active[player] ? 'SHOWDOWN' : 'FOLD') : player === 0 ? 'YOUR CARD ?' : 'OPEN';
            return `<div class="ip-player${player === 0 ? ' is-you' : ''}${reveal && !state.active[player] ? ' is-folded' : ''}"><span class="ip-name">${NAMES[player]}<b class="ip-status">${status}</b></span><div class="ip-card" style="--ip-tilt:${(player - (state.playerCount - 1) / 2) * 2}deg">${cardHtml(card, hidden)}</div><span class="ip-status">${hidden ? '自分からは見えない' : cardLabel(card)}</span></div>`;
        }).join('');
        let actions = '';
        if (state.phase === 'decision') {
            actions = `<button type="button" class="ip-btn ip-btn-primary" onclick="window.resolveCasinoIndianPoker('stay')">勝負する</button><button type="button" class="ip-btn ip-btn-fold" onclick="window.resolveCasinoIndianPoker('fold')">降りる</button>`;
        } else {
            const title = state.result === 'win' ? 'WIN' : state.result === 'draw' ? 'SPLIT POT' : 'LOSE';
            const resultText = state.result === 'win' ? 'あなたのカードが最も強かった。' : state.result === 'draw' ? '同じ数字でポットを山分けした。' : '今回は相手が上回った。';
            actions = `<div class="ip-result"><h3>${title}</h3><strong>${state.netCoins >= 0 ? '+' : ''}${state.netCoins} コイン</strong><p>${resultText}</p>${state.notice ? `<span class="ip-notice">${state.notice}</span>` : ''}<div class="ip-result-actions"><button type="button" class="ip-btn ip-btn-primary" onclick="window.replayCasinoIndianPoker()">同じ条件ですぐ再戦</button><button type="button" class="ip-btn" onclick="window.showCasinoIndianPokerSetup()">設定を変更</button></div></div>`;
        }
        content.innerHTML = `<div class="ip-round"><div class="ip-round-head"><span class="ip-chip">${state.playerCount}人戦</span><span class="ip-chip">ANTE ${state.ante} ／ POT ${state.pot}</span></div><div class="ip-table"><div class="ip-players" style="--ip-count:${state.playerCount}">${players}</div></div><div class="ip-hint">${reveal ? state.logs.join('　') : '相手のカードは見えています。自分の数字を推理してください。'}</div><div class="ip-actions">${actions}</div></div>`;
    }
})();

// ==========================================
// テキサスホールデム（5～8人戦）
// ==========================================
(function () {
    'use strict';

    const SUITS = [
        { id: 'spade', mark: '♠', color: '#111' },
        { id: 'heart', mark: '♥', color: '#c62828' },
        { id: 'dia', mark: '♦', color: '#c62828' },
        { id: 'club', mark: '♣', color: '#111' }
    ];
    const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    const HAND_NAMES = ['ハイカード', 'ワンペア', 'ツーペア', 'スリーカード', 'ストレート', 'フラッシュ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ'];
    const PLAYER_NAMES = ['あなた', 'ディーラー', 'CPU・ルビー', 'CPU・サファイア', 'CPU・エメラルド', 'CPU・アメジスト', 'CPU・トパーズ', 'CPU・オニキス'];
    const STAGES = [
        { id: 'preflop', name: 'プリフロップ', revealed: 0 },
        { id: 'flop', name: 'フロップ', revealed: 3 },
        { id: 'turn', name: 'ターン', revealed: 4 },
        { id: 'river', name: 'リバー', revealed: 5 }
    ];
    let holdemState = null;

    function dealerRank() {
        const hero = window.aiPet || {};
        return hero.apprentice && hero.apprentice.rank ? Number(hero.apprentice.rank.dealer) || 0 : 0;
    }

    function shuffledDeck() {
        const deck = [];
        SUITS.forEach(suit => {
            for (let rank = 2; rank <= 14; rank++) deck.push({ suit: suit.id, mark: suit.mark, color: suit.color, rank });
        });
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    function evaluateFive(hand) {
        const ranks = hand.map(card => card.rank).sort((a, b) => b - a);
        const counts = {};
        ranks.forEach(rank => { counts[rank] = (counts[rank] || 0) + 1; });
        const groups = Object.keys(counts).map(Number).sort((a, b) => counts[b] - counts[a] || b - a);
        const flush = hand.every(card => card.suit === hand[0].suit);
        const unique = [...new Set(ranks)];
        let straightHigh = 0;
        if (unique.length === 5 && unique[0] - unique[4] === 4) straightHigh = unique[0];
        else if (unique.join(',') === '14,5,4,3,2') straightHigh = 5;
        if (straightHigh && flush) return { category: 8, values: [straightHigh], name: HAND_NAMES[8], cards: hand.slice() };
        if (counts[groups[0]] === 4) return { category: 7, values: [groups[0], groups[1]], name: HAND_NAMES[7], cards: hand.slice() };
        if (counts[groups[0]] === 3 && counts[groups[1]] === 2) return { category: 6, values: [groups[0], groups[1]], name: HAND_NAMES[6], cards: hand.slice() };
        if (flush) return { category: 5, values: ranks, name: HAND_NAMES[5], cards: hand.slice() };
        if (straightHigh) return { category: 4, values: [straightHigh], name: HAND_NAMES[4], cards: hand.slice() };
        if (counts[groups[0]] === 3) return { category: 3, values: [groups[0], ...groups.slice(1).sort((a, b) => b - a)], name: HAND_NAMES[3], cards: hand.slice() };
        if (counts[groups[0]] === 2 && counts[groups[1]] === 2) {
            const pairs = [groups[0], groups[1]].sort((a, b) => b - a);
            return { category: 2, values: [...pairs, groups[2]], name: HAND_NAMES[2], cards: hand.slice() };
        }
        if (counts[groups[0]] === 2) return { category: 1, values: [groups[0], ...groups.slice(1).sort((a, b) => b - a)], name: HAND_NAMES[1], cards: hand.slice() };
        return { category: 0, values: ranks, name: HAND_NAMES[0], cards: hand.slice() };
    }

    function compareHands(a, b) {
        if (a.category !== b.category) return a.category > b.category ? 1 : -1;
        const length = Math.max(a.values.length, b.values.length);
        for (let i = 0; i < length; i++) {
            const av = a.values[i] || 0;
            const bv = b.values[i] || 0;
            if (av !== bv) return av > bv ? 1 : -1;
        }
        return 0;
    }

    function bestHand(cards) {
        if (!Array.isArray(cards) || cards.length < 5) return null;
        let best = null;
        for (let a = 0; a < cards.length - 4; a++) {
            for (let b = a + 1; b < cards.length - 3; b++) {
                for (let c = b + 1; c < cards.length - 2; c++) {
                    for (let d = c + 1; d < cards.length - 1; d++) {
                        for (let e = d + 1; e < cards.length; e++) {
                            const result = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
                            if (!best || compareHands(result, best) > 0) best = result;
                        }
                    }
                }
            }
        }
        return best;
    }

    function cardLabel(card) {
        return `${RANK_LABEL[card.rank] || card.rank}${card.mark}`;
    }

    function cardHtml(card, hidden, width, height) {
        if (typeof window.renderCasinoTrumpCard === 'function') {
            return window.renderCasinoTrumpCard(card, { hidden, width, height });
        }
        return `<span class="th-fallback${hidden ? ' is-hidden' : ''}" style="width:${width}px;height:${height}px;color:${card.color};">${hidden ? '🂠' : cardLabel(card)}</span>`;
    }

    function setupHtml() {
        const coins = Number(window.aiPet && window.aiPet.casinoCoins || 0).toLocaleString();
        return `<div class="th-setup"><div class="th-intro"><span>♠</span><div><strong>2枚の手札と5枚の共通札で勝負</strong><small>各ストリートは固定ベット制。場に残ったプレイヤーが7枚から最強の5枚を作り、ポットを争います。</small></div></div><div class="th-settings"><label><span>プレイ人数</span><select id="texas-holdem-player-count"><option value="5">5人</option><option value="6">6人</option><option value="7">7人</option><option value="8">8人</option></select></label><label><span>固定ベット</span><span class="th-bet-input"><input id="texas-holdem-bet" type="number" min="1" max="50" value="5"><b>コイン</b></span></label><div><span>所持コイン</span><strong>🪙 ${coins}</strong></div></div><p class="th-rule-note">開始時とプリフロップ／フロップ／ターン／リバーのコール時に、設定した額を支払います。途中でフォールドできます。</p><div id="texas-holdem-notice" class="th-notice" aria-live="polite"></div><button type="button" class="th-btn th-btn-primary th-start" onclick="window.startCasinoTexasHoldem()"><span>テーブルにつく</span><small>ANTE &amp; DEAL</small></button></div>`;
    }

    function styleHtml() {
        return `<style>
            #casino-texas-holdem-ui::backdrop{background:rgba(0,0,0,.85);backdrop-filter:blur(3px)}
            .th-shell{width:min(1120px,97vw);max-height:96vh;overflow:auto;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(31,7,17,.99),rgba(7,3,5,.99));padding:20px 24px 24px;box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 24px 80px #000,0 0 42px rgba(200,153,57,.2)}
            .th-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:17px;border-bottom:1px solid rgba(255,213,106,.28)}.th-title{display:flex;align-items:center;gap:12px;margin:0;color:#ffd56a;font-size:clamp(21px,3vw,29px)}.th-title-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#ffd86e,#9c6516);color:#21070f;font-size:27px}
            .th-btn{appearance:none;border:1px solid rgba(255,218,128,.65);border-radius:10px;padding:11px 20px;color:#fff;background:linear-gradient(180deg,#633047,#351421);font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 5px 16px rgba(0,0,0,.35),inset 0 1px rgba(255,255,255,.12);transition:transform .16s,filter .16s}.th-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.13)}.th-btn:disabled{opacity:.38;cursor:not-allowed}.th-btn-primary{border-color:#ffe08a;background:linear-gradient(180deg,#d79b2d,#8e5412);color:#1b0803}.th-btn-fold{border-color:#82909a;background:linear-gradient(180deg,#52616b,#29343b)}.th-close{display:flex;gap:8px;align-items:center;background:linear-gradient(180deg,#5a2638,#2b101a);color:#f9d9e3;border-color:#9b536a}
            #casino-texas-holdem-content{margin-top:18px}.th-setup{display:grid;gap:18px;max-width:760px;margin:12px auto}.th-intro{display:flex;align-items:center;gap:16px;padding:17px 20px;border:1px solid rgba(255,213,106,.3);border-radius:14px;background:linear-gradient(90deg,rgba(131,74,20,.22),rgba(82,24,49,.2))}.th-intro>span{display:grid;place-items:center;width:50px;height:50px;flex:none;border-radius:12px;background:#13070b;color:#171717;font-size:31px;text-shadow:0 0 1px #fff;box-shadow:inset 0 0 0 1px #a66f20}.th-intro strong,.th-intro small{display:block}.th-intro strong{color:#fff0c2;font-size:18px}.th-intro small{margin-top:5px;color:#beaeb4;line-height:1.5}.th-settings{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}.th-settings>label,.th-settings>div{display:grid;gap:7px;padding:14px;border:1px solid #5b3541;border-radius:12px;background:rgba(255,255,255,.035)}.th-settings span{color:#c8b9be;font-size:12px;font-weight:bold}.th-settings select,.th-settings input{width:100%;min-height:40px;box-sizing:border-box;border:1px solid #8a5c68;border-radius:8px;background:#13070c;color:#fff;padding:8px 10px;font-weight:bold}.th-settings strong{align-self:center;color:#ffd56a;font-size:19px}.th-bet-input{display:flex;align-items:center;gap:7px}.th-bet-input b{color:#ffd56a;font-size:11px;white-space:nowrap}.th-rule-note{margin:0;text-align:center;color:#a99aa0;font-size:11px;line-height:1.6}.th-notice{min-height:18px;text-align:center;color:#ff9e9e;font-size:12px;font-weight:bold}.th-start{display:grid;place-items:center;justify-self:center;min-width:260px}.th-start small{font-size:9px;letter-spacing:.2em;opacity:.7}
            .th-round{display:grid;gap:11px}.th-round-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px}.th-head-left{display:flex;flex-wrap:wrap;gap:7px}.th-chip{padding:5px 10px;border:1px solid #a97322;border-radius:999px;background:rgba(166,111,32,.18);color:#ffd56a;font-size:11px;font-weight:bold}.th-chip.is-stage{border-color:#4b8b69;background:rgba(42,113,75,.22);color:#b2efc8}.th-game-layout{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:13px}.th-board{min-width:0}.th-opponents{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:8px}.th-seat{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;padding:7px 9px;border:1px solid #486956;border-radius:10px;background:rgba(7,31,20,.82)}.th-seat.is-folded{opacity:.45;filter:grayscale(.8)}.th-seat.is-winner{border-color:#ffd35d;box-shadow:0 0 13px rgba(255,211,93,.22)}.th-seat-name{display:grid;gap:2px;min-width:0;color:#f0e4d1;font-size:10px;font-weight:900}.th-seat-name small{color:#9fb7aa;font-size:8px}.th-mini-cards{display:flex;gap:2px}.th-mini-card{display:block;width:36px;height:50px;overflow:hidden;border-radius:4px;background:#fff;box-shadow:0 3px 7px rgba(0,0,0,.45)}
            .th-table{position:relative;display:grid;place-items:center;gap:9px;min-height:185px;padding:17px 18px;border:2px solid #b48532;border-radius:74px;background:radial-gradient(ellipse at center,#1d6441 0,#103d2c 58%,#09251c 100%);box-shadow:inset 0 0 35px rgba(0,0,0,.7),0 8px 24px rgba(0,0,0,.4)}.th-pot{color:#ffe09b;font-size:13px;font-weight:900}.th-community{display:flex;justify-content:center;gap:7px;min-height:84px}.th-community-card,.th-empty-card{display:grid;place-items:center;width:58px;height:82px;border-radius:7px;box-sizing:border-box}.th-community-card{overflow:hidden;background:#fff;box-shadow:0 5px 12px rgba(0,0,0,.5)}.th-community-card.is-new{animation:thReveal .42s cubic-bezier(.2,.82,.2,1.1) both}@keyframes thReveal{from{opacity:0;transform:translateY(-30px) rotateY(90deg)}to{opacity:1;transform:none}}.th-empty-card{border:1px dashed rgba(219,237,227,.24);background:rgba(0,0,0,.13);color:#86a596;font-size:8px;font-weight:900;letter-spacing:.08em}.th-stage-help{color:#a9c4b5;font-size:10px}
            .th-you{display:flex;align-items:center;justify-content:center;gap:17px;margin-top:9px;padding:10px 12px;border:1px solid #66503b;border-radius:12px;background:rgba(67,35,20,.28)}.th-you-copy{display:grid;gap:4px;text-align:right}.th-you-copy b{color:#fff0c3}.th-you-copy span{color:#c9b9af;font-size:10px}.th-hole-cards{display:flex;gap:7px}.th-hole-card{display:block;width:70px;height:98px;overflow:hidden;border-radius:7px;background:#fff;box-shadow:0 5px 12px rgba(0,0,0,.5)}.th-player-hand{color:#ffd86d!important;font-weight:900}
            .th-actions{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:9px;min-height:72px;padding-top:8px}.th-call-note{color:#d7c8cd;font-size:11px}.th-action-error{width:100%;text-align:center;color:#ff9e9e;font-size:11px;font-weight:bold}.th-result{display:grid;gap:6px;place-items:center;text-align:center}.th-result h3{margin:0;color:#ffd56a;font-size:29px}.th-result strong{font-size:19px}.th-result p{margin:0;color:#d7cbd0;font-size:12px}.th-result-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:4px}
            .th-log{display:flex;flex-direction:column;min-height:0;border:1px solid #486956;border-radius:11px;background:rgba(3,18,11,.9);overflow:hidden}.th-log-head{padding:10px 11px;border-bottom:1px solid #334b3e;color:#ffd56a;font-size:11px;font-weight:900;letter-spacing:.09em}.th-log-body{height:390px;overflow:auto;padding:9px 11px;color:#b9cbc1;font-size:10px;line-height:1.55}.th-log-line{padding:3px 0;border-bottom:1px solid rgba(255,255,255,.035)}.th-fallback{display:grid;place-items:center;background:#fff;font-weight:900}.th-fallback.is-hidden{background:repeating-linear-gradient(45deg,#5b1734,#5b1734 7px,#d49a31 7px,#d49a31 11px);color:#fff}
            @media(max-width:840px){.th-shell{padding:15px 11px}.th-game-layout{grid-template-columns:1fr}.th-log-body{height:135px}.th-opponents{grid-template-columns:repeat(2,minmax(0,1fr))}.th-settings{grid-template-columns:1fr}.th-close span{display:none}.th-community{gap:3px}.th-community-card,.th-empty-card{width:48px;height:68px}.th-you{align-items:center}}
            @media(prefers-reduced-motion:reduce){.th-community-card.is-new{animation-duration:.01ms}}
        </style>`;
    }

    function recordResult(result, netCoins, state) {
        if (!state || typeof window.recordDealerCasinoGameResult !== 'function') return;
        const opponents = Array.from({ length: state.playerCount - 1 }, (_, index) => {
            const player = index + 1;
            let versusResult = 'loss';
            if (state.active[0]) {
                if (!state.active[player]) {
                    versusResult = 'win';
                } else if (state.handResults && state.handResults[0] && state.handResults[player]) {
                    const comparison = compareHands(state.handResults[0], state.handResults[player]);
                    versusResult = comparison > 0 ? 'win' : comparison < 0 ? 'loss' : 'draw';
                } else {
                    versusResult = result;
                }
            }
            return {
                id: player === 1 ? 'dealer' : `holdem_cpu_${index}`,
                name: PLAYER_NAMES[player],
                type: player === 1 ? 'dealer' : 'cpu',
                masterType: player === 1 ? 'dealer' : '',
                result: versusResult
            };
        });
        window.recordDealerCasinoGameResult('texasHoldem', result, { netCoins, opponents });
    }

    function preflopChance(hole) {
        const high = Math.max(hole[0].rank, hole[1].rank);
        const low = Math.min(hole[0].rank, hole[1].rank);
        let chance = 0.24 + Math.max(0, high - 8) * 0.045;
        if (high === low) chance += 0.34 + high * 0.012;
        if (hole[0].suit === hole[1].suit) chance += 0.08;
        if (Math.abs(high - low) <= 2) chance += 0.07;
        if (high >= 13 && low >= 10) chance += 0.12;
        return Math.max(0.18, Math.min(0.94, chance));
    }

    function cpuContinueChance(player) {
        const state = holdemState;
        const hole = state.holes[player];
        if (state.revealed === 0) return preflopChance(hole);
        const visible = hole.concat(state.community.slice(0, state.revealed));
        const result = visible.length >= 5 ? bestHand(visible) : null;
        let chance = result ? 0.3 + result.category * 0.085 + (result.values[0] || 0) * 0.009 : preflopChance(hole);
        if (state.stageIndex >= 2 && result && result.category === 0) chance -= 0.12;
        if (state.stageIndex === 3 && result && result.category >= 2) chance += 0.12;
        return Math.max(0.12, Math.min(0.97, chance));
    }

    function activeCpuPlayers() {
        const result = [];
        for (let player = 1; player < holdemState.playerCount; player++) if (holdemState.active[player]) result.push(player);
        return result;
    }

    function cpuBetRound() {
        const state = holdemState;
        activeCpuPlayers().forEach(player => {
            if (Math.random() <= cpuContinueChance(player)) {
                state.pot += state.bet;
                state.logs.push(`${PLAYER_NAMES[player]}が${state.bet}コインをコール。`);
            } else {
                state.active[player] = false;
                state.logs.push(`${PLAYER_NAMES[player]}がフォールド。`);
            }
        });
    }

    function finishHand(result, winners, payout, reason, handResults) {
        const state = holdemState;
        const hero = window.aiPet;
        if (payout > 0) hero.casinoCoins += payout;
        state.result = result;
        state.winners = winners;
        state.payout = payout;
        state.netCoins = payout - state.playerSpent;
        state.resultReason = reason;
        state.handResults = handResults || {};
        state.phase = 'result';
        state.revealed = reason === '全員がフォールド' ? state.revealed : 5;
        if (result !== 'draw') window.playCasinoGameBGM(result === 'win' ? 'texas_win' : 'texas_lose');
        state.logs.push(`勝者：${winners.map(player => PLAYER_NAMES[player]).join('・')}${payout ? `　獲得${payout}コイン` : ''}`);
        recordResult(result, state.netCoins, state);
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        renderTexasHoldem();
    }

    function resolveUncontested() {
        finishHand('win', [0], holdemState.pot, '全員がフォールド', {});
    }

    function resolveShowdown() {
        const state = holdemState;
        state.revealed = 5;
        const activePlayers = state.active.map((active, player) => active ? player : -1).filter(player => player >= 0);
        const handResults = {};
        activePlayers.forEach(player => { handResults[player] = bestHand(state.holes[player].concat(state.community)); });
        let best = null;
        activePlayers.forEach(player => {
            if (!best || compareHands(handResults[player], best) > 0) best = handResults[player];
        });
        const winners = activePlayers.filter(player => compareHands(handResults[player], best) === 0);
        const playerWon = state.active[0] && winners.includes(0);
        const payout = playerWon ? Math.floor(state.pot / winners.length) : 0;
        const result = playerWon ? (winners.length > 1 ? 'draw' : 'win') : 'loss';
        finishHand(result, winners, payout, 'ショーダウン', handResults);
    }

    function beginRound(playerCount, bet) {
        const hero = window.aiPet;
        if (!hero || hero.casinoCoins < bet) return false;
        const deck = shuffledDeck();
        const holes = Array.from({ length: playerCount }, () => []);
        for (let round = 0; round < 2; round++) {
            for (let player = 0; player < playerCount; player++) holes[player].push(deck.shift());
        }
        deck.shift();
        const community = deck.splice(0, 3);
        deck.shift();
        community.push(deck.shift());
        deck.shift();
        community.push(deck.shift());
        hero.casinoCoins -= bet;
        holdemState = {
            playerCount,
            bet,
            pot: bet * playerCount,
            playerSpent: bet,
            holes,
            community,
            active: Array.from({ length: playerCount }, () => true),
            stageIndex: 0,
            revealed: 0,
            phase: 'decision',
            winners: [],
            logs: [`${playerCount}人が参加費${bet}コインを出した。`, 'ホールカードが2枚ずつ配られた。'],
            lastRenderedRevealed: 0
        };
        window.playCasinoGameBGM('texas_main');
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        renderTexasHoldem();
        return true;
    }

    window.openCasinoTexasHoldem = function () {
        if (dealerRank() < 6) return;
        holdemState = null;
        window.restoreCasinoLobbyBGM();
        const old = document.getElementById('casino-texas-holdem-ui');
        if (old) old.remove();
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-texas-holdem-ui';
        overlay.setAttribute('aria-label', 'テキサスホールデム');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:radial-gradient(circle,#3b1022,#050305 72%);color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `${styleHtml()}<div class="th-shell"><div class="th-header"><h2 class="th-title"><span class="th-title-mark">♠</span>テキサスホールデム</h2><button type="button" class="th-btn th-close" onclick="window.closeCasinoTexasHoldem()"><b>×</b><span>テーブルを離れる</span></button></div><div id="casino-texas-holdem-content">${setupHtml()}</div></div>`;
        overlay.addEventListener('cancel', event => { event.preventDefault(); window.closeCasinoTexasHoldem(); });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try { overlay.showModal(); }
            catch (error) { console.warn('テキサスホールデムUIをtop layerへ移動できませんでした。', error); overlay.setAttribute('open', ''); }
        } else overlay.setAttribute('open', '');
    };

    window.closeCasinoTexasHoldem = function () {
        holdemState = null;
        const overlay = document.getElementById('casino-texas-holdem-ui');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
        window.restoreCasinoLobbyBGM();
    };

    window.showCasinoTexasHoldemSetup = function () {
        holdemState = null;
        const content = document.getElementById('casino-texas-holdem-content');
        if (content) content.innerHTML = setupHtml();
        window.restoreCasinoLobbyBGM();
    };

    window.startCasinoTexasHoldem = function () {
        const countInput = document.getElementById('texas-holdem-player-count');
        const betInput = document.getElementById('texas-holdem-bet');
        const playerCount = Math.max(5, Math.min(8, Number(countInput && countInput.value) || 5));
        const bet = Math.floor(Number(betInput && betInput.value) || 0);
        const notice = document.getElementById('texas-holdem-notice');
        if (bet < 1 || bet > 50) {
            if (notice) notice.textContent = '固定ベットは1～50コインで指定してください。';
            return;
        }
        if (!window.aiPet || window.aiPet.casinoCoins < bet) {
            if (notice) notice.textContent = '参加費分のカジノコインが足りません。';
            return;
        }
        beginRound(playerCount, bet);
    };

    window.replayCasinoTexasHoldem = function () {
        if (!holdemState || holdemState.phase !== 'result') return;
        if (!window.aiPet || window.aiPet.casinoCoins < holdemState.bet) {
            holdemState.notice = `次の参加費に${holdemState.bet}コイン必要です。`;
            renderTexasHoldem();
            return;
        }
        beginRound(holdemState.playerCount, holdemState.bet);
    };

    window.actCasinoTexasHoldem = function (choice) {
        const state = holdemState;
        if (!state || state.phase !== 'decision') return;
        if (choice === 'fold') {
            state.active[0] = false;
            state.logs.push(`あなたは${STAGES[state.stageIndex].name}でフォールド。`);
            resolveShowdown();
            return;
        }
        if (!window.aiPet || window.aiPet.casinoCoins < state.bet) {
            state.notice = `コールには${state.bet}コイン必要です。`;
            renderTexasHoldem();
            return;
        }
        window.aiPet.casinoCoins -= state.bet;
        state.playerSpent += state.bet;
        state.pot += state.bet;
        state.notice = '';
        state.logs.push(`あなたが${state.bet}コインをコール。`);
        cpuBetRound();
        if (!activeCpuPlayers().length) {
            resolveUncontested();
            return;
        }
        if (state.stageIndex >= STAGES.length - 1) {
            resolveShowdown();
            return;
        }
        state.stageIndex++;
        state.revealed = STAGES[state.stageIndex].revealed;
        state.logs.push(`${STAGES[state.stageIndex].name}：${state.community.slice(0, state.revealed).map(cardLabel).join(' ')}`);
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        renderTexasHoldem();
    };

    function renderTexasHoldem() {
        const content = document.getElementById('casino-texas-holdem-content');
        if (!content || !holdemState) return;
        const state = holdemState;
        const revealOpponents = state.phase === 'result';
        const opponents = [];
        for (let player = 1; player < state.playerCount; player++) {
            const folded = !state.active[player];
            const winner = state.winners.includes(player);
            const hidden = !revealOpponents || folded;
            const cards = state.holes[player].map(card => `<span class="th-mini-card">${cardHtml(card, hidden, 34, 48)}</span>`).join('');
            const handName = revealOpponents && state.handResults && state.handResults[player] ? state.handResults[player].name : folded ? 'FOLD' : 'IN PLAY';
            opponents.push(`<div class="th-seat${folded ? ' is-folded' : ''}${winner ? ' is-winner' : ''}"><span class="th-seat-name">${PLAYER_NAMES[player]}<small>${winner ? 'WINNER・' : ''}${handName}</small></span><span class="th-mini-cards">${cards}</span></div>`);
        }
        const slotNames = ['FLOP', 'FLOP', 'FLOP', 'TURN', 'RIVER'];
        const community = state.community.map((card, index) => {
            if (index >= state.revealed) return `<span class="th-empty-card">${slotNames[index]}</span>`;
            const isNew = index >= state.lastRenderedRevealed;
            return `<span class="th-community-card${isNew ? ' is-new' : ''}">${cardHtml(card, false, 56, 80)}</span>`;
        }).join('');
        const playerCards = state.holes[0].map(card => `<span class="th-hole-card">${cardHtml(card, false, 68, 96)}</span>`).join('');
        const visiblePlayerHand = state.revealed >= 3 ? bestHand(state.holes[0].concat(state.community.slice(0, state.revealed))) : null;
        const playerHandName = state.phase === 'result' && !state.active[0] ? 'フォールド' : state.handResults && state.handResults[0] ? state.handResults[0].name : visiblePlayerHand ? visiblePlayerHand.name : 'ホールカード';
        let actions = '';
        if (state.phase === 'decision') {
            const canCall = !!window.aiPet && window.aiPet.casinoCoins >= state.bet;
            const callPrompt = STAGES[state.stageIndex].id === 'river' ? `ショーダウンへ進むには ${state.bet}コインをコール` : `次の共通札を見るには ${state.bet}コインをコール`;
            actions = `<span class="th-call-note">${callPrompt}</span><button type="button" class="th-btn th-btn-primary" onclick="window.actCasinoTexasHoldem('call')" ${canCall ? '' : 'disabled'}>${STAGES[state.stageIndex].id === 'river' ? 'コールしてショーダウン' : 'コール'}</button><button type="button" class="th-btn th-btn-fold" onclick="window.actCasinoTexasHoldem('fold')">フォールド</button>${state.notice || !canCall ? `<span class="th-action-error">${state.notice || `コールに必要な${state.bet}コインがありません。`}</span>` : ''}`;
        } else {
            const title = state.result === 'win' ? 'WIN' : state.result === 'draw' ? 'SPLIT POT' : 'LOSE';
            const winners = state.winners.map(player => PLAYER_NAMES[player]).join('・');
            const resultText = state.resultReason === '全員がフォールド' ? '対戦相手が全員フォールドしました。' : `勝者：${winners} ／ ${state.handResults[state.winners[0]] ? state.handResults[state.winners[0]].name : state.resultReason}`;
            actions = `<div class="th-result"><h3>${title}</h3><strong>${state.netCoins >= 0 ? '+' : ''}${state.netCoins} コイン</strong><p>${resultText}</p>${state.notice ? `<span class="th-action-error">${state.notice}</span>` : ''}<div class="th-result-actions"><button type="button" class="th-btn th-btn-primary" onclick="window.replayCasinoTexasHoldem()">同じ条件ですぐ再戦</button><button type="button" class="th-btn" onclick="window.showCasinoTexasHoldemSetup()">設定を変更</button></div></div>`;
        }
        const stageName = state.phase === 'result' ? state.resultReason : STAGES[state.stageIndex].name;
        content.innerHTML = `<div class="th-round"><div class="th-round-head"><div class="th-head-left"><span class="th-chip">${state.playerCount}人戦</span><span class="th-chip is-stage">${stageName}</span><span class="th-chip">あなたの投資 ${state.playerSpent}</span></div><span class="th-chip">POT ${state.pot}</span></div><div class="th-game-layout"><main class="th-board"><div class="th-opponents">${opponents.join('')}</div><div class="th-table"><span class="th-pot">POT 🪙 ${state.pot}</span><div class="th-community">${community}</div><span class="th-stage-help">COMMUNITY CARDS</span></div><div class="th-you"><span class="th-you-copy"><b>あなた</b><span class="th-player-hand">${playerHandName}</span></span><div class="th-hole-cards">${playerCards}</div></div><div class="th-actions">${actions}</div></main><aside class="th-log"><div class="th-log-head">HAND LOG</div><div class="th-log-body">${state.logs.slice(-28).map(line => `<div class="th-log-line">${line}</div>`).join('')}</div></aside></div></div>`;
        state.lastRenderedRevealed = state.revealed;
    }
})();

// ==========================================
// 免許皆伝後のフレンド・師匠来客
// ==========================================
(function () {
    'use strict';

    const MASTER_NAMES = {
        explore: '冒険家', farming: '農家', fishing: '漁師', cooking: '料理人', building: '建築士',
        smithing: '鍛冶師', pharmacist: '薬剤師', hairdresser: '美容師', pastry_chef: 'パティシエ',
        concierge: 'コンシェルジュ', tailor: '仕立屋', dealer: 'ディーラー',
        fortune_teller: '占い師', scientist: '科学者', salesperson: '販売員'
    };
    const MASTER_SKINS = {
        explore: 'adventurer', farming: 'farmer', fishing: 'fisherman', cooking: 'chef', building: 'builder',
        smithing: 'smith', pharmacist: 'pharmacist', hairdresser: 'hairdresser', pastry_chef: 'pastry_chef',
        concierge: 'concierge', tailor: 'tailor', dealer: 'dealer', fortune_teller: 'fortune_teller',
        scientist: 'scientist', salesperson: 'merchant'
    };
    const VISITOR_SEATS = [
        { x: 4, y: 3, dir: 'up' },
        { x: 8, y: 3, dir: 'up' },
        { x: 12, y: 4, dir: 'left' },
        { x: 3, y: 5, dir: 'right' },
        { x: 10, y: 7, dir: 'up' },
        { x: 4, y: 7, dir: 'up' }
    ];
    const VISITOR_DIALOGUES = {
        explore: '「あら、いいところで会ったわね！　今夜はどの勝負に挑む？　遠慮しないで選びなさい！」',
        farming: '「おお、来てくれたね。勝負も畑と同じで、じっくり育てるのが肝心だよ。今日は何で遊ぼうか？」',
        fishing: '「おう、待ってたぜ！　大物を釣るみてえな勝負をしようじゃねえか。好きなゲームを選びな！」',
        cooking: '「おお、来たな！　勝負の熱も料理の火加減も、最後は度胸だ！　今日は何で競う？」',
        building: '「来たか。どのゲームにも勝ち筋という設計図がある。君の好きな勝負を選んでくれ。」',
        smithing: '「……来たな。勝負で腕を鈍らせるな。……好きなゲームを選べ。」',
        pharmacist: '「おやおや、いらっしゃい。勝負も遊びも適量が一番ですよ。今日はどのゲームになさいますか？」',
        hairdresser: '「やっほ〜！　来てくれたんだ♡　今日はどのゲームで遊ぶ？　いちばんアガるの、選んでねっ！」',
        pastry_chef: '「ボンソワール！　甘い勝利もほろ苦い逆転も大歓迎さ。今夜のゲームを選んでおくれ！」',
        concierge: '「お待ちしておりました。今宵のお相手を務めます。どうぞ、お好みのゲームをお選びくださいませ。」',
        tailor: '「ふふっ、お会いできてうれしいです。勝負の物語も、一手ずつ紡いでまいりましょう。何で遊びますか？」',
        fortune_teller: '「あなたが選ぶ勝負、星々にはもう見えております。けれど運命を決めるのはあなた。さあ、お選びください。」',
        scientist: '「ちょうどいい、対戦データを取りたかったんだ。ゲームは君が選んでくれ。どの仮説でも検証しよう！」',
        salesperson: '「いらっしゃい！　今夜は勝負をひとついかがです？　どのゲームでも、とびきりのお相手をしますよ！」'
    };

    function hash(text) {
        let value = 2166136261;
        String(text || '').split('').forEach(char => {
            value ^= char.charCodeAt(0);
            value = Math.imul(value, 16777619);
        });
        return value >>> 0;
    }

    function stableFriendGame(friend) {
        if (friend && ['poker', 'daifugo', 'tcg'].includes(friend.casinoGame)) return friend.casinoGame;
        return ['poker', 'daifugo', 'tcg'][hash(friend && (friend.id || friend.name)) % 3];
    }

    function masteredDealer() {
        const hero = window.aiPet;
        const app = hero && hero.apprentice;
        return !!(app && ((app.rank && Number(app.rank.dealer) >= 10) || (app.retired && app.retired.dealer)));
    }

    function graduatedMasterTypes() {
        const hero = window.aiPet || {};
        const app = hero.apprentice || {};
        const types = new Set();
        Object.keys(MASTER_NAMES).forEach(type => {
            if ((app.rank && Number(app.rank[type]) >= 10) || (app.retired && app.retired[type])) types.add(type);
        });
        const collection = window.TCG && Array.isArray(window.TCG.myCollection) ? window.TCG.myCollection : [];
        const personMap = window.MASTER_PERSON_CARD_MAP || {};
        Object.keys(personMap).forEach(type => {
            const canonical = type === 'sales' || type === 'shop_clerk' ? 'salesperson' : type === 'fortuneteller' || type === 'fortune' ? 'fortune_teller' : type;
            if (collection.some(card => card && card.masterId === personMap[type])) types.add(canonical);
        });
        types.delete('dealer');
        return [...types].filter(type => MASTER_NAMES[type]);
    }

    function friendList() {
        try {
            const value = JSON.parse(localStorage.getItem('my_friend_list') || '[]');
            return Array.isArray(value) ? value : [];
        } catch (e) {
            return [];
        }
    }

    function visitorCandidates() {
        const candidates = [];
        graduatedMasterTypes().forEach(type => {
            candidates.push({
                id: `master_${type}`,
                kind: 'master',
                masterType: type,
                name: MASTER_NAMES[type],
                skin: MASTER_SKINS[type] || 'robot',
                game: (window.CASINO_MASTER_FAVORITE_GAMES && window.CASINO_MASTER_FAVORITE_GAMES[type]) || 'poker'
            });
        });
        return candidates;
    }

    function shuffle(list) {
        const result = list.slice();
        for (let index = result.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function visitorCellIsBlocked(state, x, y, ignoredVisitor) {
        if (!state || x <= 0 || y <= 0 || x >= state.width - 1 || y >= state.height - 1) return true;
        if (state.grid[y] && state.grid[y][x] === 1) return true;
        if (state.dealer && state.dealer.x === x && state.dealer.y === y) return true;
        if ((state.visitors || []).some(visitor => visitor !== ignoredVisitor && visitor.x === x && visitor.y === y)) return true;
        return (state.objects || []).some(obj => {
            if (!obj || !obj.blocksMovement || obj.installing) return false;
            const width = Math.max(1, Number(obj.w) || 1);
            const height = Math.max(1, Number(obj.h) || 1);
            return x >= obj.x && x < obj.x + width && y >= obj.y && y < obj.y + height;
        });
    }

    function visitorSeatIsOpen(state, seat) {
        if (visitorCellIsBlocked(state, seat.x, seat.y, null)) return false;
        return [[0, 1], [-1, 0], [1, 0], [0, -1]].some(([dx, dy]) => !visitorCellIsBlocked(state, seat.x + dx, seat.y + dy, null));
    }

    window.refreshCasinoVisitors = function (state) {
        if (!state) return [];
        if (!masteredDealer()) {
            state.visitors = [];
            return state.visitors;
        }
        const candidates = shuffle(visitorCandidates()).slice(0, 3);
        state.visitors = [];
        const seats = shuffle(VISITOR_SEATS.filter(seat => visitorSeatIsOpen(state, seat)));
        state.visitors = candidates.slice(0, seats.length).map((visitor, index) => Object.assign({}, visitor, seats[index]));
        return state.visitors;
    };

    function findVisitorStop(visitor, state) {
        const candidates = [
            { x: visitor.x, y: visitor.y + 1, dir: 'up' },
            { x: visitor.x - 1, y: visitor.y, dir: 'right' },
            { x: visitor.x + 1, y: visitor.y, dir: 'left' },
            { x: visitor.x, y: visitor.y - 1, dir: 'down' }
        ];
        return candidates.find(pos => !visitorCellIsBlocked(state, pos.x, pos.y, visitor)) || candidates[0];
    }

    window.interactCasinoVisitor = function (visitorId) {
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        const visitor = state && state.visitors ? state.visitors.find(entry => entry.id === visitorId) : null;
        if (!visitor) return;
        const stop = findVisitorStop(visitor, state);
        window.moveCasinoPlayerTo(stop.x, stop.y, () => {
            state.player.dir = stop.dir;
            visitor.dir = stop.dir === 'up' ? 'down' : stop.dir === 'down' ? 'up' : stop.dir === 'left' ? 'right' : 'left';
            if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
            window.openCasinoVisitorConversation(visitor);
        });
    };

    window.getCasinoVisitorGameAvailability = function () {
        const hero = window.aiPet || {};
        const app = hero.apprentice || {};
        const rank = app.rank ? Number(app.rank.dealer) || 0 : 0;
        const progress = typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero)
            : (hero.dealerProgress || {});
        const ownsTrump = Object.keys(progress.purchasedTrumpDecks || {}).length > 0;
        const isMastered = masteredDealer();
        const guestDeck = typeof window.createMasterFixedTCGDeck === 'function' ? window.createMasterFixedTCGDeck('dealer') : [];
        return {
            poker: ownsTrump && (isMastered || !!progress.pokerUnlocked || rank >= 3),
            daifugo: ownsTrump && (isMastered || !!progress.daifugoUnlocked || rank >= 5),
            tcg: (isMastered || rank >= 7) && guestDeck.length >= 60,
            slot: isMastered && typeof window.canStartCasinoSlotMasterBattle === 'function' && window.canStartCasinoSlotMasterBattle()
        };
    };

    window.openCasinoVisitorConversation = function (visitor) {
        if (!visitor || !visitor.masterType || typeof window.openEncounterUI !== 'function') return false;
        window._activeCasinoVisitorId = visitor.id;
        if (typeof window.recordCasinoMasterConversation === 'function') {
            window.recordCasinoMasterConversation(visitor.masterType);
        }
        const message = VISITOR_DIALOGUES[visitor.masterType] || `「来てくれてうれしいよ。今日はどのゲームで遊ぼうか？」`;
        window.openEncounterUI(visitor.masterType, message, 'casino_visitor_game');
        return true;
    };

    window.closeCasinoVisitorConversation = function () {
        window._activeCasinoVisitorId = null;
        if (typeof window.confirmEncounter === 'function') window.confirmEncounter(false);
    };

    window.chooseCasinoVisitorGame = function (game) {
        const state = typeof window.ensureCasinoIndoorState === 'function' ? window.ensureCasinoIndoorState() : null;
        const visitor = state && Array.isArray(state.visitors)
            ? state.visitors.find(entry => entry && entry.id === window._activeCasinoVisitorId)
            : null;
        const availability = window.getCasinoVisitorGameAvailability();
        if (!visitor || !availability[game]) {
            if (typeof window.addCasinoLog === 'function') window.addCasinoLog('そのゲームは、まだ対戦の準備ができていません。');
            return false;
        }
        window._activeCasinoVisitorId = null;
        if (typeof window.confirmEncounter === 'function') window.confirmEncounter(false);
        setTimeout(() => {
            const casinoUi = document.getElementById('casino-map-ui');
            if (casinoUi) casinoUi.style.zIndex = '8990';
            if (window.aiPet) {
                window.aiPet.actionState = 'inside';
                window.aiPet.isIndoors = true;
                window.aiPet.indoorTarget = { type: 'casino', name: 'カジノ' };
            }
            window.isGamePaused = false;
            window.startCasinoVisitorGame(visitor, game);
        }, 0);
        return true;
    };

    window.startCasinoVisitorGame = function (visitor, selectedGame) {
        if (!visitor) return;
        const game = ['poker', 'daifugo', 'tcg', 'slot'].includes(selectedGame) ? selectedGame : visitor.game;
        if (game !== 'slot' && typeof window.setCasinoCardGameContext === 'function') {
            window.setCasinoCardGameContext({ source: 'conversation', lockedVisitors: [Object.assign({}, visitor)] });
        }
        if (game === 'poker') {
            window._casinoPreferredPokerOpponent = visitor.id;
            if (typeof window.openCasinoPoker === 'function') window.openCasinoPoker();
        } else if (game === 'daifugo') {
            window._casinoDaifugoOpponentName = visitor.name;
            if (typeof window.openCasinoDaifugo === 'function') window.openCasinoDaifugo();
        } else if (game === 'tcg') {
            const deck = typeof window.createMasterFixedTCGDeck === 'function' ? window.createMasterFixedTCGDeck(visitor.masterType) : [];
            if (typeof window.startCasinoGuestTCGBattle === 'function') window.startCasinoGuestTCGBattle(visitor, deck);
        } else if (game === 'slot') {
            if (typeof window.openCasinoSlotBattleLobby === 'function') {
                window.openCasinoSlotBattleLobby({ preferredMasterType: visitor.masterType });
            }
        }
    };

    window.renderCasinoVisitors = function (grid, state, characterFactory, resolveKey) {
        if (!grid || !state || !Array.isArray(state.visitors)) return;
        state.visitors.forEach(visitor => {
            const spriteKey = resolveKey(visitor.skin, visitor.dir || 'down');
            const sprite = characterFactory(spriteKey, visitor.x, visitor.y, 'casino-visitor');
            if (sprite) grid.appendChild(sprite);
        });
    };

    window.renderCasinoVisitorHUD = function (state) {
        const hud = document.getElementById('casino-visitor-hud');
        if (!hud) return;
        const visitors = state && Array.isArray(state.visitors) ? state.visitors : [];
        const names = hud.querySelector('[data-casino-visitor-names]');
        if (!names) return;
        names.textContent = visitors.length ? visitors.map(visitor => visitor.name).join('・') : 'なし';
    };

    window.openCasinoVisitorSettings = function () {
        const friends = friendList();
        const old = document.getElementById('casino-visitor-settings-ui');
        if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.id = 'casino-visitor-settings-ui';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:130000;background:rgba(0,0,0,.84);display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';
        const rows = friends.map(friend => {
            const selected = stableFriendGame(friend);
            return `<label style="display:grid;grid-template-columns:1fr 180px;gap:10px;align-items:center;padding:10px;border-bottom:1px solid #4d3038;"><span>${friend.name || friend.id || 'フレンド'}</span><select data-friend-game="${String(friend.id || '')}" style="padding:8px;"><option value="poker" ${selected === 'poker' ? 'selected' : ''}>ポーカー</option><option value="daifugo" ${selected === 'daifugo' ? 'selected' : ''}>大富豪</option><option value="tcg" ${selected === 'tcg' ? 'selected' : ''}>TCG</option></select></label>`;
        }).join('');
        overlay.innerHTML = `<div style="width:min(620px,92vw);max-height:86vh;overflow:auto;background:#211018;border:3px solid #c89939;border-radius:14px;padding:22px;"><h2 style="margin-top:0;color:#ffd56a;">来客の得意ゲーム設定</h2><p>未設定のフレンドはIDから固定選出され、来店ごとに変わりません。師匠の得意ゲームは性格に合わせて固定されています。</p>${rows || '<p>登録済みフレンドはいません。</p>'}<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;"><button onclick="document.getElementById('casino-visitor-settings-ui').remove()">キャンセル</button><button onclick="window.saveCasinoVisitorSettings()">保存</button></div></div>`;
        document.body.appendChild(overlay);
    };

    window.saveCasinoVisitorSettings = function () {
        const friends = friendList();
        document.querySelectorAll('[data-friend-game]').forEach(select => {
            const friend = friends.find(entry => String(entry.id || '') === select.dataset.friendGame);
            if (friend) friend.casinoGame = select.value;
        });
        localStorage.setItem('my_friend_list', JSON.stringify(friends));
        if (typeof window.renderCasinoMap === 'function') window.renderCasinoMap();
        const ui = document.getElementById('casino-visitor-settings-ui');
        if (ui) ui.remove();
        if (typeof window.saveGameData === 'function') window.saveGameData();
    };
})();

// ==========================================
// カジノ屋内マップ・ショップ・経路探索
// ==========================================
(function () {
    'use strict';

    const TILE = 96;
    const MAP_W = 14;
    const MAP_H = 10;
    const ENTRANCE = { x: 6, y: 8, dir: 'up' };
    let movementTimer = null;
    let currentPath = [];

    window.CASINO_SPRITES = window.CASINO_SPRITES || {
        cmap_floor: { img: 'casino_mapchip.png', sx: 6, sy: 75, sw: 345, sh: 161, scale: 1 },
        cmap_wall: { img: 'casino_mapchip.png', sx: 7, sy: 410, sw: 345, sh: 250, scale: 1 },
        // デバッグ調整済みの分割値。各パーツは独立して再調整できる。
        cfur_poker_table_left: { img: 'casino_game_mapchip.png', sx: 729, sy: 45, sw: 537, sh: 759, scale: 1 },
        cfur_poker_table_middle: { img: 'casino_game_mapchip.png', sx: 1424, sy: 45, sw: 537, sh: 759, scale: 1 },
        cfur_poker_table_right: { img: 'casino_game_mapchip.png', sx: 2176, sy: 45, sw: 537, sh: 759, scale: 1 },
        cfur_tcg_table_left: { img: 'casino_game_mapchip.png', sx: 105, sy: 852, sw: 598, sh: 635, scale: 1 },
        cfur_tcg_table_right: { img: 'casino_game_mapchip.png', sx: 695, sy: 852, sw: 598, sh: 635, scale: 1 },
        cfur_chair_down: { img: 'casino_game_mapchip.png', sx: 1437, sy: 866, sw: 348, sh: 620, scale: 1 },
        cfur_chair_side: { img: 'casino_game_mapchip.png', sx: 1882, sy: 866, sw: 348, sh: 620, scale: 1 },
        cfur_chair_up: { img: 'casino_game_mapchip.png', sx: 2289, sy: 866, sw: 348, sh: 620, scale: 1 },
        cfur_slot_machine: { img: 'casino_game_mapchip.png', sx: 115, sy: 25, sw: 540, sh: 730, scale: 1.2 }
    };

    const BASE_SPECIES = ['robot', 'spirit', 'magician', 'stone', 'balloon', 'bird', 'beetle', 'seed', 'ghost', 'machine', 'dragon'];
    const SPECIES_NAMES = {
        robot: 'ロボット', spirit: 'スピリット', magician: 'マジシャン', stone: 'ストーン',
        balloon: 'バルーン', bird: 'バード', beetle: 'ビートル', seed: 'シード',
        ghost: 'ゴースト', machine: 'マシン', dragon: 'ドラゴン'
    };
    const CASINO_EQUIPMENT_CATALOG = {
        slot_machine: {
            name: 'スロット台', icon: '🎰', price: 150, w: 1, h: 1, blocksMovement: true,
            spriteKey: 'cfur_slot_machine',
            desc: '5列の目押し対応スロット。設置後に「スロット」と話すと遊べます。'
        },
        poker_table: {
            name: 'ポーカーテーブル', icon: '♠️', price: 100, w: 3, h: 1, blocksMovement: true,
            spriteKeys: ['cfur_poker_table_left', 'cfur_poker_table_middle', 'cfur_poker_table_right'],
            desc: 'トランプゲーム用の3マステーブルです。'
        },
        tcg_table: {
            name: 'TCGテーブル', icon: '✦', price: 80, w: 2, h: 1, blocksMovement: true,
            spriteKeys: ['cfur_tcg_table_left', 'cfur_tcg_table_right'],
            desc: 'TCGバトル用の2マステーブルです。'
        },
        casino_chair: {
            name: 'カジノの椅子', icon: '🪑', price: 15, w: 1, h: 1, blocksMovement: false,
            spriteKey: 'cfur_chair_down',
            desc: '最も近いテーブルまたはスロット台へ向けて置く1マスの椅子です。'
        }
    };
    window.CASINO_EQUIPMENT_CATALOG = CASINO_EQUIPMENT_CATALOG;
    const TRUMP_SHEETS = {
        heart: 'trump_heart.png', dia: 'trump_dia.png', club: 'trump_club.png',
        spade: 'trump_spade.png', joker_and_back: 'trump_joker_and_back.png'
    };
    const TRUMP_CARD_CROPS = {
        14: { sx: 197, sy: 102, sw: 326, sh: 435 },
        2: { sx: 548, sy: 102, sw: 326, sh: 435 },
        3: { sx: 1247, sy: 102, sw: 326, sh: 435 },
        4: { sx: 1595, sy: 102, sw: 326, sh: 435 },
        5: { sx: 1944, sy: 102, sw: 326, sh: 435 },
        6: { sx: 548, sy: 558, sw: 326, sh: 435 },
        7: { sx: 898, sy: 558, sw: 326, sh: 435 },
        8: { sx: 1247, sy: 558, sw: 326, sh: 435 },
        9: { sx: 1595, sy: 558, sw: 326, sh: 435 },
        10: { sx: 2295, sy: 558, sw: 326, sh: 435 },
        11: { sx: 898, sy: 1010, sw: 326, sh: 435 },
        12: { sx: 1247, sy: 1010, sw: 326, sh: 435 },
        13: { sx: 1595, sy: 1010, sw: 326, sh: 435 }
    };
    const TRUMP_SPECIAL_CROPS = {
        joker: { sx: 896, sy: 102, sw: 326, sh: 435 },
        back: { sx: 1246, sy: 102, sw: 326, sh: 435 }
    };

    window.CASINO_TRUMP_SPRITES = window.CASINO_TRUMP_SPRITES || {};
    BASE_SPECIES.forEach(species => {
        Object.keys(TRUMP_SHEETS).forEach(suit => {
            const key = `ctrump_${species}_${suit}`;
            if (!window.CASINO_TRUMP_SPRITES[key]) {
                window.CASINO_TRUMP_SPRITES[key] = {
                    img: `${species}_${TRUMP_SHEETS[suit]}`,
                    fallbackImg: `robot_${TRUMP_SHEETS[suit]}`,
                    sx: 0, sy: 0, sw: 2816, sh: 1536, scale: 1,
                    species, suit
                };
            }
        });
        ['heart', 'dia', 'club', 'spade'].forEach(suit => {
            Object.entries(TRUMP_CARD_CROPS).forEach(([rank, crop]) => {
                const key = `ctrump_${species}_${suit}_${rank}`;
                if (!window.CASINO_TRUMP_SPRITES[key]) {
                    window.CASINO_TRUMP_SPRITES[key] = Object.assign({
                        img: `${species}_${TRUMP_SHEETS[suit]}`,
                        fallbackImg: `robot_${TRUMP_SHEETS[suit]}`,
                        imageW: 2816, imageH: 1536, scale: 1, species, suit, rank: Number(rank)
                    }, crop);
                }
            });
        });
        Object.entries(TRUMP_SPECIAL_CROPS).forEach(([kind, crop]) => {
            const key = `ctrump_${species}_${kind}`;
            if (!window.CASINO_TRUMP_SPRITES[key]) {
                window.CASINO_TRUMP_SPRITES[key] = Object.assign({
                    img: `${species}_${TRUMP_SHEETS.joker_and_back}`,
                    fallbackImg: `robot_${TRUMP_SHEETS.joker_and_back}`,
                    imageW: 2816, imageH: 1536, scale: 1, species, suit: 'joker_and_back', kind
                }, crop);
            }
        });
    });
    Object.assign(window.CASINO_SPRITES, window.CASINO_TRUMP_SPRITES);
    window.selectedCasinoSpriteKey = window.selectedCasinoSpriteKey || 'cfur_poker_table_left';

    function activeTrumpSpecies() {
        const progress = typeof window.ensureDealerCasinoState === 'function' ? window.ensureDealerCasinoState(window.aiPet) : null;
        const species = progress && progress.activeTrumpSpecies;
        return BASE_SPECIES.includes(species) ? species : 'robot';
    }

    window.getCasinoTrumpCardSprite = function (card, hidden, speciesOverride) {
        const species = BASE_SPECIES.includes(speciesOverride) ? speciesOverride : activeTrumpSpecies();
        const rank = Number(card && card.rank);
        // 大富豪では強さ計算上「2」を15として扱うが、画像表では通常どおり2の位置を使う。
        const spriteRank = rank === 15 ? 2 : rank;
        let key;
        if (hidden) key = `ctrump_${species}_back`;
        else if (card && (card.joker || rank === 16)) key = `ctrump_${species}_joker`;
        else key = `ctrump_${species}_${card && card.suit}_${spriteRank}`;
        return window.CASINO_TRUMP_SPRITES[key] || window.CASINO_TRUMP_SPRITES[key.replace(`ctrump_${species}_`, 'ctrump_robot_')] || null;
    };

    window.renderCasinoTrumpCard = function (card, options) {
        options = options || {};
        const width = Math.max(24, Number(options.width) || 82);
        const height = Math.max(34, Number(options.height) || 116);
        const sprite = window.getCasinoTrumpCardSprite(card, !!options.hidden, options.species);
        if (!sprite) return `<div style="width:${width}px;height:${height}px;border-radius:8px;background:#fff;"></div>`;
        const scaleX = width / Math.max(1, Number(sprite.sw) || 1);
        const scaleY = height / Math.max(1, Number(sprite.sh) || 1);
        const imgW = (Number(sprite.imageW) || 2816) * scaleX * (Number(sprite.scale) || 1);
        const imgH = (Number(sprite.imageH) || 1536) * scaleY * (Number(sprite.scale) || 1);
        const left = -(Number(sprite.sx) || 0) * scaleX;
        const top = -(Number(sprite.sy) || 0) * scaleY;
        return `<span style="display:block;position:relative;width:${width}px;height:${height}px;overflow:hidden;border-radius:8px;background:#fff;"><img src="${sprite.img}" onerror="this.onerror=null;this.src='${sprite.fallbackImg}'" style="position:absolute;left:${left}px;top:${top}px;width:${imgW}px;height:${imgH}px;max-width:none;pointer-events:none;user-select:none;"></span>`;
    };

    function makeGrid() {
        const grid = [];
        for (let y = 0; y < MAP_H; y++) {
            const row = [];
            for (let x = 0; x < MAP_W; x++) {
                const edge = x === 0 || x === MAP_W - 1 || y === 0 || y === MAP_H - 1;
                row.push(edge ? 1 : 0);
            }
            grid.push(row);
        }
        grid[MAP_H - 1][6] = 0;
        grid[MAP_H - 1][7] = 0;
        return grid;
    }

    function defaultObjects() {
        return [
            { id: 'poker_table', equipmentType: 'poker_table', builtIn: true, keys: ['cfur_poker_table_left', 'cfur_poker_table_middle', 'cfur_poker_table_right'], x: 5, y: 2, w: 3, h: 1, name: 'ポーカーテーブル', blocksMovement: true },
            { id: 'tcg_table', equipmentType: 'tcg_table', builtIn: true, keys: ['cfur_tcg_table_left', 'cfur_tcg_table_right'], x: 10, y: 4, w: 2, h: 1, name: 'TCGテーブル', blocksMovement: true },
            { id: 'poker_chair', equipmentType: 'casino_chair', builtIn: true, key: 'cfur_chair_up', x: 6, y: 3, w: 1, h: 1, name: 'ポーカー席', facing: 'up', blocksMovement: false },
            { id: 'tcg_chair', equipmentType: 'casino_chair', builtIn: true, key: 'cfur_chair_side', x: 9, y: 4, w: 1, h: 1, name: 'TCG席', facing: 'right', flipX: false, blocksMovement: false }
        ];
    }

    window.ensureCasinoIndoorState = function () {
        const casino = typeof window.getCasinoAsset === 'function' ? window.getCasinoAsset() : null;
        const host = casino || window.aiPet;
        if (!host) return null;
        if (!host.casinoIndoor || typeof host.casinoIndoor !== 'object') {
            host.casinoIndoor = {
                version: 1,
                width: MAP_W,
                height: MAP_H,
                grid: makeGrid(),
                player: Object.assign({}, ENTRANCE),
                dealer: { x: 6, y: 1, dir: 'down' },
                objects: defaultObjects(),
                nextEquipmentId: 1,
                visitors: [],
                logs: []
            };
        }
        const state = host.casinoIndoor;
        if (!Array.isArray(state.grid) || !state.grid.length) state.grid = makeGrid();
        state.width = MAP_W;
        state.height = MAP_H;
        if (!state.player) state.player = Object.assign({}, ENTRANCE);
        if (!state.dealer) state.dealer = { x: 6, y: 1, dir: 'down' };
        state.nextEquipmentId = Math.max(1, Math.floor(Number(state.nextEquipmentId) || 1));
        if (!Array.isArray(state.objects)) state.objects = [];
        state.objects.forEach(obj => {
            if (obj && obj.installing && window._casinoInstallingEquipmentId !== obj.id) delete obj.installing;
            if (obj && obj.equipmentType === 'slot_machine') {
                obj.key = 'cfur_slot_machine';
                delete obj.keys;
                delete obj.textIcon;
            }
        });
        // 旧セーブに残る独立売り場も撤去し、購入導線はディーラー会話へ一本化する。
        state.objects = state.objects.filter(obj => obj
            && !['coin_counter', 'trump_counter'].includes(obj.id)
            && !['neon_sign', 'lounge_sofa', 'coin_monument'].includes(obj.equipmentType));
        if (!Array.isArray(state.visitors)) state.visitors = [];
        if (!Array.isArray(state.logs)) state.logs = [];
        const existing = new Map(state.objects.filter(Boolean).map(obj => [obj.id, obj]));
        defaultObjects().forEach(obj => {
            if (!existing.has(obj.id)) state.objects.push(obj);
            else {
                const saved = existing.get(obj.id);
                saved.equipmentType = obj.equipmentType;
                saved.builtIn = true;
                saved.name = obj.name;
                saved.w = obj.w;
                saved.h = obj.h;
                saved.blocksMovement = obj.blocksMovement;
                if (obj.keys) {
                    saved.keys = obj.keys.slice();
                    delete saved.key;
                } else {
                    saved.key = obj.key;
                    delete saved.keys;
                }
                if (obj.facing) saved.facing = obj.facing;
                if (Object.prototype.hasOwnProperty.call(obj, 'flipX')) saved.flipX = obj.flipX;
            }
        });
        return state;
    };

    function spriteDiv(key, obj) {
        const sp = window.CASINO_SPRITES[key];
        if (!sp) return null;
        const widthTiles = Math.max(1, Number(obj.w) || 1);
        const heightTiles = Math.max(1, Number(obj.h) || 1);
        const partCount = Math.max(1, Number(obj.partCount) || 1);
        const displayW = widthTiles * TILE;
        const baseDisplayH = Math.max(TILE, heightTiles * TILE + (key.startsWith('cfur_poker_table') ? 34 : 10));
        // 分割テーブルは各切り抜きの全幅がちょうど1マスに入る高さを確保し、継ぎ目を合わせる。
        const displayH = partCount > 1
            ? Math.max(baseDisplayH, Math.ceil(displayW * Math.max(1, sp.sh) / Math.max(1, sp.sw)))
            : baseDisplayH;
        const wrapper = document.createElement('div');
        const inner = document.createElement('div');
        const fit = Math.min(displayW / Math.max(1, sp.sw), displayH / Math.max(1, sp.sh));
        wrapper.className = 'casino-sprite';
        wrapper.style.cssText = `position:absolute;left:${obj.x * TILE}px;top:${obj.y * TILE - Math.max(0, displayH - heightTiles * TILE)}px;width:${displayW}px;height:${displayH}px;overflow:visible;z-index:${500 + obj.y * 10};pointer-events:none;`;
        const renderScale = fit * (sp.scale || 1);
        inner.style.cssText = `position:absolute;left:50%;bottom:0;margin-left:${-Math.max(1, sp.sw) / 2}px;width:${sp.sw}px;height:${sp.sh}px;flex-shrink:0;background-image:url('${sp.img}');background-position:-${sp.sx || 0}px -${sp.sy || 0}px;background-repeat:no-repeat;transform:scale(${obj.flipX ? -renderScale : renderScale},${renderScale});transform-origin:bottom center;image-rendering:auto;`;
        wrapper.appendChild(inner);
        return wrapper;
    }

    function tileSpriteDiv(key, x, y, fallback) {
        const sp = window.CASINO_SPRITES[key];
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `position:absolute;left:${x * TILE}px;top:${y * TILE}px;width:${TILE}px;height:${TILE}px;overflow:hidden;background:${fallback};z-index:${key === 'cmap_wall' ? 20 : 1};pointer-events:none;`;
        if (!sp) return wrapper;
        const inner = document.createElement('div');
        const scaleX = TILE / Math.max(1, Number(sp.sw) || 1);
        const scaleY = TILE / Math.max(1, Number(sp.sh) || 1);
        inner.style.cssText = `position:absolute;left:0;top:0;width:${sp.sw}px;height:${sp.sh}px;background-image:url('${sp.img}');background-position:-${sp.sx || 0}px -${sp.sy || 0}px;background-repeat:no-repeat;transform:scale(${scaleX * (sp.scale || 1)},${scaleY * (sp.scale || 1)});transform-origin:top left;image-rendering:auto;`;
        wrapper.appendChild(inner);
        return wrapper;
    }

    function resolveCharacterKey(skin, dir) {
        const base = String(skin || 'robot').split('_')[0];
        const keys = [`${skin}_${dir}`, `${base}_${dir}`, `robot_${dir}`];
        return keys.find(key => window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[key]) || null;
    }

    function characterDiv(spriteKey, x, y, className, pet) {
        const sp = window.DUNGEON_SPRITES && window.DUNGEON_SPRITES[spriteKey];
        if (!sp || typeof window.createDungeonSprite !== 'function') return null;
        const div = window.createDungeonSprite(spriteKey, 2000 + y * 20, 1, false, TILE);
        if (!div) return null;
        const w = Math.max(1, sp.sw || 64);
        const h = Math.max(1, sp.sh || 64);
        const baseScale = Number(sp.scale) || 1;
        const visualFit = Math.min(1, (TILE * 1.2) / (w * baseScale), (TILE * 1.9) / (h * baseScale));
        const inner = div.firstElementChild;
        if (inner) {
            inner.style.transform = `scale(${baseScale * visualFit})`;
            inner.style.transformOrigin = 'bottom center';
        }
        div.className = className;
        div.style.position = 'absolute';
        div.style.left = `${x * TILE + (TILE - w) / 2}px`;
        div.style.top = `${y * TILE + TILE - h}px`;
        div.style.alignItems = 'flex-end';
        div.style.zIndex = String(2000 + y * 20);
        div.style.pointerEvents = 'none';
        if (pet && typeof window.applyDungeonWalkCosmetics === 'function') window.applyDungeonWalkCosmetics(div, pet, spriteKey);
        return div;
    }

    function clearCasinoPlayerBubble(state) {
        if (!state || !state.player) return;
        delete state.player.speechText;
        delete state.player.speechColor;
        delete state.player.speechUntil;
        delete state.player.speechSticky;
    }

    function showCasinoPlayerBubble(text, color, duration, sticky) {
        const state = window.ensureCasinoIndoorState();
        if (!state || !state.player) return;
        if (window._casinoSpeechTimer) {
            clearTimeout(window._casinoSpeechTimer);
            window._casinoSpeechTimer = null;
        }
        state.player.speechText = String(text || '');
        state.player.speechColor = color || '#00bcd4';
        state.player.speechSticky = !!sticky;
        state.player.speechUntil = sticky ? 0 : Date.now() + Math.max(1200, Number(duration) || 3600);
        state.player.speechToken = Math.max(0, Number(state.player.speechToken) || 0) + 1;
        const token = state.player.speechToken;
        if (typeof renderCasinoMap === 'function') renderCasinoMap();
        if (!sticky) {
            window._casinoSpeechTimer = setTimeout(() => {
                const latest = window.ensureCasinoIndoorState();
                if (!latest || !latest.player || latest.player.speechToken !== token) return;
                clearCasinoPlayerBubble(latest);
                window._casinoSpeechTimer = null;
                if (window.casinoMapOpen && typeof renderCasinoMap === 'function') renderCasinoMap();
            }, Math.max(1200, Number(duration) || 3600));
        }
    }
    window.showCasinoPlayerBubble = showCasinoPlayerBubble;

    function attachCasinoPlayerBubble(charaDiv, player) {
        if (!charaDiv || !player || !player.speechText) return;
        if (!player.speechSticky && player.speechUntil && player.speechUntil < Date.now()) {
            clearCasinoPlayerBubble({ player });
            return;
        }
        const bubble = document.createElement('div');
        const safeText = String(player.speechText)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        bubble.dataset.casinoBubble = 'true';
        bubble.innerHTML = `<div style="font-size:22px;line-height:1.45;color:#111;text-align:left;font-weight:bold;">${safeText}</div>`;
        bubble.style.cssText = `position:absolute;bottom:calc(100% + 3px);left:50%;transform:translateX(calc(-50% + 115px));transform-origin:bottom center;width:360px;max-width:360px;background:#fff;border:4px solid ${player.speechColor || '#00bcd4'};border-radius:16px;padding:16px 18px;box-sizing:border-box;box-shadow:0 6px 16px rgba(0,0,0,.5);z-index:9999;pointer-events:none;`;
        charaDiv.appendChild(bubble);
    }

    function objectCells(obj) {
        const cells = [];
        for (let y = obj.y; y < obj.y + (Number(obj.h) || 1); y++) {
            for (let x = obj.x; x < obj.x + (Number(obj.w) || 1); x++) cells.push(`${x},${y}`);
        }
        return cells;
    }

    function blockedCells(state) {
        const blocked = new Set();
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) if (state.grid[y] && state.grid[y][x] === 1) blocked.add(`${x},${y}`);
        }
        state.objects.filter(obj => obj && obj.blocksMovement).forEach(obj => objectCells(obj).forEach(cell => blocked.add(cell)));
        if (state.dealer) blocked.add(`${state.dealer.x},${state.dealer.y}`);
        (state.visitors || []).forEach(visitor => blocked.add(`${visitor.x},${visitor.y}`));
        return blocked;
    }

    function findPath(state, start, goal, extraBlocked) {
        const blocked = blockedCells(state);
        if (extraBlocked && typeof extraBlocked.forEach === 'function') {
            extraBlocked.forEach(cell => blocked.add(cell));
        }
        blocked.delete(`${start.x},${start.y}`);
        blocked.delete(`${goal.x},${goal.y}`);
        const queue = [{ x: start.x, y: start.y }];
        const previous = new Map([[`${start.x},${start.y}`, null]]);
        while (queue.length) {
            const current = queue.shift();
            if (current.x === goal.x && current.y === goal.y) break;
            [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
                const nx = current.x + dx;
                const ny = current.y + dy;
                const key = `${nx},${ny}`;
                if (nx < 1 || ny < 1 || nx >= state.width - 1 || ny >= state.height || blocked.has(key) || previous.has(key)) return;
                previous.set(key, `${current.x},${current.y}`);
                queue.push({ x: nx, y: ny });
            });
        }
        const goalKey = `${goal.x},${goal.y}`;
        if (!previous.has(goalKey)) return [];
        const path = [];
        let cursor = goalKey;
        while (cursor) {
            const [x, y] = cursor.split(',').map(Number);
            path.unshift({ x, y });
            cursor = previous.get(cursor);
        }
        path.shift();
        return path;
    }

    function faceDirection(from, to) {
        if (to.x > from.x) return 'right';
        if (to.x < from.x) return 'left';
        if (to.y > from.y) return 'down';
        return 'up';
    }

    window.moveCasinoPlayerTo = function (x, y, onArrive) {
        const state = window.ensureCasinoIndoorState();
        if (!state) return false;
        if (movementTimer) clearInterval(movementTimer);
        currentPath = findPath(state, state.player, { x, y });
        if (!currentPath.length && (state.player.x !== x || state.player.y !== y)) {
            addLog('そこへは移動できないみたい。');
            return false;
        }
        const finish = () => {
            if (movementTimer) clearInterval(movementTimer);
            movementTimer = null;
            currentPath = [];
            renderCasinoMap();
            if (typeof onArrive === 'function') onArrive();
        };
        if (!currentPath.length) {
            finish();
            return true;
        }
        movementTimer = setInterval(() => {
            const next = currentPath.shift();
            if (!next) return finish();
            state.player.dir = faceDirection(state.player, next);
            state.player.x = next.x;
            state.player.y = next.y;
            renderCasinoMap();
            if (!currentPath.length) finish();
        }, 180);
        return true;
    };

    function dealerMasteredForEquipment(hero) {
        hero = hero || window.aiPet;
        const app = hero && hero.apprentice;
        return !!(app && ((app.rank && Number(app.rank.dealer) >= 10) || (app.retired && app.retired.dealer)));
    }
    window.isDealerCasinoEquipmentUnlocked = dealerMasteredForEquipment;

    function placedCasinoEquipment(state, type) {
        return (state && Array.isArray(state.objects) ? state.objects : []).filter(obj => obj && obj.equipmentType === type && !obj.installing);
    }

    function placedPurchasedCasinoEquipment(state, type) {
        return placedCasinoEquipment(state, type).filter(obj => !obj.builtIn);
    }

    function purchasedCasinoEquipmentCount(type) {
        const progress = typeof window.ensureDealerCasinoState === 'function' ? window.ensureDealerCasinoState(window.aiPet) : null;
        return progress ? Math.max(0, Math.floor(Number(progress.purchasedCasinoEquipment[type]) || 0)) : 0;
    }

    function unplacedCasinoEquipmentCount(state, type) {
        return Math.max(0, purchasedCasinoEquipmentCount(type) - placedPurchasedCasinoEquipment(state, type).length);
    }

    function isCasinoPlacementAreaFree(state, target) {
        if (!state || !target) return false;
        const reservedStops = new Set(['4,3', '8,3', '12,4']);
        const occupiedObjects = state.objects || [];
        return objectCells(target).every(cell => {
            const [x, y] = cell.split(',').map(Number);
            if (x < 1 || y < 1 || x >= state.width - 1 || y >= state.height - 1) return false;
            if (state.grid[y] && state.grid[y][x] === 1) return false;
            if (reservedStops.has(cell)) return false;
            if (state.player && state.player.x === x && state.player.y === y) return false;
            if (state.dealer && state.dealer.x === x && state.dealer.y === y) return false;
            if ((state.visitors || []).some(visitor => visitor && visitor.x === x && visitor.y === y)) return false;
            return !occupiedObjects.some(obj => obj && objectCells(obj).includes(cell));
        });
    }

    function faceTowardCell(stop, target) {
        const width = Math.max(1, Number(target.w) || 1);
        const height = Math.max(1, Number(target.h) || 1);
        if (stop.x < target.x) return 'right';
        if (stop.x >= target.x + width) return 'left';
        if (stop.y < target.y) return 'down';
        return 'up';
    }

    function reachableCasinoEquipmentStop(state, target, reserveTarget) {
        const width = Math.max(1, Number(target.w) || 1);
        const height = Math.max(1, Number(target.h) || 1);
        const candidates = [];
        for (let x = target.x; x < target.x + width; x++) {
            candidates.push({ x, y: target.y + height });
            candidates.push({ x, y: target.y - 1 });
        }
        for (let y = target.y; y < target.y + height; y++) {
            candidates.push({ x: target.x - 1, y });
            candidates.push({ x: target.x + width, y });
        }
        let best = null;
        const seen = new Set();
        candidates.forEach(stop => {
            const stopKey = `${stop.x},${stop.y}`;
            if (seen.has(stopKey)) return;
            seen.add(stopKey);
            if (stop.x < 1 || stop.y < 1 || stop.x >= state.width - 1 || stop.y >= state.height - 1) return;
            const occupied = blockedCells(state);
            occupied.delete(`${state.player.x},${state.player.y}`);
            if (occupied.has(stopKey)) return;
            const extra = reserveTarget ? new Set(objectCells(target)) : null;
            const path = findPath(state, state.player, stop, extra);
            if (!path.length && (state.player.x !== stop.x || state.player.y !== stop.y)) return;
            if (!best || path.length < best.path.length) {
                best = { stop: Object.assign({ dir: faceTowardCell(stop, target) }, stop), path };
            }
        });
        return best;
    }

    function randomReachableCasinoEquipment(state, type) {
        const reachable = placedCasinoEquipment(state, type)
            .filter(obj => reachableCasinoEquipmentStop(state, obj, false));
        return reachable.length ? reachable[Math.floor(Math.random() * reachable.length)] : null;
    }

    function chairAnchorObjects(state) {
        return ['poker_table', 'tcg_table', 'slot_machine']
            .flatMap(type => placedCasinoEquipment(state, type));
    }

    function chairPresentationForPosition(pos, anchors) {
        let nearest = null;
        anchors.forEach(anchor => {
            const centerX = anchor.x + (Math.max(1, Number(anchor.w) || 1) - 1) / 2;
            const centerY = anchor.y + (Math.max(1, Number(anchor.h) || 1) - 1) / 2;
            const distance = Math.abs(centerX - pos.x) + Math.abs(centerY - pos.y);
            if (!nearest || distance < nearest.distance) nearest = { anchor, centerX, centerY, distance };
        });
        if (!nearest) return null;
        const dx = nearest.centerX - pos.x;
        const dy = nearest.centerY - pos.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            // 画像には片側の横向き椅子しかないため、テーブル右側では左右反転して左へ向ける。
            return dx > 0
                ? { key: 'cfur_chair_side', facing: 'right', flipX: false }
                : { key: 'cfur_chair_side', facing: 'left', flipX: true };
        }
        // テーブルの下側には背面、上側には正面を使う。上下の画像名と設置位置を混同しない。
        return dy > 0
            ? { key: 'cfur_chair_down', facing: 'down', flipX: false }
            : { key: 'cfur_chair_up', facing: 'up', flipX: false };
    }

    function findCasinoChairPlacement(state) {
        const anchors = chairAnchorObjects(state);
        if (!anchors.length) return null;
        const positions = new Map();
        anchors.forEach(anchor => {
            const width = Math.max(1, Number(anchor.w) || 1);
            const height = Math.max(1, Number(anchor.h) || 1);
            for (let x = anchor.x; x < anchor.x + width; x++) {
                positions.set(`${x},${anchor.y - 1}`, { x, y: anchor.y - 1 });
                positions.set(`${x},${anchor.y + height}`, { x, y: anchor.y + height });
            }
            for (let y = anchor.y; y < anchor.y + height; y++) {
                positions.set(`${anchor.x - 1},${y}`, { x: anchor.x - 1, y });
                positions.set(`${anchor.x + width},${y}`, { x: anchor.x + width, y });
            }
        });
        let best = null;
        positions.forEach(pos => {
            const target = { x: pos.x, y: pos.y, w: 1, h: 1 };
            if (!isCasinoPlacementAreaFree(state, target)) return;
            const route = reachableCasinoEquipmentStop(state, target, true);
            if (!route) return;
            const presentation = chairPresentationForPosition(pos, anchors);
            if (!presentation) return;
            if (!best || route.path.length < best.route.path.length) {
                best = { pos, route, presentation };
            }
        });
        return best;
    }

    function findCasinoEquipmentPlacement(state, type) {
        const config = CASINO_EQUIPMENT_CATALOG[type];
        if (!config) return null;
        if (type === 'casino_chair') return findCasinoChairPlacement(state);
        const preferred = {
            slot_machine: [{ x: 2, y: 3 }, { x: 2, y: 5 }, { x: 11, y: 7 }],
            poker_table: [{ x: 2, y: 5 }, { x: 5, y: 6 }, { x: 9, y: 7 }],
            tcg_table: [{ x: 2, y: 5 }, { x: 9, y: 2 }, { x: 10, y: 7 }]
        };
        const candidates = [...(preferred[type] || [])];
        for (let y = 1; y < state.height - 1; y++) {
            for (let x = 1; x + Math.max(1, Number(config.w) || 1) <= state.width - 1; x++) {
                if (!candidates.some(pos => pos.x === x && pos.y === y)) candidates.push({ x, y });
            }
        }
        candidates.sort((a, b) => {
            const aPreferred = (preferred[type] || []).findIndex(pos => pos.x === a.x && pos.y === a.y);
            const bPreferred = (preferred[type] || []).findIndex(pos => pos.x === b.x && pos.y === b.y);
            if (aPreferred >= 0 || bPreferred >= 0) {
                if (aPreferred < 0) return 1;
                if (bPreferred < 0) return -1;
                return aPreferred - bPreferred;
            }
            return (Math.abs(a.x - state.player.x) + Math.abs(a.y - state.player.y))
                - (Math.abs(b.x - state.player.x) + Math.abs(b.y - state.player.y));
        });
        for (const pos of candidates) {
            const target = {
                x: pos.x, y: pos.y,
                w: Math.max(1, Number(config.w) || 1),
                h: Math.max(1, Number(config.h) || 1)
            };
            if (!isCasinoPlacementAreaFree(state, target)) continue;
            const route = reachableCasinoEquipmentStop(state, target, true);
            if (route) return { pos, route };
        }
        return null;
    }

    function finishCasinoEquipmentInteraction(type, obj) {
        const config = CASINO_EQUIPMENT_CATALOG[type];
        if (type === 'slot_machine') {
            sayCasino('スロット台に着いたよ。遊んでみよう！');
            if (typeof window.openCasinoSlotGame === 'function') window.openCasinoSlotGame();
            return;
        }
        if (type === 'poker_table') {
            sayCasino('ポーカーテーブルに着いたよ！');
            if (typeof window.setCasinoCardGameContext === 'function') {
                window.setCasinoCardGameContext({ source: 'table', lockedVisitors: [] });
            }
            if (typeof window.openCasinoCardGameMenu === 'function') window.openCasinoCardGameMenu();
            return;
        }
        if (type === 'tcg_table') {
            sayCasino('TCGテーブルに着いたよ！');
            if (typeof window.setCasinoCardGameContext === 'function') {
                window.setCasinoCardGameContext({ source: 'table', lockedVisitors: [] });
            }
            if (typeof window.openCasinoTCGMenu === 'function') window.openCasinoTCGMenu();
            else sayCasino('TCGで遊ぶには、先にデッキを用意してね。', '#ff9800');
            return;
        }
        sayCasino(`${config ? config.name : '設備'}のところへ着いたよ！`);
    }

    window.routeCasinoPlayerToEquipment = function (type, obj, onArrive) {
        const state = window.ensureCasinoIndoorState();
        obj = obj || randomReachableCasinoEquipment(state, type);
        if (!state || !obj) return false;
        const route = reachableCasinoEquipmentStop(state, obj, false);
        if (!route) {
            sayCasino(`${obj.name || '設備'}のそばまで移動できないみたい。`, '#ff5252');
            return false;
        }
        sayCasino(`${obj.name || '設備'}へ移動するね！`);
        return window.moveCasinoPlayerTo(route.stop.x, route.stop.y, () => {
            state.player.dir = route.stop.dir;
            renderCasinoMap();
            if (typeof onArrive === 'function') onArrive(obj);
            else finishCasinoEquipmentInteraction(type, obj);
        });
    };

    window.placeCasinoEquipment = function (type) {
        const config = CASINO_EQUIPMENT_CATALOG[type];
        const state = window.ensureCasinoIndoorState();
        if (!config || !state || !dealerMasteredForEquipment(window.aiPet)) return false;
        const owned = purchasedCasinoEquipmentCount(type);
        const installed = placedPurchasedCasinoEquipment(state, type).length;
        if (owned <= installed) {
            sayCasino(`${config.name}の未設置分を持っていないみたい。ディーラーから購入してね。`, '#ff9800');
            return false;
        }
        const placement = findCasinoEquipmentPlacement(state, type);
        if (!placement) {
            if (type === 'casino_chair') {
                sayCasino('椅子を置ける空き場所がないみたい。先にテーブルかスロット台を置いてね！', '#ff9800', 5200);
            } else {
                sayCasino(`${config.name}を置ける、隣まで歩いて行ける空き場所がないみたい。`, '#ff9800', 5200);
            }
            return false;
        }
        const id = `casino_equipment_${type}_${state.nextEquipmentId++}`;
        const obj = {
            id, equipmentType: type, x: placement.pos.x, y: placement.pos.y,
            w: Math.max(1, Number(config.w) || 1), h: Math.max(1, Number(config.h) || 1),
            name: config.name,
            blocksMovement: config.blocksMovement !== false,
            installing: true, purchasedAt: Date.now()
        };
        if (Array.isArray(config.spriteKeys)) obj.keys = config.spriteKeys.slice();
        else if (config.spriteKey) obj.key = config.spriteKey;
        else obj.textIcon = config.icon;
        if (placement.presentation) Object.assign(obj, placement.presentation);
        window._casinoInstallingEquipmentId = id;
        state.objects.push(obj);
        sayCasino(`${config.name}を配置するね！`);
        const moved = window.moveCasinoPlayerTo(placement.route.stop.x, placement.route.stop.y, () => {
            state.player.dir = placement.route.stop.dir;
            obj.installing = false;
            window._casinoInstallingEquipmentId = null;
            renderCasinoMap();
            sayCasino(`${config.name}を空き場所に設置したよ！`, '#4caf50');
            if (typeof window.saveGameData === 'function') window.saveGameData();
        });
        if (!moved) {
            window._casinoInstallingEquipmentId = null;
            state.objects = state.objects.filter(entry => entry !== obj);
            return false;
        }
        return true;
    };

    window.handleCasinoEquipmentChat = function (type) {
        const config = CASINO_EQUIPMENT_CATALOG[type];
        const state = window.ensureCasinoIndoorState();
        if (!config || !state) return false;
        const installed = placedCasinoEquipment(state, type);
        if (installed.length) {
            const target = randomReachableCasinoEquipment(state, type);
            if (!target) {
                sayCasino(`${config.name}のそばまで移動できないみたい。`, '#ff5252');
                return false;
            }
            return window.routeCasinoPlayerToEquipment(type, target);
        }
        if (!dealerMasteredForEquipment(window.aiPet)) {
            sayCasino(`${config.name}は、ディーラー免許皆伝後に購入・設置できるよ。`, '#ff9800');
            interact('dealer');
            return false;
        }
        if (purchasedCasinoEquipmentCount(type) < 1) {
            sayCasino(`${config.name}をまだ持っていないみたい。ディーラーの設備売場で購入してね。`, '#ff9800');
            interact('dealer');
            return false;
        }
        sayCasino(`${config.name}はまだ置いていないよ。「おく」と指示してね。`, '#ff9800');
        return false;
    };

    function casinoEquipmentTypeFromText(text) {
        text = String(text || '');
        if (/スロット|スロットマシン/.test(text)) return 'slot_machine';
        if (/ポーカー.*テーブル|ポーカーテーブル|ポーカー/.test(text)) return 'poker_table';
        if (/TCG.*テーブル|tcg.*テーブル|TCG|tcg/.test(text)) return 'tcg_table';
        if (/カジノ.*(?:椅子|いす|イス)|(?:椅子|いす|イス)/.test(text)) return 'casino_chair';
        return null;
    }

    function unplacedCasinoEquipmentEntries(state) {
        return Object.entries(CASINO_EQUIPMENT_CATALOG).map(([type, config]) => ({
            type,
            config,
            count: unplacedCasinoEquipmentCount(state, type)
        })).filter(entry => entry.count > 0);
    }

    function clearCasinoPlacementPrompt() {
        window._casinoPlacementPromptActive = false;
    }

    window.beginCasinoEquipmentPlacement = function () {
        const state = window.ensureCasinoIndoorState();
        if (!state || !dealerMasteredForEquipment(window.aiPet)) {
            sayCasino('カジノ設備を置けるようになるのは、ディーラー免許皆伝後だよ。', '#ff9800');
            return false;
        }
        const entries = unplacedCasinoEquipmentEntries(state);
        const total = entries.reduce((sum, entry) => sum + entry.count, 0);
        if (!total) {
            clearCasinoPlacementPrompt();
            sayCasino('いま置ける未設置の設備を持っていないみたい。ディーラーから購入してね。', '#ff9800');
            return false;
        }
        if (total === 1) {
            clearCasinoPlacementPrompt();
            return window.placeCasinoEquipment(entries[0].type);
        }
        window._casinoPlacementPromptActive = true;
        const choices = entries.map(entry => `${entry.config.name}${entry.count > 1 ? `×${entry.count}` : ''}`).join('、');
        sayCasino(`なにをおく？\n${choices}`, '#00bcd4', 0, true);
        return true;
    };

    function resolveCasinoPlacementReply(text) {
        if (!window._casinoPlacementPromptActive) return false;
        if (/^(?:おく|置く)$/.test(String(text || '').trim())) {
            window.beginCasinoEquipmentPlacement();
            return true;
        }
        const state = window.ensureCasinoIndoorState();
        const type = casinoEquipmentTypeFromText(text);
        if (type && unplacedCasinoEquipmentCount(state, type) > 0) {
            clearCasinoPlacementPrompt();
            window.placeCasinoEquipment(type);
            return true;
        }
        // 設備以外や未所持設備なら配置確認を終え、通常のチャット指示として扱う。
        clearCasinoPlacementPrompt();
        return false;
    }

    function addLog(message) {
        const state = window.ensureCasinoIndoorState();
        if (state) {
            state.logs.push(String(message));
            if (state.logs.length > 30) state.logs.shift();
        }
        const chatMessage = document.getElementById('casino-chat-message');
        if (chatMessage) chatMessage.textContent = String(message);
    }
    window.addCasinoLog = addLog;

    function sayCasino(message, color, duration, sticky) {
        addLog(message);
        showCasinoPlayerBubble(message, color || '#00bcd4', duration || 3600, !!sticky);
    }
    window.sayCasino = sayCasino;

    function getCasinoDealerRank(hero) {
        const app = hero && hero.apprentice;
        const savedRank = app && app.rank ? Math.max(0, Number(app.rank.dealer) || 0) : 0;
        if (app && app.retired && app.retired.dealer) return Math.max(10, savedRank);
        return app && app.currentMaster === 'dealer' ? Math.max(1, savedRank) : savedRank;
    }

    function getCasinoMasterNames() {
        const profiles = window.CASINO_MASTER_PROFILES || {};
        return [...new Set(Object.values(profiles).map(profile => String(profile && profile.name || '').trim()).filter(Boolean))];
    }

    function getCasinoWordAvailability(rawWord, state, hero, rank) {
        const word = String(rawWord || '').trim();
        if (!word) return null;
        if (/^(?:遊ぶ|ゲーム|カジノ)$/.test(word)) return null;
        const progress = typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero || {})
            : ((hero && hero.dealerProgress) || {});
        const purchasedTrumpGames = progress.purchasedTrumpGames || {};
        const visitors = state && Array.isArray(state.visitors) ? state.visitors : [];
        const visitingMaster = visitors.find(visitor => visitor && visitor.name && word.includes(visitor.name));
        if (visitingMaster) return { minRank: 10, group: 'master' };

        const mentionedMaster = getCasinoMasterNames().find(name => name !== 'ディーラー' && word.includes(name));
        if (mentionedMaster) return null;
        if (/ディーラー|支配人/.test(word)) return { minRank: 1, group: 'master' };

        if (/ポーカー.*テーブル|ポーカーテーブル|TCG.*テーブル|tcg.*テーブル|カジノ.*(?:椅子|いす|イス)|(?:椅子|いす|イス)|スロット|スロットマシン|設備|^(?:おく|置く)$/.test(word)) {
            return { minRank: 10, group: 'equipment' };
        }
        if (/来客.*設定|ゲーム設定/.test(word)) return { minRank: 10, group: 'service' };
        if (/テキサスホールデム|ホールデム/.test(word)) {
            return purchasedTrumpGames.texasHoldem ? { minRank: 10, group: 'game', word: 'テキサスホールデム' } : null;
        }
        if (/インディアンポーカー/.test(word)) {
            return purchasedTrumpGames.indianPoker ? { minRank: 10, group: 'game', word: 'インディアンポーカー' } : null;
        }
        if (/大富豪/.test(word)) return { minRank: 5, group: 'game' };
        if (/トランプゲーム|ポーカー/.test(word)) return { minRank: 3, group: 'game' };
        if (/TCG|tcg|デッキ|カードゲーム|^カード$/.test(word)) {
            const tcgUnlocked = rank >= 6
                && typeof window.isTCGCardGameUnlocked === 'function'
                && window.isTCGCardGameUnlocked();
            return tcgUnlocked ? { minRank: 6, group: 'game', word: 'TCG' } : null;
        }
        if (/トランプ|カード一式/.test(word)) return { minRank: 2, group: 'shop' };
        if (/コイン|チップ|売場|買い物|購入/.test(word)) return { minRank: 1, group: 'shop' };
        return null;
    }

    function getCasinoAvailableKnownWords() {
        const hero = window.aiPet || window.hero || {};
        const app = hero.apprentice || {};
        const learnedWords = Array.isArray(app.learnedWords) ? app.learnedWords : [];
        const rank = getCasinoDealerRank(hero);
        const state = window.ensureCasinoIndoorState();
        if (rank < 1 || !state) return [];
        const used = new Set();
        return learnedWords.reduce((result, rawWord) => {
            const word = String(rawWord || '').trim();
            if (!word) return result;
            const availability = getCasinoWordAvailability(word, state, hero, rank);
            if (!availability || rank < availability.minRank) return result;
            const displayWord = availability.word || word;
            if (used.has(displayWord)) return result;
            used.add(displayWord);
            result.push({ word: displayWord, group: availability.group });
            return result;
        }, []);
    }

    function renderCasinoWordsPanel() {
        const list = document.getElementById('casino-words-list');
        if (!list) return;
        const hero = window.aiPet || window.hero || {};
        const app = hero.apprentice || {};
        const learnedWords = Array.isArray(app.learnedWords) ? app.learnedWords : [];
        const maxWords = typeof hero.getMaxVocabulary === 'function' ? hero.getMaxVocabulary() : 5;
        const rank = getCasinoDealerRank(hero);
        const state = window.ensureCasinoIndoorState();
        const visitorNames = state && Array.isArray(state.visitors)
            ? state.visitors.map(visitor => visitor && visitor.name || '').filter(Boolean)
            : [];
        const progress = typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero)
            : (hero.dealerProgress || {});
        const purchasedTrumpGames = progress.purchasedTrumpGames || {};
        const tcgUnlocked = typeof window.isTCGCardGameUnlocked === 'function' && window.isTCGCardGameUnlocked();
        const signature = JSON.stringify([rank, maxWords, learnedWords, visitorNames, !!purchasedTrumpGames.indianPoker, !!purchasedTrumpGames.texasHoldem, tcgUnlocked]);
        if (list.dataset.renderSignature === signature) return;
        list.dataset.renderSignature = signature;
        list.innerHTML = '';

        const summary = document.createElement('div');
        summary.style.cssText = 'position:sticky;top:-10px;z-index:1;background:rgba(28,12,20,.96);padding:0 0 8px;margin-bottom:8px;border-bottom:1px solid rgba(255,213,106,.2);font-size:12px;color:#ffd98a;';
        summary.textContent = `🧠 記憶容量: ${learnedWords.length} / ${maxWords} 語　Dealer Rank ${rank}`;
        list.appendChild(summary);

        const availableWords = getCasinoAvailableKnownWords();
        if (!availableWords.length) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:#d6c7cc;font-size:12px;line-height:1.6;';
            empty.textContent = rank < 1
                ? 'ディーラーに弟子入りすると、Rankに応じてカジノで使える言葉が表示されます。'
                : '現在カジノで使える、覚えている言葉はありません。';
            list.appendChild(empty);
            return;
        }

        const groupTitles = {
            master: '🎩 店内の師匠',
            shop: '🪙 買い物・案内',
            game: '🃏 ゲーム',
            equipment: '🎰 設備',
            service: '⚙ 来客'
        };
        Object.keys(groupTitles).forEach(group => {
            const words = availableWords.filter(entry => entry.group === group);
            if (!words.length) return;
            const title = document.createElement('div');
            title.style.cssText = 'margin:10px 0 5px;color:#ffd56a;font-size:12px;font-weight:bold;';
            title.textContent = groupTitles[group];
            list.appendChild(title);
            const chips = document.createElement('div');
            chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
            words.forEach(entry => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'casino-word-chip';
                button.textContent = entry.word;
                button.style.cssText = 'background:rgba(255,255,255,.1);color:#fff4df;border:1px solid rgba(255,213,106,.32);border-radius:999px;padding:6px 9px;cursor:pointer;font-size:12px;';
                button.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    window._blockChatFocus = true;
                    const input = document.getElementById('casino-chat-input');
                    if (input) input.value = '';
                    handleChat(entry.word);
                    if (input) input.focus();
                });
                chips.appendChild(button);
            });
            list.appendChild(chips);
        });
    }
    window.renderCasinoWordsPanel = renderCasinoWordsPanel;

    function escapeCasinoRecordHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function casinoRecordRate(wins, plays) {
        return plays > 0 ? wins / plays : 0;
    }

    function formatCasinoRecordRate(wins, plays) {
        if (!plays) return '—';
        const value = casinoRecordRate(wins, plays) * 100;
        return `${value.toFixed(value % 1 ? 1 : 0)}%`;
    }

    function casinoRecordSnapshot() {
        const hero = window.aiPet || {};
        const progress = typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero)
            : (hero.dealerProgress || {});
        const gameIds = Array.isArray(window.CASINO_STAT_GAMES)
            ? window.CASINO_STAT_GAMES
            : ['poker', 'daifugo', 'indianPoker', 'texasHoldem', 'tcg', 'slot'];
        const meta = window.CASINO_GAME_META || {};
        const games = gameIds.map(id => {
            const source = progress.stats && progress.stats[id] || {};
            const game = {
                id,
                name: meta[id] && meta[id].name || id,
                shortName: meta[id] && meta[id].shortName || id,
                icon: meta[id] && meta[id].icon || '◆',
                plays: Math.max(0, Number(source.plays) || 0),
                wins: Math.max(0, Number(source.wins) || 0),
                losses: Math.max(0, Number(source.losses) || 0),
                draws: Math.max(0, Number(source.draws) || 0),
                netCoins: Number(source.netCoins) || 0,
                opponents: source.opponents && typeof source.opponents === 'object' ? source.opponents : {},
                modes: source.modes && typeof source.modes === 'object' ? source.modes : {},
                partners: source.partners && typeof source.partners === 'object' ? source.partners : {},
                pvp: source.pvp && typeof source.pvp === 'object' ? source.pvp : {}
            };
            game.plays = Math.max(game.plays, game.wins + game.losses + game.draws);
            return game;
        });
        const totals = games.reduce((sum, game) => {
            sum.plays += game.plays;
            sum.wins += game.wins;
            sum.losses += game.losses;
            sum.draws += game.draws;
            sum.netCoins += game.netCoins;
            return sum;
        }, { plays: 0, wins: 0, losses: 0, draws: 0, netCoins: 0 });
        const opponents = [];
        games.forEach(game => {
            Object.values(game.opponents).forEach(source => {
                if (!source || typeof source !== 'object') return;
                const record = {
                    gameId: game.id,
                    gameName: game.shortName,
                    gameIcon: game.icon,
                    id: String(source.id || ''),
                    name: String(source.name || source.id || '対戦相手'),
                    type: String(source.type || ''),
                    masterType: String(source.masterType || ''),
                    plays: Math.max(0, Number(source.plays) || 0),
                    wins: Math.max(0, Number(source.wins) || 0),
                    losses: Math.max(0, Number(source.losses) || 0),
                    draws: Math.max(0, Number(source.draws) || 0)
                };
                record.plays = Math.max(record.plays, record.wins + record.losses + record.draws);
                if (record.plays && (record.masterType || record.type === 'dealer')) opponents.push(record);
            });
        });
        opponents.sort((a, b) => {
            const gameOrder = gameIds.indexOf(a.gameId) - gameIds.indexOf(b.gameId);
            return gameOrder || b.plays - a.plays || a.name.localeCompare(b.name, 'ja');
        });
        return { games, totals, opponents };
    }

    function casinoRecordAnalysis(snapshot) {
        const clampScore = value => Math.max(0, Math.min(10, Math.round(Number(value) || 0)));
        const totals = snapshot.totals;
        const masterRecords = snapshot.opponents.filter(record =>
            record.masterType || ['dealer', 'master', 'guest'].includes(record.type)
        );
        const masterTotals = masterRecords.reduce((sum, record) => {
            sum.plays += record.plays;
            sum.wins += record.wins;
            sum.draws += record.draws;
            return sum;
        }, { plays: 0, wins: 0, draws: 0 });
        const coinGames = snapshot.games.filter(game => game.id !== 'tcg');
        const coinPlays = coinGames.reduce((sum, game) => sum + game.plays, 0);
        const coinNet = coinGames.reduce((sum, game) => sum + game.netCoins, 0);
        const playedGames = snapshot.games.filter(game => game.plays > 0);
        const scores = [
            { label: '勝率', value: clampScore(casinoRecordRate(totals.wins, totals.plays) * 10) },
            { label: '安定', value: clampScore(totals.plays ? ((totals.wins + totals.draws) / totals.plays) * 10 : 0) },
            { label: '経験', value: clampScore(Math.sqrt(totals.plays) * 2) },
            { label: '収益', value: clampScore(coinPlays ? 5 + (coinNet / coinPlays) / 5 : 0) },
            { label: '対師匠', value: clampScore(masterTotals.plays ? casinoRecordRate(masterTotals.wins, masterTotals.plays) * 10 : 0) },
            { label: '多彩', value: clampScore((playedGames.length / Math.max(1, snapshot.games.length)) * 10) }
        ];
        const rankedGames = playedGames.slice().sort((a, b) =>
            casinoRecordRate(b.wins, b.plays) - casinoRecordRate(a.wins, a.plays)
            || b.plays - a.plays
        );
        const best = rankedGames[0] || null;
        const weakest = rankedGames.length > 1 ? rankedGames[rankedGames.length - 1] : null;
        const messages = [];
        if (!totals.plays) {
            messages.push('まだ記録がありません。最初の一戦からプレイ傾向を分析します。');
        } else {
            const overallRate = casinoRecordRate(totals.wins, totals.plays);
            if (overallRate >= 0.65) messages.push('総合的に高い勝率です。勝ち筋を再現できる安定したプレイになっています。');
            else if (overallRate >= 0.5) messages.push('勝ち越し圏です。得意ゲームを軸にすると、さらに成績を伸ばせそうです。');
            else if (overallRate >= 0.35) messages.push('勝敗は拮抗しています。負けが続くゲームのベットや判断基準を見直す余地があります。');
            else messages.push('現在は試行段階です。少額ベットで経験を増やし、得意な勝負を探すのがおすすめです。');
            if (totals.plays < 10) messages.push(`総対戦${totals.plays}回のため、分析は暫定評価です。10回を超えると傾向が安定します。`);
            if (best) messages.push(`最も勝率が高いのは「${best.name}」の${formatCasinoRecordRate(best.wins, best.plays)}です。`);
            if (weakest && weakest.plays >= 2) messages.push(`重点改善候補は「${weakest.name}」です。直近は勝敗数と相手別成績を見比べてみましょう。`);
            if (coinNet > 0) messages.push(`コインゲームの累計収支は +${Math.floor(coinNet)}。勝率だけでなく収益面でもプラスです。`);
            else if (coinNet < 0) messages.push(`コインゲームの累計収支は ${Math.floor(coinNet)}。ベットを抑えると分析サンプルを増やしやすくなります。`);
            else messages.push('コインゲームの累計収支は現在±0です。');
            if (masterTotals.plays) {
                messages.push(`師匠・ディーラー戦は${masterTotals.wins}勝、勝率${formatCasinoRecordRate(masterTotals.wins, masterTotals.plays)}です。`);
            } else {
                messages.push('師匠との個別対戦データはまだありません。来店中の師匠に挑むと「対師匠」が計測されます。');
            }
        }
        return { scores, messages, masterTotals, coinNet };
    }

    function casinoRecordRadarHtml(scores) {
        const size = 330;
        const center = size / 2;
        const radius = 104;
        const count = scores.length;
        const point = (index, value, extraRadius = 0) => {
            const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
            const distance = radius * value / 10 + extraRadius;
            return {
                x: center + Math.cos(angle) * distance,
                y: center + Math.sin(angle) * distance
            };
        };
        const rings = [2, 4, 6, 8, 10].map(level => {
            const points = scores.map((score, index) => {
                const pos = point(index, level);
                return `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
            }).join(' ');
            return `<polygon points="${points}" fill="${level === 10 ? 'rgba(142,94,27,.08)' : 'none'}" stroke="rgba(255,218,128,${level === 10 ? '.36' : '.16'})" stroke-width="${level === 10 ? '1.4' : '1'}"></polygon>`;
        }).join('');
        const axes = scores.map((score, index) => {
            const pos = point(index, 10);
            return `<line x1="${center}" y1="${center}" x2="${pos.x.toFixed(1)}" y2="${pos.y.toFixed(1)}" stroke="rgba(255,218,128,.16)" stroke-width="1"></line>`;
        }).join('');
        const dataPoints = scores.map((score, index) => {
            const pos = point(index, score.value);
            return `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
        }).join(' ');
        const dots = scores.map((score, index) => {
            const pos = point(index, score.value);
            return `<circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="4.5" fill="#ffe18a" stroke="#6e3d0f" stroke-width="2"></circle>`;
        }).join('');
        const labels = scores.map((score, index) => {
            const pos = point(index, 10, 33);
            const anchor = Math.abs(pos.x - center) < 12 ? 'middle' : pos.x < center ? 'end' : 'start';
            return `<text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="#f7e5c2" font-size="11" font-weight="800">${score.label} ${score.value}</text>`;
        }).join('');
        return `<svg class="cr-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="カジノ戦績10段階分析">${rings}${axes}<polygon points="${dataPoints}" fill="rgba(255,193,55,.27)" stroke="#ffd35d" stroke-width="2.5"></polygon>${dots}${labels}<circle cx="${center}" cy="${center}" r="3" fill="#ffd35d"></circle></svg>`;
    }

    function casinoRecordGameCardsHtml(snapshot) {
        return snapshot.games.map(game => {
            const rate = casinoRecordRate(game.wins, game.plays);
            const percent = Math.max(0, Math.min(100, rate * 100));
            const net = Math.floor(game.netCoins);
            return `<article class="cr-game-card">
                <div class="cr-game-head"><span class="cr-game-icon">${escapeCasinoRecordHtml(game.icon)}</span><span><small>${escapeCasinoRecordHtml(game.shortName)}</small><strong>${escapeCasinoRecordHtml(game.name)}</strong></span><b>${formatCasinoRecordRate(game.wins, game.plays)}</b></div>
                <div class="cr-result-count"><strong>${game.wins}勝</strong><span>${game.losses}敗</span><em>${game.draws}分</em></div>
                <div class="cr-rate-track"><i style="width:${percent.toFixed(1)}%"></i></div>
                <div class="cr-game-foot"><span>総対戦 ${game.plays}</span><span class="${net > 0 ? 'is-plus' : net < 0 ? 'is-minus' : ''}">収支 ${net > 0 ? '+' : ''}${net}</span></div>
            </article>`;
        }).join('');
    }

    function casinoRecordOpponentRowsHtml(snapshot) {
        if (!snapshot.opponents.length) {
            return '<div class="cr-opponent-empty">師匠との対戦記録はまだありません。</div>';
        }
        const rows = snapshot.opponents.map(record => {
            const rate = formatCasinoRecordRate(record.wins, record.plays);
            return `<tr>
                <td><span class="cr-table-game"><i>${escapeCasinoRecordHtml(record.gameIcon)}</i>${escapeCasinoRecordHtml(record.gameName)}</span></td>
                <td><strong>vs ${escapeCasinoRecordHtml(record.name)}</strong><small>師匠</small></td>
                <td><b>${rate}</b></td>
                <td><span class="cr-wdl"><i>${record.wins}勝</i><em>${record.losses}敗</em><u>${record.draws}分</u></span></td>
                <td>${record.plays}</td>
            </tr>`;
        }).join('');
        return `<div class="cr-table-wrap"><table class="cr-table"><thead><tr><th>ゲーム</th><th>対戦相手</th><th>勝率</th><th>勝敗</th><th>対戦数</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function casinoRecordTcgTagHtml(snapshot) {
        const tcg = snapshot.games.find(game => game.id === 'tcg');
        if (!tcg) return '';
        const normalize = source => {
            const record = source || {};
            const result = {
                plays: Math.max(0, Number(record.plays) || 0),
                wins: Math.max(0, Number(record.wins) || 0),
                losses: Math.max(0, Number(record.losses) || 0),
                draws: Math.max(0, Number(record.draws) || 0)
            };
            result.plays = Math.max(result.plays, result.wins + result.losses + result.draws);
            return result;
        };
        const single = normalize(tcg.modes.single);
        const tag = normalize(tcg.modes.tag);
        const pvpSingle = normalize(tcg.pvp && tcg.pvp.single);
        const pvpTag = normalize(tcg.pvp && tcg.pvp.tag);
        const modeCard = (label, mark, record) => `<article class="cr-tcg-mode"><i>${mark}</i><span><small>${label}</small><strong>${formatCasinoRecordRate(record.wins, record.plays)}</strong><em>${record.wins}勝 ${record.losses}敗 ${record.draws}分 ／ ${record.plays}戦</em></span></article>`;
        const partners = Object.values(tcg.partners || {}).filter(record => record && Number(record.plays) > 0).sort((a, b) => Number(b.plays) - Number(a.plays));
        const partnerRows = partners.map(record => {
            const normalized = normalize(record);
            return `<tr><td><strong>${escapeCasinoRecordHtml(record.name || record.id || '相棒')}</strong><small>タッグ相棒</small></td><td><b>${formatCasinoRecordRate(normalized.wins, normalized.plays)}</b></td><td><span class="cr-wdl"><i>${normalized.wins}勝</i><em>${normalized.losses}敗</em><u>${normalized.draws}分</u></span></td><td>${normalized.plays}</td></tr>`;
        }).join('');
        return `<section class="cr-tcg-breakdown"><div class="cr-tcg-modes">${modeCard('通常シングル戦', '1v1', single)}${modeCard('通常タッグ戦', '2v2', tag)}${modeCard('オンライン・シングル', 'P2P', pvpSingle)}${modeCard('オンライン・タッグ', 'P2P', pvpTag)}</div>${partnerRows ? `<div class="cr-table-wrap"><table class="cr-table cr-partner-table"><thead><tr><th>相棒</th><th>勝率</th><th>勝敗</th><th>対戦数</th></tr></thead><tbody>${partnerRows}</tbody></table></div>` : '<div class="cr-opponent-empty">通常タッグ戦の相棒別記録はまだありません。</div>'}</section>`;
    }

    function casinoRecordStyleHtml() {
        return `<style>
            #casino-record-ui::backdrop{background:rgba(0,0,0,.86);backdrop-filter:blur(4px)}
            .cr-shell{width:min(1180px,96vw);max-height:94vh;overflow:auto;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(34,8,18,.99),rgba(8,3,6,.995));color:#fff;padding:22px 26px 28px;box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 26px 90px #000,0 0 46px rgba(200,153,57,.22)}
            .cr-header{display:flex;align-items:center;justify-content:space-between;gap:18px;padding-bottom:17px;border-bottom:1px solid rgba(255,213,106,.28)}.cr-title{display:flex;align-items:center;gap:13px;margin:0;color:#ffd56a;font-size:clamp(23px,3vw,31px);letter-spacing:.04em}.cr-title-mark{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:linear-gradient(145deg,#ffe078,#946013);color:#24070f;font-size:26px;box-shadow:0 0 22px rgba(255,202,40,.3)}.cr-title span:last-child{display:grid}.cr-title small{color:#bdaea8;font-size:9px;letter-spacing:.22em}
            .cr-btn{appearance:none;border:1px solid rgba(255,218,128,.62);border-radius:10px;padding:10px 17px;color:#fff;background:linear-gradient(180deg,#5c2b40,#2f111d);font-weight:800;cursor:pointer}.cr-btn:hover{filter:brightness(1.13)}
            .cr-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}.cr-kpi{display:grid;gap:4px;padding:14px 16px;border:1px solid rgba(255,213,106,.24);border-radius:13px;background:linear-gradient(135deg,rgba(129,72,18,.2),rgba(71,20,42,.25))}.cr-kpi small{color:#bcaeb2;font-size:10px;font-weight:800;letter-spacing:.08em}.cr-kpi strong{color:#ffe08a;font-size:24px}.cr-kpi span{color:#e2d5d7;font-size:11px}.cr-kpi .is-plus{color:#7ce0a5}.cr-kpi .is-minus{color:#ff9999}
            .cr-section-title{display:flex;align-items:center;gap:9px;margin:22px 0 10px;color:#ffe09a;font-size:17px}.cr-section-title:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,rgba(255,213,106,.35),transparent)}
            .cr-analysis{display:grid;grid-template-columns:minmax(290px,360px) 1fr;gap:18px;align-items:center;padding:15px 18px;border:1px solid rgba(255,213,106,.22);border-radius:16px;background:radial-gradient(circle at 18% 50%,rgba(121,71,18,.19),transparent 42%),rgba(255,255,255,.025)}.cr-radar{display:block;width:100%;max-width:340px;margin:auto}.cr-analysis-copy{display:grid;gap:9px}.cr-analysis-copy h3{margin:0;color:#ffd56a;font-size:19px}.cr-analysis-copy>p{margin:0;color:#a99ca2;font-size:11px;line-height:1.6}.cr-analysis-list{display:grid;gap:7px}.cr-analysis-line{display:flex;gap:9px;align-items:flex-start;padding:9px 11px;border-left:3px solid #b98229;border-radius:0 8px 8px 0;background:rgba(255,255,255,.035);color:#e3d7da;font-size:12px;line-height:1.55}.cr-analysis-line i{color:#ffd56a;font-style:normal}
            .cr-games{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cr-game-card{display:grid;gap:10px;padding:14px;border:1px solid rgba(255,213,106,.22);border-radius:13px;background:linear-gradient(150deg,rgba(107,48,58,.29),rgba(27,12,18,.8));box-shadow:inset 0 1px rgba(255,255,255,.04)}.cr-game-head{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px}.cr-game-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#f0d38a;color:#41131f;font-size:20px;font-weight:950}.cr-game-head span:nth-child(2){display:grid;min-width:0}.cr-game-head small{color:#ad9ea3;font-size:9px}.cr-game-head strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f7e7d0;font-size:13px}.cr-game-head>b{color:#ffd56a;font-size:19px}.cr-result-count{display:flex;align-items:baseline;gap:11px}.cr-result-count strong{color:#7de2a5}.cr-result-count span{color:#ff9999}.cr-result-count em{color:#8bd2ee;font-style:normal}.cr-rate-track{height:6px;overflow:hidden;border-radius:99px;background:#24141a}.cr-rate-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#a66718,#ffe17b);box-shadow:0 0 8px rgba(255,213,106,.45)}.cr-game-foot{display:flex;justify-content:space-between;gap:8px;color:#aa9da1;font-size:10px}.cr-game-foot .is-plus{color:#7ce0a5}.cr-game-foot .is-minus{color:#ff9999}
            .cr-table-wrap{overflow:auto;border:1px solid rgba(255,213,106,.2);border-radius:13px;background:rgba(3,2,3,.32)}.cr-table{width:100%;border-collapse:collapse;min-width:680px}.cr-table th{position:sticky;top:0;padding:10px 12px;background:#2b101a;color:#c9b59b;font-size:10px;text-align:left;letter-spacing:.06em}.cr-table td{padding:10px 12px;border-top:1px solid rgba(255,255,255,.055);color:#dfd3d5;font-size:11px}.cr-table tr:hover td{background:rgba(255,213,106,.035)}.cr-table-game{display:flex;align-items:center;gap:7px}.cr-table-game i{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#d8b86a;color:#36101b;font-style:normal;font-weight:900}.cr-table td:nth-child(2){display:grid;gap:2px}.cr-table td:nth-child(2) strong{color:#fff0ce}.cr-table td:nth-child(2) small{color:#998b91}.cr-table td:nth-child(3) b{color:#ffd56a;font-size:14px}.cr-wdl{display:flex;gap:7px}.cr-wdl i{color:#7de2a5;font-style:normal}.cr-wdl em{color:#ff9999;font-style:normal}.cr-wdl u{color:#8bd2ee;text-decoration:none}.cr-opponent-empty{padding:24px;border:1px dashed rgba(255,213,106,.28);border-radius:12px;color:#b8aaae;text-align:center;font-size:12px}
            .cr-tcg-breakdown{display:grid;gap:10px}.cr-tcg-modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cr-tcg-mode{display:grid;grid-template-columns:56px 1fr;align-items:center;gap:12px;padding:13px;border:1px solid rgba(208,190,255,.24);border-radius:13px;background:linear-gradient(145deg,rgba(54,38,78,.46),rgba(16,12,22,.78))}.cr-tcg-mode>i{display:grid;place-items:center;width:52px;height:65px;border:1px solid #d8bd70;border-radius:7px;background:#28213d;color:#ffe18a;font:900 14px Georgia,serif}.cr-tcg-mode span{display:grid;gap:3px}.cr-tcg-mode small{color:#b7a4c9}.cr-tcg-mode strong{color:#ffe078;font-size:22px}.cr-tcg-mode em{color:#d6ccd9;font-size:10px;font-style:normal}.cr-partner-table{min-width:520px}.cr-partner-table td:first-child{display:grid;gap:2px}.cr-partner-table td:nth-child(2){display:table-cell}.cr-partner-table td:nth-child(2) b{color:#ffd56a;font-size:14px}
            @media(max-width:850px){.cr-shell{padding:16px 12px}.cr-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.cr-analysis{grid-template-columns:1fr}.cr-games{grid-template-columns:repeat(2,minmax(0,1fr))}}
            @media(max-width:540px){.cr-title small{display:none}.cr-kpis,.cr-games,.cr-tcg-modes{grid-template-columns:1fr}.cr-analysis{padding:10px}.cr-radar{max-width:300px}}
        </style>`;
    }

    function casinoRecordDashboardHtml() {
        const snapshot = casinoRecordSnapshot();
        const analysis = casinoRecordAnalysis(snapshot);
        const totals = snapshot.totals;
        const best = snapshot.games.filter(game => game.plays > 0).sort((a, b) =>
            casinoRecordRate(b.wins, b.plays) - casinoRecordRate(a.wins, a.plays)
            || b.plays - a.plays
        )[0];
        const net = Math.floor(totals.netCoins);
        const messages = analysis.messages.map(message => `<div class="cr-analysis-line"><i>◆</i><span>${escapeCasinoRecordHtml(message)}</span></div>`).join('');
        return `${casinoRecordStyleHtml()}<div class="cr-shell">
            <header class="cr-header">
                <h2 class="cr-title"><span class="cr-title-mark">♛</span><span><small>CASINO PERFORMANCE BOARD</small>勝敗表・プレイ分析</span></h2>
                <button type="button" class="cr-btn" onclick="window.closeCasinoRecordUI()">× 閉じる</button>
            </header>
            <section class="cr-kpis">
                <div class="cr-kpi"><small>総合勝率</small><strong>${formatCasinoRecordRate(totals.wins, totals.plays)}</strong><span>${totals.wins}勝 ${totals.losses}敗 ${totals.draws}引き分け</span></div>
                <div class="cr-kpi"><small>総対戦数</small><strong>${totals.plays}</strong><span>6ゲーム合計</span></div>
                <div class="cr-kpi"><small>累計コイン収支</small><strong class="${net > 0 ? 'is-plus' : net < 0 ? 'is-minus' : ''}">${net > 0 ? '+' : ''}${net}</strong><span>TCGはコイン消費なし</span></div>
                <div class="cr-kpi"><small>現在の得意ゲーム</small><strong>${best ? escapeCasinoRecordHtml(best.shortName) : '未計測'}</strong><span>${best ? `${formatCasinoRecordRate(best.wins, best.plays)} ／ ${best.plays}戦` : 'まずは一戦プレイ'}</span></div>
            </section>
            <h3 class="cr-section-title">10段階プレイスタイル分析</h3>
            <section class="cr-analysis">
                ${casinoRecordRadarHtml(analysis.scores)}
                <div class="cr-analysis-copy"><h3>ディーラー分析</h3><p>勝率・非敗北率・対戦経験・平均コイン収支・師匠戦・遊んだゲーム数を10段階に換算しています。</p><div class="cr-analysis-list">${messages}</div></div>
            </section>
            <h3 class="cr-section-title">ゲーム別 総合成績</h3>
            <section class="cr-games">${casinoRecordGameCardsHtml(snapshot)}</section>
            <h3 class="cr-section-title">TCG シングル・タッグ戦績</h3>
            ${casinoRecordTcgTagHtml(snapshot)}
            <h3 class="cr-section-title">ゲーム別・師匠別成績</h3>
            ${casinoRecordOpponentRowsHtml(snapshot)}
        </div>`;
    }

    window.openCasinoRecordUI = function () {
        if (!window.isCasinoRecordUnlocked || !window.isCasinoRecordUnlocked(window.aiPet)) return false;
        const old = document.getElementById('casino-record-ui');
        if (old) {
            if (typeof old.close === 'function' && old.open) old.close();
            old.remove();
        }
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-record-ui';
        overlay.setAttribute('aria-label', 'カジノ勝敗表');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483100;background:rgba(5,2,4,.94);display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = casinoRecordDashboardHtml();
        overlay.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoRecordUI();
        });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try {
                overlay.showModal();
            } catch (error) {
                console.warn('カジノ勝敗表をtop layerへ移動できなかったため、通常表示を使用します。', error);
                overlay.setAttribute('open', '');
            }
        } else {
            overlay.setAttribute('open', '');
        }
        return true;
    };

    window.closeCasinoRecordUI = function () {
        const overlay = document.getElementById('casino-record-ui');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
    };

    window.toggleCasinoRecordUI = function () {
        const overlay = document.getElementById('casino-record-ui');
        if (overlay) {
            window.closeCasinoRecordUI();
            return false;
        }
        return window.openCasinoRecordUI();
    };

    function updateCasinoRecordButton() {
        const button = document.getElementById('casino-record-toggle');
        if (!button) return;
        button.style.display = window.isCasinoRecordUnlocked && window.isCasinoRecordUnlocked(window.aiPet) ? 'inline-flex' : 'none';
    }

    function objectStop(id) {
        const stops = {
            dealer: { x: 6, y: 3, dir: 'up' },
            poker_table: { x: 6, y: 3, dir: 'up' },
            tcg_table: { x: 9, y: 4, dir: 'right' }
        };
        return stops[id] || null;
    }

    window.routeCasinoPlayerTo = function (id, onArrive) {
        const state = window.ensureCasinoIndoorState();
        const stop = objectStop(id);
        if (!state || !stop) return false;
        return window.moveCasinoPlayerTo(stop.x, stop.y, () => {
            state.player.dir = stop.dir;
            renderCasinoMap();
            if (typeof onArrive === 'function') onArrive();
        });
    };

    function interact(id) {
        if (id === 'dealer') {
            window.routeCasinoPlayerTo('dealer', () => {
                if (typeof window.checkMasterVisit === 'function') window.checkMasterVisit('dealer');
            });
        } else if (id === 'poker_table') {
            window.handleCasinoEquipmentChat('poker_table');
        } else if (id === 'tcg_table') {
            window.handleCasinoEquipmentChat('tcg_table');
        }
    }
    window.interactCasinoObject = interact;

    function getCurrentDealerQuest() {
        const app = window.aiPet && window.aiPet.apprentice;
        if (!app || !Array.isArray(app.activeQuests)) return null;
        return app.activeQuests.find(quest => quest && quest.masterType === 'dealer') || null;
    }

    function dealerQuestProgressRows(hero, quest) {
        const progress = typeof window.ensureDealerCasinoState === 'function'
            ? window.ensureDealerCasinoState(hero)
            : (hero.dealerProgress || {});
        const rank = Number(quest && quest.rank) || 0;
        const row = (label, current, required) => ({ label, current: Math.min(required, Math.max(0, Number(current) || 0)), required });
        if (rank === 1) return [row('購入コイン', (Number(progress.coinsPurchased) || 0) - (Number(progress.rank1CoinPurchaseBase) || 0), 20)];
        if (rank === 2) return [row('購入したトランプ一式', (Number(progress.trumpDecksPurchased) || 0) - (Number(progress.rank2DeckPurchaseBase) || 0), 1)];
        if (rank === 3) return [row('ディーラーに勝利', progress.beatDealerPoker ? 1 : 0, 1)];
        if (rank === 4) return [row('ポーカー純利益', progress.rank4PokerProfit, 100)];
        if (rank === 5) return [row('大富豪で1位', progress.wonDaifugo ? 1 : 0, 1)];
        if (rank === 6) {
            const memories = window.TCG && Array.isArray(window.TCG.myCollection) ? window.TCG.myCollection.length : 0;
            const saved = (Number(progress.savedDeckCount) || 0) > (Number(progress.rank6DeckSaveBase) || 0) || !!progress.deckBuiltAtRank6;
            return [row('思い出', memories, 60), row('60枚デッキを保存', saved ? 1 : 0, 1)];
        }
        if (rank === 7) return [row('ディーラーのTCGデッキに勝利', progress.beatDealerTCG ? 1 : 0, 1)];
        if (rank === 8) return [row('自分のTCGデッキに勝利', progress.beatOwnDeckTCG ? 1 : 0, 1)];
        if (rank === 9) {
            const wins = progress.rank9Wins || {};
            return [row('ポーカー勝利', wins.poker, 3), row('大富豪勝利', wins.daifugo, 3), row('TCG勝利', wins.tcg, 3)];
        }
        return [];
    }

    function renderCasinoQuestHUD() {
        const ui = document.getElementById('casino-map-ui');
        if (!ui) return;
        let hud = document.getElementById('casino-quest-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'casino-quest-hud';
            hud.style.cssText = 'position:absolute;right:16px;top:70px;width:min(350px,calc(100vw - 32px));z-index:24;background:rgba(18,8,14,.88);border:2px solid #FFC107;border-radius:8px;padding:10px;box-shadow:0 0 12px rgba(255,193,7,.25);font-size:12px;line-height:1.45;pointer-events:none;';
            ui.appendChild(hud);
        }
        const hero = window.aiPet || {};
        const quest = getCurrentDealerQuest();
        if (!quest) {
            hud.style.display = 'none';
            return;
        }
        const qData = typeof hero.getMasterQuestData === 'function' ? hero.getMasterQuestData('dealer', quest.rank) : null;
        const rows = dealerQuestProgressRows(hero, quest);
        const isCleared = qData && typeof qData.check === 'function'
            ? !!qData.check()
            : (rows.length > 0 && rows.every(item => item.current >= item.required));
        const desc = typeof window.formatQuestDescription === 'function'
            ? window.formatQuestDescription(quest.desc || '')
            : (quest.desc || '');
        const progressHtml = rows.map(item => {
            const cleared = item.current >= item.required;
            return `<span style="display:block;color:${cleared ? '#4CAF50' : '#FFB74D'};">${item.label}: <b>${item.current} / ${item.required}${cleared ? '（達成）' : ''}</b></span>`;
        }).join('');
        hud.style.display = 'block';
        hud.style.borderColor = isCleared ? '#4CAF50' : '#FFC107';
        hud.style.boxShadow = isCleared ? '0 0 15px rgba(76,175,80,.4)' : '0 0 12px rgba(255,193,7,.25)';
        hud.innerHTML = `
            <div style="font-weight:bold;color:${isCleared ? '#4CAF50' : '#FFC107'};margin-bottom:5px;">📜 ${quest.name}</div>
            <div style="font-size:11px;color:#ddd;">${desc}</div>
            <div style="margin-top:6px;font-size:11px;">${progressHtml}</div>
            ${isCleared ? '<div style="margin-top:5px;color:#4CAF50;font-weight:bold;">条件達成！ ディーラーに報告しよう</div>' : ''}`;
    }
    window.renderCasinoQuestHUD = renderCasinoQuestHUD;

    function renderCasinoMap() {
        const state = window.ensureCasinoIndoorState();
        const grid = document.getElementById('casino-grid');
        const viewport = document.getElementById('casino-map-viewport');
        if (!state || !grid || !viewport) return;
        grid.innerHTML = '';
        grid.style.width = `${state.width * TILE}px`;
        grid.style.height = `${state.height * TILE}px`;
        const viewportW = viewport.clientWidth || window.innerWidth;
        const viewportH = viewport.clientHeight || Math.max(1, window.innerHeight - 54);
        const cameraZoom = Math.min(1, Math.max(0.72, Math.min(viewportW / (TILE * 9), viewportH / (TILE * 7))));
        const playerPixelX = state.player.x * TILE + TILE / 2;
        const playerPixelY = state.player.y * TILE + TILE / 2;
        const cameraX = viewportW / 2 - playerPixelX * cameraZoom;
        const cameraY = viewportH / 2 - playerPixelY * cameraZoom;
        grid.style.transform = `translate(${cameraX}px,${cameraY}px) scale(${cameraZoom})`;
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                const wall = state.grid[y] && state.grid[y][x] === 1;
                const tile = tileSpriteDiv(wall ? 'cmap_wall' : 'cmap_floor', x, y, wall ? 'linear-gradient(#45151f,#241016)' : 'radial-gradient(circle at 50% 20%,#7d1930,#380914)');
                grid.appendChild(tile);
            }
        }
        state.objects.forEach(obj => {
            if (!obj || obj.installing) return;
            if (obj.textIcon) {
                const sign = document.createElement('div');
                sign.style.cssText = `position:absolute;left:${obj.x * TILE}px;top:${obj.y * TILE}px;width:${(obj.w || 1) * TILE}px;height:${(obj.h || 1) * TILE}px;background:linear-gradient(135deg,#5d1a25,#1c0d12);border:2px solid #d4a23b;border-radius:12px;color:#ffd978;font-size:30px;z-index:${1100 + obj.y * 10};pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;`;
                sign.innerHTML = `<span>${obj.textIcon}</span><small style="display:block;font-size:12px">${obj.name}</small>`;
                grid.appendChild(sign);
            }
            const spriteKeys = Array.isArray(obj.keys) && obj.keys.length ? obj.keys : (obj.key ? [obj.key] : []);
            spriteKeys.forEach((key, index) => {
                const sprite = spriteDiv(key, Object.assign({}, obj, { x: obj.x + index, w: 1, partIndex: index, partCount: spriteKeys.length }));
                if (sprite) grid.appendChild(sprite);
            });
        });

        const dealer = characterDiv(resolveCharacterKey('dealer', state.dealer.dir || 'down'), state.dealer.x, state.dealer.y, 'casino-dealer');
        if (dealer) grid.appendChild(dealer);

        const hero = window.aiPet || {};
        const playerKey = resolveCharacterKey(hero.currentSkin || hero.baseType || 'robot', state.player.dir || 'down');
        const player = characterDiv(playerKey, state.player.x, state.player.y, 'casino-player', hero);
        if (player) {
            attachCasinoPlayerBubble(player, state.player);
            grid.appendChild(player);
        }

        const coin = document.getElementById('casino-coin-value');
        if (coin) coin.textContent = String(Math.floor(Number(hero.casinoCoins) || 0));
        const rank = document.getElementById('casino-rank-value');
        if (rank) rank.textContent = String((hero.apprentice && hero.apprentice.rank && hero.apprentice.rank.dealer) || 0);
        if (typeof window.renderCasinoVisitors === 'function') window.renderCasinoVisitors(grid, state, characterDiv, resolveCharacterKey);
        if (typeof window.renderCasinoVisitorHUD === 'function') window.renderCasinoVisitorHUD(state);
        renderCasinoQuestHUD();
        renderCasinoWordsPanel();
        updateCasinoRecordButton();
    }
    window.renderCasinoMap = renderCasinoMap;
    if (!window._casinoCameraResizeBound) {
        window._casinoCameraResizeBound = true;
        window.addEventListener('resize', () => {
            if (window.casinoMapOpen) renderCasinoMap();
        });
    }

    function createOverlay() {
        let ui = document.getElementById('casino-map-ui');
        if (ui) ui.remove();
        ui = document.createElement('div');
        ui.id = 'casino-map-ui';
        ui.style.cssText = 'position:fixed;inset:0;z-index:8990;background:#09040a;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;box-sizing:border-box;';
        ui.innerHTML = `
            <div style="height:54px;flex-shrink:0;display:flex;align-items:center;gap:16px;padding:0 14px;border-bottom:2px solid #c89939;background:#190a11;box-sizing:border-box;z-index:25;">
                <strong style="font-size:22px;color:#ffd56a;">🃏 CASINO</strong>
                <span>コイン <b id="casino-coin-value" style="color:#ffd56a">0</b></span>
                <span>Dealer Rank <b id="casino-rank-value">0</b></span>
                <div style="margin-left:auto;display:flex;align-items:center;gap:8px;">
                    <button id="casino-record-toggle" type="button" onclick="window.toggleCasinoRecordUI()" style="display:none;align-items:center;gap:6px;padding:8px 14px;background:linear-gradient(180deg,#8c641d,#4e300d);color:#fff1bc;border:1px solid #e2bd62;border-radius:6px;font-weight:bold;cursor:pointer;">♛ 勝敗表</button>
                    <button onclick="window.closeCasinoMapUI()" style="padding:8px 16px;background:#6c2735;color:#fff;border:1px solid #d58a96;border-radius:6px;cursor:pointer;">カジノを出る</button>
                </div>
            </div>
            <div id="casino-map-viewport" style="position:relative;flex:1;min-height:0;overflow:hidden;background:radial-gradient(circle at 50% 25%,#441027,#09040a 70%);box-shadow:inset 0 0 45px #000;">
                <div id="casino-grid" style="position:absolute;left:0;top:0;width:${MAP_W * TILE}px;height:${MAP_H * TILE}px;transform-origin:top left;transition:transform 160ms linear;"></div>
            </div>
            <aside id="casino-visitor-hud" style="position:absolute;left:14px;top:66px;z-index:24;max-width:min(420px,calc(100vw - 28px));display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(18,8,14,.78);border:1px solid rgba(255,213,106,.38);border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.32);font-size:11px;line-height:1.3;pointer-events:none;">
                <b style="color:#ffd56a;white-space:nowrap;">本日のご来店</b>
                <span data-casino-visitor-names style="color:#f3e7db;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">なし</span>
            </aside>
            <form id="casino-chat-form" style="position:absolute;left:16px;bottom:16px;width:min(600px,calc(100vw - 32px));z-index:26;background:rgba(18,8,14,.86);border:1px solid rgba(255,213,106,.48);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);box-sizing:border-box;">
                <div style="display:flex;gap:8px;align-items:center;">
                    <input id="casino-chat-input" autocomplete="off" placeholder="カジノで話しかける..." style="flex:1;min-width:0;padding:10px;background:rgba(0,0,0,.62);color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:6px;outline:none;">
                    <button type="submit" style="padding:10px 15px;background:#b9872d;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">送信</button>
                    <button id="casino-words-toggle" type="button" style="padding:10px 12px;background:rgba(255,255,255,.1);color:#fff4df;border:1px solid rgba(255,213,106,.36);border-radius:6px;font-weight:bold;cursor:pointer;">言葉</button>
                </div>
                <div id="casino-chat-message" style="margin-top:6px;min-height:18px;color:#ffd98a;font-size:12px;"></div>
            </form>
            <div id="casino-words-panel" style="display:none;position:absolute;right:16px;bottom:16px;width:min(360px,calc(100vw - 32px));max-height:44vh;overflow:auto;z-index:27;background:rgba(28,12,20,.92);border:1px solid rgba(255,213,106,.48);border-radius:8px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.48);box-sizing:border-box;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#ffd56a;font-weight:bold;">
                    <span>カジノで使える言葉</span>
                    <button id="casino-words-close" type="button" aria-label="言葉パネルを閉じる" style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;line-height:1;">×</button>
                </div>
                <div id="casino-words-list"></div>
            </div>`;
        document.body.appendChild(ui);
        window._blockChatFocus = true;
        const form = document.getElementById('casino-chat-form');
        const input = document.getElementById('casino-chat-input');
        const wordsToggle = document.getElementById('casino-words-toggle');
        const wordsPanel = document.getElementById('casino-words-panel');
        const wordsClose = document.getElementById('casino-words-close');
        const keepCasinoFocus = event => {
            window._blockChatFocus = true;
            event.stopPropagation();
        };
        input.addEventListener('mousedown', keepCasinoFocus, true);
        input.addEventListener('focus', () => { window._blockChatFocus = true; });
        input.addEventListener('keydown', event => event.stopPropagation());
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();
            const text = (input.value || '').trim();
            input.value = '';
            handleChat(text);
            input.focus();
        });
        if (wordsToggle) wordsToggle.addEventListener('click', event => {
            keepCasinoFocus(event);
            if (wordsPanel) wordsPanel.style.display = wordsPanel.style.display === 'none' ? 'block' : 'none';
            renderCasinoWordsPanel();
            input.focus();
        });
        if (wordsClose) wordsClose.addEventListener('click', event => {
            keepCasinoFocus(event);
            if (wordsPanel) wordsPanel.style.display = 'none';
            input.focus();
        });
        renderCasinoWordsPanel();
        return ui;
    }

    function handleChat(text) {
        if (!text) return;
        addLog(`指示: ${text}`);
        if (resolveCasinoPlacementReply(text)) return;
        const state = window.ensureCasinoIndoorState();
        const visitor = state && Array.isArray(state.visitors)
            ? state.visitors.find(entry => entry && entry.name && text.includes(entry.name))
            : null;
        if (/来客.*設定|ゲーム設定/.test(text)) {
            sayCasino('来客の得意ゲーム設定を開くね！');
            if (typeof window.openCasinoVisitorSettings === 'function') window.openCasinoVisitorSettings();
        } else if (visitor) {
            sayCasino(`${visitor.name}のところへ移動するね！`);
            window.interactCasinoVisitor(visitor.id);
        } else if (/^(?:おく|置く)$/.test(text)) {
            window.beginCasinoEquipmentPlacement();
        } else if (/(?:おく|置く)/.test(text) && casinoEquipmentTypeFromText(text)) {
            const type = casinoEquipmentTypeFromText(text);
            if (unplacedCasinoEquipmentCount(state, type) > 0) window.placeCasinoEquipment(type);
            else window.beginCasinoEquipmentPlacement();
        } else if (/スロット|スロットマシン/.test(text)) {
            window.handleCasinoEquipmentChat('slot_machine');
        } else if (/ポーカー.*テーブル|ポーカーテーブル/.test(text)) {
            window.handleCasinoEquipmentChat('poker_table');
        } else if (/TCG.*テーブル|tcg.*テーブル/.test(text)) {
            window.handleCasinoEquipmentChat('tcg_table');
        } else if (/カジノ.*(?:椅子|いす|イス)|(?:椅子|いす|イス)/.test(text)) {
            window.handleCasinoEquipmentChat('casino_chair');
        } else if (/ディーラー|支配人/.test(text)) {
            sayCasino('ディーラーのところへ移動するね！');
            interact('dealer');
        } else if (/コイン|チップ|トランプ|カード一式|売場|買い物|購入|設備/.test(text)) {
            sayCasino('購入はディーラーとの会話からできるよ。ディーラーのところへ移動するね！');
            interact('dealer');
        } else if (/大富豪|ポーカー|トランプゲーム|テキサスホールデム|ホールデム/.test(text)) {
            window.handleCasinoEquipmentChat('poker_table');
        } else if (/TCG|tcg|デッキ|カードゲーム|^カード$/.test(text)) {
            window.handleCasinoEquipmentChat('tcg_table');
        } else {
            sayCasino('「おく、ディーラー、コイン購入、トランプ購入、設備、スロット、ポーカー、大富豪、TCG、来客ゲーム設定」のように指示してね。', '#ff9800', 5200);
        }
    }
    window.handleCasinoChat = handleChat;

    window.playRandomCasinoContent = function () {
        const hero = window.aiPet || {};
        const progress = typeof window.ensureDealerCasinoState === 'function' ? window.ensureDealerCasinoState(hero) : (hero.dealerProgress || {});
        const rank = hero.apprentice && hero.apprentice.rank ? Number(hero.apprentice.rank.dealer) || 0 : 0;
        const choices = [];
        const ownsTrump = Object.keys(progress.purchasedTrumpDecks || {}).length > 0;
        const state = window.ensureCasinoIndoorState();
        const pokerTables = placedCasinoEquipment(state, 'poker_table');
        const tcgTables = placedCasinoEquipment(state, 'tcg_table');
        if (ownsTrump && pokerTables.length && (progress.pokerUnlocked || rank >= 3)) {
            const table = randomReachableCasinoEquipment(state, 'poker_table');
            if (table) choices.push({ equipmentType: 'poker_table', object: table, open: window.openCasinoPoker });
        }
        if (ownsTrump && pokerTables.length && (progress.daifugoUnlocked || rank >= 5)) {
            const table = randomReachableCasinoEquipment(state, 'poker_table');
            if (table) choices.push({ equipmentType: 'poker_table', object: table, open: window.openCasinoDaifugo });
        }
        if (tcgTables.length && rank >= 6 && typeof window.openCasinoTCGMenu === 'function') {
            const table = randomReachableCasinoEquipment(state, 'tcg_table');
            if (table) choices.push({ equipmentType: 'tcg_table', object: table, open: window.openCasinoTCGMenu });
        }
        const slots = placedCasinoEquipment(state, 'slot_machine');
        const slot = slots.length ? randomReachableCasinoEquipment(state, 'slot_machine') : null;
        if (slot && typeof window.openCasinoSlotGame === 'function') {
            choices.push({ equipmentType: 'slot_machine', object: slot, open: window.openCasinoSlotGame });
        }
        if (!choices.length) {
            interact('dealer');
            return;
        }
        const choice = choices[Math.floor(Math.random() * choices.length)];
        if (choice.equipmentType) {
            window.routeCasinoPlayerToEquipment(choice.equipmentType, choice.object, () => {
                if (typeof window.setCasinoCardGameContext === 'function') {
                    window.setCasinoCardGameContext({ source: 'table', lockedVisitors: [] });
                }
                if (typeof choice.open === 'function') choice.open();
            });
            return;
        }
        window.routeCasinoPlayerTo(choice.stop, () => {
            if (typeof window.setCasinoCardGameContext === 'function') {
                window.setCasinoCardGameContext({ source: 'table', lockedVisitors: [] });
            }
            if (typeof choice.open === 'function') choice.open();
        });
    };

    function modal(id, title, content) {
        let old = document.getElementById(id);
        if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:130000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;';
        overlay.innerHTML = `<div style="width:min(720px,92vw);max-height:88vh;overflow:auto;background:#211018;border:3px solid #c89939;border-radius:14px;padding:22px;box-shadow:0 20px 80px #000;"><div style="display:flex;align-items:center;justify-content:space-between;gap:16px;"><h2 style="margin:0;color:#ffd56a;">${title}</h2><button data-close style="padding:7px 14px;background:#672938;color:#fff;border:1px solid #a95a67;border-radius:6px;cursor:pointer;">閉じる</button></div><div style="margin-top:16px;">${content}</div></div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('[data-close]').onclick = () => overlay.remove();
        return overlay;
    }

    window.openCasinoEquipmentShop = function () {
        const hero = window.aiPet;
        if (!hero) return;
        if (!dealerMasteredForEquipment(hero)) {
            modal('casino-equipment-shop-ui', 'カジノ設備売場', '<p>カジノ設備の販売は、ディーラー免許皆伝後に解放されます。</p>');
            return;
        }
        const progress = window.ensureDealerCasinoState(hero);
        const state = window.ensureCasinoIndoorState();
        const cards = Object.entries(CASINO_EQUIPMENT_CATALOG).map(([type, config]) => {
            const owned = Math.max(0, Number(progress.purchasedCasinoEquipment[type]) || 0);
            const installed = placedPurchasedCasinoEquipment(state, type).length;
            const builtIn = placedCasinoEquipment(state, type).filter(obj => obj.builtIn).length;
            const stock = Math.max(0, owned - installed);
            const affordable = Number(hero.casinoCoins || 0) >= config.price;
            const button = `<button onclick="window.buyCasinoEquipment('${type}')" style="padding:9px 14px;border:1px solid #e0b954;border-radius:7px;background:${affordable ? '#805519' : '#483b32'};color:${affordable ? '#fff4c2' : '#999'};font-weight:bold;cursor:${affordable ? 'pointer' : 'not-allowed'};">${config.price}コイン</button>`;
            const builtInLabel = builtIn ? ` ・ 初期配置 ${builtIn}` : '';
            return `<div style="display:grid;grid-template-columns:54px 1fr auto;gap:13px;align-items:center;padding:13px;border:1px solid #563a43;border-radius:10px;background:rgba(255,255,255,.035);"><span style="display:grid;place-items:center;width:50px;height:50px;border-radius:10px;background:#10080c;font-size:28px;">${config.icon}</span><div><b style="color:#ffe6a2;">${config.name}</b><div style="margin-top:4px;color:#c4b5ba;font-size:12px;line-height:1.5;">${config.desc}</div><small style="color:#d6a744;">購入 ${owned} ・ 追加設置 ${installed} ・ 未設置 ${stock}${builtInLabel}</small></div>${button}</div>`;
        }).join('');
        modal('casino-equipment-shop-ui', 'カジノ設備売場', `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px;"><p style="margin:0;color:#cfc1c5;">購入後、カジノ内のチャットで「おく」と指示すると、空き場所へ設置します。購入上限はありません。</p><b style="white-space:nowrap;color:#ffd56a;">🪙 ${Number(hero.casinoCoins || 0).toLocaleString()}</b></div><div id="casino-equipment-shop-notice" style="min-height:18px;margin-bottom:8px;text-align:center;color:#ff9da9;font-size:12px;font-weight:bold;"></div><div style="display:grid;gap:10px;">${cards}</div>`);
    };

    window.buyCasinoEquipment = function (type) {
        const hero = window.aiPet;
        const config = CASINO_EQUIPMENT_CATALOG[type];
        if (!hero || !config || !dealerMasteredForEquipment(hero)) return false;
        const progress = window.ensureDealerCasinoState(hero);
        const owned = Math.max(0, Math.floor(Number(progress.purchasedCasinoEquipment[type]) || 0));
        if (Number(hero.casinoCoins || 0) < config.price) {
            addLog(`${config.name}を購入するためのカジノコインが足りません。`);
            const notice = document.getElementById('casino-equipment-shop-notice');
            if (notice) notice.textContent = `${config.name}の購入には${config.price}コイン必要です。`;
            return false;
        }
        hero.casinoCoins -= config.price;
        progress.purchasedCasinoEquipment[type] = owned + 1;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        renderCasinoMap();
        addLog(`${config.name}を${config.price}コインで購入しました。チャットで「おく」と指示すると設置します。`);
        window.openCasinoEquipmentShop();
        return true;
    };

    window.openCasinoCoinShop = function () {
        const hero = window.aiPet;
        if (!hero) return;
        const buttons = [1, 10, 20, 50].map(amount => `<button type="button" onclick="window.addCasinoCoinPurchaseAmount(${amount})" style="padding:16px;background:#4e2630;color:#fff;border:1px solid #c89939;border-radius:8px;cursor:pointer;"><b>＋${amount}コイン</b><br><small>入力枚数に加算</small></button>`).join('');
        const overlay = modal('casino-coin-shop-ui', 'カジノコイン購入', `
            <p>1コイン = 1000G。購入したコインは「マップを引き継ぐ」を選んだ世代交代でのみ残ります。</p>
            <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;">${buttons}</div>
            <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end;margin-top:18px;padding:16px;border:1px solid #563a43;border-radius:10px;background:rgba(255,255,255,.035);">
                <label style="display:grid;gap:7px;color:#ffe6a2;font-weight:bold;">
                    購入する枚数
                    <input id="casino-coin-purchase-amount" type="number" min="0" step="1" value="0" inputmode="numeric" style="width:100%;box-sizing:border-box;padding:12px 14px;background:#10080c;color:#fff;border:1px solid #c89939;border-radius:7px;font-size:20px;font-weight:bold;">
                </label>
                <button type="button" onclick="window.confirmCasinoCoinPurchase()" style="min-width:150px;padding:13px 20px;background:linear-gradient(180deg,#9a6a19,#68420e);color:#fff4c2;border:2px solid #d3a33f;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;">購入</button>
            </div>
            <div id="casino-coin-purchase-preview" style="margin-top:10px;color:#ffd56a;font-weight:bold;">購入予定: 0コイン ／ 0G</div>
            <div id="casino-coin-shop-notice" aria-live="polite" style="min-height:20px;margin-top:6px;color:#ff9da9;font-size:13px;font-weight:bold;"></div>
            <p>所持金: <b id="casino-shop-gold">${Number(hero.gold || 0).toLocaleString()}G</b> ／ コイン: <b id="casino-shop-coins">${hero.casinoCoins || 0}</b></p>`);
        const input = overlay.querySelector('#casino-coin-purchase-amount');
        if (input) input.addEventListener('input', window.updateCasinoCoinPurchasePreview);
    };

    function normalizedCasinoCoinPurchaseAmount(value) {
        const amount = Number(value);
        if (!Number.isSafeInteger(amount) || amount <= 0 || amount > Math.floor(Number.MAX_SAFE_INTEGER / 1000)) return 0;
        return amount;
    }

    window.updateCasinoCoinPurchasePreview = function () {
        const input = document.getElementById('casino-coin-purchase-amount');
        const preview = document.getElementById('casino-coin-purchase-preview');
        if (!preview) return;
        const amount = normalizedCasinoCoinPurchaseAmount(input && input.value);
        preview.textContent = `購入予定: ${amount.toLocaleString()}コイン ／ ${(amount * 1000).toLocaleString()}G`;
    };

    window.addCasinoCoinPurchaseAmount = function (amount) {
        const input = document.getElementById('casino-coin-purchase-amount');
        if (!input) return;
        const current = Math.max(0, Math.floor(Number(input.value) || 0));
        const addition = Math.max(0, Math.floor(Number(amount) || 0));
        input.value = String(Math.min(Math.floor(Number.MAX_SAFE_INTEGER / 1000), current + addition));
        window.updateCasinoCoinPurchasePreview();
        const notice = document.getElementById('casino-coin-shop-notice');
        if (notice) {
            notice.style.color = '#ff9da9';
            notice.textContent = '';
        }
        input.focus();
    };

    window.confirmCasinoCoinPurchase = function () {
        const input = document.getElementById('casino-coin-purchase-amount');
        return window.buyCasinoCoins(input && input.value);
    };

    window.buyCasinoCoins = function (amount) {
        amount = normalizedCasinoCoinPurchaseAmount(amount);
        const hero = window.aiPet;
        const notice = document.getElementById('casino-coin-shop-notice');
        if (notice) notice.style.color = '#ff9da9';
        if (!hero || !amount) {
            if (notice) notice.textContent = '1枚以上の整数を入力してください。';
            return false;
        }
        const cost = amount * 1000;
        if ((Number(hero.gold) || 0) < cost) {
            if (notice) notice.textContent = `${amount.toLocaleString()}コインの購入には${cost.toLocaleString()}G必要です。`;
            return false;
        }
        const progress = window.ensureDealerCasinoState(hero);
        hero.gold -= cost;
        hero.casinoCoins += amount;
        progress.coinsPurchased = (Number(progress.coinsPurchased) || 0) + amount;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        if (typeof window.updateStatUI === 'function') window.updateStatUI();
        renderCasinoMap();
        addLog(`${amount}コインを購入した。`);
        if (notice) {
            notice.style.color = '#7ce0a5';
            notice.textContent = `${amount.toLocaleString()}コインを購入しました。`;
        }
        const gold = document.getElementById('casino-shop-gold');
        const coins = document.getElementById('casino-shop-coins');
        const input = document.getElementById('casino-coin-purchase-amount');
        if (gold) gold.textContent = `${Number(hero.gold || 0).toLocaleString()}G`;
        if (coins) coins.textContent = String(hero.casinoCoins);
        if (input) input.value = '0';
        window.updateCasinoCoinPurchasePreview();
        return true;
    };

    function hasPlayedSpecies(species) {
        const hero = window.aiPet || {};
        if (String(hero.baseType || hero.currentSkin || '').split('_')[0] === species) return true;
        const discovered = Array.isArray(hero.discoveredMonsters) ? hero.discoveredMonsters : [];
        return discovered.some(entry => String(typeof entry === 'string' ? entry : (entry && (entry.id || entry.type)) || '').split('_')[0] === species);
    }

    function trumpPreview(species) {
        return typeof window.renderCasinoTrumpCard === 'function'
            ? window.renderCasinoTrumpCard({ suit: 'spade', rank: 14 }, { width: 76, height: 100, species })
            : '<div style="width:76px;height:100px;background:#fff;"></div>';
    }

    function canPurchaseCasinoTrumpNow(hero) {
        const app = hero && hero.apprentice;
        const rank = app && app.rank ? Number(app.rank.dealer) || 0 : 0;
        if (rank > 2) return true;
        return !!(app && Array.isArray(app.activeQuests) && app.activeQuests.some(q => q && q.masterType === 'dealer' && Number(q.rank) === 2));
    }

    window.openCasinoTrumpShop = function () {
        const hero = window.aiPet;
        if (!hero) return;
        if (!canPurchaseCasinoTrumpNow(hero)) {
            modal('casino-trump-shop-ui', 'トランプ売場', '<p>トランプの販売は、Dealer Rank 2の課題を受けてから始まります。</p>');
            return;
        }
        const progress = window.ensureDealerCasinoState(hero);
        const rows = BASE_SPECIES.filter(hasPlayedSpecies).map(species => {
            const owned = !!progress.purchasedTrumpDecks[species];
            const active = progress.activeTrumpSpecies === species;
            const action = owned
                ? `<button ${active ? 'disabled' : ''} onclick="window.setActiveCasinoTrumpDeck('${species}')" style="padding:10px 16px;background:${active ? '#6d5426' : '#3b315b'};color:#fff;border:1px solid #c89939;border-radius:6px;">${active ? '使用中' : 'この柄を使う'}</button>`
                : `<button onclick="window.buyCasinoTrumpDeck('${species}')" style="padding:10px 16px;background:#7d3b2b;color:#fff;border:1px solid #c89939;border-radius:6px;cursor:pointer;">50コイン</button>`;
            return `<div style="display:flex;align-items:center;gap:14px;padding:10px;border-bottom:1px solid #4f3037;">${trumpPreview(species)}<div style="flex:1"><b>${SPECIES_NAMES[species] || species}柄トランプ一式</b></div>${action}</div>`;
        }).join('');
        modal('casino-trump-shop-ui', 'トランプ売場', rows || '<p>まだ販売できる種族柄がありません。新しい種族で一度プレイすると入荷します。</p>');
    };

    window.buyCasinoTrumpDeck = function (species) {
        const hero = window.aiPet;
        if (!hero || !canPurchaseCasinoTrumpNow(hero) || !BASE_SPECIES.includes(species) || !hasPlayedSpecies(species)) return;
        const progress = window.ensureDealerCasinoState(hero);
        if (progress.purchasedTrumpDecks[species]) return;
        if (hero.casinoCoins < 50) {
            alert('カジノコインが足りません。');
            return;
        }
        hero.casinoCoins -= 50;
        progress.purchasedTrumpDecks[species] = { purchasedAt: Date.now() };
        progress.trumpDecksPurchased = (Number(progress.trumpDecksPurchased) || 0) + 1;
        if (!progress.activeTrumpSpecies) progress.activeTrumpSpecies = species;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        renderCasinoMap();
        addLog(`${SPECIES_NAMES[species] || species}柄トランプ一式を購入した。`);
        window.openCasinoTrumpShop();
    };

    window.setActiveCasinoTrumpDeck = function (species) {
        const hero = window.aiPet;
        const progress = hero && window.ensureDealerCasinoState(hero);
        if (!progress || !progress.purchasedTrumpDecks[species]) return;
        progress.activeTrumpSpecies = species;
        if (typeof window.saveGameData === 'function') window.saveGameData();
        window.openCasinoTrumpShop();
    };

    window.openCasinoTrumpGameShop = function () {
        const hero = window.aiPet;
        if (!hero) return;
        if (!dealerMasteredForEquipment(hero)) {
            modal('casino-trump-game-shop-ui', 'トランプゲーム売場', '<p>追加トランプゲームの販売は、ディーラー免許皆伝後に解放されます。</p>');
            return;
        }
        const progress = window.ensureDealerCasinoState(hero);
        const rows = Object.entries(CASINO_TRUMP_GAME_CATALOG).map(([game, config]) => {
            const owned = !!progress.purchasedTrumpGames[game];
            const affordable = Number(hero.casinoCoins || 0) >= config.price;
            const action = owned
                ? '<button type="button" disabled style="padding:9px 14px;border:1px solid #8d7137;border-radius:7px;background:#5d4b28;color:#f3dfaa;font-weight:bold;">購入済み</button>'
                : `<button type="button" onclick="window.buyCasinoTrumpGame('${game}')" style="padding:9px 14px;border:1px solid #e0b954;border-radius:7px;background:${affordable ? '#805519' : '#483b32'};color:${affordable ? '#fff4c2' : '#999'};font-weight:bold;cursor:${affordable ? 'pointer' : 'not-allowed'};">${config.price}コイン</button>`;
            return `<div style="display:grid;grid-template-columns:50px 1fr auto;gap:13px;align-items:center;padding:13px;border:1px solid #563a43;border-radius:10px;background:rgba(255,255,255,.035);"><span style="display:grid;place-items:center;width:46px;height:58px;border:2px solid #f3e8da;border-radius:7px;background:#f8f6f0;color:#241018;font:900 28px Georgia,serif;">${config.icon}</span><div><b style="color:#ffe6a2;">${config.name}</b><div style="margin-top:4px;color:#c4b5ba;font-size:12px;line-height:1.5;">${config.desc}</div></div>${action}</div>`;
        }).join('');
        modal('casino-trump-game-shop-ui', 'トランプゲーム売場', `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px;"><p style="margin:0;color:#cfc1c5;">購入したゲームは、トランプゲーム一覧から遊べます。</p><b style="white-space:nowrap;color:#ffd56a;">🪙 ${Number(hero.casinoCoins || 0).toLocaleString()}</b></div><div id="casino-trump-game-shop-notice" style="min-height:18px;margin-bottom:8px;text-align:center;color:#ff9da9;font-size:12px;font-weight:bold;"></div><div style="display:grid;gap:10px;">${rows}</div>`);
    };

    window.buyCasinoTrumpGame = function (game) {
        const hero = window.aiPet;
        const config = CASINO_TRUMP_GAME_CATALOG[game];
        if (!hero || !config || !dealerMasteredForEquipment(hero)) return false;
        const progress = window.ensureDealerCasinoState(hero);
        if (progress.purchasedTrumpGames[game]) return false;
        if (Number(hero.casinoCoins || 0) < config.price) {
            const notice = document.getElementById('casino-trump-game-shop-notice');
            if (notice) notice.textContent = `${config.name}の購入には${config.price}コイン必要です。`;
            addLog(`${config.name}を購入するためのカジノコインが足りません。`);
            return false;
        }
        hero.casinoCoins -= config.price;
        progress.purchasedTrumpGames[game] = { purchasedAt: Date.now() };
        if (typeof window.saveGameData === 'function') window.saveGameData();
        renderCasinoMap();
        addLog(`${config.name}を${config.price}コインで購入しました。`);
        window.openCasinoTrumpGameShop();
        return true;
    };

    window.openCasinoCardGameMenu = function () {
        const hero = window.aiPet || {};
        const progress = window.ensureDealerCasinoState(hero);
        const rank = hero.apprentice && hero.apprentice.rank ? Number(hero.apprentice.rank.dealer) || 0 : 0;
        const ownsTrump = Object.keys(progress.purchasedTrumpDecks || {}).length > 0;
        const pokerUnlocked = !!progress.pokerUnlocked || rank >= 3;
        const daifugoUnlocked = !!progress.daifugoUnlocked || rank >= 5;
        const indianPokerUnlocked = !!progress.purchasedTrumpGames.indianPoker;
        const texasHoldemUnlocked = !!progress.purchasedTrumpGames.texasHoldem;
        const games = [
            {
                id: 'poker', mark: '♠', name: '5カードドロー・ポーカー', tag: 'POKER', unlocked: pokerUnlocked,
                desc: '5枚から交換する札を選び、役の強さで1対1の勝負。', locked: 'Dealer Rank 3で解放'
            },
            {
                id: 'daifugo', mark: '♣', name: '大富豪', tag: 'DAIFUGO', unlocked: daifugoUnlocked,
                desc: '4～6人対戦。階級交換・ローカルルール・対戦数を選んで最速の上がりを狙う。', locked: 'Dealer Rank 5で解放'
            },
            {
                id: 'indian_poker', mark: '♦', name: 'インディアンポーカー', tag: 'INDIAN POKER', unlocked: indianPokerUnlocked,
                desc: '2～4人対戦。自分の札だけ見えない状態で、相手の札から勝負を読む。', locked: '免許皆伝後、ディーラーから購入', requiresPurchase: true
            },
            {
                id: 'texas_holdem', mark: '♥', name: 'テキサスホールデム', tag: 'TEXAS HOLD\'EM', unlocked: texasHoldemUnlocked,
                desc: '5～8人対戦。2枚の手札と5枚の共通札から最強の5枚を作る。', locked: '免許皆伝後、ディーラーから購入', requiresPurchase: true
            }
        ];
        const gameCards = games.filter(game => !game.requiresPurchase || game.unlocked).map(game => {
            const enabled = ownsTrump && game.unlocked;
            const status = !game.unlocked ? game.locked : !ownsTrump ? '先にトランプ一式を購入してください' : 'プレイできます';
            return `<button type="button" class="casino-card-game-choice${enabled ? '' : ' is-locked'}" ${enabled ? `onclick="window.launchCasinoCardGame('${game.id}')"` : 'disabled'}><span class="casino-card-game-mark">${game.mark}</span><span class="casino-card-game-copy"><small>${game.tag}</small><strong>${game.name}</strong><span>${game.desc}</span><b>${status}</b></span><span class="casino-card-game-arrow">›</span></button>`;
        }).join('');

        window.closeCasinoCardGameMenu();
        const overlay = document.createElement('dialog');
        overlay.id = 'casino-card-game-menu';
        overlay.setAttribute('aria-label', 'トランプゲーム選択');
        overlay.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;z-index:2147483000;background:radial-gradient(circle,#3b1022,#050305 72%);color:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;box-sizing:border-box;';
        overlay.innerHTML = `<style>
            #casino-card-game-menu::backdrop{background:rgba(0,0,0,.82);backdrop-filter:blur(3px)}
            .casino-card-game-shell{width:min(820px,94vw);max-height:92vh;overflow:auto;padding:24px 28px 28px;border:3px solid #c89939;border-radius:22px;background:linear-gradient(145deg,rgba(34,8,18,.98),rgba(9,3,6,.99));box-sizing:border-box;box-shadow:0 0 0 1px #ffdb75 inset,0 24px 80px #000,0 0 42px rgba(200,153,57,.2)}
            .casino-card-game-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:18px;border-bottom:1px solid rgba(255,213,106,.28)}
            .casino-card-game-head h2{display:flex;align-items:center;gap:12px;margin:0;color:#ffd56a;font-size:26px}.casino-card-game-head h2 span{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(145deg,#ffd86e,#9c6516);color:#21070f}
            .casino-card-game-close{appearance:none;padding:10px 16px;border:1px solid #9b536a;border-radius:10px;background:linear-gradient(180deg,#5a2638,#2b101a);color:#f9d9e3;font-weight:bold;cursor:pointer}
            .casino-card-game-lead{margin:18px 2px;color:#cdbec3;font-size:13px;line-height:1.7}
            .casino-card-game-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
            .casino-card-game-choice{appearance:none;display:grid;grid-template-columns:66px 1fr 24px;align-items:center;gap:14px;min-height:178px;padding:20px;text-align:left;border:1px solid #b47b2a;border-radius:16px;background:linear-gradient(145deg,rgba(117,56,30,.35),rgba(60,20,42,.62));color:#fff;cursor:pointer;box-shadow:inset 0 1px rgba(255,255,255,.09),0 8px 24px rgba(0,0,0,.3);transition:transform .18s,filter .18s,border-color .18s,box-shadow .18s}
            .casino-card-game-choice:hover{transform:translateY(-4px);filter:brightness(1.12);border-color:#ffd56a;box-shadow:inset 0 1px rgba(255,255,255,.12),0 13px 28px rgba(0,0,0,.4),0 0 18px rgba(255,202,40,.16)}
            .casino-card-game-choice.is-locked{filter:grayscale(.7);opacity:.48;cursor:not-allowed}.casino-card-game-choice.is-locked:hover{transform:none;border-color:#b47b2a;box-shadow:inset 0 1px rgba(255,255,255,.09),0 8px 24px rgba(0,0,0,.3)}
            .casino-card-game-mark{display:grid;place-items:center;width:62px;height:82px;border:2px solid #f3e8da;border-radius:10px;background:#f8f6f0;color:#241018;font-size:38px;box-shadow:0 6px 16px rgba(0,0,0,.45);transform:rotate(-4deg)}
            .casino-card-game-copy{display:grid;gap:6px}.casino-card-game-copy small{color:#d6a744;font-size:9px;font-weight:900;letter-spacing:.2em}.casino-card-game-copy strong{color:#fff1c7;font-size:18px}.casino-card-game-copy span{min-height:42px;color:#c8b9be;font-size:12px;line-height:1.55}.casino-card-game-copy b{color:#ffd56a;font-size:11px}.casino-card-game-choice.is-locked .casino-card-game-copy b{color:#aaa}
            .casino-card-game-arrow{color:#ffd56a;font-size:34px;text-align:right}
            @media(max-width:680px){.casino-card-game-shell{padding:18px 14px}.casino-card-game-grid{grid-template-columns:1fr}.casino-card-game-choice{min-height:150px}.casino-card-game-head h2{font-size:21px}}
        </style><div class="casino-card-game-shell"><div class="casino-card-game-head"><h2><span>🃏</span>トランプゲーム</h2><button type="button" class="casino-card-game-close" onclick="window.closeCasinoCardGameMenu()">× 閉じる</button></div><p class="casino-card-game-lead">遊ぶゲームを選んでください。</p><div class="casino-card-game-grid">${gameCards}</div></div>`;
        overlay.addEventListener('cancel', event => {
            event.preventDefault();
            window.closeCasinoCardGameMenu();
        });
        document.body.appendChild(overlay);
        if (typeof overlay.showModal === 'function') {
            try { overlay.showModal(); }
            catch (error) { console.warn('トランプゲーム選択をtop layerへ移動できませんでした。', error); overlay.setAttribute('open', ''); }
        } else {
            overlay.setAttribute('open', '');
        }
    };

    window.closeCasinoCardGameMenu = function () {
        const overlay = document.getElementById('casino-card-game-menu');
        if (!overlay) return;
        if (typeof overlay.close === 'function' && overlay.open) overlay.close();
        overlay.remove();
    };

    window.launchCasinoCardGame = function (gameId) {
        const progress = window.ensureDealerCasinoState(window.aiPet || {});
        if (gameId === 'indian_poker' && !progress.purchasedTrumpGames.indianPoker) return false;
        if (gameId === 'texas_holdem' && !progress.purchasedTrumpGames.texasHoldem) return false;
        window.closeCasinoCardGameMenu();
        if (gameId === 'poker' && typeof window.openCasinoPoker === 'function') window.openCasinoPoker();
        else if (gameId === 'daifugo' && typeof window.openCasinoDaifugo === 'function') window.openCasinoDaifugo();
        else if (gameId === 'indian_poker' && typeof window.openCasinoIndianPoker === 'function') window.openCasinoIndianPoker();
        else if (gameId === 'texas_holdem' && typeof window.openCasinoTexasHoldem === 'function') window.openCasinoTexasHoldem();
        return true;
    };

    function rejectCasinoEntry(message) {
        if (movementTimer) clearInterval(movementTimer);
        movementTimer = null;
        currentPath = [];
        window._casinoInstallingEquipmentId = null;
        if (typeof window.closeCasinoSlotGame === 'function') window.closeCasinoSlotGame();
        ['casino-map-ui', 'casino-coin-shop-ui', 'casino-trump-shop-ui', 'casino-trump-game-shop-ui', 'casino-equipment-shop-ui', 'casino-card-game-menu', 'casino-tcg-menu-ui', 'casino-record-ui'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        window.casinoMapOpen = false;
        window._blockChatFocus = false;
        window.pendingCasinoEntryAfterDealerEncounter = null;
        window._dealerEncounterInProgress = false;

        const hero = window.aiPet;
        if (hero) {
            hero.actionState = 'idle';
            hero.isIndoors = false;
            hero.indoorTarget = null;
            hero.interactionTarget = null;
            hero.visualAction = null;
            hero.visualScale = 1;
            hero.exploreTimer = 0;
            hero.message = message;
            hero.messageTimer = 180;
        }
        if (window.audioManager && typeof window.audioManager.restoreMainBGM === 'function') {
            window.audioManager.restoreMainBGM();
        }
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        if (typeof window.updateCommandHUD === 'function') window.updateCommandHUD();
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial('🎰 カジノ', message);
        } else {
            modal('casino-entry-message-ui', 'カジノ', `<p>${message}</p>`);
        }
        return false;
    }

    window.openCasinoMapUI = function (options) {
        options = options || {};
        const hero = window.aiPet;
        if (!hero || !window.hasBuiltCasino || !window.hasBuiltCasino()) {
            return rejectCasinoEntry('カジノが建っていません。');
        }
        const state = window.ensureCasinoIndoorState();
        if (!options.preservePosition) Object.assign(state.player, ENTRANCE);
        clearCasinoPlacementPrompt();
        clearCasinoPlayerBubble(state);
        window.ensureDealerCasinoState(hero);
        if (typeof window.refreshCasinoVisitors === 'function') window.refreshCasinoVisitors(state);
        if (typeof window.markTCGCasinoVisited === 'function') window.markTCGCasinoVisited();
        if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('visit_casino', hero.generation || 1);
        hero.visitedCasino = true;
        window.casinoMapOpen = true;
        hero.isIndoors = true;
        hero.actionState = 'inside';
        hero.indoorTarget = { type: 'casino', name: 'カジノ' };
        if (window.audioManager && typeof window.audioManager.playBGM === 'function') window.audioManager.playBGM('card_lobby');
        createOverlay();
        renderCasinoMap();
        addLog('カジノへ入場しました。チャットで行き先や遊びたいゲームを指示してください。');
        if (typeof window.saveGameData === 'function') window.saveGameData();

        const met = hero.apprentice && Array.isArray(hero.apprentice.metMasters) && hero.apprentice.metMasters.includes('dealer');
        if (!met && !window._dealerEncounterInProgress) {
            window._dealerEncounterInProgress = true;
            window.pendingCasinoEntryAfterDealerEncounter = function () {
                window.routeCasinoPlayerTo('dealer', () => addLog('ディーラーのポーカーテーブルへ到着した。'));
            };
            setTimeout(() => {
                if (typeof window.checkMasterVisit === 'function') window.checkMasterVisit('dealer');
            }, 160);
        }
        return true;
    };

    window.closeCasinoMapUI = function () {
        if (movementTimer) clearInterval(movementTimer);
        movementTimer = null;
        currentPath = [];
        window._casinoInstallingEquipmentId = null;
        clearCasinoPlacementPrompt();
        if (window._casinoSpeechTimer) {
            clearTimeout(window._casinoSpeechTimer);
            window._casinoSpeechTimer = null;
        }
        clearCasinoPlayerBubble(window.ensureCasinoIndoorState());
        if (typeof window.closeCasinoPoker === 'function') window.closeCasinoPoker();
        if (typeof window.closeCasinoDaifugo === 'function') window.closeCasinoDaifugo();
        if (typeof window.closeCasinoIndianPoker === 'function') window.closeCasinoIndianPoker();
        if (typeof window.closeCasinoTexasHoldem === 'function') window.closeCasinoTexasHoldem();
        if (typeof window.closeCasinoSlotGame === 'function') window.closeCasinoSlotGame();
        ['casino-map-ui', 'casino-coin-shop-ui', 'casino-trump-shop-ui', 'casino-trump-game-shop-ui', 'casino-equipment-shop-ui', 'casino-card-game-menu', 'casino-tcg-menu-ui', 'casino-visitor-settings-ui', 'casino-record-ui'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
        window.casinoMapOpen = false;
        window._blockChatFocus = false;
        const hero = window.aiPet;
        if (hero) {
            hero.isIndoors = false;
            hero.actionState = 'idle';
            hero.indoorTarget = null;
            hero.interactionTarget = null;
        }
        if (window.audioManager && typeof window.audioManager.restoreMainBGM === 'function') window.audioManager.restoreMainBGM();
        if (typeof window.saveGameData === 'function') window.saveGameData();
    };
})();
