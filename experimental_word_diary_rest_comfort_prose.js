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
    function initialIncompleteScope(result, receipt, alternateForms = false) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const basic = (alternateForms ? /^(?:横になると(?:気持ちいい|きもちいい|心地よい)(?:よね|ね|よ)?| 横になると気持ちいい |横になると気持ちいい[。！])$/u
            : /^横になると気持ちいい$/u).exec(input.raw);
        const initial = context.scene === 'clearing'
            && equal(context.attention, [{ id: 'berry:1', meaning: 'berry' }]) && world.mode === 'idle';
        const exactBasic = /^横になると気持ちいい$/u.exec(input.raw)?.[0] === input.raw;
        const shoreActivity = exactBasic && context.scene === 'shore' && equal(context.attention, [])
            && ['observe', 'eat', 'rest', 'work', 'walk'].includes(world.mode) && world.fatigue === .15;
        const initialFatigue = exactBasic && initial && [0, .2, .4, .8, 1].includes(world.fatigue);
        return basic?.[0] === input.raw && input.speaker === 'player' && input.locale === 'ja'
            && (initial && world.fatigue === .15 || shoreActivity || initialFatigue)
            && world.attention === null && world.hunger === .35;
    }
    function incompleteScope(result, receipt) {
        const knowledge = receipt.inputKnowledge, u = result.understandings[0];
        return initialIncompleteScope(result, receipt, true)
            && !knowledge.meanings.some(item => ['comfortable', 'rest'].includes(item.id))
            && !knowledge.relations.some(item => ['report', 'condition'].includes(item.id))
            && u.kind === 'partial' && u.complete === false && equal(u.known, {}) && equal(u.relations, [])
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' },
                { type: 'meaning', field: 'meaning', token: 'comfortable' },
                { type: 'meaning', field: 'conditionMeaning', token: 'rest' }])
            && u.polarity === 'positive' && u.eventTime === 'unspecified'
            && u.subject === null && u.aspect === null && u.conditionStatus === 'unknown'
            && !Object.hasOwn(u, 'reportSource') && receipt.reply.message === 'attend' && !receipt.reply.observation;
    }
    function partialSentence(result, receipt) {
        const u = result.understandings[0], input = result.input;
        const short = receipt.beforeState.settings.speech === 'short';
        if (!initialIncompleteScope(result, receipt, true) || u.kind !== 'report' || u.complete !== false
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
        if (!initialIncompleteScope(result, receipt, true) || u.kind !== 'partial' || u.complete !== false
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
        if (!initialIncompleteScope(result, receipt, true) || u.kind !== 'report' || u.complete !== false
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
    function missingMeaningAndRelationSentence(result, receipt) {
        const u = result.understandings[0], knowledge = receipt.inputKnowledge;
        const short = receipt.beforeState.settings.speech === 'short';
        const missingRelation = !knowledge.relations.some(item => item.id === 'report') && equal(u.relations, ['condition'])
            ? 'report' : !knowledge.relations.some(item => item.id === 'condition') && equal(u.relations, ['report'])
                ? 'condition' : null;
        if (!initialIncompleteScope(result, receipt, true) || u.kind !== 'partial' || u.complete !== false
            || !missingRelation
            || u.subject !== null || u.aspect !== null || Object.hasOwn(u, 'reportSource')
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== 'unknown'
            || receipt.reply.message !== (short ? 'uncertain' : 'attend') || receipt.reply.observation) return null;
        if (!knowledge.meanings.some(item => item.id === 'comfortable')
            && equal(u.known, { conditionMeaning: 'rest' })
            && equal(u.unresolved, [{ type: 'relation', id: missingRelation },
                { type: 'meaning', field: 'meaning', token: 'comfortable' }]))
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        if (!knowledge.meanings.some(item => item.id === 'rest')
            && equal(u.known, { meaning: 'comfortable' })
            && equal(u.unresolved, [{ type: 'relation', id: missingRelation },
                { type: 'meaning', field: 'conditionMeaning', token: 'rest' }]))
            return '気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        return null;
    }
    function threeMissingSentence(result, receipt) {
        const u = result.understandings[0], knowledge = receipt.inputKnowledge;
        if (!initialIncompleteScope(result, receipt, true) || u.kind !== 'partial' || u.complete !== false
            || u.subject !== null || u.aspect !== null || Object.hasOwn(u, 'reportSource')
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== 'unknown'
            || receipt.reply.observation) return null;
        if (!knowledge.meanings.some(item => ['comfortable', 'rest'].includes(item.id))
            && equal(u.known, {}) && receipt.reply.message === 'attend') {
            for (const [missing, present] of [['report', 'condition'], ['condition', 'report']]) {
                if (!knowledge.relations.some(item => item.id === missing) && equal(u.relations, [present])
                    && equal(u.unresolved, [{ type: 'relation', id: missing },
                        { type: 'meaning', field: 'meaning', token: 'comfortable' },
                        { type: 'meaning', field: 'conditionMeaning', token: 'rest' }]))
                    return '言われたことが分からなかった。';
            }
        }
        if (knowledge.relations.some(item => ['report', 'condition'].includes(item.id)) || !equal(u.relations, [])
            || receipt.reply.message !== (receipt.beforeState.settings.speech === 'short' ? 'uncertain' : 'attend')) return null;
        const relations = [{ type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' }];
        if (!knowledge.meanings.some(item => item.id === 'comfortable') && equal(u.known, { conditionMeaning: 'rest' })
            && equal(u.unresolved, [...relations, { type: 'meaning', field: 'meaning', token: 'comfortable' }]))
            return '休むことは分かったけれど、言われたことは全部は分からなかった。';
        if (!knowledge.meanings.some(item => item.id === 'rest') && equal(u.known, { meaning: 'comfortable' })
            && equal(u.unresolved, [...relations, { type: 'meaning', field: 'conditionMeaning', token: 'rest' }]))
            return '気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。';
        return null;
    }
    function scopedRelationSentence(result, receipt) {
        const input = result.input, context = receipt.inputContext, world = receipt.beforeWorld;
        const u = result.understandings[0], relations = receipt.inputKnowledge.relations;
        if (/^横になると気持ちいい$/u.exec(input.raw)?.[0] !== input.raw
            || input.speaker !== 'player' || input.locale !== 'ja'
            || context.scene !== 'clearing' || !equal(context.attention, [{ id: 'shade', meaning: 'rest' }])
            || world.mode !== 'idle' || world.attention !== null
            || !['short', 'gesture'].includes(receipt.beforeState.settings.speech)
            || u.kind !== 'partial' || u.complete !== false
            || !equal(u.known, { meaning: 'comfortable', conditionMeaning: 'rest' })
            || u.subject !== null || u.aspect !== null || Object.hasOwn(u, 'reportSource')
            || u.polarity !== 'positive' || u.eventTime !== 'unspecified' || u.conditionStatus !== 'unknown'
            || receipt.reply.message !== (receipt.beforeState.settings.speech === 'short' ? 'uncertain' : 'attend')
            || receipt.reply.observation) return null;
        const learned = (entry, id) => entry.id === id && entry.source === 'experienced_relation'
            && entry.scope?.kind === (id === 'report' ? 'report' : 'conditional_proposal')
            && entry.scope.locale === 'ja' && entry.scope.speaker === 'player' && entry.scope.meaning === 'rest'
            && typeof entry.scope.form === 'string'
            && Array.isArray(entry.evidence) && entry.evidence.length > 0
            && (id === 'report' ? /^(?:あなたは|私は)休んでいる$/u.exec(entry.scope.form)?.[0] === entry.scope.form
                && equal(entry.scope.roles, { reporter: 'player', contentSubject: /^あなたは/u.test(entry.scope.form) ? 'self' : 'player',
                    status: 'reported', verified: false })
                : /^あなたが疲れていたら、休んでね$/u.exec(entry.scope.form)?.[0] === entry.scope.form
                    && typeof entry.scope.proposalForm === 'string'
                    && /^休んでね$/u.exec(entry.scope.proposalForm)?.[0] === entry.scope.proposalForm
                    && entry.scope.conditionMeaning === 'tired' && entry.scope.conditionSubject === 'self'
                    && entry.scope.application === 'when_met' && entry.scope.duration === 'unspecified'
                    && equal(entry.scope.roles, { proposer: 'player', addressee: 'self', actors: ['self'],
                        status: 'proposed', actualParticipation: false }));
        const report = relations.filter(entry => entry.id === 'report');
        const condition = relations.filter(entry => entry.id === 'condition');
        const cp = report.length > 0 && report.every(entry => learned(entry, 'report')) && condition.length === 0
            && equal(u.relations, [])
            && equal(u.unresolved, [{ type: 'relation', id: 'report' }, { type: 'relation', id: 'condition' }]);
        const cq = condition.length > 0 && condition.every(entry => learned(entry, 'condition'))
            && report.length === 1 && report[0].source === 'initial' && equal(u.relations, ['report'])
            && equal(u.unresolved, [{ type: 'relation', id: 'condition' }]);
        return cp || cq ? '休むことと気持ちよさのことは分かったけれど、言われたことは全部は分からなかった。' : null;
    }
    // Read-only BL-CQ display projection. av and bo each own full receipt checks.
    // Finite alternate spellings preserve every prerequisite layout separately.
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
                    || missingBothMeaningsSentence(result, receipt) || missingMeaningAndRelationSentence(result, receipt)
                        || threeMissingSentence(result, receipt) || scopedRelationSentence(result, receipt);
        } catch (_) { return null; }
    }
    return Object.freeze({ render });
});
