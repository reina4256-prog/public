(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordNotebook = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Reading is a projection of retained sources, never a learning event.
    function entries(state) {
        const result = [];
        const organizedReports = new Set(state.notes.map(n => n.sourceId).filter(id => id !== undefined));
        const organizedExperiences = new Set(state.notes.map(n => n.experienceId).filter(id => id !== undefined));
        const knows = id => state.knowledge.meanings.some(m => m.id === id);
        for (const evidence of state.knowledge.relationEvidence) {
            const event = (state.experiences || []).find(e => e.id === evidence.experienceId);
            const label = event?.relationLabels?.find(l => l.inputId === evidence.inputId);
            if (!label) continue;
            const learned = state.knowledge.relations.some(r => r.source === 'experienced_relation'
                && r.evidence.includes(evidence.inputId));
            result.push({ group: 'names', message: 'note_name', literal: label.raw,
                detail: learned ? 'note_relation_learned' : 'note_relation_pairing', sourceId: label.inputId,
                experienceId: event.id, organized: organizedExperiences.has(event.id) });
        }
        for (const entry of state.knowledge.wordExplanations || []) {
            result.push({ group: 'names', message: 'note_name', literal: `${entry.word} → ${entry.explainedAs}`, target: entry.meaning,
                detail: entry.retractedBy ? 'note_word_withdrawn' : 'note_word_explained', withdrawn: !!entry.retractedBy,
                sourceId: entry.inputId, corrects: entry.corrects || null, organized: organizedReports.has(entry.inputId) });
        }
        for (const meaning of state.knowledge.meanings) {
            if (meaning.source === 'experienced_life') {
                for (const evidence of meaning.evidence) result.push({ group: 'names', message: 'note_name',
                    literal: evidence.scope.label, target: evidence.scope.target, detail: 'note_life_learned',
                    organized: organizedExperiences.has(evidence.experienceId) });
            }
            if (meaning.source !== 'demonstrated_work' || !meaning.id.startsWith('work:')) continue;
            result.push({ group: 'names', message: `work_did_${meaning.id.slice(5)}`, target: meaning.id,
                detail: 'note_work_learned', organized: meaning.evidence.some(e => organizedExperiences.has(e.experienceId)) });
        }
        for (const encounter of state.encounters || []) {
            if (!['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'].includes(encounter.master)) continue;
            result.push({ group: 'experiences', message: `master_met_${encounter.master}`, target: encounter.target,
                detail: 'note_master_met', organized: false });
        }
        for (const link of state.knowledge.associations) {
            if (link.speaker !== 'player' || !link.evidence.length) continue;
            const active = link.evidence.filter(e => !e.retractedBy && !state.records.find(r => r.id === e.inputId)?.retractedBy);
            const withdrawn = active.length === 0;
            result.push({ group: 'names', message: 'note_name', literal: link.word, target: link.target,
                detail: withdrawn ? 'note_withdrawn' : link.confirmedBy ? 'note_name_confirmed' : 'note_name_scope', withdrawn,
                ...(link.evidence.length === 1 ? { sourceId: link.evidence[0].inputId } : {}),
                organized: (withdrawn ? link.evidence : active).some(e => organizedReports.has(e.inputId)) });
        }
        for (const record of state.records) {
            for (const u of record.understandings) {
                if (record.speaker !== 'player' || !u.complete || u.subject !== 'player'
                    || u.kind !== 'report' || u.aspect !== 'preference' || u.known.meaning !== 'like'
                    || u.polarity !== 'positive') continue;
                const target = u.target?.adopted?.id;
                if (target !== 'berry' && !target?.startsWith('berry:')) continue;
                result.push({ group: 'names', message: target === 'berry' ? 'note_player_likes' : 'note_player_likes_one',
                    withdrawn: !!record.retractedBy, detail: record.retractedBy ? 'note_withdrawn' : 'note_heard',
                    organized: organizedReports.has(record.id) });
            }
        }
        for (const experience of state.experiences || []) {
            const kind = experience.activity;
            if (kind === 'work' && ['explore', 'farming', 'fishing', 'cooking', 'smithing', 'building'].includes(experience.master)) {
                result.push({ group: 'experiences', message: `master_result_${experience.master}`,
                    target: experience.target, detail: 'note_work_result', organized: organizedExperiences.has(experience.id) });
                continue;
            }
            if (!['eat', 'rest'].includes(kind) || !experience.before || !experience.after) continue;
            const improved = kind === 'eat' ? experience.after.hunger < experience.before.hunger
                : experience.after.fatigue < experience.before.fatigue;
            const named = kind === 'eat' ? knows('eat') && knows('hungry') : knows('rest') && knows('tired');
            result.push({ group: 'experiences', message: improved
                ? kind === 'eat' ? (named ? 'note_ate' : 'note_ate_sensation') : (named ? 'note_rested' : 'note_rest_sensation')
                : kind === 'eat' ? 'note_tried_eat' : 'note_tried_rest',
                detail: experience.taste?.quality === 'sweet' && knows('sweet') ? 'note_experienced_sweet' : 'note_experienced',
                organized: organizedExperiences.has(experience.id) });
        }
        for (const question of state.notebookQuestions || []) {
            result.push({ group: 'questions', message: 'note_question', literal: question.raw,
                detail: 'note_no_answer', organized: false });
        }
        return result;
    }
    function groupedEntries(state) {
        const groups = new Map();
        for (const entry of entries(state)) {
            const key = JSON.stringify([entry.group, entry.message, entry.literal, entry.target, entry.detail, !!entry.withdrawn,
                entry.corrects !== undefined ? entry.sourceId : null]);
            if (!groups.has(key)) groups.set(key, { ...entry, items: [], count: 0 });
            const group = groups.get(key);
            group.items.push(entry); group.count++;
            group.organized = group.items.every(item => item.organized);
        }
        return [...groups.values()];
    }
    function displayEntries(entries, limit) {
        const pending = entries.slice(-limit).reverse(), result = [];
        // Keep the usual newest-first notebook, but a visible correction follows
        // its struck-out source. Reading or sorting never changes saved records.
        while (pending.length) {
            const index = pending.findIndex(entry => !entry.corrects || !pending.some(old => old.sourceId === entry.corrects));
            result.push(pending.splice(index < 0 ? 0 : index, 1)[0]);
        }
        return result;
    }
    function rememberQuestion(state, result, reply) {
        const u = result.understandings.at(-1);
        if (reply.message !== 'answer_unknown' || u?.kind !== 'question' || !u.complete) return;
        state.notebookQuestions ||= [];
        if (!state.notebookQuestions.some(q => q.inputId === result.input.id)) {
            state.notebookQuestions.push({ inputId: result.input.id, raw: result.input.raw });
        }
    }
    return Object.freeze({ entries, groupedEntries, displayEntries, rememberQuestion });
});
