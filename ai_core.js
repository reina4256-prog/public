// ai_core.js : AIのコアロジック (Fixed Version v30 - Absolute Evolution Safety)

if (typeof window.aiPet === 'undefined') {
    window.aiPet = {};
}

// ==========================================
// ★追加：入門試験（一問一答）のキーワード定義（類義語・超許容版）
// ==========================================
window.EXAM_KEYWORDS = {
    'explore': { 
        accepts: [
            ['地図', 'マップ', '地図帳', 'マップアプリ'], 
            ['水筒', '水', '飲み物', 'お茶', 'ペットボトル', 'ボトル'], 
            ['コンパス', '方位磁針', '方位磁石', '磁石', '方位']
        ], 
        q1: "探検で自分の位置を知る道具は？", q2: "喉の渇きを潤すために必要なものは？", q3: "方角を知るために必要なものは？" 
    },
    'farming': { 
        accepts: [
            ['太陽', '日光', '光', 'お日様', '日差し', 'おひさま'], 
            ['土', '大地', '土壌', '畑', '地面', '泥'], 
            ['水', '雨', '水分', '水やり', 'みず']
        ], 
        q1: "作物に光を与える自然の恵みは？", q2: "作物が根を張るための大地を何と呼ぶ？", q3: "作物を潤す命の源は？" 
    },
    'fishing': { 
        accepts: [
            ['竿', '釣り竿', 'つりざお', 'ロッド', 'さお'], 
            ['糸', '釣り糸', 'ライン', 'いと', '釣り糸'], 
            ['エサ', '餌', 'えさ', 'ルアー', '疑似餌', 'ワーム']
        ], 
        q1: "魚を釣るための長い棒を何と言う？", q2: "竿の先から垂らす細い線は？", q3: "魚をおびき寄せるための食べ物は？" 
    },
    'cooking': { 
        accepts: [
            ['包丁', 'ナイフ', '刃物', 'ほうちょう'], 
            ['鍋', 'なべ', 'フライパン', 'ボウル', 'お鍋'], 
            ['火', '炎', '熱', 'ガス', 'コンロ', '火加減']
        ], 
        q1: "食材を切るための道具は？", q2: "スープを煮込むための容器は？", q3: "食材を加熱するために必要なものは？" 
    },
    'smithing': { 
        accepts: [
            ['鉄', '金属', '鉱石', '鋼', 'アイアン', '鉄鉱石'], 
            ['ハンマー', '金槌', 'かなづち', 'トンカチ', '槌'], 
            ['炉', '火', 'かまど', '溶鉱炉', 'ふいご', '炎']
        ], 
        q1: "剣や鎧の材料となる硬い金属は？", q2: "熱した金属を叩くための道具は？", q3: "金属を赤く熱するための設備は？" 
    },
    'building': { 
        accepts: [
            ['図面', '設計図', '計画', '設計', '青写真', '完成図', '見取り図'], 
            ['木材', '木', '板', '柱', '丸太', 'もくざい'], 
            ['トンカチ', 'ハンマー', '金槌', 'かなづち', '釘打ち']
        ], 
        q1: "建物の完成図を描いた紙を何と呼ぶ？", q2: "柱や壁の材料になる木の板は？", q3: "釘を打つための道具は？" 
    }
};

// ★完全安全化: 特性データの取得エラーをゼロにする
aiPet.getTraitData = function() {
    if (typeof charaTraits === 'undefined') return { consumption: 1.0, statBonus: { power: 1.0, intel: 1.0, mood: 1.0 } };
    
    let key = this.currentSkin || this.baseType || 'robot';
    let base = key.split('_')[0] || 'robot';
    let data = charaTraits[key] || charaTraits[base] || charaTraits['robot'];
    
    return {
        consumption: (data && data.consumption !== undefined) ? data.consumption : 1.0,
        statBonus: (data && data.statBonus) ? data.statBonus : { power: 1.0, intel: 1.0, mood: 1.0 }
    };
};

function getTaskName(type, task = null) {
    // UI側からtaskオブジェクトが渡されなかった場合は、現在のスケジュールから推測する
    if (!task && typeof window.aiPet !== 'undefined' && window.aiPet.schedule) {
        task = window.aiPet.schedule.find(t => t.type === type);
    }

    // ★追加：バイト名の動的生成
    if (task && task.isBaito && task.baitoWord) {
        return `バイト（${task.baitoWord}）`;
    }

    if(type==='study') return "勉強"; if(type==='train') return "筋トレ"; if(type==='run') return "ランニング";
    if(type==='rest' || type==='sleep') return "睡眠"; 
    if(type==='explore') return "探検"; if(type==='eat') return "食事"; if(type==='project') return "計画実行";
    // ★追加：農業の日本語化
    if (type === 'farm') {
        if (task && task.farmActionName) return `畑の${task.farmActionName}`;
        return "農業（予定）";
    }
    if(type==='fish') return "釣り"; 
    if(type==='cook') return "料理"; 
    if(type==='smith') return "鍛冶"; 
    // ★修正：建築と拡張の具体的な表示に対応
    if(type==='build') {
        if (task && task.buildData) {
            if (task.buildData.isUpgrade) return `${task.buildData.name}拡張`;
            return `${task.buildData.name}建築`;
        }
        return "建築";
    }
    if(type==='master_quest') return "課題の実行"; 

    if(type==='apprentice_exam' || type==='visit_master') {
        if (task && task.masterType && typeof window.aiPet !== 'undefined') {
            const mType = task.masterType;
            const mNames = { 'explore': '冒険家', 'farming': '農家', 'fishing': '漁師', 'cooking': '料理人', 'smithing': '鍛冶師', 'building': '建築士' };
            const mName = mNames[mType] || '専門家';
            const app = window.aiPet.apprentice || {};
            
            if (type === 'apprentice_exam') return `${mName}の入門試験`;

            let isBanned = (app.excommunicatedFrom === mType) || (app.attempts && app.attempts[mType] >= 3);
            // ★修正後（上書き）：過去の師匠を除外！
            let isMastered = (app.rank && app.rank[task.masterType] >= 10);
            let isApprentice = (app.currentMaster === mType);

            if (isBanned) return `${mName}のところへ向かっている`;
            if (isMastered) return `${mName}のところへ遊びに行っている`;
            if (isApprentice) return `${mName}へ課題の報告に向かっている`;
            
            return `${mName}に会いに行っている`;
        }
        return type === 'apprentice_exam' ? "入門試験" : "報告に向かっている";
    }

    if (type === 'life_monument') return "大事業（モニュメント建造）";
    if (type === 'life_author') return "大事業（秘伝書の執筆）";
    if (type === 'life_guardian') return "村のパトロール";
    if (type === 'life_seeker') return "限界突破の修練";
    if (type === 'life_mentor') return "後進の育成";
    if (type === 'life_slowlife') return "スローライフを満喫";

    return type;
}

