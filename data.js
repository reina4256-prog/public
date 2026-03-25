// data.js : 設定データ (Ultimate Edition - ID & Image Name Fully Synchronized)

// ==========================================
// 1. 画像リソースの定義（初期ロードを極限まで軽くする！）
// ==========================================
const imageSources = {
    field: 'field_2.png', terrain: 'terrain.png', castle_build: 'castle_build2.png',
    field_3: 'field_3.png', field_4: 'field_4.png', field_5: 'field_5.png', field_6: 'field_6.png',
    field_bg: 'field_bg.png', room_bg: 'room_bg.png', evolutions: 'evolutions.png', fishing_bg: 'fishing_bg.png',

    // ★修正：初期ロードは「基本の11種族（待機状態）」のみ！アクションや進化系は起動時に読み込まない！
    robot: 'robot.png', spirit: 'spirit.png', magician: 'magician.png',
    beetle: 'beetle.png', seed: 'seed.png', dragon: 'dragon.png',
    bird: 'bird.png', machine: 'machine.png', stone: 'stone.png',
    balloon: 'balloon.png', ghost: 'ghost.png'
};

// ★追加：後から必要になった時に読み込む用の「動的画像カタログ」
window.dynamicImageCatalog = {}; 

try {
    const savedCustomImages = JSON.parse(localStorage.getItem('custom_images_v1'));
    if (savedCustomImages) { for (let key in savedCustomImages) { imageSources[key] = savedCustomImages[key]; } }
} catch(e) {}

const defaultCatalog = {
  "skull":{"sx":42,"sy":127,"sw":216,"sh":216,"img":"field","type":"building","name":"洞窟"},
  "castle":{"sx":278,"sy":85,"sw":226,"sh":257,"img":"field","type":"building","name":"城"},
  "casino":{"sx":556,"sy":132,"sw":184,"sh":196,"img":"field","type":"building","name":"カジノ"},
  "crystal":{"sx":780,"sy":116,"sw":194,"sh":212,"img":"field","type":"building","name":"クリスタル"},
  "mountain":{"sx":65,"sy":446,"sw":155,"sh":140,"img":"field","type":"nature","name":"山"},
  "house":{"sx":299,"sy":391,"sw":196,"sh":221,"img":"field","type":"building","name":"家"},
  "palms":{"sx":551,"sy":440,"sw":166,"sh":153,"img":"field","type":"nature","name":"森"},
  "grass1":{"img":"terrain","sx":77,"sy":88,"sw":585,"sh":585,"type":"ground","name":"grass1","scale":0.10000000000000007},
  "grass2":{"img":"terrain","sx":736,"sy":88,"sw":585,"sh":585,"type":"ground","name":"grass2","scale":0.10000000000000007},
  "grass3":{"img":"terrain","sx":1379,"sy":88,"sw":585,"sh":585,"type":"ground","name":"grass3","scale":0.10000000000000007},
  "road_h":{"img":"terrain","sx":77,"sy":703,"sw":585,"sh":585,"type":"road","name":"road_h","scale":0.10000000000000007},
  "road_v":{"img":"terrain","sx":736,"sy":703,"sw":585,"sh":585,"type":"road","name":"road_v","scale":0.10000000000000007},
  "road_x":{"img":"terrain","sx":1379,"sy":703,"sw":585,"sh":585,"type":"road","name":"road_x","scale":0.10000000000000007},
  "water1":{"img":"terrain","sx":77,"sy":1342,"sw":585,"sh":585,"type":"water","name":"water1","scale":0.10000000000000007},
  "water2":{"img":"terrain","sx":736,"sy":1342,"sw":585,"sh":585,"type":"water","name":"water2","scale":0.10000000000000007},
  "water3":{"img":"terrain","sx":1379,"sy":1342,"sw":585,"sh":585,"type":"water","name":"water3","scale":0.10000000000000007},
  "bridge":{"img":"field_6","sx":183,"sy":1126,"sw":769,"sh":691,"type":"object","name":"橋","scale":0.10000000000000007},
  "hut":{"img":"field","sx":302,"sy":685,"sw":151,"sh":154,"type":"building","name":"小屋","scale":0.5},
  "castle_build":{"img":"castle_build","sx":139,"sy":118,"sw":1796,"sh":1648,"type":"building","name":"建築中の城","scale":0.10000000000000007},
  "restaurant":{"img":"field_4","sx":278,"sy":115,"sw":222,"sh":220,"type":"building","name":"レストラン"},
  "shop":{"img":"field_3","sx":749,"sy":86,"sw":231,"sh":237,"type":"building","name":"ショップ","scale":0.5},
  // ★追加：カード屋（今回はshopの画像「field_3」の右側あたりを流用して表示）
  "card_shop":{"img":"field_3","sx":749,"sy":86,"sw":231,"sh":237,"type":"building","name":"カード屋","scale":0.45},
  "blacksmith":{"img":"field_4","sx":271,"sy":365,"sw":241,"sh":248,"type":"building","name":"鍛冶屋","scale":0.5},
  "farm":{"img":"field_3","sx":23,"sy":413,"sw":255,"sh":220,"type":"farm","name":"畑(空き地)"},
  "hut_room":{"img":"room_bg","sx":35,"sy":391,"sw":1307,"sh":654,"type":"room","name":"小屋の背景","scale":0.15},
  "castle_room":{"img":"room_bg","sx":1307,"sy":391,"sw":1307,"sh":654,"type":"room","name":"城の背景","scale":0.15},
  "farm_growing":{"img":"field_3","sx":26,"sy":671,"sw":255,"sh":220,"type":"farm","name":"畑(成長中)","scale":0.5},
  "farm_mature":{"img":"field_3","sx":746,"sy":667,"sw":255,"sh":220,"type":"farm","name":"畑(収穫可)","scale":0.5},
  "camping_bg":{"img":"field_bg","sx":34,"sy":26,"sw":1408,"sh":650,"type":"room","name":"野宿背景","scale":0.1499999999999997},
  "farm_bg":{"img":"field_bg","sx":1535,"sy":26,"sw":1408,"sh":650,"type":"room","name":"農業背景","scale":0.1499999999999997},
  "mountain_bg":{"img":"field_bg","sx":34,"sy":762,"sw":1408,"sh":650,"type":"room","name":"山背景","scale":0.1499999999999997},
  "forest_bg":{"img":"field_bg","sx":1535,"sy":762,"sw":1408,"sh":650,"type":"room","name":"森背景","scale":0.1499999999999997},
  "eating_bg":{"img":"field_bg","sx":0,"sy":0,"sw":300,"sh":200,"type":"room","name":"食事背景","scale":1},
  "river_bg":{"img":"fishing_bg","sx":148,"sy":25,"sw":2803,"sh":654,"type":"room","name":"川釣り背景","scale":0.1},
  "sea_bg":{"img":"fishing_bg","sx":146,"sy":763,"sw":2803,"sh":654,"type":"room","name":"海釣り背景","scale":0.1}
};
const characterDialogues = {
    robot: { 
        average: ["システム正常。", "異常なし。", "待機中...", "タスクを要求します。"], 
        gloom: ["エネルギー消費を抑えます...", "今日は休止モードに入りたいです...", "システムにわずかなエラー..."], 
        scholar: ["周囲のデータを収集・分析中。", "新しい知識のインプットを推奨します。", "演算処理を実行中。"], 
        athlete: ["モーターの調子が良いです。", "稼働率100%で動作可能です！", "いつでも動けます！"], 
        idol: ["ピピピ！今日も元気です！", "見ていてくださいね！", "ファンサービスを実行中！"],
        artist: ["色彩のパターンを解析中...", "美しい造形について演算しています。", "芸術的出力の準備完了。"],
        stoic: ["自己研鑽プロセスを継続中。", "一切の無駄を省いた動きを追求します。", "限界までタスクをこなせます。"],
        lazy: ["スリープモードへの移行を申請します...", "省電力モード。動きません。", "タスク...あとでやります..."]
    },
    spirit: { 
        average: ["風が気持ちいいな〜", "自然の力を感じる...", "ふわぁ〜", "ひなたぼっこ中..."], 
        gloom: ["なんだか元気が出ない...", "少し休みたいな...", "雨が降ればいいのに..."], 
        scholar: ["森の叡智を感じる...", "この葉っぱ、珍しい形だね。", "自然は不思議がいっぱい！"], 
        athlete: ["森の中を駆け回りたいな！", "力がみなぎってくる！", "そっちまで競争だ！"], 
        idol: ["お花畑で踊ろう！", "みんな、見ててねー！", "歌をうたいましょう！"],
        artist: ["綺麗なお花を飾りたいな。", "この景色の色、すごく素敵...", "芸術的なインスピレーションが！"],
        stoic: ["自然の試練に耐えてみせる。", "心身を清める修行の時間だ。", "風の導きに従い、進むのみ。"],
        lazy: ["ふわぁ...もうお昼寝の時間...", "葉っぱのベッドで寝よっと。", "今日はもう動きたくないな〜"]
    },
    magician: { 
        average: ["次の呪文はどうしようかな。", "魔力が満ちている...", "ふむふむ。", "本を読みたいな。"], 
        gloom: ["魔力が足りない気がする...", "今日は魔法がうまくいかない...", "少し瞑想しよう..."], 
        scholar: ["この魔導書、興味深い記述がある。", "魔法の歴史について考えよう。", "新しい魔法の構成を考案中。"], 
        athlete: ["体力作りも魔法使いには必要だ！", "杖を振るスピードが上がったぞ！", "魔法は筋肉だ！"], 
        idol: ["キラキラの魔法を見せてあげる！", "私の魔法でみんなを笑顔に！", "とっておきのイリュージョン！"],
        artist: ["魔法は美しくなくては！", "氷の彫刻を作ってみようかしら。", "杖の装飾をアレンジしたいな。"],
        stoic: ["さらなる高みへ、魔力を練る。", "睡眠など魔法の探求の邪魔だ。", "究極の魔法を完成させるまで...！"],
        lazy: ["魔法で勝手に掃除してくれないかな...", "呪文を唱えるのもめんどくさい...", "今日はもう魔力切れ〜"]
    }
};

