(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_careers') : root.ExperimentalWordCareers,
        typeof module === 'object' && module.exports ? require('./experimental_word_life_learning') : root.ExperimentalWordLifeLearning,
        typeof module === 'object' && module.exports ? require('./experimental_word_relation_learning') : root.ExperimentalWordRelationLearning,
        typeof module === 'object' && module.exports ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordWorld = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (careers, lifeLearning, relationLearning, core) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
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
        world.lifeLabels = [];
        world.relationLabels = [];
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
                // A selected proposal is one retained contribution, not a claim
                // to know every motive or to have understood a reason relation.
                const choice = kind === 'rest' && world.reasons.find(r => r.kind === 'understood_suggestion'
                    && r.target === 'shade' && r.selectionSource);
                if (choice) experience.choiceSource = copy(choice.selectionSource);
                lifeLearning.finish(world, experience);
                relationLearning.finish(world, experience);
                world.experiences.push(experience);
                if (kind === 'rest') world.sleepCount++;
                if (experience.before && (kind === 'eat' ? experience.before.hunger > world.hunger : experience.before.fatigue > world.fatigue)) world.recovery[kind] = experience.id;
                world.mode = 'idle'; world.dwell = 3; world.attention = null;
                world.history.push({ mode: kind, target: experience.target, start: experience.start, end: experience.end,
                    experienceId: experience.id, reasons: copy(world.reasons) });
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
        if (result.interpretations.length === 1 && result.interpretations[0].kind === 'sequential_proposal'
            && result.understandings[0].complete) {
            const response = { message: state.settings.speech === 'short' ? 'sequence_understood' : 'attend' };
            rememberOutput(world, state, response, result.input);
            return response;
        }
        const judgment = relationLearning.conditionJudgment(world, state, result);
        if (judgment) {
            const response = { message: state.settings.speech === 'short' ? `condition_${judgment.status}` : 'attend' };
            rememberOutput(world, state, response, result.input);
            return response;
        }
        if (relationLearning.offer(world, state, result)) {
            const response = { message: result.relationLearning.adopted.relation === 'sequence'
                ? result.relationLearning.relationAcquired ? 'sequence_learned' : 'sequence_pairing'
                : result.relationLearning.adopted.relation === 'condition' ? 'condition_pairing' : result.relationLearning.adopted.relation === 'time' ? 'time_pairing' : result.relationLearning.adopted.relation === 'negation' ? 'negation_pairing' : result.relationLearning.adopted.relation === 'question'
                ? 'question_pairing' : ['request', 'invitation'].includes(result.relationLearning.adopted.relation)
                    ? 'proposal_pairing' : result.relationLearning.adopted.relation === 'report'
                        ? 'report_pairing' : 'relation_pairing', observation: true };
            rememberOutput(world, state, response, result.input);
            return response;
        }
        if (lifeLearning.offer(world, state, result)) {
            const response = { message: 'life_label_received', observation: true };
            rememberOutput(world, state, response, result.input);
            return response;
        }
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
        if (u.kind === 'report' && u.complete && u.aspect === 'activity_report') {
            if (u.eventTime === 'past') return { message: canSpeak ? 'heard_report_past' : 'attend' };
            return { message: canSpeak ? (u.polarity === 'negative' ? 'heard_report_not_resting'
                : u.subject === 'self' ? 'heard_report_self' : 'heard_report_player') : 'attend' };
        }
        if (['word_explanation', 'word_correction', 'word_reference'].includes(u.kind)) {
            return { message: !canSpeak ? 'attend' : !u.complete ? 'word_scope_unknown'
                : u.kind === 'word_correction' ? 'word_corrected' : 'word_situated' };
        }
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
                if (!approach(world, u.known.meaning === 'rest' ? 'shade' : 'path', 'understood_suggestion')) {
                    return { message: state.settings.speech === 'short' ? 'answer_unknown' : 'attend' };
                }
                world.reasons[0].inputId = result.input.id;
                retainSelection(state, world, result);
                return { message: state.settings.speech === 'short' ? 'join' : 'attend' };
            }
            if (world.mode === 'work') return { message: 'work', observation: true };
            return { message: state.settings.speech === 'short' ? 'keep_looking' : 'looking' };
        }
        return { message: result.expression.message };
    }
    function retainSelection(state, world, result) {
        const u = result.understandings[0], frame = result.interpretations[0];
        // This preparatory unit retains direct rest proposals only. Indirect
        // word applications and unresolved clauses are not retroactively taught.
        if (result.interpretations.length !== 1 || !u.complete || u.known.meaning !== 'rest'
            || !['request', 'invitation'].includes(u.kind) || u.applications || u.target
            || u.polarity !== 'positive' || u.conditionStatus || u.eventTime !== 'unspecified'
            || u.relations.length !== 1 || u.relations[0] !== u.kind
            || state.selectionSources?.some(s => s.input.id === result.input.id)) return;
        const meaningBasis = state.knowledge.meanings.find(m => m.id === 'rest');
        const relationBasis = state.knowledge.relations.filter(r => r.id === u.kind
            && (r.source === 'initial' || u.relationReferences?.some(ref => equal(ref, r))));
        if (!meaningBasis || !relationBasis.length) return;
        const source = { kind: 'selected_proposal', subject: 'self', target: 'shade', selectedAt: world.elapsed,
            input: copy(result.input), frame: copy(frame), understanding: copy(u),
            meaningBasis: copy(meaningBasis), relationBasis: copy(relationBasis) };
        state.selectionSources ||= [];
        state.selectionSources.push(source);
        world.reasons[0].selectionSource = { inputId: source.input.id, selectedAt: source.selectedAt };
    }

    function validSelections(state, world, catalog) {
        const sources = state.selectionSources;
        if (sources !== undefined && (!Array.isArray(sources)
            || new Set(sources.map(s => s?.input?.id)).size !== sources.length)) return false;
        const inputNumber = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
        const validRef = (ref, at) => ref && equal(ref, { inputId: ref.inputId, selectedAt: ref.selectedAt })
            && Number.isFinite(ref.selectedAt) && ref.selectedAt <= at
            && sources?.some(s => s.input.id === ref.inputId && s.selectedAt === ref.selectedAt);
        for (const source of sources || []) {
            const input = source?.input, u = source?.understanding, basis = source?.meaningBasis;
            if (source?.kind !== 'selected_proposal' || source.subject !== 'self' || source.target !== 'shade'
                || !Number.isFinite(source.selectedAt) || source.selectedAt < 0 || source.selectedAt > world.elapsed
                || !Number.isInteger(inputNumber(input?.id)) || inputNumber(input.id) > state.serial
                || typeof input.raw !== 'string' || !input.raw.trim() || input.raw.length > 1000
                || !['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'].includes(input.locale)
                || typeof input.speaker !== 'string' || !input.speaker || typeof input.scene !== 'string'
                || !Number.isFinite(input.at) || !u?.complete || u.known?.meaning !== 'rest'
                || !['request', 'invitation'].includes(u.kind) || u.applications || u.target
                || u.polarity !== 'positive' || u.conditionStatus || u.eventTime !== 'unspecified'
                || !equal(u.relations, [u.kind]) || !equal(u.unresolved, []) || basis?.id !== 'rest'
                || !Array.isArray(source.relationBasis) || !source.relationBasis.length) return false;
            const current = state.knowledge.meanings.find(m => m.id === 'rest');
            if (!current || basis.source !== current.source) return false;
            if (basis.source === 'initial') {
                if (!state.settings.life || !equal(basis, current)) return false;
            } else if (basis.source !== 'experienced_life' || !Array.isArray(basis.evidence) || !basis.evidence.length
                || !basis.evidence.every(e => current.evidence?.some(item => equal(item, e))
                    && inputNumber(e.scope?.inputId) < inputNumber(input.id)
                    && state.experiences?.some(event => event.id === e.experienceId && event.end <= source.selectedAt))) return false;
            for (const relation of source.relationBasis) {
                if (relation?.id !== u.kind || !state.knowledge.relations.some(r => equal(r, relation))) return false;
                if (relation.source === 'initial') {
                    if (!state.settings.foundation) return false;
                } else if (relation.source !== 'experienced_relation' || !Array.isArray(relation.evidence)
                    || !relation.evidence.length || !relation.evidence.every(id => inputNumber(id) < inputNumber(input.id)
                        && state.experiences?.some(e => e.end <= source.selectedAt
                            && e.relationLabels?.some(l => l.inputId === id)))) return false;
            }
            // Reparse against the retained knowledge, never today's broader
            // knowledge. This checks original locale, scope, roles and direction.
            const snapshot = core.create({ ...state.settings, foundation: false, life: false }, catalog);
            snapshot.serial = inputNumber(input.id) - 1;
            snapshot.context.scene = input.scene;
            snapshot.knowledge.meanings = [copy(basis)];
            snapshot.knowledge.relations = copy(source.relationBasis);
            const replay = core.receive(snapshot, input.raw, catalog, { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(replay.input, input) || !equal(replay.interpretations, [source.frame])
                || !equal(replay.understandings, [u])) return false;
        }
        const validReasons = (reasons, at, target) => Array.isArray(reasons) && reasons.every(reason =>
            reason && (reason.selectionSource === undefined || (reason.kind === 'understood_suggestion'
                && reason.target === 'shade' && target === 'shade' && reason.inputId === reason.selectionSource?.inputId
                && validRef(reason.selectionSource, at))));
        const reachedRest = (ref, start) => world.history.some(h => h?.mode === 'move' && h.target === 'shade'
            && h.start === ref.selectedAt && h.end === start
            && h.reasons?.some(r => equal(r.selectionSource, ref)));
        if (!validReasons(world.reasons, world.elapsed, world.mode === 'move' ? world.destination
            : world.mode === 'rest' ? world.attention : world.reasons.find(r => r?.selectionSource)?.target)) return false;
        for (const reason of world.reasons) if (reason.selectionSource) {
            if (world.mode === 'move' && reason.selectionSource.selectedAt !== world.activityStart) return false;
            if (world.mode === 'rest' && !reachedRest(reason.selectionSource, world.activityStart)) return false;
        }
        for (const history of world.history) {
            if (!history || !Array.isArray(history.reasons)) return false;
            // The existing idle history carries the just-finished action's
            // reasons until the next choice; it is not another rest experience.
            if (!validReasons(history.reasons, history.start, history.mode === 'idle' && history.target === null
                ? history.reasons?.find(r => r?.selectionSource)?.target : history.target)) return false;
            for (const reason of history.reasons) if (reason.selectionSource) {
                if (!Number.isFinite(history.start) || !Number.isFinite(history.end)
                    || history.end < history.start || history.end > world.elapsed) return false;
                if (history.mode === 'move' && reason.selectionSource.selectedAt !== history.start) return false;
                if (history.mode === 'rest' && !reachedRest(reason.selectionSource, history.start)) return false;
            }
        }
        const stateEvents = state.experiences || [];
        for (const event of world.experiences) {
            const saved = stateEvents.filter(e => e.id === event.id);
            if (event.choiceSource === undefined && saved.every(e => e.choiceSource === undefined)) continue;
            if (event.kind !== 'rest' || event.target !== 'shade' || !validRef(event.choiceSource, event.start)
                || !Number.isFinite(event.start) || !Number.isFinite(event.end)
                || event.end <= event.start || event.end > world.elapsed
                || !reachedRest(event.choiceSource, event.start)
                || saved.length !== 1 || saved[0].kind !== 'experience' || saved[0].activity !== 'rest'
                || !['choiceSource', 'start', 'end', 'target'].every(k => equal(saved[0][k], event[k]))) return false;
            const histories = world.history.filter(h => h.experienceId === event.id);
            if (histories.length !== 1 || histories[0].mode !== 'rest'
                || !['start', 'end', 'target'].every(k => histories[0][k] === event[k])
                || histories[0].reasons.filter(r => equal(r.selectionSource, event.choiceSource)).length !== 1) return false;
        }
        // A removed original or an added one-sided reference is not a valid save.
        return stateEvents.every(e => e.choiceSource === undefined
            || world.experiences.some(original => original.id === e.id && equal(original.choiceSource, e.choiceSource)))
            && world.history.every(h => h.experienceId === undefined || !h.reasons.some(r => r.selectionSource)
                || world.experiences.some(e => e.id === h.experienceId && h.mode === 'rest' && equal(e.choiceSource,
                    h.reasons.find(r => r.selectionSource).selectionSource)));
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
            lifeLearning.learn(state, event.id);
            relationLearning.learn(state);
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
    return Object.freeze({ PLACES, create, approach, tick, perception, respond, onArrival, setNavigation, validContext, validSelections });
});
