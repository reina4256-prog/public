(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_learning_catalog.json') : root.ExperimentalWordDiaryReferencesCatalog);
    if (node) module.exports = api;
    else root.ExperimentalWordDiaryReferences = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, worldApi, catalog) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const serial = id => typeof id === 'string' && /^input:[1-9]\d*$/.test(id) ? Number(id.slice(6)) : NaN;
    function jsonData(value, ancestors = new Set()) {
        if (value === null || ['string', 'boolean'].includes(typeof value)) return true;
        if (typeof value === 'number') return Number.isFinite(value);
        if (typeof value !== 'object' || ancestors.has(value)
            || !Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
        ancestors.add(value);
        const valid = Reflect.ownKeys(value).every(key => typeof key === 'string')
            && (Array.isArray(value) ? Array.from(value) : Object.values(value)).every(item => jsonData(item, ancestors));
        ancestors.delete(value); return valid;
    }
    // Separate temporary journal: the established five-kind candidate contract
    // and its reviewed source remain unchanged. No game or storage caller.
    function create() {
        const records = [];
        function retain(candidate) {
            if (!candidate || !['reference', 'proposal'].includes(candidate.kind)
                || typeof candidate.occurrenceId !== 'string' || !candidate.occurrenceId
                || !Number.isSafeInteger(serial(candidate.sourceId))
                || !candidate.captured || Array.isArray(candidate.captured)
                || typeof candidate.captured !== 'object' || !jsonData(candidate)) throw new TypeError('Invalid reference candidate');
            if (records.some(record => record.occurrenceId === candidate.occurrenceId)) return false;
            records.push(copy(candidate)); return true;
        }
        return Object.freeze({ retain, read: () => copy(records) });
    }
    // Three occurrence-time arguments, not a save schema. Original receipts
    // are flat copies captured immediately around the original core.receive.
    function capture(buffer, result, receipt) {
        let candidate;
        try {
            const input = result?.input, frame = result?.interpretations?.[0], u = result?.understandings?.[0];
            const before = receipt?.beforeState, world = receipt?.beforeWorld;
            if (!core || !worldApi || !catalog || !input || !catalog.patterns[input.locale]
                || !Number.isSafeInteger(before?.serial) || before.serial < 0
                || input.id !== `input:${before.serial + 1}` || !equal(input, receipt.input)
                || !equal(before.knowledge, receipt.inputKnowledge) || input.scene !== before.context?.scene
                || !Number.isFinite(input.at) || typeof input.speaker !== 'string' || !input.speaker
                || result.interpretations?.length !== 1 || result.understandings?.length !== 1
                || !u?.complete || u.unresolved?.length || !world || !Number.isFinite(world.elapsed)
                || !Number.isFinite(world.activityStart) || world.activityStart < 0 || world.activityStart > world.elapsed
                || !Array.isArray(receipt.origins) || !core.validWordLearning(before, catalog)) return false;
            const word = frame.kind === 'word_reference' && u.kind === 'word_reference';
            const individual = frame.kind === 'reference' && u.kind === 'reference' && u.target?.adopted?.source === 'experience';
            const invitation = frame.kind === 'invitation' && frame.catalogRule === 'word_use'
                && u.kind === 'invitation' && u.known.meaning === 'rest' && u.polarity === 'positive'
                && u.eventTime === 'unspecified' && !u.conditionStatus && !u.target;
            if (!word && !individual && !invitation) return false;
            if ((word || invitation) && (u.applications?.length !== 1 || u.applications[0].field !== 'meaning'
                || !u.applications[0].adopted || !u.applications[0].candidates?.length)) return false;
            const stateCopy = copy(before), worldCopy = copy(world);
            const expected = core.receive(stateCopy, input.raw, catalog,
                { locale: input.locale, speaker: input.speaker, at: input.at });
            if (!equal(expected, result)) return false;
            const reply = worldApi.respond(worldCopy, expected, stateCopy, catalog);
            if (!equal(reply, receipt.reply) || !equal(worldCopy, receipt.afterWorld)
                || !equal(stateCopy, receipt.afterState)) return false;
            // Require the actual original source snapshots, not just a current
            // explanation row or a rendered notebook label. Replay originals
            // only on disposable copies, with their original knowledge/scope.
            const origins = new Map();
            for (const origin of receipt.origins) {
                const prior = origin?.result?.input, state = copy(origin.beforeState);
                if (!Number.isSafeInteger(serial(prior?.id)) || serial(prior.id) >= serial(input.id)
                    || prior.id !== `input:${state.serial + 1}` || origins.has(prior.id)
                    || prior.scene !== state.context.scene || !Number.isFinite(prior.at)) return false;
                const replay = core.receive(state, prior.raw, catalog,
                    { locale: prior.locale, speaker: prior.speaker, at: prior.at });
                if (!equal(replay, origin.result) || !equal(state, origin.afterState)) return false;
                origins.set(prior.id, origin);
            }
            const references = [], required = new Set();
            function explanation(id, visiting = new Set()) {
                if (visiting.has(id)) return false;
                visiting.add(id); required.add(id);
                const entries = before.knowledge.wordExplanations.filter(entry => entry.inputId === id);
                const origin = origins.get(id), entry = entries[0];
                if (entries.length !== 1 || !origin) return false;
                const originals = origin.afterState.knowledge.wordExplanations.filter(e => e.inputId === id);
                const current = copy(entry); delete current.retractedBy;
                if (originals.length !== 1 || !equal(current, originals[0])) return false;
                if (entry.corrects) {
                    if (serial(entry.corrects) >= serial(id)) return false;
                    const old = before.knowledge.wordExplanations.find(e => e.inputId === entry.corrects);
                    if (old) { if (old.retractedBy !== id || !explanation(entry.corrects, visiting)) return false; }
                    else if (!individualEvidence(entry.corrects, id)) return false;
                }
                return true;
            }
            function individualEvidence(id, retractedBy = null) {
                required.add(id);
                const origin = origins.get(id);
                if (!origin || origin.result.understandings.length !== 1
                    || origin.result.understandings[0].kind !== 'naming' || !origin.result.understandings[0].complete) return false;
                const updates = origin.result.learning.flatMap(l => l.updated);
                const links = before.knowledge.associations.filter(link => link.evidence.some(e => e.inputId === id));
                if (updates.length !== 1 || links.length !== 1) return false;
                const link = links[0], update = updates[0];
                const evidence = link.evidence.filter(e => e.inputId === id);
                const original = origin.afterState.knowledge.associations.find(a => a.word === link.word
                    && a.target === link.target && a.speaker === link.speaker);
                const active = copy(evidence[0]); delete active.retractedBy;
                return evidence.length === 1 && (evidence[0].retractedBy || null) === retractedBy
                    && update.word === link.word && update.target === link.target && link.speaker === input.speaker
                    && original?.evidence.filter(e => e.inputId === id).length === 1
                    && equal(active, original.evidence.find(e => e.inputId === id));
            }
            if (individual) {
                // Keep all candidates used by the existing resolver, including
                // competitors disambiguated by the current attention.
                for (const target of u.target.candidates) for (const id of target.evidence || []) {
                    if (!individualEvidence(id)) return false;
                }
                if (!required.size) return false;
                references.push({ type: 'individual', resolution: u.target });
            } else {
                for (const entry of u.applications[0].candidates) if (!explanation(entry.inputId)) return false;
                references.push({ type: 'word', application: u.applications[0] });
            }
            if (origins.size !== required.size || [...origins.keys()].some(id => !required.has(id))) return false;
            let decision = null;
            if (invitation) {
                const continuing = world.mode === 'eat' || world.mode === 'work'
                    || typeof world.attention === 'string' && world.attention.startsWith('berry:') && world.dwell > 4;
                decision = { outcome: continuing ? 'continuing'
                    : worldCopy.mode === 'move' && worldCopy.destination === 'shade' ? 'approaching' : 'not_started',
                response: reply, before: world, after: worldCopy };
                // Indirect applications never manufacture direct-proposal
                // selection provenance or a reason-learning source.
                if (!equal(stateCopy.selectionSources, before.selectionSources)) return false;
            }
            candidate = copy({ occurrenceId: `word_use:${input.id}`, sourceId: input.id,
                kind: invitation ? 'proposal' : 'reference', captured: {
                    sources: { input, frame, scene: before.context.scene, attention: before.context.attention,
                        activity: { mode: world.mode, target: world.attention, start: world.activityStart, at: world.elapsed },
                        origins: receipt.origins, references },
                    inputKnowledge: before.knowledge, understanding: u, response: reply, decision,
                    newTeaching: false, newLearning: false, newExperience: false } });
        } catch (_) { return false; }
        return buffer.retain(candidate);
    }
    return Object.freeze({ create, capture });
});
