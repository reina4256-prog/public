'use strict';
(()=>{
    const rules=window.NativeVoiceRules,$=id=>document.getElementById(id),api=window.nativeMemory;
    const t=s=>window.GameI18n.translate(s);
    let prefs=rules.fresh(),species='robot',locale='ja',loaded=false,broken=false,locked=false,context=null,source=null,sequence=0,waiting=false;
    const message=s=>{$('voice-status').textContent=t(s);};
    function stop(){sequence++;waiting=false;api.voiceCancel();try{source?.stop();}catch(_){}source=null;message('');$('voice-listen').disabled=broken||locked;}
    function prime(){try{context ||= new AudioContext();void context.resume().catch(()=>{});}catch(_){} }
    function draw(){
        $('voice-choice').replaceChildren();
        for(const choice of rules.choices){const option=document.createElement('option');option.value=choice.id;option.textContent=t(choice.label)+(rules.defaults[species]===choice.id?' '+t('（おすすめ）'):'');option.dataset.i18nSkip='';$('voice-choice').append(option);}
        $('voice-choice').value=prefs.voices[species]||rules.defaults[species];$('voice-enabled').checked=prefs.enabled;
        for(const id of ['voice-choice','voice-listen','voice-apply','voice-enabled'])$(id).disabled=broken||locked;
    }
    async function load(){try{const r=await api.voiceLoad();if(!r.ok||!rules.valid(r.value))throw Error('save');prefs=r.value;loaded=true;draw();}
        catch(_){broken=true;draw();message('声の約束を読み出せませんでした。');}}
    async function save(){
        if(!loaded||broken){message('声の約束を読み出せませんでした。');return false;}stop();const next={version:1,enabled:$('voice-enabled').checked,voices:{...prefs.voices,[species]:$('voice-choice').value}};
        try{const r=await api.voiceSave(next);if(!r.ok)throw Error('save');prefs=next;message('この声に決まり！');return true;}
        catch(_){message('声の約束を残せませんでした。もう一度ためしてね。');return false;}
    }
    async function play(request){
        stop();prime();const ticket=sequence;waiting=true;$('voice-listen').disabled=true;message('声を待っています…');
        try{const r=await api.voiceGenerate(request);if(ticket!==sequence||document.hidden)return;
            if(!r.ok){if(r.error!=='cancelled')message(r.error==='limit'?'今日は声をおやすみするね。文字でお話ししよう。':'今は声が出せないみたい。文字でお話ししよう。');return;}
            if(!context)throw Error('audio');const bytes=new Uint8Array(r.audio),buffer=await context.decodeAudioData(bytes.buffer);
            if(ticket!==sequence||document.hidden)return;source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=()=>{if(ticket===sequence){source=null;message('');}};
            await context.resume();if(ticket!==sequence||document.hidden)return;source.start();message('');
        }catch(_){if(ticket===sequence)message('今は声が出せないみたい。文字でお話ししよう。');}
        finally{if(ticket===sequence){waiting=false;$('voice-listen').disabled=broken||locked;}}
    }
    $('voice-choice').onchange=stop;$('voice-enabled').onchange=()=>void save();
    $('voice-listen').onclick=()=>{if(!waiting&&!broken&&!locked)void play({kind:'preview',voice:$('voice-choice').value,locale});};
    $('voice-stop').onclick=stop;$('voice-apply').onclick=()=>void save();
    const ready=load();
    window.NativeVoiceUI={ready,stop,prime,save,lock(value){locked=value;for(const id of ['voice-choice','voice-listen','voice-apply','voice-enabled'])$(id).disabled=broken||locked;},
        mount(container,appearance,language){stop();species=appearance;locale=language;container.append($('voice-panel'));
            // A failed reply voice must remain visible even with the voice menu closed.
            if(container.id==='play-voice')container.parentElement.after($('voice-status'));else $('voice-panel').append($('voice-status'));
            draw();if(broken)message('声の約束を読み出せませんでした。');},
        reply(turnId){if(loaded&&!broken&&prefs.enabled&&!document.hidden)void play({kind:'reply',turnId});}
    };
})();
