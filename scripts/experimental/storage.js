'use strict';
const fs = require('node:fs');
const path = require('node:path');
const navigation = require('../../experimental_word_island_navigation');
const careers = require('../../experimental_word_careers');
const LIMIT = 16 * 1024 * 1024;
function valid(value) {
    const s = value?.state, w = value?.world;
    return value?.version === 1 && ['robot', 'spirit', 'seed'].includes(value.appearance)
        && s?.version === 1 && typeof s.settings?.foundation === 'boolean'
        && typeof s.settings?.life === 'boolean' && ['short', 'gesture'].includes(s.settings.speech)
        && ['meanings', 'relations', 'associations', 'relationEvidence'].every(k => Array.isArray(s.knowledge?.[k]))
        && [...s.knowledge.meanings, ...s.knowledge.relations].every(e => typeof e?.id === 'string')
        && s.knowledge.associations.every(e => typeof e?.word === 'string' && typeof e.target === 'string' && Array.isArray(e.evidence) && e.evidence.every(item => item && typeof item === 'object'))
        && Array.isArray(s.context?.turns) && Array.isArray(s.context?.attention)
        && Array.isArray(s.records) && Array.isArray(s.notes) && Number.isInteger(s.serial)
        && s.records.every(r => r && Array.isArray(r.understandings) && r.understandings.every(u => u && typeof u.known === 'object'))
        && s.notes.every(n => n && typeof n === 'object')
        && (s.encounters === undefined || (Array.isArray(s.encounters) && s.encounters.every(e => e &&
            Number.isInteger(e.eventId) && Number.isFinite(e.at) && careers.jobId(e.target) === e.master && Object.hasOwn(careers.JOBS, e.master))))
        && (s.notebookQuestions === undefined || (Array.isArray(s.notebookQuestions)
            && s.notebookQuestions.every(q => typeof q?.inputId === 'string' && /^input:\d+$/.test(q.inputId)
                && typeof q.raw === 'string')))
        && ['idle', 'move', 'observe', 'rest', 'eat', 'work'].includes(w?.mode)
        && ['x', 'y', 'elapsed', 'dwell', 'pause', 'hunger', 'fatigue', 'fruit', 'growth', 'event', 'harvest', 'sleepCount'].every(k => Number.isFinite(w[k]))
        && (w.mode !== 'move' || (w.island?.places || [{ id: 'berry:1' }, { id: 'shade' }, { id: 'path' }]).some(p => p.id === w.destination))
        && Array.isArray(w.history) && Array.isArray(w.experiences)
        && Array.isArray(w.reasons) && Number.isFinite(w.activityStart) && Number.isFinite(w.reactionTime)
        && w.hunger >= 0 && w.hunger <= 1 && w.fatigue >= 0 && w.fatigue <= 1
        && Number.isInteger(w.fruit) && w.fruit >= 0 && w.fruit <= 3
        && careers.valid(w)
        && careers.validLearning(s)
        && (w.island === undefined || (navigation.valid(w.island)
            && (w.island.volume === undefined || (Number.isFinite(w.island.volume) && w.island.volume >= 0 && w.island.volume <= 1))
            && (w.route === undefined || (Array.isArray(w.route) && w.route.length < 2000 && w.route.every(p => p && Number.isFinite(p.x) && Number.isFinite(p.y))))))
        && w.recovery && w.visited && w.askedNames && w.sharedReports;
}
function createStore(directory) {
    const main = path.join(directory, 'word-life.json'), backup = main + '.backup';
    let blocked = false;
    function load() {
        try {
            if (!fs.existsSync(main)) {
                if (fs.existsSync(backup)) { blocked = true; return { ok: false, reason: 'missing_primary' }; }
                return { ok: true, value: null };
            }
            if (fs.statSync(main).size > LIMIT) throw new Error('capacity');
            const value = JSON.parse(fs.readFileSync(main, 'utf8'));
            if (!valid(value)) throw new Error('invalid');
            return { ok: true, value };
        } catch (_) { blocked = true; return { ok: false, reason: 'read' }; }
    }
    function save(value) {
        if (blocked) return { ok: false, reason: 'blocked' };
        try {
            if (!valid(value)) throw new Error('invalid');
            const text = JSON.stringify(value);
            if (Buffer.byteLength(text) > LIMIT) throw new Error('capacity');
            // A previous valid save remains untouched if writing the new snapshot fails.
            fs.writeFileSync(main + '.tmp', text, { encoding: 'utf8', flush: true });
            if (fs.existsSync(main)) {
                const previous = fs.readFileSync(main, 'utf8');
                if (!valid(JSON.parse(previous))) throw new Error('invalid_previous');
                fs.writeFileSync(backup + '.tmp', previous, { encoding: 'utf8', flush: true });
                fs.renameSync(backup + '.tmp', backup);
            }
            fs.renameSync(main + '.tmp', main);
            return { ok: true };
        } catch (_) { blocked = true; return { ok: false, reason: 'write' }; }
    }
    return { load, save };
}
module.exports = { createStore, valid };