// ==========================================
// ★ 図鑑データ（生態や歴史など、リッチな説明文に拡充！）
// ==========================================
const monsterBookData = {
    // Robot
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

    // Spirit
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

    // Magician
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

    // Bird
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

    // Machine
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

    // Stone
    "stone": { name: "ロックゴーレム", desc: "ただの石ころが魔力を帯びて動き出したモンスター。動きは鈍いが、とてつもなく頑丈で滅多に疲れない。" },
    "stone_type2": { name: "クリスタル・ゴーレム", desc: "長い年月を経て、体の一部が美しい水晶に変化したゴーレム。光を反射してキラキラと輝いている。" },
    "stone_type2_2": { name: "ブリリアント・コロッサス", desc: "全身が最高純度の宝石で構成された巨像。その美しさと硬さは、世界中のどんな宝物にも勝る。" },
    "stone_type4": { name: "マグマ・ギガント", desc: "火山の奥深くで地熱を吸収し、溶岩を宿したゴーレム。触れるものすべてを燃やし尽くす圧倒的な力を持つ。" },
    "stone_type4_2": { name: "アイアン・フォートレス", desc: "鉱石を取り込み、金属の鎧を纏ったゴーレム。一切の攻撃を跳ね返す、まさに歩く難攻不落の要塞。" },
    "stone_type4_3": { name: "メテオ・タイタン", desc: "宇宙から飛来した隕石を核にして生まれた超弩級の巨人。星を砕くほどの剛腕で大地を揺るがす。" },
    "stone_type5": { name: "モノリス・ルイン", desc: "風雨にさらされ、遺跡の一部と化してしまったゴーレム。ほとんど動かないが、その場所の守り神となっている。" },
    "stone_type5_2": { name: "アストラル・モノリス", desc: "背中に本物の森や川を宿した、生きた箱庭のような巨石。大地と完全に一体化し、悠久の時を生きる。" },
    "stone_type5_3": { name: "エレメント・ハイブリッド", desc: "悠久の時を経たモノリス・ルインが、その身に宿した相反する『地熱』と『冷気』のエネルギーを完全に制御し、目覚めた姿。左半身から放つ灼熱と、右半身から放つ極寒は、触れるものすべてを砕き去る。" },
    "stone_type1": { name: "カースド・ガーゴイル", desc: "邪悪な魔力を吸収し続け、悪魔のような姿に変貌した石像。夜な夜な動き出し、村人を脅かしている。" },
    "stone_type1_2": { name: "ヴォイド・オブシディアン", desc: "光すら吸い込む漆黒の黒曜石でできた災厄の塊。周囲の生命力を奪いながら、ただそこにあるだけの恐怖の象徴。" },
    "stone_type3": { name: "ルーン・ゴーレム", desc: "表面に神秘的な古代文字（ルーン）が刻まれたゴーレム。自らの意思で魔法を使いこなす知性を持つ。" },
    "stone_type3_2": { name: "オラクル・ストーン", desc: "知識の結晶体として覚醒し、重力を制御して宙に浮く巨石。世界中のあらゆる石の記憶を読み取ることができる。" },

    // Balloon
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
    "balloon_type5_2": { name: "フォッシル・バルーン", desc: "気が遠くなるほど長い年月を経て、しわしわだった体が岩のように硬化し、内部の残留ガスが超高温で発火した姿。気難しそうな顔をしているが、実はおじいちゃんのように頑固なだけ。" },
    "balloon_type3": { name: "ウェザー・バルーン", desc: "空気を読んで天候を予測する気象観測気球。頭脳明晰で、村人たちに明日の天気を教えてくれる。" },
    "balloon_type3_2": { name: "スコープ・バルーン", desc: "巨大なレンズを搭載し、上空から地上のあらゆるデータを収集する観測用の風船モンスター。" },
    "balloon_type3_3": { name: "サテライト・アイ", desc: "ついに大気圏を突破し、人工衛星のような姿になったバルーン。宇宙からすべての情報を受信・解析している。" },

    // Ghost
    "ghost": { name: "プチゴースト", desc: "イタズラ好きの小さなお化け。壁をすり抜けることができ、ふらふらと浮遊している。賢くお腹が減りにくい。" },
    "ghost_type2": { name: "ルミナス・ソウル", desc: "恨みや未練を捨て、純粋な美しい光の霊体となった姿。暗い夜道で迷った旅人を安全な場所へ導く。" },
    "ghost_type2_2": { name: "ホーリー・ファントム", desc: "神聖な気をまとい、天使に近い存在となった高位の霊。その後光を浴びた者は、あらゆる傷が癒やされる。" },
    "ghost_type4": { name: "ポルターガイスト", desc: "念動力を操り、周囲の物を激しく飛ばして暴れる騒がしいゴースト。物理的な干渉力が非常に強くなった。" },
    "ghost_type4_2": { name: "ファントム・ジャガーノート", desc: "強い霊力を圧縮して実体化し、物理的ボディを獲得した大幽霊。生者のように力強く大地を踏みしめる。" },
    "ghost_type5": { name: "エイシェント・レイス", desc: "何百年も存在し続け、自我すら曖昧になった古の霊。ぼんやりと漂うだけで、エネルギーを一切消費しない。" },
    "ghost_type5_2": { name: "エターナル・ファラオ", desc: "古代の王のミイラに取り憑き、不朽の呪縛として定着した魂。ピラミッドの奥深くで永遠に眠り続ける。" },
    "ghost_type1": { name: "シャドウ・リーパー", desc: "負の感情に飲まれ、大鎌を持つ黒く染まった悪霊。生きている者の命を刈り取るために夜の街を徘徊する。" },
    "ghost_type1_2": { name: "デス・ブリンガー", desc: "冥界の使者として覚醒し、死の宣告をもたらす存在。その姿を見た者は、数日以内に原因不明の病に倒れる。" },
    "ghost_type3": { name: "アカデミー・ゴースト", desc: "図書館に棲みつき、世界中の知識を吸収し続ける学者幽霊。本のページを勝手にめくって読み漁っている。" },
    "ghost_type3_2": { name: "テレパス・ソウル", desc: "言葉を介さず、他者の脳内に直接思考を送り込む精神感応能力に目覚めた幽霊。隠し事すら見透かしてしまう。" },
    // "ghost_type3_3": { name: "マスター・リッチ", desc: "究極の魔法を極めるため、自ら進んで肉体を捨て去った大魔導師。不死の叡智をもって世界の真理を探求する。" },

    // Beetle
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
    "beetle_type4_2": { name: "ギガント・カイザー", desc: "タイタン・ホーンが城壁をも粉砕する伝説級の栄養を摂取し、皇帝の如き风格と神話級の怪力を手に入れた姿。その角の一振りは大地を割り、昆虫界の頂点に君臨する。" },
    
    // Seed
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

    // Dragon
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

const itemCatalog = {
    stone: { name: "ただの石", type: 'material', value: 10, desc: "建築の基本素材" },
    wood: { name: "木材", type: 'material', value: 15, desc: "建築に使う丈夫な木" },
    high_wood: { name: '良質な木材', type: 'material', value: 150, desc: '森の深部で採れる、硬くて丈夫な木材。' },
    high_stone: { name: '硬い石', type: 'material', value: 150, desc: '山の深部で採れる、密度が高くずっしりとした石。' },
    iron: { name: "鉄鉱石", type: 'material', value: 50, desc: "武具の素材" },
    herb: { name: "薬草", type: 'food', stats: { energy: 10, hunger: 5 }, value: 20, desc: "少し元気が湧く" },
    coin: { name: "古びた硬貨", type: 'material', value: 100, desc: "売ると高い" },
    book: { name: "魔導書", type: 'material', value: 200, desc: "賢さが上がる本" },
    crystal: { name: "魔結晶", type: 'material', value: 500, desc: "高純度のエネルギー体" },
    herb_spring: { name: "春の七草", type: 'food', stats: { energy: 20, hunger: 10, mood: 5 }, value: 40, desc: "春にしか採れない健康に良い草。" },
    bug_beetle: { name: "カブトムシ", type: 'material', value: 80, desc: "夏の森で見つけた。" },
    mushroom: { name: "秋のキノコ", type: 'food', stats: { hunger: 25 }, value: 30, desc: "秋の山で採れる美味しいキノコ。" },
    ice_crystal: { name: "氷の結晶", type: 'material', value: 150, desc: "冬の洞窟でしか採れない冷たい結晶。" },
    seed_carrot: { name: "ニンジンの種", type: 'seed', crop: 'carrot', value: 10, desc: "畑に植えると育つ" },
    seed_pepper: { name: "ピーマンの種", type: 'seed', crop: 'pepper', value: 10, desc: "苦いが栄養満点な野菜が育つ" },
    seed_tomato: { name: "トマトの種", type: 'seed', crop: 'tomato', value: 15, desc: "赤くて可愛い実がなる" },
    carrot: { name: "ニンジン", type: 'ingredient', value: 30, desc: "料理の定番食材" },
    pepper: { name: "ピーマン", type: 'ingredient', value: 30, desc: "ビタミン豊富" },
    tomato: { name: "トマト", type: 'ingredient', value: 40, desc: "みずみずしい" },
    dead_crop: { name: "枯れた野菜", type: 'material', value: 1, desc: "枯れてしまった..." },
    eaten_crop: { name: "食べられた野菜", type: 'food', value: 2, stats: { hunger: 5 }, desc: "食い荒らされた残骸。" },
    high_carrot: { name: "質のいいニンジン", type: 'ingredient', value: 100, desc: "大成功！ツヤツヤで甘い！" },
    high_pepper: { name: "質のいいピーマン", type: 'ingredient', value: 100, desc: "大成功！旨味が詰まった高級品！" },
    high_tomato: { name: "質のいいトマト", type: 'ingredient', value: 150, desc: "大成功！フルーツのようなトマト！" },
    rod_old: { name: "ボロの釣り竿", type: 'tool', value: 50, desc: "初心者用。" },
    rod_norm: { name: "普通の釣り竿", type: 'tool', value: 200, desc: "扱いやすい。" },
    rod_super: { name: "名人の釣り竿", type: 'tool', value: 800, desc: "大物も逃がさない！" },
    trash_boot: { name: "穴あき長靴", type: 'material', value: 10, desc: "誰かが捨てたゴミ。" },
    fish_carp: { name: "コイ", type: 'food', stats: { hunger: 15 }, value: 50, desc: "川の主。" },
    fish_salmon: { name: "サケ", type: 'food', stats: { hunger: 20 }, value: 80, desc: "脂が乗っている。" },
    fish_crawfish: { name: "ザリガニ", type: 'ingredient', value: 15, desc: "川の浅瀬によくいる。" },
    fish_blackbass: { name: "ブラックバス", type: 'food', stats: { hunger: 10 }, value: 60, desc: "外来魚。" },
    fish_medaka: { name: "メダカ", type: 'ingredient', value: 10, desc: "小さな魚。" },
    fish_smelt: { name: "ワカサギ", type: 'food', stats: { hunger: 5 }, value: 40, desc: "冬の冷たい川で釣れる。" },
    fish_sardine: { name: "イワシ", type: 'food', stats: { hunger: 10 }, value: 30, desc: "一般的で美味しい海の魚。" },
    fish_tuna: { name: "マグロ", type: 'food', stats: { hunger: 40, mood: 20 }, value: 300, desc: "海の王様。" },
    fish_snapper: { name: "マダイ", type: 'food', stats: { hunger: 25, mood: 10 }, value: 150, desc: "高級な海の魚。" },
    fish_squid: { name: "イカ", type: 'food', stats: { hunger: 15 }, value: 70, desc: "スミを吐く。" },
    fish_marlin: { name: "カジキマグロ", type: 'food', stats: { hunger: 50, power: 10 }, value: 500, desc: "巨大な魚。" },
    fish_saury: { name: "サンマ", type: 'food', stats: { hunger: 15, intel: 2 }, value: 80, desc: "秋の味覚。" },
    burnt_food: { name: "焦げた料理", type: 'food', value: 1, stats: { mood: -5, energy: 5 }, desc: "失敗作。" },
    scrap_metal: { name: "鉄くず", type: 'material', value: 5, desc: "鍛冶の失敗作" },
    bad_sword: { name: "なまくら剣", type: 'equip', stats: { power: 5 }, value: 50, desc: "切れ味が悪い" },
    dish_salad: { name: "フレッシュサラダ", type: 'dish', stats: { mood: 10, power: 2 }, value: 80, desc: "シャキシャキ" },
    dish_stirfry: { name: "野菜炒め", type: 'dish', stats: { power: 15, energy: 20 }, value: 100, desc: "力が湧く！" },
    dish_soup: { name: "ミネストローネ", type: 'dish', stats: { intel: 10, mood: 10 }, value: 120, desc: "頭が冴える" },
    eq_sword: { name: "鉄の剣", type: 'equip', stats: { power: 20 }, value: 300, desc: "攻撃力UP" },
    eq_shield: { name: "鉄の盾", type: 'equip', stats: { energy: 50 }, value: 300, desc: "最大体力UP" },
    eq_staff: { name: "魔法の杖", type: 'equip', stats: { intel: 20 }, value: 500, desc: "賢さUP" },
    eq_crown: { name: "王冠", type: 'equip', stats: { mood: 20 }, value: 1000, desc: "カリスマ性UP" },
    tool_pan: { name: "フライパン", type: 'tool', value: 100, desc: "料理ができるようになる" },
    baked_carrot: { name: "焼きニンジン", type: 'dish', stats: { energy: 10, hunger: 15 }, value: 40, desc: "香ばしくて甘い" },
    baked_pepper: { name: "焼きピーマン", type: 'dish', stats: { energy: 10, mood: 5 }, value: 40, desc: "苦味が減る" },
    baked_tomato: { name: "焼きトマト", type: 'dish', stats: { energy: 15, intel: 2 }, value: 50, desc: "味が凝縮されている" },
    baked_fish: { name: "焼き魚", type: 'dish', stats: { energy: 20, power: 5 }, value: 60, desc: "パリッと焼けた魚" }
};

const riverFishingTable = {
    spring: [ { id: 'trash_boot', prob: 15 }, { id: 'fish_medaka', prob: 40 }, { id: 'fish_crawfish', prob: 30 }, { id: 'fish_carp', prob: 15 } ],
    summer: [ { id: 'trash_boot', prob: 10 }, { id: 'fish_crawfish', prob: 40 }, { id: 'fish_blackbass', prob: 30 }, { id: 'fish_carp', prob: 20 } ],
    autumn: [ { id: 'trash_boot', prob: 10 }, { id: 'fish_salmon', prob: 40 }, { id: 'fish_carp', prob: 30 }, { id: 'fish_blackbass', prob: 20 } ],
    winter: [ { id: 'trash_boot', prob: 20 }, { id: 'fish_smelt', prob: 50 }, { id: 'fish_carp', prob: 30 } ]
};
const seaFishingTable = {
    spring: [ { id: 'trash_boot', prob: 5 }, { id: 'fish_sardine', prob: 50 }, { id: 'fish_squid', prob: 30 }, { id: 'fish_snapper', prob: 15 } ],
    summer: [ { id: 'trash_boot', prob: 5 }, { id: 'fish_sardine', prob: 40 }, { id: 'fish_squid', prob: 20 }, { id: 'fish_marlin', prob: 15 }, { id: 'fish_tuna', prob: 20 } ],
    autumn: [ { id: 'trash_boot', prob: 5 }, { id: 'fish_saury', prob: 60 }, { id: 'fish_sardine', prob: 20 }, { id: 'fish_snapper', prob: 15 } ],
    winter: [ { id: 'trash_boot', prob: 10 }, { id: 'fish_squid', prob: 50 }, { id: 'fish_tuna', prob: 30 }, { id: 'fish_snapper', prob: 10 } ]
};

const facilityData = {
    skull: { name: "魔王の洞窟", stat: 'power', difficulty: 15, maxDepth: 10, items: { default: ['stone', 'iron', 'sword'], winter: ['ice_crystal', 'stone', 'iron'] } },
    castle: { name: "王城", stat: 'intel', difficulty: 3, maxDepth: 5, items: { default: ['coin', 'book', 'seed_tomato'] } },
    casino: { name: "カジノ跡地", stat: 'mood', difficulty: 4, maxDepth: 5, items: { default: ['coin', 'gem'] } }, 
    palms: { name: "迷いの森", stat: 'mood', difficulty: 2, maxDepth: 8, durability: 5, depletedType: 'grass1', items: { default: ['wood', 'seed_carrot', 'seed_pepper'], spring: ['herb_spring', 'wood'], summer: ['bug_beetle', 'wood'], autumn: ['wood'], winter: ['wood'] } },
    crystal: { name: "水晶鉱脈", stat: 'intel', difficulty: 8, maxDepth: 20, items: { default: ['stone', 'crystal', 'iron'] } },
    mountain: { name: "険しい山", stat: 'power', difficulty: 4, maxDepth: 5, durability: 5, depletedType: 'grass1', items: { default: ['stone', 'iron'], autumn: ['mushroom', 'stone'], summer: ['bug_beetle', 'stone'] } },
    default: { name: "建物", stat: 'power', difficulty: 1, maxDepth: 3, items: { default: ['stone'] } }
};

// ==========================================
// ★ キャラクター特性・成長率・燃費・寿命の定義
// （素早さ・美しさのボーナスを追加し、個性を極限まで尖らせた版！）
// ==========================================
const charaTraits = {
    // ---------- 基本種族 ----------
    robot: { name: "ロボット", desc: "お腹が減りにくく疲れにくい", statBonus: { power: 1.5, intel: 1.0, mood: 0.8, beauty: 0.8, speed: 1.0 }, consumption: 0.6, lifespan: 150 },
    spirit: { name: "精霊", desc: "自然の上にいると回復する。美しさと素早さが高い", statBonus: { power: 0.8, intel: 1.0, mood: 1.5, beauty: 1.5, speed: 1.5 }, consumption: 1.0, natureHeal: true, lifespan: 200 },
    magician: { name: "魔法使い", desc: "賢さが上がりやすい", statBonus: { power: 0.8, intel: 1.5, mood: 1.0, beauty: 1.2, speed: 0.8 }, consumption: 1.1, lifespan: 80 },
    bird: { name: "追い風", desc: "素早さが全種トップクラス。機嫌も良い", statBonus: { power: 0.9, intel: 1.1, mood: 1.5, beauty: 1.2, speed: 2.5 }, consumption: 1.2, lifespan: 150 },
    machine: { name: "ぜんまい仕掛け", desc: "燃費が非常に良い", statBonus: { power: 0.9, intel: 0.9, mood: 1.0, beauty: 0.5, speed: 1.2 }, consumption: 0.5, lifespan: 200 },
    stone: { name: "石の体", desc: "超燃費だが素早さは絶望的", statBonus: { power: 1.5, intel: 0.5, mood: 0.5, beauty: 0.8, speed: 0.2 }, consumption: 0.4, lifespan: 500 },
    balloon: { name: "エアクッション", desc: "機嫌が良く、ふんわり素早い", statBonus: { power: 0.3, intel: 1.0, mood: 2.0, beauty: 1.2, speed: 1.8 }, consumption: 0.8, lifespan: 100 },
    ghost: { name: "半透明", desc: "賢さと素早さが上がりやすい", statBonus: { power: 0.5, intel: 1.5, mood: 1.0, beauty: 0.5, speed: 1.8 }, consumption: 0.6, lifespan: 80 },
    beetle: { name: "堅牢な甲殻", desc: "活力が上がり体力の消費が少ない", statBonus: { power: 1.5, intel: 0.5, mood: 1.0, beauty: 1.0, speed: 0.8 }, consumption: 0.7, lifespan: 100 },
    seed: { name: "光合成", desc: "自然回復。成長はゆっくり", statBonus: { power: 0.8, intel: 0.8, mood: 1.2, beauty: 1.5, speed: 0.5 }, consumption: 0.5, natureHeal: true, lifespan: 120 },
    dragon: { name: "竜の血脈", desc: "活力と賢さが上がるが燃費激悪", statBonus: { power: 1.5, intel: 1.5, mood: 0.5, beauty: 1.5, speed: 1.2 }, consumption: 1.5, lifespan: 300 },

    // ---------- Robot Evolutions ----------
    robot_type3: { name: "データ収集", desc: "賢さがとても上がりやすい", statBonus: { power: 0.8, intel: 1.8, mood: 1.0, beauty: 0.8, speed: 1.2 }, consumption: 0.8, lifespan: 150 },
    robot_type3_2: { name: "超演算", desc: "燃費が極めて良く、賢さが限界突破する", statBonus: { power: 0.5, intel: 2.5, mood: 1.0, beauty: 1.0, speed: 1.5 }, consumption: 0.4, lifespan: 200 },
    robot_type3_3: { name: "量子の導き", desc: "賢さと機嫌が爆発的に上がる", statBonus: { power: 1.5, intel: 3.5, mood: 1.5, beauty: 1.5, speed: 2.0 }, consumption: 0.8, lifespan: 250 },
    robot_type3_4: { name: "マッドサイエンス", desc: "異常な賢さを得るが、機嫌が悪い", statBonus: { power: 0.5, intel: 3.0, mood: 0.5, beauty: 0.2, speed: 2.5 }, consumption: 1.0, lifespan: 180 },
    robot_type3_5: { name: "世界創造", desc: "燃費が神がかり、すべての能力が高い", statBonus: { power: 2.0, intel: 3.0, mood: 2.0, beauty: 2.0, speed: 2.0 }, consumption: 0.1, lifespan: 500 },
    robot_type2: { name: "ファンサービス", desc: "美しさと機嫌が上がりやすい", statBonus: { power: 0.5, intel: 1.0, mood: 2.5, beauty: 2.5, speed: 1.0 }, consumption: 1.2, lifespan: 150 },
    robot_type2_2: { name: "完璧な舞踊", desc: "美しさの頂点。機嫌が最高に上がる", statBonus: { power: 0.2, intel: 1.5, mood: 3.0, beauty: 3.5, speed: 1.5 }, consumption: 0.9, lifespan: 200 },
    robot_type2_3: { name: "電子の歌声", desc: "燃費が良く、美しさが輝く", statBonus: { power: 0.1, intel: 1.5, mood: 2.5, beauty: 3.0, speed: 1.2 }, consumption: 0.3, lifespan: 100 },
    robot_type2_4: { name: "成金趣味", desc: "すべてをお金で解決するバランス型", statBonus: { power: 1.5, intel: 1.5, mood: 2.0, beauty: 2.0, speed: 1.0 }, consumption: 1.0, lifespan: 180 },
    robot_type4: { name: "重装甲", desc: "活力が爆発するが、素早さと燃費が最悪", statBonus: { power: 2.5, intel: 0.8, mood: 0.5, beauty: 0.5, speed: 0.3 }, consumption: 1.5, lifespan: 150 },
    robot_type4_2: { name: "重機動アーム", desc: "燃費が少し悪いが、活力が非常に高い", statBonus: { power: 2.0, intel: 0.5, mood: 0.8, beauty: 0.5, speed: 0.5 }, consumption: 1.2, lifespan: 150 },
    robot_type4_3: { name: "殲滅プロトコル", desc: "すべてを破壊する活力と素早さ。すぐ電池が切れる", statBonus: { power: 3.5, intel: 0.1, mood: 0.1, beauty: 0.1, speed: 2.5 }, consumption: 2.5, lifespan: 120 },
    robot_type4_4: { name: "無限ジェネレーター", desc: "活力が異常に高く、絶対に疲れない", statBonus: { power: 3.0, intel: 0.5, mood: 1.0, beauty: 1.0, speed: 1.0 }, consumption: 0.0, lifespan: 1000 },
    robot_type1: { name: "暴走回路", desc: "活力と素早さが高いが、他は絶望的", statBonus: { power: 2.5, intel: 0.2, mood: 0.1, beauty: 0.1, speed: 2.5 }, consumption: 0.8, lifespan: 100 },
    robot_type1_2: { name: "自己増殖", desc: "燃費が異常に良く、寿命が長い", statBonus: { power: 3.0, intel: 1.0, mood: 0.1, beauty: 0.5, speed: 1.0 }, consumption: 0.1, lifespan: 500 },
    robot_type1_3: { name: "終末のカウント", desc: "最強の能力を持つが、すぐ死ぬ", statBonus: { power: 4.0, intel: 4.0, mood: 0.1, beauty: 1.0, speed: 4.0 }, consumption: 0.0, lifespan: 40 },
    robot_type5: { name: "歴戦の知恵", desc: "燃費が良く、すべての能力が平均的に上がる", statBonus: { power: 1.2, intel: 1.2, mood: 1.2, beauty: 1.2, speed: 1.2 }, consumption: 0.3, lifespan: 250 },
    robot_type5_2: { name: "古代の守護神", desc: "燃費が最高峰。バランス良く強い", statBonus: { power: 1.5, intel: 1.5, mood: 1.5, beauty: 1.5, speed: 1.0 }, consumption: 0.1, lifespan: 500 },
    robot_type5_3: { name: "永遠のゼンマイ", desc: "賢さが高く、半永久的に活動できる", statBonus: { power: 0.5, intel: 2.0, mood: 1.0, beauty: 1.0, speed: 0.5 }, consumption: 0.1, lifespan: 9999 },
    robot_type5_4: { name: "機能停止", desc: "全く動かないが、永遠にそこにいる", statBonus: { power: 0, intel: 0, mood: 0, beauty: 0, speed: 0 }, consumption: 0, lifespan: 9999 },

    // ---------- Spirit Evolutions ----------
    spirit_type2: { name: "春の訪れ", desc: "自然回復があり、美しさが上がりやすい", statBonus: { power: 0.5, intel: 1.0, mood: 2.0, beauty: 2.8, speed: 1.5 }, consumption: 0.8, natureHeal: true, lifespan: 150 },
    spirit_type2_2: { name: "花の息吹", desc: "自然回復が強力で、美しさがかなり高い", statBonus: { power: 0.5, intel: 1.0, mood: 2.5, beauty: 3.2, speed: 1.5 }, consumption: 0.5, natureHeal: true, lifespan: 200 },
    spirit_type2_3: { name: "浄化の波動", desc: "圧倒的な美しさで機嫌が最高に上がる", statBonus: { power: 0.1, intel: 1.5, mood: 3.0, beauty: 4.0, speed: 2.0 }, consumption: 0.3, natureHeal: true, lifespan: 300 },
    spirit_type4: { name: "樹木の鎧", desc: "自然回復を持ちつつ、活力が高いが遅い", statBonus: { power: 1.8, intel: 0.5, mood: 1.0, beauty: 1.0, speed: 0.5 }, consumption: 1.2, natureHeal: true, lifespan: 200 },
    spirit_type4_2: { name: "大地の怒り", desc: "森の怒りで活力が非常に高くなる", statBonus: { power: 2.5, intel: 0.8, mood: 0.5, beauty: 0.8, speed: 0.8 }, consumption: 1.5, natureHeal: true, lifespan: 300 },
    spirit_type4_3: { name: "森の守護獣", desc: "圧倒的なパワーと素早さを誇る", statBonus: { power: 2.5, intel: 0.5, mood: 0.8, beauty: 1.5, speed: 2.5 }, consumption: 2.0, natureHeal: true, lifespan: 150 },
    spirit_type5: { name: "枯れ葉の省エネ", desc: "燃費が極めて良く、のんびり生きる", statBonus: { power: 0.5, intel: 1.2, mood: 1.0, beauty: 1.5, speed: 0.5 }, consumption: 0.3, natureHeal: true, lifespan: 250 },
    spirit_type5_2: { name: "枯れゆく美", desc: "さらに燃費が良く、美しさが上がる", statBonus: { power: 0.2, intel: 1.2, mood: 1.5, beauty: 2.5, speed: 0.3 }, consumption: 0.2, natureHeal: true, lifespan: 300 },
    spirit_type5_3: { name: "冬の静寂", desc: "ほぼエネルギーを使わず永遠に生きる", statBonus: { power: 0.8, intel: 1.5, mood: 1.0, beauty: 1.0, speed: 0.1 }, consumption: 0.1, natureHeal: true, lifespan: 9999 },
    spirit_type1: { name: "猛毒胞子", desc: "活力と賢さが高いが、機嫌が悪い", statBonus: { power: 1.5, intel: 1.5, mood: 0.1, beauty: 0.5, speed: 1.5 }, consumption: 0.1, natureHeal: true, lifespan: 200 },
    spirit_type1_2: { name: "狂気の悲鳴", desc: "全く疲れないが、素早さが異常", statBonus: { power: 2.0, intel: 0.5, mood: 0.1, beauty: 0.1, speed: 3.5 }, consumption: 0.0, natureHeal: true, lifespan: 150 },
    spirit_type3: { name: "森の学習者", desc: "自然回復を持ちつつ、賢さが高い", statBonus: { power: 0.5, intel: 2.0, mood: 1.2, beauty: 1.5, speed: 1.0 }, consumption: 0.9, natureHeal: true, lifespan: 180 },
    spirit_type3_2: { name: "星の予言", desc: "燃費が良く、賢さと美しさが飛躍的に上がる", statBonus: { power: 0.5, intel: 3.0, mood: 1.5, beauty: 2.5, speed: 1.5 }, consumption: 0.5, natureHeal: true, lifespan: 400 },

    // ---------- Magician Evolutions ----------
    magician_type4: { name: "魔力打撃", desc: "賢さと活力を両立するが、燃費が悪い", statBonus: { power: 1.8, intel: 1.2, mood: 1.0, beauty: 1.0, speed: 1.2 }, consumption: 1.3, lifespan: 80 },
    magician_type4_2: { name: "熱血魔法", desc: "活力がかなり高く、すぐお腹が空く", statBonus: { power: 2.5, intel: 1.0, mood: 1.0, beauty: 0.8, speed: 1.5 }, consumption: 1.5, lifespan: 80 },
    magician_type4_3: { name: "魔闘気", desc: "圧倒的な活力と素早さを誇る", statBonus: { power: 3.0, intel: 1.5, mood: 1.0, beauty: 1.0, speed: 2.8 }, consumption: 2.0, lifespan: 70 },
    magician_type4_4: { name: "竜魔同化", desc: "活力と賢さが最強クラスだが、寿命と燃費が激悪", statBonus: { power: 2.5, intel: 2.5, mood: 0.8, beauty: 1.5, speed: 2.0 }, consumption: 2.5, lifespan: 200 },
    magician_type1: { name: "猛毒の呪詛", desc: "賢さと活力が高いが、機嫌が最悪", statBonus: { power: 1.5, intel: 1.8, mood: 0.1, beauty: 0.5, speed: 1.5 }, consumption: 1.2, lifespan: 60 },
    magician_type1_2: { name: "禁忌の代償", desc: "高い能力を得るが、短命で燃費も悪い", statBonus: { power: 2.5, intel: 2.5, mood: 0.5, beauty: 1.0, speed: 2.0 }, consumption: 1.5, lifespan: 50 },
    magician_type1_3: { name: "死霊使役", desc: "全く疲れないが、常に不機嫌", statBonus: { power: 1.0, intel: 2.5, mood: 0.1, beauty: 0.1, speed: 1.0 }, consumption: 0.0, lifespan: 150 },
    magician_type1_4: { name: "悪魔の契約", desc: "圧倒的な力を持つが、すぐ死ぬ", statBonus: { power: 3.5, intel: 3.5, mood: 0.1, beauty: 2.0, speed: 3.0 }, consumption: 3.0, lifespan: 30 },
    magician_type5: { name: "大魔導士", desc: "賢さが非常に高く、燃費も良い", statBonus: { power: 0.5, intel: 2.5, mood: 1.5, beauty: 1.8, speed: 1.0 }, consumption: 0.8, lifespan: 150 },
    magician_type5_2: { name: "タイムウォーカー", desc: "賢さと素早さが高く、不老不死", statBonus: { power: 1.0, intel: 2.5, mood: 1.5, beauty: 1.5, speed: 2.5 }, consumption: 0.5, lifespan: 9999 },
    magician_type5_3: { name: "星の預言者", desc: "超燃費で、極限の賢さを誇る", statBonus: { power: 0.2, intel: 3.0, mood: 2.0, beauty: 2.5, speed: 0.8 }, consumption: 0.1, lifespan: 300 },
    magician_type2: { name: "エンターテイナー", desc: "美しさと機嫌のバランスが良い", statBonus: { power: 0.5, intel: 1.5, mood: 2.0, beauty: 2.5, speed: 1.5 }, consumption: 1.0, lifespan: 80 },
    magician_type2_2: { name: "氷の魔女", desc: "美しさと賢さがかなり高く、燃費も少し良い", statBonus: { power: 0.5, intel: 2.5, mood: 1.0, beauty: 3.0, speed: 1.2 }, consumption: 0.9, lifespan: 100 },
    magician_type2_3: { name: "プリズムマギ", desc: "美しさと機嫌が最高に上がりやすい", statBonus: { power: 1.0, intel: 2.0, mood: 3.0, beauty: 3.5, speed: 1.5 }, consumption: 0.8, lifespan: 150 },
    magician_type2_4: { name: "天使の魔女", desc: "燃費が良く、美しさの上がり方は異常", statBonus: { power: 0.5, intel: 1.5, mood: 3.5, beauty: 4.0, speed: 2.0 }, consumption: 0.5, lifespan: 200 },
    magician_type3: { name: "天体魔法", desc: "賢さがかなり上がりやすい", statBonus: { power: 0.5, intel: 2.2, mood: 1.2, beauty: 1.5, speed: 1.0 }, consumption: 1.0, lifespan: 90 },
    magician_type3_2: { name: "宇宙の真理", desc: "賢さが異常に高く、絶対に疲れない", statBonus: { power: 1.0, intel: 3.5, mood: 1.5, beauty: 2.0, speed: 1.5 }, consumption: 0.0, lifespan: 300 },
    magician_type3_3: { name: "大賢者", desc: "燃費が極めて良く、非常に賢い", statBonus: { power: 0.5, intel: 3.0, mood: 1.0, beauty: 1.5, speed: 0.5 }, consumption: 0.2, lifespan: 250 },

    // ---------- Bird Evolutions ----------
    bird_type2: { name: "癒やしの鱗粉", desc: "美しさと機嫌が上がりやすい", statBonus: { power: 0.8, intel: 1.2, mood: 2.0, beauty: 2.8, speed: 2.0 }, consumption: 1.0, lifespan: 160 },
    bird_type2_2: { name: "極彩色の神羽", desc: "美しさが高く、機嫌がとても良い", statBonus: { power: 0.5, intel: 1.5, mood: 3.0, beauty: 3.8, speed: 2.5 }, consumption: 0.8, lifespan: 250 },
    bird_type4: { name: "急降下", desc: "鳥の俊敏さで活力と素早さが高い", statBonus: { power: 1.8, intel: 1.0, mood: 1.2, beauty: 1.0, speed: 3.0 }, consumption: 1.5, lifespan: 140 },
    bird_type4_2: { name: "暴風の主", desc: "圧倒的な活力と素早さを持つが、すぐ腹ペコになる", statBonus: { power: 2.8, intel: 0.8, mood: 1.0, beauty: 1.2, speed: 3.5 }, consumption: 2.5, lifespan: 120 },
    bird_type5: { name: "夜の番人", desc: "燃費が良く、賢さと長寿を併せ持つ", statBonus: { power: 0.8, intel: 1.5, mood: 1.2, beauty: 1.5, speed: 2.0 }, consumption: 0.6, lifespan: 300 },
    bird_type5_2: { name: "始祖の血", desc: "超燃費で、半永久的な寿命を得た", statBonus: { power: 1.0, intel: 1.0, mood: 1.0, beauty: 1.0, speed: 1.5 }, consumption: 0.2, lifespan: 9999 },
    bird_type1: { name: "収集癖", desc: "素早いが、機嫌が悪い", statBonus: { power: 1.2, intel: 1.2, mood: 0.5, beauty: 0.5, speed: 2.5 }, consumption: 1.2, lifespan: 100 },
    bird_type1_2: { name: "死肉喰らい", desc: "燃費は良いが、性格が破綻している", statBonus: { power: 2.0, intel: 1.5, mood: 0.1, beauty: 0.1, speed: 3.0 }, consumption: 0.5, lifespan: 80 },
    bird_type3: { name: "魔力帯電", desc: "鳥の機動性と魔法使いの賢さを持つ", statBonus: { power: 0.8, intel: 2.0, mood: 1.2, beauty: 1.5, speed: 2.5 }, consumption: 1.1, lifespan: 150 },
    bird_type3_2: { name: "データ蓄積", desc: "賢さが高く、燃費が少し良い", statBonus: { power: 1.0, intel: 1.8, mood: 1.0, beauty: 1.0, speed: 2.0 }, consumption: 0.9, lifespan: 180 },
    bird_type3_3: { name: "森羅万象", desc: "非常に賢く、長生きする", statBonus: { power: 0.5, intel: 3.0, mood: 1.5, beauty: 2.0, speed: 2.2 }, consumption: 0.7, lifespan: 400 },

    // ---------- Machine Evolutions ----------
    machine_type2: { name: "癒やしの旋律", desc: "美しさと機嫌が上がりやすく、燃費が良い", statBonus: { power: 0.5, intel: 1.0, mood: 2.0, beauty: 2.5, speed: 1.0 }, consumption: 0.6, lifespan: 200 },
    machine_type2_2: { name: "永遠の芸術", desc: "超燃費で、美しさが最高に上がる", statBonus: { power: 0.1, intel: 2.0, mood: 3.0, beauty: 3.5, speed: 1.2 }, consumption: 0.2, lifespan: 500 },
    machine_type4: { name: "小型ボイラー", desc: "活力が高いが、機械の割に燃費が悪い", statBonus: { power: 1.8, intel: 0.8, mood: 1.0, beauty: 0.5, speed: 1.5 }, consumption: 1.2, lifespan: 150 },
    machine_type4_2: { name: "オーバードライブ", desc: "すさまじい活力と素早さだが、すぐガス欠になる", statBonus: { power: 3.0, intel: 0.5, mood: 0.8, beauty: 0.8, speed: 2.8 }, consumption: 2.5, lifespan: 100 },
    machine_type5: { name: "サビついた体", desc: "超燃費で長生きするが、とても遅い", statBonus: { power: 0.8, intel: 0.8, mood: 0.8, beauty: 0.5, speed: 0.3 }, consumption: 0.2, lifespan: 400 },
    machine_type5_2: { name: "自然との調和", desc: "自然回復を持ち、究極の省エネ", statBonus: { power: 0.8, intel: 1.2, mood: 1.5, beauty: 1.5, speed: 0.8 }, consumption: 0.1, natureHeal: true, lifespan: 800 },
    machine_type5_3: { name: "古代のコア", desc: "高いステータスと長寿を兼ね備える", statBonus: { power: 2.0, intel: 2.0, mood: 0.8, beauty: 1.5, speed: 1.5 }, consumption: 0.5, lifespan: 1000 },
    machine_type1: { name: "怨念モーター", desc: "絶対に疲れないが、常に不機嫌", statBonus: { power: 1.5, intel: 0.5, mood: 0.1, beauty: 0.1, speed: 2.0 }, consumption: 0.0, lifespan: 120 },
    machine_type1_2: { name: "ジャンク同化", desc: "活力が非常に高いが、機嫌が最悪", statBonus: { power: 2.8, intel: 0.1, mood: 0.1, beauty: 0.2, speed: 1.5 }, consumption: 0.5, lifespan: 300 },
    machine_type3: { name: "歯車演算", desc: "賢さが上がりやすく、燃費が良い", statBonus: { power: 0.5, intel: 2.0, mood: 1.0, beauty: 1.0, speed: 1.2 }, consumption: 0.6, lifespan: 250 },
    machine_type3_2: { name: "機械的特異点", desc: "超燃費で、極限の賢さを誇示する", statBonus: { power: 1.0, intel: 3.5, mood: 1.0, beauty: 1.5, speed: 1.5 }, consumption: 0.4, lifespan: 600 },

    // ---------- Stone Evolutions ----------
    stone_type2: { name: "共鳴する輝き", desc: "燃費が良く、美しさがかなり上がりやすい", statBonus: { power: 1.0, intel: 0.8, mood: 1.8, beauty: 3.0, speed: 0.2 }, consumption: 0.3, lifespan: 600 },
    stone_type2_2: { name: "永遠の煌めき", desc: "超燃費で、美しさが爆発的に上がる", statBonus: { power: 0.5, intel: 1.0, mood: 3.0, beauty: 4.0, speed: 0.1 }, consumption: 0.1, lifespan: 2000 },
    stone_type4: { name: "地熱機関", desc: "活力が高いが、石の割に燃費が悪い", statBonus: { power: 2.0, intel: 0.5, mood: 0.8, beauty: 0.5, speed: 0.5 }, consumption: 0.6, lifespan: 400 },
    stone_type4_2: { name: "黒鉄の装甲", desc: "さらに活力が上がり、とても硬いが遅い", statBonus: { power: 2.5, intel: 0.5, mood: 0.5, beauty: 0.5, speed: 0.1 }, consumption: 0.5, lifespan: 600 },
    stone_type4_3: { name: "星砕きの剛腕", desc: "圧倒的な破壊力だが、全く動かない", statBonus: { power: 3.5, intel: 0.2, mood: 0.5, beauty: 0.2, speed: 0.0 }, consumption: 1.0, lifespan: 800 },
    stone_type5: { name: "悠久の風化", desc: "超燃費で、とてつもなく長生きする", statBonus: { power: 1.0, intel: 1.0, mood: 0.8, beauty: 0.8, speed: 0.1 }, consumption: 0.1, lifespan: 1500 },
    stone_type5_2: { name: "母なる大地", desc: "自然回復を持ち、永遠に生き続ける", statBonus: { power: 0.5, intel: 1.5, mood: 1.5, beauty: 2.0, speed: 0.0 }, consumption: 0.0, natureHeal: true, lifespan: 9999 },
    stone_type5_3: { name: "混成エレメント", desc: "あらゆる環境に適応する。機嫌が安定している", statBonus: { power: 1.8, intel: 1.8, mood: 1.2, beauty: 1.8, speed: 0.8 }, consumption: 0.4, lifespan: 1200 },
    stone_type1: { name: "邪気放出", desc: "活力が高いが、機嫌が常に最悪", statBonus: { power: 2.0, intel: 1.0, mood: 0.1, beauty: 0.1, speed: 0.5 }, consumption: 0.4, lifespan: 300 },
    stone_type1_2: { name: "虚無の器", desc: "絶対に疲れないが、性格が破綻している", statBonus: { power: 3.0, intel: 0.1, mood: 0.1, beauty: 0.0, speed: 0.2 }, consumption: 0.0, lifespan: 100 },
    stone_type3: { name: "ルーンの知恵", desc: "燃費が良く、賢さが上がりやすい", statBonus: { power: 0.8, intel: 2.0, mood: 1.0, beauty: 1.2, speed: 0.3 }, consumption: 0.3, lifespan: 700 },
    stone_type3_2: { name: "重力制御", desc: "超燃費で非常に賢く、素早さも補う", statBonus: { power: 1.0, intel: 3.0, mood: 1.2, beauty: 1.5, speed: 1.0 }, consumption: 0.2, lifespan: 1000 },

    // ---------- Balloon Evolutions ----------
    balloon_type2: { name: "虹色の被膜", desc: "美しさと機嫌がとても上がりやすい", statBonus: { power: 0.2, intel: 1.0, mood: 2.5, beauty: 3.0, speed: 1.8 }, consumption: 0.9, lifespan: 80 },
    balloon_type2_2: { name: "プリズム反射", desc: "燃費が良く、美しさも際立つ", statBonus: { power: 0.2, intel: 1.5, mood: 2.0, beauty: 3.5, speed: 2.0 }, consumption: 0.6, lifespan: 120 },
    balloon_type2_3: { name: "夢のパレード", desc: "美しさと機嫌の上がり方が全キャラ最高クラス", statBonus: { power: 0.5, intel: 1.2, mood: 3.5, beauty: 4.0, speed: 2.2 }, consumption: 0.8, lifespan: 150 },
    balloon_type4: { name: "高圧縮ボディ", desc: "風船のわりに活力と素早さが高い", statBonus: { power: 1.8, intel: 0.5, mood: 1.5, beauty: 1.0, speed: 2.5 }, consumption: 1.2, lifespan: 90 },
    balloon_type4_2: { name: "バーナー出力", desc: "活力が高いが、すぐにお腹が空く", statBonus: { power: 2.2, intel: 0.8, mood: 1.2, beauty: 1.0, speed: 2.8 }, consumption: 1.8, lifespan: 80 },
    balloon_type4_3: { name: "超弩級浮力", desc: "圧倒的なパワーと素早さを持つが燃費激悪", statBonus: { power: 3.0, intel: 0.5, mood: 1.0, beauty: 1.2, speed: 3.5 }, consumption: 2.5, lifespan: 100 },
    balloon_type1: { name: "有毒ガス", desc: "能力はそこそこだが、機嫌が最悪", statBonus: { power: 1.0, intel: 1.0, mood: 0.1, beauty: 0.1, speed: 2.0 }, consumption: 0.8, lifespan: 70 },
    balloon_type1_2: { name: "浮遊機雷", desc: "活力と素早さが高いが、燃費が悪く短命", statBonus: { power: 2.5, intel: 0.5, mood: 0.1, beauty: 0.2, speed: 3.0 }, consumption: 1.5, lifespan: 50 },
    balloon_type1_3: { name: "破裂の恐怖", desc: "絶対に疲れないが、寿命が極端に短い", statBonus: { power: 3.0, intel: 1.5, mood: 0.1, beauty: 0.5, speed: 3.5 }, consumption: 0.0, lifespan: 20 },
    balloon_type5: { name: "ガス抜け", desc: "超燃費で長生きするが、とても遅い", statBonus: { power: 0.1, intel: 0.5, mood: 0.8, beauty: 0.8, speed: 0.3 }, consumption: 0.1, lifespan: 150 },
    balloon_type5_2: { name: "古代の熱源", desc: "非常に長寿で頑丈。怒ると手がつけられない", statBonus: { power: 1.5, intel: 1.0, mood: 0.5, beauty: 1.0, speed: 0.8 }, consumption: 0.4, lifespan: 180 },
    balloon_type3: { name: "上空観測", desc: "賢さが上がりやすい", statBonus: { power: 0.2, intel: 2.0, mood: 1.5, beauty: 1.2, speed: 1.5 }, consumption: 0.8, lifespan: 110 },
    balloon_type3_2: { name: "索敵レンズ", desc: "燃費が良く、賢さと素早さも高い", statBonus: { power: 0.1, intel: 2.2, mood: 1.2, beauty: 1.5, speed: 2.0 }, consumption: 0.7, lifespan: 120 },
    balloon_type3_3: { name: "全天候レーダー", desc: "非常に賢く、燃費も良い", statBonus: { power: 0.5, intel: 3.0, mood: 1.5, beauty: 1.8, speed: 2.2 }, consumption: 0.5, lifespan: 200 },

    // ---------- Ghost Evolutions ----------
    ghost_type2: { name: "癒やしの光", desc: "美しさが上がりやすく、燃費も良い", statBonus: { power: 0.3, intel: 1.5, mood: 2.0, beauty: 2.8, speed: 1.8 }, consumption: 0.5, lifespan: 70 },
    ghost_type2_2: { name: "後光", desc: "超燃費で、美しさが最高に上がる", statBonus: { power: 0.2, intel: 1.8, mood: 3.0, beauty: 3.5, speed: 2.0 }, consumption: 0.4, lifespan: 50 },
    ghost_type4: { name: "念動力", desc: "幽霊なのに活力が高いが燃費が悪い", statBonus: { power: 1.8, intel: 1.0, mood: 0.5, beauty: 0.8, speed: 2.0 }, consumption: 1.0, lifespan: 80 },
    ghost_type4_2: { name: "霊力圧縮装甲", desc: "高い活力と素早さを持つが、すぐ腹ペコになる", statBonus: { power: 2.8, intel: 0.8, mood: 0.2, beauty: 0.5, speed: 2.8 }, consumption: 2.0, lifespan: 60 },
    ghost_type5: { name: "長き未練", desc: "超燃費で、非常に長生きする", statBonus: { power: 0.5, intel: 1.5, mood: 0.8, beauty: 1.0, speed: 1.0 }, consumption: 0.3, lifespan: 300 },
    ghost_type5_2: { name: "不朽の呪縛", desc: "絶対に疲れないし、永遠に消えない", statBonus: { power: 0.2, intel: 1.2, mood: 0.5, beauty: 0.8, speed: 0.5 }, consumption: 0.0, lifespan: 9999 },
    ghost_type1: { name: "魂刈り", desc: "活力と素早さが高いが、機嫌が最悪", statBonus: { power: 1.5, intel: 1.5, mood: 0.1, beauty: 0.2, speed: 2.5 }, consumption: 0.8, lifespan: 50 },
    ghost_type1_2: { name: "死の宣告", desc: "絶対に疲れないが、破滅的な短命", statBonus: { power: 2.5, intel: 2.5, mood: 0.1, beauty: 0.5, speed: 3.5 }, consumption: 0.0, lifespan: 20 },
    ghost_type3: { name: "読書家", desc: "燃費が良く、賢さが上がりやすい", statBonus: { power: 0.2, intel: 2.2, mood: 1.0, beauty: 1.2, speed: 1.5 }, consumption: 0.5, lifespan: 80 },
    ghost_type3_2: { name: "精神感応", desc: "超燃費で、賢さと素早さが非常に高い", statBonus: { power: 0.3, intel: 2.5, mood: 1.2, beauty: 1.5, speed: 2.2 }, consumption: 0.4, lifespan: 90 },

    // ---------- Beetle Evolutions ----------
    beetle_type4: { name: "タイタン・ホーン", desc: "活力が異常に高いが、少し燃費が悪い", statBonus: { power: 2.8, intel: 0.1, mood: 1.0, beauty: 1.0, speed: 0.5 }, consumption: 1.0, lifespan: 90 },
    beetle_type5: { name: "老練な省エネ", desc: "超燃費で、長寿になる", statBonus: { power: 1.0, intel: 0.8, mood: 1.0, beauty: 1.0, speed: 0.5 }, consumption: 0.2, lifespan: 200 },
    beetle_type5_2: { name: "生きた化石", desc: "絶対に疲れず、永遠に生きる", statBonus: { power: 1.2, intel: 1.0, mood: 1.0, beauty: 1.2, speed: 0.2 }, consumption: 0.0, lifespan: 9999 },
    beetle_type2: { name: "宝石の輝き", desc: "美しく、機嫌がかなり上がりやすい", statBonus: { power: 1.0, intel: 0.8, mood: 2.0, beauty: 3.0, speed: 0.8 }, consumption: 1.0, lifespan: 100 },
    beetle_type2_2: { name: "月光浴", desc: "燃費が良く、美しさと機嫌が上がりやすい", statBonus: { power: 1.2, intel: 1.0, mood: 1.8, beauty: 3.2, speed: 1.0 }, consumption: 0.8, lifespan: 120 },
    beetle_type2_3: { name: "妖精の鱗粉", desc: "美しさが最高に上がり、燃費も良い", statBonus: { power: 0.5, intel: 1.5, mood: 2.8, beauty: 3.8, speed: 1.5 }, consumption: 0.7, lifespan: 150 },
    beetle_type2_4: { name: "神聖オーラ", desc: "超燃費で、バランス良く美しく育つ", statBonus: { power: 0.8, intel: 1.8, mood: 2.5, beauty: 3.5, speed: 1.2 }, consumption: 0.5, lifespan: 200 },
    beetle_type3: { name: "群れの指揮官", desc: "燃費が良く、賢さがかなり高い", statBonus: { power: 1.0, intel: 2.5, mood: 1.2, beauty: 1.0, speed: 1.0 }, consumption: 0.6, lifespan: 120 },
    beetle_type1: { name: "猛毒の顎", desc: "活力が高いが、機嫌が最悪で燃費も悪い", statBonus: { power: 2.5, intel: 1.0, mood: 0.1, beauty: 0.2, speed: 1.0 }, consumption: 1.2, lifespan: 60 },
    beetle_type4_2: { name: "巨神の怪力", desc: "超絶パワーと引き換えに、維持に膨大なエネルギーを要する", statBonus: { power: 4.5, intel: 0.2, mood: 1.2, beauty: 1.5, speed: 0.3 }, consumption: 1.3, lifespan: 90 },

    // ---------- Seed Evolutions ----------
    seed_type4: { name: "剛健なる根", desc: "活力が高いが、燃費が悪い", statBonus: { power: 1.8, intel: 0.5, mood: 1.0, beauty: 1.0, speed: 0.3 }, consumption: 1.2, natureHeal: true, lifespan: 100 },
    seed_type4_2: { name: "大地喰らい", desc: "圧倒的な活力を持つが、すぐ腹ペコになる", statBonus: { power: 2.8, intel: 0.5, mood: 0.8, beauty: 0.8, speed: 0.5 }, consumption: 1.8, natureHeal: true, lifespan: 150 },
    seed_type1: { name: "猛毒の茨", desc: "活力が高いが、機嫌が悪く短命", statBonus: { power: 1.5, intel: 1.0, mood: 0.1, beauty: 0.5, speed: 0.8 }, consumption: 0.8, natureHeal: true, lifespan: 70 },
    seed_type1_2: { name: "命の略奪", desc: "絶対に疲れないが、すぐ死ぬ", statBonus: { power: 2.5, intel: 1.5, mood: 0.1, beauty: 0.2, speed: 1.0 }, consumption: 0.0, natureHeal: true, lifespan: 40 },
    seed_type5: { name: "侘び寂び", desc: "超燃費で、長生きする", statBonus: { power: 0.8, intel: 1.2, mood: 1.2, beauty: 1.5, speed: 0.2 }, consumption: 0.1, natureHeal: true, lifespan: 300 },
    seed_type5_2: { name: "不朽の年輪", desc: "絶対に疲れず、永遠に生きる", statBonus: { power: 1.0, intel: 1.5, mood: 1.0, beauty: 2.0, speed: 0.0 }, consumption: 0.0, natureHeal: true, lifespan: 9999 },
    seed_type3: { name: "知識の葉", desc: "燃費が良く、賢さが上がりやすい", statBonus: { power: 0.5, intel: 2.0, mood: 1.2, beauty: 1.5, speed: 0.5 }, consumption: 0.6, natureHeal: true, lifespan: 150 },
    seed_type3_2: { name: "根系ネットワーク", desc: "燃費が良く、賢さも高い", statBonus: { power: 0.8, intel: 2.2, mood: 1.0, beauty: 1.8, speed: 0.6 }, consumption: 0.7, natureHeal: true, lifespan: 160 },
    seed_type3_3: { name: "全知の樹幹", desc: "超燃費で、極限の賢さを誇る", statBonus: { power: 1.5, intel: 3.5, mood: 1.5, beauty: 2.0, speed: 0.5 }, consumption: 0.5, natureHeal: true, lifespan: 500 },
    seed_type2: { name: "癒やしのアロマ", desc: "燃費が良く、美しさが上がりやすい", statBonus: { power: 0.5, intel: 1.0, mood: 2.0, beauty: 2.5, speed: 0.8 }, consumption: 0.6, natureHeal: true, lifespan: 120 },
    seed_type2_2: { name: "楽園の開花", desc: "超燃費で、美しさが最高に上がる", statBonus: { power: 0.2, intel: 1.5, mood: 3.0, beauty: 3.5, speed: 1.0 }, consumption: 0.4, natureHeal: true, lifespan: 250 },

    // ---------- Dragon Evolutions ----------
    dragon_type4: { name: "暴竜の逆鱗", desc: "活力と素早さが高いが、燃費が最悪", statBonus: { power: 2.5, intel: 1.0, mood: 0.5, beauty: 1.0, speed: 1.8 }, consumption: 2.0, lifespan: 250 },
    dragon_type4_2: { name: "天地崩壊", desc: "最強の活力を持つが、すぐガス欠になる", statBonus: { power: 4.0, intel: 1.0, mood: 0.1, beauty: 1.2, speed: 2.0 }, consumption: 3.5, lifespan: 200 },
    dragon_type1: { name: "瘴気ブレス", desc: "強力だが、機嫌が悪く燃費も悪い", statBonus: { power: 2.0, intel: 1.5, mood: 0.1, beauty: 0.5, speed: 1.5 }, consumption: 1.8, lifespan: 150 },
    dragon_type1_2: { name: "深淵の暴食", desc: "絶対に疲れないが、寿命が短い", statBonus: { power: 3.5, intel: 2.0, mood: 0.1, beauty: 0.2, speed: 2.2 }, consumption: 0.0, lifespan: 60 },
    dragon_type5: { name: "古竜のまどろみ", desc: "超燃費で、とても長生きする", statBonus: { power: 1.5, intel: 2.0, mood: 1.0, beauty: 1.5, speed: 0.8 }, consumption: 0.2, lifespan: 800 },
    dragon_type5_2: { name: "神話の化石", desc: "絶対に疲れず、永遠に生きる", statBonus: { power: 2.0, intel: 2.5, mood: 1.0, beauty: 2.0, speed: 0.5 }, consumption: 0.0, lifespan: 9999 },
    dragon_type3: { name: "星海の叡智", desc: "賢さがかなり高いが、少し燃費が悪い", statBonus: { power: 1.0, intel: 2.8, mood: 1.0, beauty: 1.8, speed: 1.2 }, consumption: 1.2, lifespan: 400 },
    dragon_type3_2: { name: "宇宙の真理", desc: "賢さが極限まで上がり、少し燃費が良い", statBonus: { power: 1.5, intel: 4.0, mood: 1.5, beauty: 2.5, speed: 1.5 }, consumption: 0.8, lifespan: 1000 },
    dragon_type2: { name: "魅惑の竜鳴", desc: "美しさが上がりやすいが、燃費は悪い", statBonus: { power: 0.5, intel: 1.5, mood: 2.5, beauty: 2.8, speed: 1.2 }, consumption: 1.0, lifespan: 300 },
    dragon_type2_2: { name: "神竜の加護", desc: "美しさが最高に上がり、燃費も良い", statBonus: { power: 1.0, intel: 2.0, mood: 3.5, beauty: 3.5, speed: 1.5 }, consumption: 0.5, lifespan: 800 },
    dragon_type2_3: { name: "極光の幻影", desc: "超燃費で、美しさと機嫌が極めて高い", statBonus: { power: 0.1, intel: 2.5, mood: 3.0, beauty: 4.0, speed: 1.8 }, consumption: 0.2, lifespan: 500 }
};

const translations = { 
    ja: { gen: "世代", age: "年齢", energy: "体力", hunger: "満腹", intel: "賢さ", power: "活力", mood: "機嫌", beauty: "美しさ", speed: "素早さ", type: "性格", gold: "所持金", trait: "特性", weather: "天気", time: "日時" }, 
    en: { gen: "GEN", age: "AGE", energy: "ENERGY", hunger: "HUNGER", intel: "INTEL", power: "POWER", mood: "MOOD", beauty: "BEAUTY", speed: "SPEED", type: "TYPE", gold: "GOLD", trait: "TRAIT", weather: "WEATHER", time: "TIME" } 
};

const personalityQuestions = [
    {
        text: "Q1. 新しいゲームを始めた時、最初にどうする？",
        choices: [
            { text: "とりあえず説明書やチュートリアルを隅々まで読む", points: { robot: 2, machine: 2, magician: 1 } },
            { text: "直感で操作しながらガンガン進める", points: { dragon: 2, bird: 2, beetle: 1 } },
            { text: "マップの端から端まで探索してみる", points: { spirit: 2, ghost: 1, balloon: 1 } },
            { text: "ひたすらレベル上げや素材集めをする", points: { stone: 2, seed: 2, beetle: 1 } }
        ]
    },
    {
        text: "Q2. 目の前に「絶対に開けてはいけない箱」がある。",
        choices: [
            { text: "罠がないか道具を使って慎重に調べる", points: { machine: 2, robot: 1, stone: 1 } },
            { text: "何が起こるかワクワクしてすぐに開ける！", points: { balloon: 2, bird: 2, dragon: 1 } },
            { text: "魔法や特殊な力で遠くから安全に開ける", points: { magician: 2, spirit: 1, ghost: 2 } },
            { text: "言いつけを守って見なかったことにする", points: { seed: 2, beetle: 2, stone: 1 } }
        ]
    },
    {
        text: "Q3. 休日、突然予定が空いてしまった。どう過ごす？",
        choices: [
            { text: "家で趣味やプログラミング、作業に没頭する", points: { robot: 3, machine: 1 } },
            { text: "ふらっと外に出て自然や景色を楽しむ", points: { spirit: 2, seed: 2, bird: 1 } },
            { text: "誰かを誘ってワイワイ遊びに行く", points: { magician: 2, balloon: 2 } },
            { text: "とにかく寝る。ひたすら休む", points: { ghost: 2, stone: 2, beetle: 1 } }
        ]
    },
    {
        text: "Q4. もし、1つだけ超能力が使えるとしたら？",
        choices: [
            { text: "どんな計算も一瞬で解ける超頭脳", points: { robot: 2, machine: 2, magician: 1 } },
            { text: "空を自由に飛べる能力", points: { bird: 3, balloon: 1, dragon: 1 } },
            { text: "姿を消して、どこへでも忍び込める能力", points: { ghost: 3, spirit: 1 } },
            { text: "どんな重いものも持ち上げられる怪力", points: { stone: 2, dragon: 2, beetle: 1 } }
        ]
    },
    {
        text: "Q5. この「AI育成ゲーム」に一番期待していることは？",
        choices: [
            { text: "可愛い・カッコいいキャラクターを愛でたい", points: { spirit: 2, balloon: 2, magician: 1 } },
            { text: "効率よくお金や素材を稼いで最強を目指したい", points: { dragon: 2, machine: 2, stone: 1 } },
            { text: "AIが勝手に生活する様子をのんびり観察したい", points: { seed: 2, ghost: 2, beetle: 2 } },
            { text: "システムや進化の仕組みの裏側を解き明かしたい", points: { robot: 2, magician: 2, bird: 1 } }
        ]
    }
];

const initialBaseStats = { robot: { intel: 15, power: 20, mood: 100 }, spirit: { intel: 10, power: 10, mood: 100 }, magician: { intel: 25, power: 5, mood: 100 }, beetle: { intel: 5, power: 30, mood: 100 }, seed: { intel: 10, power: 10, mood: 100 }, dragon: { intel: 20, power: 25, mood: 100 }, bird: { intel: 15, power: 15, mood: 100 }, machine: { intel: 10, power: 15, mood: 100 }, stone: { intel: 5, power: 35, mood: 100 }, balloon: { intel: 15, power: 5, mood: 100 }, ghost: { intel: 30, power: 5, mood: 100 } };
const buildingCatalog = { 
  farm: { name: "畑", reqIntel: 0, reqBuildLevel: 1, cost: { energy: 30 }, materials: {} },
  hut: { name: "小屋", reqIntel: 15, reqBuildLevel: 1, cost: { energy: 40 }, materials: { wood: 5, stone: 2 }, maxDurability: 10 },
  bridge: { name: "橋", reqIntel: 20, reqBuildLevel: 2, cost: { energy: 20 }, materials: { wood: 3 }, onWater: true },
  restaurant: { name: "レストラン", reqIntel: 40, reqBuildLevel: 3, cost: { energy: 50 }, materials: { stone: 5, wood: 5 }, breakChance: 0.001 },
  shop: { name: "ショップ", reqIntel: 45, reqBuildLevel: 4, cost: { energy: 40 }, materials: { stone: 5, wood: 3 }, breakChance: 0.001 },
  blacksmith: { name: "鍛冶屋", reqIntel: 50, reqBuildLevel: 5, cost: { energy: 60 }, materials: { stone: 10, iron: 5 }, breakChance: 0.001 },
  casino: { name: "カジノ", reqIntel: 80, reqBuildLevel: 6, cost: { energy: 80 }, materials: { stone: 10, wood: 10, coin: 5 }, breakChance: 0.0005 },
  castle: { name: "お城", reqIntel: 100, reqBuildLevel: 8, cost: { energy: 90 }, materials: { stone: 20, wood: 10, iron: 5 }, breakChance: 0.0005 },
  // ★追加：カードショップ（カジノ来店フラグが必要。クリスタル迷宮25Fの素材を要求）
  card_shop: { name: "カード屋", reqIntel: 120, reqBuildLevel: 9, cost: { energy: 90 }, materials: { stone: 20, wood: 20, mat_card_1: 1 }, breakChance: 0.0005, reqFlag: 'visitedCasino' } };
const recipeCatalog = [ { id: 'dish_salad', name: "フレッシュサラダ", ingredients: { carrot: 1, tomato: 1 } }, { id: 'dish_stirfry', name: "野菜炒め", ingredients: { carrot: 1, pepper: 1 } }, { id: 'dish_soup', name: "ミネストローネ", ingredients: { tomato: 1, pepper: 1 } }, { id: 'baked_carrot', name: "焼きニンジン", ingredients: { carrot: 1 }, type: 'simple' }, { id: 'baked_pepper', name: "焼きピーマン", ingredients: { pepper: 1 }, type: 'simple' }, { id: 'baked_tomato', name: "焼きトマト", ingredients: { tomato: 1 }, type: 'simple' }, { id: 'baked_fish', name: "焼き魚", ingredients: { fish: 1 }, type: 'simple' } ];
const craftCatalog = [ { id: 'eq_sword', name: "鉄の剣", materials: { iron: 5, wood: 2 } }, { id: 'eq_shield', name: "鉄の盾", materials: { iron: 4, stone: 4 } }, { id: 'eq_staff', name: "魔法の杖", materials: { wood: 5, crystal: 1 } }, { id: 'eq_crown', name: "王冠", materials: { coin: 5, crystal: 2 } }, { id: 'tool_pan', name: "フライパン", materials: { iron: 2, wood: 1 } } ];
const actionTypes = ['idle', 'move', 'study', 'train', 'sleep', 'eat_dish', 'eat_raw', 'fish', 'cook', 'smith', 'farm_plow', 'farm_seed', 'farm_water', 'farm_pest', 'farm_harvest'];

function createDefaultFrames() { let actions = {}; actionTypes.forEach((act, i) => { let BaseY = i * 300; actions[act] = [{sx:0,sy:BaseY,sw:300,sh:300},{sx:300,sy:BaseY,sw:300,sh:300},{sx:600,sy:BaseY,sw:300,sh:300}]; }); return actions; }

const mapChipConfigs = {
    "field": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "terrain": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "castle_build": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "field_3": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "field_4": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "field_5": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "field_6": { scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "farm_grow": { img: "field_3", scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } },
    "farm_max": { img: "field_3", scale: 1.0, actions: { idle: [{ sx: 0, sy: 0, sw: 300, sh: 300 }] } }
};

// ==========================================
// ★進化ツリーも同じIDに大統一
// ==========================================
const evolutionRequirements = {
    // Robot Tree
    "robot": [
        { next: "robot_type3", name: "賢さ進化", req: { intel: 100 } },
        { next: "robot_type3_2", name: "賢さ進化B", req: { intel: 100 } },
        { next: "robot_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "robot_type4", name: "活力進化", req: { power: 100 } },
        { next: "robot_type4_2", name: "活力進化B", req: { power: 100 } },
        { next: "robot_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "robot_type5", name: "老化進化", req: { old: true } }
    ],
    "robot_type3": [
        { next: "robot_type3_3", name: "賢さ2段A", req: { intel: 200 } },
        { next: "robot_type3_4", name: "賢さ2段B", req: { intel: 200 } },
        { next: "robot_type3_5", name: "賢さ2段C", req: { intel: 200 } }
    ],
    "robot_type3_2": [
        { next: "robot_type3_3", name: "賢さ2段A", req: { intel: 200 } },
        { next: "robot_type3_4", name: "賢さ2段B", req: { intel: 200 } },
        { next: "robot_type3_5", name: "賢さ2段C", req: { intel: 200 } }
    ],
    "robot_type2": [
        { next: "robot_type2_2", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "robot_type2_3", name: "美しさ2段B", req: { beauty: 200 } },
        { next: "robot_type2_4", name: "美しさ2段C", req: { beauty: 200 } }
    ],
    "robot_type4": [
        { next: "robot_type4_3", name: "活力2段A", req: { power: 200 } },
        { next: "robot_type4_4", name: "活力2段B", req: { power: 200 } }
    ],
    "robot_type4_2": [
        { next: "robot_type4_3", name: "活力2段A", req: { power: 200 } },
        { next: "robot_type4_4", name: "活力2段B", req: { power: 200 } }
    ],
    "robot_type1": [
        { next: "robot_type1_2", name: "闇落ち2段A", req: { dark: 50 } },
        { next: "robot_type1_3", name: "闇落ち2段B", req: { dark: 50 } }
    ],
    "robot_type5": [
        { next: "robot_type5_2", name: "老化2段A", req: { old: true } },
        { next: "robot_type5_3", name: "老化2段B", req: { old: true } },
        { next: "robot_type5_4", name: "老化2段C", req: { old: true } }
    ],

    // Spirit Tree
    "spirit": [
        { next: "spirit_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "spirit_type4", name: "活力進化", req: { power: 100 } },
        { next: "spirit_type5", name: "老化進化", req: { old: true } },
        { next: "spirit_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "spirit_type3", name: "賢さ進化", req: { intel: 100 } }
    ],
    "spirit_type2": [
        { next: "spirit_type2_2", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "spirit_type2_3", name: "美しさ2段B", req: { beauty: 200 } }
    ],
    "spirit_type4": [
        { next: "spirit_type4_2", name: "活力2段A", req: { power: 200 } },
        { next: "spirit_type4_3", name: "活力2段B", req: { power: 200 } }
    ],
    "spirit_type5": [
        { next: "spirit_type5_2", name: "老化2段A", req: { old: true } },
        { next: "spirit_type5_3", name: "老化2段B", req: { old: true } }
    ],
    "spirit_type1": [ { next: "spirit_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "spirit_type3": [ { next: "spirit_type3_2", name: "賢さ2段", req: { intel: 200 } } ],

    // Magician Tree
    "magician": [
        { next: "magician_type4", name: "活力進化A", req: { power: 100 } },
        { next: "magician_type4_2", name: "活力進化B", req: { power: 100 } },
        { next: "magician_type1", name: "闇落ち進化A", req: { dark: 20 } },
        { next: "magician_type1_2", name: "闇落ち進化B", req: { dark: 20 } },
        { next: "magician_type5", name: "老化進化", req: { old: true } },
        { next: "magician_type2", name: "美しさ進化A", req: { beauty: 100 } },
        { next: "magician_type2_2", name: "美しさ進化B", req: { beauty: 100 } },
        { next: "magician_type3", name: "賢さ進化", req: { intel: 100 } }
    ],
    "magician_type4": [
        { next: "magician_type4_3", name: "活力2段A", req: { power: 200 } },
        { next: "magician_type4_4", name: "活力2段B", req: { power: 200 } }
    ],
    "magician_type4_2": [
        { next: "magician_type4_3", name: "活力2段A", req: { power: 200 } },
        { next: "magician_type4_4", name: "活力2段B", req: { power: 200 } }
    ],
    "magician_type1": [
        { next: "magician_type1_3", name: "闇落ち2段A", req: { dark: 50 } },
        { next: "magician_type1_4", name: "闇落ち2段B", req: { dark: 50 } }
    ],
    "magician_type1_2": [
        { next: "magician_type1_3", name: "闇落ち2段A", req: { dark: 50 } },
        { next: "magician_type1_4", name: "闇落ち2段B", req: { dark: 50 } }
    ],
    "magician_type5": [
        { next: "magician_type5_2", name: "老化2段A", req: { old: true } },
        { next: "magician_type5_3", name: "老化2段B", req: { old: true } }
    ],
    "magician_type2": [
        { next: "magician_type2_3", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "magician_type2_4", name: "美しさ2段B", req: { beauty: 200 } }
    ],
    "magician_type2_2": [
        { next: "magician_type2_3", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "magician_type2_4", name: "美しさ2段B", req: { beauty: 200 } }
    ],
    "magician_type3": [
        { next: "magician_type3_2", name: "賢さ2段A", req: { intel: 200 } },
        { next: "magician_type3_3", name: "賢さ2段B", req: { intel: 200 } }
    ],

    // Bird Tree
    "bird": [
        { next: "bird_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "bird_type4", name: "活力進化", req: { power: 100 } },
        { next: "bird_type5", name: "老化進化", req: { old: true } },
        { next: "bird_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "bird_type3", name: "賢さ進化A", req: { intel: 100 } },
        { next: "bird_type3_2", name: "賢さ進化B", req: { intel: 100 } }
    ],
    "bird_type2": [ { next: "bird_type2_2", name: "美しさ2段", req: { beauty: 200 } } ],
    "bird_type4": [ { next: "bird_type4_2", name: "活力2段", req: { power: 200 } } ],
    "bird_type5": [ { next: "bird_type5_2", name: "老化2段", req: { old: true } } ],
    "bird_type1": [ { next: "bird_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "bird_type3": [ { next: "bird_type3_3", name: "賢さ2段", req: { intel: 200 } } ],
    "bird_type3_2": [ { next: "bird_type3_3", name: "賢さ2段", req: { intel: 200 } } ],

    // Machine Tree
    "machine": [
        { next: "machine_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "machine_type4", name: "活力進化", req: { power: 100 } },
        { next: "machine_type5", name: "老化進化", req: { old: true } },
        { next: "machine_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "machine_type3", name: "賢さ進化", req: { intel: 100 } }
    ],
    "machine_type2": [ { next: "machine_type2_2", name: "美しさ2段", req: { beauty: 200 } } ],
    "machine_type4": [ { next: "machine_type4_2", name: "活力2段", req: { power: 200 } } ],
    "machine_type5": [
        { next: "machine_type5_2", name: "老化2段A", req: { old: true } },
        { next: "machine_type5_3", name: "老化2段B", req: { old: true } }
    ],
    "machine_type1": [ { next: "machine_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "machine_type3": [ { next: "machine_type3_2", name: "賢さ2段", req: { intel: 200 } } ],

    // Stone Tree
    "stone": [
        { next: "stone_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "stone_type4", name: "活力進化A", req: { power: 100 } },
        { next: "stone_type4_2", name: "活力進化B", req: { power: 100 } },
        { next: "stone_type5", name: "老化進化", req: { old: true } },
        { next: "stone_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "stone_type3", name: "賢さ進化", req: { intel: 100 } }
    ],
    "stone_type2": [ { next: "stone_type2_2", name: "美しさ2段", req: { beauty: 200 } } ],
    "stone_type4": [ { next: "stone_type4_3", name: "活力2段", req: { power: 200 } } ],
    "stone_type4_2": [ { next: "stone_type4_3", name: "活力2段", req: { power: 200 } } ],
    "stone_type5": [
        { next: "stone_type5_2", name: "老化2段A", req: { old: true } },
        { next: "stone_type5_3", name: "老化2段B", req: { old: true } }
    ],
    "stone_type1": [ { next: "stone_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "stone_type3": [ { next: "stone_type3_2", name: "賢さ2段", req: { intel: 200 } } ],

    // Balloon Tree
    "balloon": [
        { next: "balloon_type2", name: "美しさ進化A", req: { beauty: 100 } },
        { next: "balloon_type2_2", name: "美しさ進化B", req: { beauty: 100 } },
        { next: "balloon_type4", name: "活力進化A", req: { power: 100 } },
        { next: "balloon_type4_2", name: "活力進化B", req: { power: 100 } },
        { next: "balloon_type1", name: "闇落ち進化A", req: { dark: 20 } },
        { next: "balloon_type1_2", name: "闇落ち進化B", req: { dark: 20 } },
        { next: "balloon_type5", name: "老化進化", req: { old: true } },
        { next: "balloon_type3", name: "賢さ進化A", req: { intel: 100 } },
        { next: "balloon_type3_2", name: "賢さ進化B", req: { intel: 100 } }
    ],
    "balloon_type2": [ { next: "balloon_type2_3", name: "美しさ2段", req: { beauty: 200 } } ],
    "balloon_type2_2": [ { next: "balloon_type2_3", name: "美しさ2段", req: { beauty: 200 } } ],
    "balloon_type4": [ { next: "balloon_type4_3", name: "活力2段", req: { power: 200 } } ],
    "balloon_type4_2": [ { next: "balloon_type4_3", name: "活力2段", req: { power: 200 } } ],
    "balloon_type5": [ { next: "balloon_type5_2", name: "老化2段", req: { old: true } } ],
    "balloon_type1": [ { next: "balloon_type1_3", name: "闇落ち2段", req: { dark: 50 } } ],
    "balloon_type1_2": [ { next: "balloon_type1_3", name: "闇落ち2段", req: { dark: 50 } } ],
    "balloon_type3": [ { next: "balloon_type3_3", name: "賢さ2段", req: { intel: 200 } } ],
    "balloon_type3_2": [ { next: "balloon_type3_3", name: "賢さ2段", req: { intel: 200 } } ],

    // Ghost Tree
    "ghost": [
        { next: "ghost_type2", name: "美しさ進化", req: { beauty: 100 } },
        { next: "ghost_type4", name: "活力進化", req: { power: 100 } },
        { next: "ghost_type5", name: "老化進化", req: { old: true } },
        { next: "ghost_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "ghost_type3", name: "賢さ進化A", req: { intel: 100 } },
        { next: "ghost_type3_2", name: "賢さ進化B", req: { intel: 100 } }
    ],
    "ghost_type2": [ { next: "ghost_type2_2", name: "美しさ2段", req: { beauty: 200 } } ],
    "ghost_type4": [ { next: "ghost_type4_2", name: "活力2段", req: { power: 200 } } ],
    "ghost_type5": [ { next: "ghost_type5_2", name: "老化2段", req: { old: true } } ],
    "ghost_type1": [ { next: "ghost_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "ghost_type3": [ { next: "ghost_type3_3", name: "賢さ2段", req: { intel: 200 } } ],
    "ghost_type3_2": [ { next: "ghost_type3_3", name: "賢さ2段", req: { intel: 200 } } ],

    // Beetle Tree
    "beetle": [
        { next: "beetle_type4", name: "活力進化", req: { power: 100 } },
        { next: "beetle_type5", name: "老化進化", req: { old: true } },
        { next: "beetle_type2", name: "美しさ進化A", req: { beauty: 100 } },
        { next: "beetle_type2_2", name: "美しさ進化B", req: { beauty: 100 } },
        { next: "beetle_type3", name: "賢さ進化", req: { intel: 100 } },
        { next: "beetle_type1", name: "闇落ち進化", req: { dark: 20 } }
    ],
    "beetle_type4": [ { next: "beetle_type4_2", name: "活力2段", req: { power: 200 } } ],
    "beetle_type5": [ { next: "beetle_type5_2", name: "老化2段", req: { old: true } } ],
    "beetle_type2": [
        { next: "beetle_type2_3", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "beetle_type2_4", name: "美しさ2段B", req: { beauty: 200 } }
    ],
    "beetle_type2_2": [
        { next: "beetle_type2_3", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "beetle_type2_4", name: "美しさ2段B", req: { beauty: 200 } }
    ],

    // Seed Tree
    "seed": [
        { next: "seed_type4", name: "活力進化", req: { power: 100 } },
        { next: "seed_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "seed_type5", name: "老化進化", req: { old: true } },
        { next: "seed_type3", name: "賢さ進化A", req: { intel: 100 } },
        { next: "seed_type3_2", name: "賢さ進化B", req: { intel: 100 } },
        { next: "seed_type2", name: "美しさ進化", req: { beauty: 100 } }
    ],
    "seed_type4": [ { next: "seed_type4_2", name: "活力2段", req: { power: 200 } } ],
    "seed_type1": [ { next: "seed_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "seed_type5": [ { next: "seed_type5_2", name: "老化2段", req: { old: true } } ],
    "seed_type3": [ { next: "seed_type3_3", name: "賢さ2段", req: { intel: 200 } } ],
    "seed_type3_2": [ { next: "seed_type3_3", name: "賢さ2段", req: { intel: 200 } } ],
    "seed_type2": [ { next: "seed_type2_2", name: "美しさ2段", req: { beauty: 200 } } ],

    // Dragon Tree
    "dragon": [
        { next: "dragon_type4", name: "活力進化", req: { power: 100 } },
        { next: "dragon_type1", name: "闇落ち進化", req: { dark: 20 } },
        { next: "dragon_type5", name: "老化進化", req: { old: true } },
        { next: "dragon_type3", name: "賢さ進化", req: { intel: 100 } },
        { next: "dragon_type2", name: "美しさ進化", req: { beauty: 100 } }
    ],
    "dragon_type4": [ { next: "dragon_type4_2", name: "活力2段", req: { power: 200 } } ],
    "dragon_type1": [ { next: "dragon_type1_2", name: "闇落ち2段", req: { dark: 50 } } ],
    "dragon_type5": [ { next: "dragon_type5_2", name: "老化2段", req: { old: true } } ],
    "dragon_type3": [ { next: "dragon_type3_2", name: "賢さ2段", req: { intel: 200 } } ],
    "dragon_type2": [
        { next: "dragon_type2_2", name: "美しさ2段A", req: { beauty: 200 } },
        { next: "dragon_type2_3", name: "美しさ2段B", req: { beauty: 200 } }
    ]
};

// ★全キャラクターのアニメーション設定 (手作業で合わせた大事な座標データを保護！)
const defaultAiConfigs = {
    "spirit": {
    "img": "spirit",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_action",
      "eat_raw": "spirit_action",
      "fish": "spirit_action",
      "cook": "spirit_action",
      "smith": "spirit_action",
      "farm_plow": "spirit_action_farm",
      "farm_seed": "spirit_action_farm",
      "farm_water": "spirit_action_farm",
      "farm_pest": "spirit_action_farm",
      "farm_harvest": "spirit_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "robot": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_action",
      "eat_raw": "robot_action",
      "fish": "robot_action",
      "cook": "robot_action",
      "smith": "robot_action",
      "farm_plow": "robot_action_farm",
      "farm_seed": "robot_action_farm",
      "farm_water": "robot_action_farm",
      "farm_pest": "robot_action_farm",
      "farm_harvest": "robot_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 804,
          "sy": 75,
          "sw": 194,
          "sh": 314
        },
        {
          "sx": 1306,
          "sy": 75,
          "sw": 194,
          "sh": 314
        },
        {
          "sx": 1803,
          "sy": 75,
          "sw": 194,
          "sh": 314
        }
      ],
      "move": [
        {
          "sx": 781,
          "sy": 402,
          "sw": 242,
          "sh": 292
        },
        {
          "sx": 1291,
          "sy": 402,
          "sw": 232,
          "sh": 292
        },
        {
          "sx": 1785,
          "sy": 402,
          "sw": 242,
          "sh": 292
        }
      ],
      "study": [
        {
          "sx": 812,
          "sy": 716,
          "sw": 207,
          "sh": 237
        },
        {
          "sx": 1314,
          "sy": 716,
          "sw": 207,
          "sh": 237
        },
        {
          "sx": 1812,
          "sy": 716,
          "sw": 207,
          "sh": 237
        }
      ],
      "train": [
        {
          "sx": 745,
          "sy": 975,
          "sw": 352,
          "sh": 234
        },
        {
          "sx": 1235,
          "sy": 970,
          "sw": 352,
          "sh": 238
        },
        {
          "sx": 1718,
          "sy": 969,
          "sw": 352,
          "sh": 237
        }
      ],
      "sleep": [
        {
          "sx": 742,
          "sy": 1286,
          "sw": 357,
          "sh": 149
        },
        {
          "sx": 1219,
          "sy": 1286,
          "sw": 361,
          "sh": 149
        },
        {
          "sx": 1705,
          "sy": 1286,
          "sw": 357,
          "sh": 149
        }
      ],
      "eat_dish": [
        {
          "sx": 824,
          "sy": 68,
          "sw": 308,
          "sh": 319
        },
        {
          "sx": 1290,
          "sy": 68,
          "sw": 308,
          "sh": 319
        },
        {
          "sx": 1748,
          "sy": 68,
          "sw": 311,
          "sh": 319
        }
      ],
      "eat_raw": [
        {
          "sx": 837,
          "sy": 390,
          "sw": 223,
          "sh": 306
        },
        {
          "sx": 1313,
          "sy": 391,
          "sw": 214,
          "sh": 306
        },
        {
          "sx": 1770,
          "sy": 390,
          "sw": 207,
          "sh": 306
        }
      ],
      "fish": [
        {
          "sx": 776,
          "sy": 700,
          "sw": 365,
          "sh": 254
        },
        {
          "sx": 1242,
          "sy": 700,
          "sw": 365,
          "sh": 254
        },
        {
          "sx": 1708,
          "sy": 700,
          "sw": 365,
          "sh": 254
        }
      ],
      "cook": [
        {
          "sx": 813,
          "sy": 961,
          "sw": 329,
          "sh": 255
        },
        {
          "sx": 1277,
          "sy": 961,
          "sw": 329,
          "sh": 255
        },
        {
          "sx": 1743,
          "sy": 963,
          "sw": 329,
          "sh": 255
        }
      ],
      "smith": [
        {
          "sx": 799,
          "sy": 1218,
          "sw": 333,
          "sh": 261
        },
        {
          "sx": 1267,
          "sy": 1219,
          "sw": 333,
          "sh": 261
        },
        {
          "sx": 1730,
          "sy": 1219,
          "sw": 333,
          "sh": 261
        }
      ],
      "farm_plow": [
        {
          "sx": 746,
          "sy": 63,
          "sw": 436,
          "sh": 325
        },
        {
          "sx": 1252,
          "sy": 63,
          "sw": 436,
          "sh": 325
        },
        {
          "sx": 1749,
          "sy": 63,
          "sw": 436,
          "sh": 325
        }
      ],
      "farm_seed": [
        {
          "sx": 760,
          "sy": 394,
          "sw": 388,
          "sh": 296
        },
        {
          "sx": 1264,
          "sy": 394,
          "sw": 388,
          "sh": 296
        },
        {
          "sx": 1760,
          "sy": 394,
          "sw": 388,
          "sh": 296
        }
      ],
      "farm_water": [
        {
          "sx": 764,
          "sy": 691,
          "sw": 402,
          "sh": 275
        },
        {
          "sx": 1270,
          "sy": 691,
          "sw": 402,
          "sh": 275
        },
        {
          "sx": 1766,
          "sy": 691,
          "sw": 402,
          "sh": 275
        }
      ],
      "farm_pest": [
        {
          "sx": 747,
          "sy": 973,
          "sw": 437,
          "sh": 242
        },
        {
          "sx": 1259,
          "sy": 973,
          "sw": 437,
          "sh": 242
        },
        {
          "sx": 1758,
          "sy": 973,
          "sw": 437,
          "sh": 242
        }
      ],
      "farm_harvest": [
        {
          "sx": 819,
          "sy": 1220,
          "sw": 328,
          "sh": 257
        },
        {
          "sx": 1324,
          "sy": 1220,
          "sw": 328,
          "sh": 257
        },
        {
          "sx": 1820,
          "sy": 1220,
          "sw": 328,
          "sh": 257
        }
      ]
    }
  },
  "magician": {
    "scale": 0.15000000000000002,
    "actionImages": {
      "cook": "magician_action",
      "smith": "magician_action",
      "eat_dish": "magician_action",
      "eat_raw": "magician_action",
      "fish": "magician_action",
      "farm_plow": "magician_action_farm",
      "farm_water": "magician_action_farm",
      "farm_seed": "magician_action_farm",
      "farm_harvest": "magician_action_farm",
      "farm_pest": "magician_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 122,
          "sy": 119,
          "sw": 288,
          "sh": 347
        },
        {
          "sx": 651,
          "sy": 112,
          "sw": 288,
          "sh": 353
        },
        {
          "sx": 1192,
          "sy": 112,
          "sw": 288,
          "sh": 353
        }
      ],
      "move": [
        {
          "sx": 122,
          "sy": 619,
          "sw": 288,
          "sh": 369
        },
        {
          "sx": 651,
          "sy": 619,
          "sw": 288,
          "sh": 369
        },
        {
          "sx": 1189,
          "sy": 619,
          "sw": 288,
          "sh": 369
        }
      ],
      "study": [
        {
          "sx": 113,
          "sy": 1143,
          "sw": 300,
          "sh": 369
        },
        {
          "sx": 644,
          "sy": 1143,
          "sw": 300,
          "sh": 369
        },
        {
          "sx": 1180,
          "sy": 1143,
          "sw": 300,
          "sh": 369
        }
      ],
      "train": [
        {
          "sx": 73,
          "sy": 1669,
          "sw": 401,
          "sh": 373
        },
        {
          "sx": 606,
          "sy": 1662,
          "sw": 401,
          "sh": 378
        },
        {
          "sx": 1140,
          "sy": 1662,
          "sw": 401,
          "sh": 378
        }
      ],
      "sleep": [
        {
          "sx": 62,
          "sy": 2314,
          "sw": 409,
          "sh": 223
        },
        {
          "sx": 594,
          "sy": 2314,
          "sw": 409,
          "sh": 223
        },
        {
          "sx": 1128,
          "sy": 2314,
          "sw": 409,
          "sh": 223
        }
      ],
      "eat_dish": [
        {
          "sx": 114,
          "sy": 104,
          "sw": 365,
          "sh": 424
        },
        {
          "sx": 643,
          "sy": 104,
          "sw": 365,
          "sh": 424
        },
        {
          "sx": 1174,
          "sy": 104,
          "sw": 365,
          "sh": 424
        }
      ],
      "eat_raw": [
        {
          "sx": 132,
          "sy": 620,
          "sw": 284,
          "sh": 403
        },
        {
          "sx": 659,
          "sy": 620,
          "sw": 284,
          "sh": 403
        },
        {
          "sx": 1190,
          "sy": 620,
          "sw": 284,
          "sh": 403
        }
      ],
      "fish": [
        {
          "sx": 67,
          "sy": 1145,
          "sw": 443,
          "sh": 411
        },
        {
          "sx": 599,
          "sy": 1145,
          "sw": 443,
          "sh": 411
        },
        {
          "sx": 1130,
          "sy": 1145,
          "sw": 443,
          "sh": 411
        }
      ],
      "cook": [
        {
          "sx": 117,
          "sy": 1666,
          "sw": 399,
          "sh": 399
        },
        {
          "sx": 648,
          "sy": 1666,
          "sw": 399,
          "sh": 399
        },
        {
          "sx": 1178,
          "sy": 1666,
          "sw": 399,
          "sh": 399
        }
      ],
      "smith": [
        {
          "sx": 101,
          "sy": 2166,
          "sw": 371,
          "sh": 390
        },
        {
          "sx": 629,
          "sy": 2166,
          "sw": 371,
          "sh": 390
        },
        {
          "sx": 1159,
          "sy": 2166,
          "sw": 371,
          "sh": 390
        }
      ],
      "farm_plow": [
        {
          "sx": 122,
          "sy": 81,
          "sw": 379,
          "sh": 381
        },
        {
          "sx": 649,
          "sy": 81,
          "sw": 379,
          "sh": 381
        },
        {
          "sx": 1158,
          "sy": 81,
          "sw": 379,
          "sh": 381
        }
      ],
      "farm_seed": [
        {
          "sx": 122,
          "sy": 611,
          "sw": 287,
          "sh": 381
        },
        {
          "sx": 650,
          "sy": 611,
          "sw": 287,
          "sh": 381
        },
        {
          "sx": 1186,
          "sy": 611,
          "sw": 287,
          "sh": 381
        }
      ],
      "farm_water": [
        {
          "sx": 122,
          "sy": 1143,
          "sw": 287,
          "sh": 381
        },
        {
          "sx": 649,
          "sy": 1143,
          "sw": 287,
          "sh": 381
        },
        {
          "sx": 1184,
          "sy": 1143,
          "sw": 287,
          "sh": 381
        }
      ],
      "farm_pest": [
        {
          "sx": 48,
          "sy": 1674,
          "sw": 453,
          "sh": 396
        },
        {
          "sx": 618,
          "sy": 1674,
          "sw": 428,
          "sh": 396
        },
        {
          "sx": 1117,
          "sy": 1674,
          "sw": 468,
          "sh": 396
        }
      ],
      "farm_harvest": [
        {
          "sx": 102,
          "sy": 2185,
          "sw": 308,
          "sh": 390
        },
        {
          "sx": 620,
          "sy": 2185,
          "sw": 308,
          "sh": 390
        },
        {
          "sx": 1176,
          "sy": 2185,
          "sw": 337,
          "sh": 390
        }
      ]
    }
  },
  "machine": {
    "img": "machine",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "machine_action",
      "eat_raw": "machine_action",
      "fish": "machine_action",
      "cook": "machine_action",
      "smith": "machine_action",
      "farm_plow": "machine_action_farm",
      "farm_seed": "machine_action_farm",
      "farm_water": "machine_action_farm",
      "farm_pest": "machine_action_farm",
      "farm_harvest": "machine_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 123,
          "sy": 19,
          "sw": 349,
          "sh": 407
        },
        {
          "sx": 810,
          "sy": 19,
          "sw": 349,
          "sh": 407
        },
        {
          "sx": 1498,
          "sy": 19,
          "sw": 349,
          "sh": 407
        }
      ],
      "move": [
        {
          "sx": 132,
          "sy": 467,
          "sw": 343,
          "sh": 407
        },
        {
          "sx": 824,
          "sy": 467,
          "sw": 343,
          "sh": 407
        },
        {
          "sx": 1509,
          "sy": 467,
          "sw": 343,
          "sh": 407
        }
      ],
      "study": [
        {
          "sx": 132,
          "sy": 932,
          "sw": 386,
          "sh": 347
        },
        {
          "sx": 815,
          "sy": 932,
          "sw": 386,
          "sh": 347
        },
        {
          "sx": 1504,
          "sy": 932,
          "sw": 386,
          "sh": 347
        }
      ],
      "train": [
        {
          "sx": 129,
          "sy": 1325,
          "sw": 434,
          "sh": 368
        },
        {
          "sx": 813,
          "sy": 1309,
          "sw": 434,
          "sh": 382
        },
        {
          "sx": 1498,
          "sy": 1309,
          "sw": 434,
          "sh": 382
        }
      ],
      "sleep": [
        {
          "sx": 152,
          "sy": 1802,
          "sw": 404,
          "sh": 255
        },
        {
          "sx": 833,
          "sy": 1802,
          "sw": 404,
          "sh": 255
        },
        {
          "sx": 1515,
          "sy": 1802,
          "sw": 404,
          "sh": 255
        }
      ],
      "eat_dish": [
        {
          "sx": 55,
          "sy": 19,
          "sw": 627,
          "sh": 399
        },
        {
          "sx": 743,
          "sy": 19,
          "sw": 627,
          "sh": 399
        },
        {
          "sx": 1422,
          "sy": 19,
          "sw": 627,
          "sh": 399
        }
      ],
      "eat_raw": [
        {
          "sx": 112,
          "sy": 434,
          "sw": 363,
          "sh": 399
        },
        {
          "sx": 809,
          "sy": 434,
          "sw": 386,
          "sh": 399
        },
        {
          "sx": 1491,
          "sy": 434,
          "sw": 386,
          "sh": 399
        }
      ],
      "fish": [
        {
          "sx": -1,
          "sy": 846,
          "sw": 682,
          "sh": 403
        },
        {
          "sx": 681,
          "sy": 846,
          "sw": 682,
          "sh": 403
        },
        {
          "sx": 1368,
          "sy": 846,
          "sw": 682,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 11,
          "sy": 1263,
          "sw": 672,
          "sh": 403
        },
        {
          "sx": 698,
          "sy": 1263,
          "sw": 672,
          "sh": 403
        },
        {
          "sx": 1377,
          "sy": 1263,
          "sw": 672,
          "sh": 403
        }
      ],
      "smith": [
        {
          "sx": 132,
          "sy": 1680,
          "sw": 466,
          "sh": 403
        },
        {
          "sx": 820,
          "sy": 1680,
          "sw": 466,
          "sh": 403
        },
        {
          "sx": 1512,
          "sy": 1680,
          "sw": 466,
          "sh": 403
        }
      ],
      "farm_plow": [
        {
          "sx": -1,
          "sy": 19,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 686,
          "sy": 19,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 1370,
          "sy": 19,
          "sw": 679,
          "sh": 407
        }
      ],
      "farm_seed": [
        {
          "sx": -1,
          "sy": 419,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 683,
          "sy": 419,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 1370,
          "sy": 419,
          "sw": 679,
          "sh": 407
        }
      ],
      "farm_water": [
        {
          "sx": -1,
          "sy": 840,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 683,
          "sy": 840,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 1370,
          "sy": 840,
          "sw": 679,
          "sh": 407
        }
      ],
      "farm_pest": [
        {
          "sx": -2,
          "sy": 1254,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 683,
          "sy": 1254,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 1370,
          "sy": 1254,
          "sw": 679,
          "sh": 407
        }
      ],
      "farm_harvest": [
        {
          "sx": -2,
          "sy": 1672,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 683,
          "sy": 1672,
          "sw": 679,
          "sh": 407
        },
        {
          "sx": 1370,
          "sy": 1672,
          "sw": 679,
          "sh": 407
        }
      ]
    }
  },
  "stone": {
    "img": "stone",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "stone_action",
      "eat_raw": "stone_action",
      "fish": "stone_action",
      "cook": "stone_action",
      "smith": "stone_action",
      "farm_plow": "stone_action_farm",
      "farm_seed": "stone_action_farm",
      "farm_water": "stone_action_farm",
      "farm_pest": "stone_action_farm",
      "farm_harvest": "stone_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 214,
          "sy": 53,
          "sw": 377,
          "sh": 416
        },
        {
          "sx": 763,
          "sy": 42,
          "sw": 385,
          "sh": 420
        },
        {
          "sx": 1318,
          "sy": 42,
          "sw": 385,
          "sh": 420
        }
      ],
      "move": [
        {
          "sx": 197,
          "sy": 509,
          "sw": 396,
          "sh": 416
        },
        {
          "sx": 754,
          "sy": 509,
          "sw": 404,
          "sh": 416
        },
        {
          "sx": 1322,
          "sy": 509,
          "sw": 404,
          "sh": 416
        }
      ],
      "study": [
        {
          "sx": 210,
          "sy": 979,
          "sw": 375,
          "sh": 364
        },
        {
          "sx": 772,
          "sy": 979,
          "sw": 375,
          "sh": 364
        },
        {
          "sx": 1326,
          "sy": 979,
          "sw": 375,
          "sh": 364
        }
      ],
      "train": [
        {
          "sx": 150,
          "sy": 1399,
          "sw": 498,
          "sh": 389
        },
        {
          "sx": 721,
          "sy": 1399,
          "sw": 517,
          "sh": 389
        },
        {
          "sx": 1331,
          "sy": 1399,
          "sw": 481,
          "sh": 389
        }
      ],
      "sleep": [
        {
          "sx": 150,
          "sy": 1899,
          "sw": 498,
          "sh": 262
        },
        {
          "sx": 724,
          "sy": 1899,
          "sw": 498,
          "sh": 262
        },
        {
          "sx": 1294,
          "sy": 1899,
          "sw": 498,
          "sh": 262
        }
      ],
      "eat_dish": [
        {
          "sx": 78,
          "sy": 25,
          "sw": 563,
          "sh": 416
        },
        {
          "sx": 723,
          "sy": 25,
          "sw": 563,
          "sh": 416
        },
        {
          "sx": 1360,
          "sy": 25,
          "sw": 563,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 119,
          "sy": 463,
          "sw": 390,
          "sh": 422
        },
        {
          "sx": 762,
          "sy": 463,
          "sw": 390,
          "sh": 422
        },
        {
          "sx": 1408,
          "sy": 463,
          "sw": 390,
          "sh": 422
        }
      ],
      "fish": [
        {
          "sx": 113,
          "sy": 899,
          "sw": 471,
          "sh": 384
        },
        {
          "sx": 746,
          "sy": 899,
          "sw": 471,
          "sh": 384
        },
        {
          "sx": 1390,
          "sy": 899,
          "sw": 471,
          "sh": 384
        }
      ],
      "cook": [
        {
          "sx": 44,
          "sy": 1345,
          "sw": 553,
          "sh": 409
        },
        {
          "sx": 687,
          "sy": 1345,
          "sw": 553,
          "sh": 409
        },
        {
          "sx": 1326,
          "sy": 1345,
          "sw": 553,
          "sh": 409
        }
      ],
      "smith": [
        {
          "sx": 68,
          "sy": 1781,
          "sw": 475,
          "sh": 409
        },
        {
          "sx": 715,
          "sy": 1781,
          "sw": 475,
          "sh": 409
        },
        {
          "sx": 1372,
          "sy": 1781,
          "sw": 475,
          "sh": 409
        }
      ],
      "farm_plow": [
        {
          "sx": 41,
          "sy": 25,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 662,
          "sy": 25,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 1282,
          "sy": 25,
          "sw": 601,
          "sh": 416
        }
      ],
      "farm_seed": [
        {
          "sx": 41,
          "sy": 449,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 661,
          "sy": 449,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 1281,
          "sy": 449,
          "sw": 601,
          "sh": 416
        }
      ],
      "farm_water": [
        {
          "sx": 41,
          "sy": 887,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 661,
          "sy": 887,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 1282,
          "sy": 887,
          "sw": 601,
          "sh": 416
        }
      ],
      "farm_pest": [
        {
          "sx": 41,
          "sy": 1324,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 661,
          "sy": 1324,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 1281,
          "sy": 1324,
          "sw": 601,
          "sh": 416
        }
      ],
      "farm_harvest": [
        {
          "sx": 41,
          "sy": 1762,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 656,
          "sy": 1762,
          "sw": 601,
          "sh": 416
        },
        {
          "sx": 1270,
          "sy": 1762,
          "sw": 601,
          "sh": 416
        }
      ]
    }
  },
  "ghost": {
    "img": "ghost",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "ghost_action",
      "eat_raw": "ghost_action",
      "fish": "ghost_action",
      "cook": "ghost_action",
      "smith": "ghost_action",
      "farm_plow": "ghost_action_farm",
      "farm_seed": "ghost_action_farm",
      "farm_water": "ghost_action_farm",
      "farm_pest": "ghost_action_farm",
      "farm_harvest": "ghost_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 172,
          "sy": 68,
          "sw": 293,
          "sh": 326
        },
        {
          "sx": 803,
          "sy": 68,
          "sw": 334,
          "sh": 326
        },
        {
          "sx": 1460,
          "sy": 68,
          "sw": 334,
          "sh": 326
        }
      ],
      "move": [
        {
          "sx": 168,
          "sy": 515,
          "sw": 301,
          "sh": 338
        },
        {
          "sx": 814,
          "sy": 515,
          "sw": 301,
          "sh": 338
        },
        {
          "sx": 1457,
          "sy": 515,
          "sw": 301,
          "sh": 338
        }
      ],
      "study": [
        {
          "sx": 170,
          "sy": 943,
          "sw": 361,
          "sh": 317
        },
        {
          "sx": 806,
          "sy": 943,
          "sw": 361,
          "sh": 317
        },
        {
          "sx": 1449,
          "sy": 943,
          "sw": 361,
          "sh": 317
        }
      ],
      "train": [
        {
          "sx": 170,
          "sy": 1349,
          "sw": 361,
          "sh": 317
        },
        {
          "sx": 805,
          "sy": 1349,
          "sw": 368,
          "sh": 317
        },
        {
          "sx": 1449,
          "sy": 1349,
          "sw": 368,
          "sh": 317
        }
      ],
      "sleep": [
        {
          "sx": 141,
          "sy": 1888,
          "sw": 385,
          "sh": 188
        },
        {
          "sx": 781,
          "sy": 1888,
          "sw": 385,
          "sh": 188
        },
        {
          "sx": 1427,
          "sy": 1888,
          "sw": 385,
          "sh": 188
        }
      ],
      "eat_dish": [
        {
          "sx": 110,
          "sy": 57,
          "sw": 515,
          "sh": 374
        },
        {
          "sx": 721,
          "sy": 57,
          "sw": 515,
          "sh": 374
        },
        {
          "sx": 1321,
          "sy": 57,
          "sw": 515,
          "sh": 374
        }
      ],
      "eat_raw": [
        {
          "sx": 204,
          "sy": 493,
          "sw": 311,
          "sh": 374
        },
        {
          "sx": 810,
          "sy": 493,
          "sw": 311,
          "sh": 374
        },
        {
          "sx": 1414,
          "sy": 493,
          "sw": 311,
          "sh": 374
        }
      ],
      "fish": [
        {
          "sx": 135,
          "sy": 922,
          "sw": 530,
          "sh": 374
        },
        {
          "sx": 735,
          "sy": 922,
          "sw": 530,
          "sh": 374
        },
        {
          "sx": 1335,
          "sy": 922,
          "sw": 530,
          "sh": 374
        }
      ],
      "cook": [
        {
          "sx": 135,
          "sy": 1346,
          "sw": 503,
          "sh": 374
        },
        {
          "sx": 735,
          "sy": 1346,
          "sw": 503,
          "sh": 374
        },
        {
          "sx": 1335,
          "sy": 1346,
          "sw": 503,
          "sh": 374
        }
      ],
      "smith": [
        {
          "sx": 135,
          "sy": 1769,
          "sw": 503,
          "sh": 374
        },
        {
          "sx": 735,
          "sy": 1769,
          "sw": 503,
          "sh": 374
        },
        {
          "sx": 1335,
          "sy": 1769,
          "sw": 503,
          "sh": 374
        }
      ],
      "farm_plow": [
        {
          "sx": 112,
          "sy": 54,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 735,
          "sy": 54,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 1351,
          "sy": 54,
          "sw": 533,
          "sh": 374
        }
      ],
      "farm_seed": [
        {
          "sx": 110,
          "sy": 479,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 728,
          "sy": 479,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 1350,
          "sy": 479,
          "sw": 533,
          "sh": 374
        }
      ],
      "farm_water": [
        {
          "sx": 110,
          "sy": 902,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 729,
          "sy": 902,
          "sw": 533,
          "sh": 374
        },
        {
          "sx": 1350,
          "sy": 902,
          "sw": 533,
          "sh": 374
        }
      ],
      "farm_pest": [
        {
          "sx": 76,
          "sy": 1316,
          "sw": 568,
          "sh": 374
        },
        {
          "sx": 694,
          "sy": 1316,
          "sw": 568,
          "sh": 374
        },
        {
          "sx": 1314,
          "sy": 1316,
          "sw": 568,
          "sh": 374
        }
      ],
      "farm_harvest": [
        {
          "sx": 76,
          "sy": 1744,
          "sw": 568,
          "sh": 374
        },
        {
          "sx": 693,
          "sy": 1744,
          "sw": 568,
          "sh": 374
        },
        {
          "sx": 1360,
          "sy": 1744,
          "sw": 568,
          "sh": 374
        }
      ]
    }
  },
  "seed": {
    "img": "seed",
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "seed_action",
      "eat_raw": "seed_action",
      "fish": "seed_action",
      "cook": "seed_action",
      "smith": "seed_action",
      "farm_plow": "seed_action_farm",
      "farm_seed": "seed_action_farm",
      "farm_water": "seed_action_farm",
      "farm_pest": "seed_action_farm",
      "farm_harvest": "seed_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 130,
          "sy": 34,
          "sw": 308,
          "sh": 476
        },
        {
          "sx": 696,
          "sy": 34,
          "sw": 308,
          "sh": 476
        },
        {
          "sx": 1266,
          "sy": 34,
          "sw": 308,
          "sh": 476
        }
      ],
      "move": [
        {
          "sx": 143,
          "sy": 524,
          "sw": 276,
          "sh": 476
        },
        {
          "sx": 711,
          "sy": 524,
          "sw": 276,
          "sh": 476
        },
        {
          "sx": 1282,
          "sy": 524,
          "sw": 276,
          "sh": 476
        }
      ],
      "study": [
        {
          "sx": 142,
          "sy": 1035,
          "sw": 280,
          "sh": 476
        },
        {
          "sx": 705,
          "sy": 1035,
          "sw": 303,
          "sh": 476
        },
        {
          "sx": 1272,
          "sy": 1035,
          "sw": 303,
          "sh": 476
        }
      ],
      "train": [
        {
          "sx": 13,
          "sy": 1534,
          "sw": 550,
          "sh": 476
        },
        {
          "sx": 582,
          "sy": 1534,
          "sw": 550,
          "sh": 476
        },
        {
          "sx": 1143,
          "sy": 1534,
          "sw": 550,
          "sh": 476
        }
      ],
      "sleep": [
        {
          "sx": 13,
          "sy": 2190,
          "sw": 477,
          "sh": 304
        },
        {
          "sx": 592,
          "sy": 2190,
          "sw": 477,
          "sh": 304
        },
        {
          "sx": 1150,
          "sy": 2190,
          "sw": 477,
          "sh": 304
        }
      ],
      "eat_dish": [
        {
          "sx": 78,
          "sy": 24,
          "sw": 488,
          "sh": 478
        },
        {
          "sx": 644,
          "sy": 24,
          "sw": 488,
          "sh": 478
        },
        {
          "sx": 1208,
          "sy": 24,
          "sw": 488,
          "sh": 478
        }
      ],
      "eat_raw": [
        {
          "sx": 99,
          "sy": 524,
          "sw": 347,
          "sh": 478
        },
        {
          "sx": 660,
          "sy": 524,
          "sw": 347,
          "sh": 478
        },
        {
          "sx": 1223,
          "sy": 524,
          "sw": 347,
          "sh": 478
        }
      ],
      "fish": [
        {
          "sx": 60,
          "sy": 1024,
          "sw": 436,
          "sh": 478
        },
        {
          "sx": 622,
          "sy": 1024,
          "sw": 436,
          "sh": 478
        },
        {
          "sx": 1179,
          "sy": 1024,
          "sw": 436,
          "sh": 478
        }
      ],
      "cook": [
        {
          "sx": 59,
          "sy": 1551,
          "sw": 446,
          "sh": 478
        },
        {
          "sx": 614,
          "sy": 1551,
          "sw": 446,
          "sh": 478
        },
        {
          "sx": 1177,
          "sy": 1551,
          "sw": 452,
          "sh": 478
        }
      ],
      "smith": [
        {
          "sx": 37,
          "sy": 2051,
          "sw": 503,
          "sh": 478
        },
        {
          "sx": 584,
          "sy": 2051,
          "sw": 519,
          "sh": 478
        },
        {
          "sx": 1144,
          "sy": 2051,
          "sw": 519,
          "sh": 478
        }
      ],
      "farm_plow": [
        {
          "sx": 23,
          "sy": 34,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 592,
          "sy": 34,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 1161,
          "sy": 34,
          "sw": 452,
          "sh": 476
        }
      ],
      "farm_seed": [
        {
          "sx": 23,
          "sy": 534,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 593,
          "sy": 534,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 1159,
          "sy": 534,
          "sw": 460,
          "sh": 476
        }
      ],
      "farm_water": [
        {
          "sx": 27,
          "sy": 1034,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 599,
          "sy": 1034,
          "sw": 452,
          "sh": 476
        },
        {
          "sx": 1159,
          "sy": 1034,
          "sw": 460,
          "sh": 476
        }
      ],
      "farm_pest": [
        {
          "sx": 31,
          "sy": 1534,
          "sw": 504,
          "sh": 476
        },
        {
          "sx": 603,
          "sy": 1534,
          "sw": 504,
          "sh": 476
        },
        {
          "sx": 1160,
          "sy": 1534,
          "sw": 504,
          "sh": 476
        }
      ],
      "farm_harvest": [
        {
          "sx": 21,
          "sy": 2034,
          "sw": 426,
          "sh": 476
        },
        {
          "sx": 606,
          "sy": 2034,
          "sw": 496,
          "sh": 476
        },
        {
          "sx": 1166,
          "sy": 2034,
          "sw": 507,
          "sh": 476
        }
      ]
    }
  },
  "beetle": {
    "img": "beetle",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "beetle_action",
      "eat_raw": "beetle_action",
      "fish": "beetle_action",
      "cook": "beetle_action",
      "smith": "beetle_action",
      "farm_plow": "beetle_action_farm",
      "farm_seed": "beetle_action_farm",
      "farm_water": "beetle_action_farm",
      "farm_pest": "beetle_action_farm",
      "farm_harvest": "beetle_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 159,
          "sy": 36,
          "sw": 316,
          "sh": 405
        },
        {
          "sx": 798,
          "sy": 36,
          "sw": 316,
          "sh": 405
        },
        {
          "sx": 1440,
          "sy": 36,
          "sw": 316,
          "sh": 405
        }
      ],
      "move": [
        {
          "sx": 155,
          "sy": 484,
          "sw": 346,
          "sh": 405
        },
        {
          "sx": 800,
          "sy": 484,
          "sw": 346,
          "sh": 405
        },
        {
          "sx": 1442,
          "sy": 484,
          "sw": 346,
          "sh": 405
        }
      ],
      "study": [
        {
          "sx": 139,
          "sy": 940,
          "sw": 370,
          "sh": 394
        },
        {
          "sx": 773,
          "sy": 940,
          "sw": 370,
          "sh": 394
        },
        {
          "sx": 1424,
          "sy": 940,
          "sw": 370,
          "sh": 394
        }
      ],
      "train": [
        {
          "sx": 139,
          "sy": 1376,
          "sw": 415,
          "sh": 406
        },
        {
          "sx": 785,
          "sy": 1376,
          "sw": 415,
          "sh": 406
        },
        {
          "sx": 1429,
          "sy": 1376,
          "sw": 415,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 129,
          "sy": 1925,
          "sw": 425,
          "sh": 251
        },
        {
          "sx": 775,
          "sy": 1925,
          "sw": 425,
          "sh": 251
        },
        {
          "sx": 1418,
          "sy": 1925,
          "sw": 425,
          "sh": 251
        }
      ],
      "eat_dish": [
        {
          "sx": 88,
          "sy": 13,
          "sw": 467,
          "sh": 433
        },
        {
          "sx": 725,
          "sy": 13,
          "sw": 467,
          "sh": 433
        },
        {
          "sx": 1370,
          "sy": 13,
          "sw": 467,
          "sh": 433
        }
      ],
      "eat_raw": [
        {
          "sx": 119,
          "sy": 467,
          "sw": 392,
          "sh": 433
        },
        {
          "sx": 762,
          "sy": 467,
          "sw": 392,
          "sh": 433
        },
        {
          "sx": 1399,
          "sy": 467,
          "sw": 392,
          "sh": 433
        }
      ],
      "fish": [
        {
          "sx": 44,
          "sy": 909,
          "sw": 500,
          "sh": 364
        },
        {
          "sx": 691,
          "sy": 909,
          "sw": 500,
          "sh": 364
        },
        {
          "sx": 1329,
          "sy": 909,
          "sw": 500,
          "sh": 364
        }
      ],
      "cook": [
        {
          "sx": 53,
          "sy": 1346,
          "sw": 588,
          "sh": 450
        },
        {
          "sx": 693,
          "sy": 1346,
          "sw": 588,
          "sh": 450
        },
        {
          "sx": 1332,
          "sy": 1346,
          "sw": 588,
          "sh": 450
        }
      ],
      "smith": [
        {
          "sx": 53,
          "sy": 1797,
          "sw": 532,
          "sh": 450
        },
        {
          "sx": 709,
          "sy": 1797,
          "sw": 532,
          "sh": 450
        },
        {
          "sx": 1339,
          "sy": 1797,
          "sw": 532,
          "sh": 450
        }
      ],
      "farm_plow": [
        {
          "sx": 88,
          "sy": 36,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 728,
          "sy": 36,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 1356,
          "sy": 36,
          "sw": 492,
          "sh": 405
        }
      ],
      "farm_seed": [
        {
          "sx": 88,
          "sy": 475,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 728,
          "sy": 475,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 1356,
          "sy": 475,
          "sw": 492,
          "sh": 405
        }
      ],
      "farm_water": [
        {
          "sx": 88,
          "sy": 923,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 727,
          "sy": 923,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 1356,
          "sy": 923,
          "sw": 492,
          "sh": 405
        }
      ],
      "farm_pest": [
        {
          "sx": 88,
          "sy": 1335,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 730,
          "sy": 1335,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 1368,
          "sy": 1335,
          "sw": 492,
          "sh": 405
        }
      ],
      "farm_harvest": [
        {
          "sx": 107,
          "sy": 1789,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 755,
          "sy": 1789,
          "sw": 492,
          "sh": 405
        },
        {
          "sx": 1400,
          "sy": 1789,
          "sw": 492,
          "sh": 405
        }
      ]
    }
  },
  "dragon": {
    "img": "dragon",
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "dragon_action",
      "eat_raw": "dragon_action",
      "fish": "dragon_action",
      "cook": "dragon_action",
      "smith": "dragon_action",
      "farm_plow": "dragon_action_farm",
      "farm_seed": "dragon_action_farm",
      "farm_water": "dragon_action_farm",
      "farm_pest": "dragon_action_farm",
      "farm_harvest": "dragon_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 172,
          "sy": 22,
          "sw": 358,
          "sh": 398
        },
        {
          "sx": 802,
          "sy": 22,
          "sw": 358,
          "sh": 398
        },
        {
          "sx": 1431,
          "sy": 22,
          "sw": 358,
          "sh": 398
        }
      ],
      "move": [
        {
          "sx": 172,
          "sy": 451,
          "sw": 379,
          "sh": 398
        },
        {
          "sx": 799,
          "sy": 451,
          "sw": 388,
          "sh": 398
        },
        {
          "sx": 1435,
          "sy": 451,
          "sw": 388,
          "sh": 398
        }
      ],
      "study": [
        {
          "sx": 152,
          "sy": 895,
          "sw": 431,
          "sh": 398
        },
        {
          "sx": 776,
          "sy": 895,
          "sw": 431,
          "sh": 398
        },
        {
          "sx": 1402,
          "sy": 895,
          "sw": 431,
          "sh": 398
        }
      ],
      "train": [
        {
          "sx": 152,
          "sy": 1321,
          "sw": 463,
          "sh": 398
        },
        {
          "sx": 776,
          "sy": 1321,
          "sw": 463,
          "sh": 398
        },
        {
          "sx": 1400,
          "sy": 1321,
          "sw": 463,
          "sh": 398
        }
      ],
      "sleep": [
        {
          "sx": 167,
          "sy": 1835,
          "sw": 406,
          "sh": 280
        },
        {
          "sx": 788,
          "sy": 1835,
          "sw": 406,
          "sh": 280
        },
        {
          "sx": 1408,
          "sy": 1835,
          "sw": 406,
          "sh": 280
        }
      ],
      "eat_dish": [
        {
          "sx": 117,
          "sy": 22,
          "sw": 433,
          "sh": 398
        },
        {
          "sx": 780,
          "sy": 30,
          "sw": 433,
          "sh": 398
        },
        {
          "sx": 1449,
          "sy": 22,
          "sw": 433,
          "sh": 398
        }
      ],
      "eat_raw": [
        {
          "sx": 117,
          "sy": 463,
          "sw": 395,
          "sh": 398
        },
        {
          "sx": 789,
          "sy": 463,
          "sw": 395,
          "sh": 398
        },
        {
          "sx": 1456,
          "sy": 463,
          "sw": 395,
          "sh": 398
        }
      ],
      "fish": [
        {
          "sx": 82,
          "sy": 896,
          "sw": 482,
          "sh": 398
        },
        {
          "sx": 749,
          "sy": 896,
          "sw": 482,
          "sh": 398
        },
        {
          "sx": 1414,
          "sy": 896,
          "sw": 482,
          "sh": 398
        }
      ],
      "cook": [
        {
          "sx": 58,
          "sy": 1328,
          "sw": 533,
          "sh": 398
        },
        {
          "sx": 725,
          "sy": 1328,
          "sw": 533,
          "sh": 398
        },
        {
          "sx": 1391,
          "sy": 1328,
          "sw": 533,
          "sh": 398
        }
      ],
      "smith": [
        {
          "sx": 58,
          "sy": 1737,
          "sw": 506,
          "sh": 406
        },
        {
          "sx": 729,
          "sy": 1737,
          "sw": 506,
          "sh": 406
        },
        {
          "sx": 1401,
          "sy": 1737,
          "sw": 506,
          "sh": 406
        }
      ],
      "farm_plow": [
        {
          "sx": 92,
          "sy": 22,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 769,
          "sy": 22,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 1437,
          "sy": 22,
          "sw": 415,
          "sh": 398
        }
      ],
      "farm_seed": [
        {
          "sx": 92,
          "sy": 450,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 753,
          "sy": 450,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 1421,
          "sy": 450,
          "sw": 415,
          "sh": 398
        }
      ],
      "farm_water": [
        {
          "sx": 86,
          "sy": 880,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 755,
          "sy": 880,
          "sw": 415,
          "sh": 398
        },
        {
          "sx": 1422,
          "sy": 880,
          "sw": 415,
          "sh": 398
        }
      ],
      "farm_pest": [
        {
          "sx": 23,
          "sy": 1304,
          "sw": 470,
          "sh": 398
        },
        {
          "sx": 702,
          "sy": 1304,
          "sw": 470,
          "sh": 398
        },
        {
          "sx": 1372,
          "sy": 1304,
          "sw": 470,
          "sh": 398
        }
      ],
      "farm_harvest": [
        {
          "sx": 65,
          "sy": 1732,
          "sw": 395,
          "sh": 398
        },
        {
          "sx": 753,
          "sy": 1732,
          "sw": 395,
          "sh": 398
        },
        {
          "sx": 1405,
          "sy": 1732,
          "sw": 395,
          "sh": 398
        }
      ]
    }
  },
  "bird": {
    "img": "bird",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "bird_action",
      "eat_raw": "bird_action",
      "fish": "bird_action",
      "cook": "bird_action",
      "smith": "bird_action",
      "farm_plow": "bird_action_farm",
      "farm_seed": "bird_action_farm",
      "farm_water": "bird_action_farm",
      "farm_pest": "bird_action_farm",
      "farm_harvest": "bird_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 213,
          "sy": 66,
          "sw": 299,
          "sh": 408
        },
        {
          "sx": 765,
          "sy": 66,
          "sw": 299,
          "sh": 408
        },
        {
          "sx": 1322,
          "sy": 66,
          "sw": 299,
          "sh": 408
        }
      ],
      "move": [
        {
          "sx": 213,
          "sy": 532,
          "sw": 312,
          "sh": 408
        },
        {
          "sx": 759,
          "sy": 532,
          "sw": 312,
          "sh": 408
        },
        {
          "sx": 1315,
          "sy": 532,
          "sw": 312,
          "sh": 408
        }
      ],
      "study": [
        {
          "sx": 208,
          "sy": 986,
          "sw": 366,
          "sh": 408
        },
        {
          "sx": 755,
          "sy": 986,
          "sw": 366,
          "sh": 408
        },
        {
          "sx": 1315,
          "sy": 986,
          "sw": 366,
          "sh": 408
        }
      ],
      "train": [
        {
          "sx": 182,
          "sy": 1424,
          "sw": 450,
          "sh": 408
        },
        {
          "sx": 729,
          "sy": 1424,
          "sw": 450,
          "sh": 408
        },
        {
          "sx": 1288,
          "sy": 1424,
          "sw": 450,
          "sh": 408
        }
      ],
      "sleep": [
        {
          "sx": 174,
          "sy": 1939,
          "sw": 386,
          "sh": 294
        },
        {
          "sx": 729,
          "sy": 1939,
          "sw": 386,
          "sh": 294
        },
        {
          "sx": 1283,
          "sy": 1939,
          "sw": 386,
          "sh": 294
        }
      ],
      "eat_dish": [
        {
          "sx": 78,
          "sy": 34,
          "sw": 499,
          "sh": 419
        },
        {
          "sx": 691,
          "sy": 34,
          "sw": 499,
          "sh": 419
        },
        {
          "sx": 1312,
          "sy": 34,
          "sw": 499,
          "sh": 419
        }
      ],
      "eat_raw": [
        {
          "sx": 132,
          "sy": 488,
          "sw": 344,
          "sh": 431
        },
        {
          "sx": 745,
          "sy": 488,
          "sw": 344,
          "sh": 431
        },
        {
          "sx": 1373,
          "sy": 488,
          "sw": 344,
          "sh": 431
        }
      ],
      "fish": [
        {
          "sx": 58,
          "sy": 936,
          "sw": 469,
          "sh": 377
        },
        {
          "sx": 671,
          "sy": 936,
          "sw": 469,
          "sh": 377
        },
        {
          "sx": 1301,
          "sy": 936,
          "sw": 469,
          "sh": 377
        }
      ],
      "cook": [
        {
          "sx": 58,
          "sy": 1436,
          "sw": 496,
          "sh": 377
        },
        {
          "sx": 670,
          "sy": 1436,
          "sw": 496,
          "sh": 377
        },
        {
          "sx": 1295,
          "sy": 1436,
          "sw": 496,
          "sh": 377
        }
      ],
      "smith": [
        {
          "sx": 58,
          "sy": 1876,
          "sw": 512,
          "sh": 404
        },
        {
          "sx": 675,
          "sy": 1876,
          "sw": 512,
          "sh": 404
        },
        {
          "sx": 1297,
          "sy": 1876,
          "sw": 512,
          "sh": 404
        }
      ],
      "farm_plow": [
        {
          "sx": 166,
          "sy": 36,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 722,
          "sy": 36,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 1278,
          "sy": 36,
          "sw": 448,
          "sh": 408
        }
      ],
      "farm_seed": [
        {
          "sx": 166,
          "sy": 492,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 721,
          "sy": 492,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 1279,
          "sy": 492,
          "sw": 448,
          "sh": 408
        }
      ],
      "farm_water": [
        {
          "sx": 166,
          "sy": 947,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 721,
          "sy": 947,
          "sw": 448,
          "sh": 408
        },
        {
          "sx": 1279,
          "sy": 947,
          "sw": 448,
          "sh": 408
        }
      ],
      "farm_pest": [
        {
          "sx": 193,
          "sy": 1411,
          "sw": 411,
          "sh": 382
        },
        {
          "sx": 745,
          "sy": 1411,
          "sw": 411,
          "sh": 382
        },
        {
          "sx": 1306,
          "sy": 1411,
          "sw": 411,
          "sh": 382
        }
      ],
      "farm_harvest": [
        {
          "sx": 193,
          "sy": 1857,
          "sw": 377,
          "sh": 388
        },
        {
          "sx": 747,
          "sy": 1857,
          "sw": 377,
          "sh": 388
        },
        {
          "sx": 1315,
          "sy": 1857,
          "sw": 377,
          "sh": 388
        }
      ]
    }
  },
  "balloon": {
    "img": "balloon",
    "scale": 0.25,
    "actionImages": {
      "eat_dish": "balloon_action",
      "eat_raw": "balloon_action",
      "fish": "balloon_action",
      "cook": "balloon_action",
      "smith": "balloon_action",
      "farm_plow": "balloon_action_farm",
      "farm_seed": "balloon_action_farm",
      "farm_water": "balloon_action_farm",
      "farm_pest": "balloon_action_farm",
      "farm_harvest": "balloon_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 350,
          "sy": 48,
          "sw": 319,
          "sh": 322
        },
        {
          "sx": 901,
          "sy": 48,
          "sw": 319,
          "sh": 322
        },
        {
          "sx": 1430,
          "sy": 38,
          "sw": 319,
          "sh": 322
        }
      ],
      "move": [
        {
          "sx": 346,
          "sy": 439,
          "sw": 319,
          "sh": 332
        },
        {
          "sx": 894,
          "sy": 439,
          "sw": 319,
          "sh": 332
        },
        {
          "sx": 1426,
          "sy": 439,
          "sw": 319,
          "sh": 332
        }
      ],
      "study": [
        {
          "sx": 338,
          "sy": 856,
          "sw": 338,
          "sh": 332
        },
        {
          "sx": 893,
          "sy": 856,
          "sw": 349,
          "sh": 332
        },
        {
          "sx": 1428,
          "sy": 856,
          "sw": 349,
          "sh": 332
        }
      ],
      "train": [
        {
          "sx": 338,
          "sy": 1256,
          "sw": 436,
          "sh": 332
        },
        {
          "sx": 890,
          "sy": 1256,
          "sw": 436,
          "sh": 332
        },
        {
          "sx": 1427,
          "sy": 1256,
          "sw": 436,
          "sh": 332
        }
      ],
      "sleep": [
        {
          "sx": 337,
          "sy": 1712,
          "sw": 336,
          "sh": 280
        },
        {
          "sx": 888,
          "sy": 1712,
          "sw": 336,
          "sh": 280
        },
        {
          "sx": 1418,
          "sy": 1712,
          "sw": 336,
          "sh": 280
        }
      ],
      "eat_dish": [
        {
          "sx": 101,
          "sy": 20,
          "sw": 598,
          "sh": 377
        },
        {
          "sx": 809,
          "sy": 20,
          "sw": 598,
          "sh": 377
        },
        {
          "sx": 1515,
          "sy": 20,
          "sw": 598,
          "sh": 377
        }
      ],
      "eat_raw": [
        {
          "sx": 152,
          "sy": 430,
          "sw": 396,
          "sh": 377
        },
        {
          "sx": 852,
          "sy": 430,
          "sw": 396,
          "sh": 377
        },
        {
          "sx": 1552,
          "sy": 430,
          "sw": 396,
          "sh": 377
        }
      ],
      "fish": [
        {
          "sx": 7,
          "sy": 834,
          "sw": 614,
          "sh": 377
        },
        {
          "sx": 708,
          "sy": 834,
          "sw": 614,
          "sh": 377
        },
        {
          "sx": 1408,
          "sy": 834,
          "sw": 614,
          "sh": 377
        }
      ],
      "cook": [
        {
          "sx": 66,
          "sy": 1240,
          "sw": 613,
          "sh": 377
        },
        {
          "sx": 765,
          "sy": 1240,
          "sw": 613,
          "sh": 377
        },
        {
          "sx": 1465,
          "sy": 1240,
          "sw": 613,
          "sh": 377
        }
      ],
      "smith": [
        {
          "sx": 56,
          "sy": 1637,
          "sw": 583,
          "sh": 377
        },
        {
          "sx": 777,
          "sy": 1637,
          "sw": 583,
          "sh": 377
        },
        {
          "sx": 1477,
          "sy": 1637,
          "sw": 583,
          "sh": 377
        }
      ],
      "farm_plow": [
        {
          "sx": 157,
          "sy": 27,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 854,
          "sy": 27,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 1565,
          "sy": 27,
          "sw": 424,
          "sh": 322
        }
      ],
      "farm_seed": [
        {
          "sx": 157,
          "sy": 442,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 854,
          "sy": 442,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 1547,
          "sy": 442,
          "sw": 412,
          "sh": 322
        }
      ],
      "farm_water": [
        {
          "sx": 157,
          "sy": 845,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 861,
          "sy": 845,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 1556,
          "sy": 845,
          "sw": 412,
          "sh": 322
        }
      ],
      "farm_pest": [
        {
          "sx": 157,
          "sy": 1253,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 860,
          "sy": 1253,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 1560,
          "sy": 1253,
          "sw": 412,
          "sh": 322
        }
      ],
      "farm_harvest": [
        {
          "sx": 157,
          "sy": 1652,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 874,
          "sy": 1652,
          "sw": 412,
          "sh": 322
        },
        {
          "sx": 1569,
          "sy": 1634,
          "sw": 412,
          "sh": 341
        }
      ]
    }
  },
  "robot_type3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type3_action",
      "eat_raw": "robot_type3_action",
      "fish": "robot_type3_action",
      "cook": "robot_type3_action",
      "smith": "robot_type3_action",
      "farm_plow": "robot_type3_action_farm",
      "farm_seed": "robot_type3_action_farm",
      "farm_water": "robot_type3_action_farm",
      "farm_pest": "robot_type3_action_farm",
      "farm_harvest": "robot_type3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 96,
          "sy": 14,
          "sw": 327,
          "sh": 523
        },
        {
          "sx": 680,
          "sy": 46,
          "sw": 319,
          "sh": 491
        },
        {
          "sx": 1244,
          "sy": 46,
          "sw": 319,
          "sh": 491
        }
      ],
      "move": [
        {
          "sx": 151,
          "sy": 552,
          "sw": 257,
          "sh": 511
        },
        {
          "sx": 707,
          "sy": 552,
          "sw": 278,
          "sh": 511
        },
        {
          "sx": 1269,
          "sy": 552,
          "sw": 278,
          "sh": 511
        }
      ],
      "study": [
        {
          "sx": 121,
          "sy": 1120,
          "sw": 356,
          "sh": 429
        },
        {
          "sx": 690,
          "sy": 1120,
          "sw": 356,
          "sh": 429
        },
        {
          "sx": 1252,
          "sy": 1120,
          "sw": 356,
          "sh": 429
        }
      ],
      "train": [
        {
          "sx": 26,
          "sy": 1587,
          "sw": 518,
          "sh": 448
        },
        {
          "sx": 590,
          "sy": 1587,
          "sw": 518,
          "sh": 448
        },
        {
          "sx": 1154,
          "sy": 1587,
          "sw": 518,
          "sh": 448
        }
      ],
      "sleep": [
        {
          "sx": 34,
          "sy": 2229,
          "sw": 518,
          "sh": 269
        },
        {
          "sx": 596,
          "sy": 2229,
          "sw": 518,
          "sh": 269
        },
        {
          "sx": 1159,
          "sy": 2229,
          "sw": 518,
          "sh": 269
        }
      ],
      "eat_dish": [
        {
          "sx": 74,
          "sy": 49,
          "sw": 496,
          "sh": 446
        },
        {
          "sx": 639,
          "sy": 49,
          "sw": 496,
          "sh": 446
        },
        {
          "sx": 1204,
          "sy": 49,
          "sw": 496,
          "sh": 446
        }
      ],
      "eat_raw": [
        {
          "sx": 109,
          "sy": 562,
          "sw": 330,
          "sh": 446
        },
        {
          "sx": 693,
          "sy": 562,
          "sw": 330,
          "sh": 446
        },
        {
          "sx": 1257,
          "sy": 562,
          "sw": 330,
          "sh": 446
        }
      ],
      "fish": [
        {
          "sx": 65,
          "sy": 1062,
          "sw": 442,
          "sh": 406
        },
        {
          "sx": 622,
          "sy": 1045,
          "sw": 442,
          "sh": 421
        },
        {
          "sx": 1188,
          "sy": 1045,
          "sw": 442,
          "sh": 421
        }
      ],
      "cook": [
        {
          "sx": 67,
          "sy": 1585,
          "sw": 442,
          "sh": 440
        },
        {
          "sx": 633,
          "sy": 1561,
          "sw": 442,
          "sh": 460
        },
        {
          "sx": 1198,
          "sy": 1561,
          "sw": 442,
          "sh": 460
        }
      ],
      "smith": [
        {
          "sx": 12,
          "sy": 2060,
          "sw": 549,
          "sh": 474
        },
        {
          "sx": 646,
          "sy": 2049,
          "sw": 481,
          "sh": 494
        },
        {
          "sx": 1138,
          "sy": 2049,
          "sw": 553,
          "sh": 494
        }
      ],
      "farm_plow": [
        {
          "sx": -2,
          "sy": 14,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 565,
          "sy": 14,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 1131,
          "sy": 14,
          "sw": 567,
          "sh": 494
        }
      ],
      "farm_seed": [
        {
          "sx": -2,
          "sy": 514,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 565,
          "sy": 514,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 1133,
          "sy": 514,
          "sw": 567,
          "sh": 494
        }
      ],
      "farm_water": [
        {
          "sx": -2,
          "sy": 1014,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 565,
          "sy": 1014,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 1131,
          "sy": 1014,
          "sw": 567,
          "sh": 494
        }
      ],
      "farm_pest": [
        {
          "sx": -2,
          "sy": 1520,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 565,
          "sy": 1520,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 1130,
          "sy": 1520,
          "sw": 567,
          "sh": 494
        }
      ],
      "farm_harvest": [
        {
          "sx": -2,
          "sy": 2029,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 565,
          "sy": 2029,
          "sw": 567,
          "sh": 494
        },
        {
          "sx": 1085,
          "sy": 2029,
          "sw": 567,
          "sh": 494
        }
      ]
    },
    "img": "robot_type3"
  },
  "robot_type3_2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type3_2_action",
      "eat_raw": "robot_type3_2_action",
      "fish": "robot_type3_2_action",
      "cook": "robot_type3_2_action",
      "smith": "robot_type3_2_action",
      "farm_plow": "robot_type3_2_action_farm",
      "farm_seed": "robot_type3_2_action_farm",
      "farm_water": "robot_type3_2_action_farm",
      "farm_pest": "robot_type3_2_action_farm",
      "farm_harvest": "robot_type3_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 39,
          "sy": 49,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 569,
          "sy": 49,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 1109,
          "sy": 49,
          "sw": 461,
          "sh": 499
        }
      ],
      "move": [
        {
          "sx": 40,
          "sy": 578,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 573,
          "sy": 578,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 1114,
          "sy": 578,
          "sw": 461,
          "sh": 499
        }
      ],
      "study": [
        {
          "sx": 40,
          "sy": 1117,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 558,
          "sy": 1117,
          "sw": 461,
          "sh": 499
        },
        {
          "sx": 1094,
          "sy": 1117,
          "sw": 461,
          "sh": 499
        }
      ],
      "train": [
        {
          "sx": 40,
          "sy": 1647,
          "sw": 500,
          "sh": 499
        },
        {
          "sx": 568,
          "sy": 1647,
          "sw": 500,
          "sh": 499
        },
        {
          "sx": 1088,
          "sy": 1647,
          "sw": 500,
          "sh": 499
        }
      ],
      "sleep": [
        {
          "sx": 10,
          "sy": 2326,
          "sw": 530,
          "sh": 313
        },
        {
          "sx": 541,
          "sy": 2326,
          "sw": 530,
          "sh": 313
        },
        {
          "sx": 1066,
          "sy": 2326,
          "sw": 530,
          "sh": 313
        }
      ],
      "eat_dish": [
        {
          "sx": 39,
          "sy": 49,
          "sw": 489,
          "sh": 499
        },
        {
          "sx": 570,
          "sy": 49,
          "sw": 489,
          "sh": 499
        },
        {
          "sx": 1095,
          "sy": 49,
          "sw": 489,
          "sh": 499
        }
      ],
      "eat_raw": [
        {
          "sx": 39,
          "sy": 574,
          "sw": 489,
          "sh": 499
        },
        {
          "sx": 571,
          "sy": 574,
          "sw": 489,
          "sh": 499
        },
        {
          "sx": 1097,
          "sy": 574,
          "sw": 489,
          "sh": 499
        }
      ],
      "fish": [
        {
          "sx": 39,
          "sy": 1119,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 579,
          "sy": 1119,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 1097,
          "sy": 1119,
          "sw": 526,
          "sh": 499
        }
      ],
      "cook": [
        {
          "sx": 39,
          "sy": 1643,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 564,
          "sy": 1643,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 1068,
          "sy": 1643,
          "sw": 526,
          "sh": 499
        }
      ],
      "smith": [
        {
          "sx": 30,
          "sy": 2162,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 555,
          "sy": 2162,
          "sw": 526,
          "sh": 499
        },
        {
          "sx": 1073,
          "sy": 2162,
          "sw": 526,
          "sh": 499
        }
      ],
      "farm_plow": [
        {
          "sx": 39,
          "sy": 49,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 571,
          "sy": 49,
          "sw": 486,
          "sh": 501
        },
        {
          "sx": 1076,
          "sy": 49,
          "sw": 516,
          "sh": 501
        }
      ],
      "farm_seed": [
        {
          "sx": 39,
          "sy": 581,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 580,
          "sy": 581,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 1112,
          "sy": 581,
          "sw": 475,
          "sh": 501
        }
      ],
      "farm_water": [
        {
          "sx": 39,
          "sy": 1113,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 588,
          "sy": 1113,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 1096,
          "sy": 1113,
          "sw": 475,
          "sh": 501
        }
      ],
      "farm_pest": [
        {
          "sx": 39,
          "sy": 1635,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 578,
          "sy": 1635,
          "sw": 484,
          "sh": 501
        },
        {
          "sx": 1095,
          "sy": 1635,
          "sw": 484,
          "sh": 501
        }
      ],
      "farm_harvest": [
        {
          "sx": 39,
          "sy": 2158,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 589,
          "sy": 2158,
          "sw": 475,
          "sh": 501
        },
        {
          "sx": 1089,
          "sy": 2158,
          "sw": 475,
          "sh": 501
        }
      ]
    },
    "img": "robot_type3_2"
  },
  "robot_type3_3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type3_3_action",
      "eat_raw": "robot_type3_3_action",
      "fish": "robot_type3_3_action",
      "cook": "robot_type3_3_action",
      "smith": "robot_type3_3_action",
      "farm_plow": "robot_type3_3_action_farm",
      "farm_seed": "robot_type3_3_action_farm",
      "farm_water": "robot_type3_3_action_farm",
      "farm_pest": "robot_type3_3_action_farm",
      "farm_harvest": "robot_type3_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 133,
          "sy": 22,
          "sw": 407,
          "sh": 367
        },
        {
          "sx": 844,
          "sy": 16,
          "sw": 407,
          "sh": 367
        },
        {
          "sx": 1547,
          "sy": 42,
          "sw": 407,
          "sh": 367
        }
      ],
      "move": [
        {
          "sx": 133,
          "sy": 440,
          "sw": 407,
          "sh": 371
        },
        {
          "sx": 849,
          "sy": 440,
          "sw": 407,
          "sh": 371
        },
        {
          "sx": 1549,
          "sy": 440,
          "sw": 407,
          "sh": 371
        }
      ],
      "study": [
        {
          "sx": 138,
          "sy": 829,
          "sw": 478,
          "sh": 371
        },
        {
          "sx": 849,
          "sy": 829,
          "sw": 478,
          "sh": 371
        },
        {
          "sx": 1533,
          "sy": 829,
          "sw": 478,
          "sh": 371
        }
      ],
      "train": [
        {
          "sx": 121,
          "sy": 1224,
          "sw": 522,
          "sh": 397
        },
        {
          "sx": 827,
          "sy": 1224,
          "sw": 559,
          "sh": 397
        },
        {
          "sx": 1512,
          "sy": 1224,
          "sw": 559,
          "sh": 397
        }
      ],
      "sleep": [
        {
          "sx": 128,
          "sy": 1683,
          "sw": 436,
          "sh": 355
        },
        {
          "sx": 828,
          "sy": 1683,
          "sw": 436,
          "sh": 355
        },
        {
          "sx": 1528,
          "sy": 1683,
          "sw": 436,
          "sh": 355
        }
      ],
      "eat_dish": [
        {
          "sx": 96,
          "sy": 22,
          "sw": 580,
          "sh": 462
        },
        {
          "sx": 796,
          "sy": 22,
          "sw": 580,
          "sh": 462
        },
        {
          "sx": 1486,
          "sy": 22,
          "sw": 586,
          "sh": 462
        }
      ],
      "eat_raw": [
        {
          "sx": 96,
          "sy": 471,
          "sw": 475,
          "sh": 412
        },
        {
          "sx": 813,
          "sy": 471,
          "sw": 475,
          "sh": 412
        },
        {
          "sx": 1499,
          "sy": 471,
          "sw": 475,
          "sh": 413
        }
      ],
      "fish": [
        {
          "sx": 96,
          "sy": 867,
          "sw": 567,
          "sh": 380
        },
        {
          "sx": 796,
          "sy": 867,
          "sw": 567,
          "sh": 380
        },
        {
          "sx": 1468,
          "sy": 867,
          "sw": 567,
          "sh": 380
        }
      ],
      "cook": [
        {
          "sx": 86,
          "sy": 1267,
          "sw": 571,
          "sh": 346
        },
        {
          "sx": 786,
          "sy": 1267,
          "sw": 571,
          "sh": 346
        },
        {
          "sx": 1479,
          "sy": 1267,
          "sw": 571,
          "sh": 346
        }
      ],
      "smith": [
        {
          "sx": 86,
          "sy": 1633,
          "sw": 558,
          "sh": 387
        },
        {
          "sx": 786,
          "sy": 1633,
          "sw": 558,
          "sh": 387
        },
        {
          "sx": 1486,
          "sy": 1633,
          "sw": 558,
          "sh": 387
        }
      ],
      "farm_plow": [
        {
          "sx": 133,
          "sy": 22,
          "sw": 407,
          "sh": 381
        },
        {
          "sx": 859,
          "sy": 22,
          "sw": 407,
          "sh": 381
        },
        {
          "sx": 1569,
          "sy": 22,
          "sw": 407,
          "sh": 381
        }
      ],
      "farm_seed": [
        {
          "sx": 118,
          "sy": 422,
          "sw": 407,
          "sh": 381
        },
        {
          "sx": 828,
          "sy": 422,
          "sw": 407,
          "sh": 381
        },
        {
          "sx": 1534,
          "sy": 422,
          "sw": 407,
          "sh": 381
        }
      ],
      "farm_water": [
        {
          "sx": 103,
          "sy": 822,
          "sw": 478,
          "sh": 381
        },
        {
          "sx": 822,
          "sy": 822,
          "sw": 478,
          "sh": 381
        },
        {
          "sx": 1522,
          "sy": 822,
          "sw": 478,
          "sh": 381
        }
      ],
      "farm_pest": [
        {
          "sx": 103,
          "sy": 1222,
          "sw": 559,
          "sh": 381
        },
        {
          "sx": 825,
          "sy": 1222,
          "sw": 559,
          "sh": 381
        },
        {
          "sx": 1532,
          "sy": 1222,
          "sw": 559,
          "sh": 381
        }
      ],
      "farm_harvest": [
        {
          "sx": 103,
          "sy": 1622,
          "sw": 559,
          "sh": 381
        },
        {
          "sx": 803,
          "sy": 1622,
          "sw": 559,
          "sh": 381
        },
        {
          "sx": 1503,
          "sy": 1622,
          "sw": 559,
          "sh": 381
        }
      ]
    },
    "img": "robot_type3_3"
  },
  "robot_type3_4": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type3_4_action",
      "eat_raw": "robot_type3_4_action",
      "fish": "robot_type3_4_action",
      "cook": "robot_type3_4_action",
      "smith": "robot_type3_4_action",
      "farm_plow": "robot_type3_4_action_farm",
      "farm_seed": "robot_type3_4_action_farm",
      "farm_water": "robot_type3_4_action_farm",
      "farm_pest": "robot_type3_4_action_farm",
      "farm_harvest": "robot_type3_4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 97,
          "sy": 39,
          "sw": 329,
          "sh": 560
        },
        {
          "sx": 607,
          "sy": 39,
          "sw": 329,
          "sh": 560
        },
        {
          "sx": 1111,
          "sy": 39,
          "sw": 329,
          "sh": 560
        }
      ],
      "move": [
        {
          "sx": 97,
          "sy": 595,
          "sw": 329,
          "sh": 560
        },
        {
          "sx": 597,
          "sy": 595,
          "sw": 329,
          "sh": 560
        },
        {
          "sx": 1097,
          "sy": 595,
          "sw": 329,
          "sh": 560
        }
      ],
      "study": [
        {
          "sx": 63,
          "sy": 1140,
          "sw": 385,
          "sh": 560
        },
        {
          "sx": 585,
          "sy": 1140,
          "sw": 385,
          "sh": 560
        },
        {
          "sx": 1094,
          "sy": 1140,
          "sw": 385,
          "sh": 560
        }
      ],
      "train": [
        {
          "sx": 36,
          "sy": 1685,
          "sw": 464,
          "sh": 639
        },
        {
          "sx": 575,
          "sy": 1685,
          "sw": 464,
          "sh": 639
        },
        {
          "sx": 1075,
          "sy": 1685,
          "sw": 464,
          "sh": 639
        }
      ],
      "sleep": [
        {
          "sx": -14,
          "sy": 2418,
          "sw": 521,
          "sh": 328
        },
        {
          "sx": 503,
          "sy": 2418,
          "sw": 521,
          "sh": 328
        },
        {
          "sx": 1019,
          "sy": 2418,
          "sw": 521,
          "sh": 328
        }
      ],
      "eat_dish": [
        {
          "sx": 54,
          "sy": 23,
          "sw": 459,
          "sh": 532
        },
        {
          "sx": 568,
          "sy": 23,
          "sw": 459,
          "sh": 532
        },
        {
          "sx": 1079,
          "sy": 23,
          "sw": 459,
          "sh": 532
        }
      ],
      "eat_raw": [
        {
          "sx": 54,
          "sy": 566,
          "sw": 386,
          "sh": 532
        },
        {
          "sx": 574,
          "sy": 566,
          "sw": 386,
          "sh": 532
        },
        {
          "sx": 1074,
          "sy": 566,
          "sw": 386,
          "sh": 532
        }
      ],
      "fish": [
        {
          "sx": 54,
          "sy": 1110,
          "sw": 427,
          "sh": 532
        },
        {
          "sx": 571,
          "sy": 1110,
          "sw": 427,
          "sh": 532
        },
        {
          "sx": 1071,
          "sy": 1110,
          "sw": 445,
          "sh": 532
        }
      ],
      "cook": [
        {
          "sx": 54,
          "sy": 1663,
          "sw": 449,
          "sh": 532
        },
        {
          "sx": 574,
          "sy": 1663,
          "sw": 449,
          "sh": 532
        },
        {
          "sx": 1074,
          "sy": 1663,
          "sw": 449,
          "sh": 532
        }
      ],
      "smith": [
        {
          "sx": -1,
          "sy": 2206,
          "sw": 515,
          "sh": 555
        },
        {
          "sx": 542,
          "sy": 2206,
          "sw": 484,
          "sh": 555
        },
        {
          "sx": 1026,
          "sy": 2206,
          "sw": 499,
          "sh": 555
        }
      ],
      "farm_plow": [
        {
          "sx": 81,
          "sy": 27,
          "sw": 394,
          "sh": 498
        },
        {
          "sx": 590,
          "sy": 27,
          "sw": 394,
          "sh": 498
        },
        {
          "sx": 1090,
          "sy": 27,
          "sw": 430,
          "sh": 498
        }
      ],
      "farm_seed": [
        {
          "sx": 81,
          "sy": 573,
          "sw": 394,
          "sh": 498
        },
        {
          "sx": 588,
          "sy": 573,
          "sw": 394,
          "sh": 498
        },
        {
          "sx": 1085,
          "sy": 573,
          "sw": 394,
          "sh": 498
        }
      ],
      "farm_water": [
        {
          "sx": 63,
          "sy": 1104,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 558,
          "sy": 1104,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 1058,
          "sy": 1104,
          "sw": 394,
          "sh": 519
        }
      ],
      "farm_pest": [
        {
          "sx": 29,
          "sy": 1654,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 548,
          "sy": 1654,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 1048,
          "sy": 1654,
          "sw": 394,
          "sh": 519
        }
      ],
      "farm_harvest": [
        {
          "sx": 29,
          "sy": 2201,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 577,
          "sy": 2201,
          "sw": 394,
          "sh": 519
        },
        {
          "sx": 1077,
          "sy": 2201,
          "sw": 414,
          "sh": 519
        }
      ]
    },
    "img": "robot_type3_4"
  },
  "robot_type3_5": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type3_5_action",
      "eat_raw": "robot_type3_5_action",
      "fish": "robot_type3_5_action",
      "cook": "robot_type3_5_action",
      "smith": "robot_type3_5_action",
      "farm_plow": "robot_type3_5_action_farm",
      "farm_seed": "robot_type3_5_action_farm",
      "farm_water": "robot_type3_5_action_farm",
      "farm_pest": "robot_type3_5_action_farm",
      "farm_harvest": "robot_type3_5_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 131,
          "sy": 20,
          "sw": 502,
          "sh": 419
        },
        {
          "sx": 794,
          "sy": 20,
          "sw": 502,
          "sh": 419
        },
        {
          "sx": 1467,
          "sy": 20,
          "sw": 502,
          "sh": 419
        }
      ],
      "move": [
        {
          "sx": 131,
          "sy": 420,
          "sw": 502,
          "sh": 419
        },
        {
          "sx": 806,
          "sy": 420,
          "sw": 502,
          "sh": 419
        },
        {
          "sx": 1491,
          "sy": 420,
          "sw": 502,
          "sh": 419
        }
      ],
      "study": [
        {
          "sx": 131,
          "sy": 820,
          "sw": 502,
          "sh": 388
        },
        {
          "sx": 804,
          "sy": 820,
          "sw": 502,
          "sh": 388
        },
        {
          "sx": 1465,
          "sy": 820,
          "sw": 502,
          "sh": 388
        }
      ],
      "train": [
        {
          "sx": 130,
          "sy": 1199,
          "sw": 517,
          "sh": 474
        },
        {
          "sx": 812,
          "sy": 1199,
          "sw": 517,
          "sh": 474
        },
        {
          "sx": 1462,
          "sy": 1199,
          "sw": 540,
          "sh": 474
        }
      ],
      "sleep": [
        {
          "sx": 95,
          "sy": 1678,
          "sw": 585,
          "sh": 328
        },
        {
          "sx": 762,
          "sy": 1678,
          "sw": 585,
          "sh": 328
        },
        {
          "sx": 1437,
          "sy": 1678,
          "sw": 585,
          "sh": 328
        }
      ],
      "eat_dish": [
        {
          "sx": 113,
          "sy": 20,
          "sw": 521,
          "sh": 391
        },
        {
          "sx": 815,
          "sy": 20,
          "sw": 521,
          "sh": 391
        },
        {
          "sx": 1504,
          "sy": 20,
          "sw": 521,
          "sh": 391
        }
      ],
      "eat_raw": [
        {
          "sx": 113,
          "sy": 423,
          "sw": 405,
          "sh": 391
        },
        {
          "sx": 829,
          "sy": 423,
          "sw": 405,
          "sh": 391
        },
        {
          "sx": 1560,
          "sy": 423,
          "sw": 405,
          "sh": 391
        }
      ],
      "fish": [
        {
          "sx": 113,
          "sy": 823,
          "sw": 510,
          "sh": 400
        },
        {
          "sx": 818,
          "sy": 823,
          "sw": 510,
          "sh": 400
        },
        {
          "sx": 1518,
          "sy": 823,
          "sw": 567,
          "sh": 400
        }
      ],
      "cook": [
        {
          "sx": 113,
          "sy": 1223,
          "sw": 510,
          "sh": 407
        },
        {
          "sx": 805,
          "sy": 1223,
          "sw": 510,
          "sh": 407
        },
        {
          "sx": 1505,
          "sy": 1223,
          "sw": 510,
          "sh": 407
        }
      ],
      "smith": [
        {
          "sx": 86,
          "sy": 1623,
          "sw": 510,
          "sh": 397
        },
        {
          "sx": 811,
          "sy": 1623,
          "sw": 510,
          "sh": 397
        },
        {
          "sx": 1509,
          "sy": 1623,
          "sw": 510,
          "sh": 397
        }
      ],
      "farm_plow": [
        {
          "sx": 108,
          "sy": 12,
          "sw": 449,
          "sh": 380
        },
        {
          "sx": 824,
          "sy": 12,
          "sw": 449,
          "sh": 380
        },
        {
          "sx": 1544,
          "sy": 12,
          "sw": 449,
          "sh": 380
        }
      ],
      "farm_seed": [
        {
          "sx": 108,
          "sy": 412,
          "sw": 476,
          "sh": 380
        },
        {
          "sx": 808,
          "sy": 412,
          "sw": 476,
          "sh": 380
        },
        {
          "sx": 1542,
          "sy": 412,
          "sw": 476,
          "sh": 380
        }
      ],
      "farm_water": [
        {
          "sx": 108,
          "sy": 812,
          "sw": 499,
          "sh": 380
        },
        {
          "sx": 808,
          "sy": 812,
          "sw": 499,
          "sh": 380
        },
        {
          "sx": 1508,
          "sy": 812,
          "sw": 499,
          "sh": 380
        }
      ],
      "farm_pest": [
        {
          "sx": 191,
          "sy": 1212,
          "sw": 501,
          "sh": 380
        },
        {
          "sx": 879,
          "sy": 1212,
          "sw": 501,
          "sh": 380
        },
        {
          "sx": 1579,
          "sy": 1212,
          "sw": 501,
          "sh": 380
        }
      ],
      "farm_harvest": [
        {
          "sx": 191,
          "sy": 1612,
          "sw": 501,
          "sh": 380
        },
        {
          "sx": 775,
          "sy": 1612,
          "sw": 611,
          "sh": 380
        },
        {
          "sx": 1475,
          "sy": 1612,
          "sw": 611,
          "sh": 380
        }
      ]
    },
    "img": "robot_type3_5"
  },
  "robot_type2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type2_action",
      "eat_raw": "robot_type2_action",
      "fish": "robot_type2_action",
      "cook": "robot_type2_action",
      "smith": "robot_type2_action",
      "farm_plow": "robot_type2_action_farm",
      "farm_seed": "robot_type2_action_farm",
      "farm_water": "robot_type2_action_farm",
      "farm_pest": "robot_type2_action_farm",
      "farm_harvest": "robot_type2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 168,
          "sy": 27,
          "sw": 300,
          "sh": 479
        },
        {
          "sx": 742,
          "sy": 27,
          "sw": 300,
          "sh": 479
        },
        {
          "sx": 1318,
          "sy": 27,
          "sw": 300,
          "sh": 479
        }
      ],
      "move": [
        {
          "sx": 168,
          "sy": 527,
          "sw": 300,
          "sh": 479
        },
        {
          "sx": 746,
          "sy": 527,
          "sw": 300,
          "sh": 479
        },
        {
          "sx": 1322,
          "sy": 527,
          "sw": 300,
          "sh": 479
        }
      ],
      "study": [
        {
          "sx": 168,
          "sy": 1027,
          "sw": 343,
          "sh": 414
        },
        {
          "sx": 735,
          "sy": 1027,
          "sw": 343,
          "sh": 414
        },
        {
          "sx": 1310,
          "sy": 1027,
          "sw": 343,
          "sh": 414
        }
      ],
      "train": [
        {
          "sx": 72,
          "sy": 1483,
          "sw": 526,
          "sh": 436
        },
        {
          "sx": 646,
          "sy": 1483,
          "sw": 526,
          "sh": 436
        },
        {
          "sx": 1220,
          "sy": 1483,
          "sw": 526,
          "sh": 436
        }
      ],
      "sleep": [
        {
          "sx": 59,
          "sy": 2087,
          "sw": 531,
          "sh": 267
        },
        {
          "sx": 630,
          "sy": 2087,
          "sw": 531,
          "sh": 267
        },
        {
          "sx": 1205,
          "sy": 2087,
          "sw": 531,
          "sh": 267
        }
      ],
      "eat_dish": [
        {
          "sx": 47,
          "sy": 15,
          "sw": 552,
          "sh": 463
        },
        {
          "sx": 647,
          "sy": 15,
          "sw": 552,
          "sh": 463
        },
        {
          "sx": 1241,
          "sy": 15,
          "sw": 552,
          "sh": 463
        }
      ],
      "eat_raw": [
        {
          "sx": 104,
          "sy": 485,
          "sw": 386,
          "sh": 463
        },
        {
          "sx": 704,
          "sy": 485,
          "sw": 386,
          "sh": 463
        },
        {
          "sx": 1304,
          "sy": 485,
          "sw": 386,
          "sh": 463
        }
      ],
      "fish": [
        {
          "sx": -2,
          "sy": 970,
          "sw": 558,
          "sh": 438
        },
        {
          "sx": 600,
          "sy": 970,
          "sw": 558,
          "sh": 438
        },
        {
          "sx": 1200,
          "sy": 970,
          "sw": 558,
          "sh": 438
        }
      ],
      "cook": [
        {
          "sx": 28,
          "sy": 1447,
          "sw": 534,
          "sh": 455
        },
        {
          "sx": 628,
          "sy": 1447,
          "sw": 534,
          "sh": 455
        },
        {
          "sx": 1228,
          "sy": 1447,
          "sw": 534,
          "sh": 455
        }
      ],
      "smith": [
        {
          "sx": 34,
          "sy": 1909,
          "sw": 497,
          "sh": 465
        },
        {
          "sx": 634,
          "sy": 1909,
          "sw": 497,
          "sh": 465
        },
        {
          "sx": 1234,
          "sy": 1909,
          "sw": 497,
          "sh": 465
        }
      ],
      "farm_plow": [
        {
          "sx": 66,
          "sy": 26,
          "sw": 419,
          "sh": 440
        },
        {
          "sx": 611,
          "sy": 13,
          "sw": 569,
          "sh": 460
        },
        {
          "sx": 1211,
          "sy": 13,
          "sw": 569,
          "sh": 460
        }
      ],
      "farm_seed": [
        {
          "sx": 50,
          "sy": 502,
          "sw": 269,
          "sh": 444
        },
        {
          "sx": 637,
          "sy": 502,
          "sw": 358,
          "sh": 444
        },
        {
          "sx": 1237,
          "sy": 502,
          "sw": 358,
          "sh": 444
        }
      ],
      "farm_water": [
        {
          "sx": 31,
          "sy": 974,
          "sw": 440,
          "sh": 444
        },
        {
          "sx": 631,
          "sy": 974,
          "sw": 534,
          "sh": 445
        },
        {
          "sx": 1224,
          "sy": 974,
          "sw": 534,
          "sh": 446
        }
      ],
      "farm_pest": [
        {
          "sx": 26,
          "sy": 1454,
          "sw": 528,
          "sh": 444
        },
        {
          "sx": 651,
          "sy": 1454,
          "sw": 528,
          "sh": 444
        },
        {
          "sx": 1228,
          "sy": 1454,
          "sw": 528,
          "sh": 444
        }
      ],
      "farm_harvest": [
        {
          "sx": 45,
          "sy": 1928,
          "sw": 386,
          "sh": 444
        },
        {
          "sx": 658,
          "sy": 1928,
          "sw": 386,
          "sh": 444
        },
        {
          "sx": 1270,
          "sy": 1925,
          "sw": 386,
          "sh": 444
        }
      ]
    },
    "img": "robot_type2"
  },
  "robot_type2_2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type2_2_action",
      "eat_raw": "robot_type2_2_action",
      "fish": "robot_type2_2_action",
      "cook": "robot_type2_2_action",
      "smith": "robot_type2_2_action",
      "farm_plow": "robot_type2_2_action_farm",
      "farm_seed": "robot_type2_2_action_farm",
      "farm_water": "robot_type2_2_action_farm",
      "farm_pest": "robot_type2_2_action_farm",
      "farm_harvest": "robot_type2_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 29,
          "sy": 17,
          "sw": 487,
          "sh": 728
        },
        {
          "sx": 583,
          "sy": 17,
          "sw": 487,
          "sh": 728
        },
        {
          "sx": 1134,
          "sy": 17,
          "sw": 487,
          "sh": 728
        }
      ],
      "move": [
        {
          "sx": 29,
          "sy": 756,
          "sw": 484,
          "sh": 571
        },
        {
          "sx": 605,
          "sy": 756,
          "sw": 484,
          "sh": 571
        },
        {
          "sx": 1141,
          "sy": 756,
          "sw": 484,
          "sh": 571
        }
      ],
      "study": [
        {
          "sx": 29,
          "sy": 1315,
          "sw": 484,
          "sh": 439
        },
        {
          "sx": 586,
          "sy": 1315,
          "sw": 484,
          "sh": 439
        },
        {
          "sx": 1112,
          "sy": 1315,
          "sw": 484,
          "sh": 439
        }
      ],
      "train": [
        {
          "sx": 29,
          "sy": 1741,
          "sw": 494,
          "sh": 598
        },
        {
          "sx": 589,
          "sy": 1741,
          "sw": 494,
          "sh": 598
        },
        {
          "sx": 1104,
          "sy": 1741,
          "sw": 494,
          "sh": 598
        }
      ],
      "sleep": [
        {
          "sx": -2,
          "sy": 2406,
          "sw": 549,
          "sh": 220
        },
        {
          "sx": 544,
          "sy": 2406,
          "sw": 549,
          "sh": 220
        },
        {
          "sx": 1079,
          "sy": 2406,
          "sw": 549,
          "sh": 220
        }
      ],
      "eat_dish": [
        {
          "sx": 29,
          "sy": 17,
          "sw": 523,
          "sh": 559
        },
        {
          "sx": 576,
          "sy": 17,
          "sw": 523,
          "sh": 559
        },
        {
          "sx": 1114,
          "sy": 17,
          "sw": 523,
          "sh": 559
        }
      ],
      "eat_raw": [
        {
          "sx": 29,
          "sy": 566,
          "sw": 514,
          "sh": 547
        },
        {
          "sx": 577,
          "sy": 566,
          "sw": 514,
          "sh": 547
        },
        {
          "sx": 1094,
          "sy": 566,
          "sw": 514,
          "sh": 547
        }
      ],
      "fish": [
        {
          "sx": 29,
          "sy": 1097,
          "sw": 538,
          "sh": 497
        },
        {
          "sx": 594,
          "sy": 1097,
          "sw": 538,
          "sh": 497
        },
        {
          "sx": 1094,
          "sy": 1097,
          "sw": 538,
          "sh": 497
        }
      ],
      "cook": [
        {
          "sx": 13,
          "sy": 1597,
          "sw": 538,
          "sh": 497
        },
        {
          "sx": 559,
          "sy": 1597,
          "sw": 538,
          "sh": 497
        },
        {
          "sx": 1099,
          "sy": 1597,
          "sw": 538,
          "sh": 497
        }
      ],
      "smith": [
        {
          "sx": 13,
          "sy": 2097,
          "sw": 538,
          "sh": 527
        },
        {
          "sx": 585,
          "sy": 2097,
          "sw": 538,
          "sh": 527
        },
        {
          "sx": 1100,
          "sy": 2097,
          "sw": 538,
          "sh": 527
        }
      ],
      "farm_plow": [
        {
          "sx": 29,
          "sy": 17,
          "sw": 501,
          "sh": 517
        },
        {
          "sx": 585,
          "sy": 17,
          "sw": 501,
          "sh": 476
        },
        {
          "sx": 1114,
          "sy": 17,
          "sw": 501,
          "sh": 476
        }
      ],
      "farm_seed": [
        {
          "sx": 29,
          "sy": 534,
          "sw": 501,
          "sh": 517
        },
        {
          "sx": 576,
          "sy": 534,
          "sw": 501,
          "sh": 517
        },
        {
          "sx": 1104,
          "sy": 534,
          "sw": 501,
          "sh": 517
        }
      ],
      "farm_water": [
        {
          "sx": 29,
          "sy": 1070,
          "sw": 516,
          "sh": 506
        },
        {
          "sx": 552,
          "sy": 1070,
          "sw": 516,
          "sh": 506
        },
        {
          "sx": 1089,
          "sy": 1070,
          "sw": 516,
          "sh": 506
        }
      ],
      "farm_pest": [
        {
          "sx": 19,
          "sy": 1570,
          "sw": 516,
          "sh": 506
        },
        {
          "sx": 574,
          "sy": 1570,
          "sw": 516,
          "sh": 506
        },
        {
          "sx": 1088,
          "sy": 1570,
          "sw": 516,
          "sh": 506
        }
      ],
      "farm_harvest": [
        {
          "sx": 19,
          "sy": 2102,
          "sw": 516,
          "sh": 496
        },
        {
          "sx": 574,
          "sy": 2105,
          "sw": 516,
          "sh": 506
        },
        {
          "sx": 1100,
          "sy": 2105,
          "sw": 516,
          "sh": 506
        }
      ]
    },
    "img": "robot_type2_2"
  },
  "robot_type2_3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type2_3_action",
      "eat_raw": "robot_type2_3_action",
      "fish": "robot_type2_3_action",
      "cook": "robot_type2_3_action",
      "smith": "robot_type2_3_action",
      "farm_plow": "robot_type2_3_action_farm",
      "farm_seed": "robot_type2_3_action_farm",
      "farm_water": "robot_type2_3_action_farm",
      "farm_pest": "robot_type2_3_action_farm",
      "farm_harvest": "robot_type2_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 78,
          "sy": 74,
          "sw": 382,
          "sh": 620
        },
        {
          "sx": 589,
          "sy": 74,
          "sw": 382,
          "sh": 620
        },
        {
          "sx": 1089,
          "sy": 74,
          "sw": 382,
          "sh": 620
        }
      ],
      "move": [
        {
          "sx": 78,
          "sy": 706,
          "sw": 382,
          "sh": 510
        },
        {
          "sx": 581,
          "sy": 706,
          "sw": 382,
          "sh": 510
        },
        {
          "sx": 1081,
          "sy": 706,
          "sw": 382,
          "sh": 510
        }
      ],
      "study": [
        {
          "sx": 78,
          "sy": 1246,
          "sw": 382,
          "sh": 528
        },
        {
          "sx": 604,
          "sy": 1246,
          "sw": 382,
          "sh": 528
        },
        {
          "sx": 1106,
          "sy": 1246,
          "sw": 382,
          "sh": 528
        }
      ],
      "train": [
        {
          "sx": 78,
          "sy": 1791,
          "sw": 382,
          "sh": 528
        },
        {
          "sx": 588,
          "sy": 1791,
          "sw": 390,
          "sh": 528
        },
        {
          "sx": 1086,
          "sy": 1791,
          "sw": 390,
          "sh": 528
        }
      ],
      "sleep": [
        {
          "sx": 9,
          "sy": 2464,
          "sw": 508,
          "sh": 322
        },
        {
          "sx": 513,
          "sy": 2464,
          "sw": 508,
          "sh": 322
        },
        {
          "sx": 1016,
          "sy": 2464,
          "sw": 508,
          "sh": 322
        }
      ],
      "eat_dish": [
        {
          "sx": 30,
          "sy": 74,
          "sw": 486,
          "sh": 482
        },
        {
          "sx": 539,
          "sy": 74,
          "sw": 486,
          "sh": 482
        },
        {
          "sx": 1053,
          "sy": 74,
          "sw": 486,
          "sh": 482
        }
      ],
      "eat_raw": [
        {
          "sx": 65,
          "sy": 633,
          "sw": 401,
          "sh": 482
        },
        {
          "sx": 583,
          "sy": 633,
          "sw": 401,
          "sh": 482
        },
        {
          "sx": 1083,
          "sy": 633,
          "sw": 401,
          "sh": 482
        }
      ],
      "fish": [
        {
          "sx": 65,
          "sy": 1182,
          "sw": 457,
          "sh": 482
        },
        {
          "sx": 594,
          "sy": 1182,
          "sw": 457,
          "sh": 482
        },
        {
          "sx": 1094,
          "sy": 1182,
          "sw": 457,
          "sh": 482
        }
      ],
      "cook": [
        {
          "sx": -1,
          "sy": 1726,
          "sw": 516,
          "sh": 499
        },
        {
          "sx": 511,
          "sy": 1726,
          "sw": 516,
          "sh": 499
        },
        {
          "sx": 1023,
          "sy": 1726,
          "sw": 516,
          "sh": 499
        }
      ],
      "smith": [
        {
          "sx": -1,
          "sy": 2278,
          "sw": 516,
          "sh": 499
        },
        {
          "sx": 529,
          "sy": 2278,
          "sw": 516,
          "sh": 499
        },
        {
          "sx": 1029,
          "sy": 2278,
          "sw": 516,
          "sh": 499
        }
      ],
      "farm_plow": [
        {
          "sx": -1,
          "sy": -9,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 560,
          "sy": -9,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 1060,
          "sy": -9,
          "sw": 468,
          "sh": 527
        }
      ],
      "farm_seed": [
        {
          "sx": -1,
          "sy": 559,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 530,
          "sy": 559,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 1030,
          "sy": 559,
          "sw": 468,
          "sh": 527
        }
      ],
      "farm_water": [
        {
          "sx": -1,
          "sy": 1118,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 565,
          "sy": 1118,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 1065,
          "sy": 1118,
          "sw": 468,
          "sh": 527
        }
      ],
      "farm_pest": [
        {
          "sx": 25,
          "sy": 1677,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 540,
          "sy": 1677,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 1040,
          "sy": 1677,
          "sw": 468,
          "sh": 527
        }
      ],
      "farm_harvest": [
        {
          "sx": 25,
          "sy": 2229,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 578,
          "sy": 2229,
          "sw": 468,
          "sh": 527
        },
        {
          "sx": 1069,
          "sy": 2256,
          "sw": 468,
          "sh": 527
        }
      ]
    },
    "img": "robot_type2_3"
  },
  "robot_type2_4": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type2_4_action",
      "eat_raw": "robot_type2_4_action",
      "fish": "robot_type2_4_action",
      "cook": "robot_type2_4_action",
      "smith": "robot_type2_4_action",
      "farm_plow": "robot_type2_4_action_farm",
      "farm_seed": "robot_type2_4_action_farm",
      "farm_water": "robot_type2_4_action_farm",
      "farm_pest": "robot_type2_4_action_farm",
      "farm_harvest": "robot_type2_4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 127,
          "sy": -10,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 836,
          "sy": -16,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 1556,
          "sy": -16,
          "sw": 494,
          "sh": 389
        }
      ],
      "move": [
        {
          "sx": 127,
          "sy": 434,
          "sw": 389,
          "sh": 389
        },
        {
          "sx": 844,
          "sy": 434,
          "sw": 389,
          "sh": 389
        },
        {
          "sx": 1560,
          "sy": 434,
          "sw": 389,
          "sh": 389
        }
      ],
      "study": [
        {
          "sx": 130,
          "sy": 834,
          "sw": 389,
          "sh": 389
        },
        {
          "sx": 858,
          "sy": 834,
          "sw": 389,
          "sh": 389
        },
        {
          "sx": 1578,
          "sy": 834,
          "sw": 389,
          "sh": 389
        }
      ],
      "train": [
        {
          "sx": 168,
          "sy": 1217,
          "sw": 427,
          "sh": 389
        },
        {
          "sx": 884,
          "sy": 1217,
          "sw": 427,
          "sh": 389
        },
        {
          "sx": 1601,
          "sy": 1217,
          "sw": 427,
          "sh": 389
        }
      ],
      "sleep": [
        {
          "sx": 168,
          "sy": 1652,
          "sw": 427,
          "sh": 301
        },
        {
          "sx": 879,
          "sy": 1652,
          "sw": 427,
          "sh": 301
        },
        {
          "sx": 1608,
          "sy": 1652,
          "sw": 427,
          "sh": 301
        }
      ],
      "eat_dish": [
        {
          "sx": 136,
          "sy": -10,
          "sw": 508,
          "sh": 412
        },
        {
          "sx": 858,
          "sy": -10,
          "sw": 508,
          "sh": 412
        },
        {
          "sx": 1574,
          "sy": -10,
          "sw": 508,
          "sh": 412
        }
      ],
      "eat_raw": [
        {
          "sx": 136,
          "sy": 425,
          "sw": 409,
          "sh": 412
        },
        {
          "sx": 837,
          "sy": 425,
          "sw": 409,
          "sh": 412
        },
        {
          "sx": 1544,
          "sy": 425,
          "sw": 409,
          "sh": 412
        }
      ],
      "fish": [
        {
          "sx": 120,
          "sy": 814,
          "sw": 547,
          "sh": 412
        },
        {
          "sx": 845,
          "sy": 814,
          "sw": 547,
          "sh": 412
        },
        {
          "sx": 1551,
          "sy": 814,
          "sw": 547,
          "sh": 412
        }
      ],
      "cook": [
        {
          "sx": 120,
          "sy": 1197,
          "sw": 547,
          "sh": 392
        },
        {
          "sx": 829,
          "sy": 1197,
          "sw": 547,
          "sh": 392
        },
        {
          "sx": 1568,
          "sy": 1197,
          "sw": 547,
          "sh": 392
        }
      ],
      "smith": [
        {
          "sx": 120,
          "sy": 1575,
          "sw": 488,
          "sh": 379
        },
        {
          "sx": 859,
          "sy": 1577,
          "sw": 488,
          "sh": 392
        },
        {
          "sx": 1573,
          "sy": 1577,
          "sw": 488,
          "sh": 392
        }
      ],
      "farm_plow": [
        {
          "sx": 127,
          "sy": 5,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 856,
          "sy": 5,
          "sw": 530,
          "sh": 389
        },
        {
          "sx": 1556,
          "sy": 5,
          "sw": 530,
          "sh": 389
        }
      ],
      "farm_seed": [
        {
          "sx": 127,
          "sy": 441,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 864,
          "sy": 429,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 1571,
          "sy": 429,
          "sw": 494,
          "sh": 389
        }
      ],
      "farm_water": [
        {
          "sx": 127,
          "sy": 841,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 859,
          "sy": 817,
          "sw": 542,
          "sh": 389
        },
        {
          "sx": 1559,
          "sy": 817,
          "sw": 542,
          "sh": 389
        }
      ],
      "farm_pest": [
        {
          "sx": 127,
          "sy": 1201,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 827,
          "sy": 1201,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 1527,
          "sy": 1201,
          "sw": 494,
          "sh": 389
        }
      ],
      "farm_harvest": [
        {
          "sx": 127,
          "sy": 1556,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 827,
          "sy": 1556,
          "sw": 494,
          "sh": 389
        },
        {
          "sx": 1548,
          "sy": 1556,
          "sw": 494,
          "sh": 389
        }
      ]
    },
    "img": "robot_type2_4"
  },
  "robot_type4": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type4_action",
      "eat_raw": "robot_type4_action",
      "fish": "robot_type4_action",
      "cook": "robot_type4_action",
      "smith": "robot_type4_action",
      "farm_plow": "robot_type4_action_farm",
      "farm_seed": "robot_type4_action_farm",
      "farm_water": "robot_type4_action_farm",
      "farm_pest": "robot_type4_action_farm",
      "farm_harvest": "robot_type4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 173,
          "sy": 41,
          "sw": 282,
          "sh": 478
        },
        {
          "sx": 717,
          "sy": 41,
          "sw": 282,
          "sh": 478
        },
        {
          "sx": 1252,
          "sy": 41,
          "sw": 282,
          "sh": 478
        }
      ],
      "move": [
        {
          "sx": 190,
          "sy": 541,
          "sw": 282,
          "sh": 478
        },
        {
          "sx": 729,
          "sy": 541,
          "sw": 282,
          "sh": 478
        },
        {
          "sx": 1257,
          "sy": 541,
          "sw": 282,
          "sh": 478
        }
      ],
      "study": [
        {
          "sx": 177,
          "sy": 1069,
          "sw": 327,
          "sh": 438
        },
        {
          "sx": 708,
          "sy": 1069,
          "sw": 327,
          "sh": 438
        },
        {
          "sx": 1234,
          "sy": 1069,
          "sw": 327,
          "sh": 438
        }
      ],
      "train": [
        {
          "sx": 75,
          "sy": 1535,
          "sw": 503,
          "sh": 492
        },
        {
          "sx": 611,
          "sy": 1535,
          "sw": 503,
          "sh": 492
        },
        {
          "sx": 1147,
          "sy": 1535,
          "sw": 503,
          "sh": 492
        }
      ],
      "sleep": [
        {
          "sx": 75,
          "sy": 2226,
          "sw": 503,
          "sh": 212
        },
        {
          "sx": 615,
          "sy": 2226,
          "sw": 503,
          "sh": 212
        },
        {
          "sx": 1152,
          "sy": 2226,
          "sw": 503,
          "sh": 212
        }
      ],
      "eat_dish": [
        {
          "sx": 69,
          "sy": 25,
          "sw": 485,
          "sh": 463
        },
        {
          "sx": 644,
          "sy": 25,
          "sw": 485,
          "sh": 463
        },
        {
          "sx": 1212,
          "sy": 25,
          "sw": 485,
          "sh": 463
        }
      ],
      "eat_raw": [
        {
          "sx": 127,
          "sy": 526,
          "sw": 355,
          "sh": 475
        },
        {
          "sx": 702,
          "sy": 526,
          "sw": 355,
          "sh": 475
        },
        {
          "sx": 1260,
          "sy": 526,
          "sw": 355,
          "sh": 475
        }
      ],
      "fish": [
        {
          "sx": 50,
          "sy": 1026,
          "sw": 505,
          "sh": 472
        },
        {
          "sx": 612,
          "sy": 1026,
          "sw": 505,
          "sh": 472
        },
        {
          "sx": 1175,
          "sy": 1026,
          "sw": 505,
          "sh": 472
        }
      ],
      "cook": [
        {
          "sx": 66,
          "sy": 1526,
          "sw": 488,
          "sh": 472
        },
        {
          "sx": 626,
          "sy": 1526,
          "sw": 488,
          "sh": 472
        },
        {
          "sx": 1189,
          "sy": 1526,
          "sw": 488,
          "sh": 472
        }
      ],
      "smith": [
        {
          "sx": 66,
          "sy": 2015,
          "sw": 488,
          "sh": 472
        },
        {
          "sx": 666,
          "sy": 2015,
          "sw": 488,
          "sh": 472
        },
        {
          "sx": 1187,
          "sy": 2015,
          "sw": 488,
          "sh": 472
        }
      ],
      "farm_plow": [
        {
          "sx": 119,
          "sy": 8,
          "sw": 376,
          "sh": 453
        },
        {
          "sx": 680,
          "sy": 8,
          "sw": 385,
          "sh": 453
        },
        {
          "sx": 1246,
          "sy": 8,
          "sw": 385,
          "sh": 453
        }
      ],
      "farm_seed": [
        {
          "sx": 93,
          "sy": 508,
          "sw": 376,
          "sh": 453
        },
        {
          "sx": 664,
          "sy": 508,
          "sw": 376,
          "sh": 453
        },
        {
          "sx": 1233,
          "sy": 508,
          "sw": 376,
          "sh": 453
        }
      ],
      "farm_water": [
        {
          "sx": 67,
          "sy": 1008,
          "sw": 376,
          "sh": 453
        },
        {
          "sx": 648,
          "sy": 1008,
          "sw": 434,
          "sh": 453
        },
        {
          "sx": 1219,
          "sy": 1008,
          "sw": 434,
          "sh": 453
        }
      ],
      "farm_pest": [
        {
          "sx": 16,
          "sy": 1508,
          "sw": 471,
          "sh": 453
        },
        {
          "sx": 604,
          "sy": 1508,
          "sw": 471,
          "sh": 453
        },
        {
          "sx": 1172,
          "sy": 1508,
          "sw": 472,
          "sh": 453
        }
      ],
      "farm_harvest": [
        {
          "sx": 16,
          "sy": 2017,
          "sw": 471,
          "sh": 453
        },
        {
          "sx": 616,
          "sy": 2017,
          "sw": 471,
          "sh": 453
        },
        {
          "sx": 1216,
          "sy": 2017,
          "sw": 471,
          "sh": 453
        }
      ]
    },
    "img": "robot_type4"
  },
  "robot_type4_2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type4_2_action",
      "eat_raw": "robot_type4_2_action",
      "fish": "robot_type4_2_action",
      "cook": "robot_type4_2_action",
      "smith": "robot_type4_2_action",
      "farm_plow": "robot_type4_2_action_farm",
      "farm_seed": "robot_type4_2_action_farm",
      "farm_water": "robot_type4_2_action_farm",
      "farm_pest": "robot_type4_2_action_farm",
      "farm_harvest": "robot_type4_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 360,
          "sy": 68,
          "sw": 437,
          "sh": 348
        },
        {
          "sx": 905,
          "sy": 68,
          "sw": 437,
          "sh": 348
        },
        {
          "sx": 1460,
          "sy": 68,
          "sw": 437,
          "sh": 348
        }
      ],
      "move": [
        {
          "sx": 365,
          "sy": 451,
          "sw": 405,
          "sh": 348
        },
        {
          "sx": 897,
          "sy": 451,
          "sw": 405,
          "sh": 348
        },
        {
          "sx": 1446,
          "sy": 451,
          "sw": 405,
          "sh": 348
        }
      ],
      "study": [
        {
          "sx": 365,
          "sy": 823,
          "sw": 405,
          "sh": 348
        },
        {
          "sx": 903,
          "sy": 823,
          "sw": 405,
          "sh": 348
        },
        {
          "sx": 1478,
          "sy": 823,
          "sw": 405,
          "sh": 348
        }
      ],
      "train": [
        {
          "sx": 334,
          "sy": 1209,
          "sw": 484,
          "sh": 348
        },
        {
          "sx": 889,
          "sy": 1209,
          "sw": 484,
          "sh": 348
        },
        {
          "sx": 1441,
          "sy": 1209,
          "sw": 484,
          "sh": 348
        }
      ],
      "sleep": [
        {
          "sx": 334,
          "sy": 1696,
          "sw": 446,
          "sh": 198
        },
        {
          "sx": 892,
          "sy": 1696,
          "sw": 446,
          "sh": 198
        },
        {
          "sx": 1451,
          "sy": 1696,
          "sw": 446,
          "sh": 198
        }
      ],
      "eat_dish": [
        {
          "sx": 360,
          "sy": 68,
          "sw": 437,
          "sh": 348
        },
        {
          "sx": 920,
          "sy": 68,
          "sw": 437,
          "sh": 348
        },
        {
          "sx": 1473,
          "sy": 68,
          "sw": 437,
          "sh": 348
        }
      ],
      "eat_raw": [
        {
          "sx": 360,
          "sy": 447,
          "sw": 409,
          "sh": 348
        },
        {
          "sx": 913,
          "sy": 447,
          "sw": 409,
          "sh": 348
        },
        {
          "sx": 1470,
          "sy": 447,
          "sw": 409,
          "sh": 348
        }
      ],
      "fish": [
        {
          "sx": 374,
          "sy": 798,
          "sw": 505,
          "sh": 399
        },
        {
          "sx": 941,
          "sy": 798,
          "sw": 512,
          "sh": 399
        },
        {
          "sx": 1484,
          "sy": 798,
          "sw": 512,
          "sh": 399
        }
      ],
      "cook": [
        {
          "sx": 375,
          "sy": 1195,
          "sw": 504,
          "sh": 359
        },
        {
          "sx": 931,
          "sy": 1195,
          "sw": 504,
          "sh": 359
        },
        {
          "sx": 1493,
          "sy": 1195,
          "sw": 504,
          "sh": 359
        }
      ],
      "smith": [
        {
          "sx": 323,
          "sy": 1548,
          "sw": 515,
          "sh": 376
        },
        {
          "sx": 922,
          "sy": 1548,
          "sw": 515,
          "sh": 376
        },
        {
          "sx": 1468,
          "sy": 1548,
          "sw": 515,
          "sh": 376
        }
      ],
      "farm_plow": [
        {
          "sx": 335,
          "sy": 68,
          "sw": 452,
          "sh": 348
        },
        {
          "sx": 894,
          "sy": 68,
          "sw": 465,
          "sh": 348
        },
        {
          "sx": 1410,
          "sy": 68,
          "sw": 542,
          "sh": 348
        }
      ],
      "farm_seed": [
        {
          "sx": 335,
          "sy": 444,
          "sw": 494,
          "sh": 348
        },
        {
          "sx": 895,
          "sy": 444,
          "sw": 494,
          "sh": 348
        },
        {
          "sx": 1443,
          "sy": 444,
          "sw": 494,
          "sh": 348
        }
      ],
      "farm_water": [
        {
          "sx": 351,
          "sy": 818,
          "sw": 494,
          "sh": 348
        },
        {
          "sx": 906,
          "sy": 818,
          "sw": 513,
          "sh": 348
        },
        {
          "sx": 1466,
          "sy": 818,
          "sw": 513,
          "sh": 348
        }
      ],
      "farm_pest": [
        {
          "sx": 365,
          "sy": 1206,
          "sw": 538,
          "sh": 348
        },
        {
          "sx": 921,
          "sy": 1206,
          "sw": 538,
          "sh": 348
        },
        {
          "sx": 1476,
          "sy": 1206,
          "sw": 538,
          "sh": 349
        }
      ],
      "farm_harvest": [
        {
          "sx": 356,
          "sy": 1549,
          "sw": 538,
          "sh": 348
        },
        {
          "sx": 911,
          "sy": 1549,
          "sw": 538,
          "sh": 348
        },
        {
          "sx": 1480,
          "sy": 1549,
          "sw": 538,
          "sh": 348
        }
      ]
    },
    "img": "robot_type4_2"
  },
  "robot_type4_3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type4_3_action",
      "eat_raw": "robot_type4_3_action",
      "fish": "robot_type4_3_action",
      "cook": "robot_type4_3_action",
      "smith": "robot_type4_3_action",
      "farm_plow": "robot_type4_3_action_farm",
      "farm_seed": "robot_type4_3_action_farm",
      "farm_water": "robot_type4_3_action_farm",
      "farm_pest": "robot_type4_3_action_farm",
      "farm_harvest": "robot_type4_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 64,
          "sy": 16,
          "sw": 478,
          "sh": 489
        },
        {
          "sx": 732,
          "sy": 16,
          "sw": 478,
          "sh": 489
        },
        {
          "sx": 1379,
          "sy": 6,
          "sw": 478,
          "sh": 496
        }
      ],
      "move": [
        {
          "sx": 84,
          "sy": 496,
          "sw": 478,
          "sh": 444
        },
        {
          "sx": 757,
          "sy": 501,
          "sw": 478,
          "sh": 443
        },
        {
          "sx": 1391,
          "sy": 501,
          "sw": 478,
          "sh": 443
        }
      ],
      "study": [
        {
          "sx": 60,
          "sy": 940,
          "sw": 541,
          "sh": 419
        },
        {
          "sx": 701,
          "sy": 940,
          "sw": 541,
          "sh": 399
        },
        {
          "sx": 1401,
          "sy": 940,
          "sw": 541,
          "sh": 399
        }
      ],
      "train": [
        {
          "sx": 20,
          "sy": 1369,
          "sw": 626,
          "sh": 419
        },
        {
          "sx": 679,
          "sy": 1340,
          "sw": 640,
          "sh": 468
        },
        {
          "sx": 1343,
          "sy": 1340,
          "sw": 640,
          "sh": 468
        }
      ],
      "sleep": [
        {
          "sx": 20,
          "sy": 1863,
          "sw": 626,
          "sh": 358
        },
        {
          "sx": 697,
          "sy": 1854,
          "sw": 626,
          "sh": 358
        },
        {
          "sx": 1297,
          "sy": 1811,
          "sw": 626,
          "sh": 391
        }
      ],
      "eat_dish": [
        {
          "sx": 63,
          "sy": 16,
          "sw": 585,
          "sh": 431
        },
        {
          "sx": 719,
          "sy": 16,
          "sw": 585,
          "sh": 431
        },
        {
          "sx": 1371,
          "sy": 16,
          "sw": 585,
          "sh": 431
        }
      ],
      "eat_raw": [
        {
          "sx": 63,
          "sy": 458,
          "sw": 445,
          "sh": 431
        },
        {
          "sx": 735,
          "sy": 458,
          "sw": 445,
          "sh": 431
        },
        {
          "sx": 1377,
          "sy": 458,
          "sw": 445,
          "sh": 431
        }
      ],
      "fish": [
        {
          "sx": 77,
          "sy": 883,
          "sw": 542,
          "sh": 447
        },
        {
          "sx": 730,
          "sy": 883,
          "sw": 542,
          "sh": 447
        },
        {
          "sx": 1383,
          "sy": 883,
          "sw": 542,
          "sh": 447
        }
      ],
      "cook": [
        {
          "sx": 77,
          "sy": 1324,
          "sw": 582,
          "sh": 447
        },
        {
          "sx": 753,
          "sy": 1324,
          "sw": 582,
          "sh": 447
        },
        {
          "sx": 1401,
          "sy": 1324,
          "sw": 582,
          "sh": 447
        }
      ],
      "smith": [
        {
          "sx": 77,
          "sy": 1771,
          "sw": 487,
          "sh": 447
        },
        {
          "sx": 749,
          "sy": 1771,
          "sw": 487,
          "sh": 447
        },
        {
          "sx": 1404,
          "sy": 1771,
          "sw": 487,
          "sh": 447
        }
      ],
      "farm_plow": [
        {
          "sx": 108,
          "sy": 16,
          "sw": 477,
          "sh": 431
        },
        {
          "sx": 824,
          "sy": 16,
          "sw": 477,
          "sh": 431
        },
        {
          "sx": 1400,
          "sy": 16,
          "sw": 477,
          "sh": 431
        }
      ],
      "farm_seed": [
        {
          "sx": 108,
          "sy": 450,
          "sw": 477,
          "sh": 431
        },
        {
          "sx": 752,
          "sy": 450,
          "sw": 477,
          "sh": 431
        },
        {
          "sx": 1398,
          "sy": 450,
          "sw": 477,
          "sh": 431
        }
      ],
      "farm_water": [
        {
          "sx": 108,
          "sy": 876,
          "sw": 477,
          "sh": 431
        },
        {
          "sx": 737,
          "sy": 876,
          "sw": 565,
          "sh": 431
        },
        {
          "sx": 1397,
          "sy": 876,
          "sw": 565,
          "sh": 431
        }
      ],
      "farm_pest": [
        {
          "sx": 108,
          "sy": 1324,
          "sw": 579,
          "sh": 431
        },
        {
          "sx": 708,
          "sy": 1324,
          "sw": 606,
          "sh": 431
        },
        {
          "sx": 1353,
          "sy": 1324,
          "sw": 606,
          "sh": 431
        }
      ],
      "farm_harvest": [
        {
          "sx": 107,
          "sy": 1751,
          "sw": 590,
          "sh": 447
        },
        {
          "sx": 707,
          "sy": 1751,
          "sw": 590,
          "sh": 447
        },
        {
          "sx": 1369,
          "sy": 1751,
          "sw": 590,
          "sh": 447
        }
      ]
    },
    "img": "robot_type4_3"
  },
  "robot_type4_4": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type4_4_action",
      "eat_raw": "robot_type4_4_action",
      "fish": "robot_type4_4_action",
      "cook": "robot_type4_4_action",
      "smith": "robot_type4_4_action",
      "farm_plow": "robot_type4_4_action_farm",
      "farm_seed": "robot_type4_4_action_farm",
      "farm_water": "robot_type4_4_action_farm",
      "farm_pest": "robot_type4_4_action_farm",
      "farm_harvest": "robot_type4_4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 115,
          "sy": 0,
          "sw": 420,
          "sh": 456
        },
        {
          "sx": 757,
          "sy": 0,
          "sw": 420,
          "sh": 456
        },
        {
          "sx": 1403,
          "sy": 0,
          "sw": 420,
          "sh": 456
        }
      ],
      "move": [
        {
          "sx": 115,
          "sy": 463,
          "sw": 420,
          "sh": 439
        },
        {
          "sx": 752,
          "sy": 463,
          "sw": 420,
          "sh": 439
        },
        {
          "sx": 1404,
          "sy": 463,
          "sw": 420,
          "sh": 439
        }
      ],
      "study": [
        {
          "sx": 100,
          "sy": 900,
          "sw": 420,
          "sh": 439
        },
        {
          "sx": 750,
          "sy": 900,
          "sw": 420,
          "sh": 439
        },
        {
          "sx": 1395,
          "sy": 900,
          "sw": 420,
          "sh": 439
        }
      ],
      "train": [
        {
          "sx": 41,
          "sy": 1340,
          "sw": 553,
          "sh": 473
        },
        {
          "sx": 693,
          "sy": 1340,
          "sw": 569,
          "sh": 473
        },
        {
          "sx": 1342,
          "sy": 1340,
          "sw": 569,
          "sh": 473
        }
      ],
      "sleep": [
        {
          "sx": 3,
          "sy": 1898,
          "sw": 614,
          "sh": 317
        },
        {
          "sx": 656,
          "sy": 1898,
          "sw": 614,
          "sh": 317
        },
        {
          "sx": 1297,
          "sy": 1898,
          "sw": 614,
          "sh": 317
        }
      ],
      "eat_dish": [
        {
          "sx": 63,
          "sy": 0,
          "sw": 613,
          "sh": 500
        },
        {
          "sx": 702,
          "sy": 0,
          "sw": 613,
          "sh": 500
        },
        {
          "sx": 1310,
          "sy": 0,
          "sw": 613,
          "sh": 500
        }
      ],
      "eat_raw": [
        {
          "sx": 96,
          "sy": 498,
          "sw": 401,
          "sh": 441
        },
        {
          "sx": 757,
          "sy": 498,
          "sw": 401,
          "sh": 441
        },
        {
          "sx": 1395,
          "sy": 498,
          "sw": 401,
          "sh": 441
        }
      ],
      "fish": [
        {
          "sx": 87,
          "sy": 936,
          "sw": 573,
          "sh": 441
        },
        {
          "sx": 728,
          "sy": 936,
          "sw": 573,
          "sh": 441
        },
        {
          "sx": 1355,
          "sy": 936,
          "sw": 573,
          "sh": 441
        }
      ],
      "cook": [
        {
          "sx": 87,
          "sy": 1377,
          "sw": 573,
          "sh": 401
        },
        {
          "sx": 715,
          "sy": 1377,
          "sw": 573,
          "sh": 401
        },
        {
          "sx": 1353,
          "sy": 1377,
          "sw": 573,
          "sh": 401
        }
      ],
      "smith": [
        {
          "sx": 45,
          "sy": 1772,
          "sw": 589,
          "sh": 423
        },
        {
          "sx": 771,
          "sy": 1772,
          "sw": 589,
          "sh": 423
        },
        {
          "sx": 1338,
          "sy": 1772,
          "sw": 589,
          "sh": 423
        }
      ],
      "farm_plow": [
        {
          "sx": 72,
          "sy": 0,
          "sw": 488,
          "sh": 456
        },
        {
          "sx": 704,
          "sy": 0,
          "sw": 536,
          "sh": 456
        },
        {
          "sx": 1386,
          "sy": 0,
          "sw": 536,
          "sh": 456
        }
      ],
      "farm_seed": [
        {
          "sx": 72,
          "sy": 466,
          "sw": 488,
          "sh": 456
        },
        {
          "sx": 689,
          "sy": 469,
          "sw": 565,
          "sh": 441
        },
        {
          "sx": 1335,
          "sy": 469,
          "sw": 565,
          "sh": 441
        }
      ],
      "farm_water": [
        {
          "sx": 72,
          "sy": 905,
          "sw": 488,
          "sh": 456
        },
        {
          "sx": 662,
          "sy": 908,
          "sw": 596,
          "sh": 442
        },
        {
          "sx": 1312,
          "sy": 908,
          "sw": 596,
          "sh": 442
        }
      ],
      "farm_pest": [
        {
          "sx": 72,
          "sy": 1348,
          "sw": 555,
          "sh": 430
        },
        {
          "sx": 714,
          "sy": 1348,
          "sw": 555,
          "sh": 430
        },
        {
          "sx": 1373,
          "sy": 1348,
          "sw": 555,
          "sh": 430
        }
      ],
      "farm_harvest": [
        {
          "sx": 71,
          "sy": 1775,
          "sw": 555,
          "sh": 430
        },
        {
          "sx": 725,
          "sy": 1775,
          "sw": 555,
          "sh": 430
        },
        {
          "sx": 1363,
          "sy": 1775,
          "sw": 555,
          "sh": 430
        }
      ]
    },
    "img": "robot_type4_4"
  },
  "robot_type1": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type1_action",
      "eat_raw": "robot_type1_action",
      "fish": "robot_type1_action",
      "cook": "robot_type1_action",
      "smith": "robot_type1_action",
      "farm_plow": "robot_type1_action_farm",
      "farm_seed": "robot_type1_action_farm",
      "farm_water": "robot_type1_action_farm",
      "farm_pest": "robot_type1_action_farm",
      "farm_harvest": "robot_type1_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 107,
          "sy": 6,
          "sw": 319,
          "sh": 541
        },
        {
          "sx": 664,
          "sy": 6,
          "sw": 319,
          "sh": 541
        },
        {
          "sx": 1226,
          "sy": 6,
          "sw": 319,
          "sh": 541
        }
      ],
      "move": [
        {
          "sx": 98,
          "sy": 554,
          "sw": 329,
          "sh": 519
        },
        {
          "sx": 663,
          "sy": 554,
          "sw": 330,
          "sh": 519
        },
        {
          "sx": 1220,
          "sy": 554,
          "sw": 330,
          "sh": 519
        }
      ],
      "study": [
        {
          "sx": 98,
          "sy": 1106,
          "sw": 367,
          "sh": 494
        },
        {
          "sx": 666,
          "sy": 1106,
          "sw": 367,
          "sh": 494
        },
        {
          "sx": 1225,
          "sy": 1106,
          "sw": 367,
          "sh": 494
        }
      ],
      "train": [
        {
          "sx": 20,
          "sy": 1606,
          "sw": 526,
          "sh": 551
        },
        {
          "sx": 570,
          "sy": 1606,
          "sw": 535,
          "sh": 551
        },
        {
          "sx": 1121,
          "sy": 1605,
          "sw": 535,
          "sh": 551
        }
      ],
      "sleep": [
        {
          "sx": 5,
          "sy": 2253,
          "sw": 547,
          "sh": 310
        },
        {
          "sx": 559,
          "sy": 2253,
          "sw": 547,
          "sh": 310
        },
        {
          "sx": 1101,
          "sy": 2253,
          "sw": 547,
          "sh": 310
        }
      ],
      "eat_dish": [
        {
          "sx": 107,
          "sy": 6,
          "sw": 481,
          "sh": 541
        },
        {
          "sx": 639,
          "sy": 6,
          "sw": 481,
          "sh": 541
        },
        {
          "sx": 1171,
          "sy": 6,
          "sw": 481,
          "sh": 541
        }
      ],
      "eat_raw": [
        {
          "sx": 123,
          "sy": 545,
          "sw": 340,
          "sh": 520
        },
        {
          "sx": 655,
          "sy": 545,
          "sw": 340,
          "sh": 520
        },
        {
          "sx": 1200,
          "sy": 545,
          "sw": 340,
          "sh": 520
        }
      ],
      "fish": [
        {
          "sx": 79,
          "sy": 1045,
          "sw": 460,
          "sh": 520
        },
        {
          "sx": 588,
          "sy": 1045,
          "sw": 460,
          "sh": 520
        },
        {
          "sx": 1112,
          "sy": 1045,
          "sw": 460,
          "sh": 520
        }
      ],
      "cook": [
        {
          "sx": 79,
          "sy": 1552,
          "sw": 460,
          "sh": 520
        },
        {
          "sx": 605,
          "sy": 1552,
          "sw": 460,
          "sh": 520
        },
        {
          "sx": 1125,
          "sy": 1552,
          "sw": 460,
          "sh": 520
        }
      ],
      "smith": [
        {
          "sx": 61,
          "sy": 2081,
          "sw": 520,
          "sh": 486
        },
        {
          "sx": 637,
          "sy": 2081,
          "sw": 458,
          "sh": 486
        },
        {
          "sx": 1104,
          "sy": 2081,
          "sw": 515,
          "sh": 486
        }
      ],
      "farm_plow": [
        {
          "sx": -3,
          "sy": 6,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 493,
          "sy": 6,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 995,
          "sy": 6,
          "sw": 607,
          "sh": 528
        }
      ],
      "farm_seed": [
        {
          "sx": -3,
          "sy": 534,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 585,
          "sy": 534,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 1026,
          "sy": 534,
          "sw": 577,
          "sh": 528
        }
      ],
      "farm_water": [
        {
          "sx": -3,
          "sy": 1062,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 511,
          "sy": 1062,
          "sw": 595,
          "sh": 528
        },
        {
          "sx": 1102,
          "sy": 1062,
          "sw": 500,
          "sh": 528
        }
      ],
      "farm_pest": [
        {
          "sx": -3,
          "sy": 1606,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 551,
          "sy": 1606,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 1051,
          "sy": 1606,
          "sw": 608,
          "sh": 528
        }
      ],
      "farm_harvest": [
        {
          "sx": -10,
          "sy": 2108,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 507,
          "sy": 2108,
          "sw": 608,
          "sh": 528
        },
        {
          "sx": 1007,
          "sy": 2108,
          "sw": 608,
          "sh": 528
        }
      ]
    },
    "img": "robot_type1"
  },
  "robot_type1_2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type1_2_action",
      "eat_raw": "robot_type1_2_action",
      "fish": "robot_type1_2_action",
      "cook": "robot_type1_2_action",
      "smith": "robot_type1_2_action",
      "farm_plow": "robot_type1_2_action_farm",
      "farm_seed": "robot_type1_2_action_farm",
      "farm_water": "robot_type1_2_action_farm",
      "farm_pest": "robot_type1_2_action_farm",
      "farm_harvest": "robot_type1_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 64,
          "sy": 0,
          "sw": 538,
          "sh": 470
        },
        {
          "sx": 689,
          "sy": 0,
          "sw": 538,
          "sh": 470
        },
        {
          "sx": 1328,
          "sy": 0,
          "sw": 538,
          "sh": 470
        }
      ],
      "move": [
        {
          "sx": 134,
          "sy": 488,
          "sw": 438,
          "sh": 486
        },
        {
          "sx": 754,
          "sy": 488,
          "sw": 438,
          "sh": 486
        },
        {
          "sx": 1419,
          "sy": 488,
          "sw": 438,
          "sh": 486
        }
      ],
      "study": [
        {
          "sx": 106,
          "sy": 969,
          "sw": 438,
          "sh": 411
        },
        {
          "sx": 738,
          "sy": 969,
          "sw": 438,
          "sh": 411
        },
        {
          "sx": 1395,
          "sy": 969,
          "sw": 438,
          "sh": 411
        }
      ],
      "train": [
        {
          "sx": 27,
          "sy": 1381,
          "sw": 612,
          "sh": 492
        },
        {
          "sx": 687,
          "sy": 1381,
          "sw": 612,
          "sh": 492
        },
        {
          "sx": 1287,
          "sy": 1362,
          "sw": 634,
          "sh": 517
        }
      ],
      "sleep": [
        {
          "sx": 27,
          "sy": 1893,
          "sw": 612,
          "sh": 356
        },
        {
          "sx": 661,
          "sy": 1893,
          "sw": 612,
          "sh": 356
        },
        {
          "sx": 1291,
          "sy": 1893,
          "sw": 612,
          "sh": 356
        }
      ],
      "eat_dish": [
        {
          "sx": 25,
          "sy": 0,
          "sw": 620,
          "sh": 447
        },
        {
          "sx": 665,
          "sy": 0,
          "sw": 620,
          "sh": 447
        },
        {
          "sx": 1304,
          "sy": 0,
          "sw": 620,
          "sh": 447
        }
      ],
      "eat_raw": [
        {
          "sx": 25,
          "sy": 452,
          "sw": 555,
          "sh": 447
        },
        {
          "sx": 655,
          "sy": 452,
          "sw": 555,
          "sh": 447
        },
        {
          "sx": 1286,
          "sy": 452,
          "sw": 555,
          "sh": 447
        }
      ],
      "fish": [
        {
          "sx": 50,
          "sy": 901,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 714,
          "sy": 901,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 1353,
          "sy": 901,
          "sw": 604,
          "sh": 445
        }
      ],
      "cook": [
        {
          "sx": 50,
          "sy": 1349,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 682,
          "sy": 1349,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 1304,
          "sy": 1349,
          "sw": 604,
          "sh": 445
        }
      ],
      "smith": [
        {
          "sx": 50,
          "sy": 1798,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 701,
          "sy": 1798,
          "sw": 604,
          "sh": 445
        },
        {
          "sx": 1328,
          "sy": 1798,
          "sw": 604,
          "sh": 445
        }
      ],
      "farm_plow": [
        {
          "sx": 64,
          "sy": 0,
          "sw": 578,
          "sh": 470
        },
        {
          "sx": 704,
          "sy": 0,
          "sw": 578,
          "sh": 470
        },
        {
          "sx": 1345,
          "sy": 0,
          "sw": 578,
          "sh": 470
        }
      ],
      "farm_seed": [
        {
          "sx": 46,
          "sy": 465,
          "sw": 578,
          "sh": 443
        },
        {
          "sx": 692,
          "sy": 465,
          "sw": 578,
          "sh": 443
        },
        {
          "sx": 1340,
          "sy": 465,
          "sw": 578,
          "sh": 443
        }
      ],
      "farm_water": [
        {
          "sx": 40,
          "sy": 909,
          "sw": 578,
          "sh": 443
        },
        {
          "sx": 675,
          "sy": 909,
          "sw": 578,
          "sh": 443
        },
        {
          "sx": 1331,
          "sy": 909,
          "sw": 578,
          "sh": 443
        }
      ],
      "farm_pest": [
        {
          "sx": 35,
          "sy": 1355,
          "sw": 605,
          "sh": 443
        },
        {
          "sx": 681,
          "sy": 1355,
          "sw": 605,
          "sh": 443
        },
        {
          "sx": 1318,
          "sy": 1355,
          "sw": 605,
          "sh": 443
        }
      ],
      "farm_harvest": [
        {
          "sx": 25,
          "sy": 1787,
          "sw": 605,
          "sh": 443
        },
        {
          "sx": 678,
          "sy": 1787,
          "sw": 605,
          "sh": 443
        },
        {
          "sx": 1314,
          "sy": 1787,
          "sw": 605,
          "sh": 443
        }
      ]
    },
    "img": "robot_type1_2"
  },
  "robot_type1_3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type1_3_action",
      "eat_raw": "robot_type1_3_action",
      "fish": "robot_type1_3_action",
      "cook": "robot_type1_3_action",
      "smith": "robot_type1_3_action",
      "farm_plow": "robot_type1_3_action_farm",
      "farm_seed": "robot_type1_3_action_farm",
      "farm_water": "robot_type1_3_action_farm",
      "farm_pest": "robot_type1_3_action_farm",
      "farm_harvest": "robot_type1_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 89,
          "sy": 52,
          "sw": 378,
          "sh": 498
        },
        {
          "sx": 645,
          "sy": 52,
          "sw": 378,
          "sh": 498
        },
        {
          "sx": 1200,
          "sy": 52,
          "sw": 378,
          "sh": 498
        }
      ],
      "move": [
        {
          "sx": 89,
          "sy": 560,
          "sw": 378,
          "sh": 498
        },
        {
          "sx": 666,
          "sy": 560,
          "sw": 378,
          "sh": 498
        },
        {
          "sx": 1206,
          "sy": 560,
          "sw": 378,
          "sh": 498
        }
      ],
      "study": [
        {
          "sx": 89,
          "sy": 1094,
          "sw": 378,
          "sh": 472
        },
        {
          "sx": 657,
          "sy": 1094,
          "sw": 378,
          "sh": 472
        },
        {
          "sx": 1204,
          "sy": 1094,
          "sw": 378,
          "sh": 472
        }
      ],
      "train": [
        {
          "sx": 28,
          "sy": 1594,
          "sw": 518,
          "sh": 534
        },
        {
          "sx": 555,
          "sy": 1594,
          "sw": 558,
          "sh": 534
        },
        {
          "sx": 1117,
          "sy": 1594,
          "sw": 558,
          "sh": 534
        }
      ],
      "sleep": [
        {
          "sx": -5,
          "sy": 2203,
          "sw": 563,
          "sh": 373
        },
        {
          "sx": 554,
          "sy": 2203,
          "sw": 563,
          "sh": 373
        },
        {
          "sx": 1107,
          "sy": 2203,
          "sw": 563,
          "sh": 373
        }
      ],
      "eat_dish": [
        {
          "sx": 37,
          "sy": 30,
          "sw": 523,
          "sh": 486
        },
        {
          "sx": 609,
          "sy": 30,
          "sw": 523,
          "sh": 486
        },
        {
          "sx": 1172,
          "sy": 30,
          "sw": 523,
          "sh": 486
        }
      ],
      "eat_raw": [
        {
          "sx": 37,
          "sy": 539,
          "sw": 523,
          "sh": 486
        },
        {
          "sx": 598,
          "sy": 539,
          "sw": 523,
          "sh": 486
        },
        {
          "sx": 1123,
          "sy": 539,
          "sw": 523,
          "sh": 486
        }
      ],
      "fish": [
        {
          "sx": -2,
          "sy": 1039,
          "sw": 558,
          "sh": 486
        },
        {
          "sx": 556,
          "sy": 1039,
          "sw": 558,
          "sh": 486
        },
        {
          "sx": 1110,
          "sy": 1039,
          "sw": 558,
          "sh": 486
        }
      ],
      "cook": [
        {
          "sx": 56,
          "sy": 1539,
          "sw": 513,
          "sh": 486
        },
        {
          "sx": 622,
          "sy": 1539,
          "sw": 513,
          "sh": 486
        },
        {
          "sx": 1168,
          "sy": 1539,
          "sw": 513,
          "sh": 486
        }
      ],
      "smith": [
        {
          "sx": 12,
          "sy": 2039,
          "sw": 549,
          "sh": 486
        },
        {
          "sx": 599,
          "sy": 2039,
          "sw": 549,
          "sh": 486
        },
        {
          "sx": 1137,
          "sy": 2039,
          "sw": 549,
          "sh": 486
        }
      ],
      "farm_plow": [
        {
          "sx": 66,
          "sy": 52,
          "sw": 479,
          "sh": 462
        },
        {
          "sx": 639,
          "sy": 52,
          "sw": 479,
          "sh": 461
        },
        {
          "sx": 1193,
          "sy": 52,
          "sw": 479,
          "sh": 461
        }
      ],
      "farm_seed": [
        {
          "sx": 66,
          "sy": 552,
          "sw": 479,
          "sh": 483
        },
        {
          "sx": 627,
          "sy": 552,
          "sw": 479,
          "sh": 483
        },
        {
          "sx": 1184,
          "sy": 552,
          "sw": 479,
          "sh": 483
        }
      ],
      "farm_water": [
        {
          "sx": 66,
          "sy": 1071,
          "sw": 479,
          "sh": 483
        },
        {
          "sx": 630,
          "sy": 1071,
          "sw": 479,
          "sh": 483
        },
        {
          "sx": 1192,
          "sy": 1071,
          "sw": 479,
          "sh": 483
        }
      ],
      "farm_pest": [
        {
          "sx": 34,
          "sy": 1571,
          "sw": 525,
          "sh": 483
        },
        {
          "sx": 591,
          "sy": 1571,
          "sw": 525,
          "sh": 483
        },
        {
          "sx": 1150,
          "sy": 1571,
          "sw": 525,
          "sh": 483
        }
      ],
      "farm_harvest": [
        {
          "sx": 34,
          "sy": 2071,
          "sw": 525,
          "sh": 483
        },
        {
          "sx": 608,
          "sy": 2071,
          "sw": 525,
          "sh": 483
        },
        {
          "sx": 1123,
          "sy": 2071,
          "sw": 525,
          "sh": 483
        }
      ]
    },
    "img": "robot_type1_3"
  },
  "robot_type5": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type5_action",
      "eat_raw": "robot_type5_action",
      "fish": "robot_type5_action",
      "cook": "robot_type5_action",
      "smith": "robot_type5_action",
      "farm_plow": "robot_type5_action_farm",
      "farm_seed": "robot_type5_action_farm",
      "farm_water": "robot_type5_action_farm",
      "farm_pest": "robot_type5_action_farm",
      "farm_harvest": "robot_type5_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 117,
          "sy": 51,
          "sw": 317,
          "sh": 477
        },
        {
          "sx": 698,
          "sy": 51,
          "sw": 317,
          "sh": 477
        },
        {
          "sx": 1269,
          "sy": 51,
          "sw": 317,
          "sh": 477
        }
      ],
      "move": [
        {
          "sx": 117,
          "sy": 551,
          "sw": 317,
          "sh": 477
        },
        {
          "sx": 717,
          "sy": 551,
          "sw": 317,
          "sh": 477
        },
        {
          "sx": 1293,
          "sy": 551,
          "sw": 317,
          "sh": 477
        }
      ],
      "study": [
        {
          "sx": 102,
          "sy": 1097,
          "sw": 318,
          "sh": 408
        },
        {
          "sx": 701,
          "sy": 1097,
          "sw": 318,
          "sh": 408
        },
        {
          "sx": 1279,
          "sy": 1097,
          "sw": 318,
          "sh": 408
        }
      ],
      "train": [
        {
          "sx": 13,
          "sy": 1518,
          "sw": 503,
          "sh": 464
        },
        {
          "sx": 613,
          "sy": 1518,
          "sw": 503,
          "sh": 464
        },
        {
          "sx": 1200,
          "sy": 1518,
          "sw": 503,
          "sh": 464
        }
      ],
      "sleep": [
        {
          "sx": 13,
          "sy": 2106,
          "sw": 503,
          "sh": 285
        },
        {
          "sx": 613,
          "sy": 2106,
          "sw": 503,
          "sh": 285
        },
        {
          "sx": 1184,
          "sy": 2106,
          "sw": 503,
          "sh": 285
        }
      ],
      "eat_dish": [
        {
          "sx": 10,
          "sy": 24,
          "sw": 554,
          "sh": 477
        },
        {
          "sx": 610,
          "sy": 24,
          "sw": 554,
          "sh": 477
        },
        {
          "sx": 1187,
          "sy": 24,
          "sw": 554,
          "sh": 477
        }
      ],
      "eat_raw": [
        {
          "sx": 95,
          "sy": 514,
          "sw": 375,
          "sh": 477
        },
        {
          "sx": 670,
          "sy": 514,
          "sw": 375,
          "sh": 477
        },
        {
          "sx": 1233,
          "sy": 514,
          "sw": 375,
          "sh": 477
        }
      ],
      "fish": [
        {
          "sx": -3,
          "sy": 985,
          "sw": 534,
          "sh": 477
        },
        {
          "sx": 578,
          "sy": 985,
          "sw": 534,
          "sh": 477
        },
        {
          "sx": 1160,
          "sy": 985,
          "sw": 534,
          "sh": 477
        }
      ],
      "cook": [
        {
          "sx": 6,
          "sy": 1472,
          "sw": 546,
          "sh": 477
        },
        {
          "sx": 593,
          "sy": 1472,
          "sw": 546,
          "sh": 477
        },
        {
          "sx": 1168,
          "sy": 1472,
          "sw": 546,
          "sh": 477
        }
      ],
      "smith": [
        {
          "sx": 6,
          "sy": 1942,
          "sw": 551,
          "sh": 477
        },
        {
          "sx": 606,
          "sy": 1942,
          "sw": 551,
          "sh": 477
        },
        {
          "sx": 1204,
          "sy": 1942,
          "sw": 551,
          "sh": 477
        }
      ],
      "farm_plow": [
        {
          "sx": 6,
          "sy": 13,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 586,
          "sy": 10,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 1166,
          "sy": 10,
          "sw": 558,
          "sh": 477
        }
      ],
      "farm_seed": [
        {
          "sx": 6,
          "sy": 507,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 587,
          "sy": 507,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 1164,
          "sy": 507,
          "sw": 558,
          "sh": 477
        }
      ],
      "farm_water": [
        {
          "sx": 6,
          "sy": 1000,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 587,
          "sy": 1000,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 1165,
          "sy": 1000,
          "sw": 558,
          "sh": 477
        }
      ],
      "farm_pest": [
        {
          "sx": 6,
          "sy": 1500,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 606,
          "sy": 1500,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 1206,
          "sy": 1500,
          "sw": 558,
          "sh": 477
        }
      ],
      "farm_harvest": [
        {
          "sx": 52,
          "sy": 1956,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 652,
          "sy": 1956,
          "sw": 558,
          "sh": 477
        },
        {
          "sx": 1233,
          "sy": 1956,
          "sw": 558,
          "sh": 477
        }
      ]
    },
    "img": "robot_type5"
  },
  "robot_type5_2": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type5_2_action",
      "eat_raw": "robot_type5_2_action",
      "fish": "robot_type5_2_action",
      "cook": "robot_type5_2_action",
      "smith": "robot_type5_2_action",
      "farm_plow": "robot_type5_2_action_farm",
      "farm_seed": "robot_type5_2_action_farm",
      "farm_water": "robot_type5_2_action_farm",
      "farm_pest": "robot_type5_2_action_farm",
      "farm_harvest": "robot_type5_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 61,
          "sy": 47,
          "sw": 379,
          "sh": 570
        },
        {
          "sx": 609,
          "sy": 47,
          "sw": 379,
          "sh": 570
        },
        {
          "sx": 1136,
          "sy": 47,
          "sw": 379,
          "sh": 570
        }
      ],
      "move": [
        {
          "sx": 61,
          "sy": 610,
          "sw": 379,
          "sh": 527
        },
        {
          "sx": 614,
          "sy": 610,
          "sw": 379,
          "sh": 527
        },
        {
          "sx": 1144,
          "sy": 610,
          "sw": 379,
          "sh": 527
        }
      ],
      "study": [
        {
          "sx": 48,
          "sy": 1154,
          "sw": 432,
          "sh": 475
        },
        {
          "sx": 586,
          "sy": 1154,
          "sw": 432,
          "sh": 468
        },
        {
          "sx": 1086,
          "sy": 1154,
          "sw": 432,
          "sh": 468
        }
      ],
      "train": [
        {
          "sx": 48,
          "sy": 1627,
          "sw": 498,
          "sh": 554
        },
        {
          "sx": 578,
          "sy": 1627,
          "sw": 498,
          "sh": 554
        },
        {
          "sx": 1090,
          "sy": 1627,
          "sw": 498,
          "sh": 554
        }
      ],
      "sleep": [
        {
          "sx": 48,
          "sy": 2346,
          "sw": 498,
          "sh": 292
        },
        {
          "sx": 548,
          "sy": 2346,
          "sw": 513,
          "sh": 292
        },
        {
          "sx": 1081,
          "sy": 2346,
          "sw": 513,
          "sh": 292
        }
      ],
      "eat_dish": [
        {
          "sx": 41,
          "sy": 47,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 571,
          "sy": 47,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 1105,
          "sy": 47,
          "sw": 497,
          "sh": 486
        }
      ],
      "eat_raw": [
        {
          "sx": 41,
          "sy": 579,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 568,
          "sy": 579,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 1101,
          "sy": 579,
          "sw": 497,
          "sh": 486
        }
      ],
      "fish": [
        {
          "sx": 41,
          "sy": 1112,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 579,
          "sy": 1112,
          "sw": 497,
          "sh": 486
        },
        {
          "sx": 1109,
          "sy": 1112,
          "sw": 497,
          "sh": 486
        }
      ],
      "cook": [
        {
          "sx": 3,
          "sy": 1642,
          "sw": 524,
          "sh": 486
        },
        {
          "sx": 527,
          "sy": 1642,
          "sw": 524,
          "sh": 486
        },
        {
          "sx": 1050,
          "sy": 1642,
          "sw": 524,
          "sh": 486
        }
      ],
      "smith": [
        {
          "sx": 3,
          "sy": 2135,
          "sw": 524,
          "sh": 531
        },
        {
          "sx": 533,
          "sy": 2135,
          "sw": 524,
          "sh": 531
        },
        {
          "sx": 1054,
          "sy": 2135,
          "sw": 524,
          "sh": 531
        }
      ],
      "farm_plow": [
        {
          "sx": 34,
          "sy": -14,
          "sw": 495,
          "sh": 545
        },
        {
          "sx": 532,
          "sy": -14,
          "sw": 541,
          "sh": 545
        },
        {
          "sx": 1032,
          "sy": -14,
          "sw": 541,
          "sh": 545
        }
      ],
      "farm_seed": [
        {
          "sx": 34,
          "sy": 530,
          "sw": 495,
          "sh": 545
        },
        {
          "sx": 571,
          "sy": 530,
          "sw": 495,
          "sh": 545
        },
        {
          "sx": 1071,
          "sy": 530,
          "sw": 495,
          "sh": 545
        }
      ],
      "farm_water": [
        {
          "sx": 34,
          "sy": 1054,
          "sw": 495,
          "sh": 545
        },
        {
          "sx": 576,
          "sy": 1054,
          "sw": 495,
          "sh": 545
        },
        {
          "sx": 1087,
          "sy": 1054,
          "sw": 495,
          "sh": 545
        }
      ],
      "farm_pest": [
        {
          "sx": 13,
          "sy": 1586,
          "sw": 518,
          "sh": 535
        },
        {
          "sx": 553,
          "sy": 1586,
          "sw": 518,
          "sh": 535
        },
        {
          "sx": 1068,
          "sy": 1586,
          "sw": 518,
          "sh": 535
        }
      ],
      "farm_harvest": [
        {
          "sx": 13,
          "sy": 2126,
          "sw": 518,
          "sh": 526
        },
        {
          "sx": 534,
          "sy": 2126,
          "sw": 518,
          "sh": 526
        },
        {
          "sx": 1050,
          "sy": 2126,
          "sw": 518,
          "sh": 526
        }
      ]
    },
    "img": "robot_type5_2"
  },
  "robot_type5_3": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type5_3_action",
      "eat_raw": "robot_type5_3_action",
      "fish": "robot_type5_3_action",
      "cook": "robot_type5_3_action",
      "smith": "robot_type5_3_action",
      "farm_plow": "robot_type5_3_action_farm",
      "farm_seed": "robot_type5_3_action_farm",
      "farm_water": "robot_type5_3_action_farm",
      "farm_pest": "robot_type5_3_action_farm",
      "farm_harvest": "robot_type5_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 104,
          "sy": 38,
          "sw": 367,
          "sh": 498
        },
        {
          "sx": 697,
          "sy": 38,
          "sw": 367,
          "sh": 498
        },
        {
          "sx": 1285,
          "sy": 38,
          "sw": 367,
          "sh": 498
        }
      ],
      "move": [
        {
          "sx": 104,
          "sy": 538,
          "sw": 367,
          "sh": 498
        },
        {
          "sx": 692,
          "sy": 538,
          "sw": 367,
          "sh": 498
        },
        {
          "sx": 1292,
          "sy": 538,
          "sw": 367,
          "sh": 498
        }
      ],
      "study": [
        {
          "sx": 104,
          "sy": 1037,
          "sw": 443,
          "sh": 498
        },
        {
          "sx": 683,
          "sy": 1037,
          "sw": 443,
          "sh": 498
        },
        {
          "sx": 1266,
          "sy": 1037,
          "sw": 443,
          "sh": 498
        }
      ],
      "train": [
        {
          "sx": 7,
          "sy": 1537,
          "sw": 601,
          "sh": 498
        },
        {
          "sx": 594,
          "sy": 1537,
          "sw": 584,
          "sh": 498
        },
        {
          "sx": 1171,
          "sy": 1498,
          "sw": 600,
          "sh": 519
        }
      ],
      "sleep": [
        {
          "sx": 7,
          "sy": 2089,
          "sw": 601,
          "sh": 304
        },
        {
          "sx": 575,
          "sy": 2089,
          "sw": 601,
          "sh": 304
        },
        {
          "sx": 1152,
          "sy": 2089,
          "sw": 601,
          "sh": 304
        }
      ],
      "eat_dish": [
        {
          "sx": 51,
          "sy": 38,
          "sw": 504,
          "sh": 454
        },
        {
          "sx": 632,
          "sy": 38,
          "sw": 504,
          "sh": 454
        },
        {
          "sx": 1217,
          "sy": 38,
          "sw": 504,
          "sh": 454
        }
      ],
      "eat_raw": [
        {
          "sx": 51,
          "sy": 524,
          "sw": 504,
          "sh": 454
        },
        {
          "sx": 651,
          "sy": 524,
          "sw": 504,
          "sh": 454
        },
        {
          "sx": 1223,
          "sy": 524,
          "sw": 504,
          "sh": 454
        }
      ],
      "fish": [
        {
          "sx": 51,
          "sy": 1005,
          "sw": 596,
          "sh": 454
        },
        {
          "sx": 651,
          "sy": 1005,
          "sw": 596,
          "sh": 454
        },
        {
          "sx": 1237,
          "sy": 1005,
          "sw": 596,
          "sh": 454
        }
      ],
      "cook": [
        {
          "sx": 2,
          "sy": 1473,
          "sw": 596,
          "sh": 454
        },
        {
          "sx": 594,
          "sy": 1473,
          "sw": 596,
          "sh": 454
        },
        {
          "sx": 1189,
          "sy": 1473,
          "sw": 578,
          "sh": 454
        }
      ],
      "smith": [
        {
          "sx": 2,
          "sy": 1924,
          "sw": 596,
          "sh": 479
        },
        {
          "sx": 600,
          "sy": 1924,
          "sw": 596,
          "sh": 479
        },
        {
          "sx": 1200,
          "sy": 1921,
          "sw": 596,
          "sh": 479
        }
      ],
      "farm_plow": [
        {
          "sx": 83,
          "sy": 11,
          "sw": 475,
          "sh": 498
        },
        {
          "sx": 683,
          "sy": 11,
          "sw": 482,
          "sh": 498
        },
        {
          "sx": 1265,
          "sy": 11,
          "sw": 482,
          "sh": 498
        }
      ],
      "farm_seed": [
        {
          "sx": 83,
          "sy": 495,
          "sw": 475,
          "sh": 487
        },
        {
          "sx": 669,
          "sy": 495,
          "sw": 487,
          "sh": 487
        },
        {
          "sx": 1248,
          "sy": 495,
          "sw": 487,
          "sh": 487
        }
      ],
      "farm_water": [
        {
          "sx": 83,
          "sy": 968,
          "sw": 475,
          "sh": 487
        },
        {
          "sx": 668,
          "sy": 968,
          "sw": 480,
          "sh": 487
        },
        {
          "sx": 1253,
          "sy": 968,
          "sw": 488,
          "sh": 487
        }
      ],
      "farm_pest": [
        {
          "sx": 34,
          "sy": 1452,
          "sw": 512,
          "sh": 476
        },
        {
          "sx": 634,
          "sy": 1452,
          "sw": 512,
          "sh": 476
        },
        {
          "sx": 1206,
          "sy": 1452,
          "sw": 527,
          "sh": 476
        }
      ],
      "farm_harvest": [
        {
          "sx": 28,
          "sy": 1933,
          "sw": 531,
          "sh": 476
        },
        {
          "sx": 628,
          "sy": 1933,
          "sw": 531,
          "sh": 476
        },
        {
          "sx": 1201,
          "sy": 1933,
          "sw": 531,
          "sh": 476
        }
      ]
    },
    "img": "robot_type5_3"
  },
  "robot_type5_4": {
    "scale": 0.2,
    "actionImages": {
      "eat_dish": "robot_type5_4_action",
      "eat_raw": "robot_type5_4_action",
      "fish": "robot_type5_4_action",
      "cook": "robot_type5_4_action",
      "smith": "robot_type5_4_action",
      "farm_plow": "robot_type5_4_action_farm",
      "farm_seed": "robot_type5_4_action_farm",
      "farm_water": "robot_type5_4_action_farm",
      "farm_pest": "robot_type5_4_action_farm",
      "farm_harvest": "robot_type5_4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 79,
          "sy": 21,
          "sw": 359,
          "sh": 549
        },
        {
          "sx": 617,
          "sy": 21,
          "sw": 359,
          "sh": 549
        },
        {
          "sx": 1156,
          "sy": 21,
          "sw": 359,
          "sh": 549
        }
      ],
      "move": [
        {
          "sx": 79,
          "sy": 560,
          "sw": 359,
          "sh": 541
        },
        {
          "sx": 632,
          "sy": 560,
          "sw": 359,
          "sh": 541
        },
        {
          "sx": 1164,
          "sy": 560,
          "sw": 359,
          "sh": 541
        }
      ],
      "study": [
        {
          "sx": 79,
          "sy": 1097,
          "sw": 394,
          "sh": 516
        },
        {
          "sx": 621,
          "sy": 1097,
          "sw": 394,
          "sh": 516
        },
        {
          "sx": 1147,
          "sy": 1097,
          "sw": 394,
          "sh": 516
        }
      ],
      "train": [
        {
          "sx": 79,
          "sy": 1597,
          "sw": 462,
          "sh": 516
        },
        {
          "sx": 633,
          "sy": 1597,
          "sw": 462,
          "sh": 516
        },
        {
          "sx": 1140,
          "sy": 1597,
          "sw": 462,
          "sh": 516
        }
      ],
      "sleep": [
        {
          "sx": -10,
          "sy": 2252,
          "sw": 549,
          "sh": 367
        },
        {
          "sx": 537,
          "sy": 2198,
          "sw": 549,
          "sh": 412
        },
        {
          "sx": 1074,
          "sy": 2179,
          "sw": 549,
          "sh": 431
        }
      ],
      "eat_dish": [
        {
          "sx": 61,
          "sy": 21,
          "sw": 519,
          "sh": 526
        },
        {
          "sx": 612,
          "sy": 21,
          "sw": 519,
          "sh": 526
        },
        {
          "sx": 1131,
          "sy": 21,
          "sw": 475,
          "sh": 526
        }
      ],
      "eat_raw": [
        {
          "sx": 61,
          "sy": 539,
          "sw": 407,
          "sh": 522
        },
        {
          "sx": 611,
          "sy": 539,
          "sw": 407,
          "sh": 522
        },
        {
          "sx": 1143,
          "sy": 539,
          "sw": 407,
          "sh": 520
        }
      ],
      "fish": [
        {
          "sx": 61,
          "sy": 1051,
          "sw": 483,
          "sh": 513
        },
        {
          "sx": 624,
          "sy": 1051,
          "sw": 483,
          "sh": 513
        },
        {
          "sx": 1138,
          "sy": 1051,
          "sw": 483,
          "sh": 513
        }
      ],
      "cook": [
        {
          "sx": 61,
          "sy": 1565,
          "sw": 483,
          "sh": 512
        },
        {
          "sx": 620,
          "sy": 1565,
          "sw": 483,
          "sh": 512
        },
        {
          "sx": 1130,
          "sy": 1565,
          "sw": 483,
          "sh": 512
        }
      ],
      "smith": [
        {
          "sx": -6,
          "sy": 2099,
          "sw": 542,
          "sh": 525
        },
        {
          "sx": 534,
          "sy": 2099,
          "sw": 542,
          "sh": 525
        },
        {
          "sx": 1059,
          "sy": 2099,
          "sw": 542,
          "sh": 525
        }
      ],
      "farm_plow": [
        {
          "sx": 7,
          "sy": 21,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 543,
          "sy": 21,
          "sw": 514,
          "sh": 506
        },
        {
          "sx": 1078,
          "sy": 21,
          "sw": 514,
          "sh": 506
        }
      ],
      "farm_seed": [
        {
          "sx": 7,
          "sy": 557,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 543,
          "sy": 557,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 1082,
          "sy": 557,
          "sw": 510,
          "sh": 506
        }
      ],
      "farm_water": [
        {
          "sx": 7,
          "sy": 1082,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 543,
          "sy": 1082,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 1081,
          "sy": 1082,
          "sw": 511,
          "sh": 506
        }
      ],
      "farm_pest": [
        {
          "sx": 7,
          "sy": 1582,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 542,
          "sy": 1582,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 1079,
          "sy": 1582,
          "sw": 513,
          "sh": 506
        }
      ],
      "farm_harvest": [
        {
          "sx": 7,
          "sy": 2090,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 539,
          "sy": 2089,
          "sw": 515,
          "sh": 506
        },
        {
          "sx": 1058,
          "sy": 2091,
          "sw": 515,
          "sh": 512
        }
      ]
    },
    "img": "robot_type5_4"
  },
  "spirit_type2": {
    "img": "spirit_type2",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type2_action",
      "eat_raw": "spirit_type2_action",
      "fish": "spirit_type2_action",
      "cook": "spirit_type2_action",
      "smith": "spirit_type2_action",
      "farm_plow": "spirit_type2_action_farm",
      "farm_seed": "spirit_type2_action_farm",
      "farm_water": "spirit_type2_action_farm",
      "farm_pest": "spirit_type2_action_farm",
      "farm_harvest": "spirit_type2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 122,
          "sy": 17,
          "sw": 350,
          "sh": 477
        },
        {
          "sx": 716,
          "sy": 15,
          "sw": 350,
          "sh": 477
        },
        {
          "sx": 1316,
          "sy": 15,
          "sw": 350,
          "sh": 477
        }
      ],
      "move": [
        {
          "sx": 137,
          "sy": 519,
          "sw": 320,
          "sh": 467
        },
        {
          "sx": 735,
          "sy": 519,
          "sw": 320,
          "sh": 467
        },
        {
          "sx": 1335,
          "sy": 519,
          "sw": 315,
          "sh": 467
        }
      ],
      "study": [
        {
          "sx": 137,
          "sy": 1027,
          "sw": 337,
          "sh": 444
        },
        {
          "sx": 730,
          "sy": 1027,
          "sw": 338,
          "sh": 444
        },
        {
          "sx": 1330,
          "sy": 1027,
          "sw": 338,
          "sh": 444
        }
      ],
      "train": [
        {
          "sx": 26,
          "sy": 1516,
          "sw": 551,
          "sh": 459
        },
        {
          "sx": 626,
          "sy": 1516,
          "sw": 551,
          "sh": 459
        },
        {
          "sx": 1226,
          "sy": 1516,
          "sw": 551,
          "sh": 459
        }
      ],
      "sleep": [
        {
          "sx": 41,
          "sy": 1984,
          "sw": 488,
          "sh": 364
        },
        {
          "sx": 638,
          "sy": 1984,
          "sw": 488,
          "sh": 364
        },
        {
          "sx": 1235,
          "sy": 1984,
          "sw": 488,
          "sh": 364
        }
      ],
      "eat_dish": [
        {
          "sx": 98,
          "sy": 15,
          "sw": 502,
          "sh": 460
        },
        {
          "sx": 698,
          "sy": 15,
          "sw": 501,
          "sh": 459
        },
        {
          "sx": 1294,
          "sy": 14,
          "sw": 501,
          "sh": 461
        }
      ],
      "eat_raw": [
        {
          "sx": 96,
          "sy": 483,
          "sw": 507,
          "sh": 467
        },
        {
          "sx": 696,
          "sy": 483,
          "sw": 507,
          "sh": 467
        },
        {
          "sx": 1296,
          "sy": 483,
          "sw": 507,
          "sh": 467
        }
      ],
      "fish": [
        {
          "sx": 34,
          "sy": 958,
          "sw": 503,
          "sh": 453
        },
        {
          "sx": 634,
          "sy": 958,
          "sw": 503,
          "sh": 453
        },
        {
          "sx": 1234,
          "sy": 958,
          "sw": 503,
          "sh": 453
        }
      ],
      "cook": [
        {
          "sx": 34,
          "sy": 1434,
          "sw": 565,
          "sh": 461
        },
        {
          "sx": 634,
          "sy": 1434,
          "sw": 565,
          "sh": 461
        },
        {
          "sx": 1231,
          "sy": 1434,
          "sw": 564,
          "sh": 461
        }
      ],
      "smith": [
        {
          "sx": 9,
          "sy": 1903,
          "sw": 565,
          "sh": 466
        },
        {
          "sx": 680,
          "sy": 1903,
          "sw": 496,
          "sh": 466
        },
        {
          "sx": 1208,
          "sy": 1904,
          "sw": 566,
          "sh": 466
        }
      ],
      "farm_plow": [
        {
          "sx": 72,
          "sy": -14,
          "sw": 467,
          "sh": 481
        },
        {
          "sx": 1202,
          "sy": 37,
          "sw": 465,
          "sh": 428
        },
        {
          "sx": 1294,
          "sy": 37,
          "sw": 497,
          "sh": 429
        }
      ],
      "farm_seed": [
        {
          "sx": 121,
          "sy": 513,
          "sw": 471,
          "sh": 429
        },
        {
          "sx": 671,
          "sy": 533,
          "sw": 517,
          "sh": 409
        },
        {
          "sx": 1205,
          "sy": 527,
          "sw": 588,
          "sh": 416
        }
      ],
      "farm_water": [
        {
          "sx": 110,
          "sy": 974,
          "sw": 481,
          "sh": 443
        },
        {
          "sx": 600,
          "sy": 972,
          "sw": 591,
          "sh": 446
        },
        {
          "sx": 1200,
          "sy": 972,
          "sw": 592,
          "sh": 446
        }
      ],
      "farm_pest": [
        {
          "sx": 89,
          "sy": 1464,
          "sw": 396,
          "sh": 386
        },
        {
          "sx": 1300,
          "sy": 1464,
          "sw": 397,
          "sh": 384
        },
        {
          "sx": 1303,
          "sy": 1465,
          "sw": 394,
          "sh": 383
        }
      ],
      "farm_harvest": [
        {
          "sx": 72,
          "sy": 1933,
          "sw": 504,
          "sh": 417
        },
        {
          "sx": 653,
          "sy": 1932,
          "sw": 522,
          "sh": 416
        },
        {
          "sx": 1401,
          "sy": 1932,
          "sw": 378,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type2_2": {
    "img": "spirit_type2_2",
    "scale": 0.44999999999999996,
    "actionImages": {
      "eat_dish": "spirit_type2_2_action",
      "eat_raw": "spirit_type2_2_action",
      "fish": "spirit_type2_2_action",
      "cook": "spirit_type2_2_action",
      "smith": "spirit_type2_2_action",
      "farm_plow": "spirit_type2_2_action_farm",
      "farm_seed": "spirit_type2_2_action_farm",
      "farm_water": "spirit_type2_2_action_farm",
      "farm_pest": "spirit_type2_2_action_farm",
      "farm_harvest": "spirit_type2_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type2_3": {
    "img": "spirit_type2_3",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type2_3_action",
      "eat_raw": "spirit_type2_3_action",
      "fish": "spirit_type2_3_action",
      "cook": "spirit_type2_3_action",
      "smith": "spirit_type2_3_action",
      "farm_plow": "spirit_type2_3_action_farm",
      "farm_seed": "spirit_type2_3_action_farm",
      "farm_water": "spirit_type2_3_action_farm",
      "farm_pest": "spirit_type2_3_action_farm",
      "farm_harvest": "spirit_type2_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type4": {
    "img": "spirit_type4",
    "scale": 0.10000000000000002,
    "actionImages": {
      "eat_dish": "spirit_type4_action",
      "eat_raw": "spirit_type4_action",
      "fish": "spirit_type4_action",
      "cook": "spirit_type4_action",
      "smith": "spirit_type4_action",
      "farm_plow": "spirit_type4_action_farm",
      "farm_seed": "spirit_type4_action_farm",
      "farm_water": "spirit_type4_action_farm",
      "farm_pest": "spirit_type4_action_farm",
      "farm_harvest": "spirit_type4_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 130,
          "sy": 21,
          "sw": 343,
          "sh": 452
        },
        {
          "sx": 736,
          "sy": 21,
          "sw": 343,
          "sh": 452
        },
        {
          "sx": 1346,
          "sy": 21,
          "sw": 343,
          "sh": 452
        }
      ],
      "move": [
        {
          "sx": 149,
          "sy": 523,
          "sw": 277,
          "sh": 425
        },
        {
          "sx": 759,
          "sy": 523,
          "sw": 277,
          "sh": 425
        },
        {
          "sx": 1370,
          "sy": 523,
          "sw": 276,
          "sh": 425
        }
      ],
      "study": [
        {
          "sx": 127,
          "sy": 989,
          "sw": 364,
          "sh": 425
        },
        {
          "sx": 736,
          "sy": 989,
          "sw": 362,
          "sh": 425
        },
        {
          "sx": 1345,
          "sy": 988,
          "sw": 362,
          "sh": 425
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1453,
          "sw": 569,
          "sh": 428
        },
        {
          "sx": 627,
          "sy": 1462,
          "sw": 569,
          "sh": 419
        },
        {
          "sx": 1238,
          "sy": 1453,
          "sw": 569,
          "sh": 427
        }
      ],
      "sleep": [
        {
          "sx": 46,
          "sy": 2077,
          "sw": 503,
          "sh": 260
        },
        {
          "sx": 655,
          "sy": 2077,
          "sw": 503,
          "sh": 260
        },
        {
          "sx": 1265,
          "sy": 2077,
          "sw": 503,
          "sh": 260
        }
      ],
      "eat_dish": [
        {
          "sx": 1,
          "sy": 11,
          "sw": 533,
          "sh": 521
        },
        {
          "sx": 536,
          "sy": 12,
          "sw": 533,
          "sh": 521
        },
        {
          "sx": 1071,
          "sy": 12,
          "sw": 530,
          "sh": 521
        }
      ],
      "eat_raw": [
        {
          "sx": -1,
          "sy": 538,
          "sw": 424,
          "sh": 524
        },
        {
          "sx": 536,
          "sy": 538,
          "sw": 424,
          "sh": 524
        },
        {
          "sx": 1073,
          "sy": 538,
          "sw": 424,
          "sh": 524
        }
      ],
      "fish": [
        {
          "sx": 23,
          "sy": 1070,
          "sw": 444,
          "sh": 494
        },
        {
          "sx": 552,
          "sy": 1070,
          "sw": 444,
          "sh": 494
        },
        {
          "sx": 1102,
          "sy": 1070,
          "sw": 444,
          "sh": 494
        }
      ],
      "cook": [
        {
          "sx": -1,
          "sy": 1602,
          "sw": 532,
          "sh": 521
        },
        {
          "sx": 538,
          "sy": 1602,
          "sw": 532,
          "sh": 521
        },
        {
          "sx": 1071,
          "sy": 1602,
          "sw": 532,
          "sh": 521
        }
      ],
      "smith": [
        {
          "sx": 11,
          "sy": 2136,
          "sw": 503,
          "sh": 521
        },
        {
          "sx": 551,
          "sy": 2136,
          "sw": 503,
          "sh": 521
        },
        {
          "sx": 1070,
          "sy": 2136,
          "sw": 530,
          "sh": 521
        }
      ],
      "farm_plow": [
        {
          "sx": 146,
          "sy": 36,
          "sw": 335,
          "sh": 373
        },
        {
          "sx": 777,
          "sy": 36,
          "sw": 335,
          "sh": 373
        },
        {
          "sx": 1398,
          "sy": 45,
          "sw": 335,
          "sh": 355
        }
      ],
      "farm_seed": [
        {
          "sx": 158,
          "sy": 506,
          "sw": 250,
          "sh": 359
        },
        {
          "sx": 773,
          "sy": 506,
          "sw": 250,
          "sh": 359
        },
        {
          "sx": 1379,
          "sy": 506,
          "sw": 250,
          "sh": 359
        }
      ],
      "farm_water": [
        {
          "sx": 116,
          "sy": 971,
          "sw": 285,
          "sh": 359
        },
        {
          "sx": 734,
          "sy": 971,
          "sw": 285,
          "sh": 359
        },
        {
          "sx": 1338,
          "sy": 971,
          "sw": 285,
          "sh": 359
        }
      ],
      "farm_pest": [
        {
          "sx": 80,
          "sy": 1437,
          "sw": 345,
          "sh": 358
        },
        {
          "sx": 696,
          "sy": 1437,
          "sw": 353,
          "sh": 358
        },
        {
          "sx": 1307,
          "sy": 1441,
          "sw": 353,
          "sh": 356
        }
      ],
      "farm_harvest": [
        {
          "sx": 144,
          "sy": 1915,
          "sw": 311,
          "sh": 404
        },
        {
          "sx": 762,
          "sy": 1915,
          "sw": 307,
          "sh": 404
        },
        {
          "sx": 1371,
          "sy": 1915,
          "sw": 307,
          "sh": 404
        }
      ]
    }
  },
  "spirit_type4_2": {
    "img": "spirit_type4_2",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type4_2_action",
      "eat_raw": "spirit_type4_2_action",
      "fish": "spirit_type4_2_action",
      "cook": "spirit_type4_2_action",
      "smith": "spirit_type4_2_action",
      "farm_plow": "spirit_type4_2_action_farm",
      "farm_seed": "spirit_type4_2_action_farm",
      "farm_water": "spirit_type4_2_action_farm",
      "farm_pest": "spirit_type4_2_action_farm",
      "farm_harvest": "spirit_type4_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type4_3": {
    "img": "spirit_type4_3",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type4_3_action",
      "eat_raw": "spirit_type4_3_action",
      "fish": "spirit_type4_3_action",
      "cook": "spirit_type4_3_action",
      "smith": "spirit_type4_3_action",
      "farm_plow": "spirit_type4_3_action_farm",
      "farm_seed": "spirit_type4_3_action_farm",
      "farm_water": "spirit_type4_3_action_farm",
      "farm_pest": "spirit_type4_3_action_farm",
      "farm_harvest": "spirit_type4_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type5": {
    "img": "spirit_type5",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type5_action",
      "eat_raw": "spirit_type5_action",
      "fish": "spirit_type5_action",
      "cook": "spirit_type5_action",
      "smith": "spirit_type5_action",
      "farm_plow": "spirit_type5_action_farm",
      "farm_seed": "spirit_type5_action_farm",
      "farm_water": "spirit_type5_action_farm",
      "farm_pest": "spirit_type5_action_farm",
      "farm_harvest": "spirit_type5_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 134,
          "sy": 60,
          "sw": 333,
          "sh": 424
        },
        {
          "sx": 749,
          "sy": 47,
          "sw": 331,
          "sh": 424
        },
        {
          "sx": 1350,
          "sy": 80,
          "sw": 331,
          "sh": 404
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 528,
          "sw": 320,
          "sh": 432
        },
        {
          "sx": 750,
          "sy": 528,
          "sw": 320,
          "sh": 432
        },
        {
          "sx": 1361,
          "sy": 528,
          "sw": 320,
          "sh": 432
        }
      ],
      "study": [
        {
          "sx": 138,
          "sy": 1008,
          "sw": 325,
          "sh": 423
        },
        {
          "sx": 747,
          "sy": 1007,
          "sw": 325,
          "sh": 423
        },
        {
          "sx": 1353,
          "sy": 1007,
          "sw": 325,
          "sh": 423
        }
      ],
      "train": [
        {
          "sx": 29,
          "sy": 1485,
          "sw": 564,
          "sh": 448
        },
        {
          "sx": 639,
          "sy": 1485,
          "sw": 564,
          "sh": 448
        },
        {
          "sx": 1244,
          "sy": 1485,
          "sw": 564,
          "sh": 448
        }
      ],
      "sleep": [
        {
          "sx": 38,
          "sy": 2059,
          "sw": 514,
          "sh": 284
        },
        {
          "sx": 649,
          "sy": 2059,
          "sw": 510,
          "sh": 284
        },
        {
          "sx": 1254,
          "sy": 2059,
          "sw": 510,
          "sh": 284
        }
      ],
      "eat_dish": [
        {
          "sx": 101,
          "sy": 20,
          "sw": 502,
          "sh": 448
        },
        {
          "sx": 708,
          "sy": 20,
          "sw": 501,
          "sh": 448
        },
        {
          "sx": 1317,
          "sy": 20,
          "sw": 500,
          "sh": 448
        }
      ],
      "eat_raw": [
        {
          "sx": 104,
          "sy": 491,
          "sw": 378,
          "sh": 448
        },
        {
          "sx": 707,
          "sy": 491,
          "sw": 378,
          "sh": 448
        },
        {
          "sx": 1314,
          "sy": 491,
          "sw": 378,
          "sh": 448
        }
      ],
      "fish": [
        {
          "sx": 6,
          "sy": 960,
          "sw": 598,
          "sh": 454
        },
        {
          "sx": 613,
          "sy": 960,
          "sw": 598,
          "sh": 454
        },
        {
          "sx": 1220,
          "sy": 960,
          "sw": 598,
          "sh": 454
        }
      ],
      "cook": [
        {
          "sx": 13,
          "sy": 1437,
          "sw": 590,
          "sh": 451
        },
        {
          "sx": 620,
          "sy": 1437,
          "sw": 590,
          "sh": 451
        },
        {
          "sx": 1224,
          "sy": 1437,
          "sw": 590,
          "sh": 450
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 1912,
          "sw": 526,
          "sh": 449
        },
        {
          "sx": 646,
          "sy": 1912,
          "sw": 531,
          "sh": 449
        },
        {
          "sx": 1251,
          "sy": 1912,
          "sw": 531,
          "sh": 449
        }
      ],
      "farm_plow": [
        {
          "sx": 100,
          "sy": 48,
          "sw": 382,
          "sh": 371
        },
        {
          "sx": 773,
          "sy": 48,
          "sw": 372,
          "sh": 371
        },
        {
          "sx": 1317,
          "sy": 48,
          "sw": 372,
          "sh": 371
        }
      ],
      "farm_seed": [
        {
          "sx": 119,
          "sy": 518,
          "sw": 296,
          "sh": 371
        },
        {
          "sx": 817,
          "sy": 518,
          "sw": 296,
          "sh": 372
        },
        {
          "sx": 1337,
          "sy": 518,
          "sw": 294,
          "sh": 372
        }
      ],
      "farm_water": [
        {
          "sx": 204,
          "sy": 984,
          "sw": 318,
          "sh": 377
        },
        {
          "sx": 818,
          "sy": 984,
          "sw": 318,
          "sh": 377
        },
        {
          "sx": 1428,
          "sy": 984,
          "sw": 318,
          "sh": 377
        }
      ],
      "farm_pest": [
        {
          "sx": 49,
          "sy": 1455,
          "sw": 296,
          "sh": 375
        },
        {
          "sx": 660,
          "sy": 1457,
          "sw": 297,
          "sh": 377
        },
        {
          "sx": 1272,
          "sy": 1457,
          "sw": 297,
          "sh": 377
        }
      ],
      "farm_harvest": [
        {
          "sx": 230,
          "sy": 1935,
          "sw": 296,
          "sh": 377
        },
        {
          "sx": 843,
          "sy": 1935,
          "sw": 296,
          "sh": 377
        },
        {
          "sx": 1456,
          "sy": 1935,
          "sw": 296,
          "sh": 377
        }
      ]
    }
  },
  "spirit_type5_2": {
    "img": "spirit_type5_2",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type5_2_action",
      "eat_raw": "spirit_type5_2_action",
      "fish": "spirit_type5_2_action",
      "cook": "spirit_type5_2_action",
      "smith": "spirit_type5_2_action",
      "farm_plow": "spirit_type5_2_action_farm",
      "farm_seed": "spirit_type5_2_action_farm",
      "farm_water": "spirit_type5_2_action_farm",
      "farm_pest": "spirit_type5_2_action_farm",
      "farm_harvest": "spirit_type5_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type5_3": {
    "img": "spirit_type5_3",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type5_3_action",
      "eat_raw": "spirit_type5_3_action",
      "fish": "spirit_type5_3_action",
      "cook": "spirit_type5_3_action",
      "smith": "spirit_type5_3_action",
      "farm_plow": "spirit_type5_3_action_farm",
      "farm_seed": "spirit_type5_3_action_farm",
      "farm_water": "spirit_type5_3_action_farm",
      "farm_pest": "spirit_type5_3_action_farm",
      "farm_harvest": "spirit_type5_3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type1": {
    "img": "spirit_type1",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type1_action",
      "eat_raw": "spirit_type1_action",
      "fish": "spirit_type1_action",
      "cook": "spirit_type1_action",
      "smith": "spirit_type1_action",
      "farm_plow": "spirit_type1_action_farm",
      "farm_seed": "spirit_type1_action_farm",
      "farm_water": "spirit_type1_action_farm",
      "farm_pest": "spirit_type1_action_farm",
      "farm_harvest": "spirit_type1_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 125,
          "sy": 10,
          "sw": 339,
          "sh": 470
        },
        {
          "sx": 730,
          "sy": 10,
          "sw": 339,
          "sh": 470
        },
        {
          "sx": 1324,
          "sy": 10,
          "sw": 339,
          "sh": 470
        }
      ],
      "move": [
        {
          "sx": 139,
          "sy": 509,
          "sw": 298,
          "sh": 437
        },
        {
          "sx": 741,
          "sy": 509,
          "sw": 298,
          "sh": 437
        },
        {
          "sx": 1338,
          "sy": 509,
          "sw": 298,
          "sh": 437
        }
      ],
      "study": [
        {
          "sx": 139,
          "sy": 964,
          "sw": 348,
          "sh": 476
        },
        {
          "sx": 741,
          "sy": 964,
          "sw": 348,
          "sh": 476
        },
        {
          "sx": 1340,
          "sy": 964,
          "sw": 346,
          "sh": 476
        }
      ],
      "train": [
        {
          "sx": 43,
          "sy": 1469,
          "sw": 516,
          "sh": 451
        },
        {
          "sx": 646,
          "sy": 1469,
          "sw": 516,
          "sh": 451
        },
        {
          "sx": 1239,
          "sy": 1469,
          "sw": 516,
          "sh": 451
        }
      ],
      "sleep": [
        {
          "sx": 5,
          "sy": 1955,
          "sw": 591,
          "sh": 383
        },
        {
          "sx": 608,
          "sy": 1955,
          "sw": 582,
          "sh": 383
        },
        {
          "sx": 1201,
          "sy": 1955,
          "sw": 582,
          "sh": 383
        }
      ],
      "eat_dish": [
        {
          "sx": 111,
          "sy": 10,
          "sw": 487,
          "sh": 494
        },
        {
          "sx": 708,
          "sy": 10,
          "sw": 489,
          "sh": 494
        },
        {
          "sx": 1295,
          "sy": 10,
          "sw": 489,
          "sh": 494
        }
      ],
      "eat_raw": [
        {
          "sx": 111,
          "sy": 510,
          "sw": 309,
          "sh": 468
        },
        {
          "sx": 707,
          "sy": 510,
          "sw": 307,
          "sh": 468
        },
        {
          "sx": 1293,
          "sy": 510,
          "sw": 305,
          "sh": 468
        }
      ],
      "fish": [
        {
          "sx": -1,
          "sy": 992,
          "sw": 496,
          "sh": 459
        },
        {
          "sx": 595,
          "sy": 992,
          "sw": 501,
          "sh": 459
        },
        {
          "sx": 1197,
          "sy": 992,
          "sw": 501,
          "sh": 459
        }
      ],
      "cook": [
        {
          "sx": 24,
          "sy": 1465,
          "sw": 550,
          "sh": 448
        },
        {
          "sx": 626,
          "sy": 1465,
          "sw": 550,
          "sh": 448
        },
        {
          "sx": 1229,
          "sy": 1465,
          "sw": 550,
          "sh": 448
        }
      ],
      "smith": [
        {
          "sx": 38,
          "sy": 1937,
          "sw": 528,
          "sh": 453
        },
        {
          "sx": 635,
          "sy": 1937,
          "sw": 528,
          "sh": 453
        },
        {
          "sx": 1238,
          "sy": 1937,
          "sw": 528,
          "sh": 453
        }
      ],
      "farm_plow": [
        {
          "sx": 51,
          "sy": 17,
          "sw": 441,
          "sh": 381
        },
        {
          "sx": 637,
          "sy": 16,
          "sw": 455,
          "sh": 387
        },
        {
          "sx": 1234,
          "sy": 16,
          "sw": 438,
          "sh": 381
        }
      ],
      "farm_seed": [
        {
          "sx": 42,
          "sy": 497,
          "sw": 318,
          "sh": 381
        },
        {
          "sx": 640,
          "sy": 497,
          "sw": 318,
          "sh": 381
        },
        {
          "sx": 1239,
          "sy": 497,
          "sw": 318,
          "sh": 381
        }
      ],
      "farm_water": [
        {
          "sx": 42,
          "sy": 978,
          "sw": 299,
          "sh": 381
        },
        {
          "sx": 627,
          "sy": 978,
          "sw": 347,
          "sh": 381
        },
        {
          "sx": 1235,
          "sy": 978,
          "sw": 320,
          "sh": 381
        }
      ],
      "farm_pest": [
        {
          "sx": 35,
          "sy": 1462,
          "sw": 526,
          "sh": 381
        },
        {
          "sx": 630,
          "sy": 1462,
          "sw": 528,
          "sh": 381
        },
        {
          "sx": 1234,
          "sy": 1462,
          "sw": 528,
          "sh": 381
        }
      ],
      "farm_harvest": [
        {
          "sx": 89,
          "sy": 1944,
          "sw": 520,
          "sh": 371
        },
        {
          "sx": 720,
          "sy": 1944,
          "sw": 398,
          "sh": 371
        },
        {
          "sx": 1315,
          "sy": 1944,
          "sw": 398,
          "sh": 371
        }
      ]
    }
  },
  "spirit_type1_2": {
    "img": "spirit_type1_2",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type1_2_action",
      "eat_raw": "spirit_type1_2_action",
      "fish": "spirit_type1_2_action",
      "cook": "spirit_type1_2_action",
      "smith": "spirit_type1_2_action",
      "farm_plow": "spirit_type1_2_action_farm",
      "farm_seed": "spirit_type1_2_action_farm",
      "farm_water": "spirit_type1_2_action_farm",
      "farm_pest": "spirit_type1_2_action_farm",
      "farm_harvest": "spirit_type1_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  },
  "spirit_type3": {
    "img": "spirit_type3",
    "scale": 0.10000000000000002,
    "actionImages": {
      "eat_dish": "spirit_type3_action",
      "eat_raw": "spirit_type3_action",
      "fish": "spirit_type3_action",
      "cook": "spirit_type3_action",
      "smith": "spirit_type3_action",
      "farm_plow": "spirit_type3_action_farm",
      "farm_seed": "spirit_type3_action_farm",
      "farm_water": "spirit_type3_action_farm",
      "farm_pest": "spirit_type3_action_farm",
      "farm_harvest": "spirit_type3_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 1303,
          "sy": 4,
          "sw": 333,
          "sh": 484
        },
        {
          "sx": 126,
          "sy": 31,
          "sw": 333,
          "sh": 480
        },
        {
          "sx": 714,
          "sy": 21,
          "sw": 333,
          "sh": 484
        }
      ],
      "move": [
        {
          "sx": 144,
          "sy": 534,
          "sw": 303,
          "sh": 465
        },
        {
          "sx": 732,
          "sy": 534,
          "sw": 303,
          "sh": 465
        },
        {
          "sx": 1320,
          "sy": 534,
          "sw": 303,
          "sh": 465
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1034,
          "sw": 363,
          "sh": 461
        },
        {
          "sx": 698,
          "sy": 1034,
          "sw": 363,
          "sh": 461
        },
        {
          "sx": 1287,
          "sy": 1034,
          "sw": 363,
          "sh": 461
        }
      ],
      "train": [
        {
          "sx": 70,
          "sy": 1515,
          "sw": 492,
          "sh": 478
        },
        {
          "sx": 654,
          "sy": 1515,
          "sw": 492,
          "sh": 478
        },
        {
          "sx": 1241,
          "sy": 1515,
          "sw": 492,
          "sh": 478
        }
      ],
      "sleep": [
        {
          "sx": -3,
          "sy": 2015,
          "sw": 579,
          "sh": 388
        },
        {
          "sx": 586,
          "sy": 2123,
          "sw": 570,
          "sh": 281
        },
        {
          "sx": 1176,
          "sy": 2086,
          "sw": 570,
          "sh": 317
        }
      ],
      "eat_dish": [
        {
          "sx": -3,
          "sy": 2015,
          "sw": 579,
          "sh": 388
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 1000,
          "sy": 2015,
          "sw": 579,
          "sh": 388
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 28,
          "sy": 29,
          "sw": 542,
          "sh": 420
        },
        {
          "sx": 612,
          "sy": 29,
          "sw": 542,
          "sh": 422
        },
        {
          "sx": 1175,
          "sy": 29,
          "sw": 562,
          "sh": 419
        }
      ],
      "farm_seed": [
        {
          "sx": 28,
          "sy": 499,
          "sw": 542,
          "sh": 420
        },
        {
          "sx": 612,
          "sy": 500,
          "sw": 542,
          "sh": 420
        },
        {
          "sx": 1192,
          "sy": 500,
          "sw": 542,
          "sh": 420
        }
      ],
      "farm_water": [
        {
          "sx": 28,
          "sy": 976,
          "sw": 542,
          "sh": 418
        },
        {
          "sx": 608,
          "sy": 976,
          "sw": 542,
          "sh": 418
        },
        {
          "sx": 1191,
          "sy": 976,
          "sw": 542,
          "sh": 418
        }
      ],
      "farm_pest": [
        {
          "sx": 26,
          "sy": 1450,
          "sw": 552,
          "sh": 413
        },
        {
          "sx": 609,
          "sy": 1450,
          "sw": 552,
          "sh": 413
        },
        {
          "sx": 1165,
          "sy": 1450,
          "sw": 552,
          "sh": 413
        }
      ],
      "farm_harvest": [
        {
          "sx": 27,
          "sy": 1926,
          "sw": 541,
          "sh": 423
        },
        {
          "sx": 609,
          "sy": 1926,
          "sw": 541,
          "sh": 422
        },
        {
          "sx": 1191,
          "sy": 1929,
          "sw": 541,
          "sh": 419
        }
      ]
    }
  },
  "spirit_type3_2": {
    "img": "spirit_type3_2",
    "scale": 0.1,
    "actionImages": {
      "eat_dish": "spirit_type3_2_action",
      "eat_raw": "spirit_type3_2_action",
      "fish": "spirit_type3_2_action",
      "cook": "spirit_type3_2_action",
      "smith": "spirit_type3_2_action",
      "farm_plow": "spirit_type3_2_action_farm",
      "farm_seed": "spirit_type3_2_action_farm",
      "farm_water": "spirit_type3_2_action_farm",
      "farm_pest": "spirit_type3_2_action_farm",
      "farm_harvest": "spirit_type3_2_action_farm"
    },
    "actions": {
      "idle": [
        {
          "sx": 132,
          "sy": 92,
          "sw": 269,
          "sh": 372
        },
        {
          "sx": 664,
          "sy": 88,
          "sw": 271,
          "sh": 375
        },
        {
          "sx": 1197,
          "sy": 80,
          "sw": 273,
          "sh": 371
        }
      ],
      "move": [
        {
          "sx": 138,
          "sy": 619,
          "sw": 254,
          "sh": 397
        },
        {
          "sx": 674,
          "sy": 619,
          "sw": 253,
          "sh": 391
        },
        {
          "sx": 1207,
          "sy": 620,
          "sw": 254,
          "sh": 387
        }
      ],
      "study": [
        {
          "sx": 115,
          "sy": 1127,
          "sw": 300,
          "sh": 422
        },
        {
          "sx": 649,
          "sy": 1132,
          "sw": 300,
          "sh": 411
        },
        {
          "sx": 1183,
          "sy": 1127,
          "sw": 300,
          "sh": 417
        }
      ],
      "train": [
        {
          "sx": 18,
          "sy": 1662,
          "sw": 490,
          "sh": 410
        },
        {
          "sx": 555,
          "sy": 1667,
          "sw": 488,
          "sh": 404
        },
        {
          "sx": 1089,
          "sy": 1662,
          "sw": 488,
          "sh": 406
        }
      ],
      "sleep": [
        {
          "sx": 33,
          "sy": 2381,
          "sw": 449,
          "sh": 228
        },
        {
          "sx": 566,
          "sy": 2381,
          "sw": 451,
          "sh": 225
        },
        {
          "sx": 1104,
          "sy": 2382,
          "sw": 448,
          "sh": 224
        }
      ],
      "eat_dish": [
        {
          "sx": 127,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 651,
          "sy": 73,
          "sw": 380,
          "sh": 416
        },
        {
          "sx": 1184,
          "sy": 73,
          "sw": 380,
          "sh": 416
        }
      ],
      "eat_raw": [
        {
          "sx": 144,
          "sy": 622,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 678,
          "sy": 621,
          "sw": 284,
          "sh": 402
        },
        {
          "sx": 1213,
          "sy": 619,
          "sw": 284,
          "sh": 402
        }
      ],
      "fish": [
        {
          "sx": 109,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 641,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        },
        {
          "sx": 1162,
          "sy": 1144,
          "sw": 428,
          "sh": 403
        }
      ],
      "cook": [
        {
          "sx": 108,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 641,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        },
        {
          "sx": 1174,
          "sy": 1664,
          "sw": 429,
          "sh": 419
        }
      ],
      "smith": [
        {
          "sx": 41,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 576,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        },
        {
          "sx": 1110,
          "sy": 2198,
          "sw": 454,
          "sh": 400
        }
      ],
      "farm_plow": [
        {
          "sx": 38,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 572,
          "sy": 90,
          "sw": 457,
          "sh": 397
        },
        {
          "sx": 1106,
          "sy": 90,
          "sw": 457,
          "sh": 397
        }
      ],
      "farm_seed": [
        {
          "sx": 37,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 571,
          "sy": 621,
          "sw": 458,
          "sh": 406
        },
        {
          "sx": 1105,
          "sy": 621,
          "sw": 458,
          "sh": 406
        }
      ],
      "farm_water": [
        {
          "sx": 37,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 571,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        },
        {
          "sx": 1104,
          "sy": 1143,
          "sw": 458,
          "sh": 417
        }
      ],
      "farm_pest": [
        {
          "sx": 38,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 571,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        },
        {
          "sx": 1107,
          "sy": 1664,
          "sw": 458,
          "sh": 425
        }
      ],
      "farm_harvest": [
        {
          "sx": 38,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 571,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        },
        {
          "sx": 1106,
          "sy": 2200,
          "sw": 457,
          "sh": 416
        }
      ]
    }
  }
};

