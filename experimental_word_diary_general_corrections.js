(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryGeneralCorrectionsCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryGeneralCorrections = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = v => typeof v === 'string' ? v.normalize('NFKC').trim().toLocaleLowerCase() : null;
    const serial = v => typeof v === 'string' && /^input:[1-9]\d*$/.test(v) ? Number(v.slice(6)) : NaN;
    const finite = Number.isFinite;
    const life = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired'];
    const jobs = { explore: 'supplies_carried', farming: 'stones_cleared', fishing: 'net_repaired',
        cooking: 'dishes_washed', smithing: 'fire_tended', building: 'plan_copied' };
    const allowed = [...life, 'work', ...Object.keys(jobs).map(id => `work:${id}`)];
    // Read-only copies of the existing basic definition forms. No learning,
    // game, UI, storage or persistence contract is introduced here.
    function wordFrame(raw, locale) {
        const forms = {
            ja: /^(?:(さっき(?:は|の説明は)?間違えた)[。\s、,]*)?[「"]?([\p{L}\p{N}ー]{1,16})[」"]?は[「"]?([^。！？!?\n]+?)[」"]?(?:のこと|こと)(?:だよ|です|だ)[。]?$/u,
            en: /^(?:(i was wrong)[.,]\s*)?"([^"\n]{1,24})" means "([^"\n]+)"[.]?$/iu,
            'zh-CN': /^(?:(刚才说错了)[，,。\s]*)?[“"]([^”"\n]{1,24})[”"]的意思是[“"]([^”"\n]+)[”"][。]?$/u,
            ru: /^(?:(я ошибся)[.,]\s*)?"([^"\n]{1,24})" значит "([^"\n]+)"[.]?$/iu,
            'es-ES': /^(?:(me equivoqué)[.,]\s*)?"([^"\n]{1,24})" significa "([^"\n]+)"[.]?$/iu,
            'pt-BR': /^(?:(eu errei)[.,]\s*)?"([^"\n]{1,24})" significa "([^"\n]+)"[.]?$/iu,
            de: /^(?:(ich habe mich geirrt)[.,]\s*)?"([^"\n]{1,24})" bedeutet "([^"\n]+)"[.]?$/iu
        };
        const match = forms[locale]?.exec(raw.trim());
        if (!match) return null;
        const contrast = locale === 'ja' && /^(.+?)(?:のこと|こと)?じゃなくて[、,\s]*(.+)$/u.exec(match[3]);
        return { kind: match[1] || contrast ? 'word_correction' : 'word_explanation', word: match[2],
            meaning: contrast ? contrast[2] : match[3], ...(contrast ? { oldMeaning: contrast[1] } : {}),
            relations: ['naming', ...(match[1] || contrast ? ['correction'] : []), ...(contrast ? ['negation', 'contrast'] : [])],
            span: raw, catalogRule: 'word_explanation' };
    }
    function meaning(word) {
        return Object.entries({ ...catalog.meanings, ...catalog.experienceMeanings })
            .find(([, forms]) => forms.some(form => key(form) === key(word)))?.[0];
    }
    function fits(scope, scene, targets) {
        return typeof scope?.scene === 'string' && Array.isArray(scope.targets)
            && scope.targets.every(t => typeof t === 'string')
            && (scope.targets.length && targets.length ? scope.targets.some(t => targets.includes(t)) : scope.scene === scene);
    }
    function initial(knowledge, id) {
        const matches = knowledge.relations.filter(r => r?.id === id);
        return matches.length === 1 && equal(matches[0], { id, source: 'initial' }) ? matches : null;
    }
    function lifeFits(id, activity, target, before, taste) {
        if (['berry', 'food', 'eat', 'sweet', 'hungry'].includes(id)) return activity === 'eat'
            && /^berry:[1-9]\d*$/.test(target) && (id !== 'sweet' || taste?.quality === 'sweet')
            && (id !== 'hungry' || before?.hunger >= .45);
        return activity === 'rest' && target === 'shade' && (id !== 'tired' || before?.fatigue >= .55);
    }
    function validBasis(basis, id, input, knowledge, experiences, elapsed) {
        const roots = knowledge.meanings.filter(m => m?.id === id), current = roots[0];
        if (roots.length !== 1 || !basis || basis.id !== id || basis.source !== current.source) return false;
        if (basis.source === 'initial') return life.includes(id) && equal(basis, { id, source: 'initial' }) && equal(basis, current);
        if (!['experienced_life', 'demonstrated_work'].includes(basis.source)
            || !Array.isArray(basis.evidence) || !basis.evidence.length || !Array.isArray(current.evidence)
            || new Set(basis.evidence.map(e => e?.experienceId)).size !== basis.evidence.length
            || new Set(current.evidence.map(e => e?.experienceId)).size !== current.evidence.length
            || !equal(basis, { id, source: basis.source, evidence: basis.evidence })) return false;
        return basis.evidence.every(e => {
            const events = experiences.filter(event => event?.id === e?.experienceId), event = events[0];
            if (!e || !current.evidence.some(item => equal(item, e)) || events.length !== 1
                || !Number.isSafeInteger(event.id) || event.id < 0 || event.kind !== 'experience'
                || !finite(event.start) || !finite(event.end) || event.start < 0
                || event.end < event.start || event.end > elapsed) return false;
            if (basis.source === 'demonstrated_work') return (id === 'work' || id === `work:${event.master}`)
                && Object.hasOwn(jobs, event.master) && event.activity === 'work'
                && event.target === `master:${event.master}` && event.result === jobs[event.master]
                && event.demonstration === `work_label_${event.master}`
                && equal(e, { experienceId: event.id, master: event.master, demonstration: event.demonstration,
                    scope: { subject: 'self', activity: 'work', result: event.result, master: event.master } });
            const labels = event.lifeLabels?.filter(l => l?.meaning === id), label = labels?.[0];
            return life.includes(id) && labels?.length === 1 && event.end > event.start
                && label.speaker === 'player' && finite(serial(label.inputId)) && serial(label.inputId) < serial(input.id)
                && typeof label.raw === 'string' && label.raw.length > 0 && finite(label.heardAt)
                && label.heardAt <= input.at && finite(label.at) && label.at >= event.start && label.at <= event.end
                && label.start === event.start && label.activity === event.activity && label.target === event.target
                && lifeFits(id, event.activity, event.target, event.before, event.taste)
                && lifeFits(id, label.activity, label.target, label.before, label.taste)
                && equal(e, { experienceId: event.id, scope: { subject: 'self', activity: event.activity,
                    target: event.target, inputId: label.inputId, speaker: label.speaker,
                    labelAt: label.at, label: label.raw } });
        });
    }
    function understood(kind, id, input, scope, basis) {
        return { kind, known: { meaning: id }, target: null, relations: kind === 'word_explanation' ? ['naming'] : ['naming', 'correction'],
            unresolved: [], complete: true, subject: 'player', polarity: 'positive', eventTime: 'unspecified',
            aspect: null, conditionStatus: null, questionSlot: null,
            wordExplanation: { word: wordFrame(input.raw, input.locale).word,
                explainedAs: wordFrame(input.raw, input.locale).meaning, scope, basis, input } };
    }
    // Six arguments supplied at input time, not a save format. x retains the
    // entire eat/rest pair, including its experienced-relation path.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences, beforeRecords) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        if (!finite(serial(input?.id)) || input.speaker !== 'player' || !finite(input.at) || input.at < 0
            || typeof input.raw !== 'string' || !Object.hasOwn(catalog.correctionTeaching, input.locale)
            || typeof input.scene !== 'string' || input.scene !== context?.scene
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1 || result.learning?.length !== 1
            || frame?.kind !== 'word_correction' || frame.oldMeaning || !equal(wordFrame(input.raw, input.locale), frame)
            || !equal(frame.relations, ['naming', 'correction']) || meaning(frame.word)
            || !allowed.includes(meaning(frame.meaning)) || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string') || !Array.isArray(context.attention)
            || !context.attention.every(a => typeof a?.id === 'string') || !finite(context.elapsed)
            || !finite(context.activityStart) || context.activityStart < 0 || context.elapsed < context.activityStart
            || !['meanings', 'relations', 'wordExplanations', 'associations'].every(k => Array.isArray(beforeKnowledge?.[k]))
            || !Array.isArray(beforeExperiences) || !Array.isArray(beforeRecords)
            || !['meanings', 'relations', 'wordExplanations', 'associations'].every(k => beforeKnowledge[k].every(e => e && typeof e === 'object'))
            || !beforeRecords.every(r => finite(serial(r?.id)) && serial(r.id) < serial(input.id))
            || new Set(beforeRecords.map(r => r.id)).size !== beforeRecords.length
            || !beforeKnowledge.associations.every(a => Array.isArray(a.evidence) && a.evidence.every(e => e && typeof e === 'object'))) return false;
        const namingBasis = initial(beforeKnowledge, 'naming'), correctionBasis = initial(beforeKnowledge, 'correction');
        if (!namingBasis || !correctionBasis) return false;
        const targets = context.attention.map(a => a.id), scope = { scene: context.scene, targets };
        const matches = beforeKnowledge.wordExplanations.filter(e => key(e?.word) === key(frame.word)
            && e.speaker === input.speaker && !e.retractedBy && fits(e.scope, context.scene, targets));
        if (matches.length !== 1) return false;
        const original = matches[0], oldInput = original.input;
        const parsed = typeof oldInput?.raw === 'string' ? wordFrame(oldInput.raw, oldInput.locale) : null;
        const nextMeaning = meaning(frame.meaning);
        if (original.corrects || original.retractedBy || !finite(serial(original.inputId))
            || serial(original.inputId) >= serial(input.id) || oldInput?.id !== original.inputId
            || oldInput.locale !== input.locale || oldInput.speaker !== input.speaker || oldInput.scene !== original.scope.scene
            || oldInput.at !== original.heardAt || !finite(original.heardAt) || original.heardAt > input.at
            || parsed?.kind !== 'word_explanation' || parsed.word !== original.word || parsed.meaning !== original.explainedAs
            || meaning(parsed.meaning) !== original.meaning || !allowed.includes(original.meaning)
            || original.meaning === nextMeaning || [original.meaning, nextMeaning].every(id => ['eat', 'rest'].includes(id))
            || beforeKnowledge.associations.some(a => key(a?.word) === key(frame.word) && a.speaker === input.speaker
                && a.evidence?.some(e => !e.retractedBy && fits({ scene: e.scene, targets: [a.target] }, context.scene, targets)))
            || !validBasis(original.basis, original.meaning, oldInput, beforeKnowledge, beforeExperiences, context.elapsed)) return false;
        const records = beforeRecords.filter(r => r?.id === original.inputId), record = records[0];
        if (records.length !== 1 || record.retractedBy || record.speaker !== input.speaker || record.heardAt !== original.heardAt
            || record.understandings?.length !== 1
            || !equal(record.understandings[0], understood('word_explanation', original.meaning, oldInput, original.scope, original.basis))) return false;
        const basis = beforeKnowledge.meanings.find(m => m.id === nextMeaning);
        if (!validBasis(basis, nextMeaning, input, beforeKnowledge, beforeExperiences, context.elapsed)) return false;
        const expected = understood('word_correction', nextMeaning, input, scope, basis);
        // The core appends corrects before wordExplanation; keep its JSON order.
        const explanation = expected.wordExplanation; delete expected.wordExplanation;
        expected.corrects = original.inputId; expected.wordExplanation = explanation;
        const candidate = { word: frame.word, meaning: basis.id, scope };
        if (!equal(u, expected) || !equal(result.learning[0], { candidates: [candidate], adopted: { ...candidate, status: 'tentative' },
            updated: [{ inputId: input.id, meaning: basis.id }], relationAcquired: false, retraction: original.inputId })
            || result.relationLearning || result.feelingLearning
            || beforeRecords.some(r => r.id === input.id) || beforeKnowledge.wordExplanations.some(e => e.inputId === input.id)) return false;
        return buffer.retain({ occurrenceId: `general_word_correction:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                original, originalRecord: record, priorExperiences: beforeExperiences },
                originalNamingBasis: namingBasis, basis, namingBasis, correctionBasis,
                understanding: u, correction: result.learning[0] } });
    }
    return Object.freeze({ capture });
});
