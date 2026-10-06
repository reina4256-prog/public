(function () {
    'use strict';
    // Authored display fixtures only. No world/notebook/save modules or impression selection.
    const S = {
        title: '日記帳の見た目・独立見本',
        guide: 'これは外観だけの見本です。本人の記録・経験・知識・保存とはつながっていません。見本の切替は、本人の絵を選ぶ操作ではありません。',
        language: '見本の表示言語', sample: '表示する見本ページ',
        berry: '見本：木の実を食べた日', net: '見本：網の結び目がほどけた日',
        naming: '見本：実を見ながら名前を教わった日', heard: '見本：話を聞いた日（絵なし）',
        partial: '見本：まだ一日の途中（絵なし）', long: '見本：長い日の続きページ',
        day: '{{0}}月{{1}}日', continued: '{{0}}月{{1}}日・続き',
        dateGuide: '日付も見本です。ゲーム内の暦とはつながっていません。',
        selfRobot: '見本：自分の姿（ロボット）', selfDragon: '見本：自分の姿（ドラゴン）',
        meeting: '見本：農家の師匠と会った日',
        selfRobotText: '自分の頭には、二本のアンテナがある。胸には四角いところがある。自分の姿を描いてみた。',
        selfDragonText: '自分には角と羽としっぽがある。羽を広げてみた。自分の姿を描いてみた。',
        meetingText: '農家の師匠に会った。麦わら帽子をかぶっていた。手には長い道具を持っていた。畑で、その道具を動かすところを見た。',
        page: '{{0}} / {{1}} ページ', previous: '前の見本ページ', next: '次の見本ページ',
        unfinished: '一日の途中の見本。絵の場所は、まだ空欄です。',
        noDrawing: '絵の候補がない日の見本。本文だけを残します。',
        drawing: '素朴な絵の見本：{{0}}',
        status: '共通の描線と紙面は暫定です。日付時計・本文の採用・印象の比較・本人の絵の選択・保存は未接続です。',
        berryText: '赤い実を見つけた。食べると甘かった。もう一つ食べた実は、少しすっぱかった。',
        netText: '網の結び目をまねしてみた。引っぱると、ほどけた。どこが違ったのか、まだ分からない。',
        namingText: '目の前の赤い実を「木の実」と教わった。この実を指す名前は教わったけれど、ほかの実も同じ名前なのかは、まだ確かめていない。',
        heardText: '師匠が、網の結び目について話してくれた。話は聞いたけれど、今日は網を見たり、結んだりしていない。',
        partialText: '実を見つけた。名前を教わった。味は、まだ確かめていない。',
        longA: '朝、赤い実を見つけた。近くで見ると、小さな点があった。',
        longB: '実を見ながら名前を教わった。ほかの実にも使える名前なのかは、まだ分からない。',
        longC: '一つ食べた。甘かった。次の実は少しすっぱかった。同じ色でも、味は少し違った。',
        longD: '網の結び目を見た。まねして結ぶと、引っぱったときにほどけた。もう一度、師匠の手元を見た。',
        longE: 'もう一度結んだ。今度は引っぱっても、ほどけなかった。最初に結んだものとの違いは、まだうまく説明できない。',
        longF: '夕方、朝の実をもう一度見た。食べていない実の味は分からない。今日、確かめたことをここに残しておく。'
    };
    const fixtures = [
        { id: 'berry', day: 1, drawing: 'berry', text: ['berryText'] },
        { id: 'net', day: 2, drawing: 'net', text: ['netText'] },
        { id: 'naming', day: 3, drawing: 'berry', text: ['namingText'] },
        { id: 'heard', day: 4, drawing: null, text: ['heardText'] },
        { id: 'partial', day: 5, drawing: null, text: ['partialText'] },
        // Expanded layout stress fixture, not a proposal for real record aggregation.
        { id: 'long', day: 6, drawing: 'net', text: Array.from({ length: 4 }, () => ['longA', 'longB', 'longC', 'longD', 'longE', 'longF']).flat() },
        { id: 'selfRobot', day: 7, drawing: 'robot', text: ['selfRobotText'] },
        { id: 'selfDragon', day: 8, drawing: 'dragon', text: ['selfDragonText'] },
        { id: 'meeting', day: 9, drawing: 'meeting', text: ['meetingText'] }
    ];
    const root = document.getElementById('diary-preview');
    const t = (key, ...values) => window.GameI18n.translate(S[key]).replace(/\{\{(\d+)\}\}/g, (_, index) => String(values[Number(index)]));
    function element(tag, text, parent, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        if (parent) parent.append(node);
        return node;
    }
    let sampleId = 'berry', pageIndex = 0, pages = [];
    let book, previous, next, counter;
    function draw(canvas, kind) {
        const c = canvas.getContext('2d');
        c.scale(2, 2); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 2.4;
        // Deterministic uneven pencil paths; rereading never redraws a different subject.
        function line(points, color = '#75654c') {
            c.strokeStyle = color; c.beginPath();
            points.forEach(([x, y], i) => {
                if (!i) { c.moveTo(x, y); return; }
                const [px, py] = points[i - 1], steps = Math.max(2, Math.ceil(Math.hypot(x - px, y - py) / 7));
                for (let j = 1; j <= steps; j++) {
                    const f = j / steps, wobble = Math.sin((i * 11 + j) * 1.7) * .9;
                    c.lineTo(px + (x - px) * f + wobble, py + (y - py) * f + wobble);
                }
            }); c.stroke();
        }
        function oval(x, y, rx, ry, color, fill) {
            const points = Array.from({ length: 45 }, (_, i) => {
                const a = i * Math.PI / 22; return [x + Math.cos(a) * (rx + Math.sin(i * 2.3)), y + Math.sin(a) * (ry + Math.cos(i * 1.9))];
            });
            if (fill) { c.fillStyle = fill; c.beginPath(); points.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.fill(); }
            line(points, color);
        }
        function robot(x, y, scale = 1) {
            c.save(); c.translate(x, y); c.scale(scale, scale);
            const blue = '#708f9c';
            line([[-31, -45], [-30, -84], [29, -86], [32, -45], [-31, -45]], blue);
            line([[-27, -86], [-31, -104]], blue); oval(-31, -108, 3, 3, blue);
            line([[24, -86], [29, -104]], blue); oval(29, -108, 3, 3, blue);
            oval(-13, -65, 5, 6, blue, '#a9c6cf60'); oval(13, -65, 5, 6, blue, '#a9c6cf60');
            line([[-12, -51], [13, -51]], blue);
            line([[-24, -41], [26, -41], [26, 10], [-25, 10], [-24, -41]], blue);
            line([[-13, -29], [13, -29], [12, -8], [-13, -8], [-13, -29]], blue);
            line([[-25, -31], [-39, -11], [-36, 4]], blue); oval(-36, 7, 5, 6, blue);
            line([[26, -30], [39, -11], [38, 5]], blue); oval(38, 8, 5, 6, blue);
            line([[-15, 11], [-17, 31], [-30, 32], [-30, 37], [-8, 38]], blue);
            line([[14, 11], [17, 31], [29, 32], [30, 37], [9, 38]], blue);
            c.restore();
        }
        function farmer(x, y) {
            c.save(); c.translate(x, y);
            oval(0, -62, 23, 26, '#a98667', '#e5c7a260');
            // Existing master's straw hat, blue overalls and hoe; no encounter-state lookup.
            line([[-24, -82], [-17, -102], [17, -102], [25, -81]], '#b79852');
            oval(0, -81, 39, 7, '#b79852', '#dfcc8650');
            line([[-22, -87], [22, -87]], '#ba7051');
            line([[-18, -74], [-8, -79], [0, -75], [8, -79], [19, -73]], '#746450');
            oval(-9, -62, 1.2, 2, '#746450'); oval(9, -62, 1.2, 2, '#746450');
            line([[-7, -46], [1, -44], [8, -47]], '#746450');
            line([[-20, -35], [-27, 21], [27, 21], [20, -35]], '#aa8b6b');
            line([[-14, -34], [-12, -14], [12, -14], [15, -34]], '#73909c');
            line([[-13, -14], [-15, 20], [15, 20], [13, -14]], '#73909c');
            line([[-20, -28], [-39, -4], [-51, -7]], '#aa8b6b');
            line([[20, -28], [38, -9], [34, 9]], '#aa8b6b');
            line([[-12, 22], [-16, 46], [-26, 48], [-5, 48]], '#746450');
            line([[12, 22], [16, 46], [27, 48], [5, 48]], '#746450');
            line([[-51, -71], [-53, 51]], '#aa8052');
            line([[-55, -73], [-76, -65], [-72, -57], [-52, -65]], '#839094');
            c.restore();
        }
        if (kind === 'berry') {
            line([[190, 161], [218, 104], [247, 70], [276, 53]], '#678350');
            line([[219, 105], [182, 89], [159, 63]], '#678350');
            oval(191, 66, 25, 12, '#6c8851', '#d5dea780');
            oval(258, 87, 27, 11, '#6c8851', '#d5dea780');
            [[171, 115, 23, 26], [212, 141, 24, 23], [259, 119, 21, 25]].forEach(([x, y, rx, ry]) => {
                oval(x, y, rx, ry, '#b55f51', '#e0a18b70');
                [[-6, -7], [8, -3], [-2, 9]].forEach(([dx, dy]) => oval(x + dx, y + dy, 1.1, 1.6, '#aa6650'));
            });
            line([[139, 173], [192, 175], [247, 172], [292, 177]], '#adac83');
        } else if (kind === 'net') {
            for (let i = 0; i < 6; i++) {
                line([[133 + i * 24, 47], [155 + i * 24, 150]], '#84979a');
                line([[128, 52 + i * 19], [278, 48 + i * 20]], '#84979a');
            }
            line([[192, 91], [213, 102], [204, 122], [185, 117], [194, 101], [222, 130], [245, 161]], '#aa8052');
            line([[190, 105], [171, 138], [145, 145], [130, 138]], '#aa8052');
            line([[240, 164], [259, 172], [277, 165]], '#aa8052');
        } else if (kind === 'robot') {
            robot(210, 144);
        } else if (kind === 'meeting') {
            robot(139, 152, .78); farmer(286, 134);
            line([[103, 188], [205, 185], [340, 187]], '#adac83');
        } else if (kind === 'dragon') {
            const grey = '#879097', gold = '#ba9b50';
            line([[181, 99], [132, 61], [124, 103], [143, 90], [151, 115], [174, 101]], gold);
            line([[245, 100], [284, 68], [305, 101], [278, 94], [272, 121], [250, 104]], gold);
            line([[181, 143], [152, 160], [124, 151], [140, 174], [178, 169], [192, 157]], grey);
            oval(216, 124, 34, 43, grey, '#e0ddca50'); oval(222, 127, 17, 31, gold, '#dfcc8650');
            oval(216, 66, 36, 29, grey, '#e0ddca50');
            line([[190, 43], [178, 18], [205, 38]], gold);
            line([[229, 37], [239, 14], [248, 47]], gold);
            oval(205, 64, 3, 5, '#6e929a'); oval(234, 64, 3, 5, '#6e929a');
            line([[210, 80], [222, 83], [236, 79]], grey);
            line([[186, 105], [177, 127], [189, 129]], grey);
            line([[246, 103], [256, 125], [245, 132]], grey);
            line([[200, 158], [191, 182], [214, 182]], grey);
            line([[237, 158], [240, 181], [260, 180]], grey);
        }
    }
    function showPage() {
        pages.forEach((page, i) => { page.hidden = i !== pageIndex; });
        previous.disabled = pageIndex === 0; next.disabled = pageIndex === pages.length - 1;
        counter.textContent = t('page', pageIndex + 1, pages.length);
    }
    function paginate() {
        const fixture = fixtures.find(item => item.id === sampleId);
        const month = ['ja', 'zh-CN'].includes(window.GameI18n.language) ? 4
            : new Intl.DateTimeFormat(window.GameI18n.language, { month: 'long', day: 'numeric', timeZone: 'UTC' })
                .formatToParts(new Date(Date.UTC(2000, 3, fixture.day))).find(part => part.type === 'month').value;
        const text = fixture.text.map(key => t(key)).join('\n\n');
        const units = [...new Intl.Segmenter(window.GameI18n.language, { granularity: 'grapheme' }).segment(text)].map(item => item.segment);
        const vertical = ['ja', 'zh-CN'].includes(window.GameI18n.language);
        const sentenceSegmenter = new Intl.Segmenter(window.GameI18n.language, { granularity: 'sentence' });
        function setText(body, value) {
            if (!vertical) { body.textContent = value; return; }
            body.replaceChildren();
            for (const { segment } of sentenceSegmenter.segment(value)) element('span', segment, body, 'diary-sentence');
        }
        book.replaceChildren(); pages = [];
        let offset = 0;
        while (offset < units.length || pages.length === 0) {
            const first = pages.length === 0;
            const page = element('article', undefined, book, 'diary-page' + (first ? '' : ' continuation'));
            element('h2', t(first ? 'day' : 'continued', month, fixture.day), page, 'date');
            if (first) {
                const canvas = element('canvas', undefined, page, 'drawing'); canvas.width = 840; canvas.height = 410;
                if (fixture.drawing) { canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t('drawing', t(fixture.id))); draw(canvas, fixture.drawing); }
                else canvas.setAttribute('aria-hidden', 'true');
                element('p', fixture.drawing ? '' : t(fixture.id === 'partial' ? 'unfinished' : 'noDrawing'), page, 'blank-caption');
            }
            const body = element('div', '', page, 'diary-text' + (vertical ? ' vertical' : ''));
            let low = 0, high = units.length - offset;
            while (low < high) {
                const mid = Math.ceil((low + high) / 2);
                setText(body, units.slice(offset, offset + mid).join(''));
                if (body.scrollWidth <= body.clientWidth + 1 && body.scrollHeight <= body.clientHeight + 1) low = mid;
                else high = mid - 1;
            }
            // Fixed legible type; never discard text or shrink it to fit.
            let count = Math.max(1, low);
            if (offset + count < units.length) {
                // Prefer a nearby phrase/word boundary; retain the separators verbatim.
                const vertical = body.classList.contains('vertical');
                for (let end = count; end > count * .7; end--) {
                    if ((vertical ? /[。！？\n]/u : /\s/u).test(units[offset + end - 1])) { count = end; break; }
                }
            }
            setText(body, units.slice(offset, offset + count).join('')); offset += count;
            pages.push(page);
        }
        pages.forEach((page, i) => element('p', t('page', i + 1, pages.length), page, 'page-number'));
        pageIndex = Math.min(pageIndex, pages.length - 1); showPage();
    }
    function render() {
        root.replaceChildren(); document.title = t('title');
        element('h1', t('title'), root); element('p', t('guide'), root, 'guide');
        element('p', t('dateGuide'), root, 'guide');
        const controls = element('div', undefined, root, 'controls');
        const languageLabel = element('label', t('language'), controls);
        const language = element('select', undefined, languageLabel); language.id = 'diary-language';
        Object.entries(window.GameI18n.languages).forEach(([id, entry]) => { const option = element('option', entry.label, language); option.value = id; });
        language.value = window.GameI18n.language;
        language.addEventListener('change', () => window.GameI18n.setLanguage(language.value));
        const sampleLabel = element('label', t('sample'), controls);
        const sample = element('select', undefined, sampleLabel); sample.id = 'diary-sample';
        fixtures.forEach(fixture => { const option = element('option', t(fixture.id), sample); option.value = fixture.id; }); sample.value = sampleId;
        sample.addEventListener('change', () => { sampleId = sample.value; pageIndex = 0; paginate(); });
        book = element('section', undefined, root, 'book');
        const navigation = element('nav', undefined, root, 'navigation');
        previous = element('button', t('previous'), navigation); previous.id = 'diary-previous'; previous.type = 'button';
        counter = element('span', '', navigation); counter.setAttribute('aria-live', 'polite');
        next = element('button', t('next'), navigation); next.id = 'diary-next'; next.type = 'button';
        previous.addEventListener('click', () => { if (pageIndex > 0) { pageIndex--; showPage(); } });
        next.addEventListener('click', () => { if (pageIndex < pages.length - 1) { pageIndex++; showPage(); } });
        element('p', t('status'), root, 'status'); paginate();
    }
    window.addEventListener('game-language-changed', render);
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(paginate, 100); });
    document.fonts.addEventListener('loadingdone', () => { if (book) paginate(); });
    document.fonts.ready.then(render);
})();
