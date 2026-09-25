(function () {
    'use strict';
    const enabled = window.GameRelease?.edition === 'demo';
    const basicCareers = new Set(['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building']);
    const boundActors = new WeakSet(), boundStats = new WeakSet();
    const limitMessage = '体験版での修行はここまでです。引き続き島での暮らしを楽しめます。';

    function bindStats(hero) {
        if (!enabled || !hero || boundActors.has(hero)) return;
        Object.defineProperty(hero, 'isSick', { enumerable: true, get: () => false, set() {} });
        const healthy = conditions => {
            const result = { ...(conditions || {}) };
            for (const key of ['cold', 'stomachache', 'poisoning']) {
                Object.defineProperty(result, key, { enumerable: true, get: () => false, set() {} });
            }
            return result;
        };
        let conditions = healthy(hero.conditions);
        Object.defineProperty(hero, 'conditions', { enumerable: true, get: () => conditions,
            set: next => { conditions = healthy(next); } });
        function prepare(stats) {
            if (!stats || typeof stats !== 'object' || boundStats.has(stats)) return stats;
            boundStats.add(stats);
            for (const key of ['intel', 'power', 'beauty', 'speed']) {
                const clamp = value => typeof value === 'number' ? Math.min(150, value) : value;
                let value = clamp(stats[key]);
                Object.defineProperty(stats, key, { enumerable: true, configurable: false,
                    get: () => value, set: next => { value = clamp(next); } });
            }
            return stats;
        }
        let stats = prepare(hero.stats);
        Object.defineProperty(hero, 'stats', { enumerable: true, configurable: false,
            get: () => stats, set: next => { stats = prepare(next); } });
        boundActors.add(hero);
    }

    function questBlocked(master, rank) {
        return enabled && basicCareers.has(master) && Number(rank) >= 9;
    }

    function hideFacilities(map, fresh = false) {
        if (!enabled) return;
        // Keep the full-edition facility outside the playable map, so importing
        // the island will not permanently lose the pharmacist's starting shop.
        const reserved = fresh ? {} : JSON.parse(localStorage.getItem('demo_full_facilities_v1') || '{}');
        for (const [id, asset] of Object.entries(map)) {
            if (asset.type !== 'pharmacy' && asset.name !== '薬局') continue;
            reserved[id] = asset;
            delete map[id];
        }
        localStorage.setItem('demo_full_facilities_v1', JSON.stringify(reserved));
    }

    function markEnded(hero, at = Date.now()) {
        if (!enabled || !hero) return false;
        if (!hero.demoProgress?.ended) hero.demoProgress = { version: 1, ended: true, endedAt: at };
        hero.isReincarnating = true;
        hero.actionState = 'idle';
        hero.visualAction = 'idle';
        hero.schedule = [];
        hero.pathQueue = [];
        return true;
    }

    function ended(hero) {
        return enabled && !!hero && (!!hero.demoProgress?.ended || Number(hero.age) >= (Number(hero.lifespan) || 100));
    }

    window.DemoRules = Object.freeze({ enabled, bindStats, questBlocked, markEnded, ended, limitMessage, hideFacilities,
        lockedQuest: () => ({ name: limitMessage, desc: limitMessage, setup() {}, check: () => false }),
        maxSkipRank: rank => enabled ? Math.min(8, rank) : rank
    });
})();
