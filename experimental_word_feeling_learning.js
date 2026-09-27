(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordFeelingLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = input => Number(input.id.slice(6));
    const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
    const locales = ['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'];
    const contrastStages = ['retain', 'difference', 'noncausal'];
    function contentUnderstanding(state, source, knowledge, catalog) {
        const before = prior(state, knowledge);
        return source.frames.map(frame => core.understand(before, frame, source.input.speaker, catalog, source.input.locale));
    }
    function prior(state, knowledge) {
        const value = core.create(state.settings, { meanings: { sad: [], happy: [] }, patterns: [] });
        value.feelingLearning = { knowledge: copy(knowledge) };
        return value;
    }
    function originalUnderstanding(state, input, frames, knowledge) {
        const before = prior(state, knowledge);
        return frames.map((frame, index) => {
            const u = core.understand(before, frame, input.speaker, { meanings: { sad: [], happy: [] } }, input.locale);
            u.clauseSource = { input: copy(input), index, frame: copy(frame) };
            u.feelingBasis = core.feelingBasis(before);
            if (u.kind === 'report') u.reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at };
            return u;
        });
    }
    function validInput(input, state) {
        return input && /^input:[1-9]\d*$/.test(input.id) && serial(input) <= state.serial
            && input.speaker === 'player' && locales.includes(input.locale)
            && typeof input.raw === 'string' && input.raw.length <= 1000
            && typeof input.scene === 'string' && Number.isFinite(input.at);
    }
    // Replay only explicit teaching operations. Parsed frames never supply knowledge.
    // The declared word use is restricted to the selected speaker and expressions;
    // there is no claim of bodily experience or independent verification of feelings.
    function replay(state, world, catalog, events) {
        const knowledge = [], sources = [], samples = [], ids = new Set();
        let last = 0, lastAt = -Infinity, lastHeard = -Infinity;
        const add = (type, id, source, index, evidence) => {
            if (type === 'meaning' ? state.settings.life : state.settings.foundation) return;
            const frame = source.frames[index];
            const entry = { type, id, source: 'feeling_teaching', scope: { locale: source.input.locale,
                speaker: source.input.speaker, form: key(frame.span), meaning: frame.meaning, time: frame.time }, evidence };
            if (id === 'contrast') entry.scope.connection = { kind: 'contrast', sourceId: source.input.id,
                form: key(source.input.raw), retainedClauses: [0, 1], difference: ['sad', 'happy'],
                replaces: false, causalClaim: false };
            if (!knowledge.some(e => e.type === type && e.id === id && equal(e.scope, entry.scope))) knowledge.push(entry);
        };
        for (const event of events) {
            if (!validInput(event?.input, state) || serial(event.input) <= last || ids.has(event.input.id)
                || event.input.at < lastHeard || !Number.isFinite(event.at) || event.at < lastAt || event.at > world.elapsed || event.at < 0) return null;
            last = serial(event.input); lastAt = event.at; lastHeard = event.input.at; ids.add(event.input.id);
            const frame = core.feelingTeaching(event.input.raw, event.input.locale, catalog);
            if (!frame || !equal(frame, event.frame) || !equal(event.basis, core.feelingBasis(prior(state, knowledge)))) return null;
            if (frame.stage === 'source') {
                if (event.sourceId !== undefined || event.understanding !== undefined || event.understandings !== undefined) return null;
                const source = event.original;
                if (!source || !validInput(source.input, state) || serial(source.input) >= serial(event.input)
                    || ids.has(source.input.id)
                    || source.input.at > event.input.at || source.input.raw !== frame.utterance
                    || source.input.locale !== event.input.locale || source.input.scene !== event.input.scene
                    || sources.some(s => s.input.locale === source.input.locale)) return null;
                const frames = core.feelingContrast(source.input.raw, source.input.locale, catalog);
                const earlierKnowledge = knowledge.filter(e => e.evidence.every(id => Number(id.slice(6)) < serial(source.input)));
                if (!frames || !equal(source.frames, frames)
                    || !equal(source.understandings, originalUnderstanding(state, source.input, frames, earlierKnowledge))) return null;
                for (const record of [...state.context.turns, ...state.records].filter(r => r.id === source.input.id)) {
                    if (record.speaker !== source.input.speaker || !equal(record.understandings, source.understandings)) return null;
                }
                sources.push(source);
                ids.add(source.input.id);
            } else {
                if (event.original !== undefined) return null;
                const source = sources.find(s => s.input.id === event.sourceId);
                if (!source || source.input.locale !== event.input.locale || event.input.at < source.input.at
                    || source.input.scene !== event.input.scene
                    || samples.some(s => s.sourceId === event.sourceId && s.frame.stage === frame.stage && s.frame.index === frame.index)) return null;
                if (contrastStages.includes(frame.stage)) {
                    if (event.understanding !== undefined) return null;
                    const parts = contentUnderstanding(state, source, knowledge, catalog);
                    if (!equal(parts, event.understandings) || parts.some((u, i) =>
                        u.known.meaning !== source.frames[i].meaning || u.subject !== source.input.speaker
                        || u.eventTime !== source.frames[i].time || !u.relations.includes('report')
                        || !u.relations.includes('time') || u.unresolved.some(e => e.type !== 'relation' || e.id !== 'contrast'))) return null;
                    const previous = samples.filter(s => s.sourceId === event.sourceId && contrastStages.includes(s.frame.stage));
                    if (previous.length !== contrastStages.indexOf(frame.stage)) return null;
                    samples.push(event);
                    if (frame.stage === 'noncausal') for (const index of [0, 1]) {
                        add('relation', 'contrast', source, index, [...previous, event].map(s => s.input.id));
                    }
                } else {
                    if (event.understandings !== undefined) return null;
                    const content = source.frames[frame.index];
                    const u = core.understand(prior(state, knowledge), content, event.input.speaker, catalog, event.input.locale);
                    if (!equal(u, event.understanding)) return null;
                    if (frame.stage === 'report' && u.known.meaning !== content.meaning) return null;
                    if (['yesterday', 'now'].includes(frame.stage)
                        && (u.known.meaning !== content.meaning || !u.relations.includes('report'))) return null;
                    samples.push(event);
                    if (['sad', 'happy'].includes(frame.stage)) add('meaning', frame.stage, source, frame.index, [event.input.id]);
                    if (frame.stage === 'report') {
                        const pair = samples.filter(s => s.sourceId === event.sourceId && s.frame.stage === 'report');
                        if (pair.length === 2) for (const index of [0, 1]) add('relation', 'report', source, index, pair.map(s => s.input.id));
                    }
                    if (['yesterday', 'now'].includes(frame.stage)) {
                        const pair = samples.filter(s => s.sourceId === event.sourceId && ['yesterday', 'now'].includes(s.frame.stage));
                        if (pair.length === 2) for (const index of [0, 1]) add('relation', 'time', source, index, pair.map(s => s.input.id));
                    }
                }
            }
            const turn = state.context.turns.find(t => t.id === event.input.id);
            if (turn && (turn.speaker !== event.input.speaker || !equal(turn.understandings,
                [core.understand(prior(state, []), frame, event.input.speaker, catalog, event.input.locale)]))) return null;
            if (state.records.some(r => r.id === event.input.id)) return null;
        }
        return knowledge;
    }
    function offer(world, state, result, catalog) {
        const frame = result.interpretations[0];
        if (result.interpretations.length !== 1 || frame.kind !== 'feeling_teaching' || result.input.speaker !== 'player') return false;
        const current = state.feelingLearning || { events: [], knowledge: [] };
        const event = { input: copy(result.input), frame: copy(frame), at: world.elapsed, basis: core.feelingBasis(state) };
        if (frame.stage === 'source') {
            const matches = state.context.turns.filter(t => t.speaker === result.input.speaker && t.understandings.length === 2
                && t.understandings.every(u => u.feelingBasis && u.clauseSource?.input.raw === frame.utterance
                    && u.clauseSource.input.locale === result.input.locale));
            if (matches.length !== 1) return false;
            const turn = matches[0];
            event.original = { input: copy(turn.understandings[0].clauseSource.input),
                frames: turn.understandings.map(u => copy(u.clauseSource.frame)), understandings: copy(turn.understandings) };
        } else {
            const sources = current.events.filter(e => e.frame.stage === 'source' && e.input.locale === result.input.locale);
            if (sources.length !== 1) return false;
            const source = sources[0].original;
            event.sourceId = source.input.id;
            if (contrastStages.includes(frame.stage)) event.understandings = contentUnderstanding(state, source, current.knowledge, catalog);
            else event.understanding = core.understand(prior(state, current.knowledge), source.frames[frame.index], result.input.speaker, catalog, result.input.locale);
        }
        const events = [...current.events, event], knowledge = replay(state, world, catalog, events);
        if (!knowledge) return false;
        state.feelingLearning = { events, knowledge };
        result.feelingLearning = { adopted: copy(event), updated: knowledge.filter(e => !current.knowledge.some(old => equal(old, e))) };
        return true;
    }
    function valid(state, world, catalog) {
        try {
            const learning = state.feelingLearning;
            let expected = [];
            if (learning !== undefined) {
                if (!Array.isArray(learning?.events) || !learning.events.length || learning.events.length > 70
                    || !Array.isArray(learning.knowledge)) return false;
                expected = replay(state, world, catalog, learning.events);
                if (expected === null || !equal(expected, learning.knowledge)) return false;
            }
            for (const record of [...state.context.turns, ...state.records]) for (const u of record.understandings) {
                if (!u.feelingBasis && !u.feelingSource && !u.feelingReferences) {
                    if (u.clauseSource && learning && Number(record.id.slice(6)) >= serial(learning.events[0].input)) return false;
                    continue;
                }
                const source = u.clauseSource || u.feelingSource, input = source?.input;
                if (!input || !validInput({ ...input, speaker: 'player' }, state)
                    || input.id !== record.id || input.speaker !== record.speaker) return false;
                const known = expected.filter(e => e.evidence.every(id => Number(id.slice(6)) < serial(input)));
                let original;
                if (u.clauseSource) {
                    const frames = core.feelingContrast(input.raw, input.locale, catalog);
                    if (!frames) return false;
                    original = originalUnderstanding(state, input, frames, known)[source.index];
                } else {
                    const frames = core.interpret(input.raw, input.locale, catalog);
                    if (frames.length !== 1 || frames[0].catalogRule !== 'feeling_single') return false;
                    const before = prior(state, known);
                    original = core.understand(before, frames[0], input.speaker, catalog, input.locale);
                    original.feelingSource = { input: copy(input), frame: copy(frames[0]) };
                    original.feelingBasis = core.feelingBasis(before);
                    if (original.kind === 'report') original.reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at };
                }
                if (!equal(original, u)) return false;
            }
            return true;
        } catch (_) { return false; }
    }
    return Object.freeze({ offer, valid });
});
