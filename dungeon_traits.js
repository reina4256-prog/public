window._dungeonAiTypesList = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'beetle', 'bird'];

// ==========================================
// ★ 新規追加：全種族の特性カタログ（ロボット系21種 完備）
// ==========================================
window.DUNGEON_TRAIT_DICT = {
    // 【カブトムシ系】
    'beetle': { player: { name: '角突き', desc: '移動時に敵にぶつかるとターンを消費せずダメージを与える。' }, enemy: '硬い外殻' },
    'beetle_type4': { player: { name: '剛力', desc: '所持しているアイテムの数が多いほど攻撃力が上がる。' }, enemy: 'カチ上げ' },
    'beetle_type5': { player: { name: '琥珀コーティング', desc: '装備している武器や盾がサビや劣化の効果を受けなくなる。' }, enemy: '琥珀の鎧' },
    'beetle_type2': { player: { name: '希少種', desc: '敵がアイテムをドロップする確率が常に+20%される。' }, enemy: '宝石の煌めき' },
    'beetle_type2_2': { player: { name: '発光体', desc: '暗闇状態を無効化し、フロア全体の隠し通路を見破る。' }, enemy: '月光の刃' },
    'beetle_type3': { player: { name: '群れの統率者', desc: '満腹度が満タンに近いほど、回避率と防御力が大幅に上がる。' }, enemy: 'フェロモン指揮' },
    'beetle_type1': { player: { name: '血の飢え', desc: '[癒]の印（HP吸収）の回復量が2倍になる。' }, enemy: '挟み切り' },
    'beetle_type4_2': { player: { name: '皇帝の威圧', desc: '通常攻撃が必ず「会心の一撃」か「ミス」のどちらかになる。' }, enemy: '大地の怒り' },
    'beetle_type5_2': { player: { name: '生きた化石', desc: '同じフロアに長く留まっても風で強制ゲームオーバーにならない。' }, enemy: '完全硬化' },
    'beetle_type2_3': { player: { name: '妖精の羽', desc: '常に浮遊状態となり、あらゆる罠と特殊地形の効果を受けない。' }, enemy: '鱗粉の風' },
    'beetle_type2_4': { player: { name: '聖なる甲殻', desc: '[光]の印の効果が、すべての悪魔・闇落ち系の敵にも効く。' }, enemy: '神聖領域' },
    // 【基本形態】
    'robot': { player: { name: '頑丈な装甲', desc: '基礎防御力が常に +3 される。' }, enemy: null },
    // 【1進化】
    'robot_type3': { player: { name: '学習機能', desc: '敵を倒したときの獲得経験値が常に +20% される。' }, enemy: 'データ収集' },
    'robot_type3_2': { player: { name: '演算予測', desc: '魔法アイテム（巻物など）を使用したときの効果がフロア全体に及ぶ。' }, enemy: '遠隔操作' },
    'robot_type2': { player: { name: 'スポットライト', desc: 'フロアに降りた瞬間、アイテムの位置がマップでわかる。' }, enemy: 'フラッシュ' },
    'robot_type4': { player: { name: '重装甲', desc: '基礎防御力が常に +6 される（頑丈な装甲を上書き）。' }, enemy: 'キャタピラ突進' },
    'robot_type4_2': { player: { name: '重機動アーム', desc: '壁に向かって移動すると壁を掘って道を作れる。' }, enemy: 'アームスマッシュ' },
    'robot_type1': { player: { name: '殺戮回路', desc: 'HPが満タンの時、通常攻撃のダメージが1.5倍になる。' }, enemy: '破壊衝動' },
    'robot_type5': { player: { name: '省エネ', desc: '満腹度の最大値が最初から +20 される。' }, enemy: 'サビ撒き' },
    // 【2進化】
    'robot_type3_3': { player: { name: '未来予知', desc: '敵からの直接攻撃を 15% の確率で完全回避する。' }, enemy: '神託の盾' },
    'robot_type3_4': { player: { name: 'マッドサイエンス', desc: '草や食べ物の回復量がランダムで 2倍 になる。' }, enemy: '劇薬投擲' },
    'robot_type3_5': { player: { name: '管理者権限', desc: '階段を降りた時、ランダムなアイテムを1つ生成する。' }, enemy: '地形再構築' },
    'robot_type2_2': { player: { name: '癒やしの舞', desc: '部屋の中に敵がいない状態で歩くとHPが自動回復する。' }, enemy: '優雅な舞' },
    'robot_type2_3': { player: { name: '電子の歌姫', desc: '睡眠や混乱など、精神系の状態異常を無効化する。' }, enemy: 'ホログラム' },
    'robot_type2_4': { player: { name: '成金趣味', desc: '敵を倒した時にアイテムをドロップする確率が大幅に上がる。' }, enemy: '買収' },
    'robot_type4_3': { player: { name: '最終兵器', desc: '基礎攻撃力が常に +10 される。' }, enemy: 'ロックオンレーザー' },
    'robot_type4_4': { player: { name: '無限機関', desc: '満腹度が一切減らなくなる（餓死無効）。' }, enemy: 'アースクエイク' },
    'robot_type1_2': { player: { name: 'ウイルス侵蝕', desc: '通常攻撃時、敵に猛毒を付与する。' }, enemy: 'データ吸収' },
    'robot_type1_3': { player: { name: '終焉の炉心', desc: '炎や光などの「追加ダメージ系の印」の威力が2倍になる。' }, enemy: 'メルトダウン' },
    'robot_type5_2': { player: { name: '古代の盾', desc: '敵から受けるすべてのダメージを常に -5 軽減する。' }, enemy: '絶対防御陣' },
    'robot_type5_3': { player: { name: '悠久の時', desc: '自分が死亡した時、一度だけHP半分で復活する。' }, enemy: '時間逆行' },
    'robot_type5_4': { player: { name: '大地の恵み', desc: '毎ターンHPが少し回復し、罠を踏んでも作動しない。' }, enemy: '自然同化' },

    // ==========================================
    // ★ 鳥系（全12種）
    // ==========================================
    'bird': { player: { name: '飛翔', desc: '通行不可地形を飛び越えて移動できる。' }, enemy: '突風' },
    'bird_type2': { player: { name: '精神安定', desc: '睡眠・混乱・魅了にかかる確率を半減する。' }, enemy: '魅惑の鱗粉' },
    'bird_type4': { player: { name: '鷹の目', desc: '視界が通常の1マス分広くなり、遠くの敵やアイテムを察知できる。' }, enemy: '急降下' },
    'bird_type5': { player: { name: '暗視', desc: 'フロアに降りた時、ランダムな敵3体の位置がマップに表示される。' }, enemy: '夜行性' },
    'bird_type1': { player: { name: 'カラスの嗅覚', desc: 'ドロップアイテムがレアアイテムになりやすくなる。' }, enemy: 'ひったくり' },
    'bird_type3': { player: { name: '魔力飛行', desc: '魔法アイテムを使用したターン、自分の移動速度が一時的に上がる。' }, enemy: 'ルーン魔方陣' },
    'bird_type3_2': { player: { name: '最適化ルート', desc: '移動時の満腹度消費が常に10%軽減される。' }, enemy: '追跡レーダー' },
    'bird_type2_2': { player: { name: '神鳥の舞', desc: '階段を降りてフロア移動した際、自身のHPを全回復する。' }, enemy: '銀河の尾羽' },
    'bird_type4_2': { player: { name: '暴風の主', desc: '敵からの吹き飛ばし攻撃を無効化し、逆に相手を壁まで吹き飛ばす。' }, enemy: '暴風域' },
    'bird_type5_2': { player: { name: '始祖の血', desc: '敵を倒した時、ごく稀に最大HPが1増えることがある。' }, enemy: '化石の呪い' },
    'bird_type1_2': { player: { name: '冥界の風', desc: '「会心の一撃」が出た時のダメージ倍率が2倍から3倍になる。' }, enemy: '死肉喰らい' },
    'bird_type3_3': { player: { name: '神眼', desc: '自分のすべての攻撃が必中になり、罠を100%見破る。' }, enemy: '真理の目' },

    // ==========================================
    // ★ 精霊系（全14種）
    // ==========================================
    // 【基本形態】
    'spirit': { player: { name: '自然治癒', desc: '5ターンに1回、HPが 1 自動回復する。' }, enemy: '吸収' },
    // 【1進化】
    'spirit_type2': { player: { name: '妖精の加護', desc: '被弾時、10%の確率でダメージを 0 にする。' }, enemy: '睡眠の粉' },
    'spirit_type4': { player: { name: 'ヘビーパンチ', desc: '通常攻撃時、敵を1マス吹き飛ばすことがある。' }, enemy: 'ハード皮膜' },
    'spirit_type5': { player: { name: '超省エネ', desc: '満腹度の減少速度が 0.8倍 になる。' }, enemy: '保護色' },
    'spirit_type1': { player: { name: '毒素体質', desc: '毒状態にならなくなり、毒の罠を踏むと逆にHPが回復する。' }, enemy: '猛毒胞子' },
    'spirit_type3': { player: { name: '鑑定眼', desc: '拾ったアイテムが最初から「識別」された状態になる。' }, enemy: '魔力譲渡' },
    // 【2進化】
    'spirit_type2_2': { player: { name: '癒やしのオーラ', desc: '隣接している救助対象（NPC）のHPを毎ターン回復させる。' }, enemy: '甘い香り' },
    'spirit_type2_3': { player: { name: '清浄なる輝き', desc: 'すべての状態異常（毒・混乱・睡眠など）を完全に無効化する。' }, enemy: '鏡面反射' },
    'spirit_type4_2': { player: { name: '大樹の怒り', desc: '被弾してダメージを受けた次のターン、攻撃力が 2倍 になる。' }, enemy: '根のバインド' },
    'spirit_type4_3': { player: { name: '大地の力', desc: '「草地」や「土」のタイルの上にいる時、攻撃力と防御力が +10 される。' }, enemy: 'カウンター・ソーン' },
    'spirit_type5_2': { player: { name: '哀愁の波動', desc: '同じ部屋にいる敵の攻撃力を 10% 低下させる。' }, enemy: '落葉の目眩まし' },
    'spirit_type5_3': { player: { name: '耐冷構造', desc: '「水」や「氷」の地形効果を無効化し、攻撃力が上がる。' }, enemy: '凍結の吐息' },
    'spirit_type1_2': { player: { name: '怨念の根', desc: '通常攻撃時、与えたダメージの 30% をHPとして吸収する。' }, enemy: '死の絶叫' },
    'spirit_type3_2': { player: { name: '世界樹の記憶', desc: 'フロアに降りた瞬間、マップ全域と階段の位置が完全に判明する。' }, enemy: '因果改変' }
};

