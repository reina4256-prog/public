(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeAbsence=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const HOUR=3600000, GATHER=600000, copy=x=>structuredClone(x), time=x=>Number.isFinite(x)&&x>=0&&x<=Number.MAX_SAFE_INTEGER;
    const kinds=id=>/^chip:palms_/.test(id)?['wood','flower','water']:/^chip:mountain_/.test(id)?['stone','water']:[];
    const all=g=>[...(g.inventory?.items||[]),...(g.inventory?.spent||[]).map(s=>s.item)];
    const distance=(a,b)=>Math.hypot((a.x-b.x)*800,(a.y-b.y)*480);
    function install(g,now){if(g.absence)return g.absence;if(!time(now))throw Error('clock');
        return g.absence={version:1,installed:now,now,lastActivity:null,left:null,resources:{},acquisitions:[],attempts:[],jobs:[],report:null};}
    function slot(g,target,type,now){const a=g.absence,key=target+'|'+type;
        if(!a.resources[key]){const count=Math.min(2,all(g).filter(i=>i.target===target&&i.type===type).length);
            a.resources[key]={target,type,available:2-count,next:count?a.installed+HOUR:null,serial:0};}
        const s=a.resources[key];if(s.next!==null&&now>=s.next){const n=Math.min(2-s.available,1+Math.floor((now-s.next)/HOUR));s.available+=n;s.next=s.available===2?null:s.next+n*HOUR;}return s;}
    function advance(g,now){const a=g.absence;if(!a||!time(now)||now<a.now)return false;a.now=now;for(const s of Object.values(a.resources))slot(g,s.target,s.type,now);return true;}
    function available(g,target,type){return g.absence?slot(g,target,type,g.absence.now).available:Math.max(0,2-all(g).filter(i=>i.target===target&&i.type===type).length);}
    function stockAt(g,target,type,at,count){const a=g.absence,ids=new Set(a.acquisitions.map(r=>r.item.id));let n=2-Math.min(2,all(g).filter(i=>i.target===target&&i.type===type&&!ids.has(i.id)).length),next=n<2?a.installed+HOUR:null;
        const recover=t=>{if(next!==null&&t>=next){const add=Math.min(2-n,1+Math.floor((t-next)/HOUR));n+=add;next=n===2?null:next+add*HOUR;}};
        for(const r of a.acquisitions.slice(0,count)){if(r.item.target!==target||r.item.type!==type)continue;recover(r.utc);if(n<=0)return null;n--;if(next===null)next=r.utc+HOUR;}
        recover(at);return {available:n,next};}
    function acquire(g,target,type,practice,step,utc){const a=g.absence,s=slot(g,target,type,utc);if(!s.available)return null;
        if(!Number.isSafeInteger(s.serial+1))throw Error('capacity');
        const item={id:target+':'+type+':r'+(++s.serial),type,target,practice,step,at:g.elapsed};
        s.available--;if(s.next===null)s.next=utc+HOUR;
        a.acquisitions.push({item:copy(item),utc});(g.inventory||(g.inventory={version:1,open:false,items:[]})).items.push(item);return item;}
    function directive(input,kind='start'){if(typeof input!=='string'||/[?？「」『』“”"]/u.test(input))return false;const s=input.normalize('NFKC').toLowerCase();
        if(/ないで|しない|意味|とは|don't|do not|\bnot\b|\bno\b|не |não|nicht|不要|别|不用/u.test(s))return false;
        if(kind==='cancel')return /取り消して|やめて|中止して|cancel|stop|取消|отмени|cancela|cancele|abbrechen/u.test(s);
        if(kind==='continue')return /留守番.*(?:続けて|再開して)|(?:continue|resume).*?(?:away|gather)|继续.*采集|продолжи.*сбор|contin[uú].*(?:recole|coleta)|samm.*weiter/u.test(s);
        if(kind==='return')return /(?:採集|留守番).*(?:帰って|戻って)|return.*(?:gather|home)|采集.*返回|вернись|vuelve|volte|zurück/u.test(s);
        return /留守|次に会うまで|いない間|離れている間|while.*away|until.*(?:back|return)|离开|不在时|пока.*нет|ausente|mientras.*fuera|während.*weg/u.test(s)
            &&/集めて|採って|拾って|採集して|gather|collect|收集|采集|собери|recoge|recolecta|colete|sammle/u.test(s);}
    function validRequest(r,p){if(r===undefined||r===null)return true;if(!r||!['start','continue','return','cancel'].includes(r.kind)||typeof r.quote!=='string'||!r.quote.trim()||r.quote.length>300||!p.input.includes(r.quote)||!directive(p.input,r.kind)||!directive(r.quote,r.kind))return false;
        if(Object.keys(r).some(k=>!['kind','quote','type','targets','quantity'].includes(k)))return false;
        if(r.kind!=='start')return !r.type&&!r.targets&&r.quantity===undefined;
        if(!['wood','stone'].includes(r.type)||!Array.isArray(r.targets)||!r.targets.length||r.targets.length>6||new Set(r.targets).size!==r.targets.length||r.quantity!==undefined&&(!Number.isSafeInteger(r.quantity)||r.quantity<=0))return false;
        if(r.quantity!==undefined&&!r.quote.normalize('NFKC').match(/\d+/g)?.some(n=>Number(n)===r.quantity))return false;
        if(/この森|この山|this forest|this mountain|这片|这座|dies(?:em|en|er)|этот|este|esta/iu.test(p.input)&&(r.targets.length!==1||r.targets[0]!==p.world.confirmed))return false;
        if(r.type==='wood'&&/石|stone|piedra|pedra|кам|Stein|石料/iu.test(p.input)||r.type==='stone'&&/木材|wood|madera|madeira|древес|Holz/iu.test(p.input))return false;
        return r.targets.every(id=>p.world.visible.some(c=>c.id===id)&&p.inventory?.targets?.some(t=>t.id===id&&t.reachable)&&kinds(id).includes(r.type))
            &&p.world.currentAction==='idle'&&p.world.search?.phase!=='active'&&(!p.practice||['done','declined','failed','stopped'].includes(p.practice.context.phase));}
    const current=g=>g.absence?.jobs.at(-1)||null;
    const pending=j=>j&&!['done','cancelled'].includes(j.status);
    function start(g,r,turn,p,walk,practice){if(!g.absence||!validRequest(r,p))return false;const old=current(g),now=g.absence.now;
        if(r.kind!=='start'){if(!pending(old))return false;
            if(r.kind==='cancel'){old.status='cancelled';old.reason='cancelled';return true;}
            if(old.status!=='paused')return false;
            if(old.reason==='capacity')return false;
            if(r.kind==='return'){const back=old.plans[0].back;old.route=practice.route(g,back.at(-2)||old.home);if(!old.route)return false;old.route.push(copy(old.home));old.phase='return';old.trip=0;old.returnOnly=true;}
            old.status='reserved';old.reason='reserved';return true;}
        if(pending(old)||g.mode!=='idle'||practice.active(g)||walk.searchActive(g))return false;
        const home={x:g.x,y:g.y},plans=[],nodes=walk.graph(g),nearest=nodes.reduce((best,n)=>!best||distance(home,{x:n.x/800,y:n.y/480})<distance(home,{x:best.x/800,y:best.y/480})?n:best,null);
        if(!nearest||distance(home,{x:nearest.x/800,y:nearest.y/480})>50)return false;
        const homeNode={x:nearest.x/800,y:nearest.y/480};
        for(const target of r.targets){const route=walk.plan(g,target,true),end=route?.at(-1),back=end&&practice.route({...g,...end},homeNode);if(!route||!back)return false;plans.push({target,out:[copy(home),...copy(route)],back:copy(back).concat([copy(home)])});}
        const j={id:'away-'+turn,source:turn,quote:r.quote,type:r.type,quantity:r.quantity??null,home,plans,status:'reserved',phase:'choose',route:[],timer:0,cursor:now,total:0,trip:0,target:null,reason:'reserved',returnOnly:false};g.absence.jobs.push(j);return true;}
    function depart(g,now){const a=g.absence;if(!a||!time(now)||now<a.now)return;advance(g,now);a.lastActivity=now;a.left=now;const j=current(g);if(j?.status==='reserved'){j.status='working';j.cursor=now;}}
    function move(g,j,until){while(j.route.length){const to=j.route[0],ms=distance(g,to)/52*1000;if(ms<=.0001){g.x=to.x;g.y=to.y;j.route.shift();continue;}const dt=Math.min(ms,until-j.cursor);if(dt<=0)return false;const f=dt/ms;g.x+=(to.x-g.x)*f;g.y+=(to.y-g.y)*f;j.cursor+=dt;if(dt<ms)return false;j.route.shift();}return true;}
    function settle(g,now){const a=g.absence,j=current(g);if(!a||!time(now)||now<a.now)return;let bytes=JSON.stringify(a.acquisitions).length;
        if(j?.status==='working')while(j.cursor<=now){
            if(j.phase==='choose'){
                if(j.quantity!==null&&j.total>=j.quantity){j.status='done';j.reason='quantity';break;}
                const plan=j.plans.find(p=>slot(g,p.target,j.type,j.cursor).available>0);
                if(!plan){const next=Math.min(...j.plans.map(p=>slot(g,p.target,j.type,j.cursor).next??Infinity));j.reason='resources';if(next>now){j.cursor=now;break;}j.cursor=next;continue;}
                j.target=plan.target;j.route=copy(plan.out);j.phase='outbound';j.reason='travel';j.trip=0;
            }
            if(j.phase==='outbound'||j.phase==='return'){
                if(!move(g,j,now))break;
                if(j.phase==='return'){if(j.returnOnly||j.quantity!==null&&j.total>=j.quantity){j.status='done';j.reason=j.returnOnly?'returned':'quantity';break;}j.phase='choose';continue;}
                j.trip=Math.min(2,slot(g,j.target,j.type,j.cursor).available,j.quantity===null?2:j.quantity-j.total);j.timer=0;j.phase='gather';j.reason='gather';
            }
            if(j.phase==='gather'){
                if(j.trip>0){const dt=Math.min(GATHER-j.timer,now-j.cursor);j.timer+=dt;j.cursor+=dt;if(j.timer<GATHER)break;
                    // Safe storage limits stop at the event, preserving the unprocessed range.
                    if(bytes>4*1024*1024){j.status='paused';j.reason='capacity';j.unsettled={from:j.cursor,to:now};break;}
                    if(acquire(g,j.target,j.type,j.id,1,j.cursor)){j.total++;bytes+=JSON.stringify(a.acquisitions.at(-1)).length+1;}j.trip--;j.timer=0;continue;}
                j.phase='return';j.route=copy(j.plans.find(p=>p.target===j.target).back);j.reason='travel';
            }
            if(j.cursor===now&&j.phase!=='return')break;
        }
        advance(g,now);
    }
    function resume(g,now){const a=g.absence;if(!a)return null;const previous=a.lastActivity,from=a.left??previous;
        settle(g,now);const j=current(g);if(j?.status==='working'){j.status='paused';if(j.reason!=='resources')j.reason='resumed';}
        a.left=null;if(now>=a.now)a.lastActivity=now;
        if(previous===null||from===null||now<previous||now-previous<300000)return null;
        if(a.report)(a.reportHistory||(a.reportHistory=[])).push(copy(a.report));
        const report={id:'resume-'+now,from,at:now,seconds:Math.floor((now-previous)/1000),status:'attempted',text:null,
            job:j?{source:j.source,quote:j.quote,type:j.type,total:j.total,status:j.status,phase:j.phase,target:j.target,reason:j.reason}:null};a.report=report;return report;}
    function summary(g){const a=g.absence;if(!a)return null;const j=current(g),r=a.report;
        const result={...(r?{previous:r.from,current:r.at,seconds:r.seconds,...(r.calendar?{previousCalendar:r.calendar}:{})}:{}),...(j?{source:j.source,quote:j.quote,type:j.type,total:j.total,status:j.status,phase:j.phase,target:j.target,reason:j.reason}:{} )};return Object.keys(result).length?result:null;}
    function validSummary(s){return !!s&&typeof s==='object'&&!Array.isArray(s)&&JSON.stringify(s).length<=800&&Object.keys(s).every(k=>['previous','current','seconds','previousCalendar','source','quote','type','total','status','phase','target','reason'].includes(k))
        &&(s.previous===undefined||time(s.previous)&&time(s.current)&&s.current>=s.previous&&Number.isSafeInteger(s.seconds)&&s.seconds>=300)
        &&(s.source===undefined||/^turn-[1-9]\d*$/.test(s.source)&&typeof s.quote==='string'&&s.quote.length>0&&s.quote.length<=300&&['wood','stone'].includes(s.type)&&Number.isSafeInteger(s.total)&&s.total>=0&&['reserved','working','paused','done','cancelled'].includes(s.status)&&['choose','outbound','gather','return'].includes(s.phase)&&(s.target===null||kinds(s.target).includes(s.type))&&['reserved','travel','gather','resources','quantity','returned','resumed','cancelled','other-action','capacity'].includes(s.reason));}
    function valid(g){const a=g.absence;if(a===undefined)return true;if(!a||a.version!==1||!time(a.installed)||!time(a.now)||a.now<a.installed||![a.lastActivity,a.left].every(t=>t===null||time(t)&&t<=a.now)||!Array.isArray(a.acquisitions)||!Array.isArray(a.jobs))return false;
        const report=r=>r&&time(r.at)&&r.at<=a.now&&time(r.from)&&r.from<=r.at&&Number.isSafeInteger(r.seconds)&&r.seconds>=300&&['attempted','complete','failed','cancelled'].includes(r.status)&&(r.text===null||typeof r.text==='string'&&r.text.length<=1200);
        if(a.report&&!report(a.report)||a.reportHistory!==undefined&&(!Array.isArray(a.reportHistory)||!a.reportHistory.every(report)))return false;
        if(!Array.isArray(a.attempts)||new Set(a.attempts.map(r=>r.practice+'|'+r.step)).size!==a.attempts.length||!a.attempts.every(r=>[1,2].includes(r.step)&&time(r.utc)&&r.utc>=a.installed&&r.utc<=a.now&&(g.practices||[]).some(p=>p.id===r.practice&&p.gather&&p.events.filter(e=>e.kind==='observed')[r.step-1]?.at===r.at)&&(r.item===null||a.acquisitions.some(e=>e.item.id===r.item&&e.item.practice===r.practice&&e.item.step===r.step&&e.utc===r.utc))))return false;
        const ids=new Set(),serials=new Map(),owned=new Map(all(g).map(i=>[i.id,JSON.stringify(i)]));for(const r of a.acquisitions){const i=r.item,key=i?.target+'|'+i?.type,n=(serials.get(key)||0)+1;if(!i||ids.has(i.id)||!time(r.utc)||r.utc<a.installed||r.utc>a.now||!kinds(i.target).includes(i.type)||i.id!==i.target+':'+i.type+':r'+n||owned.get(i.id)!==JSON.stringify(i))return false;ids.add(i.id);serials.set(key,n);
            if(!i.practice.startsWith('away-')&&!(g.practices||[]).some(p=>p.id===i.practice&&p.gather&&p.target===i.target&&(p.material||(p.target.startsWith('chip:mountain_')?'stone':'wood'))===i.type&&p.events.filter(e=>e.kind==='observed')[i.step-1]?.at===i.at))return false;}
        for(const [key,s]of Object.entries(a.resources)){const expected=stockAt(g,s.target,s.type,a.now,a.acquisitions.length);if(key!==s.target+'|'+s.type||!g.island.assets[s.target.slice(5)]||!expected||s.available!==expected.available||s.next!==expected.next||s.serial!==(serials.get(key)||0))return false;}
        return Object.values(a.resources).every(s=>kinds(s.target).includes(s.type)&&Number.isInteger(s.available)&&s.available>=0&&s.available<=2&&(s.next===null?s.available===2:time(s.next)&&s.available<2)&&Number.isSafeInteger(s.serial)&&s.serial>=0)
            &&a.jobs.every(j=>typeof j.source==='string'&&typeof j.quote==='string'&&j.quote.length<=300&&['wood','stone'].includes(j.type)&&['reserved','working','paused','done','cancelled'].includes(j.status)&&['choose','outbound','gather','return'].includes(j.phase)&&Number.isSafeInteger(j.total)&&j.total>=0&&time(j.cursor)&&j.timer>=0&&j.timer<=GATHER&&Array.isArray(j.route)&&j.route.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))&&j.plans.length>0&&j.plans.length<=6&&j.plans.every(p=>kinds(p.target).includes(j.type))&&a.acquisitions.filter(r=>r.item.practice===j.id).length===j.total)
            &&new Set(a.jobs.map(j=>j.id)).size===a.jobs.length;}
    function validRoutes(g,walk,practice){if(!g.absence)return true;const nodes=walk.graph(g),point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
        return g.absence.jobs.every(j=>{if(!point(j.home)||!Array.isArray(j.plans)||!j.plans.length)return false;
            const origin={...g,...j.home},first=walk.plan(origin,j.plans[0].target,true)?.[0];if(!first)return false;
            for(const p of j.plans){const out=walk.plan(origin,p.target,true),end=out?.at(-1),back=end&&practice.route({...g,...end},first);if(!back||JSON.stringify(p.out)!==JSON.stringify([j.home,...out])||JSON.stringify(p.back)!==JSON.stringify([...back,j.home]))return false;}
            const onNode=p=>nodes.findIndex(n=>distance(p,{x:n.x/800,y:n.y/480})<.01);
            for(let i=0;i<j.route.length;i++){const p=j.route[i];if(!point(p))return false;const n=onNode(p);if(n<0&&distance(p,j.home)>.01)return false;
                if(i&&n>=0){const before=onNode(j.route[i-1]);if(before>=0&&before!==n&&!nodes[before].edges.includes(n))return false;}}
            return true;});}
    return {HOUR,GATHER,kinds,install,advance,available,stockAt,acquire,directive,validRequest,start,current,pending,depart,settle,resume,summary,validSummary,valid,validRoutes};
});
