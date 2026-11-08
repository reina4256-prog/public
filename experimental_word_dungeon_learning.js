(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        typeof module === 'object' && module.exports ? require('./experimental_word_dungeon_core') : root.ExperimentalWordDungeonPreview);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDungeonLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, preview) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const scene = 'dungeon:room:1';
    const objects = Object.freeze([
        { id: 'dungeon:enemy:1', meaning: 'dungeon:opponent', x: 6, y: 3 },
        { id: 'dungeon:exit:1', meaning: 'dungeon:stairs', x: 7, y: 1 }
    ]);
    const forms = Object.freeze({
        ja: { warning: ['これは危ない', 'この相手は危ない'], go: ['そこへ行って', 'そこに行って'] },
        en: { warning: ['This is dangerous', 'This opponent is dangerous'], go: ['Go there'] },
        'zh-CN': { warning: ['这个很危险', '这个对手很危险'], go: ['去那里'] },
        ru: { warning: ['Это опасно', 'Этот противник опасен'], go: ['Иди туда'] },
        'es-ES': { warning: ['Esto es peligroso', 'Este rival es peligroso'], go: ['Ve allí'] },
        'pt-BR': { warning: ['Isto é perigoso', 'Este oponente é perigoso'], go: ['Vá até lá'] },
        de: { warning: ['Das ist gefährlich', 'Dieser Gegner ist gefährlich'], go: ['Geh dorthin'] }
    });
    const vectors = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const naming = {
        en: /^This is ([\p{L}\p{N}ー]{1,16})$/iu, 'zh-CN': /^这是([\p{L}\p{N}ー]{1,16})$/u,
        ru: /^Это ([\p{L}\p{N}ー]{1,16})$/iu, 'es-ES': /^Esto se llama ([\p{L}\p{N}ー]{1,16})$/iu,
        'pt-BR': /^Isto se chama ([\p{L}\p{N}ー]{1,16})$/iu, de: /^Das heißt ([\p{L}\p{N}ー]{1,16})$/iu
    };
    const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    function create(state) {
        state.dungeonLearning ||= { inputs: [], warnings: [], actions: [] };
        return { state, position: { x: 5, y: 3 }, attention: null, turn: 0, complete: false, last: null };
    }
    function perceive(session, target = session.attention) {
        session.attention = objects.some(o => o.id === target) ? target : null;
        core.perceive(session.state, { scene, attention: objects.filter(o => o.id === session.attention).map(({ id, meaning }) => ({ id, meaning })) });
    }
    function warned(session) {
        return session.state.dungeonLearning.warnings.some(w => w.target === objects[0].id && w.scene === scene);
    }
    function neighbors(position, avoid) {
        return vectors.map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy }))
            .filter(p => preview.grid[p.y]?.[p.x] === '.' && distance(p, objects[0]) !== 0 && (!avoid || distance(p, objects[0]) > 1));
    }
    function advance(session, requested = null, inputId = null) {
        if (session.complete) return null;
        const before = copy(session.position), danger = warned(session);
        let after = before, reason = 'explore';
        const target = objects.find(o => o.id === requested) || objects[1];
        if (danger && (distance(before, objects[0]) <= 1 || requested === objects[0].id)) {
            after = neighbors(before, false).sort((a, b) => distance(b, objects[0]) - distance(a, objects[0]))[0] || before;
            reason = requested ? 'diverged' : 'retreat';
        } else {
            const queue = [{ ...before, first: null }], seen = new Set([before.x + ',' + before.y]);
            for (let index = 0; index < queue.length; index++) {
                const p = queue[index];
                if (distance(p, target) <= (target.id === objects[0].id ? 1 : 0)) { after = p.first || before; break; }
                for (const n of neighbors(p, danger)) {
                    const key = n.x + ',' + n.y;
                    if (!seen.has(key)) { seen.add(key); queue.push({ ...n, first: p.first || n }); }
                }
            }
            if (requested) reason = 'obey';
        }
        session.position = { x: after.x, y: after.y }; session.turn++;
        session.complete = distance(after, objects[1]) === 0;
        session.last = { id: session.state.dungeonLearning.actions.length + 1, scene, inputId, requested,
            reason, before, after: copy(session.position), warningSources: danger ? session.state.dungeonLearning.warnings.map(w => w.inputId) : [] };
        session.state.dungeonLearning.actions.push(copy(session.last));
        return session.last;
    }
    function receive(session, raw, catalog, locale = 'ja', at = Date.now()) {
        perceive(session);
        const normalized = raw.trim().replace(/[。.!！?？]$/u, '').toLocaleLowerCase(locale);
        const table = forms[locale] || forms.ja;
        const name = naming[locale]?.exec(raw.trim().replace(/[。.!！?？]$/u, ''));
        const kind = ['warning', 'go'].find(key => table[key].some(form => form.toLocaleLowerCase(locale) === normalized)) || (name ? 'name' : null);
        if (!kind) {
            const result = core.receive(session.state, raw, catalog, { locale, speaker: 'player', at });
            return { result, special: false };
        }
        const input = { id: 'input:' + (++session.state.serial), raw, locale, speaker: 'player', at,
            scene, attention: copy(session.state.context.attention) };
        const frame = kind === 'name' ? { kind: 'naming', word: name[1], span: raw, relations: ['naming'] }
            : kind === 'warning' ? { kind: 'report', relations: ['report'] }
            : { kind: 'request', meaning: 'walk', relations: ['request'] };
        const understanding = core.understand(session.state, frame, 'player', catalog, locale);
        if (!session.attention) { understanding.complete = false; understanding.unresolved.push({ type: 'target', id: 'attention' }); }
        if (kind === 'warning' && session.attention && session.attention !== objects[0].id) {
            understanding.complete = false; understanding.unresolved.push({ type: 'dungeon_scope', target: session.attention });
        }
        const result = { input, interpretations: [{ ...frame, dungeonIntent: kind }], understandings: [copy(understanding)], learning: [],
            expression: { message: understanding.complete ? 'acknowledge' : 'uncertain' }, reaction: { intent: understanding.complete ? 'acknowledge' : 'uncertain' } };
        const knowledgeBefore = copy(session.state.knowledge);
        if (kind === 'name') {
            const candidates = core.formCandidates(session.state, frame, understanding, input, catalog), adopted = core.adoptCandidate(candidates);
            result.learning.push({ candidates, adopted, updated: core.updateLinks(session.state, candidates, adopted, input) });
        }
        session.state.dungeonLearning.inputs.push(copy({ kind, target: session.attention, result,
            knowledgeBefore, warningsBefore: session.state.dungeonLearning.warnings }));
        if (understanding.complete && kind === 'warning') session.state.dungeonLearning.warnings.push({ scene, target: session.attention, inputId: input.id });
        if (understanding.complete && kind === 'go') advance(session, session.attention, input.id);
        return { result, special: true, kind, learned: understanding.complete && kind === 'warning' };
    }
    function notes(state) {
        return (state.dungeonLearning?.inputs || []).filter(e => e.kind === 'warning').map(e => ({ group: 'names',
            message: 'dungeonNote', detail: e.result.understandings[0].complete ? 'dungeonScope' : 'dungeonUnknown',
            literal: e.result.input.raw, target: e.target, sourceId: e.result.input.id, organized: false }));
    }
    return Object.freeze({ create, perceive, receive, advance, warned, notes, objects, forms, grid: preview.grid });
});
