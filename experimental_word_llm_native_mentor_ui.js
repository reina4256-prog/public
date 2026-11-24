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
    let practiceId=null,practiceArmed=false,practiceWaiting=false,lastPracticeLine='';
    function stopAudio(){api.voiceCancel();try{source?.stop();}catch(_){}source=null;finishAudio?.();finishAudio=null;}
    function clearVideo(){w.video.pause();w.video.removeAttribute('src');w.video.load();w.video.hidden=w.skip.hidden=true;}
    function close(){sequence++;practiceArmed=false;practiceId=null;phase='closed';stopAudio();clearVideo();api.mentorStop();api.cancel();encounter=null;waiting=false;if(w.dialog.open)w.dialog.close();window.dispatchEvent(new Event('native-mentor-close'));}
    function handoff(){phase='closed';clearVideo();encounter=null;waiting=false;if(w.dialog.open)w.dialog.close();window.dispatchEvent(new Event('native-mentor-close'));}
    function introReady(){if(!w.dialog.open||phase==='closed')return;phase='intro';clearVideo();w.dialog.dataset.phase='conversation';w.left.hidden=w.right.hidden=false;
        w.name.textContent=t('冒険家');line(w.text,practiceId?'':t('こんにちは。'));line(w.thought,practiceId?'':t('冒険家と出会った。'));w.close.disabled=false;w.close.textContent=t('つづける');w.close.focus();}
    async function speak(speaker,ticket){const id=encounter,number=round,p=await api.voiceLoad();if(ticket!==sequence||document.hidden||!p.ok||!p.value.enabled)return;
        const r=await api.voiceGenerate({kind:'mentor',id,round:number,speaker});if(ticket!==sequence||document.hidden)return;if(!r.ok)throw Error('voice');
        const bytes=new Uint8Array(r.audio),buffer=await context.decodeAudioData(bytes.buffer);if(ticket!==sequence||document.hidden)return;
        source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);await context.resume();if(ticket!==sequence||document.hidden)return;
        await new Promise(resolve=>{finishAudio=resolve;source.onended=resolve;source.start();});source=null;finishAudio=null;}
    async function next(){if(practiceId){practiceArmed=true;return drainPractice();}if(waiting||phase==='video'||phase==='closed'||round>=3)return;waiting=true;w.close.disabled=true;const ticket=sequence;
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
        practiceId=r.practice||null;if(r.game)game=r.game;practiceArmed=false;
        log.replaceChildren();status.textContent='';w.text.textContent=w.thought.textContent='';w.name.textContent=t('冒険家');w.dialog.showModal();
        master=new Image();master.src='adventurer_battle_enemy.png';background=new Image();background.src=imageSources.field_bg;
        phase='intro';if(r.met){introReady();return;}phase='video';w.dialog.dataset.phase='video';w.left.hidden=w.right.hidden=true;w.video.hidden=w.skip.hidden=false;w.video.controls=false;
        w.video.src=r.video==='mountain'?'encount_adventurer_mountain.mp4':'encount_adventurer_forest.mp4';w.skip.focus();try{await w.video.play();}catch(_){if(ticket===sequence)w.video.controls=true;}
    },close};
    function syncPractice(world,characterName){if(characterName!==undefined)name=characterName;const p=NativePractice.current(world);if(!p)return;
        const chat=document.getElementById('conversation');let section=document.getElementById('practice-conversation');
        if(!section){section=document.createElement('div');section.id='practice-conversation';section.dataset.i18nSkip='';chat.append(section);}
        const key=p.id+'|'+p.lines.length;if(section.dataset.lines!==key){section.dataset.lines=key;section.replaceChildren();
            for(const l of p.lines){const n=document.createElement('p');n.className='utterance assistant';n.textContent=(l.speaker==='mentor'?t('冒険家'):name)+'：'+l.text;section.append(n);}}
        const last=p.lines.at(-1),lineKey=last&&p.id+'|'+last.slot;if(last&&lineKey!==lastPracticeLine){lastPracticeLine=lineKey;
            if(last.speaker==='companion')document.getElementById('bubble').textContent=last.text;chat.scrollTop=chat.scrollHeight;}
    }
    async function speakPractice(id,l,ticket){const pref=await api.voiceLoad();if(ticket!==sequence||document.hidden||!pref.ok||!pref.value.enabled)return;
        const r=await api.voiceGenerate({kind:'practice',id,slot:l.slot});if(ticket!==sequence||document.hidden)return;if(!r.ok)throw Error('voice');
        const buffer=await context.decodeAudioData(new Uint8Array(r.audio).buffer);if(ticket!==sequence||document.hidden)return;
        source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);await context.resume();if(ticket!==sequence||document.hidden)return;
        await new Promise(resolve=>{finishAudio=resolve;source.onended=resolve;source.start();});source=null;finishAudio=null;
    }
    async function drainPractice(){if(practiceWaiting||!practiceArmed||!practiceId||document.hidden)return;
        const ticket=sequence,id=practiceId;practiceWaiting=true;waiting=true;w.close.disabled=true;
        try{try{context ||= new AudioContext();void context.resume().catch(()=>{});}catch(_){}
            for(let count=0;count<6&&ticket===sequence&&practiceArmed;count++){
                const p=NativePractice.current(game),slot=NativePractice.due(p);if(!slot)break;
                if(['offer','decision','report','feedback'].includes(slot)){
                    if(!w.dialog.open){phase='conversation';w.dialog.dataset.phase='conversation';w.left.hidden=w.right.hidden=false;
                        if(!master){master=new Image();master.src='adventurer_battle_enemy.png';}if(!background){background=new Image();background.src=imageSources.field_bg;}
                        w.name.textContent=t('冒険家');w.dialog.showModal();window.dispatchEvent(new Event('native-practice-modal'));}
                    status.textContent=t('返答を待っています…');
                }
                const r=await api.practiceNext(id);if(ticket!==sequence||document.hidden)return;if(!r.ok)throw Error(r.error||'reply');
                game=r.game;window.dispatchEvent(new CustomEvent('native-practice-update',{detail:game}));syncPractice(game);
                if(w.dialog.open){line(r.line.speaker==='mentor'?w.text:w.thought,r.line.text);const entry=node('p',log,'');entry.textContent=(r.line.speaker==='mentor'?t('冒険家'):name)+'：'+r.line.text;}
                try{await speakPractice(id,r.line,ticket);}catch(_){if(ticket===sequence){status.textContent=t('今は声が出せないみたい。文字でお話ししよう。');document.getElementById('status').textContent=status.textContent;}}
                if(ticket!==sequence||!practiceArmed)return;
                const current=NativePractice.current(game);
                if(r.line.slot==='decision'){practiceArmed=!['consult','declined','failed','stopped'].includes(current.phase);handoff();}
                if(r.line.slot==='feedback'){practiceArmed=false;status.textContent=t('またお話ししよう。');w.close.disabled=true;break;}
            }
        }catch(_){if(ticket===sequence){practiceArmed=false;status.textContent=t('今はお話を続けられないみたい。また今度にしよう。');document.getElementById('status').textContent=status.textContent;api.cancel();}}
        finally{if(ticket===sequence){waiting=false;w.close.disabled=true;}practiceWaiting=false;}
    }
    window.NativePracticeUI={sync:syncPractice,afterChat(state){name=state.character.name;locale=state.locale;game=state.game;const choice=state.turns.at(-1)?.result?.practiceChoice;
        syncPractice(game);if(choice&&['accept','resume'].includes(choice.choice)&&NativePractice.active(game)&&!NativePractice.current(game).suspended){practiceId=NativePractice.current(game).id;practiceArmed=true;}},
        poll(world,allowed){game=world;syncPractice(world);if(allowed&&practiceArmed&&NativePractice.current(world)?.id===practiceId&&!practiceWaiting&&NativePractice.due(NativePractice.current(world)))void drainPractice();},
        interrupt(){const wasArmed=practiceArmed;sequence++;practiceArmed=false;stopAudio();return wasArmed;},get pending(){return practiceWaiting;}};
    function frame(time){if(w.dialog.open&&game&&['intro','conversation','failed'].includes(phase)){const skin=game.origin.appearance;WordMasterWindow.draw({heroCanvas:w.hero,portraitCanvas:w.portrait,skin,config:aiConfigs[skin],hero:images[skin],background,master,job:{sx:794,sw:1344},time,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});}requestAnimationFrame(frame);}requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&(phase!=='closed'||practiceArmed))close();});window.addEventListener('pagehide',()=>{if(phase!=='closed'||practiceArmed)close();});
})();