// ==========================================
// ★ 修正：師匠クエストの定義データ（英語名削除・アクション誘導版）
// ==========================================
aiPet.getMasterQuestData = function(mType, rank) {
    const quests = {
        'explore': { // 冒険家のクエスト
            0: { name: "入門試験の準備", desc: "試験では『位置を知る道具』『飲み物』『方角を知る道具』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "基礎体力の証明", 
                desc: "探検には体力がいる。活力を開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 15; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "罠を避ける足", 
                desc: "危険を回避する素早さが必要だ。「ランニング」等で素早さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.speed || 0) + 15; },
                check: function() { return (aiPet.stats.speed || 0) >= aiPet.apprentice.qVal; }
            },
            3: { 
                name: "はじめての探索", 
                desc: "森や山を「探検」して、木材を5つ、石を5つ集めてこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { 
                    const woods = aiPet.inventory.filter(i => i === 'wood').length;
                    const stones = aiPet.inventory.filter(i => i === 'stone').length;
                    return woods >= 5 && stones >= 5; 
                },
                onClear: function() { 
                    for(let i=0; i<5; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('wood'), 1);
                    for(let i=0; i<5; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('stone'), 1);
                } 
            },
            4: { 
                name: "深きを知る知恵", 
                desc: "深層の構造を理解するには賢さも必要だ。賢さを開始時より＋20上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel || 0) + 20; }, 
                check: function() { return (aiPet.stats.intel || 0) >= aiPet.apprentice.qVal; }
            },
            5: { 
                name: "過酷な環境への適応", 
                desc: "中層の険しい道に耐えるため、活力を開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 30; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "冒険者の身だしなみ", 
                desc: "野宿ばかりでは心が荒む。清潔な休息を取り、美しさを開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 10; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            7: { 
                name: "最深部への準備", 
                desc: "未知の魔物から逃げ切るため、素早さを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.speed || 0) + 30; }, 
                check: function() { return (aiPet.stats.speed || 0) >= aiPet.apprentice.qVal; }
            },
            8: { 
                name: "秘境の至宝", 
                // ★修正：「中層や」を削除し、実際のドロップ条件（8階以上）と文面を一致させる
                desc: "深層でしか採れない、良質な木材を3つ、硬い石を3つ集めてこよう。",
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { 
                    const hw = aiPet.inventory.filter(i => i === 'high_wood').length;
                    const hs = aiPet.inventory.filter(i => i === 'high_stone').length;
                    return hw >= 3 && hs >= 3; 
                },
                onClear: function() {
                    for(let i=0; i<3; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('high_wood'), 1);
                    for(let i=0; i<3; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('high_stone'), 1);
                }
            },
            9: { 
                name: "伝説への道", 
                desc: "冒険の道を極める最後の試練！活力を開始時より＋50上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 50; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'farming': { // 農家のクエスト
            0: { name: "入門試験の準備", desc: "試験では『光』『大地』『命の源』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "土を耕す体力", 
                desc: "クワを振るうには体力がいる。活力を開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 15; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "畑仕事の基本", 
                desc: "まずは実践だ。支給された種で「農業」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('seed_carrot'); },
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            3: { 
                name: "美しい農作物", 
                desc: "作物には作り手の「美しさ」も宿る。清潔に保ち、美しさを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 15; },
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            4: { 
                name: "土壌の知識", 
                desc: "美味しい野菜を育てるには知識も必要だ。「勉強」等で賢さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel || 0) + 15; }, 
                check: function() { return (aiPet.stats.intel || 0) >= aiPet.apprentice.qVal; }
            },
            5: { 
                name: "農作業の持久力", 
                desc: "過酷な環境に耐えるため、活力を開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 30; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "大自然の芸術", 
                desc: "最高の野菜を作るため、美しさを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 30; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            7: { 
                name: "農の鬼", 
                desc: "毎日の手入れが命だ。「農業」を15回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 15; }
            },
            8: { 
                name: "豊穣の秋", 
                desc: "大成功した野菜（質のいい～）を合計3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { 
                    return aiPet.inventory.filter(i => i.startsWith('high_')).length >= 3; 
                },
                onClear: function() {
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].startsWith('high_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            9: { 
                name: "大農園の主", 
                desc: "農業の道を極める最後の試練！活力を開始時より＋50上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 50; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'fishing': { // 漁師のクエスト
            0: { name: "入門試験の準備", desc: "試験では『釣るための棒』『垂らす線』『おびき寄せる食べ物』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "釣り場に立つ体力", 
                desc: "長時間の釣りには体力がいる。活力を開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 15; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての釣り", 
                desc: "支給された古い釣り竿で「釣り」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('rod_old'); },
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            3: { 
                name: "素早いアワセ", 
                desc: "魚が食いついた瞬間に合わせるため、素早さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.speed || 0) + 15; },
                check: function() { return (aiPet.stats.speed || 0) >= aiPet.apprentice.qVal; }
            },
            4: { 
                name: "初釣果", 
                desc: "種類は問わない。釣った魚を3匹集めてこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i.startsWith('fish_')).length >= 3; },
                onClear: function() { 
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].startsWith('fish_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            5: { 
                name: "大物との対峙", 
                desc: "大物の引きに負けないよう、活力を開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 30; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "漁師の休息", 
                desc: "潮風で荒れた肌を労ろう。清潔な休息を取り、美しさを開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 10; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            7: { 
                name: "見切りの目", 
                desc: "一瞬のウキの沈みを見逃さないため、素早さを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.speed || 0) + 30; }, 
                check: function() { return (aiPet.stats.speed || 0) >= aiPet.apprentice.qVal; }
            },
            8: { 
                name: "伝説の証明", 
                desc: "真の漁師の証として、川か海の「ヌシ」を1匹釣ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { 
                    return aiPet.inventory.some(i => i === 'fish_boss_river' || i === 'fish_boss_sea');
                },
                onClear: function() {
                    let idx = aiPet.inventory.indexOf('fish_boss_river');
                    if (idx === -1) idx = aiPet.inventory.indexOf('fish_boss_sea');
                    if (idx !== -1) aiPet.inventory.splice(idx, 1);
                }
            },
            9: { 
                name: "伝説の海へ", 
                desc: "漁師の道を極める最後の試練！活力を開始時より＋50上げよう。",
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 50; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'cooking': { // 料理人のクエスト
            0: { name: "入門試験の準備", desc: "試験では『切る道具』『煮込む容器』『加熱するもの』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "料理の心得", 
                desc: "レシピを理解する知性が必要だ。賢さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 15; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての調理", 
                desc: "まずはフライパンに慣れよう。お試しで「料理」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            3: { 
                name: "盛り付けの美学", 
                desc: "料理は見た目も味のうち。美しさを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 15; },
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            4: { 
                name: "基本の一皿", 
                // ★修正：バイトではなく「料理」コマンドを促す
                desc: "「料理」を行って黒焦げを避け、成功した「普通の試作料理」を3つ持ってこよう。（※食べられる前に報告だ！）", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i === 'food_practice_normal').length >= 3; },
                onClear: function() { 
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i] === 'food_practice_normal') {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            5: { 
                name: "味覚の探求心", 
                desc: "より高度な調理法を学ぶため、賢さを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 30; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "料理人の舌", 
                desc: "他人の料理を食べることも修行だ。「食事」を3回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 3; }
            },
            7: { 
                name: "芸術的な感性", 
                desc: "究極の料理を作るインスピレーションを得るため、美しさを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 30; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            8: { 
                name: "究極のフルコース", 
                // ★修正：バイトではなく「料理」コマンドを促す
                desc: "「料理」を行って、大成功でのみ作れる「究極の試作料理」を3つ持ってこよう。（※絶対に食べられるな！）", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i === 'food_practice_great').length >= 3; },
                onClear: function() {
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i] === 'food_practice_great') {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            9: { 
                name: "三ツ星の頂へ", 
                desc: "料理の道を極める最後の試練！賢さを開始時より＋50上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 50; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            }
        },
        'smithing': { // 鍛冶師のクエスト
            0: { name: "入門試験の準備", desc: "試験では『硬い金属』『叩く道具』『熱する設備』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "火に耐える体力", 
                desc: "重い槌を振るう体力がいる。活力を開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 15; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての鍛造", 
                desc: "まずは鉄を叩いてみよう。「鍛冶」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 5; }
            },
            3: { 
                name: "金属の知識", 
                desc: "温度管理と鉱石の性質を知るため、賢さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 15; },
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            4: { 
                name: "職人の証", 
                // ★修正：バイトではなく「鍛冶」コマンドを促す
                desc: "「鍛冶」を行って、作った練習用装備（なまくら剣など）を3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i.includes('_practice_')).length >= 3; },
                onClear: function() { 
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].includes('_practice_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            5: { 
                name: "精神統一", 
                desc: "集中力を維持するため、活力を開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 30; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "鍛冶師の休息", 
                desc: "煤まみれでは良い作品は作れない。清潔な休息を取り、美しさを開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 10; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            7: { 
                name: "千錬万鍛", 
                desc: "芸術の域に達する設計図を引くため、賢さを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 30; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            8: { 
                name: "名工への準備", 
                // ★修正：バイトではなく「鍛冶」コマンドを促す
                desc: "「鍛冶」を行って、大成功でのみ作れる芸術品（黄金の鍋など）を合計3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i.includes('_art_')).length >= 3; },
                onClear: function() {
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].includes('_art_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            9: { 
                name: "伝説の鍛冶屋へ", 
                desc: "鍛冶の道を極める最後の試練！活力を開始時より＋50上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 50; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'building': { // 建築士のクエスト
            0: { name: "入門試験の準備", desc: "試験では『完成図』『木の板』『釘を打つ道具』について聞かれる。答えとなる言葉を覚えよう。" },
            1: { 
                name: "構造計算の基礎", 
                desc: "まずは図面を引く知識がいる。賢さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 15; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての製図", 
                desc: "師匠の元で「建築」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            3: { 
                name: "現場の体力", 
                desc: "模型を組み上げるには体力も必要だ。活力を開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 15; },
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            4: { 
                name: "見習いの証明", 
                // ★修正：バイトではなく「建築」コマンドを促す
                desc: "「建築」を行って落書きを避け、成功した「練習用の図面」を3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i === 'build_practice_normal').length >= 3; },
                onClear: function() { 
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i] === 'build_practice_normal') {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            5: { 
                name: "高度な設計理論", 
                desc: "芸術的な建築を計算するため、賢さを開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 30; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "デザインの美学", 
                desc: "機能美を追求するため、美しさを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.beauty || 0) + 15; }, 
                check: function() { return (aiPet.stats.beauty || 0) >= aiPet.apprentice.qVal; }
            },
            7: { 
                name: "不屈の精神", 
                desc: "徹夜の作業に耐えるため、活力を開始時より＋30上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 30; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            8: { 
                name: "マスターピース", 
                // ★修正：バイトではなく「建築」コマンドを促す
                desc: "「建築」を行って、大成功でのみ作れる「精巧な建築模型」を3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.filter(i => i === 'build_practice_great').length >= 3; },
                onClear: function() {
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i] === 'build_practice_great') {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            9: { 
                name: "伝説の建築士へ", 
                desc: "建築の道を極める最後の試練！賢さを開始時より＋50上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 50; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            }
        }
    };

    if (quests[mType] && quests[mType][rank]) return quests[mType][rank];

    return {
        name: `ランク${rank}の試練`,
        desc: "「勉強」を1回行う（※仮の課題）",
        setup: () => { aiPet.apprentice.qVal = 0; },
        check: () => { return aiPet.apprentice.qVal >= 1; }
    };
};

// ==========================================
// ★完全版: 素早さ＆インフレ対応の性格判定システム
// ==========================================
window.getPersonalityType = function(stats) {
    if (!stats) return "普通";
    const intel = stats.intel || 0;
    const power = stats.power || 0;
    const beauty = stats.beauty || 0;
    const speed = stats.speed || 10;
    const mood = stats.mood || 0;

    const maxStat = Math.max(intel, power, beauty, speed);
    const minStat = Math.min(intel, power, beauty, speed);

    // 1. 状態異常系（最優先）
    if (mood <= 20) return "憂鬱"; // 機嫌が極端に悪い

    // 2. 超エリート状態（すべてが非常に高い）
    if (intel >= 1000 && power >= 1000 && beauty >= 1000 && speed >= 1000) return "完璧超人";
    if (intel >= 100 && power >= 100 && beauty >= 100 && speed >= 100) return "ストイック";

    // 3. 初期状態・未発達
    if (maxStat < 30) return "普通";

    // 4. 器用貧乏・のんびり（ステータスに偏りがない場合）
    // ※ステータスが数万にインフレしても対応できるよう、差が「最大値の10%未満」かで判定
    if ((maxStat - minStat) < (maxStat * 0.1) || (maxStat - minStat) < 10) return "のんびり屋";

    // 5. 特化型（一番高いステータスで決定）
    if (maxStat === beauty) {
        if (mood >= 90) return "アイドル";
        return "芸術家";
    }
    if (maxStat === speed) {
        if (mood >= 90) return "韋駄天"; // 素早さ特化＋ご機嫌
        return "せっかち";
    }
    if (maxStat === intel) return "学者肌";
    if (maxStat === power) return "熱血";

    return "普通";
};

function resetIdle() { 
    // ★修正：配列の中に 'building' を追加
    const activeStates = ['camping', 'farming_work', 'moving', 'moving_to_enter', 'entering', 'inside', 'exiting', 'eating', 'studying', 'training', 'sleeping', 'fishing', 'smithing', 'building', 'apprentice_training'];
    if (activeStates.includes(aiPet.actionState)) return;
    aiPet.idleTimer = 0; 
    aiPet.actionState = 'idle'; 
}

function getActionEfficiency(type) {
    let multiplier = 1.0; 
    if (typeof assets === 'undefined') return { rate: 1.0 };
    let hasHouse = false; let hasStudy = false; let hasGym = false;
    for (let key in assets) {
        const t = assets[key].type;
        if (t === 'hut' || t === 'house' || t === 'castle') hasHouse = true;
        if (t === 'school' || t === 'library' || t === 'castle') hasStudy = true; 
        if (t === 'gym' || t === 'blacksmith' || t === 'castle') hasGym = true;
    }
    if (type === 'rest' || type === 'sleep') { if (hasHouse) multiplier = 1.5; else multiplier = 0.8; } 
    else if (type === 'study') { if (hasStudy) multiplier = 1.5; else if (hasHouse) multiplier = 1.2; else multiplier = 0.8; } 
    else if (type === 'train') { if (hasGym) multiplier = 1.5; else if (hasHouse) multiplier = 1.2; else multiplier = 0.8; } 
    return { rate: multiplier };
}

function findFacilityForTask(taskType, masterType = null) {
    if (typeof assets === 'undefined') return null;
    let priorities = [];
    if (taskType === 'rest' || taskType === 'sleep') priorities = ['house', 'hut'];
    else if (taskType === 'study') priorities = ['school', 'library', 'house', 'hut'];
    else if (taskType === 'train') priorities = ['gym', 'house', 'hut'];
    else if (taskType === 'eat') {
        // レストランや城は除外し、「小屋(hut)」を最優先にします。
        // 小屋がマップにない場合は、目的地なし（＝その場で野宿）になります。
        priorities = ['hut']; 
    }
    else if (taskType === 'cook') {
        // ★料理はレストラン（本拠地 or 移動）でのみ可能にする
        priorities = ['restaurant']; 
    }
    else if (taskType === 'smith') {
        // ★鍛冶は専用施設（鍛冶屋 or 師匠のキャンプ）でのみ可能にする
        priorities = ['smith', 'blacksmith']; 
    }
    else if (taskType === 'farm') {
        // ★追加：農業は畑に向かう
        priorities = ['farm'];
    }
    // ★追加：釣りは橋などを探す
    else if (taskType === 'fish' || taskType === 'bridge') { priorities = ['bridge', 'sea', 'water']; }
    else if (taskType === 'master_quest' || taskType === 'visit_master') {
        // 優先的に「isMasterShop」フラグがついた施設（既存の畑やレストラン）を探す
        for (let k in assets) {
            if (assets[k].isMasterShop && (
                (masterType === 'farming' && assets[k].type === 'farm') ||
                (masterType === 'cooking' && assets[k].type === 'restaurant')
            )) return assets[k];
        }

        // 上で見つからなければ、既存の「顔見せ時に固定生成した師匠のキャンプ」を探す
        for (let k in assets) {
            if (k.startsWith(masterType + '_master_camp')) return assets[k];
        }

        if (masterType === 'farming') priorities = ['farm'];
        else if (masterType === 'cooking') priorities = ['restaurant', 'house', 'hut', 'castle'];
        else if (masterType === 'smithing') priorities = ['blacksmith', 'castle'];
        else if (masterType === 'explore') priorities = ['mountain', 'skull', 'palms', 'nature']; 
        else if (masterType === 'fishing') priorities = ['bridge', 'sea', 'water'];
        else if (masterType === 'building') priorities = ['palms', 'nature'];
    }
    
    let bestAsset = null;
    let minDist = Infinity;

    // ★ 追加：現在、料理人の弟子または卒業生（皆伝前）かどうかを判定
    // ランク10（皆伝）に達していない「修行中」の間だけ師匠の店を使えるようにします
    const app = window.aiPet?.apprentice;
    const isApprenticeButNotGraduated = app && app.currentMaster === 'cooking' && (app.rank['cooking'] || 0) < 10;

    for (let type of priorities) {
        for (let key in assets) { 
            if (assets[key].type === type || key.startsWith(type)) {
                const a = assets[key];

                // ★ 修正：移動レストラン（師匠の店）の利用制限
                if (a.isMobile && a.type === 'restaurant') {
                    // 1. 修行中でない、かつ 2. 皆伝もしていない（＝ただの未入門者）は使えない
                    // もしくは、3. すでにランク10（皆伝）に達しているなら、師匠の店は卒業なので使わない
                    if (!isApprenticeButNotGraduated) {
                        continue; // 修行期間外なら師匠の店はスルー（野宿 or 自分の店を探す）
                    }
                }

                const aScale = a.scale !== undefined ? a.scale : 0.5;
                const cx = a.dx + (a.sw * aScale)/2;
                const cy = a.dy + (a.sh * aScale)/2;
                
                // ★修正：釣り等のタスクで、今いる場所（近すぎる場所）を除外し、別の場所へ歩き回らせる！
                let dist = Math.hypot(window.aiPet.x - cx, window.aiPet.y - cy);
                if ((taskType === 'fish' || taskType === 'bridge') && dist < 80) {
                    dist += 10000; // 近くの釣り場には強力なペナルティをかけ、他の橋を探させる
                }
                
                if (dist < minDist) {
                    minDist = dist;
                    bestAsset = a;
                }
            } 
        }
        if (bestAsset) return bestAsset; // 最も近い目的地を返す
    }
    return null;
}

aiPet.getCurrentHour = function() { return (typeof this.debugHour === 'number' && this.debugHour >= 0) ? this.debugHour : new Date().getHours(); };

aiPet.getTimePhase = function() {
    const h = this.getCurrentHour();
    if (h >= 5 && h < 10) return { id: 'morning', name: '朝', color: 'rgba(255, 200, 100, 0.1)' };
    if (h >= 10 && h < 16) return { id: 'day', name: '昼', color: 'rgba(0, 0, 0, 0)' };
    if (h >= 16 && h < 19) return { id: 'evening', name: '夕', color: 'rgba(200, 100, 50, 0.2)' };
    return { id: 'night', name: '夜', color: 'rgba(0, 0, 50, 0.5)' };
};

aiPet.updateWeather = function() {
    this.weatherTimer++;
    if (this.weatherTimer > 1200) { 
        this.weatherTimer = 0;
        const r = Math.random();
        let next = 'clear';
        
        if (this.season === 'spring') {
            if (r < 0.4) next = 'clear'; else if (r < 0.7) next = 'cloudy'; else next = 'rain';
        } else if (this.season === 'summer') {
            if (r < 0.6) next = 'sunny'; else if (r < 0.8) next = 'clear'; else next = 'thunder';
        } else if (this.season === 'autumn') {
            if (r < 0.4) next = 'clear'; else if (r < 0.8) next = 'cloudy'; else next = 'rain';
        } else {
            if (r < 0.5) next = 'clear'; else if (r < 0.7) next = 'cloudy'; else next = 'snow';
        }

        this.weather = next;
        if (next === 'rain' || next === 'thunder') this.message = "雨が降ってきた！";
        else if (next === 'snow') this.message = "雪だ！";
        else if (next === 'clear' && (this.weather === 'rain' || this.weather === 'thunder' || this.weather === 'snow')) this.message = "天気が回復したね";
    }
};

aiPet.consumeFood = function() {
    if (this.hunger >= 95 && !this.isSick) { this.message = "もうお腹いっぱい！"; return false; }
    
    let bestFood = null; let bestIdx = -1; let maxPriority = -999; let hasFood = false;

    this.inventory.forEach((itemObj, idx) => {
        // ★修正: オブジェクト構造に対応 (itemObj.id を使用)
        const key = typeof itemObj === 'string' ? itemObj : itemObj.id;
        const item = itemCatalog[key]; if (!item) return;
        
        // ① 薬の判定（病気の時のみ最優先で探す）
        if (item.type === 'medicine') {
            if (this.isSick && key === 'item_medicine_cure') {
                hasFood = true;
                if (100 > maxPriority) { maxPriority = 100; bestFood = item; bestIdx = idx; } // 優先度MAX
            }
            return; // 病気じゃない時は薬は飲まない
        }

        // ② 通常の食べ物の判定
        if (!['dish', 'food', 'ingredient'].includes(item.type)) return;
        hasFood = true;

        let potentialGain = 0; 
        if (item.stats && typeof item.stats.hunger !== 'undefined') { potentialGain = item.stats.hunger; } 
        else { if (item.type === 'dish') potentialGain = 20; else potentialGain = 10; }
        
        // 満腹にならないかチェック（少し余裕を持たせる）
        if (this.hunger + potentialGain > 100 && this.hunger >= 80) { return; } 
        
        let priority = 0; 
        if (item.type === 'dish') priority = 3; 
        else if (item.type === 'food') priority = 2; 
        else if (item.type === 'ingredient') priority = 1;
        
        // ★ ゲテモノ（bad）は優先度を激下げし、他に何もない時の最終手段にする
        if (item.quality === 'bad') priority -= 10;

        if (priority > maxPriority) { maxPriority = priority; bestFood = item; bestIdx = idx; }
    });
    
    if (!hasFood || bestIdx === -1) { 
        if (this.isSick) this.message = "薬がない...";
        else this.message = "食べるものがない..."; 
        return false; 
    }

    this.inventory.splice(bestIdx, 1);
    
    // =======================================
    // A: 薬を飲んだ時の特殊処理
    // =======================================
    if (bestFood.type === 'medicine') {
        this.isSick = false;
        this.lifespan -= 5; // 寿命がガッツリ削られる
        this.visualAction = 'eat_raw'; 
        this.visualActionTimer = 60;
        this.message = "特効薬で病気が治った！...(寿命-5)";
        if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 60, "💊 完治(寿命激減)", "#4CAF50");
        
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) { openInventoryPanel(); }
        }
        return true;
    }

    // =======================================
    // B: 通常の食事処理
    // =======================================
    let gainEnergy = 0; let gainHunger = 0;
    
    const tData = typeof this.getTraitData === 'function' ? this.getTraitData() : {};
    const bIntel = (tData.statBonus && tData.statBonus.intel) ? tData.statBonus.intel : 1.0;
    const bPower = (tData.statBonus && tData.statBonus.power) ? tData.statBonus.power : 1.0;
    const bMood = (tData.statBonus && tData.statBonus.mood) ? tData.statBonus.mood : 1.0;

    if (bestFood.stats) {
        if (bestFood.stats.energy) gainEnergy += bestFood.stats.energy; 
        gainHunger += (bestFood.stats.hunger || 20);
        if (bestFood.stats.power) this.stats.power += bestFood.stats.power * bPower; 
        if (bestFood.stats.intel) this.stats.intel += bestFood.stats.intel * bIntel; 
        if (bestFood.stats.mood) this.stats.mood += bestFood.stats.mood * bMood;
    } else { 
        gainHunger += 10; gainEnergy += 5; 
    }
    
    let action = "食べた";
    if (bestFood.type === 'dish') { this.visualAction = 'eat_dish'; action = "食べた"; } 
    else { this.visualAction = 'eat_raw'; action = "丸かじりした"; }
    
    this.visualActionTimer = 60;
    this.energy = Math.min(100, this.energy + gainEnergy); 
    this.hunger = Math.min(100, this.hunger + gainHunger);
    this.message = `${bestFood.name}を${action}！`; 

    // ★追加: 生魚（dishではない魚）を食べた時の確率病気ペナルティ
    const consumedId = typeof this.inventory[bestIdx] === 'string' ? this.inventory[bestIdx] : this.inventory[bestIdx]?.id;
    if (consumedId && consumedId.startsWith('fish_') && bestFood.type !== 'dish' && bestFood.quality !== 'bad') {
        if (Math.random() < 0.25) { // 25%であたる
            this.isSick = true;
            this.stats.mood -= 10;
            this.message = "ウッ…生魚にあたった…";
            if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 80, "😷 病気になった！", "#E53935");
        }
    }

    // =======================================
    // C: 悪い食べ物（ゲテモノ）のペナルティ処理
    // =======================================
    if (bestFood.quality === 'bad') {
        this.stats.mood -= 20; // 機嫌が大幅ダウン
        this.message = "ウッ…不味いしお腹が痛い…";
        if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 60, "🤢 激マズ...", "#795548");
        
        // ★ 30%の確率で病気を発症する！
        if (Math.random() < 0.30) {
            this.isSick = true;
            if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 80, "😷 病気になった！", "#E53935");
        }
    }

    if (typeof openInventoryPanel === 'function') {
        const invPanel = document.getElementById('panel-inventory');
        if (invPanel && invPanel.classList.contains('active')) { openInventoryPanel(); }
    }
    return true;
};

aiPet.isPointOnWater = function(x, y) {
    for (let k in assets) {
        let a = assets[k];
        if (a.type === 'water') {
            let aw = (a.sw || 50) * (a.scale || 0.5);
            let ah = (a.sh || 50) * (a.scale || 0.5);
            if (x >= a.dx + 5 && x <= a.dx + aw - 5 && y >= a.dy + 5 && y <= a.dy + ah - 5) {
                let onBridge = false;
                for (let j in assets) {
                    if (assets[j].type === 'bridge') {
                        let b = assets[j];
                        let bw = (b.sw || 50) * (b.scale || 0.5);
                        let bh = (b.sh || 50) * (b.scale || 0.5);
                        if (x >= b.dx && x <= b.dx + bw && y >= b.dy && y <= b.dy + bh) {
                            onBridge = true; break;
                        }
                    }
                }
                if (!onBridge) return true;
            }
        }
    }
    return false;
};

aiPet.isWaterBetween = function(x1, y1, x2, y2) {
    let dist = Math.hypot(x2 - x1, y2 - y1);
    let steps = Math.max(10, Math.ceil(dist / 10)); 
    
    for (let i = 1; i <= steps; i++) {
        let cx = x1 + (x2 - x1) * (i / steps);
        let cy = y1 + (y2 - y1) * (i / steps);
        
        if (this.isPointOnWater(cx, cy)) {
            return true;
        }
    }
    return false;
};

// ★完全修正：水で分断された場合の妥協ルート生成パッチ
aiPet.setDestination = function(tx, ty, isWandering = false, ignoreWater = false) {
    this.targetX = tx;
    this.targetY = ty;
    this.pathQueue = [];
    
    // ★修正：ignoreWater が true なら、水上であっても水判定を無視して一直線に向かう！
    if (ignoreWater || !this.isWaterBetween(this.x, this.y, tx, ty)) {
        this.pathQueue.push({x: tx, y: ty});
        return true;
    }
    
    let bridges = [];
    for (let k in assets) {
        if (assets[k].type === 'bridge') {
            let b = assets[k];
            bridges.push({
                x: b.dx + (b.sw * (b.scale || 0.5)) / 2,
                y: b.dy + (b.sh * (b.scale || 0.5)) / 2,
                id: k
            });
        }
    }
    
    let nodes = [{x: this.x, y: this.y, id: 'start'}];
    bridges.forEach(b => nodes.push(b));
    nodes.push({x: tx, y: ty, id: 'goal'});
    
    let edges = {};
    nodes.forEach(n => edges[n.id] = []);
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let n1 = nodes[i];
            let n2 = nodes[j];
            let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            
            // ★修正ポイント1：橋同士は距離が近ければ（150px以内）水判定を無視して無条件で繋ぐ
            let isN1Bridge = n1.id !== 'start' && n1.id !== 'goal';
            let isN2Bridge = n2.id !== 'start' && n2.id !== 'goal';
            
            let canConnect = false;
            if (isN1Bridge && isN2Bridge && dist < 150) {
                canConnect = true; 
            } else {
                canConnect = !this.isWaterBetween(n1.x, n1.y, n2.x, n2.y);
            }

            if (canConnect) {
                edges[n1.id].push({to: n2.id, cost: dist});
                edges[n2.id].push({to: n1.id, cost: dist});
            }
        }
    }
    
    let distances = {};
    let previous = {};
    let unvisited = new Set();
    
    nodes.forEach(n => {
        distances[n.id] = Infinity;
        unvisited.add(n.id);
    });
    distances['start'] = 0;
    
    while (unvisited.size > 0) {
        let current = null;
        let minD = Infinity;
        unvisited.forEach(id => {
            if (distances[id] < minD) { minD = distances[id]; current = id; }
        });
        if (current === null || current === 'goal') break;
        unvisited.delete(current);
        
        edges[current].forEach(edge => {
            let alt = distances[current] + edge.cost;
            if (alt < distances[edge.to]) {
                distances[edge.to] = alt;
                previous[edge.to] = current;
            }
        });
    }
    
    if (distances['goal'] === Infinity) {
        // ==========================================
        // ★修正ポイント2：超強力パッチ（ルート強制生成）
        // 厳格な水判定のせいで橋へのルートが遮断された場合、
        // 橋が1つでも存在していれば、無理やり一番近い橋を経由させる！
        // ==========================================
        if (bridges.length > 0) {
            // 自分から一番近い橋、目的地から一番近い橋を見つける
            let startBridge = bridges.slice().sort((a,b) => Math.hypot(this.x - a.x, this.y - a.y) - Math.hypot(this.x - b.x, this.y - b.y))[0];
            let goalBridge = bridges.slice().sort((a,b) => Math.hypot(tx - a.x, ty - a.y) - Math.hypot(tx - b.x, ty - b.y))[0];
            
            this.pathQueue = [];
            this.pathQueue.push({x: startBridge.x, y: startBridge.y});
            if (startBridge.id !== goalBridge.id) {
                this.pathQueue.push({x: goalBridge.x, y: goalBridge.y});
            }
            this.pathQueue.push({x: tx, y: ty});
            return true; // 諦めずに進む！
        }

        // ==========================================
        // ★新規追加パッチ：橋がなく、目的地が川の向こう側の場合の妥協処理
        // ==========================================
        // ランダムな移動（isWandering）ではなく、明確なタスク（探検など）の場合
        if (!isWandering) {
            // 目的地とAIを直線で結び、その直線上で「水（川）にぶつかる手前の座標」を探す
            let dx = tx - this.x;
            let dy = ty - this.y;
            let dist = Math.hypot(dx, dy);
            
            // 10px刻みでAIの位置から目的地に向かって線を引いていく
            let safeX = this.x;
            let safeY = this.y;
            let stepX = (dx / dist) * 10;
            let stepY = (dy / dist) * 10;
            let currentX = this.x;
            let currentY = this.y;
            
            // 川の判定(isWaterBetween)がtrueになる直前の安全な位置を見つける
            for (let d = 10; d < dist; d += 10) {
                currentX += stepX;
                currentY += stepY;
                if (this.isWaterBetween(this.x, this.y, currentX, currentY)) {
                    break; // 水にぶつかったらストップ
                }
                // 水にぶつからなければ安全な位置を更新
                safeX = currentX;
                safeY = currentY;
            }

            // 安全な位置が自分の現在地から少しでも離れていれば、そこを新たな目的地にする！
            if (Math.hypot(safeX - this.x, safeY - this.y) > 20) {
                this.pathQueue = [{x: safeX, y: safeY}];
                return true; // 川の手前まで進む！
            } else {
                // 川岸ギリギリに立っていて、もう1歩も進めない場合のみ諦める
                this.message = "川を渡るには橋が足りないみたい...";
                this.messageTimer = 120;
                if (this.schedule && this.schedule.length > 0) {
                    this.schedule[0].duration = 0;
                    this.schedule[0].aborted = true;
                }
                this.actionState = 'idle';
                return false;
            }
        } else {
            // ただのうろうろ歩きなら、何も言わずにその場で立ち止まる
            this.actionState = 'idle';
            return false;
        }
    }
    
    let path = [];
    let curr = 'goal';
    while (curr !== 'start') {
        let node = nodes.find(n => n.id === curr);
        path.unshift({x: node.x, y: node.y});
        curr = previous[curr];
    }
    
    this.pathQueue = path;
    return true;
};

aiPet.canReach = function(tx, ty) {
    if (!this.isWaterBetween(this.x, this.y, tx, ty)) return true;
    let bridges = [];
    for (let k in assets) {
        if (assets[k].type === 'bridge') {
            let b = assets[k];
            bridges.push({ x: b.dx + (b.sw * (b.scale || 0.5)) / 2, y: b.dy + (b.sh * (b.scale || 0.5)) / 2, id: k });
        }
    }
    let nodes = [{x: this.x, y: this.y, id: 'start'}];
    bridges.forEach(b => nodes.push(b));
    nodes.push({x: tx, y: ty, id: 'goal'});
    
    let edges = {}; nodes.forEach(n => edges[n.id] = []);
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let n1 = nodes[i]; let n2 = nodes[j];
            if (!this.isWaterBetween(n1.x, n1.y, n2.x, n2.y)) {
                let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                edges[n1.id].push({to: n2.id, cost: dist});
                edges[n2.id].push({to: n1.id, cost: dist});
            }
        }
    }
    let distances = {}; let unvisited = new Set();
    nodes.forEach(n => { distances[n.id] = Infinity; unvisited.add(n.id); });
    distances['start'] = 0;
    
    while (unvisited.size > 0) {
        let current = null; let minD = Infinity;
        unvisited.forEach(id => { if (distances[id] < minD) { minD = distances[id]; current = id; } });
        if (current === null || current === 'goal') break;
        unvisited.delete(current);
        edges[current].forEach(edge => {
            let alt = distances[current] + edge.cost;
            if (alt < distances[edge.to]) { distances[edge.to] = alt; }
        });
    }
    return distances['goal'] !== Infinity;
};

// ★修正: 性格と言葉の学習度、そして「余生ルート」に基づいた自律行動
aiPet.performIdleAction = function() {
    if (this.energy < 20 || this.hunger < 20) {
        if (!this.godMode) { 
            if (this.hunger < 20) this.message = "お腹すいた..."; 
            else this.message = "疲れた...休みたい..."; 
            this.messageTimer = 120; 
            return; 
        }
    }

    // ==========================================
    // ★大追加：免許皆伝後、自分の「余生ルート（夢）」に向かって自動で行動を始める！
    // ==========================================
    // ★修正：引継ぎプレイ時は isGraduated が undefined になるため、lifePath の有無だけで判定する！
    if (currentMode === 'play' && this.schedule.length === 0 && this.apprentice && this.apprentice.lifePath) {
        let autoTask = 'life_' + this.apprentice.lifePath;
        let actMsgs = {
            'monument': "生きた証を遺すため、モニュメントの建造に取り掛かった！",
            'author': "後世のため、机に向かって秘伝書の執筆を始めた！",
            'guardian': "村に異常がないか、パトロールに出発した！",
            'seeker': "己の限界を超えるため、極限の修練を開始した！",
            'mentor': "（見えない相手に向かって）熱心に指導を始めた！",
            'slowlife': "のんびりと自分の時間を楽しむことにした。"
        };
        
        this.schedule.push({type: autoTask, duration: 150});
        this.message = actMsgs[this.apprentice.lifePath] || "余生を過ごしている...";
        this.messageTimer = 120;
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        return;
    }
    // ==========================================
    
    const pType = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(this.stats) : '普通';
    
    // ★修正：まずは現在のスキン（進化後の姿）をキーにする
    let typeKey = this.currentSkin || this.baseType || 'robot';
    
    // もし characterDialogues の中に進化後の専用セリフがまだ作られていなければ、基本種族（baseType）を代わりに入れる
    if (typeof characterDialogues !== 'undefined' && !characterDialogues[typeKey]) {
        typeKey = this.baseType || 'robot';
    }
    // それでも無ければ強制的に robot にする保険
    if (typeof characterDialogues !== 'undefined' && !characterDialogues[typeKey]) {
        typeKey = 'robot';
    }
    if (typeof characterDialogues !== 'undefined' && !characterDialogues[typeKey]) typeKey = 'robot';

    // (※以下、元の「知っている行動のみ自発的に開始する」処理)
    if (typeof currentMode !== 'undefined' && currentMode === 'play' && this.schedule.length === 0 && Math.random() < 0.4) {
        let autoTask = null;
        let actMsg = "";
        
        const knows = (word) => this.apprentice && this.apprentice.learnedWords && this.apprentice.learnedWords.includes(word);
        
        // ★性格の日本語化 ＆ 新性格の追加
        if (pType === '学者肌' && knows("勉強") && Math.random() < 0.6) { autoTask = 'study'; actMsg = "気になって本を読み始めた！"; }
        else if (pType === '熱血' && knows("筋トレ") && Math.random() < 0.6) { autoTask = 'train'; actMsg = "じっとしていられず筋トレ開始！"; }
        else if (pType === '芸術家' && knows("鍛冶") && Math.random() < 0.4) { autoTask = 'smith'; actMsg = "何かを作りたくなってきた！"; }
        else if (pType === 'アイドル' && knows("探検") && Math.random() < 0.4) { autoTask = 'explore'; actMsg = "みんなに会いにお出かけしよう！"; }
        // ▼ 新規追加：素早さ特化（せっかち・韋駄天）はランニングに行きたがる
        else if ((pType === 'せっかち' || pType === '韋駄天') && knows("ランニング") && Math.random() < 0.6) { autoTask = 'run'; actMsg = "じっとしていられない！走ってくる！"; }
        // ▼ 修正：ストイック・完璧超人の自己研鑽
        else if ((pType === 'ストイック' || pType === '完璧超人') && Math.random() < 0.7) { 
            let stoicActs = [];
            if (knows("勉強")) stoicActs.push('study');
            if (knows("筋トレ")) stoicActs.push('train');
            if (knows("探検")) stoicActs.push('explore');
            if (knows("ランニング")) stoicActs.push('run'); // ランニングも追加
            if (stoicActs.length > 0) {
                autoTask = stoicActs[Math.floor(Math.random() * stoicActs.length)];
                actMsg = "時間を無駄にせず自己研鑽だ！";
            }
        }
        // ▼ 修正：lazy → のんびり屋 （※学習単語に合わせて「睡眠」に変更）
        else if (pType === 'のんびり屋' && knows("睡眠") && Math.random() < 0.5) { autoTask = 'sleep'; actMsg = "もう疲れたから寝る..."; }
        
        if (autoTask) {
            this.schedule.push({type: autoTask, duration: 150});
            this.message = actMsg;
            this.messageTimer = 120;
            if (!this.actionHistory) this.actionHistory = { study: 0, train: 0, work: 0, rest: 0, care: 0, free: 0 };
            this.actionHistory.free++;
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            return;
        }
    }
    
    const rand = Math.random();
    if (rand < 0.6) {
        let found = false;
        let nextX, nextY;
        for (let i = 0; i < 10; i++) {
            const wanderX = (Math.random() - 0.5) * 300; 
            const wanderY = (Math.random() - 0.5) * 300;
            nextX = this.x + wanderX; nextY = this.y + wanderY;
            nextX = Math.max(50, Math.min(750, nextX)); nextY = Math.max(50, Math.min(430, nextY));
            if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(nextX, nextY)) { found = true; break; }
        }
        if (found) {
            if(typeof this.setDestination === 'function' && this.setDestination(nextX, nextY, true)) this.actionState = 'moving';
        }
    } else {
        // ★重要修正：存在しない性格データが呼ばれた時にエラーにならないように、見つからなければ「普通」のセリフを喋らせるフォールバックを追加
        if (typeof characterDialogues !== 'undefined' && characterDialogues[typeKey]) {
            const data = characterDialogues[typeKey][pType] || characterDialogues[typeKey]['普通'] || characterDialogues[typeKey]['average'];
            if (data && data.length > 0) { 
                this.message = data[Math.floor(Math.random() * data.length)]; 
            }
        }
        this.messageTimer = 120;
    }
};

aiPet.processCookingStart = function(task) {
    // ★修正：修行中（isTrial）は材料なしで、ステータス依存の試作料理を作る！
    if (task.isTrial) {
        let intel = this.stats.intel || 10;
        let beauty = this.stats.beauty || 10;
        
        // 賢さ（レシピ理解）と美しさ（盛り付け）から成功率と大成功率を計算
        let successRate = 0.3 + (intel * 0.005) + (beauty * 0.005) + ((this.skills.cooking || 1) * 0.05);
        let greatSuccessRate = (intel * 0.003) + (beauty * 0.003); // ステータスが高いほど大成功しやすい
        
        successRate = Math.min(0.95, successRate);
        
        let isSuccess = Math.random() < successRate;
        let isGreatSuccess = isSuccess && (Math.random() < greatSuccessRate);

        // 結果の決定
        let targetId = 'food_practice_normal';
        let targetName = '普通の試作料理';

        if (isGreatSuccess) {
            targetId = 'food_practice_great';
            targetName = '究極の試作料理';
        }

        task.cookData = {
            targetId: targetId,
            targetName: targetName,
            successRate: successRate,
            isSuccess: isSuccess,
            isGreatSuccess: isGreatSuccess, // 大成功フラグを追加
            isTrial: true
        };
        return true;
    }

    // --- 以下、通常（皆伝後）の材料チェックロジック ---
    let bestIngredient = null;
    let bestIdx = -1;
    this.inventory.forEach((key, idx) => {
        const item = itemCatalog[key];
        if (item && (item.type === 'ingredient' || item.type === 'food')) {
            if (bestIdx === -1) { bestIngredient = key; bestIdx = idx; }
        }
    });

    if (bestIngredient) {
        this.inventory.splice(bestIdx, 1); 
        let successRate = 0.6 + ((this.skills.cooking || 1) * 0.05);
        if (successRate > 0.95) successRate = 0.95;

        let resultId = 'dish_stirfry';
        if (bestIngredient === 'carrot' || bestIngredient === 'high_carrot') resultId = 'baked_carrot';
        else if (bestIngredient === 'pepper' || bestIngredient === 'high_pepper') resultId = 'baked_pepper';
        else if (bestIngredient === 'tomato' || bestIngredient === 'high_tomato') resultId = 'baked_tomato';
        else if (bestIngredient.startsWith('fish_')) resultId = 'baked_fish';

        task.cookData = {
            targetId: resultId,
            targetName: itemCatalog[resultId].name,
            successRate: successRate,
            isSuccess: Math.random() < successRate
        };
        return true;
    } else {
        this.message = "材料がなくて料理できなかった...";
        this.messageTimer = 120;
        return false;
    }
};

aiPet.processCookingFinish = function(task) {
    const d = task.cookData;
    if (!d) return;

    if (d.isSuccess) {
        if (!this.skills.cooking) this.skills.cooking = 1;
        this.skills.cooking += 0.5;
        
        // ★修正：大成功時は機嫌が大きく回復するボーナス
        this.stats.mood += d.isGreatSuccess ? 15 : 5;
        
        if (d.isGreatSuccess) {
            this.message = `大成功！！ 奇跡の出来栄え「${d.targetName}」が完成した！`;
        } else {
            this.message = `料理成功！ ${d.targetName}ができた！`;
        }
        
        // ★修正：修行中（isTrial）であっても、クエスト報告のためにインベントリに入れる！
        this.inventory.push(d.targetId);
        
        // クエストの進捗（料理した回数）をカウントする
        if (this.apprentice && this.apprentice.activeQuest) {
            const desc = this.apprentice.activeQuest.desc;
            if (desc.includes('料理') || desc.includes('試作')) {
                this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            }
        }
    } else {
        if (!this.skills.cooking) this.skills.cooking = 1;
        this.skills.cooking += 0.1;
        this.message = "料理失敗... 黒焦げの謎の物体になっちゃった...";
        // ★修正：修行中であってもペナルティとして黒焦げをインベントリにねじ込む！
        this.inventory.push('burnt_food');
    }
    
    this.messageTimer = 150;
    
    // ★重要：状態をリセット（これで「焦がしちゃった」ループを防ぐ）
    this.visualAction = null;
    this.actionState = 'idle';

    if (typeof openInventoryPanel === 'function') {
        const invPanel = document.getElementById('panel-inventory');
        if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
    }
};

aiPet.processSmithingStart = function(task) {
    // ★修正：修行中（isTrial）は実用品を作らず、ステータス依存で「なまくら」か「超高品質な工芸品（非実用）」を作る！
    if (task.isTrial) {
        let power = this.stats.power || 10;
        let intel = this.stats.intel || 10;
        
        // 活力（打つ力）と賢さ（温度管理）から成功率と大成功率を計算
        let successRate = 0.3 + (power * 0.005) + (intel * 0.005) + ((this.skills.smithing || 1) * 0.05);
        let greatSuccessRate = (power * 0.003) + (intel * 0.003); // ステータスが高いほど大成功しやすい
        
        successRate = Math.min(0.95, successRate);
        
        let isSuccess = Math.random() < successRate;
        let isGreatSuccess = isSuccess && (Math.random() < greatSuccessRate);

        // 普通の成功時（実用性のない練習用）
        const trialItems = [
            { id: 'eq_practice_sword', name: '練習用のなまくら剣' },
            { id: 'eq_practice_shield', name: '練習用のボロボロの盾' },
            { id: 'tool_practice_pan', name: '練習用の歪な鍋' }
        ];
        // ★新規追加：大成功時にできる「価値は高いが実用性はない芸術品」
        const artItems = [
            { id: 'eq_art_sword', name: '芸術的な模造剣' },
            { id: 'eq_art_shield', name: '装飾過多な儀礼盾' },
            { id: 'tool_art_pan', name: '黄金のディスプレイ鍋' }
        ];

        let targetPool = isGreatSuccess ? artItems : trialItems;
        let pick = targetPool[Math.floor(Math.random() * targetPool.length)];

        task.smithData = {
            targetId: pick.id,
            targetName: pick.name,
            successRate: successRate,
            isSuccess: isSuccess,
            isGreatSuccess: isGreatSuccess, // 大成功フラグを追加
            isTrial: true
        };
        return true;
    }

    // --- 以下、通常（皆伝・独立後）の本番ロジック ---
    let bestIdx = this.inventory.indexOf('iron');
    if (bestIdx !== -1) {
        this.inventory.splice(bestIdx, 1); // 鉄鉱石を消費
        let successRate = 0.5 + ((this.skills.smithing || 1) * 0.05);
        if (successRate > 0.95) successRate = 0.95;

        const craftables = ['eq_sword', 'eq_shield', 'tool_pan'];
        let resultId = craftables[Math.floor(Math.random() * craftables.length)];

        task.smithData = {
            targetId: resultId,
            targetName: (typeof itemCatalog !== 'undefined' && itemCatalog[resultId]) ? itemCatalog[resultId].name : "装備品",
            successRate: successRate,
            isSuccess: Math.random() < successRate,
            isTrial: false 
        };
        return true;
    } else {
        this.message = "鉄鉱石がなくて鍛冶ができなかった...";
        this.messageTimer = 120;
        return false;
    }
};

aiPet.processSmithingFinish = function(task) {
    const d = task.smithData;
    if (!d) return;

    if (d.isSuccess) {
        if (!this.skills.smithing) this.skills.smithing = 1;
        this.skills.smithing += 0.5;
        // ★修正：大成功時は機嫌が大きく回復するボーナス
        this.stats.mood += d.isGreatSuccess ? 15 : 5;
        
        if (d.isGreatSuccess) {
            this.message = `大成功！！ 素晴らしい出来の「${d.targetName}」ができた！`;
        } else {
            this.message = `鍛冶成功！ ${d.targetName}ができた！`;
        }
        
        // お試し（練習用装備・工芸品）であっても、報告や売却のためにインベントリに入れる！
        this.inventory.push(d.targetId);

        // クエストの進捗（作った回数）をカウントする
        if (this.apprentice && this.apprentice.activeQuest) {
            const desc = this.apprentice.activeQuest.desc;
            if (desc.includes('装備品') || desc.includes('鍛造') || desc.includes('鍛冶')) {
                this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            }
        }
    } else {
        if (!this.skills.smithing) this.skills.smithing = 1;
        this.skills.smithing += 0.1;
        this.message = "鍛冶失敗... 鉄くずになっちゃった...";
        // 失敗時は鉄くずを入れる
        this.inventory.push('scrap_metal');
    }
    this.messageTimer = 150;

    // 状態をリセットしてフリーズ防止
    this.visualAction = null;
    this.actionState = 'idle';

    if (typeof openInventoryPanel === 'function') {
        const invPanel = document.getElementById('panel-inventory');
        if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
    }
};

aiPet.processFishingFrame = function() {
    if (!this.fishingData) {
        this.fishingData = { phase: 'idle', timer: 0, pos: 100, targetName: null, isSuccess: false, isBreak: false, bestIdx: -1, caughtItem: null };
    }
    const d = this.fishingData;

    if (d.phase === 'idle') {
        d.timer++;
        if (d.timer > 60 && Math.random() < 0.01) {
            let bestRod = null; let bestIdx = -1; let rodPriority = { 'rod_super': 3, 'rod_norm': 2, 'rod_old': 1 };
            this.inventory.forEach((key, idx) => {
                if (rodPriority[key]) {
                    if (!bestRod || rodPriority[key] > rodPriority[bestRod]) { bestRod = key; bestIdx = idx; }
                }
            });
            
            if (!bestRod) {
                // ★修正：漁師の弟子なら、釣り竿が壊れてしまっても自動で予備を補充する
                if (this.apprentice && this.apprentice.currentMaster === 'fishing') {
                    this.inventory.push('rod_old');
                    bestRod = 'rod_old';
                    bestIdx = this.inventory.length - 1;
                    // （こっそりインベントリに補充してそのまま釣りを開始します）
                } else {
                    this.message = "釣り竿がない！"; this.messageTimer = 120;
                    if (typeof window.clearSchedule === 'function') window.clearSchedule();
                    return;
                }
            }

            d.bestIdx = bestIdx;
            
            let catchRate = 0.4 + (this.stats.power * 0.002);
            if (bestRod === 'rod_norm') catchRate += 0.2;
            if (bestRod === 'rod_super') catchRate += 0.4;
            d.isSuccess = (Math.random() < catchRate);
            
            let breakChance = 0.10;
            if (bestRod === 'rod_norm') breakChance = 0.05;
            if (bestRod === 'rod_super') breakChance = 0.01;
            d.isBreak = (Math.random() < breakChance);

            let isSea = (this.interactionTarget && this.interactionTarget.type === 'sea');
            let seasonTable = isSea ? seaFishingTable[this.season || 'spring'] : riverFishingTable[this.season || 'spring'];
            if (!seasonTable) seasonTable = isSea ? seaFishingTable['spring'] : riverFishingTable['spring']; 
            
            let rand = Math.random() * 100;
            let current = 0; let caughtItem = null;
            for (let i=0; i<seasonTable.length; i++) {
                current += seasonTable[i].prob;
                if (rand < current) { caughtItem = seasonTable[i].id; break; }
            }
            if (!caughtItem) caughtItem = seasonTable[0].id;
            
            // ▼▼▼ 新規追加：ステータスが高いと「ヌシ」が掛かるようになる ▼▼▼
            if ((this.stats.power || 0) >= 30 && (this.stats.speed || 0) >= 30) {
                let bossChance = 0.05 + ((this.stats.power || 0) * 0.001); // 5%以上の確率でヌシ
                if (Math.random() < bossChance) {
                    caughtItem = isSea ? 'fish_boss_sea' : 'fish_boss_river';
                }
            }
            
            d.caughtItem = caughtItem;
            d.targetName = (typeof itemCatalog !== 'undefined' && itemCatalog[caughtItem]) ? itemCatalog[caughtItem].name : (isSea ? "海のヌシ" : "川のヌシ");
            
            // ▼▼▼ 新規追加：大物のステータスの壁 ▼▼▼
            d.isBoss = (caughtItem === 'fish_boss_sea' || caughtItem === 'fish_boss_river');
            d.bossFailed = false;
            
            if (d.isBoss) {
                if ((this.stats.power || 0) < 80 || (this.stats.speed || 0) < 60) {
                    d.isSuccess = false; // ステータス不足なら絶対に釣れない
                    d.bossFailed = true; // 大物に逃げられるフラグ
                } else {
                    // ステータスを満たしていても釣りにくい（確率半減）
                    d.isSuccess = Math.random() < (catchRate * 0.5);
                }
            }
            // ▲▲▲ 新規追加ここまで ▲▲▲

            d.phase = 'hit';
            d.timer = 0;
            d.pos = 100; 
            this.message = "きた！！";
            this.messageTimer = 60;
        }
    } else if (d.phase === 'hit') {
        d.timer++;
        
        if (d.isSuccess) {
            d.pos -= (0.4 + Math.random() * 0.8);
            if (Math.random() < 0.1) d.pos += (1.0 + Math.random() * 2.0);
            
            if (d.pos <= 0) { 
                d.pos = 0;
                d.phase = 'result';
                d.timer = 0;
                this.inventory.push(d.caughtItem);
                
                const bMood = (this.getTraitData().statBonus && this.getTraitData().statBonus.mood) ? this.getTraitData().statBonus.mood : 1.0;
                this.stats.mood += 2 * bMood;
                if (!this.godMode) { this.energy -= 1 * (this.getTraitData().consumption || 1.0); this.hunger -= 1 * (this.getTraitData().consumption || 1.0); }
                
                this.fishingPopup = `✨ ${d.targetName} を釣った！ ✨`;
                this.fishingPopupTimer = 90;
                // ★修正：アクションカード「みんなで大漁」を取得
                if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('action_fish', this.generation);
                
                if (typeof openInventoryPanel === 'function') {
                    const invPanel = document.getElementById('panel-inventory');
                    if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
                }
                
                if (d.isBreak) {
                    this.inventory.splice(d.bestIdx, 1);
                    setTimeout(() => {
                        this.message = "あっ！釣り竿が壊れちゃった..."; this.messageTimer = 150;
                    }, 1000);
                }

                // ★ 修正：見事釣り上げた瞬間にクエストの回数をカウント！
                if (this.apprentice && this.apprentice.activeQuests) {
                    this.apprentice.activeQuests.forEach(q => {
                        if (q.masterType === 'fishing') q.qVal = (q.qVal || 0) + 1;
                    });
                    if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                }
                if (typeof window.progressDailyQuest === 'function') window.progressDailyQuest('fish'); // 👈これを追加！
            }
        } else {
            d.pos += (0.2 + Math.random() * 0.5);
            if (Math.random() < 0.3) d.pos -= 1.0; 
            
            if (d.timer > 180 || d.pos >= 120) {
                d.phase = 'result';
                d.timer = 0;
                
                // ▼▼▼ 新規追加：大物に逃げられた時の激しいペナルティ ▼▼▼
                if (d.bossFailed || (d.isBoss && !d.isSuccess)) {
                    this.message = "化け物みたいな引きだ...糸が切られた！！";
                    if (!this.godMode) {
                        this.energy -= 20;  // 激しく体力を消耗
                        this.stats.mood -= 20; // かなり不機嫌になる
                    }
                    this.fishingPopupTimer = 90;
                    this.fishingPopup = `❌ ヌシに力負けした...`;
                } else {
                    const failMsgs = ["逃げられた...", "糸が切れた..."];
                    this.message = failMsgs[Math.floor(Math.random()*failMsgs.length)];
                }
                this.messageTimer = 90;
                // ▲▲▲ 新規追加ここまで ▲▲▲
                
                if (d.isBreak) {
                    this.inventory.splice(d.bestIdx, 1);
                    setTimeout(() => {
                        this.message = "あっ！釣り竿が壊れちゃった..."; this.messageTimer = 150;
                    }, 1000);
                }

                // ★ 修正：失敗（逃げられた）しても「釣りをした回数」にはカウント！
                if (this.apprentice && this.apprentice.activeQuests) {
                    this.apprentice.activeQuests.forEach(q => {
                        if (q.masterType === 'fishing') q.qVal = (q.qVal || 0) + 1;
                    });
                    if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                }
                if (typeof window.progressDailyQuest === 'function') window.progressDailyQuest('fish'); // 👈これを追加！
            }
        }
    } else if (d.phase === 'result') {
        d.timer++;
        if (d.timer > 100) { 
            d.phase = 'idle';
            d.timer = 0;
            let hasRod = this.inventory.some(k => k.startsWith('rod_'));
            
            // ★完全修正：1回釣っただけで終わらせない！
            // 「竿が壊れて無くなった時だけ」現在の釣りを終了して、次の予定へ進む！
            if (!hasRod && this.schedule && this.schedule.length > 0 && this.schedule[0].type === 'fish') {
                this.schedule[0].duration = 0; // 現在の釣りタスクのみを完了
                this.message = "釣り竿がなくなったから切り上げるよ！";
                this.messageTimer = 120;
            }
        }
    }
};

// ==========================================
// ★ 修正：弟子入り志願の冒頭にストッパーを追加
// ==========================================
aiPet.applyApprenticeship = function(masterType) {
    if (this.apprentice.isGraduated) {
        this.message = "自分はもう極めた身だ。（他の弟子入りはできない）"; this.messageTimer = 120; return false;
    }
    if (this.apprentice.currentMaster) {
        this.message = "すでに弟子入り中です！"; this.messageTimer = 120; return false;
    }
    if (this.apprentice.isExcommunicated) {
        this.message = "破門中で、新しい弟子入りはできません..."; this.messageTimer = 120; return false;
    }
    
    let attempts = this.apprentice.attempts[masterType] || 0;
    if (attempts >= 3) {
        this.message = "このジャンルではもう見放されている...（挑戦上限）"; this.messageTimer = 120; return false;
    }
    
    this.apprentice.attempts[masterType] = attempts + 1;
    
    // 現在の予定をクリアして試験タスクを入れる
    this.schedule = [];
    this.schedule.push({
        type: 'apprentice_exam',
        masterType: masterType,
        duration: 300, // 約10秒間の試験時間（プログレスバー進行用に延長）
        maxDuration: 300
    });
    
    this.message = "いざ、入門試験へ...！";
    this.messageTimer = 120;
    
    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    return true;
};

// ★大改修：教えた3つの言葉を基準に合否を判定する（類義語対応版）
aiPet.processApprenticeExamFinish = function(task) {
    const mType = task.masterType;
    const words = this.apprentice.learnedWords || [];
    const kwData = window.EXAM_KEYWORDS[mType];
    
    let passed = true;
    // ★修正：acceptsのグループそれぞれについて、AIが知っている単語が1つでも含まれていればクリア！
    if (kwData && kwData.accepts) {
        passed = kwData.accepts.every(synonyms => synonyms.some(w => words.includes(w)));
    }
    
    if (passed) {
        if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, "「全問正解だ！お前を私の弟子として認めよう！」", 'exam_pass');
    } else {
        let attempts = this.apprentice.attempts[mType] || 0;
        if (attempts >= 3) {
            let retireMsg = "";
            if (mType === 'explore') retireMsg = "「ごめんなさい、自然は甘くないから君を連れて行くわけにはいかないわ。……でも、キャンプに遊びに来るくらいならいつでも歓迎するわよ！」";
            else if (mType === 'farming') retireMsg = "「ごめんね、君にはまだ土と対話する準備ができていないようだ。……でも、うちの野菜が食べたくなったらいつでもおいで。」";
            else if (mType === 'fishing') retireMsg = "「いやぁ、お前さんには釣りの才能はないかもしれんな！ハッハッハ！……まぁ、釣りの話がしたくなったらいつでも遊びに来なよ。」";
            else if (mType === 'cooking') retireMsg = "「ダメだな！君の料理にはソウルが足りない！弟子入りはお断りだ！……だが、腹が減ったらうちの飯を食いに来な！」";
            else if (mType === 'smithing') retireMsg = "「……鉄が泣いている。お前には教えられん。……だが、火にあたりたければ、端に座っているくらいは許そう。」";
            else if (mType === 'building') retireMsg = "「悪いが、君に設計図を引くセンスは感じられないな。……だが、建築に興味があるなら、現場を見学するくらいは構わないぞ。」";
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, retireMsg, 'banned');
        } else {
            let hintMsg = "";
            if (mType === 'explore') hintMsg = "「まだまだね。私が指定した3つの言葉をもう一度しっかり覚えていらっしゃい。」";
            else if (mType === 'farming') hintMsg = "「まだまだだね。私が指定した3つの言葉をもう一度しっかり覚えておいで。」";
            else if (mType === 'fishing') hintMsg = "「全然ダメだぜ！俺が指定した3つの言葉をもう一度しっかり覚えてきな！」";
            else if (mType === 'cooking') hintMsg = "「なっちゃいないな！私が指定した3つの言葉をもう一度しっかり覚えてこい！」";
            else if (mType === 'smithing') hintMsg = "「……話にならん。俺が指定した3つの言葉をもう一度しっかり覚えてこい。」";
            else if (mType === 'building') hintMsg = "「まだまだだな。私が指定した3つの言葉をもう一度しっかり覚えてきてくれ。」";
            
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, hintMsg, 'exam_fail');
        }
    }
};

