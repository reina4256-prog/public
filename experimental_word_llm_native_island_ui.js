'use strict';
(()=>{
    const $=id=>document.getElementById(id),api=window.nativeMemory,t=(s,...a)=>window.GameI18n.translate(s).replace(/\{\{(\d+)\}\}/g,(_,n)=>String(a[Number(n)]??''));
    let state=null,busy=false,blocked=false,paused=false,answers=[],question=0,lastPulse=0,pulsing=false;
    const status=s=>{$('status').textContent=t(s);};
    const warmup=()=>{if(!blocked&&!busy&&!paused&&!document.hidden&&state?.game&&!$('chat-view').hidden)void api.warmup().catch(()=>{});};
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
        $('questions').hidden=false;$('setup').hidden=true;$('play').hidden=true;
        const data=ExperimentalWordStartQuestions.questions[question];$('question-count').textContent=t('{{0}} / {{1}}',question+1,7);$('question-text').textContent=t(data.text);
        $('question-choices').replaceChildren();data.choices.forEach((choice,index)=>{const b=el('button',$('question-choices'),choice);b.type='button';b.onclick=()=>{answers[question]=index;if(question===6){$('questions').hidden=true;$('setup').hidden=false;
                    if(state){$('name').value=state.character.name;$('self').value=state.character.self;$('player').value=state.character.player;for(const id of ['name','self','player'])$(id).readOnly=true;}
                    preview();}else{question++;showQuestion();}};});
        $('question-back').disabled=question===0;window.GameI18n.localizeTree($('questions'));
    }
    function preview(){
        const skin=ExperimentalWordStartQuestions.resolve(answers).appearance,source=images[skin],frame=aiConfigs[skin].actions.idle[0],c=$('appearance').getContext('2d');c.clearRect(0,0,200,180);
        if(source?.complete&&source.naturalWidth){const ratio=Math.min(150/frame.sw,150/frame.sh);c.drawImage(source,frame.sx,frame.sy,frame.sw,frame.sh,100-frame.sw*ratio/2,165-frame.sh*ratio,frame.sw*ratio,frame.sh*ratio);}else setTimeout(preview,100);
    }
    function render(){
        if(!state?.game){showQuestion();return;}
        $('questions').hidden=$('setup').hidden=true;$('play').hidden=false;$('character-name').textContent=state.character.name;$('nameplate').textContent=state.character.name;
        $('conversation').replaceChildren();for(const turn of state.turns.filter(t=>t.world)){el('p',$('conversation'),turn.input,'utterance',true);if(turn.result)el('p',$('conversation'),turn.result.reply,'utterance assistant',true);}
        $('bubble').textContent=state.turns.findLast(x=>x.result&&x.world)?.result.reply||'';
        $('conversation').scrollTop=$('conversation').scrollHeight;renderPanels();meters();window.GameI18n.localizeTree(document.body);
    }
    function renderPanels(){if(!$('diary-view').hidden){window.NativeBook.render($('diary'),state);$('diary-originals').replaceChildren(...state.turns.map(record));}if(!$('stars-view').hidden)window.NativeStars.render($('stars'),$('star-record'),state,record);}
    const activity={idle:'立ち止まっている',move:'歩いている',eat:'食べている',rest:'休んでいる'};
    function meters(){if(!state?.game)return;const g=state.game;$('energy').value=1-g.fatigue;$('fullness').value=1-g.hunger;$('activity').textContent=t(activity[g.mode]);$('pause').textContent=t(paused?'再開':'一時停止');}
    const errors={login:'接続のログインが必要です。導入手順を確認してください。',missing:'接続の準備が必要です。導入手順を確認してください。',quota:'契約内の利用枠に達しました。追加クレジットは使わず、枠の回復を待ってください。',save:'記録を安全に保存できませんでした。終了して保存先を確認してください。',cancelled:'返答を中止しました。原発言は残っています。',output:'返答の形式や出所を確認できませんでした。記憶候補は採用していません。',input:'入力を確認してください。',failed:'返答を受け取れませんでした。接続状態を確認してください。'};
    $('question-back').onclick=()=>{if(question>0){question--;showQuestion();}};
    $('setup').onsubmit=async event=>{event.preventDefault();if(blocked||busy||answers.length!==7)return;busy=true;
        try{const result=state?await api.prepare(answers):await api.create({name:$('name').value,self:$('self').value,player:$('player').value},$('locale').value,answers);
            if(result.ok){state=result.state;status('');render();$('input').focus();}else status(errors[result.error]||errors.failed);
        }catch(_){status(errors.failed);}finally{busy=false;warmup();}};
    $('compose').onsubmit=async event=>{event.preventDefault();if(busy||blocked||!state?.game)return;const input=$('input').value;if(!input.trim())return;
        busy=true;$('send').disabled=true;$('locale').disabled=true;$('cancel').hidden=false;status('返答を待っています…');
        try{const result=await api.submit(input,$('locale').value);if(result.state){state=result.state;if($('input').value===input)$('input').value='';render();}
            if(result.error==='save')blocked=true;status(result.ok?(state.turns.at(-1)?.actionCheck?.accepted===false?'行動案は実行条件を満たさず、実行していません。':''):errors[result.error]||errors.failed);
        }catch(_){status(errors.failed);}finally{busy=false;$('send').disabled=blocked;$('locale').disabled=false;$('cancel').hidden=true;if(!blocked)$('input').focus();warmup();}};
    $('cancel').onclick=()=>api.cancel();$('pause').onclick=()=>{paused=!paused;meters();if(paused&&!busy)api.cancel();else warmup();};
    for(const tab of ['chat','diary','stars'])$('tab-'+tab).onclick=()=>{for(const name of ['chat','diary','stars']){$(name+'-view').hidden=name!==tab;$('tab-'+name).setAttribute('aria-pressed',String(name===tab));}$('workspace').classList.toggle('reading',tab!=='chat');renderPanels();if(tab!=='chat'&&!busy)api.cancel();else warmup();};
    $('input').addEventListener('focus',warmup);$('input').addEventListener('input',warmup);
    $('locale').value=window.GameI18n.language;$('locale').onchange=()=>{window.GameI18n.setLanguage($('locale').value);if(state?.game)render();else if(!$('questions').hidden)showQuestion();};
    window.NativeScene.load();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    async function frame(time){
        if(state?.game&&!document.hidden){window.NativeScene.draw(state.game,time/1000,reduced.matches);
            const stop=paused||busy||!$('chat-view').hidden&&document.activeElement===$('input')&&$('input').value.length>0||$('chat-view').hidden;
            if(time-lastPulse>100&&!pulsing){lastPulse=time;pulsing=true;try{const r=await api.pulse(stop);if(r.game){const island=state.game.island;state.game={...r.game,island};meters();}if(!r.ok&&r.error==='save'){blocked=true;$('send').disabled=true;status(errors.save);}}catch(_){status(errors.failed);}finally{pulsing=false;}}
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);window.addEventListener('pagehide',()=>api.cancel());document.addEventListener('visibilitychange',()=>{if(document.hidden){void api.pulse(true);api.cancel();}else warmup();});
    let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>state?.game&&renderPanels(),160);});
    void api.load().then(result=>{if(!result.ok){blocked=true;$('questions').hidden=$('setup').hidden=true;status(errors.save);return;}state=result.state;if(state){$('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);}render();warmup();}).catch(()=>{blocked=true;status(errors.failed);});
})();
