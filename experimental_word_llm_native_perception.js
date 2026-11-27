(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./experimental_word_llm_native_home'):root.NativeHome);if(typeof module==='object'&&module.exports)module.exports=api;else root.NativePerception=api;})(typeof globalThis!=='undefined'?globalThis:this,function(home){
    'use strict';
    const id=key=>'chip:'+key;
    function asset(g,target){if(target==='chip:player_home'&&g.home?.site&&['building','ready'].includes(g.home.phase)){const s=g.home.site;return {type:'building',name:'マイホーム',dx:s.x*800-22,dy:s.y*480-48,sw:44,sh:58,scale:1};}
        return typeof target==='string'&&target.startsWith('chip:')?g?.island?.assets?.[target.slice(5)]:null;}
    function chips(g){
        const camera={x:g.x*800-400,y:g.y*480-240};
        const all=Object.entries(g.island.assets).flatMap(([key,a])=>{
            const width=a.sw*a.scale/800,height=a.sh*a.scale/480;
            const x=(a.dx+a.sw*a.scale/2-camera.x)/800,y=(a.dy+a.sh*a.scale/2-camera.y)/480;
            if(![x,y,width,height].every(Number.isFinite)||x<0||x>1||y<0||y>1||width<=0||height<=0)return [];
            return [{id:id(key),kind:String(a.type).slice(0,80),appearance:String(a.name||a.type).slice(0,80),
                x:+x.toFixed(4),y:+y.toFixed(4),width:+width.toFixed(4),height:+height.toFixed(4)}];
        });
        // Prefer actual foreground chips, rather than filling the six slots with grass.
        const foreground=all.filter(p=>!['ground','water','road'].includes(p.kind));
        return (foreground.length?foreground:all).sort((a,b)=>Math.hypot(a.x-.5,a.y-.5)-Math.hypot(b.x-.5,b.y-.5)||a.id.localeCompare(b.id)).slice(0,6);
    }
    function observe(g){for(const p of chips(g))if(!g.seen.includes(p.id)){
        g.seen.push(p.id);g.receipts.push({id:'event-'+(g.receipts.length+1),kind:'observe',target:p.id,label:p.appearance,
            at:g.elapsed,cause:null,hunger:g.hunger,fatigue:g.fatigue});
    }}
    function upgrade(g){
        if(g.perception===2)return g;
        g.perception=2;g.focus=null;g.mode='idle';g.destination=null;g.route=[];g.intent=null;g.cause=null;g.remaining=0;
        observe(g);return g;
    }
    function supply(g,walk){
        const visible=g.home?.inside?home.roomVisible(g):chips(g),last=(g.practices||[]).findLast(p=>p.remote?.target)?.remote,a=last&&asset(g,last.target);
        const reported=a?{id:last.target,kind:String(a.type).slice(0,80),appearance:String(a.name||a.type).slice(0,80),at:last.replyAt}:null;
        const focus=g.focus&&(visible.some(p=>p.id===g.focus.targetId)||reported?.id===g.focus.targetId)?g.focus.targetId:null;
        const result={perception:'map-chips',location:'island',currentAction:g.mode,target:g.destination,hunger:g.hunger,fatigue:g.fatigue,
            visible,focus,results:g.receipts.filter(r=>asset(g,r.target)).slice(-3).map(r=>({...r})),availableActions:[]};
        if(g.home?.inside){result.location='home';result.focus=null;result.results=[];}
        if(g.home?.travel||g.home?.exit){result.currentAction='move';result.homeTravel=true;result.target='chip:player_home';}
        if(reported)result.reported=reported;
        if(walk&&g.walk?.search)result.search=walk.searchSupply(g);
        if(g.walk&&walk){result.confirmed=g.walk.confirmed?.targetId||null;result.walkable=g.mode==='idle'&&(visible.some(p=>p.id===result.confirmed)||reported?.id===result.confirmed)&&!!walk.plan(g,result.confirmed);
            result.availableActions=g.mode==='move'?['stop']:result.walkable?['walk']:[];}
        if(g.home?.inside){result.focus=null;result.confirmed=null;result.walkable=false;result.availableActions=[];}
        if(g.home?.travel||g.home?.exit){result.focus=null;result.confirmed=null;result.walkable=false;result.availableActions=['stop'];}
        while(JSON.stringify(result).length>2000&&visible.length)visible.pop();
        if(!visible.some(p=>p.id===result.focus)&&reported?.id!==result.focus)result.focus=null;
        if(!result.homeTravel&&Object.hasOwn(result,'confirmed')&&!visible.some(p=>p.id===result.confirmed)&&reported?.id!==result.confirmed){result.walkable=false;result.availableActions=g.mode==='move'?['stop']:[];}
        if(JSON.stringify(result).length>2000)throw Error('world_budget');return result;
    }
    function validFocus(f,p){return f===null||!!(f&&typeof f==='object'&&!Array.isArray(f)
        &&Object.keys(f).every(k=>['targetId','quote'].includes(k))&&(p.visible.some(v=>v.id===f.targetId)||p.reported?.id===f.targetId)
        &&typeof f.quote==='string'&&f.quote.length>0&&f.quote.length<=1000&&p.input.includes(f.quote));}
    return {asset,chips,observe,upgrade,supply,validFocus};
});