// 使わなくなった関数は空にしておく
aiPet.assignApprenticeQuest = function() {};
aiPet.checkExcommunication = function() {};

// ==========================================
// ★ 修正：空気を読むランダムエンカウント（乱入防止完全版）
// ==========================================
aiPet.checkEncounter = function() {
    if (this.isHelper || window.isGamePaused) return;
    
    // ★追加：すでにUIが開いている、またはエンカウント演出の待機中なら乱入しない！
    if (this._isEncounterPending) return;
    const overlay = document.getElementById('encounterOverlay');
    if (overlay && overlay.classList.contains('active')) return;
    
    if (this.age === 0 && (!this._birthGuardTimer || this._birthGuardTimer < 300)) {
        this._birthGuardTimer = (this._birthGuardTimer || 0) + 1;
        return; 
    }

    if (!this.apprentice || !this.apprentice.learnedWords || this.apprentice.learnedWords.length < 3) return;
    if (this.apprentice.currentMaster || this.apprentice.isGraduated) return;

    if (this.schedule && this.schedule.length > 0) {
        if (!['camping', 'sleeping', 'rest'].includes(this.actionState)) {
            return; 
        }
    }
    if (['apprentice_training', 'inside', 'entering'].includes(this.actionState)) return;

    this.apprentice.encounterTimer = (this.apprentice.encounterTimer || 0) + 1;
    if (this.apprentice.encounterTimer < 200) return;

    let candidates = [];
    const isAlreadyMastered = (mType) => {
        if (this.apprentice.retired && this.apprentice.retired[mType] === true) return true;
        if (this.apprentice.retiredList && this.apprentice.retiredList.includes(mType)) return true;
        if (this.apprentice.rank && this.apprentice.rank[mType] >= 10) return true;
        return false;
    };

    const getAttempts = (mType) => this.apprentice.attempts && this.apprentice.attempts[mType] ? this.apprentice.attempts[mType] : 0;

    if (['camping', 'sleeping', 'rest'].includes(this.actionState)) {
        if (!this.apprentice.metMasters) this.apprentice.metMasters = [];
        if (!this.apprentice.metMasters.includes('smithing')) candidates.push('smithing');
    }
    else if (['idle', 'moving'].includes(this.actionState)) {
        let nearFlags = { explore: false, building: false, fishing: false, farming: false, cooking: false };

        for (let k in assets) {
            const a = assets[k];
            const aScale = a.scale || 0.5;
            const cx = a.dx + (a.sw * aScale) / 2;
            const cy = a.dy + (a.sh * aScale) / 2;
            const dist = Math.hypot(this.x - cx, this.y - cy);
            
            if (dist < 250) {
                const typeBase = k.split('_')[0];
                if (typeBase === 'palms' || typeBase === 'mountain' || typeBase === 'skull') nearFlags.explore = true;
                if (typeBase === 'palms') nearFlags.building = true;
                if (a.type === 'water' || a.type === 'sea' || a.type === 'bridge') nearFlags.fishing = true;
                if (a.type === 'farm') nearFlags.farming = true;
                if (a.type === 'restaurant') nearFlags.cooking = true; 
            }
        }

        if (!this.apprentice.metMasters) this.apprentice.metMasters = [];
        const hasMet = (mType) => this.apprentice.metMasters.includes(mType);

        if (nearFlags.explore && !hasMet('explore')) candidates.push('explore');
        if (nearFlags.building && !hasMet('building')) candidates.push('building');
        if (nearFlags.fishing && !hasMet('fishing')) candidates.push('fishing');
        if (nearFlags.farming && !hasMet('farming')) candidates.push('farming');
        if (nearFlags.cooking && !hasMet('cooking')) candidates.push('cooking');
    }

    if (candidates.length > 0) {
        if (Math.random() < 0.3) { 
            this.apprentice.encounterTimer = 0;
            this._isEncounterPending = true; // ★追加：エンカウント予約フラグON
            
            const metType = candidates[Math.floor(Math.random() * candidates.length)];
            
            this.message = "（誰かの気配がする...！）";
            this.messageTimer = 120;
            let encounterMsg = "";
            if (metType === 'explore') encounterMsg = "「あら、こんな所で人に会うなんてね...」";
            else if (metType === 'farming') encounterMsg = "「やあ、土いじりに興味があるのかい？」";
            else if (metType === 'fishing') encounterMsg = "「坊主、魚の釣り方を教えてやろうか？ハッハッハ！」";
            else if (metType === 'cooking') encounterMsg = "「いらっしゃい！私の料理の腕前、見ていくか！」";
            else if (metType === 'smithing') encounterMsg = "「……野宿か。火の扱いなら教えよう。」";
            else if (metType === 'building') encounterMsg = "「良い木材だな...ん？君も建築に興味があるのか？」";
            
            setTimeout(() => { 
                this._isEncounterPending = false; // ★追加：エンカウント予約フラグOFF
                if (typeof window.openEncounterUI === 'function') window.openEncounterUI(metType, encounterMsg, 'encounter_intro'); 
            }, 1000);
            if (metType === 'cooking') { for (let k in assets) { if (assets[k].type === 'restaurant' && assets[k].isMobile) { delete assets[k]; break; } } }
        }
    }
};

aiPet.processApprenticeQuestFinish = function(task) {
    if (task.aborted) {
        this.apprentice.failCount = (this.apprentice.failCount || 0) + 1;
        this.apprentice.pendingReport = 'fail'; 
        this.message = "課題を途中でやめた...報告に行かなきゃ..."; 
        return;
    }

    const mType = task.masterType; let successRate = 0.5; 
    if (mType === 'farming') successRate += (this.stats.power * 0.01) + (this.apprentice.learnedWords.includes("農業") ? 0.2 : 0);
    else if (mType === 'cooking') successRate += (this.stats.intel * 0.01) + (this.apprentice.learnedWords.includes("料理") ? 0.2 : 0);
    else if (mType === 'smithing') successRate += (this.stats.power * 0.005 + this.stats.intel * 0.005) + (this.apprentice.learnedWords.includes("鍛冶") ? 0.2 : 0);

    if (Math.random() < successRate) {
        this.apprentice.successCount = (this.apprentice.successCount || 0) + 1;
        this.apprentice.pendingReport = 'success'; 
        this.message = "課題達成！報告に行こう！"; 
    } else {
        this.apprentice.failCount = (this.apprentice.failCount || 0) + 1;
        this.apprentice.pendingReport = 'fail'; 
        this.message = "失敗しちゃった...報告に行かなきゃ..."; 
    }
    this.apprentice.inventory = []; 
    this.messageTimer = 180;
};

