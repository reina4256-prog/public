(function(root,factory){
    const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativeVoiceRules=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const model='gemini-3.8-flash-tts';
    const choices=[
        {id:'Iapetus',label:'すんだ声'}, {id:'Leda',label:'わかばの声'},
        {id:'Zephyr',label:'きらめく声'}, {id:'Enceladus',label:'ささやく声'},
        {id:'Charon',label:'おちついた声'}, {id:'Kore',label:'りんとした声'},
        {id:'Puck',label:'はずむ声'}, {id:'Aoede',label:'そよかぜの声'},
        {id:'Laomedeia',label:'あかるい声'}, {id:'Schedar',label:'おだやかな声'},
        {id:'Orus',label:'ちからづよい声'}
    ];
    const species=['robot','seed','spirit','ghost','stone','magician','beetle','balloon','bird','machine','dragon'];
    const defaults=Object.fromEntries(species.map((id,i)=>[id,choices[i].id]));
    const samples={ja:'こんにちは。今日は、どんな一日だった？ よかったら、聞かせてね。',
        en:'Hello. How was your day? Tell me about it, if you like.',
        'zh-CN':'你好。今天过得怎么样？愿意的话，讲给我听吧。',
        ru:'Привет. Как прошёл твой день? Расскажешь мне, если хочешь?',
        'es-ES':'Hola. ¿Cómo te ha ido el día? Si quieres, cuéntamelo.',
        'pt-BR':'Olá. Como foi o seu dia? Se quiser, me conte.',
        de:'Hallo. Wie war dein Tag? Wenn du magst, erzähl mir davon.'};
    const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    const validVoice=id=>choices.some(v=>v.id===id);
    function valid(p){return object(p)&&Object.keys(p).every(k=>['version','enabled','voices'].includes(k))&&p.version===1
        &&typeof p.enabled==='boolean'&&object(p.voices)&&Object.keys(p.voices).every(k=>species.includes(k)&&validVoice(p.voices[k]));}
    const fresh=()=>({version:1,enabled:true,voices:{}});
    return {model,choices,species,defaults,samples,validVoice,valid,fresh};
});
