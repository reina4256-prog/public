(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_llm_native_walk'):root.NativeWalk,
    typeof module==='object'&&module.exports?require('./experimental_word_llm_native_perception'):root.NativePerception,
    typeof module==='object'&&module.exports?require('./experimental_word_llm_native_compass'):root.NativeCompass,
    typeof module==='object'&&module.exports?require('./experimental_word_llm_native_absence'):root.NativeAbsence);
    if(typeof module==='object'&&module.exports)module.exports=api;else root.NativePractice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(walk,perception,compass,absence){
    'use strict';
    const slots=['offer','decision','observe1','observe2','report','feedback'];
    const phases=['offer','decision','consult','outbound','survey','return','report','feedback','done','declined','stopped','failed'];
    const terminal=['done','declined','stopped','failed'];
    const clone=x=>structuredClone(x),point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    const keys=(o,a)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>a.includes(k));
    const distance=(a,b)=>Math.hypot((a.x-b.x)*800,(a.y-b.y)*480);
    const current=g=>g?.practices?.at(-1)||null;
    const active=g=>!!current(g)&&!terminal.includes(current(g).phase);
    const material=target=>typeof target==='string'&&target.startsWith('chip:mountain_')?'stone':'wood';
    const types=['wood','stone','flower','water'];
    const itemType=p=>p.material||material(p.target);
    const allItems=g=>[...(Array.isArray(g.inventory?.items)?g.inventory.items:[]),...(Array.isArray(g.inventory?.spent)?g.inventory.spent:[]).map(s=>s?.item).filter(Boolean)];
    const amount=(g,target,type)=>g.absence?2-absence.available(g,target,type):allItems(g).filter(i=>i.target===target&&i.type===type).length;
    const awards=g=>(g.practices||[]).filter(p=>p.bottleAward);
    const bottle=g=>awards(g).length?((g.inventory?.items||[]).some(i=>i.type==='water')?'full':'empty'):'none';
    const sourceTypes=id=>typeof id!=='string'?[]:id.startsWith('chip:mountain_')?['stone','water']:id.startsWith('chip:palms_')?['wood','flower','water']:[];
    const success=p=>p?.gather&&!p.free&&p.events?.some(e=>e.kind==='returned')&&p.events.filter(e=>e.kind==='observed').length===2;
    const canAward=(g,p,slot)=>p.exchange&&!awards(g).length&&(slot==='offer'?(g.practices||[]).some(q=>q!==p&&success(q)&&allItems(g).filter(i=>i.practice===q.id).length===2):slot==='feedback'&&success(p)&&allItems(g).filter(i=>i.practice===p.id).length===2);
    function giftMemory(g){return (g.practices||[]).filter(p=>p.gift?.response).slice(-3).map(p=>{const reception=(g.practices||[]).findLast(q=>q.reception?.source===p.id)?.reception;
        return {id:p.id,type:p.gift.type,accepted:p.gift.response.accepted,text:p.gift.response.quote,...(reception?{thought:reception.text}:{})};});}
    function giftOptions(g,p,declining=false){const counts=Object.fromEntries(types.map(type=>[type,(g.inventory?.items||[]).filter(i=>i.type===type).length]));
        const reserved=p&&!p.free&&p.gather&&!declining&&!terminal.includes(p.phase)?itemType(p):null;if(reserved)counts[reserved]=Math.max(0,counts[reserved]-2);return counts;}
    function validMemory(a){return Array.isArray(a)&&a.length<=3&&a.every(m=>keys(m,['id','type','accepted','text','thought'])&&/^event-[1-9]\d*$/.test(m.id)&&types.includes(m.type)&&typeof m.accepted==='boolean'&&short(m.text,120)&&(m.thought===undefined||short(m.thought,120)));}
    function socialContext(g,p,stage){if(!p.exchange)return undefined;
        if(['offer','feedback'].includes(stage))return {award:canAward(g,p,stage),...(p.gift?{offered:p.gift.type}:{}),...(stage==='feedback'&&p.gift?{taste:{wood:0,stone:-1,flower:1,water:1}[p.gift.type]}:{})};
        if(!['decision','report'].includes(stage))return undefined;
        return {available:giftOptions(g,p,stage==='decision'),bottle:bottle(g),memory:giftMemory(g)};}
    function validExchange(e){return keys(e,['award','offered','taste','available','bottle','memory'])
        &&(e.award===undefined||typeof e.award==='boolean')&&(e.offered===undefined||types.includes(e.offered))&&(e.taste===undefined||[-1,0,1].includes(e.taste))
        &&(e.available===undefined||keys(e.available,types)&&types.every(t=>Number.isSafeInteger(e.available[t])&&e.available[t]>=0))
        &&(e.bottle===undefined||['none','empty','full'].includes(e.bottle))&&(e.memory===undefined||validMemory(e.memory));}
    function gatheringDirective(input){if(typeof input!=='string'||ackOnly(input)||/[?？「」『』“”"]/u.test(input))return false;
        const s=input.normalize('NFKC').toLowerCase();
        if(/ないで|しない|なくて|言って|意味|とは|と思|don't|do not|never|\bnot\b|\bno\b|не |não|nicht|不要|别|不用|\b(?:can|could|would|what|why|how|whether|meaning|means|explain)\b|什么|что значит/u.test(s))return false;
        return /探して|集めて|採って|拾って|汲んで|くんで|採集して|\b(?:gather|collect|search|look for|fetch|recoge|recolecta|busca|colete|procure|busque|sammle|suche|hole)\b|采集|收集|寻找|取水|打水|собери|поищи|набери/u.test(s);}
    function targets(g){return perception.chips(g).filter(c=>/^chip:(?:mountain_|palms_)/.test(c.id)).map(c=>({id:c.id,types:sourceTypes(c.id).filter(type=>absence.available(g,c.id,type)>0&&(type!=='water'||bottle(g)==='empty')),reachable:!!walk.plan(g,c.id)}));}
    function validGather(g,request,input){return keys(request,['targetId','type','quote'])&&types.includes(request.type)&&short(request.quote,1000)&&input.includes(request.quote)&&gatheringDirective(input)&&gatheringDirective(request.quote)
        &&g.mode==='idle'&&!active(g)&&g.hunger<.8&&g.fatigue<.8&&targets(g).some(t=>t.id===request.targetId&&t.reachable&&t.types.includes(request.type));}
    const short=(s,n)=>typeof s==='string'&&s.trim().length>0&&s.length<=n&&!/[\u0000-\u001f\u007f]/.test(s);
    function relationship(g,before=null,include=false,npc='adventurer'){let hearts=1,last=null;
        for(const p of g.practices||[]){if(p===before&&!include)break;if(p.affinity&&(p.npc==='building'?'building':'adventurer')===npc){
            const next=Math.max(0,Math.min(5,hearts+p.affinity.delta));
            if(next!==hearts)last={delta:next-hearts,reason:p.affinity.reason};hearts=next;}if(p===before)break;}
        return {hearts,last};}
    const introduced=g=>(g.practices||[]).find(p=>p.introduction);
    function introduction(g){const p=introduced(g);return p?{id:p.id,target:p.introduce,quote:p.introduction.quote,met:!!g.walk?.builder?.met}:null;}
    function validIntroduction(i){return keys(i,['id','target','quote','met'])&&/^event-[1-9]\d*$/.test(i.id)&&walk.forest(i.target)&&i.target.length<=80&&short(i.quote,120)&&typeof i.met==='boolean';}
    function validRelationship(r){return keys(r,['hearts','last'])&&Number.isInteger(r.hearts)&&r.hearts>=0&&r.hearts<=5
        &&(r.last===null||keys(r.last,['delta','reason'])&&[-1,1].includes(r.last.delta)&&short(r.last.reason,120));}
    function validAffinity(a,p){if(!p?.social||!Array.isArray(p.lines)||!Array.isArray(p.events)||!p.attempts||!keys(a,['slot','delta','reason','quote','kind'])||![-1,0,1].includes(a.delta)
        ||!short(a.reason,120)||!short(a.quote,300)||!['conversation','conduct','gift'].includes(a.kind))return false;
        const line=p.lines.find(l=>l?.slot===(a.slot==='decision'?'decision':p.gift?.slot||'report'));
        if(!line?.text.includes(a.quote))return false;
        if(a.slot==='decision')return !p.gift&&p.choice==='decline'&&a.kind==='conversation'&&p.attempts.decision==='complete';
        return a.slot==='feedback'&&p.attempts.feedback==='complete'&&(p.events.some(e=>e?.kind==='returned')||p.choice==='decline'&&p.gift)
            &&(a.kind!=='conduct'||a.delta>=0)&&(a.kind!=='gift'||!!p.gift?.response);
    }
    // Separate immutable receipts; visits saved before this feature are never scored retroactively.
    const builderDelivery=a=>['deliver','accept-deliver'].includes(a?.kind);
    function building(g,before=null,include=true){const delivered=[0,0],accepted=[false,false];
        for(const p of g.practices||[]){if(p===before&&!include)break;const a=p.builderAction;
            if(a){if(['accept','accept-deliver'].includes(a.kind))accepted[a.task]=true;if(builderDelivery(a))delivered[a.task]+=a.items.length;}if(p===before)break;}
        const index=delivered[0]<2?0:delivered[1]<2?1:2;
        return {hearts:relationship(g,before,include,'building').hearts,task:{index,type:index===1?'stone':'wood',required:2,delivered:index<2?delivered[index]:2,
            phase:index===2?'done':!accepted[index]?'unstarted':delivered[index]?'partial':'accepted'},held:{wood:delivered[0],stone:delivered[1]}};}
    function validBuilding(b){return keys(b,['hearts','task','held'])&&Number.isInteger(b.hearts)&&b.hearts>=0&&b.hearts<=5
        &&keys(b.task,['index','type','required','delivered','phase'])&&[0,1,2].includes(b.task.index)&&b.task.type===(b.task.index===1?'stone':'wood')&&b.task.required===2
        &&[0,1,2].includes(b.task.delivered)&&['unstarted','accepted','partial','done'].includes(b.task.phase)
        &&keys(b.held,['wood','stone'])&&[b.held.wood,b.held.stone].every(n=>Number.isInteger(n)&&n>=0&&n<=2);}
    function validBuilderChoice(r,stage,c,text){if(r===undefined||r===null)return true;
        const b=c?.building;if(!b||stage!=='decision'||!c.builderOffer||b.task.index===2||!keys(r,['kind','quote','count'])||!['accept','deliver','accept-deliver','decline'].includes(r.kind)
            ||!short(r.quote,300)||!text.includes(r.quote)||ackOnly(r.quote)||/^(?:[\d\s:：×x個份.。!！]*)(?:木材|石|wood|stone|madera|piedra|madeira|pedra|holz|stein|木料|石料|древесина|камень)(?:[\d\s:：×x個份.。!！]*)$/iu.test(r.quote)||!Number.isInteger(r.count))return false;
        return builderDelivery(r)?(r.kind==='accept-deliver'?b.hearts>=1&&b.task.phase==='unstarted':['accepted','partial'].includes(b.task.phase))&&r.count>0&&r.count<=2-b.task.delivered&&r.count<=c.available
            :r.count===0&&(r.kind!=='accept'||b.hearts>=1&&b.task.phase==='unstarted');}
    function validBuilderAffinity(a,p){return p.builderEnabled&&keys(a,['slot','delta','reason','quote','kind'])&&a.slot==='feedback'&&p.attempts.feedback==='complete'
        &&[-1,0,1].includes(a.delta)&&['conversation','conduct'].includes(a.kind)&&short(a.reason,120)&&short(a.quote,300)&&!!p.lines.find(l=>l.slot==='decision')?.text.includes(a.quote)
        &&(a.kind!=='conduct'||a.delta>=0&&builderDelivery(p.builderAction)&&p.builderAction.items.length>0);}
    function validBuilderRecords(g){if(g.practices!==undefined&&!Array.isArray(g.practices))return false;for(const p of g.practices||[]){if(!p)return false;if(!p.builderEnabled){if(p.builderOffer||p.builderAction)return false;continue;}
        if(p.builderEnabled!==true||p.npc!=='building')return false;const b=building(g,p,false),o=p.builderOffer,a=p.builderAction;
        if(o&&(!keys(o,['task','quote'])||o.task!==b.task.index||o.task===2||b.task.phase==='unstarted'&&b.hearts<1||!short(o.quote,120)||!p.lines.find(l=>l.slot==='offer')?.text.includes(o.quote)))return false;
        if(a){const line=p.lines.find(l=>l.slot==='decision');if(!o||!keys(a,['task','kind','quote','items','at'])||a.task!==o.task||!Array.isArray(a.items)||new Set(a.items).size!==a.items.length
            ||!Number.isFinite(a.at)||a.at<0||a.at>g.elapsed||p.attempts.decision!=='complete'||!line
            ||!validBuilderChoice({kind:a.kind,quote:a.quote,count:a.items.length},'decision',{building:b,builderOffer:o.quote,available:2},line.text))return false;}
        if(p.affinity&&!validBuilderAffinity(p.affinity,p))return false;
    }return true;}
    // The mentor heard only direct replies, never a consultation or field remark.
    const heard=(lines,audience)=>lines.filter(l=>['offer','report','feedback'].includes(l.slot)||l.slot==='decision'&&audience==='mentor');
    const inventory=g=>g.inventory||(g.inventory={version:1,open:false,items:[]});
    function possessions(g,details=true,report=false){const items=g.inventory?.items||[],counts=Object.fromEntries(types.map(t=>[t,items.filter(i=>i.type===t).length])),result={open:g.inventory?.open||false,...counts,bottle:bottle(g)};
        if(g.absence){const info=absence.summary(g);if(info){if(JSON.stringify(info).length>800)throw Error('absence_budget');result.absence=info;}}
        if(report)return result;
        if(g.walk?.builder?.met)result.building=building(g);
        if(!details)return {...result,...(compass.received(g)?{compass:compass.snapshot(g)}:{})};const available=giftOptions(g,current(g));Object.assign(result,{reserved:Object.fromEntries(types.map(t=>[t,counts[t]-available[t]])),memory:giftMemory(g),targets:targets(g),compass:compass.snapshot(g)});
        while(result.memory.length&&JSON.stringify(result).length>1200)result.memory.shift();
        while(result.absence?.quote?.length>80&&JSON.stringify(result).length>1200)result.absence.quote=result.absence.quote.slice(0,-10);
        if(result.absence&&JSON.stringify(result).length>1200)delete result.building;
        while(result.absence?.quote?.length>1&&JSON.stringify(result).length>1200)result.absence.quote=result.absence.quote.slice(0,-1);
        while(result.targets.length&&JSON.stringify(result).length>1200)result.targets.pop();if(JSON.stringify(result).length>1200)throw Error('inventory_budget');return result;}
    function validPossessions(v){return keys(v,['open',...types,'bottle','reserved','memory','targets','compass','building','absence'])&&(v.absence===undefined||absence.validSummary(v.absence))&&(v.building===undefined||validBuilding(v.building))&&(v.compass===undefined||compass.validSnapshot(v.compass))&&typeof v.open==='boolean'&&['wood','stone'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0)
        &&['flower','water'].every(k=>v[k]===undefined||Number.isSafeInteger(v[k])&&v[k]>=0)&&(v.bottle===undefined||['none','empty','full'].includes(v.bottle))
        &&(v.reserved===undefined||keys(v.reserved,types)&&types.every(t=>Number.isSafeInteger(v.reserved[t])&&v.reserved[t]>=0))&&(v.memory===undefined||validMemory(v.memory))
        &&(v.targets===undefined||JSON.stringify(v).length<=1200&&Array.isArray(v.targets)&&v.targets.length<=6&&v.targets.every(t=>keys(t,['id','types','reachable'])&&/^chip:(?:mountain_|palms_)/.test(t.id)&&t.id.length<=80&&typeof t.reachable==='boolean'&&Array.isArray(t.types)&&new Set(t.types).size===t.types.length&&t.types.every(type=>sourceTypes(t.id).includes(type))));}
    function finding(g,p,step){return allItems(g).find(i=>i.practice===p.id&&i.step===step)||null;}
    function collect(g,p,step){if(!p.gather)return;const bag=inventory(g),type=itemType(p),index=[0,1].find(n=>!allItems(g).some(i=>i.target===p.target&&i.type===type&&i.id.endsWith(':'+n)));
        if(g.absence){const item=type!=='water'||bottle(g)==='empty'?absence.acquire(g,p.target,type,p.id,step,g.absence.now):null;
            g.absence.attempts.push({practice:p.id,step,at:g.elapsed,utc:g.absence.now,item:item?.id||null});return;}
        if(index===undefined||type==='water'&&bottle(g)!=='empty')return;
        bag.items.push({id:p.target+':'+(p.free?type:'material')+':'+index,type,target:p.target,practice:p.id,step,at:g.elapsed});}
    function validInventory(g){const expected=[],counts=new Map();
        if(g.practices!==undefined&&!Array.isArray(g.practices))return false;
        let ownedBottle=false;const remaining=[];let gifts=0;
        for(const r of g.absence?.acquisitions||[])if(r.item.practice.startsWith('away-')){expected.push(r.item);remaining.push(r.item);}
        for(const p of g.practices||[]){if(p?.remote)continue;if(!p||!Array.isArray(p.events))return false;
            if(p.bottleAward){if(ownedBottle||!p.exchange||!['offer','feedback'].includes(p.bottleAward.slot)||p.attempts?.[p.bottleAward.slot]!=='complete'
                ||!keys(p.bottleAward,['source','slot','at'])||!Number.isFinite(p.bottleAward.at)||p.bottleAward.at<0||p.bottleAward.at>g.elapsed)return false;
                const source=(g.practices||[]).find(q=>q.id===p.bottleAward.source),prior=(g.practices||[]).slice(0,g.practices.indexOf(p));
                if(!success(source)||allItems(g).filter(i=>i.practice===source.id).length!==2||!(p.bottleAward.slot==='offer'?prior.includes(source):source===p))return false;
                if([...prior,...(p.bottleAward.slot==='feedback'?[p]:[])].find(q=>success(q)&&allItems(g).filter(i=>i.practice===q.id).length===2)!==source)return false;
                if(p.bottleAward.slot==='offer')ownedBottle=true;}
            if(p.gather)for(const [index,e]of p.events.filter(e=>e?.kind==='observed').entries()){const type=itemType(p),key=p.target+'|'+type,n=counts.get(key)||0;
                const acquired=g.absence?.acquisitions.find(r=>r.item.practice===p.id&&r.item.step===index+1);if(acquired){expected.push(acquired.item);remaining.push(acquired.item);continue;}
                if(g.absence?.attempts.some(r=>r.practice===p.id&&r.step===index+1))continue;
                if(n>=2||type==='water'&&(!ownedBottle||remaining.some(i=>i.type==='water')))continue;counts.set(key,n+1);
                const item={id:p.target+':'+(p.free?type:'material')+':'+n,type,target:p.target,practice:p.id,step:index+1,at:e.at};expected.push(item);remaining.push(item);}
            if(p.bottleAward?.slot==='feedback')ownedBottle=true;
            if(builderDelivery(p.builderAction))for(const id of p.builderAction.items){const i=remaining.findIndex(i=>i.id===id&&i.type===(p.builderAction.task===0?'wood':'stone'));if(i<0)return false;
                const item=remaining.splice(i,1)[0],spent=g.inventory?.spent?.[gifts++];if(!spent||spent.by!==p.id||!keys(spent,['by','item'])||JSON.stringify(spent.item)!==JSON.stringify(item))return false;}
            if(p.gift){const gift=p.gift,line=p.lines?.find(l=>l.slot===gift.slot),i=remaining.findIndex(i=>i.id===gift.itemId&&i.type===gift.type);
                if(!p.exchange||p.free||!['decision','report'].includes(gift.slot)||gift.slot==='decision'&&p.choice!=='decline'||!line?.text.includes(gift.quote)||!short(gift.quote,300)||i<0||!keys(gift,['itemId','type','slot','quote','response']))return false;
                if(gift.slot==='report'&&remaining.filter(i=>i.type===gift.type).length-(gift.type===itemType(p)?2:0)<1)return false;
                if(gift.response){const r=gift.response,reply=p.lines?.find(l=>l.slot==='feedback');
                    if(!keys(r,['accepted','quote'])||typeof r.accepted!=='boolean'||!short(r.quote,120)||!reply?.text.includes(r.quote)||p.attempts.feedback!=='complete')return false;
                    if(r.accepted){const item=remaining.splice(i,1)[0],spent=g.inventory?.spent?.[gifts++];if(!spent||spent.by!==p.id||JSON.stringify(spent.item)!==JSON.stringify(item)||!keys(spent,['by','item']))return false;}}}}
        if(g.inventory===undefined)return expected.length===0;const bag=g.inventory,byId=new Map((bag.items||[]).map(i=>[i.id,i]));
        return keys(bag,['version','open','items','spent'])&&bag.version===1&&typeof bag.open==='boolean'&&Array.isArray(bag.items)&&bag.items.length===remaining.length
            &&(bag.spent===undefined||Array.isArray(bag.spent)&&bag.spent.length===gifts)&&byId.size===bag.items.length&&remaining.every(e=>{const i=byId.get(e.id);return i&&Object.keys(e).every(k=>i[k]===e[k]);})
            &&new Set(expected.map(i=>i.id)).size===expected.length&&(g.absence||expected.length<=Object.keys(g.island.assets).length*8)
            &&bag.items.every(i=>keys(i,['id','type','target','practice','step','at'])&&typeof i.target==='string'&&/^chip:(?:mountain_|palms_)/.test(i.target)
                &&!!perception.asset(g,i.target)&&types.includes(i.type)&&[1,2].includes(i.step)
                &&Number.isFinite(i.at)&&i.at>=0&&i.at<=g.elapsed);
    }
    function route(g,to){const nodes=walk.graph(g),nearest=p=>nodes.reduce((best,n,i)=>distance(p,{x:n.x/800,y:n.y/480})<distance(p,{x:nodes[best].x/800,y:nodes[best].y/480})?i:best,0);
        if(!nodes.length)return null;const start=nearest(g),end=nearest(to);
        if(distance(g,{x:nodes[start].x/800,y:nodes[start].y/480})>50||distance(to,{x:nodes[end].x/800,y:nodes[end].y/480})>.01)return null;
        const queue=[start],previous=new Map([[start,null]]);for(let i=0;i<queue.length&&!previous.has(end);i++)for(const n of nodes[queue[i]].edges)if(!previous.has(n)){previous.set(n,queue[i]);queue.push(n);}
        if(!previous.has(end))return null;const result=[];for(let i=end;i!==null;i=previous.get(i))result.unshift({x:nodes[i].x/800,y:nodes[i].y/480});return result;}
    function event(g,p,kind){p.events.push({kind,at:g.elapsed,x:g.x,y:g.y});}
    function create(g,arrival,allowIntroduction=true){
        if(g.mode!=='idle'||active(g)||!g.receipts.some(r=>r.id===arrival.id&&r.target===arrival.target&&r.kind==='walk'))return null;
        const builder=arrival.npc==='building';
        const introduce=allowIntroduction&&!builder&&!introduced(g)&&relationship(g).hearts>=3
            ?perception.chips(g).find(c=>walk.forest(c.id)&&c.id!==arrival.target&&walk.plan(g,c.id))?.id:null;
        const home={x:g.x,y:g.y},candidates=perception.chips(g).filter(c=>/^chip:(mountain_|palms_)/.test(c.id)&&c.id!==arrival.target
            &&amount(g,c.id,material(c.id))<2)
            .map(c=>({id:c.id,path:walk.plan(g,c.id)})).filter(c=>c.path&&route({...g,...c.path.at(-1)},home));
        const canVisit=!compass.received(g)&&!!compass.source(g)||!awards(g).length&&(g.practices||[]).some(q=>success(q)&&allItems(g).filter(i=>i.practice===q.id).length===2)||types.some(t=>giftOptions(g,null)[t]>0);
        const chosen=builder||introduce?{id:arrival.target,path:walk.plan(g,arrival.target)}:candidates[0]||((amount(g,arrival.target,material(arrival.target))<2||canVisit)?{id:arrival.target,path:walk.plan(g,arrival.target)}:null);if(!chosen?.path||!route({...g,...chosen.path.at(-1)},home))return null;
        const end=chosen.path.at(-1),nodes=walk.graph(g),at=nodes.find(n=>distance(end,{x:n.x/800,y:n.y/480})<.01);
        if(!at?.edges.length)return null;const neighbor=nodes[at.edges[0]],p={id:arrival.id,homeTarget:arrival.target,home,target:chosen.id,phase:'offer',suspended:false,
            route:[],tour:[{x:neighbor.x/800,y:neighbor.y/480},end],surveyIndex:0,timer:0,events:[],attempts:{},lines:[],choice:null,gather:true,social:true,exchange:true};
        if(amount(g,chosen.id,material(chosen.id))>=2){delete p.gather;p.visit=true;}
        if(introduce){delete p.gather;p.visit=true;p.introduce=introduce;}
        if(builder){delete p.gather;delete p.social;delete p.exchange;p.visit=true;p.npc='building';p.builderEnabled=true;}
        if(allowIntroduction)p.linkEnabled=true;
        (g.practices||(g.practices=[])).push(p);return p;
    }
    function createFree(g,request,turn,input){if(!/^turn-[1-9]\d*$/.test(turn)||!validGather(g,request,input))return null;
        const nodes=walk.graph(g),homeNode=nodes.reduce((a,b)=>distance(g,{x:a.x/800,y:a.y/480})<distance(g,{x:b.x/800,y:b.y/480})?a:b),home={x:homeNode.x/800,y:homeNode.y/480};
        const path=walk.plan(g,request.targetId),end=path?.at(-1),back=end&&route({...g,...end},home),at=nodes.find(n=>end&&distance(end,{x:n.x/800,y:n.y/480})<.01);
        if(!path||!back||!at?.edges.length)return null;
        const neighbor=nodes[at.edges[0]],p={id:'gather-'+turn,homeTarget:request.targetId,home,target:request.targetId,phase:'outbound',suspended:false,route:path,
            tour:[{x:neighbor.x/800,y:neighbor.y/480},end],surveyIndex:0,timer:0,events:[],attempts:{},lines:[],choice:'accept',gather:true,free:true,material:request.type,origin:{turn,quote:request.quote}};
        (g.practices||(g.practices=[])).push(p);event(g,p,'departed');return p;}
    // Reconstruct the inventory seen at an earlier chat before later gifts/awards.
    function historicalPossessions(g,at,snapshot,acquisitionCount=0){const index=snapshot?(g.practices||[]).findIndex(p=>p.id===snapshot.context.id):-1;
        const records=(g.practices||[]).slice(0,index+1),last=records.at(-1),seen=(p,slot)=>p!==last||snapshot.speech.some(l=>l.slot===slot)
            ||['done','declined'].includes(snapshot.context.phase)&&p.attempts[slot]==='complete';
        const spent=[...records.filter(p=>p.gift?.response?.accepted&&seen(p,'feedback')).map(p=>p.gift.itemId),...records.filter(p=>builderDelivery(p.builderAction)&&seen(p,'decision')).flatMap(p=>p.builderAction.items)],owned=records.some(p=>p.bottleAward&&seen(p,p.bottleAward.slot));
        const newer=g.absence?.acquisitions||[],permitted=new Set(newer.slice(0,acquisitionCount).map(r=>r.item.id));
        const items=allItems(g).filter(i=>(records.some(p=>p.id===i.practice)||i.practice.startsWith('away-')&&permitted.has(i.id))&&i.at<=at&&!spent.includes(i.id)&&(!newer.some(r=>r.item.id===i.id)||permitted.has(i.id)));
        return {...Object.fromEntries(types.map(type=>[type,items.filter(i=>i.type===type).length])),bottle:owned?(items.some(i=>i.type==='water')?'full':'empty'):'none'};}
    function validInventorySnapshot(g,t){const v=t.inventory,evidence=t.inventoryEvidence,counts=historicalPossessions(g,t.gameAt,t.practice,evidence?.count);if(!validPossessions(v)||!types.every(type=>v[type]===undefined||v[type]===counts[type])||v.bottle!==undefined&&v.bottle!==counts.bottle||evidence&&(!keys(evidence,['count','at'])||!Number.isSafeInteger(evidence.count)||evidence.count<0||evidence.count>(g.absence?.acquisitions.length||0)||!Number.isFinite(evidence.at)||evidence.at<g.absence.installed||evidence.at>g.absence.now))return false;
        if(v.absence){const a=v.absence;if(a.source&&!g.absence?.jobs.some(j=>j.source===a.source&&j.quote.startsWith(a.quote)&&j.type===a.type&&a.total===g.absence.acquisitions.slice(0,evidence?.count||0).filter(r=>r.item.practice===j.id).length))return false;
            if(a.current&&![...(g.absence?.reportHistory||[]),g.absence?.report].some(r=>r&&r.at===a.current&&r.from===a.previous&&r.seconds===a.seconds))return false;}
        const index=t.practice?(g.practices||[]).findIndex(p=>p.id===t.practice.context.id):-1,records=(g.practices||[]).slice(0,index+1),last=records.at(-1),seen=(p,slot)=>p!==last||t.practice.speech.some(l=>l.slot===slot)||['done','declined'].includes(t.practice.context.phase)&&p.attempts[slot]==='complete';
        if(v.building){const past=records.map(p=>{const q={...p};if(!seen(p,'decision'))delete q.builderAction;if(!seen(p,'feedback')&&p.npc==='building')delete q.affinity;return q;});
            if(!records.some(p=>p.npc==='building'&&seen(p,'offer'))||JSON.stringify(v.building)!==JSON.stringify(building({practices:past})))return false;}
        if(v.compass){const accepted=records.filter(p=>p.linkAccept&&(p.linkAccept.slot==='chat'?Number(p.linkAccept.turn.slice(5))<Number(t.id.slice(5)):seen(p,p.linkAccept.slot))),remote=records.findLast(p=>p.remote?.target&&seen(p,'offer'));
            const expected={owned:accepted.some(p=>p.linkOffer.grant),contacts:[...new Set(accepted.map(p=>p.npc==='building'?'building':'adventurer'))]};
            if(v.compass.owned!==expected.owned||JSON.stringify(v.compass.contacts)!==JSON.stringify(expected.contacts))return false;
            if(v.compass.offer&&(!last?.linkOffer||!seen(last,last.linkOffer.slot)||accepted.includes(last)||v.compass.offer.quote!==last.linkOffer.quote||v.compass.offer.grant!==last.linkOffer.grant||v.compass.offer.contact!==(last.npc==='building'?'building':'adventurer')))return false;
            if(!!v.compass.last!==!!remote)return false;if(remote){const r=remote.remote,expectedLast={contact:r.npc,target:r.target,at:r.replyAt,text:remote.lines.find(l=>l.slot==='offer').text,...(r.until&&seen(remote,'decision')?{until:r.until}:{})};if(JSON.stringify(v.compass.last)!==JSON.stringify(expectedLast))return false;}}
        if(v.memory){const expected=records.filter(p=>p.gift?.response&&seen(p,'feedback')).slice(-3).map(p=>{const thought=records.findLast(q=>q.reception?.source===p.id&&seen(q,q.reception.slot))?.reception?.text;
                return {id:p.id,type:p.gift.type,accepted:p.gift.response.accepted,text:p.gift.response.quote,...(thought?{thought}:{})};});
            if(JSON.stringify(v.memory)!==JSON.stringify(v.memory.length?expected.slice(-v.memory.length):[]))return false;}
        if(v.reserved){const c=t.practice?.context,type=c?.goal==='gather-and-return'&&!terminal.includes(c.phase)?c.collection.type:null;
            if(!types.every(k=>v.reserved[k]===(k===type?Math.min(2,counts[k]):0)))return false;}
        return !v.targets||v.targets.every(target=>{
            const remaining=type=>evidence?absence.stockAt(g,target.id,type,evidence.at,evidence.count)?.available>0
                :allItems(g).filter(i=>records.some(p=>p.id===i.practice)&&i.at<=t.gameAt&&i.target===target.id&&i.type===type).length<2;
            return t.world.visible.some(o=>o.id===target.id)&&JSON.stringify(target.types)===JSON.stringify(sourceTypes(target.id).filter(type=>remaining(type)&&(type!=='water'||counts.bottle==='empty')));
        });}
    function context(g,p=current(g)){
        if(p?.remote)return compass.context(g,p);
        if(p?.npc==='building')return {id:p.id,goal:'builder-visit',phase:p.phase,suspended:p.suspended,target:{id:p.target,kind:'forest'},home:p.homeTarget,choice:p.choice,results:[],experience:[],
            ...(p.builderEnabled?{building:building(g,p,true),...(p.builderOffer&&p.phase==='decision'?{builderOffer:p.builderOffer.quote}:{})}:{})};
        if(!p)return null;const asset=perception.asset(g,p.target),c={id:p.id,goal:'survey-and-return',phase:p.phase,suspended:p.suspended,
            target:{id:p.target,kind:p.target.startsWith('chip:mountain_')?'mountain':'forest'},home:p.homeTarget,
            hunger:g.hunger,fatigue:g.fatigue,reachable:!!asset&&!!walk.plan(g,p.target),returnable:!!route(g,p.home),
            choice:p.choice,results:p.events.slice(-3).map(e=>({kind:e.kind,at:e.at})),
            experience:g.receipts.filter(r=>['observe','walk'].includes(r.kind)).slice(-2).map(r=>({kind:r.kind,targetKind:r.target.startsWith('chip:mountain_')?'mountain':r.target.startsWith('chip:palms_')?'forest':'other'}))};
        const prior=g.practices?.slice(0,-1).findLast(record=>record.events?.some(e=>e.kind==='returned'));
        if(prior)c.experience.push({kind:'survey-return',targetKind:prior.target.startsWith('chip:mountain_')?'mountain':'forest'});
        if(p.gather){c.goal=p.free?'free-gather-and-return':'gather-and-return';c.collection={type:itemType(p),goal:p.free&&itemType(p)==='water'?1:2,found:[1,2].filter(step=>p.events.filter(e=>e.kind==='observed').length>=step)
            .map(step=>({step,count:finding(g,p,step)?1:0})),obtained:allItems(g).filter(i=>i.practice===p.id).length};}
        if(p.visit)c.goal='visit';
        if(p.introduce)c.introduce={target:p.introduce,role:'building'};
        if(p.social)c.relationship=relationship(g,p,true);
        if(JSON.stringify(c).length>1200)throw Error('practice_budget');return c;
    }
    function validContext(c){if(c?.goal==='compass-call')return compass.validContext(c)&&(c.calendar===undefined||walk.calendar.valid(c.calendar));
        if(c?.goal==='builder-visit')return keys(c,['id','goal','phase','suspended','target','home','choice','results','experience','calendar','meeting','link','building','builderOffer','available','heard','delivery'])&&(!c.link||validLink(c.link))
        &&(c.building===undefined||validBuilding(c.building))&&(c.builderOffer===undefined||short(c.builderOffer,120))&&(c.available===undefined||Number.isInteger(c.available)&&c.available>=0&&c.available<=2)
        &&(c.heard===undefined||validSpeech(c.heard)&&c.heard.every(l=>l.slot==='decision'))&&(c.delivery===undefined||keys(c.delivery,['type','count'])&&['wood','stone'].includes(c.delivery.type)&&[1,2].includes(c.delivery.count))
        &&/^event-[1-9]\d*$/.test(c.id)&&phases.includes(c.phase)&&typeof c.suspended==='boolean'&&keys(c.target,['id','kind'])&&walk.forest(c.target.id)&&c.target.id.length<=80&&c.target.kind==='forest'&&c.home===c.target.id
        &&[null,'decline'].includes(c.choice)&&Array.isArray(c.results)&&!c.results.length&&Array.isArray(c.experience)&&!c.experience.length
        &&(c.calendar===undefined||walk.calendar.valid(c.calendar))&&(c.meeting===undefined||c.phase==='offer'&&['first','again'].includes(c.meeting))&&JSON.stringify(c).length<=1200;
        return keys(c,['id','goal','phase','suspended','target','home','hunger','fatigue','reachable','returnable','choice','results','experience','meeting','collection','relationship','exchange','calendar','reunion','introduce','link'])&&(!c.link||validLink(c.link))
        &&(c.introduce===undefined||c.goal==='visit'&&keys(c.introduce,['target','role'])&&walk.forest(c.introduce.target)&&c.introduce.target.length<=80&&c.introduce.role==='building')
        &&(c.calendar===undefined||walk.calendar.valid(c.calendar))
        &&(c.reunion===undefined||keys(c.reunion,['minutes','place'])&&Number.isSafeInteger(c.reunion.minutes)&&c.reunion.minutes>=0&&['same','different'].includes(c.reunion.place))
        &&(c.exchange===undefined||validExchange(c.exchange))
        &&(c.relationship===undefined||validRelationship(c.relationship))
        &&(['survey-and-return','visit'].includes(c.goal)?c.collection===undefined:['gather-and-return','free-gather-and-return'].includes(c.goal)&&keys(c.collection,['type','goal','found','obtained'])
            &&(c.goal==='free-gather-and-return'?sourceTypes(c.target?.id||'').includes(c.collection.type):c.collection.type===material(c.target?.id||''))&&c.collection.goal===(c.goal==='free-gather-and-return'&&c.collection.type==='water'?1:2)&&Array.isArray(c.collection.found)&&c.collection.found.length<=2
            &&c.collection.found.every((f,i)=>keys(f,['step','count'])&&f.step===i+1&&[0,1].includes(f.count))&&c.collection.obtained===c.collection.found.reduce((n,f)=>n+f.count,0))
        &&(c.meeting===undefined||c.phase==='offer'&&['first','again'].includes(c.meeting))
        &&(c.goal==='free-gather-and-return'?/^gather-turn-[1-9]\d*$/:/^event-[1-9]\d*$/).test(c.id)&&phases.includes(c.phase)&&typeof c.suspended==='boolean'
        &&keys(c.target,['id','kind'])&&/^chip:(?:mountain_|palms_)/.test(c.target.id)&&c.target.id.length<=80&&['forest','mountain'].includes(c.target.kind)
        &&typeof c.home==='string'&&c.home.length<=80&&/^chip:(?:mountain_|palms_)/.test(c.home)
        &&['hunger','fatigue'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=1)&&typeof c.reachable==='boolean'&&typeof c.returnable==='boolean'
        &&[null,'accept','decline','ask'].includes(c.choice)&&Array.isArray(c.results)&&c.results.length<=3&&c.results.every(r=>keys(r,['kind','at'])&&['departed','arrived','observed','returned','stopped','failed','unreachable'].includes(r.kind)&&Number.isFinite(r.at)&&r.at>=0)
        &&Array.isArray(c.experience)&&c.experience.length<=3&&c.experience.every(e=>keys(e,['kind','targetKind'])&&['observe','walk','survey-return'].includes(e.kind)&&['forest','mountain','other'].includes(e.targetKind))&&JSON.stringify(c).length<=1200;}
    const validLink=l=>keys(l,['grant','contact','quote'])&&typeof l.grant==='boolean'&&['adventurer','building'].includes(l.contact)&&(l.quote===undefined||short(l.quote,120));
    function validSpeech(lines){return Array.isArray(lines)&&lines.length<=6&&new Set(lines.map(l=>l?.slot)).size===lines.length&&lines.every(l=>keys(l,['slot','speaker','text'])&&slots.includes(l.slot)&&l.speaker===(['offer','feedback'].includes(l.slot)?'mentor':'companion')&&typeof l.text==='string'&&l.text.trim()&&l.text.length<=300&&!/[\u0000-\u001f\u007f]/.test(l.text));}
    function supply(g){if(!current(g))return null;const result={context:context(g),speech:clone(current(g).lines)};
        const i=introduction(g);if(i)result.introduction=i;
        while(result.speech.length&&JSON.stringify({practice:result}).length>4000)result.speech.shift();return result;}
    const validSupply=s=>keys(s,['context','speech','introduction'])&&(!s.introduction||validIntroduction(s.introduction))&&validContext(s.context)&&validSpeech(s.speech)&&JSON.stringify(s).length<=4000;
    function due(p){if(!p||p.suspended||terminal.includes(p.phase))return null;
        if(['offer','decision'].includes(p.phase))return p.attempts[p.phase]?null:p.phase;
        const observed=p.events.filter(e=>e.kind==='observed').length;
        for(let i=1;i<=Math.min(2,observed);i++)if(!p.attempts['observe'+i])return 'observe'+i;
        if(['report','feedback'].includes(p.phase)&&!p.attempts[p.phase])return p.phase;return null;
    }
    function travel(g,p,phase,to){const next=phase==='outbound'?walk.plan(g,p.target):route(g,to);
        if(!next){p.phase='failed';p.route=[];event(g,p,'unreachable');return false;}p.phase=phase;p.route=next;return true;}
    function decide(g,p,choice){if(p.npc==='building'){p.choice='decline';p.phase='feedback';return true;}if(p.visit&&choice==='accept')choice='decline';p.choice=choice;if(choice==='ask'){p.phase='consult';return true;}
        if(choice==='decline'){p.phase=p.gift?'feedback':'declined';return true;}
        if(choice!=='accept'||g.hunger>=.8||g.fatigue>=.8){p.phase='consult';p.choice='ask';return false;}
        if(!travel(g,p,'outbound'))return false;event(g,p,'departed');return true;}
    function finish(g,slot,result,now=Date.now()){const p=current(g);if(!p||p.attempts[slot]!=='pending')throw Error('stale');
        p.attempts[slot]='complete';p.lines.push({slot,speaker:['offer','feedback'].includes(slot)?'mentor':'companion',text:result.text});
        if(p.remote){p.lines.pop();compass.finish(g,p,slot,result,now);return;}
        compass.applyFace(g,p,slot,result,now);
        if(p.npc==='building'&&slot==='offer')g.walk.builder.met=true;
        if(p.builderEnabled&&slot==='offer'&&result.builderOffer){const b=building(g,p,false),q=result.builderOffer.quote;
            if(b.task.index<2&&(b.task.phase!=='unstarted'||b.hearts>=1)&&short(q,120)&&result.text.includes(q))p.builderOffer={task:b.task.index,quote:q};}
        if(p.builderEnabled&&slot==='decision'&&result.builderChoice){const b=building(g,p,false),a=result.builderChoice,c={building:b,builderOffer:p.builderOffer?.quote,available:Math.min(2,(g.inventory?.items||[]).filter(i=>i.type===b.task.type).length)};
            if(!validBuilderChoice(a,slot,c,result.text))throw Error('builder_choice');
            const bag=inventory(g),items=builderDelivery(a)?bag.items.filter(i=>i.type===b.task.type).slice(0,a.count):[];
            p.builderAction={task:b.task.index,kind:a.kind,quote:a.quote,items:items.map(i=>i.id),at:g.elapsed};
            for(const item of items){bag.items.splice(bag.items.findIndex(i=>i.id===item.id),1);(bag.spent||(bag.spent=[])).push({by:p.id,item});}}
        if(slot==='offer'&&p.introduce&&result.introduction&&!introduced(g)&&short(result.introduction.quote,120)&&result.text.includes(result.introduction.quote)){
            p.introduction={quote:result.introduction.quote,at:now};walk.install(g).builder={target:p.introduce,nextAt:now+walk.stayMs,lastMeeting:null,met:false};}
        if(result.reception&&p.exchange&&!p.reception&&['decision','report'].includes(slot)){const r=result.reception,m=giftMemory(g).find(m=>m.id===r.source);
            if(m&&short(r.quote,120)&&m.text.includes(r.quote)&&short(r.text,120))p.reception={slot,...clone(r)};}
        if(p.exchange&&result.gift&&['decision','report'].includes(slot)&&(slot==='report'||result.choice==='decline')&&!p.gift){const gift=result.gift;
            if(types.includes(gift.type)&&short(gift.quote,300)&&result.text.includes(gift.quote)&&giftOptions(g,p,slot==='decision')[gift.type]>0){
                const item=g.inventory.items.find(i=>i.type===gift.type);p.gift={itemId:item.id,type:item.type,slot,quote:gift.quote};}}
        if(slot==='feedback'&&p.gift&&result.giftResponse&&typeof result.giftResponse.accepted==='boolean'&&short(result.giftResponse.quote,120)&&result.text.includes(result.giftResponse.quote)){
            p.gift.response=clone(result.giftResponse);if(p.gift.response.accepted){const bag=inventory(g),i=bag.items.findIndex(i=>i.id===p.gift.itemId);if(i<0)throw Error('gift');(bag.spent||(bag.spent=[])).push({by:p.id,item:bag.items.splice(i,1)[0]});}}
        if(canAward(g,p,slot)){const source=slot==='feedback'?p:(g.practices||[]).find(q=>q!==p&&success(q)&&allItems(g).filter(i=>i.practice===q.id).length===2);p.bottleAward={source:source.id,slot,at:g.elapsed};}
        if(slot==='decision')p.decisionAudience=result.choice==='ask'?'player':'mentor';
        if(slot==='offer')p.phase='decision';else if(slot==='decision')decide(g,p,result.choice);
        else if(slot==='report')p.phase='feedback';else if(slot==='feedback')p.phase='done';
        const a=result.affinity;if(!p.affinity&&a&&(p.builderEnabled?validBuilderAffinity({...a,slot},p):validAffinity({...a,slot},p)))p.affinity={...clone(a),slot};}
    function stop(g,failed=false){const p=current(g);if(!p||terminal.includes(p.phase))return;
        p.phase=failed?'failed':'stopped';p.suspended=false;for(const s of slots)if(p.attempts[s]==='pending')p.attempts[s]='cancelled';if(p.remote)return;p.route=[];event(g,p,failed?'failed':'stopped');}
    function suspend(g){const p=current(g);if(!p||terminal.includes(p.phase))return false;
        if(p.remote){stop(g);return true;}
        if(Object.values(p.attempts).includes('pending')){stop(g,true);return true;}if(p.suspended)return false;p.suspended=true;return true;}
    function ackOnly(input){return /^(?:うん|はい|そう|そうそう|いいよ|yes|yeah|ok|okay|si|sí|sim|ja|да|是|好|好的)[\s。.!！]*$/iu.test(input.trim());}
    function resolve(g,decision,input){const p=current(g);if(!p||!decision||typeof decision.quote!=='string'||!input.includes(decision.quote))return false;
        if(decision.choice==='decline'){stop(g);return true;}
        if(ackOnly(input)||!decision.quote.trim()||!['consult'].includes(p.phase)&&!p.suspended)return false;
        if(decision.choice==='resume'&&p.suspended){p.suspended=false;return true;}
        if(decision.choice==='accept'&&p.phase==='consult'){p.suspended=false;return decide(g,p,'accept');}return false;}
    function tick(g,dt){const p=current(g);if(!p||p.suspended||!['outbound','survey','return'].includes(p.phase))return;
        if(!perception.asset(g,p.target)||!perception.asset(g,p.homeTarget)){stop(g,true);return;}
        // An actual observation owns its remark before any subsequent movement.
        const remark=due(p);if(remark==='observe1'||remark==='observe2')return;
        if(p.route.length){const next=p.route[0],d=distance(g,next),step=dt*(p.phase==='survey'?26:52);
            if(d>step){g.x+=(next.x-g.x)*step/d;g.y+=(next.y-g.y)*step/d;return;}g.x=next.x;g.y=next.y;p.route.shift();if(p.route.length)return;}
        if(p.phase==='outbound'){event(g,p,'arrived');p.phase='survey';return;}
        if(p.phase==='return'){if(distance(g,p.home)>.01){stop(g,true);return;}event(g,p,'returned');p.phase=p.free?'done':'report';return;}
        if(p.surveyIndex===2){travel(g,p,'return',p.home);return;}
        p.timer+=dt;if(p.timer<6)return;p.timer=0;event(g,p,'observed');collect(g,p,p.surveyIndex+1);p.route=route(g,p.tour[p.surveyIndex++])||[];
        if(!p.route.length)stop(g,true);
    }
    function valid(g){if(!validBuilderRecords(g)||!validInventory(g))return false;if(g.practices===undefined)return !g.walk?.builder;if(!Array.isArray(g.practices)||(g.practices.filter(p=>p.introduction).length>1)||!!g.walk?.builder!==!!introduced(g)
        ||g.walk?.builder&&g.walk.builder.met!==(g.practices||[]).some(p=>p.npc==='building'&&p.lines.some(l=>l.slot==='offer')))return false;const ids=new Set(),nodes=walk.graph(g);
        const onNode=p=>point(p)&&nodes.some(n=>distance(p,{x:n.x/800,y:n.y/480})<.01);
        return g.practices.every((p,index)=>{if(p.remote)return !ids.has(p.id)&&!!ids.add(p.id)&&compass.validRemote(g,p,index);if(!compass.validFace(g,p,index)||!(p.linkEnabled===undefined||p.linkEnabled===true)||!keys(p,['id','homeTarget','home','target','phase','suspended','route','tour','surveyIndex','timer','events','attempts','lines','choice','gather','social','affinity','decisionAudience','exchange','bottleAward','gift','reception','free','material','origin','visit','npc','introduce','introduction','linkOffer','linkAccept','linkEnabled','builderEnabled','builderOffer','builderAction'])||!(p.gather===undefined||p.gather===true)
            ||p.npc!==undefined&&(p.npc!=='building'||!p.visit||p.social||p.exchange||p.introduce||p.target!==p.homeTarget||!walk.forest(p.target)||p.lines.some(l=>!['offer','decision','feedback'].includes(l.slot)))
            ||p.introduce!==undefined&&(!p.visit||!p.social||relationship(g,p).hearts<3||!walk.forest(p.introduce)||!perception.asset(g,p.introduce)||p.introduce===p.homeTarget)
            ||p.introduction!==undefined&&(!p.introduce||!keys(p.introduction,['quote','at'])||!short(p.introduction.quote,120)||!Number.isSafeInteger(p.introduction.at)||p.introduction.at<0||!p.lines.find(l=>l.slot==='offer')?.text.includes(p.introduction.quote))
            ||!(p.visit===undefined||p.visit===true&&!p.gather&&!p.free&&(p.exchange||p.npc==='building')&&p.events.every(e=>['stopped','failed','unreachable'].includes(e.kind))&&p.choice!=='accept')
            ||!(p.exchange===undefined||p.exchange===true)||!(p.free===undefined||p.free===true)
            ||(p.free?(!p.gather||p.social||p.exchange||p.bottleAward||p.gift||p.reception||!sourceTypes(p.target).includes(p.material)||!keys(p.origin,['turn','quote'])||p.id!=='gather-'+p.origin.turn||!/^turn-[1-9]\d*$/.test(p.origin.turn)||!gatheringDirective(p.origin.quote)||p.lines.some(l=>!['observe1','observe2'].includes(l.slot))):p.material!==undefined||p.origin!==undefined)
            ||p.reception&&(!p.exchange||!keys(p.reception,['slot','source','quote','text'])||!['decision','report'].includes(p.reception.slot)||p.attempts[p.reception.slot]!=='complete'||!short(p.reception.quote,120)||!short(p.reception.text,120)
                ||!g.practices.slice(0,g.practices.indexOf(p)).filter(q=>q.gift?.response).slice(-3).some(q=>q.id===p.reception.source&&q.gift.response.quote.includes(p.reception.quote)))
            ||!(p.decisionAudience===undefined||['mentor','player'].includes(p.decisionAudience)&&p.attempts?.decision==='complete')
            ||!(p.social===undefined||p.social===true)||p.affinity!==undefined&&!(p.builderEnabled?validBuilderAffinity(p.affinity,p):validAffinity(p.affinity,p))
            ||ids.has(p.id)||!(p.free?/^gather-turn-[1-9]\d*$/:/^event-[1-9]\d*$/).test(p.id)||!p.free&&!g.receipts.some(r=>r.id===p.id&&r.kind==='walk'&&r.target===p.homeTarget)
            ||!/^chip:(?:mountain_|palms_)/.test(p.target)||!perception.asset(g,p.target)||!onNode(p.home)||!phases.includes(p.phase)||typeof p.suspended!=='boolean'
            ||!Array.isArray(p.route)||p.route.length>2000||!p.route.every(onNode)||!Array.isArray(p.tour)||p.tour.length!==2||!p.tour.every(onNode)
            ||!Number.isInteger(p.surveyIndex)||p.surveyIndex<0||p.surveyIndex>2||!Number.isFinite(p.timer)||p.timer<0||p.timer>6.1
            // Coordinates are island positions divided by 800/480, not viewport fractions.
            // Real ground nodes can lie outside 0..1; onNode owns their validation.
            ||!Array.isArray(p.events)||p.events.length>10||!p.events.every(e=>keys(e,['kind','at','x','y'])&&['departed','arrived','observed','returned','stopped','failed','unreachable'].includes(e.kind)&&Number.isFinite(e.at)&&e.at>=0&&e.at<=g.elapsed&&point(e)&&(['stopped','failed','unreachable'].includes(e.kind)||onNode(e)||p.free&&e.kind==='departed'&&distance(e,p.home)<=50))
            ||!keys(p.attempts,slots)||!Object.values(p.attempts).every(s=>['pending','complete','cancelled','failed'].includes(s))
            ||!Array.isArray(p.lines)||p.lines.length>6||new Set(p.lines.map(l=>l.slot)).size!==p.lines.length||!p.lines.every(l=>keys(l,['slot','speaker','text'])&&slots.includes(l.slot)&&p.attempts[l.slot]==='complete'&&l.speaker===(['offer','feedback'].includes(l.slot)?'mentor':'companion')&&typeof l.text==='string'&&l.text.trim()&&l.text.length<=300&&!/[\u0000-\u001f\u007f]/.test(l.text))
            ||![null,'accept','decline','ask'].includes(p.choice))return false;ids.add(p.id);
            if(['report','feedback','done'].includes(p.phase)&&p.npc!=='building'&&!(p.gift&&p.choice==='decline')&&!p.events.some(e=>e.kind==='returned'&&distance(e,p.home)<.01))return false;
            if(p.route.length){for(let i=1;i<p.route.length;i++){const a=nodes.find(n=>distance(p.route[i-1],{x:n.x/800,y:n.y/480})<.01),j=nodes.findIndex(n=>distance(p.route[i],{x:n.x/800,y:n.y/480})<.01);if(!a.edges.includes(j))return false;}
                if(p===current(g)&&distance(g,p.route[0])>51)return false;}
            return true;});}
    return {slots,current,active,create,createFree,context,due,finish,decide,stop,suspend,resolve,tick,valid,route,ackOnly,supply,validSupply,validContext,validSpeech,inventory,possessions,validPossessions,relationship,validRelationship,validAffinity,heard,
        types,allItems,bottle,targets,validGather,gatheringDirective,socialContext,validExchange,historicalPossessions,validInventorySnapshot,giftMemory,finding,introduction,validIntroduction,compass,absence,
        building,validBuilding,validBuilderChoice,validBuilderAffinity,builderDelivery};
});
