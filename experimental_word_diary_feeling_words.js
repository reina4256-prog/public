(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryFeelingCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryFeelingWords = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = s => s.normalize('NFKC').trim().toLocaleLowerCase();
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    const finite = n => typeof n === 'number' && Number.isFinite(n);
    const stages = ['retain', 'difference', 'noncausal'];
    const operation = () => ({ kind: 'partial', known: {}, target: null, relations: [],
        unresolved: [{ type: 'teaching_operation' }], complete: false, subject: null,
        polarity: 'positive', eventTime: 'unspecified', aspect: null, conditionStatus: null, questionSlot: null });
    // Read-only mirrors of the fixed 3c3f parser and provenance checks. No game,
    // world, learning, storage or UI module is loaded by this independent adapter.
    function frames(locale) {
        const p = catalog.feelingContrast[locale];
        return [p.past, p.present].map((span, i) => ({ kind: 'report', aspect: 'feeling',
            meaning: i ? 'happy' : 'sad', time: i ? 'now' : 'yesterday',
            relations: ['report', 'time', 'contrast'], span, catalogRule: 'feeling_contrast' }));
    }
    function parse(input) {
        const p = catalog.feelingContrast[input.locale], f = catalog.feelingTeaching[input.locale];
        if (!p || !f) return null;
        const full = p.past + p.join + p.present;
        for (const stage of [...stages, 'source', 'sad', 'happy', 'report', 'yesterday', 'now']) {
            const marker = stages.includes(stage) ? catalog.contrastTeaching[input.locale][stage] : f[stage];
            const prefix = marker + '«';
            if (!input.raw.startsWith(prefix) || !input.raw.endsWith('»')) continue;
            const utterance = input.raw.slice(prefix.length, -1);
            const index = utterance === p.past ? 0 : utterance === p.present ? 1 : -1;
            if (stage === 'source' || stages.includes(stage) ? utterance !== full
                : index < 0 || ['sad', 'yesterday'].includes(stage) && index !== 0
                    || ['happy', 'now'].includes(stage) && index !== 1) return null;
            return { kind: 'feeling_teaching', stage, index: stage === 'source' || stages.includes(stage) ? -1 : index,
                utterance, span: input.raw, relations: [] };
        }
        return null;
    }
    function inputValid(input, ceiling, heard) {
        return finite(serial(input?.id)) && serial(input.id) < ceiling && input.speaker === 'player'
            && Object.hasOwn(catalog.feelingContrast, input.locale) && typeof input.raw === 'string'
            && input.raw.length <= 1000 && typeof input.scene === 'string' && finite(input.at) && input.at <= heard;
    }
    function applies(e, frame, locale) {
        return e.scope.locale === locale && e.scope.speaker === 'player' && e.scope.form === key(frame.span)
            && e.scope.meaning === frame.meaning && e.scope.time === frame.time;
    }
    function understanding(frame, locale, basis) {
        const refs = basis.taught.filter(e => applies(e, frame, locale));
        const knownRelation = id => basis.relations.some(e => e.id === id)
            || refs.some(e => e.type === 'relation' && e.id === id);
        const missing = frame.relations.filter(id => !knownRelation(id));
        const known = basis.meanings.some(e => e.id === frame.meaning)
            || refs.some(e => e.type === 'meaning' && e.id === frame.meaning);
        const unresolved = missing.map(id => ({ type: 'relation', id }));
        if (!known) unresolved.push({ type: 'meaning', field: 'meaning', token: frame.meaning });
        const ready = missing.length === 0, report = knownRelation('report');
        const u = { kind: ready ? 'report' : 'partial', known: known ? { meaning: frame.meaning } : {}, target: null,
            relations: frame.relations.filter(id => !missing.includes(id)), unresolved, complete: !unresolved.length,
            subject: ready || report ? 'player' : null, polarity: 'positive',
            eventTime: knownRelation('time') ? frame.time : 'unspecified', aspect: ready || report ? 'feeling' : null,
            conditionStatus: null, questionSlot: null };
        if (refs.length) u.feelingReferences = refs;
        const contrast = refs.find(e => e.id === 'contrast');
        if (contrast) u.contrastConnection = contrast.scope.connection;
        if (ready || report) u.testimony = { reporter: 'player', contentSubject: 'player', status: 'reported', verified: false };
        return u;
    }
    function originalUnderstanding(source, basis) {
        return source.frames.map((frame, index) => {
            const u = understanding(frame, source.input.locale, basis);
            u.clauseSource = { input: source.input, index, frame };
            u.feelingBasis = basis;
            if (u.kind === 'report') u.reportSource = { kind: 'speaker_report', inputId: source.input.id, heardAt: source.input.at };
            return u;
        });
    }
    // Reconstruct only fixed feeling evidence to check supplied snapshots. This
    // is validation, not learning: neither snapshots nor any actor are mutated.
    function replay(events, initial, context, ceiling, turns, records) {
        const knowledge = [], sources = [], samples = [], ids = new Set();
        let last = 0, lastAt = -Infinity, lastHeard = -Infinity;
        const basis = taught => ({ ...initial, taught: [...taught] });
        const add = (type, id, source, index, evidence) => {
            if ((type === 'meaning' ? initial.meanings : initial.relations).length) return;
            const f = source.frames[index];
            const e = { type, id, source: 'feeling_teaching', scope: { locale: source.input.locale,
                speaker: 'player', form: key(f.span), meaning: f.meaning, time: f.time }, evidence };
            if (id === 'contrast') e.scope.connection = { kind: 'contrast', sourceId: source.input.id,
                form: key(source.input.raw), retainedClauses: [0, 1], difference: ['sad', 'happy'], replaces: false, causalClaim: false };
            if (!knowledge.some(old => old.type === type && old.id === id && equal(old.scope, e.scope))) knowledge.push(e);
        };
        for (const event of events) {
            const input = event?.input, f = inputValid(input, ceiling, context.heardAt) ? parse(input) : null;
            if (!f || !equal(event.frame, f) || !equal(event.basis, basis(knowledge))
                || serial(input.id) <= last || ids.has(input.id) || input.at < lastHeard
                || !finite(event.at) || event.at < 0 || event.at < lastAt || event.at > context.elapsed) return null;
            last = serial(input.id); lastHeard = input.at; lastAt = event.at; ids.add(input.id);
            if (f.stage === 'source') {
                const source = event.original;
                if (event.sourceId !== undefined || event.understanding !== undefined || event.understandings !== undefined
                    || !inputValid(source?.input, serial(input.id), input.at) || ids.has(source.input.id)
                    || source.input.raw !== f.utterance || source.input.locale !== input.locale || source.input.scene !== input.scene
                    || sources.some(s => s.input.locale === input.locale) || !equal(source.frames, frames(input.locale))) return null;
                const earlier = knowledge.filter(e => e.evidence.every(id => serial(id) < serial(source.input.id)));
                if (!equal(source.understandings, originalUnderstanding(source, basis(earlier)))) return null;
                for (const r of [...turns, ...records].filter(r => r.id === source.input.id)) {
                    if (r.speaker !== 'player' || !equal(r.understandings, source.understandings)) return null;
                }
                sources.push(source); ids.add(source.input.id);
            } else {
                const source = sources.find(s => s.input.id === event.sourceId);
                if (event.original !== undefined || !source || source.input.locale !== input.locale || source.input.scene !== input.scene
                    || samples.some(s => s.sourceId === event.sourceId && s.frame.stage === f.stage && s.frame.index === f.index)) return null;
                if (stages.includes(f.stage)) {
                    const parts = source.frames.map(frame => understanding(frame, input.locale, basis(knowledge)));
                    if (event.understanding !== undefined || !equal(event.understandings, parts)
                        || parts.some((u, i) => u.known.meaning !== source.frames[i].meaning || u.subject !== 'player'
                            || u.eventTime !== source.frames[i].time || !u.relations.includes('report') || !u.relations.includes('time')
                            || u.unresolved.some(e => e.type !== 'relation' || e.id !== 'contrast'))) return null;
                    const prior = samples.filter(s => s.sourceId === event.sourceId && stages.includes(s.frame.stage));
                    if (prior.length !== stages.indexOf(f.stage)) return null;
                    samples.push(event);
                    if (f.stage === 'noncausal') for (const index of [0, 1]) add('relation', 'contrast', source, index,
                        [...prior, event].map(s => s.input.id));
                } else {
                    const u = understanding(source.frames[f.index], input.locale, basis(knowledge));
                    if (event.understandings !== undefined || !equal(event.understanding, u)
                        || f.stage === 'report' && u.known.meaning !== source.frames[f.index].meaning
                        || ['yesterday', 'now'].includes(f.stage) && (u.known.meaning !== source.frames[f.index].meaning
                            || !u.relations.includes('report'))) return null;
                    samples.push(event);
                    if (['sad', 'happy'].includes(f.stage)) add('meaning', f.stage, source, f.index, [input.id]);
                    if (f.stage === 'report') {
                        const pair = samples.filter(s => s.sourceId === event.sourceId && s.frame.stage === 'report');
                        if (pair.length === 2) for (const index of [0, 1]) add('relation', 'report', source, index, pair.map(s => s.input.id));
                    }
                    if (['yesterday', 'now'].includes(f.stage)) {
                        const pair = samples.filter(s => s.sourceId === event.sourceId && ['yesterday', 'now'].includes(s.frame.stage));
                        if (pair.length === 2) for (const index of [0, 1]) add('relation', 'time', source, index, pair.map(s => s.input.id));
                    }
                }
            }
            if (records.some(r => r.id === input.id) || turns.filter(t => t.id === input.id)
                .some(t => t.speaker !== 'player' || !equal(t.understandings, [operation()]))) return null;
        }
        return knowledge;
    }
    // Seven arguments are temporary input-before snapshots, never a save format.
    function capture(buffer, result, context, beforeKnowledge, beforeFeelingLearning, beforeTurns, beforeRecords) {
        try {
            const input = result?.input, f = result?.interpretations?.[0], pairing = result?.feelingLearning, event = pairing?.adopted;
            if (!inputValid(input, Infinity, input?.at) || !['sad', 'happy'].includes(f?.stage)
                || !equal(f, parse(input)) || result.interpretations.length !== 1 || !equal(result.understandings, [operation()])
                || context?.scene !== input.scene || !finite(context.elapsed) || context.elapsed < 0
                || typeof context.mode !== 'string' || !context.mode || !(context.target === null || typeof context.target === 'string')
                || !finite(context.activityStart) || context.activityStart > context.elapsed || !Array.isArray(context.attention)
                || !context.attention.every(a => typeof a?.id === 'string') || !Array.isArray(beforeKnowledge?.meanings)
                || !Array.isArray(beforeKnowledge.relations) || !Array.isArray(beforeFeelingLearning?.events)
                || !beforeFeelingLearning.events.length || beforeFeelingLearning.events.length >= 70
                || !Array.isArray(beforeFeelingLearning.knowledge) || !Array.isArray(beforeTurns) || !Array.isArray(beforeRecords)
                || [beforeTurns, beforeRecords].some(list => new Set(list.map(t => t.id)).size !== list.length
                    || list.some(t => !finite(serial(t.id)) || serial(t.id) >= serial(input.id)))
                || !equal(event?.input, input) || !equal(event.frame, f) || event.at !== context.elapsed) return false;
            const initial = { meanings: beforeKnowledge.meanings.filter(e => e.source === 'initial' && ['sad', 'happy'].includes(e.id))
                .map(e => ({ ...e })).sort((a, b) => a.id.localeCompare(b.id)),
                relations: beforeKnowledge.relations.filter(e => e.source === 'initial' && ['report', 'time', 'contrast'].includes(e.id))
                    .map(e => ({ ...e })).sort((a, b) => a.id.localeCompare(b.id)) };
            if (initial.meanings.length || ![0, 3].includes(initial.relations.length)
                || initial.relations.some(e => !equal(e, { id: e.id, source: 'initial' }))
                || new Set(initial.relations.map(e => e.id)).size !== initial.relations.length
                || beforeKnowledge.meanings.some(e => ['sad', 'happy'].includes(e.id))) return false;
            const validationContext = { elapsed: context.elapsed, heardAt: input.at };
            const before = replay(beforeFeelingLearning.events, initial, validationContext, serial(input.id), beforeTurns, beforeRecords);
            if (!before || !equal(before, beforeFeelingLearning.knowledge)) return false;
            const selection = beforeFeelingLearning.events.filter(e => e.frame.stage === 'source' && e.input.locale === input.locale);
            if (selection.length !== 1 || selection[0].original.input.id !== event.sourceId) return false;
            const source = selection[0].original, clause = source.frames[f.index];
            if (understanding(clause, input.locale, { ...initial, taught: before }).known.meaning !== undefined) return false;
            const after = replay([...beforeFeelingLearning.events, event], initial, validationContext, serial(input.id) + 1, beforeTurns, beforeRecords);
            const expected = { type: 'meaning', id: f.stage, source: 'feeling_teaching', scope: { locale: input.locale,
                speaker: 'player', form: key(clause.span), meaning: clause.meaning, time: clause.time }, evidence: [input.id] };
            if (!after || !equal(after, [...before, expected]) || !equal(pairing.updated, [expected])) return false;
            return buffer.retain({ occurrenceId: `feeling_word:${input.id}`, kind: 'teaching', sourceId: input.id,
                captured: { sources: { input, frame: f, scene: context.scene, attention: context.attention,
                    activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                    original: source, selection: selection[0], clauseIndex: f.index, priorTeachings: beforeFeelingLearning.events },
                    basis: event.basis, understanding: result.understandings[0], contentUnderstanding: event.understanding,
                    meaningKnownBefore: false, pairing } });
        } catch (_) { return false; }
    }
    return Object.freeze({ capture });
});
