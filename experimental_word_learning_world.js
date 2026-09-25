(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_careers') : root.ExperimentalWordCareers);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordWorld = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (careers) {
    'use strict';
    const PLACES = Object.freeze([
        { id: 'berry:1', meaning: 'berry', x: .28, y: .65 },
        { id: 'shade', meaning: 'rest', x: .76, y: .57 },
        { id: 'path', meaning: 'walk', x: .52, y: .82 }
    ]);
    let navigation = null;
    const places = world => world.island?.places || PLACES;
    function setNavigation(resolve) { navigation = resolve; }
    function create() {
        return { x: .5, y: .65, mode: 'idle', destination: null, elapsed: 0, dwell: 3,
            pause: 0, visited: {}, attention: null, reaction: 'attend', reactionTime: 0,
            lastRest: 0, event: 0, reasons: [], speech: null, history: [], activityStart: 0,
            askedNames: {}, sharedReports: {}, hunger: .35, fatigue: .15,
            fruit: 2, growth: 0, harvest: 0, experiences: [], recovery: {}, sleepCount: 0 };
    }
    function approach(world, id, reason = 'curiosity') {
        if (world.mode === 'eat' || world.mode === 'work') return false;
        if (!places(world).some(p => p.id === id)) return false;
        const route = world.island && navigation ? navigation(world, id) : null;
        if (world.island && !route) return false;
        if (world.mode !== 'move' && world.elapsed > world.activityStart) {
            world.history.push({ mode: world.mode, target: world.attention, start: world.activityStart,
                end: world.elapsed, reasons: JSON.parse(JSON.stringify(world.reasons)) });
        }
        world.destination = id; world.mode = 'move'; world.attention = null;
        if (world.island) world.route = route;
        world.activityStart = world.elapsed;
        world.reasons = [{ kind: reason, target: id }]; world.speech = null;
        return true;
    }
    function tick(world, seconds, paused = false) {
        if (paused || !Number.isFinite(seconds) || seconds <= 0) return null;
        const dt = Math.min(seconds, .1); // No catch-up after hidden tabs or long stalls.
        world.elapsed += dt;
        world.reactionTime = Math.max(0, world.reactionTime - dt);
        if (world.pause > 0) { world.pause = Math.max(0, world.pause - dt); return null; }
        world.hunger = Math.min(1, world.hunger + dt / 180);
        world.fatigue = Math.min(1, world.fatigue + (world.mode === 'rest' ? -dt / 28 : dt / 220));
        world.fatigue = Math.max(0, world.fatigue);
        if (world.fruit < 3) {
            world.growth += dt;
            if (world.growth >= 65) { world.fruit++; world.growth = 0; }
        } else world.growth = 0;
        if (world.mode === 'move') {
            const target = places(world).find(p => p.id === world.destination);
            const waypoint = world.route?.[0] || target;
            const dx = waypoint.x - world.x, dy = waypoint.y - world.y;
            const distance = Math.hypot(dx, dy), step = dt * .065 * (world.fatigue > .55 ? .8 : 1);
            if (distance > step) { world.x += dx / distance * step; world.y += dy / distance * step; return null; }
            world.x = waypoint.x; world.y = waypoint.y;
            if (world.route?.length) {
                world.route.shift();
                if (world.route.length) return null;
            }
            world.history.push({ mode: 'move', target: target.id, start: world.activityStart, end: world.elapsed,
                reasons: JSON.parse(JSON.stringify(world.reasons)) });
            world.activityStart = world.elapsed;
            world.activityBefore = { hunger: world.hunger, fatigue: world.fatigue };
            world.mode = target.id === 'shade' ? 'rest' : 'observe';
            world.attention = target.id === 'berry:1' ? (world.fruit ? `berry:${world.harvest + 1}` : null) : target.id;
            world.visited[target.id] = world.elapsed; world.dwell = target.id === 'shade' ? 11 : 9;
            if (target.id === 'shade') world.lastRest = world.elapsed;
            return { id: ++world.event, kind: 'arrive', target: world.attention, reasons: world.reasons };
        }
        world.dwell -= dt;
        const careerEvent = world.island && careers?.tick(world);
        if (careerEvent) return careerEvent;
        if (world.mode === 'observe' && world.attention?.startsWith('berry:') && world.hunger >= .45 && world.fruit > 0 && world.dwell < 5) {
            world.mode = 'eat'; world.dwell = 5; world.activityStart = world.elapsed;
            world.activityBefore = { hunger: world.hunger, fatigue: world.fatigue };
            world.fruit--; world.harvest++;
            // Sensory properties of this trial's ripe fruit, not inferred from hunger recovery.
            world.mealTaste = { quality: 'sweet', pleasant: true };
            return { id: ++world.event, kind: 'eat_start', target: `berry:${world.harvest}` };
        }
        if (world.dwell <= 0) {
            if (world.mode === 'eat' || world.mode === 'rest') {
                const kind = world.mode;
                if (kind === 'eat') world.hunger = Math.max(0, world.hunger - .55);
                const experience = { id: ++world.event, kind, start: world.activityStart, end: world.elapsed,
                    target: kind === 'eat' ? `berry:${world.harvest}` : 'shade', before: world.activityBefore,
                    after: { hunger: world.hunger, fatigue: world.fatigue } };
                if (kind === 'eat' && world.mealTaste) {
                    experience.taste = { ...world.mealTaste }; world.mealTaste = null;
                }
                world.experiences.push(experience);
                if (kind === 'rest') world.sleepCount++;
                if (experience.before && (kind === 'eat' ? experience.before.hunger > world.hunger : experience.before.fatigue > world.fatigue)) world.recovery[kind] = experience.id;
                world.mode = 'idle'; world.dwell = 3; world.attention = null;
                world.history.push({ mode: kind, target: experience.target, start: experience.start, end: experience.end, reasons: world.reasons });
                return { ...experience, kind: 'experience', activity: kind };
            }
            const candidates = places(world).filter(p => p.id !== world.attention);
            candidates.sort((a, b) => (world.visited[a.id] ?? -100) - (world.visited[b.id] ?? -100));
            const need = world.fatigue > .55 && world.recovery.rest ? 'shade'
                : world.hunger > .5 && world.fruit && world.recovery.eat ? 'berry:1' : null;
            const next = world.island && careers ? careers.choose(world, candidates) : candidates[0];
            approach(world, need || next.id, need ? 'experienced_recovery' : 'curiosity');
        }
        return null;
    }
    function perception(world) {
        const list = places(world);
        const item = world.attention?.startsWith('berry:') ? { ...list[0], id: world.attention } : list.find(p => p.id === world.attention);
        return { scene: item?.id?.startsWith('master:') ? item.id : item?.id === 'path' ? 'path' : 'clearing',
            attention: item ? [{ id: item.id, meaning: item.meaning }] : [] };
    }
    function nameReply(state, link) {
        if (state.settings.speech !== 'short') return { message: 'recognize_gesture', word: link.word, target: link.target };
        if (link.confirmedBy) return { message: 'name_known', word: link.word, target: link.target };
        const evidence = link.evidence.filter(e => !e.retractedBy).at(-1);
        state.context.pendingQuestion = { kind: 'confirm_name', word: link.word, target: link.target,
            inputId: evidence.inputId, speaker: link.speaker, expires: state.serial + 1 };
        return { message: 'name_echo', word: link.word, target: link.target };
    }
    // Read one grounded snapshot for all situation questions. Answering does not
    // approach a place, add naming evidence or turn a destination into perception.
    function answerSituation(world, u, state) {
        if (!['current_activity', 'past_activity', 'attention', 'destination'].includes(u.questionSlot)) return null;
        const knows = id => state.knowledge.meanings.some(entry => entry.id === id);
        const meaningOf = target => target?.startsWith('berry:') ? 'berry'
            : target === 'shade' ? 'rest' : target === 'path' ? 'walk' : null;
        const past = u.questionSlot === 'past_activity';
        const activity = past ? world.history.at(-1) : { mode: world.mode, target: world.attention };
        let message = 'answer_unknown';
        if (u.questionSlot === 'destination') {
            const meaning = world.mode === 'move' ? meaningOf(world.destination) : null;
            if (meaning && knows(meaning) && knows('walk')) message = `going_${meaning}`;
            else if (world.mode !== 'move' && knows('walk')) message = 'not_going';
        } else if (u.questionSlot === 'attention' || activity?.mode === 'observe') {
            const target = u.questionSlot === 'attention' ? world.attention : activity?.target;
            const meaning = meaningOf(target);
            if (meaning && knows(meaning)) message = `${past ? 'looked' : 'looking'}_${meaning === 'berry' ? 'berry' : meaning}`;
        } else if (activity) {
            const terms = { move: ['walk', 'walking', 'walked'], rest: ['rest', 'resting', 'rested'],
                eat: ['eat', 'eating', 'ate'], idle: ['rest', 'taking_break', 'took_break'] }[activity.mode];
            if (terms && knows(terms[0])) message = terms[past ? 2 : 1];
        }
        return { message: state.settings.speech === 'short' ? message : 'attend' };
    }

    function rememberOutput(world, state, response, input = null, event = null, inherited = null) {
        const copy = value => JSON.parse(JSON.stringify(value));
        const observation = !!response.observation || ['ate_gesture', 'woke_gesture'].includes(response.message);
        const source = { kind: observation ? 'observation' : 'speech', inputId: input?.id || null,
            eventId: event?.id ?? null, at: world.elapsed, message: response.message };
        let focus = { topic: null, subject: response.message === 'player_likes_berry' ? 'player' : 'self', meanings: [], requiredMeanings: [], source };
        if (inherited) {
            focus = copy(inherited);
            focus.response = copy(response);
            if (['tastes_good', 'tasted_good'].includes(response.message) && !focus.meanings.includes('sweet')) {
                focus.meanings.push('sweet'); focus.requiredMeanings.push('sweet');
            }
        }
        else {
            const groups = [
                ['rest', ['taking_break', 'took_break', 'resting', 'rested', 'rest_helped', 'woke_gesture']],
                ['eat', ['eating', 'ate', 'tastes_good', 'tasted_good', 'ate_gesture']],
                ['walk', ['walking', 'walked']],
                ['berry', ['looking_berry', 'looked_berry', 'known_berry']],
                ['rest', ['looking_rest', 'looked_rest']], ['walk', ['looking_walk', 'looked_walk']]
            ];
            focus.topic = groups.find(([, messages]) => messages.includes(response.message))?.[0] || null;
            const work = response.master || (response.message === 'work' ? world.careers?.current : null);
            if (work && (response.message.startsWith('work_did_') || response.message.startsWith('master_result_')
                || ['work', 'master_try', 'work_again', 'work_other', 'work_hungry', 'work_tired'].includes(response.message))) focus.topic = `work:${work}`;
            focus.eventTime = event?.kind === 'experience' || /^(?:took_break|rested|rest_helped|ate|tasted_good|walked|looked_|work_did_|master_result_)/u.test(response.message) ? 'past' : 'present';
            const experience = response.experienceId != null ? world.experiences.find(e => e.id === response.experienceId)
                : event?.kind === 'experience' ? world.experiences.find(e => e.id === event.id)
                : ['tasted_good', 'rest_helped'].includes(response.message)
                    ? [...world.experiences].reverse().find(e => e.kind === (response.message === 'tasted_good' ? 'eat' : 'rest')) : null;
            focus.evidence = { experienceId: experience?.id ?? null,
                activity: copy(experience || (focus.eventTime === 'past' ? world.history.at(-1) : null)
                    || { mode: world.mode, target: world.attention, start: world.activityStart, end: world.elapsed,
                        ...(world.mode === 'eat' && world.mealTaste ? { taste: world.mealTaste } : {}) }) };
            focus.meanings = focus.topic ? [focus.topic] : [];
            if (['tastes_good', 'tasted_good'].includes(response.message)) focus.meanings.push('sweet');
            focus.requiredMeanings = [...focus.meanings];
            if (response.message === 'rest_helped') focus.requiredMeanings.push('tired');
            if (focus.topic?.startsWith('work:')) focus.requiredMeanings.push('work');
            focus.response = copy(response);
        }
        focus.serial = state.serial; focus.listener = input?.speaker || 'player'; focus.inputId = input?.id || null;
        focus.deliveryKind = observation ? 'observation' : 'speech';
        state.context.lastOutput = focus;
    }

    function answerContext(world, state, u) {
        const focus = u.contextReference;
        if (!focus || !u.relations.includes('question')) return { message: 'attend' };
        if (focus.source.kind === 'observation' && u.unresolved.some(item => item.token === 'relief')) {
            return { message: 'observed_feeling_unknown', observation: true };
        }
        if (!u.complete || state.settings.speech !== 'short') return { message: 'attend' };
        const message = focus.response.message;
        if (u.known.meaning === 'sweet' && !focus.meanings.includes('sweet')) {
            const taste = focus.evidence.activity.taste;
            return { message: taste?.quality === 'sweet' && taste.pleasant ? 'tasted_good' : 'taste_unsure',
                experienceId: focus.evidence.experienceId };
        }
        if (['taking_break', 'took_break', 'break_explained'].includes(message)) {
            return { message: 'break_explained' };
        }
        if (focus.topic.startsWith('work:') && focus.evidence.experienceId !== null
            && /^(?:work_did_|master_result_)/u.test(message)) {
            return { message: `work_did_${focus.topic.slice(5)}`, master: focus.topic.slice(5), experienceId: focus.evidence.experienceId };
        }
        if (focus.deliveryKind === 'observation') {
            if (focus.evidence.experienceId === null) return { message: 'answer_unknown' };
            return { message: focus.topic === 'eat' ? 'ate' : focus.topic === 'rest' ? 'rested' : 'answer_unknown',
                experienceId: focus.evidence.experienceId };
        }
        const former = { tastes_good: 'tasted_good', eating: 'ate', resting: 'rested', walking: 'walked',
            looking_berry: 'looked_berry', looking_rest: 'looked_rest', looking_walk: 'looked_walk' };
        if (former[message] && focus.eventTime === 'present'
            && (world.mode !== focus.evidence.activity.mode || world.activityStart !== focus.evidence.activity.start)) {
            return { ...focus.response, message: former[message] };
        }
        return JSON.parse(JSON.stringify(focus.response));
    }

    function respond(world, result, state) {
        const u = result.understandings.at(-1);
        const turn = state.context.turns.find(item => item.id === result.input.id);
        if (u.complete && u.questionSlot === 'repeat_answer') {
            const previous = state.context.turns.find(item => item.id === u.answerReference?.turnId);
            if (previous?.answer && previous.speaker === result.input.speaker) {
                if (turn) turn.answer = JSON.parse(JSON.stringify(previous.answer));
                world.reactionTime = 5;
                const original = state.context.lastOutput;
                rememberOutput(world, state, previous.answer.response, result.input, null,
                    original?.topic ? original : null);
                if (!original?.topic) state.context.lastOutput.topic = null;
                return JSON.parse(JSON.stringify(previous.answer.response));
            }
            return { message: 'answer_unknown' };
        }
        const response = u.contextReference ? answerContext(world, state, u) : respondCurrent(world, result, state);
        if (u.contextReference) { world.reactionTime = 5; world.reaction = u.complete ? 'attend' : 'uncertain'; }
        // Keep only an actually expressed, fully understood self-answer. This is
        // conversational evidence, never a new experience or a player report.
        if (turn && result.understandings.length === 1 && u.complete && u.kind === 'question'
            && ['current_activity', 'past_activity', 'attention', 'destination', 'work_past', 'work_again',
                'taste_evaluation', 'taste_now', 'rest_result', 'reason', 'context_detail'].includes(u.questionSlot)
            && u.subject === 'self' && state.settings.speech === 'short'
            && !response.observation && !['answer_unknown', 'attend', 'taste_unsure'].includes(response.message)) {
            turn.answer = { subject: u.subject, eventTime: u.eventTime,
                source: { inputId: result.input.id, questionSlot: u.questionSlot,
                    experienceId: response.experienceId || null, answeredAt: result.input.at },
                response: JSON.parse(JSON.stringify(response)) };
        }
        rememberOutput(world, state, response, result.input, null,
            u.contextReference && u.complete && !response.observation
                && !['attend', 'answer_unknown', 'taste_unsure'].includes(response.message) ? u.contextReference : null);
        if (result.understandings.length !== 1 || !u.complete || (u.subject !== 'self' && !u.contextReference)) {
            state.context.lastOutput.topic = null;
        }
        return response;
    }

    function respondCurrent(world, result, state) {
        world.pause = world.island ? 0 : 5; world.reactionTime = 5;
        const u = result.understandings.at(-1);
        const canSpeak = state.settings.speech === 'short';
        const knows = id => state.knowledge.meanings.some(entry => entry.id === id);
        world.reaction = !u.complete ? 'uncertain' : 'attend';
        if (result.reaction.intent === 'receive_sadness') world.reaction = 'care';
        if (['report', 'report_continuation'].includes(u.kind) && u.subject === result.input.speaker
            && u.aspect === 'external_event' && ['failure', 'success'].includes(u.known.meaning)) {
            return { message: canSpeak ? 'heard_event_partial' : 'attend' };
        }
        if (['report', 'report_continuation'].includes(u.kind) && u.subject === result.input.speaker
            && u.polarity === 'positive' && ['sad', 'happy', 'painful', 'tired'].includes(u.known.meaning)) {
            return { message: !canSpeak ? 'attend' : u.unresolved.length ? 'heard_feeling_partial'
                : u.known.meaning === 'sad' ? 'receive_sadness' : 'heard_feeling' };
        }
        if (u.kind === 'greeting' && u.complete) return { message: canSpeak ? 'good_morning' : 'attend' };
        if (u.kind === 'question' && u.questionSlot === 'sour_evaluation' && u.known.meaning === 'eat'
            && u.relations.includes('negation')) {
            const meal = [...world.experiences].reverse().find(e => e.kind === 'eat');
            return { message: !canSpeak ? 'attend' : knows('sweet') && meal?.taste?.quality === 'sweet' ? 'unknown_taste_word' : 'uncertain' };
        }
        if (u.kind === 'report' && u.known.meaning === 'rest' && u.unresolved.some(item => item.type === 'detail')) {
            return { message: canSpeak ? 'heard_rest_partial' : 'attend' };
        }
        if (u.kind === 'report' && u.complete && u.aspect === 'observation' && u.known.meaning === 'berry') {
            return { message: canSpeak ? (world.attention?.startsWith('berry:') ? 'see_berry' : 'heard_berry') : 'attend' };
        }
        if (u.kind === 'report' && u.complete && u.aspect === 'rest_comfort') {
            return { message: canSpeak ? 'heard_rest_comfort' : 'attend' };
        }
        if (u.kind === 'reply' && u.complete && u.replyTo) {
            return { message: canSpeak ? (u.answer === 'yes' ? 'name_confirmed' : 'name_reconsider') : 'attend' };
        }
        if (u.kind === 'naming' && !u.target?.adopted) {
            return { message: canSpeak ? 'which_name' : 'attend' };
        }
        if (u.kind === 'question' && u.complete) {
            const workAnswer = careers?.answer(world, state, u);
            if (workAnswer) return workAnswer;
            const situation = answerSituation(world, u, state);
            if (situation) return situation;
            if (['taste_evaluation', 'taste_now'].includes(u.questionSlot)) {
                const meal = [...world.experiences].reverse().find(e => e.kind === 'eat');
                const current = u.questionSlot === 'taste_now' && world.mode === 'eat';
                const taste = current ? world.mealTaste : meal?.taste;
                if (taste?.quality === 'sweet' && taste.pleasant && knows('sweet')) {
                    return { message: canSpeak ? (current ? 'tastes_good' : 'tasted_good') : 'pleased_gesture' };
                }
                if (!meal && !current) return { message: canSpeak ? 'not_eaten_yet' : 'attend' };
                return { message: canSpeak ? 'taste_unsure' : 'attend' };
            }
            if (u.questionSlot === 'rest_result') {
                const rest = [...world.experiences].reverse().find(e => e.kind === 'rest');
                if (rest?.before && rest.after.fatigue < rest.before.fatigue && knows('tired')) {
                    return { message: canSpeak ? 'rest_helped' : 'pleased_gesture' };
                }
                return { message: canSpeak ? 'answer_unknown' : 'attend' };
            }
            if (u.questionSlot === 'name' && u.target?.adopted) {
                const target = u.target.adopted.id;
                const links = state.knowledge.associations.filter(a => a.target === target && a.speaker === result.input.speaker
                    && a.evidence.some(e => !e.retractedBy));
                if (links.length === 1) return nameReply(state, links[0]);
                if (!links.length && target.startsWith('berry:') && knows('berry')) return { message: canSpeak ? 'known_berry' : 'looking' };
            }
            if (u.questionSlot === 'reason' && knows('rest')) {
                const rest = [...world.history].reverse().find(item => item.mode === 'rest');
                const reasons = world.mode === 'rest' ? world.reasons : rest?.reasons;
                if (reasons?.some(reason => reason.kind === 'understood_suggestion')) {
                    return { message: canSpeak ? 'suggestion_reason' : 'attend' };
                }
            }
            return { message: canSpeak ? 'answer_unknown' : 'attend' };
        }
        const named = result.learning.find(l => l.adopted && l.updated.length);
        const reference = u.kind === 'reference' && u.target?.adopted;
        if (named || reference) {
            const word = named ? named.adopted.word : result.interpretations.at(-1).span;
            const target = named ? named.adopted.target : reference.id;
            world.reaction = 'recognize';
            const link = state.knowledge.associations.find(a => a.word === word && a.target === target
                && a.speaker === result.input.speaker && a.evidence.some(e => !e.retractedBy));
            if (link) return nameReply(state, link);
            return { message: 'attend' };
        }
        if (u.complete && ['request', 'invitation'].includes(u.kind) && u.polarity === 'positive'
            && !u.conditionStatus && ['rest', 'walk'].includes(u.known.meaning)) {
            const interested = world.mode === 'eat' || world.mode === 'work' || (world.attention?.startsWith('berry:') && world.dwell > 4);
            if (!interested) {
                approach(world, u.known.meaning === 'rest' ? 'shade' : 'path', 'understood_suggestion');
                world.reasons[0].inputId = result.input.id;
                return { message: state.settings.speech === 'short' ? 'join' : 'attend' };
            }
            if (world.mode === 'work') return { message: 'work', observation: true };
            return { message: state.settings.speech === 'short' ? 'keep_looking' : 'looking' };
        }
        return { message: result.expression.message };
    }
    function onArrival(world, state, event) {
        const response = arrivalReply(world, state, event);
        if (response) {
            if (['ate_gesture', 'woke_gesture'].includes(response.message)) response.observation = true;
            rememberOutput(world, state, response, null, event);
        }
        return response;
    }
    function arrivalReply(world, state, event) {
        if (!event) return null;
        if (event.kind === 'arrive' && world.island && careers?.jobId(event.target)) {
            const reply = careers.arrive(world, event);
            if (reply?.message === 'master_meet') {
                state.encounters ||= [];
                state.encounters.push({ eventId: event.id, master: reply.master, at: world.elapsed, target: event.target });
            }
            return reply;
        }
        if (event.kind === 'work_start') {
            world.careers.demonstration = `work_label_${event.master}`;
            return { ...careers.reply(event), npc: world.careers.demonstration };
        }
        if (event.kind === 'master_defer') return careers.reply(event);
        if (event.kind === 'experience') {
            state.experiences ||= [];
            if (!state.experiences.some(e => e.id === event.id)) state.experiences.push(JSON.parse(JSON.stringify(event)));
            careers?.learn(state, event);
            if (event.activity === 'rest') {
                // Index retained sources; sleep never invents missing meanings or rewrites reports.
                const sources = state.records.filter(r => !r.retractedBy && !state.notes.some(n => n.sourceId === r.id));
                sources.forEach(r => state.notes.push({ sourceId: r.id, organizedAt: event.id, kind: 'retained_report' }));
                state.experiences.filter(e => !state.notes.some(n => n.experienceId === e.id))
                    .forEach(e => state.notes.push({ experienceId: e.id, organizedAt: event.id, kind: 'experienced_change' }));
            }
            return careers?.reply(event) || { message: event.activity === 'eat' ? 'ate_gesture' : 'woke_gesture' };
        }
        if (event.kind !== 'arrive' || !event.target?.startsWith('berry:')) return null;
        const canSpeak = state.settings.speech === 'short';
        const knowsQuestions = state.knowledge.relations.some(r => r.id === 'question');
        const link = state.knowledge.associations.find(a => a.target === event.target && a.speaker === 'player'
            && a.evidence.some(e => !e.retractedBy));
        const preference = [...state.records].reverse().find(record => !record.retractedBy
            && record.understandings.some(u => u.subject === 'player' && u.aspect === 'preference'
                && ['berry', 'berry:1'].includes(u.target?.adopted?.id)));
        if (canSpeak && preference && !world.sharedReports[preference.id]
            && preference.understandings.some(u => u.subject === 'player' && u.known.meaning === 'like' && u.polarity === 'positive')) {
            world.sharedReports[preference.id] = true;
            return { message: 'player_likes_berry', target: event.target };
        }
        if (link) return nameReply(state, link);
        if (canSpeak && knowsQuestions && !world.askedNames[event.target]) {
            world.askedNames[event.target] = true;
            state.context.pendingQuestion = { kind: 'ask_name', target: event.target, speaker: 'player', expires: state.serial + 1 };
            return { message: 'ask_name', target: event.target };
        }
        return null;
    }
    function validContext(state, world) {
        for (const turn of state.context?.turns || []) {
            for (const u of turn.understandings || []) {
                const ref = u.reportReference;
                if (!ref) continue;
                const record = state.records.find(r => r.id === ref.inputId && r.speaker === ref.speaker && !r.retractedBy);
                if (ref.kind !== 'speaker_report' || ref.speaker !== turn.speaker || !Number.isFinite(ref.heardAt)
                    || !record || record.heardAt !== ref.heardAt
                    || !record.understandings.some(item => item.kind === 'report' && item.subject === ref.speaker)) return false;
            }
        }
        const focus = state.context?.lastOutput;
        if (focus === undefined) return true; // Do not manufacture context for old saves.
        if (!focus || !Number.isInteger(focus.serial) || focus.serial > state.serial || focus.serial < 0
            || typeof focus.listener !== 'string' || !['self', 'player'].includes(focus.subject)
            || !['speech', 'observation'].includes(focus.deliveryKind)
            || !['speech', 'observation'].includes(focus.source?.kind) || !Number.isFinite(focus.source.at)
            || !Array.isArray(focus.meanings) || !Array.isArray(focus.requiredMeanings)
            || !focus.meanings.every(id => typeof id === 'string') || !focus.requiredMeanings.every(id => typeof id === 'string')) return false;
        if (focus.topic === null) return true;
        return typeof focus.topic === 'string' && focus.meanings.includes(focus.topic)
            && ['present', 'past'].includes(focus.eventTime) && typeof focus.response?.message === 'string'
            && !!focus.evidence?.activity && (focus.evidence.experienceId === null
                || world.experiences.some(e => e.id === focus.evidence.experienceId));
    }
    return Object.freeze({ PLACES, create, approach, tick, perception, respond, onArrival, setNavigation, validContext });
});
