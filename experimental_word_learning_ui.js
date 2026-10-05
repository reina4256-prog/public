(function () {
    'use strict';
    const api = window.ExperimentalWordLearning;
    const app = document.getElementById('app');
    const labels = {
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
        bodyHunger: '空腹',
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
        work_label_explore: 'これは荷物を運ぶ手伝いだよ。一緒に運んでみよう。',
        work_label_farming: 'これは畑の石を拾う手伝いだよ。一緒に拾ってみよう。',
        work_label_fishing: 'これは網の破れを直す手伝いだよ。一緒に直してみよう。',
        work_label_cooking: 'これは使った器を洗う手伝いだよ。一緒に洗ってみよう。',
        work_label_smithing: 'これは風を送って火を保つ手伝いだよ。一緒にやってみよう。',
        work_label_building: 'これは図面を書き写す手伝いです。一緒に写してみましょう。',
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
        master_intro_explore: '森を調べているところだよ。荷物を運ぶところ、見ていくかい？',
        master_intro_farming: '畑の石を取り除いているんだ。やってみたくなったら、一緒にやろう。',
        master_intro_fishing: '網の破れを直しているところだ。そばで見ていていいよ。',
        master_intro_cooking: '使った器を洗っているんだ。手伝いたくなったら、やり方を見せるよ。',
        master_intro_smithing: '火に風を送っている。やってみるなら、そばについて教えるぞ。',
        master_intro_building: '図面を書き写しているところです。興味があれば、一緒に線を引いてみましょう。',
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
    let exporting = false;
    let screen = window.WordIslandMode ? 'logo' : 'setup';
    let environmentVolume = .5;
    function record(kind, data) {
        report?.record(kind, { elapsed: world?.elapsed ?? 0, locale: window.GameI18n.language, ...data });
    }
    const displayText = key => window.GameI18n.translate(t(key));
    const worldApi = window.ExperimentalWordWorld;
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
    const drawMeetingFrame = documentFrame(meeting, () => questionsApi.questions.length);
    const meetingHeading = node('h2', t('meetingHeading'), meeting); meetingHeading.id = 'word-meeting-heading';
    meeting.setAttribute('aria-labelledby', meetingHeading.id);
    const meetingCanvas = node('canvas', undefined, meeting); meetingCanvas.width = 300; meetingCanvas.height = 210;
    meetingCanvas.className = 'meeting-character';
    meetingCanvas.setAttribute('aria-hidden', 'true');
    const meetingVoice = node('p', '', meeting), meetingGesture = node('p', '', meeting);
    const signatureLabel = node('label', t('signature'), meeting); signatureLabel.htmlFor = 'word-signature';
    const signatureCanvas = node('canvas', undefined, meeting); signatureCanvas.id = 'word-signature';
    signatureCanvas.width = 720; signatureCanvas.height = 160; signatureCanvas.tabIndex = 0;
    signatureCanvas.setAttribute('aria-label', t('signature'));
    const signatureClear = node('button', t('signatureClear'), meeting); signatureClear.type = 'button'; signatureClear.id = 'word-signature-clear';
    const meetingBegin = node('button', t('meetingBegin'), meeting); meetingBegin.type = 'button'; meetingBegin.id = 'word-meeting-begin';
    const meetingRetry = node('button', t('meetingRetry'), meeting); meetingRetry.type = 'button'; meetingRetry.id = 'word-meeting-retry';
    // Signature is transient ceremony data, never knowledge, experience, or a name.
    // Keeping normalized strokes also preserves the drawing when the layout changes.
    let signatureStrokes = [], activeSignaturePointer = null;
    function drawSignature() {
        const c = signatureCanvas.getContext('2d'); c.clearRect(0, 0, 720, 160);
        c.strokeStyle = '#b0f2ff'; c.fillStyle = '#b0f2ff'; c.lineWidth = 2.8;
        c.lineCap = c.lineJoin = 'round'; c.shadowColor = '#56d8ff'; c.shadowBlur = 7;
        for (const stroke of signatureStrokes) {
            if (stroke.length === 1) { c.beginPath(); c.arc(stroke[0].x*720,stroke[0].y*160,1.4,0,Math.PI*2); c.fill(); }
            else { c.beginPath(); stroke.forEach((p,i) => c[i ? 'lineTo' : 'moveTo'](p.x*720,p.y*160)); c.stroke(); }
        }
        meetingBegin.disabled = signatureStrokes.length === 0 || activeSignaturePointer !== null || screen !== 'meeting';
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
    meeting.addEventListener('cancel', event => event.preventDefault());
    meetingBegin.addEventListener('click', () => {
        if (screen !== 'meeting' || !signatureStrokes.length || activeSignaturePointer !== null) return;
        screen = 'signing'; drawSignature(); meetingRetry.disabled = true;
        meeting.classList.add('signed');
        setTimeout(() => {
            meeting.close(); meeting.classList.remove('signed');
            signatureStrokes = []; drawSignature(); beginSession(); lastFrame = null;
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
    });
    meetingRetry.addEventListener('click', () => {
        if (screen !== 'meeting') return;
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
    node('h2', t('gameTitle'), titleMenu); node('p', t('gameSubtitle'), titleMenu);
    const newGame = node('button', t('newGame'), titleMenu); newGame.id = 'word-new-game'; newGame.disabled = true;
    const continueGame = node('button', t('continueGame'), titleMenu); continueGame.id = 'word-continue'; continueGame.disabled = true;
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
        const pending = { version: 1, pendingNewGame: true, volume: environmentVolume };
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
    session.className = 'living-space';
    const stage = node('div', undefined, session); stage.className = 'stage';
    const canvas = document.getElementById('gameCanvas') || node('canvas', undefined, stage);
    stage.appendChild(canvas); canvas.hidden = false; canvas.width = 900; canvas.height = 470;
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t(window.WordIslandMode ? 'islandLabel' : 'sceneLabel'));
    const bubble = node('div', undefined, stage); bubble.className = 'bubble'; bubble.hidden = true;
    const status = node('p', t('idle'), session); status.className = 'status'; status.setAttribute('aria-live', 'polite');
    const controls = node('div', undefined, session); controls.className = 'scene-controls';
    const debugControls = new URLSearchParams(location.search).get('debug') === '1';
    const navigationControls = node('div', undefined, controls); navigationControls.hidden = !debugControls;
    const point = node('button', t('point'), navigationControls); point.type = 'button';
    const shade = node('button', t('shade'), navigationControls); shade.type = 'button';
    const bodyStatus = node('div', undefined, controls); bodyStatus.className = 'body-status';
    const bodyMeters = ['bodyHunger', 'bodyEnergy'].map(key => {
        const label = node('label', t(key), bodyStatus);
        const meter = node('meter', undefined, label); meter.min = 0; meter.max = 100;
        meter.low = 35; meter.high = 65; meter.optimum = key === 'bodyHunger' ? 0 : 100;
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
    const pause = node('button', t('pause'), controls); pause.type = 'button'; pause.setAttribute('aria-pressed', 'false');
    const exportButton = node('button', t('exportReport'), controls); exportButton.type = 'button';
    exportButton.setAttribute('title', t('reportScope'));
    const reportHelp = node('p', t('reportScope'), setupCopy);
    reportHelp.className = 'intro';
    exportButton.addEventListener('click', async () => {
        if (!report || exporting) return;
        exporting = true; exportButton.disabled = true;
        let feedback;
        try {
            const notes = window.ExperimentalWordNotebook.groupedEntries(state).map(entry => ({ ...entry,
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
    conversationButton.setAttribute('aria-pressed', 'true'); notebookButton.setAttribute('aria-pressed', 'false');
    const panelBody = node('div', undefined, chatPanel); panelBody.className = 'panel-body';
    const conversation = node('div', undefined, panelBody);
    conversation.id = 'conversation'; conversation.setAttribute('role', 'log');
    conversation.setAttribute('aria-live', 'polite');
    const notebook = node('section', undefined, panelBody); notebook.id = 'notebook'; notebook.hidden = true;
    notebook.setAttribute('aria-label', t('notebook'));
    conversationButton.setAttribute('aria-controls', 'conversation'); notebookButton.setAttribute('aria-controls', 'notebook');
    let noteLimit = 12;
    let notebookSignature = '';
    function renderNotebook(force = false) {
        if (!state || notebook.hidden) return;
        const entries = window.ExperimentalWordNotebook.groupedEntries(state);
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
        notebook.hidden = !open; conversation.hidden = open;
        notebookButton.setAttribute('aria-pressed', String(open)); conversationButton.setAttribute('aria-pressed', String(!open));
        if (open) renderNotebook(true);
        else conversation.scrollTop = conversation.scrollHeight;
    }
    notebookButton.addEventListener('click', () => setNotebook(true));
    conversationButton.addEventListener('click', () => setNotebook(false));
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
    node('small', t('inputHint'), form);
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
    function save() {
        if (!window.wordStorage || !state || saveBlocked) return;
        try {
            const result = window.wordStorage.save({ version: 1, appearance: appearance.value, state, world });
            if (!result.ok) throw new Error('save');
        } catch (_) { saveBlocked = true; saveBadge.textContent = t('saveFailed'); }
    }
    setInterval(save, 5000);
    window.addEventListener('beforeunload', save);
    function updatePerception() {
        api.perceive(state, worldApi.perception(world));
    }
    function showReply(reply) {
        if (reply.npc) {
            const line = node('p', undefined, conversation); line.className = 'master-line';
            node('strong', t(`master_${reply.master}`), line); node('br', undefined, line);
            node('span', t(reply.npc), line);
            record('master', { master: reply.master, message: reply.npc, text: displayText(reply.npc) });
        }
        record('character', { reply, text: (reply.word && ['name_echo', 'name_known'].includes(reply.message) ? reply.word : '') + displayText(reply.message) + (reply.literal || '') });
        bubble.replaceChildren(); bubble.hidden = false;
        const line = node('p', undefined, conversation);
        if (reply.observation) line.className = 'observation-line';
        if (reply.message === 'name_echo' || reply.message === 'name_known') {
            const name = node('span', reply.word, bubble); name.setAttribute('data-i18n-skip', '');
            node('span', t(reply.message), bubble);
            const logName = node('span', reply.word, line); logName.setAttribute('data-i18n-skip', '');
            node('span', t(reply.message), line);
        } else {
            node('span', t(reply.message), bubble); line.textContent = t(reply.message);
            if (reply.literal) for (const parent of [bubble, line]) {
                const quotation = node('span', reply.literal, parent); quotation.setAttribute('data-i18n-skip', '');
            }
        }
        world.speech = { until: world.elapsed + 7, target: reply.target || null };
        if (reply.target) { world.reaction = 'recognize'; world.reactionTime = 5; }
        conversation.scrollTop = conversation.scrollHeight;
    }
    function animate(time) {
        drawLogo(time);
        drawMeeting(time);
        const dt = lastFrame === null ? 0 : (time - lastFrame) / 1000; lastFrame = time;
        if (world && view && screen === 'playing' && !document.hidden) {
            const holding = paused || exporting || !!input.value.trim();
            [world.hunger, 1 - world.fatigue].forEach((value, index) => {
                const percent = Math.round(value * 100);
                bodyMeters[index].meter.value = percent;
                bodyMeters[index].value.textContent = `${percent}%`;
            });
            const event = worldApi.tick(world, dt, holding);
            if (event) record('life', { event });
            updatePerception();
            const spontaneous = worldApi.onArrival(world, state, event);
            if (spontaneous) showReply(spontaneous);
            if (event) renderNotebook();
            if (world.speech && world.elapsed > world.speech.until) bubble.hidden = true;
            const feedback = controlFeedback && time < controlFeedback.until ? controlFeedback.key : null;
            const key = imageFailure ? 'imagesFailed' : paused ? 'paused' : feedback || (input.value.trim() ? 'typing' : world.mode === 'observe'
                ? (world.attention?.startsWith('berry:') ? 'looking' : 'idle') : world.mode);
            point.setAttribute('aria-pressed', String(world.mode === 'move' && world.destination === 'berry:1'));
            shade.setAttribute('aria-pressed', String(world.mode === 'move' && world.destination === 'shade'));
            if (key !== lastStatus) { status.textContent = t(key); lastStatus = key; }
            view.draw(world, appearance.value, matchMedia('(prefers-reduced-motion: reduce)').matches);
            const scale = Math.min(canvas.clientWidth / canvas.width, canvas.clientHeight / canvas.height);
            const position = view.bubblePosition?.() || { x: world.x, y: world.y - .39 };
            bubble.style.left = `${(canvas.clientWidth - canvas.width * scale) / 2 + Math.max(.23, Math.min(.77, position.x)) * canvas.width * scale}px`;
            bubble.style.top = `${(canvas.clientHeight - canvas.height * scale) / 2 + Math.max(.05, position.y) * canvas.height * scale}px`;
        }
        requestAnimationFrame(animate);
    }
    function beginSession() {
        if (!catalog || screen === 'playing' || saveBlocked) return;
        state = restored?.state || api.create({ foundation: foundation.value === 'yes', life: life.value === 'yes', speech: speech.value }, catalog);
        const newMeeting = !restored && questionsApi.validAnswers(answers);
        if (newMeeting) state.startOrigin = { version: 4, answers: answers.slice() };
        world = restored?.world || worldApi.create();
        if (restored) appearance.value = restored.appearance;
        view.start?.(world, appearance.value);
        if (!restored && volume) view.volume(world, environmentVolume);
        if (volume) volume.value = String(world.island.volume ?? .5);
        updatePerception();
        report = window.ExperimentalWordReport.create({ state, world, appearance: appearance.value, locale: window.GameI18n.language, resumed: !!restored });
        settings.hidden = true; setupCopy.hidden = true; session.hidden = false;
        titleScreen.hidden = true; screen = 'playing';
        app.classList.remove('title-active');
        app.classList.remove('onboarding-active');
        app.classList.add('playing'); input.focus({ preventScroll: true });
        save();
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
        screen = 'meeting'; settings.hidden = true;
        meetingImage = new Image(); meetingImage.src = meetingVisuals[appearance.value].image;
        meetingImage.onerror = () => { imageFailure = true; };
        meetingVoice.textContent = t(initial.settings.speech === 'short' ? 'meetingWords' : 'meetingSound');
        meetingGesture.textContent = t({ robot: 'meetingRobot', spirit: 'meetingSpirit', seed: 'meetingSeed' }[appearance.value] || 'meetingOther');
        signatureStrokes = []; activeSignaturePointer = null; meetingRetry.disabled = false;
        meeting.showModal(); drawMeetingFrame(); drawSignature(); signatureCanvas.focus();
    });
    function pointAt(target, key) {
        if (!debugControls || paused) return;
        const accepted = worldApi.approach(world, target, 'pointing');
        record('point', { target, accepted, mode: world.mode });
        controlFeedback = { key: accepted ? key : world.mode === 'work' ? 'finish_work' : 'finish_meal', until: performance.now() + 2500 };
        updatePerception();
    }
    point.addEventListener('click', () => pointAt('berry:1', 'pointed_berry'));
    shade.addEventListener('click', () => pointAt('shade', 'pointed_shade'));
    walk?.addEventListener('click', () => pointAt('path', 'join'));
    canvas.addEventListener('click', event => {
        if (!world || !view.hit || exporting) return;
        const target = view.hit(world, event);
        if (target) pointAt(target, target.startsWith('master:') ? 'pointed_master' : target === 'shade' ? 'pointed_shade' : 'pointed_berry');
    });
    pause.addEventListener('click', () => {
        paused = !paused; pause.setAttribute('aria-pressed', String(paused));
        record('pause', { paused });
        send.disabled = paused; point.disabled = paused; shade.disabled = paused;
        if (walk) walk.disabled = paused;
        if (masterVisit) masterVisit.disabled = paused;
    });
    document.addEventListener('visibilitychange', () => { lastFrame = null; });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!input.value.trim() || document.hidden || paused) return;
        updatePerception();
        record('player', { text: input.value, context: state.context, situation: { mode: world.mode, attention: world.attention,
            destination: world.destination, hunger: world.hunger, fatigue: world.fatigue } });
        const result = api.receive(state, input.value, catalog, { locale: window.GameI18n.language });
        record('understanding', { result });
        const message = node('p', input.value, conversation);
        message.dataset.speaker = 'player'; message.setAttribute('data-i18n-skip', '');
        const reply = worldApi.respond(world, result, state, catalog);
        showReply(reply);
        window.ExperimentalWordNotebook.rememberQuestion(state, result, reply);
        const partialReportExplained = result.understandings.length === 1
            && ['heard_feeling_partial', 'heard_event_partial'].includes(reply.message);
        const hint = result.learning.some(item => item.updated.length) ? 'receivedName'
            : !result.lifeLearning && !result.relationLearning && !result.feelingLearning && !partialReportExplained && result.understandings.some(item => !item.complete) ? 'receivedPartial' : null;
        if (hint) { const feedback = node('p', t(hint), conversation); feedback.className = 'conversation-help'; }
        if (hint) record('guidance', { key: hint, text: displayText(hint) });
        renderNotebook();
        trace.textContent = JSON.stringify({ result, knowledge: state.knowledge, records: state.records }, null, 2);
        input.value = ''; input.focus(); conversation.scrollTop = conversation.scrollHeight;
        save();
    });
    Promise.all(['experimental_word_learning_catalog.json', 'experimental_word_learning_visuals.json'].map(file =>
        fetch(file).then(response => { if (!response.ok) throw new Error('Load failed'); return response.json(); })
    )).then(([data, visuals]) => {
        catalog = data;
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