aiPet.update = function() {
    const shouldAnimate = (currentMode === 'play') || (currentMode === 'grazing') || (currentMode === 'ai_adjust' && isTestPlaying);
    if (!shouldAnimate || isRouletteSpinning) return;

    if (isNaN(this.energy)) this.energy = 100;
    if (isNaN(this.hunger)) this.hunger = 100;
    if (!this.stats) this.stats = { intel: 10, power: 10, mood: 100, beauty: 10 };
    if (isNaN(this.stats.intel)) this.stats.intel = 10;
    if (isNaN(this.stats.power)) this.stats.power = 10;
    if (isNaN(this.stats.mood)) this.stats.mood = 100;
    if (isNaN(this.stats.beauty)) this.stats.beauty = 10;
    if (isNaN(this.darknessCounter)) this.darknessCounter = 0;
    
    if (!this.apprentice) this.apprentice = { learnedWords: [], rank: {}, attempts: {} };
    if (!this.apprentice.learnedWords) this.apprentice.learnedWords = [];

    // ★互換性パッチ：activeQuest(単一)を activeQuests(配列) に変換
    if (!this.apprentice.activeQuests) {
        this.apprentice.activeQuests = [];
        if (this.apprentice.activeQuest) {
            let oldQ = this.apprentice.activeQuest;
            oldQ.masterType = oldQ.masterType || this.apprentice.currentMaster;
            oldQ.qVal = this.apprentice.qVal || 0;
            this.apprentice.activeQuests.push(oldQ);
            delete this.apprentice.activeQuest;
            delete this.apprentice.qVal;
        }
    }
    
    if (this.apprentice.learnedWords.length === 0 && !this._tutorialDone && currentMode === 'play') {
        this._tutorialDone = true;
        this.message = "何をすればいいかわかりません…\n言葉を教えてください！";
        this.messageTimer = 300;
        if (typeof window.showGameTutorial === 'function') window.showGameTutorial("📖 最初のチュートリアル", "AIに「好きな言葉」を教えてあげましょう！");
    }

    const oldIntel = Math.floor(this.stats.intel); 
    const oldPower = Math.floor(this.stats.power);
    const oldMood  = Math.floor(this.stats.mood); 
    const oldBeauty = Math.floor(this.stats.beauty || 0);
    const oldSpeed = Math.floor(this.stats.speed || 10);

    if (!this.isReincarnating && this.age >= (this.lifespan || 100)) {
        this.isReincarnating = true; this.actionState = 'idle'; this.visualAction = 'sleep'; this.schedule = [];
        this.message = "天寿を全うした..."; this.messageTimer = 300;
        if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 60, "👼 昇天...", "#FFD700");
        if (typeof window.triggerReincarnation === 'function') window.triggerReincarnation();
        return;
    }

    if (window.isFastForwardLife) {
        if (typeof this.ffTimer === 'undefined') this.ffTimer = 0;
        this.ffTimer++;
        if (this.ffTimer >= 60) { 
            this.ffTimer = 0; this.age += 1; this.energy = 100; this.hunger = 100; this.stats.mood = 100;
            if (this.schedule.length > 0) { this.schedule[0].duration -= 15; }
            if (typeof addFloatingText === 'function' && !window.isCatchingUp) { addFloatingText(this.x, this.y - 80, "⏳ 1年経過...", "#E0E0E0"); }
            if (this.age === 20 && typeof this.checkAndTriggerAdulthood === 'function') this.checkAndTriggerAdulthood();
        }
    } else {
        if (this.lifeAgeTimer === undefined) this.lifeAgeTimer = 0;
        this.lifeAgeTimer++;
        if (this.lifeAgeTimer >= 86400) {
            this.lifeAgeTimer = 0;
            this.age = (this.age || 0) + 1;
            if (typeof addFloatingText === 'function' && !window.isCatchingUp) addFloatingText(this.x, this.y - 60, `🎂 ${this.age}歳になった！`, "#FF4081");
            if (this.age === 20 && typeof this.checkAndTriggerAdulthood === 'function') this.checkAndTriggerAdulthood();
        }
    }

    if (typeof this.gameTimer === 'undefined') this.gameTimer = 0;
    this.gameTimer++;
    const isOneMinutePassed = (this.gameTimer >= 20);
    
    if (isOneMinutePassed) {
        this.gameTimer = 0; this.updateWeather();

        if (this.inventory && this.inventory.length > 0 && typeof this.inventory[0] === 'string') {
            this.inventory = this.inventory.map(itemId => ({ id: itemId, age: 0 }));
        }

        if (this.inventory && this.inventory.length > 0) {
            this.inventory.forEach(itemObj => {
                const itemData = window.itemCatalog ? window.itemCatalog[itemObj.id] : null;
                if (!itemData) return;

                if (itemData.type === 'ingredient' || itemData.type === 'food' || itemData.type === 'dish') {
                    if (itemData.quality === 'bad') return;

                    itemObj.age = (itemObj.age || 0) + 1;

                    let rotLimit = 24;
                    if (itemObj.id.startsWith('fish_') || itemData.type === 'dish') rotLimit = 12;

                    if (itemObj.age >= rotLimit) {
                        if (itemObj.id.startsWith('fish_')) {
                            itemObj.id = 'rotten_fish';
                        } else if (itemData.type === 'dish') {
                            itemObj.id = 'rotten_food';
                        } else {
                            itemObj.id = 'rotten_veg'; 
                        }
                        itemObj.age = 0;
                        if (!window.isCatchingUp && typeof addFloatingText === 'function') {
                            addFloatingText(this.x, this.y - 60, "🍄 持ち物が腐った...", "#795548");
                        }
                    }
                }
            });
        }

        for (let uid in assets) {
            const a = assets[uid];
            if (a.type === 'farm') {
                if (a.waterLevel === undefined) a.waterLevel = 100;
                if (a.pestState === undefined) a.pestState = false;
                if (a.isDead === undefined) a.isDead = false;
                if (a.isEaten === undefined) a.isEaten = false;
                
                const isGivenSeed = (a.plantedCrop === 'seed_carrot_given');
                
                let onWater = false;
                if (typeof this.isPointOnWater === 'function') {
                    let cx = a.dx + (a.sw * (a.scale||0.5))/2; 
                    let cy = a.dy + (a.sh * (a.scale||0.5))/2;
                    if (this.isPointOnWater(cx, cy) || 
                        this.isPointOnWater(cx-90, cy) || this.isPointOnWater(cx+90, cy) || 
                        this.isPointOnWater(cx, cy-90) || this.isPointOnWater(cx, cy+90)) {
                        onWater = true;
                    }
                }

                if (a.plantedCrop && !a.isDead && !a.isEaten && a.growth < 100) {
                    if (this.weather === 'rain' || this.weather === 'thunder' || onWater) {
                        a.waterLevel = 100;
                    } else { 
                        a.waterLevel = Math.max(0, a.waterLevel - 2); 
                    }
                    
                    if (a.waterLevel <= 0 && !isGivenSeed) {
                        a.isDead = true;
                    }
                    
                    if (!a.isDead && !a.isEaten) {
                        a.growth += (a.waterLevel > 50 ? 0.5 : 0.1); 
                        if (a.growth > 100) a.growth = 100;
                    }
                    
                    if (!isGivenSeed && a.growth > 10) {
                        if (!a.pestState && Math.random() < 0.10) { a.pestState = true; a.pestTimer = 0; }
                        if (a.pestState) {
                            a.pestTimer++;
                            if (a.pestTimer > 10) a.isEaten = true;
                        }
                    }
                }
            }
        }
        if (this.gold < 0) {
            this.debtTimer = (this.debtTimer || 0) + 1;
            if (this.debtTimer > DEBT_TIME_LIMIT) { if (typeof this.triggerBankruptcy === 'function') this.triggerBankruptcy(); return; }
        } else { this.debtTimer = 0; }
    }

    if (typeof window.addShopLog !== 'function') {
        window.addShopLog = function(shopData, text) {
            if (!shopData) return;
            if (!shopData.logs) shopData.logs = [];
            let timeStr = new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
            shopData.logs.unshift(`[${timeStr}] ${text}`);
            if (shopData.logs.length > 8) shopData.logs.pop(); 
            let shopAsset = Object.values(assets).find(a => a.shopData === shopData);
            if (typeof window.updateShopUIData === 'function' && shopAsset && !window.isCatchingUp) window.updateShopUIData(shopAsset);
        };
    }
    if (typeof window.checkRecipeMaterials !== 'function') {
        window.checkRecipeMaterials = function(inventory, recipeId, shopType) {
            if (!inventory) return null;
            let reqs = [];
            if (recipeId === 'dish_stirfry') reqs = ['veg', 'veg']; 
            else if (recipeId === 'dish_steak') reqs = ['meat', 'veg']; 
            else if (recipeId === 'dish_soup') reqs = ['water', 'veg']; 
            else if (recipeId === 'baked_carrot') reqs = ['carrot']; 
            else if (recipeId === 'baked_fish') reqs = ['fish']; 
            else if (recipeId === 'sashimi') reqs = ['fish', 'fish']; 
            else { if (shopType === 'restaurant') reqs = ['any_food', 'any_food']; else reqs = ['iron', 'wood']; }

            let consumedIndices = [];
            let tempInv = [...inventory];
            for (let req of reqs) {
                let foundIdx = -1;
                let maxAge = -1;

                for (let i = 0; i < tempInv.length; i++) {
                    let itemObj = tempInv[i];
                    if (!itemObj) continue;
                    
                    let itemId = typeof itemObj === 'string' ? itemObj : itemObj.id;
                    let itemAge = typeof itemObj === 'string' ? 0 : (itemObj.age || 0);
                    
                    let match = false;
                    if (req === 'veg') match = ['carrot', 'tomato', 'pepper', '七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'berry', 'イチゴ', '春の七草', '野イチゴ'].some(k => itemId.includes(k));
                    else if (req === 'meat') match = ['meat', '肉', 'chicken', 'beef'].some(k => itemId.includes(k));
                    else if (req === 'water') match = ['water', '水'].some(k => itemId.includes(k));
                    else if (req === 'fish') match = ['fish', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ'].some(k => itemId.includes(k));
                    else if (req === 'any_food') match = ['七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ', 'イチゴ', '春の七草', '野イチゴ'].some(k => itemId.includes(k));
                    else match = itemId.includes(req);
                    
                    if (match && itemAge > maxAge) { 
                        foundIdx = i; 
                        maxAge = itemAge;
                    }
                }
                if (foundIdx !== -1) { consumedIndices.push(foundIdx); tempInv[foundIdx] = null; } 
                else { return null; }
            }
            let consumedIds = [];
            consumedIndices.forEach(idx => consumedIds.push(inventory[idx]));
            return consumedIds;
        };
    }

    let myShop = null;
    if (this.isIndoors && this.indoorTarget && (this.indoorTarget.type === 'restaurant' || this.indoorTarget.type === 'smith')) {
        if (!this.indoorTarget.isMasterShop) {
            myShop = this.indoorTarget;
        }
    }

    const isCurrentlyWorking = this.schedule.length > 0 && (this.schedule[0].type === 'shop_work' || this.schedule[0].type === 'shop_research');

    if (myShop && (this.actionState === 'idle' || this.actionState === 'inside' || this.actionState === 'studying') && !isCurrentlyWorking) {
        if (typeof this.shopThinkTimer === 'undefined') this.shopThinkTimer = 0;
        this.shopThinkTimer++;
        
        if (this.shopThinkTimer >= 100) {
            this.shopThinkTimer = 0;
            let s = myShop.shopData;
            if (s) {
                let targetStock = 10 + Math.floor((this.stats.intel || 10) / 20) * 5; 
                let totalStock = 0;
                let knownRecipes = Object.keys(s.recipes || {}).filter(k => s.recipes[k].learned);
                this.inventory.forEach(itemObj => {
                    let id = typeof itemObj === 'string' ? itemObj : itemObj.id;
                    if (knownRecipes.includes(id)) {
                        totalStock++;
                    }
                });

                if (this.energy <= 5 || this.hunger <= 5) {
                    this.message = "もう限界だ..."; this.messageTimer = 120;
                } else if (s.isOpen) {
                    let runningCost = myShop.type === 'restaurant' ? 2 : 3;
                    this.gold -= runningCost;
                    
                    if (totalStock === 0 && !(window.shopNPCs && window.shopNPCs.length > 0)) {
                        if (Math.random() < ((this.stats.intel || 10) / 100 + 0.2)) {
                            s.isOpen = false;
                            window.addShopLog?.(s, "売り切れのため一度お店を閉めよう。");
                            if (typeof window.openShopManagementUI === 'function' && document.getElementById('shop-management-ui')?.style.display !== 'none' && !window.isCatchingUp) window.openShopManagementUI(myShop);
                        } else {
                            if (Math.random() < 0.3) window.addShopLog?.(s, "【警告】在庫が0なのにのんきに店を開け続けている！");
                        }
                    }
                } else {
                    let upgradeCost = s.interiorLevel * 1000;
                    if (s.interiorLevel < 3 && this.gold >= upgradeCost * 2 && Math.random() < 0.2) {
                        this.gold -= upgradeCost; s.interiorLevel++;
                        window.addShopLog?.(s, `✨ お店の内装をレベル${s.interiorLevel}に改装した！`);
                        if (typeof window.openShopManagementUI === 'function' && document.getElementById('shop-management-ui')?.style.display !== 'none' && !window.isCatchingUp) window.openShopManagementUI(myShop);
                    }
                    else if (totalStock >= targetStock) { 
                        let isSmartMenuManager = (this.stats.intel || 10) >= 50;
                        for (let r in s.recipes) {
                            if (s.recipes[r].learned) {
                                let count = this.inventory.filter(itemObj => {
                                    let id = typeof itemObj === 'string' ? itemObj : itemObj.id;
                                    return id === r;
                                }).length;
                                if (isSmartMenuManager && count === 0) s.recipes[r].hidden = true;
                                else s.recipes[r].hidden = false;
                            }
                        }
                        
                        s.isOpen = true;
                        window.addShopLog?.(s, "在庫が貯まった！お店を開けよう！");
                        if (typeof window.openShopManagementUI === 'function' && document.getElementById('shop-management-ui')?.style.display !== 'none' && !window.isCatchingUp) window.openShopManagementUI(myShop);
                    } else {
                        let maxPerItem = 20 + Math.min(10, Math.floor((this.stats.intel || 10) / 100));
                        let currentStockDict = typeof window.getCurrentShopStock === 'function' ? window.getCurrentShopStock(s.recipes) : {};
                        let knownRecipes = Object.keys(s.recipes || {}).filter(k => s.recipes[k].learned);

                        const canAffordToConsume = (consumedIds) => {
                            let requiredCounts = {};
                            consumedIds.forEach(itemObj => { 
                                let id = typeof itemObj === 'string' ? itemObj : itemObj.id;
                                requiredCounts[id] = (requiredCounts[id] || 0) + 1; 
                            });
                            for (let id in requiredCounts) {
                                let currentTotal = (this.inventory || []).filter(itemObj => {
                                    let iid = typeof itemObj === 'string' ? itemObj : itemObj.id;
                                    return iid === id;
                                }).length;
                                if (currentTotal - requiredCounts[id] < 5) return false;
                            }
                            return true;
                        };

                        let craftable = knownRecipes.filter(r => {
                            if ((currentStockDict[r] || 0) >= maxPerItem) return false;
                            let consumedIds = typeof window.checkRecipeMaterials === 'function' ? window.checkRecipeMaterials(this.inventory, r, myShop.type) : null;
                            if (!consumedIds) return false;
                            if (!canAffordToConsume(consumedIds)) return false; 
                            return true;
                        });

                        let hasZeroStockMenu = knownRecipes.some(r => (currentStockDict[r] || 0) === 0);
                        let doResearch = false;

                        if (craftable.length === 0) {
                            if (Math.random() < 0.4) doResearch = true; 
                        } else if (!hasZeroStockMenu) {
                            let researchChance = 0.15 + ((this.stats.intel || 10) / 400);
                            if (researchChance > 0.6) researchChance = 0.6;
                            if (Math.random() < researchChance) doResearch = true;
                        }

                        if (doResearch) {
                            this.schedule.unshift({ type: 'shop_research', buildingId: myShop.id || Object.keys(assets).find(k=>assets[k]===myShop), duration: 80 });
                            window.addShopLog?.(s, "ふと新しいアイデアが降りてきそうだ...新メニューの研究を始めよう！");
                        } else if (craftable.length > 0) {
                            craftable.sort((a, b) => {
                                let stockA = currentStockDict[a] || 0;
                                let stockB = currentStockDict[b] || 0;
                                return stockA - stockB;
                            });
                            let pick = craftable[0];
                            this.schedule.unshift({ type: 'shop_work', buildingId: myShop.id || Object.keys(assets).find(k=>assets[k]===myShop), duration: 60, targetRecipeId: pick });
                            window.addShopLog?.(s, `「${typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(pick) : pick}」の在庫が少ないな。仕込みをしよう！`);
                        } else {
                            if (Math.random() < 0.3) window.addShopLog?.(s, "いざという時の為の素材は残しておかないとね。（仕込み待機中）");
                        }
                    }
                }
            }
        }
    }

    if ((currentMode === 'play' || currentMode === 'grazing')) {
        if (myShop) {
            if (!this._stashedTasks) this._stashedTasks = [];
            for (let i = this.schedule.length - 1; i >= 0; i--) {
                const t = this.schedule[i];
                if (t.type !== 'shop_work' && t.type !== 'shop_research') {
                    this._stashedTasks.push(this.schedule.splice(i, 1)[0]);
                }
            }
            if (this.schedule.length === 0) {
                this.actionState = 'inside'; this.isIndoors = true; this.visualAction = 'idle';
                if (this.message !== "いらっしゃいませ！" && this.messageTimer <= 0) { this.message = "いらっしゃいませ！"; this.messageTimer = 180; }
            }
        } else {
            if (this._stashedTasks && this._stashedTasks.length > 0) {
                while(this._stashedTasks.length > 0) { this.schedule.unshift(this._stashedTasks.pop()); }
            }
        }

        if (this.schedule.length > 0) {
            let task = this.schedule[0]; 

            if (this.isSick && !['sleep', 'rest', 'eat'].includes(task.type)) {
                task.duration = 0; task.aborted = true;
                this.actionState = 'idle';
                this.message = "具合が悪くて動けない..."; this.messageTimer = 120;
                this.schedule.shift();
                if (typeof window.updateScheduleList === 'function' && !window.isCatchingUp) window.updateScheduleList();
                return;
            }

            const eff = getActionEfficiency(task.type).rate;
            
            const tData = typeof this.getTraitData === 'function' ? this.getTraitData() : {};
            const consumeRate = tData.consumption !== undefined ? tData.consumption : 1.0; 
            const bIntel = tData.statBonus?.intel || 1.0;
            const bPower = tData.statBonus?.power || 1.0;

            // =======================================
            // ★タスクの初期化処理
            // =======================================
            if (!task._started) {
                const instantTasks = ['visit_master', 'apprentice_exam', 'master_quest'];
                if (instantTasks.includes(task.type) && task.type !== 'apprentice_exam') { task.duration = 1; } 
                else if (!task.duration || task.duration <= 0) { task.duration = 60; }
                task.maxDuration = task.duration;
                
                // 探検の目的地選び
                if (task.type === 'explore') {
                    task.duration = 60; task.maxDuration = 60;
                    
                    let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
                    
                    let isDungeon = (a, uid) => {
                        if (a.type === 'skull' || a.type === 'crystal') return true;
                        if (uid && (uid.startsWith('skull') || uid.startsWith('crystal'))) return true;
                        if (a.name && (a.name.includes('スカル') || a.name.includes('クリスタル') || a.name.includes('迷宮') || a.name.includes('ダンジョン') || a.name.includes('洞窟') || a.name.includes('水晶') || a.name.includes('鉱山'))) return true;
                        return false;
                    };
                    
                    let allAssetsWithUid = Object.entries(assets).map(([uid, a]) => ({ uid, ...a, originalAsset: a }));
                    let bridgeCount = allAssetsWithUid.filter(a => a.type === 'bridge').length;
                    let canAccessRareArea = bridgeCount >= 2;
                    let mainRef = allAssetsWithUid.find(a => a.type === 'farm' || a.type === 'restaurant' || a.type === 'house');
                    let refX = mainRef ? mainRef.dx + 25 : 400;
                    let refY = mainRef ? mainRef.dy + 25 : 240;

                    let validTargets = allAssetsWithUid.filter(a => {
                        let isPossibleTarget = (a.type === 'nature' || a.type === 'building' || a.type === 'skull' || a.type === 'crystal' || isDungeon(a, a.uid));
                        if (!isPossibleTarget) return false;

                        let aScale = a.scale || 0.5;
                        let aX = a.dx + (a.sw * aScale) / 2;
                        let aY = a.dy + (a.sh * aScale) / 2;
                        let inRareArea = typeof this.isWaterBetween === 'function' ? this.isWaterBetween(refX, refY, aX, aY) : false;

                        if (inRareArea && !canAccessRareArea) return false;
                        if (!isMasterExplorer && isDungeon(a, a.uid)) return false;

                        return true;
                    });

                    let dungeons = validTargets.filter(a => isDungeon(a, a.uid));
                    let normals = validTargets.filter(a => !isDungeon(a, a.uid));
                    let finalTargetWrapped = null;

                    if (dungeons.length > 0 && normals.length > 0) {
                        if (Math.random() < 0.70) {
                            finalTargetWrapped = dungeons[Math.floor(Math.random() * dungeons.length)];
                        } else {
                            finalTargetWrapped = normals[Math.floor(Math.random() * normals.length)];
                        }
                    } else if (dungeons.length > 0) {
                        finalTargetWrapped = dungeons[Math.floor(Math.random() * dungeons.length)];
                    } else if (normals.length > 0) {
                        finalTargetWrapped = normals[Math.floor(Math.random() * normals.length)];
                    }

                    if (finalTargetWrapped) {
                        this.startBuildingInteraction(finalTargetWrapped.originalAsset);
                        let targetName = finalTargetWrapped.name || "未知の場所";
                        this.message = `「${targetName}」に探検に行くよ！`;
                        this.messageTimer = 180;
                    } else {
                        task.duration = 0; task.aborted = true;
                        this.message = "行ける場所がないみたい...";
                        this.messageTimer = 120;
                    }
                }
                else if (task.type === 'eat') {
                    const facility = findFacilityForTask('eat');
                    if (facility) this.startBuildingInteraction(facility); else { this.actionState = 'camping'; this.message = "ここでご飯にするよ！"; }
                }
                else if (task.type === 'build') {
                    if (!this.processBuildingStart(task)) { task.duration = 0; task.aborted = true; } 
                    else {
                        this.interactionTarget = { type: 'building_site' };
                        let destX = task.buildData.walkX !== undefined ? task.buildData.walkX : task.buildData.bestX;
                        let destY = task.buildData.walkY !== undefined ? task.buildData.walkY : task.buildData.bestY;
                        if (this.setDestination(destX, destY, false)) this.actionState = 'moving_to_enter';
                        else { task.duration = 0; task.aborted = true; }
                    }
                }
                else if (task.type.startsWith('life_')) {
                    if (typeof this.processLifePathStart === 'function') this.processLifePathStart(task);
                    this.actionState = 'camping'; 
                }
                else if (task.type === 'farm') {
                    let isMaster = this.apprentice && (
                        (this.apprentice.retired && this.apprentice.retired['farming']) || 
                        (this.apprentice.currentMaster === 'farming' && this.apprentice.isGraduated) ||
                        (this.apprentice.rank && this.apprentice.rank['farming'] >= 10)
                    );
                    
                    let intendedSeed = task.intendedSeed || null;

                    if (!intendedSeed && task.intendedAction !== 'pest_control') {
                        if (isMaster) {
                            if (this.inventory && this.inventory.some(i => (typeof i==='string'?i:i.id)==='seed_carrot')) intendedSeed = 'seed_carrot';
                            else if (this.inventory && this.inventory.some(i => (typeof i==='string'?i:i.id)==='seed_tomato')) intendedSeed = 'seed_tomato';
                            else if (this.inventory && this.inventory.some(i => (typeof i==='string'?i:i.id)==='seed_pepper')) intendedSeed = 'seed_pepper';
                        } else { intendedSeed = 'seed_carrot_given'; }
                    }

                    let farms = [];
                    for (let k in assets) {
                        if (assets[k].type === 'farm') farms.push(assets[k]);
                    }

                    let targetFarm = null;

                    if (farms.length > 0) {
                        let aiX = this.x; let aiY = this.y;
                        
                        farms.forEach(f => {
                            let dist = Math.hypot(aiX - (f.dx + f.sw*0.5/2), aiY - (f.dy + f.sh*0.5/2));
                            let score = 0;

                            if (task.intendedAction === 'pest_control') {
                                if (f.pestState) score -= 10000;
                                else score += 10000; 
                            } 
                            else if (f.pestState || f.isDead || f.isEaten || f.growth >= 100) {
                                score -= 5000;
                            }
                            else if (!f.plantedCrop && intendedSeed) {
                                score -= 3000;
                            }
                            else if (f.plantedCrop && f.growth < 100 && f.waterLevel < 100) {
                                score -= (100 - f.waterLevel) * 10; 
                            }
                            else {
                                score += Math.random() * 500; 
                            }
                            
                            score += dist; 
                            f._tempScore = score;
                        });

                        farms.sort((a, b) => a._tempScore - b._tempScore);
                        targetFarm = farms[0];
                        
                        if (task.intendedAction === 'pest_control' && !targetFarm.pestState) {
                            targetFarm = null;
                        }
                    }

                    if (targetFarm) {
                        this.intendedSeed = (!targetFarm.plantedCrop || targetFarm.isDead || targetFarm.isEaten) ? intendedSeed : null;
                        this.intendedAction = task.intendedAction || null;
                        
                        if (targetFarm.growth >= 100) task.farmActionName = "収穫";
                        else if (targetFarm.isDead || targetFarm.isEaten) task.farmActionName = "片付け";
                        else if (targetFarm.pestState || this.intendedAction === 'pest_control') task.farmActionName = "害虫退治";
                        else if (this.intendedSeed && !targetFarm.plantedCrop) task.farmActionName = "種まき";
                        else task.farmActionName = "水やり";

                        let cx = targetFarm.dx + (targetFarm.sw * (targetFarm.scale||0.5))/2;
                        let cy = targetFarm.dy + (targetFarm.sh * (targetFarm.scale||0.5))/2;
                        
                        if (Math.hypot(this.x - cx, this.y - cy) < 80) {
                            this.interactionTarget = targetFarm;
                            this.executeEnterAction();
                        } else {
                            this.startBuildingInteraction(targetFarm);
                        }
                    } else {
                        task.duration = 0; task.aborted = true;
                        this.actionState = 'idle';
                        this.message = task.intendedAction === 'pest_control' ? "虫はいないみたい！" : "手入れが必要な畑がないみたい...";
                        this.messageTimer = 120;
                    }
                }
                // ★荷物整理タスクの初期化
                else if (task.type === '荷物整理') {
                    let myHut = assets[task.targetUid];
                    if (!myHut || !myHut.storage) {
                        this.message = "整理する設備がまだないみたい...";
                        this.messageTimer = 180;
                        task.duration = 0; 
                        task.aborted = true;
                        return;
                    }
                    this.startBuildingInteraction(myHut);
                }
                // ==========================================
                // ★ 追加：作戦会議タスクの初期化
                // ==========================================
                else if (task.type === '作戦会議') {
                    let myHut = assets[task.targetUid];
                    if (!myHut) {
                        this.message = "作戦を練る場所(小屋)がまだないみたい...";
                        this.messageTimer = 180;
                        task.duration = 0; 
                        task.aborted = true;
                        return;
                    }
                    this.startBuildingInteraction(myHut);
                }
                else {
                    let fType = task.type;
                    if (task.type === 'fish') fType = 'bridge';
                    const facility = task.type.startsWith('shop_') ? assets[task.buildingId] : findFacilityForTask(fType, task.masterType);
                    
                    if (facility) {
                        this.startBuildingInteraction(facility);
                    } else { 
                        if (task.type === 'fish') {
                            this.interactionTarget = { type: 'sea' };
                            if (this.setDestination(25, 25)) this.actionState = 'moving_to_enter';
                        } else {
                            this.actionState = 'camping'; 
                        }
                    }
                }
                task._started = true;
            }

            // ★作業中かどうかの判定（荷物整理も含める）
            const isActing = (this.actionState === 'camping' || this.actionState === 'studying' || this.actionState === 'training' || this.actionState === 'sleeping' || this.actionState === 'eating' || this.actionState === 'fishing' || this.actionState === 'smithing' || this.actionState === 'building' || this.isIndoors || this.actionState === 'apprentice_training' || this.actionState === 'farming_work');

            // =======================================
            // ★作業中(isActing)の毎フレーム処理
            // =======================================
            if (isActing) {
                const fastTasks = ['cook', 'smith', 'shop_work', 'shop_research', 'auto_trade']; 
                const isSlowTask = !fastTasks.includes(task.type);

                if (isSlowTask && !window.isFastForwardLife && !isOneMinutePassed) {
                    // アニメーションの設定
                    if (task.type === 'life_author' || task.type === 'writing' || task.type === 'study' || task.type === '荷物整理' || task.type === '作戦会議') { this.visualAction = 'study'; } 
                    else if (task.type === 'eat') { this.actionState = this.isIndoors ? 'inside' : 'eating'; this.visualAction = 'eat_raw'; } 
                    else if (task.type === 'cook' || task.type === 'shop_work' || task.type === 'smith') { this.visualAction = (myShop?.type === 'smith' || task.type === 'smith') ? 'smith' : 'cook'; }
                    else if (task.type === 'fish') {
                        this.visualAction = 'fish'; this.actionState = 'fishing';
                        if (typeof this.processFishingFrame === 'function') this.processFishingFrame();
                    }
                    else if (task.type === 'explore') {
                        if (this.actionState === 'inside' || this.isIndoors) { 
                            this.visualAction = 'move'; 
                        } else { 
                            this.actionState = 'inside'; this.isIndoors = true; 
                        }
                    }
                    else if (task.type === 'apprentice_exam') {
                        this.actionState = 'inside'; this.isIndoors = true; this.visualAction = 'study';
                        task.duration--; 
                        if (typeof window.updateExamUI === 'function') window.updateExamUI(task);
                    }
                    else if (task.type === 'farm') {
                        if (!this.visualAction) this.visualAction = 'farm_plow';
                        this.actionState = 'farming_work';
                    }
                    
                    if (task.isBaito && task.baitoActionMsg) {
                        if (this.message !== task.baitoActionMsg && !window.isCatchingUp) { 
                            this.message = task.baitoActionMsg; 
                            this.messageTimer = 120; 
                        }
                    }
                } else {
                    // ★ゲージの減算処理（農作業などはシステム側で終わらせるため減らさない）
                    if (task.type !== 'explore' && task.type !== 'apprentice_exam' && task.type !== 'farm') {
                        task.duration--;
                        if (this.activeMonuments) {
                            if (this.activeMonuments.some(m => m.stat === 'power') && task.type === 'train' && task.duration > 1) task.duration = 1;
                            if (this.activeMonuments.some(m => m.stat === 'intel') && (task.type === 'study' || task.type === 'writing' || task.type === 'life_author') && task.duration > 1) task.duration = 1;
                            if (this.activeMonuments.some(m => m.stat === 'speed') && task.type === 'run' && task.duration > 1) task.duration = 1;
                        }
                    }

                    // --- 各種ステータスアップなどのインゲーム処理 ---
                    if (task.type === 'study') { this.actionState = this.isIndoors ? 'inside' : 'studying'; this.visualAction = 'study'; this.stats.intel += 0.1 * eff * bIntel; }
                    else if (task.type === 'train') { this.actionState = this.isIndoors ? 'inside' : 'training'; this.visualAction = 'train'; this.stats.power += 0.1 * eff * bPower; }
                    else if (task.type === 'run') { this.actionState = this.isIndoors ? 'inside' : 'training'; this.visualAction = 'move'; this.stats.speed += 0.1 * eff * bPower; }
                    else if (task.type === 'rest' || task.type === 'sleep') { 
                        this.actionState = this.isIndoors ? 'inside' : 'sleeping'; this.visualAction = 'sleep'; this.energy += 1.0 * eff;
                        if (this.energy >= 60 && this.hunger >= 60) { 
                            let beautyGain = 0.1 * eff;
                            const currentHour = new Date().getHours();
                            if (currentHour >= 22 || currentHour <= 4) beautyGain *= 2;
                            this.stats.beauty += beautyGain;
                            if (!window.isCatchingUp) {
                                let effectCount = 1 + Math.floor(Math.random() * 2); 
                                for (let i = 0; i < effectCount; i++) {
                                    let offsetX = (Math.random() - 0.5) * 120; 
                                    let offsetY = (Math.random() - 0.5) * 30; 
                                    if (typeof addFloatingText === 'function') addFloatingText(this.x + offsetX, this.y + offsetY, "✨", "#FFEB3B");
                                }
                            }
                        }
                    }
                    else if (task.type === 'eat') { 
                        this.actionState = this.isIndoors ? 'inside' : 'eating'; this.visualAction = 'eat_raw';
                        if (this.hunger < 100 || this.isSick) this.consumeFood();
                        if (task.duration <= 0 && !task.aborted) this.processEatingFinish?.(task);
                    }
                    else if (task.type === 'fish') {
                        this.visualAction = 'fish'; this.actionState = 'fishing';
                        if (typeof this.processFishingFrame === 'function') this.processFishingFrame();
                    }
                    else if (task.type === 'cook' || task.type === 'shop_work' || task.type === 'smith') {
                        if (task.type === 'smith' && (!myShop || myShop.type !== 'smith')) {
                            this.actionState = 'camping'; this.isIndoors = false; this.visualScale = 1.0; 
                        } else {
                            this.actionState = this.isIndoors ? 'inside' : 'apprentice_training';
                        }
                        this.visualAction = (myShop?.type === 'smith' || task.type === 'smith') ? 'smith' : 'cook';
                        let workMsg = task.type === 'shop_work' ? "真剣に仕込み中..." : (task.type === 'smith' ? "カン！カン！（鍛冶中）" : "おいしくな～れ！");
                        if (this.message !== workMsg && !window.isCatchingUp) { this.message = workMsg; this.messageTimer = 120; }

                        if (task.type === 'cook' && !task.cookData) { if (typeof this.processCookingStart === 'function' && !this.processCookingStart(task)) { task.duration = 0; task.aborted = true; } }
                        if (task.type === 'smith' && !task.smithData) { if (typeof this.processSmithingStart === 'function' && !this.processSmithingStart(task)) { task.duration = 0; task.aborted = true; } }

                        if (task.duration <= 0 && !task.aborted) {
                            if (task.type === 'shop_work') {
                                if (!this.inventory) this.inventory = [];
                                this.inventory.push(task.targetRecipeId);
                                window.addShopLog?.(myShop.shopData, `「${typeof window.getDisplayShopItemName === 'function' ? window.getDisplayShopItemName(task.targetRecipeId) : task.targetRecipeId}」が完成！`);
                                if (typeof window.updateShopUIData === 'function' && !window.isCatchingUp) window.updateShopUIData(myShop);
                            } else if (task.type === 'cook') { 
                                if (typeof this.processCookingFinish === 'function') this.processCookingFinish(task); 
                            } else if (task.type === 'smith') {
                                if (typeof this.processSmithingFinish === 'function') this.processSmithingFinish(task);
                            }
                            if (!window.isCatchingUp) window.updateScheduleList?.();
                        }
                    }
                    else if (task.type === 'life_author' || task.type === 'writing') { this.visualAction = 'study'; this.actionState = 'studying'; }
                    else if (task.type === 'explore') {
                        if (this.actionState === 'inside' || this.isIndoors) { 
                            task.duration--; this.visualAction = 'move'; 
                            if (task.duration % 20 === 0) this.processExploration?.(); 
                        } else { this.actionState = 'inside'; this.isIndoors = true; }
                    }
                    else if (task.type === 'shop_research') {
                        this.visualAction = 'study';
                        if (task.duration <= 0 && !task.aborted) { window.addShopLog?.(myShop.shopData, "新しいレシピのヒントを得た！"); if(!window.isCatchingUp) window.updateScheduleList?.(); }
                    }
                    else if (task.type === 'build') {
                        if (task.duration <= 0 && !task.aborted && typeof this.processBuildingFinish === 'function') this.processBuildingFinish(task);
                    }
                    // ==========================================
                    // 📦 マイホームでの自動身支度・お片付け (完全自律型AI版・拡張ロジック補完)
                    // ==========================================
                    else if (task.type === '荷物整理') {
                        let myHut = assets[task.targetUid];
                        if (!myHut) { task.duration = 0; return; }

                        if (!this.isIndoors) {
                            if (this.actionState === 'idle') this.startBuildingInteraction(myHut);
                            return;
                        }

                        this.visualAction = 'study';

                        // --- 初回入室時のUIオープン＆初期化 ---
                        if (!task._uiOpened) {
                            task._uiOpened = true;
                            if (!myHut.storage) myHut.storage = { freezer: {level:1, capacity:10, items:[]}, warehouse: {level:1, capacity:10, items:[]}, safe: {level:1, capacity:50000, gold:0} };
                            if (typeof window.openHutStorageUI === 'function') window.openHutStorageUI(myHut);
                        }

                        let s = myHut.storage;
                        let prepMessages = [];
                        let fullReason = null;
                        let sortedCount = 0; // しまったアイテム・お金のカウント
                        
                        // 今回AIが「持っていく！」と決めたアイテムを入れる新しいカバン
                        let newInventory = [];

                        const getItemData = (itemObj) => { let id = typeof itemObj === 'string' ? itemObj : itemObj.id; return (typeof itemCatalog !== 'undefined') ? itemCatalog[id] : null; };

                        // --------------------------------------------------
                        // 1. 【最優先】特効薬の確保
                        // --------------------------------------------------
                        let mIdx = this.inventory.findIndex(i => getItemData(i)?.type === 'medicine');
                        if (mIdx !== -1) {
                            newInventory.push(this.inventory.splice(mIdx, 1)[0]);
                        } else {
                            let wIdx = s.warehouse.items.findIndex(i => getItemData(i)?.type === 'medicine');
                            if (wIdx !== -1) { newInventory.push(s.warehouse.items.splice(wIdx, 1)[0]); prepMessages.push("特効薬を準備"); }
                            else {
                                let fIdx = s.freezer.items.findIndex(i => getItemData(i)?.type === 'medicine');
                                if (fIdx !== -1) { newInventory.push(s.freezer.items.splice(fIdx, 1)[0]); prepMessages.push("特効薬を準備"); }
                            }
                        }

                        // --------------------------------------------------
                        // 2. 【生存優先】食事の確保 (満タンになるまで)
                        // --------------------------------------------------
                        let simE = this.energy || 0; let simH = this.hunger || 0;
                        if (simE < 100 || simH < 100) {
                            let foodCandidates = [];
                            // 手持ちから探す
                            for (let i = this.inventory.length - 1; i >= 0; i--) {
                                let item = this.inventory[i]; let d = getItemData(item);
                                if (d && ['food','ingredient','dish'].includes(d.type) && (!item.quality || item.quality !== 'bad')) {
                                    foodCandidates.push({ item: item, src: 'inv', idx: i, val: (d.stats?.energy||0)+(d.stats?.hunger||0) });
                                }
                            }
                            // 冷凍庫から探す
                            for (let i = s.freezer.items.length - 1; i >= 0; i--) {
                                let item = s.freezer.items[i]; let d = getItemData(item);
                                if (d && ['food','ingredient','dish'].includes(d.type) && (!item.quality || item.quality !== 'bad')) {
                                    foodCandidates.push({ item: item, src: 'freezer', idx: i, val: (d.stats?.energy||0)+(d.stats?.hunger||0) });
                                }
                            }
                            // 回復量の高い順にソート (popで大きいものから取るため昇順)
                            foodCandidates.sort((a,b) => a.val - b.val);
                            
                            let foodAdded = false;
                            while ((simE < 100 || simH < 100) && foodCandidates.length > 0) {
                                let best = foodCandidates.pop();
                                // 元の場所から抜き取る
                                if (best.src === 'inv') this.inventory.splice(this.inventory.indexOf(best.item), 1);
                                else s.freezer.items.splice(s.freezer.items.indexOf(best.item), 1);
                                
                                newInventory.push(best.item);
                                let d = getItemData(best.item);
                                simE += (d.stats?.energy || 0); simH += (d.stats?.hunger || 0);
                                if (best.src === 'freezer') foodAdded = true;
                            }
                            if (foodAdded) prepMessages.push("食料を確保");
                        }

                        // --------------------------------------------------
                        // 3. 【目標優先】建築・拡張素材の確保 (一括拡張対応版)
                        // --------------------------------------------------
                        let targetBuild = null;
                        let expandCountForTarget = 1; 
                        let bCat = typeof buildingCatalog !== 'undefined' ? buildingCatalog : {};
                        let avail = {}; // 手持ち・倉庫・冷凍庫の合算
                        [...this.inventory, ...s.warehouse.items, ...s.freezer.items].forEach(i => { let id = typeof i === 'string' ? i : i.id; avail[id] = (avail[id] || 0) + 1; });

                        const checkMats = (mats, mult = 1) => { for (let k in mats) { if ((avail[k]||0) < mats[k] * mult) return false; } return true; };

                        let hasCasino = Object.values(assets).some(a => a.type === 'casino');
                        let hasCastle = Object.values(assets).some(a => a.type === 'castle');

                        let intel = this.stats.intel || 10;
                        let power = this.stats.power || 10;
                        let upgradeTarget = null;
                        let upgradeCount = 0;

                        // [3-A] 一括拡張の計算 (漏れていたロジック)
                        if (intel >= 30) {
                            let maxByPower = Math.max(1, Math.floor(power / 30));
                            let foodCount = 0; let matCount = 0;
                            [...this.inventory, ...s.warehouse.items, ...s.freezer.items].forEach(i => {
                                let d = getItemData(i);
                                if (d && ['food', 'ingredient', 'dish'].includes(d.type)) foodCount++;
                                else matCount++;
                            });
                            
                            let extraBuffer = Math.floor(intel / 50) * 10;
                            let upgTypes = ['warehouse', 'freezer', 'safe'];
                            
                            for (let uType of upgTypes) {
                                if (!bCat[uType]) continue;
                                let reqCount = 0;
                                if (uType === 'freezer') {
                                    let overflow = foodCount - (s.freezer.capacity || 0);
                                    reqCount = Math.ceil((Math.max(0, overflow) + extraBuffer) / 10);
                                } else if (uType === 'warehouse') {
                                    let overflow = matCount - (s.warehouse.capacity || 0);
                                    reqCount = Math.ceil((Math.max(0, overflow) + extraBuffer) / 10);
                                } else if (uType === 'safe') {
                                    let overflow = this.gold - (s.safe.capacity || 0);
                                    if (overflow > 0) reqCount = Math.ceil(overflow / 50000);
                                }
                                
                                if (reqCount > 0) {
                                    let affordable = maxByPower;
                                    let mats = bCat[uType].materials;
                                    for (let mKey in mats) { affordable = Math.min(affordable, Math.floor((avail[mKey]||0) / mats[mKey])); }
                                    if (affordable > 0) {
                                        upgradeTarget = uType;
                                        upgradeCount = Math.min(reqCount, affordable);
                                        break; // 1回の整理でターゲットにする拡張は1種類まで
                                    }
                                }
                            }
                        }

                        // [3-B] ターゲットの決定
                        if (!hasCasino && bCat['casino'] && checkMats(bCat['casino'].materials)) { targetBuild = 'casino'; }
                        else if (!hasCastle && bCat['castle'] && checkMats(bCat['castle'].materials)) { targetBuild = 'castle'; }
                        else if (upgradeTarget) { targetBuild = upgradeTarget; expandCountForTarget = upgradeCount; }
                        else {
                            // まだ建っていない通常の施設（鍛冶屋など）を探す
                            let unbuilt = Object.keys(bCat).filter(k => !['casino','castle','hut','farm','warehouse','freezer','safe'].includes(k) && !Object.values(assets).some(a => a.type === k));
                            for (let k of unbuilt) { if (checkMats(bCat[k].materials)) { targetBuild = k; break; } }
                        }

                        // [3-C] 素材の引き出し処理
                        if (targetBuild) {
                            let reqMats = bCat[targetBuild].materials;
                            let matsAdded = false;
                            for (let mKey in reqMats) {
                                let needed = reqMats[mKey] * expandCountForTarget;
                                let found = 0;
                                // 手持ちから
                                for (let i = this.inventory.length - 1; i >= 0 && found < needed; i--) {
                                    let id = typeof this.inventory[i] === 'string' ? this.inventory[i] : this.inventory[i].id;
                                    if (id === mKey) { newInventory.push(this.inventory.splice(i, 1)[0]); found++; }
                                }
                                // 倉庫から
                                for (let i = s.warehouse.items.length - 1; i >= 0 && found < needed; i--) {
                                    let id = typeof s.warehouse.items[i] === 'string' ? s.warehouse.items[i] : s.warehouse.items[i].id;
                                    if (id === mKey) { newInventory.push(s.warehouse.items.splice(i, 1)[0]); found++; matsAdded = true; }
                                }
                                // 冷凍庫から（氷などの特殊な建築素材対策）
                                for (let i = s.freezer.items.length - 1; i >= 0 && found < needed; i--) {
                                    let id = typeof s.freezer.items[i] === 'string' ? s.freezer.items[i] : s.freezer.items[i].id;
                                    if (id === mKey) { newInventory.push(s.freezer.items.splice(i, 1)[0]); found++; matsAdded = true; }
                                }
                            }
                            if (matsAdded) prepMessages.push(`${bCat[targetBuild].name}${expandCountForTarget > 1 ? `(一括拡張)` : ''}の素材`);
                            else prepMessages.push(`${bCat[targetBuild].name}の素材ヨシ`); // 手持ちだけで足りた場合のフレーバー
                        }

                        // --------------------------------------------------
                        // 4. 【お片付け】不用品の収納
                        // --------------------------------------------------
                        while(this.inventory.length > 0) {
                            let item = this.inventory.pop(); // 元のカバンに残っているものはすべて不用品
                            let d = getItemData(item);
                            let isFood = d && ['food','ingredient','dish'].includes(d.type);
                            
                            if (isFood) {
                                if (s.freezer.level > 0 && s.freezer.items.length < s.freezer.capacity) { s.freezer.items.push(item); sortedCount++; }
                                else { newInventory.push(item); fullReason = "冷凍庫がいっぱい"; }
                            } else {
                                if (s.warehouse.level > 0 && s.warehouse.items.length < s.warehouse.capacity) { s.warehouse.items.push(item); sortedCount++; }
                                else { newInventory.push(item); fullReason = "倉庫がいっぱい"; }
                            }
                        }
                        
                        // 新しいカバン（予約済みアイテム＋あふれたアイテム）を装備
                        this.inventory = newInventory;

                        // --------------------------------------------------
                        // 5. お金の収納
                        // --------------------------------------------------
                        if (this.gold > 500 && s.safe.level > 0) {
                            let deposit = Math.min(this.gold - 500, s.safe.capacity - s.safe.gold);
                            if (deposit > 0) {
                                this.gold -= deposit;
                                s.safe.gold += deposit;
                                sortedCount++;
                            } else if (this.gold > 500) fullReason = "金庫がいっぱい";
                        }

                        // --------------------------------------------------
                        // 終了処理とメッセージ
                        // --------------------------------------------------
                        if (prepMessages.length > 0) this.message = "身支度完了！\n" + prepMessages.join(' / ');
                        else if (sortedCount > 0) this.message = "不要なものを片付けたよ！";
                        else if (fullReason) this.message = `${fullReason}みたい...\nそのまま持っておくね。`;
                        else this.message = "整理終わり！準備バッチリ！";

                        this.messageTimer = 180;
                        if (typeof window.openHutStorageUI === 'function') window.openHutStorageUI(myHut);
                        
                        // 待機して外へ
                        if (task._waitingFinish === undefined) task._waitingFinish = 3; 
                        task._waitingFinish--;
                        
                        if (task._waitingFinish <= 0) task.duration = 0; 
                        else task.duration = 2; 

                        if (task.duration <= 0) {
                            this.actionState = 'exiting'; 
                            this.isIndoors = false; 
                            this.indoorTarget = null;
                            let ui = document.getElementById('hut-storage-ui');
                            if (ui) ui.remove();
                            if (typeof updateStatUI === 'function') updateStatUI();
                        }
                    }
                    // ==========================================
                    // 🎒 マイホームでの作戦会議 (ダンジョンAIマインド)
                    // ==========================================
                    else if (task.type === '作戦会議') {
                        let myHut = assets[task.targetUid];
                        if (!myHut) { task.duration = 0; return; }

                        if (!this.isIndoors) {
                            if (this.actionState === 'idle') this.startBuildingInteraction(myHut);
                            return;
                        }

                        this.visualAction = 'study';

                        // 初回入室時に一度だけUIを開く
                        if (!task._uiOpened) {
                            task._uiOpened = true;
                            if (typeof window.openDungeonTacticEditor === 'function') window.openDungeonTacticEditor();
                        }
                        
                        this.message = "明日の探索の作戦を練るよ！";
                        this.messageTimer = 180;

                        // UI側から _waitingFinish が false にされるまで無限に待機する
                        if (task._waitingFinish === undefined) task._waitingFinish = true; 
                        
                        if (!task._waitingFinish) task.duration = 0; 
                        else task.duration = 2; // 常に残り時間を保ち、強制終了を防ぐ

                        if (task.duration <= 0) {
                            this.actionState = 'exiting';
                            this.isIndoors = false; 
                            this.indoorTarget = null;
                            let ui = document.getElementById('dungeon-tactic-editor-ui');
                            if (ui) ui.style.display = 'none';
                        }
                    }
                }
            }

            // =======================================
            // ★タスクの完了・破棄判定（ループ終了部分）
            // =======================================
            const isRecoveryTask = ['rest', 'sleep', 'eat'].includes(task.type);
            const isEnergyOut = !this.godMode && this.energy <= 0 && !isRecoveryTask;
            const isHungerOut = !this.godMode && this.hunger <= 0 && !isRecoveryTask;

            if (task.duration <= 0 || isEnergyOut || isHungerOut) {
                const isShopTask = (task.type === 'shop_work' || task.type === 'shop_research');
                
                // ★完全修正：タスクが完了し、かつ「中に入っている」場合は、次のタスクへ進む前に外へ出る（exiting）状態に移行させる
                // ※ただし探索など「引き続き中にとどまる」特殊タスクは除外
                const waitingExit = !isShopTask && task._started && task.type !== 'explore' && task.type !== 'apprentice_exam' && this.isIndoors;

                if (!waitingExit || this.actionState === 'exiting') {
                    if (task.duration <= 0 && !task.aborted) {
                        if (task.type === 'build' && typeof this.processBuildingFinish === 'function') this.processBuildingFinish(task);
                        if (task.type.startsWith('life_') && typeof this.processLifePathFinish === 'function') this.processLifePathFinish(task);

                        // 連続睡眠ボーナス
                        if (task.type === 'sleep' || task.type === 'rest') {
                            if (this.energy >= 60 && this.hunger >= 60) {
                                this.consecutiveSleepCount = (this.consecutiveSleepCount || 0) + 1;
                                if (this.consecutiveSleepCount >= 2) {
                                    this.stats.beauty += (this.consecutiveSleepCount * 2);
                                    if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 80, "💖 美容ボーナス!", "#FF4081");
                                }
                            }
                        } else {
                            this.consecutiveSleepCount = 0; 
                        }

                        // 闇落ちポイント加算
                        if (!['sleep', 'rest', 'eat'].includes(task.type)) {
                            if (this.age > (this.lifespan || 100) * 0.5 && this.stats.mood <= 30) {
                                this.darknessCounter = (this.darknessCounter || 0) + 1;
                                if (!window.isCatchingUp && typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 60, "👿 闇の蓄積...", "#9C27B0");
                            }
                        }

                        if (this.activeBooks && this.activeBooks.length > 0) {
                            let consumedIds = []; 
                            this.activeBooks.forEach(b => {
                                if (b.charges > 0) {
                                    b.charges--; this.stats[b.stat] += b.val;
                                    let statName = b.stat === 'power' ? '活力' : b.stat === 'intel' ? '賢さ' : b.stat === 'speed' ? '素早さ' : '美しさ';
                                    if (typeof addFloatingText === 'function' && !window.isCatchingUp) addFloatingText(this.x, this.y - 60, `📖秘伝書(${statName} +${b.val})`, "#2196F3");
                                    if (b.charges <= 0) {
                                        if(!window.isCatchingUp){ this.message = "秘伝書の内容を全て吸収した！"; this.messageTimer = 180; }
                                        consumedIds.push(b.id);
                                    }
                                }
                            });
                            this.activeBooks = this.activeBooks.filter(b => b.charges > 0);
                            
                            if (consumedIds.length > 0) {
                                let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
                                legacy.books = legacy.books.filter(b => !consumedIds.includes(b.id));
                                localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
                            }
                        }

                        const mType = task.masterType || this.apprentice?.currentMaster;
                        if (task.type === 'visit_master' || task.type === 'master_quest' || task.type === 'apprentice_exam') {
                            if (task.type === 'visit_master' && mType) window.checkMasterVisit?.(mType);
                            else if (task.type === 'master_quest') this.processApprenticeQuestFinish?.(task);
                            else if (task.type === 'apprentice_exam') this.processApprenticeExamFinish?.(task);
                        }
                        
                        if (task.isBaito && this.apprentice && this.apprentice.activeQuests) {
                            this.apprentice.activeQuests.forEach(q => {
                                if (q.isBaitoQuest && q.baitoWord === task.baitoWord) {
                                    q.qVal = (q.qVal || 0) + 1;
                                }
                                if (!q.isBaitoQuest && task.baitoWord === '書き写し') {
                                    if (q.desc.includes('製図') || q.desc.includes('書き写し') || q.name.includes('製図')) {
                                        q.qVal = (q.qVal || 0) + 1;
                                    }
                                }
                            });
                            this.message = "ふぅ、手伝い完了！";
                            this.messageTimer = 120;
                            if (!window.isCatchingUp) window.updateQuestHUD?.();
                        }

                        const taskToKeyword = { 'study':'勉強','train':'筋トレ','sleep':'睡眠','rest':'休息','eat':'食事','cook':'料理','smith':'鍛冶','build':'建築','fish':'釣り','explore':'探検' };
                        const keyword = taskToKeyword[task.type];
                        if (keyword && this.apprentice && this.apprentice.activeQuests) {
                            this.apprentice.activeQuests.forEach(q => {
                                if (q.desc.includes(keyword) && q.desc.includes('回行おう')) {
                                    q.qVal = (q.qVal || 0) + 1;
                                }
                            });
                            if(!window.isCatchingUp) window.updateQuestHUD?.();
                        }
                        if (typeof window.progressDailyQuest === 'function') window.progressDailyQuest(task.type);
                        
                        if (this.apprentice && this.apprentice.isExcommunicated) {
                            if (['study', 'train', 'run'].includes(task.type)) {
                                this.apprentice.exileTrainingCount = (this.apprentice.exileTrainingCount || 0) + 1;
                                if (this.apprentice.exileTrainingCount >= 10) {
                                    this.apprentice.isExcommunicated = false;
                                    this.apprentice.exileTrainingCount = 0;
                                    if (this.apprentice.excommunicatedFrom) {
                                        this.apprentice.attempts[this.apprentice.excommunicatedFrom] = 3; 
                                    }
                                    this.message = "心を入れ替えて頑張った！悪い噂も消えたかな...！";
                                    this.messageTimer = 180;
                                    if (typeof addFloatingText === 'function' && !window.isCatchingUp) {
                                        addFloatingText(this.x, this.y - 60, "✨ 破門状態 解除！ ✨", "#4CAF50");
                                    }
                                }
                            }
                        }
                    }
                    
                    // ここでタスクをスケジュールから削除
                    this.schedule.shift();
                    if (!window.isCatchingUp) window.updateScheduleList?.(); 
                    this.visualAction = null;
                    
                    if (isShopTask) { 
                        this.actionState = 'inside'; this.exploreTimer = 0; 
                    } 
                    else { 
                        this.indoorTarget = null; this.isIndoors = false; this.actionState = 'idle'; 
                    }
                } else if (this.isIndoors) { 
                    // ★タスクが終わったので、一旦外に出る（exiting状態へ）
                    this.actionState = 'exiting'; this.isIndoors = false; 
                }
            }

            if (currentMode === 'play' && !this.godMode && consumeRate > 0) {
                if (!['sleep', 'rest', 'eat', 'life_slowlife'].includes(task.type)) {
                    let drainMult = ['train', 'build', 'smith', 'run'].includes(task.type) ? 1.5 : 1.0;
                    this.energy -= 0.03 * consumeRate * drainMult;
                    this.hunger -= 0.03 * consumeRate * drainMult;
                    this.stats.mood -= 0.02 * consumeRate;
                } else if (['sleep', 'rest', 'life_slowlife'].includes(task.type)) {
                    this.stats.mood += 0.05 * consumeRate;
                }
            }
        } else {
            const activeStates = ['camping', 'studying', 'training', 'sleeping', 'eating', 'fishing', 'smithing', 'building', 'apprentice_training'];
            if (activeStates.includes(this.actionState)) { this.actionState = 'idle'; this.visualAction = null; }
            
            const tData = typeof this.getTraitData === 'function' ? this.getTraitData() : {};
            const idleConsumeRate = tData.consumption !== undefined ? tData.consumption : 1.0;
            if (currentMode === 'play' && !this.godMode && idleConsumeRate > 0) { 
                this.energy -= 0.02 * idleConsumeRate; 
                this.hunger -= 0.02 * idleConsumeRate; 
                this.stats.mood += 0.01 * idleConsumeRate;
            }
        }
    }
    
    this.energy = Math.max(0, Math.min(100, this.energy)); this.hunger = Math.max(0, Math.min(100, this.hunger));
    
    if (currentMode === 'play' && !this.godMode) {
        let isHealing = ['sleep', 'sleeping', 'rest', 'eat', 'eating', 'life_slowlife'].includes(this.actionState) || 
                        (this.currentTask && ['sleep', 'rest', 'eat', 'life_slowlife'].includes(this.currentTask.type));
                        
        if ((this.energy <= 20 || this.hunger <= 20) && !isHealing) {
            this.stats.mood -= 0.05;
        }
        this.stats.mood = Math.max(0, Math.min(100, this.stats.mood));
        
        if (this.isSick) {
            this.stats.mood -= 0.01; 
            this.lifespan -= 0.005;  
            if (!isHealing && Math.random() < 0.01 && !window.isCatchingUp && typeof addFloatingText === 'function') {
                addFloatingText(this.x, this.y - 40, "😷 苦しい...", "#8D6E63");
            }
        }
    }

    const isPassiveActing = ['studying', 'training', 'sleeping', 'eating', 'fishing', 'smithing', 'building', 'apprentice_training', 'camping'].includes(this.actionState);
    if (isPassiveActing && this.activeMonuments) { this.activeMonuments.forEach(m => { this.stats[m.stat] += 0.05; }); }
    if (this.actionState === 'sleeping' && this.activeMonuments && this.activeMonuments.some(m => m.stat === 'beauty')) { this.stats.beauty += 0.1; }

    if (!window.isCatchingUp) {
        if (Math.floor(this.stats.intel) > oldIntel) addFloatingText(this.x, this.y - 40, "賢さ UP!", "#4fc3f7");
        if (Math.floor(this.stats.power) > oldPower) addFloatingText(this.x, this.y - 40, "パワー UP!", "#ff5252");
        if (Math.floor(this.stats.beauty) > oldBeauty) addFloatingText(this.x, this.y - 40, "美しさ UP!", "#e040fb");
        if (Math.floor(this.stats.speed) > oldSpeed) addFloatingText(this.x, this.y - 40, "素早さ UP!", "#00e676"); 
    }

    if (currentMode === 'play' || currentMode === 'grazing') {
        this.checkEncounter?.();
        if (['idle', 'moving', 'moving_to_enter'].includes(this.actionState)) {
            if (this.actionState === 'idle' && this.schedule.length === 0) {
                this.idleTimer = (this.idleTimer || 0) + 1; if (this.idleTimer > 60 && Math.random() < 0.02) { this.performIdleAction(); this.idleTimer = 0; }
            } else if (this.pathQueue?.length > 0) {
                const targetPoint = this.pathQueue[0]; const dx = targetPoint.x - this.x; const dy = targetPoint.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy); 
                let speed = 3.5 + (Math.floor(this.stats.speed || 10) / 50); 
                
                if (dist > speed && dist > 5) { 
                    this.flip = (dx < 0); this.x += (dx / dist) * speed; this.y += (dy / dist) * speed; 
                } else { 
                    this.x = targetPoint.x; this.y = targetPoint.y; this.pathQueue.shift(); 
                    if (this.pathQueue.length === 0) { 
                        if (this.actionState === 'moving_to_enter') { 
                            if (this.schedule[0]?.type === 'explore') { 
                                this.actionState = 'inside'; this.isIndoors = true; this.indoorTarget = this.interactionTarget; this.exploreTimer = 0; 
                            } else if (this.schedule[0]?.type === 'fish') {
                                this.actionState = 'fishing'; this.visualAction = 'fish'; this.isIndoors = false;
                            } else { this.executeEnterAction(); } 
                        } else { this.actionState = 'idle'; } 
                    } 
                }
            } else if (this.actionState === 'moving_to_enter') { 
                if (this.schedule[0]?.type === 'explore') { 
                    if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
                        let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
                        this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
                        
                        if (!isMasterExplorer) {
                            this.message = "ここから先は危険だ...\n（免許皆伝が必要）"; this.messageTimer = 120;
                            this.schedule.shift();
                            if (typeof window.updateScheduleList === 'function' && !window.isCatchingUp) window.updateScheduleList();
                        } else {
                            this.schedule = []; 
                            if (typeof window.updateScheduleList === 'function' && !window.isCatchingUp) window.updateScheduleList();
                            if (typeof window.openDungeonUI === 'function' && !window.isCatchingUp) window.openDungeonUI(this.interactionTarget.type);
                        }
                    } else { this.actionState = 'inside'; this.isIndoors = true; this.indoorTarget = this.interactionTarget; this.exploreTimer = 0; }
                } else if (this.schedule[0]?.type === 'fish') {
                    this.actionState = 'fishing'; this.visualAction = 'fish'; this.isIndoors = false;
                } else { this.executeEnterAction(); } 
            }
        }
        else if (this.actionState === 'entering') {
            if (this.visualScale === undefined) this.visualScale = 1.0;
            this.visualScale -= 0.05; 
            if (this.interactionTarget) {
                const aScale = this.interactionTarget.scale || 0.5;
                const targetX = this.interactionTarget.dx + (this.interactionTarget.sw * aScale) / 2;
                const targetY = this.interactionTarget.dy + (this.interactionTarget.sh * aScale) / 2;
                this.x += (targetX - this.x) * 0.1; this.y += (targetY - this.y) * 0.1;
            }
            if (this.visualScale <= 0) {
                this.visualScale = 0; this.actionState = 'inside'; this.isIndoors = true; this.indoorTarget = this.interactionTarget; this.exploreTimer = 0;
            }
        }
        else if (this.actionState === 'inside') {
            this.exploreTimer++; let isShopUIOpen = document.getElementById('shop-management-ui')?.style.display !== 'none';
            if (this.interactionTarget && this.schedule[0]?.type === 'explore') { if (this.exploreTimer % 20 === 0) this.processExploration?.(); } 
            else if (this.schedule.length === 0 && this.exploreTimer > 60 && !isShopUIOpen) { this.actionState = 'exiting'; }
        }
        else if (this.actionState === 'exiting') {
            this.visualAction = null; this.isIndoors = false; this.visualScale = (this.visualScale || 1.0) + 0.05; 
            if (this.visualScale >= 1.0) { this.visualScale = 1.0; this.actionState = 'idle'; this.interactionTarget = null; this.indoorTarget = null; }
        }
    }

    if (this.schedule && this.schedule.length > 0 && this.schedule[0].type === 'life_mentor') {
        if (typeof this.updateDiscipleUI === 'function' && !window.isCatchingUp) this.updateDiscipleUI(this.schedule[0]);
    } else {
        let dEl = document.getElementById('disciple-vfx'); if (dEl) dEl.style.display = 'none';
    }

    let tickLimit = 8;
    if (this.visualAction === 'move' || this.actionState === 'moving' || this.actionState === 'moving_to_enter') {
        tickLimit = Math.max(3, 8 - Math.floor((this.stats.speed || 10) / 50));
    }
    if (this.schedule && this.schedule.length > 0 && this.schedule[0].type === 'run') tickLimit = 2;

    if (++this.tick > tickLimit) { this.frameStep = (this.frameStep + 1) % 4; this.frameIndex = [0, 1, 2, 1][this.frameStep]; this.tick = 0; }
    if (this.messageTimer > 0) this.messageTimer--;
    if (this.fishingPopupTimer > 0) this.fishingPopupTimer--; 
};

