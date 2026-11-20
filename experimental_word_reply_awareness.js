(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordReplyAwareness = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Conversation-only, per-session projection. Never reads restored experience history.
    const activities = ['rest', 'eat', 'move'];
    const unit = n => Number.isFinite(n) && n >= 0 && n <= 1;
    function valid(value) {
        return value && Object.keys(value).every(k => ['activity', 'fatigue', 'hunger', 'recent'].includes(k))
            && [...activities, 'other'].includes(value.activity) && unit(value.fatigue) && unit(value.hunger)
            && Array.isArray(value.recent) && value.recent.length <= 3 && value.recent.every(e => e
                && Object.keys(e).every(k => ['activity', 'secondsAgo', 'fatigueChange', 'hungerChange', 'taste'].includes(k))
                && activities.includes(e.activity) && Number.isFinite(e.secondsAgo) && e.secondsAgo >= 0 && e.secondsAgo <= 180
                && (e.fatigueChange === undefined || Number.isFinite(e.fatigueChange) && Math.abs(e.fatigueChange) <= 1)
                && (e.hungerChange === undefined || Number.isFinite(e.hungerChange) && Math.abs(e.hungerChange) <= 1)
                && (e.taste === undefined || ['sweet', 'bitter', 'sour'].includes(e.taste)));
    }
    function create(start = 0) {
        let recent = [], pending = null, lastSpoke = start, unanswered = false;
        function observe(event, now) {
            const e = event?.walkingExperience || event;
            const activity = event?.kind === 'arrive' || event?.walkingExperience || e?.activity === 'walk' ? 'move' : e?.activity;
            if (!e || !activities.includes(activity)) return;
            const entry = { activity, at: now };
            for (const field of ['fatigue', 'hunger']) {
                if (unit(e.before?.[field]) && unit(e.after?.[field])) entry[field + 'Change'] = e.after[field] - e.before[field];
            }
            if (activity !== 'move' && (!('fatigueChange' in entry) || !('hungerChange' in entry))) return;
            if (['sweet', 'bitter', 'sour'].includes(e.taste?.quality)) entry.taste = e.taste.quality;
            recent = [...recent, entry].slice(-3); pending = entry;
        }
        return {
            observe,
            context(world) {
                return { activity: activities.includes(world.mode) ? world.mode : 'other', fatigue: world.fatigue, hunger: world.hunger,
                    recent: recent.filter(e => world.elapsed >= e.at && world.elapsed - e.at <= 180).map(({ at, ...e }) => ({ ...e, secondsAgo: world.elapsed - at })) };
            },
            playerSpoke(now) { unanswered = false; pending = null; lastSpoke = now; },
            take(now, blocked) {
                if (blocked || unanswered || !pending || now - lastSpoke < 90 || now - pending.at < 8) return false;
                if (now - pending.at > 180) { pending = null; return false; }
                pending = null; lastSpoke = now; unanswered = true; return true;
            }
        };
    }
    return { create, valid };
});
