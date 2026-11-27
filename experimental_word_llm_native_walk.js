(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_llm_native_perception'):root.NativePerception,typeof module==='object'&&module.exports?require('./experimental_word_llm_native_calendar'):root.NativeCalendar);if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeWalk=api;})(typeof globalThis!=='undefined'?globalThis:this,function(perception,calendar){
    'use strict';
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    const movementKinds=['walk_start','walk','walk_failed','walk_interrupted'];
    function install(g){if(!g.walk)g.walk={version:1,confirmed:null,encounter:null,met:false};return g.walk;}
    const stayMs=30*60*1000;
    const nature=id=>/^chip:(?:mountain_|palms_)/.test(id);
    const forest=id=>typeof id==='string'&&id.startsWith('chip:palms_');
    // New outdoor people use this same search pipeline; register their public aliases,
    // habitat, availability gate and private arrival-time location here.
    const searchPeople={
        adventurer:{name:'冒険家',names:/冒険家|冒险家|adventurer|aventurero|aventureiro|abenteurer|искател|путешественник/iu,kinds:['forest','mountain'],available:()=>true,supplied:()=>true,location:g=>g.walk?.roaming?.target},
        building:{name:'建築士',names:/建築士|建築家|建筑师|строител|архитектор|\b(?:builder|architect|constructor|construtor|arquitecto|arquiteto)\b|baumeister|architekt/iu,kinds:['forest'],available:g=>!!g.walk?.builder,supplied:p=>!!p.practice?.introduction,location:g=>g.walk?.builder?.target,npc:'building'}
    };
    const searchTerrain={forest:/森|林|forest|bosque|floresta|wald|wäld|лес/iu,mountain:/山|mountain|montaña|montanha|berg|гор/iu};
    function searchPerson(input){if(typeof input!=='string')return null;const matches=Object.keys(searchPeople).filter(id=>searchPeople[id].names.test(input.normalize('NFKC')));return matches.length===1?matches[0]:null;}
    function searchOptions(packet){return Object.entries(searchPeople).filter(([,p])=>p.supplied(packet)).map(([npc,p])=>({npc,name:p.name,kinds:p.kinds}));}
    function searchAllowed(input,packet){const person=searchPeople[searchPerson(input)];return !!person&&person.supplied(packet);}
    const searchDetails=s=>s.npc===undefined?{npc:'adventurer',kinds:['forest','mountain']}:{npc:s.npc,kinds:s.kinds};
    const searchLabel=g=>searchPeople[searchDetails(g.walk.search).npc].name;
    function builderDirective(input){return typeof input==='string'&&directive(input,'walk')
        &&/建築士|建筑师|строител|архитектор|\b(?:builder|architect|constructor|construtor|arquitecto|arquiteto)\b|baumeister|architekt/iu.test(input);}
    const waiting=(g,npc,now)=>(g.practices||[]).some(p=>p.remote?.npc===npc&&p.remote.until>now);
    function roamBuilder(g,now,held=false){const b=g.walk?.builder;if(!b||held||waiting(g,'building',now)||!Number.isSafeInteger(now)||now<b.nextAt)return false;
        const list=candidates(g).filter(forest);if(list.length<2)return false;
        b.target=list[(list.indexOf(b.target)+1)%list.length];b.nextAt=now+stayMs;
        if(g.walk.encounter?.npc==='building'&&g.walk.encounter.phase==='pending')g.walk.encounter.phase='done';return true;}
    function candidates(g){const visible=perception.chips(g).map(p=>p.id);return [...new Set([...visible,...Object.keys(g.island.assets).map(id=>'chip:'+id)])].filter(id=>nature(id)&&plan(g,id));}
    function roam(g,now,held=false){if(g.perception!==2||!Number.isSafeInteger(now)||now<0)return false;
        const w=install(g);if(!w.roaming){const list=candidates(g),old=w.encounter?.target;w.roaming={target:old&&list.includes(old)?old:list[0]||null,nextAt:now+stayMs,lastMeeting:null};return true;}
        const r=w.roaming;if(now<r.nextAt||held||waiting(g,'adventurer',now))return false;
        const p=g.practices?.at(-1);if(p&&!p.free&&!p.remote&&p.npc!=='building'&&!['done','declined','stopped','failed'].includes(p.phase))return false;
        const list=candidates(g);if(list.length<2)return false;const index=list.indexOf(r.target);
        r.target=list[(index+1)%list.length];r.nextAt=now+stayMs;if(w.encounter?.phase==='pending'&&w.encounter.npc!=='building')w.encounter.phase='done';return true;}
    const validMeeting=m=>m===null||m&&Object.keys(m).sort().join(',')==='at,target'&&Number.isSafeInteger(m.at)&&m.at>=0&&nature(m.target)&&m.target.length<=80;
    function graph(g){
        const assets=Object.entries(g.island.assets),blocks=assets.filter(([,a])=>!['ground','road','water'].includes(a.type)).map(([,a])=>({x:a.dx+a.sw*a.scale/2,y:a.dy+a.sh*a.scale-12,rx:Math.max(10,a.sw*a.scale*.28),ry:14}));
        const nodes=assets.filter(([,a])=>['ground','road'].includes(a.type)).map(([key,a])=>({key,x:a.dx+a.sw*a.scale/2,y:a.dy+a.sh*a.scale/2,edges:[]}))
            .filter(p=>!blocks.some(b=>((p.x-b.x)/b.rx)**2+((p.y-b.y)/b.ry)**2<1));
        for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=Math.abs(nodes[i].x-nodes[j].x),dy=Math.abs(nodes[i].y-nodes[j].y);
            if(Math.abs(dx-50)<1&&dy<1||Math.abs(dx-25)<1&&Math.abs(dy-25)<1){nodes[i].edges.push(j);nodes[j].edges.push(i);}}
        return nodes;
    }
    function plan(g,id,shortest=false){const a=perception.asset(g,id);if(!a)return null;const nodes=graph(g);if(!nodes.length)return null;
        let start=0;for(let i=1;i<nodes.length;i++)if(Math.hypot(nodes[i].x-g.x*800,nodes[i].y-g.y*480)<Math.hypot(nodes[start].x-g.x*800,nodes[start].y-g.y*480))start=i;
        if(Math.hypot(nodes[start].x-g.x*800,nodes[start].y-g.y*480)>50)return null;
        const queue=[start],previous=new Map([[start,null]]);
        for(let i=0;i<queue.length;i++)for(const next of nodes[queue[i]].edges)if(!previous.has(next)){previous.set(next,queue[i]);queue.push(next);}
        if(shortest){const costs=new Map([[start,0]]),pending=new Set(queue);while(pending.size){let current=null;for(const i of pending)if(current===null||(costs.get(i)??Infinity)<(costs.get(current)??Infinity))current=i;
            pending.delete(current);for(const next of nodes[current].edges){const cost=costs.get(current)+Math.hypot(nodes[current].x-nodes[next].x,nodes[current].y-nodes[next].y);
                if(cost<(costs.get(next)??Infinity)){costs.set(next,cost);previous.set(next,current);}}}}
        const x=a.dx+a.sw*a.scale/2,y=a.dy+a.sh*a.scale;
        const distance=i=>Math.hypot(nodes[i].x-x,nodes[i].y-y);
        const end=queue.sort((i,j)=>distance(i)-distance(j))[0];if(distance(end)>85)return null;
        const route=[];for(let i=end;i!==null;i=previous.get(i))route.unshift({x:nodes[i].x/800,y:nodes[i].y/480});return route;
    }
    function directive(input,kind){if(typeof input!=='string'||/[「」『』“”"?？]/u.test(input))return false;const s=input.normalize('NFKC').trim().toLowerCase().replace(/[。！!.,，]+$/u,'');
        if(kind==='stop')return /^(?:止まって|そこで止まって|ストップ|歩くのをやめて|移動をやめて|stop(?: walking| moving)?|停下|停止|остановись|стой|detente|para|pare|parar|stopp|halt)$/u.test(s);
        if(/歩かない|行かない|しないで|と思|言って|言葉|教え|don't|do not|nicht|не |no camines|não/u.test(s))return false;
        return /歩いて|歩こう|移動して|向かって|行って|進んで/u.test(s)||/^(?:please[ ,]+)?(?:walk|go|head|move)\b/u.test(s)
            ||/^(?:请|那就|那么)?(?:走|去|移动)/u.test(s)||/^(?:пожалуйста[ ,]+)?(?:иди|идём|идем|подойди|двигайся)(?=\s|$)/u.test(s)
            ||/^(?:por favor[ ,]+)?(?:camina|ve|anda|acércate)\b/u.test(s)||/^(?:por favor[ ,]+)?(?:ande|caminhe|vá|vai)(?=\s|$)/u.test(s)||/^(?:bitte[ ,]+)?(?:geh|gehe|lauf|laufe|bewege)\b/u.test(s);
    }
    function event(g,kind,target,cause,reason){const a=perception.asset(g,target);if(!a)return;
        const r={id:'event-'+(g.receipts.length+1),kind,target,label:String(a.name||a.type).slice(0,80),at:g.elapsed,cause,hunger:g.hunger,fatigue:g.fatigue};if(reason)r.reason=reason;g.receipts.push(r);return r;}
    function idle(g){g.mode='idle';g.destination=null;g.intent=null;g.route=[];g.cause=null;g.remaining=0;}
    // legacy is a read-only compatibility rule for existing adventurer records.
    // Live requests and starts always use the default person-aware rule.
    function searchDirective(input,legacy=false){
        if(typeof input!=='string'||/[「」『』“”"?？]/u.test(input))return false;
        const s=input.normalize('NFKC').toLowerCase();
        if(/しない|ないで|行かない|歩かない|とは|意味|言って|言葉|と思|don't|do not|never|\bnot\b|не |no (?:busques|vayas)|não|nicht|不要|别|不用|\b(?:why|how|whether|explain|means?|meaning)\b/u.test(s))return false;
        const npc=searchPerson(s);return (legacy?searchPeople.adventurer.names.test(s)&&/山|森|mountain|forest|montaña|bosque|montanha|floresta|berg|wald|гор|лес/iu.test(s):!!npc&&searchPeople[npc].kinds.some(kind=>searchTerrain[kind].test(s)))
            &&/近い順|近くから|近い.*順|nearest|closest|cercan|mais pert|näch|最近|ближай/iu.test(s)
            &&(directive(input,'walk')||/歩いて|歩こう|移動して|向かって|行って|進んで/u.test(s)
                ||/^(?:请)?(?:从|按|依).*(?:走|去|移动)/u.test(s)||/^(?:пожалуйста[ ,]+)?(?:обойди|пройди)(?=\s|$)/u.test(s));
    }
    function searchRequest(input){if(!searchDirective(input))return null;const npc=searchPerson(input);return {npc,kinds:searchPeople[npc].kinds.filter(kind=>searchTerrain[kind].test(input.normalize('NFKC')))};}
    function searchActive(g){return g?.walk?.search?.phase==='active';}
    function searchSupply(g){const s=g.walk?.search;return s?{phase:s.phase,target:s.target,visited:s.visited.length,...(s.npc===undefined?{}:{npc:s.npc})}:null;}
    function validSearchSupply(s){return s&&['phase,target,visited','npc,phase,target,visited'].includes(Object.keys(s).sort().join(','))&&(s.npc===undefined||Object.hasOwn(searchPeople,s.npc))
        &&['active','found','exhausted','stopped'].includes(s.phase)&&(s.target===null||typeof s.target==='string'&&nature(s.target)&&s.target.length<=80)
        &&Number.isSafeInteger(s.visited)&&s.visited>=0&&(s.phase!=='active'||s.target!==null);}
    function searchStop(g,reason='stopped'){
        if(!searchActive(g))return false;const s=g.walk.search;
        if(g.mode==='move'&&g.cause===s.origin.turn){event(g,'walk_interrupted',g.destination,s.origin.turn,'stopped');idle(g);}
        s.phase='stopped';s.reason=reason;return true;
    }
    function searchObserve(g){if(!searchActive(g))return;const s=g.walk.search;
        for(const p of perception.chips(g))if(nature(p.id)&&searchDetails(s).kinds.includes(forest(p.id)?'forest':'mountain')&&!s.candidates.includes(p.id))s.candidates.push(p.id);
    }
    function searchNext(g){const s=g.walk.search;searchObserve(g);
        const distance=route=>{let p={x:g.x,y:g.y},total=0;for(const q of route){total+=Math.hypot((q.x-p.x)*800,(q.y-p.y)*480);p=q;}return total;};
        const list=s.candidates.filter(id=>!s.visited.some(v=>v.target===id)).map(id=>({id,route:plan(g,id,true)})).filter(v=>v.route);
        list.sort((a,b)=>distance(a.route)-distance(b.route)||a.id.localeCompare(b.id));
        if(!list.length){s.phase='exhausted';s.target=null;return;}
        const next=list[0];s.target=next.id;g.mode='move';g.destination=next.id;g.intent='walk';g.route=next.route;g.cause=s.origin.turn;delete g.walk.visit;
        event(g,'walk_start',next.id,s.origin.turn);
    }
    function searchStart(g,request,turn,input){
        const p=g.practices?.at(-1),spec=searchRequest(input);
        if(g.perception!==2||g.mode!=='idle'||searchActive(g)||p&&!['done','declined','stopped','failed'].includes(p.phase)||!request||!searchDirective(input)||!searchDirective(request.quote)||!input.includes(request.quote))return false;
        if(JSON.stringify(spec)!==JSON.stringify(searchRequest(request.quote))||!searchPeople[spec.npc].available(g))return false;
        install(g).search={origin:{turn,quote:request.quote},...spec,phase:'active',candidates:[],visited:[],target:null,reason:null};
        g.walk.confirmed=null;g.focus=null;searchNext(g);return true;
    }
    function validSearch(g){const s=g.walk?.search;if(s===undefined)return true;
        if(!s||!['candidates,origin,phase,reason,target,visited','candidates,kinds,npc,origin,phase,reason,target,visited'].includes(Object.keys(s).sort().join(','))||!Array.isArray(s.visited)||!s.origin||Object.keys(s.origin).sort().join(',')!=='quote,turn'
            ||!/^turn-[1-9]\d*$/.test(s.origin.turn)||typeof s.origin.quote!=='string'||s.origin.quote.length>1000||!searchDirective(s.origin.quote,s.npc===undefined)
            ||s.npc!==undefined&&(JSON.stringify(searchDetails(s))!==JSON.stringify(searchRequest(s.origin.quote))||!searchPeople[s.npc]?.available(g))
            ||!validSearchSupply(searchSupply(g))||![null,'stopped','interrupted','cancelled','load','switch','close'].includes(s.reason)
            ||!Array.isArray(s.candidates)||new Set(s.candidates).size!==s.candidates.length||!s.candidates.every(id=>nature(id)&&searchDetails(s).kinds.includes(forest(id)?'forest':'mountain')&&!!perception.asset(g,id))
            ||new Set(s.visited.map(v=>v?.target)).size!==s.visited.length
            ||!s.visited.every(v=>v&&Object.keys(v).sort().join(',')==='arrival,target'&&s.candidates.includes(v.target)&&g.receipts.some(r=>r.id===v.arrival&&r.kind==='walk'&&r.target===v.target&&r.cause===s.origin.turn))
            ||s.target!==null&&!s.candidates.includes(s.target))return false;
        if(s.phase==='active')return s.reason===null&&g.mode==='move'&&g.destination===s.target&&g.cause===s.origin.turn&&!s.visited.some(v=>v.target===s.target);
        if(s.phase==='found')return s.reason===null&&s.visited.at(-1)?.target===s.target;
        return s.phase==='stopped'?s.reason!==null:s.reason===null&&s.target===null;
    }
    function apply(g,action,cause,packet){
        if(!action)return {accepted:true};const w=install(g);
        if(!directive(packet.input,action.kind))return {accepted:false,reason:'instruction'};
        if(action.kind==='stop'){if(searchStop(g))return {accepted:true};if(g.mode!=='move')return {accepted:false,reason:'idle'};event(g,'walk_interrupted',g.destination,cause,'stopped');idle(g);return {accepted:true};}
        const id=action.targetId;
        const fail=reason=>{event(g,'walk_failed',id,cause,reason);return {accepted:false,reason};};
        if(g.mode!=='idle')return fail('busy');
        if(!packet.world.confirmed||packet.world.confirmed!==id||w.confirmed?.targetId!==id)return fail('unconfirmed');
        if(!packet.world.visible.some(p=>p.id===id)&&packet.world.reported?.id!==id)return fail('unavailable');
        const route=plan(g,id);if(!route)return fail('unreachable');
        if(builderDirective(packet.input)){if(!w.builder||!forest(id)||typeof action.quote!=='string'||action.quote.length>1000||!packet.input.includes(action.quote)||!builderDirective(action.quote))return fail('unavailable');w.visit={target:id,turn:cause,quote:action.quote};}else delete w.visit;
        g.mode='move';g.destination=id;g.intent='walk';g.route=route;g.cause=cause;event(g,'walk_start',id,cause);return {accepted:true};
    }
    function tick(g,dt){if(g.mode!=='move')return;searchObserve(g);
        const p=g.route[0];if(!p||!perception.asset(g,g.destination)){searchStop(g,'interrupted');if(g.mode==='move'){event(g,'walk_interrupted',g.destination,g.cause,'unavailable');idle(g);}return;}
        const dx=p.x*800-g.x*800,dy=p.y*480-g.y*480,d=Math.hypot(dx,dy),step=dt*52;
        if(d>step){g.x+=dx/d*step/800;g.y+=dy/d*step/480;return;}
        g.x=p.x;g.y=p.y;g.route.shift();if(g.route.length)return;
        const target=g.destination,a=perception.asset(g,target);
        if(Math.hypot(g.x*800-(a.dx+a.sw*a.scale/2),g.y*480-(a.dy+a.sh*a.scale))>85){event(g,'walk_failed',target,g.cause,'unreachable');searchStop(g,'interrupted');idle(g);return;}
        const r=event(g,'walk',target,g.cause);idle(g);
        if(searchActive(g)&&r.cause===g.walk.search.origin.turn){const s=g.walk.search,person=searchPeople[searchDetails(s).npc];s.visited.push({target,arrival:r.id});
            if(person.location(g)===target||searchDetails(s).npc==='adventurer'&&!g.walk.roaming){install(g).encounter={id:r.id,target,phase:'pending',...(person.npc?{npc:person.npc}:{})};s.phase='found';return;}
            searchNext(g);return;}
        if(g.walk.visit?.turn===r.cause){if(g.walk.builder?.target===target)install(g).encounter={id:r.id,target,phase:'pending',npc:'building'};}
        else if(nature(target)&&(!g.walk.roaming||g.walk.roaming.target===target))install(g).encounter={id:r.id,target,phase:'pending'};
    }
    function valid(g){if(!Array.isArray(g.route)||!Array.isArray(g.receipts))return false;const w=g.walk;if(!w)return g.mode==='idle'&&g.destination===null&&g.intent===null&&g.route.length===0&&g.remaining===0;
        if(w.version!==1||typeof w.met!=='boolean'||!Object.keys(w).every(k=>['version','met','confirmed','encounter','roaming','builder','visit','search'].includes(k))||!validSearch(g))return false;
        if(w.builder){const b=w.builder;if(Object.keys(b).sort().join(',')!=='lastMeeting,met,nextAt,target'||!forest(b.target)||!perception.asset(g,b.target)||!Number.isSafeInteger(b.nextAt)||b.nextAt<0||typeof b.met!=='boolean'||!validMeeting(b.lastMeeting)||b.lastMeeting&&!forest(b.lastMeeting.target))return false;}
        if(w.visit){const v=w.visit;if(Object.keys(v).sort().join(',')!=='quote,target,turn'||!w.builder||!forest(v.target)||!perception.asset(g,v.target)||!/^turn-[1-9]\d*$/.test(v.turn)||typeof v.quote!=='string'||v.quote.length>1000||!builderDirective(v.quote))return false;}
        if(w.roaming){const r=w.roaming;if(Object.keys(r).sort().join(',')!=='lastMeeting,nextAt,target'||!(r.target===null||nature(r.target)&&perception.asset(g,r.target))||!Number.isSafeInteger(r.nextAt)||r.nextAt<0||!validMeeting(r.lastMeeting)||r.lastMeeting&&!perception.asset(g,r.lastMeeting.target))return false;}
        const c=w.confirmed;if(c&&(!perception.asset(g,c.targetId)||!/^turn-[1-9]\d*$/.test(c.turnId)||typeof c.quote!=='string'||c.quote.length>1000))return false;
        const e=w.encounter;if(e&&(!Object.keys(e).every(k=>['id','target','phase','at','previous','npc'].includes(k))||e.npc!==undefined&&(e.npc!=='building'||!w.builder||!forest(e.target))||(e.at!==undefined&&(!Number.isSafeInteger(e.at)||e.at<0||!validMeeting(e.previous)))||!['pending','video','conversation','done'].includes(e.phase)||!/^chip:(?:mountain_|palms_)/.test(e.target)||!g.receipts.some(r=>r.id===e.id&&r.kind==='walk'&&r.target===e.target)))return false;
        if(g.mode==='idle')return g.destination===null&&g.intent===null&&g.route.length===0&&g.remaining===0;
        if(g.mode!=='move'||g.intent!=='walk'||!perception.asset(g,g.destination)||!g.route.length||g.route.length>2000||g.remaining!==0||!/^turn-[1-9]\d*$/.test(g.cause))return false;
        const nodes=graph(g),index=p=>nodes.findIndex(n=>Math.abs(n.x/800-p.x)<1e-8&&Math.abs(n.y/480-p.y)<1e-8);
        if(!g.route.every(point)||!g.route.every(p=>index(p)>=0))return false;
        for(let i=1;i<g.route.length;i++)if(!nodes[index(g.route[i-1])].edges.includes(index(g.route[i])))return false;
        const a=perception.asset(g,g.destination),end=g.route.at(-1);
        return Math.hypot(g.route[0].x*800-g.x*800,g.route[0].y*480-g.y*480)<=51&&Math.hypot(end.x*800-(a.dx+a.sw*a.scale/2),end.y*480-(a.dy+a.sh*a.scale))<=85;
    }
    return {install,plan,directive,apply,tick,valid,movementKinds,graph,roam,stayMs,calendar,forest,builderDirective,roamBuilder,searchDirective,searchRequest,searchPerson,searchOptions,searchAllowed,searchLabel,searchActive,searchStart,searchStop,searchSupply,validSearchSupply};
});
