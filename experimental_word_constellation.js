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
        light: 'この場面の参照を表示しています。記録や学習は増えません。',
        expanded: 'つながりが増えた星座',
        expandedInput: '「木の実には、どんな味があった？」',
        expandedState: '別々の実の甘い味・すっぱい味の見本記録を参照します。星を選ぶと、その言葉につながる周囲が見やすくなります。',
        red: '赤い', tree: '木', shade: '木陰', rest: '休む', tired: '疲れた',
        net: '網', knot: '結び目', pull: '引っぱる',
        sourRaw: '別の木の実を食べた。すっぱい味の感覚があった。この見本では、この体験ですっぱいを捉えた。',
        sourThen: '当時：この実のすっぱい味を捉えた。前の実の甘い味とは別の体験。未熟だったからという理由は未確認。',
        treeRaw: '木の枝に赤い木の実があるところを見た。',
        treeThen: '当時：この木と赤い実を見た。すべての木や実についての結論ではない。',
        restRaw: '木のそばの木陰で休んだ。休む前より疲れが軽くなった。',
        restThen: '当時：この木陰での休息と疲れの変化を捉えた。木の実の味の記録とは別の体験。',
        netRaw: '網の結び目を結んで引っぱるところを見た。',
        netThen: '当時：網・結び目・引っぱるを見た場面として残す。食事や休息の記録には混ぜない。',
        zoomIn: '拡大', zoomOut: '縮小', overview: '全体を見る',
        moveLeft: '左へ見る', moveRight: '右へ見る', moveUp: '上へ見る', moveDown: '下へ見る',
        navigation: '星座の移動と拡大縮小',
        panGuide: '空いている場所をドラッグして移動。ホイールやボタンで拡大縮小できます。星を選ぶと周囲に注目し、ほかの星と線も薄く残します。',
        focus: '注目している言葉：{{0}}'
    };
    const nodes = [
        { id: 'berry', x: 27, y: 30 }, { id: 'eat', x: 73, y: 30 },
        { id: 'sweet', x: 50, y: 72 }, { id: 'sour', x: 82, y: 78 }
    ];
    const expandedNodes = [
        { id:'red', x:18, y:10 }, { id:'tree', x:50, y:10 }, { id:'shade', x:82, y:10 },
        { id:'sweet', x:18, y:30 }, { id:'berry', x:50, y:30 }, { id:'rest', x:82, y:30 },
        { id:'sour', x:18, y:50 }, { id:'eat', x:50, y:50 }, { id:'tired', x:82, y:50 },
        { id:'net', x:18, y:80 }, { id:'knot', x:50, y:80 }, { id:'pull', x:82, y:80 }
    ];
    const edges = [
        { id: 'food', from: 'berry', to: 'eat', records: ['ate'] },
        { id: 'taste', from: 'eat', to: 'sweet', records: ['ate'] },
        { id: 'fruitTaste', from: 'berry', to: 'sweet', records: ['ate'] },
        { id: 'unresolved', from: 'sweet', to: 'sour', records: ['asked'], pending: true }
    ];
    const expandedEdges = [
        { id:'food', from:'berry', to:'eat', records:['ate','ateSour'] },
        { id:'taste', from:'eat', to:'sweet', records:['ate'] },
        { id:'fruitTaste', from:'berry', to:'sweet', records:['ate'] },
        { id:'sourTaste', from:'berry', to:'sour', records:['ateSour'] },
        { id:'eatenSour', from:'eat', to:'sour', records:['ateSour'] },
        { id:'fruitRed', from:'berry', to:'red', records:['sawTree'] },
        { id:'fruitTree', from:'berry', to:'tree', records:['sawTree'] },
        { id:'redTree', from:'red', to:'tree', records:['sawTree'] },
        { id:'treeShade', from:'tree', to:'shade', records:['rested'] },
        { id:'shadeRest', from:'shade', to:'rest', records:['rested'] },
        { id:'restTired', from:'rest', to:'tired', records:['rested'] },
        { id:'netKnot', from:'net', to:'knot', records:['sawNet'] },
        { id:'knotPull', from:'knot', to:'pull', records:['sawNet'] }
    ];
    const records = {
        taught: { type: 'teaching', subject:'berry', raw: 'taughtRaw', then: 'taughtThen', nodes: ['berry'] },
        ate: { type: 'experience', subject:'sweet', raw: 'ateRaw', then: 'ateThen', nodes: ['berry', 'eat', 'sweet'] },
        asked: { type: 'question', subject:'sour', raw: 'askedRaw', then: 'askedThen', nodes: ['sweet', 'sour'] },
        ateSour: { type:'experience', subject:'sour', raw:'sourRaw', then:'sourThen', nodes:['berry','eat','sour'] },
        sawTree: { type:'experience', subject:'tree', raw:'treeRaw', then:'treeThen', nodes:['berry','red','tree'] },
        rested: { type:'experience', subject:'rest', raw:'restRaw', then:'restThen', nodes:['tree','shade','rest','tired'] },
        sawNet: { type:'experience', subject:'net', raw:'netRaw', then:'netThen', nodes:['net','knot','pull'] }
    };
    const scenes = {
        naming: { input: 'nameInput', state: 'nameState', nodes: ['berry'], edges: [], records: ['taught'] },
        tasting: { input: 'tasteInput', state: 'tasteState', nodes: ['berry', 'eat', 'sweet'], edges: ['food', 'taste', 'fruitTaste'], records: ['taught', 'ate'] },
        unknown: { input: 'sourInput', state: 'sourState', nodes: ['berry', 'eat', 'sweet'], edges: ['food', 'taste', 'fruitTaste'], records: ['taught', 'ate', 'asked'] },
        expanded: { input:'expandedInput', state:'expandedState', nodes:['berry','eat','sweet','sour'], edges:['food','taste','fruitTaste','sourTaste','eatenSour'], records:['taught','ate','ateSour','sawTree','rested','sawNet'] }
    };
    const root = document.getElementById('constellation-preview');
    const t = (key, ...args) => window.GameI18n.translate(S[key]).replace(/\{\{(\d+)\}\}/g, (_, i) => String(args[Number(i)]));
    const requestedScene = new URLSearchParams(window.location.search).get('scene');
    let sceneId = Object.prototype.hasOwnProperty.call(scenes, requestedScene) ? requestedScene : 'tasting', selection = null, opened = null, timer;
    let view = { x:0, y:0, zoom:1 };
    const visibleNodes = () => sceneId === 'expanded' ? expandedNodes : nodes.filter(node =>
        sceneId === 'naming' ? node.id === 'berry' : sceneId === 'unknown' || node.id !== 'sour');
    const visibleEdges = () => sceneId === 'expanded' ? expandedEdges : edges.filter(edge =>
        edge.pending ? sceneId === 'unknown' : sceneId !== 'naming');
    const findEdge = id => visibleEdges().find(edge => edge.id === id);
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
        const related = selection.kind === 'edge' ? findEdge(selection.id).records
            : Object.keys(records).filter(id => records[id].nodes.includes(selection.id));
        return related.filter(id => available.includes(id));
    }
    function choose(kind, id) { selection = { kind, id }; opened = null; render(); }
    function renderDetail(panel) {
        const label = !selection ? t('select') : selection.kind === 'node' ? t(selection.id)
            : (() => { const edge = findEdge(selection.id); return t('edge', t(edge.from), t(edge.to)); })();
        el('h2', label, panel);
        if ((selection?.id === 'sour' && sceneId === 'unknown') || selection?.id === 'unresolved') el('p', t('pending'), panel);
        el('h3', t('records'), panel);
        const ids = selectedRecords();
        if (!ids.length) el('p', t('noRecord'), panel);
        for (const id of ids) {
            const article = el('article', undefined, panel, 'record'); article.dataset.record = id;
            button(t(records[id].type) + ' · ' + t(records[id].subject), article, () => { opened = id; render(); root.querySelector(`[data-record="${id}"]`).scrollIntoView({ block: 'nearest' }); });
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
    function updateView() {
        const sky = root.querySelector('.sky'), map = root.querySelector('.constellation-map');
        if (!map) return;
        const limitX = sky.clientWidth * (view.zoom - 1) / 2 + sky.clientWidth * .3;
        const limitY = sky.clientHeight * (view.zoom - 1) / 2 + sky.clientHeight * .3;
        view.x = Math.max(-limitX, Math.min(limitX, view.x));
        view.y = Math.max(-limitY, Math.min(limitY, view.y));
        map.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
        map.style.setProperty('--inverse-zoom', String(1 / view.zoom));
        // Camera coordinates are display-only and are never saved or gameplay values.
        map.dataset.view = JSON.stringify(view);
        root.querySelector('#constellation-zoom-out').disabled = view.zoom <= 1;
        root.querySelector('#constellation-zoom-in').disabled = view.zoom >= 3;
    }
    function zoom(factor) { view.zoom = Math.max(1, Math.min(3, view.zoom * factor)); updateView(); }
    function pan(dx, dy) { view.x += dx; view.y += dy; updateView(); }
    function attachNavigation(sky) {
        let drag = null;
        sky.addEventListener('pointerdown', event => {
            if (event.button !== 0 || event.target.closest('button, .edge')) return;
            drag = { id:event.pointerId, x:event.clientX, y:event.clientY };
            sky.setPointerCapture(event.pointerId); sky.classList.add('dragging');
        });
        sky.addEventListener('pointermove', event => {
            if (!drag || event.pointerId !== drag.id) return;
            pan(event.clientX - drag.x, event.clientY - drag.y); drag.x = event.clientX; drag.y = event.clientY;
        });
        const stop = () => { drag = null; sky.classList.remove('dragging'); };
        sky.addEventListener('pointerup', stop); sky.addEventListener('pointercancel', stop); sky.addEventListener('lostpointercapture', stop);
        sky.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive:false });
        sky.addEventListener('keydown', event => {
            if (event.target !== sky) return;
            const movements = { ArrowLeft:[70,0], ArrowRight:[-70,0], ArrowUp:[0,70], ArrowDown:[0,-70] };
            if (movements[event.key]) { event.preventDefault(); pan(...movements[event.key]); }
            else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.25); }
            else if (event.key === '-') { event.preventDefault(); zoom(.8); }
        });
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
        sceneSelect.addEventListener('change', () => { sceneId = sceneSelect.value; selection = null; opened = null; view = {x:0,y:0,zoom:1}; render(); replay(); });
        button(t('replay'), controls, replay).id = 'constellation-replay';
        el('p', t('incoming') + '：' + t(scenes[sceneId].input), root);
        const state = el('p', t(scenes[sceneId].state), root, 'state'); state.setAttribute('aria-live', 'polite');
        const layout = el('div', undefined, root, 'layout');
        const mapPanel = el('section', undefined, layout, 'map-panel');
        const navigation = el('div', undefined, mapPanel, 'map-controls'); navigation.setAttribute('role','group'); navigation.setAttribute('aria-label', t('navigation'));
        button(t('zoomIn'), navigation, () => zoom(1.25)).id = 'constellation-zoom-in';
        button(t('zoomOut'), navigation, () => zoom(.8)).id = 'constellation-zoom-out';
        button(t('overview'), navigation, () => { selection = null; opened = null; view = {x:0,y:0,zoom:1}; render(); }).id = 'constellation-overview';
        const moves = el('div', undefined, mapPanel, 'map-controls');
        for (const [key, dx, dy] of [['moveLeft',70,0],['moveRight',-70,0],['moveUp',0,70],['moveDown',0,-70]]) button(t(key), moves, () => pan(dx,dy)).id = 'constellation-' + key;
        el('p', t('panGuide'), mapPanel, 'guide');
        if (selection?.kind === 'node') el('p', t('focus',t(selection.id)), mapPanel, 'focus-state');
        const sky = el('section', undefined, mapPanel, 'sky' + (sceneId === 'expanded' ? ' expanded' : '')); sky.setAttribute('aria-label', t('title')); sky.tabIndex = 0;
        const map = el('div', undefined, sky, 'constellation-map');
        const neighborhood = new Set(selection?.kind === 'node' ? [selection.id] : []);
        if (selection?.kind === 'node') visibleEdges().forEach(edge => { if (edge.from === selection.id || edge.to === selection.id) { neighborhood.add(edge.from); neighborhood.add(edge.to); } });
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); map.append(svg);
        for (const edge of visibleEdges()) {
            const a = visibleNodes().find(n => n.id === edge.from), b = visibleNodes().find(n => n.id === edge.to);
            const group = document.createElementNS(ns, 'g'); group.dataset.edge = edge.id;
            group.setAttribute('class', 'edge' + (edge.pending ? ' pending' : '') + (scenes[sceneId].edges.includes(edge.id) ? ' active' : '') + (selection?.id === edge.id ? ' selected' : ''));
            if (neighborhood.size && edge.from !== selection.id && edge.to !== selection.id) group.classList.add('dim');
            else if (neighborhood.size) group.classList.add('neighbor');
            group.setAttribute('role', 'button'); group.setAttribute('tabindex', '0'); group.setAttribute('aria-label', t('edge', t(edge.from), t(edge.to)));
            group.setAttribute('aria-pressed', String(selection?.kind === 'edge' && selection.id === edge.id));
            for (const cls of ['hit', 'thread', 'spark']) {
                const line = document.createElementNS(ns, 'line'); line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
                line.setAttribute('class', cls); line.setAttribute('pathLength', '100'); line.setAttribute('vector-effect', 'non-scaling-stroke'); group.append(line);
            }
            group.addEventListener('click', () => choose('edge', edge.id));
            group.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); choose('edge', edge.id); root.querySelector(`[data-edge="${edge.id}"]`).focus(); } }); svg.append(group);
        }
        for (const node of visibleNodes()) {
            const star = button(t(node.id), map, () => { choose('node', node.id); root.querySelector(`[data-node="${node.id}"]`).focus({preventScroll:true}); });
            star.dataset.node = node.id; star.className = 'star' + (scenes[sceneId].nodes.includes(node.id) ? ' active' : '') + (node.id === 'sour' && sceneId === 'unknown' ? ' pending' : '');
            if (neighborhood.size) star.classList.add(neighborhood.has(node.id) ? 'neighbor' : 'dim');
            star.style.left = node.x + '%'; star.style.top = node.y + '%'; star.setAttribute('aria-pressed', String(selection?.kind === 'node' && selection.id === node.id));
            star.addEventListener('focus', () => {
                const rect = star.getBoundingClientRect(), area = sky.getBoundingClientRect();
                let dx = 0, dy = 0;
                if (rect.left < area.left) dx = area.left - rect.left + 8;
                else if (rect.right > area.right) dx = area.right - rect.right - 8;
                if (rect.top < area.top) dy = area.top - rect.top + 8;
                else if (rect.bottom > area.bottom) dy = area.bottom - rect.bottom - 8;
                if (dx || dy) pan(dx,dy);
            });
        }
        attachNavigation(sky); updateView();
        const panel = el('section', undefined, layout, 'detail'); renderDetail(panel);
        el('p', t('legend'), root, 'legend');
        const light = el('p', '', root, 'light-state'); light.setAttribute('aria-live', 'polite');
        el('p', t('status'), root, 'guide');
    }
    window.addEventListener('game-language-changed', render);
    render(); replay();
})();
