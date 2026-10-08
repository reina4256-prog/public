(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryTimeReports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
    // Ordinary positive self testimony only. Relative time belongs to the
    // hearing; teaching evidence never identifies the reported rest.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0];
        const understanding = result?.understandings?.[0];
        const roles = { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false };
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || typeof input.raw !== 'string' || !Number.isFinite(input.at)
            || typeof input.locale !== 'string' || !input.locale
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'report' || frame.subject !== 'self'
            || frame.meaning !== 'rest' || frame.aspect !== 'activity_report' || !equal(frame.roles, roles)
            || !['utterance', 'form', 'reportForm'].every(field => typeof frame[field] === 'string' && frame[field])
            || frame.span !== input.raw || key(input.raw) !== frame.form || key(frame.utterance) !== frame.form
            || !equal(frame.relations, ['report', 'time']) || frame.polarity !== 'positive'
            || !['now', 'past'].includes(frame.time) || frame.reportReference !== undefined
            || frame.eventReference !== undefined || context?.scene !== input.scene
            || !Array.isArray(context.attention) || typeof context.mode !== 'string'
            || !(context.target === null || typeof context.target === 'string')
            || !Number.isFinite(context.elapsed) || context.elapsed < 0
            || !Number.isFinite(context.activityStart) || context.activityStart < 0
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || understanding?.kind !== 'report' || understanding.complete !== true
            || understanding.known?.meaning !== 'rest' || !equal(understanding.unresolved, [])
            || !equal(understanding.relations, ['report', 'time']) || understanding.subject !== 'self'
            || understanding.aspect !== 'activity_report' || understanding.polarity !== 'positive'
            || understanding.eventTime !== frame.time || !equal(understanding.roles, roles)
            || understanding.reportReference !== undefined || understanding.eventReference !== undefined
            || result.relationLearning) return false;
        const reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at,
            raw: input.raw, locale: input.locale, reporter: input.speaker, contentSubject: 'self' };
        if (!equal(understanding.reportSource, reportSource)) return false;
        const basis = beforeKnowledge.meanings.find(item => item.id === 'rest');
        const applies = entry => entry.scope?.kind === 'report' && entry.scope.meaning === 'rest'
            && entry.scope.locale === input.locale && entry.scope.speaker === input.speaker
            && equal(entry.scope.roles, roles) && (entry.id === 'report'
                ? entry.scope.form === frame.reportForm
                : entry.scope.form === frame.form && entry.scope.eventTime === frame.time
                    && entry.scope.polarity === 'positive' && entry.scope.reportForm === frame.reportForm);
        const relationBasis = beforeKnowledge.relations.filter(entry => ['report', 'time'].includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (!basis || !['report', 'time'].every(id => relationBasis.some(entry => entry.id === id))
            || !equal(understanding.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        // Context is the hearing scene. Relation scopes remain learning roots,
        // including their original teaching references, never testimony targets.
        return buffer.retain({ occurrenceId: `time_report:${input.id}`, kind: 'report', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis, relationBasis, understanding, roles, reportSource } });
    }
    return Object.freeze({ capture });
});