aiPet.executeEnterAction = function() {
    const currentTask = (this.schedule && this.schedule.length > 0) ? this.schedule[0] : null;

    if (currentTask && (currentTask.type === 'visit_master' || currentTask.type === 'apprentice_exam')) {
        this.actionState = 'inside'; this.indoorTarget = this.interactionTarget; this.isIndoors = true; this.exploreTimer = 0;
        this.message = "師匠のところに着いたよ！"; this.messageTimer = 120; 
        currentTask.duration = 0; 
        return; 
    }

    if (this.interactionTarget && this.interactionTarget.type === 'farm') {
        this.actionState = 'farming_work'; this.exploreTimer = 0;
        let farm = this.interactionTarget;
        
        let act = this.intendedAction;
        if (farm.pestState) act = 'pest_control';
        
        let seed = (!farm.plantedCrop || farm.isDead || farm.isEaten) ? this.intendedSeed : null;
        
        let farmAct = 'farm_water'; let msg = "水やり中...";
        
        if (act === 'pest_control') { farmAct = 'farm_pest'; msg = "害虫退治中..."; }
        else if (farm.isDead || farm.isEaten) { farmAct = 'farm_plow'; msg = "片付け中..."; }
        else if (farm.growth >= 100) { farmAct = 'farm_harvest'; msg = "収穫中..."; }
        else if (seed) { farmAct = 'farm_seed'; msg = "種まき中..."; }
        
        this.visualAction = farmAct; 
        this.message = msg;
        this.messageTimer = 120;

        setTimeout(() => {
            if (this.actionState !== 'farming_work') return; 
            
            if (act === 'pest_control') {
                farm.pestState = false; this.message = "害虫を退治した！";
            } 
            else if (farm.isDead || farm.isEaten) {
                farm.plantedCrop = null; farm.isDead = false; farm.isEaten = false;
                this.message = "枯れた作物を片付けた！";
            } 
            else if (farm.growth >= 100) {
                let cropBaseId = farm.plantedCrop.replace('seed_', '');
                if (cropBaseId === 'carrot_given') cropBaseId = 'carrot'; 
                
                let cropName = "野菜";
                if (cropBaseId === 'carrot') cropName = "ニンジン";
                else if (cropBaseId === 'tomato') cropName = "トマト";
                else if (cropBaseId === 'pepper') cropName = "ピーマン";

                let isRare = false;
                if ((this.stats.beauty || 0) >= 50 && (this.stats.intel || 0) >= 50) {
                    if (Math.random() < 0.3) isRare = true;
                }
                
                let finalCropId = cropBaseId;
                if (isRare) {
                    finalCropId = 'high_' + cropBaseId;
                    this.message = `すごいの獲れたよ！「質のいい${cropName}」を収穫した！`;
                } else {
                    this.message = `「普通の${cropName}」を収穫したよ。`;
                }
                
                this.inventory.push(finalCropId);
                farm.plantedCrop = null; 
                farm.growth = 0;
                this.messageTimer = 180; 
            } 
            else if (seed) {
                farm.plantedCrop = seed; farm.growth = 0; farm.waterLevel = 100;
                farm.isDead = false; farm.isEaten = false;
                this.message = "種まき完了！";
                if (seed !== 'seed_carrot_given') {
                    let idx = this.inventory.indexOf(seed);
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
            } 
            else {
                farm.waterLevel = 100; 
                farm.growth = Math.min(100, farm.growth + 20);
                this.message = "水やり完了！";
            }
            
            if (this.apprentice && this.apprentice.activeQuests) {
                this.apprentice.activeQuests.forEach(q => {
                    if (q.desc && q.desc.includes("農業")) { q.qVal = (q.qVal || 0) + 1; }
                });
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            }
            
            if (this.schedule && this.schedule.length > 0 && this.schedule[0].type === 'farm') {
                this.schedule[0].duration = 0;
            }
            
            this.actionState = 'idle';
            this.visualAction = null;
            this.messageTimer = 120;
            if (typeof saveGameData === 'function') saveGameData();
            
        }, 3000);
    }
    else if (this.interactionTarget && (this.interactionTarget.type === 'bridge' || this.interactionTarget.type === 'sea')) {
        this.actionState = 'fishing'; this.visualAction = 'fish'; this.fishingData = null; 
        this.message = "釣り開始！"; this.messageTimer = 60;
        if (this.schedule.length > 0 && this.schedule[0].type === 'fish') this.schedule[0]._started = true;
    } else if (this.interactionTarget && this.interactionTarget.type === 'building_site') {
        this.actionState = 'camping'; this.visualAction = 'smith'; this.message = "建築開始！"; this.messageTimer = 60;
        if (this.schedule.length > 0 && this.schedule[0].type === 'build') this.schedule[0]._started = true;
    }
    else if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
        this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
        this.schedule = []; 
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
        return;
    }
    else if (this.interactionTarget && (this.interactionTarget.type === 'restaurant' || this.interactionTarget.type === 'smith' || this.interactionTarget.type === 'shop')) {
        if (currentTask && currentTask.isTrial) {
            this.actionState = 'camping'; this.indoorTarget = null; this.isIndoors = false; 
            this.visualAction = 'cook'; this.message = "師匠の道具を借りて作業中...";
            this.messageTimer = 120; return; 
        }
        if (this.interactionTarget.type === 'shop') {
            this.actionState = 'inside'; this.isIndoors = true; this.message = "おつかいを始めるよ！";
            if (typeof window.openShopUI === 'function') window.openShopUI(this.interactionTarget);
            return;
        }
        
        // ★完全修正：師匠の店に入った時は、勝手に経営UIを開かずに「おじゃまします」とだけ言う
        if (this.interactionTarget.isMasterShop) {
            this.actionState = 'inside'; this.indoorTarget = this.interactionTarget; this.isIndoors = true; this.exploreTimer = 0;
            this.message = "おじゃまします！"; this.messageTimer = 120;
        } else {
            // 自分の店に入った時は経営開始
            this.actionState = 'inside'; this.indoorTarget = this.interactionTarget; this.isIndoors = true; this.exploreTimer = 0; this.message = "いらっしゃいませ！";
            if (typeof window.openShopManagementUI === 'function') {
                let targetId = Object.keys(assets).find(k => assets[k] === this.interactionTarget);
                if (targetId) { this.interactionTarget.id = targetId; window.openShopManagementUI(this.interactionTarget); }
            }
        }
    }
    else if (this.interactionTarget && ['house', 'hut', 'castle', 'school', 'library', 'gym'].includes(this.interactionTarget.type)) {
        this.actionState = 'inside'; 
        this.isIndoors = true; 
        this.indoorTarget = this.interactionTarget; 
        this.exploreTimer = 0;
        
        let msg = "中に入ったよ";
        if (this.interactionTarget.type === 'castle') msg = "城の中を探索中...";
        this.message = msg; this.messageTimer = 120;

        if (this.interactionTarget.type === 'hut' && typeof window.triggerTCGUnlock === 'function') {
            window.triggerTCGUnlock('visit_forest', this.generation);
        }
    }
    else { this.actionState = 'entering'; }
};

function processWeatherAndDisaster() {
    const disasterTypes = ["嵐", "地震", "火事"]; const type = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    let destroyed = false;
    if (typeof window.triggerDisasterVisual === 'function') window.triggerDisasterVisual(type);
    else {
        const overlay = document.getElementById('disasterOverlay');
        if(overlay) { 
            overlay.className = (type === '嵐') ? 'effect-storm' : 'effect-fire'; 
            overlay.style.display = 'block'; setTimeout(() => { overlay.style.display = 'none'; overlay.className = ''; }, 1500);
        }
    }
    for (let uid in assets) {
        const asset = assets[uid]; const bData = buildingCatalog[asset.type];
        if (bData && bData.breakChance) {
            if (Math.random() < bData.breakChance) { delete assets[uid]; aiPet.message = `大変！${type}で${asset.name}が壊れた！`; destroyed = true; break; }
        }
    }
    if (!destroyed) aiPet.message = `${type}が来たが、持ちこたえた！`;
    aiPet.messageTimer = 150;
}

// ==========================================
// ★大改修：転生時の「魂の引継ぎショップ」システム (余生システム対応版)
// ==========================================
// ★修正：map（マップ引継ぎ）を追加！
let inheritanceSelections = { stats: false, inventory: false, vocab: false, license: false, personality: false, map: false };
window.inheritanceStatsPercent = 10;

const BASE_INHERITANCE_COSTS = { stats: 500, inventory: 300, vocab: 400, license: 800, personality: 200, map: 300 };
let currentInheritanceCosts = { ...BASE_INHERITANCE_COSTS };

window.triggerReincarnation = function() {
    if (typeof window.generateCardFromAI === 'function') window.generateCardFromAI(window.aiPet);
    setTimeout(() => { window.openInheritanceShop(); }, 2500); 
};

window.openInheritanceShop = function() {
    window.isGamePaused = true;
    
    if (window.audioManager) {
        window.audioManager.stopBGM();
        window.audioManager.playBGM('inheritance');
    }
    
    // ★究極修正5：ゲーム画面を完全に非表示にして真っ黒にする
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) canvasWrapper.style.display = 'none';
    const uiControls = document.getElementById('gameControls');
    if (uiControls) uiControls.style.display = 'none';
    
    let shopUI = document.getElementById('inheritance-shop-ui');
    if (!shopUI) {
        shopUI = document.createElement('div');
        shopUI.id = 'inheritance-shop-ui';
        shopUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #050505; z-index: 30000; display: none; flex-direction: column; color: white; font-family: sans-serif;`;
        document.body.appendChild(shopUI);
    }
    
    inheritanceSelections = { stats: false, inventory: false, vocab: false, license: false, personality: false, map: false };
    currentInheritanceCosts = { ...BASE_INHERITANCE_COSTS };
    
    let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    
    // ★究極修正6：過去に発生した undefinedG のゴミデータをここで完全に浄化する！
    legacy.books = legacy.books.filter(b => b && b.val !== undefined && b.val !== null && !isNaN(b.val));
    legacy.monuments = legacy.monuments.filter(m => m && m.val !== undefined && m.val !== null && !isNaN(m.val));
    localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));

    if (legacy.disciple) {
        inheritanceSelections['disciple'] = false;
        currentInheritanceCosts['disciple'] = 1000;
    }
    legacy.monuments.forEach(m => { inheritanceSelections[m.id] = false; currentInheritanceCosts[m.id] = 500; });
    legacy.books.forEach(b => { inheritanceSelections[b.id] = false; currentInheritanceCosts[b.id] = 400; });

    window.inheritanceStatsPercent = 10; 
    window.renderInheritanceShop();
    shopUI.style.display = 'flex';
};

window.updateInheritanceStatsPercent = function(value) {
    window.inheritanceStatsPercent = parseInt(value, 10);
    window.renderInheritanceShop();
};

// ==========================================
// ★大改修：転生時の「魂の引継ぎショップ」システム (ロスト警告・倉庫救済版)
// ==========================================
window.renderInheritanceShop = function() {
    const shopUI = document.getElementById('inheritance-shop-ui');
    if (!shopUI) return;

    let totalCost = 0;
    for (let key in inheritanceSelections) {
        if (inheritanceSelections[key]) totalCost += currentInheritanceCosts[key];
    }
    
    // ★追加：金庫のゴールドを合算する
    let hut = null;
    let _assets = typeof assets !== 'undefined' ? assets : window.assets;
    for(let k in _assets) { if(_assets[k].storage) hut = _assets[k]; }
    let safeGold = hut && hut.storage.safe ? hut.storage.safe.gold : 0;
    let totalAvailGold = window.aiPet.gold + safeGold;
    
    const isAffordable = totalAvailGold >= totalCost;
    const goldColor = isAffordable ? '#4CAF50' : '#ff5252';

    let currentGen = window.aiPet.generation || 1;
    let maxPercent = Math.min(100, currentGen * 10);
    let percentOptions = '';
    for(let p = 10; p <= maxPercent; p+=10) {
        let selected = (p === window.inheritanceStatsPercent) ? 'selected' : '';
        percentOptions += `<option value="${p}" ${selected}>${p}%</option>`;
    }

    const renderOption = (key, title, desc, icon) => {
        const isSelected = inheritanceSelections[key];
        const cost = currentInheritanceCosts[key];
        let extraUI = '';
        let displayDesc = desc;
        if (key === 'stats') {
            displayDesc = `前世のステータス(賢さ・活力・美しさ)の指定した割合を初期値に加算します。`;
            extraUI = `<div style="margin-top:8px;">
                        <select onchange="window.updateInheritanceStatsPercent(this.value)" onclick="event.stopPropagation()" style="background:#222; color:#FFD700; border:1px solid #FFD700; padding:6px 12px; border-radius:4px; font-weight:bold; font-size:14px; cursor:pointer;">${percentOptions}</select>
                        <span style="font-size:11px; color:#aaa; margin-left:10px;">※世代が進むと上限が解放されます</span>
                    </div>`;
        }
        return `
            <div style="background: ${isSelected ? 'rgba(76, 175, 80, 0.3)' : '#333'}; border: 2px solid ${isSelected ? '#4CAF50' : '#555'}; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;"
                 onclick="window.toggleInheritance('${key}')" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                <div>
                    <div style="font-size: 18px; font-weight: bold; color: ${isSelected ? '#4CAF50' : '#fff'};">${icon} ${title}</div>
                    <div style="font-size: 12px; color: #aaa; margin-top: 4px;">${displayDesc}</div>
                    ${extraUI}
                </div>
                <div style="font-size: 20px; font-weight: bold; color: #FFD700;">${cost} G</div>
            </div>
        `;
    };

    let legacyHtml = "";
    let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    if (legacy.disciple) {
        let s = legacy.disciple.stats;
        legacyHtml += renderOption('disciple', '一番弟子の引継ぎ', `育てた弟子を次の主人公にします。(初期値 活力:${s.power} 賢さ:${s.intel} 美しさ:${s.beauty} 素早さ:${s.speed||10})`, '👶');
    }
    legacy.monuments.forEach(m => {
        let statName = m.stat === 'power' ? '活力' : m.stat === 'intel' ? '賢さ' : m.stat === 'speed' ? '素早さ' : '美しさ';
        legacyHtml += renderOption(m.id, `モニュメント (${statName})`, `マップに建築され、あらゆる行動に【${statName}ボーナス】を与えます。<br><span style="color:#ff5252">※選択しないとこのモニュメントは消滅します</span>`, '🗽');
    });
    legacy.books.forEach(b => {
        let statName = b.stat === 'power' ? '活力' : b.stat === 'intel' ? '賢さ' : b.stat === 'speed' ? '素早さ' : '美しさ';
        legacyHtml += renderOption(b.id, `秘伝書の伝授 (${statName})`, `次世代の最初の10アクション時に、毎回【${statName} +${b.val}】のボーナスを付与します。<br><span style="color:#ff5252">※選択しないとこの秘伝書は消滅します</span>`, '📖');
    });

    // ★修正：所持金表示を「手持ち＋金庫」にする
    shopUI.innerHTML = `
        <div style="background: #111; padding: 20px; border-bottom: 2px solid #FFD700; text-align: center;">
            <h2 style="margin: 0; color: #FFD700;">👼 魂の引継ぎ（強くてニューゲーム）</h2>
            <div style="color: #ccc; font-size: 14px; margin-top: 5px;">稼いだゴールドを使って、次の世代に記憶や能力を引き継がせることができます。</div>
        </div>
        <div style="flex: 1; padding: 20px; overflow-y: auto; background: #222;">
            ${renderOption('stats', '能力値の引継ぎ', '', '💪')}
            ${renderOption('inventory', '持ち物の引継ぎ', '前世で集めたインベントリのアイテムをそのまま持ち越します。', '🎒')}
            ${renderOption('vocab', '語彙・記憶領域の引継ぎ', '前世で教えた言葉と、拡張された記憶容量を最初から持った状態で始まります。', '🗣️')}
            ${renderOption('license', '職業ライセンスの引継ぎ', '師匠から受けたランクや皆伝の証をそのまま持ち越します。', '📜')}
            ${renderOption('personality', '姿と性格の引継ぎ (診断スキップ)', '性格診断をスキップし、前世と全く同じ姿と性格で生まれ変わります。', '🧬')}
            ${renderOption('map', 'マップの引継ぎ', '前世で開拓したフィールドや施設をそのまま引き継ぎます。<br><span style="color:#FF9800;">※選択しない場合、新しいマップが再生成されます</span>', '🗺️')}
            ${legacyHtml !== "" ? `<div style="margin: 20px 0 10px 0; font-size: 16px; font-weight: bold; color: #00BCD4; border-bottom: 1px solid #00BCD4; padding-bottom: 5px;">🏆 余生の遺産 (選択必須)</div>` + legacyHtml : ""}
        </div>
        <div style="background: #111; padding: 20px; border-top: 2px solid #555; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 22px; font-weight: bold;">
                所持金: <span style="color: #FFD700;">${window.aiPet.gold} G</span> <span style="font-size:14px; color:#aaa;">(+金庫: ${safeGold}G)</span><br>
                <span style="font-size: 16px; color: #aaa;">消費: <span style="color: ${goldColor};">-${totalCost} G</span></span>
            </div>
            <button onclick="window.executeReincarnation()" style="padding: 15px 40px; font-size: 20px; font-weight: bold; background: ${isAffordable ? '#FF9800' : '#666'}; color: white; border: none; border-radius: 8px; cursor: ${isAffordable ? 'pointer' : 'not-allowed'}; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">次の人生へ ➔</button>
        </div>
    `;
};

// ★追加：実行ボタンを押した際の「ロスト警告ポップアップ」処理
window.executeReincarnation = function() {
    const names = { stats: '能力値', inventory: '持ち物', vocab: '語彙・記憶領域', license: '職業ライセンス', personality: '姿と性格', map: 'マップ' };
    let lostList = [];
    for (let key in inheritanceSelections) {
        if (!inheritanceSelections[key] && names[key]) lostList.push(`・${names[key]}`);
    }
    
    let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    if (legacy.disciple && !inheritanceSelections['disciple']) lostList.push("・一番弟子 (消滅)");
    let lostMon = legacy.monuments.filter(m => !inheritanceSelections[m.id]).length;
    if (lostMon > 0) lostList.push(`・モニュメント x${lostMon} (消滅)`);
    let lostBooks = legacy.books.filter(b => !inheritanceSelections[b.id]).length;
    if (lostBooks > 0) lostList.push(`・秘伝書 x${lostBooks} (消滅)`);

    if (lostList.length > 0) {
        let warnUI = document.createElement('div');
        warnUI.id = 'reincarnation-warn-ui';
        warnUI.style.cssText = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:40000; display:flex; justify-content:center; align-items:center; flex-direction:column; color:#fff; font-family:sans-serif;`;
        warnUI.innerHTML = `
            <div style="background:#222; border:2px solid #ff5252; border-radius:12px; padding:30px; max-width:500px; text-align:center;">
                <h3 style="color:#ff5252; margin-top:0;">⚠️ 最終確認</h3>
                <p style="font-size:16px;">以下の要素は次の世代へ持ち込まれず、失われますがよろしいですか？</p>
                <div style="background:#111; padding:15px; border-radius:8px; text-align:left; color:#ccc; margin-bottom:20px; font-size:15px; line-height:1.6;">
                    ${lostList.join('<br>')}
                </div>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <button onclick="document.getElementById('reincarnation-warn-ui').remove()" style="padding:10px 20px; font-size:16px; font-weight:bold; background:#555; color:white; border:none; border-radius:6px; cursor:pointer;">もう一度考え直す</button>
                    <button onclick="document.getElementById('reincarnation-warn-ui').remove(); window.executeReincarnationFinal();" style="padding:10px 20px; font-size:16px; font-weight:bold; background:#FF9800; color:white; border:none; border-radius:6px; cursor:pointer;">そのまま進む ➔</button>
                </div>
            </div>
        `;
        document.body.appendChild(warnUI);
    } else {
        window.executeReincarnationFinal();
    }
};

