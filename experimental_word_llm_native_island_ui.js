'use strict';
(()=>{
    const $=id=>document.getElementById(id),api=window.nativeMemory,t=(s,...a)=>window.GameI18n.translate(s).replace(/\{\{(\d+)\}\}/g,(_,n)=>String(a[Number(n)]??''));
    let state=null,busy=false,blocked=false,paused=false,answers=[],question=0,lastPulse=0,pulsing=false,screen='logo',startingNew=false;
    let strokes=[],pointer=null;
    const status=s=>{$('status').textContent=$('title-status').textContent=t(s);$('status').hidden=screen==='title';};
    const warmup=()=>{if(screen==='play'&&!blocked&&!busy&&!paused&&!document.hidden&&state?.game&&!$('chat-view').hidden)void api.warmup().catch(()=>{});};
    function el(tag,parent,text,cls,literal=false){const n=document.createElement(tag);if(text!==undefined)n.textContent=literal?text:t(text);if(cls)n.className=cls;if(literal)n.dataset.i18nSkip='';parent.append(n);return n;}
    function record(turn){
        const article=document.createElement('article');article.className='record';
        el('h3',article,turn.id,'',true);el('h4',article,'原発言');el('p',article,turn.input,'source',true);
        if(turn.result){el('h4',article,'その時の受け取り方');el('p',article,turn.result.interpretation.summary,'source',true);
            for(const memory of turn.result.memories){el('span',article,'未確認','tag');el('p',article,memory.text,'source',true);el('blockquote',article,memory.quote,'source',true);}
            el('h4',article,'実際の返答');el('p',article,turn.result.reply,'source',true);
            const details=el('details',article);el('summary',details,'会話に渡した記録／参照の申告');el('p',details,turn.supplied.join(', ')||'—','source',true);el('p',details,turn.result.references.join(', ')||'—','source',true);
            if(turn.actionCheck&&!turn.actionCheck.accepted)el('p',article,'行動案は実行条件を満たさず、実行していません。');
        }else el('p',article,'返答は記録されていません。原発言は残っています。');
        return article;
    }
    function showQuestion(){
        screen='questions';$('entry').hidden=true;document.body.classList.add('entry-active');
        $('questions').hidden=false;$('setup').hidden=true;$('play').hidden=true;
        const data=ExperimentalWordStartQuestions.questions[question];$('question-count').textContent=t('{{0}} / {{1}}',question+1,7);$('question-text').textContent=t(data.text);
        $('question-choices').replaceChildren();data.choices.forEach((choice,index)=>{const b=el('button',$('question-choices'),choice);b.type='button';b.onclick=()=>{answers[question]=index;if(question===6){$('questions').hidden=true;$('setup').hidden=false;
                    if(state&&!startingNew){$('name').value=state.character.name;$('self').value=state.character.self;$('player').value=state.character.player;for(const id of ['name','self','player'])$(id).readOnly=true;}
                    screen='setup';window.NativeVoiceUI.mount($('setup-voice'),ExperimentalWordStartQuestions.resolve(answers).appearance,$('locale').value);preview();drawDocument($('setup'),7);drawSignature();}else{question++;showQuestion();}};});
        drawDocument($('questions'),question);window.GameI18n.localizeTree($('questions'));$('question-text').focus();
    }
    // Same cyan document geometry as the original onboarding. Never a game object.
    function drawDocument(parent,completed){
        if(parent.hidden)return;const canvas=parent.querySelector('.document-frame'),{width,height}=parent.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
        canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);const c=canvas.getContext('2d');c.scale(ratio,ratio);
        const wash=c.createLinearGradient(0,0,width,height);wash.addColorStop(0,'#102733');wash.addColorStop(1,'#080f1b');c.fillStyle=wash;c.fillRect(0,0,width,height);
        c.strokeStyle='#70d9f038';c.strokeRect(12.5,12.5,width-25,height-25);c.strokeStyle='#83e8ff';c.shadowColor='#49ceff';c.shadowBlur=9;
        for(const [x,y,sx,sy]of [[12,12,1,1],[width-12,12,-1,1],[12,height-12,1,-1],[width-12,height-12,-1,-1]]){c.beginPath();c.moveTo(x,y+sy*24);c.lineTo(x,y);c.lineTo(x+sx*24,y);c.stroke();}
        for(let i=0;i<7;i++){c.fillStyle=i<completed?'#a5efff':'#254351';c.shadowBlur=i<completed?12:0;c.fillRect(width/2+(i-3)*25-6,32,12,3);}
    }
    for(const id of ['questions','setup'])new ResizeObserver(()=>drawDocument($(id),id==='setup'?7:question)).observe($(id));
    function drawSignature(){
        const c=$('signature').getContext('2d');c.clearRect(0,0,720,160);c.strokeStyle=c.fillStyle='#b4edff';c.lineWidth=2.8;c.lineCap=c.lineJoin='round';
        for(const stroke of strokes){c.beginPath();if(stroke.length===1){c.arc(stroke[0].x*720,stroke[0].y*160,1.4,0,Math.PI*2);c.fill();}else{stroke.forEach((p,i)=>c[i?'lineTo':'moveTo'](p.x*720,p.y*160));c.stroke();}}
        $('sign').disabled=blocked||busy||pointer!==null||!strokes.length;$('signature-clear').disabled=busy||!strokes.length;
    }
    function point(e){const r=$('signature').getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
    $('signature').onpointerdown=e=>{if(screen!=='setup'||busy||blocked||pointer!==null||e.button!==0)return;e.preventDefault();pointer=e.pointerId;$('signature').setPointerCapture(pointer);strokes.push([point(e)]);drawSignature();};
    $('signature').onpointermove=e=>{if(e.pointerId!==pointer)return;for(const sample of e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e])strokes.at(-1).push(point(sample));drawSignature();};
    for(const type of ['pointerup','pointercancel','lostpointercapture'])$('signature').addEventListener(type,e=>{if(e.pointerId===pointer){pointer=null;drawSignature();}});
    $('signature-clear').onclick=()=>{if(busy||blocked)return;strokes=[];pointer=null;drawSignature();};
    $('question-retry').onclick=()=>{if(busy||blocked)return;answers=[];question=0;strokes=[];pointer=null;showQuestion();};
    function showTitle(){if(busy)return;window.NativePracticeUI?.interrupt();window.NativeVoiceUI.stop();api.cancel();void api.pulse(true);screen='title';startingNew=false;
        document.body.classList.add('entry-active');$('entry').hidden=false;for(const id of ['questions','setup','play','character-picker'])$(id).hidden=true;
        $('logo').hidden=true;$('title-menu').hidden=false;$('continue-game').hidden=!state;$('new-game').hidden=false;status('');$(state?'continue-game':'new-game').focus();}
    $('logo').onclick=showTitle;
    $('new-game').onclick=()=>{if(blocked||busy)return;startingNew=true;answers=[];question=0;strokes=[];pointer=null;for(const id of ['name','self','player']){$(id).value='';$(id).readOnly=false;}showQuestion();};
    for(const id of ['back-title','picker-back'])$(id).onclick=showTitle;
    const encounters=new Set();
    function encounter(){const e=state?.game?.walk?.encounter,key=e?.target+'|'+e?.id;if(screen!=='play'||busy||paused||document.hidden||!e||e.phase!=='pending'||encounters.has(key))return;
        encounters.add(key);window.NativeVoiceUI.stop();busy=true;$('play').inert=true;$('locale').disabled=true;void window.NativeMentorUI.open(state.character.name,$('locale').value,state.game,e.id);}
    window.addEventListener('native-mentor-close',()=>{busy=false;$('play').inert=false;$('locale').disabled=false;
        if(state?.game)window.NativeVoiceUI.mount($('play-voice'),state.game.origin.appearance,$('locale').value);$('input').focus();const owner=state;void api.load().then(r=>{if(r.ok&&r.state&&state===owner&&screen==='play'){state=r.state;$('mentor-voice-menu').hidden=!state.game?.walk?.met;}});warmup();});
    window.addEventListener('native-practice-modal',()=>{busy=true;$('play').inert=true;$('locale').disabled=true;});
    window.addEventListener('native-practice-update',event=>{if(screen==='play'&&state?.game){state={...state,game:event.detail};window.NativePracticeUI.sync(state.game,state.character.name);meters();}});
    $('mentor-voice-menu').ontoggle=()=>{if($('mentor-voice-menu').open&&!busy)window.NativeVoiceUI.mount($('mentor-voice'),'mentor-adventurer',$('locale').value);};
    $('voice-menu').ontoggle=()=>{if($('voice-menu').open&&!busy&&state?.game&&$('voice-panel').parentElement!==$('play-voice'))window.NativeVoiceUI.mount($('play-voice'),state.game.origin.appearance,$('locale').value);};
    async function resumeCharacter(id){if(busy||blocked)return;busy=true;window.NativeVoiceUI.stop();try{const r=await api.selectCharacter(id);if(!r.ok){status(errors[r.error]||errors.failed);return;}state=r.state;startingNew=false;answers=[];question=0;strokes=[];pointer=null;
        $('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);if(state.game){paused=false;render();}else showQuestion();
        }catch(_){status(errors.failed);}finally{busy=false;warmup();}}
    $('continue-game').onclick=async()=>{if(blocked||busy||!state)return;busy=true;try{const r=await api.characters();if(!r.ok){status(errors.save);return;}
        if(r.characters.length<=1){busy=false;await resumeCharacter(r.characters[0]?.id||'original');return;}
        $('new-game').hidden=$('continue-game').hidden=true;$('character-picker').hidden=false;$('character-list').replaceChildren();
        for(const [i,character]of r.characters.entries()){const b=el('button',$('character-list'),'#'+(i+1)+' '+character.name,'',true);b.type='button';b.onclick=()=>void resumeCharacter(character.id);}
        window.GameI18n.localizeTree($('character-picker'));$('character-list').querySelector('button')?.focus();
        }catch(_){status(errors.failed);}finally{busy=false;}};
    function drawLogo(time){
        const c=$('logo-canvas').getContext('2d');c.fillStyle='#050505';c.fillRect(0,0,1280,720);c.textAlign='center';c.textBaseline='middle';c.font='bold 50px serif';c.fillStyle='#ffffffe6';c.fillText('Two-Sided Studio',640,330);
        c.beginPath();c.moveTo(390,360);c.lineTo(890,360);c.strokeStyle='#ffffff4d';c.stroke();c.save();c.translate(640,390);c.scale(1,-1);c.fillStyle='#ffffff26';c.fillText('Two-Sided Studio',0,0);c.restore();
        c.font='16px sans-serif';c.fillStyle=`rgba(200,200,200,${reduced.matches?.85:.35+.65*(Math.sin(time/400)+1)/2})`;c.fillText(t('- クリックして開始 -'),640,670);
    }
    function preview(){
        const skin=ExperimentalWordStartQuestions.resolve(answers).appearance,source=images[skin],frame=aiConfigs[skin].actions.idle[0],c=$('appearance').getContext('2d');c.clearRect(0,0,200,180);
        if(source?.complete&&source.naturalWidth){const ratio=Math.min(150/frame.sw,150/frame.sh);c.drawImage(source,frame.sx,frame.sy,frame.sw,frame.sh,100-frame.sw*ratio/2,165-frame.sh*ratio,frame.sw*ratio,frame.sh*ratio);}else setTimeout(preview,100);
    }
    function render(){
        if(!state?.game){showQuestion();return;}
        screen='play';$('entry').hidden=true;document.body.classList.remove('entry-active');
        $('mentor-voice-menu').hidden=!state.game.walk?.met;
        $('questions').hidden=$('setup').hidden=true;$('play').hidden=false;$('character-name').textContent=state.character.name;$('nameplate').textContent=state.character.name;
        window.NativeVoiceUI.mount($('play-voice'),state.game.origin.appearance,$('locale').value);
        $('conversation').replaceChildren();for(const turn of state.turns.filter(t=>t.world)){el('p',$('conversation'),turn.input,'utterance',true);if(turn.result)el('p',$('conversation'),turn.result.reply,'utterance assistant',true);}
        $('bubble').textContent=state.turns.findLast(x=>x.result&&x.world)?.result.reply||'';
        window.NativePracticeUI?.sync(state.game,state.character.name);$('conversation').scrollTop=$('conversation').scrollHeight;renderPanels();meters();window.GameI18n.localizeTree(document.body);
    }
    function renderPanels(){if(!$('diary-view').hidden){window.NativeBook.render($('diary'),state);$('diary-originals').replaceChildren(...state.turns.map(record));}if(!$('stars-view').hidden)window.NativeStars.render($('stars'),$('star-record'),state,record);}
    const activity={idle:'立ち止まっている',move:'歩いている',eat:'食べている',rest:'休んでいる'};
    function meters(){if(!state?.game)return;const g=state.game,p=NativePractice.current(g);let label=activity[g.mode];
        if(NativePractice.active(g))label=p.suspended?'一時停止':p.phase==='survey'?'探検している':p.phase==='return'?'戻っている':p.phase==='outbound'?'歩いている':p.phase==='consult'?'相談を待っている':label;
        $('energy').value=1-g.fatigue;$('fullness').value=1-g.hunger;$('activity').textContent=t(label);$('pause').textContent=t(paused?'再開':'一時停止');}
    const errors={login:'今はお話しできないみたい。少し待ってから、もう一度話しかけてね。',missing:'今はお話しできないみたい。少し待ってから、もう一度話しかけてね。',quota:'今日はお話をひと休み。またあとで話そうね。',save:'記録を安全に保存できませんでした。終了して保存先を確認してください。',cancelled:'返答を中止しました。原発言は残っています。',output:'返答の形式や出所を確認できませんでした。記憶候補は採用していません。',input:'入力を確認してください。',failed:'今はお話しできないみたい。少し待ってから、もう一度話しかけてね。'};
    $('setup').onsubmit=async event=>{event.preventDefault();if(blocked||busy||answers.length!==7||!strokes.length||pointer!==null||screen!=='setup')return;
        const character={name:$('name').value,self:$('self').value,player:$('player').value},chosen=[...answers],locale=$('locale').value;
        busy=true;window.NativeVoiceUI.lock(true);drawSignature();$('question-retry').disabled=true;for(const id of ['name','self','player'])$(id).readOnly=true;$('setup').classList.add('signed');
        try{if(!await window.NativeVoiceUI.save())return;await new Promise(resolve=>setTimeout(resolve,reduced.matches?0:450));const result=state?(startingNew?await api.createCharacter(character,locale,chosen):await api.prepare(chosen)):await api.create(character,locale,chosen);
            if(result.ok){state=result.state;startingNew=false;paused=false;status('');render();$('input').focus();}else status(errors[result.error]||errors.failed);
            if(result.error==='save')blocked=true;
        }catch(_){status(errors.failed);}finally{busy=false;window.NativeVoiceUI.lock(false);$('setup').classList.remove('signed');$('question-retry').disabled=blocked;for(const id of ['name','self','player'])$(id).readOnly=!!state&&!startingNew;drawSignature();warmup();}};
    $('compose').onsubmit=async event=>{event.preventDefault();if(busy||blocked||!state?.game)return;const input=$('input').value;if(!input.trim())return;
        if(window.NativePracticeUI?.interrupt())api.cancel();window.NativeVoiceUI.stop();window.NativeVoiceUI.prime();
        busy=true;$('send').disabled=true;$('back-title').disabled=true;$('locale').disabled=true;$('cancel').hidden=false;status('返答を待っています…');
        try{const result=await api.submit(input,$('locale').value);if(result.state){state=result.state;if($('input').value===input)$('input').value='';render();if(result.ok)window.NativePracticeUI?.afterChat(state);}
            if(result.error==='save')blocked=true;status(result.ok?(state.turns.at(-1)?.actionCheck?.accepted===false?'行動案は実行条件を満たさず、実行していません。':''):errors[result.error]||errors.failed);
            if(result.ok&&!paused&&!document.hidden&&$('chat-view').hidden===false&&!$('input').value.trim())window.NativeVoiceUI.reply(state.turns.at(-1).id);
        }catch(_){status(errors.failed);}finally{busy=false;$('send').disabled=blocked;$('back-title').disabled=false;$('locale').disabled=false;$('cancel').hidden=true;if(!blocked)$('input').focus();warmup();}};
    $('cancel').onclick=()=>{window.NativePracticeUI?.interrupt();window.NativeVoiceUI.stop();api.cancel();};$('pause').onclick=()=>{window.NativePracticeUI?.interrupt();window.NativeVoiceUI.stop();paused=!paused;meters();if(paused&&!busy)api.cancel();else warmup();};
    for(const tab of ['chat','diary','stars'])$('tab-'+tab).onclick=()=>{window.NativePracticeUI?.interrupt();window.NativeVoiceUI.stop();for(const name of ['chat','diary','stars']){$(name+'-view').hidden=name!==tab;$('tab-'+name).setAttribute('aria-pressed',String(name===tab));}$('workspace').classList.toggle('reading',tab!=='chat');renderPanels();if(tab!=='chat'&&!busy)api.cancel();else warmup();};
    $('input').addEventListener('focus',warmup);$('input').addEventListener('input',()=>{window.NativeVoiceUI.stop();warmup();});
    $('locale').value=window.GameI18n.language;$('locale').onchange=()=>{window.NativeVoiceUI.stop();window.GameI18n.setLanguage($('locale').value);if(screen==='play'&&state?.game)render();else if(!$('questions').hidden)showQuestion();else if(screen==='setup')window.NativeVoiceUI.mount($('setup-voice'),ExperimentalWordStartQuestions.resolve(answers).appearance,$('locale').value);};
    window.NativeScene.load();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    async function frame(time){
        if(screen==='logo'&&!document.hidden)drawLogo(time);
        if(screen==='play'&&state?.game&&!document.hidden){window.NativeScene.draw(state.game,time/1000,reduced.matches);
            const stop=paused||busy||!$('chat-view').hidden&&document.activeElement===$('input')&&$('input').value.length>0||$('chat-view').hidden;
            if(time-lastPulse>100&&!pulsing){lastPulse=time;pulsing=true;const owner=state;try{const r=await api.pulse(stop);if(screen==='play'&&state===owner){if(r.game){const island=state.game.island;state.game={...r.game,island};meters();encounter();window.NativePracticeUI?.poll(state.game,!stop&&!document.hidden);}if(!r.ok&&r.error==='save'){blocked=true;$('send').disabled=true;status(errors.save);}}}catch(_){status(errors.failed);}finally{pulsing=false;}}
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);window.addEventListener('pagehide',()=>{window.NativeVoiceUI.stop();api.cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden){window.NativeVoiceUI.stop();void api.pulse(true);api.cancel();}else warmup();});
    let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>state?.game&&renderPanels(),160);});
    void api.load().then(async result=>{await window.NativeVoiceUI.ready;if(!result.ok){blocked=true;$('questions').hidden=$('setup').hidden=true;status(errors.save);return;}state=result.state;if(state){$('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);}$('entry').hidden=false;}).catch(()=>{blocked=true;status(errors.failed);});
})();
