(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryCorrectionCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryCorrectionExamples = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
    'use strict';
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const key = v => typeof v === 'string' ? v.normalize('NFKC').trim().toLocaleLowerCase() : null;
    const serial = v => typeof v === 'string' && /^input:[1-9]\d*$/.test(v) ? Number(v.slice(6)) : NaN;
    const finite = v => typeof v === 'number' && Number.isFinite(v);
    // This read-only parser mirrors the existing 3c3e2 boundary. It does not
    // receive input, learn, or call a world/game/save API.
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
    function scopeFits(scope, scene, targets) {
        return typeof scope?.scene === 'string' && Array.isArray(scope.targets)
            && scope.targets.every(t => typeof t === 'string')
            && (scope.targets.length && targets.length ? scope.targets.some(t => targets.includes(t)) : scope.scene === scene);
    }
    function validBasis(basis, id, at, knowledge, experiences) {
        const current = knowledge.meanings.find(m => m.id === id);
        if (!basis || !current || basis.id !== id || basis.source !== current.source) return false;
        if (basis.source === 'initial') return equal(basis, current);
        return basis.source === 'experienced_life' && Array.isArray(basis.evidence) && basis.evidence.length > 0
            && basis.evidence.every(e => current.evidence?.some(item => equal(item, e))
                && experiences.some(event => event.id === e.experienceId && event.kind === 'experience'
                    && event.activity === id && finite(event.start) && finite(event.end) && event.end > event.start
                    && event.end <= at && event.lifeLabels?.some(l => l.inputId === e.scope?.inputId
                        && l.meaning === id && l.speaker === e.scope.speaker && l.target === e.scope.target
                        && l.at === e.scope.labelAt && l.raw === e.scope.label && l.start === event.start)));
    }
    function validNaming(basis, input, at, knowledge, experiences) {
        if (basis?.id !== 'naming' || !knowledge.relations.some(r => equal(r, basis))) return false;
        if (basis.source === 'initial') return true;
        if (basis.source !== 'experienced_relation' || !equal(basis.scope, { kind: 'word_explanation',
            locale: input.locale, speaker: input.speaker, meanings: ['eat', 'rest'] })
            || !Array.isArray(basis.evidence) || basis.evidence.length !== 2 || new Set(basis.evidence).size !== 2) return false;
        return basis.evidence.every((id, i) => serial(id) < serial(input.id) && experiences.some(event =>
            event.kind === 'experience' && event.activity === ['eat', 'rest'][i] && finite(event.start)
            && finite(event.end) && event.end > event.start && event.end <= at && event.relationLabels?.some(l => {
                const f = typeof l.raw === 'string' ? wordFrame(l.raw, l.locale) : null;
                return l.relation === 'naming' && l.inputId === id && l.locale === input.locale && l.speaker === input.speaker
                    && l.start === event.start && l.target === event.target && l.activity === event.activity
                    && l.at >= event.start && l.at < event.end && l.meaning === event.activity && f?.kind === 'word_explanation'
                    && f.word === l.word && meaning(f.meaning) === l.meaning
                    && validBasis(l.basis, l.meaning, l.start, knowledge, experiences)
                    && l.understanding?.complete === false && l.understanding.kind === 'partial'
                    && equal(l.understanding.known, { meaning: l.meaning }) && equal(l.understanding.relations, [])
                    && equal(l.understanding.unresolved, [{ type: 'relation', id: 'naming' }])
                    && knowledge.relationEvidence?.some(e => equal(e, { relation: 'naming', experienceId: event.id,
                        inputId: id, locale: l.locale, speaker: l.speaker, word: l.word, meaning: l.meaning }));
            })));
    }
    function validUnderstanding(u, kind, id, namingBasis) {
        const expected = { kind, known: { meaning: id }, target: null, relations: ['naming'], unresolved: [], complete: true,
            subject: 'player', polarity: 'positive', eventTime: 'unspecified', aspect: null, conditionStatus: null, questionSlot: null };
        const refs = namingBasis.filter(b => b.source === 'experienced_relation');
        if (refs.length) expected.relationReferences = refs;
        return equal(u, expected);
    }
    function validSample(sample, phase, original, knowledge, experiences, ceiling) {
        const input = sample?.input, f = sample?.frame, u = sample?.understanding;
        if (!finite(serial(input?.id)) || input.speaker !== 'player' || !finite(input.at) || input.at < original.heardAt
            || input.locale !== original.input.locale || !finite(sample.at) || sample.at < 0 || sample.at > ceiling
            || input.scene !== sample.scope?.scene || !Array.isArray(sample.scope?.targets)
            || !sample.scope.targets.every(t => typeof t === 'string') || !catalog.correctionTeaching[input.locale]
            || typeof f?.utterance !== 'string' || f.phase !== phase
            || input.raw !== `${catalog.correctionTeaching[input.locale][phase]}«${f.utterance}»`) return false;
        const parsed = wordFrame(f.utterance, input.locale);
        if (!parsed || parsed.kind !== (phase === 'source' ? 'word_explanation' : 'word_correction') || parsed.oldMeaning
            || !equal(f, { ...parsed, kind: 'correction_demonstration', phase, utterance: f.utterance,
                relations: ['naming'], span: input.raw, catalogRule: 'correction_teaching' })
            || key(f.word) !== key(original.word) || !['eat', 'rest'].includes(meaning(f.meaning))
            || !Array.isArray(sample.namingBasis) || sample.namingBasis.length !== 1
            || !sample.namingBasis.every(b => validNaming(b, input, sample.at, knowledge, experiences))
            || !validUnderstanding(u, 'correction_demonstration', meaning(f.meaning), sample.namingBasis)
            || !validBasis(sample.basis, u.known.meaning, sample.at, knowledge, experiences)
            || serial(input.id) <= serial(original.inputId)
            || !scopeFits(original.scope, input.scene, sample.scope.targets)) return false;
        return phase !== 'source' || f.utterance === original.input.raw && u.known.meaning === original.meaning;
    }
    // All seven supplied arguments are temporary input-time snapshots, not a
    // storage format. This only copies a teaching already accepted by offer.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences, beforeLessons, beforeRecords) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const pairing = result?.relationLearning, lesson = pairing?.candidates?.[0], original = lesson?.original;
        if (input?.speaker !== 'player' || !finite(serial(input.id)) || !finite(input.at)
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1
            || frame?.kind !== 'correction_demonstration' || !['source', 'replacement'].includes(frame.phase)
            || context?.scene !== input.scene || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string') || !Array.isArray(context.attention)
            || !context.attention.every(a => typeof a?.id === 'string') || !finite(context.elapsed)
            || !finite(context.activityStart) || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || !Array.isArray(beforeKnowledge.wordExplanations) || !Array.isArray(beforeKnowledge.associations)
            || !Array.isArray(beforeExperiences) || !Array.isArray(beforeLessons) || !Array.isArray(beforeRecords)
            || pairing?.candidates?.length !== 1 || !Array.isArray(pairing.updated)
            || !equal(pairing.adopted, { relation: 'correction', ...lesson }) || !original?.input
            || !finite(serial(original.inputId)) || original.input.id !== original.inputId
            || original.input.speaker !== 'player' || original.speaker !== 'player' || !finite(original.heardAt)
            || original.input.at !== original.heardAt || original.input.locale !== input.locale
            || original.input.scene !== original.scope?.scene || original.retractedBy || original.corrects) return false;
        const targets = context.attention.map(a => a.id), sample = lesson[frame.phase];
        const parsed = typeof original.input.raw === 'string' ? wordFrame(original.input.raw, input.locale) : null;
        const matches = beforeKnowledge.wordExplanations.filter(e => key(e.word) === key(original.word)
            && e.speaker === input.speaker && !e.retractedBy && scopeFits(e.scope, context.scene, targets));
        if (matches.length !== 1 || !equal(matches[0], original) || parsed?.kind !== 'word_explanation'
            || parsed.word !== original.word || parsed.meaning !== original.explainedAs || meaning(parsed.meaning) !== original.meaning
            || !['eat', 'rest'].includes(original.meaning) || meaning(original.word)
            || beforeKnowledge.associations.some(a => key(a.word) === key(original.word) && a.speaker === input.speaker
                && a.evidence?.some(e => !e.retractedBy && serial(e.inputId) < serial(input.id)))
            || beforeKnowledge.relations.some(r => r.id === 'correction' && (r.source === 'initial'
                || r.scope?.kind === 'word_correction' && r.scope.locale === input.locale && r.scope.speaker === input.speaker
                    && r.scope.word === key(frame.word) && r.scope.meaning === meaning(frame.meaning)
                    && r.scope.form === key(frame.utterance) && r.scope.original === original.inputId
                    && scopeFits(r.scope, context.scene, targets)))
            || !sample || !equal(sample.input, input) || !equal(sample.frame, frame) || !equal(sample.understanding, u)
            || sample.at !== context.elapsed || !equal(sample.scope, { scene: context.scene, targets })
            || !validSample(lesson.source, 'source', original, beforeKnowledge, beforeExperiences, context.elapsed)
            || !validBasis(original.basis, original.meaning, lesson.source.at, beforeKnowledge, beforeExperiences)) return false;
        const records = beforeRecords.filter(r => r.id === original.inputId), recordU = records[0]?.understandings?.[0];
        const originalU = recordU ? { ...recordU } : null;
        if (originalU) delete originalU.wordExplanation;
        if (records.length !== 1 || records[0].retractedBy || records[0].speaker !== 'player'
            || records[0].heardAt !== original.heardAt || records[0].understandings.length !== 1
            || !validUnderstanding(originalU, 'word_explanation', original.meaning, lesson.source.namingBasis)
            || !equal(recordU.wordExplanation, { word: original.word, explainedAs: original.explainedAs,
                scope: original.scope, basis: original.basis, input: original.input })) return false;
        const preceding = beforeLessons.filter(l => l.original?.inputId === original.inputId && equal(l.source?.scope, sample.scope));
        if (frame.phase === 'source') {
            if (lesson.replacement !== undefined || preceding.length || pairing.updated.length || pairing.relationAcquired !== false
                || !equal(sample.basis, beforeKnowledge.meanings.find(m => m.id === original.meaning))) return false;
        } else {
            if (preceding.length !== 1 || preceding[0].replacement !== undefined
                || !equal(preceding[0], { original, source: lesson.source })
                || !validSample(sample, 'replacement', original, beforeKnowledge, beforeExperiences, context.elapsed)
                || serial(sample.input.id) <= serial(lesson.source.input.id) || sample.input.at < lesson.source.input.at
                || sample.at < lesson.source.at || !equal(sample.scope, lesson.source.scope)
                || u.known.meaning === original.meaning
                || !equal(sample.basis, beforeKnowledge.meanings.find(m => m.id === u.known.meaning))) return false;
            const evidence = { relation: 'correction', inputId: input.id, sourceId: lesson.source.input.id,
                original: original.inputId, locale: input.locale, speaker: input.speaker, word: key(original.word),
                meaning: u.known.meaning, form: key(frame.utterance), scope: lesson.source.scope };
            if (!equal(pairing.updated, [evidence]) || pairing.relationAcquired !== true) return false;
        }
        const ids = beforeLessons.flatMap(l => [l.source?.input?.id, ...(l.replacement ? [l.replacement.input?.id] : [])]);
        if (new Set(ids).size !== ids.length || ids.some(id => !finite(serial(id)) || serial(id) >= serial(input.id)
            || id === original.inputId) || beforeRecords.some(r => r.id === input.id)) return false;
        return buffer.retain({ occurrenceId: `correction_example:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                original, originalRecord: records[0], sourceTeaching: frame.phase === 'replacement' ? lesson.source : null },
                basis: sample.basis, namingBasis: sample.namingBasis, understanding: u, correctionKnownBefore: false, pairing } });
    }
    return Object.freeze({ capture });
});
