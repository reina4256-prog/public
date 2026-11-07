(function () {
    'use strict';
    const S = {
        title: 'ダンジョン・独立試作',
        guide: '理解状態を切り替え、指示と自主判断を比べる一部屋の試作です。本編の知識・保存にはつながりません。',
        language: '表示言語', scenario: '場面', explore: '出口を探す', danger: '危険の近くから', reset: '最初から',
        known: '理解状態（試作用）', move: '移動の指示', retreat: '退避の指示', exit: '出口への指示',
        help: 'チェックを外すと、その指示は未理解として扱います。学習や忘却は起きません。',
        command: '言葉で指示する', up: '上へ', right: '右へ', down: '下へ', left: '左へ',
        flee: '逃げて', goal: '出口へ', wait: 'そこで待って', send: '指示する',
        auto: '本人の判断で1ターン', play: '自動で見守る', pause: '一時停止', history: '行動の履歴',
        facts: '指示：{{0}} → 行動：{{1}}', turn: '{{0}}ターン', actor: '本人', hazard: '危険', stairs: '出口',
        position: '位置 {{0}}、{{1}}', ready: '指示を出すか、本人の判断を見守ってみよう。',
        unknown: 'その指示はまだ分からない。', diverged: 'そちらは危ないから、別の方向へ離れるね。',
        blocked: 'そこには進めないので、ここで待つね。', exploreReply: '出口につながる道を探してみるね。',
        retreatReply: '危険が近いので、距離を取るね。', obey: '分かった。その指示で動くね。',
        waitReply: 'ここで待つね。', arrived: '出口に着いたよ。', instruction: '指示への反応', autonomous: '自主判断',
        changed: '指示と異なる選択',
        note: '危険は固定された見本です。戦闘・教示・日記への記録は行いません。',
        map: '一部屋の試作マップ。青が本人、赤が危険、金が出口です。'
    };
    const api = window.ExperimentalWordDungeonPreview, root = document.getElementById('dungeon-preview');
    const t = (key, ...args) => window.GameI18n.translate(S[key]).replace(/\{\{(\d+)\}\}/g, (_, i) => String(args[Number(i)]));
    let state = api.create(), running = false, timer = null, selected = 'exit', canvas;
    const atlas = new Image(), robot = new Image();
    atlas.src = 'dungeon_scull_mapchip.png'; robot.src = 'robot.png';
    atlas.addEventListener('load', draw); robot.addEventListener('load', draw);
    function el(tag, text, parent, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        if (parent) parent.append(node); return node;
    }
    const label = id => id === null ? '—' : t(id === 'retreat' ? 'flee' : id === 'exit' ? 'goal' : id);
    function reply(event) {
        return t(event.arrived ? 'arrived' : { explore: 'exploreReply', retreat: 'retreatReply', wait: 'waitReply' }[event.reason] || event.reason);
    }
    function stop() { running = false; clearInterval(timer); timer = null; }
    function advance(command = null) {
        state = api.step(state, command);
        if (state.complete) stop();
        render();
    }
    function draw() {
        if (!canvas) return;
        const c = canvas.getContext('2d'), size = 64;
        c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, 576, 448); c.imageSmoothingEnabled = false;
        api.grid.forEach((row, y) => [...row].forEach((tile, x) => {
            const px = x * size, py = y * size;
            c.fillStyle = tile === '#' ? '#29353a' : '#617075'; c.fillRect(px, py, size, size);
            if (atlas.complete && atlas.naturalWidth) {
                const rect = tile === '#' ? [5, 337, 341, 429] : [9, 0, 341, 331];
                c.drawImage(atlas, ...rect, px, py, size, size);
            }
            c.fillStyle = tile === '#' ? '#071116aa' : '#10202655'; c.fillRect(px, py, size, size);
            c.strokeStyle = '#101c2244'; c.strokeRect(px, py, size, size);
            if (tile !== '#' && Math.abs(x - state.hazard.x) + Math.abs(y - state.hazard.y) <= 1) {
                c.fillStyle = '#b93c3244'; c.fillRect(px, py, size, size);
            }
            if (state.visited.includes(x + ',' + y)) {
                c.fillStyle = '#d4be8655'; c.beginPath(); c.arc(px + 32, py + 46, 4, 0, Math.PI * 2); c.fill();
            }
        }));
        const ex = state.exit.x * size, ey = state.exit.y * size;
        c.fillStyle = '#e3c07544'; c.fillRect(ex + 3, ey + 3, 58, 58);
        c.strokeStyle = '#e5c78a'; c.lineWidth = 2; c.strokeRect(ex + 10, ey + 12, 44, 41);
        for (let i = 0; i < 4; i++) { c.fillStyle = '#cfbd90'; c.fillRect(ex + 17 + i * 5, ey + 42 - i * 7, 27 - i * 4, 5); }
        const hx = state.hazard.x * size + 32, hy = state.hazard.y * size + 34;
        c.shadowColor = '#ff6259'; c.shadowBlur = 18; c.fillStyle = '#d6574e'; c.beginPath(); c.arc(hx, hy, 18, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
        c.fillStyle = '#fbe1b9'; c.fillRect(hx - 8, hy - 4, 4, 6); c.fillRect(hx + 4, hy - 4, 4, 6);
        const px = state.position.x * size, py = state.position.y * size;
        c.fillStyle = '#83c5e055'; c.beginPath(); c.ellipse(px + 32, py + 54, 21, 7, 0, 0, Math.PI * 2); c.fill();
        if (robot.complete && robot.naturalWidth) c.drawImage(robot, 804, 75, 194, 314, px + 15, py + 2, 34, 55);
        else { c.fillStyle = '#82c9e4'; c.fillRect(px + 18, py + 10, 28, 40); }
    }
    function render() {
        const focused = document.activeElement?.id;
        root.replaceChildren(); document.title = t('title');
        const top = el('header', undefined, root, 'top'), title = el('div', undefined, top);
        el('div', 'EXPLORATION / 01', title, 'eyebrow'); el('h1', t('title'), title);
        const languageLabel = el('label', t('language'), top), language = el('select', undefined, languageLabel); language.id = 'language';
        for (const [id, item] of Object.entries(window.GameI18n.languages)) { const option = el('option', item.label, language); option.value = id; }
        language.value = window.GameI18n.language; language.addEventListener('change', () => window.GameI18n.setLanguage(language.value));
        el('p', t('guide'), root, 'guide');
        const toolbar = el('div', undefined, root, 'toolbar'), scenarioLabel = el('label', t('scenario'), toolbar);
        const scenario = el('select', undefined, scenarioLabel); scenario.id = 'scenario';
        for (const id of ['explore', 'danger']) { const option = el('option', t(id), scenario); option.value = id; }
        scenario.value = state.scenario;
        const reset = () => { stop(); const known = { ...state.known }; state = api.create(scenario.value); state.known = known; render(); };
        scenario.addEventListener('change', reset);
        const resetButton = el('button', t('reset'), toolbar); resetButton.id = 'reset'; resetButton.addEventListener('click', reset);
        const layout = el('div', undefined, root, 'layout'), left = el('section', undefined, layout);
        const room = el('div', undefined, left, 'room'), head = el('div', undefined, room, 'room-head');
        el('span', t('turn', state.turn), head); el('span', t('position', state.position.x, state.position.y), head);
        const wrap = el('div', undefined, room, 'map-wrap'); canvas = el('canvas', undefined, wrap); canvas.width = 1152; canvas.height = 896;
        canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t('map') + ' ' + t('position', state.position.x, state.position.y));
        const legend = el('div', undefined, room, 'legend');
        for (const [key, color] of [['actor', '#83c5e0'], ['hazard', '#e27166'], ['stairs', '#e3c075']]) el('span', t(key), legend).style.setProperty('--dot', color);
        const event = state.events.at(-1), feedback = el('div', undefined, left, 'feedback' + (event?.reason === 'diverged' ? ' diverged' : ''));
        feedback.id = 'feedback'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
        if (event) el('span', t(event.reason === 'diverged' ? 'changed' : event.source), feedback, 'source');
        el('div', event ? reply(event) : t('ready'), feedback);
        el('p', t('note'), left, 'note');
        const right = el('aside', undefined, layout), panel = el('section', undefined, right, 'panel');
        const known = el('fieldset', undefined, panel); el('legend', t('known'), known);
        for (const key of ['move', 'retreat', 'exit']) {
            const row = el('label', undefined, known, 'check'), checkbox = el('input', undefined, row);
            checkbox.type = 'checkbox'; checkbox.id = 'known-' + key; checkbox.checked = state.known[key]; el('span', t(key), row);
            checkbox.addEventListener('change', () => { stop(); state = api.setKnown(state, key, checkbox.checked); render(); });
        }
        el('p', t('help'), known, 'note');
        const commandLabel = el('label', t('command'), panel); commandLabel.htmlFor = 'command';
        const row = el('div', undefined, panel, 'command-row'), command = el('select', undefined, row); command.id = 'command';
        for (const id of ['up', 'right', 'down', 'left', 'retreat', 'exit', 'wait']) { const option = el('option', label(id), command); option.value = id; }
        command.value = selected; command.addEventListener('change', () => { selected = command.value; });
        const send = el('button', t('send'), row, 'primary'); send.id = 'send'; send.disabled = state.complete;
        send.addEventListener('click', () => { stop(); advance(selected); });
        const auto = el('button', t('auto'), panel, 'auto'); auto.id = 'step'; auto.disabled = state.complete;
        auto.addEventListener('click', () => { stop(); advance(); });
        const play = el('button', t(running ? 'pause' : 'play'), panel, 'auto'); play.id = 'play'; play.disabled = state.complete;
        play.addEventListener('click', () => { if (running) stop(); else { running = true; timer = setInterval(() => advance(), 850); } render(); });
        const history = el('section', undefined, right, 'panel history'); el('h2', t('history'), history);
        const list = el('ol', undefined, history); list.id = 'history';
        for (const item of [...state.events].reverse()) {
            const li = el('li', undefined, list); if (item.reason === 'diverged') el('strong', t('changed'), li);
            el('div', item.requested === null ? t('autonomous') + ' → ' + label(item.action) : t('facts', label(item.requested), label(item.action)), li);
            el('small', reply(item), li);
        }
        draw(); if (focused) document.getElementById(focused)?.focus({ preventScroll: true });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden && running) { stop(); render(); } });
    window.addEventListener('pagehide', stop);
    window.addEventListener('game-language-changed', render);
    render();
})();
