'use strict';
window.NativeStars=(()=>{
    const t=s=>window.GameI18n.translate(s);
    function render(parent,details,state,record){
        parent.replaceChildren();details.replaceChildren();const nodes=new Map(),edges=[],add=(id,label,select,kind='word')=>{if(!nodes.has(id))nodes.set(id,{id,label,select,kind});};
        for(const turn of state.turns.filter(t=>t.status==='complete').slice(-24)){
            const terms=turn.result.terms||[];
            for(const term of terms)add('word:'+term.word,term.word,()=>details.replaceChildren(record(turn)));
            // Only a quoted teaching evidence creates these edges, never all-text cooccurrence.
            for(const [index,memory]of turn.result.memories.entries()){
                const related=terms.filter(term=>memory.quote.includes(term.word));if(!related.length)continue;
                const id=turn.id+':'+index;add(id,'',()=>details.replaceChildren(record(turn)),'source');
                for(const term of related)edges.push([id,'word:'+term.word,'teaching']);
            }
        }
        const g=state.game;
        const show=r=>{const p=document.createElement('p');p.dataset.i18nSkip='';p.textContent=r.id+' · '+window.NativeBook.description(r);details.replaceChildren(p);};
        for(const r of g?.receipts||[]){
            if(g.perception===2){if(r.target.startsWith('chip:'))add('actual:'+r.target,t(r.label),()=>show(r),'actual');continue;}
            const key={'berry:1':'木の実',shade:'木陰',path:'道'}[r.target];if(!key)continue;
            add('actual:'+r.target,t(key),()=>show(r),'actual');
            if(r.kind==='eat'){add('actual:sweet',t('甘い'),()=>show(r),'actual');edges.push(['actual:berry:1','actual:sweet','experience']);}
        }
        if(!nodes.size){const p=document.createElement('p');p.textContent=t('まだ記録がありません。');parent.append(p);return;}
        const list=[...nodes.values()],ns='http://www.w3.org/2000/svg',height=Math.max(410,Math.ceil(list.length/7)*140);
        const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 900 ${height}`);svg.setAttribute('role','group');svg.setAttribute('aria-label',t('星座'));
        const positions=new Map(list.map((n,i)=>[n.id,{x:80+(i%7)*122+(Math.floor(i/7)%2)*16,y:70+Math.floor(i/7)*140+(i%2)*32}]));
        const make=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const [key,val]of Object.entries(attrs))n.setAttribute(key,val);return n;};
        for(const [a,b,kind]of edges){const p=positions.get(a),q=positions.get(b);svg.append(make('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:kind}));}
        for(const node of list){
            const p=positions.get(node.id),group=make('g',{class:'word-node '+node.kind,role:'button',tabindex:0,'aria-label':node.label||t('原発言'),'data-i18n-skip':''});
            group.append(make('circle',{cx:p.x,cy:p.y,r:node.kind==='source'?4:8}));
            const text=make('text',{x:p.x,y:p.y+27,'text-anchor':'middle','data-i18n-skip':''});
            // One short word per label. Long words wrap within their own star.
            Array.from(node.label.match(/.{1,10}/gu)||[]).forEach((line,i)=>{const span=make('tspan',{x:p.x,dy:i?'1.2em':0});span.textContent=line;text.append(span);});group.append(text);
            group.onclick=node.select;group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();node.select();}};svg.append(group);
        }
        parent.append(svg);window.GameI18n.localizeTree(details);
    }
    return {render};
})();