// 進化ツリーの系譜（スタック）を解決する関数
window.getPlayerDungeonTraits = function(skin) {
    let traits = [];
    if (!skin) return traits; // ★修正: 今後の全種族拡張を見据えて、存在チェックのみに簡略化

    const addTrait = (id) => { if (window.DUNGEON_TRAIT_DICT[id] && window.DUNGEON_TRAIT_DICT[id].player) traits.push(window.DUNGEON_TRAIT_DICT[id].player); };

    // ==========================================
    // ★ ロボット系の系譜
    // ==========================================
    if (skin.includes('robot')) {
        addTrait('robot'); // Base

        // Gen 1
        if (skin === 'robot_type3') { addTrait('robot_type3'); }
        else if (skin === 'robot_type3_2') { addTrait('robot_type3_2'); }
        else if (skin === 'robot_type2') { addTrait('robot_type2'); }
        else if (skin === 'robot_type4') { addTrait('robot_type4'); }
        else if (skin === 'robot_type4_2') { addTrait('robot_type4_2'); }
        else if (skin === 'robot_type1') { addTrait('robot_type1'); }
        else if (skin === 'robot_type5') { addTrait('robot_type5'); }
        
        // Gen 2 (ダイヤモンド進化の履歴解決)
        else {
            // ★ 過去の経由ルート(Gen1)を特定する
            // ※今後 aiPet 等に pastSkins（過去の姿の配列）などを実装した場合、ここが自動で機能します
            let pastGen1 = null; 
            if (window.aiPet && window.aiPet.pastSkins) {
                // 履歴の中に 'robot_type3_2' や 'robot_type4_2' があればそれを優先
                pastGen1 = window.aiPet.pastSkins.find(s => s === 'robot_type3_2' || s === 'robot_type4_2');
            }

            if (skin === 'robot_type3_3' || skin === 'robot_type3_4' || skin === 'robot_type3_5') { 
                addTrait(pastGen1 === 'robot_type3_2' ? 'robot_type3_2' : 'robot_type3'); 
                addTrait(skin); 
            }
            else if (skin === 'robot_type2_2' || skin === 'robot_type2_3' || skin === 'robot_type2_4') { 
                addTrait('robot_type2'); addTrait(skin); 
            }
            else if (skin === 'robot_type4_3' || skin === 'robot_type4_4') { 
                addTrait(pastGen1 === 'robot_type4_2' ? 'robot_type4_2' : 'robot_type4'); 
                addTrait(skin); 
            }
            else if (skin === 'robot_type1_2' || skin === 'robot_type1_3') { 
                addTrait('robot_type1'); addTrait(skin); 
            }
            else if (skin === 'robot_type5_2' || skin === 'robot_type5_3' || skin === 'robot_type5_4') { 
                addTrait('robot_type5'); addTrait(skin); 
            }
        }

        // 重装甲がある場合、頑丈な装甲を上書きする
        let hasHeavy = traits.find(t => t.name === '重装甲');
        if (hasHeavy) traits = traits.filter(t => t.name !== '頑丈な装甲');
    }

    // ==========================================
    // ★ 鳥系の系譜
    // ==========================================
    if (skin.includes('bird')) {
        addTrait('bird');

        // Gen 1
        if (skin === 'bird_type2') { addTrait('bird_type2'); }
        else if (skin === 'bird_type4') { addTrait('bird_type4'); }
        else if (skin === 'bird_type5') { addTrait('bird_type5'); }
        else if (skin === 'bird_type1') { addTrait('bird_type1'); }
        else if (skin === 'bird_type3') { addTrait('bird_type3'); }
        else if (skin === 'bird_type3_2') { addTrait('bird_type3_2'); }

        // Gen 2
        else if (skin === 'bird_type2_2') { addTrait('bird_type2'); addTrait('bird_type2_2'); }
        else if (skin === 'bird_type4_2') { addTrait('bird_type4'); addTrait('bird_type4_2'); }
        else if (skin === 'bird_type5_2') { addTrait('bird_type5'); addTrait('bird_type5_2'); }
        else if (skin === 'bird_type1_2') { addTrait('bird_type1'); addTrait('bird_type1_2'); }
        else if (skin === 'bird_type3_3') { addTrait('bird_type3'); addTrait('bird_type3_3'); }
    }

    // ==========================================
    // ★ カブトムシ系の系譜
    // ==========================================
    if (skin.includes('beetle')) {
        addTrait('beetle'); // Base

        // Gen 1
        if (['beetle_type4', 'beetle_type5', 'beetle_type2', 'beetle_type2_2', 'beetle_type3', 'beetle_type1'].includes(skin)) {
            addTrait(skin);
        } 
        // Gen 2 (履歴解決あり)
        else {
            if (skin === 'beetle_type4_2') { addTrait('beetle_type4'); addTrait(skin); }
            else if (skin === 'beetle_type5_2') { addTrait('beetle_type5'); addTrait(skin); }
            else if (skin === 'beetle_type2_3' || skin === 'beetle_type2_4') { 
                // 美しさルートの履歴解決
                let pastBeauty = 'beetle_type2'; 
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('beetle_type2_2')) {
                    pastBeauty = 'beetle_type2_2'; 
                }
                addTrait(pastBeauty); 
                addTrait(skin); 
            }
        }
    }

    // ==========================================
    // ★ 精霊系の系譜
    // ==========================================
    if (skin.includes('spirit')) {
        addTrait('spirit');

        // Gen 1
        if (skin === 'spirit_type2') { addTrait('spirit_type2'); }
        else if (skin === 'spirit_type4') { addTrait('spirit_type4'); }
        else if (skin === 'spirit_type5') { addTrait('spirit_type5'); }
        else if (skin === 'spirit_type1') { addTrait('spirit_type1'); }
        else if (skin === 'spirit_type3') { addTrait('spirit_type3'); }

        // Gen 2
        else if (skin === 'spirit_type2_2') { addTrait('spirit_type2'); addTrait('spirit_type2_2'); }
        else if (skin === 'spirit_type2_3') { addTrait('spirit_type2'); addTrait('spirit_type2_3'); }
        else if (skin === 'spirit_type4_2') { addTrait('spirit_type4'); addTrait('spirit_type4_2'); }
        else if (skin === 'spirit_type4_3') { addTrait('spirit_type4'); addTrait('spirit_type4_3'); }
        else if (skin === 'spirit_type5_2') { addTrait('spirit_type5'); addTrait('spirit_type5_2'); }
        else if (skin === 'spirit_type5_3') { addTrait('spirit_type5'); addTrait('spirit_type5_3'); }
        else if (skin === 'spirit_type1_2') { addTrait('spirit_type1'); addTrait('spirit_type1_2'); }
        else if (skin === 'spirit_type3_2') { addTrait('spirit_type3'); addTrait('spirit_type3_2'); }
    }

    return traits;
};