(function (root, factory) {
    const node = typeof module === 'object' && module.exports;
    const api = factory(node ? require('./experimental_word_adventure') : root.ExperimentalWordAdventure,
        node ? require('./experimental_word_learning_core') : root.ExperimentalWordLearning,
        node ? require('./experimental_word_learning_world') : root.ExperimentalWordWorld,
        node ? require('./experimental_word_island_navigation') : root.WordIslandNavigation,
        node ? require('./experimental_word_life_learning') : root.ExperimentalWordLifeLearning);
    if (node) module.exports = api; else root.ExperimentalWordAdventureConnection = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physical, core, life, navigation, walking) {
    'use strict';
    const copy = x => JSON.parse(JSON.stringify(x));
    const same = (a, b) => a.x === b.x && a.y === b.y;
    const near = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    const actions = ['attack', 'avoid', 'pick', 'equip', 'use', 'store', 'take', 'drop'];
    const teachable = [...actions, 'walk'];
    const meaningFor = action => action === 'walk' ? 'walk' : 'action:' + action;
    const words = {
        ja: ['攻撃する', 'かわす', '拾う', '装備する', '使う', 'しまう', '取り出す'],
        en: ['attack', 'evade', 'pick up', 'equip', 'use', 'store', 'take out'],
        'zh-CN': ['攻击', '闪避', '拾取', '装备', '使用', '存放', '取出'],
        ru: ['атаковать', 'уклониться', 'подобрать', 'экипировать', 'использовать', 'убрать', 'достать'],
        'es-ES': ['atacar', 'esquivar', 'recoger', 'equipar', 'usar', 'guardar', 'sacar'],
        'pt-BR': ['atacar', 'desviar', 'pegar', 'equipar', 'usar', 'guardar', 'retirar'],
        de: ['angreifen', 'ausweichen', 'aufheben', 'ausrüsten', 'benutzen', 'verstauen', 'herausnehmen']
    };
    const walkLabels = {ja: '歩く', en: 'walk', 'zh-CN': '走路', ru: 'идти', 'es-ES': 'caminar', 'pt-BR': 'andar', de: 'gehen'};
    const dropLabels={ja:'地面に置く',en:'put on the ground','zh-CN':'放到地上',ru:'положить на землю','es-ES':'dejar en el suelo','pt-BR':'colocar no chão',de:'auf den Boden legen'};
    for(const locale of Object.keys(words))words[locale].push(dropLabels[locale]);
    const normalize = text => text.normalize('NFKC').trim().toLocaleLowerCase().replace(/[。.!！]$/, '');
    function parse(raw, locale = 'ja') {
        const text = normalize(raw), w = words[locale] || words.en;
        const i = w.findIndex(x => normalize(x) === text);
        return normalize(walkLabels[locale] || walkLabels.en)===text ? 'walk' : i >= 0 ? actions[i] : null;
    }
    const say = message => ({ message, observation: true });
    const mentor = input => input?.speaker === 'player' || ['master:explore','master:building'].includes(input?.speaker);
    const projects = {
        bridge:['橋','bridge','桥','мост','puente','ponte','Brücke'], home:['家','home','家','дом','casa','casa','Haus'],
        bag:['かばん','bag','背包','сумка','bolsa','bolsa','Tasche'],stick:['棒','stick','木棒','палка','palo','bastão','Stock'],
        shield:['盾','shield','木盾','щит','escudo','escudo','Schild'],ration:['携行食','ration','干粮','паёк','ración','ração','Proviant'],cloth:['手当て布','bandage','绷带','бинт','venda','bandagem','Verband']
    };
    const entrances={skull:['スカル','Skull','骷髅','Череп','Calavera','Caveira','Schädel'],crystal:['クリスタル','Crystal','水晶','Кристалл','Cristal','Cristal','Kristall']};
    function dungeonName(id,locale='ja') {const index=Object.keys(words).indexOf(locale);return entrances[id]?.[index<0?1:index] || '';}
    function rememberDialogue(a,result) {
        a.connection.dialogues ||= [];
        if(!a.connection.dialogues.some(d=>d.input.id===result.input.id))a.connection.dialogues.push(copy({input:result.input,interpretations:result.interpretations,understandings:result.understandings}));
    }
    // These are grammar productions, not executable commands. The shared core
    // resolves their meanings, relations and individual references before receive.
    function language(catalog) {
        const patterns = {};
        const syntax = {
            ja: [/(?:何を|どんな仕事を)(?:手伝える|手伝えばいい|手伝おうか)/.source, /(?:一緒に)?(?:手伝って|手伝おう|手伝ってください)/.source, /(?<target>.+?)(?:へ|に)(?:歩いて|行こう|行って|向かって)(?:ね|ください)?/.source, /(?<target>.+?)を(?:作って|作ろう|建てて|建てよう|依頼して)(?:ね|ください)?/.source, /(?:帰ろう|帰って|引き返して)(?:ね|ください)?/.source],
            en: ['what (?:can|could) (?:we|you) (?:make|help with)', '(?:please )?(?:help|let us help|let’s help)', '(?:please )?(?:walk|go) to (?<target>.+)', '(?:please )?(?:make|build) (?<target>.+)', '(?:please )?(?:return|go back)'],
            'zh-CN': [/(?:我们|你)(?:可以|能)(?:帮什么|做什么)/.source, /(?:请)?(?:帮忙|一起帮忙)/.source, /(?:请)?(?:走向|去)(?<target>.+)/.source, /(?:请)?(?:制作|建造)(?<target>.+)/.source, /(?:请)?(?:返回|回去)/.source],
            ru: ['чем (?:мы|ты) (?:можем|можешь) помочь', '(?:пожалуйста,? )?(?:помоги|давай поможем)', '(?:иди|пойди) к (?<target>.+)', '(?:сделай|построй) (?<target>.+)', '(?:вернись|давай вернёмся)'],
            'es-ES': ['(?:¿)?en qué podemos ayudar', '(?:por favor,? )?(?:ayuda|vamos a ayudar)', '(?:ve|camina) a (?<target>.+)', '(?:haz|construye) (?<target>.+)', '(?:vuelve|regresa)'],
            'pt-BR': ['(?:em )?que podemos ajudar', '(?:por favor,? )?(?:ajude|vamos ajudar)', '(?:vá|ande) até (?<target>.+)', '(?:faça|construa) (?<target>.+)', '(?:volte|retorne)'],
            de: ['wobei können wir helfen', '(?:bitte )?(?:hilf|lass uns helfen)', '(?:geh|gehe) zu (?<target>.+)', '(?:mach|baue) (?<target>.+)', '(?:kehr zurück|geh zurück)']
        };
        const inflections = { ja: [/攻撃(?:する|して|しよう)/.source, /(?:かわす|かわして|かわそう)/.source, /(?:拾う|拾って|拾おう)/.source, /装備(?:する|して|しよう)/.source, /(?:使う|使って|使おう)/.source, /(?:しまう|しまって|しまおう)/.source, /(?:取り出す|取り出して|取り出そう)/.source, /地面に(?:置く|置いて|置こう)/.source] };
        const more = {
            ja:[/(?<target>.+?)(?:は|を)(?:作れる|建てられる)/.source,/(?:周りはどうなってる|何が見える)/.source,/(?<target>.+?)の(?:建築|作り方)を教わろう/.source,/自分で(?<target>.+?)を(?:建てて|建てよう)/.source,/(?<target>.+?)(?:へ|に)行ける/.source],
            en:['can (?:we|you) (?:make|build) (?<target>.+)','what can you see','learn (?:how )?to build (?<target>.+)','build (?<target>.+) yourself','can (?:we|you) go to (?<target>.+)'],
            'zh-CN':[/(?:可以|能)(?:制作|建造)(?<target>.+)/.source,/你看到了什么/.source,/学习建造(?<target>.+)/.source,/自己建造(?<target>.+)/.source,/(?:可以|能)去(?<target>.+)/.source],
            ru:['можем ли мы сделать (?<target>.+)','что ты видишь','давай научимся строить (?<target>.+)','построй (?<target>.+) самостоятельно','можем ли мы пойти в (?<target>.+)'],
            'es-ES':['(?:¿)?podemos construir (?<target>.+)','(?:¿)?qué ves','aprendamos a construir (?<target>.+)','construye (?<target>.+) por tu cuenta','(?:¿)?podemos ir a (?<target>.+)'],
            'pt-BR':['podemos construir (?<target>.+)','o que você vê','vamos aprender a construir (?<target>.+)','construa (?<target>.+) por conta própria','podemos ir a (?<target>.+)'],
            de:['können wir (?<target>.+) bauen','was siehst du','lernen wir (?<target>.+) zu bauen','baue (?<target>.+) selbst','können wir zu (?<target>.+) gehen']
        };
        const autonomy = {ja:[/(?:自分で)?歩いてみて/.source,/(?:止まって|やめて|中止して)/.source],en:['walk on your own','(?:stop|cancel)'],
            'zh-CN':[/自己走走/.source,/(?:停下|取消)/.source],ru:['иди самостоятельно','(?:остановись|отмени)'],'es-ES':['camina por tu cuenta','(?:detente|cancela)'],'pt-BR':['ande por conta própria','(?:pare|cancele)'],de:['geh selbstständig','(?:halte an|brich ab)']};
        const quoted = {ja:/「(?<meaning>[^」\n]{1,24})」(?:を)?して(?:ね|ください)?/.source,en:'(?:please )?do "(?<meaning>[^"\\n]{1,24})"',
            'zh-CN':/请做“(?<meaning>[^”\n]{1,24})”/.source,ru:'сделай "(?<meaning>[^"\\n]{1,24})"','es-ES':'haz "(?<meaning>[^"\\n]{1,24})"','pt-BR':'faça "(?<meaning>[^"\\n]{1,24})"',de:'mach "(?<meaning>[^"\\n]{1,24})"'};
        const helping={ja:/(?<target>.+?)の手伝いをして/.source,en:'help with (?<target>.+)','zh-CN':/帮忙处理(?<target>.+)/.source,ru:'помоги с (?<target>.+)','es-ES':'ayuda con (?<target>.+)','pt-BR':'ajude com (?<target>.+)',de:'hilf mit (?<target>.+)'};
        for (const [locale, forms] of Object.entries(syntax)) {
            const rule = (id, pattern, frame) => ({ id: 'adventure_' + id, pattern: '^' + pattern + '$', frame });
            const request = (meaning, aspect, target) => ({ kind: 'request', subject: 'self', meaning, aspect, ...(target ? {target:'$target'} : {}), relations: ['request'] });
            patterns[locale] = [
                rule('opportunity', forms[0], {kind:'question', subject:'self', meaning:'work', slot:'adventure_opportunity', relations:['question']}),
                rule('help', forms[1], request('work', 'adventure_help')),
                rule('go', forms[2], request('walk', 'adventure_go', true)),
                rule('make', forms[3], request('work', 'adventure_make', true)),
                rule('return', forms[4], request('walk', 'adventure_return'))
            ];
            patterns[locale].push(rule('project_question',more[locale][0],{kind:'question',subject:'self',meaning:'work',target:'$target',slot:'adventure_opportunity',relations:['question']}));
            patterns[locale].push(rule('scene',more[locale][1],{kind:'question',subject:'self',slot:'adventure_scene',relations:['question']}));
            patterns[locale].push(rule('coached',more[locale][2],request('work','adventure_coached',true)));
            patterns[locale].push(rule('self',more[locale][3],request('work','adventure_self',true)));
            patterns[locale].push(rule('destination_question',more[locale][4],{kind:'question',subject:'self',meaning:'walk',target:'$target',slot:'adventure_destination',relations:['question']}));
            patterns[locale].push(rule('explore',autonomy[locale][0],request('walk','adventure_explore')));
            patterns[locale].push(rule('stop',autonomy[locale][1],request('rest','adventure_stop')));
            patterns[locale].push(rule('quoted_action',quoted[locale],request('$meaning','adventure_action')));
            patterns[locale].push(rule('help_target',helping[locale],request('work','adventure_help',true)));
            actions.forEach((action, i) => {
                const verb = inflections[locale]?.[i] || words[locale][i];
                patterns[locale].push(rule(action+'_bare', verb + (locale==='ja'?/(?:ね|ください)?/.source:''),request(meaningFor(action),'adventure_action')));
                const body = locale === 'ja' ? /(?<target>[^、,。!?？]+?)を/.source + verb + /(?:ね|ください)?/.source
                    : verb + ' (?<target>[^,.!?？]+)';
                patterns[locale].push(rule(action, body, request(meaningFor(action), 'adventure_action', true)));
            });
            patterns[locale].sort((a,b)=>Number(['adventure_self','adventure_coached'].includes(b.id))-Number(['adventure_self','adventure_coached'].includes(a.id)));
            // Preserve older grammars and all their scope/negation protections.
            patterns[locale] = [...(catalog.patterns[locale] || []), ...patterns[locale]];
        }
        return {...catalog, experienceMeanings:{...catalog.experienceMeanings,'action:drop':Object.values(words).map(w=>w[7])}, patterns:{...catalog.patterns, ...patterns}};
    }
    function init(state, world) {
        const a = physical.ensure(state);
        navigation.adventurePlaces(world.island);
        a.connection ||= { version: 1, task: null, receipts: [] };
        world.island.bridgeOpen = a.building.bridge;
        syncGround(a,world);
        return a;
    }
    function syncGround(a,world) {
        world.island.places=world.island.places.filter(p=>!p.id.startsWith('adventure:item:'));
        for(const i of a.items.filter(i=>i.location==='ground'))world.island.places.push({id:'adventure:item:'+i.id,meaning:'adventure:item:'+i.id,...i.position});
    }
    function drop(state,world,id) {
        const a=init(state,world);
        if(a.connection.task || !physical.drop(a,world,id))return say('advCannot');
        syncGround(a,world);return say('advUsed');
    }
    function at(world, id) {
        const p = world.island.places.find(p => p.id === id);
        return !!p && Math.hypot(world.x - p.x, world.y - p.y) < 1e-6 && world.mode !== 'move';
    }
    function sources(a, world, type) {
        const place = type === 'stone' ? 'mountain' : 'forest';
        if (!at(world, 'adventure:' + place)) return;
        for (const [key, asset] of Object.entries(world.island.assets)) if (['ground', 'road'].includes(asset.type)) {
            const id = 'island:' + key + ':' + type;
            if (!a.sources.some(s => s.objectId === id)) physical.discover(a, type, place, id);
        }
    }
    function start(state, world, kind, data = {}, input = null) {
        const a = init(state, world);
        if (a.run || a.connection.task || ['eat', 'work'].includes(world.mode)) return say('advBusy');
        a.connection.task = { kind, phase: 'start', start: world.elapsed, steps: [], index: 0, remaining: 0,
            input: input ? copy(input) : null, ...data };
        if (['idle','observe'].includes(world.mode)) world.dwell = 1000000;
        return say('advStarted');
    }
    const go = id => ({ go: id });
    const work = (effect, data = {}) => ({ effect, seconds: 2, ...data });
    function plan(a, world, task) {
        if (['craft','enter','lesson'].includes(task.kind) && (world.hunger >= .6 || world.fatigue >= .55)) return [
            ...(world.hunger >= .6 ? [go('berry:1'), { life: 'eat' }] : []),
            ...(world.fatigue >= .55 ? [go('shade'), { life: 'rest' }] : []), work('replan')];
        if (task.kind === 'enter') return [go('adventure:bridge'), go('adventure:' + task.dungeon), work('enter')];
        if (task.kind === 'lesson') {
            if (a.mastery.stage === 0) return [go('master:explore'), go('adventure:forest'), work('survey'), go('adventure:mountain'), work('survey'), go('master:explore'), work('review')];
            if (a.mastery.stage === 1) return [go('master:explore'), go('adventure:forest'), work('gather', { type: 'wood' }), go('master:building'), work('deliver', { project: 'bridge' }), go('master:explore'), work('review')];
            if (a.mastery.stage === 2) return [go('master:explore'), go('shade'), { life: 'rest' }, go('master:explore'), work('review')];
            return [go('master:explore'), go('adventure:forest'), work('survey'), work('gather', { type: 'wood' }), go('master:building'), work('deliver', { project: 'bridge' }), work('decide'), go('master:explore'), work('review')];
        }
        if (task.kind === 'craft') {
            for (const [type, count] of Object.entries(physical.RECIPES[task.project])) {
                if (a.items.filter(i => i.type === type && i.location === 'project' && i.project === task.project).length >= count) continue;
                const carrying = physical.carried(a).find(i => i.type === type);
                return [...(carrying ? [] : [go('adventure:' + (type === 'stone' ? 'mountain' : 'forest')), work('gather', { type })]),
                    go(task.project === 'ration' ? 'master:cooking' : 'master:building'), work('deliver', { project: task.project }), work('replan')];
            }
            return [go(task.project === 'ration' ? 'master:cooking' : 'master:building'), { ...work('craft'), seconds: 18 }];
        }
        if (task.kind === 'storage') return [go('adventure:home'), work(task.action, { item: task.item })];
        if(task.kind==='pickup')return [go('adventure:item:'+task.item),work('pick',{item:task.item})];
        return [];
    }
    function stop(state, world) {
        const c=state?.adventure?.connection;
        if (c) {
            const active=!!c.task;c.task=null;
            if(active && world?.mode==='move') {
                walking.cancelWalking(world);
                world.mode='idle';world.destination=null;world.attention=null;world.route=[];
                world.activityStart=world.elapsed;world.reasons=[];
            }
            if(active && world && ['idle','observe'].includes(world.mode))world.dwell=0;
        }
    }
    function effect(state, world, task, step) {
        const a = state.adventure;
        if (step.effect === 'survey') physical.event(a, 'survey', { place: world.attention, at: world.elapsed, start: task.start });
        if (step.effect === 'gather') {
            const size=['wood','stone'].includes(step.type)?2:1;
            if(physical.used(a)+size>physical.capacity(a)) {
                const held=a.items.find(i=>i.location==='hand');
                if(held && physical.drop(a,world,held.id)) {syncGround(a,world);a.connection.observedDrop={source:a.events.at(-1).id,at:world.elapsed};}
            }
            sources(a, world, step.type);
            const s = a.sources.find(s => s.type === step.type && !s.collected);
            if (!s) return 'advNoMaterial';
            if (!physical.collect(a, s.type, s.place, s.objectId)) return 'advFull';
        }
        if (step.effect === 'deliver') for (const i of physical.carried(a)) if (Object.hasOwn(physical.RECIPES[step.project], i.type)) physical.deliver(a, i.id, step.project);
        if (step.effect === 'decide') {
            const target = world.hunger >= .45 ? 'berry:1' : world.fatigue >= .55 ? 'shade' : null;
            physical.event(a, 'field_decision', { target, hunger: world.hunger, fatigue: world.fatigue, at: world.elapsed });
            if (target) task.steps.splice(task.index + 1, 0, go(target), { life: target === 'shade' ? 'rest' : 'eat' });
        }
        if (step.effect === 'review') {
            const recent = a.events.filter(e => e.id > task.eventStart), stage = a.mastery.stage;
            if (stage === 0 && new Set(recent.filter(e => e.kind === 'survey').map(e => e.place)).size < 2
                || stage === 1 && !recent.some(e => e.kind === 'deliver')
                || stage === 2 && !world.experiences.some(e => e.kind === 'rest' && e.start >= task.start && e.end > e.start)
                || stage === 3 && (!recent.some(e => e.kind === 'gather') || !recent.some(e => e.kind === 'deliver') || !recent.some(e => e.kind === 'field_decision'))) return 'advCannot';
            const e = physical.event(a, ['survey', 'deliver', 'preparation', 'field_return'][stage], { at: world.elapsed, start: task.start,
                originals: recent.map(e => e.id), life: world.experiences.filter(e => e.start >= task.start).map(e => e.id) });
            physical.certify(a, e.id); return a.mastery.stage === 4 ? 'advMastery' : 'advReviewed';
        }
        if (step.effect === 'craft') {
            const coached=task.coached && task.project==='bridge' && !a.building.learned;
            if(coached)a.building.learned=true;
            const e = physical.craft(a, task.project, task.method || 'request');
            if (!e) { if(coached)a.building.learned=false; return 'advFull'; }
            e.start = task.start; e.end = world.elapsed; e.place = world.attention;
            const made=a.items.find(i=>i.source===e.id);
            if(made)a.connection.focus={item:made.id,source:e.id,place:world.attention};
            if(coached)e.coached=true;
            world.island.bridgeOpen = a.building.bridge; return 'advBuilt';
        }
        if (step.effect === 'replan') { task.steps = plan(a, world, task); task.index = -1; }
        if (step.effect === 'enter') {
            if (!physical.enter(a, task.dungeon)) return 'advCannot';
            a.connection.trainingPaused=false;
            state.context.pendingQuestion = null; delete state.context.lastOutput; perceive(state);
            world.mode = 'idle'; world.destination = null; world.attention = null; return 'advEntered';
        }
        if (['store', 'take'].includes(step.effect)) {
            if (!physical.transfer(a, step.item, step.effect === 'store' ? 'home' : physical.used(a) < physical.capacity(a) ? 'bag' : 'hand')) return 'advFull';
            if(task.coached)a.events.at(-1).guidance={master:'building',proposalInput:task.proposalInput};
            teach(state, world, a.events.at(-1), task.input, step.effect, task.locale); return 'advUsed';
        }
        if(step.effect==='pick') {
            const i=a.items.find(i=>i.id===step.item && i.location==='ground');
            if(!i || !physical.transfer(a,i.id,physical.used(a)+(['wood','stone'].includes(i.type)?2:1)<=physical.capacity(a)?'bag':'hand',world))return 'advFull';
            teach(state,world,a.events.at(-1),task.input,'pick',task.locale);
            world.attention=null;world.destination=null;world.route=[];syncGround(a,world);return 'advPicked';
        }
        return null;
    }
    // Runs after actual world tick/arrival handling. No teleport or retrospective success.
    function tick(state, world, dt, holding, event) {
        const a = init(state, world), task = a.connection.task;
        if (event?.kind === 'experience' && ['eat', 'rest'].includes(event.activity)) physical.care(a, event);
        if (!task || holding || a.run) return null;
        if (task.phase === 'start') { task.eventStart = a.serial; task.steps = plan(a, world, task); task.phase = 'steps'; }
        const step = task.steps[task.index];
        if (!step) { stop(state,world); return null; }
        if (step.go) {
            if (['eat','work'].includes(world.mode)) return null;
            const attending = world.attention === step.go || step.go === 'berry:1' && world.attention?.startsWith('berry:');
            if (at(world, step.go) && attending) { task.index++; return null; }
            if (world.mode !== 'move' || world.destination !== step.go) if (!life.approach(world, step.go, 'pointing')) { stop(state,world); return say('advCannot'); }
            return null;
        }
        if (step.life) {
            if (event?.kind === 'experience' && event.activity === step.life && event.start >= task.start) task.index++;
            return null;
        }
        world.dwell = 1000000;
        task.remaining += Math.min(.1, Math.max(0, dt));
        if (task.remaining < step.seconds) return null;
        task.remaining = 0;
        const message = effect(state, world, task, step); task.index++;
        if (message || !task.steps[task.index]) stop(state,world);
        if (!a.connection.task && !a.run) { world.mode = 'idle'; if(!world.attention?.startsWith('master:'))world.attention = null; world.dwell = 3; }
        const observed=a.connection.observedDrop;
        return message ? {...say(message),...(task.kind==='storage' && task.coached && message==='advUsed' ? {teaching:task.action,mentor:'master:building'}:{}),...(task.kind==='pickup' && task.recovery && message==='advPicked'?{teaching:'pick'}:{})}
            : observed?.at===world.elapsed ? {...say('advDropped'),teaching:'drop'} : null;
    }
    const rules = teachable.map(action => ({ id: meaningFor(action), source: 'experienced_adventure', requireScope: true,
        resolve(e) {
            const t = e.adventureTeaching;
            if (e.kind !== 'experience' || e.activity !== 'action:' + action || !t || t.action !== action
                || !/^input:[1-9]\d*$/.test(t.input?.id) || !mentor(t.input) || typeof t.input.raw !== 'string'
                || parse(t.input.raw, t.locale) !== action || !Number.isSafeInteger(e.adventureSource)) return null;
            return { action, inputId: t.input.id, label: t.input.raw, locale: t.locale, physicalSource: e.adventureSource };
        } }));
    function teach(state, world, original, input, action, locale = 'ja') {
        const a = state.adventure;
        if (!mentor(input) || !teachable.includes(action) || parse(input.raw, locale) !== action || !original
            || a.connection.receipts.some(r => r.input.id === input.id)) return null;
        const receipt = { input: copy(input), locale, action, physicalSource: original.id, original: copy(original) };
        a.connection.receipts.push(receipt);
        const e = { id: ++world.event, kind: 'experience', activity: 'action:' + action, target: a.run ? 'dungeon:' + a.run.dungeon + ':' + a.run.floor : 'island',
            start: world.elapsed, end: world.elapsed, adventureSource: original.id, adventureTeaching: copy(receipt) };
        world.experiences.push(copy(e)); state.experiences ||= []; state.experiences.push(copy(e));
        return core.learnExperience(state, e.id, rules);
    }
    function itemFor(a, action, preferred) {
        if (preferred) return preferred;
        if (action === 'equip') return a.items.find(i => ['bag', 'hand'].includes(i.location) && ['stick', 'shield', 'bag'].includes(i.type)
            && (i.type !== 'stick' || i.location !== 'hand'))?.id;
        if (action === 'use') return a.items.find(i => ['bag', 'hand'].includes(i.location) && i.type === (a.damage ? 'cloth' : 'ration'))?.id;
        if (action === 'pick') return a.items.find(i => i.location === 'floor' && i.dungeon === a.run?.dungeon && i.floor === a.run?.floor && same(i.position, a.run.position))?.id;
        return null;
    }
    function equipTransfer(a,e) {
        return e?.kind==='transfer' && a.items.some(i=>i.id===e.item && (i.type==='stick' && e.after==='hand'
            || ['bag','shield'].includes(i.type) && e.after==='body'));
    }
    function hand(state, world, action, target = null, input = null, locale = 'ja') {
        const a = state.adventure;
        if (!a?.run) return say('advCannot');
        if (action === 'return') { a.run.retreating=true; if(same(a.run.position,a.run.entry))action='up'; }
        const oldCompleted = a.training.completed;
        const result = physical.step(a, world, action, itemFor(a, action, target) || target, input?.id);
        if (!result) return say('advCannot');
        if (result.kind === 'action' && teachable.includes(action)) teach(state, world, result, input, action, locale);
        const reviewed = physical.reviewTraining(a);
        if (reviewed && a.run.floor === 4) a.run.retreating = false;
        state.context.pendingQuestion = null; delete state.context.lastOutput;
        if (!a.run) {
            delete a.connection.goal;
            world.mode = 'idle'; world.attention = null; world.destination = null; world.dwell = 0;
            world.activityStart = world.elapsed; world.reasons = []; world.route = [];
            return say(a.training.completed && !oldCompleted ? 'advGraduated'
                : a.events.at(-1)?.reason === 'walked_out' ? 'advReturned' : a.events.at(-1)?.reason === 'master_safety' ? 'advSafety' : 'advRescued');
        }
        if (reviewed) return say('advTraining');
        return say(result.damage > result.damageBefore ? 'advHurt' : a.run.enemy.phase === 'ready' ? 'advReady'
            : ({ observe: 'advObserved', attack: 'advHit', avoid: 'advAvoided', use: 'advUsed', equip: 'advEquipped', pick: 'advPicked' })[action] || 'advMoved');
    }
    function opportunity(state, world, project = null) {
        const a = state.adventure;
        if (world.attention === 'master:explore' && at(world, 'master:explore'))
            return a.mastery.stage < 4 ? {kind:'lesson',master:'explore'} : {kind:'enter',dungeon:'skull',master:'explore'};
        if (world.attention === 'master:building' && at(world,'master:building')) {
            if(!project && a.building.home && a.items.some(i=>i.location==='home'))return {kind:'storage',action:'take',master:'building',coached:true};
            if(!project && a.building.home && ['bag','stick','shield','cloth'].every(type=>a.items.some(i=>i.type===type && ['hand','body','bag'].includes(i.location))))
                return {kind:'storage',action:a.items.some(i=>i.location==='home')?'take':'store',master:'building',coached:true};
            project ||= !a.building.bridge ? 'bridge' : ['bag','stick','shield','cloth'].find(type =>
                !a.items.some(i => i.type === type && ['hand','body','bag'].includes(i.location))) || 'home';
            return {kind:'craft', project, method:'request',master:'building'};
        }
        if (world.attention === 'master:cooking' && at(world,'master:cooking')) return {kind:'craft',project:'ration',master:'cooking'};
        return null;
    }
    function offer(state, world, input, project = null, destination = null) {
        const p = destination && at(world,'master:explore') && state.adventure.mastery.stage===4
            ? {kind:'enter',dungeon:destination,master:'explore'} : opportunity(state,world,project);
        if (!p) return say('advCannot');
        state.adventure.connection.proposal = {...p,input:copy(input),at:world.elapsed};
        state.adventure.connection.offers ||= [];
        state.adventure.connection.offers.push({inputId:input.id,at:world.elapsed,proposal:copy(p)});
        world.dwell=Math.max(world.dwell,12);
        perceive(state,world);
        return {...say('advOffered'),npc:'advOffer_' + (p.dungeon==='crystal'?'crystal':p.project || p.kind),master:p.master,inline:true};
    }
    function receive(state, world, result, locale = 'ja', labelOnly = false) {
        const a = init(state,world), u = result.understandings?.[0], frame = result.interpretations?.[0];
        if(!labelOnly && result.input.speaker==='player') {
            delete a.connection.goal;
            if(a.run?.training)a.connection.trainingPaused=true;
        }
        if (result.identityReply || result.processing?.omitted.length || result.understandings.length !== 1) return null;
        // A bare action label can describe a just-completed act. It cannot order
        // an unknown action, select an object, or advance another physical hand.
        const label = parse(result.input.raw,locale);
        const observed=a.connection.observedDrop;
        const recentDrop=label==='drop' && observed && world.elapsed-observed.at<=12 && a.events.find(e=>e.id===observed.source && e.kind==='drop' && same(e.position,world));
        const last = recentDrop || (a.run?.last ? a.events.find(e=>e.id===a.run.last) : a.events.at(-1));
        if (teachable.includes(label) && (labelOnly || !state.knowledge.meanings.some(m=>m.id===meaningFor(label)))) {
            const matches = last?.kind === 'action' && last.action === label || label === 'use' && last?.kind === 'use'
                || label === 'equip' && equipTransfer(a,last) || label==='drop' && last?.kind==='drop' || last?.kind==='transfer' && (label==='pick' && last.before==='ground' || label==='store' && last.after==='home' || label==='take' && last.before==='home');
            if (matches) {if(result.processing)core.consumeProcessing(world,result.processing);result.adventureLearning=teach(state,world,last,result.input,label,locale);return say('advUsed');}
        }
        const walkingInvitation=!!a.run && frame?.catalogRule==='walk_invitation' && u?.kind==='invitation';
        const relevant = walkingInvitation || frame?.aspect?.startsWith('adventure_') || ['adventure_opportunity','adventure_scene','adventure_destination'].includes(u?.questionSlot);
        if (!relevant) {
            // Shared conversation remains available, but island locomotion and
            // care proposals must not operate on the off-screen island world.
            if(a.run && ['request','invitation','conditional_proposal','sequential_proposal'].includes(u?.kind)) {
                if(result.processing)core.consumeProcessing(world,result.processing);
                return say(u.complete?'advCannot':'advUnknown');
            }
            return null;
        }
        rememberDialogue(a,result);
        if (result.processing) core.consumeProcessing(world,result.processing);
        // The player may ask a fluent mentor about a project whose name this
        // child does not yet know. That only elicits a situated proposal: it
        // grants no word, starts no work and never repairs this understanding.
        if(u.questionSlot==='adventure_opportunity' && frame.target && u.polarity==='positive') {
            const names=Object.entries(projects).filter(([,names])=>names.some(name=>normalize(name)===normalize(frame.target)));
            if(names.length===1)return offer(state,world,result.input,names[0][0]);
        }
        if(u.questionSlot==='adventure_destination' && frame.target && u.polarity==='positive') {
            const found=Object.entries(entrances).filter(([,names])=>names.some(name=>normalize(name)===normalize(frame.target)));
            if(found.length===1)return offer(state,world,result.input,null,found[0][0]);
        }
        // Never salvage a keyword from an incomplete, negated, conditional,
        // past, other-person, or multi-clause interpretation.
        if (!u.complete || u.polarity !== 'positive' || u.subject !== 'self' && !walkingInvitation || u.conditionStatus
            || !['unspecified','now'].includes(u.eventTime)) return say('advUnknown');
        if (u.questionSlot === 'adventure_opportunity') return a.run ? say('advCannot') : offer(state,world,result.input);
        if (u.questionSlot === 'adventure_scene') return a.run ? hand(state,world,'observe',null,result.input,locale) : say('advCannot');
        if(u.kind==='request' && u.aspect==='adventure_stop') {
            if(!a.run && !a.connection.task && !a.connection.goal && !a.connection.proposal)return say('advCannot');
            stop(state,world);delete a.connection.goal;delete a.connection.proposal;
            if(!a.run && world.mode==='idle')world.dwell=3;
            if(a.run?.training)a.connection.trainingPaused=true;
            return say('advStopped');
        }
        if (u.kind !== 'request' && !walkingInvitation || a.connection.task) return say(a.connection.task ? 'advBusy':'advUnknown');
        const target = u.target?.adopted?.id;
        const input = result.input;
        if (u.known.meaning === 'work') {
            if(a.run?.training && a.connection.trainingPaused) {a.connection.trainingPaused=false;return say('advStarted');}
            if (a.run) return say('advCannot');
            let p = a.connection.proposal;
            if (!p || !at(world,'master:'+p.master)) return offer(state,world,input);
            if(u.aspect==='adventure_make' && p.kind!=='craft')return say('advUnknown');
            if(p.kind==='storage') {
                const items=a.items.filter(i=>p.action==='store'?['hand','bag'].includes(i.location):i.location==='home');
                const selected=target?items.filter(i=>i.id===target):items;
                if(selected.length!==1)return say('advUnknown');
                p={...p,item:selected[0].id,proposalInput:p.input.id};
            } else if (target && target !== 'adventure:plan:'+(p.project || p.kind)) return say('advUnknown');
            p = {...p}; delete p.input;delete p.at;delete p.master;
            if(u.aspect==='adventure_self') {
                if(p.project!=='bridge' || !a.building.learned)return say('advNeedBuilding');
                p.method='self';
            }
            if(u.aspect==='adventure_coached') {
                if(p.project!=='bridge')return say('advCannot');
                p.method='self';p.coached=true;
            }
            delete a.connection.proposal;
            if (p.kind === 'enter') {
                if(a.mastery.stage<4)return say('advNeedMastery');
                if(!a.building.bridge)return say('advNeedBridge');
            }
            if(p.kind==='craft' && a.building[p.project]===true)return say('advBuilt');
            return start(state,world,p.kind,p,input);
        }
        if (u.known.meaning === 'walk') {
            if (a.run) {
                if(!a.run.training && u.aspect!=='adventure_return' && (world.fatigue>=.7 || world.hunger>=.75 || a.damage>=physical.limit(a)-1)) {
                    a.connection.goal={action:'return',dungeon:a.run.dungeon,floor:a.run.floor,input:copy(input)};
                    const reply=hand(state,world,'return',null,input,locale);return reply.message==='advMoved'?say('advRetreatReason'):reply;
                }
                if(u.aspect==='adventure_explore' || walkingInvitation) {a.connection.goal={action:'explore',dungeon:a.run.dungeon,floor:a.run.floor,input:copy(input)};return say('advStarted');}
                if (u.aspect === 'adventure_return') {a.connection.goal={action:'return',dungeon:a.run.dungeon,floor:a.run.floor,input:copy(input)};return hand(state,world,'return',null,input,locale);}
                const r=a.run;
                const point=target==='stairs:up:'+r.floor ? r.entry : target==='stairs:down:'+r.floor ? r.exit : null;
                if (!point)return say('advUnknown');
                a.connection.goal={action:'walk',target:copy(point),after:target.startsWith('stairs:up:')?'up':'down',dungeon:r.dungeon,floor:r.floor,input:copy(input)};
                return say('advStarted');
            }
            const p=a.connection.proposal;
            if(p?.kind==='enter' && at(world,'master:'+p.master) && (!target || target==='adventure:plan:enter')) {
                if(!a.building.bridge)return say('advNeedBridge');
                delete a.connection.proposal;return start(state,world,'enter',{dungeon:p.dungeon},input);
            }
            const destination = world.island.places.find(p=>p.id===target);
            if (!destination) return say('advUnknown');
            if(['adventure:skull','adventure:crystal'].includes(destination.id)) {
                if(a.mastery.stage<4)return say('advNeedMastery');if(!a.building.bridge)return say('advNeedBridge');
                return start(state,world,'enter',{dungeon:destination.id.slice(10)},input);
            }
            return say(life.approach(world,destination.id,'request')?'advStarted':'advCannot');
        }
        const action=actions.find(action=>meaningFor(action)===u.known.meaning);
        if (!action)return say('advUnknown');
        if(a.run && (world.fatigue>=.7 || world.hunger>=.75 || a.damage>=physical.limit(a)-1)) {
            a.connection.goal={action:'return',dungeon:a.run.dungeon,floor:a.run.floor,input:copy(input)};
            const reply=hand(state,world,'return',null,input,locale);
            return reply.message==='advMoved'?say('advRetreatReason'):reply;
        }
        const eligible = a.items.filter(i=> ['store','drop'].includes(action) ? ['hand','bag'].includes(i.location)
            : action==='take' ? i.location==='home' : action==='pick' ? (!a.run && i.location==='ground' || a.run && i.location==='floor' && i.dungeon===a.run.dungeon && i.floor===a.run.floor && same(i.position,a.run.position))
            : ['hand','bag'].includes(i.location) && (action==='equip' ? ['bag','stick','shield'].includes(i.type) : ['ration','cloth'].includes(i.type)));
        const selected=target ? eligible.filter(i=>i.id===target) : action==='pick' && !a.run ? eligible.filter(i=>same(i.position,world)) : eligible;
        if (['attack','avoid'].includes(action)) {
            if (!a.run || target && target!=='opponent:'+a.run.dungeon+':'+a.run.floor)return say('advUnknown');
            if(action==='attack' && a.run.enemy.phase==='ready' && near(a.run.position,a.run.enemy)
                && a.events.some(e=>e.kind==='action' && e.action==='avoid')) {
                delete a.connection.goal;const reply=hand(state,world,'avoid',null,input,locale);
                return reply.message==='advAvoided'?say('advAvoidReason'):reply;
            }
            delete a.connection.goal;return hand(state,world,action,null,input,locale);
        }
        if (selected.length!==1)return say('advUnknown');
        const item=selected[0];delete a.connection.goal;
        if(action==='drop')return drop(state,world,item.id);
        if(a.run)return hand(state,world,action,item.id,input,locale);
        if(action==='pick')return start(state,world,'pickup',{item:item.id,locale},input);
        if(['store','take'].includes(action))return a.building.home ? start(state,world,'storage',{item:item.id,action,locale},input):say('advCannot');
        if(action==='use')return say(physical.use(a,world,item.id)?'advUsed':'advCannot');
        return say(physical.transfer(a,item.id,item.type==='stick'?'hand':'body')?'advEquipped':'advCannot');
    }
    function adjacent(run) {
        return [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy]) => ({ x: run.enemy.x + dx, y: run.enemy.y + dy }))
            .filter(p => run.grid[p.y]?.[p.x] === '.').sort((a, b) => Math.abs(a.x - run.position.x) + Math.abs(a.y - run.position.y) - Math.abs(b.x - run.position.x) - Math.abs(b.y - run.position.y))[0];
    }
    function trainingChoice(a, world) {
        const r = a.run, f = r.floor;
        if (r.lesson) return f === 5 || r.retreating ? { action: same(r.position, r.entry) ? 'up' : 'return' }
            : same(r.position, r.exit) ? { action: 'down' } : { action: 'walk', target: r.exit };
        const start = [...a.events].reverse().find(e => e.kind === 'enter' && e.training)?.id;
        const did = action => a.events.some(e => e.id > start && e.floor === f && e.kind === 'action' && e.action === action);
        if (!r.enemy.observed) return { action: 'observe' };
        if (f === 1) return { action: 'walk' };
        if (f === 3) {
            for (const type of ['shield', 'stick']) {
                const i = a.items.find(i => i.loan && i.type === type && i.location === 'bag');
                if (i) return { action: 'equip', target: i.id };
            }
            for (const type of ['ration', 'cloth']) {
                const i = a.items.find(i => i.loan && i.type === type && i.location === 'bag');
                if (i && (type === 'cloth' ? a.damage > 0 : world.hunger > 0)) return { action: 'use', target: i.id };
            }
            if (!a.events.some(e => e.id > start && e.floor === 3 && e.damage > e.damageBefore) && near(r.position, r.enemy)) return { action: 'observe' };
        }
        if (f === 4) return did('walk') && (a.damage > 0 || world.fatigue >= .55 || world.hunger >= .45) ? { action: 'return' }
            : near(r.position, r.enemy) ? { action: 'observe' } : { action: 'walk', target: adjacent(r) };
        if (f === 5) return { action: did('walk') ? 'return' : 'walk' };
        if (r.enemy.phase === 'ready' && near(r.position, r.enemy) && (f !== 2 || !did('avoid'))) return { action: 'avoid' };
        if (!r.enemy.defeated && near(r.position, r.enemy)) return { action: 'attack' };
        return { action: 'walk', target: r.enemy.defeated ? r.exit : adjacent(r) };
    }
    function choice(state, world) {
        const a = state.adventure;
        const g=a?.connection.goal,r=a?.run;
        if(r?.training && a.connection.trainingPaused && !g)return null;
        if(r && !r.training && (world.fatigue>=.7 || world.hunger>=.75 || a.damage>=physical.limit(a)-1))
            return {...physical.decide(a,world),reason:'body',input:g?.input || null};
        if(g && (!r || g.dungeon!==r.dungeon || g.action==='walk' && g.floor!==r.floor))delete a.connection.goal;
        else if(g) {
            if(g.action==='explore')return {...physical.decide(a,world),input:g.input};
            if(g.action==='return')return {action:same(r.position,r.entry)?'up':'return',input:g.input};
            if(same(r.position,g.target)){delete a.connection.goal;return {action:g.after,input:g.input};}
            return {action:'walk',target:g.target,input:g.input};
        }
        return a?.run?.training ? trainingChoice(a, world) : a?.run ? physical.decide(a, world) : null;
    }
    const conversations = {
        ja:['何を手伝える？','一緒に手伝おう'], en:['what can we help with?','let us help'],
        'zh-CN':['我们可以帮什么？','一起帮忙'],ru:['чем мы можем помочь?','давай поможем'],
        'es-ES':['¿en qué podemos ayudar?','vamos a ayudar'],'pt-BR':['em que podemos ajudar?','vamos ajudar'],de:['wobei können wir helfen?','lass uns helfen']
    };
    function autoConversation(state,world,locale='ja') {
        const a=state.adventure;
        if(!a || a.run || a.connection.task)return null;
        if(!state.knowledge.meanings.some(m=>m.id==='work'))return at(world,'master:explore')
            ? {kind:'watch',target:'master:explore'} : {kind:'move',target:'master:explore'};
        const ground=a.items.find(i=>i.location==='ground' && !['wood','stone','berry'].includes(i.type));
        if(ground && physical.used(a)<physical.capacity(a))
            return at(world,'adventure:item:'+ground.id) ? {kind:'recover',target:ground.id} : {kind:'move',target:'adventure:item:'+ground.id};
        const unequipped=a.items.filter(i=>['hand','bag'].includes(i.location) && ['stick','shield','bag'].includes(i.type) && !(i.type==='stick' && i.location==='hand'));
        if(unequipped.length===1 && state.knowledge.meanings.some(m=>m.id==='action:equip'))return {kind:'say',text:(words[locale]||words.en)[3]};
        let target=a.mastery.stage<4 ? 'master:explore' : !a.building.bridge ? 'master:building' : 'master:explore';
        if(a.training.completed) {
            const missing=['bag','stick','shield','cloth','ration'].find(type=>!a.items.some(i=>i.type===type && ['hand','bag','body'].includes(i.location)));
            if(missing)target=missing==='ration'?'master:cooking':'master:building';
        }
        if(!at(world,target))return {kind:'move',target};
        const p=a.connection.proposal;
        const text=(conversations[locale]||conversations.en)[p && p.master===target.slice(7)?1:0];
        return {kind:'say',text};
    }
    function recover(state,world,item) {
        const a=state.adventure,original=a?.events.find(e=>e.kind==='drop' && e.item===item);
        if(!original || !at(world,'adventure:item:'+item) || !a.items.some(i=>i.id===item && i.location==='ground'))return say('advCannot');
        return start(state,world,'pickup',{item,recovery:original.id});
    }
    function perceive(state, world) {
        const r = state.adventure?.run;
        if (!r) {
            const p=state.adventure?.connection.proposal;
            if(world && p && at(world,'master:'+p.master)) {
                core.perceive(state,{scene:'master:'+p.master,attention:[{id:'adventure:plan:'+(p.project||p.kind),meaning:'adventure:plan'}]});return true;
            }
            const f=state.adventure?.connection.focus,item=f && state.adventure.items.find(i=>i.id===f.item && ['hand','body','bag'].includes(i.location));
            if(!world || !item || !at(world,f.place))return false;
            core.perceive(state,{scene:f.place,attention:[{id:item.id,meaning:'adventure:item:'+item.type}]});return true;
        }
        const e=state.adventure.events.find(e=>e.id===r.last);
        const transfer=['equip','pick'].includes(e?.action) && state.adventure.events.find(t=>t.id===e.id-1 && t.kind==='transfer');
        const item=state.adventure.items.find(i=>i.id===(e?.effect?.item || transfer?.item));
        if(item) {core.perceive(state,{scene:'dungeon:'+r.dungeon+':'+r.floor,attention:[{id:item.id,meaning:'adventure:item:'+item.type}]});return true;}
        const visible=[
            { id: 'opponent:' + r.dungeon + ':' + r.floor, meaning: 'adventure:enemy', x: r.enemy.x, y: r.enemy.y },
            { id: 'stairs:up:' + r.floor, meaning: 'adventure:entry', ...r.entry },
            { id: 'stairs:down:' + r.floor, meaning: 'adventure:exit', ...r.exit }
        ];
        const focus=r.retreating || e?.action==='return' ? 1 : r.lesson || r.enemy.defeated ? 2 : 0;
        core.perceive(state, {scene:'dungeon:'+r.dungeon+':'+r.floor,attention:[visible[focus]]});return true;
    }
    function validate(state, world) {
        const a = state.adventure;
        if (!physical.valid(a)) return false;
        if (!a) return !world.island?.bridgeOpen && !state.knowledge.meanings.some(m=>m.source==='experienced_adventure')
            && !(state.experiences||[]).some(e=>e.adventureSource!==undefined);
        const c = a.connection;
        if (!c || c.version !== 1 || !Array.isArray(c.receipts) || world.island?.bridgeOpen !== a.building.bridge || !core.validExperienceLearning(state, rules)) return false;
        if(c.trainingPaused!==undefined && typeof c.trainingPaused!=='boolean')return false;
        if(c.proposal && (!['lesson','craft','enter','storage'].includes(c.proposal.kind) || !['explore','building','cooking'].includes(c.proposal.master)
            || c.proposal.kind==='craft' && !Object.hasOwn(physical.RECIPES,c.proposal.project)
            || c.proposal.kind==='enter' && !['skull','crystal'].includes(c.proposal.dungeon)
            || c.proposal.kind==='storage' && !['store','take'].includes(c.proposal.action)
            || !Number.isFinite(c.proposal.at) || c.proposal.at>world.elapsed
            || !c.dialogues?.some(r=>JSON.stringify(r.input)===JSON.stringify(c.proposal.input) && (r.understandings[0]?.complete || ['adventure_opportunity','adventure_destination'].includes(r.interpretations[0]?.slot)))))return false;
        if(c.proposal && !c.offers?.some(o=>o.inputId===c.proposal.input.id && o.at===c.proposal.at
            && JSON.stringify(o.proposal)===JSON.stringify(Object.fromEntries(Object.entries(c.proposal).filter(([k])=>!['input','at'].includes(k))))))return false;
        if(c.offers && (!Array.isArray(c.offers) || !c.offers.every(o=>Number.isFinite(o.at) && o.at<=world.elapsed
            && c.dialogues?.some(d=>d.input.id===o.inputId) && ['lesson','craft','enter','storage'].includes(o.proposal?.kind)
            && ['explore','building','cooking'].includes(o.proposal.master)
            && (o.proposal.kind!=='craft'||Object.hasOwn(physical.RECIPES,o.proposal.project))
            && (o.proposal.kind!=='enter'||['skull','crystal'].includes(o.proposal.dungeon))
            && (o.proposal.kind!=='storage'||['store','take'].includes(o.proposal.action)))))return false;
        if(c.goal && (!['walk','return','explore'].includes(c.goal.action) || !['skull','crystal'].includes(c.goal.dungeon)
            || !Number.isInteger(c.goal.floor) || c.goal.floor<1 || c.goal.floor>5
            || !c.dialogues?.some(r=>JSON.stringify(r.input)===JSON.stringify(c.goal.input) && r.understandings[0]?.complete)
            || c.goal.action==='walk' && (!['up','down'].includes(c.goal.after) || !Number.isInteger(c.goal.target?.x) || !Number.isInteger(c.goal.target?.y))))return false;
        if(c.goal?.action==='walk') {
            const room=a.run?.floor===c.goal.floor ? a.run : a.run?.rooms?.[c.goal.floor];
            const d=c.dialogues.find(d=>d.input.id===c.goal.input.id)?.understandings[0];
            if(!room || !same(c.goal.target,c.goal.after==='up'?room.entry:room.exit)
                || d?.target?.adopted?.id!=='stairs:'+c.goal.after+':'+c.goal.floor)return false;
        }
        if(c.dialogues && (!Array.isArray(c.dialogues) || new Set(c.dialogues.map(d=>d.input?.id)).size!==c.dialogues.length
            || !c.dialogues.every(d=>/^input:[1-9]\d*$/.test(d.input?.id) && Number(d.input.id.slice(6))<=state.serial
                && typeof d.input.raw==='string' && d.input.raw.length<=1000 && Number.isFinite(d.input.at)
                && Object.hasOwn(words,d.input.locale) && mentor(d.input) && typeof d.input.scene==='string'
                && d.interpretations?.length===1 && d.understandings?.length===1)))return false;
        if(c.focus && (!a.items.some(i=>i.id===c.focus.item && i.source===c.focus.source)
            || !a.events.some(e=>e.id===c.focus.source && e.kind==='craft' && e.place===c.focus.place)))return false;
        if(c.observedDrop && (!Number.isFinite(c.observedDrop.at) || c.observedDrop.at>world.elapsed
            || !a.events.some(e=>e.id===c.observedDrop.source && e.kind==='drop')))return false;
        const ground=a.items.filter(i=>i.location==='ground'), places=world.island.places.filter(p=>p.id.startsWith('adventure:item:'));
        if(ground.length!==places.length || !ground.every(i=>places.some(p=>p.id==='adventure:item:'+i.id && same(p,i.position))
            && a.events.some(e=>e.kind==='drop' && e.item===i.id && same(e.position,i.position))))return false;
        if (new Set(c.receipts.map(r=>r.input?.id)).size !== c.receipts.length) return false;
        if (!c.receipts.every(r => r && teachable.includes(r.action) && parse(r.input?.raw || '', r.locale) === r.action
            && r.input.locale === r.locale && Object.hasOwn(words,r.locale) && mentor(r.input) && Number.isFinite(r.input.at)
            && Number(r.input.id.slice(6)) <= state.serial
            && (r.input.speaker!=='master:building' || r.original?.guidance?.master==='building'
                && c.dialogues?.some(d=>d.input.id===r.original.guidance.proposalInput))
            && (r.input.speaker!=='master:explore' || r.original?.training===true)
            && (r.original?.kind === 'action' && r.original.action === r.action
                || r.action === 'use' && r.original?.kind === 'use' || r.action==='drop' && r.original?.kind==='drop'
                || r.original?.kind === 'transfer' && (r.action === 'store' && r.original.after === 'home'
                    || r.action === 'take' && r.original.before === 'home'
                    || r.action === 'pick' && r.original.before === 'ground'
                    || r.action === 'equip' && equipTransfer(a,r.original)))
            && a.events.some(e => e.id === r.physicalSource && JSON.stringify(e) === JSON.stringify(r.original))
            && world.experiences.some(e => e.adventureSource === r.physicalSource && e.adventureTeaching?.input?.id === r.input.id
                && state.experiences?.some(s => JSON.stringify(s) === JSON.stringify(e))))) return false;
        if ((state.experiences || []).some(e => e.adventureSource !== undefined && !c.receipts.some(r => r.physicalSource === e.adventureSource && r.input.id === e.adventureTeaching?.input?.id))) return false;
        if (a.mastery.evidence.some((id, index) => {
            const e = a.events.find(e => e.id === id);
            return e.kind !== ['survey', 'deliver', 'preparation', 'field_return'][index] || !Number.isFinite(e.start) || !Number.isFinite(e.at)
                || e.at <= e.start || !Array.isArray(e.originals) || !e.originals.every(id => a.events.some(o => o.id === id && o.id < e.id));
        })) return false;
        if (['bridge', 'home'].some(p => a.building[p] && !a.events.some(e => e.kind === 'craft' && e.project === p && e.end > e.start))) return false;
        if (a.careEvents.some(id => !world.experiences.some(e => e.id === id && ['eat','rest'].includes(e.kind) && e.end > e.start
            && state.experiences?.some(s => s.id === id && s.kind === 'experience' && s.activity === e.kind && s.start === e.start && s.end === e.end)))) return false;
        if (a.training.completed && (!a.events.some(e => e.kind === 'training_complete') || a.training.evidence.length !== 5)) return false;
        if (a.run?.training) {
            const personal=a.training.personal;
            if (!Array.isArray(personal) || new Set(personal.map(i=>i.id)).size !== personal.length
                || !personal.every(p=>['hand','body','bag'].includes(p.location) && a.items.some(i=>i.id===p.id && i.location==='training_hold'))
                || a.items.some(i=>i.location==='training_hold' && !personal.some(p=>p.id===i.id))) return false;
        } else if (a.training.personal !== undefined || a.items.some(i=>i.location==='training_hold')) return false;
        if (a.events.filter(e => e.kind === 'rescue').length !== a.recoveries.length || !a.recoveries.every(r => a.events.some(e => e.id === r.event
            && e.kind === 'rescue' && e.dungeon === r.dungeon && e.floor === r.floor))) return false;
        const consumed = new Set();
        for (const e of a.events.filter(e => e.kind === 'craft')) {
            const recipe = physical.RECIPES[e.project];
            if (!recipe || !Array.isArray(e.materials) || new Set(e.materials).size !== e.materials.length) return false;
            if (e.materials.some(id => consumed.has(id))) return false;
            for (const [type,count] of Object.entries(recipe)) if (e.materials.filter(id => a.items.some(i => i.id === id && i.type === type && i.location === 'consumed')).length !== count) return false;
            if (e.materials.length !== Object.values(recipe).reduce((n,x)=>n+x,0)) return false;
            e.materials.forEach(id=>consumed.add(id));
        }
        if (a.building.learned && !a.events.some(e => e.kind === 'craft' && e.project === 'bridge' && e.end > e.start)) return false;
        if (c.task !== null && (!c.task || !['lesson', 'craft', 'enter', 'storage','pickup'].includes(c.task.kind)
            || !['start', 'steps'].includes(c.task.phase) || !Array.isArray(c.task.steps) || !Number.isInteger(c.task.index)
            || c.task.index < 0 || !Number.isFinite(c.task.remaining) || c.task.remaining < 0 || c.task.start > world.elapsed
            || c.task.steps.some(s => !s || s.go && !world.island.places.some(p => p.id === s.go)
                || s.life && !['eat','rest'].includes(s.life) || s.effect && !['survey','gather','deliver','decide','review','craft','replan','enter','store','take','pick'].includes(s.effect))
            || c.task.kind === 'craft' && !Object.hasOwn(physical.RECIPES,c.task.project)
            || c.task.kind === 'enter' && !['skull','crystal'].includes(c.task.dungeon))) return false;
        if(c.task?.recovery && !a.events.some(e=>e.id===c.task.recovery && e.kind==='drop' && e.item===c.task.item))return false;
        return true;
    }
    function valid(state, world) { try { return validate(state,world); } catch (_) { return false; } }
    return { init, start, stop, drop, tick, receive, hand, choice, autoConversation, recover, perceive, valid, rules, words, walkLabels, parse, actions, teachable, meaningFor, language, dungeonName };
});
