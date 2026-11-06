(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_value_reports') : root.ExperimentalWordDiaryRestValueReports,
        node ? require('./experimental_word_diary_incomplete_rest_value_reports') : root.ExperimentalWordDiaryIncompleteRestValueReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestValueProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports, incompleteReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const match = /^(?:休む|やすむ)(?:こと|の)は大事(?:だよ|だね|だ|です)?$/u.exec(input.raw);
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        const basic = /^休むことは大事$/u.exec(input.raw);
        const shore = basic?.[0] === input.raw && context.scene === 'shore' && equal(context.attention, []);
        const speech = receipt.beforeState.settings.speech;
        const decorated = /^(?: 休むことは大事 |休むことは大事[。！])$/u.exec(input.raw);
        const ordinaryWorld = world.mode === 'idle' && world.fatigue === .15;
        const activity = ['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode) && world.fatigue === .15;
        const fatigue = world.mode === 'idle' && [0, .2, .4, .8, 1].includes(world.fatigue) && speech === 'short';
        return typeof input.raw === 'string'
            && input.speaker === 'player' && input.locale === 'ja'
            && (ordinaryWorld && (match?.[0] === input.raw && (initial || shore)
                || decorated?.[0] === input.raw && initial && speech === 'short')
                || basic?.[0] === input.raw && initial && (activity || fatigue))
            && world.attention === null && world.hunger === .35
            && ['short', 'gesture'].includes(speech);
    }
    function incompleteSentence(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const u = result.understandings[0], knowledge = receipt.inputKnowledge;
        if (typeof input.raw !== 'string'
            || (/^(?:休む|やすむ)(?:こと|の)は大事(?:だよ|だね|だ|です)?$/u.exec(input.raw)?.[0] !== input.raw
                && /^(?: 休むことは大事 |休むことは大事[。！])$/u.exec(input.raw)?.[0] !== input.raw)
            || input.speaker !== 'player' || input.locale !== 'ja'
            || context.scene !== 'clearing'
            || world.mode !== 'idle' || world.attention !== null
            || !['short', 'gesture'].includes(receipt.beforeState.settings.speech)
            || u.complete !== false || u.polarity !== 'positive' || u.eventTime !== 'unspecified'
            || u.aspect !== null || u.conditionStatus !== null || Object.hasOwn(receipt.reply, 'observation')) return null;
        const initial = equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }])
            && world.hunger === .35 && world.fatigue === .15;
        const scoped = /^休むことは大事$/u.exec(input.raw)?.[0] === input.raw
            && equal(context.attention, [{ id: 'shade', meaning: 'rest' }])
            && world.hunger === .8005555555555556 && world.fatigue === .6964285714285714
            && learnedReport(knowledge);
        if (!initial && !scoped) return null;
        if (initial && !knowledge.meanings.some(item => item.id === 'rest')
            && u.kind === 'report' && equal(u.known, {}) && equal(u.relations, ['report'])
            && u.subject === 'player'
            && equal(u.reportSource, { kind: 'speaker_report', inputId: input.id, heardAt: input.at })
            && equal(u.unresolved, [{ type: 'meaning', field: 'meaning', token: 'rest' }, { type: 'detail', token: 'importance' }])
            && receipt.reply.message === 'attend')
            return '何かを伝えられたけれど、何のことか分からなかった。';
        if ((initial && !knowledge.relations.some(item => item.id === 'report') || scoped)
            && u.kind === 'partial' && equal(u.known, { meaning: 'rest' }) && equal(u.relations, [])
            && u.subject === null && !Object.hasOwn(u, 'reportSource')
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }, { type: 'detail', token: 'importance' }])
            && receipt.reply.message === (receipt.beforeState.settings.speech === 'short' ? 'uncertain' : 'attend'))
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        if (initial && !knowledge.meanings.some(item => item.id === 'rest')
            && !knowledge.relations.some(item => item.id === 'report')
            && u.kind === 'partial' && equal(u.known, {}) && equal(u.relations, [])
            && u.subject === null && !Object.hasOwn(u, 'reportSource')
            && equal(u.unresolved, [{ type: 'relation', id: 'report' },
                { type: 'meaning', field: 'meaning', token: 'rest' }, { type: 'detail', token: 'importance' }])
            && receipt.reply.message === 'attend') return '言われたことが分からなかった。';
        return null;
    }
    function learnedReport(knowledge) {
        const entries = knowledge.relations.filter(entry => entry.id === 'report');
        return entries.length === 2 && ['self', 'player'].every(subject => entries.some(entry =>
            entry.source === 'experienced_relation' && entry.scope?.kind === 'report'
            && entry.scope.locale === 'ja' && entry.scope.speaker === 'player' && entry.scope.meaning === 'rest'
            && typeof entry.scope.form === 'string'
            && /^(?:あなたは|私は)休んでいる$/u.exec(entry.scope.form)?.[0] === entry.scope.form
            && equal(entry.scope.roles, { reporter: 'player', contentSubject: subject, status: 'reported', verified: false })
            && (/^あなたは/u.test(entry.scope.form) ? subject === 'self' : subject === 'player')
            && Array.isArray(entry.evidence) && entry.evidence.length > 0));
    }
    // Read-only CR..DH projection; prior learning never supplies current understanding.
    // The aw/bp owners validate the original
    // report, unresolved importance, source and independent before/after receipt.
    // UI callers translate the existing Japanese source through GameI18n.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create(), checked = candidates.create();
            supplied.retain(record);
            if (reports.capture(checked, result, receipt)) {
                if (!equal(supplied.read()[0], checked.read()[0]) || !inScope(result, receipt)) return null;
                return '休むことは分かったけれど、言われたことは全部は分からなかった。';
            }
            if (!incompleteReports.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0])) return null;
            return incompleteSentence(result, receipt);
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
