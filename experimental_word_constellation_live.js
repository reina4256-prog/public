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
        'work:cooking': '皿洗い', 'work:smithing': 'ふいご', 'work:building': '図面写し',
        'action:attack': '攻撃する', 'action:avoid': 'かわす', 'action:pick': '拾う', 'action:equip': '装備する',
        'action:use': '使う', 'action:store': 'しまう', 'action:take': '取り出す', 'action:drop': '地面に置く' };
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
        meaning: '意味', relation: '言葉どうしの関係', name: '教わった呼び名',
        mapGuide: '近さは意味の似かよいではありません。線で結ばれた言葉と記録を、見やすく配置しています。',
        processGuide: '残る結び付きと、今回だけ光る道筋を分けて見られます。光るだけでは新しい学習になりません。',
        history: '会話の道筋', current: '育った星空', session: '直近24件・今回の起動中だけの記録です。過去の道筋は当時の情報で表示します。',
        input: '受け取った言葉', understood: '分かったこと', candidates: '今回の候補', references: '明示された参照先', output: '実際の返答・しぐさ',
        noCandidates: 'この入力には、記録された候補がありません。', chosen: '今回選んだ候補', retained: '候補として残ったもの',
        unresolved: 'まだ分からなかった部分', noReferences: '返答に使った経験は、この記録からは特定できません。', situation: 'そのときの状況',
        traceBoundary: '実際に記録された理解・候補・返答をたどります。LLM内部の再現や、確率の表示ではありません。',
        candidateGuide: '候補は、対象や学ぶ結び付きについての記録です。返答文の確率を計算したものではありません。',
        replay: '道筋をもう一度見る', stop: '動きを止める', flat: '平面', depth: '奥行き', left: '左へ回す', right: '右へ回す',
        latest: '今の返答を星で見る', details: '詳しく見る', newLinks: '今回増えた結び付き', noUnderstanding: '理解できた意味・関係の記録はありません。',
        processing: '当時の処理範囲', quantity: '体力による情報量の制限', comparison: '満腹度による比較の制限',
        preserved: '知識は残っています。今回は道筋の一部をたどりきれませんでした。',
        used: '扱った量／上限', depthLimit: '比較の深さ／候補数の上限'
    };
    // Read-only projection. Shared evidence is shown through a record node, never
    // interpreted as a new semantic relation, truth judgment, or acquired word.
    function project(state, catalog, inputs = []) {
        const nodes = [], edges = [], records = new Map(), byId = new Map();
        const add = node => { if (!byId.has(node.id)) { nodes.push(node); byId.set(node.id, node); } return byId.get(node.id); };
        const attach = (node, ref) => {
            if (!ref || !records.has(ref)) return;
            const record = records.get(ref);
            const anchor = add({ id: ref, label: record.kind === 'experience' ? messages.experience : messages.original,
                kind: 'record', source: 'learned', refs: [ref], literal: false });
            const id = JSON.stringify([node.id, anchor.id]);
            if (node.id !== anchor.id && !edges.some(edge => edge.id === id)) edges.push({ id, from: node.id, to: anchor.id, kind: node.source === 'initial' ? 'use' : 'evidence' });
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
            const node = add({ id, label, literal: false, kind, semanticId: entry.id, signature: JSON.stringify(entry), source: entry.source === 'initial' ? 'initial' : 'learned',
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
                candidate: entry.status === 'candidate' || !(entry.evidence || []).some(e => !e.retractedBy),
                scoped: true, scopes: [{ locale: entry.locale, speaker: entry.speaker, scene: entry.scene }], refs: [],
                withdrawn: (entry.evidence || []).length > 0 && entry.evidence.every(e => !!e.retractedBy) });
            evidence(node, entry);
            const object = add({ id: 'target/' + entry.target, label: messages.object, literal: false,
                kind: 'object', source: 'learned', refs: [], scopes: [] });
            edges.push({ id: node.id + '/target', from: node.id, to: object.id, kind: 'naming' });
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
        // Initial knowledge was already available when these completed events
        // occurred. Show an actual use/experience, never a fabricated lesson.
        // Acquired scoped knowledge still uses only its explicit owner evidence.
        for (const event of state.experiences || []) {
            const used = new Set([event.activity, ...(event.lifeLabels || []).map(label => label.meaning)]);
            for (const node of nodes.filter(n => n.source === 'initial' && n.kind === 'meaning')) {
                if (used.has(node.semanticId)) attach(node, 'experience/' + event.id);
            }
        }
        const unknown = [...records.values()].filter(r => r.kind === 'input').map(r => r.value)
            .filter(r => typeof r.raw === 'string' && r.understandings?.some(u => !u.complete)).map(r => ({
            raw: r.raw, ref: 'input/' + r.id
        }));
        return { nodes, edges, records: Object.fromEntries(records), unknown, foundation: !!state.settings?.foundation, life: !!state.settings?.life };
    }

    // Topology, world coordinates and camera projection stay independent. No
    // coordinate or distance is used by comprehension, learning or reply choice.
    function arrange(graph) {
        const nodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id, 'en'));
        const adjacency = new Map(nodes.map(n => [n.id, []]));
        for (const e of graph.edges) if (adjacency.has(e.from) && adjacency.has(e.to)) {
            adjacency.get(e.from).push(e.to); adjacency.get(e.to).push(e.from);
        }
        const visited = new Set(), groups = [], loose = [];
        for (const n of nodes) {
            if (visited.has(n.id)) continue;
            if (!adjacency.get(n.id).length) { loose.push(n.id); continue; }
            const ids = [n.id]; visited.add(n.id);
            for (let i = 0; i < ids.length; i++) for (const id of adjacency.get(ids[i])) if (!visited.has(id)) {
                visited.add(id); ids.push(id);
            }
            groups.push(ids);
        }
        if (loose.length) groups.push(loose);
        const positions = {}, boxes = [];
        for (const ids of groups) {
            if (ids === loose) {
                const size = Math.max(760, Math.ceil(ids.length / 4) * 100 + 100);
                ids.forEach((id, i) => { positions[id] = { x: 100 + i % 4 * 180 - size / 2, y: 70 + Math.floor(i / 4) * 100 - size / 2, z: (i % 3 - 1) * 65 }; });
                boxes.push({ ids, size }); continue;
            }
            const root = [...ids].sort((a, b) => adjacency.get(b).length - adjacency.get(a).length || a.localeCompare(b, 'en'))[0];
            const levels = new Map([[root, 0]]), queue = [root];
            for (let i = 0; i < queue.length; i++) for (const id of adjacency.get(queue[i])) if (!levels.has(id)) {
                levels.set(id, levels.get(queue[i]) + 1); queue.push(id);
            }
            const rows = new Map();
            for (const id of ids) { const level = levels.get(id) || 0; if (!rows.has(level)) rows.set(level, []); rows.get(level).push(id); }
            let radius = 0;
            for (const [level, members] of rows) {
                members.sort();
                const r = members.length === 1 && level === 0 ? 0 : Math.max(level * 170, members.length * 170 / (2 * Math.PI));
                radius = Math.max(radius, r);
                members.forEach((id, i) => {
                    const angle = i * 2 * Math.PI / members.length + level * .41;
                    positions[id] = { x: Math.cos(angle) * r, y: Math.sin(angle) * r,
                        z: ((i % 3) - 1) * 65 + level * 28 };
                });
            }
            boxes.push({ ids, size: Math.max(240, radius * 2 + 190) });
        }
        // Shelf packing keeps disconnected knowledge visible without adding links.
        for (const box of boxes) {
            const points = box.ids.map(id => positions[id]);
            box.minX = Math.min(...points.map(p => p.x)); box.minY = Math.min(...points.map(p => p.y));
            box.width = Math.max(...points.map(p => p.x)) - box.minX + 180;
            box.height = Math.max(...points.map(p => p.y)) - box.minY + 120;
        }
        const width = Math.max(760, ...boxes.map(b => b.width), Math.sqrt(boxes.reduce((s, b) => s + b.width * b.height, 0)) * 1.3);
        let x = 0, y = 0, row = 0;
        for (const box of boxes) {
            if (x && x + box.width > width) { x = 0; y += row; row = 0; }
            for (const id of box.ids) { positions[id].x += x + 90 - box.minX; positions[id].y += y + 60 - box.minY; }
            x += box.width; row = Math.max(row, box.height);
        }
        return positions;
    }
    function camera(positions, { yaw = 0, depth = false, zoom = 1 } = {}) {
        const points = Object.fromEntries(Object.entries(positions).map(([id, p]) => [id, {
            x: depth ? p.x * Math.cos(yaw) + p.z * Math.sin(yaw) : p.x,
            y: p.y + (depth ? p.z * .4 : 0), z: depth ? p.z * Math.cos(yaw) - p.x * Math.sin(yaw) : 0
        }]));
        const values = Object.values(points), minX = Math.min(0, ...values.map(p => p.x)), minY = Math.min(0, ...values.map(p => p.y));
        for (const p of values) { p.x = (p.x - minX + 95) * zoom; p.y = (p.y - minY + 60) * zoom; }
        return { points, width: Math.max(620, ...values.map(p => p.x + 95 * zoom)), height: Math.max(340, ...values.map(p => p.y + 60 * zoom)) };
    }

    // Capture the actual result and the knowledge present at the input boundary.
    // Historical selection never re-runs receive/respond or consults later state.
    function capture(before, after, result, reply, text, focus = null) {
        const understood = new Set(), refs = new Set(), candidates = [], missing = [];
        const addEvidence = entry => {
            for (const e of entry?.evidence || []) {
                if (typeof e === 'string') refs.add('input/' + e);
                else if (e) { if (e.inputId) refs.add('input/' + e.inputId); if (e.experienceId !== undefined) refs.add('experience/' + e.experienceId); }
            }
        };
        for (const u of result.understandings || []) {
            if (u.unresolved?.some(m => m.type === 'processing_limit')) {
                // Retain actual unresolved candidates without lighting an unused path.
                for (const c of u.target?.candidates || []) candidates.push({
                    label: c.word || meanings[c.id] || messages.object, literal: !!c.word, selected: false, target: c.id });
                continue;
            }
            for (const n of before.nodes) {
                const explicit = [...(u.relationReferences || []), ...(u.feelingReferences || [])].some(e => JSON.stringify(e) === n.signature);
                const basic = n.id.startsWith(n.kind + '/') && (n.kind === 'meaning'
                    ? Object.values(u.known || {}).includes(n.semanticId) : n.kind === 'relation' && n.source === 'initial' && u.relations?.includes(n.semanticId));
                if (explicit || basic) { understood.add(n.id); if (n.source !== 'initial') for (const ref of n.refs) refs.add(ref); }
            }
            for (const e of [...(u.relationReferences || []), ...(u.feelingReferences || [])]) addEvidence(e);
            for (const application of u.applications || []) for (const c of application.candidates || []) {
                addEvidence(c);
                if (c.inputId) {
                    const ref = 'input/' + c.inputId; refs.add(ref);
                    for (const n of before.nodes) if (n.kind === 'name' && n.refs.includes(ref)) understood.add(n.id);
                }
            }
            for (const c of u.target?.candidates || []) {
                candidates.push({ label: c.word || meanings[c.id] || messages.object, literal: !!c.word,
                    selected: u.target.adopted?.id === c.id, target: c.id });
                for (const id of c.evidence || []) refs.add('input/' + id);
                if (before.nodes.some(n => n.id === 'target/' + c.id)) understood.add('target/' + c.id);
            }
            for (const m of u.unresolved || []) missing.push({ label: m.token || words[m.id] || meanings[m.id] || messages.unresolved, literal: !!m.token });
        }
        for (const group of [...(result.learning || []), result.wordLearning, result.relationLearning, result.feelingLearning, result.lifeLearning, result.walkingLearning].filter(Boolean)) {
            for (const c of group.candidates || []) {
                candidates.push({ label: typeof c === 'string' ? meanings[c] || words[c] || messages.scoped
                    : c.word || words[c.relation] || meanings[c.meaning] || meanings[c.id] || words[c.id] || messages.scoped, literal: !!c.word,
                    selected: !!group.adopted && (Array.isArray(group.adopted) ? group.adopted : [group.adopted]).some(a =>
                        typeof c === 'string' ? a === c : a && typeof a === 'object' && Object.entries(c).every(([key, value]) => JSON.stringify(a[key]) === JSON.stringify(value))) });
            }
        }
        // Reply references are distinct from evidence for understanding a word.
        const replyRefs = [];
        if (reply.experienceId != null) replyRefs.push('experience/' + reply.experienceId);
        const outputMeanings = new Set();
        let situation = null;
        if (focus?.inputId === result.input.id && focus.topic && focus.response?.message === reply.message) {
            for (const id of focus.requiredMeanings || []) outputMeanings.add(id);
            if (focus.evidence?.experienceId != null) replyRefs.push('experience/' + focus.evidence.experienceId);
            else if (focus.evidence?.activity) situation = copy(focus.evidence.activity);
        }
        const outputNodes = before.nodes.filter(n => n.kind === 'meaning' && outputMeanings.has(n.semanticId)).map(n => n.id);
        for (const ref of replyRefs) refs.add(ref);
        const fresh = new Set(after.nodes.filter(n => n.source !== 'initial' && !['record', 'object'].includes(n.kind) && !before.nodes.some(old => old.id === n.id)).map(n => n.id));
        for (const edge of after.edges) if (edge.kind !== 'use' && !before.edges.some(old => old.id === edge.id)
            && after.nodes.some(n => n.id === edge.from && !['record', 'object'].includes(n.kind))) fresh.add(edge.from);
        return copy({ id: result.input.id, raw: result.input.raw, locale: result.input.locale, graph: after,
            understood: [...understood], outputNodes, situation, refs: [...refs], replyRefs: [...new Set(replyRefs)], candidates, missing, fresh: [...fresh],
            complete: !!result.understandings?.length && result.understandings.every(u => u.complete), reply, text,
            ...(result.processing ? { processing: result.processing } : {}) });
    }
    const innerMessages = {
        title: '心の声',
        unknown: '声は届いた。でも、言葉の意味はまだつかめない……。',
        known: '「{words}」の意味は分かる。',
        relation: '「{words}」というつながりは分かる。',
        target: '「{words}」のことを指しているんだね。',
        targetKnown: 'どれを指しているのかは分かった。',
        missingWord: 'でも、「{words}」の意味はまだ分からない……。',
        missingRelation: 'でも、「{words}」というつながりはまだ分からない……。',
        missingTarget: 'でも、どれを指しているのかはまだ決められない……。',
        missingDetail: 'まだ読み取れていない部分がある……。',
        complete: 'この話は読み取れた。',
        limited: '聞いたことを全部たどる余裕がない……。',
        clause: '{number}つめの話は……'
    };
    // A player-readable account of the received result, not a new interpretation.
    // Never consult current knowledge: later learning must not rewrite this voice.
    function innerVoice(result, translate = text => text) {
        const format = (key, values = {}) => translate(innerMessages[key]).replace(/\{(words|number)\}/g, (_, k) => values[k] ?? '');
        const list = items => [...new Set(items.filter(Boolean))].join(' / ');
        const meaning = id => Object.hasOwn(meanings, id) ? translate(meanings[id]) : null;
        const relation = id => Object.hasOwn(words, id) ? translate(words[id]) : null;
        const clauses = result?.understandings || [];
        if (!clauses.length) return format('unknown');
        return clauses.map((u, index) => {
            const parts = [], missing = u.unresolved || [];
            if (clauses.length > 1) parts.push(format('clause', { number: index + 1 }));
            if (missing.some(m => m.type === 'processing_limit')) {
                parts.push(format('limited')); return parts.join(' ');
            }
            const known = list(Object.values(u.known || {}).map(meaning));
            const links = list((u.relations || []).map(relation));
            if (known) parts.push(format('known', { words: known }));
            if (links) parts.push(format('relation', { words: links }));
            // Only the adopted referent is understood. Candidates/tentative learning aren't.
            const target = u.target?.adopted;
            const targetName = target?.word || meaning(target?.meaning);
            if (targetName) parts.push(format('target', { words: targetName }));
            else if (target) parts.push(format('targetKnown'));
            const unknownWords = list(missing.filter(m => m.type === 'meaning' && m.token).map(m => meaning(m.token) || m.token));
            const unknownLinks = list(missing.filter(m => m.type === 'relation').map(m => relation(m.id)));
            if (unknownWords) parts.push(format('missingWord', { words: unknownWords }));
            if (unknownLinks) parts.push(format('missingRelation', { words: unknownLinks }));
            if (missing.some(m => m.type === 'target')) parts.push(format('missingTarget'));
            if (u.complete && missing.length === 0) parts.push(format('complete'));
            else if (!known && !links && !target && !unknownWords && !unknownLinks && !missing.some(m => m.type === 'target')) parts.push(format('unknown'));
            else if (missing.some(m => !['meaning', 'relation', 'target'].includes(m.type))) parts.push(format('missingDetail'));
            return parts.join(' ');
        }).join('\n');
    }
    function mount(root, options) {
        let model, selected = null, query = '', zoom = 1, depth = false, yaw = 0, traceId = null, positions;
        let timers = [];
        const stop = () => { timers.forEach(clearTimeout); timers = []; root.classList.remove('trace-playing'); };
        const traces = () => options.traces?.() || [];
        const activeTrace = () => traces().find(t => t.id === traceId);
        function play() {
            stop(); if (!activeTrace() || document.hidden || options.canAnimate?.() === false) return;
            root.classList.add('trace-playing');
            const phases = root.querySelectorAll('[data-trace-stage]');
            phases.forEach(n => n.classList.remove('trace-lit'));
            const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
            phases.forEach(n => { timers.push(setTimeout(() => {
                if (!document.hidden && root.isConnected && !root.closest('[hidden]') && options.canAnimate?.() !== false) n.classList.add('trace-lit'); else stop();
            }, reduced ? 0 : Number(n.dataset.traceStage) * 650)); });
            timers.push(setTimeout(() => root.classList.remove('trace-playing'), reduced ? 0 : 3600));
        }
        const tr = value => options.translate(value);
        const el = (tag, text, parent, literal = false) => {
            const item = document.createElement(tag);
            if (text !== undefined) item.textContent = literal ? text : tr(text);
            item.setAttribute('data-i18n-skip', ''); parent.append(item); return item;
        };
        const button = (text, parent, action) => { const b = el('button', text, parent); b.type = 'button'; b.addEventListener('click', action); return b; };
        function showTrace(trace, parent) {
            const path = el('section', undefined, parent); path.className = 'word-trace';
            const heading = el('div', undefined, path); heading.className = options.compact ? 'word-trace-tools' : 'word-stars-tools';
            el('strong', messages.history, heading);
            if (options.compact) button(messages.details, heading, () => options.inspect?.(trace.id));
            else { button(messages.replay, heading, play); button(messages.stop, heading, stop); }
            if (trace.processing) {
                const p = trace.processing, detail = el('aside', undefined, path); detail.className = 'word-processing';
                el('strong', messages.processing, detail);
                el('p', `${tr(messages.used)}: ${p.used}/${p.units} · ${tr(messages.depthLimit)}: ${p.depth}/${p.candidates}`, detail, true);
                if (p.omitted.length) {
                    el('p', messages.preserved, detail);
                    for (const reason of new Set(p.omitted.flatMap(x => x.reasons))) el('p', messages[reason], detail);
                }
            }
            const flow = el('ol', undefined, path); flow.className = 'word-trace-flow';
            function step(title, index) { const li = el('li', undefined, flow); li.dataset.traceStage = index; el('strong', title, li); return li; }
            el('p', trace.raw, step(messages.input, 0), true);
            const known = step(messages.understood, 1);
            for (const id of trace.understood) {
                const n = trace.graph.nodes.find(n => n.id === id); if (n) el('span', n.label, known, n.literal);
            }
            if (!trace.understood.length) el('p', messages.noUnderstanding, known);
            if (trace.missing.length) { el('p', messages.unresolved, known); for (const m of trace.missing) el('span', m.label, known, m.literal); }
            const choices = step(messages.candidates, 2);
            if (!options.compact) el('p', messages.candidateGuide, choices);
            for (const c of trace.candidates) { const p = el('p', c.selected ? messages.chosen : messages.retained, choices); el('span', c.label, p, c.literal); }
            if (!trace.candidates.length) el('p', messages.noCandidates, choices);
            const references = step(messages.references, 3);
            const refs = [...new Set(trace.refs)];
            if (!refs.length) el('p', messages.noLinks, references);
            for (const ref of refs) {
                const b = button(trace.graph.records[ref]?.kind === 'experience' ? messages.experience : messages.original, references,
                    () => { if (options.compact) options.inspect?.(trace.id, ref); else { selected = ref; render(); } }); b.dataset.ref = ref;
            }
            if (trace.situation) {
                el('p', messages.situation, references);
                const meaning = { move: 'walk', rest: 'rest', eat: 'eat' }[trace.situation.mode];
                if (meaning) el('span', meanings[meaning], references);
            } else if (!trace.replyRefs.length) el('p', messages.noReferences, references);
            const output = step(messages.output, 4); el('p', trace.text, output, true);
            for (const id of trace.outputNodes) { const n = trace.graph.nodes.find(n => n.id === id); if (n) el('span', n.label, output, n.literal); }
            if (trace.fresh.length) el('p', messages.newLinks, path);
            if (!options.compact) {
                const explanation = el('details', undefined, path); el('summary', messages.details, explanation);
                el('p', messages.traceBoundary, explanation); el('p', messages.session, explanation);
            }
        }
        function render() {
            stop();
            const trace = activeTrace();
            model = trace ? trace.graph : project(options.state(), options.catalog(), options.inputs?.() || []);
            positions = arrange(model);
            if (options.compact) {
                root.replaceChildren(); if (!trace) return;
                const ids = new Set([...trace.understood, ...trace.outputNodes, ...trace.refs]);
                const graph = { nodes: model.nodes.filter(n => ids.has(n.id)), edges: model.edges.filter(e => ids.has(e.from) && ids.has(e.to)) };
                const view = camera(arrange(graph));
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const dots = Object.values(view.points);
                const minX = dots.length ? Math.min(...dots.map(p => p.x)) - 80 : 0, minY = dots.length ? Math.min(...dots.map(p => p.y)) - 30 : 0;
                const width = dots.length ? Math.max(200, Math.max(...dots.map(p => p.x)) - minX + 80) : view.width;
                const height = dots.length ? Math.max(90, Math.max(...dots.map(p => p.y)) - minY + 50) : view.height;
                svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('word-trace-sky');
                for (const edge of graph.edges) {
                    const a = view.points[edge.from], b = view.points[edge.to], line = document.createElementNS(svg.namespaceURI, 'line');
                    for (const [key, value] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) line.setAttribute(key, value);
                    svg.append(line);
                }
                for (const n of graph.nodes) {
                    const p = view.points[n.id], group = document.createElementNS(svg.namespaceURI, 'g');
                    group.dataset.traceStage = trace.outputNodes.includes(n.id) && !trace.understood.includes(n.id) ? 4 : n.kind === 'record' ? 3 : 1;
                    const circle = document.createElementNS(svg.namespaceURI, 'circle'); circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y); circle.setAttribute('r', 6);
                    const text = document.createElementNS(svg.namespaceURI, 'text'); text.setAttribute('x', p.x); text.setAttribute('y', p.y + 28);
                    text.textContent = n.literal ? n.label : tr(n.label); group.append(circle, text); svg.append(group);
                }
                root.append(svg); showTrace(trace, root);
                return;
            }
            const focused = document.activeElement?.dataset.star;
            const old = root.querySelector('.word-stars-viewport');
            const scroll = old ? [old.scrollLeft, old.scrollTop] : [0, 0];
            root.replaceChildren();
            el('h2', messages.title, root);
            const help = el('details', undefined, root); help.className = 'word-stars-help';
            el('summary', messages.help, help); el('p', messages.guide, help);
            el('p', messages.mapGuide, help); el('p', messages.processGuide, help);
            el('p', model.foundation || model.life ? messages.prepared : messages.seed, help);
            const tools = el('div', undefined, root); tools.className = 'word-stars-tools';
            if (!options.compact) {
                const historyLabel = el('label', messages.history, tools), history = el('select', undefined, historyLabel);
                el('option', messages.current, history).value = '';
                for (const item of [...traces()].reverse()) { const o = el('option', item.raw, history, true); o.value = item.id; }
                history.value = traceId || '';
                history.addEventListener('change', () => { traceId = history.value || null; selected = null; query = ''; render(); play(); });
            }
            const label = el('label', messages.search, tools), search = el('input', undefined, label);
            search.type = 'search'; search.value = query; search.id = 'word-stars-search';
            const searchNow = () => { query = search.value; render(); root.querySelector('input').focus(); };
            search.addEventListener('input', event => { if (!event.isComposing) searchNow(); });
            search.addEventListener('compositionend', searchNow);
            button(messages.all, tools, () => { selected = null; query = ''; zoom = 1; traceId = null; render(); root.querySelector('.word-stars-viewport').scrollTo(0, 0); });
            button(messages.zoomIn, tools, () => { zoom = Math.min(2, zoom + .25); render(); });
            button(messages.zoomOut, tools, () => { zoom = Math.max(.75, zoom - .25); render(); });
            const mode = button(depth ? messages.flat : messages.depth, tools, () => { depth = !depth; render(); }); mode.dataset.camera = 'mode';
            mode.setAttribute('aria-pressed', String(depth));
            for (const [label, delta] of [[messages.left, -.25], [messages.right, .25]]) {
                const b = button(label, tools, () => { yaw = Math.max(-.8, Math.min(.8, yaw + delta)); render(); }); b.disabled = !depth;
            }
            const legend = el('div', undefined, root); legend.className = 'word-stars-legend';
            el('span', messages.initial, legend); el('span', messages.learned, legend);
            const layout = el('div', undefined, root); layout.className = 'word-stars-layout';
            const viewport = el('div', undefined, layout); viewport.className = 'word-stars-viewport'; viewport.tabIndex = 0;
            viewport.setAttribute('aria-label', tr(messages.title));
            const sky = el('div', undefined, viewport); sky.className = 'word-stars-sky';
            const visible = model.nodes.filter(n => !query || (n.literal ? n.label : tr(n.label)).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
            const view = camera(positions, { depth, yaw, zoom });
            if (trace) { for (const p of Object.values(view.points)) p.y += 140; view.height += 140; }
            sky.style.width = view.width + 'px'; sky.style.height = view.height + 'px';
            const points = view.points;
            const visibleIds = new Set(visible.map(n => n.id));
            const neighbors = new Set(selected ? [selected] : []);
            for (const edge of model.edges) if (edge.from === selected || edge.to === selected) { neighbors.add(edge.from); neighbors.add(edge.to); }
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sky.append(svg);
            svg.setAttribute('aria-hidden', 'true');
            if (trace) {
                for (const [title, text, x, stage] of [[messages.input, trace.raw, 115, 0], [messages.output, trace.text, view.width - 115, 4]]) {
                    const token = el('div', undefined, sky); token.className = 'word-trace-token'; token.dataset.traceStage = stage;
                    token.style.left = x + 'px'; el('strong', title, token); el('p', text, token, true);
                    const ids = stage === 0 ? trace.understood : [...trace.replyRefs, ...trace.outputNodes];
                    for (const id of ids) if (points[id]) {
                        const line = document.createElementNS(svg.namespaceURI, 'line');
                        for (const [key, value] of Object.entries({ x1: x, y1: 110, x2: points[id].x, y2: points[id].y })) line.setAttribute(key, value);
                        line.classList.add('trace-link'); svg.append(line);
                    }
                }
            }
            for (const edge of model.edges) {
                const a = points[edge.from], b = points[edge.to]; if (!a || !b || !visibleIds.has(edge.from) || !visibleIds.has(edge.to)) continue;
                const line = document.createElementNS(svg.namespaceURI, 'line');
                for (const [key, value] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) line.setAttribute(key, value);
                line.classList.toggle('focused', edge.from === selected || edge.to === selected); svg.append(line);
                line.classList.toggle('trace-link', !!trace && trace.understood.includes(edge.from) && trace.refs.includes(edge.to));
            }
            for (const star of visible) {
                const pos = points[star.id];
                const b = button('', sky, () => { selected = star.id; render(); });
                b.textContent = star.literal ? star.label : tr(star.label); b.dataset.star = star.id;
                b.className = 'word-star ' + star.kind + (star.source === 'initial' ? ' initial' : ' learned');
                b.classList.toggle('dim', !!selected && !neighbors.has(star.id));
                b.classList.toggle('trace-used', !!trace && (trace.understood.includes(star.id) || trace.outputNodes.includes(star.id) || trace.refs.includes(star.id)));
                b.classList.toggle('trace-new', !!trace && trace.fresh.includes(star.id));
                b.classList.toggle('candidate', !!star.candidate);
                b.setAttribute('aria-pressed', String(selected === star.id));
                b.style.left = pos.x + 'px'; b.style.top = pos.y + 'px';
                b.style.zIndex = String(Math.round(pos.z) + 10000);
                b.title = tr(star.kind === 'record' ? messages.original : star.source === 'initial' ? messages.initial : messages.learned);
            }
            if (!visible.length) el('p', model.nodes.length ? messages.noMatch : messages.empty, sky);
            const detail = el('section', undefined, layout); detail.className = 'word-stars-detail';
            detail.setAttribute('aria-live', 'polite');
            const star = model.nodes.find(n => n.id === selected);
            if (!star) el('p', messages.choose, detail);
            else {
                el('h3', star.label, detail, star.literal);
                el('p', star.kind === 'record' ? messages.original : star.source === 'initial' ? messages.initial : messages.learned, detail);
                if (!star.withdrawn && star.kind !== 'record' && star.kind !== 'object') el('p', star.candidate ? messages.retained : star.scoped ? messages.scoped : messages.known, detail);
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
            if (!star && selected) showRecord(selected, detail);
            if (trace) showTrace(trace, root);
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
        const visibility = () => { if (document.hidden) stop(); };
        document.addEventListener('visibilitychange', visibility);
        return { refresh(id, focus) {
            if (id !== undefined) traceId = id; if (focus !== undefined) selected = focus; render();
            if (id) {
                play();
                const trace = activeTrace(), first = focus || trace?.understood[0] || trace?.outputNodes[0];
                const star = Array.from(root.querySelectorAll('[data-star]')).find(b => b.dataset.star === first);
                const viewport = root.querySelector('.word-stars-viewport');
                if (star && viewport) viewport.scrollTo(Math.max(0, star.offsetLeft - viewport.clientWidth / 2), Math.max(0, star.offsetTop - viewport.clientHeight / 2));
            }
        }, stop,
            reset() { stop(); traceId = null; selected = null; query = ''; root.replaceChildren(); model = null; },
            languageChanged() { if (model) render(); } };
    }
    return { project, arrange, camera, capture, innerVoice, innerMessages, mount, messages, words, meanings };
});
