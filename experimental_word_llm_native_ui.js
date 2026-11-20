'use strict';
(() => {
    const $=id=>document.getElementById(id),api=window.nativeMemory;
    let state=null,busy=false,blocked=false;
    const status=s=>{$('status').textContent=s;};
    function literal(parent,text,tag='p') {
        const node=document.createElement(tag);node.dataset.i18nSkip='';node.className='source';node.textContent=text;parent.append(node);return node;
    }
    function label(parent,text,tag='h4') {const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;}
    function record(turn) {
        const article=document.createElement('article');article.className='record';
        literal(article,turn.id,'h3');
        label(article,'原発言');literal(article,turn.input);
        if(turn.status==='complete') {
            label(article,'その時の受け取り方');literal(article,turn.result.interpretation.summary);
            for(const memory of turn.result.memories) {
                label(article,'教わった記憶');label(article,'未確認','span').className='tag';literal(article,memory.text);
                label(article,'根拠の引用');literal(article,memory.quote,'blockquote');
            }
            label(article,'実際の返答');literal(article,turn.result.reply);
            const details=document.createElement('details');label(details,'会話に渡した記録／参照の申告','summary');
            label(details,'会話に渡した記録');literal(details,turn.supplied.join(', ') || '—');
            label(details,'LLMが参照したと申告した記録');literal(details,turn.result.references.join(', ') || '—');
            article.append(details);
        } else label(article,'返答は記録されていません。原発言は残っています。');
        return article;
    }
    function stars() {
        const parent=$('stars');parent.replaceChildren();$('star-record').replaceChildren();
        const turns=state.turns.filter(x=>x.status==='complete').slice(-24);
        if(!turns.length){label(parent,'まだ記録がありません。','p');return;}
        const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
        svg.setAttribute('viewBox',`0 0 900 ${turns.length*95+30}`);svg.setAttribute('aria-hidden','true');
        const positions=new Map(turns.map((x,i)=>[x.id,55+i*95]));
        const make=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);svg.append(n);return n;};
        for(const turn of turns) {
            const y=positions.get(turn.id);
            make('line',{x1:80,y1:y,x2:340,y2:y});
            for(const id of turn.result.references) if(positions.has(id))make('line',{x1:340,y1:positions.get(id),x2:340,y2:y,class:'reference'});
            for(const [x,caption]of [[80,turn.id],[340,turn.result.interpretation.summary]]) {
                make('circle',{cx:x,cy:y,r:7});const text=make('text',{x:x-35,y:y+25,'data-i18n-skip':''});text.textContent=caption.length>25?caption.slice(0,25)+'…':caption;
            }
            turn.result.memories.forEach((m,i)=>{const my=y-22+i*22;make('line',{x1:340,y1:y,x2:650,y2:my});make('circle',{cx:650,cy:my,r:5});const text=make('text',{x:665,y:my+4,'data-i18n-skip':''});text.textContent=m.text.length>20?m.text.slice(0,20)+'…':m.text;});
        }
        parent.append(svg);const buttons=document.createElement('div');buttons.className='star-buttons';
        for(const turn of turns) {const button=document.createElement('button');button.dataset.i18nSkip='';button.textContent=turn.id;button.onclick=()=>{$('star-record').replaceChildren(record(turn));window.GameI18n.localizeTree($('star-record'));};buttons.append(button);}
        parent.append(buttons);
    }
    function render() {
        $('setup').hidden=!!state;$('play').hidden=!state;
        if(!state)return;
        $('character-name').textContent=state.character.name;
        $('conversation').replaceChildren();$('diary').replaceChildren();
        for(const turn of state.turns) {
            literal($('conversation'),turn.input).className='utterance';
            if(turn.status==='complete')literal($('conversation'),turn.result.reply).className='utterance assistant';
            $('diary').append(record(turn));
        }
        if(!state.turns.length)label($('diary'),'まだ記録がありません。','p');
        stars();window.GameI18n.localizeTree(document.body);$('conversation').scrollTop=$('conversation').scrollHeight;
    }
    function setBusy(value) {busy=value;$('send').disabled=value||blocked;$('cancel').hidden=!value;$('locale').disabled=value;}
    const errors={
        login:'接続のログインが必要です。導入手順を確認してください。',
        missing:'接続の準備が必要です。導入手順を確認してください。',
        quota:'契約内の利用枠に達しました。追加クレジットは使わず、枠の回復を待ってください。',
        save:'記録を安全に保存できませんでした。終了して保存先を確認してください。',
        cancelled:'返答を中止しました。原発言は残っています。',
        output:'返答の形式や出所を確認できませんでした。記憶候補は採用していません。',
        input:'入力を確認してください。',
        failed:'返答を受け取れませんでした。接続状態を確認してください。'
    };
    $('setup').onsubmit=async event=>{
        event.preventDefault();if(blocked)return;
        const result=await api.create({name:$('name').value,self:$('self').value,player:$('player').value},$('locale').value);
        if(result.ok){state=result.state;status('');render();$('input').focus();}
        else status(errors[result.error]||errors.failed);
    };
    $('compose').onsubmit=async event=>{
        event.preventDefault();if(busy||blocked)return;
        const input=$('input').value;if(!input.trim())return;
        setBusy(true);status('返答を待っています…');
        try {
            const result=await api.submit(input,$('locale').value);
            if(result.state){state=result.state;if($('input').value===input)$('input').value='';render();}
            if(result.error==='save')blocked=true;
            status(result.ok?'':errors[result.error]||errors.failed);
        } catch(_){status(errors.failed);}finally{setBusy(false);if(!blocked)$('input').focus();}
    };
    $('cancel').onclick=()=>api.cancel();
    for(const tab of ['chat','diary','stars'])$('tab-'+tab).onclick=()=>{
        for(const name of ['chat','diary','stars']){$(name+'-view').hidden=name!==tab;$('tab-'+name).setAttribute('aria-pressed',String(name===tab));}
    };
    $('locale').value=window.GameI18n.language;
    $('locale').onchange=()=>{window.GameI18n.setLanguage($('locale').value);render();};
    window.addEventListener('pagehide',()=>api.cancel());
    void api.load().then(result=>{
        if(!result.ok){blocked=true;$('setup').hidden=true;status(errors.save);return;}
        state=result.state;if(state){$('locale').value=state.locale;window.GameI18n.setLanguage(state.locale);}render();
    }).catch(()=>{blocked=true;$('setup').hidden=true;status(errors.failed);});
})();
