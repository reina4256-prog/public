// ai_core.js : AIのコアロジック (Fixed Version v30 - Absolute Evolution Safety)

if (typeof window.aiPet === 'undefined') {
    window.aiPet = {};
}

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

function getTaskName(type) {
    if(type==='study') return "勉強"; if(type==='train') return "筋トレ"; if(type==='run') return "ランニング";
    if(type==='rest' || type==='sleep') return "睡眠"; // ★修正：sleepも睡眠に変換！
    if(type==='explore') return "探検"; if(type==='eat') return "食事"; if(type==='project') return "計画実行";
    if(type==='fish') return "釣り"; 
    if(type==='cook') return "料理"; 
    if(type==='smith') return "鍛冶"; 
    // ★追加：表示名を「建築」にする
    if(type==='build') return "建築";
    if(type==='apprentice_exam') return "入門試験"; // ★修正
    if(type==='master_quest') return "課題の実行"; // ★修正
    if(type==='visit_master') return "報告に向かっている";

    // ★追加：余生ルートの専用アクション名
    if (type === 'life_monument') return "大事業（モニュメント建造）";
    if (type === 'life_author') return "大事業（秘伝書の執筆）";
    if (type === 'life_guardian') return "村のパトロール";
    if (type === 'life_seeker') return "限界突破の修練";
    if (type === 'life_mentor') return "後進の育成";
    if (type === 'life_slowlife') return "スローライフを満喫";

    return type;
}

