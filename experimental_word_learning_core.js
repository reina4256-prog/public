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

    // Domain adapters describe an explicit label paired with a completed experience.
    // Neither parser recognition nor selecting a candidate supplies that evidence.
    function experienceCandidates(state, experienceId, rules) {
        const events = (state.experiences || []).filter(event => event.id === experienceId);
        if (events.length !== 1) return [];
        const event = events[0];
        if (!Number.isInteger(event.id) || !Number.isFinite(event.start)
            || !Number.isFinite(event.end) || event.end < event.start) return [];
        return rules.filter(rule => rule.resolve ? !!rule.resolve(event) : rule.demonstration && event.kind === 'experience'
            && event.activity === rule.activity && event.demonstration === rule.demonstration
            && event.result === rule.result && event.master === rule.master)
            .map(rule => ({ id: rule.id, source: rule.source, experienceId,
                master: event.master, demonstration: event.demonstration,
                scope: { subject: 'self', activity: event.activity, ...(event.result !== undefined ? { result: event.result } : {}),
                    ...(event.master ? { master: event.master } : {}), ...(rule.resolve ? rule.resolve(event) : {}) } }));
    }

    function learnExperience(state, experienceId, rules) {
        const candidates = experienceCandidates(state, experienceId, rules);
        // Conflicting mappings are retained as candidates, never decided by order.
        const adopted = candidates.filter(candidate => candidates.filter(item => item.id === candidate.id).length === 1);
        const updated = [];
        for (const candidate of adopted) {
            let meaning = state.knowledge.meanings.find(item => item.id === candidate.id);
            if (meaning && meaning.source !== candidate.source) continue;
            if (!meaning) {
                meaning = { id: candidate.id, source: candidate.source, evidence: [] };
                state.knowledge.meanings.push(meaning);
            }
            if (meaning.evidence.some(item => item.experienceId === experienceId)) continue;
            const { id, source, ...evidence } = candidate;
            meaning.evidence.push(clone(evidence));
            updated.push({ id, experienceId });
        }
        return { candidates, adopted, updated, relationAcquired: false };
    }

    function validExperienceLearning(state, rules) {
        const sources = new Set(rules.map(rule => rule.source));
        return state.knowledge.meanings.filter(item => sources.has(item.source)).every(meaning =>
            Array.isArray(meaning.evidence) && meaning.evidence.length > 0
            && new Set(meaning.evidence.map(item => item?.experienceId)).size === meaning.evidence.length
            && meaning.evidence.every(evidence => evidence && experienceCandidates(state, evidence.experienceId, rules)
                .some(candidate => candidate.id === meaning.id && candidate.source === meaning.source
                    && candidate.master === evidence.master && candidate.demonstration === evidence.demonstration
                    // Older demonstrated-work saves have no scope; do not invent one on load.
                    && ((evidence.scope === undefined && !rules.some(rule => rule.id === candidate.id
                        && rule.source === candidate.source && rule.requireScope)) || evidence.scope
                        && Object.keys(evidence.scope).length === Object.keys(candidate.scope).length
                        && Object.entries(candidate.scope).every(([key, value]) => evidence.scope[key] === value)))));
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

    function feelingReport(part, question, locale) {
        if (locale !== 'ja' || question) return null;
        const event = /^(?:(?:私は|わたしは)[、,\s]*)?(今日|昨日|さっき)(?:は)?(?<detail>[^、,。！？!?はが]+?)で(?<event>失敗した|うまくいかなかった|成功した|うまくいった)(?:んだ|よ|んだよ)?$/u.exec(normalize(part));
        if (event) return { kind: 'report', aspect: 'external_event', meaning: /失敗|いかなかった/u.test(event.groups.event) ? 'failure' : 'success',
            detail: event.groups.detail, time: { 今日: 'past_today', 昨日: 'yesterday', さっき: 'past' }[event[1]],
            relations: ['report', 'time'], catalogRule: 'external_event_report' };
        const match = /^(?:(?:私は|わたしは)[、,\s]*)?(?:(今日|昨日|今|さっき)(?:は)?[、,\s]*)?(?:(?<detail>[^、,。！？!?はが]+?)で(?<event>失敗して|うまくいかなくて|成功して|うまくいって))?(?<feeling>悲しかった|うれしかった|嬉しかった|つらかった|疲れていた|悲しい|うれしい|嬉しい|つらい|疲れた|疲れている)(?:んだ|です|よ|んだよ)?$/u.exec(normalize(part));
        if (!match) return null;
        const meanings = { 悲しかった: 'sad', 悲しい: 'sad', うれしかった: 'happy', 嬉しかった: 'happy',
            うれしい: 'happy', 嬉しい: 'happy', つらかった: 'painful', つらい: 'painful',
            疲れた: 'tired', 疲れていた: 'tired', 疲れている: 'tired' };
        const past = /かった|ていた/u.test(match.groups.feeling);
        const time = { 今日: past ? 'past_today' : 'today', 昨日: 'yesterday', 今: 'now', さっき: 'past' }[match[1]] || (past ? 'past' : 'unspecified');
        return { kind: 'report', aspect: 'feeling', meaning: meanings[match.groups.feeling], time,
            ...(match.groups.event ? { eventMeaning: /失敗|いかなく/u.test(match.groups.event) ? 'failure' : 'success', detail: match.groups.detail } : {}),
            relations: ['report', ...(time !== 'unspecified' ? ['time'] : []), ...(match.groups.event ? ['reason'] : [])],
            catalogRule: 'feeling_report' };
    }

    // A displayed dialogue example is not a question addressed to the child or
    // a report by the player. The two quoted roles stay inside one input.
    function questionDemonstration(text, locale, catalog) {
        const quoted = '(?:「([^」\\n]+)」|"([^"\\n]+)"|“([^”\\n]+)”)';
        const match = new RegExp(`^${quoted}\\s*→\\s*${quoted}$`, 'u').exec(text.trim());
        if (!match) return null;
        const question = match.slice(1, 4).find(Boolean), answer = match.slice(4, 7).find(Boolean);
        if (question.includes('→')) return null;
        const frames = interpret(question, locale, catalog), frame = frames[0];
        if (frames.length !== 1 || frame.kind !== 'question' || frame.slot !== 'current_activity'
            || frame.meaning || frame.time || frame.relations.length !== 1 || frame.relations[0] !== 'question') return null;
        return { kind: 'question_demonstration', question, answer, form: normalize(frame.span),
            meaning: answer, slot: frame.slot, relations: ['question'], span: text };
    }

    function proposalFrame(text, locale, catalog) {
        const forms = catalog.proposalTeaching?.[locale];
        if (!forms) return null;
        for (const relation of ['request', 'invitation']) {
            const { marker, utterance } = forms[relation];
            const demo = text.trim() === `${marker}「${utterance}」`;
            if (!demo && normalize(text) !== normalize(utterance)) continue;
            const roles = { proposer: 'player', addressee: 'self',
                actors: relation === 'request' ? ['self'] : ['player', 'self'],
                status: 'proposed', actualParticipation: false };
            return { kind: demo ? 'proposal_demonstration' : relation, proposalKind: relation,
                meaning: 'rest', relations: [relation], subject: 'self', roles,
                form: normalize(utterance), utterance, span: text };
        }
        return null;
    }

    function reportFrame(text, locale, catalog) {
        const forms = catalog.reportTeaching?.[locale];
        if (!forms) return null;
        const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
        for (const subject of ['self', 'player']) {
            const { marker, utterance } = forms[subject];
            const demo = text.trim() === `${marker}「${utterance}」`;
            if (!demo && key(text) !== key(utterance)) continue;
            return { kind: demo ? 'report_demonstration' : 'report', subject,
                meaning: 'rest', aspect: 'activity_report', relations: ['report'],
                roles: { reporter: 'player', contentSubject: subject, status: 'reported', verified: false },
                form: key(utterance), utterance, span: text };
        }
        return null;
    }

    function negationFrame(text, locale, catalog) {
        const forms = catalog.negationTeaching?.[locale];
        if (!forms) return null;
        const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
        const positive = catalog.reportTeaching[locale].self;
        for (const polarity of ['positive', 'negative']) {
            const item = forms[polarity], utterance = polarity === 'positive' ? positive.utterance : item.utterance;
            const demo = text.trim() === `${item.marker}「${utterance}」`;
            if (!demo && (polarity === 'positive' || key(text) !== key(utterance))) continue;
            return { kind: demo ? 'negation_demonstration' : 'report', subject: 'self', meaning: 'rest',
                aspect: 'activity_report', relations: ['report', 'negation'], polarity,
                roles: { reporter: 'player', contentSubject: 'self', status: 'reported', verified: false },
                reportForm: key(positive.utterance), form: key(utterance), utterance, span: text };
        }
        return null;
    }

    function timeFrame(text, locale, catalog) {
        const forms = catalog.timeTeaching?.[locale];
        if (!forms) return null;
        const key = value => value.normalize('NFKC').trim().toLocaleLowerCase();
        for (const time of ['now', 'past']) for (const subject of ['self', 'player']) for (const polarity of ['positive', 'negative']) {
            const item = forms[time];
            const utterance = item[subject === 'self' ? polarity === 'positive' ? 'utterance' : 'negative'
                : polarity === 'positive' ? 'player' : 'playerNegative'];
            const demo = subject === 'self' && polarity === 'positive' && text.trim() === `${item.marker}「${utterance}」`;
            if (!demo && key(text) !== key(utterance)) continue;
            return { kind: demo ? 'time_demonstration' : 'report', subject, meaning: 'rest', time, polarity,
                aspect: 'activity_report', relations: ['report', 'time', ...(polarity === 'negative' ? ['negation'] : [])],
                roles: { reporter: 'player', contentSubject: subject, status: 'reported', verified: false },
                reportForm: key(catalog.reportTeaching[locale][subject].utterance),
                form: key(utterance), utterance, span: text };
        }
        return null;
    }

    function conditionFrame(text, locale, catalog) {
        const item = catalog.conditionTeaching?.[locale];
        if (!item) return null;
        const status = ['met', 'unmet'].find(id => text.trim() === `${item[id]}「${item.utterance}」`);
        if (!status && normalize(text) !== normalize(item.utterance)) return null;
        const proposal = proposalFrame(catalog.proposalTeaching[locale].request.utterance, locale, catalog);
        return { kind: status ? 'condition_demonstration' : 'conditional_proposal', subject: 'self',
            meaning: 'rest', conditionMeaning: 'tired', relations: ['request', 'condition'],
            proposalKind: 'request', proposalForm: proposal.form, roles: proposal.roles,
            conditionSubject: 'self', application: 'when_met', duration: 'unspecified',
            ...(status ? { demonstratedStatus: status } : {}), form: normalize(item.utterance),
            utterance: item.utterance, span: text };
    }

    function sequenceFrame(text, locale, catalog) {
        const item = catalog.sequenceTeaching?.[locale];
        if (!item) return null;
        const phase = ['before', 'after'].find(id => text.trim() === `${item[id]}「${item.utterance}」`);
        if (!phase && normalize(text) !== normalize(item.utterance)) return null;
        const proposal = proposalFrame(catalog.proposalTeaching[locale].request.utterance, locale, catalog);
        return { kind: phase ? 'sequence_demonstration' : 'sequential_proposal', subject: 'self',
            meaning: 'rest', eventMeaning: 'eat', relations: ['request', 'sequence'],
            proposalKind: 'request', proposalForm: proposal.form, roles: proposal.roles,
            eventSubject: 'self', application: 'after_completion',
            ...(phase ? { phase } : {}), form: normalize(item.utterance), utterance: item.utterance, span: text };
    }

    function reasonFrame(text, locale, catalog) {
        const item = catalog.reasonTeaching?.[locale];
        if (!item) return null;
        const form = normalize(item.utterance);
        if (normalize(text) === form) return { kind: 'question', slot: 'reason', meaning: 'rest',
            subject: 'self', form, relations: ['question', 'reason'], span: text };
        for (const stage of ['question', 'reason']) for (const choice of ['request', 'invitation']) {
            const proposal = catalog.proposalTeaching[locale][choice].utterance;
            if (text.trim() !== `${item[stage]}「${item.utterance}」→「${proposal}」`) continue;
            return { kind: 'reason_demonstration', stage, slot: 'reason', meaning: 'rest', subject: 'self',
                form, question: item.utterance, answer: proposal, choice,
                relations: stage === 'question' ? ['question'] : ['question', 'reason'], span: text };
        }
        return null;
    }

    function feelingContrast(text, locale, catalog) {
        const item = catalog.feelingContrast?.[locale];
        if (!item || normalize(text) !== normalize(item.past + item.join + item.present)) return null;
        return [item.past, item.present].map((span, index) => ({ kind: 'report', aspect: 'feeling',
            meaning: index === 0 ? 'sad' : 'happy', time: index === 0 ? 'yesterday' : 'now',
            relations: ['report', 'time', 'contrast'], span, catalogRule: 'feeling_contrast' }));
    }

    function feelingTeaching(text, locale, catalog) {
        const forms = catalog.feelingTeaching?.[locale], pair = catalog.feelingContrast?.[locale];
        if (!forms || !pair) return null;
        for (const stage of ['source', 'sad', 'happy', 'report', 'yesterday', 'now']) {
            const prefix = forms[stage] + '«';
            if (!text.startsWith(prefix) || !text.endsWith('»')) continue;
            const utterance = text.slice(prefix.length, -1);
            const full = pair.past + pair.join + pair.present;
            const index = utterance === pair.past ? 0 : utterance === pair.present ? 1 : -1;
            if (stage === 'source' ? utterance !== full : index < 0
                || ['sad', 'yesterday'].includes(stage) && index !== 0
                || ['happy', 'now'].includes(stage) && index !== 1) return null;
            return { kind: 'feeling_teaching', stage, index, utterance, span: text, relations: [] };
        }
        return null;
    }
    function feelingBasis(state) {
        return { meanings: state.knowledge.meanings.filter(m => m.source === 'initial' && ['sad', 'happy'].includes(m.id)).map(clone).sort((a, b) => a.id.localeCompare(b.id)),
            relations: state.knowledge.relations.filter(r => r.source === 'initial' && ['report', 'time', 'contrast'].includes(r.id)).map(clone).sort((a, b) => a.id.localeCompare(b.id)),
            taught: clone(state.feelingLearning?.knowledge || []) };
    }
    function feelingApplies(entry, type, id, frame, speaker, locale) {
        return entry.type === type && entry.id === id && frame.kind === 'report' && frame.aspect === 'feeling'
            && ['feeling_contrast', 'feeling_single'].includes(frame.catalogRule)
            && entry.scope.locale === locale && entry.scope.speaker === speaker
            && entry.scope.form === normalize(frame.span) && entry.scope.meaning === frame.meaning
            && entry.scope.time === frame.time;
    }

    function interpret(text, locale, catalog) {
        const teaching = feelingTeaching(text, locale, catalog);
        if (teaching) return [teaching];
        const feelings = feelingContrast(text, locale, catalog);
        if (feelings) return feelings;
        const pair = catalog.feelingContrast?.[locale];
        if (pair) {
            const frames = feelingContrast(pair.past + pair.join + pair.present, locale, catalog);
            const single = frames.find(f => normalize(f.span) === normalize(text));
            if (single) return [{ ...single, relations: ['report', 'time'], catalogRule: 'feeling_single' }];
        }
        const reason = reasonFrame(text, locale, catalog);
        if (reason) return [reason];
        const sequential = sequenceFrame(text, locale, catalog);
        if (sequential) return [sequential];
        const conditional = conditionFrame(text, locale, catalog);
        if (conditional) return [conditional];
        const temporal = timeFrame(text, locale, catalog);
        if (temporal) return [temporal];
        const negation = negationFrame(text, locale, catalog);
        if (negation) return [negation];
        const report = reportFrame(text, locale, catalog);
        if (report) return [report];
        const proposal = proposalFrame(text, locale, catalog);
        if (proposal) return [proposal];
        if (text.includes('【') || text.includes('】')) return [{ kind: 'unknown', span: text, relations: [] }];
        if (text.includes('→')) return [questionDemonstration(text, locale, catalog)
            || { kind: 'unknown', span: text, relations: [] }];
        // Raw input is kept separately. Only the parser uses normalized text.
        const contrast = locale === 'ja' && /^(.+?)(?:けど|けれど)[、,\s]*(.+?)[。]?$/u.exec(text.trim());
        if (contrast && feelingReport(contrast[1], false, locale) && feelingReport(contrast[2], false, locale)) {
            return contrast.slice(1).map(part => { const frame = feelingReport(part, false, locale);
                return { ...frame, span: part, relations: [...frame.relations, 'contrast'] }; });
        }
        const parts = text.match(/[^。！？!?\n]+[！？!?]?/gu) || [];
        return parts.map(rawPart => {
            const question = /[?？]$/u.test(rawPart.trim());
            const part = rawPart.trim().replace(/[！？!?]$/u, '').trim();
            const feeling = feelingReport(part, question, locale);
            if (feeling) return { ...feeling, span: part };
            if (question && feelingReport(part, false, locale)) return { kind: 'unknown', span: rawPart.trim(), relations: [] };
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

    // A definition is heard evidence about a word, not a new sensory experience.
    // Its scope is evidence of use here; it makes no claim about everyone else.
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

    function wordScope(state, entry, speaker) {
        const attention = state.context.attention;
        if (entry.speaker !== speaker) return false;
        if (entry.scope.targets.length && attention.length) {
            return entry.scope.targets.some(id => attention.some(item => item.id === id));
        }
        return entry.scope.scene === state.context.scene;
    }

    function correctionFrame(raw, locale, catalog) {
        const marks = catalog.correctionTeaching?.[locale];
        if (!marks) return null;
        for (const phase of ['source', 'replacement']) {
            const prefix = `${marks[phase]}«`;
            if (!raw.startsWith(prefix) || !raw.endsWith('»')) continue;
            const utterance = raw.slice(prefix.length, -1), content = wordFrame(utterance, locale);
            if (!content || content.kind !== (phase === 'source' ? 'word_explanation' : 'word_correction')
                || content.oldMeaning) return null;
            return { ...content, kind: 'correction_demonstration', phase, utterance,
                relations: ['naming'], span: raw, catalogRule: 'correction_teaching' };
        }
        return null;
    }

    function wordApplication(state, word, speaker) {
        const candidates = (state.knowledge.wordExplanations || []).filter(entry => !entry.retractedBy
            && normalize(entry.word) === normalize(word) && wordScope(state, entry, speaker));
        const meanings = [...new Set(candidates.map(entry => entry.meaning))];
        const individualConflict = candidates.length && state.knowledge.associations.some(link =>
            normalize(link.word) === normalize(word) && link.speaker === speaker && link.evidence.some(e => !e.retractedBy
                && wordScope(state, { speaker: link.speaker, scope: { scene: e.scene, targets: [link.target] } }, speaker)));
        return { candidates: candidates.map(entry => ({ meaning: entry.meaning, inputId: entry.inputId,
            scope: clone(entry.scope) })), adopted: meanings.length === 1 && !individualConflict ? meanings[0] : null,
            ...(individualConflict ? { unresolvedIndividual: true } : {}),
            updated: [], relationAcquired: false };
    }

    function wordUseFrame(raw, locale) {
        // Quoted custom action names reuse the known invitation relation. Other
        // subjects, clauses, conditions and negation must not be stripped away.
        const forms = {
            ja: /^[「"]([^」"\n]+)[」"](?:を)?しよう[。]?$/u,
            en: /^let's "([^"\n]+)"[.]?$/iu,
            'zh-CN': /^一起[“"]([^”"\n]+)[”"]吧[。]?$/u,
            ru: /^давай "([^"\n]+)"[.]?$/iu,
            'es-ES': /^vamos a "([^"\n]+)"[.]?$/iu,
            'pt-BR': /^vamos "([^"\n]+)"[.]?$/iu,
            de: /^lass uns "([^"\n]+)"[.]?$/iu
        };
        const match = forms[locale]?.exec(raw.trim());
        return match ? { kind: 'invitation', meaning: match[1], relations: ['invitation'],
            span: raw, catalogRule: 'word_use' } : null;
    }

    function updateWordExplanation(state, frame, u, input, catalog) {
        const output = { candidates: [], adopted: null, updated: [], relationAcquired: false };
        if (!['word_explanation', 'word_correction'].includes(frame.kind)) return output;
        // Definitions cannot replace built-in words or silently introduce unknown concepts.
        const allowed = ['berry', 'food', 'eat', 'sweet', 'hungry', 'rest', 'sleep', 'tired',
            ...Object.keys(catalog.experienceMeanings || {})];
        if (lexicalMeaning(frame.word, catalog) || !allowed.includes(u.known.meaning)) {
            u.unresolved.push({ type: 'word_definition' }); u.complete = false;
        }
        if (!u.complete) return output;
        const entries = state.knowledge.wordExplanations || [];
        const scope = { scene: state.context.scene, targets: state.context.attention.map(item => item.id) };
        let old = null;
        if (frame.kind === 'word_correction') {
            const matches = entries.filter(entry => !entry.retractedBy && normalize(entry.word) === normalize(frame.word)
                && wordScope(state, entry, input.speaker)
                && (!frame.oldMeaning || entry.meaning === lexicalMeaning(frame.oldMeaning, catalog)));
            // Individual names remain individual. An explicit correction may refer
            // to that explanation, but never turns its object into a whole species.
            for (const link of state.knowledge.associations) {
                if (normalize(link.word) !== normalize(frame.word) || link.speaker !== input.speaker) continue;
                for (const evidence of link.evidence) {
                    const record = state.records.find(r => r.id === evidence.inputId);
                    if (evidence.retractedBy || record?.retractedBy || !record?.understandings[0]?.complete
                        || !wordScope(state, { speaker: link.speaker,
                            scope: { scene: evidence.scene, targets: [link.target] } }, input.speaker)) continue;
                    const oldMeaning = link.target.startsWith('berry:') ? 'berry' : null;
                    if (frame.oldMeaning && lexicalMeaning(frame.oldMeaning, catalog) !== oldMeaning) continue;
                    matches.push({ inputId: evidence.inputId, link, evidence, record });
                }
            }
            if (matches.length !== 1) {
                u.unresolved.push({ type: 'correction_target' }); u.complete = false; return output;
            }
            old = matches[0];
            const learned = u.relationReferences?.find(r => r.id === 'correction');
            if (learned && (old.inputId !== learned.scope.original || old.input?.locale !== input.locale)) {
                u.unresolved.push({ type: 'correction_target' }); u.complete = false; return output;
            }
            if (old.meaning === u.known.meaning) {
                u.unresolved.push({ type: 'correction_unchanged' }); u.complete = false; return output;
            }
        }
        output.candidates = [{ word: frame.word, meaning: u.known.meaning, scope: clone(scope) }];
        output.adopted = { ...output.candidates[0], status: 'tentative' };
        if (!old && entries.some(entry => !entry.retractedBy && normalize(entry.word) === normalize(frame.word)
            && entry.meaning === u.known.meaning && entry.speaker === input.speaker
            && JSON.stringify(entry.scope) === JSON.stringify(scope))) return output;
        const entry = { inputId: input.id, heardAt: input.at, input: clone(input), word: frame.word, explainedAs: frame.meaning, meaning: u.known.meaning,
            speaker: input.speaker, scope, basis: clone(state.knowledge.meanings.find(m => m.id === u.known.meaning)) };
        if (old) {
            if (old.evidence) {
                old.evidence.retractedBy = input.id; old.record.retractedBy = input.id;
                if (!old.link.evidence.some(e => !e.retractedBy)) old.link.status = 'candidate';
            } else old.retractedBy = input.id;
            entry.corrects = old.inputId; u.corrects = old.inputId;
            output.retraction = old.inputId;
        }
        state.knowledge.wordExplanations ||= [];
        state.knowledge.wordExplanations.push(entry);
        output.updated.push({ inputId: input.id, meaning: entry.meaning });
        return output;
    }

    function validWordLearning(state, catalog) {
        const entries = state.knowledge.wordExplanations;
        if (entries === undefined) return true; // Old saves are not retroactively taught.
        if (!Array.isArray(entries) || new Set(entries.map(e => e?.inputId)).size !== entries.length) return false;
        return entries.every(entry => {
            if (!entry || typeof entry.word !== 'string' || !entry.word.trim() || typeof entry.explainedAs !== 'string' || typeof entry.speaker !== 'string'
                || !/^input:[1-9]\d*$/.test(entry.inputId) || !Number.isFinite(entry.heardAt) || typeof entry.scope?.scene !== 'string'
                || !Array.isArray(entry.scope.targets) || !entry.scope.targets.every(id => typeof id === 'string')
                || entry.basis?.id !== entry.meaning) return false;
            const current = state.knowledge.meanings.find(m => m.id === entry.meaning);
            if (!current || current.source !== entry.basis.source) return false;
            if (current.evidence && !Array.isArray(entry.basis.evidence)) return false;
            if (entry.basis.evidence && (!Array.isArray(entry.basis.evidence) || !entry.basis.evidence.length
                || !entry.basis.evidence.every(e => current.evidence?.some(original => JSON.stringify(e) === JSON.stringify(original))))) return false;
            const records = state.records.filter(r => r.id === entry.inputId);
            const u = records[0]?.understandings[0];
            if (records.length !== 1 || records[0].understandings.length !== 1
                || records[0].speaker !== entry.speaker || records[0].heardAt !== entry.heardAt
                || !u?.complete || !['word_explanation', 'word_correction'].includes(u.kind)
                || u.corrects !== entry.corrects
                || u.subject !== entry.speaker || !u.relations?.includes('naming')
                || (entry.corrects && (u.kind !== 'word_correction' || !u.relations.includes('correction')))
                || u.known.meaning !== entry.meaning || JSON.stringify(u.wordExplanation) !== JSON.stringify({
                    word: entry.word, explainedAs: entry.explainedAs, scope: entry.scope, basis: entry.basis,
                    ...(entry.input ? { input: entry.input } : {}) })) return false;
            // Legacy explanations have no retained raw input. Validate them as
            // before, but never invent a language or an original utterance.
            if (entry.input !== undefined) {
                const input = entry.input;
                if (!input || input.id !== entry.inputId || input.at !== entry.heardAt
                    || input.speaker !== entry.speaker || input.scene !== entry.scope.scene || typeof input.raw !== 'string'
                    || !['ja', 'en', 'zh-CN', 'ru', 'es-ES', 'pt-BR', 'de'].includes(input.locale)) return false;
                const frame = wordFrame(input.raw, input.locale);
                if (!frame || frame.word !== entry.word || frame.meaning !== entry.explainedAs
                    || frame.kind !== u.kind || (catalog && lexicalMeaning(frame.meaning, catalog) !== entry.meaning)) return false;
            }
            if (entry.corrects) {
                const old = entries.find(e => e.inputId === entry.corrects);
                if (!state.settings.foundation) {
                    const ref = u.relationReferences?.find(r => r.id === 'correction');
                    if (!ref || !state.knowledge.relations.some(r => JSON.stringify(r) === JSON.stringify(ref))
                        || ref.scope.original !== entry.corrects || !entry.input
                        || !ref.evidence.every(id => Number(id.slice(6)) < Number(entry.inputId.slice(6)))) return false;
                    const prior = clone(state);
                    prior.context.scene = entry.scope.scene;
                    prior.context.attention = entry.scope.targets.map(id => ({ id }));
                    prior.knowledge.relations = [ref];
                    if (catalog && !understand(prior, wordFrame(entry.input.raw, entry.input.locale),
                        entry.speaker, catalog, entry.input.locale).relations.includes('correction')) return false;
                }
                const oldLinks = state.knowledge.associations.filter(link => link.speaker === entry.speaker
                    && normalize(link.word) === normalize(entry.word)
                    && link.evidence.some(e => e.inputId === entry.corrects && e.retractedBy === entry.inputId));
                const oldRecord = state.records.find(r => r.id === entry.corrects);
                if (old ? old.retractedBy !== entry.inputId || old.speaker !== entry.speaker
                    || normalize(old.word) !== normalize(entry.word)
                    : oldLinks.length !== 1 || oldRecord?.retractedBy !== entry.inputId) return false;
                if (u.corrects !== entry.corrects
                    || Number(entry.corrects.split(':')[1]) >= Number(entry.inputId.split(':')[1])) return false;
            }
            if (entry.retractedBy && !entries.some(e => e.inputId === entry.retractedBy && e.corrects === entry.inputId)) return false;
            return true;
        });
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

    function understand(state, frame, speaker, catalog, locale) {
        if (frame.kind === 'feeling_teaching') return { kind: 'partial', known: {}, target: null,
            relations: [], unresolved: [{ type: 'teaching_operation' }], complete: false,
            subject: null, polarity: 'positive', eventTime: 'unspecified', aspect: null,
            conditionStatus: null, questionSlot: null };
        const unresolved = [];
        const required = [...(frame.relations || [])];
        const applies = entry => entry.scope?.kind === (entry.id === 'naming' && ['word_correction', 'correction_demonstration'].includes(frame.kind)
            ? 'word_explanation' : frame.kind === 'reason_demonstration' ? 'question' : ['sequence_demonstration', 'sequential_proposal'].includes(frame.kind)
            ? entry.id === 'request' ? 'request' : 'sequential_proposal' : ['condition_demonstration', 'conditional_proposal'].includes(frame.kind)
            ? entry.id === 'request' ? 'request' : 'conditional_proposal' : frame.kind === 'question_demonstration' ? 'question'
            : frame.kind === 'proposal_demonstration' ? frame.proposalKind
            : ['report_demonstration', 'negation_demonstration', 'time_demonstration'].includes(frame.kind) ? 'report' : frame.kind) && entry.scope.locale === locale
            && entry.scope.speaker === speaker && (entry.id === 'correction'
                ? !frame.oldMeaning && entry.scope.form === normalize(frame.span)
                    && entry.scope.word === normalize(frame.word) && entry.scope.meaning === lexicalMeaning(frame.meaning, catalog)
                    && entry.scope.scene === state.context.scene
                    && JSON.stringify(entry.scope.targets) === JSON.stringify(state.context.attention.map(a => a.id))
                : entry.id === 'question'
                ? entry.scope.slot === frame.slot && entry.scope.form === (frame.form || normalize(frame.span))
                : entry.id === 'reason'
                    ? frame.slot === 'reason' && entry.scope.slot === 'reason' && entry.scope.meaning === 'rest'
                        && entry.scope.form === frame.form && frame.meaning === 'rest'
                : entry.id === 'sequence'
                    ? entry.scope.form === frame.form && entry.scope.proposalForm === frame.proposalForm
                        && entry.scope.eventMeaning === frame.eventMeaning && entry.scope.meaning === frame.meaning
                        && entry.scope.eventSubject === frame.eventSubject && entry.scope.application === frame.application
                        && JSON.stringify(entry.scope.roles) === JSON.stringify(frame.roles)
                : entry.id === 'condition'
                    ? entry.scope.form === frame.form && entry.scope.proposalForm === frame.proposalForm
                        && entry.scope.conditionMeaning === frame.conditionMeaning && entry.scope.meaning === frame.meaning
                        && entry.scope.conditionSubject === frame.conditionSubject && entry.scope.application === frame.application
                        && entry.scope.duration === frame.duration && JSON.stringify(entry.scope.roles) === JSON.stringify(frame.roles)
                : entry.id === 'time'
                    ? entry.scope.form === frame.form && entry.scope.eventTime === frame.time
                        && entry.scope.polarity === frame.polarity && entry.scope.reportForm === frame.reportForm
                        && frame.meaning === 'rest' && JSON.stringify(entry.scope.roles) === JSON.stringify(frame.roles)
                : entry.id === 'negation'
                    ? entry.scope.form === frame.form && entry.scope.polarity === frame.polarity
                        && entry.scope.reportForm === frame.reportForm && frame.meaning === 'rest'
                        && JSON.stringify(entry.scope.roles) === JSON.stringify(frame.roles)
                : ['request', 'invitation', 'report'].includes(entry.id)
                    ? entry.scope.form === (entry.id === 'report' ? frame.reportForm || frame.form : frame.proposalForm || frame.form) && frame.meaning === 'rest'
                        && JSON.stringify(entry.scope.roles) === JSON.stringify(frame.roles)
                    : entry.scope.meanings?.includes(lexicalMeaning(frame.meaning, catalog)));
        const taught = state.feelingLearning?.knowledge || [];
        const missingRelations = required.filter(id => !state.knowledge.relations.some(entry => entry.id === id
            && (entry.source !== 'experienced_relation' || applies(entry)))
            && !taught.some(e => feelingApplies(e, 'relation', id, frame, speaker, locale)));
        unresolved.push(...missingRelations.map(id => ({ type: 'relation', id })));
        const known = {}, applications = [];
        for (const field of ['meaning', 'conditionMeaning', 'eventMeaning', 'oldMeaning']) {
            if (!frame[field]) continue;
            const id = Object.hasOwn(catalog.meanings, frame[field]) || Object.hasOwn(catalog.experienceMeanings || {}, frame[field])
                ? frame[field] : lexicalMeaning(frame[field], catalog);
            const application = !id && !['word_explanation', 'word_correction'].includes(frame.kind)
                ? wordApplication(state, frame[field], speaker) : null;
            if (id && (understands(state, 'meanings', id)
                || field === 'meaning' && taught.some(e => feelingApplies(e, 'meaning', id, frame, speaker, locale)))) known[field] = id;
            else if (application?.adopted) { known[field] = application.adopted; applications.push({ field, ...application }); }
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
        // An unknown connection does not erase an understood report's subject.
        // The whole clause remains partial until that connection is understood.
        const reportReady = frame.kind === 'report' && (required.includes('contrast') || frame.catalogRule === 'feeling_single')
            && !missingRelations.includes('report');
        const result = {
            kind: relationReady ? frame.kind : 'partial', known, target, ...(applications.length ? { applications } : {}),
            relations: required.filter(id => !missingRelations.includes(id)), unresolved,
            complete: unresolved.length === 0,
            // Scope is only attached when the corresponding relation is understood.
            subject: relationReady || reportReady ? (frame.subject || (frame.kind === 'question' ? 'self' : speaker)) : null,
            polarity: required.includes('negation') && missingRelations.includes('negation') ? 'unknown' : (frame.polarity || 'positive'),
            eventTime: frame.time && required.includes('time') && !missingRelations.includes('time') ? frame.time : 'unspecified',
            aspect: relationReady || reportReady ? (frame.aspect || null) : null,
            conditionStatus: frame.conditionMeaning ? 'unknown' : null,
            questionSlot: relationReady && frame.kind === 'question' ? frame.slot : null
        };
        const relationReferences = state.knowledge.relations.filter(entry => entry.source === 'experienced_relation'
            && required.includes(entry.id) && !missingRelations.includes(entry.id)
            && applies(entry));
        if (relationReferences.length) result.relationReferences = clone(relationReferences);
        const feelingReferences = taught.filter(e => feelingApplies(e, e.type, e.id, frame, speaker, locale));
        if (feelingReferences.length) result.feelingReferences = clone(feelingReferences);
        if ((relationReady || reportReady) && ['feeling_contrast', 'feeling_single'].includes(frame.catalogRule)) {
            result.testimony = { reporter: speaker, contentSubject: speaker, status: 'reported', verified: false };
        }
        if (relationReady && frame.roles) {
            if (frame.roles.reporter) {
                result.subject = frame.subject === 'player' ? speaker : frame.subject;
                result.roles = { ...clone(frame.roles), reporter: speaker, contentSubject: result.subject };
            } else result.roles = { ...clone(frame.roles), proposer: speaker,
                actors: frame.roles.actors.map(actor => actor === 'player' ? speaker : actor) };
        }
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
        if (['report', 'report_continuation'].includes(last.kind) && last.known.meaning === 'sad' && last.polarity === 'positive') {
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

    // Reports are heard evidence, separate from the character's delivered speech or
    // observations. Only the immediately preceding speaker report can supply ellipsis.
    function reportContinuation(state, raw, input) {
        const forms = {
            ja: /^(?:そう[、,\s]*)?(?:そのこと|その話|さっきの話)(?:だよ|です)?[。.]?$/u,
            en: /^(?:yes,? )?that(?:'s| is) what i meant[.]?$/iu,
            'zh-CN': /^(?:对[，,]?)?我说的就是这件事[。]?$/u,
            ru: /^да,? я об этом[.]?$/iu,
            'es-ES': /^sí,? a eso me refiero[.]?$/iu,
            'pt-BR': /^sim,? é disso que estou falando[.]?$/iu,
            de: /^ja,? das meine ich[.]?$/iu
        };
        const echo = forms[input.locale]?.test(normalize(raw));
        const extension = input.locale === 'ja' && /^(?:それで|そのことで)[、,\s]*(.+)$/u.exec(normalize(raw).replace(/。$/u, ''));
        const feeling = extension && feelingReport(extension[1], false, 'ja');
        if (!echo && feeling?.aspect !== 'feeling') return null;
        const previous = state.context.turns.at(-1);
        const u = previous?.understandings.length === 1 && previous.understandings[0];
        if (state.context.lastOutput && state.context.lastOutput.inputId !== previous?.id) return null;
        if (previous?.speaker !== input.speaker || !u || !['report', 'report_continuation'].includes(u.kind)
            || u.subject !== input.speaker || u.polarity !== 'positive'
            || !['sad', 'happy', 'painful', 'tired', 'failure', 'success'].includes(u.known.meaning)
            || u.unresolved.some(item => item.type !== 'detail') || !u.reportSource) return null;
        const reference = { inputId: u.reportReference?.inputId || u.reportSource.inputId,
            previousInputId: previous.id, speaker: input.speaker, kind: 'speaker_report',
            heardAt: u.reportReference?.heardAt ?? u.reportSource.heardAt, eventTime: u.eventTime };
        const source = state.records.find(r => r.id === reference.inputId && r.speaker === input.speaker && !r.retractedBy);
        if (!source) return null;
        const inheritsTime = feeling && feeling.time === 'past' && ['past_today', 'yesterday', 'past'].includes(u.eventTime);
        return { ...(feeling || { kind: 'report_continuation', meaning: u.known.meaning,
            eventMeaning: u.known.eventMeaning, time: u.eventTime, relations: ['report', ...(u.eventTime !== 'unspecified' ? ['time'] : [])] }),
            ...(inheritsTime ? { time: u.eventTime, timeSource: 'report_reference' } : {}),
            aspect: feeling ? 'feeling' : u.aspect, span: raw, catalogRule: 'report_continuation', reportReference: reference,
            inheritedDetails: clone(u.unresolved), ...(feeling ? { relations: [...new Set([...feeling.relations, 'reason'])] } : {}) };
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
        const reportFollowup = reportContinuation(state, raw, input);
        const definition = correctionFrame(raw, input.locale, catalog) || wordFrame(raw, input.locale) || wordUseFrame(raw, input.locale);
        const interpretations = definition ? [definition] : repeats && answer && previous.speaker === input.speaker
            ? [{ kind: 'question', slot: 'repeat_answer', subject: 'self', relations: ['question'],
                span: raw, catalogRule: 'context_repeat', replyTo: previous.id }]
            : followup ? [followup] : reportFollowup ? [reportFollowup] : interpret(raw, input.locale, catalog);
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
            const applied = wordApplication(state, frame.span, input.speaker);
            if (applied.candidates.length) {
                interpretations[index] = { kind: 'word_reference', meaning: frame.span, span: frame.span, relations: [] };
                return;
            }
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
        const understandings = interpretations.map(frame => understand(state, frame, input.speaker, catalog, input.locale));
        understandings.forEach((u, index) => {
            const frame = interpretations[index];
            if (frame.catalogRule === 'feeling_contrast') {
                // Parsed source and understood content are distinct. In particular,
                // this source cannot supply missing meanings or report/time knowledge.
                u.clauseSource = { input: clone(input), index, frame: clone(frame) };
                u.feelingBasis = feelingBasis(state);
            }
            if (frame.catalogRule === 'feeling_single') {
                u.feelingSource = { input: clone(input), frame: clone(frame) };
                u.feelingBasis = feelingBasis(state);
            }
            // Splitting sentences does not establish the scope of a condition,
            // contrast or correction. Keep recognized content, but do not act on
            // an isolated proposal or retract evidence through an isolated reply.
            // An explicitly parsed whole-input definition remains one frame.
            if (interpretations.length > 1 && ['request', 'invitation', 'correction', 'reply'].includes(frame.kind)) {
                u.unresolved.push({ type: 'clause_scope' });
                u.complete = false;
            }
            if (frame.reportReference) {
                u.reportReference = clone(frame.reportReference);
                if (frame.timeSource) u.timeSource = frame.timeSource;
                u.unresolved.push(...frame.inheritedDetails);
                u.complete = u.unresolved.length === 0;
            }
            if (['report', 'report_continuation'].includes(u.kind)) {
                u.reportSource = { kind: 'speaker_report', inputId: input.id, heardAt: input.at };
                if (frame.aspect === 'activity_report') Object.assign(u.reportSource,
                    { raw: input.raw, locale: input.locale, reporter: input.speaker, contentSubject: u.subject });
            }
        });
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
            if (frame.kind !== 'reply' || u.kind !== 'reply' || !u.complete) return;
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
            if (['word_explanation', 'word_correction'].includes(frame.kind)) {
                const result = updateWordExplanation(state, frame, understandings[index], input, catalog);
                const entry = state.knowledge.wordExplanations?.find(e => e.inputId === input.id);
                if (entry) understandings[index].wordExplanation = clone({ word: entry.word, explainedAs: entry.explainedAs,
                    scope: entry.scope, basis: entry.basis, input: entry.input });
                return result;
            }
            const candidates = formCandidates(state, frame, understandings[index], input, catalog);
            const adopted = adoptCandidate(candidates);
            const updated = updateLinks(state, candidates, adopted, input);
            return { candidates, adopted, updated };
        });
        const recalled = [...new Set(understandings.flatMap(u => recall(state, u)))].slice(-RULES.recallLimit);
        // Retraction applies only to the latest understood naming explanation, never
        // to all past knowledge. A missing or ambiguous antecedent remains unresolved.
        understandings.forEach((u, index) => {
            if (u.kind !== 'correction' || !u.complete) return;
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
        // An isolated label is a sensory pairing opportunity, not sentence comprehension.
        const quotedLabel = /^(?:\u300c([^\u300d]+)\u300d|"([^"]+)"|\u201c([^\u201d]+)\u201d)$/u.exec(raw.trim());
        const labelText = quotedLabel ? quotedLabel.slice(1).find(Boolean) : raw;
        const lifeLabel = input.speaker === 'player' ? Object.entries(catalog.meanings)
            .filter(([id, forms]) => (quotedLabel || !['hungry', 'tired'].includes(id))
                && forms.some(form => normalize(form) === normalize(labelText)))
            .map(([id]) => id) : [];
        return { input, interpretations, understandings, learning, transfer, recalled, reaction, expression, lifeLabel };
    }

    function validClauseSources(state, catalog) {
        for (const item of [...state.context.turns, ...state.records]) {
            if (!Array.isArray(item?.understandings) || item.understandings.some(u => !u)) return false;
            const clauses = item.understandings.filter(u => u.clauseSource !== undefined);
            if (!clauses.length) continue; // Old saves keep their original representation.
            if (clauses.length !== 2 || item.understandings.length !== 2) return false;
            const input = clauses[0].clauseSource?.input;
            if (!input || input.id !== item.id || input.speaker !== item.speaker
                || !/^input:[1-9]\d*$/.test(input.id) || Number(input.id.slice(6)) > state.serial
                || typeof input.raw !== 'string' || typeof input.scene !== 'string'
                || !Number.isFinite(input.at) || (item.heardAt !== undefined && item.heardAt !== input.at)) return false;
            const frames = feelingContrast(input.raw, input.locale, catalog);
            if (!frames || !clauses.every((u, index) => {
                const source = u.clauseSource;
                return source?.index === index && JSON.stringify(source.input) === JSON.stringify(input)
                    && JSON.stringify(source.frame) === JSON.stringify(frames[index]);
            })) return false;
            const record = state.records.find(r => r.id === item.id);
            if (record && JSON.stringify(record.understandings) !== JSON.stringify(item.understandings)) return false;
        }
        return true;
    }

    return Object.freeze({ RULES, create, perceive, interpret, receive, formCandidates,
        adoptCandidate, updateLinks, assessTransfer, experienceCandidates, learnExperience, validExperienceLearning,
        wordFrame, wordScope, correctionFrame, understand, wordApplication, validWordLearning, lexicalMeaning, questionDemonstration, proposalFrame, reportFrame, negationFrame, timeFrame, conditionFrame, sequenceFrame, reasonFrame, feelingContrast, feelingTeaching, feelingBasis, validClauseSources });
});
