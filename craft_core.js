// Person-owned crafting rules. No UI, storage, global actor or world mutations.
(function (root) {
    'use strict';
    const idOf = item => typeof item === 'string' ? item : item?.id;
    const recipes = {
        mix: [
            { id: 'item_medicine_cold', req: ['herb', 'water'], minRank: 2 },
            { id: 'item_antidote', req: ['herb', 'poison_mushroom'], minRank: 5 },
            { id: 'item_medicine_focus', req: ['water', 'poison_mushroom'], minRank: 6 },
            { id: 'item_medicine_stomach', req: ['herb', 'item_berry'], minRank: 10 }
        ],
        tailor: [
            { id: 'dye', req: ['item_berry'], minRank: 1, isAnyNature: true },
            { id: 'sturdy_thread', req: ['herb'], minRank: 2, isAnyNature: true },
            { id: 'colorful_cloth', req: ['dye', 'sturdy_thread'], minRank: 3 },
            { id: 'brooch_teruteru', req: ['colorful_cloth', 'sturdy_thread'], minRank: 4 },
            { id: 'ribbon_seeker', req: ['colorful_cloth', 'crystal'], minRank: 5 },
            { id: 'tassel_harvest', req: ['colorful_cloth', 'herb'], minRank: 6 },
            { id: 'misanga_health', req: ['colorful_cloth', 'water'], minRank: 7 },
            { id: 'mystic_fabric', req: ['colorful_cloth', 'dye', 'sturdy_thread'], minRank: 8 },
            { id: 'eternal_watch', req: ['mystic_fabric', 'crystal', 'high_wood'], minRank: 9 }
        ]
    };
    const amulets = ['brooch_teruteru', 'ribbon_seeker', 'tassel_harvest', 'misanga_health', 'eternal_watch'];
    const master = type => ({ mix: 'pharmacist', tailor: 'tailor' })[type];
    function seededRandom(seed) {
        let value = seed >>> 0;
        return () => {
            value = (value + 0x6D2B79F5) >>> 0;
            let mixed = Math.imul(value ^ value >>> 15, 1 | value);
            mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, 61 | mixed);
            return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
        };
    }
    function materials(inventory, recipe) {
        const chosen = [];
        for (const required of recipe.req) {
            const index = inventory.findIndex((item, i) => !chosen.includes(i) && item &&
                (recipe.isAnyNature ? ['item_berry', 'herb'].includes(idOf(item)) : idOf(item) === required));
            if (index < 0) return null;
            chosen.push(index);
        }
        return chosen;
    }
    function rank(actor, type) {
        return Number(actor.apprentice?.rank?.[master(type)]) || (type === 'mix' ? 1 : 0);
    }
    function available(actor, type) {
        return (recipes[type] || []).filter(recipe => rank(actor, type) >= recipe.minRank && materials(actor.inventory || [], recipe));
    }
    function start(actor, type, target, options = {}) {
        const random = options.random || Math.random;
        const pRank = rank(actor, type), inventory = actor.inventory || [];
        if (!recipes[type]) return { error: 'invalid_action' };
        if (type === 'tailor' && pRank < 1 && !actor.apprentice?.retired?.tailor) return { error: 'rank' };
        let recipe;
        if (target) {
            recipe = recipes[type].find(value => value.id === target);
            if (!recipe) return { error: 'recipe' };
            if (pRank < recipe.minRank) return { error: 'rank', targetId: recipe.id };
            if (!materials(inventory, recipe)) return { error: 'materials', targetId: recipe.id };
        } else if (type === 'tailor' || pRank >= 2) {
            const candidates = available(actor, type);
            if (!candidates.length) return { error: 'materials' };
            const special = actor.apprentice?.activeQuests?.find(q => q?.isMasterSpecialQuest && !q.completed &&
                (q.eventType === type || type === 'tailor' && q.eventType === 'tailor_recraft'));
            recipe = candidates.find(value => value.id === special?.targetId) || candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
        }
        const forceNewCopy = !!(recipe && type === 'tailor' && actor.apprentice?.activeQuests?.some(q =>
            q?.isMasterSpecialQuest && q.eventType === 'tailor_recraft' && q.targetId === recipe.id));
        const existing = recipe && inventory.find(item => idOf(item) === recipe.id);
        const equipped = recipe && (options.isEquipment ? options.isEquipment(recipe.id) : amulets.includes(recipe.id));
        const plus = equipped && !forceNewCopy && existing && typeof existing !== 'string' ? existing.plus || 0 : 0;
        const stat = actor.stats?.[type === 'mix' ? 'intel' : 'beauty'] || 10;
        const successRate = Math.min(.95, Math.max(0, .5 + stat * .005 + pRank * .05 - (type === 'tailor' ? plus * plus * .01 : 0)));
        // Reserve materials before the unit starts. The rolled result is persisted
        // with the unit, so interruption/reload cannot re-roll or consume twice.
        if (recipe) materials(inventory, recipe).sort((a, b) => b - a).forEach(index => inventory.splice(index, 1));
        const isSuccess = random() < successRate;
        let isGreatSuccess = isSuccess && random() < (pRank >= 8 ? stat * .003 + pRank * .01 : 0);
        if (type === 'tailor' && equipped && !existing) isGreatSuccess = false;
        return {
            type, targetId: type === 'mix' && isGreatSuccess && recipe ? 'elixir' : recipe?.id || 'practice',
            recipeId: recipe?.id || null, successRate, isSuccess, isGreatSuccess,
            isPractice: !recipe, forceNewCopy
        };
    }
    function finish(actor, type, data) {
        if (!data || data.error || data.effectsApplied) return null;
        data.effectsApplied = true;
        if (data.isPractice) return { practice: true, count: 0 };
        const skill = type === 'mix' ? 'mixing' : 'tailoring';
        actor.skills ||= {};
        actor.skills[skill] = (actor.skills[skill] || 1) + (data.isSuccess ? .5 : .1);
        if (!data.isSuccess) {
            const itemId = type === 'mix' ? 'item_medicine_fail' : 'tangled_thread';
            actor.inventory.push(itemId);
            return { success: false, itemId, count: 1 };
        }
        actor.stats[type === 'mix' ? 'intel' : 'beauty'] += .5;
        actor.stats.mood += data.isGreatSuccess ? 15 : 5;
        let count = 1, plus = 0, upgraded = false;
        if (type === 'mix') actor.inventory.push(data.targetId);
        else {
            const bonus = data.isGreatSuccess ? Math.min(5, 1 + Math.floor((actor.stats.beauty || 10) / 100)) : 0;
            if (amulets.includes(data.targetId)) {
                const index = data.forceNewCopy ? -1 : actor.inventory.findIndex(item => idOf(item) === data.targetId);
                if (index < 0) actor.inventory.push({ id: data.targetId, age: 0, plus: 0 });
                else {
                    let item = actor.inventory[index];
                    if (typeof item === 'string') actor.inventory[index] = item = { id: item, age: 0, plus: 0 };
                    item.plus = (item.plus || 0) + 1 + bonus;
                    plus = item.plus; upgraded = true;
                }
            } else {
                count = 1 + bonus;
                for (let i = 0; i < count; i++) actor.inventory.push(data.targetId);
            }
        }
        for (const quest of actor.apprentice?.activeQuests || []) {
            if (quest.masterType !== master(type) || quest.isMasterSpecialQuest || quest.completed) continue;
            const targets = type === 'mix'
                ? { 3: 'item_medicine_cold', 5: 'item_antidote', 6: 'item_medicine_focus', 8: 'elixir' }
                : Object.fromEntries(recipes.tailor.map(recipe => [recipe.minRank, recipe.id]));
            if (type === 'mix' && quest.rank === 2 || targets[quest.rank] === data.targetId) quest.qVal = (quest.qVal || 0) + 1;
        }
        return { success: true, itemId: data.targetId, count, plus, upgraded, amulet: amulets.includes(data.targetId) };
    }
    root.CraftCore = { recipes, amulets, master, materials, rank, available, start, finish, seededRandom, durationSeconds: 30 };
    if (typeof module !== 'undefined') module.exports = root.CraftCore;
})(typeof window === 'undefined' ? globalThis : window);
