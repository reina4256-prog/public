'use strict';
(()=>{
    const rules=window.NativeVoiceRules,$=id=>document.getElementById(id),api=window.nativeMemory;
    const t=s=>window.GameI18n.translate(s);
    let prefs=rules.fresh(),designs=[],drafts={},species='robot',locale='ja',loaded=false,broken=false,locked=false,context=null,source=null,sequence=0,waiting=false;
    const message=s=>{$('voice-status').textContent=t(s);};
    function stop(){sequence++;waiting=false;api.voiceCancel();try{source?.stop();}catch(_){}source=null;message('');buttons();}
    function buttons(){for(const el of $('voice-panel').querySelectorAll('select,textarea,button,input'))el.disabled=broken||locked;
        $('voice-listen').disabled=broken||locked||waiting;$('voice-make').disabled=broken||locked||waiting;$('voice-apply').disabled=broken||locked||waiting;}
    function readDraft(){return {version:1,traits:Object.fromEntries(rules.design.fields.map(f=>[f.id,$('voice-trait-'+f.id).value])),extra:$('voice-extra').value};}
    function rememberDraft(){drafts[species]=readDraft();stop();}
    function drawDesign(){
        const initial=freshDraft();
        const draft=drafts[species]||designs.find(d=>d.id===prefs.voices[species])?.settings||initial;
        $('voice-traits').replaceChildren();
        for(const field of rules.design.fields){const label=document.createElement('label'),text=document.createElement('span'),select=document.createElement('select');
            select.id='voice-trait-'+field.id;label.htmlFor=select.id;text.textContent=t(field.label);text.dataset.i18nSkip='';label.append(text,select);
            for(const [id,name] of field.options){const option=document.createElement('option');option.value=id;option.textContent=t(name);option.dataset.i18nSkip='';select.append(option);}
            select.value=draft.traits[field.id];select.onchange=rememberDraft;$('voice-traits').append(label);
        }$('voice-extra').value=draft.extra;
    }
    function prime(){try{context ||= new AudioContext();void context.resume().catch(()=>{});}catch(_){} }
    function freshDraft(){const value=rules.design.fresh();if(species==='mentor-adventurer')Object.assign(value.traits,{pitch:'medium',size:'full',melody:'gentle',ending:'soft',mood:'calm',breath:'natural'});return value;}
    function draw(){
        $('voice-choice').replaceChildren();
        for(const choice of rules.choices){const option=document.createElement('option');option.value=choice.id;option.textContent=t(choice.label)+(rules.defaults[species]===choice.id?' '+t('（おすすめ）'):'');option.dataset.i18nSkip='';$('voice-choice').append(option);}
        let number=0;for(const design of designs.filter(d=>d.species===species)){const option=document.createElement('option');option.value=design.id;option.textContent=t('つくった声')+' '+(++number);option.dataset.i18nSkip='';$('voice-choice').append(option);}
        $('voice-choice').value=prefs.voices[species]||rules.defaults[species];$('voice-enabled').checked=prefs.enabled;
        drawDesign();buttons();$('voice-confirm-help').textContent=t($('voice-panel').parentElement.id==='setup-voice'?'気に入った声をえらんだまま、サインへ進もう。':'聞いて気に入ったら「この声にする」で決めよう。');
    }
    async function load(){try{const r=await api.voiceLoad();if(!r.ok||!rules.valid(r.value))throw Error('save');prefs=r.value;designs=r.designs||[];loaded=true;draw();}
        catch(_){broken=true;draw();message('声の約束を読み出せませんでした。');}}
    async function save(choose=true){
        if(choose&&waiting){message('声を待っています…');return false;}
        if(!loaded||broken){message('声の約束を読み出せませんでした。');return false;}stop();const next={version:1,enabled:$('voice-enabled').checked,voices:{...prefs.voices,...(choose?{[species]:$('voice-choice').value}:{})}};
        try{const r=await api.voiceSave(next);if(!r.ok)throw Error('save');prefs=next;message(choose?'この声に決まり！':'');return true;}
        catch(_){message('声の約束を残せませんでした。もう一度ためしてね。');return false;}
    }
    async function play(request){
        stop();prime();const ticket=sequence;waiting=true;buttons();message(request.kind==='design'?'この子の声をつくっています…':'声を待っています…');
        try{const r=await api.voiceGenerate(request);if(ticket!==sequence||document.hidden)return;
            if(r.design){if(!designs.some(d=>d.id===r.design.id))designs.push(r.design);draw();$('voice-choice').value=r.design.id;}
            if(!r.ok){if(r.error!=='cancelled')message(r.error==='limit'?'今日は声をおやすみするね。文字でお話ししよう。':'今は声が出せないみたい。文字でお話ししよう。');return;}
            if(!context)throw Error('audio');const bytes=new Uint8Array(r.audio),buffer=await context.decodeAudioData(bytes.buffer);
            if(ticket!==sequence||document.hidden)return;source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.onended=()=>{if(ticket===sequence){source=null;message('');}};
            await context.resume();if(ticket!==sequence||document.hidden)return;source.start();message('');
        }catch(_){if(ticket===sequence)message('今は声が出せないみたい。文字でお話ししよう。');}
        finally{if(ticket===sequence){waiting=false;buttons();}}
    }
    $('voice-choice').onchange=()=>{stop();const d=designs.find(d=>d.id===$('voice-choice').value);if(d){drafts[species]=d.settings;drawDesign();buttons();}};$('voice-enabled').onchange=()=>void save(false);
    $('voice-extra').oninput=rememberDraft;
    $('voice-reset').onclick=()=>{stop();drafts[species]=freshDraft();drawDesign();buttons();};
    $('voice-make').onclick=()=>{if(!waiting&&!broken&&!locked){const settings=readDraft();drafts[species]=settings;void play({kind:'design',species,locale,settings});}};
    $('voice-listen').onclick=()=>{if(!waiting&&!broken&&!locked)void play({kind:'preview',voice:$('voice-choice').value,locale});};
    $('voice-stop').onclick=stop;$('voice-apply').onclick=()=>void save();
    const ready=load();
    window.NativeVoiceUI={ready,stop,prime,save,get pending(){return waiting||!!source;},lock(value){locked=value;buttons();},
        mount(container,appearance,language){stop();species=appearance;locale=language;container.append($('voice-panel'));
            $('voice-description').textContent=t(species==='mentor-adventurer'?'冒険家の声の特徴をえらぼう。':'小さく丸い、不思議な生き物の声をもとに、好きな特徴をえらぼう。');
            // A failed reply voice must remain visible even with the voice menu closed.
            if(container.id==='play-voice')container.parentElement.after($('voice-status'));else $('voice-panel').append($('voice-status'));
            draw();if(broken)message('声の約束を読み出せませんでした。');},
        reply(turnId){if(loaded&&!broken&&prefs.enabled&&!document.hidden)void play({kind:'reply',turnId});}
    };
})();