// ★ここに追加！両方の名前を繋ぐ魔法の1行！
const characterConfigs = defaultAiConfigs;

// ==========================================
// ★変更：複雑な変換を捨て、キー名＝ファイル名で一括登録！
// ==========================================
const allMonstersKeys = Object.keys(charaTraits);

const baseFrameData = {
    robot: {sx: 804, sy: 75, sw: 194, sh: 314},
    spirit: {sx: 132, sy: 92, sw: 269, sh: 372},
    magician: {sx: 122, sy: 119, sw: 288, sh: 347},
    bird: {sx: 213, sy: 66, sw: 299, sh: 408},
    stone: {sx: 214, sy: 53, sw: 377, sh: 416},
    seed: {sx: 130, sy: 34, sw: 308, sh: 476},
    beetle: {sx: 159, sy: 36, sw: 316, sh: 405},
    dragon: {sx: 172, sy: 22, sw: 358, sh: 398},
    ghost: {sx: 150, sy: 68, sw: 334, sh: 326},
    machine: {sx: 123, sy: 19, sw: 349, sh: 407},
    balloon: {sx: 350, sy: 48, sw: 319, sh: 322}
};


allMonstersKeys.forEach(key => {
    let base = key.split('_')[0];
    let actionName = key + '_action';
    let farmName = key + '_action_farm';
    
    // ★大修正：起動時にロードせず、後で読み込めるようにカタログにパスを記録するだけ！
    window.dynamicImageCatalog[key] = key + '.png';
    window.dynamicImageCatalog[actionName] = actionName + '.png';
    window.dynamicImageCatalog[farmName] = farmName + '.png';

    if (!characterConfigs[key]) {
        if (!['robot','spirit','magician', 'bird', 'stone', 'seed', 'beetle', 'dragon', 'ghost', 'machine', 'balloon'].includes(base)) {
            characterConfigs[key] = { img: key, scale: 0.25, actionImages: {}, actions: createDefaultFrames() };
        } else {
            characterConfigs[key] = JSON.parse(JSON.stringify(characterConfigs[base]));
            characterConfigs[key].img = key; 
        }
    } else {
        characterConfigs[key].img = key; 
    }

    if (!characterConfigs[key].actionImages) characterConfigs[key].actionImages = {};
    const acts = ['eat_dish','eat_raw','fish','cook','smith'];
    const farms = ['farm_plow','farm_seed','farm_water','farm_pest','farm_harvest'];
    acts.forEach(a => characterConfigs[key].actionImages[a] = actionName);
    farms.forEach(a => characterConfigs[key].actionImages[a] = farmName);
});

