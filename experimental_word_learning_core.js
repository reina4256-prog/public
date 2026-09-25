(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    // Trial parameters, not agreed gameplay constants. No random comprehension failures.
    const RULES = Object.freeze({ contextLimit: 8, recallLimit: 4, transferScenes: 2 });
    const RELATIONS = ['report', 'request', 'invitation', 'question', 'naming', 'negation',
        'time', 'condition', 'sequence', 'reason', 'correction', 'contrast'];
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalize = value => value.normalize('NFKC').trim().toLocaleLowerCase();

    function create(options = {}, catalog) {
        if (!catalog || !catalog.meanings || !catalog.patterns) throw new Error('Invalid catalog');
        const settings = { foundation: options.foundation ?? true, life: options.life ?? true,
            speech: options.speech ?? 'short' };
        if (typeof settings.foundation !== 'boolean' || typeof settings.life !== 'boolean'
            || !['short', 'gesture'].includes(settings.speech)) throw new Error('Invalid settings');
        return {
            version: 1, settings, serial: 0,
            knowledge: {
                meanings: settings.life ? Object.keys(catalog.meanings).map(id => ({ id, source: 'initial' })) : [],
                relations: settings.foundation ? RELATIONS.map(id => ({ id, source: 'initial' })) : [],
                associations: [], relationEvidence: []
            },
            context: { turns: [], attention: [], scene: 'clearing', pendingQuestion: null },
            records: [], notes: []
        };
    }

    function perceive(state, { scene, attention }) {
        if (typeof scene !== 'string' || !scene || !Array.isArray(attention)
            || attention.some(item => !item || typeof item.id !== 'string' || typeof item.meaning !== 'string')) {
            throw new Error('Invalid perception');
        }
        state.context.scene = scene;
        state.context.attention = clone(attention);
        if (state.context.pendingQuestion?.kind === 'ask_name'
            && !attention.some(item => item.id === state.context.pendingQuestion.target)) state.context.pendingQuestion = null;
    }

    // Compose topic, predicate and question ending independently. Never strip arbitrary
    // clauses: negation, conditions and other people's subjects must remain unresolved.
    function situationQuestion(part, question, locale) {
        if (locale !== 'ja') return null;
        let body = normalize(part).replace(/^(?:ねえ|ねぇ|ねー)[、,\s]*/u, '')
            .replace(/^(?:きみ|君|あなた)(?:は|って)[、,\s]*/u, '')
            .replace(/^(?:今|いま)(?:は)?[、,\s]*/u, '');
        const pastTopic = /^(?:さっき|先ほど)(?:は)?[、,\s]*/u;
        const asksPast = pastTopic.test(body);
        body = body.replace(pastTopic, '');
        const ending = /(?:んですか|のですか|んでしょうか|のでしょうか|んだろう|のかな|かな|でしょうか|ですか|の|か)$/u;
        const explicitQuestion = question || ending.test(body) || /^(?:何|なに|どこ|どちら|何処)/u.test(body);
        if (!explicitQuestion) return null;
        body = body.replace(ending, '');
        const frame = { kind: 'question', subject: 'self', relations: ['question'], catalogRule: 'situation_question' };
        if (/^(?:何|なに)(?:を)?した$/u.test(body)) {
            return { ...frame, slot: 'past_activity', time: 'past', relations: ['question', 'time'] };
        }
        if (/^(?:(?:どんな|何の|なにの)(?:仕事|手伝い)(?:を)?(?:した|してた|していた)|(?:仕事|手伝い)(?:では|で)(?:何|なに)(?:を)?(?:した|してた|していた))$/u.test(body)) {
            return { ...frame, slot: 'work_past', meaning: 'work', time: 'past', relations: ['question', 'time'] };
        }
        if (!asksPast && /^(?:(?:また|もう一度)(?:その人の)?(?:仕事|手伝い)?(?:を)?(?:やりたい|したい|手伝いたい)|(?:その人の)?仕事(?:を)?(?:学びたい|手伝う)|手伝いたい)$/u.test(body)) {
            return { ...frame, slot: 'work_again', meaning: 'work' };
        }
        const activity = /^(?:何|なに)(?:を)?(?:してる|している|しています|してた|していた|していました)$/u;
        if (activity.test(body)) {
            const past = /(?:してた|していた|していました)$/u.test(body);
            if (asksPast && !past) return null;
            return { ...frame, slot: past ? 'past_activity' : 'current_activity',
                ...(past ? { time: 'past', relations: ['question', 'time'] } : {}) };
        }
        if (asksPast) return null;
        if (/^(?:(?:何|なに)(?:を)?(?:見てる|見ている|見ています|みてる|みている)|(?:そこ|ここ)(?:に|には)(?:何|なに)(?:が)?(?:ある|あります|見える|見えます))$/u.test(body)) {
            return { ...frame, slot: 'attention' };
        }
        const destination = /^(?<place>どこ|どちら|何処|木陰|こかげ|道|小道|木の実)(?:に|へ)(?:向かってる|向かっている|向かっています|むかってる|むかっている|行く|いく|行ってる|行っている|行きます)$/u.exec(body);
        if (destination) {
            const meaning = { 木陰: 'rest', こかげ: 'rest', 道: 'walk', 小道: 'walk', 木の実: 'berry' }[destination.groups.place];
            return { ...frame, slot: 'destination', ...(meaning ? { meaning } : {}) };
        }
        return null;
    }

    function interpret(text, locale, catalog) {
        // Raw input is kept separately. Only the parser uses normalized text.
        const parts = text.match(/[^。！？!?\n]+[！？!?]?/gu) || [];
        return parts.map(rawPart => {
            const question = /[?？]$/u.test(rawPart.trim());
            const part = rawPart.trim().replace(/[！？!?]$/u, '').trim();
            const situation = situationQuestion(part, question, locale);
            if (situation) return { ...situation, span: part };
            for (const rule of catalog.patterns[locale] || []) {
                if (rule.requiresQuestion && !question) continue;
                const match = new RegExp(rule.pattern, 'iu').exec(part);
                if (!match) continue;
                const frame = clone(rule.frame);
                for (const [key, value] of Object.entries(frame)) {
                    if (typeof value === 'string' && value.startsWith('$')) frame[key] = match.groups?.[value.slice(1)] || null;
                }
                if (question && frame.kind === 'report') {
                    frame.kind = 'question'; frame.slot = 'confirmation';
                    frame.subject = 'self';
                    frame.relations = frame.relations.filter(id => id !== 'report').concat('question');
                } else if (question && !['question', 'invitation', 'request'].includes(frame.kind)) {
                    return { kind: 'unknown', span: rawPart.trim(), relations: [] };
                }
                return { ...frame, span: part, catalogRule: rule.id };
            }
            return { kind: 'unknown', span: part, relations: [] };
        });
    }

    function lexicalMeaning(token, catalog) {
        if (!token) return null;
        for (const [id, forms] of Object.entries({ ...catalog.meanings, ...catalog.experienceMeanings })) {
            if (forms.some(form => normalize(form) === normalize(token))) return id;
        }
        return null;
    }

    function understands(state, type, id) {
        return state.knowledge[type].some(entry => entry.id === id);
    }

    function resolveTarget(state, token, speaker, catalog, individualOnly = false) {
        if (!token || catalog.deictic.includes(token)) {
            const candidates = state.context.attention.map(item => ({ id: item.id, source: 'attention' }));
            return { candidates, adopted: candidates.length === 1 ? candidates[0] : null };
        }
        const meaning = lexicalMeaning(token, catalog);
        if (meaning && understands(state, 'meanings', meaning)) {
            if (individualOnly) {
                const candidates = state.context.attention.filter(item => item.meaning === meaning)
                    .map(item => ({ id: item.id, source: 'explicit_with_attention' }));
                return { candidates, adopted: candidates.length === 1 ? candidates[0] : null };
            }
            return { candidates: [{ id: meaning, source: 'explicit' }], adopted: { id: meaning, source: 'explicit' } };
        }
        const candidates = state.knowledge.associations.filter(a => normalize(a.word) === normalize(token) && a.speaker === speaker
            && a.evidence.some(e => !e.retractedBy))
            .map(a => ({ id: a.target, source: 'experience', evidence: a.evidence.filter(e => !e.retractedBy).map(e => e.inputId) }));
        const relevant = candidates.filter(a => state.context.attention.some(item => item.id === a.id));
        return { candidates, adopted: relevant.length === 1 ? relevant[0] : candidates.length === 1 ? candidates[0] : null };
    }

    function understand(state, frame, speaker, catalog) {
        const unresolved = [];
        const required = [...(frame.relations || [])];
        const missingRelations = required.filter(id => !understands(state, 'relations', id));
        unresolved.push(...missingRelations.map(id => ({ type: 'relation', id })));
        const known = {};
        for (const field of ['meaning', 'conditionMeaning']) {
            if (!frame[field]) continue;
            const id = Object.hasOwn(catalog.meanings, frame[field]) || Object.hasOwn(catalog.experienceMeanings || {}, frame[field])
                ? frame[field] : lexicalMeaning(frame[field], catalog);
            if (id && understands(state, 'meanings', id)) known[field] = id;
            else unresolved.push({ type: 'meaning', field, token: frame[field] });
        }
        let target = null;
        if (frame.target !== undefined || frame.kind === 'naming') {
            target = resolveTarget(state, frame.target, speaker, catalog, frame.kind === 'naming');
            if (!target.adopted) unresolved.push({ type: 'target', candidates: clone(target.candidates) });
        }
        if (frame.detail) unresolved.push({ type: 'detail', token: frame.detail });
        if (frame.kind === 'unknown') unresolved.push({ type: 'utterance', token: frame.span });
        const relationReady = missingRelations.length === 0 && frame.kind !== 'unknown';
        const result = {
            kind: relationReady ? frame.kind : 'partial', known, target,
            relations: required.filter(id => !missingRelations.includes(id)), unresolved,
            complete: unresolved.length === 0,
            // Scope is only attached when the corresponding relation is understood.
            subject: relationReady ? (frame.subject || (frame.kind === 'question' ? 'self' : speaker)) : null,
            polarity: required.includes('negation') && missingRelations.includes('negation') ? 'unknown' : (frame.polarity || 'positive'),
            eventTime: frame.time && understands(state, 'relations', 'time') ? frame.time : 'unspecified',
            aspect: relationReady ? (frame.aspect || null) : null,
            conditionStatus: frame.conditionMeaning ? 'unknown' : null,
            questionSlot: relationReady && frame.kind === 'question' ? frame.slot : null
        };
        return result;
    }

    // Four separate decisions: form candidates, adopt for this turn, update links,
    // then assess transfer. Merely selecting or recalling a candidate is not evidence.
    function formCandidates(state, frame, understanding, input, catalog) {
        if (frame.kind === 'naming' && understanding.kind === 'naming') {
            return (understanding.target?.candidates || []).map(target => ({ word: frame.word,
                target: target.id, source: 'explanation', speaker: input.speaker }));
        }
        if (frame.kind === 'unknown' && !/[\s、,]/u.test(frame.span) && frame.span.length <= 16) {
            return state.context.attention.map(target => ({ word: frame.span, target: target.id,
                source: 'cooccurrence', speaker: input.speaker }));
        }
        return [];
    }

    function adoptCandidate(candidates) {
        return candidates.length === 1 ? { ...candidates[0], status: 'tentative' } : null;
    }

    function updateLinks(state, candidates, adopted, input) {
        const updates = [];
        // Co-occurrence alone forms a hypothesis, not confirmed semantic knowledge.
        for (const candidate of candidates) {
            let link = state.knowledge.associations.find(a => a.word === candidate.word
                && a.target === candidate.target && a.speaker === candidate.speaker);
            if (!link) {
                link = { word: candidate.word, target: candidate.target, speaker: candidate.speaker,
                    evidence: [], status: 'candidate' };
                state.knowledge.associations.push(link);
            }
            if (!adopted || candidate.source !== 'explanation') continue;
            const key = JSON.stringify([input.speaker, state.context.scene, candidate.target, candidate.word]);
            if (link.evidence.some(e => e.key === key && !e.retractedBy)) continue;
            link.evidence.push({ key, inputId: input.id, scene: state.context.scene, source: candidate.source });
            link.status = 'situated';
            updates.push({ word: link.word, target: link.target, inputId: input.id });
        }
        return updates;
    }

    function assessTransfer(state) {
        // This first slice learns names for an individual object; it never generalizes
        // a name to an entire species or acquires grammar by counting utterances.
        return state.knowledge.associations.map(link => ({ word: link.word, target: link.target,
            scope: new Set(link.evidence.filter(e => !e.retractedBy).map(e => e.scene)).size >= RULES.transferScenes ? 'same_object_across_scenes' : 'situated',
            relationAcquired: false }));
    }

    function recall(state, understanding) {
        const meanings = Object.values(understanding.known);
        if (!meanings.length) return [];
        return state.records.filter(record => !record.retractedBy
            && record.understandings.some(u => Object.values(u.known).some(id => meanings.includes(id))))
            .slice(-RULES.recallLimit).map(record => record.id);
    }

    function react(understandings) {
        const last = understandings[understandings.length - 1];
        if (last.kind === 'question') return { intent: 'answer_unknown', action: null };
        if (last.kind === 'correction') return { intent: last.complete ? 'acknowledge' : 'uncertain', action: null };
        if (last.kind === 'report' && last.known.meaning === 'sad' && last.polarity === 'positive') {
            return { intent: 'receive_sadness', action: null };
        }
        if (last.complete) return { intent: 'acknowledge', action: null };
        return { intent: 'uncertain', action: null };
    }

    function express(state, reaction, understandings) {
        const hasContent = understandings.some(u => Object.keys(u.known).length || (['naming', 'reference'].includes(u.kind) && u.target?.adopted));
        if (state.settings.speech === 'gesture' || !hasContent) return { channel: 'gesture', message: 'attend' };
        return { channel: 'speech', message: reaction.intent };
    }

    // Resolve an omitted topic against one delivered output, not a search through
    // unrelated memories. Surface forms only propose a reading; knowledge gates it.
    function contextQuestion(state, raw, locale, speaker, catalog) {
        const focus = state.context.lastOutput;
        if (!focus?.topic || focus.serial !== state.serial - 1 || focus.listener !== speaker
            || focus.subject !== 'self') return null;
        const forms = {
            ja: /^(?:ねえ[、,\s]*)?(?:さっきの)?(?:(?:それ|今の話)(?:って|は)(?:どういうこと|何のこと)|(?:つまり[、,\s]*|それは)?(.+?)(?:って(?:どういうこと|何|なに)?|ということ|ってこと|なの|の|ですか|かな))[？?]?$/u,
            en: /^(?:what do you mean by (.+?)|does that mean (.+?)|is it (.+?)|what does that mean)[?.]?$/iu,
            'zh-CN': /^(?:那是什么意思|(.+?)是什么意思|是说(.+?)吗|(.+?)吗)[？?。]?$/u,
            ru: /^(?:что значит (.+?)|то есть (.+?)|это (.+?)|что это значит)[?.]?$/iu,
            'es-ES': /^(?:¿?qué significa eso|¿?qué significa (.+?)|¿?quieres decir (.+?)|¿?es (.+?))[?。.]?$/iu,
            'pt-BR': /^(?:o que significa (.+?)|quer dizer (.+?)|é (.+?)|o que isso significa)[?.]?$/iu,
            de: /^(?:was bedeutet das|was bedeutet (.+?)|heißt das (.+?)|ist es (.+?))[?.]?$/iu
        };
        const match = forms[locale === 'es' ? 'es-ES' : locale]?.exec(normalize(raw))
            || (locale === 'ja' && /^[^？?。！!\n]+[？?]$/u.test(raw) ? [raw, normalize(raw).slice(0, -1)] : null);
        if (!match) return null;
        const token = match.slice(1).find(Boolean);
        const aliases = catalog.contextAliases || {};
        const meaning = token ? lexicalMeaning(token, catalog)
            || Object.keys(aliases).find(id => aliases[id].some(form => normalize(form) === token)) : focus.topic;
        // An unsupported clause must not lose its subject, negation or condition.
        if (!meaning) return null;
        const compatible = meaning === focus.topic || focus.meanings.includes(meaning)
            || (meaning === 'sweet' && focus.topic === 'eat')
            || (meaning === 'work' && focus.topic.startsWith('work:'))
            || (meaning === 'relief' && focus.source.kind === 'observation' && ['eat', 'rest'].includes(focus.topic));
        if (!compatible) return null;
        return { kind: 'question', slot: 'context_detail', subject: 'self', meaning,
            time: focus.eventTime, relations: ['question', ...(focus.eventTime === 'past' ? ['time'] : [])],
            span: raw, catalogRule: 'context_detail', contextReference: clone(focus) };
    }

    function receive(state, raw, catalog, options = {}) {
        if (typeof raw !== 'string' || !raw.trim() || raw.length > 1000) throw new Error('Invalid input');
        const input = { id: `input:${++state.serial}`, raw, locale: options.locale || 'ja',
            speaker: options.speaker || 'player', at: options.at ?? Date.now(), scene: state.context.scene };
        const repeatForms = {
            ja: /^(?:さっきの(?:話|答え)を)?(?:もう一度|もういちど|もう一回)(?:教えて|言って|聞かせて)(?:くれる|ください)?[？?。]?$/u,
            en: /^(?:please )?(?:say|tell me) (?:that|it) again[?.]?$/iu,
            'zh-CN': /^(?:请)?再说一遍[？?。]?$/u,
            ru: /^повтори(?:,? пожалуйста)?[?.]?$/iu,
            es: /^rep[ií]telo(?:,? por favor)?[?.]?$/iu,
            'pt-BR': /^repita(?:,? por favor)?[?.]?$/iu,
            de: /^sag das (?:bitte )?noch einmal[?.]?$/iu
        };
        const previous = state.context.turns.at(-1);
        const repeats = repeatForms[input.locale === 'es-ES' ? 'es' : input.locale]?.test(normalize(raw));
        const delivered = state.context.lastOutput;
        const answer = (!delivered || (delivered.inputId === previous?.id && delivered.deliveryKind === 'speech')) && previous?.answer;
        const followup = contextQuestion(state, raw, input.locale, input.speaker, catalog);
        const interpretations = repeats && answer && previous.speaker === input.speaker
            ? [{ kind: 'question', slot: 'repeat_answer', subject: 'self', relations: ['question'],
                span: raw, catalogRule: 'context_repeat', replyTo: previous.id }]
            : followup ? [followup] : interpret(raw, input.locale, catalog);
        if (!interpretations.length) interpretations.push({ kind: 'unknown', span: raw, relations: [] });
        interpretations.forEach((frame, index) => {
            if (frame.catalogRule === 'rest_explanation' && !state.context.turns.at(-1)?.understandings.some(u => u.known.meaning === 'rest')) {
                interpretations[index] = { kind: 'unknown', span: frame.span, relations: [] };
                return;
            }
            const pendingName = state.context.pendingQuestion;
            const answersBerryName = lexicalMeaning(frame.word, catalog) === 'berry'
                && pendingName?.kind === 'ask_name' && pendingName.speaker === input.speaker
                && state.serial <= pendingName.expires
                && state.context.attention.some(item => item.id === pendingName.target && item.meaning === 'berry');
            const sentenceLikeName = /ない|たい|から|けど|じゃ|です|ます|(?:場所|ところ|こと)(?:は|が)|^(?:そこ|ここ|それ|これ)(?:は|が)|休む|やすむ|疲れ|食べると|回復/u.test(frame.word || '');
            if (frame.shortAnswer && ((!answersBerryName && lexicalMeaning(frame.word, catalog)) || sentenceLikeName)) {
                interpretations[index] = { kind: 'unknown', span: frame.span, relations: [] };
                return;
            }
            if (frame.kind === 'reply') {
                const pending = state.context.pendingQuestion;
                if (!pending || pending.kind !== 'confirm_name' || pending.speaker !== input.speaker || state.serial > pending.expires) {
                    interpretations[index] = { kind: 'unknown', span: frame.span, relations: [] };
                } else {
                    frame.replyTo = clone(pending);
                }
                return;
            }
            if (frame.kind !== 'unknown') return;
            const pending = state.context.pendingQuestion;
            if (pending?.kind === 'ask_name' && pending.speaker === input.speaker && state.serial <= pending.expires
                && state.context.attention.some(item => item.id === pending.target)
                && /^[\p{L}\p{N}ー]{1,16}$/u.test(frame.span) && !lexicalMeaning(frame.span, catalog)) {
                interpretations[index] = { kind: 'naming', target: null, word: frame.span, span: frame.span, relations: ['naming'] };
                return;
            }
            const target = resolveTarget(state, frame.span, input.speaker, catalog);
            if (target.candidates.some(candidate => candidate.source === 'experience')) {
                interpretations[index] = { kind: 'reference', target: frame.span, span: frame.span, relations: [] };
            }
        });
        const understandings = interpretations.map(frame => understand(state, frame, input.speaker, catalog));
        if (followup && interpretations[0] === followup) {
            const u = understandings[0];
            u.contextReference = clone(followup.contextReference);
            for (const id of followup.contextReference.requiredMeanings) {
                if (!understands(state, 'meanings', id) && !u.unresolved.some(item => item.token === id)) {
                    u.unresolved.push({ type: 'meaning', field: 'context', token: id });
                }
            }
            u.complete = u.unresolved.length === 0;
        }
        if (interpretations[0]?.catalogRule === 'context_repeat') {
            understandings[0].answerReference = { turnId: previous.id, subject: answer.subject,
                eventTime: answer.eventTime, source: answer.source };
        }
        understandings.forEach((u, index) => {
            const frame = interpretations[index];
            if (frame.kind !== 'reply' || u.kind !== 'reply') return;
            u.answer = frame.answer; u.replyTo = frame.replyTo;
            const link = state.knowledge.associations.find(a => a.word === frame.replyTo.word
                && a.target === frame.replyTo.target && a.speaker === input.speaker);
            if (link && frame.answer === 'no') {
                link.evidence = link.evidence.map(e => e.inputId === frame.replyTo.inputId ? { ...e, retractedBy: input.id } : e);
                if (!link.evidence.some(e => !e.retractedBy)) link.status = 'candidate';
                const record = state.records.find(r => r.id === frame.replyTo.inputId);
                if (record) record.retractedBy = input.id;
            }
            // A conversational confirmation is not a new independent encounter.
            if (link && frame.answer === 'yes') link.confirmedBy = input.id;
            state.context.pendingQuestion = null;
        });
        const learning = interpretations.map((frame, index) => {
            const candidates = formCandidates(state, frame, understandings[index], input, catalog);
            const adopted = adoptCandidate(candidates);
            const updated = updateLinks(state, candidates, adopted, input);
            return { candidates, adopted, updated };
        });
        const recalled = [...new Set(understandings.flatMap(u => recall(state, u)))].slice(-RULES.recallLimit);
        // Retraction applies only to the latest understood naming explanation, never
        // to all past knowledge. A missing or ambiguous antecedent remains unresolved.
        understandings.forEach((u, index) => {
            if (u.kind !== 'correction') return;
            const previous = state.context.turns.at(-1);
            const record = previous && state.records.find(r => r.id === previous.id && r.speaker === input.speaker
                && !r.retractedBy && r.understandings.length === 1 && r.understandings[0].kind === 'naming');
            if (!record) {
                u.unresolved.push({ type: 'correction_target' });
                u.complete = false;
                return;
            }
            record.retractedBy = input.id;
            state.knowledge.associations.forEach(link => {
                link.evidence = link.evidence.map(e => e.inputId === record.id ? { ...e, retractedBy: input.id } : e);
                if (!link.evidence.some(e => !e.retractedBy)) link.status = 'candidate';
            });
            u.corrects = record.id;
            learning[index].retraction = record.id;
        });
        const transfer = assessTransfer(state);
        const reaction = react(understandings);
        const expression = express(state, reaction, understandings);
        // Only meaningful changes and understood reports are selected as records.
        const selected = learning.some(l => l.updated.length || l.retraction)
            || understandings.some(u => u.kind === 'report' && Object.keys(u.known).length > 0);
        if (selected) state.records.push({ id: input.id, speaker: input.speaker, heardAt: input.at,
            understandings: clone(understandings), source: 'speaker_report' });
        const turn = { id: input.id, speaker: input.speaker, understandings: clone(understandings), expression: clone(expression) };
        state.context.turns.push(turn);
        state.context.turns = state.context.turns.slice(-RULES.contextLimit);
        return { input, interpretations, understandings, learning, transfer, recalled, reaction, expression };
    }

    return Object.freeze({ RULES, create, perceive, interpret, receive, formCandidates,
        adoptCandidate, updateLinks, assessTransfer });
});
