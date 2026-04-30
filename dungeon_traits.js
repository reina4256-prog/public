window._dungeonAiTypesList = ['robot', 'magician', 'spirit', 'dragon', 'machine', 'stone', 'seed', 'ghost', 'balloon', 'beetle', 'bird'];

// ==========================================
// ★ 新規追加：全種族の特性カタログ（ロボット系21種 完備）
// ==========================================
window.DUNGEON_TRAIT_DICT = {
    // 【魔法使い系】
    'magician': { player: { name: '魔力の才', desc: '魔法アイテム（杖・巻物）の基本威力が 1.2倍 になる。' }, enemy: '初級魔法' },
    'magician_type4': { player: { name: '魔力強化肉体', desc: '基礎攻撃力が 賢さの 20% 分 加算される。' }, enemy: '杖打' },
    'magician_type4_2': { player: { name: '発火体質', desc: '[炎]の印がなくても、通常攻撃に 10 炎ダメージが追加される。' }, enemy: 'ファイアボール' },
    'magician_type1': { player: { name: '毒の知識', desc: '敵に与える毒ダメージが 2倍 になり、持続ターンも伸びる。' }, enemy: 'ウィークネス' },
    'magician_type1_2': { player: { name: '禁忌の儀式', desc: '敵を倒したとき、HPが 5 回復する。' }, enemy: 'マナ・ドレイン' },
    'magician_type5': { player: { name: '効率的詠唱', desc: '魔法アイテム（杖）の使用回数が 15% の確率で減らなくなる。' }, enemy: '魔法障壁' },
    'magician_type2': { player: { name: '変幻自在', desc: 'フロア移動時、ランダムなバフ（加速・攻撃UP等）が1つかかる。' }, enemy: 'ミスディレクション' },
    'magician_type2_2': { player: { name: '氷結の杖', desc: 'すべての杖に「敵を1ターン凍らせる」効果が追加される。' }, enemy: 'フロスト墓標' },
    'magician_type3': { player: { name: '天体観測', desc: 'フロアに落ちている「巻物」の数が 2倍 になる。' }, enemy: 'スターライト' },
    'magician_type4_3': { player: { name: '闘神の加護', desc: '武器と盾の「＋値」による補正が 1.2倍 に強化される。' }, enemy: '魔法鎧' },
    'magician_type4_4': { player: { name: '竜魔の血', desc: '最大HPが +50 され、ドラゴン特効の印を無効化（半減）する。' }, enemy: '竜の咆哮' },
    'magician_type1_3': { player: { name: '冥界の主', desc: 'ゴースト系の敵が自分を攻撃してこなくなる。' }, enemy: '死者蘇生' },
    'magician_type1_4': { player: { name: '等価交換', desc: '満腹度を 10 消費することで、攻撃力を 1ターン 3倍 にできる。' }, enemy: '悪魔召喚' },
    'magician_type5_2': { player: { name: 'クイック・アクト', desc: '10% の確率で、1ターンの間に 2回 行動できる。' }, enemy: 'タイム・ストップ' },
    'magician_type5_3': { player: { name: '星の預言', desc: '罠の位置がすべて見え、かつ 100% 回避できるようになる。' }, enemy: '予言' },
    'magician_type2_3': { player: { name: '虹色の加護', desc: '装備しているアイテムの「印」のスロット数が無限になる。' }, enemy: '七色の幻惑' },
    'magician_type2_4': { player: { name: '天の祝福', desc: '歩くたびに 5% の確率で、足元に「薬草」が生成される。' }, enemy: '聖なる審判' },
    'magician_type3_2': { player: { name: '万物の法則', desc: '属性攻撃（炎・氷・光）による被ダメージをすべて 0 にする。' }, enemy: 'ブラックホール' },
    'magician_type3_3': { player: { name: '叡智の頂点', desc: 'フロアのすべての敵、アイテム、階段、罠を最初から見通す。' }, enemy: '全知の消去' },

    // 【機械系】
    'machine': { player: { name: 'エコ駆動', desc: '何も行動せずターンをスキップ（素振り）した時の満腹度消費が 0 になる。' }, enemy: 'ゼンマイ駆動' },
    'machine_type2': { player: { name: '癒やしの音色', desc: 'ダメージを受けた時、確率で自分のHPを少し回復する。' }, enemy: '子守唄' },
    'machine_type4': { player: { name: 'パワフル', desc: '重い武器（剣や斧など）を装備していると、攻撃力に +5 のボーナス。' }, enemy: 'プレス攻撃' },
    'machine_type5': { player: { name: '骨董品の価値', desc: '敵を倒した時、稀に「最大満腹度」が微回復する。' }, enemy: 'ギシギシ音' },
    'machine_type1': { player: { name: '身代わり人形', desc: '致命傷を受けた時、鞄のアイテムをランダムに1つ消滅させてHP1で耐える。' }, enemy: '呪いの釘' },
    'machine_type3': { player: { name: '階差演算', desc: '同じ敵を連続で攻撃するたびに、ダメージが +2 ずつ増加していく。' }, enemy: '計算された一撃' },
    'machine_type2_2': { player: { name: 'クロックアップ', desc: 'HPが30%以下のピンチのとき、常に2回行動できるようになる。' }, enemy: '時報' },
    'machine_type4_2': { player: { name: '蒸気爆発', desc: '通常攻撃時、10%の確率で周囲1マスにも範囲ダメージ（爆風）を与える。' }, enemy: 'オーバードライブ' },
    'machine_type5_2': { player: { name: '自然適応', desc: '毒、睡眠などの「自然系の状態異常」をすべて無効化する。' }, enemy: '自己修復' },
    'machine_type5_3': { player: { name: 'オーバーテクノロジー', desc: '魔法の杖を使った際、確率で消費なしで効果が2回連続で発動する。' }, enemy: '古代兵器' },
    'machine_type1_2': { player: { name: 'ガラクタ吸収', desc: 'インベントリのアイテムを「食べる（消化）」ことでHPを回復できる。' }, enemy: '同化' },
    'machine_type3_2': { player: { name: '特異点', desc: 'ワープの罠や風船移動時、着地先に敵がいない安全な場所が選ばれる。' }, enemy: '次元跳躍' },

    // 【ゴースト系】
    'ghost': { player: { name: '幽体', desc: '壁の中を移動できる（壁の中にいる間は毎ターンHPを消費）。' }, enemy: 'すり抜け' },
    'ghost_type2': { player: { name: '浄化の光', desc: '呪われた装備品を装備した瞬間、自動的に解呪する。' }, enemy: '誘いの光' },
    'ghost_type4': { player: { name: '念動力', desc: '部屋内のアイテムを自動的に足元へ引き寄せる。' }, enemy: 'ポルターガイスト' },
    'ghost_type5': { player: { name: '古の霊体', desc: '空腹によるHP減少ダメージを完全に無効化する。' }, enemy: '忘却の霧' },
    'ghost_type1': { player: { name: '魂狩り', desc: '敵を倒した時、自分のHPが 10 回復する。' }, enemy: '死神の鎌' },
    'ghost_type3': { player: { name: '学識', desc: '「巻物」を使用した時の効果が、確率で2回連続で発動する。' }, enemy: '知識吸収' },
    'ghost_type3_2': { player: { name: '読心術', desc: '敵の攻撃を必ず見切る（パリィ）確率が +15% される。' }, enemy: '精神干渉' },
    'ghost_type2_2': { player: { name: '天使の加護', desc: '毎ターンHPが大幅に回復し、アンデッド系から攻撃されなくなる。' }, enemy: 'ホーリーライト' },
    'ghost_type4_2': { player: { name: '霊的腕力', desc: '武器を装備していない時の攻撃力が大幅に高くなる。' }, enemy: '実体化' },
    'ghost_type5_2': { player: { name: '王の威厳', desc: '自分よりレベルの低い敵が、近づくと「怯え」て逃げていくようになる。' }, enemy: '王の呪い' },
    'ghost_type1_2': { player: { name: '冥界の使者', desc: '通常攻撃時、5%の確率でどんな敵も一撃で即死させる。' }, enemy: '死の宣告' },
    'ghost_type3_3': { player: { name: '不死の大魔導', desc: '魔法アイテム（杖）の効果範囲が広がり、威力が 3倍 になる。' }, enemy: '魔法反射' },

    // 【風船系】
    'balloon': { player: { name: '弾む体', desc: '敵から受けるノックバック（吹き飛ばし）ダメージを無効化する。' }, enemy: '浮遊' },
    'balloon_type2': { player: { name: '虹色の膜', desc: '炎や氷などの「属性ダメージ」を半減する。' }, enemy: 'シャボンバリア' },
    'balloon_type2_2': { player: { name: '美しき反射', desc: '敵から受けたデバフを周囲の敵にもばら撒く。' }, enemy: '光の屈折' },
    'balloon_type4': { player: { name: '圧縮筋肉', desc: '満腹度が30以下のとき、防御力が2倍になる。' }, enemy: 'バウンド・プレス' },
    'balloon_type4_2': { player: { name: '熱気球', desc: '[炎]の印がついた武器を装備していると、回避率が+15%される。' }, enemy: 'バーナー放射' },
    'balloon_type1': { player: { name: '毒ガスタンク', desc: '毒罠を踏んだり毒を受けた際、攻撃力が上がる。' }, enemy: '排気ガス' },
    'balloon_type1_2': { player: { name: '爆発反応装甲', desc: '近接攻撃を受けた時、周囲1マスに爆風ダメージを返す。' }, enemy: '機雷爆発' },
    'balloon_type5': { player: { name: 'しわしわボディ', desc: '敵からのクリティカルヒットを絶対に受けない。' }, enemy: 'ガス抜け' },
    'balloon_type3': { player: { name: '気象観測', desc: 'フロアに降りた時、罠の位置がすべてミニマップに表示される。' }, enemy: '落雷予測' },
    'balloon_type3_2': { player: { name: '広域スキャン', desc: '視界が広がり、暗い通路の先まで見えるようになる。' }, enemy: '狙撃レンズ' },
    'balloon_type2_3': { player: { name: '夢の鼓動', desc: '時間経過でアイテムがレアアイテムに変化することがある。' }, enemy: 'ハッピーパレード' },
    'balloon_type4_3': { player: { name: '超浮力', desc: '装備の重さを完全に打ち消し、満腹度が減りにくくなる。' }, enemy: '爆弾投下' },
    'balloon_type5_2': { player: { name: '不朽の硬度', desc: '最大HPが+50され、あらゆる固定ダメージを半減する。' }, enemy: '化石化ガス' },
    'balloon_type1_3': { player: { name: '悪夢の住人', desc: '睡眠や混乱状態の敵を攻撃した際、ダメージが3倍になる。' }, enemy: '絶望の破裂' },
    'balloon_type3_3': { player: { name: '全天候衛星', desc: 'マップ、敵、アイテム、罠、階段が常に完全に可視化される。' }, enemy: '衛星軌道レーザー' },

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
    'spirit_type3_2': { player: { name: '世界樹の記憶', desc: 'フロアに降りた瞬間、マップ全域と階段の位置が完全に判明する。' }, enemy: '因果改変' },

    // ==========================================
    // ★ 岩系（ゴーレム系）（全13種）
    // ==========================================
    'stone': { player: { name: '石の体', desc: '敵から受ける吹き飛ばし効果を完全に無効化する。' }, enemy: '鈍重' },
    'stone_type2': { player: { name: '光の屈折', desc: '敵からの魔法ダメージを 20% 軽減する。' }, enemy: 'クリスタル・レイ' },
    'stone_type4': { player: { name: '地熱吸収', desc: '炎属性のダメージを無効化し、吸収してHPを回復する。' }, enemy: '灼熱の体' },
    'stone_type4_2': { player: { name: '鋼の鎧', desc: '基礎防御力が常に +8 される（基本特性を上書き）。' }, enemy: '鉄壁' },
    'stone_type5': { player: { name: '守り神', desc: 'そのフロアで同じ部屋に長く留まるほど、防御力が少しずつ上がっていく。' }, enemy: '擬態' },
    'stone_type1': { player: { name: '悪霊払い', desc: 'アンデッド・ゴースト系の敵から受けるダメージを半減する。' }, enemy: '石化睨み' },
    'stone_type3': { player: { name: '古代文字', desc: '魔法の杖を近接武器として振って殴った時のダメージが、剣並みに高くなる。' }, enemy: 'ルーン設置' },
    'stone_type2_2': { player: { name: '宝石の煌めき', desc: '魅了の成功率が大幅に上がり、敵がアイテムを落とす確率も上昇する。' }, enemy: 'プリズムアーマー' },
    'stone_type4_3': { player: { name: '星の砕き手', desc: '壁を壊したとき、稀に「しあわせの種」などのレアアイテムが出現する。' }, enemy: '隕石落とし' },
    'stone_type5_2': { player: { name: '大地の鼓動', desc: 'マップ上の罠を意図的に踏み潰して破壊できるようになる。' }, enemy: '箱庭の理' },
    'stone_type5_3': { player: { name: '双極の力', desc: '通常攻撃時、確率で敵を火傷（毎ターンダメージ）か凍結（行動不可）にする。' }, enemy: '熱膨張と凍結' },
    'stone_type1_2': { player: { name: '漆黒の鏡', desc: '敵から受けたデバフ（毒やステータス低下など）を無効化し、相手にそのまま跳ね返す。' }, enemy: '生命吸収' },
    'stone_type3_2': { player: { name: '反重力', desc: '罠を浮遊して回避し、水脈の上も自由に歩けるようになる。' }, enemy: '重力操作' }
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
    // ★ 風船系の系譜
    // ==========================================
    if (skin.includes('balloon')) {
        addTrait('balloon'); // Base

        // Gen 1
        if (['balloon_type2', 'balloon_type2_2', 'balloon_type4', 'balloon_type4_2', 'balloon_type1', 'balloon_type1_2', 'balloon_type5', 'balloon_type3', 'balloon_type3_2'].includes(skin)) {
            addTrait(skin);
        }
        // Gen 2 (履歴解決あり)
        else {
            if (skin === 'balloon_type5_2') { 
                addTrait('balloon_type5'); addTrait(skin); 
            }
            else if (skin === 'balloon_type2_3') {
                let past = 'balloon_type2';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('balloon_type2_2')) past = 'balloon_type2_2';
                addTrait(past); addTrait(skin);
            }
            else if (skin === 'balloon_type4_3') {
                let past = 'balloon_type4';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('balloon_type4_2')) past = 'balloon_type4_2';
                addTrait(past); addTrait(skin);
            }
            else if (skin === 'balloon_type1_3') {
                let past = 'balloon_type1';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('balloon_type1_2')) past = 'balloon_type1_2';
                addTrait(past); addTrait(skin);
            }
            else if (skin === 'balloon_type3_3') {
                let past = 'balloon_type3';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('balloon_type3_2')) past = 'balloon_type3_2';
                addTrait(past); addTrait(skin);
            }
        }
    }

    // ==========================================
    // ★ 魔法使い系の系譜
    // ==========================================
    if (skin.includes('magician')) {
        addTrait('magician'); // Base

        // Gen 1
        if (['magician_type4', 'magician_type4_2', 'magician_type1', 'magician_type1_2', 'magician_type5', 'magician_type2', 'magician_type2_2', 'magician_type3'].includes(skin)) {
            addTrait(skin);
        }
        // Gen 2 (履歴解決あり)
        else {
            // 活力ルート (4, 4_2 -> 4_3, 4_4)
            if (skin === 'magician_type4_3' || skin === 'magician_type4_4') {
                let past = 'magician_type4';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('magician_type4_2')) past = 'magician_type4_2';
                addTrait(past); addTrait(skin);
            }
            // 闇落ちルート (1, 1_2 -> 1_3, 1_4)
            else if (skin === 'magician_type1_3' || skin === 'magician_type1_4') {
                let past = 'magician_type1';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('magician_type1_2')) past = 'magician_type1_2';
                addTrait(past); addTrait(skin);
            }
            // 老化ルート (5 -> 5_2, 5_3)
            else if (skin === 'magician_type5_2' || skin === 'magician_type5_3') {
                addTrait('magician_type5'); addTrait(skin);
            }
            // 美しさルート (2, 2_2 -> 2_3, 2_4)
            else if (skin === 'magician_type2_3' || skin === 'magician_type2_4') {
                let past = 'magician_type2';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('magician_type2_2')) past = 'magician_type2_2';
                addTrait(past); addTrait(skin);
            }
            // 賢さルート (3 -> 3_2, 3_3)
            else if (skin === 'magician_type3_2' || skin === 'magician_type3_3') {
                addTrait('magician_type3'); addTrait(skin);
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

    // ==========================================
    // ★ 機械系の系譜
    // ==========================================
    if (skin.includes('machine')) {
        addTrait('machine');

        // Gen 1
        if (skin === 'machine_type2') { addTrait('machine_type2'); }
        else if (skin === 'machine_type4') { addTrait('machine_type4'); }
        else if (skin === 'machine_type5') { addTrait('machine_type5'); }
        else if (skin === 'machine_type1') { addTrait('machine_type1'); }
        else if (skin === 'machine_type3') { addTrait('machine_type3'); }

        // Gen 2
        else if (skin === 'machine_type2_2') { addTrait('machine_type2'); addTrait('machine_type2_2'); }
        else if (skin === 'machine_type4_2') { addTrait('machine_type4'); addTrait('machine_type4_2'); }
        else if (skin === 'machine_type5_2') { addTrait('machine_type5'); addTrait('machine_type5_2'); }
        else if (skin === 'machine_type5_3') { addTrait('machine_type5'); addTrait('machine_type5_3'); }
        else if (skin === 'machine_type1_2') { addTrait('machine_type1'); addTrait('machine_type1_2'); }
        else if (skin === 'machine_type3_2') { addTrait('machine_type3'); addTrait('machine_type3_2'); }
    }

    // ==========================================
    // ★ ゴースト系の系譜
    // ==========================================
    if (skin.includes('ghost')) {
        addTrait('ghost');
        if (['ghost_type2', 'ghost_type4', 'ghost_type5', 'ghost_type1', 'ghost_type3', 'ghost_type3_2'].includes(skin)) {
            addTrait(skin);
        } else {
            if (skin === 'ghost_type2_2') { addTrait('ghost_type2'); addTrait(skin); }
            else if (skin === 'ghost_type4_2') { addTrait('ghost_type4'); addTrait(skin); }
            else if (skin === 'ghost_type5_2') { addTrait('ghost_type5'); addTrait(skin); }
            else if (skin === 'ghost_type1_2') { addTrait('ghost_type1'); addTrait(skin); }
            else if (skin === 'ghost_type3_3') {
                if (pastSkins && pastSkins.includes('ghost_type3_2')) { addTrait('ghost_type3_2'); } else { addTrait('ghost_type3'); }
                addTrait(skin);
            }
        }
    }

    // ==========================================
    // ★ 岩系（ゴーレム系）の系譜
    // ==========================================
    if (skin.includes('stone')) {
        addTrait('stone');

        // Gen 1
        if (['stone_type2', 'stone_type4', 'stone_type4_2', 'stone_type5', 'stone_type1', 'stone_type3'].includes(skin)) {
            addTrait(skin);
        }
        // Gen 2 (履歴解決あり)
        else {
            if (skin === 'stone_type2_2') { addTrait('stone_type2'); addTrait(skin); }
            else if (skin === 'stone_type4_3') {
                let past = 'stone_type4';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('stone_type4_2')) past = 'stone_type4_2';
                addTrait(past); addTrait(skin);
            }
            else if (skin === 'stone_type5_2' || skin === 'stone_type5_3') { addTrait('stone_type5'); addTrait(skin); }
            else if (skin === 'stone_type1_2') { addTrait('stone_type1'); addTrait(skin); }
            else if (skin === 'stone_type3_2') { addTrait('stone_type3'); addTrait(skin); }
        }

        // 鋼の鎧がある場合、石の体を上書きする（防御特化への変質）
        if (traits.find(t => t.name === '鋼の鎧')) {
            traits = traits.filter(t => t.name !== '石の体');
        }
    }

    // ==========================================
    // ★ 種系の系譜
    // ==========================================
    if (skin.includes('seed')) {
        addTrait('seed');

        // Gen 1
        if (['seed_type4', 'seed_type1', 'seed_type5', 'seed_type3', 'seed_type3_2', 'seed_type2'].includes(skin)) {
            addTrait(skin);
        }
        // Gen 2
        else {
            if (skin === 'seed_type4_2') { addTrait('seed_type4'); addTrait(skin); }
            else if (skin === 'seed_type1_2') { addTrait('seed_type1'); addTrait(skin); }
            else if (skin === 'seed_type5_2') { addTrait('seed_type5'); addTrait(skin); }
            else if (skin === 'seed_type2_2') { addTrait('seed_type2'); addTrait(skin); }
            else if (skin === 'seed_type3_3') {
                let past = 'seed_type3';
                if (window.aiPet && window.aiPet.pastSkins && window.aiPet.pastSkins.includes('seed_type3_2')) past = 'seed_type3_2';
                addTrait(past); addTrait(skin);
            }
        }
    }

    // ==========================================
    // ★ ドラゴン系の系譜
    // ==========================================
    if (skin.includes('dragon')) {
        addTrait('dragon');

        // Gen 1
        if (['dragon_type4', 'dragon_type1', 'dragon_type5', 'dragon_type3', 'dragon_type2'].includes(skin)) {
            addTrait(skin);
        }
        // Gen 2
        else {
            if (skin === 'dragon_type4_2') { addTrait('dragon_type4'); addTrait(skin); }
            else if (skin === 'dragon_type1_2') { addTrait('dragon_type1'); addTrait(skin); }
            else if (skin === 'dragon_type5_2') { addTrait('dragon_type5'); addTrait(skin); }
            else if (skin === 'dragon_type3_2') { addTrait('dragon_type3'); addTrait(skin); }
            else if (skin === 'dragon_type2_2' || skin === 'dragon_type2_3') { addTrait('dragon_type2'); addTrait(skin); }
        }
    }

    // ==========================================
    // ★ スカルダンジョン用のUIテキスト上書きロジック
    // ==========================================
    if (typeof window.DUNGEON_STATE !== 'undefined' && window.DUNGEON_STATE.mapType === 'skull') {
        const skullDescOverrides = {
            '学習機能': '敵を倒した際、活力・賢さ・素早さが 1 上がる。',
            '成金趣味': '敵を倒した時に、確率で「しあわせの種」をドロップする。',
            '天体観測': 'フロア移動時、ランダムで1〜2個の巻物がフロアに生成される。',
            'カラスの嗅覚': '敵を倒した時に、確率で「薬草」や「指輪」をドロップする。',
            '始祖の血': '敵を倒した時、ごく稀に活力が 1 増える。',
            '骨董品の価値': '敵を倒した時、稀に最大満腹度が増加し、同時に満腹度が全回復する。',
            '希少種': '敵を倒した時、20%の確率で「しあわせの種」をドロップする。',
            '宝石の煌めき': '魅了の成功率が大幅に上がり、敵を倒した時に確率で「しあわせの種」を落とす。',
            '星の砕き手': '壁を壊したとき、稀に「しあわせの種」が出現する。',
            '夢の鼓動': 'インベントリ内のアイテムが、時間経過で勝手に「しあわせの種」に変化することがある。',
            '宇宙の樹': '「しあわせの種」を使用した時のステータス上昇値がすべて2倍になる。',
            '竜の血': '「しあわせの種」を使用した時の活力上昇量が通常より多くなる。'
        };
        traits = traits.map(t => {
            if (skullDescOverrides[t.name]) {
                // オブジェクトをクローンしてスカル専用のテキストを被せる
                return { name: t.name, desc: skullDescOverrides[t.name] };
            }
            return t;
        });
    }

    return traits;
};