// ==========================================
// ★ 追加：師匠クエストの定義データ
// ==========================================
aiPet.getMasterQuestData = function(mType, rank) {
    const quests = {
        'explore': { // 冒険家のクエスト（ランク1〜9）
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
                desc: "森や山を「探検」して、木材（wood）を5つ、石（stone）を5つ集めてこよう。", 
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
                desc: "中層や深層でしか採れない、良質な木材（high_wood）を3つ、硬い石（high_stone）を3つ集めてこよう。", 
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
        'farming': { // 農家のクエスト（ランク1〜9）
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
        'fishing': { // 漁師のクエスト（ランク1〜9）
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
        'cooking': { // 料理人のクエスト（ランク1〜9）
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
                desc: "黒焦げを避け、成功した「普通の試作料理」を3つ持ってこよう。（※食べられる前に報告だ！）", 
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
                desc: "大成功でのみ作れる「究極の試作料理」を3つ持ってこよう。（※絶対に食べられるな！）", 
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
        'smithing': { // 鍛冶師のクエスト（ランク1〜9）
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
                desc: "種類は問わない。作った練習用装備（なまくら剣など）を3つ持ってこよう。", 
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
                desc: "大成功でのみ作れる芸術品（黄金の鍋など）を合計3つ持ってこよう。", 
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
        'building': { // 建築士のクエスト（ランク1〜9）
            1: { 
                name: "構造計算の基礎", 
                desc: "まずは図面を引く知識がいる。賢さを開始時より＋15上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 15; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての製図", 
                desc: "師匠の元で「建築（製図）」を5回行おう。", 
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
                desc: "落書きを避け、成功した「練習用の図面」を3つ持ってこよう。", 
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
                desc: "大成功でのみ作れる「精巧な建築模型」を3つ持ってこよう。", 
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
    else if (taskType === 'master_quest' || taskType === 'visit_master') {
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
                
                // ※グローバルから確実にとるため window.aiPet に変更
                const dist = Math.hypot(window.aiPet.x - cx, window.aiPet.y - cy);
                
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
    if (this.hunger >= 95) { this.message = "もうお腹いっぱい！"; return false; }
    let bestFood = null; let bestIdx = -1; let maxPriority = 0; let hasFood = false;

    this.inventory.forEach((key, idx) => {
        const item = itemCatalog[key]; if (!item) return;
        if (!['dish', 'food', 'ingredient'].includes(item.type)) return;
        hasFood = true;

        let potentialGain = 0; if (item.stats && typeof item.stats.hunger !== 'undefined') { potentialGain = item.stats.hunger; } else { if (item.type === 'dish') potentialGain = 20; else potentialGain = 10; }
        if (this.hunger + potentialGain > 100) { return; }
        
        let priority = 0; if (item.type === 'dish') priority = 3; else if (item.type === 'food') priority = 2; else if (item.type === 'ingredient') priority = 1;
        if (priority > maxPriority) { maxPriority = priority; bestFood = item; bestIdx = idx; }
    });
    
    if (!hasFood) { this.message = "食べるものがない..."; return false; }

    if (bestFood && bestIdx !== -1) {
        this.inventory.splice(bestIdx, 1);
        let gainEnergy = 0; let gainHunger = 0;
        
        const tData = this.getTraitData();
        const bIntel = (tData.statBonus && tData.statBonus.intel) ? tData.statBonus.intel : 1.0;
        const bPower = (tData.statBonus && tData.statBonus.power) ? tData.statBonus.power : 1.0;
        const bMood = (tData.statBonus && tData.statBonus.mood) ? tData.statBonus.mood : 1.0;

        if (bestFood.stats) {
            if (bestFood.stats.energy) gainEnergy += bestFood.stats.energy; gainHunger += (bestFood.stats.hunger || 20);
            if (bestFood.stats.power) this.stats.power += bestFood.stats.power * bPower; 
            if (bestFood.stats.intel) this.stats.intel += bestFood.stats.intel * bIntel; 
            if (bestFood.stats.mood) this.stats.mood += bestFood.stats.mood * bMood;
        } else { gainHunger += 10; gainEnergy += 5; }
        
        let action = "食べた";
        if (bestFood.type === 'dish') { this.visualAction = 'eat_dish'; action = "食べた"; } 
        else { this.visualAction = 'eat_raw'; action = "丸かじりした"; }
        
        this.visualActionTimer = 60;
        this.energy = Math.min(100, this.energy + gainEnergy); this.hunger = Math.min(100, this.hunger + gainHunger);
        this.message = `${bestFood.name}を${action}！`; 
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) { openInventoryPanel(); }
        }
        return true;
    } else { 
        if (this.hunger >= 90) { this.message = "腹八分目にしておこう"; } else { this.message = "ちょうどいい食事がなかった..."; } 
        return false; 
    }
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

// aiPet.processBuildingStart = function(task) {
//     let bId = task.targetBuilding;
//     if (!bId) {
//         let buildKeys = ['hut', 'farm'];
//         if (typeof buildingCatalog !== 'undefined') {
//             const level = this.skills && this.skills.building ? this.skills.building : 1;
//             buildKeys = Object.keys(buildingCatalog).filter(k => buildingCatalog[k].reqBuildLevel <= level && k !== 'castle' && k !== 'casino');
//         }
//         bId = buildKeys[Math.floor(Math.random() * buildKeys.length)];
//     }

//     const bData = (typeof buildingCatalog !== 'undefined' && buildingCatalog[bId]) ? buildingCatalog[bId] : null;
//     if (!bData) { this.message = "建て方がわからない..."; this.messageTimer = 120; return false; }

//     if (this.apprentice && this.apprentice.currentMaster === 'building') {
//         if (!this.inventory) this.inventory = [];
//         if (bData.materials) {
//             for (let mKey in bData.materials) {
//                 let req = bData.materials[mKey];
//                 while (this.inventory.filter(i => i === mKey).length < req) { this.inventory.push(mKey); }
//             }
//         }
//     }

//     // ★修正：事前チェックのみ行う（ここではまだ消費しない！）
//     let myItems = {};
//     if (this.inventory) this.inventory.forEach(k => myItems[k] = (myItems[k] || 0) + 1);
//     let canBuild = true;
//     if (bData.materials) {
//         for (let mKey in bData.materials) {
//             if ((myItems[mKey] || 0) < bData.materials[mKey]) canBuild = false;
//         }
//     }
//     if (!canBuild) {
//         this.message = `${bData.name}を作る素材が足りないみたい...`; this.messageTimer = 120; return false;
//     }

//     // 建築先を探す
//     let tx = this.x; let ty = this.y;
//     let walkX = this.x; let walkY = this.y; 
//     let foundSpot = false;

//     if (bId === 'bridge') {
//         let existingBridges = [];
//         for (let k in assets) { if (assets[k].type === 'bridge') existingBridges.push(assets[k]); }
        
//         if (existingBridges.length > 0) {
//             // すでにある橋の隣に架ける
//             let base = existingBridges[existingBridges.length - 1]; 
//             tx = base.dx + (base.sw * (base.scale || 0.5)); 
//             ty = base.dy;
//             walkX = base.dx; // 歩くのはすでにある橋の上
//             walkY = base.dy; 
//             foundSpot = true;
//         } else {
//             // 1本目の橋を架ける川を探す
//             for (let i = 0; i < 100; i++) {
//                 let checkX = 100 + Math.random() * 600;
//                 let checkY = 100 + Math.random() * 300;
//                 if (typeof this.isPointOnWater === 'function' && this.isPointOnWater(checkX, checkY)) {
//                     tx = checkX; ty = checkY; 
//                     walkX = checkX - 40; walkY = checkY; // 手前の陸地に立つ
//                     foundSpot = true;
//                     break;
//                 }
//             }
//         }
//         if (!foundSpot) { this.message = "川が見つからないよ..."; this.messageTimer = 120; return false; }
//     } else {
//         // 陸地の建物
//         for (let i = 0; i < 30; i++) {
//             let checkX = this.x + (Math.random() - 0.5) * 200; let checkY = this.y + (Math.random() - 0.5) * 200;
//             checkX = Math.max(50, Math.min(750, checkX)); checkY = Math.max(50, Math.min(430, checkY));
//             if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(checkX, checkY)) {
//                 tx = checkX; ty = checkY;
//                 walkX = checkX; walkY = checkY; 
//                 foundSpot = true; break;
//             }
//         }
//     }

//     this.message = `${bData.name}を建てる場所へ行くよ！`; this.messageTimer = 120;
//     let vSrc = (typeof catalog !== 'undefined' && catalog[bId]) ? catalog[bId] : {img: bId, sw: 50, sh: 50, sx: 0, sy: 0, scale: 0.5};

//     task.buildData = {
//         typeKey: bId, name: bData.name,
//         visualSource: { img: vSrc.img || vSrc.image || 'field', sx: vSrc.sx || 0, sy: vSrc.sy || 0, sw: vSrc.sw || 50, sh: vSrc.sh || 50 },
//         targetScale: vSrc.scale || 0.5,
//         bestX: tx, bestY: ty,
//         walkX: walkX, walkY: walkY,
//         targetFlip: false, maxDurability: bData.maxDurability || -1
//     };
    
//     task._hasBeenBuilt = false; // 建設済みフラグをリセット
//     return true;
// };

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

                // ★ 追加：見事釣り上げた瞬間にクエストの回数をカウント！
                if (this.apprentice && this.apprentice.activeQuest && this.apprentice.activeQuest.desc.includes("釣り")) {
                    this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
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

                // ★ 追加：失敗（逃げられた）しても「釣りをした回数」にはカウント！
                if (this.apprentice && this.apprentice.activeQuest && this.apprentice.activeQuest.desc.includes("釣り")) {
                    this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
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
            if (!hasRod && typeof window.clearSchedule === 'function') {
                window.clearSchedule(); 
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
    
    // 志願回数を増やす
    this.apprentice.attempts[masterType] = attempts + 1;
    
    // 現在の予定をクリアして試験タスクを入れる
    this.schedule = [];
    this.schedule.push({
        type: 'apprentice_exam',
        masterType: masterType,
        duration: 15, // 約5秒間の試験時間
        maxDuration: 15
    });
    
    this.message = "弟子入り試験に挑戦します！";
    this.messageTimer = 120;
    
    if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
    return true;
};

aiPet.processApprenticeExamFinish = function(task) {
    const mType = task.masterType;
    let score = 0; let passScore = 50; 
    const words = this.apprentice.learnedWords;
    if (mType === 'farming') { if (words.includes("農業") || words.includes("水やり")) score += 20; score += this.stats.power; }
    else if (mType === 'cooking') { if (words.includes("料理") || words.includes("食事")) score += 20; score += this.stats.intel; }
    else if (mType === 'smithing') { if (words.includes("鍛冶")) score += 30; score += (this.stats.power + this.stats.intel) / 2; }
    else if (mType === 'explore') { if (words.includes("探検")) score += 30; score += this.stats.power; }
    else if (mType === 'fishing') { if (words.includes("釣り")) score += 30; score += (this.stats.intel + this.stats.power) / 2; }
    else if (mType === 'building') { if (words.includes("建築") || words.includes("木")) score += 30; score += this.stats.intel; }
    
    score += (this.stats.mood - 50) * 0.2;
    
    if (score >= passScore) {
        if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, "「見事だ！今日からお前は私の弟子だ！」", 'exam_pass');
    } else {
        let attempts = this.apprentice.attempts[mType] || 0;
        if (attempts >= 3) {
            let retireMsg = "";
            if (mType === 'explore') retireMsg = "冒険家「君には才能がない。もう会うことはないだろう...」";
            else if (mType === 'farming') retireMsg = "農家「畑を引き払って別の村へ行くよ。達者でな」";
            else if (mType === 'fishing') retireMsg = "漁師「この周辺ではもう魚はとれそうにない。潮時だな」";
            else if (mType === 'cooking') retireMsg = "料理人「このあたりでは集客が見込めない。店をたたむよ」";
            else if (mType === 'smithing') retireMsg = "鍛冶師「自分の技術はもっと色んな人に伝えたいから、旅に出るよ」";
            else if (mType === 'building') retireMsg = "建築士「このあたりの木の選定が終わったから、次の森へ行くよ」";
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, retireMsg, 'retire');
        } else {
            // ==========================================
            // ★修正：師匠ごとの具体的なヒントメッセージを作成
            // ==========================================
            let hintMsg = "";
            if (mType === 'farming') hintMsg = "「まだまだだな。土を耕すための『活力』と、『農業』への関心を高めてきなさい。」";
            else if (mType === 'cooking') hintMsg = "「レシピを理解する『賢さ』と、『料理』に対する熱意が足りないわね。出直してきな！」";
            else if (mType === 'smithing') hintMsg = "「熱に耐える『活力』や『賢さ』、そして何より『鍛冶』への興味を見せてみろ。」";
            else if (mType === 'explore') hintMsg = "「未知を踏破する『活力』と、『探検』したいという強い意思が足りないな。」";
            else if (mType === 'fishing') hintMsg = "「魚との駆け引きに必要な『賢さ』や『活力』、そして『釣り』への執念が足りんぞ。」";
            else if (mType === 'building') hintMsg = "「図面を読む『賢さ』と、『建築』への探求心が不可欠だ。勉強してきなさい。」";
            
            if (typeof window.openEncounterUI === 'function') window.openEncounterUI(mType, hintMsg, 'exam_fail');
        }
    }
};

// 使わなくなった関数は空にしておく
aiPet.assignApprenticeQuest = function() {};
aiPet.checkExcommunication = function() {};

// ==========================================
// ★ 修正：空気を読むランダムエンカウント（鍛冶師パラドックス解消版）
// ==========================================
aiPet.checkEncounter = function() {
    if (this.isHelper || window.isGamePaused) return;
    
    // 新生児ガード（5秒間）
    if (this.age === 0 && (!this._birthGuardTimer || this._birthGuardTimer < 300)) {
        this._birthGuardTimer = (this._birthGuardTimer || 0) + 1;
        return; 
    }

    if (!this.apprentice || !this.apprentice.learnedWords || this.apprentice.learnedWords.length < 3) return;
    
    // 1. 現在弟子入り中なら他の師匠には会わない
    // 2. 「今世」ですでにいずれかの免許皆伝となり、余生を過ごしているなら会わない
    if (this.apprentice.currentMaster || this.apprentice.isGraduated) return;

    // ==========================================
    // ★ 修正：睡眠・野宿中だけはスケジュールがあってもエンカウントを許可する！
    // ==========================================
    if (this.schedule && this.schedule.length > 0) {
        if (!['camping', 'sleeping', 'rest'].includes(this.actionState)) {
            return; // 睡眠・野宿以外の作業中なら邪魔しない
        }
    }
    if (['apprentice_training', 'inside', 'entering'].includes(this.actionState)) return;

    this.apprentice.encounterTimer = (this.apprentice.encounterTimer || 0) + 1;
    if (this.apprentice.encounterTimer < 200) return;

    // --- 抽選フェーズ ---
    let candidates = [];
    
    // 個別の師匠ごとに「過去の世代含めて極めているか」を判定
    const isAlreadyMastered = (mType) => {
        if (this.apprentice.retired && this.apprentice.retired[mType] === true) return true;
        if (this.apprentice.retiredList && this.apprentice.retiredList.includes(mType)) return true;
        if (this.apprentice.rank && this.apprentice.rank[mType] >= 10) return true;
        return false;
    };

    const getAttempts = (mType) => this.apprentice.attempts && this.apprentice.attempts[mType] ? this.apprentice.attempts[mType] : 0;

    if (['camping', 'sleeping', 'rest'].includes(this.actionState)) {
        if (!isAlreadyMastered('smithing') && getAttempts('smithing') < 3) candidates.push('smithing');
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
                if (a.type === 'restaurant' && a.isMobile) nearFlags.cooking = true; 
            }
        }

        // 過去の世代でまだ皆伝していない（ランク10未満の）師匠だけが候補に入る
        if (nearFlags.explore && !isAlreadyMastered('explore') && getAttempts('explore') < 3) candidates.push('explore');
        if (nearFlags.building && !isAlreadyMastered('building') && getAttempts('building') < 3) candidates.push('building');
        if (nearFlags.fishing && !isAlreadyMastered('fishing') && getAttempts('fishing') < 3) candidates.push('fishing');
        if (nearFlags.farming && !isAlreadyMastered('farming') && getAttempts('farming') < 3) candidates.push('farming');
        if (nearFlags.cooking && !isAlreadyMastered('cooking') && getAttempts('cooking') < 3) candidates.push('cooking');
    }

    if (candidates.length > 0) {
        if (Math.random() < 0.3) { 
            this.apprentice.encounterTimer = 0;
            const metType = candidates[Math.floor(Math.random() * candidates.length)];
            
            this.message = "（誰かの気配がする...！）";
            this.messageTimer = 120;
            let encounterMsg = "";
            if (metType === 'explore') encounterMsg = "「おや、こんな所で人に会うとは...」";
            else if (metType === 'farming') encounterMsg = "「ほっほっ、土いじりに興味があるのかね？」";
            else if (metType === 'fishing') encounterMsg = "「坊主、魚の釣り方を教えてやろうか？」";
            else if (metType === 'cooking') encounterMsg = "「いらっしゃい！私の料理の腕前、見ていく？」";
            else if (metType === 'smithing') encounterMsg = "「野宿か。火の扱いなら私が教えてやろう」";
            else if (metType === 'building') encounterMsg = "「良い木材だ...ん？君も建築に興味があるのか？」";
            
            setTimeout(() => { if (typeof window.openEncounterUI === 'function') window.openEncounterUI(metType, encounterMsg, 'encounter_intro'); }, 1000);
            if (metType === 'cooking') { for (let k in assets) { if (assets[k].type === 'restaurant' && assets[k].isMobile) { delete assets[k]; break; } } }
        }
    }
};

aiPet.processApprenticeQuestFinish = function(task) {
    if (task.aborted) {
        this.apprentice.failCount = (this.apprentice.failCount || 0) + 1;
        this.apprentice.pendingReport = 'fail'; // 失敗報告待ち状態にする
        this.message = "課題を途中でやめた...報告に行かなきゃ..."; // 修正
        return;
    }

    const mType = task.masterType; let successRate = 0.5; 
    if (mType === 'farming') successRate += (this.stats.power * 0.01) + (this.apprentice.learnedWords.includes("農業") ? 0.2 : 0);
    else if (mType === 'cooking') successRate += (this.stats.intel * 0.01) + (this.apprentice.learnedWords.includes("料理") ? 0.2 : 0);
    else if (mType === 'smithing') successRate += (this.stats.power * 0.005 + this.stats.intel * 0.005) + (this.apprentice.learnedWords.includes("鍛冶") ? 0.2 : 0);

    if (Math.random() < successRate) {
        this.apprentice.successCount = (this.apprentice.successCount || 0) + 1;
        this.apprentice.pendingReport = 'success'; // 成功報告待ち状態
        this.message = "課題達成！報告に行こう！"; // 修正
    } else {
        this.apprentice.failCount = (this.apprentice.failCount || 0) + 1;
        this.apprentice.pendingReport = 'fail'; // 失敗報告待ち状態
        this.message = "失敗しちゃった...報告に行かなきゃ..."; // 修正
    }
    this.apprentice.inventory = []; // 支給品はここで回収
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
        // ★修正: 0歳の時にタイマーを強制リセットしてしまうバグの行を削除
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
        for (let uid in assets) {
            const a = assets[uid];
            if (a.type === 'farm' && a.plantedCrop && a.growth < 100) {
                if (a.waterLevel === undefined) a.waterLevel = 100;
                if (a.pestState === undefined) a.pestState = false;
                if (a.pestTimer === undefined) a.pestTimer = 0;
                if (a.careCount === undefined) a.careCount = 0;
                if (a.isDead === undefined) a.isDead = false;
                if (a.isEaten === undefined) a.isEaten = false;
                if (a.isDead || a.isEaten) continue; 
                const isFarmingQuestActive = (this.apprentice && this.apprentice.currentMaster === 'farming' && this.apprentice.activeQuest);
                if (this.weather === 'rain' || this.weather === 'thunder' || isFarmingQuestActive) a.waterLevel = 100;
                else { a.waterLevel -= 2; if (a.waterLevel <= 0) a.isDead = true; }
                a.growth += 0.5; if (a.growth > 100) a.growth = 100;
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
                for (let i = 0; i < tempInv.length; i++) {
                    let item = tempInv[i];
                    if (!item) continue;
                    let match = false;
                    if (req === 'veg') match = ['carrot', 'tomato', 'pepper', '七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'berry', 'イチゴ', '春の七草', '野イチゴ'].some(k => item.includes(k));
                    else if (req === 'meat') match = ['meat', '肉', 'chicken', 'beef'].some(k => item.includes(k));
                    else if (req === 'water') match = ['water', '水'].some(k => item.includes(k));
                    else if (req === 'fish') match = ['fish', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ'].some(k => item.includes(k));
                    else if (req === 'any_food') match = ['七草', 'キノコ', 'ニンジン', 'ピーマン', 'トマト', 'コイ', 'サケ', 'ザリガニ', 'バス', 'メダカ', 'ワカサギ', 'イワシ', 'マグロ', 'ダイ', 'イカ', 'サンマ', 'イチゴ', '春の七草', '野イチゴ'].some(k => item.includes(k));
                    else match = item.includes(req);
                    if (match) { foundIdx = i; break; }
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
        myShop = this.indoorTarget;
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
                this.inventory.forEach(i => {
                    if (knownRecipes.includes(i)) {
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
                                let count = this.inventory.filter(i => i === r).length;
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
                            consumedIds.forEach(id => { requiredCounts[id] = (requiredCounts[id] || 0) + 1; });
                            for (let id in requiredCounts) {
                                let currentTotal = (this.inventory || []).filter(item => item === id).length;
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
            const eff = getActionEfficiency(task.type).rate;
            
            // ★完全修正：特性（消費率）をここで取得し、0の場合は絶対に1.0に上書きさせない！
            const tData = typeof this.getTraitData === 'function' ? this.getTraitData() : {};
            const consumeRate = tData.consumption !== undefined ? tData.consumption : 1.0; 
            const bIntel = tData.statBonus?.intel || 1.0;
            const bPower = tData.statBonus?.power || 1.0;

            if (!task._started) {
                const instantTasks = ['visit_master', 'apprentice_exam', 'master_quest'];
                if (instantTasks.includes(task.type)) { task.duration = 1; } 
                else if (!task.duration || task.duration <= 0) { task.duration = 60; }
                task.maxDuration = task.duration;
                
                if (task.type === 'explore') {
                    task.duration = 60; task.maxDuration = 60;
                    let targets = Object.values(assets).filter(a => a.type === 'nature' || a.type === 'building' || a.type === 'skull' || a.type === 'crystal');
                    let isDungeon = (a) => a.type === 'skull' || a.type === 'crystal' || (a.name && (a.name.includes('スカル') || a.name.includes('クリスタル') || a.name.includes('迷宮') || a.name.includes('ダンジョン')));
                    
                    // ★追加: 冒険家の免許皆伝(ランク10)がないとダンジョンを候補から除外する！
                    let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
                    
                    let dungeons = isMasterExplorer ? targets.filter(isDungeon) : [];
                    let others = targets.filter(a => !isDungeon(a));
                    let finalTarget = null;
                    
                    if (dungeons.length > 0 && Math.random() < 0.7) finalTarget = dungeons[Math.floor(Math.random() * dungeons.length)];
                    else if (others.length > 0) finalTarget = others[Math.floor(Math.random() * others.length)];
                    else if (dungeons.length > 0) finalTarget = dungeons[Math.floor(Math.random() * dungeons.length)];
                    
                    if (finalTarget) this.startBuildingInteraction(finalTarget); else { task.duration = 0; task.aborted = true; }
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
                else {
                    const facility = task.type.startsWith('shop_') ? assets[task.buildingId] : findFacilityForTask(task.type, task.masterType);
                    if (facility) {
                        if (this.isIndoors && (this.indoorTarget === facility || task.type.startsWith('shop_'))) this.actionState = 'apprentice_training';
                        else this.startBuildingInteraction(facility);
                    } else { this.actionState = 'camping'; }
                }
                task._started = true;
            }

            const isActing = (this.actionState === 'camping' || this.actionState === 'studying' || this.actionState === 'training' || this.actionState === 'sleeping' || this.actionState === 'eating' || this.actionState === 'fishing' || this.actionState === 'smithing' || this.actionState === 'building' || this.isIndoors || this.actionState === 'apprentice_training');

            if (isActing) {
                const fastTasks = ['cook', 'smith', 'shop_work', 'shop_research', 'auto_trade']; 
                // ★修正：探検（explore）を例外扱いから外し、他の筋トレ等と同じ「時間をかけるタスク（SlowTask）」にする！
                const isSlowTask = !fastTasks.includes(task.type);

                if (isSlowTask && !window.isFastForwardLife && !isOneMinutePassed) {
                    if (task.type === 'life_author' || task.type === 'writing' || task.type === 'study') { this.visualAction = 'study'; } 
                    else if (task.type === 'eat') { this.actionState = this.isIndoors ? 'inside' : 'eating'; this.visualAction = 'eat_raw'; } 
                    else if (task.type === 'cook' || task.type === 'shop_work' || task.type === 'smith') { this.visualAction = (myShop?.type === 'smith' || task.type === 'smith') ? 'smith' : 'cook'; }
                    else if (task.type === 'fish') {
                        this.visualAction = 'fish'; this.actionState = 'fishing';
                        if (typeof this.processFishingFrame === 'function') this.processFishingFrame();
                    }
                    // ★追加：探検中も毎フレームアニメーション状態を維持する（時間が経過するのを待つ）
                    else if (task.type === 'explore') {
                        if (this.actionState === 'inside' || this.isIndoors) { 
                            this.visualAction = 'move'; 
                        } else { 
                            this.actionState = 'inside'; this.isIndoors = true; 
                        }
                    }
                } else {
                    if (task.type !== 'explore') {
                        task.duration--;
                        if (this.activeMonuments) {
                            if (this.activeMonuments.some(m => m.stat === 'power') && task.type === 'train' && task.duration > 1) task.duration = 1;
                            if (this.activeMonuments.some(m => m.stat === 'intel') && (task.type === 'study' || task.type === 'writing' || task.type === 'life_author') && task.duration > 1) task.duration = 1;
                            if (this.activeMonuments.some(m => m.stat === 'speed') && task.type === 'run' && task.duration > 1) task.duration = 1;
                        }
                    }

                    if (task.type === 'study') { this.actionState = this.isIndoors ? 'inside' : 'studying'; this.visualAction = 'study'; this.stats.intel += 0.1 * eff * bIntel; }
                    else if (task.type === 'train') { this.actionState = this.isIndoors ? 'inside' : 'training'; this.visualAction = 'train'; this.stats.power += 0.1 * eff * bPower; }
                    else if (task.type === 'run') { this.actionState = this.isIndoors ? 'inside' : 'training'; this.visualAction = 'move'; this.stats.speed += 0.1 * eff * bPower; }
                    else if (task.type === 'rest' || task.type === 'sleep') { 
                        this.actionState = this.isIndoors ? 'inside' : 'sleeping'; this.visualAction = 'sleep'; this.energy += 1.0 * eff;
                        if (this.energy >= 90 && this.hunger >= 90) {
                            this.stats.beauty += 0.1 * eff;
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
                        if (this.hunger < 100) this.consumeFood();
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
                }
            }

            const isRecoveryTask = ['rest', 'sleep', 'eat'].includes(task.type);
            const isEnergyOut = !this.godMode && this.energy <= 0 && !isRecoveryTask;
            const isHungerOut = !this.godMode && this.hunger <= 0 && !isRecoveryTask;

            if (task.duration <= 0 || isEnergyOut || isHungerOut) {
                const isShopTask = (task.type === 'shop_work' || task.type === 'shop_research');
                const waitingExit = !isShopTask && task._started && (this.isIndoors || this.actionState === 'exiting');

                if (!waitingExit) {
                    if (task.duration <= 0 && !task.aborted) {
                        if (task.type === 'build' && typeof this.processBuildingFinish === 'function') this.processBuildingFinish(task);
                        if (task.type.startsWith('life_') && typeof this.processLifePathFinish === 'function') this.processLifePathFinish(task);

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
                        const taskToKeyword = { 'study':'勉強','train':'筋トレ','sleep':'睡眠','rest':'休息','eat':'食事','cook':'料理','smith':'鍛冶','build':'建築','fish':'釣り','explore':'探検' };
                        const keyword = taskToKeyword[task.type];
                        if (keyword && this.apprentice?.activeQuest?.desc.includes(keyword)) { this.apprentice.qVal = (this.apprentice.qVal || 0) + 1; if(!window.isCatchingUp) window.updateQuestHUD?.(); }
                        if (typeof window.progressDailyQuest === 'function') window.progressDailyQuest(task.type);
                    }
                    this.schedule.shift(); 
                    if (!window.isCatchingUp) window.updateScheduleList?.(); 
                    this.visualAction = null;
                    
                    if (isShopTask) { this.actionState = 'inside'; this.exploreTimer = 0; } 
                    else { this.indoorTarget = null; this.isIndoors = false; this.actionState = 'idle'; }
                } else if (this.isIndoors) { 
                    this.actionState = 'exiting'; this.isIndoors = false; 
                }
            }

            // ★完全修正：タスク実行中（動いている最中）の消費。消費率(consumeRate)が0より大きい場合のみ減る！
            if (currentMode === 'play' && !this.godMode && consumeRate > 0) {
                if (!['sleep', 'rest', 'eat', 'life_slowlife'].includes(task.type)) {
                    let drainMult = ['train', 'build', 'smith', 'run'].includes(task.type) ? 1.5 : 1.0;
                    this.energy -= 0.03 * consumeRate * drainMult;
                    this.hunger -= 0.03 * consumeRate * drainMult;
                    // ★追加：労働（タスク実行）による機嫌の低下（少しずつ）
                    this.stats.mood -= 0.02 * consumeRate;
                } else if (['sleep', 'rest', 'life_slowlife'].includes(task.type)) {
                    // ★追加：休息による機嫌の回復
                    this.stats.mood += 0.05 * consumeRate;
                }
            }

        } else {
            const activeStates = ['camping', 'studying', 'training', 'sleeping', 'eating', 'fishing', 'smithing', 'building', 'apprentice_training'];
            if (activeStates.includes(this.actionState)) { this.actionState = 'idle'; this.visualAction = null; }
            
            // ★完全修正：暇なとき（立ち止まっている時）の消費も、消費率(consumeRate)を掛ける！
            const tData = typeof this.getTraitData === 'function' ? this.getTraitData() : {};
            const idleConsumeRate = tData.consumption !== undefined ? tData.consumption : 1.0;
            if (currentMode === 'play' && !this.godMode && idleConsumeRate > 0) { 
                this.energy -= 0.02 * idleConsumeRate; 
                this.hunger -= 0.02 * idleConsumeRate; 
                
                // ★追加：放置中の機嫌の自然回復（自由気ままな時間）
                this.stats.mood += 0.01 * idleConsumeRate;
            }
        }
    }
    
    this.energy = Math.max(0, Math.min(100, this.energy)); this.hunger = Math.max(0, Math.min(100, this.hunger));
    
    // ★追加：空腹・疲労による強烈なストレス（機嫌の減少）と闇落ちカウンターの増加
    if (currentMode === 'play' && !this.godMode) {
        // ★修正：睡眠中・食事中・休憩中など「回復行動をしている最中」はペナルティを免除する！
        let isHealing = ['sleep', 'sleeping', 'rest', 'eat', 'eating', 'life_slowlife'].includes(this.actionState) || 
                        (this.currentTask && ['sleep', 'rest', 'eat', 'life_slowlife'].includes(this.currentTask.type));
                        
        if ((this.energy <= 20 || this.hunger <= 20) && !isHealing) {
            this.stats.mood -= 0.05; // ピンチ時はどんどん不機嫌になる
        }
        this.stats.mood = Math.max(0, Math.min(100, this.stats.mood));
        
        // 機嫌が0の時、闇落ちカウンターが蓄積していく
        if (this.stats.mood <= 0) {
            this.darknessCounter = (this.darknessCounter || 0) + 0.1;
        } else {
            this.darknessCounter = Math.max(0, (this.darknessCounter || 0) - 0.05); // 機嫌が良いと少しずつ戻る
        }
    }

    const isPassiveActing = ['studying', 'training', 'sleeping', 'eating', 'fishing', 'smithing', 'building', 'apprentice_training', 'camping'].includes(this.actionState);
    if (isPassiveActing && this.activeMonuments) { this.activeMonuments.forEach(m => { this.stats[m.stat] += 0.05; }); }
    if (this.actionState === 'sleeping' && this.activeMonuments && this.activeMonuments.some(m => m.stat === 'beauty')) { this.stats.beauty += 0.1; }

    // ★重要：キャッチアップ中（別タブ復帰時の一括処理中）は画面上にポポポポと文字が出ないようにする
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
                        // ★修正：免許皆伝かどうかをここで判定し、ダメなら現在のタスク「だけ」をキャンセルして次へ進む
                        let isMasterExplorer = (this.apprentice && this.apprentice.rank && this.apprentice.rank['explore'] >= 10);
                        this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
                        
                        if (!isMasterExplorer) {
                            this.message = "ここから先は危険だ...\n（免許皆伝が必要）"; this.messageTimer = 120;
                            this.schedule.shift(); // ★全消しではなく、今やろうとしていた探索タスクだけを消す
                            if (typeof window.updateScheduleList === 'function' && !window.isCatchingUp) window.updateScheduleList();
                        } else {
                            this.schedule = []; // 入れる場合は今まで通り全消ししてダンジョンに集中
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

// aiPet.executeEnterAction = function() {
//     if (this.interactionTarget && this.interactionTarget.type === 'farm') {
//         this.actionState = 'farming_work'; this.exploreTimer = 0;
//         let farmAct = 'farm_plow'; let msg = "手入れ中...";
//         if (this.intendedSeed) { farmAct = 'farm_seed'; msg = "種まき中..."; }
//         else if (this.intendedAction === 'pest_control') { farmAct = 'farm_pest'; msg = "害虫退治中..."; }
//         else if (this.interactionTarget.isDead || this.interactionTarget.isEaten) { farmAct = 'farm_plow'; msg = "片付け中..."; }
//         else if (this.interactionTarget.growth >= 100) { farmAct = 'farm_harvest'; msg = "収穫中..."; }
//         else { farmAct = 'farm_water'; }
//         this.visualAction = farmAct; this.message = msg;
//     } 
//     else if (this.interactionTarget && (this.interactionTarget.type === 'bridge' || this.interactionTarget.type === 'sea')) {
//         this.actionState = 'fishing'; this.visualAction = 'fish'; this.fishingData = null; 
//         this.message = "釣り開始！"; this.messageTimer = 60;
//         if (this.schedule.length > 0 && this.schedule[0].type === 'fish') this.schedule[0]._started = true;
//     } else if (this.interactionTarget && this.interactionTarget.type === 'building_site') {
//         this.actionState = 'building'; this.visualAction = 'smith'; 
//         this.message = "建築開始！"; this.messageTimer = 60;
//         if (this.schedule.length > 0 && this.schedule[0].type === 'build') this.schedule[0]._started = true;
//     } 
//     // ==========================================
//     // ★追加：レストランと鍛冶屋に入室した時の処理
//     // ==========================================
//     else if (this.interactionTarget && (this.interactionTarget.type === 'restaurant' || this.interactionTarget.type === 'smith')) {
//         this.actionState = 'inside';
//         this.indoorTarget = this.interactionTarget; 
//         this.isIndoors = true; this.exploreTimer = 0; 
//         this.message = "いらっしゃいませ！"; this.messageTimer = 120;
        
//         if (typeof window.openShopManagementUI === 'function') {
//             let targetId = null;
//             for (let k in assets) { if (assets[k] === this.interactionTarget) { targetId = k; break; } }
//             if (targetId) {
//                 this.interactionTarget.id = targetId; 
//                 window.openShopManagementUI(this.interactionTarget);
//             }
//         }
//     }
//     else {
//         this.actionState = 'entering'; 
//     }
// };

aiPet.executeEnterAction = function() {
    const currentTask = (this.schedule && this.schedule.length > 0) ? this.schedule[0] : null;

    // ★修正: 城や農場に到着した瞬間にフリーズしないよう、報告・試験タスクを最優先でキャッチ！
    if (currentTask && (currentTask.type === 'visit_master' || currentTask.type === 'apprentice_exam')) {
        this.actionState = 'inside'; this.indoorTarget = this.interactionTarget; this.isIndoors = true; this.exploreTimer = 0;
        this.message = "師匠、来ました！"; this.messageTimer = 120; return; 
    }

    if (this.interactionTarget && this.interactionTarget.type === 'farm') {
        this.actionState = 'farming_work'; this.exploreTimer = 0;
        let farmAct = 'farm_plow'; let msg = "手入れ中...";
        let farm = this.interactionTarget;
        let seed = this.intendedSeed;
        let act = this.intendedAction;

        if (seed) { farmAct = 'farm_seed'; msg = "種まき中..."; }
        else if (act === 'pest_control') { farmAct = 'farm_pest'; msg = "害虫退治中..."; }
        else if (farm.isDead || farm.isEaten) { farmAct = 'farm_plow'; msg = "片付け中..."; }
        else if (farm.growth >= 100) { farmAct = 'farm_harvest'; msg = "収穫中..."; }
        else { farmAct = 'farm_water'; }
        
        this.visualAction = farmAct; 
        this.message = msg;
        this.messageTimer = 120;

        // ★修正：アニメーションを3秒見せた後、確実に完了させて立ち状態に戻す（フリーズ対策）
        setTimeout(() => {
            if (this.actionState !== 'farming_work') return; // 別の行動に上書きされていたら中止
            
            if (seed && (!farm.plantedCrop || farm.isDead || farm.isEaten)) {
                farm.plantedCrop = seed; farm.growth = 0; farm.waterLevel = 100;
                farm.isDead = false; farm.isEaten = false;
                this.message = "種まき完了！";
                
                // 種を消費（支給品以外）
                if (seed !== 'seed_carrot_given') {
                    let idx = this.inventory.indexOf(seed);
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
            } 
            else if (act === 'pest_control') {
                farm.pestState = false; this.message = "害虫を退治した！";
            } 
            else if (farm.isDead || farm.isEaten) {
                farm.plantedCrop = null; farm.isDead = false; farm.isEaten = false;
                this.message = "枯れた作物を片付けた！";
            } 
            else if (farm.growth >= 100) {
                let cropId = farm.plantedCrop.replace('seed_', '');
                if (cropId === 'carrot_given') cropId = 'carrot'; // 支給品対応
                
                // ★農家のブラッシュアップ：ステータスが高いとレア野菜になる！
                let isRare = false;
                
                // ★修正：ランク10の制限を撤廃！ 美しさと賢さが50以上なら30%で「質のいい〇〇」に変化
                if ((this.stats.beauty || 0) >= 50 && (this.stats.intel || 0) >= 50) {
                    if (Math.random() < 0.3) isRare = true;
                }
                
                if (isRare) {
                    cropId = 'high_' + cropId;
                    this.message = "おおっ！質のいい作物が収穫できた！";
                } else {
                    this.message = "収穫完了！";
                }
                
                this.inventory.push(cropId);
                farm.plantedCrop = null; farm.growth = 0;
            } 
            else {
                farm.waterLevel = 100; this.message = "水やり完了！";
            }
            
            // 農業クエストの進行回数をカウント
            if (this.apprentice && this.apprentice.activeQuest && this.apprentice.activeQuest.desc.includes("農業")) {
                this.apprentice.qVal = (this.apprentice.qVal || 0) + 1;
                if (typeof window.updateQuestHUD === 'function') window.updateQuestHUD();
            }
            
            // 無事に立ち状態（idle）へ戻す
            this.actionState = 'idle';
            this.visualAction = null;
            this.messageTimer = 120;
            if (typeof saveGameData === 'function') saveGameData();
            
        }, 3000); // 3秒かけて農作業を行う
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
        this.actionState = 'inside'; this.indoorTarget = this.interactionTarget; this.isIndoors = true; this.exploreTimer = 0; this.message = "いらっしゃいませ！";
        if (typeof window.openShopManagementUI === 'function') {
            let targetId = Object.keys(assets).find(k => assets[k] === this.interactionTarget);
            if (targetId) { this.interactionTarget.id = targetId; window.openShopManagementUI(this.interactionTarget); }
        }
    }
    // ★追加：城などの一般施設に入った時の処理
    else if (this.interactionTarget && ['house', 'hut', 'castle', 'school', 'library', 'gym'].includes(this.interactionTarget.type)) {
        this.actionState = 'inside'; 
        this.isIndoors = true; 
        this.indoorTarget = this.interactionTarget; 
        this.exploreTimer = 0;
        
        let msg = "中に入ったよ";
        if (this.interactionTarget.type === 'castle') msg = "城の中を探索中...";
        this.message = msg; this.messageTimer = 120;

        // ▼▼▼ 追加：小屋（hut）に入った時のカードアンロック ▼▼▼
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
let inheritanceSelections = { stats: false, inventory: false, vocab: false, license: false, personality: false };
window.inheritanceStatsPercent = 10;

const BASE_INHERITANCE_COSTS = { stats: 500, inventory: 300, vocab: 400, license: 800, personality: 200 };
let currentInheritanceCosts = { ...BASE_INHERITANCE_COSTS };

window.triggerReincarnation = function() {
    if (typeof window.generateCardFromAI === 'function') window.generateCardFromAI(window.aiPet);
    setTimeout(() => { window.openInheritanceShop(); }, 2500); 
};

window.openInheritanceShop = function() {
    let shopUI = document.getElementById('inheritance-shop-ui');
    if (!shopUI) {
        shopUI = document.createElement('div');
        shopUI.id = 'inheritance-shop-ui';
        shopUI.style.cssText = `position: fixed; top: 5%; left: 10%; width: 80%; height: 90%; background: rgba(20, 20, 20, 0.95); border: 4px solid #FFD700; border-radius: 12px; z-index: 30000; display: none; flex-direction: column; color: white; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.8);`;
        document.body.appendChild(shopUI);
    }
    
    // 基本項目をリセット
    inheritanceSelections = { stats: false, inventory: false, vocab: false, license: false, personality: false };
    currentInheritanceCosts = { ...BASE_INHERITANCE_COSTS };
    
    // ★追加：レガシー（余生の成果）データをロードして動的に選択肢を追加
    let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
    if (legacy.disciple) {
        inheritanceSelections['disciple'] = false;
        currentInheritanceCosts['disciple'] = 1000;
    }
    legacy.monuments.forEach(m => {
        inheritanceSelections[m.id] = false; currentInheritanceCosts[m.id] = 500;
    });
    legacy.books.forEach(b => {
        inheritanceSelections[b.id] = false; currentInheritanceCosts[b.id] = 400;
    });

    window.inheritanceStatsPercent = 10; 
    window.renderInheritanceShop();
    shopUI.style.display = 'flex';
};

window.updateInheritanceStatsPercent = function(value) {
    window.inheritanceStatsPercent = parseInt(value, 10);
    window.renderInheritanceShop();
};

window.renderInheritanceShop = function() {
    const shopUI = document.getElementById('inheritance-shop-ui');
    if (!shopUI) return;

    let totalCost = 0;
    for (let key in inheritanceSelections) {
        if (inheritanceSelections[key]) totalCost += currentInheritanceCosts[key];
    }
    
    const isAffordable = window.aiPet.gold >= totalCost;
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
        // ★修正: 素早さの表示を追加
        legacyHtml += renderOption('disciple', '一番弟子の引継ぎ', `育てた弟子を次の主人公にします。(初期値 活力:${s.power} 賢さ:${s.intel} 美しさ:${s.beauty} 素早さ:${s.speed||10})`, '👶');
    }
    legacy.monuments.forEach(m => {
        // ★修正: speed に対応
        let statName = m.stat === 'power' ? '活力' : m.stat === 'intel' ? '賢さ' : m.stat === 'speed' ? '素早さ' : '美しさ';
        legacyHtml += renderOption(m.id, `モニュメント (${statName})`, `マップに建築され、あらゆる行動に【${statName}ボーナス】を与えます。<br><span style="color:#ff5252">※選択しないとこのモニュメントは消滅します</span>`, '🗽');
    });
    legacy.books.forEach(b => {
        // ★修正: speed に対応
        let statName = b.stat === 'power' ? '活力' : b.stat === 'intel' ? '賢さ' : b.stat === 'speed' ? '素早さ' : '美しさ';
        legacyHtml += renderOption(b.id, `秘伝書の伝授 (${statName})`, `次世代の最初の10アクション時に、毎回【${statName} +${b.val}】のボーナスを付与します。<br><span style="color:#ff5252">※選択しないとこの秘伝書は消滅します</span>`, '📖');
    });

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
            ${legacyHtml !== "" ? `<div style="margin: 20px 0 10px 0; font-size: 16px; font-weight: bold; color: #00BCD4; border-bottom: 1px solid #00BCD4; padding-bottom: 5px;">🏆 余生の遺産 (選択必須)</div>` + legacyHtml : ""}
        </div>
        <div style="background: #111; padding: 20px; border-top: 2px solid #555; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 22px; font-weight: bold;">
                所持金: <span style="color: #FFD700;">${window.aiPet.gold} G</span><br>
                <span style="font-size: 16px; color: #aaa;">消費: <span style="color: ${goldColor};">-${totalCost} G</span></span>
            </div>
            <button onclick="window.executeReincarnation()" style="padding: 15px 40px; font-size: 20px; font-weight: bold; background: ${isAffordable ? '#FF9800' : '#666'}; color: white; border: none; border-radius: 8px; cursor: ${isAffordable ? 'pointer' : 'not-allowed'}; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">次の人生へ ➔</button>
        </div>
    `;
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
    
    // ▼▼▼ 追加：元システムが設定し忘れた「美しさ」と「素早さ」の基本値(10)をここで確実にセットする！ ▼▼▼
    if (window.aiPet && window.aiPet.stats) {
        if (window.aiPet.stats.beauty === undefined || isNaN(window.aiPet.stats.beauty) || window.aiPet.stats.beauty === 0) {
            window.aiPet.stats.beauty = 10;
        }
        if (window.aiPet.stats.speed === undefined || isNaN(window.aiPet.stats.speed) || window.aiPet.stats.speed === 0) {
            window.aiPet.stats.speed = 10;
        }
    }
    // ▲▲▲ 追加ここまで ▲▲▲

    window.aiPet.legacyProgress = {}; 
    window.aiPet.lifePath = null; // 余生ルートリセット
    window.aiPet.originalLifespan = null; 
    window.aiPet.isReincarnating = false;
    
    // ★追加：引き継いだレガシーデータ（モニュメント・秘伝書）をAIに装備
    let activeLegacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[]}');
    window.aiPet.activeMonuments = activeLegacy.monuments;
    window.aiPet.activeBooks = activeLegacy.books;
    
    // モニュメントをマップに出現させる
    activeLegacy.monuments.forEach(m => {
        if (typeof assets !== 'undefined') {
            assets[m.id] = { type: 'stone', name: '英雄のモニュメント', dx: m.x, dy: m.y, sw: 100, sh: 100, scale: 0.6 };
        }
    });
    
    if (window.pendingInheritanceData) {
        const data = window.pendingInheritanceData;
        
        // 弟子引継ぎによる上書き
        if (data.discipleStats) {
            window.aiPet.stats.intel = data.discipleStats.intel;
            window.aiPet.stats.power = data.discipleStats.power;
            window.aiPet.stats.beauty = data.discipleStats.beauty;
            if (data.discipleStats.speed) window.aiPet.stats.speed = data.discipleStats.speed; // ★追加
        } else if (data.stats) {
            window.aiPet.stats.intel += data.stats.intel;
            window.aiPet.stats.power += data.stats.power;
            window.aiPet.stats.beauty += data.stats.beauty;
            if (data.stats.speed) window.aiPet.stats.speed += data.stats.speed; // ★追加
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
    // ★修正：大事業をやり遂げた証として、タスク完了時に年齢（寿命）を加算する！
    const ls = this.lifespan || 100;
    let ageRate = 0.1; 
    if (task.type === 'life_monument' || task.type === 'life_author') ageRate = 0.25;
    else if (task.type === 'life_guardian' || task.type === 'life_slowlife') ageRate = 0.05;
    
    this.age += ls * ageRate; 
    if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y-80, `年齢 +${Math.floor(ls*ageRate)}歳`, "#aaa");

    let maxStat = 'power'; let maxVal = this.stats.power;
    if (this.stats.intel > maxVal) { maxStat = 'intel'; maxVal = this.stats.intel; }
    if (this.stats.beauty > maxVal) { maxStat = 'beauty'; maxVal = this.stats.beauty; }
    // ★追加: 素早さも比較対象に入れる
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
                speed: Math.floor((this.stats.speed || 10) * intelFactor) // ★追加
            }
        };
        localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
    }
    else if (task.type === 'life_monument') {
        this.legacyProgress = this.legacyProgress || {};
        this.legacyProgress['monument'] = (this.legacyProgress['monument'] || 0) + 25;
        if (this.legacyProgress['monument'] >= 100) {
            this.message = "モニュメント完成！"; this.messageTimer = 120;
            let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
            legacy.monuments.push({ id: 'mon_'+Date.now(), stat: maxStat, val: maxVal, x: this.x, y: this.y });
            localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
        } else {
            this.message = `モニュメント建造中... (${this.legacyProgress['monument']}%)`; this.messageTimer = 120;
        }
    }
    else if (task.type === 'life_seeker') {
        let mult = 10 + ((this.generation || 1) * 10);
        if (this.visualAction === 'train') this.stats.power += 10 * mult;
        else if (this.visualAction === 'study') this.stats.intel += 10 * mult;
        // ★追加: アニメーションがmove（ランニング等）の場合は素早さを爆上げする
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
            this.message = "秘伝書完成！"; this.messageTimer = 120;
            let legacy = JSON.parse(localStorage.getItem('ai_legacy_data') || '{"monuments":[], "books":[], "disciple":null}');
            legacy.books.push({ id: 'book_'+Date.now(), stat: maxStat, val: Math.floor(maxVal) });
            localStorage.setItem('ai_legacy_data', JSON.stringify(legacy));
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

    // ★修正：探検処理の最初に、対象がダンジョンならUIを開いて終了する処理を追加
    if (state.currentFacility === 'skull' || state.currentFacility === 'crystal') {
        this.actionState = 'idle'; 
        this.isIndoors = false;
        this.indoorTarget = null;
        // ★修正：40回積まれた予定もすべて消去する！
        this.schedule = [];

        // ▼▼▼ 追加：ダンジョン進入時のカードアンロック ▼▼▼
        if (typeof window.triggerTCGUnlock === 'function') {
            if (this.interactionTarget.type === 'skull') window.triggerTCGUnlock('visit_cave', this.generation);
            if (this.interactionTarget.type === 'crystal') window.triggerTCGUnlock('visit_mine', this.generation);
        }

        if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
        
        if (typeof window.openDungeonUI === 'function') {
            window.openDungeonUI(state.currentFacility);
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
    let depthAdvance = 1;
    if (statBonus > 50) depthAdvance = 3;
    else if (statBonus > 20) depthAdvance = 2;
    
    state.depth += depthAdvance;
    if (state.depth > state.maxDepth) state.depth = state.maxDepth;
    
    // ▼▼▼ 新規追加：ステータスの壁（階層制限） ▼▼▼
    if (state.depth >= 8) { // 8〜10階（深層）
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

            // ▼▼▼ 新規追加：レアアイテムは「深層（8階以上）」限定のドロップにする ▼▼▼
            if (itemKey === 'wood' || itemKey === 'stone') {
                let isRare = false;
                // 中層のドロップを廃止し、深層（8階以上）到達時のみ50%でドロップするように変更
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

    return base + intelBonus + ageBonus + typeBonus + masterBonus;
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
            if (isNewGame && !hasTutorialPlayed) {
                hasTutorialPlayed = true;
                
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
            clearInterval(uiRevealCheck); // 監視を終了
        }
    }, 500);
}, 2000); // ★ここがポイント：2秒間待ってから監視スタート


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

// ==========================================
// ★ 追加：序盤の救済措置＆秘伝書（アイテム定義）
// ==========================================
setTimeout(() => {
    if (typeof itemCatalog !== 'undefined') {
        if (!itemCatalog['item_berry']) itemCatalog['item_berry'] = { name: '野イチゴ', type: 'food', value: 2, hungerRec: 15, energyRec: 5, desc: '道端で見つけた小さなイチゴ。少しお腹が膨れる。' };
        if (!itemCatalog['item_lunchbox']) itemCatalog['item_lunchbox'] = { name: '師匠のお弁当', type: 'food', value: 0, hungerRec: 80, energyRec: 50, desc: '師匠からの差し入れ。愛情と栄養がたっぷり！' };
        if (!itemCatalog['item_secret_book']) itemCatalog['item_secret_book'] = { name: '達人の秘伝書', type: 'book', value: 1000, desc: '前世の知識と技術が詰まった本。読むとステータスが上がるかも。' };
    }
}, 2000);

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
// 🗡️ ダンジョン機能（クリスタル追加＆ズームアウト版）
// ==========================================

window.addDungeonLog = function(text, color = "#ddd") {
    const logArea = document.getElementById('dg-log-area');
    if (!logArea) return;
    const line = document.createElement('div');
    line.innerHTML = `<span style="color:#888;">[Turn]</span> <span style="color:${color}">${text}</span>`;
    logArea.appendChild(line);
    logArea.scrollTop = logArea.scrollHeight;
};

window.DUNGEON_AVAILABLE_COMMANDS = [
    { id: "move_up", name: "うえ" }, { id: "move_down", name: "した" },
    { id: "move_left", name: "ひだり" }, { id: "move_right", name: "みぎ" },
    { id: "attack", name: "たたかう" }, { id: "heal", name: "かいふく" },
    { id: "eat", name: "たべる" }, 
    { id: "equip", name: "そうび" }, { id: "unequip", name: "はずす" }, // ★追加
    { id: "flee", name: "にげる" },
    { id: "use", name: "つかう" },
    { id: "synthesize", name: "ごうせい" } // ★新規追加！
];

window.DUNGEON_SPRITES = {
    // スカル
    "skull_floor": { "img": "dungeon_scull_mapchip.png", "sx": 9, "sy": 0, "sw": 341, "sh": 331, "scale": 1 },
    "skull_wall": { "img": "dungeon_scull_mapchip.png", "sx": 5, "sy": 337, "sw": 341, "sh": 429, "scale": 1 },
    "skull_stair": { "img": "dungeon_scull_mapchip.png", "sx": 448, "sy": 1168, "sw": 341, "sh": 376, "scale": 1 },
    // ★ 追加：クリスタル（調整ツールで値を上書きしてください）
    "crystal_floor": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 3,
        "sy": 57,
        "sw": 230,
        "sh": 256,
        "scale": 1
    },
    "crystal_wall": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 33,
        "sy": 404,
        "sw": 230,
        "sh": 237,
        "scale": 1
    },
    "crystal_stair": {
        "img": "dungeon_crystal_mapchip.png",
        "sx": 1999,
        "sy": 404,
        "sw": 230,
        "sh": 237,
        "scale": 1
    },

    // ==========================================
    // ★ 追加：特殊な床、トラップ、アイテムの定義
    // ==========================================
    "gimmick_water": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1409,
        "sy": 0,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "gimmick_magma": {
        "img": "dungeon_gimmick_mapchip.png",
        "sx": 1761,
        "sy": 0,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "trap_poison": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 2461,
        "sy": 1177,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "trap_mine": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 2461,
        "sy": 1177,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "trap_blind": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 2461,
        "sy": 1177,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "trap_bear_trap": {
        "img": "dungeon_trap_mapchip.png",
        "sx": 2461,
        "sy": 1177,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "spr_item_herb": {
        "img": "dungeon_item_mapchip.png",
        "sx": 2461,
        "sy": 802,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "spr_item_scroll": {
        "img": "dungeon_item_mapchip.png",
        "sx": 2461,
        "sy": 802,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "spr_item_wand": {
        "img": "dungeon_item_mapchip.png",
        "sx": 2461,
        "sy": 802,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },
    "spr_item_bag": {
        "img": "dungeon_item_mapchip.png",
        "sx": 2461,
        "sy": 802,
        "sw": 346,
        "sh": 331,
        "scale": 1
    },

    // キャラクター
    "robot_down": { "img": "robot_dungeon_walk.png", "sx": 688, "sy": 76, "sw": 408, "sh": 626, "scale": 0.4 },
    "robot_up": { "img": "robot_dungeon_walk.png", "sx": 1754, "sy": 76, "sw": 408, "sh": 626, "scale": 0.4 },
    "robot_left": { "img": "robot_dungeon_walk.png", "sx": 1749, "sy": 796, "sw": 374, "sh": 669, "scale": 0.4 },
    "robot_right": { "img": "robot_dungeon_walk.png", "sx": 737, "sy": 796, "sw": 374, "sh": 669, "scale": 0.4 },

    "robot_sword_down": {
        "img": "robot_dungeon_sword.png",
        "sx": 463,
        "sy": 76,
        "sw": 636,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_up": {
        "img": "robot_dungeon_sword.png",
        "sx": 1513,
        "sy": 76,
        "sw": 675,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_left": {
        "img": "robot_dungeon_sword.png",
        "sx": 1634,
        "sy": 796,
        "sw": 490,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_right": {
        "img": "robot_dungeon_sword.png",
        "sx": 737,
        "sy": 796,
        "sw": 494,
        "sh": 669,
        "scale": 0.4
    },
    "robot_shield_down": {
        "img": "robot_dungeon_shield.png",
        "sx": 688,
        "sy": 76,
        "sw": 504,
        "sh": 626,
        "scale": 0.4
    },
    "robot_shield_up": {
        "img": "robot_dungeon_shield.png",
        "sx": 1663,
        "sy": 76,
        "sw": 504,
        "sh": 626,
        "scale": 0.4
    },
    "robot_shield_left": {
        "img": "robot_dungeon_shield.png",
        "sx": 1736,
        "sy": 796,
        "sw": 382,
        "sh": 669,
        "scale": 0.4
    },
    "robot_shield_right": {
        "img": "robot_dungeon_shield.png",
        "sx": 737,
        "sy": 796,
        "sw": 408,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_shield_down": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 525,
        "sy": 76,
        "sw": 660,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_shield_up": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 1678,
        "sy": 76,
        "sw": 635,
        "sh": 626,
        "scale": 0.4
    },
    "robot_sword_shield_left": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 1676,
        "sy": 796,
        "sw": 453,
        "sh": 669,
        "scale": 0.4
    },
    "robot_sword_shield_right": {
        "img": "robot_dungeon_sword_shield.png",
        "sx": 737,
        "sy": 796,
        "sw": 449,
        "sh": 669,
        "scale": 0.4
    },

    "magician_down": { "img": "magician_dungeon_walk.png", "sx": 43, "sy": 42, "sw": 835, "sh": 1014, "scale": 0.4 },
    "magician_up": { "img": "magician_dungeon_walk.png", "sx": 1020, "sy": 42, "sw": 855, "sh": 1014, "scale": 0.4 },
    "magician_left": { "img": "magician_dungeon_walk.png", "sx": 43, "sy": 1169, "sw": 835, "sh": 1014, "scale": 0.4 },
    "magician_right": { "img": "magician_dungeon_walk.png", "sx": 1036, "sy": 1169, "sw": 835, "sh": 1014, "scale": 0.4 },
    "spirit_down": { "img": "spirit_dungeon_walk.png", "sx": 99, "sy": 63, "sw": 697, "sh": 1005, "scale": 0.4 },
    "spirit_up": { "img": "spirit_dungeon_walk.png", "sx": 997, "sy": 63, "sw": 697, "sh": 1005, "scale": 0.4 },
    "spirit_left": { "img": "spirit_dungeon_walk.png", "sx": 99, "sy": 1249, "sw": 697, "sh": 1012, "scale": 0.4 },
    "spirit_right": { "img": "spirit_dungeon_walk.png", "sx": 970, "sy": 1249, "sw": 697, "sh": 1012, "scale": 0.4 },
    "dragon_down": { "img": "dragon_dungeon_walk.png", "sx": 60, "sy": 63, "sw": 870, "sh": 864, "scale": 0.4 },
    "dragon_up": { "img": "dragon_dungeon_walk.png", "sx": 1045, "sy": 73, "sw": 882, "sh": 940, "scale": 0.4 },
    "dragon_left": { "img": "dragon_dungeon_walk.png", "sx": 60, "sy": 1175, "sw": 870, "sh": 927, "scale": 0.4 },
    "dragon_right": { "img": "dragon_dungeon_walk.png", "sx": 1053, "sy": 1175, "sw": 870, "sh": 927, "scale": 0.4 },
    "machine_down": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 1100, "sw": 603, "sh": 864, "scale": 0.4 },
    "machine_up": { "img": "machine_dungeon_walk.png", "sx": 724, "sy": 90, "sw": 603, "sh": 864, "scale": 0.4 },
    "machine_left": { "img": "machine_dungeon_walk.png", "sx": 30, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.4 },
    "machine_right": { "img": "machine_dungeon_walk.png", "sx": 1391, "sy": 1086, "sw": 629, "sh": 882, "scale": 0.4 },
    "stone_down": { "img": "stone_dungeon_walk.png", "sx": 94, "sy": 137, "sw": 836, "sh": 919, "scale": 0.4 },
    "stone_up": { "img": "stone_dungeon_walk.png", "sx": 998, "sy": 137, "sw": 836, "sh": 919, "scale": 0.4 },
    "stone_left": { "img": "stone_dungeon_walk.png", "sx": 94, "sy": 1156, "sw": 843, "sh": 983, "scale": 0.4 },
    "stone_right": { "img": "stone_dungeon_walk.png", "sx": 956, "sy": 1156, "sw": 843, "sh": 983, "scale": 0.4 },
    "seed_down": { "img": "seed_dungeon_walk.png", "sx": 150, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.4 },
    "seed_up": { "img": "seed_dungeon_walk.png", "sx": 941, "sy": 186, "sw": 604, "sh": 1019, "scale": 0.4 },
    "seed_left": { "img": "seed_dungeon_walk.png", "sx": 939, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.4 },
    "seed_right": { "img": "seed_dungeon_walk.png", "sx": 113, "sy": 1400, "sw": 658, "sh": 1064, "scale": 0.4 },
    "ghost_down": { "img": "ghost_dungeon_walk.png", "sx": 185, "sy": 138, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_up": { "img": "ghost_dungeon_walk.png", "sx": 1110, "sy": 138, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_left": { "img": "ghost_dungeon_walk.png", "sx": 1148, "sy": 1130, "sw": 674, "sh": 782, "scale": 0.4 },
    "ghost_right": { "img": "ghost_dungeon_walk.png", "sx": 132, "sy": 1130, "sw": 674, "sh": 782, "scale": 0.4 },
    "balloon_down": { "img": "balloon_dungeon_walk.png", "sx": 168, "sy": 152, "sw": 789, "sh": 845, "scale": 0.4 },
    "balloon_up": { "img": "balloon_dungeon_walk.png", "sx": 1162, "sy": 152, "sw": 818, "sh": 845, "scale": 0.4 },
    "balloon_left": { "img": "balloon_dungeon_walk.png", "sx": 1172, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.4 },
    "balloon_right": { "img": "balloon_dungeon_walk.png", "sx": 173, "sy": 1050, "sw": 789, "sh": 884, "scale": 0.4 },
    "beetle_down": { "img": "beetle_dungeon_walk.png", "sx": 1100, "sy": 76, "sw": 683, "sh": 997, "scale": 0.4 },
    "beetle_up": { "img": "beetle_dungeon_walk.png", "sx": 152, "sy": 76, "sw": 683, "sh": 1001, "scale": 0.4 },
    "beetle_left": { "img": "beetle_dungeon_walk.png", "sx": 1039, "sy": 1149, "sw": 785, "sh": 1001, "scale": 0.4 },
    "beetle_right": { "img": "beetle_dungeon_walk.png", "sx": 120, "sy": 1149, "sw": 785, "sh": 1001, "scale": 0.4 },
    "bird_down": { "img": "bird_dungeon_walk.png", "sx": 220, "sy": 234, "sw": 557, "sh": 940, "scale": 0.4 },
    "bird_up": { "img": "bird_dungeon_walk.png", "sx": 219, "sy": 1234, "sw": 557, "sh": 957, "scale": 0.4 },
    "bird_left": { "img": "bird_dungeon_walk.png", "sx": 1074, "sy": 1234, "sw": 631, "sh": 957, "scale": 0.4 },
    "bird_right": { "img": "bird_dungeon_walk.png", "sx": 1049, "sy": 274, "sw": 631, "sh": 913, "scale": 0.4 }
};

window._dungeonAiTypesList = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'beetle', 'bird'];

// ★新規追加：印の詳細説明データ（装備詳細画面で使います）
window.SEAL_DESCRIPTIONS = {
    heal: { name: '癒', desc: '与えたダメージの20%を吸収しHPを回復する。' },
    life: { name: '命', desc: '毎ターンHPが1ずつ自動回復する。' },
    sleep: { name: '眠', desc: '攻撃時、20%の確率で敵を睡眠状態にする。' },
    counter_sleep: { name: '眠', desc: '敵から直接攻撃を受けた際、15%の確率で敵を睡眠状態にする。' },
    fire: { name: '炎', desc: '通常ダメージに加え、追加で固定の炎ダメージ(+10)を与える。' },
    anti_dragon: { name: '竜', desc: 'ドラゴン系のモンスターから受けるダメージを半減する。' },
    exp: { name: '幸', desc: '敵を倒した時に得られる経験値が1.5倍になる。' },
    dodge: { name: '避', desc: '素早さによる回避とは別に、15%の確率で無条件に攻撃をかわす。' },
    double: { name: '連', desc: '通常攻撃が2回連続になる。' },
    parry: { name: '見', desc: '敵からの直接攻撃を15%の確率で弾き、無効化する。' },
    food: { name: '食', desc: '敵を倒した時、稀に食料（野イチゴやパン）をドロップする。' },
    half_hunger: { name: '腹', desc: 'お腹の減る速度が半分になる。' },
    angry: { name: '怒', desc: '自分がダメージを受けた直後のターンに攻撃すると、ダメージが1.5倍になる。' },
    counter: { name: '反', desc: '受けたダメージの半分を相手に跳ね返す。' },
    crit: { name: '会', desc: '攻撃時、15%の確率で会心の一撃（ダメージ2倍）が出る。' },
    max_hunger: { name: '膨', desc: '装備中、最大満腹度に +20 のボーナスがつく。' },
    first: { name: '先', desc: '敵が自分に隣接してきた瞬間、ターンを消費せずに先制攻撃を行う。' },
    light: { name: '軽', desc: '素早さによる回避率の上限が「75%」に引き上げられる。' },
    holy: { name: '光', desc: 'アンデッド・悪魔系モンスターに対して2倍のダメージを与える。' },
    regen: { name: '治', desc: '毎ターンHPが回復し、装備の「腹減り2倍」のデメリットを打ち消す。' },
    curse: { name: '呪', desc: '呪縛。装備から外せなくなり、武器や防具の性能が半減する。' } // ★新規追加
};

// ★完全修正：アイテム文字列から「ベース名」「＋値」「印の配列」を正確に分解する
window.parseItemString = function(itemId) {
    let baseId = "";
    
    // ★追加：装備のベースIDリスト（これらに前方一致するかを最優先で確認する）
    const baseEquipIds = [
        'item_sword_double', 'item_sword_iron', 
        'item_shield_counter', 'item_shield_hara', 'item_shield_wood', 
        'item_armor_iron',
        'item_ring_haste', 'item_ring_heal'
    ];
    
    for(let b of baseEquipIds) {
        if (itemId.startsWith(b)) { baseId = b; break; }
    }
    
    // カタログにある名前から「最長一致」で探す（装備以外のアイテム用）
    if (!baseId) {
        let keys = [];
        if (typeof itemCatalog !== 'undefined') keys = Object.keys(itemCatalog).sort((a,b) => b.length - a.length);
        for(let k of keys) {
            if (itemId.startsWith(k)) { baseId = k; break; }
        }
    }
    
    // 究極のフォールバック
    if (!baseId) baseId = itemId.split('_+')[0]; 

    let plusMatch = itemId.match(/_\+(\d+)/);
    let plus = plusMatch ? parseInt(plusMatch[1]) : 0;

    // ベースIDと＋値を取り除いた「残りの文字列」から印を探す
    let remainder = itemId.replace(baseId, '').replace(/_\+\d+/, '');
    
    let seals = [];
    const validSeals = Object.keys(window.SEAL_DESCRIPTIONS || {});
    let sortedSeals = [...validSeals].sort((a,b) => b.length - a.length);
    
    for (let s of sortedSeals) {
        if (remainder.includes(s)) {
            seals.push(s);
            remainder = remainder.replace(new RegExp(s, 'g'), ''); // 同じ印が重複するのを防ぐ
        }
    }
    return { baseId: baseId, plus: plus, seals: seals };
};

// ★新規追加：異種合成時に「どの印がつくか」を定義する辞書
window.getSealFromItem = function(itemBaseId, targetEquipType) {
    if (targetEquipType === 'weapon') {
        if (itemBaseId === 'herb' || itemBaseId === 'item_berry') return 'heal';
        if (itemBaseId === 'item_scroll_sleep') return 'sleep';
        if (itemBaseId === 'item_wand_fire') return 'fire';
        if (itemBaseId === 'item_seed_happy') return 'exp';
        if (itemBaseId === 'item_sword_double') return 'double';
        if (itemBaseId === 'item_shield_hara') return 'food';
        if (itemBaseId === 'item_shield_counter') return 'angry';
        if (itemBaseId === 'item_bread') return 'crit';
        if (itemBaseId === 'item_ring_haste') return 'first';
        if (itemBaseId === 'item_ring_heal') return 'holy';
    } else if (targetEquipType === 'shield' || targetEquipType === 'armor') {
        if (itemBaseId === 'herb' || itemBaseId === 'item_berry') return 'life';
        if (itemBaseId === 'item_scroll_sleep') return 'counter_sleep';
        if (itemBaseId === 'item_wand_fire') return 'anti_dragon';
        if (itemBaseId === 'item_seed_happy') return 'dodge';
        if (itemBaseId === 'item_sword_double') return 'parry';
        if (itemBaseId === 'item_shield_hara') return 'half_hunger';
        if (itemBaseId === 'item_shield_counter') return 'counter';
        if (itemBaseId === 'item_bread') return 'max_hunger';
        if (itemBaseId === 'item_ring_haste') return 'light';
        if (itemBaseId === 'item_ring_heal') return 'regen';
    }
    return null;
};

// ★上書き：アイテムの効果計算（呪いペナルティと新アイテム対応）
window.getDungeonItemEffect = function(itemId) {
    let parsed = window.parseItemString(itemId);
    let baseId = parsed.baseId; let plus = parsed.plus; let seals = parsed.seals;

    let baseData = null;
    if (typeof itemCatalog !== 'undefined' && itemCatalog[baseId]) baseData = itemCatalog[baseId];
    
    let name = baseData ? baseData.name : baseId;
    if (baseId === 'item_sword_iron') name = "鉄の剣";
    else if (baseId === 'item_shield_wood') name = "木の盾";
    // ★新アイテムの名前定義
    else if (baseId === 'item_wand_swap') name = "場所替えの杖";
    else if (baseId === 'item_wand_blow') name = "吹き飛ばしの杖";
    else if (baseId === 'item_scroll_confuse') name = "混乱の巻物";

    if (plus > 0) name += ` +${plus}`;

    const sealMap = {
        heal: '癒', life: '命', sleep: '眠', counter_sleep: '眠', fire: '炎', anti_dragon: '竜',
        exp: '幸', dodge: '避', double: '連', parry: '見', food: '食', half_hunger: '腹',
        angry: '怒', counter: '反', crit: '会', max_hunger: '膨', first: '先', light: '軽',
        holy: '光', regen: '治', curse: '呪'
    };

    if (seals.length > 0) {
        let sealStrs = seals.map(s => `[${sealMap[s] || s}]`).join('');
        name += ` ${sealStrs}`;
    }

    let effect = { 
        hp: 0, hunger: 0, 
        isConsumable: false, equipType: null,
        atk: 0, def: 0, name: name, maxSeals: 3, // ★デフォルト印上限は3
        traits: [...seals] 
    };

    if (baseId.startsWith('dish_')) { effect.hp = 30; effect.hunger = 40; effect.isConsumable = true; }
    else if (baseId === 'item_bread') { effect.hp = 0; effect.hunger = 50; effect.isConsumable = true; }
    else if (baseId === 'item_berry' || baseId.includes('apple') || baseId.includes('fruit')) { effect.hp = 10; effect.hunger = 15; effect.isConsumable = true; }
    else if (baseId === 'herb' || baseId.includes('potion')) { effect.hp = 50; effect.hunger = 5; effect.isConsumable = true; }
    else if (baseId.includes('fish') || baseId.includes('meat')) { effect.hp = 15; effect.hunger = 25; effect.isConsumable = true; }
    else if (baseId === 'item_seed_happy') { effect.isConsumable = true; effect.traits.push('level_up'); }
    else if (baseId === 'item_scroll_sleep') { effect.isConsumable = true; effect.traits.push('sleep_aoe'); }
    else if (baseId === 'item_wand_fire') { effect.isConsumable = true; effect.traits.push('fire_damage'); }
    // ★新アイテムの効果
    else if (baseId === 'item_scroll_confuse') { effect.isConsumable = true; effect.traits.push('confuse_aoe'); }
    else if (baseId === 'item_wand_swap') { effect.isConsumable = true; effect.traits.push('swap_pos'); }
    else if (baseId === 'item_wand_blow') { effect.isConsumable = true; effect.traits.push('blow_back'); }
    
    else if (baseId === 'item_sword_iron' || baseId.includes('sword') || baseId.includes('weapon')) {
        effect.equipType = 'weapon'; effect.atk = 15 + (plus * 2); effect.maxSeals = 4; // 武器は4個まで
        if (baseId === 'item_sword_double' && !effect.traits.includes('double')) effect.traits.push('double');
    }
    else if (baseId === 'item_shield_wood' || baseId.includes('shield')) {
        effect.equipType = 'shield'; effect.def = 8 + (plus * 2); effect.maxSeals = 2; // 木の盾は2個まで
        if (baseId === 'item_shield_counter' && !effect.traits.includes('counter')) { effect.traits.push('counter'); effect.maxSeals = 3; }
        if (baseId === 'item_shield_hara' && !effect.traits.includes('half_hunger')) { effect.traits.push('half_hunger'); effect.maxSeals = 3; }
    }
    else if (baseId.includes('armor') || baseId.includes('mail') || baseId.includes('robe')) {
        effect.equipType = 'armor'; effect.def = 15 + (plus * 2); effect.maxSeals = 3;
    }
    else if (baseId.includes('ring') || baseId.includes('bracelet')) {
        effect.equipType = 'accessory'; effect.maxSeals = 1; // 装飾品は1個まで
        if (baseId === 'item_ring_haste' && !effect.traits.includes('fast_move')) effect.traits.push('fast_move');
        if (baseId === 'item_ring_heal') {
            if (!effect.traits.includes('regen_hp')) effect.traits.push('regen_hp');
            if (!effect.traits.includes('fast_hunger')) effect.traits.push('fast_hunger');
        }
    }

    // ★呪いのペナルティ処理（基礎ステータスが半減）
    if (effect.traits.includes('curse')) {
        if (effect.atk > 0) effect.atk = Math.max(1, Math.floor(effect.atk / 2));
        if (effect.def > 0) effect.def = Math.max(1, Math.floor(effect.def / 2));
    }

    effect.isWeapon = (effect.equipType === 'weapon');
    effect.isShield = (effect.equipType === 'shield');
    return effect;
};

window.processDungeonChat = function() {
    const input = document.getElementById('dg-chat-input');
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = "";
    
    const ai = window.aiPet;
    if (!ai || !ai.apprentice) return;
    if (!ai.apprentice.learnedWords) ai.apprentice.learnedWords = [];
    
    const forgetMatch = text.match(/(.+)を(?:忘|わす)れて/);
    if (forgetMatch) {
        let targetWord = forgetMatch[1].trim();
        const idx = ai.apprentice.learnedWords.indexOf(targetWord);
        if (idx !== -1) {
            ai.apprentice.learnedWords.splice(idx, 1);
            window.addDungeonLog(`「${targetWord}」という言葉を忘れた...`, '#FF9800');
            if (typeof saveGameData === 'function') saveGameData();
        }
        window.updateDungeonUI();
        return;
    }
    
    const maxWords = (typeof ai.getMaxVocabulary === 'function') ? ai.getMaxVocabulary() : 5;
    if (ai.apprentice.learnedWords.includes(text)) {
        window.addDungeonLog(`「${text}」はもう知ってるよ！`, '#aaa');
    } else if (ai.apprentice.learnedWords.length >= maxWords) {
        window.addDungeonLog(`記憶がいっぱいで「${text}」は覚えられない...`, '#ff5252');
    } else {
        ai.apprentice.learnedWords.push(text);
        window.addDungeonLog(`「${text}」という言葉を学習した！`, '#FFD700');
        if (typeof saveGameData === 'function') saveGameData();
    }
    window.updateDungeonUI();
};

window.DUNGEON_STATE = {
    active: false, isAuto: false, mapWidth: 30, mapHeight: 30, floor: 1, mapType: 'skull',
    player: { x: 15, y: 15, hp: 100, maxHp: 100, face: 'down', type: 'robot', skin: 'robot', attackAnim: false, atkBuff: 0, defBuff: 0, hunger: 100, level: 1, exp: 0, nextExp: 20, tempInventory: [] },
    enemies: [], grid: [], log: []
};
window.dungeonAutoInterval = null;

window.createDungeonSprite = function(spriteKey, logicalY, brightness = 1.0, isEnemy = false, logicalTileX = 100) {
    const sp = window.DUNGEON_SPRITES[spriteKey]; if (!sp) return null;
    
    // ★オーバーレイ（地形・罠・アイテム）かどうかの判定
    const isOverlay = spriteKey.startsWith('skull_') || spriteKey.startsWith('crystal_') || 
                      spriteKey.startsWith('gimmick_') || spriteKey.startsWith('trap_') || spriteKey.startsWith('spr_item_');
    
    const div = document.createElement('div');
    div.style.position = 'absolute'; div.style.width = `${sp.sw}px`; div.style.height = `${sp.sh}px`;
    div.style.display = 'flex'; div.style.justifyContent = 'center'; 
    // ★はみ出し防止：オーバーレイは「下揃え（flex-end）」にして床の底辺に合わせる
    div.style.alignItems = isOverlay ? 'flex-end' : 'center'; 
    div.style.overflow = 'visible'; div.style.zIndex = logicalY; 
    
    const inner = document.createElement('div');
    inner.style.width = `${sp.sw}px`; inner.style.height = `${sp.sh}px`;
    inner.style.backgroundImage = `url('${sp.img}')`; inner.style.backgroundPosition = `-${sp.sx}px -${sp.sy}px`;
    inner.style.backgroundRepeat = 'no-repeat'; 
    
    let filterStr = brightness < 1.0 ? `brightness(${brightness}) ` : '';
    if (isEnemy) filterStr += "sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(0.7) ";
    inner.style.filter = filterStr.trim();
    
    // ★自動スケーリング：ギミック・罠・アイテムは、現在の床の横幅(logicalTileX)に合わせて自動で縮小・拡大する
    let fitScale = 1.0;
    if (spriteKey.startsWith('gimmick_') || spriteKey.startsWith('trap_') || spriteKey.startsWith('spr_item_')) {
        fitScale = logicalTileX / sp.sw;
    }
    
    inner.style.transform = `scale(${sp.scale * fitScale})`;
    // ★スケーリングの基準点も「下中央」にする
    inner.style.transformOrigin = isOverlay ? 'bottom center' : 'center center'; 
    inner.style.flexShrink = '0';
    div.appendChild(inner); return div;
};

window.toggleDungeonModal = function(type) {
    const logModal = document.getElementById('dg-modal-log'); const mapModal = document.getElementById('dg-modal-minimap');
    if (type === 'log') { logModal.style.display = logModal.style.display === 'none' ? 'flex' : 'none'; mapModal.style.display = 'none'; } 
    else if (type === 'minimap') { mapModal.style.display = mapModal.style.display === 'none' ? 'flex' : 'none'; logModal.style.display = 'none'; if (mapModal.style.display === 'flex') window.drawMinimap(); }
};

window.toggleDungeonAuto = function() {
    window.DUNGEON_STATE.isAuto = !window.DUNGEON_STATE.isAuto;
    const btn = document.getElementById('dg-auto-btn');
    if (window.DUNGEON_STATE.isAuto) {
        btn.innerHTML = "⏸ AUTO 停止"; btn.style.background = "#FF9800"; btn.style.boxShadow = "0 8px 0 #E65100, 0 15px 20px rgba(0,0,0,0.5)";
        window.dungeonAutoInterval = setInterval(() => { if (window.DUNGEON_STATE.active) window.processDungeonTurn(); }, 350);
    } else {
        btn.innerHTML = "🔄 AUTO 開始"; btn.style.background = "#2196F3"; btn.style.boxShadow = "0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5)";
        clearInterval(window.dungeonAutoInterval);
    }
};

// ★修正: 第2引数(startFloor)を受け取れるようにする
window.openDungeonUI = function(mapType = 'skull', startFloor = null) {
    const s = window.DUNGEON_STATE;
    
    // ★追加: デバッグの階層指定があれば優先、無ければ1階から
    let floor = startFloor || (window.dungeonState && window.dungeonState.floor) || 1;
    s.mapType = mapType; s.floor = floor;
    if (window.dungeonState) window.dungeonState = null; // リセット
    
    let currentSkin = 'robot'; let currentType = 'robot';
    if (window.aiPet) {
        currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        currentType = currentSkin.split('_')[0]; 
    }
    
    s.player.type = currentType;
    s.player.skin = currentSkin;
    s.player.atkBuff = 0; s.player.defBuff = 0;

    // ★追加：育成モードからのステータス引継ぎ
    let pEnergy = window.aiPet && window.aiPet.energy !== undefined ? window.aiPet.energy : 100;
    let pHunger = window.aiPet && window.aiPet.hunger !== undefined ? window.aiPet.hunger : 100;
    
    s.player.maxHunger = 100; // 上限突破用

    if (mapType === 'crystal') {
        s.player.maxHp = 100;
        s.player.hp = Math.max(1, Math.floor(100 * (pEnergy / 100))); // 現在の体力割合を引き継ぐ
        s.player.hunger = pHunger; // 満腹度を引き継ぐ
        s.player.level = 1;
        s.player.exp = 0;
        s.player.nextExp = 20;
        s.player.basePwr = 10;
        s.player.tempInventory = []; 
    } else {
        if (window.aiPet) {
            let pwr = window.aiPet.stats.power || 10;
            let gen = window.aiPet.generation || 1;
            let age = window.aiPet.age || 0;
            s.player.maxHp = 100 + (pwr * 2) + (gen * 5) + (age * 2);
            s.player.hp = Math.max(1, Math.floor(s.player.maxHp * (pEnergy / 100))); // 現在の体力割合
            s.player.hunger = pHunger; // 満腹度を引き継ぐ
            s.player.basePwr = pwr;
            s.player.tempInventory = window.aiPet.inventory ? [...window.aiPet.inventory] : [];
        }
    }
    
    window.generateDungeonFloor(); s.active = true;

    let dungeonUI = document.getElementById('dungeon-main-ui');
    if (!dungeonUI) {
        dungeonUI = document.createElement('div'); dungeonUI.id = 'dungeon-main-ui';
        dungeonUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 30000; display: flex; flex-direction: column; color: white; font-family: monospace, sans-serif; overflow: hidden;`;
        document.body.appendChild(dungeonUI);
    }
    
    let titleColor = mapType === 'crystal' ? '#E040FB' : '#00BCD4';
    let titleName = mapType === 'crystal' ? '💎 クリスタル迷宮' : '🗡️ スカルダンジョン';
    let levelHtml = mapType === 'crystal' ? `<span style="display:inline-block; margin-left:15px; color:#E040FB; font-weight:bold;">Lv.${s.player.level}</span>` : '';

    // ★ 修正：ステータスパネルの中に「持ち込みアイテム」の表示枠を追加
    dungeonUI.innerHTML = `
        <style>
            @keyframes atk-up { 0% { transform: translateY(0); } 50% { transform: translateY(-30px); } 100% { transform: translateY(0); } }
            @keyframes atk-down { 0% { transform: translateY(0); } 50% { transform: translateY(30px); } 100% { transform: translateY(0); } }
            @keyframes atk-left { 0% { transform: translateX(0); } 50% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
            @keyframes atk-right { 0% { transform: translateX(0); } 50% { transform: translateX(30px); } 100% { transform: translateX(0); } }
            .anim-atk-up { animation: atk-up 0.15s ease-out; } .anim-atk-down { animation: atk-down 0.15s ease-out; }
            .anim-atk-left { animation: atk-left 0.15s ease-out; } .anim-atk-right { animation: atk-right 0.15s ease-out; }
            
            /* ★追加：ダメージエフェクト（赤く光って揺れる） */
            @keyframes dmg-shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                50% { transform: translateX(8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                75% { transform: translateX(-8px); filter: brightness(1.5) drop-shadow(0 0 10px red); }
                100% { transform: translateX(0); filter: none; }
            }
            .anim-damage { animation: dmg-shake 0.2s ease-in-out; }
            
            /* ★追加：画面全体の振動 */
            @keyframes screen-shake {
                0% { transform: translate(0, 0); }
                20% { transform: translate(-3px, 3px); }
                40% { transform: translate(3px, -3px); }
                60% { transform: translate(-3px, -3px); }
                80% { transform: translate(3px, 3px); }
                100% { transform: translate(0, 0); }
            }
            .anim-screen-shake { animation: screen-shake 0.15s ease-in-out; }
            
            /* ★追加：ダメージ数値のポップアップ */
            /* ★追加：ダメージ数値のポップアップ */
            @keyframes dmg-popup {
                0% { transform: translateY(0) scale(1.5); opacity: 1; }
                100% { transform: translateY(-60px) scale(1); opacity: 0; }
            }
            .dmg-text {
                position: absolute; font-weight: bold; font-size: 36px;
                text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
                pointer-events: none; z-index: 1000;
                animation: dmg-popup 0.6s ease-out forwards;
            }
            
            /* ★追加：吹き飛ばし（ノックバック）の回転エフェクト */
            @keyframes spin-knockback {
                0% { transform: rotate(0deg) scale(1.2); filter: drop-shadow(0 0 10px #FF9800); }
                100% { transform: rotate(360deg) scale(1); filter: none; }
            }
            .anim-knockback { animation: spin-knockback 0.3s ease-out !important; }
            /* ★追加：ワープ、魔法、レベルアップのエフェクト */
            @keyframes warp-out-in {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0) rotate(180deg); opacity: 0; }
                100% { transform: scale(1) rotate(360deg); opacity: 1; }
            }
            .anim-warp { animation: warp-out-in 0.4s ease-in-out; }
            
            @keyframes magic-cast {
                0% { filter: drop-shadow(0 0 15px #00BCD4) brightness(1.5); transform: translateY(0); }
                50% { filter: drop-shadow(0 0 25px #E040FB) brightness(2); transform: translateY(-10px); }
                100% { filter: none; brightness(1); transform: translateY(0); }
            }
            .anim-magic { animation: magic-cast 0.5s ease-out; }
            
            @keyframes level-up-glow {
                0% { filter: drop-shadow(0 0 10px #FFD700) brightness(1.5); }
                50% { filter: drop-shadow(0 0 40px #FFEB3B) brightness(2.5); transform: scale(1.2); }
                100% { filter: none; transform: scale(1); }
            }
            .anim-levelup { animation: level-up-glow 0.8s ease-out; z-index: 10; position: relative; }
        </style>
        <div id="dg-map-container" style="position:absolute; width:100%; height:100%; overflow:hidden;">
            <div id="dg-grid" style="position:absolute; top:0; left:0; transition: transform 0.2s linear; transform-origin: 0 0;"></div>
        </div>
        <div style="position:absolute; top:0; left:0; width:100%; padding:20px; display:flex; justify-content:space-between; pointer-events:none; box-sizing:border-box; z-index:50;">
            <div style="pointer-events:auto; background:rgba(0,0,0,0.85); padding:15px 20px; border-radius:8px; border:2px solid #555; min-width:300px;">
                <div style="font-size: 22px; font-weight:bold; color:${titleColor}; margin-bottom:5px;">${titleName} B<span id="dg-floor">1</span>F</div>
                <div style="font-size: 18px;">
                    <span style="display:inline-block; width:100px;">HP: <span id="dg-hp" style="color:#4CAF50; font-weight:bold;">100</span> / <span id="dg-max-hp">100</span></span>
                    <span style="display:inline-block; margin-left:15px;">満腹: <span id="dg-hunger" style="color:#FF9800; font-weight:bold;">100</span>%</span>
                    <span id="dg-level-display">${levelHtml}</span>
                </div>
                <div id="dg-inventory-container" style="margin-top: 12px; border-top: 1px dashed #555; padding-top: 8px; display: block;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 12px; color: #aaa;">🎒 持ち込みアイテム (自動消費)</span>
                        <button onclick="window.showEquipDetailsModal()" style="padding:4px 8px; background:#FF9800; color:#fff; border:none; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.5);">🔍 装備詳細と印</button>
                    </div>
                    <div id="dg-inventory-list" style="font-size: 13px; max-height: 60px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 5px;">
                        </div>
                </div>
            </div>
            <div style="pointer-events:auto; display:flex; gap:10px; align-items:flex-start;">
                <button onclick="window.toggleDungeonModal('minimap')" style="padding:10px 15px; background:#2196F3; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">🗺️ マップ</button>
                <button onclick="window.toggleDungeonModal('log')" style="padding:10px 15px; background:#9C27B0; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">📜 ログ</button>
                <button onclick="window.closeDungeonUI(false)" style="padding:10px 15px; background:#ff5252; color:#fff; border:2px solid #FFF; border-radius:8px; font-weight:bold; cursor:pointer;">帰還する</button>
            </div>
        </div>
        <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%); pointer-events:none; width:100%; display:flex; flex-direction:column; align-items:center; z-index:50;">
            <div style="background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; display:flex; gap:10px; margin-bottom:15px; pointer-events:auto; border:1px solid #555;">
                <input type="text" id="dg-chat-input" placeholder="AIに言葉を教える..." style="padding:8px; border-radius:4px; border:none; outline:none; width:200px;">
                <button onclick="window.processDungeonChat()" style="padding:8px 15px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">送信</button>
            </div>
            <div style="color:#FFD700; font-size:16px; font-weight:bold; margin-bottom:10px; text-shadow:2px 2px 4px #000;">🧠 使える言葉</div>
            <div id="dg-known-words" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:20px; pointer-events:auto;"></div>
            <div style="display:flex; gap:15px; pointer-events:auto;">
                <button id="dg-step-btn" onclick="window.processDungeonTurn()" style="padding: 15px 30px; font-size: 20px; font-weight: bold; background: #4CAF50; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #2E7D32, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #2E7D32';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #2E7D32';">▶ 1ターン</button>
                <button id="dg-auto-btn" onclick="window.toggleDungeonAuto()" style="padding: 15px 20px; font-size: 18px; font-weight: bold; background: #2196F3; color: white; border: 4px solid #FFF; border-radius: 16px; cursor: pointer; box-shadow: 0 8px 0 #0D47A1, 0 15px 20px rgba(0,0,0,0.5); transition: transform 0.1s, box-shadow 0.1s;" onmousedown="this.style.transform='translateY(8px)'; this.style.boxShadow='0 0 0 #0D47A1';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 0 #0D47A1';">🔄 AUTO 開始</button>
            </div>
        </div>
        <div id="dg-modal-log" style="display:none; position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); width:80%; max-width:600px; height:50%; background:rgba(10,10,15,0.9); border:3px solid #9C27B0; border-radius:12px; padding:20px; flex-direction:column; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8);"><h3 style="color:#FFF; margin-top:0; border-bottom:1px solid #555; padding-bottom:10px;">📜 冒険の記録</h3><div id="dg-log-area" style="flex:1; overflow-y:auto; color:#ddd; line-height:1.8; font-size:16px; padding-right:10px;"></div><button onclick="window.toggleDungeonModal('log')" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button></div>
        <div id="dg-modal-minimap" style="display:none; position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); background:rgba(10,10,15,0.9); border:3px solid #2196F3; border-radius:12px; padding:20px; flex-direction:column; align-items:center; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.8);"><h3 style="color:#FFF; margin-top:0; width:100%; border-bottom:1px solid #555; padding-bottom:10px; text-align:center;">🗺️ ミニマップ</h3><div id="dg-minimap-content" style="background:#000; border:2px solid #555; position:relative; margin:15px 0;"></div><button onclick="window.toggleDungeonModal('minimap')" style="padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; width:100%;">閉じる</button></div>
    `;
    
    let pName = (window.aiPet && window.aiPet.name) ? window.aiPet.name : "AI";
    dungeonUI.style.display = 'flex';
    window.addDungeonLog(`=== ${pName} の冒険が始まった ===`, titleColor); 
    
    document.getElementById('dg-chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.processDungeonChat();
    });
    
    window.updateDungeonUI();
};

window.closeDungeonUI = function(isGameOver = false, isRescued = false) {
    const s = window.DUNGEON_STATE; s.active = false;
    if (s.isAuto) window.toggleDungeonAuto();
    
    // ★修正：死んだ時だけでなく「無事に帰還した時」もしっかりランキングに記録を送信する！
    if (typeof window.updateDungeonRanking === 'function') {
        window.updateDungeonRanking(s.mapType, s.floor, s.player.level);
    }
    
    let reachedFloor = s.floor; 
    let goldReward = reachedFloor * (s.mapType === 'crystal' ? 100 : 50); 
    let itemsReward = [];
    
    if (reachedFloor > 1 && (!isGameOver || isRescued)) {
        let numItems = Math.floor(reachedFloor / 2);
        const dropPool = s.mapType === 'crystal' ? ['crystal', 'item_berry'] : ['stone', 'iron', 'item_berry']; 
        for (let i = 0; i < numItems; i++) itemsReward.push(dropPool[Math.floor(Math.random() * dropPool.length)]);
        
        if (s.mapType === 'skull') {
            if (reachedFloor >= 5) itemsReward.push('mat_castle_1');
            if (reachedFloor >= 10) itemsReward.push('mat_castle_2');
            if (reachedFloor >= 20) itemsReward.push('mat_castle_3');
        } else if (s.mapType === 'crystal') {
            if (reachedFloor >= 5) itemsReward.push('mat_casino_1');
            if (reachedFloor >= 10) itemsReward.push('mat_casino_2');
            if (reachedFloor >= 20) itemsReward.push('mat_casino_3');
            if (reachedFloor >= 25) itemsReward.push('mat_card_1');
        }
    }
    
    if (isGameOver && !isRescued) { 
        goldReward = Math.floor(goldReward / 2); 
        itemsReward = itemsReward.slice(0, Math.floor(itemsReward.length / 2)); 
    }
    
    if (window.aiPet) {
        if (typeof window.aiPet.gold === 'undefined') window.aiPet.gold = 0;
        window.aiPet.gold += goldReward;
        
        // ★修正：武器と盾だけでなく、鎧と装飾品も一旦鞄に戻して持ち帰る準備をする
        if (s.player.equipWeapon) { s.player.tempInventory.push(s.player.equipWeapon); s.player.equipWeapon = null; }
        if (s.player.equipShield) { s.player.tempInventory.push(s.player.equipShield); s.player.equipShield = null; }
        if (s.player.equipArmor) { s.player.tempInventory.push(s.player.equipArmor); s.player.equipArmor = null; }
        if (s.player.equipAccessory) { s.player.tempInventory.push(s.player.equipAccessory); s.player.equipAccessory = null; }
        
        if (!window.aiPet.inventory) window.aiPet.inventory = [];

        // ★大改修：クリスタルダンジョンでも生還すれば道中のアイテムを持ち帰れる！
        if (!isGameOver || isRescued) {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = [...s.player.tempInventory]; 
            } else if (s.mapType === 'crystal') {
                s.player.tempInventory.forEach(item => window.aiPet.inventory.push(item));
            }
        } else {
            if (s.mapType === 'skull') {
                window.aiPet.inventory = []; // スカルで死んだらロスト
            }
            // クリスタルで死んだ場合は、元々のインベントリは失われない
        }
        
        itemsReward.forEach(item => window.aiPet.inventory.push(item)); 
        if (typeof saveGameData === 'function') saveGameData();
        
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
        }
    }

    // ==========================================
    // ★大追加：死んだ時の状況を「ミニチュア画面」としてコピーして表示する！
    // ==========================================
    let snapshotHtml = "";
    if (isGameOver && !isRescued) {
        let gridDiv = document.getElementById('dg-grid');
        if (gridDiv) {
            // 倒れた瞬間のマップDOMを丸ごとクローン
            let cloneGrid = gridDiv.cloneNode(true);
            cloneGrid.id = ''; 
            
            let boxW = 400; let boxH = 220; // 状況を表示する小窓のサイズ
            let logicalTileX = 100; let logicalTileY = 100;
            let prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
            let floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
            if (floorSp) { logicalTileX = floorSp.sw * (floorSp.scale || 1.0); logicalTileY = floorSp.sh * (floorSp.scale || 1.0); }
            
            // 死んだ時のプレイヤー座標を中心にカメラを合わせ直す
            let camZoom = 0.7; // ちょっとズームして状況を見やすく
            let px = s.player.x * logicalTileX + (logicalTileX / 2);
            let py = s.player.y * logicalTileY + (logicalTileY / 2);
            let nCamX = (boxW / 2) - px * camZoom;
            let nCamY = (boxH / 2) - py * camZoom;
            
            cloneGrid.style.transform = `translate(${nCamX}px, ${nCamY}px) scale(${camZoom})`;
            cloneGrid.style.transition = 'none'; // カメラのパンを防ぐ
            
            // 枠組みの作成
            let wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = `${boxW}px`;
            wrapper.style.height = `${boxH}px`;
            wrapper.style.margin = '0 auto 10px auto';
            wrapper.style.border = '3px solid #ff5252';
            wrapper.style.borderRadius = '8px';
            wrapper.style.backgroundColor = '#000';
            wrapper.style.overflow = 'hidden';
            wrapper.appendChild(cloneGrid);
            
            // ★死ぬ直前のログ（死因）を最新4行だけ抽出して貼り付ける
            let logHtml = "";
            let logArea = document.getElementById('dg-log-area');
            if (logArea && logArea.children.length > 0) {
                let lastLogs = Array.from(logArea.children).slice(-4);
                logHtml = `<div style="text-align:left; background:rgba(0,0,0,0.8); padding:8px; border-radius:6px; font-size:13px; color:#ddd; margin-bottom:15px; border:1px dashed #ff5252;">`;
                lastLogs.forEach(l => logHtml += `<div style="margin-bottom:3px;">${l.innerHTML}</div>`);
                logHtml += `</div>`;
            }

            snapshotHtml = `<div style="color:#ff5252; font-size:16px; margin-bottom:5px; font-weight:bold;">📷 倒れた瞬間の状況</div>` + wrapper.outerHTML + logHtml;
        }
    }
    // ==========================================

    let rewardHtml = `<div style="font-size:22px; margin-bottom:20px;">到達フロア: <b>B${reachedFloor}F</b></div>`;
    rewardHtml += `<div style="color:#FFD700; font-size:24px; font-weight:bold; margin-bottom:15px;">💰 ${goldReward} G 獲得！</div>`;
    
    if (itemsReward.length > 0 || (!isGameOver || isRescued)) {
        // 表示用に、持ち帰ったすべてを合算
        let displayRewards = [...itemsReward];
        if (!isGameOver || isRescued) {
            if (s.mapType === 'crystal') displayRewards = displayRewards.concat(s.player.tempInventory);
        }
        
        if (displayRewards.length > 0) {
            let itemCounts = {}; displayRewards.forEach(i => itemCounts[i] = (itemCounts[i]||0) + 1);
            rewardHtml += `<div style="text-align:left; background:#222; padding:15px; border-radius:8px; border:2px solid #555; width:80%; margin:0 auto; max-height: 200px; overflow-y: auto;">`;
            rewardHtml += `<div style="color:#aaa; font-size:14px; margin-bottom:5px;">▼ 持ち帰ったアイテム</div>`;
            for(let key in itemCounts) {
                // ★完全修正：getDungeonItemEffect を通すことで、＋値も印もすべて綺麗な日本語に翻訳される！
                let eff = window.getDungeonItemEffect(key);
                let itemName = eff ? eff.name : key;
                
                let nameColor = key.startsWith('mat_') ? '#E040FB' : '#FFF';
                // 装備品は特別な色（金色）にする
                if (eff && (eff.equipType !== null)) nameColor = '#FFD700';
                
                rewardHtml += `<div style="font-size:18px; color:${nameColor};">🎁 ${itemName} <span style="color:#4CAF50;">x ${itemCounts[key]}</span></div>`;
            }
            rewardHtml += `</div>`;
        }
    } else {
        rewardHtml += `<div style="color:#aaa; margin-top:20px;">アイテムの獲得はありませんでした。</div>`;
    }

    let actionButtons = "";
    if (isGameOver && !isRescued) {
        actionButtons = `
            <div style="display:flex; gap:15px; justify-content:center; margin-top:25px;">
                <button onclick="window.sendRescueRequest('${s.mapType}', ${s.floor})" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#2196F3; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #0D47A1;">
                    🆘 救助を要請する
                </button>
                <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                        style="padding:15px 20px; font-size:18px; font-weight:bold; background:#444; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 4px 0 #222;">
                    諦めて村へ戻る
                </button>
            </div>
            <div style="font-size:12px; color:#ff9800; margin-top:10px;">※救助を要請すると、助けが来るまでゲームが進行できなくなります。</div>
        `;
    } else {
        let titleWord = isRescued ? '👼 救助されました！' : '✨ 探索完了！';
        actionButtons = `
            <button onclick="document.getElementById('dg-result-ui').style.display='none'; document.getElementById('dungeon-main-ui').style.display='none';" 
                    style="margin-top:30px; padding:15px 40px; font-size:20px; font-weight:bold; background:#4CAF50; color:white; border:2px solid #FFF; border-radius:8px; cursor:pointer; box-shadow:0 6px 0 #2E7D32;">
                ${isRescued ? '冒険を再開する！' : '村へ戻る ➔'}
            </button>
        `;
    }

    let resultUI = document.getElementById('dg-result-ui');
    if (!resultUI) {
        resultUI = document.createElement('div'); resultUI.id = 'dg-result-ui';
        resultUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 40000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif; overflow-y:auto;`;
        document.body.appendChild(resultUI);
    }
    
    let resultTitle = isGameOver && !isRescued ? '💀 探索失敗...' : (isRescued ? '👼 救助成功！' : '✨ 探索完了！');
    let titleColorStr = isGameOver && !isRescued ? '#ff5252' : '#FFD700';

    resultUI.innerHTML = `
        <div style="background:#1a1a1a; border:4px solid ${titleColorStr}; border-radius:12px; padding:30px; text-align:center; min-width:400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); margin: 20px 0;">
            <h2 style="color:${titleColorStr}; font-size:32px; margin-top:0; margin-bottom:15px;">${resultTitle}</h2>
            ${snapshotHtml} ${rewardHtml}
            ${actionButtons}
        </div>
    `;
    resultUI.style.display = 'flex';
};

// 救助要請ボタンを押した時の処理
window.sendRescueRequest = async function(mapType, floor) {
    // ボタンを無効化
    event.target.disabled = true;
    event.target.innerHTML = "⏳ 要請送信中...";
    
    if (typeof window.requestRescue === 'function') {
        const success = await window.requestRescue(mapType, floor);
        if (success) {
            // 要請に成功したら、ゲーム全体を「救助待ち画面」で覆ってロックする
            document.getElementById('dg-result-ui').style.display = 'none';
            document.getElementById('dungeon-main-ui').style.display = 'none';
            window.showRescueWaitingScreen();
        } else {
            alert("通信エラー：救助要請を送信できませんでした。ログイン状態を確認してください。");
            event.target.disabled = false;
            event.target.innerHTML = "🆘 救助を要請する";
        }
    }
};

// 救助待ち画面の表示（ゲームのロック）
window.showRescueWaitingScreen = function() {
    let waitingUI = document.getElementById('rescue-waiting-ui');
    if (!waitingUI) {
        waitingUI = document.createElement('div'); waitingUI.id = 'rescue-waiting-ui';
        waitingUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 50000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
        document.body.appendChild(waitingUI);
    }
    
    waitingUI.innerHTML = `
        <div style="text-align:center;">
            <h1 style="color:#2196F3; font-size:40px; margin-bottom:10px;">🆘 救助待ち...</h1>
            <p style="font-size:18px; color:#aaa; line-height:1.6; margin-bottom:30px;">
                他の冒険者が同じダンジョンを探索し、<br>
                あなたの倒れた階層にたどり着くのを待っています。<br>
                （この画面を閉じたりリロードしても状態は保持されます）
            </p>
            <div id="rescue-check-status" style="font-size:24px; font-weight:bold; color:#FFD700; margin-bottom:30px;">
                📡 空の彼方へ通信中...
            </div>
            <button onclick="window.cancelRescueRequest()" 
                    style="padding:12px 20px; font-size:16px; background:#444; color:white; border:none; border-radius:8px; cursor:pointer;">
                救助を諦めて村へ戻る（アイテムは全て失われます）
            </button>
        </div>
    `;
    waitingUI.style.display = 'flex';
    
    // ★修正: 20秒ごとに救助されたかチェックする（無料枠節約のために間隔を延長！）
    window.rescueCheckInterval = setInterval(async () => {
        if (typeof window.checkMyRescueStatus === 'function') {
            const isRescued = await window.checkMyRescueStatus();
            if (isRescued) {
                clearInterval(window.rescueCheckInterval);
                document.getElementById('rescue-check-status').innerHTML = "👼 救助されました！！";
                document.getElementById('rescue-check-status').style.color = "#4CAF50";
                
                // 3秒後に救助待ち画面を消して、ダンジョンUIを再開モードで開く
                setTimeout(() => {
                    document.getElementById('rescue-waiting-ui').style.display = 'none';
                    localStorage.removeItem('rescue_waiting_map');
                    localStorage.removeItem('rescue_waiting_floor');
                    
                    // HPと満腹度を半分にして復活！
                    window.DUNGEON_STATE.player.hp = Math.floor(window.DUNGEON_STATE.player.maxHp / 2);
                    window.DUNGEON_STATE.player.hunger = 50;
                    
                    // リザルト画面（救助成功版）を表示して再開
                    window.closeDungeonUI(false, true); 
                }, 3000);
            }
        }
    }, 20000);
};

// 救助を諦める処理
window.cancelRescueRequest = function() {
    if (confirm("本当に救助を諦めますか？（持ち物は全て失われます）")) {
        clearInterval(window.rescueCheckInterval);
        document.getElementById('rescue-waiting-ui').style.display = 'none';
        localStorage.removeItem('rescue_waiting_map');
        localStorage.removeItem('rescue_waiting_floor');
        // 諦めた場合は完全にロスト（何も渡さずUIを消す）
        if (window.aiPet) window.aiPet.inventory = [];
        if (typeof saveGameData === 'function') saveGameData();
    }
};

// ゲーム読み込み時に救助待ち状態なら画面をロックする（main.jsなどの初期化処理に後で追加します）
if (localStorage.getItem('rescue_waiting_map')) {
    setTimeout(window.showRescueWaitingScreen, 1000);
}

// ==========================================
// ★ 視界判定用の共通関数（新規追加）
// ==========================================
window.isTileVisible = function(s, tx, ty) {
    let currentTile = s.grid[s.player.y][s.player.x];
    let isCorridor = (currentTile === 3); // 3は通路
    
    let baseSightRadius = isCorridor ? 1.5 : 1.5; 
    if (s.player.type === 'bird') baseSightRadius += 2.0; // 鳥は通路でも目が良い

    // ①自分の周囲の狭い円形は常に見える
    const dist = Math.sqrt(Math.pow(tx - s.player.x, 2) + Math.pow(ty - s.player.y, 2));
    if (dist <= baseSightRadius) return true;

    // ②自分が部屋にいる場合、その部屋の全域（＋周囲1マスの壁）は見える
    if (!isCorridor && s.roomsInfo) {
        for (let r of s.roomsInfo) {
            // 自分がこの部屋の中にいるか？
            if (s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) {
                // 対象のタイルがこの部屋（周囲の壁を含む）か？
                if (tx >= r.x - 1 && tx < r.x + r.w + 1 && ty >= r.y - 1 && ty < r.y + r.h + 1) {
                    return true;
                }
            }
        }
    }
    return false;
};

// ★非同期処理(async)に変更し、クラウドから救助データを取得するようにしました
window.generateDungeonFloor = async function() {
    const s = window.DUNGEON_STATE;
    s.grid = []; s.enemies = []; s.visited = []; s.roomsInfo = []; 
    s.rescueTargets = []; s.items = []; s.traps = [];
    
    for(let y = 0; y < s.mapHeight; y++) {
        s.grid[y] = new Array(s.mapWidth).fill(1);
        s.visited[y] = new Array(s.mapWidth).fill(false); 
    }
    const rooms = []; const numRooms = 4 + Math.floor(Math.random() * 4); 

    for (let i = 0; i < numRooms; i++) {
        let rw = 5 + Math.floor(Math.random() * 4); let rh = 5 + Math.floor(Math.random() * 4); 
        let rx = 2 + Math.floor(Math.random() * (s.mapWidth - rw - 4)); let ry = 2 + Math.floor(Math.random() * (s.mapHeight - rh - 4));
        
        // ★追加: 20%の確率でその部屋を「暗闇部屋（松明がない）」にする
        let isDark = Math.random() < 0.20; 
        s.roomsInfo.push({ x: rx, y: ry, w: rw, h: rh, isDark: isDark });
        
        for (let y = ry; y < ry + rh; y++) { for (let x = rx; x < rx + rw; x++) s.grid[y][x] = 0; } 
        
        let center = { x: Math.floor(rx + rw/2), y: Math.floor(ry + rh/2) }; rooms.push(center);
        if (i > 0) {
            let prev = rooms[i-1];
            let xStart = Math.min(prev.x, center.x); let xEnd = Math.max(prev.x, center.x);
            for (let x = xStart; x <= xEnd; x++) { if (s.grid[prev.y][x] === 1) s.grid[prev.y][x] = 3; }
            let yStart = Math.min(prev.y, center.y); let yEnd = Math.max(prev.y, center.y);
            for (let y = yStart; y <= yEnd; y++) { if (s.grid[y][center.x] === 1) s.grid[y][center.x] = 3; }
        }
    }

    // ==========================================
    // ★ 修正：絶対に詰まない「安全な」特殊地形の生成ロジック
    // ==========================================
    let lastRoom = rooms[rooms.length - 1]; // 階段のある部屋
    s.roomsInfo.forEach(r => {
        if (Math.random() < 0.4) { // 40%の確率で生成
            let gType = Math.random() < 0.5 ? 4 : 5; // 4: 水脈, 5: マグマ
            
            // 鉄則1：部屋の外周1マス（通路との接続部分）には絶対に置かない
            let innerW = r.w - 2;
            let innerH = r.h - 2;
            
            if (innerW >= 2 && innerH >= 2) {
                // 2x2 か 3x2 などの長方形の塊にする（部屋を分断しないサイズ）
                let gw = 2 + Math.floor(Math.random() * 2);
                let gh = 2;
                if (Math.random() < 0.5) { gw = 2; gh = 2 + Math.floor(Math.random() * 2); }
                
                let gx = r.x + 1 + Math.floor(Math.random() * (innerW - gw + 1));
                let gy = r.y + 1 + Math.floor(Math.random() * (innerH - gh + 1));
                
                for(let y = gy; y < gy + gh; y++) {
                    for(let x = gx; x < gx + gw; x++) {
                        // 鉄則2：スタート地点（プレイヤー初期位置）の周囲1マスには置かない
                        if (Math.abs(x - s.player.x) <= 1 && Math.abs(y - s.player.y) <= 1) continue;
                        // 鉄則3：階段の周囲1マスには置かない
                        if (Math.abs(x - lastRoom.x) <= 1 && Math.abs(y - lastRoom.y) <= 1) continue;
                        
                        if (s.grid[y][x] === 0) s.grid[y][x] = gType; 
                    }
                }
            }
        }
    });

    s.player.x = rooms[0].x; s.player.y = rooms[0].y;
    lastRoom = rooms[rooms.length - 1]; 
    s.grid[lastRoom.y][lastRoom.x] = 2; // 階段

    // 敵・アイテム・罠の生成
    const enemyCount = 3 + Math.floor(s.floor / 3); 
    const eHpBase = s.mapType === 'crystal' ? 10 : 20; const eDmgBase = s.mapType === 'crystal' ? 3 : 5;   
    for(let i=0; i<enemyCount; i++) {
        // ★修正: rooms ではなく、幅と高さを持つ s.roomsInfo を参照するように変更
        let roomIdx = 1 + Math.floor(Math.random() * (s.roomsInfo.length - 1)); let r = s.roomsInfo[roomIdx];
        let ex, ey; let attempts = 0;
        do { ex = r.x + Math.floor(Math.random() * r.w); ey = r.y + Math.floor(Math.random() * r.h); attempts++;
        } while ((s.grid[ey][ex] !== 0 || (ex === s.player.x && ey === s.player.y)) && attempts < 50);
        
        let eType = window._dungeonAiTypesList[Math.floor(Math.random() * window._dungeonAiTypesList.length)];
        s.enemies.push({ id: 'e_'+i, x: ex, y: ey, hp: eHpBase + s.floor * 3, maxHp: eHpBase + s.floor * 3, damage: eDmgBase + s.floor * 1, name: `迷宮の${eType}`, type: eType, face: 'down', attackAnim: false, status: { poison:0, confusion:0 } });
    }

    // ==========================================
    // ★ 上書き：アイテム生成（新アイテム追加と呪いの付与）
    // ==========================================
    const dropTable = [ 
        { id: 'herb', name: '薬草', weight: 20 }, { id: 'item_berry', name: '野イチゴ', weight: 15 }, 
        { id: 'item_bread', name: '大きなパン', weight: 15 }, { id: 'item_seed_happy', name: 'しあわせの種', weight: 3 },
        { id: 'item_scroll_sleep', name: '睡眠の巻物', weight: 7 }, { id: 'item_scroll_confuse', name: '混乱の巻物', weight: 7 }, // ★追加
        { id: 'item_wand_fire', name: '火竜の杖', weight: 7 }, { id: 'item_wand_swap', name: '場所替えの杖', weight: 5 }, // ★追加
        { id: 'item_wand_blow', name: '吹き飛ばしの杖', weight: 5 }, // ★追加
        { id: 'item_sword_iron', name: '鉄の剣', weight: 10 }, { id: 'item_sword_double', name: '連撃の剣', weight: 4 }, 
        { id: 'item_shield_wood', name: '木の盾', weight: 10 }, { id: 'item_shield_counter', name: '反撃の盾', weight: 4 }, 
        { id: 'item_shield_hara', name: 'ハラモチの盾', weight: 4 }, { id: 'item_armor_iron', name: '鉄の鎧', weight: 8 }, 
        { id: 'item_ring_haste', name: '俊足の腕輪', weight: 2 }, { id: 'item_ring_heal', name: '回復の指輪', weight: 2 } 
    ];
    let itemCount = 2 + Math.floor(Math.random() * 3);
    let totalWeight = dropTable.reduce((sum, item) => sum + item.weight, 0);
    
    for(let i=0; i<itemCount; i++) {
        let roomIdx = Math.floor(Math.random() * s.roomsInfo.length); let r = s.roomsInfo[roomIdx];
        let ix, iy; let attempts = 0;
        do { ix = r.x + Math.floor(Math.random() * r.w); iy = r.y + Math.floor(Math.random() * r.h); attempts++;
        } while ((s.grid[iy][ix] !== 0 || (ix === s.player.x && iy === s.player.y)) && attempts < 50);
        
        let rand = Math.random() * totalWeight; let dropped = dropTable[0];
        for (let item of dropTable) { if (rand < item.weight) { dropped = item; break; } rand -= item.weight; }
        
        let finalKey = dropped.id;
        // ★装備品（武器・盾・鎧・装飾品）の場合、15%の確率で「呪い」が付与される！
        let isEquip = finalKey.includes('sword') || finalKey.includes('shield') || finalKey.includes('armor') || finalKey.includes('ring');
        if (isEquip && Math.random() < 0.15) {
            finalKey += '_curse';
        }
        
        s.items.push({ id: `item_${Date.now()}_${i}`, key: finalKey, name: dropped.name, x: ix, y: iy });
    }

    // 罠生成
    const trapTypes = [ { type: 'poison', name: '毒矢の罠' }, { type: 'mine', name: '地雷' }, { type: 'blind', name: '泥水の罠' }, { type: 'bear_trap', name: 'トラバサミ' } ];
    let trapCount = 1 + Math.floor(s.floor / 3);
    for(let i=0; i<trapCount; i++) {
        let roomIdx = Math.floor(Math.random() * rooms.length); let r = s.roomsInfo[roomIdx];
        let tx, ty; let attempts = 0;
        do {
            tx = r.x + Math.floor(Math.random() * r.w); ty = r.y + Math.floor(Math.random() * r.h); attempts++;
        } while ((s.grid[ty][tx] !== 0 || (tx === s.player.x && ty === s.player.y) || s.items.some(it => it.x===tx && it.y===ty)) && attempts < 50);
        let tData = trapTypes[Math.floor(Math.random() * trapTypes.length)];
        s.traps.push({ id: `trap_${Date.now()}_${i}`, type: tData.type, name: tData.name, x: tx, y: ty, visible: false });
    }

    if (typeof window.fetchRescueRequests === 'function') {
        try {
            const requests = await window.fetchRescueRequests(s.mapType);
            requests.forEach(req => {
                if (req.floor === s.floor) {
                    let roomIdx = Math.floor(Math.random() * s.roomsInfo.length); let r = s.roomsInfo[roomIdx];
                    let rx, ry; let attempts = 0;
                    do {
                        rx = r.x + Math.floor(Math.random() * r.w); ry = r.y + Math.floor(Math.random() * r.h); attempts++;
                    } while ((s.grid[ry][rx] !== 0 || (rx === s.player.x && ry === s.player.y)) && attempts < 50);
                    s.rescueTargets.push({ id: req.requesterId, name: req.requesterName, skin: req.aiSkin, x: rx, y: ry, rescued: false });
                }
            });
        } catch(e) { console.error("救助データ配置エラー:", e); }
    }
    
    window.updateDungeonUI();
};

window.updateDungeonUI = function() {
    const s = window.DUNGEON_STATE; const container = document.getElementById('dg-map-container'); const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv || !container) return;

    let prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';

    const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
    const logicalTileX = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
    const logicalTileY = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

    gridDiv.style.width = `${s.mapWidth * logicalTileX}px`; gridDiv.style.height = `${s.mapHeight * logicalTileY}px`; gridDiv.innerHTML = '';
    const cw = container.clientWidth; const ch = container.clientHeight;
    
    const camZoom = 0.6; 
    const playerPixelX = s.player.x * logicalTileX + (logicalTileX / 2); 
    const playerPixelY = s.player.y * logicalTileY + (logicalTileY / 2);
    const camX = (cw / 2) - playerPixelX * camZoom; 
    const camY = (ch / 2) - playerPixelY * camZoom;
    gridDiv.style.transform = `translate(${camX}px, ${camY}px) scale(${camZoom})`;

    const viewDistX = Math.ceil((cw / 2 / camZoom) / logicalTileX) + 2; 
    const viewDistY = Math.ceil((ch / 2 / camZoom) / logicalTileY) + 2;
    const startX = Math.max(0, s.player.x - viewDistX); const endX = Math.min(s.mapWidth - 1, s.player.x + viewDistX);
    const startY = Math.max(0, s.player.y - viewDistY); const endY = Math.min(s.mapHeight - 1, s.player.y + viewDistY);

    if (!s.visited) s.visited = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(false));

    let currentRoom = s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h);
    let isDarkRoom = currentRoom ? currentRoom.isDark : false;
    let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom; 

    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (!isBlind && window.isTileVisible(s, x, y)) s.visited[y][x] = true;
            else if (isBlind && Math.abs(x - s.player.x) + Math.abs(y - s.player.y) <= 1) s.visited[y][x] = true;
        }
    }

    let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 

    // ★ 配置時のY軸オフセット計算（床や罠は下揃え、キャラは中央揃え）
    const getOffsetY = (key, sp) => {
        const isOverlay = key.startsWith('skull_') || key.startsWith('crystal_') || key.startsWith('gimmick_') || key.startsWith('trap_') || key.startsWith('spr_item_');
        return isOverlay ? (logicalTileY - sp.sh) : (logicalTileY - sp.sh) / 2;
    };

    for(let y = startY; y <= endY; y++) {
        for(let x = startX; x <= endX; x++) {
            if (!s.visited[y][x]) continue; 
            
            let isVisibleNow = !isBlind ? window.isTileVisible(s, x, y) : (Math.abs(x - s.player.x) + Math.abs(y - s.player.y) <= 1);
            let brightness = 0.2; 
            
            if (isVisibleNow) {
                let inRoom = (!isCorridor && s.roomsInfo.some(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h && x >= r.x - 1 && x < r.x + r.w + 1 && y >= r.y - 1 && y < r.y + r.h + 1));
                if (inRoom && !isDarkRoom) { brightness = 1.0; } 
                else {
                    const dist = Math.sqrt(Math.pow(x - s.player.x, 2) + Math.pow(y - s.player.y, 2));
                    let baseRad = s.player.type === 'bird' ? 3.5 : 1.5;
                    brightness = dist > baseRad - 0.5 ? 0.6 : 1.0;
                }
            }

            let tileType = s.grid[y][x];
            let key = `${prefix}floor`;
            if (tileType === 1) key = `${prefix}wall`;
            else if (tileType === 2) key = `${prefix}stair`;
            else if (tileType === 4) key = `gimmick_water`;
            else if (tileType === 5) key = `gimmick_magma`;
            
            const tile = window.createDungeonSprite(key, y * 10, brightness, false, logicalTileX);
            if (tile) { 
                const sp = window.DUNGEON_SPRITES[key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(key, sp) : 0;
                tile.style.left = `${x * logicalTileX + offsetX}px`; tile.style.top = `${y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(tile); 
            }
        }
    }

    if (s.traps) {
        s.traps.forEach(t => {
            if (!t.visible || !window.isTileVisible(s, t.x, t.y)) return;
            let sprKey = `trap_${t.type}`; 
            const trapDiv = window.createDungeonSprite(sprKey, t.y * 10 + 1, 1.0, false, logicalTileX);
            if (trapDiv) {
                const sp = window.DUNGEON_SPRITES[sprKey];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(sprKey, sp) : 0;
                trapDiv.style.left = `${t.x * logicalTileX + offsetX}px`; trapDiv.style.top = `${t.y * logicalTileY + offsetY}px`;
                gridDiv.appendChild(trapDiv);
            }
        });
    }

    if (s.items) {
        s.items.forEach(i => {
            if (!window.isTileVisible(s, i.x, i.y)) return;
            let sprKey = 'spr_item_bag'; 
            if (i.key.includes('herb') || i.key.includes('berry') || i.key.includes('bread') || i.key.includes('seed')) sprKey = 'spr_item_herb';
            else if (i.key.includes('scroll')) sprKey = 'spr_item_scroll';
            else if (i.key.includes('wand')) sprKey = 'spr_item_wand';
            
            const itemDiv = window.createDungeonSprite(sprKey, i.y * 10 + 1, 1.0, false, logicalTileX);
            if (itemDiv) {
                const sp = window.DUNGEON_SPRITES[sprKey];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; 
                const offsetY = sp ? getOffsetY(sprKey, sp) : 0;
                itemDiv.style.left = `${i.x * logicalTileX + offsetX}px`; itemDiv.style.top = `${i.y * logicalTileY + offsetY}px`;
                itemDiv.style.animation = "atk-up 2s infinite ease-in-out"; 
                gridDiv.appendChild(itemDiv);
            }
        });
    }

    if (s.rescueTargets) {
        s.rescueTargets.forEach(t => {
            if(t.rescued || !window.isTileVisible(s, t.x, t.y)) return; 
            const targetDiv = window.createDungeonSprite(`${t.skin}_down`, t.y * 10 + 2, 1.0, false, logicalTileX);
            if (targetDiv) {
                const sp = window.DUNGEON_SPRITES[`${t.skin}_down`];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
                targetDiv.style.left = `${t.x * logicalTileX + offsetX}px`; targetDiv.style.top = `${t.y * logicalTileY + offsetY}px`; 
                targetDiv.style.filter = "grayscale(100%) opacity(0.7)"; 
                const sosMark = document.createElement('div');
                sosMark.innerText = "🆘"; sosMark.style.position = "absolute"; sosMark.style.top = "-30px"; sosMark.style.fontSize = "30px";
                sosMark.style.textShadow = "0 0 5px red"; sosMark.style.animation = "atk-up 1s infinite"; 
                targetDiv.appendChild(sosMark); gridDiv.appendChild(targetDiv);
            }
        });
    }

    s.enemies.forEach(e => {
        if(e.hp <= 0 || e.x < startX || e.x > endX || e.y < startY || e.y > endY || !window.isTileVisible(s, e.x, e.y)) return;
        const enemyDiv = window.createDungeonSprite(`${e.type}_${e.face}`, e.y * 10 + 5, 1.0, true, logicalTileX);
        if (enemyDiv) {
            const sp = window.DUNGEON_SPRITES[`${e.type}_${e.face}`];
            const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
            enemyDiv.style.left = `${e.x * logicalTileX + offsetX}px`; enemyDiv.style.top = `${e.y * logicalTileY + offsetY}px`; enemyDiv.style.transition = 'left 0.2s, top 0.2s';
            if (e.attackAnim) { enemyDiv.classList.add(`anim-atk-${e.face}`); e.attackAnim = false; }
            if (e.damageAnim) { enemyDiv.classList.add(`anim-damage`); e.damageAnim = false; } 
            if (e.warpAnim) { enemyDiv.classList.add(`anim-warp`); e.warpAnim = false; } 
            if (e.charmed) {
                const zzz = document.createElement('div'); zzz.innerText = "Zzz"; zzz.style.position = "absolute"; zzz.style.top = "-20px"; zzz.style.right = "-5px";
                zzz.style.color = "#B39DDB"; zzz.style.fontWeight = "bold"; zzz.style.fontSize = "16px"; zzz.style.textShadow = "1px 1px 2px #000";
                zzz.style.animation = "atk-up 1.5s infinite linear"; enemyDiv.appendChild(zzz);
            }
            gridDiv.appendChild(enemyDiv);
        }
    });

    let stateStr = "";
    if (s.player.equipWeapon && s.player.equipShield) stateStr = "_sword_shield";
    else if (s.player.equipWeapon) stateStr = "_sword";
    else if (s.player.equipShield) stateStr = "_shield";
    let pKey = `${s.player.type}${stateStr}_${s.player.face}`;
    let pSp = window.DUNGEON_SPRITES[pKey];
    if (!pSp) { pKey = `${s.player.type}_${s.player.face}`; pSp = window.DUNGEON_SPRITES[pKey]; }

    if (pSp) {
        const pDiv = window.createDungeonSprite(pKey, s.player.y * 10 + 5, 1.0, false, logicalTileX);
        if (pDiv) {
            const offsetX = (logicalTileX - pSp.sw) / 2; const offsetY = (logicalTileY - pSp.sh) / 2;
            pDiv.style.left = `${s.player.x * logicalTileX + offsetX}px`; pDiv.style.top = `${s.player.y * logicalTileY + offsetY}px`; pDiv.style.transition = 'left 0.2s, top 0.2s';
            if (s.player.attackAnim) { pDiv.classList.add(`anim-atk-${s.player.face}`); s.player.attackAnim = false; }
            if (s.player.damageAnim) { pDiv.classList.add(`anim-damage`); s.player.damageAnim = false; } 
            if (s.player.knockbackAnim) { pDiv.classList.add(`anim-knockback`); s.player.knockbackAnim = false; } 
            if (s.player.levelUpAnim) { pDiv.classList.add(`anim-levelup`); s.player.levelUpAnim = false; } 
            if (s.player.magicAnim) { pDiv.classList.add(`anim-magic`); s.player.magicAnim = false; } 
            gridDiv.appendChild(pDiv);
        }
    }

    document.getElementById('dg-hp').innerText = Math.max(0, Math.floor(s.player.hp)); 
    document.getElementById('dg-max-hp').innerText = Math.floor(s.player.maxHp); 
    document.getElementById('dg-floor').innerText = s.floor;
    document.getElementById('dg-hunger').innerText = Math.max(0, Math.floor(s.player.hunger));

    const invListEl = document.getElementById('dg-inventory-list');
    if (invListEl) {
        let invHtml = "";
        if (s.player.equipWeapon) { let wName = window.getDungeonItemEffect(s.player.equipWeapon).name; invHtml += `<span style="background:rgba(255,215,0,0.15); color:#FFD700; padding:3px 8px; border-radius:4px; border:1px solid #FFD700; margin-right:5px;">⚔️ ${wName} (装備中)</span>`; }
        if (s.player.equipShield) { let sName = window.getDungeonItemEffect(s.player.equipShield).name; invHtml += `<span style="background:rgba(79,195,247,0.15); color:#4fc3f7; padding:3px 8px; border-radius:4px; border:1px solid #4fc3f7; margin-right:5px;">🛡️ ${sName} (装備中)</span>`; }
        if (s.player.equipArmor) { let aName = window.getDungeonItemEffect(s.player.equipArmor).name; invHtml += `<span style="background:rgba(139,195,74,0.15); color:#8BC34A; padding:3px 8px; border-radius:4px; border:1px solid #8BC34A; margin-right:5px;">👕 ${aName} (装備中)</span>`; }
        if (s.player.equipAccessory) { let acName = window.getDungeonItemEffect(s.player.equipAccessory).name; invHtml += `<span style="background:rgba(224,64,251,0.15); color:#E040FB; padding:3px 8px; border-radius:4px; border:1px solid #E040FB; margin-right:5px;">💍 ${acName} (装備中)</span>`; }

        let counts = {};
        if (s.player.tempInventory) { s.player.tempInventory.forEach(k => counts[k] = (counts[k] || 0) + 1); }
        for (let k in counts) { let iName = window.getDungeonItemEffect(k).name; invHtml += `<span style="background:#222; padding:3px 8px; border-radius:4px; border:1px solid #555; margin-right:5px;">${iName} <span style="color:#FFD700">x${counts[k]}</span></span>`; }
        if (invHtml === "") { invHtml = `<span style="color:#888; font-size:12px;">なにも持っていない</span>`; }
        invListEl.innerHTML = invHtml;
    }

    // ★ 完全復旧：使える言葉のUI更新
    const wordsContainer = document.getElementById('dg-known-words'); 
    if (wordsContainer) {
        const myWords = (window.aiPet && window.aiPet.apprentice && window.aiPet.apprentice.learnedWords) ? window.aiPet.apprentice.learnedWords : [];
        let validCmds = [];
        myWords.forEach(w => { 
            let cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w); 
            if (cmdInfo) validCmds.push(cmdInfo); 
        });
        
        if (validCmds.length === 0) { 
            wordsContainer.innerHTML = `<span style="color:#aaa; font-size:12px;">※言葉を知らないのでランダムに行動します</span>`; 
        } else { 
            wordsContainer.innerHTML = validCmds.map(c => `<span style="background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 8px; border: 2px solid #00BCD4; color: #00BCD4; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">${c.name}</span>`).join(''); 
        }
    }

    const minimap = document.getElementById('dg-modal-minimap'); if (minimap && minimap.style.display !== 'none') window.drawMinimap();
};

window.drawMinimap = function() {
    const s = window.DUNGEON_STATE; const container = document.getElementById('dg-minimap-content'); if (!container) return;
    const miniSize = 10; container.style.width = `${s.mapWidth * miniSize}px`; container.style.height = `${s.mapHeight * miniSize}px`; container.innerHTML = '';
    
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (!s.visited || !s.visited[y][x]) continue; 
            const dot = document.createElement('div'); dot.style.position = 'absolute'; dot.style.left = `${x * miniSize}px`; dot.style.top = `${y * miniSize}px`; dot.style.width = `${miniSize}px`; dot.style.height = `${miniSize}px`;
            if (s.grid[y][x] === 1) dot.style.backgroundColor = '#444'; else if (s.grid[y][x] === 2) dot.style.backgroundColor = '#00BCD4'; else dot.style.backgroundColor = '#888'; 
            container.appendChild(dot);
        }
    }
    
    if (s.rescueTargets) {
        s.rescueTargets.forEach(t => { 
            if(t.rescued || !window.isTileVisible(s, t.x, t.y)) return; 
            const tDot = document.createElement('div'); tDot.style.position = 'absolute'; tDot.style.left = `${t.x * miniSize}px`; tDot.style.top = `${t.y * miniSize}px`; tDot.style.width = `${miniSize}px`; tDot.style.height = `${miniSize}px`; 
            tDot.style.backgroundColor = '#FFEB3B'; tDot.style.boxShadow = '0 0 3px #FFEB3B'; container.appendChild(tDot); 
        });
    }

    // ミニマップにアイテムを水色で表示
    if (s.items) {
        s.items.forEach(i => {
            if (!window.isTileVisible(s, i.x, i.y)) return;
            const iDot = document.createElement('div'); iDot.style.position = 'absolute'; iDot.style.left = `${i.x * miniSize}px`; iDot.style.top = `${i.y * miniSize}px`; iDot.style.width = `${miniSize}px`; iDot.style.height = `${miniSize}px`; 
            iDot.style.backgroundColor = '#00BCD4'; container.appendChild(iDot); 
        });
    }

    // ミニマップに見えている罠を赤紫のバツ印で表示（文字は残すがドット絵UIと分離されているため安全）
    if (s.traps) {
        s.traps.forEach(t => {
            if (!t.visible || !window.isTileVisible(s, t.x, t.y)) return;
            const tDot = document.createElement('div'); tDot.style.position = 'absolute'; tDot.style.left = `${t.x * miniSize}px`; tDot.style.top = `${t.y * miniSize}px`; tDot.style.width = `${miniSize}px`; tDot.style.height = `${miniSize}px`; 
            tDot.style.backgroundColor = '#E040FB'; tDot.innerText = 'x'; tDot.style.color = '#FFF'; tDot.style.fontSize = '8px'; tDot.style.lineHeight = '10px'; tDot.style.textAlign = 'center';
            container.appendChild(tDot); 
        });
    }

    s.enemies.forEach(e => { 
        if(e.hp <= 0 || !window.isTileVisible(s, e.x, e.y)) return; 
        const eDot = document.createElement('div'); eDot.style.position = 'absolute'; eDot.style.left = `${e.x * miniSize}px`; eDot.style.top = `${e.y * miniSize}px`; eDot.style.width = `${miniSize}px`; eDot.style.height = `${miniSize}px`; eDot.style.backgroundColor = '#ff5252'; container.appendChild(eDot); 
    });
    
    const pDot = document.createElement('div'); pDot.style.position = 'absolute'; pDot.style.left = `${s.player.x * miniSize}px`; pDot.style.top = `${s.player.y * miniSize}px`; pDot.style.width = `${miniSize}px`; pDot.style.height = `${miniSize}px`; pDot.style.backgroundColor = '#4CAF50'; pDot.style.boxShadow = '0 0 5px #4CAF50'; 
    const faceIndicator = document.createElement('div'); faceIndicator.style.position = 'absolute'; faceIndicator.style.width = '4px'; faceIndicator.style.height = '4px'; faceIndicator.style.backgroundColor = '#FFF';
    if (s.player.face === 'up') { faceIndicator.style.top = '0'; faceIndicator.style.left = '3px'; } if (s.player.face === 'down') { faceIndicator.style.bottom = '0'; faceIndicator.style.left = '3px'; }
    if (s.player.face === 'left') { faceIndicator.style.top = '3px'; faceIndicator.style.left = '0'; } if (s.player.face === 'right') { faceIndicator.style.top = '3px'; faceIndicator.style.right = '0'; }
    pDot.appendChild(faceIndicator); container.appendChild(pDot);
};

// ★ダメージ数値をポップアップさせ、画面を揺らす
window.showDungeonDamageEffect = function(x, y, dmg, isPlayer) {
    const gridDiv = document.getElementById('dg-grid');
    const container = document.getElementById('dg-map-container');
    if (!gridDiv || !container) return;

    // 画面全体の振動は消されないのでそのまま実行
    container.classList.remove('anim-screen-shake');
    void container.offsetWidth; 
    container.classList.add('anim-screen-shake');

    // ★超重要：ダメージの数字も全消去をやり過ごすために10ミリ秒待つ！
    setTimeout(() => {
        const s = window.DUNGEON_STATE;
        const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
        const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
        const logicalTileX = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
        const logicalTileY = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

        const popup = document.createElement('div');
        popup.innerText = dmg;
        popup.className = 'dmg-text';
        popup.style.left = `${x * logicalTileX + (logicalTileX / 2) - 15}px`;
        popup.style.top = `${y * logicalTileY + 20}px`;
        popup.style.color = isPlayer ? '#ff5252' : '#FFF';
        
        gridDiv.appendChild(popup);
        setTimeout(() => { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 600);
    }, 10);
};



// ★最強のエフェクト発生関数（絵文字を排除し、本格的なグラフィックを描画！）
window.playDungeonVFX = function(x, y, type) {
    const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv) return;

    // ★超重要：10ミリ秒だけ「待つ」ことで、updateDungeonUIによる画面の全消去をやり過ごす！
    setTimeout(() => {
        const s = window.DUNGEON_STATE;
        const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
        const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
        const lx = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
        const ly = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

        const vfx = document.createElement('div');
        vfx.style.position = 'absolute';
        vfx.style.left = `${x * lx}px`;
        vfx.style.top = `${y * ly}px`;
        vfx.style.width = `${lx}px`;
        vfx.style.height = `${ly}px`;
        vfx.style.pointerEvents = 'none';
        vfx.style.zIndex = 10000;
        vfx.innerText = ''; // 絵文字は使いません！

        // ==========================================
        // ★ 純粋なCSSグラフィックによるエフェクト表現
        // ==========================================
        if (type === 'warp') {
            // ワープ：空間が収縮して消えるようなシアン色のリング
            vfx.style.border = '4px solid #00BCD4';
            vfx.style.borderRadius = '50%';
            vfx.style.boxShadow = '0 0 15px #00BCD4, inset 0 0 15px #00BCD4';
            vfx.style.animation = 'vfx-warp 0.4s ease-in forwards';
        } else if (type === 'magic') {
            // 魔法詠唱：紫とシアンの発光オーラ
            vfx.style.background = 'radial-gradient(circle, rgba(224,64,251,0.6) 0%, rgba(0,188,212,0.2) 60%, transparent 80%)';
            vfx.style.animation = 'vfx-magic 0.6s ease-out forwards';
        } else if (type === 'level_up') {
            // レベルアップ：足元から天へ立ち昇る黄金の光の柱
            vfx.style.background = 'linear-gradient(to top, rgba(255,215,0,0.8) 0%, rgba(255,235,59,0.4) 50%, transparent 100%)';
            vfx.style.height = `${ly * 2}px`; 
            vfx.style.top = `${y * ly - ly}px`; 
            vfx.style.animation = 'vfx-levelup 0.8s ease-out forwards';
        } else if (type === 'sleep') {
            // 睡眠：敵を包み込む暗い紫のモヤ
            vfx.style.background = 'radial-gradient(circle, rgba(103,58,183,0.8) 0%, transparent 70%)';
            vfx.style.borderRadius = '50%';
            vfx.style.animation = 'vfx-sleep 0.8s ease-in-out forwards';
        } else if (type === 'fire') {
            // ★修正：火竜の杖のエフェクトを「下から上へ燃え上がる炎」に改良（絵文字不使用）
            vfx.style.background = 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,235,59,0.9) 20%, rgba(255,82,82,0.8) 60%, transparent 80%)';
            vfx.style.borderRadius = '50% 50% 20% 20%';
            vfx.style.animation = 'vfx-fire 0.6s ease-out forwards';
        }

        // 初回実行時のみ、専用のCSSアニメーションをシステムに注入
        if (!document.getElementById('vfx-styles')) {
            const style = document.createElement('style');
            style.id = 'vfx-styles';
            style.innerHTML = `
                @keyframes vfx-warp { 0% { transform: scale(1.5); opacity: 0; } 20% { transform: scale(1.2); opacity: 1; filter: brightness(2); } 100% { transform: scale(0); opacity: 0; } }
                @keyframes vfx-magic { 0% { transform: scale(0.5) rotate(0deg); opacity: 1; } 100% { transform: scale(1.5) rotate(180deg); opacity: 0; } }
                @keyframes vfx-levelup { 0% { transform: scaleY(0); opacity: 0; transform-origin: bottom; } 20% { transform: scaleY(1); opacity: 1; transform-origin: bottom; } 80% { transform: scaleY(1); opacity: 1; filter: brightness(1.5); transform-origin: bottom; } 100% { transform: scaleY(1.2); opacity: 0; transform-origin: bottom; } }
                @keyframes vfx-sleep { 0% { transform: scale(0.8) translateY(0); opacity: 0; } 50% { transform: scale(1.1) translateY(-10px); opacity: 1; } 100% { transform: scale(1.3) translateY(-20px); opacity: 0; } }
                /* ★修正：炎の動きをダイナミックに */
                @keyframes vfx-fire { 
                    0% { transform: scale(0.5) translateY(20px); opacity: 1; filter: brightness(2); } 
                    50% { transform: scale(1.2) translateY(-10px); opacity: 1; } 
                    100% { transform: scale(1.5) translateY(-30px); opacity: 0; filter: brightness(1); } 
                }
            `;
            document.head.appendChild(style);
        }

        gridDiv.appendChild(vfx);
        setTimeout(() => { if (vfx.parentNode) vfx.parentNode.removeChild(vfx); }, 800);
        
    }, 10); // ★10ミリ秒の待機終了
};

// ★新規追加：魔法の弾を飛ばすエフェクト
window.playProjectileVFX = function(sx, sy, tx, ty, color) {
    const gridDiv = document.getElementById('dg-grid');
    if (!gridDiv) return;
    const s = window.DUNGEON_STATE;
    const prefix = s.mapType === 'crystal' ? 'crystal_' : 'skull_';
    const floorSp = window.DUNGEON_SPRITES[`${prefix}floor`];
    const lx = floorSp ? (floorSp.sw * (floorSp.scale || 1.0)) : 100;
    const ly = floorSp ? (floorSp.sh * (floorSp.scale || 1.0)) : 100;

    const vfx = document.createElement('div');
    vfx.style.position = 'absolute';
    vfx.style.left = `${sx * lx + lx/2 - 15}px`;
    vfx.style.top = `${sy * ly + ly/2 - 15}px`;
    vfx.style.width = '30px'; vfx.style.height = '30px';
    vfx.style.borderRadius = '50%'; vfx.style.background = color;
    vfx.style.boxShadow = `0 0 20px ${color}, inset 0 0 10px #fff`;
    vfx.style.zIndex = 10000; vfx.style.pointerEvents = 'none';
    vfx.style.transition = 'all 0.15s linear'; // 弾の飛ぶ速度
    
    gridDiv.appendChild(vfx);
    setTimeout(() => { vfx.style.left = `${tx * lx + lx/2 - 15}px`; vfx.style.top = `${ty * ly + ly/2 - 15}px`; }, 10);
    setTimeout(() => { if (vfx.parentNode) vfx.parentNode.removeChild(vfx); }, 160);
};

window.dealDungeonDamage = function(attacker, defender) {
    let s = window.DUNGEON_STATE;

    // ==========================================
    // ★神仕様：素早さと印による「回避」＆「見切り」
    // ==========================================
    if (defender === s.player) {
        let spd = window.aiPet && window.aiPet.stats ? (window.aiPet.stats.speed || 10) : 10;
        let dodgeCap = 0.60; let extraDodge = 0;
        
        let sEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
        let aEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
        
        if ((sEff && sEff.traits.includes('light')) || (aEff && aEff.traits.includes('light'))) dodgeCap = 0.75; // [軽]で上限突破
        if ((sEff && sEff.traits.includes('dodge')) || (aEff && aEff.traits.includes('dodge'))) extraDodge += 0.15; // [避]で回避+15%
        
        let dodgeChance = Math.min(dodgeCap, spd / 333) + extraDodge;
        if (Math.random() < dodgeChance) {
            window.addDungeonLog(`ヒュンッ！ ${window.aiPet.name || 'AI'} は素早く攻撃をかわした！`, '#00e676');
            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(defender.x, defender.y, "Miss", true);
            return 0;
        }
        
        // [見] 防御印：見切り（15%で無条件無効化）
        if ((sEff && sEff.traits.includes('parry')) || (aEff && aEff.traits.includes('parry'))) {
            if (Math.random() < 0.15) {
                window.addDungeonLog(`🛡️ 装備で巧みに攻撃を弾いた！(0ダメージ)`, '#FFD700');
                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(defender.x, defender.y, "Parry!", true);
                return 0;
            }
        }
    }

    let basePwr = attacker === s.player ? s.player.basePwr : 10;
    let dmg = attacker.damage || (5 + Math.floor(basePwr * 0.5));
    let wEff = (attacker === s.player && s.player.equipWeapon) ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
    
    // ==========================================
    // ★ プレイヤーの攻撃印処理
    // ==========================================
    if (attacker === s.player && wEff) {
        dmg += wEff.atk;
        if (wEff.traits.includes('crit') && Math.random() < 0.15) {
            dmg *= 2; window.addDungeonLog(`💥 会心の一撃！`, '#ff5252'); // [会]
        }
        if (wEff.traits.includes('angry') && s.player._isAngry) {
            dmg = Math.floor(dmg * 1.5); window.addDungeonLog(`💢 怒りの痛撃！`, '#ff5252'); // [怒]
            s.player._isAngry = false;
        }
        if (wEff.traits.includes('holy') && (defender.type === 'ghost' || defender.type === 'skull')) {
            dmg *= 2; window.addDungeonLog(`✨ 聖なる一撃が弱点を突く！`, '#E040FB'); // [光]
        }
        if (wEff.traits.includes('fire')) {
            dmg += 10; window.addDungeonLog(`🔥 炎が敵を焼き焦がす！(+10)`, '#FF5252'); // [炎]
        }
    }

    let defBuff = 0;
    if (defender === s.player) {
        defBuff += Math.floor((s.player.level || 1) * 1.5);
        if (s.player.equipShield) defBuff += window.getDungeonItemEffect(s.player.equipShield).def;
        if (s.player.equipArmor) defBuff += window.getDungeonItemEffect(s.player.equipArmor).def;
    }
    if (defender.type === 'stone') defBuff += 5; 

    if (attacker.isPiercing) {
        defBuff = 0; dmg = 20 + Math.floor(s.floor * 1.0); 
        window.addDungeonLog(`💥 防御無視の強烈な魔法！`, '#E040FB');
    }

    // ==========================================
    // ★ 敵の特攻とプレイヤーの防具印処理
    // ==========================================
    if (attacker.type === 'dragon' && Math.random() < 0.2) {
        let hasAntiDragon = false;
        if (s.player.equipShield && window.getDungeonItemEffect(s.player.equipShield).traits.includes('anti_dragon')) hasAntiDragon = true;
        if (s.player.equipArmor && window.getDungeonItemEffect(s.player.equipArmor).traits.includes('anti_dragon')) hasAntiDragon = true;
        
        if (hasAntiDragon) { window.addDungeonLog(`🛡️ 竜の盾が炎のブレスを防いだ！`, '#FFD700'); } 
        else { dmg *= 2; window.addDungeonLog(`ドラゴンの猛撃！ダメージ2倍！`, '#ff5252'); }
    }

    if (attacker.type === 'magician' && !attacker.isPiercing) window.addDungeonLog(`魔法攻撃！`, '#E040FB'); 
    if (defender.type === 'ghost' && Math.random() < 0.3) { window.addDungeonLog(`ゴーストは攻撃をすり抜けた！`, '#aaa'); return 0; }
    
    dmg = Math.max(1, dmg - defBuff); 
    defender.hp -= dmg;
    defender.damageAnim = true; 
    
    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(defender.x, defender.y, dmg, defender === s.player);
    
    let defName = defender === s.player ? (window.aiPet.name || 'AI') : (defender.name || '敵');
    window.addDungeonLog(`${defName}に ${dmg} ダメージ！`, '#ff5252');

    // プレイヤーが被弾した時に[怒]フラグをセット
    if (defender === s.player) s.player._isAngry = true;

    // ==========================================
    // ★ 被弾時の反撃・睡眠カウンター印
    // ==========================================
    if (defender === s.player && !attacker.isPiercing) {
        let sEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
        let aEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
        let allDefTraits = [];
        if (sEff) allDefTraits.push(...sEff.traits);
        if (aEff) allDefTraits.push(...aEff.traits);

        if (allDefTraits.includes('counter') && attacker.hp > 0) { // [反]
            let counterDmg = Math.max(1, Math.floor(dmg / 2)); attacker.hp -= counterDmg;
            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(attacker.x, attacker.y, counterDmg, false);
            window.addDungeonLog(`🛡️ 反撃！${attacker.name}に ${counterDmg} のダメージをやり返した！`, '#FFD700');
        }
        if (allDefTraits.includes('counter_sleep') && attacker.hp > 0 && Math.random() < 0.15) { // [眠] 防具
            attacker.charmed = true; window.addDungeonLog(`💤 カウンター！敵を眠らせた！`, '#B39DDB');
        }
    }

    // ==========================================
    // ★ 攻撃ヒット後のプレイヤー武器印
    // ==========================================
    if (attacker === s.player && wEff) {
        if (wEff.traits.includes('heal') && dmg > 0) { // [癒]
            let rec = Math.max(1, Math.floor(dmg * 0.2));
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + rec);
            window.addDungeonLog(`🩸 与えたダメージからHPを ${rec} 吸収した！`, '#4CAF50');
        }
        if (wEff.traits.includes('sleep') && defender.hp > 0 && Math.random() < 0.2) { // [眠]
            defender.charmed = true; window.addDungeonLog(`💤 睡眠攻撃で敵が眠りについた！`, '#B39DDB');
        }
    }

    // 敵の特殊行動
    if (defender.hp > 0) {
        if (attacker.type === 'beetle') {
            let kx = defender.x, ky = defender.y;
            if (attacker.face === 'up') ky--; else if (attacker.face === 'down') ky++;
            else if (attacker.face === 'left') kx--; else if (attacker.face === 'right') kx++;
            if (s.grid[ky][kx] !== 1 && !s.enemies.some(e => e.hp>0 && e.x===kx && e.y===ky)) {
                defender.x = kx; defender.y = ky; defender.knockbackAnim = true;
                window.addDungeonLog(`カブトムシの角で吹き飛ばされた！`, '#FF9800');
            }
        }
        if (attacker.type === 'spirit') {
            let heal = Math.floor(dmg / 2); attacker.hp = Math.min(attacker.maxHp || 100, attacker.hp + heal);
            window.addDungeonLog(`精霊の力で ${heal} 回復！`, '#4CAF50');
        }
        if (defender.type === 'balloon') {
            let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0);
            defender.x = wx; defender.y = wy; defender.warpAnim = true; 
            window.addDungeonLog(`風船が割れてどこかへ飛んでいった！`, '#00BCD4');
        }
    } else if (defender !== s.player) {
        window.addDungeonLog(`${defender.name} を倒した！`, '#FFD700');
        
        // ★ 死亡時ボーナス印
        if (attacker === s.player && wEff) {
            if (wEff.traits.includes('exp')) { // [幸]
                s.player.exp += Math.floor(defender.maxHp * 0.5); 
                window.addDungeonLog(`✨ 経験値ボーナス！`, '#E040FB');
            }
            if (wEff.traits.includes('food') && Math.random() < 0.10) { // [食]
                let drop = Math.random() < 0.5 ? 'item_berry' : 'item_bread';
                s.player.tempInventory.push(drop); window.addDungeonLog(`🍖 モンスターが食料を落とした！`, '#FF9800');
            }
        }
        
        if (s.mapType === 'crystal' && Math.random() < 0.45) {
            const dropTable = [
                { id: 'herb', name: '薬草', weight: 20 }, { id: 'item_berry', name: '野イチゴ', weight: 15 }, { id: 'item_bread', name: '大きなパン', weight: 15 },
                { id: 'dish_stirfry', name: '野菜炒め', weight: 10 }, { id: 'item_seed_happy', name: 'しあわせの種', weight: 3 }, { id: 'item_scroll_sleep', name: '睡眠の巻物', weight: 7 }, 
                { id: 'item_wand_fire', name: '火竜の杖', weight: 7 }, { id: 'item_sword_iron', name: '鉄の剣', weight: 10 }, { id: 'item_sword_double', name: '連撃の剣', weight: 4 }, 
                { id: 'item_shield_wood', name: '木の盾', weight: 10 }, { id: 'item_shield_counter', name: '反撃の盾', weight: 4 }, { id: 'item_shield_hara', name: 'ハラモチの盾', weight: 4 },
                { id: 'item_armor_iron', name: '鉄の鎧', weight: 8 }, { id: 'item_ring_haste', name: '俊足の腕輪', weight: 2 }, { id: 'item_ring_heal', name: '回復の指輪', weight: 2 } 
            ];
            let totalWeight = dropTable.reduce((sum, item) => sum + item.weight, 0);
            let rand = Math.random() * totalWeight; let dropped = dropTable[0];
            for (let item of dropTable) { if (rand < item.weight) { dropped = item; break; } rand -= item.weight; }
            s.player.tempInventory.push(dropped.id); window.addDungeonLog(`敵は ${dropped.name} を落とした！`, '#4CAF50');
        }

        if (s.mapType === 'crystal') {
            s.player.exp += defender.maxHp;
            if (s.player.exp >= s.player.nextExp) {
                s.player.level++; s.player.exp -= s.player.nextExp; s.player.nextExp = Math.floor(s.player.nextExp * 1.5);
                s.player.maxHp += 20; s.player.hp = s.player.maxHp; s.player.basePwr += 8; 
                // ★修正：装備ボーナスを含めた本当の最大値まで全回復する！
                s.player.hunger = window.getRealMaxHunger(); 
                window.addDungeonLog(`✨ レベルアップ！ Lv.${s.player.level} になった！（体力・満腹度 全回復！） ✨`, '#E040FB');
            }
        }
    }
    return dmg;
};

window.processDungeonTurn = async function() { 
    const s = window.DUNGEON_STATE; 
    
    // ★追加: ターン重複実行を防ぐロック
    if (s.isProcessingTurn) return;
    s.isProcessingTurn = true;
    
    // ★追加: 確実なウェイト関数を内部で定義
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    try {
        const ai = window.aiPet; const aiName = ai.name || "AI"; 
        
        let tData = null;
        if (typeof charaTraits !== 'undefined') tData = charaTraits[s.player.skin] || charaTraits[s.player.type];
        let consumption = tData ? (tData.consumption || 1.0) : 1.0;
        
        s.player.hunger = Math.max(0, s.player.hunger - (1.0 * consumption));
        
        if (s.player.hunger <= 0) {
            s.player.hp -= 2;
            window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252');
        } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
        }

        if (s.player.type === 'seed' && s.floor % 5 === 0) {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5); window.addDungeonLog(`光合成で少し回復した...`, '#4CAF50');
        }

        // ==========================================
        // ★ プレイヤーのターン（素早さによる連続行動）
        // ==========================================
        let realSpd = Math.floor(ai.stats.speed || 10);
        let actionCount = 1 + Math.floor(realSpd / 50); // 50につき1回追加
        if (actionCount > 1) {
            window.addDungeonLog(`素早さを活かして ${actionCount}回 連続行動する！`, '#00e676');
        }

        // 行動回数分ループさせる
        for (let actStep = 0; actStep < actionCount; actStep++) {
            if (s.player.hp <= 0) break; // 死んでいたら途中でやめる

            let enemyAdjacent = null; let enemyInSight = null; 
            s.enemies.forEach(e => { 
                if (e.hp <= 0) return;
                let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                if (dist === 1) enemyAdjacent = e; 
                if (window.isTileVisible(s, e.x, e.y)) enemyInSight = e;
                
                if (s.player.type === 'magician' && dist <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                    if (window.isTileVisible(s, e.x, e.y)) {
                        let clear = true;
                        if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][s.player.x]===1) clear=false; }
                        else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[s.player.y][x]===1) clear=false; }
                        if(clear) enemyAdjacent = e; 
                    }
                }
            });

            if (enemyAdjacent && ai.stats && ai.stats.beauty > 20) {
                if (enemyAdjacent.type !== 'robot' && enemyAdjacent.type !== 'machine' && enemyAdjacent.type !== 'stone') {
                    let charmChance = Math.min(0.5, ai.stats.beauty / 200); 
                    if (Math.random() < charmChance) {
                        window.addDungeonLog(`敵は ${aiName} の美しさにみとれて動けない！`, '#E040FB');
                        enemyAdjacent.charmed = true; 
                    }
                }
            }

            let chosenCommand = null; 
            let smartChance = Math.min(0.95, (ai.stats.intel || 10) / 100); 
            
            let myWords = (ai.apprentice && ai.apprentice.learnedWords) ? ai.apprentice.learnedWords : [];
            let validCmdIds = [];
            myWords.forEach(w => {
                let cmd = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w);
                if (cmd && cmd.id) validCmdIds.push(cmd.id); 
            });

            let pType = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(ai.stats) : 'average';
            if (pType === 'lazy' && Math.random() < 0.2) {
                window.addDungeonLog(`${aiName} は面倒くさがって立ち止まった...`, '#aaa');
                chosenCommand = 'skip';
            } else if (pType === 'gloom' && Math.random() < 0.2) {
                window.addDungeonLog(`${aiName} は暗い気持ちになり、ため息をついた...`, '#aaa');
                chosenCommand = 'skip';
            } else if ((pType === 'idol' || pType === 'artist') && Math.random() < 0.15) {
                window.addDungeonLog(`${aiName} は敵の前で優雅にポーズを決めた！（意味はない）`, '#FFD700');
                chosenCommand = 'skip';
            }

            if (chosenCommand !== 'skip') {
                if (validCmdIds.length === 0) {
                    window.addDungeonLog(`${aiName} は言葉を知らないため、勘で動こうとしている...`, '#aaa');
                    let randomActions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack'];
                    chosenCommand = randomActions[Math.floor(Math.random() * randomActions.length)];
                } else {
                    if (Math.random() < smartChance) {
                        // ★修正：「たべる（食料・回復）」と「つかう（魔法）」を判定で明確に分ける
                        let hasFood = s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0; });
                        let hasMagic = s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length > 0; });

                        // ★追加：視界内の敵の数
                        let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y));

                        // ★修正：大ピンチの時は魔法アイテムを「つかう」、HPや満腹度が減っている時は食料を「たべる」
                        if (hasMagic && visibleEnemies.length >= 2 && validCmdIds.includes('use')) chosenCommand = 'use'; 
                        else if (s.player.hp < s.player.maxHp * 0.4 && hasFood && validCmdIds.includes('eat')) chosenCommand = 'eat'; 
                        else if (s.player.hunger < 40 && hasFood && validCmdIds.includes('eat')) chosenCommand = 'eat'; 
                        else if (s.player.hp < s.player.maxHp * 0.3 && enemyInSight && validCmdIds.includes('flee')) chosenCommand = 'flee';
                        else if ((!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                 (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                 (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                 (!s.player.equipAccessory && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'accessory'))) {
                            if (validCmdIds.includes('equip')) chosenCommand = 'equip';
                        }
                        else if (enemyAdjacent && validCmdIds.includes('attack')) chosenCommand = 'attack'; 
                        else {
                            let validMoves = [];
                            let possibleDirs = [
                                { cmd: 'move_up', dx: 0, dy: -1 }, { cmd: 'move_down', dx: 0, dy: 1 },
                                { cmd: 'move_left', dx: -1, dy: 0 }, { cmd: 'move_right', dx: 1, dy: 0 }
                            ];
                            let targetPos = null;
                            
                            // ==========================================
                            // ★ 戦術1：通路への誘い込み（各個撃破）
                            // ==========================================
                            let isCorridor = (s.grid[s.player.y][s.player.x] === 3); // 自分が通路にいるか
                            // 賢さ40以上で、部屋の中にいて、敵が2匹以上見えている場合は通路へ逃げる！
                            if (visibleEnemies.length >= 2 && !isCorridor && (ai.stats.intel || 10) >= 40) {
                                let nearestCorridor = null;
                                let minDist = Infinity;
                                for(let y=0; y<s.mapHeight; y++) {
                                    for(let x=0; x<s.mapWidth; x++) {
                                        if (s.visited[y][x] && s.grid[y][x] === 3) {
                                            let dist = Math.abs(s.player.x - x) + Math.abs(s.player.y - y);
                                            if (dist < minDist) { minDist = dist; nearestCorridor = {x: x, y: y}; }
                                        }
                                    }
                                }
                                if (nearestCorridor) {
                                    targetPos = nearestCorridor;
                                    window.addDungeonLog(`${aiName} は多勢に無勢と悟り、通路へ退いて各個撃破を狙う！`, '#00BCD4');
                                }
                            }
                            
                            // 階段を目指す（誘い込みが発動していない場合）
                            if (!targetPos) {
                                for(let y=0; y<s.mapHeight; y++) {
                                    for(let x=0; x<s.mapWidth; x++) {
                                        if (s.visited[y][x] && s.grid[y][x] === 2) { targetPos = { x: x, y: y }; break; }
                                    }
                                    if (targetPos) break;
                                }
                            }
                            
                            if (!targetPos) {
                                let nearestUnvisited = null; let minDist = Infinity;
                                for(let y=0; y<s.mapHeight; y++) {
                                    for(let x=0; x<s.mapWidth; x++) {
                                        if (!s.visited[y][x] && s.grid[y][x] !== 1) {
                                            let dist = Math.abs(s.player.x - x) + Math.abs(s.player.y - y);
                                            if (dist < minDist) { minDist = dist; nearestUnvisited = { x: x, y: y }; }
                                        }
                                    }
                                }
                                if (nearestUnvisited) targetPos = nearestUnvisited;
                            }

                            if (!targetPos && s.player.hp > s.player.maxHp * 0.4 && enemyInSight) {
                                if (enemyInSight.type === 'beetle' && (ai.stats.intel || 10) >= 50) {
                                    window.addDungeonLog(`${aiName} はカブトムシとの正面衝突を避けた！`, '#00BCD4');
                                } else {
                                    targetPos = { x: enemyInSight.x, y: enemyInSight.y };
                                }
                            }
                            
                            possibleDirs.forEach(dir => {
                                if (validCmdIds.includes(dir.cmd)) {
                                    let nx = s.player.x + dir.dx; let ny = s.player.y + dir.dy;
                                    if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1) {
                                        let score = 10;
                                        if (s.player.lastX === nx && s.player.lastY === ny) score -= 8; 
                                        
                                        if (targetPos) {
                                            let currentDist = Math.abs(s.player.x - targetPos.x) + Math.abs(s.player.y - targetPos.y);
                                            let nextDist = Math.abs(nx - targetPos.x) + Math.abs(ny - targetPos.y);
                                            if (nextDist < currentDist) score += 15; else score -= 5;
                                        }
                                        validMoves.push({ cmd: dir.cmd, score: score, nx: nx, ny: ny });
                                    }
                                }
                            });
                            
                            if (validMoves.length > 0) {
                                validMoves.sort((a, b) => b.score - a.score);
                                let topScore = validMoves[0].score;
                                let bestMoves = validMoves.filter(m => m.score === topScore);
                                chosenCommand = bestMoves[Math.floor(Math.random() * bestMoves.length)].cmd;
                            }
                        }
                    }
                }

                if (!chosenCommand) {
                    let smartValidCmds = validCmdIds.filter(cmd => {
                        // ★修正：コマンドごとの使用可能判定を更新
                        if (cmd === 'eat') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0; });
                        if (cmd === 'use') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length > 0; });
                        if (cmd === 'heal') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0 && e.hp > 0; }); // 互換性キープ用
                        if (cmd === 'equip') return (
                                 (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                 (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                 (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                 (!s.player.equipAccessory && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'accessory'))
                            );
                        if (cmd === 'unequip') return s.player.equipWeapon || s.player.equipShield || s.player.equipArmor || s.player.equipAccessory;
                        if (cmd === 'attack') return enemyAdjacent != null;
                        if (['move_up', 'move_down', 'move_left', 'move_right'].includes(cmd)) {
                            let nx = s.player.x + (cmd === 'move_right' ? 1 : cmd === 'move_left' ? -1 : 0);
                            let ny = s.player.y + (cmd === 'move_down' ? 1 : cmd === 'move_up' ? -1 : 0);
                            return nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1;
                        }
                        return true;
                    });
                    
                    if (smartValidCmds.length > 0) {
                        chosenCommand = smartValidCmds[Math.floor(Math.random() * smartValidCmds.length)];
                    } else {
                        chosenCommand = 'skip';
                    }
                }
            }

            if (typeof chosenCommand === 'object' && chosenCommand !== null) chosenCommand = chosenCommand.id;

            if (chosenCommand !== 'skip') {
                const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === chosenCommand); 
                if (cmdInfo) window.addDungeonLog(`${aiName} は「${cmdInfo.name}」と考えた！`, '#FFF');
                else { chosenCommand = 'attack'; window.addDungeonLog(`${aiName} はとっさに身構えた！`, '#ff9800'); }
            }

            let newX = s.player.x; let newY = s.player.y;

            if (chosenCommand === 'move_up') { newY--; s.player.face = 'up'; } 
            else if (chosenCommand === 'move_down') { newY++; s.player.face = 'down'; }
            else if (chosenCommand === 'move_left') { newX--; s.player.face = 'left'; } 
            else if (chosenCommand === 'move_right'){ newX++; s.player.face = 'right'; }
            else if (chosenCommand === 'flee') {
                if (enemyInSight) {
                    if (s.player.x < enemyInSight.x && s.grid[s.player.y][s.player.x - 1] !== 1) { newX--; s.player.face = 'left'; }
                    else if (s.player.x > enemyInSight.x && s.grid[s.player.y][s.player.x + 1] !== 1) { newX++; s.player.face = 'right'; }
                    else if (s.player.y < enemyInSight.y && s.grid[s.player.y - 1][s.player.x] !== 1) { newY--; s.player.face = 'up'; }
                    else if (s.player.y > enemyInSight.y && s.grid[s.player.y + 1][s.player.x] !== 1) { newY++; s.player.face = 'down'; }
                    window.addDungeonLog(`敵から遠ざかるように走った！`, '#00BCD4');
                } else { window.addDungeonLog(`キョロキョロしている。（敵がいない）`, '#aaa'); }
            }

            if (newX !== s.player.x || newY !== s.player.y) {
                if (newX >= 0 && newX < s.mapWidth && newY >= 0 && newY < s.mapHeight && s.grid[newY][newX] !== 1) {
                    let hitEnemy = s.enemies.find(e => e.x === newX && e.y === newY && e.hp > 0);
                    if (hitEnemy) { window.addDungeonLog(`ゴツン！ 敵にぶつかった！`, '#FF9800'); s.player.attackAnim = true; } 
                    else { 
                        s.player.lastX = s.player.x; 
                        s.player.lastY = s.player.y;
                        s.player.x = newX; s.player.y = newY; 
                    }
                } else {
                    window.addDungeonLog(`ガンッ！ 壁にぶつかった！`, '#aaa');
                }
            } else if (chosenCommand === 'attack') {
                if (enemyAdjacent) {
                    if (enemyAdjacent.x < s.player.x) s.player.face = 'left'; else if (enemyAdjacent.x > s.player.x) s.player.face = 'right';
                    else if (enemyAdjacent.y < s.player.y) s.player.face = 'up'; else if (enemyAdjacent.y > s.player.y) s.player.face = 'down';
                    s.player.attackAnim = true;
                    window.dealDungeonDamage(s.player, enemyAdjacent);
                    
                    let atkWait = enemyAdjacent.warpAnim ? 400 : 150;
                    window.updateDungeonUI();
                    await sleep(atkWait);
                    
                    let wEff = s.player.equipWeapon ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
                    if (wEff && wEff.traits.includes('double_attack') && enemyAdjacent.hp > 0) {
                        window.addDungeonLog(`⚔️ 連撃の剣が発動！怒涛の連続攻撃！`, '#FFD700');
                        s.player.attackAnim = true;
                        window.dealDungeonDamage(s.player, enemyAdjacent);
                        window.updateDungeonUI();
                        await sleep(150);
                    }

                } else { s.player.attackAnim = true; window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
            // ★修正：「つかう」コマンドもアイテム消費ロジックに追加
            } else if (chosenCommand === 'heal' || chosenCommand === 'eat' || chosenCommand === 'use') {
                let consumed = false;
                if (s.player.tempInventory && s.player.tempInventory.length > 0) {
                    
                    // ==========================================
                    // ★ 戦術2：アイテムのスコアリング（最適解の選択）
                    // ==========================================
                    let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1).length;
                    let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y)).length;
                    let hpRate = s.player.hp / s.player.maxHp;
                    
                    let bestItemIdx = -1;
                    let bestScore = -1;

                    for(let i=0; i<s.player.tempInventory.length; i++) {
                        let effect = window.getDungeonItemEffect(s.player.tempInventory[i]);
                        if (!effect.isConsumable) continue;
                        
                        // ★追加：コマンドに応じたアイテムのフィルタリング
                        let isMagic = effect.traits.length > 0;
                        if (chosenCommand === 'eat' && isMagic) continue; // 食べる時は魔法を除外
                        if (chosenCommand === 'use' && !isMagic) continue; // 使う時は食料を除外
                        if (chosenCommand === 'heal' && isMagic) continue; // 互換用
                        
                        let score = 0;
                        let isFull = (s.player.hp >= s.player.maxHp && s.player.hunger >= 100);
                        
                        // 効果別の必要度スコア計算
                        if (effect.traits.includes('level_up')) {
                            if (hpRate < 0.3 || (visibleEnemies >= 2 && hpRate < 0.5)) score += 100; // 超ピンチの切り札
                        } else if (effect.traits.includes('sleep_aoe')) {
                            if (visibleEnemies >= 3 || adjacentEnemies >= 2) score += 80;
                            else if (visibleEnemies >= 2 && hpRate < 0.6) score += 60;
                        } else if (effect.traits.includes('fire_damage')) {
                            if (adjacentEnemies >= 1 && hpRate < 0.8) score += 70;
                        } else {
                            if (effect.hp > 0) {
                                if (hpRate < 0.3) score += 50;
                                else if (hpRate < 0.7) score += 20;
                            }
                            if (effect.hunger > 0) {
                                if (s.player.hunger < 20) score += 60;
                                else if (s.player.hunger < 50) score += 20;
                            }
                        }

                        if (isFull && effect.traits.length === 0) score = -1; // 意味ないアイテムは弾く

                        if (score > bestScore) {
                            bestScore = score;
                            bestItemIdx = i;
                        }
                    }

                    if (bestItemIdx !== -1 && bestScore > 0) {
                        let itemId = s.player.tempInventory[bestItemIdx];
                        let effect = window.getDungeonItemEffect(itemId);

                        // ★修正：ログの出し分け（食べる or 使う）
                        if (chosenCommand === 'eat' || chosenCommand === 'heal') {
                            window.addDungeonLog(`${aiName} は ${effect.name} を食べた！`, '#4CAF50');
                            if (effect.hp > 0 || effect.hunger > 0) window.addDungeonLog(`HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                        } else {
                            window.addDungeonLog(`${aiName} は ${effect.name} を使った！`, '#00BCD4');
                        }
                        
                        s.player.tempInventory.splice(bestItemIdx, 1);
                        s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); 
                        s.player.hunger = Math.min(100, s.player.hunger + effect.hunger); 
                        
                        // 特性効果の発動
                        if (effect.traits.includes('level_up')) {
                            s.player.level = (s.player.level || 1) + 1;
                            s.player.maxHp += 20; s.player.hp = s.player.maxHp; s.player.basePwr += 8;
                            s.player.levelUpAnim = true;
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                            window.addDungeonLog(`✨ 奇跡が起きた！Lv.${s.player.level}にレベルアップした！`, '#E040FB');
                        }
                        if (effect.traits.includes('sleep_aoe')) {
                            s.player.magicAnim = true;
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            s.enemies.forEach(e => {
                                if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) {
                                    e.charmed = true; 
                                    if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); 
                                }
                            });
                            window.addDungeonLog(`部屋中の魔物たちが深い眠りについた...💤`, '#B39DDB');
                        }
                        if (effect.traits.includes('fire_damage')) {
                            s.player.magicAnim = true;
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            if (enemyAdjacent && enemyAdjacent.hp > 0) {
                                enemyAdjacent.hp -= 40;
                                if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(enemyAdjacent.x, enemyAdjacent.y, 'fire'); 
                                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(enemyAdjacent.x, enemyAdjacent.y, 40, false);
                                window.addDungeonLog(`🔥 灼熱の炎が ${enemyAdjacent.name} を焼き尽くす！(40ダメージ)`, '#FF5252');
                            } else {
                                window.addDungeonLog(`しかし目の前に敵はいなかった...（無駄遣い！）`, '#aaa');
                            }
                        }
                        consumed = true;
                    } else {
                        if (Math.random() < smartChance) {
                            window.addDungeonLog(`${aiName} は「今は必要ない」と判断して手を止めた。`, '#aaa');
                            consumed = true; 
                        } else {
                            let fallbackIdx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).isConsumable);
                            if (fallbackIdx !== -1) {
                                let effect = window.getDungeonItemEffect(s.player.tempInventory[fallbackIdx]);
                                window.addDungeonLog(`必要ないのに ${effect.name} を無駄遣いしてしまった...`, '#ff9800');
                                s.player.tempInventory.splice(fallbackIdx, 1);
                                consumed = true;
                            }
                        }
                    }
                }
                if (!consumed) { window.addDungeonLog(`しかし使えるアイテムを持っていなかった！`, '#ff5252'); }
            } else if (chosenCommand === 'equip') {
                let equippedSomething = false;
                if (!s.player.equipWeapon) {
                    let wIdx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).isWeapon);
                    if (wIdx !== -1) {
                        s.player.equipWeapon = s.player.tempInventory[wIdx];
                        s.player.tempInventory.splice(wIdx, 1);
                        window.addDungeonLog(`武器（${window.getDungeonItemEffect(s.player.equipWeapon).name}）を装備した！`, '#FFD700');
                        equippedSomething = true;
                    }
                }
                if (!s.player.equipShield && !equippedSomething) { 
                    let sIdx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).isShield);
                    if (sIdx !== -1) {
                        s.player.equipShield = s.player.tempInventory[sIdx];
                        s.player.tempInventory.splice(sIdx, 1);
                        window.addDungeonLog(`盾（${window.getDungeonItemEffect(s.player.equipShield).name}）を装備した！`, '#FFD700');
                        equippedSomething = true;
                    }
                }
                if (!equippedSomething) window.addDungeonLog(`装備できるものを持っていなかった...`, '#aaa');
            } else if (chosenCommand === 'unequip') {
                if (s.player.equipWeapon) {
                    s.player.tempInventory.push(s.player.equipWeapon); window.addDungeonLog(`武器をはずして鞄にしまった。`, '#aaa'); s.player.equipWeapon = null;
                } else if (s.player.equipShield) {
                    s.player.tempInventory.push(s.player.equipShield); window.addDungeonLog(`盾をはずして鞄にしまった。`, '#aaa'); s.player.equipShield = null;
                } else { window.addDungeonLog(`はずす装備がなかった。`, '#aaa'); }
            }

            if (s.rescueTargets) {
                let targetToRescue = s.rescueTargets.find(t => t.x === s.player.x && t.y === s.player.y && !t.rescued);
                if (targetToRescue) {
                    targetToRescue.rescued = true;
                    window.addDungeonLog(`倒れていた ${targetToRescue.name} を救助した！！`, '#FFEB3B');
                    if (typeof window.completeRescue === 'function') window.completeRescue(targetToRescue.id);
                    s.player.hp = s.player.maxHp; s.player.hunger = 100;
                    window.addDungeonLog(`感謝の光に包まれ、体力と満腹度が全回復した！✨`, '#4CAF50');
                }
            }

            if (s.grid[s.player.y][s.player.x] === 2) {
                window.addDungeonLog(`階段を見つけた！ 次のフロアへ進む！`, '#00BCD4');
                if (s.isAuto) window.toggleDungeonAuto(); 
                s.floor++; 
                (async () => { await window.generateDungeonFloor(); window.updateDungeonUI(); s.isProcessingTurn = false; })();
                return; 
            }

            // 行動ごとに描画を更新して少し待つ（連続で動いているのが見えるように）
            window.updateDungeonUI();
            if (actionCount > 1 && actStep < actionCount - 1) {
                await sleep(200);
            }
        } // ★ 行動ループはここで終了！

        // ==========================================
        // ★ 敵のターン（プレイヤーが全行動を終えた後に動く）
        // ==========================================
        s.enemies.forEach(e => {
            if (e.hp <= 0) return;
            if (e.charmed) { e.charmed = false; return; }
            let actions = 1;
            if (e.type === 'machine' && Math.random() < 0.2) actions = 2; 

            for (let a = 0; a < actions; a++) {
                if (e.hp <= 0) break;
                let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                let ex = e.x, ey = e.y, moveDir = '';

                if (e.type === 'magician' && dist <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                    if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                    e.attackAnim = true; window.dealDungeonDamage(e, s.player); return;
                }

                if (dist === 1) {
                    if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                    e.attackAnim = true; window.dealDungeonDamage(e, s.player); return; 
                } else if (dist < 6) {
                    if (Math.abs(s.player.x - e.x) > Math.abs(s.player.y - e.y)) {
                        if (e.x < s.player.x && s.grid[e.y][e.x+1] !== 1) { ex++; moveDir = 'right'; } else if (e.x > s.player.x && s.grid[e.y][e.x-1] !== 1) { ex--; moveDir = 'left'; }
                    } else {
                        if (e.y < s.player.y && s.grid[e.y+1][e.x] !== 1) { ey++; moveDir = 'down'; } else if (e.y > s.player.y && s.grid[e.y-1][e.x] !== 1) { ey--; moveDir = 'up'; }
                    }
                } else {
                    if (Math.random() < 0.6) {
                        const dirs = [];
                        if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                        if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                        if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                        if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                        if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                    }
                }
                if (moveDir !== '') {
                    let occupied = s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === ex && oe.y === ey);
                    let playerHit = (ex === s.player.x && ey === s.player.y);
                    if (!occupied && !playerHit) { e.x = ex; e.y = ey; e.face = moveDir; }
                }
            }
        });

        s.turnCount = (s.turnCount || 0) + 1;
        if (s.turnCount % 40 === 0 && s.enemies.filter(e => e.hp > 0).length < 15) {
            let rooms = s.roomsInfo;
            if (rooms && rooms.length > 0) {
                let r = rooms[Math.floor(Math.random() * rooms.length)];
                let ex, ey; let attempts = 0;
                do { 
                    ex = r.x + Math.floor(Math.random() * r.w); ey = r.y + Math.floor(Math.random() * r.h); attempts++;
                } while (attempts < 10 && (s.grid[ey][ex] !== 0 || (ex === s.player.x && ey === s.player.y) || window.isTileVisible(s, ex, ey)));
                
                if (attempts < 10) {
                    let eType = window._dungeonAiTypesList[Math.floor(Math.random() * window._dungeonAiTypesList.length)];
                    const eHpBase = s.mapType === 'crystal' ? 10 : 20;
                    const eDmgBase = s.mapType === 'crystal' ? 2 : 5;
                    s.enemies.push({ 
                        id: 'e_spawn_'+Date.now(), x: ex, y: ey, 
                        hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, 
                        damage: eDmgBase + s.floor * 2, name: `迷宮の${eType}`, type: eType, face: 'down', attackAnim: false 
                    });
                    window.addDungeonLog(`どこからか魔物の気配がする...`, '#aaa');
                }
            }
        }

        window.updateDungeonUI();

        if (s.player.hp <= 0) {
            window.addDungeonLog(`${aiName} は倒れてしまった...`, '#ff5252');
            if (s.isAuto) window.toggleDungeonAuto(); 
            setTimeout(() => { 
                if (typeof window.updateDungeonRanking === 'function') {
                    window.updateDungeonRanking(s.mapType, s.floor, s.player.level);
                }
                window.closeDungeonUI(true); 
            }, 1500);
        }
    } finally {
        s.isProcessingTurn = false; // ★ロック解除
    }
};

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

    // 素材チェックと消費
    if (this.apprentice && this.apprentice.currentMaster === 'building') {
        if (!this.inventory) this.inventory = [];
        if (bData.materials) {
            for (let mKey in bData.materials) {
                let req = bData.materials[mKey];
                while (this.inventory.filter(i => i === mKey).length < req) { this.inventory.push(mKey); }
            }
        }
    }

    let myItems = {};
    if (this.inventory) this.inventory.forEach(k => myItems[k] = (myItems[k] || 0) + 1);
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

    // ==========================================
    // ★大改修：全方位スキャン型の超賢い「橋架け」アルゴリズム
    // 既存の橋の上に立って2つ目の橋を架ける処理もこれで完璧に動きます！
    // ==========================================
    if (bId === 'bridge') {
        let bestSpot = null;
        let minDist = Infinity;

        // 指定座標に「既存の橋」があるか判定する関数
        let isOnBridge = (cx, cy) => {
            if (typeof assets !== 'undefined') {
                for (let k in assets) {
                    let a = assets[k];
                    if (a.type === 'bridge') {
                        let scale = a.scale || 0.5;
                        let w = (a.sw || 50) * scale; let h = (a.sh || 50) * scale;
                        // 判定を少し甘めにして橋の上を足場と認識しやすくする
                        if (cx >= a.dx - 10 && cx <= a.dx + w + 10 && cy >= a.dy - 10 && cy <= a.dy + h + 10) return true;
                    }
                }
            }
            return false;
        };

        // 指定座標が「足場（陸地か、または既存の橋の上）」であるかを判定
        let isWalkable = (cx, cy) => {
            if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(cx, cy)) return true;
            return isOnBridge(cx, cy);
        };

        // 画面全体（40px刻みのグリッド）をスキャンして、橋を架けるべき「水」の座標を探す
        for (let cx = 40; cx <= 760; cx += 20) {
            for (let cy = 40; cy <= 440; cy += 20) {
                // 建設予定地は「水の上」であり、かつ「まだ橋がない場所」でなければならない
                if (typeof this.isPointOnWater === 'function' && this.isPointOnWater(cx, cy) && !isOnBridge(cx, cy)) {
                    
                    // その水の周囲4方向（上下左右）に「立てる場所（足場）」があるか？
                    let offsets = [ {dx:-40, dy:0}, {dx:40, dy:0}, {dx:0, dy:-40}, {dx:0, dy:40} ];
                    for (let off of offsets) {
                        let sx = cx + off.dx;
                        let sy = cy + off.dy;
                        
                        // 足場が「陸地」または「既存の橋」であれば建設可能！
                        if (isWalkable(sx, sy)) {
                            // 今のAIの場所から一番近い候補地を選ぶ
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
        // 橋以外の建物（カード屋など）は、陸地にランダムに建てる
        for (let i = 0; i < 50; i++) {
            let checkX = 50 + Math.random() * 700; let checkY = 50 + Math.random() * 380;
            if (typeof this.isPointOnWater === 'function' && !this.isPointOnWater(checkX, checkY)) {
                tx = checkX; ty = checkY; walkX = checkX; walkY = checkY; foundSpot = true; break;
            }
        }
        if (!foundSpot) { this.message = "安全に建てられる空き地が見つからないよ..."; this.messageTimer = 120; return false; }
    }

    this.message = `${bData.name}を建てる場所へ行くよ！`; this.messageTimer = 120;
    let vSrc = (typeof catalog !== 'undefined' && catalog[bId]) ? catalog[bId] : {img: bId, sw: 50, sh: 50, sx: 0, sy: 0, scale: 0.5};

    task.buildData = {
        typeKey: bId, name: bData.name,
        visualSource: { img: vSrc.img || vSrc.image || 'field', sx: vSrc.sx || 0, sy: vSrc.sy || 0, sw: vSrc.sw || 50, sh: vSrc.sh || 50 },
        targetScale: vSrc.scale || 0.5, bestX: tx, bestY: ty, walkX: walkX, walkY: walkY, targetFlip: false, maxDurability: bData.maxDurability || -1
    };
    task._hasBeenBuilt = false;
    return true;
};

// ★ここが最も重要：確実にaiPetに完成処理を直接生やす！
aiPet.processBuildingFinish = function(task) {
    if (!task || !task.buildData || task._hasBeenBuilt) return;
    task._hasBeenBuilt = true;
    
    let bId = task.buildData.typeKey;
    let bData = (typeof buildingCatalog !== 'undefined') ? buildingCatalog[bId] : null;
    
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
        for (let mKey in bData.materials) {
            for (let i = 0; i < bData.materials[mKey]; i++) {
                let idx = this.inventory.indexOf(mKey);
                if (idx !== -1) this.inventory.splice(idx, 1);
            }
        }
        if (typeof updateStatUI === 'function') updateStatUI();
    }

    let uid = 'build_' + bId + '_' + Date.now();
    let vSrc = task.buildData.visualSource || {};

    // ★修正：透明化を防ぐため、img, sx, sy を完全に反映させる
    if (bId === 'bridge') {
        assets[uid] = {
            type: 'bridge',
            name: '橋',
            img: 'field_6',
            sx: 183, sy: 1126, sw: 769, sh: 691, scale: 0.10000000000000007,
            dx: task.buildData.bestX, 
            dy: task.buildData.bestY,
            durability: -1, maxDurability: -1
        };
    } else {
        let vSrc = task.buildData.visualSource || {};
        assets[uid] = {
            type: bId,
            name: task.buildData.name,
            img: vSrc.img || 'field',
            sx: vSrc.sx !== undefined ? vSrc.sx : 0,
            sy: vSrc.sy !== undefined ? vSrc.sy : 0,
            dx: task.buildData.bestX, 
            dy: task.buildData.bestY, 
            sw: sw, sh: sh,
            scale: task.buildData.targetScale || 0.5,
            durability: task.buildData.maxDurability || -1,
            maxDurability: task.buildData.maxDurability || -1
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

// パーティメンバー等にも反映させるための保険
if (typeof window.AICharacter !== 'undefined') {
    window.AICharacter.prototype.processBuildingStart = aiPet.processBuildingStart;
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
            for (let mKey in bData.materials) {
                for (let i = 0; i < bData.materials[mKey]; i++) {
                    let idx = this.inventory.indexOf(mKey);
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
        // ★対象がダンジョンの場合はUIを開いて探索をストップ！
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            this.actionState = 'idle';
            this.isIndoors = false;
            // ★修正：40回積まれた予定もすべて消去する！
            this.schedule = [];
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            
            if (typeof window.openDungeonUI === 'function') {
                window.openDungeonUI(this.interactionTarget.type);
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
        // ★歩いて直接ぶつかった場合もUIを開く！
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            this.actionState = 'idle';
            this.isIndoors = false;
            // ★修正：40回積まれた予定もすべて消去する！
            this.schedule = [];
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            
            if (typeof window.openDungeonUI === 'function') {
                window.openDungeonUI(this.interactionTarget.type);
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
// 🩹 最終救済パッチ（橋の完全実体化 ＆ ダンジョンUIの復旧）
// ==========================================
(function() {
    if (typeof window.aiPet === 'undefined') return;

    // 1. 透明な橋に「data.jsの画像データ」を強制注入する完成処理
    aiPet.processBuildingFinish = function(task) {
        if (!task || !task.buildData || task._hasBeenBuilt) return;
        task._hasBeenBuilt = true;
        
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
            for (let mKey in bData.materials) {
                for (let i = 0; i < bData.materials[mKey]; i++) {
                    let idx = this.inventory.indexOf(mKey);
                    if (idx !== -1) this.inventory.splice(idx, 1);
                }
            }
            if (typeof updateStatUI === 'function') updateStatUI();
        }

        let uid = 'build_' + bId + '_' + Date.now();

        // ★ ユーザー様から提供いただいたデータを直接設定！絶対に透明になりません！
        if (bId === 'bridge') {
            assets[uid] = {
                type: 'bridge',
                name: '橋',
                img: 'field_6',
                sx: 183, sy: 1126, sw: 769, sh: 691, scale: 0.10000000000000007,
                dx: task.buildData.bestX, dy: task.buildData.bestY,
                durability: -1, maxDurability: -1
            };
        } else {
            let vSrc = task.buildData.visualSource || {};
            assets[uid] = {
                type: bId, name: task.buildData.name,
                img: vSrc.img || 'field', sx: vSrc.sx || 0, sy: vSrc.sy || 0,
                dx: task.buildData.bestX, dy: task.buildData.bestY, 
                sw: vSrc.sw || 50, sh: vSrc.sh || 50, scale: task.buildData.targetScale || 0.5,
                durability: task.buildData.maxDurability || -1, maxDurability: task.buildData.maxDurability || -1
            };
        }

        if (bId === 'farm') {
            assets[uid].plantedCrop = null; assets[uid].growth = 0; assets[uid].waterLevel = 100; assets[uid].pestState = false;
        }

        this.message = `${task.buildData.name}が完成したよ！`;
        this.messageTimer = 180;
        if (typeof addFloatingText === 'function') addFloatingText(this.x, this.y - 40, "✨ 完成！", "#FFD700");
        if (typeof saveGameData === 'function') saveGameData();
        console.log(`[Build Success] ${task.buildData.name} を設置しました！`);
    };

    // 2. スカルやクリスタルに入ったら「探索」ではなくダンジョンUIを開く！
    if (!aiPet._dungeonPatchApplied) {
        aiPet._dungeonPatchApplied = true;
        
        aiPet._origProcessExploration = aiPet.processExploration;
        aiPet.processExploration = function() {
            if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
                this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
                // ★修正：40回積まれた予定もすべて消去する！
                this.schedule = [];
                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
                return;
            }
            if (typeof this._origProcessExploration === 'function') this._origProcessExploration();
        };

        aiPet._origExecuteEnterAction = aiPet.executeEnterAction;
        aiPet.executeEnterAction = function() {
            if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
                this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
                // ★修正：40回積まれた予定もすべて消去する！
                this.schedule = [];

                // ▼▼▼ 追加：ダンジョン進入時のカードアンロック ▼▼▼
                if (typeof window.triggerTCGUnlock === 'function') {
                    if (this.interactionTarget.type === 'skull') window.triggerTCGUnlock('visit_cave', this.generation);
                    if (this.interactionTarget.type === 'crystal') window.triggerTCGUnlock('visit_mine', this.generation);
                }
                // ▲▲▲ 追加おわり ▲▲▲

                if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
                if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
                return;
            }
            if (typeof this._origExecuteEnterAction === 'function') this._origExecuteEnterAction();
        };
    }

    // 3. タイマーが0になったら確実に完成処理を呼ぶフック
    if (!window._ultimateUpdateHook) {
        window._ultimateUpdateHook = true;
        const origUpdate = window.AICharacter.prototype.update;
        const newUpdate = function(dt) {
            let task = this.schedule && this.schedule.length > 0 ? this.schedule[0] : null;
            let wasBuild = task && task.type === 'build';
            
            if (typeof origUpdate === 'function') origUpdate.call(this, dt);
            
            if (wasBuild && task && task.duration <= 0 && !task.aborted && !task._hasBeenBuilt) {
                if (typeof this.processBuildingFinish === 'function') {
                    this.processBuildingFinish(task);
                }
            }
        };
        window.AICharacter.prototype.update = newUpdate;
        if (window.aiPet) window.aiPet.update = newUpdate;
    }

    // 設計図にも反映（転生後用）
    if (window.AICharacter && window.AICharacter.prototype) {
        window.AICharacter.prototype.processBuildingFinish = aiPet.processBuildingFinish;
        window.AICharacter.prototype.processExploration = aiPet.processExploration;
        window.AICharacter.prototype.executeEnterAction = aiPet.executeEnterAction;
    }
})();

// ==========================================
// 🩹 ダンジョン完全修復 ＆ 天才AI化 ＆ 連続行動パッチ（全部乗せ完全版！）
// ==========================================
(function() {
    if (typeof window.aiPet === 'undefined') return;

    // 1. ダンジョン中は裏世界の時間を完全に止める
    const _baseUpdate = window.aiPet.update;
    const _safeUpdate = function(dt) {
        if (window.DUNGEON_STATE && window.DUNGEON_STATE.active) return;
        if (typeof _baseUpdate === 'function') _baseUpdate.call(this, dt);
    };
    window.aiPet.update = _safeUpdate;
    if (window.AICharacter) window.AICharacter.prototype.update = _safeUpdate;

    // 2. ダンジョンに入った瞬間、残りの予定を消す
    const _origExplore = window.aiPet.processExploration;
    const _safeExplore = function() {
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
            this.schedule = []; 
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
            return;
        }
        if (typeof _origExplore === 'function') _origExplore.call(this);
    };
    window.aiPet.processExploration = _safeExplore;
    if (window.AICharacter) window.AICharacter.prototype.processExploration = _safeExplore;

    const _origEnter = window.aiPet.executeEnterAction;
    const _safeEnter = function() {
        if (this.interactionTarget && (this.interactionTarget.type === 'skull' || this.interactionTarget.type === 'crystal')) {
            this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
            this.schedule = []; 
            if (typeof window.updateScheduleList === 'function') window.updateScheduleList();
            if (typeof window.openDungeonUI === 'function') window.openDungeonUI(this.interactionTarget.type);
            return;
        }
        if (typeof _origEnter === 'function') _origEnter.call(this);
    };
    window.aiPet.executeEnterAction = _safeEnter;
    if (window.AICharacter) window.AICharacter.prototype.executeEnterAction = _safeEnter;

    window.processDungeonTurn = async function() { 
    const s = window.DUNGEON_STATE; 
    if (s.isProcessingTurn) return;
    s.isProcessingTurn = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    try {
        const ai = window.aiPet; const aiName = ai.name || "AI"; 
        
        let tData = typeof charaTraits !== 'undefined' ? (charaTraits[s.player.skin] || charaTraits[s.player.type]) : null;
        let consumption = tData ? (tData.consumption || 1.0) : 1.0;
        
        let shEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
        let arEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
        let acEff = s.player.equipAccessory ? window.getDungeonItemEffect(s.player.equipAccessory) : null;
        
        let allTraits = [];
        if (shEff) allTraits.push(...shEff.traits);
        if (arEff) allTraits.push(...arEff.traits);
        if (acEff) allTraits.push(...acEff.traits);

        let maxH = typeof window.getRealMaxHunger === 'function' ? window.getRealMaxHunger() : (s.player.maxHunger || 100);

        if ((allTraits.includes('regen') || allTraits.includes('life')) && s.player.hp < s.player.maxHp) {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
        }

        if (allTraits.includes('half_hunger')) consumption *= 0.5;
        if (allTraits.includes('fast_hunger')) consumption *= 2.0;
        if (allTraits.includes('regen') && consumption > 1.0) consumption = 1.0; 

        s.player.hunger = Math.max(0, s.player.hunger - (1.0 * consumption));
        
        if (s.player.hunger <= 0) {
            s.player.hp -= 2; window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252');
        } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) {
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
        }

        if (s.player.status) {
            if (s.player.status.poison > 0) {
                s.player.hp -= 3; window.addDungeonLog(`🤢 毒のダメージを受けた！(HP-3)`, '#9C27B0');
                s.player.status.poison--;
                if (s.player.status.poison <= 0) window.addDungeonLog(`毒が治った！`, '#4CAF50');
            }
            if (s.player.status.confusion > 0) {
                s.player.status.confusion--;
                if (s.player.status.confusion <= 0) window.addDungeonLog(`混乱が解けて正気を取り戻した！`, '#4CAF50');
            }
            if (s.player.status.blind > 0) {
                s.player.status.blind--;
                if (s.player.status.blind <= 0) window.addDungeonLog(`視界が元に戻った！`, '#4CAF50');
            }
            if (s.player.status.paralyzed > 0) {
                s.player.status.paralyzed--;
                if (s.player.status.paralyzed <= 0) window.addDungeonLog(`足の痺れがとれた！`, '#4CAF50');
            }
        } else {
            s.player.status = { poison: 0, confusion: 0, blind: 0, paralyzed: 0 };
        }

        let isFlying = s.player.type === 'balloon' || s.player.type === 'ghost' || s.player.type === 'bird';

        let realSpd = Math.floor(ai.stats.speed || 10);
        let actionCount = 1 + Math.floor(realSpd / 50); 
        if (acEff && acEff.traits.includes('fast_move')) {
            let plus = parseInt(s.player.equipAccessory.match(/_\+(\d+)/)?.[1] || 0);
            actionCount += 1 + Math.floor(plus / 5);
        }
        
        if (actionCount > 1) { window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676'); }

        for (let actStep = 0; actStep < actionCount; actStep++) {
            if (s.player.hp <= 0) break; 

            let currentRoom = s.roomsInfo ? s.roomsInfo.find(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h) : null;
            let isDarkRoom = currentRoom ? currentRoom.isDark : false;
            let isBlind = (s.player.status && s.player.status.blind > 0) || isDarkRoom;
            
            let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y));
            if (isBlind) visibleEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 1); 
            
            let adjacentEnemies = s.enemies.filter(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
            let enemyAdjacent = adjacentEnemies.length > 0 ? adjacentEnemies[0] : null; 
            let enemyInSight = visibleEnemies.length > 0 ? visibleEnemies[0] : null;

            s.enemies.forEach(e => { 
                if (e.hp > 0 && s.player.type === 'magician' && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                    if (!isBlind && window.isTileVisible(s, e.x, e.y)) {
                        let clear = true;
                        if (e.x === s.player.x) { for(let y=Math.min(s.player.y, e.y)+1; y<Math.max(s.player.y, e.y); y++) if(s.grid[y][s.player.x]===1) clear=false; }
                        else { for(let x=Math.min(s.player.x, e.x)+1; x<Math.max(s.player.x, e.x); x++) if(s.grid[s.player.y][x]===1) clear=false; }
                        if(clear) enemyAdjacent = e; 
                    }
                }
            });

            if (enemyAdjacent && ai.stats && ai.stats.beauty > 20) {
                if (enemyAdjacent.type !== 'robot' && enemyAdjacent.type !== 'machine' && enemyAdjacent.type !== 'stone') {
                    let charmChance = Math.min(0.25, ai.stats.beauty / 400); 
                    if (Math.random() < charmChance) {
                        window.addDungeonLog(`敵は ${aiName} の美しさにみとれて動けない！`, '#E040FB');
                        enemyAdjacent.charmed = true; 
                    }
                }
            }

            let chosenCommand = null; 
            let smartChance = Math.min(0.95, (ai.stats.intel || 10) / 100); 
            
            let myWords = (ai.apprentice && ai.apprentice.learnedWords) ? ai.apprentice.learnedWords : [];
            let validCmdIds = []; myWords.forEach(w => { let cmd = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.name === w); if (cmd && cmd.id) validCmdIds.push(cmd.id); });
            let pType = typeof window.getPersonalityType === 'function' ? window.getPersonalityType(ai.stats) : '普通';

            let isConfused = s.player.status && s.player.status.confusion > 0;
            if (isConfused) { window.addDungeonLog(`🌀 ${aiName} は混乱してフラフラしている！`, '#FF9800'); smartChance = 0; }

            if (pType === 'のんびり屋' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は面倒くさがって立ち止まった...`, '#aaa'); chosenCommand = 'skip'; } 
            else if (pType === '憂鬱' && Math.random() < 0.2) { window.addDungeonLog(`${aiName} は暗い気持ちになり、ため息をついた...`, '#aaa'); chosenCommand = 'skip'; } 
            else if ((pType === 'アイドル' || pType === '芸術家') && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は敵の前で優雅にポーズを決めた！`, '#FFD700'); chosenCommand = 'skip'; } 
            else if (pType === 'せっかち' && Math.random() < 0.15) { window.addDungeonLog(`${aiName} は先走って空回りした！`, '#FF9800'); chosenCommand = 'skip'; }

            if (chosenCommand !== 'skip') {
                if (validCmdIds.length === 0 || isConfused) { 
                    let randomActions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack'];
                    chosenCommand = randomActions[Math.floor(Math.random() * randomActions.length)];
                } else {
                    if (Math.random() < smartChance) {
                        let bestItemIdx = -1; let bestItemScore = -1; let bestItemCmd = '';
                        let hpRate = s.player.hp / s.player.maxHp;
                        
                        for(let i=0; i<s.player.tempInventory.length; i++) {
                            let effect = window.getDungeonItemEffect(s.player.tempInventory[i]);
                            if (!effect.isConsumable) continue;
                            
                            let isMagic = effect.traits.length > 0; let score = 0;
                            
                            if (effect.traits.includes('level_up')) {
                                if (hpRate < 0.4 || (visibleEnemies.length >= 2 && hpRate < 0.5) || s.player.hunger < 20) score = 100; 
                            } else if (effect.traits.includes('warp_self')) {
                                if (adjacentEnemies.length >= 2 || (hpRate < 0.3 && adjacentEnemies.length >= 1)) score = 95;
                            } else if (effect.traits.includes('sleep_aoe') || effect.traits.includes('confuse_aoe')) {
                                if (visibleEnemies.length >= 3 || adjacentEnemies.length >= 2) score = 90; else if (visibleEnemies.length >= 2) score = 75; 
                            } else if (effect.traits.includes('fire_damage') || effect.traits.includes('swap_pos') || effect.traits.includes('blow_back')) {
                                if (adjacentEnemies.length >= 1) score = 85; else if (visibleEnemies.length >= 2) score = 80;
                            } else {
                                if (effect.hp > 0 && s.player.hp < s.player.maxHp) { if (hpRate < 0.3) score = 95; else if (hpRate < 0.6) score = 40; else score = 10; }
                                if (effect.hunger > 0 && s.player.hunger < maxH) { if (s.player.hunger < 20) score = Math.max(score, 90); else if (s.player.hunger < 40) score = Math.max(score, 30); else score = Math.max(score, 10); }
                                
                                let isHpFull = s.player.hp >= s.player.maxHp; let isHungerFull = s.player.hunger >= maxH;
                                let baseItemKey = s.player.tempInventory[i].split('_+')[0];
                                
                                if (baseItemKey === 'herb' && isHpFull) { if ((ai.stats.intel || 10) >= 60 && adjacentEnemies.length === 0) score = 25; else score = -1; }
                                else if (baseItemKey === 'item_bread' && isHungerFull) { if ((ai.stats.intel || 10) >= 60 && adjacentEnemies.length === 0) score = 25; else score = -1; }
                                else if (isHpFull && isHungerFull && effect.traits.length === 0) { score = -1; }
                            }
                            
                            if (score > bestItemScore) { bestItemScore = score; bestItemIdx = i; bestItemCmd = isMagic ? 'use' : 'eat'; if (bestItemCmd === 'eat' && effect.hp > 0 && validCmdIds.includes('heal')) bestItemCmd = 'heal'; }
                        }
                        s.player._bestItemIdx = bestItemIdx; 

                        let getSmartNextStep = function(startX, startY, isTargetFunc, avoidEnemies = false) {
                            let distMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(Infinity));
                            distMap[startY][startX] = 0;
                            let queue = [{x: startX, y: startY, cost: 0}];
                            let parent = {}; let foundTarget = null;
                            
                            while(queue.length > 0) {
                                queue.sort((a, b) => a.cost - b.cost); 
                                let cur = queue.shift();
                                
                                if (isTargetFunc(cur.x, cur.y)) { foundTarget = cur; break; }
                                
                                let dirs = [ {dx:0,dy:-1,cmd:'move_up'}, {dx:1,dy:0,cmd:'move_right'}, {dx:0,dy:1,cmd:'move_down'}, {dx:-1,dy:0,cmd:'move_left'} ];
                                for(let d of dirs) {
                                    if (!validCmdIds.includes(d.cmd)) continue;
                                    let nx = cur.x + d.dx; let ny = cur.y + d.dy;
                                    
                                    if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight) {
                                        let tile = s.grid[ny][nx];
                                        if (tile === 1) continue; 
                                        if (!isFlying && tile === 4) continue; 
                                        if (avoidEnemies && s.enemies.some(e => e.hp > 0 && e.x === nx && e.y === ny)) continue;
                                        
                                        let moveCost = 1; 
                                        if (tile === 5) {
                                            if (s.player.hp <= 20) continue; 
                                            moveCost = 20; 
                                        }
                                        if (s.traps && s.traps.some(t => t.visible && t.x === nx && t.y === ny)) {
                                            moveCost = 15;
                                        }
                                        
                                        let nextCost = cur.cost + moveCost;
                                        if (nextCost < distMap[ny][nx]) {
                                            distMap[ny][nx] = nextCost;
                                            parent[`${nx},${ny}`] = {x: cur.x, y: cur.y};
                                            queue.push({x: nx, y: ny, cost: nextCost});
                                        }
                                    }
                                }
                            }
                            
                            if (!foundTarget) return null; 
                            let curr = foundTarget;
                            while(curr.x !== startX || curr.y !== startY) { 
                                let p = parent[`${curr.x},${curr.y}`]; 
                                if (p.x === startX && p.y === startY) return curr; 
                                curr = p; 
                            }
                            return null;
                        };

                        let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 
                        let tacticalMove = null; let tacticalWait = false;
                        if (s.player._commitFight > 0) s.player._commitFight--;

                        if (visibleEnemies.length >= 2 && !isCorridor && (ai.stats.intel || 10) >= 40 && !s.player._commitFight) {
                            let nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.visited[y][x] && s.grid[y][x] === 3 && !s.enemies.some(e => e.hp>0 && e.x===x && e.y===y), true);
                            if (nextStep) {
                                if (nextStep.x === s.player.lastX && nextStep.y === s.player.lastY) { window.addDungeonLog(`${aiName} は逃げ道で挟み撃ちにされそうになり、覚悟を決めた！`, '#ff5252'); s.player._commitFight = 6; } 
                                else {
                                    if (nextStep.x < s.player.x) tacticalMove = 'move_left'; else if (nextStep.x > s.player.x) tacticalMove = 'move_right';
                                    else if (nextStep.y < s.player.y) tacticalMove = 'move_up'; else if (nextStep.y > s.player.y) tacticalMove = 'move_down';
                                }
                            } else { window.addDungeonLog(`${aiName} は逃げ道が塞がれていることに気づき、覚悟を決めた！`, '#ff5252'); s.player._commitFight = 6; }
                        }
                        else if (isCorridor && visibleEnemies.length > 0 && adjacentEnemies.length === 0 && (ai.stats.intel || 10) >= 40) {
                            let nearestDist = Infinity; visibleEnemies.forEach(e => { let d = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y); if (d < nearestDist) nearestDist = d; });
                            if (nearestDist === 2 || visibleEnemies.length >= 2) {
                                s.player._waitCount = (s.player._waitCount || 0) + 1;
                                if (s.player._waitCount <= 4) { tacticalWait = true; } else { window.addDungeonLog(`${aiName} は待ちくたびれて突撃を決意した！`, '#ff5252'); s.player._commitFight = 6; s.player._waitCount = 0; }
                            } else { s.player._waitCount = 0; }
                        } else { s.player._waitCount = 0; }

                        let isHpFull = s.player.hp >= s.player.maxHp;
                        let shouldEquipAcc = false;
                        if (!s.player.equipAccessory) {
                            let accs = s.player.tempInventory.filter(i => window.getDungeonItemEffect(i).equipType === 'accessory');
                            if (accs.length > 0) {
                                let hasOtherThanRegen = accs.some(i => !window.getDungeonItemEffect(i).traits.includes('regen_hp'));
                                if (hasOtherThanRegen || !isHpFull) shouldEquipAcc = true; 
                            }
                        }

                        let synthInfo = null;
                        // ==========================================
                        // ★ 修正：AIが印の限界数（maxSeals）を完全に理解する
                        // ==========================================
                        const trySynth = (equipSlot, eType) => {
                            if (!s.player[equipSlot]) return null;
                            let parsedBase = window.parseItemString(s.player[equipSlot]);
                            let bData = window.getDungeonItemEffect(s.player[equipSlot]);
                            
                            for (let i = 0; i < s.player.tempInventory.length; i++) {
                                let matItem = s.player.tempInventory[i];
                                let parsedMat = window.parseItemString(matItem);
                                let matEff = window.getDungeonItemEffect(matItem);
                                
                                if (eType === 'accessory') {
                                    if (matEff.equipType === 'accessory' && parsedBase.baseId === parsedMat.baseId) {
                                        let mergedSeals = [...new Set([...parsedBase.seals, ...parsedMat.seals])];
                                        if (mergedSeals.length <= bData.maxSeals) return { type: eType, matIdx: i, isSame: true };
                                    }
                                    continue;
                                }
                                if (matEff.equipType === eType && parsedBase.baseId === parsedMat.baseId) {
                                    let mergedSeals = [...new Set([...parsedBase.seals, ...parsedMat.seals])];
                                    if (mergedSeals.length <= bData.maxSeals) return { type: eType, matIdx: i, isSame: true };
                                }
                                
                                if ((ai.stats.intel || 10) >= 60) {
                                    let seal = window.getSealFromItem(parsedMat.baseId, eType);
                                    if (seal && !parsedBase.seals.includes(seal)) {
                                        if (parsedBase.seals.length < bData.maxSeals) {
                                            return { type: eType, matIdx: i, isSame: false, seal: seal };
                                        }
                                    }
                                }
                            }
                            return null;
                        };

                        if (validCmdIds.includes('synthesize') && adjacentEnemies.length === 0 && (ai.stats.intel || 10) >= 40) {
                            synthInfo = trySynth('equipWeapon', 'weapon') || trySynth('equipShield', 'shield') || trySynth('equipArmor', 'armor') || trySynth('equipAccessory', 'accessory');
                        }

                        if (bestItemScore >= 80 && validCmdIds.includes(bestItemCmd)) { chosenCommand = bestItemCmd; }
                        else if (s.player.equipAccessory && window.getDungeonItemEffect(s.player.equipAccessory).traits.includes('regen_hp') && isHpFull && validCmdIds.includes('unequip') && (ai.stats.intel || 10) >= 40 && !allTraits.includes('regen')) {
                            // ★ 修正：呪われていたら外そうとしない
                            let eff = window.getDungeonItemEffect(s.player.equipAccessory);
                            if (!eff.traits.includes('curse')) { 
                                chosenCommand = 'unequip'; s.player._unequipTarget = 'equipAccessory'; window.addDungeonLog(`${aiName} はHPが満タンになったので回復の指輪を外そうと考えた。`, '#00BCD4');
                            }
                        }
                        else if (synthInfo) { chosenCommand = 'synthesize'; s.player._synthInfo = synthInfo; }
                        else if (tacticalMove) { chosenCommand = tacticalMove; window.addDungeonLog(`${aiName} は多勢に無勢と悟り、通路へ退いて各個撃破を狙う！`, '#00BCD4'); } 
                        else if (tacticalWait && validCmdIds.includes('attack')) { chosenCommand = 'attack'; window.addDungeonLog(`${aiName} は通路に陣取り、敵が来るのを待ち構えている！`, '#FF9800'); }
                        else if (bestItemScore >= 25 && validCmdIds.includes(bestItemCmd)) { chosenCommand = bestItemCmd; }
                        else if ((!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                 (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                 (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                 shouldEquipAcc) {
                            if (validCmdIds.includes('equip')) chosenCommand = 'equip'; 
                        } 
                        else if (adjacentEnemies.length > 0 && validCmdIds.includes('attack')) { chosenCommand = 'attack'; } 
                        else if (s.player._commitFight > 0 && visibleEnemies.length > 0) {
                            let targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                            let nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetEnemy.x && y === targetEnemy.y);
                            if (nextStep) {
                                if (nextStep.x < s.player.x) chosenCommand = 'move_left'; else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                else if (nextStep.y < s.player.y) chosenCommand = 'move_up'; else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                            }
                        }
                        else {
                            let nextStep = null;
                            let targetPos = null;

                            if ((ai.stats.intel || 10) >= 30 && s.player.tempInventory.length < 20 && s.items) {
                                let visibleItems = s.items.filter(i => window.isTileVisible(s, i.x, i.y) && s.grid[i.y][i.x] !== 5); 
                                if (visibleItems.length > 0) {
                                    let nearestItem = visibleItems.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0];
                                    targetPos = { x: nearestItem.x, y: nearestItem.y };
                                    window.addDungeonLog(`${aiName} はアイテムを見つけて拾いに行こうとしている！`, '#4CAF50');
                                }
                            }

                            if (!targetPos) {
                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => s.grid[y][x] === 2 && s.visited[y][x]);
                            } else {
                                nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === targetPos.x && y === targetPos.y);
                            }

                            if (!nextStep && s.player.hp > s.player.maxHp * 0.4 && enemyInSight) {
                                if (enemyInSight.type === 'beetle' && (ai.stats.intel || 10) >= 50) window.addDungeonLog(`${aiName} はカブトムシとの正面衝突を避けた！`, '#00BCD4');
                                else nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => x === enemyInSight.x && y === enemyInSight.y);
                            }
                            if (!nextStep) nextStep = getSmartNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);

                            if (nextStep) {
                                if (nextStep.x < s.player.x) chosenCommand = 'move_left'; else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                else if (nextStep.y < s.player.y) chosenCommand = 'move_up'; else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                            } else {
                                window.addDungeonLog(`${aiName} はどうしていいか分からずオロオロしている...`, '#888');
                                chosenCommand = 'skip';
                            }
                        }
                    }

                    if (!chosenCommand) {
                        let smartValidCmds = validCmdIds.filter(cmd => {
                            if (cmd === 'eat') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0; });
                            if (cmd === 'use') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length > 0; });
                            if (cmd === 'heal') return s.player.tempInventory.some(i => { let e = window.getDungeonItemEffect(i); return e.isConsumable && e.traits.length === 0 && e.hp > 0; });
                            if (cmd === 'equip') return (
                                     (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'weapon' || window.getDungeonItemEffect(i).isWeapon)) || 
                                     (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'shield' || window.getDungeonItemEffect(i).isShield)) ||
                                     (!s.player.equipArmor && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'armor')) ||
                                     (!s.player.equipAccessory && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).equipType === 'accessory'))
                                );
                            // ★ 修正：呪われていない装備だけを外す対象と認識する
                            if (cmd === 'unequip') {
                                let canUnequip = false;
                                ['equipWeapon', 'equipShield', 'equipArmor', 'equipAccessory'].forEach(slot => {
                                    if (s.player[slot]) {
                                        let eff = window.getDungeonItemEffect(s.player[slot]);
                                        if (!eff.traits.includes('curse')) canUnequip = true;
                                    }
                                });
                                return canUnequip;
                            }
                            if (cmd === 'attack') return enemyAdjacent != null;
                            if (['move_up', 'move_down', 'move_left', 'move_right'].includes(cmd)) {
                                let nx = s.player.x + (cmd === 'move_right' ? 1 : cmd === 'move_left' ? -1 : 0); let ny = s.player.y + (cmd === 'move_down' ? 1 : cmd === 'move_up' ? -1 : 0);
                                if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1) {
                                    if (!isFlying && s.grid[ny][nx] === 4) return false; 
                                    return true;
                                }
                                return false;
                            }
                            return true;
                        });
                        if (smartValidCmds.length > 0) chosenCommand = smartValidCmds[Math.floor(Math.random() * smartValidCmds.length)];
                        else { window.addDungeonLog(`${aiName} はどうしていいか分からずオロオロしている...`, '#888'); chosenCommand = 'skip'; }
                    }
                }

                if (typeof chosenCommand === 'object' && chosenCommand !== null) chosenCommand = chosenCommand.id;

                let isParalyzed = s.player.status && s.player.status.paralyzed > 0;
                if (isParalyzed && ['move_up', 'move_down', 'move_left', 'move_right', 'flee'].includes(chosenCommand)) {
                    window.addDungeonLog(`⚡ 足が痺れて動けない！`, '#FF9800');
                    chosenCommand = 'skip';
                }

                if (chosenCommand !== 'skip') {
                    const cmdInfo = window.DUNGEON_AVAILABLE_COMMANDS.find(c => c.id === chosenCommand); 
                    if (cmdInfo && !isConfused) window.addDungeonLog(`${aiName} は「${cmdInfo.name}」と考えた！`, '#FFF'); else if (!isConfused) { chosenCommand = 'attack'; window.addDungeonLog(`${aiName} はとっさに身構えた！`, '#ff9800'); }
                }

                let newX = s.player.x; let newY = s.player.y;

                if (chosenCommand === 'move_up') { newY--; s.player.face = 'up'; } 
                else if (chosenCommand === 'move_down') { newY++; s.player.face = 'down'; }
                else if (chosenCommand === 'move_left') { newX--; s.player.face = 'left'; } 
                else if (chosenCommand === 'move_right'){ newX++; s.player.face = 'right'; }
                else if (chosenCommand === 'flee') {
                    if (enemyInSight) {
                        if (s.player.x < enemyInSight.x && s.grid[s.player.y][s.player.x - 1] !== 1 && (isFlying || s.grid[s.player.y][s.player.x - 1] !== 4)) { newX--; s.player.face = 'left'; }
                        else if (s.player.x > enemyInSight.x && s.grid[s.player.y][s.player.x + 1] !== 1 && (isFlying || s.grid[s.player.y][s.player.x + 1] !== 4)) { newX++; s.player.face = 'right'; }
                        else if (s.player.y < enemyInSight.y && s.grid[s.player.y - 1][s.player.x] !== 1 && (isFlying || s.grid[s.player.y - 1][s.player.x] !== 4)) { newY--; s.player.face = 'up'; }
                        else if (s.player.y > enemyInSight.y && s.grid[s.player.y + 1][s.player.x] !== 1 && (isFlying || s.grid[s.player.y + 1][s.player.x] !== 4)) { newY++; s.player.face = 'down'; }
                        if(!isConfused) window.addDungeonLog(`敵から遠ざかるように走った！`, '#00BCD4');
                    } else { if(!isConfused) window.addDungeonLog(`キョロキョロしている。（敵がいない）`, '#aaa'); }
                }

                if (newX !== s.player.x || newY !== s.player.y) {
                    if (newX >= 0 && newX < s.mapWidth && newY >= 0 && newY < s.mapHeight && s.grid[newY][newX] !== 1 && (isFlying || s.grid[newY][newX] !== 4)) {
                        let hitEnemy = s.enemies.find(e => e.x === newX && e.y === newY && e.hp > 0);
                        if (hitEnemy) { window.addDungeonLog(`ゴツン！ 敵にぶつかった！`, '#FF9800'); s.player.attackAnim = true; } 
                        else { 
                            s.player.lastX = s.player.x; s.player.lastY = s.player.y; s.player.x = newX; s.player.y = newY; 

                            if (s.grid[s.player.y][s.player.x] === 5) {
                                window.addDungeonLog(`🔥 マグマを踏んで火傷した！(HP-10)`, '#FF5252');
                                s.player.hp -= 10;
                                if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "10", true);
                            }

                            if (s.items) {
                                let itemIdx = s.items.findIndex(i => i.x === s.player.x && i.y === s.player.y);
                                if (itemIdx !== -1) {
                                    let itm = s.items[itemIdx];
                                    if (s.player.tempInventory.length < 20) { 
                                        s.player.tempInventory.push(itm.key); window.addDungeonLog(`足元から ${itm.name} を拾った！`, '#4CAF50'); s.items.splice(itemIdx, 1);
                                    } else { window.addDungeonLog(`カバンがいっぱいで ${itm.name} を拾えない！`, '#FF9800'); }
                                }
                            }
                            if (s.traps && s.player.type !== 'balloon' && s.player.type !== 'ghost') { 
                                let trap = s.traps.find(t => t.x === s.player.x && t.y === s.player.y);
                                if (trap && !s.player.status.paralyzed) { 
                                    if (!trap.visible) window.addDungeonLog(`カシャッ！ 何か罠を踏んだ！`, '#ff5252');
                                    trap.visible = true;
                                    if (trap.type === 'poison') { window.addDungeonLog(`毒矢が飛んできた！`, '#9C27B0'); s.player.status.poison += 5; }
                                    else if (trap.type === 'mine') { 
                                        window.addDungeonLog(`地雷が大爆発！`, '#FF5252'); s.player.hp -= Math.floor(s.player.maxHp * 0.3);
                                        if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(s.player.x, s.player.y, "BOOM", true);
                                    }
                                    else if (trap.type === 'blind') { window.addDungeonLog(`泥水を被り、視界が奪われた！`, '#9C27B0'); s.player.status.blind += 15; }
                                    else if (trap.type === 'bear_trap') { window.addDungeonLog(`トラバサミに引っかかり、足が痺れた！`, '#FF9800'); s.player.status.paralyzed += 3; s.player.hp -= 10; }
                                }
                            }
                        }
                        
                        if (!hitEnemy && s.player.equipWeapon && window.getDungeonItemEffect(s.player.equipWeapon).traits.includes('first')) {
                            let newlyAdjacent = s.enemies.find(e => e.hp > 0 && Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y) === 1);
                            if (newlyAdjacent) {
                                window.addDungeonLog(`⚡ 疾風迅雷！敵の気配を察知して先制攻撃を叩き込んだ！`, '#FFD700');
                                if (newlyAdjacent.x < s.player.x) s.player.face = 'left'; else if (newlyAdjacent.x > s.player.x) s.player.face = 'right'; else if (newlyAdjacent.y < s.player.y) s.player.face = 'up'; else if (newlyAdjacent.y > s.player.y) s.player.face = 'down';
                                s.player.attackAnim = true; window.dealDungeonDamage(s.player, newlyAdjacent); window.updateDungeonUI(); await sleep(200);
                            }
                        }
                    } else { window.addDungeonLog(`ガンッ！ 壁や水脈にぶつかった！`, '#aaa'); }
                } else if (chosenCommand === 'attack') {
                    if (enemyAdjacent && !isConfused) {
                        if (enemyAdjacent.x < s.player.x) s.player.face = 'left'; else if (enemyAdjacent.x > s.player.x) s.player.face = 'right';
                        else if (enemyAdjacent.y < s.player.y) s.player.face = 'up'; else if (enemyAdjacent.y > s.player.y) s.player.face = 'down';
                        s.player.attackAnim = true; window.dealDungeonDamage(s.player, enemyAdjacent);
                        let atkWait = enemyAdjacent.warpAnim ? 400 : 150; window.updateDungeonUI(); await sleep(atkWait);
                        
                        let wEff = s.player.equipWeapon ? window.getDungeonItemEffect(s.player.equipWeapon) : null;
                        if (wEff && wEff.traits.includes('double') && enemyAdjacent.hp > 0) { 
                            window.addDungeonLog(`⚔️ 連撃の剣が発動！怒涛の連続攻撃！`, '#FFD700');
                            s.player.attackAnim = true; window.dealDungeonDamage(s.player, enemyAdjacent); window.updateDungeonUI(); await sleep(150);
                        }
                    } else { 
                        s.player.attackAnim = true; 
                        if (isConfused) {
                            let dirs = ['up', 'down', 'left', 'right']; s.player.face = dirs[Math.floor(Math.random() * dirs.length)];
                            let hx = s.player.x, hy = s.player.y;
                            if (s.player.face === 'up') hy--; else if (s.player.face === 'down') hy++; else if (s.player.face === 'left') hx--; else if (s.player.face === 'right') hx++;
                            let hitE = s.enemies.find(e => e.hp > 0 && e.x === hx && e.y === hy);
                            if (hitE) { window.addDungeonLog(`混乱したままデタラメに殴ったら当たった！`, '#FF9800'); window.dealDungeonDamage(s.player, hitE); }
                            else { window.addDungeonLog(`明後日の方向を殴っている！`, '#aaa'); }
                        } else { window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
                    }
                } else if (chosenCommand === 'heal' || chosenCommand === 'eat' || chosenCommand === 'use') {
                    if (s.player._bestItemIdx !== undefined && s.player._bestItemIdx !== -1 && s.player.tempInventory[s.player._bestItemIdx]) {
                        let itemId = s.player.tempInventory[s.player._bestItemIdx]; let effect = window.getDungeonItemEffect(itemId);

                        if (chosenCommand === 'eat' || chosenCommand === 'heal') {
                            window.addDungeonLog(`${aiName} は ${effect.name} を食べた！`, '#4CAF50'); let limitBreakMsg = ""; let baseItemKey = itemId.split('_+')[0]; 
                            if (baseItemKey === 'herb' && s.player.hp >= s.player.maxHp) { s.player.maxHp += 1; limitBreakMsg += `最大HPが ${s.player.maxHp} に！ `; }
                            if (baseItemKey === 'item_bread' && s.player.hunger >= maxH) { s.player.maxHunger = maxH + 5; limitBreakMsg += `最大満腹度が ${s.player.maxHunger} に！`; }
                            if (limitBreakMsg !== "") window.addDungeonLog(`💪 上限突破！ ${limitBreakMsg}`, '#FF9800');
                            if (effect.hp > 0 || effect.hunger > 0) window.addDungeonLog(`HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                        } else { window.addDungeonLog(`${aiName} は ${effect.name} を使った！`, '#00BCD4'); }
                        
                        s.player.tempInventory.splice(s.player._bestItemIdx, 1); 
                        s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); s.player.hunger = Math.min(maxH, s.player.hunger + effect.hunger); 
                        
                        if (effect.traits.includes('level_up')) {
                            s.player.level = (s.player.level || 1) + 1; s.player.maxHp += 20; s.player.hp = s.player.maxHp; s.player.hunger = maxH; s.player.basePwr += 8;
                            s.player.levelUpAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                            window.addDungeonLog(`✨ 奇跡が起きた！Lv.${s.player.level}にレベルアップし、全回復した！`, '#E040FB');
                        }
                        if (effect.traits.includes('sleep_aoe')) {
                            s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.charmed = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                            window.addDungeonLog(`部屋中の魔物たちが深い眠りについた...💤`, '#B39DDB');
                        }
                        if (effect.traits.includes('confuse_aoe')) {
                            s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            s.enemies.forEach(e => { if (e.hp > 0 && window.isTileVisible(s, e.x, e.y)) { e.status.confusion += 15; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(e.x, e.y, 'sleep'); } });
                            window.addDungeonLog(`部屋中の魔物たちが大混乱に陥った！🌀`, '#FF9800');
                        }
                        if (effect.traits.includes('fire_damage') || effect.traits.includes('swap_pos') || effect.traits.includes('blow_back')) {
                            s.player.magicAnim = true; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'magic');
                            let targetEnemy = enemyAdjacent;
                            if (!targetEnemy) { let visibleEnemies = s.enemies.filter(e => e.hp > 0 && window.isTileVisible(s, e.x, e.y)); targetEnemy = visibleEnemies.sort((a,b) => (Math.abs(a.x-s.player.x)+Math.abs(a.y-s.player.y)) - (Math.abs(b.x-s.player.x)+Math.abs(b.y-s.player.y)))[0]; }
                            
                            if (targetEnemy) {
                                if (effect.traits.includes('fire_damage')) {
                                    targetEnemy.hp -= 40; if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'fire'); 
                                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(targetEnemy.x, targetEnemy.y, 40, false);
                                    window.addDungeonLog(`🔥 灼熱の炎が ${targetEnemy.name} を焼き尽くす！(40ダメージ)`, '#FF5252');
                                }
                                if (effect.traits.includes('swap_pos')) {
                                    let px = s.player.x, py = s.player.y;
                                    s.player.x = targetEnemy.x; s.player.y = targetEnemy.y; targetEnemy.x = px; targetEnemy.y = py;
                                    window.addDungeonLog(`🌀 魔法の力で ${targetEnemy.name} と場所を入れ替わった！`, '#00BCD4');
                                    if (typeof window.playDungeonVFX === 'function') { window.playDungeonVFX(s.player.x, s.player.y, 'warp'); window.playDungeonVFX(targetEnemy.x, targetEnemy.y, 'warp'); }
                                }
                                if (effect.traits.includes('blow_back')) {
                                    let dx = Math.sign(targetEnemy.x - s.player.x); let dy = Math.sign(targetEnemy.y - s.player.y);
                                    if (dx === 0 && dy === 0) dx = 1;
                                    let pushDist = 5; let nx = targetEnemy.x, ny = targetEnemy.y;
                                    for(let k=0; k<pushDist; k++) {
                                        if (s.grid[ny+dy][nx+dx] !== 1 && !s.enemies.some(e=>e.hp>0&&e!==targetEnemy&&e.x===nx+dx&&e.y===ny+dy)) {
                                            nx += dx; ny += dy;
                                        } else {
                                            targetEnemy.hp -= 20;
                                            window.addDungeonLog(`💥 ${targetEnemy.name} は壁に吹き飛ばされて激突した！(20ダメージ)`, '#FF5252');
                                            if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(nx, ny, 20, false);
                                            break;
                                        }
                                    }
                                    targetEnemy.x = nx; targetEnemy.y = ny; targetEnemy.warpAnim = true; 
                                    window.addDungeonLog(`💨 ${targetEnemy.name} を遠くへ吹き飛ばした！`, '#00BCD4');
                                }
                            } else { window.addDungeonLog(`しかし誰もいなかった...`, '#aaa'); }
                        }
                        if (effect.traits.includes('warp_self')) {
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'warp');
                            let wx, wy; do { wx = Math.floor(Math.random() * s.mapWidth); wy = Math.floor(Math.random() * s.mapHeight); } while (s.grid[wy][wx] !== 0);
                            s.player.x = wx; s.player.y = wy; window.addDungeonLog(`🌀 ${aiName} は別の場所へワープした！`, '#E040FB'); window.updateDungeonUI();
                        }
                    } else { window.addDungeonLog(`しかし使えるアイテムを持っていなかった！`, '#ff5252'); }
                } else if (chosenCommand === 'equip') {
                    let equippedSomething = false;
                    const tryEquip = (slotName, typeName, logName) => {
                        if (equippedSomething || s.player[slotName]) return;
                        let idx = s.player.tempInventory.findIndex(i => window.getDungeonItemEffect(i).equipType === typeName || (typeName==='weapon' && window.getDungeonItemEffect(i).isWeapon) || (typeName==='shield' && window.getDungeonItemEffect(i).isShield));
                        if (idx !== -1) {
                            s.player[slotName] = s.player.tempInventory[idx]; s.player.tempInventory.splice(idx, 1);
                            window.addDungeonLog(`${logName}（${window.getDungeonItemEffect(s.player[slotName]).name}）を装備した！`, '#FFD700'); equippedSomething = true;
                        }
                    };
                    tryEquip('equipWeapon', 'weapon', '武器'); tryEquip('equipShield', 'shield', '盾'); tryEquip('equipArmor', 'armor', '鎧'); tryEquip('equipAccessory', 'accessory', '装飾品'); 
                    if (!equippedSomething) window.addDungeonLog(`装備できるものを持っていなかった...`, '#aaa');
                } else if (chosenCommand === 'unequip') {
                    // ★ 修正：呪いを完全に理解する
                    let target = s.player._unequipTarget; s.player._unequipTarget = null; 
                    if (!target) {
                        const checkCanUnequip = (slot) => s.player[slot] && !window.getDungeonItemEffect(s.player[slot]).traits.includes('curse');
                        if (checkCanUnequip('equipAccessory')) target = 'equipAccessory';
                        else if (checkCanUnequip('equipWeapon')) target = 'equipWeapon';
                        else if (checkCanUnequip('equipShield')) target = 'equipShield';
                        else if (checkCanUnequip('equipArmor')) target = 'equipArmor';
                    }
                    if (target && s.player[target]) {
                        let eff = window.getDungeonItemEffect(s.player[target]);
                        if (eff.traits.includes('curse')) {
                            window.addDungeonLog(`しかし ${eff.name} は呪われていて外せなかった！`, '#9C27B0');
                        } else {
                            s.player.tempInventory.push(s.player[target]);
                            window.addDungeonLog(`装備をはずして鞄にしまった。`, '#aaa');
                            s.player[target] = null;
                        }
                    } else { window.addDungeonLog(`はずす装備がなかった。`, '#aaa'); }
                } else if (chosenCommand === 'synthesize') {
                    if (s.player._synthInfo) {
                        let info = s.player._synthInfo; s.player._synthInfo = null;
                        let baseEquip = s.player[info.type === 'weapon' ? 'equipWeapon' : info.type === 'shield' ? 'equipShield' : info.type === 'armor' ? 'equipArmor' : 'equipAccessory'];
                        let matEquip = s.player.tempInventory[info.matIdx];
                        let parsedBase = window.parseItemString(baseEquip); let parsedMat = window.parseItemString(matEquip);
                        let bData = window.getDungeonItemEffect(baseEquip); let mData = window.getDungeonItemEffect(matEquip);
                        
                        let newEquipStr = "";
                        let canSynth = true;

                        if (info.isSame) {
                            let mergedSeals = [...new Set([...parsedBase.seals, ...parsedMat.seals])];
                            if (mergedSeals.length > bData.maxSeals) {
                                window.addDungeonLog(`印の限界数（${bData.maxSeals}個）に達しているためこれ以上異種合成できない！`, '#ff9800');
                                canSynth = false;
                            } else {
                                let newPlus = parsedBase.plus + parsedMat.plus + 1; 
                                newEquipStr = `${parsedBase.baseId}_+${newPlus}`; if (mergedSeals.length > 0) newEquipStr += '_' + mergedSeals.join('_');
                                window.addDungeonLog(`🔨 ${aiName} は ${bData.name} と ${mData.name} を合成した！`, '#FFD700');
                            }
                        } else {
                            if (parsedBase.seals.length >= bData.maxSeals && !parsedBase.seals.includes(info.seal)) {
                                window.addDungeonLog(`印の限界数（${bData.maxSeals}個）に達しているためこれ以上異種合成できない！`, '#ff9800');
                                canSynth = false;
                            } else {
                                parsedBase.seals.push(info.seal); newEquipStr = `${parsedBase.baseId}`; if (parsedBase.plus > 0) newEquipStr += `_+${parsedBase.plus}`;
                                newEquipStr += '_' + parsedBase.seals.join('_'); window.addDungeonLog(`🔨 ${aiName} は ${bData.name} に ${mData.name} を溶かし込んだ！`, '#E040FB');
                            }
                        }

                        if (canSynth) {
                            s.player.tempInventory.splice(info.matIdx, 1);
                            if (info.type === 'weapon') s.player.equipWeapon = newEquipStr; else if (info.type === 'shield') s.player.equipShield = newEquipStr; else if (info.type === 'armor') s.player.equipArmor = newEquipStr; else if (info.type === 'accessory') s.player.equipAccessory = newEquipStr;
                            window.addDungeonLog(`✨ ${window.getDungeonItemEffect(newEquipStr).name} が完成した！`, '#FFD700');
                            if (typeof window.playDungeonVFX === 'function') window.playDungeonVFX(s.player.x, s.player.y, 'level_up');
                        }
                    } else { window.addDungeonLog(`合成できる装備がなかった。`, '#aaa'); }
                }

                if (s.rescueTargets) {
                    let targetToRescue = s.rescueTargets.find(t => t.x === s.player.x && t.y === s.player.y && !t.rescued);
                    if (targetToRescue) {
                        targetToRescue.rescued = true; window.addDungeonLog(`倒れていた ${targetToRescue.name} を救助した！！`, '#FFEB3B');
                        if (typeof window.completeRescue === 'function') window.completeRescue(targetToRescue.id);
                        s.player.hp = s.player.maxHp; s.player.hunger = maxH; window.addDungeonLog(`感謝の光に包まれ、体力と満腹度が全回復した！✨`, '#4CAF50');
                    }
                }

                if (s.grid[s.player.y][s.player.x] === 2) {
                    window.addDungeonLog(`階段を見つけた！ 次のフロアへ進む！`, '#00BCD4');
                    window.updateDungeonUI();
                    await sleep(300); 
                    
                    if (s.isAuto) window.toggleDungeonAuto(); s.floor++; 
                    (async () => { await window.generateDungeonFloor(); window.updateDungeonUI(); s.isProcessingTurn = false; })();
                    return; 
                }

                let waitTime = 150;
                if (s.player.levelUpAnim) waitTime = 800; else if (s.player.magicAnim) waitTime = 500;
                window.updateDungeonUI();
                
                if (actionCount > 1 && actStep < actionCount - 1) { await sleep(Math.max(200, waitTime)); } else if (chosenCommand !== 'attack') { await sleep(waitTime); }
            } 
        }

        // ==========================================
        // ★ 敵のターン
        // ==========================================
        for (let e of s.enemies) {
            if (e.hp <= 0) continue;
            
            if (e.status) {
                if (e.status.poison > 0) {
                    e.hp -= Math.max(1, Math.floor(e.maxHp * 0.05)); 
                    e.status.poison--;
                    if (typeof window.showDungeonDamageEffect === 'function') window.showDungeonDamageEffect(e.x, e.y, "Poison", false);
                }
                if (e.status.confusion > 0) e.status.confusion--;
            } else { e.status = { poison: 0, confusion: 0 }; }
            
            if (e.hp <= 0) { window.addDungeonLog(`${e.name} は毒で倒れた！`, '#FFD700'); continue; }
            if (e.charmed) { e.charmed = false; continue; }

            let actions = 1;
            if (e.type === 'machine' && Math.random() < 0.2) actions = 2; 

            for (let a = 0; a < actions; a++) {
                if (e.hp <= 0) break;
                
                let isEnemyConfused = e.status && e.status.confusion > 0;
                let dist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                let ex = e.x, ey = e.y, moveDir = '';
                let hasAttacked = false;

                if (isEnemyConfused) {
                    const dirs = [];
                    if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                    if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                    if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                    if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                    if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                    
                    if (dist === 1 && Math.random() < 0.5) { e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true; moveDir = ''; }
                } 
                else {
                    if (e.type === 'magician' && dist <= 3 && (e.x === s.player.x || e.y === s.player.y)) {
                        if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                        e.attackAnim = true; 
                        if (typeof window.playProjectileVFX === 'function') window.playProjectileVFX(e.x, e.y, s.player.x, s.player.y, '#E040FB');
                        e.isPiercing = (Math.random() < 0.20); 
                        window.dealDungeonDamage(e, s.player); e.isPiercing = false; hasAttacked = true;
                    }
                    else if (dist === 1) {
                        if (s.player.x < e.x) e.face = 'left'; else if (s.player.x > e.x) e.face = 'right'; else if (s.player.y < e.y) e.face = 'up'; else if (s.player.y > e.y) e.face = 'down';
                        e.attackAnim = true; window.dealDungeonDamage(e, s.player); hasAttacked = true;
                    } 
                    else if (dist < 6) {
                        if (Math.abs(s.player.x - e.x) > Math.abs(s.player.y - e.y)) {
                            if (e.x < s.player.x && s.grid[e.y][e.x+1] !== 1) { ex++; moveDir = 'right'; } else if (e.x > s.player.x && s.grid[e.y][e.x-1] !== 1) { ex--; moveDir = 'left'; }
                        } else {
                            if (e.y < s.player.y && s.grid[e.y+1][e.x] !== 1) { ey++; moveDir = 'down'; } else if (e.y > s.player.y && s.grid[e.y-1][e.x] !== 1) { ey--; moveDir = 'up'; }
                        }
                    } else {
                        if (Math.random() < 0.6) {
                            const dirs = [];
                            if (s.grid[e.y][e.x+1] !== 1) dirs.push({x: e.x+1, y: e.y, dir: 'right'});
                            if (s.grid[e.y][e.x-1] !== 1) dirs.push({x: e.x-1, y: e.y, dir: 'left'});
                            if (s.grid[e.y+1][e.x] !== 1) dirs.push({x: e.x, y: e.y+1, dir: 'down'});
                            if (s.grid[e.y-1][e.x] !== 1) dirs.push({x: e.x, y: e.y-1, dir: 'up'});
                            if (dirs.length > 0) { const rnd = dirs[Math.floor(Math.random() * dirs.length)]; ex = rnd.x; ey = rnd.y; moveDir = rnd.dir; }
                        }
                    }
                }

                if (hasAttacked) { window.updateDungeonUI(); await sleep(150); continue; }

                if (moveDir !== '') {
                    let occupied = s.enemies.some(oe => oe !== e && oe.hp > 0 && oe.x === ex && oe.y === ey);
                    let playerHit = (ex === s.player.x && ey === s.player.y);
                    if (!occupied && !playerHit) { 
                        let isEnemyFlying = e.type === 'balloon' || e.type === 'ghost' || e.type === 'bird';
                        if (!isEnemyFlying && s.grid[ey][ex] === 4) continue; 
                        
                        e.x = ex; e.y = ey; e.face = moveDir; 
                        let newDist = Math.abs(e.x - s.player.x) + Math.abs(e.y - s.player.y);
                        if (newDist === 1 && s.player.equipWeapon && window.getDungeonItemEffect(s.player.equipWeapon).traits.includes('first')) {
                            window.addDungeonLog(`⚡ 疾風迅雷！敵の接近を察知して先制攻撃を叩き込んだ！`, '#FFD700');
                            if (e.x < s.player.x) s.player.face = 'left'; else if (e.x > s.player.x) s.player.face = 'right'; else if (e.y < s.player.y) s.player.face = 'up'; else if (e.y > s.player.y) s.player.face = 'down';
                            s.player.attackAnim = true; window.dealDungeonDamage(s.player, e); window.updateDungeonUI(); await sleep(200);
                        }
                    }
                }
            }
        }

        s.turnCount = (s.turnCount || 0) + 1;
        if (s.turnCount % 40 === 0 && s.enemies.filter(e => e.hp > 0).length < 15) {
            let rooms = s.roomsInfo;
            if (rooms && rooms.length > 0) {
                let r = rooms[Math.floor(Math.random() * rooms.length)];
                let ex, ey; let attempts = 0;
                do { ex = r.x + Math.floor(Math.random() * r.w); ey = r.y + Math.floor(Math.random() * r.h); attempts++;
                } while (attempts < 10 && (s.grid[ey][ex] !== 0 || (ex === s.player.x && ey === s.player.y) || window.isTileVisible(s, ex, ey)));
                
                if (attempts < 10) {
                    let eType = window._dungeonAiTypesList[Math.floor(Math.random() * window._dungeonAiTypesList.length)];
                    const eHpBase = s.mapType === 'crystal' ? 10 : 20; const eDmgBase = s.mapType === 'crystal' ? 2 : 5;
                    s.enemies.push({ id: 'e_spawn_'+Date.now(), x: ex, y: ey, hp: eHpBase + s.floor * 5, maxHp: eHpBase + s.floor * 5, damage: eDmgBase + s.floor * 2, name: `迷宮の${eType}`, type: eType, face: 'down', attackAnim: false, status: { poison:0, confusion:0 } });
                    window.addDungeonLog(`どこからか魔物の気配がする...`, '#aaa');
                }
            }
        }

        window.updateDungeonUI();

        if (s.player.hp <= 0) {
            window.addDungeonLog(`${aiName} は倒れてしまった...`, '#ff5252');
            if (s.isAuto) window.toggleDungeonAuto(); 
            setTimeout(() => { if (typeof window.updateDungeonRanking === 'function') window.updateDungeonRanking(s.mapType, s.floor, s.player.level); window.closeDungeonUI(true); }, 1500);
        }
    } catch (e) { console.error("【DungeonTurnエラー】処理中にエラーが発生しました:", e); } finally { s.isProcessingTurn = false; }
};
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
// ★新規追加：ダンジョンの入り口に「絶対に」鍵をかける（UI制御）
// ==========================================
if (typeof window._originalOpenDungeonUI === 'undefined' && typeof window.openDungeonUI === 'function') {
    window._originalOpenDungeonUI = window.openDungeonUI;
    window.openDungeonUI = function(dungeonType) {
        // 冒険家のランクをチェック
        let isMasterExplorer = (aiPet.apprentice && aiPet.apprentice.rank && aiPet.apprentice.rank['explore'] >= 10);
        
        if (!isMasterExplorer) {
            // 免許皆伝でない場合は、UIを開かずに追い返す
            aiPet.actionState = 'idle';
            aiPet.message = "ここから先は危険だ...\n（※入るには「冒険家」の免許皆伝が必要です）";
            aiPet.messageTimer = 180;
            return; // 処理をここでストップ！
        }
        
        // 免許皆伝なら本来のダンジョンUIを開く
        window._originalOpenDungeonUI(dungeonType);
    };
}

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
// ★新規追加：装備詳細と印の効果を確認するモーダル
// ==========================================
window.showEquipDetailsModal = function() {
    let modal = document.getElementById('dg-equip-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dg-equip-details-modal';
        // ★修正：z-indexを 20000 から 40000 に引き上げ、ダンジョン画面より手前に表示する！
        modal.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 85%; max-width: 600px; height: 75%; background: rgba(15, 15, 20, 0.95); border: 3px solid #FF9800; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; z-index: 40000; box-shadow: 0 10px 40px rgba(0,0,0,0.8); color: #fff; font-family: sans-serif;`;
        document.body.appendChild(modal);
    }

    const s = window.DUNGEON_STATE;
    const p = s.player;
    
    let html = `<h3 style="margin-top:0; color:#FF9800; border-bottom:1px solid #555; padding-bottom:10px;">🔍 装備詳細と印の効果</h3>`;
    html += `<div style="flex:1; overflow-y:auto; padding-right:10px;">`;

    const renderEquip = (slotItem, typeName, icon, color) => {
        if (!slotItem) return `<div style="margin-bottom:15px; color:#666;">${icon} ${typeName}：装備なし</div>`;
        
        let eff = window.getDungeonItemEffect(slotItem);
        let parsed = window.parseItemString(slotItem);
        let res = `<div style="margin-bottom:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; border-left:4px solid ${color};">`;
        res += `<div style="font-size:16px; font-weight:bold; color:${color}; margin-bottom:5px;">${icon} ${eff.name}</div>`;
        
        if (eff.atk > 0) res += `<span style="font-size:13px; margin-right:15px; color:#ccc;">攻撃力: <span style="color:#FFF;">${eff.atk}</span></span>`;
        if (eff.def > 0) res += `<span style="font-size:13px; margin-right:15px; color:#ccc;">防御力: <span style="color:#FFF;">${eff.def}</span></span>`;
        
        if (parsed.seals.length > 0) {
            res += `<div style="margin-top:8px; font-size:13px; color:#ddd; background:#111; padding:8px; border-radius:4px;">`;
            parsed.seals.forEach(sealId => {
                let sData = window.SEAL_DESCRIPTIONS[sealId];
                if (sData) {
                    res += `<div style="margin-bottom:4px;"><span style="color:#FFD700; font-weight:bold;">[${sData.name}]</span> ${sData.desc}</div>`;
                }
            });
            res += `</div>`;
        } else {
            res += `<div style="margin-top:8px; font-size:12px; color:#666;">付与されている印はありません。</div>`;
        }
        res += `</div>`;
        return res;
    };

    html += renderEquip(p.equipWeapon, '武器', '⚔️', '#FFD700');
    html += renderEquip(p.equipShield, '盾', '🛡️', '#4fc3f7');
    html += renderEquip(p.equipArmor, '鎧', '👕', '#8BC34A');
    html += renderEquip(p.equipAccessory, '装飾品', '💍', '#E040FB');

    html += `</div>`;
    html += `<button onclick="document.getElementById('dg-equip-details-modal').style.display='none'" style="margin-top:15px; padding:12px; background:#444; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">閉じる</button>`;

    modal.innerHTML = html;
    modal.style.display = 'flex';
};

// ★新規追加：装備の印を合算した「真の最大満腹度」を計算する
window.getRealMaxHunger = function() {
    let s = window.DUNGEON_STATE;
    if (!s || !s.player) return 100;
    
    let baseMax = s.player.maxHunger || 100; // パンで増えた基礎上限
    let bonus = 0;
    
    let sEff = s.player.equipShield ? window.getDungeonItemEffect(s.player.equipShield) : null;
    let aEff = s.player.equipArmor ? window.getDungeonItemEffect(s.player.equipArmor) : null;
    let acEff = s.player.equipAccessory ? window.getDungeonItemEffect(s.player.equipAccessory) : null;
    
    let allTraits = [];
    if (sEff) allTraits.push(...sEff.traits);
    if (aEff) allTraits.push(...aEff.traits);
    if (acEff) allTraits.push(...acEff.traits);
    
    // ★印の数だけ加算する（盾と鎧の両方につければ +40 になる！）
    bonus = allTraits.filter(t => t === 'max_hunger').length * 20; 
    
    return baseMax + bonus;
};