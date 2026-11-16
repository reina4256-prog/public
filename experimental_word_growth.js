(function (root, factory) {
    'use strict';
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_evolution_routes') : root.ExperimentalWordEvolutionRoutes);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordGrowth = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (tree) {
    'use strict';
    const copy = v => JSON.parse(JSON.stringify(v));
    const families = ['power', 'intel', 'beauty', 'old', 'dark'];
    // Trial balance, independent capacity and per-unit cost; language-neutral save IDs.
    const RULES = Object.freeze({ units: 160, frames: 8, candidates: 4, depth: 4, unitCost: .00012,
        compareCost: .0005, first: { power: 8, intel: 6, beauty: 6, old: 4, dark: 4 },
        secondMultiplier: 2, reflectionSeconds: 600 });
    const profiles = Object.freeze({ base: { capacity: 1, efficiency: 1, depth: 0, comparisons: 0 },
        power: { capacity: 1.1, efficiency: 1.5, depth: 0, comparisons: 0 },
        intel: { capacity: 1.6, efficiency: .8, depth: 1, comparisons: 2 },
        beauty: { capacity: 1.15, efficiency: 1.1, depth: 0, comparisons: 1 },
        old: { capacity: 1.25, efficiency: 1.3, depth: 0, comparisons: 0 },
        dark: { capacity: 1.2, efficiency: .9, depth: 1, comparisons: 3 } });
    function init(state, base) {
        if (state.evolution) return state.evolution;
        if (!tree[base] || base.includes('_')) throw new Error('Invalid base');
        return state.evolution = { version: 1, base, path: [base], skin: base, mind: base, pending: null,
            growth: Object.fromEntries(families.map(f => [f, []])), gaps: [], lastInput: state.serial, lastEvent: 0 };
    }
    function family(skin) { return Object.values(tree).flat().find(e => e.next === skin)?.family || 'base'; }
    // User-approved asset alias; route IDs and history retain the legacy tree.
    function visualSkin(skin) { return skin === 'ghost_type3_3' ? 'ghost_type3_2' : skin; }
    // Same transition movie naming as the legacy evolution presentation.
    function videoPath(from, to) {
        from = visualSkin(from); to = visualSkin(to);
        const base = to.split('_')[0];
        if (!to.startsWith(base + '_')) return '';
        if (!from || from === base || !from.includes('_')) return `${base}_evol_to_${to.slice(base.length + 1)}.mp4`;
        if (!from.startsWith(base + '_')) return '';
        return `${base}_evol_from_${from.slice(base.length + 1)}_to_${to.slice(base.length + 1)}.mp4`;
    }
    function profile(state) { return profiles[family(state.evolution?.mind)]; }
    function budget(state, body) {
        const p = profile(state), energy = 1 - body.fatigue, satiety = 1 - body.hunger;
        return { energy, satiety, mind: state.evolution?.mind || 'base',
            units: Math.max(16, Math.floor(RULES.units * p.capacity * (.15 + .85 * energy))),
            frames: Math.max(1, Math.floor(RULES.frames * p.capacity * (.15 + .85 * energy))),
            depth: Math.max(1, Math.floor(RULES.depth * satiety) + p.depth),
            candidates: Math.max(1, Math.floor(RULES.candidates * satiety) + p.comparisons),
            efficiency: p.efficiency };
    }
    function constrain(understandings, frames, raw, b) {
        let used = 0, comparisons = 0;
        const omitted = [];
        understandings.forEach((u, i) => {
            const units = Array.from(frames[i].span || raw).length;
            const depth = Math.max(1, (frames[i].relations || []).length);
            const count = u.target?.candidates?.length || 0;
            const reasons = [];
            if (i >= b.frames || used + units > b.units) reasons.push('quantity');
            if (depth > b.depth || count > b.candidates) reasons.push('comparison');
            used += Math.min(units, Math.max(0, b.units - used));
            comparisons += Math.min(count || depth, b.candidates);
            if (!reasons.length) return;
            omitted.push({ index: i, reasons, units, depth, candidates: count });
            u.unresolved.push({ type: 'processing_limit' }); u.complete = false;
            if (u.target) u.target.adopted = null;
        });
        return { ...b, used, comparisons, omitted,
            cost: used * RULES.unitCost / b.efficiency, comparisonCost: comparisons * RULES.compareCost / b.efficiency };
    }
    function consume(body, processing) {
        if (!processing) return;
        body.fatigue = Math.min(1, body.fatigue + processing.cost);
        body.hunger = Math.min(1, body.hunger + processing.comparisonCost);
    }
    function observe(state, world, result, event, reply) {
        const e = state.evolution; if (!e) return;
        const add = (f, id) => { const a = e.growth[f]; if (!a.includes(id) && a.length < 256) a.push(id); };
        if (event && event.id > e.lastEvent) {
            e.lastEvent = event.id;
            if (event.kind === 'experience' && state.knowledge.meanings.some(m => m.id === event.activity || m.id === 'work:' + event.master)) {
                add('power', event.activity + ':' + event.id);
            }
        }
        if (!result || state.serial <= e.lastInput) return;
        e.lastInput = state.serial;
        for (const u of result.understandings) {
            if (u.unresolved.some(x => x.type === 'processing_limit')) continue;
            for (const gap of u.unresolved) if (gap.token && gap.type !== 'utterance' && e.gaps.length < 64 && !e.gaps.includes(gap.token)) e.gaps.push(gap.token);
            if (!u.complete) continue;
            if ((u.relations || []).length >= 2 || (u.target?.candidates?.length || 0) > 1) add('intel', result.input.id);
            for (const id of Object.values(u.known || {})) if (e.gaps.includes(id)) { add('dark', 'resolved:' + id); e.gaps = e.gaps.filter(x => x !== id); }
            if (u.corrects || result.learning.some(x => x.retraction || x.updated?.length && result.interpretations.some(f => f.kind === 'word_correction'))) add('dark', result.input.id);
            if (reply && !['attend', 'uncertain', 'answer_unknown', 'taste_unsure'].includes(reply.message)) {
                // Distinct actual expression/speaker/scene, not elapsed time or vocabulary count.
                add('beauty', [reply.message, result.input.speaker, result.input.scene, u.known?.meaning || ''].join(':'));
                if (reply.experienceId != null && ['past_activity', 'rest_result', 'work_past', 'context_detail'].includes(u.questionSlot)) add('old', 'experience:' + reply.experienceId);
            }
        }
    }
    function choices(state, world) {
        const e = state.evolution; if (!e || e.pending) return [];
        const stage = e.path.length;
        return (tree[e.path.at(-1)] || []).map(route => {
            const required = RULES.first[route.family] * (stage === 1 ? 1 : RULES.secondMultiplier);
            const count = e.growth[route.family].length;
            const diversity = new Set(e.growth.power.map(id => id.split(':')[0])).size;
            const ready = count >= required && (route.family !== 'power' || diversity >= 2)
                && (route.family !== 'old' || world.elapsed >= RULES.reflectionSeconds && e.growth.power.length >= 6);
            return { ...route, count, required, ready };
        });
    }
    function begin(state, world, next) {
        if (!choices(state, world).some(c => c.next === next && c.ready)) return false;
        state.evolution.pending = { from: state.evolution.path.at(-1), next, phase: 'ceremony' };
        return true;
    }
    // The UI calls this only after the visible ceremony has actually drawn the new sprite.
    function complete(state, next) {
        const e = state.evolution;
        if (!e?.pending || e.pending.next !== next || e.pending.from !== e.path.at(-1)) return false;
        e.path.push(next); e.skin = e.mind = next; e.pending = null; return true;
    }
    function select(state, kind, next) {
        const e = state.evolution;
        if (!e || e.pending || !['skin', 'mind'].includes(kind) || !e.path.includes(next)) return false;
        e[kind] = next; return true;
    }
    function valid(state, base) {
        const e = state.evolution; if (e === undefined) return true;
        if (!e || e.version !== 1 || e.base !== base || !tree[base] || base.includes('_')
            || !Array.isArray(e.path) || e.path[0] !== base || e.path.length > 8 || !e.path.length
            || new Set(e.path).size !== e.path.length || !e.path.includes(e.skin) || !e.path.includes(e.mind)
            || !e.path.every((id, i) => typeof id === 'string' && (!i || tree[e.path[i - 1]]?.some(r => r.next === id)))
            || !families.every(f => Array.isArray(e.growth?.[f]) && e.growth[f].length <= 256
                && new Set(e.growth[f]).size === e.growth[f].length && e.growth[f].every(id => typeof id === 'string' && id.length <= 240))
            || !Array.isArray(e.gaps) || e.gaps.length > 64 || e.gaps.some(x => typeof x !== 'string' || x.length > 1000)
            || !Number.isSafeInteger(e.lastInput) || e.lastInput < 0 || e.lastInput > state.serial
            || !Number.isSafeInteger(e.lastEvent) || e.lastEvent < 0) return false;
        return e.pending === null || e.pending?.phase === 'ceremony' && e.pending.from === e.path.at(-1)
            && !!tree[e.pending.from]?.some(r => r.next === e.pending.next);
    }
    return { tree, RULES, profiles, init, family, visualSkin, videoPath, profile, budget, constrain, consume, observe, choices, begin, complete, select, valid, copy };
});
