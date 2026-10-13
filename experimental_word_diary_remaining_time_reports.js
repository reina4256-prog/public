(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryRemainingTimeReportsCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryRemainingTimeReports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = value => typeof value === 'string' ? value.normalize('NFKC').trim().toLocaleLowerCase() : null;
    // The six remaining existing timeFrame forms. Learning scopes are roots
    // of understanding, never identities or proof of the reported rest.
    function capture(buffer, result, context, beforeKnowledge) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        if (input?.speaker !== 'player' || !/^input:[1-9]\d*$/.test(input.id)
            || typeof input.raw !== 'string' || !Number.isFinite(input.at)
            || !['self', 'player'].includes(frame?.subject) || !['now', 'past'].includes(frame.time)
            || !['positive', 'negative'].includes(frame.polarity)
            || frame.subject === 'self' && frame.polarity === 'positive') return false;
        const item = catalog?.timeTeaching?.[input.locale]?.[frame.time];
        const utterance = item?.[frame.subject === 'self' ? 'negative'
            : frame.polarity === 'positive' ? 'player' : 'playerNegative'];
        const reportForm = key(catalog?.reportTeaching?.[input.locale]?.[frame.subject]?.utterance);
        const relations = ['report', 'time', ...(frame.polarity === 'negative' ? ['negation'] : [])];
        const roles = { reporter: 'player', contentSubject: frame.subject, status: 'reported', verified: false };
        const reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at,
            raw: input.raw, locale: input.locale, reporter: input.speaker, contentSubject: frame.subject };
        if (!utterance || !reportForm || key(input.raw) !== key(utterance)
            || result.interpretations.length !== 1 || result.understandings?.length !== 1
            || frame.kind !== 'report' || frame.meaning !== 'rest' || frame.aspect !== 'activity_report'
            || frame.utterance !== utterance || frame.form !== key(utterance) || frame.reportForm !== reportForm
            || frame.span !== input.raw || !equal(frame.relations, relations) || !equal(frame.roles, roles)
            || context?.scene !== input.scene || !Array.isArray(context.attention)
            || typeof context.mode !== 'string' || !(context.target === null || typeof context.target === 'string')
            || !Number.isFinite(context.elapsed) || context.elapsed < 0
            || !Number.isFinite(context.activityStart) || context.activityStart < 0
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || u?.kind !== 'report' || u.complete !== true || !equal(u.known, { meaning: 'rest' })
            || !equal(u.unresolved, []) || !equal(u.relations, relations) || u.subject !== frame.subject
            || u.aspect !== 'activity_report' || u.polarity !== frame.polarity || u.eventTime !== frame.time
            || !equal(u.roles, roles) || !equal(u.reportSource, reportSource) || result.relationLearning
            || [frame, u].some(value => ['reportReference', 'eventReference', 'pastReference'].some(field => value[field] !== undefined))) return false;
        const meanings = beforeKnowledge.meanings.filter(entry => entry.id === 'rest');
        const applies = entry => entry.scope?.kind === 'report' && entry.scope.meaning === 'rest'
            && entry.scope.locale === input.locale && entry.scope.speaker === input.speaker
            && equal(entry.scope.roles, roles) && (entry.id === 'report' ? entry.scope.form === reportForm
                : entry.scope.form === frame.form && entry.scope.polarity === frame.polarity
                    && entry.scope.reportForm === reportForm && (entry.id !== 'time' || entry.scope.eventTime === frame.time));
        const relationBasis = beforeKnowledge.relations.filter(entry => relations.includes(entry.id)
            && (entry.source === 'initial' || entry.source === 'experienced_relation' && applies(entry)));
        if (meanings.length !== 1 || !relations.every(id => relationBasis.filter(entry => entry.id === id).length === 1)
            || !equal(u.relationReferences || [], relationBasis.filter(entry => entry.source === 'experienced_relation'))) return false;
        return buffer.retain({ occurrenceId: `remaining_time_report:${input.id}`, kind: 'report', sourceId: input.id,
            captured: { sources: { input, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                frame, index: 0 }, basis: meanings[0], relationBasis, understanding: u, roles, reportSource } });
    }
    return Object.freeze({ capture });
});
