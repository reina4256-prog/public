(function (root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        typeof module === 'object' && module.exports ? require('./experimental_word_dungeon_core') : root.ExperimentalWordDungeonPreview,
        typeof module === 'object' && module.exports ? require('./experimental_word_life_learning') : root.ExperimentalWordLifeLearning);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDungeonLearning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (core, preview, lifeLearning) {
    'use strict';
    const copy = value => JSON.parse(JSON.stringify(value));
    const scene = 'dungeon:room:1';
    const objects = Object.freeze([
        { id: 'dungeon:enemy:1', meaning: 'dungeon:opponent', x: 6, y: 3 },
        { id: 'dungeon:exit:1', meaning: 'dungeon:stairs', x: 7, y: 1 }
    ]);
    const forms = Object.freeze({
        ja: { warning: ['これは危ない', 'この相手は危ない'], go: ['そこへ行って', 'そこに行って'] },
        en: { warning: ['This is dangerous', 'This opponent is dangerous'], go: ['Go there'] },
        'zh-CN': { warning: ['这个很危险', '这个对手很危险'], go: ['去那里'] },
        ru: { warning: ['Это опасно', 'Этот противник опасен'], go: ['Иди туда'] },
        'es-ES': { warning: ['Esto es peligroso', 'Este rival es peligroso'], go: ['Ve allí'] },
        'pt-BR': { warning: ['Isto é perigoso', 'Este oponente é perigoso'], go: ['Vá até lá'] },
        de: { warning: ['Das ist gefährlich', 'Dieser Gegner ist gefährlich'], go: ['Geh dorthin'] }
    });
    const vectors = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const naming = {
        en: /^This is ([\p{L}\p{N}ー]{1,16})$/iu, 'zh-CN': /^这是([\p{L}\p{N}ー]{1,16})$/u,
        ru: /^Это ([\p{L}\p{N}ー]{1,16})$/iu, 'es-ES': /^Esto se llama ([\p{L}\p{N}ー]{1,16})$/iu,
        'pt-BR': /^Isto se chama ([\p{L}\p{N}ー]{1,16})$/iu, de: /^Das heißt ([\p{L}\p{N}ー]{1,16})$/iu
    };
    const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    function create(state, world = null) {
        state.dungeonLearning ||= { inputs: [], warnings: [], actions: [] };
        state.dungeonLearning.lexicon ||= [];
        return { state, world, goal: null, walkingAction: null, position: { x: 5, y: 3 }, attention: null, pending: null, proposal: null, turn: 0, complete: false, last: null };
    }
    function perceive(session, target = session.attention) {
        session.attention = objects.some(o => o.id === target) ? target : null;
        core.perceive(session.state, { scene, attention: objects.filter(o => o.id === session.attention).map(({ id, meaning }) => ({ id, meaning })) });
    }
    function warned(session) {
        return session.state.dungeonLearning.warnings.some(w => w.target === objects[0].id && w.scene === scene);
    }
    function neighbors(position, avoid) {
        return vectors.map(([dx, dy]) => ({ x: position.x + dx, y: position.y + dy }))
            .filter(p => preview.grid[p.y]?.[p.x] === '.' && distance(p, objects[0]) !== 0 && (!avoid || distance(p, objects[0]) > 1));
    }
    function advance(session, requested = null, inputId = null, intent = 'go') {
        if (session.complete) return null;
        session.pending = session.proposal = null;
        const before = copy(session.position), danger = warned(session);
        let after = before, reason = 'explore';
        const target = objects.find(o => o.id === requested) || objects[1];
        if (intent === 'avoid' && requested) {
            after = neighbors(before, danger).filter(p => distance(p, target) > distance(before, target))
                .sort((a, b) => distance(b, target) - distance(a, target))[0] || before;
            reason = 'avoid';
        } else if (danger && (distance(before, objects[0]) <= 1 || requested === objects[0].id)) {
            after = neighbors(before, false).sort((a, b) => distance(b, objects[0]) - distance(a, objects[0]))[0] || before;
            reason = requested ? 'diverged' : 'retreat';
        } else {
            const queue = [{ ...before, first: null }], seen = new Set([before.x + ',' + before.y]);
            for (let index = 0; index < queue.length; index++) {
                const p = queue[index];
                if (distance(p, target) <= (target.id === objects[0].id ? 1 : 0)) { after = p.first || before; break; }
                for (const n of neighbors(p, danger)) {
                    const key = n.x + ',' + n.y;
                    if (!seen.has(key)) { seen.add(key); queue.push({ ...n, first: p.first || n }); }
                }
            }
            if (requested) reason = 'obey';
        }
        session.position = { x: after.x, y: after.y }; session.turn++;
        session.complete = distance(after, objects[1]) === 0;
        session.last = { id: session.state.dungeonLearning.actions.length + 1, scene, subject: 'self', inputId, requested,
            intent, reason, before, after: copy(session.position), warningSources: danger ? session.state.dungeonLearning.warnings.map(w => w.inputId) : [] };
        session.state.dungeonLearning.actions.push(copy(session.last));
        session.walkingAction = distance(before, session.position) === 1 ? copy(session.last) : null;
        if (session.goal && (session.last.reason !== 'obey' || !session.walkingAction
            || distance(session.position, objects.find(o => o.id === session.goal.requested)) <= (session.goal.requested === objects[0].id ? 1 : 0))) session.goal = null;
        return session.last;
    }
    // These grammars propose readings; matching one never supplies the child's knowledge.
    // Grounding comes from a player's subsequent answer, with both original inputs retained.
    const grammar = {
        ja: { yes: /^(?:はい|うん|そう|そうだよ|そうです|(?:それで)?(?:合ってる|あっている|合っている)(?:よ)?|それでいい)$/u, no: /^(?:いいえ|違う|ちがう|そうじゃない)$/u,
            split: /(?:だから|なので|(?<=い)から|(?<=いる)から|(?<=ある)から|ので)[、,\s]*/u, declaration: /^(.+?)(?:のは|は)(.{1,24}?)(?:だよ|です|だ|のこと)?$/u,
            go: /^(.+?)(?:へ|に|まで)(?:歩いて(?:行って|いって)?|行って|いって|向かって|進んで|動いて|移動して)(?:ください|ほしい|欲しい)?(?:ね|よ)?$/u,
            avoid: /^(.+?)(?:を)(?:避けて|よけて)(?:ください|ほしい|欲しい)?(?:ね|よ)?$/u,
            away: /^(.+?)(?:から離れて|には近づかないで|に近づかないで)(?:ください)?(?:ね|よ)?$/u,
            bareGo: /^(?:歩いて(?:行って|いって)?|行って|いって|向かって|進んで|動いて|移動して)(?:ね|ください)?$/u,
            bareAvoid: /^(?:避けて|よけて|離れて|近づかないで)(?:ね|ください)?$/u,
            warning: /^(?:危ない|危険|危険だ|危険です)(?:よ|ね)?$/u, deictic: /^(?:これ|それ|ここ|そこ|この相手)$/u,
            red: /赤(?:い|く)/u, side: /横/u, near: /(?:隣|となり|そば|近く)/u, upper: /(?:右上|上の方|上にある)/u },
        en: { yes: /^(?:yes|yeah|that's right|correct)$/iu, no: /^(?:no|wrong|not that)$/iu, split: /(?:,?\s+so\s+)/iu,
            declaration: /^(.+?) (?:is called|is|means) (.+)$/iu, go: /^(?:please )?(?:go|walk|head|move) to (.+?)(?: please)?$/iu,
            avoid: /^(?:please )?(?:avoid|stay away from|move away from) (.+?)(?: please)?$/iu,
            bareGo: /^(?:go|walk|head)(?: there)?$/iu, bareAvoid: /^(?:avoid it|stay away|move away)$/iu,
            warning: /^(?:dangerous|unsafe)$/iu, deictic: /^(?:this|that|there|this opponent)$/iu,
            red: /\bred\b/iu, near: /(?:next to|beside|near you)/iu, upper: /(?:upper right|top right)/iu },
        'zh-CN': { yes: /^(?:是|是的|对|对的|没错)$/u, no: /^(?:不对|不是|错了)$/u, split: /(?:所以|因此)/u,
            declaration: /^(.+?)(?:是|叫)(.+)$/u, go: /^(?:请)?(?:去|走向|走到)(.+)$/u,
            avoid: /^(?:请)?(?:避开|远离)(.+)$/u, bareGo: /^(?:去那里|过去)$/u, bareAvoid: /^(?:避开它|离远点)$/u,
            warning: /^(?:很危险|危险|不安全)$/u, deictic: /^(?:这|这个|那个|那里|这个对手)$/u,
            red: /红色/u, near: /(?:旁边|身边|附近)/u, upper: /右上/u },
        ru: { yes: /^(?:да|верно|правильно)$/iu, no: /^(?:нет|неверно)$/iu, split: /(?:,?\s+поэтому\s+)/iu,
            declaration: /^(.+?) (?:это|называется|—) (.+)$/iu, go: /^(?:иди|подойди|двигайся) (?:к|в сторону) (.+)$/iu,
            avoid: /^(?:избегай|отойди от|держись подальше от) (.+)$/iu,
            bareGo: /^иди туда$/iu, bareAvoid: /^отойди$/iu, warning: /^(?:опасно|опасен|опасный)$/iu,
            deictic: /^(?:это|туда|этот противник)$/iu, red: /красн/iu, near: /(?:рядом|сбоку)/iu, upper: /(?:справа вверху|вверху справа)/iu },
        'es-ES': { yes: /^(?:sí|si|correcto|así es)$/iu, no: /^(?:no|incorrecto)$/iu, split: /(?:,?\s+(?:así que|por eso)\s+)/iu,
            declaration: /^(.+?) (?:es|se llama) (.+)$/iu, go: /^(?:ve|camina|dirígete) (?:a|hacia) (.+)$/iu,
            avoid: /^(?:evita|aléjate de) (.+)$/iu, bareGo: /^ve allí$/iu, bareAvoid: /^aléjate$/iu,
            warning: /^(?:peligroso|peligrosa)$/iu, deictic: /^(?:esto|eso|allí|este rival)$/iu,
            red: /roj[oa]/iu, near: /(?:al lado|cerca de ti)/iu, upper: /arriba a la derecha/iu },
        'pt-BR': { yes: /^(?:sim|certo|isso mesmo)$/iu, no: /^(?:não|errado)$/iu, split: /(?:,?\s+(?:então|por isso)\s+)/iu,
            declaration: /^(.+?) (?:é|se chama) (.+)$/iu, go: /^(?:vá|ande|caminhe) (?:até|para) (.+)$/iu,
            avoid: /^(?:evite|afaste-se de) (.+)$/iu, bareGo: /^vá até lá$/iu, bareAvoid: /^afaste-se$/iu,
            warning: /^(?:perigoso|perigosa)$/iu, deictic: /^(?:isto|isso|lá|este oponente)$/iu,
            red: /vermelh[oa]/iu, near: /(?:ao lado|perto de você)/iu, upper: /(?:alto à direita|canto superior direito)/iu },
        de: { yes: /^(?:ja|richtig|genau)$/iu, no: /^(?:nein|falsch)$/iu, split: /(?:,?\s+(?:also|deshalb)\s+)/iu,
            declaration: /^(.+?) (?:ist|heißt) (.+)$/iu, go: /^(?:geh|laufe) (?:zu|zum|zur) (.+)$/iu,
            avoid: /^(?:meide|entferne dich von) (.+)$/iu, bareGo: /^geh dorthin$/iu, bareAvoid: /^geh weg$/iu,
            warning: /^gefährlich$/iu, deictic: /^(?:das|dies|dorthin|dieser Gegner)$/iu,
            red: /rot/iu, near: /(?:neben dir|in deiner Nähe)/iu, upper: /(?:oben rechts|rechts oben)/iu }
    };
    // Only neutral reference words may accompany sensory selectors. Do not discard
    // an unknown negation, alternative or another command merely because "red" occurs.
    const descriptionWords = {
        ja: /(?:横|隣|となり|そば|近く|右|左|上|下|方|赤い|赤く見える|にいる|にある|いる|ある|もの|物|やつ|相手|ひと|人|自分|あなた|きみ|君|いま|今|すぐ|だよ|です|の|に|は)/gu,
        en: /\b(?:the|this|that|one|figure|opponent|thing|object|standing|right|left|above|below|bottom|lower|to|at|of|in|next|beside|near|you|your|me|red|upper|top|side)\b/giu,
        'zh-CN': /(?:红色|旁边|身边|附近|右|左|上|下|那个|这个|对手|东西|物体|的|在|你|我)/gu,
        ru: /(?:красн(?:ый|ая|ое|ого)|противник|существо|предмет|рядом|сбоку|справа|слева|вверху|внизу|со|с|мной|тобой|этот|эта|это)/giu,
        'es-ES': /\b(?:el|la|esa|ese|figura|rival|cosa|objeto|rojo|roja|al|lado|cerca|de|ti|arriba|abajo|a|derecha|izquierda)\b/giu,
        'pt-BR': /(?<![\p{L}\p{N}])(?:o|a|essa|esse|figura|oponente|coisa|objeto|vermelho|vermelha|ao|lado|perto|de|você|alto|baixo|à|direita|esquerda|canto|superior|inferior)(?![\p{L}\p{N}])/giu,
        de: /\b(?:der|die|das|diese|dieser|rote|roter|rotes|roten|Gestalt|Gegner|Ding|Objekt|neben|dir|in|deiner|Nähe|oben|unten|rechts|links)\b/giu
    };
    const directions = {
        ja: [/右/u, /左/u, /上/u, /下/u], en: [/\bright\b/iu, /\bleft\b/iu, /\b(?:upper|top|above)\b/iu, /\b(?:lower|bottom|below)\b/iu],
        'zh-CN': [/右/u, /左/u, /上/u, /下/u], ru: [/справа/iu, /слева/iu, /вверху/iu, /внизу/iu],
        'es-ES': [/\bderecha\b/iu, /\bizquierda\b/iu, /\barriba\b/iu, /\babajo\b/iu],
        'pt-BR': [/\bdireita\b/iu, /\besquerda\b/iu, /\b(?:alto|superior)\b/iu, /\b(?:baixo|inferior)\b/iu],
        de: [/\brechts\b/iu, /\blinks\b/iu, /\boben\b/iu, /\bunten\b/iu]
    };
    const knowledgeQuestions = {
        ja: /^(.{1,24}?)(?:って何|ってなに|(?:は|を)?(?:わかる|分かる|知ってる|知っている))[?？]?$/u,
        en: /^(?:do you know|what is) (.{1,24}?)[?？]?$/iu, 'zh-CN': /^(?:你知道|你懂)(.{1,24}?)(?:吗)?[?？]?$/u,
        ru: /^(?:ты знаешь|что такое) (.{1,24}?)[?？]?$/iu, 'es-ES': /^(?:¿)?(?:conoces|qué es) (.{1,24}?)[?？]?$/iu,
        'pt-BR': /^(?:você conhece|o que é) (.{1,24}?)[?？]?$/iu, de: /^(?:kennst du|was ist) (.{1,24}?)[?？]?$/iu
    };
    // Definitions are answers to the current meaning question, never standalone commands.
    const definitions = {
        ja: { avoid: /^(?:近づかずに離れる|距離を取る|近づかない)(?:こと|ということ|ってこと)?(?:だよ|です)?$/u,
            go: /^(?:その場所へ|そこへ)(?:歩いて)?(?:行く|近づく)(?:こと|ということ|ってこと)?(?:だよ|です)?$/u },
        en: { avoid: /^(?:it means )?(?:keep your distance|move away|stay away)$/iu, go: /^(?:it means )?(?:walk there|walk to that place)$/iu },
        'zh-CN': { avoid: /^(?:就是|意思是)?(?:保持距离|离远一点|不要靠近)$/u, go: /^(?:就是|意思是)?(?:走到那里|走向那个地方)$/u },
        ru: { avoid: /^(?:это значит )?(?:держать дистанцию|отойти подальше)$/iu, go: /^(?:это значит )?идти туда$/iu },
        'es-ES': { avoid: /^(?:significa )?(?:mantener la distancia|alejarse)$/iu, go: /^(?:significa )?caminar hasta allí$/iu },
        'pt-BR': { avoid: /^(?:significa )?(?:manter distância|se afastar)$/iu, go: /^(?:significa )?andar até lá$/iu },
        de: { avoid: /^(?:das bedeutet )?(?:Abstand halten|weggehen)$/iu, go: /^(?:das bedeutet )?dorthin gehen$/iu }
    };
    function targetReply(pending, candidates) {
        return { message: pending.target ? pending.word ? 'dungeonConfirmTarget' : 'dungeonConfirmUnnamed'
            : candidates?.length > 1 ? 'dungeonMoreDetail' : 'dungeonWhich', literal: pending.word };
    }
    function candidatesFor(session, selectors) {
        return objects.filter(o => selectors.every(selector => selector === 'red' ? o.id === objects[0].id
            : selector === 'side' ? o.y === session.position.y && Math.abs(o.x - session.position.x) === 1
            : selector === 'near' ? distance(o, session.position) === 1
            : selector === 'right' ? o.x > session.position.x : selector === 'left' ? o.x < session.position.x
            : selector === 'upper' ? o.y < session.position.y : o.y > session.position.y)).map(o => o.id);
    }
    const clean = text => text.normalize('NFKC').trim().replace(/[。.!！]+$/u, '').trim();
    const equal = (a, b) => clean(a).toLocaleLowerCase() === clean(b).toLocaleLowerCase();
    function parse(raw, locale) {
        const g = grammar[locale] || grammar.ja, text = clean(raw);
        const question = knowledgeQuestions[locale]?.exec(text);
        if (question) return { kind: 'reference', reference: question[1].trim(), question: true };
        if (text.length > 250 || /[?？]|(?:じゃない|ではない|もし|だったら)/u.test(text)) return null;
        const pieces = text.split(g.split);
        if (pieces.length > 2) return null;
        const command = value => {
            if (g.bareGo.test(value)) return { kind: 'go', reference: null };
            if (g.bareAvoid.test(value)) return { kind: 'avoid', reference: null };
            const go = g.go.exec(value), avoid = g.avoid.exec(value) || g.away?.exec(value);
            return go ? { kind: 'go', reference: go[1] } : avoid ? { kind: 'avoid', reference: avoid[1] }
                : g.bareGo.test(value) ? { kind: 'go', reference: null } : g.bareAvoid.test(value) ? { kind: 'avoid', reference: null } : null;
        };
        // Match the complete noun before considering a nominalizing particle.
        const declaration = (locale === 'ja' && (/^(.+?)(?:には|に)(.{1,24}?)(?:が|は)(?:いる|ある)$/u.exec(pieces[0])
            || /^(.+?もの)は(.{1,24}?)(?:だよ|です|だ|のこと)?$/u.exec(pieces[0]))) || g.declaration.exec(pieces[0]);
        if (pieces.length === 2) {
            const action = command(pieces[1]);
            if (!declaration || !action) return null;
            return { ...action, reference: declaration[1], label: declaration[2], because: true,
                warning: g.warning.test(declaration[2]) };
        }
        const action = command(text);
        if (action) return action;
        if (declaration) return { kind: g.warning.test(declaration[2]) ? 'warning' : 'name', reference: declaration[1], label: declaration[2], warning: g.warning.test(declaration[2]) };
        if ((forms[locale] || forms.ja).warning.some(form => equal(form, text))) return { kind: 'warning', reference: null };
        const name = naming[locale]?.exec(text);
        if (name) return { kind: 'name', reference: null, label: name[1] };
        return null;
    }
    function references(session, word, locale) {
        const state = session.state, g = grammar[locale] || grammar.ja;
        if (!word || g.deictic.test(clean(word))) return { target: session.attention, candidates: session.attention ? [session.attention] : [] };
        const words = [word, locale === 'ja' ? word.replace(/(?:の方|のほう|のところ|の場所)$/u, '')
            : locale === 'en' ? word.replace(/^the /iu, '') : word];
        const names = state.dungeonLearning.lexicon.filter(e => e.locale === locale && e.scene === scene && e.meaning === 'reference'
            && words.some(value => equal(e.word, value))).map(e => e.target);
        const island = state.knowledge.associations.filter(e => words.some(value => equal(e.word, value)) && e.speaker === 'player'
            && e.evidence.some(source => !source.retractedBy)).map(e => e.target);
        const named = [...new Set([...names, ...island])];
        if (named.length) return { target: named.length === 1 && objects.some(o => o.id === named[0]) ? named[0] : null, candidates: named };
        if (clean(word).replace(descriptionWords[locale] || descriptionWords.ja, '').trim()) return { target: null, candidates: [] };
        const selectors = ['red', 'side', 'near'].filter(key => g[key]?.test(word));
        ['right', 'left', 'upper', 'lower'].forEach((key, i) => { if ((directions[locale] || directions.ja)[i].test(word)) selectors.push(key); });
        const candidates = candidatesFor(session, selectors);
        const confirmed = selectors.length && selectors.every(selector => state.dungeonLearning.lexicon.some(e => e.locale === locale
            && e.scene === scene && e.meaning === 'selector' && e.word === selector));
        return { target: confirmed && candidates.length === 1 ? candidates[0] : null,
            candidates: selectors.length ? candidates : [], selectors };
    }
    function receive(session, raw, catalog, locale = 'ja', at = Date.now()) {
        perceive(session);
        const state = session.state, data = state.dungeonLearning, g = grammar[locale] || grammar.ja;
        session.goal = null;
        const walkingAction = session.walkingAction; session.walkingAction = null;
        if (core.walkingLabel(raw, locale, catalog)) {
            const before = { knowledgeBefore: copy(state.knowledge), lexiconBefore: copy(data.lexicon), warningsBefore: copy(data.warnings), dialogueBefore: copy(session.pending) };
            const input = { id: 'input:' + (++state.serial), raw, locale, speaker: 'player', at, scene,
                attention: copy(state.context.attention), position: copy(session.position) };
            const frame = { kind: 'walking_teaching', relations: [], span: raw };
            const result = { input, interpretations: [frame], understandings: [core.understand(state, frame, 'player', catalog, locale)],
                learning: [], lifeLabel: ['walk'], expression: { message: 'uncertain' }, reaction: { intent: 'uncertain' } };
            const accepted = lifeLearning.teachWalkingStep(session.world, state, result, walkingAction);
            session.pending = session.proposal = null;
            data.inputs.push(copy({ kind: 'walking_teaching', target: null, result, ...before, acquired: [], dialogueAfter: null }));
            return { result, special: true, kind: 'walking_teaching', reply: { message: accepted ? 'walkingLearned' : 'walkingNeedExperience' } };
        }
        // A known greeting belongs to the shared conversation, even if a particle
        // inside it happens to resemble the local naming grammar.
        if (core.interpret(raw, locale, catalog).some(frame => frame.kind === 'greeting')) {
            session.pending = session.proposal = null;
            return { result: core.receive(state, raw, catalog, { locale, speaker: 'player', at }), special: false };
        }
        let parsed = parse(raw, locale), pending = session.pending;
        let answer = pending?.locale === locale && (g.yes.test(clean(raw)) ? 'yes' : g.no.test(clean(raw)) ? 'no' : null);
        const definition = pending?.locale === locale && definitions[locale]?.[pending.meaning]?.test(clean(raw));
        if (definition) { answer = 'yes'; parsed = null; }
        // An unrelated message cancels the proposal. Bare yes can never revive an old question.
        let refinement = null;
        if (pending?.locale === locale && pending.meaning === 'reference' && !answer) {
            const repeated = parsed && (parsed.question && equal(parsed.reference, pending.word)
                || ['go', 'avoid'].includes(parsed.kind) && !parsed.reference);
            if (!parsed || repeated) {
                const ref = references(session, raw, locale);
                if (!parsed && ref.selectors?.length) {
                    const selectors = [...new Set([...(pending.selectors || []), ...ref.selectors])];
                    refinement = { selectors, candidates: candidatesFor(session, selectors) };
                } else if (!parsed && pending.target && pending.word && equal(raw, pending.word)) answer = 'yes';
                else if (!parsed && pending.target && !pending.word && /^[\p{L}\p{N}]{1,24}$/u.test(clean(raw))
                    && !g.no.test(clean(raw)) && !core.interpret(raw, locale, catalog).some(frame => frame.kind !== 'unknown')) {
                    pending = { ...pending, word: clean(raw) }; answer = 'yes';
                }
                else if (repeated || !core.interpret(raw, locale, catalog).some(frame => frame.kind !== 'unknown')) refinement = { retained: true };
                if (refinement || answer) parsed = null;
            }
        }
        if (pending?.locale === locale && pending.meaning !== 'reference' && !answer && !parsed
            && !core.interpret(raw, locale, catalog).some(frame => frame.kind !== 'unknown')) refinement = { retained: true };
        if (!parsed && !answer && !refinement) {
            const ref = references(session, clean(raw), locale);
            if (ref.target) parsed = { kind: 'reference', reference: clean(raw) };
            else if (!g.yes.test(clean(raw)) && !g.no.test(clean(raw)) && /^[\p{L}\p{N}]{1,24}$/u.test(clean(raw))
                && !core.interpret(raw, locale, catalog).some(frame => frame.kind !== 'unknown')) parsed = { kind: 'reference', reference: clean(raw) };
        }
        if (!parsed && !answer && !refinement) {
            session.pending = session.proposal = null;
            return { result: core.receive(state, raw, catalog, { locale, speaker: 'player', at }), special: false };
        }
        const input = { id: 'input:' + (++state.serial), raw, locale, speaker: 'player', at, scene,
            attention: copy(state.context.attention), position: copy(session.position) };
        const before = { knowledgeBefore: copy(state.knowledge), lexiconBefore: copy(data.lexicon), warningsBefore: copy(data.warnings), dialogueBefore: copy(session.pending) };
        let reply, acquired = [], ref, frame, u;
        if (answer || refinement) {
            frame = { kind: 'dungeon_clarification', relations: [], sourceInputId: pending.sourceInputId };
            u = core.understand(state, frame, 'player', catalog, locale);
            if (answer === 'no') {
                session.pending = pending.meaning === 'reference' ? { ...pending, target: null, selectors: [] } : null; session.proposal = null;
                reply = { message: session.pending ? 'dungeonWhich' : 'dungeonNotLearned', literal: pending.word };
            } else if (refinement) {
                const target = refinement.retained ? pending.target : refinement.candidates.length === 1 ? refinement.candidates[0] : null;
                session.pending = { ...pending, target, selectors: refinement.selectors || pending.selectors,
                    clarificationInputIds: [...(pending.clarificationInputIds || []), input.id],
                    ...(!refinement.retained ? { proposalInputId: input.id } : {}) };
                session.proposal = target;
                u.complete = false; u.unresolved.push({ type: 'target', token: pending.word });
                reply = pending.meaning === 'reference' ? targetReply(session.pending, refinement.candidates)
                    : { message: pending.meaning === 'go' ? 'dungeonConfirmGo' : pending.meaning === 'avoid' ? 'dungeonConfirmAvoid' : 'dungeonConfirmWarning', literal: pending.word };
            } else if (!pending.target && pending.meaning === 'reference') {
                u.complete = false; u.unresolved.push({ type: 'target', token: pending.word }); reply = { message: 'dungeonWhich', literal: pending.word };
            } else {
                const relation = pending.meaning === 'reference' ? 'naming' : pending.meaning === 'warning' ? 'report' : 'request';
                const check = core.understand(state, { kind: relation === 'naming' ? 'naming' : relation,
                    relations: [relation, ...(definition ? ['naming'] : [])], ...(relation === 'request' ? { meaning: 'walk' } : {}) }, 'player', catalog, locale);
                // Naming needs the explicitly proposed object, not the previous attention.
                const missing = check.unresolved.filter(e => !(relation === 'naming' && e.type === 'target'));
                if (missing.length) { u.complete = false; u.unresolved.push(...missing); reply = { message: 'dungeonNeedBasis' }; }
                else {
                    const entry = { word: pending.word, meaning: pending.meaning, target: pending.target || null, scene, locale,
                        speaker: 'player', source: 'confirmed_teaching', sourceInputId: pending.sourceInputId,
                        confirmationKind: definition ? 'meaning_explanation' : !g.yes.test(clean(raw)) ? 'naming_answer' : 'affirmation',
                        clarificationInputIds: copy(pending.clarificationInputIds || []),
                        proposalInputId: pending.proposalInputId || pending.sourceInputId, inputId: input.id };
                    const entries = [...(entry.word ? [entry] : []), ...(pending.selectors || []).map(word => ({ ...entry, word, meaning: 'selector' }))];
                    for (const e of entries) if (!data.lexicon.some(old => old.word === e.word && old.meaning === e.meaning
                        && old.target === e.target && old.locale === locale && old.scene === scene)) { data.lexicon.push(copy(e)); acquired.push(copy(e)); }
                    reply = { message: 'dungeonWordLearned', literal: pending.word };
                    if (pending.meaning === 'reference') {
                        perceive(session, pending.target);
                        u.target = { adopted: { id: pending.target, source: 'confirmed_proposal', sourceInputId: pending.sourceInputId }, candidates: [{ id: pending.target }] };
                    }
                    session.pending = session.proposal = null;
                }
            }
        } else {
            session.pending = session.proposal = null;
            ref = references(session, parsed.reference, locale);
            frame = { kind: parsed.kind === 'name' ? 'naming' : parsed.kind === 'warning' ? 'report'
                : parsed.kind === 'reference' ? 'reference' : 'request', relations: parsed.kind === 'name' ? ['naming']
                    : parsed.kind === 'warning' ? ['report'] : parsed.kind === 'reference' ? [] : ['request'],
                ...(parsed.because ? { relations: ['naming', 'report', 'reason', 'request'] } : {}),
                ...(['go', 'avoid'].includes(parsed.kind) ? { meaning: 'walk', subject: 'self', roles: { proposer: 'player', actors: ['self'] } } : {}), dungeonIntent: parsed.kind };
            u = core.understand(state, frame, 'player', catalog, locale);
            u.unresolved = u.unresolved.filter(e => e.type !== 'target');
            u.complete = u.unresolved.length === 0;
            if (ref.target) u.target = { adopted: { id: ref.target, source: 'dungeon_reference' }, candidates: [{ id: ref.target }],
                references: data.lexicon.filter(e => e.meaning === 'reference' && e.target === ref.target && e.locale === locale).map(e => e.inputId) };
            if (ref.target && parsed.question) reply = { message: 'dungeonReferenceKnown', literal: parsed.reference };
            if (!ref.target) {
                u.complete = false; u.unresolved.push({ type: 'target', token: parsed.reference, candidates: ref.candidates });
                session.pending = { meaning: 'reference', word: parsed.label && !parsed.warning ? parsed.label : parsed.reference || '',
                    target: ref.candidates.length === 1 && objects.some(o => o.id === ref.candidates[0]) ? ref.candidates[0] : null,
                    selectors: ref.selectors || [], sourceInputId: input.id, locale };
                session.proposal = session.pending.target;
                reply = targetReply(session.pending, ref.candidates);
            } else if (parsed.kind === 'name' || parsed.label && !parsed.warning) {
                const named = references(session, parsed.label, locale);
                if (named.target !== ref.target) {
                    u.complete = false; u.unresolved.push({ type: 'meaning', token: parsed.label });
                    session.pending = { meaning: 'reference', word: parsed.label, target: ref.target, sourceInputId: input.id, locale };
                    session.proposal = ref.target; reply = { message: 'dungeonConfirmTarget', literal: parsed.label };
                }
            }
            const semantics = [...(parsed.kind === 'warning' || parsed.warning ? ['warning'] : []), ...(['go', 'avoid'].includes(parsed.kind) ? [parsed.kind] : [])];
            const semantic = semantics.find(meaning => !data.lexicon.some(e => e.meaning === meaning && e.locale === locale && e.scene === scene));
            if (u.complete && semantic) {
                u.complete = false; u.unresolved.push({ type: 'dungeon_meaning', id: semantic });
                session.pending = { meaning: semantic, word: parsed.kind === 'warning' ? parsed.label || clean(raw) : clean(raw),
                    target: null, sourceInputId: input.id, locale };
                reply = { message: semantic === 'go' ? 'dungeonConfirmGo' : semantic === 'avoid' ? 'dungeonConfirmAvoid' : 'dungeonConfirmWarning', literal: session.pending.word };
            }
            if (u.unresolved.some(e => e.type === 'relation' || e.type === 'meaning' && e.token === 'walk')) {
                session.pending = session.proposal = null; reply = { message: u.unresolved.some(e => e.type === 'meaning' && e.token === 'walk') ? 'walkingNeedExperience' : 'dungeonNeedBasis' };
            }
            if (u.complete && (parsed.kind === 'warning' || parsed.warning)) {
                if (ref.target !== objects[0].id) {
                    u.complete = false; u.unresolved.push({ type: 'dungeon_scope', target: ref.target }); reply = { message: 'dungeonUnknown' };
                } else if (!data.warnings.some(e => e.target === ref.target && e.scene === scene)) data.warnings.push({ scene, target: ref.target, inputId: input.id });
            }
            if (u.complete && ['go', 'avoid'].includes(parsed.kind)) {
                advance(session, ref.target, input.id, parsed.kind);
                if (parsed.kind === 'go' && session.last?.reason === 'obey' && session.walkingAction
                    && distance(session.position, objects.find(o => o.id === ref.target)) > (ref.target === objects[0].id ? 1 : 0)) {
                    session.goal = { requested: ref.target, inputId: input.id };
                }
            }
            if (u.complete) perceive(session, ref.target);
        }
        const result = { input, interpretations: [{ ...frame, ...(parsed ? { reading: copy(parsed) } : {}) }], understandings: [copy(u)], learning: [],
            expression: { message: u.complete ? 'acknowledge' : 'uncertain' }, reaction: { intent: u.complete ? 'acknowledge' : 'uncertain' } };
        data.inputs.push(copy({ kind: parsed?.kind || 'clarification', target: ref?.target || null, result, ...before,
            acquired, dialogueAfter: session.pending }));
        return { result, special: true, kind: parsed?.kind || 'clarification', reply,
            learned: u.complete && parsed?.kind === 'warning' };
    }
    function notes(state) {
        const learned = (state.dungeonLearning?.lexicon || []).filter(e => e.meaning !== 'selector').map(e => ({ group: 'names',
            message: 'dungeonVocabulary', detail: 'dungeonTeachingScope', literal: e.word, target: e.target,
            sourceId: e.inputId, organized: false }));
        return [...learned, ...(state.dungeonLearning?.inputs || []).filter(e => e.kind === 'warning').map(e => ({ group: 'names',
            message: 'dungeonNote', detail: e.result.understandings[0].complete ? 'dungeonScope' : 'dungeonUnknown',
            literal: e.result.input.raw, target: e.target, sourceId: e.result.input.id, organized: false }))];
    }
    return Object.freeze({ create, perceive, receive, advance, warned, notes, objects, forms, grid: preview.grid });
});
