(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeCompass=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const clone=x=>structuredClone(x),keys=(o,a)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>a.includes(k));
    const text=(s,n=120)=>typeof s==='string'&&s.trim()&&s.length<=n&&!/[\u0000-\u001f\u007f]/.test(s);
    const npcs=['adventurer','building'],npc=p=>p.npc==='building'?'building':'adventurer';
    const received=g=>(g.practices||[]).some(p=>p.linkOffer?.grant&&p.linkAccept);
    const contacts=g=>[...new Set((g.practices||[]).filter(p=>p.linkAccept).map(npc))];
    const source=g=>(g.practices||[]).find(p=>p.gather&&!p.free&&p.events.some(e=>e.kind==='returned')&&p.events.filter(e=>e.kind==='observed').length===2&&[...(g.inventory?.items||[]),...(g.inventory?.spent||[]).map(s=>s.item)].filter(i=>i.practice===p.id).length===2);
    function face(g,p,stage){if(p.free||p.remote||!p.linkEnabled)return null;const owned=received(g),who=npc(p);
        if(!['offer','decision','report','feedback'].includes(stage)||contacts(g).includes(who))return null;
        if(['offer','feedback'].includes(stage)){if(p.linkOffer||!owned&&(who!=='adventurer'||!source(g)))return null;
            return {grant:!owned,contact:who};}
        return p.linkOffer&&!p.linkAccept?{grant:p.linkOffer.grant,contact:who,quote:p.linkOffer.quote}:null;
    }
    function applyFace(g,p,slot,r,at){const offer=face(g,p,slot);
        if(offer&&!offer.quote&&r.linkOffer&&text(r.linkOffer.quote)&&r.text.includes(r.linkOffer.quote))p.linkOffer={slot,quote:r.linkOffer.quote,grant:offer.grant,at,...(offer.grant?{source:source(g).id}:{})};
        if(offer?.quote&&r.linkAccept&&r.choice!=='ask'&&text(r.linkAccept.quote)&&r.text.includes(r.linkAccept.quote))p.linkAccept={slot,quote:r.linkAccept.quote,at};
    }
    function canReceive(g){const p=g.practices?.at(-1),r=p?.npc==='building'?g.walk?.builder:g.walk?.roaming;
        return !!p?.linkOffer&&!p.linkAccept&&!p.remote&&g.mode==='idle'&&g.walk?.encounter?.id===p.id&&(!r||r.target===p.homeTarget)
            &&!g.receipts.some(e=>['walk_start','walk'].includes(e.kind)&&Number(e.id.slice(6))>Number(p.id.slice(6)))&&['declined','done'].includes(p.phase);}
    function snapshot(g){const calls=(g.practices||[]).filter(p=>p.remote?.target&&Number.isSafeInteger(p.remote.replyAt)),last=calls.at(-1)?.remote;
        return {owned:received(g),contacts:contacts(g),...(canReceive(g)?{offer:{contact:npc(g.practices.at(-1)),grant:g.practices.at(-1).linkOffer.grant,quote:g.practices.at(-1).linkOffer.quote}}:{}),
            ...(last?{last:{contact:last.npc,target:last.target,at:last.replyAt,text:g.practices.filter(p=>p.remote===last)[0].lines.find(l=>l.slot==='offer').text,...(last.until?{until:last.until}:{})}}:{})};}
    function validSnapshot(c){return keys(c,['owned','contacts','offer','last'])&&typeof c.owned==='boolean'&&Array.isArray(c.contacts)&&c.contacts.length<=2&&new Set(c.contacts).size===c.contacts.length&&c.contacts.every(n=>npcs.includes(n))
        &&(!c.contacts.length||c.owned)&&(!c.offer||keys(c.offer,['contact','grant','quote'])&&npcs.includes(c.offer.contact)&&typeof c.offer.grant==='boolean'&&text(c.offer.quote))
        &&(!c.last||keys(c.last,['contact','target','at','text','until'])&&c.contacts.includes(c.last.contact)&&/^chip:(?:mountain_|palms_)/.test(c.last.target)&&text(c.last.target,80)&&Number.isSafeInteger(c.last.at)&&c.last.at>=0&&text(c.last.text,300)&&(!c.last.until||c.last.until>=c.last.at));}
    function directive(input){return typeof input==='string'&&!/[「」『』“”"]|ないで|しない|言って|意味|とは|don't|do not|never|не |não|nicht|不要|别|不用/iu.test(input)
        &&/コンパス|連絡|通信|compass|contact|call|brújula|bússola|kompass|компас|связ|联系|指南针/iu.test(input);}
    function validRequest(r,p){return r===undefined||r===null||keys(r,['kind','contact','purpose','quote'])&&['receive','call'].includes(r.kind)&&text(r.quote,1000)&&p.input.includes(r.quote)&&directive(p.input)&&directive(r.quote)
        &&p.inventory?.compass&&(r.kind==='receive'?!!p.inventory.compass.offer&&r.contact===p.inventory.compass.offer.contact&&r.purpose===undefined:
            p.inventory.compass.owned&&p.inventory.compass.contacts.includes(r.contact)&&['location','meet'].includes(r.purpose))&&p.world.currentAction==='idle'
        &&(!p.practice||['done','declined','failed','stopped'].includes(p.practice.context.phase));}
    function create(g,r,turn,at){if(r.kind==='receive'){if(!canReceive(g))return false;g.practices.at(-1).linkAccept={slot:'chat',turn,quote:r.quote,at};return true;}
        if(!received(g)||!contacts(g).includes(r.contact))return false;
        const p={id:'compass-'+turn,remote:{npc:r.contact,purpose:r.purpose,quote:r.quote,at},phase:'offer',suspended:false,attempts:{},lines:[]};g.practices.push(p);return true;}
    function context(g,p){return {id:p.id,goal:'compass-call',phase:p.phase,suspended:p.suspended,contact:p.remote.npc,purpose:p.remote.purpose,
        ...(p.remote.target?{location:{target:p.remote.target,kind:p.remote.target.startsWith('chip:mountain_')?'mountain':'forest',at:p.remote.replyAt},answer:p.lines.find(l=>l.slot==='offer').text,agree:p.remote.agree}:{}),results:[],experience:[]};}
    function validContext(c){return keys(c,['id','goal','phase','suspended','contact','purpose','location','answer','agree','results','experience','calendar'])&&/^compass-turn-[1-9]\d*$/.test(c.id)&&c.goal==='compass-call'
        &&['offer','decision','done','stopped','failed'].includes(c.phase)&&typeof c.suspended==='boolean'&&npcs.includes(c.contact)&&['location','meet'].includes(c.purpose)
        &&Array.isArray(c.results)&&!c.results.length&&Array.isArray(c.experience)&&!c.experience.length
        &&(!c.location||keys(c.location,['target','kind','at'])&&text(c.location.target,80)&&/^chip:(?:mountain_|palms_)/.test(c.location.target)&&c.location.kind===(c.location.target.startsWith('chip:mountain_')?'mountain':'forest')&&Number.isSafeInteger(c.location.at)&&c.location.at>=0&&(c.phase==='offer'&&c.answer===undefined&&c.agree===undefined||text(c.answer,300)&&typeof c.agree==='boolean'))&&JSON.stringify(c).length<=1200;}
    function finish(g,p,slot,r,at){p.attempts[slot]='complete';p.lines.push({slot,speaker:slot==='offer'?'mentor':'companion',text:r.text});
        if(slot==='offer'){const roaming=p.remote.npc==='building'?g.walk.builder:g.walk.roaming;p.remote.target=roaming.target;p.remote.replyAt=at;p.remote.agree=p.remote.purpose==='meet'&&r.agree===true;p.phase='decision';}
        else {p.phase='done';if(p.remote.agree&&r.agree===true){p.remote.until=at+600000;p.remote.agreedAt=at;const roaming=p.remote.npc==='building'?g.walk.builder:g.walk.roaming;roaming.nextAt=p.remote.until;}}}
    function held(g,who,at){return (g.practices||[]).some(p=>p.remote?.npc===who&&p.remote.until>at);}
    function validFace(g,p,index){if(!p.linkOffer&&!p.linkAccept)return true;
        const o=p.linkOffer,prior={...g,practices:g.practices.slice(0,index)},s=source({...g,practices:g.practices.slice(0,index+(o?.slot==='feedback'?1:0))});
        if(!o||p.free||p.remote||!p.linkEnabled||!keys(o,['slot','quote','grant','at','source'])||!['offer','feedback'].includes(o.slot)||!text(o.quote)||!Number.isSafeInteger(o.at)||o.at<0||!p.lines.find(l=>l.slot===o.slot)?.text.includes(o.quote)
            ||contacts(prior).includes(npc(p))||o.grant!==!received(prior)||(o.grant?npc(p)!=='adventurer'||!s||o.source!==s.id:o.source!==undefined))return false;
        const a=p.linkAccept;if(!a)return true;
        return keys(a,['slot','quote','at','turn'])&&['decision','report','chat'].includes(a.slot)&&text(a.quote,1000)&&Number.isSafeInteger(a.at)&&a.at>=o.at
            &&(a.slot==='chat'?/^turn-[1-9]\d*$/.test(a.turn):a.turn===undefined&&o.slot==='offer'&&(a.slot!=='decision'||p.decisionAudience==='mentor')&&!!p.lines.find(l=>l.slot===a.slot)?.text.includes(a.quote));}
    function validRemote(g,p,index){const r=p.remote,prior={...g,practices:g.practices.slice(0,index)};
        return keys(p,['id','remote','phase','suspended','attempts','lines'])&&/^compass-turn-[1-9]\d*$/.test(p.id)&&keys(r,['npc','purpose','quote','at','target','replyAt','agree','until','agreedAt'])
            &&received(prior)&&contacts(prior).includes(r.npc)&&['location','meet'].includes(r.purpose)&&text(r.quote,1000)&&Number.isSafeInteger(r.at)&&r.at>=0
            &&['offer','decision','done','stopped','failed'].includes(p.phase)&&typeof p.suspended==='boolean'&&keys(p.attempts,['offer','decision'])&&Object.values(p.attempts).every(s=>['pending','complete','cancelled','failed'].includes(s))
            &&Array.isArray(p.lines)&&p.lines.length<=2&&p.lines.every((l,i)=>keys(l,['slot','speaker','text'])&&l.slot===(i?'decision':'offer')&&l.speaker===(i?'companion':'mentor')&&text(l.text,300)&&p.attempts[l.slot]==='complete')
            &&(r.target===undefined?p.lines.length===0&&r.replyAt===undefined&&r.agree===undefined:text(r.target,80)&&!!g.island.assets[r.target.slice(5)]&&/^chip:(?:mountain_|palms_)/.test(r.target)&&Number.isSafeInteger(r.replyAt)&&r.replyAt>=r.at&&typeof r.agree==='boolean'&&p.lines.length>=1&&(r.npc!=='building'||r.target.startsWith('chip:palms_')))
            &&(r.until===undefined?r.agreedAt===undefined:r.agree&&r.purpose==='meet'&&p.lines.length===2&&Number.isSafeInteger(r.agreedAt)&&r.agreedAt>=r.replyAt&&r.until===r.agreedAt+600000);
    }
    return {received,contacts,source,face,applyFace,canReceive,snapshot,validSnapshot,directive,validRequest,create,context,validContext,finish,held,validFace,validRemote};
});
