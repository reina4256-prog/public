(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeHome=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const COST={wood:8,stone:4},DURATION=600000,ID='chip:player_home';
    const copy=x=>structuredClone(x),turn=s=>/^turn-[1-9]\d*$/.test(s),quote=s=>typeof s==='string'&&s.trim()&&s.length<=300;
    const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),keys=(o,a)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>a.includes(k));
    function crosses(a,b,x,y){let low=0,high=1;for(const [axis,center,radius]of [['x',x,8],['y',y,4]]){const d=b[axis]-a[axis],start=a[axis];if(!d){if(start<=center-radius||start>=center+radius)return false;continue;}
        const t0=(center-radius-start)/d,t1=(center+radius-start)/d;low=Math.max(low,Math.min(t0,t1));high=Math.min(high,Math.max(t0,t1));if(low>=high)return false;}return low<1&&high>0;}
    function eligible(g,practice){const b=practice.building(g);return !!g.walk?.builder?.met&&b.task.index===2&&b.hearts>=3;}
    function refresh(g,now,practice){if(!g.home&&eligible(g,practice))g.home={version:1,phase:'planning',qualified:g.practices.at(-1).id,history:[],now:0,inside:false};
        const h=g.home;if(!h)return;h.now=Math.max(h.now,Number.isSafeInteger(now)&&now>=0?now:0);
        if(h.phase==='building'&&h.now>=h.readyAt)h.phase='ready';}
    function site(g,walk){
        // Build in an existing ground tile, in the gap between real route nodes.
        // Foundation fits inside that gap: no route node or edge is removed.
        const nodes=walk.graph(g),assets=Object.entries(g.island.assets),blocks=assets.filter(([,a])=>!['ground','road'].includes(a.type));
        if(!nodes.length)return null;const nearest=nodes.reduce((best,n,i)=>Math.hypot(n.x-g.x*800,n.y-g.y*480)<Math.hypot(nodes[best].x-g.x*800,nodes[best].y-g.y*480)?i:best,0);
        if(Math.hypot(nodes[nearest].x-g.x*800,nodes[nearest].y-g.y*480)>50)return null;
        const reachable=new Set([nearest]),queue=[nearest];for(let i=0;i<queue.length;i++)for(const n of nodes[queue[i]].edges)if(!reachable.has(n)){reachable.add(n);queue.push(n);}
        for(const n of [...nodes].sort((a,b)=>Math.hypot(a.x-g.x*800,a.y-g.y*480)-Math.hypot(b.x-g.x*800,b.y-g.y*480))){
            const ground=g.island.assets[n.key];if(ground.type!=='ground'||!reachable.has(nodes.indexOf(n))||Math.hypot(n.x-g.x*800,n.y-g.y*480)>180)continue;
            const x=n.x+25,y=n.y+12;
            if(![-8,8].every(dx=>[-4,4].every(dy=>assets.some(([,a])=>a.type==='ground'&&x+dx>=a.dx&&x+dx<=a.dx+a.sw*a.scale&&y+dy>=a.dy&&y+dy<=a.dy+a.sh*a.scale))))continue;
            if(blocks.some(([,a])=>x+22>a.dx&&x-22<a.dx+a.sw*a.scale&&y+10>a.dy&&y-48<a.dy+a.sh*a.scale))continue;
            if(nodes.some(p=>Math.abs(p.x-x)<8&&Math.abs(p.y-y)<4))continue;
            // All graph edges must stay clear of the foundation rectangle.
            if(nodes.some((p,i)=>p.edges.some(j=>j>i&&crosses(p,nodes[j],x,y))))continue;
            return {id:'site:'+n.key,key:n.key,x:x/800,y:y/480,door:{x:n.x/800,y:n.y/480}};
        }return null;
    }
    function validSite(g,s){const a=s&&g.island.assets[s.key];if(!(keys(s,['id','key','x','y','door'])&&a?.type==='ground'&&s.id==='site:'+s.key&&point(s)&&point(s.door)
        &&s.x===(a.dx+a.sw*a.scale/2+25)/800&&s.y===(a.dy+a.sh*a.scale/2+12)/480&&s.door.x===(a.dx+a.sw*a.scale/2)/800&&s.door.y===(a.dy+a.sh*a.scale/2)/480))return false;
        const x=s.x*800,y=s.y*480,assets=Object.values(g.island.assets);
        return [-8,8].every(dx=>[-4,4].every(dy=>assets.some(a=>a.type==='ground'&&x+dx>=a.dx&&x+dx<=a.dx+a.sw*a.scale&&y+dy>=a.dy&&y+dy<=a.dy+a.sh*a.scale)))
            &&!assets.some(a=>!['ground','road'].includes(a.type)&&x+22>a.dx&&x-22<a.dx+a.sw*a.scale&&y+10>a.dy&&y-48<a.dy+a.sh*a.scale);}
    function summary(g,walk,practice){const h=g.home;if(!h)return null;const b=practice.building(g),bag=practice.possessions(g,false);
        const s={phase:h.phase,cost:COST,held:b.held,missing:{wood:Math.max(0,8-b.held.wood-bag.wood),stone:Math.max(0,4-b.held.stone-bag.stone)},minutes:10};
        if(h.phase==='planning'){const c=h.site||site(g,walk);if(c)s.site={id:c.id,x:c.x,y:c.y};s.proposed=!!h.site;s.confirmed=!!h.confirmed;s.requested=!!h.request;s.consulted=!!consultation(g);}
        else{s.remaining=Math.max(0,Math.ceil((h.readyAt-h.now)/1000));s.inside=h.inside;}
        return s;
    }
    function directive(input,kind){if(typeof input!=='string'||/[?？「」『』“”"]/u.test(input))return false;const s=input.normalize('NFKC').toLowerCase();
        if(/ないで|しない|やめない|とは|意味|言葉|と言|と思|don't|do not|never|\bnot\b|не |não|nicht|不要|别|no (?:construyas|entres)/u.test(s))return false;
        const home=/家|小屋|建築|建て|home|house|hut|build|casa|cabaña|cabana|haus|hütte|дом|хижин|стро|房|建造/u.test(s);
        if(kind==='site')return home&&/場所|空き地|用地|丸|〇|○|place|site|spot|mark|lugar|terreno|stelle|platz|мест|участ|位置|空地/u.test(s);
        if(kind==='confirm')return /^(?:うん|はい|そう|そこでいい|この場所でいい|yes|that's right|sí|sim|ja|да|对|是的)[。.!！、,\s]*$/u.test(s);
        if(kind==='cancel')return home&&/やめて|取り消|取消|cancel|abbrech|отмен/u.test(s);
        if(kind==='build')return home&&!/建てている|建てていた|建てています|建てており/u.test(s)&&(/建てて|建てよう|建築を頼|建築して|着工して/u.test(s)
            ||/^(?:please[ ,]+)?(?:build|construct)\b|^(?:por favor[ ,]+)?(?:construye|construa)\b|^(?:bitte[ ,]+)?baue\b|^(?:пожалуйста[ ,]+)?построй(?=\s|$)|^(?:请)?(?:建造|建房)/u.test(s));
        if(kind==='enter')return home&&/入って|入りたい|enter|entra|betritt|hinein|войди|进/u.test(s);
        if(kind==='exit')return /出て|外に|退出|leave|exit|salir|sai|raus|verlass|выйди|出去/u.test(s);return false;
    }
    function validRequest(r,p){if(r===undefined||r===null)return true;const h=p.inventory?.home;
        if(!h||!keys(r,['kind','quote'])||!['site','confirm','build','cancel','enter','exit'].includes(r.kind)||!quote(r.quote)||!p.input.includes(r.quote)||!directive(p.input,r.kind)||!directive(r.quote,r.kind))return false;
        if(p.world.currentAction!=='idle'||p.world.search?.phase==='active'||p.practice&&!['done','declined','stopped','failed'].includes(p.practice.context.phase)||p.inventory.absence?.status==='paused'||p.inventory.absence?.status==='reserved')return false;
        return r.kind==='site'?h.phase==='planning'&&!!h.site&&!h.proposed&&!h.requested:r.kind==='confirm'?h.phase==='planning'&&h.proposed&&!h.confirmed
            :r.kind==='build'?h.phase==='planning'&&h.confirmed&&!h.requested&&!h.missing.wood&&!h.missing.stone:r.kind==='cancel'?h.phase==='planning'
            :r.kind==='enter'?h.phase==='ready'&&!h.inside:r.kind==='exit'?h.phase==='ready'&&h.inside:false;
    }
    function apply(g,r,id,p,walk,practice){if(!validRequest(r,p)||!g.home)return false;const h=g.home;
        if(r.kind==='site'){const c=site(g,walk);if(!c||c.id!==p.inventory.home.site.id)return false;h.site=c;delete h.confirmed;}
        if(r.kind==='confirm'){if(!h.site||!h.history.some(e=>e.kind==='site'&&Number(e.turn.slice(5))<Number(id.slice(5))))return false;h.confirmed={turn:id,quote:r.quote};}
        if(r.kind==='build'){if(!h.confirmed||Number(h.confirmed.turn.slice(5))>=Number(id.slice(5)))return false;h.request={turn:id,quote:r.quote};g.taskPanelOpen=true;}
        if(r.kind==='cancel'){delete h.site;delete h.confirmed;delete h.request;}
        if(r.kind==='enter'){const route=walk.plan(g,ID,true);if(!route)return false;h.travel={turn:id,quote:r.quote,route};}
        if(r.kind==='exit')h.inside=false;
        h.history.push({turn:id,kind:r.kind,quote:r.quote,...(r.kind==='site'?{site:copy(h.site)}:{})});return true;
    }
    function consultation(g,before=null){const list=g.practices||[];return (before?list.slice(0,list.findIndex(p=>p.id===before)):list).findLast(p=>p.npc==='building'&&p.homeConsent?.offer?.source===p.id&&p.homeConsent?.decision?.source===p.id);}
    function source(g,p){const h=g.home;return h?.request?.turn||(h?.confirmed&&consultation(g,p?.id)?h.confirmed.turn:null);}
    function context(g,practice,p){const h=g.home;if(!h||h.phase!=='planning'&&h.payment?.practice!==p?.id)return null;const b=practice.building(g),bag=practice.possessions(g,false),s=source(g,p),ready=!!s;
        return {source:s||p.id,mode:ready?'build':'consult',phase:h.phase,request:ready?(h.request||h.confirmed).quote.slice(0,120):null,site:ready?h.site.id:null,cost:COST,held:b.held,available:{wood:Math.min(6,bag.wood),stone:Math.min(2,bag.stone)},minutes:10,irreversible:true,...(p?.homeConsent?.offer?.source===(s||p.id)?{offer:p.homeConsent.offer.quote}:{})};}
    function validContext(c){return keys(c,['source','mode','phase','request','site','cost','held','available','minutes','irreversible','offer'])&&(c.offer===undefined||quote(c.offer)&&c.offer.length<=120)&&(c.mode==='consult'?/^event-[1-9]\d*$/.test(c.source)&&c.request===null&&c.site===null&&c.phase==='planning':(c.mode===undefined||c.mode==='build')&&turn(c.source)&&quote(c.request)&&typeof c.site==='string'&&c.site.startsWith('site:'))&&['planning','building','ready'].includes(c.phase)
        &&JSON.stringify(c.cost)===JSON.stringify(COST)&&c.minutes===10&&c.irreversible===true&&keys(c.held,['wood','stone'])&&['wood','stone'].every(t=>c.held[t]===2)&&keys(c.available,['wood','stone'])&&Number.isInteger(c.available.wood)&&c.available.wood>=0&&c.available.wood<=6&&Number.isInteger(c.available.stone)&&c.available.stone>=0&&c.available.stone<=2;}
    function validSummary(s){return keys(s,['phase','cost','held','missing','minutes','site','confirmed','proposed','requested','consulted','remaining','inside'])&&['planning','building','ready'].includes(s.phase)&&JSON.stringify(s.cost)===JSON.stringify(COST)&&s.minutes===10
        &&keys(s.held,['wood','stone'])&&keys(s.missing,['wood','stone'])&&['wood','stone'].every(t=>s.held[t]===2&&Number.isSafeInteger(s.missing[t])&&s.missing[t]>=0&&s.missing[t]<=COST[t])
        &&(s.site===undefined||keys(s.site,['id','x','y'])&&point(s.site)&&typeof s.site.id==='string'&&s.site.id.startsWith('site:'))
        &&['confirmed','proposed','requested','consulted','inside'].every(k=>s[k]===undefined||typeof s[k]==='boolean')&&(s.remaining===undefined||Number.isSafeInteger(s.remaining)&&s.remaining>=0&&s.remaining<=600);}
    function commit(g,p,practice){const h=g.home,s=source(g,p);if(!s||h.phase!=='planning'||p.homeConsent?.offer?.source!==s||p.homeConsent?.decision?.source!==s)return false;
        const b=practice.building(g),items=[];for(const type of ['wood','stone']){const list=(g.inventory?.items||[]).filter(i=>i.type===type).slice(0,COST[type]-b.held[type]);if(list.length!==COST[type]-b.held[type])return false;items.push(...list);}
        h.payment={source:s,practice:p.id,items:items.map(i=>i.id),held:copy(b.held)};
        for(const item of items){g.inventory.items.splice(g.inventory.items.findIndex(i=>i.id===item.id),1);(g.inventory.spent||(g.inventory.spent=[])).push({by:'house-'+s,item:copy(item)});}
        h.startedAt=h.now;h.readyAt=h.now+DURATION;h.phase='building';return true;
    }
    function tick(g,seconds){const h=g.home;if(!h?.travel)return;const p=h.travel.route[0];if(!p){delete h.travel;h.inside=true;return;}
        const dx=(p.x-g.x)*800,dy=(p.y-g.y)*480,d=Math.hypot(dx,dy),step=52*seconds;
        if(d<=step){g.x=p.x;g.y=p.y;h.travel.route.shift();}else{g.x+=dx/d*step/800;g.y+=dy/d*step/480;}}
    function asset(g){const h=g.home;if(!h?.site||!['building','ready'].includes(h.phase))return null;return {type:'building',name:'マイホーム',dx:h.site.x*800-22,dy:h.site.y*480-48,sw:44,sh:58,scale:1};}
    function valid(g,practice,walk){const h=g.home;if(h===undefined)return true;
        if(!keys(h,['version','phase','qualified','history','now','inside','site','confirmed','request','payment','startedAt','readyAt','travel'])||h.version!==1||!['planning','building','ready'].includes(h.phase)||!Number.isSafeInteger(h.now)||h.now<0||typeof h.inside!=='boolean'||!Array.isArray(h.history))return false;
        const q=(g.practices||[]).find(p=>p.id===h.qualified),past=q&&{...g,practices:g.practices.slice(0,g.practices.indexOf(q)+1)};if(!q||!eligible(past,practice))return false;
        if(!h.history.every((e,i)=>keys(e,['turn','kind','quote','site'])&&turn(e.turn)&&(!i||Number(e.turn.slice(5))>Number(h.history[i-1].turn.slice(5)))&&quote(e.quote)&&directive(e.quote,e.kind)&&(e.kind==='site'?validSite(g,e.site):e.site===undefined)))return false;
        let chosen=null,confirmed=null,request=null;for(const e of h.history){if(e.kind==='site'){if(request)return false;chosen=e.site;confirmed=null;}if(e.kind==='confirm'){if(!chosen||confirmed)return false;confirmed={turn:e.turn,quote:e.quote};}if(e.kind==='build'){if(!confirmed||request)return false;request={turn:e.turn,quote:e.quote};}if(e.kind==='cancel'){chosen=null;confirmed=null;request=null;}}
        if(JSON.stringify(chosen||undefined)!==JSON.stringify(h.site)||JSON.stringify(confirmed||undefined)!==JSON.stringify(h.confirmed)||JSON.stringify(request||undefined)!==JSON.stringify(h.request))return false;
        if(h.site&&!validSite(g,h.site)||h.confirmed&&(!h.site||!turn(h.confirmed.turn)||!quote(h.confirmed.quote))||h.request&&(!h.confirmed||!turn(h.request.turn)||!quote(h.request.quote)))return false;
        if(h.travel&&(!keys(h.travel,['turn','quote','route'])||!turn(h.travel.turn)||!quote(h.travel.quote)||!Array.isArray(h.travel.route)||!h.travel.route.every(point)))return false;
        if(walk&&h.site){const nodes=walk.graph(g),x=h.site.x*800,y=h.site.y*480;
            if(nodes.some((p,i)=>Math.abs(p.x-x)<8&&Math.abs(p.y-y)<4||p.edges.some(j=>j>i&&crosses(p,nodes[j],x,y))))return false;
            if(h.travel){const path=h.travel.route,ids=path.map(p=>nodes.findIndex(n=>Math.hypot(n.x-p.x*800,n.y-p.y*480)<.001));
                if(ids.some((n,i)=>n<0||i&&!nodes[ids[i-1]].edges.includes(n))||new Set(ids).size!==ids.length||path.length&&Math.hypot(path[0].x*800-g.x*800,path[0].y*480-g.y*480)>51)return false;
                const end=path.at(-1)||g;if(Math.hypot(end.x*800-x,end.y*480-y)>85)return false;}}
        if(h.phase!=='ready'&&(h.inside||h.travel))return false;
        const entry=h.history.findLast(e=>['enter','exit'].includes(e.kind));
        if((h.inside||h.travel)&&entry?.kind!=='enter'||h.travel&&(h.travel.turn!==entry.turn||h.travel.quote!==entry.quote))return false;
        if(h.inside&&(!h.site||Math.hypot(g.x*800-h.site.x*800,g.y*480-h.site.y*480)>85||h.travel))return false;
        if(h.phase==='planning')return !h.payment&&!h.startedAt&&!h.readyAt&&!h.inside&&!h.travel;
        const p=g.practices.find(p=>p.id===h.payment?.practice),s=source(g,p),items=g.inventory?.spent?.filter(i=>i.by==='house-'+s)||[];
        return !!s&&p?.homeConsent?.offer?.source===s&&p?.homeConsent?.decision?.source===s&&Number.isSafeInteger(h.startedAt)&&h.startedAt>=0&&Number.isSafeInteger(h.readyAt)&&h.readyAt===h.startedAt+DURATION&&h.now>=h.startedAt&&(h.phase==='ready'?h.now>=h.readyAt:h.now<h.readyAt)
            &&keys(h.payment,['source','practice','items','held'])&&h.payment.source===s&&Array.isArray(h.payment.items)&&new Set(h.payment.items).size===h.payment.items.length
            &&items.length===h.payment.items.length&&items.every(s=>h.payment.items.includes(s.item.id))&&['wood','stone'].every(t=>h.payment.held[t]===2&&items.filter(s=>s.item.type===t).length===COST[t]-2);
    }
    return {COST,DURATION,ID,eligible,refresh,site,summary,directive,validRequest,apply,context,validContext,validSummary,commit,tick,asset,valid,consultation,source};
});
