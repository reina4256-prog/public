(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryFeelingCatalog,
        node ? require('./experimental_word_diary_feeling_reports') : root.ExperimentalWordDiaryFeelingReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryExternalReports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog, fixedReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    const meanings = ['sad', 'happy', 'painful', 'tired', 'failure', 'success'];
    // Read-only 1c mirrors. Parsing is checked against the supplied receipt;
    // neither actors nor game/storage/UI modules are loaded by this adapter.
    function feeling(part, locale) {
        if (locale !== 'ja') return null;
        const event = /^(?:(?:私は|わたしは)[、,\s]*)?(今日|昨日|さっき)(?:は)?(?<detail>[^、,。！？!?はが]+?)で(?<event>失敗した|うまくいかなかった|成功した|うまくいった)(?:んだ|よ|んだよ)?$/u.exec(key(part));
        if (event) return { kind: 'report', aspect: 'external_event', meaning: /失敗|いかなかった/u.test(event.groups.event) ? 'failure' : 'success',
            detail: event.groups.detail, time: { 今日: 'past_today', 昨日: 'yesterday', さっき: 'past' }[event[1]],
            relations: ['report', 'time'], catalogRule: 'external_event_report' };
        const match = /^(?:(?:私は|わたしは)[、,\s]*)?(?:(今日|昨日|今|さっき)(?:は)?[、,\s]*)?(?:(?<detail>[^、,。！？!?はが]+?)で(?<event>失敗して|うまくいかなくて|成功して|うまくいって))?(?<feeling>悲しかった|うれしかった|嬉しかった|つらかった|疲れていた|悲しい|うれしい|嬉しい|つらい|疲れた|疲れている)(?:んだ|です|よ|んだよ)?$/u.exec(key(part));
        if (!match) return null;
        const ids = { 悲しかった: 'sad', 悲しい: 'sad', うれしかった: 'happy', 嬉しかった: 'happy',
            うれしい: 'happy', 嬉しい: 'happy', つらかった: 'painful', つらい: 'painful',
            疲れた: 'tired', 疲れていた: 'tired', 疲れている: 'tired' };
        const past = /かった|ていた/u.test(match.groups.feeling);
        const time = { 今日: past ? 'past_today' : 'today', 昨日: 'yesterday', 今: 'now', さっき: 'past' }[match[1]] || (past ? 'past' : 'unspecified');
        return { kind: 'report', aspect: 'feeling', meaning: ids[match.groups.feeling], time,
            ...(match.groups.event ? { eventMeaning: /失敗|いかなく/u.test(match.groups.event) ? 'failure' : 'success', detail: match.groups.detail } : {}),
            relations: ['report', ...(time !== 'unspecified' ? ['time'] : []), ...(match.groups.event ? ['reason'] : [])],
            catalogRule: 'feeling_report' };
    }
    function ordinary(input) {
        const p = catalog.feelingContrast[input.locale], normalized = key(input.raw);
        if (!p || [p.past, p.present, p.past + p.join + p.present].some(s => key(s) === normalized)
            || /[【】«»→]/u.test(input.raw)) return null; // Existing ag/ah own these receipts.
        const parts = input.raw.match(/[^。！？!?\n]+[！？!?]?/gu) || [];
        if (parts.length !== 1 || /[?？]$/u.test(parts[0].trim())) return null;
        const part = parts[0].trim().replace(/[！？!?]$/u, '').trim();
        const f = feeling(part, input.locale);
        if (f) return { ...f, span: part };
        for (const rule of catalog.patterns[input.locale] || []) {
            if (rule.frame.kind !== 'report' || rule.frame.meaning !== 'sad' || rule.requiresQuestion) continue;
            if (new RegExp(rule.pattern, 'iu').test(part)) return { ...rule.frame, span: part, catalogRule: rule.id };
        }
        return null;
    }
    function expectedUnderstanding(frame, input, knowledge, context) {
        const known = {}, basis = { meanings: [], relations: [] };
        for (const field of ['meaning', 'eventMeaning']) {
            if (!frame[field]) continue;
            const roots = knowledge.meanings.filter(e => e.id === frame[field]);
            if (roots.length !== 1) return null;
            const root = roots[0];
            if (root.source === 'initial' ? !equal(root, { id: root.id, source: 'initial' })
                : root.source !== 'experienced_life' || root.id !== 'tired' || !Array.isArray(root.evidence) || !root.evidence.length) return null;
            if (root.source === 'experienced_life' && (!Array.isArray(context.priorExperiences)
                || !root.evidence.every(e => e.scope?.subject === 'self'
                    && e.scope.activity === 'rest' && e.scope.target === 'shade' && e.scope.speaker === 'player'
                    && serial(e.scope.inputId) < serial(input.id) && context.priorExperiences.some(event =>
                        event.id === e.experienceId && event.kind === 'experience' && event.activity === 'rest'
                        && event.target === 'shade' && Number.isFinite(event.start) && Number.isFinite(event.end)
                        && event.end > event.start && event.end <= context.elapsed && event.before?.fatigue >= .55
                        && event.lifeLabels?.some(l => l.meaning === 'tired' && l.inputId === e.scope.inputId
                            && l.speaker === e.scope.speaker && l.target === e.scope.target && l.activity === 'rest'
                            && l.start === event.start && l.at === e.scope.labelAt && l.at >= event.start && l.at <= event.end
                            && l.raw === e.scope.label && l.before?.fatigue >= .55 && l.heardAt <= input.at))))) return null;
            known[field] = root.id; basis.meanings.push(root);
        }
        for (const id of frame.relations) {
            const roots = knowledge.relations.filter(e => e.id === id && e.source !== 'experienced_relation');
            if (roots.length !== 1 || !equal(roots[0], { id, source: 'initial' })) return null;
            // Existing acquired rest-only relations never apply to 1c reports.
            if (knowledge.relations.some(e => e.id === id && e.source === 'experienced_relation' && e.scope?.meaning !== 'rest')) return null;
            basis.relations.push(roots[0]);
        }
        const unresolved = frame.detail ? [{ type: 'detail', token: frame.detail }] : [];
        const u = { kind: frame.kind, known, target: null, relations: frame.relations, unresolved,
            complete: !unresolved.length, subject: 'player', polarity: 'positive',
            eventTime: frame.time && frame.relations.includes('time') ? frame.time : 'unspecified',
            aspect: frame.aspect || null, conditionStatus: null, questionSlot: null };
        return { u, basis };
    }
    const echoes = {
        ja: /^(?:そう[、,\s]*)?(?:そのこと|その話|さっきの話)(?:だよ|です)?[。.]?$/u,
        en: /^(?:yes,? )?that(?:'s| is) what i meant[.]?$/iu,
        'zh-CN': /^(?:对[，,]?)?我说的就是这件事[。]?$/u,
        ru: /^да,? я об этом[.]?$/iu,
        'es-ES': /^sí,? a eso me refiero[.]?$/iu,
        'pt-BR': /^sim,? é disso que estou falando[.]?$/iu,
        de: /^ja,? das meine ich[.]?$/iu
    };
    function validReceipt(v) {
        const input = v?.result?.input, context = v?.context;
        return Number.isSafeInteger(serial(input?.id)) && input.speaker === 'player'
            && Object.hasOwn(catalog.feelingContrast, input.locale) && typeof input.raw === 'string'
            && input.raw.trim().length > 0 && input.raw.length <= 1000 && Number.isFinite(input.at)
            && typeof input.scene === 'string' && input.scene === context?.scene
            && Array.isArray(context.attention) && context.attention.every(a => typeof a?.id === 'string')
            && typeof context.mode === 'string' && context.mode.length > 0
            && (context.target === null || typeof context.target === 'string')
            && Number.isFinite(context.elapsed) && context.elapsed >= 0
            && Number.isFinite(context.activityStart) && context.activityStart >= 0 && context.activityStart <= context.elapsed
            && Array.isArray(v.beforeKnowledge?.meanings) && Array.isArray(v.beforeKnowledge.relations)
            && Array.isArray(v.beforeFeelingLearning?.events) && Array.isArray(v.beforeFeelingLearning.knowledge)
            && [v.beforeTurns, v.beforeRecords].every(list => Array.isArray(list)
                && new Set(list.map(t => t?.id)).size === list.length
                && list.every(t => Number.isSafeInteger(serial(t?.id)) && serial(t.id) < serial(input.id)))
            && v.result.interpretations?.length === 1 && v.result.understandings?.length === 1
            && !v.result.feelingLearning && !v.result.relationLearning
            && equal(v.result.learning, [{ candidates: [], adopted: null, updated: [] }]);
    }
    function validate(v, archive, stack = new Set(), allowFixed = false) {
        if (!validReceipt(v)) return null;
        const { input } = v.result;
        if (stack.has(input.id)) return null;
        const active = new Set(stack); active.add(input.id);
        const suppliedFrame = v.result.interpretations[0], supplied = v.result.understandings[0];
        const fixed = ['feeling_single', 'feeling_contrast'].includes(suppliedFrame.catalogRule);
        if (fixed) {
            if (!allowFixed || suppliedFrame.catalogRule !== 'feeling_single'
                || !fixedReports.capture({ retain: () => true }, v.result, v.context, v.beforeKnowledge,
                    v.beforeFeelingLearning, v.beforeTurns, v.beforeRecords)) return null;
            return { frame: suppliedFrame, u: supplied, basis: supplied.feelingBasis, fixed: true };
        }
        const echo = echoes[input.locale].test(key(input.raw));
        const extension = input.locale === 'ja' && /^(?:それで|そのことで)[、,\s]*(.+)$/u.exec(key(input.raw).replace(/。$/u, ''));
        const nextFeeling = extension && feeling(extension[1], 'ja');
        let frame, reference = null, previousReceipt = null, originalReceipt = null;
        if (echo || nextFeeling?.aspect === 'feeling') {
            const previous = v.beforeTurns.at(-1), prior = previous?.understandings?.length === 1 && previous.understandings[0];
            if (serial(previous?.id) !== serial(input.id) - 1 || previous.speaker !== input.speaker
                || v.context.lastOutput && v.context.lastOutput.inputId !== previous.id
                || !prior || !['report', 'report_continuation'].includes(prior.kind) || prior.subject !== 'player'
                || prior.polarity !== 'positive' || !meanings.includes(prior.known?.meaning)
                || !Array.isArray(prior.unresolved) || prior.unresolved.some(e => e.type !== 'detail') || !prior.reportSource) return null;
            previousReceipt = archive.find(r => r.result.input.id === previous.id);
            if (!previousReceipt || serial(previous.id) >= serial(input.id) || previousReceipt.result.input.at > input.at
                || !equal(previousReceipt.result.understandings, previous.understandings)
                || !validate(previousReceipt, archive, active, true)) return null;
            reference = { inputId: prior.reportReference?.inputId || prior.reportSource.inputId,
                previousInputId: previous.id, speaker: 'player', kind: 'speaker_report',
                heardAt: prior.reportReference?.heardAt ?? prior.reportSource.heardAt, eventTime: prior.eventTime };
            const record = v.beforeRecords.find(r => r.id === reference.inputId && r.speaker === 'player' && !r.retractedBy);
            originalReceipt = archive.find(r => r.result.input.id === reference.inputId);
            if (!record || record.source !== 'speaker_report' || record.heardAt !== reference.heardAt
                || !originalReceipt || !equal(record.understandings, originalReceipt.result.understandings)
                || !validate(originalReceipt, archive, active, true)) return null;
            const inherits = nextFeeling && nextFeeling.time === 'past' && ['past_today', 'yesterday', 'past'].includes(prior.eventTime);
            frame = { ...(nextFeeling || { kind: 'report_continuation', meaning: prior.known.meaning,
                ...(prior.known.eventMeaning ? { eventMeaning: prior.known.eventMeaning } : {}),
                time: prior.eventTime, relations: ['report', ...(prior.eventTime !== 'unspecified' ? ['time'] : [])] }),
                ...(inherits ? { time: prior.eventTime, timeSource: 'report_reference' } : {}),
                aspect: nextFeeling ? 'feeling' : prior.aspect, span: input.raw, catalogRule: 'report_continuation',
                reportReference: reference, inheritedDetails: prior.unresolved,
                ...(nextFeeling ? { relations: [...new Set([...nextFeeling.relations, 'reason'])] } : {}) };
        } else frame = ordinary(input);
        if (!frame || !equal(suppliedFrame, frame)) return null;
        const expected = expectedUnderstanding(frame, input, v.beforeKnowledge, v.context);
        if (!expected) return null;
        const { u, basis } = expected;
        if (reference) {
            u.reportReference = reference;
            if (frame.timeSource) u.timeSource = frame.timeSource;
            u.unresolved.push(...frame.inheritedDetails); u.complete = !u.unresolved.length;
        }
        u.reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at };
        if (!equal(supplied, u)) return null;
        // Retained records and recent turns must agree with the original receipt.
        for (const r of [...v.beforeTurns, ...v.beforeRecords]) {
            const source = archive.find(s => s.result.input.id === r.id);
            if (source && (r.speaker !== source.result.input.speaker
                || !equal(r.understandings, source.result.understandings))) return null;
        }
        return { frame, u, basis, echo, previousReceipt, originalReceipt };
    }
    // Eight input-before arguments are ephemeral verification material, not a
    // save format. Archive receipts preserve their own original bases and time.
    function capture(buffer, result, context, beforeKnowledge, beforeFeelingLearning, beforeTurns, beforeRecords, beforeReports) {
        try {
            const v = { result, context, beforeKnowledge, beforeFeelingLearning, beforeTurns, beforeRecords };
            if (!Array.isArray(beforeReports) || new Set(beforeReports.map(r => r?.result?.input?.id)).size !== beforeReports.length
                || beforeReports.some((r, i) => !Number.isSafeInteger(serial(r?.result?.input?.id))
                    || serial(r.result.input.id) >= serial(result?.input?.id)
                    || !Number.isFinite(r.result.input.at) || r.result.input.at > result.input.at
                    || i > 0 && (serial(r.result.input.id) <= serial(beforeReports[i - 1].result.input.id)
                        || r.result.input.at < beforeReports[i - 1].result.input.at))) return false;
            const accepted = validate(v, beforeReports);
            if (!accepted || accepted.echo) return false;
            const { u, frame, basis, previousReceipt, originalReceipt } = accepted;
            return buffer.retain({ occurrenceId: `external_report:${result.input.id}`, kind: 'report', sourceId: result.input.id,
                captured: { sources: { input: result.input, frame, scene: context.scene, attention: context.attention,
                    activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                    originalReport: originalReceipt, previousReport: previousReceipt }, basis, understanding: u,
                    reportSource: u.reportSource, reportReference: u.reportReference || null, timeSource: u.timeSource || null,
                    testimony: { reporter: 'player', contentSubject: 'player', status: 'reported', verified: false },
                    understoodContentOnly: !u.complete, meaningKnownBefore: true, relationsKnownBefore: true } });
        } catch (_) { return false; }
    }
    return Object.freeze({ capture });
});
