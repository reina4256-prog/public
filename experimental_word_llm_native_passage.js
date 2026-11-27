(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NativePassage=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    // Cosmetic state only. Never persisted, sent to a model, or resumed on load.
    function create(){let current=null,serial=0;
        function cancel(){if(current){current.black(false);current.done(false);current=null;}}
        function begin(direction,game,target=null){cancel();let black,done;const blackReady=new Promise(r=>black=r),finished=new Promise(r=>done=r);
            const copy=structuredClone(game);if(copy.home){copy.home.inside=false;delete copy.home.exit;}
            current={id:++serial,direction,game:copy,target,elapsed:0,black,done,blackReady,finished};return current;}
        function observe(before,after){if(current||!before||!after)return null;const a=before.home,b=after.home;
            if(!a?.inside&&b?.inside)return begin('enter',after,'chip:player_home');
            if(a?.inside&&!b?.inside)return begin('exit',after,'chip:player_home');
            const e=after.walk?.encounter;if(e?.phase==='pending'&&e.id!==before.walk?.encounter?.id)return begin('enter',after,e.target);
            const p=after.practices?.at(-1),old=before.practices?.at(-1);
            if(p&&old?.id===p.id&&!p.suspended){if(old.phase==='outbound'&&p.phase==='survey')return begin('enter',after,p.target);
                if(old.phase==='survey'&&p.phase==='return')return begin('exit',after,p.target);
                if(old.phase==='return'&&p.phase==='report')return begin('enter',after,p.homeTarget);}return null;}
        function tick(seconds,paused=false){if(!current||paused)return;const s=current;s.elapsed=Math.min(.8,s.elapsed+Math.max(0,Math.min(.1,seconds)));
            if(s.elapsed>=.65||s.direction==='exit')s.black(true);
            if(s.elapsed>=.8){s.done(true);current=null;}}
        function view(){if(!current)return null;const s=current,t=s.elapsed;
            return {game:s.game,target:s.target,direction:s.direction,scale:s.direction==='enter'?Math.max(.001,1-t/.4):Math.min(1,.001+t/.55),
                alpha:s.direction==='enter'?Math.min(1,Math.max(0,(t-.4)/.25)):Math.max(0,1-t/.3),progress:Math.min(1,t/.4)};}
        return {begin,observe,tick,view,cancel,get active(){return !!current;},get current(){return current;}};
    }
    return {create};
});