let aiConfigs = Object.assign({}, characterConfigs, mapChipConfigs);
try {
    const savedConfigs = JSON.parse(localStorage.getItem('ai_configs_v8'));
    if (savedConfigs) {
        for (let key in savedConfigs) {
            // ★保存データがあっても、現在のリスト(charaTraitsとmapChipConfigs)にないものは徹底的に無視する！
            if (!charaTraits[key] && !mapChipConfigs[key]) continue;
            
            if (!aiConfigs[key]) {
                aiConfigs[key] = savedConfigs[key];
            } else {
                if (savedConfigs[key].actions) aiConfigs[key].actions = savedConfigs[key].actions;
                if (savedConfigs[key].scale !== undefined) aiConfigs[key].scale = savedConfigs[key].scale;
            }
        }
    }
} catch(e) {}
window.aiConfigs = aiConfigs;
window.evolutionRequirements = evolutionRequirements;

// ==========================================
// ★ エンドコンテンツ連携パッチ：専用素材とレシピの更新
// ==========================================
setTimeout(() => {
    // 1. 専用アイテムの追加
    if (typeof itemCatalog !== 'undefined') {
        itemCatalog['mat_castle_1'] = { name: '呪われた礎石', type: 'material', value: 1000, desc: 'スカルダンジョン5F到達報酬。お城の建築に必要。' };
        itemCatalog['mat_castle_2'] = { name: '漆黒の柱', type: 'material', value: 2000, desc: 'スカルダンジョン10F到達報酬。お城の建築に必要。' };
        itemCatalog['mat_castle_3'] = { name: '覇者の紋章', type: 'material', value: 5000, desc: 'スカルダンジョン20F到達報酬。お城の建築に必要。' };

        itemCatalog['mat_casino_1'] = { name: '幻惑のグラス', type: 'material', value: 1000, desc: 'クリスタル迷宮5F到達報酬。カジノの建築に必要。' };
        itemCatalog['mat_casino_2'] = { name: '輝くカジノチップ', type: 'material', value: 2000, desc: 'クリスタル迷宮10F到達報酬。カジノの建築に必要。' };
        itemCatalog['mat_casino_3'] = { name: '真理のダイス', type: 'material', value: 5000, desc: 'クリスタル迷宮20F到達報酬。カジノの建築に必要。' };
        
        // ★追加：カードショップ用素材
        itemCatalog['mat_card_1'] = { name: '幻影のカードパック', type: 'material', value: 10000, desc: 'クリスタル迷宮25F到達報酬。カード屋の建築に必要。' };
    }

    // 2. お城とカジノ、カード屋のレシピを「専用素材必須」に書き換え！
    if (typeof buildingCatalog !== 'undefined') {
        if (buildingCatalog['castle']) {
            buildingCatalog['castle'].materials = { 'mat_castle_1': 1, 'mat_castle_2': 1, 'mat_castle_3': 1 };
        }
        if (buildingCatalog['casino']) {
            buildingCatalog['casino'].materials = { 'mat_casino_1': 1, 'mat_casino_2': 1, 'mat_casino_3': 1 };
        }
        // ★追加：カード屋の専用素材設定
        if (buildingCatalog['card_shop']) {
            buildingCatalog['card_shop'].materials = { 'mat_card_1': 1, 'stone': 20, 'wood': 20 };
        }
    }
}, 1000); // カタログが読み込まれた後に安全に上書き