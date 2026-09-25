(function () {
    'use strict';
    const api = window.ExperimentalWordLearning;
    const app = document.getElementById('app');
    const labels = {
        bodyHunger: '空腹',
        bodyEnergy: '体力',
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
        playGuideText: '指さしたものに近づいたら、呼び方を教えてみてください。短い声かけを一つずつ。食べたり休んだりしたあとにも、ノートに経験が残ります。',
        noteGuide: 'この子に残った経験や考えを、読める文にしています。開いたり読み返したりしても、学習は増えません。',
        receivedName: '呼び方として受け取りました。ノートで確かめられます。',
        receivedPartial: '今回の声かけは、まだ十分には伝わっていません。短く言い換えたり、指さしてから話しかけたりしてみてください。',
        autosave: '試作・自動保存', continue: 'この子との暮らしを続ける',
        savedNotice: '暮らしと学習は、この試作専用に自動保存します。不在中は時間を進めません。',
        saveFailed: '保存を停止しました。以前のデータは残しています。',
        notice: 'この子を見守りながら、気になったことを話しかけてみてください。今は保存できません。ページを閉じたり再読み込みすると、この時間は失われます。',
        intro: '歩いたり、立ち止まったり。あなたの言葉と、この子の経験が少しずつつながります。',
        appearance: '出会う子の姿', robot: 'ロボット', spirit: '精霊', seed: '植物',
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
    const settings = node('form');
    const appearance = select(settings, 'appearance', [['robot', 'robot'], ['spirit', 'spirit'], ['seed', 'seed']]);
    const foundation = select(settings, 'foundation', [['yes', 'foundationOn'], ['no', 'foundationOff']]);
    const life = select(settings, 'life', [['yes', 'lifeOn'], ['no', 'lifeOff']]);
    const speech = select(settings, 'speech', [['short', 'short'], ['gesture', 'gesture']]);
    const start = node('button', t('start'), settings);
    start.disabled = true;
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
        volume.addEventListener('input', () => { if (world) { view.volume(world, Number(volume.value)); save(); } });
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
            for (const entry of items.slice(-noteLimit).reverse()) {
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
        record('character', { reply, text: (reply.word && ['name_echo', 'name_known'].includes(reply.message) ? reply.word : '') + displayText(reply.message) });
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
        }
        world.speech = { until: world.elapsed + 7, target: reply.target || null };
        if (reply.target) { world.reaction = 'recognize'; world.reactionTime = 5; }
        conversation.scrollTop = conversation.scrollHeight;
    }
    function animate(time) {
        const dt = lastFrame === null ? 0 : (time - lastFrame) / 1000; lastFrame = time;
        if (world && view && !document.hidden) {
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
    settings.addEventListener('submit', event => {
        event.preventDefault();
        state = restored?.state || api.create({ foundation: foundation.value === 'yes', life: life.value === 'yes', speech: speech.value }, catalog);
        world = restored?.world || worldApi.create();
        if (restored) appearance.value = restored.appearance;
        view.start?.(world, appearance.value);
        if (volume) volume.value = String(world.island.volume ?? .5);
        updatePerception();
        report = window.ExperimentalWordReport.create({ state, world, appearance: appearance.value, locale: window.GameI18n.language, resumed: !!restored });
        settings.hidden = true; setupCopy.hidden = true; session.hidden = false;
        app.classList.add('playing'); input.focus({ preventScroll: true });
        save();
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
        const reply = worldApi.respond(world, result, state);
        showReply(reply);
        window.ExperimentalWordNotebook.rememberQuestion(state, result, reply);
        const hint = result.learning.some(item => item.updated.length) ? 'receivedName'
            : result.understandings.some(item => !item.complete) ? 'receivedPartial' : null;
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
        view = new window.ExperimentalWordView(canvas, visuals, () => { imageFailure = true; });
        if (window.wordStorage) {
            try {
                const result = window.wordStorage.load();
                if (!result.ok) throw new Error('load');
                restored = result.value;
                if (restored) {
                    start.textContent = t('continue');
                    [appearance, foundation, life, speech].forEach(select => { select.disabled = true; });
                    appearance.value = restored.appearance;
                    foundation.value = restored.state.settings.foundation ? 'yes' : 'no';
                    life.value = restored.state.settings.life ? 'yes' : 'no'; speech.value = restored.state.settings.speech;
                }
            } catch (_) { saveBlocked = true; saveBadge.textContent = t('saveFailed'); }
        }
        start.disabled = false; requestAnimationFrame(animate);
    }).catch(() => node('p', t('failed')));
})();