// ★追加：実際の決済・救済・転生処理
window.executeReincarnationFinal = function() {
    let totalCost = 0;
    for (let key in inheritanceSelections) { if (inheritanceSelections[key]) totalCost += currentInheritanceCosts[key]; }
    
    let hut = null;
    let _assets = typeof assets !== 'undefined' ? assets : window.assets;
    for(let k in _assets) { if(_assets[k].storage) hut = _assets[k]; }
    let safeGold = hut && hut.storage.safe ? hut.storage.safe.gold : 0;
    
    if (window.aiPet.gold + safeGold < totalCost) { alert("ゴールドが足りません！"); return; }
    
    if (window.aiPet.gold >= totalCost) {
        window.aiPet.gold -= totalCost;
    } else {
        let rem = totalCost - window.aiPet.gold;
        window.aiPet.gold = 0;
        hut.storage.safe.gold -= rem;
    }

    const inheritedData = {};
    
    // ==========================================
    // ★大修正：音楽館の履歴と「図鑑（これまでの姿）」は絶対に次世代へ引き継ぐ！
    // ==========================================
    inheritedData.unlockedBGMs = window.aiPet.unlockedBGMs ? [...window.aiPet.unlockedBGMs] : [];
    inheritedData.discoveredMonsters = window.aiPet.discoveredMonsters ? [...window.aiPet.discoveredMonsters] : [];

    if (inheritanceSelections.stats) {
        let multiplier = window.inheritanceStatsPercent / 100;
        inheritedData.stats = {
            intel: Math.floor(window.aiPet.stats.intel * multiplier),
            power: Math.floor(window.aiPet.stats.power * multiplier),
            beauty: Math.floor(window.aiPet.stats.beauty * multiplier),
            speed: Math.floor((window.aiPet.stats.speed || 10) * multiplier)
        };
    }
    
    if (!inheritanceSelections.map) {
        inheritedData.resetMap = true;
    }
    
    if (inheritanceSelections.inventory && !inheritanceSelections.map && hut) {
        let rescuedItems = [...hut.storage.warehouse.items, ...hut.storage.freezer.items];
        window.aiPet.inventory = window.aiPet.inventory.concat(rescuedItems);
        window.aiPet.gold += hut.storage.safe.gold;
        console.log("📦 倉庫消失回避のため、倉庫・冷凍庫・金庫の中身をすべて手持ちに引き出しました！");
        inheritedData.inventory = [...window.aiPet.inventory];
    } else if (inheritanceSelections.inventory) {
        inheritedData.inventory = [...window.aiPet.inventory];
    }

    if (inheritanceSelections.vocab && window.aiPet.apprentice) {
        inheritedData.apprentice = { 
            learnedWords: [...window.aiPet.apprentice.learnedWords],
            baseVocab: typeof window.aiPet.getMaxVocabulary === 'function' ? window.aiPet.getMaxVocabulary() : 3
        };
    }
    if (inheritanceSelections.license && window.aiPet.apprentice) {
        if (!inheritedData.apprentice) inheritedData.apprentice = {};
        inheritedData.apprentice.rank = JSON.parse(JSON.stringify(window.aiPet.apprentice.rank || {}));
        inheritedData.apprentice.retired = JSON.parse(JSON.stringify(window.aiPet.apprentice.retired || {}));
        if (window.aiPet.apprentice.isGraduated && window.aiPet.apprentice.currentMaster) {
            inheritedData.apprentice.retired[window.aiPet.apprentice.currentMaster] = true;
        }
    }
    if (inheritanceSelections.personality) {
        inheritedData.skin = window.aiPet.currentSkin;
        inheritedData.baseType = window.aiPet.baseType;
    }

    let oldLegacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    let newLegacy = { monuments: [], books: [], disciple: null };
    
    if (inheritanceSelections['disciple'] && oldLegacy.disciple) {
        inheritedData.discipleSkin = oldLegacy.disciple.skin;
        inheritedData.discipleStats = oldLegacy.disciple.stats;
    }
    oldLegacy.monuments.forEach(m => { if (inheritanceSelections[m.id]) newLegacy.monuments.push(m); });
    oldLegacy.books.forEach(b => {
        if (inheritanceSelections[b.id]) { b.charges = 10; newLegacy.books.push(b); }
    });
    localStorage.setItem('ai_legacy_data', JSON.stringify(newLegacy));

    window.aiPet.generation++;
    document.getElementById('inheritance-shop-ui').style.display = 'none';
    window.pendingInheritanceData = inheritedData;
    if (typeof window.clearSchedule === 'function') window.clearSchedule();

    if (inheritanceSelections.personality || inheritanceSelections['disciple']) {
        window.applyInheritedPet(inheritedData.discipleSkin || inheritedData.skin || 'robot', inheritedData);
    } else {
        if (typeof startPersonalityTest === 'function') startPersonalityTest();
    }
};

window.toggleInheritance = function(key) {
    inheritanceSelections[key] = !inheritanceSelections[key];
    window.renderInheritanceShop();
};

window.executeReincarnation = function() {
    let totalCost = 0;
    for (let key in inheritanceSelections) {
        if (inheritanceSelections[key]) totalCost += currentInheritanceCosts[key];
    }
    if (window.aiPet.gold < totalCost) { alert("ゴールドが足りません！"); return; }
    window.aiPet.gold -= totalCost;

    const inheritedData = {};
    if (inheritanceSelections.stats) {
        let multiplier = window.inheritanceStatsPercent / 100;
        inheritedData.stats = {
            intel: Math.floor(window.aiPet.stats.intel * multiplier),
            power: Math.floor(window.aiPet.stats.power * multiplier),
            beauty: Math.floor(window.aiPet.stats.beauty * multiplier),
            speed: Math.floor((window.aiPet.stats.speed || 10) * multiplier) // ★追加
        };
    }
    if (inheritanceSelections.inventory) inheritedData.inventory = [...window.aiPet.inventory];
    if (inheritanceSelections.vocab && window.aiPet.apprentice) {
        inheritedData.apprentice = { 
            learnedWords: [...window.aiPet.apprentice.learnedWords],
            baseVocab: typeof window.aiPet.getMaxVocabulary === 'function' ? window.aiPet.getMaxVocabulary() : 3
        };
    }
    if (inheritanceSelections.license && window.aiPet.apprentice) {
        if (!inheritedData.apprentice) inheritedData.apprentice = {};
        inheritedData.apprentice.rank = JSON.parse(JSON.stringify(window.aiPet.apprentice.rank || {}));
        inheritedData.apprentice.retired = JSON.parse(JSON.stringify(window.aiPet.apprentice.retired || {}));
        if (window.aiPet.apprentice.isGraduated && window.aiPet.apprentice.currentMaster) {
            inheritedData.apprentice.retired[window.aiPet.apprentice.currentMaster] = true;
        }
    }
    if (inheritanceSelections.personality) {
        inheritedData.skin = window.aiPet.currentSkin;
        inheritedData.baseType = window.aiPet.baseType;
    }

    // ★追加：マップ引継ぎが選ばれていない場合、リセットフラグを立てる！
    if (!inheritanceSelections.map) {
        inheritedData.resetMap = true;
    }

    // ★追加：レガシーの精算（選ばれなかったものは消滅）
    let oldLegacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    let newLegacy = { monuments: [], books: [], disciple: null };
    
    if (inheritanceSelections['disciple'] && oldLegacy.disciple) {
        inheritedData.discipleSkin = oldLegacy.disciple.skin;
        inheritedData.discipleStats = oldLegacy.disciple.stats;
    }
    oldLegacy.monuments.forEach(m => { if (inheritanceSelections[m.id]) newLegacy.monuments.push(m); });
    oldLegacy.books.forEach(b => {
        if (inheritanceSelections[b.id]) { b.charges = 10; newLegacy.books.push(b); } // 10回チャージ付与
    });
    localStorage.setItem('ai_legacy_data', JSON.stringify(newLegacy));

    window.aiPet.generation++;
    document.getElementById('inheritance-shop-ui').style.display = 'none';
    window.pendingInheritanceData = inheritedData;
    if (typeof window.clearSchedule === 'function') window.clearSchedule();

    if (inheritanceSelections.personality || inheritanceSelections['disciple']) {
        window.applyInheritedPet(inheritedData.discipleSkin || inheritedData.skin || 'robot', inheritedData);
    } else {
        if (typeof startPersonalityTest === 'function') startPersonalityTest();
    }
};

window.applyInheritedPet = function(skinKey, data) {
    window.applyInitialPet(skinKey); 
    
    // ★究極修正7：引継ぎBGMを止めて、新しい種族のBGMを鳴らす！
    if (window.audioManager && window.audioManager.restoreMainBGM) {
        window.audioManager.restoreMainBGM();
    }

    // ★究極修正8：隠していたゲーム画面を復元する
    const canvasWrapper = document.getElementById('canvas-wrapper');
    if (canvasWrapper) canvasWrapper.style.display = '';
    const uiControls = document.getElementById('gameControls');
    if (uiControls) uiControls.style.display = '';
    
    window.isGamePaused = false; 
    if(typeof updateStatUI === 'function') updateStatUI();
    if(typeof updateCommandHUD === 'function') updateCommandHUD();
    window.aiPet.message = "前世の記憶と共に目覚めた...！";
    window.aiPet.messageTimer = 180;
};

// 既存のユーザーラッパー関数を上書き
const _legacy_originalApplyInitialPet = typeof originalApplyInitialPet !== 'undefined' ? originalApplyInitialPet : window.applyInitialPet;
window.applyInitialPet = function(skinKey) {
    _legacy_originalApplyInitialPet(skinKey);
    
    if (window.aiPet && window.aiPet.stats) {
        if (window.aiPet.stats.beauty === undefined || isNaN(window.aiPet.stats.beauty) || window.aiPet.stats.beauty === 0) window.aiPet.stats.beauty = 10;
        if (window.aiPet.stats.speed === undefined || isNaN(window.aiPet.stats.speed) || window.aiPet.stats.speed === 0) window.aiPet.stats.speed = 10;
    }

    if (window.pendingInheritanceData && window.pendingInheritanceData.resetMap) {
        localStorage.removeItem('map_data_v6');
        if (typeof assets !== 'undefined' && typeof generateNatureMap === 'function') {
            for (let key in assets) { delete assets[key]; }
            let newMap = generateNatureMap();
            for (let key in newMap) { assets[key] = newMap[key]; }
        }
    }

    window.aiPet.legacyProgress = {}; 
    window.aiPet.lifePath = null; 
    window.aiPet.originalLifespan = null; 
    window.aiPet.isReincarnating = false;
    
    let activeLegacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[]}');
    window.aiPet.activeMonuments = activeLegacy.monuments;
    window.aiPet.activeBooks = activeLegacy.books;
    
    activeLegacy.monuments.forEach(m => {
        if (typeof assets !== 'undefined') {
            assets[m.id] = { type: 'stone', name: '英雄のモニュメント', dx: m.x, dy: m.y, sw: 100, sh: 100, scale: 0.6 };
        }
    });
    
    if (window.pendingInheritanceData) {
        const data = window.pendingInheritanceData;
        
        // ==========================================
        // ★究極修正9：初期化関数の中で、保護した図鑑と音楽を確実に上書き(統合)する！
        // ==========================================
        if (data.unlockedBGMs) window.aiPet.unlockedBGMs = data.unlockedBGMs;
        if (data.discoveredMonsters) {
            let currentList = window.aiPet.discoveredMonsters || [];
            window.aiPet.discoveredMonsters = [...new Set([...data.discoveredMonsters, ...currentList])];
        }

        if (data.discipleStats) {
            window.aiPet.stats.intel = data.discipleStats.intel;
            window.aiPet.stats.power = data.discipleStats.power;
            window.aiPet.stats.beauty = data.discipleStats.beauty;
            if (data.discipleStats.speed) window.aiPet.stats.speed = data.discipleStats.speed;
        } else if (data.stats) {
            window.aiPet.stats.intel += data.stats.intel;
            window.aiPet.stats.power += data.stats.power;
            window.aiPet.stats.beauty += data.stats.beauty;
            if (data.stats.speed) window.aiPet.stats.speed += data.stats.speed;
        }
        
        if (data.inventory) window.aiPet.inventory = data.inventory;
        if (data.apprentice) {
            if (data.apprentice.learnedWords) window.aiPet.apprentice.learnedWords = data.apprentice.learnedWords;
            if (data.apprentice.baseVocab) window.aiPet.apprentice.baseVocab = data.apprentice.baseVocab; 
            if (data.apprentice.rank) window.aiPet.apprentice.rank = data.apprentice.rank;
            if (data.apprentice.retired) window.aiPet.apprentice.retired = data.apprentice.retired;
        }
        window.pendingInheritanceData = null;
    }
    
    saveGameData();
    if(typeof updateStatUI === 'function') updateStatUI();
    if(typeof updateCommandHUD === 'function') updateCommandHUD();
};

// ==========================================
// ★ 余生システムの補助関数群
// ==========================================
aiPet.processLifePathStart = function(task) {
    // ★追加：スローライフ以外で、体力や満腹度が少ない時はタスクを諦めて寿命を温存する！
    if (task.type !== 'life_slowlife' && !this.godMode && (this.energy < 20 || this.hunger < 20)) {
        this.message = "今は疲れていて、大事業に集中できない...";
        this.messageTimer = 120;
        task.aborted = true;
        task.duration = 0;
        return; // 年齢（寿命）を消費する前に即座にタスクをキャンセル！
    }
    
    if (task.type === 'life_mentor') { this.visualAction = 'train'; this.actionState = 'training'; }
    else if (task.type === 'life_monument') { this.visualAction = 'smith'; this.actionState = 'smithing'; }
    else if (task.type === 'life_seeker') {
        let acts = ['train', 'study', 'walk'];
        this.visualAction = acts[Math.floor(Math.random()*acts.length)];
        this.actionState = this.visualAction === 'train' ? 'training' : (this.visualAction === 'study' ? 'studying' : 'moving');
    }
    else if (task.type === 'life_guardian') { this.actionState = 'building'; this.visualAction = 'cook'; }
    else if (task.type === 'life_author') { this.visualAction = 'study'; this.actionState = 'studying'; }
    else if (task.type === 'life_slowlife') { this.visualAction = 'sleep'; this.actionState = 'sleeping'; }
};

aiPet.processLifePathFinish = function(task) {
    const ls = this.lifespan || 100;
    let ageRate = 0.1; 
    if (task.type === 'life_monument' || task.type === 'life_author') ageRate = 0.25;
    else if (task.type === 'life_guardian' || task.type === 'life_slowlife') ageRate = 0.05;
    
    this.age += ls * ageRate; 
    if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y-80, `年齢 +${Math.floor(ls*ageRate)}歳`, "#aaa");

    let maxStat = 'power'; let maxVal = this.stats.power;
    if (this.stats.intel > maxVal) { maxStat = 'intel'; maxVal = this.stats.intel; }
    if (this.stats.beauty > maxVal) { maxStat = 'beauty'; maxVal = this.stats.beauty; }
    if (this.stats.speed > maxVal) { maxStat = 'speed'; maxVal = this.stats.speed; }

    if (task.type === 'life_mentor') {
        this.message = "弟子が育ってきたぞ！"; this.messageTimer = 120;
        let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
        let intelFactor = (this.stats.intel || 10) / 100;
        legacy.disciple = {
            skin: this.currentSkin,
            stats: {
                intel: Math.floor(this.stats.intel * intelFactor),
                power: Math.floor(this.stats.power * intelFactor),
                beauty: Math.floor(this.stats.beauty * intelFactor),
                speed: Math.floor((this.stats.speed || 10) * intelFactor)
            }
        };
        localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
    }
    else if (task.type === 'life_monument') {
        this.legacyProgress = this.legacyProgress || {};
        this.legacyProgress['monument'] = (this.legacyProgress['monument'] || 0) + 25;
        
        if (this.legacyProgress['monument'] >= 100) {
            // ★究極修正10：1度完成したらフラグを立てて、それ以上増殖させない！
            if (!this.legacyProgress['monument_done']) {
                this.message = "モニュメント完成！"; this.messageTimer = 120;
                let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
                legacy.monuments.push({ id: 'mon_'+Date.now(), stat: maxStat, val: maxVal, x: this.x, y: this.y });
                localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
                this.legacyProgress['monument_done'] = true;
            } else {
                this.message = "モニュメントは既に完成しているよ！"; this.messageTimer = 120;
            }
            this.legacyProgress['monument'] = 100; // 100でストップ
        } else {
            this.message = `モニュメント建造中... (${this.legacyProgress['monument']}%)`; this.messageTimer = 120;
        }
    }
    else if (task.type === 'life_seeker') {
        let mult = 10 + ((this.generation || 1) * 10);
        if (this.visualAction === 'train') this.stats.power += 10 * mult;
        else if (this.visualAction === 'study') this.stats.intel += 10 * mult;
        else if (this.visualAction === 'move') this.stats.speed += 10 * mult;
        else this.stats.power += 5 * mult; 
        this.message = `限界突破！(効果 ${mult}倍)`; this.messageTimer = 120;
    }
    else if (task.type === 'life_guardian') {
        for(let k in assets) {
            if (assets[k].type === 'farm') assets[k].growth = 100;
            if (assets[k].durability !== undefined) assets[k].durability = 100;
        }
        this.message = "村の平和を守った！"; this.messageTimer = 120;
    }
    else if (task.type === 'life_author') {
        this.legacyProgress = this.legacyProgress || {};
        this.legacyProgress['author'] = (this.legacyProgress['author'] || 0) + 25;
        
        if (this.legacyProgress['author'] >= 100) {
            // ★究極修正11：1度完成したらフラグを立てて、それ以上増殖させない！
            if (!this.legacyProgress['author_done']) {
                this.message = "秘伝書完成！"; this.messageTimer = 120;
                let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
                legacy.books.push({ id: 'book_'+Date.now(), stat: maxStat, val: Math.floor(maxVal) });
                localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
                this.legacyProgress['author_done'] = true;
            } else {
                this.message = "完成した秘伝書を読み返している..."; this.messageTimer = 120;
            }
            this.legacyProgress['author'] = 100; // 100でストップ
        } else {
            this.message = `執筆中... (${this.legacyProgress['author']}%)`; this.messageTimer = 120;
        }
    }
    else if (task.type === 'life_slowlife') {
        this.energy = 100; this.hunger = 100;
        this.message = "のんびり最高〜"; this.messageTimer = 120;
    }
};

aiPet.updateDiscipleUI = function(task) {
    let dEl = document.getElementById('disciple-vfx');
    if (!dEl) {
        dEl = document.createElement('div');
        dEl.id = 'disciple-vfx';
        dEl.style.cssText = `position:absolute; pointer-events:none; z-index:90; display:flex; justify-content:center; align-items:center;`;
        let wrapper = document.getElementById('canvas-wrapper') || document.body;
        wrapper.appendChild(dEl);
    }
    dEl.style.display = 'flex';

    if (!task._discipleAct || Math.random() < 0.05) {
        task._discipleAct = ['study', 'train', 'walk'][Math.floor(Math.random()*3)];
    }

    let skin = this.currentSkin || 'robot';
    let imgUrl = typeof dynamicImageCatalog !== 'undefined' && dynamicImageCatalog[skin] ? dynamicImageCatalog[skin] : 'characters.png';
    let conf = typeof aiConfigs !== 'undefined' ? aiConfigs[skin] : null;

    if (conf) {
        let frame = (conf.actions[task._discipleAct] && conf.actions[task._discipleAct][0]) ? conf.actions[task._discipleAct][0] : {sx:0, sy:0, sw:300, sh:300};
        let scale = (conf.scale || 0.25) * 0.5; 

        dEl.style.left = `${this.x + 80}px`;
        dEl.style.top = `${this.y + (frame.sh * scale)}px`;
        dEl.innerHTML = `<div style="width:${frame.sw}px; height:${frame.sh}px; background:url('${imgUrl}') -${frame.sx}px -${frame.sy}px; transform:scaleX(-1) scale(${scale}); transform-origin:center bottom; animation: bounce 0.5s infinite alternate;"></div>`;
    }
};

// ★究極改修: 多段階・クロス進化・分岐進化に完全対応した進化判定
aiPet.getAvailableEvolutions = function() {
    // 現在の姿（Skin）を基準にする。初期状態なら baseType を参照。
    let current = this.currentSkin || this.baseType || 'robot';

    // data.js で定義した「現在の姿から進化できる先のリスト」を取得
    const list = window.evolutionRequirements[current]; 
    
    // リストが存在しない（＝これ以上進化できない最終形態）場合は空配列を返す
    if (!list || list.length === 0) return [];
    
    if (typeof this.stats.beauty === 'undefined') this.stats.beauty = 10;
    if (typeof this.darknessCounter === 'undefined') this.darknessCounter = 0;

    // 条件を満たしている進化先だけをフィルタリングして返す
    return list.filter(evo => {
        if (evo.req.power && this.stats.power < evo.req.power) return false;
        if (evo.req.intel && this.stats.intel < evo.req.intel) return false;
        if (evo.req.beauty && this.stats.beauty < evo.req.beauty) return false;
        if (evo.req.old && this.age < (this.lifespan || 100) * 0.8) return false; 
        
        // 闇落ちの要求値がブール値(true)か数値かで柔軟に対応
        let darkReq = typeof evo.req.dark === 'number' ? evo.req.dark : 20;
        if (evo.req.dark && this.darknessCounter < darkReq) return false; 
        
        return true; // 全ての条件をクリアしていれば候補に入る
    });
};

aiPet.startBuildingInteraction = function(targetAsset) {
    this.interactionTarget = targetAsset;
    const aScale = targetAsset.scale !== undefined ? targetAsset.scale : 0.5;
    let tx = targetAsset.dx + (targetAsset.sw * aScale)/2;
    let ty = targetAsset.dy + (targetAsset.sh * aScale) - 10; 
    
    // ★修正: 城など巨大な建物の場合は、中心座標ではなく少し手前を目的地にする！
    if (targetAsset.type === 'castle') {
        ty += 50;
    }
    
    if (targetAsset.type === 'water' || targetAsset.type === 'sea') {
        let found = false;
        for(let r=20; r<=150; r+=20) {
            for(let angle=0; angle<Math.PI*2; angle+=Math.PI/4) {
                let nx = tx + Math.cos(angle)*r;
                let ny = ty + Math.sin(angle)*r;
                if (!this.isPointOnWater(nx, ny)) {
                    tx = nx; ty = ny; found = true; break;
                }
            }
            if(found) break;
        }
    }
    
    let keyPrefix = ""; 
    for(let k in assets) { if(assets[k] === targetAsset) { keyPrefix = k.split('_')[0]; break; } }
    const fData = (typeof facilityData !== 'undefined' && facilityData[keyPrefix]) ? facilityData[keyPrefix] : { maxDepth: 5, name: targetAsset.name };
    this.exploreState = { depth: 0, maxDepth: fData.maxDepth || 5, currentFacility: keyPrefix, name: fData.name || targetAsset.name };
    
    // ★修正: 城の場合は、水判定のせいで近づけないバグを防ぐため、ignoreWater = true を渡して強引に向かわせる
    let ignoreWater = targetAsset.type === 'castle';
    if (this.setDestination(tx, ty, false, ignoreWater)) {
        this.actionState = 'moving_to_enter'; 
        this.message = "移動中..."; 
        this.messageTimer = 60;
    } else {
        if (this.schedule && this.schedule.length > 0) {
            this.schedule[0].duration = 0;
            this.schedule[0].aborted = true;
        }
        this.interactionTarget = null;
        this.exploreState = null;
    }
};

aiPet.processExploration = function() {
    const state = this.exploreState; 
    if (!state) return;

    // ★完全修正：未皆伝時のタスク全消去バグを防止！
    if (state.currentFacility === 'skull' || state.currentFacility === 'crystal') {
        let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
        
        this.actionState = 'idle'; 
        this.isIndoors = false;
        this.indoorTarget = null;

        if (isMasterExplorer) {
            // 皆伝済み：予定を全消去してダンジョンに突入！
            this.schedule = [];
            if (typeof window.triggerTCGUnlock === 'function') {
                if (this.interactionTarget && this.interactionTarget.type === 'skull') window.triggerTCGUnlock('visit_cave', this.generation);
                if (this.interactionTarget && this.interactionTarget.type === 'crystal') window.triggerTCGUnlock('visit_mine', this.generation);
            }
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            if (typeof window.openDungeonUI === 'function') window.openDungeonUI(state.currentFacility);
        } else {
            // 未皆伝：タスクの全消去を防ぎ、追い返す！
            this.message = "ここから先は危険だ...\n（免許皆伝が必要）";
            this.messageTimer = 120;
            // 積み上がったタスクはそのままに、現在の「探検タスク」だけを消して次へ進む
            if (this.schedule.length > 0 && this.schedule[0].type === 'explore') {
                this.schedule.shift();
            }
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        }
        return;
    }

    const fData = facilityData[state.currentFacility] || facilityData['default'];
    const consumeRate = this.getTraitData().consumption || 1.0;
    // ★修正：アクションカード「未知の洞窟探検」を取得
    if (typeof window.triggerTCGUnlock === 'function') window.triggerTCGUnlock('action_cave', this.generation);
    
    if (!this.godMode) { this.energy -= 2 * consumeRate; this.hunger -= 2 * consumeRate; }
    if (!this.godMode && (this.energy <= 5 || this.hunger <= 5)) { 
        this.message = "疲れたから帰る..."; this.finishExploration(); return; 
    }
    if (state.depth >= state.maxDepth) { this.message = "最深部に到達！"; this.stats.mood += 20; this.finishExploration(); return; }
    
    let difficulty = (state.depth + 1) * (fData.difficulty || 1); 
    const myStat = this.stats[fData.stat] || 0; 
    let statBonus = Math.max(0, myStat - difficulty);
    
    // ==========================================
    // ★大改修：ステータスによるスピードランを廃止し、地道な探索に変更！
    // ==========================================
    let depthAdvance = 1; // どんなにステータスが高くても、確実に1階層ずつ進む
    
    // 保険：深層（8階以上）でしっかり素材集めができるよう、最深部を最低でも15階に拡張する
    if (state.maxDepth < 15) state.maxDepth = 15;
    
    state.depth += depthAdvance;
    if (state.depth > state.maxDepth) state.depth = state.maxDepth;
    // ==========================================
    
    // ▼▼▼ ステータスの壁（階層制限） ▼▼▼
    if (state.depth >= 8) { // 8〜15階（深層）
        if ((this.stats.power || 0) < 80 || (this.stats.speed || 0) < 60 || (this.stats.intel || 0) < 50) {
            this.message = "深層の過酷さに耐えきれず怪我をした！";
            if (!this.godMode) { this.energy -= 40; this.stats.mood -= 40; }
            this.finishExploration();
            return; // 強制帰還
        }
    } else if (state.depth >= 4) { // 4〜7階（中層）
        if ((this.stats.power || 0) < 50 || (this.stats.speed || 0) < 30) {
            this.message = "中層の険しさに足を滑らせ怪我をした！";
            if (!this.godMode) { this.energy -= 20; this.stats.mood -= 20; }
            this.finishExploration();
            return; // 強制帰還
        }
    }
    
    let successRate = (myStat / (difficulty + 1)); 
    if (myStat < difficulty * 0.5) successRate = 0.1; 
    successRate = Math.min(1.0, Math.max(0.1, successRate));
    
    if (Math.random() < successRate) {
        let dropChance = 0.3 + (statBonus * 0.005); 
        if (state.currentFacility === 'palms' || state.currentFacility === 'mountain') dropChance += 0.2; 
        dropChance = Math.min(0.8, dropChance); 

        let itemsTable = [];
        if (fData.items) {
            if (Array.isArray(fData.items)) {
                itemsTable = fData.items;
            } else {
                let season = this.season || 'spring';
                itemsTable = (fData.items[season] || []).concat(fData.items.default || []);
            }
        }

        if (Math.random() < dropChance && itemsTable.length > 0) {
            let itemKey = itemsTable[Math.floor(Math.random() * itemsTable.length)]; 

            // ▼▼▼ レアアイテムは「深層（8階以上）」限定のドロップ ▼▼▼
            if (itemKey === 'wood' || itemKey === 'stone') {
                let isRare = false;
                
                // ★修正：安易な救済を消し、元の「8階以上なら50%の確率」というストイックな仕様に戻す
                if (state.depth >= 8 && Math.random() < 0.5) {
                    isRare = true; 
                }

                if (isRare) {
                    itemKey = itemKey === 'wood' ? 'high_wood' : 'high_stone';
                }
            }
            // ▲▲▲ 新規追加ここまで ▲▲▲

            // カタログに未登録の場合の簡易フォールバック
            const item = itemCatalog[itemKey] || { name: itemKey === 'high_wood' ? '良質な木材' : (itemKey === 'high_stone' ? '硬い石' : itemKey) }; 
            
            if (item) { 
                this.inventory.push(itemKey);
                this.message = `${item.name}を見つけた！`; 
                if (typeof this.checkItemCardUnlock === 'function') this.checkItemCardUnlock(itemKey);
                const bMood = (this.getTraitData().statBonus && this.getTraitData().statBonus.mood) ? this.getTraitData().statBonus.mood : 1.0;
                this.stats.mood += 1 * bMood; 
                if (typeof openInventoryPanel === 'function') {
                    const invPanel = document.getElementById('panel-inventory');
                    if (invPanel && invPanel.classList.contains('active')) { openInventoryPanel(); }
                }
            }
        } else { 
            if (depthAdvance > 1) { this.message = `順調！地下${state.depth}階へ！`; } else { this.message = `地下${state.depth}階を探索中...`; }
            if (fData.stat) {
                const bStat = (this.getTraitData().statBonus && this.getTraitData().statBonus[fData.stat]) ? this.getTraitData().statBonus[fData.stat] : 1.0;
                this.stats[fData.stat] += 1 * bStat; 
            }
            // ★追加：探検を続けると少しずつ機嫌が下がる（過酷さの表現）
            if (!this.godMode) this.stats.mood = Math.max(0, this.stats.mood - (0.5 * consumeRate));
        }
    } else { 
        this.message = "敵に遭遇！逃げた！"; 
        if (!this.godMode) { this.energy -= 5 * consumeRate; this.stats.mood -= 5; } // ★修正：逃走時のストレス増加
    }

    const targetAsset = this.interactionTarget;
    if (targetAsset && typeof targetAsset.durability === 'number') {
        targetAsset.durability--;
        if (targetAsset.durability <= 0) {
            if (fData.depletedType && catalog[fData.depletedType]) {
                const dep = catalog[fData.depletedType];
                targetAsset.img = dep.img; targetAsset.sx = dep.sx; targetAsset.sy = dep.sy;
                targetAsset.type = dep.type; targetAsset.name = "跡地"; delete targetAsset.durability;
                this.message = "ここはもう何もない..."; this.finishExploration();
            } else {
                let uid = null;
                for(let k in assets) { if(assets[k] === targetAsset) { uid = k; break; } }
                if (uid) delete assets[uid]; 
                this.finishExploration();
            }
        }
    }
    this.messageTimer = 60; saveGameData();
};

aiPet.finishExploration = function() { 
    this.actionState = 'exiting'; 
    this.interactionTimer = 0; 
    this.messageTimer = 100; 
    this.isIndoors = false; 
    this.visualAction = null; 

    // ★復活：探検完了時のカウント
    if (this.apprentice && this.apprentice.activeQuest && this.apprentice.activeQuest.desc.includes("探検")) {
        this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
        if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
    }
    if (typeof window.progressDailyQuest === 'function') window.progressDailyQuest('explore');
    
    if (this.schedule.length > 0 && this.schedule[0].type === 'explore') {
        this.schedule[0].duration = 0;
    }
};

// ==========================================
// ★ 言葉の学習・忘却・記憶容量システム
// ==========================================

// 1. 現在のステータスから「記憶できる単語の最大数」を計算する
aiPet.getMaxVocabulary = function() {
    // ★修正：前世からの引継ぎ枠があれば、それを初期ベース枠にする
    let base = (this.apprentice && this.apprentice.baseVocab) ? this.apprentice.baseVocab : 3; 
    
    let intelBonus = Math.floor((this.stats.intel || 0) / 10); 
    
    // ★修正：年齢による増加を平方根カーブにして緩やかにする！
    // 例: 1歳で+1, 4歳で+2, 9歳で+3, 16歳で+4
    let ageBonus = Math.floor(Math.sqrt(this.age || 0)); 
    
    let typeBonus = 0;
    if (this.currentSkin === 'scholar' || this.currentSkin === 'wizard') {
        typeBonus = 5;
    }

    let masterBonus = 0;
    if (this.apprentice && this.apprentice.learnedWords) {
        const systemWords = ["冒険家", "農家", "漁師", "料理人", "鍛冶師", "建築士", "バイト"];
        systemWords.forEach(word => {
            if (this.apprentice.learnedWords.includes(word)) {
                masterBonus++;
            }
        });
    }

    // ★ 追加：ダンジョンでの閃きによる記憶領域の拡張分
    let dungeonBonus = (this.apprentice && this.apprentice.dungeonVocabBonus) ? this.apprentice.dungeonVocabBonus : 0;

    return base + intelBonus + ageBonus + typeBonus + masterBonus + dungeonBonus;
};

