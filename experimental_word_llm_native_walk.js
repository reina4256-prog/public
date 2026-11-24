(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_llm_native_perception'):root.NativePerception);if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeWalk=api;})(typeof globalThis!=='undefined'?globalThis:this,function(perception){
    'use strict';
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
    const movementKinds=['walk_start','walk','walk_failed','walk_interrupted'];
    function install(g){if(!g.walk)g.walk={version:1,confirmed:null,encounter:null,met:false};return g.walk;}
    function graph(g){
        const assets=Object.entries(g.island.assets),blocks=assets.filter(([,a])=>!['ground','road','water'].includes(a.type)).map(([,a])=>({x:a.dx+a.sw*a.scale/2,y:a.dy+a.sh*a.scale-12,rx:Math.max(10,a.sw*a.scale*.28),ry:14}));
        const nodes=assets.filter(([,a])=>['ground','road'].includes(a.type)).map(([key,a])=>({key,x:a.dx+a.sw*a.scale/2,y:a.dy+a.sh*a.scale/2,edges:[]}))
            .filter(p=>!blocks.some(b=>((p.x-b.x)/b.rx)**2+((p.y-b.y)/b.ry)**2<1));
        for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=Math.abs(nodes[i].x-nodes[j].x),dy=Math.abs(nodes[i].y-nodes[j].y);
            if(Math.abs(dx-50)<1&&dy<1||Math.abs(dx-25)<1&&Math.abs(dy-25)<1){nodes[i].edges.push(j);nodes[j].edges.push(i);}}
        return nodes;
    }
    function plan(g,id){const a=perception.asset(g,id);if(!a)return null;const nodes=graph(g);if(!nodes.length)return null;
        let start=0;for(let i=1;i<nodes.length;i++)if(Math.hypot(nodes[i].x-g.x*800,nodes[i].y-g.y*480)<Math.hypot(nodes[start].x-g.x*800,nodes[start].y-g.y*480))start=i;
        if(Math.hypot(nodes[start].x-g.x*800,nodes[start].y-g.y*480)>50)return null;
        const queue=[start],previous=new Map([[start,null]]);
        for(let i=0;i<queue.length;i++)for(const next of nodes[queue[i]].edges)if(!previous.has(next)){previous.set(next,queue[i]);queue.push(next);}
        const x=a.dx+a.sw*a.scale/2,y=a.dy+a.sh*a.scale;
        const distance=i=>Math.hypot(nodes[i].x-x,nodes[i].y-y);
        const end=queue.sort((i,j)=>distance(i)-distance(j))[0];if(distance(end)>85)return null;
        const route=[];for(let i=end;i!==null;i=previous.get(i))route.unshift({x:nodes[i].x/800,y:nodes[i].y/480});return route;
    }
    function directive(input,kind){if(typeof input!=='string'||/[「」『』“”"?？]/u.test(input))return false;const s=input.normalize('NFKC').trim().toLowerCase().replace(/[。！!.,，]+$/u,'');
        if(kind==='stop')return /^(?:止まって|そこで止まって|ストップ|歩くのをやめて|移動をやめて|stop(?: walking| moving)?|停下|停止|остановись|стой|detente|para|pare|parar|stopp|halt)$/u.test(s);
        if(/歩かない|行かない|しないで|と思|言って|言葉|教え|don't|do not|nicht|не |no camines|não/u.test(s))return false;
        return /歩いて|歩こう|移動して|向かって|行って|進んで/u.test(s)||/^(?:please[ ,]+)?(?:walk|go|head|move)\b/u.test(s)
            ||/^(?:请|那就|那么)?(?:走|去|移动)/u.test(s)||/^(?:пожалуйста[ ,]+)?(?:иди|идём|идем|подойди|двигайся)\b/u.test(s)
            ||/^(?:por favor[ ,]+)?(?:camina|ve|anda|acércate)\b/u.test(s)||/^(?:por favor[ ,]+)?(?:ande|caminhe|vá|vai)\b/u.test(s)||/^(?:bitte[ ,]+)?(?:geh|gehe|lauf|laufe|bewege)\b/u.test(s);
    }
    function event(g,kind,target,cause,reason){const a=perception.asset(g,target);if(!a)return;
        const r={id:'event-'+(g.receipts.length+1),kind,target,label:String(a.name||a.type).slice(0,80),at:g.elapsed,cause,hunger:g.hunger,fatigue:g.fatigue};if(reason)r.reason=reason;g.receipts.push(r);return r;}
    function idle(g){g.mode='idle';g.destination=null;g.intent=null;g.route=[];g.cause=null;g.remaining=0;}
    function apply(g,action,cause,packet){
        if(!action)return {accepted:true};const w=install(g);
        if(!directive(packet.input,action.kind))return {accepted:false,reason:'instruction'};
        if(action.kind==='stop'){if(g.mode!=='move')return {accepted:false,reason:'idle'};event(g,'walk_interrupted',g.destination,cause,'stopped');idle(g);return {accepted:true};}
        const id=action.targetId;
        const fail=reason=>{event(g,'walk_failed',id,cause,reason);return {accepted:false,reason};};
        if(g.mode!=='idle')return fail('busy');
        if(!packet.world.confirmed||packet.world.confirmed!==id||w.confirmed?.targetId!==id)return fail('unconfirmed');
        if(!packet.world.visible.some(p=>p.id===id))return fail('unavailable');
        const route=plan(g,id);if(!route)return fail('unreachable');
        g.mode='move';g.destination=id;g.intent='walk';g.route=route;g.cause=cause;event(g,'walk_start',id,cause);return {accepted:true};
    }
    function tick(g,dt){if(g.mode!=='move')return;
        const p=g.route[0];if(!p||!perception.asset(g,g.destination)){event(g,'walk_interrupted',g.destination,g.cause,'unavailable');idle(g);return;}
        const dx=p.x*800-g.x*800,dy=p.y*480-g.y*480,d=Math.hypot(dx,dy),step=dt*52;
        if(d>step){g.x+=dx/d*step/800;g.y+=dy/d*step/480;return;}
        g.x=p.x;g.y=p.y;g.route.shift();if(g.route.length)return;
        const target=g.destination,a=perception.asset(g,target);
        if(Math.hypot(g.x*800-(a.dx+a.sw*a.scale/2),g.y*480-(a.dy+a.sh*a.scale))>85){event(g,'walk_failed',target,g.cause,'unreachable');idle(g);return;}
        const r=event(g,'walk',target,g.cause);idle(g);
        if(/^chip:(?:mountain_|palms_)/.test(target))install(g).encounter={id:r.id,target,phase:'pending'};
    }
    function valid(g){if(!Array.isArray(g.route)||!Array.isArray(g.receipts))return false;const w=g.walk;if(!w)return g.mode==='idle'&&g.destination===null&&g.intent===null&&g.route.length===0&&g.remaining===0;
        if(w.version!==1||typeof w.met!=='boolean'||!Object.keys(w).every(k=>['version','met','confirmed','encounter'].includes(k)))return false;
        const c=w.confirmed;if(c&&(!perception.asset(g,c.targetId)||!/^turn-[1-9]\d*$/.test(c.turnId)||typeof c.quote!=='string'||c.quote.length>1000))return false;
        const e=w.encounter;if(e&&(!Object.keys(e).every(k=>['id','target','phase'].includes(k))||!['pending','video','conversation','done'].includes(e.phase)||!/^chip:(?:mountain_|palms_)/.test(e.target)||!g.receipts.some(r=>r.id===e.id&&r.kind==='walk'&&r.target===e.target)))return false;
        if(g.mode==='idle')return g.destination===null&&g.intent===null&&g.route.length===0&&g.remaining===0;
        if(g.mode!=='move'||g.intent!=='walk'||!perception.asset(g,g.destination)||!g.route.length||g.route.length>2000||g.remaining!==0||!/^turn-[1-9]\d*$/.test(g.cause))return false;
        const nodes=graph(g),index=p=>nodes.findIndex(n=>Math.abs(n.x/800-p.x)<1e-8&&Math.abs(n.y/480-p.y)<1e-8);
        if(!g.route.every(point)||!g.route.every(p=>index(p)>=0))return false;
        for(let i=1;i<g.route.length;i++)if(!nodes[index(g.route[i-1])].edges.includes(index(g.route[i])))return false;
        const a=perception.asset(g,g.destination),end=g.route.at(-1);
        return Math.hypot(g.route[0].x*800-g.x*800,g.route[0].y*480-g.y*480)<=51&&Math.hypot(end.x*800-(a.dx+a.sw*a.scale/2),end.y*480-(a.dy+a.sh*a.scale))<=85;
    }
    return {install,plan,directive,apply,tick,valid,movementKinds};
});
