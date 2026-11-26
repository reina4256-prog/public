(function(root,factory){
    const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_start_questions'):root.ExperimentalWordStartQuestions,
        typeof module==='object'&&module.exports?require('./experimental_word_island_navigation'):root.WordIslandNavigation,
        typeof module==='object'&&module.exports?require('./experimental_word_llm_native_perception'):root.NativePerception,
        typeof module==='object'&&module.exports?require('./experimental_word_llm_native_walk'):root.NativeWalk,
        typeof module==='object'&&module.exports?require('./experimental_word_llm_native_practice'):root.NativePractice);
    if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeGame=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(questions,navigation,perception,walk,practice){
    'use strict';
    const actions=['walk','eat','rest'], targets={walk:'path',eat:'berry:1',rest:'shade'};
    const copy=x=>structuredClone(x), finite=x=>Number.isFinite(x);
    // This unit renders/interacts with these three targets. Dormant career markers
    // are not visible people, nor evidence that anyone is working.
    function visible(g){if(g.perception===2)return perception.chips(g);return g.island.places.filter(p=>Object.values(targets).includes(p.id)&&Math.hypot(p.x-g.x,p.y-g.y)<=.38).sort((a,b)=>Math.hypot(a.x-g.x,a.y-g.y)-Math.hypot(b.x-g.x,b.y-g.y)).slice(0,6);}
    function receipt(g,kind,target,cause=null){
        const event={id:'event-'+(g.receipts.length+1),kind,target,at:g.elapsed,cause,
            hunger:g.hunger,fatigue:g.fatigue,...(kind==='eat'?{taste:'sweet'}:{})};
        g.receipts.push(event);return event;
    }
    function observe(g){for(const p of visible(g))if(!g.seen.includes(p.id)){g.seen.push(p.id);receipt(g,'observe',p.id);}}
    function create(answers,island,actual=false){
        if(!questions.validAnswers(answers)||!navigation.valid(island))throw Error('input');
        const result=questions.resolve(answers);
        const g={version:1,origin:{answers:[...answers],...result},island:copy(island),...island.spawn,elapsed:0,
            mode:'idle',destination:null,route:[],intent:null,cause:null,remaining:0,hunger:.35,fatigue:.15,fruit:2,growth:0,harvest:0,receipts:[],seen:[]};
        if(actual){g.perception=2;g.focus=null;walk.install(g);perception.observe(g);}else observe(g);return g;
    }
    function valid(g){
        if(!g||g.version!==1||!questions.validAnswers(g.origin?.answers))return false;
        const origin=questions.resolve(g.origin.answers);
        if(origin.appearance!==g.origin.appearance||JSON.stringify(origin.settings)!==JSON.stringify(g.origin.settings))return false;
        return practice.valid(g)&&(g.calendarSettings===undefined||walk.calendar.validSettings(g.calendarSettings))&&(g.affinityPanelOpen===undefined||typeof g.affinityPanelOpen==='boolean')&&(g.taskPanelOpen===undefined||typeof g.taskPanelOpen==='boolean')&&(g.perception===undefined||g.perception===2)&&(!g.focus||(perception.asset(g,g.focus.targetId)&&/^turn-[1-9]\d*$/.test(g.focus.turnId)&&typeof g.focus.quote==='string'))
            &&(g.perception!==2||navigation.valid(g.island)&&Array.isArray(g.route)&&Array.isArray(g.receipts)&&walk.valid(g))
            &&navigation.valid(g.island)&&['x','y','elapsed','hunger','fatigue','remaining','growth'].every(k=>finite(g[k]))&&g.growth>=0&&g.growth<65
            &&g.elapsed>=0&&g.hunger>=0&&g.hunger<=1&&g.fatigue>=0&&g.fatigue<=1&&g.remaining>=0
            &&['idle','move','eat','rest'].includes(g.mode)&&([null,...Object.values(targets)].includes(g.destination)||g.perception===2&&!!perception.asset(g,g.destination))
            &&[null,...actions].includes(g.intent)&&Array.isArray(g.route)&&g.route.every(p=>finite(p.x)&&finite(p.y))
            &&Number.isInteger(g.fruit)&&g.fruit>=0&&g.fruit<=3&&Number.isInteger(g.harvest)&&g.harvest>=0
            &&Array.isArray(g.seen)&&g.seen.every(id=>g.island.places.some(p=>p.id===id)||perception.asset(g,id))
            &&Array.isArray(g.receipts)&&g.receipts.every((r,i)=>r.id==='event-'+(i+1)&&['observe','walk','eat','rest','walk_start','walk_failed','walk_interrupted'].includes(r.kind)
                &&(g.island.places.some(p=>p.id===r.target)||(r.kind==='observe'||walk.movementKinds.includes(r.kind))&&perception.asset(g,r.target)&&typeof r.label==='string'&&r.label.length<=80)&&finite(r.at)&&r.at>=0&&r.at<=g.elapsed
                &&(r.reason===undefined||['stopped','busy','unconfirmed','unavailable','unreachable'].includes(r.reason))
                &&finite(r.hunger)&&finite(r.fatigue)&&(r.cause===null||/^turn-[1-9]\d*$/.test(r.cause))
                &&(r.kind==='eat'?r.taste==='sweet':r.taste===undefined));
    }
    function supply(g){
        if(g.perception===2)return perception.supply(g,walk);
        const result={location:'island',currentAction:g.mode,target:g.destination,hunger:g.hunger,fatigue:g.fatigue,
            visible:visible(g).map(p=>({id:p.id,kind:p.meaning,...(p.id==='berry:1'?{appearance:'red berries',count:g.fruit}:{})})),
            results:g.receipts.slice(-3).map(copy),availableActions:actions.filter(a=>g.seen.includes(targets[a])&&(a!=='eat'||g.fruit>0))};
        if(JSON.stringify(result).length>2000)throw Error('world_budget');return result;
    }
    function apply(g,action,cause,packet){
        if(action===null)return {accepted:true};
        if(practice.active(g))return {accepted:false,reason:'busy'};
        if(g.perception===2)return typeof action==='object'&&packet?walk.apply(g,action,cause,packet):{accepted:false,reason:'unavailable'};
        if(!actions.includes(action)||!/^turn-[1-9]\d*$/.test(cause)||g.mode!=='idle')return {accepted:false,reason:'busy'};
        const target=targets[action];
        if(!g.seen.includes(target)||(action==='eat'&&g.fruit<1))return {accepted:false,reason:'unavailable'};
        const route=navigation.route(g,target);if(!route)return {accepted:false,reason:'unreachable'};
        g.mode='move';g.destination=target;g.route=route;g.intent=action;g.cause=cause;return {accepted:true};
    }
    function tick(g,seconds){
        const dt=Math.min(.1,Math.max(0,seconds));if(!finite(dt)||dt===0)return;
        if(g.perception===2){g.elapsed+=dt;if(practice.active(g))practice.tick(g,dt);else walk.tick(g,dt);perception.observe(g);return;}
        g.elapsed+=dt;g.hunger=Math.min(1,g.hunger+dt/180);g.fatigue=Math.min(1,Math.max(0,g.fatigue+(g.mode==='rest'?-dt/28:dt/220)));
        if(g.fruit<3){g.growth+=dt;if(g.growth>=65){g.fruit++;g.growth=0;}}else g.growth=0;
        if(g.mode==='move'){
            const p=g.route[0]||g.island.places.find(p=>p.id===g.destination),dx=p.x-g.x,dy=p.y-g.y,d=Math.hypot(dx,dy),step=dt*.065*(g.fatigue>.55?.8:1);
            if(d>step){g.x+=dx/d*step;g.y+=dy/d*step;}else{
                g.x=p.x;g.y=p.y;if(g.route.length)g.route.shift();
                if(!g.route.length){
                    receipt(g,'walk',g.destination,g.cause);
                    if(g.intent==='eat'&&g.fruit>0){g.mode='eat';g.remaining=5;g.fruit--;g.harvest++;}
                    else if(g.intent==='rest'){g.mode='rest';g.remaining=11;}
                    else{g.mode='idle';g.intent=null;g.destination=null;g.cause=null;}
                }
            }
        }else if(g.mode==='eat'||g.mode==='rest'){
            g.remaining=Math.max(0,g.remaining-dt);
            if(g.remaining===0){
                if(g.mode==='eat')g.hunger=Math.max(0,g.hunger-.55);
                receipt(g,g.mode,g.destination,g.cause);g.mode='idle';g.intent=null;g.destination=null;g.cause=null;
            }
        }
        observe(g);
    }
    return {create,valid,supply,apply,tick,visible,actions,targets,perception,walk,practice};
});
