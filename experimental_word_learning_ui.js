(function () {
    'use strict';
    const api = window.ExperimentalWordLearning;
    const identityApi = window.ExperimentalWordIdentity;
    const app = document.getElementById('app');
    const labels = {
        advCourse1: "ここからは同行訓練の一階だよ。まず周りを見て、足元を確かめながら歩いてみよう。",
        advCourse2: "一階の観察と歩行は見届けたよ。二階では相手の予備動作を見て、攻撃と回避の両方を試そう。",
        advCourse3: "二階の攻撃と回避は見届けたよ。三階では武器・防具・食料・手当て布を実際に使い、変化を確かめよう。",
        advCourse4: "三階の実使用は見届けたよ。四階では疲れ・空腹・被害を見て、危険になる前に引き返す練習をしよう。",
        advCourse5: "四階の撤退判断は見届けたよ。五階では学んだことを組み合わせて探索し、入口まで戻って帰ろう。",
        advCourseComplete: "五階の探索と帰還まで見届けたよ。同行訓練は修了だ。貸した道具を返して、本探索に備えよう。",
        advCourseReturn: "五階の探索と引き返す判断を見届けたよ。上り階段をたどって、島まで帰ろう。",
        advReturnedSaid: "入口まで戻って、島に帰ってきたよ。",
        advLessonGoal0: "冒険家の実地課題①だよ。森と山で地形を見て、行き先と帰り道を確かめたら、ここへ報告に戻ろう。",
        advLessonGoal1: "冒険家の実地課題②だよ。森で木材を集め、建築士へ運んで渡したら、ここへ報告に戻ろう。",
        advLessonGoal2: "冒険家の実地課題③だよ。体の疲れと空腹を確かめ、木陰で実際に休んでから、ここへ報告に戻ろう。",
        advLessonGoal3: "冒険家の最終課題だよ。森で集めて運び、体の様子から食事や休息を判断して、自分で一巡して戻っておいで。",
        advLessonReview0: "地形の確認と往復を見届けたよ。課題①は修了。次は、集めた材料を運ぶ課題だよ。",
        advLessonReview1: "材料を集め、建築士へ渡して戻れたね。課題②は修了。次は、体をいたわる課題だよ。",
        advLessonReview2: "実際に休み、戻って報告できたね。課題③は修了。次は、自分で判断する最後の一巡だよ。",
        advLessonReview3: "採集、運搬、体の判断、帰還まで確かめたよ。最後の課題も修了、冒険家皆伝だ。橋の先の入口へ進めるよ。",
        advAccepted: "この課題をやってみるね。終わったら、ここに戻ってくるよ。",
        advAcceptedGesture: "課題を受け、師匠にうなずいてから出発した。",
        advFoundSaid: "{item}を見つけたよ。持って帰るね。",
        advFoundDone: "{item}を見つけ、実際に手に取った。",
        advSurveySaid: "行き先と帰り道を確かめたよ。",
        advSurveyDone: "地形を見て、行き先と帰り道を確かめた。",
        advDeliveredSaid: "材料を運んできたよ。これを渡すね。",
        advDeliveredDone: "運んできた材料を、建築・製作のために渡した。",
        advFinishedSaid: "{item}の作業がおわったよ。できたものを確かめよう。",
        advFinishedDone: "{item}の実作業が終わり、完成したものを確かめた。",
        advReportedSaid: "戻ってきたよ。課題でやってきたことを報告するね。",
        advReportedDone: "師匠のもとへ戻り、課題で実行したことを示した。",
        advMaking: "材料を集めて納入し、実際の製作を進めている。",
        advJourney: "橋を渡り、ダンジョンの入口へ向かっている。",
        advItem_bridge: "橋",
        advItem_home: "家",
        advDropped: "持っていた現物を、今いる場所の地面へ置いた。",
        advStopped: "今の作業と探索の目的を取り消し、その場で止まった。",
        advOffer_crystal: "実地課題は修了したね。橋を渡り、クリスタルの入口へ案内しよう。初めてなら私と五階の訓練をしよう。",
        advOffer_storage: "家で、現物をしまい、取り出す練習に付き添おう。複数あるときは、どの物を運ぶか呼び名で教えてね。",
        advRetreatReason: "体の余力を見て、探索を続けず階段へ引き返すことにした。",
        advAvoidReason: "相手が身構えたので、学んだ回避を選び、距離を取った。",
        advOffered: "師匠が、次に一緒に行う実地の仕事を話している。",
        advOffer_lesson: "森と山で、行き先と帰り道を確かめよう。実際に集めて運び、体の様子を見て戻る練習をしよう。",
        advOffer_enter: "実地課題は修了したね。橋を渡り、スカルの入口へ案内しよう。初めてなら私と五階の訓練をしよう。",
        advOffer_bridge: "川を渡る橋を作れるよ。森の木材四つと山の石二つを運んで、一緒に工事をしよう。",
        advOffer_home: "家を作るなら、木材六つと石四つを運んで一緒に建てよう。完成したら、そこに現物を保管できるよ。",
        advOffer_bag: "布のかばんを一緒に作ろう。木材一つを運んで、製作を手伝ってくれるかな。",
        advOffer_stick: "木材一つで木の棒を作ろう。材料を運び、実際に製作を手伝おう。",
        advOffer_shield: "木材二つを使って木の盾を作ろう。運んだ材料で、一緒に形にしよう。",
        advOffer_cloth: "手当て布を一緒に作ろう。私の布を使うけれど、実際の製作を手伝ってもらうよ。",
        advOffer_ration: "森で木の実を一つ集めて運んでおいで。一緒に調理して携行食にしよう。",
        advTitle: "ダンジョンへの道",
        advHelp: "冒険家の課題から始めよう。橋は先に建築士へ依頼しても大丈夫。",
        advAsk: "声をかける",
        advStop: "実地作業を止める",
        advBusy: "今の作業を終えてからにしよう。",
        advStarted: "行き先と帰り道を確かめ、実際に移動・採集・作業を進めている。",
        advMastery: "冒険家が実地課題の往復と判断を確かめ、皆伝を認めた。",
        advReviewed: "師匠が実行を見届けた。次の課題へ進もう。",
        advBuilt: "材料を使う実作業を終え、完成した。",
        advFull: "持てる場所がない。納入するか、完成した家にしまおう。",
        advNoMaterial: "この場所で集められる材料が残っていない。",
        advNeedMastery: "まず冒険家と森・山の実地課題を終えよう。",
        advNeedBridge: "橋がまだない。建築士へ材料を運んで依頼しよう。",
        advNeedBuilding: "自力の橋建設は、建築士との実作業で学ぼう。",
        advEntered: "橋を渡って入口に到着。初回は冒険家と五階の訓練をする。",
        advObserved: "相手の動きと階段を見ている。",
        advReady: "相手が身構えた。次の動きに気をつけよう。",
        advMoved: "足元と相手を確かめながら進んだ。",
        advWalkRight: "右へ一歩進んだ。",
        advWalkLeft: "左へ一歩進んだ。",
        advWalkDown: "下へ一歩進んだ。",
        advWalkUp: "上へ一歩進んだ。",
        advDescended: "階段を下り、地下{floor}階に着いた。",
        advAscended: "階段を上り、地下{floor}階に戻った。",
        advPickedItem: "床の{item}を拾い、持ち物に加えた。",
        advAteRation: "携行食を食べ、空腹がやわらいだ。",
        advUsedCloth: "手当て布を使い、傷の手当てをした。",
        advDefeated: "攻撃が当たり、相手を倒した。",
        advActionLabel: "今の動作を振り返り、声かけと結びつけている。",
        advHit: "攻撃が当たり、相手の動きが変わった。",
        advAvoided: "距離を取り、相手の攻撃をかわした。",
        advHurt: "傷ついている。手当てや帰還を考えよう。",
        advUsed: "実際に使い、変化を確かめた。",
        advEquipped: "装備を身につけた。実際に使って確かめよう。",
        advPicked: "空いている持ち物の場所へ拾った。",
        adv_drop: "地面に置く",
        advLocation_ground: "島の地面",
        advReturned: "階段をたどって島へ帰った。食事と休息で体をいたわろう。",
        advRescued: "救助されて島へ戻った。持ち物は同じ階に残っている。",
        advSafety: "冒険家が危険を止め、島へ付き添った。貸与品を返してケアをしよう。",
        advTraining: "冒険家がこの階の実行を見届けた。次の階へ進める。",
        advGraduated: "五階の訓練と帰還を終え、貸与品を返した。本探索に備えよう。",
        advCannot: "今はその動作を実行できない。位置と持ち物を確かめよう。",
        advUnknown: "まだ分からない言葉や対象がある。何を指すか、実際の経験と声かけで確かめよう。",
        advItems: "持ち物・装備・家の保管",
        advTrainingTitle: "冒険家同行の実地訓練",
        advExploreTitle: "本探索",
        advWell: "動ける様子",
        advItem_bag: "布のかばん",
        advItem_stick: "木の棒",
        advItem_shield: "木の盾",
        advItem_ration: "携行食",
        advItem_cloth: "手当て布",
        advItem_wood: "木材",
        advItem_stone: "石",
        advItem_berry: "木の実",
        advLocation_hand: "手",
        advLocation_body: "身につけている",
        advLocation_bag: "かばんの中",
        advLocation_home: "家の保管場所",
        advLocation_floor: "その階の床",
        autoHeading: 'おまかせ育成', autoLife: '暮らし', autoConversation: '会話', autoExploration: '探索',
        autoHelp: '今の場面と理解に合わせて、ゲーム内の育成補助が声かけを選びます。外部AIサービスは使いません。方針は性格を固定せず、教える機会の優先度を変えます。',
        autoLevels0: '見送る', autoLevels1: '控えめ', autoLevels2: 'ふつう', autoLevels3: '優先',
        autoStart: 'おまかせを始める', autoStop: 'おまかせを止める', autoTeacher: 'おまかせの声かけ',
        autoStopped: '停止中。自分で声をかけられます。', autoWaiting: '言葉と体験を結べる場面を待っています。',
        autoPaused: '画面の操作が終わるまで、声かけを待っています。', autoDraft: '入力中の文を送るか、消してから始めてください。',
        autoZero: '優先度を1つ以上、見送る以外にしてください。', autoPreview: '次の声かけ', autoMove: '歩く体験のために、島の中を移動します。',
        autoExperience: '実際の動作や感覚に、短い言葉を添えます。', autoExample: '今の活動を使って、質問と答えの例を見せます。',
        autoPractice: '覚えた言葉を使って、今していることを尋ねます。', autoPending: '伝えました。経験の完了や、この子の反応を見守ります。',
        autoGrowth: '今回、新しく覚えた言葉', autoContinue: '開始・停止は自分で選べます。入力やマイク操作でおまかせは止まり、入力途中の文は残ります。再起動時は停止しています。',
        identityHeading: '名前と呼び方', identityName: 'この子の名前', identityFirstPerson: 'この子の一人称', identityPlayerAddress: 'あなたを呼ぶときの呼び方',
        identityHelp: '候補を選ぶか、好きな言葉を入力してください。「ご主人様」「あなた」など、名前ではない呼び方も使えます。',
        identityLimits: '名前と呼び方は32文字、一人称は16文字以内で入力してください。空欄にはできません。',
        identitySave: '名前と呼び方を保存', identitySaved: '名前と呼び方を覚えました。', identityPreview: 'この呼び方であいさつを聞く',
        identityGreeting: '{firstPerson}は{characterName}。{playerAddress}、よろしくね。',
        identity_called: '{playerAddress}、呼んだ？', identity_named: '{firstPerson}は{characterName}だよ。',
        identity_greeted: '{playerAddress}、おはよう。',
        identity_first_person: '自分のことは「{firstPerson}」って呼ぶよ。', identity_player_address: '{playerAddress}って呼ぶね。',
        identity_called_gesture: '聞き覚えのある呼びかけに気づき、こちらを向いた。',
        constellation: '言葉の星座', starsClose: '会話へ戻る',
        voiceStart: '音声で入力', voiceStop: '音声を止める', voiceRead: '返答を読み上げる', voiceVolume: '読み上げ音量',
        voiceListening: '聞いています。話し終えたら「録音を終える」を押してください。無音では終了しません。最大20秒です。',
        voiceFinish: '録音を終える', voiceRecordingCheck: '録音の確認・認識の比較',
        voiceCaptureProcessing: '録音時の補正を使う',
        voiceCaptureHelp: 'ノイズ抑制・エコー除去・自動音量調整を切り替えます。変更は次の録音から適用され、small／mediumの選択とは別です。端末側の補正は残る場合があります。',
        voiceCapturedOn: '補正ありで録音', voiceCapturedOff: '補正なしで録音',
        voiceCaptureMismatch: '端末が要求と異なる補正設定を報告しています。選んだ設定が反映されているとは限りません。',
        voiceCaptureUnknown: '端末から補正設定を確認できませんでした。実際の適用状態は不明です。',
        voiceRecordingHelp: '認識へ渡した直近1件の録音を聞き返せます。人声の区間を選ぶ前の音です。録音はメモリだけに保持し、次の録音・言語変更・新規開始・終了時に消えます。',
        voiceRecordingEmpty: '録音を終えると、ここで聞き返しと比較ができます。',
        voiceRecordingLimit: '最大20秒で録音を終了しました。続きは分けて録音してください。',
        voiceRecordingDelete: '録音を消す', voiceRecordingAudio: '認識に渡した録音',
        voiceCompareProfile: '同じ録音を認識する方法', voiceCompareStandard: '標準（small・人声の区間）',
        voiceCompareWhole: 'small・録音全体', voiceCompareMedium: '別モデル（medium・録音全体）',
        voiceCompare: '同じ録音で認識する', voiceCompareHelp: '録り直さず比較します。mediumは追加導入が必要で、時間がかかる場合があります。別モデルでも精度は保証されません。',
        voiceComparingInput: '同じ録音をPC内で認識しています。停止ボタンで取り消せます。',
        voiceComparisonReady: '比較結果を表示しました。入力欄と送信内容は変更していません。',
        voiceComparisonNoSpeech: 'この方法では声を聞き取れませんでした。録音と入力欄は残しています。',
        voiceMissingComparison: '比較用モデルが未導入です。音声入力の導入手順にある比較用コマンドを実行してください。',
        voiceComparisonApply: '比較結果を入力欄に使う',
        voiceComparisonEdited: '入力欄が編集されているため置き換えませんでした。必要な部分を比較結果からコピーしてください。',
        voicePreparingInput: '音声入力を準備しています。「聞いています」と表示されてから話してください。',
        voiceReview: '聞き取った文を確認して、送信してください。',
        voiceUnconfirmedInput: '最後の認識を確定できませんでした。途中の候補を残しています。内容を確認して修正してください。',
        voiceUnsupportedInput: 'この環境では音声入力を利用できません。文字で入力できます。',
        voiceUnsupportedOutput: 'この環境では読み上げを利用できません。返答は文字で表示します。',
        voiceDenied: 'マイクの利用が許可されていません。ブラウザーの設定を確認してください。',
        voiceNoSpeech: '声を聞き取れませんでした。もう一度試すか、文字で入力してください。',
        voiceFailedInput: '音声入力を開始・継続できませんでした。文字入力はそのまま使えます。',
        voiceProcessingInput: 'PC内で音声を文字にしています。',
        voiceMissingRecognizer: 'PC内の音声認識エンジンが未導入です。導入手順を確認してください。文字入力は使えます。',
        voiceNetworkInput: '音声認識サービスに接続できません。マイクの未検出とは別のエラーです。文字入力は使えます。',
        voiceFailedOutput: '読み上げができませんでした。返答は文字で確認できます。',
        voiceLong: '聞き取った文が長すぎます。短く分けて話してください。',
        voiceNotice: 'デスクトップ版の音声入力はPC内で認識します。ブラウザー版では音声認識サービスへ送信される場合があります。聞き取った文は送信前に直せます。',
        voiceSettings: '音声の設定', voiceChoose: 'この子の声を選ぶ',
        voiceSource: '声を作る方法', voiceDevice: '端末の声（従来の方式）', voiceLocal: 'PC内のVOICEVOX（演出付き）',
        voiceConnect: 'VOICEVOXに接続・声を更新', voiceLocalHelp: 'VOICEVOXをこのPCで起動してから接続してください。試聴・読み上げ時の文だけをPC内のVOICEVOXへ渡します。外部の音声サービスは使いません。',
        voiceConnectHelp: '接続できない場合は、VOICEVOXの起動、ブラウザーのローカルネットワーク許可、VOICEVOXの接続元許可を確認してください。',
        voiceProviderConnecting: 'VOICEVOXの声を確認しています。', voiceProviderReady: 'VOICEVOXに接続しました。声を選んで試聴できます。',
        voiceProviderFailed: 'VOICEVOXとの通信・音声生成ができませんでした。接続設定を確認し、再接続してください。',
        voiceProviderFirst: 'VOICEVOXに接続して声を選んでください。', voiceProviderLanguage: 'この音声生成は日本語とWeb Audio対応ブラウザーで利用できます。ほかの言語では端末の声を選んでください。',
        voiceProviderGenerating: '声を作っています。停止ボタンで取り消せます。',
        voiceEffect: 'この子らしい響きの強さ', voiceEffectHelp: '0で演出なし。声に響きや揺れを加えます。声の選択は生成元ごとに、演出は共通で保存するので、方式を戻しても設定は残ります。',
        voiceLocalGuide: 'VOICEVOXの導入・利用条件', voiceOrigin: '接続元：',
        voiceChoiceHelp: '声を選んで、この子に似合う高さや速さを試してみてください。しぐさは別の声で読み上げます。',
        voicePitch: '声の高さ', voiceRate: '話す速さ', voiceTuningReset: '高さ・速さを標準に戻す',
        voiceTuningHelp: '標準は1.00です。声や端末によって、調整できる幅や聞こえ方は異なります。',
        voiceDialogue: '会話の声', voiceNarrator: 'しぐさを読む声',
        voiceCastHelp: '師匠の会話としぐさは専用のVOICEVOX音声で読み上げます。初対面ムービー中は待ち、終了・スキップ後に読み上げます。',
        voiceCacheHelp: '師匠としぐさの定型音声はPC内に保存して再利用します。ムービー中や読み上げ中に次の音声を準備します。',
        voiceCastCredits: '師匠・しぐさの音声クレジット',
        voiceCastLanguage: '師匠としぐさの読み上げは、日本語とVOICEVOX接続が利用できる環境で使えます。',
        voiceAuditionHelp: '試聴は声の確認だけです。この子が言葉を覚えたり、話した記録にはなりません。',
        voiceSample1: 'こんにちは。よろしくね。', voiceSample2: 'あそこに何かあるみたい。',
        voiceSample3: 'いっしょに行ってみよう。', voiceSampleGesture: 'こちらを見て、小さくうなずいた。',
        voicePreview: 'このセリフを聞く', voicePreviewGesture: 'しぐさの声を聞く',
        voiceContinue: 'この声で進む', voiceChoiceBack: '設問に戻る', voiceChoiceClose: '声の選択を閉じる',
        voiceUnavailable: 'この言語の端末音声が見つかりません。端末の音声設定を確認してください。文字だけでも続けられます。',
        voiceMissing: '保存した声が見つかりません。声を選び直してください。',
        voiceReset: 'この端末の声で選び直す', voiceUnsaved: '声の設定を保存できませんでした。今回の起動中は選んだ声を使います。',
        dungeonEnter: 'ダンジョンへ行く', dungeonReturn: '島へ戻る', dungeonTitle: 'スカルダンジョン B1F',
        dungeonAuto: 'AUTO 開始／停止', dungeonStep: '本人の判断で1ターン',
        dungeonPoint: '見えているものについて、会話で教えたりお願いしたりできます。',
        dungeonGuide: '知らない呼び名やお願いは、その意味や対象を聞き返します。見た目や位置も言葉で伝えられます。戦闘はまだ行いません。',
        dungeonProposal: '聞き返している対象の候補を、輪郭で示しています。',
        dungeonWhich: 'どれのことかな？ 見た目や、今の自分から見た位置を言葉で教えて。まだ分からない呼び名：',
        dungeonConfirmTarget: '輪郭を光らせたものを、こう呼ぶということ？ 違っていたら教えてね。',
        dungeonConfirmUnnamed: '輪郭を光らせたもののことかな？ 合っているか、またはその呼び名を教えて。',
        dungeonMoreDetail: 'その位置だけでは、候補が複数あるよ。色や見た目も教えて。まだ分からない呼び名：',
        dungeonReferenceKnown: 'その呼び名は、前に教えてくれた、輪郭を光らせたもののことだと覚えているよ。',
        walkingLearned: '今の移動と、教えてくれた「歩く」が結び付いたよ。お願いは改めて伝えてね。',
        walking_learned_gesture: '実際に動いたことと、教わった「歩く」が結び付いた。',
        walkingNeedExperience: 'まだ「歩く」という言葉と、自分の動きを結び付けられていないよ。島で歩いている間か、ダンジョンで自分の判断で一歩動いた直後に、その動きを言葉で教えて。',
        dungeonConfirmGo: 'その場所へ歩いて近づいてほしい、というお願いかな？',
        dungeonConfirmAvoid: 'その相手や場所に近づかず、距離を取ってほしい、というお願いかな？',
        dungeonConfirmWarning: 'その相手には近づかない方がよい、という警告かな？',
        dungeonWordLearned: '教えてくれてありがとう。今回の場所で使う意味として覚えたよ。お願いはもう一度伝えてね。',
        dungeonNotLearned: 'その意味では覚えないでおくね。どういう意味か、改めて教えて。',
        dungeonNeedBasis: '対象だけでなく、説明やお願いの関係、歩くことにも、まだ分からない部分があるよ。島での学びも必要みたい。',
        dungeonVocabulary: 'ダンジョンの会話で教わった言葉',
        dungeonTeachingScope: 'この場所でプレイヤーに確認して教わりました。別の個体や言語、実体験の知識には広げません。',
        dungeonAvoid: 'お願いされた相手や場所から距離を取るね。',
        dungeonUnparsed: 'この文のどこが呼び名で、どこがお願いなのか、まだ分からない。見えているものの説明や、してほしいことを教えて。',
        dungeonNote: 'ダンジョンで聞いた警告', dungeonScope: '教わった個体への警告として覚えています。ほかの相手には広げません。',
        dungeonUnknown: 'まだ警告の関係や対象が分からず、行動の判断には使っていません。',
        dungeonLearned: 'この相手についての警告として覚えておくね。',
        dungeonDiverged: 'その相手は危ないと教わったから、指示とは違うけれど距離を取るね。',
        dungeonRetreat: '危ないと教わった相手から離れている。', dungeonExplore: '周囲を見ながら出口を探している。',
        dungeonObey: '頼まれた場所へ近づいてみるね。', dungeonArrived: '階段に着いた。島へ戻れます。',
        dungeonLimit: '言葉は受け取ったよ。ここでその行動ができるかは、まだ分からない。',
        gameTitle: 'AIテラリウム', gameSubtitle: '- 観測者の島 -',
        logoStart: '- クリックして開始 -', newGame: 'はじめから',
        continueGame: 'つづきから', backTitle: 'タイトルへ戻る',
        resetHeading: '新しい子との暮らしを始めますか？',
        resetCopy: '今の子・経験・ノート・島の保存を初期化します。言語と音量は引き継ぎます。',
        resetAccept: '初期化して始める', resetCancel: '今の暮らしを残す',
        questionIntro: '日常の場面で、自分ならどうするかを選んでください。正解はありません。回答と出会いの対応は試作中です。',
        questionPrevious: '前の問いへ', questionNext: '次の問いへ', questionMeet: 'この子に会う',
        meetingHeading: 'はじめまして', meetingBegin: 'サインする', meetingRetry: '書き直す',
        signature: 'サイン', signatureClear: 'サインを消す',
        meetingWords: 'こんにちは。', meetingSound: '……ん。',
        meetingRobot: '小さく首を傾け、こちらへ向き直った。',
        meetingSpirit: 'ふわりと揺れ、こちらへ近づいた。',
        meetingSeed: '葉をそっと揺らし、こちらを見上げた。',
        meetingOther: 'こちらを見て、小さく体を揺らした。',
        correction_pairing: '原説明と置換先を照合している。教示だけでは説明を取り下げない。',
        feeling_teaching_received: '原文に結び付けて、気持ちの語・話し手・時点を段階ごとに記録している。',
        feeling_teaching_unmatched: 'この教示に必要な原文や前提を照合できなかった。',
        note_feeling_teaching: '気持ちの報告を教わった記録',
        note_feeling_learned: 'この表現の語・関係を限定的に理解している。',
        note_feeling_pairing: 'もう一方の節の教示と、まだ照合している。',
        note_feeling_scope: '同じ相手・言語・二表現に限る。相手の気持ちの真偽や、自分の感情体験を確かめた記録ではない。',
        feeling_guide: '気持ちの二節を一度伝え、原文を選び、語・話し手・時点の順に教える。印は教示操作で、対比の習得は含まない。',
        contrast_teaching_received: '選んだ原文に結び付けて、二つの報告のつながりを段階ごとに記録している。',
        note_contrast_pairing: '両方の報告を残すこと、気持ちの違い、原因を述べないことを、まだ照合している。',
        note_contrast_learned: '両方の報告を残し、気持ちの違いを対比するつながりを、この表現に限って理解している。',
        note_contrast_scope: '同じ相手・言語のこの二節に限る。過去の報告を訂正せず、気持ちが変わった原因や真偽、自分の体験を確かめたものではない。',
        contrast_guide: '各節の語・話し手・時点を教えた後、同じ原文について次の三つを順に教える。両方を残し、違いを対比し、原因の説明にはしない。印は教示操作で、自由な対比表現へは広がらない。',
        note_correction_demo: '訂正について教わった例：',
        note_correction_learned: 'この語・相手・言語・場面・対象・表現で、原説明を置き換える関係を理解した。実際の訂正は別に受け取る。',
        correction_help: '食べる・休むと短い説明を先に学びます。通常の説明を聞いた同じ場面・対象で、原文を訂正元の印と« »で囲んで示し、次に取り下げて置換する文を示します。教示では説明を変えません。その後、印なしの訂正文を伝えます。例の語は自分の教えた語に変えてください。',
        reason_pairing: '完了した休息と、実際に選んだ声かけを教示と照合している。本人の回答とは別の記録。',
        note_reason_demo: '休息の選択について教わった例：',
        note_reason_question_learned: 'この相手・言語・表現で、休息の理由を尋ねる問いだと分かった。理由の理解や答えは別に確かめる。',
        note_reason_learned: '問いから実際に選んだ声かけへのつながりを理解した。この相手・言語・表現と休息に限る。すべての動機が分かったわけではない。',
        selected_reason: 'この声かけを選んで休んだことは、思い出せるよ：',
        reason_help: '休む・お願い・誘いを先に学びます。印なしのお願いを選んで休息を完了したら、その声かけを右側にした理由質問の例を教えます。誘いでも別の休息を完了して同じ手順を行います。問いを学んだら、理由説明の印で両方の選択を別々の完了休息に照合します。次の休息へ向かう前に教えてください。印は教示操作で、本人の回答や当時の理由を後付けするものではありません。',
        bodyHunger: '満腹度',
        bodyEnergy: '体力',
        word_situated: 'ここで教わった意味と結び付けて考えているよ。ほかでも同じかは、まだ分からない。',
        word_corrected: '前の説明を言い直したんだね。自分で経験したことは残して、今の説明と分けて考えるよ。',
        word_scope_unknown: 'どの説明につながるのか、まだはっきり分からない。',
        note_word_explained: '知っている意味と結び付けた説明。この相手・対象・場面で聞いたこととして覚えている。',
        note_word_withdrawn: '相手が言い直した説明。今の説明とは分けて残し、自分の経験は消さない。',
        work_did_explore: '荷物を運んだよ。',
        work_did_farming: '畑の石を拾ったよ。',
        work_did_fishing: '網の破れを直したよ。',
        work_did_cooking: '使った器を洗ったよ。',
        work_did_smithing: '風を送って、火を保ったよ。',
        work_did_building: '図面を書き写したよ。',
        work_label_explore: 'これは荷物を運ぶ手伝いよ。私と一緒に運んでみましょう。',
        work_label_farming: 'これは畑の石を拾う手伝いだよ。一緒に拾ってみよう。',
        work_label_fishing: 'これは網の破れを直す手伝いだ。俺と一緒に直してみな！',
        work_label_cooking: 'これは使った器を洗う手伝いだ！私と一緒に洗ってみよう！',
        work_label_smithing: '……風を送って火を保つ手伝いだ。俺のそばでやってみろ。',
        work_label_building: 'これは図面を書き写す手伝いだ。私と一緒に写してみよう。',
        work_untried: 'まだ、その手伝いはやったことがないよ。',
        work_again: 'また、あの手伝いをやってみたい。',
        work_other: '今は、ほかのこともやってみたい。',
        work_hungry: 'また考えたいけれど、今はお腹がすいている。',
        work_tired: 'また考えたいけれど、今は疲れている。',
        note_work_learned: '師匠の言葉と、自分で手伝った経験が結び付いた。',
        life_label_received: 'その言葉を聞きながら、今の動作や感覚に注意を向けている。',
        life_label_guide: '空腹・疲れの語は引用符で囲むと、プレイヤー自身の報告と区別できます。',
        note_life_learned: '行動中に聞いた言葉と、自分で確かめた経験が結び付いた。ほかの場面への応用は、まだ確かめていない。',
        relation_pairing: '知っている動作と説明の言葉を照らし合わせている。説明全体は、まだ分かっていない。',
        note_relation_pairing: 'この説明を聞きながら動作を確かめた。言い回しの働きは、まだ確かめている途中。',
        note_relation_learned: '食事と休息で聞いた説明から、知っている動作に呼び方を結ぶ言い回しが分かってきた。同じ相手・言語の短い説明で使える。',
        question_pairing: '示された問いと答えの組を、今の動作と照らし合わせている。本人が答えたわけではない。',
        note_question_demo: '教わった問いと答えの例：',
        note_question_pairing: '問いと答えの例を聞きながら動作を確かめた。問いの働きは、まだ確かめている途中。',
        note_question_learned: '同じ問いへの答えが動作によって変わる例から、今の行動を尋ねる働きが分かってきた。同じ相手・言語・問いに限る。',
        question_demo_guide: '質問の例は「何してる？」→「食べる」の形で示せます。同じ問いを休息中は「休む」と組にし、既知の動作と照らし合わせます。',
        time_pairing: '休息中の教示と、その休息を振り返る教示を、元の経験の時点に照らして確かめている。',
        sequence_pairing: '食事中の言葉を覚えて、同じ食事の完了後へのお願いかどうか確かめている。',
        sequence_learned: '同じ食事の前後を照合し、食べ終えた後への休息のお願いだと分かった。',
        sequence_understood: '食べ終えた後に休んでほしいんだね。いつ休むかは、また自分で考えるね。',
        note_sequence_demo: '食事の前後とお願いを教わった言葉：',
        note_sequence_pairing: '未完了の食事と教示を対応付けた。同じ食事が完了した後の教示を、まだ照合している。',
        note_sequence_learned: '同じ食事の未完了と完了を照合し、食後への休息のお願いだと分かった。同じ相手・言語・表現に限る。実行や予約とは別。',
        sequence_help: '食べる・休む・お願いを知ったあと、食事中に【順序・未完了】「あなたが食べ終わったら、休んでね」、その食事の完了後、次の食事が始まる前に【順序・完了】「あなたが食べ終わったら、休んでね」と教えられます。印は同じ食事を指す教示操作で、休息の実行や予約にはしません。',
        condition_pairing: '疲れの感覚と、疲れた場合への休息のお願いを照らし合わせている。まだ条件の働きを確かめている途中。',
        note_condition_demo: '条件と適用先を教わった言葉：',
        note_condition_pairing: '休息中の感覚と教示を対応付けた。条件に当てはまる場合と当てはまらない場合を、まだ照合している。',
        note_condition_learned: '疲れた場合への休息のお願いだと分かった。同じ相手・言語・表現に限る。今の状態の判断や従うかどうかは別で、予約にはしない。',
        condition_met: '疲れた場合に休んでほしいんだね。今の感覚は当てはまりそう。',
        condition_unmet: '疲れた場合に休んでほしいんだね。今の感覚は当てはまらなさそう。',
        condition_unknown: '疲れた場合に休んでほしいんだね。今、当てはまるかは分からない。',
        condition_help: '疲れ・休む・お願いを知ったあと、疲れの強い休息中に【条件・該当】「あなたが疲れていたら、休んでね」、疲れの少ない別の休息中に【条件・非該当】「あなたが疲れていたら、休んでね」と教えられます。両方の休息完了後に照合します。印は教示操作で、今すぐの要求や予約ではありません。',
        note_time_demo: '現在と過去を教わった言葉：',
        note_time_pairing: '教示を元の休息に対応付けた。現在と過去の違いは、まだ確かめている途中。',
        note_time_learned: '同じ休息の現在と過去を区別できた。同じ相手・言語・自分についての肯定二表現に限る。相手の経験や否定文へは広げない。',
        heard_report_past: 'さっきの休息についての話なんだね。',
        time_help: '報告の主体と休む意味を知ったあと、休息中に【時点・現在】「あなたはいま休んでいる」と教え、後の休息中に最初に教えた休息を指して【時点・過去】「あなたはさっき休んでいた」と教えられます。両方の休息完了後に二表現を照合します。',
        negation_pairing: '休んでいる場面と休んでいない場面を、同じ休むという意味に照らして確かめている。',
        note_negation_demo: '肯定と否定を対照して教わった言葉：',
        note_negation_pairing: '自分の活動と教示を対応付けた。休むことの肯定と否定の違いは、まだ確かめている途中。',
        note_negation_learned: '休むことの肯定と否定を区別できた。同じ相手・言語・自分についての二表現に限る。休んでいないことから、別の行動や希望は決めない。',
        heard_report_not_resting: 'ぼくが休んでいない、という話だね。',
        identity_report_not_resting: '{firstPerson}が休んでいない、という話だね。',
        identity_report_self: '{firstPerson}が休んでいる、という話だね。',
        identity_report_player: '{playerAddress}が休んでいる、という話だね。',
        negation_help: '報告の主体と食べる・休むを知ったあと、休息中に【否定対照・肯定】「あなたは休んでいる」、別の食事中に【否定対照・否定】「あなたは休んでいない」と教えられます。これは場面の対照で、停止命令や時点の教示ではありません。',
        report_pairing: '誰についての報告かを、示された役割と自分の休息に照らして確かめている。相手の体験を確かめたことにはしない。',
        note_report_demo: '報告の主体を示して教わった言葉：',
        note_report_pairing: '休む意味と報告の主体を対応付けた教示。自分と相手についての報告の違いは、まだ確かめている途中。',
        note_report_learned: '自分と相手についての報告を区別できた。同じ相手・言語・確認した表現に限る。相手の報告は自分の実体験ではなく、内容が事実かは未確認。',
        report_demo_guide: '休息中に【報告・あなた】「あなたは休んでいる」、別の休息中に【報告・私】「私は休んでいる」で報告の主体を教えられます。印は教示操作です。休む意味が既知である必要があり、相手の体験や未知の説明語を理解したことにはしません。',
        heard_report_self: '私が休んでいる、という話だね。',
        heard_report_player: 'あなたが休んでいる、という話だね。',
        proposal_pairing: '示された役割と言葉を、今の休息と照らし合わせている。言葉に従ったことや、一緒に休んだことにはしない。',
        note_proposal_demo: '役割を示して教わった言葉：',
        note_proposal_pairing: '自分の休息と結び付けた教示。お願いと誘いの違いは、まだ確かめている途中。',
        note_proposal_learned: '自分に休んでほしいお願いと、相手と一緒に休む誘いを区別できた。同じ相手・言語・確認した表現に限る。参加は提案であり、共同体験の記録ではない。',
        proposal_demo_guide: '休息中に【お願い】「休んでね」、別の休息中に【誘い】「一緒に休もう」で役割を教えられます。印は教示用の操作で、実際の声かけは引用内の文です。休む意味を知っている必要があります。',
        title: 'ことばと、小さな暮らし',
        masterPlaces: '島で働く人たち', masterVisit: '会いに行くよう誘う', pointed_master: '働いている人の方を指さした。',
        master_explore: '冒険家', master_farming: '農家', master_fishing: '漁師',
        master_cooking: '料理人', master_smithing: '鍛冶師', master_building: '建築士',
        master_meet: '働いている人に近づき、手元をじっと見ている。',
        master_return: '前に会った人の仕事を、また眺めている。',
        master_try: '自分から手を伸ばし、教わりながら手伝いを始めた。',
        master_defer: '少し見てから、その場を離れた。',
        work: '教わりながら、手伝いに取り組んでいる。',
        finish_work: '今の手伝いが終わるまで、少し待ってね。',
        masterClose: '閉じる',
        masterContinue: 'わかった！', masterReveal: '話を聞く', masterSkip: 'スキップ',
        masterPresence: '（何者かの気配がする……）',
        master_intro_explore: 'あら、森の探検に興味があるのね。私は今、探検の支度をしているところよ。荷物を運ぶところ、見ていく？',
        master_intro_farming: 'やあ、土いじりに興味があるのかい？私は畑の石を取り除いているんだ。やってみたくなったら、一緒にやろう。',
        master_intro_fishing: 'おう、網の破れを直しているところだ。俺のそばで見ていきな！ハッハッハ！',
        master_intro_cooking: 'いらっしゃい！私は使った器を洗っているところだ！手伝いたくなったら、やり方を見せるぞ！',
        master_intro_smithing: '……俺は火に風を送っている。やってみるなら、そばについて教えよう。',
        master_intro_building: 'ん？君も建築に興味があるのか？私は図面を書き写しているところだ。興味があれば、一緒に線を引いてみよう。',
        master_result_explore: '教わりながら荷物を運び、探検の支度をひとつ手伝った。',
        master_result_farming: '教わりながら畑の石を拾い、耕す場所をひとつ片づけた。',
        master_result_fishing: '教わりながら網の破れをひとつ直した。',
        master_result_cooking: '教わりながら、使った器をひとつ洗い終えた。',
        master_result_smithing: '教わりながら風を送り、炉の火を保つ手伝いを終えた。',
        master_result_building: '教わりながら、図面の一部分を書き写した。',
        master_met_explore: '森で探検の支度をしている人に会った。',
        master_met_farming: '畑の手入れをしている人に会った。',
        master_met_fishing: '水辺で網を直している人に会った。',
        master_met_cooking: '店のそばで器を洗っている人に会った。',
        master_met_smithing: '火を使って仕事をしている人に会った。',
        master_met_building: '図面を描いている人に会った。',
        note_master_met: '近くへ行って、自分で見た出会い。言葉の意味まで分かったとは限らない。',
        note_work_result: '自分で取り組んだ結果。仕事の名前や説明の理解とは別の経験。',
        islandLabel: '島で暮らすキャラクター',
        islandGuide: 'この子の暮らしを見守り、気になったことを話しかけてみてください。行動は本人が選びます。',
        walk: '散歩に誘う',
        volume: 'BGM音量',
        good_morning: 'おはよう。',
        unknown_taste_word: 'その味の言葉はまだ分からないけれど、食べたときは甘く感じたよ。',
        heard_rest_partial: '休むことの話だね。説明の続きは、まだよく分からない。',
        see_berry: 'うん、木の実を見ているよ。',
        heard_berry: '木の実のことだね。',
        heard_rest_comfort: '横になると心地よい、って教えてくれたんだね。',
        exportReport: '試遊レポートを保存',
        reportScope: 'この起動中の会話・操作と、保存済みを含むノートを一つのファイルにまとめます。自動送信はしません。',
        reportSaved: 'レポートを保存しました。保存したファイルを添付して共有できます。',
        reportDownload: 'レポートのダウンロードを開始しました。保存したファイルを添付して共有できます。',
        reportFailed: 'レポートを保存できませんでした。もう一度お試しください。',
        reportCanceled: 'レポートの保存を取りやめました。',
        personalActive: '自分用の自動記録：保存済み',
        personalPending: '自分用の自動記録：保存待ち',
        personalFailed: '自分用の自動記録：保存できていません',
        personalPaused: '自分用の自動記録：停止中',
        personalPause: '自動記録を停止', personalResume: '自動記録を再開',
        personalHelp: 'このPCの開発用フォルダに会話と動作状況を自動保存します。外部へ送信しません。',
        note_name_confirmed: 'この呼び方で合っていると、あなたに確かめた。ほかのものにも使えるかは、まだ確かめていない。',
        name_known: '。',
        tasted_good: 'うん、甘くておいしかった。', tastes_good: 'うん、甘くておいしい。',
        not_eaten_yet: 'まだ食べていないから、味は分からない。',
        taste_unsure: '食べたけれど、味はまだうまく言えない。',
        rest_helped: 'うん、休んだら疲れが軽くなったよ。', pleased_gesture: '満足そうに、うなずいた。',
        note_experienced_sweet: '自分で食べて、甘さを感じた。', note_count: '同じ内容の記録：',
        pointed_berry: '木の実を指さした。', pointed_shade: '木陰を指さした。',
        finish_meal: '食べ終わるまで、少し待ってね。',
        notebook: 'この子のノート', names: '教わったこと', experiences: 'やってみたこと', questions: '答えが見つからなかったこと',
        note_name: '教わった呼び方：', note_name_scope: 'そのとき見ていたものの呼び方として聞いた。ほかのものも同じ呼び方かは、まだ確かめていない。',
        note_withdrawn: 'この説明は、あとから取り下げられた。',
        note_player_likes: 'あなたは木の実が好きだと聞いた。', note_player_likes_one: 'あなたは、あの木の実が好きだと聞いた。',
        note_heard: 'あなたから聞いたこと。自分の好みとは別。',
        note_ate: '食べてみたら、おなかのすいた感じが小さくなった。',
        note_rested: '休んでみたら、疲れが軽くなった。',
        note_ate_sensation: '口に入れたあと、体の感じが少し楽になった。',
        note_rest_sensation: '横になったあと、体の感じが少し楽になった。',
        note_tried_eat: '口に入れてみた。', note_tried_rest: '横になってみた。',
        note_experienced: '自分でやってみたこと。', note_question: '聞かれたこと：', note_no_answer: 'この問いかけには、まだ答えが見つからなかった。',
        note_organized: '眠ったあとに整理', note_recent: '書き留め',
        note_empty: 'まだ書き留めたことはありません。近くのものを指さしたり、食事や休息を見守ったりしてみてください。',
        note_more: '前の記録も読む',
        playGuide: '遊びの手がかり',
        playGuideText: '指さしたものに近づいたら、呼び方を教えてみてください。食事中に「木の実」「食べる」「甘い」、休息中に「休む」など、一語ずつ伝えると、行動を終えた経験と言葉が結び付きます。質問や否定とは区別します。',
        noteGuide: 'この子に残った経験や考えを、読める文にしています。開いたり読み返したりしても、学習は増えません。',
        receivedName: '呼び方として受け取りました。ノートで確かめられます。',
        receivedPartial: '今回の声かけは、まだ十分には伝わっていません。短く言い換えたり、指さしてから話しかけたりしてみてください。',
        autosave: '試作・自動保存', continue: 'この子との暮らしを続ける',
        savedNotice: '暮らしと学習は、この試作専用に自動保存します。不在中は時間を進めません。',
        saveFailed: '保存を停止しました。以前のデータは残しています。',
        notice: 'この子を見守りながら、気になったことを話しかけてみてください。今は保存できません。ページを閉じたり再読み込みすると、この時間は失われます。',
        intro: '歩いたり、立ち止まったり。あなたの言葉と、この子の経験が少しずつつながります。',
        appearance: '出会う子の姿', robot: 'ロボット', spirit: '精霊', seed: '植物',
        ghost: '幽霊', stone: 'ゴーレム', magician: '魔法使い', beetle: 'カブトムシ',
        balloon: '風船', bird: '鳥', machine: 'ぜんまい', dragon: 'ドラゴン',
        point: '木の実を指さす', shade: '木陰を指さす', pause: 'ひと休み・再開',
        idle: 'あたりを眺めている。', move: '気になる場所へ歩いている。',
        rest: '木陰で横になっている。', looking: '木の実をじっと見ている。',
        eat: '採った木の実を少しずつ食べている。',
        ate_gesture: '木の実を食べ終え、ほっとした様子だ。',
        woke_gesture: 'ひと眠りして、ゆっくり起き上がった。',
        paused: '時間を止めています。', typing: 'あなたの言葉を待っている。',
        hint: '指さしたものに近づいたら、呼び方を教えてみても。話さず見守っていても大丈夫です。',
        name_echo: '…？', recognize_gesture: '覚えのあるものに目を向けた。',
        join: 'うん、行ってみよう。', keep_looking: '今は、もう少しこれを見ていたい。',
        sceneLabel: '広場で暮らすキャラクター', imagesFailed: '姿の画像を読み込めませんでした。ページを開き直してください。',
        conversation: 'この子との会話', sessionOnly: '試作・保存なし', inputHint: 'Enterで送信・Shift+Enterで改行',
        ask_name: 'これ、なんて呼ぶの？', which_name: 'どれの呼び方かな？',
        name_confirmed: 'うん、その呼び方なんだね。', name_reconsider: '違ったんだね。もう一度、教えて。',
        known_berry: '木の実だよ。', walking: '今は散歩しているよ。', walked: 'さっきは歩いていたよ。',
        resting: '今は休んでいるよ。', rested: 'さっきは休んでいたよ。',
        looking_berry: 'この木の実を見ているよ。', looked_berry: 'さっきは木の実を見ていたよ。',
        looking_walk: '歩くところを見ているよ。', looked_walk: 'さっきは歩くところを見ていたよ。',
        looking_rest: '休むところを見ているよ。', looked_rest: 'さっきは休むところを見ていたよ。',
        going_berry: '木の実のところへ向かっているよ。', going_rest: '休むところへ向かっているよ。',
        going_walk: '歩くところへ向かっているよ。', not_going: '今はどこへも向かっていないよ。',
        eating: '今は食べているよ。', ate: 'さっきは食べていたよ。',
        taking_break: '今はひと息ついているよ。', took_break: 'さっきはひと息ついていたよ。',
        break_explained: '少し何もせず休む、という意味で言ったよ。',
        observed_feeling_unknown: 'そう見えたけれど、本人の気持ちや理由はまだ分からない。',
        suggestion_reason: '休もうって聞いて、行ってみようと思ったんだ。',
        player_likes_berry: '木の実、好きって言っていたね。',
        foundation: '理解の土台', life: '生活知識', speech: '発話の形式',
        foundationOn: '短いお願い・否定・質問などの関係を知って始める',
        foundationOff: '関係の土台から育てる',
        lifeOn: '基本の生活語・感覚・気持ちを知って始める',
        lifeOff: '生活の意味と言葉の結び付きから育てる',
        short: '短文の形式を使える（知らない内容は話さない）',
        gesture: 'しぐさ・短い発声から始める', start: 'この設定で試す',
        scene: '検証用の場面', clearing: '広場', path: '小道',
        attention: '検証用の注目対象', none: '対象なし', one: '木の実ひとつ', two: '二つの木の実',
        chat: '声をかける', send: '送る', diagnostics: '検証用：理解と学習の内訳',
        attend: 'こちらに視線を向けている。', acknowledge: 'うん、聞いているよ。',
        uncertain: 'まだ、よく分からない。', answer_unknown: 'まだ、答えが分からない。',
        heard_feeling_partial: '詳しいことはまだ分からないけれど、話してくれた気持ちは受け取ったよ。',
        heard_feeling: '話してくれた気持ち、聞いているよ。',
        heard_event_partial: 'うまくいったかどうかは伝わったよ。詳しい出来事は、まだ分からない。',
        receive_sadness: '悲しい気持ち、伝わったよ。', failed: '読み込みに失敗しました。ページを開き直してください。'
    };
    let state;
    let catalog;
    let world;
    let view;
    let paused = false;
    let lastFrame = null;
    let lastStatus = '';
    let imageFailure = false;
    let restored = null;
    let saveBlocked = false;
    let controlFeedback = null;
    let report = null;
    let personalLog = null;
    let exporting = false;
    let screen = window.WordIslandMode ? 'logo' : 'setup';
    let dungeon = null, dungeonView = null, dungeonVisuals, adventureView;
    const adventureApi = window.ExperimentalWordAdventureConnection;
    let adventureLabelOnly = false, adventureMentorSpeech = false;
    const autoApi = window.ExperimentalWordAutoTraining;
    let autoMemory = autoApi.create(), autoActive = false, autoPlan = null, autoDue = 0, autoBaseline = null, automaticSubmission = false;
    let environmentVolume = .5;
    let voice, lastReplyIsNarration = false, adventureSpeechToken = 0, adventureSpeechPending = false;
    let adventureSpeechPromise = Promise.resolve();
    let adventureActionToken = 0;
    function holdAdventureSpeech(play) {
        const token = ++adventureSpeechToken;
        adventureSpeechPending = readAloud.checked;
        adventureSpeechPromise = Promise.resolve(play()).finally(() => {
            if (token === adventureSpeechToken) adventureSpeechPending = false;
        });
        return adventureSpeechPromise;
    }
    function record(kind, data) {
        report?.record(kind, { elapsed: world?.elapsed ?? 0, locale: window.GameI18n.language, ...data });
        personalLog?.record(kind, { elapsed: world?.elapsed ?? 0, locale: window.GameI18n.language, ...data });
    }
    const displayText = key => window.GameI18n.translate(t(key));
    const worldApi = window.ExperimentalWordWorld;
    if (adventureApi) {
        adventureApi.actions.forEach((id, i) => { labels['adv_' + id] = adventureApi.words.ja[i]; });
    }
    // Keep Japanese source text in the DOM so localization_core can re-render it
    // on every language switch, including when the initial language is not Japanese.
    const t = key => labels[key];
    function node(tag, text, parent = app) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        parent.appendChild(element);
        return element;
    }
    function select(parent, title, options) {
        const label = node('label', t(title), parent);
        const input = node('select', undefined, label);
        options.forEach(([value, key]) => { const option = node('option', t(key), input); option.value = value; });
        return input;
    }
    const header = node('header'); header.className = 'game-header';
    const shellMessages = { settings: '設定', close: '閉じる', album: '思い出アルバム', empty: 'これから、思い出を集めよう。',
        guide: '出会いや初めての体験など、暮らしの節目がここに残ります。', acquired: '新しい思い出が増えました。',
        meeting: 'この子との出会い', encounter: '初めての出会い', meal: '食事の思い出', rest: 'ひと休みの思い出',
        work: 'お手伝いの思い出', evolution: '新しい姿になった日', previous: '前のページ', next: '次のページ',
        rememberedName: 'この思い出のときの名前' };
    const st = key => shellMessages[key];
    const settingsButton = node('button', st('settings'), header); settingsButton.type = 'button'; settingsButton.id = 'word-settings';
    const settingsDialog = node('dialog', undefined, document.body); settingsDialog.id = 'word-settings-dialog'; settingsDialog.className = 'word-settings-dialog';
    settingsDialog.setAttribute('aria-label', st('settings')); node('h2', st('settings'), settingsDialog);
    const settingsBody = node('div', undefined, settingsDialog); settingsBody.className = 'word-settings-body';
    const settingsClose = node('button', st('close'), settingsDialog); settingsClose.type = 'button';
    settingsButton.addEventListener('click', () => { stopAuto(); voice.stop(); settingsDialog.showModal(); settingsClose.focus(); });
    settingsClose.addEventListener('click', () => settingsDialog.close());
    node('h1', t('title'), header);
    document.title = t('title');
    const saveBadge = node('span', t(window.wordStorage ? 'autosave' : 'sessionOnly'), header); saveBadge.className = 'session-badge';
    saveBadge.setAttribute('role', 'status');
    const setupCopy = node('div'); setupCopy.className = 'setup-copy';
    setupCopy.hidden = true;
    node('p', t('intro'), setupCopy).className = 'intro';
    node('p', t(window.wordStorage ? 'savedNotice' : 'notice'), setupCopy);
    const language = node('select', undefined, header);
    language.setAttribute('data-i18n-skip', '');
    language.setAttribute('aria-label', 'Language');
    Object.entries(window.GameI18n.languages).forEach(([id, item]) => {
        const option = node('option', item.label, language); option.value = id;
    });
    language.value = window.GameI18n.language;
    language.addEventListener('change', () => window.GameI18n.setLanguage(language.value));
    window.addEventListener('game-language-changed', () => { language.value = window.GameI18n.language; });
    const settings = node('form');
    // Internal compatibility controls for focused regression scenarios, never shown.
    const internalSettings = node('div', undefined, settings); internalSettings.hidden = true;
    const appearance = select(internalSettings, 'appearance', window.ExperimentalWordStartQuestions.appearances.map(id => [id, id]));
    const foundation = select(internalSettings, 'foundation', [['yes', 'foundationOn'], ['no', 'foundationOff']]);
    const life = select(internalSettings, 'life', [['yes', 'lifeOn'], ['no', 'lifeOff']]);
    const speech = select(internalSettings, 'speech', [['short', 'short'], ['gesture', 'gesture']]);
    const questionsApi = window.ExperimentalWordStartQuestions;
    let answers = [], questionIndex = 0;
    // Decorative geometry only: questions remain native text/buttons for localization
    // and keyboard access. No new raster asset or character hint is used here.
    function documentFrame(parent, completed) {
        const canvas = node('canvas', undefined, parent); canvas.className = 'document-frame';
        canvas.setAttribute('aria-hidden', 'true');
        const draw = () => {
            const { width, height } = parent.getBoundingClientRect();
            if (!width || !height) return;
            const ratio = Math.min(devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
            const c = canvas.getContext('2d'); c.scale(ratio, ratio);
            const wash = c.createLinearGradient(0, 0, width, height);
            wash.addColorStop(0, '#102733'); wash.addColorStop(1, '#080f1b');
            c.fillStyle = wash; c.fillRect(0, 0, width, height);
            c.strokeStyle = '#70d9f038'; c.lineWidth = 1;
            c.strokeRect(12.5, 12.5, width - 25, height - 25);
            c.strokeStyle = '#83e8ff'; c.shadowColor = '#49ceff'; c.shadowBlur = 9;
            for (const [x, y, sx, sy] of [[12,12,1,1],[width-12,12,-1,1],[12,height-12,1,-1],[width-12,height-12,-1,-1]]) {
                c.beginPath(); c.moveTo(x, y+sy*24); c.lineTo(x,y); c.lineTo(x+sx*24,y); c.stroke();
            }
            for (let i = 0; i < questionsApi.questions.length; i++) {
                const x = width / 2 + (i - 3) * 25;
                c.fillStyle = i < completed() ? '#a5efff' : '#254351';
                c.shadowBlur = i < completed() ? 12 : 0;
                c.fillRect(x - 6, 32, 12, 3);
            }
            c.shadowBlur = 0; c.strokeStyle = '#72d5ea24';
            c.beginPath(); c.moveTo(34, 55.5); c.lineTo(width-34,55.5); c.stroke();
        };
        new ResizeObserver(draw).observe(parent);
        return draw;
    }
    settings.className = 'word-questions';
    const drawQuestionFrame = documentFrame(settings, () => questionIndex);
    node('p', t('questionIntro'), settings).hidden = true;
    const questionCount = node('p', '', settings); questionCount.className = 'question-count';
    const questionField = node('fieldset', undefined, settings);
    const start = node('button', t('start'), settings);
    start.disabled = true; start.hidden = true;
    function renderQuestion() {
        const question = questionsApi.questions[questionIndex];
        questionCount.textContent = `${questionIndex + 1} / ${questionsApi.questions.length}`;
        questionField.replaceChildren();
        const legend = node('legend', question.text, questionField);
        legend.tabIndex = -1;
        question.choices.forEach((text, index) => {
            const button = node('button', text, questionField); button.type = 'button';
            button.dataset.answer = String(index); button.setAttribute('aria-pressed', String(answers[questionIndex] === index));
            button.disabled = !catalog || saveBlocked;
            button.addEventListener('click', () => {
                answers[questionIndex] = index; start.disabled = false; settings.requestSubmit(start);
            });
        });
        drawQuestionFrame();
        questionField.getAnimations().forEach(animation => animation.cancel());
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            questionField.animate([{ opacity: .25, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220 });
        }
        start.textContent = t(questionIndex === questionsApi.questions.length - 1 ? 'questionMeet' : 'questionNext');
        start.disabled = !catalog || answers[questionIndex] === undefined;
        legend.focus();
    }
    renderQuestion();
    const meeting = node('dialog'); meeting.className = 'word-reset word-meeting';
    const meetingContent = node('div', undefined, meeting); meetingContent.className = 'word-meeting-content';
    const drawMeetingFrame = documentFrame(meetingContent, () => questionsApi.questions.length);
    const meetingHeading = node('h2', t('meetingHeading'), meetingContent); meetingHeading.id = 'word-meeting-heading';
    meeting.setAttribute('aria-labelledby', meetingHeading.id);
    const meetingBody = node('div', undefined, meetingContent); meetingBody.className = 'word-meeting-body';
    const meetingPartner = node('div', undefined, meetingBody); meetingPartner.className = 'word-meeting-partner';
    const meetingCanvas = node('canvas', undefined, meetingPartner); meetingCanvas.width = 300; meetingCanvas.height = 210;
    meetingCanvas.className = 'meeting-character';
    meetingCanvas.setAttribute('aria-hidden', 'true');
    const meetingVoice = node('p', '', meetingPartner), meetingGesture = node('p', '', meetingPartner);
    const signatureLabel = node('label', t('signature'), meetingContent); signatureLabel.htmlFor = 'word-signature';
    const signatureCanvas = node('canvas', undefined, meetingContent); signatureCanvas.id = 'word-signature';
    signatureCanvas.width = 720; signatureCanvas.height = 160; signatureCanvas.tabIndex = 0;
    signatureCanvas.setAttribute('aria-label', t('signature'));
    const signatureClear = node('button', t('signatureClear'), meetingContent); signatureClear.type = 'button'; signatureClear.id = 'word-signature-clear';
    const meetingBegin = node('button', t('meetingBegin'), meetingContent); meetingBegin.type = 'button'; meetingBegin.id = 'word-meeting-begin';
    const meetingRetry = node('button', t('meetingRetry'), meetingContent); meetingRetry.type = 'button'; meetingRetry.id = 'word-meeting-retry';
    let choosingInitialVoice = true;
    // Signature is transient ceremony data, never knowledge, experience, or a name.
    // Keeping normalized strokes also preserves the drawing when the layout changes.
    let signatureStrokes = [], activeSignaturePointer = null, signedIdentity = null;
    function drawSignature() {
        const c = signatureCanvas.getContext('2d'); c.clearRect(0, 0, 720, 160);
        c.strokeStyle = '#42573d'; c.fillStyle = '#42573d'; c.lineWidth = 2.8;
        c.lineCap = c.lineJoin = 'round'; c.shadowColor = '#42573d'; c.shadowBlur = 0;
        for (const stroke of signatureStrokes) {
            if (stroke.length === 1) { c.beginPath(); c.arc(stroke[0].x*720,stroke[0].y*160,1.4,0,Math.PI*2); c.fill(); }
            else { c.beginPath(); stroke.forEach((p,i) => c[i ? 'lineTo' : 'moveTo'](p.x*720,p.y*160)); c.stroke(); }
        }
        meetingBegin.disabled = signatureStrokes.length === 0 || activeSignaturePointer !== null || screen !== 'meeting'
            || !identityApi.valid(readIdentityDraft());
        signatureClear.disabled = signatureStrokes.length === 0 || screen !== 'meeting';
    }
    function signaturePoint(event) {
        const r = signatureCanvas.getBoundingClientRect();
        return { x: Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)), y: Math.max(0,Math.min(1,(event.clientY-r.top)/r.height)) };
    }
    signatureCanvas.addEventListener('pointerdown', event => {
        if (screen !== 'meeting' || activeSignaturePointer !== null || event.button !== 0) return;
        event.preventDefault(); activeSignaturePointer = event.pointerId;
        signatureCanvas.setPointerCapture(event.pointerId);
        signatureStrokes.push([signaturePoint(event)]); drawSignature();
    });
    signatureCanvas.addEventListener('pointermove', event => {
        if (event.pointerId !== activeSignaturePointer) return;
        const samples = event.getCoalescedEvents?.();
        for (const sample of samples?.length ? samples : [event]) signatureStrokes.at(-1).push(signaturePoint(sample));
        drawSignature();
    });
    function endSignature(event) {
        if (event.pointerId !== activeSignaturePointer) return;
        activeSignaturePointer = null; drawSignature();
    }
    ['pointerup','pointercancel','lostpointercapture'].forEach(type => signatureCanvas.addEventListener(type, endSignature));
    signatureClear.addEventListener('click', () => {
        if (screen !== 'meeting') return;
        signatureStrokes = []; activeSignaturePointer = null; drawSignature(); signatureCanvas.focus();
    });
    let meetingImage = null;
    let meetingVisuals = null;
    function drawMeeting(time) {
        if (!meeting.open) return;
        if (window.WordIslandMode && screen === 'playing' && state?.evolution) {
            const { skin, config, image } = selectedSprite();
            if (!image.complete || !image.naturalWidth) return;
            const context = meetingCanvas.getContext('2d'), f = config.actions.idle[0], scale = Math.min(130 / f.sw, 150 / f.sh);
            context.clearRect(0, 0, 300, 210); context.drawImage(image, f.sx, f.sy, f.sw, f.sh, 150 - f.sw * scale / 2, 185 - f.sh * scale, f.sw * scale, f.sh * scale);
            meetingCanvas.dataset.skin = skin; return;
        }
        if (!meeting.open || !meetingImage?.complete || !meetingImage.naturalWidth) return;
        const context = meetingCanvas.getContext('2d'), skin = appearance.value;
        const f = meetingVisuals[skin].actions.idle[0];
        const scale = Math.min(130 / f.sw, 150 / f.sh);
        const movement = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.sin(time / 700) * 3;
        context.clearRect(0, 0, 300, 210);
        context.save(); context.translate(150, 185 + movement);
        if (skin === 'robot') context.rotate(movement / 80);
        context.drawImage(meetingImage, f.sx, f.sy, f.sw, f.sh, -f.sw * scale / 2, -f.sh * scale, f.sw * scale, f.sh * scale);
        context.restore();
    }
    meeting.addEventListener('cancel', event => { event.preventDefault(); if (!choosingInitialVoice) closeVoiceChoices(); });
    meetingBegin.addEventListener('click', () => {
        if (screen !== 'meeting' || !signatureStrokes.length || activeSignaturePointer !== null) return;
        const introduction = readIdentityDraft(); if (!identityApi.valid(introduction)) return;
        signedIdentity = introduction;
        voice.stop();
        screen = 'signing'; drawSignature(); meetingRetry.disabled = true;
        for (const control of identityPanel.querySelectorAll('input,button')) control.disabled = true;
        meeting.classList.add('signed');
        setTimeout(() => {
            meeting.close(); meeting.classList.remove('signed');
            signatureStrokes = []; drawSignature(); beginSession(); lastFrame = null;
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
    });
    meetingRetry.addEventListener('click', () => {
        if (screen !== 'meeting') return;
        voice.stop();
        meeting.close(); meetingImage = null; answers = []; questionIndex = 0; showSetup();
        signatureStrokes = []; activeSignaturePointer = null; drawSignature();
    });
    const titleScreen = node('section'); titleScreen.className = 'word-title';
    titleScreen.hidden = !window.WordIslandMode;
    const logoButton = node('button', undefined, titleScreen); logoButton.className = 'word-logo';
    logoButton.type = 'button'; logoButton.setAttribute('aria-label', t('logoStart'));
    const logoCanvas = node('canvas', undefined, logoButton); logoCanvas.width = 1280; logoCanvas.height = 720;
    logoCanvas.setAttribute('aria-hidden', 'true');
    const titleMenu = node('div', undefined, titleScreen); titleMenu.className = 'word-title-menu'; titleMenu.hidden = true;
    const collectionApi = window.ExperimentalWordCollection;
    let collection = collectionApi.create();
    const collectionData = window.ExperimentalWordCollectionData;
    const titleActors = node('canvas', undefined, titleScreen); titleActors.width = 1280; titleActors.height = 720;
    titleActors.className = 'word-title-actors'; titleActors.setAttribute('aria-hidden', 'true');
    const titleImages = new Map();
    const collectionMessages = { title: '図鑑', history: '当時の名前', unnamed: '名前の記録なし', migration: '移行時の名前（当時名の対応記録なし）' };
    const ct = key => collectionMessages[key];
    const titleBook = node('button', ct('title'), titleMenu); titleBook.type = 'button'; titleBook.id = 'word-title-book'; titleBook.hidden = true;
    const bookDialog = node('dialog', undefined, document.body); bookDialog.className = 'word-growth-dialog word-book-dialog'; bookDialog.id = 'word-book-dialog';
    bookDialog.setAttribute('aria-label', ct('title'));
    function bookSprite(surface, skin) {
        const visual = window.ExperimentalWordGrowth.visualSkin(skin), config = aiConfigs[visual], image = new Image();
        image.src = imageSources[config.img || visual] || window.dynamicImageCatalog[config.img || visual];
        const draw = () => {
            const c = surface.getContext('2d'), f = config.actions.idle[0], scale = Math.min((surface.width - 24) / f.sw, (surface.height - 20) / f.sh);
            c.clearRect(0, 0, surface.width, surface.height);
            c.drawImage(image, f.sx, f.sy, f.sw, f.sh, surface.width / 2 - f.sw * scale / 2, surface.height - f.sh * scale, f.sw * scale, f.sh * scale);
        };
        image.addEventListener('load', draw, { once: true }); if (image.complete && image.naturalWidth) draw();
    }
    function renderBook(selected = collection.entries[0]?.skin) {
        bookDialog.replaceChildren(); node('h2', ct('title'), bookDialog);
        const spread = node('div', undefined, bookDialog); spread.className = 'word-book-spread';
        const index = node('section', undefined, spread); index.className = 'word-book-index';
        const grid = node('div', undefined, index); grid.className = 'word-book-grid';
        for (const entry of collection.entries) {
            const button = node('button', undefined, grid); button.type = 'button'; button.dataset.bookSkin = entry.skin;
            const surface = node('canvas', undefined, button); surface.width = 140; surface.height = 120; bookSprite(surface, entry.skin);
            const name = entry.people.find(p => p.name)?.name;
            const caption = node('span', name || ct('unnamed'), button); if (name) caption.setAttribute('data-i18n-skip', '');
            button.setAttribute('aria-pressed', String(entry.skin === selected)); button.addEventListener('click', () => renderBook(entry.skin));
        }
        const entry = collection.entries.find(e => e.skin === selected);
        if (entry) {
            const page = node('section', undefined, spread); page.className = 'word-book-page';
            const portrait = node('canvas', undefined, page); portrait.width = 400; portrait.height = 230; bookSprite(portrait, selected);
            node('h3', ct('history'), page); const history = node('ul', undefined, page);
            for (const person of entry.people) {
                const item = node('li', undefined, history), name = node('span', person.name || ct('unnamed'), item);
                if (person.name) name.setAttribute('data-i18n-skip', '');
                if (person.source === 'legacy') node('small', ct('migration'), item);
            }
            node('p', collectionData[selected].description, page);
            const navigation = node('nav', undefined, page); navigation.className = 'word-page-turn';
            const position = collection.entries.indexOf(entry);
            for (const [delta, key] of [[-1, 'previous'], [1, 'next']]) {
                const turn = node('button', st(key), navigation); turn.type = 'button'; turn.disabled = !collection.entries[position + delta];
                turn.addEventListener('click', () => { renderBook(collection.entries[position + delta].skin); bookDialog.querySelector('.word-book-page').focus(); });
            }
            page.tabIndex = -1;
        }
        const close = node('button', st('close'), bookDialog); close.type = 'button'; close.addEventListener('click', () => bookDialog.close());
    }
    function openBook() { stopAuto(); voice.stop(); renderBook(); bookDialog.showModal(); }
    titleBook.addEventListener('click', openBook);
    function drawTitleActors() {
        if (screen !== 'title') return;
        titleBook.hidden = !collection.entries.length;
        const context = titleActors.getContext('2d'); context.clearRect(0, 0, 1280, 720);
        const drawn = [];
        const entries = collection.entries.map(e => ({ skin: e.skin, ...collectionData[e.skin].layout }))
            .sort((a, b) => Number(a.skin.startsWith('dragon')) - Number(b.skin.startsWith('dragon')) || (a.y + (a.z || 0) * 10000) - (b.y + (b.z || 0) * 10000));
        for (const entry of entries) {
            if (!titleImages.has(entry.img)) { const image = new Image(); image.src = entry.img; titleImages.set(entry.img, image); }
            const image = titleImages.get(entry.img); if (!image.complete || !image.naturalWidth) continue;
            context.save(); context.translate(entry.x, entry.y); context.rotate((entry.rotation || 0) * Math.PI / 180);
            context.scale((entry.flip ? -1 : 1) * entry.scale, entry.scale);
            context.drawImage(image, entry.sx, entry.sy, entry.sw, entry.sh, -entry.sw / 2, -entry.sh / 2, entry.sw, entry.sh); context.restore();
            drawn.push(entry.skin);
        }
        titleActors.dataset.skins = JSON.stringify(entries.map(e => e.skin));
        titleActors.dataset.drawn = JSON.stringify(drawn);
    }
    node('h2', t('gameTitle'), titleMenu); node('p', t('gameSubtitle'), titleMenu);
    const newGame = node('button', t('newGame'), titleMenu); newGame.id = 'word-new-game'; newGame.disabled = true;
    const continueGame = node('button', t('continueGame'), titleMenu); continueGame.id = 'word-continue'; continueGame.disabled = true;
    titleMenu.appendChild(titleBook);
    const titleStatus = node('span', '', titleMenu); titleStatus.className = 'word-title-error';
    titleStatus.setAttribute('role', 'status'); titleStatus.hidden = true;
    const resetDialog = node('dialog'); resetDialog.className = 'word-reset'; resetDialog.id = 'word-reset-dialog';
    const resetHeading = node('h2', t('resetHeading'), resetDialog); resetHeading.id = 'word-reset-heading';
    resetDialog.setAttribute('aria-labelledby', resetHeading.id);
    node('p', t('resetCopy'), resetDialog);
    const resetCancel = node('button', t('resetCancel'), resetDialog); resetCancel.id = 'word-reset-cancel';
    const resetAccept = node('button', t('resetAccept'), resetDialog); resetAccept.id = 'word-reset-accept';
    settings.appendChild(questionCount);
    if (window.WordIslandMode) {
        app.classList.add('title-active');
        settings.hidden = setupCopy.hidden = true;
        header.querySelector('h1').textContent = t('gameTitle'); document.title = t('gameTitle');
    } else app.classList.add('onboarding-active');
    function showTitle() {
        voice?.stop();
        app.classList.remove('onboarding-active');
        app.classList.add('title-active');
        screen = 'title'; settings.hidden = setupCopy.hidden = true; titleScreen.hidden = false;
        logoButton.hidden = true; titleMenu.hidden = false;
        continueGame.disabled = !restored || saveBlocked;
        newGame.disabled = !catalog || saveBlocked;
        newGame.focus();
        if (window.audioManager) { window.aiPet.bgmVolume = environmentVolume; window.audioManager.playTitleMusic(); }
    }
    function showSetup() {
        app.classList.remove('title-active');
        app.classList.add('onboarding-active');
        screen = 'setup'; titleScreen.hidden = true; settings.hidden = false; setupCopy.hidden = true;
        [appearance, foundation, life, speech].forEach(select => { select.disabled = false; });
        renderQuestion();
        if (window.audioManager) {
            window.aiPet.bgmVolume = environmentVolume;
            window.audioManager.stopTitleMusic(); window.audioManager.playBGM('personality');
        }
    }
    logoButton.addEventListener('click', () => {
        showTitle();
        if (window.audioManager) {
            window.aiPet.bgmVolume = environmentVolume;
            window.audioManager.playTitleMusic();
        }
    });
    newGame.addEventListener('click', () => { resetDialog.showModal(); resetCancel.focus(); });
    resetCancel.addEventListener('click', () => resetDialog.close());
    resetDialog.addEventListener('close', () => { if (screen === 'title') newGame.focus(); });
    resetAccept.addEventListener('click', () => {
        voice?.stop();
        const pending = { version: 1, pendingNewGame: true, volume: environmentVolume, collection };
        let written = true;
        try { if (window.wordStorage) written = window.wordStorage.save(pending).ok; }
        catch (_) { written = false; }
        if (!written) {
            saveBlocked = true; saveBadge.textContent = t('saveFailed');
            titleStatus.textContent = t('saveFailed'); titleStatus.hidden = false;
            resetDialog.close(); showTitle(); return;
        }
        restored = null; state = world = null;
        answers = []; questionIndex = 0;
        appearance.value = 'robot'; foundation.value = life.value = 'yes'; speech.value = 'short';
        resetDialog.close(); showSetup();
    });
    continueGame.addEventListener('click', () => { if (restored && !saveBlocked) beginSession(); });
    function drawLogo(time) {
        if (screen !== 'logo') return;
        const ctx = logoCanvas.getContext('2d'), cx = 640, cy = 360;
        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 1280, 720);
        ctx.font = 'bold 50px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText('Two-Sided Studio', cx, cy - 30);
        ctx.beginPath(); ctx.moveTo(cx - 250, cy); ctx.lineTo(cx + 250, cy);
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy + 30); ctx.scale(1, -1);
        ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillText('Two-Sided Studio', 0, 0); ctx.restore();
        const alpha = matchMedia('(prefers-reduced-motion: reduce)').matches ? .85 : .35 + .65 * (Math.sin(time / 400) + 1) / 2;
        ctx.font = '16px sans-serif'; ctx.fillStyle = `rgba(200,200,200,${alpha})`;
        ctx.fillText(displayText('logoStart'), cx, 670);
    }
    const session = node('section'); session.hidden = true;
    const identityBadge = node('p', '', session); identityBadge.id = 'word-character-name'; identityBadge.hidden = true;
    identityBadge.setAttribute('data-i18n-skip', '');
    session.className = 'living-space';
    const stage = node('div', undefined, session); stage.className = 'stage';
    const canvas = document.getElementById('gameCanvas') || node('canvas', undefined, stage);
    stage.appendChild(canvas); canvas.hidden = false; canvas.width = 900; canvas.height = 470;
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t(window.WordIslandMode ? 'islandLabel' : 'sceneLabel'));
    const bubble = node('div', undefined, stage); bubble.className = 'bubble'; bubble.hidden = true;
    const status = node('p', t('idle'), session); status.className = 'status'; status.setAttribute('aria-live', 'polite');
    const controls = node('div', undefined, session); controls.className = 'scene-controls';
    const dungeonButton = window.WordIslandMode && new URLSearchParams(location.search).get('dungeon-preview') === '1' && window.ExperimentalWordDungeonLearning && !window.wordStorage
        ? node('button', t('dungeonEnter'), controls) : null;
    if (dungeonButton) { dungeonButton.type = 'button'; dungeonButton.id = 'word-dungeon'; dungeonButton.addEventListener('click', () => toggleDungeon(!dungeon)); }
    const debugControls = new URLSearchParams(location.search).get('debug') === '1';
    const navigationControls = node('div', undefined, controls); navigationControls.hidden = !debugControls;
    const point = node('button', t('point'), navigationControls); point.type = 'button';
    const shade = node('button', t('shade'), navigationControls); shade.type = 'button';
    const bodyStatus = node('div', undefined, controls); bodyStatus.className = 'body-status';
    const bodyMeters = ['bodyHunger', 'bodyEnergy'].map(key => {
        const label = node('label', t(key), bodyStatus);
        const meter = node('meter', undefined, label); meter.min = 0; meter.max = 100;
        meter.low = 35; meter.high = 65; meter.optimum = 100;
        meter.setAttribute('aria-label', t(key));
        const value = node('span', '', label); value.setAttribute('data-i18n-skip', '');
        return { meter, value };
    });
    let walk, volume, masterChoice, masterVisit;
    if (window.WordIslandMode) {
        walk = node('button', t('walk'), navigationControls); walk.type = 'button';
        const volumeLabel = node('label', t('volume'), controls); volumeLabel.className = 'volume-control';
        volume = node('input', undefined, volumeLabel); volume.type = 'range';
        volume.min = '0'; volume.max = '1'; volume.step = '.05'; volume.value = '.5';
        volume.addEventListener('input', () => { if (world) { environmentVolume = Number(volume.value); view.volume(world, environmentVolume); save(); } });
        masterChoice = node('select', undefined, navigationControls);
        masterChoice.className = 'master-choice'; masterChoice.setAttribute('aria-label', t('masterPlaces'));
        for (const id of Object.keys(window.ExperimentalWordCareers.JOBS)) {
            const option = node('option', t(`master_${id}`), masterChoice); option.value = `master:${id}`;
        }
        masterVisit = node('button', t('masterVisit'), navigationControls); masterVisit.type = 'button';
        masterVisit.addEventListener('click', () => pointAt(masterChoice.value, 'pointed_master'));
    }
    const pause = node('button', t('pause'), controls); pause.type = 'button'; pause.id = 'word-pause'; pause.setAttribute('aria-pressed', 'false');
    const exportButton = node('button', t('exportReport'), controls); exportButton.type = 'button';
    exportButton.setAttribute('title', t('reportScope'));
    const reportHelp = node('p', t('reportScope'), setupCopy);
    reportHelp.className = 'intro';
    const personalControls = node('div', undefined, controls); personalControls.hidden = true;
    const personalStatus = node('small', '', personalControls); personalStatus.id = 'word-personal-log-status';
    personalStatus.setAttribute('role', 'status');
    personalStatus.setAttribute('title', t('personalHelp'));
    const personalToggle = node('button', t('personalPause'), personalControls); personalToggle.type = 'button';
    personalToggle.id = 'word-personal-log-toggle'; personalToggle.disabled = true;
    function logBaseline() {
        return { state, world, appearance: appearance.value, locale: window.GameI18n.language, resumed: !!restored };
    }
    personalLog = window.ExperimentalWordAutoRecord?.create({ onStatus(value) {
        personalControls.hidden = !value.enabled;
        personalStatus.dataset.status = value.status;
        personalStatus.textContent = t({ saved: 'personalActive', pending: 'personalPending',
            failed: 'personalFailed', paused: 'personalPaused' }[value.status]);
        personalToggle.textContent = t(value.paused ? 'personalResume' : 'personalPause');
    } });
    personalToggle.addEventListener('click', () => {
        if (!state || !personalLog) return;
        if (personalLog.status().paused) personalLog.resume(logBaseline());
        else personalLog.pause();
    });
    window.addEventListener('error', event => personalLog?.record('error', { message: String(event.message),
        filename: event.filename, line: event.lineno, column: event.colno }));
    window.addEventListener('unhandledrejection', event => personalLog?.record('error', {
        message: String(event.reason?.message || event.reason) }));
    exportButton.addEventListener('click', async () => {
        if (!report || exporting) return;
        exporting = true; exportButton.disabled = true;
        let feedback;
        try {
            const notes = [...window.ExperimentalWordNotebook.groupedEntries(state), ...(window.ExperimentalWordDungeonLearning?.notes(state) || [])].map(entry => ({ ...entry,
                text: displayText(entry.message), detailText: displayText(entry.detail) }));
            const value = report.build({ state, world }, notes, { appearance: appearance.value,
                locale: window.GameI18n.language, saveStatus: saveBlocked ? 'stopped' : window.wordStorage ? 'autosave' : 'session-only' });
            const text = JSON.stringify(value, null, 2);
            if (window.wordStorage?.exportReport) {
                const result = await window.wordStorage.exportReport({ text, title: displayText('exportReport') });
                feedback = !result.ok ? 'reportFailed' : result.canceled ? 'reportCanceled' : 'reportSaved';
            } else {
                const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
                const link = document.createElement('a'); link.href = url;
                link.download = `word-learning-report-${Date.now()}.json`;
                document.body.appendChild(link); link.click(); link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 60000);
                feedback = 'reportDownload';
            }
        } catch (_) { feedback = 'reportFailed'; }
        finally { exporting = false; exportButton.disabled = false; }
        controlFeedback = { key: feedback, until: performance.now() + 8000 };
    });
    node('p', t('hint'), session).className = 'hint';
    const chatPanel = node('aside', undefined, session); chatPanel.className = 'chat-panel';
    const panelButtons = node('div', undefined, chatPanel); panelButtons.className = 'panel-buttons';
    const conversationButton = node('button', t('conversation'), panelButtons); conversationButton.type = 'button';
    const notebookButton = node('button', t('notebook'), panelButtons); notebookButton.type = 'button';
    const starsButton = node('button', t('constellation'), panelButtons); starsButton.type = 'button'; starsButton.id = 'word-stars';
    const growthApi = window.ExperimentalWordGrowth;
    const growthMessages = {
        title: '育ちと進化', skin: '姿を選ぶ', mind: '中身を選ぶ', evolve: '進化する',
        guide: '姿と中身は別々に選べます。進化履歴は戻りません。別ルートは引退後の次の子で選びます。',
        ceremony: '姿が変わっています。変身が終わると姿と中身を選べるようになります。',
        later: '後で続ける', retry: '演出を再開する', failed: '姿の画像を読み込めませんでした。演出を再開してください。',
        capacity: '処理できる量', comparison: '比較の深さ', efficiency: '消耗効率',
        base: '出会ったときの中身', power: '活力：慣れた経験を省エネで使う', intel: '賢さ：広く参照し深く比較する',
        beauty: '美しさ：相手や場面に合う表現を使う', old: '老化：振り返った経験と要点を使う', dark: '闇：不確かさと別の可能性を調べる',
        resources: '体力は扱える情報量、満腹度は比較の深さに影響します。知識はそのまま残ります。'
    };
    // Keep Japanese source text for the shared DOM localizer's language changes.
    const gt = key => growthMessages[key];
    const growthButton = node('button', gt('title'), panelButtons); growthButton.type = 'button'; growthButton.id = 'word-growth';
    growthButton.hidden = true;
    const bookButton = node('button', ct('title'), panelButtons); bookButton.type = 'button'; bookButton.id = 'word-book'; bookButton.hidden = !window.WordIslandMode;
    bookButton.addEventListener('click', openBook);
    const albumButton = node('button', st('album'), panelButtons); albumButton.type = 'button'; albumButton.id = 'word-album'; albumButton.hidden = !window.WordIslandMode;
    const albumDialog = node('dialog', undefined, document.body); albumDialog.id = 'word-album-dialog'; albumDialog.className = 'word-album-dialog';
    albumDialog.setAttribute('aria-label', st('album'));
    const memoryToast = node('button', undefined, stage); memoryToast.type = 'button'; memoryToast.id = 'word-memory-toast'; memoryToast.hidden = true;
    memoryToast.setAttribute('aria-live', 'polite'); let memoryToastTimer;
    function openAlbum() {
        stopAuto(); voice.stop(); memoryToast.hidden = true; albumDialog.replaceChildren();
        node('h2', st('album'), albumDialog); node('p', st('guide'), albumDialog);
        const memories = collection.memories || [];
        if (!memories.length) node('p', st('empty'), albumDialog);
        const pages = node('div', undefined, albumDialog); pages.className = 'word-memory-pages';
        for (const memory of [...memories].reverse()) {
            const page = node('article', undefined, pages); page.className = 'word-memory-card'; page.dataset.memoryKind = memory.kind;
            const portrait = node('canvas', undefined, page); portrait.width = 200; portrait.height = 140; bookSprite(portrait, memory.skin);
            node('h3', st(memory.kind), page); node('small', st('rememberedName'), page);
            const name = node('p', memory.name || ct('unnamed'), page); if (memory.name) name.setAttribute('data-i18n-skip', '');
            if (['encounter', 'work'].includes(memory.kind)) node('p', t('master_' + memory.subject), page);
            if (memory.kind === 'work') node('p', t('master_result_' + memory.subject), page);
        }
        const close = node('button', st('close'), albumDialog); close.type = 'button'; close.addEventListener('click', () => albumDialog.close());
        albumDialog.showModal(); close.focus(); albumButton.classList.remove('has-new-memory');
    }
    albumButton.addEventListener('click', openAlbum); memoryToast.addEventListener('click', openAlbum);
    function acquired(memory) {
        if (!memory) return;
        albumButton.classList.add('has-new-memory'); memoryToast.textContent = st('acquired'); memoryToast.hidden = false;
        clearTimeout(memoryToastTimer); memoryToastTimer = setTimeout(() => { memoryToast.hidden = true; }, 4500);
        save();
    }
    const evolveButton = node('button', gt('evolve'), panelButtons); evolveButton.type = 'button'; evolveButton.id = 'word-evolve';
    evolveButton.hidden = true; evolveButton.disabled = true;
    const growthDialog = node('dialog', undefined, document.body); growthDialog.id = 'word-growth-dialog'; growthDialog.className = 'word-growth-dialog';
    growthDialog.setAttribute('aria-label', gt('title'));
    let ceremonyToken = 0;
    let ceremonyVideo = null;
    function selectedSprite() {
        const skin = growthApi.visualSkin(state?.evolution?.skin || appearance.value), config = aiConfigs[skin];
        const key = config.img || skin;
        if (!images[key]) { images[key] = new Image(); images[key].src = imageSources[key] || window.dynamicImageCatalog[key]; }
        return { skin, config, image: images[key] };
    }
    function growthClose() {
        ceremonyToken++;
        if (ceremonyVideo) { ceremonyVideo.pause(); ceremonyVideo.removeAttribute('src'); ceremonyVideo.load(); ceremonyVideo = null; }
        growthDialog.close(); input.focus();
    }
    growthDialog.addEventListener('cancel', event => { event.preventDefault(); growthClose(); });
    function growthAction(label, action) {
        const b = node('button', label, growthDialog); b.type = 'button'; b.addEventListener('click', action); return b;
    }
    function renderGrowth() {
        if (!state?.evolution) return;
        growthDialog.replaceChildren();
        node('h2', gt('title'), growthDialog); node('p', gt('guide'), growthDialog);
        node('p', gt('resources'), growthDialog);
        for (const kind of ['skin', 'mind']) {
            const heading = node('h3', gt(kind), growthDialog); heading.id = 'word-growth-heading-' + kind;
            const choices = node('div', undefined, growthDialog); choices.id = 'word-growth-' + kind; choices.className = 'word-growth-options';
            choices.setAttribute('role', 'group'); choices.setAttribute('aria-labelledby', heading.id);
            for (const [index, id] of state.evolution.path.entries()) {
                const button = node('button', undefined, choices); button.type = 'button';
                button.dataset.growthValue = id; button.dataset.growthKind = kind;
                button.disabled = !!state.evolution.pending; button.setAttribute('aria-pressed', String(state.evolution[kind] === id));
                const portrait = node('canvas', undefined, button); portrait.width = 180; portrait.height = 140;
                portrait.setAttribute('aria-hidden', 'true'); bookSprite(portrait, id);
                const number = node('span', '#' + (index + 1), button); number.setAttribute('data-i18n-skip', '');
                number.id = 'word-growth-number-' + kind + '-' + index;
                button.setAttribute('aria-labelledby', heading.id + ' ' + number.id);
                button.addEventListener('click', () => {
                    if (!growthApi.select(state, kind, id)) return;
                    const scroll = growthDialog.scrollTop; save(); renderGrowth(); growthDialog.scrollTop = scroll;
                    growthDialog.querySelector(`[data-growth-kind="${kind}"][data-growth-value="${id}"]`).focus({ preventScroll: true });
                });
            }
        }
        const p = growthApi.profile(state), b = growthApi.budget(state, world);
        node('p', `${gt('capacity')}: ${b.units} / ${gt('comparison')}: ${b.depth} / ${gt('efficiency')}: ${p.efficiency}`, growthDialog);
        const ready = growthApi.choices(state, world).some(c => c.ready);
        if (ready) { const button = growthAction(gt('evolve'), chooseEvolution); button.dataset.evolve = 'ready'; button.classList.add('word-evolution-ready'); }
        if (state.evolution.pending) growthAction(gt('retry'), startCeremony);
        growthAction(t('starsClose'), growthClose);
    }
    function chooseEvolution() {
        if (state.evolution.pending) { startCeremony(); return; }
        const candidates = growthApi.choices(state, world).filter(c => c.ready);
        if (!candidates.length) return;
        // The player chooses when to evolve; the legacy roulette selects among eligible routes.
        const next = candidates[Math.floor(Math.random() * candidates.length)].next;
        if (!growthApi.begin(state, world, next)) return;
        stopAuto(); voice.stop(); save(); startCeremony();
    }
    evolveButton.addEventListener('click', chooseEvolution);
    async function startCeremony() {
        const pending = state.evolution?.pending; if (!pending) return;
        const token = ++ceremonyToken;
        growthDialog.replaceChildren(); node('h2', gt('title'), growthDialog); node('p', gt('ceremony'), growthDialog);
        const surface = node('canvas', undefined, growthDialog); surface.width = 400; surface.height = 300;
        surface.setAttribute('aria-label', gt('ceremony'));
        growthAction(gt('later'), growthClose);
        if (!growthDialog.open) growthDialog.showModal();
        // Resume the saved result, never reroll an interrupted evolution.
        const available = growthApi.choices({ ...state, evolution: { ...state.evolution, pending: null } }, world).filter(c => c.ready).map(c => c.next);
        if (!available.includes(pending.next)) available.push(pending.next);
        const ids = [...new Set([pending.from, ...available])];
        const sources = ids.map(id => {
            const visual = growthApi.visualSkin(id), config = aiConfigs[visual], image = new Image(); image.src = imageSources[config.img || visual] || window.dynamicImageCatalog[config.img || visual];
            return { config, image };
        });
        try { await Promise.all(sources.map(s => s.image.decode())); }
        catch (_) { if (token === ceremonyToken) { node('p', gt('failed'), growthDialog); growthAction(gt('retry'), startCeremony); } return; }
        const sprites = Object.fromEntries(ids.map((id, i) => [id, sources[i]]));
        const ctx = surface.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        function sprite(id, x, y, size, silhouette = false, alpha = 1) {
            const { config, image } = sprites[id], rect = config.actions.idle[0], scale = Math.min(size / rect.sw, size / rect.sh);
            ctx.save(); ctx.globalAlpha = alpha; if (silhouette) ctx.filter = 'brightness(0)';
            ctx.drawImage(image, rect.sx, rect.sy, rect.sw, rect.sh, x - rect.sw * scale / 2, y - rect.sh * scale / 2, rect.sw * scale, rect.sh * scale); ctx.restore();
        }
        const colors = ['#f44336', '#4caf50', '#2196f3', '#ffeb3b', '#9c27b0', '#00bcd4', '#ff9800', '#8bc34a'];
        const slice = Math.PI * 2 / available.length;
        let speed = .4 + Math.random() * .2, travel = 0;
        for (let s = speed; s >= .002; s *= .985) travel += s;
        // Match legacy speed/decay while landing on the result saved before the animation.
        let rotation = -Math.PI / 2 - (available.indexOf(pending.next) + .5) * slice + travel;
        function wheel(alpha = 1) {
            ctx.save(); ctx.globalAlpha = alpha; ctx.translate(200, 150); ctx.rotate(reduced ? 0 : rotation);
            available.forEach((id, i) => {
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 120, i * slice, (i + 1) * slice); ctx.closePath();
                ctx.fillStyle = colors[i % colors.length]; ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke();
                const angle = (i + .5) * slice;
                ctx.save(); ctx.translate(Math.cos(angle) * 72, Math.sin(angle) * 72); ctx.rotate(angle + Math.PI / 2);
                sprite(id, 0, 0, 50, true); ctx.restore();
            }); ctx.restore();
            ctx.beginPath(); ctx.moveTo(200, 35); ctx.lineTo(190, 15); ctx.lineTo(210, 15); ctx.closePath(); ctx.fillStyle = '#FFD700'; ctx.fill();
        }
        let phase = 'spinning', ticks = 0, last = null, movieStarted = false, spinTicks = 0;
        const alive = () => token === ceremonyToken && growthDialog.open;
        const complete = () => {
            if (!alive()) return;
            if (document.hidden) { requestAnimationFrame(complete); return; }
            if (ceremonyVideo) { ceremonyVideo.pause(); ceremonyVideo.removeAttribute('src'); ceremonyVideo.load(); ceremonyVideo.remove(); ceremonyVideo = null; }
            surface.hidden = false; ctx.clearRect(0, 0, 400, 300); sprite(pending.next, 200, 150, 180); surface.dataset.skin = pending.next;
            // Reveal the selected sprite before granting either unlocked selection.
            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (!alive()) return;
                if (document.hidden) { requestAnimationFrame(complete); return; }
                growthApi.complete(state, pending.next); collectionApi.register(collection, state, pending.next);
                acquired(collectionApi.remember(collection, state, world, 'evolution', pending.next));
                save(); record('evolution', { path: state.evolution.path }); renderGrowth();
            }));
        };
        function movie() {
            if (!alive() || movieStarted) return;
            movieStarted = true; phase = 'video';
            const video = node('video', undefined, growthDialog); ceremonyVideo = video; video.id = 'word-evolution-video';
            video.playsInline = true; video.preload = 'auto'; video.src = growthApi.videoPath(pending.from, pending.next);
            surface.hidden = true;
            let playing = false, failed = false;
            const fallback = () => {
                if (!alive() || failed) return; failed = true; clearTimeout(timer);
                video.pause(); video.removeAttribute('src'); video.load(); video.remove(); ceremonyVideo = null;
                surface.hidden = false; phase = 'effect'; ticks = 0; last = null; requestAnimationFrame(frame);
            };
            const timer = setTimeout(fallback, 5000);
            video.addEventListener('error', fallback, { once: true });
            video.addEventListener('playing', () => { playing = true; clearTimeout(timer); }, { once: true });
            video.addEventListener('ended', () => { if (playing && !failed) complete(); }, { once: true });
            video.addEventListener('canplay', () => {
                if (!alive() || failed) return;
                video.play().catch(() => { video.muted = true; video.play().catch(fallback); });
            }, { once: true });
            video.load();
        }
        const frame = time => {
            if (!alive()) return;
            const dt = last === null || document.hidden ? 0 : Math.max(0, Math.min(.1, (time - last) / 1000)); last = time;
            ctx.clearRect(0, 0, 400, 300);
            if (phase === 'spinning') {
                wheel();
                spinTicks += dt * 60;
                while (spinTicks >= 1 && speed >= .002) { rotation -= speed; speed *= .985; spinTicks--; }
                if (speed < .002) { movie(); return; }
            } else if (phase === 'effect') {
                ticks += dt * 60;
                if (ticks < 30) wheel(1 - ticks / 30);
                if (ticks > 30 && ticks < 140) sprite(pending.from, 200, 150, 180, true, ticks < 80 ? 1 : (140 - ticks) / 60);
                if (ticks > 80 && ticks < 180) sprite(pending.next, 200, 150, 180, true, Math.min(1, (ticks - 80) / 60));
                const flash = ticks > 140 && ticks <= 160 ? (ticks - 140) / 20 : ticks > 160 ? Math.max(0, 1 - (ticks - 160) / 40) : 0;
                if (flash && !reduced) {
                    ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, 400, 300);
                    ctx.save(); ctx.translate(200, 150); ctx.globalAlpha = flash;
                    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI * 2 / 12 + ticks * .05); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(0, 300); ctx.fill(); } ctx.restore();
                }
                if (ticks > 160) { sprite(pending.next, 200, 150, 180, false, Math.min(1, (ticks - 160) / 10)); surface.dataset.skin = pending.next; }
                if (ticks > 240) { complete(); return; }
            }
            if (phase !== 'video') requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }
    growthButton.addEventListener('click', () => { stopAuto(); voice.stop(); renderGrowth(); growthDialog.showModal(); if (state.evolution.pending) startCeremony(); });
    document.addEventListener('visibilitychange', () => {
        if (!ceremonyVideo) return;
        if (document.hidden) ceremonyVideo.pause();
        else ceremonyVideo.play().catch(() => {});
    });
    const constellationApi = window.ExperimentalWordConstellationLive;
    let starTraces = [];
    starsButton.setAttribute('aria-pressed', 'false');
    conversationButton.setAttribute('aria-pressed', 'true'); notebookButton.setAttribute('aria-pressed', 'false');
    const panelBody = node('div', undefined, chatPanel); panelBody.className = 'panel-body';
    const conversation = node('div', undefined, panelBody);
    conversation.id = 'conversation'; conversation.setAttribute('role', 'log');
    conversation.setAttribute('aria-live', 'polite');
    const tracePreview = node('details', undefined, conversation); tracePreview.className = 'word-trace-preview'; tracePreview.hidden = true;
    node('summary', constellationApi.messages.latest, tracePreview);
    const previewBody = node('section', undefined, tracePreview);
    const previewStars = constellationApi.mount(previewBody, { compact: true, state: () => state, catalog: () => catalog,
        traces: () => starTraces, canAnimate: () => screen === 'playing' && !paused,
        inspect: (id, ref) => openStarTrace(id, ref), translate: text => window.GameI18n.translate(text) });
    const notebook = node('section', undefined, panelBody); notebook.id = 'notebook'; notebook.hidden = true;
    const starsDialog = node('dialog', undefined, app); starsDialog.className = 'word-stars-dialog';
    const starsClose = node('button', t('starsClose'), starsDialog); starsClose.type = 'button';
    const stars = node('section', undefined, starsDialog); stars.id = 'word-constellation'; stars.hidden = true;
    starsDialog.setAttribute('aria-label', t('constellation'));
    starsClose.addEventListener('click', () => starsDialog.close());
    starsDialog.addEventListener('close', () => {
        liveStars.stop();
        stars.hidden = true; starsButton.setAttribute('aria-pressed', 'false'); starsButton.focus();
    });
    starsButton.setAttribute('aria-controls', stars.id);
    const liveStars = window.ExperimentalWordConstellationLive.mount(stars, { state: () => state, catalog: () => catalog,
        traces: () => starTraces,
        languageName: locale => window.GameI18n.languages[locale]?.label || locale,
        inputs: () => report?.build({}, []).timeline.filter(entry => entry.kind === 'understanding').map(entry => entry.result) || [],
        translate: text => window.GameI18n.translate(text) });
    tracePreview.addEventListener('toggle', () => { if (!tracePreview.open) previewStars.stop(); });
    function openStarTrace(id, ref) {
        voice.stop(); previewStars.stop(); stars.hidden = false; starsButton.setAttribute('aria-pressed', 'true');
        starsDialog.showModal(); liveStars.refresh(id, ref); starsClose.focus();
    }
    notebook.setAttribute('aria-label', t('notebook'));
    conversationButton.setAttribute('aria-controls', 'conversation'); notebookButton.setAttribute('aria-controls', 'notebook');
    let noteLimit = 12;
    let notebookSignature = '';
    function renderNotebook(force = false) {
        if (!state || notebook.hidden) return;
        const entries = [...window.ExperimentalWordNotebook.groupedEntries(state), ...(window.ExperimentalWordDungeonLearning?.notes(state) || [])];
        const signature = JSON.stringify(entries);
        if (!force && signature === notebookSignature) return;
        notebookSignature = signature;
        const scroll = notebook.scrollTop;
        const openHistory = new Set([...notebook.querySelectorAll('.note-history[open]')].map(item => item.dataset.noteKey));
        notebook.replaceChildren();
        node('p', t('noteGuide'), notebook).className = 'note-guide';
        if (!entries.length) node('p', t('note_empty'), notebook);
        for (const group of ['names', 'experiences', 'questions']) {
            const items = entries.filter(entry => entry.group === group);
            if (!items.length) continue;
            node('h3', t(group), notebook);
            for (const entry of window.ExperimentalWordNotebook.displayEntries(items, noteLimit)) {
                const card = node('article', undefined, notebook); card.className = 'note-card';
                const text = node(entry.withdrawn ? 's' : 'p', t(entry.message), card);
                if (entry.literal !== undefined) {
                    const literal = node('span', entry.literal, text); literal.setAttribute('data-i18n-skip', '');
                    literal.className = 'note-literal';
                }
                node('p', t(entry.detail), card).className = 'note-detail';
                node('small', t(entry.organized ? 'note_organized' : 'note_recent'), card);
                if (entry.count > 1) {
                    const history = node('details', undefined, card); history.className = 'note-history';
                    history.dataset.noteKey = JSON.stringify([entry.group, entry.message, entry.literal, entry.target, entry.detail, !!entry.withdrawn]);
                    history.open = openHistory.has(history.dataset.noteKey);
                    const summary = node('summary', t('note_count'), history);
                    node('span', String(entry.count), summary).setAttribute('data-i18n-skip', '');
                    entry.items.forEach((item, index) => {
                        const line = node('p', undefined, history);
                        node('span', `${index + 1}. `, line).setAttribute('data-i18n-skip', '');
                        node('span', t(item.organized ? 'note_organized' : 'note_recent'), line);
                    });
                }
            }
        }
        if (['names', 'experiences', 'questions'].some(group => entries.filter(entry => entry.group === group).length > noteLimit)) {
            const more = node('button', t('note_more'), notebook); more.type = 'button';
            more.addEventListener('click', () => { noteLimit += 12; renderNotebook(true); });
        }
        notebook.scrollTop = scroll;
    }
    function setNotebook(open) {
        previewStars.stop();
        stars.hidden = true; starsButton.setAttribute('aria-pressed', 'false');
        notebook.hidden = !open; conversation.hidden = open;
        notebookButton.setAttribute('aria-pressed', String(open)); conversationButton.setAttribute('aria-pressed', String(!open));
        if (open) renderNotebook(true);
        else conversation.scrollTop = conversation.scrollHeight;
    }
    notebookButton.addEventListener('click', () => setNotebook(true));
    conversationButton.addEventListener('click', () => setNotebook(false));
    starsButton.addEventListener('click', () => {
        voice.stop(); previewStars.stop(); stars.hidden = false;
        starsButton.setAttribute('aria-pressed', 'true'); liveStars.refresh(null);
        starsDialog.showModal(); starsClose.focus();
    });
    const guide = node('div', undefined, conversation); guide.className = 'play-guide';
    node('strong', t('playGuide'), guide); node('p', t(window.WordIslandMode ? 'islandGuide' : 'playGuideText'), guide);
    if (window.WordIslandMode) node('p', t('playGuideText'), guide);
    node('p', t('life_label_guide'), guide);
    node('p', t('question_demo_guide'), guide);
    node('p', t('proposal_demo_guide'), guide);
    node('p', t('report_demo_guide'), guide);
    node('p', t('negation_help'), guide);
    node('p', t('time_help'), guide);
    node('p', t('condition_help'), guide);
    node('p', t('sequence_help'), guide);
    node('p', t('reason_help'), guide);
    node('p', t('correction_help'), guide);
    const form = node('form', undefined, chatPanel); form.className = 'chat-form';
    const label = node('label', t('chat'), form);
    const input = node('textarea', undefined, label); input.maxLength = 1000; input.required = true;
    input.setAttribute('data-i18n-skip', '');
    const send = node('button', t('send'), form);
    const autoPanel = node('details', undefined, form); autoPanel.id = 'word-auto-training';
    form.insertBefore(autoPanel, form.firstChild);
    autoPanel.addEventListener('toggle', () => app.classList.toggle('auto-training-open', autoPanel.open));
    node('summary', t('autoHeading'), autoPanel);
    node('p', t('autoHelp'), autoPanel);
    const autoSliders = {};
    for (const [axis, key] of [['life', 'autoLife'], ['conversation', 'autoConversation'], ['exploration', 'autoExploration']]) {
        const row = node('label', t(key), autoPanel); row.className = 'word-auto-axis';
        const slider = node('input', undefined, row); slider.type = 'range'; slider.min = '0'; slider.max = '3'; slider.step = '1';
        slider.id = 'word-auto-' + axis; slider.value = String(autoMemory.weights[axis]);
        const value = node('output', t('autoLevels' + slider.value), row); value.htmlFor = slider.id;
        slider.addEventListener('input', () => {
            stopAuto(); autoMemory.weights[axis] = Number(slider.value); autoMemory.counts = { life: 0, conversation: 0, exploration: 0 };
            value.textContent = t('autoLevels' + slider.value);
            if (state) { state.autoTraining = { version: 1, weights: { ...autoMemory.weights } }; save(); }
        });
        autoSliders[axis] = { slider, value };
    }
    const autoToggle = node('button', t('autoStart'), autoPanel); autoToggle.type = 'button'; autoToggle.id = 'word-auto-toggle'; autoToggle.setAttribute('aria-pressed', 'false');
    const autoStatus = node('p', displayText('autoStopped'), autoPanel); autoStatus.id = 'word-auto-status'; autoStatus.setAttribute('role', 'status'); autoStatus.setAttribute('data-i18n-skip', '');
    const autoPreview = node('p', '', autoPanel); autoPreview.id = 'word-auto-preview'; autoPreview.setAttribute('data-i18n-skip', '');
    const autoProgress = node('p', '', autoPanel); autoProgress.id = 'word-auto-progress'; autoProgress.setAttribute('data-i18n-skip', '');
    node('p', t('autoContinue'), autoPanel);
    function stopAuto() {
        ++adventureActionToken;
        adventureView?.stop();
        masterAutoElapsed = masterAutoQuiet = 0;
        if (autoActive) record('auto_training', { action: 'stop', weights: autoMemory.weights });
        autoActive = false; autoPlan = null; autoPreview.textContent = '';
        autoToggle.textContent = t('autoStart'); autoToggle.setAttribute('aria-pressed', 'false'); autoStatus.textContent = displayText('autoStopped');
    }
    autoToggle.addEventListener('click', () => {
        if (autoActive) { stopAuto(); return; }
        if (!state || dungeon || screen !== 'playing') return;
        if (input.value.trim() || voice.listening) { autoStatus.textContent = displayText('autoDraft'); return; }
        if (!Object.values(autoMemory.weights).some(value => value > 0)) { autoStatus.textContent = displayText('autoZero'); return; }
        autoActive = true; autoPlan = null; autoDue = world.elapsed + 2; autoBaseline = state.knowledge.meanings.length;
        if(state.adventure?.run?.training)state.adventure.connection.trainingPaused=false;
        state.autoTraining = { version: 1, weights: { ...autoMemory.weights } }; save();
        autoToggle.textContent = t('autoStop'); autoToggle.setAttribute('aria-pressed', 'true'); autoStatus.textContent = displayText('autoWaiting');
        record('auto_training', { action: 'start', weights: autoMemory.weights });
    });
    function tickAuto(holding) {
        if (autoBaseline !== null) {
            const progress = displayText('autoGrowth') + ': ' + Math.max(0, state.knowledge.meanings.length - autoBaseline);
            if (autoProgress.textContent !== progress) autoProgress.textContent = progress;
        }
        if (!autoActive) return;
        if (holding) { autoPlan = null; autoPreview.textContent = ''; autoDue = world.elapsed + 2; autoStatus.textContent = displayText(masterDialog.open ? 'autoWaiting' : 'autoPaused'); return; }
        if (world.elapsed < autoDue) return;
        if (state.adventure?.connection.task) { autoDue = world.elapsed + 1; return; }
        const adventureCommand = adventureApi && autoMemory.weights.exploration > 0 && ['idle','observe'].includes(world.mode) && (state.adventure?.connection.proposal || world.hunger < .6 && world.fatigue < .6)
            ? adventureApi.autoConversation(state, world, window.GameI18n.language) : null;
        const ordinary = autoApi.next(autoMemory, state, world, window.GameI18n.language);
        const candidate = adventureCommand && (!ordinary || ordinary.axis === 'exploration'
            || autoMemory.counts.exploration / autoMemory.weights.exploration <= autoMemory.counts[ordinary.axis] / autoMemory.weights[ordinary.axis])
            ? { ...adventureCommand, purpose: 'experience', axis: 'exploration', id: 'adventure:' + (adventureCommand.text || adventureCommand.target),
                activity: `${world.mode}:${world.activityStart}:${world.attention || ''}`, locale: window.GameI18n.language } : ordinary;
        if (!candidate) { autoPlan = null; autoPreview.textContent = ''; autoStatus.textContent = displayText('autoWaiting'); autoDue = world.elapsed + 1; return; }
        if (!autoPlan || JSON.stringify(autoPlan.plan) !== JSON.stringify(candidate)) {
            autoPlan = { plan: candidate, at: world.elapsed }; autoDue = world.elapsed + 2;
            autoStatus.textContent = displayText({ experience: 'autoExperience', example: 'autoExample', practice: 'autoPractice', movement: 'autoMove' }[candidate.purpose]);
            autoPreview.textContent = candidate.kind === 'say' ? displayText('autoPreview') + ': ' + candidate.text : displayText(candidate.kind==='watch'?'autoWaiting':'autoMove'); return;
        }
        autoPlan = null; autoPreview.textContent = '';
        if (candidate.kind === 'move') {
            if (!worldApi.approach(world, candidate.target, 'pointing')) { autoDue = world.elapsed + 3; return; }
            record('auto_training', { action: 'move', target: candidate.target, axis: candidate.axis });
        } else if(candidate.kind==='watch') {
            record('auto_training',{action:'observe_master',target:candidate.target,axis:candidate.axis});
        } else if(candidate.kind==='recover') {
            showReply(adventureApi.recover(state,world,candidate.target));save();
            record('auto_training',{action:'recover',target:candidate.target,axis:candidate.axis});
        } else {
            // No timer writes to a draft. These checks also guard synchronous UI changes.
            if (input.value.trim() || voice.listening) { stopAuto(); return; }
            try { automaticSubmission = true; input.value = candidate.text; input.dataset.inputMethod = 'auto'; form.requestSubmit(); }
            finally { automaticSubmission = false; }
        }
        autoApi.committed(autoMemory, candidate); autoStatus.textContent = displayText('autoPending'); autoDue = world.elapsed + (candidate.kind === 'move' ? .5 : 6);
    }
    node('small', t('inputHint'), form);
    const voiceTools = node('div', undefined, form); voiceTools.className = 'word-voice-tools';
    const microphone = node('button', t('voiceStart'), voiceTools); microphone.type = 'button'; microphone.id = 'word-microphone';
    microphone.setAttribute('aria-pressed', 'false');
    const readLabel = node('label', undefined, voiceTools);
    const readAloud = node('input', undefined, readLabel); readAloud.type = 'checkbox'; readAloud.id = 'word-read-aloud';
    node('span', t('voiceRead'), readLabel);
    const captureLabel = node('label', undefined, voiceTools); captureLabel.hidden = !window.wordSpeech;
    const captureProcessing = node('input', undefined, captureLabel); captureProcessing.type = 'checkbox'; captureProcessing.checked = true;
    captureProcessing.id = 'word-capture-processing'; node('span', t('voiceCaptureProcessing'), captureLabel);
    const captureHelp = node('p', t('voiceCaptureHelp'), form); captureHelp.hidden = !window.wordSpeech;
    captureHelp.id = 'word-capture-help'; captureProcessing.setAttribute('aria-describedby', captureHelp.id);
    const voiceVolumeLabel = node('label', t('voiceVolume'), voiceTools);
    const voiceVolume = node('input', undefined, voiceVolumeLabel); voiceVolume.type = 'range';
    voiceVolume.min = '0'; voiceVolume.max = '1'; voiceVolume.step = '.1'; voiceVolume.value = '.8';
    const voiceStop = node('button', t('voiceStop'), voiceTools); voiceStop.type = 'button'; voiceStop.id = 'word-voice-stop';
    const voiceStatus = node('p', '', form); voiceStatus.id = 'word-voice-status'; voiceStatus.setAttribute('role', 'status');
    const voiceHelp = node('details', undefined, form); node('summary', t('voiceStart'), voiceHelp); node('p', t('voiceNotice'), voiceHelp);
    voiceHelp.querySelector('summary').textContent = t('voiceSettings');
    voiceHelp.append(voiceVolumeLabel, voiceStop);
    node('p', t('voiceCastHelp'), voiceHelp);
    node('p', t('voiceCacheHelp'), voiceHelp);
    const castCredits = node('details', undefined, voiceHelp); node('summary', t('voiceCastCredits'), castCredits);
    for (const preset of Object.values(window.ExperimentalWordVoice.cast)) {
        node('p', t(preset.credit), castCredits);
    }
    const recordingCheck = node('details', undefined, form); recordingCheck.id = 'word-recording-check'; recordingCheck.hidden = !window.wordSpeech;
    node('summary', t('voiceRecordingCheck'), recordingCheck);
    node('p', t('voiceRecordingHelp'), recordingCheck);
    const recordingInfo = node('p', t('voiceRecordingEmpty'), recordingCheck); recordingInfo.setAttribute('role', 'status');
    const recordingMode = node('p', '', recordingCheck); recordingMode.id = 'word-recording-mode';
    const recordingAudio = node('audio', undefined, recordingCheck); recordingAudio.controls = true; recordingAudio.hidden = true;
    recordingAudio.id = 'word-recording-audio'; recordingAudio.setAttribute('aria-label', t('voiceRecordingAudio'));
    recordingAudio.setAttribute('controlslist', 'nodownload'); recordingAudio.style.maxWidth = '100%';
    const recordingDelete = node('button', t('voiceRecordingDelete'), recordingCheck); recordingDelete.type = 'button'; recordingDelete.disabled = true;
    const comparisonLabel = node('label', t('voiceCompareProfile'), recordingCheck);
    const comparisonProfile = node('select', undefined, comparisonLabel); comparisonProfile.id = 'word-comparison-profile';
    for (const [value, key] of [['standard', 'voiceCompareStandard'], ['whole', 'voiceCompareWhole'], ['medium', 'voiceCompareMedium']]) {
        const option = node('option', t(key), comparisonProfile); option.value = value;
    }
    comparisonProfile.value = 'whole';
    node('p', t('voiceCompareHelp'), recordingCheck);
    const comparisonRun = node('button', t('voiceCompare'), recordingCheck); comparisonRun.type = 'button'; comparisonRun.disabled = true; comparisonRun.id = 'word-comparison-run';
    const comparisonResult = node('p', '', recordingCheck); comparisonResult.id = 'word-comparison-result'; comparisonResult.setAttribute('data-i18n-skip', ''); comparisonResult.style.whiteSpace = 'pre-wrap';
    const comparisonApply = node('button', t('voiceComparisonApply'), recordingCheck); comparisonApply.type = 'button'; comparisonApply.hidden = true; comparisonApply.id = 'word-comparison-apply';
    const voiceChoose = node('button', t('voiceChoose'), voiceHelp); voiceChoose.type = 'button'; voiceChoose.id = 'word-voice-choose';
    const identityChoose = node('button', t('identityHeading'), voiceHelp); identityChoose.type = 'button'; identityChoose.id = 'word-identity-choose';
    const activeVoiceCredit = node('p', '', voiceHelp); activeVoiceCredit.setAttribute('data-i18n-skip', ''); activeVoiceCredit.hidden = true;
    const voiceChoice = node('section', undefined, meetingBody); voiceChoice.className = 'word-voice-choice';
    voiceChoice.id = 'word-voice-choice';
    const identityPanel = node('section', undefined, voiceChoice); identityPanel.className = 'word-identity'; identityPanel.id = 'word-identity';
    node('h3', t('identityHeading'), identityPanel);
    node('p', t('identityHelp'), identityPanel);
    const identityInputs = {}, identityChoices = {};
    for (const [field, key] of [['characterName', 'identityName'], ['firstPerson', 'identityFirstPerson'], ['playerAddress', 'identityPlayerAddress']]) {
        const label = node('label', t(key), identityPanel);
        const control = node('input', undefined, label); control.type = 'text'; control.id = 'word-identity-' + field;
        control.maxLength = identityApi.limit(field) * 2; control.autocomplete = 'off'; control.spellcheck = false;
        control.setAttribute('data-i18n-skip', ''); control.setAttribute('aria-describedby', 'word-identity-limits');
        identityInputs[field] = control;
        identityChoices[field] = node('div', undefined, identityPanel); identityChoices[field].className = 'word-identity-choices';
        identityChoices[field].setAttribute('role', 'group'); identityChoices[field].setAttribute('aria-label', t(key));
        control.addEventListener('input', () => { voice.stop(); refreshIdentityPreview(); });
    }
    const identityLimits = node('p', t('identityLimits'), identityPanel); identityLimits.id = 'word-identity-limits';
    const identityPreview = node('p', '', identityPanel); identityPreview.id = 'word-identity-preview'; identityPreview.setAttribute('data-i18n-skip', '');
    const identityAudition = node('button', t('identityPreview'), identityPanel); identityAudition.type = 'button'; identityAudition.id = 'word-identity-audition';
    const identitySave = node('button', t('identitySave'), identityPanel); identitySave.type = 'button'; identitySave.id = 'word-identity-save';
    const identityStatus = node('p', '', identityPanel); identityStatus.id = 'word-identity-status'; identityStatus.setAttribute('role', 'status');
    function readIdentityDraft() { return identityApi.draft(Object.fromEntries(identityApi.fields.map(field => [field, identityInputs[field].value]))); }
    function updateIdentityBadge() {
        identityBadge.textContent = state?.identity?.characterName || ''; identityBadge.hidden = !identityBadge.textContent;
    }
    function refreshIdentityPreview() {
        const value = readIdentityDraft(), valid = identityApi.valid(value);
        identityPreview.textContent = valid ? identityApi.format(displayText('identityGreeting'), value) : '';
        identitySave.disabled = !valid || !state || saveBlocked;
        for (const field of identityApi.fields) {
            const fieldValid = !!value[field] && [...value[field]].length <= identityApi.limit(field)
                && identityApi.valid({ ...value, ...Object.fromEntries(identityApi.fields.filter(other => other !== field).map(other => [other, 'a'])) });
            identityInputs[field].setAttribute('aria-invalid', String(!fieldValid));
            for (const button of identityChoices[field].children) button.setAttribute('aria-pressed', String(button.textContent === value[field]));
        }
        identityStatus.textContent = valid ? '' : t('identityLimits');
        if (choosingInitialVoice) {
            meetingVoice.textContent = speech.value === 'short' && valid ? identityPreview.textContent : displayText(speech.value === 'short' ? 'meetingWords' : 'meetingSound');
            meetingVoice.setAttribute('data-i18n-skip', '');
            drawSignature();
        }
        renderVoiceChoices();
    }
    function prepareIdentity(initial, preserve = false) {
        const choices = identityApi.suggestions(appearance.value, text => window.GameI18n.translate(text));
        const value = preserve ? readIdentityDraft() : !initial && state?.identity || Object.fromEntries(identityApi.fields.map(field => [field, choices[field][0]]));
        for (const field of identityApi.fields) {
            identityInputs[field].value = value[field]; identityInputs[field].disabled = screen === 'signing'; identityChoices[field].replaceChildren();
            for (const text of choices[field]) {
                const button = node('button', text, identityChoices[field]); button.type = 'button'; button.setAttribute('data-i18n-skip', '');
                button.disabled = screen === 'signing';
                button.addEventListener('click', () => { voice.stop(); identityInputs[field].value = text; refreshIdentityPreview(); });
            }
        }
        identitySave.hidden = initial; refreshIdentityPreview();
    }
    window.addEventListener('game-language-changed', () => {
        if (meeting.open) { voice.stop(); prepareIdentity(choosingInitialVoice, true); }
    });
    identityAudition.addEventListener('click', () => {
        const value = readIdentityDraft();
        if (identityApi.valid(value)) voice.speak(identityApi.format(displayText('identityGreeting'), value), { preview: true, species: appearance.value });
    });
    identitySave.addEventListener('click', () => {
        if (choosingInitialVoice || !state || saveBlocked || !identityApi.configure(state, readIdentityDraft())) return;
        voice.stop(); updateIdentityBadge(); save();
        record('identity', { identity: state.identity });
        identityStatus.textContent = t(saveBlocked ? 'saveFailed' : 'identitySaved'); identitySave.disabled = saveBlocked;
    });
    const choiceHeading = node('h3', t('voiceChoose'), voiceChoice);
    node('p', t('voiceChoiceHelp'), voiceChoice);
    const sourceLabel = node('label', t('voiceSource'), voiceChoice);
    const voiceSource = node('select', undefined, sourceLabel); voiceSource.id = 'word-voice-source';
    for (const [value, key] of [['device', 'voiceDevice'], ['voicevox', 'voiceLocal']]) {
        const option = node('option', t(key), voiceSource); option.value = value;
    }
    const localPanel = node('div', undefined, voiceChoice); localPanel.hidden = true;
    node('p', t('voiceLocalHelp'), localPanel).className = 'word-voice-help';
    const localConnect = node('button', t('voiceConnect'), localPanel); localConnect.type = 'button'; localConnect.id = 'word-voice-connect';
    const localMessage = node('p', '', localPanel); localMessage.setAttribute('role', 'status');
    node('p', t('voiceConnectHelp'), localPanel).className = 'word-voice-help';
    const origin = node('p', undefined, localPanel); node('span', t('voiceOrigin'), origin);
    node('span', window.location.origin, origin).setAttribute('data-i18n-skip', '');
    const localGuide = node('a', t('voiceLocalGuide'), localPanel); localGuide.href = 'https://voicevox.hiroshiba.jp/';
    localGuide.target = '_blank'; localGuide.rel = 'noopener noreferrer';
    const dialogueLabel = node('label', t('voiceDialogue'), voiceChoice);
    const dialogueVoice = node('select', undefined, dialogueLabel); dialogueVoice.id = 'word-dialogue-voice';
    dialogueVoice.setAttribute('data-i18n-skip', '');
    const tuningControls = {};
    for (const [key, min, max] of [['pitch', .5, 1.5], ['rate', .6, 1.4]]) {
        const label = node('label', undefined, voiceChoice); label.className = 'word-voice-tuning';
        node('span', t(key === 'pitch' ? 'voicePitch' : 'voiceRate'), label);
        const output = node('output', '1.00', label); output.setAttribute('data-i18n-skip', '');
        const control = node('input', undefined, label); control.type = 'range'; control.min = min; control.max = max;
        control.step = '.05'; control.value = '1'; control.id = 'word-voice-' + key; output.htmlFor = control.id;
        tuningControls[key] = { control, output };
        control.addEventListener('input', () => {
            voice.setTuning(appearance.value, { pitch: Number(tuningControls.pitch.control.value), rate: Number(tuningControls.rate.control.value) });
            renderVoiceChoices();
        });
    }
    const tuningReset = node('button', t('voiceTuningReset'), voiceChoice); tuningReset.type = 'button';
    tuningReset.addEventListener('click', () => { voice.setTuning(appearance.value, { pitch: 1, rate: 1 }); renderVoiceChoices(); });
    node('p', t('voiceTuningHelp'), voiceChoice).className = 'word-voice-help';
    const effectLabel = node('label', undefined, voiceChoice); effectLabel.className = 'word-voice-tuning';
    node('span', t('voiceEffect'), effectLabel);
    const effectOutput = node('output', '.65', effectLabel); effectOutput.setAttribute('data-i18n-skip', '');
    const effectControl = node('input', undefined, effectLabel); effectControl.type = 'range'; effectControl.min = '0'; effectControl.max = '1';
    effectControl.step = '.05'; effectControl.id = 'word-voice-effect'; effectOutput.htmlFor = effectControl.id;
    const effectHelp = node('p', t('voiceEffectHelp'), voiceChoice); effectHelp.className = 'word-voice-help';
    const voiceCredit = node('p', '', voiceChoice); voiceCredit.setAttribute('data-i18n-skip', '');
    effectControl.addEventListener('input', () => { voice.setEffect(appearance.value, Number(effectControl.value)); renderVoiceChoices(); });
    node('p', t('voiceAuditionHelp'), voiceChoice).className = 'word-voice-help';
    const choiceStatus = node('p', '', voiceChoice); choiceStatus.setAttribute('role', 'status');
    const choiceSaveStatus = node('p', '', voiceChoice); choiceSaveStatus.setAttribute('role', 'status'); choiceSaveStatus.hidden = true;
    const previewButtons = [];
    for (const key of ['voiceSample1', 'voiceSample2', 'voiceSample3']) {
        const row = node('div', undefined, voiceChoice); row.className = 'word-voice-sample';
        const button = node('button', undefined, row); button.type = 'button'; previewButtons.push(button);
        node('span', '▶ ', button).setAttribute('aria-hidden', 'true'); node('span', t(key), button);
        button.addEventListener('click', () => voice.speak(displayText(key), { preview: true, species: appearance.value }));
    }
    const narration = node('details', undefined, voiceChoice); narration.className = 'word-voice-narration';
    node('summary', t('voiceNarrator'), narration);
    const narratorName = node('p', '', narration); narratorName.setAttribute('data-i18n-skip', '');
    const gestureRow = node('div', undefined, narration); gestureRow.className = 'word-voice-sample';
    node('p', t('voiceSampleGesture'), gestureRow);
    const gesturePreview = node('button', t('voicePreviewGesture'), gestureRow); gesturePreview.type = 'button'; previewButtons.push(gesturePreview);
    gesturePreview.addEventListener('click', () => voice.speak(displayText('voiceSampleGesture'), { preview: true, role: 'narration' }));
    const resetVoices = node('button', t('voiceReset'), narration); resetVoices.type = 'button';
    const choiceStop = node('button', t('voiceStop'), voiceChoice); choiceStop.type = 'button';
    const choiceContinue = node('button', t('voiceChoiceClose'), meetingContent); choiceContinue.type = 'button'; choiceContinue.id = 'word-voice-continue'; choiceContinue.hidden = true;
    function renderVoiceChoices() {
        if (!meeting.open) return;
        const bank = voice.voices(), selected = bank.choices[appearance.value], local = bank.source !== 'device';
        activeVoiceCredit.textContent = local ? bank.dialogue.find(v => window.ExperimentalWordVoice.voiceId(v) === selected)?.credit || '' : '';
        activeVoiceCredit.hidden = !activeVoiceCredit.textContent;
        voiceSource.value = bank.source; localPanel.hidden = !local;
        effectLabel.hidden = effectHelp.hidden = !local;
        effectControl.value = bank.effect[appearance.value] ?? .65; effectOutput.value = Number(effectControl.value).toFixed(2);
        effectControl.disabled = !bank.providerSupported;
        localConnect.disabled = !bank.providerSupported;
        resetVoices.hidden = local;
        dialogueVoice.replaceChildren();
        if (!bank.dialogue.some(v => window.ExperimentalWordVoice.voiceId(v) === selected)) {
            const missing = node('option', '', dialogueVoice); missing.value = ''; missing.disabled = true;
        }
        for (const v of bank.dialogue) {
            const option = node('option', `${v.name || v.voiceURI} (${v.lang})`, dialogueVoice);
            option.value = window.ExperimentalWordVoice.voiceId(v);
        }
        dialogueVoice.value = selected || ''; dialogueVoice.disabled = !bank.dialogue.length;
        narratorName.textContent = bank.narrator ? `${bank.narrator.name || bank.narrator.voiceURI} (${bank.narrator.lang})` : '';
        const ready = !!bank.dialogue.length && bank.providerSupported;
        voiceCredit.textContent = local ? bank.dialogue.find(v => window.ExperimentalWordVoice.voiceId(v) === selected)?.credit || '' : '';
        voiceCredit.hidden = !voiceCredit.textContent;
        choiceStatus.textContent = local ? !bank.providerSupported ? t('voiceProviderLanguage') : !bank.dialogue.length ? t('voiceProviderFirst') : !ready || !dialogueVoice.value ? t('voiceMissing') : ''
            : !bank.available.length ? t('voiceUnavailable') : !ready || !dialogueVoice.value ? t('voiceMissing') : '';
        choiceStatus.hidden = !choiceStatus.textContent;
        choiceSaveStatus.hidden = voice.preferencesSaved; choiceSaveStatus.textContent = voice.preferencesSaved ? '' : t('voiceUnsaved');
        const tuning = bank.profile.tuning[appearance.value] || { pitch: 1, rate: 1 };
        for (const key of ['pitch', 'rate']) {
            tuningControls[key].control.value = tuning[key]; tuningControls[key].output.value = tuning[key].toFixed(2);
        }
        previewButtons.forEach((button, index) => { button.disabled = !voice.supportedOutput || (index < 3 ? !ready || !dialogueVoice.value : !bank.narrator); });
        identityAudition.disabled = screen === 'signing' || !voice.supportedOutput || !ready || !dialogueVoice.value || !identityApi.valid(readIdentityDraft());
    }
    function prepareMeetingVoice(initial) {
        choosingInitialVoice = initial;
        choiceHeading.hidden = !initial;
        meetingHeading.textContent = t(initial ? 'meetingHeading' : 'voiceChoose');
        [signatureLabel, signatureCanvas, signatureClear, meetingBegin, meetingRetry].forEach(element => { element.hidden = !initial; });
        choiceContinue.hidden = initial; meetingVoice.hidden = meetingGesture.hidden = !initial;
        prepareIdentity(initial);
        meetingImage = new Image(); meetingImage.src = meetingVisuals[appearance.value].image;
        meetingImage.onerror = () => { imageFailure = true; };
        renderVoiceChoices(); drawMeetingFrame();
    }
    function openVoiceChoices() {
        voice.stop(); meeting.showModal(); prepareMeetingVoice(false); dialogueVoice.focus({ preventScroll: true }); meeting.scrollTop = 0;
    }
    function closeVoiceChoices() { voice.stop(); meeting.close(); voiceChoose.focus(); lastFrame = null; }
    voiceChoose.addEventListener('click', openVoiceChoices);
    identityChoose.addEventListener('click', () => { openVoiceChoices(); identityInputs.characterName.focus({ preventScroll: true }); });
    dialogueVoice.addEventListener('change', () => { voice.selectVoice(appearance.value, dialogueVoice.value); renderVoiceChoices(); });
    voiceSource.addEventListener('change', () => { voice.setSource(voiceSource.value); localMessage.textContent = ''; renderVoiceChoices(); });
    localConnect.addEventListener('click', async () => {
        localConnect.disabled = true;
        await voice.connectProvider(); renderVoiceChoices();
    });
    resetVoices.addEventListener('click', () => { voice.resetVoices(appearance.value); renderVoiceChoices(); });
    choiceStop.addEventListener('click', () => voice.stop());
    choiceContinue.addEventListener('click', closeVoiceChoices);
    window.speechSynthesis?.addEventListener('voiceschanged', renderVoiceChoices);
    let voiceDraft = '', voiceOwnedValue = '', recognized = '', recognizedLocale = null;
    let recordingURL = null, comparisonText = null;
    const voiceStatuses = { listening: 'voiceListening', review: 'voiceReview', unsupportedInput: 'voiceUnsupportedInput',
        preparingInput: 'voicePreparingInput', processingInput: 'voiceProcessingInput', unconfirmedInput: 'voiceUnconfirmedInput', missingRecognizer: 'voiceMissingRecognizer', networkInput: 'voiceNetworkInput',
        comparingInput: 'voiceComparingInput', comparisonReady: 'voiceComparisonReady', comparisonNoSpeech: 'voiceComparisonNoSpeech', missingComparison: 'voiceMissingComparison',
        unsupportedOutput: 'voiceUnsupportedOutput', denied: 'voiceDenied', noSpeech: 'voiceNoSpeech',
        failedInput: 'voiceFailedInput', failedOutput: 'voiceFailedOutput', voicesUnavailable: 'voiceUnavailable', voiceMissing: 'voiceMissing', preferencesUnsaved: 'voiceUnsaved',
        providerConnecting: 'voiceProviderConnecting', providerReady: 'voiceProviderReady', providerFailed: 'voiceProviderFailed',
        providerLanguage: 'voiceProviderLanguage', providerConnectFirst: 'voiceProviderFirst', providerGenerating: 'voiceProviderGenerating', castLanguage: 'voiceCastLanguage' };
    voice = window.ExperimentalWordVoice.create(window, {
        locale: () => window.GameI18n.language, volume: () => Number(voiceVolume.value),
        species: () => appearance.value,
        captureProcessing: () => captureProcessing.checked,
        canPreview: () => meeting.open && screen !== 'signing' && !document.hidden,
        canPrepare: () => screen === 'playing' && !paused && !document.hidden && !starsDialog.open && !meeting.open,
        canSpeak: () => screen === 'playing' && !paused && !document.hidden && !starsDialog.open && !meeting.open
            && (!masterDialog.open || ['silhouette', 'conversation'].includes(masterPhase)),
        status: key => { const text = voiceStatuses[key] ? t(voiceStatuses[key]) : ''; voiceStatus.textContent = text;
            if (['preparingInput', 'processingInput', 'comparingInput'].includes(key)) microphone.disabled = true;
            if (key === 'listening') { microphone.disabled = false; microphone.textContent = t('voiceFinish'); }
            localMessage.textContent = key.startsWith('provider') ? text : '';
            if (meeting.open && text) { choiceStatus.textContent = text; choiceStatus.hidden = false; } },
        listening: active => {
            microphone.setAttribute('aria-pressed', String(active));
            if (!active) { microphone.disabled = !voice.supportedInput; microphone.textContent = t('voiceStart'); }
            comparisonRun.disabled = active || !recordingURL;
            comparisonProfile.disabled = active; recordingAudio.hidden = active || !recordingURL;
            captureProcessing.disabled = active;
            comparisonApply.disabled = active;
            window.audioManager?.setSpeechInputActive?.(active);
        },
        stopPlayback: () => recordingAudio.pause(),
        recording: (wav, info) => {
            recordingAudio.pause(); recordingAudio.removeAttribute('src'); recordingAudio.load();
            if (recordingURL) URL.revokeObjectURL(recordingURL);
            recordingURL = wav ? URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })) : null;
            if (recordingURL) recordingAudio.src = recordingURL;
            recordingAudio.hidden = !recordingURL || voice.listening;
            recordingDelete.disabled = !recordingURL; comparisonRun.disabled = !recordingURL || voice.listening;
            recordingInfo.textContent = info?.limited ? t('voiceRecordingLimit') : recordingURL ? t('voiceRecordingAudio') : t('voiceRecordingEmpty');
            recordingMode.textContent = '';
            if (recordingURL && typeof info?.captureProcessing === 'boolean') {
                const settings = info.captureSettings || {}, keys = ['echoCancellation', 'noiseSuppression', 'autoGainControl'];
                const mismatch = keys.some(key => typeof settings[key] === 'boolean' && settings[key] !== info.captureProcessing);
                const unknown = keys.some(key => typeof settings[key] !== 'boolean');
                recordingMode.textContent = t(info.captureProcessing ? 'voiceCapturedOn' : 'voiceCapturedOff')
                    + (mismatch ? '\n' + t('voiceCaptureMismatch') : unknown ? '\n' + t('voiceCaptureUnknown') : '');
            }
            if (recordingURL) recordingCheck.open = true;
        },
        comparison: result => {
            comparisonText = result?.text || null;
            comparisonResult.textContent = result ? comparisonProfile.querySelector(`option[value="${result.profile}"]`).textContent + '\n' + result.text : '';
            comparisonApply.hidden = !comparisonText;
        },
        transcript: text => {
            if (screen !== 'playing' || paused || document.hidden || input.value !== voiceOwnedValue) return false;
            const combined = voiceDraft + (voiceDraft ? '\n' : '') + text;
            if (combined.length > input.maxLength) { voice.stop(); voiceStatus.textContent = t('voiceLong'); return false; }
            input.value = combined; voiceOwnedValue = combined; recognized = text; recognizedLocale = window.GameI18n.language;
            input.dataset.inputMethod = 'speech'; input.focus();
        }
    });
    microphone.disabled = !voice.supportedInput;
    voice.registerFixedLines([
        ...Object.keys(window.ExperimentalWordVoice.cast).filter(id => id !== 'narration').flatMap(master =>
            ['master_intro_', 'work_label_'].map(prefix => ({ text: t(prefix + master), role: 'master', master }))),
        ...Object.keys(labels).filter(key => /_gesture$|^master_(meet|return|try|defer|result_)|^(masterPresence|attend|work)$/.test(key))
            .map(key => ({ text: t(key), role: 'narration' }))
    ]);
    readAloud.disabled = !voice.supportedOutput;
    if (!voice.supportedInput) voiceStatus.textContent = t('voiceUnsupportedInput');
    microphone.addEventListener('click', () => {
        if (paused || screen !== 'playing') return;
        stopAuto();
        dungeonView?.stop();
        if (!voice.listening) { voiceDraft = input.value; voiceOwnedValue = input.value; }
        voice.listen();
    });
    recordingDelete.addEventListener('click', () => voice.clearRecording());
    comparisonRun.addEventListener('click', () => { if (!paused && screen === 'playing') void voice.compareRecording(comparisonProfile.value); });
    comparisonApply.addEventListener('click', () => {
        if (!comparisonText || voice.listening || paused || screen !== 'playing') return;
        if (input.value !== voiceOwnedValue) { voiceStatus.textContent = t('voiceComparisonEdited'); return; }
        const combined = voiceDraft + (voiceDraft ? '\n' : '') + comparisonText;
        if (combined.length > input.maxLength) { voiceStatus.textContent = t('voiceLong'); return; }
        input.value = combined; voiceOwnedValue = combined; recognized = comparisonText; recognizedLocale = window.GameI18n.language;
        input.dataset.inputMethod = 'speech'; voiceStatus.textContent = t('voiceReview'); input.focus();
    });
    recordingAudio.addEventListener('play', () => { if (voice.listening || paused || screen !== 'playing' || document.hidden) recordingAudio.pause(); });
    readAloud.addEventListener('change', () => {
        voice.setEnabled(readAloud.checked);
        if (readAloud.checked && masterDialog.open) {
            if (['loading', 'video'].includes(masterPhase)) prepareMasterVoices();
            else playMasterVoices();
        }
        else if (readAloud.checked && !bubble.hidden) voice.speak(bubble.textContent, { role: lastReplyIsNarration ? 'narration' : 'dialogue' });
    });
    voiceStop.addEventListener('click', () => { ++adventureActionToken; voice.stop(); });
    input.addEventListener('input', () => {
        stopAuto();voice.stop();
        if(state?.adventure?.connection) {
            delete state.adventure.connection.goal;
            if(state.adventure.run?.training)state.adventure.connection.trainingPaused=true;
        }
        if (recognized) input.dataset.inputMethod = 'speech-edited';
    });
    window.addEventListener('game-language-changed', () => {
        stopAuto(); for (const axis of autoApi.axes) autoSliders[axis].value.textContent = t('autoLevels' + autoMemory.weights[axis]);
        if (autoBaseline !== null && state) autoProgress.textContent = displayText('autoGrowth') + ': ' + Math.max(0, state.knowledge.meanings.length - autoBaseline);
        voice.clearRecording(); renderVoiceChoices(); liveStars.languageChanged(); previewStars.languageChanged();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) voice.stop(); });
    window.addEventListener('pagehide', () => voice.clearRecording());
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
            event.preventDefault(); if (!paused) form.requestSubmit();
        }
    });
    const details = node('details', undefined, session);
    // Developer observations are opt-in by URL, not part of the normal play screen.
    details.hidden = new URLSearchParams(location.search).get('debug') !== '1';
    node('summary', t('diagnostics'), details);
    const trace = node('pre', undefined, details); trace.setAttribute('data-i18n-skip', '');
    // Keep game actions beside the terrarium; preferences and diagnostics live in Settings.
    settingsBody.append(language);
    if (volume) settingsBody.append(volume.parentElement);
    settingsBody.append(readLabel, captureLabel, captureHelp, voiceHelp, recordingCheck, exportButton, personalControls, details);
    voiceTools.append(voiceStop);
    function save() {
        if (!window.wordStorage || !state || saveBlocked) return;
        try {
            const result = window.wordStorage.save({ version: 1, appearance: appearance.value, state, world, collection });
            if (!result.ok) throw new Error('save');
        } catch (_) { saveBlocked = true; saveBadge.textContent = t('saveFailed'); }
    }
    setInterval(save, 5000);
    window.addEventListener('beforeunload', save);
    function updatePerception() {
        if (adventureApi && state.adventure && adventureApi.perceive(state, world)) return;
        if (dungeon) { window.ExperimentalWordDungeonLearning.perceive(dungeon); return; }
        api.perceive(state, worldApi.perception(world));
    }
    function toggleDungeon(enter, history = true) {
        if (!state || !dungeonButton || enter === !!dungeon) return;
        stopAuto(); autoPanel.hidden = enter;
        if (enter) {
            window.ExperimentalWordLifeLearning.cancelWalking(world);
            dungeon = window.ExperimentalWordDungeonLearning.create(state, world);
            if (!dungeonView) dungeonView = new window.ExperimentalWordDungeonView(canvas, stage, controls, t,
                action => { if (!action) return; const key = action.reason === 'diverged' ? 'dungeonDiverged'
                    : action.reason === 'retreat' ? 'dungeonRetreat' : action.reason === 'obey' ? 'dungeonObey' : 'dungeonExplore';
                    showReply({ message: state.settings.speech === 'short' ? key : 'attend' });
                    if (state.settings.speech !== 'short') {
                        const guidance = node('p', t(key), conversation); guidance.className = 'conversation-help';
                        record('guidance', { key, literal: '' });
                    }
                    record('dungeon_action', { action }); updateDungeonStatus(); dungeonView.refresh(); },
                () => { bubble.hidden = true; record('dungeon_point', { target: dungeon.attention }); }, () => toggleDungeon(false),
                () => !paused && !exporting && !input.value.trim() && !document.hidden && !dungeon?.pending);
            dungeonView.enter(dungeon, dungeonVisuals, appearance.value);
        } else { dungeonView.leave(); dungeon = null; }
        state.context.pendingQuestion = null; state.context.lastOutput = null;
        bubble.hidden = true; paused = false; pause.setAttribute('aria-pressed', 'false'); send.disabled = false;
        dungeonButton.textContent = t(dungeon ? 'dungeonReturn' : 'dungeonEnter');
        canvas.setAttribute('aria-label', t(dungeon ? 'dungeonTitle' : 'islandLabel'));
        point.disabled = shade.disabled = false;
        if (walk) walk.disabled = false;
        if (masterVisit) masterVisit.disabled = false;
        controls.classList.toggle('in-dungeon', !!dungeon);
        navigationControls.hidden = !!dungeon || !debugControls;
        updatePerception(); lastStatus = ''; lastFrame = null;
        if (history) window.history.pushState({ wordContent: dungeon ? 'dungeon' : 'island' }, '', dungeon ? 'experimental_word_dungeon.html' : 'experimental_word_island.html');
        record('content_change', { content: dungeon ? 'dungeon' : 'island' }); renderNotebook();
        if (dungeon) updateDungeonStatus();
    }
    function updateDungeonStatus() {
        status.textContent = t(dungeon.complete ? 'dungeonArrived' : dungeon.last?.reason === 'diverged' ? 'dungeonDiverged'
            : dungeon.last?.reason === 'retreat' ? 'dungeonRetreat' : dungeon.last?.reason === 'avoid' ? 'dungeonAvoid'
            : dungeon.last?.reason === 'obey' ? 'dungeonObey' : 'dungeonExplore') + ' · ' + dungeon.turn;
    }
    window.addEventListener('popstate', event => { if (event.state?.wordContent) toggleDungeon(event.state.wordContent === 'dungeon', false); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) dungeonView?.stop(); });
    function labelAdventureAction(action, master = null) {
        if(input.value.trim() || voice.listening)return;
        const locale=window.GameI18n.language, n=adventureApi.actions.indexOf(action);
        const word=action==='walk' ? (adventureApi.walkLabels[locale]||adventureApi.walkLabels.en) : (adventureApi.words[locale]||adventureApi.words.en)[n];
        try {automaticSubmission=true;adventureLabelOnly=true;adventureMentorSpeech=master;input.value=word;input.dataset.inputMethod='auto';form.requestSubmit();}
        finally {automaticSubmission=adventureLabelOnly=adventureMentorSpeech=false;}
    }
    async function adventureAction(action, target, automatic = false, reason = null, instruction = null) {
        if (!automatic || !state?.adventure.run || paused || exporting || input.value.trim() || document.hidden) return;
        const guided = state.adventure.run.training;
        const continuation = adventureActionToken;
        const reply = adventureApi.hand(state, world, action, target, instruction, window.GameI18n.language);
        if(reason==='body' && reply.message==='advMoved')reply.message='advRetreatReason';
        record('adventure_action', {action,target,event:state.adventure.events.at(-1)});
        if (!reply.npc) showReply(reply);
        updatePerception();renderNotebook();save();
        const token = adventureSpeechToken;
        if (readAloud.checked && !reply.npc) await adventureSpeechPromise;
        if (continuation !== adventureActionToken || token !== adventureSpeechToken || paused || voice.listening || input.value.trim() || document.hidden) return;
        if ((guided || autoActive) && adventureApi.teachable.includes(action)
            && !state.knowledge.meanings.some(m=>m.id===adventureApi.meaningFor(action))) {
            labelAdventureAction(action,guided?'master:explore':null);
            const teachingToken = adventureSpeechToken;
            if (readAloud.checked) await adventureSpeechPromise;
            if (continuation !== adventureActionToken || teachingToken !== adventureSpeechToken || paused || voice.listening || input.value.trim() || document.hidden) return;
        }
        if (reply.npc) showReply(reply);
    }
    if (window.WordIslandMode && adventureApi) adventureView = new window.ExperimentalWordAdventureView(canvas, controls, t, adventureAction);
    // Keep the modal out of the playing grid and its clipped/scrolling ancestors.
    const masterDialog = node('dialog', undefined, document.body); masterDialog.className = 'word-master'; masterDialog.id = 'word-master-dialog';
    const masterLeft = node('div', undefined, masterDialog); masterLeft.className = 'word-master-left';
    const masterThought = node('p', '', masterLeft); masterThought.className = 'word-master-thought';
    const masterHero = node('canvas', undefined, masterLeft); masterHero.width = 280; masterHero.height = 200;
    masterHero.setAttribute('aria-hidden', 'true');
    const masterRight = node('div', undefined, masterDialog); masterRight.className = 'word-master-right';
    const masterName = node('h2', '', masterRight); masterName.id = 'word-master-name'; masterName.className = 'visually-hidden';
    const masterText = node('p', '', masterRight); masterText.id = 'word-master-text'; masterText.className = 'word-master-speech';
    const masterPortrait = node('canvas', undefined, masterRight); masterPortrait.width = 400; masterPortrait.height = 400;
    masterPortrait.setAttribute('aria-hidden', 'true');
    masterDialog.setAttribute('aria-labelledby', masterName.id); masterDialog.setAttribute('aria-describedby', masterText.id);
    const masterClose = node('button', t('masterContinue'), masterRight); masterClose.type = 'button'; masterClose.id = 'word-master-close';
    const masterVideo = node('video', undefined, masterDialog); masterVideo.className = 'word-master-video';
    masterVideo.playsInline = true; masterVideo.preload = 'auto'; masterVideo.hidden = true;
    const masterSkip = node('button', t('masterSkip'), masterDialog); masterSkip.type = 'button'; masterSkip.id = 'word-master-skip'; masterSkip.className = 'word-master-skip'; masterSkip.hidden = true;
    let masterFocus = null, masterImage = null, dialogMaster = null, masterBackground = null;
    let masterPhase = 'closed', masterReply = null, masterToken = 0, videoAbort = null, videoWatch = null, masterClosing = false;
    let masterSpeechToken = 0, masterSpeechPending = false, masterAutoElapsed = 0, masterAutoQuiet = 0;
    function clearMasterVideo() {
        videoAbort?.abort(); videoAbort = null;
        clearInterval(videoWatch); videoWatch = null;
        masterVideo.pause(); masterVideo.removeAttribute('src'); masterVideo.load();
        masterVideo.hidden = masterSkip.hidden = true;
    }
    function masterConversation(silhouette = false) {
        if (!masterDialog.open) return;
        if (masterPhase === (silhouette ? 'silhouette' : 'conversation')) return;
        masterPhase = silhouette ? 'silhouette' : 'conversation';
        masterAutoElapsed = masterAutoQuiet = 0;
        masterDialog.dataset.phase = masterPhase; clearMasterVideo();
        masterLeft.hidden = masterRight.hidden = false;
        masterText.textContent = t(silhouette ? 'masterPresence' : masterReply.npc);
        // Show the existing observed reaction; don't invent understanding or a new preference.
        masterThought.textContent = masterReply.dialogueText ?? t(masterReply.message);
        masterClose.textContent = t(silhouette ? 'masterReveal' : 'masterContinue');
        masterClose.disabled = false; masterClose.focus({ preventScroll: true }); drawMaster(performance.now());
        playMasterVoices();
    }
    async function playMasterVoices() {
        const token = ++masterSpeechToken;
        masterSpeechPending = true; masterAutoQuiet = 0;
        try {
            if (masterPhase === 'silhouette') await voice.speak(masterText.textContent, { role: 'narration' });
            else if (masterPhase === 'conversation') {
                const parts = [
                { text: masterText.textContent, role: 'master', master: dialogMaster },
                { text: masterThought.textContent, role: masterReply.dialogueRole || 'narration' }
                ];
                await voice.speakScene(masterReply.npcAfter ? parts.reverse() : parts);
            }
        } finally { if (token === masterSpeechToken) masterSpeechPending = false; }
    }
    function tickAutoMaster(dt) {
        if (!autoActive || paused || growthDialog.open || exporting || voice.listening || meeting.open || !stars.hidden || input.value.trim()
            || !masterDialog.open || !['silhouette', 'conversation'].includes(masterPhase)) {
            masterAutoElapsed = masterAutoQuiet = 0; return;
        }
        // Visible frame time only: movie/loading phases never advance, nor do background gaps.
        masterAutoElapsed += dt;
        masterAutoQuiet = masterSpeechPending ? 0 : masterAutoQuiet + dt;
        const readingTime = Math.max(4, Math.min(15, Array.from(masterText.textContent + masterThought.textContent).length / 12));
        if (masterAutoElapsed >= readingTime && masterAutoQuiet >= 1) {
            record('auto_training', { action: 'master_continue', master: dialogMaster, phase: masterPhase });
            advanceMaster();
        }
    }
    function prepareMasterVoices() {
        if (masterReply) void voice.prepareScene([
            { text: t(masterReply.npc), role: 'master', master: dialogMaster },
            { text: t(masterReply.message), role: 'narration' }
        ]);
    }
    function advanceMaster() {
        if (!masterDialog.open) return;
        if (masterPhase === 'silhouette') masterConversation();
        else if (masterPhase === 'conversation') closeMaster();
    }
    function closeMaster() {
        if (!masterDialog.open) return;
        // HTMLDialogElement dispatches close asynchronously. Do not open the next
        // conversation before this one's voice/phase cleanup has completed.
        masterClosing = true; masterDialog.close();
    }
    masterClose.addEventListener('click', advanceMaster);
    // Touch/pointer activation stays independent of life simulation and click synthesis.
    masterClose.addEventListener('pointerup', event => {
        if (event.button === 0 && masterPhase === 'conversation') closeMaster();
    });
    masterSkip.addEventListener('click', () => masterConversation());
    masterDialog.addEventListener('cancel', event => {
        event.preventDefault();
        if (masterPhase !== 'conversation') masterConversation();
        else closeMaster();
    });
    masterDialog.addEventListener('close', () => {
        masterSpeechToken++; masterSpeechPending = false; masterAutoElapsed = masterAutoQuiet = 0;
        voice.stop();
        masterPhase = 'closed'; masterToken++; clearMasterVideo();
        masterClosing = false;
        lastFrame = null;
        if (masterFocus?.isConnected) masterFocus.focus({ preventScroll: true });
        else input.focus({ preventScroll: true });
    });
    async function masterIntroduction(token) {
        const src = window.ExperimentalWordCareers.VIDEOS[dialogMaster];
        videoAbort = new AbortController();
        const timeout = setTimeout(() => videoAbort?.abort(), 5000);
        try {
            const response = await fetch('experimental_word_encounter_videos.json', { signal: videoAbort.signal, cache: 'no-store' });
            const available = response.ok ? await response.json() : [];
            if (token !== masterToken || !masterDialog.open || masterPhase !== 'loading') return;
            if (!Array.isArray(available) || !available.includes(src)) { masterConversation(true); return; }
            masterVideo.src = src; masterVideo.volume = environmentVolume;
            masterPhase = 'video'; masterDialog.dataset.phase = masterPhase;
            masterVideo.hidden = masterSkip.hidden = false; masterSkip.focus({ preventScroll: true });
            let progress = performance.now(), lastTime = 0;
            videoWatch = setInterval(() => {
                if (masterVideo.currentTime > lastTime) { lastTime = masterVideo.currentTime; progress = performance.now(); }
                if (performance.now() - progress > 8000) masterConversation(true);
            }, 250);
            await masterVideo.play();
        } catch (_) {
            if (token === masterToken && masterDialog.open && ['loading','video'].includes(masterPhase)) masterConversation(true);
        } finally { clearTimeout(timeout); }
    }
    masterVideo.addEventListener('ended', () => { if (masterPhase === 'video') masterConversation(); });
    masterVideo.addEventListener('error', () => { if (masterPhase === 'video') masterConversation(true); });
    function openMaster(reply) {
        voice.stop();
        dialogMaster = reply.master; masterReply = reply; masterToken++;
        masterName.textContent = t(`master_${reply.master}`);
        masterImage = new Image(); masterImage.onerror = () => { imageFailure = true; };
        masterImage.src = window.ExperimentalWordCareers.JOBS[reply.master].image;
        const background = dialogMaster === 'fishing' ? 'fishing_bg' : dialogMaster === 'cooking' ? 'room_bg' : 'field_bg';
        masterBackground = new Image(); masterBackground.src = imageSources[background];
        masterFocus = document.activeElement; masterDialog.showModal(); masterClose.focus();
        if (reply.message === 'master_meet') {
            masterPhase = 'loading'; masterDialog.dataset.phase = masterPhase;
            masterAutoElapsed = masterAutoQuiet = 0;
            prepareMasterVoices();
            masterLeft.hidden = masterRight.hidden = true; masterVideo.hidden = true;
            masterSkip.hidden = false; masterSkip.focus({ preventScroll: true });
            void masterIntroduction(masterToken);
        } else masterConversation();
    }
    function drawMaster(time = performance.now()) {
        if (!masterDialog.open || !['silhouette','conversation'].includes(masterPhase)) return;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const { skin, config, image: hero } = selectedSprite(), frames = config.actions.idle;
        const frame = reduced ? 0 : Math.floor(time / 250) % frames.length;
        masterHero.dataset.frame = String(frame);
        masterHero.dataset.skin = skin;
        const c = masterHero.getContext('2d'); c.clearRect(0, 0, 280, 200);
        if (masterBackground?.complete && masterBackground.naturalWidth) {
            const w = masterBackground.naturalWidth, h = masterBackground.naturalHeight;
            const crop = dialogMaster === 'fishing' ? [0,0,w,h/2] : dialogMaster === 'cooking' ? [0,0,w/2,h]
                : dialogMaster === 'farming' ? [w/2,0,w/2,h/2] : dialogMaster === 'smithing' ? [0,h/2,w/2,h/2] : [w/2,h/2,w/2,h/2];
            c.drawImage(masterBackground, ...crop, 0, 0, 280, 200);
        }
        const f = frames[frame];
        if (hero?.complete && hero.naturalWidth) {
            const scale = Math.min(150 / f.sw, 160 / f.sh);
            c.drawImage(hero, f.sx, f.sy, f.sw, f.sh, 140 - f.sw * scale / 2, 190 - f.sh * scale, f.sw * scale, f.sh * scale);
        }
        const portrait = masterPortrait.getContext('2d'); portrait.clearRect(0,0,400,400);
        if (masterImage?.complete && masterImage.naturalWidth) {
            const job = window.ExperimentalWordCareers.JOBS[dialogMaster], h = 360 + (reduced ? 0 : Math.sin(time/700)*2), w = job.sw / 1536 * h;
            portrait.save(); if (masterPhase === 'silhouette') portrait.filter = 'brightness(0)';
            portrait.drawImage(masterImage, job.sx, 0, job.sw, 1536, (400-w)/2, 400-h, w, h); portrait.restore();
        }
    }
    function showReply(reply) {
        const progress = reply.progress;
        if (progress) reply = { ...reply,
            message: state.settings.speech === 'short' && progress.spoken ? progress.spoken : progress.observed,
            observation: !(state.settings.speech === 'short' && progress.spoken),
            npc: progress.npc || reply.npc };
        const progressText = progress?.item ? displayText(reply.message).replace('{item}', displayText('advItem_' + progress.item))
            : progress?.floor ? displayText(reply.message).replace('{floor}', String(progress.floor)) : null;
        const personalReport = state.identity && { heard_report_self: 'identity_report_self',
            heard_report_not_resting: 'identity_report_not_resting', heard_report_player: 'identity_report_player' }[reply.message];
        const identityText = progressText ?? (reply.identity ? identityApi.format(displayText(reply.message), reply.identity)
            : personalReport ? identityApi.format(displayText(personalReport), state.identity) : null);
        const appendMentor = () => {
            const line = node('p', undefined, conversation); line.className = 'master-line';
            node('strong', t(`master_${reply.master}`), line); node('br', undefined, line);
            node('span', t(reply.npc), line);
            record('master', { master: reply.master, message: reply.npc, text: displayText(reply.npc) });
        };
        if (reply.npc && !reply.npcAfter) appendMentor();
        record('character', { reply, text: (reply.word && ['name_echo', 'name_known'].includes(reply.message) ? reply.word : '') + (identityText ?? displayText(reply.message)) + (reply.literal || '') });
        bubble.replaceChildren(); bubble.hidden = false;
        const line = node('p', undefined, conversation);
        if (reply.observation) line.className = 'observation-line';
        if (reply.message === 'name_echo' || reply.message === 'name_known') {
            const name = node('span', reply.word, bubble); name.setAttribute('data-i18n-skip', '');
            node('span', t(reply.message), bubble);
            const logName = node('span', reply.word, line); logName.setAttribute('data-i18n-skip', '');
            node('span', t(reply.message), line);
        } else if (identityText !== null) {
            node('span', identityText, bubble).setAttribute('data-i18n-skip', '');
            line.textContent = identityText; line.setAttribute('data-i18n-skip', '');
        } else {
            node('span', t(reply.message), bubble); line.textContent = t(reply.message);
            if (reply.literal) for (const parent of [bubble, line]) {
                const quotation = node('span', reply.literal, parent); quotation.setAttribute('data-i18n-skip', '');
            }
        }
        if (reply.npc && reply.npcAfter) appendMentor();
        world.speech = { until: world.elapsed + 7, target: reply.target || null };
        if (reply.target) { world.reaction = 'recognize'; world.reactionTime = 5; }
        conversation.scrollTop = conversation.scrollHeight;
        lastReplyIsNarration = !!reply.observation || state.settings.speech !== 'short'
            || reply.message === 'attend' || reply.message.endsWith('_gesture');
        if (lastReplyIsNarration && !reply.word && !reply.literal && !progress?.item && !progress?.floor && Object.hasOwn(labels, reply.message))
            voice.registerFixedLines([{ text: t(reply.message), role: 'narration' }]);
        if (reply.npc && window.WordIslandMode) openMaster({ ...reply,
            dialogueText: bubble.textContent, dialogueRole: lastReplyIsNarration ? 'narration' : 'dialogue' });
        else if (reply.npc) {
            const parts = [{ text: t(reply.npc), role: 'master', master: reply.master },
                { text: bubble.textContent, role: lastReplyIsNarration ? 'narration' : 'dialogue' }];
            const token = ++adventureSpeechToken;
            adventureSpeechPending = reply.inline && readAloud.checked;
            void voice.speakScene(reply.npcAfter ? parts.reverse() : parts).finally(() => {
                if (token === adventureSpeechToken) adventureSpeechPending = false;
            });
        }
        else if (!adventureMentorSpeech) {
            const play = () => voice.speak(bubble.textContent, { role: lastReplyIsNarration ? 'narration' : 'dialogue', wait: !!state.adventure?.run });
            if (state.adventure?.run) holdAdventureSpeech(play); else play();
        }
    }
    function animate(time) {
        drawLogo(time);
        drawTitleActors();
        drawMeeting(time);
        if (window.WordIslandMode) drawMaster(time);
        const dt = lastFrame === null ? 0 : (time - lastFrame) / 1000; lastFrame = time;
        if (world && view && screen === 'playing' && !document.hidden) {
            navigationControls.hidden=!!dungeon || !!state.adventure?.run || !debugControls;
            const ready = !state.evolution.pending && growthApi.choices(state, world).some(c => c.ready);
            growthButton.hidden = !window.WordIslandMode || state.evolution.path.length < 2;
            evolveButton.hidden = !window.WordIslandMode || (!ready && !state.evolution.pending);
            evolveButton.disabled = !ready && !state.evolution.pending;
            evolveButton.classList.toggle('word-evolution-ready', ready || !!state.evolution.pending);
            tickAutoMaster(Math.max(0, Math.min(.1, dt)));
            const holding = paused || settingsDialog.open || albumDialog.open || bookDialog.open || growthDialog.open || masterDialog.open || masterClosing || exporting || voice.listening || meeting.open || !stars.hidden || !!input.value.trim() || adventureSpeechPending;
            [1 - world.hunger, 1 - world.fatigue].forEach((value, index) => {
                const percent = Math.round(value * 100);
                bodyMeters[index].meter.value = percent;
                bodyMeters[index].value.textContent = `${percent}%`;
            });
            if (dungeon) {
                dungeonView.tick(dt, holding || !!dungeon.pending);
                updateDungeonStatus();
                bubble.style.left = '50%'; bubble.style.top = dungeonView.bubbleTop() + 'px';
                requestAnimationFrame(animate); return;
            }
            if (adventureApi && state.adventure?.run) {
                if (!holding) world.elapsed += Math.min(.1, Math.max(0, dt));
                adventureView.tick(dt, holding, autoActive, state, world);
                adventureView.update(state, world, dungeonVisuals, state.evolution.skin || appearance.value);
                bubble.style.left = '50%'; bubble.style.top = '16%';
                requestAnimationFrame(animate); return;
            }
            const event = worldApi.tick(world, dt, holding);
            if (event) record('life', { event });
            updatePerception();
            const taskAtArrival = state.adventure?.connection.task;
            const spontaneous = worldApi.onArrival(world, state, event);
            if (adventureApi && state.adventure) {
                const serial = state.adventure.serial;
                const reply = adventureApi.tick(state, world, dt, holding, event);
                if (reply) { showReply(reply); record('adventure', { reply, event: state.adventure.events.at(-1) });
                    if(reply.teaching && (reply.mentor || autoActive))labelAdventureAction(reply.teaching,reply.mentor || null);
                }
                if (serial !== state.adventure.serial || event) save();
            }
            if (event) growthApi.observe(state, world, null, event);
            if (event) acquired(collectionApi.observe(collection, state, world, event));
            // Keep first-meeting films, but do not announce an unrelated chore
            // when returning to report a lesson or deliver project materials.
            if (spontaneous && (!taskAtArrival || !spontaneous.master || spontaneous.message === 'master_meet')) showReply(spontaneous);
            if (event) renderNotebook();
            tickAuto(holding || masterDialog.open);
            if (world.speech && world.elapsed > world.speech.until) bubble.hidden = true;
            const feedback = controlFeedback && time < controlFeedback.until ? controlFeedback.key : null;
            const key = imageFailure ? 'imagesFailed' : paused ? 'paused' : feedback || (input.value.trim() ? 'typing' : world.mode === 'observe'
                ? (world.attention?.startsWith('berry:') ? 'looking' : 'idle') : world.mode);
            point.setAttribute('aria-pressed', String(world.mode === 'move' && world.destination === 'berry:1'));
            shade.setAttribute('aria-pressed', String(world.mode === 'move' && world.destination === 'shade'));
            if (key !== lastStatus) { status.textContent = t(key); lastStatus = key; }
            const task=state.adventure?.connection.task, step=task?.steps[task.index];
            const practice=step?.effect==='gather' ? 'farm_plow' : step?.effect==='craft' ? task.project==='ration'?'cook':'study' : null;
            view.draw(world, state.evolution?.skin || appearance.value, matchMedia('(prefers-reduced-motion: reduce)').matches, practice);
            if (adventureView) adventureView.update(state, world, dungeonVisuals, state.evolution.skin || appearance.value);
            const scale = Math.min(canvas.clientWidth / canvas.width, canvas.clientHeight / canvas.height);
            const position = view.bubblePosition?.() || { x: world.x, y: world.y - .39 };
            bubble.style.left = `${(canvas.clientWidth - canvas.width * scale) / 2 + Math.max(.23, Math.min(.77, position.x)) * canvas.width * scale}px`;
            bubble.style.top = `${(canvas.clientHeight - canvas.height * scale) / 2 + Math.max(.05, position.y) * canvas.height * scale}px`;
        }
        requestAnimationFrame(animate);
    }
    function beginSession() {
        if (!catalog || screen === 'playing' || saveBlocked) return;
        voice.clearRecording(); recognized = ''; recognizedLocale = null; delete input.dataset.inputMethod;
        state = restored?.state || api.create({ foundation: foundation.value === 'yes', life: life.value === 'yes', speech: speech.value }, catalog);
        const newMeeting = !restored && questionsApi.validAnswers(answers);
        if (newMeeting) state.startOrigin = { version: 4, answers: answers.slice() };
        if (newMeeting) identityApi.configure(state, signedIdentity || readIdentityDraft());
        signedIdentity = null;
        world = restored?.world || worldApi.create();
        stopAuto(); autoMemory = autoApi.create(state.autoTraining?.weights); autoBaseline = null; autoProgress.textContent = '';
        for (const axis of autoApi.axes) { autoSliders[axis].slider.value = String(autoMemory.weights[axis]); autoSliders[axis].value.textContent = t('autoLevels' + autoMemory.weights[axis]); }
        if (restored) appearance.value = restored.appearance;
        growthApi.init(state, appearance.value);
        collectionApi.join(collection, state, appearance.value, !!restored);
        if (!restored && window.WordIslandMode) acquired(collectionApi.remember(collection, state, world, 'meeting'));
        updateIdentityBadge();
        view.start?.(world, appearance.value);
        if (window.WordIslandMode && adventureApi) {
            const a = adventureApi.init(state, world);
            // Resume the exact layout and work position, with all clocks stopped.
            if (restored && (a.run || a.connection.task)) { paused = true; pause.setAttribute('aria-pressed', 'true'); send.disabled = true; }
            adventureView.update(state, world, dungeonVisuals, state.evolution.skin || appearance.value);
        }
        if (!restored && volume) view.volume(world, environmentVolume);
        if (volume) volume.value = String(world.island.volume ?? .5);
        updatePerception();
        report = window.ExperimentalWordReport.create({ state, world, appearance: appearance.value, locale: window.GameI18n.language, resumed: !!restored });
        starTraces = []; liveStars.reset(); previewStars.reset(); tracePreview.hidden = true;
        conversation.querySelectorAll('.word-trace-open').forEach(button => button.remove());
        app.classList.remove('constellation-trace-ready');
        personalLog?.start(logBaseline()); personalToggle.disabled = false;
        settings.hidden = true; setupCopy.hidden = true; session.hidden = false;
        titleScreen.hidden = true; screen = 'playing';
        app.classList.remove('title-active');
        app.classList.remove('onboarding-active');
        app.classList.add('playing'); input.focus({ preventScroll: true });
        if (dungeonButton) window.history.replaceState({ wordContent: 'island' }, '', location.href);
        save();
        if (state.evolution.pending && window.WordIslandMode) requestAnimationFrame(startCeremony);
    }
    settings.addEventListener('submit', event => {
        event.preventDefault();
        if (screen !== 'setup' || !catalog || saveBlocked) return;
        // Dedicated smoke harnesses can initialize exact legacy comparison fixtures.
        if (debugControls && event.submitter === null && answers.length === 0) { beginSession(); return; }
        if (answers[questionIndex] === undefined) return;
        if (questionIndex < questionsApi.questions.length - 1) { questionIndex++; renderQuestion(); return; }
        if (!questionsApi.validAnswers(answers)) return;
        const initial = questionsApi.resolve(answers);
        appearance.value = initial.appearance;
        foundation.value = initial.settings.foundation ? 'yes' : 'no';
        life.value = initial.settings.life ? 'yes' : 'no'; speech.value = initial.settings.speech;
        openMeeting();
    });
    function openMeeting() {
        screen = 'meeting'; settings.hidden = true;
        signedIdentity = null;
        meetingVoice.textContent = t(speech.value === 'short' ? 'meetingWords' : 'meetingSound');
        meetingGesture.textContent = t({ robot: 'meetingRobot', spirit: 'meetingSpirit', seed: 'meetingSeed' }[appearance.value] || 'meetingOther');
        signatureStrokes = []; activeSignaturePointer = null; meetingRetry.disabled = false;
        meeting.showModal(); prepareMeetingVoice(true); drawSignature(); dialogueVoice.focus({ preventScroll: true }); meeting.scrollTop = 0;
    }
    function pointAt(target, key) {
        if (!debugControls || paused || state?.adventure?.run) return;
        const accepted = worldApi.approach(world, target, 'pointing');
        record('point', { target, accepted, mode: world.mode });
        controlFeedback = { key: accepted ? key : world.mode === 'work' ? 'finish_work' : 'finish_meal', until: performance.now() + 2500 };
        updatePerception();
    }
    point.addEventListener('click', () => pointAt('berry:1', 'pointed_berry'));
    shade.addEventListener('click', () => pointAt('shade', 'pointed_shade'));
    walk?.addEventListener('click', () => pointAt('path', 'join'));
    canvas.addEventListener('click', event => {
        if (state?.adventure?.run) { if (!paused && !exporting) adventureView.stop(); return; }
        if (dungeon) { if (!paused && !exporting) dungeonView.hit(event); return; }
        if (!world || !view.hit || exporting) return;
        const target = view.hit(world, event);
        if (target) pointAt(target, target.startsWith('master:') ? 'pointed_master' : target === 'shade' ? 'pointed_shade' : 'pointed_berry');
    });
    pause.addEventListener('click', () => {
        voice.stop(); previewStars.stop(); liveStars.stop();
        paused = !paused; pause.setAttribute('aria-pressed', String(paused));
        record('pause', { paused });
        send.disabled = paused; point.disabled = paused; shade.disabled = paused;
        if (walk) walk.disabled = paused;
        if (masterVisit) masterVisit.disabled = paused;
    });
    document.addEventListener('visibilitychange', () => { lastFrame = null; });
    [point, shade, walk, masterVisit, pause, voiceChoose].filter(Boolean).forEach(button => button.addEventListener('click', stopAuto));
    canvas.addEventListener('pointerdown', stopAuto);
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim() || document.hidden || paused || growthDialog.open) return;
        if (!automaticSubmission) stopAuto();
        if (!automaticSubmission) adventureView?.stop();
        ++adventureSpeechToken; adventureSpeechPending = false;
        voice.stop();
        updatePerception();
        const starBefore = constellationApi.project(state, catalog);
        // Capture originals at the actual input boundary, not by replaying a fixture later.
        const recording = personalLog?.status();
        const original = (recording?.enabled || recording?.checking) && !recording.paused ? personalLog.snapshot({
            beforeState: state, beforeWorld: world, inputKnowledge: state.knowledge, inputContext: state.context }) : null;
        record(adventureMentorSpeech ? 'master' : 'player', { text: input.value, inputMethod: input.dataset.inputMethod || 'text',
            ...(recognized ? { recognizedText: recognized, recognizedLocale } : {}), context: state.context, situation: { mode: world.mode, attention: world.attention,
            destination: world.destination, hunger: world.hunger, fatigue: world.fatigue } });
        if (dungeon) dungeonView.stop();
        const dungeonResult = dungeon ? window.ExperimentalWordDungeonLearning.receive(dungeon, input.value, catalog, window.GameI18n.language) : null;
        const result = dungeonResult?.result || api.receive(state, input.value, catalog, { locale: window.GameI18n.language, body: world, speaker: adventureMentorSpeech || 'player' });
        record('understanding', { result });
        const message = node('p', input.value, conversation);
        message.dataset.speaker = automaticSubmission ? 'auto' : 'player'; message.setAttribute('data-i18n-skip', '');
        if (automaticSubmission) message.textContent = displayText(adventureMentorSpeech ? 'master_'+adventureMentorSpeech.split(':')[1] : 'autoTeacher') + ': ' + input.value;
        let reply;
        if (dungeon) {
            const u = result.understandings.at(-1), link = state.knowledge.associations.find(a => a.target === u.target?.adopted?.id
                && a.speaker === result.input.speaker && a.evidence.some(e => !e.retractedBy));
            const learnedName = result.learning.flatMap(item => item.updated).at(-1);
            reply = dungeonResult.reply || { message: !u.complete ? dungeonResult.kind === 'warning' ? 'dungeonUnknown' : 'dungeonUnparsed' : dungeonResult.learned ? 'dungeonLearned'
                : dungeonResult.kind === 'avoid' ? 'dungeonAvoid'
                : dungeonResult.kind === 'go' ? dungeon.complete ? 'dungeonArrived'
                    : dungeon.last?.reason === 'diverged' ? 'dungeonDiverged' : 'dungeonObey'
                : u.kind === 'greeting' ? 'good_morning' : learnedName || link && ['reference', 'question'].includes(u.kind) ? 'name_echo'
                : ['request', 'invitation'].includes(u.kind) ? 'dungeonLimit' : result.expression.message,
                ...(learnedName || link ? { word: learnedName?.word || link.word } : {}) };
            if (state.settings.speech !== 'short' && !result.identityReply) reply = { message: 'attend' };
            updateDungeonStatus(); dungeonView.refresh();
        } else reply = adventureApi && state.adventure ? adventureApi.receive(state, world, result, window.GameI18n.language, adventureLabelOnly) || worldApi.respond(world, result, state, catalog)
            : worldApi.respond(world, result, state, catalog);
        growthApi.observe(state, world, result, null, reply);
        if (original) personalLog.record('interaction', { result, receipt: { ...original, input: result.input,
            afterState: state, afterWorld: world, reply } });
        showReply(reply);
        if(adventureMentorSpeech) holdAdventureSpeech(() => voice.speakScene([
            {text:input.value,role:'master',master:adventureMentorSpeech.split(':')[1]},
            {text:bubble.textContent,role:'narration'}
        ]));
        const trace = constellationApi.capture(starBefore, constellationApi.project(state, catalog, [result]), result, reply, bubble.textContent, state.context.lastOutput);
        starTraces.push(trace); if (starTraces.length > 24) starTraces.shift();
        conversation.append(tracePreview); tracePreview.hidden = false; tracePreview.open = true; previewStars.refresh(trace.id);
        app.classList.add('constellation-trace-ready');
        conversation.scrollTop = conversation.scrollHeight;
        const inspect = node('button', constellationApi.messages.history, conversation); inspect.type = 'button'; inspect.className = 'word-trace-open';
        message.after(inspect);
        inspect.dataset.traceId = trace.id;
        inspect.addEventListener('click', openStarTrace.bind(null, trace.id, undefined));
        for (const b of conversation.querySelectorAll('[data-trace-id]')) b.disabled = !starTraces.some(t => t.id === b.dataset.traceId);
        if (dungeonResult?.reply && state.settings.speech !== 'short') {
            const guidance = node('p', t(dungeonResult.reply.message), conversation); guidance.className = 'conversation-help';
            if (dungeonResult.reply.literal) node('span', dungeonResult.reply.literal, guidance).setAttribute('data-i18n-skip', '');
            record('guidance', { key: dungeonResult.reply.message, literal: dungeonResult.reply.literal || '' });
        }
        window.ExperimentalWordNotebook.rememberQuestion(state, result, reply);
        const partialReportExplained = result.understandings.length === 1
            && ['heard_feeling_partial', 'heard_event_partial'].includes(reply.message);
        const hint = dungeonResult ? null : result.learning.some(item => item.updated.length) ? 'receivedName'
            : !result.lifeLearning && !result.relationLearning && !result.feelingLearning && !partialReportExplained && result.understandings.some(item => !item.complete) ? 'receivedPartial' : null;
        if (hint) { const feedback = node('p', t(hint), conversation); feedback.className = 'conversation-help'; }
        if (hint) record('guidance', { key: hint, text: displayText(hint) });
        renderNotebook();
        if (!stars.hidden) liveStars.refresh();
        trace.textContent = JSON.stringify({ result, knowledge: state.knowledge, records: state.records }, null, 2);
        input.value = ''; input.focus(); conversation.scrollTop = conversation.scrollHeight;
        recognized = ''; recognizedLocale = null; delete input.dataset.inputMethod;
        save();
    });
    Promise.all(['experimental_word_learning_catalog.json', 'experimental_word_learning_visuals.json'].map(file =>
        fetch(file).then(response => { if (!response.ok) throw new Error('Load failed'); return response.json(); })
    )).then(([data, visuals]) => {
        catalog = adventureApi ? adventureApi.language(data) : data;
        dungeonVisuals = visuals;
        meetingVisuals = visuals;
        const feelingForms = catalog.feelingTeaching[window.GameI18n.language];
        const feelingPair = catalog.feelingContrast[window.GameI18n.language];
        if (feelingForms && feelingPair) {
            node('p', t('feeling_guide'), guide);
            const full = feelingPair.past + feelingPair.join + feelingPair.present;
            const examples = [full, feelingForms.source + '«' + full + '»',
                feelingForms.sad + '«' + feelingPair.past + '»', feelingForms.happy + '«' + feelingPair.present + '»',
                feelingForms.report + '«' + feelingPair.past + '»', feelingForms.report + '«' + feelingPair.present + '»',
                feelingForms.yesterday + '«' + feelingPair.past + '»', feelingForms.now + '«' + feelingPair.present + '»'];
            for (const text of examples) node('p', text, guide).setAttribute('data-i18n-skip', '');
            const contrastForms = catalog.contrastTeaching[window.GameI18n.language];
            if (contrastForms) {
                node('p', t('contrast_guide'), guide);
                for (const stage of ['retain', 'difference', 'noncausal']) {
                    node('p', contrastForms[stage] + '«' + full + '»', guide).setAttribute('data-i18n-skip', '');
                }
            }
        }
        const correctionForms = catalog.correctionTeaching[window.GameI18n.language];
        if (correctionForms) for (const phase of ['source', 'replacement']) {
            const example = node('p', `${correctionForms[phase]}«${correctionForms[phase === 'source' ? 'exampleSource' : 'exampleReplacement']}»`, guide);
            example.setAttribute('data-i18n-skip', '');
        }
        const locale = window.GameI18n.language, reasonForms = catalog.reasonTeaching[locale];
        if (reasonForms) for (const stage of ['question', 'reason']) for (const kind of ['request', 'invitation']) {
            const example = node('p', `${reasonForms[stage]}「${reasonForms.utterance}」→「${catalog.proposalTeaching[locale][kind].utterance}」`, guide);
            example.setAttribute('data-i18n-skip', '');
        }
        view = new window.ExperimentalWordView(canvas, visuals, () => { imageFailure = true; });
        if (window.wordStorage) {
            try {
                const result = window.wordStorage.load();
                if (!result.ok) throw new Error('load');
                restored = result.value;
                collection = restored?.collection || collectionApi.create();
                if (restored && !restored.pendingNewGame) {
                    // Migrate only the new-mode path, never old-game discovery or guessed past names.
                    collectionApi.join(collection, restored.state, restored.appearance, true);
                }
                if (restored?.pendingNewGame) { environmentVolume = restored.volume; restored = null; }
                if (restored) {
                    environmentVolume = restored.world.island?.volume ?? .5;
                    start.textContent = t('continue');
                    [appearance, foundation, life, speech].forEach(select => { select.disabled = true; });
                    appearance.value = restored.appearance;
                    foundation.value = restored.state.settings.foundation ? 'yes' : 'no';
                    life.value = restored.state.settings.life ? 'yes' : 'no'; speech.value = restored.state.settings.speech;
                }
            } catch (_) {
                saveBlocked = true; saveBadge.textContent = t('saveFailed');
                titleStatus.textContent = t('saveFailed'); titleStatus.hidden = false;
            }
        }
        renderQuestion(); start.disabled ||= saveBlocked; newGame.disabled = saveBlocked;
        if (screen === 'title') continueGame.disabled = !restored || saveBlocked;
        requestAnimationFrame(animate);
    }).catch(() => node('p', t('failed')));
})();
