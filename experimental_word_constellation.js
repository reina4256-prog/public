(function () {
    'use strict';
    // Authored explanation scenes only. No parser, actor, learning, diary or save imports.
    const S = {
        title: '言葉の星座・独立見本',
        guide: '説明用の場面です。ゲーム・本人の記録・知識・保存にはつながっていません。星や線を選ぶと、元の見本記録をたどれます。',
        language: '見本の表示言語', scene: '言葉を受け取る見本場面',
        naming: '名前を教わった後', tasting: '食べて味を知った後', unknown: '知らない味を尋ねられたとき',
        berry: '木の実', eat: '食べる', sweet: '甘い', sour: 'すっぱい',
        replay: '参照の光をもう一度見る',
        legend: '実線：見本記録でつながる言葉。破線：意味がまだ分からない言葉。金色：この場面で参照する道筋。',
        status: '配置・線の意味・光り方・記録の導線は暫定です。光は用意した演出で、本人の内部活動の検証ではありません。',
        incoming: '受け取った言葉（見本）',
        nameInput: '「木の実」', tasteInput: '「木の実は甘かった？」', sourInput: '「すっぱくない？」',
        nameState: '教わった名前から、目の前の実の記録を参照します。味はまだ確かめていません。',
        tasteState: '食べた実と、甘い味を捉えた記録を参照します。',
        sourState: '食べた実の甘い味は参照できます。「すっぱい」の意味は未理解で、否定の答えは作りません。',
        select: '星か線を選んで、つながりの元を見る',
        edge: '{{0}}と{{1}}を結ぶ線', records: '元の見本記録',
        teaching: '教示の記録', experience: '本人の体験を表す見本記録', question: '未理解を含む問いの記録',
        taughtRaw: '目の前の赤い実を指して「これは木の実だよ」と教わった。',
        taughtThen: '当時：この実を指す名前を教わった。食べていないので味は分からない。他の実への広がりも未確認。',
        ateRaw: '名前を教わった実を食べた。甘い味の感覚があった。この見本では、食べる・甘いをこの体験で捉えた。',
        ateThen: '当時：食べた実と甘い味を結び付けた。最初の教示記録に味を後付けしない。',
        askedRaw: '「すっぱくない？」と尋ねられた。',
        askedThen: '当時：甘い味の体験はあるが「すっぱい」は未理解。甘いことを、すっぱくない証明にしない。',
        noRecord: 'この場面では、まだつながる記録がありません。',
        pending: 'まだ意味が分からない言葉',
        back: 'つながりへ戻る',
        light: 'この場面の参照を表示しています。記録や学習は増えません。'
    };
    const nodes = [
        { id: 'berry', x: 27, y: 30 }, { id: 'eat', x: 73, y: 30 },
        { id: 'sweet', x: 50, y: 72 }, { id: 'sour', x: 82, y: 78 }
    ];
    const edges = [
        { id: 'food', from: 'berry', to: 'eat', records: ['ate'] },
        { id: 'taste', from: 'eat', to: 'sweet', records: ['ate'] },
        { id: 'fruitTaste', from: 'berry', to: 'sweet', records: ['ate'] },
        { id: 'unresolved', from: 'sweet', to: 'sour', records: ['asked'], pending: true }
    ];
    const records = {
        taught: { type: 'teaching', raw: 'taughtRaw', then: 'taughtThen', nodes: ['berry'] },
        ate: { type: 'experience', raw: 'ateRaw', then: 'ateThen', nodes: ['berry', 'eat', 'sweet'] },
        asked: { type: 'question', raw: 'askedRaw', then: 'askedThen', nodes: ['sweet', 'sour'] }
    };
    const scenes = {
        naming: { input: 'nameInput', state: 'nameState', nodes: ['berry'], edges: [], records: ['taught'] },
        tasting: { input: 'tasteInput', state: 'tasteState', nodes: ['berry', 'eat', 'sweet'], edges: ['food', 'taste', 'fruitTaste'], records: ['taught', 'ate'] },
        unknown: { input: 'sourInput', state: 'sourState', nodes: ['berry', 'eat', 'sweet'], edges: ['food', 'taste', 'fruitTaste'], records: ['taught', 'ate', 'asked'] }
    };
    const root = document.getElementById('constellation-preview');
    const t = (key, ...args) => window.GameI18n.translate(S[key]).replace(/\{\{(\d+)\}\}/g, (_, i) => String(args[Number(i)]));
    let sceneId = 'tasting', selection = null, opened = null, timer;
    const el = (tag, text, parent, className) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        if (parent) parent.append(node);
        return node;
    };
    function button(text, parent, action) {
        const node = el('button', text, parent); node.type = 'button'; node.addEventListener('click', action); return node;
    }
    function selectedRecords() {
        const available = scenes[sceneId].records;
        if (!selection) return available;
        const related = selection.kind === 'edge' ? edges.find(e => e.id === selection.id).records
            : Object.keys(records).filter(id => records[id].nodes.includes(selection.id));
        return related.filter(id => available.includes(id));
    }
    function choose(kind, id) { selection = { kind, id }; opened = null; render(); }
    function renderDetail(panel) {
        const label = !selection ? t('select') : selection.kind === 'node' ? t(selection.id)
            : (() => { const edge = edges.find(e => e.id === selection.id); return t('edge', t(edge.from), t(edge.to)); })();
        el('h2', label, panel);
        if (selection?.id === 'sour' || selection?.id === 'unresolved') el('p', t('pending'), panel);
        el('h3', t('records'), panel);
        const ids = selectedRecords();
        if (!ids.length) el('p', t('noRecord'), panel);
        for (const id of ids) {
            const article = el('article', undefined, panel, 'record'); article.dataset.record = id;
            button(t(records[id].type), article, () => { opened = id; render(); root.querySelector(`[data-record="${id}"]`).scrollIntoView({ block: 'nearest' }); });
            if (opened === id) {
                el('blockquote', t(records[id].raw), article);
                el('p', t(records[id].then), article);
                const links = el('div', undefined, article, 'record-links');
                records[id].nodes.forEach(nodeId => button(t(nodeId), links, () => choose('node', nodeId)));
                button(t('back'), article, () => { opened = null; render(); });
            }
        }
    }
    function replay() {
        clearTimeout(timer);
        const sky = root.querySelector('.sky'); sky.classList.remove('playing');
        void sky.offsetWidth; sky.classList.add('playing');
        root.querySelector('.light-state').textContent = t('light');
        timer = setTimeout(() => sky.classList.remove('playing'), 3700);
    }
    function render() {
        clearTimeout(timer); root.replaceChildren(); document.title = t('title');
        el('h1', t('title'), root); el('p', t('guide'), root, 'guide');
        const controls = el('div', undefined, root, 'controls');
        const language = el('select', undefined, el('label', t('language'), controls)); language.id = 'constellation-language';
        Object.entries(window.GameI18n.languages).forEach(([id, entry]) => { const option = el('option', entry.label, language); option.value = id; });
        language.value = window.GameI18n.language; language.addEventListener('change', () => window.GameI18n.setLanguage(language.value));
        const sceneSelect = el('select', undefined, el('label', t('scene'), controls)); sceneSelect.id = 'constellation-scene';
        Object.keys(scenes).forEach(id => { const option = el('option', t(id), sceneSelect); option.value = id; });
        sceneSelect.value = sceneId;
        sceneSelect.addEventListener('change', () => { sceneId = sceneSelect.value; selection = null; opened = null; render(); replay(); });
        button(t('replay'), controls, replay).id = 'constellation-replay';
        el('p', t('incoming') + '：' + t(scenes[sceneId].input), root);
        const state = el('p', t(scenes[sceneId].state), root, 'state'); state.setAttribute('aria-live', 'polite');
        const layout = el('div', undefined, root, 'layout');
        const sky = el('section', undefined, layout, 'sky'); sky.setAttribute('aria-label', t('title'));
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); sky.append(svg);
        for (const edge of edges) {
            if (edge.pending && sceneId !== 'unknown') continue;
            if (!edge.pending && sceneId === 'naming') continue;
            const a = nodes.find(n => n.id === edge.from), b = nodes.find(n => n.id === edge.to);
            const group = document.createElementNS(ns, 'g'); group.dataset.edge = edge.id;
            group.setAttribute('class', 'edge' + (edge.pending ? ' pending' : '') + (scenes[sceneId].edges.includes(edge.id) ? ' active' : '') + (selection?.id === edge.id ? ' selected' : ''));
            group.setAttribute('role', 'button'); group.setAttribute('tabindex', '0'); group.setAttribute('aria-label', t('edge', t(edge.from), t(edge.to)));
            group.setAttribute('aria-pressed', String(selection?.kind === 'edge' && selection.id === edge.id));
            for (const cls of ['hit', 'thread', 'spark']) {
                const line = document.createElementNS(ns, 'line'); line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
                line.setAttribute('class', cls); line.setAttribute('pathLength', '100'); line.setAttribute('vector-effect', 'non-scaling-stroke'); group.append(line);
            }
            group.addEventListener('click', () => choose('edge', edge.id));
            group.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); choose('edge', edge.id); root.querySelector(`[data-edge="${edge.id}"]`).focus(); } }); svg.append(group);
        }
        for (const node of nodes) {
            if (sceneId === 'naming' && node.id !== 'berry') continue;
            if (sceneId !== 'unknown' && node.id === 'sour') continue;
            const star = button(t(node.id), sky, () => { choose('node', node.id); root.querySelector(`[data-node="${node.id}"]`).focus(); });
            star.dataset.node = node.id; star.className = 'star' + (scenes[sceneId].nodes.includes(node.id) ? ' active' : '') + (node.id === 'sour' ? ' pending' : '');
            star.style.left = node.x + '%'; star.style.top = node.y + '%'; star.setAttribute('aria-pressed', String(selection?.kind === 'node' && selection.id === node.id));
        }
        const panel = el('section', undefined, layout, 'detail'); renderDetail(panel);
        el('p', t('legend'), root, 'legend');
        const light = el('p', '', root, 'light-state'); light.setAttribute('aria-live', 'polite');
        el('p', t('status'), root, 'guide');
    }
    window.addEventListener('game-language-changed', render);
    render(); replay();
})();