// ★ 新規追加分（ディクショナリへの統合）
Object.assign(window.DUNGEON_TRAIT_DICT, {
    // 【種系】
    'seed': { player: { name: '根張り', desc: '移動せずに「素振り（待機）」をするとHPが回復する。' }, enemy: '光合成' },
    'seed_type4': { player: { name: '大地の恵み', desc: '薬草を食べたときの最大HP上昇確率が大幅に上がる。' }, enemy: '根のムチ' },
    'seed_type4_2': { player: { name: '暴食の根', desc: '敵を倒した時、その敵の残り最大HPの10%を自分の最大HPに加算する。' }, enemy: '丸呑み' },
    'seed_type1': { player: { name: '茨の鎧', desc: '[反]の印がなくても、受けたダメージの 20% を相手に返す。' }, enemy: '毒の茨' },
    'seed_type1_2': { player: { name: '死の大樹', desc: '敵を倒すと、その場所に「毒の沼」を生成し、後続の敵にダメージを与える。' }, enemy: '寄生種子' },
    'seed_type5': { player: { name: '侘び寂び', desc: 'アイテムを一切持たずに次の階へ進むと、ステータスが恒久的に上がる。' }, enemy: '盆栽の宇宙' },
    'seed_type5_2': { player: { name: '化石の記憶', desc: '過去のフロアで落としたり失ったアイテムが、次の階で落ちている確率が上がる。' }, enemy: '珪化木' },
    'seed_type3': { player: { name: '図書館', desc: '「巻物」の効果範囲が、部屋全体からフロア全体に拡張される。' }, enemy: '知識の葉' },
    'seed_type3_2': { player: { name: '神経網', desc: 'フロア内のすべての敵の「HPバー」と「向いている方向」がマップで分かる。' }, enemy: '神経接続' },
    'seed_type3_3': { player: { name: '宇宙の樹', desc: '「しあわせの種」を使用したときのステータス上昇値がすべて2倍になる。' }, enemy: '真理の言葉' },
    'seed_type2': { player: { name: '芳醇な香り', desc: 'フロアの敵が、自分より他の敵を優先して攻撃するようになる。' }, enemy: '幻惑のアロマ' },
    'seed_type2_2': { player: { name: 'エデンの果実', desc: '満腹度がMAXの時、すべての状態異常を無効化し、攻撃力が 1.5倍 になる。' }, enemy: '楽園の幻影' },

    // 【ドラゴン系】
    'dragon': { player: { name: '竜の血', desc: 'レベルアップ時の最大HP上昇量が通常より多い。' }, enemy: '竜の爪' },
    'dragon_type4': { player: { name: '風切り羽', desc: '素早さによる「回避率の上限」が 80% に引き上げられる。' }, enemy: '滑空突撃' },
    'dragon_type4_2': { player: { name: '魔竜王', desc: '[怒]の印による反撃ダメージ倍率が 3倍 になり、すべての物理攻撃を粉砕する。' }, enemy: 'メガフレア' },
    'dragon_type1': { player: { name: '呪いの竜鱗', desc: '呪われた装備をつけている時、その装備のステータス補正が 2倍 になる。' }, enemy: '呪炎のブレス' },
    'dragon_type1_2': { player: { name: '無限の再生', desc: 'HPが0になっても、満腹度を 50 消費してHP満タンで復活する。' }, enemy: '次元の顎' },
    'dragon_type5': { player: { name: '古竜の威圧', desc: '敵から「先制攻撃」を絶対に受けない。' }, enemy: '地響き' },
    'dragon_type5_2': { player: { name: '星の化身', desc: 'すべての地形ダメージを無効化し、壁をすり抜けて移動できる。' }, enemy: '星の鼓動' },
    'dragon_type3': { player: { name: '海王の力', desc: '水脈のある地形にいる時、毎ターンHPが 10 回復する。' }, enemy: '大津波' },
    'dragon_type3_2': { player: { name: '宇宙竜', desc: '杖や巻物の魔法を使った時、威力が 5倍 になるが、最大HPの 10% を反動で受ける。' }, enemy: '超新星爆発' },
    'dragon_type2': { player: { name: 'クリスタルボディ', desc: '[光]や[竜]など、特定の種族への特攻ダメージをすべて無効化する。' }, enemy: 'プリズム・ブレス' },
    'dragon_type2_2': { player: { name: '天の加護', desc: '敵の攻撃を回避した直後、自分のHPが 5 回復する。' }, enemy: '神の息吹' },
    'dragon_type2_3': { player: { name: '極光のオーラ', desc: '通常攻撃に、炎・氷・光・闇の属性ダメージがランダムに追加される。' }, enemy: 'オーロラ・イリュージョン' }
});