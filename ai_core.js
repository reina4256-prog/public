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
                desc: "探検には体力がいる。活力を開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 3; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての収集", 
                desc: "森などを「探検」して、木材（wood）を1つ拾ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, // ★修正：0にリセット
                check: function() { return aiPet.inventory.includes('wood'); },
                onClear: function() { aiPet.inventory.splice(aiPet.inventory.indexOf('wood'), 1); } 
            },
            3: { 
                name: "危険を察知する頭脳", 
                desc: "罠を見抜く知恵も必要だ。「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            4: { 
                name: "山の試練", 
                desc: "山などを「探検」して、石（stone）を2つ集めてこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, // ★修正：0にリセット
                check: function() { return aiPet.inventory.filter(i => i === 'stone').length >= 2; }, 
                onClear: function() { 
                    aiPet.inventory.splice(aiPet.inventory.indexOf('stone'), 1);
                    aiPet.inventory.splice(aiPet.inventory.indexOf('stone'), 1);
                }
            },
            5: { 
                name: "一人前の体力", 
                desc: "過酷な環境に耐えるため、活力を開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 10; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "冒険者の休息", 
                desc: "命を守るためには休むことも大事だ。「睡眠」を2回とろう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            7: { 
                name: "最深部へのルート開拓", 
                desc: "何度も「探検」を繰り返し、奥地へのルートを開拓しよう。（探検を5回行う）", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            8: { 
                name: "大自然の制覇", 
                desc: "森と山を駆け巡り、木材（wood）を3つ、石（stone）を3つ集めてこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, // ★修正：0にリセット
                check: function() { 
                    const woods = aiPet.inventory.filter(i => i === 'wood').length;
                    const stones = aiPet.inventory.filter(i => i === 'stone').length;
                    return woods >= 3 && stones >= 3; 
                },
                onClear: function() {
                    for(let i=0; i<3; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('wood'), 1);
                    for(let i=0; i<3; i++) aiPet.inventory.splice(aiPet.inventory.indexOf('stone'), 1);
                }
            },
            9: { 
                name: "伝説への道", 
                desc: "冒険の道を極める最後の試練！活力を開始時より＋20上げよう。", // ★テキスト修正
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 20; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'farming': { // 農家のクエスト（ランク1〜9）
            1: { 
                name: "土を耕す体力", 
                desc: "クワを振るうには体力がいる。活力を開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 3; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての種まき", 
                desc: "支給されたニンジンの種で「農業」を1回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('seed_carrot'); },
                check: function() { return aiPet.apprentice.qVal >= 1; }
            },
            3: { 
                name: "知識の種", 
                desc: "野菜の育て方を知るため「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            4: { 
                name: "初収穫の味", 
                desc: "立派に育てたニンジンを1つ、報告しに行こう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                // ★修正：普通のニンジンか、質のいいニンジンのどちらかがあればOK！
                check: function() { return aiPet.inventory.includes('carrot') || aiPet.inventory.includes('high_carrot'); },
                onClear: function() { 
                    if (aiPet.inventory.includes('high_carrot')) {
                        aiPet.inventory.splice(aiPet.inventory.indexOf('high_carrot'), 1);
                    } else if (aiPet.inventory.includes('carrot')) {
                        aiPet.inventory.splice(aiPet.inventory.indexOf('carrot'), 1);
                    }
                }
            },
            5: { 
                name: "農作業の持久力", 
                desc: "広大な畑を管理するため、活力を開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 10; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "農家の休息", 
                desc: "倒れては元も子もない。「睡眠」を2回とって体を休めよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            7: { 
                name: "畑の管理", 
                desc: "毎日の手入れが命だ。「農業」を3回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 3; }
            },
            8: { 
                name: "豊穣の秋", 
                desc: "ニンジン、トマト、ピーマンのどれでもいい。野菜を合計3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { 
                    // ★修正：質のいい野菜（high_～）もカウント対象に追加！
                    const targets = ['carrot', 'tomato', 'pepper', 'high_carrot', 'high_tomato', 'high_pepper'];
                    const count = aiPet.inventory.filter(i => targets.includes(i)).length;
                    return count >= 3; 
                },
                onClear: function() {
                    const targets = ['carrot', 'tomato', 'pepper', 'high_carrot', 'high_tomato', 'high_pepper'];
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (targets.includes(aiPet.inventory[i])) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                }
            },
            9: { 
                name: "大農園の主", 
                desc: "農業の道を極める最後の試練！活力を開始時より＋20上げよう。", // ★テキスト修正
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 20; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'fishing': { // 漁師のクエスト（ランク1〜9）
            1: { 
                name: "釣り場に立つ体力", 
                desc: "長時間の釣りには体力がいる。活力を開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 3; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての釣り", 
                desc: "支給された古い釣り竿で「釣り」を1回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('rod_old'); },
                check: function() { return aiPet.apprentice.qVal >= 1; }
            },
            3: { 
                name: "魚の生態", 
                desc: "魚の習性を知るため「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            4: { 
                name: "初釣果", 
                desc: "種類は問わない。釣った魚を1匹、報告しに行こう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.inventory.some(i => i.startsWith('fish_')); }, // ★「fish_」から始まるアイテムがあればOK
                onClear: function() { 
                    const idx = aiPet.inventory.findIndex(i => i.startsWith('fish_'));
                    if (idx !== -1) aiPet.inventory.splice(idx, 1); 
                }
            },
            5: { 
                name: "忍耐力", 
                desc: "大物を待つ忍耐力をつけるため、活力を開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 10; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "漁師の休息", 
                desc: "夜釣りに備えて「睡眠」を2回とって体を休めよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            7: { 
                name: "爆釣の予感", 
                desc: "何度も糸を垂らそう。「釣り」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            8: { 
                name: "大漁の証", 
                desc: "種類は問わない。魚（fish_から始まるアイテム）を合計3匹持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, // ★修正：0にリセット
                check: function() { 
                    const count = aiPet.inventory.filter(i => i.startsWith('fish_')).length;
                    return count >= 3; 
                },
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
            9: { 
                name: "伝説の海へ", 
                desc: "漁師の道を極める最後の試練！活力を開始時より＋20上げよう。", // ★テキスト修正
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 20; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'cooking': { // 料理人のクエスト（ランク1〜9）
            1: { 
                name: "料理の心得", 
                desc: "レシピを理解する知性が必要だ。賢さを開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 3; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての調理", 
                desc: "支給された食材で「料理」を1回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('carrot'); }, // ★バグ対策: 強制的にニンジンを支給
                check: function() { return aiPet.apprentice.qVal >= 1; }
            },
            3: { 
                name: "食材の研究", 
                desc: "食材の栄養価を知るため「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            4: { 
                name: "初めての一皿", 
                desc: "種類は問わない。料理を1つ完成させて、報告しに行こう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                // ★修正：アイテムの有無ではなく、作った回数（qVal）が1以上ならクリア！
                check: function() { return (aiPet.apprentice.qVal || 0) >= 1; },
                onClear: function() { 
                    // 報告時にもし料理を持っていれば消費する（食べてしまっていてもペナルティなし）
                    const idx = aiPet.inventory.findIndex(i => i.startsWith('dish_'));
                    if (idx !== -1) aiPet.inventory.splice(idx, 1); 
                    aiPet.apprentice.qVal = 0; 
                }
            },
            5: { 
                name: "味覚の探求心", 
                desc: "新しい味の探求のため、賢さを開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 10; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "料理人の舌", 
                desc: "味覚を鍛えるには食べることも修行だ。「食事」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 2; }
            },
            7: { 
                name: "厨房の戦い", 
                desc: "何度もフライパンを振ろう。「料理」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return aiPet.apprentice.qVal >= 5; }
            },
            8: { 
                name: "フルコースの準備", 
                desc: "種類は問わない。料理を合計3つ完成させて、報告しに行こう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                // ★修正：インベントリの数ではなく、作った実績（qVal）が3以上ならクリア！
                check: function() { return (aiPet.apprentice.qVal || 0) >= 3; },
                onClear: function() {
                    // 報告時に料理を持っていれば最大3つまで消費（なくてもOK）
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].startsWith('dish_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                    aiPet.apprentice.qVal = 0;
                }
            },
            9: { 
                name: "三ツ星の頂へ", 
                desc: "料理の道を極める最後の試練！賢さを開始時より＋20上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 20; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            }
        },
        'smithing': { // 鍛冶師のクエスト（ランク1〜9）
            1: { 
                name: "火に耐える体力", 
                desc: "重い槌を振るう体力がいる。活力を開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 3; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての鍛造", 
                desc: "支給された鉄鉱石で「鍛冶」を1回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; aiPet.inventory.push('iron'); }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 1; }
            },
            3: { 
                name: "金属の知識", 
                desc: "鉱石の性質を知るため「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { return (aiPet.apprentice.qVal || 0) >= 2; }
            },
            4: { 
                name: "職人の証", 
                desc: "種類は問わない。作った装備品を1つ、報告しに行こう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 1; },
                onClear: function() { 
                    const idx = aiPet.inventory.findIndex(i => i.startsWith('eq_') || i.startsWith('tool_'));
                    if (idx !== -1) aiPet.inventory.splice(idx, 1); 
                    aiPet.apprentice.qVal = 0;
                }
            },
            5: { 
                name: "精神統一", 
                desc: "集中力を維持するため、活力を開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 10; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "鍛冶師の休息", 
                desc: "熱中しすぎも良くない。「睡眠」を2回とって体を休めよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 2; }
            },
            7: { 
                name: "千錬万鍛", 
                desc: "鉄を叩いて形を覚えよう。「鍛冶」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 5; }
            },
            8: { 
                name: "名工への準備", 
                desc: "作った装備品（eq_やtool_から始まるもの）を合計3つ持ってこよう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 3; },
                onClear: function() {
                    let removed = 0;
                    for (let i = aiPet.inventory.length - 1; i >= 0; i--) {
                        if (aiPet.inventory[i].startsWith('eq_') || aiPet.inventory[i].startsWith('tool_')) {
                            aiPet.inventory.splice(i, 1); removed++;
                            if (removed >= 3) break;
                        }
                    }
                    aiPet.apprentice.qVal = 0;
                }
            },
            9: { 
                name: "伝説の鍛冶屋へ", 
                desc: "鍛冶の道を極める最後の試練！活力を開始時より＋20上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 20; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            }
        },
        'building': { // 建築士のクエスト（ランク1〜9）
            1: { 
                name: "空間把握能力", 
                desc: "図面を引くには賢さがいる。賢さを開始時より＋3上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 3; }, 
                check: function() { return aiPet.stats.intel >= aiPet.apprentice.qVal; }
            },
            2: { 
                name: "はじめての建築", 
                // ★修正：チャットで指示する文言に変更
                desc: "支給された資材で「建築」を1回行おう。", 
                setup: function() { 
                    aiPet.apprentice.qVal = 0; 
                    for(let i=0; i<5; i++){ aiPet.inventory.push('wood'); aiPet.inventory.push('stone'); } 
                }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 1; }
            },
            3: { 
                name: "素材の知識", 
                desc: "建材の性質を知るため「勉強」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; },
                check: function() { return (aiPet.apprentice.qVal || 0) >= 2; }
            },
            4: { 
                name: "基礎工事の反復", 
                desc: "実践あるのみ。「建築」を2回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 2; }
            },
            5: { 
                name: "現場の体力", 
                desc: "重い資材を運ぶため、活力を開始時より＋10上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.power) + 10; }, 
                check: function() { return aiPet.stats.power >= aiPet.apprentice.qVal; }
            },
            6: { 
                name: "職人の休息", 
                desc: "事故を防ぐには休息も大事だ。「睡眠」を2回とろう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 2; }
            },
            7: { 
                name: "街づくりの鬼", 
                desc: "どんどん建てよう。「建築」を5回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 5; }
            },
            8: { 
                name: "現場の指揮", 
                desc: "図面と安全管理を極めるため、「勉強」を3回行おう。", 
                setup: function() { aiPet.apprentice.qVal = 0; }, 
                check: function() { return (aiPet.apprentice.qVal || 0) >= 3; }
            },
            9: { 
                name: "伝説のマスタービルダーへ", 
                desc: "建築の道を極める最後の試練！賢さを開始時より＋20上げよう。", 
                setup: function() { aiPet.apprentice.qVal = Math.floor(aiPet.stats.intel) + 20; }, 
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

// ★完全版: 育成の偏りによって性格が分岐するシステム
function getPersonalityType(stats) {
    if (!stats) return 'average';
    const intel = stats.intel || 0;
    const power = stats.power || 0;
    const beauty = stats.beauty || 0;
    const mood = stats.mood || 0; 
    
    // 育成ステータス（機嫌以外）の最大値と最小値を計算
    const coreMax = Math.max(intel, power, beauty);
    const coreMin = Math.min(intel, power, beauty);
    
    // 1. 状態異常系（最優先）
    if (mood <= 20) return 'gloom'; // 陰気（機嫌が非常に悪い）
    
    // 2. 超エリート状態
    if (intel > 40 && power > 40 && beauty > 40) return 'stoic'; // ストイック
    
    // 3. 初期状態・未発達
    if (coreMax < 30) return 'average'; // まだ育っていない時は基本「普通」
    
    // 4. 器用貧乏（中途半端なバランス型）
    // トップの能力と一番低い能力の差が10未満の場合、器用貧乏になってサボりだす
    if (coreMax - coreMin < 10) return 'lazy'; // 怠け者
    
    // 5. 特化型（何かが突出して育っている場合）
    if (coreMax === beauty) {
        // 美しさ特化の場合、機嫌が非常に良ければアイドル、それ以外は芸術家
        if (mood >= 90) return 'idol';
        return 'artist';
    }
    
    if (coreMax === intel) return 'scholar'; // 学者肌
    if (coreMax === power) return 'athlete'; // 体育会系
    
    return 'average';
}

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

// ★修正：第4引数に ignoreWater = false を追加
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

        // 橋が島に1つも建っていない場合だけ諦める
        if (!isWandering) {
            this.message = "川を渡るには橋が足りないみたい...";
            this.messageTimer = 120;
            if (this.schedule && this.schedule.length > 0) {
                this.schedule[0].duration = 0;
                this.schedule[0].aborted = true;
            }
        }
        this.actionState = 'idle';
        return false;
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
    
    const pType = getPersonalityType(this.stats);
    let typeKey = this.baseType || 'robot';
    if (this.currentSkin) {
        if (this.currentSkin.includes('robot')) typeKey = 'robot'; 
        else if (this.currentSkin.includes('spirit')) typeKey = 'spirit'; 
        else if (this.currentSkin.includes('magician')) typeKey = 'magician';
    }
    if (!characterDialogues[typeKey]) typeKey = 'robot';

    // (※以下、元の「知っている行動のみ自発的に開始する」処理などがそのまま続きます)
    if (currentMode === 'play' && this.schedule.length === 0 && Math.random() < 0.4) {
        let autoTask = null;
        let actMsg = "";
        
        const knows = (word) => this.apprentice && this.apprentice.learnedWords && this.apprentice.learnedWords.includes(word);
        
        if (pType === 'scholar' && knows("勉強") && Math.random() < 0.6) { autoTask = 'study'; actMsg = "気になって本を読み始めた！"; }
        else if (pType === 'athlete' && knows("筋トレ") && Math.random() < 0.6) { autoTask = 'train'; actMsg = "じっとしていられず筋トレ開始！"; }
        else if (pType === 'artist' && knows("鍛冶") && Math.random() < 0.4) { autoTask = 'smith'; actMsg = "何かを作りたくなってきた！"; }
        else if (pType === 'idol' && knows("探検") && Math.random() < 0.4) { autoTask = 'explore'; actMsg = "みんなに会いにお出かけしよう！"; }
        else if (pType === 'stoic' && Math.random() < 0.7) { 
            let stoicActs = [];
            if (knows("勉強")) stoicActs.push('study');
            if (knows("筋トレ")) stoicActs.push('train');
            if (knows("探検")) stoicActs.push('explore');
            if (stoicActs.length > 0) {
                autoTask = stoicActs[Math.floor(Math.random() * stoicActs.length)];
                actMsg = "時間を無駄にせず自己研鑽だ！";
            }
        }
        else if (pType === 'lazy' && knows("休憩") && Math.random() < 0.5) { autoTask = 'rest'; actMsg = "もう疲れたから寝る..."; }
        
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
            if (!this.isPointOnWater(nextX, nextY)) { found = true; break; }
        }
        if (found) {
            if(this.setDestination(nextX, nextY, true)) this.actionState = 'moving';
        }
    } else {
        const data = characterDialogues[typeKey][pType];
        if (data && data.length > 0) { this.message = data[Math.floor(Math.random() * data.length)]; }
        this.messageTimer = 120;
    }
};

aiPet.processCookingStart = function(task) {
    // 修行中（isTrialフラグがある時）は材料チェックをスキップしてお試し料理
    if (task.isTrial) {
        let successRate = 0.4 + ((this.skills.cooking || 1) * 0.05);
        task.cookData = {
            targetId: 'baked_carrot', // お試しはニンジン料理固定
            targetName: "お試しの焼きニンジン",
            successRate: successRate,
            isSuccess: Math.random() < successRate,
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
        this.stats.mood += 5;
        this.message = `料理成功！ ${d.targetName}ができた！`;
        // お試し料理の場合はアイテムを渡さない（または即座に消費したことにする）
        if (!d.isTrial) this.inventory.push(d.targetId);
    } else {
        if (!this.skills.cooking) this.skills.cooking = 1;
        this.skills.cooking += 0.1;
        this.message = "料理失敗... 焦がしちゃった...";
        if (!d.isTrial) this.inventory.push('burnt_food');
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
    // ★修正：修行中（isTrialフラグがある時）は、材料消費なしで「練習用装備」を作る！
    if (task.isTrial) {
        let successRate = 0.3 + ((this.skills.smithing || 1) * 0.05);
        
        // クエストの判定（eq_ や tool_ から始まる）を通過しつつ、実用品ではないIDにする
        const trialItems = [
            { id: 'eq_practice_sword', name: '練習用のなまくら剣' },
            { id: 'eq_practice_shield', name: '練習用のボロボロの盾' },
            { id: 'tool_practice_pan', name: '練習用の歪な鍋' }
        ];
        let pick = trialItems[Math.floor(Math.random() * trialItems.length)];

        task.smithData = {
            targetId: pick.id,
            targetName: pick.name,
            successRate: successRate,
            isSuccess: Math.random() < successRate,
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
        this.stats.mood += 5;
        this.message = `鍛冶成功！ ${d.targetName}ができた！`;
        
        // ★修正：お試し（練習用装備）であっても、報告して没収されるようにインベントリに入れる！
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
            d.caughtItem = caughtItem;
            d.targetName = itemCatalog[caughtItem].name;
            
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
                const failMsgs = ["逃げられた...", "糸が切れた..."];
                this.message = failMsgs[Math.floor(Math.random()*failMsgs.length)];
                this.messageTimer = 90;
                
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
        if (this.age === 0 && (this.lifeAgeTimer === undefined || this.lifeAgeTimer > 100)) this.lifeAgeTimer = 0;
        this.lifeAgeTimer = (this.lifeAgeTimer || 0) + 1;
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
                    let dungeons = targets.filter(isDungeon);
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
                const isSlowTask = !fastTasks.includes(task.type) && task.type !== 'explore';

                if (isSlowTask && !window.isFastForwardLife && !isOneMinutePassed) {
                    if (task.type === 'life_author' || task.type === 'writing' || task.type === 'study') { this.visualAction = 'study'; } 
                    else if (task.type === 'eat') { this.actionState = this.isIndoors ? 'inside' : 'eating'; this.visualAction = 'eat_raw'; } 
                    else if (task.type === 'cook' || task.type === 'shop_work' || task.type === 'smith') { this.visualAction = (myShop?.type === 'smith' || task.type === 'smith') ? 'smith' : 'cook'; }
                    else if (task.type === 'fish') {
                        this.visualAction = 'fish'; this.actionState = 'fishing';
                        if (typeof this.processFishingFrame === 'function') this.processFishingFrame();
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
            }
        }
    }
    
    this.energy = Math.max(0, Math.min(100, this.energy)); this.hunger = Math.max(0, Math.min(100, this.hunger));
    
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
                        this.actionState = 'idle'; this.isIndoors = false; this.indoorTarget = null;
                        this.schedule = []; if (typeof window.updateScheduleList === 'function' && !window.isCatchingUp) window.updateScheduleList();
                        if (typeof window.openDungeonUI === 'function' && !window.isCatchingUp) window.openDungeonUI(this.interactionTarget.type);
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
        if (this.intendedSeed) { farmAct = 'farm_seed'; msg = "種まき中..."; }
        else if (this.intendedAction === 'pest_control') { farmAct = 'farm_pest'; msg = "害虫退治中..."; }
        else if (this.interactionTarget.isDead || this.interactionTarget.isEaten) { farmAct = 'farm_plow'; msg = "片付け中..."; }
        else if (this.interactionTarget.growth >= 100) { farmAct = 'farm_harvest'; msg = "収穫中..."; }
        else { farmAct = 'farm_water'; }
        this.visualAction = farmAct; this.message = msg;
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
            const itemKey = itemsTable[Math.floor(Math.random() * itemsTable.length)]; 
            const item = itemCatalog[itemKey]; 
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
        }
    } else { 
        this.message = "敵に遭遇！逃げた！"; 
        if (!this.godMode) { this.energy -= 5 * consumeRate; this.stats.mood -= 2; }
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
    { id: "flee", name: "にげる" }
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

// ==========================================
// ★ 追加：ダンジョン内のアイテム効果（HP＆満腹度）辞書
// ==========================================
window.getDungeonItemEffect = function(itemId) {
    let baseData = null;
    if (typeof itemCatalog !== 'undefined' && itemCatalog[itemId]) baseData = itemCatalog[itemId];
    
    // アイテムが無くても名前を表示できるようにする
    let name = baseData ? baseData.name : itemId;
    if (itemId === 'item_sword_iron') name = "鉄の剣";
    if (itemId === 'item_shield_wood') name = "木の盾";
    
    let effect = { hp: 0, hunger: 0, isConsumable: false, isWeapon: false, isShield: false, atk: 0, def: 0, name: name };

    // 料理や食べ物
    if (itemId.startsWith('dish_')) { effect.hp = 30; effect.hunger = 40; effect.isConsumable = true; }
    else if (itemId === 'item_berry' || itemId.includes('apple') || itemId.includes('fruit')) { effect.hp = 10; effect.hunger = 15; effect.isConsumable = true; }
    else if (itemId === 'herb' || itemId.includes('potion')) { effect.hp = 50; effect.hunger = 5; effect.isConsumable = true; }
    else if (itemId.includes('fish') || itemId.includes('meat')) { effect.hp = 15; effect.hunger = 25; effect.isConsumable = true; }
    else if (itemId.includes('seed')) { effect.hp = 5; effect.hunger = 5; effect.isConsumable = true; }
    
    // ★ 追加：武器と盾の性能定義（将来的に種類を増やすベースになります）
    else if (itemId === 'item_sword_iron' || itemId.includes('sword') || itemId.includes('weapon')) {
        effect.isWeapon = true;
        effect.atk = 15; // 攻撃力に+15
    }
    else if (itemId === 'item_shield_wood' || itemId.includes('shield')) {
        effect.isShield = true;
        effect.def = 8; // 受けるダメージを-8
    }

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

window.createDungeonSprite = function(spriteKey, logicalY, brightness = 1.0, isEnemy = false) {
    const sp = window.DUNGEON_SPRITES[spriteKey]; if (!sp) return null;
    const isMapChip = spriteKey.startsWith('skull_') || spriteKey.startsWith('crystal_');
    const div = document.createElement('div');
    div.style.position = 'absolute'; div.style.width = `${sp.sw}px`; div.style.height = `${sp.sh}px`;
    div.style.display = 'flex'; div.style.justifyContent = 'center'; div.style.alignItems = isMapChip ? 'flex-end' : 'center'; 
    div.style.overflow = 'visible'; div.style.zIndex = logicalY; 
    
    const inner = document.createElement('div');
    inner.style.width = `${sp.sw}px`; inner.style.height = `${sp.sh}px`;
    inner.style.backgroundImage = `url('${sp.img}')`; inner.style.backgroundPosition = `-${sp.sx}px -${sp.sy}px`;
    inner.style.backgroundRepeat = 'no-repeat'; 
    let filterStr = brightness < 1.0 ? `brightness(${brightness}) ` : '';
    if (isEnemy) filterStr += "sepia(100%) hue-rotate(-50deg) saturate(200%) brightness(0.7) ";
    inner.style.filter = filterStr.trim();
    inner.style.transform = `scale(${sp.scale})`;
    inner.style.transformOrigin = isMapChip ? 'bottom center' : 'center center'; inner.style.flexShrink = '0';
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

window.openDungeonUI = function(mapType = 'skull') {
    const s = window.DUNGEON_STATE;
    s.mapType = mapType; s.floor = 1;
    
    let currentSkin = 'robot'; let currentType = 'robot';
    if (window.aiPet) {
        currentSkin = window.aiPet.currentSkin || window.aiPet.baseType || 'robot';
        currentType = currentSkin.split('_')[0]; 
    }
    
    s.player.type = currentType;
    s.player.skin = currentSkin;
    s.player.atkBuff = 0; s.player.defBuff = 0;

    if (mapType === 'crystal') {
        s.player.maxHp = 100;
        s.player.hp = 100;
        s.player.hunger = 100;
        s.player.level = 1;
        s.player.exp = 0;
        s.player.nextExp = 20;
        s.player.basePwr = 10;
        s.player.tempInventory = []; // 持ち込み不可
    } else {
        if (window.aiPet) {
            let pwr = window.aiPet.stats.power || 10;
            let gen = window.aiPet.generation || 1;
            let age = window.aiPet.age || 0;
            s.player.maxHp = 100 + (pwr * 2) + (gen * 5) + (age * 2);
            s.player.hp = s.player.maxHp;
            s.player.hunger = window.aiPet.hunger || 100;
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
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🎒 持ち込みアイテム (自動消費)</div>
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
            // ★追加：25階の踏破報酬（カードショップの素材）
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
        
        // ★新規追加：装備中のアイテムも一旦鞄に戻して持ち帰る準備をする
        if (s.player.equipWeapon) { s.player.tempInventory.push(s.player.equipWeapon); s.player.equipWeapon = null; }
        if (s.player.equipShield) { s.player.tempInventory.push(s.player.equipShield); s.player.equipShield = null; }
        
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
        
        // ★修正：裏にある持ち物パネルを確実に更新させて報酬を表示させる
        if (typeof updateStatUI === 'function') updateStatUI();
        if (typeof openInventoryPanel === 'function') {
            const invPanel = document.getElementById('panel-inventory');
            if (invPanel && invPanel.classList.contains('active')) openInventoryPanel();
        }
    }

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
                let itemName = typeof itemCatalog !== 'undefined' && itemCatalog[key] ? itemCatalog[key].name : key;
                if (key === 'item_sword_iron') itemName = "鉄の剣";
                if (key === 'item_shield_wood') itemName = "木の盾";
                let nameColor = key.startsWith('mat_') ? '#E040FB' : '#FFF';
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
        resultUI.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 40000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-family: sans-serif;`;
        document.body.appendChild(resultUI);
    }
    
    let resultTitle = isGameOver && !isRescued ? '💀 探索失敗...' : (isRescued ? '👼 救助成功！' : '✨ 探索完了！');
    let titleColorStr = isGameOver && !isRescued ? '#ff5252' : '#FFD700';

    resultUI.innerHTML = `
        <div style="background:#1a1a1a; border:4px solid ${titleColorStr}; border-radius:12px; padding:40px; text-align:center; min-width:400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
            <h2 style="color:${titleColorStr}; font-size:32px; margin-top:0;">${resultTitle}</h2>
            ${rewardHtml}
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
    
    // 5秒ごとに救助されたかチェックする
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
    }, 5000);
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
    s.rescueTargets = []; // ★追加：この階にいる救助対象
    
    for(let y = 0; y < s.mapHeight; y++) {
        s.grid[y] = new Array(s.mapWidth).fill(1);
        s.visited[y] = new Array(s.mapWidth).fill(false); 
    }
    const rooms = []; const numRooms = 4 + Math.floor(Math.random() * 4); 

    for (let i = 0; i < numRooms; i++) {
        let rw = 5 + Math.floor(Math.random() * 4); let rh = 5 + Math.floor(Math.random() * 4); 
        let rx = 2 + Math.floor(Math.random() * (s.mapWidth - rw - 4)); let ry = 2 + Math.floor(Math.random() * (s.mapHeight - rh - 4));
        
        s.roomsInfo.push({ x: rx, y: ry, w: rw, h: rh });
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
    s.player.x = rooms[0].x; s.player.y = rooms[0].y;
    let lastRoom = rooms[rooms.length - 1]; s.grid[lastRoom.y][lastRoom.x] = 2; 

    // ★修正：敵の基礎ステータスを大幅に下げて、初期レベルでも戦えるようにする
    const enemyCount = 3 + Math.floor(s.floor / 3); // 数も減らす
    const eHpBase = s.mapType === 'crystal' ? 10 : 20;  
    const eDmgBase = s.mapType === 'crystal' ? 3 : 5;   

    for(let i=0; i<enemyCount; i++) {
        let roomIdx = 1 + Math.floor(Math.random() * (rooms.length - 1)); let r = rooms[roomIdx];
        let ex, ey; do { 
            ex = r.x + Math.floor(Math.random() * 5 - 2); ey = r.y + Math.floor(Math.random() * 5 - 2);
        } while (s.grid[ey][ex] !== 0 || (ex === s.player.x && ey === s.player.y));
        
        let eType = window._dungeonAiTypesList[Math.floor(Math.random() * window._dungeonAiTypesList.length)];
        
        // ★修正：階層ボーナス（s.floor * 5等）の上がり幅もマイルドにしました
        s.enemies.push({ id: 'e_'+i, x: ex, y: ey, hp: eHpBase + s.floor * 3, maxHp: eHpBase + s.floor * 3, damage: eDmgBase + s.floor * 1, name: `迷宮の${eType}`, type: eType, face: 'down', attackAnim: false });
    }

    // ==========================================
    // ★ 追加：クラウドから救助待ちプレイヤーを取得してマップに配置
    // ==========================================
    // ==========================================
    // ★ 追加：クラウドから救助待ちプレイヤーを取得してマップに配置
    // ==========================================
    if (typeof window.fetchRescueRequests === 'function') {
        try {
            const requests = await window.fetchRescueRequests(s.mapType);
            requests.forEach(req => {
                // 同じ階層で倒れている他プレイヤーがいれば配置！
                if (req.floor === s.floor) {
                    // ★修正：rooms配列(中心点のみ)ではなく、s.roomsInfo(幅と高さあり)を使う！
                    let roomIdx = Math.floor(Math.random() * s.roomsInfo.length);
                    let r = s.roomsInfo[roomIdx];
                    let rx, ry; 
                    let attempts = 0;
                    do {
                        rx = r.x + Math.floor(Math.random() * r.w);
                        ry = r.y + Math.floor(Math.random() * r.h);
                        attempts++;
                    } while ((s.grid[ry][rx] !== 0 || (rx === s.player.x && ry === s.player.y)) && attempts < 50);
                    
                    s.rescueTargets.push({
                        id: req.requesterId,
                        name: req.requesterName,
                        skin: req.aiSkin,
                        x: rx, y: ry, rescued: false
                    });
                }
            });
        } catch(e) { console.error("救助データ配置エラー:", e); }
    }
    
    // 配置後に再描画
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

    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (window.isTileVisible(s, x, y)) s.visited[y][x] = true;
        }
    }

    let isCorridor = (s.grid[s.player.y][s.player.x] === 3); 

    for(let y = startY; y <= endY; y++) {
        for(let x = startX; x <= endX; x++) {
            if (!s.visited[y][x]) continue; 
            
            let isVisibleNow = window.isTileVisible(s, x, y);
            let brightness = 0.2; 
            
            if (isVisibleNow) {
                let inRoom = (!isCorridor && s.roomsInfo.some(r => s.player.x >= r.x && s.player.x < r.x + r.w && s.player.y >= r.y && s.player.y < r.y + r.h && x >= r.x - 1 && x < r.x + r.w + 1 && y >= r.y - 1 && y < r.y + r.h + 1));
                if (inRoom) {
                    brightness = 1.0; 
                } else {
                    const dist = Math.sqrt(Math.pow(x - s.player.x, 2) + Math.pow(y - s.player.y, 2));
                    let baseRad = s.player.type === 'bird' ? 3.5 : 1.5;
                    brightness = dist > baseRad - 0.5 ? 0.6 : 1.0;
                }
            }

            let tileType = s.grid[y][x];
            let key = tileType === 2 ? `${prefix}stair` : (tileType === 1 ? `${prefix}wall` : `${prefix}floor`);
            
            const tile = window.createDungeonSprite(key, y * 10, brightness, false);
            if (tile) { 
                const sp = window.DUNGEON_SPRITES[key];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0;
                const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
                tile.style.left = `${x * logicalTileX + offsetX}px`; 
                tile.style.top = `${y * logicalTileY + offsetY}px`; 
                gridDiv.appendChild(tile); 
            }
        }
    }

    // 救助待ちの他プレイヤーを描画
    if (s.rescueTargets) {
        s.rescueTargets.forEach(t => {
            if(t.rescued) return;
            if (!window.isTileVisible(s, t.x, t.y)) return; 

            const targetDiv = window.createDungeonSprite(`${t.skin}_down`, t.y * 10 + 2, 1.0, false);
            if (targetDiv) {
                const sp = window.DUNGEON_SPRITES[`${t.skin}_down`];
                const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
                targetDiv.style.left = `${t.x * logicalTileX + offsetX}px`; targetDiv.style.top = `${t.y * logicalTileY + offsetY}px`; 
                targetDiv.style.filter = "grayscale(100%) opacity(0.7)"; 
                
                const sosMark = document.createElement('div');
                sosMark.innerText = "🆘";
                sosMark.style.position = "absolute";
                sosMark.style.top = "-30px";
                sosMark.style.fontSize = "30px";
                sosMark.style.textShadow = "0 0 5px red";
                sosMark.style.animation = "atk-up 1s infinite"; 
                targetDiv.appendChild(sosMark);

                gridDiv.appendChild(targetDiv);
            }
        });
    }

    s.enemies.forEach(e => {
        if(e.hp <= 0 || e.x < startX || e.x > endX || e.y < startY || e.y > endY) return;
        if (!window.isTileVisible(s, e.x, e.y)) return;

        const enemyDiv = window.createDungeonSprite(`${e.type}_${e.face}`, e.y * 10 + 5, 1.0, true);
        if (enemyDiv) {
            const sp = window.DUNGEON_SPRITES[`${e.type}_${e.face}`];
            const offsetX = sp ? (logicalTileX - sp.sw) / 2 : 0; const offsetY = sp ? (logicalTileY - sp.sh) / 2 : 0;
            enemyDiv.style.left = `${e.x * logicalTileX + offsetX}px`; enemyDiv.style.top = `${e.y * logicalTileY + offsetY}px`; enemyDiv.style.transition = 'left 0.2s, top 0.2s';
            if (e.attackAnim) { enemyDiv.classList.add(`anim-atk-${e.face}`); e.attackAnim = false; }
            gridDiv.appendChild(enemyDiv);
        }
    });

    // ==========================================
    // ★ 修正：プレイヤー画像の動的切り替え（装備反映）
    // ==========================================
    let stateStr = "";
    if (s.player.equipWeapon && s.player.equipShield) stateStr = "_sword_shield";
    else if (s.player.equipWeapon) stateStr = "_sword";
    else if (s.player.equipShield) stateStr = "_shield";

    let pKey = `${s.player.type}${stateStr}_${s.player.face}`;
    let pSp = window.DUNGEON_SPRITES[pKey];

    // 万が一その種族の装備画像が登録されていない場合は、通常画像（手ぶら）でフォールバック
    if (!pSp) {
        pKey = `${s.player.type}_${s.player.face}`;
        pSp = window.DUNGEON_SPRITES[pKey];
    }

    if (pSp) {
        const pDiv = window.createDungeonSprite(pKey, s.player.y * 10 + 5, 1.0, false);
        if (pDiv) {
            const offsetX = (logicalTileX - pSp.sw) / 2; const offsetY = (logicalTileY - pSp.sh) / 2;
            pDiv.style.left = `${s.player.x * logicalTileX + offsetX}px`; pDiv.style.top = `${s.player.y * logicalTileY + offsetY}px`; pDiv.style.transition = 'left 0.2s, top 0.2s';
            if (s.player.attackAnim) { pDiv.classList.add(`anim-atk-${s.player.face}`); s.player.attackAnim = false; }
            gridDiv.appendChild(pDiv);
        }
    }

    document.getElementById('dg-hp').innerText = Math.max(0, Math.floor(s.player.hp)); 
    document.getElementById('dg-max-hp').innerText = Math.floor(s.player.maxHp); 
    document.getElementById('dg-floor').innerText = s.floor;
    document.getElementById('dg-hunger').innerText = Math.max(0, Math.floor(s.player.hunger));
    
    let levelDisplay = document.getElementById('dg-level-display');
    if (levelDisplay) {
        if (s.mapType === 'crystal') levelDisplay.innerHTML = `<span style="display:inline-block; margin-left:15px; color:#E040FB; font-weight:bold;">Lv.${s.player.level}</span>`;
        else levelDisplay.innerHTML = '';
    }

    // ==========================================
    // ★ 修正：インベントリUIに装備状態を表示
    // ==========================================
    const invListEl = document.getElementById('dg-inventory-list');
    if (invListEl) {
        let invHtml = "";
        
        // 装備中の武器・盾を先頭に表示
        if (s.player.equipWeapon) {
            let wName = window.getDungeonItemEffect(s.player.equipWeapon).name;
            invHtml += `<span style="background:rgba(255,215,0,0.15); color:#FFD700; padding:3px 8px; border-radius:4px; border:1px solid #FFD700; margin-right:5px;">⚔️ ${wName} (装備中)</span>`;
        }
        if (s.player.equipShield) {
            let sName = window.getDungeonItemEffect(s.player.equipShield).name;
            invHtml += `<span style="background:rgba(79,195,247,0.15); color:#4fc3f7; padding:3px 8px; border-radius:4px; border:1px solid #4fc3f7; margin-right:5px;">🛡️ ${sName} (装備中)</span>`;
        }

        // 持っているアイテムを表示
        let counts = {};
        if (s.player.tempInventory) {
            s.player.tempInventory.forEach(k => counts[k] = (counts[k] || 0) + 1);
        }
        for (let k in counts) {
            let iName = window.getDungeonItemEffect(k).name;
            invHtml += `<span style="background:#222; padding:3px 8px; border-radius:4px; border:1px solid #555; margin-right:5px;">${iName} <span style="color:#FFD700">x${counts[k]}</span></span>`;
        }
        
        // 何も持っていない＆装備もない場合
        if (invHtml === "") {
            invHtml = `<span style="color:#888; font-size:12px;">なにも持っていない</span>`;
        }
        
        invListEl.innerHTML = invHtml;
    }

    const wordsContainer = document.getElementById('dg-known-words'); 
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
    const minimap = document.getElementById('dg-modal-minimap'); if (minimap && minimap.style.display !== 'none') window.drawMinimap();
};

window.drawMinimap = function() {
    const s = window.DUNGEON_STATE; const container = document.getElementById('dg-minimap-content'); if (!container) return;
    const miniSize = 10; container.style.width = `${s.mapWidth * miniSize}px`; container.style.height = `${s.mapHeight * miniSize}px`; container.innerHTML = '';
    
    for(let y = 0; y < s.mapHeight; y++) {
        for(let x = 0; x < s.mapWidth; x++) {
            if (!s.visited || !s.visited[y][x]) continue; 
            
            const dot = document.createElement('div'); dot.style.position = 'absolute'; dot.style.left = `${x * miniSize}px`; dot.style.top = `${y * miniSize}px`; dot.style.width = `${miniSize}px`; dot.style.height = `${miniSize}px`;
            
            if (s.grid[y][x] === 1) dot.style.backgroundColor = '#444'; 
            else if (s.grid[y][x] === 2) dot.style.backgroundColor = '#00BCD4'; 
            else dot.style.backgroundColor = '#888'; 
            
            container.appendChild(dot);
        }
    }
    
    // ★ 追加：ミニマップに救助待ちプレイヤーを黄色で表示
    if (s.rescueTargets) {
        s.rescueTargets.forEach(t => { 
            if(t.rescued) return; 
            if (!window.isTileVisible(s, t.x, t.y)) return; 

            const tDot = document.createElement('div'); tDot.style.position = 'absolute'; tDot.style.left = `${t.x * miniSize}px`; tDot.style.top = `${t.y * miniSize}px`; tDot.style.width = `${miniSize}px`; tDot.style.height = `${miniSize}px`; 
            tDot.style.backgroundColor = '#FFEB3B'; // 黄色い点
            tDot.style.boxShadow = '0 0 3px #FFEB3B';
            container.appendChild(tDot); 
        });
    }

    s.enemies.forEach(e => { 
        if(e.hp <= 0) return; 
        if (!window.isTileVisible(s, e.x, e.y)) return; 

        const eDot = document.createElement('div'); eDot.style.position = 'absolute'; eDot.style.left = `${e.x * miniSize}px`; eDot.style.top = `${e.y * miniSize}px`; eDot.style.width = `${miniSize}px`; eDot.style.height = `${miniSize}px`; eDot.style.backgroundColor = '#ff5252'; container.appendChild(eDot); 
    });
    
    const pDot = document.createElement('div'); pDot.style.position = 'absolute'; pDot.style.left = `${s.player.x * miniSize}px`; pDot.style.top = `${s.player.y * miniSize}px`; pDot.style.width = `${miniSize}px`; pDot.style.height = `${miniSize}px`; pDot.style.backgroundColor = '#4CAF50'; pDot.style.boxShadow = '0 0 5px #4CAF50'; 
    const faceIndicator = document.createElement('div'); faceIndicator.style.position = 'absolute'; faceIndicator.style.width = '4px'; faceIndicator.style.height = '4px'; faceIndicator.style.backgroundColor = '#FFF';
    if (s.player.face === 'up') { faceIndicator.style.top = '0'; faceIndicator.style.left = '3px'; } if (s.player.face === 'down') { faceIndicator.style.bottom = '0'; faceIndicator.style.left = '3px'; }
    if (s.player.face === 'left') { faceIndicator.style.top = '3px'; faceIndicator.style.left = '0'; } if (s.player.face === 'right') { faceIndicator.style.top = '3px'; faceIndicator.style.right = '0'; }
    pDot.appendChild(faceIndicator); container.appendChild(pDot);
};

window.dealDungeonDamage = function(attacker, defender) {
    let basePwr = attacker === window.DUNGEON_STATE.player ? window.DUNGEON_STATE.player.basePwr : 10;
    let dmg = attacker.damage || (5 + Math.floor(basePwr * 0.5));
    
    if (attacker === window.DUNGEON_STATE.player && window.DUNGEON_STATE.player.equipWeapon) {
        dmg += window.getDungeonItemEffect(window.DUNGEON_STATE.player.equipWeapon).atk;
    }

    if (attacker.type === 'dragon' && Math.random() < 0.2) {
        dmg *= 2; window.addDungeonLog(`ドラゴンの猛撃！ダメージ2倍！`, '#ff5252');
    }
    if (attacker.type === 'magician') { window.addDungeonLog(`魔法攻撃！`, '#E040FB'); }

    if (defender.type === 'ghost' && Math.random() < 0.3) {
        window.addDungeonLog(`ゴーストは攻撃をすり抜けた！`, '#aaa'); return 0;
    }
    
    let defBuff = 0;
    if (defender === window.DUNGEON_STATE.player && window.DUNGEON_STATE.player.equipShield) {
        defBuff = window.getDungeonItemEffect(window.DUNGEON_STATE.player.equipShield).def;
    }
    if (defender.type === 'stone') defBuff += 5; 
    
    dmg = Math.max(1, dmg - defBuff); 

    defender.hp -= dmg;
    window.addDungeonLog(`${defender.name || '敵'}に ${dmg} ダメージ！`, '#ff5252');

    if (defender.hp > 0) {
        if (attacker.type === 'beetle') {
            let kx = defender.x, ky = defender.y;
            if (attacker.face === 'up') ky--; else if (attacker.face === 'down') ky++;
            else if (attacker.face === 'left') kx--; else if (attacker.face === 'right') kx++;
            if (window.DUNGEON_STATE.grid[ky][kx] !== 1 && !window.DUNGEON_STATE.enemies.some(e => e.hp>0 && e.x===kx && e.y===ky)) {
                defender.x = kx; defender.y = ky; window.addDungeonLog(`カブトムシの角で吹き飛ばされた！`, '#FF9800');
            }
        }
        if (attacker.type === 'spirit') {
            let heal = Math.floor(dmg / 2); attacker.hp = Math.min(attacker.maxHp || 100, attacker.hp + heal);
            window.addDungeonLog(`精霊の力で ${heal} 回復！`, '#4CAF50');
        }
        if (defender.type === 'balloon') {
            let wx, wy;
            do { wx = Math.floor(Math.random() * window.DUNGEON_STATE.mapWidth); wy = Math.floor(Math.random() * window.DUNGEON_STATE.mapHeight);
            } while (window.DUNGEON_STATE.grid[wy][wx] !== 0);
            defender.x = wx; defender.y = wy; window.addDungeonLog(`風船が割れてどこかへ飛んでいった！`, '#00BCD4');
        }
    } else if (defender !== window.DUNGEON_STATE.player) {
        window.addDungeonLog(`${defender.name} を倒した！`, '#FFD700');
        
        // ★新規追加：敵のアイテムドロップ処理（40%で回復や装備を落とす！）
        if (Math.random() < 0.4) {
            const dropTable = [
                { id: 'herb', name: '薬草', weight: 30 },
                { id: 'item_berry', name: '野イチゴ', weight: 30 },
                { id: 'dish_stirfry', name: '野菜炒め', weight: 15 },
                { id: 'item_sword_iron', name: '鉄の剣', weight: 10 },
                { id: 'item_shield_wood', name: '木の盾', weight: 15 }
            ];
            let totalWeight = dropTable.reduce((sum, item) => sum + item.weight, 0);
            let rand = Math.random() * totalWeight;
            let dropped = dropTable[0];
            for (let item of dropTable) {
                if (rand < item.weight) { dropped = item; break; }
                rand -= item.weight;
            }
            window.DUNGEON_STATE.player.tempInventory.push(dropped.id);
            window.addDungeonLog(`敵は ${dropped.name} を落とした！`, '#4CAF50');
            window.updateDungeonUI();
        }

        if (window.DUNGEON_STATE.mapType === 'crystal') {
            let s = window.DUNGEON_STATE;
            s.player.exp += defender.maxHp;
            if (s.player.exp >= s.player.nextExp) {
                s.player.level++;
                s.player.exp -= s.player.nextExp;
                s.player.nextExp = Math.floor(s.player.nextExp * 1.5);
                s.player.maxHp += 20;
                s.player.hp = s.player.maxHp; 
                s.player.basePwr += 8; // ★上方修正: レベルアップ時の攻撃力上昇をアップ
                s.player.hunger = 100; 
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
                        let hasFood = s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hunger > 0);
                        let hasHeal = s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hp > 0);

                        if (s.player.hp < s.player.maxHp * 0.4 && hasHeal && validCmdIds.includes('heal')) chosenCommand = 'heal'; 
                        else if (s.player.hunger < 40 && hasFood && validCmdIds.includes('eat')) chosenCommand = 'eat'; 
                        else if (s.player.hp < s.player.maxHp * 0.3 && enemyInSight && validCmdIds.includes('flee')) chosenCommand = 'flee';
                        else if (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isWeapon) && validCmdIds.includes('equip')) chosenCommand = 'equip';
                        else if (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isShield) && validCmdIds.includes('equip')) chosenCommand = 'equip';
                        else if (enemyAdjacent && validCmdIds.includes('attack')) chosenCommand = 'attack'; 
                        else {
                            let validMoves = [];
                            let possibleDirs = [
                                { cmd: 'move_up', dx: 0, dy: -1 }, { cmd: 'move_down', dx: 0, dy: 1 },
                                { cmd: 'move_left', dx: -1, dy: 0 }, { cmd: 'move_right', dx: 1, dy: 0 }
                            ];
                            let targetPos = null;
                            
                            for(let y=0; y<s.mapHeight; y++) {
                                for(let x=0; x<s.mapWidth; x++) {
                                    if (s.visited[y][x] && s.grid[y][x] === 2) { targetPos = { x: x, y: y }; break; }
                                }
                                if (targetPos) break;
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
                                targetPos = { x: enemyInSight.x, y: enemyInSight.y };
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

                    if (!chosenCommand) {
                        let smartValidCmds = validCmdIds.filter(cmd => {
                            if (cmd === 'eat') return s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hunger > 0);
                            if (cmd === 'heal') return s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hp > 0);
                            if (cmd === 'equip') return (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isWeapon)) || (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isShield));
                            if (cmd === 'unequip') return s.player.equipWeapon || s.player.equipShield;
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
                } else { s.player.attackAnim = true; window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
            } else if (chosenCommand === 'heal' || chosenCommand === 'eat') {
                let consumed = false;
                if (s.player.tempInventory && s.player.tempInventory.length > 0) {
                    for(let i=0; i<s.player.tempInventory.length; i++) {
                        let itemId = s.player.tempInventory[i];
                        let effect = window.getDungeonItemEffect(itemId);
                        if (effect.isConsumable) {
                            let isFull = (s.player.hp >= s.player.maxHp && s.player.hunger >= 100);
                            if (isFull) {
                                if (Math.random() < smartChance) {
                                    window.addDungeonLog(`${aiName} は「今は必要ない」と判断して手を止めた。`, '#aaa');
                                    consumed = true; break;
                                } else {
                                    window.addDungeonLog(`満タンなのに ${effect.name} を食べてしまった...（無駄遣い！）`, '#ff9800');
                                }
                            } else {
                                window.addDungeonLog(`${effect.name} を使い、HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                            }
                            s.player.tempInventory.splice(i, 1); 
                            s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); 
                            s.player.hunger = Math.min(100, s.player.hunger + effect.hunger); 
                            consumed = true; break;
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

    // 3. 【究極版】カーナビ搭載・天才AI ＋ 素早さ連続行動
    window.processDungeonTurn = async function() { 
        const s = window.DUNGEON_STATE; 
        
        // ★AUTO等での二重実行を防ぐロック
        if (s.isProcessingTurn) return;
        s.isProcessingTurn = true;
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        
        try {
            const ai = window.aiPet; const aiName = ai.name || "AI"; 
            
            let tData = typeof charaTraits !== 'undefined' ? (charaTraits[s.player.skin] || charaTraits[s.player.type]) : null;
            let consumption = tData ? (tData.consumption || 1.0) : 1.0;
            s.player.hunger = Math.max(0, s.player.hunger - (1.0 * consumption));
            
            if (s.player.hunger <= 0) {
                s.player.hp -= 2; window.addDungeonLog(`お腹が空いて倒れそうだ... (HP-2)`, '#ff5252');
            } else if (s.player.hunger > 40 && s.player.hp < s.player.maxHp) {
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 1);
            }

            if (s.player.type === 'seed' && s.floor % 5 === 0) {
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + 5); window.addDungeonLog(`光合成で少し回復した...`, '#4CAF50');
            }

            let realSpd = Math.floor(ai.stats.speed || 10);
            let actionCount = 1 + Math.floor(realSpd / 50); 
            if (actionCount > 1) {
                window.addDungeonLog(`💨 素早さを活かして ${actionCount}回 連続行動する！`, '#00e676');
            }

            for (let actStep = 0; actStep < actionCount; actStep++) {
                if (s.player.hp <= 0) break; 

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
                    window.addDungeonLog(`${aiName} は面倒くさがって立ち止まった...`, '#aaa'); chosenCommand = 'skip';
                } else if (pType === 'gloom' && Math.random() < 0.2) {
                    window.addDungeonLog(`${aiName} は暗い気持ちになり、ため息をついた...`, '#aaa'); chosenCommand = 'skip';
                } else if ((pType === 'idol' || pType === 'artist') && Math.random() < 0.15) {
                    window.addDungeonLog(`${aiName} は敵の前で優雅にポーズを決めた！`, '#FFD700'); chosenCommand = 'skip';
                }

                if (chosenCommand !== 'skip') {
                    if (validCmdIds.length === 0) {
                        window.addDungeonLog(`${aiName} は言葉を知らないため、勘で動いている...`, '#aaa');
                        let randomActions = ['move_up', 'move_down', 'move_left', 'move_right', 'attack'];
                        chosenCommand = randomActions[Math.floor(Math.random() * randomActions.length)];
                    } else {
                        if (Math.random() < smartChance) {
                            let hasFood = s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hunger > 0);
                            let hasHeal = s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hp > 0);

                            if (s.player.hp < s.player.maxHp * 0.4 && hasHeal && validCmdIds.includes('heal')) chosenCommand = 'heal'; 
                            else if (s.player.hunger < 40 && hasFood && validCmdIds.includes('eat')) chosenCommand = 'eat'; 
                            else if (s.player.hp < s.player.maxHp * 0.3 && enemyInSight && validCmdIds.includes('flee')) chosenCommand = 'flee';
                            else if (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isWeapon) && validCmdIds.includes('equip')) chosenCommand = 'equip';
                            else if (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isShield) && validCmdIds.includes('equip')) chosenCommand = 'equip';
                            else if (enemyAdjacent && validCmdIds.includes('attack')) chosenCommand = 'attack'; 
                            else {
                                // ==================================================
                                // ★ 超・天才AIの経路探索エンジン（幅優先探索アルゴリズム）
                                // 障害物を完璧に回避し、絶対に壁に引っかからずに目的地へ向かう！
                                // ==================================================
                                let getBfsNextStep = function(startX, startY, isTargetFunc) {
                                    let queue = [{x: startX, y: startY}];
                                    let visitedMap = Array.from({length: s.mapHeight}, () => new Array(s.mapWidth).fill(false));
                                    visitedMap[startY][startX] = true;
                                    let parent = {};
                                    let foundTarget = null;

                                    while(queue.length > 0) {
                                        let cur = queue.shift();
                                        if (isTargetFunc(cur.x, cur.y)) {
                                            foundTarget = cur;
                                            break;
                                        }
                                        let dirs = [{dx:0,dy:-1,cmd:'move_up'}, {dx:0,dy:1,cmd:'move_down'}, {dx:-1,dy:0,cmd:'move_left'}, {dx:1,dy:0,cmd:'move_right'}];
                                        // ランダム性を入れて複数ルートがある時に散らばるようにする
                                        dirs.sort(() => Math.random() - 0.5);
                                        
                                        for(let d of dirs) {
                                            // AIがその方向の「言葉（コマンド）」を知らない場合は進めない
                                            if (!validCmdIds.includes(d.cmd)) continue;
                                            
                                            let nx = cur.x + d.dx; let ny = cur.y + d.dy;
                                            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1 && !visitedMap[ny][nx]) {
                                                visitedMap[ny][nx] = true;
                                                parent[`${nx},${ny}`] = {x: cur.x, y: cur.y};
                                                queue.push({x: nx, y: ny});
                                            }
                                        }
                                    }
                                    
                                    if (!foundTarget) return null;
                                    
                                    // 目的地から逆算して「最初の一歩」を導き出す
                                    let curr = foundTarget;
                                    while(curr.x !== startX || curr.y !== startY) {
                                        let p = parent[`${curr.x},${curr.y}`];
                                        if (p.x === startX && p.y === startY) return curr;
                                        curr = p;
                                    }
                                    return null;
                                };

                                let nextStep = null;

                                // 1. 階段を見つけていれば最優先で目指す
                                nextStep = getBfsNextStep(s.player.x, s.player.y, (x, y) => s.visited[y][x] && s.grid[y][x] === 2);

                                // 2. 階段がなく、HPに余裕があれば視界内の敵を狩りに向かう
                                if (!nextStep && s.player.hp > s.player.maxHp * 0.4 && enemyInSight) {
                                    nextStep = getBfsNextStep(s.player.x, s.player.y, (x, y) => x === enemyInSight.x && y === enemyInSight.y);
                                }

                                // 3. 階段も敵もない場合は、一番近い「まだ行ったことがない黒いマス」を目指す！
                                if (!nextStep) {
                                    nextStep = getBfsNextStep(s.player.x, s.player.y, (x, y) => !s.visited[y][x] && s.grid[y][x] !== 1);
                                }

                                // BFSで見つかった方向に行動を決定
                                if (nextStep) {
                                    if (nextStep.x < s.player.x) chosenCommand = 'move_left';
                                    else if (nextStep.x > s.player.x) chosenCommand = 'move_right';
                                    else if (nextStep.y < s.player.y) chosenCommand = 'move_up';
                                    else if (nextStep.y > s.player.y) chosenCommand = 'move_down';
                                } 
                                // BFSでルートが見つからない（言葉を知らない等で孤立した）場合はランダムに動いてみる
                                else {
                                    let possibleDirs = [
                                        { cmd: 'move_up', dx: 0, dy: -1 }, { cmd: 'move_down', dx: 0, dy: 1 },
                                        { cmd: 'move_left', dx: -1, dy: 0 }, { cmd: 'move_right', dx: 1, dy: 0 }
                                    ];
                                    let validMoves = [];
                                    possibleDirs.forEach(dir => {
                                        if (validCmdIds.includes(dir.cmd)) {
                                            let nx = s.player.x + dir.dx; let ny = s.player.y + dir.dy;
                                            if (nx >= 0 && nx < s.mapWidth && ny >= 0 && ny < s.mapHeight && s.grid[ny][nx] !== 1) {
                                                let score = 10;
                                                if (s.player.lastX === nx && s.player.lastY === ny) score -= 8; 
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
                                if (cmd === 'eat') return s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hunger > 0);
                                if (cmd === 'heal') return s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isConsumable && window.getDungeonItemEffect(i).hp > 0);
                                if (cmd === 'equip') return (!s.player.equipWeapon && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isWeapon)) || (!s.player.equipShield && s.player.tempInventory.some(i => window.getDungeonItemEffect(i).isShield));
                                if (cmd === 'unequip') return s.player.equipWeapon || s.player.equipShield;
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
                    } else { s.player.attackAnim = true; window.addDungeonLog(`空を切った...（近くに敵がいない）`, '#aaa'); }
                } else if (chosenCommand === 'heal' || chosenCommand === 'eat') {
                    let consumed = false;
                    if (s.player.tempInventory && s.player.tempInventory.length > 0) {
                        for(let i=0; i<s.player.tempInventory.length; i++) {
                            let itemId = s.player.tempInventory[i];
                            let effect = window.getDungeonItemEffect(itemId);
                            if (effect.isConsumable) {
                                let isFull = (s.player.hp >= s.player.maxHp && s.player.hunger >= 100);
                                if (isFull) {
                                    if (Math.random() < smartChance) {
                                        window.addDungeonLog(`${aiName} は「今は必要ない」と判断して手を止めた。`, '#aaa');
                                        consumed = true; break;
                                    } else {
                                        window.addDungeonLog(`満タンなのに ${effect.name} を食べてしまった...（無駄遣い！）`, '#ff9800');
                                    }
                                } else {
                                    window.addDungeonLog(`${effect.name} を使い、HPが ${effect.hp}、満腹度が ${effect.hunger} 回復した！`, '#4CAF50');
                                }
                                s.player.tempInventory.splice(i, 1); 
                                s.player.hp = Math.min(s.player.maxHp, s.player.hp + effect.hp); 
                                s.player.hunger = Math.min(100, s.player.hunger + effect.hunger); 
                                consumed = true; break;
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

                window.updateDungeonUI();
                if (actionCount > 1 && actStep < actionCount - 1) {
                    await sleep(200); 
                }
            } // ★ 行動ループはここで終了！

            // ==========================================
            // ★ 敵のターン
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
            
        } catch (e) {
            console.error("【DungeonTurnエラー】処理中にエラーが発生しました:", e);
        } finally {
            s.isProcessingTurn = false; // ★ロック解除
        }
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