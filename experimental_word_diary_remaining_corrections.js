(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports
        ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryRemainingCorrectionsCatalog);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryRemainingCorrections = api;
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
        return { kind, known: { meaning: id }, target: null, relations: wordFrame(input.raw, input.locale).relations,
            unresolved: [], complete: true, subject: 'player', polarity: 'positive', eventTime: 'unspecified',
            aspect: null, conditionStatus: null, questionSlot: null,
            wordExplanation: { word: wordFrame(input.raw, input.locale).word,
                explainedAs: wordFrame(input.raw, input.locale).meaning, scope, basis, input } };
    }

    function materials(v) {
        const i = v?.result?.input, c = v?.context, k = v?.beforeKnowledge;
        return finite(serial(i?.id)) && i.speaker === 'player' && typeof i.raw === 'string'
            && finite(i.at) && i.at >= 0 && Object.hasOwn(catalog.correctionTeaching, i.locale)
            && typeof i.scene === 'string' && c?.scene === i.scene && typeof c.mode === 'string' && c.mode
            && (c.target === null || typeof c.target === 'string') && Array.isArray(c.attention)
            && c.attention.every(t => typeof t?.id === 'string') && finite(c.elapsed)
            && finite(c.activityStart) && c.activityStart >= 0 && c.elapsed >= c.activityStart
            && (k?.wordExplanations === undefined || Array.isArray(k.wordExplanations)
                && k.wordExplanations.every(e => e && typeof e === 'object'))
            && ['meanings', 'relations', 'associations'].every(field =>
                Array.isArray(k?.[field]) && k[field].every(e => e && typeof e === 'object'))
            && k.associations.every(a => Array.isArray(a.evidence) && a.evidence.every(e => e && typeof e === 'object'))
            && Array.isArray(v.beforeExperiences) && Array.isArray(v.beforeRecords)
            && v.beforeRecords.every(r => finite(serial(r?.id)) && serial(r.id) < serial(i.id))
            && new Set(v.beforeRecords.map(r => r.id)).size === v.beforeRecords.length
            && v.result.interpretations?.length === 1 && v.result.understandings?.length === 1
            && v.result.learning?.length === 1 && !v.result.relationLearning && !v.result.feelingLearning;
    }
    function recordFor(v) {
        const i = v.result.input;
        return { id: i.id, speaker: i.speaker, heardAt: i.at,
            understandings: v.result.understandings, source: 'speaker_report' };
    }
    function entryFor(v) {
        const i = v.result.input, u = v.result.understandings[0], f = v.result.interpretations[0];
        return { inputId: i.id, heardAt: i.at, input: i, word: f.word, explainedAs: f.meaning,
            meaning: u.known.meaning, speaker: i.speaker, scope: u.wordExplanation.scope,
            basis: u.wordExplanation.basis, ...(u.corrects ? { corrects: u.corrects } : {}) };
    }
    function definition(v, correction = false) {
        if (!materials(v)) return false;
        const { result: r, context: c, beforeKnowledge: k } = v, i = r.input, f = r.interpretations[0];
        if (correction && !Array.isArray(k.wordExplanations)) return false;
        if (!equal(wordFrame(i.raw, i.locale), f) || f.kind !== (correction ? 'word_correction' : 'word_explanation')
            || meaning(f.word) || !allowed.includes(meaning(f.meaning))
            || !f.relations.every(id => initial(k, id))) return false;
        const basis = k.meanings.find(m => m.id === meaning(f.meaning));
        if (!validBasis(basis, meaning(f.meaning), i, k, v.beforeExperiences, c.elapsed)) return false;
        const scope = { scene: c.scene, targets: c.attention.map(t => t.id) };
        const u = understood(f.kind, basis.id, i, scope, basis);
        if (f.oldMeaning) {
            const old = meaning(f.oldMeaning), oldBasis = k.meanings.find(m => m.id === old);
            if (!allowed.includes(old) || !validBasis(oldBasis, old, i, k, v.beforeExperiences, c.elapsed)) return false;
            u.known.oldMeaning = old;
        }
        if (correction) {
            const explanation = u.wordExplanation; delete u.wordExplanation;
            u.corrects = r.understandings[0]?.corrects; u.wordExplanation = explanation;
        }
        if (!equal(r.understandings[0], u)) return false;
        const candidate = { word: f.word, meaning: basis.id, scope };
        return equal(r.learning[0], { candidates: [candidate], adopted: { ...candidate, status: 'tentative' },
            updated: [{ inputId: i.id, meaning: basis.id }], relationAcquired: false,
            ...(correction ? { retraction: u.corrects } : {}) });
    }
    function naming(v, link, evidence) {
        if (!materials(v) || v.result.input.locale !== 'ja' || !initial(v.beforeKnowledge, 'naming')) return false;
        const { result: r, context: c } = v, i = r.input, f = r.interpretations[0], u = r.understandings[0];
        // Only the existing Japanese catalog naming forms, with one attended berry.
        const rule = catalog.patterns.ja.find(item => item.id === f.catalogRule && item.frame.kind === 'naming');
        const match = rule && new RegExp(rule.pattern, 'u').exec(i.raw.trim());
        if (!match || f.word !== match.groups?.word || f.kind !== 'naming' || f.span !== i.raw.trim()
            || !equal(f.relations, ['naming']) || f.target !== (rule.frame.target === '$target' ? match.groups.target : rule.frame.target)
            || c.attention.length !== 1 || c.attention[0].id !== link.target || !/^berry:[1-9]\d*$/.test(link.target)
            || key(f.word) !== key(link.word) || i.speaker !== link.speaker
            || !equal(evidence, { key: JSON.stringify([i.speaker, c.scene, link.target, f.word]),
                inputId: i.id, scene: c.scene, source: 'explanation' })) return false;
        const expectedFrame = Object.fromEntries(Object.entries(rule.frame).map(([field, value]) =>
            [field, typeof value === 'string' && value.startsWith('$') ? match.groups[value.slice(1)] : value]));
        if (!equal(f, { ...expectedFrame, span: i.raw.trim(), catalogRule: rule.id })) return false;
        const target = { id: link.target, source: 'attention' };
        if (!equal(u, { kind: 'naming', known: {}, target: { candidates: [target], adopted: target },
            relations: ['naming'], unresolved: [], complete: true, subject: i.speaker, polarity: 'positive',
            eventTime: 'unspecified', aspect: null, conditionStatus: null, questionSlot: null })) return false;
        const candidate = { word: f.word, target: link.target, source: 'explanation', speaker: i.speaker };
        return equal(r.learning[0], { candidates: [candidate], adopted: { ...candidate, status: 'tentative' },
            updated: [{ word: f.word, target: link.target, inputId: i.id }] });
    }
    function validate(v, receipts, visited = new Set()) {
        if (!definition(v, true)) return null;
        const { result: r, context: c, beforeKnowledge: k } = v, i = r.input, f = r.interpretations[0];
        if (visited.has(i.id)) return null;
        visited.add(i.id);
        const targets = c.attention.map(t => t.id), oldId = r.understandings[0].corrects;
        const applies = scope => fits(scope, c.scene, targets);
        const oldMeaning = f.oldMeaning ? meaning(f.oldMeaning) : null;
        if (f.oldMeaning && (!allowed.includes(oldMeaning) || i.locale !== 'ja')) return null;
        const matches = (k.wordExplanations || []).filter(e => !e.retractedBy && key(e.word) === key(f.word)
            && e.speaker === i.speaker && applies(e.scope) && (!f.oldMeaning || e.meaning === oldMeaning))
            .map(entry => ({ entry }));
        for (const link of k.associations) if (key(link.word) === key(f.word) && link.speaker === i.speaker)
            for (const evidence of link.evidence) {
                const record = v.beforeRecords.find(rec => rec.id === evidence.inputId);
                if (!evidence.retractedBy && !record?.retractedBy && record?.understandings?.[0]?.complete
                    && applies({ scene: evidence.scene, targets: [link.target] })
                    && (!f.oldMeaning || oldMeaning === (link.target.startsWith('berry:') ? 'berry' : null)))
                    matches.push({ link, evidence });
            }
        if (matches.length !== 1) return null;
        const original = matches[0], id = original.entry?.inputId || original.evidence.inputId;
        if (id !== oldId || !finite(serial(id)) || serial(id) >= serial(i.id)) return null;
        const sources = receipts.filter(p => p?.result?.input?.id === id), prior = sources[0];
        if (sources.length !== 1 || !materials(prior) || prior.result.input.locale !== i.locale
            || prior.result.input.at > i.at || prior.context.elapsed > c.elapsed) return null;
        const records = v.beforeRecords.filter(rec => rec.id === id);
        if (records.length !== 1 || !equal(records[0], recordFor(prior))) return null;
        let chain = [];
        if (original.entry) {
            if (!equal(original.entry, entryFor(prior)) || original.entry.meaning === meaning(f.meaning)
                || !validBasis(original.entry.basis, original.entry.meaning, prior.result.input, k, v.beforeExperiences, c.elapsed))
                return null;
            if (original.entry.corrects) {
                const previous = validate(prior, receipts, new Set(visited));
                if (!previous) return null;
                chain = previous.chain;
                // Every older link must still be present with its actual forward retraction.
                for (const item of chain) {
                    const next = item.retractedBy, past = item.source;
                    const record = v.beforeRecords.find(rec => rec.id === past.result.input.id);
                    const expected = recordFor(past);
                    if (past.result.interpretations[0].kind === 'naming') expected.retractedBy = next;
                    if (!equal(record, expected)) return null;
                    if (past.result.interpretations[0].kind === 'naming') {
                        const links = k.associations.filter(a => key(a.word) === key(past.result.interpretations[0].word)
                            && a.speaker === past.result.input.speaker && a.target === past.context.attention[0].id);
                        if (links.length !== 1 || !links[0].evidence.some(e =>
                            equal(e, { ...item.individualEvidence, retractedBy: next }))) return null;
                    } else if (!equal(k.wordExplanations.find(e => e.inputId === past.result.input.id),
                        { ...entryFor(past), retractedBy: next })) return null;
                }
            } else if (!definition(prior)) return null;
        } else if (i.locale !== 'ja' || !naming(prior, original.link, original.evidence)) return null;
        return { original, chain: [...chain, { source: prior, retractedBy: i.id,
            ...(original.evidence ? { individualEvidence: original.evidence } : {}) }] };
    }
    // Seven input-time arguments. Receipts are flat, copied source materials;
    // each keeps its own before snapshots, never nested receipts or game saves.
    function capture(buffer, result, context, beforeKnowledge, beforeExperiences, beforeRecords, beforeReceipts) {
        if (!Array.isArray(beforeReceipts) || beforeReceipts.some(p => !p || Object.hasOwn(p, 'beforeReceipts'))
            || beforeReceipts.some(p => !finite(serial(p.result?.input?.id))
                || serial(p.result.input.id) >= serial(result?.input?.id))
            || new Set(beforeReceipts.map(p => p.result?.input?.id)).size !== beforeReceipts.length) return false;
        const value = { result, context, beforeKnowledge, beforeExperiences, beforeRecords };
        const validated = validate(value, beforeReceipts);
        if (!validated) return false;
        const frame = result.interpretations[0], original = validated.original;
        // x and aj retain all their existing ownership, including experienced relations.
        if (!frame.oldMeaning && original.entry && !original.entry.corrects) return false;
        return buffer.retain({ occurrenceId: 'remaining_word_correction:' + result.input.id,
            kind: 'teaching', sourceId: result.input.id, captured: {
                sources: { input: result.input, frame, index: 0, scene: context.scene, attention: context.attention,
                    activity: { mode: context.mode, target: context.target, start: context.activityStart, at: context.elapsed },
                    original, originalRecord: beforeRecords.find(r => r.id === result.understandings[0].corrects),
                    chain: validated.chain, priorExperiences: beforeExperiences },
                namingBasis: initial(beforeKnowledge, 'naming'), correctionBasis: initial(beforeKnowledge, 'correction'),
                ...(frame.oldMeaning ? { negationBasis: initial(beforeKnowledge, 'negation'),
                    contrastBasis: initial(beforeKnowledge, 'contrast'),
                    oldMeaningBasis: beforeKnowledge.meanings.find(m => m.id === meaning(frame.oldMeaning)) } : {}),
                basis: beforeKnowledge.meanings.find(m => m.id === meaning(frame.meaning)),
                understanding: result.understandings[0], correction: result.learning[0] } });
    }
    return Object.freeze({ capture });
});
