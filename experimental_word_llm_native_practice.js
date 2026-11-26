(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_llm_native_walk'):root.NativeWalk,
    typeof module==='object'&&module.exports?require('./experimental_word_llm_native_perception'):root.NativePerception);
    if(typeof module==='object'&&module.exports)module.exports=api;else root.NativePractice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(walk,perception){
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
    const short=(s,n)=>typeof s==='string'&&s.trim().length>0&&s.length<=n&&!/[\u0000-\u001f\u007f]/.test(s);
    function relationship(g,before=null,include=false){let hearts=1,last=null;
        for(const p of g.practices||[]){if(p===before&&!include)break;if(p.affinity){
            const next=Math.max(0,Math.min(5,hearts+p.affinity.delta));
            if(next!==hearts)last={delta:next-hearts,reason:p.affinity.reason};hearts=next;}if(p===before)break;}
        return {hearts,last};}
    function validRelationship(r){return keys(r,['hearts','last'])&&Number.isInteger(r.hearts)&&r.hearts>=0&&r.hearts<=5
        &&(r.last===null||keys(r.last,['delta','reason'])&&[-1,1].includes(r.last.delta)&&short(r.last.reason,120));}
    function validAffinity(a,p){if(!p?.social||!Array.isArray(p.lines)||!Array.isArray(p.events)||!p.attempts||!keys(a,['slot','delta','reason','quote','kind'])||![-1,0,1].includes(a.delta)
        ||!short(a.reason,120)||!short(a.quote,300)||!['conversation','conduct'].includes(a.kind))return false;
        const line=p.lines.find(l=>l?.slot===(a.slot==='decision'?'decision':'report'));
        if(!line?.text.includes(a.quote))return false;
        if(a.slot==='decision')return p.choice==='decline'&&a.kind==='conversation'&&p.attempts.decision==='complete';
        return a.slot==='feedback'&&p.attempts.feedback==='complete'&&p.events.some(e=>e?.kind==='returned')
            &&(a.kind!=='conduct'||a.delta>=0);
    }
    // The mentor heard only direct replies, never a consultation or field remark.
    const heard=(lines,audience)=>lines.filter(l=>['offer','report','feedback'].includes(l.slot)||l.slot==='decision'&&audience==='mentor');
    const inventory=g=>g.inventory||(g.inventory={version:1,open:false,items:[]});
    function possessions(g){const items=g.inventory?.items||[];return {open:g.inventory?.open||false,wood:items.filter(i=>i.type==='wood').length,stone:items.filter(i=>i.type==='stone').length};}
    function validPossessions(v){return keys(v,['open','wood','stone'])&&typeof v.open==='boolean'&&['wood','stone'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0);}
    function finding(g,p,step){return g.inventory?.items.find(i=>i.practice===p.id&&i.step===step)||null;}
    function collect(g,p,step){if(!p.gather)return;const bag=inventory(g),index=[0,1].find(n=>!bag.items.some(i=>i.id===p.target+':material:'+n));
        if(index===undefined)return;bag.items.push({id:p.target+':material:'+index,type:material(p.target),target:p.target,practice:p.id,step,at:g.elapsed});}
    function validInventory(g){const expected=[],counts=new Map();
        if(g.practices!==undefined&&!Array.isArray(g.practices))return false;
        for(const p of g.practices||[]){if(!p?.gather)continue;if(!Array.isArray(p.events))return false;
            for(const [index,e]of p.events.filter(e=>e?.kind==='observed').entries()){const n=counts.get(p.target)||0;if(n>=2)continue;counts.set(p.target,n+1);
                expected.push({id:p.target+':material:'+n,type:material(p.target),target:p.target,practice:p.id,step:index+1,at:e.at});}}
        if(g.inventory===undefined)return expected.length===0;const bag=g.inventory;
        return keys(bag,['version','open','items'])&&bag.version===1&&typeof bag.open==='boolean'&&Array.isArray(bag.items)&&bag.items.length===expected.length
            &&expected.every(e=>bag.items.some(i=>i&&Object.keys(e).every(k=>i[k]===e[k])))
            &&new Set(bag.items.map(i=>i?.id)).size===bag.items.length&&bag.items.length<=Object.keys(g.island.assets).length*2
            &&bag.items.every(i=>keys(i,['id','type','target','practice','step','at'])&&typeof i.target==='string'&&/^chip:(?:mountain_|palms_)/.test(i.target)
                &&!!perception.asset(g,i.target)&&[0,1].some(n=>i.id===i.target+':material:'+n)&&i.type===material(i.target)&&[1,2].includes(i.step)
                &&Number.isFinite(i.at)&&i.at>=0&&i.at<=g.elapsed);
    }
    function route(g,to){const nodes=walk.graph(g),nearest=p=>nodes.reduce((best,n,i)=>distance(p,{x:n.x/800,y:n.y/480})<distance(p,{x:nodes[best].x/800,y:nodes[best].y/480})?i:best,0);
        if(!nodes.length)return null;const start=nearest(g),end=nearest(to);
        if(distance(g,{x:nodes[start].x/800,y:nodes[start].y/480})>50||distance(to,{x:nodes[end].x/800,y:nodes[end].y/480})>.01)return null;
        const queue=[start],previous=new Map([[start,null]]);for(let i=0;i<queue.length&&!previous.has(end);i++)for(const n of nodes[queue[i]].edges)if(!previous.has(n)){previous.set(n,queue[i]);queue.push(n);}
        if(!previous.has(end))return null;const result=[];for(let i=end;i!==null;i=previous.get(i))result.unshift({x:nodes[i].x/800,y:nodes[i].y/480});return result;}
    function event(g,p,kind){p.events.push({kind,at:g.elapsed,x:g.x,y:g.y});}
    function create(g,arrival){
        if(g.mode!=='idle'||active(g)||!g.receipts.some(r=>r.id===arrival.id&&r.target===arrival.target&&r.kind==='walk'))return null;
        const home={x:g.x,y:g.y},candidates=perception.chips(g).filter(c=>/^chip:(mountain_|palms_)/.test(c.id)&&c.id!==arrival.target
            &&(g.inventory?.items||[]).filter(i=>i.target===c.id).length<2)
            .map(c=>({id:c.id,path:walk.plan(g,c.id)})).filter(c=>c.path&&route({...g,...c.path.at(-1)},home));
        const chosen=candidates[0]||((g.inventory?.items||[]).filter(i=>i.target===arrival.target).length<2?{id:arrival.target,path:walk.plan(g,arrival.target)}:null);if(!chosen?.path||!route({...g,...chosen.path.at(-1)},home))return null;
        const end=chosen.path.at(-1),nodes=walk.graph(g),at=nodes.find(n=>distance(end,{x:n.x/800,y:n.y/480})<.01);
        if(!at?.edges.length)return null;const neighbor=nodes[at.edges[0]],p={id:arrival.id,homeTarget:arrival.target,home,target:chosen.id,phase:'offer',suspended:false,
            route:[],tour:[{x:neighbor.x/800,y:neighbor.y/480},end],surveyIndex:0,timer:0,events:[],attempts:{},lines:[],choice:null,gather:true,social:true};
        (g.practices||(g.practices=[])).push(p);return p;
    }
    function context(g,p=current(g)){
        if(!p)return null;const asset=perception.asset(g,p.target),c={id:p.id,goal:'survey-and-return',phase:p.phase,suspended:p.suspended,
            target:{id:p.target,kind:p.target.startsWith('chip:mountain_')?'mountain':'forest'},home:p.homeTarget,
            hunger:g.hunger,fatigue:g.fatigue,reachable:!!asset&&!!walk.plan(g,p.target),returnable:!!route(g,p.home),
            choice:p.choice,results:p.events.slice(-3).map(e=>({kind:e.kind,at:e.at})),
            experience:g.receipts.filter(r=>['observe','walk'].includes(r.kind)).slice(-2).map(r=>({kind:r.kind,targetKind:r.target.startsWith('chip:mountain_')?'mountain':r.target.startsWith('chip:palms_')?'forest':'other'}))};
        const prior=g.practices?.slice(0,-1).findLast(record=>record.events.some(e=>e.kind==='returned'));
        if(prior)c.experience.push({kind:'survey-return',targetKind:prior.target.startsWith('chip:mountain_')?'mountain':'forest'});
        if(p.gather){c.goal='gather-and-return';c.collection={type:material(p.target),goal:2,found:[1,2].filter(step=>p.events.filter(e=>e.kind==='observed').length>=step)
            .map(step=>({step,count:finding(g,p,step)?1:0})),obtained:(g.inventory?.items||[]).filter(i=>i.practice===p.id).length};}
        if(p.social)c.relationship=relationship(g,p,true);
        if(JSON.stringify(c).length>1200)throw Error('practice_budget');return c;
    }
    function validContext(c){return keys(c,['id','goal','phase','suspended','target','home','hunger','fatigue','reachable','returnable','choice','results','experience','meeting','collection','relationship'])
        &&(c.relationship===undefined||validRelationship(c.relationship))
        &&(c.goal==='survey-and-return'?c.collection===undefined:c.goal==='gather-and-return'&&keys(c.collection,['type','goal','found','obtained'])
            &&c.collection.type===material(c.target?.id||'')&&c.collection.goal===2&&Array.isArray(c.collection.found)&&c.collection.found.length<=2
            &&c.collection.found.every((f,i)=>keys(f,['step','count'])&&f.step===i+1&&[0,1].includes(f.count))&&c.collection.obtained===c.collection.found.reduce((n,f)=>n+f.count,0))
        &&(c.meeting===undefined||c.phase==='offer'&&['first','again'].includes(c.meeting))
        &&/^event-[1-9]\d*$/.test(c.id)&&phases.includes(c.phase)&&typeof c.suspended==='boolean'
        &&keys(c.target,['id','kind'])&&/^chip:(?:mountain_|palms_)/.test(c.target.id)&&c.target.id.length<=80&&['forest','mountain'].includes(c.target.kind)
        &&typeof c.home==='string'&&c.home.length<=80&&/^chip:(?:mountain_|palms_)/.test(c.home)
        &&['hunger','fatigue'].every(k=>Number.isFinite(c[k])&&c[k]>=0&&c[k]<=1)&&typeof c.reachable==='boolean'&&typeof c.returnable==='boolean'
        &&[null,'accept','decline','ask'].includes(c.choice)&&Array.isArray(c.results)&&c.results.length<=3&&c.results.every(r=>keys(r,['kind','at'])&&['departed','arrived','observed','returned','stopped','failed','unreachable'].includes(r.kind)&&Number.isFinite(r.at)&&r.at>=0)
        &&Array.isArray(c.experience)&&c.experience.length<=3&&c.experience.every(e=>keys(e,['kind','targetKind'])&&['observe','walk','survey-return'].includes(e.kind)&&['forest','mountain','other'].includes(e.targetKind))&&JSON.stringify(c).length<=1200;}
    function validSpeech(lines){return Array.isArray(lines)&&lines.length<=6&&new Set(lines.map(l=>l?.slot)).size===lines.length&&lines.every(l=>keys(l,['slot','speaker','text'])&&slots.includes(l.slot)&&l.speaker===(['offer','feedback'].includes(l.slot)?'mentor':'companion')&&typeof l.text==='string'&&l.text.trim()&&l.text.length<=300&&!/[\u0000-\u001f\u007f]/.test(l.text));}
    function supply(g){if(!current(g))return null;const result={context:context(g),speech:clone(current(g).lines)};
        while(result.speech.length&&JSON.stringify({practice:result}).length>4000)result.speech.shift();return result;}
    const validSupply=s=>keys(s,['context','speech'])&&validContext(s.context)&&validSpeech(s.speech)&&JSON.stringify(s).length<=4000;
    function due(p){if(!p||p.suspended||terminal.includes(p.phase))return null;
        if(['offer','decision'].includes(p.phase))return p.attempts[p.phase]?null:p.phase;
        const observed=p.events.filter(e=>e.kind==='observed').length;
        for(let i=1;i<=Math.min(2,observed);i++)if(!p.attempts['observe'+i])return 'observe'+i;
        if(['report','feedback'].includes(p.phase)&&!p.attempts[p.phase])return p.phase;return null;
    }
    function travel(g,p,phase,to){const next=phase==='outbound'?walk.plan(g,p.target):route(g,to);
        if(!next){p.phase='failed';p.route=[];event(g,p,'unreachable');return false;}p.phase=phase;p.route=next;return true;}
    function decide(g,p,choice){p.choice=choice;if(choice==='ask'){p.phase='consult';return true;}
        if(choice==='decline'){p.phase='declined';return true;}
        if(choice!=='accept'||g.hunger>=.8||g.fatigue>=.8){p.phase='consult';p.choice='ask';return false;}
        if(!travel(g,p,'outbound'))return false;event(g,p,'departed');return true;}
    function finish(g,slot,result){const p=current(g);if(!p||p.attempts[slot]!=='pending')throw Error('stale');
        p.attempts[slot]='complete';p.lines.push({slot,speaker:['offer','feedback'].includes(slot)?'mentor':'companion',text:result.text});
        if(slot==='decision')p.decisionAudience=result.choice==='ask'?'player':'mentor';
        if(slot==='offer')p.phase='decision';else if(slot==='decision')decide(g,p,result.choice);
        else if(slot==='report')p.phase='feedback';else if(slot==='feedback')p.phase='done';
        const a=result.affinity;if(!p.affinity&&a&&validAffinity({...a,slot},p))p.affinity={...clone(a),slot};}
    function stop(g,failed=false){const p=current(g);if(!p||terminal.includes(p.phase))return;
        p.phase=failed?'failed':'stopped';p.route=[];p.suspended=false;for(const s of slots)if(p.attempts[s]==='pending')p.attempts[s]='cancelled';event(g,p,failed?'failed':'stopped');}
    function suspend(g){const p=current(g);if(!p||terminal.includes(p.phase))return false;
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
        if(p.phase==='return'){if(distance(g,p.home)>.01){stop(g,true);return;}event(g,p,'returned');p.phase='report';return;}
        if(p.surveyIndex===2){travel(g,p,'return',p.home);return;}
        p.timer+=dt;if(p.timer<6)return;p.timer=0;event(g,p,'observed');collect(g,p,p.surveyIndex+1);p.route=route(g,p.tour[p.surveyIndex++])||[];
        if(!p.route.length)stop(g,true);
    }
    function valid(g){if(!validInventory(g))return false;if(g.practices===undefined)return true;if(!Array.isArray(g.practices))return false;const ids=new Set(),nodes=walk.graph(g);
        const onNode=p=>point(p)&&nodes.some(n=>distance(p,{x:n.x/800,y:n.y/480})<.01);
        return g.practices.every(p=>{if(!keys(p,['id','homeTarget','home','target','phase','suspended','route','tour','surveyIndex','timer','events','attempts','lines','choice','gather','social','affinity','decisionAudience'])||!(p.gather===undefined||p.gather===true)
            ||!(p.decisionAudience===undefined||['mentor','player'].includes(p.decisionAudience)&&p.attempts?.decision==='complete')
            ||!(p.social===undefined||p.social===true)||p.affinity!==undefined&&!validAffinity(p.affinity,p)
            ||ids.has(p.id)||!/^event-[1-9]\d*$/.test(p.id)||!g.receipts.some(r=>r.id===p.id&&r.kind==='walk'&&r.target===p.homeTarget)
            ||!/^chip:(?:mountain_|palms_)/.test(p.target)||!perception.asset(g,p.target)||!onNode(p.home)||!phases.includes(p.phase)||typeof p.suspended!=='boolean'
            ||!Array.isArray(p.route)||p.route.length>2000||!p.route.every(onNode)||!Array.isArray(p.tour)||p.tour.length!==2||!p.tour.every(onNode)
            ||!Number.isInteger(p.surveyIndex)||p.surveyIndex<0||p.surveyIndex>2||!Number.isFinite(p.timer)||p.timer<0||p.timer>6.1
            ||!Array.isArray(p.events)||p.events.length>10||!p.events.every(e=>keys(e,['kind','at','x','y'])&&['departed','arrived','observed','returned','stopped','failed','unreachable'].includes(e.kind)&&Number.isFinite(e.at)&&e.at>=0&&e.at<=g.elapsed&&point(e)&&e.x>=0&&e.x<=1&&e.y>=0&&e.y<=1&&(['stopped','failed','unreachable'].includes(e.kind)||onNode(e)))
            ||!keys(p.attempts,slots)||!Object.values(p.attempts).every(s=>['pending','complete','cancelled','failed'].includes(s))
            ||!Array.isArray(p.lines)||p.lines.length>6||new Set(p.lines.map(l=>l.slot)).size!==p.lines.length||!p.lines.every(l=>keys(l,['slot','speaker','text'])&&slots.includes(l.slot)&&p.attempts[l.slot]==='complete'&&l.speaker===(['offer','feedback'].includes(l.slot)?'mentor':'companion')&&typeof l.text==='string'&&l.text.trim()&&l.text.length<=300&&!/[\u0000-\u001f\u007f]/.test(l.text))
            ||![null,'accept','decline','ask'].includes(p.choice))return false;ids.add(p.id);
            if(['report','feedback','done'].includes(p.phase)&&!p.events.some(e=>e.kind==='returned'&&distance(e,p.home)<.01))return false;
            if(p.route.length){for(let i=1;i<p.route.length;i++){const a=nodes.find(n=>distance(p.route[i-1],{x:n.x/800,y:n.y/480})<.01),j=nodes.findIndex(n=>distance(p.route[i],{x:n.x/800,y:n.y/480})<.01);if(!a.edges.includes(j))return false;}
                if(p===current(g)&&distance(g,p.route[0])>51)return false;}
            return true;});}
    return {slots,current,active,create,context,due,finish,decide,stop,suspend,resolve,tick,valid,route,ackOnly,supply,validSupply,validContext,validSpeech,inventory,possessions,validPossessions,relationship,validRelationship,validAffinity,heard};
});
