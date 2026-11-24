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
    function route(g,to){const nodes=walk.graph(g),nearest=p=>nodes.reduce((best,n,i)=>distance(p,{x:n.x/800,y:n.y/480})<distance(p,{x:nodes[best].x/800,y:nodes[best].y/480})?i:best,0);
        if(!nodes.length)return null;const start=nearest(g),end=nearest(to);
        if(distance(g,{x:nodes[start].x/800,y:nodes[start].y/480})>50||distance(to,{x:nodes[end].x/800,y:nodes[end].y/480})>.01)return null;
        const queue=[start],previous=new Map([[start,null]]);for(let i=0;i<queue.length&&!previous.has(end);i++)for(const n of nodes[queue[i]].edges)if(!previous.has(n)){previous.set(n,queue[i]);queue.push(n);}
        if(!previous.has(end))return null;const result=[];for(let i=end;i!==null;i=previous.get(i))result.unshift({x:nodes[i].x/800,y:nodes[i].y/480});return result;}
    function event(g,p,kind){p.events.push({kind,at:g.elapsed,x:g.x,y:g.y});}
    function create(g,arrival){
        if(g.mode!=='idle'||active(g)||!g.receipts.some(r=>r.id===arrival.id&&r.target===arrival.target&&r.kind==='walk'))return null;
        const home={x:g.x,y:g.y},candidates=perception.chips(g).filter(c=>/^chip:(mountain_|palms_)/.test(c.id)&&c.id!==arrival.target)
            .map(c=>({id:c.id,path:walk.plan(g,c.id)})).filter(c=>c.path&&route({...g,...c.path.at(-1)},home));
        const chosen=candidates[0]||{id:arrival.target,path:walk.plan(g,arrival.target)};if(!chosen.path||!route({...g,...chosen.path.at(-1)},home))return null;
        const end=chosen.path.at(-1),nodes=walk.graph(g),at=nodes.find(n=>distance(end,{x:n.x/800,y:n.y/480})<.01);
        if(!at?.edges.length)return null;const neighbor=nodes[at.edges[0]],p={id:arrival.id,homeTarget:arrival.target,home,target:chosen.id,phase:'offer',suspended:false,
            route:[],tour:[{x:neighbor.x/800,y:neighbor.y/480},end],surveyIndex:0,timer:0,events:[],attempts:{},lines:[],choice:null};
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
        if(JSON.stringify(c).length>1200)throw Error('practice_budget');return c;
    }
    function validContext(c){return keys(c,['id','goal','phase','suspended','target','home','hunger','fatigue','reachable','returnable','choice','results','experience','meeting'])
        &&(c.meeting===undefined||c.phase==='offer'&&['first','again'].includes(c.meeting))
        &&/^event-[1-9]\d*$/.test(c.id)&&c.goal==='survey-and-return'&&phases.includes(c.phase)&&typeof c.suspended==='boolean'
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
        if(slot==='offer')p.phase='decision';else if(slot==='decision')decide(g,p,result.choice);
        else if(slot==='report')p.phase='feedback';else if(slot==='feedback')p.phase='done';}
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
        p.timer+=dt;if(p.timer<6)return;p.timer=0;event(g,p,'observed');p.route=route(g,p.tour[p.surveyIndex++])||[];
        if(!p.route.length)stop(g,true);
    }
    function valid(g){if(g.practices===undefined)return true;if(!Array.isArray(g.practices))return false;const ids=new Set(),nodes=walk.graph(g);
        const onNode=p=>point(p)&&nodes.some(n=>distance(p,{x:n.x/800,y:n.y/480})<.01);
        return g.practices.every(p=>{if(!keys(p,['id','homeTarget','home','target','phase','suspended','route','tour','surveyIndex','timer','events','attempts','lines','choice'])
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
    return {slots,current,active,create,context,due,finish,decide,stop,suspend,resolve,tick,valid,route,ackOnly,supply,validSupply,validContext,validSpeech};
});
