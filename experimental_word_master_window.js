'use strict';
// Shared by the original island and native island: the same two-character action window.
window.WordMasterWindow={
    create(t){
        const node=(tag,parent,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;};
        const dialog=node('dialog',document.body,undefined,'word-master');dialog.id='word-master-dialog';
        const left=node('div',dialog,undefined,'word-master-left'),thought=node('p',left,'','word-master-thought'),inner=node('p',left,'','word-inner-voice');inner.hidden=true;inner.dataset.i18nSkip='';
        const hero=node('canvas',left);hero.width=280;hero.height=200;hero.setAttribute('aria-hidden','true');
        const right=node('div',dialog,undefined,'word-master-right'),name=node('h2',right,'','visually-hidden');name.id='word-master-name';
        const text=node('p',right,'','word-master-speech');text.id='word-master-text';
        const portrait=node('canvas',right);portrait.width=portrait.height=400;portrait.setAttribute('aria-hidden','true');
        dialog.setAttribute('aria-labelledby',name.id);dialog.setAttribute('aria-describedby',text.id);
        const close=node('button',right,t('masterContinue'));close.type='button';close.id='word-master-close';
        const video=node('video',dialog,undefined,'word-master-video');video.playsInline=true;video.preload='auto';video.hidden=true;
        const skip=node('button',dialog,t('masterSkip'),'word-master-skip');skip.type='button';skip.id='word-master-skip';skip.hidden=true;
        return {dialog,left,thought,inner,hero,right,name,text,portrait,close,video,skip};
    },
    draw({heroCanvas,portraitCanvas,skin,config,hero,background,master,job,time=performance.now(),reduced=false,silhouette=false,type='explore'}){
        const frames=config.actions.idle,frame=reduced?0:Math.floor(time/250)%frames.length;
        heroCanvas.dataset.frame=String(frame);heroCanvas.dataset.skin=skin;
        const c=heroCanvas.getContext('2d');c.clearRect(0,0,280,200);
        if(background?.complete&&background.naturalWidth){const w=background.naturalWidth,h=background.naturalHeight;
            const crop=type==='fishing'?[0,0,w,h/2]:type==='cooking'?[0,0,w/2,h]:type==='farming'?[w/2,0,w/2,h/2]:type==='smithing'?[0,h/2,w/2,h/2]:[w/2,h/2,w/2,h/2];
            c.drawImage(background,...crop,0,0,280,200);}
        const f=frames[frame];if(hero?.complete&&hero.naturalWidth){const scale=Math.min(150/f.sw,160/f.sh);c.drawImage(hero,f.sx,f.sy,f.sw,f.sh,140-f.sw*scale/2,190-f.sh*scale,f.sw*scale,f.sh*scale);}
        const p=portraitCanvas.getContext('2d');p.clearRect(0,0,400,400);
        if(master?.complete&&master.naturalWidth){const h=360+(reduced?0:Math.sin(time/700)*2),w=job.sw/1536*h;p.save();if(silhouette)p.filter='brightness(0)';p.drawImage(master,job.sx,0,job.sw,1536,(400-w)/2,400-h,w,h);p.restore();}
    }
};
