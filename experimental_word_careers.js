(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordCareers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Introductory work only. No legacy vocabulary gate, entrance exam or Rank grants.
    const JOBS = Object.freeze({
        explore: { location: 'palms', action: 'move', seconds: 14, effort: .05, result: 'supplies_carried', image: 'adventurer_battle_enemy.png', sx: 794, sw: 1344 },
        farming: { location: 'farm', action: 'farm_plow', seconds: 16, effort: .07, result: 'stones_cleared', image: 'farmer_battle_enemy.png', sx: 758, sw: 1248 },
        fishing: { location: 'water', action: 'study', seconds: 18, effort: .03, result: 'net_repaired', image: 'fisherman_battle_enemy.png', sx: 839, sw: 1248 },
        cooking: { location: 'restaurant', action: 'cook', seconds: 14, effort: .04, result: 'dishes_washed', image: 'chef_battle_enemy.png', sx: 439, sw: 1766 },
        smithing: { location: 'mountain', action: 'smith', seconds: 16, effort: .08, result: 'fire_tended', image: 'smith_battle_enemy.png', sx: 794, sw: 1344 },
        building: { location: 'ground', action: 'study', seconds: 18, effort: .03, result: 'plan_copied', image: 'builder_battle_enemy.png', sx: 839, sw: 1248 }
    });
    const jobId = target => typeof target === 'string' && target.startsWith('master:') && Object.hasOwn(JOBS, target.slice(7)) ? target.slice(7) : null;
    function ensure(world) {
        world.careers ||= { version: 1, people: {}, current: null };
        return world.careers;
    }
    function arrive(world, event) {
        const id = jobId(event.target);
        if (!id) return null;
        const careers = ensure(world), first = !careers.people[id];
        const person = careers.people[id] ||= { metAt: world.elapsed, visits: 0, observed: 0, completed: 0, interest: 0, learning: false, outcomes: [] };
        if (person.lastArrival === event.id) return null;
        person.lastArrival = event.id;
        person.visits++; world.dwell = 8;
        return { message: first ? 'master_meet' : 'master_return', master: id,
            npc: first ? `master_intro_${id}` : null, observation: true };
    }
    function tick(world) {
        const id = jobId(world.attention);
        if (!id || !world.careers?.people[id]) return null;
        const person = world.careers.people[id], job = JOBS[id];
        if (world.mode === 'observe' && world.dwell <= 0) {
            person.observed++;
            // Looking is not agreeing to work. The actor may leave to meet bodily needs.
            if (world.hunger > .65 || world.fatigue > .6) {
                world.mode = 'idle'; world.dwell = 2; world.attention = null;
                return { id: ++world.event, kind: 'master_defer', master: id };
            }
            person.learning = true;
            world.careers.current = id;
            world.mode = 'work'; world.dwell = job.seconds; world.activityStart = world.elapsed;
            world.activityBefore = { hunger: world.hunger, fatigue: world.fatigue, completed: person.completed };
            world.reasons = [{ kind: person.completed ? 'work_recall' : 'observed_work', target: world.attention }];
            return { id: ++world.event, kind: 'work_start', master: id, target: world.attention };
        }
        if (world.mode !== 'work' || world.dwell > 0) return null;
        world.fatigue = Math.min(1, world.fatigue + job.effort);
        person.completed++;
        // Interest in another attempt comes from encountered work and the body's actual cost.
        const cost = world.fatigue - world.activityBefore.fatigue;
        person.interest = Math.max(0, Math.min(1, person.interest + .22 - cost));
        const experience = { id: ++world.event, kind: 'experience', activity: 'work', master: id,
            target: world.attention, start: world.activityStart, end: world.elapsed,
            before: { ...world.activityBefore }, after: { hunger: world.hunger, fatigue: world.fatigue, completed: person.completed },
            result: job.result, demonstration: world.careers.demonstration || null,
            reasons: JSON.parse(JSON.stringify(world.reasons)) };
        world.careers.demonstration = null;
        person.outcomes.push(experience.id);
        world.experiences.push(experience);
        world.history.push({ mode: 'work', target: world.attention, start: experience.start, end: experience.end, reasons: experience.reasons });
        world.mode = 'idle'; world.dwell = 4; world.attention = null; world.careers.current = null;
        return experience;
    }
    function choose(world, candidates) {
        if (!world.careers) return candidates[0];
        // First encounters stay available; afterwards interest competes with time since the last visit.
        const score = place => {
            const id = jobId(place.id), person = world.careers.people[id];
            return (world.visited[place.id] === undefined ? 10000 : world.elapsed - world.visited[place.id])
                + (person?.completed ? person.interest - .08 : 0) * 120;
        };
        return [...candidates].sort((a, b) => score(b) - score(a))[0];
    }
    // A demonstrated label and the actor's completed action are both required.
    // Existing saves without a demonstration are not retroactively taught words.
    function learn(state, event) {
        if (event.activity !== 'work' || event.demonstration !== `work_label_${event.master}` || !Object.hasOwn(JOBS, event.master)
            || event.result !== JOBS[event.master].result) return;
        for (const id of ['work', `work:${event.master}`]) {
            let meaning = state.knowledge.meanings.find(m => m.id === id);
            if (!meaning) {
                meaning = { id, source: 'demonstrated_work', evidence: [] };
                state.knowledge.meanings.push(meaning);
            }
            if (meaning.source === 'demonstrated_work' && !meaning.evidence.some(e => e.experienceId === event.id)) {
                meaning.evidence.push({ experienceId: event.id, master: event.master, demonstration: event.demonstration });
            }
        }
    }
    function willingness(world, id) {
        if (!world.careers?.people[id]?.completed) return 'work_untried';
        if (world.hunger > .5) return 'work_hungry';
        if (world.fatigue > .55) return 'work_tired';
        return world.careers.people[id].interest >= .08 ? 'work_again' : 'work_other';
    }
    function validLearning(state) {
        return state.knowledge.meanings.filter(m => m.source === 'demonstrated_work').every(m =>
            (m.id === 'work' || Object.hasOwn(JOBS, m.id.slice(5)) && m.id.startsWith('work:')) &&
            Array.isArray(m.evidence) && m.evidence.length > 0 && m.evidence.every(source =>
                source && source.demonstration === `work_label_${source.master}` &&
                (m.id === 'work' || m.id === `work:${source.master}`) &&
                state.experiences?.some(e => e.id === source.experienceId && e.master === source.master &&
                    e.activity === 'work' && e.demonstration === source.demonstration && e.result === JOBS[source.master]?.result)));
    }
    function answer(world, state, u) {
        const slots = ['work_past', 'work_again', 'work_current'];
        const pastWork = u.questionSlot === 'past_activity' && world.history.at(-1)?.mode === 'work';
        if (!slots.includes(u.questionSlot) && !pastWork && !(u.questionSlot === 'current_activity' && world.mode === 'work')) return null;
        const last = [...world.experiences].reverse().find(e => e.activity === 'work');
        const id = u.known.meaning?.startsWith('work:') ? u.known.meaning.slice(5) : jobId(world.attention) || last?.master;
        if (state.settings.speech !== 'short') return { message: 'attend' };
        if (u.questionSlot === 'work_again') return { message: willingness(world, id), master: id,
            experienceId: [...world.experiences].reverse().find(e => e.activity === 'work' && e.master === id)?.id };
        if (u.questionSlot === 'work_current' || u.questionSlot === 'current_activity') {
            return { message: world.mode === 'work' ? 'work' : 'answer_unknown', observation: world.mode === 'work' };
        }
        if (!last) return { message: 'work_untried' };
        const known = state.knowledge.meanings.some(m => m.id === `work:${last.master}`);
        return { message: known ? `work_did_${last.master}` : 'answer_unknown', master: last.master, experienceId: last.id };
    }
    function reply(event) {
        if (event.kind === 'work_start') return { message: 'master_try', master: event.master, observation: true };
        if (event.kind === 'master_defer') return { message: 'master_defer', master: event.master, observation: true };
        if (event.kind === 'experience' && event.activity === 'work') return { message: `master_result_${event.master}`, master: event.master, observation: true };
        return null;
    }
    function valid(world) {
        const value = world.careers;
        if (value === undefined) return world.mode !== 'work';
        if (!value || value.version !== 1 || !value.people || Array.isArray(value.people)) return false;
        if (!Object.entries(value.people).every(([id, p]) => Object.hasOwn(JOBS, id) && p &&
            ['visits', 'observed', 'completed'].every(k => Number.isInteger(p[k]) && p[k] >= 0) &&
            Number.isFinite(p.metAt) && Number.isFinite(p.interest) && p.interest >= 0 && p.interest <= 1 &&
            typeof p.learning === 'boolean' && Array.isArray(p.outcomes) && p.outcomes.every(Number.isInteger))) return false;
        if (value.current !== null && !Object.hasOwn(value.people, value.current)) return false;
        if (value.demonstration != null && (world.mode !== 'work' || value.demonstration !== `work_label_${value.current}`)) return false;
        return world.mode !== 'work' || (jobId(world.attention) === value.current && !!value.current &&
            world.activityBefore && Number.isFinite(world.activityBefore.completed) &&
            Number.isFinite(world.activityBefore.hunger) && Number.isFinite(world.activityBefore.fatigue));
    }
    return Object.freeze({ JOBS, jobId, ensure, arrive, tick, choose, reply, valid, validLearning, learn, willingness, answer });
});
