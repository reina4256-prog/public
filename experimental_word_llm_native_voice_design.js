(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeVoiceDesign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const fields=[
        {id:'pitch',label:'声の高さ',initial:'high',options:[['low','低め','A slightly low pitch.'],['medium','ふつう','A medium pitch.'],['high','やや高め','A slightly high pitch, never shrill.']]},
        {id:'pace',label:'話す速さ',initial:'medium',options:[['slow','ゆっくり','An unhurried speaking pace.'],['medium','ふつう','A clear, comfortable speaking pace.'],['brisk','軽快','A light, brisk but intelligible pace.']]},
        {id:'texture',label:'声の質感',initial:'round',options:[['round','丸くやわらかい','A soft, rounded, springy vocal timbre.'],['clear','透きとおる','A light, translucent vocal timbre.'],['electronic','少し電子的','A gently electronic, friendly vocal timbre.']]},
        {id:'size',label:'響きの大きさ',initial:'small',options:[['small','小さな生き物','The compact resonance of a small, round creature.'],['airy','ふわっと軽い','An airy, weightless resonance.'],['full','ゆったり豊か','A full, relaxed resonance.']]},
        {id:'breath',label:'息づかい',initial:'reduced',options:[['reduced','ひかえめ','Reduce breathiness and fleshy throat sounds.'],['natural','自然','A gentle, natural amount of breath in the voice.']]},
        {id:'melody',label:'声の抑揚',initial:'bouncy',options:[['gentle','おだやか','Gentle and restrained intonation.'],['bouncy','小さくはずむ','Small, softly bouncing changes of intonation.'],['steady','一定','Even, steady intonation.']]},
        {id:'ending',label:'言葉の終わり方',initial:'bounce',options:[['soft','ふわっと','Softly tapering phrase endings.'],['bounce','少しはねる','Phrase endings lift very slightly.'],['crisp','すっきり','Neat, crisp phrase endings.']]},
        {id:'mood',label:'声の雰囲気',initial:'curious',options:[['curious','好奇心いっぱい','A hint of curious wonder in the delivery.'],['calm','落ち着いている','A quietly composed baseline delivery.'],['bright','元気いっぱい','A cheerful, energetic baseline delivery without overacting.']]}
    ];
    const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    const fresh=()=>({version:1,traits:Object.fromEntries(fields.map(f=>[f.id,f.initial])),extra:''});
    function valid(s){return object(s)&&Object.keys(s).length===3&&s.version===1&&object(s.traits)&&Object.keys(s.traits).length===fields.length
        &&fields.every(f=>f.options.some(o=>o[0]===s.traits[f.id]))&&typeof s.extra==='string'&&s.extra.length<=300&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s.extra);}
    function prompt(s,subject){if(!valid(s))return null;return [subject==='mentor-adventurer'?'An original adult woman adventurer mentor voice. Calm, warm and encouraging. Speech must be clear; never scream or overact.':'A mysterious non-human companion creature voice. Speech must be clear and intelligible; never scream or overact.',
        ...fields.map(f=>f.options.find(o=>o[0]===s.traits[f.id])[2]),s.extra.trim()?'Additional desired voice traits: '+s.extra:''].filter(Boolean).join(' ');}
    const validId=id=>typeof id==='string'&&/^design:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id);
    return {fields,fresh,valid,prompt,validId};
});
