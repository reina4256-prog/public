(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeCalendar=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const keys=(o,a)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>a.includes(k));
    function zone(value){try{return typeof value==='string'&&value.length<=80&&!!new Intl.DateTimeFormat('en',{timeZone:value}).format(0);}catch(_){return false;}}
    function validSettings(s){return keys(s,['zone','hemisphere'])&& (s.zone==='device'||zone(s.zone))&&['language','north','south'].includes(s.hemisphere);}
    const defaults=()=>({zone:'device',hemisphere:'language'});
    function snapshot(at,settings=defaults(),locale='en'){
        if(!Number.isSafeInteger(at)||at<0||!validSettings(settings))throw Error('calendar');
        const timeZone=settings.zone==='device'?Intl.DateTimeFormat().resolvedOptions().timeZone:settings.zone;
        const values=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at).map(p=>[p.type,p.value]));
        const south=settings.hemisphere==='south'||settings.hemisphere==='language'&&locale==='pt-BR';
        const season=['winter','spring','summer','autumn'][(Math.floor(Number(values.month)/3)+(south?2:0))%4];
        return {date:values.year+'-'+values.month+'-'+values.day,time:values.hour+':'+values.minute,zone:timeZone,hemisphere:south?'south':'north',season};
    }
    function valid(c){if(!keys(c,['date','time','zone','hemisphere','season'])||!/^\d{4}-\d{2}-\d{2}$/.test(c.date)||!/^\d{2}:\d{2}$/.test(c.time)||!zone(c.zone)||!['north','south'].includes(c.hemisphere))return false;
        const d=new Date(c.date+'T'+c.time+':00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,16)!==c.date+'T'+c.time)return false;
        const expected=['winter','spring','summer','autumn'][(Math.floor(Number(c.date.slice(5,7))/3)+(c.hemisphere==='south'?2:0))%4];return c.season===expected;}
    const instruction=' calendar is the real local civil date/time and a month-based season for the configured hemisphere. Use it naturally when relevant, not in every greeting. It does not establish weather, temperature, scenery, unseen NPC locations, resource renewal or events while offline. Earlier speech retains its original time; do not rewrite it as current. ';
    return {defaults,validSettings,snapshot,valid,instruction};
});
