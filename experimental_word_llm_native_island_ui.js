'use strict';
(()=>{
    const $=id=>document.getElementById(id),api=window.nativeMemory,t=(s,...a)=>window.GameI18n.translate(s).replace(/\{\{(\d+)\}\}/g,(_,n)=>String(a[Number(n)]??''));
    let state=null,busy=false,blocked=false,paused=false,answers=[],question=0,lastPulse=0,pulsing=false,screen='logo',startingNew=false;
    let strokes=[],pointer=null;
    let resuming=false;
    function interruptResume(){if(resuming){resuming=false;api.cancel();}}
    const calendarZone=$('calendar-zone'),calendarHemisphere=$('calendar-hemisphere');
    for(const zone of ['UTC',...(Intl.supportedValuesOf?.('timeZone')||[])]){const o=document.createElement('option');o.value=zone;o.textContent=zone;o.dataset.i18nSkip='';calendarZone.append(o);}
    function renderCalendar(){const settings=state?.game?.calendarSettings||NativeCalendar.defaults();
        if(![...calendarZone.options].some(o=>o.value===settings.zone)){const o=document.createElement('option');o.value=o.textContent=settings.zone;o.dataset.i18nSkip='';calendarZone.append(o);}
        calendarZone.value=settings.zone;calendarHemisphere.value=settings.hemisphere;}
    async function saveCalendar(){if(busy||blocked||!state?.game){renderCalendar();return;}const owner=state;calendarZone.disabled=calendarHemisphere.disabled=true;
        try{const r=await api.calendarSettings({zone:calendarZone.value,hemisphere:calendarHemisphere.value},$('locale').value);if(state===owner){if(r.ok){state=r.state;$('calendar-status').textContent=t('日時と季節の設定を保存しました。');}else{$('calendar-status').textContent=t('設定を保存できませんでした。');renderCalendar();}}}
        catch(_){$('calendar-status').textContent=t('設定を保存できませんでした。');renderCalendar();}finally{calendarZone.disabled=calendarHemisphere.disabled=false;}}
    calendarZone.onchange=calendarHemisphere.onchange=saveCalendar;
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
    async function showTitle(){if(busy)return;window.NativePracticeUI?.interrupt();window.NativeVoiceUI.stop();api.cancel();const left=await api.leave();if(!left.ok){blocked=true;status(errors.save);return;}void api.pulse(true);screen='title';startingNew=false;
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
        $('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);if(state.game){const entered=await api.enter();if(!entered.ok){status(errors.save);return;}state=entered.state;paused=false;render();const owner=state;resuming=true;void api.resumeReport().then(report=>{const allowed=resuming;resuming=false;if(!allowed||screen!=='play'||state!==owner||document.hidden)return;if(report.state){state=report.state;render();}if(report.resume&&!paused&&!$('input').value.trim())window.NativeVoiceUI.resume(report.resume);}).catch(()=>{resuming=false;status(errors.failed);});}else showQuestion();
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
        renderCalendar();
        $('questions').hidden=$('setup').hidden=true;$('play').hidden=false;$('character-name').textContent=state.character.name;$('nameplate').textContent=state.character.name;
        window.NativeVoiceUI.mount($('play-voice'),state.game.origin.appearance,$('locale').value);
        const a=state.game.absence,reunions=[...(a?.reportHistory||[]),...(a?.report?[a.report]:[])].filter(r=>r.text),entries=[...state.turns.filter(t=>t.world),...reunions].sort((a,b)=>a.at-b.at);
        $('conversation').replaceChildren();for(const entry of entries){if(entry.input){el('p',$('conversation'),entry.input,'utterance',true);if(entry.result)el('p',$('conversation'),entry.result.reply,'utterance assistant',true);}else el('p',$('conversation'),entry.text,'utterance assistant',true);}
        const latest=entries.findLast(e=>e.text||e.result?.reply);$('bubble').textContent=latest?.text||latest?.result?.reply||'';
        window.NativePracticeUI?.sync(state.game,state.character.name);$('conversation').scrollTop=$('conversation').scrollHeight;renderPanels();meters();window.GameI18n.localizeTree(document.body);
    }
    function renderPanels(){if(!$('diary-view').hidden){window.NativeBook.render($('diary'),state);$('diary-originals').replaceChildren(...state.turns.map(record));}if(!$('stars-view').hidden)window.NativeStars.render($('stars'),$('star-record'),state,record);}
    const activity={idle:'立ち止まっている',move:'歩いている',eat:'食べている',rest:'休んでいる'};let inventoryKey='',taskKey='',affinityKey='';
    const affinityPanel=el('section',$('world-stage'));affinityPanel.id='affinity-panel';affinityPanel.hidden=true;affinityPanel.setAttribute('aria-labelledby','affinity-title');
    const affinityTitle=el('h3',affinityPanel,'みんなとの仲');affinityTitle.id='affinity-title';
    const affinityDetails=el('div',affinityPanel);affinityDetails.setAttribute('aria-live','polite');
    function renderAffinity(g){const relation=NativePractice.relationship(g),known=(g.practices||[]).some(p=>!p.npc&&!p.free&&!p.remote&&p.lines.some(l=>l.slot==='offer'))||g.walk?.met,builder=!!g.walk?.builder?.met;
        const key=JSON.stringify([g.affinityPanelOpen,known,relation,builder,NativePractice.relationship(g,null,false,'building'),$('locale').value]);if(key===affinityKey)return;affinityKey=key;
        affinityPanel.hidden=g.affinityPanelOpen!==true;$('world-stage').classList.toggle('has-affinity',!affinityPanel.hidden);affinityDetails.replaceChildren();
        if(!known&&!builder){el('p',affinityDetails,'まだ知り合いはいません。');return;}
        for(const npc of [...(known?['adventurer']:[]),...(builder?['building']:[])]){const relation=NativePractice.relationship(g,null,false,npc);
        const card=el('div',affinityDetails,undefined,'affinity-person'),portrait=el('img',card);portrait.src=npc==='building'?'builder_battle_enemy.png':'adventurer_battle_enemy.png';portrait.alt='';
        const details=el('div',card);el('p',details,npc==='building'?'建築士':'冒険家');
        const hearts=el('p',details,'♥'.repeat(relation.hearts)+'♡'.repeat(5-relation.hearts),'affinity-hearts',true);hearts.setAttribute('role','img');hearts.setAttribute('aria-label',t('親しさ：{{0}} / 5',relation.hearts));
        el('p',details,['まだ距離がある','知り合ったばかり','少し打ち解けている','親しくなってきた','信頼し合っている','とても大切な仲'][relation.hearts]);
        if(relation.last){el('p',details,relation.last.delta>0?'前より親しくなりました。':'少し距離ができました。');el('p',details,relation.last.reason,'affinity-reason',true);}}}
    const taskPanel=el('section',$('world-stage'));taskPanel.id='task-panel';taskPanel.hidden=true;taskPanel.setAttribute('aria-labelledby','task-title');
    const taskTitle=el('h3',taskPanel,'今の課題');taskTitle.id='task-title';
    const taskDetails=el('div',taskPanel);taskDetails.id='task-details';taskDetails.setAttribute('aria-live','polite');
    function renderTask(g){const j=NativePractice.absence.current(g),p=(g.practices||[]).findLast(p=>!p.free&&!p.visit&&!p.remote),b=NativePractice.building(g),visit=(g.practices||[]).findLast(p=>p.builderEnabled),key=JSON.stringify([[g.home?.phase,g.home?.site,g.home?.confirmed,g.home?.request,g.home?.inside,g.home?.phase==='building'?Math.ceil((g.home.readyAt-g.home.now)/1000):null],g.taskPanelOpen,j,p?.id,p?.phase,p?.suspended,p?.events,g.inventory?.items,b,g.walk?.builder?.met,visit?.phase,visit?.suspended,$('locale').value]);if(key===taskKey)return;taskKey=key;
        taskPanel.hidden=g.taskPanelOpen!==true;taskDetails.replaceChildren();
        if(g.walk?.builder?.met){el('p',taskDetails,g.home?'建築相談ができます。':'建築相談には二課題完了と建築士のハート3が必要です。');}
        if(g.home){const h=g.home,b=NativePractice.building(g),bag=NativePractice.possessions(g,false);el('p',taskDetails,'マイホーム');
            el('p',taskDetails,h.phase==='ready'?'完成しました。':h.phase==='building'?'建築中です。':h.request?'建築士との対面で了承を受けてください。':h.confirmed?'場所を確認しました。建築は別の明示依頼で頼んでください。':'家の場所は、会話で提案と確認をしてください。');
            if(h.phase==='planning')el('p',taskDetails,t('追加で必要な材料：木材 {{0}} / 石 {{1}}',Math.max(0,8-b.held.wood-bag.wood),Math.max(0,4-b.held.stone-bag.stone)),'',true);
            if(h.phase==='building')el('p',taskDetails,t('完成まで：約 {{0}} 秒',Math.max(0,Math.ceil((h.readyAt-h.now)/1000))),'',true);
            el('p',taskDetails,'総費用は木材8個と石4個。預かり材を含み、工期は実時間10分です。着工後の取消・移築はできません。');}
        if(g.walk?.builder?.met){el('p',taskDetails,'建築士');
            for(const index of [0,1]){const phase=index<b.task.index?'完了':index>b.task.index||b.task.phase==='unstarted'?'未開始':b.task.phase==='partial'?'納入途中':'引受済み';
                el('p',taskDetails,t('内容：{{0}}',t(index===0?'小屋の柱用の木材2個':'基礎用の石2個')),'',true);
                el('p',taskDetails,t('進行：{{0}}',t(phase)),'',true);}
            if(visit?.suspended||['stopped','failed'].includes(visit?.phase))el('p',taskDetails,'中断しています。');
            el('p',taskDetails,t('建築預かり材：木材 {{0}} / 石 {{1}}',b.held.wood,b.held.stone),'',true);
            if(!g.home?.payment)el('p',taskDetails,'預かり材は将来の家の材料に全数使います。');}
        if(j){el('p',taskDetails,'留守番採集');el('p',taskDetails,t('集めた数：{{0}} {{1}}',t(j.type==='wood'?'木材':'石'),j.total),'',true);
            el('p',taskDetails,j.status==='reserved'?'予約中（本編を離れてから開始）':j.status==='done'?'完了':j.status==='cancelled'?'今回は見送った':'再開のため停止中');
            if(j.reason==='resources')el('p',taskDetails,'資源の回復を待っています。');
            if(j.reason==='capacity')el('p',taskDetails,'記録できる量に達したため、途中で止めています。');
            if(j.unsettled)el('p',taskDetails,t('未清算の期間（UTC）：{{0}} ～ {{1}}',new Date(j.unsettled.from).toISOString(),new Date(j.unsettled.to).toISOString()),'',true);
            if(j.phase==='gather')el('p',taskDetails,t('採集途中：{{0}} / 600 秒',Math.floor(j.timer/1000)),'',true);
            if(j.phase==='outbound'||j.phase==='return')el('p',taskDetails,j.phase==='return'?'戻っている':'歩いている');}
        if(!p){if(!g.walk?.builder?.met&&!j)el('p',taskDetails,'今は課題がありません。');return;}
        el('p',taskDetails,'冒険家');
        const mountain=p.target.startsWith('chip:mountain_'),goal=p.gather?(mountain?'山で石を2個探し、冒険家に報告する':'森で木材を2個探し、冒険家に報告する'):(mountain?'山を探索し、冒険家に報告する':'森を探索し、冒険家に報告する');
        const phases={offer:'冒険家の提案を聞いている',decision:'参加するか考えている',consult:'相談を待っている',outbound:'探索場所へ向かっている',survey:'探している',return:'戻っている',report:'冒険家に報告している',feedback:'冒険家の返事を待っている',done:'完了',declined:'今回は見送った',stopped:'進行が止まっています。',failed:'進行が止まっています。'};
        const stage=t(p.suspended?'中断しています。':phases[p.phase])+(p.phase==='failed'&&p.lines.at(-1)?.slot==='report'?' / '+t('冒険家の返事を待っている'):'');
        el('p',taskDetails,t('内容：{{0}}',t(goal)),'',true);el('p',taskDetails,t('進行：{{0}}',stage),'',true);
        el('p',taskDetails,t('探索した場所：{{0}} / 2',p.events.filter(e=>e.kind==='observed').length),'',true);
        if(p.gather)el('p',taskDetails,t('今回見つけた数：{{0}} / 2',NativePractice.allItems(g).filter(i=>i.practice===p.id).length),'',true);
    }
    function materialIcon(type){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 72 64');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.classList.add('inventory-icon');
        // Fixed display art only. No player text or generated markup enters the SVG.
        svg.innerHTML=type==='wood'
            ?'<g stroke="#59351f" stroke-width="2" stroke-linejoin="round"><path fill="#9d6337" d="m8 35 31-20 24 15-31 21z"/><path fill="#704225" d="m8 35 24 16v8L8 44z"/><path fill="#ba8050" d="m32 51 31-21v9L32 59z"/><path fill="#bb8754" d="m12 23 30-16 19 12-30 19z"/><path fill="#8b522c" d="m12 23 19 15v11L12 34z"/><path fill="#a66b3b" d="m31 38 30-19v12L31 49z"/><ellipse fill="#edc78e" cx="22" cy="35" rx="9" ry="12" transform="rotate(-35 22 35)"/><ellipse fill="none" stroke="#ae7741" cx="22" cy="35" rx="4" ry="7" transform="rotate(-35 22 35)"/><path fill="none" stroke="#754225" d="m38 20 15-8m-15 17 16-9m-9 26 13-8"/></g>'
            :'<g stroke="#4e5656" stroke-width="2" stroke-linejoin="round"><path fill="#8f9894" d="m9 34 10-20 22-4 15 14-3 24-27 8z"/><path fill="#c3c8bd" d="m9 34 10-20 22-4-6 21z"/><path fill="#adb5ac" d="m35 31 6-21 15 14-3 24z"/><path fill="#687774" d="m9 34 26-3 18 17-27 8z"/><path fill="#a6afa7" d="m39 43 8-13 15 2 6 17-16 9-15-5z"/><path fill="#d1d3c4" d="m39 43 8-13 15 2-9 12z"/><path fill="#788681" d="m53 44 9-12 6 17-16 9z"/></g>';
        if(type==='flower')svg.innerHTML='<g stroke="#46653b" stroke-width="2"><path fill="none" d="M36 55V26"/><path fill="#7eaa59" d="M36 45Q12 29 20 47Q29 54 36 49M36 39Q60 25 55 43Q46 48 36 45"/><g fill="#edbdce" stroke="#a35f81"><ellipse cx="36" cy="16" rx="8" ry="11"/><ellipse cx="25" cy="25" rx="11" ry="8"/><ellipse cx="47" cy="25" rx="11" ry="8"/><ellipse cx="29" cy="36" rx="8" ry="10"/><ellipse cx="44" cy="36" rx="8" ry="10"/></g><circle cx="36" cy="27" r="7" fill="#f4d87c"/></g>';
        if(['water','canteen'].includes(type))svg.innerHTML='<g stroke="#654b30" stroke-width="2" stroke-linejoin="round"><path fill="#bd9768" d="M28 6h16v13q13 4 13 18v12q0 11-21 11T15 49V37q0-14 13-18z"/><path fill="'+(type==='water'?'#75bdd1':'#e1cf9e')+'" d="M22 38q0-14 14-14t14 14v10q0 7-14 7t-14-7z"/><path fill="#8c6842" d="M26 6h20v10H26z"/><path fill="none" d="M17 35h38M18 49h36M23 17Q3 8 10 42"/></g>';
        if(type==='compass')svg.innerHTML='<g stroke="#654b30" stroke-width="2" stroke-linejoin="round"><circle cx="36" cy="9" r="6" fill="none"/><path fill="#9b7040" d="M31 12h10v8H31z"/><circle cx="36" cy="37" r="23" fill="#c59a52"/><circle cx="36" cy="37" r="18" fill="#f5e5b6"/><path fill="none" stroke="#9c7c4f" d="M36 21v5m0 22v5M20 37h5m22 0h5M25 26l3 3m16 16 3 3m0-22-3 3M28 45l-3 3"/><path fill="#b54d42" d="m36 23-6 14 6 3 6-3z"/><path fill="#567d85" d="m36 51 6-14-6 3-6-3z"/><circle cx="36" cy="37" r="3" fill="#d4ac61"/></g>';
        return svg;}
    const searchNotice=el('p',$('world-stage'));searchNotice.id='search-notice';searchNotice.setAttribute('role','status');searchNotice.hidden=true;
    const searchLabels={active:'{{0}}を探しています。',found:'{{0}}に会えました。',exhausted:'今回見て回れた範囲では、{{0}}に会えませんでした。',stopped:'{{0}}を探すのを中断しました。'};
    function meters(){if(!state?.game)return;const g=state.game,p=NativePractice.current(g);renderTask(g);renderAffinity(g);let label=activity[g.mode];
        searchNotice.hidden=!g.walk?.search;searchNotice.textContent=g.walk?.search?t(searchLabels[g.walk.search.phase],t(NativeWalk.searchLabel(g))):'';
        const bag=NativePractice.possessions(g,false),key=JSON.stringify(bag)+'|'+$('locale').value;
        if(key!==inventoryKey){inventoryKey=key;$('inventory').hidden=!bag.open;$('inventory-items').replaceChildren();
            for(const [type,itemLabel]of [['wood','木材'],['stone','石'],['flower','花'],['water','水の入った水筒'],['canteen','空の水筒'],['compass','旅人の通信コンパス']]){const count=type==='compass'?(bag.compass?.owned?1:0):type==='canteen'?(bag.bottle==='empty'?1:0):bag[type];if(count){const slot=el('figure',$('inventory-items'),undefined,'inventory-item');slot.append(materialIcon(type));el('figcaption',slot,t(itemLabel)+' × '+count,'',true);}}
            if(!NativePractice.types.some(type=>bag[type])&&bag.bottle==='none'&&!bag.compass?.owned)el('p',$('inventory-items'),'まだ持ち物はありません。');}
        if(NativePractice.active(g))label=p.suspended?'一時停止':p.phase==='survey'?'探検している':p.phase==='return'?'戻っている':p.phase==='outbound'?'歩いている':p.phase==='consult'?'相談を待っている':label;
        if(g.home?.travel||g.home?.exit)label='歩いている';
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
    $('input').addEventListener('focus',warmup);$('input').addEventListener('input',()=>{interruptResume();window.NativeVoiceUI.stop();warmup();});
    $('locale').value=window.GameI18n.language;$('locale').onchange=()=>{window.NativeVoiceUI.stop();window.GameI18n.setLanguage($('locale').value);if(screen==='play'&&state?.game){render();void saveCalendar();}else if(!$('questions').hidden)showQuestion();else if(screen==='setup')window.NativeVoiceUI.mount($('setup-voice'),ExperimentalWordStartQuestions.resolve(answers).appearance,$('locale').value);};
    window.NativeScene.load();const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    async function frame(time){
        if(screen==='logo'&&!document.hidden)drawLogo(time);
        if(screen==='play'&&state?.game&&!document.hidden){window.NativeScene.draw(state.game,time/1000,reduced.matches);
            const stop=paused||busy||window.NativePracticeUI?.pending||!$('chat-view').hidden&&document.activeElement===$('input')&&$('input').value.length>0||$('chat-view').hidden;
            if(time-lastPulse>100&&!pulsing){lastPulse=time;pulsing=true;const owner=state;try{const r=await api.pulse(stop);if(screen==='play'&&state===owner){if(r.game){const island=state.game.island;state.game={...r.game,island};meters();encounter();window.NativePracticeUI?.poll(state.game,!stop&&!document.hidden);}if(!r.ok&&r.error==='save'){blocked=true;$('send').disabled=true;status(errors.save);}}}catch(_){status(errors.failed);}finally{pulsing=false;}}
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);window.addEventListener('pagehide',()=>{window.NativeVoiceUI.stop();api.cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden){window.NativeVoiceUI.stop();void api.pulse(true);api.cancel();}else warmup();});
    let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>state?.game&&renderPanels(),160);});
    void api.load().then(async result=>{await window.NativeVoiceUI.ready;if(!result.ok){blocked=true;$('questions').hidden=$('setup').hidden=true;status(errors.save);return;}state=result.state;if(state){$('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);}$('entry').hidden=false;}).catch(()=>{blocked=true;status(errors.failed);});
})();
