(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryCorrectionsCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryCorrections = api;
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
        if (basis.source === 'initial') return equal(basis, { id: 'naming', source: 'initial' });
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
    function namingFor(input, knowledge, experiences, at) {
        const initial = knowledge.relations.filter(r => r.id === 'naming' && r.source === 'initial');
        const bases = initial.length ? initial : knowledge.relations.filter(r => r.id === 'naming'
            && r.scope?.locale === input.locale && r.scope?.speaker === input.speaker);
        return bases.length === 1 && validNaming(bases[0], input, at, knowledge, experiences) ? bases : null;
    }
    function correctionFor(input, frame, original, knowledge, experiences, lessons, at) {
        const initial = knowledge.relations.filter(r => r.id === 'correction' && r.source === 'initial');
        if (initial.length) return initial.length === 1 && equal(initial[0], { id: 'correction', source: 'initial' })
            ? { basis: initial, lesson: null } : null;
        const matches = knowledge.relations.filter(r => r.id === 'correction' && r.source === 'experienced_relation'
            && equal(r.scope, { kind: 'word_correction', locale: input.locale, speaker: input.speaker,
                word: key(frame.word), meaning: meaning(frame.meaning), form: key(frame.span),
                original: original.inputId, scene: input.scene, targets: original.captureTargets }));
        if (matches.length !== 1) return null;
        const basis = matches[0], candidates = lessons.filter(l => l.original?.inputId === original.inputId
            && equal(l.source?.scope, { scene: input.scene, targets: original.captureTargets }));
        if (candidates.length !== 1) return null;
        const lesson = candidates[0], old = { ...original }; delete old.captureTargets;
        const ids = lessons.flatMap(l => [l.source?.input?.id, ...(l.replacement ? [l.replacement.input?.id] : [])]);
        if (new Set(ids).size !== ids.length || ids.some(id => !finite(serial(id)) || serial(id) >= serial(input.id)
            || id === old.inputId)) return null;
        if (!equal(lesson.original, old) || !validSample(lesson.source, 'source', old, knowledge, experiences, at)
            || !validSample(lesson.replacement, 'replacement', old, knowledge, experiences, at)
            || !equal(lesson.source.scope, lesson.replacement.scope)
            || serial(lesson.source.input.id) >= serial(lesson.replacement.input.id)
            || serial(lesson.replacement.input.id) >= serial(input.id)
            || lesson.source.input.at > lesson.replacement.input.at || lesson.replacement.input.at > input.at
            || lesson.source.at > lesson.replacement.at || lesson.replacement.at > at
            || key(lesson.replacement.frame.utterance) !== key(frame.span)
            || lesson.replacement.understanding.known.meaning === old.meaning
            || !equal(basis.evidence, [lesson.source.input.id, lesson.replacement.input.id])) return null;
        const evidence = { relation: 'correction', inputId: lesson.replacement.input.id, sourceId: lesson.source.input.id,
            original: old.inputId, locale: input.locale, speaker: input.speaker, word: key(frame.word),
            meaning: meaning(frame.meaning), form: key(frame.span), scope: lesson.source.scope };
        const refs = knowledge.relationEvidence.filter(e => e.relation === 'correction' && e.original === old.inputId
            && equal(e.scope, lesson.source.scope));
        return refs.length === 1 && equal(refs[0], evidence) ? { basis: [basis], lesson } : null;
    }
    // Seven pre-input snapshots, no game call or persistence schema.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences, beforeLessons, beforeRecords) {
        const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
        const learning = result?.learning?.[0];
        if (input?.speaker !== 'player' || !finite(serial(input.id)) || !finite(input.at) || input.at < 0
            || typeof input.raw !== 'string' || !catalog.correctionTeaching[input.locale]
            || result.interpretations?.length !== 1 || result.understandings?.length !== 1 || result.learning?.length !== 1
            || frame?.kind !== 'word_correction' || frame.oldMeaning || !equal(wordFrame(input.raw, input.locale), frame)
            || !equal(frame.relations, ['naming', 'correction']) || !['eat', 'rest'].includes(meaning(frame.meaning))
            || meaning(frame.word) || context?.scene !== input.scene || typeof context.mode !== 'string' || !context.mode
            || !(context.target === null || typeof context.target === 'string') || !Array.isArray(context.attention)
            || !context.attention.every(a => typeof a?.id === 'string') || !finite(context.elapsed)
            || !finite(context.activityStart) || context.activityStart < 0 || context.elapsed < context.activityStart
            || !Array.isArray(beforeKnowledge?.meanings) || !Array.isArray(beforeKnowledge.relations)
            || !Array.isArray(beforeKnowledge.wordExplanations) || !Array.isArray(beforeKnowledge.associations)
            || !Array.isArray(beforeKnowledge.relationEvidence) || !Array.isArray(beforeExperiences)
            || !Array.isArray(beforeLessons) || !Array.isArray(beforeRecords)) return false;
        const targets = context.attention.map(a => a.id), scope = { scene: context.scene, targets };
        const matches = beforeKnowledge.wordExplanations.filter(e => key(e.word) === key(frame.word)
            && e.speaker === input.speaker && !e.retractedBy && scopeFits(e.scope, context.scene, targets));
        if (matches.length !== 1) return false;
        const original = matches[0], oldInput = original.input, parsed = typeof oldInput?.raw === 'string'
            ? wordFrame(oldInput.raw, oldInput.locale) : null;
        if (original.corrects || original.retractedBy || !finite(serial(original.inputId))
            || serial(original.inputId) >= serial(input.id) || oldInput?.id !== original.inputId
            || oldInput.locale !== input.locale || oldInput.speaker !== input.speaker || oldInput.scene !== original.scope.scene
            || oldInput.at !== original.heardAt || !finite(original.heardAt) || original.heardAt > input.at
            || parsed?.kind !== 'word_explanation' || parsed.word !== original.word || parsed.meaning !== original.explainedAs
            || meaning(parsed.meaning) !== original.meaning || !['eat', 'rest'].includes(original.meaning)
            || original.meaning === meaning(frame.meaning)
            || beforeKnowledge.associations.some(a => key(a.word) === key(frame.word) && a.speaker === input.speaker
                && a.evidence?.some(e => !e.retractedBy))
            || !validBasis(original.basis, original.meaning, context.elapsed, beforeKnowledge, beforeExperiences)) return false;
        const records = beforeRecords.filter(r => r.id === original.inputId), record = records[0];
        const oldNaming = namingFor(oldInput, beforeKnowledge, beforeExperiences, context.elapsed);
        const oldU = record?.understandings?.[0], stripped = oldU ? { ...oldU } : null;
        if (stripped) delete stripped.wordExplanation;
        if (records.length !== 1 || record.retractedBy || record.speaker !== input.speaker || record.heardAt !== original.heardAt
            || record.understandings.length !== 1 || !oldNaming
            || !validUnderstanding(stripped, 'word_explanation', original.meaning, oldNaming)
            || !equal(oldU.wordExplanation, { word: original.word, explainedAs: original.explainedAs,
                scope: original.scope, basis: original.basis, input: oldInput })) return false;
        const namingBasis = namingFor(input, beforeKnowledge, beforeExperiences, context.elapsed);
        const correction = correctionFor(input, frame, { ...original, captureTargets: targets },
            beforeKnowledge, beforeExperiences, beforeLessons, context.elapsed);
        const basis = beforeKnowledge.meanings.find(m => m.id === meaning(frame.meaning));
        if (!namingBasis || !correction || !validBasis(basis, meaning(frame.meaning), context.elapsed, beforeKnowledge, beforeExperiences)) return false;
        const expected = { kind: 'word_correction', known: { meaning: basis.id }, target: null, relations: ['naming', 'correction'],
            unresolved: [], complete: true, subject: input.speaker, polarity: 'positive', eventTime: 'unspecified',
            aspect: null, conditionStatus: null, questionSlot: null };
        const refs = [...namingBasis, ...correction.basis].filter(b => b.source === 'experienced_relation');
        if (refs.length) expected.relationReferences = refs;
        expected.corrects = original.inputId;
        expected.wordExplanation = { word: frame.word, explainedAs: frame.meaning, scope, basis, input };
        const candidate = { word: frame.word, meaning: basis.id, scope };
        if (!equal(u, expected) || !equal(learning, { candidates: [candidate], adopted: { ...candidate, status: 'tentative' },
            updated: [{ inputId: input.id, meaning: basis.id }], relationAcquired: false, retraction: original.inputId })
            || beforeRecords.some(r => r.id === input.id) || beforeKnowledge.wordExplanations.some(e => e.inputId === input.id)) return false;
        return buffer.retain({ occurrenceId: `word_correction:${input.id}`, kind: 'teaching', sourceId: input.id,
            captured: { sources: { input, frame, index: 0, scene: context.scene, attention: context.attention,
                activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                original, originalRecord: record, correctionLesson: correction.lesson },
                originalNamingBasis: oldNaming, basis, namingBasis, correctionBasis: correction.basis,
                understanding: u, correction: learning } });
    }
    return Object.freeze({ capture });
});
