(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.WordIslandNavigation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const WIDTH = 800, HEIGHT = 480;
    const MASTER_IDS = ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'];
    function graph(assets) {
        const nodes = Object.entries(assets).filter(([, a]) => a.type === 'ground' || a.type === 'road')
            .map(([key, a]) => ({ key, x: a.dx + a.sw * a.scale / 2, y: a.dy + a.sh * a.scale / 2, edges: [] }));
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
            const dx = Math.abs(nodes[i].x - nodes[j].x), dy = Math.abs(nodes[i].y - nodes[j].y);
            if ((Math.abs(dx - 50) < 1 && dy < 1) || (Math.abs(dx - 25) < 1 && Math.abs(dy - 25) < 1)) {
                nodes[i].edges.push(j); nodes[j].edges.push(i);
            }
        }
        return nodes;
    }
    function nearest(nodes, x, y) {
        let best = 0;
        nodes.forEach((node, i) => { if (Math.hypot(node.x - x, node.y - y) < Math.hypot(nodes[best].x - x, nodes[best].y - y)) best = i; });
        return best;
    }
    const position = node => ({ x: node.x / WIDTH, y: node.y / HEIGHT });
    function component(nodes, start) {
        const queue = [start], seen = new Set(queue);
        for (let i = 0; i < queue.length; i++) for (const next of nodes[queue[i]].edges) {
            if (!seen.has(next)) { seen.add(next); queue.push(next); }
        }
        return queue.map(i => nodes[i]);
    }
    function create(assets) {
        const nodes = graph(assets);
        if (!nodes.length) throw new Error('Island has no land');
        const start = nearest(nodes, 300, 200), land = component(nodes, start);
        const trees = Object.entries(assets).filter(([key]) => key.startsWith('palms_'))
            .map(([key, a]) => ({ key, x: a.dx + a.sw * a.scale / 2, y: a.dy + a.sh * a.scale }))
            .filter(tree => Math.hypot(land[nearest(land, tree.x, tree.y)].x - tree.x, land[nearest(land, tree.x, tree.y)].y - tree.y) < 45)
            .sort((a, b) => Math.hypot(a.x - 300, a.y - 200) - Math.hypot(b.x - 300, b.y - 200));
        if (!trees.length) throw new Error('Island has no reachable forest');
        const food = trees[0], rest = trees.find(tree => Math.hypot(tree.x - food.x, tree.y - food.y) > 90) || trees.at(-1);
        const site = (id, meaning, tree) => ({ id, meaning, assetKey: tree.key, ...position(land[nearest(land, tree.x, tree.y + 12)]) });
        const island = { version: 1, assets, spawn: position(nodes[start]), places: [site('berry:1', 'berry', food),
            site('shade', 'rest', rest), { id: 'path', meaning: 'walk', ...position(land[nearest(land, 430, 220)]) }] };
        addMasters(island);
        return island;
    }
    function addMasters(island) {
        if (island.places.some(p => p.id.startsWith('master:'))) return;
        const nodes = graph(island.assets), land = component(nodes, nearest(nodes, island.spawn.x * WIDTH, island.spawn.y * HEIGHT));
        const used = island.places.map(p => ({ x: p.x * WIDTH, y: p.y * HEIGHT }));
        const locations = ['palms_', 'farm_', 'water', 'restaurant_', 'mountain_', 'ground'];
        MASTER_IDS.forEach((id, index) => {
            const candidates = Object.entries(island.assets).filter(([key, a]) => key.startsWith(locations[index]) || a.type === locations[index]);
            const anchors = candidates.map(([key, a]) => ({ key, x: a.dx + a.sw * a.scale / 2, y: a.dy + a.sh * a.scale }));
            const distance = p => anchors.length ? Math.min(...anchors.map(a => Math.hypot(a.x - p.x, a.y - p.y))) : 0;
            const available = land.filter(p => used.every(other => Math.hypot(p.x - other.x, p.y - other.y) >= 55));
            const at = [...(available.length ? available : land)].sort((a, b) => distance(a) - distance(b))[0];
            used.push(at);
            island.places.push({ id: `master:${id}`, meaning: `person:${id}`, ...position(at) });
        });
    }
    function route(world, id) {
        const nodes = graph(world.island.assets), target = world.island.places.find(p => p.id === id);
        if (!target || !nodes.length) return null;
        const start = nearest(nodes, world.x * WIDTH, world.y * HEIGHT);
        const end = nearest(nodes, target.x * WIDTH, target.y * HEIGHT);
        const queue = [start], previous = new Map([[start, null]]);
        for (let i = 0; i < queue.length && !previous.has(end); i++) for (const next of nodes[queue[i]].edges) {
            if (!previous.has(next)) { previous.set(next, queue[i]); queue.push(next); }
        }
        if (!previous.has(end)) return null;
        const path = [];
        for (let i = end; i !== null; i = previous.get(i)) path.unshift(position(nodes[i]));
        return path;
    }
    function attach(world, assets) {
        if (!world.island) {
            world.island = create(assets);
            // Carry all earlier learning and completed experiences. Rehome spatial state only.
            const id = world.mode === 'eat' || world.attention?.startsWith('berry:') ? 'berry:1'
                : world.mode === 'rest' ? 'shade' : world.attention;
            const at = world.island.places.find(p => p.id === id) || world.island.spawn;
            world.x = at.x; world.y = at.y; world.pause = 0;
        }
        addMasters(world.island);
        if (world.mode === 'move') world.route = route(world, world.destination);
        return world.island;
    }
    function valid(island) {
        if (!island || island.version !== 1 || !island.assets || Array.isArray(island.assets)) return false;
        const entries = Object.entries(island.assets);
        if (!entries.length || entries.length > 2000) return false;
        if (!entries.every(([key, a]) => !['__proto__', 'constructor', 'prototype'].includes(key) && a &&
            ['dx', 'dy', 'sx', 'sy', 'sw', 'sh', 'scale'].every(k => Number.isFinite(a[k])) && a.scale > 0 &&
            a.sw > 0 && a.sh > 0 && typeof a.img === 'string' && typeof a.type === 'string')) return false;
        const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) < 10 && Math.abs(p.y) < 10;
        if (!point(island.spawn) || !Array.isArray(island.places) || ![3, 9].includes(island.places.length)) return false;
        if (!['berry:1', 'shade', 'path'].every((id, i) => island.places[i].id === id && point(island.places[i]))) return false;
        if (!['berry', 'rest', 'walk'].every((meaning, i) => island.places[i].meaning === meaning)) return false;
        if (!island.places.slice(0, 2).every(p => island.assets[p.assetKey])) return false;
        if (island.places.length === 9 && !MASTER_IDS.every((id, i) => {
            const p = island.places[i + 3]; return p.id === `master:${id}` && p.meaning === `person:${id}` && point(p);
        })) return false;
        const world = { island, ...island.spawn };
        return island.places.every(p => !!route(world, p.id));
    }
    return { create, attach, route, valid, WIDTH, HEIGHT, MASTER_IDS };
});
