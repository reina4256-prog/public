(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_diary_candidates') : root.ExperimentalWordDiaryCandidates,
        node ? require('./experimental_word_diary_rest_comfort_reports') : root.ExperimentalWordDiaryRestComfortReports,
        node ? require('./experimental_word_diary_incomplete_rest_comfort_reports') : root.ExperimentalWordDiaryIncompleteRestComfortReports);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryRestComfortProse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (candidates, reports, incompleteReports) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function inScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const match = /^横になると(?:気持ちいい|きもちいい|心地よい)(?:よね|ね|よ)?$/u.exec(input.raw);
        const plain = typeof input.raw === 'string' && match?.[0] === input.raw;
        const basicMatch = /^横になると気持ちいい$/u.exec(input.raw);
        const basic = typeof input.raw === 'string' && basicMatch?.[0] === input.raw;
        const punctuation = /^(?: 横になると気持ちいい |横になると気持ちいい[。！])$/u.exec(input.raw);
        const shortForm = typeof input.raw === 'string' && punctuation?.[0] === input.raw
            && receipt.beforeState.settings.speech === 'short';
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]);
        const noTarget = basic && world.mode === 'idle'
            && context.scene === 'shore' && equal(context.attention, []);
        const initialScope = initial && (world.mode === 'idle' ? plain || shortForm
            : basic && ['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode));
        const fatigueScope = initial && basic && world.mode === 'idle'
            && receipt.beforeState.settings.speech === 'short' && [0, .2, .4, .8, 1].includes(world.fatigue);
        return input.speaker === 'player' && input.locale === 'ja' && (initialScope || noTarget)
            && world.attention === null && world.hunger === .35 && (world.fatigue === .15 || fatigueScope);
    }
    function initialIncompleteScope(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const basic = /^横になると気持ちいい$/u.exec(input.raw);
        return basic?.[0] === input.raw && input.speaker === 'player' && input.locale === 'ja'
            && context.scene === 'clearing' && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }])
            && world.mode === 'idle' && world.attention === null && world.hunger === .35 && world.fatigue === .15;
    }
    function incompleteScope(result, receipt) {
        const knowledge = receipt.inputKnowledge, u = result.understandings[0];
        return initialIncompleteScope(result, receipt)
            && !knowledge.meanings.some(item => ['comfortable', 'rest'].includes(item.id))
            && !knowledge.relations.some(item => ['report', 'condition'].includes(item.id))
            && u.kind === 'partial' && u.complete === false && equal(u.known, {}) && equal(u.relations, [])
            && u.subject === null && u.aspect === null && u.conditionStatus === 'unknown'
            && !Object.hasOwn(u, 'reportSource') && receipt.reply.message === 'attend' && !receipt.reply.observation;
    }
    function partialSentence(result, receipt) {
        const u = result.understandings[0], input = result.input;
        const short = receipt.beforeState.settings.speech === 'short';
        if (!initialIncompleteScope(result, receipt) || u.kind !== 'report' || u.complete !== false
            || !equal(u.relations, ['report', 'condition']) || u.subject !== 'player'
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.aspect !== 'rest_comfort'
            || u.conditionStatus !== 'unknown'
            || !equal(u.reportSource, { kind: 'speaker_report', inputId: input.id, heardAt: input.at })
            || receipt.reply.message !== (short ? 'uncertain' : 'attend') || receipt.reply.observation) return null;
        if (!receipt.inputKnowledge.meanings.some(item => item.id === 'comfortable')
            && equal(u.known, { conditionMeaning: 'rest' })
            && equal(u.unresolved, [{ type: 'meaning', field: 'meaning', token: 'comfortable' }]))
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        if (!receipt.inputKnowledge.meanings.some(item => item.id === 'rest')
            && equal(u.known, { meaning: 'comfortable' })
            && equal(u.unresolved, [{ type: 'meaning', field: 'conditionMeaning', token: 'rest' }]))
            return '気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        return null;
    }
    function missingRelationSentence(result, receipt) {
        const u = result.understandings[0], knowledge = receipt.inputKnowledge;
        const short = receipt.beforeState.settings.speech === 'short';
        if (!initialIncompleteScope(result, receipt) || u.kind !== 'partial' || u.complete !== false
            || !equal(u.known, { meaning: 'comfortable', conditionMeaning: 'rest' })
            || u.subject !== null || u.aspect !== null || Object.hasOwn(u, 'reportSource')
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== 'unknown'
            || receipt.reply.message !== (short ? 'uncertain' : 'attend') || receipt.reply.observation) return null;
        if (!knowledge.relations.some(item => ['report', 'condition'].includes(item.id))
            && equal(u.relations, [])
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' }]))
            return '休むことと気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        for (const [missing, present] of [['report', 'condition'], ['condition', 'report']]) {
            if (!knowledge.relations.some(item => item.id === missing)
                && equal(u.relations, [present]) && equal(u.unresolved, [{ type: 'relation', id: missing }]))
                return '休むことと気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        }
        return null;
    }
    function missingBothMeaningsSentence(result, receipt) {
        const u = result.understandings[0], input = result.input;
        if (!initialIncompleteScope(result, receipt) || u.kind !== 'report' || u.complete !== false
            || receipt.inputKnowledge.meanings.some(item => ['comfortable', 'rest'].includes(item.id))
            || !equal(u.known, {}) || !equal(u.relations, ['report', 'condition'])
            || !equal(u.unresolved, [{ type: 'meaning', field: 'meaning', token: 'comfortable' },
                { type: 'meaning', field: 'conditionMeaning', token: 'rest' }])
            || u.subject !== 'player' || u.aspect !== 'rest_comfort' || u.polarity !== 'positive'
            || u.eventTime !== 'unspecified' || u.conditionStatus !== 'unknown'
            || !equal(u.reportSource, { kind: 'speaker_report', inputId: input.id, heardAt: input.at })
            || receipt.reply.message !== 'attend' || receipt.reply.observation) return null;
        return '何かを伝えられたけれど、何のことか分からなかった。';
    }
    // Read-only BL-BY display projection. av and bo each own full receipt checks.
    // Finite form/context/fatigue scopes cannot combine; BS requires absent records,
    // not merely inapplicable scope or an attend reply. Original expression stays absent.
    // UI callers translate this source through GameI18n; no game/save connection.
    function render(record, result, receipt) {
        try {
            const supplied = candidates.create();
            supplied.retain(record);
            const checked = candidates.create();
            if (reports.capture(checked, result, receipt)) {
                return equal(supplied.read()[0], checked.read()[0]) && inScope(result, receipt)
                    ? '横になると気持ちいいと聞いた。' : null;
            }
            if (!incompleteReports.capture(checked, result, receipt)
                || !equal(supplied.read()[0], checked.read()[0])) return null;
            return incompleteScope(result, receipt) ? '言われたことが分からなかった。'
                : partialSentence(result, receipt) || missingRelationSentence(result, receipt)
                    || missingBothMeaningsSentence(result, receipt);
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
