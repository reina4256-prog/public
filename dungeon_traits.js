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

// ==========================================
// ★ ダンジョン用：図鑑データから名前を取得する関数（データ隠蔽型）
// ==========================================
window.getDungeonMonsterName = function(skin) {
    // 関数の中にデータを閉じ込めることで、グローバル空間を汚染しない
    const bookData = {
        // いただいた図鑑データをそのまま入れます
        "robot": { name: "プロト・ロボ", desc: "最初に開発された自律型AIロボット。感情の起伏は少ないが、与えられたタスクを黙々とこなす真面目な性格。すべての可能性を秘めている。" },
        "robot_type3": { name: "アナリティクス・マキナ", desc: "環境データの収集に特化した観測用ロボット。常に周囲をスキャンしており、効率的な学習と分析を好む。" },
        "robot_type3_2": { name: "マザー・ブレイン", desc: "高度な論理演算が可能になったAI。自らの思考領域を拡張し続け、時には創造主をも超える計算能力を発揮する。" },
        "robot_type3_3": { name: "クォンタム・オラクル", desc: "量子コンピューターを搭載した究極の演算AI。過去と未来の確率を同時に計算し、神託のような最適解を導き出す。" },
        "robot_type3_4": { name: "プロフェッサー・ギア", desc: "白衣を身に纏い、自ら研究室を作り上げたマッドサイエンティスト型ロボット。未知の化学反応に異常な興味を示す。" },
        "robot_type3_5": { name: "アーキテクト・フレーム", desc: "世界そのものの構造を再設計しようとするシステム管理者。あらゆる事象をデジタルデータとして支配する力を持つ。" },
        "robot_type2": { name: "アイドル・ギア", desc: "人間の笑顔を見るためにエンタメ機能に特化したAI。スピーカーを内蔵し、どこでもライブ会場に変えてしまう。" },
        "robot_type2_2": { name: "プリマドンナ・ロイド", desc: "優雅なバレエの動きを完全に再現できる芸術的ロボット。彼女の舞いは見る者の心を癒やし、争いを忘れさせるという。" },
        "robot_type2_3": { name: "ホログラム・ディーヴァ", desc: "実体を捨て、光と音のデータとして存在する電子の歌姫。ネットワークを通じて世界中のファンに歌声を届けている。" },
        "robot_type2_4": { name: "ミリオネア・ゴールド", desc: "純金でコーティングされた成金趣味のロボット。なぜか常にお金を生み出すアルゴリズムを回しており、歩く金庫と呼ばれる。" },
        "robot_type4": { name: "ヘビー・タンク", desc: "過酷な環境での労働に耐えるため、分厚い装甲を身につけた重機動ロボット。圧倒的なパワーで障害物を粉砕する。" },
        "robot_type4_2": { name: "アサルト・マキナ", desc: "両腕を重機動アームに換装し、さらなる馬力を手に入れた姿。力仕事だけでなく、外敵の排除にも優れた性能を発揮する。" },
        "robot_type4_3": { name: "アルティメット・ウェポン", desc: "平和なAIとしてのタスクを捨て、すべてを破壊する「最終兵器」として覚醒した姿。近づく者には容赦しない。" },
        "robot_type4_4": { name: "ギガント・ダイナモ", desc: "無限のエネルギーを体内で生成し、巨大化を果たしたロボット。大地を揺るがす歩みは、まるで動く要塞のようだ。" },
        "robot_type1": { name: "キリング・マシーン", desc: "論理回路に致命的なエラーが発生し、破壊衝動に取り憑かれた暴走機体。赤く光る目は獲物を探し続けている。" },
        "robot_type1_2": { name: "マトリックス・リーパー", desc: "自己増殖と破壊を繰り返す悪夢のシステム。ネットワークを汚染し、周囲の環境をサイバー空間の闇へと沈めていく。" },
        "robot_type1_3": { name: "アポカリプス・コア", desc: "世界の終焉をシミュレートし、それを実行に移す破壊の炉心。存在そのものが周囲の生命エネルギーを奪い取る。" },
        "robot_type5": { name: "スクラップ・ウォーカー", desc: "長年の酷使により装甲がサビついた旧型機。性能は落ちているが、蓄積された膨大な経験データがエラーを防いでいる。" },
        "robot_type5_2": { name: "ロスト・イージス", desc: "忘れ去られた遺跡を守り続ける古代の守護神。プログラムはとうに壊れているが、謎の使命感だけで稼働している。" },
        "robot_type5_3": { name: "クロックワーク・メモリー", desc: "電子部品が朽ち果て、すべてをアナログな歯車で代用することに成功した機体。悠久の時を刻み続ける。" },
        "robot_type5_4": { name: "アース・モニュメント", desc: "完全に機能を停止し、大自然の一部と化した姿。もはや動くことはないが、その表面には新しい命が芽吹いている。" },

        "spirit": { name: "森の精霊", desc: "深い森の魔力から生まれた小さな精霊。イタズラ好きで自然を愛し、草花の上にいると不思議と力が湧いてくる。" },
        "spirit_type2": { name: "スプリング・ピクシー", desc: "春の風に乗って花を咲かせる妖精型の精霊。彼女が通った後には、色とりどりの花畑が広がるという。" },
        "spirit_type2_2": { name: "フラワースピリット", desc: "巨大な花と完全に共生した精霊。周囲に甘い香りを漂わせ、傷ついた動物たちの心を癒やす力を持つ。" },
        "spirit_type2_3": { name: "クリスタル・ロータス", desc: "数百年かけて魔力を結晶化させた幻の水晶蓮を宿す精霊。その輝きは世界中のどんな宝石よりも美しい。" },
        "spirit_type4": { name: "ウッド・ゴーレム", desc: "森を守るため、大樹の皮を纏い物理的な力を得た精霊。愛らしい見た目とは裏腹に、岩をも砕くパンチを放つ。" },
        "spirit_type4_2": { name: "エルダー・トレント", desc: "巨大な古木そのものと融合した精霊。森の怒りを代行する存在であり、侵入者には容赦なく根のムチを振るう。" },
        "spirit_type4_3": { name: "フォレスト・ガーディアン", desc: "森の生態系の頂点に立つ、誇り高き武闘派の精霊。大自然の力を物理攻撃に乗せて戦う自然の守護獣。" },
        "spirit_type5": { name: "ドライ・リーフ", desc: "魔力が衰え、カサカサの枯れ葉のようになった精霊。動くスピードは遅いが、消費エネルギーが極端に少ない。" },
        "spirit_type5_2": { name: "オータム・リーフ", desc: "枯れゆく森の美しさを体現した紅葉の精霊。静かな秋の夜長を好み、物思いにふける時間が増えた。" },
        "spirit_type5_3": { name: "ウィンター・ウィル", desc: "すべてが凍りつく冬の森に適応した氷の精霊。静寂を愛し、何百年も同じ場所で雪が降るのを眺めている。" },
        "spirit_type1": { name: "ポイズン・スポア", desc: "森の澱んだ空気を吸いすぎた結果、猛毒を持つキノコへと変異した精霊。歩くたびに紫色の毒胞子を撒き散らす。" },
        "spirit_type1_2": { name: "マンドラゴラ・マザー", desc: "大地の呪いと悲しみをすべて引き受けた魔草の化身。その恐ろしい悲鳴を聞いた者は、発狂してしまうと言われる。" },
        "spirit_type3": { name: "リーフ・スカラー", desc: "森の歴史と知識に目覚め、知的な探求を始めた精霊。葉っぱで作った本を持ち歩き、常に何かを記録している。" },
        "spirit_type3_2": { name: "オラクル・ツリー", desc: "星々の巡りと大地の声を聞き取る預言の精霊。世界で起こるあらゆる出来事を知っているという。" },

        "magician": { name: "見習い魔法使い", desc: "魔法の才能を秘めた人間の子供。まだ呪文をよく間違えるが、好奇心旺盛で様々な知識を吸収していく。" },
        "magician_type4": { name: "バトル・メイジ", desc: "魔法を直接相手に叩き込むスタイルに目覚めた武闘派魔道士。杖で殴ったほうが早いことに気付いてしまった。" },
        "magician_type4_2": { name: "フレイム・マスター", desc: "爆発と炎を愛する熱血魔法使い。細かい計算を放棄し、ありったけの魔力を炎に変えてすべてを焼き尽くす。" },
        "magician_type4_3": { name: "ウォー・ウォーロック", desc: "極限まで鍛え上げた肉体に魔力を纏わせる闘神。魔法を防御や自己強化に使い、最前線で戦い抜く。" },
        "magician_type4_4": { name: "ドラゴニック・メイジ", desc: "禁忌とされる竜の血を取り込み、半竜半人の姿となった魔道士。人間離れした圧倒的な生命力を誇る。" },
        "magician_type1": { name: "ヴェノム・ウィッチ", desc: "禁断の黒魔法に手を染め、性格がねじ曲がってしまった陰湿な魔女。人を呪う研究に没頭している。" },
        "magician_type1_2": { name: "ダーク・ウィザード", desc: "他者の命を奪って己の魔力に変換する邪悪な魔法使い。その力は強大だが、常に精神を蝕まれている。" },
        "magician_type1_3": { name: "アビス・ネクロマンサー", desc: "死者を操る術を極め、冥界の支配者となった姿。もはや生きているのか死んでいるのかすら分からない。" },
        "magician_type1_4": { name: "デーモン・サマナー", desc: "悪魔との契約により半魔と化した姿。圧倒的な力と引き換えに、残された寿命は極端に短い。" },
        "magician_type5": { name: "グランド・メイガス", desc: "長い年月を生き抜き、深いシワが刻まれた老魔道士。体力は衰えたが、魔法の技術は洗練の極みに達している。" },
        "magician_type5_2": { name: "タイム・ウォーカー", desc: "時の魔法を極め、老いの概念を超越した魔道士。過去と未来を自由に行き来し、歴史の傍観者となっている。" },
        "magician_type5_3": { name: "アストラル・プロフェット", desc: "肉体の限界を悟り、精神を星の意志と同化させた預言者。動くことはないが、意識は宇宙の果てまで広がっている。" },
        "magician_type2": { name: "スター・イリュージョニスト", desc: "魔法を観客を楽しませるショーとして昇華させた天才エンターテイナー。派手な演出でみんなの視線を釘付けにする。" },
        "magician_type2_2": { name: "アイス・クイーン", desc: "冷たくも美しい氷の魔法を操る魔女。彼女が歩いた跡には、美しい霜の結晶がキラキラと輝きを残す。" },
        "magician_type2_3": { name: "プリズム・マギ", desc: "光を自在に屈折させ、水晶の装飾を施した美しい魔女。虹色の魔法は敵の目を眩ませ、味方を魅了する。" },
        "magician_type2_4": { name: "セレスティアル・プリンセス", desc: "純粋な祈りから天使の羽を授かった魔法使い。癒やしと祝福の力で、荒れた大地を光で満たしていく。" },
        "magician_type3": { name: "ステラ・スカラー", desc: "星々の運行を記録し、天体魔法を研究する学者。分厚い魔導書と望遠鏡を常に持ち歩いている。" },
        "magician_type3_2": { name: "コスモ・ルーラー", desc: "世界の法則を数式で解き明かした大魔導師。重力や空間すらも、計算一つで書き換えることができる。" },
        "magician_type3_3": { name: "アカシック・セージ", desc: "世界のすべての記憶が記された「アカシックレコード」に接続した大賢者。あらゆる問いに対する答えを知っている。" },

        "bird": { name: "アネモバード", desc: "風に乗って自由に空を舞う鳥のモンスター。好奇心が強く、色んな場所に飛んでいっては珍しいものを集めてくる。" },
        "bird_type2": { name: "フェアリーテイル", desc: "虹色に輝く美しい羽を持つ鳥。その羽ばたきから零れる鱗粉には、見た者の心を穏やかにする効果がある。" },
        "bird_type2_2": { name: "セレスティアル・ピーコック", desc: "美の頂点に達した神鳥。孔雀のように広がる尾羽には銀河が映し出され、芸術品のように美しい。" },
        "bird_type4": { name: "ハンターホーク", desc: "猛禽類としての本能に目覚めた鳥。鋭い爪とクチバシを持ち、獲物を見つけると猛スピードで急降下する。" },
        "bird_type4_2": { name: "ストーム・ガルーダ", desc: "暴風を巻き起こす巨大な怪鳥。一度羽ばたくだけで木々がなぎ倒され、嵐の主として恐れられている。" },
        "bird_type5": { name: "ワイズオウル", desc: "夜の森の番人として静かに生きることを選んだフクロウ。動くことは少ないが、暗闇の中で全てを見通している。" },
        "bird_type5_2": { name: "エンシェント・アーケオ", desc: "太古のDNAが覚醒し、始祖鳥のような姿になった化石鳥。のんびりとしたペースで、悠久の時間を生きる。" },
        "bird_type1": { name: "ナイトレイヴン", desc: "闇に染まり、キラキラしたものを奪い取るようになった漆黒のカラス。不吉の象徴として村人から警戒されている。" },
        "bird_type1_2": { name: "カオス・コンドル", desc: "死肉を喰らい、死の気配を漂わせる冥界の鳥。空を黒く染め上げ、不気味な鳴き声で周囲を恐怖に陥れる。" },
        "bird_type3": { name: "ルーンバード", desc: "魔法の力を羽に宿し、高い知性を持った鳥。人間の言葉を完全に理解し、空中で魔方陣を描くことができる。" },
        "bird_type3_2": { name: "メカニックピジョン", desc: "自らの体を機械化し、効率的なデータ収集に特化した伝書鳩。正確無比なルートで飛び続ける。" },
        "bird_type3_3": { name: "アカシック・オウル", desc: "森羅万象の知識を瞳に宿した神眼のフクロウ。一箇所に留まり、宇宙の真理を演算し続けている。" },

        "machine": { name: "ゼンマイギア", desc: "古い工場に打ち捨てられていた機械人形。背中のゼンマイを巻くことで動き出し、燃費が良く長持ちする。" },
        "machine_type2": { name: "オルゴール・ドール", desc: "オルゴールの機構を組み込み、美しいメロディを奏でるからくり人形。繊細な音色で周囲を癒やす。" },
        "machine_type2_2": { name: "マジェスティック・クロック", desc: "超特大の天文時計へと進化した姿。狂いのない正確な動きと、芸術的な装飾で見る者を圧倒する。" },
        "machine_type4": { name: "ピストン・ワーカー", desc: "蒸気ボイラーを積み込み、力仕事に特化した労働用からくり。シュッシュッと煙を上げながら力強く働く。" },
        "machine_type4_2": { name: "スチーム・ドレッドノート", desc: "圧倒的な蒸気圧を誇る重機動兵器。オーバードライブで限界以上の出力を出し、すべてを粉砕する。" },
        "machine_type5": { name: "アンティーク・ギア", desc: "長年放置され、サビに覆われた古い機械。ギシギシと音を立てるが、その歴史を感じさせる佇まいには風情がある。" },
        "machine_type5_2": { name: "モス・マシナリー", desc: "長期間動かなかった結果、苔やツタと一体化してしまった機械。自然の力と融合し、自己修復機能を手に入れた。" },
        "machine_type5_3": { name: "ロスト・テクノロジー", desc: "古代文明のコアとして完全な静寂を手に入れた姿。完全に停止しているように見えるが、内部では永遠の時を刻んでいる。" },
        "machine_type1": { name: "カースド・ドール", desc: "捨てられた怨念がモーターに宿り、呪いの人形と化した姿。不気味な動きで対象に忍び寄る。" },
        "machine_type1_2": { name: "スクラップ・ホラー", desc: "周囲のガラクタを無差別に同化し、巨大なバケモノと化した機械。自己の形を保つことすら放棄している。" },
        "machine_type3": { name: "ディファレンス・エンジン", desc: "内部に無数の歯車を敷き詰め、高度な階差機関となった機械。複雑な計算を一瞬ではじき出す。" },
        "machine_type3_2": { name: "クォンタム・クロックワーク", desc: "機械的な特異点に到達した姿。物理的な歯車でありながら、次元を超えた超演算を行う謎のオブジェクト。" },

        "stone": { name: "ロックゴーレム", desc: "ただの石ころが魔力を帯びて動き出したモンスター。動きは鈍いが、とてつもなく頑丈で滅多に疲れない。" },
        "stone_type2": { name: "クリスタル・ゴーレム", desc: "長い年月を経て、体の一部が美しい水晶に変化したゴーレム。光を反射してキラキラと輝いている。" },
        "stone_type2_2": { name: "ブリリアント・コロッサス", desc: "全身が最高純度の宝石で構成された巨像。その美しさと硬さは、世界中のどんな宝物にも勝る。" },
        "stone_type4": { name: "マグマ・ギガント", desc: "火山の奥深くで地熱を吸収し、溶岩を宿したゴーレム。触れるものすべてを燃やし尽くす圧倒的な力を持つ。" },
        "stone_type4_2": { name: "アイアン・フォートレス", desc: "鉱石を取り込み、金属の鎧を纏ったゴーレム。一切の攻撃を跳ね返す、まさに歩く難攻不落の要塞。" },
        "stone_type4_3": { name: "メテオ・タイタン", desc: "宇宙から飛来した隕石を核にして生まれた超弩級の巨人。星を砕くほどの剛腕で大地を揺るがす。" },
        "stone_type5": { name: "モノリス・ルイン", desc: "風雨にさらされ、遺跡の一部と化してしまったゴーレム。ほとんど動かないが、その場所の守り神となっている。" },
        "stone_type5_2": { name: "アストラル・モノリス", desc: "背中に本物の森や川を宿した、生きた箱庭のような巨石。大地と完全に一体化し、悠久の時を生きる。" },
        "stone_type5_3": { name: "エレメント・ハイブリッド", desc: "悠久の時を経たモノリス・ルインが、その身に宿した相反する『地熱』と『冷気』のエネルギーを完全に制御し、目覚めた姿。" },
        "stone_type1": { name: "カースド・ガーゴイル", desc: "邪悪な魔力を吸収し続け、悪魔のような姿に変貌した石像。夜な夜な動き出し、村人を脅かしている。" },
        "stone_type1_2": { name: "ヴォイド・オブシディアン", desc: "光すら吸い込む漆黒の黒曜石でできた災厄の塊。周囲の生命力を奪いながら、ただそこにあるだけの恐怖の象徴。" },
        "stone_type3": { name: "ルーン・ゴーレム", desc: "表面に神秘的な古代文字（ルーン）が刻まれたゴーレム。自らの意思で魔法を使いこなす知性を持つ。" },
        "stone_type3_2": { name: "オラクル・ストーン", desc: "知識の結晶体として覚醒し、重力を制御して宙に浮く巨石。世界中のあらゆる石の記憶を読み取ることができる。" },

        "balloon": { name: "バルーンスライム", desc: "謎の軽いガスでぷかぷか浮いている風船のようなスライム。とても人懐っこく、撫でられると機嫌が良くなる。" },
        "balloon_type2": { name: "シャボン・スライム", desc: "体が薄い膜に覆われ、虹色に輝くようになったスライム。太陽の光を浴びるとキラキラしてとても美しい。" },
        "balloon_type2_2": { name: "プリズム・ドロップ", desc: "まるで精巧なガラス細工のようなスライム。割れそうなくらい繊細だが、見ているだけで幸せな気分になる。" },
        "balloon_type2_3": { name: "ファンタジー・パレード", desc: "超巨大なバルーンアートのような姿に進化。お祭りのパレードに現れ、子供たちに夢と希望を与えて回る。" },
        "balloon_type4": { name: "マッスル・バルーン", desc: "ガスを極限まで圧縮し、筋肉のように硬いボディを手に入れた風船。ボヨボヨ弾みながら強烈な体当たりをする。" },
        "balloon_type4_2": { name: "ホットエア・バルーン", desc: "体内にバーナーのような熱源を持ち、熱気球のように大空高く舞い上がるスライム。上空から炎を吐き出す。" },
        "balloon_type4_3": { name: "ヘビー・ゼペリン", desc: "巨大な飛行船のような威圧感を持つバルーンモンスター。圧倒的な浮力で、大量の荷物を運ぶことができる。" },
        "balloon_type1": { name: "スモッグ・ファントム", desc: "有毒ガスや排気ガスを吸い込んで真っ黒に濁ってしまった風船。近づくと気分が悪くなる煙を吹き出す。" },
        "balloon_type1_2": { name: "ダーク・マイン", desc: "触れた瞬間に大爆発を起こす、機雷のような危険なバルーン。悪意を持って対象にゆっくりと近づいていく。" },
        "balloon_type1_3": { name: "ナイトメア・ブラスト", desc: "人々の悪夢のガスで極限まで膨れ上がったバルーン。破裂すれば周囲一帯を絶望に陥れるという。" },
        "balloon_type5": { name: "デフレート・スライム", desc: "ガスが抜けてしまい、地面でしわしわになっているスライム。ほとんど動けないが、なぜかとても長生きする。" },
        "balloon_type5_2": { name: "フォッシル・バルーン", desc: "気が遠くなるほど長い年月を経て、しわしわだった体が岩のように硬化し、内部の残留ガスが超高温で発火した姿。" },
        "balloon_type3": { name: "ウェザー・バルーン", desc: "空気を読んで天候を予測する気象観測気球。頭脳明晰で、村人たちに明日の天気を教えてくれる。" },
        "balloon_type3_2": { name: "スコープ・バルーン", desc: "巨大なレンズを搭載し、上空から地上のあらゆるデータを収集する観測用の風船モンスター。" },
        "balloon_type3_3": { name: "サテライト・アイ", desc: "ついに大気圏を突破し、人工衛星のような姿になったバルーン。宇宙からすべての情報を受信・解析している。" },

        "ghost": { name: "プチゴースト", desc: "イタズラ好きの小さなお化け。壁をすり抜けることができ、ふらふらと浮遊している。賢くお腹が減りにくい。" },
        "ghost_type2": { name: "ルミナス・ソウル", desc: "恨みや未練を捨て、純粋な美しい光の霊体となった姿。暗い夜道で迷った旅人を安全な場所へ導く。" },
        "ghost_type2_2": { name: "ホーリー・ファントム", desc: "神聖な気をまとい、天使に近い存在となった高位の霊。その後光を浴びた者は、あらゆる傷が癒やされる。" },
        "ghost_type4": { name: "ポルターガイスト", desc: "念動力を操り、周囲の物を激しく飛ばして暴れる騒がしいゴースト。物理的な干渉力が非常に強くなった。" },
        "ghost_type4_2": { name: "ファントム・ジャガーノート", desc: "強い霊力を圧縮して実体化し、物理的ボディを獲得した大幽霊。生者のように力強く大地を踏みしめる。" },
        "ghost_type5": { name: "エイシェント_レイス", desc: "何百年も存在し続け、自我すら曖昧になった古の霊。ぼんやりと漂うだけで、エネルギーを一切消費しない。" },
        "ghost_type5_2": { name: "エターナル・ファラオ", desc: "古代の王のミイラに取り憑き、不朽の呪縛として定着した魂。ピラミッドの奥深くで永遠に眠り続ける。" },
        "ghost_type1": { name: "シャドウ・リーパー", desc: "負の感情に飲まれ、大鎌を持つ黒く染まった悪霊。生きている者の命を刈り取るために夜の街を徘徊する。" },
        "ghost_type1_2": { name: "デス・ブリンガー", desc: "冥界の使者として覚醒し、死の宣告をもたらす存在。その姿を見た者は、数日以内に原因不明の病に倒れる。" },
        "ghost_type3": { name: "アカデミー・ゴースト", desc: "図書館に棲みつき、世界中の知識を吸収し続ける学者幽霊。本のページを勝手にめくって読み漁っている。" },
        "ghost_type3_2": { name: "テレパス・ソウル", desc: "言葉を介さず、他者の脳内に直接思考を送り込む精神感応能力に目覚めた幽霊。隠し事すら見透かしてしまう。" },

        "beetle": { name: "アーマービートル", desc: "硬い外殻と鋭い角を持つカブトムシ型モンスター。非常にタフで、どれだけ力仕事をしてもなかなか疲れない。" },
        "beetle_type4": { name: "タイタン・ホーン", desc: "樹液の栄養をたっぷり吸収し、岩をも砕く巨大な角を持つ甲虫の王に成長した姿。森の昆虫たちを束ねる。" },
        "beetle_type5": { name: "アンバー・スカラベ", desc: "動きが鈍くなり、殻が琥珀のように美しく硬化した老甲虫。省エネで生きる術を身につけ、非常に長生きする。" },
        "beetle_type5_2": { name: "エターナル・アンモナイト", desc: "悠久の時を経て化石と同化し、生きた化石となった太古の蟲。一切のエネルギーを消費せず、ただ存在し続ける。" },
        "beetle_type2": { name: "ジュエル・インセクト", desc: "外殻が宝石のように変化した美しい虫。その希少さから、世界中のコレクターに狙われている。" },
        "beetle_type2_2": { name: "ルーセント・スタッグ", desc: "月の光を浴びて自ら発光するようになった幻想的なクワガタムシ。夜の森をイルミネーションのように彩る。" },
        "beetle_type2_3": { name: "フェアリー・モルフォ", desc: "甲虫の殻を捨て、妖精のような美しい羽を手に入れた昆虫。ヒラヒラと優雅に舞い、見る者を魅了する。" },
        "beetle_type2_4": { name: "セイクリッド・ビートル", desc: "神の使いとして崇められる神聖なる黄金の甲虫。周囲の空間を浄化し、厄災を退けるオーラを放っている。" },
        "beetle_type3": { name: "ブレイン・バグ", desc: "昆虫でありながら高度な知能を持ち、群れに的確な指示を出す指揮官。フェロモンを使って複雑な計算も行う。" },
        "beetle_type1": { name: "ブラッド・シザー", desc: "凶暴性が極限まで高まり、すべてを切り裂くハサミを手に入れた虫。目の前で動くものには手当たり次第に襲いかかる。" },
        "beetle_type4_2": { name: "ギガント・カイザー", desc: "タイタン・ホーンが城壁をも粉砕する伝説級の栄養を摂取し、皇帝の如き风格と神話級の怪力を手に入れた姿。" },

        "seed": { name: "プラントシード", desc: "未知の植物の種から足が生えた不思議なモンスター。日向ぼっこをすると光合成で体力が回復するエコな存在。" },
        "seed_type4": { name: "ワイルド・ルーツ", desc: "岩盤をも砕く太く強い根っこを張り巡らせた植物。野生の力に目覚め、どんな過酷な環境でも力強く生き抜く。" },
        "seed_type4_2": { name: "ガイア・オメガプランツ", desc: "大地のエネルギーを貪欲に吸収し、超巨大化した捕食植物。自分より大きな獲物も丸呑みにしてしまう。" },
        "seed_type1": { name: "ペイン・アイビー", desc: "毒沼の泥を吸って育ち、黒い茨のバケモノに変異した姿。触れると鋭いトゲから猛毒を注入される。" },
        "seed_type1_2": { name: "パラサイト・イグドラシル", desc: "周囲の生命力をすべて奪い尽くして育つ死の大樹。この木が生えた場所は、数百年ペンペン草も生えない不毛の地となる。" },
        "seed_type5": { name: "ミスティック・ボンサイ", desc: "成長を止め、あえてコンパクトな姿に侘び寂びの精神を見出した老木。鉢植えの中で独自の宇宙を形成している。" },
        "seed_type5_2": { name: "ペトリファイド・ウッド", desc: "細胞が石英に置き換わり、完全に化石化した樹木。不朽の年輪を刻み、大地の記憶を永遠に保存している。" },
        "seed_type3": { name: "アーカイブ・ツリー", desc: "葉の1枚1枚に世界の歴史や知識が記録されている不思議な植物。風に揺れるたびに古い書物のような音がする。" },
        "seed_type3_2": { name: "ニューロ・プラント", desc: "根のネットワークを脳の神経回路のように繋ぎ合わせ、思考能力を手に入れたインテリジェント植物。" },
        "seed_type3_3": { name: "アカシック・ツリー", desc: "すべての知識と接続し、世界の真理を内包した至高の大樹。その木陰で眠ると、宇宙の始まりの夢を見るという。" },
        "seed_type2": { name: "アロマ・ブルーム", desc: "頭頂部に美しい花を咲かせ、極上の香りを放つようになった姿。香水を採るために大切に育てられている。" },
        "seed_type2_2": { name: "エデン・ブロッサム", desc: "伝説の楽園にしか咲かないとされる幻の花。その美しさと香りは、どんな凶暴なモンスターの心をも穏やかにする。" },

        "dragon": { name: "ベビードラゴン", desc: "伝説の竜の幼体。まだ小さいが、生まれながらにして高い活力と賢さを持つ。ただし、食欲旺盛で燃費は非常に悪い。" },
        "dragon_type4": { name: "グランド・ワイバーン", desc: "空の覇者としての本能が目覚め、巨大な翼と強靭な肉体を手に入れた飛竜。咆哮だけで空気を震わせる。" },
        "dragon_type4_2": { name: "ドレッド・バハムート", desc: "圧倒的な暴力と力で他のすべての竜をねじ伏せた魔竜王。大地を焦がし、天を裂く最強の物理戦闘力を持つ。" },
        "dragon_type1": { name: "カースド・ドレイク", desc: "邪悪な呪いを過剰に摂取し、ドロドロに黒く変異した邪竜。吐き出す瘴気ブレスは不治の病をもたらす。" },
        "dragon_type1_2": { name: "アビス・ウロボロス", desc: "深淵の闇を喰らい尽くし、次元の狭間に棲みついた宇宙竜。自らの尾を噛み、無限の破壊と再生を繰り返す。" },
        "dragon_type5": { name: "エンシェント・ヴルム", desc: "何千年も生き抜き、翼が退化して大地を這うようになった古竜。普段は山に擬態してまどろんでいる。" },
        "dragon_type5_2": { name: "ジオ・ククルカン", desc: "大地の精霊と完全に融合し、神話の化石として祀られる神竜。一切の活動を停止し、星の寿命が尽きるのを待っている。" },
        "dragon_type3": { name: "アーク・リヴァイアサン", desc: "無限の知識を求めて深海や星海を巡り、真理にたどり着いた水竜。水流や天候を魔法の数式でコントロールする。" },
        "dragon_type3_2": { name: "ギャラクシー・ノヴァ", desc: "宇宙の法則を理解し、自らの肉体を星間物質で再構成した神竜。超新星爆発に匹敵するエネルギーを体内に秘める。" },
        "dragon_type2": { name: "クリスタル・オーレリア", desc: "鱗の1枚1枚が希少な宝石に変化した美しき宝石竜。その魅惑の鳴き声は、聞いた者を虜にしてしまう。" },
        "dragon_type2_2": { name: "セラフィック・応龍", desc: "善なる行いを積み重ね、神の使いへと昇華した伝説の竜。神々しいオーラを放ち、人々に加護と豊穣をもたらす。" },
        "dragon_type2_3": { name: "プリズマティカ", desc: "光そのものを編み込んで作られた幻の極光竜。実体を持たず、オーロラのように空を彩りながら優雅に舞う。" }
    };
    
    // 図鑑に名前があればそれを返し、なければ元の「beetle」などを返す
    if (bookData[skin] && bookData[skin].name) {
        return bookData[skin].name;
    }
    return skin.split('_')[0]; // 安全装置
};