// 2. 「なんでも覚える」＆「忘れる」統合処理
aiPet.learnOrForgetWord = function(message) {
    if (!this.apprentice) this.apprentice = {};
    if (!this.apprentice.learnedWords) this.apprentice.learnedWords = [];

    // --- 忘却処理：「〇〇を忘れて」に一致するかチェック ---
    const forgetMatch = message.match(/(.+)を忘れて/);
    if (forgetMatch) {
        const wordToForget = forgetMatch[1].trim();
        const index = this.apprentice.learnedWords.indexOf(wordToForget);
        
        if (index !== -1) {
            // 知っている言葉なら消去する
            this.apprentice.learnedWords.splice(index, 1);
            this.message = `「${wordToForget}」だね…うん、忘れたよ。`;
            this.messageTimer = 180;
            return true; // 処理完了
        } else {
            // 知らない言葉だった場合
            this.message = `えっ？「${wordToForget}」なんて言葉、最初から知らないよ？`;
            this.messageTimer = 180;
            return true; // 処理完了
        }
    }

    // --- 学習処理（意味のあるワードかどうかは既存の判定に任せる） ---
    // もし既に覚えている言葉なら何もしない
    if (this.apprentice.learnedWords.includes(message)) {
        return false; 
    }

    // 記憶容量のチェック
    const maxWords = this.getMaxVocabulary();
    if (this.apprentice.learnedWords.length >= maxWords) {
        this.message = `頭がいっぱいで、もう新しい言葉は覚えられないや…\n（何かを「忘れて」と言ってね）`;
        this.messageTimer = 200;
        return true; // 容量オーバー
    }

    // 新しい言葉として記憶する！
    this.apprentice.learnedWords.push(message);
    
    // ★追加：コミュニケーション（新しい言葉を教わる）による機嫌の大幅回復
    if (this.stats) {
        const bMood = (this.getTraitData().statBonus && this.getTraitData().statBonus.mood) ? this.getTraitData().statBonus.mood : 1.0;
        this.stats.mood = Math.min(100, (this.stats.mood || 0) + 15 * bMood);
    }
    
    // ※「意味のあるワード」に対するリアクションは、この後ゲーム側で処理される前提
    // もし意味のないワードだった場合用の汎用メッセージを一旦セットしておく
    this.message = `「${message}」…！\nよく分からないけど、新しい言葉を覚えたよ！`;
    this.messageTimer = 180;
    
    return false; // 「意味のあるワード」かどうかの判定を続けるためにfalseを返す
};

// ==========================================
// ★ マルチプレイ拡張：パーティシステムとAIの設計図化
// ==========================================
window.AICharacter = function(initData = {}) {
    // 基本ステータスの初期化
    this.id = initData.id || 'pet_' + Date.now() + Math.floor(Math.random()*1000);
    this.x = initData.x || 400;
    this.y = initData.y || 240;
    this.currentSkin = initData.currentSkin || 'robot';
    this.energy = initData.energy !== undefined ? initData.energy : 100;
    this.hunger = initData.hunger !== undefined ? initData.hunger : 100;
    this.stats = initData.stats || { intel: 10, power: 10, mood: 100, beauty: 10 };
    this.skills = initData.skills || { cooking: 1, smithing: 1, building: 1 };
    
    // オブジェクトや配列は、新しく生成する場合は独立させる
    this.apprentice = initData.apprentice || { learnedWords: [], rank: {}, attempts: {} };
    this.schedule = initData.schedule || [];
    this.inventory = initData.inventory || [];
    this.gold = initData.gold || 0;

    // ★大追加：AIがどんな人生を送ってきたかを記録する「履歴の器」！
    this.actionHistory = initData.actionHistory || { study: 0, train: 0, work: 0, rest: 0, care: 0, free: 0 };
    
    // 行動状態
    this.actionState = initData.actionState || 'idle';
    this.visualAction = initData.visualAction || null;
    this.flip = initData.flip || false;
    this.message = initData.message || "";
    this.messageTimer = 0;
    this.visualScale = initData.visualScale || 1.0;
    this.frameIndex = 0;
    this.frameStep = 0;   // ★ 追加：アニメーション計算用の初期値（これが無いとエラーで消えます！）
    this.tick = 0;
    this.gameTimer = 0;

    // ★ 追加：自律行動や状態管理のためのタイマー群を初期化（これが無いと一生棒立ちになります！）
    this.idleTimer = 0;
    this.exploreTimer = 0;
    this.weatherTimer = 0;
    this.debtTimer = 0;
    this.fishingPopupTimer = 0;

    this.isHelper = initData.isHelper || false; // ★ 追加：助っ人かどうかの判別フラグ
    
    // その他のデータをマージ
    Object.assign(this, initData); 
};

// 魔法のコード：既存の主人公(aiPet)の関数を、すべて設計図(prototype)にコピーする！
for (let key in window.aiPet) {
    if (typeof window.aiPet[key] === 'function') {
        window.AICharacter.prototype[key] = window.aiPet[key];
    }
}

// パーティ全体を管理する配列
window.party = [];
window.activePartyIndex = 0;

setTimeout(() => {
    for (let key in window.aiPet) {
        if (typeof window.aiPet[key] === 'function') {
            window.AICharacter.prototype[key] = window.aiPet[key];
        }
    }
    if (typeof party !== 'undefined' && party.length === 0 && typeof window.aiPet !== 'undefined') {
        if (typeof window.aiPet.tick === 'undefined') window.aiPet.tick = 0;
        if (typeof window.aiPet.frameStep === 'undefined') window.aiPet.frameStep = 0;
        if (typeof window.aiPet.frameIndex === 'undefined') window.aiPet.frameIndex = 0;
        if (!window.aiPet.id) window.aiPet.id = 'pet_' + Date.now() + Math.floor(Math.random()*1000);
        
        if (!window.aiPet.discoveredMonsters) window.aiPet.discoveredMonsters = [];
        const currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        if (!window.aiPet.discoveredMonsters.includes(currentSkin)) window.aiPet.discoveredMonsters.push(currentSkin);

        window.party.push(window.aiPet);
    }
}, 1000);

// ==========================================
// ★ 画面のフェードイン＆視覚的チュートリアル管理（タイミング完全修正版）
// ==========================================
let hasTutorialPlayed = false;

// ガイド用のアニメーションCSSを動的に追加
if (!document.getElementById('tutorial-css')) {
    const style = document.createElement('style');
    style.id = 'tutorial-css';
    style.innerHTML = `
        @keyframes bouncePointer {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, 10px); }
        }
        .tutorial-highlight {
            box-shadow: 0 0 15px 5px #FF9800 !important;
            border: 2px solid #FF9800 !important;
            transition: all 0.3s ease;
        }
        .tut-btn:hover { background: #e68a00 !important; }
    `;
    document.head.appendChild(style);
}

// ==========================================
// ★大修正：ページ読み込み直後の「0.1秒の隙」にフライング誤爆しないよう、
// ゲームシステムが完全に起動するまで「2秒間」待ってから監視をスタートします！
// ==========================================
setTimeout(() => {
    let uiRevealCheck = setInterval(() => {
        const qOverlay = document.getElementById('questionOverlay');
        const rOverlay = document.getElementById('resultOverlay');
        
        // 現在、診断画面や結果画面が出ている最中か？
        const isQuestioning = qOverlay && qOverlay.classList.contains('active');
        const isResulting = rOverlay && rOverlay.classList.contains('active');

        // ★追加：質問が出ている最中は絶対に何もしないで待機する
        if (isQuestioning || isResulting) return;

        // 診断画面が「完全に閉じていて」、かつゲームが開始している時だけ発動！
        if (typeof currentMode !== 'undefined' && currentMode === 'play' && window.aiPet && window.aiPet.id) {
            
            // ==========================================
            // ★超重要：名前入力中なら、UI表示もチュートリアル判定も行わず「一旦保留」にして次のループ（0.5秒後）を待つ！
            // （これで、名前が決まるまでこのループが自爆せずに回り続けます）
            // ==========================================
            if (window.isNamingPhase) return;

            // ★ AIがすでに言葉を知っているか（＝続きからプレイか）を判定
            const isNewGame = (!window.aiPet.apprentice || !window.aiPet.apprentice.learnedWords || window.aiPet.apprentice.learnedWords.length === 0);
            
            // 1. UIを表示（世界観たっぷりの順番で）
            const els = ['canvas-wrapper', 'aiStatus', 'info-column', 'gameControls'];
            
            els.forEach((id, index) => {
                const el = document.getElementById(id);
                if (el) {
                    if (isNewGame) {
                        // 【新規ゲーム】真っ暗な中から順番にフワッと現れるエモい演出
                        el.style.transition = 'opacity 3s ease-in-out';
                        setTimeout(() => {
                            el.style.opacity = '1';
                            el.style.pointerEvents = 'auto';
                        }, index * 1200); // 1.2秒間隔で世界→ステータス→コマンド→操作パネルの順に表示
                    } else {
                        // 【ロード時】F5リロード等で待たせないよう、即座に表示
                        el.style.transition = 'none';
                        el.style.opacity = '1';
                        el.style.pointerEvents = 'auto';
                    }
                }
            });

            // 2. 言葉を知らない（新規）場合のみ、視覚的なチュートリアルを開始
            // ※念のため hasTutorialPlayed が未定義の場合をケア
            if (isNewGame && (typeof hasTutorialPlayed === 'undefined' || !hasTutorialPlayed)) {
                window.hasTutorialPlayed = true;
                
                // UIがすべて出揃った頃（約5.5秒後）にチュートリアルを出す
                setTimeout(() => {
                    window.aiPet.message = "何をすればいいかわかりません…\n言葉を教えてください！";
                    window.aiPet.messageTimer = 300;
                    
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
                    tutBox.style.opacity = '0'; // フワッと出すために初期は0
                    tutBox.style.transition = 'opacity 1s ease';
                    
                    tutBox.innerHTML = `
                        <div style="color: #FF9800; font-size: 18px; font-weight: bold; margin-bottom: 10px;">📖 チュートリアル</div>
                        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 15px; color: #ddd;">
                            AIはまだ言葉を知らないため、どう行動していいか分からず戸惑っています。<br><br>
                            画面下のチャット欄から、あなたが思いつく<span style="color:#4fc3f7; font-weight:bold; font-size:16px;">「好きな言葉」</span>を入力して、AIに最初の言葉を教えてあげましょう！
                        </div>
                        <button id="tut-close-btn" class="tut-btn" style="background: #FF9800; color: #fff; border: none; padding: 10px 30px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 15px; transition: 0.2s;">わかった！</button>
                    `;
                    document.body.appendChild(tutBox);
                    
                    setTimeout(() => { tutBox.style.opacity = '1'; }, 100);
                    
                    // 「わかった！」ボタンを押したらフワッと消す
                    document.getElementById('tut-close-btn').onclick = () => {
                        tutBox.style.opacity = '0';
                        setTimeout(() => { if (tutBox.parentNode) tutBox.parentNode.removeChild(tutBox); }, 1000);
                    };
                    
                    const chatInput = document.getElementById('chatInput');
                    if (chatInput) chatInput.classList.add('tutorial-highlight');

                    let guide = document.createElement('div');
                    guide.id = 'chat-tutorial-guide';
                    guide.innerHTML = '▼ ここに「好きな言葉」を入力して送信 ▼';
                    guide.style.position = 'absolute';
                    guide.style.bottom = '55px';
                    guide.style.left = '50%';
                    guide.style.transform = 'translateX(-50%)';
                    guide.style.background = '#FF9800';
                    guide.style.color = '#fff';
                    guide.style.padding = '8px 16px';
                    guide.style.borderRadius = '20px';
                    guide.style.fontWeight = 'bold';
                    guide.style.fontSize = '14px';
                    guide.style.zIndex = '9999';
                    guide.style.pointerEvents = 'none';
                    guide.style.animation = 'bouncePointer 1s infinite';
                    guide.style.opacity = '0'; 
                    guide.style.transition = 'opacity 1s ease';
                    document.body.appendChild(guide);
                    
                    setTimeout(() => { guide.style.opacity = '1'; }, 100);

                    // AIが言葉を覚えた瞬間に、光と矢印をフワッと消す
                    let guideCheck = setInterval(() => {
                        if (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.learnedWords.length > 0) {
                            guide.style.opacity = '0';
                            setTimeout(() => { if (guide.parentNode) guide.parentNode.removeChild(guide); }, 1000);
                            
                            if (chatInput) chatInput.classList.remove('tutorial-highlight');
                            clearInterval(guideCheck);
                        }
                    }, 1000);

                }, 5500); // UI表示演出完了に合わせて実行
            }
            
            // ★超重要：保留されずにここまで到達した（＝名前入力が終わった）時だけ監視を終了する！
            clearInterval(uiRevealCheck); 
        }
    }, 500);
}, 2000);


// ==========================================
// ★ 段階的な機能解放（アンロック）システム（修正版）
// ==========================================
let featureUnlockCheck = setInterval(() => {
    // 【絶対安全装置】
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode !== 'play') return;
    if (!window.aiPet || !window.aiPet.apprentice) return;

    if (!window.aiPet.unlockedFeatures) {
        window.aiPet.unlockedFeatures = { shop: false, online: false };
    }

    const words = window.aiPet.apprentice.learnedWords ? window.aiPet.apprentice.learnedWords.length : 0;

    // フライング解放防止ストッパー
    if (words < 3) window.aiPet.unlockedFeatures.shop = false;
    if (words < 7) window.aiPet.unlockedFeatures.online = false;

    // ボタンの要素を取得
    const btnRescue = document.getElementById('btn-menu-rescue');
    const btnTavern = document.getElementById('btn-menu-tavern');
    const btnRanking = document.getElementById('btn-menu-ranking');
    const partyUI = document.getElementById('party-ui-container'); 

    // === 解放状態に合わせて隠すクラスを付け外しする ===
    if (btnRescue) window.aiPet.unlockedFeatures.shop ? btnRescue.classList.remove('hidden-feature') : btnRescue.classList.add('hidden-feature');
    if (btnTavern) window.aiPet.unlockedFeatures.online ? btnTavern.classList.remove('hidden-feature') : btnTavern.classList.add('hidden-feature');
    if (btnRanking) window.aiPet.unlockedFeatures.online ? btnRanking.classList.remove('hidden-feature') : btnRanking.classList.add('hidden-feature');
    if (partyUI) window.aiPet.unlockedFeatures.online ? partyUI.classList.remove('hidden-feature') : partyUI.classList.add('hidden-feature');

    const cloudLoginUI = document.getElementById('firebaseui-auth-container');
    if (cloudLoginUI) {
        cloudLoginUI.style.display = window.aiPet.unlockedFeatures.online ? 'block' : 'none';
    }

    // === 解放判定（チュートリアル） ===
    if (words >= 3 && !window.aiPet.unlockedFeatures.shop) {
        window.aiPet.unlockedFeatures.shop = true;
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial(
                "機能解放：救済 🆘", 
                "言葉を覚えて少し賢くなったので、メニューに<span style='color:#FF5722; font-weight:bold;'>「救済」</span>が追加されました！<br><br>ご飯がなくてピンチの時は、借金をして緊急物資を届けてもらうことができます！"
            );
        }
    }

    if (words >= 7 && !window.aiPet.unlockedFeatures.online) {
        window.aiPet.unlockedFeatures.online = true;
        if (typeof window.showGameTutorial === 'function') {
            window.showGameTutorial(
                "機能解放：オンライン 🌐", 
                "AIが立派に成長してきました！<br><br>他のAIと交流できる<span style='color:#ff5252; font-weight:bold;'>「ギルド酒場」</span>と<span style='color:#ff5252; font-weight:bold;'>「ランキング」</span>が解放されました！<br>ぜひ覗いてみましょう！"
            );
        }
    }
}, 1000);

// 2. 草むら探索（自動で一定確率で野イチゴを拾う）
setInterval(() => {
    // 【絶対安全装置】
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode === 'play' && window.aiPet && window.aiPet.id) {
        // ★修正：完全にアイドル状態（待機・徘徊中）かつ、予定(スケジュール)が空の時のみ拾う！
        if ((window.aiPet.actionState === 'idle' || window.aiPet.actionState === 'moving') && 
            (!window.aiPet.schedule || window.aiPet.schedule.length === 0)) {
            
            // 10秒に1回、15%の確率で野イチゴを発見
            if (Math.random() < 0.15) {
                if (!window.aiPet.inventory) window.aiPet.inventory = [];
                window.aiPet.inventory.push('item_berry');
                
                if (typeof addFloatingText === 'function') {
                    addFloatingText(window.aiPet.x, window.aiPet.y - 40, "🍓野イチゴ発見！", "#ff4081");
                }
            }
        }
    }
}, 10000);

// 3. おすそわけ付与関数（どこからでも呼べるように準備）
window.giveOsusowake = function() {
    if (!window.aiPet.inventory) window.aiPet.inventory = [];
    window.aiPet.inventory.push('item_lunchbox');
    setTimeout(() => {
        alert("🎁 師匠から「お弁当」のおすそわけをもらいました！\n（右の「持ち物」からいつでも食べられます）");
    }, 500);
};

// ==========================================
// ★ 新機能：AIの余生ルート決定エンジン
// ==========================================
aiPet.determineLifePath = function() {
    const h = this.actionHistory || { study: 0, train: 0, work: 0, rest: 0, care: 0, free: 0 };
    
    // 各ルートのスコア（適性）を計算する
    let scores = {
        'mentor': (this.stats.mood * 0.5) + (h.free * 2) + (h.rest * 1),
        'monument': (h.work * 3) + (this.stats.power * 0.5),            
        'seeker': (h.train * 3) + (h.study * 3) + (h.work * 1) - (h.rest * 3), 
        'guardian': (h.care * 6) + (h.work * 1),                        
        'author': (h.study * 4) + (this.stats.intel * 1),               
        'slowlife': (h.rest * 4) + (h.free * 3) + (this.stats.mood * 0.5) 
    };

    let bestPath = 'slowlife'; 
    let maxScore = -Infinity;
    for (let path in scores) {
        if (scores[path] > maxScore) {
            maxScore = scores[path];
            bestPath = path;
        }
    }

    if (maxScore <= 0) bestPath = 'slowlife';
    this.apprentice.lifePath = bestPath; 
    return bestPath;
};

// ==========================================
// ★ 新機能：余生の時間を加速する「走馬灯（早送り）」ボタンの自動生成（収納版）
// ==========================================
setInterval(() => {
    // 【絶対安全装置】
    let mode = 'unknown'; try { mode = currentMode; } catch(e) {}
    if (mode === 'play' && window.aiPet) {
        // ★修正：皆伝フラグ(isGraduated)が無くても、余生の夢(lifePath)を持っていれば早送りボタンを出す！
        const isRetired = window.aiPet.lifePath || (window.aiPet.apprentice && window.aiPet.apprentice.isGraduated);
        let ffBtn = document.getElementById('btn-fast-forward-life');
        
        if (isRetired) {
            if (!ffBtn) {
                ffBtn = document.createElement('button');
                ffBtn.id = 'btn-fast-forward-life';
                ffBtn.innerHTML = "⏩ 余生を早送りする";
                // ★修正：絶対座標(absolute)をやめ、ボックス内に自然に収まるスタイルに変更
                ffBtn.style.cssText = `
                    width: 100%; margin-top: 10px; padding: 10px;
                    background: linear-gradient(45deg, #673AB7, #9C27B0);
                    color: white; border: none; border-radius: 6px;
                    font-weight: bold; font-size: 14px; cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                    animation: ff-pulse 2s infinite;
                `;
                
                ffBtn.onmouseover = () => ffBtn.style.transform = 'scale(1.02)';
                ffBtn.onmouseout = () => ffBtn.style.transform = 'scale(1)';
                
                ffBtn.onclick = function() {
                    window.isFastForwardLife = !window.isFastForwardLife;
                    if (window.isFastForwardLife) {
                        this.innerHTML = "▶ 早送りを止める";
                        this.style.background = "linear-gradient(45deg, #F44336, #E91E63)";
                        this.style.animation = "none";
                    } else {
                        this.innerHTML = "⏩ 余生を早送りする";
                        this.style.background = "linear-gradient(45deg, #673AB7, #9C27B0)";
                        this.style.animation = "ff-pulse 2s infinite";
                    }
                };
                
                // ★修正：追加先を「▶ CURRENT STATUS の黒いボックス」の中に指定
                const container = document.getElementById('ai-status-text');
                if (container && container.parentElement) {
                    container.parentElement.appendChild(ffBtn);
                }
            }
        } else {
            if (ffBtn) {
                ffBtn.parentNode.removeChild(ffBtn);
                window.isFastForwardLife = false;
            }
        }
    }
}, 1000);

