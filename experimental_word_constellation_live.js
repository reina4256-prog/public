(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordConstellationLive = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const words = { report: '伝える', request: 'お願い', invitation: '誘い', question: '質問', naming: '名付け',
        negation: '否定', time: '時点', condition: '条件', sequence: '順序', reason: '理由', correction: '訂正', contrast: '対比' };
    const meanings = { berry: '木の実', food: '食べ物', eat: '食べる', hungry: 'おなかがすいた', tired: '疲れた', rest: '休む',
        sit: '座る', sleep: '眠る', wake: '起きる', walk: '歩く', sweet: '甘い', bitter: '苦い', comfortable: '心地よい',
        painful: 'つらい', happy: 'うれしい', sad: '悲しい', like: '好き', dislike: '嫌い', success: 'うまくいく', failure: 'うまくいかない',
        work: '仕事', 'work:explore': '荷物運び', 'work:farming': '石拾い', 'work:fishing': '網修理',
        'work:cooking': '皿洗い', 'work:smithing': 'ふいご', 'work:building': '図面写し' };
    const messages = {
        title: '言葉の星座', help: '星の見方', guide: '星を選ぶと、理解している意味と、結び付いた対象や元の記録をたどれます。線は記録との結び付きです。',
        initial: '出会ったときから知っている土台', learned: '暮らしの中で学んだこと', empty: 'まだ星はありません。経験に言葉を添えると、少しずつつながりが育ちます。',
        seed: '土台から育てている途中です。まだ結び付いていない言葉も、そのまま残しています。',
        prepared: 'はじめから知っている土台も星として見えます。あなたと学んだ記録とは分けて表示します。',
        unknown: 'まだ分からなかった言葉', known: '理解している意味', scoped: '教わった範囲に限る理解',
        original: '当時の記録', missing: 'この画面で参照できる元記録がありません。内容は補いません。',
        choose: '気になる星を選んでください。', search: '言葉を探す', all: '全体を見る',
        lesson: '言葉を教わった記録', experience: '自分で体験した記録', object: '呼び名と結び付いた対象',
        thenKnown: '当時、この文は理解できていました。', thenPartial: '当時は、まだ分からない部分がありました。',
        boundary: '今の理解で過去の記録を書き換えません。星座を見るだけでは、新しく学んだことにはなりません。',
        noMatch: '一致する星がありません。', zoomIn: '拡大', zoomOut: '縮小', withdrawn: '言い直された説明の記録',
        scope: 'この表現・相手・場面など、教わった範囲で結び付いています。',
        noLinks: '結び付きの元になる記録は、まだありません。',
        meaning: '意味', relation: '言葉どうしの関係', name: '教わった呼び名'
    };
    // Read-only projection. Shared evidence is shown through a record node, never
    // interpreted as a new semantic relation, truth judgment, or acquired word.
    function project(state, catalog, inputs = []) {
        const nodes = [], edges = [], records = new Map(), byId = new Map();
        const add = node => { if (!byId.has(node.id)) { nodes.push(node); byId.set(node.id, node); } return byId.get(node.id); };
        const attach = (node, ref) => {
            if (!ref || !records.has(ref)) return;
            const record = records.get(ref);
            const anchor = add({ id: ref, label: record.kind === 'experience' ? messages.experience : messages.lesson,
                kind: 'record', source: 'learned', refs: [ref], literal: false });
            const id = JSON.stringify([node.id, anchor.id]);
            if (node.id !== anchor.id && !edges.some(edge => edge.id === id)) edges.push({ id, from: node.id, to: anchor.id });
            if (!node.refs.includes(ref)) node.refs.push(ref);
        };
        for (const record of state.records || []) records.set('input/' + record.id, { kind: 'input', value: copy(record) });
        for (const result of inputs) if (result.input?.id) records.set('input/' + result.input.id,
            { kind: 'input', value: copy({ ...result.input, understandings: result.understandings }) });
        for (const event of state.experiences || []) records.set('experience/' + event.id, { kind: 'experience', value: copy(event) });
        for (const entry of state.dungeonLearning?.inputs || []) {
            const input = entry.result?.input || entry.input;
            if (input?.id && !records.has('input/' + input.id)) records.set('input/' + input.id,
                { kind: 'input', value: copy({ ...input, understandings: entry.result?.understandings || [] }) });
        }
        function evidence(node, entry) {
            for (const e of entry.evidence || []) {
                if (typeof e === 'string') attach(node, 'input/' + e);
                else if (e) {
                    if (e.inputId) attach(node, 'input/' + e.inputId);
                    if (e.experienceId !== undefined) attach(node, 'experience/' + e.experienceId);
                    if (e.scope) node.scopes.push(copy(e.scope));
                    else if (e.scene) node.scopes.push({ scene: e.scene });
                }
            }
            for (const key of ['inputId', 'sourceInputId', 'confirmationInputId']) if (entry[key]) attach(node, 'input/' + entry[key]);
        }
        function semantic(entry, kind, id) {
            const label = kind === 'relation' ? words[entry.id] || entry.id
                : meanings[entry.id] || catalog.meanings?.[entry.id]?.[0] || catalog.experienceMeanings?.[entry.id]?.[0] || entry.id;
            const node = add({ id, label, literal: false, kind, source: entry.source === 'initial' ? 'initial' : 'learned',
                scoped: !!entry.scope || entry.source !== 'initial', scopes: entry.scope ? [copy(entry.scope)] : [], refs: [] });
            evidence(node, entry); return node;
        }
        for (const kind of ['meaning', 'relation']) for (const entry of state.knowledge?.[kind === 'meaning' ? 'meanings' : 'relations'] || []) {
            semantic(entry, kind, kind + '/' + entry.id + '/' + JSON.stringify(entry.scope || null));
        }
        for (const [group, entries] of [['relation', state.relationLearning?.knowledge], ['feeling', state.feelingLearning?.knowledge]]) {
            (entries || []).forEach((entry, index) => semantic(entry, entry.type === 'meaning' ? 'meaning' : 'relation', group + '/' + index));
        }
        for (const [index, entry] of (state.knowledge?.associations || []).entries()) {
            const node = add({ id: 'name/' + index, label: entry.word, literal: true, kind: 'name', source: 'learned',
                scoped: true, scopes: [{ locale: entry.locale, speaker: entry.speaker, scene: entry.scene }], refs: [],
                withdrawn: (entry.evidence || []).length > 0 && entry.evidence.every(e => !!e.retractedBy) });
            evidence(node, entry);
            const object = add({ id: 'target/' + entry.target, label: messages.object, literal: false,
                kind: 'object', source: 'learned', refs: [], scopes: [] });
            edges.push({ id: node.id + '/target', from: node.id, to: object.id });
            for (const ref of node.refs) attach(object, ref);
        }
        for (const [index, entry] of (state.dungeonLearning?.lexicon || []).entries()) {
            const node = add({ id: 'dungeon/' + index, label: entry.word || messages.scoped, literal: !!entry.word, kind: 'name', source: 'learned', scoped: true,
                scopes: [{ locale: entry.locale, scene: entry.scene, form: entry.word }], refs: [] });
            evidence(node, entry);
        }
        for (const [index, entry] of (state.knowledge?.wordExplanations || []).entries()) {
            const node = add({ id: 'explanation/' + index, label: entry.word, literal: true, kind: 'name', source: 'learned',
                scoped: true, scopes: [copy(entry.scope || {})], refs: [], withdrawn: !!entry.retractedBy });
            evidence(node, entry);
        }
        // An initial star can point to an actual use without inventing a teaching
        // event. Scoped acquired stars retain only their explicit evidence links.
        for (const [ref, record] of records) if (record.kind === 'input') {
            for (const u of record.value.understandings || []) {
                const used = [u.known?.meaning, u.known?.conditionMeaning, u.known?.eventMeaning, ...(u.relations || [])];
                for (const node of nodes.filter(n => n.source === 'initial')) {
                    const id = node.id.split('/')[1];
                    if (used.includes(id)) attach(node, ref);
                }
            }
        }
        const unknown = [...records.values()].filter(r => r.kind === 'input').map(r => r.value)
            .filter(r => typeof r.raw === 'string' && r.understandings?.some(u => !u.complete)).map(r => ({
            raw: r.raw, ref: 'input/' + r.id
        }));
        return { nodes, edges, records: Object.fromEntries(records), unknown, foundation: !!state.settings?.foundation, life: !!state.settings?.life };
    }
    function mount(root, options) {
        let model, selected = null, query = '', zoom = 1;
        const tr = value => options.translate(value);
        const el = (tag, text, parent, literal = false) => {
            const item = document.createElement(tag);
            if (text !== undefined) item.textContent = literal ? text : tr(text);
            item.setAttribute('data-i18n-skip', ''); parent.append(item); return item;
        };
        const button = (text, parent, action) => { const b = el('button', text, parent); b.type = 'button'; b.addEventListener('click', action); return b; };
        function render() {
            const focused = document.activeElement?.dataset.star;
            const old = root.querySelector('.word-stars-viewport');
            const scroll = old ? [old.scrollLeft, old.scrollTop] : [0, 0];
            root.replaceChildren();
            el('h2', messages.title, root);
            const help = el('details', undefined, root); help.className = 'word-stars-help';
            el('summary', messages.help, help); el('p', messages.guide, help);
            el('p', model.foundation || model.life ? messages.prepared : messages.seed, help);
            const tools = el('div', undefined, root); tools.className = 'word-stars-tools';
            const label = el('label', messages.search, tools), search = el('input', undefined, label);
            search.type = 'search'; search.value = query; search.id = 'word-stars-search';
            const searchNow = () => { query = search.value; render(); root.querySelector('input').focus(); };
            search.addEventListener('input', event => { if (!event.isComposing) searchNow(); });
            search.addEventListener('compositionend', searchNow);
            button(messages.all, tools, () => { selected = null; query = ''; zoom = 1; render(); root.querySelector('.word-stars-viewport').scrollTo(0, 0); });
            button(messages.zoomIn, tools, () => { zoom = Math.min(2, zoom + .25); render(); });
            button(messages.zoomOut, tools, () => { zoom = Math.max(.75, zoom - .25); render(); });
            const legend = el('div', undefined, root); legend.className = 'word-stars-legend';
            el('span', messages.initial, legend); el('span', messages.learned, legend);
            const layout = el('div', undefined, root); layout.className = 'word-stars-layout';
            const viewport = el('div', undefined, layout); viewport.className = 'word-stars-viewport'; viewport.tabIndex = 0;
            viewport.setAttribute('aria-label', tr(messages.title));
            const sky = el('div', undefined, viewport); sky.className = 'word-stars-sky';
            const connected = new Set(model.edges.flatMap(e => [e.from, e.to]));
            const visible = model.nodes.filter(n => !query || (n.literal ? n.label : tr(n.label)).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
                .sort((a, b) => Number(connected.has(b.id)) - Number(connected.has(a.id)));
            const height = Math.max(340, Math.ceil(visible.length / 4) * 105 + 40) * zoom;
            sky.style.width = Math.max(620, 760 * zoom) + 'px'; sky.style.height = height + 'px';
            const positions = new Map(visible.map((n, i) => [n.id, { x: 13 + (i % 4) * 24, y: (50 + Math.floor(i / 4) * 105) * zoom }]));
            const neighbors = new Set(selected ? [selected] : []);
            for (const edge of model.edges) if (edge.from === selected || edge.to === selected) { neighbors.add(edge.from); neighbors.add(edge.to); }
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sky.append(svg);
            svg.setAttribute('aria-hidden', 'true');
            for (const edge of model.edges) {
                const a = positions.get(edge.from), b = positions.get(edge.to); if (!a || !b) continue;
                const line = document.createElementNS(svg.namespaceURI, 'line');
                for (const [key, value] of Object.entries({ x1: a.x + '%', y1: a.y, x2: b.x + '%', y2: b.y })) line.setAttribute(key, value);
                line.classList.toggle('focused', edge.from === selected || edge.to === selected); svg.append(line);
            }
            for (const star of visible) {
                const pos = positions.get(star.id);
                const b = button('', sky, () => { selected = star.id; render(); });
                b.textContent = star.literal ? star.label : tr(star.label); b.dataset.star = star.id;
                b.className = 'word-star ' + star.kind + (star.source === 'initial' ? ' initial' : ' learned');
                b.classList.toggle('dim', !!selected && !neighbors.has(star.id));
                b.setAttribute('aria-pressed', String(selected === star.id));
                b.style.left = pos.x + '%'; b.style.top = pos.y + 'px';
                b.title = tr(star.source === 'initial' ? messages.initial : messages.learned);
            }
            if (!visible.length) el('p', model.nodes.length ? messages.noMatch : messages.empty, sky);
            const detail = el('section', undefined, layout); detail.className = 'word-stars-detail';
            detail.setAttribute('aria-live', 'polite');
            const star = model.nodes.find(n => n.id === selected);
            if (!star) el('p', messages.choose, detail);
            else {
                el('h3', star.label, detail, star.literal);
                el('p', star.source === 'initial' ? messages.initial : messages.learned, detail);
                if (!star.withdrawn && star.kind !== 'record' && star.kind !== 'object') el('p', star.scoped ? messages.scoped : messages.known, detail);
                if (star.withdrawn) el('p', messages.withdrawn, detail);
                if (star.scopes?.length) {
                    el('p', messages.scope, detail);
                    for (const scope of star.scopes) {
                        // Original forms/labels and language identify scope without inventing a broader rule.
                        const scene = scope.scene === 'clearing' ? tr('広場') : scope.scene?.startsWith('dungeon:') ? tr('ダンジョン') : '';
                        const text = [scope.label, scope.form, scope.locale ? options.languageName?.(scope.locale) || scope.locale : '',
                            scope.speaker === 'player' ? tr('あなた') : '', scene].filter(Boolean).join(' · ');
                        if (text) el('p', text, detail, true);
                    }
                }
                if (!star.refs.length) el('p', star.source === 'initial' ? messages.noLinks : messages.missing, detail);
                for (const ref of star.refs) showRecord(ref, detail);
            }
            const pending = el('details', undefined, root); el('summary', messages.unknown, pending);
            for (const item of model.unknown) {
                const p = el('details', undefined, pending); el('summary', item.raw, p, true); showRecord(item.ref, p);
            }
            el('small', messages.boundary, root);
            viewport.scrollTo(...scroll);
            if (focused) Array.from(root.querySelectorAll('[data-star]')).find(b => b.dataset.star === focused)?.focus({ preventScroll: true });
        }
        function showRecord(ref, parent) {
            const record = model.records[ref]; if (!record) { el('p', messages.missing, parent); return; }
            const details = el('details', undefined, parent); el('summary', messages.original, details);
            const value = record.value;
            if (record.kind === 'input') {
                if (typeof value.raw === 'string') el('blockquote', value.raw, details, true);
                else el('p', messages.missing, details);
                if (value.understandings?.length) el('p', value.understandings.every(u => u.complete) ? messages.thenKnown : messages.thenPartial, details);
            } else {
                const activity = options.catalog().meanings?.[value.activity]?.[0] || options.catalog().experienceMeanings?.[value.activity]?.[0];
                if (activity) el('p', activity, details);
                const label = value.label?.raw || value.label?.text || value.label?.label;
                if (label) el('blockquote', label, details, true);
                for (const label of [...(value.lifeLabels || []), ...(value.relationLabels || [])]) {
                    if (label.raw) el('blockquote', label.raw, details, true);
                }
            }
            for (const edge of model.edges.filter(e => e.from === ref || e.to === ref)) {
                const neighbor = model.nodes.find(n => n.id === (edge.from === ref ? edge.to : edge.from));
                if (neighbor) { const b = button('', details, () => { selected = neighbor.id; query = ''; render(); }); b.textContent = neighbor.literal ? neighbor.label : tr(neighbor.label); }
            }
        }
        return { refresh() { model = project(options.state(), options.catalog(), options.inputs?.() || []); render(); },
            languageChanged() { if (model) render(); } };
    }
    return { project, mount, messages, words, meanings };
});
