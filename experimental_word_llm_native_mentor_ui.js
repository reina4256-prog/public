'use strict';
(()=>{
    const $=id=>document.getElementById(id),api=window.nativeMemory,t=s=>GameI18n.translate(s);
    let encounter=null,round=0,sequence=0,waiting=false,context=null,source=null,finishAudio=null;
    function stopAudio(){api.voiceCancel();try{source?.stop();}catch(_){}source=null;finishAudio?.();finishAudio=null;}
    function close(){sequence++;stopAudio();api.mentorStop();encounter=null;waiting=false;$('encounterOverlay').hidden=true;
        window.dispatchEvent(new Event('native-mentor-close'));}
    async function speak(speaker,ticket){
        const id=encounter,number=round,prefs=await api.voiceLoad();if(ticket!==sequence||document.hidden||!prefs.ok||!prefs.value.enabled)return;
        const r=await api.voiceGenerate({kind:'mentor',id,round:number,speaker});if(ticket!==sequence||document.hidden)return;
        if(!r.ok)throw Error('voice');const bytes=new Uint8Array(r.audio),buffer=await context.decodeAudioData(bytes.buffer);
        if(ticket!==sequence||document.hidden)return;source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);
        await context.resume();if(ticket!==sequence||document.hidden)return;
        await new Promise(resolve=>{finishAudio=resolve;source.onended=resolve;source.start();});source=null;finishAudio=null;
    }
    async function next(){if(waiting||!encounter||round>=3)return;waiting=true;$('mentor-next').disabled=true;
        const ticket=sequence;$('mentor-status').textContent=t('返答を待っています…');
        try{const r=await api.mentorNext(encounter,round);if(ticket!==sequence)return;
            if(!r.ok)throw Error('reply');round=r.round;
            for(const line of r.lines){if(ticket!==sequence)return;
                const speaker=line.speaker==='mentor'?t('冒険家'):window.NativeMentorUI.characterName;
                $('encounter-speaker').textContent=speaker;$('encounter-text').textContent=line.text;
                const p=document.createElement('p');p.dataset.i18nSkip='';p.textContent=speaker+'：'+line.text;$('mentor-log').append(p);
                try{await speak(line.speaker,ticket);}catch(_){if(ticket===sequence)$('mentor-status').textContent=t('今は声が出せないみたい。文字でお話ししよう。');}
            }
            if(ticket===sequence&&!$('mentor-status').textContent.includes(t('今は声が出せないみたい。文字でお話ししよう。')))$('mentor-status').textContent=round===3?t('またお話ししよう。'):'';
        }catch(_){if(ticket===sequence){$('mentor-status').textContent=t('今はお話を続けられないみたい。また今度にしよう。');encounter=null;api.mentorStop();}}
        finally{if(ticket===sequence){waiting=false;$('mentor-next').disabled=!encounter||round>=3;}}
    }
    $('mentor-close').onclick=close;$('mentor-next').onclick=()=>void next();
    window.NativeMentorUI={characterName:'',async open(name,locale){
        if(encounter)return;sequence++;const ticket=sequence;this.characterName=name;round=0;
        try{context ||= new AudioContext();void context.resume().catch(()=>{});}catch(_){/* Keep text dialogue available. */}
        const r=await api.mentorStart(locale);if(ticket!==sequence){api.mentorStop();return;}if(!r.ok){close();return;}
        encounter=r.id;$('mentor-log').replaceChildren();$('encounterOverlay').hidden=false;$('encounter-text').textContent='';$('mentor-next').focus();
        const image=new Image();image.src='adventurer_battle_enemy.png';image.onload=()=>{const c=$('encounterCanvas').getContext('2d');c.clearRect(0,0,280,200);c.drawImage(image,794,0,1344,1536,52,0,175,200);};
        void next();},close};
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&!$('encounterOverlay').hidden)close();});
    window.addEventListener('pagehide',close);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('encounterOverlay').hidden)close();});
})();