if (!document.getElementById('ff-pulse-css')) {
    const style = document.createElement('style');
    style.id = 'ff-pulse-css';
    style.innerHTML = `
        @keyframes ff-pulse {
            0% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(156, 39, 176, 0); }
            100% { box-shadow: 0 0 0 0 rgba(156, 39, 176, 0); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// 🩹 師匠消失バグ 修正パッチ (AI側)
// ==========================================

// 万が一、マップから師匠のテントが消滅していても、AIの目の前に自動で復活させる救済機能
const _originalFindFacilityForTask = window.findFacilityForTask;
window.findFacilityForTask = function(taskType, masterType = null) {
    let facility = _originalFindFacilityForTask(taskType, masterType);
    
    // 師匠の場所が見つからない場合、自動で再生成する
    if (!facility && (taskType === 'master_quest' || taskType === 'visit_master') && masterType) {
        let hero = window.aiPet;
        let campId = masterType + '_master_camp_rescue';
        
        // プレイヤーの少し横に安全な場所を探す
        let tx = hero.x + 80; let ty = hero.y;
        if (tx > 700) tx = hero.x - 80;
        if (typeof hero.isPointOnWater === 'function' && hero.isPointOnWater(tx, ty)) tx = hero.x - 80;
        
        if (masterType === 'smithing') {
            if (typeof assets !== 'undefined') assets[campId] = { type: 'blacksmith', name: '師匠のキャンプ', dx: tx, dy: ty, sw: 100, sh: 100, scale: 0.6 };
            if (typeof saveGameData === 'function') saveGameData();
            return assets[campId];
        } else if (masterType === 'building') {
            if (typeof assets !== 'undefined') assets[campId] = { type: 'palms', name: '建築士のテント', dx: tx, dy: ty, sw: 100, sh: 100, scale: 0.6 };
            if (typeof saveGameData === 'function') saveGameData();
            return assets[campId];
        } else if (masterType === 'cooking') {
            // ★修正：消えてしまった場合は「料理人のレストラン」としてその場に復活させる
            if (typeof assets !== 'undefined') assets[campId] = { type: 'restaurant', name: '料理人のレストラン', dx: tx, dy: ty, sw: 100, sh: 100, scale: 0.6, isMasterShop: true };
            if (typeof saveGameData === 'function') saveGameData();
            return assets[campId];
        } else {
            // 他の師匠の場合は、とりあえずAI自身の位置を師匠の場所として返して無理やり会話させる
            return { dx: hero.x, dy: hero.y, sw: 1, sh: 1, type: 'virtual_master', name: '師匠' };
        }
    }
    return facility;
};

// ==========================================
// 🔨 建築システムの完全復旧（マップ全方位スキャン＆橋架け対応版）
// ==========================================

aiPet.processBuildingStart = function(task) {
    // ★新規追加：修行中（isTrial）は実物を建てず、ステータス依存で図面や模型を作る！
    if (task.isTrial) {
        let intel = this.stats.intel || 10;
        let power = this.stats.power || 10;
        
        // 賢さ（構造計算）と活力（模型を組み上げる体力）から成功率を計算
        let successRate = 0.3 + (intel * 0.005) + (power * 0.005) + ((this.skills.building || 1) * 0.05);
        let greatSuccessRate = (intel * 0.003) + (power * 0.003); // ステータスが高いほど大成功しやすい
        successRate = Math.min(0.95, successRate);
        
        let isSuccess = Math.random() < successRate;
        let isGreatSuccess = isSuccess && (Math.random() < greatSuccessRate);

        let targetId = 'build_practice_normal';
        let targetName = '練習用の図面';

        if (isGreatSuccess) {
            targetId = 'build_practice_great';
            targetName = '精巧な建築模型';
        } else if (!isSuccess) {
            targetId = 'build_practice_fail';
            targetName = '落書きの紙くず';
        }

        task.buildData = {
            typeKey: 'trial', // マップ配置を回避するためのダミーキー
            targetId: targetId,
            targetName: targetName,
            successRate: successRate,
            isSuccess: isSuccess,
            isGreatSuccess: isGreatSuccess,
            isTrial: true
        };
        return true;
    }

    let bId = task.targetBuilding;
    
    // blacksmith と smith の名前の揺れを強制的に吸収してエラーを防ぐ！
    if (bId === 'blacksmith' && typeof buildingCatalog !== 'undefined' && !buildingCatalog['blacksmith']) {
        bId = 'smith';
    } else if (bId === 'smith' && typeof buildingCatalog !== 'undefined' && !buildingCatalog['smith']) {
        bId = 'blacksmith';
    }

    if (!bId) {
        let buildKeys = ['hut', 'farm'];
        if (typeof buildingCatalog !== 'undefined') {
            const level = this.skills && this.skills.building ? this.skills.building : 1;
            // ★勝手に重要施設を建てないように除外
            buildKeys = Object.keys(buildingCatalog).filter(k => buildingCatalog[k].reqBuildLevel <= level && k !== 'castle' && k !== 'casino' && k !== 'card_shop');
        }
        bId = buildKeys[Math.floor(Math.random() * buildKeys.length)];
    }

    let bData = (typeof buildingCatalog !== 'undefined' && buildingCatalog[bId]) ? buildingCatalog[bId] : null;
    
    if (!bData && (bId === 'smith' || bId === 'blacksmith')) {
        bData = { name: "鍛冶屋", materials: { stone: 2, wood: 1 } };
        bId = 'smith';
    }
    if (!bData) { this.message = "建て方がわからない..."; this.messageTimer = 120; return false; }

    // ★修正：修行中の素材自動補充ロジックもオブジェクト対応にする
    if (this.apprentice && this.apprentice.currentMaster === 'building') {
        if (!this.inventory) this.inventory = [];
        if (bData.materials) {
            for (let mKey in bData.materials) {
                let req = bData.materials[mKey];
                // カウント処理をオブジェクトの .id を見るように修正
                while (this.inventory.filter(item => (typeof item === 'string' ? item : item.id) === mKey).length < req) { 
                    this.inventory.push({ id: mKey, age: 0 }); // 文字列ではなくオブジェクトをpushする
                }
            }
        }
    }

    // ★修正：所持数のカウント処理
    let myItems = {};
    if (this.inventory) {
        this.inventory.forEach(item => {
            // 文字列ならそのまま、オブジェクトなら .id を取得
            let id = typeof item === 'string' ? item : item.id;
            myItems[id] = (myItems[id] || 0) + 1;
        });
    }
    let canBuild = true;
    if (bData.materials) {
        for (let mKey in bData.materials) {
            if ((myItems[mKey] || 0) < bData.materials[mKey]) canBuild = false;
        }
    }
    if (!canBuild) {
        this.message = `${bData.name}を作る素材が足りないみたい...`; this.messageTimer = 120; return false;
    }

    let tx = this.x; let ty = this.y;
    let walkX = this.x; let walkY = this.y; 
    let foundSpot = false;
    let targetUid = null; // ★追加：拡張対象のIDを保持

    // ==========================================
    // ★修正：拡張施設（冷凍庫・倉庫・金庫）の場合は小屋の手前を探す
    // ==========================================
    if (bData.isUpgrade) {
        let targetAsset = null;
        for (let k in assets) {
            if (assets[k].type === bData.targetFacility && !assets[k].isMobile) { targetAsset = assets[k]; break; }
        }
        if (!targetAsset) {
            this.message = `拡張元の施設（${bData.targetFacility}）が見つからないよ...`; this.messageTimer = 120; return false;
        }
        let aScale = targetAsset.scale || 0.5;
        tx = targetAsset.dx + (targetAsset.sw * aScale) / 2;
        ty = targetAsset.dy + (targetAsset.sh * aScale) / 2;
        
        // ★重要：小屋のど真ん中だと衝突して歩けないため、手前（下側）を目標にする！
        walkX = tx; 
        walkY = targetAsset.dy + (targetAsset.sh * aScale) + 20; 
        foundSpot = true;
        targetUid = Object.keys(assets).find(k => assets[k] === targetAsset);
    }
    // ==========================================
    // ★大改修：全方位スキャン型の超賢い「橋架け」アルゴリズム
    // ==========================================
    else if (bId === 'bridge') { // ★ if を else if に変更！
        let bestSpot = null;
        let minDist = Infinity;

        let isOnBridge = (cx, cy) => {
            if (typeof assets !== 'undefined') {
                for (let k in assets) {
                    let a = assets[k];
                    if (a.type === 'bridge') {
                        let scale = a.scale || 0.5;
                        let w = (a.sw || 50) * scale; let h = (a.sh || 50) * scale;
                        if (cx >= a.dx - 10 && cx <= a.dx + w + 10 && cy >= a.dy - 10 && cy <= a.dy + h + 10) return true;
                    }
                }
            }
            return false;
        };

        let isWalkable = (cx, cy) => {
            if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(cx, cy)) return true;
            return isOnBridge(cx, cy);
        };

        for (let cx = 40; cx <= 760; cx += 20) {
            for (let cy = 40; cy <= 440; cy += 20) {
                if (typeof this.isPointOnWater === 'function' && this.isPointOnWater(cx, cy) && !isOnBridge(cx, cy)) {
                    let offsets = [ {dx:-40, dy:0}, {dx:40, dy:0}, {dx:0, dy:-40}, {dx:0, dy:40} ];
                    for (let off of offsets) {
                        let sx = cx + off.dx;
                        let sy = cy + off.dy;
                        if (isWalkable(sx, sy)) {
                            let dist = Math.hypot(this.x - sx, this.y - sy);
                            if (dist < minDist) {
                                minDist = dist;
                                bestSpot = { tx: cx, ty: cy, walkX: sx, walkY: sy };
                            }
                        }
                    }
                }
            }
        }

        if (bestSpot) {
            tx = bestSpot.tx; ty = bestSpot.ty; walkX = bestSpot.walkX; walkY = bestSpot.walkY; foundSpot = true;
        }
        if (!foundSpot) { this.message = "橋を架ける適当な水辺が見つからないよ..."; this.messageTimer = 120; return false; }
        
    } else {
        // 橋・拡張以外の建物は、陸地にランダムに建てる
        for (let i = 0; i < 50; i++) {
            let checkX = 50 + Math.random() * 700; let checkY = 50 + Math.random() * 380;
            if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(checkX, checkY)) {
                tx = checkX; ty = checkY; walkX = checkX; walkY = checkY; foundSpot = true; break;
            }
        }
        if (!foundSpot) { this.message = "安全に建てられる空き地が見つからないよ..."; this.messageTimer = 120; return false; }
    }

    this.message = `${bData.name}の作業をする場所へ行くよ！`; this.messageTimer = 120;
    let vSrc = (typeof catalog !== 'undefined' && catalog[bId]) ? catalog[bId] : {img: bId, sw: 50, sh: 50, sx: 0, sy: 0, scale: 0.5};

    task.buildData = {
        typeKey: bId, name: bData.name,
        visualSource: { img: vSrc.img || vSrc.image || 'field', sx: vSrc.sx || 0, sy: vSrc.sy || 0, sw: vSrc.sw || 50, sh: vSrc.sh || 50 },
        targetScale: vSrc.scale || 0.5, bestX: tx, bestY: ty, walkX: walkX, walkY: walkY, targetFlip: false, maxDurability: bData.maxDurability || -1
    };

    // ★追加：上書きされて消えないように、最後にもう一度拡張フラグをセットする！
    if (bData.isUpgrade) {
        task.buildData.isUpgrade = true;
        task.buildData.targetUid = targetUid;
    }

    task._hasBeenBuilt = false;
    return true;
};

// ★ここが最も重要：確実にaiPetに完成処理を直接生やす！
aiPet.processBuildingFinish = function(task) {
    if (!task || !task.buildData || task._hasBeenBuilt) return;
    
    let bId = task.buildData.typeKey;

    // 修行中（isTrial）の場合はマップに建てず、インベントリにアイテムを入れる
    if (task.buildData.isTrial) {
        let d = task.buildData;
        if (!this.skills.building) this.skills.building = 1;
        
        if (d.isSuccess) {
            this.skills.building += 0.5;
            this.stats.mood += d.isGreatSuccess ? 15 : 5;
            this.message = d.isGreatSuccess ? `大成功！！ 芸術的な「${d.targetName}」が完成した！` : `製図成功！ ${d.targetName}ができた！`;
        } else {
            this.skills.building += 0.1;
            this.message = "計算ミス... わけのわからない設計図になっちゃった...";
        }
        
        this.inventory.push(d.targetId);

        if (this.apprentice && this.apprentice.activeQuest) {
            const desc = this.apprentice.activeQuest.desc;
            if (desc.includes('図面') || desc.includes('模型') || desc.includes('製図') || desc.includes('建築')) {
                this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            }
        }

        this.messageTimer = 150; this.visualAction = null; this.actionState = 'idle';
        if (typeof saveGameData === 'function') saveGameData();
        task._hasBeenBuilt = true;
        return; 
    }

    let bData = (typeof buildingCatalog !== 'undefined') ? buildingCatalog[bId] : null;
    
    // ==========================================
    // ★ ストレージ一括拡張ロジック
    // ==========================================
    let expandCount = 1; 
    
    if (task.buildData.isUpgrade) {
        let intel = this.stats.intel || 10;
        let power = this.stats.power || 10;
        
        if (intel >= 30) {
            let requiredCount = 1;
            let upgType = bId; 
            let tAsset = assets[task.buildData.targetUid];
            
            if (tAsset && tAsset.storage) {
                if (upgType === 'warehouse' || upgType === 'freezer') {
                    let targetItemsCount = 0;
                    const getItemData = (itemObj) => { let id = typeof itemObj === 'string' ? itemObj : itemObj.id; return (typeof window.itemCatalog !== 'undefined') ? window.itemCatalog[id] : null; };
                    
                    (this.inventory || []).forEach(i => {
                        let d = getItemData(i);
                        if (d) {
                            let isFood = ['food', 'ingredient', 'dish'].includes(d.type);
                            if (upgType === 'freezer' && isFood) targetItemsCount++;
                            if (upgType === 'warehouse' && !isFood) targetItemsCount++;
                        } else {
                            if (upgType === 'warehouse') targetItemsCount++;
                        }
                    });
                    
                    let currentCap = tAsset.storage[upgType].capacity || 0;
                    let overflow = targetItemsCount - currentCap;
                    let extraBuffer = Math.floor(intel / 50) * 10; 
                    
                    if (overflow > 0) requiredCount = Math.ceil((overflow + extraBuffer) / 10);
                    else requiredCount = Math.ceil(extraBuffer / 10);
                } else if (upgType === 'safe') {
                    let currentCap = tAsset.storage.safe.capacity || 0;
                    let overflow = this.gold - currentCap;
                    if (overflow > 0) requiredCount = Math.ceil(overflow / 50000); 
                }
                
                let maxByPower = Math.max(1, Math.floor(power / 30));
                expandCount = Math.min(requiredCount, maxByPower);
                if (expandCount < 1) expandCount = 1;
            }
        }
    }

    // ==========================================
    // ★ 素材の消費処理（GodModeを無視して確実に消費させる！）
    // ==========================================
    if (bData && bData.materials) {
        let myItems = {};
        (this.inventory || []).forEach(item => {
            let id = typeof item === 'string' ? item : item.id;
            myItems[id] = (myItems[id] || 0) + 1;
        });
        
        for (let mKey in bData.materials) {
            let reqOne = bData.materials[mKey];
            let has = myItems[mKey] || 0;
            let possibleTimes = Math.floor(has / reqOne);
            if (possibleTimes < expandCount) expandCount = possibleTimes;
        }
        
        if (expandCount < 1) {
            this.message = "あれ？ 途中で素材を落としちゃったみたい..."; this.messageTimer = 120;
            return;
        }

        // 実際の消費ループ
        for (let mKey in bData.materials) {
            let totalReq = bData.materials[mKey] * expandCount;
            for (let i = 0; i < totalReq; i++) {
                let idx = this.inventory.findIndex(item => {
                    let id = typeof item === 'string' ? item : item.id;
                    return id === mKey;
                });
                if (idx !== -1) this.inventory.splice(idx, 1);
            }
        }
        if (typeof updateStatUI === 'function') updateStatUI();
    }
    
    task._hasBeenBuilt = true;

    // ==========================================
    // ★ 拡張施設の場合の処理
    // ==========================================
    if (task.buildData.isUpgrade) {
        let tAsset = assets[task.buildData.targetUid];
        if (tAsset) {
            if (!tAsset.storage) tAsset.storage = { freezer: {level:0, capacity:0, items:[]}, warehouse: {level:0, capacity:0, items:[]}, safe: {level:0, capacity:0, gold:0} };
            let upgType = task.buildData.typeKey; 
            
            tAsset.storage[upgType].level += expandCount;
            let addedCapacity = 0;

            if (upgType === 'safe') {
                addedCapacity = 50000 * expandCount;
                tAsset.storage[upgType].capacity += addedCapacity; 
            } else {
                addedCapacity = 10 * expandCount;
                tAsset.storage[upgType].capacity += addedCapacity; 
            }

            if (expandCount > 1) {
                this.message = `一気に工事したよ！ ${task.buildData.name}の容量が +${window.formatLargeNumber(addedCapacity)} 増えた！`;
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, `✨ 一括拡張(x${expandCount})`, "#00BCD4");
            } else {
                this.message = `${task.buildData.name}の設置・拡張（Lv.${tAsset.storage[upgType].level}）が完了したよ！`;
                if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 設備拡張！", "#00BCD4");
            }
            
            this.messageTimer = 180;
            if (typeof saveGameData === 'function') saveGameData();
        }
        return;
    }

    // 通常の建築処理
    let uid = 'build_' + bId + '_' + Date.now();
    let vSrc = task.buildData.visualSource || {};

    if (bId === 'bridge') {
        assets[uid] = {
            type: 'bridge', name: '橋', img: 'field_6',
            sx: 183, sy: 1126, sw: 769, sh: 691, scale: 0.10000000000000007,
            dx: task.buildData.bestX, dy: task.buildData.bestY, durability: -1, maxDurability: -1
        };
    } else {
        assets[uid] = {
            type: bId, name: task.buildData.name, img: vSrc.img || 'field',
            sx: vSrc.sx !== undefined ? vSrc.sx : 0, sy: vSrc.sy !== undefined ? vSrc.sy : 0,
            dx: task.buildData.bestX, dy: task.buildData.bestY, 
            sw: vSrc.sw !== undefined ? vSrc.sw : 50, sh: vSrc.sh !== undefined ? vSrc.sh : 50,
            scale: task.buildData.targetScale || 0.5,
            durability: task.buildData.maxDurability || -1, maxDurability: task.buildData.maxDurability || -1
        };
    }

    if (bId === 'farm') {
        assets[uid].plantedCrop = null;
        assets[uid].growth = 0; assets[uid].waterLevel = 100; assets[uid].pestState = false;
    }

    this.message = `${task.buildData.name}が完成したよ！`;
    this.messageTimer = 180;
    if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 完成！", "#FFD700");
    if (typeof saveGameData === 'function') saveGameData();
    console.log(`[Build Success] ${task.buildData.name} を設置しました！`);
};

if (typeof window.AICharacter !== 'undefined') {
    window.AICharacter.prototype.processBuildingFinish = aiPet.processBuildingFinish;
}

// ==========================================
// 🩹 最終デバッグパッチ（透明橋の修正 ＆ ダンジョン突入フック）
// ==========================================

if (typeof window.AICharacter !== 'undefined') {
    
    // 1. 透明だった橋に「画像データ」を持たせて実体化させる！
    window.AICharacter.prototype.processBuildingFinish = function(task) {
        if (!task || !task.buildData || task._hasBeenBuilt) return;
        task._hasBeenBuilt = true;
        
        // ▼▼▼ 新規追加：修行中（isTrial）の場合はマップに建てず、インベントリにアイテムを入れる ▼▼▼
        if (task.buildData.isTrial) {
            let d = task.buildData;
            if (!this.skills.building) this.skills.building = 1;
            
            if (d.isSuccess) {
                this.skills.building += 0.5;
                this.stats.mood += d.isGreatSuccess ? 15 : 5;
                
                if (d.isGreatSuccess) {
                    this.message = `大成功！！ 芸術的な「${d.targetName}」が完成した！`;
                } else {
                    this.message = `製図成功！ ${d.targetName}ができた！`;
                }
            } else {
                this.skills.building += 0.1;
                this.message = "計算ミス... わけのわからない設計図になっちゃった...";
            }
            
            // アイテムをインベントリに入れる
            this.inventory.push(d.targetId);

            // クエストの進捗（修行した回数）をカウント
            if (this.apprentice && this.apprentice.activeQuest) {
                const desc = this.apprentice.activeQuest.desc;
                if (desc.includes('図面') || desc.includes('模型') || desc.includes('製図') || desc.includes('建築')) {
                    this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                    if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                }
            }

            this.messageTimer = 150;
            this.visualAction = null;
            this.actionState = 'idle';
            if (typeof saveGameData === 'function') saveGameData();
            return; // ★ここで return することで、これ以下の「マップへの配置」を完全にストップします！
        }
        // ▲▲▲ 新規追加ここまで ▲▲▲

        let bId = task.buildData.typeKey;
        let bData = (typeof buildingCatalog !== 'undefined') ? buildingCatalog[bId] : null;
        
        // 素材の消費
        if (!this.godMode && bData && bData.materials) {
            let myItems = {};
            (this.inventory || []).forEach(k => myItems[k] = (myItems[k] || 0) + 1);
            let canBuild = true;
            for (let mKey in bData.materials) {
                if ((myItems[mKey] || 0) < bData.materials[mKey]) canBuild = false;
            }
            if (!canBuild) {
                this.message = "あれ？ 途中で素材を落としちゃったみたい..."; this.messageTimer = 120;
                return;
            }
            // ★修正: オブジェクト対応の消費処理
            for (let mKey in bData.materials) {
                for (let i = 0; i < bData.materials[mKey]; i++) {
                    let idx = this.inventory.findIndex(item => {
                        let id = typeof item === 'string' ? item : item.id;
                        return id === mKey;
                    });
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
            }
            if (typeof updateStatUI === 'function') updateStatUI();
        }

        // マップへの配置（★ここに画像データ: img, sx, sy を追加しました！）
        let uid = 'build_' + bId + '_' + Date.now();
        let vSrc = task.buildData.visualSource || {};
        let sw = vSrc.sw || 50;
        let sh = vSrc.sh || 50;

        assets[uid] = {
            type: bId,
            name: task.buildData.name,
            img: vSrc.img || 'field', // ★画像ソース
            sx: vSrc.sx || 0,         // ★切り抜きX座標
            sy: vSrc.sy || 0,         // ★切り抜きY座標
            dx: task.buildData.bestX, 
            dy: task.buildData.bestY, 
            sw: sw, sh: sh,
            scale: task.buildData.targetScale || 0.5,
            durability: task.buildData.maxDurability || -1,
            maxDurability: task.buildData.maxDurability || -1
        };

        if (bId === 'farm') {
            assets[uid].plantedCrop = null;
            assets[uid].growth = 0; assets[uid].waterLevel = 100; assets[uid].pestState = false;
        }

        this.message = `${task.buildData.name}が完成したよ！`;
        this.messageTimer = 180;
        if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 完成！", "#FFD700");
        if (typeof saveGameData === 'function') saveGameData();
    };

    // 2. スカルやクリスタルに入った時、「普通の探索」ではなく「ダンジョンUI」を開くように横取りする
    const _origProcessExploration = window.AICharacter.prototype.processExploration;
    window.AICharacter.prototype.processExploration = function() {
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
            this.actionState = 'idle';
            this.isIndoors = false;
            
            if (isMasterExplorer) {
                // 皆伝済み：予定を全消ししてダンジョンに突入！
                this.schedule = []; 
                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
            } else {
                // 未皆伝：追い返す！（現在の探検タスクだけを消して、次の予定に進む）
                this.message = "ここから先は危険だ...\n（免許皆伝が必要）"; this.messageTimer = 120;
                if (this.schedule.length > 0 && this.schedule[0].type === 'explore') this.schedule.shift();
                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            }
            return;
        }
        // 普通の森や山なら元の探検処理をする
        if (typeof _origProcessExploration === 'function') {
            _origProcessExploration.call(this);
        }
    };
    
    const _origExecuteEnterAction = window.AICharacter.prototype.executeEnterAction;
    window.AICharacter.prototype.executeEnterAction = function() {
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
            this.actionState = 'idle';
            this.isIndoors = false;
            
            if (isMasterExplorer) {
                // 皆伝済み：予定を全消ししてダンジョンに突入！
                this.schedule = [];
                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
            } else {
                // 未皆伝：歩いてぶつかっただけなので、予定はそのままでOK。メッセージだけ出す
                this.message = "ここから先は危険だ...\n（免許皆伝が必要）"; this.messageTimer = 120;
            }
            return;
        }
        if (typeof _origExecuteEnterAction === 'function') {
            _origExecuteEnterAction.call(this);
        }
    };

    // aiPet(現在の主人公の実体) にも反映させる
    if (window.aiPet) {
        window.aiPet.processBuildingFinish = window.AICharacter.prototype.processBuildingFinish;
        window.aiPet.processExploration = window.AICharacter.prototype.processExploration;
        window.aiPet.executeEnterAction = window.AICharacter.prototype.executeEnterAction;
    }
}

// ==========================================
// 🩹 建築システムの最終パッチ（一括拡張ロジック搭載版）
// ==========================================
(function() {
    if (typeof window.AICharacter === 'undefined') return;

    const processBuildingFinishCore = function(task) {
        if (!task || !task.buildData || task._hasBeenBuilt) return;
        
        let bId = task.buildData.typeKey;

        // 修行中（isTrial）の場合はマップに建てず、インベントリにアイテムを入れる
        if (task.buildData.isTrial) {
            let d = task.buildData;
            if (!this.skills.building) this.skills.building = 1;
            
            if (d.isSuccess) {
                this.skills.building += 0.5;
                this.stats.mood += d.isGreatSuccess ? 15 : 5;
                this.message = d.isGreatSuccess ? `大成功！！ 芸術的な「${d.targetName}」が完成した！` : `製図成功！ ${d.targetName}ができた！`;
            } else {
                this.skills.building += 0.1;
                this.message = "計算ミス... わけのわからない設計図になっちゃった...";
            }
            
            this.inventory.push(d.targetId);

            if (this.apprentice && this.apprentice.activeQuest) {
                const desc = this.apprentice.activeQuest.desc;
                if (desc.includes('図面') || desc.includes('模型') || desc.includes('製図') || desc.includes('建築')) {
                    this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                    if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
                }
            }

            this.messageTimer = 150; this.visualAction = null; this.actionState = 'idle';
            if (typeof saveGameData === 'function') saveGameData();
            return; 
        }

        let bData = (typeof buildingCatalog !== 'undefined') ? buildingCatalog[bId] : null;
        
        // ==========================================
        // ★ ストレージ一括拡張ロジック（計算バグ完全修正版）
        // ==========================================
        let expandCount = 1; 
        
        if (task.buildData.isUpgrade) {
            let intel = this.stats.intel || 10;
            let power = this.stats.power || 10;
            
            // 賢さ30以上で発動
            if (intel >= 30) {
                let requiredCount = 1;
                let upgType = bId; 
                let tAsset = assets[task.buildData.targetUid];
                
                if (tAsset && tAsset.storage) {
                    if (upgType === 'warehouse' || upgType === 'freezer') {
                        // ★修正：手持ちアイテムの「総数」を正しく計算する
                        let targetItemsCount = 0;
                        const getItemData = (itemObj) => { let id = typeof itemObj === 'string' ? itemObj : itemObj.id; return (typeof window.itemCatalog !== 'undefined') ? window.itemCatalog[id] : null; };
                        
                        (this.inventory || []).forEach(i => {
                            let d = getItemData(i);
                            if (d) {
                                let isFood = ['food', 'ingredient', 'dish'].includes(d.type);
                                if (upgType === 'freezer' && isFood) targetItemsCount++;
                                if (upgType === 'warehouse' && !isFood) targetItemsCount++;
                            } else {
                                if (upgType === 'warehouse') targetItemsCount++; // 不明なものは倉庫行きとする
                            }
                        });
                        
                        let currentCap = tAsset.storage[upgType].capacity || 0;
                        let overflow = targetItemsCount - currentCap;
                        
                        // ★修正：あふれている分だけではなく、将来のために少し余裕を持たせる（賢さボーナス）
                        // 賢さが高いほど「ついでにもう少し広げておこう」と考える
                        let extraBuffer = Math.floor(intel / 50) * 10; 
                        
                        if (overflow > 0) {
                            requiredCount = Math.ceil((overflow + extraBuffer) / 10);
                        } else {
                            // 今はあふれていなくても、賢ければ予防的に拡張しておく
                            requiredCount = Math.ceil(extraBuffer / 10);
                        }
                    } else if (upgType === 'safe') {
                        let currentCap = tAsset.storage.safe.capacity || 0;
                        let overflow = this.gold - currentCap;
                        if (overflow > 0) {
                            requiredCount = Math.ceil(overflow / 50000); 
                        }
                    }
                    
                    // 活力による工事限界（活力30ごとに1回分[+10枠]拡張できる）
                    // 活力7900なら約260回分（2600枠）の限界パワーを持つ
                    let maxByPower = Math.max(1, Math.floor(power / 30));
                    expandCount = Math.min(requiredCount, maxByPower);
                    if (expandCount < 1) expandCount = 1;
                }
            }
        }

        // ==========================================
        // ★ 素材の消費処理
        // ==========================================
        if (!this.godMode && bData && bData.materials) {
            let myItems = {};
            (this.inventory || []).forEach(item => {
                let id = typeof item === 'string' ? item : item.id;
                myItems[id] = (myItems[id] || 0) + 1;
            });
            
            // 手持ちの素材で作れる最大回数を算出
            for (let mKey in bData.materials) {
                let reqOne = bData.materials[mKey];
                let has = myItems[mKey] || 0;
                let possibleTimes = Math.floor(has / reqOne);
                
                // 素材が足りない場合は、作れる分までに妥協する
                if (possibleTimes < expandCount) {
                    expandCount = possibleTimes;
                }
            }
            
            if (expandCount < 1) {
                this.message = "あれ？ 途中で素材を落としちゃったみたい..."; this.messageTimer = 120;
                return;
            }

            // 消費
            for (let mKey in bData.materials) {
                let totalReq = bData.materials[mKey] * expandCount;
                for (let i = 0; i < totalReq; i++) {
                    let idx = this.inventory.findIndex(item => {
                        let id = typeof item === 'string' ? item : item.id;
                        return id === mKey;
                    });
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
            }
            if (typeof updateStatUI === 'function') updateStatUI();
        }
        
        task._hasBeenBuilt = true;

        // ==========================================
        // ★ 拡張施設の場合の処理
        // ==========================================
        if (task.buildData.isUpgrade) {
            let tAsset = assets[task.buildData.targetUid];
            if (tAsset) {
                if (!tAsset.storage) tAsset.storage = { freezer: {level:0, capacity:0, items:[]}, warehouse: {level:0, capacity:0, items:[]}, safe: {level:0, capacity:0, gold:0} };
                let upgType = task.buildData.typeKey; 
                
                tAsset.storage[upgType].level += expandCount;
                let addedCapacity = 0;

                if (upgType === 'safe') {
                    addedCapacity = 50000 * expandCount;
                    tAsset.storage[upgType].capacity += addedCapacity; 
                } else {
                    addedCapacity = 10 * expandCount;
                    tAsset.storage[upgType].capacity += addedCapacity; 
                }

                // 拡張した回数に応じてメッセージを変える
                if (expandCount > 1) {
                    this.message = `一気に工事したよ！ ${task.buildData.name}の容量が +${window.formatLargeNumber(addedCapacity)} 増えた！`;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, `✨ 一括拡張(x${expandCount})`, "#00BCD4");
                } else {
                    this.message = `${task.buildData.name}の設置・拡張（Lv.${tAsset.storage[upgType].level}）が完了したよ！`;
                    if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 設備拡張！", "#00BCD4");
                }
                
                this.messageTimer = 180;
                if (typeof saveGameData === 'function') saveGameData();
            }
            return;
        }

        // 通常の建築処理
        let uid = 'build_' + bId + '_' + Date.now();

        // 橋の強制実体化データ
        if (bId === 'bridge') {
            window.assets[uid] = { type: 'bridge', name: '橋', img: 'field_6', sx: 183, sy: 1126, sw: 769, sh: 691, scale: 0.10000000000000007, dx: task.buildData.bestX, dy: task.buildData.bestY, durability: -1, maxDurability: -1 };
        } else {
            let vSrc = task.buildData.visualSource || {};
            window.assets[uid] = { type: bId, name: task.buildData.name, img: vSrc.img || 'field', sx: vSrc.sx || 0, sy: vSrc.sy || 0, dx: task.buildData.bestX, dy: task.buildData.bestY, sw: vSrc.sw || 50, sh: vSrc.sh || 50, scale: task.buildData.targetScale || 0.5, durability: task.buildData.maxDurability || -1, maxDurability: task.buildData.maxDurability || -1 };
        }

        if (bId === 'farm') { window.assets[uid].plantedCrop = null; window.assets[uid].growth = 0; window.assets[uid].waterLevel = 100; window.assets[uid].pestState = false; }

        this.message = `${task.buildData.name}が完成したよ！`; this.messageTimer = 180;
        if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 完成！", "#FFD700");
        if (typeof saveGameData === 'function') saveGameData();
    };

    window.AICharacter.prototype.processBuildingFinish = processBuildingFinishCore;
    if (window.aiPet) window.aiPet.processBuildingFinish = processBuildingFinishCore;

    // タイマーが0になったら確実に完成処理を呼ぶフック
    if (!window._ultimateUpdateHook) {
        window._ultimateUpdateHook = true;
        const origUpdate = window.AICharacter.prototype.update;
        const newUpdate = function(dt) {
            let task = this.schedule && this.schedule.length > 0 ? this.schedule[0] : null;
            let wasBuild = task && task.type === 'build';
            if (typeof origUpdate === 'function') origUpdate.call(this, dt);
            if (wasBuild && task && task.duration <= 0 && !task.aborted && !task._hasBeenBuilt) {
                if (typeof this.processBuildingFinish === 'function') this.processBuildingFinish(task);
            }
        };
        window.AICharacter.prototype.update = newUpdate;
        if (window.aiPet) window.aiPet.update = newUpdate;
    }
})();

// ==========================================
// ★ 追加：強くてニューゲーム専用「成人（悟り）イベント」の本体
// ==========================================
aiPet.checkAndTriggerAdulthood = function() {
    let masteredCount = 0;
    const jobKeys = ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'];
    if (this.apprentice && this.apprentice.rank) {
        jobKeys.forEach(j => { if (this.apprentice.rank[j] >= 10) masteredCount++; });
    }
    
    // 6種すべてを極めている（引継ぎで最初から全知全能）の場合のみ発動
    if (masteredCount >= 6 && typeof this.determineLifePath === 'function') {
        const chosenPath = this.determineLifePath();
        this.lifePath = chosenPath; 
        this.apprentice.lifePath = chosenPath; 
        
        this.schedule = []; // 現在の行動をキャンセルして立ち止まる
        
        // ★追加：予定を消すだけでなく、AIの体（ポーズや状態）も確実にリセットして直立させる！
        this.actionState = 'idle';
        this.visualAction = null;
        this.isIndoors = false;
        this.indoorTarget = null;
        this.idleTimer = 0; // 次の行動を起こすまでの時間をリセット
        
        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        
        this.message = "全てを極めた今、自分の夢のために生きよう！";
        this.messageTimer = 300;
        
        if (typeof window.showGameTutorial === 'function') {
            let taskNameStr = typeof getTaskName === 'function' ? getTaskName('life_' + chosenPath) : chosenPath;
            window.showGameTutorial(
                "👑 全知全能の悟り（成人）", 
                `20歳を迎えたAIは、前世からの記憶によりすでにこの世界の全ての道を極めていました。<br><br>これまでの育て方から、AIは自らの意思で残りの人生を<span style="color:#FFD700; font-weight:bold;">「${taskNameStr}」</span>に捧げることを決意したようです！`
            );
        }
    }
};

// ==========================================
// ★ 修正版：別コンテンツプレイ中の襲撃発生＆放置ダメージストップ
// ==========================================
(function() {
    // 1. 襲撃の発生をブロック（島画面にいる時だけ発生させる）
    window._originalTriggerEmergency_TimerFix = window._originalTriggerEmergency_TimerFix || window.triggerEmergency;
    window.triggerEmergency = function() {
        if (window.currentMode !== 'play' && window.currentMode !== 'grazing') return;
        
        window._originalTriggerEmergency_TimerFix();

        // 2. 襲撃発生後にセットされる「30秒ごとの施設破壊タイマー」をハイジャックし、
        // 別画面を開いている間はダメージ処理をスキップ（時間停止）させる
        if (window.DEFENSE_STATE && window.DEFENSE_STATE.emergencyTimer) {
            clearInterval(window.DEFENSE_STATE.emergencyTimer);
            
            window.DEFENSE_STATE.emergencyTimer = setInterval(() => {
                // ★ここが重要：ダンジョンや闘技場を開いている間はダメージを与えない
                if (window.currentMode !== 'play' && window.currentMode !== 'grazing') return;

                if (window.DEFENSE_STATE.isEmergency && !window.DEFENSE_STATE.isActive) {
                    let targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0 && f.type !== 'castle'); 
                    if (!targetFac) targetFac = window.DEFENSE_STATE.facilities.find(f => f.hp > 0);
                    
                    if (targetFac) {
                        targetFac.hp -= 50; 
                        let currentAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                        if (currentAssets[targetFac.id]) currentAssets[targetFac.id].hp = targetFac.hp;

                        if (typeof floatingTexts !== 'undefined') {
                            let pos = window.getGridPixelPos(targetFac.gridX, targetFac.gridY);
                            floatingTexts.push({ text: `-50`, x: pos.x, y: pos.y - 50, color: "#ff5252", life: 60, dy: -1 });
                        }
                        
                        if (targetFac.hp <= 0) {
                            if (targetFac.type === 'castle') {
                                clearInterval(window.DEFENSE_STATE.emergencyTimer);
                                let marquee = document.getElementById('emergency-marquee');
                                if(marquee) marquee.style.display = 'none'; 
                                // ★追加：襲撃BGMを停止
                                if (window.audioManager) { window.audioManager.stopBGM(); }
                                window.DEFENSE_STATE.isEmergency = false;
                                alert("防衛を放置したため、王城が陥落してしまいました..."); window.executeAbandon(); 
                            } else {
                                let delAssets = (typeof assets !== 'undefined') ? assets : (window.assets || {});
                                if (delAssets[targetFac.id]) delete delAssets[targetFac.id];
                            }
                        }
                    }
                }
            }, 30000); 
        }
    };
})();

// ==========================================
// ★ AIセーフティシステム（過労ストッパー ＆ スタック救出機能）
// ==========================================
(function() {
    // 1. 過労・餓死ストッパー（毎フレームの更新処理にフック）
    let patchUpdate = function(obj) {
        if (!obj || obj._isSafetyPatched) return;
        const _origUpdate = obj.update;
        
        obj.update = function() {
            // 元々のゲーム進行処理を実行
            _origUpdate.call(this);
            
            // ★体力が満腹度が尽きた場合、回復行動以外はすべて強制キャンセル！
            if (!this.godMode && this.schedule && this.schedule.length > 0) {
                let currentTask = this.schedule[0];
                let isRecovery = ['sleep', 'eat', 'rest', 'life_slowlife'].includes(currentTask.type);
                
                if (!isRecovery && (this.energy <= 0 || this.hunger <= 0)) {
                    this.message = "もうクタクタだ...動けない...";
                    this.messageTimer = 180;
                    this.schedule = []; // 積まれていた予定を全消去
                    this.actionState = 'idle';
                    this.visualAction = null;
                    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                }
            }
        };
        obj._isSafetyPatched = true;
    };

    // AIの設計図（Prototype）と、現在動いているAI（Instance）の両方に適用
    if (typeof window.AICharacter !== 'undefined') patchUpdate(window.AICharacter.prototype);
    if (window.aiPet) patchUpdate(window.aiPet);

    // 2. スタック（川の向こうなどに行こうとしてハマる現象）救出機能
    setInterval(() => {
        if (!window.aiPet) return;
        
        // 移動中のはずなのに、座標が変わっていないかを監視
        if (window.aiPet.actionState === 'moving' || window.aiPet.actionState === 'moving_to_enter') {
            let dx = Math.abs(window.aiPet.x - (window.aiPet._lastX || 0));
            let dy = Math.abs(window.aiPet.y - (window.aiPet._lastY || 0));
            
            // 1ピクセルも動いていない場合カウントアップ
            if (dx < 0.5 && dy < 0.5) {
                window.aiPet._stuckCount = (window.aiPet._stuckCount || 0) + 1;
                
                // 約3秒間（500ms × 6回）足踏みし続けたら強制キャンセルして諦める
                if (window.aiPet._stuckCount > 6) {
                    window.aiPet.message = "道がなくて、あそこには行けないみたい...";
                    window.aiPet.messageTimer = 150;
                    window.aiPet.schedule = [];
                    window.aiPet.actionState = 'idle';
                    window.aiPet.visualAction = null;
                    window.aiPet._stuckCount = 0;
                    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                }
            } else {
                window.aiPet._stuckCount = 0; // ちゃんと動けていればリセット
            }
            
            // 現在の座標を記録して次回比較する
            window.aiPet._lastX = window.aiPet.x;
            window.aiPet._lastY = window.aiPet.y;
        } else {
            window.aiPet._stuckCount = 0;
        }
    }, 500);
})();

// ==========================================
// ★ クエスト対話システム基盤データ
// ==========================================

// 師匠ごとの口調フレーバー（※システム的な数字や条件は語らない）
window.masterFlavor = {
    'explore': {
        offer: (qName) => `「次の試練は『${qName}』よ！ 過酷な自然を舐めないことね。準備ができたら出発しなさい！」`,
        report_ok: "「ふふ、なかなかやるじゃない！ 合格よ！」",
        report_ng: "「甘いわね。まだまだ条件を満たしていないわ！」"
    },
    'farming': {
        offer: (qName) => `「さあ、次は『${qName}』だよ。 大地の声に耳を澄ませて、じっくり取り組んでおいで。」`,
        report_ok: "「立派だねぇ。見事な成果だよ。合格！」",
        report_ng: "「焦っちゃだめだ。もう少し土と向き合ってみなさい。」"
    },
    'fishing': {
        offer: (qName) => `「おう、次はこれだ！課題『${qName}』！ 荒波に負けない根性を見せてみろ！ガッハッハ！」`,
        report_ok: "「でかした！ 立派なもんだぜ！合格！」",
        report_ng: "「ボウズか？ まだまだ修行が足りねえな！」"
    },
    'cooking': {
        offer: (qName) => `「よし、次の修行だ！ 課題『${qName}』！ 料理の魂を理解し、最高の味を追求してこい！」`,
        report_ok: "「素晴らしい！ お前の料理からソウルを感じたぞ！合格だ！」",
        report_ng: "「ダメだな！ まだ条件を満たしていない！ 出直してこい！」"
    },
    'smithing': {
        offer: (qName) => `「……次だ。課題は『${qName}』。 ……鉄の声を聴き、己の手で形にしてみせろ。」`,
        report_ok: "「……悪くない。合格だ。」",
        report_ng: "「……鉄が泣いている。まだ足りない。」"
    },
    'building': {
        offer: (qName) => `「次の設計だ。課題『${qName}』。 完璧な計算と構造美を私に示してくれ。」`,
        report_ok: "「計算通りだな。美しい仕上がりだ。合格！」",
        report_ng: "「設計図からやり直せ。まだ完成には程遠いぞ。」"
    }
};

// AIペットの心の声（クエスト内容を短く要約する翻訳機）
window.getQuestThought = function(qData) {
    const d = qData.desc || "";
    // パターンA：ステータス（能力）の要求
    if (d.includes("上げよう") || d.includes("体力") || d.includes("賢さ") || d.includes("美しさ") || d.includes("素早さ")) {
        return "（能力を鍛える修行だね。今のステータスを確認してみよう。）";
    } 
    // パターンB：アイテムの収集・納品
    else if (d.includes("持ってこよう") || d.includes("集めてこよう")) {
        return "（特定のアイテムが必要みたいだ。詳しくは課題リストを見てみよう。）";
    } 
    // パターンC：特定アクションの反復
    else if (d.includes("行おう")) {
        return "（何度も実践して経験を積もう。内容は課題リストにあるよ。）";
    } 
    // その他
    else {
        return "（新しい課題だね！ 右のリストで詳細を確認しよう！）";
    }
};