'use strict';
(()=>{
    const api=window.nativeMemory,t=s=>GameI18n.translate(s),w=WordMasterWindow.create(k=>t({masterContinue:'つづける',masterSkip:'スキップ'}[k]||k));
    w.dialog.dataset.native='true';w.close.id='mentor-next';w.hero.id='mentor-hero';w.portrait.id='mentor-portrait';
    for(const n of [w.thought,w.text,w.name])n.dataset.i18nSkip='';
    const node=(tag,parent,id,text)=>{const n=document.createElement(tag);n.id=id;if(text)n.textContent=t(text);parent.append(n);return n;};
    const end=node('button',w.dialog,'mentor-close','話を終える');end.type='button';
    const status=node('p',w.right,'mentor-status');status.dataset.i18nSkip='';status.setAttribute('role','status');
    const history=node('details',w.right,'mentor-history');node('summary',history,'mentor-history-title','会話をふりかえる');const log=node('div',history,'mentor-log');log.dataset.i18nSkip='';
    w.right.append(w.close);
    function controls(){end.textContent=t('話を終える');document.getElementById('mentor-history-title').textContent=t('会話をふりかえる');w.skip.textContent=t('スキップ');w.close.textContent=t('つづける');}
    window.addEventListener('game-language-changed',controls);
    function line(element,text){element.replaceChildren();const span=document.createElement('span');span.className='mentor-line';span.textContent=text;element.append(span);}
    let encounter=null,round=0,sequence=0,waiting=false,context=null,source=null,finishAudio=null,game=null,name='',locale='ja',phase='closed',master=null,background=null;
    function stopAudio(){api.voiceCancel();try{source?.stop();}catch(_){}source=null;finishAudio?.();finishAudio=null;}
    function clearVideo(){w.video.pause();w.video.removeAttribute('src');w.video.load();w.video.hidden=w.skip.hidden=true;}
    function close(){sequence++;phase='closed';stopAudio();clearVideo();api.mentorStop();encounter=null;waiting=false;if(w.dialog.open)w.dialog.close();window.dispatchEvent(new Event('native-mentor-close'));}
    function introReady(){if(!w.dialog.open||phase==='closed')return;phase='intro';clearVideo();w.dialog.dataset.phase='conversation';w.left.hidden=w.right.hidden=false;
        w.name.textContent=t('冒険家');line(w.text,t('こんにちは。'));line(w.thought,t('冒険家と出会った。'));w.close.disabled=false;w.close.textContent=t('つづける');w.close.focus();}
    async function speak(speaker,ticket){const id=encounter,number=round,p=await api.voiceLoad();if(ticket!==sequence||document.hidden||!p.ok||!p.value.enabled)return;
        const r=await api.voiceGenerate({kind:'mentor',id,round:number,speaker});if(ticket!==sequence||document.hidden)return;if(!r.ok)throw Error('voice');
        const bytes=new Uint8Array(r.audio),buffer=await context.decodeAudioData(bytes.buffer);if(ticket!==sequence||document.hidden)return;
        source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);await context.resume();if(ticket!==sequence||document.hidden)return;
        await new Promise(resolve=>{finishAudio=resolve;source.onended=resolve;source.start();});source=null;finishAudio=null;}
    async function next(){if(waiting||phase==='video'||phase==='closed'||round>=3)return;waiting=true;w.close.disabled=true;const ticket=sequence;
        try{context ||= new AudioContext();void context.resume().catch(()=>{});}catch(_){}
        status.textContent=t('返答を待っています…');
        try{if(!encounter){const start=await api.mentorStart(locale);if(ticket!==sequence)return;if(!start.ok)throw Error('start');encounter=start.id;}
            phase='conversation';const r=await api.mentorNext(encounter,round);if(ticket!==sequence)return;if(!r.ok)throw Error('reply');round=r.round;
            for(const line of r.lines){if(ticket!==sequence)return;
                const speaker=line.speaker==='mentor'?t('冒険家'):name;const span=document.createElement('span');span.className='mentor-line';span.textContent=line.text;(line.speaker==='mentor'?w.text:w.thought).replaceChildren(span);
                const p=node('p',log,'');p.textContent=speaker+'：'+line.text;
                try{await speak(line.speaker,ticket);}catch(_){if(ticket===sequence)status.textContent=t('今は声が出せないみたい。文字でお話ししよう。');}}
            if(ticket===sequence&&status.textContent===t('返答を待っています…'))status.textContent=round===3?t('またお話ししよう。'):'';
        }catch(_){if(ticket===sequence){status.textContent=t('今はお話を続けられないみたい。また今度にしよう。');phase='failed';api.mentorStop();}}
        finally{if(ticket===sequence){waiting=false;w.close.disabled=round>=3||phase==='failed';}}}
    w.close.onclick=()=>void next();end.onclick=close;w.skip.onclick=introReady;w.dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    w.video.addEventListener('ended',introReady);w.video.addEventListener('error',()=>{if(phase==='video'){w.video.controls=true;w.skip.focus();}});
    window.NativeMentorUI={async open(characterName,language,world,arrival){if(w.dialog.open)return;sequence++;const ticket=sequence;name=characterName;locale=language;game=world;round=0;encounter=null;
        controls();
        phase='loading';const r=await api.mentorIntro(arrival);if(ticket!==sequence){api.mentorStop();return;}if(!r.ok){close();return;}
        log.replaceChildren();status.textContent='';w.text.textContent=w.thought.textContent='';w.name.textContent=t('冒険家');w.dialog.showModal();
        master=new Image();master.src='adventurer_battle_enemy.png';background=new Image();background.src=imageSources.field_bg;
        phase='intro';if(r.met){introReady();return;}phase='video';w.dialog.dataset.phase='video';w.left.hidden=w.right.hidden=true;w.video.hidden=w.skip.hidden=false;w.video.controls=false;
        w.video.src=r.video==='mountain'?'encount_adventurer_mountain.mp4':'encount_adventurer_forest.mp4';w.skip.focus();try{await w.video.play();}catch(_){if(ticket===sequence)w.video.controls=true;}
    },close};
    function frame(time){if(w.dialog.open&&game&&['intro','conversation','failed'].includes(phase)){const skin=game.origin.appearance;WordMasterWindow.draw({heroCanvas:w.hero,portraitCanvas:w.portrait,skin,config:aiConfigs[skin],hero:images[skin],background,master,job:{sx:794,sw:1344},time,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});}requestAnimationFrame(frame);}requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase!=='closed')close();});window.addEventListener('pagehide',()=>{if(phase!=='closed')close();});
})();
