(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDungeonPreview = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // A disposable authored comparison, independent of the real learning/world/save APIs.
    const grid = Object.freeze(['#########', '#.......#', '#...#...#', '#...#...#', '#.......#', '#.......#', '#########']);
    const directions = Object.freeze({ up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] });
    const copy = value => JSON.parse(JSON.stringify(value));
    const same = (a, b) => a.x === b.x && a.y === b.y;
    const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const key = p => p.x + ',' + p.y;
    function create(scenario = 'explore') {
        const position = scenario === 'danger' ? { x: 5, y: 3 } : { x: 2, y: 3 };
        return { scenario: scenario === 'danger' ? 'danger' : 'explore', position,
            hazard: { x: 6, y: 3 }, exit: { x: 7, y: 1 }, known: { move: true, retreat: true, exit: true },
            turn: 0, sequence: 0, complete: false, visited: [key(position)], events: [] };
    }
    function setKnown(state, meaning, value) {
        const next = copy(state);
        if (Object.hasOwn(next.known, meaning) && typeof value === 'boolean') next.known[meaning] = value;
        return next;
    }
    function neighbors(state, position) {
        return Object.entries(directions).map(([action, [dx, dy]]) => ({ action, x: position.x + dx, y: position.y + dy }))
            .filter(p => grid[p.y]?.[p.x] === '.' && !same(p, state.hazard));
    }
    function retreat(state) {
        return neighbors(state, state.position).sort((a, b) => distance(b, state.hazard) - distance(a, state.hazard)
            || Number(state.visited.includes(key(a))) - Number(state.visited.includes(key(b))))[0]?.action || 'wait';
    }
    function towardExit(state) {
        const queue = [{ ...state.position, first: null }], seen = new Set([key(state.position)]);
        for (let i = 0; i < queue.length; i++) {
            const p = queue[i];
            if (same(p, state.exit)) return p.first || 'wait';
            for (const n of neighbors(state, p)) if (!seen.has(key(n)) && distance(n, state.hazard) > 1) {
                seen.add(key(n)); queue.push({ ...n, first: p.first || n.action });
            }
        }
        return 'wait';
    }
    function step(state, requested = null) {
        const next = copy(state);
        if (next.complete) return next;
        const before = copy(next.position), group = requested === 'retreat' ? 'retreat' : requested === 'exit' ? 'exit' : 'move';
        const recognized = requested === null || Object.hasOwn(directions, requested) || ['retreat', 'exit', 'wait'].includes(requested);
        let action = null, reason = 'unknown', source = requested === null ? 'autonomous' : 'instruction';
        const understood = requested === null ? null : recognized && next.known[group];
        if (requested === null || understood) {
            action = requested === null ? distance(before, next.hazard) <= 1 ? retreat(next) : towardExit(next)
                : requested === 'retreat' ? retreat(next) : requested === 'exit' ? towardExit(next) : requested;
            reason = requested === null ? distance(before, next.hazard) <= 1 ? 'retreat' : 'explore' : 'obey';
            const vector = directions[action], target = vector ? { x: before.x + vector[0], y: before.y + vector[1] } : null;
            if (requested !== null && requested !== 'retreat'
                && (target && distance(target, next.hazard) <= 1 || action === 'wait' && distance(before, next.hazard) <= 1)) {
                action = retreat(next); reason = 'diverged'; source = 'autonomous';
            }
            const destination = neighbors(next, before).find(p => p.action === action);
            if (destination) next.position = { x: destination.x, y: destination.y };
            else if (action !== 'wait') { action = 'wait'; reason = 'blocked'; }
            else if (reason === 'obey') reason = 'wait';
            next.turn++;
            if (!next.visited.includes(key(next.position))) next.visited.push(key(next.position));
            next.complete = same(next.position, next.exit);
        }
        next.sequence++;
        next.events.push({ id: next.sequence, turn: next.turn, requested, understood, source, action,
            reason, before, after: copy(next.position), arrived: next.complete });
        next.events = next.events.slice(-60);
        return next;
    }
    return Object.freeze({ create, setKnown, step, grid });
});
