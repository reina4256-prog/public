'use strict';
window.NativeBook=(()=>{
    const el=(tag,parent,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;};
    const t=(s,...args)=>window.GameI18n.translate(s).replace(/\{\{(\d+)\}\}/g,(_,n)=>String(args[Number(n)]??''));
    const names={'berry:1':'木の実',shade:'木陰',path:'道'};
    function description(r){
        if(r.target.startsWith('chip:'))return r.kind==='walk'?t('歩いて{{0}}のそばに着いた。',t(r.label)):t('{{0}}が見えた。',t(r.label));
        const name=t(names[r.target]||'人影');
        if(r.kind==='eat')return t('木の実を食べた。甘い味がした。');
        if(r.kind==='rest')return t('木陰で休んだ。');
        if(r.kind==='walk')return t('歩いて{{0}}に着いた。',name);
        return t('{{0}}が見えた。',name);
    }
    function render(parent,state){
        parent.replaceChildren();const g=state.game;
        if(!g){el('p',parent,t('まだ記録がありません。'));return;}
        const byDay=new Map(),put=(at,item)=>{const day=Math.floor(at/1500)+1;if(!byDay.has(day))byDay.set(day,[]);byDay.get(day).push(item);};
        const active=g.perception===2?g.receipts.filter(r=>r.target.startsWith('chip:')&&['observe','walk'].includes(r.kind)):g.receipts;
        for(const r of active)put(r.at,{at:r.at,text:description(r),receipt:r});
        for(const turn of state.turns.filter(t=>t.status==='complete'&&t.world&&['teaching','correction'].includes(t.result.interpretation.kind)))put(turn.gameAt||0,{at:turn.gameAt||0,text:turn.result.interpretation.summary,turn});
        const nav=el('div',parent,undefined,'book-nav'),previous=el('button',nav,t('前へ')),counter=el('span',nav),next=el('button',nav,t('次へ'));
        previous.type=next.type='button';const book=el('div',parent,undefined,'native-book'),pages=[];
        const vertical=['ja','zh-CN'].includes(window.GameI18n.language);
        for(const [day,items]of byDay){
            items.sort((a,b)=>a.at-b.at);const original=[...new Set(items.map(i=>i.text))].join('\n\n');
            const units=Array.from(new Intl.Segmenter(window.GameI18n.language,{granularity:'grapheme'}).segment(original),x=>x.segment);
            const subject=[...items].reverse().find(i=>i.receipt&&(names[i.receipt.target]||i.receipt.target.startsWith('chip:')))?.receipt;
            const sentence=new Intl.Segmenter(window.GameI18n.language,{granularity:'sentence'});
            const set=(body,value)=>{body.replaceChildren();if(vertical)for(const part of sentence.segment(value))el('span',body,part.segment,'book-sentence');else body.textContent=value;};
            let offset=0,first=true;
            do{
                const page=el('article',book,undefined,'book-page'+(first?'':' continued'));page.dataset.i18nSkip='';
                el('h3',page,t(first?'島の{{0}}日目':'島の{{0}}日目・続き',day),'book-date');
                if(first&&subject){const canvas=el('canvas',page,undefined,'book-drawing');canvas.width=840;canvas.height=410;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',t('実際に見たものの絵'));
                    if(subject.target.startsWith('chip:'))drawChip(canvas,g,subject.target);else if(subject.target==='berry:1')window.NativeDiaryDraw(canvas,'berry');else drawPlace(canvas,subject.target);
                }
                const body=el('div',page,undefined,'book-body'+(vertical?' vertical':''));
                let low=0,high=units.length-offset;while(low<high){const mid=Math.ceil((low+high)/2);set(body,units.slice(offset,offset+mid).join(''));if(body.scrollWidth<=body.clientWidth+1&&body.scrollHeight<=body.clientHeight+1)low=mid;else high=mid-1;}
                const count=Math.max(1,low);set(body,units.slice(offset,offset+count).join(''));offset+=count;pages.push(page);first=false;
            }while(offset<units.length);
        }
        let selected=0;const show=()=>{pages.forEach((p,i)=>p.hidden=i!==selected);counter.textContent=t('{{0}} / {{1}} ページ',selected+1,pages.length);previous.disabled=selected<=0;next.disabled=selected>=pages.length-1;};
        previous.onclick=()=>{selected--;show();};next.onclick=()=>{selected++;show();};show();
        const evidence=el('details',parent);el('summary',evidence,t('記録の根拠'));const records=el('div',evidence);
        for(const r of active){const p=el('p',records,r.id+' · '+description(r));p.dataset.i18nSkip='';}
        const previousRecords=g.receipts.filter(r=>!r.target.startsWith('chip:')&&!active.includes(r));
        if(previousRecords.length){const old=el('details',parent);el('summary',old,t('過去の試作の記録'));for(const r of previousRecords)el('p',old,r.id+' · '+description(r));}
    }
    function drawChip(canvas,g,target){
        const a=g.island.assets[target.slice(5)],img=window.images?.[a?.img];if(!a||!img?.complete||!img.naturalWidth)return;
        const c=canvas.getContext('2d'),ratio=Math.min(650/a.sw,340/a.sh);
        c.save();c.filter='grayscale(1) contrast(1.15)';c.globalAlpha=.8;
        c.drawImage(img,a.sx,a.sy,a.sw,a.sh,(840-a.sw*ratio)/2,(410-a.sh*ratio)/2,a.sw*ratio,a.sh*ratio);c.restore();
    }
    function drawPlace(canvas,target){
        const c=canvas.getContext('2d');c.scale(2,2);c.lineWidth=2.4;c.lineCap='round';
        const line=(points,color)=>{c.strokeStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x+Math.sin(i*3)*1.2,y):c.moveTo(x,y));c.stroke();};
        line([[98,180],[165,177],[236,181],[325,176]],'#aaa680');
        if(target==='shade'){
            line([[215,170],[208,125],[214,80],[228,42]],'#aa8052');
            for(let i=0;i<6;i++){const a=i*Math.PI/3;line([[227,44],[227+Math.cos(a)*32,44+Math.sin(a)*19],[227+Math.cos(a)*65,44+Math.sin(a)*30]],'#6c8851');}
            line([[172,179],[197,170],[240,172],[278,181]],'#758b75');
        }else{line([[145,177],[181,141],[211,117],[237,83]],'#aa8052');line([[258,177],[230,144],[239,117],[265,88]],'#aa8052');}
    }
    return {render,description};
})();
